// Corpus noise baseline of the analysis: decompiles every corpus/*.so (with corpus/idl/<id>.json when present) as the
// CLI project output does, in parallel under a time budget, and prints per rule: programs hit, findings, findings per 100
// programs (informational findings and validation_consistency / stored-key signals in their own rows). On a clean corpus
// every finding is presumed noise, so lower is better at equal bench recall.
// usage: node bench/corpus.ts [corpusDir] [--budget s=1800] [--timeout s=240] [--jobs n] [--save]
//   compares with bench/corpus-baseline.json when present; --save rewrites it (only after a run that finished every program).
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Worker, isMainThread, parentPort } from 'node:worker_threads'
import { availableParallelism } from 'node:os'

const ROOT = dirname(fileURLToPath(import.meta.url))
const BASELINE = join(ROOT, 'corpus-baseline.json')

/** per program: row -> count; rows: `<rule>` (finding), `<rule> (info)`, `consistency`, `stored-key gap` */
type Counts = Record<string, number>
interface Baseline { programs: number; rows: Record<string, { programs: number; findings: number }>; per_program: Record<string, Counts> }

function counts(a: any): Counts {
	const c: Counts = {}
	const add = (k: string) => { c[k] = (c[k] ?? 0) + 1 }
	for (const f of a.findings ?? []) add(f.confidence === 'info' ? `${f.rule} (info)` : f.rule)
	for (const r of a.validation_consistency ?? []) for (const _ of r.inconsistencies ?? []) add('~consistency')
	for (const ix of a.instructions ?? []) for (const k of ix.stored_keys ?? []) for (const _ of k.gaps ?? []) add('~stored-key gap')
	return c
}

function arg(name: string, dflt: number): number {
	const i = process.argv.indexOf(name)
	return i >= 0 ? Number(process.argv[i + 1]) : dflt
}

async function main() {
	const dir = process.argv.slice(2).find((a, i, xs) => !a.startsWith('-') && !['--budget', '--timeout', '--jobs'].includes(xs[i - 1])) ?? join(ROOT, '..', 'corpus')
	if (!existsSync(dir)) { console.error(`no corpus at ${dir} (pass its directory)`); process.exit(1) }
	const budget = arg('--budget', 1800) * 1000, timeout = arg('--timeout', 240) * 1000
	const nw = arg('--jobs', Math.max(1, availableParallelism() - 2))
	const files = readdirSync(dir).filter(f => f.endsWith('.so')).sort()
	// big ones first: the budget cuts the small tail rather than a long program started last
	const { statSync } = await import('node:fs')
	const queue = files.map(f => ({ id: basename(f, '.so'), so: join(dir, f), size: statSync(join(dir, f)).size })).sort((a, b) => b.size - a.size)
	const t0 = Date.now()
	const per: Record<string, Counts> = {}, timeouts: string[] = [], failures: string[] = []
	let skipped = 0
	await Promise.all(Array.from({ length: nw }, async () => {
		for (let j = queue.shift(); j; j = queue.shift()) {
			if (Date.now() - t0 > budget) { skipped++; continue }
			const idlPath = join(dir, 'idl', j.id + '.json')
			const r = await runOne(j.so, existsSync(idlPath) ? idlPath : undefined, timeout)
			if (r === 'timeout') timeouts.push(j.id)
			else if (typeof r === 'string') failures.push(`${j.id}: ${r.split('\n')[0]}`)
			else per[j.id] = r
			const n = Object.keys(per).length + timeouts.length + failures.length
			if (n % 25 === 0) console.error(`  ${n}/${files.length} (${((Date.now() - t0) / 1000).toFixed(0)}s)`)
		}
	}))
	const done = Object.keys(per).length
	const rows: Baseline['rows'] = {}
	for (const c of Object.values(per)) for (const [k, n] of Object.entries(c)) {
		const r = rows[k] ??= { programs: 0, findings: 0 }
		r.programs++; r.findings += n
	}
	const base: Baseline | undefined = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : undefined
	console.log(`corpus: ${done}/${files.length} programs analysed, ${timeouts.length} timeouts, ${failures.length} failures, ${skipped} skipped (budget) [${((Date.now() - t0) / 1000).toFixed(0)}s]`)
	console.log(`${'rule'.padEnd(40)} programs  findings  per100${base ? '   baseline (programs / findings, same programs)' : ''}`)
	const keys = [...new Set([...Object.keys(rows), ...Object.keys(base?.rows ?? {})])].sort((a, b) => Number(a.startsWith('~')) - Number(b.startsWith('~')) || Number(a.includes('(info)')) - Number(b.includes('(info)')) || (rows[b]?.findings ?? 0) - (rows[a]?.findings ?? 0))
	let total = 0, totalProgs = new Set<string>()
	for (const k of keys) {
		const r = rows[k] ?? { programs: 0, findings: 0 }
		if (!k.startsWith('~') && !k.includes('(info)')) { total += r.findings; for (const [id, c] of Object.entries(per)) if (c[k]) totalProgs.add(id) }
		let cmp = ''
		if (base) { // same program set: only programs analysed in both runs
			let p = 0, f = 0
			for (const id of Object.keys(per)) { const n = base.per_program[id]?.[k] ?? 0; if (n) { p++; f += n } }
			if (p !== r.programs || f !== r.findings) cmp = `   ${p} / ${f}`
		}
		console.log(`${k.replace(/^~/, '').padEnd(40)} ${String(r.programs).padStart(8)} ${String(r.findings).padStart(9)} ${(100 * r.findings / (done || 1)).toFixed(1).padStart(7)}${cmp}`)
	}
	console.log(`all findings (not info) ${' '.repeat(16)} ${String(totalProgs.size).padStart(8)} ${String(total).padStart(9)} ${(100 * total / (done || 1)).toFixed(1).padStart(7)}`)
	if (timeouts.length) console.log(`timeouts: ${timeouts.join(' ')}`)
	for (const f of failures) console.log(`failed: ${f}`)
	if (process.argv.includes('--save')) {
		if (skipped) console.error('not saved: the budget cut the run')
		else {
			writeFileSync(BASELINE, fmt({ about: 'node bench/corpus.ts --save: per rule programs / findings on the corpus; per_program: nonzero counts (~ rows: informational signals)', date: new Date().toISOString().slice(0, 10), programs: done, timeouts, failures, rows, per_program: per }) + '\n')
			console.log(`saved ${BASELINE}`)
		}
	}
}

/** JSON with tab indentation, objects / arrays of primitives on one line */
function fmt(x: any, ind = ''): string {
	if (x === null || typeof x !== 'object') return JSON.stringify(x)
	const flat = Object.values(x).every(v => v === null || typeof v !== 'object')
	const items = Array.isArray(x) ? x.map(v => fmt(v, ind + '\t')) : Object.entries(x).map(([k, v]) => `${JSON.stringify(k)}: ${fmt(v, ind + '\t')}`)
	if (flat) return Array.isArray(x) ? `[${items.join(', ')}]` : items.length ? `{ ${items.join(', ')} }` : '{}'
	return `${Array.isArray(x) ? '[' : '{'}\n${items.map(i => ind + '\t' + i).join(',\n')}\n${ind}${Array.isArray(x) ? ']' : '}'}`
}

/** one program in a fresh worker (terminated on timeout / crash) */
function runOne(so: string, idl: string | undefined, timeout: number): Promise<Counts | string> {
	return new Promise(resolve => {
		const w = new Worker(fileURLToPath(import.meta.url), { workerData: null, resourceLimits: { stackSizeMb: 256, maxOldGenerationSizeMb: 4096 } })
		const timer = setTimeout(() => { w.terminate(); resolve('timeout') }, timeout)
		const end = (r: Counts | string) => { clearTimeout(timer); w.terminate(); resolve(r) }
		w.on('message', (m: { counts?: Counts; error?: string }) => end(m.counts ?? m.error ?? 'no result'))
		w.on('error', e => end(String(e)))
		w.postMessage({ so, idl })
	})
}

if (!isMainThread) {
	const { decompile } = await import('../src/decompile.ts')
	const { renderProject } = await import('../src/layout.ts')
	const { parseIdl } = await import('../src/idl.ts')
	parentPort!.once('message', ({ so, idl }: { so: string; idl?: string }) => {
		try {
			let info
			try { info = idl ? parseIdl(JSON.parse(readFileSync(idl, 'utf8'))) : undefined } catch { } // an IDL the parser rejects: none, as the CLI would fail
			const res = decompile(readFileSync(so), { idl: info })
			parentPort!.postMessage({ counts: counts(JSON.parse(renderProject(res).get('security/analysis.json')!)) })
		} catch (e) { parentPort!.postMessage({ error: String((e as Error).stack ?? e) }) }
	})
} else await main()
