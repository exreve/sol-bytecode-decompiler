/// <reference path="../lib.d.ts" />
// instruction update_dynamic_fee_config
import { anchor_error_from, fn_88360, fn_a2c0, memcpy } from '../shared.ts'

// instruction handler: update_dynamic_fee_config (discriminator sha256("global:update_dynamic_fee_config")[..8] = 0xf084c70208500707)
// accounts [idl]: 0 owner [signer, = GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ], 1 dynamic_fee_config [mut]
// args [idl]: filter_period: u16, decay_period: u16, reduction_factor: u16, dynamic_fee_control: u32, max_volatility_accumulator: u32
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, filter_period, decay_period, reduction_factor, dynamic_fee_control, max_volatility_accumulator
export function ix_update_dynamic_fee_config(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s48 = fp - 0x48, s60 = fp - 0x60, s66 = fp - 0x66, s70 = fp - 0x70, sa8 = fp - 0xa8, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s100 = fp - 0x100
	let l, o: u64
	const i = sol_log("Instruction: UpdateDynamicFeeConfig", 0x23)
	const f = ix_args_len
	if (f >= 2 && ((f & -2) != 2 && ((f & -2) != 4 && (f - 6 >= 4 && f - 0xa >= 4)))) {
		const args: UpdateDynamicFeeConfigArgs = ix_args
		const filter_period = args.filter_period
		const decay_period = args.decay_period
		const reduction_factor = args.reduction_factor
		const dynamic_fee_control = args.dynamic_fee_control
		const max_volatility_accumulator = args.max_volatility_accumulator
		st64(sd0, accounts, accounts_len)
		o = fn_d68d8(s60, dynamic_fee_control, sd0, undef, fp, i)
		let k = ld64(s60 + 0x10)
		l = ld64(s60 + 8)
		const j = ld64(s60)
		if (j == 0) {
			st64(a + 8, k)
			st64(a, l)
			return o
		}
		memcpy(sa8, s48, 0x48)
		st64(sc0, j, l, k)
		if (filter_period != 0 && (decay_period > filter_period && (0x270e >= ((reduction_factor - 1) as u16) && (0x1869e >= ((dynamic_fee_control - 1) as u32) && 0x418937 >= max_volatility_accumulator)))) {
			st16(s66, filter_period, decay_period, reduction_factor)
			st32(s70, dynamic_fee_control, max_volatility_accumulator)
			o = fn_d7288(sf0, sc0, program_id)
			l = ld64(sf0)
			st64(a + 8, ld64(sf0 + 8))
			st64(a, l)
			return o
		}
		o = fn_88360(se0, 0x2c)
		k = ld64(se0 + 8)
		l = ld64(se0)
		if (l == 2) {
			o = fn_d7288(sf0, sc0, program_id)
			l = ld64(sf0)
			st64(a + 8, ld64(sf0 + 8))
			st64(a, l)
			return o
		}
		st64(a + 8, k)
		st64(a, l)
		return o
	}
	const m = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (m & 3) - 2) {
		o = anchor_error_from(s100, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s100)
		st64(a + 8, ld64(s100 + 8))
		st64(a, l)
		return o
	}
	if ((m & 3) == 0) {
		o = anchor_error_from(s100, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s100)
		st64(a + 8, ld64(s100 + 8))
		st64(a, l)
		return o
	}
	const n = ld64(ld64(m + 7))
	if (n == 0) {
		o = anchor_error_from(s100, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s100)
		st64(a + 8, ld64(s100 + 8))
		st64(a, l)
		return o
	}
	callx(n, ld64(m - 1), n)
	o = anchor_error_from(s100, 0x66 /* anchor::InstructionDidNotDeserialize */)
	l = ld64(s100)
	st64(a + 8, ld64(s100 + 8))
	st64(a, l)
	return o
}

export function fn_d68d8(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s60 = fp - 0x60, s98 = fp - 0x98, sa0 = fp - 0xa0, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf0 = fp - 0xf0
	let r: u64
	let aa = try_accounts_17a30(sb8, c, c, d, e, r0)
	const i = ld64(sb8 + 8)
	let f = ld64(sb8)
	if (f != 2) {
		const q = ld64(0x300000000 /* heap bump-allocator cursor */)
		r = 5 > q
		const n = r != 0 ? 0 : q - 5
		const s = q != 0 ? n : 0x300007ffb
		if ((f & 1) != 0) {
			if (0x300000008 > s) {
				raw_vec_handle_error(1, 5, 0x10015f8f8, n, r)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, s)
			st8(s + 4, 0x72)
			st32(s, 0x656e776f)
			void ld64(i)
		} else {
			if (0x300000008 > s) {
				raw_vec_handle_error(1, 5, 0x10015f8f8, n, r)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, s)
			st8(s + 4, 0x72)
			st32(s, 0x656e776f)
			void ld64(i)
		}
		st64(i + 0x10, s, 5)
		st64(i + 8, 5)
		st64(i, 1)
		st64(a + 0x10, i)
		st64(a + 8, f)
		st64(a, 0)
		return aa
	}
	aa = try_accounts_187b8(sb8, c)
	const v = ld64(sb8 + 0x10)
	let h = ld64(sb8 + 8)
	const g = ld64(sb8)
	if (g == 0) {
		const t = ld64(0x300000000 /* heap bump-allocator cursor */)
		const u = t != 0 ? sat_sub(t, 0x12) : 0x300007fee
		if ((h & 1) != 0) {
			if (0x300000008 > u) {
				raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x12 > t, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, u)
			st64(u + 8, 0x666e6f635f656566)
			st64(u, 0x5f63696d616e7964)
			st16(u + 0x10, 0x6769)
			void ld64(v)
		} else {
			if (0x300000008 > u) {
				raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x12 > t, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, u)
			st64(u + 8, 0x666e6f635f656566)
			st64(u, 0x5f63696d616e7964)
			st16(u + 0x10, 0x6769)
			void ld64(v)
		}
		st64(v + 0x10, u, 0x12)
		st64(v + 8, 0x12)
		st64(v, 1)
		st64(a + 0x10, v)
		st64(a + 8, h)
		st64(a, 0)
		return aa
	}
	st64(sf0, h)
	memcpy(s60, sa0, 0x40)
	const j = ld64(i)
	copyr(s20, j, 0x20)
	if ((memcmp(s20, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) == 0) {
		if (ld8(g + 0x29) != 0) {
			aa = memcpy(a + 0x20, s60, 0x40)
			st64(a + 0x18, v)
			st64(a + 0x10, ld64(sf0))
			st64(a + 8, g)
			st64(a, i)
			return aa
		}
		aa = anchor_error_from(se8, 0x7d0 /* anchor::ConstraintMut */)
		h = undef
		const w = ld64(0x300000000 /* heap bump-allocator cursor */)
		const y = w != 0 ? sat_sub(w, 0x12) : 0x300007fee
		const z = ld64(se8 + 8)
		const x = ld64(se8)
		if ((x & 1) != 0) {
			if (0x300000008 > y) {
				raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, y)
			st64(y + 8, 0x666e6f635f656566)
			st64(y, 0x5f63696d616e7964)
			st16(y + 0x10, 0x6769)
			void ld64(z)
		} else {
			if (0x300000008 > y) {
				raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, y)
			st64(y + 8, 0x666e6f635f656566)
			st64(y, 0x5f63696d616e7964)
			st16(y + 0x10, 0x6769)
			void ld64(z)
		}
		st64(z + 0x10, y, 0x12)
		st64(z + 8, 0x12)
		st64(z, 1)
		st64(a + 0x10, z)
		st64(a + 8, x)
		st64(a, 0)
		return aa
	}
	const p = fn_88360(sc8, 0)
	r = undef
	const k = ld64(0x300000000 /* heap bump-allocator cursor */)
	const m = k != 0 ? sat_sub(k, 5) : 0x300007ffb
	const o = ld64(sc8 + 8)
	const l = ld64(sc8)
	if ((l & 1) != 0) {
		if (0x300000008 > m) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, 0x300000008, r)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, m)
		st8(m + 4, 0x72)
		st32(m, 0x656e776f)
		void ld64(o)
	} else {
		if (0x300000008 > m) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, 0x300000008, r)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, m)
		st8(m + 4, 0x72)
		st32(m, 0x656e776f)
		void ld64(o)
	}
	st64(o + 0x10, m, 5)
	st64(o + 8, 5)
	st64(o, 1)
	copyr(sb8, s20, 0x20)
	st64(s98, 0xa6bd3bcb652bb6e5, 0x648eee6fe68868f5, 0xb1880f9c196055dc, 0xa18a9e05bd73e21f) // key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ
	aa = Error_with_pubkeys(sd8, l, o, sb8, p)
	f = ld64(sd8)
	st64(a + 0x10, ld64(sd8 + 8))
	st64(a + 8, f)
	st64(a, 0)
	return aa
}

export function fn_d7288(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10
	const j = fn_a2c0(s10, b + 8, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
	let i = undef
	const f = ld64(s10)
	if (f == 2) {
		st64(a + 8, i)
		st64(a, f)
		return j
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0x12) : 0x300007fee
	i = ld64(s10 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008, 0x12 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 8, 0x666e6f635f656566)
		st64(h, 0x5f63696d616e7964)
		st16(h + 0x10, 0x6769)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008, 0x12 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 8, 0x666e6f635f656566)
		st64(h, 0x5f63696d616e7964)
		st16(h + 0x10, 0x6769)
		void ld64(i)
	}
	st64(i + 0x10, h, 0x12)
	st64(i + 8, 0x12)
	st64(i, 1)
	st64(a + 8, i)
	st64(a, f)
	return j
}
