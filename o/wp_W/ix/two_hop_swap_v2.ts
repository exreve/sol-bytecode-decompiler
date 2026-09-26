/// <reference path="../lib.d.ts" />
// instruction two_hop_swap_v2
import { fn_11150, fn_12758, fn_147e78, fn_2258, fn_3f9a0, fn_5bad0, fn_5bfc8, fn_5c138, fn_5c328, fn_60de8, fn_62750, fn_6960, fn_6aa0, fn_7a5e0, fn_7cf50, fn_7e5e0, fn_82238, fn_89078, fn_bb88, log_data, memcpy } from '../shared.ts'

// instruction handler: two_hop_swap_v2 (discriminator sha256("global:two_hop_swap_v2")[..8] = 0x75c202fe1dd18fba)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool_one, whirlpool_two, token_mint_input, token_mint_intermediate, token_mint_output, tick_array_one_0, tick_array_one_1, tick_array_one_2, tick_array_two_0, tick_array_two_1, tick_array_two_2, oracle_one, oracle_two, token_owner_account_input, token_vault_one_input, token_vault_two_intermediate, token_owner_account_output, token_vault_two_output, token_vault_one_intermediate, token_program_output, token_program_intermediate, token_program_input, memo_program, token_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
export function ix_two_hop_swap_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s18 = fp - 0x18, s228 = fp - 0x228, s230 = fp - 0x230, s240 = fp - 0x240, s450 = fp - 0x450, s460 = fp - 0x460, s468 = fp - 0x468, s478 = fp - 0x478, s47a = fp - 0x47a, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s1000 = fp - 0x1000
	let n, p, q, t, u, v, w: u64
	B16: {
		B15: {
			B14: {
				sol_log("Instruction: TwoHopSwapV2", 0x19)
				let j = undef
				const f = ix_args_len
				if (f >= 8 && ((f & -8) != 8 && f != 0x10)) {
					const g = ix_args
					const l = ld64(g)
					const i = ld64(g + 8)
					const h = ld8(g + 0x10)
					st64(s478, g + 0x11, f - 0x11)
					st8(s47a, h)
					if (2 > h) {
						if (f == 0x11) {
							break B14
						}
						j = ld8(g + 0x11)
						st8(s47a, j)
						if (2 > j) {
							if (f == 0x12) {
								break B14
							}
							const k = ld8(g + 0x12)
							st8(s47a, k)
							if (2 > k) {
								if (0x11 > f - 0x12) {
									break B14
								}
								if (0x10 > f - 0x23) {
									break B14
								}
								const ab = j
								const ae = ld64(g + 0x1b)
								const af = ld64(g + 0x13)
								const ac = ld64(g + 0x2b)
								const ad = ld64(g + 0x23)
								st64(s478, g + 0x33, f - 0x33)
								fn_11150(s240, s478)
								n = g
								q = ld64(s240 + 8)
								const m = ld64(s240)
								if (m == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
									break B16
								}
								const aa = ld64(s230)
								st16(s47a, 0xffff)
								st64(s478, accounts, accounts_len)
								st64(s1000, f, s47a)
								w = accounts_two_hop_swap_v2(s240, program_id, s478, n, fp)
								const o = ld32(s240)
								if (o == 2) {
									v = ld64(s240 + 8)
									st64(a + 8, ld64(s230))
									st64(a, v)
									return w
								}
								const z = ld32(s240 + 4)
								const y = ld64(s240 + 8)
								const x = ld64(s230)
								memcpy(s450, s228, 0x210)
								st64(s460, y, x)
								st32(s468, o, z)
								st8(s228 + 9, ld8(s47a + 1))
								st8(s228 + 8, ld8(s47a))
								copyr(s230, s478, 0x10)
								st64(s240, program_id, s468)
								st64(s18, m, q, aa)
								st64(s1000, h != 0, ab != 0, k != 0, af, ae, ad, ac, s18)
								w = fn_40458(s490, s240, l, i, h != 0, ab != 0, k != 0, af, ae, ad, ac, s18)
								v = ld64(s490)
								if (v != 2) {
									st64(a + 8, ld64(s490 + 8))
									st64(a, v)
									return w
								}
								w = fn_e8e38(s4a0, s468, program_id)
								v = ld64(s4a0)
								st64(a + 8, ld64(s4a0 + 8))
								st64(a, v)
								return w
							}
						}
					}
					st64(s240, 0x100159620)
					st64(s230, s18)
					st64(s18, s47a, fn_14ef78)
					st64(s228 + 8, 0)
					st64(s240 + 8, 1)
					st64(s228, 1)
					// fmt "Invalid bool representation: {}" {} = *s47a [fn_14ef78]
					fn_147e78(s468, s240, i, h, j)
					p = fn_b580(s468)
					n = undef
					break B15
				}
			}
			p = fn_1459d0(0x100159468)
			n = undef
		}
		q = p
	}
	const r = q
	if (2 > (q & 3) - 2) {
		w = anchor_error_from(s4b0, 0x66 /* anchor::InstructionDidNotDeserialize */, t, n, u)
		v = ld64(s4b0)
		st64(a + 8, ld64(s4b0 + 8))
		st64(a, v)
		return w
	}
	if ((r & 3) == 0) {
		w = anchor_error_from(s4b0, 0x66 /* anchor::InstructionDidNotDeserialize */, t, n, u)
		v = ld64(s4b0)
		st64(a + 8, ld64(s4b0 + 8))
		st64(a, v)
		return w
	}
	const s = ld64(ld64(q + 7))
	callx(s, ld64(q - 1), s, undef, n)
	w = anchor_error_from(s4b0, 0x66 /* anchor::InstructionDidNotDeserialize */)
	v = ld64(s4b0)
	st64(a + 8, ld64(s4b0 + 8))
	st64(a, v)
	return w
}

// Anchor Accounts::try_accounts of instruction two_hop_swap_v2 (called by ix_two_hop_swap_v2; name [str]: from the handler's "Instruction: …" log; was fn_e4988)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it), d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool_one (ConstraintMut), whirlpool_two (ConstraintMut), token_mint_input, token_mint_intermediate (ConstraintAddress), token_mint_output (ConstraintAddress), tick_array_one_0 (AccountNotEnoughKeys, ConstraintMut), tick_array_one_1 (ConstraintMut), tick_array_one_2 (ConstraintMut), tick_array_two_0 (ConstraintMut), tick_array_two_1 (ConstraintMut), tick_array_two_2 (ConstraintMut), oracle_one (ConstraintSeeds, ConstraintMut), oracle_two (ConstraintMut, ConstraintSeeds), token_owner_account_input (ConstraintMut, ConstraintRaw), token_vault_one_input (ConstraintMut), token_vault_two_intermediate (ConstraintMut), token_owner_account_output (ConstraintMut, ConstraintRaw), token_vault_two_output (ConstraintAddress), token_vault_one_intermediate (ConstraintAddress), token_program_output (ConstraintAddress), token_program_intermediate (ConstraintAddress), token_program_input (ConstraintAddress), memo_program, token_authority
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: token_vault_one_input, token_vault_two_intermediate
export function accounts_two_hop_swap_v2(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s230 = fp - 0x230, s270 = fp - 0x270, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2c8 = fp - 0x2c8, s2d0 = fp - 0x2d0, s2f0 = fp - 0x2f0, s310 = fp - 0x310, s350 = fp - 0x350, s370 = fp - 0x370, s3b0 = fp - 0x3b0, s3d0 = fp - 0x3d0, s410 = fp - 0x410, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s510 = fp - 0x510, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s560 = fp - 0x560, s570 = fp - 0x570, s580 = fp - 0x580, s590 = fp - 0x590, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s700 = fp - 0x700, s710 = fp - 0x710, s720 = fp - 0x720, s730 = fp - 0x730, s740 = fp - 0x740, s750 = fp - 0x750, s760 = fp - 0x760, s770 = fp - 0x770, s780 = fp - 0x780, s790 = fp - 0x790, s7a0 = fp - 0x7a0, s7b0 = fp - 0x7b0, s7c0 = fp - 0x7c0, s7d0 = fp - 0x7d0, s7e0 = fp - 0x7e0, s7f0 = fp - 0x7f0, s800 = fp - 0x800, s810 = fp - 0x810, s820 = fp - 0x820, s830 = fp - 0x830, s840 = fp - 0x840, s850 = fp - 0x850, s860 = fp - 0x860, s870 = fp - 0x870, s880 = fp - 0x880, s890 = fp - 0x890, s8a0 = fp - 0x8a0, s8b0 = fp - 0x8b0, s8c0 = fp - 0x8c0, s8d0 = fp - 0x8d0, s8e0 = fp - 0x8e0, s8f0 = fp - 0x8f0, s900 = fp - 0x900, s910 = fp - 0x910, s920 = fp - 0x920, s930 = fp - 0x930, s940 = fp - 0x940, s950 = fp - 0x950, s960 = fp - 0x960, s970 = fp - 0x970, s980 = fp - 0x980, s990 = fp - 0x990, s9a0 = fp - 0x9a0, s9b0 = fp - 0x9b0, s9c0 = fp - 0x9c0, s9d0 = fp - 0x9d0, s9e0 = fp - 0x9e0, s9f0 = fp - 0x9f0, sa00 = fp - 0xa00, sa10 = fp - 0xa10, sa20 = fp - 0xa20, sa30 = fp - 0xa30, sa40 = fp - 0xa40, sa50 = fp - 0xa50, sa60 = fp - 0xa60, sa70 = fp - 0xa70, sa80 = fp - 0xa80, sa90 = fp - 0xa90, saa0 = fp - 0xaa0, sab0 = fp - 0xab0, sac0 = fp - 0xac0, sad0 = fp - 0xad0, sb08 = fp - 0xb08, sb30 = fp - 0xb30, sb58 = fp - 0xb58, sb68 = fp - 0xb68, sb70 = fp - 0xb70, sb78 = fp - 0xb78, sb80 = fp - 0xb80, sb88 = fp - 0xb88, sb90 = fp - 0xb90, sb98 = fp - 0xb98, sba0 = fp - 0xba0, sba8 = fp - 0xba8, sbb0 = fp - 0xbb0, sbb8 = fp - 0xbb8, sbc0 = fp - 0xbc0, sbc8 = fp - 0xbc8, sbd0 = fp - 0xbd0, sbd8 = fp - 0xbd8, sbe0 = fp - 0xbe0, sbe8 = fp - 0xbe8, sbf0 = fp - 0xbf0, sbf8 = fp - 0xbf8
	let j, m, n, o, p, q, ak, al, am, bf, bl, bm, bn, bs, dg, dh, di, dp, ec, ed, ee, ek, fn: u64
	B10: {
		B9: {
			const f = ld64(e - 0x1000)
			if (f >= 8 && ((f & -8) != 8 && f != 0x10)) {
				const ev = ld64(e - 0xff8)
				const g = ld8(d + 0x10)
				st8(s2f0, g)
				if (2 > g) {
					if (f == 0x11) {
						break B9
					}
					const h = ld8(d + 0x11)
					st8(s2f0, h)
					if (2 > h) {
						if (f == 0x12) {
							break B9
						}
						const i = ld8(d + 0x12)
						st8(s2f0, i)
						if (2 > i) {
							st64(sad0, b, i)
							try_accounts_11a48(s290, c, g, d, e)
							if (ld64(s290) == 0) {
								q = Error_with_account_name(sab0, ld64(s288), ld64(s288 + 8), "whirlpool_one", 0xd)
								p = ld64(sab0)
								st64(a + 0x10, ld64(sab0 + 8))
								st64(a + 8, p)
								st32(a, 2)
								return q
							}
							const r = ld64(0x300000000 /* heap bump-allocator cursor */)
							const s = r != 0 ? sat_sub(r, 0x290) & -8 : 0x300007d70
							if (s > 0x300000007) {
								st64(0x300000000 /* heap bump-allocator cursor */, s)
								st64(sb08 + 0x30, s)
								memcpy(s, s290, 0x290)
								try_accounts_11a48(s290, c)
								if (ld64(s290) == 0) {
									q = Error_with_account_name(saa0, ld64(s288), ld64(s288 + 8), "whirlpool_two", 0xd)
									p = ld64(saa0)
									st64(a + 0x10, ld64(saa0 + 8))
									st64(a + 8, p)
									st32(a, 2)
									return q
								}
								const t = ld64(0x300000000 /* heap bump-allocator cursor */)
								const u = t != 0 ? sat_sub(t, 0x290) & -8 : 0x300007d70
								if (u > 0x300000007) {
									st64(0x300000000 /* heap bump-allocator cursor */, u)
									st64(sb08 + 0x28, u)
									memcpy(u, s290, 0x290)
									try_accounts_610(s290, c)
									const v = ld32(s290)
									if (v == 2) {
										q = Error_with_account_name(sa90, ld64(s288), ld64(s288 + 8), "token_mint_input", 0x10)
										p = ld64(sa90)
										st64(a + 0x10, ld64(sa90 + 8))
										st64(a + 8, p)
										st32(a, 2)
										return q
									}
									st64(sb08 + 0x18, v)
									copyr(sb08, s288, 0x10)
									st64(sb08 + 0x10, ld32(s290 + 4))
									memcpy(s410, s278, 0x40)
									copy(s430, s230, 0x20)
									st64(sb08 + 0x20, ld64(s270 + 0x38))
									try_accounts_610(s290, c)
									const w = ld32(s290)
									if (w == 2) {
										q = Error_with_account_name(sa80, ld64(s288), ld64(s288 + 8), "token_mint_intermediate", 0x17)
										p = ld64(sa80)
										st64(a + 0x10, ld64(sa80 + 8))
										st64(a + 8, p)
										st32(a, 2)
										return q
									}
									st64(sb30 + 0x18, w)
									copyr(sb30, s288, 0x10)
									st64(sb30 + 0x10, ld32(s290 + 4))
									memcpy(s3b0, s278, 0x40)
									copy(s3d0, s230, 0x20)
									st64(sb30 + 0x20, ld64(s270 + 0x38))
									try_accounts_610(s290, c)
									const x = ld32(s290)
									if (x == 2) {
										q = Error_with_account_name(sa70, ld64(s288), ld64(s288 + 8), "token_mint_output", 0x11)
										p = ld64(sa70)
										st64(a + 0x10, ld64(sa70 + 8))
										st64(a + 8, p)
										st32(a, 2)
										return q
									}
									st64(sb58 + 0x18, x)
									copyr(sb58, s288, 0x10)
									st64(sb58 + 0x10, ld32(s290 + 4))
									memcpy(s350, s278, 0x40)
									copy(s370, s230, 0x20)
									st64(sb58 + 0x20, ld64(s270 + 0x38))
									try_accounts_120(s290, c)
									const z = ld64(s288)
									const y = ld64(s290)
									if (y == 2) {
										st64(sb68, z)
										try_accounts_120(s290, c, z)
										st64(sb68 + 8, ld64(s288))
										const aa = ld64(s290)
										if (aa == 2) {
											try_accounts_120(s290, c)
											st64(sb70, ld64(s288))
											const ab = ld64(s290)
											if (ab == 2) {
												fn_2258(s290, c)
												st64(sb78, ld64(s288))
												const ac = ld64(s290)
												if (ac == 2) {
													fn_2258(s290, c)
													st64(sb80, ld64(s288))
													const ad = ld64(s290)
													if (ad == 2) {
														fn_2258(s290, c)
														st64(sb88, ld64(s288))
														const ae = ld64(s290)
														if (ae == 2) {
															fn_2258(s290, c)
															st64(sb90, ld64(s288))
															const af = ld64(s290)
															if (af == 2) {
																fn_2258(s290, c)
																st64(sb98, ld64(s288))
																const ag = ld64(s290)
																if (ag == 2) {
																	fn_2258(s290, c)
																	st64(sba0, ld64(s288))
																	const ah = ld64(s290)
																	if (ah == 2) {
																		try_accounts_11718(s290, c)
																		st64(sba8, ld64(s288))
																		const ai = ld64(s290)
																		if (ai == 2) {
																			B72: {
																				B67: {
																					B66: {
																						B63: {
																							B60: {
																								B57: {
																									B54: {
																										const aj = ld64(c + 8)
																										if (aj != 0) {
																											const ao: AccountInfo = ld64(c)
																											st64(sbb0, ao)
																											st64(c, ao + 0x30, aj - 1)
																											if (aj != 1) {
																												const aq: AccountInfo = ld64(c)
																												st64(sbb8, aq)
																												st64(c, aq + 0x30, aj - 2)
																												if (aj != 2) {
																													const at: AccountInfo = ld64(c)
																													st64(sbc0, at)
																													st64(c, at + 0x30, aj - 3)
																													if (aj != 3) {
																														const av: AccountInfo = ld64(c)
																														st64(sbc8, av)
																														st64(c, av + 0x30, aj - 4)
																														if (aj != 4) {
																															const ax: AccountInfo = ld64(c)
																															st64(sbd0, ax)
																															st64(c, ax + 0x30, aj - 5)
																															if (aj != 5) {
																																const az: AccountInfo = ld64(c)
																																st64(sbd8, az)
																																st64(c, az + 0x30, aj - 6)
																																if (aj != 6) {
																																	const bc: AccountInfo = ld64(c)
																																	st64(sbe0, bc)
																																	st64(c, bc + 0x30, aj - 7)
																																	if (aj == 7) {
																																		break B67
																																	}
																																	st64(c + 8, aj - 8)
																																	const bd: AccountInfo = ld64(c)
																																	st64(sbe8, bd)
																																	st64(c, bd + 0x30)
																																	break B72
																																}
																																break B66
																															}
																															break B63
																														}
																														break B60
																													}
																													break B57
																												}
																												break B54
																											}
																										} else {
																											anchor_error_from(s4e0, 0xbbd /* anchor::AccountNotEnoughKeys */, ak, al, am)
																											st64(sbb0, ld64(s4e0 + 8))
																											const an = ld64(s4e0)
																											if (an != 2) {
																												q = Error_with_account_name(s4f0, an, ld64(sbb0), "tick_array_one_0", 0x10)
																												p = ld64(s4f0)
																												st64(a + 0x10, ld64(s4f0 + 8))
																												st64(a + 8, p)
																												st32(a, 2)
																												return q
																											}
																										}
																										anchor_error_from(s500, 0xbbd /* anchor::AccountNotEnoughKeys */, ak, al, am)
																										st64(sbb8, ld64(s500 + 8))
																										const ap = ld64(s500)
																										if (ap != 2) {
																											q = Error_with_account_name(s510, ap, ld64(sbb8), "tick_array_one_1", 0x10)
																											p = ld64(s510)
																											st64(a + 0x10, ld64(s510 + 8))
																											st64(a + 8, p)
																											st32(a, 2)
																											return q
																										}
																									}
																									anchor_error_from(s520, 0xbbd /* anchor::AccountNotEnoughKeys */, ak, al, am)
																									st64(sbc0, ld64(s520 + 8))
																									const ar = ld64(s520)
																									if (ar != 2) {
																										q = Error_with_account_name(s530, ar, ld64(sbc0), "tick_array_one_2", 0x10)
																										p = ld64(s530)
																										st64(a + 0x10, ld64(s530 + 8))
																										st64(a + 8, p)
																										st32(a, 2)
																										return q
																									}
																								}
																								anchor_error_from(s540, 0xbbd /* anchor::AccountNotEnoughKeys */, ak, al, am)
																								st64(sbc8, ld64(s540 + 8))
																								const au = ld64(s540)
																								if (au != 2) {
																									q = Error_with_account_name(s550, au, ld64(sbc8), "tick_array_two_0", 0x10)
																									p = ld64(s550)
																									st64(a + 0x10, ld64(s550 + 8))
																									st64(a + 8, p)
																									st32(a, 2)
																									return q
																								}
																							}
																							anchor_error_from(s560, 0xbbd /* anchor::AccountNotEnoughKeys */, ak, al, am)
																							st64(sbd0, ld64(s560 + 8))
																							const aw = ld64(s560)
																							if (aw != 2) {
																								q = Error_with_account_name(s570, aw, ld64(sbd0), "tick_array_two_1", 0x10)
																								p = ld64(s570)
																								st64(a + 0x10, ld64(s570 + 8))
																								st64(a + 8, p)
																								st32(a, 2)
																								return q
																							}
																						}
																						anchor_error_from(s580, 0xbbd /* anchor::AccountNotEnoughKeys */, ak, al, am)
																						st64(sbd8, ld64(s580 + 8))
																						const ay = ld64(s580)
																						if (ay != 2) {
																							q = Error_with_account_name(s590, ay, ld64(sbd8), "tick_array_two_2", 0x10)
																							p = ld64(s590)
																							st64(a + 0x10, ld64(s590 + 8))
																							st64(a + 8, p)
																							st32(a, 2)
																							return q
																						}
																					}
																					anchor_error_from(s5a0, 0xbbd /* anchor::AccountNotEnoughKeys */, ak, al, am)
																					st64(sbe0, ld64(s5a0 + 8))
																					const ba = ld64(s5a0)
																					if (ba != 2) {
																						q = Error_with_account_name(s5b0, ba, ld64(sbe0), "oracle_one", 0xa)
																						p = ld64(s5b0)
																						st64(a + 0x10, ld64(s5b0 + 8))
																						st64(a + 8, p)
																						st32(a, 2)
																						return q
																					}
																				}
																				anchor_error_from(s5c0, 0xbbd /* anchor::AccountNotEnoughKeys */, ak, al, am)
																				st64(sbe8, ld64(s5c0 + 8))
																				const bb = ld64(s5c0)
																				if (bb != 2) {
																					q = Error_with_account_name(s5d0, bb, ld64(sbe8), "oracle_two", 0xa)
																					p = ld64(s5d0)
																					st64(a + 0x10, ld64(s5d0 + 8))
																					st64(a + 8, p)
																					st32(a, 2)
																					return q
																				}
																			}
																			fn_12758(s290, c, ak, al, am)
																			st64(sbf0, ld64(s288))
																			const be = ld64(s290)
																			if (be == 2) {
																				if (ld8(ld64(ld64(sb08 + 0x30)) + 0x29 /* is_writable */) == 0) {
																					anchor_error_from(sa50, 0x7d0 /* anchor::ConstraintMut */)
																					q = Error_with_account_name(sa60, ld64(sa50), ld64(sa50 + 8), "whirlpool_one", 0xd)
																					p = ld64(sa60)
																					st64(a + 0x10, ld64(sa60 + 8))
																					st64(a + 8, p)
																					st32(a, 2)
																					return q
																				}
																				if (ld8(ld64(ld64(sb08 + 0x28)) + 0x29 /* is_writable */) != 0) {
																					B84: {
																						bf = ld64(ld64(sb08 + 0x20))
																						copyr(s2d0, bf, 0x20)
																						if (h != 0) {
																							const bj = ld64(sb08 + 0x30)
																							copyr(s2b0, bj + 0x1a8, 0x20)
																							const bk = memcmp(s2d0, s2b0, 0x20)
																							if ((bk as u32) == 0) {
																								const br = ld64(ld64(sb30 + 0x20))
																								copyr(s2d0, br, 0x20)
																								bs = 0x1e8
																								break B84
																							}
																						} else {
																							const bg = ld64(sb08 + 0x30)
																							copyr(s2b0, bg + 0x1e8, 0x20)
																							const bh = memcmp(s2d0, s2b0, 0x20)
																							if ((bh as u32) == 0) {
																								const bi = ld64(ld64(sb30 + 0x20))
																								copyr(s2d0, bi, 0x20)
																								bs = 0x1a8
																								break B84
																							}
																						}
																						anchor_error_from(s5f0, 0x7dc /* anchor::ConstraintAddress */, bl, bm, bn)
																						const bq = Error_with_account_name(s600, ld64(s5f0), ld64(s5f0 + 8), "token_mint_input", 0x10)
																						const bp = ld64(s600 + 8)
																						const bo = ld64(s600)
																						copy(s290, s2d0, 0x40)
																						q = fn_13b5c0(s610, bo, bp, s290, bq)
																						p = ld64(s610)
																						st64(a + 0x10, ld64(s610 + 8))
																						st64(a + 8, p)
																						st32(a, 2)
																						return q
																					}
																					const bt = ld64(sb08 + 0x30) + bs
																					copyr(s2b0, bt, 0x20)
																					if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
																						const by = ld64(sad0 + 8) != 0 ? 0x1e8 : 0x1a8
																						const bx = ld64(ld64(sb58 + 0x20))
																						copyr(s2c8, bx + 8, 0x18)
																						st64(sbf8, bx)
																						st64(s2d0, ld64(bx))
																						const bz = ld64(sb08 + 0x28) + by
																						copyr(s2b0, bz, 0x20)
																						if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
																							const cd = ld64(ld64(sb68))
																							copyr(s2d0, cd, 0x20)
																							AccountInfo_clone(s290, ld64(sb08 + 0x20))
																							const ce = ld64(s278)
																							copy(s2b0, ce, 0x20)
																							const cg = ld64(s288 + 8)
																							const cf = ld64(s288)
																							rc_dec(cf)
																							rc_dec(cg)
																							if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
																								const ck = ld64(ld64(sb68 + 8))
																								copyr(s2d0, ck, 0x20)
																								AccountInfo_clone(s290, ld64(sb30 + 0x20))
																								const cl = ld64(s278)
																								copy(s2b0, cl, 0x20)
																								const cn = ld64(s288 + 8)
																								const cm = ld64(s288)
																								rc_dec(cm)
																								rc_dec(cn)
																								if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
																									const cr = ld64(ld64(sb70))
																									copyr(s2d0, cr, 0x20)
																									AccountInfo_clone(s290, ld64(sb58 + 0x20))
																									const cs = ld64(s278)
																									copy(s2b0, cs, 0x20)
																									const cu = ld64(s288 + 8)
																									const ct = ld64(s288)
																									rc_dec(ct)
																									rc_dec(cu)
																									if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
																										if (ld8(ld64(ld64(sb78) + 0x20) + 0x29) == 0) {
																											anchor_error_from(sa10, 0x7d0 /* anchor::ConstraintMut */)
																											q = Error_with_account_name(sa20, ld64(sa10), ld64(sa10 + 8), "token_owner_account_input", 0x19)
																											p = ld64(sa20)
																											st64(a + 0x10, ld64(sa20 + 8))
																											st64(a + 8, p)
																											st32(a, 2)
																											return q
																										}
																										copyr(s290, bf, 0x20)
																										if ((memcmp(ld64(sb78) + 0x28, s290, 0x20) as u32) == 0) {
																											const token_vault_one_input: AccountInfo = ld64(ld64(sb80) + 0x20)
																											if (token_vault_one_input.is_writable != 0) {
																												B122: {
																													B120: {
																														const cz = token_vault_one_input.key
																														copyr(s2d0, cz, 0x20)
																														if (h != 0) {
																															const de = ld64(sb08 + 0x30)
																															copyr(s2b0, de + 0x1c8, 0x20)
																															const df = memcmp(s2d0, s2b0, 0x20)
																															if ((df as u32) == 0) {
																																const dm: AccountInfo = ld64(ld64(sb88) + 0x20)
																																if (dm.is_writable == 0) {
																																	break B122
																																}
																																const dn = dm.key
																																copyr(s2d0, dn, 0x20)
																																dp = 0x208
																																break B120
																															}
																														} else {
																															const da = ld64(sb08 + 0x30)
																															copyr(s2b0, da + 0x208, 0x20)
																															const db = memcmp(s2d0, s2b0, 0x20)
																															if ((db as u32) == 0) {
																																const dc: AccountInfo = ld64(ld64(sb88) + 0x20)
																																if (dc.is_writable == 0) {
																																	break B122
																																}
																																const dd = dc.key
																																copyr(s2d0, dd, 0x20)
																																dp = 0x1c8
																																break B120
																															}
																														}
																														anchor_error_from(s730, 0x7dc /* anchor::ConstraintAddress */, dg, dh, di)
																														const dl = Error_with_account_name(s740, ld64(s730), ld64(s730 + 8), "token_vault_one_input", 0x15)
																														const dk = ld64(s740 + 8)
																														const dj = ld64(s740)
																														copy(s290, s2d0, 0x40)
																														q = fn_13b5c0(s750, dj, dk, s290, dl)
																														p = ld64(s750)
																														st64(a + 0x10, ld64(s750 + 8))
																														st64(a + 8, p)
																														st32(a, 2)
																														return q
																													}
																													const dq = ld64(sb08 + 0x30) + dp
																													copyr(s2b0, dq, 0x20)
																													if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
																														const token_vault_two_intermediate: AccountInfo = ld64(ld64(sb90) + 0x20)
																														if (token_vault_two_intermediate.is_writable == 0) {
																															anchor_error_from(s9b0, 0x7d0 /* anchor::ConstraintMut */)
																															q = Error_with_account_name(s9c0, ld64(s9b0), ld64(s9b0 + 8), "token_vault_two_intermediate", 0x1c)
																															p = ld64(s9c0)
																															st64(a + 0x10, ld64(s9c0 + 8))
																															st64(a + 8, p)
																															st32(a, 2)
																															return q
																														}
																														B135: {
																															B133: {
																																const dv = token_vault_two_intermediate.key
																																copyr(s2d0, dv, 0x20)
																																if (ld64(sad0 + 8) != 0) {
																																	const ea = ld64(sb08 + 0x28)
																																	copyr(s2b0, ea + 0x1c8, 0x20)
																																	const eb = memcmp(s2d0, s2b0, 0x20)
																																	if ((eb as u32) == 0) {
																																		const ei: AccountInfo = ld64(ld64(sb98) + 0x20)
																																		if (ei.is_writable == 0) {
																																			break B135
																																		}
																																		const ej = ei.key
																																		copyr(s2d0, ej, 0x20)
																																		ek = 0x208
																																		break B133
																																	}
																																} else {
																																	const dw = ld64(sb08 + 0x28)
																																	copyr(s2b0, dw + 0x208, 0x20)
																																	const dx = memcmp(s2d0, s2b0, 0x20)
																																	if ((dx as u32) == 0) {
																																		const dy: AccountInfo = ld64(ld64(sb98) + 0x20)
																																		if (dy.is_writable == 0) {
																																			break B135
																																		}
																																		const dz = dy.key
																																		copyr(s2d0, dz, 0x20)
																																		ek = 0x1c8
																																		break B133
																																	}
																																}
																																anchor_error_from(s790, 0x7dc /* anchor::ConstraintAddress */, ec, ed, ee)
																																const eh = Error_with_account_name(s7a0, ld64(s790), ld64(s790 + 8), "token_vault_two_intermediate", 0x1c)
																																const eg = ld64(s7a0 + 8)
																																const ef = ld64(s7a0)
																																copy(s290, s2d0, 0x40)
																																q = fn_13b5c0(s7b0, ef, eg, s290, eh)
																																p = ld64(s7b0)
																																st64(a + 0x10, ld64(s7b0 + 8))
																																st64(a + 8, p)
																																st32(a, 2)
																																return q
																															}
																															const el = ld64(sb08 + 0x28) + ek
																															copyr(s2b0, el, 0x20)
																															if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
																																if (ld8(ld64(ld64(sba0) + 0x20) + 0x29) == 0) {
																																	anchor_error_from(s970, 0x7d0 /* anchor::ConstraintMut */)
																																	q = Error_with_account_name(s980, ld64(s970), ld64(s970 + 8), "token_owner_account_output", 0x1a)
																																	p = ld64(s980)
																																	st64(a + 0x10, ld64(s980 + 8))
																																	st64(a + 8, p)
																																	st32(a, 2)
																																	return q
																																}
																																const ep = ld64(sbf8)
																																copyr(s290, ep, 0x20)
																																if ((memcmp(ld64(sba0) + 0x28, s290, 0x20) as u32) == 0) {
																																	if (ld8(ld64(sbb0) + 0x29) != 0) {
																																		if (ld8(ld64(sbb8) + 0x29) != 0) {
																																			if (ld8(ld64(sbc0) + 0x29) != 0) {
																																				if (ld8(ld64(sbc8) + 0x29) != 0) {
																																					if (ld8(ld64(sbd0) + 0x29) != 0) {
																																						if (ld8(ld64(sbd8) + 0x29) != 0) {
																																							const eq = ld64(ld64(ld64(sb08 + 0x30)) /* key */)
																																							const eu = ld64(eq)
																																							const et = ld64(eq + 8)
																																							const es = ld64(eq + 0x10)
																																							const er = ld64(eq + 0x18)
																																							st64(s2d0, 0x100154c38, 6, s2b0, 0x20, eu, et, es, er)
																																							// PDA find_program_address(["oracle", *s2b0], program *(ld64(sad0)))
																																							Pubkey_find_program_address(s290, s2d0, 2, ld64(sad0))
																																							copyr(s310, s290, 0x20)
																																							st8(ev, ld8(s270))
																																							const ew = ld64(ld64(sbe0) /* key */)
																																							copyr(s290, ew, 0x20)
																																							if ((memcmp(s290, s310, 0x20) as u32) != 0) {
																																								anchor_error_from(s810, 0x7d6 /* anchor::ConstraintSeeds */)
																																								const fi = Error_with_account_name(s820, ld64(s810), ld64(s810 + 8), "oracle_one", 0xa)
																																								const fh = ld64(s820 + 8)
																																								const fg = ld64(s820)
																																								copyr(s290, ew, 0x20)
																																								copy(s270, s310, 0x20)
																																								q = fn_13b5c0(s830, fg, fh, s290, fi)
																																								p = ld64(s830)
																																								st64(a + 0x10, ld64(s830 + 8))
																																								st64(a + 8, p)
																																								st32(a, 2)
																																								return q
																																							}
																																							if (ld8(ld64(sbe0) + 0x29 /* is_writable */) == 0) {
																																								anchor_error_from(s890, 0x7d0 /* anchor::ConstraintMut */)
																																								q = Error_with_account_name(s8a0, ld64(s890), ld64(s890 + 8), "oracle_one", 0xa)
																																								p = ld64(s8a0)
																																								st64(a + 0x10, ld64(s8a0 + 8))
																																								st64(a + 8, p)
																																								st32(a, 2)
																																								return q
																																							}
																																							const ex = ld64(ld64(ld64(sb08 + 0x28)) /* key */)
																																							const fb = ld64(ex)
																																							const fa = ld64(ex + 8)
																																							const ez = ld64(ex + 0x10)
																																							const ey = ld64(ex + 0x18)
																																							st64(s2d0, 0x100154c38, 6, s2b0, 0x20, fb, fa, ez, ey)
																																							// PDA find_program_address(["oracle", *s2b0], program *(ld64(sad0)))
																																							Pubkey_find_program_address(s290, s2d0, 2, ld64(sad0))
																																							copyr(s2f0, s290, 0x20)
																																							st8(ev + 1, ld8(s270))
																																							const fc = ld64(ld64(sbe8) /* key */)
																																							copyr(s290, fc, 0x20)
																																							if ((memcmp(s290, s2f0, 0x20) as u32) == 0) {
																																								if (ld8(ld64(sbe8) + 0x29 /* is_writable */) == 0) {
																																									anchor_error_from(s870, 0x7d0 /* anchor::ConstraintMut */)
																																									q = Error_with_account_name(s880, ld64(s870), ld64(s870 + 8), "oracle_two", 0xa)
																																									fn = ld64(s880 + 8)
																																									st64(a + 8, ld64(s880))
																																									st64(a + 0x10, fn)
																																									st32(a, 2)
																																									return q
																																								}
																																								memcpy(a + 0x18, s410, 0x40)
																																								copy(a + 0x60, s430, 0x20)
																																								memcpy(a + 0x98, s3b0, 0x40)
																																								copy(a + 0xe0, s3d0, 0x20)
																																								q = memcpy(a + 0x118, s350, 0x40)
																																								const fm = ld64(s370 + 0x18)
																																								const fl = ld64(s370 + 0x10)
																																								const fk = ld64(s370 + 8)
																																								const fj = ld64(s370)
																																								copy(a + 8, sb08, 0x10)
																																								st64(a + 0x58, ld64(sb08 + 0x20))
																																								copy(a + 0x88, sb30, 0x10)
																																								st64(a + 0xd8, ld64(sb30 + 0x20))
																																								copy(a + 0x108, sb58, 0x10)
																																								st64(a + 0x158, ld64(sb58 + 0x20))
																																								st64(a + 0x180, ld64(sb08 + 0x30))
																																								st64(a + 0x188, ld64(sb08 + 0x28))
																																								copy(a + 0x190, sb68, 0x10)
																																								st64(a + 0x1a0, ld64(sb70))
																																								st64(a + 0x1a8, ld64(sb78))
																																								st64(a + 0x1b0, ld64(sb80))
																																								st64(a + 0x1b8, ld64(sb88))
																																								st64(a + 0x1c0, ld64(sb90))
																																								st64(a + 0x1c8, ld64(sb98))
																																								st64(a + 0x1d0, ld64(sba0))
																																								st64(a + 0x1d8, ld64(sba8))
																																								st64(a + 0x1e0, ld64(sbb0))
																																								st64(a + 0x1e8, ld64(sbb8))
																																								st64(a + 0x1f0, ld64(sbc0))
																																								st64(a + 0x1f8, ld64(sbc8))
																																								st64(a + 0x200, ld64(sbd0))
																																								st64(a + 0x208, ld64(sbd8))
																																								st64(a + 0x210, ld64(sbe0))
																																								st64(a + 0x218, ld64(sbe8))
																																								st64(a + 0x220, ld64(sbf0))
																																								st32(a + 0x104, ld64(sb58 + 0x10))
																																								st32(a + 0x100, ld64(sb58 + 0x18))
																																								st32(a + 0x84, ld64(sb30 + 0x10))
																																								st32(a + 0x80, ld64(sb30 + 0x18))
																																								st32(a + 4, ld64(sb08 + 0x10))
																																								st32(a, ld64(sb08 + 0x18))
																																								st64(a + 0x160, fj, fk, fl, fm)
																																								return q
																																							}
																																							anchor_error_from(s840, 0x7d6 /* anchor::ConstraintSeeds */)
																																							const ff = Error_with_account_name(s850, ld64(s840), ld64(s840 + 8), "oracle_two", 0xa)
																																							const fe = ld64(s850 + 8)
																																							const fd = ld64(s850)
																																							copyr(s290, fc, 0x20)
																																							copy(s270, s2f0, 0x20)
																																							q = fn_13b5c0(s860, fd, fe, s290, ff)
																																							fn = ld64(s860 + 8)
																																							st64(a + 8, ld64(s860))
																																							st64(a + 0x10, fn)
																																							st32(a, 2)
																																							return q
																																						}
																																						anchor_error_from(s8b0, 0x7d0 /* anchor::ConstraintMut */)
																																						q = Error_with_account_name(s8c0, ld64(s8b0), ld64(s8b0 + 8), "tick_array_two_2", 0x10)
																																						p = ld64(s8c0)
																																						st64(a + 0x10, ld64(s8c0 + 8))
																																						st64(a + 8, p)
																																						st32(a, 2)
																																						return q
																																					}
																																					anchor_error_from(s8d0, 0x7d0 /* anchor::ConstraintMut */)
																																					q = Error_with_account_name(s8e0, ld64(s8d0), ld64(s8d0 + 8), "tick_array_two_1", 0x10)
																																					p = ld64(s8e0)
																																					st64(a + 0x10, ld64(s8e0 + 8))
																																					st64(a + 8, p)
																																					st32(a, 2)
																																					return q
																																				}
																																				anchor_error_from(s8f0, 0x7d0 /* anchor::ConstraintMut */)
																																				q = Error_with_account_name(s900, ld64(s8f0), ld64(s8f0 + 8), "tick_array_two_0", 0x10)
																																				p = ld64(s900)
																																				st64(a + 0x10, ld64(s900 + 8))
																																				st64(a + 8, p)
																																				st32(a, 2)
																																				return q
																																			}
																																			anchor_error_from(s910, 0x7d0 /* anchor::ConstraintMut */)
																																			q = Error_with_account_name(s920, ld64(s910), ld64(s910 + 8), "tick_array_one_2", 0x10)
																																			p = ld64(s920)
																																			st64(a + 0x10, ld64(s920 + 8))
																																			st64(a + 8, p)
																																			st32(a, 2)
																																			return q
																																		}
																																		anchor_error_from(s930, 0x7d0 /* anchor::ConstraintMut */)
																																		q = Error_with_account_name(s940, ld64(s930), ld64(s930 + 8), "tick_array_one_1", 0x10)
																																		p = ld64(s940)
																																		st64(a + 0x10, ld64(s940 + 8))
																																		st64(a + 8, p)
																																		st32(a, 2)
																																		return q
																																	}
																																	anchor_error_from(s950, 0x7d0 /* anchor::ConstraintMut */)
																																	q = Error_with_account_name(s960, ld64(s950), ld64(s950 + 8), "tick_array_one_0", 0x10)
																																	p = ld64(s960)
																																	st64(a + 0x10, ld64(s960 + 8))
																																	st64(a + 8, p)
																																	st32(a, 2)
																																	return q
																																}
																																anchor_error_from(s7f0, 0x7d3 /* anchor::ConstraintRaw */)
																																q = Error_with_account_name(s800, ld64(s7f0), ld64(s7f0 + 8), "token_owner_account_output", 0x1a)
																																p = ld64(s800)
																																st64(a + 0x10, ld64(s800 + 8))
																																st64(a + 8, p)
																																st32(a, 2)
																																return q
																															}
																															anchor_error_from(s7c0, 0x7dc /* anchor::ConstraintAddress */)
																															const eo = Error_with_account_name(s7d0, ld64(s7c0), ld64(s7c0 + 8), "token_vault_two_output", 0x16)
																															const en = ld64(s7d0 + 8)
																															const em = ld64(s7d0)
																															copy(s290, s2d0, 0x40)
																															q = fn_13b5c0(s7e0, em, en, s290, eo)
																															p = ld64(s7e0)
																															st64(a + 0x10, ld64(s7e0 + 8))
																															st64(a + 8, p)
																															st32(a, 2)
																															return q
																														}
																														anchor_error_from(s990, 0x7d0 /* anchor::ConstraintMut */, ec, ed, ee)
																														q = Error_with_account_name(s9a0, ld64(s990), ld64(s990 + 8), "token_vault_two_output", 0x16)
																														p = ld64(s9a0)
																														st64(a + 0x10, ld64(s9a0 + 8))
																														st64(a + 8, p)
																														st32(a, 2)
																														return q
																													}
																													anchor_error_from(s760, 0x7dc /* anchor::ConstraintAddress */)
																													const dt = Error_with_account_name(s770, ld64(s760), ld64(s760 + 8), "token_vault_one_intermediate", 0x1c)
																													const ds = ld64(s770 + 8)
																													const dr = ld64(s770)
																													copy(s290, s2d0, 0x40)
																													q = fn_13b5c0(s780, dr, ds, s290, dt)
																													p = ld64(s780)
																													st64(a + 0x10, ld64(s780 + 8))
																													st64(a + 8, p)
																													st32(a, 2)
																													return q
																												}
																												anchor_error_from(s9d0, 0x7d0 /* anchor::ConstraintMut */, dg, dh, di)
																												q = Error_with_account_name(s9e0, ld64(s9d0), ld64(s9d0 + 8), "token_vault_one_intermediate", 0x1c)
																												p = ld64(s9e0)
																												st64(a + 0x10, ld64(s9e0 + 8))
																												st64(a + 8, p)
																												st32(a, 2)
																												return q
																											}
																											anchor_error_from(s9f0, 0x7d0 /* anchor::ConstraintMut */)
																											q = Error_with_account_name(sa00, ld64(s9f0), ld64(s9f0 + 8), "token_vault_one_input", 0x15)
																											p = ld64(sa00)
																											st64(a + 0x10, ld64(sa00 + 8))
																											st64(a + 8, p)
																											st32(a, 2)
																											return q
																										}
																										anchor_error_from(s710, 0x7d3 /* anchor::ConstraintRaw */)
																										q = Error_with_account_name(s720, ld64(s710), ld64(s710 + 8), "token_owner_account_input", 0x19)
																										p = ld64(s720)
																										st64(a + 0x10, ld64(s720 + 8))
																										st64(a + 8, p)
																										st32(a, 2)
																										return q
																									}
																									anchor_error_from(s6e0, 0x7dc /* anchor::ConstraintAddress */)
																									const cx = Error_with_account_name(s6f0, ld64(s6e0), ld64(s6e0 + 8), "token_program_output", 0x14)
																									const cw = ld64(s6f0 + 8)
																									const cv = ld64(s6f0)
																									copy(s290, s2d0, 0x40)
																									q = fn_13b5c0(s700, cv, cw, s290, cx)
																									p = ld64(s700)
																									st64(a + 0x10, ld64(s700 + 8))
																									st64(a + 8, p)
																									st32(a, 2)
																									return q
																								}
																								anchor_error_from(s6b0, 0x7dc /* anchor::ConstraintAddress */)
																								const cq = Error_with_account_name(s6c0, ld64(s6b0), ld64(s6b0 + 8), "token_program_intermediate", 0x1a)
																								const cp = ld64(s6c0 + 8)
																								const co = ld64(s6c0)
																								copy(s290, s2d0, 0x40)
																								q = fn_13b5c0(s6d0, co, cp, s290, cq)
																								p = ld64(s6d0)
																								st64(a + 0x10, ld64(s6d0 + 8))
																								st64(a + 8, p)
																								st32(a, 2)
																								return q
																							}
																							anchor_error_from(s680, 0x7dc /* anchor::ConstraintAddress */)
																							const cj = Error_with_account_name(s690, ld64(s680), ld64(s680 + 8), "token_program_input", 0x13)
																							const ci = ld64(s690 + 8)
																							const ch = ld64(s690)
																							copy(s290, s2d0, 0x40)
																							q = fn_13b5c0(s6a0, ch, ci, s290, cj)
																							p = ld64(s6a0)
																							st64(a + 0x10, ld64(s6a0 + 8))
																							st64(a + 8, p)
																							st32(a, 2)
																							return q
																						}
																						anchor_error_from(s650, 0x7dc /* anchor::ConstraintAddress */)
																						const cc = Error_with_account_name(s660, ld64(s650), ld64(s650 + 8), "token_mint_output", 0x11)
																						const cb = ld64(s660 + 8)
																						const ca = ld64(s660)
																						copy(s290, s2d0, 0x40)
																						q = fn_13b5c0(s670, ca, cb, s290, cc)
																						p = ld64(s670)
																						st64(a + 0x10, ld64(s670 + 8))
																						st64(a + 8, p)
																						st32(a, 2)
																						return q
																					}
																					anchor_error_from(s620, 0x7dc /* anchor::ConstraintAddress */)
																					const bw = Error_with_account_name(s630, ld64(s620), ld64(s620 + 8), "token_mint_intermediate", 0x17)
																					const bv = ld64(s630 + 8)
																					const bu = ld64(s630)
																					copy(s290, s2d0, 0x40)
																					q = fn_13b5c0(s640, bu, bv, s290, bw)
																					p = ld64(s640)
																					st64(a + 0x10, ld64(s640 + 8))
																					st64(a + 8, p)
																					st32(a, 2)
																					return q
																				}
																				anchor_error_from(sa30, 0x7d0 /* anchor::ConstraintMut */)
																				q = Error_with_account_name(sa40, ld64(sa30), ld64(sa30 + 8), "whirlpool_two", 0xd)
																				p = ld64(sa40)
																				st64(a + 0x10, ld64(sa40 + 8))
																				st64(a + 8, p)
																				st32(a, 2)
																				return q
																			}
																			q = Error_with_account_name(s5e0, be, ld64(sbf0), "memo_program", 0xc)
																			p = ld64(s5e0)
																			st64(a + 0x10, ld64(s5e0 + 8))
																			st64(a + 8, p)
																			st32(a, 2)
																			return q
																		}
																		q = Error_with_account_name(s4d0, ai, ld64(sba8), "token_authority", 0xf)
																		p = ld64(s4d0)
																		st64(a + 0x10, ld64(s4d0 + 8))
																		st64(a + 8, p)
																		st32(a, 2)
																		return q
																	}
																	q = Error_with_account_name(s4c0, ah, ld64(sba0), "token_owner_account_output", 0x1a)
																	p = ld64(s4c0)
																	st64(a + 0x10, ld64(s4c0 + 8))
																	st64(a + 8, p)
																	st32(a, 2)
																	return q
																}
																q = Error_with_account_name(s4b0, ag, ld64(sb98), "token_vault_two_output", 0x16)
																p = ld64(s4b0)
																st64(a + 0x10, ld64(s4b0 + 8))
																st64(a + 8, p)
																st32(a, 2)
																return q
															}
															q = Error_with_account_name(s4a0, af, ld64(sb90), "token_vault_two_intermediate", 0x1c)
															p = ld64(s4a0)
															st64(a + 0x10, ld64(s4a0 + 8))
															st64(a + 8, p)
															st32(a, 2)
															return q
														}
														q = Error_with_account_name(s490, ae, ld64(sb88), "token_vault_one_intermediate", 0x1c)
														p = ld64(s490)
														st64(a + 0x10, ld64(s490 + 8))
														st64(a + 8, p)
														st32(a, 2)
														return q
													}
													q = Error_with_account_name(s480, ad, ld64(sb80), "token_vault_one_input", 0x15)
													p = ld64(s480)
													st64(a + 0x10, ld64(s480 + 8))
													st64(a + 8, p)
													st32(a, 2)
													return q
												}
												q = Error_with_account_name(s470, ac, ld64(sb78), "token_owner_account_input", 0x19)
												p = ld64(s470)
												st64(a + 0x10, ld64(s470 + 8))
												st64(a + 8, p)
												st32(a, 2)
												return q
											}
											q = Error_with_account_name(s460, ab, ld64(sb70), "token_program_output", 0x14)
											p = ld64(s460)
											st64(a + 0x10, ld64(s460 + 8))
											st64(a + 8, p)
											st32(a, 2)
											return q
										}
										q = Error_with_account_name(s450, aa, ld64(sb68 + 8), "token_program_intermediate", 0x1a)
										p = ld64(s450)
										st64(a + 0x10, ld64(s450 + 8))
										st64(a + 8, p)
										st32(a, 2)
										return q
									}
									q = Error_with_account_name(s440, y, z, "token_program_input", 0x13)
									p = ld64(s440)
									st64(a + 0x10, ld64(s440 + 8))
									st64(a + 8, p)
									st32(a, 2)
									return q
								}
								alloc_handle_alloc_error(8, 0x290)
							}
							alloc_handle_alloc_error(8, 0x290)
						}
					}
				}
				st64(s290, 0x100159620)
				st64(s288 + 8, s2d0)
				st64(s2d0, s2f0, fn_14ef78)
				st64(s270, 0)
				st64(s288, 1)
				st64(s278, 1)
				// fmt "Invalid bool representation: {}" {} = *s2f0 [fn_14ef78]
				fn_147e78(s2b0, s290, g, d, e)
				j = fn_b580(s2b0)
				break B10
			}
		}
		j = fn_1459d0(0x100159468)
	}
	const k = j
	if (2 > (j & 3) - 2) {
		q = anchor_error_from(sac0, 0x66 /* anchor::InstructionDidNotDeserialize */, m, n, o)
		p = ld64(sac0)
		st64(a + 0x10, ld64(sac0 + 8))
		st64(a + 8, p)
		st32(a, 2)
		return q
	}
	if ((k & 3) == 0) {
		q = anchor_error_from(sac0, 0x66 /* anchor::InstructionDidNotDeserialize */, m, n, o)
		p = ld64(sac0)
		st64(a + 0x10, ld64(sac0 + 8))
		st64(a + 8, p)
		st32(a, 2)
		return q
	}
	const l = ld64(ld64(j + 7))
	callx(l, ld64(j - 1), l)
	q = anchor_error_from(sac0, 0x66 /* anchor::InstructionDidNotDeserialize */)
	p = ld64(sac0)
	st64(a + 0x10, ld64(sac0 + 8))
	st64(a + 8, p)
	st32(a, 2)
	return q
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), a (points to it), p5 (value), p6 (value), p7 (value), p8 (value), p9 (value), p10 (value), p11 (value), p12 (points to it)
// types [heur]: b: TwoHopSwapV2Context (the handler ix_two_hop_swap_v2 passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_40458(a: u64, b: TwoHopSwapV2Context, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64): u64 {
	const s10 = fp - 0x10, s40 = fp - 0x40, s48 = fp - 0x48, s81 = fp - 0x81, s98 = fp - 0x98, sc0 = fp - 0xc0, sd0 = fp - 0xd0, s109 = fp - 0x109, s120 = fp - 0x120, s148 = fp - 0x148, s158 = fp - 0x158, s170 = fp - 0x170, s188 = fp - 0x188, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1b8 = fp - 0x1b8, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2d8 = fp - 0x2d8, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s308 = fp - 0x308, s320 = fp - 0x320, s338 = fp - 0x338, s350 = fp - 0x350, s368 = fp - 0x368, s380 = fp - 0x380, s398 = fp - 0x398, s3b0 = fp - 0x3b0, s3c8 = fp - 0x3c8, s3e0 = fp - 0x3e0, s3f8 = fp - 0x3f8, s410 = fp - 0x410, s428 = fp - 0x428, s448 = fp - 0x448, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s540 = fp - 0x540, s568 = fp - 0x568, s570 = fp - 0x570, s580 = fp - 0x580, s598 = fp - 0x598, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s608 = fp - 0x608, s610 = fp - 0x610, s618 = fp - 0x618, s620 = fp - 0x620, sf70 = fp - 0xf70, sfa8 = fp - 0xfa8, sfd0 = fp - 0xfd0, sfe0 = fp - 0xfe0, s1000 = fp - 0x1000
	let g, q, r, bs, bu, dd, dl, ef, fm: u64
	st64(s540 + 0x10, a)
	clock_get_13f308(s2f0)
	if (ld64(s2f0) != 0) {
		const p = ld64(s2f0 + 8)
		const o = ld64(s2e0)
		st64(s2e0, ld64(s2d8))
		st64(s2f0, p, o)
		r = fn_13b430(s478, s2f0)
		g = ld64(s478)
		q = ld64(s540 + 0x10)
		st64(q + 8, ld64(s478 + 8))
		st64(q, g)
		return r
	}
	st64(s580, d, p9, p8, p11, p10, c)
	const s = p12
	st64(s540, p7, p6)
	st64(s568 + 0x18, p5)
	let f = ld64(s2d0 + 8)
	q = ld64(s540 + 0x10)
	if (-1 >= (f as i64)) {
		r = fn_87630(s488, 0x15)
		f = ld64(s488 + 8)
		g = ld64(s488)
		if (g != 2) {
			st64(q + 8, f)
			st64(q, g)
			return r
		}
	}
	st64(s598 + 0x10, f)
	const accounts: TwoHopSwapV2Accounts = b.accounts
	const i = ld64(accounts + 0x180)
	const j = ld64(ld64(i))
	copyr(s428, j, 0x20)
	st64(s568 + 0x20, accounts)
	const k = ld64(accounts + 0x188)
	const l = ld64(ld64(k))
	copyr(s2f0, l, 0x20)
	if ((memcmp(s428, s2f0, 0x20) as u32) == 0) {
		r = fn_87630(s528, 0x2a)
		g = ld64(s528)
		q = ld64(s540 + 0x10)
		st64(q + 8, ld64(s528 + 8))
		st64(q, g)
		return r
	}
	const m = ld64(s540 + 8) != 0 ? 0x1e8 : 0x1a8
	const n = ld64(s540) != 0 ? 0x1a8 : 0x1e8
	copyr(s468, i + m, 0x20)
	copyr(s448, k + n, 0x20)
	if ((memcmp(s468, s448, 0x20) as u32) == 0) {
		const u = b.remaining_accounts_len
		const remaining_accounts: AccountInfo = b.remaining_accounts
		st64(s1000, 0x10015328f, 5)
		r = fn_7a5e0(s2f0, remaining_accounts, u, s, 0x10015328f, 5, s, b)
		f = ld64(s2e0)
		const w = ld64(s2f0 + 8)
		const v = ld64(s2f0)
		q = ld64(s540 + 0x10)
		if (v == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
			st64(s598 + 8, w)
			g = ld64(s598 + 8)
			st64(q + 8, f)
			st64(q, g)
			return r
		}
		memcpy(s410, s2d8, 0x120)
		st64(s428, v, w, f)
		const x = ld64(0x300000000 /* heap bump-allocator cursor */)
		const z: TwoHopSwapV2Accounts = ld64(s568 + 0x20)
		const y = x != 0 ? sat_sub(x, 0x90) & -8 : 0x300007f70
		if (y > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, y)
			const aa: AccountInfo = ld64(z + 0x1e0)
			const ab: LamportsCell = aa.lamports
			const ag = aa.key
			rc_inc(ab)
			const ac: DataCell = aa.data
			rc_inc(ac)
			const ad: AccountInfo = ld64(z + 0x1e8)
			const ae: LamportsCell = ad.lamports
			st64(s598 + 8, ae)
			const af = ae.strong
			st64(s5c0 + 8, aa.executable)
			st64(s5c0 + 0x10, aa.is_writable)
			st64(s5c0 + 0x18, aa.is_signer)
			st64(s5c0 + 0x20, aa.rent_epoch)
			st64(s598, aa.owner)
			const aj = ad.key
			rc_inc(ld64(s598 + 8), af)
			st64(s5d0, ac, ag)
			const ah: DataCell = ad.data
			const ai = ah.strong
			st64(s608 + 0x30, aj)
			st64(s5c0, ab)
			rc_inc(ah, ai)
			st64(s608 + 0x28, ah)
			const ak: AccountInfo = ld64(ld64(s568 + 0x20) + 0x1f0)
			const al: LamportsCell = ak.lamports
			const am = al.strong
			st64(s608 + 0x18, ad.executable)
			st64(s608 + 0x20, ad.is_writable)
			const ap = ad.is_signer
			const av = ad.rent_epoch
			const aw = ad.owner
			st64(s608 + 0x10, ak.key)
			rc_inc(al, am)
			const an: DataCell = ak.data
			const ao = an.strong
			st64(s608, s410, ap)
			an.strong = ao + 1
			if (ao != -1) {
				const au = ak.owner
				const at = ak.rent_epoch
				const ar = ak.is_signer
				const aq = ak.is_writable
				st8(y + 0x8a, ak.executable)
				st8(y + 0x89, aq)
				st8(y + 0x88, ar)
				st64(y + 0x80, at)
				st64(y + 0x78, au)
				st64(y + 0x70, an)
				st64(y + 0x68, al)
				st64(y + 0x60, ld64(s608 + 0x10))
				st8(y + 0x5a, ld64(s608 + 0x18))
				st8(y + 0x59, ld64(s608 + 0x20))
				st8(y + 0x58, ld64(s608 + 8))
				st64(y + 0x50, av)
				st64(y + 0x48, aw)
				st64(y + 0x40, ld64(s608 + 0x28))
				st64(y + 0x38, ld64(s598 + 8))
				st64(y + 0x30, ld64(s608 + 0x30))
				st8(y + 0x2a, ld64(s5c0 + 8))
				st8(y + 0x29, ld64(s5c0 + 0x10))
				st8(y + 0x28, ld64(s5c0 + 0x18))
				st64(y + 0x20, ld64(s5c0 + 0x20))
				st64(y + 0x18, ld64(s598))
				st64(y + 0x10, ld64(s5d0))
				st64(y + 8, ld64(s5c0))
				st64(y, ld64(s5d0 + 8))
				st64(s98, 3, y, 3)
				copyr(s2f0, s380, 0x18)
				fn_60de8(s1b8, s98, s2f0, au, aq, av)
				const ax: TwoHopSwapV2Accounts = ld64(s568 + 0x20)
				r = fn_62750(s2f0, s1b8, ld64(ax + 0x180), ld64(s540 + 8))
				let ay = ld64(s2e0)
				const az = ld64(s2f0 + 8)
				let ba = ld64(s2f0)
				st64(s598, ay, az)
				if (ba != 0x8000000000000000) {
					st64(s198, az, ay)
					st64(s5c0 + 0x20, ba)
					st64(s1a0, ba)
					const bb = fn_e368(0x90, 8)
					const bc = ld64(ax + 0x1f8)
					st64(s5c0 + 0x18, s120)
					AccountInfo_clone(s120, bc)
					const bd = ld64(ax + 0x200)
					st64(s598, s98)
					AccountInfo_clone(s98, bd)
					const be = ld64(ax + 0x208)
					st64(s598 + 8, s2f0)
					AccountInfo_clone(s2f0, be)
					memcpy(bb, ld64(s5c0 + 0x18), 0x30)
					memcpy(bb + 0x30, ld64(s598), 0x30)
					const bf = memcpy(bb + 0x60, ld64(s598 + 8), 0x30)
					st64(s48, 3, bb, 3)
					copyr(s2f0, s368, 0x18)
					fn_60de8(s188, s48, s2f0, undef, undef, bf)
					let bm = fn_62750(s2f0, s188, ld64(ax + 0x188), ld64(s540))
					const bg = ld64(s2e0)
					const bh = ld64(s2f0 + 8)
					const bi = ld64(s2f0)
					st64(s598, bg, bh)
					if (bi != 0x8000000000000000) {
						st64(s5c0 + 0x18, bg)
						st64(s170, bi, bh, bg)
						st64(s598 + 8, ld64(ax + 0x180))
						AccountInfo_clone(s98, ld64(ax + 0x210))
						bm = fn_5bad0(s2f0, ld64(s598 + 8), s98)
						const bk = ld64(s2f0 + 8)
						const bl = ld64(s2f0)
						const bj = ld8(s2c0)
						if (bj == 2) {
							st64(s598, bk, bl)
							bu = ld64(s5c0 + 0x18)
						} else {
							B32: {
								copyr(s148, s2e0, 0x20)
								st32(s148 + 0x21, ld32(s2c0 + 1))
								st32(s148 + 0x24, ld32(s2c0 + 4))
								st8(s148 + 0x20, bj)
								st64(s158, bl, bk)
								bm = fn_5bfc8(s2f0, s158, ld64(s598 + 0x10), bm)
								const bn = ld64(s2f0)
								if (bn == 2) {
									if (ld8(s2f0 + 8) == 0) {
										bm = fn_87630(s518, 0x40)
										bs = ld64(s518 + 8)
										st64(s598 + 8, ld64(s518))
									} else {
										bm = fn_5c138(s2f0, s158, bm)
										if (ld8(s2f0) == 0) {
											st32(s120 + 3, ld32(s2f0 + 4))
											st32(s120, ld32(s2f0 + 1))
											st64(s598 + 8, ld64(s2f0 + 8))
											st64(s598, ld64(s2e0))
											memcpy(s98, s2d8, 0x38)
											st64(s120 + 0xf, ld64(s598))
											st64(s120 + 7, ld64(s598 + 8))
											memcpy(s109, s98, 0x38)
											const bo: TwoHopSwapV2Accounts = ld64(s568 + 0x20)
											st64(s598 + 8, ld64(bo + 0x188))
											AccountInfo_clone(s98, ld64(bo + 0x218))
											bm = fn_5bad0(s2f0, ld64(s598 + 8), s98)
											bs = ld64(s2f0 + 8)
											const bq = ld64(s2f0)
											const bp = ld8(s2c0)
											if (bp != 2) {
												B111: {
													copyr(sc0, s2e0, 0x20)
													st32(sc0 + 0x21, ld32(s2c0 + 1))
													st32(sc0 + 0x24, ld32(s2c0 + 4))
													st8(sc0 + 0x20, bp)
													st64(sd0, bq, bs)
													bm = fn_5bfc8(s2f0, sd0, ld64(s598 + 0x10), bm)
													const dc = ld64(s2f0)
													if (dc == 2) {
														B110: {
															if (ld8(s2f0 + 8) == 0) {
																bm = fn_87630(s508, 0x40)
																bs = ld64(s508 + 8)
																dd = ld64(s508)
															} else {
																B107: {
																	bm = fn_5c138(s2f0, sd0, bm)
																	if (ld8(s2f0) == 0) {
																		st32(s98 + 3, ld32(s2f0 + 4))
																		st32(s98, ld32(s2f0 + 1))
																		st64(s598 + 8, ld64(s2f0 + 8))
																		st64(s598, ld64(s2e0))
																		memcpy(s48, s2d8, 0x38)
																		st64(s98 + 0xf, ld64(s598))
																		st64(s98 + 7, ld64(s598 + 8))
																		memcpy(s81, s48, 0x38)
																		st64(s598, ld64(s568 + 0x20) + 0x80)
																		if (ld64(s568 + 0x18) != 0) {
																			let dr = ld64(s568 + 0x20)
																			const ds = ld64(dr + 0x180)
																			st64(sfd0, ld64(s598 + 0x10))
																			st64(sfd0 + 8, s120)
																			if (ld64(s540 + 8) == 0) {
																				dr = ld64(s598)
																			}
																			let dt = ld64(s598)
																			if (ld64(s540 + 8) == 0) {
																				dt = ld64(s568 + 0x20)
																			}
																			st64(sfe0 + 8, ld64(s540 + 8))
																			st64(s1000 + 0x18, ld64(s580 + 8))
																			st64(s1000 + 0x10, ld64(s570))
																			st64(s1000 + 8, ld64(s568 + 0x10))
																			st64(s1000, s1a0)
																			st64(sfe0, 1)
																			bm = fn_3f9a0(s2f0, ds + 8, dr, dt, s1a0, ld64(s1000 + 8), ld64(s1000 + 0x10), ld64(s1000 + 0x18), 1, ld64(sfe0 + 8), ld64(sfd0), ld64(sfd0 + 8))
																			bs = ld64(s2f0 + 8)
																			const du = ld64(s2f0)
																			st64(s598 + 8, du)
																			if (du != 2) {
																				break B111
																			}
																			const dv = bs
																			const dy = ld64(bs + (ld64(s540 + 8) != 0 ? 8 : 0))
																			const dw: TwoHopSwapV2Accounts = ld64(s568 + 0x20)
																			const dz = ld64(dw + 0x188)
																			st64(sfd0, ld64(s598 + 0x10))
																			st64(sfd0 + 8, s98)
																			let dx = dw.token_mint_output
																			let ea = ld64(s598)
																			ea = ld64(s540) != 0 ? ea : dx
																			if (ld64(s540) == 0) {
																				dx = ld64(s598)
																			}
																			st64(sfe0 + 8, ld64(s540))
																			st64(s1000 + 0x18, ld64(s568))
																			st64(s1000 + 0x10, ld64(s568 + 8))
																			st64(s1000, s170, dy)
																			st64(sfe0, 1)
																			bm = fn_3f9a0(s2f0, dz + 8, ea, dx, s170, dy, ld64(s1000 + 0x10), ld64(s1000 + 0x18), 1, ld64(sfe0 + 8), ld64(sfd0), ld64(sfd0 + 8))
																			bs = ld64(s2f0 + 8)
																			const eb = ld64(s2f0)
																			st64(s568 + 0x10, dv)
																			dl = bs
																			st64(s598 + 8, eb)
																			if (eb != 2) {
																				break B111
																			}
																		} else {
																			const dg: TwoHopSwapV2Accounts = ld64(s568 + 0x20)
																			const di = ld64(dg + 0x188)
																			st64(sfd0, ld64(s598 + 0x10))
																			st64(sfd0 + 8, s98)
																			let dh = dg.token_mint_output
																			let dj = ld64(s598)
																			dj = ld64(s540) != 0 ? dj : dh
																			if (ld64(s540) == 0) {
																				dh = ld64(s598)
																			}
																			st64(sfe0 + 8, ld64(s540))
																			st64(s1000 + 0x18, ld64(s568))
																			st64(s1000 + 0x10, ld64(s568 + 8))
																			st64(s1000 + 8, ld64(s568 + 0x10))
																			st64(s1000, s170)
																			st64(sfe0, 0)
																			bm = fn_3f9a0(s2f0, di + 8, dj, dh, s170, ld64(s1000 + 8), ld64(s1000 + 0x10), ld64(s1000 + 0x18), 0, ld64(sfe0 + 8), ld64(sfd0), ld64(sfd0 + 8))
																			bs = ld64(s2f0 + 8)
																			const dk = ld64(s2f0)
																			st64(s598 + 8, dk)
																			if (dk != 2) {
																				break B111
																			}
																			dl = bs
																			if (ld64(s540) != 0) {
																				bm = fn_82238(s2f0, ld64(s598), ld64(dl))
																				st64(s598 + 8, ld64(s2f0 + 8))
																				if (ld64(s2f0) != 0) {
																					bs = ld64(s2e0)
																					break B111
																				}
																			} else {
																				bm = fn_82238(s2f0, ld64(s598), ld64(dl + 8))
																				st64(s598 + 8, ld64(s2f0 + 8))
																				if (ld64(s2f0) != 0) {
																					bs = ld64(s2e0)
																					break B111
																				}
																			}
																			let dm = ld64(s568 + 0x20)
																			const dn = ld64(dm + 0x180)
																			st64(sfd0, ld64(s598 + 0x10))
																			st64(sfd0 + 8, s120)
																			if (ld64(s540 + 8) == 0) {
																				dm = ld64(s598)
																			}
																			let dp = ld64(s598)
																			if (ld64(s540 + 8) == 0) {
																				dp = ld64(s568 + 0x20)
																			}
																			st64(sfe0 + 8, ld64(s540 + 8))
																			st64(s1000 + 0x18, ld64(s580 + 8))
																			st64(s1000 + 0x10, ld64(s570))
																			st64(s1000 + 8, ld64(s598 + 8))
																			st64(s1000, s1a0)
																			st64(sfe0, 0)
																			bm = fn_3f9a0(s2f0, dn + 8, dm, dp, s1a0, ld64(s1000 + 8), ld64(s1000 + 0x10), ld64(s1000 + 0x18), 0, ld64(sfe0 + 8), ld64(sfd0), ld64(sfd0 + 8))
																			bs = ld64(s2f0 + 8)
																			const dq = ld64(s2f0)
																			st64(s568 + 0x10, bs)
																			st64(s598 + 8, dq)
																			if (dq != 2) {
																				break B111
																			}
																		}
																		const ec = ld64(s568 + 0x10)
																		st64(s568, ec + 8, ec + 8)
																		if (ld64(s540 + 8) == 0) {
																			st64(s568 + 8, ld64(s568 + 0x10))
																		}
																		B153: {
																			B149: {
																				const ed = ld64(ld64(s568 + 8))
																				if (ld64(s540) != 0) {
																					if (ed == ld64(dl)) {
																						if (ld64(s568 + 0x18) == 0) {
																							break B149
																						}
																						bm = fn_82238(s2f0, ld64(s568 + 0x20) + 0x100, ld64(dl + 8))
																						bs = undef
																						st64(s598 + 8, ld64(s2f0 + 8))
																						if (ld64(s2f0) == 0) {
																							if (ld64(s580) > ld64(s598 + 8)) {
																								bm = fn_87630(s4f8, 0x24)
																								bs = ld64(s4f8 + 8)
																								dd = ld64(s4f8)
																								break B110
																							}
																							break B153
																						}
																						bs = ld64(s2e0)
																						break B111
																					}
																				} else if (ed == ld64(dl + 8)) {
																					if (ld64(s568 + 0x18) != 0) {
																						bm = fn_82238(s2f0, ld64(s568 + 0x20) + 0x100, ld64(dl))
																						bs = undef
																						st64(s598 + 8, ld64(s2f0 + 8))
																						if (ld64(s2f0) != 0) {
																							bs = ld64(s2e0)
																							break B111
																						}
																						if (ld64(s580) > ld64(s598 + 8)) {
																							bm = fn_87630(s4f8, 0x24)
																							bs = ld64(s4f8 + 8)
																							dd = ld64(s4f8)
																							break B110
																						}
																						break B153
																					}
																					break B149
																				}
																				bm = fn_87630(s4a8, 0x33)
																				bs = ld64(s4a8 + 8)
																				dd = ld64(s4a8)
																				break B110
																			}
																			let ee = ld64(s568 + 0x10)
																			if (ld64(s540 + 8) == 0) {
																				ee = ld64(s568)
																			}
																			if (ld64(ee) > ld64(s580)) {
																				bm = fn_87630(s4b8, 0x25)
																				bs = ld64(s4b8 + 8)
																				dd = ld64(s4b8)
																				break B110
																			}
																		}
																		bm = fn_5c328(s4c8, s158, ld64(s568 + 0x10) + 0x1d4, bs, ef, bm)
																		const eg = ld64(s4c8)
																		st64(s598 + 8, eg)
																		if (eg == 2) {
																			bm = fn_5c328(s4d8, sd0, dl + 0x1d4, undef, undef, bm)
																			const eh = ld64(s4d8)
																			st64(s598 + 8, eh)
																			if (eh == 2) {
																				let ei = ld64(s568 + 0x10)
																				if (ld64(s540 + 8) == 0) {
																					ei = ld64(s568)
																				}
																				const el = ld64(ei)
																				st64(s568 + 0x18, ld64(ld64(s568 + 8)))
																				const ej: TwoHopSwapV2Accounts = ld64(s568 + 0x20)
																				const ek = ld64(ej + 0x180)
																				copyr(s570, ek + 0x238, 0x10)
																				st64(s568 + 8, el)
																				bm = fn_82238(s2f0, ej, el)
																				if (ld64(s2f0) == 0) {
																					st64(s580 + 8, ld64(s2e0))
																					bm = fn_82238(s2f0, ld64(s598), ld64(s568 + 0x18))
																					if (ld64(s2f0) == 0) {
																						let en = dl + 8
																						const em = ld64(s540) != 0 ? dl : en
																						en = ld64(s540) != 0 ? en : dl
																						st64(s5d0 + 8, ld64(s2e0))
																						st64(s580, ld64(en))
																						const eq = ld64(em)
																						const eo = ld64(s568 + 0x10)
																						st64(s608 + 0x30, ld64(eo + 0x1c8))
																						st64(s5d0, ld64(eo + 0x10))
																						const ep = ld64(ld64(s568 + 0x20) + 0x188)
																						copyr(s5c0, ep + 0x238, 0x10)
																						const er = ld64(s598)
																						st64(s5c0 + 0x10, eq)
																						bm = fn_82238(s2f0, er, eq)
																						if (ld64(s2f0) == 0) {
																							st64(s608 + 0x28, ld64(s2e0))
																							const es: TwoHopSwapV2Accounts = ld64(s568 + 0x20)
																							st64(s598 + 8, es.token_mint_output)
																							bm = fn_82238(s2f0, es.token_mint_output, ld64(s580))
																							if (ld64(s2f0) == 0) {
																								st64(s610, ld64(s2e0))
																								st64(s620, ld64(dl + 0x1c8))
																								st64(s618, ld64(dl + 0x10))
																								const et: TwoHopSwapV2Accounts = ld64(s568 + 0x20)
																								st64(s608 + 0x20, ld64(et + 0x180))
																								st64(s608 + 0x18, ld64(et + 0x188))
																								st64(s608 + 0x10, et.token_owner_account_input)
																								st64(s608 + 8, et.token_vault_one_input)
																								const token_vault_one_intermediate: TokenAccount_2 = et.token_vault_one_intermediate
																								const token_vault_two_intermediate: TokenAccount_2 = et.token_vault_two_intermediate
																								const token_vault_two_output: TokenAccount_2 = et.token_vault_two_output
																								const token_owner_account_output: TokenAccount_2 = et.token_owner_account_output
																								st64(sf70 + 0x18, 0x100153285)
																								st64(sf70 + 0x10, ld64(s598 + 0x10))
																								st64(sf70, et + 0x1d8, et + 0x220)
																								st64(sfa8, token_vault_one_intermediate, token_vault_two_intermediate, token_vault_two_output, token_owner_account_output)
																								st64(sfd0 + 0x20, ld64(s608 + 8))
																								st64(sfd0 + 0x18, ld64(s608 + 0x10))
																								st64(sfd0, et + 0x190, et + 0x198, et + 0x1a0)
																								copyr(sfe0, s598, 0x10)
																								st64(s598 + 0x10, s3b0)
																								st64(sfa8 + 0x30, s3b0)
																								st64(s598, s3c8)
																								st64(sfa8 + 0x28, s3c8)
																								st64(s608 + 0x10, s3e0)
																								st64(sfa8 + 0x20, s3e0)
																								st64(sf70 + 0x20, 0xa)
																								st64(s1000 + 0x10, ld64(s540))
																								st64(s1000 + 0x18, et)
																								st64(s1000 + 8, ld64(s540 + 8))
																								st64(s1000, ld64(s608 + 0x18))
																								bm = fn_7c768(s4e8, ld64(s568 + 0x10), dl, ld64(s608 + 0x20), ld64(s1000), ld64(s1000 + 8), ld64(s1000 + 0x10), et, ld64(sfe0), ld64(sfe0 + 8), et + 0x190, et + 0x198, et + 0x1a0, ld64(sfd0 + 0x18), ld64(sfd0 + 0x20), token_vault_one_intermediate, token_vault_two_intermediate, token_vault_two_output, token_owner_account_output, s3e0, s3c8, s3b0, et + 0x1d8, et + 0x220, ld64(sf70 + 0x10), "Orca Trade", 0xa)
																								const ey = ld64(s4e8)
																								st64(s598 + 8, ey)
																								if (ey == 2) {
																									f = ld64(s568 + 0x20)
																									const ez = ld64(f + 0x180)
																									const fa = ld64(ld64(ez))
																									copyr(s2f0, fa, 0x20)
																									const fc = ld64(ez + 0x240)
																									const fb = ld64(ez + 0x238)
																									st64(s2c0 + 0x38, ld64(s608 + 0x30))
																									st64(s2c0 + 0x30, ld64(s5d0))
																									st64(s2c0 + 0x28, ld64(s5d0 + 8))
																									st64(s2c0 + 0x20, ld64(s580 + 8))
																									st64(s2c0 + 0x18, ld64(s568 + 0x18))
																									st64(s2c0 + 0x10, ld64(s568 + 8))
																									copy(s2d0, s570, 0x10)
																									st64(s2c0, fb, fc)
																									st8(s2c0 + 0x40, ld64(s540 + 8))
																									fn_89078(s48, s2f0)
																									copyr(s10, s40, 0x10)
																									log_data(s10, 1)
																									const fd = ld64(f + 0x188)
																									const fe = ld64(ld64(fd))
																									copyr(s2f0, fe, 0x20)
																									const fg = ld64(fd + 0x240)
																									const ff = ld64(fd + 0x238)
																									st64(s2c0 + 0x38, ld64(s620))
																									st64(s2c0 + 0x30, ld64(s618))
																									st64(s2c0 + 0x28, ld64(s610))
																									st64(s2c0 + 0x20, ld64(s608 + 0x28))
																									st64(s2c0 + 0x18, ld64(s580))
																									st64(s2c0 + 0x10, ld64(s5c0 + 0x10))
																									copy(s2d0, s5c0, 0x10)
																									st64(s2c0, ff, fg)
																									st8(s2c0 + 0x40, ld64(s540))
																									fn_89078(s48, s2f0)
																									copyr(s10, s40, 0x10)
																									const fn = log_data(s10, 1)
																									const fi = ld64(sc0)
																									const fh = ld64(sd0 + 8)
																									rc_dec(fh)
																									rc_dec(fi)
																									const fk = ld64(s148)
																									const fj = ld64(s158 + 8)
																									rc_dec(fj)
																									rc_dec(fk)
																									if (ld64(s5c0 + 0x18) != 0) {
																										let fl = bh + 0x18
																										do {
																											if (ld8(fl - 0x14) == 2) {
																												const fo = ld64(fl)
																												st64(fo, ld64(fo) + 1)
																											}
																											fl = fl + 0x78
																											fm = ld64(s5c0 + 0x18)
																											st64(s5c0 + 0x18, fm - 1)
																										} while (fm != 1)
																									}
																									const fr = fn_c710(ld64(s188 + 8), ld64(s188 + 0x10), fn)
																									if (ay != 0) {
																										let fq = az + 0x18
																										do {
																											if (ld8(fq - 0x14) == 2) {
																												const fw = ld64(fq)
																												st64(fw, ld64(fw) + 1)
																											}
																											fq = fq + 0x78
																											ay = ay - 1
																										} while (ay != 0)
																									}
																									const fs = fn_bb88(s428, fn_c710(ld64(s1b8 + 8), ld64(s1b8 + 0x10), fr))
																									const ft = fn_bb88(s3f8, fn_bb88(ld64(s608), fs))
																									const fu = fn_bb88(ld64(s608 + 0x10), ft)
																									const fv = fn_bb88(ld64(s598), fu)
																									r = fn_bb88(s308, fn_bb88(s320, fn_bb88(s338, fn_bb88(s350, fn_bb88(s398, fn_bb88(ld64(s598 + 0x10), fv))))))
																									q = ld64(s540 + 0x10)
																									st64(q + 8, f)
																									st64(q, 2)
																									return r
																								}
																								bs = ld64(s4e8 + 8)
																								break B111
																							}
																							break B107
																						}
																						break B107
																					}
																					break B107
																				}
																				break B107
																			}
																			bs = ld64(s4d8 + 8)
																			break B111
																		}
																		bs = ld64(s4c8 + 8)
																		break B111
																	}
																}
																bs = ld64(s2e0)
																dd = ld64(s2f0 + 8)
															}
														}
														st64(s598 + 8, dd)
													} else {
														st64(s598 + 8, dc)
														bs = ld64(s2f0 + 8)
													}
												}
												const df = ld64(sc0)
												const de = ld64(sd0 + 8)
												bu = ld64(s5c0 + 0x18)
												rc_dec(de)
												if (!rc_release(df)) {
													break B32
												}
												st64(df + 8, ld64(df + 8) - 1)
												break B32
											}
											st64(s598 + 8, bq)
										} else {
											bs = ld64(s2e0)
											st64(s598 + 8, ld64(s2f0 + 8))
										}
									}
								} else {
									st64(s598 + 8, bn)
									bs = ld64(s2f0 + 8)
								}
								bu = ld64(s5c0 + 0x18)
							}
							const bt = ld64(s148)
							const br = ld64(s158 + 8)
							rc_dec(br)
							st64(s598, bs)
							rc_dec(bt)
						}
						if (bu != 0) {
							let bv = bh + 0x18
							do {
								if (ld8(bv - 0x14) == 2) {
									const bw = ld64(bv)
									st64(bw, ld64(bw) + 1)
								}
								bv = bv + 0x78
								bu = bu - 1
							} while (bu != 0)
						}
					}
					r = fn_c710(ld64(s188 + 8), ld64(s188 + 0x10), bm)
					ba = ld64(s5c0 + 0x20)
					if (ay != 0) {
						let bx = az + 0x18
						do {
							if (ld8(bx - 0x14) == 2) {
								const bz = ld64(bx)
								st64(bz, ld64(bz) + 1)
							}
							bx = bx + 0x78
							ay = ay - 1
						} while (ay != 0)
					}
				}
				let by = ld64(s1b8 + 0x10)
				q = ld64(s540 + 0x10)
				f = ld64(s598)
				if (by != 0) {
					let ca = ld64(s1b8 + 8) + 0x10
					do {
						const cd = ld64(ca)
						const cc = ld64(ca - 8)
						rc_dec(cc)
						rc_dec(cd)
						ca = ca + 0x30
						by = by - 1
					} while (by != 0)
				}
				if (ld64(s428) != 0x8000000000000000) {
					let cb = ld64(s428 + 0x10)
					if (cb != 0) {
						let ce = ld64(s428 + 8) + 0x10
						do {
							const ch = ld64(ce)
							const cg = ld64(ce - 8)
							r = ld64(cg) - 1
							st64(cg, r)
							if (r == 0) {
								r = ld64(cg + 8) - 1
								st64(cg + 8, r)
							}
							rc_dec(ch)
							ce = ce + 0x30
							cb = cb - 1
						} while (cb != 0)
					}
				}
				if (ld64(s410) != 0x8000000000000000) {
					let cf = ld64(s410 + 0x10)
					if (cf != 0) {
						let ci = ld64(s410 + 8) + 0x10
						do {
							const cl = ld64(ci)
							const ck = ld64(ci - 8)
							rc_dec(ck)
							rc_dec(cl)
							ci = ci + 0x30
							cf = cf - 1
						} while (cf != 0)
					}
				}
				if (ld64(s3f8) != 0x8000000000000000) {
					let cj = ld64(s3f8 + 0x10)
					if (cj != 0) {
						let cm = ld64(s3f8 + 8) + 0x10
						do {
							const cp = ld64(cm)
							const co = ld64(cm - 8)
							r = ld64(co) - 1
							st64(co, r)
							if (r == 0) {
								r = ld64(co + 8) - 1
								st64(co + 8, r)
							}
							rc_dec(cp)
							cm = cm + 0x30
							cj = cj - 1
						} while (cj != 0)
					}
				}
				if (ld64(s3e0) != 0x8000000000000000) {
					let cn = ld64(s3e0 + 0x10)
					if (cn != 0) {
						let cq = ld64(s3e0 + 8) + 0x10
						do {
							const ct = ld64(cq)
							const cs = ld64(cq - 8)
							rc_dec(cs)
							rc_dec(ct)
							cq = cq + 0x30
							cn = cn - 1
						} while (cn != 0)
					}
				}
				if (ld64(s3c8) != 0x8000000000000000) {
					let cr = ld64(s3c8 + 0x10)
					if (cr != 0) {
						let cu = ld64(s3c8 + 8) + 0x10
						do {
							const cx = ld64(cu)
							const cw = ld64(cu - 8)
							r = ld64(cw) - 1
							st64(cw, r)
							if (r == 0) {
								r = ld64(cw + 8) - 1
								st64(cw + 8, r)
							}
							rc_dec(cx)
							cu = cu + 0x30
							cr = cr - 1
						} while (cr != 0)
					}
				}
				if (ld64(s3b0) != 0x8000000000000000) {
					let cv = ld64(s3b0 + 0x10)
					if (cv != 0) {
						let cy = ld64(s3b0 + 8) + 0x10
						do {
							const db = ld64(cy)
							const da = ld64(cy - 8)
							rc_dec(da)
							rc_dec(db)
							cy = cy + 0x30
							cv = cv - 1
						} while (cv != 0)
					}
				}
				if (ld64(s398) != 0x8000000000000000) {
					let cz = ld64(s398 + 0x10)
					if (cz != 0) {
						let fx = ld64(s398 + 8) + 0x10
						do {
							const ga = ld64(fx)
							const fz = ld64(fx - 8)
							r = ld64(fz) - 1
							st64(fz, r)
							if (r == 0) {
								r = ld64(fz + 8) - 1
								st64(fz + 8, r)
							}
							rc_dec(ga)
							fx = fx + 0x30
							cz = cz - 1
						} while (cz != 0)
					}
				}
				if (ba == 0x8000000000000000) {
					r = fn_bb88(s368, r)
				}
				if (ld64(s350) != 0x8000000000000000) {
					let fy = ld64(s350 + 0x10)
					if (fy != 0) {
						let gb = ld64(s350 + 8) + 0x10
						do {
							const ge = ld64(gb)
							const gd = ld64(gb - 8)
							r = ld64(gd) - 1
							st64(gd, r)
							if (r == 0) {
								r = ld64(gd + 8) - 1
								st64(gd + 8, r)
							}
							rc_dec(ge)
							gb = gb + 0x30
							fy = fy - 1
						} while (fy != 0)
					}
				}
				if (ld64(s338) != 0x8000000000000000) {
					let gc = ld64(s338 + 0x10)
					if (gc != 0) {
						let gf = ld64(s338 + 8) + 0x10
						do {
							const gi = ld64(gf)
							const gh = ld64(gf - 8)
							rc_dec(gh)
							rc_dec(gi)
							gf = gf + 0x30
							gc = gc - 1
						} while (gc != 0)
					}
				}
				if (ld64(s320) != 0x8000000000000000) {
					let gg = ld64(s320 + 0x10)
					if (gg != 0) {
						let gj = ld64(s320 + 8) + 0x10
						do {
							const gm = ld64(gj)
							const gl = ld64(gj - 8)
							r = ld64(gl) - 1
							st64(gl, r)
							if (r == 0) {
								r = ld64(gl + 8) - 1
								st64(gl + 8, r)
							}
							rc_dec(gm)
							gj = gj + 0x30
							gg = gg - 1
						} while (gg != 0)
					}
				}
				if (ld64(s308) == 0x8000000000000000) {
					g = ld64(s598 + 8)
					st64(q + 8, f)
					st64(q, g)
					return r
				}
				let gk = ld64(s308 + 0x10)
				if (gk == 0) {
					g = ld64(s598 + 8)
					st64(q + 8, f)
					st64(q, g)
					return r
				}
				let gn = ld64(s308 + 8) + 0x10
				while (true) {
					const gp = ld64(gn)
					const go = ld64(gn - 8)
					rc_dec(go)
					rc_dec(gp)
					gn = gn + 0x30
					gk = gk - 1
					if (gk == 0) {
						g = ld64(s598 + 8)
						st64(q + 8, f)
						st64(q, g)
						return r
					}
				}
			}
			abort()
		}
		alloc_handle_alloc_error(8, 0x90)
	}
	r = fn_87630(s498, 0x29)
	g = ld64(s498)
	q = ld64(s540 + 0x10)
	st64(q + 8, ld64(s498 + 8))
	st64(q, g)
	return r
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value), p6 (value), p7 (value), p9 (value), p10 (value), p25 (value)
// types [heur]: p8: TwoHopSwapV2Accounts (every call passes one: fn_40458); p16: TokenAccount_2 (every call passes one: fn_40458); p17: TokenAccount_2 (every call passes one: fn_40458); p18: TokenAccount_2 (every call passes one: fn_40458); p19: TokenAccount_2 (every call passes one: fn_40458)
export function fn_7c768(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: TwoHopSwapV2Accounts, p9: u64, p10: u64, p11: u64, p12: u64, p13: u64, p14: u64, p15: u64, p16: TokenAccount_2, p17: TokenAccount_2, p18: TokenAccount_2, p19: TokenAccount_2, p20: u64, p21: u64, p22: u64, p23: u64, p24: u64, p25: u64, p26: u64, p27: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30
	let k, l, u, v, ac, ad, ae, ah, ai, ak, am, an, at, av, aw, ax, ay, az: u64
	let af: TokenAccount_2
	let ag: TokenAccount_2
	let aj: TokenAccount_2
	let al: TokenAccount_2
	let au: TwoHopSwapV2Accounts
	B6: {
		k = c
		let ar = ld64(b + 0x1c8)
		let ap = ld64(b + 0x40)
		let ao = ld64(b + 0x38)
		const i = ld64(b + 0x20)
		const h = ld64(b + 0x18)
		const g = ld32(b + 0x1d0)
		const f = ld64(b + 0x30)
		st64(d + 0x238, ld64(b + 0x28))
		st64(d + 0x240, f)
		st32(d + 0x280, g)
		st64(d + 0x228, h, i)
		memcpy(d + 8, b + 0x48, 0x180)
		const j = p25
		st64(d + 0x278, j)
		an = p27
		am = p26
		az = p24
		ay = p23
		ae = p22
		ak = p21
		aw = p20
		af = p19
		ag = p18
		aj = p17
		al = p16
		av = p15
		ax = p14
		ac = p13
		ah = p12
		at = p11
		ad = p10
		ai = p9
		au = p8
		const aq = p7
		l = p5
		if (p6 != 0) {
			st64(d + 0x248, ao, ap)
			st64(d + 0x268, ld64(d + 0x268) + ar)
			ar = ld64(k + 0x1c8)
			ap = ld64(k + 0x40)
			ao = ld64(k + 0x38)
			const t = ld64(k + 0x18)
			const s = ld64(k + 0x20)
			const r = ld32(k + 0x1d0)
			const q = ld64(k + 0x28)
			st64(l + 0x240, ld64(k + 0x30))
			st64(l + 0x238, q)
			st32(l + 0x280, r)
			st64(l + 0x230, s)
			st64(l + 0x228, t)
			memcpy(l + 8, c + 0x48, 0x180)
			st64(l + 0x278, j)
			u = b + 8
			v = b
			if (aq == 0) {
				st64(l + 0x258, ao, ap)
				st64(l + 0x270, ld64(l + 0x270) + ar)
				u = b + 8
				v = b
				break B6
			}
		} else {
			st64(d + 0x258, ao, ap)
			st64(d + 0x270, ld64(d + 0x270) + ar)
			ar = ld64(k + 0x1c8)
			ap = ld64(k + 0x40)
			ao = ld64(k + 0x38)
			const p = ld64(k + 0x18)
			const o = ld64(k + 0x20)
			const n = ld32(k + 0x1d0)
			const m = ld64(k + 0x28)
			st64(l + 0x240, ld64(k + 0x30))
			st64(l + 0x238, m)
			st32(l + 0x280, n)
			st64(l + 0x230, o)
			st64(l + 0x228, p)
			memcpy(l + 8, c + 0x48, 0x180)
			st64(l + 0x278, j)
			u = b
			v = b + 8
			if (aq == 0) {
				st64(l + 0x258, ao, ap)
				st64(l + 0x270, ld64(l + 0x270) + ar)
				u = b
				v = b + 8
				break B6
			}
		}
		st64(l + 0x248, ao, ap)
		st64(l + 0x268, ld64(l + 0x268) + ar)
		k = k + 8
	}
	const z = ld64(k)
	const y = ld64(u)
	const w = ld64(v)
	let ab = fn_7cf50(s10, ay, au, ax, av, at, az, aw, w)
	let aa = ld64(s10 + 8)
	let x = ld64(s10)
	if (x != 2) {
		st64(a + 8, aa)
		st64(a, x)
		return ab
	}
	ab = fn_7e5e0(s20, d, ai, al, aj, ah, az, ak, y, am, an)
	aa = ld64(s20 + 8)
	x = ld64(s20)
	if (x != 2) {
		st64(a + 8, aa)
		st64(a, x)
		return ab
	}
	ab = fn_7e5e0(s30, l, ad, ag, af, ac, az, ae, z, am, an)
	aa = ld64(s30 + 8)
	x = ld64(s30)
	if (x != 2) {
		st64(a + 8, aa)
		st64(a, x)
		return ab
	}
	st64(a + 8, aa)
	st64(a, 2)
	return ab
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool_one, token_owner_account_input, token_vault_one_input, token_vault_one_intermediate, token_vault_two_intermediate, token_owner_account_output, token_vault_two_output, whirlpool_two
export function fn_e8e38(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118
	let v, w: u64
	fn_6aa0(s28, ld64(b + 0x180), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const f = ld64(s28)
	if (f != 2) {
		w = Error_with_account_name(s38, f, ld64(s28 + 8), "whirlpool_one", 0xd)
		v = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, v)
		return w
	}
	fn_6aa0(s48, ld64(b + 0x188), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const g = ld64(s48)
	if (g == 2) {
		const h = ld64(b + 0x1a8)
		const i = ld64(h + 0x20)
		if ((memcmp(h, c, 0x20) as u32) == 0) {
			const j = common_is_closed(i)
			if (j == 0) {
				fn_143448(s18, i, j)
				const l = ld64(s18 + 0x10)
				const k = ld64(s18)
				if (k != 0x800000000000001a /* Ok */) {
					const m = ld64(s18 + 8)
					st64(s18, k, m, l)
					fn_13b430(s68, s18)
					const n = ld64(s68)
					if (n != 2) {
						w = Error_with_account_name(s78, n, ld64(s68 + 8), "token_owner_account_input", 0x19)
						v = ld64(s78)
						st64(a + 8, ld64(s78 + 8))
						st64(a, v)
						return w
					}
				} else {
					st64(l, ld64(l) + 1)
				}
			}
		}
		const o = ld64(b + 0x1b0)
		const x = ld64(o + 0x20)
		if ((memcmp(o, c, 0x20) as u32) == 0) {
			const y = common_is_closed(x)
			if (y == 0) {
				fn_143448(s18, x, y)
				const aa = ld64(s18 + 0x10)
				const z = ld64(s18)
				if (z != 0x800000000000001a /* Ok */) {
					const aj = ld64(s18 + 8)
					st64(s18, z, aj, aa)
					fn_13b430(s88, s18)
					const ak = ld64(s88)
					if (ak != 2) {
						w = Error_with_account_name(s98, ak, ld64(s88 + 8), "token_vault_one_input", 0x15)
						v = ld64(s98)
						st64(a + 8, ld64(s98 + 8))
						st64(a, v)
						return w
					}
				} else {
					st64(aa, ld64(aa) + 1)
				}
			}
		}
		const p = ld64(b + 0x1b8)
		const ab = ld64(p + 0x20)
		if ((memcmp(p, c, 0x20) as u32) == 0) {
			const ac = common_is_closed(ab)
			if (ac == 0) {
				fn_143448(s18, ab, ac)
				const ae = ld64(s18 + 0x10)
				const ad = ld64(s18)
				if (ad != 0x800000000000001a /* Ok */) {
					const al = ld64(s18 + 8)
					st64(s18, ad, al, ae)
					fn_13b430(sa8, s18)
					const am = ld64(sa8)
					if (am != 2) {
						w = Error_with_account_name(sb8, am, ld64(sa8 + 8), "token_vault_one_intermediate", 0x1c)
						v = ld64(sb8)
						st64(a + 8, ld64(sb8 + 8))
						st64(a, v)
						return w
					}
				} else {
					st64(ae, ld64(ae) + 1)
				}
			}
		}
		const q = ld64(b + 0x1c0)
		const af = ld64(q + 0x20)
		if ((memcmp(q, c, 0x20) as u32) == 0) {
			const ag = common_is_closed(af)
			if (ag == 0) {
				fn_143448(s18, af, ag)
				const ai = ld64(s18 + 0x10)
				const ah = ld64(s18)
				if (ah != 0x800000000000001a /* Ok */) {
					const an = ld64(s18 + 8)
					st64(s18, ah, an, ai)
					fn_13b430(sc8, s18)
					const ao = ld64(sc8)
					if (ao != 2) {
						w = Error_with_account_name(sd8, ao, ld64(sc8 + 8), "token_vault_two_intermediate", 0x1c)
						v = ld64(sd8)
						st64(a + 8, ld64(sd8 + 8))
						st64(a, v)
						return w
					}
				} else {
					st64(ai, ld64(ai) + 1)
				}
			}
		}
		const r = ld64(b + 0x1c8)
		fn_6960(se8, ld64(r + 0x20), r, c)
		const s = ld64(se8)
		if (s == 2) {
			const t = ld64(b + 0x1d0)
			w = fn_6960(s108, ld64(t + 0x20), t, c)
			const u = ld64(s108)
			if (u == 2) {
				st64(a + 8, undef)
				st64(a, 2)
				return w
			}
			w = Error_with_account_name(s118, u, ld64(s108 + 8), "token_owner_account_output", 0x1a)
			v = ld64(s118)
			st64(a + 8, ld64(s118 + 8))
			st64(a, v)
			return w
		}
		w = Error_with_account_name(sf8, s, ld64(se8 + 8), "token_vault_two_output", 0x16)
		v = ld64(sf8)
		st64(a + 8, ld64(sf8 + 8))
		st64(a, v)
		return w
	}
	w = Error_with_account_name(s58, g, ld64(s48 + 8), "whirlpool_two", 0xd)
	v = ld64(s58)
	st64(a + 8, ld64(s58 + 8))
	st64(a, v)
	return w
}
