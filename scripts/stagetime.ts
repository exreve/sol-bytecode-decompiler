// Early-stage timings of the TS pipeline (dev tool), the same breakdown as `sbpf-dump --time` (rs/):
// elf = parseElf, decode = decode(), discover_lazy = loadProgram(lazyBlocks) - elf - decode,
// load_lazy / load_full = loadProgram with / without lazyBlocks, lift_all = a fresh Lifter over every
// instruction start. Best of --iters runs (after one warm-up), ms.
//
//   node scripts/stagetime.ts [--iters N] prog.so...
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { parseElf } from '../src/elf.ts'
import { decode, loadProgram, Lifter, type Program } from '../src/program.ts'

const args = process.argv.slice(2)
let iters = 5
const files: string[] = []
for (let i = 0; i < args.length; i++) { if (args[i] === '--iters') iters = +args[++i]; else files.push(args[i]) }

console.log('file\telf\tdecode\tdiscover_lazy\tload_lazy\tload_full\tlift_all')
for (const f of files) {
	const bytes = new Uint8Array(readFileSync(f))
	const best = new Array(6).fill(Infinity)
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
		if (it === 0) continue // warm-up
		const v = [tElf, tDec, Math.max(0, tLazy - tElf - tDec), tLazy, tFull, tLift]
		for (let k = 0; k < 6; k++) best[k] = Math.min(best[k], v[k])
		void n
	}
	console.log([basename(f), ...best.map(x => x.toFixed(2))].join('\t'))
}
