// Show disassembly-level IR and decompiled output for one function (dev tool)
import { readFileSync } from 'node:fs'
import { decompile } from '../src/decompile.ts'
const [file, name] = process.argv.slice(2)
const res = decompile(new Uint8Array(readFileSync(file)), { sugar: false })
const f = res.funcs.find(x => x.name === name)!
console.log(f.text)
const p = res.program
const fn = p.funcs.get(f.pc)!
console.log('--- asm')
for (const b of fn.blocks) {
	console.log(`block ${b.id} [${b.start}..${b.end}] succs=${b.succs}`)
	for (let pc = b.start; pc <= b.end; pc++) { const i = p.insns[pc]; console.log(`  ${pc}: op=0x${i.opc.toString(16)} d=r${i.dst} s=r${i.src} off=${i.off} imm=${i.imm}`) }
}
