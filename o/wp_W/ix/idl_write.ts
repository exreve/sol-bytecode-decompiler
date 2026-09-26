/// <reference path="../lib.d.ts" />
// instruction idl_write
import { fn_1490e8, fn_149678, fn_14c4f0, fn_14c5c0, memcpy } from '../shared.ts'

// instruction handler: idl_write (discriminator sha256("global:idl_write")[..8] = 0x6f06922e766c8a88)
export function ix_idl_write(a: u64, b: u64, c: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let q: u64
	const j = sol_log("Instruction: IdlWrite", 0x15)
	let i = undef
	const g = ld64(c + 0x10)
	const f = ld32(b + 0x28)
	if (f > f + g) {
		fn_1490e8(0x10015a8d0, i)
	}
	if (g > 0xffffffff) {
		fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s1, 0x100159c60, 0x10015a8d0)
	}
	const h = f + (g as u32)
	i = h as u32
	if (i != h) {
		fn_1490e8(0x10015a8d0, i)
	}
	st32(b + 0x28, h)
	fn_143448(s48, ld64(b), j)
	if (ld64(s48) != 0x800000000000001a /* Ok */) {
		copyr(s118, s48, 0x18)
		fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s118, 0x10015a8e8, 0x10015a8d0)
	}
	const k = ld64(s48 + 8)
	const l = ld64(k + 8)
	if (l > 0x2b) {
		if (l - 0x2c >= f + g) {
			const n = ld64(s48 + 0x10)
			const m = f + g - f
			if (m == g) {
				q = memcpy(ld64(k) + 0x2c + f, ld64(c + 8), g)
				st64(n, ld64(n) + 1)
				st64(a + 8, undef)
				st64(a, 2)
				return q
			}
			ErrorCode_name(s78, 0x100152d54)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x100159480)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100152d54, s48) == 0) {
				copy(sf8, s78, 0x30)
				st64(s118 + 8, 0x100155435)
				st32(sf8 + 0x78, 0x9c5 /* anchor::RequireEqViolated */)
				st8(sf8 + 0x30, 2)
				st32(s118 + 0x18, 0x27)
				st64(s118 + 0x10, 0x1d)
				st64(s118, 0)
				fn_13b3a8(s128, s118)
				q = fn_6c8(s138, ld64(s128), ld64(s128 + 8), m, g)
				const o = ld64(s138 + 8)
				const p = ld64(s138)
				st64(n, ld64(n) + 1)
				st64(a + 8, o)
				st64(a, p)
				return q
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1, 0x1001594b0, 0x1001594d0)
		}
		fn_14c5c0(f + g, l - 0x2c, 0x10015a8d0)
	}
	fn_14c4f0(0x2c, l, 0x10015a8d0)
}
