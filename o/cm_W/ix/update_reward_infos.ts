/// <reference path="../lib.d.ts" />
// instruction update_reward_infos
import { anchor_error_from, fn_13e628, fn_53e8, fn_6c2a0, fn_88360, fn_a80, log_data } from '../shared.ts'

// instruction handler: update_reward_infos (discriminator sha256("global:update_reward_infos")[..8] = 0xdf6a9a0b34e0aca3)
// accounts [idl]: 0 pool_state [mut]
// args [idl]: (none)
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
export function ix_update_reward_infos(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58
	sol_log("Instruction: UpdateRewardInfos", 0x1e)
	st64(s38, accounts, accounts_len)
	let h = fn_bca70(s20, undef, s38, undef, fp)
	const g = ld64(s20 + 8)
	let f = ld64(s20)
	if (f != 2) {
		st64(a + 8, g)
		st64(a, f)
		return h
	}
	st64(s28, g)
	copyr(s10, s38, 0x10)
	st64(s20, program_id, s28)
	h = fn_43c50(s48, s20)
	f = ld64(s48)
	if (f != 2) {
		st64(a + 8, ld64(s48 + 8))
		st64(a, f)
		return h
	}
	h = fn_bce50(s58, s28, program_id)
	f = ld64(s58)
	st64(a + 8, ld64(s58 + 8))
	st64(a, f)
	return h
}

export function fn_bca70(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	let j: u64
	let i = fn_11e0(s10, c, c, d, e)
	const g = ld64(s10 + 8)
	let f = ld64(s10)
	if (f != 2) {
		const h = ld64(0x300000000 /* heap bump-allocator cursor */)
		i = 0xa > h
		j = i != 0 ? 0 : h - 0xa
		const k = h != 0 ? j : 0x300007ff6
		if ((f & 1) != 0) {
			if (0x300000008 > k) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, k)
			st64(k, 0x6174735f6c6f6f70)
			st16(k + 8, 0x6574)
			void ld64(g)
		} else {
			if (0x300000008 > k) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, k)
			st64(k, 0x6174735f6c6f6f70)
			st16(k + 8, 0x6574)
			void ld64(g)
		}
		st64(g + 0x10, k, 0xa)
		st64(g + 8, 0xa)
		st64(g, 1)
		st64(a + 8, g)
		st64(a, f)
		return i
	}
	if (ld8(g + 0x29) != 0) {
		st64(a + 8, g)
		st64(a, 2)
		return i
	}
	i = anchor_error_from(s20, 0x7d0 /* anchor::ConstraintMut */)
	j = undef
	const l = ld64(0x300000000 /* heap bump-allocator cursor */)
	const m = l != 0 ? sat_sub(l, 0xa) : 0x300007ff6
	const n = ld64(s20 + 8)
	f = ld64(s20)
	if ((f & 1) != 0) {
		if (0x300000008 > m) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, j)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, m)
		st64(m, 0x6174735f6c6f6f70)
		st16(m + 8, 0x6574)
		void ld64(n)
	} else {
		if (0x300000008 > m) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, j)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, m)
		st64(m, 0x6174735f6c6f6f70)
		st16(m + 8, 0x6574)
		void ld64(n)
	}
	st64(n + 0x10, m, 0xa)
	st64(n + 8, 0xa)
	st64(n, 1)
	st64(a + 8, n)
	st64(a, f)
	return i
}

export function fn_43c50(a: u64, b: u64): u64 {
	const s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220
	let s, t, u: u64
	const f = clock_get(s200)
	if (ld64(s200) != 0) {
		const k = ld64(s200 + 8)
		const j = ld64(s200 + 0x10)
		st64(s200 + 0x10, ld64(s200 + 0x18))
		st64(s200, k, j)
		u = fn_13e628(s220, s200)
		t = ld64(s220)
		st64(a + 8, ld64(s220 + 8))
		st64(a, t)
		return u
	}
	const g = ld64(s200 + 0x28)
	u = fn_53e8(s200, ld64(ld64(b + 8)), undef, undef, undef, f)
	const l = ld64(s200 + 0x10)
	if (ld64(s200) != 0) {
		t = ld64(s200 + 8)
		st64(a + 8, l)
		st64(a, t)
		return u
	}
	if ((g as i64) > -1) {
		u = fn_6c2a0(s200, ld64(s200 + 8), g)
		if (ld8(s200) != 0) {
			s = ld64(s200 + 0x10)
			t = ld64(s200 + 8)
			st64(l, ld64(l) + 1)
			st64(a + 8, s)
			st64(a, t)
			return u
		}
		const h = ld64(0x300000000 /* heap bump-allocator cursor */)
		const i = h != 0 ? sat_sub(h, 0x100) : 0x300007f00
		if (i > 0x300000007) {
			const m = ld64(s200 + 0x1f4)
			const n = ld64(s200 + 0x1ec)
			const o = ld64(s200 + 0x14b)
			const p = ld64(s200 + 0x143)
			const q = ld64(s200 + 0xa2)
			const r = ld64(s200 + 0x9a)
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i + 0x30, m)
			st64(i + 0x28, n)
			st64(i + 0x20, o)
			st64(i + 0x18, p)
			st64(i + 0x10, q)
			st64(i + 8, r)
			st64(i, 0xec2541724eba7f6d /* event:UpdateRewardInfosEvent */)
			st64(s200, i, 0x38)
			u = log_data(s200, 1)
			s = ld64(l) + 1
			st64(l, s)
			st64(a + 8, s)
			st64(a, 2)
			return u
		}
		raw_vec_handle_error(1, 0x100, 0x100160b20, 0x100 > h)
	}
	u = fn_88360(s210, 0x26)
	s = ld64(s210 + 8)
	t = ld64(s210)
	st64(l, ld64(l) + 1)
	st64(a + 8, s)
	st64(a, t)
	return u
}

export function fn_bce50(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10
	const j = fn_a80(s10, ld64(b), c)
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
