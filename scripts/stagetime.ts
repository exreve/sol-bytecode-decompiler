// Early-stage timings of the TS pipeline (dev tool), the same breakdown as `sbpf-dump --time` (rs/):
// elf = parseElf, decode = decode(), discover_lazy = loadProgram(lazyBlocks) - elf - decode,
// load_lazy / load_full = loadProgram with / without lazyBlocks, lift_all = a fresh Lifter over every
// instruction start; stage 2 on the lazily loaded program: signatures = inferSignatures (with
// materializeBlocks), recover = recoverVars of every function, promote = promoteStack of every
// function (on recoverVars' output, as scripts/dump.ts), stackargs = rewriteStackArgs over all
// functions. Best of --iters runs (after one warm-up), ms.
//
//   node scripts/stagetime.ts [--iters N] prog.so...
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { parseElf } from '../src/elf.ts'
import { decode, loadProgram, Lifter, type Program } from '../src/program.ts'
import { inferSignatures, recoverVars, type VarFunc } from '../src/dataflow.ts'
import { promoteStack } from '../src/stack.ts'
import { rewriteStackArgs } from '../src/stackargs.ts'

const args = process.argv.slice(2)
let iters = 5
const files: string[] = []
for (let i = 0; i < args.length; i++) { if (args[i] === '--iters') iters = +args[++i]; else files.push(args[i]) }

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
