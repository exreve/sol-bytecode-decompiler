// Per-stage profile of the whole TS pipeline (dev tool, docs/RUST_PORT.md "Pipeline profile"): aggregates
// .cpuprofiles by stage. Each sample goes to the outermost src/ frame below the orchestrators (cli.ts,
// decompile.ts, layout.ts, analysis/*; ir.ts helpers count for their caller), keyed by module (+ function
// for a few), then grouped; prints a markdown table (--detail: the per-module rows too).
//
//   node --stack-size=65500 --cpu-prof --cpu-prof-dir=prof/jup --cpu-prof-interval 500 src/cli.ts jup.so -o out/
//   node scripts/cpuprof.ts [--detail] prof/token22 prof/jup ...
import { readFileSync, readdirSync } from 'node:fs'
import { basename } from 'node:path'
const args = process.argv.slice(2)
const detail = args.includes('--detail')
const dirs = args.filter(a => a !== '--detail')
const ORCH = new Set(['cli.ts', 'decompile.ts', 'layout.ts'])
const SPLIT = { 'dataflow.ts': 1, 'simplify.ts': 1, 'program.ts': 1 }
const G = [
	['load: lazy discovery + lift', k => k.startsWith('program.ts') || k === 'elf.ts'],
	['inferSignatures (+ materializeBlocks)', k => k === 'dataflow.ts:inferSignatures'],
	['recoverVars', k => k.startsWith('dataflow.ts')],
	['promoteStack + rewriteStackArgs', k => k === 'stack.ts' || k === 'stackargs.ts'],
	['optimizeFunc (simplify, cfgopt, ifconv)', k => k.startsWith('simplify.ts') || k === 'cfgopt.ts' || k === 'ifconv.ts'],
	['idioms + compact', k => k === 'idioms.ts' || k === 'compact.ts'],
	['structuring (structure, stmtidioms, outline)', k => ['structure.ts', 'stmtidioms.ts', 'outline.ts'].includes(k)],
	['printing (print.ts)', k => k === 'print.ts'],
	['views/accounts/structs/frameregions/fieldnames/anchor*/idl/state', k => ['views.ts', 'accounts.ts', 'structs.ts', 'frameregions.ts', 'fieldnames.ts', 'anchor.ts', 'anchorstate.ts', 'idl.ts', 'state.ts'].includes(k)],
	['exec/cpiexec/cpi/emu/builtins', k => ['exec.ts', 'cpiexec.ts', 'cpi.ts', 'emu.ts', 'builtins.ts'].includes(k)],
	['semantics/library/fingerprint/selector/taint', k => ['semantics.ts', 'library.ts', 'fingerprint.ts', 'selector.ts', 'taint.ts', 'demangle.ts', 'murmur.ts', 'syscalls.ts'].includes(k)],
	['analysis layer (src/analysis/*)', k => k.startsWith('analysis/')],
	['decompile.ts orchestration (naming, phase 3+)', k => k.startsWith('decompile.ts')],
	['layout + budget (renderProject)', k => k.startsWith('layout.ts') || k === 'budget.ts' || k === 'compat.ts'],
	['GC', k => k === 'GC'],
	['startup, module loading, I/O', k => true],
]
const cols = []
for (const dir of dirs) {
	const file = readdirSync(dir).find(f => f.endsWith('.cpuprofile'))
	const prof = JSON.parse(readFileSync(`${dir}/${file}`, 'utf8'))
	const nodes = new Map(prof.nodes.map(n => [n.id, n]))
	const parent = new Map()
	for (const n of prof.nodes) for (const c of n.children ?? []) parent.set(c, n.id)
	const memo = new Map()
	const key = id => {
		if (memo.has(id)) return memo.get(id)
		const path = []
		for (let x = id; x !== undefined; x = parent.get(x)) path.push(nodes.get(x))
		path.reverse()
		let k = null, orch = null
		for (const n of path) {
			const cf = n.callFrame
			if (cf.functionName === '(garbage collector)') { k = 'GC'; break }
			if (cf.functionName === '(program)' || cf.functionName === '(idle)') { k = cf.functionName; break }
			const m = cf.url.match(/\/src\/(.*\.ts)$/)
			if (!m) continue
			const mod = m[1]
			if (mod.startsWith('analysis/')) { orch = mod; continue }
			if (ORCH.has(mod)) { orch = `${mod}:${cf.functionName}`; continue }
			if (mod === 'ir.ts') break
			k = SPLIT[mod] ? `${mod}:${cf.functionName}` : mod
			break
		}
		if (!k) k = orch ? `${orch} (self)` : '(other)'
		memo.set(id, k)
		return k
	}
	const tot = new Map()
	let all = 0
	for (let i = 0; i < prof.samples.length; i++) {
		const dt = prof.timeDeltas[i + 1] ?? 0
		const k = key(prof.samples[i])
		tot.set(k, (tot.get(k) ?? 0) + dt)
		all += dt
	}
	if (detail) {
		console.log('==', dir)
		for (const [k, v] of [...tot].sort((a, b) => b[1] - a[1])) if (v / all > 0.005) console.log((v / 1000).toFixed(0).padStart(7), 'ms', (100 * v / all).toFixed(1).padStart(5) + '%', k)
	}
	const g = new Map(G.map(([n]) => [n, 0]))
	for (const [k, v] of tot) { const [n] = G.find(([, f]) => f(k)); g.set(n, g.get(n) + v) }
	g.set('total', all)
	cols.push({ name: basename(dir), g })
}
console.log('| stage | ' + cols.map(c => c.name).join(' | ') + ' |')
console.log('|---|' + cols.map(() => '---:').join('|') + '|')
for (const [n] of [...G, ['total']]) console.log(`| ${n} | ` + cols.map(c => { const v = c.g.get(n), t = c.g.get('total'); return n === 'total' ? `**${Math.round(v / 1000)}**` : `${Math.round(v / 1000)} (${(100 * v / t).toFixed(1)}%)` }).join(' | ') + ' |')
