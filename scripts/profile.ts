// Per-stage timing of the pipeline (dev tool)
import { readFileSync } from 'node:fs'
import { loadProgram } from '../src/program.ts'
import { inferSignatures, recoverVars } from '../src/dataflow.ts'
import { optimizeFunc } from '../src/simplify.ts'
import { structure, cleanup } from '../src/structure.ts'

let t = Date.now()
const p = loadProgram(new Uint8Array(readFileSync(process.argv[2])))
console.log('load', Date.now() - t, 'ms; funcs', p.funcs.size, 'insns', p.insns.length); t = Date.now()
inferSignatures(p)
console.log('signatures', Date.now() - t); t = Date.now()
for (const f0 of p.funcs.values()) {
	const t0 = Date.now()
	const f = recoverVars(p, f0); const t1 = Date.now()
	optimizeFunc(f); const t2 = Date.now()
	const st = structure(f); const t3 = Date.now()
	cleanup(st, f.returns); const t4 = Date.now()
	if (t4 - t0 > 200) console.log(f.name, 'blocks', f.blocks.length, 'vars', t1 - t0, 'opt', t2 - t1, 'struct', t3 - t2, 'cleanup', t4 - t3)
}
console.log('funcs', Date.now() - t)
