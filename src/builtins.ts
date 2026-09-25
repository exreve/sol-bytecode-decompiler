// Compiler-builtin 128-bit arithmetic recognized by behavior (names of library stubs only: nothing here
// changes semantics). A library function without a known name that makes no calls is run (exec.ts) on
// pseudo-random operands and edge cases; when every run leaves in the 16 bytes at its first argument
// exactly what one of these computes from the other four (two u128 as lo, hi words), it gets that name:
//   __multi3(out, a_lo, a_hi, b_lo, b_hi)   *out = a * b (mod 2^128)
//   __udivti3 / __umodti3                   *out = a / b, a % b (unsigned; b != 0)
//   __divti3 / __modti3                     the same, signed (i128)
import type { Program } from './program.ts'
import { Exec, ExecMem, extentOf } from './exec.ts'

const M128 = (1n << 128n) - 1n
const i128 = (x: bigint) => BigInt.asIntN(128, x)

const OPS: [string, string, (a: bigint, b: bigint) => bigint | undefined][] = [
	['__multi3', 'u128 multiply: *out = a * b (mod 2^128), a = (a_lo, a_hi), b = (b_lo, b_hi)', (a, b) => (a * b) & M128],
	['__udivti3', 'u128 divide: *out = a / b (unsigned), a = (a_lo, a_hi), b = (b_lo, b_hi)', (a, b) => (b === 0n ? undefined : a / b)],
	['__umodti3', 'u128 remainder: *out = a % b (unsigned), a = (a_lo, a_hi), b = (b_lo, b_hi)', (a, b) => (b === 0n ? undefined : a % b)],
	['__divti3', 'i128 divide: *out = a / b (signed, truncating), a = (a_lo, a_hi), b = (b_lo, b_hi)', (a, b) => (b === 0n ? undefined : BigInt.asUintN(128, i128(a) / i128(b)))],
	['__modti3', 'i128 remainder: *out = a % b (signed), a = (a_lo, a_hi), b = (b_lo, b_hi)', (a, b) => (b === 0n ? undefined : BigInt.asUintN(128, i128(a) % i128(b)))],
]

/** operand pairs: edge cases, then pseudo-random values of assorted widths */
function operands(): [bigint, bigint][] {
	let x = 0x9e3779b97f4a7c15n
	const rnd = () => { x ^= (x << 13n) & ((1n << 64n) - 1n); x ^= x >> 7n; x ^= (x << 17n) & ((1n << 64n) - 1n); return x }
	const out: [bigint, bigint][] = [[0n, 1n], [1n, 1n], [M128, 1n], [M128, M128], [1n << 64n, 3n], [(1n << 127n), 2n], [12345n, (1n << 64n) + 7n]]
	for (let i = 0; i < 24; i++) {
		const w = (n: number) => (n === 0 ? rnd() >> BigInt(i % 60) : (rnd() << 64n) | rnd()) & M128
		out.push([w(i % 3), w((i >> 1) % 3) | 1n])
	}
	return out
}

/** A behavioral name for the function at pc (see the file comment), or undefined. */
export function builtinName(p: Program, pc: number): { name: string; hint: string } | undefined {
	const end = extentOf(p, pc)
	if (end - pc > 400 || p.funcs.get(pc)?.nparams !== 5) return undefined
	for (let i = pc; i < end; i++) { const o = p.insns[i].opc; if (o === 0x85 || o === 0x8d) return undefined }
	const cands = OPS.slice()
	const OUT = 0x2_0000_0100n
	for (const [a, b] of operands()) {
		const mem = new ExecMem(p, 3)
		mem.store(OUT, 8, 0x1111n); mem.store(OUT + 8n, 8, 0x2222n)
		const e = new Exec(p, mem, { maxSteps: 20_000 })
		const r = e.run(pc, [OUT, a & ((1n << 64n) - 1n), a >> 64n, b & ((1n << 64n) - 1n), b >> 64n], 0x2_0000_3000n)
		const got = r.abort !== undefined || r.limit ? undefined : mem.readU(OUT, 8) | (mem.readU(OUT + 8n, 8) << 64n)
		for (let k = cands.length - 1; k >= 0; k--) {
			const want = cands[k][2](a, b)
			if (want === undefined) continue
			if (got !== want) cands.splice(k, 1)
		}
		if (!cands.length) return undefined
	}
	return cands.length === 1 ? { name: cands[0][0], hint: `${cands[0][1]} [exec: on ${operands().length} operand pairs]` } : undefined
}
