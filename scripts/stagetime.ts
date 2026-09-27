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
//   node scripts/stagetime.ts [--iters N] [--stage3] prog.so...
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { parseElf } from '../src/elf.ts'
import { decode, loadProgram, Lifter, type Program } from '../src/program.ts'
import { inferSignatures, recoverVars, type VarFunc } from '../src/dataflow.ts'
import { promoteStack } from '../src/stack.ts'
import { rewriteStackArgs } from '../src/stackargs.ts'
import { optimizeFunc, setFoldImage, isSettled } from '../src/simplify.ts'
import { recognizeIdioms } from '../src/idioms.ts'
import { compactStores, sinkFrameLoads } from '../src/compact.ts'

const args = process.argv.slice(2)
let iters = 5
const files: string[] = []
let stage3 = false
for (let i = 0; i < args.length; i++) { if (args[i] === '--iters') iters = +args[++i]; else if (args[i] === '--stage3') stage3 = true; else files.push(args[i]) }

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
