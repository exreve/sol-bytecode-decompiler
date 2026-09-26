/// <reference path="../lib.d.ts" />
// instruction idl_set_buffer
import { fn_149678, fn_14c4f0, fn_14c5c0, memcpy } from '../shared.ts'

// instruction handler: idl_set_buffer (discriminator sha256("global:idl_set_buffer")[..8] = 0xaef61cb501b51b1)
export function ix_idl_set_buffer(a: u64, b: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s58 = fp - 0x58, s70 = fp - 0x70, sf0 = fp - 0xf0, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130
	let q: u64
	const g = sol_log("Instruction: IdlSetBuffer", 0x19)
	const f = ld32(b + 0x28)
	st32(b + 0x58, f)
	const j = fn_143448(s40, ld64(b + 0x30), g)
	if (ld64(s40) != 0x800000000000001a /* Ok */) {
		copyr(s110, s40, 0x18)
		fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s110, 0x10015a8e8, 0x10015a8d0)
	}
	const h = ld64(s40 + 8)
	const i = ld64(h + 8)
	if (i > 0x2b) {
		const r = ld64(s40 + 0x10)
		const m = ld64(h)
		AccountInfo_try_borrow_data(s40, ld64(b), j)
		if (ld64(s40) != 0x800000000000001a /* Ok */) {
			copyr(s110, s40, 0x18)
			fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s110, 0x10015a8e8, 0x10015a8d0)
		}
		const k = ld64(s40 + 8)
		const l = ld64(k + 8)
		if (l > 0x2b) {
			if (l - 0x2c >= f) {
				const n = ld64(s40 + 0x10)
				if (f > i - 0x2c) {
					ErrorCode_name(s70, 0x100152d30)
					st64(s58, 0, 1, 0)
					st64(s20, s58, 0x100159480)
					st8(s20 + 0x18, 3)
					st64(s20 + 0x10, 0x20)
					st64(s40 + 0x10, 0)
					st64(s40, 0)
					if (ErrorCode_fmt(0x100152d30, s40) == 0) {
						copy(sf0, s70, 0x30)
						st64(s110 + 8, 0x100155435)
						st32(sf0 + 0x78, 0x9ca /* anchor::RequireGteViolated */)
						st8(sf0 + 0x30, 2)
						st32(s110 + 0x18, 0x27)
						st64(s110 + 0x10, 0x1d)
						st64(s110, 0)
						fn_13b3a8(s120, s110)
						q = fn_6c8(s130, ld64(s120), ld64(s120 + 8), i - 0x2c, f)
						const o = ld64(s130 + 8)
						const p = ld64(s130)
						st64(n, ld64(n) - 1)
						st64(r, ld64(r) + 1)
						st64(a + 8, o)
						st64(a, p)
						return q
					}
					fn_149678("a Display implementation returned an error unexpectedly", 0x37, s110, 0x1001594b0, 0x1001594d0)
				}
				q = memcpy(m + 0x2c, ld64(k) + 0x2c, f)
				st64(n, ld64(n) - 1)
				st64(r, ld64(r) + 1)
				st64(a + 8, undef)
				st64(a, 2)
				return q
			}
			fn_14c5c0(f, l - 0x2c, 0x10015a8d0)
		}
		fn_14c4f0(0x2c, l, 0x10015a8d0)
	}
	fn_14c4f0(0x2c, i, 0x10015a8d0)
}
