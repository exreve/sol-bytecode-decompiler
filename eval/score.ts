// Score reviewer outputs against eval/cases.json.
//   eval/results/<prog_NN>/<code|full>/<run>.json = { findings: [{ instruction, accounts, issue, confidence }], tokens_read? }
// A finding matches the ground truth when its instruction names the case's instruction (or an alias: native tag forms,
// sibling instructions with the same bug) and its accounts or issue text name a ground-truth account or keyword.
// Instruction-only matches are "unsure" and printed for a human (adjudicate in eval/results/overrides.json:
// { "<prog>/<variant>/<run>#<finding index>": "hit" | "miss" }). On a vuln packet a match = found; on the fixed
// packet of the same program a match = false positive. Findings matching nothing are "other claims" (unverified: real
// other bugs or false claims; listed with --verbose).
// usage: node eval/score.ts [--verbose] [--min-confidence x] [packet or case filter]   (EVAL_RESULTS=dir: other results dir)
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const E = dirname(fileURLToPath(import.meta.url)), R = process.env.EVAL_RESULTS ?? join(E, 'results')
const argv = process.argv.slice(2)
const verbose = argv.includes('--verbose')
const mc = argv.indexOf('--min-confidence'), minConf = mc >= 0 ? Number(argv[mc + 1]) : -Infinity
const filter = argv.filter((a, i) => !a.startsWith('--') && (mc < 0 || i !== mc + 1))[0]

interface Truth { instruction: string; aliases: string[]; accounts: string[]; keywords: string[]; description: string }
interface Case { id: string; source: 'real' | 'bench'; category: string; ground_truth: Truth; packets: Record<string, string> }
interface Finding { instruction?: string; accounts?: string[] | string; issue?: string; confidence?: number }
type Verdict = 'hit' | 'unsure' | 'other'

const cases: Case[] = JSON.parse(readFileSync(join(E, 'cases.json'), 'utf8')).cases
const packets = new Map<string, { c: Case; kind: string }>()
for (const c of cases) for (const [kind, id] of Object.entries(c.packets)) packets.set(id, { c, kind })
const overrides: Record<string, 'hit' | 'miss'> = existsSync(join(R, 'overrides.json')) ? JSON.parse(readFileSync(join(R, 'overrides.json'), 'utf8')) : {}

// words joined by '_': "VerifySignatures" / "verify signatures" / "tag 7" / "accounts[3]" -> verify_signatures, tag_7, accounts_3
const norm = (s: string) => '_' + s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') + '_'
const has = (text: string, w: string) => text.includes(norm(w))
const stem = (text: string, w: string) => text.includes(norm(w).slice(0, -1)) // keyword as a word prefix: "deserializ", "round"

function judge(f: Finding, t: Truth): Verdict {
	const ix = norm(f.instruction ?? ''), accs = norm([f.accounts ?? []].flat().join(' ')), issue = norm(f.issue ?? '')
	const ixHit = t.aliases.concat(t.instruction).some(a => has(ix, a))
	const accHit = t.accounts.some(a => has(accs, a) || has(issue, a))
	const kwHit = t.keywords.some(k => stem(issue, k))
	if (ixHit && (accHit || kwHit)) return 'hit'
	if (ixHit || (accHit && kwHit && !ix.replace(/_/g, ''))) return 'unsure'
	return 'other'
}

interface Run { prog: string; variant: string; run: string; c: Case; kind: string; found: boolean; hits: number; unsure: string[]; other: string[]; tokens?: number }
const runs: Run[] = []
if (!existsSync(R)) { console.log(`no results in ${R}`); process.exit(0) }
for (const prog of readdirSync(R).sort()) {
	const p = packets.get(prog)
	if (!p) { if (prog !== 'overrides.json') console.log(`? ${prog}: not a packet id of cases.json`); continue }
	if (filter && !prog.includes(filter) && !p.c.id.includes(filter)) continue
	for (const variant of readdirSync(join(R, prog)).sort()) {
		for (const file of readdirSync(join(R, prog, variant)).filter(f => f.endsWith('.json')).sort()) {
			const key = `${prog}/${variant}/${file.replace(/\.json$/, '')}`
			let out: { findings?: Finding[]; tokens_read?: number }
			try { out = JSON.parse(readFileSync(join(R, prog, variant, file), 'utf8')) } catch (e) { console.log(`! ${key}: ${(e as Error).message}`); continue }
			const r: Run = { prog, variant, run: file, c: p.c, kind: p.kind, found: false, hits: 0, unsure: [], other: [], tokens: out.tokens_read }
			;(out.findings ?? []).forEach((f, i) => {
				if ((f.confidence ?? 1) < minConf) return
				const o = overrides[`${key}#${i}`]
				const v: Verdict = o === 'hit' ? 'hit' : o === 'miss' ? 'other' : judge(f, p.c.ground_truth)
				const line = `${key}#${i} [${f.instruction ?? '?'}] (${[f.accounts ?? []].flat().join(', ')}) conf ${f.confidence ?? '?'}: ${f.issue ?? ''}`
				if (v === 'hit') { r.hits++; r.found = true } else (v === 'unsure' ? r.unsure : r.other).push(line)
			})
			runs.push(r)
		}
	}
}

const pct = (a: number, b: number) => b ? `${(100 * a / b).toFixed(0)}%` : '-'
console.log('packet   case                              bin    variant run            result   other  tokens')
for (const r of runs) {
	const res = r.kind === 'fixed' ? (r.found ? 'FP' : 'clean') : r.found ? 'found' : 'MISSED'
	console.log(`${r.prog}  ${r.c.id.padEnd(33)} ${r.kind.padEnd(6)} ${r.variant.padEnd(7)} ${r.run.padEnd(14)} ${res.padEnd(8)} ${String(r.other.length).padStart(5)}  ${r.tokens ?? ''}`)
}

console.log('\nsummary (per packet variant; real = real-world cases, bench = synthetic variants)')
console.log('variant  set    runs  found/vuln  recall  FP/fixed  FP-rate  other/run  unsure  mean tokens')
for (const variant of [...new Set(runs.map(r => r.variant))].sort()) {
	for (const set of ['real', 'bench', 'all']) {
		const rs = runs.filter(r => r.variant === variant && (set === 'all' || r.c.source === set))
		if (!rs.length) continue
		const vuln = rs.filter(r => r.kind === 'vuln'), fixed = rs.filter(r => r.kind === 'fixed')
		const found = vuln.filter(r => r.found).length, fp = fixed.filter(r => r.found).length
		const tok = rs.filter(r => r.tokens != null)
		console.log(`${variant.padEnd(8)} ${set.padEnd(6)} ${String(rs.length).padStart(4)}  ${`${found}/${vuln.length}`.padStart(10)}  ${pct(found, vuln.length).padStart(6)}  ${`${fp}/${fixed.length}`.padStart(8)}  ${pct(fp, fixed.length).padStart(7)}  ${(rs.reduce((s, r) => s + r.other.length, 0) / rs.length).toFixed(1).padStart(9)}  ${String(rs.reduce((s, r) => s + r.unsure.length, 0)).padStart(6)}  ${tok.length ? Math.round(tok.reduce((s, r) => s + r.tokens!, 0) / tok.length) : '-'}`)
	}
}

const unsure = runs.flatMap(r => r.unsure.map(u => ({ r, u })))
if (unsure.length) {
	console.log('\nunsure matches (instruction matches, account / issue does not): adjudicate in eval/results/overrides.json')
	for (const { r, u } of unsure) console.log(`  ${u}\n    truth (${r.c.category}): ${r.c.ground_truth.description}`)
}
if (verbose) {
	console.log('\nother claims (not the ground-truth issue; review manually: real other bugs or false claims)')
	for (const r of runs) for (const o of r.other) console.log(`  ${o}`)
}
