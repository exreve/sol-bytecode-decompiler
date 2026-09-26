/// <reference path="../lib.d.ts" />
// instruction update_pool_status
import { anchor_error_from, fn_53e8, fn_cf1b8 } from '../shared.ts'

// instruction handler: update_pool_status (discriminator sha256("global:update_pool_status")[..8] = 0x7b75e02e066c5782)
// accounts [idl]: 0 authority [signer, = GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ], 1 pool_state [mut]
// args [idl]: status: u8
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, status
export function ix_update_pool_status(a: u64, program_id: u64, accounts: u64, accounts_len: u64, args: UpdatePoolStatusArgs, ix_args_len: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58
	let j, l: u64
	const f = sol_log("Instruction: UpdatePoolStatus", 0x1d)
	if (ix_args_len == 0) {
		const g = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		if (2 > (g & 3) - 2) {
			j = anchor_error_from(s58, 0x66 /* anchor::InstructionDidNotDeserialize */)
			l = ld64(s58)
			st64(a + 8, ld64(s58 + 8))
			st64(a, l)
			return j
		}
		if ((g & 3) == 0) {
			j = anchor_error_from(s58, 0x66 /* anchor::InstructionDidNotDeserialize */)
			l = ld64(s58)
			st64(a + 8, ld64(s58 + 8))
			st64(a, l)
			return j
		}
		const h = ld64(ld64(g + 7))
		if (h == 0) {
			j = anchor_error_from(s58, 0x66 /* anchor::InstructionDidNotDeserialize */)
			l = ld64(s58)
			st64(a + 8, ld64(s58 + 8))
			st64(a, l)
			return j
		}
		callx(h, ld64(g - 1), h)
		j = anchor_error_from(s58, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s58)
		st64(a + 8, ld64(s58 + 8))
		st64(a, l)
		return j
	}
	const status = args.status
	st64(s38, accounts, accounts_len)
	j = fn_ce8a0(s18, undef, s38, undef, fp, f)
	let i = ld64(s18 + 0x10)
	if (ld64(s18) != 0) {
		l = ld64(s18 + 8)
		st64(a + 8, i)
		st64(a, l)
		return j
	}
	st64(s28, ld64(s18 + 8))
	st64(s28 + 8, i)
	j = fn_53e8(s18, i, undef, undef, undef, j)
	i = ld64(s18 + 0x10)
	if (ld64(s18) != 0) {
		l = ld64(s18 + 8)
		st64(a + 8, i)
		st64(a, l)
		return j
	}
	st8(ld64(s18 + 8) + 0x17d, status)
	st64(i, ld64(i) + 1)
	j = fn_cf1b8(s48, s28, program_id)
	l = ld64(s48)
	st64(a + 8, ld64(s48 + 8))
	st64(a, l)
	return j
}

export function fn_ce8a0(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90
	let r, u, v: u64
	let j = try_accounts_17a30(s40, c, c, d, e, r0)
	let h = ld64(s40 + 8)
	const f = ld64(s40)
	if (f != 2) {
		const q = ld64(0x300000000 /* heap bump-allocator cursor */)
		r = 9 > q
		const n = r != 0 ? 0 : q - 9
		const s = q != 0 ? n : 0x300007ff7
		if ((f & 1) != 0) {
			if (0x300000008 > s) {
				raw_vec_handle_error(1, 9, 0x10015f8f8, n, r)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, s)
			st64(s, 0x7469726f68747561)
			st8(s + 8, 0x79)
			void ld64(h)
		} else {
			if (0x300000008 > s) {
				raw_vec_handle_error(1, 9, 0x10015f8f8, n, r)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, s)
			st64(s, 0x7469726f68747561)
			st8(s + 8, 0x79)
			void ld64(h)
		}
		st64(h + 0x10, s, 9)
		st64(h + 8, 9)
		st64(h, 1)
		st64(a + 8, f)
		st64(a, 1)
		st64(a + 0x10, h)
		return j
	}
	j = fn_11e0(s40, c)
	const x = ld64(s40 + 8)
	const g = ld64(s40)
	if (g == 2) {
		const i = ld64(h)
		copyr(s60, i, 0x20)
		j = memcmp(s60, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32
		if (j == 0) {
			if (ld8(x + 0x29) != 0) {
				st64(a + 8, h)
				st64(a, 0)
				st64(a + 0x10, x)
				return j
			}
			j = anchor_error_from(s90, 0x7d0 /* anchor::ConstraintMut */)
			u = undef
			const y = ld64(0x300000000 /* heap bump-allocator cursor */)
			v = 0xa > y
			const aa = y != 0 ? v != 0 ? 0 : y - 0xa : 0x300007ff6
			h = ld64(s90 + 8)
			const z = ld64(s90)
			if ((z & 1) != 0) {
				if (0x300000008 > aa) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, v, u)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, aa)
				st64(aa, 0x6174735f6c6f6f70)
				st16(aa + 8, 0x6574)
				void ld64(h)
			} else {
				if (0x300000008 > aa) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, v, u)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, aa)
				st64(aa, 0x6174735f6c6f6f70)
				st16(aa + 8, 0x6574)
				void ld64(h)
			}
			st64(h + 0x10, aa, 0xa)
			st64(h + 8, 0xa)
			st64(h, 1)
			st64(a + 8, z)
			st64(a, 1)
			st64(a + 0x10, h)
			return j
		}
		const p = anchor_error_from(s70, 0x7dc /* anchor::ConstraintAddress */)
		r = undef
		const k = ld64(0x300000000 /* heap bump-allocator cursor */)
		const m = k != 0 ? sat_sub(k, 9) : 0x300007ff7
		const o = ld64(s70 + 8)
		const l = ld64(s70)
		if ((l & 1) != 0) {
			if (0x300000008 > m) {
				raw_vec_handle_error(1, 9, 0x10015f8f8, 0x300000008, r)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, m)
			st64(m, 0x7469726f68747561)
			st8(m + 8, 0x79)
			void ld64(o)
		} else {
			if (0x300000008 > m) {
				raw_vec_handle_error(1, 9, 0x10015f8f8, 0x300000008, r)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, m)
			st64(m, 0x7469726f68747561)
			st8(m + 8, 0x79)
			void ld64(o)
		}
		st64(o + 0x10, m, 9)
		st64(o + 8, 9)
		st64(o, 1)
		copyr(s40, s60, 0x20)
		st64(s20, 0xa6bd3bcb652bb6e5, 0x648eee6fe68868f5, 0xb1880f9c196055dc, 0xa18a9e05bd73e21f) // key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ
		j = Error_with_pubkeys(s80, l, o, s40, p)
		h = ld64(s80 + 8)
		st64(a + 8, ld64(s80))
		st64(a, 1)
		st64(a + 0x10, h)
		return j
	}
	const t = ld64(0x300000000 /* heap bump-allocator cursor */)
	u = 0xa > t
	v = u != 0 ? 0 : t - 0xa
	const w = t != 0 ? v : 0x300007ff6
	if ((g & 1) != 0) {
		if (0x300000008 > w) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, v, u)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, w)
		st64(w, 0x6174735f6c6f6f70)
		st16(w + 8, 0x6574)
		void ld64(x)
	} else {
		if (0x300000008 > w) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, v, u)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, w)
		st64(w, 0x6174735f6c6f6f70)
		st16(w + 8, 0x6574)
		void ld64(x)
	}
	st64(x + 0x10, w, 0xa)
	st64(x + 8, 0xa)
	st64(x, 1)
	st64(a + 8, g)
	st64(a, 1)
	st64(a + 0x10, x)
	return j
}
