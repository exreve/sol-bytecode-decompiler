// Ground-truth benchmark of the analysis layer (bench/README.md): decompiles bench/bin/*.so as the CLI project
// output does, compares security/analysis.json with bench/expected/<prog>.json and prints recall / precision.
// Then the eval pairs (eval/analyze.ts): skipped with a filter, filter "pairs" (or the eval dir name) runs only them.
// usage: node bench/run.ts [--verbose] [filter]
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Worker, isMainThread, parentPort } from 'node:worker_threads'
import { availableParallelism } from 'node:os'
import { evalJobs, scoreEval } from '../eval/analyze.ts'

const ROOT = dirname(fileURLToPath(import.meta.url))


interface Job { id: number; prog: string; variant?: string; so: string; idl?: any; evalKey?: string }
interface ExpIx { tag?: number; accounts: Record<string, string[]>; relations?: [string, string][]; cpis?: string[]; writes?: string[]; pdas?: string[] }
interface ExpVariant { ix: string; rules: string[]; idl?: Record<string, string> }
interface FundMover { ix: string; authority: string; from: string; index?: number }
interface Expected { kind: 'anchor' | 'native'; idl?: string; generated?: boolean; set?: 'realistic' | 'oss'; instructions: Record<string, ExpIx>; variants?: Record<string, ExpVariant>; fund_movers?: FundMover[] }

const CATS = ['checks', 'relations', 'cpis', 'writes', 'pdas', 'rules'] as const
type Cat = typeof CATS[number]
// check kinds scored (others reported by the analysis, e.g. initialized / key / rent_exempt, are not)
const KINDS = new Set(['signer', 'writable', 'owner', 'discriminator', 'pda', 'has_one', 'address', 'token_mint', 'token_owner', 'close'])
const WRITE_OPS = ['ACCOUNT_DATA_WRITE', 'LAMPORT_WRITE', 'AUTHORITY_WRITE']

const tally: Record<Cat, { tp: number; fp: number; fn: number }> = Object.fromEntries(CATS.map(c => [c, { tp: 0, fp: 0, fn: 0 }])) as any
const misses: string[] = [], falses: string[] = [], variantLines: string[] = []
// generated programs (bench/gen, expected.generated): rules only, tallied apart from the six categories
const gen = new Map<string, { rule: string; n: number; caught: number; missed: string[] }>()
const genFalse: string[] = [], genInfo: string[] = [], genExtra: string[] = []
// labelled sets (expected.set, bench/real): 'realistic' clean programs (r_*), 'oss' open-source programs (o_*) whose
// variants each remove one validation; rules only, tallied apart from the six categories and the generated programs
interface SetTally { progs: number; falses: string[]; info: string[]; n: number; caught: number; lines: string[]; extra: string[] }
const sets = new Map<string, SetTally>()
const setOf = (s: string) => sets.get(s) ?? sets.set(s, { progs: 0, falses: [], info: [], n: 0, caught: 0, lines: [], extra: [] }).get(s)!
// informational expectations (expected.fund_movers): an authority-only instruction that can move user funds, expected
// listed in analysis.json fund_movers ({ instruction, authority, ... }), not as a finding
const movers: { where: string; listed: boolean }[] = []

async function main() {
	const verbose = process.argv.includes('--verbose') || process.argv.includes('-v')
	const filter = process.argv.slice(2).find(a => !a.startsWith('-'))
	const t0 = Date.now()
	const progs = readdirSync(join(ROOT, 'expected')).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)).filter(p => !filter || p.includes(filter)).sort()
	const withEval = !filter || filter === 'eval' || filter === 'pairs'
	const exps = new Map(progs.map(p => [p, JSON.parse(readFileSync(join(ROOT, 'expected', p + '.json'), 'utf8')) as Expected]))
	const jobs: Job[] = []
	for (const [prog, exp] of exps) {
		const idl = exp.idl ? JSON.parse(readFileSync(join(ROOT, 'idl', exp.idl), 'utf8')) : undefined
		jobs.push({ id: jobs.length, prog, so: join(ROOT, 'bin', prog + '.so'), idl })
		for (const [v, ve] of Object.entries(exp.variants ?? {})) {
			const so = join(ROOT, 'bin', `${prog}@${v}.so`)
			if (!existsSync(so)) { console.error(`missing binary ${prog}@${v}.so`); continue }
			jobs.push({ id: jobs.length, prog, variant: v, so, idl: idl && ve.idl ? patchIdl(idl, ve.idl) : idl })
		}
		for (const f of readdirSync(join(ROOT, 'bin'))) if (f.startsWith(prog + '@') && !exp.variants?.[f.slice(prog.length + 1, -3)]) console.error(`no expectation for ${f}`)
	}
	if (withEval) for (const e of evalJobs()) jobs.push({ id: jobs.length, prog: '', so: e.so, idl: e.idl, evalKey: e.key })
	const out = await runAll(jobs)
	for (const [prog, exp] of exps) {
		const base = out.get(jobs.find(j => j.prog === prog && !j.variant && !j.evalKey)!.id)!
		const baseFindings = scoreFacts(prog, exp, base)
		for (const m of exp.fund_movers ?? []) movers.push({ where: `${prog} ${m.ix} (${m.authority} moves ${m.from})`, listed: fundMoverListed(base, m, exp) })
		for (const j of jobs) if (j.prog === prog && j.variant) scoreVariant(prog, j.variant, exp, out.get(j.id)!, baseFindings)
	}
	if (verbose) {
		console.log('variants:'); for (const l of variantLines) console.log('  ' + l)
		console.log(`misses (${misses.length}):`); for (const l of misses) console.log('  ' + l)
		console.log(`false reports (${falses.length}):`); for (const l of falses) console.log('  ' + l)
		console.log()
	}
	if (withEval) {
		for (const l of scoreEval(new Map(jobs.filter(j => j.evalKey).map(j => [j.evalKey!, out.get(j.id)])), verbose)) console.log(l)
		console.log()
	}
	if (gen.size) printGenerated(verbose)
	if (sets.size) printSets(verbose)
	if (!progs.some(p => !exps.get(p)!.generated && !exps.get(p)!.set)) return
	const pct = (n: number, d: number) => d ? (100 * n / d).toFixed(1).padStart(6) : '     -'
	console.log('category      TP    FP    FN  recall  precision     F1')
	const f1s: number[] = []
	for (const c of CATS) {
		const { tp, fp, fn } = tally[c]
		const r = tp / (tp + fn || 1), p = tp / (tp + fp || 1), f1 = r + p ? 2 * r * p / (r + p) : 0
		f1s.push(f1)
		console.log(`${c.padEnd(10)} ${String(tp).padStart(5)} ${String(fp).padStart(5)} ${String(fn).padStart(5)}  ${pct(tp, tp + fn)}     ${pct(tp, tp + fp)} ${(100 * f1).toFixed(1).padStart(6)}`)
	}
	const facts = CATS.slice(0, 5).reduce((a, c) => ({ tp: a.tp + tally[c].tp, fp: a.fp + tally[c].fp, fn: a.fn + tally[c].fn }), { tp: 0, fp: 0, fn: 0 })
	console.log(`score ${(100 * f1s.reduce((a, b) => a + b, 0) / f1s.length).toFixed(1)} (mean F1 of the 6 categories)  facts R ${pct(facts.tp, facts.tp + facts.fn).trim()} P ${pct(facts.tp, facts.tp + facts.fp).trim()}  rules ${tally.rules.tp}/${tally.rules.tp + tally.rules.fn} variants caught, ${tally.rules.fp} false findings  [${jobs.length} binaries, ${((Date.now() - t0) / 1000).toFixed(1)}s]`)
}

function patchIdl(idl: any, patch: Record<string, string>): any {
	const out = structuredClone(idl)
	for (const [ix, accs] of Object.entries(patch)) {
		const i = out.instructions.find((x: any) => x.name === ix)
		i.accounts = accs.split(/\s+/).filter(Boolean).map(a => { const [name, f = ''] = a.split(':'); return { name, ...(f.includes('w') ? { writable: true } : {}), ...(f.includes('s') ? { signer: true } : {}) } })
	}
	return out
}

async function runAll(jobs: Job[]): Promise<Map<number, any>> {
	const out = new Map<number, any>()
	const size = (j: Job) => (j.evalKey ? 2 : 0) + Number(/\/(g_)?a/.test(j.so))
	const queue = [...jobs].sort((a, b) => size(b) - size(a)) // big ones first
	const n = Math.min(queue.length, Math.max(1, availableParallelism() - 1))
	await Promise.all(Array.from({ length: n }, () => new Promise<void>((resolve, reject) => {
		const w = new Worker(fileURLToPath(import.meta.url), { resourceLimits: { stackSizeMb: 256, maxOldGenerationSizeMb: 8192 } })
		const next = () => { const j = queue.shift(); if (j) w.postMessage(j); else { w.terminate(); resolve() } }
		w.on('message', (m: { id: number; json?: string; error?: string }) => {
			if (m.error) { console.error(`decompile failed: ${jobs[m.id].so}\n${m.error}`); out.set(m.id, { instructions: [], findings: [], pdas: [], state_writes: [] }) }
			else out.set(m.id, JSON.parse(m.json!))
			next()
		})
		w.on('error', reject)
		next()
	})))
	return out
}

// ---- normalization ----

const opt = (s: string) => s.endsWith('?')
const bare = (s: string) => s.replace(/\?$/, '')

/** predicted instruction for an expected one: Anchor by name, native by dispatch tag */
function findIx(a: any, name: string, e: ExpIx): any {
	return a.instructions.find((x: any) => e.tag !== undefined ? x.kind === 'native' && new RegExp(`^tag ${e.tag}\\b`).test(x.dispatch ?? '') : x.name === name)
}

/** account part of a reference (`vault.owner?`, `account[1].data[0..32]`, `h.lamports`) as an expected account name;
 * `alias`: names the analysis gave to account indices (e.g. a well-known layout guessed for a native program) */
function acctOf(ref: string | undefined, names: string[], alias?: Map<string, number>): string | undefined {
	const m = ref?.trim().match(/^(account\[(\d+)\]|[A-Za-z_]\w*)\??/)
	if (!m) return undefined
	if (m[2] !== undefined) return names[Number(m[2])]
	if (names.includes(m[1])) return m[1]
	const i = alias?.get(m[1])
	return i === undefined ? undefined : names[i]
}

/** `acct.field` / `acct.data[a..b]` / `acct.lamports` with the account resolved; data ranges keyed by their start */
function writeKey(ref: string, names: string[], alias?: Map<string, number>): string | undefined {
	const a = acctOf(ref, names, alias)
	if (!a) return undefined
	const rest = ref.trim().replace(/^(account\[\d+\]|[A-Za-z_]\w*)\??\.?/, '')
	const d = rest.match(/^data\[(\d+)(\.\.\d+)?\]/)
	return `${a}.${d ? `data@${d[1]}` : rest.replace(/\?/g, '')}`
}

/** `["vault", *k, u8 l]` -> `vault/*` (the trailing bump dropped); undefined when nothing is known */
function seedsKey(s: string | undefined): string | undefined {
	if (!s || !s.startsWith('[')) return undefined
	const parts: string[] = []
	let depth = 0, cur = '', q = false
	for (const ch of s.slice(1, -1)) {
		if (ch === '"') q = !q
		if (!q && '([{'.includes(ch)) depth++
		if (!q && ')]}'.includes(ch)) depth--
		if (!q && depth === 0 && ch === ',') { parts.push(cur.trim()); cur = '' } else cur += ch
	}
	if (cur.trim()) parts.push(cur.trim())
	if (parts.length && /^u8 |\(1 bytes\)$|^&?\[?bump/.test(parts[parts.length - 1])) parts.pop()
	if (!parts.length) return undefined
	return parts.map(p => p.match(/^"(.*)"$/)?.[1] ?? '*').join('/')
}

// ---- scoring ----

function count(cat: Cat, where: string, exp: string[], pred: Set<string>, match: (e: string, p: string) => boolean = (e, p) => e === p) {
	const used = new Set<string>()
	for (const e of exp) {
		const p = [...pred].find(p => !used.has(p) && match(bare(e), p))
		if (p !== undefined) { used.add(p); if (!opt(e)) tally[cat].tp++ }
		else if (!opt(e)) { tally[cat].fn++; misses.push(`${where} ${cat}: ${e}`) }
	}
	for (const p of pred) if (!used.has(p)) { tally[cat].fp++; falses.push(`${where} ${cat}: ${p}`) }
}

function scoreFacts(prog: string, exp: Expected, a: any): Set<string> {
	const findings = new Set<string>()
	for (const [name, e] of Object.entries(exp.instructions)) {
		const where = `${prog} ${name}`
		const names = Object.keys(e.accounts)
		const ix = findIx(a, name, e)
		if (!ix) misses.push(`${where}: instruction not found`)
		const checks = new Set<string>(), rels = new Set<string>(), cpis = new Set<string>(), writes = new Set<string>(), pdas = new Set<string>()
		if (ix) {
			const alias = new Map<string, number>(ix.accounts.filter((x: any) => x.index !== undefined && !names.includes(x.name)).map((x: any) => [x.name, x.index]))
			const of = (r?: string) => acctOf(r, names, alias)
			for (const acc of ix.accounts) {
				const n = of(acc.name)
				if (n) for (const [k, ev] of Object.entries(acc.constraints) as [string, any][]) if (KINDS.has(k) && (ev.status === 'found' || ev.status === 'partial')) checks.add(`${n}.${k}`)
			}
			for (const c of ix.checks) { const n = of(c.account); if (n) for (const k of c.kinds) if (KINDS.has(k)) checks.add(`${n}.${k}`) }
			for (const r of ix.relations ?? []) {
				if (r.kind === 'address') continue
				const x = of(r.a), y = of(r.b)
				if (x && y && x !== y) rels.add([x, y].sort().join('~'))
			}
			for (const o of ix.operations) {
				if (o.cpi?.instruction) cpis.add(`${o.cpi.program}.${o.cpi.instruction}`)
				if (o.target && o.kinds.some((k: string) => WRITE_OPS.includes(k))) { const w = writeKey(o.target, names, alias); if (w) writes.add(w) }
				for (const s of [o.pda?.seeds, o.cpi?.seeds]) { const k = seedsKey(s); if (k) pdas.add(k) }
			}
			for (const p of a.pdas) if (p.derived_in.includes(ix.name) || p.signs_in.includes(ix.name)) { const k = seedsKey(p.seeds); if (k) pdas.add(k) }
			for (const sw of a.state_writes) if (sw.writes.some((w: any) => w.ix === ix.name)) { const w = writeKey(sw.target, names, alias); if (w) writes.add(w) }
			for (const f of a.findings) if (f.instruction === ix.name) findings.add(`${f.rule}@${name}`)
		}
		if (exp.generated || exp.set) {
			if (ix) for (const k of consistencyAt(a, ix.name)) (exp.set ? setOf(exp.set).info : genInfo).push(`${prog} (base) ${name}: ${k}`)
			if (!ix && exp.set) setOf(exp.set).info.push(`${where}: instruction not found`)
			continue
		}
		const expChecks = Object.entries(e.accounts).flatMap(([n, ks]) => ks.map(k => `${n}.${k}`))
		count('checks', where, expChecks, checks)
		count('relations', where, (e.relations ?? []).map(r => [...r].sort().join('~')), rels)
		count('cpis', where, e.cpis ?? [], cpis, (x, p) => {
			const [xp, xi] = x.split('.'), [pp, pi] = p.split('.')
			return xi === pi && (xp === pp || !/^[A-Z_0-9]+$/.test(pp)) // an account-supplied program id matches by instruction
		})
		count('writes', where, (e.writes ?? []).map(w => (opt(w) ? writeKey(bare(w), names) + '?' : writeKey(w, names)!)), writes)
		count('pdas', where, e.pdas ?? [], pdas)
	}
	if (exp.set) setOf(exp.set).progs++
	for (const f of findings) {
		if (exp.set) setOf(exp.set).falses.push(`${prog} (base): ${f}`)
		else if (exp.generated) genFalse.push(`${prog} (base): ${f}`)
		else { tally.rules.fp++; falses.push(`${prog} (base) rules: ${f}`) }
	}
	return findings
}

function scoreVariant(prog: string, v: string, exp: Expected, a: any, baseFindings: Set<string>) {
	const ve = exp.variants![v]
	const ix = findIx(a, ve.ix, exp.instructions[ve.ix])
	const got = new Set<string>()
	for (const [name, e] of Object.entries(exp.instructions)) {
		const x = findIx(a, name, e)
		if (x) for (const f of a.findings) if (f.instruction === x.name) got.add(`${f.rule}@${name}`)
		if (x && (exp.generated || exp.set) && consistencyAt(a, x.name).length) got.add(`~consistency@${name}`)
	}
	const hit = ve.rules.find(r => got.has(`${r}@${ve.ix}`))
	if (exp.set) {
		// caught: an accepted rule at the instruction that the clean build does not report there already
		const hitNew = ve.rules.find(r => got.has(`${r}@${ve.ix}`) && !baseFindings.has(`${r}@${ve.ix}`))
		const t = setOf(exp.set), extra = [...got].filter(f => !baseFindings.has(f) && !f.startsWith('~') && !ve.rules.some(r => f === `${r}@${ve.ix}`))
		t.n++
		if (hitNew) t.caught++
		t.extra.push(...extra.map(f => `${prog}@${v}: ${f}`))
		t.lines.push(`${hitNew ? 'caught' : 'MISSED'} ${prog}@${v}: ${ve.rules.join(' | ')} @${ve.ix}${ix ? '' : ' (instruction not found)'}${hitNew ? '' : `  (reported there: ${[...got].filter(f => f.endsWith('@' + ve.ix)).map(f => baseFindings.has(f) ? f + ' (also on the clean build)' : f).join(', ') || 'nothing'})`}`)
		return
	}
	if (exp.generated) {
		const g = gen.get(v) ?? gen.set(v, { rule: ve.rules[0], n: 0, caught: 0, missed: [] }).get(v)!
		g.n++
		if (hit) g.caught++
		else g.missed.push(`${prog}@${v}${ix ? '' : ' (instruction not found)'}: ${[...got].filter(f => f.endsWith('@' + ve.ix)).join(', ') || 'nothing'} @${ve.ix}`)
		for (const f of got) if (!baseFindings.has(f) && !f.startsWith('~') && !ve.rules.some(r => f === `${r}@${ve.ix}`)) genExtra.push(`${prog}@${v}: ${f}`)
		return
	}
	if (hit) tally.rules.tp++
	else { tally.rules.fn++; misses.push(`${prog}@${v} rules: ${ve.rules.join(' | ')} @${ve.ix}${ix ? '' : ' (instruction not found)'}`) }
	const extra = [...got].filter(f => !baseFindings.has(f) && !(ve.rules.some(r => f === `${r}@${ve.ix}`)))
	for (const f of extra) { tally.rules.fp++; falses.push(`${prog}@${v} rules: ${f}`) }
	variantLines.push(`${hit ? 'caught' : 'MISSED'} ${prog}@${v}: ${ve.rules.join(' | ')} @${ve.ix}${extra.length ? `  (+${extra.join(', ')})` : ''}`)
}

/** the expected authority-only fund move is listed in analysis.json fund_movers (instruction + authority account) */
function fundMoverListed(a: any, m: FundMover, exp: Expected): boolean {
	const ix = findIx(a, m.ix, exp.instructions[m.ix])
	return !!ix && (a.fund_movers ?? []).some((x: any) => x.instruction === ix.name && [m.authority, `account[${m.index}]`].includes(String(x.authority ?? '').split(/[.\s]/)[0]))
}

/** validation_consistency inconsistencies at an instruction (`account lacks validation`) */
function consistencyAt(a: any, ix: string): string[] {
	return (a.validation_consistency ?? []).flatMap((r: any) => (r.inconsistencies ?? []).filter((x: any) => x.instruction === ix).map((x: any) => `~consistency ${x.account} lacks ${x.validation}`))
}

function printGenerated(verbose: boolean) {
	console.log('generated variants (bench/gen): property   accepted rule (first)              caught')
	let n = 0, c = 0
	for (const [v, g] of [...gen].sort((a, b) => a[1].rule.localeCompare(b[1].rule) || a[0].localeCompare(b[0]))) {
		n += g.n; c += g.caught
		console.log(`  ${v.padEnd(22)} ${g.rule.padEnd(34)} ${`${g.caught}/${g.n}`.padStart(6)}`)
	}
	if (verbose) {
		for (const g of gen.values()) for (const m of g.missed) console.log(`  MISSED ${m}`)
		for (const f of genFalse) console.log(`  FALSE ${f}`)
		for (const f of genInfo) console.log(`  info on a clean base: ${f}`)
		for (const f of genExtra) console.log(`  extra ${f}`)
	}
	if (movers.length) {
		console.log(`  fund movers listed (informational, analysis.json fund_movers): ${movers.filter(m => m.listed).length}/${movers.length}`)
		if (verbose) for (const m of movers) console.log(`  ${m.listed ? 'listed' : 'NOT LISTED'} ${m.where}`)
	}
	console.log(`generated (template set): ${c}/${n} variants caught (${(100 * c / (n || 1)).toFixed(1)}%), ${genFalse.length} false findings on the clean bases (+${genInfo.length} inconsistencies), ${genExtra.length} unexpected findings in variants`)
	console.log()
}

function printSets(verbose: boolean) {
	for (const [name, t] of [...sets].sort()) {
		if (verbose) {
			for (const l of t.lines) console.log(`  ${l}`)
			for (const f of t.falses) console.log(`  FALSE ${f}`)
			for (const f of t.info) console.log(`  info on a clean base: ${f}`)
			for (const f of t.extra) console.log(`  extra ${f}`)
		}
		const label = name === 'realistic' ? 'realistic clean programs (bench/real*, r_*)' : 'open-source programs (bench/real o_*)'
		console.log(`${label}: ${t.progs} clean programs, ${t.falses.length} false findings (+${t.info.length} inconsistencies)${t.n ? `; ${t.caught}/${t.n} variants caught (recall ${(100 * t.caught / t.n).toFixed(1)}%), ${t.extra.length} unexpected findings in variants` : ''}`)
	}
	console.log()
}

// worker: one decompilation per message
if (!isMainThread) {
	const { decompile } = await import('../src/decompile.ts')
	const { renderProject } = await import('../src/layout.ts')
	const { parseIdl } = await import('../src/idl.ts')
	parentPort!.on('message', (job: Job) => {
		try {
			const res = decompile(readFileSync(job.so), { idl: job.idl ? parseIdl(job.idl) : undefined })
			parentPort!.postMessage({ id: job.id, json: renderProject(res).get('security/analysis.json') })
		} catch (e) { parentPort!.postMessage({ id: job.id, error: String((e as Error).stack ?? e) }) }
	})
} else await main()
