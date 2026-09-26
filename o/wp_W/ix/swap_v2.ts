/// <reference path="../lib.d.ts" />
// instruction swap_v2
import { fn_11150, fn_12758, fn_147e78, fn_14c5c0, fn_2258, fn_3f9a0, fn_5bad0, fn_5c138, fn_5c328, fn_60de8, fn_62750, fn_6aa0, fn_7a5e0, fn_7cf50, fn_7e5e0, fn_82238, fn_89078, fn_bb88, log_data, memcpy } from '../shared.ts'

// instruction handler: swap_v2 (discriminator sha256("global:swap_v2")[..8] = 0x621ec91a0bed042b)
// accounts [str: the program's account-error strings, in order of first use]: token_program_a, whirlpool, token_mint_a, token_mint_b, tick_array_0, tick_array_1, tick_array_2, oracle, token_owner_account_a, token_vault_a, token_owner_account_b, token_vault_b, token_program_b, token_authority, memo_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
export function ix_swap_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s170 = fp - 0x170, s178 = fp - 0x178, s188 = fp - 0x188, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s1000 = fp - 0x1000
	let l, o, p, q, r, s: u64
	B9: {
		B8: {
			sol_log("Instruction: SwapV2", 0x13)
			const f = ix_args
			st64(s300, f)
			const g = ix_args_len
			if (g >= 8 && ((g & -8) != 8 && ((g & -0x10) != 0x10 && g != 0x20))) {
				let i = ld64(f)
				const j = ld64(f + 8)
				const t = ld64(f + 0x18)
				const k = ld64(f + 0x10)
				const h = ld8(f + 0x20)
				st8(s1, h)
				if (2 > h) {
					if (g == 0x21) {
						break B8
					}
					const ac = i
					i = ld8(f + 0x21)
					st64(s300, f + 0x22, g - 0x22)
					st8(s1, i)
					const ab = i
					if (2 > i) {
						fn_11150(s188, s300)
						l = ld64(s188 + 8)
						const u = ld64(s188)
						if (u != 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
							const aa = l
							const z = ld64(s178)
							st8(s1, 0xff)
							st64(s300, accounts, accounts_len)
							st64(s1000 + 8, s1)
							s = accounts_swap_v2(s188, program_id, s300, p, fp)
							const v = ld32(s188)
							if (v == 2) {
								r = ld64(s188 + 8)
								st64(a + 8, ld64(s178))
								st64(a, r)
								return s
							}
							const y = ld32(s188 + 4)
							const x = ld64(s188 + 8)
							const w = ld64(s178)
							memcpy(s2d8, s170, 0x150)
							st64(s2e8, x, w)
							st32(s2f0, v, y)
							st8(s170 + 8, ld8(s1))
							copyr(s178, s300, 0x10)
							st64(s188, program_id, s2f0)
							st64(s20, u, aa, z)
							st64(s1000, k, t, h != 0, ab != 0, s20)
							s = fn_3d688(s310, s188, ac, j, k, t, h != 0, ab != 0, s20)
							r = ld64(s310)
							if (r != 2) {
								st64(a + 8, ld64(s310 + 8))
								st64(a, r)
								return s
							}
							s = fn_e42f8(s320, s2f0, program_id)
							r = ld64(s320)
							st64(a + 8, ld64(s320 + 8))
							st64(a, r)
							return s
						}
						break B9
					}
				}
				st64(s188, 0x100159620)
				st64(s178, s20)
				st64(s20, s1, fn_14ef78)
				st64(s170 + 8, 0)
				st64(s188 + 8, 1)
				st64(s170, 1)
				// fmt "Invalid bool representation: {}" {} = *s1 [fn_14ef78]
				fn_147e78(s2f0, s188, i, j, k)
				l = fn_b580(s2f0)
				break B9
			}
		}
		l = fn_1459d0(0x100159468)
	}
	const m = l
	if (2 > (l & 3) - 2) {
		s = anchor_error_from(s330, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		r = ld64(s330)
		st64(a + 8, ld64(s330 + 8))
		st64(a, r)
		return s
	}
	if ((m & 3) == 0) {
		s = anchor_error_from(s330, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		r = ld64(s330)
		st64(a + 8, ld64(s330 + 8))
		st64(a, r)
		return s
	}
	const n = ld64(ld64(l + 7))
	callx(n, ld64(l - 1), n)
	s = anchor_error_from(s330, 0x66 /* anchor::InstructionDidNotDeserialize */)
	r = ld64(s330)
	st64(a + 8, ld64(s330 + 8))
	st64(a, r)
	return s
}

// Anchor Accounts::try_accounts of instruction swap_v2 (called by ix_swap_v2; name [str]: from the handler's "Instruction: …" log; was fn_e1d88)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_program_a (ConstraintAddress), whirlpool (ConstraintMut), token_mint_a (ConstraintAddress), token_mint_b (ConstraintAddress), tick_array_0 (AccountNotEnoughKeys, ConstraintMut), tick_array_1 (ConstraintMut), tick_array_2 (ConstraintMut), oracle (ConstraintSeeds, ConstraintMut), token_owner_account_a (ConstraintMut, ConstraintRaw), token_vault_a (ConstraintMut, ConstraintAddress), token_owner_account_b (ConstraintMut, ConstraintRaw), token_vault_b (ConstraintMut, ConstraintAddress), token_program_b (ConstraintAddress), token_authority, memo_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: token_owner_account_a_box, token_vault_a_box, token_owner_account_b_box, token_vault_b_box, token_program_a, whirlpool, token_vault_a, token_vault_b, oracle
export function accounts_swap_v2(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s230 = fp - 0x230, s270 = fp - 0x270, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2d0 = fp - 0x2d0, s2f0 = fp - 0x2f0, s330 = fp - 0x330, s350 = fp - 0x350, s390 = fp - 0x390, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s510 = fp - 0x510, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s560 = fp - 0x560, s570 = fp - 0x570, s580 = fp - 0x580, s590 = fp - 0x590, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s700 = fp - 0x700, s710 = fp - 0x710, s720 = fp - 0x720, s730 = fp - 0x730, s740 = fp - 0x740, s750 = fp - 0x750, s760 = fp - 0x760, s770 = fp - 0x770, s780 = fp - 0x780, s790 = fp - 0x790, s7e0 = fp - 0x7e0, s808 = fp - 0x808, s810 = fp - 0x810, s818 = fp - 0x818, s820 = fp - 0x820, s828 = fp - 0x828, s830 = fp - 0x830, s838 = fp - 0x838, s840 = fp - 0x840, s848 = fp - 0x848
	let aa, ab, ad, ae, af, ah, aj, al, cj: u64
	st64(s7e0 + 0x48, b)
	try_accounts_120(s290, c, c, d, e)
	const token_program_a: AccountInfo = ld64(s288)
	const f = ld64(s290)
	if (f != 2) {
		af = Error_with_account_name(s3c0, f, token_program_a, "token_program_a", 0xf)
		ae = ld64(s3c0)
		st64(a + 0x10, ld64(s3c0 + 8))
		st64(a + 8, ae)
		st32(a, 2)
		return af
	}
	const bz = ld64(e - 0xff8)
	try_accounts_120(s290, c)
	const h = ld64(s288)
	const g = ld64(s290)
	if (g == 2) {
		st64(s7e0 + 0x40, h)
		fn_12758(s290, c, h)
		const j = ld64(s288)
		const i = ld64(s290)
		if (i == 2) {
			st64(s7e0 + 0x38, j)
			try_accounts_11718(s290, c, j)
			const l = ld64(s288)
			const k = ld64(s290)
			if (k == 2) {
				st64(s7e0 + 0x30, l)
				try_accounts_11a48(s290, c, l)
				if (ld64(s290) == 0) {
					af = Error_with_account_name(s790, ld64(s288), ld64(s288 + 8), 0x100152b28 /* "whirlpool" */, 9)
					ae = ld64(s790)
					st64(a + 0x10, ld64(s790 + 8))
					st64(a + 8, ae)
					st32(a, 2)
					return af
				}
				const m = ld64(0x300000000 /* heap bump-allocator cursor */)
				const n = m != 0 ? sat_sub(m, 0x290) & -8 : 0x300007d70
				if (n > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, n)
					st64(s7e0 + 0x28, n)
					memcpy(n, s290, 0x290)
					try_accounts_610(s290, c)
					const p = ld32(s290)
					if (p == 2) {
						af = Error_with_account_name(s780, ld64(s288), ld64(s288 + 8), "token_mint_a", 0xc)
						ae = ld64(s780)
						st64(a + 0x10, ld64(s780 + 8))
						st64(a + 8, ae)
						st32(a, 2)
						return af
					}
					st64(s7e0 + 0x18, p)
					copyr(s7e0, s288, 0x10)
					st64(s7e0 + 0x10, ld32(s290 + 4))
					memcpy(s390, s278, 0x40)
					copy(s3b0, s230, 0x20)
					st64(s7e0 + 0x20, ld64(s270 + 0x38))
					try_accounts_610(s290, c)
					const q = ld32(s290)
					if (q == 2) {
						af = Error_with_account_name(s770, ld64(s288), ld64(s288 + 8), "token_mint_b", 0xc)
						ae = ld64(s770)
						st64(a + 0x10, ld64(s770 + 8))
						st64(a + 8, ae)
						st32(a, 2)
						return af
					}
					st64(s808 + 0x18, q)
					copyr(s808, s288, 0x10)
					st64(s808 + 0x10, ld32(s290 + 4))
					memcpy(s330, s278, 0x40)
					copy(s350, s230, 0x20)
					st64(s808 + 0x20, ld64(s270 + 0x38))
					fn_2258(s290, c)
					const token_owner_account_a_box: TokenAccount_2 = ld64(s288)
					const r = ld64(s290)
					if (r == 2) {
						st64(s810, token_owner_account_a_box)
						fn_2258(s290, c, token_owner_account_a_box)
						const token_vault_a_box: TokenAccount_2 = ld64(s288)
						const t = ld64(s290)
						if (t == 2) {
							st64(s818, token_vault_a_box)
							fn_2258(s290, c, token_vault_a_box)
							const token_owner_account_b_box: TokenAccount_2 = ld64(s288)
							const v = ld64(s290)
							if (v == 2) {
								st64(s820, token_owner_account_b_box)
								fn_2258(s290, c, token_owner_account_b_box)
								const token_vault_b_box: TokenAccount_2 = ld64(s288)
								const x = ld64(s290)
								if (x == 2) {
									B36: {
										B32: {
											B31: {
												const z = ld64(c + 8)
												st64(s828, token_vault_b_box)
												if (z != 0) {
													ad = ld64(c)
													st64(c, ad + 0x30, z - 1)
													if (z != 1) {
														st64(s830, ad)
														ah = ld64(c)
														st64(c, ah + 0x30, z - 2)
														if (z != 2) {
															st64(s838, ah)
															aj = ld64(c)
															st64(c, aj + 0x30, z - 3)
															if (z == 3) {
																break B32
															}
															st64(s840, aj)
															st64(c + 8, z - 4)
															al = ld64(c)
															st64(c, al + 0x30)
															break B36
														}
														break B31
													}
												} else {
													anchor_error_from(s440, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_b_box, aa, ab)
													ad = ld64(s440 + 8)
													const ac = ld64(s440)
													if (ac != 2) {
														af = Error_with_account_name(s450, ac, ad, "tick_array_0", 0xc)
														ae = ld64(s450)
														st64(a + 0x10, ld64(s450 + 8))
														st64(a + 8, ae)
														st32(a, 2)
														return af
													}
												}
												st64(s830, ad)
												anchor_error_from(s460, 0xbbd /* anchor::AccountNotEnoughKeys */, ad, aa, ab)
												ah = ld64(s460 + 8)
												const ag = ld64(s460)
												if (ag != 2) {
													af = Error_with_account_name(s470, ag, ah, "tick_array_1", 0xc)
													ae = ld64(s470)
													st64(a + 0x10, ld64(s470 + 8))
													st64(a + 8, ae)
													st32(a, 2)
													return af
												}
											}
											st64(s838, ah)
											anchor_error_from(s480, 0xbbd /* anchor::AccountNotEnoughKeys */, ah, aa, ab)
											aj = ld64(s480 + 8)
											const ai = ld64(s480)
											if (ai != 2) {
												af = Error_with_account_name(s490, ai, aj, "tick_array_2", 0xc)
												ae = ld64(s490)
												st64(a + 0x10, ld64(s490 + 8))
												st64(a + 8, ae)
												st32(a, 2)
												return af
											}
										}
										st64(s840, aj)
										anchor_error_from(s4a0, 0xbbd /* anchor::AccountNotEnoughKeys */, aj, aa, ab)
										al = ld64(s4a0 + 8)
										const ak = ld64(s4a0)
										if (ak != 2) {
											af = Error_with_account_name(s4b0, ak, al, 0x100154c38 /* "oracle" */, 6)
											ae = ld64(s4b0)
											st64(a + 0x10, ld64(s4b0 + 8))
											st64(a + 8, ae)
											st32(a, 2)
											return af
										}
									}
									const oracle: AccountInfo = al
									const am = token_program_a.key
									copyr(s2d0, am, 0x20)
									AccountInfo_clone(s290, ld64(s7e0 + 0x20))
									const an = ld64(s278)
									copy(s2b0, an, 0x20)
									const ap = ld64(s288 + 8)
									const ao = ld64(s288)
									rc_dec(ao)
									rc_dec(ap)
									if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
										const au = ld64(ld64(s7e0 + 0x40))
										copyr(s2d0, au, 0x20)
										AccountInfo_clone(s290, ld64(s808 + 0x20))
										const av = ld64(s278)
										copy(s2b0, av, 0x20)
										const ax = ld64(s288 + 8)
										const aw = ld64(s288)
										rc_dec(aw)
										rc_dec(ax)
										if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
											const whirlpool: AccountInfo = ld64(ld64(s7e0 + 0x28))
											st64(s848, whirlpool)
											if (whirlpool.is_writable == 0) {
												anchor_error_from(s750, 0x7d0 /* anchor::ConstraintMut */)
												af = Error_with_account_name(s760, ld64(s750), ld64(s750 + 8), 0x100152b28 /* "whirlpool" */, 9)
												ae = ld64(s760)
												st64(a + 0x10, ld64(s760 + 8))
												st64(a + 8, ae)
												st32(a, 2)
												return af
											}
											const bc = ld64(ld64(s7e0 + 0x20))
											copyr(s2d0, bc, 0x20)
											const bd = ld64(s7e0 + 0x28)
											copyr(s2b0, bd + 0x1a8, 0x20)
											if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
												anchor_error_from(s520, 0x7dc /* anchor::ConstraintAddress */)
												const bl = Error_with_account_name(s530, ld64(s520), ld64(s520 + 8), "token_mint_a", 0xc)
												const bk = ld64(s530 + 8)
												const bj = ld64(s530)
												copy(s290, s2d0, 0x40)
												af = fn_13b5c0(s540, bj, bk, s290, bl)
												ae = ld64(s540)
												st64(a + 0x10, ld64(s540 + 8))
												st64(a + 8, ae)
												st32(a, 2)
												return af
											}
											const be = ld64(ld64(s808 + 0x20))
											copyr(s2d0, be, 0x20)
											const bf = ld64(s7e0 + 0x28)
											copyr(s2b0, bf + 0x1e8, 0x20)
											if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
												if (ld8(ld64(ld64(s810) + 0x20) + 0x29) == 0) {
													anchor_error_from(s730, 0x7d0 /* anchor::ConstraintMut */)
													af = Error_with_account_name(s740, ld64(s730), ld64(s730 + 8), "token_owner_account_a", 0x15)
													ae = ld64(s740)
													st64(a + 0x10, ld64(s740 + 8))
													st64(a + 8, ae)
													st32(a, 2)
													return af
												}
												if ((memcmp(ld64(s810) + 0x28, ld64(s7e0 + 0x28) + 0x1a8, 0x20) as u32) == 0) {
													const token_vault_a: AccountInfo = ld64(ld64(s818) + 0x20)
													if (token_vault_a.is_writable != 0) {
														const bn = token_vault_a.key
														copyr(s2d0, bn, 0x20)
														const bo = ld64(s7e0 + 0x28)
														copyr(s2b0, bo + 0x1c8, 0x20)
														if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
															anchor_error_from(s5a0, 0x7dc /* anchor::ConstraintAddress */)
															const br = Error_with_account_name(s5b0, ld64(s5a0), ld64(s5a0 + 8), "token_vault_a", 0xd)
															const bq = ld64(s5b0 + 8)
															const bp = ld64(s5b0)
															copy(s290, s2d0, 0x40)
															af = fn_13b5c0(s5c0, bp, bq, s290, br)
															ae = ld64(s5c0)
															st64(a + 0x10, ld64(s5c0 + 8))
															st64(a + 8, ae)
															st32(a, 2)
															return af
														}
														if (ld8(ld64(ld64(s820) + 0x20) + 0x29) == 0) {
															anchor_error_from(s6f0, 0x7d0 /* anchor::ConstraintMut */)
															af = Error_with_account_name(s700, ld64(s6f0), ld64(s6f0 + 8), "token_owner_account_b", 0x15)
															ae = ld64(s700)
															st64(a + 0x10, ld64(s700 + 8))
															st64(a + 8, ae)
															st32(a, 2)
															return af
														}
														if ((memcmp(ld64(s820) + 0x28, ld64(s7e0 + 0x28) + 0x1e8, 0x20) as u32) == 0) {
															const token_vault_b: AccountInfo = ld64(ld64(s828) + 0x20)
															if (token_vault_b.is_writable != 0) {
																const bt = token_vault_b.key
																copyr(s2d0, bt, 0x20)
																const bu = ld64(s7e0 + 0x28)
																copyr(s2b0, bu + 0x208, 0x20)
																if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
																	anchor_error_from(s5f0, 0x7dc /* anchor::ConstraintAddress */)
																	const bx = Error_with_account_name(s600, ld64(s5f0), ld64(s5f0 + 8), "token_vault_b", 0xd)
																	const bw = ld64(s600 + 8)
																	const bv = ld64(s600)
																	copy(s290, s2d0, 0x40)
																	af = fn_13b5c0(s610, bv, bw, s290, bx)
																	ae = ld64(s610)
																	st64(a + 0x10, ld64(s610 + 8))
																	st64(a + 8, ae)
																	st32(a, 2)
																	return af
																}
																if (ld8(ld64(s830) + 0x29) == 0) {
																	anchor_error_from(s6b0, 0x7d0 /* anchor::ConstraintMut */)
																	af = Error_with_account_name(s6c0, ld64(s6b0), ld64(s6b0 + 8), "tick_array_0", 0xc)
																	ae = ld64(s6c0)
																	st64(a + 0x10, ld64(s6c0 + 8))
																	st64(a + 8, ae)
																	st32(a, 2)
																	return af
																}
																if (ld8(ld64(s838) + 0x29) != 0) {
																	if (ld8(ld64(s840) + 0x29) != 0) {
																		const by = ld64(ld64(s848))
																		copyr(s2b0, by, 0x20)
																		st64(s2d0, 0x100154c38, 6, s2b0, 0x20)
																		// PDA find_program_address(["oracle", *by], program *(ld64(s7e0 + 0x48)))
																		Pubkey_find_program_address(s290, s2d0, 2, ld64(s7e0 + 0x48))
																		copyr(s2f0, s290, 0x20)
																		st8(bz, ld8(s270))
																		const cb = oracle.key
																		copyr(s290, cb, 0x20)
																		if ((memcmp(s290, s2f0, 0x20) as u32) != 0) {
																			anchor_error_from(s620, 0x7d6 /* anchor::ConstraintSeeds */)
																			const ci = Error_with_account_name(s630, ld64(s620), ld64(s620 + 8), 0x100154c38 /* "oracle" */, 6)
																			const ch = ld64(s630 + 8)
																			const cg = ld64(s630)
																			copyr(s290, cb, 0x20)
																			copy(s270, s2f0, 0x20)
																			af = fn_13b5c0(s640, cg, ch, s290, ci)
																			cj = ld64(s640 + 8)
																			st64(a + 8, ld64(s640))
																			st64(a + 0x10, cj)
																			st32(a, 2)
																			return af
																		}
																		if (oracle.is_writable == 0) {
																			anchor_error_from(s650, 0x7d0 /* anchor::ConstraintMut */)
																			af = Error_with_account_name(s660, ld64(s650), ld64(s650 + 8), 0x100154c38 /* "oracle" */, 6)
																			cj = ld64(s660 + 8)
																			st64(a + 8, ld64(s660))
																			st64(a + 0x10, cj)
																			st32(a, 2)
																			return af
																		}
																		memcpy(a + 0x18, s390, 0x40)
																		copy(a + 0x60, s3b0, 0x20)
																		af = memcpy(a + 0x98, s330, 0x40)
																		const cf = ld64(s350 + 0x18)
																		const ce = ld64(s350 + 0x10)
																		const cd = ld64(s350 + 8)
																		const cc = ld64(s350)
																		copy(a + 8, s7e0, 0x10)
																		st64(a + 0x58, ld64(s7e0 + 0x20))
																		copy(a + 0x88, s808, 0x10)
																		st64(a + 0xd8, ld64(s808 + 0x20))
																		st64(a + 0x100, token_program_a)
																		st64(a + 0x108, ld64(s7e0 + 0x40))
																		st64(a + 0x110, ld64(s7e0 + 0x38))
																		st64(a + 0x118, ld64(s7e0 + 0x30))
																		st64(a + 0x120, ld64(s7e0 + 0x28))
																		st64(a + 0x128, ld64(s810))
																		st64(a + 0x130, ld64(s818))
																		st64(a + 0x138, ld64(s820))
																		st64(a + 0x140, ld64(s828))
																		st64(a + 0x148, ld64(s830))
																		st64(a + 0x150, ld64(s838))
																		st64(a + 0x158, ld64(s840))
																		st64(a + 0x160, oracle)
																		st32(a + 0x84, ld64(s808 + 0x10))
																		st32(a + 0x80, ld64(s808 + 0x18))
																		st32(a + 4, ld64(s7e0 + 0x10))
																		st32(a, ld64(s7e0 + 0x18))
																		st64(a + 0xe0, cc, cd, ce, cf)
																		return af
																	}
																	anchor_error_from(s670, 0x7d0 /* anchor::ConstraintMut */)
																	af = Error_with_account_name(s680, ld64(s670), ld64(s670 + 8), "tick_array_2", 0xc)
																	ae = ld64(s680)
																	st64(a + 0x10, ld64(s680 + 8))
																	st64(a + 8, ae)
																	st32(a, 2)
																	return af
																}
																anchor_error_from(s690, 0x7d0 /* anchor::ConstraintMut */)
																af = Error_with_account_name(s6a0, ld64(s690), ld64(s690 + 8), "tick_array_1", 0xc)
																ae = ld64(s6a0)
																st64(a + 0x10, ld64(s6a0 + 8))
																st64(a + 8, ae)
																st32(a, 2)
																return af
															}
															anchor_error_from(s6d0, 0x7d0 /* anchor::ConstraintMut */)
															af = Error_with_account_name(s6e0, ld64(s6d0), ld64(s6d0 + 8), "token_vault_b", 0xd)
															ae = ld64(s6e0)
															st64(a + 0x10, ld64(s6e0 + 8))
															st64(a + 8, ae)
															st32(a, 2)
															return af
														}
														anchor_error_from(s5d0, 0x7d3 /* anchor::ConstraintRaw */)
														af = Error_with_account_name(s5e0, ld64(s5d0), ld64(s5d0 + 8), "token_owner_account_b", 0x15)
														ae = ld64(s5e0)
														st64(a + 0x10, ld64(s5e0 + 8))
														st64(a + 8, ae)
														st32(a, 2)
														return af
													}
													anchor_error_from(s710, 0x7d0 /* anchor::ConstraintMut */)
													af = Error_with_account_name(s720, ld64(s710), ld64(s710 + 8), "token_vault_a", 0xd)
													ae = ld64(s720)
													st64(a + 0x10, ld64(s720 + 8))
													st64(a + 8, ae)
													st32(a, 2)
													return af
												}
												anchor_error_from(s580, 0x7d3 /* anchor::ConstraintRaw */)
												af = Error_with_account_name(s590, ld64(s580), ld64(s580 + 8), "token_owner_account_a", 0x15)
												ae = ld64(s590)
												st64(a + 0x10, ld64(s590 + 8))
												st64(a + 8, ae)
												st32(a, 2)
												return af
											}
											anchor_error_from(s550, 0x7dc /* anchor::ConstraintAddress */)
											const bi = Error_with_account_name(s560, ld64(s550), ld64(s550 + 8), "token_mint_b", 0xc)
											const bh = ld64(s560 + 8)
											const bg = ld64(s560)
											copy(s290, s2d0, 0x40)
											af = fn_13b5c0(s570, bg, bh, s290, bi)
											ae = ld64(s570)
											st64(a + 0x10, ld64(s570 + 8))
											st64(a + 8, ae)
											st32(a, 2)
											return af
										}
										anchor_error_from(s4f0, 0x7dc /* anchor::ConstraintAddress */)
										const ba = Error_with_account_name(s500, ld64(s4f0), ld64(s4f0 + 8), "token_program_b", 0xf)
										const az = ld64(s500 + 8)
										const ay = ld64(s500)
										copy(s290, s2d0, 0x40)
										af = fn_13b5c0(s510, ay, az, s290, ba)
										ae = ld64(s510)
										st64(a + 0x10, ld64(s510 + 8))
										st64(a + 8, ae)
										st32(a, 2)
										return af
									}
									anchor_error_from(s4c0, 0x7dc /* anchor::ConstraintAddress */)
									const at = Error_with_account_name(s4d0, ld64(s4c0), ld64(s4c0 + 8), "token_program_a", 0xf)
									const ar = ld64(s4d0 + 8)
									const aq = ld64(s4d0)
									copy(s290, s2d0, 0x40)
									af = fn_13b5c0(s4e0, aq, ar, s290, at)
									ae = ld64(s4e0)
									st64(a + 0x10, ld64(s4e0 + 8))
									st64(a + 8, ae)
									st32(a, 2)
									return af
								}
								af = Error_with_account_name(s430, x, token_vault_b_box, "token_vault_b", 0xd)
								ae = ld64(s430)
								st64(a + 0x10, ld64(s430 + 8))
								st64(a + 8, ae)
								st32(a, 2)
								return af
							}
							af = Error_with_account_name(s420, v, token_owner_account_b_box, "token_owner_account_b", 0x15)
							ae = ld64(s420)
							st64(a + 0x10, ld64(s420 + 8))
							st64(a + 8, ae)
							st32(a, 2)
							return af
						}
						af = Error_with_account_name(s410, t, token_vault_a_box, "token_vault_a", 0xd)
						ae = ld64(s410)
						st64(a + 0x10, ld64(s410 + 8))
						st64(a + 8, ae)
						st32(a, 2)
						return af
					}
					af = Error_with_account_name(s400, r, token_owner_account_a_box, "token_owner_account_a", 0x15)
					ae = ld64(s400)
					st64(a + 0x10, ld64(s400 + 8))
					st64(a + 8, ae)
					st32(a, 2)
					return af
				}
				alloc_handle_alloc_error(8, 0x290)
			}
			af = Error_with_account_name(s3f0, k, l, "token_authority", 0xf)
			ae = ld64(s3f0)
			st64(a + 0x10, ld64(s3f0 + 8))
			st64(a + 8, ae)
			st32(a, 2)
			return af
		}
		af = Error_with_account_name(s3e0, i, j, "memo_program", 0xc)
		ae = ld64(s3e0)
		st64(a + 0x10, ld64(s3e0 + 8))
		st64(a + 8, ae)
		st32(a, 2)
		return af
	}
	af = Error_with_account_name(s3d0, g, h, "token_program_b", 0xf)
	ae = ld64(s3d0)
	st64(a + 0x10, ld64(s3d0 + 8))
	st64(a + 8, ae)
	st32(a, 2)
	return af
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value), p7 (value), p8 (value), p9 (points to it)
// types [heur]: b: SwapV2Context (the handler ix_swap_v2 passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_3d688(a: u64, b: SwapV2Context, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64): u64 {
	const s10 = fp - 0x10, s40 = fp - 0x40, s48 = fp - 0x48, s70 = fp - 0x70, s81 = fp - 0x81, s91 = fp - 0x91, s98 = fp - 0x98, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se8 = fp - 0xe8, s100 = fp - 0x100, s218 = fp - 0x218, s220 = fp - 0x220, s228 = fp - 0x228, s238 = fp - 0x238, s250 = fp - 0x250, s268 = fp - 0x268, s280 = fp - 0x280, s298 = fp - 0x298, s2b0 = fp - 0x2b0, s2c8 = fp - 0x2c8, s2e0 = fp - 0x2e0, s2f8 = fp - 0x2f8, s310 = fp - 0x310, s328 = fp - 0x328, s340 = fp - 0x340, s358 = fp - 0x358, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0
	let m, r, bf, bj, bk, bz: u64
	let ev = d
	let f = c
	const accounts: SwapV2Accounts = b.accounts
	clock_get_13f308(s238)
	if (ld64(s238) != 0) {
		const q = ld64(s238 + 8)
		const p = ld64(s228)
		st64(s228, ld64(s220))
		st64(s238, q, p)
		r = fn_13b430(s380, s238)
		f = ld64(s380)
		st64(a + 8, ld64(s380 + 8))
		st64(a, f)
		return r
	}
	let er = f
	let ep = p6
	let eq = p5
	const i = p9
	const eu = p8
	let es = p7
	let h = ld64(s218 + 8)
	if (-1 >= (h as i64)) {
		r = fn_87630(s390, 0x15)
		h = ld64(s390 + 8)
		f = ld64(s390)
		m = h
		if (f != 2) {
			st64(a + 8, m)
			st64(a, f)
			return r
		}
	}
	const eo = h
	const k = b.remaining_accounts_len
	const remaining_accounts: AccountInfo = b.remaining_accounts
	r = fn_7a5e0(s238, remaining_accounts, k, i, 0x100153282, 3, b, f)
	m = ld64(s228)
	f = ld64(s238 + 8)
	const l = ld64(s238)
	if (l == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
		st64(a + 8, m)
		st64(a, f)
		return r
	}
	memcpy(s358, s220, 0x120)
	st64(s370, l, f, m)
	const n = ld64(0x300000000 /* heap bump-allocator cursor */)
	const o = n != 0 ? sat_sub(n, 0x90) & -8 : 0x300007f70
	if (o > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, o)
		const s: AccountInfo = ld64(accounts + 0x148)
		const t: LamportsCell = s.lamports
		const z = s.key
		rc_inc(t)
		const u: DataCell = s.data
		rc_inc(u)
		let et = t
		const v: AccountInfo = ld64(accounts + 0x150)
		const w: LamportsCell = v.lamports
		const ei = s.executable
		const ej = s.is_writable
		let ek = s.is_signer
		let el = s.rent_epoch
		let em = s.owner
		const y = v.key
		let en = w
		rc_inc(w)
		const x: DataCell = v.data
		rc_inc(x)
		const aa: AccountInfo = ld64(accounts + 0x158)
		const ab: LamportsCell = aa.lamports
		const eh = v.executable
		const af = v.is_writable
		const al = v.is_signer
		const ag = v.rent_epoch
		const ac = v.owner
		const eg = aa.key
		rc_inc(ab)
		const ad: DataCell = aa.data
		const ae = ad.strong
		ad.strong = ae + 1
		if (ae != -1) {
			const ak = aa.owner
			const aj = aa.rent_epoch
			const ai = aa.is_signer
			const ah = aa.is_writable
			st8(o + 0x8a, aa.executable)
			st8(o + 0x89, ah)
			st8(o + 0x88, ai)
			st64(o + 0x80, aj)
			st64(o + 0x78, ak)
			st64(o + 0x70, ad)
			st64(o + 0x68, ab)
			st64(o + 0x60, eg)
			st8(o + 0x5a, eh)
			st8(o + 0x59, af)
			st8(o + 0x58, al)
			st64(o + 0x50, ag)
			st64(o + 0x48, ac)
			st64(o + 0x40, x)
			st64(o + 0x38, en)
			st64(o + 0x30, y)
			st8(o + 0x2a, ei)
			st8(o + 0x29, ej)
			st8(o + 0x28, ek)
			st64(o + 0x20, el)
			st64(o + 0x18, em)
			st64(o + 0x10, u)
			st64(o + 8, et)
			st64(o, z)
			st64(s98, 3, o, 3)
			copyr(s238, s2e0, 0x18)
			fn_60de8(s100, s98, s238, ak, ah, al)
			r = fn_62750(s238, s100, ld64(accounts + 0x120), eu)
			let am = ld64(s228)
			m = ld64(s238 + 8)
			const an = ld64(s238)
			let az = am
			let ba = m
			if (an != 0x8000000000000000) {
				st64(se8, an, m, am)
				const oracle: AccountInfo = accounts.oracle
				const ap: LamportsCell = oracle.lamports
				const ax = ld64(accounts + 0x120)
				const ar = oracle.key
				rc_inc(ap)
				const aq: DataCell = oracle.data
				et = ar
				rc_inc(aq)
				const aw = oracle.owner
				const av = oracle.rent_epoch
				const au = oracle.is_signer
				const at = oracle.is_writable
				st8(s70 + 2, oracle.executable)
				st8(s70, au, at)
				st64(s98, et, ap, aq, aw, av)
				r = fn_5bad0(s238, ax, s98)
				az = ld64(s238 + 8)
				ba = ld64(s238)
				const ay = ld8(s218 + 0x10)
				if (ay != 2) {
					B54: {
						copyr(sc0, s228, 0x20)
						st32(sc0 + 0x21, ld32(s218 + 0x11))
						st32(sc0 + 0x24, ld32(s218 + 0x14))
						st64(sd0, ba, az)
						az = 1
						st8(sc0 + 0x20, ay)
						if (ay != 0) {
							r = AccountInfo_try_borrow_data(s238, sd0, r)
							const be = ld64(s228)
							const bc = ld64(s238 + 8)
							const bb = ld64(s238)
							if (bb != 0x800000000000001a /* Ok */) {
								st64(s238, bb, bc, be)
								r = fn_13b430(s3a0, s238)
								az = ld64(s3a0 + 8)
								bf = ld64(s3a0)
								if (bf != 2) {
									break B54
								}
							} else {
								const bd = ld64(bc + 8)
								if (0xfd >= bd) {
									fn_14c5c0(0xfe, bd, 0x100159ee8, 0x800000000000001a /* Ok */)
								}
								az = eo >= ld64(ld64(bc) + 0x28)
								st64(be, ld64(be) - 1)
							}
						}
						if ((az as u8) != 0) {
							r = fn_5c138(s238, sd0, r)
							if (ld8(s238) == 0) {
								st32(s98 + 3, ld32(s238 + 4))
								st32(s98, ld32(s238 + 1))
								et = ld64(s238 + 8)
								const bg = ld64(s228)
								memcpy(s48, s220, 0x38)
								st64(s91, et, bg)
								memcpy(s81, s48, 0x38)
								const bi = ld64(accounts + 0x120)
								const bh = es
								et = accounts.token_mint_b
								r = fn_3f9a0(s238, bi + 8, accounts, accounts.token_mint_b, se8, er, eq, ep, es, eu, eo, s98)
								az = ld64(s238 + 8)
								bf = ld64(s238)
								if (bf != 2) {
									break B54
								}
								B39: {
									if (bh != 0) {
										if (eu != 0) {
											bj = az
											r = fn_82238(s238, et, ld64(az + 8))
											bf = ld64(s238 + 8)
											if (ld64(s238) == 0) {
												if (ev > bf) {
													r = fn_87630(s3e0, 0x24)
													az = ld64(s3e0 + 8)
													bf = ld64(s3e0)
													break B54
												}
												break B39
											}
										} else {
											bj = az
											r = fn_82238(s238, accounts, ld64(az))
											bf = ld64(s238 + 8)
											if (ld64(s238) == 0) {
												if (ev > bf) {
													r = fn_87630(s3e0, 0x24)
													az = ld64(s3e0 + 8)
													bf = ld64(s3e0)
													break B54
												}
												break B39
											}
										}
										az = ld64(s228)
										break B54
									}
									bj = az
									if (ld64(az + (eu != 0 ? 0 : 8)) > ev) {
										r = fn_87630(s3b0, 0x25)
										az = ld64(s3b0 + 8)
										bf = ld64(s3b0)
										break B54
									}
								}
								r = fn_5c328(s3c0, sd0, bj + 0x1d4, bk, bf, r)
								bf = ld64(s3c0)
								if (bf != 2) {
									az = ld64(s3c0 + 8)
									break B54
								}
								ev = ld64(az + (eu != 0 ? 8 : 0))
								const bm = ld64(az + (eu != 0 ? 0 : 8))
								const bl = ld64(accounts + 0x120)
								es = ld64(bl + 0x240)
								er = ld64(bl + 0x238)
								r = fn_82238(s238, eu != 0 ? accounts : et, bm)
								if (ld64(s238) == 0) {
									eq = bm
									const bn = ld64(s228)
									r = fn_82238(s238, eu != 0 ? et : accounts, ev)
									if (ld64(s238) == 0) {
										en = bn
										em = ld64(s228)
										ek = ld64(az + 0x1c8)
										el = ld64(az + 0x10)
										ep = ld64(accounts + 0x120)
										const token_owner_account_a: TokenAccount_2 = accounts.token_owner_account_a
										const token_owner_account_b: TokenAccount_2 = accounts.token_owner_account_b
										const token_vault_a: TokenAccount_2 = accounts.token_vault_a
										const token_vault_b: TokenAccount_2 = accounts.token_vault_b
										r = fn_7c2f0(s3d0, ep, accounts + 0x118, accounts, et, token_owner_account_a, token_owner_account_b, token_vault_a, token_vault_b, s370, s358, accounts + 0x100, accounts + 0x108, accounts + 0x110, az, eu, eo, "Orca Trade", 0xa)
										bf = ld64(s3d0)
										if (bf == 2) {
											const bs = ld64(accounts + 0x120)
											const bt = ld64(ld64(bs))
											copyr(s238, bt, 0x20)
											const bv = ld64(bs + 0x240)
											const bu = ld64(bs + 0x238)
											st64(s218, er, es, bu, bv, eq, ev, en, em, el, ek)
											st8(s218 + 0x50, eu)
											fn_89078(s48, s238)
											copyr(s10, s40, 0x10)
											const by = log_data(s10, 1)
											const bx = ld64(sc0)
											const bw = ld64(sd0 + 8)
											rc_dec(bw)
											rc_dec(bx)
											if (am == 0) {
												bz = fn_bb88(s370, fn_c710(ld64(s100 + 8), ld64(s100 + 0x10), by))
												r = fn_bb88(s250, fn_bb88(s268, fn_bb88(s280, fn_bb88(s298, fn_bb88(s2b0, fn_bb88(s2c8, fn_bb88(s2f8, fn_bb88(s310, fn_bb88(s328, fn_bb88(s340, fn_bb88(s358, bz)))))))))))
												st64(a + 8, m)
												st64(a, 2)
												return r
											}
											m = m + 0x18
											while (true) {
												if (ld8(m - 0x14) == 2) {
													const ca = ld64(m)
													st64(ca, ld64(ca) + 1)
												}
												m = m + 0x78
												am = am - 1
												if (am == 0) {
													bz = fn_bb88(s370, fn_c710(ld64(s100 + 8), ld64(s100 + 0x10), by))
													r = fn_bb88(s250, fn_bb88(s268, fn_bb88(s280, fn_bb88(s298, fn_bb88(s2b0, fn_bb88(s2c8, fn_bb88(s2f8, fn_bb88(s310, fn_bb88(s328, fn_bb88(s340, fn_bb88(s358, bz)))))))))))
													st64(a + 8, m)
													st64(a, 2)
													return r
												}
											}
										}
										az = ld64(s3d0 + 8)
										break B54
									}
								}
							}
							az = ld64(s228)
							bf = ld64(s238 + 8)
						} else {
							r = fn_87630(s3f0, 0x40)
							az = ld64(s3f0 + 8)
							bf = ld64(s3f0)
						}
					}
					const cc = ld64(sc0)
					const cb = ld64(sd0 + 8)
					rc_dec(cb)
					ba = bf
					rc_dec(cc)
				}
				if (am != 0) {
					let cd = m + 0x18
					do {
						if (ld8(cd - 0x14) == 2) {
							const cf = ld64(cd)
							st64(cf, ld64(cf) + 1)
						}
						cd = cd + 0x78
						am = am - 1
					} while (am != 0)
				}
			}
			let ce = ld64(s100 + 0x10)
			m = az
			f = ba
			if (ce != 0) {
				let cg = ld64(s100 + 8) + 0x10
				do {
					const cj = ld64(cg)
					const ci = ld64(cg - 8)
					rc_dec(ci)
					rc_dec(cj)
					cg = cg + 0x30
					ce = ce - 1
				} while (ce != 0)
			}
			if (ld64(s370) != 0x8000000000000000) {
				let ch = ld64(s370 + 0x10)
				if (ch != 0) {
					let ck = ld64(s370 + 8) + 0x10
					do {
						const cn = ld64(ck)
						const cm = ld64(ck - 8)
						r = ld64(cm) - 1
						st64(cm, r)
						if (r == 0) {
							r = ld64(cm + 8) - 1
							st64(cm + 8, r)
						}
						rc_dec(cn)
						ck = ck + 0x30
						ch = ch - 1
					} while (ch != 0)
				}
			}
			if (ld64(s358) != 0x8000000000000000) {
				let cl = ld64(s358 + 0x10)
				if (cl != 0) {
					let co = ld64(s358 + 8) + 0x10
					do {
						const cr = ld64(co)
						const cq = ld64(co - 8)
						rc_dec(cq)
						rc_dec(cr)
						co = co + 0x30
						cl = cl - 1
					} while (cl != 0)
				}
			}
			if (ld64(s340) != 0x8000000000000000) {
				let cp = ld64(s340 + 0x10)
				if (cp != 0) {
					let cs = ld64(s340 + 8) + 0x10
					do {
						const cv = ld64(cs)
						const cu = ld64(cs - 8)
						r = ld64(cu) - 1
						st64(cu, r)
						if (r == 0) {
							r = ld64(cu + 8) - 1
							st64(cu + 8, r)
						}
						rc_dec(cv)
						cs = cs + 0x30
						cp = cp - 1
					} while (cp != 0)
				}
			}
			if (ld64(s328) != 0x8000000000000000) {
				let ct = ld64(s328 + 0x10)
				if (ct != 0) {
					let cw = ld64(s328 + 8) + 0x10
					do {
						const cz = ld64(cw)
						const cy = ld64(cw - 8)
						rc_dec(cy)
						rc_dec(cz)
						cw = cw + 0x30
						ct = ct - 1
					} while (ct != 0)
				}
			}
			if (ld64(s310) != 0x8000000000000000) {
				let cx = ld64(s310 + 0x10)
				if (cx != 0) {
					let da = ld64(s310 + 8) + 0x10
					do {
						const dd = ld64(da)
						const dc = ld64(da - 8)
						r = ld64(dc) - 1
						st64(dc, r)
						if (r == 0) {
							r = ld64(dc + 8) - 1
							st64(dc + 8, r)
						}
						rc_dec(dd)
						da = da + 0x30
						cx = cx - 1
					} while (cx != 0)
				}
			}
			if (ld64(s2f8) != 0x8000000000000000) {
				let db = ld64(s2f8 + 0x10)
				if (db != 0) {
					let de = ld64(s2f8 + 8) + 0x10
					do {
						const dh = ld64(de)
						const dg = ld64(de - 8)
						rc_dec(dg)
						rc_dec(dh)
						de = de + 0x30
						db = db - 1
					} while (db != 0)
				}
			}
			if (ld64(s2c8) != 0x8000000000000000) {
				let df = ld64(s2c8 + 0x10)
				if (df != 0) {
					let di = ld64(s2c8 + 8) + 0x10
					do {
						const dl = ld64(di)
						const dk = ld64(di - 8)
						r = ld64(dk) - 1
						st64(dk, r)
						if (r == 0) {
							r = ld64(dk + 8) - 1
							st64(dk + 8, r)
						}
						rc_dec(dl)
						di = di + 0x30
						df = df - 1
					} while (df != 0)
				}
			}
			if (ld64(s2b0) != 0x8000000000000000) {
				let dj = ld64(s2b0 + 0x10)
				if (dj != 0) {
					let dm = ld64(s2b0 + 8) + 0x10
					do {
						const dq = ld64(dm)
						const dp = ld64(dm - 8)
						rc_dec(dp)
						rc_dec(dq)
						dm = dm + 0x30
						dj = dj - 1
					} while (dj != 0)
				}
			}
			if (ld64(s298) != 0x8000000000000000) {
				let dn = ld64(s298 + 0x10)
				if (dn != 0) {
					let dr = ld64(s298 + 8) + 0x10
					do {
						const du = ld64(dr)
						const dt = ld64(dr - 8)
						r = ld64(dt) - 1
						st64(dt, r)
						if (r == 0) {
							r = ld64(dt + 8) - 1
							st64(dt + 8, r)
						}
						rc_dec(du)
						dr = dr + 0x30
						dn = dn - 1
					} while (dn != 0)
				}
			}
			if (ld64(s280) != 0x8000000000000000) {
				let ds = ld64(s280 + 0x10)
				if (ds != 0) {
					let dv = ld64(s280 + 8) + 0x10
					do {
						const dy = ld64(dv)
						const dx = ld64(dv - 8)
						rc_dec(dx)
						rc_dec(dy)
						dv = dv + 0x30
						ds = ds - 1
					} while (ds != 0)
				}
			}
			if (ld64(s268) != 0x8000000000000000) {
				let dw = ld64(s268 + 0x10)
				if (dw != 0) {
					let dz = ld64(s268 + 8) + 0x10
					do {
						const ec = ld64(dz)
						const eb = ld64(dz - 8)
						r = ld64(eb) - 1
						st64(eb, r)
						if (r == 0) {
							r = ld64(eb + 8) - 1
							st64(eb + 8, r)
						}
						rc_dec(ec)
						dz = dz + 0x30
						dw = dw - 1
					} while (dw != 0)
				}
			}
			if (ld64(s250) == 0x8000000000000000) {
				st64(a + 8, m)
				st64(a, f)
				return r
			}
			let ea = ld64(s250 + 0x10)
			if (ea == 0) {
				st64(a + 8, m)
				st64(a, f)
				return r
			}
			let ed = ld64(s250 + 8) + 0x10
			while (true) {
				const ef = ld64(ed)
				const ee = ld64(ed - 8)
				rc_dec(ee)
				rc_dec(ef)
				ed = ed + 0x30
				ea = ea - 1
				if (ea == 0) {
					st64(a + 8, m)
					st64(a, f)
					return r
				}
			}
		}
		abort()
	}
	alloc_handle_alloc_error(8, 0x90)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), p10 (points to it), p15 (value), p16 (value), p17 (value)
// types [heur]: d: SwapV2Accounts (every call passes one: fn_3d688); p6: TokenAccount_2 (every call passes one: fn_3d688); p7: TokenAccount_2 (every call passes one: fn_3d688); p8: TokenAccount_2 (every call passes one: fn_3d688); p9: TokenAccount_2 (every call passes one: fn_3d688)
export function fn_7c2f0(a: u64, b: u64, c: u64, d: SwapV2Accounts, p5: u64, p6: TokenAccount_2, p7: TokenAccount_2, p8: TokenAccount_2, p9: TokenAccount_2, p10: u64, p11: u64, p12: u64, p13: u64, p14: u64, p15: u64, p16: u64, p17: u64, p18: u64, p19: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	const f = p15
	let ai = ld64(f + 0x1c8)
	let ah = ld64(f + 0x40)
	let ag = ld64(f + 0x38)
	const j = ld64(f + 0x20)
	const i = ld64(f + 0x18)
	const h = ld32(f + 0x1d0)
	const g = ld64(f + 0x30)
	st64(b + 0x238, ld64(f + 0x28))
	st64(b + 0x240, g)
	st32(b + 0x280, h)
	st64(b + 0x228, i, j)
	memcpy(b + 8, f + 0x48, 0x180)
	st64(b + 0x278, p17)
	const k = p16
	const l = k != 0 ? 0x248 : 0x258
	st64(b + l, ag, ah)
	const m = k != 0 ? 0x268 : 0x270
	st64(b + m, ld64(b + m) + ai)
	const o = p11
	let n = p10
	const af = n
	n = k != 0 ? n : o
	const q = ld64(f + 8)
	const p = ld64(f)
	const s = p13
	let r = p12
	const ae = r
	r = k != 0 ? r : s
	ag = o
	const u: TokenAccount_2 = p9
	let t = p8
	const ad = t
	t = k != 0 ? t : u
	const v = p5
	ai = v
	const w = p14
	const y: TokenAccount_2 = p7
	const x: TokenAccount_2 = p6
	ah = y
	let ac = fn_7cf50(s10, c, k != 0 ? d : v, k != 0 ? x : y, t, r, w, n, k != 0 ? p : q)
	let ab = ld64(s10 + 8)
	let z = ld64(s10)
	if (z != 2) {
		st64(a + 8, ab)
		st64(a, z)
		return ac
	}
	ai = k != 0 ? ai : d
	ah = k != 0 ? ah : x
	const aa = p19
	ac = fn_7e5e0(s20, b, ai, k != 0 ? u : ad, ah, k != 0 ? s : ae, w, k != 0 ? ag : af, k != 0 ? q : p, p18, aa)
	ab = ld64(s20 + 8)
	z = ld64(s20)
	if (z == 2) {
		st64(a + 8, ab)
		st64(a, 2)
		return ac
	}
	st64(a + 8, ab)
	st64(a, z)
	return ac
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool, token_owner_account_a, token_vault_a, token_owner_account_b, token_vault_b
export function fn_e42f8(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8
	let r, t: u64
	fn_6aa0(s28, ld64(b + 0x120), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const f = ld64(s28)
	if (f != 2) {
		r = Error_with_account_name(s38, f, ld64(s28 + 8), 0x100152b28 /* "whirlpool" */, 9)
		t = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, t)
		return r
	}
	const g = ld64(b + 0x128)
	const h = ld64(g + 0x20)
	if ((memcmp(g, c, 0x20) as u32) == 0) {
		const i = common_is_closed(h)
		if (i == 0) {
			fn_143448(s18, h, i)
			const k = ld64(s18 + 0x10)
			const j = ld64(s18)
			if (j != 0x800000000000001a /* Ok */) {
				const l = ld64(s18 + 8)
				st64(s18, j, l, k)
				fn_13b430(s48, s18)
				const m = ld64(s48)
				if (m != 2) {
					r = Error_with_account_name(s58, m, ld64(s48 + 8), "token_owner_account_a", 0x15)
					t = ld64(s58)
					st64(a + 8, ld64(s58 + 8))
					st64(a, t)
					return r
				}
			} else {
				st64(k, ld64(k) + 1)
			}
		}
	}
	const n = ld64(b + 0x130)
	const u = ld64(n + 0x20)
	if ((memcmp(n, c, 0x20) as u32) == 0) {
		const v = common_is_closed(u)
		if (v == 0) {
			fn_143448(s18, u, v)
			const x = ld64(s18 + 0x10)
			const w = ld64(s18)
			if (w != 0x800000000000001a /* Ok */) {
				const ae = ld64(s18 + 8)
				st64(s18, w, ae, x)
				fn_13b430(s68, s18)
				const af = ld64(s68)
				if (af != 2) {
					r = Error_with_account_name(s78, af, ld64(s68 + 8), "token_vault_a", 0xd)
					t = ld64(s78)
					st64(a + 8, ld64(s78 + 8))
					st64(a, t)
					return r
				}
			} else {
				st64(x, ld64(x) + 1)
			}
		}
	}
	const o = ld64(b + 0x138)
	const y = ld64(o + 0x20)
	if ((memcmp(o, c, 0x20) as u32) == 0) {
		const z = common_is_closed(y)
		if (z == 0) {
			fn_143448(s18, y, z)
			const ab = ld64(s18 + 0x10)
			const aa = ld64(s18)
			if (aa != 0x800000000000001a /* Ok */) {
				const ag = ld64(s18 + 8)
				st64(s18, aa, ag, ab)
				fn_13b430(s88, s18)
				const ah = ld64(s88)
				if (ah != 2) {
					r = Error_with_account_name(s98, ah, ld64(s88 + 8), "token_owner_account_b", 0x15)
					t = ld64(s98)
					st64(a + 8, ld64(s98 + 8))
					st64(a, t)
					return r
				}
			} else {
				st64(ab, ld64(ab) + 1)
			}
		}
	}
	const p = ld64(b + 0x140)
	const ac = ld64(p + 0x20)
	const q = memcmp(p, c, 0x20)
	let s = undef
	r = q as u32
	if (r != 0) {
		st64(a + 8, s)
		st64(a, 2)
		return r
	}
	r = common_is_closed(ac)
	s = undef
	if (r != 0) {
		st64(a + 8, s)
		st64(a, 2)
		return r
	}
	r = fn_143448(s18, ac, r)
	s = ld64(s18 + 0x10)
	const ad = ld64(s18)
	if (ad != 0x800000000000001a /* Ok */) {
		const ai = ld64(s18 + 8)
		st64(s18, ad, ai, s)
		r = fn_13b430(sa8, s18)
		s = undef
		const aj = ld64(sa8)
		if (aj == 2) {
			st64(a + 8, s)
			st64(a, 2)
			return r
		}
		r = Error_with_account_name(sb8, aj, ld64(sa8 + 8), "token_vault_b", 0xd)
		t = ld64(sb8)
		st64(a + 8, ld64(sb8 + 8))
		st64(a, t)
		return r
	}
	st64(s, ld64(s) + 1)
	st64(a + 8, s)
	st64(a, 2)
	return r
}
