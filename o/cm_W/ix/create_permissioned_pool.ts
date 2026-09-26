/// <reference path="../lib.d.ts" />
// instruction create_permissioned_pool
import { anchor_error_from, fn_10fb10, fn_13e5a0, fn_13e628, fn_1476d8, fn_147a20, fn_14ed60, fn_154e18, fn_4130, fn_4688, fn_6490, fn_65410, fn_66e8, fn_6940, fn_697e0, fn_6a7e8, fn_6fe30, fn_7e058, fn_7e560, fn_81db0, fn_85138, fn_88558, fn_8a8, fn_a80, fn_c58, fn_ded0, fn_f75f0, log_data, memcpy, memset2 } from '../shared.ts'

// instruction handler: create_permissioned_pool (discriminator sha256("global:create_permissioned_pool")[..8] = 0xe535ef2a23b3f324)
// accounts [idl]: 0 payer [signer, mut], 1 pool_creator, 2 permission [pda], 3 amm_config, 4 pool_state [mut, pda], 5 token_mint_0, 6 token_mint_1, 7 token_vault_0 [mut, pda], 8 token_vault_1 [mut, pda], 9 observation_state [mut, pda], 10 tick_array_bitmap [mut, pda], 11 token_program_0, 12 token_program_1, 13 system_program [= 11111111111111111111111111111111], 14 rent [= SysvarRent111111111111111111111111111111111]
// args [idl]: customizable_params: CreateCustomizableParams, seed_index: u16
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
export function ix_create_permissioned_pool(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s1a8 = fp - 0x1a8, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s348 = fp - 0x348, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0
	let m, q, r, s, t: u64
	const h = sol_log("Instruction: CreatePermissionedPool", 0x23)
	const f = ix_args_len
	st64(s360 + 8, f)
	const g = ix_args
	st64(s360, g)
	fn_f75f0(s1c0, s360, h)
	let j = ld64(s1c0)
	const i = ld8(s1b0 + 1)
	if (i != 2) {
		st8(s370 + 8, ld8(s1b0))
		st64(s370, ld64(s1c0 + 8))
		st32(s8, ld32(s1b0 + 2))
		st16(s8 + 4, ld16(s1b0 + 6))
		if (ld64(s360 + 8) >= 2) {
			const u = ld16(ld64(s360))
			st64(s20 + 8, ld64(s370))
			st8(s20 + 0x10, ld8(s370 + 8))
			st32(s20 + 0x12, ld32(s8))
			st16(s20 + 0x16, ld16(s8 + 4))
			st8(s20 + 0x11, i)
			st32(s20, j, j >> 0x20)
			st16(s8 + 4, -1)
			st32(s8, -1)
			st64(s370, accounts, accounts_len)
			t = accounts_create_permissioned_pool(s1c0, program_id, s370, g, f, s8, j)
			const l = ld64(s1b0)
			m = ld64(s1c0 + 8)
			const k = ld64(s1c0)
			if (k == 0) {
				st64(a + 8, l)
				st64(a, m)
				return t
			}
			const n = memcpy(s348, s1a8, 0x188)
			st64(s360, k, m, l)
			st32(s1a8 + 8, ld32(s8))
			st16(s1a8 + 0xc, ld16(s8 + 4))
			copyr(s1b0, s370, 0x10)
			st64(s1c0, program_id, s360)
			t = fn_569a8(s380, s1c0, s20, u, undef, n)
			m = ld64(s380)
			if (m == 2) {
				t = fn_100310(s390, s360, program_id)
				m = ld64(s390)
				st64(a + 8, ld64(s390 + 8))
				st64(a, m)
				return t
			}
			st64(a + 8, ld64(s380 + 8))
			st64(a, m)
			return t
		}
		j = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	}
	const o = j
	if (2 > (j & 3) - 2) {
		t = anchor_error_from(s3a0, 0x66 /* anchor::InstructionDidNotDeserialize */, q, r, s)
		m = ld64(s3a0)
		st64(a + 8, ld64(s3a0 + 8))
		st64(a, m)
		return t
	}
	if ((o & 3) == 0) {
		t = anchor_error_from(s3a0, 0x66 /* anchor::InstructionDidNotDeserialize */, q, r, s)
		m = ld64(s3a0)
		st64(a + 8, ld64(s3a0 + 8))
		st64(a, m)
		return t
	}
	const p = ld64(ld64(j + 7))
	if (p == 0) {
		t = anchor_error_from(s3a0, 0x66 /* anchor::InstructionDidNotDeserialize */, q, r, s)
		m = ld64(s3a0)
		st64(a + 8, ld64(s3a0 + 8))
		st64(a, m)
		return t
	}
	callx(p, ld64(j - 1), p)
	t = anchor_error_from(s3a0, 0x66 /* anchor::InstructionDidNotDeserialize */)
	m = ld64(s3a0)
	st64(a + 8, ld64(s3a0 + 8))
	st64(a, m)
	return t
}

// Anchor Accounts::try_accounts of instruction create_permissioned_pool (called by ix_create_permissioned_pool; name [str]: from the handler's "Instruction: …" log; was fn_f7880)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_mint_0 (ConstraintRaw), token_mint_1, token_vault_0 (AccountNotEnoughKeys, ConstraintSeeds, ConstraintMut), token_vault_1 (AccountNotEnoughKeys, ConstraintSeeds, ConstraintMut), token_program_0, token_program_1, system_program, rent, permission (ConstraintSeeds), payer (ConstraintMut), tick_array_bitmap (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), observation_state (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), pool_state (ConstraintSeeds, ConstraintMut, ConstraintRentExempt)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: token_mint_1_box, token_mint_1_box_2, pool_state [idl], payer [idl]
export function accounts_create_permissioned_pool(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s80 = fp - 0x80, sa0 = fp - 0xa0, sc0 = fp - 0xc0, se0 = fp - 0xe0, s100 = fp - 0x100, s130 = fp - 0x130, s150 = fp - 0x150, s151 = fp - 0x151, s178 = fp - 0x178, s190 = fp - 0x190, s1b0 = fp - 0x1b0, s1d0 = fp - 0x1d0, s1d1 = fp - 0x1d1, s1f8 = fp - 0x1f8, s210 = fp - 0x210, s228 = fp - 0x228, s230 = fp - 0x230, s250 = fp - 0x250, s270 = fp - 0x270, s271 = fp - 0x271, s298 = fp - 0x298, s2b0 = fp - 0x2b0, s2c8 = fp - 0x2c8, s2d0 = fp - 0x2d0, s2d8 = fp - 0x2d8, s2e0 = fp - 0x2e0, s2e8 = fp - 0x2e8, s3e8 = fp - 0x3e8, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s500 = fp - 0x500, s508 = fp - 0x508, s50a = fp - 0x50a, s520 = fp - 0x520, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s598 = fp - 0x598, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s5c8 = fp - 0x5c8, s5d8 = fp - 0x5d8, s5e8 = fp - 0x5e8, s5f8 = fp - 0x5f8, s608 = fp - 0x608, s618 = fp - 0x618, s628 = fp - 0x628, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s668 = fp - 0x668, s678 = fp - 0x678, s688 = fp - 0x688, s698 = fp - 0x698, s6a8 = fp - 0x6a8, s6b8 = fp - 0x6b8, s6c8 = fp - 0x6c8, s6d8 = fp - 0x6d8, s6e8 = fp - 0x6e8, s6f8 = fp - 0x6f8, s708 = fp - 0x708, s718 = fp - 0x718, s728 = fp - 0x728, s738 = fp - 0x738, s748 = fp - 0x748, s758 = fp - 0x758, s768 = fp - 0x768, s778 = fp - 0x778, s788 = fp - 0x788, s798 = fp - 0x798, s7a8 = fp - 0x7a8, s7b8 = fp - 0x7b8, s7c8 = fp - 0x7c8, s7d8 = fp - 0x7d8, s7e8 = fp - 0x7e8, s7f8 = fp - 0x7f8, s808 = fp - 0x808, s818 = fp - 0x818, s828 = fp - 0x828, s838 = fp - 0x838, s848 = fp - 0x848, s858 = fp - 0x858, s868 = fp - 0x868, s878 = fp - 0x878, s888 = fp - 0x888, s898 = fp - 0x898, s8a8 = fp - 0x8a8, s8b8 = fp - 0x8b8, s8c8 = fp - 0x8c8, s8d8 = fp - 0x8d8, s8e8 = fp - 0x8e8, s8f8 = fp - 0x8f8, s920 = fp - 0x920, s960 = fp - 0x960, s988 = fp - 0x988, s990 = fp - 0x990, s998 = fp - 0x998, s9a0 = fp - 0x9a0
	let g, j, k, l, n, o, u, v, w, ao, ap, aq, au, av, aw, ay, bc, bd, bf, bg, bi, bj, cg, ch: u64
	let token_mint_1_box: Mint
	st64(s528, b, d, p5)
	const r = fn_f75f0(s500, s520, r0)
	if (ld8(s4f8 + 9) == 2) {
		g = ld64(s500)
	} else {
		const f = ld64(s520 + 8)
		if (f >= 2) {
			st64(s920 + 0x20, p6)
			const p = ld64(s520)
			const q = ld16(p)
			st64(s520, p + 2, f - 2)
			st16(s50a, q)
			o = try_accounts_17a30(s500, c, j, k, l, r)
			const payer: AccountInfo = ld64(s4f8)
			n = ld64(s500)
			if (n == 2) {
				st64(s508, payer)
				const t = ld64(c + 8)
				if (t == 0) {
					anchor_error_from(s538, 0xbbd /* anchor::AccountNotEnoughKeys */, u, v, w)
					o = ld64(s538 + 8)
					n = ld64(s538)
					if (n != 2) {
						const ad = ld64(0x300000000 /* heap bump-allocator cursor */)
						const ae = ad != 0 ? sat_sub(ad, 0xc) : 0x300007ff4
						if ((n & 1) != 0) {
							if (0x300000008 > ae) {
								raw_vec_handle_error(1, 0xc, 0x10015f8f8, sat_sub(ad, 0xc), 0xc > ad)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, ae)
							st64(ae, 0x6572635f6c6f6f70)
							st32(ae + 8, 0x726f7461)
							void ld64(o)
						} else {
							if (0x300000008 > ae) {
								raw_vec_handle_error(1, 0xc, 0x10015f8f8, sat_sub(ad, 0xc), 0xc > ad)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, ae)
							st64(ae, 0x6572635f6c6f6f70)
							st32(ae + 8, 0x726f7461)
							void ld64(o)
						}
						st64(o + 0x10, ae, 0xc)
						st64(o + 8, 0xc)
						st64(o, 1)
						st64(a + 0x10, o)
						st64(a + 8, n)
						st64(a, 0)
						return o
					}
				} else {
					st64(c + 8, t - 1)
					o = ld64(c)
					st64(c, o + 0x30)
				}
				st64(s920 + 0x18, o)
				try_accounts_18700(s500, c, u, v, w)
				o = ld64(s4f8 + 8)
				let y = ld64(s4f8)
				const x = ld64(s500)
				if (x == 0) {
					const aj = ld64(0x300000000 /* heap bump-allocator cursor */)
					const ak = aj != 0 ? sat_sub(aj, 0xa) : 0x300007ff6
					if ((y & 1) != 0) {
						if (0x300000008 > ak) {
							raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > aj, y)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ak)
						st64(ak, 0x697373696d726570)
						st16(ak + 8, 0x6e6f)
						void ld64(o)
					} else {
						if (0x300000008 > ak) {
							raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > aj, y)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ak)
						st64(ak, 0x697373696d726570)
						st16(ak + 8, 0x6e6f)
						void ld64(o)
					}
					st64(o + 0x10, ak, 0xa)
					st64(o + 8, 0xa)
					st64(o, 1)
					st64(a + 0x10, o)
					st64(a + 8, y)
					st64(a, 0)
					return o
				}
				st64(s920, x, o, y)
				memcpy(s3e8, s4e8, 0x100)
				o = try_accounts_184d8(s500, c)
				y = undef
				if (ld64(s500) == 0) {
					const al = ld64(0x300000000 /* heap bump-allocator cursor */)
					n = ld64(s4f8)
					const am = al != 0 ? sat_sub(al, 0xa) : 0x300007ff6
					token_mint_1_box = ld64(s4f8 + 8)
					if (n != 0) {
						if (0x300000008 > am) {
							raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, y)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, am)
						st64(am, 0x666e6f635f6d6d61)
						st16(am + 8, 0x6769)
						void ld64(token_mint_1_box)
					} else {
						if (0x300000008 > am) {
							raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, y)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, am)
						st64(am, 0x666e6f635f6d6d61)
						st16(am + 8, 0x6769)
						void ld64(token_mint_1_box)
					}
					st64(token_mint_1_box.mint_authority + 0xc, am, 0xa)
					st64(token_mint_1_box.mint_authority + 4, 0xa)
					st64(token_mint_1_box, 1)
					st64(a + 0x10, token_mint_1_box)
					st64(a + 8, n)
					st64(a, 0)
					return o
				}
				const z = ld64(0x300000000 /* heap bump-allocator cursor */)
				const aa = z != 0 ? sat_sub(z, 0x78) : 0x300007f88
				if (0x300000008 > aa) {
					alloc_handle_alloc_error(8, 0x78)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, aa & -8)
				if ((aa & -8) != 0) {
					st64(s960 + 0x38, aa & -8)
					memcpy(aa & -8, s500, 0x78)
					const af = ld64(c + 8)
					if (af == 0) {
						o = anchor_error_from(s8e8, 0xbbd /* anchor::AccountNotEnoughKeys */)
						n = ld64(s8e8)
						st64(a + 0x10, ld64(s8e8 + 8))
						st64(a + 8, n)
						st64(a, 0)
						return o
					}
					const ag: AccountInfo = ld64(c)
					st64(s2e8, ag)
					st64(c + 8, af - 1)
					st64(s960 + 0x28, ag)
					st64(c, ag + 0x30)
					try_accounts_15c0(s500, c)
					if (ld32(s500) == 2) {
						o = fn_4130(s548, ld64(s4f8), ld64(s4f8 + 8), "token_mint_0", 0xc)
						st64(s960 + 0x30, ld64(s548 + 8))
						n = ld64(s548)
						if (n != 2) {
							st64(a + 0x10, ld64(s960 + 0x30))
							st64(a + 8, n)
							st64(a, 0)
							return o
						}
					} else {
						const ah = ld64(0x300000000 /* heap bump-allocator cursor */)
						const ai = ah != 0 ? sat_sub(ah, 0x80) : 0x300007f80
						if (0x300000008 > ai) {
							alloc_handle_alloc_error(8, 0x80)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ai & -8)
						if ((ai & -8) == 0) {
							alloc_handle_alloc_error(8, 0x80)
						}
						st64(s960 + 0x30, ai & -8)
						memcpy(ai & -8, s500, 0x80)
					}
					fn_7768(s500, c, ao, ap, aq)
					token_mint_1_box = ld64(s4f8)
					const ar = ld64(s500)
					if (ar != 2) {
						o = fn_4130(s558, ar, token_mint_1_box, "token_mint_1", 0xc)
						token_mint_1_box = ld64(s558 + 8)
						n = ld64(s558)
						if (n != 2) {
							st64(a + 0x10, token_mint_1_box)
							st64(a + 8, n)
							st64(a, 0)
							return o
						}
					}
					B63: {
						B54: {
							st64(s960 + 0x20, token_mint_1_box)
							const at = ld64(c + 8)
							if (at == 0) {
								anchor_error_from(s568, 0xbbd /* anchor::AccountNotEnoughKeys */, token_mint_1_box, av, aw)
								token_mint_1_box = ld64(s568 + 8)
								const az = ld64(s568)
								if (az == 2) {
									break B54
								}
								o = fn_4130(s578, az, token_mint_1_box, "token_vault_0", 0xd)
								token_mint_1_box = ld64(s578 + 8)
								n = ld64(s578)
								if (n != 2) {
									st64(a + 0x10, token_mint_1_box)
									st64(a + 8, n)
									st64(a, 0)
									return o
								}
								au = ld64(c + 8)
								if (au == 0) {
									break B54
								}
							} else {
								token_mint_1_box = ld64(c)
								st64(c, token_mint_1_box + 0x30)
								au = at - 1
								st64(c + 8, au)
								if (au == 0) {
									break B54
								}
							}
							st64(s960 + 0x18, token_mint_1_box)
							token_mint_1_box = ld64(c)
							st64(c, token_mint_1_box + 0x30)
							ay = au - 1
							st64(c + 8, ay)
							if (ay == 0) {
								o = anchor_error_from(s8d8, 0xbbd /* anchor::AccountNotEnoughKeys */, token_mint_1_box, av, aw)
								n = ld64(s8d8)
								st64(a + 0x10, ld64(s8d8 + 8))
								st64(a + 8, n)
								st64(a, 0)
								return o
							}
							break B63
						}
						st64(s960 + 0x18, token_mint_1_box)
						anchor_error_from(s588, 0xbbd /* anchor::AccountNotEnoughKeys */, token_mint_1_box, av, aw)
						token_mint_1_box = undef
						const ax = ld64(s588)
						if (ax == 2) {
							o = anchor_error_from(s8d8, 0xbbd /* anchor::AccountNotEnoughKeys */, token_mint_1_box, av, aw)
							n = ld64(s8d8)
							st64(a + 0x10, ld64(s8d8 + 8))
							st64(a + 8, n)
							st64(a, 0)
							return o
						}
						o = fn_4130(s598, ax, ld64(s588 + 8), "token_vault_1", 0xd)
						token_mint_1_box = ld64(s598 + 8)
						n = ld64(s598)
						if (n != 2) {
							st64(a + 0x10, token_mint_1_box)
							st64(a + 8, n)
							st64(a, 0)
							return o
						}
						ay = ld64(c + 8)
						if (ay == 0) {
							o = anchor_error_from(s8d8, 0xbbd /* anchor::AccountNotEnoughKeys */, token_mint_1_box, av, aw)
							n = ld64(s8d8)
							st64(a + 0x10, ld64(s8d8 + 8))
							st64(a + 8, n)
							st64(a, 0)
							return o
						}
					}
					const ba: AccountInfo = ld64(c)
					st64(s2e0, ba)
					st64(c + 8, ay - 1)
					st64(c, ba + 0x30)
					if (ay != 1) {
						st64(s960, token_mint_1_box, ba + 0x30)
						st64(s2d8, ba + 0x30)
						st64(c + 8, ay - 2)
						st64(s960 + 0x10, ba)
						st64(c, ba + 0x60)
						try_accounts_120(s500, c, token_mint_1_box, ba + 0x30, ba)
						token_mint_1_box = ld64(s4f8)
						const bb = ld64(s500)
						if (bb != 2) {
							o = fn_4130(s5a8, bb, token_mint_1_box, "token_program_0", 0xf)
							token_mint_1_box = ld64(s5a8 + 8)
							n = ld64(s5a8)
							if (n != 2) {
								st64(a + 0x10, token_mint_1_box)
								st64(a + 8, n)
								st64(a, 0)
								return o
							}
						}
						st64(s988 + 0x20, token_mint_1_box)
						try_accounts_120(s500, c, token_mint_1_box, bc, bd)
						token_mint_1_box = ld64(s4f8)
						const be = ld64(s500)
						if (be != 2) {
							o = fn_4130(s5b8, be, token_mint_1_box, "token_program_1", 0xf)
							token_mint_1_box = ld64(s5b8 + 8)
							n = ld64(s5b8)
							if (n != 2) {
								st64(a + 0x10, token_mint_1_box)
								st64(a + 8, n)
								st64(a, 0)
								return o
							}
						}
						st64(s988 + 0x18, token_mint_1_box)
						try_accounts_18870(s500, c, token_mint_1_box, bf, bg)
						token_mint_1_box = ld64(s4f8)
						const bh = ld64(s500)
						if (bh != 2) {
							o = fn_4130(s5c8, bh, token_mint_1_box, "system_program", 0xe)
							token_mint_1_box = ld64(s5c8 + 8)
							n = ld64(s5c8)
							if (n != 2) {
								st64(a + 0x10, token_mint_1_box)
								st64(a + 8, n)
								st64(a, 0)
								return o
							}
						}
						st64(s988 + 0x10, token_mint_1_box)
						st64(s2d0, token_mint_1_box)
						try_accounts_17ae0(s500, c, token_mint_1_box, bi, bj)
						const bm = ld64(s4f8 + 8)
						const bl = ld64(s4f8)
						const bk = ld64(s500)
						if (bk == 0) {
							o = fn_4130(s8b8, bl, bm, 0x1001598f8 /* "rent" */, 4)
							n = ld64(s8b8)
							st64(a + 0x10, ld64(s8b8 + 8))
							st64(a + 8, n)
							st64(a, 0)
							return o
						}
						st64(s988, bk, bl)
						st64(s990, ld64(s4e8))
						rent_get(s500)
						copy(s2b0, s4f8, 0x18)
						if (ld64(s500) != 0) {
							o = fn_13e628(s8a8, s2b0)
							n = ld64(s8a8)
							st64(a + 0x10, ld64(s8a8 + 8))
							st64(a + 8, n)
							st64(a, 0)
							return o
						}
						st64(s998, bm)
						copyr(s2c8, s2b0, 0x18)
						const bn = ld64(ld64(ld64(s960 + 0x38)))
						copyr(s270, bn, 0x20)
						const bo = ld64(s960 + 0x30)
						st64(s960 + 0x30, bo)
						const bp = ld64(ld64(bo + 0x58))
						copyr(s60, bp, 0x20)
						const token_mint_1_box_2: Mint = ld64(s960 + 0x20)
						const br = token_mint_1_box_2.info.key
						copyr(s40, br, 0x20)
						st64(s500, 0x10015984c)
						st64(s4f8 + 8, s270)
						st64(s4e0, s60)
						st64(s4d0, s40)
						st64(s4d0 + 0x10, s228)
						st16(s228, q)
						st64(s4f8, 4)
						st64(s4e8, 0x20)
						st64(s4e0 + 8, 0x20)
						st64(s4d0 + 8, 0x20)
						st64(s4d0 + 0x18, 2)
						// PDA find_program_address(["pool", *bn, *bp, *br, u16 q [ix data?]], program *(ld64(s528)))
						Pubkey_find_program_address(s130, s500, 5, ld64(s528))
						copyr(s298, s130, 0x20)
						const bs = ld8(s130 + 0x20)
						st8(s271, bs)
						st8(ld64(s920 + 0x20) + 1, bs)
						const bt = ld64(ld64(s960 + 0x28) /* key */)
						copyr(s250, bt, 0x20)
						if ((memcmp(s250, s298, 0x20) as u32) == 0) {
							st64(s4d0, token_mint_1_box_2, s50a, s271, s528)
							st64(s4e0 + 8, ld64(s960 + 0x30))
							st64(s4e0, ld64(s960 + 0x38))
							st64(s500, s2e8, s2c8, s508, s2d0)
							o = fn_fb208(s130, s500)
							const pool_state: AccountInfo = ld64(s130 + 8)
							n = ld64(s130)
							if (n == 2) {
								st64(s230, pool_state)
								if (pool_state.is_writable != 0) {
									AccountInfo_clone_f338(s130, pool_state)
									st64(s960 + 0x28, fn_147a20(s130))
									AccountInfo_clone_f338(s500, ld64(s230))
									AccountInfo_try_data_len(s40, s500)
									const by = ld64(s40 + 8)
									const bx = ld64(s40)
									if (bx == 0x800000000000001a /* Ok */) {
										const bz = Rent_is_exempt(s2c8, ld64(s960 + 0x28), by)
										ptr_drop_in_place_fcd8(s130, ptr_drop_in_place_fcd8(s500, bz))
										if (bz != 0) {
											rent_get(s500)
											copy(s210, s4f8, 0x18)
											if (ld64(s500) != 0) {
												o = fn_13e628(s898, s210)
												n = ld64(s898)
												st64(a + 0x10, ld64(s898 + 8))
												st64(a + 8, n)
												st64(a, 0)
												return o
											}
											copyr(s228, s210, 0x18)
											const ca = pool_state.key
											copyr(s1d0, ca, 0x20)
											st64(s130, 0x10015afbf, 0xb, s1d0, 0x20)
											// PDA find_program_address(["observation", *ca], program *(ld64(s528)))
											Pubkey_find_program_address(s500, s130, 2, ld64(s528))
											copyr(s1f8, s500, 0x20)
											const cb = ld8(s4e0)
											st8(s1d1, cb)
											st8(ld64(s920 + 0x20) + 4, cb)
											const cc = ld64(ld64(s960 + 0x10) /* key */)
											copyr(s1b0, cc, 0x20)
											if ((memcmp(s1b0, s1f8, 0x20) as u32) == 0) {
												st64(s500, s2e0, s228, s508, s2d0, s230, s1d1, s528)
												o = fn_fcee0(s130, s500)
												st64(s960 + 0x28, ld64(s130 + 8))
												n = ld64(s130)
												if (n == 2) {
													if (ld8(ld64(s960 + 0x28) + 0x29 /* is_writable */) != 0) {
														AccountInfo_clone_f338(s130, ld64(s960 + 0x28))
														st64(s960 + 0x10, fn_147a20(s130))
														AccountInfo_clone_f338(s500, ld64(s960 + 0x28))
														AccountInfo_try_data_len(s40, s500)
														const cj = ld64(s40 + 8)
														const ci = ld64(s40)
														if (ci != 0x800000000000001a /* Ok */) {
															st64(s40 + 0x10, ld64(s40 + 0x10))
															st64(s40, ci, cj)
															ch = fn_13e628(s6a8, s40)
															cg = ld64(s6a8)
															st64(a + 0x10, ld64(s6a8 + 8))
															st64(a + 8, cg)
															st64(a, 0)
															return ptr_drop_in_place_fcd8(s130, ptr_drop_in_place_fcd8(s500, ch))
														}
														const ck = Rent_is_exempt(s228, ld64(s960 + 0x10), cj)
														ptr_drop_in_place_fcd8(s130, ptr_drop_in_place_fcd8(s500, ck))
														if (ck != 0) {
															rent_get(s500)
															copy(s190, s4f8, 0x18)
															if (ld64(s500) != 0) {
																o = fn_13e628(s888, s190)
																n = ld64(s888)
																st64(a + 0x10, ld64(s888 + 8))
																st64(a + 8, n)
																st64(a, 0)
																return o
															}
															copyr(s270, s190, 0x18)
															st64(s40 + 0x10, s130)
															st64(s40, 0x1001595c0)
															copyr(s130, s1d0, 0x20)
															st64(s40 + 0x18, 0x20)
															st64(s40 + 8, 0x20)
															// PDA find_program_address(["pool_tick_array_bitmap_extension", *s130], program *(ld64(s528)))
															Pubkey_find_program_address(s500, s40, 2, ld64(s528))
															copyr(s178, s500, 0x20)
															const cl = ld8(s4e0)
															st8(s151, cl)
															st8(ld64(s920 + 0x20) + 5, cl)
															const cm = ld64(ld64(s960 + 8))
															copyr(s150, cm, 0x20)
															if ((memcmp(s150, s178, 0x20) as u32) == 0) {
																st64(s500, s2d8, s270, s508, s2d0, s230, s151, s528)
																o = fn_fe8f8(s130, s500)
																st64(s960 + 0x10, ld64(s130 + 8))
																n = ld64(s130)
																if (n == 2) {
																	if (ld8(ld64(s960 + 0x10) + 0x29 /* is_writable */) != 0) {
																		AccountInfo_clone_f338(s130, ld64(s960 + 0x10))
																		st64(s960 + 8, fn_147a20(s130))
																		AccountInfo_clone_f338(s500, ld64(s960 + 0x10))
																		AccountInfo_try_data_len(s40, s500)
																		const cr = ld64(s40 + 8)
																		const cq = ld64(s40)
																		if (cq != 0x800000000000001a /* Ok */) {
																			st64(s40 + 0x10, ld64(s40 + 0x10))
																			st64(s40, cq, cr)
																			ch = fn_13e628(s728, s40)
																			cg = ld64(s728)
																			st64(a + 0x10, ld64(s728 + 8))
																			st64(a + 8, cg)
																			st64(a, 0)
																			return ptr_drop_in_place_fcd8(s130, ptr_drop_in_place_fcd8(s500, ch))
																		}
																		const cs = Rent_is_exempt(s270, ld64(s960 + 8), cr)
																		ptr_drop_in_place_fcd8(s130, ptr_drop_in_place_fcd8(s500, cs))
																		if (cs != 0) {
																			if (payer.is_writable != 0) {
																				const ct = payer.key
																				copyr(s130, ct, 0x20)
																				st64(s40, 0x10015b308, 0xa, s130, 0x20)
																				// PDA find_program_address(["permission", *ct], program *(ld64(s528)))
																				Pubkey_find_program_address(s500, s40, 2, ld64(s528))
																				copyr(s100, s500, 0x20)
																				st8(ld64(s920 + 0x20), ld8(s4e0))
																				const cu = ld64(ld64(s920))
																				copyr(se0, cu, 0x20)
																				if ((memcmp(se0, s100, 0x20) as u32) != 0) {
																					anchor_error_from(s778, 0x7d6 /* anchor::ConstraintSeeds */)
																					const dd = fn_4130(s788, ld64(s778), ld64(s778 + 8), 0x10015b308 /* "permission" */, 0xa)
																					const dc = ld64(s788 + 8)
																					const db = ld64(s788)
																					copyr(s500, se0, 0x20)
																					copy(s4e0, s100, 0x20)
																					o = Error_with_pubkeys(s798, db, dc, s500, dd)
																					n = ld64(s798)
																					st64(a + 0x10, ld64(s798 + 8))
																					st64(a + 8, n)
																					st64(a, 0)
																					return o
																				}
																				const cv = ld64(ld64(s960 + 0x30) + 0x58)
																				st64(s960 + 8, cv)
																				const cw = ld64(cv)
																				copyr(s130, cw, 0x20)
																				const cx = ld64(ld64(s960 + 0x20) + 0x58)
																				st64(s9a0, cx)
																				const cy = ld64(cx)
																				copyr(s500, cy, 0x20)
																				if ((memcmp(s130, s500, 0x20) as i32) < 0) {
																					const cz = ld64(ld64(s988 + 0x20))
																					copyr(s500, cz, 0x20)
																					if ((memcmp(ld64(ld64(s960 + 8) + 0x18), s500, 0x20) as u32) != 0) {
																						o = anchor_error_from(s7c8, 0x7e6 /* anchor::ConstraintMintTokenProgram */)
																						n = ld64(s7c8)
																						st64(a + 0x10, ld64(s7c8 + 8))
																						st64(a + 8, n)
																						st64(a, 0)
																						return o
																					}
																					const da = ld64(ld64(s988 + 0x18))
																					copyr(s500, da, 0x20)
																					if ((memcmp(ld64(ld64(s9a0) + 0x18), s500, 0x20) as u32) == 0) {
																						copyr(s60, s1d0, 0x20)
																						copyr(s40, cw, 0x20)
																						st64(s500, 0x100159d89, 0xa, s60, 0x20, s40, 0x20)
																						// PDA find_program_address(["pool_vault", *s60, *cw], program *(ld64(s528)))
																						Pubkey_find_program_address(s130, s500, 3, ld64(s528))
																						copyr(sc0, s130, 0x20)
																						st8(ld64(s920 + 0x20) + 2, ld8(s130 + 0x20))
																						const de = ld64(ld64(s960 + 0x18) /* key */)
																						copyr(sa0, de, 0x20)
																						if ((memcmp(sa0, sc0, 0x20) as u32) == 0) {
																							if (ld8(ld64(s960 + 0x18) + 0x29 /* is_writable */) != 0) {
																								copyr(s60, s1d0, 0x20)
																								const di = ld64(ld64(ld64(s960 + 0x20) + 0x58))
																								const dm = ld64(di)
																								const dl = ld64(di + 8)
																								const dk = ld64(di + 0x10)
																								const dj = ld64(di + 0x18)
																								st64(s500, 0x100159d89)
																								st64(s4f8 + 8, s60)
																								st64(s4e0, s40)
																								st64(s40, dm, dl, dk, dj)
																								st64(s4f8, 0xa)
																								st64(s4e8, 0x20)
																								st64(s4e0 + 8, 0x20)
																								// PDA find_program_address(["pool_vault", *s60, *s40], program *(ld64(s528)))
																								Pubkey_find_program_address(s130, s500, 3, ld64(s528))
																								copyr(s80, s130, 0x20)
																								st8(ld64(s920 + 0x20) + 3, ld8(s130 + 0x20))
																								const dn = ld64(ld64(s960) /* key */)
																								copyr(s20, dn, 0x20)
																								if ((memcmp(s20, s80, 0x20) as u32) != 0) {
																									anchor_error_from(s838, 0x7d6 /* anchor::ConstraintSeeds */)
																									const dr = fn_4130(s848, ld64(s838), ld64(s838 + 8), "token_vault_1", 0xd)
																									const dq = ld64(s848 + 8)
																									const dp = ld64(s848)
																									copyr(s500, s20, 0x20)
																									copy(s4e0, s80, 0x20)
																									o = Error_with_pubkeys(s858, dp, dq, s500, dr)
																									n = ld64(s858)
																									st64(a + 0x10, ld64(s858 + 8))
																									st64(a + 8, n)
																									st64(a, 0)
																									return o
																								}
																								if (ld8(ld64(s960) + 0x29 /* is_writable */) != 0) {
																									o = memcpy(a + 0x28, s3e8, 0x100)
																									st64(a + 0x198, ld64(s990))
																									st64(a + 0x190, ld64(s998))
																									st64(a + 0x188, ld64(s988 + 8))
																									st64(a + 0x180, ld64(s988))
																									st64(a + 0x178, ld64(s988 + 0x10))
																									st64(a + 0x170, ld64(s988 + 0x18))
																									st64(a + 0x168, ld64(s988 + 0x20))
																									st64(a + 0x160, ld64(s960 + 0x10))
																									st64(a + 0x158, ld64(s960 + 0x28))
																									st64(a + 0x150, ld64(s960))
																									st64(a + 0x148, ld64(s960 + 0x18))
																									st64(a + 0x140, ld64(s960 + 0x20))
																									st64(a + 0x138, ld64(s960 + 0x30))
																									st64(a + 0x130, pool_state)
																									st64(a + 0x128, ld64(s960 + 0x38))
																									st64(a + 0x20, ld64(s920 + 8))
																									st64(a + 0x18, ld64(s920 + 0x10))
																									st64(a + 0x10, ld64(s920))
																									st64(a + 8, ld64(s920 + 0x18))
																									st64(a, payer)
																									return o
																								}
																								anchor_error_from(s868, 0x7d0 /* anchor::ConstraintMut */)
																								o = fn_4130(s878, ld64(s868), ld64(s868 + 8), "token_vault_1", 0xd)
																								n = ld64(s878)
																								st64(a + 0x10, ld64(s878 + 8))
																								st64(a + 8, n)
																								st64(a, 0)
																								return o
																							}
																							anchor_error_from(s818, 0x7d0 /* anchor::ConstraintMut */)
																							o = fn_4130(s828, ld64(s818), ld64(s818 + 8), "token_vault_0", 0xd)
																							n = ld64(s828)
																							st64(a + 0x10, ld64(s828 + 8))
																							st64(a + 8, n)
																							st64(a, 0)
																							return o
																						}
																						anchor_error_from(s7e8, 0x7d6 /* anchor::ConstraintSeeds */)
																						const dh = fn_4130(s7f8, ld64(s7e8), ld64(s7e8 + 8), "token_vault_0", 0xd)
																						const dg = ld64(s7f8 + 8)
																						const df = ld64(s7f8)
																						copyr(s500, sa0, 0x20)
																						copy(s4e0, sc0, 0x20)
																						o = Error_with_pubkeys(s808, df, dg, s500, dh)
																						n = ld64(s808)
																						st64(a + 0x10, ld64(s808 + 8))
																						st64(a + 8, n)
																						st64(a, 0)
																						return o
																					}
																					o = anchor_error_from(s7d8, 0x7e6 /* anchor::ConstraintMintTokenProgram */)
																					n = ld64(s7d8)
																					st64(a + 0x10, ld64(s7d8 + 8))
																					st64(a + 8, n)
																					st64(a, 0)
																					return o
																				}
																				anchor_error_from(s7a8, 0x7d3 /* anchor::ConstraintRaw */)
																				o = fn_4130(s7b8, ld64(s7a8), ld64(s7a8 + 8), "token_mint_0", 0xc)
																				n = ld64(s7b8)
																				st64(a + 0x10, ld64(s7b8 + 8))
																				st64(a + 8, n)
																				st64(a, 0)
																				return o
																			}
																			anchor_error_from(s758, 0x7d0 /* anchor::ConstraintMut */)
																			o = fn_4130(s768, ld64(s758), ld64(s758 + 8), "payer", 5)
																			n = ld64(s768)
																			st64(a + 0x10, ld64(s768 + 8))
																			st64(a + 8, n)
																			st64(a, 0)
																			return o
																		}
																		anchor_error_from(s738, 0x7d5 /* anchor::ConstraintRentExempt */)
																		o = fn_4130(s748, ld64(s738), ld64(s738 + 8), 0x10015afdb /* "tick_array_bitmap" */, 0x11)
																		n = ld64(s748)
																		st64(a + 0x10, ld64(s748 + 8))
																		st64(a + 8, n)
																		st64(a, 0)
																		return o
																	}
																	anchor_error_from(s708, 0x7d0 /* anchor::ConstraintMut */)
																	o = fn_4130(s718, ld64(s708), ld64(s708 + 8), 0x10015afdb /* "tick_array_bitmap" */, 0x11)
																	n = ld64(s718)
																	st64(a + 0x10, ld64(s718 + 8))
																	st64(a + 8, n)
																	st64(a, 0)
																	return o
																}
																st64(a + 0x10, ld64(s960 + 0x10))
																st64(a + 8, n)
																st64(a, 0)
																return o
															}
															anchor_error_from(s6d8, 0x7d6 /* anchor::ConstraintSeeds */)
															const cp = fn_4130(s6e8, ld64(s6d8), ld64(s6d8 + 8), 0x10015afdb /* "tick_array_bitmap" */, 0x11)
															const co = ld64(s6e8 + 8)
															const cn = ld64(s6e8)
															copyr(s500, s150, 0x20)
															copy(s4e0, s178, 0x20)
															o = Error_with_pubkeys(s6f8, cn, co, s500, cp)
															n = ld64(s6f8)
															st64(a + 0x10, ld64(s6f8 + 8))
															st64(a + 8, n)
															st64(a, 0)
															return o
														}
														anchor_error_from(s6b8, 0x7d5 /* anchor::ConstraintRentExempt */)
														o = fn_4130(s6c8, ld64(s6b8), ld64(s6b8 + 8), "observation_state", 0x11)
														n = ld64(s6c8)
														st64(a + 0x10, ld64(s6c8 + 8))
														st64(a + 8, n)
														st64(a, 0)
														return o
													}
													anchor_error_from(s688, 0x7d0 /* anchor::ConstraintMut */)
													o = fn_4130(s698, ld64(s688), ld64(s688 + 8), "observation_state", 0x11)
													n = ld64(s698)
													st64(a + 0x10, ld64(s698 + 8))
													st64(a + 8, n)
													st64(a, 0)
													return o
												}
												st64(a + 0x10, ld64(s960 + 0x28))
												st64(a + 8, n)
												st64(a, 0)
												return o
											}
											anchor_error_from(s658, 0x7d6 /* anchor::ConstraintSeeds */)
											const cf = fn_4130(s668, ld64(s658), ld64(s658 + 8), "observation_state", 0x11)
											const ce = ld64(s668 + 8)
											const cd = ld64(s668)
											copyr(s500, s1b0, 0x20)
											copy(s4e0, s1f8, 0x20)
											o = Error_with_pubkeys(s678, cd, ce, s500, cf)
											n = ld64(s678)
											st64(a + 0x10, ld64(s678 + 8))
											st64(a + 8, n)
											st64(a, 0)
											return o
										}
										anchor_error_from(s638, 0x7d5 /* anchor::ConstraintRentExempt */)
										o = fn_4130(s648, ld64(s638), ld64(s638 + 8), "pool_state", 0xa)
										n = ld64(s648)
										st64(a + 0x10, ld64(s648 + 8))
										st64(a + 8, n)
										st64(a, 0)
										return o
									}
									st64(s40 + 0x10, ld64(s40 + 0x10))
									st64(s40, bx, by)
									ch = fn_13e628(s628, s40)
									cg = ld64(s628)
									st64(a + 0x10, ld64(s628 + 8))
									st64(a + 8, cg)
									st64(a, 0)
									return ptr_drop_in_place_fcd8(s130, ptr_drop_in_place_fcd8(s500, ch))
								}
								anchor_error_from(s608, 0x7d0 /* anchor::ConstraintMut */)
								o = fn_4130(s618, ld64(s608), ld64(s608 + 8), "pool_state", 0xa)
								n = ld64(s618)
								st64(a + 0x10, ld64(s618 + 8))
								st64(a + 8, n)
								st64(a, 0)
								return o
							}
							st64(a + 0x10, pool_state)
							st64(a + 8, n)
							st64(a, 0)
							return o
						}
						anchor_error_from(s5d8, 0x7d6 /* anchor::ConstraintSeeds */)
						const bw = fn_4130(s5e8, ld64(s5d8), ld64(s5d8 + 8), "pool_state", 0xa)
						const bv = ld64(s5e8 + 8)
						const bu = ld64(s5e8)
						copyr(s500, s250, 0x20)
						copy(s4e0, s298, 0x20)
						o = Error_with_pubkeys(s5f8, bu, bv, s500, bw)
						n = ld64(s5f8)
						st64(a + 0x10, ld64(s5f8 + 8))
						st64(a + 8, n)
						st64(a, 0)
						return o
					}
					o = anchor_error_from(s8c8, 0xbbd /* anchor::AccountNotEnoughKeys */, token_mint_1_box, ba + 0x30, ba)
					n = ld64(s8c8)
					st64(a + 0x10, ld64(s8c8 + 8))
					st64(a + 8, n)
					st64(a, 0)
					return o
				}
				alloc_handle_alloc_error(8, 0x78)
			}
			const ab = ld64(0x300000000 /* heap bump-allocator cursor */)
			const ac = ab != 0 ? sat_sub(ab, 5) : 0x300007ffb
			if ((n & 1) != 0) {
				if (0x300000008 > ac) {
					raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(ab, 5), 5 > ab)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ac)
				st8(ac + 4, 0x72)
				st32(ac, 0x65796170)
				void payer.key
			} else {
				if (0x300000008 > ac) {
					raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(ab, 5), 5 > ab)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ac)
				st8(ac + 4, 0x72)
				st32(ac, 0x65796170)
				void payer.key
			}
			st64(payer + 0x10, ac, 5)
			st64(payer + 8 /* lamports */, 5)
			st64(payer /* key */, 1)
			st64(a + 0x10, payer)
			st64(a + 8, n)
			st64(a, 0)
			return o
		}
		g = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	}
	const h = g
	if (2 > (g & 3) - 2) {
		o = anchor_error_from(s8f8, 0x66 /* anchor::InstructionDidNotDeserialize */, j, k, l)
		n = ld64(s8f8)
		st64(a + 0x10, ld64(s8f8 + 8))
		st64(a + 8, n)
		st64(a, 0)
		return o
	}
	if ((h & 3) == 0) {
		o = anchor_error_from(s8f8, 0x66 /* anchor::InstructionDidNotDeserialize */, j, k, l)
		n = ld64(s8f8)
		st64(a + 0x10, ld64(s8f8 + 8))
		st64(a + 8, n)
		st64(a, 0)
		return o
	}
	const i = ld64(ld64(g + 7))
	if (i == 0) {
		o = anchor_error_from(s8f8, 0x66 /* anchor::InstructionDidNotDeserialize */, j, k, l)
		n = ld64(s8f8)
		st64(a + 0x10, ld64(s8f8 + 8))
		st64(a + 8, n)
		st64(a, 0)
		return o
	}
	callx(i, ld64(g - 1), i)
	o = anchor_error_from(s8f8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	n = ld64(s8f8)
	st64(a + 0x10, ld64(s8f8 + 8))
	st64(a + 8, n)
	st64(a, 0)
	return o
}

export function fn_fb208(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s2 = fp - 0x2, s4 = fp - 0x4, s28 = fp - 0x28, s48 = fp - 0x48, s68 = fp - 0x68, sa8 = fp - 0xa8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, sd9 = fp - 0xd9, sdc = fp - 0xdc, s100 = fp - 0x100, s120 = fp - 0x120, s140 = fp - 0x140, s150 = fp - 0x150, s1b8 = fp - 0x1b8, s1d8 = fp - 0x1d8, s1f8 = fp - 0x1f8, s210 = fp - 0x210, s218 = fp - 0x218, s238 = fp - 0x238, s280 = fp - 0x280, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d0 = fp - 0x2d0, s2d8 = fp - 0x2d8, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s368 = fp - 0x368, s398 = fp - 0x398, s3a0 = fp - 0x3a0, s3e0 = fp - 0x3e0, s3e8 = fp - 0x3e8, s3f0 = fp - 0x3f0
	let ag, ck, cn, co: u64
	const f: AccountInfo = ld64(ld64(b))
	const g = fn_147a20(f, b, c, d, e)
	st64(s368 + 0x10, a)
	if (g != 0) {
		const j = ld64(b + 0x10)
		const k = ld64(ld64(j))
		copyr(s238, k, 0x20)
		const l = f.key
		copy(s210, l + 8, 0x18)
		st64(s218, ld64(l))
		if ((memcmp(s238, s218, 0x20) as u32) == 0) {
			ErrorCode_name(s48, 0x100159890)
			st64(s28, 0, 1, 0)
			st64(sa8, s28, 0x10015f818)
			st8(sa8 + 0x18, 3)
			st64(sa8 + 0x10, 0x20)
			st64(sc8 + 0x10, 0)
			st64(sc8, 0)
			if (ErrorCode_fmt(0x100159890, sc8) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(s2b8, s28, 0x18)
			copy(s2d0, s48, 0x18)
			st64(s2f0 + 8, 0x10015a380)
			st32(s280 + 0x28, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s2a0, 2)
			st32(s2d8, 9)
			st64(s2f0 + 0x10, 0x39)
			st64(s2f0, 0)
			const aj = fn_13e5a0(s330, s2f0)
			const ai = ld64(s330 + 8)
			const ah = ld64(s330)
			copy(s2f0, s238, 0x40)
			ck = Error_with_pubkeys(s340, ah, ai, s2f0, aj)
			const al = ld64(s340)
			const ak = ld64(s368 + 0x10)
			st64(ak + 8, ld64(s340 + 8))
			st64(ak, al)
			return ck
		}
		const m = max(fn_1476d8(ld64(b + 8), 0x608), 1)
		if (m > g) {
			const n: AccountInfo = ld64(j)
			const o: LamportsCell = n.lamports
			const ao = n.key
			rc_inc(o)
			const am: DataCell = n.data
			const an = am.strong
			st64(s368 + 8, ao)
			rc_inc(am, an)
			const ap: LamportsCell = f.lamports
			const aq = ap.strong
			st64(s398 + 8, f.key)
			st64(s398 + 0x10, n.executable)
			st64(s398 + 0x18, n.is_writable)
			st64(s398 + 0x20, n.is_signer)
			st64(s398 + 0x28, n.rent_epoch)
			st64(s368, n.owner)
			rc_inc(ap, aq)
			const ar: DataCell = f.data
			const at = ar.strong
			st64(s3a0, ap, am)
			rc_inc(ar, at)
			const au: AccountInfo = ld64(ld64(b + 0x18))
			const av: LamportsCell = au.lamports
			const aw = av.strong
			st64(s3e0 + 0x10, f.executable)
			st64(s3e0 + 0x18, f.is_writable)
			st64(s3e0 + 0x20, f.is_signer)
			st64(s3e0 + 0x28, f.rent_epoch)
			st64(s3e0 + 0x30, f.owner)
			st64(s3e0 + 0x38, au.key)
			rc_inc(av, aw)
			const ax: DataCell = au.data
			const ay = ax.strong
			st64(s3e0, o, sat_sub(m, g))
			rc_inc(ax, ay)
			st64(s3e8, au.owner)
			const bc = au.rent_epoch
			const bb = au.is_signer
			const ba = au.is_writable
			const az = au.executable
			st8(s1b8 + 0x62, ld64(s3e0 + 0x10))
			st8(s1b8 + 0x61, ld64(s3e0 + 0x18))
			st8(s1b8 + 0x60, ld64(s3e0 + 0x20))
			st64(s1b8 + 0x58, ld64(s3e0 + 0x28))
			st64(s1b8 + 0x50, ld64(s3e0 + 0x30))
			st64(s1b8 + 0x48, ar)
			st64(s1b8 + 0x40, ld64(s3a0))
			st64(s1b8 + 0x38, ld64(s398 + 8))
			st8(s1b8 + 0x32, ld64(s398 + 0x10))
			st8(s1b8 + 0x31, ld64(s398 + 0x18))
			st8(s1b8 + 0x30, ld64(s398 + 0x20))
			st64(s1b8 + 0x28, ld64(s398 + 0x28))
			st64(s1b8 + 0x20, ld64(s368))
			st64(s1b8 + 0x18, ld64(s398))
			st64(s1b8 + 0x10, ld64(s3e0))
			st64(s1b8 + 8, ld64(s368 + 8))
			st8(s1b8, bb, ba, az)
			st64(s1d8 + 0x18, bc)
			st64(s1d8 + 0x10, ld64(s3e8))
			st64(s1d8, av, ax)
			st64(s1f8 + 0x18, ld64(s3e0 + 0x38))
			st64(s150, 8, 0)
			st64(s1f8, 0, 8, 0)
			ck = system_program_transfer(s300, s1f8, ld64(s3e0 + 8))
			ag = ld64(s300)
			if (ag != 2) {
				co = ld64(s300 + 8)
				cn = ld64(s368 + 0x10)
				st64(cn, ag, co)
				return ck
			}
		}
		const bd: LamportsCell = f.lamports
		const bj = f.key
		rc_inc(bd)
		const be: DataCell = f.data
		rc_inc(be)
		st64(s368, be)
		const bf = ld64(b + 0x18)
		const bg: AccountInfo = ld64(bf)
		const bh: LamportsCell = bg.lamports
		const bi = bh.strong
		st64(s398 + 0x10, f.executable)
		st64(s398 + 0x18, f.is_writable)
		st64(s398 + 0x20, f.is_signer)
		st64(s398 + 0x28, f.rent_epoch)
		st64(s368 + 8, f.owner)
		const bs = bg.key
		rc_inc(bh, bi)
		st64(s398 + 8, bj)
		const bk: DataCell = bg.data
		rc_inc(bk)
		st64(s3e0 + 0x30, bf)
		st64(s3a0, bg.owner)
		st64(s3e0 + 0x38, bg.rent_epoch)
		st64(s398, bd)
		const br = bg.is_signer
		const bq = bg.is_writable
		const bp = bg.executable
		const bl = ld64(ld64(ld64(b + 0x20)))
		copyr(s140, bl, 0x20)
		const bm = ld64(ld64(ld64(b + 0x28) + 0x58))
		copyr(s120, bm, 0x20)
		const bn = ld64(ld64(ld64(b + 0x30) + 0x58))
		copyr(s100, bn, 0x20)
		st16(sdc, ld16(ld64(b + 0x38)))
		const bo = ld8(ld64(b + 0x40))
		st64(sa8 + 0x30, sd9)
		st64(sa8 + 0x20, sdc)
		st64(sa8 + 0x10, s100)
		st64(sa8, s120)
		st64(sc8 + 0x10, s140)
		st64(sc8, 0x10015984c)
		st8(sd9, bo)
		st64(s28, sc8)
		st64(s280 + 8, s28)
		st8(s280, br, bq, bp)
		st64(s2a0 + 0x18, ld64(s3e0 + 0x38))
		st64(s2a0 + 0x10, ld64(s3a0))
		st64(s2a8, bs, bh, bk)
		st8(s2b8 + 0xa, ld64(s398 + 0x10))
		st8(s2b8 + 9, ld64(s398 + 0x18))
		st8(s2b8 + 8, ld64(s398 + 0x20))
		st64(s2b8, ld64(s398 + 0x28))
		copyr(s2c8, s368, 0x10)
		st64(s2d0, ld64(s398))
		st64(s2d8, ld64(s398 + 8))
		st64(sa8 + 0x38, 1)
		st64(sa8 + 0x28, 2)
		st64(sa8 + 0x18, 0x20)
		st64(sa8 + 8, 0x20)
		st64(sc8 + 0x18, 0x20)
		st64(sc8 + 8, 4)
		st64(s28 + 8, 6)
		st64(s280 + 0x10, 1)
		st64(s2f0, 0, 8, 0)
		ck = system_program_assign_13fb30(s310, s2f0, 0x608)
		ag = ld64(s310)
		if (ag != 2) {
			co = ld64(s310 + 8)
			cn = ld64(s368 + 0x10)
			st64(cn, ag, co)
			return ck
		}
		const bt: LamportsCell = f.lamports
		const bv = ld64(s3e0 + 0x30)
		const cb = f.key
		rc_inc(bt)
		const bu: DataCell = f.data
		rc_inc(bu)
		const bw: AccountInfo = ld64(bv)
		const bx: LamportsCell = bw.lamports
		const by = bx.strong
		st64(s398 + 0x18, f.executable)
		st64(s398 + 0x20, f.is_writable)
		st64(s398 + 0x28, f.is_signer)
		st64(s368, f.rent_epoch)
		st64(s368 + 8, f.owner)
		st64(s398 + 0x10, bw.key)
		rc_inc(bx, by)
		const bz: DataCell = bw.data
		const ca = bz.strong
		st64(s398, cb, bt)
		rc_inc(bz, ca)
		st64(s3a0, bw.owner)
		const cf = bw.rent_epoch
		const ce = bw.is_signer
		const cd = bw.is_writable
		const cc = bw.executable
		copy(s68, s140, 0x60)
		st16(s4, ld16(sdc))
		st8(s2, ld8(sd9))
		st64(sd8, sc8, 6, 0x10015984c, 4, s68, 0x20, s48, 0x20, s28, 0x20, s4, 2, s2, 1)
		st64(s280 + 8, sd8)
		st8(s280, ce, cd, cc)
		st64(s2a0 + 0x18, cf)
		st64(s2a0 + 0x10, ld64(s3a0))
		st64(s2a0, bx, bz)
		st64(s2a8, ld64(s398 + 0x10))
		st8(s2b8 + 0xa, ld64(s398 + 0x18))
		st8(s2b8 + 9, ld64(s398 + 0x20))
		st8(s2b8 + 8, ld64(s398 + 0x28))
		st64(s2b8, ld64(s368))
		st64(s2c8 + 8, ld64(s368 + 8))
		st64(s2c8, bu)
		copyr(s2d8, s398, 0x10)
		st64(s280 + 0x10, 1)
		st64(s2f0, 0, 8, 0)
		ck = system_program_assign_13ff40(s320, s2f0, ld64(ld64(b + 0x48)))
		ag = ld64(s320)
		if (ag != 2) {
			co = ld64(s320 + 8)
			cn = ld64(s368 + 0x10)
			st64(cn, ag, co)
			return ck
		}
	} else {
		const y = fn_1476d8(ld64(b + 8), 0x608)
		const h: AccountInfo = ld64(ld64(b + 0x10))
		const i: LamportsCell = h.lamports
		const q = h.key
		rc_inc(i)
		const p: DataCell = h.data
		rc_inc(p)
		st64(s368, q)
		const r: LamportsCell = f.lamports
		st64(s368 + 8, r)
		const s = r.strong
		st64(s398 + 8, f.key)
		st64(s398 + 0x10, h.executable)
		st64(s398 + 0x18, h.is_writable)
		st64(s398 + 0x20, h.is_signer)
		st64(s398 + 0x28, h.rent_epoch)
		const t = h.owner
		rc_inc(ld64(s368 + 8), s)
		st64(s398, t)
		const u: DataCell = f.data
		rc_inc(u)
		st64(s3a0, i)
		const v: AccountInfo = ld64(ld64(b + 0x18))
		const w: LamportsCell = v.lamports
		const x = w.strong
		st64(s3e0 + 0x18, f.executable)
		st64(s3e0 + 0x20, f.is_writable)
		st64(s3e0 + 0x28, f.is_signer)
		st64(s3e0 + 0x30, f.rent_epoch)
		st64(s3e0 + 0x38, f.owner)
		const af = v.key
		rc_inc(w, x)
		st64(s3e0 + 0x10, y)
		const z: DataCell = v.data
		rc_inc(z)
		st64(s3e0 + 8, v.owner)
		st64(s3e0, v.rent_epoch)
		st64(s3e8, v.is_signer)
		st64(s3f0, v.is_writable)
		const ae = v.executable
		const aa = ld64(ld64(ld64(b + 0x20)))
		copyr(s68, aa, 0x20)
		const ab = ld64(ld64(ld64(b + 0x28) + 0x58))
		copyr(s48, ab, 0x20)
		const ac = ld64(ld64(ld64(b + 0x30) + 0x58))
		copyr(s28, ac, 0x20)
		st16(s4, ld16(ld64(b + 0x38)))
		const ad = ld8(ld64(b + 0x40))
		st64(sa8 + 0x30, s2)
		st64(sa8 + 0x20, s4)
		st64(sa8 + 0x10, s28)
		st64(sa8, s48)
		st64(sc8 + 0x10, s68)
		st64(sc8, 0x10015984c)
		st8(s2, ad)
		st64(sd8, sc8)
		st64(s280 + 0x38, sd8)
		st8(s280 + 0x32, ld64(s3e0 + 0x18))
		st8(s280 + 0x31, ld64(s3e0 + 0x20))
		st8(s280 + 0x30, ld64(s3e0 + 0x28))
		st64(s280 + 0x28, ld64(s3e0 + 0x30))
		st64(s280 + 0x20, ld64(s3e0 + 0x38))
		st64(s280 + 0x18, u)
		st64(s280 + 0x10, ld64(s368 + 8))
		st64(s280 + 8, ld64(s398 + 8))
		st8(s280 + 2, ld64(s398 + 0x10))
		st8(s280 + 1, ld64(s398 + 0x18))
		st8(s280, ld64(s398 + 0x20))
		st64(s2a0 + 0x18, ld64(s398 + 0x28))
		st64(s2a0 + 0x10, ld64(s398))
		st64(s2a0 + 8, p)
		st64(s2a0, ld64(s3a0))
		st64(s2a8, ld64(s368))
		st8(s2b8 + 0xa, ae)
		st8(s2b8 + 9, ld64(s3f0))
		st8(s2b8 + 8, ld64(s3e8))
		st64(s2b8, ld64(s3e0))
		st64(s2c8 + 8, ld64(s3e0 + 8))
		st64(s2d8, af, w, z)
		st64(sa8 + 0x38, 1)
		st64(sa8 + 0x28, 2)
		st64(sa8 + 0x18, 0x20)
		st64(sa8 + 8, 0x20)
		st64(sc8 + 0x18, 0x20)
		st64(sc8 + 8, 4)
		st64(sd8 + 8, 6)
		st64(s280 + 0x40, 1)
		st64(s2f0, 0, 8, 0)
		ck = system_program_create_account(s350, s2f0, ld64(s3e0 + 0x10), 0x608, ld64(ld64(b + 0x48)))
		ag = ld64(s350)
		if (ag != 2) {
			co = ld64(s350 + 8)
			cn = ld64(s368 + 0x10)
			st64(cn, ag, co)
			return ck
		}
	}
	const ch = ld64(s368 + 0x10)
	ck = fn_4688(s2f0, f)
	const ci = ld64(s2f0 + 8)
	const cg = ld64(s2f0)
	if (cg == 2) {
		st64(ch + 8, ci)
		st64(ch, 2)
		return ck
	}
	const cj = ld64(0x300000000 /* heap bump-allocator cursor */)
	ck = 0xa > cj
	const cl = ck != 0 ? 0 : cj - 0xa
	const cm = cj != 0 ? cl : 0x300007ff6
	if ((cg & 1) != 0) {
		if (0x300000008 > cm) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, cl)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, cm)
		st64(cm, 0x6174735f6c6f6f70)
		st16(cm + 8, 0x6574)
		void ld64(ci)
	} else {
		if (0x300000008 > cm) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, cl)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, cm)
		st64(cm, 0x6174735f6c6f6f70)
		st16(cm + 8, 0x6574)
		void ld64(ci)
	}
	st64(ci + 0x10, cm, 0xa)
	st64(ci + 8, 0xa)
	st64(ci, 1)
	st64(ch + 8, ci)
	st64(ch, cg)
	return ck
}

export function fn_fcee0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s49 = fp - 0x49, s70 = fp - 0x70, s71 = fp - 0x71, s98 = fp - 0x98, sa8 = fp - 0xa8, s108 = fp - 0x108, s110 = fp - 0x110, s130 = fp - 0x130, s150 = fp - 0x150, s168 = fp - 0x168, s180 = fp - 0x180, s188 = fp - 0x188, s1a8 = fp - 0x1a8, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s210 = fp - 0x210, s218 = fp - 0x218, s21f = fp - 0x21f, s228 = fp - 0x228, s240 = fp - 0x240, s248 = fp - 0x248, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s308 = fp - 0x308, s310 = fp - 0x310, s318 = fp - 0x318, s320 = fp - 0x320, s328 = fp - 0x328, s330 = fp - 0x330, s338 = fp - 0x338, s340 = fp - 0x340, s348 = fp - 0x348, s350 = fp - 0x350, s358 = fp - 0x358, s360 = fp - 0x360, s368 = fp - 0x368
	let af, cn, cq, cr: u64
	const f: AccountInfo = ld64(ld64(b))
	const g = fn_147a20(f, b, c, d, e)
	st64(s308 + 0x40, a)
	if (g != 0) {
		const j = ld64(b + 0x10)
		const k = ld64(ld64(j))
		copyr(s1a8, k, 0x20)
		const l = f.key
		copy(s180, l + 8, 0x18)
		st64(s188, ld64(l))
		if ((memcmp(s1a8, s188, 0x20) as u32) == 0) {
			ErrorCode_name(s168, 0x100159890)
			st64(s70, 0, 1, 0)
			st64(s28, s70, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100159890, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(s228, s70, 0x18)
			copy(s240, s168, 0x18)
			st64(s260 + 8, 0x10015a380)
			st32(s1e0 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s210, 2)
			st32(s248, 9)
			st64(s260 + 0x10, 0x39)
			st64(s260, 0)
			const ai = fn_13e5a0(s2a0, s260)
			const ah = ld64(s2a0 + 8)
			const ag = ld64(s2a0)
			copy(s260, s1a8, 0x40)
			cn = Error_with_pubkeys(s2b0, ag, ah, s260, ai)
			const ak = ld64(s2b0)
			const aj = ld64(s308 + 0x40)
			st64(aj + 8, ld64(s2b0 + 8))
			st64(aj, ak)
			return cn
		}
		st64(s308 + 0x38, b)
		const m = max(fn_1476d8(ld64(b + 8), 0x1183), 1)
		if (m > g) {
			const n: AccountInfo = ld64(j)
			const o: LamportsCell = n.lamports
			const ap = n.key
			rc_inc(o)
			const al: DataCell = n.data
			rc_inc(al)
			const am: LamportsCell = f.lamports
			st64(s308 + 0x30, am)
			const an = am.strong
			st64(s308, f.key)
			st64(s308 + 8, n.executable)
			st64(s308 + 0x10, n.is_writable)
			st64(s308 + 0x18, n.is_signer)
			st64(s308 + 0x20, n.rent_epoch)
			st64(s308 + 0x28, n.owner)
			rc_inc(ld64(s308 + 0x30), an)
			const ao: DataCell = f.data
			const aq = ld64(s308 + 0x38)
			rc_inc(ao)
			st64(s320, al, ap)
			const ar: AccountInfo = ld64(ld64(aq + 0x18))
			const at: LamportsCell = ar.lamports
			const au = at.strong
			st64(s310, o)
			st64(s348, f.executable)
			st64(s340, f.is_writable)
			st64(s338, f.is_signer)
			st64(s330, f.rent_epoch)
			const ax = f.owner
			st64(s328, ar.key)
			rc_inc(at, au)
			st64(s358, ao)
			const av: DataCell = ar.data
			const aw = av.strong
			st64(s350, sat_sub(m, g))
			rc_inc(av, aw)
			st64(s360, ar.owner)
			const bb = ar.rent_epoch
			const ba = ar.is_signer
			const az = ar.is_writable
			const ay = ar.executable
			st8(s108 + 0x5a, ld64(s348))
			st8(s108 + 0x59, ld64(s340))
			st8(s108 + 0x58, ld64(s338))
			st64(s108 + 0x50, ld64(s330))
			st64(s108 + 0x48, ax)
			st64(s108 + 0x40, ld64(s358))
			st64(s108 + 0x38, ld64(s308 + 0x30))
			st64(s108 + 0x30, ld64(s308))
			st8(s108 + 0x2a, ld64(s308 + 8))
			st8(s108 + 0x29, ld64(s308 + 0x10))
			st8(s108 + 0x28, ld64(s308 + 0x18))
			st64(s108 + 0x20, ld64(s308 + 0x20))
			st64(s108 + 0x18, ld64(s308 + 0x28))
			st64(s108 + 0x10, ld64(s320))
			copyr(s108, s318, 0x10)
			st8(s110, ba, az, ay)
			st64(s130 + 0x18, bb)
			st64(s130 + 0x10, ld64(s360))
			st64(s130, at, av)
			st64(s150 + 0x18, ld64(s328))
			st64(sa8, 8, 0)
			st64(s150, 0, 8, 0)
			cn = system_program_transfer(s270, s150, ld64(s350))
			const bc = ld64(s270)
			const bd = ld64(s308 + 0x40)
			if (bc != 2) {
				const be = ld64(s270 + 8)
				st64(bd, bc, be)
				return cn
			}
		}
		const bf: LamportsCell = f.lamports
		const bg = bf.strong
		st64(s308 + 0x30, f.key)
		const bi = ld64(s308 + 0x38)
		rc_inc(bf, bg)
		const bh: DataCell = f.data
		rc_inc(bh)
		st64(s308 + 0x28, bh)
		const bj = ld64(bi + 0x18)
		const bk: AccountInfo = ld64(bj)
		const bl: LamportsCell = bk.lamports
		const bm = bl.strong
		st64(s308, f.executable)
		st64(s308 + 8, f.is_writable)
		st64(s308 + 0x10, f.is_signer)
		st64(s308 + 0x18, f.rent_epoch)
		st64(s308 + 0x20, f.owner)
		const bn = bk.key
		rc_inc(bl, bm)
		st64(s310, bn)
		const bo: DataCell = bk.data
		rc_inc(bo)
		st64(s328, bj)
		st64(s320, bk.owner)
		st64(s318, bf)
		const bu = bk.rent_epoch
		const bt = bk.is_signer
		const bs = bk.is_writable
		const br = bk.executable
		const bp = ld64(ld64(ld64(bi + 0x20)))
		copyr(s98, bp, 0x20)
		const bq = ld8(ld64(bi + 0x28))
		st64(s28, s71)
		st64(s48 + 0x10, s98)
		st64(s48, 0x10015afbf)
		st8(s71, bq)
		st64(s70, s48)
		st64(s1f0 + 8, s70)
		st8(s1f0, bt, bs, br)
		st64(s210 + 0x18, bu)
		st64(s210 + 0x10, ld64(s320))
		st64(s210, bl, bo)
		st64(s218, ld64(s310))
		st8(s21f + 1, ld64(s308))
		st8(s21f, ld64(s308 + 8))
		st8(s228 + 8, ld64(s308 + 0x10))
		st64(s228, ld64(s308 + 0x18))
		st64(s240 + 0x10, ld64(s308 + 0x20))
		st64(s240 + 8, ld64(s308 + 0x28))
		st64(s240, ld64(s318))
		st64(s248, ld64(s308 + 0x30))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0xb)
		st64(s70 + 8, 3)
		st64(s1e0, 1)
		st64(s260, 0, 8, 0)
		cn = system_program_assign_13fb30(s280, s260, 0x1183)
		af = ld64(s280)
		if (af != 2) {
			cr = ld64(s280 + 8)
			cq = ld64(s308 + 0x40)
			st64(cq, af, cr)
			return cn
		}
		const bv: LamportsCell = f.lamports
		const cd = f.key
		rc_inc(bv)
		const bw: DataCell = f.data
		rc_inc(bw)
		const bx: AccountInfo = ld64(ld64(s328))
		const by: LamportsCell = bx.lamports
		const bz = by.strong
		st64(s308 + 0x18, f.executable)
		st64(s308 + 0x20, f.is_writable)
		st64(s308 + 0x28, f.is_signer)
		st64(s308 + 0x30, f.rent_epoch)
		const cc = f.owner
		st64(s308 + 0x10, bx.key)
		rc_inc(by, bz)
		const ca: DataCell = bx.data
		const cb = ca.strong
		st64(s310, cc, cd, bv)
		rc_inc(ca, cb)
		const ci = bx.owner
		const ch = bx.rent_epoch
		const cg = bx.is_signer
		const cf = bx.is_writable
		const ce = bx.executable
		copyr(s70, s98, 0x20)
		st64(s28, s49)
		st64(s48 + 0x10, s70)
		st64(s48, 0x10015afbf)
		st8(s49, ld8(s71))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0xb)
		st64(s168, s48, 3)
		st64(s1f0 + 8, s168)
		st8(s1f0, cg, cf, ce)
		st64(s210, by, ca, ci, ch)
		st64(s218, ld64(s308 + 0x10))
		st8(s21f + 1, ld64(s308 + 0x18))
		st8(s21f, ld64(s308 + 0x20))
		st8(s228 + 8, ld64(s308 + 0x28))
		st64(s228, ld64(s308 + 0x30))
		st64(s240 + 0x10, ld64(s310))
		st64(s240 + 8, bw)
		copyr(s248, s308, 0x10)
		st64(s1e0, 1)
		st64(s260, 0, 8, 0)
		cn = system_program_assign_13ff40(s290, s260, ld64(ld64(ld64(s308 + 0x38) + 0x30)))
		af = ld64(s290)
		if (af != 2) {
			cr = ld64(s290 + 8)
			cq = ld64(s308 + 0x40)
			st64(cq, af, cr)
			return cn
		}
	} else {
		const p = fn_1476d8(ld64(b + 8), 0x1183)
		const h: AccountInfo = ld64(ld64(b + 0x10))
		const i: LamportsCell = h.lamports
		const v = h.key
		rc_inc(i)
		st64(s308 + 0x30, p)
		const q: DataCell = h.data
		rc_inc(q)
		st64(s308 + 0x28, q)
		const r: LamportsCell = f.lamports
		const s = r.strong
		st64(s308, f.key)
		st64(s308 + 8, h.executable)
		st64(s308 + 0x10, h.is_writable)
		st64(s308 + 0x18, h.is_signer)
		st64(s308 + 0x20, h.rent_epoch)
		const t = h.owner
		rc_inc(r, s)
		st64(s310, t)
		const u: DataCell = f.data
		rc_inc(u)
		st64(s320, v, i)
		const w: AccountInfo = ld64(ld64(b + 0x18))
		const x: LamportsCell = w.lamports
		const y = x.strong
		st64(s348, f.executable)
		st64(s340, f.is_writable)
		st64(s338, f.is_signer)
		st64(s330, f.rent_epoch)
		st64(s328, f.owner)
		const z = w.key
		rc_inc(x, y)
		st64(s350, z)
		const aa: DataCell = w.data
		rc_inc(aa)
		st64(s358, w.owner)
		st64(s360, w.rent_epoch)
		st64(s368, w.is_signer)
		const ae = w.is_writable
		const ad = w.executable
		const ab = ld64(ld64(ld64(b + 0x20)))
		copyr(s70, ab, 0x20)
		const ac = ld8(ld64(b + 0x28))
		st64(s28, s49)
		st64(s48 + 0x10, s70)
		st64(s48, 0x10015afbf)
		st8(s49, ac)
		st64(s168, s48)
		st64(s1e0 + 0x28, s168)
		st8(s1e0 + 0x22, ld64(s348))
		st8(s1e0 + 0x21, ld64(s340))
		st8(s1e0 + 0x20, ld64(s338))
		st64(s1e0 + 0x18, ld64(s330))
		st64(s1e0 + 0x10, ld64(s328))
		st64(s1e0, r, u)
		st64(s1f0 + 8, ld64(s308))
		st8(s1f0 + 2, ld64(s308 + 8))
		st8(s1f0 + 1, ld64(s308 + 0x10))
		st8(s1f0, ld64(s308 + 0x18))
		st64(s210 + 0x18, ld64(s308 + 0x20))
		st64(s210 + 0x10, ld64(s310))
		st64(s210 + 8, ld64(s308 + 0x28))
		copyr(s218, s320, 0x10)
		st8(s21f, ae, ad)
		st8(s228 + 8, ld64(s368))
		st64(s228, ld64(s360))
		st64(s240 + 0x10, ld64(s358))
		st64(s240, x, aa)
		st64(s248, ld64(s350))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0xb)
		st64(s168 + 8, 3)
		st64(s1e0 + 0x30, 1)
		st64(s260, 0, 8, 0)
		cn = system_program_create_account(s2c0, s260, ld64(s308 + 0x30), 0x1183, ld64(ld64(b + 0x30)))
		af = ld64(s2c0)
		if (af != 2) {
			cr = ld64(s2c0 + 8)
			cq = ld64(s308 + 0x40)
			st64(cq, af, cr)
			return cn
		}
	}
	const ck = ld64(s308 + 0x40)
	cn = fn_4688(s260, f)
	const cl = ld64(s260 + 8)
	const cj = ld64(s260)
	if (cj == 2) {
		st64(ck + 8, cl)
		st64(ck, 2)
		return cn
	}
	const cm = ld64(0x300000000 /* heap bump-allocator cursor */)
	cn = 0x11 > cm
	const co = cn != 0 ? 0 : cm - 0x11
	const cp = cm != 0 ? co : 0x300007fef
	if ((cj & 1) != 0) {
		if (0x300000008 > cp) {
			raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, co)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, cp)
		st64(cp + 8, 0x746174735f6e6f69)
		st64(cp, 0x746176726573626f)
		st8(cp + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
		void ld64(cl)
	} else {
		if (0x300000008 > cp) {
			raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, co)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, cp)
		st64(cp + 8, 0x746174735f6e6f69)
		st64(cp, 0x746176726573626f)
		st8(cp + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
		void ld64(cl)
	}
	st64(cl + 0x10, cp, 0x11)
	st64(cl + 8, 0x11)
	st64(cl, 1)
	st64(ck + 8, cl)
	st64(ck, cj)
	return cn
}

export function fn_fe8f8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s49 = fp - 0x49, s70 = fp - 0x70, s71 = fp - 0x71, s98 = fp - 0x98, sa8 = fp - 0xa8, s108 = fp - 0x108, s110 = fp - 0x110, s130 = fp - 0x130, s150 = fp - 0x150, s168 = fp - 0x168, s180 = fp - 0x180, s188 = fp - 0x188, s1a8 = fp - 0x1a8, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s210 = fp - 0x210, s218 = fp - 0x218, s21f = fp - 0x21f, s228 = fp - 0x228, s240 = fp - 0x240, s248 = fp - 0x248, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s308 = fp - 0x308, s310 = fp - 0x310, s318 = fp - 0x318, s320 = fp - 0x320, s328 = fp - 0x328, s330 = fp - 0x330, s338 = fp - 0x338, s340 = fp - 0x340, s348 = fp - 0x348, s350 = fp - 0x350, s358 = fp - 0x358, s360 = fp - 0x360, s368 = fp - 0x368
	let af, cn, cq, cr: u64
	const f: AccountInfo = ld64(ld64(b))
	const g = fn_147a20(f, b, c, d, e)
	st64(s308 + 0x40, a)
	if (g != 0) {
		const j = ld64(b + 0x10)
		const k = ld64(ld64(j))
		copyr(s1a8, k, 0x20)
		const l = f.key
		copy(s180, l + 8, 0x18)
		st64(s188, ld64(l))
		if ((memcmp(s1a8, s188, 0x20) as u32) == 0) {
			ErrorCode_name(s168, 0x100159890)
			st64(s70, 0, 1, 0)
			st64(s28, s70, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100159890, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(s228, s70, 0x18)
			copy(s240, s168, 0x18)
			st64(s260 + 8, 0x10015a380)
			st32(s1e0 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s210, 2)
			st32(s248, 9)
			st64(s260 + 0x10, 0x39)
			st64(s260, 0)
			const ai = fn_13e5a0(s2a0, s260)
			const ah = ld64(s2a0 + 8)
			const ag = ld64(s2a0)
			copy(s260, s1a8, 0x40)
			cn = Error_with_pubkeys(s2b0, ag, ah, s260, ai)
			const ak = ld64(s2b0)
			const aj = ld64(s308 + 0x40)
			st64(aj + 8, ld64(s2b0 + 8))
			st64(aj, ak)
			return cn
		}
		st64(s308 + 0x38, b)
		const m = max(fn_1476d8(ld64(b + 8), 0x728), 1)
		if (m > g) {
			const n: AccountInfo = ld64(j)
			const o: LamportsCell = n.lamports
			const ap = n.key
			rc_inc(o)
			const al: DataCell = n.data
			rc_inc(al)
			const am: LamportsCell = f.lamports
			st64(s308 + 0x30, am)
			const an = am.strong
			st64(s308, f.key)
			st64(s308 + 8, n.executable)
			st64(s308 + 0x10, n.is_writable)
			st64(s308 + 0x18, n.is_signer)
			st64(s308 + 0x20, n.rent_epoch)
			st64(s308 + 0x28, n.owner)
			rc_inc(ld64(s308 + 0x30), an)
			const ao: DataCell = f.data
			const aq = ld64(s308 + 0x38)
			rc_inc(ao)
			st64(s320, al, ap)
			const ar: AccountInfo = ld64(ld64(aq + 0x18))
			const at: LamportsCell = ar.lamports
			const au = at.strong
			st64(s310, o)
			st64(s348, f.executable)
			st64(s340, f.is_writable)
			st64(s338, f.is_signer)
			st64(s330, f.rent_epoch)
			const ax = f.owner
			st64(s328, ar.key)
			rc_inc(at, au)
			st64(s358, ao)
			const av: DataCell = ar.data
			const aw = av.strong
			st64(s350, sat_sub(m, g))
			rc_inc(av, aw)
			st64(s360, ar.owner)
			const bb = ar.rent_epoch
			const ba = ar.is_signer
			const az = ar.is_writable
			const ay = ar.executable
			st8(s108 + 0x5a, ld64(s348))
			st8(s108 + 0x59, ld64(s340))
			st8(s108 + 0x58, ld64(s338))
			st64(s108 + 0x50, ld64(s330))
			st64(s108 + 0x48, ax)
			st64(s108 + 0x40, ld64(s358))
			st64(s108 + 0x38, ld64(s308 + 0x30))
			st64(s108 + 0x30, ld64(s308))
			st8(s108 + 0x2a, ld64(s308 + 8))
			st8(s108 + 0x29, ld64(s308 + 0x10))
			st8(s108 + 0x28, ld64(s308 + 0x18))
			st64(s108 + 0x20, ld64(s308 + 0x20))
			st64(s108 + 0x18, ld64(s308 + 0x28))
			st64(s108 + 0x10, ld64(s320))
			copyr(s108, s318, 0x10)
			st8(s110, ba, az, ay)
			st64(s130 + 0x18, bb)
			st64(s130 + 0x10, ld64(s360))
			st64(s130, at, av)
			st64(s150 + 0x18, ld64(s328))
			st64(sa8, 8, 0)
			st64(s150, 0, 8, 0)
			cn = system_program_transfer(s270, s150, ld64(s350))
			const bc = ld64(s270)
			const bd = ld64(s308 + 0x40)
			if (bc != 2) {
				const be = ld64(s270 + 8)
				st64(bd, bc, be)
				return cn
			}
		}
		const bf: LamportsCell = f.lamports
		const bg = bf.strong
		st64(s308 + 0x30, f.key)
		const bi = ld64(s308 + 0x38)
		rc_inc(bf, bg)
		const bh: DataCell = f.data
		rc_inc(bh)
		st64(s308 + 0x28, bh)
		const bj = ld64(bi + 0x18)
		const bk: AccountInfo = ld64(bj)
		const bl: LamportsCell = bk.lamports
		const bm = bl.strong
		st64(s308, f.executable)
		st64(s308 + 8, f.is_writable)
		st64(s308 + 0x10, f.is_signer)
		st64(s308 + 0x18, f.rent_epoch)
		st64(s308 + 0x20, f.owner)
		const bn = bk.key
		rc_inc(bl, bm)
		st64(s310, bn)
		const bo: DataCell = bk.data
		rc_inc(bo)
		st64(s328, bj)
		st64(s320, bk.owner)
		st64(s318, bf)
		const bu = bk.rent_epoch
		const bt = bk.is_signer
		const bs = bk.is_writable
		const br = bk.executable
		const bp = ld64(ld64(ld64(bi + 0x20)))
		copyr(s98, bp, 0x20)
		const bq = ld8(ld64(bi + 0x28))
		st64(s28, s71)
		st64(s48 + 0x10, s98)
		st64(s48, 0x1001595c0)
		st8(s71, bq)
		st64(s70, s48)
		st64(s1f0 + 8, s70)
		st8(s1f0, bt, bs, br)
		st64(s210 + 0x18, bu)
		st64(s210 + 0x10, ld64(s320))
		st64(s210, bl, bo)
		st64(s218, ld64(s310))
		st8(s21f + 1, ld64(s308))
		st8(s21f, ld64(s308 + 8))
		st8(s228 + 8, ld64(s308 + 0x10))
		st64(s228, ld64(s308 + 0x18))
		st64(s240 + 0x10, ld64(s308 + 0x20))
		st64(s240 + 8, ld64(s308 + 0x28))
		st64(s240, ld64(s318))
		st64(s248, ld64(s308 + 0x30))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0x20)
		st64(s70 + 8, 3)
		st64(s1e0, 1)
		st64(s260, 0, 8, 0)
		cn = system_program_assign_13fb30(s280, s260, 0x728)
		af = ld64(s280)
		if (af != 2) {
			cr = ld64(s280 + 8)
			cq = ld64(s308 + 0x40)
			st64(cq, af, cr)
			return cn
		}
		const bv: LamportsCell = f.lamports
		const cd = f.key
		rc_inc(bv)
		const bw: DataCell = f.data
		rc_inc(bw)
		const bx: AccountInfo = ld64(ld64(s328))
		const by: LamportsCell = bx.lamports
		const bz = by.strong
		st64(s308 + 0x18, f.executable)
		st64(s308 + 0x20, f.is_writable)
		st64(s308 + 0x28, f.is_signer)
		st64(s308 + 0x30, f.rent_epoch)
		const cc = f.owner
		st64(s308 + 0x10, bx.key)
		rc_inc(by, bz)
		const ca: DataCell = bx.data
		const cb = ca.strong
		st64(s310, cc, cd, bv)
		rc_inc(ca, cb)
		const ci = bx.owner
		const ch = bx.rent_epoch
		const cg = bx.is_signer
		const cf = bx.is_writable
		const ce = bx.executable
		copyr(s70, s98, 0x20)
		st64(s28, s49)
		st64(s48 + 0x10, s70)
		st64(s48, 0x1001595c0)
		st8(s49, ld8(s71))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0x20)
		st64(s168, s48, 3)
		st64(s1f0 + 8, s168)
		st8(s1f0, cg, cf, ce)
		st64(s210, by, ca, ci, ch)
		st64(s218, ld64(s308 + 0x10))
		st8(s21f + 1, ld64(s308 + 0x18))
		st8(s21f, ld64(s308 + 0x20))
		st8(s228 + 8, ld64(s308 + 0x28))
		st64(s228, ld64(s308 + 0x30))
		st64(s240 + 0x10, ld64(s310))
		st64(s240 + 8, bw)
		copyr(s248, s308, 0x10)
		st64(s1e0, 1)
		st64(s260, 0, 8, 0)
		cn = system_program_assign_13ff40(s290, s260, ld64(ld64(ld64(s308 + 0x38) + 0x30)))
		af = ld64(s290)
		if (af != 2) {
			cr = ld64(s290 + 8)
			cq = ld64(s308 + 0x40)
			st64(cq, af, cr)
			return cn
		}
	} else {
		const p = fn_1476d8(ld64(b + 8), 0x728)
		const h: AccountInfo = ld64(ld64(b + 0x10))
		const i: LamportsCell = h.lamports
		const v = h.key
		rc_inc(i)
		st64(s308 + 0x30, p)
		const q: DataCell = h.data
		rc_inc(q)
		st64(s308 + 0x28, q)
		const r: LamportsCell = f.lamports
		const s = r.strong
		st64(s308, f.key)
		st64(s308 + 8, h.executable)
		st64(s308 + 0x10, h.is_writable)
		st64(s308 + 0x18, h.is_signer)
		st64(s308 + 0x20, h.rent_epoch)
		const t = h.owner
		rc_inc(r, s)
		st64(s310, t)
		const u: DataCell = f.data
		rc_inc(u)
		st64(s320, v, i)
		const w: AccountInfo = ld64(ld64(b + 0x18))
		const x: LamportsCell = w.lamports
		const y = x.strong
		st64(s348, f.executable)
		st64(s340, f.is_writable)
		st64(s338, f.is_signer)
		st64(s330, f.rent_epoch)
		st64(s328, f.owner)
		const z = w.key
		rc_inc(x, y)
		st64(s350, z)
		const aa: DataCell = w.data
		rc_inc(aa)
		st64(s358, w.owner)
		st64(s360, w.rent_epoch)
		st64(s368, w.is_signer)
		const ae = w.is_writable
		const ad = w.executable
		const ab = ld64(ld64(ld64(b + 0x20)))
		copyr(s70, ab, 0x20)
		const ac = ld8(ld64(b + 0x28))
		st64(s28, s49)
		st64(s48 + 0x10, s70)
		st64(s48, 0x1001595c0)
		st8(s49, ac)
		st64(s168, s48)
		st64(s1e0 + 0x28, s168)
		st8(s1e0 + 0x22, ld64(s348))
		st8(s1e0 + 0x21, ld64(s340))
		st8(s1e0 + 0x20, ld64(s338))
		st64(s1e0 + 0x18, ld64(s330))
		st64(s1e0 + 0x10, ld64(s328))
		st64(s1e0, r, u)
		st64(s1f0 + 8, ld64(s308))
		st8(s1f0 + 2, ld64(s308 + 8))
		st8(s1f0 + 1, ld64(s308 + 0x10))
		st8(s1f0, ld64(s308 + 0x18))
		st64(s210 + 0x18, ld64(s308 + 0x20))
		st64(s210 + 0x10, ld64(s310))
		st64(s210 + 8, ld64(s308 + 0x28))
		copyr(s218, s320, 0x10)
		st8(s21f, ae, ad)
		st8(s228 + 8, ld64(s368))
		st64(s228, ld64(s360))
		st64(s240 + 0x10, ld64(s358))
		st64(s240, x, aa)
		st64(s248, ld64(s350))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0x20)
		st64(s168 + 8, 3)
		st64(s1e0 + 0x30, 1)
		st64(s260, 0, 8, 0)
		cn = system_program_create_account(s2c0, s260, ld64(s308 + 0x30), 0x728, ld64(ld64(b + 0x30)))
		af = ld64(s2c0)
		if (af != 2) {
			cr = ld64(s2c0 + 8)
			cq = ld64(s308 + 0x40)
			st64(cq, af, cr)
			return cn
		}
	}
	const ck = ld64(s308 + 0x40)
	cn = fn_4688(s260, f)
	const cl = ld64(s260 + 8)
	const cj = ld64(s260)
	if (cj == 2) {
		st64(ck + 8, cl)
		st64(ck, 2)
		return cn
	}
	const cm = ld64(0x300000000 /* heap bump-allocator cursor */)
	cn = 0x11 > cm
	const co = cn != 0 ? 0 : cm - 0x11
	const cp = cm != 0 ? co : 0x300007fef
	if ((cj & 1) != 0) {
		if (0x300000008 > cp) {
			raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, co)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, cp)
		st64(cp + 8, 0x616d7469625f7961)
		st64(cp, 0x7272615f6b636974)
		st8(cp + 0x10, 0x70)
		void ld64(cl)
	} else {
		if (0x300000008 > cp) {
			raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, co)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, cp)
		st64(cp + 8, 0x616d7469625f7961)
		st64(cp, 0x7272615f6b636974)
		st8(cp + 0x10, 0x70)
		void ld64(cl)
	}
	st64(cl + 0x10, cp, 0x11)
	st64(cl + 8, 0x11)
	st64(cl, 1)
	st64(ck + 8, cl)
	st64(ck, cj)
	return cn
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value)
// types [heur]: b: CreatePermissionedPoolContext (the handler ix_create_permissioned_pool passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_569a8(a: u64, b: CreatePermissionedPoolContext, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s8 = fp - 0x8, sc = fp - 0xc, s30 = fp - 0x30, s38 = fp - 0x38, s48 = fp - 0x48, s50 = fp - 0x50, s68 = fp - 0x68, s88 = fp - 0x88, sa8 = fp - 0xa8, sc8 = fp - 0xc8, sd0 = fp - 0xd0, se8 = fp - 0xe8, s101 = fp - 0x101, s108 = fp - 0x108, s128 = fp - 0x128, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s220 = fp - 0x220, s238 = fp - 0x238, s240 = fp - 0x240, s248 = fp - 0x248, s250 = fp - 0x250, sfe8 = fp - 0xfe8, sff0 = fp - 0xff0, s1000 = fp - 0x1000
	let j, av, aw, bj, bk, bl, bm: u64
	st64(s220 + 0x30, a)
	if ((d as u16) == 0) {
		ErrorCode_name(s148, 0x100159900, c, d, e)
		st64(s128, 0, 1, 0)
		st64(s30, s128, 0x10015f818)
		st8(s30 + 0x18, 3)
		st64(s30 + 0x10, 0x20)
		st64(s48 + 8, 0)
		st64(s50, 0)
		if (ErrorCode_fmt(0x100159900, s50) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(sd0, s128, 0x18)
		copy(se8, s148, 0x18)
		st64(s101 + 1, 0x10015a380)
		st32(s88 + 0x18, 0x9c9 /* anchor::RequireGtViolated */)
		st8(sc8 + 0x10, 2)
		st32(s101 + 0x11, 0x93)
		st64(s101 + 9, 0x39)
		st64(s108, 0)
		fn_13e5a0(s1e8, s108)
		const bi = ld64(s1e8 + 8)
		const bh = ld64(s1e8)
		st32(s8, 0)
		st16(sc, 0)
		if ((bh & 1) != 0) {
			st64(s50, 0, 1, 0)
			st64(se8, s50, 0x10015f818)
			st8(sd0, 3)
			st64(se8 + 0x10, 0x20)
			st64(s101 + 9, 0)
			st64(s108, 0)
			if (fn_154e18(sc, s108) == 0) {
				copyr(s148, s50, 0x18)
				st64(s128, 0, 1, 0)
				st64(se8, s128, 0x10015f818)
				st8(sd0, 3)
				st64(se8 + 0x10, 0x20)
				st64(s101 + 9, 0)
				st64(s108, 0)
				if (imp_fmt(s8, s108) == 0) {
					copyr(s38, s128, 0x18)
					copy(s50, s148, 0x18)
					memcpy(s101, s50, 0x30)
					bl = s108
					bj = bi
					bk = bi + 0x38
					if (ld8(bi + 0x38) != 0) {
						st8(bk, 0)
						j = memcpy(bj + 0x39, bl, 0x37)
						bm = ld64(s220 + 0x30)
						st64(bm + 8, bi)
						st64(bm, bh)
						return j
					}
					st8(bk, 0)
					j = memcpy(bj + 0x39, s108, 0x37)
					bm = ld64(s220 + 0x30)
					st64(bm + 8, bi)
					st64(bm, bh)
					return j
				}
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		st64(s50, 0, 1, 0)
		st64(se8, s50, 0x10015f818)
		st8(sd0, 3)
		st64(se8 + 0x10, 0x20)
		st64(s101 + 9, 0)
		st64(s108, 0)
		if (fn_154e18(sc, s108) == 0) {
			copyr(s148, s50, 0x18)
			st64(s128, 0, 1, 0)
			st64(se8, s128, 0x10015f818)
			st8(sd0, 3)
			st64(se8 + 0x10, 0x20)
			st64(s101 + 9, 0)
			st64(s108, 0)
			if (imp_fmt(s8, s108) == 0) {
				copyr(s38, s128, 0x18)
				copy(s50, s148, 0x18)
				memcpy(s101, s50, 0x30)
				bl = s108
				bj = bi
				bk = bi + 0x50
				if (ld8(bi + 0x50) != 0) {
					st8(bk, 0)
					j = memcpy(bj + 0x51, bl, 0x37)
					bm = ld64(s220 + 0x30)
					st64(bm + 8, bi)
					st64(bm, bh)
					return j
				}
				st8(bk, 0)
				j = memcpy(bj + 0x51, s108, 0x37)
				bm = ld64(s220 + 0x30)
				st64(bm + 8, bi)
				st64(bm, bh)
				return j
			}
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	st64(s220 + 0x18, d)
	st64(s220 + 0x28, c)
	const h = b.remaining_accounts_len
	const remaining_accounts: AccountInfo = b.remaining_accounts
	st64(s220 + 0x20, b)
	const accounts: CreatePermissionedPoolAccounts = b.accounts
	j = fn_7e058(s108, remaining_accounts, h, ld64(accounts + 0x138), r0)
	let o = ld64(s101 + 1)
	let i = ld64(s108)
	if (i == 2) {
		const k = ld8(s101 + 1)
		j = fn_7e058(s108, remaining_accounts, h, accounts.token_mint_1, j)
		o = ld64(s101 + 1)
		i = ld64(s108)
		if (i != 2) {
			bm = ld64(s220 + 0x30)
			st64(bm + 8, o)
			st64(bm, i)
			return j
		}
		st64(s220 + 0x10, ld8(s101 + 1))
		j = fn_7e560(s108, ld64(accounts + 0x138), k & 1)
		o = ld64(s101 + 1)
		i = ld64(s108)
		if (i != 2) {
			bm = ld64(s220 + 0x30)
			st64(bm + 8, o)
			st64(bm, i)
			return j
		}
		if ((ld8(s101 + 1) & 1) != 0) {
			j = fn_7e560(s108, accounts.token_mint_1, ld64(s220 + 0x10) & 1)
			o = ld64(s101 + 1)
			i = ld64(s108)
			if (i != 2) {
				bm = ld64(s220 + 0x30)
				st64(bm + 8, o)
				st64(bm, i)
				return j
			}
			if ((ld8(s101 + 1) & 1) != 0) {
				const pool_state: AccountInfo = accounts.pool_state
				const m = pool_state.key
				copyr(s158, m + 0x10, 0x10)
				const n = ld64(m + 8)
				st64(s168 + 8, n)
				st64(s168, ld64(m))
				j = fn_6490(s108, pool_state, n, o, undef, j)
				let p = ld64(s101 + 9)
				const q = ld64(s101 + 1)
				o = p
				i = q
				if (ld64(s108) != 0) {
					bm = ld64(s220 + 0x30)
					st64(bm + 8, o)
					st64(bm, i)
					return j
				}
				st64(s238 + 0x10, q)
				const r = ld64(s220 + 0x28)
				const t = ld64(r + 8)
				const s = ld64(r)
				st64(s238, s, t)
				j = fn_65410(s108, s, t)
				o = ld64(s101 + 1)
				i = ld64(s108)
				if (i != 2) {
					st64(p, ld64(p) + 1)
					bm = ld64(s220 + 0x30)
					st64(bm + 8, o)
					st64(bm, i)
					return j
				}
				st64(s250, ld32(s101 + 1))
				st64(s220 + 0x10, p)
				const pool_state_2: AccountInfo = accounts.pool_state
				st64(s240, s50)
				AccountInfo_clone_f338(s50, pool_state_2)
				const aa = ld64(accounts + 0x148)
				const w = ld64(accounts + 0x138)
				const v = accounts.pool_state.key
				copyr(s148, v, 0x20)
				const x = ld64(ld64(w + 0x58))
				copyr(s128, x, 0x20)
				const y = ld8(ld64(s220 + 0x20) + 0x22)
				st64(se8 + 0x10, sc)
				st64(se8, s128)
				st64(s101 + 9, s148)
				st64(s108, 0x100159d89)
				st8(sc, y)
				st64(sd0, 1)
				st64(se8 + 8, 0x20)
				st64(s101 + 0x11, 0x20)
				st64(s101 + 1, 0xa)
				st64(sff0, accounts + 0x168, s108)
				st64(s1000, w)
				st64(s248, accounts + 0x178)
				st64(s1000 + 8, accounts + 0x178)
				st64(sfe8 + 8, 4)
				const z = ld64(s240)
				const ab = fn_81db0(s188, accounts, z, aa, w, accounts + 0x178, accounts + 0x168, s108, 4)
				copyr(s220, s188, 0x10)
				j = ptr_drop_in_place_fcd8(z, ab)
				i = ld64(s220)
				o = ld64(s220 + 8)
				p = ld64(s220 + 0x10)
				if (i != 2) {
					st64(p, ld64(p) + 1)
					bm = ld64(s220 + 0x30)
					st64(bm + 8, o)
					st64(bm, i)
					return j
				}
				const pool_state_3: AccountInfo = accounts.pool_state
				st64(s240, s50)
				AccountInfo_clone_f338(s50, pool_state_3)
				const ai = ld64(accounts + 0x150)
				const token_mint_1: Mint = accounts.token_mint_1
				const ad = accounts.pool_state.key
				copyr(s148, ad, 0x20)
				const af = token_mint_1.info.key
				copyr(s128, af, 0x20)
				const ag = ld8(ld64(s220 + 0x20) + 0x23)
				st64(se8 + 0x10, sc)
				st64(se8, s128)
				st64(s101 + 9, s148)
				st64(s108, 0x100159d89)
				st8(sc, ag)
				st64(sd0, 1)
				st64(se8 + 8, 0x20)
				st64(s101 + 0x11, 0x20)
				st64(s101 + 1, 0xa)
				st64(sff0, accounts + 0x170, s108)
				st64(s1000 + 8, ld64(s248))
				st64(s1000, token_mint_1)
				st64(sfe8 + 8, 4)
				const ah = ld64(s240)
				const aj = fn_81db0(s198, accounts, ah, ai, token_mint_1, ld64(s1000 + 8), accounts + 0x170, s108, 4)
				copyr(s220, s198, 0x10)
				j = ptr_drop_in_place_fcd8(ah, aj)
				i = ld64(s220)
				o = ld64(s220 + 8)
				p = ld64(s220 + 0x10)
				if (i != 2) {
					st64(p, ld64(p) + 1)
					bm = ld64(s220 + 0x30)
					st64(bm + 8, o)
					st64(bm, i)
					return j
				}
				j = fn_66e8(s108, ld64(accounts + 0x158), undef, o, undef, j)
				o = ld64(s101 + 9)
				i = ld64(s101 + 1)
				if (ld64(s108) != 0) {
					st64(p, ld64(p) + 1)
					bm = ld64(s220 + 0x30)
					st64(bm + 8, o)
					st64(bm, i)
					return j
				}
				const ak = o
				j = fn_697e0(s1a8, i, s168)
				const al = ld64(o)
				o = ld64(s1a8 + 8)
				i = ld64(s1a8)
				st64(ak, al + 1)
				p = ld64(s220 + 0x10)
				if (i != 2) {
					st64(p, ld64(p) + 1)
					bm = ld64(s220 + 0x30)
					st64(bm + 8, o)
					st64(bm, i)
					return j
				}
				const au = ld8(ld64(s220 + 0x20) + 0x21)
				const am = ld64(ld64(accounts + 8))
				copyr(s148, am, 0x20)
				const an = ld64(ld64(accounts + 0x148))
				copyr(s128, an, 0x20)
				const ao = ld64(ld64(accounts + 0x150))
				copyr(s50, ao, 0x20)
				const at = ld64(accounts + 0x128)
				const ar = ld64(accounts + 0x138)
				const token_mint_1_2: Mint = accounts.token_mint_1
				const ap = ld64(ld64(accounts + 0x158))
				copyr(s108, ap, 0x20)
				st64(sfe8 + 0x38, ld8(ld64(s220 + 0x28) + 0x10))
				st64(sfe8, s148, s128, s50, at, ar, token_mint_1_2, s108)
				st64(sff0, ld64(s250))
				st64(s1000, ld64(s238 + 8))
				st64(s1000 + 8, 0)
				j = fn_6a7e8(s1b8, ld64(s238 + 0x10), au, ld64(s238), ld64(s1000), 0, ld64(sff0), s148, s128, s50, at, ar, token_mint_1_2, s108, ld64(sfe8 + 0x38))
				o = ld64(s1b8 + 8)
				i = ld64(s1b8)
				if (i != 2) {
					st64(p, ld64(p) + 1)
					bm = ld64(s220 + 0x30)
					st64(bm + 8, o)
					st64(bm, i)
					return j
				}
				st16(ld64(s238 + 0x10) + 0x17f, ld64(s220 + 0x18))
				if (ld8(ld64(s220 + 0x28) + 0x11) != 0) {
					o = h * 0x30 + remaining_accounts - 0x30
					if (h == 0) {
						j = fn_581c0(s1c8)
						o = ld64(s1c8 + 8)
						i = ld64(s1c8)
						if (i != 2) {
							st64(p, ld64(p) + 1)
							bm = ld64(s220 + 0x30)
							st64(bm + 8, o)
							st64(bm, i)
							return j
						}
					}
					j = fn_ded0(s108, o)
					if (ld64(s108) == 0) {
						i = ld64(s101 + 1)
						o = ld64(s101 + 9)
						p = ld64(s220 + 0x10)
						st64(p, ld64(p) + 1)
						bm = ld64(s220 + 0x30)
						st64(bm + 8, o)
						st64(bm, i)
						return j
					}
					const bq = ld16(sc8 + 0x12)
					const bp = ld16(sc8 + 0x14)
					const bo = ld16(sc8 + 0x16)
					const bn = ld32(sc8 + 8)
					st64(sfe8, ld32(sc8 + 0xc))
					st64(s1000, bp, bo, bn)
					j = fn_6fe30(s1d8, ld64(s238 + 0x10), ld64(s250), bq, bp, bo, bn, ld64(sfe8))
					o = ld64(s1d8 + 8)
					i = ld64(s1d8)
					p = ld64(s220 + 0x10)
					if (i != 2) {
						st64(p, ld64(p) + 1)
						bm = ld64(s220 + 0x30)
						st64(bm + 8, o)
						st64(bm, i)
						return j
					}
				}
				j = fn_6940(s108, ld64(accounts + 0x160), av, o, aw, j)
				o = ld64(s101 + 9)
				i = ld64(s101 + 1)
				if (ld64(s108) != 0) {
					st64(p, ld64(p) + 1)
					bm = ld64(s220 + 0x30)
					st64(bm + 8, o)
					st64(bm, i)
					return j
				}
				st64(i + 0x18, ld64(s158 + 8))
				st64(i + 0x10, ld64(s158))
				st64(i + 8, ld64(s168 + 8))
				st64(i, ld64(s168))
				memset2(i + 0x20, 0, 0x700)
				st64(o, ld64(o) + 1)
				const ax = ld64(ld64(ld64(accounts + 0x138) + 0x58))
				copyr(s108, ax, 0x20)
				const ay = accounts.token_mint_1.info.key
				copyr(se8, ay, 0x20)
				const bc = ld16(ld64(accounts + 0x128) + 0x72)
				const az = accounts.pool_state.key
				copyr(sc8, az, 0x20)
				const ba = ld64(ld64(accounts + 0x148))
				copyr(sa8, ba, 0x20)
				const bb = ld64(ld64(accounts + 0x150))
				const bg = ld64(bb)
				const bf = ld64(bb + 8)
				const be = ld64(bb + 0x10)
				const bd = ld64(bb + 0x18)
				st32(s68 + 0x10, ld64(s250))
				st16(s68 + 0x14, bc)
				copy(s68, s238, 0x10)
				st64(s88, bg, bf, be, bd)
				fn_10fb10(s50, s108)
				copyr(s128, s48, 0x10)
				j = log_data(s128, 1)
				st64(p, ld64(p) + 1)
				bm = ld64(s220 + 0x30)
				st64(bm + 8, undef)
				st64(bm, 2)
				return j
			}
		}
		fn_85138(s148, 0x100159868)
		st64(s128, 0, 1, 0)
		st64(s30, s128, 0x10015f818)
		st8(s30 + 0x18, 3)
		st64(s30 + 0x10, 0x20)
		st64(s48 + 8, 0)
		st64(s50, 0)
		if (fn_88558(0x100159868, s50) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(sd0, s128, 0x18)
		copy(se8, s148, 0x18)
		st64(s101 + 1, 0x10015a380)
		st32(s88 + 0x18, 0x1792 /* error::NotSupportMint */)
		st8(sc8 + 0x10, 2)
		st32(s101 + 0x11, 0xa0)
		st64(s101 + 9, 0x39)
		st64(s108, 0)
		j = fn_13e5a0(s178, s108)
		i = ld64(s178)
		bm = ld64(s220 + 0x30)
		st64(bm + 8, ld64(s178 + 8))
		st64(bm, i)
		return j
	}
	bm = ld64(s220 + 0x30)
	st64(bm + 8, o)
	st64(bm, i)
	return j
}

export function fn_581c0(a: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128
	fn_85138(s78, 0x1001598a0)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x1001598a0, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a380)
	st32(sf8 + 0x78, 0x1772 /* error::AccountLack */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0xe5)
	st64(s118 + 0x10, 0x39)
	st64(s118, 0)
	const g = fn_13e5a0(s128, s118)
	const f = ld64(s128)
	st64(a + 8, ld64(s128 + 8))
	st64(a, f)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_100310(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30
	let h, i, j: u64
	let l = fn_a80(s10, ld64(b + 0x130), c)
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
	l = fn_8a8(s20, ld64(b + 0x158), c)
	f = ld64(s20)
	if (f == 2) {
		l = fn_c58(s30, ld64(b + 0x160), c)
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
