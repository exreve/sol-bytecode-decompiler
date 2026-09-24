// Library recognition stats for a program (dev tool)
import { readFileSync } from 'node:fs'
import { loadProgram } from '../src/program.ts'
import { inferSignatures } from '../src/dataflow.ts'
import { classify } from '../src/library.ts'
const p = loadProgram(new Uint8Array(readFileSync(process.argv[2])))
inferSignatures(p)
const c = classify(p)
let lib = 0, named = 0, libInsns = 0, all = 0
for (const f of p.funcs.values()) {
	let n = 0; for (const b of f.blocks) n += b.end - b.start + 1
	all += n
	const i = c.get(f.pc)!
	if (i.lib) { lib++; libInsns += n; if (i.hint && !i.hint.startsWith('"')) named++ }
}
console.log(`${process.argv[2]}: funcs ${p.funcs.size}, lib ${lib} (named ${named}), lib insns ${(100 * libInsns / all).toFixed(1)}%`)
