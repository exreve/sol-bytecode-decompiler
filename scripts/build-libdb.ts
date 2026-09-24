// Build data/libsigs.json: fingerprints of functions shared by many unrelated programs.
// Programs from the same code base (forks/redeploys) are clustered into families first so
// that forked *user* code is not mistaken for library code.
// usage: node scripts/build-libdb.ts [corpusDir=corpus] [minFamilies=3]
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { loadProgram } from '../src/program.ts'
import { fingerprint } from '../src/fingerprint.ts'
import { MIN_LIB_INSNS } from '../src/library.ts'

const dir = process.argv[2] ?? 'corpus'
const minFam = Number(process.argv[3] ?? 3)
const files = [...readdirSync(dir).filter(f => f.endsWith('.so')).map(f => `${dir}/${f}`), ...readdirSync('samples').filter(f => f.endsWith('.so')).map(f => `samples/${f}`)]

interface ProgInfo { file: string; hashes: Set<string>; strings: Map<string, string[]>; size: Map<string, number> }
const progs: ProgInfo[] = []
for (const file of files) {
	try {
		const p = loadProgram(new Uint8Array(readFileSync(file)))
		const info: ProgInfo = { file, hashes: new Set(), strings: new Map(), size: new Map() }
		for (const f of p.funcs.values()) {
			const fp = fingerprint(p, f)
			if (fp.insns < MIN_LIB_INSNS) continue
			info.hashes.add(fp.hash)
			info.size.set(fp.hash, fp.insns)
			if (fp.strings.length) info.strings.set(fp.hash, fp.strings)
		}
		progs.push(info)
		process.stdout.write(`\r${progs.length}/${files.length}`)
	} catch (e) { console.log('\nskip', file, String(e).slice(0, 80)) }
}
console.log()
// global frequency
const freq = new Map<string, number>()
for (const pr of progs) for (const h of pr.hashes) freq.set(h, (freq.get(h) ?? 0) + 1)
// family clustering on rare hashes (frequency <= 4): programs sharing many rare functions are one code base
const parent = progs.map((_, i) => i)
const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
const rareOf = progs.map(pr => new Set([...pr.hashes].filter(h => freq.get(h)! <= 4)))
const byHash = new Map<string, number[]>()
rareOf.forEach((s, i) => { for (const h of s) { let a = byHash.get(h); if (!a) byHash.set(h, (a = [])); a.push(i) } })
const pairCount = new Map<string, number>()
for (const ids of byHash.values()) for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) {
	const k = `${ids[a]},${ids[b]}`; pairCount.set(k, (pairCount.get(k) ?? 0) + 1)
}
for (const [k, n] of pairCount) {
	const [a, b] = k.split(',').map(Number)
	const small = Math.min(rareOf[a].size, rareOf[b].size)
	if (n >= 10 && n >= 0.2 * small) parent[find(a)] = find(b)
}
const families = new Set(progs.map((_, i) => find(i))).size
// count families per hash
const fam = new Map<string, Set<number>>()
progs.forEach((pr, i) => { for (const h of pr.hashes) { let s = fam.get(h); if (!s) fam.set(h, (s = new Set())); s.add(find(i)) } })
const out: Record<string, [number, number]> = {}
let kept = 0
for (const [h, s] of fam) if (s.size >= minFam) { out[h] = [s.size, progs.find(p => p.hashes.has(h))!.size.get(h)!]; kept++ }
mkdirSync('data', { recursive: true })
writeFileSync('data/libsigs.json', JSON.stringify({ programs: progs.length, families, minFamilies: minFam, sigs: out }))
console.log(`programs ${progs.length}, families ${families}, distinct fns ${freq.size}, library sigs ${kept}`)
