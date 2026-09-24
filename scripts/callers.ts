// List callers of a function (dev tool): node scripts/callers.ts file.so fn_xxx
import { readFileSync } from 'node:fs'
import { loadProgram, fnAddr } from '../src/program.ts'
const p = loadProgram(new Uint8Array(readFileSync(process.argv[2])))
const target = [...p.funcs.values()].find(f => f.name === process.argv[3])!
const addr = fnAddr(p, target.pc)
for (const f of p.funcs.values()) for (const b of f.blocks) for (const s of b.stmts) {
	if (s.k === 'call' && s.t.k === 'fn' && s.t.pc === target.pc) console.log('call from', f.name, p.symbolNames.get(f.pc) ?? '')
	if (s.k === 'set' && s.e.k === 'const' && s.e.v === addr) console.log('address taken in', f.name)
}
console.log('addressTaken', p.addressTaken.has(target.pc), 'data pointers', [...p.elf.dataPointers].filter(([, v]) => v === addr).length)
