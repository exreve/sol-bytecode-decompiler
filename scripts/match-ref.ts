// How many functions of a symbolized reference build match library signatures (dev tool)
import { readFileSync } from 'node:fs'
import { loadProgram } from '../src/program.ts'
import { fingerprint } from '../src/fingerprint.ts'
import { libDb, MIN_LIB_INSNS } from '../src/library.ts'
const p = loadProgram(new Uint8Array(readFileSync(process.argv[2])))
const db = libDb()!
let n = 0, hit = 0
const names: string[] = []
for (const f of p.funcs.values()) {
	const fp = fingerprint(p, f)
	if (fp.insns < MIN_LIB_INSNS) continue
	n++
	if (db.sigs[fp.hash]) { hit++; names.push(`${db.sigs[fp.hash][0]} ${f.name}`) }
}
console.log(`functions ${n}, matching mainnet library sigs ${hit}`)
console.log(names.slice(0, 30).join('\n'))
