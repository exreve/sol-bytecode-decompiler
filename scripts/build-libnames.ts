// Build data/libnames.json: fingerprint -> demangled Rust name, from symbolized reference builds.
// usage: node scripts/build-libnames.ts [dir=refbuild/out]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { loadProgram } from '../src/program.ts'
import { fingerprint } from '../src/fingerprint.ts'
import { demangle } from '../src/demangle.ts'
import { MIN_LIB_INSNS } from '../src/library.ts'

const dir = process.argv[2] ?? 'refbuild/out'
const names = new Map<string, Map<string, number>>()
let nf = 0
for (const f of readdirSync(dir).filter(x => x.endsWith('.so'))) {
	const p = loadProgram(new Uint8Array(readFileSync(`${dir}/${f}`)))
	for (const fn of p.funcs.values()) {
		const sym = p.symbolNames.get(fn.pc)
		if (!sym) continue
		const fp = fingerprint(p, fn)
		if (fp.insns < MIN_LIB_INSNS) continue
		const n = demangle(sym)
		if (/ref_(native|anchor)\b/.test(n) || n === 'process') continue // the reference program's own code
		let m = names.get(fp.hash); if (!m) names.set(fp.hash, (m = new Map()))
		m.set(n, (m.get(n) ?? 0) + 1)
		nf++
	}
}
const out: Record<string, string> = {}
for (const [h, m] of names) {
	// several instantiations can compile to identical code: prefer the most frequent, then shortest
	out[h] = [...m].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length)[0][0]
}
writeFileSync('data/libnames.json', JSON.stringify(out))
console.log(`functions ${nf}, named fingerprints ${Object.keys(out).length}`)
