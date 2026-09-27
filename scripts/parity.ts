// Parity of the Rust port (rs/) against the TypeScript oracle: runs both stage dumpers over a set of
// binaries and diffs each stage, reporting the first differing line (dev tool, read-only).
//
//   node scripts/parity.ts [--root dir] [--bin rs-dump-binary] [--stages elf,insns,cfg,lift] [--fuzz N [--seed S]] [paths...]
//
// paths: .so files or directories (their *.so); default: the standard sets under --root
// (samples, samples/regress, compat/bin, bench/bin, eval/bin, corpus). Build the binary first:
// (cd rs && cargo build --release). Exit status 1 when any stage differs.
// --fuzz N: instead, N mutants of the given binaries (those under 512 KB): random e_flags (all sBPF
// versions), random instructions in the text, sometimes corrupted headers or a truncated file.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { dumpAll, STAGES } from './dump.ts'
import { parseElf } from '../src/elf.ts'

const args = process.argv.slice(2)
let fuzz = 0, seed = 1
let root = '.', bin = '/tmp/claude-1000/rs-target/release/sbpf-dump', stages: readonly string[] = STAGES
const paths: string[] = []
for (let i = 0; i < args.length; i++) {
	if (args[i] === '--root') root = args[++i]
	else if (args[i] === '--bin') bin = args[++i]
	else if (args[i] === '--fuzz') fuzz = +args[++i]
	else if (args[i] === '--seed') seed = +args[++i]
	else if (args[i] === '--stages') stages = args[++i].split(',')
	else paths.push(args[i])
}
if (!paths.length) for (const d of ['samples', 'samples/regress', 'compat/bin', 'bench/bin', 'eval/bin', 'corpus']) paths.push(join(root, d))

const files: string[] = []
for (const p of paths) {
	if (!existsSync(p)) { console.error(`(missing: ${p})`); continue }
	if (statSync(p).isDirectory()) for (const f of readdirSync(p).sort()) { if (f.endsWith('.so')) files.push(join(p, f)) }
	else files.push(p)
}

// xorshift32 (deterministic mutants)
let rng = seed >>> 0 || 1
const rand = () => { rng ^= rng << 13; rng >>>= 0; rng ^= rng >>> 17; rng ^= rng << 5; rng >>>= 0; return rng }
const pick = <T>(a: readonly T[]) => a[rand() % a.length]
const OPS = [0x04, 0x05, 0x07, 0x0c, 0x0f, 0x14, 0x15, 0x16, 0x17, 0x18, 0x1c, 0x1d, 0x1e, 0x1f, 0x24, 0x25, 0x26, 0x27, 0x2c, 0x2d, 0x2e, 0x2f, 0x34, 0x35, 0x36, 0x37, 0x3c, 0x3d, 0x3e, 0x3f, 0x44, 0x45, 0x46, 0x47, 0x4c, 0x4d, 0x4e, 0x4f, 0x54, 0x55, 0x56, 0x57, 0x5c, 0x5d, 0x5e, 0x5f, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x69, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x6f, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x79, 0x7a, 0x7b, 0x7c, 0x7d, 0x7e, 0x7f, 0x84, 0x85, 0x86, 0x87, 0x8c, 0x8d, 0x8e, 0x8f, 0x94, 0x95, 0x96, 0x97, 0x9c, 0x9f, 0xa4, 0xa5, 0xa6, 0xa7, 0xac, 0xad, 0xae, 0xaf, 0xb4, 0xb5, 0xb6, 0xb7, 0xbc, 0xbd, 0xbe, 0xbf, 0xc4, 0xc5, 0xc6, 0xc7, 0xcc, 0xcd, 0xce, 0xcf, 0xd4, 0xd5, 0xd6, 0xd7, 0xdc, 0xdd, 0xde, 0xe6, 0xe7, 0xf6, 0xf7]
function mutate(base: Uint8Array): Uint8Array {
	const b = new Uint8Array(base)
	const dv = new DataView(b.buffer)
	dv.setUint32(48, pick([0, 1, 2, 3, 4, 0x20, 0, 2, 3, rand()]), true)
	let text: { offset: number; size: number } | undefined
	try { text = parseElf(base).text } catch { /* keep text undefined */ }
	if (text && text.size >= 8) {
		const n = Math.floor(text.size / 8), k = 1 + (rand() % Math.min(n, 400))
		for (let j = 0; j < k; j++) {
			const o = text.offset + (rand() % n) * 8
			if (o + 8 > b.length) continue
			b[o] = rand() % 4 ? pick(OPS) : rand() & 0xff
			b[o + 1] = rand() % 3 ? (rand() % 11) | ((rand() % 11) << 4) : rand() & 0xff
			dv.setInt16(o + 2, rand() % 3 ? (rand() % 64) - 32 : rand() & 0xffff, true)
			dv.setInt32(o + 4, pick([0, 1, -1, 16, 32, 64, 7, rand() % 100, rand() | 0, (rand() % 2000) - 1000]), true)
		}
	}
	if (rand() % 5 === 0) for (let j = 0, k = 1 + rand() % 8; j < k; j++) { const o = rand() % Math.min(b.length, 64 + (rand() % 2) * b.length); b[o] = rand() & 0xff }
	if (rand() % 4 === 0 && b.length >= 64) { // section / program header tables
		const tab = rand() % 2 ? Number(dv.getBigUint64(40, true)) : Number(dv.getBigUint64(32, true))
		for (let j = 0, k = 1 + rand() % 4; j < k; j++) { const o = tab + (rand() % 1024); if (o < b.length) b[o] = rand() % 2 ? rand() & 0xff : b[o] ^ (1 << (rand() % 8)) }
	}
	if (rand() % 10 === 0) return b.subarray(0, rand() % b.length)
	return b
}

const clip = (s: string | undefined) => (s === undefined ? '<missing>' : s.length > 240 ? s.slice(0, 240) + '…' : s)
const tmp = mkdtempSync(join(tmpdir(), 'parity-'))
let same = 0
const bad: string[] = []
const t0 = performance.now()
const cases: string[] = fuzz ? [] : files
if (fuzz) {
	const bases = files.filter(f => statSync(f).size < 512 * 1024).map(f => new Uint8Array(readFileSync(f)))
	for (let i = 0; i < fuzz; i++) { const f = join(tmp, `fuzz${i}.so`); writeFileSync(f, mutate(pick(bases))); cases.push(f) }
}
for (const f of cases) {
	const ts = dumpAll(new Uint8Array(readFileSync(f)), stages)
	const out = join(tmp, 'rs')
	rmSync(out, { recursive: true, force: true })
	let rsErr = ''
	try { execFileSync(bin, [f, '--stages', stages.join(','), out], { stdio: ['ignore', 'ignore', 'pipe'] }) } catch (e) { rsErr = String((e as { stderr?: Buffer }).stderr ?? e) }
	const diffs: string[] = []
	if (rsErr) diffs.push(`rust failed: ${clip(rsErr.trim())}`)
	else for (const st of stages) {
		const a = ts.get(st), p = join(out, `${st}.jsonl`)
		const b = existsSync(p) ? readFileSync(p, 'utf8') : undefined
		if (a === b) continue
		if (a === undefined || b === undefined) { diffs.push(`${st}: ${a === undefined ? 'no TS dump' : 'no Rust dump'}`); continue }
		const la = a.split('\n'), lb = b.split('\n')
		let k = 0
		while (k < la.length && la[k] === lb[k]) k++
		diffs.push(`${st}: line ${k + 1}\n    ts: ${clip(la[k])}\n    rs: ${clip(lb[k])}`)
	}
	if (diffs.length) { bad.push(f); console.log(`DIFF ${f}\n  ${diffs.join('\n  ')}`) } else { same++; if (fuzz) rmSync(f) }
}
if (!fuzz || !bad.length) rmSync(tmp, { recursive: true, force: true })
console.log(`parity: ${same}/${cases.length} identical, ${bad.length} differing (stages ${stages.join(',')}; ${((performance.now() - t0) / 1000).toFixed(0)}s)`)
process.exit(bad.length ? 1 : 0)
