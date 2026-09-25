// Ground-truth benchmark of the analysis layer (bench/README.md): decompiles bench/bin/*.so as the CLI project
// output does, compares security/analysis.json with bench/expected/<prog>.json and prints recall / precision.
// usage: node bench/run.ts [--verbose] [filter]
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Worker, isMainThread, parentPort } from 'node:worker_threads'
import { availableParallelism } from 'node:os'

const ROOT = dirname(fileURLToPath(import.meta.url))


interface Job { id: number; prog: string; variant?: string; so: string; idl?: any }
interface ExpIx { tag?: number; accounts: Record<string, string[]>; relations?: [string, string][]; cpis?: string[]; writes?: string[]; pdas?: string[] }
interface ExpVariant { ix: string; rules: string[]; idl?: Record<string, string> }
interface Expected { kind: 'anchor' | 'native'; idl?: string; instructions: Record<string, ExpIx>; variants?: Record<string, ExpVariant> }

const CATS = ['checks', 'relations', 'cpis', 'writes', 'pdas', 'rules'] as const
type Cat = typeof CATS[number]
// check kinds scored (others reported by the analysis, e.g. initialized / key / rent_exempt, are not)
const KINDS = new Set(['signer', 'writable', 'owner', 'discriminator', 'pda', 'has_one', 'address', 'token_mint', 'token_owner', 'close'])
const WRITE_OPS = ['ACCOUNT_DATA_WRITE', 'LAMPORT_WRITE', 'AUTHORITY_WRITE']

const tally: Record<Cat, { tp: number; fp: number; fn: number }> = Object.fromEntries(CATS.map(c => [c, { tp: 0, fp: 0, fn: 0 }])) as any
const misses: string[] = [], falses: string[] = [], variantLines: string[] = []

async function main() {
	const verbose = process.argv.includes('--verbose') || process.argv.includes('-v')
	const filter = process.argv.slice(2).find(a => !a.startsWith('-'))
	const t0 = Date.now()
	const progs = readdirSync(join(ROOT, 'expected')).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)).filter(p => !filter || p.includes(filter)).sort()
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
	const out = await runAll(jobs)
	for (const [prog, exp] of exps) {
		const base = out.get(jobs.find(j => j.prog === prog && !j.variant)!.id)!
		const baseFindings = scoreFacts(prog, exp, base)
		for (const j of jobs) if (j.prog === prog && j.variant) scoreVariant(prog, j.variant, exp, out.get(j.id)!, baseFindings)
	}
	if (verbose) {
		console.log('variants:'); for (const l of variantLines) console.log('  ' + l)
		console.log(`misses (${misses.length}):`); for (const l of misses) console.log('  ' + l)
		console.log(`false reports (${falses.length}):`); for (const l of falses) console.log('  ' + l)
		console.log()
	}
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
	const queue = [...jobs].sort((a, b) => Number(b.so.includes('/a_')) - Number(a.so.includes('/a_'))) // big ones first
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
	for (const f of findings) { tally.rules.fp++; falses.push(`${prog} (base) rules: ${f}`) }
	return findings
}

function scoreVariant(prog: string, v: string, exp: Expected, a: any, baseFindings: Set<string>) {
	const ve = exp.variants![v]
	const ix = findIx(a, ve.ix, exp.instructions[ve.ix])
	const got = new Set<string>()
	for (const [name, e] of Object.entries(exp.instructions)) {
		const x = findIx(a, name, e)
		if (x) for (const f of a.findings) if (f.instruction === x.name) got.add(`${f.rule}@${name}`)
	}
	const hit = ve.rules.find(r => got.has(`${r}@${ve.ix}`))
	if (hit) tally.rules.tp++
	else { tally.rules.fn++; misses.push(`${prog}@${v} rules: ${ve.rules.join(' | ')} @${ve.ix}${ix ? '' : ' (instruction not found)'}`) }
	const extra = [...got].filter(f => !baseFindings.has(f) && !(ve.rules.some(r => f === `${r}@${ve.ix}`)))
	for (const f of extra) { tally.rules.fp++; falses.push(`${prog}@${v} rules: ${f}`) }
	variantLines.push(`${hit ? 'caught' : 'MISSED'} ${prog}@${v}: ${ve.rules.join(' | ')} @${ve.ix}${extra.length ? `  (+${extra.join(', ')})` : ''}`)
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
