/// <reference path="../lib.d.ts" />
// instruction idl_set_buffer
import { fn_13e5a0, fn_14ed60, fn_153150, fn_153158, memcpy } from '../shared.ts'

// instruction handler: idl_set_buffer (discriminator sha256("global:idl_set_buffer")[..8] = 0xaef61cb501b51b1)
export function ix_idl_set_buffer(a: u64, b: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let p: u64
	const i = sol_log("Instruction: IdlSetBuffer", 0x19)
	const f = ld32(b + 0x28)
	st32(b + 0x58, f)
	const g = ld64(ld64(b + 0x30) + 0x10)
	if (ld64(g + 0x10) != 0) {
		st64(s118, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s118, 0x1001601f0, 0x100160bd8)
	}
	st64(g + 0x10, -1)
	const h = ld64(g + 0x20)
	if (0x2c > h) {
		fn_153150(0x2c, h, 0x100160bd8)
	}
	const l = ld64(g + 0x18)
	AccountInfo_try_borrow_data(s48, ld64(b), i)
	if (ld64(s48) != 0x800000000000001a /* Ok */) {
		copyr(s118, s48, 0x18)
		fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s118, 0x1001601f0, 0x100160bd8)
	}
	const j = ld64(s48 + 8)
	const k = ld64(j + 8)
	if (0x2c > k) {
		fn_153150(0x2c, k, 0x100160bd8)
	}
	if (k - 0x2c >= f) {
		const m = ld64(s48 + 0x10)
		if (f > h - 0x2c) {
			ErrorCode_name(s78, 0x100159858, f)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100159858, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copy(sf8, s78, 0x30)
			st64(s118 + 8, 0x10015b659)
			st32(sf8 + 0x78, 0x9ca /* anchor::RequireGteViolated */)
			st8(sf8 + 0x30, 2)
			st32(s118 + 0x18, 0x2f)
			st64(s118 + 0x10, 0x17)
			st64(s118, 0)
			fn_13e5a0(s128, s118)
			p = fn_3be8(s138, ld64(s128), ld64(s128 + 8), h - 0x2c, f)
			const n = ld64(s138 + 8)
			const o = ld64(s138)
			st64(m, ld64(m) - 1)
			st64(g + 0x10, ld64(g + 0x10) + 1)
			st64(a + 8, n)
			st64(a, o)
			return p
		}
		p = memcpy(l + 0x2c, ld64(j) + 0x2c, f)
		st64(m, ld64(m) - 1)
		st64(g + 0x10, ld64(g + 0x10) + 1)
		st64(a + 8, undef)
		st64(a, 2)
		return p
	}
	fn_153158(f, k - 0x2c, 0x100160bd8)
}
