/// <reference path="../lib.d.ts" />
// instruction create_customizable_pool
import { anchor_error_from, fn_10fb10, fn_13e5a0, fn_13e628, fn_1476d8, fn_147a20, fn_14ed60, fn_4130, fn_4688, fn_6490, fn_65410, fn_66e8, fn_6940, fn_697e0, fn_6a7e8, fn_6fe30, fn_7e058, fn_7e560, fn_81db0, fn_85138, fn_88558, fn_ded0, fn_f6fe8, fn_f75f0, log_data, memcpy, memset2 } from '../shared.ts'

// instruction handler: create_customizable_pool (discriminator sha256("global:create_customizable_pool")[..8] = 0x1a42f59a7d4442b)
// accounts [idl]: 0 pool_creator [signer, mut], 1 amm_config, 2 pool_state [mut, pda], 3 token_mint_0, 4 token_mint_1, 5 token_vault_0 [mut, pda], 6 token_vault_1 [mut, pda], 7 observation_state [mut, pda], 8 tick_array_bitmap [mut, pda], 9 token_program_0, 10 token_program_1, 11 system_program [= 11111111111111111111111111111111], 12 rent [= SysvarRent111111111111111111111111111111111]
// args [idl]: customizable_params: CreateCustomizableParams
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
export function ix_create_customizable_pool(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s68 = fp - 0x68, s70 = fp - 0x70, s80 = fp - 0x80, se8 = fp - 0xe8, s100 = fp - 0x100, s110 = fp - 0x110, s118 = fp - 0x118, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, sff8 = fp - 0xff8
	let l, p: u64
	const f = sol_log("Instruction: CreateCustomizablePool", 0x23)
	st64(s100, ix_args, ix_args_len)
	const i = fn_f75f0(s80, s100, f)
	const h = ld64(s80)
	const g = ld8(s70 + 1)
	if (g == 2) {
		const n = (h & 3) - 2
		if (2 > n) {
			p = anchor_error_from(s160, 0x66 /* anchor::InstructionDidNotDeserialize */, n)
			l = ld64(s160)
			st64(a + 8, ld64(s160 + 8))
			st64(a, l)
			return p
		}
		if ((h & 3) == 0) {
			p = anchor_error_from(s160, 0x66 /* anchor::InstructionDidNotDeserialize */, n)
			l = ld64(s160)
			st64(a + 8, ld64(s160 + 8))
			st64(a, l)
			return p
		}
		const o = ld64(ld64(h + 7))
		if (o == 0) {
			p = anchor_error_from(s160, 0x66 /* anchor::InstructionDidNotDeserialize */, n)
			l = ld64(s160)
			st64(a + 8, ld64(s160 + 8))
			st64(a, l)
			return p
		}
		callx(o, ld64(h - 1), o, n)
		p = anchor_error_from(s160, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s160)
		st64(a + 8, ld64(s160 + 8))
		st64(a, l)
		return p
	}
	st8(s130 + 0x10, ld8(s70))
	st64(s130 + 8, ld64(s80 + 8))
	st32(s130 + 0x12, ld32(s70 + 2))
	st16(s130 + 0x16, ld16(s70 + 6))
	st8(s130 + 0x11, g)
	st32(s130, h, h >> 0x20)
	st8(s118 + 4, -1)
	st32(s118, -1)
	st64(s110, accounts, accounts_len)
	st64(sff8, s118)
	p = accounts_create_customizable_pool(s80, program_id, s110, undef, fp, i)
	const k = ld64(s70)
	l = ld64(s80 + 8)
	const j = ld64(s80)
	if (j == 0) {
		st64(a + 8, k)
		st64(a, l)
		return p
	}
	const m = memcpy(se8, s68, 0x68)
	st64(s100, j, l, k)
	st32(s68 + 8, ld32(s118))
	st8(s68 + 0xc, ld8(s118 + 4))
	copyr(s70, s110, 0x10)
	st64(s80, program_id, s100)
	p = fn_55688(s140, s80, s130, m)
	l = ld64(s140)
	if (l == 2) {
		p = fn_f6fe8(s150, s100, program_id)
		l = ld64(s150)
		st64(a + 8, ld64(s150 + 8))
		st64(a, l)
		return p
	}
	st64(a + 8, ld64(s140 + 8))
	st64(a, l)
	return p
}

// Anchor Accounts::try_accounts of instruction create_customizable_pool (called by ix_create_customizable_pool; name [str]: from the handler's "Instruction: …" log; was fn_eeb80)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_vault_0 (AccountNotEnoughKeys, ConstraintSeeds, ConstraintMut), token_vault_1 (AccountNotEnoughKeys, ConstraintSeeds, ConstraintMut), token_program_0, token_program_1, system_program, rent, token_mint_0 (ConstraintRaw), pool_creator (ConstraintMut), tick_array_bitmap (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), observation_state (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), pool_state (ConstraintSeeds, ConstraintMut, ConstraintRentExempt)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: pool_creator [idl], pool_state [idl]
export function accounts_create_customizable_pool(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s50 = fp - 0x50, s60 = fp - 0x60, s78 = fp - 0x78, s80 = fp - 0x80, sa0 = fp - 0xa0, sc0 = fp - 0xc0, se0 = fp - 0xe0, s100 = fp - 0x100, s120 = fp - 0x120, s140 = fp - 0x140, s170 = fp - 0x170, s190 = fp - 0x190, s191 = fp - 0x191, s1b8 = fp - 0x1b8, s1d0 = fp - 0x1d0, s1f0 = fp - 0x1f0, s210 = fp - 0x210, s211 = fp - 0x211, s238 = fp - 0x238, s250 = fp - 0x250, s268 = fp - 0x268, s270 = fp - 0x270, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2b1 = fp - 0x2b1, s2d8 = fp - 0x2d8, s2f0 = fp - 0x2f0, s308 = fp - 0x308, s310 = fp - 0x310, s318 = fp - 0x318, s320 = fp - 0x320, s328 = fp - 0x328, s330 = fp - 0x330, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s598 = fp - 0x598, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s5c8 = fp - 0x5c8, s5d8 = fp - 0x5d8, s5e8 = fp - 0x5e8, s5f8 = fp - 0x5f8, s608 = fp - 0x608, s618 = fp - 0x618, s628 = fp - 0x628, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s668 = fp - 0x668, s678 = fp - 0x678, s688 = fp - 0x688, s698 = fp - 0x698, s6d8 = fp - 0x6d8, s700 = fp - 0x700, s708 = fp - 0x708, s710 = fp - 0x710, s718 = fp - 0x718, s720 = fp - 0x720
	let h, u, x, ad, ae, af, ah, al, am, ao, ap, ar, at, bt, bu: u64
	st64(s338, b)
	let y = try_accounts_17a30(s80, c, c, d, e, r0)
	const pool_creator: AccountInfo = ld64(s78)
	let f = ld64(s80)
	if (f == 2) {
		const m = ld64(e - 0xff8)
		st64(s330, pool_creator)
		y = try_accounts_184d8(s80, c)
		if (ld64(s80) == 0) {
			const s = ld64(0x300000000 /* heap bump-allocator cursor */)
			f = ld64(s78)
			const t = s != 0 ? sat_sub(s, 0xa) : 0x300007ff6
			u = ld64(s78 + 8)
			if (f != 0) {
				if (0x300000008 > t) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, t)
				st64(t, 0x666e6f635f6d6d61)
				st16(t + 8, 0x6769)
				void ld64(u)
			} else {
				if (0x300000008 > t) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, t)
				st64(t, 0x666e6f635f6d6d61)
				st16(t + 8, 0x6769)
				void ld64(u)
			}
			st64(u + 0x10, t, 0xa)
			st64(u + 8, 0xa)
			st64(u, 1)
			st64(a + 0x10, u)
			st64(a + 8, f)
			st64(a, 0)
			return y
		}
		const l = ld64(0x300000000 /* heap bump-allocator cursor */)
		st64(s6d8 + 0x38, m)
		const n = l != 0 ? sat_sub(l, 0x78) : 0x300007f88
		if (0x300000008 > n) {
			alloc_handle_alloc_error(8, 0x78)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, n & -8)
		if ((n & -8) != 0) {
			memcpy(n & -8, s80, 0x78)
			const o = ld64(c + 8)
			if (o == 0) {
				y = anchor_error_from(s698, 0xbbd /* anchor::AccountNotEnoughKeys */)
				f = ld64(s698)
				st64(a + 0x10, ld64(s698 + 8))
				st64(a + 8, f)
				st64(a, 0)
				return y
			}
			const p: AccountInfo = ld64(c)
			st64(s328, p)
			st64(c + 8, o - 1)
			st64(s6d8 + 0x30, p)
			st64(c, p + 0x30)
			y = try_accounts_15c0(s80, c)
			h = undef
			if (ld32(s80) == 2) {
				const w = ld64(0x300000000 /* heap bump-allocator cursor */)
				f = ld64(s78)
				x = w != 0 ? sat_sub(w, 0xc) : 0x300007ff4
				u = ld64(s78 + 8)
				if (f != 0) {
					if (0x300000008 > x) {
						raw_vec_handle_error(1, 0xc, 0x10015f8f8, 0x300000008, h)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, x)
					st64(x, 0x696d5f6e656b6f74)
					st32(x + 8, 0x305f746e)
					void ld64(u)
				} else {
					if (0x300000008 > x) {
						raw_vec_handle_error(1, 0xc, 0x10015f8f8, 0x300000008, h)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, x)
					st64(x, 0x696d5f6e656b6f74)
					st32(x + 8, 0x305f746e)
					void ld64(u)
				}
			} else {
				const q = ld64(0x300000000 /* heap bump-allocator cursor */)
				const r = q != 0 ? sat_sub(q, 0x80) : 0x300007f80
				if (0x300000008 > r) {
					alloc_handle_alloc_error(8, 0x80)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, r & -8)
				if ((r & -8) == 0) {
					alloc_handle_alloc_error(8, 0x80)
				}
				st64(s6d8 + 0x28, r & -8)
				memcpy(r & -8, s80, 0x80)
				y = try_accounts_15c0(s80, c)
				h = undef
				if (ld32(s80) != 2) {
					const z = ld64(0x300000000 /* heap bump-allocator cursor */)
					const aa = z != 0 ? sat_sub(z, 0x80) : 0x300007f80
					if (0x300000008 > aa) {
						alloc_handle_alloc_error(8, 0x80)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, aa & -8)
					if ((aa & -8) != 0) {
						B47: {
							B37: {
								st64(s6d8 + 0x20, aa & -8)
								memcpy(aa & -8, s80, 0x80)
								const ac = ld64(c + 8)
								if (ac == 0) {
									anchor_error_from(s348, 0xbbd /* anchor::AccountNotEnoughKeys */, undef, ae, af)
									u = ld64(s348 + 8)
									const ai = ld64(s348)
									if (ai == 2) {
										break B37
									}
									y = fn_4130(s358, ai, u, "token_vault_0", 0xd)
									u = ld64(s358 + 8)
									f = ld64(s358)
									if (f != 2) {
										st64(a + 0x10, u)
										st64(a + 8, f)
										st64(a, 0)
										return y
									}
									ad = ld64(c + 8)
									if (ad == 0) {
										break B37
									}
								} else {
									u = ld64(c)
									st64(c, u + 0x30)
									ad = ac - 1
									st64(c + 8, ad)
									if (ad == 0) {
										break B37
									}
								}
								st64(s6d8 + 0x18, u)
								u = ld64(c)
								st64(c, u + 0x30)
								ah = ad - 1
								st64(c + 8, ah)
								if (ah == 0) {
									y = anchor_error_from(s688, 0xbbd /* anchor::AccountNotEnoughKeys */, u, ae, af)
									f = ld64(s688)
									st64(a + 0x10, ld64(s688 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return y
								}
								break B47
							}
							st64(s6d8 + 0x18, u)
							anchor_error_from(s368, 0xbbd /* anchor::AccountNotEnoughKeys */, u, ae, af)
							u = undef
							const ag = ld64(s368)
							if (ag == 2) {
								y = anchor_error_from(s688, 0xbbd /* anchor::AccountNotEnoughKeys */, u, ae, af)
								f = ld64(s688)
								st64(a + 0x10, ld64(s688 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return y
							}
							y = fn_4130(s378, ag, ld64(s368 + 8), "token_vault_1", 0xd)
							u = ld64(s378 + 8)
							f = ld64(s378)
							if (f != 2) {
								st64(a + 0x10, u)
								st64(a + 8, f)
								st64(a, 0)
								return y
							}
							ah = ld64(c + 8)
							if (ah == 0) {
								y = anchor_error_from(s688, 0xbbd /* anchor::AccountNotEnoughKeys */, u, ae, af)
								f = ld64(s688)
								st64(a + 0x10, ld64(s688 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return y
							}
						}
						const aj: AccountInfo = ld64(c)
						st64(s320, aj)
						st64(c + 8, ah - 1)
						st64(c, aj + 0x30)
						if (ah != 1) {
							st64(s6d8, u, aj + 0x30)
							st64(s318, aj + 0x30)
							st64(c + 8, ah - 2)
							st64(s6d8 + 0x10, aj)
							st64(c, aj + 0x60)
							try_accounts_120(s80, c, u, aj + 0x30, aj)
							u = ld64(s78)
							const ak = ld64(s80)
							if (ak != 2) {
								y = fn_4130(s388, ak, u, "token_program_0", 0xf)
								u = ld64(s388 + 8)
								f = ld64(s388)
								if (f != 2) {
									st64(a + 0x10, u)
									st64(a + 8, f)
									st64(a, 0)
									return y
								}
							}
							st64(s700 + 0x20, u)
							try_accounts_120(s80, c, u, al, am)
							u = ld64(s78)
							const an = ld64(s80)
							if (an != 2) {
								y = fn_4130(s398, an, u, "token_program_1", 0xf)
								u = ld64(s398 + 8)
								f = ld64(s398)
								if (f != 2) {
									st64(a + 0x10, u)
									st64(a + 8, f)
									st64(a, 0)
									return y
								}
							}
							st64(s700 + 0x18, u)
							try_accounts_18870(s80, c, u, ao, ap)
							u = ld64(s78)
							const aq = ld64(s80)
							if (aq != 2) {
								y = fn_4130(s3a8, aq, u, "system_program", 0xe)
								u = ld64(s3a8 + 8)
								f = ld64(s3a8)
								if (f != 2) {
									st64(a + 0x10, u)
									st64(a + 8, f)
									st64(a, 0)
									return y
								}
							}
							st64(s700 + 0x10, u)
							st64(s310, u)
							try_accounts_17ae0(s80, c, u, ar, at)
							const aw = ld64(s78 + 8)
							const av = ld64(s78)
							const au = ld64(s80)
							if (au == 0) {
								y = fn_4130(s668, av, aw, 0x1001598f8 /* "rent" */, 4)
								f = ld64(s668)
								st64(a + 0x10, ld64(s668 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return y
							}
							st64(s700, au, av)
							st64(s708, ld64(s78 + 0x10))
							rent_get(s80)
							copy(s2f0, s78, 0x18)
							if (ld64(s80) != 0) {
								y = fn_13e628(s658, s2f0)
								f = ld64(s658)
								st64(a + 0x10, ld64(s658 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return y
							}
							st64(s710, aw)
							copyr(s308, s2f0, 0x18)
							const ax = ld64(ld64(n & -8))
							copyr(s2b0, ax, 0x20)
							const ay = ld64(ld64(ld64(s6d8 + 0x28) + 0x58))
							copyr(se0, ay, 0x20)
							const az = ld64(s6d8 + 0x20)
							const ba = ld64(ld64(az + 0x58))
							const be = ld64(ba)
							const bd = ld64(ba + 8)
							const bc = ld64(ba + 0x10)
							const bb = ld64(ba + 0x18)
							st64(s80, 0x10015984c)
							st64(s78 + 8, s2b0)
							st64(s60, se0)
							st64(s50, sc0)
							st64(sc0, be, bd, bc, bb)
							st64(s78, 4)
							st64(s78 + 0x10, 0x20)
							st64(s60 + 8, 0x20)
							st64(s50 + 8, 0x20)
							// PDA find_program_address(["pool", *ax, *ay, *sc0], program *(ld64(s338)))
							Pubkey_find_program_address(s170, s80, 4, ld64(s338))
							copyr(s2d8, s170, 0x20)
							const bf = ld8(s170 + 0x20)
							st8(s2b1, bf)
							st8(ld64(s6d8 + 0x38), bf)
							const bg = ld64(ld64(s6d8 + 0x30) /* key */)
							copyr(s290, bg, 0x20)
							if ((memcmp(s290, s2d8, 0x20) as u32) == 0) {
								st64(s50, az, s2b1, s338)
								st64(s60 + 8, ld64(s6d8 + 0x28))
								st64(s80, s328, s308, s330, s310, n & -8)
								y = fn_f1f80(s170, s80)
								const pool_state: AccountInfo = ld64(s170 + 8)
								f = ld64(s170)
								if (f == 2) {
									st64(s270, pool_state)
									if (pool_state.is_writable != 0) {
										st64(s718, pool_state)
										AccountInfo_clone_f338(s170, pool_state)
										st64(s6d8 + 0x30, fn_147a20(s170))
										AccountInfo_clone_f338(s80, ld64(s270))
										AccountInfo_try_data_len(sc0, s80)
										const bl = ld64(sc0 + 8)
										const bk = ld64(sc0)
										if (bk == 0x800000000000001a /* Ok */) {
											const bm = Rent_is_exempt(s308, ld64(s6d8 + 0x30), bl)
											ptr_drop_in_place_fcd8(s170, ptr_drop_in_place_fcd8(s80, bm))
											if (bm != 0) {
												rent_get(s80)
												copy(s250, s78, 0x18)
												if (ld64(s80) != 0) {
													y = fn_13e628(s648, s250)
													f = ld64(s648)
													st64(a + 0x10, ld64(s648 + 8))
													st64(a + 8, f)
													st64(a, 0)
													return y
												}
												copyr(s268, s250, 0x18)
												const bn = ld64(ld64(s718))
												copyr(s210, bn, 0x20)
												st64(s170, 0x10015afbf, 0xb, s210, 0x20)
												// PDA find_program_address(["observation", *bn], program *(ld64(s338)))
												Pubkey_find_program_address(s80, s170, 2, ld64(s338))
												copyr(s238, s80, 0x20)
												const bo = ld8(s60)
												st8(s211, bo)
												st8(ld64(s6d8 + 0x38) + 3, bo)
												const bp = ld64(ld64(s6d8 + 0x10) /* key */)
												copyr(s1f0, bp, 0x20)
												if ((memcmp(s1f0, s238, 0x20) as u32) == 0) {
													st64(s80, s320, s268, s330, s310, s270, s211, s338)
													y = fn_f3bb8(s170, s80)
													st64(s6d8 + 0x30, ld64(s170 + 8))
													f = ld64(s170)
													if (f == 2) {
														if (ld8(ld64(s6d8 + 0x30) + 0x29 /* is_writable */) != 0) {
															AccountInfo_clone_f338(s170, ld64(s6d8 + 0x30))
															st64(s6d8 + 0x10, fn_147a20(s170))
															AccountInfo_clone_f338(s80, ld64(s6d8 + 0x30))
															AccountInfo_try_data_len(sc0, s80)
															const bw = ld64(sc0 + 8)
															const bv = ld64(sc0)
															if (bv != 0x800000000000001a /* Ok */) {
																st64(sc0 + 0x10, ld64(sc0 + 0x10))
																st64(sc0, bv, bw)
																bu = fn_13e628(s488, sc0)
																bt = ld64(s488)
																st64(a + 0x10, ld64(s488 + 8))
																st64(a + 8, bt)
																st64(a, 0)
																return ptr_drop_in_place_fcd8(s170, ptr_drop_in_place_fcd8(s80, bu))
															}
															const bx = Rent_is_exempt(s268, ld64(s6d8 + 0x10), bw)
															ptr_drop_in_place_fcd8(s170, ptr_drop_in_place_fcd8(s80, bx))
															if (bx != 0) {
																rent_get(s80)
																copy(s1d0, s78, 0x18)
																if (ld64(s80) != 0) {
																	y = fn_13e628(s638, s1d0)
																	f = ld64(s638)
																	st64(a + 0x10, ld64(s638 + 8))
																	st64(a + 8, f)
																	st64(a, 0)
																	return y
																}
																copyr(s2b0, s1d0, 0x18)
																st64(sc0 + 0x10, s170)
																st64(sc0, 0x1001595c0)
																copyr(s170, s210, 0x20)
																st64(sc0 + 0x18, 0x20)
																st64(sc0 + 8, 0x20)
																// PDA find_program_address(["pool_tick_array_bitmap_extension", *s170], program *(ld64(s338)))
																Pubkey_find_program_address(s80, sc0, 2, ld64(s338))
																copyr(s1b8, s80, 0x20)
																const by = ld8(s60)
																st8(s191, by)
																st8(ld64(s6d8 + 0x38) + 4, by)
																const bz = ld64(ld64(s6d8 + 8))
																copyr(s190, bz, 0x20)
																if ((memcmp(s190, s1b8, 0x20) as u32) == 0) {
																	st64(s80, s318, s2b0, s330, s310, s270, s191, s338)
																	y = fn_f55d0(s170, s80)
																	st64(s6d8 + 0x10, ld64(s170 + 8))
																	f = ld64(s170)
																	if (f == 2) {
																		if (ld8(ld64(s6d8 + 0x10) + 0x29 /* is_writable */) != 0) {
																			AccountInfo_clone_f338(s170, ld64(s6d8 + 0x10))
																			st64(s6d8 + 8, fn_147a20(s170))
																			AccountInfo_clone_f338(s80, ld64(s6d8 + 0x10))
																			AccountInfo_try_data_len(sc0, s80)
																			const ce = ld64(sc0 + 8)
																			const cd = ld64(sc0)
																			if (cd != 0x800000000000001a /* Ok */) {
																				st64(sc0 + 0x10, ld64(sc0 + 0x10))
																				st64(sc0, cd, ce)
																				bu = fn_13e628(s508, sc0)
																				bt = ld64(s508)
																				st64(a + 0x10, ld64(s508 + 8))
																				st64(a + 8, bt)
																				st64(a, 0)
																				return ptr_drop_in_place_fcd8(s170, ptr_drop_in_place_fcd8(s80, bu))
																			}
																			const cf = Rent_is_exempt(s2b0, ld64(s6d8 + 8), ce)
																			ptr_drop_in_place_fcd8(s170, ptr_drop_in_place_fcd8(s80, cf))
																			if (cf != 0) {
																				if (pool_creator.is_writable != 0) {
																					const cg = ld64(ld64(s6d8 + 0x28) + 0x58)
																					st64(s6d8 + 8, cg)
																					const ch = ld64(cg)
																					copyr(s170, ch, 0x20)
																					const ci = ld64(ld64(s6d8 + 0x20) + 0x58)
																					st64(s720, ci)
																					const cj = ld64(ci)
																					copyr(s80, cj, 0x20)
																					if ((memcmp(s170, s80, 0x20) as i32) < 0) {
																						const ck = ld64(ld64(s700 + 0x20))
																						copyr(s80, ck, 0x20)
																						if ((memcmp(ld64(ld64(s6d8 + 8) + 0x18), s80, 0x20) as u32) != 0) {
																							y = anchor_error_from(s578, 0x7e6 /* anchor::ConstraintMintTokenProgram */)
																							f = ld64(s578)
																							st64(a + 0x10, ld64(s578 + 8))
																							st64(a + 8, f)
																							st64(a, 0)
																							return y
																						}
																						const cl = ld64(ld64(s700 + 0x18))
																						copyr(s80, cl, 0x20)
																						if ((memcmp(ld64(ld64(s720) + 0x18), s80, 0x20) as u32) == 0) {
																							copyr(se0, s210, 0x20)
																							copyr(sc0, ch, 0x20)
																							st64(s80, 0x100159d89, 0xa, se0, 0x20, sc0, 0x20)
																							// PDA find_program_address(["pool_vault", *se0, *ch], program *(ld64(s338)))
																							Pubkey_find_program_address(s170, s80, 3, ld64(s338))
																							copyr(s140, s170, 0x20)
																							st8(ld64(s6d8 + 0x38) + 1, ld8(s170 + 0x20))
																							const cm = ld64(ld64(s6d8 + 0x18) /* key */)
																							copyr(s120, cm, 0x20)
																							if ((memcmp(s120, s140, 0x20) as u32) == 0) {
																								if (ld8(ld64(s6d8 + 0x18) + 0x29 /* is_writable */) != 0) {
																									copyr(se0, s210, 0x20)
																									const cq = ld64(ld64(ld64(s6d8 + 0x20) + 0x58))
																									const cu = ld64(cq)
																									const ct = ld64(cq + 8)
																									const cs = ld64(cq + 0x10)
																									const cr = ld64(cq + 0x18)
																									st64(s80, 0x100159d89)
																									st64(s78 + 8, se0)
																									st64(s60, sc0)
																									st64(sc0, cu, ct, cs, cr)
																									st64(s78, 0xa)
																									st64(s78 + 0x10, 0x20)
																									st64(s60 + 8, 0x20)
																									// PDA find_program_address(["pool_vault", *se0, *sc0], program *(ld64(s338)))
																									Pubkey_find_program_address(s170, s80, 3, ld64(s338))
																									copyr(s100, s170, 0x20)
																									st8(ld64(s6d8 + 0x38) + 2, ld8(s170 + 0x20))
																									const cv = ld64(ld64(s6d8) /* key */)
																									copyr(sa0, cv, 0x20)
																									y = memcmp(sa0, s100, 0x20) as u32
																									if (y != 0) {
																										anchor_error_from(s5e8, 0x7d6 /* anchor::ConstraintSeeds */)
																										const cy = fn_4130(s5f8, ld64(s5e8), ld64(s5e8 + 8), "token_vault_1", 0xd)
																										const cx = ld64(s5f8 + 8)
																										const cw = ld64(s5f8)
																										copyr(s80, sa0, 0x20)
																										copy(s60, s100, 0x20)
																										y = Error_with_pubkeys(s608, cw, cx, s80, cy)
																										f = ld64(s608)
																										st64(a + 0x10, ld64(s608 + 8))
																										st64(a + 8, f)
																										st64(a, 0)
																										return y
																									}
																									if (ld8(ld64(s6d8) + 0x29 /* is_writable */) != 0) {
																										st64(a + 0x78, ld64(s708))
																										st64(a + 0x70, ld64(s710))
																										st64(a + 0x68, ld64(s700 + 8))
																										st64(a + 0x60, ld64(s700))
																										st64(a + 0x58, ld64(s700 + 0x10))
																										st64(a + 0x50, ld64(s700 + 0x18))
																										st64(a + 0x48, ld64(s700 + 0x20))
																										st64(a + 0x40, ld64(s6d8 + 0x10))
																										st64(a + 0x38, ld64(s6d8 + 0x30))
																										st64(a + 0x30, ld64(s6d8))
																										st64(a + 0x28, ld64(s6d8 + 0x18))
																										st64(a + 0x20, ld64(s6d8 + 0x20))
																										st64(a + 0x18, ld64(s6d8 + 0x28))
																										st64(a + 0x10, ld64(s718))
																										st64(a + 8, n & -8)
																										st64(a, pool_creator)
																										return y
																									}
																									anchor_error_from(s618, 0x7d0 /* anchor::ConstraintMut */)
																									y = fn_4130(s628, ld64(s618), ld64(s618 + 8), "token_vault_1", 0xd)
																									f = ld64(s628)
																									st64(a + 0x10, ld64(s628 + 8))
																									st64(a + 8, f)
																									st64(a, 0)
																									return y
																								}
																								anchor_error_from(s5c8, 0x7d0 /* anchor::ConstraintMut */)
																								y = fn_4130(s5d8, ld64(s5c8), ld64(s5c8 + 8), "token_vault_0", 0xd)
																								f = ld64(s5d8)
																								st64(a + 0x10, ld64(s5d8 + 8))
																								st64(a + 8, f)
																								st64(a, 0)
																								return y
																							}
																							anchor_error_from(s598, 0x7d6 /* anchor::ConstraintSeeds */)
																							const cp = fn_4130(s5a8, ld64(s598), ld64(s598 + 8), "token_vault_0", 0xd)
																							const co = ld64(s5a8 + 8)
																							const cn = ld64(s5a8)
																							copyr(s80, s120, 0x20)
																							copy(s60, s140, 0x20)
																							y = Error_with_pubkeys(s5b8, cn, co, s80, cp)
																							f = ld64(s5b8)
																							st64(a + 0x10, ld64(s5b8 + 8))
																							st64(a + 8, f)
																							st64(a, 0)
																							return y
																						}
																						y = anchor_error_from(s588, 0x7e6 /* anchor::ConstraintMintTokenProgram */)
																						f = ld64(s588)
																						st64(a + 0x10, ld64(s588 + 8))
																						st64(a + 8, f)
																						st64(a, 0)
																						return y
																					}
																					anchor_error_from(s558, 0x7d3 /* anchor::ConstraintRaw */)
																					y = fn_4130(s568, ld64(s558), ld64(s558 + 8), "token_mint_0", 0xc)
																					f = ld64(s568)
																					st64(a + 0x10, ld64(s568 + 8))
																					st64(a + 8, f)
																					st64(a, 0)
																					return y
																				}
																				anchor_error_from(s538, 0x7d0 /* anchor::ConstraintMut */)
																				y = fn_4130(s548, ld64(s538), ld64(s538 + 8), "pool_creator", 0xc)
																				f = ld64(s548)
																				st64(a + 0x10, ld64(s548 + 8))
																				st64(a + 8, f)
																				st64(a, 0)
																				return y
																			}
																			anchor_error_from(s518, 0x7d5 /* anchor::ConstraintRentExempt */)
																			y = fn_4130(s528, ld64(s518), ld64(s518 + 8), 0x10015afdb /* "tick_array_bitmap" */, 0x11)
																			f = ld64(s528)
																			st64(a + 0x10, ld64(s528 + 8))
																			st64(a + 8, f)
																			st64(a, 0)
																			return y
																		}
																		anchor_error_from(s4e8, 0x7d0 /* anchor::ConstraintMut */)
																		y = fn_4130(s4f8, ld64(s4e8), ld64(s4e8 + 8), 0x10015afdb /* "tick_array_bitmap" */, 0x11)
																		f = ld64(s4f8)
																		st64(a + 0x10, ld64(s4f8 + 8))
																		st64(a + 8, f)
																		st64(a, 0)
																		return y
																	}
																	st64(a + 0x10, ld64(s6d8 + 0x10))
																	st64(a + 8, f)
																	st64(a, 0)
																	return y
																}
																anchor_error_from(s4b8, 0x7d6 /* anchor::ConstraintSeeds */)
																const cc = fn_4130(s4c8, ld64(s4b8), ld64(s4b8 + 8), 0x10015afdb /* "tick_array_bitmap" */, 0x11)
																const cb = ld64(s4c8 + 8)
																const ca = ld64(s4c8)
																copyr(s80, s190, 0x20)
																copy(s60, s1b8, 0x20)
																y = Error_with_pubkeys(s4d8, ca, cb, s80, cc)
																f = ld64(s4d8)
																st64(a + 0x10, ld64(s4d8 + 8))
																st64(a + 8, f)
																st64(a, 0)
																return y
															}
															anchor_error_from(s498, 0x7d5 /* anchor::ConstraintRentExempt */)
															y = fn_4130(s4a8, ld64(s498), ld64(s498 + 8), "observation_state", 0x11)
															f = ld64(s4a8)
															st64(a + 0x10, ld64(s4a8 + 8))
															st64(a + 8, f)
															st64(a, 0)
															return y
														}
														anchor_error_from(s468, 0x7d0 /* anchor::ConstraintMut */)
														y = fn_4130(s478, ld64(s468), ld64(s468 + 8), "observation_state", 0x11)
														f = ld64(s478)
														st64(a + 0x10, ld64(s478 + 8))
														st64(a + 8, f)
														st64(a, 0)
														return y
													}
													st64(a + 0x10, ld64(s6d8 + 0x30))
													st64(a + 8, f)
													st64(a, 0)
													return y
												}
												anchor_error_from(s438, 0x7d6 /* anchor::ConstraintSeeds */)
												const bs = fn_4130(s448, ld64(s438), ld64(s438 + 8), "observation_state", 0x11)
												const br = ld64(s448 + 8)
												const bq = ld64(s448)
												copyr(s80, s1f0, 0x20)
												copy(s60, s238, 0x20)
												y = Error_with_pubkeys(s458, bq, br, s80, bs)
												f = ld64(s458)
												st64(a + 0x10, ld64(s458 + 8))
												st64(a + 8, f)
												st64(a, 0)
												return y
											}
											anchor_error_from(s418, 0x7d5 /* anchor::ConstraintRentExempt */)
											y = fn_4130(s428, ld64(s418), ld64(s418 + 8), "pool_state", 0xa)
											f = ld64(s428)
											st64(a + 0x10, ld64(s428 + 8))
											st64(a + 8, f)
											st64(a, 0)
											return y
										}
										st64(sc0 + 0x10, ld64(sc0 + 0x10))
										st64(sc0, bk, bl)
										bu = fn_13e628(s408, sc0)
										bt = ld64(s408)
										st64(a + 0x10, ld64(s408 + 8))
										st64(a + 8, bt)
										st64(a, 0)
										return ptr_drop_in_place_fcd8(s170, ptr_drop_in_place_fcd8(s80, bu))
									}
									anchor_error_from(s3e8, 0x7d0 /* anchor::ConstraintMut */)
									y = fn_4130(s3f8, ld64(s3e8), ld64(s3e8 + 8), "pool_state", 0xa)
									f = ld64(s3f8)
									st64(a + 0x10, ld64(s3f8 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return y
								}
								st64(a + 0x10, pool_state)
								st64(a + 8, f)
								st64(a, 0)
								return y
							}
							anchor_error_from(s3b8, 0x7d6 /* anchor::ConstraintSeeds */)
							const bj = fn_4130(s3c8, ld64(s3b8), ld64(s3b8 + 8), "pool_state", 0xa)
							const bi = ld64(s3c8 + 8)
							const bh = ld64(s3c8)
							copyr(s80, s290, 0x20)
							copy(s60, s2d8, 0x20)
							y = Error_with_pubkeys(s3d8, bh, bi, s80, bj)
							f = ld64(s3d8)
							st64(a + 0x10, ld64(s3d8 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return y
						}
						y = anchor_error_from(s678, 0xbbd /* anchor::AccountNotEnoughKeys */, u, aj + 0x30, aj)
						f = ld64(s678)
						st64(a + 0x10, ld64(s678 + 8))
						st64(a + 8, f)
						st64(a, 0)
						return y
					}
					alloc_handle_alloc_error(8, 0x80)
				}
				const ab = ld64(0x300000000 /* heap bump-allocator cursor */)
				f = ld64(s78)
				x = ab != 0 ? sat_sub(ab, 0xc) : 0x300007ff4
				u = ld64(s78 + 8)
				if (f != 0) {
					if (0x300000008 > x) {
						raw_vec_handle_error(1, 0xc, 0x10015f8f8, 0x300000008, h)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, x)
					st64(x, 0x696d5f6e656b6f74)
					st32(x + 8, 0x315f746e)
					void ld64(u)
				} else {
					if (0x300000008 > x) {
						raw_vec_handle_error(1, 0xc, 0x10015f8f8, 0x300000008, h)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, x)
					st64(x, 0x696d5f6e656b6f74)
					st32(x + 8, 0x315f746e)
					void ld64(u)
				}
			}
			st64(u + 0x10, x, 0xc)
			st64(u + 8, 0xc)
			st64(u, 1)
			st64(a + 0x10, u)
			st64(a + 8, f)
			st64(a, 0)
			return y
		}
		alloc_handle_alloc_error(8, 0x78)
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	h = 0xc > g
	const i = h != 0 ? 0 : g - 0xc
	const j = g != 0 ? i : 0x300007ff4
	if ((f & 1) != 0) {
		if (0x300000008 > j) {
			raw_vec_handle_error(1, 0xc, 0x10015f8f8, i, h)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st64(j, 0x6572635f6c6f6f70)
		st32(j + 8, 0x726f7461)
		void pool_creator.key
	} else {
		if (0x300000008 > j) {
			raw_vec_handle_error(1, 0xc, 0x10015f8f8, i, h)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st64(j, 0x6572635f6c6f6f70)
		st32(j + 8, 0x726f7461)
		void pool_creator.key
	}
	st64(pool_creator + 0x10, j, 0xc)
	st64(pool_creator + 8, 0xc)
	st64(pool_creator, 1)
	st64(a + 0x10, pool_creator)
	st64(a + 8, f)
	st64(a, 0)
	return y
}

export function fn_f1f80(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s2 = fp - 0x2, s28 = fp - 0x28, s48 = fp - 0x48, s68 = fp - 0x68, s98 = fp - 0x98, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sc9 = fp - 0xc9, sf0 = fp - 0xf0, s110 = fp - 0x110, s130 = fp - 0x130, s140 = fp - 0x140, s1a8 = fp - 0x1a8, s1c8 = fp - 0x1c8, s1e8 = fp - 0x1e8, s200 = fp - 0x200, s208 = fp - 0x208, s228 = fp - 0x228, s270 = fp - 0x270, s290 = fp - 0x290, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2c8 = fp - 0x2c8, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s358 = fp - 0x358, s388 = fp - 0x388, s390 = fp - 0x390, s3d0 = fp - 0x3d0, s3d8 = fp - 0x3d8, s3e0 = fp - 0x3e0
	let ag, ck, cn, co: u64
	const f: AccountInfo = ld64(ld64(b))
	const g = fn_147a20(f, b, c, d, e)
	st64(s358 + 0x10, a)
	if (g != 0) {
		const j = ld64(b + 0x10)
		const k = ld64(ld64(j))
		copyr(s228, k, 0x20)
		const l = f.key
		copy(s200, l + 8, 0x18)
		st64(s208, ld64(l))
		if ((memcmp(s228, s208, 0x20) as u32) == 0) {
			ErrorCode_name(s48, 0x100159890)
			st64(s28, 0, 1, 0)
			st64(s98, s28, 0x10015f818)
			st8(s98 + 0x18, 3)
			st64(s98 + 0x10, 0x20)
			st64(sb8 + 0x10, 0)
			st64(sb8, 0)
			if (ErrorCode_fmt(0x100159890, sb8) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(s2a8, s28, 0x18)
			copy(s2c0, s48, 0x18)
			st64(s2e0 + 8, 0x10015a347)
			st32(s270 + 0x28, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s290, 2)
			st32(s2c8, 8)
			st64(s2e0 + 0x10, 0x39)
			st64(s2e0, 0)
			const aj = fn_13e5a0(s320, s2e0)
			const ai = ld64(s320 + 8)
			const ah = ld64(s320)
			copy(s2e0, s228, 0x40)
			ck = Error_with_pubkeys(s330, ah, ai, s2e0, aj)
			const al = ld64(s330)
			const ak = ld64(s358 + 0x10)
			st64(ak + 8, ld64(s330 + 8))
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
			st64(s358 + 8, ao)
			rc_inc(am, an)
			const ap: LamportsCell = f.lamports
			const aq = ap.strong
			st64(s388 + 8, f.key)
			st64(s388 + 0x10, n.executable)
			st64(s388 + 0x18, n.is_writable)
			st64(s388 + 0x20, n.is_signer)
			st64(s388 + 0x28, n.rent_epoch)
			st64(s358, n.owner)
			rc_inc(ap, aq)
			const ar: DataCell = f.data
			const at = ar.strong
			st64(s390, ap, am)
			rc_inc(ar, at)
			const au: AccountInfo = ld64(ld64(b + 0x18))
			const av: LamportsCell = au.lamports
			const aw = av.strong
			st64(s3d0 + 0x10, f.executable)
			st64(s3d0 + 0x18, f.is_writable)
			st64(s3d0 + 0x20, f.is_signer)
			st64(s3d0 + 0x28, f.rent_epoch)
			st64(s3d0 + 0x30, f.owner)
			st64(s3d0 + 0x38, au.key)
			rc_inc(av, aw)
			const ax: DataCell = au.data
			const ay = ax.strong
			st64(s3d0, o, sat_sub(m, g))
			rc_inc(ax, ay)
			st64(s3d8, au.owner)
			const bc = au.rent_epoch
			const bb = au.is_signer
			const ba = au.is_writable
			const az = au.executable
			st8(s1a8 + 0x62, ld64(s3d0 + 0x10))
			st8(s1a8 + 0x61, ld64(s3d0 + 0x18))
			st8(s1a8 + 0x60, ld64(s3d0 + 0x20))
			st64(s1a8 + 0x58, ld64(s3d0 + 0x28))
			st64(s1a8 + 0x50, ld64(s3d0 + 0x30))
			st64(s1a8 + 0x48, ar)
			st64(s1a8 + 0x40, ld64(s390))
			st64(s1a8 + 0x38, ld64(s388 + 8))
			st8(s1a8 + 0x32, ld64(s388 + 0x10))
			st8(s1a8 + 0x31, ld64(s388 + 0x18))
			st8(s1a8 + 0x30, ld64(s388 + 0x20))
			st64(s1a8 + 0x28, ld64(s388 + 0x28))
			st64(s1a8 + 0x20, ld64(s358))
			st64(s1a8 + 0x18, ld64(s388))
			st64(s1a8 + 0x10, ld64(s3d0))
			st64(s1a8 + 8, ld64(s358 + 8))
			st8(s1a8, bb, ba, az)
			st64(s1c8 + 0x18, bc)
			st64(s1c8 + 0x10, ld64(s3d8))
			st64(s1c8, av, ax)
			st64(s1e8 + 0x18, ld64(s3d0 + 0x38))
			st64(s140, 8, 0)
			st64(s1e8, 0, 8, 0)
			ck = system_program_transfer(s2f0, s1e8, ld64(s3d0 + 8))
			ag = ld64(s2f0)
			if (ag != 2) {
				co = ld64(s2f0 + 8)
				cn = ld64(s358 + 0x10)
				st64(cn, ag, co)
				return ck
			}
		}
		const bd: LamportsCell = f.lamports
		const bj = f.key
		rc_inc(bd)
		const be: DataCell = f.data
		rc_inc(be)
		st64(s358, be)
		const bf = ld64(b + 0x18)
		const bg: AccountInfo = ld64(bf)
		const bh: LamportsCell = bg.lamports
		const bi = bh.strong
		st64(s388 + 0x10, f.executable)
		st64(s388 + 0x18, f.is_writable)
		st64(s388 + 0x20, f.is_signer)
		st64(s388 + 0x28, f.rent_epoch)
		st64(s358 + 8, f.owner)
		const bs = bg.key
		rc_inc(bh, bi)
		st64(s388 + 8, bj)
		const bk: DataCell = bg.data
		rc_inc(bk)
		st64(s3d0 + 0x30, bf)
		st64(s390, bg.owner)
		st64(s3d0 + 0x38, bg.rent_epoch)
		st64(s388, bd)
		const br = bg.is_signer
		const bq = bg.is_writable
		const bp = bg.executable
		const bl = ld64(ld64(ld64(b + 0x20)))
		copyr(s130, bl, 0x20)
		const bm = ld64(ld64(ld64(b + 0x28) + 0x58))
		copyr(s110, bm, 0x20)
		const bn = ld64(ld64(ld64(b + 0x30) + 0x58))
		copyr(sf0, bn, 0x20)
		const bo = ld8(ld64(b + 0x38))
		st64(s98 + 0x20, sc9)
		st64(s98 + 0x10, sf0)
		st64(s98, s110)
		st64(sb8 + 0x10, s130)
		st64(sb8, 0x10015984c)
		st8(sc9, bo)
		st64(s28, sb8)
		st64(s270 + 8, s28)
		st8(s270, br, bq, bp)
		st64(s290 + 0x18, ld64(s3d0 + 0x38))
		st64(s290 + 0x10, ld64(s390))
		st64(s298, bs, bh, bk)
		st8(s2a8 + 0xa, ld64(s388 + 0x10))
		st8(s2a8 + 9, ld64(s388 + 0x18))
		st8(s2a8 + 8, ld64(s388 + 0x20))
		st64(s2a8, ld64(s388 + 0x28))
		copyr(s2b8, s358, 0x10)
		st64(s2c0, ld64(s388))
		st64(s2c8, ld64(s388 + 8))
		st64(s98 + 0x28, 1)
		st64(s98 + 0x18, 0x20)
		st64(s98 + 8, 0x20)
		st64(sb8 + 0x18, 0x20)
		st64(sb8 + 8, 4)
		st64(s28 + 8, 5)
		st64(s270 + 0x10, 1)
		st64(s2e0, 0, 8, 0)
		ck = system_program_assign_13fb30(s300, s2e0, 0x608)
		ag = ld64(s300)
		if (ag != 2) {
			co = ld64(s300 + 8)
			cn = ld64(s358 + 0x10)
			st64(cn, ag, co)
			return ck
		}
		const bt: LamportsCell = f.lamports
		const bv = ld64(s3d0 + 0x30)
		const cb = f.key
		rc_inc(bt)
		const bu: DataCell = f.data
		rc_inc(bu)
		const bw: AccountInfo = ld64(bv)
		const bx: LamportsCell = bw.lamports
		const by = bx.strong
		st64(s388 + 0x18, f.executable)
		st64(s388 + 0x20, f.is_writable)
		st64(s388 + 0x28, f.is_signer)
		st64(s358, f.rent_epoch)
		st64(s358 + 8, f.owner)
		st64(s388 + 0x10, bw.key)
		rc_inc(bx, by)
		const bz: DataCell = bw.data
		const ca = bz.strong
		st64(s388, cb, bt)
		rc_inc(bz, ca)
		st64(s390, bw.owner)
		const cf = bw.rent_epoch
		const ce = bw.is_signer
		const cd = bw.is_writable
		const cc = bw.executable
		copy(s68, s130, 0x60)
		st8(s2, ld8(sc9))
		st64(sc8, sb8, 5, 0x10015984c, 4, s68, 0x20, s48, 0x20, s28, 0x20, s2, 1)
		st64(s270 + 8, sc8)
		st8(s270, ce, cd, cc)
		st64(s290 + 0x18, cf)
		st64(s290 + 0x10, ld64(s390))
		st64(s290, bx, bz)
		st64(s298, ld64(s388 + 0x10))
		st8(s2a8 + 0xa, ld64(s388 + 0x18))
		st8(s2a8 + 9, ld64(s388 + 0x20))
		st8(s2a8 + 8, ld64(s388 + 0x28))
		st64(s2a8, ld64(s358))
		st64(s2b8 + 8, ld64(s358 + 8))
		st64(s2b8, bu)
		copyr(s2c8, s388, 0x10)
		st64(s270 + 0x10, 1)
		st64(s2e0, 0, 8, 0)
		ck = system_program_assign_13ff40(s310, s2e0, ld64(ld64(b + 0x40)))
		ag = ld64(s310)
		if (ag != 2) {
			co = ld64(s310 + 8)
			cn = ld64(s358 + 0x10)
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
		st64(s358, q)
		const r: LamportsCell = f.lamports
		st64(s358 + 8, r)
		const s = r.strong
		st64(s388 + 8, f.key)
		st64(s388 + 0x10, h.executable)
		st64(s388 + 0x18, h.is_writable)
		st64(s388 + 0x20, h.is_signer)
		st64(s388 + 0x28, h.rent_epoch)
		const t = h.owner
		rc_inc(ld64(s358 + 8), s)
		st64(s388, t)
		const u: DataCell = f.data
		rc_inc(u)
		st64(s390, i)
		const v: AccountInfo = ld64(ld64(b + 0x18))
		const w: LamportsCell = v.lamports
		const x = w.strong
		st64(s3d0 + 0x18, f.executable)
		st64(s3d0 + 0x20, f.is_writable)
		st64(s3d0 + 0x28, f.is_signer)
		st64(s3d0 + 0x30, f.rent_epoch)
		st64(s3d0 + 0x38, f.owner)
		const af = v.key
		rc_inc(w, x)
		st64(s3d0 + 0x10, y)
		const z: DataCell = v.data
		rc_inc(z)
		st64(s3d0 + 8, v.owner)
		st64(s3d0, v.rent_epoch)
		st64(s3d8, v.is_signer)
		st64(s3e0, v.is_writable)
		const ae = v.executable
		const aa = ld64(ld64(ld64(b + 0x20)))
		copyr(s68, aa, 0x20)
		const ab = ld64(ld64(ld64(b + 0x28) + 0x58))
		copyr(s48, ab, 0x20)
		const ac = ld64(ld64(ld64(b + 0x30) + 0x58))
		copyr(s28, ac, 0x20)
		const ad = ld8(ld64(b + 0x38))
		st64(s98 + 0x20, s2)
		st64(s98 + 0x10, s28)
		st64(s98, s48)
		st64(sb8 + 0x10, s68)
		st64(sb8, 0x10015984c)
		st8(s2, ad)
		st64(sc8, sb8)
		st64(s270 + 0x38, sc8)
		st8(s270 + 0x32, ld64(s3d0 + 0x18))
		st8(s270 + 0x31, ld64(s3d0 + 0x20))
		st8(s270 + 0x30, ld64(s3d0 + 0x28))
		st64(s270 + 0x28, ld64(s3d0 + 0x30))
		st64(s270 + 0x20, ld64(s3d0 + 0x38))
		st64(s270 + 0x18, u)
		st64(s270 + 0x10, ld64(s358 + 8))
		st64(s270 + 8, ld64(s388 + 8))
		st8(s270 + 2, ld64(s388 + 0x10))
		st8(s270 + 1, ld64(s388 + 0x18))
		st8(s270, ld64(s388 + 0x20))
		st64(s290 + 0x18, ld64(s388 + 0x28))
		st64(s290 + 0x10, ld64(s388))
		st64(s290 + 8, p)
		st64(s290, ld64(s390))
		st64(s298, ld64(s358))
		st8(s2a8 + 0xa, ae)
		st8(s2a8 + 9, ld64(s3e0))
		st8(s2a8 + 8, ld64(s3d8))
		st64(s2a8, ld64(s3d0))
		st64(s2b8 + 8, ld64(s3d0 + 8))
		st64(s2c8, af, w, z)
		st64(s98 + 0x28, 1)
		st64(s98 + 0x18, 0x20)
		st64(s98 + 8, 0x20)
		st64(sb8 + 0x18, 0x20)
		st64(sb8 + 8, 4)
		st64(sc8 + 8, 5)
		st64(s270 + 0x40, 1)
		st64(s2e0, 0, 8, 0)
		ck = system_program_create_account(s340, s2e0, ld64(s3d0 + 0x10), 0x608, ld64(ld64(b + 0x40)))
		ag = ld64(s340)
		if (ag != 2) {
			co = ld64(s340 + 8)
			cn = ld64(s358 + 0x10)
			st64(cn, ag, co)
			return ck
		}
	}
	const ch = ld64(s358 + 0x10)
	ck = fn_4688(s2e0, f)
	const ci = ld64(s2e0 + 8)
	const cg = ld64(s2e0)
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

export function fn_f3bb8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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
			st64(s260 + 8, 0x10015a347)
			st32(s1e0 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s210, 2)
			st32(s248, 8)
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

export function fn_f55d0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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
			st64(s260 + 8, 0x10015a347)
			st32(s1e0 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s210, 2)
			st32(s248, 8)
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

// types [heur]: b: CreateCustomizablePoolContext (the handler ix_create_customizable_pool passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_55688(a: u64, b: CreateCustomizablePoolContext, c: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s40 = fp - 0x40, s48 = fp - 0x48, s60 = fp - 0x60, s80 = fp - 0x80, sa0 = fp - 0xa0, sc0 = fp - 0xc0, sc8 = fp - 0xc8, se0 = fp - 0xe0, s100 = fp - 0x100, s120 = fp - 0x120, s140 = fp - 0x140, s141 = fp - 0x141, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s218 = fp - 0x218, s220 = fp - 0x220, s228 = fp - 0x228, s230 = fp - 0x230, sfe8 = fp - 0xfe8, sff0 = fp - 0xff0, s1000 = fp - 0x1000
	let ar, at, bf, bk: u64
	st64(s1e8, c, a)
	const h = b.remaining_accounts_len
	const remaining_accounts: AccountInfo = b.remaining_accounts
	st64(s218 + 0x28, b)
	const accounts: CreateCustomizablePoolAccounts = b.accounts
	let j = fn_7e058(s100, remaining_accounts, h, ld64(accounts + 0x18), r0)
	let n = ld64(s100 + 8)
	let i = ld64(s100)
	if (i != 2) {
		bf = ld64(s1e8 + 8)
		st64(bf + 8, n)
		st64(bf, i)
		return j
	}
	st64(s218 + 0x20, ld8(s100 + 8))
	j = fn_7e058(s100, remaining_accounts, h, ld64(accounts + 0x20), j)
	n = ld64(s100 + 8)
	i = ld64(s100)
	if (i != 2) {
		bf = ld64(s1e8 + 8)
		st64(bf + 8, n)
		st64(bf, i)
		return j
	}
	st64(s218 + 0x18, ld8(s100 + 8))
	j = fn_7e560(s100, ld64(accounts + 0x18), ld64(s218 + 0x20) & 1)
	n = ld64(s100 + 8)
	i = ld64(s100)
	if (i != 2) {
		bf = ld64(s1e8 + 8)
		st64(bf + 8, n)
		st64(bf, i)
		return j
	}
	if ((ld8(s100 + 8) & 1) != 0) {
		j = fn_7e560(s100, ld64(accounts + 0x20), ld64(s218 + 0x18) & 1)
		n = ld64(s100 + 8)
		i = ld64(s100)
		if (i != 2) {
			bf = ld64(s1e8 + 8)
			st64(bf + 8, n)
			st64(bf, i)
			return j
		}
		if ((ld8(s100 + 8) & 1) != 0) {
			const pool_state: AccountInfo = accounts.pool_state
			const l = pool_state.key
			copyr(s158, l + 0x10, 0x10)
			const m = ld64(l + 8)
			st64(s168 + 8, m)
			st64(s168, ld64(l))
			j = fn_6490(s100, pool_state, m, n, undef, j)
			const o = ld64(s100 + 0x10)
			const p = ld64(s100 + 8)
			n = o
			i = p
			if (ld64(s100) != 0) {
				bf = ld64(s1e8 + 8)
				st64(bf + 8, n)
				st64(bf, i)
				return j
			}
			st64(s220, p)
			st64(s218 + 0x20, o)
			const q = ld64(s1e8)
			const s = ld64(q + 8)
			const r = ld64(q)
			st64(s218, r, s)
			j = fn_65410(s100, r, s)
			n = ld64(s100 + 8)
			i = ld64(s100)
			if (i != 2) {
				bk = ld64(s218 + 0x20)
				st64(bk, ld64(bk) + 1)
				bf = ld64(s1e8 + 8)
				st64(bf + 8, n)
				st64(bf, i)
				return j
			}
			st64(s230, ld32(s100 + 8))
			const pool_state_2: AccountInfo = accounts.pool_state
			st64(s218 + 0x18, s48)
			AccountInfo_clone_f338(s48, pool_state_2)
			const y = ld64(accounts + 0x28)
			const v = ld64(accounts + 0x18)
			const u = accounts.pool_state.key
			copyr(s140, u, 0x20)
			const w = ld64(ld64(v + 0x58))
			copyr(s120, w, 0x20)
			const x = ld8(ld64(s218 + 0x28) + 0x21)
			st64(se0 + 0x10, s141)
			st64(se0, s120)
			st64(s100 + 0x10, s140)
			st64(s100, 0x100159d89)
			st8(s141, x)
			st64(sc8, 1)
			st64(se0 + 8, 0x20)
			st64(s100 + 0x18, 0x20)
			st64(s100 + 8, 0xa)
			st64(sff0, accounts + 0x48, s100)
			st64(s1000, v)
			st64(s228, accounts + 0x58)
			st64(s1000 + 8, accounts + 0x58)
			st64(sfe8 + 8, 4)
			const z = fn_81db0(s188, accounts, ld64(s218 + 0x18), y, v, accounts + 0x58, accounts + 0x48, s100, 4)
			st64(s218 + 0x10, ld64(s188 + 8))
			i = ld64(s188)
			j = ptr_drop_in_place_fcd8(ld64(s218 + 0x18), z)
			n = ld64(s218 + 0x10)
			if (i != 2) {
				bk = ld64(s218 + 0x20)
				st64(bk, ld64(bk) + 1)
				bf = ld64(s1e8 + 8)
				st64(bf + 8, n)
				st64(bf, i)
				return j
			}
			const pool_state_3: AccountInfo = accounts.pool_state
			st64(s218 + 0x18, s48)
			AccountInfo_clone_f338(s48, pool_state_3)
			const af = ld64(accounts + 0x30)
			const ac = ld64(accounts + 0x20)
			const ab = accounts.pool_state.key
			copyr(s140, ab, 0x20)
			const ad = ld64(ld64(ac + 0x58))
			copyr(s120, ad, 0x20)
			const ae = ld8(ld64(s218 + 0x28) + 0x22)
			st64(se0 + 0x10, s141)
			st64(se0, s120)
			st64(s100 + 0x10, s140)
			st64(s100, 0x100159d89)
			st8(s141, ae)
			st64(sc8, 1)
			st64(se0 + 8, 0x20)
			st64(s100 + 0x18, 0x20)
			st64(s100 + 8, 0xa)
			st64(sff0, accounts + 0x50, s100)
			st64(s1000 + 8, ld64(s228))
			st64(s1000, ac)
			st64(sfe8 + 8, 4)
			const ag = fn_81db0(s198, accounts, ld64(s218 + 0x18), af, ac, ld64(s1000 + 8), accounts + 0x50, s100, 4)
			st64(s218 + 0x10, ld64(s198 + 8))
			i = ld64(s198)
			j = ptr_drop_in_place_fcd8(ld64(s218 + 0x18), ag)
			n = ld64(s218 + 0x10)
			if (i != 2) {
				bk = ld64(s218 + 0x20)
				st64(bk, ld64(bk) + 1)
				bf = ld64(s1e8 + 8)
				st64(bf + 8, n)
				st64(bf, i)
				return j
			}
			j = fn_66e8(s100, ld64(accounts + 0x38), undef, n, undef, j)
			n = ld64(s100 + 0x10)
			i = ld64(s100 + 8)
			if (ld64(s100) != 0) {
				bk = ld64(s218 + 0x20)
				st64(bk, ld64(bk) + 1)
				bf = ld64(s1e8 + 8)
				st64(bf + 8, n)
				st64(bf, i)
				return j
			}
			const ah = n
			j = fn_697e0(s1a8, i, s168)
			const ai = ld64(n)
			n = ld64(s1a8 + 8)
			i = ld64(s1a8)
			st64(ah, ai + 1)
			if (i != 2) {
				bk = ld64(s218 + 0x20)
				st64(bk, ld64(bk) + 1)
				bf = ld64(s1e8 + 8)
				st64(bf + 8, n)
				st64(bf, i)
				return j
			}
			const aq = ld8(ld64(s218 + 0x28) + 0x20)
			const aj = accounts.pool_creator.key
			copyr(s140, aj, 0x20)
			const ak = ld64(ld64(accounts + 0x28))
			copyr(s120, ak, 0x20)
			const al = ld64(ld64(accounts + 0x30))
			copyr(s48, al, 0x20)
			const ap = ld64(accounts + 8)
			const ao = ld64(accounts + 0x18)
			const an = ld64(accounts + 0x20)
			const am = ld64(ld64(accounts + 0x38))
			copyr(s100, am, 0x20)
			st64(sfe8 + 0x38, ld8(ld64(s1e8) + 0x10))
			st64(sfe8, s140, s120, s48, ap, ao, an, s100)
			st64(sff0, ld64(s230))
			st64(s1000, ld64(s218 + 8))
			st64(s1000 + 8, 0)
			j = fn_6a7e8(s1b8, ld64(s220), aq, ld64(s218), ld64(s1000), 0, ld64(sff0), s140, s120, s48, ap, ao, an, s100, ld64(sfe8 + 0x38))
			n = ld64(s1b8 + 8)
			i = ld64(s1b8)
			if (i != 2) {
				bk = ld64(s218 + 0x20)
				st64(bk, ld64(bk) + 1)
				bf = ld64(s1e8 + 8)
				st64(bf + 8, n)
				st64(bf, i)
				return j
			}
			if (ld8(ld64(s1e8) + 0x11) != 0) {
				n = h * 0x30 + remaining_accounts - 0x30
				if (h == 0) {
					j = fn_567a0(s1c8)
					n = ld64(s1c8 + 8)
					i = ld64(s1c8)
					if (i != 2) {
						bk = ld64(s218 + 0x20)
						st64(bk, ld64(bk) + 1)
						bf = ld64(s1e8 + 8)
						st64(bf + 8, n)
						st64(bf, i)
						return j
					}
				}
				j = fn_ded0(s100, n)
				if (ld64(s100) == 0) {
					i = ld64(s100 + 8)
					n = ld64(s100 + 0x10)
					bk = ld64(s218 + 0x20)
					st64(bk, ld64(bk) + 1)
					bf = ld64(s1e8 + 8)
					st64(bf + 8, n)
					st64(bf, i)
					return j
				}
				const bj = ld16(sc0 + 0x12)
				const bi = ld16(sc0 + 0x14)
				const bh = ld16(sc0 + 0x16)
				const bg = ld32(sc0 + 8)
				st64(sfe8, ld32(sc0 + 0xc))
				st64(s1000, bi, bh, bg)
				j = fn_6fe30(s1d8, ld64(s220), ld64(s230), bj, bi, bh, bg, ld64(sfe8))
				n = ld64(s1d8 + 8)
				i = ld64(s1d8)
				if (i != 2) {
					bk = ld64(s218 + 0x20)
					st64(bk, ld64(bk) + 1)
					bf = ld64(s1e8 + 8)
					st64(bf + 8, n)
					st64(bf, i)
					return j
				}
			}
			j = fn_6940(s100, ld64(accounts + 0x40), ar, n, at, j)
			n = ld64(s100 + 0x10)
			i = ld64(s100 + 8)
			if (ld64(s100) != 0) {
				bk = ld64(s218 + 0x20)
				st64(bk, ld64(bk) + 1)
				bf = ld64(s1e8 + 8)
				st64(bf + 8, n)
				st64(bf, i)
				return j
			}
			st64(i + 0x18, ld64(s158 + 8))
			st64(i + 0x10, ld64(s158))
			st64(i + 8, ld64(s168 + 8))
			st64(i, ld64(s168))
			memset2(i + 0x20, 0, 0x700)
			st64(n, ld64(n) + 1)
			const au = ld64(ld64(ld64(accounts + 0x18) + 0x58))
			copyr(s100, au, 0x20)
			const av = ld64(ld64(ld64(accounts + 0x20) + 0x58))
			copyr(se0, av, 0x20)
			const az = ld16(ld64(accounts + 8) + 0x72)
			const aw = accounts.pool_state.key
			copyr(sc0, aw, 0x20)
			const ax = ld64(ld64(accounts + 0x28))
			copyr(sa0, ax, 0x20)
			const ay = ld64(ld64(accounts + 0x30))
			const bd = ld64(ay)
			const bc = ld64(ay + 8)
			const bb = ld64(ay + 0x10)
			const ba = ld64(ay + 0x18)
			st32(s60 + 0x10, ld64(s230))
			st16(s60 + 0x14, az)
			copy(s60, s218, 0x10)
			st64(s80, bd, bc, bb, ba)
			fn_10fb10(s48, s100)
			copyr(s120, s40, 0x10)
			j = log_data(s120, 1)
			const be = ld64(s218 + 0x20)
			st64(be, ld64(be) + 1)
			bf = ld64(s1e8 + 8)
			st64(bf + 8, undef)
			st64(bf, 2)
			return j
		}
	}
	fn_85138(s140, 0x100159868)
	st64(s120, 0, 1, 0)
	st64(s28, s120, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s40 + 8, 0)
	st64(s48, 0)
	if (fn_88558(0x100159868, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(sc8, s120, 0x18)
	copy(se0, s140, 0x18)
	st64(s100 + 8, 0x10015a347)
	st32(s80 + 0x18, 0x1792 /* error::NotSupportMint */)
	st8(sc0 + 0x10, 2)
	st32(s100 + 0x18, 0x93)
	st64(s100 + 0x10, 0x39)
	st64(s100, 0)
	j = fn_13e5a0(s178, s100)
	i = ld64(s178)
	bf = ld64(s1e8 + 8)
	st64(bf + 8, ld64(s178 + 8))
	st64(bf, i)
	return j
}

export function fn_567a0(a: u64): u64 {
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
	st64(s118 + 8, 0x10015a347)
	st32(sf8 + 0x78, 0x1772 /* error::AccountLack */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0xd9)
	st64(s118 + 0x10, 0x39)
	st64(s118, 0)
	const g = fn_13e5a0(s128, s118)
	const f = ld64(s128)
	st64(a + 8, ld64(s128 + 8))
	st64(a, f)
	return g
}
