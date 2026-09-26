/// <reference path="./lib.d.ts" />
// helpers used by several instructions

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
export function fn_8a8(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s30 = fp - 0x30
	const f = memcmp(0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c, 0x20)
	let j = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	g = common_is_closed(b)
	j = undef
	if (g != 0) {
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	const h = ld64(b + 0x10)
	if (ld64(h + 0x10) != 0) {
		st64(s20, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		g = fn_13e628(s30, s20)
		const k = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, k)
		return g
	}
	st64(h + 0x10, -1)
	const i = ld64(h + 0x18)
	st64(s20 + 8, ld64(h + 0x20))
	st64(s20, i)
	st64(s20 + 0x10, 0)
	g = fn_13e070(s20, 0x100159320, 8)
	if (g == 0) {
		j = ld64(h + 0x10) + 1
		st64(h + 0x10, j)
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	st64(s8, g)
	fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s8, 0x10015f6c8, 0x10015f6e8)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
export function fn_a80(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s30 = fp - 0x30
	const f = memcmp(0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c, 0x20)
	let j = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	g = common_is_closed(b)
	j = undef
	if (g != 0) {
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	const h = ld64(b + 0x10)
	if (ld64(h + 0x10) != 0) {
		st64(s20, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		g = fn_13e628(s30, s20)
		const k = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, k)
		return g
	}
	st64(h + 0x10, -1)
	const i = ld64(h + 0x18)
	st64(s20 + 8, ld64(h + 0x20))
	st64(s20, i)
	st64(s20 + 0x10, 0)
	g = fn_13e070(s20, 0x1001592c8, 8)
	if (g == 0) {
		j = ld64(h + 0x10) + 1
		st64(h + 0x10, j)
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	st64(s8, g)
	fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s8, 0x10015f6c8, 0x10015f6e8)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
export function fn_c58(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s30 = fp - 0x30
	const f = memcmp(0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c, 0x20)
	let j = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	g = common_is_closed(b)
	j = undef
	if (g != 0) {
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	const h = ld64(b + 0x10)
	if (ld64(h + 0x10) != 0) {
		st64(s20, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		g = fn_13e628(s30, s20)
		const k = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, k)
		return g
	}
	st64(h + 0x10, -1)
	const i = ld64(h + 0x18)
	st64(s20 + 8, ld64(h + 0x20))
	st64(s20, i)
	st64(s20 + 0x10, 0)
	g = fn_13e070(s20, 0x1001592e0, 8)
	if (g == 0) {
		j = ld64(h + 0x10) + 1
		st64(h + 0x10, j)
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	st64(s8, g)
	fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s8, 0x10015f6c8, 0x10015f6e8)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
export function fn_e30(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s30 = fp - 0x30
	const f = memcmp(0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c, 0x20)
	let j = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	g = common_is_closed(b)
	j = undef
	if (g != 0) {
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	const h = ld64(b + 0x10)
	if (ld64(h + 0x10) != 0) {
		st64(s20, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		g = fn_13e628(s30, s20)
		const k = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, k)
		return g
	}
	st64(h + 0x10, -1)
	const i = ld64(h + 0x18)
	st64(s20 + 8, ld64(h + 0x20))
	st64(s20, i)
	st64(s20 + 0x10, 0)
	g = fn_13e070(s20, 0x100159368, 8)
	if (g == 0) {
		j = ld64(h + 0x10) + 1
		st64(h + 0x10, j)
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	st64(s8, g)
	fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s8, 0x10015f6c8, 0x10015f6e8)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
export function fn_1008(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s30 = fp - 0x30
	const f = memcmp(0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c, 0x20)
	let j = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	g = common_is_closed(b)
	j = undef
	if (g != 0) {
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	const h = ld64(b + 0x10)
	if (ld64(h + 0x10) != 0) {
		st64(s20, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		g = fn_13e628(s30, s20)
		const k = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, k)
		return g
	}
	st64(h + 0x10, -1)
	const i = ld64(h + 0x18)
	st64(s20 + 8, ld64(h + 0x20))
	st64(s20, i)
	st64(s20 + 0x10, 0)
	g = fn_13e070(s20, 0x1001592e8, 8)
	if (g == 0) {
		j = ld64(h + 0x10) + 1
		st64(h + 0x10, j)
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	st64(s8, g)
	fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s8, 0x10015f6c8, 0x10015f6e8)
}

export function fn_1c78(a: u64, b: u64, c: u64, d: u64): u64 {
	let j, k, l, n, o, p, q, r, s, t: u64
	const h = d != 0 ? 4 : 5
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? f : 0x300008000
	if ((b & 1) != 0) {
		if (0x300000007 >= sat_sub(g, h)) {
			raw_vec_handle_error(1, h, 0x10015f8f8, d, g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, sat_sub(g, h))
		memcpy(sat_sub(g, h), d != 0 ? 0x1001598ac : 0x10015981c, h)
		const m = ld64(0x300000000 /* heap bump-allocator cursor */)
		j = 4 > m
		k = m != 0 ? j != 0 ? 0 : m - 4 : 0x300007ffc
		if (0x300000007 >= k) {
			raw_vec_handle_error(1, 4, 0x10015f8f8, j, l)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, k)
		t = 0x68
		s = 0x60
		r = 0x58
		q = 0x50
		p = 0x48
		o = 0x40
		st32(k, 0x65757274)
		n = c + 0x38
		void ld8(c + 0x38)
	} else {
		if (0x300000007 >= sat_sub(g, h)) {
			raw_vec_handle_error(1, h, 0x10015f8f8, d, g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, sat_sub(g, h))
		memcpy(sat_sub(g, h), d != 0 ? 0x1001598ac : 0x10015981c, h)
		const i = ld64(0x300000000 /* heap bump-allocator cursor */)
		j = 4 > i
		k = i != 0 ? j != 0 ? 0 : i - 4 : 0x300007ffc
		if (0x300000007 >= k) {
			raw_vec_handle_error(1, 4, 0x10015f8f8, j, l)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, k)
		t = 0x80
		s = 0x78
		r = 0x70
		q = 0x68
		p = 0x60
		o = 0x58
		st32(k, 0x65757274)
		n = c + 0x50
		void ld8(c + 0x50)
	}
	st8(n, 0)
	st64(c + o, h)
	st64(c + p, sat_sub(g, h))
	st64(c + q, h)
	st64(c + r, 4)
	st64(c + s, k)
	st64(c + t, 4)
	st64(a + 8, c)
	st64(a, b)
	return p
}

export function fn_2150(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sa8 = fp - 0xa8, sd8 = fp - 0xd8, sdf = fp - 0xdf, s10f = fp - 0x10f, s116 = fp - 0x116, s120 = fp - 0x120, s130 = fp - 0x130
	let f, g: u64
	st64(s130, d, e)
	st32(s120, 0)
	if ((b & 1) != 0) {
		st64(sa8, 0, 1, 0)
		st64(s28, sa8, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_150868(s130, s48) == 0) {
			copyr(s78, sa8, 0x18)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (imp_fmt(s120, s48) == 0) {
				copy(sa8, s78, 0x30)
				memcpy(sd8, sa8, 0x30)
				f = ld8(c + 0x38) != 0 ? sdf : sdf
				st8(c + 0x38, 0)
				g = memcpy(c + 0x39, f, 0x37)
				st64(a, b, c)
				return g
			}
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	st64(sa8, 0, 1, 0)
	st64(s28, sa8, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_150868(s130, s48) == 0) {
		copyr(s78, sa8, 0x18)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (imp_fmt(s120, s48) == 0) {
			copy(sa8, s78, 0x30)
			memcpy(s10f, sa8, 0x30)
			f = ld8(c + 0x50) != 0 ? s116 : s116
			st8(c + 0x50, 0)
			g = memcpy(c + 0x51, f, 0x37)
			st64(a, b, c)
			return g
		}
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value)
export function fn_26a0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sa8 = fp - 0xa8, sd8 = fp - 0xd8, sdf = fp - 0xdf, s10f = fp - 0x10f, s116 = fp - 0x116, s11c = fp - 0x11c, s120 = fp - 0x120
	let f, g: u64
	st32(s120, 0xf4240, d)
	if ((b & 1) != 0) {
		st64(sa8, 0, 1, 0)
		st64(s28, sa8, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_155420(s120, s48) == 0) {
			copyr(s78, sa8, 0x18)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (fn_155420(s11c, s48) == 0) {
				copy(sa8, s78, 0x30)
				memcpy(sd8, sa8, 0x30)
				f = ld8(c + 0x38) != 0 ? sdf : sdf
				st8(c + 0x38, 0)
				g = memcpy(c + 0x39, f, 0x37)
				st64(a, b, c)
				return g
			}
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	st64(sa8, 0, 1, 0)
	st64(s28, sa8, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_155420(s120, s48) == 0) {
		copyr(s78, sa8, 0x18)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_155420(s11c, s48) == 0) {
			copy(sa8, s78, 0x30)
			memcpy(s10f, sa8, 0x30)
			f = ld8(c + 0x50) != 0 ? s116 : s116
			st8(c + 0x50, 0)
			g = memcpy(c + 0x51, f, 0x37)
			st64(a, b, c)
			return g
		}
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), p5 (value), p6 (value), p7 (value)
export function fn_2be8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sa8 = fp - 0xa8, sd8 = fp - 0xd8, sdf = fp - 0xdf, s10f = fp - 0x10f, s116 = fp - 0x116, s128 = fp - 0x128, s138 = fp - 0x138
	let f, g: u64
	st64(s138, d, p5, p6, p7)
	if ((b & 1) != 0) {
		st64(sa8, 0, 1, 0)
		st64(s28, sa8, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_150868(s138, s48) == 0) {
			copyr(s78, sa8, 0x18)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (fn_150868(s128, s48) == 0) {
				copy(sa8, s78, 0x30)
				memcpy(sd8, sa8, 0x30)
				f = ld8(c + 0x38) != 0 ? sdf : sdf
				st8(c + 0x38, 0)
				g = memcpy(c + 0x39, f, 0x37)
				st64(a, b, c)
				return g
			}
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	st64(sa8, 0, 1, 0)
	st64(s28, sa8, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_150868(s138, s48) == 0) {
		copyr(s78, sa8, 0x18)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_150868(s128, s48) == 0) {
			copy(sa8, s78, 0x30)
			memcpy(s10f, sa8, 0x30)
			f = ld8(c + 0x50) != 0 ? s116 : s116
			st8(c + 0x50, 0)
			g = memcpy(c + 0x51, f, 0x37)
			st64(a, b, c)
			return g
		}
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
}

export function fn_3158(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sa8 = fp - 0xa8, sd8 = fp - 0xd8, sdf = fp - 0xdf, s10f = fp - 0x10f, s116 = fp - 0x116, s11c = fp - 0x11c, s120 = fp - 0x120
	let f, g: u64
	st32(s120, d, e)
	if ((b & 1) != 0) {
		st64(sa8, 0, 1, 0)
		st64(s28, sa8, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (imp_fmt(s120, s48) == 0) {
			copyr(s78, sa8, 0x18)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (imp_fmt(s11c, s48) == 0) {
				copy(sa8, s78, 0x30)
				memcpy(sd8, sa8, 0x30)
				f = ld8(c + 0x38) != 0 ? sdf : sdf
				st8(c + 0x38, 0)
				g = memcpy(c + 0x39, f, 0x37)
				st64(a, b, c)
				return g
			}
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	st64(sa8, 0, 1, 0)
	st64(s28, sa8, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (imp_fmt(s120, s48) == 0) {
		copyr(s78, sa8, 0x18)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (imp_fmt(s11c, s48) == 0) {
			copy(sa8, s78, 0x30)
			memcpy(s10f, sa8, 0x30)
			f = ld8(c + 0x50) != 0 ? s116 : s116
			st8(c + 0x50, 0)
			g = memcpy(c + 0x51, f, 0x37)
			st64(a, b, c)
			return g
		}
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
}

export function fn_36a0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sa8 = fp - 0xa8, sd8 = fp - 0xd8, sdf = fp - 0xdf, s10f = fp - 0x10f, s116 = fp - 0x116, s120 = fp - 0x120, s128 = fp - 0x128
	let f, g: u64
	st64(s128, d)
	st32(s120, 0)
	if ((b & 1) != 0) {
		st64(sa8, 0, 1, 0)
		st64(s28, sa8, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_155738(s128, s48) == 0) {
			copyr(s78, sa8, 0x18)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (imp_fmt(s120, s48) == 0) {
				copy(sa8, s78, 0x30)
				memcpy(sd8, sa8, 0x30)
				f = ld8(c + 0x38) != 0 ? sdf : sdf
				st8(c + 0x38, 0)
				g = memcpy(c + 0x39, f, 0x37)
				st64(a, b, c)
				return g
			}
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	st64(sa8, 0, 1, 0)
	st64(s28, sa8, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_155738(s128, s48) == 0) {
		copyr(s78, sa8, 0x18)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (imp_fmt(s120, s48) == 0) {
			copy(sa8, s78, 0x30)
			memcpy(s10f, sa8, 0x30)
			f = ld8(c + 0x50) != 0 ? s116 : s116
			st8(c + 0x50, 0)
			g = memcpy(c + 0x51, f, 0x37)
			st64(a, b, c)
			return g
		}
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
}

export function fn_4130(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	let g, h, j, k, l, m: u64
	if ((b & 1) != 0) {
		if (0 > (e as i64)) {
			raw_vec_handle_error(0, e, 0x10015f8f8, d, e)
		}
		g = 1
		if (e != 0) {
			const i = ld64(0x300000000 /* heap bump-allocator cursor */)
			g = sat_sub(i != 0 ? i : 0x300008000, e)
			if (0x300000008 > g) {
				raw_vec_handle_error(1, e, 0x10015f8f8, d, e)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, g)
		}
		k = a
		m = b
		j = e
		h = c
		l = memcpy(g, d, e)
		void ld64(c)
	} else {
		if (0 > (e as i64)) {
			raw_vec_handle_error(0, e, 0x10015f8f8, d, e)
		}
		g = 1
		if (e != 0) {
			const f = ld64(0x300000000 /* heap bump-allocator cursor */)
			g = sat_sub(f != 0 ? f : 0x300008000, e)
			if (0x300000008 > g) {
				raw_vec_handle_error(1, e, 0x10015f8f8, d, e)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, g)
		}
		k = a
		m = b
		j = e
		h = c
		l = memcpy(g, d, e)
		void ld64(c)
	}
	st64(h + 0x10, g, j)
	st64(h + 8, j)
	st64(h, 1)
	st64(k + 8, h)
	st64(k, m)
	return l
}

export function fn_4688(a: u64, b: AccountInfo): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60
	let f = b
	const g = b.owner
	let h = memcmp(g, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20) as u32
	if (h == 0) {
		st64(a, 2, f)
		return h
	}
	const k = anchor_error_from(s50, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	const j = ld64(s50 + 8)
	const i = ld64(s50)
	copyr(s40, g, 0x20)
	st64(s20, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
	h = Error_with_pubkeys(s60, i, j, s40, k)
	f = ld64(s60 + 8)
	st64(a, ld64(s60))
	st64(a + 8, f)
	return h
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: operation_state_data: OperationStateAccount
export function fn_4808(a: u64, b: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let m: u64
	let n = AccountInfo_try_borrow_data(s18, b, r0)
	const k = ld64(s18 + 0x10)
	const g = ld64(s18 + 8)
	const f = ld64(s18)
	if (f != 0x800000000000001a /* Ok */) {
		st64(s18, f, g, k)
		n = fn_13e628(s28, s18)
		const l = ld64(s28)
		st64(a + 0x10, ld64(s28 + 8))
		st64(a + 8, l)
		st64(a, 1)
		return n
	}
	const h = ld64(g + 8)
	if (8 > h) {
		n = anchor_error_from(s48, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, 0x800000000000001a /* Ok */)
		m = ld64(s48)
		st64(a + 0x10, ld64(s48 + 8))
		st64(a + 8, m)
		st64(a, 1)
		st64(k, ld64(k) - 1)
		return n
	}
	const operation_state_data: OperationStateAccount = ld64(g)
	const j = operation_state_data.discriminator
	if (j == 0xfcb7de51ed3aec13 /* account:OperationState */) {
		if (h > 0xdc8) {
			st64(a + 0x10, k)
			st64(a + 8, operation_state_data + 8)
			st64(a, 0)
			return n
		}
		fn_153158(0xdc9, h, 0x10015f700, 0xfcb7de51ed3aec13 /* account:OperationState */)
	}
	n = anchor_error_from(s38, 0xbba /* anchor::AccountDiscriminatorMismatch */, j, 0xfcb7de51ed3aec13 /* account:OperationState */)
	m = ld64(s38)
	st64(a + 0x10, ld64(s38 + 8))
	st64(a + 8, m)
	st64(a, 1)
	st64(k, ld64(k) - 1)
	return n
}

// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: tick_array_bitmap_extension_data: TickArrayBitmapExtensionAccount
export function fn_49f0(a: u64, b: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let m: u64
	let n = AccountInfo_try_borrow_data(s18, b, r0)
	const k = ld64(s18 + 0x10)
	const g = ld64(s18 + 8)
	const f = ld64(s18)
	if (f != 0x800000000000001a /* Ok */) {
		st64(s18, f, g, k)
		n = fn_13e628(s28, s18)
		const l = ld64(s28)
		st64(a + 0x10, ld64(s28 + 8))
		st64(a + 8, l)
		st64(a, 1)
		return n
	}
	const h = ld64(g + 8)
	if (8 > h) {
		n = anchor_error_from(s48, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, 0x800000000000001a /* Ok */)
		m = ld64(s48)
		st64(a + 0x10, ld64(s48 + 8))
		st64(a + 8, m)
		st64(a, 1)
		st64(k, ld64(k) - 1)
		return n
	}
	const tick_array_bitmap_extension_data: TickArrayBitmapExtensionAccount = ld64(g)
	const j = tick_array_bitmap_extension_data.discriminator
	if (j == 0x998b8061db24963c /* account:TickArrayBitmapExtension */) {
		if (h > 0x727) {
			st64(a + 0x10, k)
			st64(a + 8, tick_array_bitmap_extension_data.pool_id)
			st64(a, 0)
			return n
		}
		fn_153158(0x728, h, 0x10015f700, 0x998b8061db24963c /* account:TickArrayBitmapExtension */)
	}
	n = anchor_error_from(s38, 0xbba /* anchor::AccountDiscriminatorMismatch */, j, 0x998b8061db24963c /* account:TickArrayBitmapExtension */)
	m = ld64(s38)
	st64(a + 0x10, ld64(s38 + 8))
	st64(a + 8, m)
	st64(a, 1)
	st64(k, ld64(k) - 1)
	return n
}

// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: tick_array_state_data: TickArrayStateAccount
export function fn_4bd8(a: u64, b: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let m: u64
	let n = AccountInfo_try_borrow_data(s18, b, r0)
	const k = ld64(s18 + 0x10)
	const g = ld64(s18 + 8)
	const f = ld64(s18)
	if (f != 0x800000000000001a /* Ok */) {
		st64(s18, f, g, k)
		n = fn_13e628(s28, s18)
		const l = ld64(s28)
		st64(a + 0x10, ld64(s28 + 8))
		st64(a + 8, l)
		st64(a, 1)
		return n
	}
	const h = ld64(g + 8)
	if (8 > h) {
		n = anchor_error_from(s48, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, 0x800000000000001a /* Ok */)
		m = ld64(s48)
		st64(a + 0x10, ld64(s48 + 8))
		st64(a + 8, m)
		st64(a, 1)
		st64(k, ld64(k) - 1)
		return n
	}
	const tick_array_state_data: TickArrayStateAccount = ld64(g)
	const j = tick_array_state_data.discriminator
	if (j == 0x2a81f931cd559bc0 /* account:TickArrayState */) {
		if (h > 0x27ff) {
			st64(a + 0x10, k)
			st64(a + 8, tick_array_state_data.pool_id)
			st64(a, 0)
			return n
		}
		fn_153158(0x2800, h, 0x10015f700, 0x2a81f931cd559bc0 /* account:TickArrayState */)
	}
	n = anchor_error_from(s38, 0xbba /* anchor::AccountDiscriminatorMismatch */, j, 0x2a81f931cd559bc0 /* account:TickArrayState */)
	m = ld64(s38)
	st64(a + 0x10, ld64(s38 + 8))
	st64(a + 8, m)
	st64(a, 1)
	st64(k, ld64(k) - 1)
	return n
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: pool_state_data: PoolStateAccount
export function fn_4dc0(a: u64, b: AccountInfo, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let m: u64
	let n = AccountInfo_try_borrow_data(s18, b, r0)
	const k = ld64(s18 + 0x10)
	const g = ld64(s18 + 8)
	const f = ld64(s18)
	if (f != 0x800000000000001a /* Ok */) {
		st64(s18, f, g, k)
		n = fn_13e628(s28, s18)
		const l = ld64(s28)
		st64(a + 0x10, ld64(s28 + 8))
		st64(a + 8, l)
		st64(a, 1)
		return n
	}
	const h = ld64(g + 8)
	if (8 > h) {
		n = anchor_error_from(s48, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, 0x800000000000001a /* Ok */)
		m = ld64(s48)
		st64(a + 0x10, ld64(s48 + 8))
		st64(a + 8, m)
		st64(a, 1)
		st64(k, ld64(k) - 1)
		return n
	}
	const pool_state_data: PoolStateAccount = ld64(g)
	const j = pool_state_data.discriminator
	if (j == 0x46dec3d7f5e3edf7 /* account:PoolState */) {
		if (h > 0x607) {
			st64(a + 0x10, k)
			st64(a + 8, pool_state_data.bump)
			st64(a, 0)
			return n
		}
		fn_153158(0x608, h, 0x10015f700, 0x46dec3d7f5e3edf7 /* account:PoolState */)
	}
	n = anchor_error_from(s38, 0xbba /* anchor::AccountDiscriminatorMismatch */, j, 0x46dec3d7f5e3edf7 /* account:PoolState */)
	m = ld64(s38)
	st64(a + 0x10, ld64(s38 + 8))
	st64(a + 8, m)
	st64(a, 1)
	st64(k, ld64(k) - 1)
	return n
}

// types [heur]: b: AccountInfo (1 of 2 calls pass one, the others an untyped value: fn_3e038)
// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: observation_state_data: ObservationStateAccount
export function fn_4fa8(a: u64, b: AccountInfo, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58
	let g, k: u64
	if (b.is_writable != 0) {
		const f: DataCell = b.data
		if (f.borrow == 0) {
			f.borrow = -1
			const h = f.len
			if (8 > h) {
				r0 = anchor_error_from(s58, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
				k = ld64(s58 + 8)
				st64(a + 8, ld64(s58))
				st64(a + 0x10, k)
				st64(a, 1)
				f.borrow = f.borrow + 1
				return r0
			}
			const observation_state_data: ObservationStateAccount = f.ptr
			const j = observation_state_data.discriminator
			if (j == 0x84a5098135c5ae7a /* account:ObservationState */) {
				if (h > 0x1182) {
					st64(a + 0x10, f + 0x10)
					st64(a + 8, observation_state_data + 8)
					st64(a, 0)
					return r0
				}
				fn_153158(0x1183, h, 0x10015f718, 0x84a5098135c5ae7a /* account:ObservationState */, e)
			}
			r0 = anchor_error_from(s48, 0xbba /* anchor::AccountDiscriminatorMismatch */, j, 0x84a5098135c5ae7a /* account:ObservationState */, e)
			k = ld64(s48 + 8)
			st64(a + 8, ld64(s48))
			st64(a + 0x10, k)
			st64(a, 1)
			f.borrow = f.borrow + 1
			return r0
		}
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		r0 = fn_13e628(s38, s18)
		g = ld64(s38)
		st64(a + 0x10, ld64(s38 + 8))
		st64(a + 8, g)
		st64(a, 1)
		return r0
	}
	r0 = anchor_error_from(s28, 0xbbe /* anchor::AccountNotMutable */, c, d, e)
	g = ld64(s28)
	st64(a + 0x10, ld64(s28 + 8))
	st64(a + 8, g)
	st64(a, 1)
	return r0
}

// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: tick_array_state_data: TickArrayStateAccount
export function fn_51c8(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58
	let g, k: u64
	if (ld8(b + 0x29) != 0) {
		const f = ld64(b + 0x10)
		if (ld64(f + 0x10) == 0) {
			st64(f + 0x10, -1)
			const h = ld64(f + 0x20)
			if (8 > h) {
				r0 = anchor_error_from(s58, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
				k = ld64(s58 + 8)
				st64(a + 8, ld64(s58))
				st64(a + 0x10, k)
				st64(a, 1)
				st64(f + 0x10, ld64(f + 0x10) + 1)
				return r0
			}
			const tick_array_state_data: TickArrayStateAccount = ld64(f + 0x18)
			const j = tick_array_state_data.discriminator
			if (j == 0x2a81f931cd559bc0 /* account:TickArrayState */) {
				if (h > 0x27ff) {
					st64(a + 0x10, f + 0x10)
					st64(a + 8, tick_array_state_data.pool_id)
					st64(a, 0)
					return r0
				}
				fn_153158(0x2800, h, 0x10015f718, 0x2a81f931cd559bc0 /* account:TickArrayState */, e)
			}
			r0 = anchor_error_from(s48, 0xbba /* anchor::AccountDiscriminatorMismatch */, j, 0x2a81f931cd559bc0 /* account:TickArrayState */, e)
			k = ld64(s48 + 8)
			st64(a + 8, ld64(s48))
			st64(a + 0x10, k)
			st64(a, 1)
			st64(f + 0x10, ld64(f + 0x10) + 1)
			return r0
		}
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		r0 = fn_13e628(s38, s18)
		g = ld64(s38)
		st64(a + 0x10, ld64(s38 + 8))
		st64(a + 8, g)
		st64(a, 1)
		return r0
	}
	r0 = anchor_error_from(s28, 0xbbe /* anchor::AccountNotMutable */, c, d, e)
	g = ld64(s28)
	st64(a + 0x10, ld64(s28 + 8))
	st64(a + 8, g)
	st64(a, 1)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value)
// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: pool_state_data: PoolStateAccount
export function fn_53e8(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58
	let g, k: u64
	if (ld8(b + 0x29) != 0) {
		const f = ld64(b + 0x10)
		if (ld64(f + 0x10) == 0) {
			st64(f + 0x10, -1)
			const h = ld64(f + 0x20)
			if (8 > h) {
				r0 = anchor_error_from(s58, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
				k = ld64(s58 + 8)
				st64(a + 8, ld64(s58))
				st64(a + 0x10, k)
				st64(a, 1)
				st64(f + 0x10, ld64(f + 0x10) + 1)
				return r0
			}
			const pool_state_data: PoolStateAccount = ld64(f + 0x18)
			const j = pool_state_data.discriminator
			if (j == 0x46dec3d7f5e3edf7 /* account:PoolState */) {
				if (h > 0x607) {
					st64(a + 0x10, f + 0x10)
					st64(a + 8, pool_state_data.bump)
					st64(a, 0)
					return r0
				}
				fn_153158(0x608, h, 0x10015f718, 0x46dec3d7f5e3edf7 /* account:PoolState */, e)
			}
			r0 = anchor_error_from(s48, 0xbba /* anchor::AccountDiscriminatorMismatch */, j, 0x46dec3d7f5e3edf7 /* account:PoolState */, e)
			k = ld64(s48 + 8)
			st64(a + 8, ld64(s48))
			st64(a + 0x10, k)
			st64(a, 1)
			st64(f + 0x10, ld64(f + 0x10) + 1)
			return r0
		}
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		r0 = fn_13e628(s38, s18)
		g = ld64(s38)
		st64(a + 0x10, ld64(s38 + 8))
		st64(a + 8, g)
		st64(a, 1)
		return r0
	}
	r0 = anchor_error_from(s28, 0xbbe /* anchor::AccountNotMutable */, c, d, e)
	g = ld64(s28)
	st64(a + 0x10, ld64(s28 + 8))
	st64(a + 8, g)
	st64(a, 1)
	return r0
}

// types [heur]: b: AccountInfo (1 of 2 calls pass one, the others an untyped value: fn_28d58)
export function fn_5608(a: u64, b: AccountInfo): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	let k, p, q: u64
	const f = b.owner
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) != 0) {
		const o = anchor_error_from(s50, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const n = ld64(s50 + 8)
		const m = ld64(s50)
		copyr(s40, f, 0x20)
		st64(s20, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
		q = Error_with_pubkeys(s60, m, n, s40, o)
		p = ld64(s60)
		st64(a + 8, ld64(s60 + 8))
		st64(a, p)
		return q
	}
	q = AccountInfo_try_borrow_data(s40, b, g as u32)
	const l = ld64(s40 + 0x10)
	const i = ld64(s40 + 8)
	const h = ld64(s40)
	if (h == 0x800000000000001a /* Ok */) {
		const j = ld64(i + 8)
		if (8 > j) {
			q = anchor_error_from(s80, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, j)
			k = ld64(s80)
			st64(a + 8, ld64(s80 + 8))
			st64(a, k)
			st64(l, ld64(l) - 1)
			return q
		}
		if (ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */) {
			q = anchor_error_from(s80, 0xbba /* anchor::AccountDiscriminatorMismatch */, 0x46dec3d7f5e3edf7 /* account:PoolState */)
			k = ld64(s80)
			st64(a + 8, ld64(s80 + 8))
			st64(a, k)
			st64(l, ld64(l) - 1)
			return q
		}
		st64(a + 8, b)
		st64(a, 2)
		st64(l, ld64(l) - 1)
		return q
	}
	st64(s40, h, i, l)
	q = fn_13e628(s70, s40)
	p = ld64(s70)
	st64(a + 8, ld64(s70 + 8))
	st64(a, p)
	return q
}

export function fn_5ec0(a: u64, b: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	let k, p, q: u64
	const f = ld64(b + 0x18)
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) != 0) {
		const o = anchor_error_from(s50, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const n = ld64(s50 + 8)
		const m = ld64(s50)
		copyr(s40, f, 0x20)
		st64(s20, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
		q = Error_with_pubkeys(s60, m, n, s40, o)
		p = ld64(s60)
		st64(a + 8, ld64(s60 + 8))
		st64(a, p)
		return q
	}
	q = AccountInfo_try_borrow_data(s40, b, g as u32)
	const l = ld64(s40 + 0x10)
	const i = ld64(s40 + 8)
	const h = ld64(s40)
	if (h == 0x800000000000001a /* Ok */) {
		const j = ld64(i + 8)
		if (8 > j) {
			q = anchor_error_from(s80, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, j)
			k = ld64(s80)
			st64(a + 8, ld64(s80 + 8))
			st64(a, k)
			st64(l, ld64(l) - 1)
			return q
		}
		if (ld64(ld64(i)) != 0x998b8061db24963c /* account:TickArrayBitmapExtension */) {
			q = anchor_error_from(s80, 0xbba /* anchor::AccountDiscriminatorMismatch */, 0x998b8061db24963c /* account:TickArrayBitmapExtension */)
			k = ld64(s80)
			st64(a + 8, ld64(s80 + 8))
			st64(a, k)
			st64(l, ld64(l) - 1)
			return q
		}
		st64(a + 8, b)
		st64(a, 2)
		st64(l, ld64(l) - 1)
		return q
	}
	st64(s40, h, i, l)
	q = fn_13e628(s70, s40)
	p = ld64(s70)
	st64(a + 8, ld64(s70 + 8))
	st64(a, p)
	return q
}

// types [heur]: b: AccountInfo (every call passes one: fn_1a610, fn_55688, fn_569a8)
export function fn_6490(a: u64, b: AccountInfo, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let g: u64
	if (b.is_writable != 0) {
		const f: DataCell = b.data
		if (f.borrow == 0) {
			f.borrow = -1
			const h = f.len
			if (h > 7) {
				const i = f.ptr
				let j = ld8(i)
				if (j == 0) {
					j = ld8(i + 1)
					if (j == 0) {
						j = ld8(i + 2)
						if (j == 0) {
							j = ld8(i + 3)
							if (j == 0) {
								j = ld8(i + 4)
								if (j == 0) {
									j = ld8(i + 5)
									if (j == 0) {
										j = ld8(i + 6)
										if (j == 0) {
											j = ld8(i + 7)
											if (j == 0) {
												if (h > 0x607) {
													st64(a + 0x10, f + 0x10)
													st64(a + 8, i + 8)
													st64(a, 0)
													return r0
												}
												fn_153158(0x608, h, 0x10015f748, d, e)
											}
										}
									}
								}
							}
						}
					}
				}
				r0 = anchor_error_from(s48, 0xbb8 /* anchor::AccountDiscriminatorAlreadySet */, j, d, e)
				const k = ld64(s48)
				st64(a + 0x10, ld64(s48 + 8))
				st64(a + 8, k)
				st64(a, 1)
				f.borrow = f.borrow + 1
				return r0
			}
			fn_153158(8, h, 0x10015f730, d, e)
		}
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		r0 = fn_13e628(s38, s18)
		g = ld64(s38)
		st64(a + 0x10, ld64(s38 + 8))
		st64(a + 8, g)
		st64(a, 1)
		return r0
	}
	r0 = anchor_error_from(s28, 0xbbe /* anchor::AccountNotMutable */, c, d, e)
	g = ld64(s28)
	st64(a + 0x10, ld64(s28 + 8))
	st64(a + 8, g)
	st64(a, 1)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
export function fn_66e8(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let g: u64
	if (ld8(b + 0x29) != 0) {
		const f = ld64(b + 0x10)
		if (ld64(f + 0x10) == 0) {
			st64(f + 0x10, -1)
			const h = ld64(f + 0x20)
			if (h > 7) {
				const i = ld64(f + 0x18)
				let j = ld8(i)
				if (j == 0) {
					j = ld8(i + 1)
					if (j == 0) {
						j = ld8(i + 2)
						if (j == 0) {
							j = ld8(i + 3)
							if (j == 0) {
								j = ld8(i + 4)
								if (j == 0) {
									j = ld8(i + 5)
									if (j == 0) {
										j = ld8(i + 6)
										if (j == 0) {
											j = ld8(i + 7)
											if (j == 0) {
												if (h > 0x1182) {
													st64(a + 0x10, f + 0x10)
													st64(a + 8, i + 8)
													st64(a, 0)
													return r0
												}
												fn_153158(0x1183, h, 0x10015f748, d, e)
											}
										}
									}
								}
							}
						}
					}
				}
				r0 = anchor_error_from(s48, 0xbb8 /* anchor::AccountDiscriminatorAlreadySet */, j, d, e)
				const k = ld64(s48)
				st64(a + 0x10, ld64(s48 + 8))
				st64(a + 8, k)
				st64(a, 1)
				st64(f + 0x10, ld64(f + 0x10) + 1)
				return r0
			}
			fn_153158(8, h, 0x10015f730, d, e)
		}
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		r0 = fn_13e628(s38, s18)
		g = ld64(s38)
		st64(a + 0x10, ld64(s38 + 8))
		st64(a + 8, g)
		st64(a, 1)
		return r0
	}
	r0 = anchor_error_from(s28, 0xbbe /* anchor::AccountNotMutable */, c, d, e)
	g = ld64(s28)
	st64(a + 0x10, ld64(s28 + 8))
	st64(a + 8, g)
	st64(a, 1)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
export function fn_6940(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let g: u64
	if (ld8(b + 0x29) != 0) {
		const f = ld64(b + 0x10)
		if (ld64(f + 0x10) == 0) {
			st64(f + 0x10, -1)
			const h = ld64(f + 0x20)
			if (h > 7) {
				const i = ld64(f + 0x18)
				let j = ld8(i)
				if (j == 0) {
					j = ld8(i + 1)
					if (j == 0) {
						j = ld8(i + 2)
						if (j == 0) {
							j = ld8(i + 3)
							if (j == 0) {
								j = ld8(i + 4)
								if (j == 0) {
									j = ld8(i + 5)
									if (j == 0) {
										j = ld8(i + 6)
										if (j == 0) {
											j = ld8(i + 7)
											if (j == 0) {
												if (h > 0x727) {
													st64(a + 0x10, f + 0x10)
													st64(a + 8, i + 8)
													st64(a, 0)
													return r0
												}
												fn_153158(0x728, h, 0x10015f748, d, e)
											}
										}
									}
								}
							}
						}
					}
				}
				r0 = anchor_error_from(s48, 0xbb8 /* anchor::AccountDiscriminatorAlreadySet */, j, d, e)
				const k = ld64(s48)
				st64(a + 0x10, ld64(s48 + 8))
				st64(a + 8, k)
				st64(a, 1)
				st64(f + 0x10, ld64(f + 0x10) + 1)
				return r0
			}
			fn_153158(8, h, 0x10015f730, d, e)
		}
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		r0 = fn_13e628(s38, s18)
		g = ld64(s38)
		st64(a + 0x10, ld64(s38 + 8))
		st64(a + 8, g)
		st64(a, 1)
		return r0
	}
	r0 = anchor_error_from(s28, 0xbbe /* anchor::AccountNotMutable */, c, d, e)
	g = ld64(s28)
	st64(a + 0x10, ld64(s28 + 8))
	st64(a + 8, g)
	st64(a, 1)
	return r0
}

export function fn_8ed0(a: u64, b: AccountInfo): u64 {
	const s100 = fp - 0x100, s108 = fp - 0x108, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170
	let q, r: u64
	const f = b.owner
	if ((memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0) {
		r = anchor_error_from(s170, 0xbc4 /* anchor::AccountNotInitialized */)
		q = ld64(s170)
		st64(a + 0x10, ld64(s170 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s120, b, g as u32)
		const p = ld64(s120 + 0x10)
		const l = ld64(s120 + 8)
		const k = ld64(s120)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s130 + 8, ld64(l + 8))
			st64(s130, m)
			r = fn_10ebf8(s120, s130, 0x800000000000001a /* Ok */)
			const n = ld64(s120 + 0x10)
			const o = ld64(s120 + 8)
			if (ld64(s120) != 0) {
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, 0)
				st64(p, ld64(p) - 1)
				return r
			}
			r = memcpy(a + 0x18, s108, 0x108)
			st64(a + 0x10, n)
			st64(a + 8, o)
			st64(a, b)
			st64(p, ld64(p) - 1)
			return r
		}
		st64(s120, k, l, p)
		r = fn_13e628(s160, s120)
		q = ld64(s160)
		st64(a + 0x10, ld64(s160 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const j = anchor_error_from(s140, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	const i = ld64(s140 + 8)
	const h = ld64(s140)
	copyr(s120, f, 0x20)
	st64(s100, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
	r = Error_with_pubkeys(s150, h, i, s120, j)
	q = ld64(s150)
	st64(a + 0x10, ld64(s150 + 8))
	st64(a + 8, q)
	st64(a, 0)
	return r
}

export function fn_a2c0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s4 = fp - 0x4, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40
	let l, o, p, q: u64
	const f = memcmp(c, d, 0x20)
	let m = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, m)
		st64(a, 2)
		return g
	}
	const h = ld64(b)
	g = common_is_closed(h)
	m = undef
	if (g != 0) {
		st64(a + 8, m)
		st64(a, 2)
		return g
	}
	const i = ld64(h + 0x10)
	if (ld64(i + 0x10) != 0) {
		st64(s20, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		g = fn_13e628(s30, s20)
		const s = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, s)
		return g
	}
	B20: {
		st64(i + 0x10, -1)
		const j = ld64(i + 0x18)
		st64(s20 + 8, ld64(i + 0x20))
		st64(s20, j)
		st64(s20 + 0x10, 0)
		g = fn_13e070(s20, 0x100159308, 8)
		if (g == 0) {
			st16(s4, ld16(b + 0x50))
			g = fn_13e070(s20, s4, 2)
			if (g == 0) {
				st16(s4, ld16(b + 0x52))
				g = fn_13e070(s20, s4, 2)
				if (g == 0) {
					st16(s4, ld16(b + 0x54))
					g = fn_13e070(s20, s4, 2)
					if (g == 0) {
						st16(s4, ld16(b + 0x56))
						g = fn_13e070(s20, s4, 2)
						if (g == 0) {
							st32(s4, ld32(b + 0x48))
							g = fn_13e070(s20, s4, 4)
							if (g == 0) {
								st32(s4, ld32(b + 0x4c))
								g = fn_13e070(s20, s4, 4)
								if (g == 0) {
									g = fn_15de8(b + 8, s20)
									if (g == 0) {
										m = ld64(i + 0x10) + 1
										st64(i + 0x10, m)
										st64(a + 8, m)
										st64(a, 2)
										return g
									}
								}
							}
						}
					}
				}
			}
			const n = g
			if (2 > (g & 3) - 2) {
				break B20
			}
			if ((n & 3) == 0) {
				break B20
			}
			l = ld64(ld64(g + 7))
			if (l == 0) {
				break B20
			}
		} else {
			const k = g
			if (2 > (g & 3) - 2) {
				break B20
			}
			if ((k & 3) == 0) {
				break B20
			}
			l = ld64(ld64(g + 7))
			if (l == 0) {
				break B20
			}
		}
		callx(l, ld64(g - 1), l)
	}
	g = anchor_error_from(s40, 0xbbc /* anchor::AccountDidNotSerialize */, o, p, q)
	m = ld64(s40 + 8)
	const r = ld64(s40)
	st64(i + 0x10, ld64(i + 0x10) + 1)
	if (r == 2) {
		st64(a + 8, m)
		st64(a, 2)
		return g
	}
	st64(a + 8, m)
	st64(a, r)
	return g
}

export function fn_aa20(a: u64, b: u64, c: u64, d: u64): u64 {
	const s4 = fp - 0x4, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40
	let l, o, p, q: u64
	const f = memcmp(c, d, 0x20)
	let m = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, m)
		st64(a, 2)
		return g
	}
	const h = ld64(b)
	g = common_is_closed(h)
	m = undef
	if (g != 0) {
		st64(a + 8, m)
		st64(a, 2)
		return g
	}
	const i = ld64(h + 0x10)
	if (ld64(i + 0x10) != 0) {
		st64(s20, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		g = fn_13e628(s30, s20)
		const s = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, s)
		return g
	}
	B23: {
		st64(i + 0x10, -1)
		const j = ld64(i + 0x18)
		st64(s20 + 8, ld64(i + 0x20))
		st64(s20, j)
		st64(s20 + 0x10, 0)
		g = fn_13e070(s20, 0x100159300, 8)
		if (g == 0) {
			g = fn_13e070(s20, b + 0x74, 1)
			if (g == 0) {
				st16(s4, ld16(b + 0x70))
				g = fn_13e070(s20, s4, 2)
				if (g == 0) {
					g = fn_13e070(s20, b + 8, 0x20)
					if (g == 0) {
						st32(s4, ld32(b + 0x60))
						g = fn_13e070(s20, s4, 4)
						if (g == 0) {
							st32(s4, ld32(b + 0x64))
							g = fn_13e070(s20, s4, 4)
							if (g == 0) {
								st16(s4, ld16(b + 0x72))
								g = fn_13e070(s20, s4, 2)
								if (g == 0) {
									st32(s4, ld32(b + 0x68))
									g = fn_13e070(s20, s4, 4)
									if (g == 0) {
										st32(s4, ld32(b + 0x6c))
										g = fn_13e070(s20, s4, 4)
										if (g == 0) {
											g = fn_13e070(s20, b + 0x28, 0x20)
											if (g == 0) {
												g = fn_15be8(b + 0x48, s20)
												if (g == 0) {
													m = ld64(i + 0x10) + 1
													st64(i + 0x10, m)
													st64(a + 8, m)
													st64(a, 2)
													return g
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
			const n = g
			if (2 > (g & 3) - 2) {
				break B23
			}
			if ((n & 3) == 0) {
				break B23
			}
			l = ld64(ld64(g + 7))
			if (l == 0) {
				break B23
			}
		} else {
			const k = g
			if (2 > (g & 3) - 2) {
				break B23
			}
			if ((k & 3) == 0) {
				break B23
			}
			l = ld64(ld64(g + 7))
			if (l == 0) {
				break B23
			}
		}
		callx(l, ld64(g - 1), l)
	}
	g = anchor_error_from(s40, 0xbbc /* anchor::AccountDidNotSerialize */, o, p, q)
	m = ld64(s40 + 8)
	const r = ld64(s40)
	st64(i + 0x10, ld64(i + 0x10) + 1)
	if (r == 2) {
		st64(a + 8, m)
		st64(a, 2)
		return g
	}
	st64(a + 8, m)
	st64(a, r)
	return g
}

export function fn_af28(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let l, p, q, r: u64
	const f = memcmp(c, d, 0x20)
	let n = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	const h = ld64(b)
	g = common_is_closed(h)
	n = undef
	if (g != 0) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	const i = ld64(h + 0x10)
	if (ld64(i + 0x10) != 0) {
		st64(s28, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		g = fn_13e628(s38, s28)
		const t = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, t)
		return g
	}
	B25: {
		st64(i + 0x10, -1)
		const j = ld64(i + 0x18)
		st64(s28 + 8, ld64(i + 0x20))
		st64(s28, j)
		st64(s28 + 0x10, 0)
		g = fn_13e070(s28, 0x100159340, 8)
		if (g == 0) {
			g = fn_13e070(s28, b + 8, 0x20)
			if (g == 0) {
				g = fn_13e070(s28, b + 0x28, 0x20)
				if (g == 0) {
					st32(s10, ld32(b + 0xa8))
					g = fn_13e070(s28, s10, 4)
					if (g == 0) {
						st8(s10, ld8(b + 0xac))
						g = fn_13e070(s28, s10, 1)
						if (g == 0) {
							st64(s10, ld64(b + 0x48))
							g = fn_13e070(s28, s10, 8)
							if (g == 0) {
								st64(s10, ld64(b + 0x50))
								g = fn_13e070(s28, s10, 8)
								if (g == 0) {
									st64(s10, ld64(b + 0x58))
									g = fn_13e070(s28, s10, 8)
									if (g == 0) {
										st64(s10, ld64(b + 0x60))
										g = fn_13e070(s28, s10, 8)
										if (g == 0) {
											st64(s10, ld64(b + 0x68))
											g = fn_13e070(s28, s10, 8)
											if (g == 0) {
												st64(s10, ld64(b + 0x70))
												g = fn_13e070(s28, s10, 8)
												if (g == 0) {
													const m = ld64(b + 0x78)
													st64(s10 + 8, ld64(b + 0x80))
													st64(s10, m)
													g = fn_13e070(s28, s10, 0x10)
													if (g == 0) {
														g = fn_15cc8(b + 0x88, s28)
														if (g == 0) {
															n = ld64(i + 0x10) + 1
															st64(i + 0x10, n)
															st64(a + 8, n)
															st64(a, 2)
															return g
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
			const o = g
			if (2 > (g & 3) - 2) {
				break B25
			}
			if ((o & 3) == 0) {
				break B25
			}
			l = ld64(ld64(g + 7))
			if (l == 0) {
				break B25
			}
		} else {
			const k = g
			if (2 > (g & 3) - 2) {
				break B25
			}
			if ((k & 3) == 0) {
				break B25
			}
			l = ld64(ld64(g + 7))
			if (l == 0) {
				break B25
			}
		}
		callx(l, ld64(g - 1), l)
	}
	g = anchor_error_from(s48, 0xbbc /* anchor::AccountDidNotSerialize */, p, q, r)
	n = ld64(s48 + 8)
	const s = ld64(s48)
	st64(i + 0x10, ld64(i + 0x10) + 1)
	if (s == 2) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	st64(a + 8, n)
	st64(a, s)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
export function fn_b4e0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let l, r, s, t: u64
	const f = memcmp(c, d, 0x20)
	let p = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, p)
		st64(a, 2)
		return g
	}
	const h = ld64(b)
	g = common_is_closed(h)
	p = undef
	if (g != 0) {
		st64(a + 8, p)
		st64(a, 2)
		return g
	}
	const i = ld64(h + 0x10)
	if (ld64(i + 0x10) != 0) {
		st64(s28, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		g = fn_13e628(s38, s28)
		const v = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, v)
		return g
	}
	B26: {
		st64(i + 0x10, -1)
		const j = ld64(i + 0x18)
		st64(s28 + 8, ld64(i + 0x20))
		st64(s28, j)
		st64(s28 + 0x10, 0)
		g = fn_13e070(s28, 0x100159318, 8)
		if (g == 0) {
			g = fn_13e070(s28, b + 0x118, 1)
			if (g == 0) {
				g = fn_13e070(s28, b + 8, 0x20)
				if (g == 0) {
					g = fn_13e070(s28, b + 0x28, 0x20)
					if (g == 0) {
						st32(s10, ld32(b + 0x110))
						g = fn_13e070(s28, s10, 4)
						if (g == 0) {
							st32(s10, ld32(b + 0x114))
							g = fn_13e070(s28, s10, 4)
							if (g == 0) {
								const m = ld64(b + 0x48)
								st64(s10 + 8, ld64(b + 0x50))
								st64(s10, m)
								g = fn_13e070(s28, s10, 0x10)
								if (g == 0) {
									const n = ld64(b + 0x58)
									st64(s10 + 8, ld64(b + 0x60))
									st64(s10, n)
									g = fn_13e070(s28, s10, 0x10)
									if (g == 0) {
										const o = ld64(b + 0x68)
										st64(s10 + 8, ld64(b + 0x70))
										st64(s10, o)
										g = fn_13e070(s28, s10, 0x10)
										if (g == 0) {
											st64(s10, ld64(b + 0x78))
											g = fn_13e070(s28, s10, 8)
											if (g == 0) {
												st64(s10, ld64(b + 0x80))
												g = fn_13e070(s28, s10, 8)
												if (g == 0) {
													g = fn_16008(b + 0x88, s28)
													if (g == 0) {
														st64(s10, ld64(b + 0xd0))
														g = fn_13e070(s28, s10, 8)
														if (g == 0) {
															g = fn_15a08(b + 0xd8, s28)
															if (g == 0) {
																p = ld64(i + 0x10) + 1
																st64(i + 0x10, p)
																st64(a + 8, p)
																st64(a, 2)
																return g
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
			const q = g
			if (2 > (g & 3) - 2) {
				break B26
			}
			if ((q & 3) == 0) {
				break B26
			}
			l = ld64(ld64(g + 7))
			if (l == 0) {
				break B26
			}
		} else {
			const k = g
			if (2 > (g & 3) - 2) {
				break B26
			}
			if ((k & 3) == 0) {
				break B26
			}
			l = ld64(ld64(g + 7))
			if (l == 0) {
				break B26
			}
		}
		callx(l, ld64(g - 1), l)
	}
	g = anchor_error_from(s48, 0xbbc /* anchor::AccountDidNotSerialize */, r, s, t)
	p = ld64(s48 + 8)
	const u = ld64(s48)
	st64(i + 0x10, ld64(i + 0x10) + 1)
	if (u == 2) {
		st64(a + 8, p)
		st64(a, 2)
		return g
	}
	st64(a + 8, p)
	st64(a, u)
	return g
}

export function fn_c7c8(a: u64, b: u64): u64 {
	const s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8
	let r, s: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0) {
		s = anchor_error_from(sf8, 0xbc4 /* anchor::AccountNotInitialized */)
		r = ld64(sf8)
		st64(a + 8, ld64(sf8 + 8))
		st64(a, r)
		st8(a + 0xac, 2)
		return s
	}
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(sa8, b, g as u32)
		const q = ld64(s98)
		const l = ld64(sa8 + 8)
		const k = ld64(sa8)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(sb8 + 8, ld64(l + 8))
			st64(sb8, m)
			s = fn_10c648(sa8, sb8, 0x800000000000001a /* Ok */)
			const o = ld64(sa8 + 8)
			const p = ld64(sa8)
			const n = ld8(s88 + 0x84)
			if (n == 2) {
				st64(a + 8, o)
				st64(a, p)
				st8(a + 0xac, 2)
				st64(q, ld64(q) - 1)
				return s
			}
			s = memcpy(a + 0x18, s98, 0x94)
			st16(a + 0xad, ld16(s88 + 0x85))
			st8(a + 0xaf, ld8(s88 + 0x87))
			st8(a + 0xac, n)
			st64(a + 0x10, o)
			st64(a + 8, p)
			st64(a, b)
			st64(q, ld64(q) - 1)
			return s
		}
		st64(sa8, k, l, q)
		s = fn_13e628(se8, sa8)
		r = ld64(se8)
		st64(a + 8, ld64(se8 + 8))
		st64(a, r)
		st8(a + 0xac, 2)
		return s
	}
	const j = anchor_error_from(sc8, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	const i = ld64(sc8 + 8)
	const h = ld64(sc8)
	copyr(sa8, f, 0x20)
	st64(s88, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
	s = Error_with_pubkeys(sd8, h, i, sa8, j)
	r = ld64(sd8)
	st64(a + 8, ld64(sd8 + 8))
	st64(a, r)
	st8(a + 0xac, 2)
	return s
}

export function fn_ded0(a: u64, b: u64): u64 {
	const s38 = fp - 0x38, s40 = fp - 0x40, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8
	let q, r: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0) {
		r = anchor_error_from(sa8, 0xbc4 /* anchor::AccountNotInitialized */)
		q = ld64(sa8)
		st64(a + 0x10, ld64(sa8 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s58, b, g as u32)
		const p = ld64(s58 + 0x10)
		const l = ld64(s58 + 8)
		const k = ld64(s58)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s68 + 8, ld64(l + 8))
			st64(s68, m)
			r = fn_10bf30(s58, s68, 0x800000000000001a /* Ok */)
			const n = ld64(s58 + 0x10)
			const o = ld64(s58 + 8)
			if (ld64(s58) != 0) {
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, 0)
				st64(p, ld64(p) - 1)
				return r
			}
			r = memcpy(a + 0x18, s40, 0x40)
			st64(a + 0x10, n)
			st64(a + 8, o)
			st64(a, b)
			st64(p, ld64(p) - 1)
			return r
		}
		st64(s58, k, l, p)
		r = fn_13e628(s98, s58)
		q = ld64(s98)
		st64(a + 0x10, ld64(s98 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const j = anchor_error_from(s78, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	const i = ld64(s78 + 8)
	const h = ld64(s78)
	copyr(s58, f, 0x20)
	st64(s38, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
	r = Error_with_pubkeys(s88, h, i, s58, j)
	q = ld64(s88)
	st64(a + 0x10, ld64(s88 + 8))
	st64(a + 8, q)
	st64(a, 0)
	return r
}

export function fn_e480(a: u64, b: u64, c: u64, d: u64, r0: u64, r7: u64): u64 {
	const s18 = fp - 0x18, s30 = fp - 0x30, s48 = fp - 0x48, s50 = fp - 0x50
	let n: u64
	st64(s48 + 0x10, b)
	st64(s50, a)
	let f = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
	st64(s48, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
	if (c != 0) {
		let g = 0
		while (true) {
			fn_132b38(s30, g)
			d = undef
			f = 0x14
			st64(s48 + 8, 0x14)
			const h = ld64(s30 + 0x10)
			r0 = 0
			if (h > c) {
				break
			}
			const i = ld64(s30 + 8)
			const j = ld64(s30)
			if (j > i) {
				fn_153160(j, i, 0x10015f7a8, d)
			}
			if (i > c) {
				fn_153158(i, c, 0x10015f7a8, d)
			}
			fn_132ff0(s18, ld64(s48 + 0x10) + j, i - j)
			d = undef
			const l = ld16(s18 + 8)
			const k = ld64(s18)
			if (k != 0x800000000000001a /* Ok */) {
				d = ld64(s18 + 0x10)
				f = ld32(s18 + 0xc)
				r0 = ld16(s18 + 0xa)
				st64(s48, k, l)
				break
			}
			if (0x1b >= l) {
				f = (1 << (l & 0x3f)) & 0x7fd5658
				if (f != 0) {
					if (h >= i) {
						if (h - i != 2) {
							st64(s48, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
							f = r7 >> 0x20
							r0 = r7 >> 0x10
							st64(s48 + 8, r7)
							break
						}
						r7 = ld64(s48 + 0x10) + i
						f = h + ld16(r7)
						r0 = 0
						d = h > f
						g = d != 0 ? 0xffffffffffffffff : f
						if (c > g) {
							continue
						}
						break
					}
					fn_153160(i, h, 0x10015f7c0, d, k)
				}
				const m = (1 << (l & 0x3f)) & 0x802a9a4
				r0 = 0
				st64(s48, 0x8000000000000000)
				if (m != 0) {
					break
				}
				if (l == 1) {
					if (h >= i) {
						let o = ld64(s48 + 0x10) + i
						if (h - i == 2) {
							o = h + ld16(o)
							d = h > o
							const q = d != 0 ? 0xffffffffffffffff : o
							if (q > c) {
								n = ld64(s50)
								st64(n + 0x10, d)
								st64(n + 8, o)
								st64(n, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
								return 0
							}
							const r = ld64(s50)
							if (q - h != 0x6c) {
								st64(r, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
								return 0
							}
							st64(r + 8, ld64(s48 + 0x10) + h)
							st64(r, 0x800000000000001a /* Ok */)
							return 0
						}
						n = ld64(s50)
						st64(n + 0x10, d)
						st64(n + 8, o)
						st64(n, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
						return 0
					}
					fn_153160(i, h, 0x10015f778, d, m)
				}
			}
			f = 0x30
			st64(s48 + 8, 0x30)
			r0 = l
			st64(s48, 0x8000000000000000)
			break
		}
	}
	r0 = ((r0 as u16) << 0x10) | (ld64(s48 + 8) as u16)
	const p = ld64(s48)
	n = ld64(s50)
	st64(n + 0x10, d)
	st64(n + 8, (f << 0x20) | r0)
	st64(n, p)
	return r0
}

export function fn_f5d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, b, c, d, e)
}

export function fn_f680(a: u64, r0: u64): u64 {
	const f = ld64(a + 0x18)
	if (f == 0) {
		return r0
	}
	let g = ld64(a)
	r0 = ld64(a + 0x10)
	const h = g > r0 ? 0 : g
	const j = r0 - h
	const i = g
	const k = f - (g - j)
	let q = k > f ? 0 : k
	g = f > g - j ? g : j + f
	const l = ld64(a + 8)
	if (g != j) {
		let n = g - j
		let m = l + ((r0 << 4) - (h << 4)) + 8
		do {
			r0 = ld64(m)
			st64(r0, ld64(r0) + 1)
			m = m + 0x10
			n = n - 1
		} while (n != 0)
	}
	if (i - j >= f) {
		return r0
	}
	let o = l + 8
	while (true) {
		const p = ld64(o)
		st64(p, ld64(p) + 1)
		o = o + 0x10
		q = q - 1
		if (q == 0) {
			return r0
		}
	}
}

export function fn_14b50(a: u64, b: u64): u64 {
	let k, l: u64
	const f = ld64(a)
	let n = fn_15168(a, b)
	const g = ld64(a + 0x18)
	const h = ld64(a + 0x10)
	if (f - g >= h) {
		return n
	}
	const j = ld64(a)
	const i = g - (f - h)
	if (i >= f - h) {
		k = ld64(a + 8)
		l = j - (f - h)
		n = memmove(k + (l << 4), k + (h << 4), f - h << 4)
		st64(a + 0x10, l)
		return n
	}
	if (j - f >= i) {
		const m = ld64(a + 8)
		return memcpy(m + (f << 4), m, i << 4)
	}
	k = ld64(a + 8)
	l = j - (f - h)
	n = memmove(k + (l << 4), k + (h << 4), f - h << 4)
	st64(a + 0x10, l)
	return n
}

export function fn_14c70(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 {
	const f = ld64(b + 0x18)
	if (f == 0) {
		st64(a + 8, d)
		st64(a, 0)
		return r0
	}
	st64(b + 0x18, f - 1)
	const h = ld64(b)
	const g = ld64(b + 0x10)
	r0 = h > g + 1 ? 0 : h
	st64(b + 0x10, g + 1 - r0)
	const i = ld64(b + 8) + (g << 4)
	const j = ld64(i)
	st64(a + 8, ld64(i + 8))
	st64(a, j)
	return r0
}

export function fn_15960(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return str_fmt_152a30(ld64(a + 8), ld64(a + 0x10), b, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (value)
export function fn_15a08(a: u64, b: u64): u64 {
	const s8 = fp - 0x8
	st64(s8, ld64(a))
	let f = fn_13e070(b, s8, 8)
	if (f != 0) {
		return f
	}
	st64(s8, ld64(a + 8))
	f = fn_13e070(b, s8, 8)
	if (f != 0) {
		return f
	}
	st64(s8, ld64(a + 0x10))
	f = fn_13e070(b, s8, 8)
	if (f != 0) {
		return f
	}
	st64(s8, ld64(a + 0x18))
	f = fn_13e070(b, s8, 8)
	if (f != 0) {
		return f
	}
	st64(s8, ld64(a + 0x20))
	f = fn_13e070(b, s8, 8)
	if (f != 0) {
		return f
	}
	st64(s8, ld64(a + 0x28))
	f = fn_13e070(b, s8, 8)
	if (f != 0) {
		return f
	}
	st64(s8, ld64(a + 0x30))
	f = fn_13e070(b, s8, 8)
	return f != 0 ? f : 0
}

export function fn_15be8(a: u64, b: u64): u64 {
	const s8 = fp - 0x8
	st64(s8, ld64(a))
	let f = fn_13e070(b, s8, 8)
	if (f != 0) {
		return f
	}
	st64(s8, ld64(a + 8))
	f = fn_13e070(b, s8, 8)
	if (f != 0) {
		return f
	}
	st64(s8, ld64(a + 0x10))
	f = fn_13e070(b, s8, 8)
	return f != 0 ? f : 0
}

export function fn_161d8(a: u64): u64 {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0xd8) & -8 : 0x300007f28
	if (g > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		const h = ld64(a + 0x20)
		st64(g + 0x18, ld64(a + 0x18))
		st64(g + 0x10, ld64(a + 0x10))
		st64(g + 8, ld64(a + 8))
		st64(g, ld64(a))
		st64(g + 0x20, h)
		memcpy(g + 0x28, a + 0x28, 0xb0)
		return g
	}
	alloc_handle_alloc_error(8, 0xd8)
}

export function fn_16330(a: u64): u64 {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x80) & -8 : 0x300007f80
	if (g > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		const h = ld64(a + 0x58)
		memcpy(g, a, 0x58)
		st64(g + 0x58, h)
		copy(g + 0x60, a + 0x60, 0x20)
		return g
	}
	alloc_handle_alloc_error(8, 0x80)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (points to it)
export function fn_166b8(a: u64, b: u64) {
	let n: u64
	const g = ld64(b)
	const f = ld64(b + 8)
	let h = f
	let m = g
	if (8 > f) {
		n = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		st64(b, m + h, 0)
		st64(a + 8, n)
		st64(a, 1)
	} else {
		m = g + 8
		h = f - 8
		if (8 > h) {
			n = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
			st64(b, m + h, 0)
			st64(a + 8, n)
			st64(a, 1)
		} else {
			m = g + 0x10
			h = f - 0x10
			if (8 > h) {
				n = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
				st64(b, m + h, 0)
				st64(a + 8, n)
				st64(a, 1)
			} else {
				m = g + 0x18
				h = f - 0x18
				if (8 > h) {
					n = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
					st64(b, m + h, 0)
					st64(a + 8, n)
					st64(a, 1)
				} else {
					const l = ld64(g)
					const k = ld64(g + 8)
					const j = ld64(g + 0x10)
					const i = ld64(g + 0x18)
					st64(b + 8, f - 0x20)
					st64(b, g + 0x20)
					st64(a + 0x20, i)
					st64(a + 0x18, j)
					st64(a + 0x10, k)
					st64(a + 8, l)
					st64(a, 0)
				}
			}
		}
	}
}

export function fn_16828(a: u64, b: u64) {
	let p: u64
	const g = ld64(b)
	const f = ld64(b + 8)
	let h = f
	let o = g
	if (8 > f) {
		p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		st64(b, o + h, 0)
		st64(a + 8, p)
		st64(a, 1)
	} else {
		o = g + 8
		h = f - 8
		if (8 > h) {
			p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
			st64(b, o + h, 0)
			st64(a + 8, p)
			st64(a, 1)
		} else {
			o = g + 0x10
			h = f - 0x10
			if (8 > h) {
				p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
				st64(b, o + h, 0)
				st64(a + 8, p)
				st64(a, 1)
			} else {
				o = g + 0x18
				h = f - 0x18
				if (8 > h) {
					p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
					st64(b, o + h, 0)
					st64(a + 8, p)
					st64(a, 1)
				} else {
					o = g + 0x20
					h = f - 0x20
					if (8 > h) {
						p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
						st64(b, o + h, 0)
						st64(a + 8, p)
						st64(a, 1)
					} else {
						o = g + 0x28
						h = f - 0x28
						if (8 > h) {
							p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
							st64(b, o + h, 0)
							st64(a + 8, p)
							st64(a, 1)
						} else {
							o = g + 0x30
							h = f - 0x30
							if (8 > h) {
								p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
								st64(b, o + h, 0)
								st64(a + 8, p)
								st64(a, 1)
							} else {
								const q = ld64(g)
								const n = ld64(g + 8)
								const m = ld64(g + 0x10)
								const l = ld64(g + 0x18)
								const k = ld64(g + 0x20)
								const j = ld64(g + 0x28)
								const i = ld64(g + 0x30)
								st64(b + 8, f - 0x38)
								st64(b, g + 0x38)
								st64(a + 0x38, i)
								st64(a + 0x30, j)
								st64(a + 0x28, k)
								st64(a + 0x20, l)
								st64(a + 0x18, m)
								st64(a + 0x10, n)
								st64(a + 8, q)
								st64(a, 0)
							}
						}
					}
				}
			}
		}
	}
}

export function fn_16bb8(a: u64, b: u64, r0: u64): u64 {
	const g = ld64(b)
	const f = ld64(b + 8)
	let h = f
	let l = g
	if (8 > f) {
		r0 = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		st64(b, l + h, 0)
		st64(a + 8, r0)
		st64(a, 1)
		return r0
	}
	l = g + 8
	h = f - 8
	if (8 > h) {
		r0 = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		st64(b, l + h, 0)
		st64(a + 8, r0)
		st64(a, 1)
		return r0
	}
	l = g + 0x10
	h = f - 0x10
	if (8 > h) {
		r0 = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		st64(b, l + h, 0)
		st64(a + 8, r0)
		st64(a, 1)
		return r0
	}
	const k = ld64(g)
	const j = ld64(g + 8)
	const i = ld64(g + 0x10)
	st64(b + 8, f - 0x18)
	st64(b, g + 0x18)
	st64(a + 0x18, i)
	st64(a + 0x10, j)
	st64(a + 8, k)
	st64(a, 0)
	return r0
}

export function fn_16cf0(a: u64, b: u64) {
	let p: u64
	const g = ld64(b)
	const f = ld64(b + 8)
	let h = f
	let o = g
	if (8 > f) {
		p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		st64(b, o + h, 0)
		st64(a + 8, p)
		st64(a, 1)
	} else {
		o = g + 8
		h = f - 8
		if (8 > h) {
			p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
			st64(b, o + h, 0)
			st64(a + 8, p)
			st64(a, 1)
		} else {
			o = g + 0x10
			h = f - 0x10
			if (8 > h) {
				p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
				st64(b, o + h, 0)
				st64(a + 8, p)
				st64(a, 1)
			} else {
				o = g + 0x18
				h = f - 0x18
				if (8 > h) {
					p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
					st64(b, o + h, 0)
					st64(a + 8, p)
					st64(a, 1)
				} else {
					o = g + 0x20
					h = f - 0x20
					if (8 > h) {
						p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
						st64(b, o + h, 0)
						st64(a + 8, p)
						st64(a, 1)
					} else {
						o = g + 0x28
						h = f - 0x28
						if (8 > h) {
							p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
							st64(b, o + h, 0)
							st64(a + 8, p)
							st64(a, 1)
						} else {
							o = g + 0x30
							h = f - 0x30
							if (8 > h) {
								p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
								st64(b, o + h, 0)
								st64(a + 8, p)
								st64(a, 1)
							} else {
								o = g + 0x38
								h = f - 0x38
								if (8 > h) {
									p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
									st64(b, o + h, 0)
									st64(a + 8, p)
									st64(a, 1)
								} else {
									const r = ld64(g)
									const q = ld64(g + 8)
									const n = ld64(g + 0x10)
									const m = ld64(g + 0x18)
									const l = ld64(g + 0x20)
									const k = ld64(g + 0x28)
									const j = ld64(g + 0x30)
									const i = ld64(g + 0x38)
									st64(b + 8, f - 0x40)
									st64(b, g + 0x40)
									st64(a + 0x40, i)
									st64(a + 0x38, j)
									st64(a + 0x30, k)
									st64(a + 0x28, l)
									st64(a + 0x20, m)
									st64(a + 0x18, n)
									st64(a + 0x10, q)
									st64(a + 8, r)
									st64(a, 0)
								}
							}
						}
					}
				}
			}
		}
	}
}

export function fn_16f60(a: u64, b: u64) {
	let p: u64
	const g = ld64(b)
	const f = ld64(b + 8)
	let h = f
	let o = g
	if (0x10 > f) {
		p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		st64(b, o + h, 0)
		st64(a + 8, p)
		st64(a, 1)
	} else {
		h = f
		o = g
		if ((f & -8) == 0x10) {
			p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
			st64(b, o + h, 0)
			st64(a + 8, p)
			st64(a, 1)
		} else {
			o = g + 0x18
			h = f - 0x18
			if (0x10 > h) {
				p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
				st64(b, o + h, 0)
				st64(a + 8, p)
				st64(a, 1)
			} else if ((h & -8) == 0x10) {
				p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
				st64(b, o + h, 0)
				st64(a + 8, p)
				st64(a, 1)
			} else {
				o = g + 0x30
				h = f - 0x30
				if (0x10 > h) {
					p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
					st64(b, o + h, 0)
					st64(a + 8, p)
					st64(a, 1)
				} else if ((h & -8) == 0x10) {
					p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
					st64(b, o + h, 0)
					st64(a + 8, p)
					st64(a, 1)
				} else {
					const q = ld64(g + 8)
					const r = ld64(g)
					const s = ld64(g + 0x10)
					const k = ld64(g + 0x20)
					const l = ld64(g + 0x18)
					const n = ld64(g + 0x28)
					const i = ld64(g + 0x38)
					const j = ld64(g + 0x30)
					const m = ld64(g + 0x40)
					st64(b + 8, f - 0x48)
					st64(b, g + 0x48)
					st64(a + 0x40, i)
					st64(a + 0x38, j)
					st64(a + 0x28, k)
					st64(a + 0x20, l)
					st64(a + 0x10, q)
					st64(a + 8, r)
					st64(a + 0x48, m)
					st64(a + 0x30, n)
					st64(a + 0x18, s)
					st64(a, 0)
				}
			}
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_17748(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s10 = fp - 0x10, s40 = fp - 0x40, s58 = fp - 0x58, s59 = fp - 0x59, s78 = fp - 0x78, s79 = fp - 0x79
	const g = ld64(b)
	const f = ld64(b + 8)
	if (f == 0) {
		r0 = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		st64(b, g)
		st64(a + 8, r0)
		st8(a, 1)
		return r0
	}
	const h = ld8(g)
	st64(b + 8, f - 1)
	st64(b, g + 1)
	st8(s79, h)
	if (h == 0) {
		st8(a + 1, 2)
		st8(a, 0)
		return r0
	}
	if (h == 1) {
		if (f == 1) {
			r0 = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
			st64(b, g + 1)
			st64(a + 8, r0)
			st8(a, 1)
			return r0
		}
		const i = ld8(g + 1)
		st64(b + 8, f - 2)
		st64(b, g + 2)
		st8(s59, i)
		if (2 > i) {
			st8(a + 1, i)
			st8(a, 0)
			return r0
		}
		st64(s40, 0x10015f910)
		st64(s40 + 0x10, s10)
		st64(s10, s59, fn_154c88)
		st64(s40 + 0x20, 0)
		st64(s40 + 8, 1)
		st64(s40 + 0x18, 1)
		// fmt "Invalid bool representation: {}" {} = i [fn_154c88]
		fn_14de10(s58, s40, h, d, e)
		r0 = fn_f128(s58)
		st64(a + 8, r0)
		st8(a, 1)
		return r0
	}
	st64(s40, 0x10015fab0)
	st64(s40 + 0x10, s58)
	st64(s58, s79, fn_154c88)
	st64(s40 + 0x20, 0)
	st64(s40 + 8, 2)
	st64(s40 + 0x18, 1)
	// fmt "Invalid Option representation: {}. The first byte must be 0 or 1" {} = h [fn_154c88]
	fn_14de10(s78, s40, h, d, e)
	r0 = fn_f128(s78)
	st64(a + 8, r0)
	st8(a, 1)
	return r0
}

export function fn_181f8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10
	const f = ld64(b + 8)
	if (f != 0) {
		st64(b + 8, f - 1)
		const h: AccountInfo = ld64(b)
		st64(b, h + 0x30)
		return fn_c7c8(a, h)
	}
	const i = anchor_error_from(s10, 0xbbd /* anchor::AccountNotEnoughKeys */, f, d, e)
	const g = ld64(s10)
	st64(a + 8, ld64(s10 + 8))
	st64(a, g)
	st8(a + 0xac, 2)
	return i
}

export function fn_1c850(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s70 = fp - 0x70, s88 = fp - 0x88, sa0 = fp - 0xa0, sc0 = fp - 0xc0, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se0 = fp - 0xe0, s100 = fp - 0x100, s120 = fp - 0x120, s140 = fp - 0x140, s170 = fp - 0x170, s178 = fp - 0x178, s188 = fp - 0x188, s190 = fp - 0x190, s198 = fp - 0x198, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s218 = fp - 0x218, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s308 = fp - 0x308, s350 = fp - 0x350, s3a8 = fp - 0x3a8, s3f0 = fp - 0x3f0, s3f8 = fp - 0x3f8, sfc0 = fp - 0xfc0, sff0 = fp - 0xff0, s1000 = fp - 0x1000
	let f, g, i, j, k, l, bq, br, bs, bt: u64
	B7: {
		st64(s350 + 0x20, d)
		st64(s3f0 + 0x20, c)
		st64(s350 + 0x40, b)
		st64(s308 + 0x28, a)
		k = ld64(e - 0xf50)
		j = ld64(e - 0xf58)
		st64(s3a8 + 8, ld64(e - 0xf08))
		st64(s3a8 + 0x40, ld64(e - 0xf10))
		st64(s3a8, ld64(e - 0xf18))
		st64(s308, ld64(e - 0xf20))
		st64(s308 + 8, ld64(e - 0xf28))
		st64(s308 + 0x20, ld64(e - 0xf30))
		st64(s308 + 0x10, ld64(e - 0xf38))
		st64(s3a8 + 0x30, ld64(e - 0xf40))
		st64(s3a8 + 0x38, ld64(e - 0xf48))
		st64(s3f0 + 0x10, ld64(e - 0xf60))
		st64(s3a8 + 0x20, ld64(e - 0xf68))
		st64(s3a8 + 0x28, ld64(e - 0xf70))
		f = ld64(e - 0xf78)
		st64(s350 + 0x18, ld64(e - 0xf88))
		st64(s3f0 + 0x40, ld64(e - 0xf90))
		st64(s350 + 0x10, ld64(e - 0xfa0))
		st64(s350 + 0x30, ld64(e - 0xfa8))
		st64(s3f0 + 0x28, ld64(e - 0xfb0))
		st64(s3a8 + 0x48, ld64(e - 0xfb8))
		st64(s3a8 + 0x50, ld64(e - 0xfc0))
		copyr(s350, e - 0xfd0, 0x10)
		st64(s3a8 + 0x18, ld64(e - 0xfd8))
		st64(s350 + 0x28, ld64(e - 0xfe0))
		st64(s350 + 0x38, ld64(e - 0xfe8))
		l = ld64(e - 0xff0)
		st64(s3f0 + 0x30, ld64(e - 0xff8))
		st64(s3f0 + 0x38, ld64(e - 0x1000))
		g = ld64(e - 0xf80)
		st64(s308 + 0x18, f)
		if (g != 0 && ld32(g + 0x34) == 1) {
			copyr(s100, g + 0x38, 0x20)
			r0 = memcmp(0x100159400 /* key 2Yq4T3mPNfjtEyTxSbRjRKqLf1pwbTasuCQrWe6QpM7x */, s100, 0x20)
			d = undef
			e = undef
			i = (r0 as u32) == 0
			f = ld64(s308 + 0x18)
			if (f == 0) {
				break B7
			}
			r0 = r0 as u32
			if (r0 == 0) {
				break B7
			}
		} else {
			i = 0
			if (f == 0) {
				break B7
			}
		}
		i = 0
		if (ld32(f + 0x34) == 1) {
			copyr(s100, f + 0x38, 0x20)
			const h = memcmp(0x100159400 /* key 2Yq4T3mPNfjtEyTxSbRjRKqLf1pwbTasuCQrWe6QpM7x */, s100, 0x20)
			f = undef
			d = undef
			e = undef
			r0 = h as u32
			i = r0 == 0
		}
	}
	st64(s3f0 + 0x18, i)
	st64(s268, j, k)
	const m = ld64(l)
	let r = fn_53e8(s100, m, f, d, e, r0)
	let n = ld64(s100 + 0x10)
	let o = ld64(s100 + 8)
	if (ld64(s100) != 1) {
		st64(s258, o, n)
		const p = ld8(o + 0x17d)
		st64(s3a8 + 0x10, n)
		if ((p & 1) == 0) {
			st64(s3f0, m, o)
			const q = ld64(s308 + 0x10)
			r = fn_75fc8(s288, q, ld64(s308 + 0x20), undef, r)
			n = ld64(s288 + 8)
			o = ld64(s288)
			if (o == 2) {
				r = fn_756a8(s298, ld64(s308 + 8), q, ld16(ld64(s3f0 + 8) + 0xe3))
				n = ld64(s298 + 8)
				o = ld64(s298)
				if (o != 2) {
					bs = ld64(s3a8 + 0x10)
					st64(bs, ld64(bs) + 1)
					bt = ld64(s308 + 0x28)
					st64(bt + 8, n)
					st64(bt, o)
					return r
				}
				r = fn_756a8(s2a8, ld64(s308), ld64(s308 + 0x20), ld16(ld64(s3f0 + 8) + 0xe3))
				n = ld64(s2a8 + 8)
				o = ld64(s2a8)
				if (o != 2) {
					bs = ld64(s3a8 + 0x10)
					st64(bs, ld64(bs) + 1)
					bt = ld64(s308 + 0x28)
					st64(bt + 8, n)
					st64(bt, o)
					return r
				}
				const s: AccountInfo = ld64(ld64(s350 + 0x40))
				const t: LamportsCell = s.lamports
				const z = s.key
				const aq = ld64(s3f0)
				rc_inc(t)
				const u: DataCell = s.data
				rc_inc(u)
				const y = s.owner
				const x = s.rent_epoch
				const w = s.is_signer
				const v = s.is_writable
				st64(s3f8, s)
				st8(s20 + 2, s.executable)
				st8(s20, w, v)
				st64(s48, z, t, u, y, x)
				const aa: AccountInfo = ld64(ld64(s350 + 0x38))
				const ab: LamportsCell = aa.lamports
				const ah = aa.key
				rc_inc(ab)
				const ac: DataCell = aa.data
				rc_inc(ac)
				const ag = aa.owner
				const af = aa.rent_epoch
				const ae = aa.is_signer
				const ad = aa.is_writable
				st8(s170 + 2, aa.executable)
				st8(s170, ae, ad)
				st64(s198, ah, ab, ac, ag, af)
				const ai: AccountInfo = ld64(ld64(s350 + 0x30))
				const aj: LamportsCell = ai.lamports
				const ap = ai.key
				rc_inc(aj)
				const ak: DataCell = ai.data
				rc_inc(ak)
				const ao = ai.owner
				const an = ai.rent_epoch
				const am = ai.is_signer
				const al = ai.is_writable
				st64(s350 + 0x38, ai)
				st8(sd8 + 2, ai.executable)
				st8(sd8, am, al)
				st64(s100, ap, aj, ak, ao, an)
				const ar = ld64(aq)
				copyr(s218, ar, 0x20)
				const at = ld16(ld64(s3f0 + 8) + 0xe3)
				copyr(s1f8, ar, 0x20)
				st64(sff0, at)
				const au = ld64(s308 + 8)
				st64(s1000, s1f8, au)
				r = fn_70108(s1c8, s48, s198, s100, fp)
				n = ld64(s1c8 + 8)
				o = ld64(s1c8)
				const av = ld8(s1b8 + 0x1a)
				if (av == 2) {
					bs = ld64(s3a8 + 0x10)
					st64(bs, ld64(bs) + 1)
					bt = ld64(s308 + 0x28)
					st64(bt + 8, n)
					st64(bt, o)
					return r
				}
				B39: {
					st16(s238 + 0x18, ld16(s1b8 + 0x18))
					copyr(s238, s1b8, 0x18)
					st32(s238 + 0x1b, ld32(s1b8 + 0x1b))
					st8(s238 + 0x1f, ld8(s1b8 + 0x1f))
					st8(s238 + 0x1a, av)
					st64(s248, o, n)
					const aw = ld64(s308)
					if ((au as u32) == (aw as u32)) {
						AccountInfo_clone_f338(s100, ld64(ld64(s350 + 0x28)))
						const ba = fn_84360(s198, s100)
						n = ld64(s190)
						o = ld64(s198)
						const az = ld8(s170 + 2)
						if (az == 2) {
							br = ptr_drop_in_place_fcd8(s100, ba)
							break B39
						}
						st16(s1e8 + 0x18, ld16(s170))
						copyr(s1e8, s188, 0x18)
						st32(s1e8 + 0x1b, ld32(s170 + 3))
						st8(s1e8 + 0x1f, ld8(s170 + 7))
						st8(s1e8 + 0x1a, az)
						st64(s1f8, o, n)
						ptr_drop_in_place_fcd8(s100, ba)
					} else {
						AccountInfo_clone_f338(s48, ld64(s3f8))
						const ax = ld64(ld64(s350 + 0x28))
						st64(s350 + 0x30, s198)
						AccountInfo_clone_f338(s198, ax)
						st64(s350 + 0x28, s100)
						AccountInfo_clone_f338(s100, ld64(s350 + 0x38))
						st64(sff0, ld16(ld64(s3f0 + 8) + 0xe3))
						st64(s1000, s218, aw)
						br = fn_70108(s1c8, s48, ld64(s350 + 0x30), ld64(s350 + 0x28), fp)
						n = ld64(s1c8 + 8)
						o = ld64(s1c8)
						const ay = ld8(s1b8 + 0x1a)
						if (ay == 2) {
							break B39
						}
						st16(s1e8 + 0x18, ld16(s1b8 + 0x18))
						copyr(s1e8, s1b8, 0x18)
						st32(s1e8 + 0x1b, ld32(s1b8 + 0x1b))
						st8(s1e8 + 0x1f, ld8(s1b8 + 0x1f))
						st8(s1e8 + 0x1a, ay)
						st64(s1f8, o, n)
					}
					const bb = ld64(0x300000000 /* heap bump-allocator cursor */)
					let bn = ld64(s350 + 0x20)
					const bd = ld64(s308)
					const bc = bb != 0 ? sat_sub(bb, 8) & -4 : 0x300007ff8
					if (0x300000008 > bc) {
						alloc_handle_alloc_error(4, 8)
					}
					B38: {
						st64(0x300000000 /* heap bump-allocator cursor */, bc)
						st32(bc + 4, bd)
						st32(bc, au)
						st64(s100, 2, bc, 2)
						const be = fn_6f618(ld64(s3f0 + 8), s100)
						let bm = 0
						const bl = ld64(s308 + 0x10)
						if (be != 0) {
							if (ld64(s3a8 + 0x20) == 0) {
								fn_14ec98(0, 0, 0x10015faf0)
							}
							const bf = ld64(s3a8 + 0x28)
							const bg = ld64(bf)
							copyr(s120, bg, 0x20)
							fn_76200(s100, s218)
							const bh = memcmp(s120, s100, 0x20)
							bm = bf
							bn = ld64(s350 + 0x20)
							if ((bh as u32) != 0) {
								ErrorCode_name(s60, 0x100159874)
								st64(s1c8, 0, 1, 0)
								st64(s28, s1c8, 0x10015f818)
								st8(s20 + 0x10, 3)
								st64(s20 + 8, 0x20)
								st64(s48 + 0x10, 0)
								st64(s48, 0)
								if (ErrorCode_fmt(0x100159874, s48) != 0) {
									fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
								}
								copyr(sc8, s1c8, 0x18)
								copy(se0, s60, 0x18)
								st64(s100 + 8, 0x100159d93)
								st32(s70 + 8, 0x9c6 /* anchor::RequireKeysEqViolated */)
								st8(sc0 + 0x10, 2)
								st32(s100 + 0x18, 0x13b)
								st64(s100 + 0x10, 0x2e)
								st64(s100, 0)
								fn_13e5a0(s2b8, s100)
								const bj = ld64(s2b8 + 8)
								const bi = ld64(s2b8)
								const bk = fn_76200(se0, s218)
								copyr(s100, s120, 0x20)
								bq = Error_with_pubkeys(s2c8, bi, bj, s100, bk)
								st64(s3a8 + 0x10, ld64(s258 + 8))
								n = ld64(s2c8 + 8)
								o = ld64(s2c8)
								break B38
							}
						}
						st64(sfc0 + 0x38, ld64(s3a8 + 0x40))
						st64(sfc0 + 0x30, ld64(s308 + 0x20))
						st64(sfc0 + 0x28, bl)
						st64(sfc0 + 0x20, ld64(s3a8 + 0x30))
						st64(sfc0 + 0x18, ld64(s3a8 + 0x38))
						st64(sfc0, bm, s258, s268)
						st64(sff0 + 0x28, ld64(s308 + 0x18))
						st64(sff0 + 0x20, g)
						st64(sff0 + 0x18, ld64(s350 + 0x10))
						st64(sff0 + 0x10, ld64(s350 + 0x18))
						st64(sff0, s248, s1f8)
						st64(s1000 + 8, ld64(s3a8 + 0x48))
						st64(s1000, ld64(s3a8 + 0x50))
						bq = fn_1e428(s198, ld64(s350 + 0x40), ld64(s350), ld64(s350 + 8), ld64(s1000), ld64(s1000 + 8), s248, s1f8, ld64(sff0 + 0x10), ld64(sff0 + 0x18), g, ld64(sff0 + 0x28), bm, s258, s268, ld64(sfc0 + 0x18), ld64(sfc0 + 0x20), bl, ld64(sfc0 + 0x30), ld64(sfc0 + 0x38))
						o = ld64(s198)
						if (ld8(s140 + 0x19) == 2) {
							n = ld64(s190)
						} else {
							st64(s3a8 + 0x30, ld64(s170 + 0x20))
							st64(s3a8 + 0x38, ld64(s170 + 0x18))
							st64(s3a8 + 0x40, ld64(s170 + 0x10))
							st64(s3a8 + 0x48, ld64(s170 + 8))
							st64(s3a8 + 0x50, ld64(s170))
							st64(s350, ld64(s178))
							st64(s3a8 + 0x20, ld64(s188 + 8))
							st64(s3a8 + 0x28, ld64(s188))
							st64(s308 + 0x18, ld64(s140 + 0x10))
							copyr(s308, s140, 0x10)
							st64(s350 + 0x30, ld64(s170 + 0x28))
							const bv: LamportsCell = ld64(s190)
							const bu = ld64(ld64(s3a8 + 0x18))
							const bo = ld64(bn)
							copyr(s100, bo, 0x20)
							st64(s350 + 0x28, ld64(s268 + 8))
							st64(s350 + 8, ld64(s268))
							bq = fn_84298(s198)
							n = ld64(s190)
							const bp = ld64(s198)
							if (bp == 2) {
								st8(bu + 0x118, ld64(s3f0 + 0x10))
								copy(bu + 8, s100, 0x20)
								const bz = ld64(s218 + 0x18)
								const by = ld64(s218 + 0x10)
								const bx = ld64(s218 + 8)
								const bw = ld64(s218)
								st64(bu + 0x70, ld64(s3a8 + 0x20))
								st64(bu + 0x68, ld64(s3a8 + 0x28))
								st64(bu + 0x60, bv)
								st64(bu + 0x58, o)
								st64(bu + 0xc0, ld64(s3a8 + 0x30))
								st64(bu + 0xb8, ld64(s3a8 + 0x38))
								st64(bu + 0xa8, ld64(s3a8 + 0x40))
								st64(bu + 0xa0, ld64(s3a8 + 0x48))
								st64(bu + 0x90, ld64(s3a8 + 0x50))
								st64(bu + 0x88, ld64(s350))
								st64(bu + 0x28, bw, bx, by, bz)
								st64(bu + 0xd0, n)
								const ca = ld64(s350 + 0x28)
								st64(bu + 0x50, ca)
								const cb = ld64(s350 + 8)
								st64(bu + 0x48, cb)
								const cc = ld64(s308 + 0x20)
								st32(bu + 0x114, cc)
								const cd = ld64(s308 + 0x10)
								st32(bu + 0x110, cd)
								st64(bu + 0x78, 0, 0)
								st64(bu + 0x108, 0)
								st64(bu + 0x100, 0)
								st64(bu + 0xf8, 0)
								st64(bu + 0xf0, 0)
								st64(bu + 0xe8, 0)
								st64(bu + 0xe0, 0)
								st64(bu + 0xd8, 0)
								const ce = ld64(ld64(s3f8))
								copyr(se0, ce, 0x20)
								const cf = ld64(ld64(ld64(s3f0 + 0x20)))
								copyr(sc0, cf, 0x20)
								st64(sa0 + 0x10, ld64(s350 + 0x30))
								copy(s88, s308, 0x10)
								st64(s88 + 0x10, ld64(s308 + 0x18))
								st32(s70, cd, cc)
								st64(sa0, cb, ca)
								copyr(s100, s218, 0x20)
								fn_10f370(s198, s100)
								copyr(s48, s190, 0x10)
								ptr_drop_in_place_f5e8(s248, ptr_drop_in_place_f5e8(s1f8, log_data(s48, 1)))
								const cg = ld64(s3a8 + 0x10)
								st64(cg, ld64(cg) + 1)
								const cj = ld64(bu)
								const ci = ld64(ld64(s350 + 0x10))
								const ch = ld64(ld64(s3f0 + 0x28))
								st64(sfc0 + 0x10, ld64(s3f0 + 0x18) & 1)
								copyr(sfc0, s3a8, 0x10)
								st64(sff0 + 0x28, ch)
								st64(sff0 + 0x20, ld64(s350 + 0x38))
								st64(sff0 + 0x18, ld64(s350 + 0x18))
								st64(sff0 + 0x10, ci)
								st64(sff0 + 8, ld64(s3f0 + 0x40))
								st64(sff0, ld64(s3f0 + 0x30))
								st64(s1000 + 8, ld64(s3f0 + 0x38))
								st64(s1000, ld64(s350 + 0x20))
								r = fn_22e28(s2d8, ld64(s350 + 0x40), ld64(s3f0), cj, ld64(s1000), ld64(s1000 + 8), ld64(sff0), ld64(sff0 + 8), ci, ld64(sff0 + 0x18), ld64(sff0 + 0x20), ch, ld64(sfc0), ld64(sfc0 + 8), ld64(sfc0 + 0x10))
								o = ld64(s2d8)
								bt = ld64(s308 + 0x28)
								st64(bt + 8, ld64(s2d8 + 8))
								st64(bt, o)
								return r
							}
							o = bp
						}
					}
					br = ptr_drop_in_place_f5e8(s1f8, bq)
				}
				r = ptr_drop_in_place_f5e8(s248, br)
				bs = ld64(s3a8 + 0x10)
				st64(bs, ld64(bs) + 1)
				bt = ld64(s308 + 0x28)
				st64(bt + 8, n)
				st64(bt, o)
				return r
			}
			bs = ld64(s3a8 + 0x10)
			st64(bs, ld64(bs) + 1)
			bt = ld64(s308 + 0x28)
			st64(bt + 8, n)
			st64(bt, o)
			return r
		}
		fn_85138(s1c8, 0x10015982c)
		st64(s48, 0, 1, 0)
		st64(s178, s48, 0x10015f818)
		st8(s170 + 0x10, 3)
		st64(s170 + 8, 0x20)
		st64(s188, 0)
		st64(s198, 0)
		if (fn_88558(0x10015982c, s198) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(sc8, s48, 0x18)
		copy(se0, s1c8, 0x18)
		st64(s100 + 8, 0x100159d93)
		st32(s70 + 8, 0x1770 /* error::NotApproved */)
		st8(sc0 + 0x10, 2)
		st32(s100 + 0x18, 0xf8)
		st64(s100 + 0x10, 0x2e)
		st64(s100, 0)
		r = fn_13e5a0(s278, s100)
		n = ld64(s278 + 8)
		o = ld64(s278)
		bs = ld64(s3a8 + 0x10)
		st64(bs, ld64(bs) + 1)
		bt = ld64(s308 + 0x28)
		st64(bt + 8, n)
		st64(bt, o)
		return r
	}
	bt = ld64(s308 + 0x28)
	st64(bt + 8, n)
	st64(bt, o)
	return r
}

// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: tick_array_state_data: TickArrayStateAccount, tick_array_state_data_2: TickArrayStateAccount, tick_array_state_data_3: TickArrayStateAccount, tick_array_state_data_4: TickArrayStateAccount
export function fn_1e428(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64, p13: u64, p14: u64, p15: u64, p16: u64, p17: u64, p18: u64, p19: u64, p20: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s67 = fp - 0x67, s68 = fp - 0x68, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd0 = fp - 0xd0, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s147 = fp - 0x147, s148 = fp - 0x148, s150 = fp - 0x150, s1f8 = fp - 0x1f8, s2a0 = fp - 0x2a0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s500 = fp - 0x500, s510 = fp - 0x510, s558 = fp - 0x558, s590 = fp - 0x590, s5a8 = fp - 0x5a8, s5b0 = fp - 0x5b0, s5b8 = fp - 0x5b8, s5c0 = fp - 0x5c0, sff0 = fp - 0xff0, s1000 = fp - 0x1000
	let l, w, x, y, an, aq, ar, at, au, av, aw, bb, bf, bj, bk, cg, ck, cm, cp, dc, dl, dm, dp, dq, dv, ef, ej, er, es, eu, ff: u64
	st64(s558 + 0x18, c)
	st64(s558 + 0x28, b)
	const k = p19
	let j = p18
	st64(s510, p17, p16)
	const i = p14
	st64(s558 + 0x30, p13)
	st64(s500, p12, p11)
	st64(s558, p9, p10)
	st64(s558 + 0x38, p8)
	st64(s500 + 0x18, p7)
	st64(s558 + 0x20, p6)
	st64(s558 + 0x10, p5)
	const f = p15
	let h = ld64(f + 8)
	let g = ld64(f)
	st64(s558 + 0x40, i)
	if ((g | h) == 0) {
		const t = p20
		if ((t as u8) == 2) {
			st64(a + 0x48, 0)
			st64(a + 0x40, 0)
			st64(a + 0x38, 0)
			st64(a + 0x30, 0)
			st64(a + 0x28, 0)
			st64(a + 0x20, 0)
			st64(a, 0, 0, 0, 0)
			st64(a + 0x50, 0, 0, 0, 0)
			st16(a + 0x70, 0)
			return j
		}
		if ((t & 1) != 0) {
			if (ld64(s500 + 8) == 0) {
				j = fn_88360(s4e0, 0x31)
				bb = ld64(s4e0)
				st64(a + 8, ld64(s4e0 + 8))
				st64(a, bb)
				st8(a + 0x71, 2)
				return j
			}
			st64(s590 + 0x30, j)
			st64(s590 + 0x20, k)
			const ab = ld64(0x300000000 /* heap bump-allocator cursor */)
			const ac = ab != 0 ? sat_sub(ab, 0x80) & -8 : 0x300007f80
			st64(s590 + 0x18, d)
			st64(s500 + 0x10, a)
			if (0x300000007 >= ac) {
				alloc_handle_alloc_error(8, 0x80)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, ac)
			const ax = ld64(s500 + 8)
			const ay = ld64(ax + 0x58)
			memcpy(ac, ax, 0x58)
			st64(ac + 0x58, ay)
			copy(ac + 0x60, ax + 0x60, 0x20)
			j = fn_7da68(s108, ac, ld64(s510 + 8))
			aq = ld64(s108 + 8)
			an = ld64(s108)
			if (an != 2) {
				dv = ld64(s500 + 0x10)
				st64(dv + 8, aq)
				st64(dv, an)
				st8(dv + 0x71, 2)
				return j
			}
			const az = ld64(ld64(s558 + 0x40))
			st64(s590 + 0x10, ld64(az + 0xfd))
			st64(s590 + 0x28, az)
			st64(s590 + 8, ld64(az + 0xf5))
			j = fn_644c8(s108, ld64(s590 + 0x30), j)
			au = ld64(sf8)
			av = ld64(s108 + 8)
			if (ld64(s108) != 0) {
				bf = ld64(s500 + 0x10)
				st64(bf + 8, au)
				st64(bf, av)
				st8(bf + 0x71, 2)
				return j
			}
			j = fn_644c8(s108, ld64(s590 + 0x20), j)
			ar = ld64(sf8)
			at = ld64(s108 + 8)
			if (ld64(s108) != 0) {
				w = ld64(s500 + 0x10)
				st64(w + 8, ar)
				st64(w, at)
				st8(w + 0x71, 2)
				return j
			}
			const ba = ld64(s510 + 8)
			if (aq > ba) {
				j = fn_88360(s4d0, 0x26)
				at = ld64(s4d0)
				w = ld64(s500 + 0x10)
				st64(w + 8, ld64(s4d0 + 8))
				st64(w, at)
				st8(w + 0x71, 2)
				return j
			}
			st64(s1000, au, at, ar, ba - aq)
			j = fn_5ba48(s68, ld64(s590 + 8), ld64(s590 + 0x10), av, au, at, ar, ba - aq)
			h = ld64(s60 + 8)
			g = ld64(s60)
			if (ld64(s68) != 0) {
				aw = ld64(s500 + 0x10)
				st64(aw + 8, h)
				st64(aw, g)
				st8(aw + 0x71, 2)
				return j
			}
		} else {
			if (ld64(s500) == 0) {
				j = fn_88360(s2e0, 0x31)
				bb = ld64(s2e0)
				st64(a + 8, ld64(s2e0 + 8))
				st64(a, bb)
				st8(a + 0x71, 2)
				return j
			}
			st64(s590 + 0x30, j)
			st64(s590 + 0x20, k)
			const z = ld64(0x300000000 /* heap bump-allocator cursor */)
			const aa = z != 0 ? sat_sub(z, 0x80) & -8 : 0x300007f80
			st64(s590 + 0x18, d)
			st64(s500 + 0x10, a)
			if (0x300000007 >= aa) {
				alloc_handle_alloc_error(8, 0x80)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, aa)
			const al = ld64(s500)
			const am = ld64(al + 0x58)
			memcpy(aa, al, 0x58)
			st64(aa + 0x58, am)
			copy(aa + 0x60, al + 0x60, 0x20)
			j = fn_7da68(s108, aa, ld64(s510))
			aq = ld64(s108 + 8)
			an = ld64(s108)
			if (an != 2) {
				dv = ld64(s500 + 0x10)
				st64(dv + 8, aq)
				st64(dv, an)
				st8(dv + 0x71, 2)
				return j
			}
			const ao = ld64(ld64(s558 + 0x40))
			st64(s590 + 0x10, ld64(ao + 0xfd))
			st64(s590 + 0x28, ao)
			st64(s590 + 8, ld64(ao + 0xf5))
			j = fn_644c8(s108, ld64(s590 + 0x30), j)
			au = ld64(sf8)
			av = ld64(s108 + 8)
			if (ld64(s108) != 0) {
				bf = ld64(s500 + 0x10)
				st64(bf + 8, au)
				st64(bf, av)
				st8(bf + 0x71, 2)
				return j
			}
			j = fn_644c8(s108, ld64(s590 + 0x20), j)
			ar = ld64(sf8)
			at = ld64(s108 + 8)
			if (ld64(s108) != 0) {
				w = ld64(s500 + 0x10)
				st64(w + 8, ar)
				st64(w, at)
				st8(w + 0x71, 2)
				return j
			}
			const ap = ld64(s510)
			if (aq > ap) {
				j = fn_88360(s2d0, 0x26)
				at = ld64(s2d0)
				w = ld64(s500 + 0x10)
				st64(w + 8, ld64(s2d0 + 8))
				st64(w, at)
				st8(w + 0x71, 2)
				return j
			}
			st64(s1000, au, at, ar, ap - aq)
			j = fn_5bca0(s68, ld64(s590 + 8), ld64(s590 + 0x10), av, au, at, ar, ap - aq)
			h = ld64(s60 + 8)
			g = ld64(s60)
			if (ld64(s68) != 0) {
				aw = ld64(s500 + 0x10)
				st64(aw + 8, h)
				st64(aw, g)
				st8(aw + 0x71, 2)
				return j
			}
		}
		st64(f + 8, h)
		st64(f, g)
		l = ld64(s590 + 0x28)
		if ((g | h) == 0) {
			fn_85138(s28, 0x100159878)
			st64(s148, 0, 1, 0)
			st64(s48, s148, 0x10015f818)
			st8(s48 + 0x18, 3)
			st64(s48 + 0x10, 0x20)
			st64(s60 + 8, 0)
			st64(s68, 0)
			if (fn_88558(0x100159878, s68) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(sd0, s148, 0x18)
			copy(se8, s28, 0x18)
			st64(s108 + 8, 0x100159d93)
			st32(sb8 + 0x48, 0x179f /* error::ZeroLiquidity */)
			st8(sb8, 2)
			st32(sf8 + 8, 0x1cc)
			st64(sf8, 0x2e)
			st64(s108, 0)
			fn_13e5a0(s4b0, s108)
			j = fn_2150(s4c0, ld64(s4b0), ld64(s4b0 + 8), 0, 0)
			at = ld64(s4c0)
			w = ld64(s500 + 0x10)
			st64(w + 8, ld64(s4c0 + 8))
			st64(w, at)
			st8(w + 0x71, 2)
			return j
		}
	} else {
		st64(s590 + 0x18, d)
		st64(s590 + 0x30, j)
		st64(s590 + 0x20, k)
		st64(s500 + 0x10, a)
		l = ld64(i)
	}
	const n = ld64(l + 0xed)
	st64(s590 + 0x28, l)
	st64(s590 + 0x10, ld64(l + 0xe5))
	const af = AccountInfo_try_borrow_data(s108, ld64(s500 + 0x18), j)
	let r = undef
	let s = undef
	let u = ld64(sf8)
	const o = ld64(s108 + 8)
	const m = ld64(s108)
	if (m != 0x800000000000001a /* Ok */) {
		st64(s108, m, o, u)
		j = fn_13e628(s2f0, s108)
		y = ld64(s2f0 + 8)
		w = ld64(s500 + 0x10)
		st64(w, ld64(s2f0))
		st64(w + 8, y)
		st8(w + 0x71, 2)
		return j
	}
	st64(s590, n, h)
	let v = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
	let p = ld64(o + 8)
	if (p >= 8) {
		v = 0xbba /* anchor::AccountDiscriminatorMismatch */
		const tick_array_state_data: TickArrayStateAccount = ld64(o)
		r = 0x2a81f931cd559bc0 /* account:TickArrayState */
		if (tick_array_state_data.discriminator == 0x2a81f931cd559bc0 /* account:TickArrayState */) {
			if (p > 0x27ff) {
				const ad = ld64(s590 + 0x28)
				const ae = ld16(ad + 0x17f)
				st64(s5a8 + 0x10, ad + 0x17f)
				st64(s108, 0x10015984c)
				st64(sc8, ae != 0 ? ad + 0x17f : 1, (ae != 0) << 1, ad)
				st64(s5a8 + 8, ad + 0x61)
				st64(sd8, ad + 0x61)
				st64(s5a8, ad + 0x41)
				st64(se8, ad + 0x41)
				st64(s5b0, ad + 1)
				st64(sf8, ad + 1)
				st64(sb8 + 8, 1)
				st64(sd0, 0x20)
				st64(se8 + 8, 0x20)
				st64(sf8 + 8, 0x20)
				st64(s108 + 8, 4)
				st64(s148, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
				// PDA create_program_address(["pool", *(ad + 1), *(ad + 0x41), *(ad + 0x61), (ae != 0 ? ad + 0x17f : 1)[..(ae != 0) << 1], ad[..1]], program *s148)
				Pubkey_create_program_address(s68, s108, 6, s148, af)
				if (ld8(s68) != 1) {
					copyr(s28, s67, 0x20)
					const ag = memcmp(tick_array_state_data.pool_id, s28, 0x20)
					st64(u, ld64(u) - 1)
					if ((ag as u32) == 0) {
						const bx = AccountInfo_try_borrow_data(s108, ld64(s558 + 0x38), ag as u32)
						r = undef
						s = undef
						u = ld64(sf8)
						const bd = ld64(s108 + 8)
						const bc = ld64(s108)
						if (bc != 0x800000000000001a /* Ok */) {
							st64(s108, bc, bd, u)
							j = fn_13e628(s340, s108)
							y = ld64(s340 + 8)
							w = ld64(s500 + 0x10)
							st64(w, ld64(s340))
							st64(w + 8, y)
							st8(w + 0x71, 2)
							return j
						}
						let bn = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
						p = ld64(bd + 8)
						if (p >= 8) {
							bn = 0xbba /* anchor::AccountDiscriminatorMismatch */
							const tick_array_state_data_3: TickArrayStateAccount = ld64(bd)
							r = 0x2a81f931cd559bc0 /* account:TickArrayState */
							if (tick_array_state_data_3.discriminator == 0x2a81f931cd559bc0 /* account:TickArrayState */) {
								if (p > 0x27ff) {
									const bu = ld64(s590 + 0x28)
									const bv = ld16(bu + 0x17f)
									const bw = ld64(s5a8 + 0x10)
									st64(sb8, bu)
									st64(sd8, ld64(s5a8 + 8))
									st64(se8, ld64(s5a8))
									st64(sf8, ld64(s5b0))
									st64(s108, 0x10015984c)
									st64(sc8, bv != 0 ? bw : 1, (bv != 0) << 1)
									st64(sb8 + 8, 1)
									st64(sd0, 0x20)
									st64(se8 + 8, 0x20)
									st64(sf8 + 8, 0x20)
									st64(s108 + 8, 4)
									st64(s148, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
									// PDA create_program_address(["pool", *(ld64(s5b0)), *(ld64(s5a8)), *(ld64(s5a8 + 8)), (bv != 0 ? bw : 1)[..(bv != 0) << 1], bu[..1]], program *s148)
									Pubkey_create_program_address(s68, s108, 6, s148, bx)
									if (ld8(s68) != 1) {
										copyr(s28, s67, 0x20)
										const by = memcmp(tick_array_state_data_3.pool_id, s28, 0x20)
										st64(u, ld64(u) - 1)
										if ((by as u32) == 0) {
											const cd = ld64(s500 + 0x18)
											const cf = ld8(cd + 0x29)
											const ce = ld64(cd + 0x10)
											st64(s500 + 0x18, cf)
											j = fn_84f40(s108, ce, cf, undef, undef, by as u32)
											aq = ld64(sf8)
											let ch = ld64(s108 + 8)
											if (ld64(s108) != 0) {
												cg = ld64(s500 + 0x10)
												st64(cg + 8, aq)
												st64(cg, ch)
												st8(cg + 0x71, 2)
												return j
											}
											j = fn_717b0(s68, ch, ld64(s590 + 0x30), ld16(ld64(s590 + 0x28) + 0xe3))
											let cr = ld64(s60)
											let cq = ld64(s68)
											if (cq == 2) {
												const cv = memcpy(s2a0, cr, 0xa8)
												st64(aq, ld64(aq) + 1)
												const cs = ld64(s558 + 0x38)
												const cu = ld8(cs + 0x29)
												const ct = ld64(cs + 0x10)
												st64(s5a8 + 0x10, ct)
												st64(s558 + 0x38, cu)
												j = fn_84f40(s108, ct, cu, undef, undef, cv)
												aq = ld64(sf8)
												ch = ld64(s108 + 8)
												if (ld64(s108) != 0) {
													cg = ld64(s500 + 0x10)
													st64(cg + 8, aq)
													st64(cg, ch)
													st8(cg + 0x71, 2)
													return j
												}
												let cw = ld64(s590 + 0x20)
												j = fn_717b0(s68, ch, cw, ld16(ld64(s590 + 0x28) + 0xe3))
												cr = ld64(s60)
												cq = ld64(s68)
												if (cq == 2) {
													memcpy(s1f8, cr, 0xa8)
													st64(aq, ld64(aq) + 1)
													const cx = ld32(s1f8)
													st64(s590 + 0x20, cw)
													cw = cx != 0 ? cx : cw
													st32(s1f8, cw)
													const cy = ld32(s2a0)
													let cz = ld64(s590 + 0x30)
													cz = cy != 0 ? cy : cz
													st32(s2a0, cz)
													clock_get(s108)
													if (ld64(s108) != 0) {
														const di = ld64(s108 + 8)
														const dh = ld64(sf8)
														st64(sf8, ld64(sf8 + 8))
														st64(s108, di, dh)
														j = fn_13e628(s480, s108)
														at = ld64(s480)
														w = ld64(s500 + 0x10)
														st64(w + 8, ld64(s480 + 8))
														st64(w, at)
														st8(w + 0x71, 2)
														return j
													}
													if ((ld64(s590 + 8) as i64) > -1) {
														st64(sff0, ld64(se8 + 8))
														st64(s1000, s2a0, s1f8)
														j = fn_21b58(s108, g, ld64(s590 + 8), ld64(s558 + 0x40), s2a0, s1f8, ld64(sff0))
														const db = ld64(s108 + 8)
														st64(s558 + 0x40, ld64(s108))
														const da = ld8(sb8 + 0x21)
														if (da == 2) {
															cg = ld64(s500 + 0x10)
															st64(cg + 8, db)
															st64(cg, ld64(s558 + 0x40))
															st8(cg + 0x71, 2)
															return j
														}
														const dj = memcpy(s148, sf8, 0x40)
														st32(s150, ld32(sb8 + 0x22))
														st16(s150 + 4, ld16(sb8 + 0x26))
														copy(s5a8, sb8, 0x10)
														st64(s5b0, ld64(sb8 + 0x10))
														st64(s5b8, ld64(sb8 + 0x18))
														st64(s590 + 8, ld8(sb8 + 0x20))
														j = fn_84f40(s108, ce, ld64(s500 + 0x18), undef, undef, dj)
														aq = ld64(sf8)
														ch = ld64(s108 + 8)
														if (ld64(s108) != 0) {
															cg = ld64(s500 + 0x10)
															st64(cg + 8, aq)
															st64(cg, ch)
															st8(cg + 0x71, 2)
															return j
														}
														j = fn_71878(s3a0, ch, ld64(s590 + 0x30), ld16(ld64(s590 + 0x28) + 0xe3), s2a0)
														let dk = ld64(s3a0)
														if (dk == 2) {
															st64(aq, ld64(aq) + 1)
															j = fn_84f40(s108, ld64(s5a8 + 0x10), ld64(s558 + 0x38), undef, undef, j)
															aq = ld64(sf8)
															ch = ld64(s108 + 8)
															if (ld64(s108) != 0) {
																cg = ld64(s500 + 0x10)
																st64(cg + 8, aq)
																st64(cg, ch)
																st8(cg + 0x71, 2)
																return j
															}
															j = fn_71878(s3b0, ch, ld64(s590 + 0x20), ld16(ld64(s590 + 0x28) + 0xe3), s1f8)
															dk = ld64(s3b0)
															if (dk == 2) {
																st64(aq, ld64(aq) + 1)
																if ((ld64(s590 + 8) & 1) != 0) {
																	j = fn_84f40(s108, ce, ld64(s500 + 0x18), dl, dm, j)
																	aq = ld64(sf8)
																	an = ld64(s108 + 8)
																	if (ld64(s108) != 0) {
																		dv = ld64(s500 + 0x10)
																		st64(dv + 8, aq)
																		st64(dv, an)
																		st8(dv + 0x71, 2)
																		return j
																	}
																	const dn = ld8(an + 0x2784)
																	if (dn != 0xff) {
																		st8(an + 0x2784, dn + 1)
																		if (dn == 0) {
																			j = fn_6d670(s3c0, ld64(s590 + 0x28), ld64(s558 + 0x30), ld32(an + 0x20))
																			ff = ld64(s3c0 + 8)
																			dp = ld64(s3c0)
																			if (dp != 2) {
																				dc = ld64(s500 + 0x10)
																				st64(dc, dp, ff)
																				st8(dc + 0x71, 2)
																				st64(aq, ld64(aq) + 1)
																				return j
																			}
																		}
																	} else {
																		j = fn_88360(s3d0, 0x26)
																		ff = ld64(s3d0 + 8)
																		dp = ld64(s3d0)
																		if (dp != 2) {
																			dc = ld64(s500 + 0x10)
																			st64(dc, dp, ff)
																			st8(dc + 0x71, 2)
																			st64(aq, ld64(aq) + 1)
																			return j
																		}
																	}
																	st64(aq, ld64(aq) + 1)
																}
																if ((da & 1) != 0) {
																	j = fn_84f40(s108, ld64(s5a8 + 0x10), ld64(s558 + 0x38), dl, dm, j)
																	aq = ld64(sf8)
																	an = ld64(s108 + 8)
																	if (ld64(s108) != 0) {
																		dv = ld64(s500 + 0x10)
																		st64(dv + 8, aq)
																		st64(dv, an)
																		st8(dv + 0x71, 2)
																		return j
																	}
																	const fe = ld8(an + 0x2784)
																	if (fe != 0xff) {
																		st8(an + 0x2784, fe + 1)
																		if (fe == 0) {
																			j = fn_6d670(s3e0, ld64(s590 + 0x28), ld64(s558 + 0x30), ld32(an + 0x20))
																			ff = ld64(s3e0 + 8)
																			dp = ld64(s3e0)
																			if (dp != 2) {
																				dc = ld64(s500 + 0x10)
																				st64(dc, dp, ff)
																				st8(dc + 0x71, 2)
																				st64(aq, ld64(aq) + 1)
																				return j
																			}
																		}
																	} else {
																		j = fn_88360(s3f0, 0x26)
																		ff = ld64(s3f0 + 8)
																		dp = ld64(s3f0)
																		if (dp != 2) {
																			dc = ld64(s500 + 0x10)
																			st64(dc, dp, ff)
																			st8(dc + 0x71, 2)
																			st64(aq, ld64(aq) + 1)
																			return j
																		}
																	}
																	st64(aq, ld64(aq) + 1)
																}
																if ((ld64(s5a8 + 8) | ld64(s5a8)) == 0) {
																	fn_85138(s2c0, 0x100159860)
																	st64(s28, 0, 1, 0)
																	st64(s48, s28, 0x10015f818)
																	st8(s48 + 0x18, 3)
																	st64(s48 + 0x10, 0x20)
																	st64(s60 + 8, 0)
																	st64(s68, 0)
																	if (fn_88558(0x100159860, s68) != 0) {
																		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
																	}
																	copyr(sd0, s28, 0x18)
																	copy(se8, s2c0, 0x18)
																	st64(s108 + 8, 0x100159d93)
																	st32(sb8 + 0x48, 0x177f /* error::ForbidBothZeroForSupplyLiquidity */)
																	st8(sb8, 2)
																	st32(sf8 + 8, 0x20f)
																	st64(sf8, 0x2e)
																	st64(s108, 0)
																	j = fn_13e5a0(s470, s108)
																	at = ld64(s470)
																	w = ld64(s500 + 0x10)
																	st64(w + 8, ld64(s470 + 8))
																	st64(w, at)
																	st8(w + 0x71, 2)
																	return j
																}
																st64(s500 + 0x18, 0)
																let ea = 0
																if (ld64(s500 + 8) != 0) {
																	const dr = fn_16330(ld64(s500 + 8))
																	j = fn_7d178(s108, dr, ld64(s5a8))
																	const ds = ld64(s108 + 8)
																	an = ld64(s108)
																	st64(s5b0, ds)
																	ea = ds
																	if (an != 2) {
																		dv = ld64(s500 + 0x10)
																		st64(dv + 8, ld64(s5b0))
																		st64(dv, an)
																		st8(dv + 0x71, 2)
																		return j
																	}
																}
																if (ld64(s500) != 0) {
																	const dt = fn_16330(ld64(s500))
																	j = fn_7d178(s108, dt, ld64(s5a8 + 8))
																	const du = ld64(s108 + 8)
																	an = ld64(s108)
																	st64(s5b8, du)
																	st64(s500 + 0x18, du)
																	if (an != 2) {
																		dv = ld64(s500 + 0x10)
																		st64(dv + 8, ld64(s5b8))
																		st64(dv, an)
																		st8(dv + 0x71, 2)
																		return j
																	}
																}
																const dw = ld64(s590 + 0x28)
																const dz = ld64(dw + 0xfd)
																const dy = ld64(dw + 0xf5)
																const dx = ld32(dw + 0x105)
																st64(se8 + 8, ld64(s5a8 + 8))
																st64(sc8 + 8, ld64(s500 + 0x18))
																st32(sb8, dx)
																st64(sf8, dy, dz)
																st64(s108, ld64(s590 + 0x10))
																st64(s108 + 8, ld64(s590))
																st64(s558 + 0x38, ea)
																st64(sc8, ea)
																const eb = ld64(s5a8)
																st64(se8, eb)
																st64(sd8, 0, 0)
																fn_10f958(s68, s108)
																copyr(s28, s60, 0x10)
																let ei = log_data(s28, 1)
																const ec = ld64(s558 + 0x38)
																st64(s558 + 0x38, eb + ec)
																if (eb > eb + ec) {
																	fn_154730(0x10015fb08, ec)
																}
																if (ld64(s558 + 0x38) > ld64(s510 + 8)) {
																	fn_85138(s2c0, 0x100159904)
																	st64(s28, 0, 1, 0)
																	st64(s48, s28, 0x10015f818)
																	st8(s48 + 0x18, 3)
																	st64(s48 + 0x10, 0x20)
																	st64(s60 + 8, 0)
																	st64(s68, 0)
																	if (fn_88558(0x100159904, s68) != 0) {
																		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
																	}
																	copyr(sd0, s28, 0x18)
																	copy(se8, s2c0, 0x18)
																	st64(s108 + 8, 0x100159d93)
																	st32(sb8 + 0x48, 0x1781 /* error::PriceSlippageCheck */)
																	st8(sb8, 2)
																	st32(sf8 + 8, 0x231)
																	st64(sf8, 0x2e)
																	st64(s108, 0)
																	fn_13e5a0(s450, s108)
																	j = fn_1730(s460, ld64(s450), ld64(s450 + 8), ld64(s510 + 8), ld64(s558 + 0x38))
																	at = ld64(s460)
																	w = ld64(s500 + 0x10)
																	st64(w + 8, ld64(s460 + 8))
																	st64(w, at)
																	st8(w + 0x71, 2)
																	return j
																}
																const ed = ld64(s5a8 + 8)
																const ee = ld64(s500 + 0x18)
																if (ed > ed + ee) {
																	fn_154730(0x10015fb20, ed, ed + ee)
																}
																if (ed + ee > ld64(s510)) {
																	fn_85138(s2c0, 0x100159904)
																	st64(s28, 0, 1, 0)
																	st64(s48, s28, 0x10015f818)
																	st8(s48 + 0x18, 3)
																	st64(s48 + 0x10, 0x20)
																	st64(s60 + 8, 0)
																	st64(s68, 0)
																	if (fn_88558(0x100159904, s68) != 0) {
																		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
																	}
																	copyr(sd0, s28, 0x18)
																	copy(se8, s2c0, 0x18)
																	st64(s108 + 8, 0x100159d93)
																	st32(sb8 + 0x48, 0x1781 /* error::PriceSlippageCheck */)
																	st8(sb8, 2)
																	st32(sf8 + 8, 0x236)
																	st64(sf8, 0x2e)
																	st64(s108, 0)
																	fn_13e5a0(s430, s108)
																	j = fn_1730(s440, ld64(s430), ld64(s430 + 8), ld64(s510), ed + ee)
																	at = ld64(s440)
																	w = ld64(s500 + 0x10)
																	st64(w + 8, ld64(s440 + 8))
																	st64(w, at)
																	st8(w + 0x71, 2)
																	return j
																}
																B126: {
																	if (ld64(s558) == 0) {
																		st8(s48 + 0xa, 2)
																		st64(s500 + 0x18, ld64(ld64(s558 + 8)))
																	} else {
																		ei = AccountInfo_clone_f338(s68, ld64(ld64(s558)))
																		st64(s500 + 0x18, ld64(ld64(s558 + 8)))
																		ef = ld8(s48 + 0xa)
																		if (ef != 2) {
																			const eg = ld64(s60)
																			st64(s510 + 8, eg)
																			const eh = ld64(eg)
																			st64(s558 + 0x30, ld64(s68))
																			rc_inc(ld64(s510 + 8), eh)
																			const ek = ld64(s60 + 8)
																			st64(s510, ek)
																			const el = ld64(ek)
																			rc_inc(ld64(s510), el)
																			st8(se8 + 0xa, ef)
																			st64(sf8, ld64(s510))
																			st64(s108 + 8, ld64(s510 + 8))
																			st64(s108, ld64(s558 + 0x30))
																			const em = ld8(s48 + 9)
																			st64(s558 + 8, em)
																			st8(se8 + 9, em)
																			const en = ld8(s48 + 8)
																			st64(s558, en)
																			st8(se8 + 8, en)
																			const eo = ld64(s48)
																			st64(s5a8 + 0x10, eo)
																			st64(se8, eo)
																			const ep = ld64(s60 + 0x10)
																			st64(s5c0, ep)
																			st64(sf8 + 8, ep)
																			st64(sff0 + 8, ld64(s558 + 0x38))
																			st64(sff0, s108)
																			st64(s1000 + 8, ld64(s500 + 0x18))
																			st64(s1000, ld64(s500 + 8))
																			eu = fn_79050(s400, ld64(s558 + 0x28), ld64(s558 + 0x18), ld64(s558 + 0x10), ld64(s1000), ld64(s1000 + 8), s108, ld64(sff0 + 8), ei, da)
																			es = ld64(s400 + 8)
																			ej = ld64(s400)
																			if (ej == 2) {
																				const eq = ld64(s510 + 8)
																				rc_inc(eq)
																				const et = ld64(s510)
																				rc_inc(et)
																				st8(se8 + 9, ld64(s558 + 8))
																				st8(se8 + 8, ld64(s558))
																				st64(se8, ld64(s5a8 + 0x10))
																				st64(sf8 + 8, ld64(s5c0))
																				st64(sf8, ld64(s510))
																				st64(s108 + 8, ld64(s510 + 8))
																				st64(s108, ld64(s558 + 0x30))
																				break B126
																			}
																			er = ld64(s500 + 0x10)
																			st64(er, ej, es)
																			st8(er + 0x71, 2)
																			return fn_ff88(s68, eu)
																		}
																	}
																	st8(se8 + 0xa, 2)
																	st64(sff0 + 8, ld64(s558 + 0x38))
																	st64(sff0, s108)
																	st64(s1000 + 8, ld64(s500 + 0x18))
																	st64(s1000, ld64(s500 + 8))
																	eu = fn_79050(s410, ld64(s558 + 0x28), ld64(s558 + 0x18), ld64(s558 + 0x10), ld64(s1000), ld64(s1000 + 8), s108, ld64(sff0 + 8), ei, da)
																	es = ld64(s410 + 8)
																	ej = ld64(s410)
																	if (ej != 2) {
																		er = ld64(s500 + 0x10)
																		st64(er, ej, es)
																		st8(er + 0x71, 2)
																		return fn_ff88(s68, eu)
																	}
																	ef = 2
																}
																st8(se8 + 0xa, ef)
																st64(sff0, s108, ed + ee)
																st64(s1000 + 8, ld64(s500 + 0x18))
																st64(s1000, ld64(s500))
																eu = fn_79050(s420, ld64(s558 + 0x28), ld64(s590 + 0x18), ld64(s558 + 0x20), ld64(s1000), ld64(s1000 + 8), s108, ed + ee, eu, da)
																const ev = ld64(s420)
																if (ev != 2) {
																	const fd = ld64(s420 + 8)
																	er = ld64(s500 + 0x10)
																	st64(er, ev, fd)
																	st8(er + 0x71, 2)
																	return fn_ff88(s68, eu)
																}
																const ew = ld64(s590 + 0x28)
																fn_6a5a8(s108, ew, eu)
																const ez = ld64(ew + 0xed)
																const ey = ld64(ew + 0xe5)
																const ex = ld32(ew + 0x105)
																st32(sc8 + 4, ld64(s590 + 0x30))
																st32(sc8, ex)
																st64(sd8, ey, ez)
																st64(se8, ld64(s590 + 0x10))
																st64(se8 + 8, ld64(s590))
																st32(sc8 + 8, ld64(s590 + 0x20))
																fn_110060(s28, s108)
																copyr(s2c0, s20, 0x10)
																log_data(s2c0, 1)
																const fa = ld64(s500 + 0x10)
																eu = memcpy(fa + 0x10, s148, 0x40)
																const fc = ld16(s150 + 4)
																const fb = ld32(s150)
																st8(fa + 0x70, ld64(s590 + 8))
																st8(fa + 0x71, da)
																st64(fa + 0x68, ld64(s5b8))
																st64(fa + 0x60, ld64(s5b0))
																st64(fa + 0x58, ld64(s5a8 + 8))
																st64(fa + 0x50, ld64(s5a8))
																st64(fa + 8, db)
																st64(fa, ld64(s558 + 0x40))
																st32(fa + 0x72, fb)
																st16(fa + 0x76, fc)
																return fn_ff88(s68, eu)
															}
															dq = ld64(s3b0 + 8)
															dc = ld64(s500 + 0x10)
															st64(dc, dk, dq)
															st8(dc + 0x71, 2)
															st64(aq, ld64(aq) + 1)
															return j
														}
														dq = ld64(s3a0 + 8)
														dc = ld64(s500 + 0x10)
														st64(dc, dk, dq)
														st8(dc + 0x71, 2)
														st64(aq, ld64(aq) + 1)
														return j
													}
													j = fn_88360(s390, 0x26)
													at = ld64(s390)
													w = ld64(s500 + 0x10)
													st64(w + 8, ld64(s390 + 8))
													st64(w, at)
													st8(w + 0x71, 2)
													return j
												}
												dc = ld64(s500 + 0x10)
												st64(dc + 8, cr)
												st64(dc, cq)
												st8(dc + 0x71, 2)
												st64(aq, ld64(aq) + 1)
												return j
											}
											dc = ld64(s500 + 0x10)
											st64(dc + 8, cr)
											st64(dc, cq)
											st8(dc + 0x71, 2)
											st64(aq, ld64(aq) + 1)
											return j
										}
										ErrorCode_name(s28, 0x100159874)
										st64(s148, 0, 1, 0)
										st64(s48, s148, 0x10015f818)
										st8(s48 + 0x18, 3)
										st64(s48 + 0x10, 0x20)
										st64(s60 + 8, 0)
										st64(s68, 0)
										if (ErrorCode_fmt(0x100159874, s68) != 0) {
											fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
										}
										copyr(sd0, s148, 0x18)
										copy(se8, s28, 0x18)
										st64(s108 + 8, 0x100159d93)
										st32(sb8 + 0x48, 0x9c6 /* anchor::RequireKeysEqViolated */)
										st8(sb8, 2)
										st32(sf8 + 8, 0x1cf)
										st64(sf8, 0x2e)
										st64(s108, 0)
										const bz = fn_13e5a0(s350, s108)
										const co = ld64(s350 + 8)
										const cn = ld64(s350)
										const dd = AccountInfo_try_borrow_data(s148, ld64(s558 + 0x38), bz)
										r = undef
										s = undef
										const ci = ld64(s147 + 0xf)
										const cb = ld64(s147 + 7)
										const ca = ld64(s148)
										if (ca != 0x800000000000001a /* Ok */) {
											st64(s148, ca, cb, ci)
											cp = fn_13e628(s360, s148)
											cm = ld64(s360 + 8)
											ck = ld64(s500 + 0x10)
											st64(ck, ld64(s360))
											st64(ck + 8, cm)
											st8(ck + 0x71, 2)
											return fn_fc80(cn, co, cp)
										}
										let cj = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
										p = ld64(cb + 8)
										if (p >= 8) {
											cj = 0xbba /* anchor::AccountDiscriminatorMismatch */
											const tick_array_state_data_4: TickArrayStateAccount = ld64(cb)
											r = tick_array_state_data_4.discriminator
											s = 0x2a81f931cd559bc0 /* account:TickArrayState */
											if (r == 0x2a81f931cd559bc0 /* account:TickArrayState */) {
												if (p > 0x27ff) {
													copyr(s68, tick_array_state_data_4.pool_id, 0x20)
													const de = fn_6a5a8(se8, ld64(s590 + 0x28), dd)
													copyr(s108, s68, 0x20)
													j = Error_with_pubkeys(s370, cn, co, s108, de)
													const dg = ld64(s370)
													const df = ld64(s500 + 0x10)
													st64(df + 8, ld64(s370 + 8))
													st64(df, dg)
													st8(df + 0x71, 2)
													st64(ci, ld64(ci) - 1)
													return j
												}
												fn_153158(0x2800, p, 0x1001605f0, r, 0x2a81f931cd559bc0 /* account:TickArrayState */)
											}
										}
										cp = anchor_error_from(s380, cj, cj, r, s)
										cm = ld64(s380 + 8)
										const cl = ld64(s380)
										st64(ci, ld64(ci) - 1)
										ck = ld64(s500 + 0x10)
										st64(ck, cl, cm)
										st8(ck + 0x71, 2)
										return fn_fc80(cn, co, cp)
									}
									st8(s28, ld8(s67))
									fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s28, 0x100160228, 0x100160248)
								}
								fn_153158(0x2800, p, 0x1001605f0, 0x2a81f931cd559bc0 /* account:TickArrayState */, s)
							}
						}
						j = anchor_error_from(s490, bn, bn, r, s)
						y = ld64(s490 + 8)
						x = ld64(s490)
						st64(u, ld64(u) - 1)
						w = ld64(s500 + 0x10)
						st64(w, x, y)
						st8(w + 0x71, 2)
						return j
					}
					ErrorCode_name(s28, 0x100159874)
					st64(s148, 0, 1, 0)
					st64(s48, s148, 0x10015f818)
					st8(s48 + 0x18, 3)
					st64(s48 + 0x10, 0x20)
					st64(s60 + 8, 0)
					st64(s68, 0)
					if (ErrorCode_fmt(0x100159874, s68) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
					}
					copyr(sd0, s148, 0x18)
					copy(se8, s28, 0x18)
					st64(s108 + 8, 0x100159d93)
					st32(sb8 + 0x48, 0x9c6 /* anchor::RequireKeysEqViolated */)
					st8(sb8, 2)
					st32(sf8 + 8, 0x1ce)
					st64(sf8, 0x2e)
					st64(s108, 0)
					const ah = fn_13e5a0(s300, s108)
					const bm = ld64(s300 + 8)
					const bl = ld64(s300)
					const br = AccountInfo_try_borrow_data(s108, ld64(s500 + 0x18), ah)
					r = undef
					s = undef
					const bg = ld64(sf8)
					const aj = ld64(s108 + 8)
					const ai = ld64(s108)
					const bi = ld64(s500 + 0x10)
					if (ai != 0x800000000000001a /* Ok */) {
						st64(s108, ai, aj, bg)
						j = fn_13e628(s310, s108)
						bk = ld64(s310 + 8)
						bj = ld64(s310)
					} else {
						let bh = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
						p = ld64(aj + 8)
						if (p >= 8) {
							bh = 0xbba /* anchor::AccountDiscriminatorMismatch */
							const tick_array_state_data_2: TickArrayStateAccount = ld64(aj)
							r = tick_array_state_data_2.discriminator
							s = 0x2a81f931cd559bc0 /* account:TickArrayState */
							if (r == 0x2a81f931cd559bc0 /* account:TickArrayState */) {
								if (p > 0x27ff) {
									copyr(s2c0, tick_array_state_data_2.pool_id, 0x20)
									const bo = ld64(s590 + 0x28)
									const bp = ld16(bo + 0x17f)
									const bq = ld64(s5a8 + 0x10)
									st64(sb8, bo)
									st64(sd8, ld64(s5a8 + 8))
									st64(se8, ld64(s5a8))
									st64(sf8, ld64(s5b0))
									st64(s108, 0x10015984c)
									st64(sc8, bp != 0 ? bq : 1, (bp != 0) << 1)
									st64(sb8 + 8, 1)
									st64(sd0, 0x20)
									st64(se8 + 8, 0x20)
									st64(sf8 + 8, 0x20)
									st64(s108 + 8, 4)
									st64(s28, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
									// PDA create_program_address(["pool", *(ld64(s5b0)), *(ld64(s5a8)), *(ld64(s5a8 + 8)), (bp != 0 ? bq : 1)[..(bp != 0) << 1], bo[..1]], program *s28)
									const bs = Pubkey_create_program_address(s148, s108, 6, s28, br)
									if (ld8(s148) != 1) {
										copyr(s48, s147, 0x20)
										copy(s68, s2c0, 0x20)
										j = Error_with_pubkeys(s320, bl, bm, s68, bs)
										const bt = ld64(s320)
										st64(bi + 8, ld64(s320 + 8))
										st64(bi, bt)
										st8(bi + 0x71, 2)
										st64(bg, ld64(bg) - 1)
										return j
									}
									st8(s150, ld8(s147))
									fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s150, 0x100160228, 0x100160248)
								}
								fn_153158(0x2800, p, 0x1001605f0, r, 0x2a81f931cd559bc0 /* account:TickArrayState */)
							}
						}
						j = anchor_error_from(s330, bh, bh, r, s)
						bk = ld64(s330 + 8)
						bj = ld64(s330)
						st64(bg, ld64(bg) - 1)
					}
					st64(bi, bj, bk)
					st8(bi + 0x71, 2)
					if (bl != 0) {
						void ld64(bm)
						void ld8(bm + 0x38)
						return j
					}
					void ld64(bm)
					void ld8(bm + 0x50)
					return j
				}
				st8(s28, ld8(s67))
				fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s28, 0x100160228, 0x100160248)
			}
			fn_153158(0x2800, p, 0x1001605f0, 0x2a81f931cd559bc0 /* account:TickArrayState */, s)
		}
	}
	j = anchor_error_from(s4a0, v, v, r, s)
	y = ld64(s4a0 + 8)
	x = ld64(s4a0)
	st64(u, ld64(u) - 1)
	w = ld64(s500 + 0x10)
	st64(w, x, y)
	st8(w + 0x71, 2)
	return j
}

export function fn_21b58(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s30 = fp - 0x30, s218 = fp - 0x218, s230 = fp - 0x230, s418 = fp - 0x418, s5fd = fp - 0x5fd, s614 = fp - 0x614, s628 = fp - 0x628, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s668 = fp - 0x668, s680 = fp - 0x680, s708 = fp - 0x708, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let x, au, az, be, bf, bi, bw, by, bz, cg, ch: u64
	st64(s668 + 8, c)
	let f = ld64(d)
	let n = fn_6c2a0(s230, f, p7)
	if (ld8(s230) != 0) {
		const w = ld64(s230 + 8)
		st64(a + 8, ld64(s230 + 0x10))
		st64(a, w)
		st8(a + 0x71, 2)
		return n
	}
	st64(s708 + 0x60, a)
	st64(s680 + 0x10, p6)
	let h = p5
	st32(s614 + 3, ld32(s230 + 4))
	st32(s614, ld32(s230 + 1))
	st64(s668, ld64(s230 + 8))
	st64(s680 + 8, ld64(s230 + 0x10))
	memcpy(s418, s218, 0x1e4)
	memcpy(s5fd, s418, 0x1e4)
	st64(s614 + 0xf, ld64(s680 + 8))
	st64(s614 + 7, ld64(s668))
	st64(s668, b)
	const g = ld64(s668 + 8)
	st64(s680, 0, 0)
	st64(s708 + 0x68, f)
	st64(s708 + 0x80, h)
	if ((b | g) != 0) {
		B14: {
			st64(s680, ld64(f + 0x125))
			st64(s708 + 0x70, ld64(f + 0x11d))
			st64(s708 + 0x78, ld64(f + 0x115))
			st64(s708 + 0x58, ld64(f + 0x10d))
			const o = ld32(f + 0x105)
			const j = ld64(h + 0x1c)
			const i = ld64(h + 0x14)
			fn_5b258(s230, i, j, ld64(s668), g)
			n = ld64(s230 + 8)
			if (ld64(s230) != 0) {
				st64(s680 + 8, ld64(s230 + 0x10))
				x = n
				n = ld64(s680 + 0x10)
			} else {
				const l = ld64(h + 0x84)
				const k = ld64(h + 0x7c)
				st64(s680 + 8, l)
				let m = ld64(s230 + 0x10)
				st64(s708 + 0x50, m)
				if (k > k + l) {
					fn_88360(s628, 0x26)
					m = ld64(s708 + 0x50)
					st64(s680 + 8, ld64(s628 + 8))
					x = ld64(s628)
					if (x != 2) {
						bw = ld64(s708 + 0x60)
						st64(bw + 8, ld64(s680 + 8))
						st64(bw, x)
						st8(bw + 0x71, 2)
						return n
					}
				} else {
					st64(s680 + 8, ld64(s680 + 8) + k)
				}
				let v = 0
				if (((i | j) == 0) != ((n | m) == 0)) {
					v = ld64(s680 + 8) == 0
				}
				const p = ld64(s708 + 0x80)
				if ((i | j) == 0 && (o as i32) >= (ld32(p) as i32)) {
					st64(p + 0x34, ld64(s708 + 0x70))
					st64(p + 0x24, ld64(s708 + 0x58))
					st64(p + 0x3c, ld64(s680))
					st64(p + 0x2c, ld64(s708 + 0x78))
					const br = ld64(s5fd + 0x82)
					const bq = ld64(s5fd + 0x8a)
					const bp = ld64(s5fd + 0x12b)
					const bo = ld64(s5fd + 0x133)
					const bn = ld64(s5fd + 0x1d4)
					st64(p + 0x6c, ld64(s5fd + 0x1dc))
					st64(p + 0x64, bn)
					st64(p + 0x5c, bo)
					st64(p + 0x54, bp)
					st64(p + 0x4c, bq)
					st64(p + 0x44, br)
				}
				st64(p + 0x14, n)
				st64(p + 0x1c, ld64(s708 + 0x50))
				const q = ld64(p + 4)
				const r = ld64(s668)
				const s = ld64(p + 0xc)
				const t = ld64(s668 + 8)
				const u = s + t + (q > q + r)
				n = ld64(s680 + 0x10)
				if (((~(s ^ t) & (s ^ u)) as i64) >= 0) {
					st64(p + 4, q + r, u)
					st64(s680 + 8, v & 1)
					break B14
				}
				fn_88360(s638, 0x26)
				n = ld64(s680 + 0x10)
				st64(s680 + 8, ld64(s638 + 8))
				x = ld64(s638)
			}
			if (x != 2) {
				bw = ld64(s708 + 0x60)
				st64(bw + 8, ld64(s680 + 8))
				st64(bw, x)
				st8(bw + 0x71, 2)
				return n
			}
		}
		const y = ld64(s708 + 0x68)
		st64(s708 + 0x78, ld64(y + 0x125))
		st64(s708 + 0x58, ld64(y + 0x11d))
		st64(s708 + 0x70, ld64(y + 0x115))
		st64(s708 + 0x50, ld64(y + 0x10d))
		const ag = ld32(y + 0x105)
		const aa = ld64(n + 0x1c)
		const z = ld64(n + 0x14)
		const ab = n
		n = fn_5b258(s230, z, aa, ld64(s668), ld64(s668 + 8))
		const ae = ld64(s230 + 8)
		if (ld64(s230) != 0) {
			st64(s680, ld64(s230 + 0x10))
			x = ae
			if (ae != 2) {
				bw = ld64(s708 + 0x60)
				st64(bw + 8, ld64(s680))
				st64(bw, x)
				st8(bw + 0x71, 2)
				return n
			}
		} else {
			const ad = ld64(ab + 0x84)
			const ac = ld64(ab + 0x7c)
			st64(s680, ad)
			n = ab
			let af = ld64(s230 + 0x10)
			if (ac > ac + ad) {
				st64(s708 + 0x48, af)
				fn_88360(s648, 0x26)
				af = ld64(s708 + 0x48)
				n = ld64(s680 + 0x10)
				st64(s680, ld64(s648 + 8))
				x = ld64(s648)
				if (x != 2) {
					bw = ld64(s708 + 0x60)
					st64(bw + 8, ld64(s680))
					st64(bw, x)
					st8(bw + 0x71, 2)
					return n
				}
			} else {
				st64(s680, ld64(s680) + ac)
			}
			let ao = ld64(s680) == 0
			const an = (ae | af) == 0
			let ai = ld64(s668)
			const am = (z | aa) == 0
			if ((z | aa) == 0 && (ag as i32) >= (ld32(n) as i32)) {
				st64(s680, ao)
				st64(n + 0x34, ld64(s708 + 0x58))
				st64(n + 0x24, ld64(s708 + 0x50))
				st64(n + 0x3c, ld64(s708 + 0x78))
				st64(n + 0x2c, ld64(s708 + 0x70))
				st64(s708 + 0x78, ld64(s5fd + 0x82))
				const bv = ld64(s5fd + 0x8a)
				const bu = ld64(s5fd + 0x12b)
				const bt = ld64(s5fd + 0x133)
				const bs = ld64(s5fd + 0x1d4)
				st64(ld64(s680 + 0x10) + 0x6c, ld64(s5fd + 0x1dc))
				ai = ld64(s668)
				st64(ld64(s680 + 0x10) + 0x64, bs)
				st64(ld64(s680 + 0x10) + 0x5c, bt)
				st64(ld64(s680 + 0x10) + 0x54, bu)
				n = ld64(s680 + 0x10)
				st64(n + 0x4c, bv)
				ao = ld64(s680)
				st64(n + 0x44, ld64(s708 + 0x78))
			}
			st64(n + 0x14, ae, af)
			const aj = ld64(n + 0xc)
			const ah = ld64(n + 4)
			const ak = ld64(s668 + 8)
			const al = aj - ak - (ai > ah)
			const ap = ld64(s680 + 0x10)
			if (0 > (((aj ^ ak) & (aj ^ al)) as i64)) {
				n = fn_88360(s658, 0x26)
				st64(s680, ld64(s658 + 8))
				x = ld64(s658)
				if (x != 2) {
					bw = ld64(s708 + 0x60)
					st64(bw + 8, ld64(s680))
					st64(bw, x)
					st8(bw + 0x71, 2)
					return n
				}
			} else {
				st64(ap + 4, ah - ai, al)
				st64(s680, (am ^ an) & ao)
			}
		}
		f = ld64(s708 + 0x68)
		h = ld64(s708 + 0x80)
	}
	const ay = ld64(h + 0x2c)
	const ax = ld64(h + 0x24)
	st64(s708 + 0x50, ld64(f + 0x125))
	const at = ld64(f + 0x11d)
	st64(s708 + 0x58, ld64(f + 0x115))
	const aw = ld64(f + 0x10d)
	const aq = ld32(h)
	const ar = ld32(f + 0x105)
	st64(s708 + 0x38, aq as i32)
	if ((ar as i32) >= (aq as i32)) {
		st64(s708 + 0x30, ld64(h + 0x3c))
		st64(s708 + 0x40, ld64(h + 0x34))
		be = ax
		st64(s708 + 0x28, ay)
		az = ld64(s680 + 0x10)
		au = at
	} else {
		const av = ld64(h + 0x34)
		au = at
		st64(s708 + 0x30, ld64(s708 + 0x50) - ld64(h + 0x3c) - (av > at))
		st64(s708 + 0x28, ld64(s708 + 0x58) - ay - (ax > aw))
		be = aw - ax
		st64(s708 + 0x40, at - av)
		az = ld64(s680 + 0x10)
	}
	const bd = ld64(az + 0x2c)
	const bc = ld64(az + 0x24)
	const ba = ld32(az)
	st64(s708 + 0x78, aw)
	st64(s708 + 0x48, ba as i32)
	st64(s708 + 0x70, au)
	if ((ba as i32) > (ar as i32)) {
		st64(s708 + 0x20, ld64(az + 0x3c))
		bi = ld64(az + 0x34)
		bf = bc
		st64(s708 + 0x18, bd)
	} else {
		st64(s708 + 0x20, ld64(az + 0x3c))
		const bb = ld64(az + 0x34)
		st64(s708 + 0x20, ld64(s708 + 0x50) - ld64(s708 + 0x20) - (bb > au))
		st64(s708 + 0x18, ld64(s708 + 0x58) - bd - (bc > aw))
		bf = aw - bc
		bi = au - bb
		az = ld64(s680 + 0x10)
	}
	B47: {
		fn_74768(s30, ld64(s708 + 0x80), az, ar as i32, s614)
		const bg = be + bf
		bz = be > bg
		const bh = ld64(s708 + 0x40)
		const bj = bh + bi
		by = bh > bj
		const bm = ld64(s668 + 8)
		const cs = ld64(s708 + 0x80)
		const bl = bj > ld64(s708 + 0x70)
		const bk = bg > ld64(s708 + 0x78)
		st64(s708 + 0x40, bg)
		st64(s708, bl, bj, bk)
		if (0 > (bm as i64)) {
			if ((ld64(s680 + 8) & 1) != 0) {
				memset2(cs + 4, 0, 0x70)
			}
			const bx = ld64(s680 + 0x10)
			if ((ld64(s680) & 1) != 0) {
				memset2(bx + 4, 0, 0x70)
			}
		} else {
			ch = 0
			cg = 0
			if ((ld64(s668) | bm) == 0) {
				break B47
			}
		}
		st64(s708 + 0x80, by)
		const cf = bz
		const ca = ld64(s708 + 0x68)
		const cd = ld64(ca + 0xfd)
		const cc = ld64(ca + 0xf5)
		copyr(sff0, s668, 0x10)
		st64(sff8, ld64(s708 + 0x48))
		const cb = ld64(s708 + 0x38)
		st64(s1000, cb)
		n = fn_5d8d8(s230, ar as i32, cc, cd, cb, ld64(sff8), ld64(sff0), ld64(sff0 + 8))
		cg = ld64(s230 + 0x10)
		ch = ld64(s230 + 8)
		if (ld64(s230) != 0) {
			const cr = ld64(s708 + 0x60)
			st64(cr + 8, cg)
			st64(cr, ch)
			st8(cr + 0x71, 2)
			return n
		}
		const ce = ld32(ca + 0x105)
		bz = cf
		by = ld64(s708 + 0x80)
		if ((ce as i32) >= (cb as i64) && (ld64(s708 + 0x48) as i64) > (ce as i32)) {
			st64(s680 + 0x10, cg)
			const cl = ch
			const ci = ld64(s708 + 0x68)
			n = fn_5b258(s230, ld64(ci + 0xe5), ld64(ci + 0xed), ld64(s668), ld64(s668 + 8))
			const cj = ld64(s230 + 0x10)
			const ck = ld64(s230 + 8)
			if (ld64(s230) != 0) {
				const ct = ld64(s708 + 0x60)
				st64(ct + 8, cj)
				st64(ct, ck)
				st8(ct + 0x71, 2)
				return n
			}
			st64(ci + 0xed, cj)
			st64(ci + 0xe5, ck)
			ch = cl
			cg = ld64(s680 + 0x10)
		}
	}
	st64(s680 + 0x10, cg)
	st64(s668 + 8, ch)
	const cp = ld64(s708 + 0x50) - (ld64(s708 + 0x30) + ld64(s708 + 0x20) + by) - ld64(s708)
	const cq = ld64(s708 + 0x58) - (ld64(s708 + 0x28) + ld64(s708 + 0x18) + bz) - ld64(s708 + 0x10)
	st64(s708 + 0x70, ld64(s708 + 0x70) - ld64(s708 + 8))
	const cn = ld64(s708 + 0x40)
	const cm = ld64(s708 + 0x78)
	const co = ld64(s708 + 0x60)
	n = memcpy(co + 0x20, s30, 0x30)
	st64(co + 0x18, cp)
	st64(co + 0x10, ld64(s708 + 0x70))
	st64(co + 8, cq)
	st64(co, cm - cn)
	st64(co + 0x58, ld64(s680 + 0x10))
	st64(co + 0x50, ld64(s668 + 8))
	st8(co + 0x71, ld64(s680) & 1)
	st8(co + 0x70, ld64(s680 + 8) & 1)
	st64(co + 0x60, 0, 0)
	return n
}

export function fn_22e28(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64, p13: u64, p14: u64, p15: u64): u64 {
	const s20 = fp - 0x20, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd8 = fp - 0xd8, sf8 = fp - 0xf8, s1a8 = fp - 0x1a8, s1c0 = fp - 0x1c0, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8, s218 = fp - 0x218, s240 = fp - 0x240, s248 = fp - 0x248, s258 = fp - 0x258, s260 = fp - 0x260, s268 = fp - 0x268, s280 = fp - 0x280, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b0 = fp - 0x2b0, s2c8 = fp - 0x2c8, s2d0 = fp - 0x2d0, s2d8 = fp - 0x2d8, s338 = fp - 0x338, s340 = fp - 0x340, s358 = fp - 0x358, s360 = fp - 0x360, s368 = fp - 0x368, s380 = fp - 0x380, s388 = fp - 0x388, s390 = fp - 0x390, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s450 = fp - 0x450, s468 = fp - 0x468, s488 = fp - 0x488, s4a0 = fp - 0x4a0, s4e8 = fp - 0x4e8, s4f0 = fp - 0x4f0, s4f8 = fp - 0x4f8, s500 = fp - 0x500, s508 = fp - 0x508, s510 = fp - 0x510, s518 = fp - 0x518, s520 = fp - 0x520, s528 = fp - 0x528, s530 = fp - 0x530, s538 = fp - 0x538, s540 = fp - 0x540, s548 = fp - 0x548, s550 = fp - 0x550, s558 = fp - 0x558, s560 = fp - 0x560, s568 = fp - 0x568, s570 = fp - 0x570, s578 = fp - 0x578, s580 = fp - 0x580, s588 = fp - 0x588, s590 = fp - 0x590, s598 = fp - 0x598, s5a0 = fp - 0x5a0, s5a8 = fp - 0x5a8, s5b0 = fp - 0x5b0, s5b8 = fp - 0x5b8, s5c0 = fp - 0x5c0, s5c8 = fp - 0x5c8, s5d0 = fp - 0x5d0, s5d8 = fp - 0x5d8, s5e0 = fp - 0x5e0, s5e8 = fp - 0x5e8, s5f0 = fp - 0x5f0, s5f8 = fp - 0x5f8, s600 = fp - 0x600, s1000 = fp - 0x1000
	let ag, ah, am, bc, fc: u64
	let af: AccountInfo
	st64(s488 + 0x18, d)
	const f: LamportsCell = c.lamports
	const l = c.key
	rc_inc(f)
	st64(s450 + 0x30, a)
	const g: DataCell = c.data
	st64(s450 + 0x20, g)
	const h = g.strong
	st64(s450 + 0x18, p15)
	const k = p14
	st64(s468 + 0x10, p13)
	st64(s4e8 + 0x40, p12)
	st64(s488 + 8, p11)
	st64(s450, p10, p9)
	st64(s4a0, p8, p7)
	const j = p6
	const r: AccountInfo = p5
	const i = ld64(s450 + 0x20)
	rc_inc(i, h)
	st64(s450 + 0x28, j)
	st64(s488 + 0x10, k)
	st64(s4a0 + 0x10, b)
	const q = c.owner
	const p = c.rent_epoch
	const o = c.is_signer
	const n = c.is_writable
	const m = c.executable
	st64(s388, i)
	st64(s488, f)
	st64(s398, l, f)
	st64(s4e8 + 0x18, m)
	st8(s380 + 0x12, m)
	st64(s4e8 + 0x20, n)
	st8(s380 + 0x11, n)
	st64(s4e8 + 0x28, o)
	st8(s380 + 0x10, o)
	st64(s4e8 + 0x30, p)
	st64(s380 + 8, p)
	st64(s4e8 + 0x38, q)
	st64(s380, q)
	const s: LamportsCell = r.lamports
	const y = r.key
	rc_inc(s)
	st64(s4e8 + 0x10, l)
	st64(s450 + 0x10, c)
	const t: DataCell = r.data
	rc_inc(t)
	st64(s468, s390, s388)
	const x = r.owner
	const w = r.rent_epoch
	const v = r.is_signer
	const u = r.is_writable
	st8(s340 + 2, r.executable)
	st8(s340, v, u)
	st64(s368, y, s, t, x, w)
	let bo = fn_4dc0(s268, ld64(s450 + 0x10), w)
	const z = ld64(s258)
	let aa = ld64(s260)
	let fd = z
	if (ld64(s268) == 0) {
		B83: {
			const ab = ld16(aa + 0x17f)
			let du: AccountInfo = ld64(s450 + 0x28)
			const ac = ld64(s450 + 8)
			st64(s338, 0x10015984c, 4, aa + 1, 0x20, aa + 0x41, 0x20, aa + 0x61, 0x20, ab != 0 ? aa + 0x17f : 1, (ab != 0) << 1, aa, 1)
			const ad = ld64(ac)
			if ((memcmp(ld64(s358 + 8), ad, 0x20) as u32) == 0) {
				ag = ld64(ac + 8)
				af = ac
				rc_inc(ag)
				ah = af.data
				bc = z
				am = ad
				rc_inc(ah)
			} else {
				const ae = ld64(s450)
				if (ae == 0) {
					bo = fn_88360(s3a8, 0x32)
					fd = ld64(s3a8 + 8)
					aa = ld64(s3a8)
					bc = z
					break B83
				}
				af = ld64(ae)
				ag = af.lamports
				bc = z
				am = af.key
				rc_inc(ag)
				ah = af.data
				rc_inc(ah)
			}
			B79: {
				B51: {
					const al = af.owner
					const ak = af.rent_epoch
					const aj = af.is_signer
					const ai = af.is_writable
					st8(s2b0 + 2, af.executable)
					st8(s2b0, aj, ai)
					st64(s2d8, am, ag, ah, al, ak)
					if (ld64(s468 + 0x10) != 0) {
						const an = ld64(ld64(s488 + 0x18))
						copyr(s20, an, 0x20)
						const ao = ld64(0x300000000 /* heap bump-allocator cursor */)
						st64(s450 + 8, ag)
						const ap = ao != 0 ? sat_sub(ao, 0x1e) : 0x300007fe2
						if (ap > 0x300000007) {
							st64(0x300000000 /* heap bump-allocator cursor */, ap)
							st64(ap + 0x16, 0x7974696469757169)
							st64(ap + 0x10, 0x71694c2064657461)
							st64(ap + 8, 0x72746e65636e6f43)
							st64(ap, 0x206d756964796152)
							const aq = ld64(0x300000000 /* heap bump-allocator cursor */)
							const ar = aq != 0 ? sat_sub(aq, 3) : 0x300007ffd
							if (ar > 0x300000007) {
								st64(0x300000000 /* heap bump-allocator cursor */, ar)
								st8(ar + 2, 0x4c)
								st64(s468 + 0x10, ar)
								st16(ar, 0x4352)
								st64(s280, 0, 1, 0)
								st64(s248, s280, 0x10015f818)
								st8(s240 + 0x10, 3)
								st64(s240 + 8, 0x20)
								st64(s258, 0)
								st64(s268, 0)
								if (fn_14b198(s20, s268) != 0) {
									fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, sc0, 0x10015f848, 0x10015f868)
								}
								copyr(s298, s280, 0x18)
								st64(s2a8, s298, fn_15960)
								st64(sc0, 0x10015fb38, 1, s2a8, 1, 0)
								// fmt "https://dynamic-ipfs.raydium.io/clmm/position?id={}" {} = *s298 [fn_15960]
								fn_14de10(s268, sc0)
								const ax = ld64(s258)
								const bd = ld64(s260)
								const ay = ld64(s268)
								if (ld64(s488 + 0x10) != 0) {
									st64(s450 + 0x20, am)
									const at: AccountInfo = ld64(s488 + 0x18)
									const au: LamportsCell = at.lamports
									const bm = at.key
									rc_inc(au)
									st64(s4e8, bd, bc)
									const be: DataCell = at.data
									st64(s488 + 0x10, be)
									const bf = be.strong
									st64(s4f0, ay)
									const bg = ld64(s488 + 0x10)
									rc_inc(bg, bf)
									const bl = at.owner
									const bk = at.rent_epoch
									const bj = at.is_signer
									const bi = at.is_writable
									const bh = at.executable
									st8(s240, bj, bi, bh)
									st64(s268, bm, au, bg, bl, bk)
									st64(s488 + 0x18, s258)
									st64(s488 + 8, s260)
									const bn = ld64(s450)
									if (bn == 0) {
										bo = fn_88360(s418, 0x32)
										fd = ld64(s418 + 8)
										aa = ld64(s418)
										bc = ld64(s4e8 + 8)
									} else {
										st64(s280, 0x1e, ap, 0x1e)
										st64(s20 + 8, ld64(s468 + 0x10))
										st64(s20 + 0x10, 3)
										st64(s20, 3)
										st64(sb0, ax)
										copyr(sc0, s4f0, 0x10)
										st64(s298, s338, 6)
										st64(s1000, s268, bn, s280, s20, sc0, s298, 1)
										bo = fn_80720(s3d8, ld64(s4a0 + 0x10), s368, s398, s268, bn, s280, s20, sc0, s298, 1, bh)
										fd = ld64(s3d8 + 8)
										aa = ld64(s3d8)
										bc = ld64(s4e8 + 8)
										if (aa == 2) {
											let bp = ld64(s488 + 0x10)
											if (rc_release(au)) {
												bo = Rc_drop_slow_14df0(ld64(s488 + 8), bo)
												bp = ld64(s488 + 0x10)
											}
											du = ld64(s450 + 0x28)
											am = ld64(s450 + 0x20)
											ag = ld64(s450 + 8)
											if (!rc_release(bp)) {
												break B51
											}
											Rc_drop_slow_14df0(ld64(s488 + 0x18), bo)
											break B51
										}
									}
									let fe = ld64(s488 + 0x10)
									if (rc_release(au)) {
										bo = Rc_drop_slow_14df0(ld64(s488 + 8), bo)
										fe = ld64(s488 + 0x10)
									}
									if (rc_release(fe)) {
										bo = Rc_drop_slow_14df0(ld64(s488 + 0x18), bo)
									}
									break B79
								}
								const av = ld64(s4a0 + 8)
								const aw = ld64(s4a0)
								if (av != 0 && aw != 0) {
									st64(s4f8, ax, ay)
									st64(s280, s338, 6)
									const az: AccountInfo = ld64(aw)
									const ba: LamportsCell = az.lamports
									st64(s450 + 8, ba)
									const bb = ba.strong
									const bs: AccountInfo = ld64(av)
									const cd: AccountInfo = ld64(ld64(s4a0 + 0x10))
									st64(s4a0 + 0x10, az.key)
									rc_inc(ld64(s450 + 8), bb)
									const bq: DataCell = az.data
									st64(s450, bq)
									const br = bq.strong
									rc_inc(ld64(s450), br)
									const bt: LamportsCell = bs.lamports
									const bu = bt.strong
									st64(s520, bs.key)
									st64(s518, az.executable)
									st64(s510, az.is_writable)
									st64(s508, az.is_signer)
									st64(s500, az.rent_epoch)
									st64(s4a0, az.owner)
									st64(s4a0 + 8, bt)
									rc_inc(bt, bu)
									const bv: DataCell = bs.data
									const bw = bv.strong
									st64(s4e8, bd)
									rc_inc(bv, bw)
									st64(s488 + 0x10, bv)
									const bx: LamportsCell = ld64(s360)
									const by = bx.strong
									st64(s540, bs.executable)
									st64(s538, bs.is_writable)
									st64(s530, bs.is_signer)
									st64(s528, bs.rent_epoch)
									const cl = bs.owner
									st64(s548, ld64(s368))
									rc_inc(bx, by)
									const bz: DataCell = ld64(s358)
									rc_inc(bz)
									const ca = ld64(s488)
									const cb = ld64(ca)
									st64(s570, ld8(s340 + 2))
									st64(s568, ld8(s340 + 1))
									st64(s560, ld8(s340))
									st64(s558, ld64(s358 + 0x10))
									st64(s550, ld64(s358 + 8))
									const cc = ld64(s450 + 0x20)
									rc_inc(ca, cb)
									rc_inc(cc)
									const ce: LamportsCell = cd.lamports
									st64(s488 + 0x18, ce)
									const cf = ce.strong
									st64(s578, cd.key)
									rc_inc(ld64(s488 + 0x18), cf)
									const cg: DataCell = cd.data
									rc_inc(cg)
									st64(s5a0, cd.executable)
									st64(s598, cd.is_writable)
									st64(s590, cd.is_signer)
									st64(s588, cd.rent_epoch)
									st64(s580, cd.owner)
									const ch = ld64(s488)
									const cp: AccountInfo = ld64(s4e8 + 0x40)
									rc_inc(ch)
									const ci = ld64(cc)
									st64(cc, ci + 1)
									st64(s5a8, bz)
									if (ci != -1) {
										st64(s5b8, cg)
										const cj = ld64(ld64(s488 + 8) + 8)
										const ck = ld64(cj)
										st64(s5b0, cl)
										const cm = ld64(s488 + 8)
										const ct = ld64(cm)
										rc_inc(cj, ck)
										const cn = ld64(cm + 0x10)
										const co = ld64(cn)
										st64(s5c0, bx)
										rc_inc(cn, co)
										st64(s5d0, cj)
										const cq: LamportsCell = cp.lamports
										const cr = cq.strong
										st64(s5f0, cp.key)
										const cs: AccountInfo = ld64(s488 + 8)
										st64(s5e8, cs.executable)
										st64(s5e0, cs.is_writable)
										st64(s5d8, cs.is_signer)
										st64(s5c8, cs.rent_epoch)
										st64(s488 + 8, cs.owner)
										rc_inc(cq, cr)
										st64(s600, ct)
										const cu: DataCell = cp.data
										const cv = cu.strong
										st64(s5f8, ap)
										rc_inc(cu, cv)
										const cz = cp.owner
										const cy = cp.rent_epoch
										const cx = cp.is_signer
										const cw = cp.is_writable
										st8(sd8 + 2, cp.executable)
										st8(sd8, cx, cw)
										st64(sf8, cq, cu, cz, cy)
										st64(s1a8 + 0xa8, ld64(s5f0))
										st8(s1a8 + 0xa2, ld64(s5e8))
										st8(s1a8 + 0xa1, ld64(s5e0))
										st8(s1a8 + 0xa0, ld64(s5d8))
										st64(s1a8 + 0x98, ld64(s5c8))
										st64(s1a8 + 0x90, ld64(s488 + 8))
										st64(s1a8 + 0x88, cn)
										st64(s1a8 + 0x80, ld64(s5d0))
										st64(s1a8 + 0x78, ld64(s600))
										st8(s1a8 + 0x42, ld64(s5a0))
										st8(s1a8 + 0x41, ld64(s598))
										st8(s1a8 + 0x40, ld64(s590))
										st64(s1a8 + 0x38, ld64(s588))
										st64(s1a8 + 0x30, ld64(s580))
										st64(s1a8 + 0x28, ld64(s5b8))
										st64(s1a8 + 0x20, ld64(s488 + 0x18))
										st64(s1a8 + 0x18, ld64(s578))
										const da = ld64(s4e8 + 0x18)
										st8(s1a8 + 0x72, da)
										st8(s1a8 + 0x12, da)
										const db = ld64(s4e8 + 0x20)
										st8(s1a8 + 0x71, db)
										st8(s1a8 + 0x11, db)
										const dc = ld64(s4e8 + 0x28)
										st8(s1a8 + 0x70, dc)
										st8(s1a8 + 0x10, dc)
										const dd = ld64(s4e8 + 0x30)
										st64(s1a8 + 0x68, dd)
										st64(s1a8 + 8, dd)
										const de = ld64(s4e8 + 0x38)
										st64(s1a8 + 0x60, de)
										st64(s1a8, de)
										const df = ld64(s450 + 0x20)
										st64(s1a8 + 0x58, df)
										st64(s1c0 + 0x10, df)
										const dg = ld64(s488)
										st64(s1a8 + 0x50, dg)
										st64(s1c0 + 8, dg)
										const dh = ld64(s4e8 + 0x10)
										st64(s1a8 + 0x48, dh)
										st64(s1c0, dh)
										st8(s1f0 + 0x2a, ld64(s570))
										st8(s1f0 + 0x29, ld64(s568))
										st8(s1f0 + 0x28, ld64(s560))
										st64(s1f0 + 0x20, ld64(s558))
										st64(s1f0 + 0x18, ld64(s550))
										st64(s1f0 + 0x10, ld64(s5a8))
										st64(s1f0 + 8, ld64(s5c0))
										st64(s1f0, ld64(s548))
										st8(s1f8 + 2, ld64(s540))
										st8(s1f8 + 1, ld64(s538))
										st8(s1f8, ld64(s530))
										st64(s218 + 0x18, ld64(s528))
										st64(s218 + 0x10, ld64(s5b0))
										st64(s218 + 8, ld64(s488 + 0x10))
										st64(s218, ld64(s4a0 + 8))
										st64(s240 + 0x20, ld64(s520))
										st64(sd8 + 8, s280)
										st8(s240 + 0x1a, ld64(s518))
										st8(s240 + 0x19, ld64(s510))
										st8(s240 + 0x18, ld64(s508))
										st64(s240 + 0x10, ld64(s500))
										st64(s240 + 8, ld64(s4a0))
										st64(s240, ld64(s450))
										st64(s248, ld64(s450 + 8))
										st64(s258 + 8, ld64(s4a0 + 0x10))
										st64(sd8 + 0x10, 1)
										st64(s268, 0, 8, 0)
										const di = ld64(0x300000000 /* heap bump-allocator cursor */)
										const dm = ld64(s5f8)
										const dl = ld64(s468 + 0x10)
										const dk = ld64(s4e8)
										const dj = di != 0 ? sat_sub(di, 0x22) : 0x300007fde
										if (dj > 0x300000007) {
											st64(0x300000000 /* heap bump-allocator cursor */, dj)
											copyr(s20, dh, 0x20)
											st8(dj, 1)
											copy(dj + 1, s20, 0x20)
											st8(dj + 0x21, 0x64 /* anchor::InstructionMissing */)
											st64(sb0 + 0x30, ld64(s4f8))
											st64(sb0 + 0x28, dk)
											st64(sb0 + 0x20, ld64(s4f0))
											st64(sb0 + 0x10, dl)
											st64(sc0 + 8, dm)
											st64(sb0 + 0x40, dj)
											st16(sb0 + 0x68, 0)
											st64(sb0 + 0x18, 3)
											st64(sb0, 0x1e, 3)
											st64(sc0, 0x1e)
											st8(sb0 + 0x6a, 2)
											st64(sb0 + 0x48, 1)
											st64(sb0 + 0x38, 1)
											st8(sb0 + 0x60, 3)
											st8(s20, 2)
											st64(s1000, 1, s20)
											bo = metadata_create_metadata_accounts_v3(s3b8, s268, sc0, 0, fp)
											fd = ld64(s3b8 + 8)
											aa = ld64(s3b8)
											if (aa != 2) {
												break B79
											}
											ag = ld64(s2d0)
											am = ld64(s2d8)
											du = ld64(s450 + 0x28)
											break B51
										}
										alloc_handle_alloc_error(1, 0x22)
									}
									abort()
								}
								bo = fn_88360(s3c8, 2)
								fd = ld64(s3c8 + 8)
								aa = ld64(s3c8)
								break B79
							}
							raw_vec_handle_error(1, 3, 0x10015f8f8, 3 > aq, ai)
						}
						raw_vec_handle_error(1, 0x1e, 0x10015f8f8, 0x1e > ao, ai)
					}
				}
				rc_inc(ag)
				const dn = ld64(s2c8)
				rc_inc(dn)
				const dp: LamportsCell = ld64(s360)
				const dq = dp.strong
				st64(s4e8 + 0x38, ld64(s368))
				st64(s4e8 + 0x40, ld8(s2b0 + 2))
				st64(s4a0, ld8(s2b0 + 1))
				st64(s4a0 + 8, ld8(s2b0))
				st64(s4a0 + 0x10, ld64(s2c8 + 0x10))
				const dt = ld64(s2c8 + 8)
				rc_inc(dp, dq)
				const dr: DataCell = ld64(s358)
				const ds = dr.strong
				st64(s4e8 + 0x30, dt)
				rc_inc(dr, ds)
				st64(s4e8 + 8, bc)
				const dv: LamportsCell = du.lamports
				const dw = dv.strong
				st64(s450 + 0x20, am)
				st64(s450, du.key)
				st64(s4e8 + 0x10, ld8(s340 + 2))
				st64(s4e8 + 0x18, ld8(s340 + 1))
				st64(s4e8 + 0x20, ld8(s340))
				st64(s4e8 + 0x28, ld64(s358 + 0x10))
				const ed = ld64(s358 + 8)
				rc_inc(dv, dw)
				const dx: DataCell = du.data
				const dy = dx.strong
				st64(s468 + 0x10, dv)
				st64(s450 + 8, ag)
				rc_inc(dx, dy)
				const dz: LamportsCell = ld64(s390)
				const ea = dz.strong
				st64(s488, du.executable)
				st64(s488 + 8, du.is_writable)
				st64(s488 + 0x10, du.is_signer)
				st64(s488 + 0x18, du.rent_epoch)
				st64(s450 + 0x28, du.owner)
				const ec = ld64(s398)
				rc_inc(dz, ea)
				const eb = ld64(s388)
				rc_inc(eb)
				st8(s1a8 + 0x12, ld8(s380 + 0x12))
				st8(s1a8 + 0x11, ld8(s380 + 0x11))
				st8(s1a8 + 0x10, ld8(s380 + 0x10))
				copyr(s1a8, s380, 0x10)
				st64(s1c0, ec, dz, eb)
				st8(s1f0 + 0x2a, ld64(s488))
				st8(s1f0 + 0x29, ld64(s488 + 8))
				st8(s1f0 + 0x28, ld64(s488 + 0x10))
				st64(s1f0 + 0x20, ld64(s488 + 0x18))
				st64(s1f0 + 0x18, ld64(s450 + 0x28))
				st64(s1f0 + 0x10, dx)
				st64(s1f0 + 8, ld64(s468 + 0x10))
				st64(s1f0, ld64(s450))
				st8(s1f8 + 2, ld64(s4e8 + 0x10))
				st8(s1f8 + 1, ld64(s4e8 + 0x18))
				st8(s1f8, ld64(s4e8 + 0x20))
				st64(s218 + 0x18, ld64(s4e8 + 0x28))
				st64(s218, dp, dr, ed)
				st64(s240 + 0x20, ld64(s4e8 + 0x38))
				st64(sc0, s338, 6)
				st64(s1a8 + 0x18, sc0)
				st8(s240 + 0x1a, ld64(s4e8 + 0x40))
				st8(s240 + 0x19, ld64(s4a0))
				st8(s240 + 0x18, ld64(s4a0 + 8))
				st64(s240 + 0x10, ld64(s4a0 + 0x10))
				st64(s240 + 8, ld64(s4e8 + 0x30))
				st64(s240, dn)
				st64(s248, ld64(s450 + 8))
				st64(s258 + 8, ld64(s450 + 0x20))
				st64(s1a8 + 0x20, 1)
				st64(s268, 0, 8, 0)
				bo = token_2022_mint_to(s3e8, s268, 1)
				fd = ld64(s3e8 + 8)
				aa = ld64(s3e8)
				bc = ld64(s4e8 + 8)
				if (aa == 2) {
					if (ld64(s450 + 0x18) != 0) {
						const ev = ld64(s468 + 0x10)
						rc_inc(ev)
						rc_inc(dx)
						st8(s240 + 2, ld64(s488))
						st8(s240 + 1, ld64(s488 + 8))
						st8(s240, ld64(s488 + 0x10))
						st64(s248, ld64(s488 + 0x18))
						st64(s258 + 8, ld64(s450 + 0x28))
						st64(s258, dx)
						st64(s268, ld64(s450))
						st64(s260, ev)
						st64(sc0, s338, 6)
						st64(s1000, s2d8, sc0, 1)
						bo = fn_7c4c8(s3f8, s398, s268, s368, s2d8, sc0, 1)
						fd = ld64(s3f8 + 8)
						aa = ld64(s3f8)
						if (rc_release(ev)) {
							bo = Rc_drop_slow_14df0(s260, bo)
						}
						bc = ld64(s4e8 + 8)
						if (rc_release(dx)) {
							bo = Rc_drop_slow_14df0(s258, bo)
						}
						if (aa != 2) {
							break B79
						}
					}
					const ee = ld64(s2d0)
					const em = ld64(s2d8)
					const eg: AccountInfo = ld64(s450 + 0x10)
					rc_inc(ee)
					const ef = ld64(s2c8)
					rc_inc(ef)
					const eh: LamportsCell = eg.lamports
					const ei = eh.strong
					st64(s450, eg.key)
					st64(s450 + 8, ld8(s2b0 + 2))
					st64(s450 + 0x18, ld8(s2b0 + 1))
					st64(s450 + 0x20, ld8(s2b0))
					st64(s450 + 0x28, ld64(s2c8 + 0x10))
					const el = ld64(s2c8 + 8)
					rc_inc(eh, ei)
					const ej: DataCell = eg.data
					const ek = ej.strong
					st64(s488, el, eh, em, ef)
					st64(s468 + 0x10, ee)
					rc_inc(ej, ek)
					st64(s4a0 + 0x10, eg.owner)
					st64(s4a0 + 8, eg.rent_epoch)
					const ep = eg.is_signer
					const eo = eg.is_writable
					const en = eg.executable
					memcpy(s1f0, s368, 0x30)
					st8(s1f8, ep, eo, en)
					st64(s218 + 0x18, ld64(s4a0 + 8))
					st64(s218 + 0x10, ld64(s4a0 + 0x10))
					st64(s218 + 8, ej)
					st64(s218, ld64(s488 + 8))
					st64(s240 + 0x20, ld64(s450))
					st64(s1c0, s20)
					st8(s240 + 0x1a, ld64(s450 + 8))
					st8(s240 + 0x19, ld64(s450 + 0x18))
					st8(s240 + 0x18, ld64(s450 + 0x20))
					st64(s240 + 0x10, ld64(s450 + 0x28))
					st64(s240 + 8, ld64(s488))
					const eq = ld64(s488 + 0x18)
					st64(s240, eq)
					st64(s258 + 8, ld64(s488 + 0x10))
					st64(s20, s338)
					const er = ld64(s468 + 0x10)
					st64(s248, er)
					st64(s1c0 + 8, 1)
					st64(s268, 0, 8, 0)
					st64(s20 + 8, 6)
					st8(sc0, 0)
					bo = fn_12b7c0(s408, s268, 0, sc0)
					fd = ld64(s408 + 8)
					aa = ld64(s408)
					if (rc_release(er)) {
						bo = Rc_drop_slow_14df0(s2d0, bo)
					}
					const es = ld64(s4e8 + 8)
					if (rc_release(eq)) {
						bo = Rc_drop_slow_14df0(s2c8, bo)
					}
					st64(es, ld64(es) - 1)
					const et: LamportsCell = ld64(s390)
					if (rc_release(et)) {
						bo = Rc_drop_slow_14df0(ld64(s468), bo)
					}
					const eu = ld64(s388)
					if (!rc_release(eu)) {
						fc = ld64(s450 + 0x30)
						st64(fc + 8, fd)
						st64(fc, aa)
						return bo
					}
					bo = Rc_drop_slow_14df0(ld64(s468 + 8), bo)
					fc = ld64(s450 + 0x30)
					st64(fc + 8, fd)
					st64(fc, aa)
					return bo
				}
			}
			const ew = ld64(s2d0)
			if (rc_release(ew)) {
				bo = Rc_drop_slow_14df0(s2d0, bo)
			}
			const ex = ld64(s2c8)
			if (rc_release(ex)) {
				bo = Rc_drop_slow_14df0(s2c8, bo)
			}
		}
		st64(bc, ld64(bc) - 1)
	}
	const ey: LamportsCell = ld64(s360)
	if (rc_release(ey)) {
		bo = Rc_drop_slow_14df0(s360, bo)
	}
	const ez: DataCell = ld64(s358)
	if (rc_release(ez)) {
		bo = Rc_drop_slow_14df0(s358, bo)
	}
	const fa: LamportsCell = ld64(s390)
	if (rc_release(fa)) {
		bo = Rc_drop_slow_14df0(ld64(s468), bo)
	}
	const fb = ld64(s388)
	if (!rc_release(fb)) {
		fc = ld64(s450 + 0x30)
		st64(fc + 8, fd)
		st64(fc, aa)
		return bo
	}
	bo = Rc_drop_slow_14df0(ld64(s468 + 8), bo)
	fc = ld64(s450 + 0x30)
	st64(fc + 8, fd)
	st64(fc, aa)
	return bo
}

export function fn_2aa40(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s78 = fp - 0x78, s98 = fp - 0x98, sb8 = fp - 0xb8, s120 = fp - 0x120, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s178 = fp - 0x178, s198 = fp - 0x198, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8, s208 = fp - 0x208, s210 = fp - 0x210, s218 = fp - 0x218, s220 = fp - 0x220, s238 = fp - 0x238, s240 = fp - 0x240, s248 = fp - 0x248, s268 = fp - 0x268, s270 = fp - 0x270, s278 = fp - 0x278, s2d0 = fp - 0x2d0, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360
	let ac, ad, av, aw: u64
	copyr(s310, e - 0xfa0, 0x10)
	const f = ld64(c)
	let ao = fn_53e8(s158, f, c, d, e, r0)
	const g = ld64(s148)
	if (ld64(s158) != 0) {
		ad = ld64(s158 + 8)
		st64(a + 8, g)
		st64(a, ad)
		return ao
	}
	let ch = b
	const ca = ld64(e - 0xf80)
	let cb = ld64(e - 0xf88)
	let cc = ld64(e - 0xf90)
	const by = ld64(e - 0xfa8)
	const bz = ld64(e - 0xfb0)
	let ce = ld64(e - 0xfb8)
	let cf = ld64(e - 0xfc0)
	let cg = ld64(e - 0xfc8)
	let cd = ld64(e - 0xfd0)
	const m = ld64(e - 0xfd8)
	const i = ld64(e - 0xfe0)
	const k = ld64(e - 0xfe8)
	const j = ld64(e - 0xff0)
	let ci = ld64(e - 0xff8)
	const r = ld64(e - 0x1000)
	st64(s300 + 8, g)
	const h = ld64(s158 + 8)
	st64(s300, h)
	if ((ld8(h + 0x17d) & 1) == 0) {
		const l = ld64(0x300000000 /* heap bump-allocator cursor */)
		const n = l != 0 ? sat_sub(l, 8) & -4 : 0x300007ff8
		if (0x300000008 > n) {
			alloc_handle_alloc_error(4, 8)
		}
		const o = ld64(d)
		const p = ld32(o + 0x114)
		const q = ld32(o + 0x110)
		st64(0x300000000 /* heap bump-allocator cursor */, n)
		st32(n + 4, p)
		st32(n, q)
		st64(s158, 2, n, 2)
		const u = fn_6f618(h, s158)
		const s: AccountInfo = ld64(r)
		const t: LamportsCell = s.lamports
		const aa = s.key
		rc_inc(t)
		const v: DataCell = s.data
		rc_inc(v)
		const z = s.owner
		const y = s.rent_epoch
		const x = s.is_signer
		const w = s.is_writable
		st8(s220 + 2, s.executable)
		st8(s220, x, w)
		st64(s248, aa, t, v, z, y)
		ao = fn_84360(s158, s248)
		ac = ld64(s158 + 8)
		ad = ld64(s158)
		const ab = ld8(s138 + 0xa)
		if (ab == 2) {
			aw = a
		} else {
			st16(s268 + 0x18, ld16(s138 + 8))
			copyr(s268, s148, 0x18)
			st32(s268 + 0x1b, ld32(s138 + 0xb))
			st8(s268 + 0x1f, ld8(s138 + 0xf))
			st8(s268 + 0x1a, ab)
			st64(s278, ad, ac)
			const ae: AccountInfo = ld64(ci)
			const af: LamportsCell = ae.lamports
			const al = ae.key
			rc_inc(af)
			const ag: DataCell = ae.data
			rc_inc(ag)
			ci = s268
			const ak = ae.owner
			const aj = ae.rent_epoch
			const ai = ae.is_signer
			const ah = ae.is_writable
			st8(s1c0 + 2, ae.executable)
			st8(s1c0, ai, ah)
			st64(s1e8, al, af, ag, ak, aj)
			ao = fn_84360(s158, s1e8)
			ac = ld64(s158 + 8)
			ad = ld64(s158)
			const am = ld8(s138 + 0xa)
			if (am == 2) {
				aw = a
			} else {
				B35: {
					st16(s208 + 0x18, ld16(s138 + 8))
					copyr(s208, s148, 0x18)
					st32(s208 + 0x1b, ld32(s138 + 0xb))
					st8(s208 + 0x1f, ld8(s138 + 0xf))
					st8(s208 + 0x1a, am)
					st64(s218, ad, ac)
					let bd = 0
					const be = ch
					if (u != 0) {
						if (by == 0) {
							fn_14ec98(0, 0, 0x10015fb98)
						}
						const ax = ld64(bz)
						copyr(s1b8, ax, 0x20)
						const ay = ld64(f)
						copyr(s178, ay, 0x20)
						copyr(s48, s178, 0x20)
						st64(s28, 0x1001595c0, 0x20, s48, 0x20)
						st64(sb8, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
						// PDA find_program_address(["pool_tick_array_bitmap_extension", *ay], program *sb8)
						Pubkey_find_program_address(s158, s28, 2, sb8)
						copyr(s198, s158, 0x20)
						const az = memcmp(s1b8, s198, 0x20)
						bd = bz
						if ((az as u32) != 0) {
							ErrorCode_name(s48, 0x100159874)
							st64(s28, 0, 1, 0)
							st64(s98, s28, 0x10015f818)
							st8(s98 + 0x18, 3)
							st64(s98 + 0x10, 0x20)
							st64(sb8 + 0x10, 0)
							st64(sb8, 0)
							if (ErrorCode_fmt(0x100159874, sb8) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
							}
							copyr(s120, s28, 0x18)
							copy(s138, s48, 0x18)
							st64(s158 + 8, 0x100159ede)
							st32(s120 + 0x60, 0x9c6 /* anchor::RequireKeysEqViolated */)
							st8(s120 + 0x18, 2)
							st32(s148 + 8, 0xa6)
							st64(s148, 0x33)
							st64(s158, 0)
							fn_13e5a0(s330, s158)
							const bb = ld64(s330 + 8)
							const ba = ld64(s330)
							const bc = fn_76200(s138, s178)
							copyr(s158, s1b8, 0x20)
							ao = Error_with_pubkeys(s340, ba, bb, s158, bc)
							ac = ld64(s340 + 8)
							ad = ld64(s340)
							break B35
						}
					}
					ao = fn_1e428(s2f0, be, j, k, i, m, s278, s218, cg, cd, cf, ce, bd, s300, s310, cc, cb, q, p, ca)
					const bf = ld64(s2f0)
					if (ld8(s2d0 + 0x51) != 2) {
						ch = ld64(s2e8 + 0x10)
						cf = ld64(s2e8 + 8)
						cg = ld64(s2e8)
						let bj = memcpy(s78, s2d0, 0x30)
						ce = ld64(s2d0 + 0x30)
						cd = ld64(s2d0 + 0x38)
						cc = ld64(s2d0 + 0x40)
						cb = ld64(s2d0 + 0x48)
						const bi = ld64(s210)
						if (rc_release(bi)) {
							bj = Rc_drop_slow_14df0(s210, bj)
						}
						const bk = ld64(s208)
						if (rc_release(bk)) {
							bj = Rc_drop_slow_14df0(s208, bj)
						}
						const bl: LamportsCell = ld64(s1e0)
						if (rc_release(bl)) {
							bj = Rc_drop_slow_14df0(s1e0, bj)
						}
						const bm: DataCell = ld64(s1d8)
						if (rc_release(bm)) {
							bj = Rc_drop_slow_14df0(s1d8, bj)
						}
						const bn = ld64(s270)
						if (rc_release(bn)) {
							bj = Rc_drop_slow_14df0(s270, bj)
						}
						const bo = ld64(s268)
						if (rc_release(bo)) {
							bj = Rc_drop_slow_14df0(ci, bj)
						}
						const bp: LamportsCell = ld64(s240)
						if (rc_release(bp)) {
							bj = Rc_drop_slow_14df0(s240, bj)
						}
						const bq: DataCell = ld64(s238)
						if (rc_release(bq)) {
							Rc_drop_slow_14df0(s238, bj)
						}
						ci = ld64(s310 + 8)
						const bt = ld64(s310)
						clock_get(s158)
						if (ld64(s158) != 0) {
							const bs = ld64(s158 + 8)
							const br = ld64(s148)
							st64(s148, ld64(s148 + 8))
							st64(s158, bs, br)
							ao = fn_13e628(s350, s158)
							ac = ld64(s350 + 8)
							ad = ld64(s350)
							if (ad != 2) {
								st64(g, ld64(g) + 1)
								st64(a + 8, ac)
								st64(a, ad)
								return ao
							}
						} else {
							ac = ld64(s148 + 8)
						}
						ao = fn_69c30(s360, o + 8, bt, ci, bf, cg, cf, ch, s78, ac)
						ac = ld64(s360 + 8)
						ad = ld64(s360)
						if (ad != 2) {
							st64(g, ld64(g) + 1)
							st64(a + 8, ac)
							st64(a, ad)
							return ao
						}
						const bx = ld64(o + 8)
						const bw = ld64(o + 0x10)
						const bv = ld64(o + 0x18)
						const bu = ld64(o + 0x20)
						st64(s158, bx, bw, bv, bu, bt, ci, ce, cd, cc, cb)
						fn_10f5b8(s2f0, s158)
						copyr(sb8, s2e8, 0x10)
						ao = log_data(sb8, 1)
						st64(g, ld64(g) + 1)
						st64(a + 8, ac)
						st64(a, 2)
						return ao
					}
					ac = ld64(s2e8)
					ad = bf
				}
				aw = a
				const bg = ld64(s210)
				if (rc_release(bg)) {
					ao = Rc_drop_slow_14df0(s210, ao)
				}
				const bh = ld64(s208)
				if (rc_release(bh)) {
					ao = Rc_drop_slow_14df0(s208, ao)
				}
			}
			const an: LamportsCell = ld64(s1e0)
			if (rc_release(an)) {
				ao = Rc_drop_slow_14df0(s1e0, ao)
			}
			const ap: DataCell = ld64(s1d8)
			if (rc_release(ap)) {
				ao = Rc_drop_slow_14df0(s1d8, ao)
			}
			const aq = ld64(s270)
			if (rc_release(aq)) {
				ao = Rc_drop_slow_14df0(s270, ao)
			}
			const ar = ld64(s268)
			if (rc_release(ar)) {
				ao = Rc_drop_slow_14df0(ci, ao)
			}
		}
		const at: LamportsCell = ld64(s240)
		if (rc_release(at)) {
			ao = Rc_drop_slow_14df0(s240, ao)
		}
		const au: DataCell = ld64(s238)
		if (!rc_release(au)) {
			av = ld64(s300 + 8)
			st64(av, ld64(av) + 1)
			st64(aw + 8, ac)
			st64(aw, ad)
			return ao
		}
		ao = Rc_drop_slow_14df0(s238, ao)
		av = ld64(s300 + 8)
		st64(av, ld64(av) + 1)
		st64(aw + 8, ac)
		st64(aw, ad)
		return ao
	}
	fn_85138(s1e8, 0x10015982c)
	st64(sb8, 0, 1, 0)
	st64(s2d0, sb8, 0x10015f818)
	st8(s2d0 + 0x18, 3)
	st64(s2d0 + 0x10, 0x20)
	st64(s2e8 + 8, 0)
	st64(s2f0, 0)
	if (fn_88558(0x10015982c, s2f0) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(s120, sb8, 0x18)
	copy(s138, s1e8, 0x18)
	st64(s158 + 8, 0x100159ede)
	st32(s120 + 0x60, 0x1770 /* error::NotApproved */)
	st8(s120 + 0x18, 2)
	st32(s148 + 8, 0x88)
	st64(s148, 0x33)
	st64(s158, 0)
	ao = fn_13e5a0(s320, s158)
	ac = ld64(s320 + 8)
	ad = ld64(s320)
	st64(g, ld64(g) + 1)
	st64(a + 8, ac)
	st64(a, ad)
	return ao
}

export function fn_2c160(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78
	let g, l: u64
	const f = p5
	st64(s30, f - c, p6 - d - (c > f), p7, p8, 0, 1)
	fn_584f8(s48, s30, s20, s10)
	if (ld64(s48) != 0) {
		const h = ld64(s48 + 8)
		const i = ld64(s48 + 0x10) != 0 ? 0 : h != -1 ? h : 0
		if (b > b + i) {
			l = fn_88360(s78, 0x26)
			g = ld64(s78)
			st64(a + 8, ld64(s78 + 8))
			st64(a, g)
			return l
		}
		l = fn_88360(s68, 0x26)
		const k = ld64(s68 + 8)
		const j = ld64(s68)
		st64(a + 8, i + b)
		st64(a, 2)
		if (j != 0) {
			void ld64(k)
			void ld8(k + 0x38)
			return l
		}
		void ld64(k)
		void ld8(k + 0x50)
		return l
	}
	l = fn_88360(s58, 0x26)
	g = ld64(s58)
	st64(a + 8, ld64(s58 + 8))
	st64(a, g)
	return l
}

export function fn_2d880(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s40 = fp - 0x40, s47 = fp - 0x47, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se0 = fp - 0xe0, sf8 = fp - 0xf8, s100 = fp - 0x100, s118 = fp - 0x118, s138 = fp - 0x138, s158 = fp - 0x158, s178 = fp - 0x178, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s280 = fp - 0x280, s2a8 = fp - 0x2a8, s2c0 = fp - 0x2c0, s2c8 = fp - 0x2c8, s2d0 = fp - 0x2d0, s2d8 = fp - 0x2d8, s2e0 = fp - 0x2e0, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, s300 = fp - 0x300, s308 = fp - 0x308, s310 = fp - 0x310, s318 = fp - 0x318, s320 = fp - 0x320, s328 = fp - 0x328, s330 = fp - 0x330, s338 = fp - 0x338, s340 = fp - 0x340, s348 = fp - 0x348, s350 = fp - 0x350, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let l, p, u, ad, ae, af: u64
	st64(s280 + 0x40, b)
	let n = a
	st64(s280 + 0x30, c)
	const f = ld64(c)
	const g = ld64(e - 0xfa0)
	let j = g > ld64(f + 0x48)
	const i = ld64(e - 0xf98)
	const h = ld64(f + 0x50)
	j = h != i ? i > h : j
	if ((j & 1) != 0) {
		ErrorCode_name(s138, 0x100159858, h, d, e)
		st64(s78, 0, 1, 0)
		st64(s28, s78, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s40 + 8, 0)
		st64(s48, 0)
		if (ErrorCode_fmt(0x100159858, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(se0, s78, 0x18)
		copy(sf8, s138, 0x18)
		st64(s118 + 8, 0x100159f11)
		st32(sc8 + 0x48, 0x9ca /* anchor::RequireGteViolated */)
		st8(sc8, 2)
		st32(s100, 0x88)
		st64(s118 + 0x10, 0x33)
		st64(s118, 0)
		fn_13e5a0(s220, s118)
		const ab = ld64(s220 + 8)
		const aa = ld64(s220)
		const ac = ld64(f + 0x48)
		const z = ld64(f + 0x50)
		st64(s1000, z, g, i)
		p = fn_2be8(s230, aa, ab, ac, z, g, i)
		l = ld64(s230)
		st64(n + 8, ld64(s230 + 8))
		st64(n, l)
		return p
	}
	st64(s2d0, d)
	st64(s2a8 + 8, i)
	st64(s2f8, f)
	st64(s2a8, g)
	st64(s2e0, ld64(e - 0xf88))
	st64(s2c8, ld64(e - 0xf90))
	const w = ld64(e - 0xfa8)
	st64(s280 + 0x48, ld64(e - 0xfb0))
	const r = ld64(e - 0xfb8)
	st64(s2c0 + 0x10, ld64(e - 0xfc0))
	copyr(s2c0, e - 0xfd8, 0x10)
	st64(s2f0, ld64(e - 0xfe0))
	st64(s2d8, ld64(e - 0xfe8))
	st64(s2a8 + 0x10, ld64(e - 0xff0))
	st64(s2a8 + 0x18, ld64(e - 0xff8))
	st64(s2e8, ld64(e - 0x1000))
	st64(s190, 0, 8, 0)
	p = fn_4dc0(s118, ld64(ld64(s280 + 0x40)), r0)
	const k = ld64(s118 + 0x10)
	l = ld64(s118 + 8)
	let v = k
	if (ld64(s118) != 0) {
		st64(n + 8, v)
		st64(n, l)
		return p
	}
	st64(s300, k)
	if ((ld8(l + 0x17d) & 0xe) == 0xe) {
		fn_85138(s138, 0x10015982c)
		st64(s78, 0, 1, 0)
		st64(s28, s78, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s40 + 8, 0)
		st64(s48, 0)
		if (fn_88558(0x10015982c, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(se0, s78, 0x18)
		copy(sf8, s138, 0x18)
		st64(s118 + 8, 0x100159f11)
		st32(sc8 + 0x48, 0x1770 /* error::NotApproved */)
		st8(sc8, 2)
		st32(s100, 0x95)
		st64(s118 + 0x10, 0x33)
		st64(s118, 0)
		p = fn_13e5a0(s210, s118)
		v = ld64(s210 + 8)
		l = ld64(s210)
		ad = ld64(s300)
		st64(ad, ld64(ad) - 1)
		st64(n + 8, v)
		st64(n, l)
		return p
	}
	const m = ld64(0x300000000 /* heap bump-allocator cursor */)
	st64(s310, n)
	const o = m != 0 ? sat_sub(m, 8) & -4 : 0x300007ff8
	if (0x300000008 > o) {
		alloc_handle_alloc_error(4, 8)
	}
	st64(s330, ld64(l + 0xfd))
	st64(s328, ld64(l + 0xf5))
	st64(s320, ld64(l + 0xed))
	st64(s318, ld64(l + 0xe5))
	st64(s280 + 0x20, l)
	st64(s338, ld32(l + 0x105))
	st64(0x300000000 /* heap bump-allocator cursor */, o)
	p = fn_4bd8(s118, ld64(ld64(s2a8 + 0x18)), p)
	v = ld64(s118 + 0x10)
	let q = ld64(s118 + 8)
	if (ld64(s118) != 0) {
		n = ld64(s310)
		ad = ld64(s300)
		st64(ad, ld64(ad) - 1)
		st64(n + 8, v)
		st64(n, q)
		return p
	}
	st64(s280 + 0x38, ld32(q + 0x20))
	p = fn_4bd8(s118, ld64(ld64(s2a8 + 0x10)), p)
	const t = ld64(s118 + 0x10)
	q = ld64(s118 + 8)
	if (ld64(s118) != 0) {
		st64(v, ld64(v) - 1)
		n = ld64(s310)
		ad = ld64(s300)
		st64(ad, ld64(ad) - 1)
		st64(n + 8, t)
		st64(n, q)
		return p
	}
	B28: {
		B25: {
			st64(s350, r)
			st32(o + 4, ld32(q + 0x20))
			st32(o, ld64(s280 + 0x38))
			st64(s48, 2, o, 2)
			const s = ld64(s280 + 0x20)
			u = fn_6f618(s, s48)
			let y = s
			st64(s348, u)
			st64(t, ld64(t) - 1)
			st64(v, ld64(v) - 1)
			af = 0
			st64(s340, 0)
			if (w != 0) {
				let x = ld64(s280 + 0x48)
				st64(s2a8 + 0x20, x + w * 0x30)
				st64(s280 + 0x28, 8)
				st64(s280, s47, y + 0x61, y + 0x41, y + 1)
				st64(s308, y + 0x17f)
				ae = 0
				L16: while (true) {
					st64(s340, ae)
					let ai = af << 3
					ae = x
					while (true) {
						st64(s280 + 0x38, ai)
						const aj = ld64(ae)
						copyr(s178, aj, 0x20)
						let al = 1
						const ak = ld16(y + 0x17f)
						st64(s280 + 0x48, af)
						if (ak != 0) {
							al = ld64(s308)
						}
						st64(sc8, y)
						st64(sf8 + 0x10, ld64(s280 + 8))
						st64(sf8, ld64(s280 + 0x10))
						st64(s118 + 0x10, ld64(s280 + 0x18))
						st64(s118, 0x10015984c)
						st64(sd8, al, (ak != 0) << 1)
						st64(sc8 + 8, 1)
						st64(se0, 0x20)
						st64(sf8 + 8, 0x20)
						st64(s100, 0x20)
						st64(s118 + 8, 4)
						st64(s78, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
						// PDA create_program_address(["pool", *(ld64(s280 + 0x18)), *(ld64(s280 + 0x10)), *(ld64(s280 + 8)), al[..(ak != 0) << 1], y[..1]], program *s78)
						Pubkey_create_program_address(s48, s118, 6, s78, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */)
						if (ld8(s48) == 1) {
							st8(s138, ld8(s47))
							fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s138, 0x100160228, 0x100160248)
						}
						const am = ld64(s280)
						copyr(s138, am, 0x20)
						st64(s78, 0x1001595c0, 0x20, s138, 0x20)
						st64(s48, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
						// PDA find_program_address(["pool_tick_array_bitmap_extension", *am], program *s48)
						Pubkey_find_program_address(s118, s78, 2, s48)
						copyr(s158, s118, 0x20)
						if ((memcmp(s178, s158, 0x20) as u32) == 0) {
							x = ae + 0x30
							af = ld64(s280 + 0x48)
							y = ld64(s280 + 0x20)
							u = 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */
							if (x == ld64(s2a8 + 0x20)) {
								break B28
							}
							continue L16
						}
						let ah = ld64(s280 + 0x48)
						const ag = ld64(s280 + 0x38)
						if (ah == ld64(s190)) {
							fn_152e0(s190)
							ah = ld64(s280 + 0x48)
							st64(s280 + 0x28, ld64(s190 + 8))
						}
						st64(ld64(s280 + 0x28) + ag, ae)
						ae = ae + 0x30
						ai = ag + 8
						af = ah + 1
						st64(s190 + 0x10, af)
						y = ld64(s280 + 0x20)
						u = 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */
						if (ae == ld64(s2a8 + 0x20)) {
							break B25
						}
					}
				}
			}
		}
		ae = ld64(s340)
		if ((ld64(s348) & ae == 0) != 0) {
			fn_85138(s138, 0x1001598ec)
			st64(s78, 0, 1, 0)
			st64(s28, s78, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s40 + 8, 0)
			st64(s48, 0)
			if (fn_88558(0x1001598ec, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(se0, s78, 0x18)
			copy(sf8, s138, 0x18)
			st64(s118 + 8, 0x100159f11)
			st32(sc8 + 0x48, 0x1793 /* error::MissingTickArrayBitmapExtensionAccount */)
			st8(sc8, 2)
			st32(s100, 0xab)
			st64(s118 + 0x10, 0x33)
			st64(s118, 0)
			p = fn_13e5a0(s200, s118)
			v = ld64(s200 + 8)
			l = ld64(s200)
			n = ld64(s310)
			ad = ld64(s300)
			st64(ad, ld64(ad) - 1)
			st64(n + 8, v)
			st64(n, l)
			return p
		}
	}
	st64(s280 + 0x48, af)
	const an = ld64(s300)
	st64(an, ld64(an) - 1)
	st64(sff0 + 8, ld64(s2a8 + 8))
	const ao = ld64(s2a8)
	st64(sff8, ae, ao)
	st64(s1000, ld64(s2a8 + 0x10))
	p = fn_2f968(s118, ld64(s280 + 0x40), ld64(s280 + 0x30), ld64(s2a8 + 0x18), fp, u)
	const ap = ld64(s118 + 8)
	if (ld64(s118) != 0) {
		n = ld64(s310)
		st64(n + 8, ld64(s118 + 0x10))
		st64(n, ap)
		return p
	}
	let av = 0
	st64(s280 + 0x30, ld64(sf8))
	const au = ld64(s100)
	st64(s280 + 0x38, ld64(s118 + 0x10))
	let ar = 0
	n = ld64(s310)
	const aq = ld64(s2c0 + 0x10)
	if (aq != 0) {
		p = fn_7da68(s118, fn_16330(aq), ap)
		av = 0
		ar = ld64(s118 + 8)
		l = ld64(s118)
		if (l != 2) {
			st64(n + 8, ar)
			st64(n, l)
			return p
		}
	}
	const at = ld64(s350)
	st64(s280 + 0x28, ar)
	if (at != 0) {
		p = fn_7da68(s118, fn_16330(at), au)
		ar = ld64(s280 + 0x28)
		av = ld64(s118 + 8)
		l = ld64(s118)
		if (l != 2) {
			st64(n + 8, av)
			st64(n, l)
			return p
		}
	}
	st64(s100, ld64(s330))
	st64(s118 + 0x10, ld64(s328))
	st64(s118 + 8, ld64(s320))
	st64(s118, ld64(s318))
	st32(sc8, ld64(s338))
	st64(s280 + 0x18, av)
	st64(sd8, ar, av)
	st64(se0, ld64(s280 + 0x30))
	st64(sf8 + 0x10, ld64(s280 + 0x38))
	st64(s280 + 0x20, au)
	st64(sf8, ap, au)
	fn_10f958(s48, s118)
	copyr(s78, s40, 0x10)
	log_data(s78, 1)
	const bb = ld64(s2c0 + 8)
	let aw = ap
	if ((ao | ld64(s2a8 + 8)) != 0) {
		const bc = aw
		const bd = ld64(s280 + 0x28)
		if (bd > aw) {
			fn_154788(0x10015fbb0, bb, aw)
		}
		aw = bc
		const be = ld64(s2c8)
		const bg = ld64(s280 + 0x18)
		if (be > bc - bd) {
			fn_85138(s138, 0x100159904)
			st64(s78, 0, 1, 0)
			st64(s28, s78, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s40 + 8, 0)
			st64(s48, 0)
			if (fn_88558(0x100159904, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(se0, s78, 0x18)
			copy(sf8, s138, 0x18)
			st64(s118 + 8, 0x100159f11)
			st32(sc8 + 0x48, 0x1781 /* error::PriceSlippageCheck */)
			st8(sc8, 2)
			st32(s100, 0xda)
			st64(s118 + 0x10, 0x33)
			st64(s118, 0)
			fn_13e5a0(s1c0, s118)
			p = fn_1730(s1d0, ld64(s1c0), ld64(s1c0 + 8), bc - bd, be)
			l = ld64(s1d0)
			st64(n + 8, ld64(s1d0 + 8))
			st64(n, l)
			return p
		}
		const bf = ld64(s280 + 0x20)
		if (bg > bf) {
			fn_154788(0x10015fbc8, bb, aw)
		}
		if (ld64(s2e0) > bf - bg) {
			fn_85138(s138, 0x100159904)
			st64(s78, 0, 1, 0)
			st64(s28, s78, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s40 + 8, 0)
			st64(s48, 0)
			if (fn_88558(0x100159904, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(se0, s78, 0x18)
			copy(sf8, s138, 0x18)
			st64(s118 + 8, 0x100159f11)
			st32(sc8 + 0x48, 0x1781 /* error::PriceSlippageCheck */)
			st8(sc8, 2)
			st32(s100, 0xdf)
			st64(s118 + 0x10, 0x33)
			st64(s118, 0)
			fn_13e5a0(s1a0, s118)
			p = fn_1730(s1b0, ld64(s1a0), ld64(s1a0 + 8), bf - bg, ld64(s2e0))
			l = ld64(s1b0)
			st64(n + 8, ld64(s1b0 + 8))
			st64(n, l)
			return p
		}
	}
	const ax = aw
	const ay = ld64(s280 + 0x38)
	st64(s2a8 + 0x20, aw)
	if (aw > aw + ay) {
		fn_154730(0x10015fbe0, bb, aw)
	}
	const az = ld64(s280 + 0x20)
	const ba = ld64(s280 + 0x30)
	const bh = ld64(s2c0 + 0x10)
	const cq = ld64(s350)
	if (az > az + ba) {
		fn_154730(0x10015fbf8, bb, cq, az + ba)
	}
	st64(s280 + 8, az + ba)
	if (bb == 0) {
		st8(s60 + 0x12, 2)
	} else {
		AccountInfo_clone_f338(s78, bb)
	}
	AccountInfo_clone_f440(s48, ld64(s2d0))
	let bo = 0
	if (bh != 0) {
		bo = fn_16330(bh)
	}
	let bm = 2
	const bn = ld64(ld64(s2c0))
	const bi = ld8(s60 + 0x12)
	if (bi != 2) {
		const bj = ld64(s78 + 8)
		const bl = ld64(s78)
		rc_inc(bj)
		const bk = ld64(s78 + 0x10)
		rc_inc(bk)
		st8(sf8 + 9, ld8(s60 + 0x11))
		st8(sf8 + 8, ld8(s60 + 0x10))
		copyr(s100, s60, 0x10)
		st64(s118, bl, bj, bk)
		bm = bi
	}
	st64(s280 + 0x10, bi)
	st8(sf8 + 0xa, bm)
	st64(sff0, s118, ax + ay)
	st64(s280, bn)
	st64(s1000, bo, bn)
	const bp = fn_7a038(s1e0, ld64(s280 + 0x40), s48, ld64(s2d8), bo, bn, s118, ax + ay, bo)
	v = ld64(s1e0 + 8)
	const bq = ld64(s1e0)
	let cg = ptr_drop_in_place_fcd8(s48, bp)
	let br = bq
	if (bq != 2) {
		p = fn_ff88(s78, cg)
		st64(n + 8, v)
		st64(n, br)
		return p
	}
	AccountInfo_clone_f440(s48, ld64(s2e8))
	let bz = 0
	const bs = ld64(s350)
	if (bs != 0) {
		bz = fn_16330(bs)
	}
	let bx = 2
	const bt = ld64(s280 + 0x10)
	const by = ld64(s280)
	if (bt != 2) {
		const bu = ld64(s78 + 8)
		const bw = ld64(s78)
		rc_inc(bu)
		const bv = ld64(s78 + 0x10)
		rc_inc(bv)
		st8(sf8 + 9, ld8(s60 + 0x11))
		st8(sf8 + 8, ld8(s60 + 0x10))
		copyr(s100, s60, 0x10)
		st64(s118, bw, bu, bv)
		bx = bt
	}
	st8(sf8 + 0xa, bx)
	st64(sff0 + 8, ld64(s280 + 8))
	st64(s1000, bz, by, s118)
	const ca = fn_7a038(s1f0, ld64(s280 + 0x40), s48, ld64(s2f0), bz, by, s118, ld64(sff0 + 8), bz)
	v = ld64(s1f0 + 8)
	const cb = ld64(s1f0)
	cg = ptr_drop_in_place_fcd8(s48, ca)
	br = cb
	if (cb != 2) {
		p = fn_ff88(s78, cg)
		st64(n + 8, v)
		st64(n, br)
		return p
	}
	let ci = 2
	const ck = ld64(s190 + 8)
	const cj = ld64(s2f8)
	const cc = ld64(s280 + 0x10)
	if (cc != 2) {
		const cd = ld64(s78 + 8)
		const ch = ld64(s78)
		rc_inc(cd)
		const ce = ld64(s78 + 0x10)
		const cf = ld64(ce)
		cg = cf == -1
		st64(ce, cf + 1)
		if (cg == 1) {
			abort()
		}
		st8(sf8 + 9, ld8(s60 + 0x11))
		st8(sf8 + 8, ld8(s60 + 0x10))
		copyr(s100, s60, 0x10)
		st64(s118, ch, cd, ce)
		ci = cc
	}
	st8(sf8 + 0xa, ci)
	st64(sff0 + 8, cc != 2)
	st64(sff8, s118)
	st64(s1000, ld64(s2c0))
	st64(sff0, cj + 8)
	cg = fn_31a40(s48, ld64(s280 + 0x40), ck, ld64(s280 + 0x48), ld64(s1000), s118, cj + 8, cc != 2, cg)
	v = ld64(s40 + 8)
	br = ld64(s40)
	if (ld64(s48) != 1) {
		const cp = ld64(s40 + 0x10)
		const co = ld64(cj + 8)
		const cn = ld64(cj + 0x10)
		const cm = ld64(cj + 0x18)
		const cl = ld64(cj + 0x20)
		copyr(sf8, s2a8, 0x10)
		st64(s118, co, cn, cm, cl)
		st64(sc8 + 0x20, ld64(s280 + 0x18))
		st64(sc8 + 0x18, ld64(s280 + 0x28))
		st64(sc8, br, v, cp)
		st64(sd8 + 8, ld64(s280 + 0x30))
		st64(sd8, ld64(s280 + 0x38))
		st64(se0, ld64(s280 + 0x20))
		st64(sf8 + 0x10, ld64(s2a8 + 0x20))
		fn_10f760(s48, s118)
		copyr(s138, s40, 0x10)
		p = fn_ff88(s78, log_data(s138, 1))
		st64(n + 8, v)
		st64(n, 2)
		return p
	}
	p = fn_ff88(s78, cg)
	st64(n + 8, v)
	st64(n, br)
	return p
}

export function fn_2f968(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s30 = fp - 0x30, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, s128 = fp - 0x128, s130 = fp - 0x130, sff0 = fp - 0xff0, s1000 = fp - 0x1000
	let x, y: u64
	st64(s128 + 0x38, c)
	let o = fn_53e8(sa8, ld64(b), c, d, e, r0)
	const f = ld64(s98)
	if (ld64(sa8) != 0) {
		const m = ld64(sa8 + 8)
		st64(a + 0x10, f)
		st64(a + 8, m)
		st64(a, 1)
		return o
	}
	o = ld64(e - 0xfe8)
	const p = ld64(e - 0xff0)
	const s = ld64(e - 0xff8)
	const t = ld64(e - 0x1000)
	st64(sb8 + 8, f)
	let l = 0
	const g = ld64(sa8 + 8)
	st64(sb8, g)
	st64(s128 + 0x28, g)
	const h = ld8(g + 0x17d)
	let i = 0
	st64(s128 + 0x30, 0)
	if ((h & 2) == 0) {
		const n = ld64(ld64(s128 + 0x38))
		const r = ld32(n + 0x110)
		const q = ld32(n + 0x114)
		st64(s128 + 0x20, o)
		st64(sff0 + 0x10, o)
		st64(s128 + 0x18, p)
		st64(s1000, s, r, q, p)
		o = fn_2fec8(sa8, sb8, d, t, s, r, q, p, o, o)
		const u = ld64(sa8)
		if (ld8(s88 + 0x51) == 2) {
			st64(a + 0x10, ld64(sa8 + 8))
			st64(a + 8, u)
			st64(a, 1)
			st64(f, ld64(f) + 1)
			return o
		}
		copyr(s128, s98, 0x10)
		st64(s128 + 0x10, ld64(sa8 + 8))
		memcpy(s30, s88, 0x30)
		st64(s130, ld64(s88 + 0x30))
		st64(s128 + 0x30, ld64(s88 + 0x38))
		clock_get(sa8)
		if (ld64(sa8) != 0) {
			const w = ld64(sa8 + 8)
			const v = ld64(s98)
			st64(s98, ld64(s98 + 8))
			st64(sa8, w, v)
			o = fn_13e628(sc8, sa8)
			y = ld64(sc8 + 8)
			x = ld64(sc8)
			if (x != 2) {
				st64(a + 0x10, y)
				st64(a + 8, x)
				st64(a, 1)
				st64(f, ld64(f) + 1)
				return o
			}
		} else {
			y = ld64(s98 + 8)
		}
		st64(sff0, s30, y)
		copy(s1000, s128, 0x10)
		fn_69e08(sd8, n + 8, u, ld64(s128 + 0x10), ld64(s1000), ld64(s1000 + 8), s30, y)
		y = ld64(sd8 + 8)
		x = ld64(sd8)
		l = 0
		o = ld64(s128 + 0x20)
		const aa = ld64(s128 + 0x18)
		if (x != 2) {
			st64(a + 0x10, y)
			st64(a + 8, x)
			st64(a, 1)
			st64(f, ld64(f) + 1)
			return o
		}
		const z = ld64(n + 0x48)
		const ab = ld64(n + 0x50)
		if ((ab != o ? o > ab : aa > z) != 0) {
			o = fn_88360(se8, 0x26)
			y = ld64(se8 + 8)
			x = ld64(se8)
			i = ld64(s130)
			if (x != 2) {
				st64(a + 0x10, y)
				st64(a + 8, x)
				st64(a, 1)
				st64(f, ld64(f) + 1)
				return o
			}
		} else {
			st64(n + 0x48, z - aa, ab - o - (aa > z))
			i = ld64(s130)
		}
	}
	let k = 0
	if ((ld8(ld64(s128 + 0x28) + 0x17d) & 4) == 0) {
		const j = ld64(ld64(s128 + 0x38))
		l = ld64(j + 0x78)
		st64(j + 0x78, 0)
		k = ld64(j + 0x80)
		st64(j + 0x80, 0)
	}
	st64(a + 0x20, k)
	st64(a + 0x18, ld64(s128 + 0x30))
	st64(a + 0x10, l)
	st64(a + 8, i)
	st64(a, 0)
	st64(f, ld64(f) + 1)
	return o
}

export function fn_2fec8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s2 = fp - 0x2, s28 = fp - 0x28, s4f = fp - 0x4f, s50 = fp - 0x50, s70 = fp - 0x70, s88 = fp - 0x88, s8f = fp - 0x8f, s90 = fp - 0x90, sf0 = fp - 0xf0, s1a0 = fp - 0x1a0, s248 = fp - 0x248, s268 = fp - 0x268, s2c8 = fp - 0x2c8, s2d0 = fp - 0x2d0, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s408 = fp - 0x408, s418 = fp - 0x418, s420 = fp - 0x420, s428 = fp - 0x428, s430 = fp - 0x430, s1000 = fp - 0x1000
	let o, ab, be, bf, bh, bi, bj, bk, bm, bn, bo, bp, bx, by, bz: u64
	st64(s408 + 0x30, d)
	let j = a
	const f = ld64(c)
	st64(s408 + 0x38, f)
	let k = fn_4bd8(s308, f, r0)
	let l = ld64(s2f8)
	let g = ld64(s308 + 8)
	if (ld64(s308) != 0) {
		st64(j + 8, l)
		st64(j, g)
		st8(j + 0x71, 2)
		return k
	}
	st64(s408 + 0x20, g)
	const h = ld64(b)
	const i = ld16(h + 0x17f)
	st64(s420, b)
	st64(s408, h + 0x17f)
	st64(s408 + 0x28, j)
	const s = p9
	st64(s428, p8)
	st64(s418, p7, p6)
	st64(s430, p5)
	st64(s308, 0x10015984c)
	st64(s2c8, i != 0 ? h + 0x17f : 1, (i != 0) << 1, h)
	st64(s408 + 0x10, h + 0x61)
	st64(s2d8, h + 0x61)
	st64(s408 + 8, h + 0x41)
	st64(s2e8, h + 0x41)
	st64(s408 + 0x18, h)
	st64(s2f8, h + 1)
	st64(s2c8 + 0x18, 1)
	st64(s2d0, 0x20)
	st64(s2e8 + 8, 0x20)
	st64(s2f8 + 8, 0x20)
	st64(s308 + 8, 4)
	st64(s50, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
	// PDA create_program_address(["pool", *(h + 1), *(h + 0x41), *(h + 0x61), (i != 0 ? h + 0x17f : 1)[..(i != 0) << 1], h[..1]], program *s50)
	Pubkey_create_program_address(s90, s308, 6, s50, k)
	if (ld8(s90) != 1) {
		copyr(s28, s8f, 0x20)
		const m = memcmp(ld64(s408 + 0x20), s28, 0x20)
		st64(l, ld64(l) - 1)
		if ((m as u32) == 0) {
			st64(s408 + 0x20, s)
			const t = ld64(ld64(s408 + 0x30))
			st64(s408 + 0x30, t)
			k = fn_4bd8(s308, t, m as u32)
			const v = ld64(s2f8)
			const w = ld64(s308 + 8)
			if (ld64(s308) != 0) {
				const u = ld64(s408 + 0x28)
				st64(u + 8, v)
				st64(u, w)
				st8(u + 0x71, 2)
				return k
			}
			const ad = ld64(s408 + 0x18)
			const ae = ld16(ad + 0x17f)
			let af = 1
			if (ae != 0) {
				af = ld64(s408)
			}
			st64(s2c8 + 0x10, ad)
			st64(s2d8, ld64(s408 + 0x10))
			st64(s2e8, ld64(s408 + 8))
			st64(s2f8, h + 1)
			st64(s308, 0x10015984c)
			st64(s2c8, af, (ae != 0) << 1)
			st64(s2c8 + 0x18, 1)
			st64(s2d0, 0x20)
			st64(s2e8 + 8, 0x20)
			st64(s2f8 + 8, 0x20)
			st64(s308 + 8, 4)
			st64(s50, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
			// PDA create_program_address(["pool", *(h + 1), *(ld64(s408 + 8)), *(ld64(s408 + 0x10)), af[..(ae != 0) << 1], ad[..1]], program *s50)
			Pubkey_create_program_address(s90, s308, 6, s50, k)
			if (ld8(s90) != 1) {
				copyr(s28, s8f, 0x20)
				const ag = memcmp(w, s28, 0x20)
				st64(v, ld64(v) - 1)
				if ((ag as u32) == 0) {
					const ao = ld64(s408 + 0x18)
					st64(s408 + 0x10, ld64(ao + 0xed))
					const bu = ld64(ao + 0xe5)
					k = fn_51c8(s308, ld64(s408 + 0x38), undef, undef, undef, ag as u32)
					l = ld64(s2f8)
					g = ld64(s308 + 8)
					j = ld64(s408 + 0x28)
					if (ld64(s308) != 0) {
						st64(j + 8, l)
						st64(j, g)
						st8(j + 0x71, 2)
						return k
					}
					const at = ld64(s418 + 8)
					k = fn_717b0(s90, g, at, ld16(ao + 0xe3))
					let av = ld64(s88)
					let au = ld64(s90)
					if (au == 2) {
						const aw = memcpy(s248, av, 0xa8)
						st64(l, ld64(l) + 1)
						k = fn_51c8(s308, ld64(s408 + 0x30), undef, undef, undef, aw)
						l = ld64(s2f8)
						g = ld64(s308 + 8)
						if (ld64(s308) != 0) {
							st64(j + 8, l)
							st64(j, g)
							st8(j + 0x71, 2)
							return k
						}
						k = fn_717b0(s90, g, ld64(s418), ld16(ld64(s408 + 0x18) + 0xe3))
						av = ld64(s88)
						au = ld64(s90)
						if (au == 2) {
							memcpy(s1a0, av, 0xa8)
							st64(l, ld64(l) + 1)
							clock_get(s308)
							if (ld64(s308) != 0) {
								const ay = ld64(s308 + 8)
								const ax = ld64(s2f8)
								st64(s2f8, ld64(s2f8 + 8))
								st64(s308, ay, ax)
								k = fn_13e628(s3c8, s308)
								bf = ld64(s3c8)
								st64(j + 8, ld64(s3c8 + 8))
								st64(j, bf)
								st8(j + 0x71, 2)
								return k
							}
							if ((ld64(s408 + 0x20) as i64) > -1) {
								st64(s1000 + 0x10, ld64(s2e8 + 8))
								st64(s1000, s248, s1a0)
								const az = ld64(s428)
								k = fn_21b58(s308, -az, -(ld64(s408 + 0x20) + (az != 0)), ld64(s420), s248, s1a0, ld64(s1000 + 0x10))
								const bb = ld64(s308 + 8)
								let bc = ld64(s308)
								const ba = ld8(s2c8 + 0x31)
								if (ba == 2) {
									be = ld64(s408 + 0x28)
									st64(be + 8, bb)
									st64(be, bc)
									st8(be + 0x71, 2)
									return k
								}
								st64(s408, bb, bc)
								const bd = memcpy(sf0, s2f8, 0x60)
								st32(s1a0 + 0xa8, ld32(s2c8 + 0x32))
								st16(s1a0 + 0xac, ld16(s2c8 + 0x36))
								st64(s408 + 0x20, ld8(s2c8 + 0x30))
								k = fn_51c8(s308, ld64(s408 + 0x38), undef, undef, undef, bd)
								l = ld64(s2f8)
								bc = ld64(s308 + 8)
								if (ld64(s308) != 0) {
									be = ld64(s408 + 0x28)
									st64(be + 8, l)
									st64(be, bc)
									st8(be + 0x71, 2)
									return k
								}
								k = fn_71878(s368, bc, at, ld16(ld64(s408 + 0x18) + 0xe3), s248)
								let bg = ld64(s368)
								if (bg == 2) {
									st64(l, ld64(l) + 1)
									k = fn_51c8(s308, ld64(s408 + 0x30), undef, undef, undef, k)
									l = ld64(s2f8)
									bc = ld64(s308 + 8)
									if (ld64(s308) != 0) {
										be = ld64(s408 + 0x28)
										st64(be + 8, l)
										st64(be, bc)
										st8(be + 0x71, 2)
										return k
									}
									k = fn_71878(s378, bc, ld64(s418), ld16(ld64(s408 + 0x18) + 0xe3), s1a0)
									bg = ld64(s378)
									if (bg == 2) {
										st64(l, ld64(l) + 1)
										if ((ld64(s408 + 0x20) & 1) != 0) {
											k = fn_51c8(s308, ld64(s408 + 0x38), bh, bi, bj, k)
											l = ld64(s2f8)
											bk = ld64(s308 + 8)
											if (ld64(s308) != 0) {
												by = ld64(s408 + 0x28)
												st64(by + 8, l)
												st64(by, bk)
												st8(by + 0x71, 2)
												return k
											}
											const bl = ld8(bk + 0x2784)
											if (bl == 0) {
												k = fn_88360(s388, 0x26)
												bz = ld64(s388 + 8)
												bp = ld64(s388)
												if (bp != 2) {
													bn = ld64(s408 + 0x28)
													st64(bn, bp, bz)
													st8(bn + 0x71, 2)
													st64(l, ld64(l) + 1)
													return k
												}
												bm = ld8(bk + 0x2784)
											} else {
												bm = bl - 1
												st8(bk + 0x2784, bm)
											}
											if ((bm as u8) == 0) {
												k = fn_6d670(s398, ld64(s408 + 0x18), ld64(s430), ld32(bk + 0x20))
												bz = ld64(s398 + 8)
												bp = ld64(s398)
												if (bp != 2) {
													bn = ld64(s408 + 0x28)
													st64(bn, bp, bz)
													st8(bn + 0x71, 2)
													st64(l, ld64(l) + 1)
													return k
												}
											}
											st64(l, ld64(l) + 1)
										}
										if ((ba & 1) != 0) {
											k = fn_51c8(s308, ld64(s408 + 0x30), bh, bi, bj, k)
											l = ld64(s2f8)
											bk = ld64(s308 + 8)
											if (ld64(s308) != 0) {
												by = ld64(s408 + 0x28)
												st64(by + 8, l)
												st64(by, bk)
												st8(by + 0x71, 2)
												return k
											}
											const bw = ld8(bk + 0x2784)
											if (bw == 0) {
												k = fn_88360(s3a8, 0x26)
												bz = ld64(s3a8 + 8)
												bp = ld64(s3a8)
												if (bp != 2) {
													bn = ld64(s408 + 0x28)
													st64(bn, bp, bz)
													st8(bn + 0x71, 2)
													st64(l, ld64(l) + 1)
													return k
												}
												bx = ld8(bk + 0x2784)
											} else {
												bx = bw - 1
												st8(bk + 0x2784, bx)
											}
											if ((bx as u8) == 0) {
												k = fn_6d670(s3b8, ld64(s408 + 0x18), ld64(s430), ld32(bk + 0x20))
												bz = ld64(s3b8 + 8)
												bp = ld64(s3b8)
												if (bp != 2) {
													bn = ld64(s408 + 0x28)
													st64(bn, bp, bz)
													st8(bn + 0x71, 2)
													st64(l, ld64(l) + 1)
													return k
												}
											}
											st64(l, ld64(l) + 1)
										}
										const bq = ld64(s408 + 0x18)
										fn_6a5a8(s308, bq, k)
										const bt = ld64(bq + 0xed)
										const bs = ld64(bq + 0xe5)
										const br = ld32(bq + 0x105)
										st32(s2c8 + 4, ld64(s418 + 8))
										st32(s2c8, br)
										st64(s2d8, bs, bt)
										st64(s2e8, bu)
										st64(s2e8 + 8, ld64(s408 + 0x10))
										st32(s2c8 + 8, ld64(s418))
										fn_110060(s90, s308)
										copyr(s50, s88, 0x10)
										log_data(s50, 1)
										const bv = ld64(s408 + 0x28)
										st64(bv + 8, ld64(s408))
										st64(bv, ld64(s408 + 8))
										k = memcpy(bv + 0x10, sf0, 0x60)
										st8(bv + 0x71, ba)
										st8(bv + 0x70, ld64(s408 + 0x20))
										st32(bv + 0x72, ld32(s1a0 + 0xa8))
										st16(bv + 0x76, ld16(s1a0 + 0xac))
										return k
									}
									bo = ld64(s378 + 8)
									bn = ld64(s408 + 0x28)
									st64(bn, bg, bo)
									st8(bn + 0x71, 2)
									st64(l, ld64(l) + 1)
									return k
								}
								bo = ld64(s368 + 8)
								bn = ld64(s408 + 0x28)
								st64(bn, bg, bo)
								st8(bn + 0x71, 2)
								st64(l, ld64(l) + 1)
								return k
							}
							k = fn_88360(s358, 0x26)
							bf = ld64(s358)
							st64(j + 8, ld64(s358 + 8))
							st64(j, bf)
							st8(j + 0x71, 2)
							return k
						}
						st64(j + 8, av)
						st64(j, au)
						st8(j + 0x71, 2)
						st64(l, ld64(l) + 1)
						return k
					}
					st64(j + 8, av)
					st64(j, au)
					st8(j + 0x71, 2)
					st64(l, ld64(l) + 1)
					return k
				}
				ErrorCode_name(s28, 0x100159874)
				st64(s50, 0, 1, 0)
				st64(s70, s50, 0x10015f818)
				st8(s70 + 0x18, 3)
				st64(s70 + 0x10, 0x20)
				st64(s88 + 8, 0)
				st64(s90, 0)
				const ah = ErrorCode_fmt(0x100159874, s90)
				o = ld64(s408 + 0x28)
				if (ah != 0) {
					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
				}
				copyr(s2d0, s50, 0x18)
				copy(s2e8, s28, 0x18)
				st64(s308 + 8, 0x100159f11)
				st32(s2c8 + 0x58, 0x9c6 /* anchor::RequireKeysEqViolated */)
				st8(s2c8 + 0x10, 2)
				st32(s2f8 + 8, 0x15d)
				st64(s2f8, 0x33)
				st64(s308, 0)
				const ai = fn_13e5a0(s338, s308)
				st64(s408 + 0x38, ld64(s338 + 8))
				const aj = ld64(s338)
				k = fn_4bd8(s308, ld64(s408 + 0x30), ai)
				l = ld64(s2f8)
				const ak = ld64(s308 + 8)
				if (ld64(s308) != 0) {
					st64(o + 8, l)
					st64(o, ak)
					st8(o + 0x71, 2)
					if (aj != 0) {
						const ar = ld64(s408 + 0x38)
						void ld64(ar)
						void ld8(ar + 0x38)
						return k
					}
					const ap = ld64(s408 + 0x38)
					void ld64(ap)
					void ld8(ap + 0x50)
					return k
				}
				st64(s408 + 0x30, aj)
				copyr(s268, ak, 0x20)
				const al = ld64(s408 + 0x18)
				const am = ld16(al + 0x17f)
				const an = ld64(s408)
				st64(s2c8 + 0x10, al)
				st64(s2d8, ld64(s408 + 0x10))
				st64(s2e8, ld64(s408 + 8))
				st64(s2f8, h + 1)
				st64(s308, 0x10015984c)
				st64(s2c8, am != 0 ? an : 1, (am != 0) << 1)
				st64(s2c8 + 0x18, 1)
				st64(s2d0, 0x20)
				st64(s2e8 + 8, 0x20)
				st64(s2f8 + 8, 0x20)
				st64(s308 + 8, 4)
				st64(s28, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
				// PDA create_program_address(["pool", *(h + 1), *(ld64(s408 + 8)), *(ld64(s408 + 0x10)), (am != 0 ? an : 1)[..(am != 0) << 1], al[..1]], program *s28)
				const aq = Pubkey_create_program_address(s50, s308, 6, s28, k)
				if (ld8(s50) != 1) {
					copyr(s70, s4f, 0x20)
					copy(s90, s268, 0x20)
					k = Error_with_pubkeys(s348, ld64(s408 + 0x30), ld64(s408 + 0x38), s90, aq)
					ab = ld64(s348)
					st64(o + 8, ld64(s348 + 8))
					st64(o, ab)
					st8(o + 0x71, 2)
					st64(l, ld64(l) - 1)
					return k
				}
				st8(s2, ld8(s4f))
				fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s2, 0x100160228, 0x100160248)
			}
			st8(s28, ld8(s8f))
			fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s28, 0x100160228, 0x100160248)
		}
		ErrorCode_name(s28, 0x100159874)
		st64(s50, 0, 1, 0)
		st64(s70, s50, 0x10015f818)
		st8(s70 + 0x18, 3)
		st64(s70 + 0x10, 0x20)
		st64(s88 + 8, 0)
		st64(s90, 0)
		if (ErrorCode_fmt(0x100159874, s90) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(s2d0, s50, 0x18)
		copy(s2e8, s28, 0x18)
		st64(s308 + 8, 0x100159f11)
		st32(s2c8 + 0x58, 0x9c6 /* anchor::RequireKeysEqViolated */)
		st8(s2c8 + 0x10, 2)
		st32(s2f8 + 8, 0x15c)
		st64(s2f8, 0x33)
		st64(s308, 0)
		const n = fn_13e5a0(s318, s308)
		st64(s408 + 0x30, ld64(s318 + 8))
		const q = ld64(s318)
		k = fn_4bd8(s308, ld64(s408 + 0x38), n)
		l = ld64(s2f8)
		const p = ld64(s308 + 8)
		o = ld64(s408 + 0x28)
		if (ld64(s308) != 0) {
			st64(o + 8, l)
			st64(o, p)
			st8(o + 0x71, 2)
			if (q != 0) {
				const ac = ld64(s408 + 0x30)
				void ld64(ac)
				void ld8(ac + 0x38)
				return k
			}
			const r = ld64(s408 + 0x30)
			void ld64(r)
			void ld8(r + 0x50)
			return k
		}
		st64(s408 + 0x38, q)
		copyr(s268, p, 0x20)
		const x = ld64(s408 + 0x18)
		const y = ld16(x + 0x17f)
		const z = ld64(s408)
		st64(s2c8 + 0x10, x)
		st64(s2d8, ld64(s408 + 0x10))
		st64(s2e8, ld64(s408 + 8))
		st64(s2f8, h + 1)
		st64(s308, 0x10015984c)
		st64(s2c8, y != 0 ? z : 1, (y != 0) << 1)
		st64(s2c8 + 0x18, 1)
		st64(s2d0, 0x20)
		st64(s2e8 + 8, 0x20)
		st64(s2f8 + 8, 0x20)
		st64(s308 + 8, 4)
		st64(s28, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
		// PDA create_program_address(["pool", *(h + 1), *(ld64(s408 + 8)), *(ld64(s408 + 0x10)), (y != 0 ? z : 1)[..(y != 0) << 1], x[..1]], program *s28)
		const aa = Pubkey_create_program_address(s50, s308, 6, s28, k)
		if (ld8(s50) != 1) {
			copyr(s70, s4f, 0x20)
			copy(s90, s268, 0x20)
			k = Error_with_pubkeys(s328, ld64(s408 + 0x38), ld64(s408 + 0x30), s90, aa)
			ab = ld64(s328)
			st64(o + 8, ld64(s328 + 8))
			st64(o, ab)
			st8(o + 0x71, 2)
			st64(l, ld64(l) - 1)
			return k
		}
		st8(s2, ld8(s4f))
		fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s2, 0x100160228, 0x100160248)
	}
	st8(s28, ld8(s8f))
	fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s28, 0x100160228, 0x100160248)
}

export function fn_31a40(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s90 = fp - 0x90, s98 = fp - 0x98, sb0 = fp - 0xb0, sd0 = fp - 0xd0, s138 = fp - 0x138, s1c0 = fp - 0x1c0, s1d8 = fp - 0x1d8, s1fc = fp - 0x1fc, s240 = fp - 0x240, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2d4 = fp - 0x2d4, s360 = fp - 0x360, s378 = fp - 0x378, s388 = fp - 0x388, s3a8 = fp - 0x3a8, s3cc = fp - 0x3cc, s410 = fp - 0x410, s438 = fp - 0x438, s458 = fp - 0x458, s470 = fp - 0x470, s480 = fp - 0x480, s488 = fp - 0x488, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s510 = fp - 0x510, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s560 = fp - 0x560, s1000 = fp - 0x1000
	let ab, ay, ce, cg, cu, cv, cw, cx, dc, dd, dp: u64
	let dv = c
	st64(s4a0, 0, 0, 0)
	const f = ld64(b)
	let m = fn_4dc0(s2b0, f, r0)
	let g = p6
	const i = ld64(s2a0)
	const h = ld64(s2b0 + 8)
	if (ld64(s2b0) != 0) {
		st64(a + 0x10, i)
		st64(a + 8, h)
		st64(a, 1)
	} else {
		let p: AccountInfo = g
		const k = p8
		let du = p7
		const q = p5
		const j = ld8(h + 0x17d)
		st64(i, ld64(i) - 1)
		if ((j & 8) == 0) {
			const l = k != 0 ? 3 : 2
			m = fn_33a88(s4b0, f, d, l, m)
			const n = ld64(s4b0)
			if (n != 2) {
				const cf = ld64(s4b0 + 8)
				st64(a + 8, n, cf)
				st64(a, 1)
				g = p
			} else {
				if (l > d) {
					st64(a + 0x18, ld64(s4a0 + 0x10))
					st64(a + 0x10, ld64(s4a0 + 8))
					st64(a + 8, ld64(s4a0))
					st64(a, 0)
					return fn_ff88(p, m)
				}
				let o = dv
				const ds = dv + (d << 3)
				const dn = d / l
				let r = 0
				const di = p.is_writable
				const dh = p.is_signer
				const dg = p.rent_epoch
				const df = p.owner
				const dj: DataCell = p.data
				const dl: LamportsCell = p.lamports
				const de = p.key
				const dm = p.executable
				const dk = ld64(q)
				du = du + 0x80
				const dt: AccountInfo = p
				while (true) {
					st64(s488, r)
					if (o == ds) {
						m = fn_88360(s560, 2)
						g = p
						const ch = ld64(s560)
						st64(a + 0x10, ld64(s560 + 8))
						st64(a + 8, ch)
						st64(a, 1)
						break
					}
					B80: {
						const t = r
						const u = o
						m = InterfaceAccount_try_from_unchecked(s2b0, ld64(o))
						const w = ld64(s2b0 + 8)
						const v = ld64(s2b0)
						const s = ld32(s240 + 0x40)
						if (s == 2) {
							st64(a + 0x10, w)
							st64(a + 8, v)
							st64(a, 1)
						} else {
							dv = u + 8
							copyr(s470, s2a0, 0x10)
							copyr(s3a8, s288, 0x20)
							const x = ld64(s290)
							copy(s438, s268, 0x20)
							let dr = ld64(s268 + 0x20)
							memcpy(s410, s240, 0x40)
							st32(s3cc + 0x20, ld32(s1fc + 0x20))
							copyr(s3cc, s1fc, 0x20)
							st64(s480, v, w)
							let dq = x
							st64(s470 + 0x10, x)
							copyr(s458, s3a8, 0x20)
							st32(s410 + 0x40, s)
							st64(s438 + 0x20, dr)
							if (dv == ds) {
								m = fn_88360(s550, 2)
								const ci = ld64(s550)
								st64(a + 0x10, ld64(s550 + 8))
								st64(a + 8, ci)
								st64(a, 1)
							} else {
								m = InterfaceAccount_try_from_unchecked(s2b0, ld64(u + 8))
								const z = ld64(s2b0 + 8)
								const aa = ld64(s2b0)
								const y = ld32(s240 + 0x40)
								if (y == 2) {
									st64(a + 0x10, z)
									st64(a + 8, aa)
									st64(a, 1)
								} else {
									B14: {
										dv = u
										ab = u + 0x10
										memcpy(s1d8, s2a0, 0xa0)
										copy(s2d4, s1fc, 0x20)
										st32(s2d4 + 0x20, ld32(s1fc + 0x20))
										st64(s388, aa, z)
										memcpy(s378, s1d8, 0xa0)
										st32(s360 + 0x88, y)
										dp = 0
										if (k != 0) {
											if (ab == ds) {
												m = fn_88360(s540, 2)
												cv = ld64(s540)
												cu = ld64(s540 + 8)
											} else {
												m = InterfaceAccount_try_from(s2b0, ld64(dv + 0x10))
												const ac = ld32(s2b0)
												if (ac != 2) {
													const af = ld64(s2a0)
													dp = ld64(s2b0 + 8)
													const ag = ld32(s2b0 + 4)
													memcpy(s138, s298, 0x68)
													const ad = ld64(0x300000000 /* heap bump-allocator cursor */)
													const ae = ad != 0 ? sat_sub(ad, 0x80) & -8 : 0x300007f80
													if (0x300000008 > ae) {
														alloc_handle_alloc_error(8, 0x80)
													}
													ab = dv + 0x18
													st64(0x300000000 /* heap bump-allocator cursor */, ae)
													st64(ae + 0x10, af)
													st64(ae + 8, dp)
													st32(ae + 4, ag)
													st32(ae, ac)
													dp = ae
													memcpy(ae + 0x18, s138, 0x68)
													break B14
												}
												cv = ld64(s2b0 + 8)
												cu = ld64(s2a0)
											}
											st64(a + 0x10, cu)
											st64(a + 8, cv)
											st64(a, 1)
											g = dt
											break
										}
									}
									B76: {
										dv = ab
										const ah = memcmp(s458, s360, 0x20)
										cg = a
										if ((ah as u32) == 0) {
											const ai = ld64(dq)
											copyr(sd0, ai, 0x20)
											m = fn_53e8(s2b0, f, undef, undef, undef, ah as u32)
											let al = ld64(s2a0)
											let ak = ld64(s2b0 + 8)
											if (ld64(s2b0) == 0) {
												let aj = ld64(s488)
												if (3 > aj) {
													const am = memcmp(sd0, ak + aj * 0xa9 + 0x1de, 0x20)
													st64(al, ld64(al) + 1)
													m = am as u32
													let ao = t
													const aw = dr
													if (m == 0) {
														const an = ld64(s488)
														if (3 > an) {
															const ap = ao
															const aq = ld64(du + an * 0x18 + 0x10)
															st64(s98, aq)
															if (aq == 0) {
																p = dt
																ce = dv
																if (ap + 1 >= dn) {
																	st64(a + 0x18, ld64(s4a0 + 0x10))
																	st64(a + 0x10, ld64(s4a0 + 8))
																	st64(a + 8, ld64(s4a0))
																	st64(a, 0)
																	return fn_ff88(p, m)
																}
															} else {
																const ax = ao
																m = fn_4dc0(s2b0, f, m)
																const au = ld64(s2a0)
																const ar = ld64(s2b0 + 8)
																if (ld64(s2b0) != 0) {
																	st64(a + 0x10, au)
																	st64(a + 8, ar)
																	st64(a, 1)
																	break B80
																}
																m = fn_6cb08(s500, ar, ld64(s488), ld64(s98), undef, m)
																const at = ld64(s500)
																if (at != 2) {
																	const ct = ld64(s500 + 8)
																	st64(a + 8, at, ct)
																	st64(a, 1)
																	st64(au, ld64(au) - 1)
																	break B80
																}
																st64(au, ld64(au) - 1)
																p = dt
																const av = min(ld64(s98), aw)
																st64(sb0, av)
																let cd = dn
																ao = ax
																cg = a
																if (av != 0) {
																	st64(s48, 0x10015fc58)
																	st64(s38, s2b0)
																	st64(s2b0, s488, fn_155738, sb0, fn_155738, s98, fn_155738)
																	st64(s28, 0)
																	st64(s40, 4)
																	st64(s38 + 8, 3)
																	// fmt "collect reward index: {}, transfer_amount: {}, reward_amount_owed:{} " {} = *s488 [fn_155738], {} = av [fn_155738], {} = *s98 [fn_155738]
																	fn_14de10(s90, s48, undef, ao, ay)
																	const bd = sol_log(ld64(s90 + 8), ld64(s90 + 0x10))
																	const ba = ld64(sb0)
																	const az = ld64(s98)
																	if (ba > az) {
																		m = fn_88360(s530, 0x26)
																		cx = ld64(s530)
																		cw = ld64(s530 + 8)
																		break B76
																	}
																	const bb = ld64(s488)
																	if (bb >= 3) {
																		fn_14ec98(bb, 3, 0x10015fc98)
																	}
																	const bc = du + bb * 0x18
																	st64(bc + 0x10, az - ba)
																	m = fn_53e8(s2b0, f, bc, undef, undef, bd)
																	al = ld64(s2a0)
																	ak = ld64(s2b0 + 8)
																	const bf: AccountInfo = dq
																	if (ld64(s2b0) != 0) {
																		st64(cg + 0x10, al)
																		st64(cg + 8, ak)
																		st64(cg, 1)
																		break B80
																	}
																	m = fn_6cf80(s510, ak, ld64(s488), ld64(sb0), m)
																	const be = ld64(s510)
																	if (be != 2) {
																		const cy = ld64(s510 + 8)
																		st64(cg + 8, be, cy)
																		st64(cg, 1)
																		st64(al, ld64(al) + 1)
																		break B80
																	}
																	st64(al, ld64(al) + 1)
																	const bg: LamportsCell = bf.lamports
																	const bm = bf.key
																	cd = dn
																	rc_inc(bg)
																	const bh: DataCell = bf.data
																	rc_inc(bh)
																	const bl = bf.owner
																	const bk = bf.rent_epoch
																	const bj = bf.is_signer
																	const bi = bf.is_writable
																	st8(s50 + 2, bf.executable)
																	st8(s50, bj, bi)
																	st64(s78, bm, bg, bh, bl, bk)
																	const bn: AccountInfo = ld64(s378 + 0x10)
																	const bo: LamportsCell = bn.lamports
																	const bu = bn.key
																	rc_inc(bo)
																	const bp: DataCell = bn.data
																	dr = bo
																	dq = bg
																	rc_inc(bp)
																	const bt = bn.owner
																	const bs = bn.rent_epoch
																	const br = bn.is_signer
																	let bq = bn.is_writable
																	st8(s20 + 2, bn.executable)
																	st8(s20, br, bq)
																	st64(s48, bu, dr, bp, bt, bs)
																	let bx = 0
																	const bv = dp
																	if (dp != 0) {
																		const bw = ld64(0x300000000 /* heap bump-allocator cursor */)
																		bx = bw != 0 ? sat_sub(bw, 0x80) & -8 : 0x300007f80
																		if (0x300000007 >= bx) {
																			alloc_handle_alloc_error(8, 0x80)
																		}
																		st64(0x300000000 /* heap bump-allocator cursor */, bx)
																		const by = ld64(bv + 0x58)
																		bq = memcpy(bx, bv, 0x58)
																		st64(bx + 0x58, by)
																		copy(bx + 0x60, bv + 0x60, 0x20)
																		cd = dn
																	}
																	let bz = 2
																	if (dm != 2) {
																		rc_inc(dl)
																		rc_inc(dj)
																		st8(s288, dh, di)
																		st64(s2b0, de, dl, dj, df, dg)
																		bz = dm
																	}
																	st8(s288 + 2, bz)
																	st64(s1000 + 0x18, ld64(sb0))
																	st64(s1000, bx, dk, s2b0)
																	m = fn_7a038(s520, b, s78, s48, bx, dk, s2b0, ld64(s1000 + 0x18), bq)
																	const ca = ld64(s520)
																	if (ca != 2) {
																		const cz = ld64(s520 + 8)
																		st64(a + 8, ca, cz)
																		st64(a, 1)
																		m = ptr_drop_in_place_fcd8(s78, ptr_drop_in_place_fcd8(s48, m))
																		break B80
																	}
																	if (rc_release(dr)) {
																		m = Rc_drop_slow_14df0(s40, m)
																	}
																	const cb = dq
																	if (rc_release(bp)) {
																		m = Rc_drop_slow_14df0(s38, m)
																	}
																	ao = t
																	if (rc_release(cb)) {
																		m = Rc_drop_slow_14df0(s70, m)
																	}
																	if (rc_release(bh)) {
																		m = Rc_drop_slow_14df0(s68, m)
																	}
																	p = dt
																}
																const cc = ld64(s488)
																if (cc >= 3) {
																	fn_14ec98(cc, 3, 0x10015fcb0, ao, ay)
																}
																st64(s4a0 + (cc << 3), ld64(sb0))
																ce = dv
																if (ap + 1 >= cd) {
																	st64(a + 0x18, ld64(s4a0 + 0x10))
																	st64(a + 0x10, ld64(s4a0 + 8))
																	st64(a + 8, ld64(s4a0))
																	st64(a, 0)
																	return fn_ff88(p, m)
																}
															}
															r = ao + 1
															o = ce
															continue
														}
														fn_14ec98(an, 3, 0x10015fc40, ao)
													}
													ErrorCode_name(sb0, 0x100159874, undef, ao)
													st64(s78, 0, 1, 0)
													st64(s28, s78, 0x10015f818)
													st8(s20 + 0x10, 3)
													st64(s20 + 8, 0x20)
													st64(s38, 0)
													st64(s48, 0)
													if (ErrorCode_fmt(0x100159874, s48) != 0) {
														fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
													}
													copyr(s278, s78, 0x18)
													copy(s290, sb0, 0x18)
													st64(s2b0 + 8, 0x100159f11)
													st32(s240 + 0x28, 0x9c6 /* anchor::RequireKeysEqViolated */)
													st8(s268 + 8, 2)
													st32(s298, 0x1c6)
													st64(s2a0, 0x33)
													st64(s2b0, 0)
													const cm = fn_13e5a0(s4e0, s2b0)
													const cq = ld64(s4e0 + 8)
													const cp = ld64(s4e0)
													const cr = fn_53e8(s48, f, undef, undef, undef, cm)
													al = ld64(s38)
													const cn = ld64(s40)
													if (ld64(s48) != 0) {
														st64(a + 0x10, al)
														st64(a + 8, cn)
														st64(a, 1)
														m = fn_fc80(cp, cq, cr)
														break B80
													}
													aj = ld64(s488)
													if (aj >= 3) {
														fn_14ec98(aj, 3, 0x10015fc28, dc, dd)
													}
													const co = aj * 0xa9
													copyr(s290, cn + co + 0x1de, 0x20)
													copy(s2b0, sd0, 0x20)
													m = Error_with_pubkeys(s4f0, cp, cq, s2b0, cr)
													const cs = ld64(s4f0)
													st64(a + 0x10, ld64(s4f0 + 8))
													st64(a + 8, cs)
													st64(a, 1)
													st64(al, ld64(al) + 1)
													break B80
												}
												fn_14ec98(aj, 3, 0x10015fc28, dc, dd)
											}
											st64(cg + 0x10, al)
											st64(cg + 8, ak)
											st64(cg, 1)
											break B80
										}
										ErrorCode_name(sb0, 0x100159874)
										st64(s78, 0, 1, 0)
										st64(s28, s78, 0x10015f818)
										st8(s20 + 0x10, 3)
										st64(s20 + 8, 0x20)
										st64(s38, 0)
										st64(s48, 0)
										if (ErrorCode_fmt(0x100159874, s48) != 0) {
											fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
										}
										copyr(s278, s78, 0x18)
										copy(s290, sb0, 0x18)
										st64(s2b0 + 8, 0x100159f11)
										st32(s240 + 0x28, 0x9c6 /* anchor::RequireKeysEqViolated */)
										st8(s268 + 8, 2)
										st32(s298, 0x1c5)
										st64(s2a0, 0x33)
										st64(s2b0, 0)
										const cl = fn_13e5a0(s4c0, s2b0)
										const ck = ld64(s4c0 + 8)
										const cj = ld64(s4c0)
										copyr(s2b0, s3a8, 0x20)
										copy(s290, s1c0, 0x20)
										m = Error_with_pubkeys(s4d0, cj, ck, s2b0, cl)
										cx = ld64(s4d0)
										cw = ld64(s4d0 + 8)
									}
									st64(cg + 0x10, cw)
									st64(cg + 8, cx)
									st64(cg, 1)
								}
							}
						}
					}
					g = dt
					break
				}
			}
		} else {
			st64(a + 0x18, 0)
			st64(a + 0x10, 0)
			st64(a + 8, 0)
			st64(a, 0)
			g = p
		}
	}
	if (ld8(g + 0x2a) == 2) {
		return m
	}
	const da = ld64(g + 8)
	if (rc_release(da)) {
		m = Rc_drop_slow_14df0(g + 8, m)
	}
	const db = ld64(g + 0x10)
	if (!rc_release(db)) {
		return m
	}
	return Rc_drop_slow_14df0(g + 0x10, m)
}

export function fn_33a88(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s40 = fp - 0x40, sb7 = fp - 0xb7, sd0 = fp - 0xd0, sf0 = fp - 0xf0, s19e = fp - 0x19e, s247 = fp - 0x247, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s348 = fp - 0x348
	let m: u64
	let g = a
	let n = fn_4dc0(s300, b, r0)
	let f = ld64(s2f0)
	if (ld64(s300) != 0) {
		m = ld64(s300 + 8)
		st64(g + 8, f)
		st64(g, m)
		return n
	}
	st64(s348, f, d, c, g)
	memcpy(s2f0, ld64(s300 + 8) + 0x185, 0x1fb)
	memcpy(sf0, s2f0, 0xa9)
	st64(s28, 0, 0, 0, 0)
	const h = memcmp(sb7, s28, 0x20)
	memcpy(sf0, s247, 0xa9)
	st64(s28, 0, 0, 0, 0)
	st64(s348 + 0x20, s28)
	const i = memcmp(sb7, s28, 0x20)
	memcpy(sf0, s19e, 0xa9)
	let j = (h as u32) != 0
	if ((i as u32) != 0) {
		j = j + 1
	}
	st64(s28, 0, 0, 0, 0)
	if ((memcmp(sb7, ld64(s348 + 0x20), 0x20) as u32) != 0) {
		j = j + 1
		if (j == 0) {
			fn_154730(0x10015fce0)
		}
	}
	n = __multi3_159030(s310, j, 0, ld64(s348 + 8), 0)
	g = ld64(s348 + 0x18)
	const k = ld64(s348 + 0x10)
	if (ld64(s310 + 8) != 0) {
		fn_1547e0(0x10015fcc8, k)
	}
	if (ld64(s310) == k) {
		f = ld64(s348)
		st64(f, ld64(f) - 1)
		st64(g + 8, f)
		st64(g, 2)
		return n
	}
	fn_85138(s40, 0x10015986c)
	st64(s28, 0, 1, 0)
	st64(sd0, s28, 0x10015f818)
	st8(sd0 + 0x18, 3)
	st64(sd0 + 0x10, 0x20)
	st64(sf0 + 0x10, 0)
	st64(sf0, 0)
	if (fn_88558(0x10015986c, sf0) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(s2e0, s40, 0x30)
	st64(s300 + 8, 0x100159f11)
	st32(s2e0 + 0x78, 0x178e /* error::InvalidRewardInputAccountNumber */)
	st8(s2e0 + 0x30, 2)
	st32(s2f0 + 8, 0x205)
	st64(s2f0, 0x33)
	st64(s300, 0)
	n = fn_13e5a0(s320, s300)
	f = ld64(s320 + 8)
	m = ld64(s320)
	const l = ld64(s348)
	st64(l, ld64(l) - 1)
	st64(g + 8, f)
	st64(g, m)
	return n
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
export function fn_34bd0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s2e = fp - 0x2e, s68 = fp - 0x68, s90 = fp - 0x90, sd0 = fp - 0xd0, sd8 = fp - 0xd8, se0 = fp - 0xe0, se8 = fp - 0xe8, sf0 = fp - 0xf0, sf8 = fp - 0xf8, s100 = fp - 0x100, s108 = fp - 0x108, s110 = fp - 0x110, s118 = fp - 0x118
	let s, x: u64
	st64(sd0, c, d)
	let h = 0x10d
	const f = ld32(b + 0x105)
	const g = ld8(b + 0x17e)
	if (g != 1 && (g == 2 || p5 == 0)) {
		h = 0x11d
	}
	B22: {
		st64(se0, ld64(b + 0xfd))
		st64(sd8, ld64(b + 0xf5))
		st64(sd0 + 0x20, p6)
		st64(sd0 + 0x30, f as i32)
		st64(sf0, ld64(b + 0xed))
		st64(se8, ld64(b + 0xe5))
		let m = ld64(b + 0x45a)
		st64(s90 + 0x10, ld32(b + 0x456))
		const k = ld32(b + 0x452)
		const l = ld32(b + 0x44e)
		st64(s90 + 0x18, ld16(b + 0x444))
		st64(s90 + 0x20, ld16(b + 0x442))
		st64(sd0 + 0x38, ld16(b + 0xe3))
		const i = b + h
		st64(s100, ld64(i + 8))
		st64(sf8, ld64(i))
		const j = ld16(b + 0x440)
		st64(sd0 + 0x28, j)
		st64(sd0 + 0x18, k)
		if (j == 0 && (ld64(s90 + 0x20) == 0 && (ld64(s90 + 0x18) == 0 && (ld32(b + 0x446) == 0 && (ld32(b + 0x44a) == 0 && (l == 0 && (k == 0 && (ld64(s90 + 0x10) == 0 && m == 0)))))))) {
			st64(s118, m)
			memcpy(s2e, b + 0x462, 0x2e)
			st64(s68 + 0x26, 0)
			st64(s68, 0, 0, 0, 0, 0)
			const n = memcmp(s2e, s68, 0x2e)
			m = ld64(s118)
			st64(sd0 + 0x10, 0)
			st64(s90, 0, 0)
			x = 0
			s = 0
			if ((n as u32) == 0) {
				break B22
			}
		}
		st64(s110, l)
		s = m
		st64(s108, ld64(b + 0x446))
		memcpy(s68, b + 0x462, 0x2e)
		const o = ld64(sd0 + 0x38)
		if (o == 0) {
			fn_154940(0x1001602a8)
		}
		const p = ld64(sd0 + 0x30)
		let q = fn_1561f0(p, o)
		const u = ld64(s110)
		if (-1 >= (p as i64) && ((p - q * o) as u32) != 0) {
			q = (q as i32) - 1
			if ((q as i32) != q) {
				fn_154788(0x1001602c0, undef, undef, undef, u)
			}
		}
		const r = ld64(sd0 + 0x20)
		const t = r - s
		st64(sd0 + 0x10, 1)
		const v = t > r ? 0 : t
		st64(s90, u)
		x = ld64(sd0 + 0x18)
		const w = ld64(sd0 + 0x28)
		st64(s90 + 8, q)
		if (v >= w) {
			x = 0
			st64(s90, ld64(s90 + 8))
			s = ld64(sd0 + 0x20)
			if (ld64(s90 + 0x20) > v) {
				x = ld64(s90 + 0x10) * ld64(s90 + 0x18) / 0x2710
				st64(s90, ld64(s90 + 8))
				s = ld64(sd0 + 0x20)
			}
		}
	}
	const y = memcpy(a + 0x9d, s68, 0x33)
	st64(a + 0x28, ld64(s100))
	st64(a + 0x20, ld64(sf8))
	st64(a + 0x18, ld64(se0))
	st64(a + 0x10, ld64(sd8))
	st64(a + 0x50, ld64(sf0))
	st64(a + 0x48, ld64(se8))
	st64(a, ld64(sd0))
	st64(a + 0x95, s)
	st32(a + 0x91, ld64(s90 + 0x10))
	st32(a + 0x8d, x)
	st32(a + 0x89, ld64(s90))
	st64(a + 0x81, ld64(s108))
	st16(a + 0x7f, ld64(s90 + 0x18))
	st16(a + 0x7d, ld64(s90 + 0x20))
	st16(a + 0x7b, ld64(sd0 + 0x28))
	st8(a + 0x7a, ld64(sd0 + 0x10))
	st16(a + 0x78, ld64(sd0 + 0x38))
	st32(a + 0x74, ld64(s90 + 8))
	st32(a + 0x70, ld64(sd0 + 8))
	st32(a + 0x68, ld64(sd0 + 0x30))
	st64(a + 0x60, 0)
	st64(a + 0x58, 0)
	st64(a + 0x30, 0)
	st64(a + 8, 0)
	st64(a + 0x38, 0, 0)
	st32(a + 0x6c, 0)
	return y
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: p6 (value)
export function fn_35270(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	let n, o: u64
	let j = d
	const r = p9
	const q = p8
	const h = p6
	const f = p5
	let g = c
	if (p7 != 0) {
		g = f + c
		if (c > g) {
			o = fn_88360(s20, 0x26)
			n = ld64(s20)
			st64(a + 8, ld64(s20 + 8))
			st64(a, n)
			return o
		}
	}
	const i = ld64(b)
	if (h != 0) {
		if (g > i) {
			o = fn_88360(s20, 0x26)
			n = ld64(s20)
			st64(a + 8, ld64(s20 + 8))
			st64(a, n)
			return o
		}
		st64(b, i - g)
		const p = ld64(b + 8)
		if (p > p + j) {
			o = fn_88360(s20, 0x26)
			n = ld64(s20)
			st64(a + 8, ld64(s20 + 8))
			st64(a, n)
			return o
		}
		st64(b + 8, p + j)
	} else {
		if (j > i) {
			o = fn_88360(s20, 0x26)
			n = ld64(s20)
			st64(a + 8, ld64(s20 + 8))
			st64(a, n)
			return o
		}
		st64(b, i - j)
		const k = ld64(b + 8)
		if (k > k + g) {
			o = fn_88360(s20, 0x26)
			n = ld64(s20)
			st64(a + 8, ld64(s20 + 8))
			st64(a, n)
			return o
		}
		j = k + g
		st64(b + 8, j)
	}
	o = fn_35480(s10, b, f, q, r, j)
	const m = ld64(s10 + 8)
	const l = ld64(s10)
	if (l == 2) {
		st64(a + 8, m)
		st64(a, 2)
		return o
	}
	st64(a + 8, m)
	st64(a, l)
	return o
}

export function fn_35480(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98
	let o, u: u64
	let h = 0
	let f = 0
	if ((d as u32) != 0) {
		__multi3_159030(s58, d as u32, 0, c, 0)
		r0 = __udivti3(s68, ld64(s58), ld64(s58 + 8), 0xf4240, 0)
		f = ld64(s68)
	}
	if ((e as u32) != 0) {
		__multi3_159030(s78, e as u32, 0, c, 0)
		r0 = __udivti3(s88, ld64(s78), ld64(s78 + 8), 0xf4240, 0)
		h = ld64(s88)
	}
	if (f != 0) {
		const g = ld64(b + 0x38)
		if (g > g + f) {
			r0 = fn_88360(s98, 0x26)
			u = ld64(s98)
			st64(a + 8, ld64(s98 + 8))
			st64(a, u)
			return r0
		}
		st64(b + 0x38, g + f)
	}
	if (h != 0) {
		const i = ld64(b + 0x40)
		if (i > i + h) {
			r0 = fn_88360(s98, 0x26)
			u = ld64(s98)
			st64(a + 8, ld64(s98 + 8))
			st64(a, u)
			return r0
		}
		st64(b + 0x40, i + h)
	}
	if (f > c) {
		r0 = fn_88360(s98, 0x26)
		u = ld64(s98)
		st64(a + 8, ld64(s98 + 8))
		st64(a, u)
		return r0
	}
	const j = c - f
	if (j >= h) {
		const n = j - h
		const l = ld64(b + 0x50)
		const k = ld64(b + 0x48)
		if ((k | l) != 0) {
			st64(s30, n, 0, 0, 1, k, l)
			r0 = fn_584f8(s48, s30, s20, s10)
			if (ld64(s48) != 0) {
				const r = ld64(s48 + 8)
				const p = ld64(s48 + 0x10)
				const q = ld64(b + 0x28)
				const s = ld64(b + 0x20)
				st64(b + 0x20, r + s, p + q + (r > r + s))
				const t = ld64(b + 0x30)
				if (t > t + n) {
					r0 = fn_88360(s98, 0x26)
					u = ld64(s98)
					st64(a + 8, ld64(s98 + 8))
					st64(a, u)
					return r0
				}
				o = t + n
				st64(b + 0x30, o)
				st64(a + 8, o)
				st64(a, 2)
				return r0
			}
			r0 = fn_88360(s98, 0x26)
			u = ld64(s98)
			st64(a + 8, ld64(s98 + 8))
			st64(a, u)
			return r0
		}
		const m = ld64(b + 0x38)
		o = m > m + n
		if (o != 0) {
			r0 = fn_88360(s98, 0x26)
			u = ld64(s98)
			st64(a + 8, ld64(s98 + 8))
			st64(a, u)
			return r0
		}
		st64(b + 0x38, m + n)
		st64(a + 8, o)
		st64(a, 2)
		return r0
	}
	r0 = fn_88360(s98, 0x26)
	u = ld64(s98)
	st64(a + 8, ld64(s98 + 8))
	st64(a, u)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), p5 (value)
export function fn_35900(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	let l, o: u64
	const f = ld64(b)
	if (f > c) {
		l = fn_88360(s20, 0x26)
		o = ld64(s20)
		st64(a + 0x10, ld64(s20 + 8))
		st64(a + 8, o)
		st64(a, 1)
		return l
	}
	const g = p5
	let h = ld64(b + 8)
	l = d != g ? c - f : h
	h = d != g ? h : c - f
	const j = ld64(b + 0x38)
	const i = ld64(b + 0x30)
	if (i > i + j) {
		l = fn_88360(s10, 0x26)
		o = ld64(s10)
		st64(a + 0x10, ld64(s10 + 8))
		st64(a + 8, o)
		st64(a, 1)
		return l
	}
	const k = ld64(b + 0x40)
	if (j + i > j + i + k) {
		l = fn_88360(s10, 0x26)
		o = ld64(s10)
		st64(a + 0x10, ld64(s10 + 8))
		st64(a + 8, o)
		st64(a, 1)
		return l
	}
	const m = p6
	st64(a + 0x10, l)
	st64(a + 8, h)
	const n = k + (j + i)
	st64(a + 0x20, m != 0 ? 0 : n)
	st64(a + 0x18, m != 0 ? n : 0)
	st64(a, 0)
	return l
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: p5 (value), p6 (value)
export function fn_35ae8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8
	let f, m, w, x, ae, af: u64
	B3: {
		f = c
		st32(b + 0x6c, c)
		let g = 0xfff93b0c
		ae = p6
		af = p5
		if ((c as i32) >= -0x6c4f4) {
			g = 0x6c4f4
			if (0x6c4f5 > (c as i32)) {
				break B3
			}
		}
		st32(b + 0x6c, g)
		f = g
	}
	let k = fn_644c8(s118, f, r0)
	const i = ld64(s118 + 8)
	if (ld64(s118) != 0) {
		st64(a + 0x10, ld64(s118 + 0x10))
		st64(a + 8, i)
		st64(a, 1)
		return k
	}
	const h = ld64(s118 + 0x10)
	st64(b + 0x60, h)
	st64(b + 0x58, i)
	const j = ld32(b + 0x68)
	if (d != 0) {
		k = ae
		const l = h != ae ? h > ae : i > af
		x = l != 0 ? h : ae
		m = l != 0 ? i : af
		if ((f as i32) > (j as i32)) {
			ErrorCode_name(s78, 0x100159858, i, h, m)
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
			st64(s118 + 8, 0x100159f83)
			st32(sf8 + 0x78, 0x9ca /* anchor::RequireGteViolated */)
			st8(sf8 + 0x30, 2)
			st32(s118 + 0x18, 0x166)
			st64(s118 + 0x10, 0x25)
			st64(s118, 0)
			fn_13e5a0(s1c8, s118)
			k = fn_3158(s1d8, ld64(s1c8), ld64(s1c8 + 8), j as i32, f)
			w = ld64(s1d8)
			st64(a + 0x10, ld64(s1d8 + 8))
			st64(a + 8, w)
			st64(a, 1)
			return k
		}
		const s = ld64(b + 0x10)
		const t = ld64(b + 0x18)
		if ((t != h ? h > t : i > s) != 0) {
			ErrorCode_name(s78, 0x100159858, i, h, m)
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
			st64(s118 + 8, 0x100159f83)
			st32(sf8 + 0x78, 0x9ca /* anchor::RequireGteViolated */)
			st8(sf8 + 0x30, 2)
			st32(s118 + 0x18, 0x167)
			st64(s118 + 0x10, 0x25)
			st64(s118, 0)
			fn_13e5a0(s1a8, s118)
			const v = ld64(s1a8 + 8)
			const u = ld64(s1a8)
			k = fn_2be8(s1b8, u, v, s, t, i, h)
			w = ld64(s1b8)
			st64(a + 0x10, ld64(s1b8 + 8))
			st64(a + 8, w)
			st64(a, 1)
			return k
		}
		if ((t != k ? k > t : af > s) != 0) {
			const ab = m
			ErrorCode_name(s78, 0x100159858, af, h, m)
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
			st64(s118 + 8, 0x100159f83)
			st32(sf8 + 0x78, 0x9ca /* anchor::RequireGteViolated */)
			st8(sf8 + 0x30, 2)
			st32(s118 + 0x18, 0x168)
			st64(s118 + 0x10, 0x25)
			st64(s118, 0)
			fn_13e5a0(s188, s118)
			const ad = ld64(s188 + 8)
			const ac = ld64(s188)
			k = fn_2be8(s198, ac, ad, s, t, ab, x)
			w = ld64(s198)
			st64(a + 0x10, ld64(s198 + 8))
			st64(a + 8, w)
			st64(a, 1)
			return k
		}
		st64(a + 8, m, x)
		st64(a, 0)
		return k
	}
	k = ae
	const n = h != ae ? ae > h : af > i
	x = n != 0 ? h : ae
	m = n != 0 ? i : af
	if ((j as i32) >= (f as i32)) {
		ErrorCode_name(s78, 0x100159900, i, h, m)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (ErrorCode_fmt(0x100159900, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(sf8, s78, 0x30)
		st64(s118 + 8, 0x100159f83)
		st32(sf8 + 0x78, 0x9c9 /* anchor::RequireGtViolated */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x16a)
		st64(s118 + 0x10, 0x25)
		st64(s118, 0)
		fn_13e5a0(s128, s118)
		k = fn_3158(s138, ld64(s128), ld64(s128 + 8), f, j as i32)
		w = ld64(s138)
		st64(a + 0x10, ld64(s138 + 8))
		st64(a + 8, w)
		st64(a, 1)
		return k
	}
	const o = ld64(b + 0x10)
	const p = ld64(b + 0x18)
	if ((h != p ? p > h : o > i) != 0) {
		ErrorCode_name(s78, 0x100159858, i, h, m)
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
		st64(s118 + 8, 0x100159f83)
		st32(sf8 + 0x78, 0x9ca /* anchor::RequireGteViolated */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x16b)
		st64(s118 + 0x10, 0x25)
		st64(s118, 0)
		fn_13e5a0(s168, s118)
		const r = ld64(s168 + 8)
		const q = ld64(s168)
		k = fn_2be8(s178, q, r, i, h, o, p)
		w = ld64(s178)
		st64(a + 0x10, ld64(s178 + 8))
		st64(a + 8, w)
		st64(a, 1)
		return k
	}
	if ((p != k ? p > k : o > af) != 0) {
		const y = m
		ErrorCode_name(s78, 0x100159858, af, h, m)
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
		st64(s118 + 8, 0x100159f83)
		st32(sf8 + 0x78, 0x9ca /* anchor::RequireGteViolated */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x16c)
		st64(s118 + 0x10, 0x25)
		st64(s118, 0)
		fn_13e5a0(s148, s118)
		const aa = ld64(s148 + 8)
		const z = ld64(s148)
		k = fn_2be8(s158, z, aa, y, x, o, p)
		w = ld64(s158)
		st64(a + 0x10, ld64(s158 + 8))
		st64(a + 8, w)
		st64(a, 1)
		return k
	}
	st64(a + 8, m, x)
	st64(a, 0)
	return k
}

export function fn_36b38(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 {
	let i: u64
	let f = ld8(b + 0x7a)
	if (f != 1) {
		st64(a, 2)
		return r0
	}
	if (d != 0) {
		const g = ld16(b + 0x78)
		if (g == 0) {
			fn_154940(0x1001602a8, b, c, d, f)
		}
		const q = a
		const p = b
		const h = ld32(b + ((ld64(b + 0x10) ^ ld64(b + 0x58) | ld64(b + 0x18) ^ ld64(b + 0x60)) != 0 ? 0x68 : 0x6c))
		i = fn_1561f0(h as i32, g)
		const j = h - i * g
		if (-1 >= (h as i32) && (j as u32) != 0) {
			i = (i as i32) - 1
			if ((i as i32) != i) {
				fn_154788(0x1001602c0, undef, c)
			}
		}
		a = q
		b = p
		if ((j as u32) == 0 && c == 0) {
			i = (i as i32) - 1
			const m = i as i32
			if (m != i) {
				fn_154788(0x10015fcf8, b, c, m)
			}
		}
		const k = ld32(b + 0x85)
		f = ld32(b + 0x91)
		if (f != k) {
			const l = (ld32(b + 0x89) as i32) - (i as i32)
			if ((l as i32) != l) {
				fn_154788(0x100160290, b, c, k, l)
			}
			f = min((((l as i32) ^ sar(l as i32, 0x3f)) - sar(l as i32, 0x3f)) * 0x2710 + ld32(b + 0x8d), k)
			st32(b + 0x91, f)
		}
	} else {
		i = ld32(b + 0x74)
	}
	const n = c != 0 ? 0xffffffffffffffff : 1
	r0 = (i as i32) + n
	const o = r0 as i32
	if (o != r0) {
		fn_154730(0x10015fd10, b, o, n, f)
	}
	st32(b + 0x74, r0)
	st64(a, 2)
	return r0
}

export function fn_36ed8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s18 = fp - 0x18
	let j, k, n, p: u64
	let f = ld8(b + 0x7a)
	if (f != 1) {
		st64(a, c, d)
		st32(a + 0x14, 0)
		st8(a + 0x10, 1)
		return f
	}
	f = ld64(b + 0x50)
	if ((ld64(b + 0x48) | f) == 0) {
		st64(a, c, d)
		st32(a + 0x14, 0)
		st8(a + 0x10, 1)
		return f
	}
	f = ld32(b + 0x85)
	if (ld32(b + 0x91) != f) {
		B8: {
			const i = ld16(b + 0x78)
			const g = ld32(b + 0x74)
			if (e != 0) {
				j = (g as i32) * i
				k = j as i32
				if (k == j) {
					break B8
				}
				p = sar(g as i32, 0x1f)
			} else {
				const h = smax(smin((g as i32) + 1, 0x7fffffff), 0xffffffff80000000)
				j = h * i
				k = j as i32
				if (k == j) {
					break B8
				}
				p = sar(h << 0x20, 0x3f)
			}
			j = p ^ 0x7fffffff
		}
		const l = smax(smin(j as i32, 0x6c4f4), 0xfffffffffff93b0c)
		f = fn_644c8(s18, l, k)
		const m = ld64(s18 + 8)
		if (ld64(s18) != 0) {
			st64(a + 8, ld64(s18 + 0x10))
			st64(a, m)
			st32(a + 0x14, 2)
			return f
		}
		const o = ld64(s18 + 0x10)
		if (e != 0) {
			n = c
			if ((o != d ? d > o : c > m) != 0) {
				st64(a, n, d)
				st32(a + 0x14, 0)
				st8(a + 0x10, 0)
				return f
			}
			st64(a, m)
			st32(a + 0x18, l)
			st64(a + 8, o)
			st32(a + 0x14, 1)
			st8(a + 0x10, 0)
			return f
		}
		n = c
		if ((o != d ? o > d : m > c) != 0) {
			st64(a, n, d)
			st32(a + 0x14, 0)
			st8(a + 0x10, 0)
			return f
		}
		st64(a, m)
		st32(a + 0x18, l)
		st64(a + 8, o)
		st32(a + 0x14, 1)
		st8(a + 0x10, 0)
		return f
	}
	st64(a, c, d)
	st32(a + 0x14, 0)
	st8(a + 0x10, 1)
	return f
}

export function fn_37228(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58
	let m, n, p, r: u64
	if (ld8(b + 0x7a) != 1) {
		st32(a + 8, ld32(b + 0x70))
		st64(a, 2)
		return r0
	}
	const g = ld16(b + 0x78)
	const f = ld32(b + 0x91)
	const h = f * g >> 0x20
	if (h == 0) {
		const i = ld32(b + 0x81)
		st64(s48, 0x9184e72a000, 0)
		st64(s20, i, 0)
		const j = (f * g) as u32
		st64(s10, j * j, 0)
		r0 = fn_58930(s38, s20, s10, s48)
		if (ld64(s38) != 1) {
			r0 = fn_88360(s58, 0x26)
			n = undef
			m = undef
			p = ld64(s58 + 8)
			const o = ld64(s58)
			if (o != 2) {
				st64(a + 8, p)
				st64(a, o)
				return r0
			}
		} else {
			const k = ld64(s38 + 0x10)
			m = k != 0
			const l = ld64(s38 + 8)
			n = k != 0 ? m : l > 0x186a0
			p = n != 0 ? 0x186a0 : l as u32
		}
		const q = ld32(b + 0x70) + (p as u32)
		if ((q as u32) != q) {
			fn_154730(0x10015fd28, q as u32, n, m, r)
		}
		st32(a + 8, min(q as u32, 0x186a0))
		st64(a, 2)
		return r0
	}
	fn_1547e0(0x10015fd40, h, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: p7 (value), p8 (value), p9 (value), p11 (value)
export function fn_374d0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s107 = fp - 0x107, s108 = fp - 0x108, s128 = fp - 0x128, s2ad = fp - 0x2ad, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s308 = fp - 0x308, s310 = fp - 0x310, s318 = fp - 0x318, s328 = fp - 0x328, s495 = fp - 0x495, s496 = fp - 0x496, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s50f = fp - 0x50f, s510 = fp - 0x510, s6f0 = fp - 0x6f0, s6f9 = fp - 0x6f9, s709 = fp - 0x709, s710 = fp - 0x710, s720 = fp - 0x720, s730 = fp - 0x730, s740 = fp - 0x740, s750 = fp - 0x750, s760 = fp - 0x760, s770 = fp - 0x770, s780 = fp - 0x780, s790 = fp - 0x790, s7a0 = fp - 0x7a0, s7b0 = fp - 0x7b0, s7c0 = fp - 0x7c0, s7d0 = fp - 0x7d0, s7e0 = fp - 0x7e0, s7f0 = fp - 0x7f0, s800 = fp - 0x800, s810 = fp - 0x810, s820 = fp - 0x820, s830 = fp - 0x830, s840 = fp - 0x840, s850 = fp - 0x850, s860 = fp - 0x860, s870 = fp - 0x870, s880 = fp - 0x880, s890 = fp - 0x890, s8a0 = fp - 0x8a0, s8b0 = fp - 0x8b0, s8c0 = fp - 0x8c0, s8d0 = fp - 0x8d0, s8e0 = fp - 0x8e0, s8f0 = fp - 0x8f0, s900 = fp - 0x900, s918 = fp - 0x918, s938 = fp - 0x938, s9a8 = fp - 0x9a8, s9c8 = fp - 0x9c8, s9e0 = fp - 0x9e0, s9f0 = fp - 0x9f0, sfe8 = fp - 0xfe8, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let p, q, ad, at, bf, bg, bh, bi, bn, bo, bq, br, by, cy, dc, dd, de, df, du, dv, en, eo, fe: u64
	const f = p7
	if (f != 0) {
		const g = ld64(c)
		if ((ld8(g + 0x17d) & 0x10) == 0) {
			B7: {
				st64(s9a8 + 0x68, b)
				st64(s938 + 0x18, d)
				st64(s918 + 0x10, p9)
				const i = p8
				st64(s918, p12, p11)
				let h = p10
				st64(s938, p6, p5)
				const k = ld64(g + 0xfd)
				const j = ld64(g + 0xf5)
				if (h != 0) {
					if ((ld64(s918 + 0x10) != 0 ? 0 : 0x100013b51 > i) != 0) {
						break B7
					}
					const l = k > ld64(s918 + 0x10)
					if (((k != ld64(s918 + 0x10) ? l : j > i) & 1) == 0) {
						break B7
					}
				} else {
					st64(s938 + 0x10, h)
					const m = ld64(s918 + 0x10) > 0xfffec4b1
					h = ld64(s938 + 0x10)
					if (((ld64(s918 + 0x10) != 0xfffec4b1 ? m : i > 0x845c1aa94e69579a) & 1) != 0) {
						break B7
					}
					const n = ld64(s918 + 0x10) > k
					if (((k != ld64(s918 + 0x10) ? n : i > j) & 1) == 0) {
						break B7
					}
				}
				st64(s9a8 + 0x48, i)
				st64(s9a8 + 0x50, f)
				const o = ld64(s918)
				q = fn_6c2a0(s328, g, o as u32)
				if (ld8(s328) != 0) {
					p = ld64(s328 + 8)
					st64(a + 0x10, ld64(s318))
					st64(a + 8, p)
					st64(a, 1)
					return q
				}
				st64(s938 + 0x10, h)
				st64(s9a8 + 0x58, a)
				st32(s710 + 3, ld32(s328 + 4))
				st32(s710, ld32(s328 + 1))
				const s = ld64(s328 + 8)
				const r = ld64(s318)
				st64(s9a8 + 0x60, g)
				memcpy(s510, s310, 0x1e4)
				const t = ld64(s9a8 + 0x60)
				const v = memcpy(s6f9, s510, 0x1e4)
				st64(s709, s, r)
				const u = ld16(t + 0x17f)
				st64(s9a8 + 0x38, t + 0x17f)
				st64(s938 + 8, ld64(ld64(s938 + 8)))
				st64(s328, 0x10015984c)
				st64(s2e8, u != 0 ? t + 0x17f : 1, (u != 0) << 1, t)
				st64(s308 + 0x10, t + 0x61)
				st64(s308, t + 0x41)
				st64(s9a8 + 0x40, t + 1)
				st64(s318, t + 1)
				st64(s2e8 + 0x18, 1)
				st64(s2f0, 0x20)
				st64(s308 + 8, 0x20)
				st64(s310, 0x20)
				st64(s328 + 8, 4)
				st64(s108, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
				// PDA create_program_address(["pool", *(t + 1), *(t + 0x41), *(t + 0x61), (u != 0 ? t + 0x17f : 1)[..(u != 0) << 1], t[..1]], program *s108)
				Pubkey_create_program_address(s510, s328, 6, s108, v)
				if (ld8(s510) != 1) {
					copyr(s48, s50f, 0x20)
					const w = ld64(s938 + 8)
					if ((memcmp(w + 0xb, s48, 0x20) as u32) == 0) {
						q = fn_6e930(s328, ld64(s9a8 + 0x60), ld64(s938), ld64(s938 + 0x10))
						ad = ld64(s328)
						if (ad == 2) {
							st64(s9a8 + 0x40, ld32(s328 + 0xc))
							const ag = ld8(s328 + 8)
							const ae = ld64(s938 + 0x18)
							let ar = fn_14c70(s760, ae, undef, undef, q)
							const af = ld64(s760)
							const bb = ld64(s9a8 + 0x58)
							if (af == 0) {
								q = fn_88360(s8f0, 0x17)
								const bc = ld64(s8f0)
								st64(bb + 0x10, ld64(s8f0 + 8))
								st64(bb + 8, bc)
								st64(bb, 1)
								return q
							}
							st64(s9a8 + 0x38, ag)
							let am = ld64(s760 + 8)
							const ah = ld64(ae + 0x18)
							let ao = af
							if (ah != 0) {
								let ai = 0
								while (ld32(ao + 0x20) != ld64(s9a8 + 0x40)) {
									const ap = ld64(s938 + 0x18)
									const aq = ld64(ap + 0x18)
									if (aq == 0) {
										q = fn_88360(s770, 0x17)
										bh = ld64(s770)
										bg = ld64(s9a8 + 0x58)
										st64(bg + 0x10, ld64(s770 + 8))
										st64(bg + 8, bh)
										st64(bg, 1)
										st64(am, ld64(am) + 1)
										return q
									}
									st64(ap + 0x18, aq - 1)
									ar = ld64(ap)
									const ak = ld64(ap + 0x10)
									ai = ai + 1
									const aj = ld64(s938 + 0x18)
									st64(aj + 0x10, ak + 1 - (ar > ak + 1 ? 0 : ar))
									const al = ld64(aj + 8) + (ak << 4)
									ao = ld64(al)
									const an = ld64(al + 8)
									st64(am, ld64(am) + 1)
									am = an
									if (ai >= ah) {
										break
									}
								}
							}
							fn_6a5a8(s328, ld64(s9a8 + 0x60), ar)
							if ((memcmp(ao, s328, 0x20) as u32) == 0) {
								if (ld32(ao + 0x20) == ld64(s9a8 + 0x40)) {
									const bd = ld64(s9a8 + 0x60)
									const be = ld8(bd + 0x17e)
									st64(s9c8 + 0x10, am)
									st64(s9a8 + 0x18, ao)
									if (be == 1) {
										bf = ld64(s938 + 0x10)
										bi = bf
									} else {
										bf = ld64(s938 + 0x10)
										bi = be != 2 ? 1 : bf ^ 1
									}
									st64(s9a8 + 0x10, bi)
									const bj = ld32(ld64(s9a8 + 0x68) + 0x5c)
									st64(s1000, bf, o as u32)
									q = fn_34bd0(s328, bd, ld64(s9a8 + 0x50), bj, bf, o as u32)
									const bl = ld64(s328 + 8)
									const bm = ld64(s328)
									const bk = ld8(s2e8 + 0x3a)
									if (bk == 2) {
										en = ld64(s9a8 + 0x58)
										st64(en + 0x10, bl)
										st64(en + 8, bm)
										st64(en, 1)
										am = ld64(s9c8 + 0x10)
										st64(am, ld64(am) + 1)
										return q
									}
									B121: {
										memcpy(s500, s318, 0x6a)
										memcpy(s495, s2ad, 0x55)
										st8(s496, bk)
										st64(s50f + 7, bl)
										bo = ld64(s500 + 8)
										bn = ld64(s500)
										st64(s510, bm)
										if (bm != 0 && (bn ^ ld64(s9a8 + 0x48) | bo ^ ld64(s918 + 0x10)) != 0) {
											const bp = ld64(s9a8 + 0x68)
											st64(s9e0 + 8, ld32(bp + 0x60))
											st64(s9e0, ld32(bp + 0x58))
											L47: while (true) {
												B144: {
													q = fn_723c8(s328, ld64(s9a8 + 0x18), ld32(s4f0 + 0x48), ld16(ld64(s9a8 + 0x60) + 0xe3), ld64(s938 + 0x10))
													br = ld64(s328 + 8)
													bq = ld64(s328)
													if (bq == 2) {
														B133: {
															if (br == 0) {
																if ((ld64(s9a8 + 0x38) & 1) != 0) {
																	q = fn_6f068(s328, ld64(s9a8 + 0x60), ld64(s938), ld64(s9a8 + 0x40), ld64(s938 + 0x10))
																	bq = ld64(s328)
																	if (bq != 2) {
																		break B133
																	}
																	const bt = ld32(s328 + 0xc)
																	st64(s9a8 + 0x40, 0x10)
																	const bs = ld32(s328 + 8)
																	if (bs != 0) {
																		st64(s9a8 + 0x40, bt)
																	}
																	if (bs == 0) {
																		q = fn_88360(s8e0, 0x10)
																		br = ld64(s8e0 + 8)
																		bq = ld64(s8e0)
																		break B144
																	}
																	let bu = ld64(s9a8 + 0x18)
																	let bv = ld32(bu + 0x20)
																	let bw = ld64(s9c8 + 0x10)
																	let bx = ld64(s938 + 0x18)
																	if (bv != bt) {
																		let bz = bw
																		do {
																			const ca = fn_14c70(s7c0, bx, bv, by, q)
																			bu = ld64(s7c0)
																			if (bu == 0) {
																				q = fn_88360(s7f0, 0x17)
																				br = ld64(s7f0 + 8)
																				bq = ld64(s7f0)
																				st64(s9c8 + 0x10, bz)
																				break B144
																			}
																			bw = ld64(s7c0 + 8)
																			st64(bz, ld64(bz) + 1)
																			fn_6a5a8(s328, ld64(s9a8 + 0x60), ca)
																			const cb = memcmp(bu, s328, 0x20)
																			q = cb as u32
																			if (q != 0) {
																				st64(s9c8 + 0x10, bw)
																				ErrorCode_name(s60, 0x100159874, undef, by)
																				st64(s128, 0, 1, 0)
																				st64(s28, s128, 0x10015f818)
																				st8(s28 + 0x18, 3)
																				st64(s28 + 0x10, 0x20)
																				st64(s48 + 0x10, 0)
																				st64(s48, 0)
																				if (ErrorCode_fmt(0x100159874, s48) != 0) {
																					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
																				}
																				copyr(s2f0, s128, 0x18)
																				copy(s308, s60, 0x18)
																				st64(s328 + 8, 0x100159f83)
																				st32(s2ad + 0x1d, 0x9c6 /* anchor::RequireKeysEqViolated */)
																				st8(s2e8 + 0x10, 2)
																				st32(s310, 0x25e)
																				st64(s318, 0x25)
																				st64(s328, 0)
																				const fh = fn_13e5a0(s7d0, s328)
																				const fj = ld64(s7d0 + 8)
																				const fi = ld64(s7d0)
																				copyr(s48, bu, 0x20)
																				const fk = fn_6a5a8(s308, ld64(s9a8 + 0x60), fh)
																				copyr(s328, s48, 0x20)
																				q = Error_with_pubkeys(s7e0, fi, fj, s328, fk)
																				br = ld64(s7e0 + 8)
																				bq = ld64(s7e0)
																				break B144
																			}
																			bv = ld64(s9a8 + 0x40) as u32
																			bz = bw
																			bx = ld64(s938 + 0x18)
																		} while (ld32(bu + 0x20) != bv)
																	}
																	st64(s9c8 + 0x10, bw)
																	st64(s9a8 + 0x18, bu)
																	q = fn_71ee0(s328, bu, ld64(s938 + 0x10), q)
																	st64(s9a8 + 0x38, 1)
																	br = ld64(s328 + 8)
																	bq = ld64(s328)
																	if (bq != 2) {
																		break B144
																	}
																} else {
																	q = fn_71ee0(s328, ld64(s9a8 + 0x18), ld64(s938 + 0x10), q)
																	st64(s9a8 + 0x38, 1)
																	br = ld64(s328 + 8)
																	bq = ld64(s328)
																	if (bq != 2) {
																		break B144
																	}
																}
															}
															const cf = memcpy(s108, br, 0xa8)
															let cd = ld64(s107 + 0x83)
															const cc = ld64(s107 + 0x7b)
															if ((ld64(s107 + 0x13) | ld64(s107 + 0x1b)) == 0 && (cc == 0 && cd == 0)) {
																ErrorCode_name(s60, 0x1001598b8)
																st64(s128, 0, 1, 0)
																st64(s28, s128, 0x10015f818)
																st8(s28 + 0x18, 3)
																st64(s28 + 0x10, 0x20)
																st64(s48 + 0x10, 0)
																st64(s48, 0)
																if (ErrorCode_fmt(0x1001598b8, s48) != 0) {
																	fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
																}
																copyr(s2f0, s128, 0x18)
																copy(s308, s60, 0x18)
																st64(s328 + 8, 0x100159f83)
																st32(s2ad + 0x1d, 0x9c5 /* anchor::RequireEqViolated */)
																st8(s2e8 + 0x10, 2)
																st32(s310, 0x26b)
																st64(s318, 0x25)
																st64(s328, 0)
																fn_13e5a0(s8c0, s328)
																q = fn_1c78(s8d0, ld64(s8c0), ld64(s8c0 + 8), 0)
																br = ld64(s8d0 + 8)
																bq = ld64(s8d0)
																break B144
															}
															st64(s9c8 + 0x18, cc)
															const ce = ld32(s108)
															st64(sff8, ld64(s918 + 0x10))
															st64(s1000, ld64(s9a8 + 0x48))
															q = fn_35ae8(s328, s510, ce, ld64(s938 + 0x10), ld64(s1000), ld64(sff8), cf)
															br = ld64(s318)
															bq = ld64(s328 + 8)
															const cg = ld64(s328)
															st64(s9a8 + 0x30, bq)
															st64(s9a8 + 0x68, br)
															if (cg != 0) {
																break B144
															}
															st64(s9f0, ld64(s4f0 + 0x30))
															st64(s9f0 + 8, ld64(s4f0 + 0x28))
															while (true) {
																if (ld8(s496) == 1) {
																	const dt = (ld32(s495 + 0xe) as i32) - (ld32(s4f0 + 0x54) as i32)
																	if ((dt as i32) != dt) {
																		fn_154788(0x100160290, dt as i32, bq, du, dv)
																	}
																	st32(s495 + 0x16, min((((dt as i32) ^ sar(dt as i32, 0x3f)) - sar(dt as i32, 0x3f)) * 0x2710 + ld32(s495 + 0x12), ld32(s495 + 0xa)))
																}
																q = fn_37228(s328, s510, bq, du, dv, q)
																br = ld64(s328 + 8)
																bq = ld64(s328)
																if (bq != 2) {
																	break B144
																}
																st64(s9a8 + 0x28, ld32(s328 + 8))
																q = fn_36ed8(s328, s510, ld64(s9a8 + 0x30), ld64(s9a8 + 0x68), ld64(s938 + 0x10))
																let dp = ld32(s318 + 4)
																if (dp == 2) {
																	bq = ld64(s328)
																	break
																}
																let cj = ld64(s328 + 8)
																const dw = ld64(s500 + 8)
																let cl = ld64(s328)
																const dx = ld64(s500)
																let dn = ld32(s310)
																st64(s9a8 + 0x20, ld8(s318))
																st64(s9a8, cl, cj)
																if ((dx ^ cl | dw ^ cj) != 0) {
																	st64(s9c8, dn, dp)
																	const eh = cd
																	const ec = ld64(s4f0 + 0x28)
																	const eb = ld64(s4f0 + 0x30)
																	const ea = ld64(s510)
																	const dy = ld64(s9a8 + 0x10)
																	st64(sfe8 + 0x20, dy)
																	st64(sfe8 + 0x18, ld64(s938 + 0x10))
																	const dz = ld64(s918 + 8)
																	st64(sfe8 + 0x10, dz)
																	st64(sfe8 + 8, ld64(s9a8 + 0x28))
																	st64(sff8, ec, eb, ea)
																	st64(s1000, ld64(s9a8 + 8))
																	q = fn_60198(s328, dx, dw, ld64(s9a8), ld64(s1000), ec, eb, ea, ld64(sfe8 + 8), dz, ld64(sfe8 + 0x18), dy)
																	const eg = ld64(s328 + 8)
																	if (ld64(s328) != 0) {
																		br = ld64(s318)
																		bq = eg
																		break B144
																	}
																	st64(s9e0 + 0x10, ld64(s318))
																	const ef = ld64(s308)
																	const ee = ld64(s310)
																	const ed = ld64(s308 + 8)
																	copyr(sfe8, s9e0, 0x10)
																	st64(s1000, ed, dz, dy)
																	q = fn_35270(s800, s510, ee, ef, ed, dz, dy, ld64(sfe8), ld64(sfe8 + 8))
																	bq = ld64(s800)
																	cl = eg
																	cj = ld64(s9e0 + 0x10)
																	cd = eh
																	dn = ld64(s9c8)
																	dp = ld64(s9c8 + 8)
																	if (bq != 2) {
																		br = ld64(s800 + 8)
																		break B144
																	}
																}
																const ch = ld64(s9c8 + 0x18)
																if (ch > ch + cd) {
																	st64(s9c8 + 8, dp)
																	q = fn_88360(s810, 0x26)
																	dp = ld64(s9c8 + 8)
																	br = ld64(s810 + 8)
																	bq = ld64(s810)
																	st64(s9c8, br)
																	if (bq != 2) {
																		break B144
																	}
																} else {
																	st64(s9c8, cd + ch)
																}
																B102: {
																	const ci = ld64(s4f0 + 0x40)
																	const ck = ld64(s4f0 + 0x38)
																	if ((ck ^ cl | ci ^ cj) == 0) {
																		const cw = cl
																		const co = ld64(s510)
																		st64(sfe8, ck, ci)
																		const cm = ld64(s9a8 + 0x10)
																		st64(sff0, cm)
																		st64(sff8, ld64(s9a8 + 0x28))
																		const cn = ld64(s918 + 8)
																		st64(s1000, cn)
																		q = fn_735f0(s328, s108, co, ld64(s938 + 0x10), cn, ld64(sff8), cm, ck, ci)
																		bq = ld64(s328 + 8)
																		if (ld64(s328) != 0) {
																			br = ld64(s318)
																			break B144
																		}
																		const cp = ld64(s318)
																		const cq = ld64(s310)
																		if ((cp | bq | cq) != 0) {
																			copyr(sfe8, s9e0, 0x10)
																			st64(s1000, cq, cn, cm)
																			q = fn_35270(s820, s510, bq, cp, cq, cn, cm, ld64(sfe8), ld64(sfe8 + 8))
																			bq = ld64(s820)
																			if (bq != 2) {
																				br = ld64(s820 + 8)
																				break B144
																			}
																		}
																		B91: {
																			const cs = ld64(s107 + 0x1b)
																			const cr = ld64(s107 + 0x13)
																			const cu = ld64(s107 + 0x83)
																			const ct = ld64(s107 + 0x7b)
																			if ((cr | cs) == 0 && (ct == 0 && cu == 0)) {
																				const cv = ld64(s9a8 + 0x18)
																				const cx = ld8(cv + 0x2784)
																				cl = cw
																				if (cx == 0) {
																					q = fn_88360(s830, 0x26)
																					br = ld64(s830 + 8)
																					bq = ld64(s830)
																					if (bq != 2) {
																						break B144
																					}
																					cy = ld8(ld64(s9a8 + 0x18) + 0x2784)
																				} else {
																					cy = cx - 1
																					st8(cv + 0x2784, cy)
																				}
																				if ((cy as u8) != 0) {
																					break B91
																				}
																				q = fn_6d670(s840, ld64(s9a8 + 0x60), ld64(s938), ld32(ld64(s9a8 + 0x18) + 0x20))
																				br = ld64(s840 + 8)
																				bq = ld64(s840)
																				if (bq == 2) {
																					break B91
																				}
																				break B144
																			}
																			cl = cw
																			if ((cr | cs) != 0 && (ct == 0 && cu == 0)) {
																				const cz = ld64(s9a8 + 0x60)
																				const da = ld8(cz + 0x17e)
																				const db = ld64(s938 + 0x10)
																				if (da != 1 && (da == 2 || db == 0)) {
																					dd = ld64(s4f0 + 8)
																					dc = ld64(s4f0)
																					df = ld64(cz + 0x115)
																					de = ld64(cz + 0x10d)
																				} else {
																					df = ld64(s4f0 + 8)
																					de = ld64(s4f0)
																					dd = ld64(cz + 0x125)
																					dc = ld64(cz + 0x11d)
																				}
																				st64(s1000, dc, dd, s710)
																				fn_72aa0(s850, s108, de, df, dc, dd, s710)
																				let dh = ld64(s850 + 8)
																				let dg = ld64(s850)
																				if (db != 0) {
																					const dq = dg | dh ^ 0x8000000000000000
																					if (dq == 0) {
																						fn_154838(0x10015fd58, dq, undef, dg, dh)
																					}
																					const dr = dg != 0
																					dg = -dg
																					dh = -(dh + dr)
																				}
																				q = fn_5b258(s328, ld64(s4f0 + 0x28), ld64(s4f0 + 0x30), dg, dh)
																				br = ld64(s318)
																				bq = ld64(s328 + 8)
																				const di = ld64(s328)
																				st64(s9f0, br, bq)
																				cl = cw
																				if (di != 0) {
																					break B144
																				}
																			}
																		}
																		st64(s9a8 + 0x28, ld16(ld64(s9a8 + 0x60) + 0xe3))
																		const dj = ld32(s108)
																		memcpy(s328, s108, 0xa8)
																		q = fn_71878(s860, ld64(s9a8 + 0x18), dj, ld64(s9a8 + 0x28), s328)
																		bq = ld64(s860)
																		if (bq != 2) {
																			br = ld64(s860 + 8)
																			break B144
																		}
																		cd = ld64(s107 + 0x83)
																		const dk = ld64(s107 + 0x7b)
																		st64(s9c8 + 0x18, dk)
																		const dl = dk | cd
																		const dm = ld64(s938 + 0x10)
																		dn = ld32(s4f0 + 0x4c)
																		if ((dl == 0) == dm) {
																			dn = (dn as i32) - 1
																			if ((dn as i32) != dn) {
																				fn_154788(0x10015fd70, dl, dm)
																			}
																		}
																	} else {
																		if ((ld64(s500) ^ cl | ld64(s500 + 8) ^ cj) == 0) {
																			break B102
																		}
																		if (dp != 1 || (cl ^ ld64(s9a8) | cj ^ ld64(s9a8 + 8)) != 0) {
																			q = fn_65410(s328, cl, cj)
																			br = ld64(s328 + 8)
																			dn = ld32(s328 + 8)
																			bq = ld64(s328)
																			if (bq != 2) {
																				break B144
																			}
																		}
																	}
																	st32(s4f0 + 0x48, dn)
																}
																st64(s500, cl, cj)
																q = fn_36b38(s870, s510, ld64(s938 + 0x10), ld64(s9a8 + 0x20) & 1, q)
																bo = ld64(s500 + 8)
																bn = ld64(s500)
																const ds = ld64(s510)
																if (ds != 0) {
																	bq = ld64(s9a8 + 0x68)
																	if ((bn ^ ld64(s9a8 + 0x30) | bo ^ bq) != 0) {
																		continue
																	}
																}
																let ei = ld64(s9c8 + 0x18)
																bq = cd
																if (ei > ei + cd) {
																	q = fn_88360(s880, 0x26)
																	ei = undef
																	br = ld64(s880 + 8)
																	bq = ld64(s880)
																	if (bq != 2) {
																		break B144
																	}
																} else {
																	br = bq + ld64(s9c8 + 0x18)
																}
																if (ds != 0 && (br != ld64(s9c8) && br != 0)) {
																	const fl = br
																	ErrorCode_name(s60, 0x1001598b8, bq, ei, dv)
																	st64(s128, 0, 1, 0)
																	st64(s28, s128, 0x10015f818)
																	st8(s28 + 0x18, 3)
																	st64(s28 + 0x10, 0x20)
																	st64(s48 + 0x10, 0)
																	st64(s48, 0)
																	if (ErrorCode_fmt(0x1001598b8, s48) != 0) {
																		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
																	}
																	copyr(s2f0, s128, 0x18)
																	copy(s308, s60, 0x18)
																	st64(s328 + 8, 0x100159f83)
																	st32(s2ad + 0x1d, 0x9c5 /* anchor::RequireEqViolated */)
																	st8(s2e8 + 0x10, 2)
																	st32(s310, 0x313)
																	st64(s318, 0x25)
																	st64(s328, 0)
																	fn_13e5a0(s890, s328)
																	q = fn_36a0(s8a0, ld64(s890), ld64(s890 + 8), fl)
																	br = ld64(s8a0 + 8)
																	bq = ld64(s8a0)
																	break B144
																}
																st64(s4f0 + 0x30, ld64(s9f0))
																st64(s4f0 + 0x28, ld64(s9f0 + 8))
																if (ds == 0) {
																	break B121
																}
																if ((bn ^ ld64(s9a8 + 0x48) | bo ^ ld64(s918 + 0x10)) != 0) {
																	continue L47
																}
																break B121
															}
														}
														br = ld64(s328 + 8)
													}
												}
												en = ld64(s9a8 + 0x58)
												st64(en + 0x10, br)
												st64(en + 8, bq)
												st64(en, 1)
												am = ld64(s9c8 + 0x10)
												st64(am, ld64(am) + 1)
												return q
											}
										}
									}
									const ek = ld32(ld64(s9a8 + 0x60) + 0x105)
									const ej = ld32(s4f0 + 0x48)
									const em = ld64(s938 + 0x10)
									st64(s918 + 0x10, ej)
									if (ej != ek) {
										fn_69990(ld64(s938 + 8), ld64(s918), ek)
									}
									const el = ld8(ld64(s9a8 + 0x60) + 0x17e)
									if (el == 2) {
										eo = 0
										fe = ld64(s9a8 + 0x58)
									} else {
										fe = ld64(s9a8 + 0x58)
										eo = el != 1 ? em : 1
									}
									st64(sff8, eo)
									st64(s1000, ld64(s918 + 8))
									q = fn_35900(s328, s510, ld64(s9a8 + 0x50), em, ld64(s1000), eo)
									const ep = ld64(s328 + 8)
									if (ld64(s328) != 0) {
										st64(fe + 0x10, ld64(s318))
										st64(fe + 8, ep)
										st64(fe, 1)
										am = ld64(s9c8 + 0x10)
										st64(am, ld64(am) + 1)
										return q
									}
									st64(s918, ep)
									st64(s938 + 0x18, ld64(s308))
									copyr(s938, s318, 0x10)
									st64(s918 + 8, ld64(s4f0 + 0x28))
									const ev = ld64(s4f0 + 0x30)
									const eu = ld64(s4f0 + 0x10)
									const et = ld64(s4f0 + 0x18)
									const es = ld64(s4f0 + 0x20)
									const er = ld64(s4f0)
									const eq = ld64(s4f0 + 8)
									st64(sff0, ev, eu, et, es, er, eq, em, s496)
									st64(sff8, ld64(s918 + 8))
									st64(s1000, bo)
									const ew = ld64(s9a8 + 0x60)
									q = fn_6f9d8(s8b0, ew, ld64(s918 + 0x10), bn, bo, ld64(sff8), ev, eu, et, es, er, eq, em, s496)
									const ex = ld64(s8b0)
									if (ex == 2) {
										const fc = ld64(ew + 0xfd)
										const fb = ld64(ew + 0xf5)
										const fa = ld64(ew + 0xed)
										const ez = ld64(ew + 0xe5)
										const ey = ld32(ew + 0x105)
										q = ld64(s9a8 + 0x58)
										copy(q + 0x30, s938, 0x10)
										st64(q + 0x40, ld64(s938 + 0x18))
										st32(q + 0x48, ey)
										st64(q + 0x18, ez, fa)
										st64(q + 8, fb, fc)
										st64(q + 0x28, ld64(s918))
										st64(q, 0)
										const fd = ld64(s9c8 + 0x10)
										st64(fd, ld64(fd) + 1)
										return q
									}
									const fg = ld64(s8b0 + 8)
									const ff = ld64(s9a8 + 0x58)
									st64(ff + 8, ex, fg)
									st64(ff, 1)
									am = ld64(s9c8 + 0x10)
									st64(am, ld64(am) + 1)
									return q
								}
								fn_85138(s48, 0x1001598d4)
								st64(s108, 0, 1, 0)
								st64(s4f0, s108, 0x10015f818)
								st8(s4f0 + 0x18, 3)
								st64(s4f0 + 0x10, 0x20)
								st64(s500, 0)
								st64(s510, 0)
								if (fn_88558(0x1001598d4, s510) != 0) {
									fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
								}
								copyr(s2f0, s108, 0x18)
								copy(s308, s48, 0x18)
								st64(s328 + 8, 0x100159f83)
								st32(s2ad + 0x1d, 0x1788 /* error::InvalidFirstTickArrayAccount */)
								st8(s2e8 + 0x10, 2)
								st32(s310, 0x22a)
								st64(s318, 0x25)
								st64(s328, 0)
								fn_13e5a0(s7a0, s328)
								q = fn_3158(s7b0, ld64(s7a0), ld64(s7a0 + 8), ld32(ao + 0x20), ld64(s9a8 + 0x40))
								bh = ld64(s7b0)
								bg = ld64(s9a8 + 0x58)
								st64(bg + 0x10, ld64(s7b0 + 8))
								st64(bg + 8, bh)
								st64(bg, 1)
								st64(am, ld64(am) + 1)
								return q
							}
							const ba = am
							ErrorCode_name(s48, 0x100159874)
							st64(s108, 0, 1, 0)
							st64(s4f0, s108, 0x10015f818)
							st8(s4f0 + 0x18, 3)
							st64(s4f0 + 0x10, 0x20)
							st64(s500, 0)
							st64(s510, 0)
							if (ErrorCode_fmt(0x100159874, s510) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
							}
							copyr(s2f0, s108, 0x18)
							copy(s308, s48, 0x18)
							st64(s328 + 8, 0x100159f83)
							st32(s2ad + 0x1d, 0x9c6 /* anchor::RequireKeysEqViolated */)
							st8(s2e8 + 0x10, 2)
							st32(s310, 0x228)
							st64(s318, 0x25)
							st64(s328, 0)
							const au = fn_13e5a0(s780, s328)
							const aw = ld64(s780 + 8)
							const av = ld64(s780)
							copyr(s510, ao, 0x20)
							const ax = fn_6a5a8(s308, ld64(s9a8 + 0x60), au)
							copyr(s328, s510, 0x20)
							q = Error_with_pubkeys(s790, av, aw, s328, ax)
							const az = ld64(s790)
							const ay = ld64(s9a8 + 0x58)
							st64(ay + 0x10, ld64(s790 + 8))
							st64(ay + 8, az)
							st64(ay, 1)
							st64(ba, ld64(ba) + 1)
							return q
						}
						at = ld64(s9a8 + 0x58)
						st64(at + 0x10, ld64(s328 + 8))
						st64(at + 8, ad)
						st64(at, 1)
						return q
					}
					ErrorCode_name(s48, 0x100159874)
					st64(s108, 0, 1, 0)
					st64(s4f0, s108, 0x10015f818)
					st8(s4f0 + 0x18, 3)
					st64(s4f0 + 0x10, 0x20)
					st64(s500, 0)
					st64(s510, 0)
					if (ErrorCode_fmt(0x100159874, s510) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
					}
					copyr(s2f0, s108, 0x18)
					copy(s308, s48, 0x18)
					st64(s328 + 8, 0x100159f83)
					st32(s2ad + 0x1d, 0x9c6 /* anchor::RequireKeysEqViolated */)
					st8(s2e8 + 0x10, 2)
					st32(s310, 0x212)
					st64(s318, 0x25)
					st64(s328, 0)
					const aa = fn_13e5a0(s740, s328)
					st64(s918 + 0x10, ld64(s740 + 8))
					const ab = ld64(s740)
					copyr(s128, w + 0xb, 0x20)
					let z = 1
					const x = ld64(s9a8 + 0x60)
					const y = ld16(x + 0x17f)
					if (y != 0) {
						z = ld64(s9a8 + 0x38)
					}
					st64(s2e8 + 0x10, x)
					st64(s308 + 0x10, t + 0x61)
					st64(s308, t + 0x41)
					st64(s318, ld64(s9a8 + 0x40))
					st64(s328, 0x10015984c)
					st64(s2e8, z, (y != 0) << 1)
					st64(s2e8 + 0x18, 1)
					st64(s2f0, 0x20)
					st64(s308 + 8, 0x20)
					st64(s310, 0x20)
					st64(s328 + 8, 4)
					st64(s48, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
					// PDA create_program_address(["pool", *(ld64(s9a8 + 0x40)), *(t + 0x41), *(t + 0x61), z[..(y != 0) << 1], x[..1]], program *s48)
					const ac = Pubkey_create_program_address(s108, s328, 6, s48, aa)
					if (ld8(s108) != 1) {
						copyr(s4f0, s107, 0x20)
						copy(s510, s128, 0x20)
						q = Error_with_pubkeys(s750, ab, ld64(s918 + 0x10), s510, ac)
						ad = ld64(s750)
						at = ld64(s9a8 + 0x58)
						st64(at + 0x10, ld64(s750 + 8))
						st64(at + 8, ad)
						st64(at, 1)
						return q
					}
					st8(s510, ld8(s107))
					fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s510, 0x100160228, 0x100160248)
				}
				st8(s48, ld8(s50f))
				fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s48, 0x100160228, 0x100160248)
			}
			fn_85138(s108, 0x1001598d8)
			st64(s510, 0, 1, 0)
			st64(s6f0, s510, 0x10015f818)
			st8(s6f0 + 0x18, 3)
			st64(s6f0 + 0x10, 0x20)
			st64(s709 + 9, 0)
			st64(s710, 0)
			if (fn_88558(0x1001598d8, s710) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(s2f0, s510, 0x18)
			copy(s308, s108, 0x18)
			st64(s328 + 8, 0x100159f83)
			st32(s2ad + 0x1d, 0x177b /* error::SqrtPriceLimitOverflow */)
			st8(s2e8 + 0x10, 2)
			st32(s310, 0x205)
			st64(s318, 0x25)
			st64(s328, 0)
			q = fn_13e5a0(s730, s328)
			p = ld64(s730)
			st64(a + 0x10, ld64(s730 + 8))
			st64(a + 8, p)
			st64(a, 1)
			return q
		}
		fn_85138(s108, 0x10015982c)
		st64(s510, 0, 1, 0)
		st64(s6f0, s510, 0x10015f818)
		st8(s6f0 + 0x18, 3)
		st64(s6f0 + 0x10, 0x20)
		st64(s709 + 9, 0)
		st64(s710, 0)
		if (fn_88558(0x10015982c, s710) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(s2f0, s510, 0x18)
		copy(s308, s108, 0x18)
		st64(s328 + 8, 0x100159f83)
		st32(s2ad + 0x1d, 0x1770 /* error::NotApproved */)
		st8(s2e8 + 0x10, 2)
		st32(s310, 0x203)
		st64(s318, 0x25)
		st64(s328, 0)
		q = fn_13e5a0(s720, s328)
		p = ld64(s720)
		st64(a + 0x10, ld64(s720 + 8))
		st64(a + 8, p)
		st64(a, 1)
		return q
	}
	fn_85138(s108, 0x100159888)
	st64(s510, 0, 1, 0)
	st64(s6f0, s510, 0x10015f818)
	st8(s6f0 + 0x18, 3)
	st64(s6f0 + 0x10, 0x20)
	st64(s709 + 9, 0)
	st64(s710, 0)
	if (fn_88558(0x100159888, s710) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(s2f0, s510, 0x18)
	copy(s308, s108, 0x18)
	st64(s328 + 8, 0x100159f83)
	st32(s2ad + 0x1d, 0x1784 /* error::ZeroAmountSpecified */)
	st8(s2e8 + 0x10, 2)
	st32(s310, 0x201)
	st64(s318, 0x25)
	st64(s328, 0)
	q = fn_13e5a0(s900, s328)
	p = ld64(s900)
	st64(a + 0x10, ld64(s900 + 8))
	st64(a + 8, p)
	st64(a, 1)
	return q
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: p5 (value), p6 (value), p7 (value), p8 (value)
// types [heur]: b: SwapV2Accounts (1 of 2 calls pass one, the others an untyped value: fn_414a8); c: AccountInfo (1 of 2 calls pass one, the others an untyped value: fn_414a8)
export function fn_3e038(a: u64, b: SwapV2Accounts, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s40 = fp - 0x40, s47 = fp - 0x47, s48 = fp - 0x48, s78 = fp - 0x78, sb0 = fp - 0xb0, sd0 = fp - 0xd0, sf0 = fp - 0xf0, s110 = fp - 0x110, s118 = fp - 0x118, s130 = fp - 0x130, s150 = fp - 0x150, s170 = fp - 0x170, s188 = fp - 0x188, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s3b8 = fp - 0x3b8, s408 = fp - 0x408, s430 = fp - 0x430, s440 = fp - 0x440, s448 = fp - 0x448, s458 = fp - 0x458, s460 = fp - 0x460, s468 = fp - 0x468, s470 = fp - 0x470, s478 = fp - 0x478, s480 = fp - 0x480, sfe0 = fp - 0xfe0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let s, t, w, x, ar, av, aw, bf, cf, cl, co, cw, cx, dg, dh, dj, dk, dl, ea, eb, ec, ed: u64
	st64(s3b8 + 0x30, c)
	clock_get(s150)
	if (ld64(s150) != 0) {
		const l = ld64(s150 + 8)
		const k = ld64(s150 + 0x10)
		st64(s150 + 0x10, ld64(s150 + 0x18))
		st64(s150, l, k)
		w = fn_13e628(s380, s150)
		const m = ld64(s380)
		st64(a + 8, ld64(s380 + 8))
		st64(a, m)
		return w
	}
	st64(s3b8, p7, p6)
	const h = p8
	st64(s3b8 + 0x20, p5)
	st64(s3b8 + 0x18, ld64(s130 + 8))
	const f = ld64(b + 0x20)
	st64(s408 + 0x40, f)
	st64(s408 + 0x28, ld64(f + 0x68))
	const g = ld64(b + 0x18)
	st64(s408 + 0x38, g)
	st64(s408 + 0x30, ld64(g + 0x68))
	st64(s3b8 + 0x28, a)
	st64(s408 + 0x48, h)
	st64(s3b8 + 0x10, d)
	if (h != 0) {
		const n = ld64(0x300000000 /* heap bump-allocator cursor */)
		const o = n != 0 ? sat_sub(n, 0x80) & -8 : 0x300007f80
		if (0x300000007 >= o) {
			alloc_handle_alloc_error(8, 0x80)
		}
		const input_vault_mint: Mint = b.input_vault_mint
		st64(0x300000000 /* heap bump-allocator cursor */, o)
		const ab: AccountInfo = input_vault_mint.info
		memcpy(o, input_vault_mint, 0x58)
		st64(o + 0x58, ab)
		copy(o + 0x60, input_vault_mint + 0x60, 0x20)
		const ac = ld64(s3b8 + 0x20)
		w = fn_7da68(s150, o, ac)
		t = ld64(s150 + 8)
		s = ld64(s150)
		if (s != 2) {
			cf = ld64(s3b8 + 0x28)
			st64(cf + 8, t)
			st64(cf, s)
			return w
		}
		x = ld64(s3b8 + 0x28)
		if (t > ac) {
			fn_154788(0x10015fdd0)
		}
		st64(s408 + 0x20, ac - t)
	} else {
		const i = ld64(0x300000000 /* heap bump-allocator cursor */)
		const j = i != 0 ? sat_sub(i, 0x80) & -8 : 0x300007f80
		if (0x300000007 >= j) {
			alloc_handle_alloc_error(8, 0x80)
		}
		const output_vault_mint: Mint = b.output_vault_mint
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		const q: AccountInfo = output_vault_mint.info
		memcpy(j, output_vault_mint, 0x58)
		st64(j + 0x58, q)
		copy(j + 0x60, output_vault_mint + 0x60, 0x20)
		const r = ld64(s3b8 + 0x20)
		w = fn_7d178(s150, j, r)
		t = ld64(s150 + 8)
		s = ld64(s150)
		if (s != 2) {
			cf = ld64(s3b8 + 0x28)
			st64(cf + 8, t)
			st64(cf, s)
			return w
		}
		const u = r + t
		x = ld64(s3b8 + 0x28)
		st64(s408 + 0x20, u)
		if (r > u) {
			fn_154730(0x10015fdb8, u)
		}
	}
	const v = ld64(b + 0x10)
	w = fn_4dc0(s150, v, w)
	const y = ld64(s150 + 0x10)
	const z = ld64(s150 + 8)
	if (ld64(s150) != 0) {
		st64(x + 8, y)
		st64(x, z)
		return w
	}
	const ad = ld64(z + 0xfd)
	st64(s408 + 8, ad)
	st64(s408, ld64(z + 0xf5))
	st64(y, ld64(y) - 1)
	st64(s408 + 0x10, v)
	w = fn_53e8(s150, v, ad, undef, undef, w)
	const ae = ld64(s150 + 0x10)
	const af = ld64(s150 + 8)
	if (ld64(s150) != 0) {
		st64(x + 8, ae)
		st64(x, af)
		return w
	}
	st64(s430 + 0x18, ae)
	st64(s1a0, af, ae)
	const ag = ld64(b + 0x28)
	st64(s408 + 0x18, af)
	st64(s430 + 0x20, af + 0x41)
	const ah = memcmp(ag + 0x28, af + 0x41, 0x20)
	const ak = (ah as u32) == 0
	const ai = ld64(s408 + 0x18)
	const aj = ld64(s3b8 + 0x18)
	if (aj > ld64(ai + 0x430)) {
		B24: {
			st64(s430, ak, ah)
			if ((ah as u32) == 0) {
				const ao = ld64(ld64(ag + 0x20))
				copyr(s150, ao, 0x20)
				if ((memcmp(s150, ai + 0x81, 0x20) as u32) != 0) {
					break B24
				}
				const output_vault_2: TokenAccount = b.output_vault
				st64(s468, output_vault_2)
				const aq = output_vault_2.info.key
				copyr(s150, aq, 0x20)
				ar = ld64(s408 + 0x18) + 0xa1
			} else {
				const al = ld64(ld64(ag + 0x20))
				copyr(s150, al, 0x20)
				if ((memcmp(s150, ai + 0xa1, 0x20) as u32) != 0) {
					break B24
				}
				const output_vault: TokenAccount = b.output_vault
				st64(s468, output_vault)
				const an = output_vault.info.key
				copyr(s150, an, 0x20)
				ar = ld64(s408 + 0x18) + 0x81
			}
			const at = memcmp(s150, ar, 0x20)
			let bg = undef
			let ay = undef
			let bh = undef
			let bi = undef
			let au = at as u32
			if (au == 0) {
				st64(s478, ag)
				st64(s448, 0)
				st64(s190, 0, 8, 0, 0)
				let bd = ld64(s3b8 + 0x30)
				if (ld64(s3b8 + 0x10) != 0) {
					st64(s440, 8, 0)
					st64(s460, s47)
					st64(s3b8 + 0x10, ld64(s3b8 + 0x10) * 0x30)
					const ax = ld64(s408 + 0x18)
					st64(s458 + 8, ax + 1)
					ay = ax + 0x61
					st64(s458, ay)
					st64(s470, ax + 0x17f)
					st64(s3b8 + 0x18, 0)
					st64(s430 + 0x10, 0)
					st64(s448, 0)
					do {
						if (fn_147a98(bd, bg, ay, bh, bi) == 0x2800) {
							st64(s3b8 + 0x30, bd)
							au = fn_84be0(s150, bd)
							bi = ld64(s150 + 0x10)
							const bl = ld64(s150 + 8)
							if (ld64(s150) != 0) {
								st64(x + 8, bi)
								st64(x, bl)
								w = fn_f680(s190, au)
								aw = ld64(s1a0 + 8)
								st64(aw, ld64(aw) + 1)
								return w
							}
							ay = ld64(s3b8 + 0x18)
							let bj = ld64(s430 + 0x10)
							if (bj == ay) {
								st64(s3b8 + 0x18, bi)
								au = fn_14b50(s190, 0x10015fde8)
								bi = ld64(s3b8 + 0x18)
								copy(s440, s188, 0x10)
								ay = ld64(s190)
								bj = ld64(s188 + 0x10)
							}
							const bk = ld64(s440 + 8) + bj
							st64(s3b8 + 0x18, ay)
							bg = ld64(s440) + (bk - (ay > bk ? 0 : ay) << 4)
							st64(bg + 8, bi)
							st64(bg, bl)
							bh = bj + 1
							st64(s430 + 0x10, bh)
							st64(s188 + 0x10, bh)
							bd = ld64(s3b8 + 0x30)
						} else {
							au = fn_147a98(bd)
							ay = undef
							bh = undef
							bi = undef
							if (au != 0x728) {
								break
							}
							const az = ld64(s408 + 0x18)
							const ba = ld16(az + 0x17f)
							let bb = 1
							if (ba != 0) {
								bb = ld64(s470)
							}
							st64(s110 + 0x10, az)
							st64(s130 + 0x10, ld64(s458))
							st64(s130, ld64(s430 + 0x20))
							st64(s150 + 0x10, ld64(s458 + 8))
							st64(s150, 0x10015984c)
							st64(s110, bb, (ba != 0) << 1)
							st64(s110 + 0x18, 1)
							st64(s118, 0x20)
							st64(s130 + 8, 0x20)
							st64(s150 + 0x18, 0x20)
							st64(s150 + 8, 4)
							st64(s78, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
							// PDA create_program_address(["pool", *(ld64(s458 + 8)), *(ld64(s430 + 0x20)), *(ld64(s458)), bb[..(ba != 0) << 1], az[..1]], program *s78)
							Pubkey_create_program_address(s48, s150, 6, s78, au)
							if (ld8(s48) == 1) {
								st8(s170, ld8(s47))
								fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s170, 0x100160228, 0x100160248)
							}
							const bc = ld64(s460)
							copyr(s170, bc, 0x20)
							au = fn_76320(s1e0, bd, s170)
							bg = undef
							ay = undef
							bh = undef
							bi = undef
							const be = ld64(s1e0)
							st64(s448, bd)
							if (be != 2) {
								const ci = ld64(s1e0 + 8)
								st64(x, be, ci)
								w = fn_f680(s190, au)
								aw = ld64(s1a0 + 8)
								st64(aw, ld64(aw) + 1)
								return w
							}
						}
						bd = bd + 0x30
						bf = ld64(s3b8 + 0x10)
						st64(s3b8 + 0x10, bf - 0x30)
					} while (bf != 0x30)
				}
				const bp = ld64(b + 8)
				au = fn_4fa8(s48, b.observation_state, ay, bh, bi, au)
				const bm = ld64(s40 + 8)
				const bn: ObservationStateData = ld64(s40)
				if (ld64(s48) != 0) {
					st64(x + 8, bm)
					st64(x, bn)
					w = fn_f680(s190, au)
					aw = ld64(s1a0 + 8)
					st64(aw, ld64(aw) + 1)
					return w
				}
				const bo = ld64(s430 + 8)
				let bs = (bo as u32) != 0 ? 0x845c1aa94e69579a : 0x100013b51
				st64(s3b8 + 0x30, bp)
				const bq = ld64(s3b8 + 8)
				const br = ld64(s3b8)
				if ((bq | br) != 0) {
					bs = ld64(s3b8 + 8)
				}
				let bt = (bo as u32) != 0 ? 0xfffec4b1 : 0
				if ((bq | br) != 0) {
					bt = ld64(s3b8)
				}
				st64(s3b8 + 0x10, bs)
				st64(s78, bn, bm)
				st64(s3b8 + 0x18, bm)
				st64(sfe0 + 0x18, fn_69b78())
				st64(sfe0 + 0x10, ld64(s408 + 0x48))
				st64(sfe0, bt, (bo as u32) == 0)
				st64(sff8 + 0x10, ld64(s3b8 + 0x10))
				st64(sff8 + 8, ld64(s408 + 0x20))
				st64(sff8, ld64(s448))
				st64(s1000, s78)
				au = fn_374d0(s150, ld64(s3b8 + 0x30) + 8, s1a0, s190, s78, ld64(sff8), ld64(sff8 + 8), ld64(sff8 + 0x10), bt, (bo as u32) == 0, ld64(sfe0 + 0x10), ld64(sfe0 + 0x18))
				const ca = ld64(s150 + 8)
				if (ld64(s150) != 0) {
					const cg = ld64(s3b8 + 0x28)
					st64(cg + 8, ld64(s150 + 0x10))
					st64(cg, ca)
					const ch = ld64(s3b8 + 0x18)
					st64(ch, ld64(ch) + 1)
					w = fn_f680(s190, au)
					aw = ld64(s1a0 + 8)
					st64(aw, ld64(aw) + 1)
					return w
				}
				st64(s3b8 + 0x10, ld64(s130))
				st64(s408 + 0x18, ld64(s150 + 0x18))
				const by = ld32(s110 + 8)
				st64(s430 + 0x20, ld64(s110))
				const bx = ld64(s118)
				const bw = ld64(s130 + 0x10)
				const bv = ld64(s130 + 8)
				const bz = ld64(s150 + 0x10)
				const bu = ld64(s3b8 + 0x18)
				st64(bu, ld64(bu) + 1)
				st64(s3b8 + 0x30, bv)
				if (bv != 0 && bw != 0) {
					st64(s3b8 + 0x18, bw)
					st64(s458, bx, by)
					st64(s448, ca, bz)
					fn_f680(s190, by)
					const cb = ld64(s430 + 0x18)
					st64(cb, ld64(cb) + 1)
					if ((ld64(s430 + 8) as u32) == 0) {
						B62: {
							st64(s440 + 8, fn_161d8(ld64(s408 + 0x38)))
							cl = fn_161d8(ld64(s408 + 0x40))
							st64(s480, fn_161d8(ld64(s478)))
							st64(s460, fn_161d8(ld64(s468)))
							st64(s430 + 0x10, fn_16330(b.input_vault_mint))
							st64(s430 + 0x18, fn_16330(b.output_vault_mint))
							if (ld64(s3b8 + 0x30) == ld64(s408 + 0x20)) {
								co = t
								if (ld64(s408 + 0x48) != 0) {
									break B62
								}
							}
							const cr = fn_16330(ld64(s430 + 0x10))
							w = fn_7d178(s150, cr, ld64(s3b8 + 0x30))
							co = ld64(s150 + 8)
							s = ld64(s150)
							if (s != 2) {
								cf = ld64(s3b8 + 0x28)
								st64(cf + 8, co)
								st64(cf, s)
								return w
							}
						}
						st64(s470, cl)
						const cm = fn_16330(ld64(s430 + 0x18))
						const cn = ld64(s3b8 + 0x18)
						w = fn_7da68(s150, cm, cn)
						t = ld64(s150 + 8)
						s = ld64(s150)
						if (s != 2) {
							cf = ld64(s3b8 + 0x28)
							st64(cf + 8, t)
							st64(cf, s)
							return w
						}
						if (t > cn) {
							w = fn_88360(s360, 0x26)
							dl = ld64(s360)
							dj = ld64(s3b8 + 0x28)
							st64(dj + 8, ld64(s360 + 8))
							st64(dj, dl)
							return w
						}
						const cp = ld64(s3b8 + 0x30)
						const cq = ld64(s3b8 + 0x18)
						cw = cq - t
						cx = ld64(s3b8 + 0x30)
						st64(s3b8 + 0x30, co + cp)
						st64(s468, cq)
						if (cp > co + cp) {
							w = fn_88360(s350, 0x26)
							dl = ld64(s350)
							dj = ld64(s3b8 + 0x28)
							st64(dj + 8, ld64(s350 + 8))
							st64(dj, dl)
							return w
						}
					} else {
						st64(s440 + 8, fn_161d8(ld64(s408 + 0x40)))
						st64(s470, fn_161d8(ld64(s408 + 0x38)))
						st64(s480, fn_161d8(ld64(s468)))
						st64(s460, fn_161d8(ld64(s478)))
						const cc = fn_16330(b.output_vault_mint)
						st64(s430 + 0x18, fn_16330(b.input_vault_mint))
						st64(s430 + 0x10, cc)
						const cd = fn_16330(cc)
						w = fn_7da68(s150, cd, ld64(s3b8 + 0x30))
						co = ld64(s150 + 8)
						s = ld64(s150)
						if (s != 2) {
							cf = ld64(s3b8 + 0x28)
							st64(cf + 8, co)
							st64(cf, s)
							return w
						}
						const ce = ld64(s3b8 + 0x18)
						if (ce != ld64(s408 + 0x20) || ld64(s408 + 0x48) == 0) {
							w = fn_7d178(s150, fn_16330(ld64(s430 + 0x18)), ce)
							t = ld64(s150 + 8)
							s = ld64(s150)
							if (s != 2) {
								cf = ld64(s3b8 + 0x28)
								st64(cf + 8, t)
								st64(cf, s)
								return w
							}
						}
						if (co > ld64(s3b8 + 0x30)) {
							w = fn_88360(s200, 0x26)
							dl = ld64(s200)
							dj = ld64(s3b8 + 0x28)
							st64(dj + 8, ld64(s200 + 8))
							st64(dj, dl)
							return w
						}
						st64(s468, t + ce)
						cx = ld64(s3b8 + 0x30) - co
						cw = ld64(s3b8 + 0x18)
						if (ce > t + ce) {
							w = fn_88360(s1f0, 0x26)
							dl = ld64(s1f0)
							dj = ld64(s3b8 + 0x28)
							st64(dj + 8, ld64(s1f0 + 8))
							st64(dj, dl)
							return w
						}
					}
					st64(s3b8 + 0x18, b + 0x10)
					const cs = ld64(ld64(s408 + 0x10))
					copyr(s150, cs, 0x20)
					const ct = ld64(ld64(b))
					copyr(s130, ct, 0x20)
					const cu = ld64(ld64(ld64(s440 + 8) + 0x20))
					copyr(s110, cu, 0x20)
					const cv = ld64(ld64(ld64(s470) + 0x20))
					const db = ld64(cv)
					const da = ld64(cv + 8)
					const cz = ld64(cv + 0x10)
					const cy = ld64(cv + 0x18)
					st64(sb0 + 0x28, ld64(s430 + 0x20))
					st64(sb0 + 0x20, ld64(s458))
					st32(sb0 + 0x30, ld64(s458 + 8))
					st8(sb0 + 0x34, ld64(s430))
					st64(sd0, cx, co, cw, t)
					copy(sb0, s448, 0x10)
					st64(sb0 + 0x10, ld64(s408 + 0x18))
					st64(sb0 + 0x18, ld64(s3b8 + 0x10))
					st64(sf0, db, da, cz, cy)
					fn_10fd98(s48, s150)
					copyr(s78, s40, 0x10)
					log_data(s78, 1)
					if ((ld64(s430 + 8) as u32) == 0) {
						AccountInfo_clone_f338(s78, ld64(ld64(s440 + 8) + 0x20))
						const dm = ld64(ld64(s480) + 0x20)
						st64(s3b8 + 0x10, s48)
						AccountInfo_clone_f338(s48, dm)
						const dp = ld64(b + 0x40)
						const dn = ld64(b + 0x48)
						st64(s408 + 0x18, dn)
						const dq = AccountInfo_clone_f338(s150, dn)
						st64(sff8 + 0x10, ld64(s3b8 + 0x30))
						st64(sff8 + 8, s150)
						st64(s1000, ld64(s430 + 0x10))
						st64(s408 + 0x10, dp)
						st64(sff8, dp)
						dh = fn_79050(s230, b, s78, ld64(s3b8 + 0x10), ld64(s1000), dp, s150, ld64(sff8 + 0x10), dq, s78)
						dg = ld64(s230)
						if (dg != 2) {
							eb = ld64(s230 + 8)
							ea = ld64(s3b8 + 0x28)
							st64(ea, dg, eb)
							return ptr_drop_in_place_fcd8(s78, ptr_drop_in_place_fcd8(s48, dh))
						}
						ptr_drop_in_place_fcd8(s78, ptr_drop_in_place_fcd8(s48, dh))
						AccountInfo_clone_f338(s78, ld64(ld64(s460) + 0x20))
						AccountInfo_clone_f338(s48, ld64(ld64(s470) + 0x20))
						const dr = AccountInfo_clone_f338(s150, ld64(s408 + 0x18))
						st64(sff8 + 0x10, ld64(s468))
						st64(sff8 + 8, s150)
						st64(sff8, ld64(s408 + 0x10))
						st64(s1000, ld64(s430 + 0x18))
						dh = fn_7a038(s240, ld64(s3b8 + 0x18), s78, s48, ld64(s1000), ld64(sff8), s150, ld64(sff8 + 0x10), dr)
						dg = ld64(s240)
						if (dg != 2) {
							eb = ld64(s240 + 8)
							ea = ld64(s3b8 + 0x28)
							st64(ea, dg, eb)
							return ptr_drop_in_place_fcd8(s78, ptr_drop_in_place_fcd8(s48, dh))
						}
					} else {
						const dc = ld64(ld64(s470) + 0x20)
						st64(s3b8 + 0x10, s78)
						AccountInfo_clone_f338(s78, dc)
						AccountInfo_clone_f338(s48, ld64(ld64(s460) + 0x20))
						const de = ld64(b + 0x40)
						const dd = ld64(b + 0x48)
						st64(s408 + 0x10, dd)
						const df = AccountInfo_clone_f338(s150, dd)
						st64(sff8 + 0x10, ld64(s468))
						st64(sff8 + 8, s150)
						st64(s1000, ld64(s430 + 0x18))
						st64(s408 + 0x18, de)
						st64(sff8, de)
						dh = fn_79050(s210, b, ld64(s3b8 + 0x10), s48, ld64(s1000), de, s150, ld64(sff8 + 0x10), df, s48)
						dg = ld64(s210)
						if (dg != 2) {
							eb = ld64(s210 + 8)
							ea = ld64(s3b8 + 0x28)
							st64(ea, dg, eb)
							return ptr_drop_in_place_fcd8(s78, ptr_drop_in_place_fcd8(s48, dh))
						}
						ptr_drop_in_place_fcd8(s78, ptr_drop_in_place_fcd8(s48, dh))
						AccountInfo_clone_f338(s78, ld64(ld64(s480) + 0x20))
						AccountInfo_clone_f338(s48, ld64(ld64(s440 + 8) + 0x20))
						const di = AccountInfo_clone_f338(s150, ld64(s408 + 0x10))
						st64(sff8 + 0x10, ld64(s3b8 + 0x30))
						st64(sff8 + 8, s150)
						st64(sff8, ld64(s408 + 0x18))
						st64(s1000, ld64(s430 + 0x10))
						dh = fn_7a038(s220, ld64(s3b8 + 0x18), s78, s48, ld64(s1000), ld64(sff8), s150, ld64(sff8 + 0x10), di)
						dg = ld64(s220)
						if (dg != 2) {
							eb = ld64(s220 + 8)
							ea = ld64(s3b8 + 0x28)
							st64(ea, dg, eb)
							return ptr_drop_in_place_fcd8(s78, ptr_drop_in_place_fcd8(s48, dh))
						}
					}
					const ds = ptr_drop_in_place_fcd8(s78, ptr_drop_in_place_fcd8(s48, dh))
					w = fn_bad8(s250, ld64(s408 + 0x40) + 0x20, ds)
					let dt = ld64(s250)
					if (dt == 2) {
						w = fn_bad8(s260, ld64(s408 + 0x38) + 0x20, w)
						dt = ld64(s260)
						if (dt == 2) {
							B100: {
								B104: {
									if ((ld64(s430 + 8) as u32) == 0) {
										let eh = ld64(s448) > ld64(s408)
										const eg = ld64(s440) > ld64(s408 + 8)
										const ee = ld64(s408 + 8)
										const ef = ld64(s440)
										eh = ee != ef ? eg : eh
										if ((eh & 1) != 0) {
											ErrorCode_name(s170, 0x100159858, ee, ef)
											st64(s78, 0, 1, 0)
											st64(s28, s78, 0x10015f818)
											st8(s28 + 0x18, 3)
											st64(s28 + 0x10, 0x20)
											st64(s40 + 8, 0)
											st64(s48, 0)
											if (ErrorCode_fmt(0x100159858, s48) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copyr(s118, s78, 0x18)
											copy(s130, s170, 0x18)
											st64(s150 + 8, 0x100159ffe)
											st32(sd0 + 0x18, 0x9ca /* anchor::RequireGteViolated */)
											st8(s110 + 0x10, 2)
											st32(s150 + 0x18, 0x13b)
											st64(s150 + 0x10, 0x28)
											st64(s150, 0)
											fn_13e5a0(s330, s150)
											const ej = ld64(s330 + 8)
											const ei = ld64(s330)
											copyr(sff8, s448, 0x10)
											st64(s1000, ld64(s408 + 8))
											w = fn_2be8(s340, ei, ej, ld64(s408), ld64(s1000), ld64(sff8), ld64(sff8 + 8))
											dl = ld64(s340)
											dj = ld64(s3b8 + 0x28)
											st64(dj + 8, ld64(s340 + 8))
											st64(dj, dl)
											return w
										}
										if ((ld64(s3b8 + 8) | ld64(s3b8)) == 0) {
											if (ld64(s408 + 0x48) != 0) {
												if (ld64(s3b8 + 0x30) == ld64(s3b8 + 0x20)) {
													break B100
												}
												ErrorCode_name(s170, 0x1001598b8, ee, ef)
												st64(s78, 0, 1, 0)
												st64(s28, s78, 0x10015f818)
												st8(s28 + 0x18, 3)
												st64(s28 + 0x10, 0x20)
												st64(s40 + 8, 0)
												st64(s48, 0)
												if (ErrorCode_fmt(0x1001598b8, s48) != 0) {
													fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
												}
												copyr(s118, s78, 0x18)
												copy(s130, s170, 0x18)
												st64(s150 + 8, 0x100159ffe)
												st32(sd0 + 0x18, 0x9c5 /* anchor::RequireEqViolated */)
												st8(s110 + 0x10, 2)
												st32(s150 + 0x18, 0x143)
												st64(s150 + 0x10, 0x28)
												st64(s150, 0)
												fn_13e5a0(s300, s150)
												w = fn_1730(s310, ld64(s300), ld64(s300 + 8), ld64(s3b8 + 0x20), ld64(s3b8 + 0x30))
												dl = ld64(s310)
												dj = ld64(s3b8 + 0x28)
												st64(dj + 8, ld64(s310 + 8))
												st64(dj, dl)
												return w
											}
											if (ld64(s408 + 0x20) == ld64(s468)) {
												break B104
											}
											ErrorCode_name(s170, 0x1001598b8, ee, ef)
											st64(s78, 0, 1, 0)
											st64(s28, s78, 0x10015f818)
											st8(s28 + 0x18, 3)
											st64(s28 + 0x10, 0x20)
											st64(s40 + 8, 0)
											st64(s48, 0)
											if (ErrorCode_fmt(0x1001598b8, s48) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copyr(s118, s78, 0x18)
											copy(s130, s170, 0x18)
											st64(s150 + 8, 0x100159ffe)
											st32(sd0 + 0x18, 0x9c5 /* anchor::RequireEqViolated */)
											st8(s110 + 0x10, 2)
											st32(s150 + 0x18, 0x149)
											st64(s150 + 0x10, 0x28)
											st64(s150, 0)
											fn_13e5a0(s2d0, s150)
											w = fn_1730(s2e0, ld64(s2d0), ld64(s2d0 + 8), ld64(s408 + 0x20), ld64(s468))
											dl = ld64(s2e0)
											dj = ld64(s3b8 + 0x28)
											st64(dj + 8, ld64(s2e0 + 8))
											st64(dj, dl)
											return w
										}
									} else {
										let dx = ld64(s408) > ld64(s448)
										const dw = ld64(s408 + 8) > ld64(s440)
										const dv = ld64(s408 + 8)
										const du = ld64(s440)
										dx = du != dv ? dw : dx
										if ((dx & 1) != 0) {
											ErrorCode_name(s170, 0x100159858, dv, du)
											st64(s78, 0, 1, 0)
											st64(s28, s78, 0x10015f818)
											st8(s28 + 0x18, 3)
											st64(s28 + 0x10, 0x20)
											st64(s40 + 8, 0)
											st64(s48, 0)
											if (ErrorCode_fmt(0x100159858, s48) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copyr(s118, s78, 0x18)
											copy(s130, s170, 0x18)
											st64(s150 + 8, 0x100159ffe)
											st32(sd0 + 0x18, 0x9ca /* anchor::RequireGteViolated */)
											st8(s110 + 0x10, 2)
											st32(s150 + 0x18, 0x13d)
											st64(s150 + 0x10, 0x28)
											st64(s150, 0)
											fn_13e5a0(s2b0, s150)
											const dz = ld64(s2b0 + 8)
											const dy = ld64(s2b0)
											copyr(sff8, s408, 0x10)
											st64(s1000, ld64(s440))
											w = fn_2be8(s2c0, dy, dz, ld64(s448), ld64(s1000), ld64(sff8), ld64(sff8 + 8))
											dl = ld64(s2c0)
											dj = ld64(s3b8 + 0x28)
											st64(dj + 8, ld64(s2c0 + 8))
											st64(dj, dl)
											return w
										}
										if ((ld64(s3b8 + 8) | ld64(s3b8)) == 0) {
											if (ld64(s408 + 0x48) != 0) {
												if (ld64(s468) == ld64(s3b8 + 0x20)) {
													break B100
												}
												ErrorCode_name(s170, 0x1001598b8, dv, du)
												st64(s78, 0, 1, 0)
												st64(s28, s78, 0x10015f818)
												st8(s28 + 0x18, 3)
												st64(s28 + 0x10, 0x20)
												st64(s40 + 8, 0)
												st64(s48, 0)
												if (ErrorCode_fmt(0x1001598b8, s48) != 0) {
													fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
												}
												copyr(s118, s78, 0x18)
												copy(s130, s170, 0x18)
												st64(s150 + 8, 0x100159ffe)
												st32(sd0 + 0x18, 0x9c5 /* anchor::RequireEqViolated */)
												st8(s110 + 0x10, 2)
												st32(s150 + 0x18, 0x145)
												st64(s150 + 0x10, 0x28)
												st64(s150, 0)
												fn_13e5a0(s290, s150)
												w = fn_1730(s2a0, ld64(s290), ld64(s290 + 8), ld64(s3b8 + 0x20), ld64(s468))
												dl = ld64(s2a0)
												dj = ld64(s3b8 + 0x28)
												st64(dj + 8, ld64(s2a0 + 8))
												st64(dj, dl)
												return w
											}
											if (ld64(s408 + 0x20) == ld64(s3b8 + 0x30)) {
												break B104
											}
											ErrorCode_name(s170, 0x1001598b8, dv, du)
											st64(s78, 0, 1, 0)
											st64(s28, s78, 0x10015f818)
											st8(s28 + 0x18, 3)
											st64(s28 + 0x10, 0x20)
											st64(s40 + 8, 0)
											st64(s48, 0)
											if (ErrorCode_fmt(0x1001598b8, s48) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copyr(s118, s78, 0x18)
											copy(s130, s170, 0x18)
											st64(s150 + 8, 0x100159ffe)
											st32(sd0 + 0x18, 0x9c5 /* anchor::RequireEqViolated */)
											st8(s110 + 0x10, 2)
											st32(s150 + 0x18, 0x14b)
											st64(s150 + 0x10, 0x28)
											st64(s150, 0)
											fn_13e5a0(s270, s150)
											w = fn_1730(s280, ld64(s270), ld64(s270 + 8), ld64(s408 + 0x20), ld64(s3b8 + 0x30))
											dl = ld64(s280)
											dj = ld64(s3b8 + 0x28)
											st64(dj + 8, ld64(s280 + 8))
											st64(dj, dl)
											return w
										}
									}
									if (ld64(s408 + 0x48) != 0) {
										break B100
									}
								}
								const el = ld64(ld64(s408 + 0x38) + 0x68)
								w = fn_88360(s2f0, 0x26)
								dk = ld64(s2f0 + 8)
								dl = ld64(s2f0)
								if (el > ld64(s408 + 0x30)) {
									dj = ld64(s3b8 + 0x28)
									st64(dj + 8, dk)
									st64(dj, dl)
									return w
								}
								w = fn_fc80(dl, dk, w)
								dj = ld64(s3b8 + 0x28)
								st64(dj + 8, ld64(s408 + 0x30) - el)
								st64(dj, 2)
								return w
							}
							const ek = ld64(ld64(s408 + 0x40) + 0x68)
							w = fn_88360(s320, 0x26)
							dk = ld64(s320 + 8)
							dl = ld64(s320)
							if (ld64(s408 + 0x28) > ek) {
								dj = ld64(s3b8 + 0x28)
								st64(dj + 8, dk)
								st64(dj, dl)
								return w
							}
							w = fn_fc80(dl, dk, w)
							dj = ld64(s3b8 + 0x28)
							st64(dj + 8, ek - ld64(s408 + 0x28))
							st64(dj, 2)
							return w
						}
						ed = ld64(s260 + 8)
						ec = ld64(s3b8 + 0x28)
						st64(ec, dt, ed)
						return w
					}
					ed = ld64(s250 + 8)
					ec = ld64(s3b8 + 0x28)
					st64(ec, dt, ed)
					return w
				}
				fn_85138(s170, 0x100159824)
				st64(s78, 0, 1, 0)
				st64(s28, s78, 0x10015f818)
				st8(s28 + 0x18, 3)
				st64(s28 + 0x10, 0x20)
				st64(s40 + 8, 0)
				st64(s48, 0)
				if (fn_88558(0x100159824, s48) != 0) {
					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
				}
				copyr(s118, s78, 0x18)
				copy(s130, s170, 0x18)
				st64(s150 + 8, 0x100159ffe)
				st32(sd0 + 0x18, 0x1786 /* error::TooSmallInputOrOutputAmount */)
				st8(s110 + 0x10, 2)
				st32(s150 + 0x18, 0xab)
				st64(s150 + 0x10, 0x28)
				st64(s150, 0)
				au = fn_13e5a0(s370, s150)
				const ck = ld64(s370)
				const cj = ld64(s3b8 + 0x28)
				st64(cj + 8, ld64(s370 + 8))
				st64(cj, ck)
				w = fn_f680(s190, au)
				aw = ld64(s1a0 + 8)
				st64(aw, ld64(aw) + 1)
				return w
			}
		}
		fn_85138(s170, 0x10015990c)
		st64(s78, 0, 1, 0)
		st64(s28, s78, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s40 + 8, 0)
		st64(s48, 0)
		if (fn_88558(0x10015990c, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(s118, s78, 0x18)
		copy(s130, s170, 0x18)
		st64(s150 + 8, 0x100159ffe)
		st32(sd0 + 0x18, 0x1785 /* error::InvalidInputPoolVault */)
		st8(s110 + 0x10, 2)
		st32(s150 + 0x18, 0x76)
		st64(s150 + 0x10, 0x28)
		st64(s150, 0)
		w = fn_13e5a0(s1d0, s150)
		av = ld64(s1d0)
		st64(x + 8, ld64(s1d0 + 8))
		st64(x, av)
		aw = ld64(s1a0 + 8)
		st64(aw, ld64(aw) + 1)
		return w
	}
	ErrorCode_name(s170, 0x100159900, aj, ai)
	st64(s78, 0, 1, 0)
	st64(s28, s78, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s40 + 8, 0)
	st64(s48, 0)
	if (ErrorCode_fmt(0x100159900, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(s118, s78, 0x18)
	copy(s130, s170, 0x18)
	st64(s150 + 8, 0x100159ffe)
	st32(sd0 + 0x18, 0x9c9 /* anchor::RequireGtViolated */)
	st8(s110 + 0x10, 2)
	st32(s150 + 0x18, 0x74)
	st64(s150 + 0x10, 0x28)
	st64(s150, 0)
	fn_13e5a0(s1b0, s150)
	w = fn_1730(s1c0, ld64(s1b0), ld64(s1b0 + 8), ld64(s3b8 + 0x18), ld64(ld64(s408 + 0x18) + 0x430))
	av = ld64(s1c0)
	st64(x + 8, ld64(s1c0 + 8))
	st64(x, av)
	aw = ld64(s1a0 + 8)
	st64(aw, ld64(aw) + 1)
	return w
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), d (value), c (value)
export function fn_514e0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178
	let f, g, h: u64
	if (b != 0) {
		if (d != 0) {
			h = fn_644c8(s118, c, r0)
			g = ld64(s118 + 8)
			if (ld64(s118) == 1) {
				st64(a + 8, ld64(s118 + 0x10))
				st64(a, g)
				return h
			}
			h = fn_660f8(s48, g, ld64(s118 + 0x10), 0)
			f = ld64(s48 + 0x10)
			g = ld64(s48 + 8)
			if ((ld64(s48) & 1) != 0) {
				st64(a + 8, f)
				st64(a, g)
				return h
			}
			st64(s138, g, f)
			st64(s60, b, 0)
			st64(s48, 0, 1)
			h = fn_584f8(s118, s60, s138, s48)
			if (ld64(s118) != 1) {
				h = fn_88360(s158, 0x26)
				g = ld64(s158)
				st64(a + 8, ld64(s158 + 8))
				st64(a, g)
				return h
			}
		} else {
			h = fn_644c8(s118, c, r0)
			g = ld64(s118 + 8)
			if (ld64(s118) == 1) {
				st64(a + 8, ld64(s118 + 0x10))
				st64(a, g)
				return h
			}
			h = fn_660f8(s48, g, ld64(s118 + 0x10), 1)
			f = ld64(s48 + 0x10)
			g = ld64(s48 + 8)
			if ((ld64(s48) & 1) != 0) {
				st64(a + 8, f)
				st64(a, g)
				return h
			}
			st64(s128, g, f)
			st64(s60, b, 0)
			st64(s48, 0, 1)
			h = fn_584f8(s118, s60, s48, s128)
			if (ld64(s118) != 1) {
				h = fn_88360(s148, 0x26)
				g = ld64(s148)
				st64(a + 8, ld64(s148 + 8))
				st64(a, g)
				return h
			}
		}
		f = ld64(s118 + 0x10)
		const i = ld64(s118 + 8)
		if (f == 0 && i + 3 >= 4) {
			st64(a + 8, f)
			st64(a, 2)
			return h
		}
		fn_85138(s78, 0x100159834)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_88558(0x100159834, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(sf8, s78, 0x30)
		st64(s118 + 8, 0x10015a201)
		st32(sf8 + 0x78, 0x179a /* error::InvalidLimitOrderAmount */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x10a)
		st64(s118 + 0x10, 0x3d)
		st64(s118, 0)
		h = fn_13e5a0(s168, s118)
		g = ld64(s168)
		st64(a + 8, ld64(s168 + 8))
		st64(a, g)
		return h
	}
	fn_85138(s78, 0x100159888)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x100159888, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a201)
	st32(sf8 + 0x78, 0x1784 /* error::ZeroAmountSpecified */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0xfa)
	st64(s118 + 0x10, 0x3d)
	st64(s118, 0)
	h = fn_13e5a0(s178, s118)
	g = ld64(s178)
	st64(a + 8, ld64(s178 + 8))
	st64(a, g)
	return h
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), c (value)
export function fn_51b90(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148
	let f, g: u64
	if (0xd89e7 > ((b + 0x6c4f3) as u32)) {
		if ((e as u16) == 0) {
			fn_154940(0x10015fea0, b, c, d, e as u16)
		}
		f = fn_158b50(b as i32, e as u16)
		if (f != 0) {
			fn_85138(s78, 0x1001598dc)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (fn_88558(0x1001598dc, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copy(sf8, s78, 0x30)
			st64(s118 + 8, 0x10015a201)
			st32(sf8 + 0x78, 0x1778 /* error::TickAndSpacingNotMatch */)
			st8(sf8 + 0x30, 2)
			st32(s118 + 0x18, 0x11b)
			st64(s118 + 0x10, 0x3d)
			st64(s118, 0)
			f = fn_13e5a0(s138, s118)
			g = ld64(s138)
			st64(a + 8, ld64(s138 + 8))
			st64(a, g)
			return f
		}
		if (c != 0) {
			if ((b as i32) > (d as i32)) {
				st64(a + 8, undef)
				st64(a, 2)
				return f
			}
		} else if ((d as i32) > (b as i32)) {
			st64(a + 8, undef)
			st64(a, 2)
			return f
		}
		fn_85138(s78, 0x100159838)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_88558(0x100159838, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(sf8, s78, 0x30)
		st64(s118 + 8, 0x10015a201)
		st32(sf8 + 0x78, 0x1774 /* error::InvalidTickIndex */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x120)
		st64(s118 + 0x10, 0x3d)
		st64(s118, 0)
		f = fn_13e5a0(s148, s118)
		g = ld64(s148)
		st64(a + 8, ld64(s148 + 8))
		st64(a, g)
		return f
	}
	fn_85138(s78, 0x100159838)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x100159838, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a201)
	st32(sf8 + 0x78, 0x1774 /* error::InvalidTickIndex */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0x115)
	st64(s118 + 0x10, 0x3d)
	st64(s118, 0)
	f = fn_13e5a0(s128, s118)
	g = ld64(s128)
	st64(a + 8, ld64(s128 + 8))
	st64(a, g)
	return f
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value)
export function fn_583c8(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50
	if (d == 0) {
		st64(a + 8, a)
		st64(a, 0)
		return r0
	}
	__multi3_159030(s50, c, 0, b, 0)
	st64(s30, d)
	const f = ld64(s50)
	const g = d + f - 1
	st64(s40, g)
	st64(s40 + 8, ld64(s50 + 8) + (f > g))
	st64(s30 + 8, 0)
	r0 = fn_100918(s20, s40, s30)
	const h = ld64(s20 + 8) == 0
	st64(a + 8, ld64(s20))
	st64(a, h)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it), b (points to it), c (points to it)
export function fn_584f8(a: u64, b: u64, c: u64, d: u64): u64 {
	const s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s80 = fp - 0x80, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s108 = fp - 0x108, s110 = fp - 0x110, s118 = fp - 0x118
	let f = ld64(d)
	const g = ld64(d + 8)
	if ((f | g) == 0) {
		st64(a, 0)
		return f
	}
	st64(s118, d)
	st64(s108, g, f, a)
	const h = ld64(b)
	const i = ld64(c)
	__multi3_159030(sf0, h, 0, i, 0)
	const j = ld64(b + 8)
	st64(s110, i)
	__multi3_159030(sd0, j, 0, i, 0)
	const k = ld64(c + 8)
	__multi3_159030(se0, k, 0, h, 0)
	__multi3_159030(sc0, k, 0, j, 0)
	const m = ld64(sf0 + 8)
	const l = ld64(sd0)
	const q = (l > l + m) + ld64(sd0 + 8)
	const n = ld64(se0)
	const o = n + (l + m)
	const p = (n > o) + ld64(se0 + 8)
	const t = p > p + q
	const r = ld64(sc0)
	const s = r + (p + q)
	st64(sb0, ld64(sf0))
	st64(sb0 + 8, o)
	if (s == 0 && (r > s) + ld64(sc0 + 8) == -(t & 1)) {
		f = fn_100918(s40, sb0, ld64(s118))
		a = ld64(s108 + 0x10)
		st64(a + 0x10, ld64(s40 + 8))
		st64(a + 8, ld64(s40))
		st64(a, 1)
		return f
	}
	st64(s80, h, j, 0, 0)
	st64(s40 + 8, k)
	st64(s40, ld64(s110))
	st64(s30, 0, 0)
	fn_103fe8(sa0, s80, s40)
	st64(s60 + 8, ld64(s108))
	st64(s60, ld64(s108 + 8))
	st64(s50, 0, 0)
	f = fn_1019b8(s40, sa0, s60)
	a = ld64(s108 + 0x10)
	if ((ld64(s30 + 8) | ld64(s30)) != 0) {
		st64(a, 0)
		return f
	}
	const u = ld64(s40)
	st64(a + 0x10, ld64(s40 + 8))
	st64(a + 8, u)
	st64(a, 1)
	return f
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it), b (points to it), c (points to it)
export function fn_58930(a: u64, b: u64, c: u64, d: u64): u64 {
	const s30 = fp - 0x30, s40 = fp - 0x40, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s108 = fp - 0x108, s110 = fp - 0x110, s118 = fp - 0x118, s120 = fp - 0x120
	let j, k, u, v, x, y, ab, ad: u64
	const f = ld64(d)
	let g = ld64(d + 8)
	if ((f | g) == 0) {
		st64(a, 0)
		return g
	}
	B9: {
		st64(s120, d)
		st64(s108, a, f, g)
		const h = ld64(b)
		const i = ld64(c)
		__multi3_159030(sf0, h, 0, i, 0)
		j = ld64(b + 8)
		st64(s110, i)
		__multi3_159030(sd0, j, 0, i, 0)
		k = ld64(c + 8)
		st64(s118, h)
		__multi3_159030(se0, k, 0, h, 0)
		__multi3_159030(sc0, k, 0, j, 0)
		const m = ld64(sf0 + 8)
		const l = ld64(sd0)
		const q = (l > l + m) + ld64(sd0 + 8)
		const n = ld64(se0)
		const o = n + (l + m)
		const p = (n > o) + ld64(se0 + 8)
		u = ld64(s108 + 8)
		const t = p > p + q
		const r = ld64(sc0)
		const s = r + (p + q)
		if (s == 0 && (r > s) + ld64(sc0 + 8) == -(t & 1)) {
			x = ld64(sf0)
			if (u == 0) {
				y = -1
				const ao = ld64(s108 + 0x10)
				v = ao - 1
				if (ao == 0) {
					st64(s40, 0x100160990, 1, 8, 0, 0)
					// fmt "arithmetic operation overflow"
					fn_14ec00(s40, 0x10015fe28, v, x, y)
				}
			} else {
				y = u - 1
				v = ld64(s108 + 0x10)
			}
			let w = o + v
			const aa = o > w
			const z = x + y
			if (z >= x) {
				if ((aa & 1) != 0) {
					break B9
				}
			} else {
				w = w + 1
				if (((aa | w == 0) & 1) != 0) {
					break B9
				}
			}
			st64(sb0, z, w)
			g = fn_100918(s40, sb0, ld64(s120))
			a = ld64(s108)
			st64(a + 0x10, ld64(s40 + 8))
			st64(a + 8, ld64(s40))
			st64(a, 1)
			return g
		}
	}
	st64(s80 + 8, j)
	st64(s80, ld64(s118))
	st64(s70, 0, 0)
	st64(s40 + 8, k)
	st64(s40, ld64(s110))
	st64(s30, 0, 0)
	fn_103fe8(sa0, s80, s40)
	x = undef
	y = undef
	if (u == 0) {
		v = -1
		ab = ld64(s108 + 0x10)
		ad = ab - 1
		if (ab == 0) {
			st64(s40, 0x100160990, 1, 8, 0, 0)
			// fmt "arithmetic operation overflow"
			fn_14ec00(s40, 0x10015fe28, v, x, y)
		}
	} else {
		v = u - 1
		ab = ld64(s108 + 0x10)
		ad = ab
	}
	const ac = ld64(sa0 + 8)
	const ae = ac + ad
	const af = ld64(sa0)
	const ag = af + v
	const al = af > ag ? ae + 1 : ae
	const ah = af > ag & ae == -1
	const ai = ld64(sa0 + 0x10)
	let aj = ai + (ah + (ac > ae))
	const ak = ai > aj
	aj = (ac > ae | ah) != 0 ? aj : ai
	const am = ld64(sa0 + 0x18)
	if ((ac > ae | ah) == 1 && (ak & 1) != 0) {
		st64(s80, ag, al, aj, am + 1)
		if (am == -1) {
			st64(s40, 0x100160990, 1, 8, 0, 0)
			// fmt "arithmetic operation overflow"
			fn_14ec00(s40, 0x10015feb8, al, aj, am + 1)
		}
	} else {
		st64(s80, ag, al, aj, am)
	}
	st64(s60, u, ab, 0, 0)
	g = fn_1019b8(s40, s80, s60)
	a = ld64(s108)
	if ((ld64(s30 + 8) | ld64(s30)) != 0) {
		st64(a, 0)
		return g
	}
	const an = ld64(s40)
	st64(a + 0x10, ld64(s40 + 8))
	st64(a + 8, an)
	st64(a, 1)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
export function fn_59110(a: u64, b: u64, c: u64, d: u64): u64 {
	const s60 = fp - 0x60, s80 = fp - 0x80, sa0 = fp - 0xa0, sc0 = fp - 0xc0, se0 = fp - 0xe0, s100 = fp - 0x100, s140 = fp - 0x140, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s2b0 = fp - 0x2b0, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2c8 = fp - 0x2c8, s2d0 = fp - 0x2d0, s2d8 = fp - 0x2d8, s2e0 = fp - 0x2e0, s2e8 = fp - 0x2e8
	const i = ld64(d + 0x18)
	const h = ld64(d + 0x10)
	let g = ld64(d + 8)
	const f = ld64(d)
	if (f == 0 && (g == 0 && (h == 0 && i == 0))) {
		st64(a, 0)
		return g
	}
	st64(s2e8, d)
	st64(s2b0, i, h, g, f, a)
	const j = ld64(b)
	const k = ld64(c)
	st64(s2b0 + 0x40, c)
	__multi3_159030(s260, j, 0, k, 0)
	const l = ld64(b + 8)
	st64(s2b0 + 0x30, l)
	__multi3_159030(s1a0, l, 0, k, 0)
	const m = ld64(b + 0x10)
	st64(s2b0 + 0x28, m)
	__multi3_159030(s1e0, m, 0, k, 0)
	const n = ld64(b + 0x18)
	st64(s2b0 + 0x48, n)
	st64(s2b8, k)
	__multi3_159030(s220, n, 0, k, 0)
	const o = ld64(c + 8)
	st64(s2b0 + 0x38, j)
	__multi3_159030(s250, o, 0, j, 0)
	const p = ld64(s2b0 + 0x30)
	__multi3_159030(s190, o, 0, p, 0)
	const q = ld64(s2b0 + 0x28)
	__multi3_159030(s1d0, o, 0, q, 0)
	st64(s2c0, o)
	__multi3_159030(s210, o, 0, ld64(s2b0 + 0x48), 0)
	const r = ld64(ld64(s2b0 + 0x40) + 0x10)
	__multi3_159030(s240, r, 0, j, 0)
	__multi3_159030(s180, r, 0, p, 0)
	__multi3_159030(s1c0, r, 0, q, 0)
	st64(s2c8, r)
	const s = ld64(s2b0 + 0x48)
	__multi3_159030(s200, r, 0, s, 0)
	const t = ld64(ld64(s2b0 + 0x40) + 0x18)
	__multi3_159030(s230, t, 0, ld64(s2b0 + 0x38), 0)
	__multi3_159030(s170, t, 0, p, 0)
	__multi3_159030(s1b0, t, 0, q, 0)
	st64(s2d0, t)
	__multi3_159030(s1f0, t, 0, s, 0)
	const v = ld64(s260 + 8)
	const u = ld64(s1a0)
	st64(s2b0 + 0x40, 1)
	const x = (u > u + v) + ld64(s1a0 + 8)
	const w = ld64(s1e0)
	const y = ld64(s250)
	const z = y + (u + v)
	st64(s2d8, z)
	const aa = (y > z) + ld64(s250 + 8)
	const ab = aa + (w + x)
	const ac = ld64(s190)
	const ad = (ac > ac + ab) + ld64(s190 + 8)
	const ag = (w > w + x) + ld64(s1e0 + 8)
	const ae = ad + (aa > ab)
	const af = ld64(s220)
	const ah = ae + (af + ag)
	const ai = ld64(s1d0)
	const ak = ad > ae | ae > ah
	const aj = (ai > ai + ah) + ld64(s1d0 + 8)
	const al = aj + ak + ((af > af + ag) + ld64(s220 + 8))
	const am = ld64(s240)
	const an = am + (ac + ab)
	st64(s2e0, an)
	const ao = (am > an) + ld64(s240 + 8)
	const ap = ao + (ai + ah)
	const aq = ld64(s180)
	const at = (aq > aq + ap) + ld64(s180 + 8)
	const ar = ld64(s210)
	const au = at + (ao > ap)
	const av = au + (ar + al)
	const ay = at > au | au > av
	const aw = ld64(s1c0)
	const ax = (aw > aw + av) + ld64(s1c0 + 8)
	const az = ax + ay + ((aj > aj + ak | aj + ak > al) + ld64(s210 + 8) + (ar > ar + al))
	const ba = ld64(s230)
	let bb = ba + (aq + ap)
	const bc = (ba > bb) + ld64(s230 + 8)
	const bd = bc + (aw + av)
	const be = ld64(s170)
	const bg = (be > be + bd) + ld64(s170 + 8)
	const bf = ld64(s200)
	const bh = bg + (bc > bd)
	const bi = bh + (bf + az)
	const bl = bg > bh | bh > bi
	const bj = ld64(s1b0)
	const bk = (bj > bj + bi) + ld64(s1b0 + 8)
	const bn = bk + bl + ((ax > ax + ay | ax + ay > az) + ld64(s200 + 8) + (bf > bf + az))
	const bq = bk > bk + bl
	const bm = ld64(s1f0)
	const br = bk + bl > bn
	if (bm + bn >= bm) {
		st64(s2b0 + 0x40, 0)
	}
	if (be + bd == 0 && (bj + bi == 0 && bm + bn == 0)) {
		const bp = ld64(s1f0 + 8)
		const bo = ld64(s260)
		st64(s160 + 0x18, bb)
		st64(s160 + 0x10, ld64(s2e0))
		bb = ld64(s2d8)
		st64(s160, bo, bb)
		if ((ld64(s2b0 + 0x40) & 1) + bp == -((bq | br) & 1)) {
			g = fn_1019b8(s80, s160, ld64(s2e8))
			a = ld64(s2b0 + 0x20)
			st64(a + 0x20, ld64(s80 + 0x18))
			st64(a + 0x18, ld64(s80 + 0x10))
			st64(a + 0x10, ld64(s80 + 8))
			st64(a + 8, ld64(s80))
			st64(a, 1)
			return g
		}
	}
	st64(s100 + 0x18, ld64(s2b0 + 0x48))
	st64(s100 + 0x10, ld64(s2b0 + 0x28))
	st64(s100 + 8, ld64(s2b0 + 0x30))
	st64(s100, ld64(s2b0 + 0x38))
	st64(se0, 0, 0, 0, 0)
	st64(s80 + 0x18, ld64(s2d0))
	st64(s80 + 0x10, ld64(s2c8))
	st64(s80 + 8, ld64(s2c0))
	st64(s80, ld64(s2b8))
	st64(s60, 0, 0, 0, 0)
	fn_1073b8(s140, s100, s80, bb, br)
	st64(sc0 + 0x18, ld64(s2b0))
	st64(sc0 + 0x10, ld64(s2b0 + 8))
	st64(sc0 + 8, ld64(s2b0 + 0x10))
	st64(sc0, ld64(s2b0 + 0x18))
	st64(sa0, 0, 0, 0, 0)
	g = fn_104b78(s80, s140, sc0)
	a = ld64(s2b0 + 0x20)
	if (ld64(s60 + 0x18) != 0) {
		st64(a, 0)
		return g
	}
	if (ld64(s60 + 0x10) != 0) {
		st64(a, 0)
		return g
	}
	if (ld64(s60 + 8) != 0) {
		st64(a, 0)
		return g
	}
	if (ld64(s60) != 0) {
		st64(a, 0)
		return g
	}
	const bs = ld64(s80 + 0x10)
	const bt = ld64(s80 + 8)
	const bu = ld64(s80)
	st64(a + 0x20, ld64(s80 + 0x18))
	st64(a + 0x18, bs)
	st64(a + 0x10, bt)
	st64(a + 8, bu)
	st64(a, 1)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
export function fn_59f70(a: u64, b: u64, c: u64, d: u64): u64 {
	const s60 = fp - 0x60, s80 = fp - 0x80, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, se0 = fp - 0xe0, s100 = fp - 0x100, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s2b0 = fp - 0x2b0, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2c8 = fp - 0x2c8, s2d0 = fp - 0x2d0, s2d8 = fp - 0x2d8, s2e0 = fp - 0x2e0, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8
	let br, bs, bv, bx, bz, ca, cc, ck, cm, cn, co, cp, cq: u64
	let i = ld64(d + 0x18)
	const h = ld64(d + 0x10)
	const g = ld64(d + 8)
	const f = ld64(d)
	if (f == 0 && (g == 0 && (h == 0 && i == 0))) {
		st64(a, 0)
		return i
	}
	st64(s2b0 + 0x38, f)
	st64(s2b0 + 0x48, g)
	st64(s2f0, d)
	st64(s2b0, a, i, h)
	const j = ld64(b)
	const k = ld64(c)
	st64(s2b0 + 0x30, c)
	__multi3_159030(s260, j, 0, k, 0)
	const l = ld64(b + 8)
	st64(s2b0 + 0x20, l)
	__multi3_159030(s1a0, l, 0, k, 0)
	const m = ld64(b + 0x10)
	st64(s2b0 + 0x18, m)
	__multi3_159030(s1e0, m, 0, k, 0)
	const n = ld64(b + 0x18)
	st64(s2b0 + 0x40, n)
	st64(s2b8, k)
	__multi3_159030(s220, n, 0, k, 0)
	const o = ld64(c + 8)
	st64(s2b0 + 0x28, j)
	__multi3_159030(s250, o, 0, j, 0)
	const p = ld64(s2b0 + 0x20)
	__multi3_159030(s190, o, 0, p, 0)
	const q = ld64(s2b0 + 0x18)
	__multi3_159030(s1d0, o, 0, q, 0)
	st64(s2c0, o)
	__multi3_159030(s210, o, 0, ld64(s2b0 + 0x40), 0)
	const r = ld64(ld64(s2b0 + 0x30) + 0x10)
	__multi3_159030(s240, r, 0, j, 0)
	__multi3_159030(s180, r, 0, p, 0)
	__multi3_159030(s1c0, r, 0, q, 0)
	st64(s2c8, r)
	const s = ld64(s2b0 + 0x40)
	__multi3_159030(s200, r, 0, s, 0)
	const t = ld64(ld64(s2b0 + 0x30) + 0x18)
	__multi3_159030(s230, t, 0, ld64(s2b0 + 0x28), 0)
	__multi3_159030(s170, t, 0, p, 0)
	__multi3_159030(s1b0, t, 0, q, 0)
	st64(s2d0, t)
	__multi3_159030(s1f0, t, 0, s, 0)
	const v = ld64(s260 + 8)
	const u = ld64(s1a0)
	st64(s2b0 + 0x30, 1)
	const x = (u > u + v) + ld64(s1a0 + 8)
	const w = ld64(s1e0)
	const y = ld64(s250)
	const z = y + (u + v)
	st64(s2e0, z)
	const aa = (y > z) + ld64(s250 + 8)
	const ab = aa + (w + x)
	const ac = ld64(s190)
	const ad = (ac > ac + ab) + ld64(s190 + 8)
	const ag = (w > w + x) + ld64(s1e0 + 8)
	const ae = ad + (aa > ab)
	const af = ld64(s220)
	const ah = ae + (af + ag)
	const ai = ld64(s1d0)
	const ak = ad > ae | ae > ah
	const aj = (ai > ai + ah) + ld64(s1d0 + 8)
	const al = aj + ak + ((af > af + ag) + ld64(s220 + 8))
	const am = ld64(s240)
	const an = am + (ac + ab)
	st64(s2d8, an)
	const ao = (am > an) + ld64(s240 + 8)
	const ap = ao + (ai + ah)
	const aq = ld64(s180)
	const at = (aq > aq + ap) + ld64(s180 + 8)
	const ar = ld64(s210)
	const au = at + (ao > ap)
	const av = au + (ar + al)
	const ay = at > au | au > av
	const aw = ld64(s1c0)
	const ax = (aw > aw + av) + ld64(s1c0 + 8)
	const az = ax + ay + ((aj > aj + ak | aj + ak > al) + ld64(s210 + 8) + (ar > ar + al))
	const ba = ld64(s230)
	const bb = ba + (aq + ap)
	st64(s2e8, bb)
	const bc = (ba > bb) + ld64(s230 + 8)
	const bd = bc + (aw + av)
	const be = ld64(s170)
	const bg = (be > be + bd) + ld64(s170 + 8)
	const bf = ld64(s200)
	const bh = bg + (bc > bd)
	const bi = bh + (bf + az)
	const bm = bg > bh | bh > bi
	const bj = ld64(s1b0)
	let bk = bj + bi
	const bl = (bj > bk) + ld64(s1b0 + 8)
	const bo = bl + bm + ((ax > ax + ay | ax + ay > az) + ld64(s200 + 8) + (bf > bf + az))
	const bu = ld64(s2b0 + 0x38)
	let bt = ld64(s2b0 + 0x48)
	const bp = bl > bl + bm
	const bn = ld64(s1f0)
	let bq = bl + bm > bo
	if (bn + bo >= bn) {
		st64(s2b0 + 0x30, 0)
	}
	B22: {
		bs = ld64(s2b0 + 0x10)
		if (be + bd == 0 && (bk == 0 && bn + bo == 0)) {
			br = (ld64(s2b0 + 0x30) & 1) + ld64(s1f0 + 8)
			if (br == -((bp | bq) & 1)) {
				B14: {
					bz = ld64(s260)
					cc = bs
					bx = bt
					if (bu == 0) {
						bx = bt - 1
						cc = bs
						if (bt == 0) {
							bx = -1
							cc = bs - 1
							if (bs == 0) {
								ca = -1
								const cu = ld64(s2b0 + 8)
								bv = cu - 1
								cc = -1
								if (cu != 0) {
									break B14
								}
								st64(s80, 0x100160990, 1, 8, 0, 0)
								// fmt "arithmetic operation overflow"
								fn_14ec00(s80, 0x10015feb8, br, bx, bq)
							}
						}
					}
					ca = bu - 1
					bv = ld64(s2b0 + 8)
				}
				st64(s2b0 + 0x30, bv)
				const bw = ld64(s2e0)
				const by = bw + bx
				const cb = bz + ca
				st64(s2f8, cb)
				st64(s2e0, by + 1)
				bk = ld64(s2d8) + cc
				const cd = bz > cb & by == -1
				const ce = ld64(s2e8)
				const cf = ld64(s2b0 + 0x30)
				const cl = ce > ce + cf
				let cg = bk + (cd + (bw > by))
				st64(s2b0 + 0x30, 1)
				if (bk >= ld64(s2d8)) {
					st64(s2b0 + 0x30, 0)
				}
				const ch = bk > cg
				if (cb >= bz) {
					st64(s2e0, by)
				}
				bq = bw > by | cd
				bs = ld64(s2b0 + 0x10)
				cg = bq != 0 ? cg : bk
				const ci = bq & ch
				const cj = ld64(s2b0 + 0x30)
				if (ci + cj == 0) {
					ck = ce + cf
					bt = ld64(s2b0 + 0x48)
					if ((cl & 1) != 0) {
						break B22
					}
				} else {
					ck = ce + cf + (ci + cj)
					bt = ld64(s2b0 + 0x48)
					if (((cl | ce + cf > ck) & 1) != 0) {
						break B22
					}
				}
				st64(s150, cg, ck)
				st64(s160 + 8, ld64(s2e0))
				st64(s160, ld64(s2f8))
				i = fn_1019b8(s80, s160, ld64(s2f0))
				a = ld64(s2b0)
				st64(a + 0x20, ld64(s80 + 0x18))
				st64(a + 0x18, ld64(s80 + 0x10))
				st64(a + 0x10, ld64(s80 + 8))
				st64(a + 8, ld64(s80))
				st64(a, 1)
				return i
			}
		}
	}
	B26: {
		st64(s100 + 0x18, ld64(s2b0 + 0x40))
		st64(s100 + 0x10, ld64(s2b0 + 0x18))
		st64(s100 + 8, ld64(s2b0 + 0x20))
		st64(s100, ld64(s2b0 + 0x28))
		st64(se0, 0, 0, 0, 0)
		st64(s80 + 0x18, ld64(s2d0))
		st64(s80 + 0x10, ld64(s2c8))
		st64(s80 + 8, ld64(s2c0))
		st64(s80, ld64(s2b8))
		st64(s60, 0, 0, 0, 0)
		fn_1073b8(s140, s100, s80, bk, bq)
		bq = undef
		cn = bs
		co = bt
		if (bu == 0) {
			co = bt - 1
			cn = bs
			if (bt == 0) {
				co = -1
				cn = bs - 1
				if (bs == 0) {
					cp = bs
					br = -1
					cq = bu
					cm = ld64(s2b0 + 8)
					bx = cm - 1
					cn = -1
					if (cm != 0) {
						break B26
					}
					st64(s80, 0x100160990, 1, 8, 0, 0)
					// fmt "arithmetic operation overflow"
					fn_14ec00(s80, 0x10015feb8, br, bx, bq)
				}
			}
		}
		cp = bs
		br = bu - 1
		cq = bu
		cm = ld64(s2b0 + 8)
		bx = cm
	}
	st64(s80, br, co, cn, bx, 0, 0, 0, 0)
	fn_106e00(s100, s140, s80)
	st64(sb0, cp, cm)
	st64(sc0 + 8, ld64(s2b0 + 0x48))
	st64(sc0, cq)
	st64(sa0, 0, 0, 0, 0)
	i = fn_104b78(s80, s100, sc0)
	a = ld64(s2b0)
	if (ld64(s60 + 0x18) != 0) {
		st64(a, 0)
		return i
	}
	if (ld64(s60 + 0x10) != 0) {
		st64(a, 0)
		return i
	}
	if (ld64(s60 + 8) != 0) {
		st64(a, 0)
		return i
	}
	if (ld64(s60) != 0) {
		st64(a, 0)
		return i
	}
	const cr = ld64(s80 + 0x10)
	const cs = ld64(s80 + 8)
	const ct = ld64(s80)
	st64(a + 0x20, ld64(s80 + 0x18))
	st64(a + 0x18, cr)
	st64(a + 0x10, cs)
	st64(a + 8, ct)
	st64(a, 1)
	return i
}

export function fn_5b258(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let f, h, i: u64
	if (0 > (e as i64)) {
		const k = e + (d != 0)
		const l = d > d + b
		if ((-k != c ? -k > c : -d > b) != 0) {
			fn_154788(0x10015fee8, l, c, d + b, -k)
		}
		h = e + c + l
		i = b
		f = d + b
		if ((h != c ? c > h : b > d + b) != 0) {
			st64(a + 8, f, h)
			st64(a, 0)
			return i
		}
		const m = h
		fn_85138(s78, 0x1001598e4)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_88558(0x1001598e4, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(sf8, s78, 0x30)
		st64(s118 + 8, 0x10015a3b9)
		st32(sf8 + 0x78, 0x177d /* error::LiquiditySubValueErr */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x14)
		st64(s118 + 0x10, 0x2c)
		st64(s118, 0)
		fn_13e5a0(s128, s118)
		const o = ld64(s128 + 8)
		const n = ld64(s128)
		i = fn_2be8(s138, n, o, b, c, d + b, m)
		const p = ld64(s138)
		st64(a + 0x10, ld64(s138 + 8))
		st64(a + 8, p)
		st64(a, 1)
		return i
	}
	f = b + d
	let g = b > f
	h = c + e + g
	i = c > h
	g = h != c ? i : g
	const j = g & 1
	if (j != 0) {
		fn_154730(0x10015fed0, f, h, j, b)
	}
	st64(a + 8, f, h)
	st64(a, 0)
	return i
}

export function fn_5b700(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, r0: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78
	let n: u64
	let h = c
	let g = b
	const f = p6
	if (f != 0) {
		const i = p5
		const k = h != i ? i > h : d > g
		const j = h != i ? h > i : g > d
		const m = j != 0 ? g : d
		g = k != 0 ? g : d
		const l = j != 0 ? h : i
		h = k != 0 ? h : i
		st64(s58, g, h)
		st64(s20, m, l, 0, 1)
		fn_584f8(s38, s58, s20, s10)
		if (ld64(s38) != 0) {
			copyr(s48, s30, 0x10)
			st64(s20, f, 0, m - g, l - h - (g > m))
			r0 = fn_584f8(s38, s20, s48, s10)
			if (ld64(s38) != 0) {
				const o = ld64(s30)
				st64(a + 0x10, ld64(s30 + 8))
				st64(a + 8, o)
				st64(a, 0)
				return r0
			}
			r0 = fn_88360(s78, 0x26)
			n = ld64(s78)
			st64(a + 0x10, ld64(s78 + 8))
			st64(a + 8, n)
			st64(a, 1)
			return r0
		}
		r0 = fn_88360(s68, 0x26)
		n = ld64(s68)
		st64(a + 0x10, ld64(s68 + 8))
		st64(a + 8, n)
		st64(a, 1)
		return r0
	}
	st64(a + 0x10, 0)
	st64(a + 8, 0)
	st64(a, 0)
	return r0
}

export function fn_5ba48(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s1000 = fp - 0x1000
	const g = p7
	let f = p5
	const h = p6
	const j = f != g ? f > g : d > h
	const i = f != g ? g > f : h > d
	const k = i != 0 ? f : g
	f = j != 0 ? f : g
	const l = i != 0 ? d : h
	d = j != 0 ? d : h
	const m = p8
	if ((k != c ? k >= c : l >= b) != 0) {
		st64(s1000, f, m)
		return fn_5b700(a, l, k, d, ld64(s1000), ld64(s1000 + 8), k)
	}
	if ((f != c ? f > c : d > b) != 0) {
		st64(s1000, f, m)
		return fn_5b700(a, b, c, d, ld64(s1000), ld64(s1000 + 8), k)
	}
	st64(a + 0x10, 0)
	st64(a + 8, 0)
	st64(a, 0)
	return k
}

export function fn_5bca0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68
	let n, o, p: u64
	const g = p7
	let f = p5
	const h = p6
	const j = f != g ? f > g : d > h
	const i = f != g ? g > f : h > d
	const k = i != 0 ? f : g
	f = j != 0 ? f : g
	const l = i != 0 ? d : h
	d = j != 0 ? d : h
	if ((c != k ? k >= c : l >= b) != 0) {
		st64(a + 0x10, 0)
		st64(a + 8, 0)
		st64(a, 0)
		return f
	}
	const m = p8
	if ((f != c ? f > c : d > b) != 0) {
		if (m != 0) {
			n = a
			st64(s30, m, 0, 0, 1, b - l, c - k - (l > b))
			f = fn_584f8(s48, s30, s20, s10)
			if (ld64(s48) != 0) {
				p = ld64(s48 + 8)
				st64(n + 0x10, ld64(s48 + 0x10))
				st64(n + 8, p)
				st64(n, 0)
				return f
			}
			f = fn_88360(s68, 0x26)
			o = ld64(s68)
			st64(n + 0x10, ld64(s68 + 8))
			st64(n + 8, o)
			st64(n, 1)
			return f
		}
		st64(a + 0x10, 0)
		st64(a + 8, 0)
		st64(a, 0)
		return f
	}
	if (m != 0) {
		n = a
		st64(s30, m, 0, 0, 1, d - l, f - k - (l > d))
		f = fn_584f8(s48, s30, s20, s10)
		if (ld64(s48) != 0) {
			p = ld64(s48 + 8)
			st64(n + 0x10, ld64(s48 + 0x10))
			st64(n + 8, p)
			st64(n, 0)
			return f
		}
		f = fn_88360(s58, 0x26)
		o = ld64(s58)
		st64(n + 0x10, ld64(s58 + 8))
		st64(n + 8, o)
		st64(n, 1)
		return f
	}
	st64(a + 0x10, 0)
	st64(a + 8, 0)
	st64(a, 0)
	return f
}

export function fn_5c0c0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s68 = fp - 0x68, s88 = fp - 0x88, sa8 = fp - 0xa8, sc8 = fp - 0xc8, se0 = fp - 0xe0, s148 = fp - 0x148, s160 = fp - 0x160, s178 = fp - 0x178, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0
	let o, p: u64
	const f = p5
	const g = c != f ? f > c : d > b
	const h = g != 0 ? b : d
	const i = g != 0 ? c : f
	if ((h | i) != 0) {
		const k = c != f ? c > f : b > d
		c = k != 0 ? c : f
		const l = p7
		b = k != 0 ? b : d
		const n = p8
		st64(sc8, 0, p6, l, 0, b - h, c - i - (h > b), 0, 0, h, i, 0, 0)
		st64(s48, b, c, 0, 0)
		fn_1034c8(s180, s88, s48)
		if (ld64(s180) != 0) {
			copyr(s68, s178, 0x20)
			if (n != 0) {
				p = fn_59f70(s180, sc8, sa8, s68)
			} else {
				p = fn_59110(s180, sc8, sa8, s68)
			}
			if (ld64(s180) != 0) {
				if (ld64(s160) != 0) {
					p = fn_88360(s1b0, 0x25)
					o = ld64(s1b0)
					st64(a + 8, ld64(s1b0 + 8))
					st64(a, o)
					return p
				}
				if (ld64(s178 + 0x10) != 0) {
					p = fn_88360(s1b0, 0x25)
					o = ld64(s1b0)
					st64(a + 8, ld64(s1b0 + 8))
					st64(a, o)
					return p
				}
				if (ld64(s178 + 8) == 0) {
					st64(a + 8, ld64(s178))
					st64(a, 2)
					return p
				}
				p = fn_88360(s1b0, 0x25)
				o = ld64(s1b0)
				st64(a + 8, ld64(s1b0 + 8))
				st64(a, o)
				return p
			}
			p = fn_88360(s1a0, 0x26)
			o = ld64(s1a0)
			st64(a + 8, ld64(s1a0 + 8))
			st64(a, o)
			return p
		}
		p = fn_88360(s190, 0x26)
		const m = ld64(s190)
		st64(a + 8, ld64(s190 + 8))
		st64(a, m)
		return p
	}
	fn_85138(se0, 0x1001598b0)
	st64(s88, 0, 1, 0)
	st64(s28, s88, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x1001598b0, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(s148, s88, 0x18)
	copy(s160, se0, 0x18)
	st64(s178, 0x10015a3b9)
	st32(s148 + 0x60, 0x179e /* error::ZeroSqrtPrice */)
	st8(s148 + 0x18, 2)
	st32(s178 + 0x10, 0xb4)
	st64(s178 + 8, 0x2c)
	st64(s180, 0)
	fn_13e5a0(s1c0, s180)
	p = fn_2150(s1d0, ld64(s1c0), ld64(s1c0 + 8), 0, 0)
	const j = ld64(s1d0)
	st64(a + 8, ld64(s1d0 + 8))
	st64(a, j)
	return p
}

export function fn_5c730(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8
	let o, p: u64
	const f = p5
	const h = c != f ? c > f : b > d
	const g = c != f ? f > c : d > b
	const j = g != 0 ? c : f
	c = h != 0 ? c : f
	const i = g != 0 ? b : d
	b = h != 0 ? b : d
	const m = c - j - (i > b)
	const n = b - i
	const k = p7
	const l = p6
	if (p8 != 0) {
		st64(s60, l, k, 0, 0, n, m, 0, 0, 0, 1, 0, 0)
		p = fn_59f70(s88, s60, s40, s20)
		if (ld64(s88) == 0) {
			p = fn_88360(s98, 0x26)
			o = ld64(s98)
			st64(a + 8, ld64(s98 + 8))
			st64(a, o)
			return p
		}
	} else {
		st64(s60, l, k, 0, 0, n, m, 0, 0, 0, 1, 0, 0)
		p = fn_59110(s88, s60, s40, s20)
		if (ld64(s88) == 0) {
			p = fn_88360(s98, 0x26)
			o = ld64(s98)
			st64(a + 8, ld64(s98 + 8))
			st64(a, o)
			return p
		}
	}
	if (ld64(s88 + 0x20) != 0) {
		p = fn_88360(sa8, 0x25)
		o = ld64(sa8)
		st64(a + 8, ld64(sa8 + 8))
		st64(a, o)
		return p
	}
	if (ld64(s88 + 0x18) != 0) {
		p = fn_88360(sa8, 0x25)
		o = ld64(sa8)
		st64(a + 8, ld64(sa8 + 8))
		st64(a, o)
		return p
	}
	if (ld64(s88 + 0x10) == 0) {
		st64(a + 8, ld64(s88 + 8))
		st64(a, 2)
		return p
	}
	p = fn_88360(sa8, 0x25)
	o = ld64(sa8)
	st64(a + 8, ld64(sa8 + 8))
	st64(a, o)
	return p
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), p5 (value), p7 (value)
export function fn_5caa8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s68 = fp - 0x68, s88 = fp - 0x88, sa8 = fp - 0xa8, sc0 = fp - 0xc0, s128 = fp - 0x128, s140 = fp - 0x140, s158 = fp - 0x158, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0
	let u, w, aa, af, ag, al, ao, ap, aq, ar, at, av, aw, ax, ay, az: u64
	st64(s1e8, a)
	const h = p5
	const j = c != h ? h > c : d > b
	const i = c != h ? c > h : b > d
	const n = i != 0 ? c : h
	const g = j != 0 ? c : h
	const m = i != 0 ? b : d
	const f = j != 0 ? b : d
	if ((f | g) != 0) {
		const k = p7
		const l = p6
		st64(s1f0, p8)
		st64(s28, l, k, 0, 0)
		st64(s68, m - f, n - g - (f > m), 0, 0)
		fn_1034c8(s160, s28, s68)
		if (ld64(s160) != 1) {
			az = fn_88360(s170, 0x26)
			ay = ld64(s170)
			ax = ld64(s1e8)
			st64(ax + 0x10, ld64(s170 + 8))
			st64(ax + 8, ay)
			st64(ax, 1)
			return az
		}
		copyr(sa8, s158, 0x20)
		st64(s28, f, g, 0, 0)
		st64(s68, m, n, 0, 0)
		fn_1034c8(s160, s28, s68)
		if (ld64(s160) != 0) {
			B34: {
				copyr(s88, s158, 0x20)
				if (ld64(s1f0) != 0) {
					B40: {
						const r = ld64(s88 + 0x18)
						const q = ld64(s88 + 0x10)
						const p = ld64(s88 + 8)
						const s = ld64(sa8 + 0x18)
						const v = ld64(sa8 + 0x10)
						const t = ld64(sa8 + 8)
						const z = ld64(sa8)
						const o = ld64(s88)
						if (o != 0 || (p != 0 || (q != 0 || r != 0))) {
							B33: {
								B32: {
									if (s == 0) {
										B15: {
											u = q
											aa = p
											if (o == 0) {
												aa = p - 1
												u = q
												if (p == 0) {
													aa = -1
													u = q - 1
													if (q == 0) {
														u = -1
														w = r - 1
														ag = -1
														if (r != 0) {
															break B15
														}
														st64(s160, 0x100160990, 1, 8, 0, 0)
														// fmt "arithmetic operation overflow"
														fn_14ec00(s160, 0x10015feb8, t, v, r)
													}
												}
											}
											ag = o - 1
											w = r
										}
										const y = t + u
										const x = v + w
										const ab = z + aa
										let ac = y + (z > ab)
										const ad = y > ac
										ac = z > ab ? ac : y
										const ae = (z > ab & ad) + (t > y)
										if (ae == 0) {
											af = x
											if (v > x) {
												break B32
											}
										} else {
											af = x + ae
											if ((v > x | x > af) != 0) {
												break B32
											}
										}
										st64(s28, ag, ab, ac, af)
										az = fn_1019b8(s160, s28, s88)
										copyr(s60, s160, 0x20)
										break B33
									}
								}
								st64(s160, 0, 1, 0, 0)
								az = fn_59f70(s68, sa8, s160, s88)
								if ((ld64(s68) & 1) == 0) {
									break B40
								}
							}
							ar = 1
							ap = ld64(s48) == 0
							aq = ld64(sa8 + 0x18)
							at = ld64(sa8 + 0x10)
							av = ld64(sa8 + 8)
							ao = ld64(s60 + 0x10)
							al = ld64(s60 + 8)
							aw = ld64(s60)
							break B34
						}
					}
					az = fn_88360(s1c0, 0x26)
					ay = ld64(s1c0)
					ax = ld64(s1e8)
					st64(ax + 0x10, ld64(s1c0 + 8))
					st64(ax + 8, ay)
					st64(ax, 1)
					return az
				}
				const ah = ld64(sa8 + 8)
				const ai = ld64(sa8)
				aw = ai != 0 ? ah + 1 : ah
				const ak = ai != 0 & ah == -1
				const aj = ld64(sa8 + 0x10)
				al = aj + ak
				const am = aj > al
				al = ak != 0 ? al : aj
				const an = ld64(sa8 + 0x18)
				if (ak != 0 && (am & 1) != 0) {
					ao = an + 1
					if (ao == 0) {
						az = fn_88360(s1a0, 0x26)
						ay = ld64(s1a0)
						ax = ld64(s1e8)
						st64(ax + 0x10, ld64(s1a0 + 8))
						st64(ax + 8, ay)
						st64(ax, 1)
						return az
					}
				} else {
					ao = an
				}
				B28: {
					if (!keyeq(s88, "11111111111111111111111111111111")) {
						if (an == 0) {
							copy(s20, sa8, 0x18)
							st64(s28, 0)
							az = fn_1019b8(s160, s28, s88)
							copyr(s60, s160, 0x20)
						} else {
							st64(s160, 0, 1, 0, 0)
							az = fn_59110(s68, sa8, s160, s88)
							if ((ld64(s68) & 1) == 0) {
								break B28
							}
						}
						ap = 1
						ar = ld64(s48) == 0
						aq = ld64(s60 + 0x10)
						at = ld64(s60 + 8)
						av = ld64(s60)
						break B34
					}
				}
				az = fn_88360(s190, 0x26)
				ay = ld64(s190)
				ax = ld64(s1e8)
				st64(ax + 0x10, ld64(s190 + 8))
				st64(ax + 8, ay)
				st64(ax, 1)
				return az
			}
			if ((ap & 1) != 0 && (ao == 0 && (al == 0 && ((ar & aq == 0) == 1 && at == 0)))) {
				const au = ld64(s1e8)
				st64(au + 0x10, av)
				st64(au + 8, aw)
				st64(au, 0)
				return az
			}
			az = fn_88360(s1b0, 0x25)
			ay = ld64(s1b0)
			ax = ld64(s1e8)
			st64(ax + 0x10, ld64(s1b0 + 8))
			st64(ax + 8, ay)
			st64(ax, 1)
			return az
		}
		az = fn_88360(s180, 0x26)
		ay = ld64(s180)
		ax = ld64(s1e8)
		st64(ax + 0x10, ld64(s180 + 8))
		st64(ax + 8, ay)
		st64(ax, 1)
		return az
	}
	fn_85138(sc0, 0x1001598b0)
	st64(s28, 0, 1, 0)
	st64(s48, s28, 0x10015f818)
	st8(s48 + 0x18, 3)
	st64(s48 + 0x10, 0x20)
	st64(s60 + 8, 0)
	st64(s68, 0)
	if (fn_88558(0x1001598b0, s68) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(s128, s28, 0x18)
	copy(s140, sc0, 0x18)
	st64(s158, 0x10015a3b9)
	st32(s128 + 0x60, 0x179e /* error::ZeroSqrtPrice */)
	st8(s128 + 0x18, 2)
	st32(s158 + 0x10, 0xfa)
	st64(s158 + 8, 0x2c)
	st64(s160, 0)
	fn_13e5a0(s1d0, s160)
	az = fn_2150(s1e0, ld64(s1d0), ld64(s1d0 + 8), 0, 0)
	ay = ld64(s1e0)
	ax = ld64(s1e8)
	st64(ax + 0x10, ld64(s1e0 + 8))
	st64(ax + 8, ay)
	st64(ax, 1)
	return az
}

export function fn_5d8d8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8, se0 = fp - 0xe0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let l, r, am, an, ao, ap: u64
	st64(se0 + 0x10, p8)
	const n = p7
	const g = p6
	const f = p5
	if ((f as i32) > (b as i32)) {
		l = fn_644c8(s88, f, b as i32)
		const i = ld64(s88 + 8)
		if (ld64(s88) != 0) {
			st64(a + 0x10, ld64(s88 + 0x10))
			st64(a + 8, i)
			st64(a, 1)
			return l
		}
		st64(se0 + 8, ld64(s88 + 0x10))
		l = fn_644c8(s88, g, l)
		if (ld64(s88) != 0) {
			r = ld64(s88 + 8)
			st64(a + 0x10, ld64(s88 + 0x10))
			st64(a + 8, r)
			st64(a, 1)
			return l
		}
		const v = ld64(s88 + 0x10)
		const y = ld64(s88 + 8)
		const u = ld64(se0 + 0x10)
		if ((u as i64) > -1) {
			st64(s1000, v, n, u, 1)
		} else {
			if ((n | u ^ 0x8000000000000000) == 0) {
				l = fn_88360(sc8, 0x26)
				st64(s20 + 8, ld64(sc8 + 8))
				r = ld64(sc8)
				if (r == 2) {
					ap = ld64(s20 + 8)
					st64(a + 0x10, 0)
					st64(a + 8, ap)
					st64(a, 0)
					return l
				}
				st64(a + 0x10, ld64(s20 + 8))
				st64(a + 8, r)
				st64(a, 1)
				return l
			}
			st64(s1000, v, -n, -(u + (n != 0)), 0)
		}
		l = fn_5c0c0(s20, i, ld64(se0 + 8), y, ld64(s1000), ld64(sff8), ld64(sff8 + 8), ld64(sff8 + 0x10))
		r = ld64(s20)
		if (r == 2) {
			ap = ld64(s20 + 8)
			st64(a + 0x10, 0)
			st64(a + 8, ap)
			st64(a, 0)
			return l
		}
		st64(a + 0x10, ld64(s20 + 8))
		st64(a + 8, r)
		st64(a, 1)
		return l
	}
	if ((g as i32) > (b as i32)) {
		st64(se0, c, d)
		l = fn_644c8(s88, g, b as i32)
		const h = ld64(s88 + 8)
		if (ld64(s88) != 0) {
			st64(a + 0x10, ld64(s88 + 0x10))
			st64(a + 8, h)
			st64(a, 1)
			return l
		}
		const o = ld64(s88 + 0x10)
		const m = ld64(se0 + 0x10)
		if ((m as i64) > -1) {
			st64(s1000, o, n, m, 1)
			l = fn_5c0c0(s20, ld64(se0), ld64(se0 + 8), h, o, n, m, 1)
			r = ld64(s20)
			if (r != 2) {
				st64(a + 0x10, ld64(s20 + 8))
				st64(a + 8, r)
				st64(a, 1)
				return l
			}
		} else {
			const p = ld64(se0)
			const q = ld64(se0 + 8)
			if ((n | m ^ 0x8000000000000000) == 0) {
				l = fn_88360(sa8, 0x26)
				st64(s20 + 8, ld64(sa8 + 8))
				r = ld64(sa8)
				if (r != 2) {
					st64(a + 0x10, ld64(s20 + 8))
					st64(a + 8, r)
					st64(a, 1)
					return l
				}
			} else {
				st64(s1000, o, -n, -(m + (n != 0)), 0)
				l = fn_5c0c0(s20, p, q, h, o, -n, -(m + (n != 0)), 0)
				r = ld64(s20)
				if (r != 2) {
					st64(a + 0x10, ld64(s20 + 8))
					st64(a + 8, r)
					st64(a, 1)
					return l
				}
			}
		}
		ap = ld64(s20 + 8)
		l = fn_644c8(s88, f, l)
		const ak = ld64(s88 + 0x10)
		const al = ld64(s88 + 8)
		if (ld64(s88) != 0) {
			st64(a + 0x10, ak)
			st64(a + 8, al)
			st64(a, 1)
			return l
		}
		const w = ld64(se0 + 0x10)
		if ((w as i64) > -1) {
			st64(sff8, n, w)
			st64(s1000, ld64(se0 + 8))
			st64(sff8 + 0x10, 1)
		} else {
			const x = ld64(se0 + 8)
			if ((n | w ^ 0x8000000000000000) == 0) {
				l = fn_88360(sb8, 0x26)
				ao = ld64(sb8 + 8)
				am = ld64(sb8)
				if (am == 2) {
					st64(a + 0x10, ao)
					st64(a + 8, ap)
					st64(a, 0)
					return l
				}
				st64(a + 0x10, ao)
				st64(a + 8, am)
				st64(a, 1)
				return l
			}
			st64(s1000, x, -n)
			st64(sff8 + 8, -(ld64(se0 + 0x10) + (n != 0)))
			st64(sff8 + 0x10, 0)
		}
		l = fn_5c730(s20, al, ak, ld64(se0), ld64(s1000), ld64(sff8), ld64(sff8 + 8), ld64(sff8 + 0x10))
		ao = ld64(s20 + 8)
		am = ld64(s20)
		if (am == 2) {
			st64(a + 0x10, ao)
			st64(a + 8, ap)
			st64(a, 0)
			return l
		}
		st64(a + 0x10, ao)
		st64(a + 8, am)
		st64(a, 1)
		return l
	}
	l = fn_644c8(s88, f, b as i32)
	let j = ld64(s88 + 0x10)
	const k = ld64(s88 + 8)
	if (ld64(s88) != 0) {
		st64(a + 0x10, j)
		st64(a + 8, k)
		st64(a, 1)
		return l
	}
	st64(se0 + 8, k)
	l = fn_644c8(s88, g, l)
	const s = ld64(s88 + 0x10)
	const t = ld64(s88 + 8)
	if (ld64(s88) != 0) {
		st64(a + 0x10, s)
		st64(a + 8, t)
		st64(a, 1)
		return l
	}
	B44: {
		const z = ld64(se0 + 0x10)
		if ((z as i64) > -1) {
			let ag = ld64(se0 + 8) > t
			ag = j != s ? j > s : ag
			let af = t > ld64(se0 + 8)
			af = j != s ? s > j : af
			let ai = ld64(se0 + 8)
			ai = af != 0 ? ai : t
			if (ag == 0) {
				st64(se0 + 8, t)
			}
			const aj = af != 0 ? j : s
			j = ag != 0 ? j : s
			st64(s60, n, z)
			const ah = ld64(se0 + 8)
			st64(s50, 0, 0, ah - ai, j - aj - (ai > ah), 0, 0, 0, 1, 0, 0)
			l = fn_59f70(s88, s60, s40, s20)
			if (ld64(s88) != 0) {
				an = 0x25
				if (ld64(s88 + 0x20) != 0) {
					break B44
				}
				if (ld64(s88 + 0x18) != 0) {
					break B44
				}
				ao = ld64(s88 + 8)
				if (ld64(s88 + 0x10) == 0) {
					st64(a + 0x10, ao)
					st64(a + 8, 0)
					st64(a, 0)
					return l
				}
				break B44
			}
		} else {
			an = 0x26
			if ((n | z ^ 0x8000000000000000) == 0) {
				break B44
			}
			let ab = ld64(se0 + 8) > t
			ab = j != s ? j > s : ab
			let aa = t > ld64(se0 + 8)
			aa = j != s ? s > j : aa
			let ad = ld64(se0 + 8)
			ad = aa != 0 ? ad : t
			if (ab == 0) {
				st64(se0 + 8, t)
			}
			const ae = aa != 0 ? j : s
			j = ab != 0 ? j : s
			st64(s60, -n)
			st64(s60 + 8, -(ld64(se0 + 0x10) + (n != 0)))
			const ac = ld64(se0 + 8)
			st64(s50, 0, 0, ac - ad, j - ae - (ad > ac), 0, 0, 0, 1, 0, 0)
			l = fn_59110(s88, s60, s40, s20)
			if (ld64(s88) != 0) {
				an = 0x25
				if (ld64(s88 + 0x20) != 0) {
					break B44
				}
				if (ld64(s88 + 0x18) != 0) {
					break B44
				}
				ao = ld64(s88 + 8)
				if (ld64(s88 + 0x10) == 0) {
					st64(a + 0x10, ao)
					st64(a + 8, 0)
					st64(a, 0)
					return l
				}
				break B44
			}
		}
		an = 0x26
	}
	l = fn_88360(s98, an)
	ao = ld64(s98 + 8)
	am = ld64(s98)
	if (am == 2) {
		st64(a + 0x10, ao)
		st64(a + 8, 0)
		st64(a, 0)
		return l
	}
	st64(a + 0x10, ao)
	st64(a + 8, am)
	st64(a, 1)
	return l
}

export function fn_5e5b0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, r0: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s40 = fp - 0x40, s80 = fp - 0x80, sa0 = fp - 0xa0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s100 = fp - 0x100, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s190 = fp - 0x190, s198 = fp - 0x198
	let o, p, q, s, t, u, aj, ak, al, am, ar, at: u64
	const f = p6
	if (f != 0) {
		st64(s190, a)
		const g = p5
		const h = p7
		st64(s188, g, d)
		st64(s198, b)
		if (h != 0) {
			B17: {
				st64(s20, f, 0, 0, 0)
				st64(s80, b, c, 0, 0)
				fn_1034c8(s128, s20, s80)
				if (ld64(s128) != 0) {
					const i = ld64(s128 + 0x18)
					const j = ld64(s128 + 0x10)
					const k = ld64(s188 + 8) > d + j
					let l = g + i + k
					const m = g + i > l
					l = k != 0 ? l : g + i
					const n = (k & m) + (ld64(s188) > g + i)
					o = ld64(s128 + 0x20)
					aj = ld64(s128 + 8)
					if (n != 0) {
						p = o > o + n
						o = o + n
						if (p == 1) {
							am = 0x100160990
							st64(s80, am, 1, 8, 0, 0)
							fn_14ec00(s80, 0x10015feb8, aj, o, p)
						}
					}
					B23: {
						if (o == 0) {
							const v = l != ld64(s188)
							let w = ld64(s188) > l ? 0xffffffffffffffff : v
							if (w == 0) {
								const x = d + j != ld64(s188 + 8)
								w = (k & 1) != 0 ? 0xffffffffffffffff : x
								if (w == 0) {
									break B23
								}
							}
							if ((w as u8) >= 2) {
								break B17
							}
						}
					}
					st64(s100 + 8, c)
					st64(s100, ld64(s198))
					st64(sf0, 0, 0)
					st64(s40 + 0x10, ld64(s188))
					st64(s40 + 8, ld64(s188 + 8))
					st64(s40 + 0x18, 0)
					st64(s40, 0)
					st64(s20, aj, d + j, l, o)
					r0 = fn_59f70(s80, s40, s100, s20)
					aj = undef
					o = undef
					p = undef
					if (ld64(s80) != 1) {
						r0 = fn_88360(s178, 0x26)
						const ao = ld64(s178)
						const an = ld64(s190)
						st64(an + 0x10, ld64(s178 + 8))
						st64(an + 8, ao)
						st64(an, 1)
						return r0
					}
					if ((ld64(s80 + 0x18) | ld64(s80 + 0x20)) == 0) {
						const aq = ld64(s80 + 8)
						const ap = ld64(s190)
						st64(ap + 0x10, ld64(s80 + 0x10))
						st64(ap + 8, aq)
						st64(ap, 0)
						return r0
					}
					am = 0x100160970
					st64(s80, am, 1, 8, 0, 0)
					fn_14ec00(s80, 0x10015feb8, aj, o, p)
				}
			}
			st64(se0 + 8, c)
			st64(se0, ld64(s198))
			st64(sd0, 0, 0)
			st64(s128 + 0x10, ld64(s188))
			st64(s128 + 8, ld64(s188 + 8))
			st64(s128 + 0x18, 0)
			st64(s128, 0)
			fn_1019b8(s80, s128, se0)
			const y = ld64(s80)
			const ab = y > y + f
			const z = ld64(s80 + 8)
			let aa = z + 1
			const ac = aa == 0
			const ad = ld64(s80 + 0x10)
			let ae = ad + (ab & ac)
			const af = ad > ae
			ae = (ab & ac) != 0 ? ae : ad
			aa = ab != 0 ? aa : z
			let ag = ld64(s80 + 0x18)
			if ((ab & ac) != 0 && (af & 1) != 0) {
				ag = ag + 1
				if (ag == 0) {
					r0 = fn_88360(s168, 0x26)
					at = ld64(s168)
					ar = ld64(s190)
					st64(ar + 0x10, ld64(s168 + 8))
					st64(ar + 8, at)
					st64(ar, 1)
					return r0
				}
			}
			st64(sc0, y + f, aa, ae, ag)
			st64(s80 + 0x10, ld64(s188))
			st64(s80 + 8, ld64(s188 + 8))
			st64(s80 + 0x18, 0)
			st64(s80, 0)
			r0 = fn_66528(s20, s80, sc0)
			aj = undef
			o = undef
			p = undef
			if ((ld64(s10) | ld64(s10 + 8)) == 0) {
				const ai = ld64(s20)
				const ah = ld64(s190)
				st64(ah + 0x10, ld64(s20 + 8))
				st64(ah + 8, ai)
				st64(ah, 0)
				return r0
			}
		} else {
			st64(s20, f, 0, 0, 0)
			st64(s128, b, c, 0, 0)
			fn_1034c8(s80, s20, s128)
			if (ld64(s80) == 0) {
				r0 = fn_88360(s138, 0x26)
				at = ld64(s138)
				ar = ld64(s190)
				st64(ar + 0x10, ld64(s138 + 8))
				st64(ar + 8, at)
				st64(ar, 1)
				return r0
			}
			B27: {
				B11: {
					B10: {
						u = ld64(s80 + 0x20)
						t = ld64(s80 + 0x18)
						const r = ld64(s80 + 0x10)
						q = ld64(s80 + 8)
						if (q != 0) {
							s = (r > ld64(s188 + 8)) + (ld64(s188 + 8) == r)
							al = ~r + d
							if (s == 0) {
								break B10
							}
						} else {
							s = r > ld64(s188 + 8)
							al = d - r
							if (s == 0) {
								break B10
							}
						}
						ak = g - t - s
						if (((s > g - t) + (t > ld64(s188)) | u) == 0) {
							break B27
						}
						break B11
					}
					ak = g - t
					if ((t > ld64(s188) | u) == 0) {
						break B27
					}
				}
				r0 = fn_88360(s148, 0x26)
				at = ld64(s148)
				ar = ld64(s190)
				st64(ar + 0x10, ld64(s148 + 8))
				st64(ar + 8, at)
				st64(ar, 1)
				return r0
			}
			st64(sa0, -q, al, ak, 0)
			st64(s20 + 8, c)
			st64(s20, ld64(s198))
			st64(s10, 0, 0)
			st64(s128 + 0x10, ld64(s188))
			st64(s128 + 8, ld64(s188 + 8))
			st64(s128 + 0x18, 0)
			st64(s128, 0)
			r0 = fn_59f70(s80, s128, s20, sa0)
			aj = undef
			o = undef
			p = undef
			if (ld64(s80) == 0) {
				r0 = fn_88360(s158, 0x26)
				at = ld64(s158)
				ar = ld64(s190)
				st64(ar + 0x10, ld64(s158 + 8))
				st64(ar + 8, at)
				st64(ar, 1)
				return r0
			}
			if ((ld64(s80 + 0x18) | ld64(s80 + 0x20)) == 0) {
				const av = ld64(s80 + 8)
				const au = ld64(s190)
				st64(au + 0x10, ld64(s80 + 0x10))
				st64(au + 8, av)
				st64(au, 0)
				return r0
			}
		}
		am = 0x100160970
		st64(s80, am, 1, 8, 0, 0)
		fn_14ec00(s80, 0x10015feb8, aj, o, p)
	}
	st64(a + 8, b, c)
	st64(a, 0)
	return r0
}

export function fn_5f140(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, r0: u64): u64 {
	const s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sb8 = fp - 0xb8
	let v: u64
	let g = a
	const f = p6
	if (f != 0) {
		st64(sa8, b)
		const h = p5
		if (p7 != 0) {
			st64(s40 + 8, f)
			st64(s60, d, h)
			st64(s40, 0)
			fn_100918(s30, s40, s60)
			const j = ld64(s30)
			const i = ld64(sa8)
			let l = i > i + j
			const k = ld64(s30 + 8)
			const m = c + k + l
			l = m != c ? c > m : l
			if ((l & 1) != 0) {
				r0 = fn_88360(sa0, 0x26)
				v = ld64(sa0)
				st64(g + 0x10, ld64(sa0 + 8))
				st64(g + 8, v)
				st64(g, 1)
				return r0
			}
			r0 = fn_88360(s90, 0x26)
			const n = ld64(sa8)
			const p = ld64(s90 + 8)
			const o = ld64(s90)
			st64(g + 8, j + n, k + c + (j > j + n))
			st64(g, 0)
			if (o != 0) {
				void ld64(p)
				void ld8(p + 0x38)
				return r0
			}
			void ld64(p)
			void ld8(p + 0x50)
			return r0
		}
		st64(sb8, g)
		st64(s50, 0, f, d, h)
		fn_100918(s30, s50, s40)
		st64(sb0, ld64(s30 + 8))
		const q = ld64(s30)
		fn_100918(s30, s50, s40)
		let r = 1
		if (ld64(s30 + 0x18) == 0) {
			r = ld64(s30 + 0x10) != 0
		}
		const s = q + r
		const u = ld64(sa8)
		g = ld64(sb8)
		let t = ld64(sb0)
		if (q > s) {
			t = t + 1
			if (t == 0) {
				st64(s30, 0x100160990, 1, 8, 0, 0)
				// fmt "arithmetic operation overflow"
				fn_14ec00(s30, 0x10015fe28, t)
			}
		}
		if ((c != t ? t > c : s > u) != 0) {
			r0 = fn_88360(s80, 0x26)
			v = ld64(s80)
			st64(g + 0x10, ld64(s80 + 8))
			st64(g + 8, v)
			st64(g, 1)
			return r0
		}
		st64(sb0, t)
		r0 = fn_88360(s70, 0x26)
		const x = ld64(s70 + 8)
		const w = ld64(s70)
		st64(g + 8, u - s)
		st64(g + 0x10, c - ld64(sb0) - (s > u))
		st64(g, 0)
		if (w != 0) {
			void ld64(x)
			void ld8(x + 0x38)
			return r0
		}
		void ld64(x)
		void ld8(x + 0x50)
		return r0
	}
	st64(g + 8, b, c)
	st64(g, 0)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: p7 (value)
export function fn_5f6e8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s1000 = fp - 0x1000
	let j, k: u64
	const f = c + (b >= 0x100013b50)
	if ((f != 0xfffec4b2 ? 0xfffec4b1 > f - 1 : 0x845c1aa84e681c4b > b + 0xfffffffefffec4b0) != 0) {
		const g = p5
		if ((d | g) == 0) {
			fn_85138(s78, 0x100159878)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (fn_88558(0x100159878, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copy(sf8, s78, 0x30)
			st64(s118 + 8, 0x10015a3e5)
			st32(sf8 + 0x78, 0x179f /* error::ZeroLiquidity */)
			st8(sf8 + 0x30, 2)
			st32(s118 + 0x18, 0x82)
			st64(s118 + 0x10, 0x2d)
			st64(s118, 0)
			fn_13e5a0(s138, s118)
			k = fn_2150(s148, ld64(s138), ld64(s138 + 8), 0, 0)
			j = ld64(s148)
			st64(a + 0x10, ld64(s148 + 8))
			st64(a + 8, j)
			st64(a, 1)
			return k
		}
		const h = p7
		const i = p6
		if (h != 0) {
			st64(s1000, g, i, 1)
			return fn_5e5b0(a, b, c, d, ld64(s1000), ld64(s1000 + 8), ld64(s1000 + 0x10), h)
		}
		st64(s1000, g, i, 1)
		return fn_5f140(a, b, c, d, ld64(s1000), ld64(s1000 + 8), ld64(s1000 + 0x10), h)
	}
	fn_85138(s78, 0x10015985c)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x10015985c, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a3e5)
	st32(sf8 + 0x78, 0x177c /* error::SqrtPriceX64 */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0x7d)
	st64(s118 + 0x10, 0x2d)
	st64(s118, 0)
	k = fn_13e5a0(s128, s118)
	j = ld64(s128)
	st64(a + 0x10, ld64(s128 + 8))
	st64(a + 8, j)
	st64(a, 1)
	return k
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: p7 (value)
export function fn_5fc40(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s1000 = fp - 0x1000
	let j, k: u64
	const f = c + (b >= 0x100013b50)
	if ((f != 0xfffec4b2 ? 0xfffec4b1 > f - 1 : 0x845c1aa84e681c4b > b + 0xfffffffefffec4b0) != 0) {
		const g = p5
		if ((d | g) == 0) {
			fn_85138(s78, 0x100159878)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (fn_88558(0x100159878, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copy(sf8, s78, 0x30)
			st64(s118 + 8, 0x10015a3e5)
			st32(sf8 + 0x78, 0x179f /* error::ZeroLiquidity */)
			st8(sf8 + 0x30, 2)
			st32(s118 + 0x18, 0x9c)
			st64(s118 + 0x10, 0x2d)
			st64(s118, 0)
			fn_13e5a0(s138, s118)
			k = fn_2150(s148, ld64(s138), ld64(s138 + 8), 0, 0)
			j = ld64(s148)
			st64(a + 0x10, ld64(s148 + 8))
			st64(a + 8, j)
			st64(a, 1)
			return k
		}
		const h = p7
		const i = p6
		if (h != 0) {
			st64(s1000, g, i, 0)
			return fn_5f140(a, b, c, d, ld64(s1000), ld64(s1000 + 8), ld64(s1000 + 0x10), h)
		}
		st64(s1000, g, i, 0)
		return fn_5e5b0(a, b, c, d, ld64(s1000), ld64(s1000 + 8), ld64(s1000 + 0x10), h)
	}
	fn_85138(s78, 0x10015985c)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x10015985c, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a3e5)
	st32(sf8 + 0x78, 0x177c /* error::SqrtPriceX64 */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0x97)
	st64(s118 + 0x10, 0x2d)
	st64(s118, 0)
	k = fn_13e5a0(s128, s118)
	j = ld64(s128)
	st64(a + 0x10, ld64(s128 + 8))
	st64(a + 8, j)
	st64(a, 1)
	return k
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: p5 (value), p10 (value)
export function fn_60198(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s288 = fp - 0x288, s290 = fp - 0x290, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8, s2b0 = fp - 0x2b0, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2c8 = fp - 0x2c8, s2d0 = fp - 0x2d0, s2d8 = fp - 0x2d8, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let w, y, aa, ab, ad, af, ag, ah, ai, aj, ak, al, am, ao, ap, av, aw, ax, ay, bh, bs, bu, bv, ca: u64
	let r = d
	st64(s288 + 0x10, c)
	let i = b
	let n = a
	st64(s288, p6, p7)
	let f = p5
	const h = p12
	let m = p11
	let k = p9
	const g = p8
	let j = p10
	st64(s298, f)
	st64(s2b0, g)
	st64(s2d0, h)
	st64(s290, b)
	if (j != 0) {
		w = g
		if (h != 0) {
			const v = m
			st64(s2c0, j)
			const u = r
			const t = n
			const s = k
			if ((k as u32) > 0xf4240) {
				fn_154788(0x10015ff18, k, f, m, w)
			}
			__multi3_159030(s160, (0xf4240 - s) as u32, 0, ld64(s2b0), 0)
			copyr(s60, s160, 0x10)
			st64(s48, 0xf4240, 0)
			fn_100918(s118, s60, s48)
			w = ld64(s118)
			k = s
			n = t
			r = u
			j = ld64(s2c0)
			f = ld64(s298)
			m = v
			i = ld64(s290)
			if (ld64(s118 + 8) != 0) {
				ax = fn_88360(s170, 0x26)
				av = ld64(s170)
				st64(n + 0x10, ld64(s170 + 8))
				st64(n + 8, av)
				st64(n, 1)
				return ax
			}
		}
	} else {
		w = g
		if (h == 0) {
			const l = k as u32
			if (l > 0xf4240) {
				fn_154788(0x10015ff00, k, f, m, w)
			}
			if (l == 0xf4240) {
				ax = fn_88360(s150, 0x26)
				av = ld64(s150)
				st64(n + 0x10, ld64(s150 + 8))
				st64(n + 8, av)
				st64(n, 1)
				return ax
			}
			st64(s2a8, m)
			st64(s2c0, j)
			st64(s2a0, n)
			__multi3_159030(s140, ld64(s2b0), 0, 0xf4240, 0)
			const o = (0xf4240 - k) as u32
			const p = ld64(s140)
			const q = o + p - 1
			st64(s48, o)
			st64(s60, q)
			st64(s60 + 8, (p > q) + ld64(s140 + 8))
			st64(s48 + 8, 0)
			fn_100918(s118, s60, s48)
			f = ld64(s298)
			n = ld64(s2a0)
			j = ld64(s2c0)
			m = ld64(s2a8)
			i = ld64(s290)
			if (ld64(s118 + 8) != 0) {
				ax = fn_88360(s150, 0x26)
				av = ld64(s150)
				st64(n + 0x10, ld64(s150 + 8))
				st64(n + 8, av)
				st64(n, 1)
				return ax
			}
			w = ld64(s118)
		}
	}
	B20: {
		B18: {
			B17: {
				st64(s2b8, w)
				st64(s2d8, k)
				st64(s2a8, m)
				st64(sff8 + 0x10, m)
				copyr(sff8, s288, 0x10)
				st64(s1000, ld64(s288 + 0x10))
				const ac = f
				ax = fn_5caa8(s130, r, f, i, ld64(s1000), ld64(sff8), ld64(sff8 + 8), m)
				const x = ld64(s130)
				st64(s2a0, n)
				st64(s2c8, r)
				if (x != 0) {
					st64(s2c0, j)
					fn_85138(s78, 0x1001598c8)
					st64(s60, 0, 1, 0)
					st64(s28, s60, 0x10015f818)
					st8(s28 + 0x18, 3)
					st64(s28 + 0x10, 0x20)
					st64(s48 + 0x10, 0)
					st64(s48, 0)
					if (fn_88558(0x1001598c8, s48) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
					}
					B43: {
						B28: {
							B42: {
								B40: {
									copy(sf8, s78, 0x30)
									st64(s118 + 8, 0x10015a412)
									st32(sf8 + 0x78, 0x1795 /* error::MaxTokenOverflow */)
									st8(sf8 + 0x30, 2)
									st32(s118 + 0x18, 0x59)
									st64(s118 + 0x10, 0x27)
									st64(s118, 0)
									fn_13e5a0(s180, s118)
									ab = ld64(s130 + 0x10)
									aa = ld64(s180 + 8)
									const z = ld64(s180)
									y = ld64(s130 + 8)
									if (y != z) {
										aw = 0
										ai = ld64(s288 + 0x10)
										if (z != 0) {
											break B40
										}
									} else {
										if ((z & 1) != 0) {
											aw = fn_13e920(ab, aa)
											ai = ld64(s288 + 0x10)
											break B40
										}
										ai = ld64(s288 + 0x10)
										aw = ld32(ab + 0x98) == ld32(aa + 0x98)
									}
									void ld64(aa)
									if (ld8(aa + 0x50) != 0) {
										break B28
									}
									if (ld64(aa + 0x70) == 0) {
										break B28
									}
									break B42
								}
								void ld64(aa)
								if (ld8(aa + 0x38) != 0) {
									break B28
								}
								if (ld64(aa + 0x58) == 0) {
									break B28
								}
							}
							ax = aw & 1
							if (ax != 0) {
								break B43
							}
							ay = ld64(s2a0)
							st64(ay + 0x10, ab)
							st64(ay + 8, y)
							st64(ay, 1)
							return ax
						}
						ax = aw & 1
						if (ax == 0) {
							ay = ld64(s2a0)
							st64(ay + 0x10, ab)
							st64(ay + 8, y)
							st64(ay, 1)
							return ax
						}
					}
					if (y != 0) {
						j = ld64(s2c0)
						void ld64(ab)
						void ld8(ab + 0x38)
					} else {
						j = ld64(s2c0)
						void ld64(ab)
						void ld8(ab + 0x50)
					}
					ag = ld64(s288 + 8)
					if (j != 0) {
						break B17
					}
				} else {
					af = ac
					const ae = ld64(s130 + 0x10)
					ad = ld64(s130 + 8)
					st64(s2c0, ae)
					ap = ac
					ai = ld64(s288 + 0x10)
					ag = ld64(s288 + 8)
					if (ld64(s2b8) >= (j != 0 ? ad : ae)) {
						break B20
					}
					if (j != 0) {
						break B17
					}
				}
				st64(sff8 + 8, ld64(s2a8))
				st64(sff8, ld64(s2b8))
				st64(s1000, ag)
				ah = ld64(s290)
				ak = ai
				aj = ld64(s288)
				ax = fn_5fc40(s118, ah, ai, aj, ag, ld64(sff8), ld64(sff8 + 8))
				al = ld64(s118 + 0x10)
				am = ld64(s118 + 8)
				if (ld64(s118) != 0) {
					bh = ld64(s2a0)
					st64(bh + 0x10, al)
					st64(bh + 8, am)
					st64(bh, 1)
					return ax
				}
				break B18
			}
			st64(sff8 + 8, ld64(s2a8))
			st64(sff8, ld64(s2b8))
			st64(s1000, ag)
			ah = ld64(s290)
			ak = ai
			aj = ld64(s288)
			ax = fn_5f6e8(s118, ah, ai, aj, ag, ld64(sff8), ld64(sff8 + 8))
			al = ld64(s118 + 0x10)
			am = ld64(s118 + 8)
			if (ld64(s118) != 0) {
				bh = ld64(s2a0)
				st64(bh + 0x10, al)
				st64(bh + 8, am)
				st64(bh, 1)
				return ax
			}
		}
		st64(sff8 + 0x10, ld64(s2a8))
		st64(sff8 + 8, ld64(s288 + 8))
		st64(s1000, ak, aj)
		r = am
		ax = fn_5caa8(s118, am, al, ah, ak, aj, ld64(sff8 + 8), ld64(sff8 + 0x10))
		ap = al
		st64(s2c0, ld64(s118 + 0x10))
		ad = ld64(s118 + 8)
		af = ld64(s298)
		if (ld64(s118) != 0) {
			const an = ld64(s2a0)
			st64(an + 0x10, ld64(s2c0))
			st64(an + 8, ad)
			st64(an, 1)
			return ax
		}
	}
	if (ld64(s2a8) != 0) {
		ao = ld64(s2c8)
		if ((ap != af ? af > ap : ao > r) != 0) {
			const aq = af
			const ar = ap
			ErrorCode_name(s78, 0x100159858, ao, ap, af)
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
			st64(s118 + 8, 0x10015a412)
			st32(sf8 + 0x78, 0x9ca /* anchor::RequireGteViolated */)
			st8(sf8 + 0x30, 2)
			st32(s118 + 0x18, 0x80)
			st64(s118 + 0x10, 0x27)
			st64(s118, 0)
			fn_13e5a0(s260, s118)
			const au = ld64(s260 + 8)
			const at = ld64(s260)
			st64(sff8 + 8, aq)
			st64(sff8, ld64(s2c8))
			st64(s1000, ar)
			ax = fn_2be8(s270, at, au, r, ar, ld64(sff8), aq)
			bv = ld64(s270)
			bu = ld64(s2a0)
			st64(bu + 0x10, ld64(s270 + 8))
			st64(bu + 8, bv)
			st64(bu, 1)
			return ax
		}
	} else {
		ao = ld64(s2c8)
		if ((ap != af ? ap > af : r > ao) != 0) {
			const ba = af
			const az = ap
			ErrorCode_name(s78, 0x100159858, ao, ap, af)
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
			st64(s118 + 8, 0x10015a412)
			st32(sf8 + 0x78, 0x9ca /* anchor::RequireGteViolated */)
			st8(sf8 + 0x30, 2)
			st32(s118 + 0x18, 0x82)
			st64(s118 + 0x10, 0x27)
			st64(s118, 0)
			fn_13e5a0(s190, s118)
			const bc = ld64(s190 + 8)
			const bb = ld64(s190)
			st64(s1000, ba, r, az)
			ax = fn_2be8(s1a0, bb, bc, ld64(s2c8), ba, r, az)
			bv = ld64(s1a0)
			bu = ld64(s2a0)
			st64(bu + 0x10, ld64(s1a0 + 8))
			st64(bu + 8, bv)
			st64(bu, 1)
			return ax
		}
	}
	B72: {
		B55: {
			if (j != 0) {
				if (ld64(s2d0) != 0) {
					if ((r ^ ld64(s2c8) | ap ^ af) == 0) {
						const bd = ld64(s2d8)
						if ((bd as u32) > 0xf4240) {
							fn_154788(0x10015ff48, bd, ao, ap, af)
						}
						if ((bd as u32) != 0xf4240) {
							__multi3_159030(s240, ad, 0, bd as u32, 0)
							const be = (0xf4240 - bd) as u32
							const bf = ld64(s240)
							const bg = be + bf - 1
							st64(s48, be)
							st64(s60, bg)
							st64(s60 + 8, (bf > bg) + ld64(s240 + 8))
							st64(s48 + 8, 0)
							ax = fn_100918(s118, s60, s48)
							if (ld64(s118 + 8) == 0) {
								break B55
							}
						}
						ax = fn_88360(s250, 0x26)
						bv = ld64(s250)
						bu = ld64(s2a0)
						st64(bu + 0x10, ld64(s250 + 8))
						st64(bu + 8, bv)
						st64(bu, 1)
						return ax
					}
					const bq = ld64(s2b0)
					bs = bq - ad
					ca = ld64(s2c0)
					if (ad > bq) {
						ax = fn_88360(s230, 0x26)
						bv = ld64(s230)
						bu = ld64(s2a0)
						st64(bu + 0x10, ld64(s230 + 8))
						st64(bu + 8, bv)
						st64(bu, 1)
						return ax
					}
					break B72
				}
				const bx = af
				const bw = ap
				__multi3_159030(s200, ld64(s2c0), 0, ld64(s2d8) as u32, 0)
				const bo = ld64(s200)
				st64(s60, bo + 0xf423f)
				st64(s60 + 8, (bo > bo + 0xf423f) + ld64(s200 + 8))
				st64(s48, 0xf4240, 0)
				ax = fn_100918(s118, s60, s48)
				if (ld64(s118 + 8) == 0) {
					bs = ld64(s118)
					const br = ld64(s2c0)
					if (bs > br) {
						ax = fn_88360(s220, 0x26)
						bv = ld64(s220)
						bu = ld64(s2a0)
						st64(bu + 0x10, ld64(s220 + 8))
						st64(bu + 8, bv)
						st64(bu, 1)
						return ax
					}
					const by = br - bs
					ap = bw
					ca = by
					if ((r ^ ld64(s2c8) | bw ^ bx) == 0) {
						break B72
					}
					ca = by
					ad = ld64(s2b0)
					break B72
				}
				ax = fn_88360(s210, 0x26)
				bv = ld64(s210)
				bu = ld64(s2a0)
				st64(bu + 0x10, ld64(s210 + 8))
				st64(bu + 8, bv)
				st64(bu, 1)
				return ax
			}
			const bk = ld64(s2d8)
			if (ld64(s2d0) != 0) {
				const bj = ld64(s2b0)
				const bi = ld64(s2c0)
				if (bi >= bj) {
					st64(s2c0, bj)
				}
				if ((bk as u32) > 0xf4240) {
					fn_154788(0x10015ff30, bk, bi, ap, af)
				}
				if ((bk as u32) != 0xf4240) {
					__multi3_159030(s1e0, ad, 0, bk as u32, 0)
					const bl = (0xf4240 - bk) as u32
					const bm = ld64(s1e0)
					const bn = bl + bm - 1
					st64(s48, bl)
					st64(s60, bn)
					st64(s60 + 8, (bm > bn) + ld64(s1e0 + 8))
					st64(s48 + 8, 0)
					ax = fn_100918(s118, s60, s48)
					if (ld64(s118 + 8) == 0) {
						break B55
					}
				}
				ax = fn_88360(s1f0, 0x26)
				bv = ld64(s1f0)
				bu = ld64(s2a0)
				st64(bu + 0x10, ld64(s1f0 + 8))
				st64(bu + 8, bv)
				st64(bu, 1)
				return ax
			}
			const bz = ap
			__multi3_159030(s1b0, ld64(s2c0), 0, bk as u32, 0)
			const bp = ld64(s1b0)
			st64(s60, bp + 0xf423f)
			st64(s60 + 8, (bp > bp + 0xf423f) + ld64(s1b0 + 8))
			st64(s48, 0xf4240, 0)
			ax = fn_100918(s118, s60, s48)
			if (ld64(s118 + 8) == 0) {
				bs = ld64(s118)
				const bt = ld64(s2c0)
				if (bs > bt) {
					ax = fn_88360(s1d0, 0x26)
					bv = ld64(s1d0)
					bu = ld64(s2a0)
					st64(bu + 0x10, ld64(s1d0 + 8))
					st64(bu + 8, bv)
					st64(bu, 1)
					return ax
				}
				ca = bt - bs
				ap = bz
				if (ca > ld64(s2b0)) {
					ca = ld64(s2b0)
					bs = bt - ca
					break B72
				}
				break B72
			}
			ax = fn_88360(s1c0, 0x26)
			bv = ld64(s1c0)
			bu = ld64(s2a0)
			st64(bu + 0x10, ld64(s1c0 + 8))
			st64(bu + 8, bv)
			st64(bu, 1)
			return ax
		}
		bs = ld64(s118)
		ca = ld64(s2c0)
	}
	const cb = ld64(s2a0)
	st64(cb + 8, r)
	st64(cb + 0x28, bs)
	st64(cb + 0x20, ca)
	st64(cb + 0x18, ad)
	st64(cb + 0x10, ap)
	st64(cb, 0)
	return ax
}

export function fn_61ab8(a: u64, b: u64, c: u64) {
	let h, i, j: u64
	let f = c as u16
	const g = f
	if (0 > (b as i32)) {
		if ((b as u32) == 0x80000000) {
			fn_154838(0x10015ff90, b, c, g * 0x7800, 0x80000000)
		}
		c = c as u16
		if (c == 0) {
			fn_1548e8(0x10015ff60, b, c, g * 0x7800, 0x80000000)
		}
		let l = (-b as u32) / (g * 0x7800)
		const m = l * (g * 0x7800)
		if (((-b - m) as u32) != 0) {
			l = (l as i32) + 1
			const n = l as i32
			if (n != l) {
				fn_154730(0x10015ffa8, n, m, g * 0x7800, l)
			}
		}
		h = g * 0x7800 * (l as i32)
		i = h << 0x20
		f = sar(i, 0x20)
		if (f != h) {
			fn_1547e0(0x10015ff78, i, h, g * 0x7800, f)
		}
		const o = i >> 0x20
		if (o == 0x80000000) {
			fn_154838(0x10015ffd8, o, h, g * 0x7800, 0x80000000)
		}
		h = -h
		j = (h as i32) + g * 0x7800
		const p = j as i32
		if (p != j) {
			fn_154730(0x10015fff0, j, h, p, 0x80000000)
		}
		st32(a + 4, j)
		st32(a, h)
	} else {
		if (f == 0) {
			fn_1548e8(0x10015ff60, b, c, g * 0x7800, f)
		}
		h = g * 0x7800 * (((b as u32) / (g * 0x7800)) as i32)
		i = h as i32
		if (i != h) {
			fn_1547e0(0x10015ff78, i, h, g * 0x7800, f)
		}
		j = (h as i32) + g * 0x7800
		const k = j as i32
		if (k != j) {
			fn_154730(0x10015ffc0, j, h, k, f)
		}
		st32(a + 4, j)
		st32(a, h)
	}
}

export function fn_61df8(a: u64, b: u64, r7: u64): u64 {
	const s68 = fp - 0x68, s98 = fp - 0x98, sb0 = fp - 0xb0
	let m = a
	st64(s68 + 0x20, ld64(b + 0x78))
	st64(s68 + 0x28, ld64(b + 0x70))
	st64(s68 + 0x38, ld64(b + 0x68))
	const l = ld64(b + 0x60)
	st64(s68 + 0x40, ld64(b + 0x58))
	const k = ld64(b + 0x50)
	const j = ld64(b + 0x48)
	st64(s68 + 0x58, ld64(b + 0x40))
	st64(s68 + 0x48, ld64(b + 0x38))
	st64(s68 + 0x30, ld64(b + 0x30))
	st64(s68 + 0x50, ld64(b + 0x28))
	st64(s68 + 0x60, ld64(b + 0x20))
	const i = ld64(b + 0x18)
	const h = ld64(b + 0x10)
	const g = ld64(b + 8)
	const f = ld64(b)
	if (f == 0 && (g == 0 && (h == 0 && (i == 0 && (ld64(s68 + 0x60) == 0 && (ld64(s68 + 0x50) == 0 && (ld64(s68 + 0x30) == 0 && (ld64(s68 + 0x48) == 0 && (ld64(s68 + 0x58) == 0 && (j == 0 && (k == 0 && (ld64(s68 + 0x40) == 0 && (l == 0 && (ld64(s68 + 0x38) == 0 && ld64(s68 + 0x28) == 0)))))))))))))) {
		st64(s68 + 0x18, 0)
		if (ld64(s68 + 0x20) == 0) {
			st16(m + 2, r7)
			st16(m, ld64(s68 + 0x18))
			return m
		}
	}
	st64(s68, i, m, h)
	const n = ld64(s68 + 0x20) | ld64(s68 + 0x28) | ld64(s68 + 0x38)
	const o = n | l | ld64(s68 + 0x40)
	st64(s98 + 0x10, j)
	const p = o | k | j
	const q = p | ld64(s68 + 0x58) | ld64(s68 + 0x48)
	const r = q | ld64(s68 + 0x30)
	st64(sb0 + 0x10, n == 0)
	const s = r | ld64(s68 + 0x50)
	st64(s98 + 0x18, 1)
	if (o != 0) {
		st64(s98 + 0x18, 0)
	}
	const t = s | ld64(s68 + 0x60)
	st64(s98 + 0x20, 1)
	if (p != 0) {
		st64(s98 + 0x20, 0)
	}
	const u = ld64(s68)
	st64(s98 + 0x28, 1)
	if (q != 0) {
		st64(s98 + 0x28, 0)
	}
	const v = t | u | ld64(s68 + 0x10)
	st64(s98, s == 0, (t | u) == 0)
	const w = (v | g) == 0
	m = ld64(s68 + 8)
	st64(s68 + 0x18, 1)
	if (f == 0 && (w & 1) != 0) {
		st16(m + 2, 0x400)
		st16(m, ld64(s68 + 0x18))
		return m
	}
	const x = ld64(s68 + 0x28)
	let y = x != 0 ? 0x40 : 0x80
	st64(sb0 + 8, 0x100)
	const z = ld64(s68 + 0x20)
	if (l != 0) {
		st64(sb0, y, 0xc0)
		y = ld64(sb0)
	}
	y = z != 0 ? 0 : y
	if (l != 0) {
		st64(s68 + 0x40, l)
	}
	if (x != 0) {
		st64(s68 + 0x38, x)
	}
	st64(s68 + 0x28, g)
	if (z != 0) {
		st64(s68 + 0x38, z)
	}
	const aa = ld64(sb0 + 0x10)
	const ad = ld64(s98 + 0x20)
	if ((aa & 1) == 0) {
		st64(sb0 + 8, y)
	}
	const ab = ld64(s98 + 0x18)
	if ((aa & 1) == 0) {
		st64(s68 + 0x40, ld64(s68 + 0x38))
	}
	const af = ld64(s68 + 0x30)
	let ae = k != 0 ? 0x140 : 0x180
	if (k != 0) {
		st64(s98 + 0x10, k)
	}
	if ((ab & 1) == 0) {
		ae = ld64(sb0 + 8)
	}
	const al = ld64(s68 + 0x10)
	if ((ab & 1) == 0) {
		st64(s98 + 0x10, ld64(s68 + 0x40))
	}
	let ah = ld64(s68 + 0x58) != 0 ? 0x1c0 : 0x200
	const ac = ld64(s68 + 0x58)
	if (ac != 0) {
		st64(s68 + 0x48, ac)
	}
	ah = (ad & 1) != 0 ? ah : ae
	if ((ad & 1) == 0) {
		st64(s68 + 0x48, ld64(s98 + 0x10))
	}
	let ao = u
	let ak = af != 0 ? 0x240 : 0x280
	const ag = ld64(s98 + 0x28)
	if (af != 0) {
		st64(s68 + 0x50, af)
	}
	ak = (ag & 1) != 0 ? ak : ah
	const am = ld64(s98 + 8)
	if ((ag & 1) == 0) {
		st64(s68 + 0x50, ld64(s68 + 0x48))
	}
	const ai = ld64(s68 + 0x60)
	ao = ai != 0 ? ai : ao
	const aj = ld64(s98)
	const an = (aj & 1) != 0 ? ai != 0 ? 0x2c0 : 0x300 : ak
	const ap = ld64(s68 + 0x28)
	if ((aj & 1) != 0) {
		st16(m + 2, ((w & 1) != 0 ? 0x3c0 : (am & 1) != 0 ? al != 0 ? 0x340 : 0x380 : an) | clz((w & 1) != 0 ? f : (am & 1) != 0 ? al != 0 ? al : ap : ao))
		st16(m, ld64(s68 + 0x18))
		return m
	}
	ao = ld64(s68 + 0x50)
	st16(m + 2, ((w & 1) != 0 ? 0x3c0 : (am & 1) != 0 ? al != 0 ? 0x340 : 0x380 : an) | clz((w & 1) != 0 ? f : (am & 1) != 0 ? al != 0 ? al : ap : ao))
	st16(m, ld64(s68 + 0x18))
	return m
}

export function fn_626b0(a: u64, b: u64): u64 {
	const s98 = fp - 0x98
	let aw: u64
	st64(s98 + 0x68, a)
	const h = ld64(b + 0x10)
	const g = ld64(b + 8)
	const f = ld64(b)
	st64(s98 + 0x50, f)
	st64(s98 + 0x10, g)
	st64(s98 + 0x38, h)
	const i = f | g | h
	const k = ld64(b + 0x20)
	const j = ld64(b + 0x18)
	st64(s98 + 0x40, k)
	const l = i | j | k
	const n = ld64(b + 0x30)
	const m = ld64(b + 0x28)
	st64(s98 + 0x18, m)
	st64(s98 + 0x48, n)
	const o = l | m | n
	st64(s98 + 0x78, ld64(b + 0x48))
	const s = ld64(b + 0x50)
	const q = ld64(b + 0x40)
	const p = ld64(b + 0x38)
	st64(s98 + 0x70, p)
	st64(s98 + 0x28, q)
	const r = o | p | q
	st64(s98 + 0x80, ld64(b + 0x58))
	const t = r | ld64(s98 + 0x78)
	st64(s98 + 0x30, s)
	st64(s98 + 0x90, ld64(b + 0x60))
	const u = t | s | ld64(s98 + 0x80)
	st64(s98 + 0x20, o == 0)
	st64(s98 + 0x88, ld64(b + 0x68))
	const v = u | ld64(s98 + 0x90)
	st64(s98 + 0x58, 1)
	if (r != 0) {
		st64(s98 + 0x58, 0)
	}
	let x = ld64(b + 0x70)
	const w = v | ld64(s98 + 0x88)
	st64(s98 + 0x60, 1)
	if ((t | s) != 0) {
		st64(s98 + 0x60, 0)
	}
	const y = w | x
	const ad = x
	let z = ld64(b + 0x78)
	if (y == 0 && z == 0) {
		aw = ld64(s98 + 0x68)
		st16(aw + 2, x)
		st16(aw, 0)
		return x
	}
	const aa = ld64(s98 + 0x10)
	let ab = aa != 0 ? 0x40 : 0x80
	st64(s98 + 8, 0x100)
	const ac = ld64(s98 + 0x50)
	if (j != 0) {
		st64(s98, ab, 0xc0)
		ab = ld64(s98)
	}
	ab = ac != 0 ? 0 : ab
	st64(s98, ad)
	if (j != 0) {
		st64(s98 + 0x40, j)
	}
	const aj = ld64(s98 + 0x78)
	if (aa != 0) {
		st64(s98 + 0x38, aa)
	}
	let am = ld64(s98 + 0x28)
	const af = ld64(s98 + 0x18)
	const ae = ld64(s98 + 0x50)
	if (ae != 0) {
		st64(s98 + 0x38, ae)
	}
	if (i != 0) {
		st64(s98 + 8, ab)
	}
	if (i != 0) {
		st64(s98 + 0x40, ld64(s98 + 0x38))
	}
	let ai = af != 0 ? 0x140 : 0x180
	if (af != 0) {
		st64(s98 + 0x48, af)
	}
	if (l != 0) {
		ai = ld64(s98 + 8)
	}
	if (l != 0) {
		st64(s98 + 0x48, ld64(s98 + 0x40))
	}
	let al = ld64(s98 + 0x70) != 0 ? 0x1c0 : 0x200
	let aq = ld64(s98 + 0x30)
	const an = ld64(s98 + 0x80)
	const ag = ld64(s98 + 0x70)
	am = ag != 0 ? ag : am
	const ah = ld64(s98 + 0x20)
	al = (ah & 1) != 0 ? al : ai
	if ((ah & 1) == 0) {
		am = ld64(s98 + 0x48)
	}
	const ak = ld64(s98 + 0x58)
	const ap = (ak & 1) != 0 ? aj != 0 ? 0x240 : 0x280 : al
	aq = (ak & 1) != 0 ? aj != 0 ? aj : aq : am
	const ar = ld64(s98 + 0x88)
	let at = an != 0 ? 0x2c0 : 0x300
	let au = ld64(s98)
	if (an != 0) {
		st64(s98 + 0x90, an)
	}
	const ao = ld64(s98 + 0x60)
	at = (ao & 1) != 0 ? at : ap
	if ((ao & 1) == 0) {
		st64(s98 + 0x90, aq)
	}
	au = ar != 0 ? ar : au
	const av = v != 0 ? at : ar != 0 ? 0x340 : 0x380
	if (v == 0) {
		z = y != 0 ? au : z
		x = (y != 0 ? av : 0x3c0) | ld8(((z & -z) * 0x218a392cd3d5dbf >> 0x3a) + 0x100159148)
		aw = ld64(s98 + 0x68)
		st16(aw + 2, x)
		st16(aw, 1)
		return x
	}
	au = ld64(s98 + 0x90)
	z = y != 0 ? au : z
	x = (y != 0 ? av : 0x3c0) | ld8(((z & -z) * 0x218a392cd3d5dbf >> 0x3a) + 0x100159148)
	aw = ld64(s98 + 0x68)
	st16(aw + 2, x)
	st16(aw, 1)
	return x
}

export function fn_62d00(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s70 = fp - 0x70, s80 = fp - 0x80, s98 = fp - 0x98, sa0 = fp - 0xa0, sb8 = fp - 0xb8, s120 = fp - 0x120, s138 = fp - 0x138, s158 = fp - 0x158, s168 = fp - 0x168, s170 = fp - 0x170, s178 = fp - 0x178, s180 = fp - 0x180, s188 = fp - 0x188, s190 = fp - 0x190, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, s1b0 = fp - 0x1b0, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1c8 = fp - 0x1c8, s1d0 = fp - 0x1d0, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8
	let aq: u64
	if (0xfff27617 > ((c - 0x6c4f5) as u32)) {
		fn_85138(sb8, 0x100159838)
		st64(s20, 0, 1, 0)
		st64(s80, s20, 0x10015f818)
		st8(s70 + 8, 3)
		st64(s70, 0x20)
		st64(s98 + 8, 0)
		st64(sa0, 0)
		if (fn_88558(0x100159838, sa0) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(s120, s20, 0x18)
		copy(s138, sb8, 0x18)
		st64(s158 + 8, 0x10015a439)
		st32(s120 + 0x60, 0x1774 /* error::InvalidTickIndex */)
		st8(s120 + 0x18, 2)
		st32(s158 + 0x18, 0x36)
		st64(s158 + 0x10, 0x30)
		st64(s158, 0)
		aq = fn_13e5a0(s168, s158)
		const s = ld64(s168)
		st64(a + 8, ld64(s168 + 8))
		st64(a, s)
		return aq
	}
	st64(s178, b)
	if ((d as u16) == 0) {
		fn_1548e8(0x100160028, b, c, d as u16, 0xfff27617)
	}
	st64(s170, (d as u16) * 0x3c)
	const f = fn_1561f0(c as i32, (d as u16) * 0x3c)
	let g = f + 0x200
	if (0 > (c as i32)) {
		g = (-c as u32) % ld64(s170) != 0 ? f + 0x1ff : g
	}
	B13: {
		st64(s180, a)
		memset2(s98, 0, 0x78)
		st64(sa0, 1)
		memset2(s158, 0, 0x80)
		st64(s188, g << 0x20)
		const h = sar(g << 0x20, 0x3f)
		const i = (g ^ h) - h
		if (0x3ff >= (i as u32)) {
			let k = s158 + ((i as u32) >> 6 << 3)
			let j = sa0
			let l = ((i as u32) >> 6) - 1
			while (true) {
				st64(k, ld64(j) << (i & 0x3f))
				j = j + 8
				k = k + 8
				l = l + 1
				if (l >= 0xf) {
					if ((i as u32) > 0x3bf) {
						break
					}
					if ((i & 0x3f) == 0) {
						break
					}
					let o = sa0
					let p = ((i as u32) >> 6) - 1
					const q = -(i as u32) & 0x3f
					let m = ((i as u32) >> 6 << 3) + s158 + 8
					while (true) {
						const r = ld64(m)
						const n = r + (ld64(o) >> (q & 0x3f))
						if (r > n) {
							fn_154730(0x1001609a0, p, m, o, n)
						}
						st64(m, n)
						m = m + 8
						o = o + 8
						p = p + 1
						if (p >= 0xe) {
							break B13
						}
					}
				}
			}
		}
	}
	st64(s190, ld64(s158))
	st64(s198, ld64(s158 + 8))
	st64(s1a0, ld64(s158 + 0x10))
	st64(s1b0, ld64(s120 + 0x40))
	st64(s1a8, ld64(s120 + 0x18))
	st64(s1c0, ld64(s120 + 0x10))
	st64(s1d8, ld64(s120 + 8))
	st64(s1f0, ld64(s120))
	const ac = ld64(s138 + 0x10)
	const aa = ld64(s138 + 8)
	const z = ld64(s138)
	const y = ld64(s158 + 0x18)
	const x = ld64(s120 + 0x38)
	const v = ld64(s120 + 0x30)
	const u = ld64(s120 + 0x28)
	const t = ld64(s178)
	st64(s1b8, ld64(t + 0x58) & ld64(s120 + 0x20))
	st64(s1c8, ld64(t + 0x60) & u)
	st64(s1e0, ld64(t + 0x68) & v)
	const w = ld64(t + 0x70)
	st64(s1d0, ld64(t + 0x18) & y)
	st64(s1e8, ld64(t + 0x20) & z)
	st64(s1f8, ld64(t + 0x28) & aa)
	const ab = ld64(t + 0x30)
	const ad = ld64(t + 0x38)
	const ae = ld64(s1f0)
	const af = ld64(t + 0x40)
	const ag = ld64(s1d8)
	const ah = ld64(t + 0x48)
	const ai = ld64(s1c0)
	const aj = ld64(t + 0x50)
	const ak = ld64(s1a8)
	const an = ld64(t)
	const am = ld64(t + 8)
	const al = ld64(t + 0x10)
	st64(s70 + 0x48, ld64(t + 0x78) & ld64(s1b0))
	st64(s70 + 0x40, w & x)
	st64(s70 + 0x38, ld64(s1e0))
	st64(s70 + 0x30, ld64(s1c8))
	st64(s70 + 0x28, ld64(s1b8))
	st64(s70, ab & ac, ad & ae, af & ag, ah & ai, aj & ak)
	st64(s80 + 8, ld64(s1f8))
	st64(s80, ld64(s1e8))
	st64(s98 + 0x10, ld64(s1d0))
	st64(s98 + 8, al & ld64(s1a0))
	st64(s98, am & ld64(s198))
	st64(sa0, an & ld64(s190))
	memset2(s158, 0, 0x80)
	const ap = memcmp(sa0, s158, 0x80)
	const ao = sar(ld64(s188) + 0xfffffe0000000000, 0x20) * ld64(s170)
	const ar = (ao as i32) != ao
	aq = ap as u32
	const at = ld64(s180)
	if (aq == 0) {
		if ((ar & 1) == 0) {
			st32(at + 0xc, ao)
			st8(at + 8, 0)
			st64(at, 2)
			return aq
		}
		fn_1547e0(0x100160040, 0, at, ao)
	}
	if ((ar & 1) == 0) {
		st32(at + 0xc, ao)
		st8(at + 8, 1)
		st64(at, 2)
		return aq
	}
	fn_1547e0(0x100160058 /* "9" */, 1, at, ao)
}

export function fn_636b8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, se0 = fp - 0xe0, s160 = fp - 0x160, s178 = fp - 0x178, s1e0 = fp - 0x1e0, s1f8 = fp - 0x1f8, s218 = fp - 0x218, s220 = fp - 0x220, s228 = fp - 0x228, s238 = fp - 0x238, s258 = fp - 0x258
	let f, j, m, o, p, q, ad, ae, af, ai, aj, at, au: u64
	B3: {
		let g = b
		f = a
		if (0xfff27617 > ((c - 0x6c4f5) as u32)) {
			if ((c as i32) > 0x6c4f4) {
				break B3
			}
			if ((d as u16) == 0) {
				fn_1548e8(0x1001603b0, 0xfff27617, c, d as u16, e)
			}
			j = d as u16
			const l = 0x6c4f4 / ((d as u16) * 0x3c)
			m = (l * ((d as u16) * 0x3c)) as u32
			const n = (m != 0x6c4f4 ? ~l : -l) * ((d as u16) * 0x3c)
			st64(s258 + 0x10, (d as u16) * 0x3c)
			if ((n as i32) != n) {
				fn_1547e0(0x1001603e0, n as i32, m, (d as u16) * 0x3c, e)
			}
			q = j
			if ((n as u32) != (c as u32)) {
				break B3
			}
		} else {
			st64(s258 + 0x18, f)
			const i = g
			const h = e
			if ((d as u16) == 0) {
				fn_154940(0x1001603f8, 0xfff27617, c, d as u16, e)
			}
			st64(s258 + 0x10, (d as u16) * 0x3c)
			j = fn_158b50(c as i32, (d as u16) * 0x3c)
			m = undef
			q = d as u16
			e = h
			g = i
			f = ld64(s258 + 0x18)
			if (j != 0) {
				break B3
			}
		}
		st64(s258 + 0x18, f)
		if (e != 0) {
			o = ld64(s258 + 0x10)
			p = (c as i32) - o
			if ((p as i32) != p) {
				fn_154788(0x100160070, o, m, q, e)
			}
		} else {
			o = ld64(s258 + 0x10)
			p = o + c
		}
		const r = q
		const s = p << 0x20
		if ((-(q * 0x7800) as i64) > (sar(s, 0x20) as i64)) {
			aj = ld64(s258 + 0x18)
			st32(aj + 0xc, c)
			st8(aj + 8, 0)
			st64(aj, 2)
			return j
		}
		if ((sar(s, 0x20) as i64) >= ((r * 0x7800) as i64)) {
			aj = ld64(s258 + 0x18)
			st32(aj + 0xc, c)
			st8(aj + 8, 0)
			st64(aj, 2)
			return j
		}
		const ap = q
		st64(s258, -(r * 0x7800), e)
		const t = fn_1561f0(sar(s, 0x20), o)
		let u = t + 0x200
		if (0 > (sar(s, 0x20) as i64)) {
			u = (-sar(s, 0x20) as u32) % ld64(s258 + 0x10) != 0 ? t + 0x1ff : u
		}
		const v = sar(u << 0x20, 0x3f)
		const w = (u ^ v) - v
		if (ld64(s258 + 8) != 0) {
			if ((w as u32) > 0x3ff) {
				fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s1, 0x100160008, 0x1001600b8)
			}
			B38: {
				const x = (0x3ff - w) as u32
				memset2(s218, 0, 0x80)
				if (0x3ff >= x) {
					const y = (0x3ff - smax(u as i32, -u as i32) & 0xffffffc0) >> 6
					let aa = s218 + (y << 3)
					let ab = y - 1
					let z = g
					while (true) {
						st64(aa, ld64(z) << (x & 0x3f))
						z = z + 8
						aa = aa + 8
						ab = ab + 1
						if (ab >= 0xf) {
							if ((x & 0x3f) == 0) {
								break
							}
							if (x > 0x3bf) {
								break
							}
							const ac = (0x3ff - smax(u as i32, -u as i32) & 0xffffffc0) >> 6
							const ah = -x & 0x3f
							let ag = ac - 1
							ae = (ac << 3) + s218 + 8
							while (true) {
								ai = ld64(ae)
								af = ai + (ld64(g) >> (ah & 0x3f))
								ad = ai > af
								if (ad != 0) {
									fn_154730(0x1001609a0, ae, af, ad, ai)
								}
								st64(ae, af)
								ae = ae + 8
								g = g + 8
								ag = ag + 1
								if (ag >= 0xe) {
									break B38
								}
							}
						}
					}
				}
			}
			memcpy(s160, s218, 0x80)
			j = fn_61df8(s228, s160, w)
			const av = ld64(s258)
			if (ld16(s228) == 1) {
				at = sar((w - ld16(s228 + 2) << 0x20) + 0xfffffe0000000000, 0x20) * ld64(s258 + 0x10)
				if ((at as i32) != at) {
					fn_1547e0(0x1001600a0, 0)
				}
				au = ld64(s258 + 0x18)
				st32(au + 0xc, at)
				st8(au + 8, 1)
				st64(au, 2)
				return j
			}
			au = ld64(s258 + 0x18)
			st32(au + 0xc, av)
			st8(au + 8, 0)
			st64(au, 2)
			return j
		}
		B35: {
			memset2(s218, 0, 0x80)
			if (0x3ff >= (w as u32)) {
				const ak = smax(u as i32, -u as i32)
				let al = g + ((ak & 0xffffffc0) >> 6 << 3)
				let am = s218
				let an = ((ak & 0xffffffc0) >> 6) - 1
				while (true) {
					st64(am, ld64(al) >> (w & 0x3f))
					al = al + 8
					am = am + 8
					an = an + 1
					if (an >= 0xf) {
						if ((w as u32) > 0x3bf) {
							break
						}
						if ((w & 0x3f) == 0) {
							break
						}
						const ao = smax(u as i32, -u as i32)
						ad = s218
						const aq = -(w as u32) & 0x3f
						ae = ((ao & 0xffffffc0) >> 6) - 1
						af = ((ao & 0xffffffc0) >> 6 << 3) + g + 8
						while (true) {
							const ar = ld64(ad)
							ai = ar + (ld64(af) << (aq & 0x3f))
							if (ar > ai) {
								fn_154730(0x1001609a0, ae, af, ad, ai)
							}
							st64(ad, ai)
							af = af + 8
							ad = ad + 8
							ae = ae + 1
							if (ae >= 0xe) {
								break B35
							}
						}
					}
				}
			}
		}
		memcpy(se0, s218, 0x80)
		j = fn_626b0(s220, se0)
		if (ld16(s220) == 1) {
			at = sar((w + ld16(s220 + 2) << 0x20) + 0xfffffe0000000000, 0x20) * ld64(s258 + 0x10)
			if ((at as i32) != at) {
				fn_1547e0(0x100160088)
			}
			au = ld64(s258 + 0x18)
			st32(au + 0xc, at)
			st8(au + 8, 1)
			st64(au, 2)
			return j
		}
		au = ld64(s258 + 0x18)
		st32(au + 0xc, ap * 0x77c4)
		st8(au + 8, 0)
		st64(au, 2)
		return j
	}
	fn_85138(s178, 0x1001598f0)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x1001598f0, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(s1e0, s60, 0x18)
	copy(s1f8, s178, 0x18)
	st64(s218 + 8, 0x10015a439)
	st32(s1e0 + 0x60, 0x177a /* error::InvalidTickArrayBoundary */)
	st8(s1e0 + 0x18, 2)
	st32(s218 + 0x18, 0x52)
	st64(s218 + 0x10, 0x30)
	st64(s218, 0)
	j = fn_13e5a0(s238, s218)
	const k = ld64(s238)
	st64(f + 8, ld64(s238 + 8))
	st64(f, k)
	return j
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
export function fn_644c8(a: u64, b: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s70 = fp - 0x70, s88 = fp - 0x88, sf0 = fp - 0xf0, s108 = fp - 0x108, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258
	let l, m, n: u64
	if (0xd89e9 > ((b + 0x6c4f4) as u32)) {
		B5: {
			const g = sar(b << 0x20, 0x3f)
			const h = (b ^ g) - g
			let i = -(h & 1) & 0xfffcb933bd6fb800
			let j = h & 1 ^ 1
			if ((h & 2) != 0) {
				r0 = __multi3_159030(s148, i, 0, 0xfff97272373d4000, 0)
				const k = j * 0xfff97272373d4000
				i = k + ld64(s148 + 8)
				if (k > i) {
					break B5
				}
				j = 0
			}
			if ((h & 4) != 0) {
				r0 = __multi3_159030(s158, i, 0, 0xfff2e50f5f657000, 0)
				const o = j * 0xfff2e50f5f657000
				i = o + ld64(s158 + 8)
				if (o > i) {
					break B5
				}
				j = 0
			}
			if ((h & 8) != 0) {
				r0 = __multi3_159030(s168, i, 0, 0xffe5caca7e10f000, 0)
				const p = j * 0xffe5caca7e10f000
				i = p + ld64(s168 + 8)
				if (p > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x10) != 0) {
				r0 = __multi3_159030(s178, i, 0, 0xffcb9843d60f7000, 0)
				const q = j * 0xffcb9843d60f7000
				i = q + ld64(s178 + 8)
				if (q > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x20) != 0) {
				r0 = __multi3_159030(s188, i, 0, 0xff973b41fa98e800, 0)
				const r = j * 0xff973b41fa98e800
				i = r + ld64(s188 + 8)
				if (r > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x40) != 0) {
				r0 = __multi3_159030(s198, i, 0, 0xff2ea16466c9b000, 0)
				const s = j * 0xff2ea16466c9b000
				i = s + ld64(s198 + 8)
				if (s > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x80) != 0) {
				r0 = __multi3_159030(s1a8, i, 0, 0xfe5dee046a9a3800, 0)
				const t = j * 0xfe5dee046a9a3800
				i = t + ld64(s1a8 + 8)
				if (t > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x100) != 0) {
				r0 = __multi3_159030(s1b8, i, 0, 0xfcbe86c7900bb000, 0)
				const u = j * 0xfcbe86c7900bb000
				i = u + ld64(s1b8 + 8)
				if (u > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x200) != 0) {
				r0 = __multi3_159030(s1c8, i, 0, 0xf987a7253ac65800, 0)
				const v = j * 0xf987a7253ac65800
				i = v + ld64(s1c8 + 8)
				if (v > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x400) != 0) {
				r0 = __multi3_159030(s1d8, i, 0, 0xf3392b0822bb6000, 0)
				const w = j * 0xf3392b0822bb6000
				i = w + ld64(s1d8 + 8)
				if (w > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x800) != 0) {
				r0 = __multi3_159030(s1e8, i, 0, 0xe7159475a2caf000, 0)
				const x = j * 0xe7159475a2caf000
				i = x + ld64(s1e8 + 8)
				if (x > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x1000) != 0) {
				r0 = __multi3_159030(s1f8, i, 0, 0xd097f3bdfd2f2000, 0)
				const y = j * 0xd097f3bdfd2f2000
				i = y + ld64(s1f8 + 8)
				if (y > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x2000) != 0) {
				r0 = __multi3_159030(s208, i, 0, 0xa9f746462d9f8000, 0)
				const z = j * 0xa9f746462d9f8000
				i = z + ld64(s208 + 8)
				if (z > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x4000) != 0) {
				r0 = __multi3_159030(s218, i, 0, 0x70d869a156f31c00, 0)
				i = j * 0x70d869a156f31c00 + ld64(s218 + 8)
				j = 0
			}
			if ((h & 0x8000) != 0) {
				r0 = __multi3_159030(s228, i, 0, 0x31be135f97ed3200, 0)
				i = j * 0x31be135f97ed3200 + ld64(s228 + 8)
				j = 0
			}
			if ((h & 0x10000) != 0) {
				r0 = __multi3_159030(s238, i, 0, 0x9aa508b5b85a500, 0)
				i = j * 0x9aa508b5b85a500 + ld64(s238 + 8)
				j = 0
			}
			if ((h & 0x20000) != 0) {
				r0 = __multi3_159030(s248, i, 0, 0x5d6af8dedc582c, 0)
				i = j * 0x5d6af8dedc582c + ld64(s248 + 8)
				j = 0
			}
			if ((h & 0x40000) != 0) {
				r0 = __multi3_159030(s258, i, 0, 0x2216e584f5fa, 0)
				i = j * 0x2216e584f5fa + ld64(s258 + 8)
				j = 0
			}
			if ((b as i32) > 0) {
				st64(s70, i, j)
				r0 = fn_100918(s128, 0x10015a490, s70)
				i = ld64(s128)
				st64(a + 0x10, ld64(s128 + 8))
				st64(a + 8, i)
				st64(a, 0)
				return r0
			}
			st64(a + 0x10, j)
			st64(a + 8, i)
			st64(a, 0)
			return r0
		}
		st64(s128, 0x100160990, 1, 8, 0, 0)
		// fmt "arithmetic operation overflow"
		fn_14ec00(s128, 0x10015fe28, l, m, n)
	}
	fn_85138(s88, 0x10015983c)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x10015983c, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(sf0, s60, 0x18)
	copy(s108, s88, 0x18)
	st64(s128 + 8, 0x10015a469)
	st32(sf0 + 0x60, 0x1777 /* error::TickUpperOverflow */)
	st8(sf0 + 0x18, 2)
	st32(s128 + 0x18, 0x26)
	st64(s128 + 0x10, 0x27)
	st64(s128, 0)
	r0 = fn_13e5a0(s138, s128)
	const f = ld64(s138)
	st64(a + 0x10, ld64(s138 + 8))
	st64(a + 8, f)
	st64(a, 1)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), c (value)
export function fn_65410(a: u64, b: u64, c: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s180 = fp - 0x180, s190 = fp - 0x190, s1000 = fp - 0x1000
	let m, n, ai: u64
	const f = c + (b >= 0x100013b50)
	if ((f != 0xfffec4b2 ? 0xfffec4b1 > f - 1 : 0x845c1aa84e681c4b > b + 0xfffffffefffec4b0) != 0) {
		const h = c != 0 ? clz(c) : clz(b) + 0x40
		const i = (0x7f - h << 0x20) + 0xffffffc000000000
		const j = (0x7f - h << 0x20) > i
		if (0x40 > h) {
			__multi3_158e18(s148, b, c, (0x40 - h) as i32, i)
			m = ld64(s148 + 8)
			n = ld64(s148)
		} else {
			__multi3_158fe8(s138, b, c, (h ^ 0x40) as i32)
			m = ld64(s138 + 8)
			n = ld64(s138)
		}
		let s = 0x8000000000000000
		let k = 0
		let l = 0x10
		let w = 0
		let an = 0
		while (true) {
			let al = k
			const am = l
			__multi3_159030(s168, m, 0, n, 0)
			__multi3_159030(s158, n, 0, n, 0)
			const v = an
			const r = ld64(s168 + 8) != 0
			const o = ld64(s168)
			const p = ld64(s158 + 8)
			const q = p + (o + o)
			if (((m != 0 | r | p > q) & 1) != 0) {
				fn_1547e0(0x100160118, p > q, q, r, o + o)
			}
			const u = sar(q, 0x3f) & s
			const t = al
			const x = sar(q, 0x3f) & v
			const y = w + x + (al > al + u)
			const z = ~(w ^ x) & (w ^ y)
			al = y
			if (0 > (z as i64)) {
				fn_154730(0x100160130, z, q, y, t + u)
			}
			const ac = __multi3_158e18(s178, ld64(s158), q, (q >> 0x3f) + 0x3f, p)
			s = s >> 1 | (v << 0x3f)
			an = v >> 1
			m = ld64(s178 + 8)
			n = ld64(s178)
			l = am - 1
			k = t + u
			const aa = al
			w = al
			if ((l as u32) == 0) {
				const ab = i + (t + u >> 0x20 | (aa << 0x20))
				st64(s180, 0)
				st64(s1000, 0, s180)
				ai = fn_158408(s190, ab, j - 1 + sar(aa, 0x20) + (i > ab), 0x3627a301d710, fp, ac)
				if (ld64(s180) != 0) {
					fn_1547e0(0x1001600d0)
				}
				const ae = ld64(s190 + 8)
				const ad = ld64(s190)
				const af = ae + (ad >= 0x28f5c28f5c28f5c)
				const ag = ae ^ af - 1
				if (0 > ((ae & ag) as i64)) {
					fn_154788(0x1001600e8, ad, ae & ag, ag)
				}
				const ah = ae + (ad >= 0x24d217cfadfc1ac7)
				if (0 > ((~ae & (ae ^ ah)) as i64)) {
					fn_154730(0x100160100, ae ^ ah, ad >= 0x24d217cfadfc1ac7, ad + 0xdb2de8305203e539)
				}
				if (((af - 1) as u32) == (ah as u32)) {
					st32(a + 8, af - 1)
					st64(a, 2)
					return ai
				}
				ai = fn_644c8(s118, ah, ai)
				const aj = ld64(s118 + 8)
				if (ld64(s118) != 0) {
					st64(a + 8, ld64(s118 + 0x10))
					st64(a, aj)
					return ai
				}
				const ak = ld64(s118 + 0x10)
				if ((ak != c ? ak > c : aj > b) != 0) {
					st32(a + 8, af - 1)
					st64(a, 2)
					return ai
				}
				st32(a + 8, ah)
				st64(a, 2)
				return ai
			}
		}
	}
	fn_85138(s78, 0x10015985c)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x10015985c, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a469)
	st32(sf8 + 0x78, 0x177c /* error::SqrtPriceX64 */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0x8a)
	st64(s118 + 0x10, 0x27)
	st64(s118, 0)
	ai = fn_13e5a0(s128, s118)
	const g = ld64(s128)
	st64(a + 8, ld64(s128 + 8))
	st64(a, g)
	return ai
}

export function fn_660f8(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s130 = fp - 0x130, s138 = fp - 0x138, s158 = fp - 0x158, s168 = fp - 0x168
	let f: u64
	st64(s158, b, c, 0, 0)
	let n = fn_103fe8(s138, s158, s158)
	if (d != 0) {
		const g = ld64(s138)
		const h = ld64(s130)
		let i = h + 1
		const k = g != 0 & i == 0
		const j = ld64(s130 + 8)
		let l = j + k
		const m = j > l
		n = ld64(s130 + 0x10)
		if (k == 1 && (m & 1) != 0) {
			n = n + 1
			if (n == 0) {
				st64(s118, 0x100160990, 1, 8, 0, 0)
				// fmt "arithmetic operation overflow"
				fn_14ec00(s118, 0x10015feb8, h, k, l)
			}
		}
		l = (k & 1) != 0 ? l : j
		i = g != 0 ? i : h
		st64(s130, i, l)
		if (n == 0) {
			f = ld64(s130)
			st64(a + 0x10, ld64(s130 + 8))
			st64(a + 8, f)
			st64(a, 0)
			return n
		}
	} else if (ld64(s130 + 0x10) == 0) {
		f = ld64(s130)
		st64(a + 0x10, ld64(s130 + 8))
		st64(a + 8, f)
		st64(a, 0)
		return n
	}
	fn_85138(s78, 0x100159848)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x100159848, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a469)
	st32(sf8 + 0x78, 0x1796 /* error::CalculateOverflow */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0xd0)
	st64(s118 + 0x10, 0x27)
	st64(s118, 0)
	n = fn_13e5a0(s168, s118)
	const o = ld64(s168)
	st64(a + 0x10, ld64(s168 + 8))
	st64(a + 8, o)
	st64(a, 1)
	return n
}

export function fn_66528(a: u64, b: u64, c: u64): u64 {
	const s40 = fp - 0x40
	fn_1019b8(s40, b, c)
	const o = ld64(s40 + 0x18)
	const m = ld64(s40 + 0x10)
	const n = ld64(s40 + 8)
	const g = ld64(s40)
	fn_1019b8(s40, b, c)
	let h = 1
	if (ld64(s40 + 0x38) == 0 && (ld64(s40 + 0x30) == 0 && ld64(s40 + 0x28) == 0)) {
		h = ld64(s40 + 0x20) != 0
	}
	let f = n + 1
	const i = g + h
	const j = g > i & f == 0
	let k = m + j
	const l = m > k
	k = j != 0 ? k : m
	f = g > i ? f : n
	if (j != 1) {
		st64(a + 0x18, o)
		st64(a + 0x10, k)
		st64(a + 8, f)
		st64(a, i)
		return g > i
	}
	if ((l & 1) == 0) {
		st64(a + 0x18, o)
		st64(a + 0x10, k)
		st64(a + 8, f)
		st64(a, i)
		return g > i
	}
	st64(a + 0x10, k)
	st64(a + 8, f)
	st64(a, i)
	st64(a + 0x18, o + 1)
	if (o == -1) {
		st64(s40, 0x100160990, 1, 8, 0, 0)
		// fmt "arithmetic operation overflow"
		fn_14ec00(s40, 0x10015feb8, i, k, j)
	}
	return g > i
}

export function fn_667d0(a: u64, b: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	let k: u64
	const g = ld64(b + 0x50)
	const f = ld64(b + 0x48)
	if (g > f) {
		k = fn_88360(s20, 0x26)
		const j = ld64(s20)
		st64(a + 8, ld64(s20 + 8))
		st64(a, j)
		return k
	}
	k = fn_88360(s10, 0x26)
	const i = ld64(s10 + 8)
	const h = ld64(s10)
	st64(a + 8, f - g)
	st64(a, 2)
	if (h != 0) {
		void ld64(i)
		void ld8(i + 0x38)
		return k
	}
	void ld64(i)
	void ld8(i + 0x50)
	return k
}

export function fn_668d8(a: u64, b: u64, c: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s180 = fp - 0x180
	let w: u64
	const f = ld64(b + 0x58)
	if (f != 0) {
		const h = ld64(c + 0x74)
		const g = ld64(b + 0x40)
		if (g == h) {
			st64(a, 2, 0)
			return r0
		}
		if ((g != -1 ? g + 1 : 0xffffffffffffffff) == h) {
			st64(s180, a)
			st64(s48, f, 0, 0, 0)
			const l = ld64(c + 0x8c)
			st64(s118 + 8, ld64(c + 0x94))
			st64(s118, l)
			st64(s108, 0, 0)
			fn_103fe8(s158, s48, s118)
			const m = ld64(b + 0x70)
			st64(s138 + 8, ld64(b + 0x78))
			st64(s138, m)
			st64(s128, 0, 0)
			fn_1019b8(s118, s158, s138)
			if (ld64(s118 + 8) == 0 && (ld64(s108) == 0 && ld64(s108 + 8) == 0)) {
				const n = ld64(s118)
				r0 = fn_1019b8(s118, s158, s138)
				if (f > n) {
					let r = sat_sub(f, n)
					const s = r != 0 ? r - 1 : 0
					const t = ld64(sf8 + 8)
					r = ld64(sf8 + 0x18) != 0 ? s : r
					r = ld64(sf8 + 0x10) != 0 ? s : r
					r = (ld64(sf8) | t) != 0 ? s : r
					r0 = fn_72df0(s118, r, ld32(c), ld8(b + 0xa4), t)
					let u = ld64(s118)
					if (u != 2) {
						w = ld64(s180)
						st64(w + 8, ld64(s118 + 8))
						st64(w, u)
						return r0
					}
					const v = ld64(b + 0x48)
					if (n > v) {
						r0 = fn_88360(s178, 0x26)
						u = ld64(s178)
						w = ld64(s180)
						st64(w + 8, ld64(s178 + 8))
						st64(w, u)
						return r0
					}
					const x = ld64(s118 + 8)
					st64(b + 0x50, v - n)
					const y = ld64(b + 0x60)
					st64(b + 0x60, x)
					const z = ld64(s180)
					st64(z + 8, sat_sub(x, y))
					st64(z, 2)
					return r0
				}
				a = ld64(s180)
				st64(a, 2, 0)
				return r0
			}
			st64(s118, 0x10015fe18, 1, 8, 0, 0)
			// fmt "Integer overflow when casting to u64"
			fn_14ec00(s118, 0x10015feb8)
		}
		const i = g > g + 2
		const j = a
		if ((i != 0 ? 0xffffffffffffffff : g + 2) > h) {
			fn_85138(s78, 0x1001598c0)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (fn_88558(0x1001598c0, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copy(sf8, s78, 0x30)
			st64(s118 + 8, 0x10015a641)
			st32(sf8 + 0x78, 0x1799 /* error::InvalidOrderPhase */)
			st8(sf8 + 0x30, 2)
			st32(s108 + 8, 0x9d)
			st64(s108, 0x26)
			st64(s118, 0)
			r0 = fn_13e5a0(s168, s118)
			const k = ld64(s168)
			st64(j + 8, ld64(s168 + 8))
			st64(j, k)
			return r0
		}
		r0 = fn_72df0(s118, f, ld32(c), ld8(b + 0xa4), i)
		const p = ld64(s118 + 8)
		const o = ld64(s118)
		if (o == 2) {
			st64(b + 0x50, ld64(b + 0x48))
			const q = ld64(b + 0x60)
			st64(b + 0x60, 0)
			st64(b + 0x58, 0)
			st64(j + 8, sat_sub(p, q))
			st64(j, 2)
			return r0
		}
		st64(j + 8, p)
		st64(j, o)
		return r0
	}
	st64(a, 2, 0)
	return r0
}

export function fn_697e0(a: u64, b: u64, c: u64): u64 {
	const s30 = fp - 0x30, s40 = fp - 0x40
	let i: u64
	st8(b, 0)
	let k = clock_get(s30)
	if (ld64(s30) != 0) {
		const g = ld64(s30 + 8)
		const f = ld64(s30 + 0x10)
		st64(s30 + 0x10, ld64(s30 + 0x18))
		st64(s30, g, f)
		k = fn_13e628(s40, s30)
		i = ld64(s40 + 8)
		const h = ld64(s40)
		if (h != 2) {
			st64(a + 8, i)
			st64(a, h)
			return k
		}
	} else {
		i = ld64(s30 + 0x18)
	}
	st64(b + 1, i)
	st16(b + 9, 0)
	copy(b + 0xb, c, 0x20)
	i = 0x2b
	while (true) {
		const j = b + i
		st32(j + 0x28, 0)
		st64(j + 0x20, 0)
		st64(j + 0x18, 0)
		st64(j + 0x10, 0)
		st64(j + 8, 0)
		st64(j, 0)
		i = i + 0x2c
		if (i == 0x115b) {
			st64(b + 0x1173, 0)
			st64(b + 0x116b, 0)
			st64(b + 0x1163, 0)
			st64(b + 0x115b, 0)
			st64(a + 8, i)
			st64(a, 2)
			return k
		}
	}
}

export function fn_69990(a: u64, b: u64, c: u64) {
	const f = ld16(a + 9)
	if (ld8(a) != 0) {
		if (f >= 0x64 /* anchor::InstructionMissing */) {
			fn_14ec98(f, 0x64 /* anchor::InstructionMissing */, 0x1001601d8, f, b)
		}
		const h = a + 0x2b + f * 0x2c
		const i = (b as u32) - ld32(h)
		const j = i > (b as u32) ? 0 : i
		if (j >= 0xf) {
			const k = f != 0x63 ? f + 1 : 0
			const l = a + 0x2b + (k as u16) * 0x2c
			st64(l + 4, (j as u32) * (c as i32) + ld64(h + 4))
			st32(l, b)
			st16(a + 9, k)
		}
	} else {
		st8(a, 1)
		if (f >= 0x64 /* anchor::InstructionMissing */) {
			fn_14ec98(f, 0x64 /* anchor::InstructionMissing */, 0x1001601c0, f, b)
		}
		const g = a + f * 0x2c
		st32(g + 0x2b, b)
		st64(g + 0x2f, 0)
	}
}

export function fn_69b78(): u64 {
	const s18 = fp - 0x18, s40 = fp - 0x40, s48 = fp - 0x48
	clock_get(s48)
	if (ld64(s48) != 0) {
		copyr(s18, s40, 0x18)
		fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s18, 0x1001601f0, 0x100160210)
	}
	return ld64(s40 + 0x20)
}

export function fn_69c30(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	let l = fn_69e08(s10, b, p5, p6, p7, p8, p9, p10)
	let f = ld64(s10)
	if (f != 2) {
		st64(a + 8, ld64(s10 + 8))
		st64(a, f)
		return l
	}
	const g = ld64(b + 0x40)
	let i = g > g + c
	const h = ld64(b + 0x48)
	const j = h + d + i
	i = j != h ? h > j : i
	if ((i & 1) != 0) {
		l = fn_88360(s20, 0x26)
		f = ld64(s20)
		st64(a + 8, ld64(s20 + 8))
		st64(a, f)
		return l
	}
	st64(b + 0x40, g + c)
	const k = h + d + (g > g + c)
	st64(b + 0x48, k)
	st64(a + 8, k)
	st64(a, 2)
	return l
}

export function fn_69e08(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s48 = fp - 0x48, s58 = fp - 0x58
	const j = ld64(b + 0x58)
	const i = ld64(b + 0x50)
	const h = ld64(b + 0x70)
	const g = ld64(b + 0x40)
	const f = ld64(b + 0x48)
	let au = d
	let av = c
	let aq = fn_2c160(s48, h, i, j, c, d, g, f)
	let k = ld64(s48)
	if (k != 2) {
		st64(a + 8, ld64(s48 + 8))
		st64(a, k)
		return aq
	}
	const l = p6
	const m = p5
	const at = p8
	const r = p7
	st64(b + 0x70, ld64(s48 + 8))
	const p = ld64(b + 0x68)
	const o = ld64(b + 0x60)
	const n = ld64(b + 0x78)
	aq = fn_2c160(s48, n, o, p, m, l, g, f)
	k = ld64(s48)
	if (k == 2) {
		const q = ld64(s48 + 8)
		st64(b + 0x68, l)
		st64(b + 0x60, m)
		st64(b + 0x58, au)
		st64(b + 0x50, av)
		st64(b + 0x78, q)
		const s = ld64(r + 8)
		au = s
		av = r
		const t = ld64(r)
		const u = ld64(b + 0x80)
		const y = ld64(b + 0x90)
		st64(s30 + 8, s - ld64(b + 0x88) - (u > t))
		st64(s30, t - u)
		st64(s20, g, f, 0, 1)
		fn_584f8(s48, s30, s20, s10)
		let w = ld64(s48 + 8)
		const v = ld64(s48)
		w = v != 0 ? w : 0
		const x = w != -1 ? w : 0
		let z = ld64(s48 + 0x10) != 0 ? 0 : x
		z = v != 0 ? z : x
		if (y + z >= y) {
			st64(b + 0x80, t, au, z + y)
			const aa = ld64(av + 0x18)
			au = aa
			const ab = ld64(av + 0x10)
			const ac = ld64(b + 0x98)
			const ag = ld64(b + 0xa8)
			st64(s30 + 8, aa - ld64(b + 0xa0) - (ac > ab))
			st64(s30, ab - ac)
			st64(s20, g, f, 0, 1)
			fn_584f8(s48, s30, s20, s10)
			let ae = ld64(s48 + 8)
			const ad = ld64(s48)
			ae = ad != 0 ? ae : 0
			const af = ae != -1 ? ae : 0
			let ah = ld64(s48 + 0x10) != 0 ? 0 : af
			ah = ad != 0 ? ah : af
			if (ag + ah >= ag) {
				st64(b + 0x98, ab, au, ah + ag)
				const ai = ld64(av + 0x28)
				au = ai
				const aj = ld64(av + 0x20)
				const ak = ld64(b + 0xb0)
				const ao = ld64(b + 0xc0)
				st64(s30 + 8, ai - ld64(b + 0xb8) - (ak > aj))
				st64(s30, aj - ak)
				st64(s20, g, f, 0, 1)
				aq = fn_584f8(s48, s30, s20, s10)
				let am = ld64(s48 + 8)
				const al = ld64(s48)
				am = al != 0 ? am : 0
				const an = am != -1 ? am : 0
				let ap = ld64(s48 + 0x10) != 0 ? 0 : an
				ap = al != 0 ? ap : an
				if (ao + ap >= ao) {
					st64(b + 0xb0, aj)
					st64(b + 0xc8, at)
					st64(b + 0xb8, au, ap + ao)
					st64(a + 8, au)
					st64(a, 2)
					return aq
				}
			}
		}
		aq = fn_88360(s58, 0x26)
		const ar = ld64(s58)
		if (ar == 2) {
			st64(a + 8, undef)
			st64(a, 2)
			return aq
		}
		st64(a + 8, ld64(s58 + 8))
		st64(a, ar)
		return aq
	}
	st64(a + 8, ld64(s48 + 8))
	st64(a, k)
	return aq
}

export function fn_6a5a8(a: u64, b: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s88 = fp - 0x88, sa9 = fp - 0xa9
	const f = ld16(b + 0x17f)
	st64(s88, 0x10015984c, 4, b + 1, 0x20, b + 0x41, 0x20, b + 0x61, 0x20, f != 0 ? b + 0x17f : 1, (f != 0) << 1, b, 1, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */)
	// PDA create_program_address(["pool", *(b + 1), *(b + 0x41), *(b + 0x61), (f != 0 ? b + 0x17f : 1)[..(f != 0) << 1], b[..1]], program *s28)
	const g = Pubkey_create_program_address(sa9, s88, 6, s28, r0)
	if (ld8(sa9) != 0) {
		st8(s1, ld8(sa9 + 1))
		fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s1, 0x100160228, 0x100160248)
	}
	st64(a + 0x18, ld64(sa9 + 0x19))
	st64(a + 0x10, ld64(sa9 + 0x11))
	st64(a + 8, ld64(sa9 + 9))
	st64(a, ld64(sa9 + 1))
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), p5 (value)
export function fn_6a7e8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64, p13: u64, p14: u64, p15: u64): u64 {
	const s27 = fp - 0x27, sa0 = fp - 0xa0, sb0 = fp - 0xb0
	let r, t: u64
	st8(b, c)
	const f = p11
	const g = ld64(ld64(f))
	st64(b + 0x19, ld64(g + 0x18))
	st64(b + 0x11, ld64(g + 0x10))
	st64(b + 9, ld64(g + 8))
	st64(b + 1, ld64(g))
	const h = p8
	copy(b + 0x21, h, 0x20)
	const i = p12
	const j = ld64(ld64(i + 0x58))
	st64(b + 0x59, ld64(j + 0x18))
	st64(b + 0x51, ld64(j + 0x10))
	st64(b + 0x49, ld64(j + 8))
	st64(b + 0x41, ld64(j))
	const k = p13
	const l = ld64(ld64(k + 0x58))
	st64(b + 0x79, ld64(l + 0x18))
	st64(b + 0x71, ld64(l + 0x10))
	st64(b + 0x69, ld64(l + 8))
	st64(b + 0x61, ld64(l))
	st8(b + 0xe1, ld8(i + 0x30))
	st8(b + 0xe2, ld8(k + 0x30))
	const m = p9
	st64(b + 0x99, ld64(m + 0x18))
	st64(b + 0x91, ld64(m + 0x10))
	st64(b + 0x89, ld64(m + 8))
	st64(b + 0x81, ld64(m))
	const n = p10
	copy(b + 0xa1, n, 0x20)
	st16(b + 0xe3, ld16(f + 0x72))
	st64(b + 0xf5, d, p5)
	st32(b + 0x105, p7)
	st64(b + 0xe5, 0, 0)
	st32(b + 0x109, 0)
	memset2(sa0, 0, 0x79)
	copy(s27, h, 0x20)
	memcpy(b + 0x185, sa0, 0x99)
	st64(b + 0x226, 0)
	st64(b + 0x21e, 0)
	memcpy(b + 0x22e, sa0, 0x99)
	st64(b + 0x2cf, 0)
	st64(b + 0x2c7, 0)
	memcpy(b + 0x2d7, sa0, 0x99)
	st64(b + 0x378, 0)
	st64(b + 0x370, 0)
	memset2(b + 0x10d, 0, 0x71)
	st8(b + 0x17e, p15)
	st32(b + 0x181, 0)
	st16(b + 0x17f, 0)
	memset2(b + 0x380, 0, 0xb0)
	st64(b + 0x430, p6)
	clock_get(sa0)
	const s = p14
	if (ld64(sa0) != 0) {
		const p = ld64(sa0 + 8)
		const o = ld64(sa0 + 0x10)
		st64(sa0 + 0x10, ld64(sa0 + 0x18))
		st64(sa0, p, o)
		t = fn_13e628(sb0, sa0)
		r = ld64(sb0 + 8)
		const q = ld64(sb0)
		if (q != 2) {
			st64(a + 8, r)
			st64(a, q)
			return t
		}
	} else {
		r = ld64(sa0 + 0x18)
	}
	st64(b + 0x438, r, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
	t = memset2(b + 0x490, 0, 0x170)
	copy(b + 0xc1, s, 0x18)
	r = ld64(s + 0x18)
	st64(b + 0xd9, r)
	st64(a + 8, r)
	st64(a, 2)
	return t
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), a (points to it), b (value)
export function fn_6c2a0(a: u64, b: u64, c: u64): u64 {
	const s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s25b = fp - 0x25b, s270 = fp - 0x270, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2e0 = fp - 0x2e0
	let k, ad, ag, ah, al, an: u64
	st64(s290, b + 0x185, a, b, c)
	memcpy(s25b, b + 0x185, 0x1fb)
	let i = 0
	while (true) {
		B18: {
			B29: {
				B28: {
					B27: {
						const f = ld64(s290 + 0x10)
						const h = ld64(f + 0xed)
						const g = ld64(f + 0xe5)
						const j = i
						if ((g | h) == 0) {
							k = s25b + j * 0xa9
							let ae = i - 1
							while (true) {
								st64(s30, 0, 0, 0, 0)
								if ((memcmp(k + 0x39, s30, 0x20) as u32) != 0 && ld64(k + 0x29) != -1) {
									const af = ld64(k + 1)
									if (ld64(s290 + 0x18) > af) {
										ag = ld64(k + 9)
										ad = ag
										if (ag >= ld64(s290 + 0x18)) {
											ad = ld64(s290 + 0x18)
										}
										i = ae + 2
										st64(k + 0x11, ad)
										if (af > ad) {
											break B27
										}
										break
									}
								}
								k = k + 0xa9
								ae = ae + 1
								if (ae >= 2) {
									break B18
								}
							}
						} else {
							st64(s2a0, h, g)
							k = s25b + j * 0xa9
							let n = i - 1
							while (true) {
								st64(s30, 0, 0, 0, 0)
								if ((memcmp(k + 0x39, s30, 0x20) as u32) != 0) {
									const o = ld64(k + 0x29)
									if (o != -1) {
										const p = ld64(k + 1)
										if (ld64(s290 + 0x18) > p) {
											const q = ld64(k + 9)
											let l = q
											if (q >= ld64(s290 + 0x18)) {
												l = ld64(s290 + 0x18)
											}
											const m = ld64(k + 0x11)
											if (l > m) {
												st64(s2e0, l, q)
												const r = sat_sub(l, m)
												st64(s2e0 + 0x10, r)
												st64(s60, r, 0)
												const s = ld64(k + 0x19)
												st64(s2e0 + 0x28, s)
												const t = ld64(k + 0x21)
												st64(s2e0 + 0x20, t)
												st64(s50, s, t, 0, 1)
												fn_58930(s30, s60, s50, s40)
												copy(s2b0, s30, 0x10)
												st64(s2e0 + 0x18, ld64(s30 + 0x10))
												st64(s60, ld64(s2e0 + 0x10))
												st64(s60 + 8, 0)
												st64(s50 + 8, ld64(s2e0 + 0x20))
												st64(s50, ld64(s2e0 + 0x28))
												st64(s40 + 8, ld64(s2a0))
												st64(s40, ld64(s2a0 + 8))
												fn_584f8(s30, s60, s50, s40)
												let ac = ld64(s30 + 0x10)
												const u = ld64(s30)
												ac = u != 0 ? ac : 0
												let aa = ld64(s30 + 8)
												let w = ld64(s2b0 + 8)
												const v = ld64(s2b0)
												aa = u != 0 ? aa : 0
												w = v != 0 ? w : 0
												if ((v & ld64(s2e0 + 0x18) != 0) == 0 && ~o >= w) {
													const x = o + w
													if (o > x) {
														fn_154730(0x100160260, aa, x, o > x, w)
													}
													st64(k + 0x29, x)
												} else {
													st64(k + 0x29, -1)
													st64(s60, ~o, 0, 0, 1)
													st64(s40 + 8, ld64(s2a0))
													st64(s40, ld64(s2a0 + 8))
													fn_584f8(s30, s60, s50, s40)
													ac = ld64(s30 + 0x10)
													const y = ld64(s30)
													ac = y != 0 ? ac : 0
													aa = ld64(s30 + 8)
													aa = y != 0 ? aa : 0
												}
												const z = ld64(k + 0x99)
												const ab = z + aa
												i = n + 2
												st64(k + 0x99, ab)
												st64(k + 0xa1, ld64(k + 0xa1) + (z > ab) + ac)
												ag = ld64(s2e0 + 8)
												ad = ld64(s2e0)
												st64(k + 0x11, ad)
												if (p > ad) {
													break B27
												}
												break
											}
										}
									}
								}
								k = k + 0xa9
								n = n + 1
								if (n >= 2) {
									break B18
								}
							}
						}
						ah = 2
						if (ag > ad) {
							break B28
						}
					}
					ah = 3
					if (ad != ag) {
						break B29
					}
				}
				st8(k, ah)
			}
			if (3 > i) {
				continue
			}
		}
		memcpy(ld64(s290), s25b, 0x1fb)
		clock_get(s30)
		if (ld64(s30) != 0) {
			const aj = ld64(s30 + 8)
			const ai = ld64(s30 + 0x10)
			st64(s30 + 0x10, ld64(s30 + 0x18))
			st64(s30, aj, ai)
			an = fn_13e628(s270, s30)
			const am = ld64(s270 + 8)
			const ak = ld64(s270)
			al = ld64(s290 + 8)
			if (ak == 2) {
				st64(ld64(s290 + 0x10) + 0x438, am)
				an = memcpy(al + 1, s25b, 0x1fb)
				st8(al, 0)
				return an
			}
			st64(al + 0x10, am)
			st64(al + 8, ak)
			st8(al, 1)
			return an
		}
		al = ld64(s290 + 8)
		st64(ld64(s290 + 0x10) + 0x438, ld64(s30 + 0x18))
		an = memcpy(al + 1, s25b, 0x1fb)
		st8(al, 0)
		return an
	}
}

export function fn_6cb08(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158
	let i: u64
	if (3 > c) {
		const f = b + c * 0xa9
		const h = ld64(f + 0x1b6)
		const g = ld64(f + 0x1ae)
		if (h > g) {
			r0 = fn_88360(s158, 0x26)
			i = ld64(s158)
			st64(a + 8, ld64(s158 + 8))
			st64(a, i)
			return r0
		}
		if (d > g - h) {
			ErrorCode_name(s78, 0x100159858, c * 0xa9, d, e)
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
			st64(s118 + 8, 0x10015a741)
			st32(sf8 + 0x78, 0x9ca /* anchor::RequireGteViolated */)
			st8(sf8 + 0x30, 2)
			st32(s118 + 0x18, 0x1b2)
			st64(s118 + 0x10, 0x1f)
			st64(s118, 0)
			fn_13e5a0(s138, s118)
			r0 = fn_1730(s148, ld64(s138), ld64(s138 + 8), g - h, d)
			i = ld64(s148)
			st64(a + 8, ld64(s148 + 8))
			st64(a, i)
			return r0
		}
		st64(a + 8, h)
		st64(a, 2)
		return r0
	}
	fn_85138(s78, 0x1001598cc)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x1001598cc, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a741)
	st32(sf8 + 0x78, 0x1789 /* error::InvalidRewardIndex */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0x1ad)
	st64(s118 + 0x10, 0x1f)
	st64(s118, 0)
	r0 = fn_13e5a0(s128, s118)
	i = ld64(s128)
	st64(a + 8, ld64(s128 + 8))
	st64(a, i)
	return r0
}

export function fn_6cf80(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let h: u64
	if (3 > c) {
		const f = b + c * 0xa9
		const g = ld64(f + 0x1b6)
		if (g > g + d) {
			r0 = fn_88360(s138, 0x26)
			h = ld64(s138)
			st64(a + 8, ld64(s138 + 8))
			st64(a, h)
			return r0
		}
		st64(f + 0x1b6, g + d)
		st64(a + 8, g + d)
		st64(a, 2)
		return r0
	}
	fn_85138(s78, 0x1001598cc)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x1001598cc, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a741)
	st32(sf8 + 0x78, 0x1789 /* error::InvalidRewardIndex */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0x1b7)
	st64(s118 + 0x10, 0x1f)
	st64(s118, 0)
	r0 = fn_13e5a0(s128, s118)
	h = ld64(s128)
	st64(a + 8, ld64(s128 + 8))
	st64(a, h)
	return r0
}

export function fn_6d240(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128
	let g, l: u64
	const f = ld16(b + 0xe3)
	if (0xfff27617 > ((c - 0x6c4f5) as u32)) {
		if (0x6c4f4 >= (c as i32)) {
			if (f == 0) {
				fn_1548e8(0x1001603b0, 0xfff27617, c, d, e)
			}
			g = f * 0x3c
			const i = 0x6c4f4 / g
			const j = i * g
			const k = ((j as u32) != 0x6c4f4 ? ~i : -i) * g
			if ((k as i32) != k) {
				fn_1547e0(0x1001603e0, k as i32, j as u32, d, e)
			}
			if ((k as u32) == (c as u32)) {
				l = sar((fn_1561f0(c as i32, g) << 0x20) + 0x20000000000, 0x20)
				st64(a + 8, l)
				st64(a, 2)
				return l
			}
		}
	} else {
		if (f == 0) {
			fn_154940(0x1001603f8, 0xfff27617, c, d, e)
		}
		g = f * 0x3c
		if (fn_158b50(c as i32, g) == 0) {
			l = sar((fn_1561f0(c as i32, g) << 0x20) + 0x20000000000, 0x20)
			st64(a + 8, l)
			st64(a, 2)
			return l
		}
	}
	fn_85138(s78, 0x100159838)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x100159838, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a741)
	st32(sf8 + 0x78, 0x1774 /* error::InvalidTickIndex */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0x1c0)
	st64(s118 + 0x10, 0x1f)
	st64(s118, 0)
	l = fn_13e5a0(s128, s118)
	const h = ld64(s128)
	st64(a + 8, ld64(s128 + 8))
	st64(a, h)
	return l
}

export function fn_6d670(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, sa8 = fp - 0xa8, sc0 = fp - 0xc0, sc7 = fp - 0xc7, sc8 = fp - 0xc8, se8 = fp - 0xe8, s148 = fp - 0x148, s150 = fp - 0x150, s168 = fp - 0x168, s188 = fp - 0x188, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s268 = fp - 0x268, s270 = fp - 0x270, s278 = fp - 0x278, s280 = fp - 0x280, s288 = fp - 0x288, s290 = fp - 0x290, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8
	let i, v, y, z, am: u64
	let j = a
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 4) & -4 : 0x300007ffc
	if (0x300000008 > g) {
		alloc_handle_alloc_error(4, 4)
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st32(g, d)
	st64(s188, 1, g, 1)
	const h = fn_6f618(b, s188)
	if (h != 0) {
		if (c != 0) {
			const t = ld64(c)
			copyr(s1a8, t, 0x20)
			const u = ld16(b + 0x17f)
			st64(s228, b + 0x17f, j)
			st64(s188, 0x10015984c)
			st64(s148, u != 0 ? b + 0x17f : 1, (u != 0) << 1, b)
			st64(s268 + 0x28, b + 0x61)
			st64(s168 + 0x10, b + 0x61)
			st64(s268 + 0x30, b + 0x41)
			st64(s168, b + 0x41)
			st64(s268 + 0x38, b + 1)
			st64(s188 + 0x10, b + 1)
			st64(s148 + 0x18, 1)
			st64(s150, 0x20)
			st64(s168 + 8, 0x20)
			st64(s188 + 0x18, 0x20)
			st64(s188 + 8, 4)
			st64(s28, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
			// PDA create_program_address(["pool", *(b + 1), *(b + 0x41), *(b + 0x61), (u != 0 ? b + 0x17f : 1)[..(u != 0) << 1], b[..1]], program *s28)
			Pubkey_create_program_address(sc8, s188, 6, s28, h)
			if (ld8(sc8) != 1) {
				copyr(s48, sc7, 0x20)
				st64(s28, 0x1001595c0, 0x20, s48, 0x20)
				st64(sc8, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
				// PDA find_program_address(["pool_tick_array_bitmap_extension", *s48], program *sc8)
				Pubkey_find_program_address(s188, s28, 2, sc8)
				copyr(se8, s188, 0x20)
				if ((memcmp(s1a8, se8, 0x20) as u32) != 0) {
					ErrorCode_name(s48, 0x100159874)
					st64(s28, 0, 1, 0)
					st64(sa8, s28, 0x10015f818)
					st8(sa8 + 0x18, 3)
					st64(sa8 + 0x10, 0x20)
					st64(sc0 + 8, 0)
					st64(sc8, 0)
					if (ErrorCode_fmt(0x100159874, sc8) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
					}
					copyr(s150, s28, 0x18)
					copy(s168, s48, 0x18)
					st64(s188 + 8, 0x10015a741)
					st32(s148 + 0x58, 0x9c6 /* anchor::RequireKeysEqViolated */)
					st8(s148 + 0x10, 2)
					st32(s188 + 0x18, 0x1db)
					st64(s188 + 0x10, 0x1f)
					st64(s188, 0)
					const aq = fn_13e5a0(s1b8, s188)
					const ao = ld16(b + 0x17f)
					const ap = ld64(s228)
					st64(s228, ld64(s1b8 + 8))
					st64(s268 + 0x20, ld64(s1b8))
					st64(s148 + 0x10, b)
					st64(s168 + 0x10, ld64(s268 + 0x28))
					st64(s168, ld64(s268 + 0x30))
					st64(s188 + 0x10, ld64(s268 + 0x38))
					st64(s188, 0x10015984c)
					st64(s148, ao != 0 ? ap : 1, (ao != 0) << 1)
					st64(s148 + 0x18, 1)
					st64(s150, 0x20)
					st64(s168 + 8, 0x20)
					st64(s188 + 0x18, 0x20)
					st64(s188 + 8, 4)
					st64(s28, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
					// PDA create_program_address(["pool", *(ld64(s268 + 0x38)), *(ld64(s268 + 0x30)), *(ld64(s268 + 0x28)), (ao != 0 ? ap : 1)[..(ao != 0) << 1], b[..1]], program *s28)
					Pubkey_create_program_address(sc8, s188, 6, s28, aq)
					if (ld8(sc8) != 1) {
						copyr(se8, sc7, 0x20)
						st64(s48, 0x1001595c0, 0x20, se8, 0x20, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */)
						// PDA find_program_address(["pool_tick_array_bitmap_extension", *se8], program *s28)
						const ar = Pubkey_find_program_address(sc8, s48, 2, s28)
						copyr(s168, sc8, 0x20)
						copy(s188, s1a8, 0x20)
						am = Error_with_pubkeys(s1c8, ld64(s268 + 0x20), ld64(s228), s188, ar)
						i = ld64(s1c8)
						j = ld64(s228 + 8)
						st64(j + 8, ld64(s1c8 + 8))
						st64(j, i)
						return am
					}
					st8(s48, ld8(sc7))
					fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s48, 0x100160228, 0x100160248)
				}
				am = fn_5ec0(s188, c)
				let w = undef
				let x = undef
				v = ld64(s188 + 8)
				i = ld64(s188)
				j = ld64(s228 + 8)
				if (i == 2) {
					if (ld8(v + 0x29) != 0) {
						const at = ld64(v + 0x10)
						if (ld64(at + 0x10) != 0) {
							st64(s188, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
							am = fn_13e628(s1e8, s188)
							i = ld64(s1e8)
							j = ld64(s228 + 8)
							st64(j + 8, ld64(s1e8 + 8))
							st64(j, i)
							return am
						}
						let av = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
						st64(at + 0x10, -1)
						const au = ld64(at + 0x20)
						if (au >= 8) {
							av = 0xbba /* anchor::AccountDiscriminatorMismatch */
							x = ld64(at + 0x18)
							w = 0x998b8061db24963c /* account:TickArrayBitmapExtension */
							if (ld64(x) == 0x998b8061db24963c /* account:TickArrayBitmapExtension */) {
								if (au > 0x727) {
									const aw = x + 8
									am = fn_77538(s1f8, aw, d, ld16(b + 0xe3), aw, am)
									v = ld64(s1f8 + 8)
									i = ld64(s1f8)
									st64(at + 0x10, ld64(at + 0x10) + 1)
									j = ld64(s228 + 8)
									st64(j + 8, v)
									st64(j, i)
									return am
								}
								fn_153158(0x728, au, 0x10015f718, 0x998b8061db24963c /* account:TickArrayBitmapExtension */, x)
							}
						}
						am = anchor_error_from(s208, av, av, w, x)
						v = ld64(s208 + 8)
						i = ld64(s208)
						st64(at + 0x10, ld64(at + 0x10) + 1)
						j = ld64(s228 + 8)
						st64(j + 8, v)
						st64(j, i)
						return am
					}
					am = anchor_error_from(s1d8, 0xbbe /* anchor::AccountNotMutable */, undef, w, x)
					i = ld64(s1d8)
					st64(j + 8, ld64(s1d8 + 8))
					st64(j, i)
					return am
				}
				st64(j + 8, v)
				st64(j, i)
				return am
			}
			st8(s48, ld8(sc7))
			fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s48, 0x100160228, 0x100160248)
		}
		am = fn_88360(s218, 0x23)
		i = ld64(s218)
		st64(j + 8, ld64(s218 + 8))
		st64(j, i)
		return am
	}
	am = fn_6d240(s188, b, d)
	i = ld64(s188)
	if (i != 2) {
		st64(j + 8, ld64(s188 + 8))
		st64(j, i)
		return am
	}
	B20: {
		st64(s228 + 8, j)
		const k = ld64(s188 + 8)
		st64(s268 + 0x38, ld64(b + 0x3f8))
		st64(s270, ld64(b + 0x3f0))
		st64(s280, ld64(b + 0x3e8))
		st64(s290, ld64(b + 0x3e0))
		y = ld64(b + 0x3d8)
		copyr(s268, b + 0x3a0, 0x38)
		st64(s278, ld64(b + 0x398))
		st64(s288, ld64(b + 0x390))
		z = ld64(b + 0x388)
		st64(s228, ld64(b + 0x380))
		memset2(sc0, 0, 0x78)
		st64(sc8, 1)
		memset2(s188, 0, 0x80)
		if (0x3ff >= k) {
			let m = s188 + (k >> 6 << 3)
			let l = sc8
			let n = (k >> 6) - 1
			while (true) {
				st64(m, ld64(l) << (k & 0x3f))
				l = l + 8
				m = m + 8
				n = n + 1
				if (n >= 0xf) {
					if (k > 0x3bf) {
						break
					}
					if ((k & 0x3f) == 0) {
						break
					}
					let q = sc8
					let r = (k >> 6) - 1
					let o = (k >> 6 << 3) + s188 + 8
					while (true) {
						const s = ld64(o)
						const p = s + (ld64(q) >> (-k & 0x3f))
						if (s > p) {
							fn_154730(0x1001609a0, o, q, p, s > p)
						}
						st64(o, p)
						o = o + 8
						q = q + 8
						r = r + 1
						if (r >= 0xe) {
							break B20
						}
					}
				}
			}
		}
	}
	st64(s298, ld64(s148 + 0x18) ^ y)
	st64(s290, ld64(s148 + 0x20) ^ ld64(s290))
	st64(s2a0, ld64(s148 + 0x28) ^ ld64(s280))
	st64(s2a8, ld64(s148 + 0x30) ^ ld64(s270))
	st64(s270, ld64(s188 + 8) ^ z)
	st64(s280, ld64(s188 + 0x10) ^ ld64(s288))
	st64(s278, ld64(s188 + 0x18) ^ ld64(s278))
	const aa = ld64(s168)
	const ab = ld64(s268)
	const ac = ld64(s168 + 8)
	const ad = ld64(s268 + 8)
	am = ld64(s168 + 0x10) ^ ld64(s268 + 0x10)
	const ae = ld64(s150)
	const af = ld64(s268 + 0x18)
	const ag = ld64(s148)
	const ah = ld64(s268 + 0x20)
	const ai = ld64(s148 + 8)
	const aj = ld64(s268 + 0x28)
	const ak = ld64(s148 + 0x10)
	const al = ld64(s268 + 0x30)
	const an = ld64(s188)
	st64(b + 0x3f8, ld64(s148 + 0x38) ^ ld64(s268 + 0x38))
	st64(b + 0x3f0, ld64(s2a8))
	st64(b + 0x3e8, ld64(s2a0))
	st64(b + 0x3e0, ld64(s290))
	st64(b + 0x3d8, ld64(s298))
	st64(b + 0x3d0, ak ^ al)
	st64(b + 0x3c8, ai ^ aj)
	st64(b + 0x3c0, ag ^ ah)
	st64(b + 0x3b8, ae ^ af)
	st64(b + 0x3b0, am)
	st64(b + 0x3a8, ac ^ ad)
	st64(b + 0x3a0, aa ^ ab)
	st64(b + 0x398, ld64(s278))
	st64(b + 0x390, ld64(s280))
	st64(b + 0x388, ld64(s270))
	v = ld64(s228)
	st64(b + 0x380, an ^ v)
	j = ld64(s228 + 8)
	st64(j + 8, v)
	st64(j, 2)
	return am
}

export function fn_6e930(a: u64, b: u64, c: u64, d: u64): u64 {
	const s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0
	let i, j, k, n, p, q, r, s, v, y, ad, ae, ah, ai: u64
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 4) & -4 : 0x300007ffc
	if (0x300000008 > g) {
		alloc_handle_alloc_error(4, 4)
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	const h = ld32(b + 0x105)
	st32(g, h as i32)
	st64(s80, 1, g, 1)
	if (fn_6f618(b, s80) != 0) {
		if (c == 0) {
			k = fn_88360(sc0, 0x23)
			i = ld64(sc0)
			st64(a + 8, ld64(sc0 + 8))
			st64(a, i)
			return k
		}
		k = fn_5ec0(s90, c)
		j = ld64(s90 + 8)
		i = ld64(s90)
		if (i != 2) {
			st64(a + 8, j)
			st64(a, i)
			return k
		}
		ah = d
		k = fn_49f0(s80, j, k)
		j = ld64(s80 + 0x10)
		if (ld64(s80) != 0) {
			i = ld64(s80 + 8)
			st64(a + 8, j)
			st64(a, i)
			return k
		}
		const ag = j
		const o = ld16(b + 0xe3)
		if (o == 0) {
			fn_1548e8(0x1001603b0, j, p, q, r)
		}
		const af = ld64(s80 + 8)
		ai = o
		s = o * 0x3c
		let t = fn_1561f0(h as i32, s)
		y = undef
		if (0 > (h as i32) && (-(h as i32) as u32) % s != 0) {
			t = (t as i32) - 1
			if ((t as i32) != t) {
				fn_154788(0x1001603c8, y, ad, ae, v)
			}
		}
		const u = (t as i32) * s
		if ((u as i32) != u) {
			fn_1547e0(0x1001603e0, y, ad, ae, v)
		}
		k = fn_77278(sa0, af, u, ai, v, u)
		const w = ld64(sa0)
		if (w != 2) {
			st64(a + 8, ld64(sa0 + 8))
			st64(a, w)
			st64(ag, ld64(ag) - 1)
			return k
		}
		ai = a
		n = ld32(sa0 + 0xc)
		const x = ld8(sa0 + 8)
		st64(ag, ld64(ag) - 1)
		if (x != 0) {
			st32(ai + 0xc, n)
			st8(ai + 8, 1)
			st64(ai, 2)
			return k
		}
	} else {
		ah = d
		ai = a
		memcpy(s80, b + 0x380, 0x80)
		const l = ld16(b + 0xe3)
		k = fn_62d00(s90, s80, h as i32, l)
		const m = ld64(s90)
		if (m != 2) {
			st64(ai + 8, ld64(s90 + 8))
			st64(ai, m)
			return k
		}
		n = ld32(s90 + 0xc)
		j = ld8(s90 + 8)
		if (j != 0) {
			st32(ai + 0xc, n)
			st8(ai + 8, 1)
			st64(ai, 2)
			return k
		}
		s = l * 0x3c
		if (l == 0) {
			fn_1548e8(0x1001603b0, j, p, q, r)
		}
	}
	let z = fn_1561f0(h as i32, s)
	y = s
	const ac = ai
	if (0 > (h as i32) && (-(h as i32) as u32) % y != 0) {
		z = (z as i32) - 1
		if ((z as i32) != z) {
			fn_154788(0x1001603c8, y, ad, ae, v)
		}
	}
	const aa = (z as i32) * y
	if ((aa as i32) != aa) {
		fn_1547e0(0x1001603e0, y, ad, ae, v)
	}
	k = fn_6f068(s80, b, c, aa, ah)
	let ab = ld64(s80)
	if (ab == 2) {
		if (ld32(s80 + 8) == 0) {
			k = fn_88360(sb0, 0x24)
			ab = ld64(sb0)
			st64(ac + 8, ld64(sb0 + 8))
			st64(ac, ab)
			return k
		}
		st32(ac + 0xc, ld32(s80 + 0xc))
		st8(ac + 8, 0)
		st64(ac, 2)
		return k
	}
	st64(ac + 8, ld64(s80 + 8))
	st64(ac, ab)
	return k
}

export function fn_6f068(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s90 = fp - 0x90, sa0 = fp - 0xa0
	let j, l: u64
	const f = ld16(b + 0xe3)
	if (f != 0) {
		let g = fn_1561f0(d as i32, f * 0x3c)
		if (0 > (d as i32) && (-d as u32) % (f * 0x3c) != 0) {
			g = (g as i32) - 1
			if ((g as i32) != g) {
				fn_154788(0x1001603c8)
			}
		}
		let h = (g as i32) * (f * 0x3c)
		if ((h as i32) != h) {
			fn_1547e0(0x1001603e0, b)
		}
		let i = b + 0x380
		if (0xf > f) {
			if (c == 0) {
				memcpy(s90, i, 0x80)
				l = fn_636b8(s10, s90, h, f, e)
				j = ld64(s10)
				if (j != 2) {
					st64(a + 8, ld64(s10 + 8))
					st64(a, j)
					return l
				}
				h = ld32(s10 + 0xc)
				if (ld8(s10 + 8) != 0) {
					st32(a + 0xc, h)
					st32(a + 8, 1)
					st64(a, 2)
					return l
				}
				l = fn_88360(sa0, 0x23)
				j = ld64(sa0)
				st64(a + 8, ld64(sa0 + 8))
				st64(a, j)
				return l
			}
			while (true) {
				const p = i
				memcpy(s90, i, 0x80)
				l = fn_636b8(s10, s90, h, f, e)
				j = ld64(s10)
				if (j != 2) {
					st64(a + 8, ld64(s10 + 8))
					st64(a, j)
					return l
				}
				h = ld32(s10 + 0xc)
				if (ld8(s10 + 8) != 0) {
					st32(a + 0xc, h)
					st32(a + 8, 1)
					st64(a, 2)
					return l
				}
				l = fn_5ec0(s90, c)
				const k = ld64(s90 + 8)
				j = ld64(s90)
				if (j != 2) {
					st64(a + 8, k)
					st64(a, j)
					return l
				}
				l = fn_49f0(s90, k, l)
				const n = ld64(s90 + 0x10)
				if (ld64(s90) != 0) {
					const q = ld64(s90 + 8)
					st64(a + 8, n)
					st64(a, q)
					return l
				}
				l = fn_77cd0(s10, ld64(s90 + 8), h, f, e)
				const m = ld64(s10)
				if (m != 2) {
					st64(a + 8, ld64(s10 + 8))
					st64(a, m)
					st64(n, ld64(n) - 1)
					return l
				}
				h = ld32(s10 + 0xc)
				const o = ld8(s10 + 8)
				st64(n, ld64(n) - 1)
				if (o != 0) {
					st32(a + 0xc, h)
					st32(a + 8, 1)
					st64(a, 2)
					return l
				}
				i = p
				if (0xfff27617 > ((h - 0x6c4f5) as u32)) {
					st64(a, 2)
					st32(a + 8, 0)
					return l
				}
			}
		}
		memcpy(s90, i, 0x80)
		l = fn_636b8(s10, s90, h, f, e)
		j = ld64(s10)
		if (j != 2) {
			st64(a + 8, ld64(s10 + 8))
			st64(a, j)
			return l
		}
		h = ld32(s10 + 0xc)
		if (ld8(s10 + 8) != 0) {
			st32(a + 0xc, h)
			st32(a + 8, 1)
			st64(a, 2)
			return l
		}
		st64(a, 2)
		st32(a + 8, 0)
		return l
	}
	fn_1548e8(0x1001603b0, b, c, d, e)
}

export function fn_6f618(a: u64, b: u64): u64 {
	const s18 = fp - 0x18
	let g, i, j, k: u64
	const f = ld16(a + 0xe3)
	if (f > 0xe) {
		g = 0x6c4f4 / (f * 0x3c)
		k = g * (f * 0x3c)
		j = k as i32
		if (j != k) {
			fn_1547e0(0x1001603e0, b, g, k, j)
		}
		const q = (k as i32) + f * 0x3c
		i = q
		if ((q as i32) != q) {
			fn_154730(0x100160278, b, g, k, q as i32)
		}
		const r = (k as u32) != 0x6c4f4 ? ~g : -g
		k = f * 0x3c
		j = r * k
		g = j as i32
		if (g != j) {
			fn_1547e0(0x1001603e0, b, g, k, j)
		}
	} else {
		k = f * 0x3c
		g = f * 0x7800
		i = g
		j = -g
	}
	const h = ld64(b + 0x10)
	if (f == 0) {
		st64(s18 + 0x10, 0)
		if (h == 0) {
			return ld64(s18 + 0x10) & 1
		}
		fn_1548e8(0x1001603b0, b, g, k, j)
	}
	let m = ld64(b + 8)
	let n = h << 2
	st64(s18, i as i32, j as i32)
	while (true) {
		st64(s18 + 0x10, n != 0)
		if (n == 0) {
			return ld64(s18 + 0x10) & 1
		}
		const o = ld32(m)
		let p = fn_1561f0(o as i32, k)
		b = undef
		g = undef
		if (0 > (o as i32) && (-(o as i32) as u32) % k != 0) {
			p = (p as i32) - 1
			if ((p as i32) != p) {
				fn_154788(0x1001603c8, b, g, k)
			}
		}
		const l = (p as i32) * k
		j = ld64(s18 + 8)
		if ((l as i32) != l) {
			fn_1547e0(0x1001603e0, b, g, k, j)
		}
		if ((l as i32) >= (ld64(s18) as i64)) {
			return ld64(s18 + 0x10) & 1
		}
		m = m + 4
		n = n - 4
		if ((j as i64) > (l as i32)) {
			return ld64(s18 + 0x10) & 1
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), p6 (value)
export function fn_6f9d8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64, p13: u64, p14: u64): u64 {
	const s30 = fp - 0x30, s5e = fp - 0x5e, s70 = fp - 0x70
	let g, i, l, m, r: u64
	B19: {
		B18: {
			B10: {
				st64(b + 0xfd, p5)
				st64(b + 0xf5, d)
				st64(b + 0xed, p7)
				st64(b + 0xe5, p6)
				st32(b + 0x105, c)
				i = p12
				const h = p11
				r = p14
				l = p10
				const j = p9
				g = p8
				const f = ld8(b + 0x17e)
				if (f != 1 && (f == 2 || p13 == 0)) {
					B16: {
						if (g != 0) {
							st64(b + 0x11d, h, i)
							if (j == 0) {
								break B16
							}
						} else if (j == 0) {
							break B16
						}
						const o = ld64(b + 0x135)
						if (o > o + j) {
							break B10
						}
						i = o + j
						st64(b + 0x135, i)
					}
					if (l == 0) {
						break B19
					}
					m = ld64(b + 0x428)
					i = b + 0x428
					if (m > m + l) {
						break B10
					}
					break B18
				}
				if (g != 0) {
					st64(b + 0x10d, h, i)
				}
				if (j != 0) {
					const k = ld64(b + 0x12d)
					if (k > k + j) {
						break B10
					}
					i = k + j
					st64(b + 0x12d, i)
				}
				if (l == 0) {
					break B19
				}
				m = ld64(b + 0x420)
				i = b + 0x420
				if (m + l >= m) {
					break B18
				}
			}
			g = fn_88360(s70, 0x26)
			i = ld64(s70 + 8)
			const n = ld64(s70)
			if (n == 2) {
				break B19
			}
			st64(a + 8, i)
			st64(a, n)
			return g
		}
		st64(i, m + l)
	}
	let q = 0
	if (ld16(b + 0x440) == 0 && (ld16(b + 0x442) == 0 && (ld16(b + 0x444) == 0 && (ld32(b + 0x446) == 0 && (ld32(b + 0x44a) == 0 && (ld32(b + 0x44e) == 0 && (ld32(b + 0x452) == 0 && (ld32(b + 0x456) == 0 && ld64(b + 0x45a) == 0)))))))) {
		memcpy(s5e, b + 0x462, 0x2e)
		st64(s30 + 0x26, 0)
		st64(s30, 0, 0, 0, 0, 0)
		const p = memcmp(s5e, s30, 0x2e)
		i = undef
		g = p as u32
		q = g == 0
	}
	if ((q & 1) != 0) {
		st64(a + 8, i)
		st64(a, 2)
		return g
	}
	if ((ld8(r) & 1) == 0) {
		st64(a + 8, i)
		st64(a, 2)
		return g
	}
	const s = ld64(r + 0x1b)
	i = ld32(r + 0x17)
	st64(b + 0x44e, ld64(r + 0xf))
	st32(b + 0x456, i)
	st64(b + 0x45a, s)
	st64(a + 8, i)
	st64(a, 2)
	return g
}

export function fn_6fe30(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s10 = fp - 0x10
	let l, m: u64
	const g = ld16(b + 0xe3)
	const f = p8
	const k = ((f as u32) * g >> 0x20) != 0
	if ((d as u16) == 0) {
		l = fn_88360(s10, 0x2c)
		m = ld64(s10)
		st64(a + 8, ld64(s10 + 8))
		st64(a, m)
		return l
	}
	const h = p5
	if ((d as u16) >= (h as u16)) {
		l = fn_88360(s10, 0x2c)
		m = ld64(s10)
		st64(a + 8, ld64(s10 + 8))
		st64(a, m)
		return l
	}
	const i = p6
	if (0xd8f1 > ((i - 0x2710) as u16)) {
		l = fn_88360(s10, 0x2c)
		m = ld64(s10)
		st64(a + 8, ld64(s10 + 8))
		st64(a, m)
		return l
	}
	const j = p7
	if (0xfffe7961 > ((j - 0x186a0) as u32)) {
		l = fn_88360(s10, 0x2c)
		m = ld64(s10)
		st64(a + 8, ld64(s10 + 8))
		st64(a, m)
		return l
	}
	if ((k & 1) == 0) {
		st32(b + 0x44a, f)
		st32(b + 0x446, j)
		st16(b + 0x444, i)
		st16(b + 0x442, h)
		st16(b + 0x440, d)
		st64(b + 0x488, 0)
		st64(b + 0x482, 0)
		st64(b + 0x47a, 0)
		st64(b + 0x472, 0)
		st64(b + 0x46a, 0)
		st64(b + 0x462, 0)
		st64(b + 0x45a, 0)
		st64(b + 0x452, 0)
		if (g != 0) {
			l = fn_1561f0(c as i32, g)
			if ((c as i32) > -1) {
				st32(b + 0x44e, l)
				st64(a + 8, undef)
				st64(a, 2)
				return l
			}
			if (((c - l * g) as u32) == 0) {
				st32(b + 0x44e, l)
				st64(a + 8, undef)
				st64(a, 2)
				return l
			}
			l = (l as i32) - 1
			if ((l as i32) != l) {
				fn_154788(0x1001602c0)
			}
			st32(b + 0x44e, l)
			st64(a + 8, undef)
			st64(a, 2)
			return l
		}
		fn_154940(0x1001602a8, k & 1, h, d, j)
	}
	l = fn_88360(s10, 0x2c)
	m = ld64(s10)
	st64(a + 8, ld64(s10 + 8))
	st64(a, m)
	return l
}

export function fn_70108(a: u64, b: u64, c: AccountInfo, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s30 = fp - 0x30, s38 = fp - 0x38, s48 = fp - 0x48, s49 = fp - 0x49, s50 = fp - 0x50, s70 = fp - 0x70, s90 = fp - 0x90, sf8 = fp - 0xf8, s110 = fp - 0x110, s118 = fp - 0x118, s120 = fp - 0x120, s130 = fp - 0x130, s150 = fp - 0x150, s170 = fp - 0x170, s190 = fp - 0x190, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s208 = fp - 0x208, s210 = fp - 0x210, s218 = fp - 0x218, s220 = fp - 0x220, s228 = fp - 0x228
	let i, j, m, z, be: u64
	B5: {
		B3: {
			st64(s208 + 0x18, a)
			const g = ld64(e - 0xff0)
			st64(s210, ld64(e - 0x1000))
			const f = ld64(e - 0xff8)
			st64(s208, g, d, b)
			if (0xfff27617 > ((f - 0x6c4f5) as u32)) {
				if ((f as i32) > 0x6c4f4) {
					break B3
				}
				const t = ld64(s208)
				if ((t as u16) == 0) {
					fn_1548e8(0x1001603b0, t as u16, g, d, e)
				}
				let u = 0x6c4f4 / ((t as u16) * 0x3c)
				let w = -u
				const v = (u * ((t as u16) * 0x3c)) as u32
				if (v != 0x6c4f4) {
					u = ~u
					w = u
				}
				const x = w * ((t as u16) * 0x3c)
				if ((x as i32) != x) {
					fn_1547e0(0x1001603e0, x as i32, u, v, e)
				}
				if ((x as u32) != (f as u32)) {
					break B3
				}
			} else {
				if ((g as u16) == 0) {
					fn_154940(0x1001603f8, g as u16, g, d, e)
				}
				if (fn_158b50(f as i32, (g as u16) * 0x3c) != 0) {
					break B3
				}
			}
			B27: {
				const y = memcmp(c.owner, 0x100159560, 0x20)
				st64(s218, y)
				if ((y as u32) == 0) {
					const aj = ld64(s210)
					copyr(s70, aj, 0x20)
					st64(s110, s90)
					st64(s120, s70)
					st64(s150, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */, 0x10015a23e)
					st32(s90, bswap32(f))
					st64(s110 + 8, 4)
					st64(s118, 0x20)
					st64(s130 + 8, 0xa)
					// PDA find_program_address(["tick_array", *aj, u32 bswap32(f)], program *s150)
					Pubkey_find_program_address(s48, s130, 3, s150)
					copyr(s170, s48, 0x20)
					st64(s220, ld8(s28))
					const ak = c.key
					copyr(s130, ak, 0x20)
					if ((memcmp(s170, s130, 0x20) as u32) == 0) {
						copyr(s90, s150, 0x20)
						const ap: LamportsCell = c.lamports
						rc_inc(ap)
						const aq: DataCell = c.data
						rc_inc(aq)
						st64(s228, c.owner)
						const au = c.rent_epoch
						const at = c.is_signer
						const ar = c.is_writable
						st8(s20 + 2, c.executable)
						st8(s20, at, ar)
						st64(s28, au)
						st64(s30, ld64(s228))
						st64(s48, ak, ap, aq)
						const av = ld64(s210)
						copyr(s70, av, 0x20)
						st32(s50, bswap32(f))
						st64(s110 + 0x10, s49)
						st64(s110, s50)
						st64(s120, s70)
						st64(s130, 0x10015a23e)
						st8(s49, ld64(s220))
						st64(sf8, 1)
						st64(s110 + 8, 4)
						st64(s118, 0x20)
						st64(s130 + 8, 0xa)
						m = fn_82dd0(s1c8, s90, ld64(s208 + 0x10), ld64(s208 + 8), s48, s130, 4, 0x2800)
						const aw = ld64(s1c8)
						if (aw == 2) {
							m = fn_84740(s130, c)
							i = ld64(s130 + 8)
							j = ld64(s130)
							const ax = ld8(s110 + 0xa)
							if (ax == 2) {
								const bh = ld64(s208 + 0x18)
								st64(bh + 8, i)
								st64(bh, j)
								st8(bh + 0x2a, 2)
							} else {
								st16(s20, ld16(s110 + 8))
								copyr(s30, s118, 0x10)
								st32(s20 + 3, ld32(s110 + 0xb))
								st8(s20 + 7, ld8(s110 + 0xf))
								st64(s220, ax)
								st8(s20 + 2, ax)
								st64(s48, j, i)
								const ay = ld64(s120)
								st64(s38, ay)
								m = fn_849c0(s130, ay, ld8(s20 + 1), undef, undef, m)
								const ba = ld64(s120)
								const bb = ld64(s130 + 8)
								if (ld64(s130) != 0) {
									const az = ld64(s208 + 0x18)
									st64(az + 8, ba)
									st64(az, bb)
									st8(az + 0x2a, 2)
								} else {
									st64(s228, ba)
									m = fn_71530(s1d8, bb, f, ld64(s208), ld64(s210))
									const bi = ld64(s1d8)
									if (bi == 2) {
										const bj = ld64(s228)
										st64(bj, ld64(bj) + 1)
										st16(s190 + 0x18, ld16(s20))
										copyr(s190, s38, 0x18)
										st32(s1a8 + 0x10, ld32(s20 + 3))
										st8(s1a8 + 0x14, ld8(s20 + 7))
										z = ld64(s220)
										break B27
									}
									const bl = ld64(s1d8 + 8)
									const bk = ld64(s208 + 0x18)
									st64(bk, bi, bl)
									st8(bk + 0x2a, 2)
									const bm = ld64(s228)
									st64(bm, ld64(bm) + 1)
								}
								m = ptr_drop_in_place_f5e8(s48, m)
							}
						} else {
							const bg = ld64(s1c8 + 8)
							const bf = ld64(s208 + 0x18)
							st64(bf, aw, bg)
							st8(bf + 0x2a, 2)
						}
						be = c + 0x10
						const bn: LamportsCell = c.lamports
						if (rc_release(bn)) {
							m = Rc_drop_slow_14df0(c + 8, m)
						}
						const bo = ld64(be)
						if (rc_release(bo)) {
							return Rc_drop_slow_14df0(be, m)
						}
						return m
					}
					ErrorCode_name(s90, 0x100159874)
					st64(s70, 0, 1, 0)
					st64(s28, s70, 0x10015f818)
					st8(s20 + 0x10, 3)
					st64(s20 + 8, 0x20)
					st64(s38, 0)
					st64(s48, 0)
					if (ErrorCode_fmt(0x100159874, s48) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
					}
					copyr(sf8, s70, 0x18)
					copy(s110, s90, 0x18)
					st64(s130 + 8, 0x10015a7af)
					st32(sf8 + 0x60, 0x9c6 /* anchor::RequireKeysEqViolated */)
					st8(sf8 + 0x18, 2)
					st32(s118, 0x4d)
					st64(s120, 0x25)
					st64(s130, 0)
					const ao = fn_13e5a0(s1a8, s130)
					const an = ld64(s1a8 + 8)
					const am = ld64(s1a8)
					const al = c.key
					copyr(s110, al, 0x20)
					copy(s130, s170, 0x20)
					m = Error_with_pubkeys(s1b8, am, an, s130, ao)
					i = ld64(s1b8 + 8)
					j = ld64(s1b8)
					break B5
				}
				m = fn_84360(s130, c)
				i = ld64(s130 + 8)
				j = ld64(s130)
				z = ld8(s110 + 0xa)
				if (z == 2) {
					break B5
				}
				st16(s190 + 0x18, ld16(s110 + 8))
				copyr(s190, s120, 0x18)
				st32(s1a8 + 0x10, ld32(s110 + 0xb))
				st8(s1a8 + 0x14, ld8(s110 + 0xf))
			}
			const aa = ld64(s208 + 0x18)
			st64(aa + 8, i)
			st64(aa, j)
			copy(aa + 0x10, s190, 0x18)
			st16(aa + 0x28, ld16(s190 + 0x18))
			st8(aa + 0x2a, z)
			st32(aa + 0x2b, ld32(s1a8 + 0x10))
			st8(aa + 0x2f, ld8(s1a8 + 0x14))
			if ((ld64(s218) as u32) == 0) {
				const bc: LamportsCell = c.lamports
				if (rc_release(bc)) {
					m = Rc_drop_slow_14df0(c + 8, m)
				}
				const bd: DataCell = c.data
				be = c + 0x10
				if (!rc_release(bd)) {
					return m
				}
				return Rc_drop_slow_14df0(be, m)
			}
			const ab = ld64(s208 + 8)
			const ac = ld64(ab + 8)
			if (rc_release(ac)) {
				m = Rc_drop_slow_14df0(ab + 8, m)
			}
			const ad = ld64(ab + 0x10)
			const ag = ld64(s208 + 0x10)
			if (rc_release(ad)) {
				m = Rc_drop_slow_14df0(ab + 0x10, m)
			}
			const ae: LamportsCell = c.lamports
			if (rc_release(ae)) {
				m = Rc_drop_slow_14df0(c + 8, m)
			}
			const af: DataCell = c.data
			if (rc_release(af)) {
				m = Rc_drop_slow_14df0(c + 0x10, m)
			}
			const ah = ld64(ag + 8)
			if (rc_release(ah)) {
				m = Rc_drop_slow_14df0(ag + 8, m)
			}
			const ai = ld64(ag + 0x10)
			be = ag + 0x10
			if (rc_release(ai)) {
				return Rc_drop_slow_14df0(be, m)
			}
			return m
		}
		fn_85138(s90, 0x100159838)
		st64(s70, 0, 1, 0)
		st64(s28, s70, 0x10015f818)
		st8(s20 + 0x10, 3)
		st64(s20 + 8, 0x20)
		st64(s38, 0)
		st64(s48, 0)
		if (fn_88558(0x100159838, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(sf8, s70, 0x18)
		copy(s110, s90, 0x18)
		st64(s130 + 8, 0x10015a7af)
		st32(sf8 + 0x60, 0x1774 /* error::InvalidTickIndex */)
		st8(sf8 + 0x18, 2)
		st32(s118, 0x3f)
		st64(s120, 0x25)
		st64(s130, 0)
		m = fn_13e5a0(s1e8, s130)
		i = ld64(s1e8 + 8)
		j = ld64(s1e8)
	}
	const h = ld64(s208 + 0x18)
	st64(h + 8, i)
	st64(h, j)
	st8(h + 0x2a, 2)
	const k = ld64(s208 + 8)
	const l = ld64(k + 8)
	if (rc_release(l)) {
		m = Rc_drop_slow_14df0(k + 8, m)
	}
	const n = ld64(k + 0x10)
	const q = ld64(s208 + 0x10)
	if (rc_release(n)) {
		m = Rc_drop_slow_14df0(k + 0x10, m)
	}
	const o: LamportsCell = c.lamports
	if (rc_release(o)) {
		m = Rc_drop_slow_14df0(c + 8, m)
	}
	const p: DataCell = c.data
	if (rc_release(p)) {
		m = Rc_drop_slow_14df0(c + 0x10, m)
	}
	const r = ld64(q + 8)
	if (rc_release(r)) {
		m = Rc_drop_slow_14df0(q + 8, m)
	}
	const s = ld64(q + 0x10)
	be = q + 0x10
	if (rc_release(s)) {
		return Rc_drop_slow_14df0(be, m)
	}
	return m
}

export function fn_71530(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s30 = fp - 0x30, s40 = fp - 0x40
	let i: u64
	if (0xfff27617 > ((c - 0x6c4f5) as u32)) {
		if (0x6c4f4 >= (c as i32)) {
			if ((d as u16) == 0) {
				fn_1548e8(0x1001603b0, 0xfff27617, c, d as u16, e)
			}
			const k = 0x6c4f4 / ((d as u16) * 0x3c)
			const l = (((k * ((d as u16) * 0x3c)) as u32) != 0x6c4f4 ? ~k : -k) * ((d as u16) * 0x3c)
			if ((l as i32) != l) {
				fn_1547e0(0x1001603e0, l as i32, c, (d as u16) * 0x3c, e)
			}
		}
	} else if ((d as u16) == 0) {
		fn_154940(0x1001603f8, 0xfff27617, c, d as u16, e)
	}
	st32(b + 0x20, c)
	copy(b, e, 0x20)
	let j = clock_get(s30)
	if (ld64(s30) != 0) {
		const g = ld64(s30 + 8)
		const f = ld64(s30 + 0x10)
		st64(s30 + 0x10, ld64(s30 + 0x18))
		st64(s30, g, f)
		j = fn_13e628(s40, s30)
		i = ld64(s40 + 8)
		const h = ld64(s40)
		if (h != 2) {
			st64(a + 8, i)
			st64(a, h)
			return j
		}
		st64(b + 0x2785, i)
		st64(a + 8, i)
		st64(a, 2)
		return j
	}
	i = ld64(s30 + 0x18)
	st64(b + 0x2785, i)
	st64(a + 8, i)
	st64(a, 2)
	return j
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
export function fn_717b0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10
	const h = fn_71a20(s10, ld32(b + 0x20), c, d, e)
	const f = ld64(s10)
	if (f != 2) {
		st64(a + 8, ld64(s10 + 8))
		st64(a, f)
		return h
	}
	const g = ld64(s10 + 8)
	if (0x3c > g) {
		st64(a + 8, b + 0x24 + g * 0xa8)
		st64(a, 2)
		return h
	}
	fn_14ec98(g, 0x3c, 0x1001602d8)
}

export function fn_71878(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s30 = fp - 0x30, s40 = fp - 0x40
	let j: u64
	let k = fn_71a20(s30, ld32(b + 0x20), c, d, e)
	let f = ld64(s30)
	if (f != 2) {
		st64(a + 8, ld64(s30 + 8))
		st64(a, f)
		return k
	}
	const g = ld64(s30 + 8)
	if (0x3c > g) {
		memcpy(b + 0x24 + g * 0xa8, e, 0xa8)
		k = clock_get(s30)
		if (ld64(s30) != 0) {
			const i = ld64(s30 + 8)
			const h = ld64(s30 + 0x10)
			st64(s30 + 0x10, ld64(s30 + 0x18))
			st64(s30, i, h)
			k = fn_13e628(s40, s30)
			j = ld64(s40 + 8)
			f = ld64(s40)
			if (f == 2) {
				st64(b + 0x2785, j)
				st64(a + 8, j)
				st64(a, 2)
				return k
			}
			st64(a + 8, j)
			st64(a, f)
			return k
		}
		j = ld64(s30 + 0x18)
		st64(b + 0x2785, j)
		st64(a + 8, j)
		st64(a, 2)
		return k
	}
	fn_14ec98(g, 0x3c, 0x100160308)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
export function fn_71a20(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let i: u64
	if ((d as u16) != 0) {
		let f = fn_1561f0(c as i32, (d as u16) * 0x3c)
		if (0 > (c as i32) && (-c as u32) % ((d as u16) * 0x3c) != 0) {
			f = (f as i32) - 1
			if ((f as i32) != f) {
				fn_154788(0x1001603c8)
			}
		}
		const g = (f as i32) * ((d as u16) * 0x3c)
		if ((g as i32) != g) {
			fn_1547e0(0x1001603e0)
		}
		if ((g as u32) != (b as u32)) {
			fn_85138(s78, 0x100159828)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (fn_88558(0x100159828, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copy(sf8, s78, 0x30)
			st64(s118 + 8, 0x10015a7af)
			st32(sf8 + 0x78, 0x1779 /* error::InvalidTickArray */)
			st8(sf8 + 0x30, 2)
			st32(s118 + 0x18, 0xaa)
			st64(s118 + 0x10, 0x25)
			st64(s118, 0)
			fn_13e5a0(s128, s118)
			i = fn_3158(s138, ld64(s128), ld64(s128 + 8), g, b)
			const j = ld64(s138)
			st64(a + 8, ld64(s138 + 8))
			st64(a, j)
			return i
		}
		const h = (c as i32) - (b as i32)
		if ((h as i32) != h) {
			fn_154788(0x100160320, d as u16, g as u32)
		}
		i = fn_1561f0(h as i32, d as u16) as i32
		st64(a + 8, i)
		st64(a, 2)
		return i
	}
	fn_1548e8(0x1001603b0, b, c, d as u16, e)
}

export function fn_71ee0(a: u64, b: u64, c: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let k: u64
	if (c != 0) {
		let i = 0
		while (true) {
			if (i == -0x2760) {
				fn_85138(s78, 0x100159828)
				st64(s60, 0, 1, 0)
				st64(s28, s60, 0x10015f818)
				st8(s28 + 0x18, 3)
				st64(s28 + 0x10, 0x20)
				st64(s48 + 0x10, 0)
				st64(s48, 0)
				if (fn_88558(0x100159828, s48) == 0) {
					copy(sf8, s78, 0x30)
					st64(s118 + 8, 0x10015a7af)
					st32(sf8 + 0x78, 0x1779 /* error::InvalidTickArray */)
					st8(sf8 + 0x30, 2)
					st32(s118 + 0x18, 0xbb)
					st64(s118 + 0x10, 0x25)
					st64(s118, 0)
					r0 = fn_13e5a0(s138, s118)
					k = ld64(s138)
					st64(a + 8, ld64(s138 + 8))
					st64(a, k)
					return r0
				}
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			const j = b + i
			i = i - 0xa8
			if ((ld64(j + 0x26f0) | ld64(j + 0x26f8)) != 0) {
				st64(a + 8, b + i + 0x2784)
				st64(a, 2)
				return r0
			}
			if (ld64(j + 0x2758) != 0) {
				st64(a + 8, b + i + 0x2784)
				st64(a, 2)
				return r0
			}
			if (ld64(j + 0x2760) != 0) {
				st64(a + 8, b + i + 0x2784)
				st64(a, 2)
				return r0
			}
		}
	}
	let g = 0
	while (true) {
		if (g == 0x2760) {
			fn_85138(s78, 0x100159828)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (fn_88558(0x100159828, s48) == 0) {
				copy(sf8, s78, 0x30)
				st64(s118 + 8, 0x10015a7af)
				st32(sf8 + 0x78, 0x1779 /* error::InvalidTickArray */)
				st8(sf8 + 0x30, 2)
				st32(s118 + 0x18, 0xc0)
				st64(s118 + 0x10, 0x25)
				st64(s118, 0)
				r0 = fn_13e5a0(s128, s118)
				k = ld64(s128)
				st64(a + 8, ld64(s128 + 8))
				st64(a, k)
				return r0
			}
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		const f = b + g
		if ((ld64(f + 0x38) | ld64(f + 0x40)) != 0) {
			st64(a + 8, f + 0x24)
			st64(a, 2)
			return r0
		}
		if (ld64(f + 0xa0) != 0) {
			st64(a + 8, f + 0x24)
			st64(a, 2)
			return r0
		}
		const h = b + g
		g = g + 0xa8
		if (ld64(h + 0xa8) != 0) {
			st64(a + 8, f + 0x24)
			st64(a, 2)
			return r0
		}
	}
}

export function fn_723c8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	let m, n: u64
	if ((d as u16) != 0) {
		let f = fn_1561f0(c as i32, (d as u16) * 0x3c)
		if (0 > (c as i32) && (-c as u32) % ((d as u16) * 0x3c) != 0) {
			f = (f as i32) - 1
			if ((f as i32) != f) {
				fn_154788(0x1001603c8)
			}
		}
		const g = (f as i32) * ((d as u16) * 0x3c)
		if ((g as i32) != g) {
			fn_1547e0(0x1001603e0)
		}
		let h = g << 0x20
		const i = h
		if ((h >> 0x20) != ld32(b + 0x20)) {
			st64(a + 8, 0)
			st64(a, 2)
			return h
		}
		const j = (c as i32) - sar(h, 0x20)
		if ((j as i32) == j) {
			B25: {
				h = fn_1561f0(j as i32, d as u16)
				n = undef
				if (e != 0) {
					const p = h
					if (0 > (h as i32)) {
						st64(a + 8, 0)
						st64(a, 2)
						return h
					}
					if ((p as u32) != 0) {
						h = h as u32
						let q = h * 0xa8 + b + 0xa8
						m = h
						do {
							if (h > 0x3b) {
								fn_14ec98(h, 0x3c, 0x100160380, n)
							}
							n = ld64(q - 0x70) | ld64(q - 0x68)
							if (n != 0) {
								break B25
							}
							if (ld64(q - 8) != 0) {
								break B25
							}
							if (ld64(q) != 0) {
								break B25
							}
							m = m - 1
							q = q - 0xa8
						} while (m + 1 >= 2)
					}
					if ((ld64(b + 0x38) | ld64(b + 0x40)) != 0) {
						st64(a + 8, b + 0x24)
						st64(a, 2)
						return h
					}
					if (ld64(b + 0xa0) != 0) {
						st64(a + 8, b + 0x24)
						st64(a, 2)
						return h
					}
					if (ld64(b + 0xa8) == 0) {
						st64(a + 8, 0)
						st64(a, 2)
						return h
					}
					st64(a + 8, b + 0x24)
					st64(a, 2)
					return h
				}
				const k = (h as i32) + 1
				if ((k as i32) != k) {
					fn_154730(0x100160350, undef, undef, n)
				}
				h = k as i32
				let l = h * 0xa8 + b + 0xa8
				let o = h
				do {
					m = o
					if ((o as i64) > 0x3b) {
						st64(a + 8, 0)
						st64(a, 2)
						return h
					}
					if (h > 0x3b) {
						fn_14ec98(m, 0x3c, 0x100160398, n)
					}
					n = ld64(l - 0x70) | ld64(l - 0x68)
					if (n != 0) {
						break
					}
					if (ld64(l - 8) != 0) {
						break
					}
					o = m + 1
					n = ld64(l)
					l = l + 0xa8
				} while (n == 0)
			}
			const r = m as i32
			if (m > 0x3b) {
				fn_14ec98(r, 0x3c, 0x100160368, n)
			}
			st64(a + 8, b + r * 0xa8 + 0x24)
			st64(a, 2)
			return h
		}
		fn_154788(0x100160338, i >> 0x20)
	}
	fn_1548e8(0x1001603b0, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
export function fn_72940(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	if ((b as u16) != 0) {
		let f = fn_1561f0(a as i32, (b as u16) * 0x3c)
		if (0 > (a as i32) && (-a as u32) % ((b as u16) * 0x3c) != 0) {
			f = (f as i32) - 1
			const h = f as i32
			if (h != f) {
				fn_154788(0x1001603c8)
			}
		}
		const g = (f as i32) * ((b as u16) * 0x3c)
		if ((g as i32) != g) {
			fn_1547e0(0x1001603e0)
		}
		return g
	}
	fn_1548e8(0x1001603b0, b, c, d, e)
}

export function fn_72aa0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64) {
	const s20 = fp - 0x20, s28 = fp - 0x28
	let t: u64
	st64(s28, a)
	const h = ld64(b + 0x24)
	const f = p5
	const g = ld64(b + 0x34)
	const i = ld64(b + 0x2c)
	st64(b + 0x24, c - h)
	st64(b + 0x34, f - g)
	st64(b + 0x2c, d - i - (h > c))
	st64(b + 0x3c, p6 - ld64(b + 0x3c) - (g > f))
	st64(s20, 0, 0, 0, 0)
	const j = p7
	if ((memcmp(j + 0x39, s20, 0x20) as u32) != 0) {
		const l = ld64(b + 0x44)
		const k = ld64(j + 0x99)
		const m = ld64(j + 0xa1)
		st64(b + 0x44, k - l)
		st64(b + 0x4c, m - ld64(b + 0x4c) - (l > k))
	}
	st64(s20, 0, 0, 0, 0)
	if ((memcmp(j + 0xe2, s20, 0x20) as u32) != 0) {
		const o = ld64(b + 0x54)
		const n = ld64(j + 0x142)
		const p = ld64(j + 0x14a)
		st64(b + 0x54, n - o)
		st64(b + 0x5c, p - ld64(b + 0x5c) - (o > n))
	}
	st64(s20, 0, 0, 0, 0)
	if ((memcmp(j + 0x18b, s20, 0x20) as u32) == 0) {
		t = ld64(s28)
		st64(t + 8, ld64(b + 0xc))
		st64(t, ld64(b + 4))
	} else {
		const r = ld64(b + 0x64)
		const q = ld64(j + 0x1eb)
		const s = ld64(j + 0x1f3)
		st64(b + 0x64, q - r)
		st64(b + 0x6c, s - ld64(b + 0x6c) - (r > q))
		t = ld64(s28)
		st64(t + 8, ld64(b + 0xc))
		st64(t, ld64(b + 4))
	}
}

export function fn_72df0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148
	let h: u64
	let i = fn_644c8(s118, c, r0)
	let g = ld64(s118 + 8)
	if (ld64(s118) != 1) {
		i = fn_660f8(s48, g, ld64(s118 + 0x10), d ^ 1)
		const f = ld64(s48 + 0x10)
		g = ld64(s48 + 8)
		if ((ld64(s48) & 1) != 0) {
			st64(a + 8, f)
			st64(a, g)
			return i
		}
		st64(s128, g, f)
		if (d != 0) {
			st64(s60, b, 0)
			st64(s48, 0, 1)
			i = fn_584f8(s118, s60, s128, s48)
			if (ld64(s118) == 0) {
				i = fn_88360(s138, 0x26)
				h = ld64(s138)
				st64(a + 8, ld64(s138 + 8))
				st64(a, h)
				return i
			}
		} else {
			st64(s60, b, 0)
			st64(s48, 0, 1)
			i = fn_584f8(s118, s60, s48, s128)
			if (ld64(s118) == 0) {
				i = fn_88360(s138, 0x26)
				h = ld64(s138)
				st64(a + 8, ld64(s138 + 8))
				st64(a, h)
				return i
			}
		}
		if (ld64(s118 + 0x10) == 0) {
			st64(a + 8, ld64(s118 + 8))
			st64(a, 2)
			return i
		}
		fn_85138(s78, 0x100159848)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_88558(0x100159848, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(sf8, s78, 0x30)
		st64(s118 + 8, 0x10015a7af)
		st32(sf8 + 0x78, 0x1796 /* error::CalculateOverflow */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x1a1)
		st64(s118 + 0x10, 0x25)
		st64(s118, 0)
		i = fn_13e5a0(s148, s118)
		h = ld64(s148)
		st64(a + 8, ld64(s148 + 8))
		st64(a, h)
		return i
	}
	st64(a + 8, ld64(s118 + 0x10))
	st64(a, g)
	return i
}

export function fn_73230(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148
	let f, g, h: u64
	if (d != 0) {
		st64(s60, b, 0)
		st64(s48, 0, 1)
		h = fn_58930(s118, s60, c, s48)
		if (ld64(s118) == 0) {
			h = fn_88360(s138, 0x26)
			g = ld64(s138)
			st64(a + 8, ld64(s138 + 8))
			st64(a, g)
			return h
		}
		f = ld64(s118 + 8)
		if (ld64(s118 + 0x10) == 0) {
			st64(a + 8, f)
			st64(a, 2)
			return h
		}
	} else {
		st64(s60, b, 0)
		st64(s48, 0, 1)
		h = fn_58930(s118, s60, s48, c)
		if (ld64(s118) == 0) {
			h = fn_88360(s128, 0x26)
			g = ld64(s128)
			st64(a + 8, ld64(s128 + 8))
			st64(a, g)
			return h
		}
		f = ld64(s118 + 8)
		if (ld64(s118 + 0x10) == 0) {
			st64(a + 8, f)
			st64(a, 2)
			return h
		}
	}
	fn_85138(s78, 0x100159848)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x100159848, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a7af)
	st32(sf8 + 0x78, 0x1796 /* error::CalculateOverflow */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0x1db)
	st64(s118 + 0x10, 0x25)
	st64(s118, 0)
	h = fn_13e5a0(s148, s118)
	g = ld64(s148)
	st64(a + 8, ld64(s148 + 8))
	st64(a, g)
	return h
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: p5 (value), p6 (value)
export function fn_735f0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s260 = fp - 0x260, s278 = fp - 0x278, s280 = fp - 0x280
	let k, l, s, t, u, v, x, ah, aj, ak, al, am, an, ar, ay, az, bc, bj: u64
	st64(s260 + 0x18, d)
	let f = b
	let j = a
	const h = ld64(b + 0x84)
	let g = ld64(b + 0x7c)
	st64(s260 + 0x20, h)
	const o = p9
	const n = p8
	st64(s260 + 0x10, p7)
	let i = p6
	const r = p5
	if (g > g + h) {
		st64(s260, i, j)
		st64(s278, f, g)
		fn_88360(s138, 0x26)
		i = ld64(s260)
		f = ld64(s278)
		g = ld64(s278 + 8)
		j = ld64(s260 + 8)
		l = ld64(s138 + 8)
		k = ld64(s138)
		if (k != 2) {
			st64(j + 0x10, l)
			st64(j + 8, k)
			st64(j, 1)
			return f
		}
	} else {
		l = ld64(s260 + 0x20) + g
	}
	if (c == 0) {
		st64(j + 0x18, 0)
		st64(j + 0x10, 0)
		st64(j + 8, 0)
		st64(j, 0)
		return f
	}
	if (l == 0) {
		st64(j + 0x18, 0)
		st64(j + 0x10, 0)
		st64(j + 8, 0)
		st64(j, 0)
		return f
	}
	st64(s278, f, g, l, i, j)
	const m = ld64(s260 + 0x18)
	f = fn_660f8(s118, n, o, m ^ 1)
	const q = ld64(s118 + 0x10)
	k = ld64(s118 + 8)
	const p = ld64(s118)
	if (p != 0) {
		j = ld64(s260 + 8)
		st64(j + 0x10, q)
		st64(j + 8, k)
		st64(j, 1)
		return f
	}
	B29: {
		st64(s128, k, q)
		if (r != 0) {
			ah = 0
			const aa = ld64(s260)
			const z = ld64(s260 + 0x10)
			let ab = c
			if (z != 0) {
				__multi3_159030(s188, aa as u32, 0, ab, 0)
				const ac = ld64(s188)
				st64(s60, ac + 0xf423f)
				st64(s60 + 8, (ac > ac + 0xf423f) + ld64(s188 + 8))
				st64(s48, 0xf4240, 0)
				fn_100918(s118, s60, s48)
				if (ld64(s118 + 8) != 0) {
					f = fn_88360(s198, 0x26)
					k = ld64(s198)
					j = ld64(s260 + 8)
					st64(j + 0x10, ld64(s198 + 8))
					st64(j + 8, k)
					st64(j, 1)
					return f
				}
				ah = ld64(s118)
				if (ah > c) {
					fn_154788(0x100160440, undef, undef, c)
				}
				ab = c - ah
			}
			const ai = ld64(s260 + 0x18)
			st64(s280, ab)
			if (ai != 0) {
				st64(s60, ab, 0)
				st64(s48, 0, 1)
				aj = s118
				ak = s60
				al = s128
				am = s48
			} else {
				st64(s60, ab, 0)
				st64(s48, 0, 1)
				aj = s118
				ak = s60
				al = s48
				am = s128
			}
			f = fn_584f8(aj, ak, al, am)
			ay = ld64(s278 + 8)
			ar = ld64(s278)
			if (ld64(s118) == 0) {
				f = fn_88360(s1a8, 0x26)
				k = ld64(s1a8)
				j = ld64(s260 + 8)
				st64(j + 0x10, ld64(s1a8 + 8))
				st64(j + 8, k)
				st64(j, 1)
				return f
			}
			x = z
			if (ld64(s118 + 0x10) == 0) {
				an = ld64(s118 + 8)
				if (ld64(s278 + 0x10) >= an) {
					break B29
				}
			}
			const ba = ld64(s278 + 0x10)
			f = fn_73230(s118, ba, s128, m ^ 1)
			v = ld64(s118 + 8)
			u = ld64(s118)
			if (u != 2) {
				bc = ld64(s260 + 8)
				st64(bc + 0x10, v)
				st64(bc + 8, u)
				st64(bc, 1)
				return f
			}
			st64(s280, v)
			an = ba
			ay = ld64(s278 + 8)
			ar = ld64(s278)
			if (x != 0) {
				const bb = ld64(s260)
				if ((bb as u32) > 0xf4240) {
					fn_154788(0x100160458, an, bb as u32, ay, ar)
				}
				f = fn_583c8(s1b8, ld64(s280), bb as u32, (0xf4240 - bb) as u32, f)
				ah = ld64(s1b8 + 8)
				an = ld64(s278 + 0x10)
				ay = ld64(s278 + 8)
				ar = ld64(s278)
				if (ld64(s1b8) == 0) {
					f = fn_88360(s238, 0x26)
					k = ld64(s238)
					j = ld64(s260 + 8)
					st64(j + 0x10, ld64(s238 + 8))
					st64(j + 8, k)
					st64(j, 1)
					return f
				}
			}
		} else {
			B8: {
				const ad = ld64(s260)
				s = ld64(s260 + 0x10)
				t = min(ld64(s278 + 0x10), c)
				if (s == 0) {
					if ((ad as u32) > 0xf4240) {
						fn_154788(0x100160410, t, p, s)
					}
					if ((ad as u32) != 0xf4240) {
						__multi3_159030(s148, t, 0, 0xf4240, 0)
						const ae = (0xf4240 - ad) as u32
						const af = ld64(s148)
						const ag = ae + af - 1
						st64(s48, ae)
						st64(s60, ag)
						st64(s60 + 8, (af > ag) + ld64(s148 + 8))
						st64(s48 + 8, 0)
						fn_100918(s118, s60, s48)
						const bf = ld64(s278 + 0x10)
						if (ld64(s118 + 8) == 0) {
							t = min(ld64(s118), bf)
							break B8
						}
					}
					f = fn_88360(s158, 0x26)
					k = ld64(s158)
					j = ld64(s260 + 8)
					st64(j + 0x10, ld64(s158 + 8))
					st64(j + 8, k)
					st64(j, 1)
					return f
				}
			}
			x = s
			const w = t
			f = fn_73230(s118, t, s128, m ^ 1)
			v = ld64(s118 + 8)
			u = ld64(s118)
			if (u != 2) {
				bc = ld64(s260 + 8)
				st64(bc + 0x10, v)
				st64(bc + 8, u)
				st64(bc, 1)
				return f
			}
			st64(s280, v)
			ah = 0
			ay = ld64(s278 + 8)
			ar = ld64(s278)
			an = w
			if (x != 0) {
				const y = ld64(s260)
				if ((y as u32) > 0xf4240) {
					fn_154788(0x100160428, an, y as u32, ay, ar)
				}
				f = fn_583c8(s168, ld64(s280), y as u32, (0xf4240 - y) as u32, f)
				ah = ld64(s168 + 8)
				ay = ld64(s278 + 8)
				ar = ld64(s278)
				an = w
				if (ld64(s168) == 0) {
					f = fn_88360(s178, 0x26)
					k = ld64(s178)
					j = ld64(s260 + 8)
					st64(j + 0x10, ld64(s178 + 8))
					st64(j + 8, k)
					st64(j, 1)
					return f
				}
			}
		}
	}
	B51: {
		const ao = ld64(s260 + 0x20)
		if (ao == 0) {
			az = an
			bj = ld64(s260 + 8)
			if (an == 0) {
				break B51
			}
		} else {
			const ap = min(ao, an)
			st64(s260 + 0x18, an)
			if (an != 0) {
				const au = ld64(ar + 0x8c)
				st64(s78 + 8, ld64(ar + 0x94))
				st64(s78, au)
				const av = ld64(s260 + 0x20)
				st64(s60, av - ap, 0)
				st64(s48, av, 0)
				const aw = ar
				fn_584f8(s118, s78, s60, s48)
				if (ld64(s118) != 1) {
					f = fn_88360(s1c8, 0x26)
					k = ld64(s1c8)
					j = ld64(s260 + 8)
					st64(j + 0x10, ld64(s1c8 + 8))
					st64(j + 8, k)
					st64(j, 1)
					return f
				}
				const ax = ld64(s118 + 8)
				st64(aw + 0x94, ld64(s118 + 0x10))
				st64(aw + 0x8c, ax)
				ay = ld64(s278 + 8)
				ar = aw
				x = ld64(s260 + 0x10)
			}
			f = ld64(s260 + 0x20)
			const aq = f - ap
			st64(ar + 0x84, aq > f ? 0 : aq)
			bj = ld64(s260 + 8)
			an = ld64(s260 + 0x18)
			if (ld64(s260 + 0x20) >= an) {
				break B51
			}
			const at = an - ap
			az = at > an ? 0 : at
		}
		if (az > ay) {
			fn_85138(s78, 0x100159834)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (fn_88558(0x100159834, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copy(sf8, s78, 0x30)
			st64(s118 + 8, 0x10015a7af)
			st32(sf8 + 0x78, 0x179a /* error::InvalidLimitOrderAmount */)
			st8(sf8 + 0x30, 2)
			st32(s118 + 0x18, 0x26d)
			st64(s118 + 0x10, 0x25)
			st64(s118, 0)
			fn_13e5a0(s1e8, s118)
			f = fn_1730(s1f8, ld64(s1e8), ld64(s1e8 + 8), ld64(s278 + 8), az)
			k = ld64(s1f8)
			j = ld64(s260 + 8)
			st64(j + 0x10, ld64(s1f8 + 8))
			st64(j + 8, k)
			st64(j, 1)
			return f
		}
		const bd = ld64(ar + 0x74)
		st64(s260 + 0x18, an)
		st64(ar + 0x74, bd != -1 ? bd + 1 : 0xffffffffffffffff)
		const be = ay - az
		st64(s78, 0, 1)
		st64(s60, be, 0)
		st64(s48, ay, 0)
		const bg = ar
		f = fn_584f8(s118, s78, s60, s48)
		if (ld64(s118) == 0) {
			f = fn_88360(s1d8, 0x26)
			k = ld64(s1d8)
			j = ld64(s260 + 8)
			st64(j + 0x10, ld64(s1d8 + 8))
			st64(j + 8, k)
			st64(j, 1)
			return f
		}
		const bh = ld64(s118 + 8)
		st64(bg + 0x94, ld64(s118 + 0x10))
		st64(bg + 0x8c, bh)
		st64(bg + 0x84, be)
		st64(bg + 0x7c, 0)
		bj = ld64(s260 + 8)
		x = ld64(s260 + 0x10)
		an = ld64(s260 + 0x18)
	}
	let bl = an
	if (x != 0) {
		st64(bj + 0x18, ah)
		st64(bj + 0x10, bl)
		st64(bj + 8, ld64(s280))
		st64(bj, 0)
		return f
	}
	const bi = an
	f = fn_583c8(s208, an, ld64(s260) as u32, 0xf4240, f)
	if (ld64(s208) == 0) {
		f = fn_88360(s228, 0x26)
		k = ld64(s228)
		j = ld64(s260 + 8)
		st64(j + 0x10, ld64(s228 + 8))
		st64(j + 8, k)
		st64(j, 1)
		return f
	}
	ah = ld64(s208 + 8)
	bl = bi - ah
	bj = ld64(s260 + 8)
	if (ah > bi) {
		f = fn_88360(s218, 0x26)
		const bk = ld64(s218)
		st64(bj + 0x10, ld64(s218 + 8))
		st64(bj + 8, bk)
		st64(bj, 1)
		return f
	}
	st64(bj + 0x18, ah)
	st64(bj + 0x10, bl)
	st64(bj + 8, ld64(s280))
	st64(bj, 0)
	return f
}

export function fn_74768(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20, s40 = fp - 0x40, s48 = fp - 0x48
	let t, am, bg, bh, bi, bj, cb, cc, cd: u64
	B28: {
		st64(s40, a, b)
		const g = ld32(b)
		st64(s40 + 0x18, c)
		const f = ld32(c)
		st64(s20, 0, 0, 0, 0)
		const h = memcmp(e + 0x39, s20, 0x20)
		if ((d as i32) >= (g as i32)) {
			if ((f as i32) > (d as i32)) {
				st64(s40 + 0x10, 0)
				let bp = 0
				cd = 0
				const bk = ld64(s40 + 8)
				if ((h as u32) != 0) {
					const bl = ld64(s40 + 0x18)
					const bn = ld64(bk + 0x44)
					const bm = ld64(bl + 0x44)
					const bo = ld64(e + 0x99)
					cd = ld64(e + 0xa1) - (ld64(bl + 0x4c) + ld64(bk + 0x4c) + (bm > bm + bn)) - (bm + bn > bo)
					bp = bo - (bm + bn)
				}
				st64(s48, bp)
				st64(s20, 0, 0, 0, 0)
				const bq = memcmp(e + 0xe2, s20, 0x20)
				cc = 0
				if ((bq as u32) != 0) {
					const br = ld64(s40 + 0x18)
					const bt = ld64(bk + 0x54)
					const bs = ld64(br + 0x54)
					const bu = ld64(e + 0x142)
					cc = ld64(e + 0x14a) - (ld64(br + 0x5c) + ld64(bk + 0x5c) + (bs > bs + bt)) - (bs + bt > bu)
					st64(s40 + 0x10, bu - (bs + bt))
				}
				st64(s20, 0, 0, 0, 0)
				const bv = memcmp(e + 0x18b, s20, 0x20)
				t = 0
				cb = 0
				if ((bv as u32) == 0) {
					break B28
				}
				const bw = ld64(s40 + 0x18)
				const by = ld64(bk + 0x64)
				const bx = ld64(bw + 0x64)
				const bz = ld64(e + 0x1eb)
				cb = ld64(e + 0x1f3) - (ld64(bw + 0x6c) + ld64(bk + 0x6c) + (bx > bx + by)) - (bx + by > bz)
				t = bz - (bx + by)
				break B28
			}
			st64(s40 + 0x10, 0)
			let z = 0
			cd = 0
			const u = ld64(s40 + 8)
			if ((h as u32) != 0) {
				const w = ld64(u + 0x44)
				const v = ld64(e + 0x99)
				const x = ld64(ld64(s40 + 0x18) + 0x44)
				const y = x - (v + w)
				z = y + v
				const aa = ld64(e + 0xa1)
				cd = ld64(ld64(s40 + 0x18) + 0x4c) - (aa + ld64(u + 0x4c) + (v > v + w)) - (v + w > x) + aa + (y > z)
			}
			st64(s48, z)
			st64(s20, 0, 0, 0, 0)
			const ab = memcmp(e + 0xe2, s20, 0x20)
			cc = 0
			if ((ab as u32) != 0) {
				const ad = ld64(u + 0x54)
				const ac = ld64(e + 0x142)
				const ae = ld64(ld64(s40 + 0x18) + 0x54)
				const af = ae - (ac + ad)
				st64(s40 + 0x10, af + ac)
				const ag = ld64(e + 0x14a)
				cc = ld64(ld64(s40 + 0x18) + 0x5c) - (ag + ld64(u + 0x5c) + (ac > ac + ad)) - (ac + ad > ae) + ag + (af > af + ac)
			}
			st64(s20, 0, 0, 0, 0)
			const ah = memcmp(e + 0x18b, s20, 0x20)
			t = 0
			cb = 0
			if ((ah as u32) == 0) {
				break B28
			}
			const aj = ld64(u + 0x64)
			const ai = ld64(e + 0x1eb)
			const ak = ld64(ld64(s40 + 0x18) + 0x64)
			bi = ai + aj > ak
			const al = ak - (ai + aj)
			t = al + ai
			bj = al > t
			am = ld64(e + 0x1f3)
			bh = am + ld64(u + 0x6c) + (ai > ai + aj)
			bg = ld64(s40 + 0x18)
		} else {
			if ((d as i32) >= (f as i32)) {
				st64(s40 + 0x10, 0)
				let l = 0
				cd = 0
				const k = ld64(s40 + 8)
				if ((h as u32) != 0) {
					const j = ld64(e + 0x99)
					const i = ld64(ld64(s40 + 0x18) + 0x44)
					l = i - j + ld64(k + 0x44)
					cd = ld64(ld64(s40 + 0x18) + 0x4c) - ld64(e + 0xa1) - (j > i) + ld64(k + 0x4c) + (i - j > l)
				}
				st64(s48, l)
				st64(s20, 0, 0, 0, 0)
				const m = memcmp(e + 0xe2, s20, 0x20)
				cc = 0
				if ((m as u32) != 0) {
					const o = ld64(e + 0x142)
					const n = ld64(ld64(s40 + 0x18) + 0x54)
					const p = n - o + ld64(k + 0x54)
					st64(s40 + 0x10, p)
					cc = ld64(ld64(s40 + 0x18) + 0x5c) - ld64(e + 0x14a) - (o > n) + ld64(k + 0x5c) + (n - o > p)
				}
				st64(s20, 0, 0, 0, 0)
				const q = memcmp(e + 0x18b, s20, 0x20)
				t = 0
				cb = 0
				if ((q as u32) == 0) {
					break B28
				}
				const s = ld64(e + 0x1eb)
				const r = ld64(ld64(s40 + 0x18) + 0x64)
				t = r - s + ld64(k + 0x64)
				cb = ld64(ld64(s40 + 0x18) + 0x6c) - ld64(e + 0x1f3) - (s > r) + ld64(k + 0x6c) + (r - s > t)
				break B28
			}
			st64(s40 + 0x10, 0)
			let at = 0
			cd = 0
			const ap = ld64(s40 + 8)
			if ((h as u32) != 0) {
				const ao = ld64(ld64(s40 + 0x18) + 0x44)
				const an = ld64(e + 0x99)
				const aq = ld64(ap + 0x44)
				const ar = aq - (an + ao)
				at = ar + an
				const au = ld64(e + 0xa1)
				cd = ld64(ap + 0x4c) - (au + ld64(ld64(s40 + 0x18) + 0x4c) + (an > an + ao)) - (an + ao > aq) + au + (ar > at)
			}
			st64(s48, at)
			st64(s20, 0, 0, 0, 0)
			const av = memcmp(e + 0xe2, s20, 0x20)
			cc = 0
			if ((av as u32) != 0) {
				const ax = ld64(ld64(s40 + 0x18) + 0x54)
				const aw = ld64(e + 0x142)
				const ay = ld64(ap + 0x54)
				const az = ay - (aw + ax)
				st64(s40 + 0x10, az + aw)
				const ba = ld64(e + 0x14a)
				cc = ld64(ap + 0x5c) - (ba + ld64(ld64(s40 + 0x18) + 0x5c) + (aw > aw + ax)) - (aw + ax > ay) + ba + (az > az + aw)
			}
			st64(s20, 0, 0, 0, 0)
			const bb = memcmp(e + 0x18b, s20, 0x20)
			t = 0
			cb = 0
			if ((bb as u32) == 0) {
				break B28
			}
			const bd = ld64(ld64(s40 + 0x18) + 0x64)
			const bc = ld64(e + 0x1eb)
			const be = ld64(ap + 0x64)
			bi = bc + bd > be
			const bf = be - (bc + bd)
			t = bf + bc
			bj = bf > t
			am = ld64(e + 0x1f3)
			bh = am + ld64(ld64(s40 + 0x18) + 0x6c) + (bc > bc + bd)
			bg = ld64(s40 + 8)
		}
		cb = ld64(bg + 0x6c) - bh - bi + am + bj
	}
	const ca = ld64(s40)
	st64(ca + 0x20, t)
	st64(ca + 0x10, ld64(s40 + 0x10))
	st64(ca, ld64(s48))
	st64(ca + 0x28, cb)
	st64(ca + 0x18, cc)
	st64(ca + 8, cd)
}

export function fn_756a8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s180 = fp - 0x180, s188 = fp - 0x188
	let g, k: u64
	if ((c as i32) > -0x6c4f5) {
		if (0x6c4f5 > (c as i32)) {
			st64(s180, b)
			if ((d as u16) == 0) {
				fn_154940(0x100160470, b, c, d as u16, e)
			}
			st64(s188, c)
			const f = fn_158b50(c as i32, d as u16)
			if (f != 0) {
				ErrorCode_name(s78, 0x1001598b8)
				st64(s60, 0, 1, 0)
				st64(s28, s60, 0x10015f818)
				st8(s28 + 0x18, 3)
				st64(s28 + 0x10, 0x20)
				st64(s48 + 0x10, 0)
				st64(s48, 0)
				if (ErrorCode_fmt(0x1001598b8, s48) != 0) {
					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
				}
				copy(sf8, s78, 0x30)
				st64(s118 + 8, 0x10015a7af)
				st32(sf8 + 0x78, 0x9c5 /* anchor::RequireEqViolated */)
				st8(sf8 + 0x30, 2)
				st32(s118 + 0x18, 0x302)
				st64(s118 + 0x10, 0x25)
				st64(s118, 0)
				fn_13e5a0(s148, s118)
				g = fn_3158(s158, ld64(s148), ld64(s148 + 8), 0, f)
				k = ld64(s158)
				st64(a + 8, ld64(s158 + 8))
				st64(a, k)
				return g
			}
			g = fn_1561f0(c as i32, (d as u16) * 0x3c)
			let h = g
			if (0 > (c as i32) && (-ld64(s188) as u32) % ((d as u16) * 0x3c) != 0) {
				h = h - 1
			}
			const i = (h as i32) * ((d as u16) * 0x3c)
			const j = ld64(s180)
			if ((i as i32) != i) {
				fn_1547e0(0x1001603e0, j)
			}
			if ((i as u32) == (j as u32)) {
				st64(a + 8, j)
				st64(a, 2)
				return g
			}
			ErrorCode_name(s78, 0x1001598b8, j as u32, i as u32)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x1001598b8, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copy(sf8, s78, 0x30)
			st64(s118 + 8, 0x10015a7af)
			st32(sf8 + 0x78, 0x9c5 /* anchor::RequireEqViolated */)
			st8(sf8 + 0x30, 2)
			st32(s118 + 0x18, 0x304)
			st64(s118 + 0x10, 0x25)
			st64(s118, 0)
			fn_13e5a0(s168, s118)
			g = fn_3158(s178, ld64(s168), ld64(s168 + 8), ld64(s180), i)
			k = ld64(s178)
			st64(a + 8, ld64(s178 + 8))
			st64(a, k)
			return g
		}
		fn_85138(s78, 0x10015983c)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_88558(0x10015983c, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(sf8, s78, 0x30)
		st64(s118 + 8, 0x10015a7af)
		st32(sf8 + 0x78, 0x1777 /* error::TickUpperOverflow */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x2fe)
		st64(s118 + 0x10, 0x25)
		st64(s118, 0)
		g = fn_13e5a0(s138, s118)
		k = ld64(s138)
		st64(a + 8, ld64(s138 + 8))
		st64(a, k)
		return g
	}
	fn_85138(s78, 0x1001598b4)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x1001598b4, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a7af)
	st32(sf8 + 0x78, 0x1776 /* error::TickLowerOverflow */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0x2fa)
	st64(s118 + 0x10, 0x25)
	st64(s118, 0)
	g = fn_13e5a0(s128, s118)
	k = ld64(s128)
	st64(a + 8, ld64(s128 + 8))
	st64(a, k)
	return g
}

export function fn_75fc8(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128
	if ((c as i32) > (b as i32)) {
		st64(a + 8, d)
		st64(a, 2)
		return r0
	}
	fn_85138(s78, 0x100159844)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x100159844, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a7af)
	st32(sf8 + 0x78, 0x1775 /* error::TickInvalidOrder */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0x30b)
	st64(s118 + 0x10, 0x25)
	st64(s118, 0)
	r0 = fn_13e5a0(s128, s118)
	const f = ld64(s128)
	st64(a + 8, ld64(s128 + 8))
	st64(a, f)
	return r0
}

export function fn_76200(a: u64, b: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s61 = fp - 0x61
	st64(s40, 0x1001595c0, 0x20, b, 0x20, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */)
	// PDA find_program_address(["pool_tick_array_bitmap_extension", *b], program *s20)
	const f = Pubkey_find_program_address(s61, s40, 2, s20)
	st64(a + 0x18, ld64(s61 + 0x18))
	st64(a + 0x10, ld64(s61 + 0x10))
	st64(a + 8, ld64(s61 + 8))
	st64(a, ld64(s61))
	return f
}

export function fn_76320(a: u64, b: u64, c: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let h = fn_5ec0(s118, b)
	let g = ld64(s118 + 8)
	let f = ld64(s118)
	if (f != 2) {
		st64(a + 8, g)
		st64(a, f)
		return h
	}
	h = fn_49f0(s118, g, h)
	const i = ld64(s118 + 0x10)
	if (ld64(s118) != 0) {
		f = ld64(s118 + 8)
		st64(a + 8, i)
		st64(a, f)
		return h
	}
	const j = memcmp(ld64(s118 + 8), c, 0x20)
	st64(i, ld64(i) - 1)
	h = j as u32
	if (h == 0) {
		st64(a + 8, g)
		st64(a, 2)
		return h
	}
	fn_85138(s78, 0x10015987c)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x10015987c, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a7d4)
	st32(sf8 + 0x78, 0x17a3 /* error::InvalidTickArrayBitmapExtensionAccount */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0x3c)
	st64(s118 + 0x10, 0x35)
	st64(s118, 0)
	const k = fn_13e5a0(s128, s118)
	const o = ld64(s128 + 8)
	const l = ld64(s128)
	h = fn_49f0(s48, g, k)
	g = ld64(s48 + 0x10)
	if (ld64(s48) != 0) {
		f = ld64(s48 + 8)
		if (l != 0) {
			void ld64(o)
			void ld8(o + 0x38)
			st64(a + 8, g)
			st64(a, f)
			return h
		}
		void ld64(o)
		void ld8(o + 0x50)
		st64(a + 8, g)
		st64(a, f)
		return h
	}
	const m = ld64(s48 + 8)
	copy(s118, m, 0x20)
	copy(sf8, c, 0x20)
	h = Error_with_pubkeys(s138, l, o, s118, h)
	const n = ld64(s138 + 8)
	f = ld64(s138)
	st64(g, ld64(g) - 1)
	st64(a + 8, n)
	st64(a, f)
	return h
}

export function fn_767a8(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let f, g, i, l, m, o, p, q: u64
	B5: {
		B3: {
			if (0xfff27617 > ((c - 0x6c4f5) as u32)) {
				if ((c as i32) > 0x6c4f4) {
					break B3
				}
				if ((d as u16) == 0) {
					fn_1548e8(0x1001603b0, d as u16, c, d, e)
				}
				let h = 0x6c4f4 / ((d as u16) * 0x3c)
				let j = -h
				i = (h * ((d as u16) * 0x3c)) as u32
				if (i != 0x6c4f4) {
					h = ~h
					j = h
				}
				const k = j * ((d as u16) * 0x3c)
				if ((k as i32) != k) {
					fn_1547e0(0x1001603e0, k as i32, h, i, e)
				}
				if ((k as u32) != (c as u32)) {
					break B3
				}
			} else {
				if ((d as u16) == 0) {
					fn_154940(0x1001603f8, d as u16, c, d, e)
				}
				r0 = fn_158b50(c as i32, (d as u16) * 0x3c)
				i = undef
				e = undef
				if (r0 != 0) {
					break B3
				}
			}
			m = fn_76e40(s128, c, d, i, e, r0)
			f = ld64(s128)
			if (f == 2) {
				q = b
				if (0 > (c as i32)) {
					if ((c as u32) == 0x80000000) {
						fn_154838(0x10015ff90, undef, undef, o, p)
					}
					const n = (-c as u32) / ((d as u16) * 0x7800)
					l = ((-c - n * ((d as u16) * 0x7800)) as u32) != 0 ? n - 1 : n - 2
				} else {
					l = (c as u32) / ((d as u16) * 0x7800) - 1
				}
				g = l as i32
				break B5
			}
			st64(a + 0x10, ld64(s128 + 8))
			st64(a + 8, f)
			st64(a, 1)
			return m
		}
		q = b
		fn_85138(s78, 0x100159838)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_88558(0x100159838, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(sf8, s78, 0x30)
		st64(s118 + 8, 0x10015a7d4)
		st32(sf8 + 0x78, 0x1774 /* error::InvalidTickIndex */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x45)
		st64(s118 + 0x10, 0x35)
		st64(s118, 0)
		m = fn_13e5a0(s138, s118)
		g = ld64(s138 + 8)
		f = ld64(s138)
		if (f != 2) {
			st64(a + 0x10, g)
			st64(a + 8, f)
			st64(a, 1)
			return m
		}
	}
	if (0 > (c as i32)) {
		if (0xe > g) {
			m = memcpy(a + 0x10, q + (g << 6) + 0x3a0, 0x40)
			st64(a + 8, g)
			st64(a, 0)
			return m
		}
		fn_14ec98(g, 0xe, 0x1001604a0, o, p)
	}
	if (0xe > g) {
		m = memcpy(a + 0x10, q + (g << 6) + 0x20, 0x40)
		st64(a + 8, g)
		st64(a, 0)
		return m
	}
	fn_14ec98(g, 0xe, 0x100160488, o, p)
}

export function fn_76e40(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148
	let f: u64
	if (0xf > (c as u16)) {
		if ((-((c as u16) * 0x7800) as i64) > (b as i32)) {
			st64(a + 8, c as u16)
			st64(a, 2)
			return r0
		}
		if ((b as i32) >= (((c as u16) * 0x7800) as i64)) {
			st64(a + 8, c as u16)
			st64(a, 2)
			return r0
		}
		fn_85138(s78, 0x1001598f0)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_88558(0x1001598f0, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(sf8, s78, 0x30)
		st64(s118 + 8, 0x10015a7d4)
		st32(sf8 + 0x78, 0x177a /* error::InvalidTickArrayBoundary */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x63)
		st64(s118 + 0x10, 0x35)
		st64(s118, 0)
		r0 = fn_13e5a0(s128, s118)
		f = ld64(s128)
		st64(a + 8, ld64(s128 + 8))
		st64(a, f)
		return r0
	}
	ErrorCode_name(s78, 0x100159900, c as u16, d, e)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (ErrorCode_fmt(0x100159900, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a7d4)
	st32(sf8 + 0x78, 0x9c9 /* anchor::RequireGtViolated */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0x60)
	st64(s118 + 0x10, 0x35)
	st64(s118, 0)
	fn_13e5a0(s138, s118)
	r0 = fn_3158(s148, ld64(s138), ld64(s138 + 8), 0x6c4f4, (c as u16) * 0x7800)
	f = ld64(s148)
	st64(a + 8, ld64(s148 + 8))
	st64(a, f)
	return r0
}

export function fn_77278(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s38 = fp - 0x38, s40 = fp - 0x40, s78 = fp - 0x78, s90 = fp - 0x90, s98 = fp - 0x98
	let p = fn_767a8(s90, b, c, d, e, r0)
	if (ld64(s90) != 0) {
		const o = ld64(s90 + 8)
		st64(a + 8, ld64(s90 + 0x10))
		st64(a, o)
		return p
	}
	st64(s98, a)
	const f = ld64(s90 + 0x10)
	p = memcpy(s38, s78, 0x38)
	st64(s40, f)
	let g = c << 0x20
	const h = g
	let i = c
	if (-1 >= (sar(g, 0x20) as i64)) {
		g = g >> 0x20
		if (g == 0x80000000) {
			fn_154838(0x10015ff90, g, sar(h, 0x20))
		}
		i = -c
	}
	if ((d as u16) == 0) {
		fn_154940(0x100160578, g, sar(h, 0x20))
	}
	const j = (i as u32) % ((d as u16) * 0x7800)
	let k = j / ((d as u16) * 0x3c)
	const n = ld64(s98)
	k = (c as i32) > -1 ? k : j != 0 ? 0x200 - k : k
	const l = k << 0x20
	const m = sar(l, 0x20) >> 6
	if (0x200 > (l >> 0x20)) {
		if ((ld64(s40 + (m << 3)) >> (sar(l, 0x20) & 0x3f) & 1) != 0) {
			st32(n + 0xc, c)
			st8(n + 8, 1)
			st64(n, 2)
			return p
		}
		st32(n + 0xc, c)
		st8(n + 8, 0)
		st64(n, 2)
		return p
	}
	fn_14ec98(m, 8, 0x1001604b8, undef, n)
}

export function fn_77538(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s40 = fp - 0x40, s78 = fp - 0x78, s90 = fp - 0x90, s98 = fp - 0x98, sc8 = fp - 0xc8, se0 = fp - 0xe0, se8 = fp - 0xe8
	let o = a
	let an = fn_767a8(s90, b, c, d, e, r0)
	let m = ld64(s90 + 0x10)
	const n = ld64(s90 + 8)
	if (ld64(s90) != 0) {
		st64(o + 8, m)
		st64(o, n)
		return an
	}
	const k = ld64(s78 + 0x30)
	copyr(sc8, s78, 0x30)
	let f = c << 0x20
	const g = f
	let h = c
	if (-1 >= (sar(f, 0x20) as i64)) {
		f = f >> 0x20
		if (f == 0x80000000) {
			fn_154838(0x10015ff90, f, sar(g, 0x20), m, n)
		}
		h = -c
	}
	if ((d as u16) == 0) {
		fn_154940(0x100160578, f, sar(g, 0x20), m, n)
	}
	const i = (h as u32) % ((d as u16) * 0x7800)
	let j = i / ((d as u16) * 0x3c)
	st64(se0 + 0x10, k)
	j = (c as i32) > -1 ? j : i != 0 ? 0x200 - j : j
	st64(s40, 1, 0, 0, 0, 0, 0, 0, 0)
	const l = j
	if ((j as i32) > -1) {
		B15: {
			st64(se0, m, n)
			st64(s98, o, 0, 0, 0, 0, 0, 0, 0, 0)
			if (0x1ff >= (l as u32)) {
				const p = j
				let r = s90 + ((l as u32) >> 6 << 3)
				let q = s40
				let s = ((l as u32) >> 6) - 1
				while (true) {
					st64(r, ld64(q) << (p & 0x3f))
					q = q + 8
					r = r + 8
					s = s + 1
					if (s >= 7) {
						if ((j as u32) > 0x1bf) {
							break
						}
						if ((p & 0x3f) == 0) {
							break
						}
						let v = s40
						let w = ((l as u32) >> 6) - 1
						const x = -(l as u32) & 0x3f
						let t = ((l as u32) >> 6 << 3) + s90 + 8
						while (true) {
							const y = ld64(t)
							const u = y + (ld64(v) >> (x & 0x3f))
							if (y > u) {
								fn_154730(0x1001604b8, v, u, y > u, y)
							}
							st64(t, u)
							t = t + 8
							v = v + 8
							w = w + 1
							if (w >= 6) {
								break B15
							}
						}
					}
				}
			}
		}
		const al = ld64(s78 + 0x20)
		const aj = ld64(s78 + 0x18)
		const ah = ld64(s78 + 0x10)
		const af = ld64(s78 + 8)
		const ad = ld64(s78)
		const ab = ld64(s90 + 0x10)
		const aa = ld64(s90 + 8)
		st64(se8, ld64(s90))
		if (0 > (c as i32)) {
			const ao = ld64(se0 + 8)
			if (0xe > ao) {
				an = aa ^ ld64(sc8)
				const ap = ld64(sc8 + 8)
				const aq = ld64(sc8 + 0x10)
				const ar = ld64(sc8 + 0x18)
				const at = ld64(sc8 + 0x20)
				const au = ld64(sc8 + 0x28)
				const av = b + (ao << 6)
				st64(av + 0x3d8, al ^ ld64(se0 + 0x10))
				st64(av + 0x3d0, aj ^ au)
				st64(av + 0x3c8, ah ^ at)
				st64(av + 0x3c0, af ^ ar)
				st64(av + 0x3b8, ad ^ aq)
				st64(av + 0x3b0, ab ^ ap)
				st64(av + 0x3a8, an)
				m = ld64(se0)
				st64(av + 0x3a0, ld64(se8) ^ m)
				o = ld64(s98)
				st64(o + 8, m)
				st64(o, 2)
				return an
			}
			fn_14ec98(ao, 0xe, 0x1001604e8, ad, af)
		}
		const z = ld64(se0 + 8)
		if (0xe > z) {
			an = aa ^ ld64(sc8)
			const ac = ld64(sc8 + 8)
			const ae = ld64(sc8 + 0x10)
			const ag = ld64(sc8 + 0x18)
			const ai = ld64(sc8 + 0x20)
			const ak = ld64(sc8 + 0x28)
			const am = b + (z << 6)
			st64(am + 0x58, al ^ ld64(se0 + 0x10))
			st64(am + 0x50, aj ^ ak)
			st64(am + 0x48, ah ^ ai)
			st64(am + 0x40, af ^ ag)
			st64(am + 0x38, ad ^ ae)
			st64(am + 0x30, ab ^ ac)
			st64(am + 0x28, an)
			m = ld64(se0)
			st64(am + 0x20, ld64(se8) ^ m)
			o = ld64(s98)
			st64(o + 8, m)
			st64(o, 2)
			return an
		}
		fn_14ec98(z, 0xe, 0x1001604d0, ad, af)
	}
	st64(s90, 0x100160960, 1, 8, 0, 0)
	// fmt "Unsigned integer can't be created from negative value"
	fn_14ec00(s90, 0x1001604b8, j, m, n)
}

export function fn_77cd0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s38 = fp - 0x38, s40 = fp - 0x40, s78 = fp - 0x78, s90 = fp - 0x90, s98 = fp - 0x98
	let f: u64
	if (e != 0) {
		f = (c as i32) - (d as u16) * 0x3c
		if ((f as i32) != f) {
			fn_154788(0x100160518, b, f, d, e)
		}
	} else {
		f = (c as i32) + (d as u16) * 0x3c
		if ((f as i32) != f) {
			fn_154730(0x100160500, b, f, d, e)
		}
	}
	if ((d as u16) != 0) {
		const g = 0x6c4f4 / ((d as u16) * 0x3c)
		let h = g * ((d as u16) * 0x3c)
		const i = ((h as u32) != 0x6c4f4 ? ~g : -g) * ((d as u16) * 0x3c)
		if ((i as i32) == i) {
			if ((h as i32) == h) {
				const j = f << 0x20
				if ((i as i32) > (sar(j, 0x20) as i64)) {
					st32(a + 0xc, sar(j, 0x20))
					st8(a + 8, 0)
					st64(a, 2)
					return h
				}
				h = h as i32
				if ((sar(j, 0x20) as i64) > (h as i64)) {
					st32(a + 0xc, sar(j, 0x20))
					st8(a + 8, 0)
					st64(a, 2)
					return h
				}
				h = fn_767a8(s90, b, sar(j, 0x20), d, e, h)
				if (ld64(s90) != 0) {
					const m = ld64(s90 + 8)
					st64(a + 8, ld64(s90 + 0x10))
					st64(a, m)
					return h
				}
				const k = ld64(s90 + 0x10)
				memcpy(s38, s78, 0x38)
				st64(s40, k)
				h = fn_78030(s98, s40, sar(j, 0x20), d, e)
				const l = ld8(s98)
				st32(a + 0xc, ld32(s98 + 4))
				st8(a + 8, l)
				st64(a, 2)
				return h
			}
			fn_1547e0(0x1001603e0, b, f, d, e)
		}
		fn_1547e0(0x1001603e0, b, f, d, e)
	}
	fn_1548e8(0x1001603b0, b, f, d, e)
}

export function fn_78030(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s40 = fp - 0x40, s48 = fp - 0x48, s60 = fp - 0x60, s90 = fp - 0x90
	let r, s, u, v, ai, an, bc, bh, bk, bn: u64
	let n = b
	st64(s60 + 0x10, a)
	fn_61ab8(s48, c, d)
	const k = ld32(s48 + 4)
	st64(s90 + 0x10, ld32(s48))
	let f = c
	if (-1 >= (c as i32)) {
		if ((c as u32) == 0x80000000) {
			fn_154838(0x10015ff90, 0x80000000, c as i32, k)
		}
		f = -c
	}
	if ((d as u16) == 0) {
		fn_154940(0x100160578, f, c as i32, k)
	}
	const g = (f as u32) % ((d as u16) * 0x7800)
	let h = g / ((d as u16) * 0x3c)
	let i = g != 0 ? 0x200 - h : h
	h = (c as i32) > -1 ? h : i
	st64(s60, (d as u16) * 0x3c, c)
	if (e != 0) {
		if (0x200 > (h as i32)) {
			const x = 0x1ff - h
			st64(s40, 0, 0, 0, 0, 0, 0, 0, 0)
			let ax = 0
			let aw = 0
			let y = 0
			st64(s90 + 0x18, 0)
			ai = 0
			st64(s90 + 0x20, 0)
			st64(s90 + 8, 0)
			st64(s90 + 0x28, 0)
			bc = ld64(s60 + 0x10)
			if (0x1ff >= (x as u32)) {
				let aa = s40 + ((x as u32) >> 6 << 3)
				let ab = ((x as u32) >> 6) - 1
				let z = n
				while (true) {
					st64(aa, ld64(z) << (x & 0x3f))
					z = z + 8
					aa = aa + 8
					ab = ab + 1
					if (ab >= 7) {
						bc = ld64(s60 + 0x10)
						if (0x1bf >= (x as u32) && (x & 0x3f) != 0) {
							v = ((x as u32) >> 6) - 1
							r = -(x as u32) & 0x3f
							u = ((x as u32) >> 6 << 3) + s40 + 8
							do {
								const ac = ld64(u)
								s = ac + (ld64(n) >> (r & 0x3f))
								if (ac > s) {
									fn_154730(0x1001604b8, v, u, r, s)
								}
								st64(u, s)
								u = u + 8
								n = n + 8
								v = v + 1
							} while (6 > v)
						}
						ax = ld64(s40 + 0x38)
						aw = ld64(s40 + 0x30)
						st64(s90 + 0x18, ld64(s40 + 0x28))
						ai = ld64(s40 + 0x20)
						st64(s90 + 0x20, ld64(s40 + 0x18))
						st64(s90 + 8, ld64(s40 + 0x10))
						st64(s90 + 0x28, ld64(s40 + 8))
						y = ld64(s40)
						break
					}
				}
			}
			an = ld64(s90 + 0x10)
			const av = ld64(s90 + 8)
			if (y == 0 && (ld64(s90 + 0x28) == 0 && (av == 0 && (ld64(s90 + 0x20) == 0 && (ai == 0 && (ld64(s90 + 0x18) == 0 && (aw == 0 && ax == 0))))))) {
				st32(bc + 4, an)
				st8(bc, 0)
				return ai
			}
			B78: {
				const ay = ax | aw
				const az = ld64(s90 + 0x18)
				const ba = ay | az | ai
				const bb = ld64(s90 + 0x20)
				const be = (ay | az) == 0
				bh = (ba | bb) == 0
				bn = bc
				const bd = (ba | bb | av | ld64(s90 + 0x28)) == 0
				if (y == 0) {
					bk = 0x200
					if ((bd & 1) != 0) {
						break B78
					}
				}
				let bj = ai != 0 ? 0xc0 : 0x100
				const bf = ax != 0 ? 0 : aw != 0 ? 0x40 : 0x80
				if (ai != 0) {
					st64(s90 + 0x20, ai)
				}
				if (aw != 0) {
					st64(s90 + 0x18, aw)
				}
				if (ax != 0) {
					st64(s90 + 0x18, ax)
				}
				bj = (be & 1) != 0 ? bj : bf
				if ((be & 1) == 0) {
					st64(s90 + 0x20, ld64(s90 + 0x18))
				}
				const bg = ld64(s90 + 8)
				const bi = bh & 1
				aw = bi != 0 ? bg != 0 ? 0x140 : 0x180 : bj
				if (bg != 0) {
					st64(s90 + 0x28, bg)
				}
				if (bi == 0) {
					st64(s90 + 0x28, ld64(s90 + 0x20))
				}
				if ((bd & 1) == 0) {
					y = ld64(s90 + 0x28)
				}
				bh = 0x3333333333333333
				bk = ((bd & 1) != 0 ? 0x1c0 : aw) | clz(y)
			}
			const bl = bk * ld64(s60)
			const bm = (ld64(s60 + 8) as i32) - (bl as i32)
			bc = bn
			if ((bm as i32) != bm) {
				fn_154788(0x100160560, bm, bh, bl as i32, aw)
			}
			st32(bc + 4, bm)
			st8(bc, 1)
			return ai
		}
	} else {
		const j = h
		i = h as i32
		if ((i as i64) > -1) {
			st64(s90 + 8, k)
			st64(s40, 0, 0, 0, 0, 0, 0, 0, 0)
			let al = 0
			let l = 0
			st64(s90 + 0x28, 0)
			let ag = 0
			ai = 0
			let ae = 0
			let ad = 0
			let af = 0
			if (0x1ff >= (j as u32)) {
				const m = h
				const o = n + ((j as u32) >> 6 << 3)
				let p = 0
				let q = ((j as u32) >> 6) - 1
				while (true) {
					st64(s40 + p, ld64(o + p) >> (m & 0x3f))
					p = p + 8
					q = q + 1
					if (q >= 7) {
						if (0x1bf >= (h as u32) && (m & 0x3f) != 0) {
							r = s40
							u = ((j as u32) >> 6) - 1
							v = -(j as u32) & 0x3f
							let t = ((j as u32) >> 6 << 3) + n + 8
							do {
								const w = ld64(r)
								s = w + (ld64(t) << (v & 0x3f))
								if (w > s) {
									fn_154730(0x1001604b8, v, u, r, s)
								}
								st64(r, s)
								t = t + 8
								r = r + 8
								u = u + 1
							} while (6 > u)
						}
						al = ld64(s40 + 0x38)
						st64(s90 + 0x28, ld64(s40 + 0x30))
						ag = ld64(s40 + 0x28)
						l = ld64(s40 + 0x20)
						ai = ld64(s40 + 0x18)
						af = ld64(s40 + 0x10)
						ae = ld64(s40 + 8)
						ad = ld64(s40)
						break
					}
				}
			}
			st64(s90 + 0x10, af)
			const ah = ad | ae | af
			st64(s90 + 0x18, l)
			const aj = ah | ai | l
			st64(s90 + 0x20, ag)
			const ak = aj | ag | ld64(s90 + 0x28)
			const am = ak | al
			if (am == 0) {
				an = (ld64(s90 + 8) as i32) - ld64(s60)
				const ao = an as i32
				bc = ld64(s60 + 0x10)
				if (ao != an) {
					fn_154788(0x100160548, ao, al, ah == 0, ae)
				}
				st32(bc + 4, an)
				st8(bc, am == 0 ^ 1)
				return ai
			}
			st64(s90, ai != 0 ? 0xc0 : 0x100, 0x80)
			const at = ld64(s60 + 8)
			if (ae != 0) {
				st64(s90 + 8, 0x40)
			}
			if (ai != 0) {
				st64(s90 + 0x18, ai)
			}
			if (ae != 0) {
				st64(s90 + 0x10, ae)
			}
			ai = ld64(s90 + 0x20)
			if (ad != 0) {
				st64(s90 + 8, 0)
			}
			if (ad != 0) {
				st64(s90 + 0x10, ad)
			}
			bc = ld64(s60 + 0x10)
			if (ah != 0) {
				st64(s90, ld64(s90 + 8))
			}
			if (ah != 0) {
				st64(s90 + 0x18, ld64(s90 + 0x10))
			}
			let ap = ai != 0 ? 0x140 : 0x180
			if (aj != 0) {
				ap = ld64(s90)
			}
			if (ai != 0) {
				st64(s90 + 0x28, ai)
			}
			if (aj != 0) {
				st64(s90 + 0x28, ld64(s90 + 0x18))
			}
			if (ak != 0) {
				al = ld64(s90 + 0x28)
			}
			const aq = ((al & -al) * 0x218a392cd3d5dbf >> 0x3a) + 0x100159188
			const ar = ld64(s60)
			an = (at as i32) + ((((ak != 0 ? ap : 0x1c0) | ld8(aq)) * ar) as i32)
			const au = an as i32
			if (au == an) {
				st32(bc + 4, an)
				st8(bc, am == 0 ^ 1)
				return ai
			}
			fn_154730(0x100160530, au, ar, aq, ak == 0)
		}
	}
	st64(s40, 0x100160960, 1, 8, 0, 0)
	// fmt "Unsigned integer can't be created from negative value"
	fn_14ec00(s40, 0x1001604b8, i, k)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (points to it), p7 (points to it), p8 (value)
export function fn_79050(a: u64, b: u64, c: AccountInfo, d: AccountInfo, p5: u64, p6: u64, p7: u64, p8: u64, r0: u64, r7: u64): u64 {
	const s10 = fp - 0x10, s40 = fp - 0x40, s48 = fp - 0x48, s70 = fp - 0x70, s78 = fp - 0x78, s90 = fp - 0x90, s98 = fp - 0x98, s100 = fp - 0x100, s118 = fp - 0x118, s138 = fp - 0x138, s140 = fp - 0x140, s148 = fp - 0x148, s158 = fp - 0x158, s170 = fp - 0x170, s178 = fp - 0x178, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1e8 = fp - 0x1e8, s218 = fp - 0x218, s230 = fp - 0x230, s238 = fp - 0x238, s240 = fp - 0x240, s268 = fp - 0x268, s270 = fp - 0x270, s278 = fp - 0x278
	let bq, br: u64
	let n = a
	let f = p7
	const g = p8
	st64(s1e8 + 0x40, f)
	if (g != 0) {
		st64(s1e8 + 0x20, b)
		const j: AccountInfo = p6
		const k: LamportsCell = j.lamports
		const l = k.strong
		st64(s1e8 + 0x30, p5)
		const s = j.key
		rc_inc(k, l)
		st64(s1e8 + 0x18, g)
		const m: DataCell = j.data
		rc_inc(m)
		st64(s1e8 + 0x10, n)
		const r = j.owner
		const q = j.rent_epoch
		const p = j.is_signer
		const o = j.is_writable
		st8(s158 + 2, j.executable)
		st8(s158, p, o)
		st64(s180, s, k, m, r, q)
		const t: LamportsCell = c.lamports
		st64(s1e8 + 0x38, t)
		const u = t.strong
		const w = c.key
		const y = ld64(s1e8 + 0x40)
		rc_inc(ld64(s1e8 + 0x38), u)
		const v: DataCell = c.data
		rc_inc(v)
		st64(s1e8, v, w)
		st64(s218 + 0x10, c.executable)
		st64(s218 + 0x18, c.is_writable)
		st64(s218 + 0x20, c.is_signer)
		st64(s218 + 0x28, c.rent_epoch)
		st64(s1e8 + 0x28, c.owner)
		const x = ld64(s1e8 + 0x30)
		st64(s158 + 8, x)
		memcpy(s148, y, 0x30)
		const z = ld8(s138 + 0x1a)
		if (x != 0 && z != 2) {
			const aa = ld64(ld64(s1e8 + 0x40))
			if ((memcmp(ld64(s1e8 + 0x28), aa, 0x20) as u32) == 0) {
				const bs: AccountInfo = ld64(s1e8 + 0x40)
				let bt = bs.lamports
				rc_inc(bt)
				const bu: DataCell = bs.data
				rc_inc(bu)
				st64(s230 + 0x10, bs.executable)
				st64(s218, bs.is_writable)
				st64(s218 + 8, bs.is_signer)
				let bw = bs.rent_epoch
				let bv = bs.owner
				if (rc_release(k)) {
					st64(s238, bw, bv, bt)
					Rc_drop_slow_14df0(s178, bw)
					bw = ld64(s238)
					bv = ld64(s230)
					bt = ld64(s230 + 8)
				}
				if (rc_release(m)) {
					st64(s230, bv, bt)
					Rc_drop_slow_14df0(s170, bw)
					bv = ld64(s230)
					bt = ld64(s230 + 8)
				}
				st8(s158 + 2, ld64(s230 + 0x10))
				st8(s158 + 1, ld64(s218))
				st8(s158, ld64(s218 + 8))
				st64(s180, aa, bt, bu, bv, bw)
			}
			const ab: LamportsCell = d.lamports
			st64(s218 + 8, ab)
			const ac = ab.strong
			st64(s218, d.key)
			rc_inc(ld64(s218 + 8), ac)
			const af: DataCell = d.data
			rc_inc(af)
			const aj: AccountInfo = ld64(ld64(s1e8 + 0x20))
			const ak: LamportsCell = aj.lamports
			const al = ak.strong
			st64(s230 + 0x10, d.executable)
			st64(s1e8 + 0x20, d.is_writable)
			const ao = d.is_signer
			const ba = d.rent_epoch
			const bi = d.owner
			st64(s230 + 8, aj.key)
			rc_inc(ak, al)
			st64(s230, ao)
			const ap: DataCell = aj.data
			rc_inc(ap)
			st64(s240, ba, ak)
			const bb: AccountInfo = ld64(ld64(s1e8 + 0x30) + 0x58)
			const bc: LamportsCell = bb.lamports
			const bd = bc.strong
			st64(s268 + 0x10, aj.executable)
			st64(s268 + 0x18, aj.is_writable)
			st64(s268 + 0x20, aj.is_signer)
			const bh = aj.rent_epoch
			const be = aj.owner
			const bg = bb.key
			rc_inc(bc, bd)
			st64(s268, be, af)
			const bf: DataCell = bb.data
			rc_inc(bf)
			st64(s278, bb.owner)
			st64(s270, bg)
			const bm = bb.rent_epoch
			const bl = bb.is_signer
			const bk = bb.is_writable
			const bj = bb.executable
			st8(s40 + 0x2a, ld64(s268 + 0x10))
			st8(s40 + 0x29, ld64(s268 + 0x18))
			st8(s40 + 0x28, ld64(s268 + 0x20))
			st64(s40 + 0x20, bh)
			st64(s40 + 0x18, ld64(s268))
			st64(s40 + 0x10, ap)
			st64(s40 + 8, ld64(s238))
			st64(s40, ld64(s230 + 8))
			st8(s48 + 2, ld64(s230 + 0x10))
			st8(s48 + 1, ld64(s1e8 + 0x20))
			st8(s48, ld64(s230))
			st64(s70 + 0x20, ld64(s240))
			st64(s70 + 0x18, bi)
			st64(s70 + 0x10, ld64(s268 + 8))
			copyr(s70, s218, 0x10)
			st8(s78, bl, bk, bj)
			st64(s90 + 0x10, bm)
			st64(s90 + 8, ld64(s278))
			st64(s98, bc, bf)
			st64(s100 + 0x60, ld64(s270))
			st8(s100 + 0x5a, ld64(s218 + 0x10))
			st8(s100 + 0x59, ld64(s218 + 0x18))
			st8(s100 + 0x58, ld64(s218 + 0x20))
			st64(s100 + 0x50, ld64(s218 + 0x28))
			st64(s100 + 0x48, ld64(s1e8 + 0x28))
			st64(s100 + 0x40, ld64(s1e8))
			st64(s100 + 0x38, ld64(s1e8 + 0x38))
			st64(s100 + 0x30, ld64(s1e8 + 8))
			st64(s118, 0, 8, 0)
			memcpy(s100, s180, 0x30)
			st64(s10, 8, 0)
			r0 = token_2022_transfer_checked(s190, s118, ld64(s1e8 + 0x18), ld8(ld64(s1e8 + 0x30) + 0x30))
			r7 = ld64(s190 + 8)
			br = ld64(s190)
			let bn = ld64(s1e8 + 0x40)
			const bo = ld64(bn + 8)
			if (rc_release(bo)) {
				r0 = Rc_drop_slow_14df0(bn + 8, r0)
				bn = ld64(s1e8 + 0x40)
			}
			const bp = ld64(bn + 0x10)
			bq = bn + 0x10
			n = ld64(s1e8 + 0x10)
			if (rc_release(bp)) {
				r0 = Rc_drop_slow_14df0(bq, r0)
				st64(n + 8, r7)
				st64(n, br)
				return r0
			}
			st64(n + 8, r7)
			st64(n, br)
			return r0
		}
		const ad: LamportsCell = d.lamports
		const aq = d.key
		rc_inc(ad)
		const ae: DataCell = d.data
		rc_inc(ae)
		st64(s1e8 + 0x40, z)
		const ag: AccountInfo = ld64(ld64(s1e8 + 0x20))
		const ah: LamportsCell = ag.lamports
		const ai = ah.strong
		st64(s218 + 8, d.executable)
		st64(s1e8 + 0x20, d.is_writable)
		st64(s1e8 + 0x30, d.is_signer)
		const am = d.rent_epoch
		const ar = d.owner
		const ax = ag.key
		rc_inc(ah, ai)
		st64(s218, am)
		const an: DataCell = ag.data
		rc_inc(an)
		const aw = ag.owner
		const av = ag.rent_epoch
		st64(s230 + 0x10, aq)
		const au = ag.is_signer
		st64(s230 + 8, ad)
		const at = ag.is_writable
		st8(s48 + 2, ag.executable)
		st8(s48, au, at)
		st64(s70, ax, ah, an, aw, av)
		st8(s78 + 2, ld64(s218 + 8))
		st8(s78 + 1, ld64(s1e8 + 0x20))
		st8(s78, ld64(s1e8 + 0x30))
		st64(s90 + 0x10, ld64(s218))
		st64(s90, ae, ar)
		st64(s98, ld64(s230 + 8))
		st64(s100 + 0x60, ld64(s230 + 0x10))
		st8(s100 + 0x5a, ld64(s218 + 0x10))
		st8(s100 + 0x59, ld64(s218 + 0x18))
		st8(s100 + 0x58, ld64(s218 + 0x20))
		st64(s100 + 0x50, ld64(s218 + 0x28))
		st64(s100 + 0x48, ld64(s1e8 + 0x28))
		st64(s100 + 0x40, ld64(s1e8))
		st64(s100 + 0x38, ld64(s1e8 + 0x38))
		st64(s100 + 0x30, ld64(s1e8 + 8))
		st64(s118, 0, 8, 0)
		memcpy(s100, s180, 0x30)
		st64(s40, 8, 0)
		r0 = token_transfer(s1a0, s118, ld64(s1e8 + 0x18))
		r7 = ld64(s1a0 + 8)
		br = ld64(s1a0)
		n = ld64(s1e8 + 0x10)
		if (ld64(s1e8 + 0x40) == 2) {
			st64(n + 8, r7)
			st64(n, br)
			return r0
		}
		const ay = ld64(s140)
		if (rc_release(ay)) {
			r0 = Rc_drop_slow_14df0(s140, r0)
		}
		const az = ld64(s138)
		bq = s138
		if (rc_release(az)) {
			r0 = Rc_drop_slow_14df0(bq, r0)
			st64(n + 8, r7)
			st64(n, br)
			return r0
		}
		st64(n + 8, r7)
		st64(n, br)
		return r0
	}
	if (ld8(f + 0x2a) == 2) {
		st64(n + 8, r7)
		st64(n, 2)
		return r0
	}
	const h = ld64(f + 8)
	if (rc_release(h)) {
		r0 = Rc_drop_slow_14df0(f + 8, r0)
		f = ld64(s1e8 + 0x40)
	}
	const i = ld64(f + 0x10)
	if (!rc_release(i)) {
		st64(n + 8, r7)
		st64(n, 2)
		return r0
	}
	r0 = Rc_drop_slow_14df0(f + 0x10, r0)
	st64(n + 8, r7)
	st64(n, 2)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), p8 (value)
export function fn_7a038(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s78 = fp - 0x78, s88 = fp - 0x88, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sf0 = fp - 0xf0, s108 = fp - 0x108, s110 = fp - 0x110, s120 = fp - 0x120, s138 = fp - 0x138, s140 = fp - 0x140, s168 = fp - 0x168, s170 = fp - 0x170, s178 = fp - 0x178, s188 = fp - 0x188, s1b8 = fp - 0x1b8, s248 = fp - 0x248, s278 = fp - 0x278, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s338 = fp - 0x338, s358 = fp - 0x358, s3a8 = fp - 0x3a8, s3b0 = fp - 0x3b0, s3e8 = fp - 0x3e8, s3f0 = fp - 0x3f0, s3f8 = fp - 0x3f8
	let cj: u64
	let z: AccountInfo = d
	let n = a
	let f = p7
	const g = p8
	st64(s338 + 0x18, f)
	if (g != 0) {
		st64(s358 + 0x18, b)
		const j: AccountInfo = p6
		const k: LamportsCell = j.lamports
		const l = k.strong
		st64(s338 + 0x10, p5)
		const s = j.key
		rc_inc(k, l)
		st64(s3a8 + 0x28, g)
		const m: DataCell = j.data
		rc_inc(m)
		st64(s358 + 0x10, n)
		const r = j.owner
		const q = j.rent_epoch
		const p = j.is_signer
		const o = j.is_writable
		st8(s2d0 + 2, j.executable)
		st8(s2d0, p, o)
		st64(s2f8, s, k, m, r, q)
		const t: LamportsCell = c.lamports
		const v = c.key
		const x = ld64(s338 + 0x18)
		rc_inc(t)
		const u: DataCell = c.data
		rc_inc(u)
		st64(s358, v)
		st64(s338, u)
		st64(s358 + 8, t)
		st64(s3a8 + 0x30, c.executable)
		st64(s3a8 + 0x38, c.is_writable)
		st64(s3a8 + 0x40, c.is_signer)
		st64(s3a8 + 0x48, c.rent_epoch)
		st64(s338 + 8, c.owner)
		const w = ld64(s338 + 0x10)
		st64(s2d0 + 8, w)
		memcpy(s2c0, x, 0x30)
		const y = ld8(s2b0 + 0x1a)
		if (w != 0 && y != 2) {
			const bd = ld64(ld64(s338 + 0x18))
			if ((memcmp(ld64(s338 + 8), bd, 0x20) as u32) == 0) {
				const ck: AccountInfo = ld64(s338 + 0x18)
				let cl = ck.lamports
				rc_inc(cl)
				const cm: DataCell = ck.data
				const cn = cm.strong
				st64(s3a8 + 0x20, bd)
				rc_inc(cm, cn)
				st64(s3a8 + 0x10, ck.executable)
				st64(s3a8 + 0x18, ck.is_writable)
				let cp = ck.is_signer
				let co = ck.rent_epoch
				const cq = ck.owner
				if (rc_release(k)) {
					st64(s3b0, cp, co, cl)
					Rc_drop_slow_14df0(s2f0, cp)
					cp = ld64(s3b0)
					co = ld64(s3a8)
					cl = ld64(s3a8 + 8)
				}
				if (rc_release(m)) {
					st64(s3a8, co, cl)
					Rc_drop_slow_14df0(s2e8, cp)
					co = ld64(s3a8)
					cl = ld64(s3a8 + 8)
				}
				st8(s2d0 + 2, ld64(s3a8 + 0x10))
				st8(s2d0 + 1, ld64(s3a8 + 0x18))
				st8(s2d0, cp)
				st64(s2f0, cl, cm, cq, co)
				st64(s2f8, ld64(s3a8 + 0x20))
			}
			memcpy(sb8, s2f8, 0x30)
			const be: LamportsCell = z.lamports
			const bf = be.strong
			st64(s3a8 + 0x20, z.key)
			rc_inc(be, bf)
			const bg: DataCell = z.data
			rc_inc(bg)
			const bh: AccountInfo = ld64(ld64(s358 + 0x18))
			const bi: LamportsCell = bh.lamports
			const bj = bi.strong
			st64(s3a8 + 0x18, z.executable)
			st64(s358 + 0x18, z.is_writable)
			const bk = z.is_signer
			const bm = z.rent_epoch
			const br = z.owner
			st64(s3a8 + 0x10, bh.key)
			rc_inc(bi, bj)
			st64(s3a8 + 8, bk)
			const bl: DataCell = bh.data
			rc_inc(bl)
			st64(s3b0, bm, bi)
			const bn: AccountInfo = ld64(ld64(s338 + 0x10) + 0x58)
			const bo: LamportsCell = bn.lamports
			const bp = bo.strong
			st64(s3e8 + 0x10, bh.executable)
			st64(s3e8 + 0x18, bh.is_writable)
			st64(s3e8 + 0x20, bh.is_signer)
			st64(s3e8 + 0x28, bh.rent_epoch)
			st64(s3e8 + 0x30, bh.owner)
			const bq = bn.key
			rc_inc(bo, bp)
			st64(s3e8, bq, br)
			const bs: DataCell = bn.data
			rc_inc(bs)
			st64(s3f0, bn.owner)
			st64(s3f8, bn.rent_epoch)
			const bv = bn.is_signer
			const bu = bn.is_writable
			const bt = bn.executable
			st8(sf0 + 0x32, ld64(s3e8 + 0x10))
			st8(sf0 + 0x31, ld64(s3e8 + 0x18))
			st8(sf0 + 0x30, ld64(s3e8 + 0x20))
			st64(sf0 + 0x28, ld64(s3e8 + 0x28))
			st64(sf0 + 0x20, ld64(s3e8 + 0x30))
			st64(sf0 + 0x18, bl)
			st64(sf0 + 0x10, ld64(s3a8))
			st64(sf0 + 8, ld64(s3a8 + 0x10))
			st8(sf0 + 2, ld64(s3a8 + 0x18))
			st8(sf0 + 1, ld64(s358 + 0x18))
			st8(sf0, ld64(s3a8 + 8))
			st64(s108 + 0x10, ld64(s3b0))
			st64(s108 + 8, ld64(s3e8 + 8))
			st64(s110, be, bg)
			st64(s120 + 8, ld64(s3a8 + 0x20))
			st8(s120, bv, bu, bt)
			st64(s138 + 0x10, ld64(s3f8))
			st64(s138 + 8, ld64(s3f0))
			st64(s140, bo, bs)
			st64(s168 + 0x20, ld64(s3e8))
			st8(s168 + 0x1a, ld64(s3a8 + 0x30))
			st8(s168 + 0x19, ld64(s3a8 + 0x38))
			st8(s168 + 0x18, ld64(s3a8 + 0x40))
			st64(s168 + 0x10, ld64(s3a8 + 0x48))
			copyr(s168, s338, 0x10)
			copyr(s178, s358, 0x10)
			const bw = fn_4dc0(s18, bh, bo)
			const cc = ld64(s18 + 0x10)
			if (ld64(s18) != 0) {
				cj = ld64(s18 + 8)
				r0 = ptr_drop_in_place_fd78(s178, bw)
				const bx = ld64(sb0)
				n = ld64(s358 + 0x10)
				if (rc_release(bx)) {
					r0 = Rc_drop_slow_14df0(sb0, r0)
				}
				const by = ld64(sa8)
				if (rc_release(by)) {
					r0 = Rc_drop_slow_14df0(sa8, r0)
				}
				let bz = ld64(s338 + 0x18)
				const ca = ld64(bz + 8)
				if (rc_release(ca)) {
					r0 = Rc_drop_slow_14df0(bz + 8, r0)
					bz = ld64(s338 + 0x18)
				}
				const cb = ld64(bz + 0x10)
				if (!rc_release(cb)) {
					st64(n + 8, cc)
					st64(n, cj)
					return r0
				}
				r0 = Rc_drop_slow_14df0(bz + 0x10, r0)
				st64(n + 8, cc)
				st64(n, cj)
				return r0
			}
			const cd = ld64(s18 + 8)
			const ce = ld16(cd + 0x17f)
			n = ld64(s358 + 0x10)
			const cf = ld64(s3a8 + 0x28)
			st64(s88, s78, 6, 0x10015984c, 4, cd + 1, 0x20, cd + 0x41, 0x20, cd + 0x61, 0x20, ce != 0 ? cd + 0x17f : 1, (ce != 0) << 1, cd, 1)
			memcpy(s248, s178, 0xc0)
			st64(s290, 0, 8, 0)
			memcpy(s278, s2f8, 0x30)
			st64(s188, s88, 1)
			r0 = token_2022_transfer_checked(s308, s290, cf, ld8(ld64(s338 + 0x10) + 0x30))
			z = ld64(s308 + 8)
			cj = ld64(s308)
			st64(cc, ld64(cc) - 1)
			let cg = ld64(s338 + 0x18)
			const ch = ld64(cg + 8)
			if (rc_release(ch)) {
				r0 = Rc_drop_slow_14df0(cg + 8, r0)
				cg = ld64(s338 + 0x18)
			}
			const ci = ld64(cg + 0x10)
			if (!rc_release(ci)) {
				st64(n + 8, z)
				st64(n, cj)
				return r0
			}
			r0 = Rc_drop_slow_14df0(cg + 0x10, r0)
			st64(n + 8, z)
			st64(n, cj)
			return r0
		}
		st64(s338 + 0x18, y)
		memcpy(sb8, s2f8, 0x30)
		const aa: LamportsCell = z.lamports
		const ah = z.key
		rc_inc(aa)
		const ab: DataCell = z.data
		rc_inc(ab)
		const ac: AccountInfo = ld64(ld64(s358 + 0x18))
		const ad: LamportsCell = ac.lamports
		const ae = ad.strong
		st64(s3a8 + 0x20, z.executable)
		st64(s358 + 0x18, z.is_writable)
		st64(s338 + 0x10, z.is_signer)
		const aj = z.rent_epoch
		const ai = z.owner
		const af = ac.key
		rc_inc(ad, ae)
		st64(s3a8 + 0x18, af)
		const ag: DataCell = ac.data
		rc_inc(ag)
		const an = ac.owner
		const am = ac.rent_epoch
		st64(s3a8 + 0x10, ah)
		const al = ac.is_signer
		st64(s3a8, aj, ai)
		const ak = ac.is_writable
		st8(sf0 + 2, ac.executable)
		st8(sf0, al, ak)
		st64(s110, ad, ag, an, am)
		st64(s120 + 8, ld64(s3a8 + 0x18))
		st8(s120 + 2, ld64(s3a8 + 0x20))
		st8(s120 + 1, ld64(s358 + 0x18))
		st8(s120, ld64(s338 + 0x10))
		st64(s138 + 0x10, ld64(s3a8))
		st64(s138 + 8, ld64(s3a8 + 8))
		st64(s358 + 0x18, ab)
		st64(s138, ab)
		st64(s338 + 0x10, aa)
		st64(s140, aa)
		st64(s168 + 0x20, ld64(s3a8 + 0x10))
		st8(s168 + 0x1a, ld64(s3a8 + 0x30))
		st8(s168 + 0x19, ld64(s3a8 + 0x38))
		st8(s168 + 0x18, ld64(s3a8 + 0x40))
		st64(s168 + 0x10, ld64(s3a8 + 0x48))
		copyr(s168, s338, 0x10)
		const ao: LamportsCell = ld64(s358 + 8)
		st64(s170, ao)
		st64(s178, ld64(s358))
		r0 = fn_4dc0(s18, ac, al)
		const aq = ld64(s18 + 0x10)
		if (ld64(s18) != 0) {
			st64(s338 + 8, ld64(s18 + 8))
			if (rc_release(ao)) {
				r0 = Rc_drop_slow_14df0(s170, r0)
			}
			const ap: DataCell = ld64(s338)
			if (rc_release(ap)) {
				r0 = Rc_drop_slow_14df0(s168, r0)
			}
			const ar = ld64(s338 + 0x10)
			cj = ld64(s338 + 8)
			if (rc_release(ar)) {
				r0 = Rc_drop_slow_14df0(s140, r0)
			}
			const at = ld64(s358 + 0x18)
			if (rc_release(at)) {
				r0 = Rc_drop_slow_14df0(s138, r0)
			}
			if (rc_release(ad)) {
				r0 = Rc_drop_slow_14df0(s110, r0)
			}
			n = ld64(s358 + 0x10)
			if (rc_release(ag)) {
				r0 = Rc_drop_slow_14df0(s108, r0)
			}
			const au = ld64(sb0)
			if (rc_release(au)) {
				r0 = Rc_drop_slow_14df0(sb0, r0)
			}
			const av = ld64(sa8)
			if (rc_release(av)) {
				r0 = Rc_drop_slow_14df0(sa8, r0)
			}
			z = aq
			if (ld64(s338 + 0x18) == 2) {
				st64(n + 8, z)
				st64(n, cj)
				return r0
			}
			const aw = ld64(s2b8)
			if (rc_release(aw)) {
				r0 = Rc_drop_slow_14df0(s2b8, r0)
			}
			const ax = ld64(s2b0)
			z = aq
			if (!rc_release(ax)) {
				st64(n + 8, z)
				st64(n, cj)
				return r0
			}
			r0 = Rc_drop_slow_14df0(s2b0, r0)
			st64(n + 8, aq)
			st64(n, cj)
			return r0
		}
		const ay = ld64(s18 + 8)
		const az = ld16(ay + 0x17f)
		n = ld64(s358 + 0x10)
		const ba = ld64(s3a8 + 0x28)
		st64(s88, s78, 6, 0x10015984c, 4, ay + 1, 0x20, ay + 0x41, 0x20, ay + 0x61, 0x20, az != 0 ? ay + 0x17f : 1, (az != 0) << 1, ay, 1)
		memcpy(s248, s178, 0x90)
		st64(s290, 0, 8, 0)
		memcpy(s278, s2f8, 0x30)
		st64(s1b8, s88, 1)
		r0 = token_transfer(s318, s290, ba)
		z = ld64(s318 + 8)
		cj = ld64(s318)
		st64(aq, ld64(aq) - 1)
		if (ld64(s338 + 0x18) == 2) {
			st64(n + 8, z)
			st64(n, cj)
			return r0
		}
		const bb = ld64(s2b8)
		if (rc_release(bb)) {
			r0 = Rc_drop_slow_14df0(s2b8, r0)
		}
		const bc = ld64(s2b0)
		if (!rc_release(bc)) {
			st64(n + 8, z)
			st64(n, cj)
			return r0
		}
		r0 = Rc_drop_slow_14df0(s2b0, r0)
		st64(n + 8, z)
		st64(n, cj)
		return r0
	}
	if (ld8(f + 0x2a) == 2) {
		st64(n + 8, z)
		st64(n, 2)
		return r0
	}
	const h = ld64(f + 8)
	if (rc_release(h)) {
		r0 = Rc_drop_slow_14df0(f + 8, r0)
		f = ld64(s338 + 0x18)
	}
	const i = ld64(f + 0x10)
	if (!rc_release(i)) {
		st64(n + 8, z)
		st64(n, 2)
		return r0
	}
	r0 = Rc_drop_slow_14df0(f + 0x10, r0)
	st64(n + 8, z)
	st64(n, 2)
	return r0
}

export function fn_7c4c8(a: u64, b: AccountInfo, c: AccountInfo, d: AccountInfo, p5: u64, p6: u64, p7: u64): u64 {
	const s10 = fp - 0x10, s18 = fp - 0x18, s40 = fp - 0x40, s48 = fp - 0x48, s70 = fp - 0x70, s78 = fp - 0x78, sa0 = fp - 0xa0, sa8 = fp - 0xa8, se8 = fp - 0xe8, sf8 = fp - 0xf8
	const f: AccountInfo = p5
	const g: LamportsCell = f.lamports
	const h = f.key
	rc_inc(g)
	const i: DataCell = f.data
	const an = p7
	const ao = p6
	rc_inc(i)
	const j: LamportsCell = c.lamports
	const aj = c.key
	const ak = f.executable
	const al = f.is_writable
	const am = f.is_signer
	const o = f.rent_epoch
	const p = f.owner
	rc_inc(j)
	const k: DataCell = c.data
	rc_inc(k)
	const l: LamportsCell = d.lamports
	const ae = d.key
	const af = c.executable
	const ag = c.is_writable
	const ah = c.is_signer
	const ai = c.rent_epoch
	const m = c.owner
	rc_inc(l)
	const n: DataCell = d.data
	rc_inc(n)
	const q: LamportsCell = b.lamports
	const aa = b.key
	const ab = d.executable
	const ac = d.is_writable
	const ad = d.is_signer
	const r = d.rent_epoch
	const t = d.owner
	rc_inc(q)
	const s: DataCell = b.data
	rc_inc(s)
	const x = b.owner
	const w = b.rent_epoch
	const v = b.is_signer
	const u = b.is_writable
	st8(s18 + 2, b.executable)
	st8(s18, v, u)
	st64(s40, aa, q, s, x, w)
	st8(s48, ad, ac, ab)
	st64(s70, ae, l, n, t, r)
	st8(s78, ah, ag, af)
	st64(sa0, aj, j, k, m, ai)
	st64(s10, ao, an)
	st8(sa8, am, al, ak)
	st64(se8, 0, 8, 0, h, g, i, p, o)
	const z = token_2022_close_account_12a0d8(sf8, se8)
	const y = ld64(sf8)
	st64(a + 8, ld64(sf8 + 8))
	st64(a, y)
	return z
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), a (points to it)
export function fn_7d178(a: u64, b: u64, c: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s130 = fp - 0x130, s138 = fp - 0x138, s150 = fp - 0x150, s158 = fp - 0x158, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0
	let aa, af, ag, an: u64
	const f: AccountInfo = ld64(b + 0x58)
	const g: LamportsCell = f.lamports
	const l = f.key
	rc_inc(g)
	const h: DataCell = f.data
	rc_inc(h)
	const m = f.owner
	const k = f.rent_epoch
	const j = f.is_signer
	const i = f.is_writable
	st8(s138 + 2, f.executable)
	st8(s138, j, i)
	st64(s160, l, g, h, m, k)
	const n = memcmp(m, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20)
	let z = s150
	let p = s158
	let o = n as u32
	if (o == 0) {
		st64(a, 2, 0)
	} else {
		const ao = p
		const s = AccountInfo_try_borrow_data(s118, s160, o)
		const w = ld64(s118 + 0x10)
		const r = ld64(s118 + 8)
		const q = ld64(s118)
		if (q == 0x800000000000001a /* Ok */) {
			B28: {
				const y = fn_e948(s118, ld64(r), ld64(r + 8), undef, undef, s)
				if (ld32(s118) != 2) {
					B13: {
						o = fn_e480(s130, ld64(sf8 + 0x38), ld64(sf8 + 0x40), undef, y, a)
						if (ld64(s130) == 0x800000000000001a /* Ok */) {
							const am = ld64(s130 + 8)
							o = clock_get(s118)
							if (ld64(s118) != 0) {
								const ae = ld64(s118 + 8)
								const ad = ld64(s118 + 0x10)
								st64(s118 + 0x10, ld64(s118 + 0x18))
								st64(s118, ae, ad)
								o = fn_13e628(s180, s118)
								ag = ld64(s180 + 8)
								af = ld64(s180)
								if (af != 2) {
									st64(a + 8, ag)
									break B28
								}
							} else {
								ag = ld64(s118 + 0x18)
							}
							const al = ag
							const ah = fn_132718(s190, am, ag, c, o)
							if (ld64(s190) == 0) {
								o = fn_88360(s1e0, 0x26)
								ag = ld64(s1e0 + 8)
								af = ld64(s1e0)
							} else {
								an = z
								aa = ld64(s190 + 8)
								if (c > c + aa) {
									o = fn_88360(s1d0, 0x26)
									ag = ld64(s1d0 + 8)
									af = ld64(s1d0)
								} else {
									o = fn_132590(s1a0, am, al, aa + c, ah)
									if (ld64(s1a0) == 0) {
										o = fn_88360(s1c0, 0x26)
										ag = ld64(s1c0 + 8)
										af = ld64(s1c0)
									} else {
										if (aa == ld64(s1a0 + 8)) {
											break B13
										}
										fn_85138(s78, 0x100159850)
										st64(s60, 0, 1, 0)
										st64(s28, s60, 0x10015f818)
										st8(s28 + 0x18, 3)
										st64(s28 + 0x10, 0x20)
										st64(s48 + 0x10, 0)
										st64(s48, 0)
										if (fn_88558(0x100159850, s48) != 0) {
											fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
										}
										copy(sf8, s78, 0x30)
										st64(s118 + 8, 0x10015a809)
										st32(sf8 + 0x78, 0x1797 /* error::TransferFeeCalculateNotMatch */)
										st8(sf8 + 0x30, 2)
										st32(s118 + 0x18, 0xf6)
										st64(s118 + 0x10, 0x1e)
										st64(s118, 0)
										o = fn_13e5a0(s1b0, s118)
										ag = ld64(s1b0 + 8)
										af = ld64(s1b0)
									}
								}
								z = an
							}
							st64(a + 8, ag)
							break B28
						}
						an = z
						aa = 0
					}
					st64(a + 8, aa)
					st64(a, 2)
					st64(w, ld64(w) - 1)
					const ab: LamportsCell = ld64(s158)
					if (rc_release(ab)) {
						o = Rc_drop_slow_14df0(ao, o)
					}
					const ac: DataCell = ld64(s150)
					const ak = an
					if (!rc_release(ac)) {
						return o
					}
					return Rc_drop_slow_14df0(ak, o)
				}
				const t = ld64(s118 + 0x18)
				st64(s48 + 0x14, t)
				const u = ld64(s118 + 0x10)
				st64(s48 + 0xc, u)
				const v = ld64(s118 + 8)
				st64(s48 + 4, v)
				st64(s118, v, u, t)
				o = fn_13e628(s1f0, s118)
				af = ld64(s1f0)
				st64(a + 8, ld64(s1f0 + 8))
			}
			st64(a, af)
			st64(w, ld64(w) - 1)
		} else {
			st64(s118, q, r, w)
			o = fn_13e628(s170, s118)
			const x = ld64(s170)
			st64(a + 8, ld64(s170 + 8))
			st64(a, x)
		}
		p = ao
	}
	const ai: LamportsCell = ld64(s158)
	if (rc_release(ai)) {
		o = Rc_drop_slow_14df0(p, o)
	}
	const aj: DataCell = ld64(s150)
	if (!rc_release(aj)) {
		return o
	}
	return Rc_drop_slow_14df0(z, o)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
export function fn_7da68(a: u64, b: u64, c: u64): u64 {
	const s68 = fp - 0x68, s88 = fp - 0x88, s90 = fp - 0x90, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108
	let ab, ac, af: u64
	const f: AccountInfo = ld64(b + 0x58)
	const g: LamportsCell = f.lamports
	const l = f.key
	rc_inc(g)
	const h: DataCell = f.data
	rc_inc(h)
	const m = f.owner
	const k = f.rent_epoch
	const j = f.is_signer
	const i = f.is_writable
	st8(s90 + 2, f.executable)
	st8(s90, j, i)
	st64(sb8, l, g, h, m, k)
	const n = memcmp(m, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20)
	let p = sa8
	let o = n as u32
	if (o == 0) {
		st64(a, 2, 0)
	} else {
		const aj = p
		const s = AccountInfo_try_borrow_data(s68, sb8, o)
		const w = ld64(s68 + 0x10)
		const r = ld64(s68 + 8)
		const q = ld64(s68)
		if (q == 0x800000000000001a /* Ok */) {
			B17: {
				const y = fn_e948(s68, ld64(r), ld64(r + 8), undef, undef, s)
				if (ld32(s68) != 2) {
					B25: {
						o = fn_e480(s88, ld64(s68 + 0x58), ld64(s68 + 0x60), undef, y, a)
						if (ld64(s88) == 0x800000000000001a /* Ok */) {
							const ai = ld64(s88 + 8)
							o = clock_get(s68)
							if (ld64(s68) != 0) {
								const aa = ld64(s68 + 8)
								const z = ld64(s68 + 0x10)
								st64(s68 + 0x10, ld64(s68 + 0x18))
								st64(s68, aa, z)
								o = fn_13e628(sd8, s68)
								ac = ld64(sd8 + 8)
								ab = ld64(sd8)
								if (ab != 2) {
									st64(a + 8, ac)
									break B17
								}
							} else {
								ac = ld64(s68 + 0x18)
							}
							o = fn_132590(se8, ai, ac, c, o)
							if (ld64(se8) != 0) {
								af = ld64(se8 + 8)
								break B25
							}
							o = fn_88360(sf8, 0x26)
							ac = ld64(sf8 + 8)
							ab = ld64(sf8)
							st64(a + 8, ac)
							break B17
						}
						af = 0
					}
					st64(a + 8, af)
					st64(a, 2)
					st64(w, ld64(w) - 1)
					const ag: LamportsCell = ld64(sb0)
					if (rc_release(ag)) {
						o = Rc_drop_slow_14df0(sb0, o)
					}
					const ah: DataCell = ld64(sa8)
					if (!rc_release(ah)) {
						return o
					}
					return Rc_drop_slow_14df0(aj, o)
				}
				const t = ld64(s68 + 0x18)
				st64(s88 + 0x14, t)
				const u = ld64(s68 + 0x10)
				st64(s88 + 0xc, u)
				const v = ld64(s68 + 8)
				st64(s88 + 4, v)
				st64(s68, v, u, t)
				o = fn_13e628(s108, s68)
				ab = ld64(s108)
				st64(a + 8, ld64(s108 + 8))
			}
			st64(a, ab)
			st64(w, ld64(w) - 1)
		} else {
			st64(s68, q, r, w)
			o = fn_13e628(sc8, s68)
			const x = ld64(sc8)
			st64(a + 8, ld64(sc8 + 8))
			st64(a, x)
		}
		p = aj
	}
	const ad: LamportsCell = ld64(sb0)
	if (rc_release(ad)) {
		o = Rc_drop_slow_14df0(sb0, o)
	}
	const ae: DataCell = ld64(sa8)
	if (!rc_release(ae)) {
		return o
	}
	return Rc_drop_slow_14df0(p, o)
}

// types [heur]: b: AccountInfo (every call passes one: fn_1a610, fn_44080, fn_55688, …)
export function fn_7e058(a: u64, b: AccountInfo, c: u64, d: u64, r0: u64): u64 {
	const s10 = fp - 0x10, s68 = fp - 0x68, s80 = fp - 0x80, sa8 = fp - 0xa8, sd8 = fp - 0xd8, se8 = fp - 0xe8, s108 = fp - 0x108, s128 = fp - 0x128, s148 = fp - 0x148, s158 = fp - 0x158, s160 = fp - 0x160
	let r: u64
	if (c != 0) {
		st64(s160, a)
		const f = ld64(ld64(d + 0x58))
		const j = ld64(f)
		const i = ld64(f + 8)
		const h = ld64(f + 0x10)
		const g = ld64(f + 0x18)
		st64(s128, j, i, h, g, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */, 0x10015a827, 0xc, s128, 0x20)
		// PDA find_program_address(["support_mint", *s128], program *s108)
		Pubkey_find_program_address(s80, se8, 2, s108)
		copyr(s148, s80, 0x20)
		st64(s158, sd8, sa8)
		let k = b + 0x10
		let l = c * 0x30
		while (true) {
			const m = ld64(k + 8)
			copyr(s80, s108, 0x20)
			r0 = memcmp(m, s80, 0x20) as u32
			if (r0 == 0) {
				const n = ld64(k - 0x10)
				copyr(s80, n, 0x20)
				r0 = memcmp(s80, s148, 0x20) as u32
				if (r0 == 0) {
					const o = ld64(k)
					const p = ld64(o + 0x10)
					if (p > 0x7ffffffffffffffe) {
						fn_14e808(0x100160590, 0x7ffffffffffffffe)
					}
					st64(o + 0x10, p + 1)
					const q = ld64(o + 0x18)
					st64(s10 + 8, ld64(o + 0x20))
					st64(s10, q)
					r0 = fn_110d30(s80, s10)
					if (ld64(s80) != 0) {
						const t = ld64(s80 + 8)
						const s = ld64(s160)
						st64(s + 8, ld64(s80 + 0x10))
						st64(s, t)
						st64(o + 0x10, ld64(o + 0x10) - 1)
						return r0
					}
					memcpy(ld64(s158), s68, 0x58)
					st64(o + 0x10, ld64(o + 0x10) - 1)
					copyr(s80, s128, 0x20)
					r0 = memcmp(ld64(s158 + 8), s80, 0x20) as u32
					if (r0 == 0) {
						r = ld64(s160)
						st8(r + 8, 1)
						st64(r, 2)
						return r0
					}
				}
			}
			k = k + 0x30
			l = l - 0x30
			if (l == 0) {
				r = ld64(s160)
				st8(r + 8, 0)
				st64(r, 2)
				return r0
			}
		}
	}
	st64(a, 2)
	st8(a + 8, 0)
	return r0
}

export function fn_7e560(a: u64, b: u64, c: u64): u64 {
	const s68 = fp - 0x68, s90 = fp - 0x90, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8
	let n, ab, ac: u64
	const f: AccountInfo = ld64(b + 0x58)
	const g: LamportsCell = f.lamports
	const l = f.key
	rc_inc(g)
	const h: DataCell = f.data
	rc_inc(h)
	B9: {
		const m = f.owner
		const k = f.rent_epoch
		const j = f.is_signer
		const i = f.is_writable
		st8(s90 + 2, f.executable)
		st8(s90, j, i)
		st64(sb8, l, g, h, m, k)
		n = memcmp(m, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32
		if (n != 0 && c == 0) {
			const q = AccountInfo_try_borrow_data(s68, sb8, n)
			const w = ld64(s68 + 0x10)
			const p = ld64(s68 + 8)
			const o = ld64(s68)
			if (o == 0x800000000000001a /* Ok */) {
				const y = fn_e948(s68, ld64(p), ld64(p + 8), undef, undef, q)
				if (ld32(s68) == 2) {
					const r = ld64(s68 + 0x18)
					st64(s90 + 0x20, r)
					const s = ld64(s68 + 0x10)
					st64(s90 + 0x18, s)
					const t = ld64(s68 + 8)
					st64(s90 + 0x10, t)
					st64(s68, t, s, r)
					n = fn_13e628(se8, s68)
					ac = ld64(se8)
					ab = ld64(se8 + 8)
				} else {
					n = fn_132c40(s68, ld64(s68 + 0x58), ld64(s68 + 0x60), y)
					const z = ld64(s68 + 0x10)
					let aa = ld64(s68 + 8)
					if (ld64(s68) != 0x8000000000000000) {
						if (z == 0) {
							st64(a, 2)
							st8(a + 8, 1)
							st64(w, ld64(w) - 1)
							return ptr_drop_in_place_fcd8(sb8, n)
						}
						let ae = z << 1
						while (true) {
							const ad = ld16(aa)
							if (0x19 >= ad && ((1 << (ad & 0x3f)) & 0x20c0402) != 0) {
								aa = aa + 2
								ae = ae - 2
								if (ae == 0) {
									st64(a, 2)
									st8(a + 8, 1)
									st64(w, ld64(w) - 1)
									return ptr_drop_in_place_fcd8(sb8, n)
								}
								continue
							}
							st64(a, 2)
							st8(a + 8, 0)
							st64(w, ld64(w) - 1)
							break B9
						}
					}
					st64(s68 + 0x10, ld64(s68 + 0x18))
					st64(s68, aa, z)
					n = fn_13e628(sd8, s68)
					ac = ld64(sd8)
					ab = ld64(sd8 + 8)
				}
				st64(a + 8, ab)
				st64(a, ac)
				st64(w, ld64(w) - 1)
			} else {
				st64(s68, o, p, w)
				n = fn_13e628(sc8, s68)
				const x = ld64(sc8)
				st64(a + 8, ld64(sc8 + 8))
				st64(a, x)
			}
		} else {
			st64(a, 2)
			st8(a + 8, 1)
		}
	}
	const u: LamportsCell = ld64(sb0)
	if (rc_release(u)) {
		n = Rc_drop_slow_14df0(sb0, n)
	}
	const v: DataCell = ld64(sa8)
	if (!rc_release(v)) {
		return n
	}
	return Rc_drop_slow_14df0(sa8, n)
}

export function fn_80720(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s48 = fp - 0x48, s50 = fp - 0x50, s78 = fp - 0x78, s80 = fp - 0x80, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sd0 = fp - 0xd0, sd8 = fp - 0xd8, sf0 = fp - 0xf0, s110 = fp - 0x110, s160 = fp - 0x160, s178 = fp - 0x178, s188 = fp - 0x188, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s218 = fp - 0x218, s230 = fp - 0x230, s248 = fp - 0x248, s288 = fp - 0x288, s2a0 = fp - 0x2a0, s2b8 = fp - 0x2b8, s2d0 = fp - 0x2d0, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s1000 = fp - 0x1000
	let s, t, ae, ai, am, an, ao, cm, cn: u64
	let ct = b
	st64(s288, 0, 0, 0, 0, 0, 0, 0, 0)
	const f = p7
	copyr(s2e8, f, 0x18)
	const g = p8
	copy(s2d0, g, 0x18)
	const h = p9
	copyr(s2b8, h, 0x10)
	st64(s2b8 + 0x10, ld64(h + 0x10))
	st64(s2a0, 0, 8, 0)
	const k = AccountInfo_try_borrow_data(sd8, c, r0)
	const o = ld64(sd0 + 8)
	const j = ld64(sd0)
	const i = ld64(sd8)
	if (i != 0x800000000000001a /* Ok */) {
		st64(sd8, i, j, o)
		ao = fn_13e628(s2f8, sd8)
		an = ld64(s2f8)
		st64(a + 8, ld64(s2f8 + 8))
		st64(a, an)
		return ao
	}
	let cr: AccountInfo = c
	let cp = d
	const r = p11
	const p = p10
	let cq = p6
	const q = p5
	fn_e948(sd8, ld64(j), ld64(j + 8), undef, undef, k)
	if (ld32(sd8) == 2) {
		const l = ld64(sd0 + 0x10)
		st64(s160 + 0x14, l)
		const m = ld64(sd0 + 8)
		st64(s160 + 0xc, m)
		const n = ld64(sd0)
		st64(s160 + 4, n)
		st64(sd8, n, m, l)
		ao = fn_13e628(s348, sd8)
		am = ld64(s348 + 8)
		an = ld64(s348)
		st64(o, ld64(o) - 1)
		st64(a + 8, am)
		st64(a, an)
		return ao
	}
	B22: {
		let co: AccountInfo = q
		const w = ld64(s78)
		const v = ld64(s80)
		fn_13c0f0(sd8, s2e8)
		t = ld64(sd0)
		s = ld64(sd8)
		if (s == 0x800000000000001a /* Ok */) {
			const u = fn_132bf8(t)
			let cs = v
			fn_132c40(sd8, v, w, u)
			if (ld64(sd8) == 0x8000000000000000) {
				s = ld64(sd0)
				ae = ld64(sd0 + 0x10)
				t = ld64(sd0 + 8)
				if (s != 0x800000000000001a /* Ok */) {
					break B22
				}
			} else {
				B29: {
					const x = ld64(sd0 + 0x10)
					cn = u
					cm = x > x + 0xa6 ? 0xffffffffffffffff : x + 0xa6
					if (w != 0) {
						let y = 0
						do {
							fn_132b38(s160, y)
							const z = ld64(s160 + 0x10)
							if (z > w) {
								break
							}
							const aa = ld64(s160 + 8)
							const ab = ld64(s160)
							if (ab > aa) {
								fn_153160(ab, aa, 0x10015f7a8)
							}
							if (aa > w) {
								fn_153158(aa, w, 0x10015f7a8)
							}
							fn_132ff0(sd8, cs + ab, aa - ab)
							if (ld64(sd8) != 0x800000000000001a /* Ok */) {
								break
							}
							const ac = ld16(sd0)
							if (ac > 0x1b) {
								break
							}
							if (((1 << (ac & 0x3f)) & 0x7f5565a) == 0) {
								if (((1 << (ac & 0x3f)) & 0x802a9a4) != 0) {
									break
								}
								if (ac == 0x13) {
									if (z >= aa) {
										const af = cs
										if (z - aa == 2) {
											const ag = ld16(af + aa)
											const ah = z > z + ag ? 0xffffffffffffffff : z + ag
											if (ah > w) {
												break
											}
											ai = fn_132bf8(ah - z)
											break B29
										}
										break
									}
									fn_153160(aa, z, 0x10015f778)
								}
								break
							}
							if (aa > z) {
								fn_153160(aa, z, 0x10015f7c0)
							}
							if (z - aa != 2) {
								break
							}
							const ad = ld16(cs + aa)
							y = z > z + ad ? 0xffffffffffffffff : z + ad
						} while (w > y)
					}
					ai = 0
				}
				const al = cn
				const aj = cm - ai
				const ak = aj > cm ? 0 : aj
				t = fn_132bd8(ak > ak + al ? 0xffffffffffffffff : ak + al)
			}
			rent_get(sd8)
			copy(s248, sd0, 0x18)
			if (ld64(sd8) != 0) {
				ao = fn_13e628(s338, s248)
				am = ld64(s338 + 8)
				an = ld64(s338)
				st64(o, ld64(o) - 1)
				st64(a + 8, am)
				st64(a, an)
				return ao
			}
			copyr(s160, s248, 0x18)
			const ap = fn_1476d8(s160, t)
			const aq = fn_147a20(cr)
			st64(o, ld64(o) - 1)
			const ar: AccountInfo = ld64(cq)
			const at: LamportsCell = ar.lamports
			const ay = ar.key
			rc_inc(at)
			const au: DataCell = ar.data
			rc_inc(au)
			const av: AccountInfo = ld64(ct)
			const aw: LamportsCell = av.lamports
			cq = au
			let cj = ar.executable
			let ck = ar.is_writable
			let cl = ar.is_signer
			cm = ar.rent_epoch
			cn = ar.owner
			let ci = av.key
			rc_inc(aw)
			const ax: DataCell = av.data
			rc_inc(ax)
			let cg = ay
			let ch = at
			const az: AccountInfo = cr
			const ba: LamportsCell = cr.lamports
			ct = ba
			cs = cr.key
			let cc = av.executable
			let cd = av.is_writable
			let ce = av.is_signer
			let cf = av.rent_epoch
			const bc = av.owner
			rc_inc(ba)
			const bb: DataCell = az.data
			let cb = sat_sub(ap, aq)
			rc_inc(bb)
			const bh = cr.owner
			const bg = cr.rent_epoch
			const bf = cr.is_signer
			const be = cr.is_writable
			const bd = cr.executable
			cr = bb
			st64(s1b8, cs, ct, bb)
			st8(s1c0, ce, cd, cc)
			st64(s1e8, ci, aw, ax, bc, cf)
			st8(s1f0, cl, ck, cj)
			st64(s218, cg, ch, cq, cn, cm)
			ck = bd
			st8(s1b8 + 0x2a, bd)
			cl = be
			st8(s1b8 + 0x29, be)
			cm = bf
			st8(s1b8 + 0x28, bf)
			cn = bg
			st64(s1b8 + 0x20, bg)
			cq = bh
			st64(s1b8 + 0x18, bh)
			st64(s188, 8, 0)
			st64(s230, 0, 8, 0)
			ao = system_program_transfer(s318, s230, cb)
			am = ld64(s318 + 8)
			an = ld64(s318)
			if (an == 2) {
				const bk = co.key
				const bl = ar.key
				const bi: AccountInfo = cp
				const bj = ld64(cp)
				copyr(s110, bj, 0x20)
				copyr(sf0, s2e8, 0x18)
				copyr(s18, s2d0, 0x18)
				copyr(sd8, s2b8, 0x18)
				st64(s1000, cs, s110, sf0, s18, sd8)
				fn_13be00(s160, bl, cs, bk, cs, s110, sf0, s18, sd8)
				rc_inc(ct)
				rc_inc(cr)
				const bm: LamportsCell = bi.lamports
				rc_inc(bm)
				const bn: DataCell = bi.data
				rc_inc(bn)
				const bo: LamportsCell = co.lamports
				cg = bi.executable
				ch = bi.is_writable
				ci = bi.is_signer
				cj = bi.rent_epoch
				const bp = bi.owner
				rc_inc(bo)
				am = co.data
				rc_inc(am)
				ce = bp
				cf = bk
				cp = bj
				const bq: LamportsCell = ar.lamports
				const ca = ar.key
				cb = co.executable
				cc = co.is_writable
				cd = co.is_signer
				const bx = co.rent_epoch
				const br = co.owner
				rc_inc(bq)
				co = bo
				const bs: DataCell = ar.data
				rc_inc(bs)
				const bw = ar.owner
				const bv = ar.rent_epoch
				const bu = ar.is_signer
				const bt = ar.is_writable
				st8(s20 + 2, ar.executable)
				st8(s20, bu, bt)
				st64(s48, ca, bq, bs, bw, bv)
				st8(s50, cd, cc, cb)
				st64(s78, cf, co, am, br, bx)
				st8(s80, ci, ch, cg)
				st64(sa8, cp, bm, bn, ce, cj)
				st8(sb0, cm, cl, ck)
				st64(sd8, cs, ct, cr, cq, cn)
				st64(s1000, p, r)
				const by = invoke_signed(s178, s160, sd8, 4, fp)
				if (ld64(s178) != 0x800000000000001a /* Ok */) {
					copyr(s18, s178, 0x18)
					const bz = fn_13e628(s328, s18)
					am = ld64(s328 + 8)
					an = ld64(s328)
					ao = ptr_drop_in_place_fd78(sd8, bz)
					st64(a + 8, am)
					st64(a, an)
					return ao
				}
				ao = ptr_drop_in_place_fd78(sd8, by)
				st64(a + 8, am)
				st64(a, 2)
				return ao
			}
			st64(a + 8, am)
			st64(a, an)
			return ao
		}
		ae = ld64(sd0 + 8)
	}
	st64(sd8, s, t, ae)
	ao = fn_13e628(s308, sd8)
	am = ld64(s308 + 8)
	an = ld64(s308)
	st64(o, ld64(o) - 1)
	st64(a + 8, am)
	st64(a, an)
	return ao
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it), c (points to it)
export function fn_81db0(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64): u64 {
	const s10 = fp - 0x10, s18 = fp - 0x18, s40 = fp - 0x40, s48 = fp - 0x48, s70 = fp - 0x70, s78 = fp - 0x78, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se8 = fp - 0xe8, sf0 = fp - 0xf0, s118 = fp - 0x118, s120 = fp - 0x120, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178
	let cm = d
	const f: AccountInfo = ld64(p7)
	const g: LamportsCell = f.lamports
	const h = f.key
	rc_inc(g)
	let cs = h
	let cr = g
	let cl = b
	const i: DataCell = f.data
	const k = p9
	const l = p8
	const j = p6
	const m = p5
	rc_inc(i)
	let ck = j
	let ci = k
	let cj = l
	const n: AccountInfo = ld64(m + 0x58)
	const o: LamportsCell = n.lamports
	let cp = f.executable
	let cq = f.is_writable
	const p = f.is_signer
	const v = f.rent_epoch
	const w = f.owner
	let co = n.key
	rc_inc(o)
	let cn = p
	const q: DataCell = n.data
	rc_inc(q)
	let ct: AccountInfo = f
	const u = n.owner
	const t = n.rent_epoch
	const s = n.is_signer
	const r = n.is_writable
	let ch: AccountInfo = n
	st8(sa8 + 2, n.executable)
	st8(sa8, s, r)
	st64(sd0, co, o, q, u, t)
	st8(s78, cn, cq, cp)
	st64(sa0, cs, cr, i, w, v)
	st64(s70, 8, 0)
	st64(se8, 0, 8, 0)
	let ca = fn_12c020(s118, se8, 0x10015a834, 1)
	let x = ld64(s118)
	if (x != 2) {
		st64(a + 8, ld64(s118 + 8))
		st64(a, x)
		return ca
	}
	const y: AccountInfo = ld64(cl)
	const z: LamportsCell = y.lamports
	const ac: LamportsCell = ld64(s118 + 8)
	const ab = ct.key
	const ah = y.key
	const aq: AccountInfo = cm
	rc_inc(z)
	const aa: DataCell = y.data
	rc_inc(aa)
	cs = ab
	const ag = y.owner
	const af = y.rent_epoch
	const ae = y.is_signer
	const ad = y.is_writable
	st8(s120 + 2, y.executable)
	st8(s120, ae, ad)
	st64(s148, ah, z, aa, ag, af)
	const ai: AccountInfo = ld64(ck)
	const aj: LamportsCell = ai.lamports
	const ap = ai.key
	rc_inc(aj)
	const ak: DataCell = ai.data
	rc_inc(ak)
	const ao = ai.owner
	const an = ai.rent_epoch
	const am = ai.is_signer
	const al = ai.is_writable
	st8(sf0 + 2, ai.executable)
	st8(sf0, am, al)
	st64(s118, ap, aj, ak, ao, an)
	const ar: LamportsCell = aq.lamports
	const au = aq.key
	const ba: AccountInfo = ct
	rc_inc(ar)
	const at: DataCell = aq.data
	rc_inc(at)
	const az = aq.owner
	const ay = aq.rent_epoch
	const ax = aq.is_signer
	const aw = aq.is_writable
	const av = aq.executable
	st64(se8, au, ar, at)
	cn = av
	st8(sc0 + 2, av)
	co = aw
	st8(sc0 + 1, aw)
	cp = ax
	st8(sc0, ax)
	cq = ay
	st64(sd0 + 8, ay)
	cr = az
	st64(sd0, az)
	ca = fn_82dd0(s158, cs, s148, s118, se8, cj, ci, ac)
	x = ld64(s158)
	if (x == 2) {
		const bb: LamportsCell = ba.lamports
		const bd = ba.key
		rc_inc(bb)
		const bc: DataCell = ba.data
		rc_inc(bc)
		cl = bd
		cm = au
		const bf = ba.executable
		const bg = ba.is_writable
		const bh = ba.is_signer
		const bi = ba.rent_epoch
		const bj = ba.owner
		cs = ar
		rc_inc(ar)
		rc_inc(at)
		st8(sa8, cp, co, cn)
		st64(sc0, at, cr, cq)
		const be = cs
		st64(sd0, cm, cs)
		st8(s78, bh, bg, bf)
		st64(sa0, cl, bb, bc, bj, bi)
		st64(s70, 8, 0)
		st64(se8, 0, 8, 0)
		ca = fn_12c9e0(s168, se8)
		x = ld64(s168)
		if (x == 2) {
			const bk: AccountInfo = ct
			const bl: LamportsCell = ct.lamports
			const bs = ct.key
			rc_inc(bl)
			const bm: DataCell = bk.data
			rc_inc(bm)
			ci = ct.executable
			cj = ct.is_writable
			ck = ct.is_signer
			const bp = ct.rent_epoch
			const bn = ct.owner
			rc_inc(be)
			rc_inc(at)
			ct = bn
			const bo: LamportsCell = ch.lamports
			const bq: AccountInfo = ch
			const cg = ch.key
			rc_inc(bo)
			const br: DataCell = bq.data
			cl = bl
			rc_inc(br)
			const bt: LamportsCell = c.lamports
			const cb = c.key
			const cc = ch.executable
			const cd = ch.is_writable
			const ce = ch.is_signer
			const cf = ch.rent_epoch
			ch = ch.owner
			rc_inc(bt)
			const bu: DataCell = c.data
			rc_inc(bu)
			const by = c.owner
			const bx = c.rent_epoch
			const bw = c.is_signer
			const bv = c.is_writable
			st8(s18 + 2, c.executable)
			st8(s18, bw, bv)
			st64(s40, cb, bt, bu, by, bx)
			st8(s48, ce, cd, cc)
			st64(s70, cg, bo, br, ch, cf)
			st8(s78, cp, co, cn)
			st64(sa0, cm, cs, at, cr, cq)
			st8(sa8, ck, cj, ci)
			st64(sd0, bs, cl, bm, ct, bp)
			st64(s10, 8, 0)
			st64(se8, 0, 8, 0)
			ca = fn_128fe0(s178, se8)
			const bz = ld64(s178)
			if (bz == 2) {
				st64(a + 8, undef)
				st64(a, 2)
				return ca
			}
			st64(a + 8, ld64(s178 + 8))
			st64(a, bz)
			return ca
		}
		st64(a + 8, ld64(s168 + 8))
		st64(a, x)
		return ca
	}
	st64(a + 8, ld64(s158 + 8))
	st64(a, x)
	return ca
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), p5 (points to it)
// types [heur]: p8: LamportsCell (every call passes one: fn_81db0)
export function fn_82dd0(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: LamportsCell): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s68 = fp - 0x68, s90 = fp - 0x90, s98 = fp - 0x98, sc0 = fp - 0xc0, sd8 = fp - 0xd8, sf0 = fp - 0xf0, s118 = fp - 0x118, s120 = fp - 0x120, s148 = fp - 0x148, s150 = fp - 0x150, s160 = fp - 0x160, s178 = fp - 0x178, s188 = fp - 0x188, s190 = fp - 0x190, s1a8 = fp - 0x1a8, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210
	let l, n, r, ad, bq, br, bx, by, bz, ca, cb, cc, cd, ce, cf, cj, ck: u64
	let f: AccountInfo
	let g: AccountInfo
	B5: {
		f = d
		rent_get(s190)
		copy(s1a8, s188, 0x18)
		g = p5
		if (ld64(s190) != 0) {
			n = fn_13e628(s210, s1a8)
			r = 1
			l = ld64(s210 + 8)
			ad = ld64(s210)
		} else {
			ck = f
			const i: LamportsCell = p8
			let cg = p7
			let ch = p6
			copyr(s1c0, s1a8, 0x18)
			const h = fn_147a20(g)
			let ci = i
			const j = fn_1476d8(s1c0, i)
			if (h == 0) {
				const u: LamportsCell = g.lamports
				const y = g.key
				f = ck
				rc_inc(u)
				const v: DataCell = g.data
				rc_inc(v)
				const w: LamportsCell = f.lamports
				cb = g.executable
				cc = g.is_writable
				cd = g.is_signer
				ce = g.rent_epoch
				cf = g.owner
				ca = f.key
				rc_inc(w)
				const x: DataCell = f.data
				by = y
				bz = u
				cj = w
				rc_inc(x)
				const ac = f.owner
				const ab = f.rent_epoch
				const aa = f.is_signer
				const z = f.is_writable
				st8(s150 + 2, f.executable)
				st8(s150, aa, z)
				st64(s160, ac, ab)
				bx = x
				st64(s178, ca, cj, x)
				st64(s10, ch, cg)
				st64(s190, 0, 8, 0)
				memcpy(s148, c, 0x30)
				st64(sf0 + 8, s10)
				st8(sf0, cd, cc, cb)
				st64(s118, by, bz, v, cf, ce)
				st64(sf0 + 0x10, 1)
				n = system_program_create_account(s200, s190, j, ci, b)
				r = 0
				l = ld64(s200 + 8)
				ad = ld64(s200)
				if (ad == 2) {
					const ae: LamportsCell = g.lamports
					if (rc_release(ae)) {
						n = Rc_drop_slow_14df0(g + 8, n)
					}
					const af: DataCell = g.data
					if (rc_release(af)) {
						n = Rc_drop_slow_14df0(g + 0x10, n)
					}
					if (rc_release(cj)) {
						n = Rc_drop_slow_14df0(f + 8, n)
					}
					bq = f + 0x10
					br = a
					if (rc_release(bx)) {
						n = Rc_drop_slow_14df0(bq, n)
						st64(br + 8, ck)
						st64(br, 2)
						return n
					}
					st64(br + 8, ck)
					st64(br, 2)
					return n
				}
			} else {
				f = ck
				if (j > h) {
					const k: LamportsCell = c.lamports
					const am = c.key
					rc_inc(k)
					const ag: DataCell = c.data
					cj = sat_sub(j, h)
					rc_inc(ag)
					const ah: LamportsCell = g.lamports
					ca = g.key
					cb = c.executable
					cc = c.is_writable
					cd = c.is_signer
					ce = c.rent_epoch
					cf = c.owner
					rc_inc(ah)
					const ai: DataCell = g.data
					bz = ah
					rc_inc(ai)
					const aj: LamportsCell = f.lamports
					by = ag
					const al = f.key
					const bt = g.executable
					const bu = g.is_writable
					const bv = g.is_signer
					const bw = g.rent_epoch
					bx = g.owner
					rc_inc(aj)
					const ak: DataCell = f.data
					rc_inc(ak)
					const bs = f.owner
					const aq = f.rent_epoch
					const ap = f.is_signer
					const ao = f.is_writable
					const an = f.executable
					st8(s38, bv, bu, bt)
					st64(s60, ca, bz, ai, bx, bw)
					st8(s68, cd, cc, cb)
					st64(s90, am, k, by, cf, ce)
					st8(s98, ap, ao, an)
					st64(sc0, al, aj, ak, bs, aq)
					st64(s30, 8, 0)
					st64(sd8, 0, 8, 0)
					n = system_program_transfer(s1d0, sd8, cj)
					r = 1
					l = ld64(s1d0 + 8)
					ad = ld64(s1d0)
					if (ad != 2) {
						break B5
					}
				}
				const ar: LamportsCell = g.lamports
				const ax = g.key
				rc_inc(ar)
				const at: DataCell = g.data
				rc_inc(at)
				const au: LamportsCell = f.lamports
				cj = au
				cc = g.executable
				cd = g.is_writable
				ce = g.is_signer
				const aw = g.rent_epoch
				const ay = g.owner
				cf = f.key
				rc_inc(au)
				const av: DataCell = f.data
				by = aw
				bz = at
				ca = ax
				cb = ar
				rc_inc(av)
				const bd = f.owner
				const bc = f.rent_epoch
				const bb = f.is_signer
				const ba = f.is_writable
				const az = f.executable
				st64(s20, ch, cg)
				st64(s118, s20)
				ch = av
				st64(s148, cf, cj, av)
				st8(s150, ce, cd, cc)
				st64(s178, ca, cb, bz, ay, by)
				cb = az
				st8(s120 + 2, az)
				cc = ba
				st8(s120 + 1, ba)
				cd = bb
				st8(s120, bb)
				ce = bc
				st64(s148 + 0x20, bc)
				cg = bd
				st64(s148 + 0x18, bd)
				st64(s118 + 8, 1)
				st64(s190, 0, 8, 0)
				n = system_program_assign_13fb30(s1e0, s190, ci)
				r = 1
				l = ld64(s1e0 + 8)
				ad = ld64(s1e0)
				if (ad == 2) {
					const be: LamportsCell = g.lamports
					const bg = g.key
					rc_inc(be)
					bz = g + 0x10
					const bf: DataCell = g.data
					ci = bg
					rc_inc(bf)
					const bh = g.executable
					const bi = g.is_writable
					const bj = g.is_signer
					const bk = g.rent_epoch
					ca = g.owner
					rc_inc(cj)
					rc_inc(ch)
					st64(s118, s10)
					st8(s120, cd, cc, cb)
					st64(s148, cf, cj, ch, cg, ce)
					st8(s150, bj, bi, bh)
					st64(s178, ci, be, bf, ca, bk)
					copyr(s10, s20, 0x10)
					st64(s118 + 8, 1)
					st64(s190, 0, 8, 0)
					n = system_program_assign_13ff40(s1f0, s190, b)
					r = 1
					l = ld64(s1f0 + 8)
					ad = ld64(s1f0)
					if (ad == 2) {
						const bl: LamportsCell = g.lamports
						if (rc_release(bl)) {
							n = Rc_drop_slow_14df0(g + 8, n)
						}
						const bm = bz
						const bn = ld64(bz)
						if (rc_release(bn)) {
							n = Rc_drop_slow_14df0(bm, n)
						}
						br = a
						if (rc_release(cj)) {
							n = Rc_drop_slow_14df0(f + 8, n)
						}
						if (rc_release(ch)) {
							n = Rc_drop_slow_14df0(f + 0x10, n)
						}
						const bo: LamportsCell = c.lamports
						if (rc_release(bo)) {
							n = Rc_drop_slow_14df0(c + 8, n)
						}
						const bp: DataCell = c.data
						bq = c + 0x10
						if (!rc_release(bp)) {
							st64(br + 8, ck)
							st64(br, 2)
							return n
						}
						n = Rc_drop_slow_14df0(bq, n)
						st64(br + 8, ck)
						st64(br, 2)
						return n
					}
				}
			}
		}
	}
	ck = l
	const m: LamportsCell = g.lamports
	if (rc_release(m)) {
		n = Rc_drop_slow_14df0(g + 8, n)
	}
	const o: DataCell = g.data
	if (rc_release(o)) {
		n = Rc_drop_slow_14df0(g + 0x10, n)
	}
	const p: LamportsCell = f.lamports
	if (rc_release(p)) {
		n = Rc_drop_slow_14df0(f + 8, n)
	}
	const q: DataCell = f.data
	br = a
	if (rc_release(q)) {
		n = Rc_drop_slow_14df0(f + 0x10, n)
	}
	if (r == 0) {
		st64(br + 8, ck)
		st64(br, ad)
		return n
	}
	const s: LamportsCell = c.lamports
	if (rc_release(s)) {
		n = Rc_drop_slow_14df0(c + 8, n)
	}
	const t: DataCell = c.data
	bq = c + 0x10
	if (rc_release(t)) {
		n = Rc_drop_slow_14df0(bq, n)
		st64(br + 8, ck)
		st64(br, ad)
		return n
	}
	st64(br + 8, ck)
	st64(br, ad)
	return n
}

export function fn_84298(a: u64): u64 {
	const s30 = fp - 0x30, s40 = fp - 0x40
	let i = clock_get(s30)
	if (ld64(s30) != 0) {
		const g = ld64(s30 + 8)
		const f = ld64(s30 + 0x10)
		st64(s30 + 0x10, ld64(s30 + 0x18))
		st64(s30, g, f)
		i = fn_13e628(s40, s30)
		const h = ld64(s40)
		st64(a + 8, ld64(s40 + 8))
		st64(a, h)
		return i
	}
	st64(a + 8, ld64(s30 + 0x18))
	st64(a, 2)
	return i
}

export function fn_84360(a: u64, b: AccountInfo): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	let q, r: u64
	const f = b.owner
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) != 0) {
		const o = anchor_error_from(s50, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const n = ld64(s50 + 8)
		const m = ld64(s50)
		copyr(s40, f, 0x20)
		st64(s20, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
		r = Error_with_pubkeys(s60, m, n, s40, o)
		q = ld64(s60)
		st64(a + 8, ld64(s60 + 8))
		st64(a, q)
		st8(a + 0x2a, 2)
		return r
	}
	AccountInfo_try_borrow_data(s40, b, g as u32)
	const p = ld64(s40 + 0x10)
	const i = ld64(s40 + 8)
	const h = ld64(s40)
	if (h == 0x800000000000001a /* Ok */) {
		let k = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
		let j = ld64(i + 8)
		if (j >= 8) {
			k = 0xbba /* anchor::AccountDiscriminatorMismatch */
			j = 0x2a81f931cd559bc0 /* account:TickArrayState */
			if (ld64(ld64(i)) == 0x2a81f931cd559bc0 /* account:TickArrayState */) {
				const s: LamportsCell = b.lamports
				const w = b.key
				rc_inc(s)
				const t: DataCell = b.data
				rc_inc(t)
				const v = b.rent_epoch
				const u = b.is_signer
				r = b.is_writable
				st8(a + 0x2a, b.executable)
				st8(a + 0x29, r)
				st8(a + 0x28, u)
				st64(a + 0x20, v)
				st64(a + 0x18, f)
				st64(a + 0x10, t)
				st64(a + 8, s)
				st64(a, w)
				st64(p, ld64(p) - 1)
				return r
			}
		}
		r = anchor_error_from(s80, k, j)
		const l = ld64(s80)
		st64(a + 8, ld64(s80 + 8))
		st64(a, l)
		st8(a + 0x2a, 2)
		st64(p, ld64(p) - 1)
		return r
	}
	st64(s40, h, i, p)
	r = fn_13e628(s70, s40)
	q = ld64(s70)
	st64(a + 8, ld64(s70 + 8))
	st64(a, q)
	st8(a + 0x2a, 2)
	return r
}

export function fn_84740(a: u64, b: AccountInfo): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60
	let m: u64
	const f = b.owner
	if ((memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20) as u32) != 0) {
		const j = anchor_error_from(s50, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const i = ld64(s50 + 8)
		const h = ld64(s50)
		copyr(s40, f, 0x20)
		st64(s20, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
		m = Error_with_pubkeys(s60, h, i, s40, j)
		const k = ld64(s60)
		st64(a + 8, ld64(s60 + 8))
		st64(a, k)
		st8(a + 0x2a, 2)
		return m
	}
	const g: LamportsCell = b.lamports
	const o = b.key
	rc_inc(g)
	const l: DataCell = b.data
	rc_inc(l)
	const p = b.executable
	const n = b.rent_epoch
	m = b.is_signer
	st8(a + 0x29, b.is_writable)
	st8(a + 0x28, m)
	st64(a + 0x20, n)
	st64(a + 0x18, f)
	st64(a + 0x10, l)
	st64(a + 8, g)
	st64(a, o)
	st8(a + 0x2a, p)
	return m
}

export function fn_849c0(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let f: u64
	if ((c & 1) != 0) {
		if (ld64(b + 0x10) == 0) {
			const h = ld64(b + 0x18)
			st64(b + 0x10, -1)
			const g = ld64(b + 0x20)
			if (g > 7) {
				const i = ld64(h)
				if (i == 0) {
					st64(h, 0x2a81f931cd559bc0 /* account:TickArrayState */)
					const k = ld64(b + 0x20)
					if (k > 0x27ff) {
						const l = ld64(b + 0x18)
						st64(a + 0x10, b + 0x10)
						st64(a + 8, l + 8)
						st64(a, 0)
						return r0
					}
					fn_153158(0x2800, k, 0x1001605c0, d, e)
				}
				r0 = anchor_error_from(s48, 0xbb8 /* anchor::AccountDiscriminatorAlreadySet */, i, d, e)
				const j = ld64(s48)
				st64(a + 0x10, ld64(s48 + 8))
				st64(a + 8, j)
				st64(a, 1)
				st64(b + 0x10, ld64(b + 0x10) + 1)
				return r0
			}
			fn_153158(8, g, 0x1001605a8, d, e)
		}
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		r0 = fn_13e628(s38, s18)
		f = ld64(s38)
		st64(a + 0x10, ld64(s38 + 8))
		st64(a + 8, f)
		st64(a, 1)
		return r0
	}
	r0 = anchor_error_from(s28, 0xbbe /* anchor::AccountNotMutable */, c & 1, d, e)
	f = ld64(s28)
	st64(a + 0x10, ld64(s28 + 8))
	st64(a + 8, f)
	st64(a, 1)
	return r0
}

// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: tick_array_state_data: TickArrayStateAccount
export function fn_84be0(a: u64, b: AccountInfo): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90
	let o: u64
	const f = b.owner
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	let j = undef
	let k = undef
	let h = g as u32
	if (h != 0) {
		const n = anchor_error_from(s50, 0xbbf /* anchor::AccountOwnedByWrongProgram */, undef, j, k)
		const m = ld64(s50 + 8)
		const l = ld64(s50)
		copyr(s40, f, 0x20)
		st64(s20, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
		h = Error_with_pubkeys(s60, l, m, s40, n)
		o = ld64(s60)
		st64(a + 0x10, ld64(s60 + 8))
		st64(a + 8, o)
		st64(a, 1)
		return h
	}
	if (b.is_writable != 0) {
		const i: DataCell = b.data
		if (i.borrow == 0) {
			let q = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
			i.borrow = -1
			const p = i.len
			if (p >= 8) {
				q = 0xbba /* anchor::AccountDiscriminatorMismatch */
				const tick_array_state_data: TickArrayStateAccount = i.ptr
				j = tick_array_state_data.discriminator
				k = 0x2a81f931cd559bc0 /* account:TickArrayState */
				if (j == 0x2a81f931cd559bc0 /* account:TickArrayState */) {
					if (p > 0x27ff) {
						st64(a + 0x10, i + 0x10)
						st64(a + 8, tick_array_state_data.pool_id)
						st64(a, 0)
						return h
					}
					fn_153158(0x2800, p, 0x1001605d8, j, 0x2a81f931cd559bc0 /* account:TickArrayState */)
				}
			}
			h = anchor_error_from(s90, q, q, j, k)
			const r = ld64(s90)
			st64(a + 0x10, ld64(s90 + 8))
			st64(a + 8, r)
			st64(a, 1)
			i.borrow = i.borrow + 1
			return h
		}
		st64(s40, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		h = fn_13e628(s80, s40)
		o = ld64(s80)
		st64(a + 0x10, ld64(s80 + 8))
		st64(a + 8, o)
		st64(a, 1)
		return h
	}
	h = anchor_error_from(s70, 0xbbe /* anchor::AccountNotMutable */, undef, j, k)
	o = ld64(s70)
	st64(a + 0x10, ld64(s70 + 8))
	st64(a + 8, o)
	st64(a, 1)
	return h
}

// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: tick_array_state_data: TickArrayStateAccount
export function fn_84f40(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let f: u64
	if ((c & 1) != 0) {
		if (ld64(b + 0x10) == 0) {
			let h = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
			st64(b + 0x10, -1)
			const g = ld64(b + 0x20)
			if (g >= 8) {
				h = 0xbba /* anchor::AccountDiscriminatorMismatch */
				const tick_array_state_data: TickArrayStateAccount = ld64(b + 0x18)
				e = 0x2a81f931cd559bc0 /* account:TickArrayState */
				if (tick_array_state_data.discriminator == 0x2a81f931cd559bc0 /* account:TickArrayState */) {
					if (g > 0x27ff) {
						st64(a + 0x10, b + 0x10)
						st64(a + 8, tick_array_state_data.pool_id)
						st64(a, 0)
						return r0
					}
					fn_153158(0x2800, g, 0x100160608, 0xbba /* anchor::AccountDiscriminatorMismatch */, 0x2a81f931cd559bc0 /* account:TickArrayState */)
				}
			}
			r0 = anchor_error_from(s48, h, g, h, e)
			const i = ld64(s48)
			st64(a + 0x10, ld64(s48 + 8))
			st64(a + 8, i)
			st64(a, 1)
			st64(b + 0x10, ld64(b + 0x10) + 1)
			return r0
		}
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		r0 = fn_13e628(s38, s18)
		f = ld64(s38)
		st64(a + 0x10, ld64(s38 + 8))
		st64(a + 8, f)
		st64(a, 1)
		return r0
	}
	r0 = anchor_error_from(s28, 0xbbe /* anchor::AccountNotMutable */, c & 1, d, e)
	f = ld64(s28)
	st64(a + 0x10, ld64(s28 + 8))
	st64(a + 8, f)
	st64(a, 1)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
export function fn_85138(a: u64, b: u64) {
	let h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, aa, ab, ac, ad, ae, af, ag, ah, ai, aj, ak, al, am: u64
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const f = ld32(b)
	if ((f as i64) > 0x19) {
		if ((f as i64) > 0x26) {
			if ((f as i64) > 0x2c) {
				if ((f as i64) > 0x2f) {
					if ((f as i64) > 0x31) {
						if (f == 0x32) {
							aa = 0x17 > g
							ab = aa != 0 ? 0 : g - 0x17
							j = g != 0 ? ab : 0x300007fe9
							if (0x300000007 >= j) {
								raw_vec_handle_error(1, 0x17, 0x10015f8f8, ab, aa)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, j)
							st64(j + 0xf, 0x323230326d617267)
							st64(j + 8, 0x676f72506e656b6f)
							st64(j, 0x54676e697373694d)
							st64(a + 8, j, 0x17)
							st64(a, 0x17)
						} else {
							ae = 0x26 > g
							af = ae != 0 ? 0 : g - 0x26
							j = g != 0 ? af : 0x300007fda
							if (0x300000007 >= j) {
								raw_vec_handle_error(1, 0x26, 0x10015f8f8, af, ae)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, j)
							st64(j + 0x1e, 0x746e756f6363416e)
							st64(j + 0x18, 0x416e6f69736e6574)
							st64(j + 0x10, 0x784570616d746942)
							st64(j + 8, 0x79617272416b6369)
							st64(j, 0x5464696c61766e49)
							st64(a + 8, j, 0x26)
							st64(a, 0x26)
						}
					} else if (f == 0x30) {
						j = g != 0 ? sat_sub(g, 0xf) : 0x300007ff1
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0xf, 0x10015f8f8, sat_sub(g, 0xf), 0xf > g)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 7, 0x67616c4665736142)
						st64(j, 0x42676e697373694d)
						st64(a + 8, j, 0xf)
						st64(a, 0xf)
					} else {
						w = 0x12 > g
						x = w != 0 ? 0 : g - 0x12
						j = g != 0 ? x : 0x300007fee
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x12, 0x10015f8f8, x, w)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 8, 0x756f636341746e69)
						st64(j, 0x4d676e697373694d)
						st16(j + 0x10, 0x746e)
						st64(a + 8, j, 0x12)
						st64(a, 0x12)
					}
				} else if (f == 0x2d) {
					ac = 0xc > g
					ad = ac != 0 ? 0 : g - 0xc
					j = g != 0 ? ad : 0x300007ff4
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0xc, 0x10015f8f8, ad, ac)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j, 0x4664696c61766e49)
					st32(j + 8, 0x6e4f6565)
					st64(a + 8, j, 0xc)
					st64(a, 0xc)
				} else if (f == 0x2e) {
					u = 0xd > g
					v = u != 0 ? 0 : g - 0xd
					j = g != 0 ? v : 0x300007ff3
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0xd, 0x10015f8f8, v, u)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 5, 0x6563697250747271)
					st64(j, 0x747271536f72655a)
					st64(a + 8, j, 0xd)
					st64(a, 0xd)
				} else {
					u = 0xd > g
					v = u != 0 ? 0 : g - 0xd
					j = g != 0 ? v : 0x300007ff3
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0xd, 0x10015f8f8, v, u)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 5, 0x7974696469757169)
					st64(j, 0x7571694c6f72655a)
					st64(a + 8, j, 0xd)
					st64(a, 0xd)
				}
			} else if ((f as i64) > 0x29) {
				if (f == 0x2a) {
					aa = 0x17 > g
					ab = aa != 0 ? 0 : g - 0x17
					j = g != 0 ? ab : 0x300007fe9
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x17, 0x10015f8f8, ab, aa)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0xf, 0x746e756f6d417265)
					st64(j + 8, 0x6564724f74696d69)
					st64(j, 0x4c64696c61766e49)
					st64(a + 8, j, 0x17)
					st64(a, 0x17)
				} else if (f == 0x2b) {
					y = 0x13 > g
					z = y != 0 ? 0 : g - 0x13
					j = g != 0 ? z : 0x300007fed
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x13, 0x10015f8f8, z, y)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 8, 0x6172757461536573)
					st64(j, 0x616850726564724f)
					st32(j + 0xf, 0x64657461)
					st64(a + 8, j, 0x13)
					st64(a, 0x13)
				} else {
					j = g != 0 ? sat_sub(g, 0x1d) : 0x300007fe3
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x1d, 0x10015f8f8, sat_sub(g, 0x1d), 0x1d > g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x15, 0x736d617261506769)
					st64(j + 0x10, 0x506769666e6f4365)
					st64(j + 8, 0x654663696d616e79)
					st64(j, 0x4464696c61766e49)
					st64(a + 8, j, 0x1d)
					st64(a, 0x1d)
				}
			} else if (f == 0x27) {
				ak = 0x1c > g
				al = ak != 0 ? 0 : g - 0x1c
				j = g != 0 ? al : 0x300007fe4
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x1c, 0x10015f8f8, al, ak)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x10, 0x4d746f4e6574616c)
				st64(j + 8, 0x75636c6143656546)
				st64(j, 0x726566736e617254)
				st32(j + 0x18, 0x68637461)
				st64(a + 8, j, 0x1c)
				st64(a, 0x1c)
			} else if (f == 0x28) {
				w = 0x12 > g
				x = w != 0 ? 0 : g - 0x12
				j = g != 0 ? x : 0x300007fee
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x12, 0x10015f8f8, x, w)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x6c6c694679646165)
				st64(j, 0x726c41726564724f)
				st16(j + 0x10, 0x6465)
				st64(a + 8, j, 0x12)
				st64(a, 0x12)
			} else {
				m = 0x11 > g
				n = m != 0 ? 0 : g - 0x11
				j = g != 0 ? n : 0x300007fef
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, n, m)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x7361685072656472)
				st64(j, 0x4f64696c61766e49)
				st8(j + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
				st64(a + 8, j, 0x11)
				st64(a, 0x11)
			}
		} else if ((f as i64) > 0x1f) {
			if ((f as i64) > 0x22) {
				if ((f as i64) > 0x24) {
					if (f == 0x25) {
						k = 0x10 > g
						l = k != 0 ? 0 : g - 0x10
						j = g != 0 ? l : 0x300007ff0
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 8, 0x776f6c667265764f)
						st64(j, 0x6e656b6f5478614d)
						st64(a + 8, j, 0x10)
						st64(a, 0x10)
					} else {
						m = 0x11 > g
						n = m != 0 ? 0 : g - 0x11
						j = g != 0 ? n : 0x300007fef
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x11, 0x10015f8f8, n, m)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 8, 0x6f6c667265764f65)
						st64(j, 0x74616c75636c6143)
						st8(j + 0x10, 0x77)
						st64(a + 8, j, 0x11)
						st64(a, 0x11)
					}
				} else if (f == 0x23) {
					ae = 0x26 > g
					af = ae != 0 ? 0 : g - 0x26
					j = g != 0 ? af : 0x300007fda
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x26, 0x10015f8f8, af, ae)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x1e, 0x746e756f6363416e)
					st64(j + 0x18, 0x416e6f69736e6574)
					st64(j + 0x10, 0x784570616d746942)
					st64(j + 8, 0x79617272416b6369)
					st64(j, 0x54676e697373694d)
					st64(a + 8, j, 0x26)
					st64(a, 0x26)
				} else {
					j = g != 0 ? sat_sub(g, 0x21) : 0x300007fdf
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x21, 0x10015f8f8, sat_sub(g, 0x21), 0x21 > g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x18, 0x6f69746365726944)
					st64(j + 0x10, 0x726f467974696469)
					st64(j + 8, 0x7571694c746e6569)
					st64(j, 0x6369666675736e49)
					st8(j + 0x20, 0x6e)
					st64(a + 8, j, 0x21)
					st64(a, 0x21)
				}
			} else if (f == 0x20) {
				ag = 0x1f > g
				ah = ag != 0 ? 0 : g - 0x1f
				j = g != 0 ? ah : 0x300007fe1
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x1f, 0x10015f8f8, ah, ag)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x17, 0x736e6f697373696d)
				st64(j + 0x10, 0x6d45647261776552)
				st64(j + 8, 0x6574616470556576)
				st64(j, 0x6f72707041746f4e)
				st64(a + 8, j, 0x1f)
				st64(a, 0x1f)
			} else if (f == 0x21) {
				aa = 0x17 > g
				ab = aa != 0 ? 0 : g - 0x17
				j = g != 0 ? ab : 0x300007fe9
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x17, 0x10015f8f8, ab, aa)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0xf, 0x6f666e4964726177)
				st64(j + 8, 0x77655264657a696c)
				st64(j, 0x616974696e496e55)
				st64(a + 8, j, 0x17)
				st64(a, 0x17)
			} else {
				q = 0xe > g
				r = q != 0 ? 0 : g - 0xe
				j = g != 0 ? r : 0x300007ff2
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0xe, 0x10015f8f8, r, q)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 6, 0x746e694d74726f70)
				st64(j, 0x6f70707553746f4e)
				st64(a + 8, j, 0xe)
				st64(a, 0xe)
			}
		} else if ((f as i64) > 0x1c) {
			if (f == 0x1d) {
				o = 0x16 > g
				p = o != 0 ? 0 : g - 0x16
				j = g != 0 ? p : 0x300007fea
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x16, 0x10015f8f8, p, o)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0xe, 0x6d6172615074696e)
				st64(j + 8, 0x696e496472617765)
				st64(j, 0x5264696c61766e49)
				st64(a + 8, j, 0x16)
				st64(a, 0x16)
			} else if (f == 0x1e) {
				ag = 0x1f > g
				ah = ag != 0 ? 0 : g - 0x1f
				j = g != 0 ? ah : 0x300007fe1
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x1f, 0x10015f8f8, ah, ag)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x17, 0x7265626d754e746e)
				st64(j + 0x10, 0x6e756f6363417475)
				st64(j + 8, 0x706e496472617765)
				st64(j, 0x5264696c61766e49)
				st64(a + 8, j, 0x1f)
				st64(a, 0x1f)
			} else {
				y = 0x13 > g
				z = y != 0 ? 0 : g - 0x13
				j = g != 0 ? z : 0x300007fed
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x13, 0x10015f8f8, z, y)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x7265506472617765)
				st64(j, 0x5264696c61766e49)
				st32(j + 0xf, 0x646f6972)
				st64(a + 8, j, 0x13)
				st64(a, 0x13)
			}
		} else if (f == 0x1a) {
			q = 0xe > g
			r = q != 0 ? 0 : g - 0xe
			j = g != 0 ? r : 0x300007ff2
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0xe, 0x10015f8f8, r, q)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 6, 0x6f666e4964726177)
			st64(j, 0x617765526c6c7546)
			st64(a + 8, j, 0xe)
			st64(a, 0xe)
		} else if (f == 0x1b) {
			aa = 0x17 > g
			ab = aa != 0 ? 0 : g - 0x17
			j = g != 0 ? ab : 0x300007fe9
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x17, 0x10015f8f8, ab, aa)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 0xf, 0x6573556e49796461)
			st64(j + 8, 0x6165726c416e656b)
			st64(j, 0x6f54647261776552)
			st64(a + 8, j, 0x17)
			st64(a, 0x17)
		} else {
			k = 0x10 > g
			l = k != 0 ? 0 : g - 0x10
			j = g != 0 ? l : 0x300007ff0
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x746e694d64726177)
			st64(j, 0x6552747065637845)
			st64(a + 8, j, 0x10)
			st64(a, 0x10)
		}
	} else if ((f as i64) > 0xc) {
		if ((f as i64) > 0x12) {
			if ((f as i64) > 0x15) {
				if ((f as i64) > 0x17) {
					if (f == 0x18) {
						ak = 0x1c > g
						al = ak != 0 ? 0 : g - 0x1c
						j = g != 0 ? al : 0x300007fe4
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x1c, 0x10015f8f8, al, ak)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 0x10, 0x6363417961727241)
						st64(j + 8, 0x6b63695474737269)
						st64(j, 0x4664696c61766e49)
						st32(j + 0x18, 0x746e756f)
						st64(a + 8, j, 0x1c)
						st64(a, 0x1c)
					} else {
						w = 0x12 > g
						x = w != 0 ? 0 : g - 0x12
						j = g != 0 ? x : 0x300007fee
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x12, 0x10015f8f8, x, w)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 8, 0x646e496472617765)
						st64(j, 0x5264696c61766e49)
						st16(j + 0x10, 0x7865)
						st64(a + 8, j, 0x12)
						st64(a, 0x12)
					}
				} else if (f == 0x16) {
					j = g != 0 ? sat_sub(g, 0x1b) : 0x300007fe5
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x1b, 0x10015f8f8, sat_sub(g, 0x1b), 0x1b > g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x10, 0x6f6d417475707475)
					st64(j + 8, 0x4f724f7475706e49)
					st64(j, 0x6c6c616d536f6f54)
					st32(j + 0x17, 0x746e756f)
					st64(a + 8, j, 0x1b)
					st64(a, 0x1b)
				} else {
					j = g != 0 ? sat_sub(g, 0x19) : 0x300007fe7
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x19, 0x10015f8f8, sat_sub(g, 0x19), 0x19 > g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x10, 0x6e756f6363417961)
					st64(j + 8, 0x7272416b63695468)
					st64(j, 0x67756f6e45746f4e)
					st8(j + 0x18, 0x74)
					st64(a + 8, j, 0x19)
					st64(a, 0x19)
				}
			} else if (f == 0x13) {
				k = 0x10 > g
				l = k != 0 ? 0 : g - 0x10
				j = g != 0 ? l : 0x300007ff0
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x646961507475706e)
				st64(j, 0x496863754d6f6f54)
				st64(a + 8, j, 0x10)
				st64(a, 0x10)
			} else if (f == 0x14) {
				y = 0x13 > g
				z = y != 0 ? 0 : g - 0x13
				j = g != 0 ? z : 0x300007fed
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x13, 0x10015f8f8, z, y)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x666963657053746e)
				st64(j, 0x756f6d416f72655a)
				st32(j + 0xf, 0x64656966)
				st64(a + 8, j, 0x13)
				st64(a, 0x13)
			} else {
				s = 0x15 > g
				t = s != 0 ? 0 : g - 0x15
				j = g != 0 ? t : 0x300007feb
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x15, 0x10015f8f8, t, s)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0xd, 0x746c7561566c6f6f)
				st64(j + 8, 0x6c6f6f507475706e)
				st64(j, 0x4964696c61766e49)
				st64(a + 8, j, 0x15)
				st64(a, 0x15)
			}
		} else if ((f as i64) > 0xf) {
			if (f == 0x10) {
				s = 0x15 > g
				t = s != 0 ? 0 : g - 0x15
				j = g != 0 ? t : 0x300007feb
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x15, 0x10015f8f8, t, s)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0xd, 0x746e656963696666)
				st64(j + 8, 0x69666675736e4979)
				st64(j, 0x746964697571694c)
				st64(a + 8, j, 0x15)
				st64(a, 0x15)
			} else if (f == 0x11) {
				w = 0x12 > g
				x = w != 0 ? 0 : g - 0x12
				j = g != 0 ? x : 0x300007fee
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x12, 0x10015f8f8, x, w)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x6568436567617070)
				st64(j, 0x696c536563697250)
				st16(j + 0x10, 0x6b63)
				st64(a + 8, j, 0x12)
				st64(a, 0x12)
			} else {
				aa = 0x17 > g
				ab = aa != 0 ? 0 : g - 0x17
				j = g != 0 ? ab : 0x300007fe9
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x17, 0x10015f8f8, ab, aa)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0xf, 0x6465766965636552)
				st64(j + 8, 0x5274757074754f65)
				st64(j, 0x6c7474694c6f6f54)
				st64(a + 8, j, 0x17)
				st64(a, 0x17)
			}
		} else {
			if (f == 0xd) {
				ai = 0x14 > g
				aj = ai != 0 ? 0 : g - 0x14
				j = g != 0 ? aj : 0x300007fec
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, aj, ai)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				am = 0x756c615662755379
			} else {
				if (f != 0xe) {
					j = g != 0 ? sat_sub(g, 0x20) : 0x300007fe0
					if (j > 0x300000007) {
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 0x18, 0x7974696469757169)
						st64(j + 0x10, 0x4c796c7070755372)
						st64(j + 8, 0x6f466f72655a6874)
						st64(j, 0x6f42646962726f46)
						st64(a + 8, j, 0x20)
						st64(a, 0x20)
						return
					}
					raw_vec_handle_error(1, 0x20, 0x10015f8f8, sat_sub(g, 0x20), 0x20 > g)
				}
				ai = 0x14 > g
				aj = ai != 0 ? 0 : g - 0x14
				j = g != 0 ? aj : 0x300007fec
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, aj, ai)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				am = 0x756c615664644179
			}
			st64(j + 8, am)
			st64(j, 0x746964697571694c)
			st32(j + 0x10, 0x72724565)
			st64(a + 8, j, 0x14)
			st64(a, 0x14)
		}
	} else if ((f as i64) > 5) {
		if ((f as i64) > 8) {
			if ((f as i64) > 0xa) {
				if (f == 0xb) {
					o = 0x16 > g
					p = o != 0 ? 0 : g - 0x16
					j = g != 0 ? p : 0x300007fea
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x16, 0x10015f8f8, p, o)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0xe, 0x776f6c667265764f)
					st64(j + 8, 0x764f74696d694c65)
					st64(j, 0x6369725074727153)
					st64(a + 8, j, 0x16)
					st64(a, 0x16)
				} else {
					ac = 0xc > g
					ad = ac != 0 ? 0 : g - 0xc
					j = g != 0 ? ad : 0x300007ff4
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0xc, 0x10015f8f8, ad, ac)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j, 0x6369725074727153)
					st32(j + 8, 0x34365865)
					st64(a + 8, j, 0xc)
					st64(a, 0xc)
				}
			} else if (f == 9) {
				k = 0x10 > g
				l = k != 0 ? 0 : g - 0x10
				j = g != 0 ? l : 0x300007ff0
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x79617272416b6369)
				st64(j, 0x5464696c61766e49)
				st64(a + 8, j, 0x10)
				st64(a, 0x10)
			} else {
				j = g != 0 ? sat_sub(g, 0x18) : 0x300007fe8
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x18, 0x10015f8f8, sat_sub(g, 0x18), 0x18 > g)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x10, 0x797261646e756f42)
				st64(j + 8, 0x79617272416b6369)
				st64(j, 0x5464696c61766e49)
				st64(a + 8, j, 0x18)
				st64(a, 0x18)
			}
		} else if (f == 6) {
			m = 0x11 > g
			n = m != 0 ? 0 : g - 0x11
			j = g != 0 ? n : 0x300007fef
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, n, m)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x6f6c667265764f72)
			st64(j, 0x65776f4c6b636954)
			st8(j + 0x10, 0x77)
			st64(a + 8, j, 0x11)
			st64(a, 0x11)
		} else if (f == 7) {
			m = 0x11 > g
			n = m != 0 ? 0 : g - 0x11
			j = g != 0 ? n : 0x300007fef
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, n, m)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x6f6c667265764f72)
			st64(j, 0x657070556b636954)
			st8(j + 0x10, 0x77)
			st64(a + 8, j, 0x11)
			st64(a, 0x11)
		} else {
			o = 0x16 > g
			p = o != 0 ? 0 : g - 0x16
			j = g != 0 ? p : 0x300007fea
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x16, 0x10015f8f8, p, o)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 0xe, 0x686374614d746f4e)
			st64(j + 8, 0x6f4e676e69636170)
			st64(j, 0x53646e416b636954)
			st64(a + 8, j, 0x16)
			st64(a, 0x16)
		}
	} else if ((f as i64) > 2) {
		if (f == 3) {
			k = 0x10 > g
			l = k != 0 ? 0 : g - 0x10
			j = g != 0 ? l : 0x300007ff0
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x7272456e6f697469)
			st64(j, 0x736f5065736f6c43)
			st64(a + 8, j, 0x10)
			st64(a, 0x10)
		} else if (f == 4) {
			k = 0x10 > g
			l = k != 0 ? 0 : g - 0x10
			j = g != 0 ? l : 0x300007ff0
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x7865646e496b6369)
			st64(j, 0x5464696c61766e49)
			st64(a + 8, j, 0x10)
			st64(a, 0x10)
		} else {
			k = 0x10 > g
			l = k != 0 ? 0 : g - 0x10
			j = g != 0 ? l : 0x300007ff0
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x726564724f64696c)
			st64(j, 0x61766e496b636954)
			st64(a + 8, j, 0x10)
			st64(a, 0x10)
		}
	} else if (f == 0) {
		h = 0xb > g
		i = h != 0 ? 0 : g - 0xb
		j = g != 0 ? i : 0x300007ff5
		if (0x300000007 >= j) {
			raw_vec_handle_error(1, 0xb, 0x10015f8f8, i, h)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st64(j, 0x6f72707041746f4e)
		st32(j + 7, 0x6465766f)
		st64(a + 8, j, 0xb)
		st64(a, 0xb)
	} else if (f == 1) {
		aa = 0x17 > g
		ab = aa != 0 ? 0 : g - 0x17
		j = g != 0 ? ab : 0x300007fe9
		if (0x300000007 >= j) {
			raw_vec_handle_error(1, 0x17, 0x10015f8f8, ab, aa)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st64(j + 0xf, 0x67616c466769666e)
		st64(j + 8, 0x6e6f436574616470)
		st64(j, 0x5564696c61766e49)
		st64(a + 8, j, 0x17)
		st64(a, 0x17)
	} else {
		h = 0xb > g
		i = h != 0 ? 0 : g - 0xb
		j = g != 0 ? i : 0x300007ff5
		if (0x300000007 >= j) {
			raw_vec_handle_error(1, 0xb, 0x10015f8f8, i, h)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st64(j, 0x4c746e756f636341)
		st32(j + 7, 0x6b63614c)
		st64(a + 8, j, 0xb)
		st64(a, 0xb)
	}
}

export function fn_88360(a: u64, b: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s11c = fp - 0x11c, s130 = fp - 0x130
	st32(s11c, b)
	fn_85138(s78, s11c)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(s11c, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st32(sf8 + 0x78, b + 0x1770 /* error::NotApproved */)
	st8(sf8 + 0x30, 2)
	st64(s118, 2)
	const g = fn_13e5a0(s130, s118)
	const f = ld64(s130)
	st64(a + 8, ld64(s130 + 8))
	st64(a, f)
	return g
}

export function fn_88558(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s30 = fp - 0x30
	const f = ld32(a)
	st64(s30, (f as i64) > 0x19 ? (f as i64) > 0x26 ? (f as i64) > 0x2c ? (f as i64) > 0x2f ? (f as i64) > 0x31 ? f != 0x32 ? 0x100160950 : 0x100160940 : f != 0x30 ? 0x100160930 : 0x100160920 : f != 0x2d ? f != 0x2e ? 0x100160910 : 0x100160900 : 0x1001608f0 : (f as i64) > 0x29 ? f != 0x2a ? f != 0x2b ? 0x1001608e0 : 0x1001608d0 : 0x1001608c0 : f != 0x27 ? f != 0x28 ? 0x1001608b0 : 0x1001608a0 : 0x100160890 : (f as i64) > 0x1f ? (f as i64) > 0x22 ? (f as i64) > 0x24 ? f != 0x25 ? 0x100160880 : 0x100160870 : f != 0x23 ? 0x100160860 : 0x100160850 : f != 0x20 ? f != 0x21 ? 0x100160840 : 0x100160830 : 0x100160820 : (f as i64) > 0x1c ? f != 0x1d ? f != 0x1e ? 0x100160810 : 0x100160800 : 0x1001607f0 : f != 0x1a ? f != 0x1b ? 0x1001607e0 : 0x1001607d0 : 0x1001607c0 : (f as i64) > 0xc ? (f as i64) > 0x12 ? (f as i64) > 0x15 ? (f as i64) > 0x17 ? f != 0x18 ? 0x1001607b0 : 0x1001607a0 : f != 0x16 ? 0x100160790 : 0x100160780 : f != 0x13 ? f != 0x14 ? 0x100160770 : 0x100160760 : 0x100160750 : (f as i64) > 0xf ? f != 0x10 ? f != 0x11 ? 0x100160740 : 0x100160730 : 0x100160720 : f != 0xd ? f != 0xe ? 0x100160710 : 0x100160700 : 0x1001606f0 : (f as i64) > 5 ? (f as i64) > 8 ? (f as i64) > 0xa ? f != 0xb ? 0x1001606e0 : 0x1001606d0 : f != 9 ? 0x1001606c0 : 0x1001606b0 : f != 6 ? f != 7 ? 0x1001606a0 : 0x100160690 : 0x100160680 : (f as i64) > 2 ? f != 3 ? f != 4 ? 0x100160670 : 0x100160660 : 0x100160650 : f != 0 ? f != 1 ? 0x100160640 : 0x100160630 : 0x100160620, 1, 8, 0, 0)
	const g = ld64(b + 0x28)
	return fn_f5d8(ld64(b + 0x20), g, s30, g, e)
}

export function fn_960a0(a: u64, b: u64): u64 {
	const sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd0 = fp - 0xd0, sf8 = fp - 0xf8, s100 = fp - 0x100, s128 = fp - 0x128, s130 = fp - 0x130, s158 = fp - 0x158, s160 = fp - 0x160, s188 = fp - 0x188, s190 = fp - 0x190, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s218 = fp - 0x218, s230 = fp - 0x230, s240 = fp - 0x240
	const f: AccountInfo = ld64(ld64(b + 8))
	const g: LamportsCell = f.lamports
	const l: AccountInfo = ld64(ld64(b))
	const o = f.key
	rc_inc(g)
	const h: DataCell = f.data
	rc_inc(h)
	const i: AccountInfo = ld64(ld64(b + 0x10))
	const j: LamportsCell = i.lamports
	const bu = f.executable
	const bv = f.is_writable
	const bw = f.is_signer
	const bx = f.rent_epoch
	const by = f.owner
	const bt = i.key
	rc_inc(j)
	const k: DataCell = i.data
	rc_inc(k)
	const m: LamportsCell = l.lamports
	const bn = l.key
	const bo = i.executable
	const bp = i.is_writable
	const bq = i.is_signer
	const br = i.rent_epoch
	const bs = i.owner
	rc_inc(m)
	const n: DataCell = l.data
	rc_inc(n)
	const p: AccountInfo = ld64(ld64(b + 0x18))
	const q: LamportsCell = p.lamports
	const bi = l.executable
	const bj = l.is_writable
	const bk = l.is_signer
	const bl = l.rent_epoch
	const bm = l.owner
	const bh = p.key
	rc_inc(q)
	const r: DataCell = p.data
	rc_inc(r)
	const s: AccountInfo = ld64(ld64(b + 0x20) + 0x58)
	const t: LamportsCell = s.lamports
	const bd = p.executable
	const be = p.is_writable
	const bf = p.is_signer
	const bg = p.rent_epoch
	const v = p.owner
	const u = s.key
	rc_inc(t)
	const w: DataCell = s.data
	rc_inc(w)
	const x: AccountInfo = ld64(ld64(b + 0x28))
	const y: LamportsCell = x.lamports
	const az = s.executable
	const ba = s.is_writable
	const bb = s.is_signer
	const bc = s.rent_epoch
	const af = s.owner
	const z = x.key
	rc_inc(y)
	const aa: DataCell = x.data
	rc_inc(aa)
	const ab: AccountInfo = ld64(ld64(b + 0x30))
	const ac: LamportsCell = ab.lamports
	const av = x.executable
	const aw = x.is_writable
	const ax = x.is_signer
	const ay = x.rent_epoch
	const ak = x.owner
	const ad = ab.key
	rc_inc(ac)
	const ae: DataCell = ab.data
	rc_inc(ae)
	const aj = ab.owner
	const ai = ab.rent_epoch
	const ah = ab.is_signer
	const ag = ab.is_writable
	st8(sd0 + 2, ab.executable)
	st8(sd0, ah, ag)
	st64(sf8, ad, ac, ae, aj, ai)
	st8(s100, ax, aw, av)
	st64(s128, z, y, aa, ak, ay)
	st8(s130, bb, ba, az)
	st64(s158, u, t, w, af, bc)
	st8(s160, bf, be, bd)
	st64(s188, bh, q, r, v, bg)
	st8(s190, bk, bj, bi)
	st64(s1b8, bn, m, n, bm, bl)
	st8(s1c0, bq, bp, bo)
	st64(s1e8, bt, j, k, bs, br)
	st8(s1f0, bw, bv, bu)
	st64(s218, o, g, h, by, bx)
	st64(sc8, 8, 0)
	st64(s230, 0, 8, 0)
	let au = associated_token_create(s240, s230)
	const al = ld64(s240)
	if (al != 2) {
		const ao = ld64(s240 + 8)
		st64(a, al, ao)
		return au
	}
	au = Account_try_from_unchecked(sb8, l)
	if (ld32(sb8 + 0x90) == 2) {
		const ap = ld64(0x300000000 /* heap bump-allocator cursor */)
		const ar = ap != 0 ? sat_sub(ap, 0x14) : 0x300007fec
		const at = ld64(sb8 + 8)
		const aq = ld64(sb8)
		if (aq != 0) {
			if (0x300000008 > ar) {
				raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, ar)
			st64(ar + 8, 0x6363615f74666e5f)
			st64(ar, 0x6e6f697469736f70)
			st32(ar + 0x10, 0x746e756f)
			void ld64(at)
		} else {
			if (0x300000008 > ar) {
				raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, ar)
			st64(ar + 8, 0x6363615f74666e5f)
			st64(ar, 0x6e6f697469736f70)
			st32(ar + 0x10, 0x746e756f)
			void ld64(at)
		}
		st64(at + 0x10, ar, 0x14)
		st64(at + 8, 0x14)
		st64(at, 1)
		st64(a + 8, at)
		st64(a, aq)
		return au
	}
	const am = ld64(0x300000000 /* heap bump-allocator cursor */)
	const an = am != 0 ? sat_sub(am, 0xb8) & -8 : 0x300007f48
	if (0x300000008 > an) {
		alloc_handle_alloc_error(8, 0xb8)
	}
	st64(0x300000000 /* heap bump-allocator cursor */, an)
	au = memcpy(an, sb8, 0xb8)
	st64(a + 8, an)
	st64(a, 2)
	return au
}

export function fn_c9aa0(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68
	let s, t, u, x, aa: u64
	let o = fn_a80(s28, ld64(b + 8), c)
	let f = ld64(s28)
	if (f != 2) {
		const v = ld64(0x300000000 /* heap bump-allocator cursor */)
		t = v != 0 ? sat_sub(v, 0xa) : 0x300007ff6
		u = ld64(s28 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > t) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > v)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, t)
			st64(t, 0x6174735f6c6f6f70)
			st16(t + 8, 0x6574)
			void ld64(u)
		} else {
			if (0x300000008 > t) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > v)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, t)
			st64(t, 0x6174735f6c6f6f70)
			st16(t + 8, 0x6574)
			void ld64(u)
		}
		st64(u + 8, 0xa)
		st64(u, 1)
		st64(u + 0x18, 0xa)
		st64(u + 0x10, t)
		st64(a + 8, u)
		st64(a, f)
		return o
	}
	B41: {
		const g = ld64(b + 0x88)
		const h = ld64(g + 0x20)
		if ((memcmp(g, c, 0x20) as u32) == 0 && (common_is_closed(h) == 0 && ld64(ld64(h + 0x10) + 0x10) != 0)) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			o = fn_13e628(s38, s18)
			f = ld64(s38)
			if (f != 2) {
				const w = ld64(0x300000000 /* heap bump-allocator cursor */)
				x = 0xd > w
				t = w != 0 ? x != 0 ? 0 : w - 0xd : 0x300007ff3
				u = ld64(s38 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > t) {
						raw_vec_handle_error(1, 0xd, 0x10015f8f8, x, aa)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, t)
					st64(t + 5, 0x305f746c7561765f)
					st64(t, 0x61765f6e656b6f74)
					void ld64(u)
					break B41
				}
				if (0x300000008 > t) {
					raw_vec_handle_error(1, 0xd, 0x10015f8f8, x, aa)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, t)
				st64(t + 5, 0x305f746c7561765f)
				st64(t, 0x61765f6e656b6f74)
				void ld64(u)
				break B41
			}
		}
		const i = ld64(b + 0x90)
		const j = ld64(i + 0x20)
		if ((memcmp(i, c, 0x20) as u32) == 0 && (common_is_closed(j) == 0 && ld64(ld64(j + 0x10) + 0x10) != 0)) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			o = fn_13e628(s48, s18)
			f = ld64(s48)
			if (f != 2) {
				const y = ld64(0x300000000 /* heap bump-allocator cursor */)
				x = 0xd > y
				t = y != 0 ? x != 0 ? 0 : y - 0xd : 0x300007ff3
				u = ld64(s48 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > t) {
						raw_vec_handle_error(1, 0xd, 0x10015f8f8, x, aa)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, t)
					st64(t + 5, 0x315f746c7561765f)
					st64(t, 0x61765f6e656b6f74)
					void ld64(u)
					break B41
				}
				if (0x300000008 > t) {
					raw_vec_handle_error(1, 0xd, 0x10015f8f8, x, aa)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, t)
				st64(t + 5, 0x315f746c7561765f)
				st64(t, 0x61765f6e656b6f74)
				void ld64(u)
				break B41
			}
		}
		const k = ld64(b + 0xa8)
		const l = ld64(k + 0x20)
		if ((memcmp(k, c, 0x20) as u32) == 0 && (common_is_closed(l) == 0 && ld64(ld64(l + 0x10) + 0x10) != 0)) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			o = fn_13e628(s58, s18)
			s = undef
			f = ld64(s58)
			if (f != 2) {
				const z = ld64(0x300000000 /* heap bump-allocator cursor */)
				t = z != 0 ? sat_sub(z, 0x19) : 0x300007fe7
				u = ld64(s58 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > t) {
						raw_vec_handle_error(1, 0x19, 0x10015f8f8, 0x19 > z, s)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, t)
					st64(t + 0x10, 0x5f746e756f636361)
					st64(t + 8, 0x5f6e656b6f745f74)
					st64(t, 0x6e65697069636572)
					st8(t + 0x18, 0x30)
					void ld64(u)
				} else {
					if (0x300000008 > t) {
						raw_vec_handle_error(1, 0x19, 0x10015f8f8, 0x19 > z, s)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, t)
					st64(t + 0x10, 0x5f746e756f636361)
					st64(t + 8, 0x5f6e656b6f745f74)
					st64(t, 0x6e65697069636572)
					st8(t + 0x18, 0x30)
					void ld64(u)
				}
				st64(u + 8, 0x19)
				st64(u, 1)
				st64(u + 0x18, 0x19)
				st64(u + 0x10, t)
				st64(a + 8, u)
				st64(a, f)
				return o
			}
		}
		const m = ld64(b + 0xb0)
		const p = ld64(m + 0x20)
		const n = memcmp(m, c, 0x20)
		u = undef
		o = n as u32
		if (o != 0) {
			st64(a + 8, u)
			st64(a, 2)
			return o
		}
		o = common_is_closed(p)
		u = undef
		if (o != 0) {
			st64(a + 8, u)
			st64(a, 2)
			return o
		}
		if (ld64(ld64(p + 0x10) + 0x10) == 0) {
			st64(a + 8, u)
			st64(a, 2)
			return o
		}
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		o = fn_13e628(s68, s18)
		u = undef
		const q = ld64(s68)
		if (q == 2) {
			st64(a + 8, u)
			st64(a, 2)
			return o
		}
		const r = ld64(0x300000000 /* heap bump-allocator cursor */)
		s = 0x19 > r
		t = r != 0 ? s != 0 ? 0 : r - 0x19 : 0x300007fe7
		u = ld64(s68 + 8)
		if ((q & 1) != 0) {
			if (0x300000008 > t) {
				raw_vec_handle_error(1, 0x19, 0x10015f8f8, 0x300000008, s)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, t)
			st64(t + 0x10, 0x5f746e756f636361)
			st64(t + 8, 0x5f6e656b6f745f74)
			st64(t, 0x6e65697069636572)
			st8(t + 0x18, 0x31)
			void ld64(u)
		} else {
			if (0x300000008 > t) {
				raw_vec_handle_error(1, 0x19, 0x10015f8f8, 0x300000008, s)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, t)
			st64(t + 0x10, 0x5f746e756f636361)
			st64(t + 8, 0x5f6e656b6f745f74)
			st64(t, 0x6e65697069636572)
			st8(t + 0x18, 0x31)
			void ld64(u)
		}
		st64(u + 8, 0x19)
		st64(u, 1)
		st64(u + 0x18, 0x19)
		st64(u + 0x10, t)
		st64(a + 8, u)
		st64(a, q)
		return o
	}
	st64(u + 8, 0xd)
	st64(u, 1)
	st64(u + 0x18, 0xd)
	st64(u + 0x10, t)
	st64(a + 8, u)
	st64(a, f)
	return o
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_ccf98(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10
	const j = fn_e30(s10, ld64(b + 8), c)
	let i = undef
	const f = ld64(s10)
	if (f == 2) {
		st64(a + 8, i)
		st64(a, f)
		return j
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0xf) : 0x300007ff1
	i = ld64(s10 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0x300000008, 0xf > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 7, 0x65746174735f6e6f)
		st64(h, 0x6f6974617265706f)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0x300000008, 0xf > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 7, 0x65746174735f6e6f)
		st64(h, 0x6f6974617265706f)
		void ld64(i)
	}
	st64(i + 0x10, h, 0xf)
	st64(i + 8, 0xf)
	st64(i, 1)
	st64(a + 8, i)
	st64(a, f)
	return j
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_cf1b8(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10
	const j = fn_a80(s10, ld64(b + 8), c)
	let i = undef
	const f = ld64(s10)
	if (f == 2) {
		st64(a + 8, i)
		st64(a, f)
		return j
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0xa) : 0x300007ff6
	i = ld64(s10 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x6174735f6c6f6f70)
		st16(h + 8, 0x6574)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x6174735f6c6f6f70)
		st16(h + 8, 0x6574)
		void ld64(i)
	}
	st64(i + 0x10, h, 0xa)
	st64(i + 8, 0xa)
	st64(i, 1)
	st64(a + 8, i)
	st64(a, f)
	return j
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_f6fe8(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30
	let h, i, j: u64
	let l = fn_a80(s10, ld64(b + 0x10), c)
	let f = ld64(s10)
	if (f != 2) {
		const k = ld64(0x300000000 /* heap bump-allocator cursor */)
		i = k != 0 ? sat_sub(k, 0xa) : 0x300007ff6
		j = ld64(s10 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i, 0x6174735f6c6f6f70)
			st16(i + 8, 0x6574)
			void ld64(j)
		} else {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i, 0x6174735f6c6f6f70)
			st16(i + 8, 0x6574)
			void ld64(j)
		}
		st64(j + 8, 0xa)
		st64(j, 1)
		st64(j + 0x18, 0xa)
		st64(j + 0x10, i)
		st64(a + 8, j)
		st64(a, f)
		return l
	}
	l = fn_8a8(s20, ld64(b + 0x38), c)
	f = ld64(s20)
	if (f == 2) {
		l = fn_c58(s30, ld64(b + 0x40), c)
		j = undef
		f = ld64(s30)
		if (f == 2) {
			st64(a + 8, j)
			st64(a, 2)
			return l
		}
		const g = ld64(0x300000000 /* heap bump-allocator cursor */)
		h = 0x11 > g
		i = g != 0 ? h != 0 ? 0 : g - 0x11 : 0x300007fef
		j = ld64(s30 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i + 8, 0x616d7469625f7961)
			st64(i, 0x7272615f6b636974)
			st8(i + 0x10, 0x70)
			void ld64(j)
		} else {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i + 8, 0x616d7469625f7961)
			st64(i, 0x7272615f6b636974)
			st8(i + 0x10, 0x70)
			void ld64(j)
		}
	} else {
		const m = ld64(0x300000000 /* heap bump-allocator cursor */)
		h = 0x11 > m
		i = m != 0 ? h != 0 ? 0 : m - 0x11 : 0x300007fef
		j = ld64(s20 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i + 8, 0x746174735f6e6f69)
			st64(i, 0x746176726573626f)
			st8(i + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
			void ld64(j)
		} else {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i + 8, 0x746174735f6e6f69)
			st64(i, 0x746176726573626f)
			st8(i + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
			void ld64(j)
		}
	}
	st64(j + 8, 0x11)
	st64(j, 1)
	st64(j + 0x18, 0x11)
	st64(j + 0x10, i)
	st64(a + 8, j)
	st64(a, f)
	return l
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_f75f0(a: u64, b: u64, r0: u64): u64 {
	const s10 = fp - 0x10, s40 = fp - 0x40, s58 = fp - 0x58, s59 = fp - 0x59
	let j: u64
	const g = ld64(b)
	let f = ld64(b + 8)
	if (0x10 > f) {
		r0 = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		st64(b, g + f, 0)
		st64(a, r0)
		st8(a + 0x11, 2)
		return r0
	}
	const k = ld64(g + 8)
	const l = ld64(g)
	st64(b, g + 0x10, f - 0x10)
	if (f == 0x10) {
		r0 = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		st64(a, r0)
		st8(a + 0x11, 2)
		return r0
	}
	const i = ld8(g + 0x10)
	st64(b, g + 0x11)
	let h = f - 0x11
	st64(b + 8, h)
	st8(s59, i)
	if (3 > i) {
		if (h == 0) {
			r0 = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
			st64(a, r0)
			st8(a + 0x11, 2)
			return r0
		}
		f = f - 0x12
		h = ld8(g + 0x11)
		st64(b + 8, f)
		st64(b, g + 0x12)
		st8(s59, h)
		if (2 > h) {
			st64(a + 8, k)
			st64(a, l)
			st8(a + 0x10, i, h)
			return r0
		}
		st64(s40, 0x10015f910)
		st64(s40 + 0x10, s10)
		j = fn_154c88
	} else {
		st64(s40, 0x10015fa30)
		st64(s40 + 0x10, s10)
		j = num_fmt_f548
	}
	st64(s10, s59, j)
	st64(s40 + 0x20, 0)
	st64(s40 + 8, 1)
	st64(s40 + 0x18, 1)
	fn_14de10(s58, s40, f, i, h)
	r0 = fn_f128(s58)
	st64(a, r0)
	st8(a + 0x11, 2)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), c (value), a (points to it)
export function fn_100918(a: u64, b: u64, c: u64): u64 {
	const s20 = fp - 0x20, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sc8 = fp - 0xc8, sd0 = fp - 0xd0, sd8 = fp - 0xd8, se0 = fp - 0xe0, se8 = fp - 0xe8, sf0 = fp - 0xf0
	let o, r, s, ah, aq, bf: u64
	const p = ld64(b)
	const f = ld64(b + 8)
	st64(sc8, f)
	if (f == 0) {
		o = clz(p)
		r = 0x40 - o
	} else {
		const g = f | f >> 1
		const h = g | g >> 2
		const i = h | h >> 4
		const j = i | i >> 8
		const k = j | j >> 0x10
		const l = ~(k | k >> 0x20)
		const m = l - (l >> 1 & 0x5555555555555555)
		const n = (m & 0x3333333333333333) + (m >> 2 & 0x3333333333333333)
		o = n >> 4
		r = 0x80 - ((n + o & 0xf0f0f0f0f0f0f0f) * 0x101010101010101 >> 0x38)
	}
	const aa = ld64(c)
	const q = ld64(c + 8)
	if (q == 0) {
		o = aa != 0 ? 0x101010101010101 : o
		s = 0x40 - clz(aa)
		if (aa == 0) {
			st64(s50, 0x100160980, 1, 8, 0, 0)
			// fmt "division by zero"
			fn_14ec00(s50, 0x10015fe28, c, r, s)
		}
	} else {
		o = clz(q)
		s = 0x80 - o
	}
	if (s > r) {
		st64(a + 8, 0)
		st64(a, 0)
		copy(a + 0x10, b, 0x10)
		return o
	}
	st64(sd0, a)
	if (0x41 > s) {
		if (aa != 0) {
			const ab = ld64(sc8)
			const ac = ab / aa
			__udivti3(sb0, p, ab - ac * aa, aa, 0)
			const ad = ld64(sb0)
			o = __multi3_159030(sc0, ad, ld64(sb0 + 8), aa, 0)
			const ae = ld64(sd0)
			st64(ae + 8, ac)
			st64(ae, ad)
			st64(ae + 0x10, p - ld64(sc0))
			st64(ae + 0x18, 0)
			return o
		}
		fn_1548e8(0x10015fe28, b, c, r, s)
	}
	let u = s - 1 >> 6
	let t = r - 1 >> 6
	if (u > t) {
		fn_154788(0x10015fe28, b, c, t, u)
	}
	copyr(s20, c, 0x10)
	const v = s20 + (u << 3)
	const w = ld64(v)
	let x = clz(w)
	const af = ld64(s20 + 8)
	const y = ld64(s20)
	st64(s50, 0, 0)
	let z = x & 0x3f
	st64(s50 + ((w == 0) << 3), y << (z & 0x3f))
	if (w != 0) {
		const ag = af << (z & 0x3f)
		st64(s50 + 8, ag)
		if (z != 0) {
			ah = ag + (y >> (-x & 0x3f))
			if (ag > ah) {
				fn_154730(0x10015fe28, b, x, ah, z)
			}
			st64(s50 + 8, ah)
		}
		copy(s20, s50, 0x10)
		const ai = 0x40 - x
		const aj = ai >> 6 << 3
		let am = 0
		st64(sd8, ld64(b + aj) >> (ai & 0x3f))
		if (x != 0) {
			am = ld64(aj + b + 8) >> (ai & 0x3f)
			if ((ai & 0x3f) != 0) {
				ah = x
				const ak = ld64(sc8) << (z & 0x3f)
				z = ld64(sd8)
				b = z + ak
				x = z > b
				if (x != 0) {
					fn_154730(0x10015fe28, b, x, ah, z)
				}
				st64(sd8, b)
				x = ah
			}
		}
		st64(sf0, x)
		const al = p << (x & 0x3f)
		let ap = -1
		st64(se8, ld64(s20 + 8))
		st64(sc8, ld64(s20))
		const an = ld64(v)
		st64(se0, am)
		if (an > am) {
			const ao = ld64(sd8)
			__udivti3(s60, ao, ld64(se0), an, 0)
			ap = ld64(s60)
			__multi3_159030(s70, ap, ld64(s60 + 8), an, 0)
			let ar = ao - ld64(s70)
			do {
				__multi3_159030(s80, ap, 0, ld64(sc8), 0)
				t = undef
				u = undef
				let at = al >= ld64(s80)
				c = ld64(s80 + 8)
				b = ar > c
				at = ar != c ? b : at
				if ((at & 1) != 0) {
					break
				}
				if (ap == 0) {
					fn_154788(0x10015fe28, b, c, t, u)
				}
				aq = ar > ar + an
				ap = ap - 1
				ar = ar + an
			} while ((aq & 1) == 0)
		}
		__multi3_159030(s90, ap, 0, ld64(sc8), 0)
		const au = ld64(se8)
		__multi3_159030(sa0, ap, 0, au, 0)
		const av = ld64(s90 + 8)
		u = av + ld64(sa0)
		const aw = ld64(s90)
		const ax = u + (aw > al)
		const ay = ld64(sd8)
		t = av > u
		o = u > ax | ax > ay
		c = ld64(sa0 + 8) + t + o
		let bb = ay - ax
		let az = al - aw
		b = ld64(se0)
		let bd = b - c
		if (c > b) {
			if (ap == 0) {
				fn_154788(0x10015fe28, b, c, t, u)
			}
			const ba = ld64(sc8)
			o = au + (az > az + ba)
			const bc = bb + o
			bd = bd + (au > o | bb > bc)
			ap = ap - 1
			bb = bc
			az = az + ba
		}
		const be = ld64(sf0)
		const bg = bb >> (be & 0x3f)
		const bh = az >> (be & 0x3f)
		if (be != 0) {
			bf = ld64(sd0)
			st64(bf + 0x18, (bd << (-be & 0x3f)) | bg)
			st64(bf + 0x10, (bb << (-be & 0x3f)) | bh)
			st64(bf, ap, 0)
			return o
		}
		bf = ld64(sd0)
		st64(bf + 0x18, bg)
		st64(bf + 0x10, bh)
		st64(bf, ap, 0)
		return o
	}
	fn_154890(0x10015fe28, b, x, w, z)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (value), c (value)
export function fn_1019b8(a: u64, b: u64, c: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s48 = fp - 0x48, s68 = fp - 0x68, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s1c8 = fp - 0x1c8, s1d0 = fp - 0x1d0, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8
	let f, h, k, m, n, be: u64
	B5: {
		st64(s1e0, a)
		let i = -0x40
		f = ld64(b + 0x18)
		let g = f
		if (f == 0) {
			i = -0x80
			g = ld64(b + 0x10)
			if (g == 0) {
				i = -0xc0
				g = ld64(b + 8)
				if (g == 0) {
					h = clz(ld64(b))
					m = 0x40 - h
					break B5
				}
			}
		}
		h = clz(g)
		m = i - h + 0x140
	}
	B9: {
		let l = -0x40
		let j = ld64(c + 0x18)
		if (j == 0) {
			l = -0x80
			j = ld64(c + 0x10)
			if (j == 0) {
				l = -0xc0
				j = ld64(c + 8)
				if (j == 0) {
					k = ld64(c)
					h = k != 0 ? 0x101010101010101 : h
					n = 0x40 - clz(k)
					if (k != 0) {
						break B9
					}
					st64(s98, 0x100160980, 1, 8, 0, 0)
					// fmt "division by zero"
					fn_14ec00(s98, 0x10015feb8, c, f, k)
				}
			}
		}
		k = 0x101010101010101
		h = clz(j)
		n = l - h + 0x140
	}
	if (n > m) {
		const o = ld64(s1e0)
		st64(o + 0x18, 0)
		st64(o + 0x10, 0)
		st64(o + 8, 0)
		st64(o, 0)
		copy(o + 0x20, b, 0x20)
		return h
	}
	if (0x41 > n) {
		const an = ld64(c)
		if (an != 0) {
			const ap = ld64(b + 0x10)
			const ar = ld64(b + 8)
			st64(s1c8 + 0x58, ld64(b))
			const ao = f / an
			__udivti3(s118, ap, f - ao * an, an, 0)
			const aq = ld64(s118)
			st64(s1c8 + 0x50, aq)
			__multi3_159030(s128, aq, ld64(s118 + 8), an, 0)
			__udivti3(s138, ar, ap - ld64(s128), an, 0)
			const at = ld64(s138)
			st64(s1c8 + 0x48, at)
			__multi3_159030(s148, at, ld64(s138 + 8), an, 0)
			const au = ld64(s1c8 + 0x58)
			__udivti3(s158, au, ar - ld64(s148), an, 0)
			const av = ld64(s158)
			h = __multi3_159030(s168, av, ld64(s158 + 8), an, 0)
			const aw = ld64(s1e0)
			st64(aw + 0x18, ao)
			st64(aw + 0x10, ld64(s1c8 + 0x50))
			st64(aw + 8, ld64(s1c8 + 0x48))
			st64(aw, av)
			st64(aw + 0x20, au - ld64(s168))
			st64(aw + 0x28, 0, 0, 0)
			return h
		}
		fn_1548e8(0x10015feb8, b, c, f, k)
	}
	const p = n - 1
	const q = m - 1
	if ((p >> 6) > (q >> 6)) {
		fn_154788(0x10015feb8, b, c, f, k)
	}
	copyr(s68, c, 0x20)
	const r = s68 + (p >> 6 << 3)
	st64(s1c8 + 0x50, r)
	const s = ld64(r)
	st64(s1d0, p)
	st64(s1c8 + 0x58, s)
	st64(s1c8 + 0x40, p >> 6)
	st64(s1c8 + 0x28, (p >> 6) + 1)
	let u = s98 + ((s == 0) << 3)
	st64(s1e8, clz(s))
	k = clz(s) & 0x3f
	let v = (s == 0) - 1
	st64(s98, 0, 0, 0, 0)
	let t = c
	while (true) {
		f = ld64(t) << (k & 0x3f)
		st64(u, f)
		t = t + 8
		u = u + 8
		v = v + 1
		if (v >= 3) {
			if (k != 0) {
				let z = (s == 0) - 1
				const w = ld64(s1e8)
				let x = ((s == 0) << 3) + s98 + 8
				do {
					const ad = ld64(x)
					const y = ad + (ld64(c) >> (-w & 0x3f))
					f = ad > y
					if (f != 0) {
						fn_154730(0x10015feb8, b, c, f, k)
					}
					st64(x, y)
					x = x + 8
					c = c + 8
					z = z + 1
				} while (2 > z)
			}
			copyr(s68, s98, 0x20)
			const aa = ld64(s1c8 + 0x58)
			if (aa == 0) {
				fn_154890(0x10015feb8, b, aa, f, k)
			}
			st64(s1c8 + 0x38, (q >> 6) - ld64(s1c8 + 0x40))
			const ab = ld64(s1e8)
			let af = 0
			const ac = 0x40 - ab >> 6
			const ae = b + (ac << 3)
			st64(s1c8 + 0x58, ld64(b))
			const ag = 0x40 - ab & 0x3f
			let ah = ac - 1
			st64(s98, 0, 0, 0, 0)
			while (true) {
				f = ld64(ae + af) >> (ag & 0x3f)
				st64(s98 + af, f)
				af = af + 8
				ah = ah + 1
				if (ah >= 3) {
					const ax = ld64(s1c8 + 0x40)
					if (ag != 0) {
						const ai = (ac << 3) + b
						b = s98
						let al = ac - 1
						let ak = ai + 8
						do {
							c = ld64(ak) << (k & 0x3f)
							const am = ld64(b)
							const aj = am + c
							f = am > aj
							if (f != 0) {
								fn_154730(0x10015feb8, b, c, f, k)
							}
							st64(b, aj)
							ak = ak + 8
							b = b + 8
							al = al + 1
						} while (2 > al)
					}
					copyr(s40, s98, 0x20)
					st64(s48, ld64(s1c8 + 0x58) << (ld64(s1e8) & 0x3f))
					st64(s20, 0, 0, 0, 0)
					if (ax - 1 > 3) {
						fn_14ec98(-1, 4, 0x10015feb8, f, k)
					}
					st64(s1c8 + 0x50, ld64(ld64(s1c8 + 0x50)))
					c = s48 + ((q >> 6 << 3) - (ax << 3))
					st64(s1c8 + 0x58, c)
					copyr(s1c8, s68, 0x20)
					st64(s1d8, ld64(s68 + (ax - 1 << 3)))
					b = ld64(s1c8 + 0x38)
					st64(s1c8 + 0x40, ax + 2)
					L31: while (true) {
						const ay = b
						const az = ld64(s1c8 + 0x28)
						if (b > b + az) {
							fn_154730(0x10015feb8, b, c, f, k)
						}
						st64(s1c8 + 0x48, b)
						if (5 > ay + az) {
							b = s48 + (ay + az << 3)
							let bd = -1
							st64(s1c8 + 0x20, b)
							c = ld64(b)
							if (ld64(s1c8 + 0x50) > c) {
								if (ay + az == 1) {
									fn_154788(0x10015feb8, b, c, f, k)
								}
								if (ay + az == 0) {
									fn_154788(0x10015feb8, b, c, f, k)
								}
								const ba = (ay + az << 3) + s48
								const bb = ld64(ba - 8)
								const bc = ld64(s1c8 + 0x50)
								__udivti3(sa8, bb, c, bc, 0)
								bd = ld64(sa8)
								__multi3_159030(sb8, bd, ld64(sa8 + 8), bc, 0)
								let bh = bb - ld64(sb8)
								const bg = ld64(ba - 0x10)
								const bf = ld64(s1d8)
								do {
									__multi3_159030(sc8, bd, 0, bf, 0)
									f = undef
									k = undef
									let bi = bg >= ld64(sc8)
									c = ld64(sc8 + 8)
									b = bh > c
									bi = bh != c ? b : bi
									if ((bi & 1) != 0) {
										break
									}
									if (bd == 0) {
										fn_154788(0x10015feb8, b, c, f, k)
									}
									const bj = ld64(s1c8 + 0x50)
									be = bh > bh + bj
									bd = bd - 1
									bh = bh + bj
								} while ((be & 1) == 0)
							}
							__multi3_159030(sd8, bd, 0, ld64(s1c8), 0)
							__multi3_159030(se8, bd, 0, ld64(s1c8 + 8), 0)
							__multi3_159030(sf8, bd, 0, ld64(s1c8 + 0x10), 0)
							__multi3_159030(s108, bd, 0, ld64(s1c8 + 0x18), 0)
							const bl = ld64(se8)
							const bk = ld64(sd8 + 8)
							const bm = ld64(se8 + 8) + (bk > bk + bl)
							const bn = ld64(sf8)
							const br = ld64(s1c8 + 0x48)
							const bq = ld64(s1c8 + 0x40)
							const bo = ld64(sf8 + 8) + (bm > bm + bn)
							const bp = ld64(s108)
							k = ld64(sd8)
							st64(s98, k, bk + bl, bm + bn, bo + bp)
							st64(s98 + 0x20, ld64(s108 + 8) + (bo > bo + bp))
							if (ld64(s1c8 + 0x38) > 5) {
								fn_153150(ld64(s1c8 + 0x38), 5, 0x10015feb8, bo + bp, k)
							}
							if (0x100 > ld64(s1d0)) {
								c = 5 - br
								f = min(c, bq)
								if (br == 5) {
									fn_14ec98(5, 4, 0x10015feb8, f, k)
								}
								st64(s1c8 + 0x30, br - 1)
								let bv = 0
								k = 0
								let bw = 0
								while (true) {
									const bx = ld64(s98 + bv)
									const bt = bx + bw
									const bu = ld64(s1c8 + 0x58) + bv
									const bs = ld64(bu)
									b = bs - bt
									st64(bu, b)
									bw = bx > bt | bt > bs
									bv = bv + 8
									k = k + 1
									if (k >= f) {
										if ((bw & 1) != 0) {
											if (bd == 0) {
												fn_154788(0x10015feb8, b, c, f, k)
											}
											if (c >= ld64(s1c8 + 0x28)) {
												c = ld64(s1c8 + 0x28)
											}
											bd = bd - 1
											let bz = 0
											f = 0
											k = 0
											while (true) {
												const cb = ld64(s68 + bz)
												const cc = cb + k
												const by = ld64(s1c8 + 0x58) + bz
												const cd = ld64(by)
												st64(by, cd + cc)
												k = cb > cc | cd > cd + cc
												bz = bz + 8
												f = f + 1
												if (f >= c) {
													const ca = ld64(s1c8 + 0x20)
													st64(ca, ld64(ca) + k)
													break
												}
											}
										}
										const ce = ld64(s1c8 + 0x38)
										c = ld64(s1c8 + 0x48)
										if (4 > ce) {
											st64(s20 + (c << 3), bd)
											st64(s1c8 + 0x58, ld64(s1c8 + 0x58) - 8)
											b = ld64(s1c8 + 0x30)
											if (c == 0) {
												const cf = ld64(s40 + 0x10)
												const cg = ld64(s1e8)
												let cj = cf >> (cg & 0x3f)
												const ch = ld64(s40 + 8)
												let ck = ch >> (cg & 0x3f)
												const ci = ld64(s40)
												let cl = ci >> (cg & 0x3f)
												let cm = ld64(s48) >> (cg & 0x3f)
												if (cg != 0) {
													cj = (ld64(s40 + 0x18) << (-cg & 0x3f)) | cj
													ck = (cf << (-cg & 0x3f)) | ck
													cl = (ch << (-cg & 0x3f)) | cl
													cm = (ci << (-cg & 0x3f)) | cm
												}
												h = ld64(s1e0)
												st64(h + 0x18, ld64(s20 + 0x18))
												st64(h + 0x10, ld64(s20 + 0x10))
												st64(h + 8, ld64(s20 + 8))
												st64(h, ld64(s20))
												st64(h + 0x38, cj)
												st64(h + 0x30, ck)
												st64(h + 0x28, cl)
												st64(h + 0x20, cm)
												return h
											}
											continue L31
										}
										fn_14ec98(ce, 4, 0x10015feb8, f, k)
									}
								}
							}
							fn_153158(bq, 5, 0x10015feb8, bo + bp, k)
						}
						fn_14ec98(ay + az, 5, 0x10015feb8, f, k)
					}
				}
			}
		}
	}
}

export function fn_104b78(a: u64, b: u64, c: u64): u64 {
	const s40 = fp - 0x40, s48 = fp - 0x48, s88 = fp - 0x88, sc8 = fp - 0xc8, sd0 = fp - 0xd0, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s320 = fp - 0x320, s328 = fp - 0x328, s330 = fp - 0x330, s338 = fp - 0x338, s340 = fp - 0x340
	let f, h, j, m, n, x, bj, df: u64
	B9: {
		j = c
		let i = -0x40
		f = ld64(b + 0x38)
		let g = f
		if (f == 0) {
			i = -0x80
			g = ld64(b + 0x30)
			if (g == 0) {
				i = -0xc0
				g = ld64(b + 0x28)
				if (g == 0) {
					i = -0x100
					g = ld64(b + 0x20)
					if (g == 0) {
						i = -0x140
						g = ld64(b + 0x18)
						if (g == 0) {
							i = -0x180
							g = ld64(b + 0x10)
							if (g == 0) {
								i = -0x1c0
								g = ld64(b + 8)
								if (g == 0) {
									h = clz(ld64(b))
									m = 0x40 - h
									break B9
								}
							}
						}
					}
				}
			}
		}
		h = clz(g)
		m = i - h + 0x240
	}
	B17: {
		let l = -0x40
		let k = ld64(j + 0x38)
		if (k == 0) {
			l = -0x80
			k = ld64(j + 0x30)
			if (k == 0) {
				l = -0xc0
				k = ld64(j + 0x28)
				if (k == 0) {
					l = -0x100
					k = ld64(j + 0x20)
					if (k == 0) {
						l = -0x140
						k = ld64(j + 0x18)
						if (k == 0) {
							l = -0x180
							k = ld64(j + 0x10)
							if (k == 0) {
								l = -0x1c0
								k = ld64(j + 8)
								if (k == 0) {
									const dg = ld64(j)
									h = dg != 0 ? 0x101010101010101 : h
									n = 0x40 - clz(dg)
									if (dg != 0) {
										break B17
									}
									st64(s48, 0x100160980, 1, 8, 0, 0)
									// fmt "division by zero"
									fn_14ec00(s48, 0x1001604b8, f, j, h)
								}
							}
						}
					}
				}
			}
		}
		h = clz(k)
		n = l - h + 0x240
	}
	if (n > m) {
		st64(a + 0x38, 0)
		st64(a + 0x30, 0)
		st64(a + 0x28, 0)
		st64(a + 0x20, 0)
		st64(a + 0x18, 0)
		st64(a + 0x10, 0)
		st64(a + 8, 0)
		st64(a, 0)
		return memcpy(a + 0x40, b, 0x40)
	}
	st64(s340, a)
	if (0x41 > n) {
		const aj = ld64(j)
		if (aj != 0) {
			const al = ld64(b + 0x30)
			const an = ld64(b + 0x28)
			const ap = ld64(b + 0x20)
			st64(s320 + 0x40, ld64(b + 0x18))
			st64(s320 + 0x50, ld64(b + 0x10))
			st64(s2c8 + 8, ld64(b + 8))
			st64(s2b8 + 8, ld64(b))
			const ak = f / aj
			st64(s2b8 + 0x10, ak)
			__udivti3(s1d0, al, f - ak * aj, aj, 0)
			const am = ld64(s1d0)
			st64(s2b8, am)
			__multi3_159030(s1e0, am, ld64(s1d0 + 8), aj, 0)
			__udivti3(s1f0, an, al - ld64(s1e0), aj, 0)
			const ao = ld64(s1f0)
			st64(s2c8, ao)
			__multi3_159030(s200, ao, ld64(s1f0 + 8), aj, 0)
			__udivti3(s210, ap, an - ld64(s200), aj, 0)
			const aq = ld64(s210)
			st64(s320 + 0x48, aq)
			__multi3_159030(s220, aq, ld64(s210 + 8), aj, 0)
			const ar = ld64(s320 + 0x40)
			__udivti3(s230, ar, ap - ld64(s220), aj, 0)
			const at = ld64(s230)
			st64(s320 + 0x38, at)
			__multi3_159030(s240, at, ld64(s230 + 8), aj, 0)
			const au = ld64(s320 + 0x50)
			__udivti3(s250, au, ar - ld64(s240), aj, 0)
			const av = ld64(s250)
			st64(s320 + 0x40, av)
			__multi3_159030(s260, av, ld64(s250 + 8), aj, 0)
			const aw = ld64(s2c8 + 8)
			__udivti3(s270, aw, au - ld64(s260), aj, 0)
			const ax = ld64(s270)
			__multi3_159030(s280, ax, ld64(s270 + 8), aj, 0)
			const ay = ld64(s2b8 + 8)
			__udivti3(s290, ay, aw - ld64(s280), aj, 0)
			const az = ld64(s290)
			df = __multi3_159030(s2a0, az, ld64(s290 + 8), aj, 0)
			const ba = ld64(s340)
			st64(ba + 0x38, ld64(s2b8 + 0x10))
			st64(ba + 0x30, ld64(s2b8))
			st64(ba + 0x28, ld64(s2c8))
			st64(ba + 0x20, ld64(s320 + 0x48))
			st64(ba + 0x18, ld64(s320 + 0x38))
			st64(ba + 0x10, ld64(s320 + 0x40))
			st64(ba + 8, ax)
			const bb = ld64(s2a0)
			st64(ba, az)
			st64(ba + 0x40, ay - bb, 0, 0, 0, 0, 0, 0, 0)
			return df
		}
		fn_1548e8(0x1001604b8, b, f, j, h)
	}
	st64(s2b8 + 8, b)
	const o = n - 1
	const p = m - 1
	if ((o >> 6) > (p >> 6)) {
		fn_154788(0x1001604b8, b, f, j, h)
	}
	st64(s338, 0x40)
	st64(s2b8 + 0x10, j)
	memcpy(s110, j, 0x40)
	const q = s110 + (o >> 6 << 3)
	st64(s2b8, q)
	const r = ld64(q)
	if (r != 0) {
		st64(s338, clz(r))
	}
	st64(s320 + 0x40, o >> 6)
	st64(s320 + 0x50, (o >> 6) + 1)
	let v = s48 + ((r == 0) << 3)
	const s = ld64(s338)
	let w = (r == 0) - 1
	st64(s48, 0, 0, 0, 0, 0, 0, 0, 0)
	let t = ld64(s2b8 + 0x10)
	let u = t
	while (true) {
		st64(v, ld64(u) << (s & 0x3f))
		u = u + 8
		v = v + 8
		w = w + 1
		if (w >= 7) {
			st64(s328, o)
			if ((s & 0x3f) != 0) {
				let y = (r == 0) - 1
				j = -ld64(s338) & 0x3f
				x = ((r == 0) << 3) + s48 + 8
				do {
					const ac = ld64(x)
					h = ac + (ld64(t) >> (j & 0x3f))
					if (ac > h) {
						fn_154730(0x1001604b8, t, x, j, h)
					}
					st64(x, h)
					x = x + 8
					t = t + 8
					y = y + 1
				} while (6 > y)
			}
			memcpy(s110, s48, 0x40)
			if (r == 0) {
				fn_154890(0x1001604b8)
			}
			st64(s2c8, (p >> 6) - ld64(s320 + 0x40))
			const z = ld64(s338)
			let ae = 0
			const aa = 0x40 - z >> 6
			const ab = ld64(s2b8 + 8)
			const ad = ab + (aa << 3)
			st64(s2b8 + 0x10, ld64(ab))
			const af = 0x40 - z & 0x3f
			let ag = aa - 1
			st64(s48, 0, 0, 0, 0, 0, 0, 0, 0)
			while (true) {
				st64(s48 + ae, ld64(ad + ae) >> (af & 0x3f))
				ae = ae + 8
				ag = ag + 1
				if (ag >= 7) {
					if (af != 0) {
						x = s48
						let ah = aa - 1
						t = (aa << 3) + ab + 8
						do {
							const ai = ld64(x)
							j = ai + (ld64(t) << (s & 0x3f))
							h = ai > j
							if (h != 0) {
								fn_154730(0x1001604b8, t, x, j, h)
							}
							st64(x, j)
							t = t + 8
							x = x + 8
							ah = ah + 1
						} while (6 > ah)
					}
					memcpy(sc8, s48, 0x40)
					j = undef
					h = undef
					st64(sd0, ld64(s2b8 + 0x10) << (ld64(s338) & 0x3f))
					st64(s88, 0, 0, 0, 0, 0, 0, 0, 0)
					const bc = ld64(s320 + 0x40)
					if (bc - 1 > 7) {
						fn_14ec98(-1, 8, 0x1001604b8, j, h)
					}
					let bd = ld64(ld64(s2b8))
					st64(s2b8 + 0x10, (sd0 + ((p >> 6 << 3) - (bc << 3))))
					copyr(s320, s110, 0x40)
					x = bc + 2
					st64(s320 + 0x40, x)
					st64(s2b8 + 8, ld64(s110 + (bc - 1 << 3)))
					t = ld64(s2c8)
					st64(s330, bd)
					L41: while (true) {
						const be = t
						const bf = ld64(s320 + 0x50)
						if (t > t + bf) {
							fn_154730(0x1001604b8, t, x, j, h)
						}
						st64(s2b8, t)
						if (9 > be + bf) {
							b = sd0 + (be + bf << 3)
							let bi = -1
							st64(s320 + 0x48, b)
							f = ld64(b)
							if (bd > f) {
								if (be + bf == 1) {
									fn_154788(0x1001604b8, b, f, j, h)
								}
								if (be + bf == 0) {
									fn_154788(0x1001604b8, b, f, j, h)
								}
								const bg = (be + bf << 3) + sd0
								const bh = ld64(bg - 8)
								__udivti3(s120, bh, f, bd, 0)
								bi = ld64(s120)
								__multi3_159030(s130, bi, ld64(s120 + 8), bd, 0)
								let bm = bh - ld64(s130)
								const bl = ld64(bg - 0x10)
								do {
									__multi3_159030(s140, bi, 0, ld64(s2b8 + 8), 0)
									j = undef
									h = undef
									let bn = bl >= ld64(s140)
									f = ld64(s140 + 8)
									b = bm > f
									bn = bm != f ? b : bn
									if ((bn & 1) != 0) {
										break
									}
									if (bi == 0) {
										fn_154788(0x1001604b8, b, f, j, h)
									}
									const bk = bm + bd
									bj = bm > bk
									bi = bi - 1
									bm = bk
								} while ((bj & 1) == 0)
							}
							__multi3_159030(s150, bi, 0, ld64(s320), 0)
							__multi3_159030(s160, bi, 0, ld64(s320 + 8), 0)
							__multi3_159030(s170, bi, 0, ld64(s320 + 0x10), 0)
							__multi3_159030(s180, bi, 0, ld64(s320 + 0x18), 0)
							__multi3_159030(s190, bi, 0, ld64(s320 + 0x20), 0)
							__multi3_159030(s1a0, bi, 0, ld64(s320 + 0x28), 0)
							__multi3_159030(s1b0, bi, 0, ld64(s320 + 0x30), 0)
							__multi3_159030(s1c0, bi, 0, ld64(s320 + 0x38), 0)
							const bp = ld64(s160)
							const bo = ld64(s150 + 8)
							st64(s2c8 + 8, 1)
							const bq = ld64(s160 + 8) + (bo > bo + bp)
							const br = ld64(s170)
							const bs = ld64(s170 + 8) + (bq > bq + br)
							const bt = ld64(s180)
							const bu = ld64(s180 + 8) + (bs > bs + bt)
							const bv = ld64(s190)
							const bw = ld64(s190 + 8) + (bu > bu + bv)
							const bx = ld64(s1a0)
							const by = ld64(s1a0 + 8) + (bw > bw + bx)
							const bz = ld64(s1b0)
							const ca = ld64(s1b0 + 8) + (by > by + bz)
							const cb = ld64(s1c0)
							if (ca + cb >= ca) {
								st64(s2c8 + 8, 0)
							}
							st64(s48, ld64(s150))
							st64(s40, bo + bp, bq + br, bs + bt, bu + bv, bw + bx, by + bz, ca + cb)
							st64(s40 + 0x38, ld64(s1c0 + 8) + ld64(s2c8 + 8))
							if (ld64(s2c8) > 9) {
								fn_153150(ld64(s2c8), 9, 0x1001604b8, bs + bt, bu + bv)
							}
							if (0x200 > ld64(s328)) {
								h = ld64(s2b8)
								f = 9 - h
								j = min(f, ld64(s320 + 0x40))
								if (h == 9) {
									fn_14ec98(9, 8, 0x1001604b8, j, h)
								}
								st64(s2c8 + 8, h - 1)
								let cf = 0
								h = 0
								let cg = 0
								while (true) {
									const ch = ld64(s48 + cf)
									const cd = ch + cg
									const ce = ld64(s2b8 + 0x10) + cf
									const cc = ld64(ce)
									b = cc - cd
									st64(ce, b)
									cg = ch > cd | cd > cc
									cf = cf + 8
									h = h + 1
									if (h >= j) {
										if ((cg & 1) != 0) {
											if (bi == 0) {
												fn_154788(0x1001604b8, b, f, j, h)
											}
											if (f >= ld64(s320 + 0x50)) {
												f = ld64(s320 + 0x50)
											}
											bi = bi - 1
											let cj = 0
											j = 0
											h = 0
											while (true) {
												const cl = ld64(s110 + cj)
												const cm = cl + h
												const ci = ld64(s2b8 + 0x10) + cj
												const cn = ld64(ci)
												st64(ci, cn + cm)
												h = cl > cm | cn > cn + cm
												cj = cj + 8
												j = j + 1
												if (j >= f) {
													const ck = ld64(s320 + 0x48)
													st64(ck, ld64(ck) + h)
													break
												}
											}
										}
										const co = ld64(s2c8)
										x = ld64(s2b8)
										if (8 > co) {
											st64(s88 + (x << 3), bi)
											st64(s2b8 + 0x10, ld64(s2b8 + 0x10) - 8)
											bd = ld64(s330)
											t = ld64(s2c8 + 8)
											if (x == 0) {
												const cp = ld64(sc8 + 0x30)
												const cq = ld64(s338)
												let cx = cp >> (cq & 0x3f)
												const cr = ld64(sc8 + 0x28)
												st64(s320 + 0x48, cr)
												let cy = cr >> (cq & 0x3f)
												const cs = ld64(sc8 + 0x20)
												st64(s320 + 0x50, cs >> (cq & 0x3f))
												const ct = ld64(sc8 + 0x18)
												st64(s2c8, ct >> (cq & 0x3f))
												const cu = ld64(sc8 + 0x10)
												st64(s2c8 + 8, cu >> (cq & 0x3f))
												const cv = ld64(sc8 + 8)
												st64(s2b8, cv >> (cq & 0x3f))
												const cw = ld64(sc8)
												st64(s2b8 + 0x10, cw >> (cq & 0x3f))
												st64(s2b8 + 8, ld64(sd0) >> (cq & 0x3f))
												if (cq != 0) {
													const cz = (cs << (-cq & 0x3f)) | ld64(s2c8)
													const da = (ct << (-cq & 0x3f)) | ld64(s2c8 + 8)
													const db = (cu << (-cq & 0x3f)) | ld64(s2b8)
													const dc = (cv << (-cq & 0x3f)) | ld64(s2b8 + 0x10)
													const dd = (cw << (-cq & 0x3f)) | ld64(s2b8 + 8)
													cx = (ld64(sc8 + 0x38) << (-cq & 0x3f)) | cx
													st64(s320 + 0x50, (ld64(s320 + 0x48) << (-cq & 0x3f)) | ld64(s320 + 0x50))
													st64(s2c8, cz, da)
													cy = (cp << (-cq & 0x3f)) | cy
													st64(s2b8, db, dd, dc)
												}
												const de = ld64(s340)
												df = memcpy(de, s88, 0x40)
												st64(de + 0x78, cx)
												st64(de + 0x70, cy)
												st64(de + 0x68, ld64(s320 + 0x50))
												st64(de + 0x60, ld64(s2c8))
												st64(de + 0x58, ld64(s2c8 + 8))
												st64(de + 0x50, ld64(s2b8))
												st64(de + 0x48, ld64(s2b8 + 0x10))
												st64(de + 0x40, ld64(s2b8 + 8))
												return df
											}
											continue L41
										}
										fn_14ec98(co, 8, 0x1001604b8, j, h)
									}
								}
							}
							fn_153158(ld64(s320 + 0x40), 9, 0x1001604b8, bs + bt, bu + bv)
						}
						fn_14ec98(be + bf, 9, 0x1001604b8, j, h)
					}
				}
			}
		}
	}
}

export function fn_106e00(a: u64, b: u64, c: u64) {
	const s30 = fp - 0x30
	const g = ld64(c + 8)
	const f = ld64(b + 8)
	const m = f > f + g
	const i = ld64(c)
	const h = ld64(b)
	const k = h > h + i
	const j = f + g + 1
	const ax = k != 0 ? j : f + g
	const l = k & j == 0
	const o = ld64(c + 0x10)
	const n = ld64(b + 0x10)
	let p = n + o + (l + m)
	const s = n > n + o
	const q = n + o > p
	p = (m | l) != 0 ? p : n + o
	const r = (m | l) & q
	const u = ld64(c + 0x18)
	const t = ld64(b + 0x18)
	const y = t > t + u
	let v = t + u + (r + s)
	const w = t + u > v
	v = (s | r) != 0 ? v : t + u
	const av = v
	const aw = p
	const x = (s | r) & w
	const aa = ld64(c + 0x20)
	const z = ld64(b + 0x20)
	const ak = z > z + aa
	let ab = z + aa + (x + y)
	const ac = z + aa > ab
	ab = ((y | x) & 1) != 0 ? ab : z + aa
	const au = ab
	const af = (y | x) & ac
	const ae = ld64(c + 0x28)
	const ad = ld64(b + 0x28)
	const an = ad > ad + ae
	const ah = ld64(c + 0x30)
	const ag = ld64(b + 0x30)
	const ai = ld64(b + 0x38)
	let aj = ai + ld64(c + 0x38)
	let at = ai > aj
	let al = ad + ae + ((af & 1) + ak)
	let am = (ak | af) & ad + ae > al
	let ao = ag + ah + ((am & 1) + an)
	const aq = ag + ah > ao
	al = ((ak | af) & 1) != 0 ? al : ad + ae
	const ap = an | am
	ao = (ap & 1) != 0 ? ao : ag + ah
	let ar = (ap & 1 & aq) + (ag > ag + ah)
	if (ar != 0) {
		am = aj + ar
		ar = aj > am
		at = at | ar
		aj = am
	}
	st64(a + 0x38, aj)
	st64(a + 0x30, ao)
	st64(a + 0x28, al)
	st64(a + 0x20, au)
	st64(a + 0x18, av)
	st64(a + 0x10, aw)
	st64(a + 8, ax)
	st64(a, h + i)
	if ((at & 1) != 0) {
		st64(s30, 0x100160990, 1, 8, 0, 0)
		// fmt "arithmetic operation overflow"
		fn_14ec00(s30, 0x1001604b8, a, ar, am)
	}
}

export function fn_1073b8(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s448 = fp - 0x448, s460 = fp - 0x460, s468 = fp - 0x468, s470 = fp - 0x470, s478 = fp - 0x478, s480 = fp - 0x480, s488 = fp - 0x488, s490 = fp - 0x490, s498 = fp - 0x498, s4a0 = fp - 0x4a0, s4a8 = fp - 0x4a8, s4b0 = fp - 0x4b0, s4b8 = fp - 0x4b8, s4c0 = fp - 0x4c0, s4c8 = fp - 0x4c8, s4d0 = fp - 0x4d0, s4d8 = fp - 0x4d8, s4e0 = fp - 0x4e0, s4e8 = fp - 0x4e8, s4f0 = fp - 0x4f0, s4f8 = fp - 0x4f8
	st64(s4f0, a)
	let l = 0
	st64(s4c8, c)
	const g = ld64(c)
	const f = ld64(b)
	let h = 0
	st64(s4d8, 0)
	if (f != 0) {
		__multi3_159030(s40, f, 0, g, 0)
		d = undef
		e = undef
		h = ld64(s40)
		st64(s4d8, ld64(s40 + 8))
	}
	st64(s4b8, f)
	st64(s4f8, h)
	const i = ld64(b + 8)
	st64(s470, i)
	if (i != 0) {
		__multi3_159030(s50, ld64(s470), 0, g, 0)
		d = undef
		e = undef
		const iu = ld64(s50)
		const iv = ld64(s4d8)
		l = (iu > iu + iv) + ld64(s50 + 8)
		st64(s4d8, iu + iv)
	}
	st64(s460 + 8, 0)
	const j = ld64(b + 0x10)
	st64(s498, 0)
	st64(s480, j)
	if (j != 0) {
		__multi3_159030(s60, ld64(s480), 0, g, 0)
		d = undef
		e = undef
		const k = ld64(s60)
		const m = k + l
		st64(s498, (k > m) + ld64(s60 + 8))
		l = m
	}
	const n = ld64(b + 0x18)
	st64(s4b0, n)
	if (n != 0) {
		__multi3_159030(s70, ld64(s4b0), 0, g, 0)
		d = undef
		e = undef
		const iw = ld64(s70)
		const ix = ld64(s498)
		st64(s460 + 8, (iw > iw + ix) + ld64(s70 + 8))
		st64(s498, iw + ix)
	}
	st64(s448, 0)
	const o = ld64(b + 0x20)
	let p = 0
	st64(s478, o)
	if (o != 0) {
		__multi3_159030(s80, ld64(s478), 0, g, 0)
		d = undef
		e = undef
		const q = ld64(s80)
		const r = ld64(s460 + 8)
		p = (q > q + r) + ld64(s80 + 8)
		st64(s460 + 8, q + r)
	}
	st64(s460, p)
	const s = ld64(b + 0x28)
	st64(s4a8, s)
	if (s != 0) {
		__multi3_159030(s90, ld64(s4a8), 0, g, 0)
		d = undef
		e = undef
		const iy = ld64(s90)
		const iz = ld64(s460)
		st64(s448, (iy > iy + iz) + ld64(s90 + 8))
		st64(s460, iy + iz)
	}
	st64(s440 + 8, 0)
	const t = ld64(b + 0x30)
	let ai = 0
	st64(s490, t)
	if (t != 0) {
		__multi3_159030(sa0, ld64(s490), 0, g, 0)
		d = undef
		e = undef
		const u = ld64(sa0)
		const v = ld64(s448)
		ai = (u > u + v) + ld64(sa0 + 8)
		st64(s448, u + v)
	}
	const w = ld64(b + 0x38)
	st64(s4a0, w)
	let z = ld64(s4d8)
	if (w != 0) {
		__multi3_159030(sb0, ld64(s4a0), 0, g, 0)
		d = undef
		e = undef
		const ja = ld64(sb0)
		const jb = ja + ai
		st64(s440 + 8, (ja > jb) + ld64(sb0 + 8))
		ai = jb
	}
	st64(s4e0, l)
	let ad = 0
	const x = ld64(ld64(s4c8) + 8)
	if (ld64(s4b8) != 0) {
		__multi3_159030(sc0, ld64(s4b8), 0, x, 0)
		e = undef
		const y = ld64(sc0)
		const aa = y + z
		const ab = (y > aa) + ld64(sc0 + 8)
		d = ld64(s4e0)
		const ac = ab + d
		ad = ab > ac
		z = aa
		st64(s4e0, ac)
	}
	if (ld64(s470) != 0 || (ad & 1) != 0) {
		__multi3_159030(sd0, ld64(s470), 0, x, 0)
		const ae = ld64(sd0)
		const af = ld64(s4e0)
		const ag = (ae > ae + af) + ld64(sd0 + 8)
		d = ag + ad
		e = ld64(s498)
		const ah = d + e
		ad = ag > d | d > ah
		st64(s4e0, ae + af)
		st64(s498, ah)
	}
	st64(s440, ai)
	st64(s4d8, z)
	let ap = 0
	let ak = 0
	if ((ld64(s480) | ad) != 0) {
		__multi3_159030(se0, ld64(s480), 0, x, 0)
		const jc = ld64(se0)
		const jd = ld64(s498)
		const je = (jc > jc + jd) + ld64(se0 + 8)
		d = je + ad
		e = ld64(s460 + 8)
		const jf = d + e
		ak = je > d | d > jf
		st64(s498, jc + jd)
		st64(s460 + 8, jf)
	}
	const aj = ld64(s4b0)
	if ((aj | ak) != 0) {
		__multi3_159030(sf0, aj, 0, x, 0)
		const al = ld64(sf0)
		const am = ld64(s460 + 8)
		const an = (al > al + am) + ld64(sf0 + 8)
		d = an + ak
		e = ld64(s460)
		const ao = d + e
		ap = an > d | d > ao
		st64(s460, ao, al + am)
	}
	let ay = 0
	let ar = 0
	if ((ld64(s478) | ap) != 0) {
		__multi3_159030(s100, ld64(s478), 0, x, 0)
		const jg = ld64(s100)
		const jh = ld64(s460)
		const ji = (jg > jg + jh) + ld64(s100 + 8)
		d = ji + ap
		e = ld64(s448)
		const jj = d + e
		ar = ji > d | d > jj
		st64(s460, jg + jh)
		st64(s448, jj)
	}
	const aq = ld64(s4a8)
	if ((aq | ar) != 0) {
		__multi3_159030(s110, aq, 0, x, 0)
		const at = ld64(s110)
		const au = ld64(s448)
		const av = (at > at + au) + ld64(s110 + 8)
		d = av + ar
		e = ld64(s440)
		const aw = d + e
		ay = av > d | d > aw
		st64(s448, at + au, aw)
	}
	const ax = ld64(s490)
	st64(s460 + 0x10, 0)
	let ba = 0
	const be = ld64(s4b8)
	if ((ax | ay) != 0) {
		__multi3_159030(s120, ax, 0, x, 0)
		const jk = ld64(s120)
		const jl = ld64(s440)
		const jm = (jk > jk + jl) + ld64(s120 + 8)
		d = jm + ay
		e = ld64(s440 + 8)
		const jn = d + e
		ba = jm > d | d > jn
		st64(s440, jk + jl, jn)
	}
	const az = ld64(s4a0)
	if ((az | ba) != 0) {
		__multi3_159030(s130, az, 0, x, 0)
		d = undef
		e = undef
		const bb = ld64(s130)
		const bc = ld64(s440 + 8)
		const bd = ba + ld64(s130 + 8) + (bb > bb + bc)
		st64(s440 + 8, bb + bc)
		st64(s460 + 0x10, bd)
	}
	let bk = 0
	const bf = ld64(ld64(s4c8) + 0x10)
	let bo = ld64(s460 + 8)
	if (be != 0) {
		__multi3_159030(s140, be, 0, bf, 0)
		e = undef
		const bg = ld64(s140)
		const bh = ld64(s4e0)
		const bi = (bg > bg + bh) + ld64(s140 + 8)
		d = ld64(s498)
		const bj = bi + d
		bk = bi > bj
		st64(s4e0, bg + bh)
		st64(s498, bj)
	}
	if (ld64(s470) != 0 || (bk & 1) != 0) {
		__multi3_159030(s150, ld64(s470), 0, bf, 0)
		e = undef
		const bl = ld64(s150)
		const bm = ld64(s498)
		const bn = (bl > bl + bm) + ld64(s150 + 8)
		d = bn + bk
		const bp = d + bo
		bk = bn > d | d > bp
		st64(s498, bl + bm)
		bo = bp
	}
	st64(s460 + 8, bo)
	let bw = 0
	let br = 0
	if ((ld64(s480) | bk) != 0) {
		__multi3_159030(s160, ld64(s480), 0, bf, 0)
		const jo = ld64(s160)
		const jp = ld64(s460 + 8)
		const jq = (jo > jo + jp) + ld64(s160 + 8)
		d = jq + bk
		e = ld64(s460)
		const jr = d + e
		br = jq > d | d > jr
		st64(s460, jr, jo + jp)
	}
	const bq = ld64(s4b0)
	if ((bq | br) != 0) {
		__multi3_159030(s170, bq, 0, bf, 0)
		const bs = ld64(s170)
		const bt = ld64(s460)
		const bu = (bs > bs + bt) + ld64(s170 + 8)
		d = bu + br
		e = ld64(s448)
		const bv = d + e
		bw = bu > d | d > bv
		st64(s460, bs + bt)
		st64(s448, bv)
	}
	let ce = 0
	let by = 0
	if ((ld64(s478) | bw) != 0) {
		__multi3_159030(s180, ld64(s478), 0, bf, 0)
		const js = ld64(s180)
		const jt = ld64(s448)
		const ju = (js > js + jt) + ld64(s180 + 8)
		d = ju + bw
		e = ld64(s440)
		const jv = d + e
		by = ju > d | d > jv
		st64(s448, js + jt, jv)
	}
	const bx = ld64(s4a8)
	if ((bx | by) != 0) {
		__multi3_159030(s190, bx, 0, bf, 0)
		const bz = ld64(s190)
		const ca = ld64(s440)
		const cb = (bz > bz + ca) + ld64(s190 + 8)
		d = cb + by
		e = ld64(s440 + 8)
		const cc = d + e
		ce = cb > d | d > cc
		st64(s440, bz + ca, cc)
	}
	const cd = ld64(s490)
	st64(s468, 0)
	let cg = 0
	const ck = ld64(s4b8)
	if ((cd | ce) != 0) {
		__multi3_159030(s1a0, cd, 0, bf, 0)
		const jw = ld64(s1a0)
		const jx = ld64(s440 + 8)
		const jy = (jw > jw + jx) + ld64(s1a0 + 8)
		d = jy + ce
		e = ld64(s460 + 0x10)
		const jz = d + e
		cg = jy > d | d > jz
		st64(s440 + 8, jw + jx)
		st64(s460 + 0x10, jz)
	}
	const cf = ld64(s4a0)
	if ((cf | cg) != 0) {
		__multi3_159030(s1b0, cf, 0, bf, 0)
		d = undef
		e = undef
		const ch = ld64(s1b0)
		const ci = ld64(s460 + 0x10)
		const cj = cg + ld64(s1b0 + 8) + (ch > ch + ci)
		st64(s460 + 0x10, ch + ci)
		st64(s468, cj)
	}
	let cr = 0
	const cl = ld64(ld64(s4c8) + 0x18)
	let cp = ld64(s460 + 8)
	if (ck != 0) {
		__multi3_159030(s1c0, ck, 0, cl, 0)
		d = undef
		e = undef
		const cm = ld64(s1c0)
		const cn = ld64(s498)
		const co = (cm > cm + cn) + ld64(s1c0 + 8)
		const cq = co + cp
		cr = co > cq
		st64(s498, cm + cn)
		cp = cq
	}
	if (ld64(s470) != 0 || (cr & 1) != 0) {
		__multi3_159030(s1d0, ld64(s470), 0, cl, 0)
		const cs = ld64(s1d0)
		const ct = cs + cp
		const cu = (cs > ct) + ld64(s1d0 + 8)
		d = cu + cr
		e = ld64(s460)
		const cv = d + e
		cr = cu > d | d > cv
		cp = ct
		st64(s460, cv)
	}
	st64(s460 + 8, cp)
	let dc = 0
	let cx = 0
	if ((ld64(s480) | cr) != 0) {
		__multi3_159030(s1e0, ld64(s480), 0, cl, 0)
		const ka = ld64(s1e0)
		const kb = ld64(s460)
		const kc = (ka > ka + kb) + ld64(s1e0 + 8)
		d = kc + cr
		e = ld64(s448)
		const kd = d + e
		cx = kc > d | d > kd
		st64(s460, ka + kb)
		st64(s448, kd)
	}
	const cw = ld64(s4b0)
	if ((cw | cx) != 0) {
		__multi3_159030(s1f0, cw, 0, cl, 0)
		const cy = ld64(s1f0)
		const cz = ld64(s448)
		const da = (cy > cy + cz) + ld64(s1f0 + 8)
		d = da + cx
		e = ld64(s440)
		const db = d + e
		dc = da > d | d > db
		st64(s448, cy + cz, db)
	}
	let dk = 0
	let de = 0
	if ((ld64(s478) | dc) != 0) {
		__multi3_159030(s200, ld64(s478), 0, cl, 0)
		const ke = ld64(s200)
		const kf = ld64(s440)
		const kg = (ke > ke + kf) + ld64(s200 + 8)
		d = kg + dc
		e = ld64(s440 + 8)
		const kh = d + e
		de = kg > d | d > kh
		st64(s440, ke + kf, kh)
	}
	const dd = ld64(s4a8)
	if ((dd | de) != 0) {
		__multi3_159030(s210, dd, 0, cl, 0)
		const df = ld64(s210)
		const dg = ld64(s440 + 8)
		const dh = (df > df + dg) + ld64(s210 + 8)
		d = dh + de
		e = ld64(s460 + 0x10)
		const di = d + e
		dk = dh > d | d > di
		st64(s440 + 8, df + dg)
		st64(s460 + 0x10, di)
	}
	const dj = ld64(s490)
	st64(s488, 0)
	let dm = 0
	const dr = ld64(s4b8)
	if ((dj | dk) != 0) {
		__multi3_159030(s220, dj, 0, cl, 0)
		const ki = ld64(s220)
		const kj = ld64(s460 + 0x10)
		const kk = (ki > ki + kj) + ld64(s220 + 8)
		d = kk + dk
		e = ld64(s468)
		const kl = d + e
		dm = kk > d | d > kl
		st64(s460 + 0x10, ki + kj)
		st64(s468, kl)
	}
	const dl = ld64(s4a0)
	if ((dl | dm) != 0) {
		__multi3_159030(s230, dl, 0, cl, 0)
		d = undef
		e = undef
		const dn = ld64(s230)
		const dp = ld64(s468)
		const dq = dm + ld64(s230 + 8) + (dn > dn + dp)
		st64(s468, dn + dp)
		st64(s488, dq)
	}
	let dy = 0
	const ds = ld64(ld64(s4c8) + 0x20)
	let du = ld64(s460 + 8)
	if (dr != 0) {
		__multi3_159030(s240, dr, 0, ds, 0)
		e = undef
		const dt = ld64(s240)
		const dv = dt + du
		const dw = (dt > dv) + ld64(s240 + 8)
		d = ld64(s460)
		const dx = dw + d
		dy = dw > dx
		du = dv
		st64(s460, dx)
	}
	if (ld64(s470) != 0 || (dy & 1) != 0) {
		__multi3_159030(s250, ld64(s470), 0, ds, 0)
		const dz = ld64(s250)
		const ea = ld64(s460)
		const eb = (dz > dz + ea) + ld64(s250 + 8)
		d = eb + dy
		e = ld64(s448)
		const ec = d + e
		dy = eb > d | d > ec
		st64(s460, dz + ea)
		st64(s448, ec)
	}
	st64(s460 + 8, du)
	let ej = 0
	let ee = 0
	if ((ld64(s480) | dy) != 0) {
		__multi3_159030(s260, ld64(s480), 0, ds, 0)
		const km = ld64(s260)
		const kn = ld64(s448)
		const ko = (km > km + kn) + ld64(s260 + 8)
		d = ko + dy
		e = ld64(s440)
		const kp = d + e
		ee = ko > d | d > kp
		st64(s448, km + kn, kp)
	}
	const ed = ld64(s4b0)
	if ((ed | ee) != 0) {
		__multi3_159030(s270, ed, 0, ds, 0)
		const ef = ld64(s270)
		const eg = ld64(s440)
		const eh = (ef > ef + eg) + ld64(s270 + 8)
		d = eh + ee
		e = ld64(s440 + 8)
		const ei = d + e
		ej = eh > d | d > ei
		st64(s440, ef + eg, ei)
	}
	let er = 0
	let el = 0
	if ((ld64(s478) | ej) != 0) {
		__multi3_159030(s280, ld64(s478), 0, ds, 0)
		const kq = ld64(s280)
		const kr = ld64(s440 + 8)
		const ks = (kq > kq + kr) + ld64(s280 + 8)
		d = ks + ej
		e = ld64(s460 + 0x10)
		const kt = d + e
		el = ks > d | d > kt
		st64(s440 + 8, kq + kr)
		st64(s460 + 0x10, kt)
	}
	const ek = ld64(s4a8)
	if ((ek | el) != 0) {
		__multi3_159030(s290, ek, 0, ds, 0)
		const em = ld64(s290)
		const en = ld64(s460 + 0x10)
		const eo = (em > em + en) + ld64(s290 + 8)
		d = eo + el
		e = ld64(s468)
		const ep = d + e
		er = eo > d | d > ep
		st64(s460 + 0x10, em + en)
		st64(s468, ep)
	}
	const eq = ld64(s490)
	st64(s4c0, 0)
	let et = 0
	const ex = ld64(s4b8)
	if ((eq | er) != 0) {
		__multi3_159030(s2a0, eq, 0, ds, 0)
		const ku = ld64(s2a0)
		const kv = ld64(s468)
		const kw = (ku > ku + kv) + ld64(s2a0 + 8)
		d = kw + er
		e = ld64(s488)
		const kx = d + e
		et = kw > d | d > kx
		st64(s468, ku + kv)
		st64(s488, kx)
	}
	const es = ld64(s4a0)
	if ((es | et) != 0) {
		__multi3_159030(s2b0, es, 0, ds, 0)
		d = undef
		e = undef
		const eu = ld64(s2b0)
		const ev = ld64(s488)
		const ew = et + ld64(s2b0 + 8) + (eu > eu + ev)
		st64(s488, eu + ev)
		st64(s4c0, ew)
	}
	let fd = 0
	const ey = ld64(ld64(s4c8) + 0x28)
	if (ex != 0) {
		__multi3_159030(s2c0, ex, 0, ey, 0)
		e = undef
		const ez = ld64(s2c0)
		const fa = ld64(s460)
		const fb = (ez > ez + fa) + ld64(s2c0 + 8)
		d = ld64(s448)
		const fc = fb + d
		fd = fb > fc
		st64(s460, ez + fa)
		st64(s448, fc)
	}
	if (ld64(s470) != 0 || (fd & 1) != 0) {
		__multi3_159030(s2d0, ld64(s470), 0, ey, 0)
		const fe = ld64(s2d0)
		const ff = ld64(s448)
		const fg = (fe > fe + ff) + ld64(s2d0 + 8)
		d = fg + fd
		e = ld64(s440)
		const fh = d + e
		fd = fg > d | d > fh
		st64(s448, fe + ff, fh)
	}
	let fo = 0
	let fj = 0
	if ((ld64(s480) | fd) != 0) {
		__multi3_159030(s2e0, ld64(s480), 0, ey, 0)
		const ky = ld64(s2e0)
		const kz = ld64(s440)
		const la = (ky > ky + kz) + ld64(s2e0 + 8)
		d = la + fd
		e = ld64(s440 + 8)
		const lb = d + e
		fj = la > d | d > lb
		st64(s440, ky + kz, lb)
	}
	const fi = ld64(s4b0)
	if ((fi | fj) != 0) {
		__multi3_159030(s2f0, fi, 0, ey, 0)
		const fk = ld64(s2f0)
		const fl = ld64(s440 + 8)
		const fm = (fk > fk + fl) + ld64(s2f0 + 8)
		d = fm + fj
		e = ld64(s460 + 0x10)
		const fn = d + e
		fo = fm > d | d > fn
		st64(s440 + 8, fk + fl)
		st64(s460 + 0x10, fn)
	}
	let fw = 0
	let fr = 0
	if ((ld64(s478) | fo) != 0) {
		__multi3_159030(s300, ld64(s478), 0, ey, 0)
		const lc = ld64(s300)
		const le = ld64(s460 + 0x10)
		const lf = (lc > lc + le) + ld64(s300 + 8)
		d = lf + fo
		e = ld64(s468)
		const lg = d + e
		fr = lf > d | d > lg
		st64(s460 + 0x10, lc + le)
		st64(s468, lg)
	}
	const fq = ld64(s4a8)
	if ((fq | fr) != 0) {
		__multi3_159030(s310, fq, 0, ey, 0)
		const fs = ld64(s310)
		const ft = ld64(s468)
		const fu = (fs > fs + ft) + ld64(s310 + 8)
		d = fu + fr
		e = ld64(s488)
		const fv = d + e
		fw = fu > d | d > fv
		st64(s468, fs + ft)
		st64(s488, fv)
	}
	let gb = 0
	let fx = 0
	if ((ld64(s490) | fw) != 0) {
		__multi3_159030(s320, ld64(s490), 0, ey, 0)
		const lh = ld64(s320)
		const li = ld64(s488)
		const lj = (lh > lh + li) + ld64(s320 + 8)
		d = lj + fw
		e = ld64(s4c0)
		const lk = d + e
		fx = lj > d | d > lk
		st64(s488, lh + li)
		st64(s4c0, lk)
	}
	const gc = ld64(s4b8)
	if ((ld64(s4a0) | fx) != 0) {
		__multi3_159030(s330, ld64(s4a0), 0, ey, 0)
		d = undef
		e = undef
		const fy = ld64(s330)
		const fz = ld64(s4c0)
		const ga = fx + ld64(s330 + 8) + (fy > fy + fz)
		st64(s4c0, fy + fz)
		gb = ga
	}
	st64(s4d0, gb)
	let gi = 0
	const gd = ld64(ld64(s4c8) + 0x30)
	const gn = ld64(s480)
	if (gc != 0) {
		__multi3_159030(s340, gc, 0, gd, 0)
		e = undef
		const ge = ld64(s340)
		const gf = ld64(s448)
		const gg = (ge > ge + gf) + ld64(s340 + 8)
		d = ld64(s440)
		const gh = gg + d
		gi = gg > gh
		st64(s448, ge + gf, gh)
	}
	if (ld64(s470) != 0 || (gi & 1) != 0) {
		__multi3_159030(s350, ld64(s470), 0, gd, 0)
		const gj = ld64(s350)
		const gk = ld64(s440)
		const gl = (gj > gj + gk) + ld64(s350 + 8)
		d = gl + gi
		e = ld64(s440 + 8)
		const gm = d + e
		gi = gl > d | d > gm
		st64(s440, gj + gk, gm)
	}
	let gt = 0
	let go = 0
	if ((gn | gi) != 0) {
		__multi3_159030(s360, ld64(s480), 0, gd, 0)
		const ll = ld64(s360)
		const lm = ld64(s440 + 8)
		const ln = (ll > ll + lm) + ld64(s360 + 8)
		d = ln + gi
		e = ld64(s460 + 0x10)
		const lo = d + e
		go = ln > d | d > lo
		st64(s440 + 8, ll + lm)
		st64(s460 + 0x10, lo)
	}
	if ((ld64(s4b0) | go) != 0) {
		__multi3_159030(s370, ld64(s4b0), 0, gd, 0)
		const gp = ld64(s370)
		const gq = ld64(s460 + 0x10)
		const gr = (gp > gp + gq) + ld64(s370 + 8)
		d = gr + go
		e = ld64(s468)
		const gs = d + e
		gt = gr > d | d > gs
		st64(s460 + 0x10, gp + gq)
		st64(s468, gs)
	}
	let ha = 0
	let gu = 0
	if ((ld64(s478) | gt) != 0) {
		__multi3_159030(s380, ld64(s478), 0, gd, 0)
		const lp = ld64(s380)
		const lq = ld64(s468)
		const lr = (lp > lp + lq) + ld64(s380 + 8)
		d = lr + gt
		e = ld64(s488)
		const ls = d + e
		gu = lr > d | d > ls
		st64(s468, lp + lq)
		st64(s488, ls)
	}
	const gz = ld64(s490)
	if ((ld64(s4a8) | gu) != 0) {
		__multi3_159030(s390, ld64(s4a8), 0, gd, 0)
		const gv = ld64(s390)
		const gw = ld64(s488)
		const gx = (gv > gv + gw) + ld64(s390 + 8)
		d = gx + gu
		e = ld64(s4c0)
		const gy = d + e
		ha = gx > d | d > gy
		st64(s488, gv + gw)
		st64(s4c0, gy)
	}
	st64(s4e8, 0)
	let hc = 0
	let he = ld64(s4d0)
	if ((gz | ha) != 0) {
		__multi3_159030(s3a0, ld64(s490), 0, gd, 0)
		e = undef
		const lt = ld64(s3a0)
		const lu = ld64(s4c0)
		const lv = (lt > lt + lu) + ld64(s3a0 + 8)
		d = lv + ha
		const lw = d + he
		hc = lv > d | d > lw
		st64(s4c0, lt + lu)
		he = lw
	}
	const hb = ld64(s4a0)
	const hr = ld64(s480)
	if ((hb | hc) != 0) {
		__multi3_159030(s3b0, hb, 0, gd, 0)
		d = undef
		e = undef
		const hd = ld64(s3b0)
		const hf = hd + he
		he = hf
		st64(s4e8, hc + ld64(s3b0 + 8) + (hd > hf))
	}
	let hm = 0
	const hh = ld64(ld64(s4c8) + 0x38)
	const hg = ld64(s4b8)
	if (hg != 0) {
		__multi3_159030(s3c0, hg, 0, hh, 0)
		e = undef
		const hi = ld64(s3c0)
		const hj = ld64(s440)
		const hk = (hi > hi + hj) + ld64(s3c0 + 8)
		d = ld64(s440 + 8)
		const hl = hk + d
		hm = hk > hl
		st64(s440, hi + hj, hl)
	}
	if (ld64(s470) != 0 || (hm & 1) != 0) {
		__multi3_159030(s3d0, ld64(s470), 0, hh, 0)
		const hn = ld64(s3d0)
		const ho = ld64(s440 + 8)
		const hp = (hn > hn + ho) + ld64(s3d0 + 8)
		d = hp + hm
		e = ld64(s460 + 0x10)
		const hq = d + e
		hm = hp > d | d > hq
		st64(s440 + 8, hn + ho)
		st64(s460 + 0x10, hq)
	}
	st64(s4d0, he)
	let hz = 0
	let ht = 0
	if ((hr | hm) != 0) {
		__multi3_159030(s3e0, hr, 0, hh, 0)
		const lx = ld64(s3e0)
		const ly = ld64(s460 + 0x10)
		const lz = (lx > lx + ly) + ld64(s3e0 + 8)
		d = lz + hm
		e = ld64(s468)
		const ma = d + e
		ht = lz > d | d > ma
		st64(s460 + 0x10, lx + ly)
		st64(s468, ma)
	}
	const hs = ld64(s4b0)
	if ((hs | ht) != 0) {
		__multi3_159030(s3f0, hs, 0, hh, 0)
		const hu = ld64(s3f0)
		const hv = ld64(s468)
		const hw = (hu > hu + hv) + ld64(s3f0 + 8)
		d = hw + ht
		e = ld64(s488)
		const hx = d + e
		hz = hw > d | d > hx
		st64(s468, hu + hv)
		st64(s488, hx)
	}
	const hy = ld64(s478)
	let ii = 0
	let ib = 0
	if ((hy | hz) != 0) {
		__multi3_159030(s400, hy, 0, hh, 0)
		const mb = ld64(s400)
		const mc = ld64(s488)
		const md = (mb > mb + mc) + ld64(s400 + 8)
		d = md + hz
		e = ld64(s4c0)
		const me = d + e
		ib = md > d | d > me
		st64(s488, mb + mc)
		st64(s4c0, me)
	}
	const ia = ld64(s4a8)
	if ((ia | ib) != 0) {
		__multi3_159030(s410, ia, 0, hh, 0)
		const ic = ld64(s410)
		const id = ld64(s4c0)
		const ie = (ic > ic + id) + ld64(s410 + 8)
		d = ie + ib
		e = ld64(s4d0)
		const ig = d + e
		ii = ie > d | d > ig
		st64(s4c0, ic + id)
		st64(s4d0, ig)
	}
	const ih = ld64(s490)
	let io = 0
	let ik = 0
	if ((ih | ii) != 0) {
		__multi3_159030(s420, ih, 0, hh, 0)
		const mf = ld64(s420)
		const mg = ld64(s4d0)
		const mh = (mf > mf + mg) + ld64(s420 + 8)
		d = mh + ii
		e = ld64(s4e8)
		const mi = d + e
		ik = mh > d | d > mi
		st64(s4d0, mf + mg)
		st64(s4e8, mi)
	}
	const ij = ld64(s4a0)
	const iq = ld64(s4d8)
	if ((ij | ik) != 0) {
		__multi3_159030(s430, ij, 0, hh, 0)
		d = undef
		e = undef
		const il = ld64(s430)
		const im = ld64(s4e8)
		io = (il > il + im) + ld64(s430 + 8) != -ik
		st64(s4e8, il + im)
	}
	let it = 1
	if (ld64(s440 + 8) == 0 && (ld64(s460 + 0x10) == 0 && (ld64(s468) == 0 && (ld64(s488) == 0 && (ld64(s4c0) == 0 && ld64(s4d0) == 0))))) {
		it = ld64(s4e8) != 0 ? 1 : io
	}
	const ip = ld64(s4f0)
	st64(ip + 0x38, ld64(s440))
	st64(ip + 0x30, ld64(s448))
	st64(ip + 0x28, ld64(s460))
	st64(ip + 0x20, ld64(s460 + 8))
	st64(ip + 0x18, ld64(s498))
	st64(ip + 0x10, ld64(s4e0))
	st64(ip + 8, iq)
	const ir = ld64(s4f8)
	st64(ip, ir)
	if ((it & 1) != 0) {
		st64(s30, 0x100160990, 1, 8, 0, 0)
		// fmt "arithmetic operation overflow"
		fn_14ec00(s30, 0x1001604b8, ir, d, e)
	}
}

export function fn_10b930(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s21 = fp - 0x21, s30 = fp - 0x30, s48 = fp - 0x48, s68 = fp - 0x68, s88 = fp - 0x88, s98 = fp - 0x98
	let l, n, o, p, u: u64
	const f = ld64(b + 8)
	if (8 > f) {
		fn_153150(8, f, 0x1001609b8, d, e)
	}
	B14: {
		B13: {
			const g = ld64(b)
			st64(s88 + 8, f - 8)
			if (f != 8) {
				if (f - 8 >= 3 && f - 0xb >= 0x20) {
					const j = ld8(g + 8)
					const v = ld16(g + 9)
					const h = ld64(g + 0x11)
					st8(s30 + 8, ld8(g + 0x19))
					st32(s68 + 0x18, ld32(g + 0xb))
					st16(s68 + 0x1c, ld16(g + 0xf))
					st64(s30, h)
					const i = ld64(s30 + 1)
					copy(s68, g + 0x1a, 0x10)
					st8(s68 + 0x10, ld8(g + 0x2a))
					if (f - 0x2b >= 4 && (f - 0x2f >= 4 && (f - 0x33 >= 2 && (f - 0x35 >= 4 && f - 0x39 >= 4)))) {
						const ac = ld32(g + 0x2b)
						const ab = ld32(g + 0x2f)
						const z = ld16(g + 0x33)
						const aa = ld32(g + 0x35)
						const y = ld32(g + 0x39)
						st64(s88, g + 0x3d, f - 0x3d)
						const w = fn_16598(s30, s88)
						if (ld8(s30) != 0) {
							l = ld64(s30 + 8)
							break B13
						}
						st32(s20 + 0x1b, ld32(s30 + 4))
						st32(s20 + 0x18, ld32(s30 + 1))
						copy(s48, s20, 0x10)
						st8(s48 + 0x10, ld8(s20 + 0x10))
						const x = ld64(s30 + 8)
						u = fn_16bb8(s30, s88, w)
						l = ld64(s30 + 8)
						if (ld64(s30) != 0) {
							break B13
						}
						st64(a + 0x58, ld64(s20 + 8))
						st64(a + 0x50, ld64(s20))
						st32(s88 + 0x10, ld32(s68 + 0x18))
						st16(s88 + 0x14, ld16(s68 + 0x1c))
						st8(s20 + 0xf, ld8(s68 + 0x10))
						copyr(s21, s68, 0x10)
						st32(s20 + 0x10, ld32(s20 + 0x18))
						st32(s20 + 0x13, ld32(s20 + 0x1b))
						st8(a + 0x47, ld8(s48 + 0x10))
						st64(a + 0x3f, ld64(s48 + 8))
						st64(a + 0x37, ld64(s48))
						st8(s88 + 0x16, h)
						st64(s88 + 0x17, i)
						st64(s30 + 7, i)
						st64(s30, ld64(s88 + 0x10))
						st64(a + 0x27, ld64(s20 + 0xf))
						st64(a + 0x20, ld64(s20 + 8))
						st64(a + 0x18, ld64(s20))
						st64(a + 0x10, ld64(s30 + 8))
						st64(a + 8, ld64(s30))
						st8(a + 0x74, j)
						st16(a + 0x72, z)
						st16(a + 0x70, v)
						st32(a + 0x6c, y)
						st32(a + 0x68, aa)
						st32(a + 0x64, ab)
						st32(a + 0x60, ac)
						st64(a + 0x48, l)
						st64(a + 0x2f, x)
						st64(a, 0)
						return u
					}
				}
				const k = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
				l = k
				st64(s88, g + f, 0, k)
				break B14
			}
			const m = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
			l = m
			st64(s88, g + 8)
		}
		st64(s88 + 0x10, l)
	}
	u = anchor_error_from(s98, 0xbbb /* anchor::AccountDidNotDeserialize */, n, o, p)
	const s = ld64(s98 + 8)
	const t = ld64(s98)
	const q = l
	if (2 > (l & 3) - 2) {
		st64(a + 0x10, s)
		st64(a + 8, t)
		st64(a, 1)
		return u
	}
	if ((q & 3) == 0) {
		st64(a + 0x10, s)
		st64(a + 8, t)
		st64(a, 1)
		return u
	}
	const r = ld64(ld64(l + 7))
	if (r == 0) {
		st64(a + 0x10, s)
		st64(a + 8, t)
		st64(a, 1)
		return u
	}
	u = callx(r, ld64(l - 1), r)
	st64(a + 0x10, s)
	st64(a + 8, t)
	st64(a, 1)
	return u
}

export function fn_10bf30(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let g, j: u64
	if (8 > ld64(b + 8)) {
		j = anchor_error_from(s138, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		g = ld64(s138)
		st64(a + 0x10, ld64(s138 + 8))
		st64(a + 8, g)
		st64(a, 1)
		return j
	}
	if (ld64(ld64(b)) == 0xdcf63b0e5258e2f4 /* account:DynamicFeeConfig */) {
		return fn_10c390(a, b, 0xdcf63b0e5258e2f4 /* account:DynamicFeeConfig */, d, e)
	}
	ErrorCode_name(s78, 0x1001598e8, 0xdcf63b0e5258e2f4 /* account:DynamicFeeConfig */, d, e)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (ErrorCode_fmt(0x1001598e8, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015b3d2)
	st32(sf8 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 6)
	st64(s118 + 0x10, 0x2d)
	st64(s118, 0)
	j = fn_13e5a0(s128, s118)
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	g = ld64(s128)
	const h = f != 0 ? sat_sub(f, 0x10) : 0x300007ff0
	const i = ld64(s128 + 8)
	if ((g & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x10, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 8, 0x6769666e6f436565)
		st64(h, 0x4663696d616e7944)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x10, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 8, 0x6769666e6f436565)
		st64(h, 0x4663696d616e7944)
		void ld64(i)
	}
	st64(i + 0x10, h, 0x10)
	st64(i + 8, 0x10)
	st64(i, 1)
	st64(a + 0x10, i)
	st64(a + 8, g)
	st64(a, 1)
	return j
}

export function fn_10c390(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68
	let l, n, o, p, u: u64
	const f = ld64(b + 8)
	if (8 > f) {
		fn_153150(8, f, 0x1001609e8, d, e)
	}
	B10: {
		if (f - 8 >= 2) {
			const g = f - 8 & -2
			if (g != 2 && (g != 4 && g != 6)) {
				const h = f - 8 & -4
				if (h != 8 && h != 0xc) {
					const i = ld64(b)
					const y = ld16(i + 8)
					const x = ld16(i + 0xa)
					const v = ld16(i + 0xc)
					const j = ld16(i + 0xe)
					const w = ld32(i + 0x10)
					const k = ld32(i + 0x14)
					st64(s58, i + 0x18, f - 0x18)
					fn_16cf0(s48, s58)
					l = ld64(s48 + 8)
					if (ld64(s48) != 0) {
						break B10
					}
					u = memcpy(a + 0x10, s38, 0x38)
					st16(a + 0x56, j)
					st16(a + 0x54, v)
					st16(a + 0x52, x)
					st16(a + 0x50, y)
					st32(a + 0x4c, k)
					st32(a + 0x48, w)
					st64(a + 8, l)
					st64(a, 0)
					return u
				}
			}
		}
		const m = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		l = m
	}
	u = anchor_error_from(s68, 0xbbb /* anchor::AccountDidNotDeserialize */, n, o, p)
	const s = ld64(s68 + 8)
	const t = ld64(s68)
	const q = l
	if (2 > (l & 3) - 2) {
		st64(a + 0x10, s)
		st64(a + 8, t)
		st64(a, 1)
		return u
	}
	if ((q & 3) == 0) {
		st64(a + 0x10, s)
		st64(a + 8, t)
		st64(a, 1)
		return u
	}
	const r = ld64(ld64(l + 7))
	if (r == 0) {
		st64(a + 0x10, s)
		st64(a + 8, t)
		st64(a, 1)
		return u
	}
	u = callx(r, ld64(l - 1), r)
	st64(a + 0x10, s)
	st64(a + 8, t)
	st64(a, 1)
	return u
}

export function fn_10c648(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let g, j: u64
	if (8 > ld64(b + 8)) {
		j = anchor_error_from(s138, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		g = ld64(s138)
		st64(a + 8, ld64(s138 + 8))
		st64(a, g)
		st8(a + 0xa4, 2)
		return j
	}
	if (ld64(ld64(b)) == 0xe42c3ecf8e05ee01 /* account:LimitOrderState */) {
		return fn_10caa8(a, b, 0xe42c3ecf8e05ee01 /* account:LimitOrderState */, d, e)
	}
	ErrorCode_name(s78, 0x1001598e8, 0xe42c3ecf8e05ee01 /* account:LimitOrderState */, d, e)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (ErrorCode_fmt(0x1001598e8, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a641)
	st32(sf8 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 8)
	st64(s118 + 0x10, 0x26)
	st64(s118, 0)
	j = fn_13e5a0(s128, s118)
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	g = ld64(s128)
	const h = f != 0 ? sat_sub(f, 0xf) : 0x300007ff1
	const i = ld64(s128 + 8)
	if ((g & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 7, 0x6574617453726564)
		st64(h, 0x64724f74696d694c)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 7, 0x6574617453726564)
		st64(h, 0x64724f74696d694c)
		void ld64(i)
	}
	st64(i + 0x10, h, 0xf)
	st64(i + 8, 0xf)
	st64(i, 1)
	st64(a + 8, i)
	st64(a, g)
	st8(a + 0xa4, 2)
	return j
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (points to it)
export function fn_10caa8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s31 = fp - 0x31, s40 = fp - 0x40, s58 = fp - 0x58, s59 = fp - 0x59, s78 = fp - 0x78, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8
	let g, o, x, y, z: u64
	const f = ld64(b + 8)
	if (8 > f) {
		fn_153150(8, f, 0x100160a00, d, e)
	}
	B21: {
		B20: {
			g = ld64(b)
			if (f - 8 >= 0x20) {
				const h = ld64(g + 0xe)
				st8(s40 + 8, ld8(g + 0x16))
				st32(s98 + 0x18, ld32(g + 8))
				st16(s98 + 0x1c, ld16(g + 0xc))
				st64(s40, h)
				const k = ld64(s40 + 1)
				copy(s98, g + 0x17, 0x10)
				st8(s98 + 0x10, ld8(g + 0x27))
				if ((f - 8 & -0x20) != 0x20) {
					const i = ld64(g + 0x2e)
					st8(s40 + 8, ld8(g + 0x36))
					st32(s78 + 0x18, ld32(g + 0x28))
					st16(s78 + 0x1c, ld16(g + 0x2c))
					st64(s40, i)
					const p = ld64(s40 + 1)
					copy(s78, g + 0x37, 0x10)
					st8(s78 + 0x10, ld8(g + 0x47))
					if ((f - 8 & -4) != 0x40) {
						const j = ld32(g + 0x48)
						st64(sa8 + 8, f - 0x4c)
						if (f == 0x4c) {
							const n = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
							o = n
							st64(sa8, g + 0x4c)
						} else {
							let ae = 0
							const l = ld8(g + 0x4c)
							st64(sa8, g + 0x4d, f - 0x4d)
							st8(s59, l)
							if (l != 0) {
								if (l != 1) {
									st64(s40, 0x10015f910)
									st64(s31 + 1, s10)
									st64(s10, s59, fn_154c88)
									st64(s31 + 0x11, 0)
									st64(s40 + 8, 1)
									st64(s31 + 9, 1)
									// fmt "Invalid bool representation: {}" {} = l [fn_154c88]
									fn_14de10(s58, s40, f - 0x4d, l, i)
									const m = fn_f128(s58)
									o = m
									st64(s58, o)
									break B21
								}
								ae = 1
							}
							if (8 > f - 0x4d) {
								break B20
							}
							if (8 > f - 0x55) {
								break B20
							}
							if (8 > f - 0x5d) {
								break B20
							}
							if (8 > f - 0x65) {
								break B20
							}
							if (8 > f - 0x6d) {
								break B20
							}
							if (8 > f - 0x75) {
								break B20
							}
							if (0x10 > f - 0x7d) {
								break B20
							}
							const am = ld64(g + 0x4d)
							const al = ld64(g + 0x55)
							const ak = ld64(g + 0x5d)
							const aj = ld64(g + 0x65)
							const ai = ld64(g + 0x6d)
							const ah = ld64(g + 0x75)
							const af = ld64(g + 0x85)
							const ag = ld64(g + 0x7d)
							st64(sa8, g + 0x8d, f - 0x8d)
							fn_166b8(s40, sa8)
							o = ld64(s40 + 8)
							if (ld64(s40) == 0) {
								st64(a + 0x98, ld64(s31 + 0x11))
								st64(a + 0x90, ld64(s31 + 9))
								st64(a + 0x88, ld64(s31 + 1))
								st32(s58, ld32(s98 + 0x18))
								st16(s58 + 4, ld16(s98 + 0x1c))
								st8(s31 + 0x10, ld8(s98 + 0x10))
								copyr(s31, s98, 0x10)
								st32(s31 + 0x11, ld32(s78 + 0x18))
								st16(s31 + 0x15, ld16(s78 + 0x1c))
								st8(a + 0x3f, ld8(s78 + 0x10))
								st64(a + 0x37, ld64(s78 + 8))
								st64(a + 0x2f, ld64(s78))
								st8(s58 + 6, h)
								st64(s58 + 7, k)
								st64(s40 + 7, k)
								st64(s40, ld64(s58))
								const v = ld64(s40)
								const u = ld64(s40 + 8)
								const t = ld64(s31 + 1)
								const s = ld64(s31 + 9)
								const r = ld64(s31 + 0xf)
								st64(a + 0x78, af)
								st64(a + 0x70, ag)
								st64(a + 0x1e, r)
								st64(a + 0x18, s)
								st64(a + 0x10, t)
								st64(a + 8, u)
								st64(a, v)
								st32(a + 0xa0, j)
								st64(a + 0x80, o)
								st64(a + 0x68, ah)
								st64(a + 0x60, ai)
								st64(a + 0x58, aj)
								st64(a + 0x50, ak)
								st64(a + 0x48, al)
								st64(a + 0x40, am)
								st64(a + 0x27, p)
								st8(a + 0x26, i)
								st8(a + 0xa4, ae)
								return ag
							}
						}
						st64(s58, o)
						break B21
					}
				}
			}
		}
		const w = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		o = w
		st64(sa8, g + f)
		st64(s58, w)
		st64(sa8 + 8, 0)
	}
	let q = anchor_error_from(sb8, 0xbbb /* anchor::AccountDidNotDeserialize */, x, y, z)
	const ac = ld64(sb8 + 8)
	const ad = ld64(sb8)
	const aa = o
	if (2 > (o & 3) - 2) {
		st64(a + 8, ac)
		st64(a, ad)
		st8(a + 0xa4, 2)
		return q
	}
	if ((aa & 3) == 0) {
		st64(a + 8, ac)
		st64(a, ad)
		st8(a + 0xa4, 2)
		return q
	}
	const ab = ld64(ld64(o + 7))
	if (ab == 0) {
		st64(a + 8, ac)
		st64(a, ad)
		st8(a + 0xa4, 2)
		return q
	}
	q = callx(ab, ld64(o - 1), ab)
	st64(a + 8, ac)
	st64(a, ad)
	st8(a + 0xa4, 2)
	return q
}

export function fn_10ebf8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s40 = fp - 0x40, s80 = fp - 0x80, s90 = fp - 0x90, sb0 = fp - 0xb0, sd0 = fp - 0xd0, sf8 = fp - 0xf8, s108 = fp - 0x108
	let p, q, r, s, x: u64
	const f = ld64(b + 8)
	if (8 > f) {
		fn_153150(8, f, 0x100160aa8, d, e)
	}
	B16: {
		if (f != 8 && f - 8 >= 0x21) {
			const g = ld64(b)
			const k = ld8(g + 8)
			const h = ld64(g + 0xf)
			st8(s90 + 8, ld8(g + 0x17))
			st32(sd0 + 0x18, ld32(g + 9))
			st16(sd0 + 0x1c, ld16(g + 0xd))
			st64(s90, h)
			const aa = ld64(s90 + 1)
			copy(sd0, g + 0x18, 0x10)
			st8(sd0 + 0x10, ld8(g + 0x28))
			if (f - 0x29 >= 0x20) {
				const i = ld64(g + 0x2f)
				st8(s90 + 8, ld8(g + 0x37))
				st32(sb0 + 0x18, ld32(g + 0x29))
				st16(sb0 + 0x1c, ld16(g + 0x2d))
				st64(s90, i)
				const j = ld64(s90 + 1)
				copy(sb0, g + 0x38, 0x10)
				st8(sb0 + 0x10, ld8(g + 0x48))
				if (f - 0x49 >= 4 && (f - 0x4d >= 4 && (f - 0x51 >= 0x10 && (f - 0x61 >= 0x10 && (f - 0x71 >= 0x10 && (f - 0x81 >= 8 && f - 0x89 >= 8)))))) {
					const an = ld32(g + 0x49)
					const am = ld32(g + 0x4d)
					const ai = ld64(g + 0x59)
					const aj = ld64(g + 0x51)
					const ag = ld64(g + 0x69)
					const ah = ld64(g + 0x61)
					const ae = ld64(g + 0x79)
					const af = ld64(g + 0x71)
					const al = ld64(g + 0x81)
					const ak = ld64(g + 0x89)
					st64(sf8, g + 0x91, f - 0x91)
					fn_16f60(s90, sf8)
					s = ld64(s90 + 8)
					if (ld64(s90) != 0) {
						break B16
					}
					memcpy(s40, s80, 0x40)
					const l = ld64(sf8 + 8)
					if (l >= 8) {
						const m = ld64(sf8)
						const ad = ld64(m)
						st64(sf8, m + 8, l - 8)
						fn_16828(s90, sf8)
						const n = ld64(s90 + 8)
						if (ld64(s90) != 0) {
							s = n
							break B16
						}
						memcpy(a + 0xe0, s80, 0x30)
						st32(sf8 + 0x10, ld32(sd0 + 0x18))
						st16(sf8 + 0x14, ld16(sd0 + 0x1c))
						copy(s90, sd0, 0x10)
						st8(s80, ld8(sd0 + 0x10))
						st32(sf8 + 0x18, ld32(sb0 + 0x18))
						st16(sf8 + 0x1c, ld16(sb0 + 0x1c))
						st8(a + 0x47, ld8(sb0 + 0x10))
						st64(a + 0x3f, ld64(sb0 + 8))
						st64(a + 0x37, ld64(sb0))
						x = memcpy(a + 0x90, s40, 0x40)
						const y = ld16(sf8 + 0x14)
						st16(sf8 + 0x24, y)
						const z = ld32(sf8 + 0x10)
						st32(sf8 + 0x20, z)
						st16(a + 0xc, y)
						st32(a + 8, z)
						st64(a + 0xf, aa)
						st8(a + 0xe, h)
						st64(a + 0x1f, ld64(s90 + 8))
						st64(a + 0x17, ld64(s90))
						st8(a + 0x27, ld8(s80))
						const ac = ld16(sf8 + 0x1c)
						const ab = ld32(sf8 + 0x18)
						st64(a + 0x70, ae)
						st64(a + 0x68, af)
						st64(a + 0x60, ag)
						st64(a + 0x58, ah)
						st64(a + 0x50, ai)
						st64(a + 0x48, aj)
						st32(a + 0x28, ab)
						st16(a + 0x2c, ac)
						st8(a + 0x118, k)
						st32(a + 0x114, am)
						st32(a + 0x110, an)
						st64(a + 0xd8, n)
						st64(a + 0xd0, ad)
						st64(a + 0x88, s)
						st64(a + 0x80, ak)
						st64(a + 0x78, al)
						st64(a + 0x2f, j)
						st8(a + 0x2e, i)
						st64(a, 0)
						return x
					}
				}
			}
		}
		const o = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		s = o
	}
	x = anchor_error_from(s108, 0xbbb /* anchor::AccountDidNotDeserialize */, p, q, r)
	const v = ld64(s108 + 8)
	const w = ld64(s108)
	const t = s
	if (2 > (s & 3) - 2) {
		st64(a + 0x10, v)
		st64(a + 8, w)
		st64(a, 1)
		return x
	}
	if ((t & 3) == 0) {
		st64(a + 0x10, v)
		st64(a + 8, w)
		st64(a, 1)
		return x
	}
	const u = ld64(ld64(s + 7))
	if (u == 0) {
		st64(a + 0x10, v)
		st64(a + 8, w)
		st64(a, 1)
		return x
	}
	x = callx(u, ld64(s - 1), u)
	st64(a + 0x10, v)
	st64(a + 8, w)
	st64(a, 1)
	return x
}

export function fn_10f370(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000007 >= g) {
		raw_vec_handle_error(1, 0x100, 0x100160ac0, 0x300000007, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0xce9adfc4f9571e64 /* event:CreatePersonalPositionEvent */)
	st64(g + 0x20, ld64(b + 0x18))
	st64(g + 0x18, ld64(b + 0x10))
	st64(g + 0x10, ld64(b + 8))
	st64(g + 8, ld64(b))
	st64(g + 0x40, ld64(b + 0x38))
	st64(g + 0x38, ld64(b + 0x30))
	st64(g + 0x30, ld64(b + 0x28))
	st64(g + 0x28, ld64(b + 0x20))
	st64(g + 0x58, ld64(b + 0x50))
	copy(g + 0x48, b + 0x40, 0x10)
	st64(g + 0x60, ld64(b + 0x58))
	st32(g + 0x68, ld32(b + 0x90))
	st32(g + 0x6c, ld32(b + 0x94))
	const h = ld64(b + 0x60)
	st64(g + 0x78, ld64(b + 0x68))
	st64(g + 0x70, h)
	copy(g + 0x80, b + 0x70, 0x20)
	st64(a + 8, g, 0xa0)
	st64(a, 0x100)
}

export function fn_10f5b8(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000007 >= g) {
		raw_vec_handle_error(1, 0x100, 0x100160ad8, 0x300000007, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0x541e2220d4694f31 /* event:IncreaseLiquidityEvent */)
	copy(g + 8, b, 0x20)
	const h = ld64(b + 0x20)
	st64(g + 0x30, ld64(b + 0x28))
	st64(g + 0x28, h)
	copy(g + 0x38, b + 0x30, 0x20)
	st64(a + 8, g, 0x58)
	st64(a, 0x100)
}

export function fn_10f760(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000007 >= g) {
		raw_vec_handle_error(1, 0x100, 0x100160af0, 0x300000007, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0x385532443a56de3a /* event:DecreaseLiquidityEvent */)
	copy(g + 8, b, 0x20)
	const h = ld64(b + 0x20)
	st64(g + 0x30, ld64(b + 0x28))
	st64(g + 0x28, h)
	copy(g + 0x38, b + 0x30, 0x48)
	st64(a + 8, g, 0x80)
	st64(a, 0x100)
}

export function fn_10f958(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000007 >= g) {
		raw_vec_handle_error(1, 0x100, 0x100160b08, 0x300000007, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0xa2b45439e69470ed /* event:LiquidityCalculateEvent */)
	const h = ld64(b)
	st64(g + 0x10, ld64(b + 8))
	st64(g + 8, h)
	const i = ld64(b + 0x10)
	st64(g + 0x20, ld64(b + 0x18))
	st64(g + 0x18, i)
	st32(g + 0x28, ld32(b + 0x50))
	copy(g + 0x2c, b + 0x20, 0x30)
	st64(a + 8, g, 0x5c)
	st64(a, 0x100)
}

export function fn_10fb10(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000007 >= g) {
		raw_vec_handle_error(1, 0x100, 0x100160b38, 0x300000007, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0x3f3563702f4b5e19 /* event:PoolCreatedEvent */)
	st64(g + 0x20, ld64(b + 0x18))
	st64(g + 0x18, ld64(b + 0x10))
	st64(g + 0x10, ld64(b + 8))
	st64(g + 8, ld64(b))
	copy(g + 0x28, b + 0x20, 0x20)
	st16(g + 0x48, ld16(b + 0xb4))
	copy(g + 0x52, b + 0x48, 0x18)
	st64(g + 0x4a, ld64(b + 0x40))
	const h = ld64(b + 0xa0)
	st64(g + 0x72, ld64(b + 0xa8))
	st64(g + 0x6a, h)
	st32(g + 0x7a, ld32(b + 0xb0))
	copy(g + 0x7e, b + 0x60, 0x40)
	st64(a + 8, g, 0xbe)
	st64(a, 0x100)
}

export function fn_10fd98(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000007 >= g) {
		raw_vec_handle_error(1, 0x100, 0x100160b68, 0x300000007, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0xe2710826e8cdc640 /* event:SwapEvent */)
	st64(g + 0x20, ld64(b + 0x18))
	st64(g + 0x18, ld64(b + 0x10))
	st64(g + 0x10, ld64(b + 8))
	st64(g + 8, ld64(b))
	st64(g + 0x40, ld64(b + 0x38))
	st64(g + 0x38, ld64(b + 0x30))
	st64(g + 0x30, ld64(b + 0x28))
	st64(g + 0x28, ld64(b + 0x20))
	st64(g + 0x60, ld64(b + 0x58))
	st64(g + 0x58, ld64(b + 0x50))
	st64(g + 0x50, ld64(b + 0x48))
	st64(g + 0x48, ld64(b + 0x40))
	st64(g + 0x80, ld64(b + 0x78))
	copy(g + 0x68, b + 0x60, 0x18)
	copy(g + 0x88, b + 0x80, 0x20)
	st8(g + 0xa8, ld8(b + 0xd4))
	const h = ld64(b + 0xa0)
	st64(g + 0xb1, ld64(b + 0xa8))
	st64(g + 0xa9, h)
	const i = ld64(b + 0xb0)
	st64(g + 0xc1, ld64(b + 0xb8))
	st64(g + 0xb9, i)
	st32(g + 0xc9, ld32(b + 0xd0))
	copy(g + 0xcd, b + 0xc0, 0x10)
	st64(a + 8, g, 0xdd)
	st64(a, 0x100)
}

export function fn_110060(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000007 >= g) {
		raw_vec_handle_error(1, 0x100, 0x100160b80, 0x300000007, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0x6b99589eceaff07e /* event:LiquidityChangeEvent */)
	copy(g + 8, b, 0x20)
	st32(g + 0x28, ld32(b + 0x40))
	st32(g + 0x2c, ld32(b + 0x44))
	st32(g + 0x30, ld32(b + 0x48))
	const h = ld64(b + 0x20)
	st64(g + 0x3c, ld64(b + 0x28))
	st64(g + 0x34, h)
	const i = ld64(b + 0x30)
	st64(g + 0x4c, ld64(b + 0x38))
	st64(g + 0x44, i)
	st64(a + 8, g, 0x54)
	st64(a, 0x100)
}

export function fn_110d30(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let g, j: u64
	if (8 > ld64(b + 8)) {
		j = anchor_error_from(s138, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		g = ld64(s138)
		st64(a + 0x10, ld64(s138 + 8))
		st64(a + 8, g)
		st64(a, 1)
		return j
	}
	if (ld64(ld64(b)) == 0x35a2700c4fb72886 /* account:SupportMintAssociated */) {
		return fn_1111c0(a, b, 0x35a2700c4fb72886 /* account:SupportMintAssociated */, d, e)
	}
	ErrorCode_name(s78, 0x1001598e8, 0x35a2700c4fb72886 /* account:SupportMintAssociated */, d, e)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (ErrorCode_fmt(0x1001598e8, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015b450)
	st32(sf8 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 6)
	st64(s118 + 0x10, 0x32)
	st64(s118, 0)
	j = fn_13e5a0(s128, s118)
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	g = ld64(s128)
	const h = f != 0 ? sat_sub(f, 0x15) : 0x300007feb
	const i = ld64(s128 + 8)
	if ((g & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x15, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 0xd, 0x6465746169636f73)
		st64(h + 8, 0x636f737341746e69)
		st64(h, 0x4d74726f70707553)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x15, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 0xd, 0x6465746169636f73)
		st64(h + 8, 0x636f737341746e69)
		st64(h, 0x4d74726f70707553)
		void ld64(i)
	}
	st64(i + 0x10, h, 0x15)
	st64(i + 8, 0x15)
	st64(i, 1)
	st64(a + 0x10, i)
	st64(a + 8, g)
	st64(a, 1)
	return j
}

export function fn_1111c0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20
	const f = ld64(b + 8)
	if (8 > f) {
		fn_153150(8, f, 0x100160bb0, d, e)
	}
	if (f != 8 && f - 8 >= 0x21) {
		const g = ld64(b)
		const n = ld8(g + 8)
		const h = ld64(g + 0xf)
		st8(s20 + 0x18, ld8(g + 0x17))
		st64(s20 + 0x10, h)
		if (f - 0x29 >= 8 && (f - 0x31 >= 8 && (f - 0x39 >= 8 && f - 0x41 >= 0x28))) {
			const w = ld64(s20 + 0x11)
			const i = ld64(g + 0x29)
			const s = ld64(g + 0x31)
			const v = ld64(g + 0x61)
			const u = ld64(g + 0x59)
			const t = ld64(g + 0x51)
			const m = ld64(g + 0x49)
			const l = ld64(g + 0x41)
			const k = ld64(g + 0x39)
			st16(a + 0x4c, ld16(g + 0xd))
			st32(a + 0x48, ld32(g + 9))
			copy(a + 0x57, g + 0x18, 0x10)
			st8(a + 0x67, ld8(g + 0x28))
			st64(a + 8, i, s, k, l, m, t, u, v)
			st64(a + 0x4f, w)
			st8(a + 0x68, n)
			st8(a + 0x4e, h)
			st64(a, 0)
			return s
		}
	}
	const o = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	let j = anchor_error_from(s20, 0xbbb /* anchor::AccountDidNotDeserialize */)
	const q = ld64(s20 + 8)
	const r = ld64(s20)
	if (2 > (o & 3) - 2) {
		st64(a + 0x10, q)
		st64(a + 8, r)
		st64(a, 1)
		return j
	}
	if ((o & 3) == 0) {
		st64(a + 0x10, q)
		st64(a + 8, r)
		st64(a, 1)
		return j
	}
	const p = ld64(ld64(o + 7))
	if (p == 0) {
		st64(a + 0x10, q)
		st64(a + 8, r)
		st64(a, 1)
		return j
	}
	j = callx(p, ld64(o - 1), p)
	st64(a + 0x10, q)
	st64(a + 8, r)
	st64(a, 1)
	return j
}

export function fn_11e480(r0: u64): u64 {
	return r0
}

export function fn_12b7c0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s20 = fp - 0x20, s28 = fp - 0x28, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60, s78 = fp - 0x78, s90 = fp - 0x90, sc0 = fp - 0xc0, sd8 = fp - 0xd8, se0 = fp - 0xe0, sf0 = fp - 0xf0, s100 = fp - 0x100, s118 = fp - 0x118, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let k, ah, al: u64
	let ak = ld64(s118)
	const h = ld8(d) != 0 ? d + 1 : 0
	const f = ld64(b + 0x78)
	const g = ld64(b + 0x18)
	st64(sff8, ld64(b + 0x48))
	st64(s1000, c)
	st64(sff0, 8, 0)
	fn_134648(s60, g, f, h, c, ld64(sff8), 8, 0)
	copy(s90, s58, 0x18)
	let i = ld64(s60)
	if (i == 0x8000000000000000) {
		k = fn_13e628(s100, s90)
		ak = ld64(s100 + 8)
		const y = ld64(s100)
		const v = ld64(b + 0x50)
		if (rc_release(v)) {
			k = Rc_drop_slow_125dd0(b + 0x50, k)
		}
		const w = ld64(b + 0x58)
		if (rc_release(w)) {
			k = Rc_drop_slow_125e20(b + 0x58, k)
		}
		const x = ld64(b + 0x80)
		if (rc_release(x)) {
			k = Rc_drop_slow_125dd0(b + 0x80, k)
		}
		al = y
		const z = ld64(b + 0x88)
		if (rc_release(z)) {
			k = Rc_drop_slow_125e20(b + 0x88, k)
		}
		const ab = ld64(b + 8)
		let aa = ld64(b + 0x10)
		if (aa != 0) {
			let ac = ab + 0x10
			do {
				const ad = ld64(ac - 8)
				if (rc_release(ad)) {
					k = Rc_drop_slow_125dd0(ac - 8, k)
				}
				const ae = ld64(ac)
				if (rc_release(ae)) {
					k = Rc_drop_slow_125e20(ac, k)
				}
				ac = ac + 0x30
				aa = aa - 1
			} while (aa != 0)
		}
		if (ld64(b) != 0) {
			k = fn_11e480(k)
		}
		const ai = ld64(b + 0x20)
		ah = al
		if (rc_release(ai)) {
			k = Rc_drop_slow_125dd0(b + 0x20, k)
		}
		const aj = ld64(b + 0x28)
		if (!rc_release(aj)) {
			st64(a + 8, ak)
			st64(a, ah)
			return k
		}
		k = Rc_drop_slow_125e20(b + 0x28, k)
		st64(a + 8, ak)
		st64(a, ah)
		return k
	}
	memcpy(sc0, s40, 0x30)
	st64(se0, i)
	copy(sd8, s90, 0x18)
	al = s60
	memcpy(s60, b + 0x78, 0x30)
	memcpy(s30, b + 0x48, 0x30)
	const j = ld64(b + 0xa8)
	st64(sff8, ld64(b + 0xb0))
	st64(s1000, j)
	let o = 2
	k = invoke_signed(s78, se0, al, 2, fp)
	if (ld64(s78) != 0x800000000000001a /* Ok */) {
		k = fn_13e628(sf0, s78)
		i = ld64(se0)
		ak = ld64(sf0 + 8)
		o = ld64(sf0)
	}
	if (i != 0) {
		k = fn_11e480(k)
	}
	if (ld64(sd8 + 0x10) != 0) {
		k = fn_11e480(k)
	}
	const l = ld64(s58)
	if (rc_release(l)) {
		k = Rc_drop_slow_125dd0(s58, k)
	}
	const m = ld64(s50)
	if (rc_release(m)) {
		k = Rc_drop_slow_125e20(s50, k)
	}
	const n = ld64(s28)
	if (rc_release(n)) {
		k = Rc_drop_slow_125dd0(s28, k)
	}
	al = o
	const p = ld64(s20)
	if (rc_release(p)) {
		k = Rc_drop_slow_125e20(s20, k)
	}
	const r = ld64(b + 8)
	let q = ld64(b + 0x10)
	if (q != 0) {
		let s = r + 0x10
		do {
			const t = ld64(s - 8)
			if (rc_release(t)) {
				k = Rc_drop_slow_125dd0(s - 8, k)
			}
			const u = ld64(s)
			if (rc_release(u)) {
				k = Rc_drop_slow_125e20(s, k)
			}
			s = s + 0x30
			q = q - 1
		} while (q != 0)
	}
	if (ld64(b) != 0) {
		k = fn_11e480(k)
	}
	const af = ld64(b + 0x20)
	ah = al
	if (rc_release(af)) {
		k = Rc_drop_slow_125dd0(b + 0x20, k)
	}
	const ag = ld64(b + 0x28)
	if (!rc_release(ag)) {
		st64(a + 8, ak)
		st64(a, ah)
		return k
	}
	k = Rc_drop_slow_125e20(b + 0x28, k)
	st64(a + 8, ak)
	st64(a, ah)
	return k
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_12c020(a: u64, b: u64, c: u64, d: u64): u64 {
	const s38 = fp - 0x38, s50 = fp - 0x50, s80 = fp - 0x80, s90 = fp - 0x90, s98 = fp - 0x98, sa0 = fp - 0xa0, sb8 = fp - 0xb8, se8 = fp - 0xe8, s100 = fp - 0x100, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s140 = fp - 0x140
	let n, ah, ar: u64
	const f = ld64(b + 0x48)
	fn_1371d0(sa0, f, ld64(b + 0x18), c, d)
	copy(sb8, s98, 0x18)
	const g = ld64(sa0)
	if (g == 0x8000000000000000) {
		n = fn_13e628(s138, sb8)
		const l = ld64(s138)
		st64(a + 8, ld64(s138 + 8))
		st64(a, l)
		const m = ld64(b + 0x20)
		if (rc_release(m)) {
			n = Rc_drop_slow_125dd0(b + 0x20, n)
		}
		const o = ld64(b + 0x28)
		if (rc_release(o)) {
			n = Rc_drop_slow_125e20(b + 0x28, n)
		}
	} else {
		st64(s140, a)
		memcpy(se8, s80, 0x30)
		st64(s108, g)
		copy(s100, sb8, 0x18)
		memcpy(sa0, b + 0x18, 0x30)
		let i = fn_142568(s50, s108, sa0, 1)
		if (ld64(s50) == 0x800000000000001a /* Ok */) {
			const h = ld64(s98)
			if (rc_release(h)) {
				i = Rc_drop_slow_125dd0(s98, i)
			}
			const j = ld64(s90)
			if (rc_release(j)) {
				Rc_drop_slow_125e20(s90, i)
			}
			B41: {
				B40: {
					fn_142b40(s38)
					const k = ld64(s38 + 0x20)
					if (k == 0x8000000000000000) {
						ah = 0x8000000000000002 /* Err(ProgramError::InvalidInstructionData) */
					} else {
						const ad = ld64(s38)
						const ac = ld64(s38 + 8)
						const ab = ld64(s38 + 0x10)
						const aa = ld64(s38 + 0x18)
						st64(s80 + 0x10, ld64(s38 + 0x30))
						st64(sa0, ad, ac, ab, aa)
						const ae = ld64(s38 + 0x28)
						st64(s80 + 8, ae)
						n = memcmp(sa0, f, 0x20) as u32
						if (n != 0) {
							ah = 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */
							if (k == 0) {
								break B40
							}
						} else {
							if (ld64(s80 + 0x10) == 8) {
								const ag = ld64(ae)
								if (k != 0) {
									n = fn_11e480(n)
								}
								const af = ld64(s140)
								st64(af + 8, ag)
								st64(af, 2)
								break B41
							}
							ah = 0x8000000000000002 /* Err(ProgramError::InvalidInstructionData) */
							if (k == 0) {
								break B40
							}
						}
						fn_11e480(n)
					}
				}
				st64(sa0, ah)
				n = fn_13e628(s128, sa0)
				const aj = ld64(s128)
				const ai = ld64(s140)
				st64(ai + 8, ld64(s128 + 8))
				st64(ai, aj)
			}
			if (ld64(s108) != 0) {
				n = fn_11e480(n)
			}
			if (ld64(s100 + 0x10) != 0) {
				n = fn_11e480(n)
			}
			const al = ld64(b + 8)
			let ak = ld64(b + 0x10)
			if (ak != 0) {
				let am = al + 0x10
				do {
					const an = ld64(am - 8)
					if (rc_release(an)) {
						n = Rc_drop_slow_125dd0(am - 8, n)
					}
					const ao = ld64(am)
					if (rc_release(ao)) {
						n = Rc_drop_slow_125e20(am, n)
					}
					am = am + 0x30
					ak = ak - 1
				} while (ak != 0)
			}
			if (ld64(b) != 0) {
				n = fn_11e480(n)
			}
			const ap = ld64(b + 0x50)
			if (rc_release(ap)) {
				n = Rc_drop_slow_125dd0(b + 0x50, n)
			}
			const aq = ld64(b + 0x58)
			ar = b + 0x58
			if (!rc_release(aq)) {
				return n
			}
			return Rc_drop_slow_125e20(ar, n)
		}
		copyr(s38, s50, 0x18)
		n = fn_13e628(s118, s38)
		const q = ld64(s118)
		const p = ld64(s140)
		st64(p + 8, ld64(s118 + 8))
		st64(p, q)
		const r = ld64(s98)
		if (rc_release(r)) {
			n = Rc_drop_slow_125dd0(s98, n)
		}
		const s = ld64(s90)
		if (rc_release(s)) {
			n = Rc_drop_slow_125e20(s90, n)
		}
		if (ld64(s108) != 0) {
			n = fn_11e480(n)
		}
		if (ld64(s100 + 0x10) != 0) {
			n = fn_11e480(n)
		}
	}
	const u = ld64(b + 8)
	let t = ld64(b + 0x10)
	if (t != 0) {
		let v = u + 0x10
		do {
			const w = ld64(v - 8)
			if (rc_release(w)) {
				n = Rc_drop_slow_125dd0(v - 8, n)
			}
			const x = ld64(v)
			if (rc_release(x)) {
				n = Rc_drop_slow_125e20(v, n)
			}
			v = v + 0x30
			t = t - 1
		} while (t != 0)
	}
	if (ld64(b) != 0) {
		n = fn_11e480(n)
	}
	const y = ld64(b + 0x50)
	if (rc_release(y)) {
		n = Rc_drop_slow_125dd0(b + 0x50, n)
	}
	const z = ld64(b + 0x58)
	ar = b + 0x58
	if (rc_release(z)) {
		return Rc_drop_slow_125e20(ar, n)
	}
	return n
}

export function fn_132bd8(a: u64): u64 {
	return a != 0x163 ? a : 0x165
}

export function fn_134648(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s70 = fp - 0x70, s88 = fp - 0x88, sa0 = fp - 0xa0, sc0 = fp - 0xc0, sd0 = fp - 0xd0
	let l, m: u64
	const f = memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20)
	const i = p8
	let n = p7
	const u = p6
	const h = p5
	if ((f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	let g = 0
	if (d != 0) {
		copyr(sc0, d, 0x20)
		g = 1
	}
	st32(s50 + 0xc, g)
	st8(s50 + 8, h)
	copy(s40, sc0, 0x20)
	st32(s50, 6)
	fn_1334b0(sa0, s50)
	if (i > i + 3) {
		fn_154730(0x100160e20)
	}
	__multi3_159030(sd0, i + 3, 0, 0x22, 0)
	const j = ld64(sd0)
	if (ld64(sd0 + 8) != 0) {
		raw_vec_handle_error(0, j, 0x100160e38, l, m)
	}
	if (0 > (j as i64)) {
		raw_vec_handle_error(0, j, 0x100160e38, l, m)
	}
	let k = __rust_alloc(j, 1)
	if (k == 0) {
		raw_vec_handle_error(1, j, 0x100160e38, l, m)
	}
	st64(s88, i + 3, k)
	st64(k + 0x18, ld64(c + 0x18))
	st64(k + 0x10, ld64(c + 0x10))
	st64(k + 8, ld64(c + 8))
	st64(k, ld64(c))
	st16(k + 0x20, 0x100)
	st64(s88 + 0x10, 1)
	if (i == -2) {
		RawVec_grow_one_131c60(s88, 0x100160e50, undef, l, m)
		k = ld64(s88 + 8)
	}
	st64(k + 0x3a, ld64(u + 0x18))
	st64(k + 0x32, ld64(u + 0x10))
	st64(k + 0x2a, ld64(u + 8))
	st64(k + 0x22, ld64(u))
	st8(k + 0x42, i == 0, 0)
	st64(s88 + 0x10, 2)
	let t = b
	if (i != 0) {
		let q = 2
		let o = 0
		let r = i << 3
		do {
			const s = ld64(n)
			copyr(s70, s, 0x20)
			if (q == ld64(s88)) {
				RawVec_grow_one_131c60(s88, 0x100160e68, t, l, m)
				t = b
				k = ld64(s88 + 8)
			}
			n = n + 8
			const p = k + o
			st64(p + 0x5c, ld64(s70 + 0x18))
			st64(p + 0x54, ld64(s70 + 0x10))
			st64(p + 0x4c, ld64(s70 + 8))
			st64(p + 0x44, ld64(s70))
			st16(p + 0x64, 1)
			o = o + 0x22
			q = q + 1
			st64(s88 + 0x10, q)
			r = r - 8
		} while (r != 0)
	}
	copyr(s20, t, 0x20)
	copy(s50, s88, 0x18)
	copy(s38, sa0, 0x18)
	memcpy(a, s50, 0x50)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value)
export function fn_1371d0(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s48 = fp - 0x48, s50 = fp - 0x50
	let h, i: u64
	if ((memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	const f = __rust_alloc(0x22, 1)
	if (f == 0) {
		alloc_handle_alloc_error(1, 0x22)
	}
	st64(f + 0x18, ld64(c + 0x18))
	st64(f + 0x10, ld64(c + 0x10))
	st64(f + 8, ld64(c + 8))
	st64(f, ld64(c))
	st16(f + 0x20, 0)
	if (0 > (e as i64)) {
		raw_vec_handle_error(0, e << 1, 0x100160d78, h, i)
	}
	if ((e << 1) > 0x7ffffffffffffffe) {
		raw_vec_handle_error(0, e << 1, 0x100160d78, h, i)
	}
	let g = 2
	let j = 0
	if ((e << 1) != 0) {
		g = __rust_alloc(e << 1, 2)
		j = e
		if (g == 0) {
			raw_vec_handle_error(2, e << 1, 0x100160d78, h, i)
		}
	}
	memcpy(g, d, e << 1)
	st64(s48, j, g, e)
	st32(s50, 0x15)
	const k = fn_1334b0(a + 0x18, s50)
	st64(a + 0x48, ld64(b + 0x18))
	st64(a + 0x40, ld64(b + 0x10))
	st64(a + 0x38, ld64(b + 8))
	st64(a + 0x30, ld64(b))
	st64(a + 8, f, 1)
	st64(a, 1)
	if (j != 0) {
		fn_11e480(k)
	}
}

export function fn_13ab88(a: u64, b: u64): u64 {
	const s18 = fp - 0x18, s30 = fp - 0x30, s40 = fp - 0x40, s48 = fp - 0x48, s50 = fp - 0x50
	let p, r, s, am, ap, aq, av, bt, bz, ca: u64
	st64(s30, 0, 1, 0)
	const f = ld64(b)
	const g = -0x7ffffffffffffffc > (f as i64) ? f + 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */ : 0
	st64(s40, a, b)
	if ((g as i64) > 1) {
		if (g == 2) {
			reserve_do_reserve_and_handle_13a808(s30, 0, 8)
			const af = ld64(s30 + 0x10)
			const ae = ld64(s30 + 8)
			st64(s48, ae)
			st64(ae + af, 0xb5258d59382012ea)
			let ag = af + 8
			st64(s30 + 0x10, ag)
			const ah = __rust_alloc(0x400, 1)
			let ai = ah
			if (ah != 0) {
				st64(s18, 0x400, ai)
				const ar = ld64(s40 + 8)
				st8(ai, ld8(ar + 0x20))
				const at = ld64(ar + 0x18)
				if (at > 0xffffffff) {
					fn_11e480(ah)
					st64(s18, 0x1500000003)
					fn_14ed60(0x10015c0ee /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x100161228, 0x100161278)
				}
				const au = ld64(ar + 0x10)
				st32(ai + 1, at)
				st64(s18 + 0x10, 5)
				if (at > 0x3fb) {
					st64(s50, au)
					reserve_do_reserve_and_handle_13a808(s18, 5, at)
					st64(s40 + 8, ld64(s18))
					ai = ld64(s18 + 8)
					const cb = ld64(s18 + 0x10)
					memcpy(ai + cb, ld64(s50), at)
					av = cb + at
					if (ld64(s40 + 8) == 0x8000000000000000) {
						st64(s18, ai)
						fn_14ed60(0x10015c0ee /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x100161228, 0x100161278)
					}
				} else {
					memcpy(ai + 5, au, at)
					st64(s40 + 8, 0x400)
					av = at + 5
				}
				let aw = ld64(s48)
				if (av > ld64(s30) - ag) {
					reserve_do_reserve_and_handle_13a808(s30, ag, av)
					aw = ld64(s30 + 8)
					ag = ld64(s30 + 0x10)
				}
				am = memcpy(aw + ag, ai, av)
				st64(s30 + 0x10, ag + av)
				if (ld64(s40 + 8) == 0) {
					ca = ld64(s40)
					st64(ca + 0x10, ld64(s30 + 0x10))
					st64(ca + 8, ld64(s30 + 8))
					st64(ca, ld64(s30))
					return am
				}
				am = fn_11e480(am)
				ca = ld64(s40)
				st64(ca + 0x10, ld64(s30 + 0x10))
				st64(ca + 8, ld64(s30 + 8))
				st64(ca, ld64(s30))
				return am
			}
			raw_vec_handle_error(1, 0x400, 0x100161210, ap, aq)
		}
		if (g == 3) {
			reserve_do_reserve_and_handle_13a808(s30, 0, 8)
			const ak = ld64(s30 + 0x10)
			let aj = ld64(s30 + 8)
			st64(aj + ak, 0x7b566454e4a6e4d7)
			let al = ak + 8
			st64(s30 + 0x10, al)
			am = __rust_alloc(0x400, 1)
			if (am != 0) {
				const ax = ld64(s40 + 8)
				st64(am + 0x18, ld64(ax + 0x20))
				st64(am + 0x10, ld64(ax + 0x18))
				st64(am + 8, ld64(ax + 0x10))
				st64(am, ld64(ax + 8))
				if (0x1f >= ld64(s30) - al) {
					reserve_do_reserve_and_handle_13a808(s30, al, 0x20)
					aj = ld64(s30 + 8)
					al = ld64(s30 + 0x10)
				}
				const ay = aj + al
				st64(ay + 0x18, ld64(am + 0x18))
				st64(ay + 0x10, ld64(am + 0x10))
				st64(ay + 8, ld64(am + 8))
				st64(ay, ld64(am))
				st64(s30 + 0x10, al + 0x20)
				am = fn_11e480(am)
				ca = ld64(s40)
				st64(ca + 0x10, ld64(s30 + 0x10))
				st64(ca + 8, ld64(s30 + 8))
				st64(ca, ld64(s30))
				return am
			}
			raw_vec_handle_error(1, 0x400, 0x100161210, ap, aq)
		}
		let y = 0
		reserve_do_reserve_and_handle_13a808(s30, 0, 8)
		const u = ld64(s30 + 0x10)
		let t = ld64(s30 + 8)
		st64(t + u, 0x46b80c0dfab4a6fa)
		let v = u + 8
		st64(s30 + 0x10, v)
		let z = 1
		const w = __rust_alloc(0x400, 1)
		if (w != 0) {
			const x = ld64(s40 + 8)
			if (ld64(x + 8) == 1) {
				st64(w + 1, ld64(x + 0x10))
				z = 9
				y = 1
			}
			st8(w, y)
			const aa = w + z
			let ac = 1
			let ab = 0
			if (ld64(x + 0x18) == 1) {
				st64(aa + 1, ld64(x + 0x20))
				ac = 9
				ab = 1
			}
			st8(aa, ab)
			const ad = ac + z
			if (ad > ld64(s30) - v) {
				reserve_do_reserve_and_handle_13a808(s30, v, ad)
				t = ld64(s30 + 8)
				v = ld64(s30 + 0x10)
			}
			am = memcpy(t + v, w, ad)
			st64(s30 + 0x10, v + ad)
			am = fn_11e480(am)
			ca = ld64(s40)
			st64(ca + 0x10, ld64(s30 + 0x10))
			st64(ca + 8, ld64(s30 + 8))
			st64(ca, ld64(s30))
			return am
		}
		raw_vec_handle_error(1, 0x400, 0x100161210, ap, aq)
	}
	if (g == 0) {
		reserve_do_reserve_and_handle_13a808(s30, 0, 8)
		const an = ld64(s30 + 0x10)
		st64(ld64(s30 + 8) + an, 0x8d4db858a21ee1d2 /* ix:initialize_token_metadata */)
		st64(s30 + 0x10, an + 8)
		let bf = 0x400
		let ao = __rust_alloc(0x400, 1)
		if (ao != 0) {
			st64(s18, 0x400, ao)
			const az = ld64(s40 + 8)
			const ba = ld64(az + 0x10)
			if (ba > 0xffffffff) {
				fn_11e480(ao)
				st64(s18, 0x1500000003)
				fn_14ed60(0x10015c0ee /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x100161228, 0x100161248)
			}
			const bb = ld64(az + 8)
			st32(ao, ba)
			let bc = 4
			st64(s18 + 0x10, 4)
			if (ba >= 0x3fd) {
				reserve_do_reserve_and_handle_13a808(s18, 4, ba)
				bf = ld64(s18)
				ao = ld64(s18 + 8)
				bc = ld64(s18 + 0x10)
			}
			st64(s48, ao)
			memcpy(ao + bc, bb, ba)
			let bd = bc + ba
			st64(s18 + 0x10, bd)
			const be = ld64(az + 0x28)
			if (0xffffffff >= be) {
				const bg = ld64(az + 0x20)
				if (3 >= bf - bd) {
					reserve_do_reserve_and_handle_13a808(s18, bd, 4)
					st64(s48, ld64(s18 + 8))
					bf = ld64(s18)
					bd = ld64(s18 + 0x10)
				}
				let bh = ld64(s48)
				st32(bh + bd, be)
				let bi = bd + 4
				st64(s18 + 0x10, bi)
				if (be > bf - bi) {
					reserve_do_reserve_and_handle_13a808(s18, bi, be)
					bh = ld64(s18 + 8)
					bi = ld64(s18 + 0x10)
				}
				let bn = bh
				memcpy(bh + bi, bg, be)
				let bj = bi + be
				st64(s18 + 0x10, bj)
				bf = ld64(s18)
				const bk = ld64(s40 + 8)
				const bl = ld64(bk + 0x40)
				if (0xffffffff >= bl) {
					const bm = ld64(bk + 0x38)
					if (3 >= bf - bj) {
						reserve_do_reserve_and_handle_13a808(s18, bj, 4)
						bn = ld64(s18 + 8)
						bf = ld64(s18)
						bj = ld64(s18 + 0x10)
					}
					let bo = bn
					st32(bn + bj, bl)
					let bp = bj + 4
					st64(s18 + 0x10, bp)
					if (bl > bf - bp) {
						reserve_do_reserve_and_handle_13a808(s18, bp, bl)
						bt = ld64(s18 + 8)
						bp = ld64(s18 + 0x10)
						bo = bt
					} else {
						bt = ld64(s18 + 8)
					}
					memcpy(bo + bp, bm, bl)
					const bq = ld64(s18)
					if (bq == 0x8000000000000000) {
						st64(s18, bt)
						fn_14ed60(0x10015c0ee /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x100161228, 0x100161248)
					}
					const bs = bp + bl
					let br = ld64(s30 + 0x10)
					if (bs > ld64(s30) - br) {
						reserve_do_reserve_and_handle_13a808(s30, br, bs)
						br = ld64(s30 + 0x10)
					}
					am = memcpy(ld64(s30 + 8) + br, bt, bs)
					st64(s30 + 0x10, br + bs)
					if (bq == 0) {
						ca = ld64(s40)
						st64(ca + 0x10, ld64(s30 + 0x10))
						st64(ca + 8, ld64(s30 + 8))
						st64(ca, ld64(s30))
						return am
					}
					am = fn_11e480(am)
					ca = ld64(s40)
					st64(ca + 0x10, ld64(s30 + 0x10))
					st64(ca + 8, ld64(s30 + 8))
					st64(ca, ld64(s30))
					return am
				}
			}
			if (bf == 0) {
				st64(s18, 0x1500000003)
				fn_14ed60(0x10015c0ee /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x100161228, 0x100161248)
			}
			fn_11e480(ld64(s18 + 8))
			st64(s18, 0x1500000003)
			fn_14ed60(0x10015c0ee /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x100161228, 0x100161248)
		}
		raw_vec_handle_error(1, 0x400, 0x100161210, ap, aq)
	}
	reserve_do_reserve_and_handle_13a808(s30, 0, 8)
	const h = ld64(s30 + 0x10)
	st64(ld64(s30 + 8) + h, 0xc8dccab52d31e9dd)
	st64(s30 + 0x10, h + 8)
	let i = __rust_alloc(0x400, 1)
	let j = i
	if (i != 0) {
		st64(s18, 0x400, j)
		let k = ld64(s40 + 8)
		const l = ld64(k + 0x20)
		st8(j, min(l ^ 0x8000000000000000, 3))
		st64(s18 + 0x10, 1)
		if (3 > (l ^ 0x8000000000000000)) {
			p = 1
			s = 0x400
			r = ld64(k + 0x18)
			if (r > 0xffffffff) {
				fn_11e480(i)
				st64(s18, 0x1500000003)
				fn_14ed60(0x10015c0ee /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x100161228, 0x100161260)
			}
		} else {
			const m = ld64(k + 0x30)
			if (m > 0xffffffff) {
				fn_11e480(i)
				st64(s18, 0x1500000003)
				fn_14ed60(0x10015c0ee /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x100161228, 0x100161260)
			}
			const n = ld64(k + 0x28)
			st32(j + 1, m)
			let o = 5
			st64(s48, 0x400)
			st64(s18 + 0x10, 5)
			const q = k
			if (m >= 0x3fc) {
				reserve_do_reserve_and_handle_13a808(s18, 5, m)
				st64(s48, ld64(s18))
				j = ld64(s18 + 8)
				o = ld64(s18 + 0x10)
			}
			i = memcpy(j + o, n, m)
			p = o + m
			st64(s18 + 0x10, p)
			r = ld64(q + 0x18)
			k = q
			s = ld64(s48)
			if (r > 0xffffffff) {
				if (s == 0) {
					st64(s18, 0x1500000003)
					fn_14ed60(0x10015c0ee /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x100161228, 0x100161260)
				}
				fn_11e480(i)
				st64(s18, 0x1500000003)
				fn_14ed60(0x10015c0ee /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x100161228, 0x100161260)
			}
		}
		const bu = ld64(k + 0x10)
		if (3 >= s - p) {
			reserve_do_reserve_and_handle_13a808(s18, p, 4)
			j = ld64(s18 + 8)
			s = ld64(s18)
			p = ld64(s18 + 0x10)
		}
		st32(j + p, r)
		let bv = p + 4
		st64(s18 + 0x10, bv)
		if (r > s - bv) {
			reserve_do_reserve_and_handle_13a808(s18, bv, r)
			bz = ld64(s18 + 8)
			bv = ld64(s18 + 0x10)
			j = bz
		} else {
			bz = ld64(s18 + 8)
		}
		memcpy(j + bv, bu, r)
		const bw = ld64(s18)
		if (bw == 0x8000000000000000) {
			st64(s18, bz)
			fn_14ed60(0x10015c0ee /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x100161228, 0x100161260)
		}
		const by = bv + r
		let bx = ld64(s30 + 0x10)
		if (by > ld64(s30) - bx) {
			reserve_do_reserve_and_handle_13a808(s30, bx, by)
			bx = ld64(s30 + 0x10)
		}
		am = memcpy(ld64(s30 + 8) + bx, bz, by)
		st64(s30 + 0x10, bx + by)
		if (bw == 0) {
			ca = ld64(s40)
			st64(ca + 0x10, ld64(s30 + 0x10))
			st64(ca + 8, ld64(s30 + 8))
			st64(ca, ld64(s30))
			return am
		}
		am = fn_11e480(am)
		ca = ld64(s40)
		st64(ca + 0x10, ld64(s30 + 0x10))
		st64(ca + 8, ld64(s30 + 8))
		st64(ca, ld64(s30))
		return am
	}
	raw_vec_handle_error(1, 0x400, 0x100161210, ap, aq)
}

export function fn_13be00(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64) {
	const s18 = fp - 0x18, s30 = fp - 0x30, s48 = fp - 0x48
	const f = p7
	copyr(s48, f, 0x18)
	const g = p8
	copy(s30, g, 0x18)
	const h = p9
	copy(s18, h, 0x18)
	const i = __rust_alloc(0x88, 1)
	if (i == 0) {
		alloc_handle_alloc_error(1, 0x88)
	}
	const k = p6
	const j = p5
	st64(i + 0x18, ld64(c + 0x18))
	st64(i + 0x10, ld64(c + 0x10))
	st64(i + 8, ld64(c + 8))
	st64(i, ld64(c))
	st16(i + 0x20, 0x100)
	copy(i + 0x22, d, 0x20)
	st16(i + 0x42, 0)
	copy(i + 0x44, j, 0x20)
	st16(i + 0x64, 0)
	st64(i + 0x7e, ld64(k + 0x18))
	st64(i + 0x76, ld64(k + 0x10))
	st64(i + 0x6e, ld64(k + 8))
	st64(i + 0x66, ld64(k))
	st16(i + 0x86, 1)
	const l = fn_13ab88(a + 0x18, s48)
	st64(a + 0x48, ld64(b + 0x18))
	st64(a + 0x40, ld64(b + 0x10))
	st64(a + 0x38, ld64(b + 8))
	st64(a + 0x30, ld64(b))
	st64(a + 8, i, 4)
	st64(a, 4)
	fn_13a4a8(s48, l)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (value)
export function fn_13e070(a: u64, b: u64, c: u64): u64 {
	const g = ld64(a + 8)
	const f = ld64(a + 0x10)
	let h = 0
	if (g > f) {
		h = min(sat_sub(g, f), c)
		const j = c
		sol_memcpy(ld64(a) + f, b, h)
		const i = f + h
		if (f > i) {
			fn_154730(0x1001613d8)
		}
		st64(a + 0x10, i)
		c = j
	}
	if (h == c) {
		return 0
	}
	return Error_new_13c880()
}

// types [heur]: d: DataCell (every call passes one: fn_551a8, fn_a8b80, fn_d36e0, …)
export function fn_13e190(a: u64, b: u64, c: u64, d: DataCell, e: u64): u64 {
	const s18 = fp - 0x18
	const f = fn_147a20(c, b, c, d, e)
	let g = f
	const h = fn_147a20(b)
	if (f > f + h) {
		fn_14e940(0x100161420, f + h)
	}
	const i = ld64(c + 8)
	const j = ld64(i + 0x10)
	if (j == 0) {
		const k = h + g
		st64(i + 0x10, -1)
		st64(ld64(i + 0x18), k)
		st64(i + 0x10, ld64(i + 0x10) + 1)
		const l = ld64(b + 8)
		const m = ld64(l + 0x10)
		if (m == 0) {
			st64(l + 0x10, -1)
			st64(ld64(l + 0x18), 0)
			st64(l + 0x10, ld64(l + 0x10) + 1)
			let n = memset(s18, b, 0, AccountInfo_assign(b, 0x100159560, k))
			let o = 2
			if (ld64(s18) != 0x800000000000001a /* Ok */) {
				n = __rust_alloc(0x80, 8)
				g = n
				if (n == 0) {
					alloc_handle_alloc_error(8, 0x80)
				}
				st64(g, 2)
				copy(g + 0x20, s18, 0x18)
				st8(g + 0x38, 2)
				o = 1
			}
			const t = o
			const p = ld64(c + 8)
			if (rc_release(p)) {
				n = Rc_drop_slow_13cfe8(c + 8, n)
			}
			const q = ld64(c + 0x10)
			if (rc_release(q)) {
				n = Rc_drop_slow_13d038(c + 0x10, n)
			}
			const r = ld64(b + 8)
			if (rc_release(r)) {
				n = Rc_drop_slow_13cfe8(b + 8, n)
			}
			const s = ld64(b + 0x10)
			if (!rc_release(s)) {
				st64(a + 8, g)
				st64(a, t)
				return n
			}
			n = Rc_drop_slow_13d038(b + 0x10, n)
			st64(a + 8, g)
			st64(a, t)
			return n
		}
		fn_14e770(0x1001613f0, m)
	}
	fn_14e770(0x100161408, j)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_13e5a0(a: u64, b: u64): u64 {
	const f = __rust_alloc(0xa0, 8)
	if (f == 0) {
		alloc_handle_alloc_error(8, 0xa0)
	}
	const g = memcpy(f, b, 0xa0)
	st64(a + 8, f)
	st64(a, 0)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_13e628(a: u64, b: u64): u64 {
	const f = __rust_alloc(0x80, 8)
	if (f == 0) {
		alloc_handle_alloc_error(8, 0x80)
	}
	st64(f, 2)
	copy(f + 0x20, b, 0x18)
	st8(f + 0x38, 2)
	st64(a + 8, f)
	st64(a, 1)
	return f
}

export function fn_13e920(a: u64, b: u64): u64 {
	let g = ld64(b + 0x20) ^ 0x8000000000000000
	let f = ld64(a + 0x20) ^ 0x8000000000000000
	f = 0x1a > f ? f : 0xe
	g = 0x1a > g ? g : 0xe
	if (f != g) {
		return 0
	}
	if (f == 0xe) {
		const h = ld64(a + 0x30)
		if (h != ld64(b + 0x30)) {
			return 0
		}
		if ((memcmp(ld64(a + 0x28), ld64(b + 0x28), h) as u32) == 0) {
			return 1
		}
		return 0
	}
	if (f != 0) {
		return 1
	}
	if (ld32(a + 0x28) == ld32(b + 0x28)) {
		return 1
	}
	return 0
}

export function log_data(a: u64, b: u64): u64 {
	return sol_log_data(a, b)
}

// name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_141920)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
export function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: AccountInfo): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, s90 = fp - 0x90, sa8 = fp - 0xa8, sac = fp - 0xac
	st32(sac, b)
	ErrorCode_name(s78, sac, c, d, e)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x1001613a8)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (ErrorCode_fmt(sac, s48) != 0) {
		fn_14ed60(0x10015cc70 /* "a Display implementation returned an error unexpectedly" */, 0x37, s1, 0x100161638, 0x100161658)
	}
	copyr(sa8, s60, 0x18)
	copy(s90, s78, 0x18)
	const f = __rust_alloc(0xa0, 8)
	if (f != 0) {
		st64(f, 2)
		copy(f + 0x20, s90, 0x18)
		copy(f + 0x38, sa8, 0x18)
		st32(f + 0x98, b)
		st8(f + 0x50, 2)
		st64(a + 8, f)
		st64(a, 0)
		return f
	}
	alloc_handle_alloc_error(8, 0xa0)
}

export function fn_142568(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1000 = fp - 0x1000
	st64(s1000, 8, 0)
	return invoke_signed(a, b, c, d, fp)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
export function fn_1476d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10
	if (b > b + 0x80) {
		fn_154730(0x100161eb0, b + 0x80, b, d, e)
	}
	__multi3_159030(s10, b + 0x80, 0, ld64(a), 0)
	const f = ld64(s10 + 8)
	if (f != 0) {
		fn_1547e0(0x100161ec8, f)
	}
	const g = __floatundidf(ld64(s10))
	const h = fn_158340(ld64(a + 8), g)
	const i = fn_159078(h, 0)
	const j = __fixunsdfdi(h)
	return (fn_156088(h, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (i as i64) ? 0 : j
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), d (value), e (value)
export function fn_147a20(a: AccountInfo, b: u64, c: u64, d: u64, e: u64): u64 {
	const f: LamportsCell = a.lamports
	const g = f.borrow
	if (g > 0x7ffffffffffffffe) {
		fn_14e808(0x100161ee0, g, 0x7ffffffffffffffe, d, e)
	}
	f.borrow = g + 1
	const h = f.value.amount
	f.borrow = g
	return h
}

export function fn_147a98(a: AccountInfo, b: u64, c: u64, d: u64, e: u64): u64 {
	const f: DataCell = a.data
	const g = f.borrow
	if (g > 0x7ffffffffffffffe) {
		fn_14e808(0x100161ef8, g, 0x7ffffffffffffffe, d, e)
	}
	return f.len
}

export function fn_14b198(a: u64, b: u64): u64 {
	return solana_pubkey_write_as_base58(b, a)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
export function fn_14ce00(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14d4b8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
export function fn_14d4b8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	custom_panic(a, b, c, d, e)
	abort()
}

export function fn_14e770(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s1 = fp - 0x1, s18 = fp - 0x18, s48 = fp - 0x48
	st64(s48, 0x100162320)
	st64(s48 + 0x10, s18)
	st64(s18, s1, BorrowMutError_fmt)
	st64(s48 + 0x20, 0)
	st64(s48 + 8, 1)
	st64(s48 + 0x18, 1)
	// fmt "already borrowed: {}" {} = *s1 [BorrowMutError_fmt]
	fn_14ec00(s48, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), e (value)
export function fn_14e808(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s1 = fp - 0x1, s18 = fp - 0x18, s48 = fp - 0x48
	st64(s48, 0x100162330)
	st64(s48 + 0x10, s18)
	st64(s18, s1, BorrowError_fmt)
	st64(s48 + 0x20, 0)
	st64(s48 + 8, 1)
	st64(s48 + 0x18, 1)
	// fmt "already mutably borrowed: {}" {} = *s1 [BorrowError_fmt]
	fn_14ec00(s48, a, c, d, e)
}

export function fn_14e940(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14ec30("called `Option::unwrap()` on a `None` value", 0x2b, a, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
export function fn_14ec00(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s18 = fp - 0x18
	st64(s18, a, b)
	st16(s18 + 0x10, 1)
	fn_14ce00(s18, b, c, d, e)
}

export function fn_14ec30(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s10 = fp - 0x10, s38 = fp - 0x38, s40 = fp - 0x40
	st64(s40, s10)
	st64(s10, a, b)
	st64(s38, 1, 8, 0, 0)
	fn_14ec00(s40, c, c, s10, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), d (value), e (value)
export function fn_14ec98(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	st64(s60, a, b, 0x100162370)
	st64(s50 + 0x10, s20)
	st64(s20, s58, fn_155738, s60, fn_155738)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "index out of bounds: the len is {} but the index is {}" {} = b [fn_155738], {} = a [fn_155738]
	fn_14ec00(s50, c, c, d, e)
}

export function fn_14ed60(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70
	st64(s70, a, b, c, d, 0x100162390)
	st64(s50 + 0x10, s20)
	st64(s20, s70, T_fmt_155a38, s60, T_fmt_155a08)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "{}: {}" {} = a [T_fmt_155a38], {} = c [T_fmt_155a08]
	fn_14ec00(s50, e, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), e (value)
export function fn_153150(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155a68(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (points to it), e (value)
export function fn_153158(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155b30(a, b, c, d, e)
}

export function fn_153160(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155bf8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
export function fn_154730(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622d0, 1, 8, 0, 0)
	// fmt "attempt to add with overflow"
	fn_14ec00(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
export function fn_154788(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622e0, 1, 8, 0, 0)
	// fmt "attempt to subtract with overflow"
	fn_14ec00(s30, a, c, d, e)
}

export function fn_1547e0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622f0, 1, 8, 0, 0)
	// fmt "attempt to multiply with overflow"
	fn_14ec00(s30, a, c, d, e)
}

export function fn_154838(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x100162300, 1, 8, 0, 0)
	// fmt "attempt to negate with overflow"
	fn_14ec00(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
export function fn_154890(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x100162310, 1, 8, 0, 0)
	// fmt "attempt to shift left with overflow"
	fn_14ec00(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
export function fn_1548e8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x100162588, 1, 8, 0, 0)
	// fmt "attempt to divide by zero"
	fn_14ec00(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
export function fn_154940(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x100162598, 1, 8, 0, 0)
	// fmt "attempt to calculate the remainder with a divisor of zero"
	fn_14ec00(s30, a, c, d, e)
}

export function fn_154c88(a: u64, b: u64): u64 {
	return imp__fmt_154cb0(ld8(a), 1, b)
}

export function fn_154e18(a: u64, b: u64): u64 {
	return fn_154e40(ld16(a), 1, b)
}

export function fn_155420(a: u64, b: u64): u64 {
	return imp__fmt_155448(ld32(a), 1, b)
}

export function fn_155738(a: u64, b: u64): u64 {
	return imp__fmt_155760(ld64(a), 1, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (value), e (value)
export function fn_155a68(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	st64(s60, a, b, 0x1001625f8)
	st64(s50 + 0x10, s20)
	st64(s20, s60, fn_155738, s58, fn_155738)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "range start index {} out of range for slice of length {}" {} = a [fn_155738], {} = b [fn_155738]
	fn_14ec00(s50, c, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (value), d (points to it), e (value)
export function fn_155b30(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	st64(s60, a, b, 0x100162618)
	st64(s50 + 0x10, s20)
	st64(s20, s60, fn_155738, s58, fn_155738)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "range end index {} out of range for slice of length {}" {} = a [fn_155738], {} = b [fn_155738]
	fn_14ec00(s50, c, c, d, e)
}

export function fn_155bf8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	st64(s60, a, b, 0x100162638)
	st64(s50 + 0x10, s20)
	st64(s20, s60, fn_155738, s58, fn_155738)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "slice index starts at {} but ends at {}" {} = a [fn_155738], {} = b [fn_155738]
	fn_14ec00(s50, c, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
export function memcpy(a: u64, b: AccountInfo, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

export function memmove(a: u64, b: u64, c: u64): u64 {
	sol_memmove(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), c (value)
export function memset2(a: u64, b: u64, c: u64): u64 {
	sol_memset(a, b as u8, c)
	return a
}

export function fn_156088(a: u64, b: u64): u64 {
	return cmp___gedf2(a, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
export function fn_158340(a: u64, b: u64): u64 {
	return mul_mul(a, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
export function fn_158b50(a: u64, b: u64): u64 {
	return fn_158350(a, b)
}

export function fn_159078(a: u64, b: u64): u64 {
	return cmp___gedf2(a, b)
}
