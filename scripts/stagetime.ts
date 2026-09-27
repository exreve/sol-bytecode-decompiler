// Early-stage timings of the TS pipeline (dev tool), the same breakdown as `sbpf-dump --time` (rs/):
// elf = parseElf, decode = decode(), discover_lazy = loadProgram(lazyBlocks) - elf - decode,
// load_lazy / load_full = loadProgram with / without lazyBlocks, lift_all = a fresh Lifter over every
// instruction start; stage 2 on the lazily loaded program: signatures = inferSignatures (with
// materializeBlocks), recover = recoverVars of every function, promote = promoteStack of every
// function (on recoverVars' output, as scripts/dump.ts), stackargs = rewriteStackArgs over all
// functions. Best of --iters runs (after one warm-up), ms.
//
// With --stage3: the per-function phase (stage 3) on the same lazily loaded program after
// inferSignatures + recoverVars, as scripts/dump.ts dumpStage3 runs it (every function): opt1 =
// optimizeFunc, promote = promoteStack, opt2 = optimizeFunc after a promotion, idioms =
// recognizeIdioms, opt3 = optimizeFunc after idioms, stackargs = rewriteStackArgs, sink =
// sinkFrameLoads, compact = compactStores, total = their sum (each summed over all functions).
//
// With --stage4: structuring and printing of the raw output (decompile(bytes, { sugar: false, full:
// true })) after the stage 3 pipeline: struct = structure + cleanup + statementIdioms, print = variable
// names + declarations + printBody + the function's lines (a script-local copy of decompile's raw
// printing path, checked against decompile's text), each summed over all functions.
//
// With --stage5: the whole readable output (decompile(bytes, { full: true }), the single file included)
// minus its analysis (analyze(), stage 8: timed separately on the same result and subtracted), and
// the raw output (sugar: false) the same way: read = readable - raw is what stage 5 adds.
// With --stage7: the default output (decompile(bytes), library code as stubs) and the --full readable output,
// each minus its analysis as for --stage5. With --diff a.so b.so: the program diff (profile of both + diff).
//   node scripts/stagetime.ts [--iters N] [--stage3 | --stage4 | --stage5 | --stage7] prog.so...
//   node scripts/stagetime.ts [--iters N] --diff a.so b.so
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { parseElf } from '../src/elf.ts'
import { decode, loadProgram, Lifter, fnAddr, type Program } from '../src/program.ts'
import { inferSignatures, recoverVars, type VarFunc } from '../src/dataflow.ts'
import { promoteStack } from '../src/stack.ts'
import { rewriteStackArgs } from '../src/stackargs.ts'
import { optimizeFunc, setFoldImage, isSettled } from '../src/simplify.ts'
import { recognizeIdioms } from '../src/idioms.ts'
import { compactStores, sinkFrameLoads } from '../src/compact.ts'
import { structure, cleanup, type Node } from '../src/structure.ts'
import { statementIdioms } from '../src/stmtidioms.ts'
import { Printer, printBody } from '../src/print.ts'
import { decompile } from '../src/decompile.ts'
import { analyze } from '../src/analysis/report.ts'
import { profile, diff } from '../src/diff.ts'
import { walkExpr, type Expr, type Stmt } from '../src/ir.ts'
import { stmtExprs } from '../src/simplify.ts'

const args = process.argv.slice(2)
let iters = 5
const files: string[] = []
let stage3 = false, stage4 = false, stage5 = false, stage7 = false, diffMode = false
for (let i = 0; i < args.length; i++) { if (args[i] === '--iters') iters = +args[++i]; else if (args[i] === '--stage3') stage3 = true; else if (args[i] === '--stage4') stage4 = true; else if (args[i] === '--stage5') stage5 = true; else if (args[i] === '--stage7') stage7 = true; else if (args[i] === '--diff') diffMode = true; else files.push(args[i]) }

// ---- decompile.ts's raw printing path (script-local copy for timing; checked against decompile's text) ----
const RESERVED = new Set(['do', 'if', 'in', 'as', 'of', 'fp', 'let', 'var', 'for', 'new', 'try', 'int', 'is', 'ld', 'st'])
function* shortNames(): Generator<string> {
	const al = 'abcdefghijklmnopqrstuvwxyz'
	for (const c of 'fghijklmnopqrstuvwxyz') yield c
	for (const c1 of al) for (const c2 of al) { const n = c1 + c2; if (!RESERVED.has(n)) yield n }
	for (let i = 0; ; i++) yield `v${i}`
}
function usesVar(e: Expr, v: number) { let u = false; walkExpr(e, x => { if (x.k === 'var' && x.id === v) u = true }); return u }
function declarations(f: VarFunc, body: Node[]): { decls: Map<Stmt, 'let' | 'const'>; hoisted: number[] } {
	interface Ref { list: Node[]; path: Node[][]; isDef: boolean; s?: Stmt }
	const refs = new Map<number, Ref[]>(), defCount = new Map<number, number>()
	const add = (v: number, r: Ref) => { let a = refs.get(v); if (!a) refs.set(v, (a = [])); a.push(r) }
	const walk = (ns: Node[], path: Node[][]) => {
		const p2 = [...path, ns]
		ns.forEach(n => {
			const use = (e: Expr) => walkExpr(e, x => { if (x.k === 'var') add(x.id, { list: ns, path: p2, isDef: false }) })
			switch (n.k) {
				case 'stmt': stmtExprs(n.s).forEach(use); if ((n.s.k === 'set' || n.s.k === 'call') && n.s.dst >= 0) { add(n.s.dst, { list: ns, path: p2, isDef: true, s: n.s }); defCount.set(n.s.dst, (defCount.get(n.s.dst) ?? 0) + 1) } break
				case 'if': use(n.c); walk(n.then, p2); walk(n.else, p2); break
				case 'block': walk(n.body, p2); break
				case 'loop': if (n.form === 'while' && n.c) use(n.c); walk(n.body, p2); if (n.form === 'do' && n.c) use(n.c); break
				case 'return': if (n.e) use(n.e); break
				case 'switch': add(n.v, { list: ns, path: p2, isDef: false }); n.cases.forEach(c => walk(c.body, p2)); break
				case 'setstate': add(n.v, { list: ns, path: p2, isDef: true }); defCount.set(n.v, 2); break
			}
		})
	}
	walk(body, [])
	const decls = new Map<Stmt, 'let' | 'const'>(), hoisted: number[] = []
	for (const [v, rs] of refs) {
		if (f.vars[v]?.param >= 0) continue
		let common = rs[0].path
		for (const r of rs) { let i = 0; while (i < common.length && i < r.path.length && common[i] === r.path[i]) i++; common = common.slice(0, i) }
		const list = common[common.length - 1], first = rs[0]
		if (first.isDef && first.list === list && first.s && !(first.s.k === 'set' && usesVar(first.s.e, v)) && list) decls.set(first.s, (defCount.get(v) ?? 0) === 1 ? 'const' : 'let')
		else hoisted.push(v)
	}
	return { decls, hoisted: hoisted.sort((a, b) => a - b) }
}
function rawText(f: VarFunc, body: Node[], irreducible: boolean, fnName: (pc: number) => string, fnAddrName: (a: bigint) => string | undefined, sysName: (n: string) => string, symNote?: string): string {
	const used = new Set<number>()
	const note = (e: Expr) => walkExpr(e, x => { if (x.k === 'var') used.add(x.id) })
	const noteNodes = (ns: Node[]) => {
		for (const n of ns) {
			if (n.k === 'stmt') { stmtExprs(n.s).forEach(note); if ((n.s.k === 'set' || n.s.k === 'call') && n.s.dst >= 0) used.add(n.s.dst) }
			else if (n.k === 'if') { note(n.c); noteNodes(n.then); noteNodes(n.else) }
			else if (n.k === 'block') noteNodes(n.body)
			else if (n.k === 'loop') { if (n.c) note(n.c); noteNodes(n.body) }
			else if (n.k === 'return' && n.e) note(n.e)
			else if (n.k === 'switch') { used.add(n.v); n.cases.forEach(c => noteNodes(c.body)) }
			else if (n.k === 'setstate') used.add(n.v)
		}
	}
	noteNodes(body)
	const names: string[] = [], gen = shortNames()
	const paramName = ['r0', 'a', 'b', 'c', 'd', 'e', 'r6', 'r7', 'r8', 'r9', 'fp']
	const zeroInit = f.isEntry ? f.vars.filter(v => v.param >= 0 && v.param !== 1 && v.param !== 10 && used.has(v.id)) : []
	for (const v of f.vars) {
		if (v.param >= 100) names[v.id] = `p${5 + v.param - 100}`
		else if (v.param >= 0 && !zeroInit.includes(v)) names[v.id] = f.isEntry && v.param === 1 ? 'input' : paramName[v.param]
		else if (v.reg === -1) names[v.id] = 'state'
	}
	for (const v of f.vars) if (names[v.id] === undefined && used.has(v.id)) names[v.id] = gen.next().value as string
	const pr = new Printer({ fnName, fnAddrName, sysName, constComment: () => undefined, varName: id => names[id] ?? `u${id}`, dropUndefArgs: false })
	const { decls, hoisted } = declarations(f, body)
	const paramNm = (reg: number, dflt: string) => { const v = f.vars.find(x => x.param === reg); return (v && names[v.id]) ?? dflt }
	const params: string[] = []
	if (f.isEntry) params.push('input: u64')
	else {
		for (let r = 1; r <= (f.stackArgs ? 4 : f.nparams); r++) params.push(`${paramNm(r, paramName[r])}: u64`)
		for (let k = 0; k < (f.stackArgs ?? 0); k++) params.push(`${paramNm(100 + k, `p${5 + k}`)}: u64`)
		for (const r of f.extraIn) params.push(`${paramNm(r, paramName[r])}: u64`)
	}
	const lines: string[] = []
	if (symNote) lines.push(`// symbol: ${symNote}`)
	if (irreducible) lines.push('// note: irreducible control flow, emitted as a state machine')
	lines.push(`function ${f.name}(${params.join(', ')})${f.noreturn ? ': never' : f.returns ? ': u64' : ''} {`)
	const bodyLines = printBody(pr, f, body, '\t', decls, hoisted.filter(v => used.has(v)))
	if (zeroInit.length) lines.push(`\tlet ${zeroInit.map(v => `${names[v.id]} = 0`).join(', ')}`)
	lines.push(...bodyLines, '}')
	return lines.join('\n')
}

if (diffMode) {
	const [a, b] = files.map(f => new Uint8Array(readFileSync(f)))
	let best = Infinity
	for (let it = 0; it < iters + 1; it++) {
		const t0 = performance.now()
		diff(profile(a), profile(b), { all: true, labels: [files[0], files[1]] })
		if (it) best = Math.min(best, performance.now() - t0)
	}
	console.log(`diff\t${basename(files[0])}\t${basename(files[1])}\t${best.toFixed(1)}`)
	process.exit(0)
}
if (stage7) {
	console.log('file\tfull\tdefault')
	for (const f of files) {
		const bytes = new Uint8Array(readFileSync(f))
		const best = [Infinity, Infinity]
		for (let it = 0; it < iters + 1; it++) {
			const v = [true, false].map(full => {
				const t0 = performance.now()
				const r = decompile(bytes, { full })
				const t1 = performance.now()
				analyze(r)
				return t1 - t0 - (performance.now() - t1)
			})
			if (it) for (let k = 0; k < 2; k++) best[k] = Math.min(best[k], v[k]) // (first run: warm-up)
		}
		console.log([basename(f), best[0].toFixed(1), best[1].toFixed(1)].join('\t'))
	}
	process.exit(0)
}
if (stage5) {
	console.log('file\traw\treadable\tread')
	for (const f of files) {
		const bytes = new Uint8Array(readFileSync(f))
		const best = [Infinity, Infinity]
		for (let it = 0; it < iters + 1; it++) {
			const v = [false, true].map(sugar => {
				const t0 = performance.now()
				const r = decompile(bytes, { sugar, full: true })
				const t1 = performance.now()
				analyze(r)
				return t1 - t0 - (performance.now() - t1)
			})
			if (it) for (let k = 0; k < 2; k++) best[k] = Math.min(best[k], v[k]) // (first run: warm-up)
		}
		console.log([basename(f), best[0].toFixed(1), best[1].toFixed(1), (best[1] - best[0]).toFixed(1)].join('\t'))
	}
	process.exit(0)
} else if (stage4) {
	console.log('file\tstruct\tprint\ttotal')
	for (const f of files) {
		const bytes = new Uint8Array(readFileSync(f))
		// the final names (decompile's naming) and the texts to check against
		const ref = decompile(bytes, { sugar: false, full: true })
		const nameOf = new Map([...ref.program.funcs.values()].map(g => [g.pc, g.name]))
		const refText = new Map(ref.funcs.map(x => [x.pc, x.text]))
		const symNote = new Map(ref.funcs.map(x => [x.pc, /^\/\/ symbol: (.*)$/m.exec(x.text)?.[1]]))
		const best = new Array(3).fill(Infinity)
		for (let it = 0; it <= iters; it++) {
			const q: Program = loadProgram(bytes, { lazyBlocks: true })
			inferSignatures(q)
			for (const g of q.funcs.values()) g.name = nameOf.get(g.pc)!
			setFoldImage(q.image)
			const fs: VarFunc[] = []
			for (const g0 of q.funcs.values()) {
				const g = recoverVars(q, g0)
				optimizeFunc(g)
				if (promoteStack(g)) optimizeFunc(g)
				const idi = { real: false }
				if (recognizeIdioms(g, idi) && (idi.real || !isSettled(g))) optimizeFunc(g)
				fs.push(g)
			}
			rewriteStackArgs(q, new Map(fs.map(g => [g.pc, { f: g }])))
			for (const g of fs) { sinkFrameLoads(g); compactStores(g) }
			setFoldImage(null)
			const fnName = (pc: number) => q.funcs.get(pc)?.name ?? `fn_${(q.elf.text.addr + pc * 8).toString(16)}`
			const byAddr = new Map([...q.funcs.values()].map(g => [fnAddr(q, g.pc), g.name]))
			const sysName = (n: string) => q.syscalls.get(n)?.alias ?? n
			const v = [0, 0, 0]
			const bodies: { g: VarFunc; body: Node[]; irr: boolean }[] = []
			let t = performance.now()
			for (const g of fs) {
				const st = structure(g)
				let body = cleanup(st, g.returns)
				body = statementIdioms(body, g.vars.find(x => x.param === 10)?.id)
				bodies.push({ g, body, irr: st.irreducible })
			}
			v[0] = performance.now() - t
			t = performance.now()
			const texts = bodies.map(({ g, body, irr }) => rawText(g, body, irr, fnName, a => byAddr.get(a), sysName, symNote.get(g.pc)))
			v[1] = performance.now() - t
			v[2] = v[0] + v[1]
			if (it === 0) {
				const bad = bodies.filter(({ g }, i) => texts[i] !== refText.get(g.pc)).length
				if (bad) console.error(`${basename(f)}: ${bad} texts differ from decompile's`)
				continue
			}
			for (let k = 0; k < 3; k++) best[k] = Math.min(best[k], v[k])
		}
		console.log([basename(f), ...best.map(x => x.toFixed(2))].join('\t'))
	}
	process.exit(0)
}

if (stage3) {
	console.log('file\topt1\tpromote\topt2\tidioms\topt3\tstackargs\tsink\tcompact\ttotal')
	for (const f of files) {
		const bytes = new Uint8Array(readFileSync(f))
		const best = new Array(9).fill(Infinity)
		for (let it = 0; it <= iters; it++) {
			const q: Program = loadProgram(bytes, { lazyBlocks: true })
			inferSignatures(q)
			const fs = [...q.funcs.values()] as VarFunc[]
			for (const g of fs) recoverVars(q, g)
			setFoldImage(q.image)
			const v = new Array(9).fill(0)
			let t = 0
			const lap = (k: number) => { const n = performance.now(); v[k] += n - t; t = n }
			for (const g of fs) {
				t = performance.now()
				optimizeFunc(g); lap(0)
				const pr = promoteStack(g); lap(1)
				if (pr) optimizeFunc(g); lap(2)
				const idi = { real: false }
				const r = recognizeIdioms(g, idi); lap(3)
				if (r && (idi.real || !isSettled(g))) optimizeFunc(g); lap(4)
			}
			t = performance.now()
			rewriteStackArgs(q, new Map(fs.map(g => [g.pc, { f: g }]))); lap(5)
			for (const g of fs) { t = performance.now(); sinkFrameLoads(g); lap(6); compactStores(g); lap(7) }
			setFoldImage(null)
			v[8] = v.slice(0, 8).reduce((a, b) => a + b, 0)
			if (it === 0) continue // warm-up
			for (let k = 0; k < 9; k++) best[k] = Math.min(best[k], v[k])
		}
		console.log([basename(f), ...best.map(x => x.toFixed(2))].join('\t'))
	}
	process.exit(0)
}

console.log('file\telf\tdecode\tdiscover_lazy\tload_lazy\tload_full\tlift_all\tsignatures\trecover\tpromote\tstackargs')
for (const f of files) {
	const bytes = new Uint8Array(readFileSync(f))
	const best = new Array(10).fill(Infinity)
	for (let it = 0; it <= iters; it++) {
		let t = performance.now()
		const elf = parseElf(bytes)
		const tElf = performance.now() - t
		t = performance.now()
		decode(elf.bytes, elf.text.offset, Math.floor(elf.text.size / 8))
		const tDec = performance.now() - t
		t = performance.now()
		const q: Program = loadProgram(bytes, { lazyBlocks: true })
		const tLazy = performance.now() - t
		t = performance.now()
		loadProgram(bytes)
		const tFull = performance.now() - t
		t = performance.now()
		const lifter = new Lifter({ ...q, syscalls: new Map(q.syscalls) })
		const noLddw = q.version === 2
		let n = 0
		for (let pc = 0; pc < q.insns.length; pc++) { n += lifter.lift(pc).stmts.length; if (q.insns[pc].opc === 0x18 && !noLddw) pc++ }
		const tLift = performance.now() - t
		t = performance.now()
		inferSignatures(q)
		const tSig = performance.now() - t
		t = performance.now()
		for (const f of q.funcs.values()) recoverVars(q, f)
		const tRec = performance.now() - t
		t = performance.now()
		for (const f of q.funcs.values()) promoteStack(f as VarFunc)
		const tProm = performance.now() - t
		t = performance.now()
		rewriteStackArgs(q, new Map([...q.funcs.values()].map(f => [f.pc, { f: f as VarFunc }])))
		const tSa = performance.now() - t
		if (it === 0) continue // warm-up
		const v = [tElf, tDec, Math.max(0, tLazy - tElf - tDec), tLazy, tFull, tLift, tSig, tRec, tProm, tSa]
		for (let k = 0; k < 10; k++) best[k] = Math.min(best[k], v[k])
		void n
	}
	console.log([basename(f), ...best.map(x => x.toFixed(2))].join('\t'))
}
