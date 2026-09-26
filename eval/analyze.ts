// Deterministic eval of the analysis on the real-world vuln / fixed pairs (eval/cases.json, source "real"): does a finding
// or an informational signal point at the ground-truth instruction / account (ground_truth.target) in @vuln, and is it
// gone in @fixed. Run through `node bench/run.ts` (its worker pool decompiles eval/bin/*.so; filter "pairs" runs only these).
// Signals: findings (confidence info = informational), validation_consistency inconsistencies, stored-key gaps
// (instructions[].stored_keys: a gap, or no stored field compared while another account's field references it).
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))

export interface EvalJob { key: string; so: string; idl?: any }
interface Target { instructions: string[]; accounts: string[]; rules?: string[] }
interface Case { id: string; source: string; ground_truth: { instruction: string; target?: Target } }

const cases = (): Case[] => JSON.parse(readFileSync(join(ROOT, 'cases.json'), 'utf8')).cases.filter((c: Case) => c.source === 'real' && c.ground_truth.target)

export function evalJobs(): EvalJob[] {
	const jobs: EvalJob[] = []
	for (const c of cases()) for (const v of ['vuln', 'fixed']) {
		const so = join(ROOT, 'bin', `${c.id}@${v}.so`), idl = join(ROOT, 'bin', `${c.id}@${v}.json`)
		if (!existsSync(so)) { console.error(`missing binary eval/bin/${c.id}@${v}.so`); continue }
		jobs.push({ key: `${c.id}@${v}`, so, idl: existsSync(idl) ? JSON.parse(readFileSync(idl, 'utf8')) : undefined })
	}
	return jobs
}

const norm = (s: string) => s.replace(/\s*\(.*$/, '').replace(/\.key$/, '').replace(/[_\s]/g, '').toLowerCase()

interface Signal { kind: 'finding' | 'info'; what: string }

/** signals of one analysis.json at the target */
function signals(a: any, t: Target): Signal[] {
	const ixs = new Set(t.instructions.map(norm)), any = t.accounts.includes('*')
	const accs = t.accounts.filter(x => x !== '*').map(norm)
	const hit = (xs: string[]) => any || xs.some(x => accs.includes(norm(x)))
	const out: Signal[] = []
	for (const f of a.findings ?? []) {
		if (!ixs.has(norm(f.instruction)) || (t.rules && !t.rules.includes(f.rule)) || !hit(f.accounts ?? [])) continue
		out.push({ kind: f.confidence === 'info' ? 'info' : 'finding', what: `${f.rule}${f.confidence === 'info' ? ' (info)' : ''} @${f.instruction} [${(f.accounts ?? []).join(', ')}]` })
	}
	if (t.rules) return out
	for (const r of a.validation_consistency ?? []) for (const x of r.inconsistencies ?? []) {
		if (ixs.has(norm(x.instruction)) && hit([x.account])) out.push({ kind: 'info', what: `consistency: ${x.account} lacks "${x.validation}" @${x.instruction}` })
	}
	for (const ix of a.instructions ?? []) {
		if (!ixs.has(norm(ix.name))) continue
		for (const k of ix.stored_keys ?? []) {
			const gaps = (k.gaps ?? []).filter((g: string) => hit([k.account]) || accs.some(x => norm(g).includes(x)))
			for (const g of gaps) out.push({ kind: 'info', what: `stored-key gap @${ix.name}: ${g}` })
			if (hit([k.account]) && !k.compared.length && k.referencedBy?.length) out.push({ kind: 'info', what: `stored-key: ${k.account} @${ix.name} no stored field compared (bound only through ${k.referencedBy.join(', ')})` })
		}
	}
	return out
}

/** the eval section of bench/run.ts: one line per case; `out`: analysis.json by job key */
export function scoreEval(out: Map<string, any>, verbose: boolean): string[] {
	const lines = ['eval pairs (eval/cases.json, real): vuln = strongest signal at the ground truth; fixed = no signal left there', 'case                    ground truth (instruction: accounts)       vuln          fixed']
	let finding = 0, info = 0, clean = 0, n = 0
	for (const c of cases()) {
		const v = out.get(`${c.id}@vuln`), f = out.get(`${c.id}@fixed`)
		if (!v || !f) continue
		n++
		const t = c.ground_truth.target!
		const sv = signals(v, t), sf = signals(f, t)
		const fixedKeys = new Set(sf.map(s => s.what))
		const vs = sv.some(s => s.kind === 'finding') ? 'finding' : sv.length ? 'informational' : 'missed'
		if (vs === 'finding') finding++
		else if (vs === 'informational') info++
		if (!sf.length) clean++
		const gone = sv.length && sv.every(s => !fixedKeys.has(s.what))
		lines.push(`${c.id.padEnd(23)} ${`${c.ground_truth.instruction}: ${t.accounts.join(' ')}`.slice(0, 42).padEnd(42)} ${vs.padEnd(13)} ${sf.length ? `NOT clean (${sf.length})` : 'clean'}${sv.length && !gone ? '  (a vuln signal stays in fixed)' : ''}`)
		if (verbose) {
			for (const s of sv) lines.push(`    vuln  ${s.kind === 'finding' ? 'F' : 'i'} ${s.what}`)
			for (const s of sf) lines.push(`    fixed ${s.kind === 'finding' ? 'F' : 'i'} ${s.what}`)
		}
	}
	lines.push(`eval: ${finding + info}/${n} detected (${finding} as finding, ${info} informational only), ${clean}/${n} fixed clean`)
	return lines
}
