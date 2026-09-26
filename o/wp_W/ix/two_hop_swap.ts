/// <reference path="../lib.d.ts" />
// instruction two_hop_swap
import { fn_147e78, fn_20f8, fn_49708, fn_5bad0, fn_5bfc8, fn_5c138, fn_5c328, fn_60de8, fn_62750, fn_64930, fn_6960, fn_6aa0, fn_89078, log_data, memcpy } from '../shared.ts'

// instruction handler: two_hop_swap (discriminator sha256("global:two_hop_swap")[..8] = 0xe6dba2446ced60c3)
// accounts [str: the program's account-error strings, in order of first use]: token_program, whirlpool_one, whirlpool_two, token_owner_account_one_a, token_vault_one_a, tick_array_one_0, tick_array_one_1, tick_array_one_2, tick_array_two_0, tick_array_two_1, tick_array_two_2, oracle_one, oracle_two, token_owner_account_one_b, token_vault_one_b, token_owner_account_two_a, token_vault_two_a, token_owner_account_two_b, token_vault_two_b, token_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
export function ix_two_hop_swap(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s10 = fp - 0x10, s98 = fp - 0x98, sa0 = fp - 0xa0, sb0 = fp - 0xb0, s138 = fp - 0x138, s150 = fp - 0x150, s152 = fp - 0x152, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s1000 = fp - 0x1000
	let o, p, s, t, u, v: u64
	B15: {
		B14: {
			sol_log("Instruction: TwoHopSwap", 0x17)
			let i = undef
			const f = ix_args_len
			if (f >= 8 && ((f & -8) != 8 && f != 0x10)) {
				const g = ix_args
				const j = ld64(g)
				const k = ld64(g + 8)
				const h = ld8(g + 0x10)
				st8(s152, h)
				if (2 > h) {
					if (f == 0x11) {
						break B14
					}
					const l = ld8(g + 0x11)
					st8(s152, l)
					if (2 > l) {
						if (f == 0x12) {
							break B14
						}
						let ab = f - 0x12
						const ac = ld8(g + 0x12)
						st8(s152, ac)
						i = ac
						if (2 > ac) {
							if (0x11 > ab) {
								break B14
							}
							if (0x10 > f - 0x23) {
								break B14
							}
							ab = j
							const z = ld64(g + 0x2b)
							const x = ld64(g + 0x23)
							const aa = ld64(g + 0x13)
							const y = ld64(g + 0x1b)
							st16(s152, 0xffff)
							st64(s10, accounts, accounts_len)
							st64(s1000 + 8, s152)
							v = accounts_two_hop_swap(sb0, program_id, s10, j, fp)
							const m = ld64(sb0)
							if (m == 0) {
								o = ld64(sb0 + 8)
								st64(a + 8, ld64(sa0))
								st64(a, o)
								return v
							}
							const w = ld64(sb0 + 8)
							const n = ld64(sa0)
							memcpy(s138, s98, 0x88)
							st64(s150, m, w, n)
							st8(s98 + 9, ld8(s152 + 1))
							st8(s98 + 8, ld8(s152))
							copyr(sa0, s10, 0x10)
							st64(sb0, program_id, s150)
							st64(s1000, h != 0, l != 0, ac != 0, aa, y, x, z)
							v = fn_386c8(s168, sb0, ab, k, h != 0, l != 0, ac != 0, aa, y, x, z)
							o = ld64(s168)
							if (o == 2) {
								v = fn_d12a0(s178, s150, program_id)
								o = ld64(s178)
								st64(a + 8, ld64(s178 + 8))
								st64(a, o)
								return v
							}
							st64(a + 8, ld64(s168 + 8))
							st64(a, o)
							return v
						}
					}
				}
				st64(sb0, 0x100159620)
				st64(sa0, s10)
				st64(s10, s152, fn_14ef78)
				st64(s98 + 8, 0)
				st64(sb0 + 8, 1)
				st64(s98, 1)
				// fmt "Invalid bool representation: {}" {} = *s152 [fn_14ef78]
				fn_147e78(s150, sb0, i, j, k)
				p = fn_b580(s150)
				break B15
			}
		}
		p = fn_1459d0(0x100159468)
	}
	const q = p
	if (2 > (p & 3) - 2) {
		v = anchor_error_from(s188, 0x66 /* anchor::InstructionDidNotDeserialize */, s, t, u)
		o = ld64(s188)
		st64(a + 8, ld64(s188 + 8))
		st64(a, o)
		return v
	}
	if ((q & 3) == 0) {
		v = anchor_error_from(s188, 0x66 /* anchor::InstructionDidNotDeserialize */, s, t, u)
		o = ld64(s188)
		st64(a + 8, ld64(s188 + 8))
		st64(a, o)
		return v
	}
	const r = ld64(ld64(p + 7))
	callx(r, ld64(p - 1), r)
	v = anchor_error_from(s188, 0x66 /* anchor::InstructionDidNotDeserialize */)
	o = ld64(s188)
	st64(a + 8, ld64(s188 + 8))
	st64(a, o)
	return v
}

// Anchor Accounts::try_accounts of instruction two_hop_swap (called by ix_two_hop_swap; name [str]: from the handler's "Instruction: …" log; was fn_ce490)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_program (ConstraintAddress), whirlpool_one (ConstraintMut), whirlpool_two (ConstraintMut), token_owner_account_one_a (ConstraintMut, ConstraintRaw), token_vault_one_a (ConstraintMut, ConstraintAddress), tick_array_one_0 (AccountNotEnoughKeys, ConstraintMut), tick_array_one_1 (ConstraintMut), tick_array_one_2 (ConstraintMut), tick_array_two_0 (ConstraintMut), tick_array_two_1 (ConstraintMut), tick_array_two_2 (ConstraintMut), oracle_one (ConstraintSeeds), oracle_two (ConstraintSeeds), token_owner_account_one_b (ConstraintMut, ConstraintRaw), token_vault_one_b (ConstraintMut, ConstraintAddress), token_owner_account_two_a (ConstraintMut, ConstraintRaw), token_vault_two_a (ConstraintMut, ConstraintAddress), token_owner_account_two_b (ConstraintMut, ConstraintRaw), token_vault_two_b (ConstraintMut, ConstraintAddress), token_authority
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: token_owner_account_one_a_box, token_vault_one_a_box, token_owner_account_one_b_box, token_vault_one_b_box, token_owner_account_two_a_box, token_vault_two_a_box, token_owner_account_two_b_box, token_vault_two_b_box, token_program, whirlpool_one, token_vault_one_a, token_vault_one_b, token_vault_two_a, token_vault_two_b
export function accounts_two_hop_swap(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s270 = fp - 0x270, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2d0 = fp - 0x2d0, s2f0 = fp - 0x2f0, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s510 = fp - 0x510, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s560 = fp - 0x560, s570 = fp - 0x570, s580 = fp - 0x580, s590 = fp - 0x590, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s700 = fp - 0x700, s710 = fp - 0x710, s720 = fp - 0x720, s730 = fp - 0x730, s740 = fp - 0x740, s750 = fp - 0x750, s760 = fp - 0x760, s770 = fp - 0x770, s780 = fp - 0x780, s790 = fp - 0x790, s7a0 = fp - 0x7a0, s7b0 = fp - 0x7b0, s7c0 = fp - 0x7c0, s7d0 = fp - 0x7d0, s7e0 = fp - 0x7e0, s7f0 = fp - 0x7f0, s800 = fp - 0x800, s810 = fp - 0x810, s820 = fp - 0x820, s830 = fp - 0x830, s840 = fp - 0x840, s850 = fp - 0x850, s860 = fp - 0x860, s870 = fp - 0x870, s880 = fp - 0x880, s890 = fp - 0x890, s8a0 = fp - 0x8a0, s8a8 = fp - 0x8a8, s8b0 = fp - 0x8b0, s8b8 = fp - 0x8b8, s8c0 = fp - 0x8c0, s8c8 = fp - 0x8c8, s8d0 = fp - 0x8d0, s8d8 = fp - 0x8d8, s8e0 = fp - 0x8e0, s8e8 = fp - 0x8e8, s8f0 = fp - 0x8f0, s8f8 = fp - 0x8f8, s900 = fp - 0x900, s908 = fp - 0x908, s910 = fp - 0x910, s918 = fp - 0x918, s920 = fp - 0x920, s928 = fp - 0x928, s930 = fp - 0x930, s938 = fp - 0x938, s940 = fp - 0x940
	let ae, af, ah, ai, aj, al, an, ap: u64
	st64(s8a8, b)
	fn_129a0(s290, c, c, d, e)
	const token_program: AccountInfo = ld64(s290 + 8)
	const f = ld64(s290)
	if (f != 2) {
		aj = Error_with_account_name(s320, f, token_program, "token_program", 0xd)
		ai = ld64(s320)
		st64(a + 0x10, ld64(s320 + 8))
		st64(a + 8, ai)
		st64(a, 0)
		return aj
	}
	st64(s8b0, ld64(e - 0xff8))
	try_accounts_11718(s290, c)
	const i = ld64(s290 + 8)
	const g = ld64(s290)
	if (g == 2) {
		try_accounts_11a48(s290, c)
		if (ld64(s290) == 0) {
			aj = Error_with_account_name(s8a0, ld64(s290 + 8), ld64(s290 + 0x10), "whirlpool_one", 0xd)
			ai = ld64(s8a0)
			st64(a + 0x10, ld64(s8a0 + 8))
			st64(a + 8, ai)
			st64(a, 0)
			return aj
		}
		const h = ld64(0x300000000 /* heap bump-allocator cursor */)
		const j = h != 0 ? sat_sub(h, 0x290) & -8 : 0x300007d70
		st64(s8c0, i)
		if (j > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(s8b8, j)
			memcpy(j, s290, 0x290)
			try_accounts_11a48(s290, c)
			if (ld64(s290) == 0) {
				aj = Error_with_account_name(s890, ld64(s290 + 8), ld64(s290 + 0x10), "whirlpool_two", 0xd)
				ai = ld64(s890)
				st64(a + 0x10, ld64(s890 + 8))
				st64(a + 8, ai)
				st64(a, 0)
				return aj
			}
			const l = ld64(0x300000000 /* heap bump-allocator cursor */)
			const m = l != 0 ? sat_sub(l, 0x290) & -8 : 0x300007d70
			if (m > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(s8c8, m)
				memcpy(m, s290, 0x290)
				try_accounts_11f50(s290, c)
				if (ld32(s270 + 0x70) == 2) {
					aj = Error_with_account_name(s880, ld64(s290), ld64(s290 + 8), "token_owner_account_one_a", 0x19)
					ai = ld64(s880)
					st64(a + 0x10, ld64(s880 + 8))
					st64(a + 8, ai)
					st64(a, 0)
					return aj
				}
				const n = ld64(0x300000000 /* heap bump-allocator cursor */)
				const token_owner_account_one_a_box: TokenAccount = n != 0 ? sat_sub(n, 0xb8) & -8 : 0x300007f48
				if (token_owner_account_one_a_box > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, token_owner_account_one_a_box)
					st64(s8d0, token_owner_account_one_a_box)
					memcpy(token_owner_account_one_a_box, s290, 0xb8)
					try_accounts_11f50(s290, c)
					if (ld32(s270 + 0x70) == 2) {
						aj = Error_with_account_name(s870, ld64(s290), ld64(s290 + 8), "token_vault_one_a", 0x11)
						ai = ld64(s870)
						st64(a + 0x10, ld64(s870 + 8))
						st64(a + 8, ai)
						st64(a, 0)
						return aj
					}
					const p = ld64(0x300000000 /* heap bump-allocator cursor */)
					const token_vault_one_a_box: TokenAccount = p != 0 ? sat_sub(p, 0xb8) & -8 : 0x300007f48
					if (token_vault_one_a_box > 0x300000007) {
						st64(0x300000000 /* heap bump-allocator cursor */, token_vault_one_a_box)
						memcpy(token_vault_one_a_box, s290, 0xb8)
						fn_20f8(s290, c)
						const token_owner_account_one_b_box: TokenAccount = ld64(s290 + 8)
						const r = ld64(s290)
						if (r == 2) {
							st64(s8d8, token_owner_account_one_b_box)
							fn_20f8(s290, c, token_owner_account_one_b_box)
							const token_vault_one_b_box: TokenAccount = ld64(s290 + 8)
							const t = ld64(s290)
							if (t == 2) {
								st64(s8e0, token_vault_one_b_box)
								fn_20f8(s290, c, token_vault_one_b_box)
								const token_owner_account_two_a_box: TokenAccount = ld64(s290 + 8)
								const v = ld64(s290)
								if (v == 2) {
									st64(s8e8, token_owner_account_two_a_box)
									fn_20f8(s290, c, token_owner_account_two_a_box)
									const token_vault_two_a_box: TokenAccount = ld64(s290 + 8)
									const x = ld64(s290)
									if (x == 2) {
										st64(s8f0, token_vault_two_a_box)
										fn_20f8(s290, c, token_vault_two_a_box)
										const token_owner_account_two_b_box: TokenAccount = ld64(s290 + 8)
										const z = ld64(s290)
										if (z == 2) {
											st64(s8f8, token_owner_account_two_b_box)
											fn_20f8(s290, c, token_owner_account_two_b_box)
											const token_vault_two_b_box: TokenAccount = ld64(s290 + 8)
											const ab = ld64(s290)
											if (ab == 2) {
												B55: {
													B50: {
														B49: {
															B46: {
																B43: {
																	B40: {
																		B37: {
																			const ad = ld64(c + 8)
																			st64(s900, token_vault_two_b_box)
																			if (ad != 0) {
																				ah = ld64(c)
																				st64(c, ah + 0x30, ad - 1)
																				if (ad != 1) {
																					st64(s908, ah)
																					al = ld64(c)
																					st64(c, al + 0x30, ad - 2)
																					if (ad != 2) {
																						st64(s910, al)
																						an = ld64(c)
																						st64(c, an + 0x30, ad - 3)
																						if (ad != 3) {
																							st64(s918, an)
																							ap = ld64(c)
																							st64(c, ap + 0x30, ad - 4)
																							if (ad != 4) {
																								st64(s928, ap)
																								const ar: AccountInfo = ld64(c)
																								st64(s920, ar)
																								st64(c, ar + 0x30, ad - 5)
																								if (ad != 5) {
																									const au: AccountInfo = ld64(c)
																									st64(s930, au)
																									st64(c, au + 0x30, ad - 6)
																									if (ad != 6) {
																										const ax: AccountInfo = ld64(c)
																										st64(s938, ax)
																										st64(c, ax + 0x30, ad - 7)
																										if (ad == 7) {
																											break B50
																										}
																										st64(c + 8, ad - 8)
																										const ay: AccountInfo = ld64(c)
																										st64(s940, ay)
																										st64(c, ay + 0x30)
																										break B55
																									}
																									break B49
																								}
																								break B46
																							}
																							break B43
																						}
																						break B40
																					}
																					break B37
																				}
																			} else {
																				anchor_error_from(s3a0, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_two_b_box, ae, af)
																				ah = ld64(s3a0 + 8)
																				const ag = ld64(s3a0)
																				if (ag != 2) {
																					aj = Error_with_account_name(s3b0, ag, ah, "tick_array_one_0", 0x10)
																					ai = ld64(s3b0)
																					st64(a + 0x10, ld64(s3b0 + 8))
																					st64(a + 8, ai)
																					st64(a, 0)
																					return aj
																				}
																			}
																			st64(s908, ah)
																			anchor_error_from(s3c0, 0xbbd /* anchor::AccountNotEnoughKeys */, ah, ae, af)
																			al = ld64(s3c0 + 8)
																			const ak = ld64(s3c0)
																			if (ak != 2) {
																				aj = Error_with_account_name(s3d0, ak, al, "tick_array_one_1", 0x10)
																				ai = ld64(s3d0)
																				st64(a + 0x10, ld64(s3d0 + 8))
																				st64(a + 8, ai)
																				st64(a, 0)
																				return aj
																			}
																		}
																		st64(s910, al)
																		anchor_error_from(s3e0, 0xbbd /* anchor::AccountNotEnoughKeys */, al, ae, af)
																		an = ld64(s3e0 + 8)
																		const am = ld64(s3e0)
																		if (am != 2) {
																			aj = Error_with_account_name(s3f0, am, an, "tick_array_one_2", 0x10)
																			ai = ld64(s3f0)
																			st64(a + 0x10, ld64(s3f0 + 8))
																			st64(a + 8, ai)
																			st64(a, 0)
																			return aj
																		}
																	}
																	st64(s918, an)
																	anchor_error_from(s400, 0xbbd /* anchor::AccountNotEnoughKeys */, an, ae, af)
																	ap = ld64(s400 + 8)
																	const ao = ld64(s400)
																	if (ao != 2) {
																		aj = Error_with_account_name(s410, ao, ap, "tick_array_two_0", 0x10)
																		ai = ld64(s410)
																		st64(a + 0x10, ld64(s410 + 8))
																		st64(a + 8, ai)
																		st64(a, 0)
																		return aj
																	}
																}
																st64(s928, ap)
																anchor_error_from(s420, 0xbbd /* anchor::AccountNotEnoughKeys */, ap, ae, af)
																ap = undef
																st64(s920, ld64(s420 + 8))
																const aq = ld64(s420)
																if (aq != 2) {
																	aj = Error_with_account_name(s430, aq, ld64(s920), "tick_array_two_1", 0x10)
																	ai = ld64(s430)
																	st64(a + 0x10, ld64(s430 + 8))
																	st64(a + 8, ai)
																	st64(a, 0)
																	return aj
																}
															}
															anchor_error_from(s440, 0xbbd /* anchor::AccountNotEnoughKeys */, ap, ae, af)
															ap = undef
															st64(s930, ld64(s440 + 8))
															const at = ld64(s440)
															if (at != 2) {
																aj = Error_with_account_name(s450, at, ld64(s930), "tick_array_two_2", 0x10)
																ai = ld64(s450)
																st64(a + 0x10, ld64(s450 + 8))
																st64(a + 8, ai)
																st64(a, 0)
																return aj
															}
														}
														anchor_error_from(s460, 0xbbd /* anchor::AccountNotEnoughKeys */, ap, ae, af)
														ap = undef
														st64(s938, ld64(s460 + 8))
														const av = ld64(s460)
														if (av != 2) {
															aj = Error_with_account_name(s470, av, ld64(s938), "oracle_one", 0xa)
															ai = ld64(s470)
															st64(a + 0x10, ld64(s470 + 8))
															st64(a + 8, ai)
															st64(a, 0)
															return aj
														}
													}
													anchor_error_from(s480, 0xbbd /* anchor::AccountNotEnoughKeys */, ap, ae, af)
													st64(s940, ld64(s480 + 8))
													const aw = ld64(s480)
													if (aw != 2) {
														aj = Error_with_account_name(s490, aw, ld64(s940), "oracle_two", 0xa)
														ai = ld64(s490)
														st64(a + 0x10, ld64(s490 + 8))
														st64(a + 8, ai)
														st64(a, 0)
														return aj
													}
												}
												const az = token_program.key
												copyr(s2b0, az, 0x20)
												if ((memcmp(s2b0, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) == 0) {
													const whirlpool_one: AccountInfo = ld64(ld64(s8b8))
													if (whirlpool_one.is_writable == 0) {
														anchor_error_from(s850, 0x7d0 /* anchor::ConstraintMut */)
														aj = Error_with_account_name(s860, ld64(s850), ld64(s850 + 8), "whirlpool_one", 0xd)
														ai = ld64(s860)
														st64(a + 0x10, ld64(s860 + 8))
														st64(a + 8, ai)
														st64(a, 0)
														return aj
													}
													if (ld8(ld64(ld64(s8c8)) + 0x29 /* is_writable */) != 0) {
														if (ld8(ld64(ld64(s8d0)) + 0x29) != 0) {
															if ((memcmp(ld64(s8d0) + 8, ld64(s8b8) + 0x1a8, 0x20) as u32) == 0) {
																const token_vault_one_a: AccountInfo = token_vault_one_a_box.info
																if (token_vault_one_a.is_writable != 0) {
																	const bf = token_vault_one_a.key
																	copyr(s2d0, bf, 0x20)
																	const bg = ld64(s8b8)
																	copyr(s2b0, bg + 0x1c8, 0x20)
																	if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
																		anchor_error_from(s4f0, 0x7dc /* anchor::ConstraintAddress */)
																		const bj = Error_with_account_name(s500, ld64(s4f0), ld64(s4f0 + 8), "token_vault_one_a", 0x11)
																		const bi = ld64(s500 + 8)
																		const bh = ld64(s500)
																		copy(s290, s2d0, 0x40)
																		aj = fn_13b5c0(s510, bh, bi, s290, bj)
																		ai = ld64(s510)
																		st64(a + 0x10, ld64(s510 + 8))
																		st64(a + 8, ai)
																		st64(a, 0)
																		return aj
																	}
																	if (ld8(ld64(ld64(s8d8)) + 0x29) == 0) {
																		anchor_error_from(s7d0, 0x7d0 /* anchor::ConstraintMut */)
																		aj = Error_with_account_name(s7e0, ld64(s7d0), ld64(s7d0 + 8), "token_owner_account_one_b", 0x19)
																		ai = ld64(s7e0)
																		st64(a + 0x10, ld64(s7e0 + 8))
																		st64(a + 8, ai)
																		st64(a, 0)
																		return aj
																	}
																	if ((memcmp(ld64(s8d8) + 8, ld64(s8b8) + 0x1e8, 0x20) as u32) == 0) {
																		const token_vault_one_b: AccountInfo = ld64(ld64(s8e0))
																		if (token_vault_one_b.is_writable != 0) {
																			const bl = token_vault_one_b.key
																			copyr(s2d0, bl, 0x20)
																			const bm = ld64(s8b8)
																			copyr(s2b0, bm + 0x208, 0x20)
																			if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
																				anchor_error_from(s540, 0x7dc /* anchor::ConstraintAddress */)
																				const bp = Error_with_account_name(s550, ld64(s540), ld64(s540 + 8), "token_vault_one_b", 0x11)
																				const bo = ld64(s550 + 8)
																				const bn = ld64(s550)
																				copy(s290, s2d0, 0x40)
																				aj = fn_13b5c0(s560, bn, bo, s290, bp)
																				ai = ld64(s560)
																				st64(a + 0x10, ld64(s560 + 8))
																				st64(a + 8, ai)
																				st64(a, 0)
																				return aj
																			}
																			if (ld8(ld64(ld64(s8e8)) + 0x29) == 0) {
																				anchor_error_from(s790, 0x7d0 /* anchor::ConstraintMut */)
																				aj = Error_with_account_name(s7a0, ld64(s790), ld64(s790 + 8), "token_owner_account_two_a", 0x19)
																				ai = ld64(s7a0)
																				st64(a + 0x10, ld64(s7a0 + 8))
																				st64(a + 8, ai)
																				st64(a, 0)
																				return aj
																			}
																			if ((memcmp(ld64(s8e8) + 8, ld64(s8c8) + 0x1a8, 0x20) as u32) == 0) {
																				const token_vault_two_a: AccountInfo = ld64(ld64(s8f0))
																				if (token_vault_two_a.is_writable != 0) {
																					const br = token_vault_two_a.key
																					copyr(s2d0, br, 0x20)
																					const bs = ld64(s8c8)
																					copyr(s2b0, bs + 0x1c8, 0x20)
																					if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
																						anchor_error_from(s590, 0x7dc /* anchor::ConstraintAddress */)
																						const bv = Error_with_account_name(s5a0, ld64(s590), ld64(s590 + 8), "token_vault_two_a", 0x11)
																						const bu = ld64(s5a0 + 8)
																						const bt = ld64(s5a0)
																						copy(s290, s2d0, 0x40)
																						aj = fn_13b5c0(s5b0, bt, bu, s290, bv)
																						ai = ld64(s5b0)
																						st64(a + 0x10, ld64(s5b0 + 8))
																						st64(a + 8, ai)
																						st64(a, 0)
																						return aj
																					}
																					if (ld8(ld64(ld64(s8f8)) + 0x29) == 0) {
																						anchor_error_from(s750, 0x7d0 /* anchor::ConstraintMut */)
																						aj = Error_with_account_name(s760, ld64(s750), ld64(s750 + 8), "token_owner_account_two_b", 0x19)
																						ai = ld64(s760)
																						st64(a + 0x10, ld64(s760 + 8))
																						st64(a + 8, ai)
																						st64(a, 0)
																						return aj
																					}
																					if ((memcmp(ld64(s8f8) + 8, ld64(s8c8) + 0x1e8, 0x20) as u32) == 0) {
																						const token_vault_two_b: AccountInfo = ld64(ld64(s900))
																						if (token_vault_two_b.is_writable != 0) {
																							const bx = token_vault_two_b.key
																							copyr(s2d0, bx, 0x20)
																							const by = ld64(s8c8)
																							copyr(s2b0, by + 0x208, 0x20)
																							if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
																								anchor_error_from(s5e0, 0x7dc /* anchor::ConstraintAddress */)
																								const cb = Error_with_account_name(s5f0, ld64(s5e0), ld64(s5e0 + 8), "token_vault_two_b", 0x11)
																								const ca = ld64(s5f0 + 8)
																								const bz = ld64(s5f0)
																								copy(s290, s2d0, 0x40)
																								aj = fn_13b5c0(s600, bz, ca, s290, cb)
																								ai = ld64(s600)
																								st64(a + 0x10, ld64(s600 + 8))
																								st64(a + 8, ai)
																								st64(a, 0)
																								return aj
																							}
																							if (ld8(ld64(s908) + 0x29) == 0) {
																								anchor_error_from(s710, 0x7d0 /* anchor::ConstraintMut */)
																								aj = Error_with_account_name(s720, ld64(s710), ld64(s710 + 8), "tick_array_one_0", 0x10)
																								ai = ld64(s720)
																								st64(a + 0x10, ld64(s720 + 8))
																								st64(a + 8, ai)
																								st64(a, 0)
																								return aj
																							}
																							if (ld8(ld64(s910) + 0x29) != 0) {
																								if (ld8(ld64(s918) + 0x29) != 0) {
																									if (ld8(ld64(s928) + 0x29) != 0) {
																										if (ld8(ld64(s920) + 0x29) != 0) {
																											if (ld8(ld64(s930) + 0x29) != 0) {
																												const cc = whirlpool_one.key
																												copyr(s2b0, cc, 0x20)
																												st64(s2d0, 0x100154c38, 6, s2b0, 0x20)
																												// PDA find_program_address(["oracle", *cc], program *(ld64(s8a8)))
																												Pubkey_find_program_address(s290, s2d0, 2, ld64(s8a8))
																												copyr(s310, s290, 0x20)
																												st8(ld64(s8b0), ld8(s270))
																												const cd = ld64(ld64(s938))
																												copyr(s290, cd, 0x20)
																												if ((memcmp(s290, s310, 0x20) as u32) != 0) {
																													anchor_error_from(s610, 0x7d6 /* anchor::ConstraintSeeds */)
																													const cp = Error_with_account_name(s620, ld64(s610), ld64(s610 + 8), "oracle_one", 0xa)
																													const co = ld64(s620 + 8)
																													const cn = ld64(s620)
																													copyr(s290, cd, 0x20)
																													copy(s270, s310, 0x20)
																													aj = fn_13b5c0(s630, cn, co, s290, cp)
																													ai = ld64(s630)
																													st64(a + 0x10, ld64(s630 + 8))
																													st64(a + 8, ai)
																													st64(a, 0)
																													return aj
																												}
																												const ce = ld64(ld64(ld64(s8c8)) /* key */)
																												const ci = ld64(ce)
																												const ch = ld64(ce + 8)
																												const cg = ld64(ce + 0x10)
																												const cf = ld64(ce + 0x18)
																												st64(s2d0, 0x100154c38, 6, s2b0, 0x20, ci, ch, cg, cf)
																												// PDA find_program_address(["oracle", *s2b0], program *(ld64(s8a8)))
																												Pubkey_find_program_address(s290, s2d0, 2, ld64(s8a8))
																												copyr(s2f0, s290, 0x20)
																												st8(ld64(s8b0) + 1, ld8(s270))
																												const cj = ld64(ld64(s940))
																												copyr(s290, cj, 0x20)
																												aj = memcmp(s290, s2f0, 0x20) as u32
																												if (aj == 0) {
																													st64(a + 0x98, ld64(s940))
																													st64(a + 0x90, ld64(s938))
																													st64(a + 0x88, ld64(s930))
																													st64(a + 0x80, ld64(s920))
																													st64(a + 0x78, ld64(s928))
																													st64(a + 0x70, ld64(s918))
																													st64(a + 0x68, ld64(s910))
																													st64(a + 0x60, ld64(s908))
																													st64(a + 0x58, ld64(s900))
																													st64(a + 0x50, ld64(s8f8))
																													st64(a + 0x48, ld64(s8f0))
																													st64(a + 0x40, ld64(s8e8))
																													st64(a + 0x38, ld64(s8e0))
																													st64(a + 0x30, ld64(s8d8))
																													st64(a + 0x28, token_vault_one_a_box)
																													st64(a + 0x20, ld64(s8d0))
																													st64(a + 0x18, ld64(s8c8))
																													st64(a + 0x10, ld64(s8b8))
																													st64(a + 8, ld64(s8c0))
																													st64(a, token_program)
																													return aj
																												}
																												anchor_error_from(s640, 0x7d6 /* anchor::ConstraintSeeds */)
																												const cm = Error_with_account_name(s650, ld64(s640), ld64(s640 + 8), "oracle_two", 0xa)
																												const cl = ld64(s650 + 8)
																												const ck = ld64(s650)
																												copyr(s290, cj, 0x20)
																												copy(s270, s2f0, 0x20)
																												aj = fn_13b5c0(s660, ck, cl, s290, cm)
																												ai = ld64(s660)
																												st64(a + 0x10, ld64(s660 + 8))
																												st64(a + 8, ai)
																												st64(a, 0)
																												return aj
																											}
																											anchor_error_from(s670, 0x7d0 /* anchor::ConstraintMut */)
																											aj = Error_with_account_name(s680, ld64(s670), ld64(s670 + 8), "tick_array_two_2", 0x10)
																											ai = ld64(s680)
																											st64(a + 0x10, ld64(s680 + 8))
																											st64(a + 8, ai)
																											st64(a, 0)
																											return aj
																										}
																										anchor_error_from(s690, 0x7d0 /* anchor::ConstraintMut */)
																										aj = Error_with_account_name(s6a0, ld64(s690), ld64(s690 + 8), "tick_array_two_1", 0x10)
																										ai = ld64(s6a0)
																										st64(a + 0x10, ld64(s6a0 + 8))
																										st64(a + 8, ai)
																										st64(a, 0)
																										return aj
																									}
																									anchor_error_from(s6b0, 0x7d0 /* anchor::ConstraintMut */)
																									aj = Error_with_account_name(s6c0, ld64(s6b0), ld64(s6b0 + 8), "tick_array_two_0", 0x10)
																									ai = ld64(s6c0)
																									st64(a + 0x10, ld64(s6c0 + 8))
																									st64(a + 8, ai)
																									st64(a, 0)
																									return aj
																								}
																								anchor_error_from(s6d0, 0x7d0 /* anchor::ConstraintMut */)
																								aj = Error_with_account_name(s6e0, ld64(s6d0), ld64(s6d0 + 8), "tick_array_one_2", 0x10)
																								ai = ld64(s6e0)
																								st64(a + 0x10, ld64(s6e0 + 8))
																								st64(a + 8, ai)
																								st64(a, 0)
																								return aj
																							}
																							anchor_error_from(s6f0, 0x7d0 /* anchor::ConstraintMut */)
																							aj = Error_with_account_name(s700, ld64(s6f0), ld64(s6f0 + 8), "tick_array_one_1", 0x10)
																							ai = ld64(s700)
																							st64(a + 0x10, ld64(s700 + 8))
																							st64(a + 8, ai)
																							st64(a, 0)
																							return aj
																						}
																						anchor_error_from(s730, 0x7d0 /* anchor::ConstraintMut */)
																						aj = Error_with_account_name(s740, ld64(s730), ld64(s730 + 8), "token_vault_two_b", 0x11)
																						ai = ld64(s740)
																						st64(a + 0x10, ld64(s740 + 8))
																						st64(a + 8, ai)
																						st64(a, 0)
																						return aj
																					}
																					anchor_error_from(s5c0, 0x7d3 /* anchor::ConstraintRaw */)
																					aj = Error_with_account_name(s5d0, ld64(s5c0), ld64(s5c0 + 8), "token_owner_account_two_b", 0x19)
																					ai = ld64(s5d0)
																					st64(a + 0x10, ld64(s5d0 + 8))
																					st64(a + 8, ai)
																					st64(a, 0)
																					return aj
																				}
																				anchor_error_from(s770, 0x7d0 /* anchor::ConstraintMut */)
																				aj = Error_with_account_name(s780, ld64(s770), ld64(s770 + 8), "token_vault_two_a", 0x11)
																				ai = ld64(s780)
																				st64(a + 0x10, ld64(s780 + 8))
																				st64(a + 8, ai)
																				st64(a, 0)
																				return aj
																			}
																			anchor_error_from(s570, 0x7d3 /* anchor::ConstraintRaw */)
																			aj = Error_with_account_name(s580, ld64(s570), ld64(s570 + 8), "token_owner_account_two_a", 0x19)
																			ai = ld64(s580)
																			st64(a + 0x10, ld64(s580 + 8))
																			st64(a + 8, ai)
																			st64(a, 0)
																			return aj
																		}
																		anchor_error_from(s7b0, 0x7d0 /* anchor::ConstraintMut */)
																		aj = Error_with_account_name(s7c0, ld64(s7b0), ld64(s7b0 + 8), "token_vault_one_b", 0x11)
																		ai = ld64(s7c0)
																		st64(a + 0x10, ld64(s7c0 + 8))
																		st64(a + 8, ai)
																		st64(a, 0)
																		return aj
																	}
																	anchor_error_from(s520, 0x7d3 /* anchor::ConstraintRaw */)
																	aj = Error_with_account_name(s530, ld64(s520), ld64(s520 + 8), "token_owner_account_one_b", 0x19)
																	ai = ld64(s530)
																	st64(a + 0x10, ld64(s530 + 8))
																	st64(a + 8, ai)
																	st64(a, 0)
																	return aj
																}
																anchor_error_from(s7f0, 0x7d0 /* anchor::ConstraintMut */)
																aj = Error_with_account_name(s800, ld64(s7f0), ld64(s7f0 + 8), "token_vault_one_a", 0x11)
																ai = ld64(s800)
																st64(a + 0x10, ld64(s800 + 8))
																st64(a + 8, ai)
																st64(a, 0)
																return aj
															}
															anchor_error_from(s4d0, 0x7d3 /* anchor::ConstraintRaw */)
															aj = Error_with_account_name(s4e0, ld64(s4d0), ld64(s4d0 + 8), "token_owner_account_one_a", 0x19)
															ai = ld64(s4e0)
															st64(a + 0x10, ld64(s4e0 + 8))
															st64(a + 8, ai)
															st64(a, 0)
															return aj
														}
														anchor_error_from(s810, 0x7d0 /* anchor::ConstraintMut */)
														aj = Error_with_account_name(s820, ld64(s810), ld64(s810 + 8), "token_owner_account_one_a", 0x19)
														ai = ld64(s820)
														st64(a + 0x10, ld64(s820 + 8))
														st64(a + 8, ai)
														st64(a, 0)
														return aj
													}
													anchor_error_from(s830, 0x7d0 /* anchor::ConstraintMut */)
													aj = Error_with_account_name(s840, ld64(s830), ld64(s830 + 8), "whirlpool_two", 0xd)
													ai = ld64(s840)
													st64(a + 0x10, ld64(s840 + 8))
													st64(a + 8, ai)
													st64(a, 0)
													return aj
												}
												anchor_error_from(s4a0, 0x7dc /* anchor::ConstraintAddress */)
												const bc = Error_with_account_name(s4b0, ld64(s4a0), ld64(s4a0 + 8), "token_program", 0xd)
												const bb = ld64(s4b0 + 8)
												const ba = ld64(s4b0)
												copyr(s290, s2b0, 0x20)
												st64(s270, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
												aj = fn_13b5c0(s4c0, ba, bb, s290, bc)
												ai = ld64(s4c0)
												st64(a + 0x10, ld64(s4c0 + 8))
												st64(a + 8, ai)
												st64(a, 0)
												return aj
											}
											aj = Error_with_account_name(s390, ab, token_vault_two_b_box, "token_vault_two_b", 0x11)
											ai = ld64(s390)
											st64(a + 0x10, ld64(s390 + 8))
											st64(a + 8, ai)
											st64(a, 0)
											return aj
										}
										aj = Error_with_account_name(s380, z, token_owner_account_two_b_box, "token_owner_account_two_b", 0x19)
										ai = ld64(s380)
										st64(a + 0x10, ld64(s380 + 8))
										st64(a + 8, ai)
										st64(a, 0)
										return aj
									}
									aj = Error_with_account_name(s370, x, token_vault_two_a_box, "token_vault_two_a", 0x11)
									ai = ld64(s370)
									st64(a + 0x10, ld64(s370 + 8))
									st64(a + 8, ai)
									st64(a, 0)
									return aj
								}
								aj = Error_with_account_name(s360, v, token_owner_account_two_a_box, "token_owner_account_two_a", 0x19)
								ai = ld64(s360)
								st64(a + 0x10, ld64(s360 + 8))
								st64(a + 8, ai)
								st64(a, 0)
								return aj
							}
							aj = Error_with_account_name(s350, t, token_vault_one_b_box, "token_vault_one_b", 0x11)
							ai = ld64(s350)
							st64(a + 0x10, ld64(s350 + 8))
							st64(a + 8, ai)
							st64(a, 0)
							return aj
						}
						aj = Error_with_account_name(s340, r, token_owner_account_one_b_box, "token_owner_account_one_b", 0x19)
						ai = ld64(s340)
						st64(a + 0x10, ld64(s340 + 8))
						st64(a + 8, ai)
						st64(a, 0)
						return aj
					}
					alloc_handle_alloc_error(8, 0xb8)
				}
				alloc_handle_alloc_error(8, 0xb8)
			}
			alloc_handle_alloc_error(8, 0x290)
		}
		alloc_handle_alloc_error(8, 0x290)
	}
	aj = Error_with_account_name(s330, g, i, "token_authority", 0xf)
	ai = ld64(s330)
	st64(a + 0x10, ld64(s330 + 8))
	st64(a + 8, ai)
	st64(a, 0)
	return aj
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), a (points to it), p5 (value), p6 (value), p7 (value), p8 (value), p9 (value), p10 (value), p11 (value)
// types [heur]: b: TwoHopSwapContext (the handler ix_two_hop_swap passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_386c8(a: u64, b: TwoHopSwapContext, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64): u64 {
	const s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sf9 = fp - 0xf9, s110 = fp - 0x110, s138 = fp - 0x138, s148 = fp - 0x148, s181 = fp - 0x181, s198 = fp - 0x198, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e8 = fp - 0x1e8, s200 = fp - 0x200, s218 = fp - 0x218, s230 = fp - 0x230, s248 = fp - 0x248, s268 = fp - 0x268, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s390 = fp - 0x390, s398 = fp - 0x398, s3b0 = fp - 0x3b0, s410 = fp - 0x410, s418 = fp - 0x418, s420 = fp - 0x420, s428 = fp - 0x428, s430 = fp - 0x430, s438 = fp - 0x438, s440 = fp - 0x440, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let g, r, s, cy, da, db: u64
	st64(s390 + 0x30, a)
	clock_get_13f308(s78)
	if (ld64(s78) != 0) {
		const q = ld64(s78 + 8)
		const p = ld64(s68)
		st64(s68, ld64(s60))
		st64(s78, q, p)
		s = fn_13b430(s298, s78)
		g = ld64(s298)
		r = ld64(s390 + 0x30)
		st64(r + 8, ld64(s298 + 8))
		st64(r, g)
		return s
	}
	st64(s398, p9, p8, p11, p10, c, p7, p6)
	const h = p5
	let f = ld64(s60 + 0x10)
	r = ld64(s390 + 0x30)
	if (-1 >= (f as i64)) {
		s = fn_87630(s2a8, 0x15)
		f = ld64(s2a8 + 8)
		g = ld64(s2a8)
		if (g != 2) {
			st64(r + 8, f)
			st64(r, g)
			return s
		}
	}
	st64(s3b0, d, h, f)
	const accounts: TwoHopSwapAccounts = b.accounts
	const j = ld64(accounts + 0x10)
	const k = ld64(ld64(j))
	copyr(s110, k, 0x20)
	const l = ld64(accounts + 0x18)
	const m = ld64(ld64(l))
	copyr(s78, m, 0x20)
	if ((memcmp(s110, s78, 0x20) as u32) == 0) {
		s = fn_87630(s358, 0x2a)
		g = ld64(s358)
		st64(r + 8, ld64(s358 + 8))
		st64(r, g)
		return s
	}
	const n = ld64(s390 + 0x28) != 0 ? 0x1e8 : 0x1a8
	const o = ld64(s390 + 0x20) != 0 ? 0x1a8 : 0x1e8
	copyr(s288, j + n, 0x20)
	copyr(s268, l + o, 0x20)
	if ((memcmp(s288, s268, 0x20) as u32) == 0) {
		const t = ld64(0x300000000 /* heap bump-allocator cursor */)
		const u = t != 0 ? sat_sub(t, 0x90) & -8 : 0x300007f70
		if (u > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, u)
			const v: AccountInfo = ld64(accounts + 0x60)
			const w: LamportsCell = v.lamports
			const ad = v.key
			rc_inc(w)
			const x: DataCell = v.data
			rc_inc(x)
			const y: AccountInfo = ld64(accounts + 0x68)
			const z: LamportsCell = y.lamports
			st64(s410 + 0x50, z)
			const aa = z.strong
			st64(s410 + 0x48, x)
			st64(s410 + 0x20, v.executable)
			st64(s410 + 0x28, v.is_writable)
			st64(s410 + 0x30, v.is_signer)
			st64(s410 + 0x38, v.rent_epoch)
			st64(s410 + 0x40, v.owner)
			st64(s410 + 0x18, y.key)
			rc_inc(ld64(s410 + 0x50), aa)
			const ab: DataCell = y.data
			const ac = ab.strong
			st64(s410 + 0x10, ad)
			rc_inc(ab, ac)
			const ae: AccountInfo = ld64(accounts + 0x70)
			const af: LamportsCell = ae.lamports
			const ag = af.strong
			st64(s420, y.executable)
			st64(s418, y.is_writable)
			st64(s410, y.is_signer)
			st64(s410 + 8, y.rent_epoch)
			const ah = y.owner
			st64(s428, ae.key)
			rc_inc(af, ag)
			st64(s430, ah)
			const ai: DataCell = ae.data
			const aj = ai.strong
			st64(s410 + 0x58, accounts)
			ai.strong = aj + 1
			if (aj != -1) {
				const an = ae.owner
				const am = ae.rent_epoch
				const al = ae.is_signer
				const ak = ae.is_writable
				st8(u + 0x8a, ae.executable)
				st8(u + 0x89, ak)
				st8(u + 0x88, al)
				st64(u + 0x80, am)
				st64(u + 0x78, an)
				st64(u + 0x70, ai)
				st64(u + 0x68, af)
				st64(u + 0x60, ld64(s428))
				st8(u + 0x5a, ld64(s420))
				st8(u + 0x59, ld64(s418))
				st8(u + 0x58, ld64(s410))
				st64(u + 0x50, ld64(s410 + 8))
				st64(u + 0x48, ld64(s430))
				st64(u + 0x40, ab)
				st64(u + 0x38, ld64(s410 + 0x50))
				st64(u + 0x30, ld64(s410 + 0x18))
				st8(u + 0x2a, ld64(s410 + 0x20))
				st8(u + 0x29, ld64(s410 + 0x28))
				st8(u + 0x28, ld64(s410 + 0x30))
				st64(u + 0x20, ld64(s410 + 0x38))
				st64(u + 0x18, ld64(s410 + 0x40))
				st64(u + 0x10, ld64(s410 + 0x48))
				st64(u + 8, w)
				st64(u, ld64(s410 + 0x10))
				st64(s78 + 8, u)
				st64(s230, 0x8000000000000000)
				st64(s68, 3)
				st64(s78, 3)
				fn_60de8(s248, s78, s230, an, ak, ab)
				s = fn_62750(s78, s248, ld64(ld64(s410 + 0x58) + 0x10), ld64(s390 + 0x28))
				let ao = ld64(s68)
				const ap = ld64(s78 + 8)
				const aq = ld64(s78)
				f = ao
				g = ap
				if (aq != 0x8000000000000000) {
					st64(s218, aq, ap, ao)
					const ar = ld64(0x300000000 /* heap bump-allocator cursor */)
					const au: TwoHopSwapAccounts = ld64(s410 + 0x58)
					const at = ar != 0 ? sat_sub(ar, 0x90) & -8 : 0x300007f70
					if (0x300000007 >= at) {
						alloc_handle_alloc_error(8, 0x90)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, at)
					const av: AccountInfo = ld64(au + 0x78)
					const aw: LamportsCell = av.lamports
					const bf = av.key
					rc_inc(aw)
					const ax: DataCell = av.data
					const ay = ax.strong
					st64(s410 + 0x40, ax)
					rc_inc(ax, ay)
					st64(s410 + 0x48, aw)
					const az: AccountInfo = ld64(au + 0x80)
					const ba: LamportsCell = az.lamports
					st64(s410 + 0x50, ba)
					const bb = ba.strong
					st64(s410 + 0x18, av.executable)
					st64(s410 + 0x20, av.is_writable)
					st64(s410 + 0x28, av.is_signer)
					st64(s410 + 0x30, av.rent_epoch)
					st64(s410 + 0x38, av.owner)
					const be = az.key
					rc_inc(ld64(s410 + 0x50), bb)
					const bc: DataCell = az.data
					const bd = bc.strong
					st64(s410, bc, be, bf)
					rc_inc(bc, bd)
					const bg: AccountInfo = ld64(au + 0x88)
					const bh: LamportsCell = bg.lamports
					const bi = bh.strong
					st64(s428, az.executable)
					st64(s420, az.is_writable)
					st64(s418, az.is_signer)
					const bm = az.rent_epoch
					const bj = az.owner
					st64(s430, bg.key)
					rc_inc(bh, bi)
					st64(s438, bj)
					const bk: DataCell = bg.data
					const bl = bk.strong
					st64(s440, bm)
					rc_inc(bk, bl)
					const bq = bg.owner
					const bp = bg.rent_epoch
					const bo = bg.is_signer
					const bn = bg.is_writable
					st8(at + 0x8a, bg.executable)
					st8(at + 0x89, bn)
					st8(at + 0x88, bo)
					st64(at + 0x80, bp)
					st64(at + 0x78, bq)
					st64(at + 0x70, bk)
					st64(at + 0x68, bh)
					st64(at + 0x60, ld64(s430))
					st8(at + 0x5a, ld64(s428))
					st8(at + 0x59, ld64(s420))
					st8(at + 0x58, ld64(s418))
					st64(at + 0x50, ld64(s440))
					st64(at + 0x48, ld64(s438))
					st64(at + 0x40, ld64(s410))
					st64(at + 0x38, ld64(s410 + 0x50))
					st64(at + 0x30, ld64(s410 + 8))
					st8(at + 0x2a, ld64(s410 + 0x18))
					st8(at + 0x29, ld64(s410 + 0x20))
					st8(at + 0x28, ld64(s410 + 0x28))
					st64(at + 0x20, ld64(s410 + 0x30))
					st64(at + 0x18, ld64(s410 + 0x38))
					st64(at + 0x10, ld64(s410 + 0x40))
					st64(at + 8, ld64(s410 + 0x48))
					st64(at, ld64(s410 + 0x10))
					st64(s78, 3, at, 3)
					fn_60de8(s200, s78, s230, bk, bq, bn)
					s = fn_62750(s78, s200, ld64(ld64(s410 + 0x58) + 0x18), ld64(s390 + 0x20))
					let br = ld64(s68)
					const bs = ld64(s78 + 8)
					const bt = ld64(s78)
					f = br
					g = bs
					if (bt != 0x8000000000000000) {
						st64(s1e8, bt, bs, br)
						const bu: TwoHopSwapAccounts = ld64(s410 + 0x58)
						st64(s410 + 0x50, ld64(bu + 0x10))
						const bv = ld64(bu + 0x90)
						st64(s410 + 0x48, s110)
						AccountInfo_clone(s110, bv)
						s = fn_5bad0(s78, ld64(s410 + 0x50), ld64(s410 + 0x48))
						f = ld64(s78 + 8)
						g = ld64(s78)
						const bw = ld8(s48)
						if (bw != 2) {
							copyr(s1c0, s68, 0x20)
							st32(s1c0 + 0x21, ld32(s48 + 1))
							st32(s1c0 + 0x24, ld32(s48 + 4))
							st8(s1c0 + 0x20, bw)
							st64(s1d0, g, f)
							s = fn_5bfc8(s78, s1d0, ld64(s3b0 + 0x10), s)
							g = ld64(s78)
							if (g == 2) {
								if (ld8(s78 + 8) == 0) {
									s = fn_87630(s348, 0x40)
									f = ld64(s348 + 8)
									g = ld64(s348)
								} else {
									s = fn_5c138(s78, s1d0, s)
									if (ld8(s78) == 0) {
										st32(s198 + 3, ld32(s78 + 4))
										st32(s198, ld32(s78 + 1))
										st64(s410 + 0x50, ld64(s78 + 8))
										st64(s410 + 0x48, ld64(s68))
										st64(s410 + 0x40, s110)
										memcpy(s110, s60, 0x38)
										st64(s198 + 0xf, ld64(s410 + 0x48))
										st64(s198 + 7, ld64(s410 + 0x50))
										memcpy(s181, ld64(s410 + 0x40), 0x38)
										const cl: TwoHopSwapAccounts = ld64(s410 + 0x58)
										st64(s410 + 0x50, ld64(cl + 0x18))
										const cm = ld64(cl + 0x98)
										st64(s410 + 0x48, s110)
										AccountInfo_clone(s110, cm)
										s = fn_5bad0(s78, ld64(s410 + 0x50), ld64(s410 + 0x48))
										f = ld64(s78 + 8)
										g = ld64(s78)
										const cn = ld8(s48)
										if (cn != 2) {
											B68: {
												copyr(s138, s68, 0x20)
												st32(s138 + 0x21, ld32(s48 + 1))
												st32(s138 + 0x24, ld32(s48 + 4))
												st8(s138 + 0x20, cn)
												st64(s148, g, f)
												s = fn_5bfc8(s78, s148, ld64(s3b0 + 0x10), s)
												g = ld64(s78)
												if (g == 2) {
													if (ld8(s78 + 8) == 0) {
														s = fn_87630(s338, 0x40)
														f = ld64(s338 + 8)
														g = ld64(s338)
													} else {
														s = fn_5c138(s78, s148, s)
														if (ld8(s78) == 0) {
															st32(s110 + 3, ld32(s78 + 4))
															st32(s110, ld32(s78 + 1))
															st64(s410 + 0x50, ld64(s78 + 8))
															st64(s410 + 0x48, ld64(s68))
															st64(s410 + 0x40, sc0)
															memcpy(sc0, s60, 0x38)
															st64(s110 + 0xf, ld64(s410 + 0x48))
															st64(s110 + 7, ld64(s410 + 0x50))
															memcpy(sf9, ld64(s410 + 0x40), 0x38)
															if (ld64(s3b0 + 8) != 0) {
																const cv = ld64(ld64(s410 + 0x58) + 0x10)
																st64(sff8 + 0x18, ld64(s3b0 + 0x10))
																st64(sff8 + 0x20, s198)
																st64(sff8 + 0x10, ld64(s390 + 0x28))
																st64(sff8, ld64(s398))
																st64(s1000, ld64(s390))
																st64(sff8 + 8, 1)
																s = fn_49708(s78, cv + 8, s218, ld64(s390 + 0x18), ld64(s1000), ld64(sff8), 1, ld64(sff8 + 0x10), ld64(sff8 + 0x18), s198)
																f = ld64(s78 + 8)
																g = ld64(s78)
																st64(s390 + 0x18, f)
																if (g != 2) {
																	break B68
																}
																const cx = ld64(ld64(s390 + 0x18) + (ld64(s390 + 0x28) != 0 ? 8 : 0))
																const cw = ld64(ld64(s410 + 0x58) + 0x18)
																st64(sff8 + 0x18, ld64(s3b0 + 0x10))
																st64(sff8 + 0x20, s110)
																st64(sff8 + 0x10, ld64(s390 + 0x20))
																st64(sff8, ld64(s390 + 8))
																st64(s1000, ld64(s390 + 0x10))
																st64(sff8 + 8, 1)
																s = fn_49708(s78, cw + 8, s1e8, cx, ld64(s1000), ld64(sff8), 1, ld64(sff8 + 0x10), ld64(sff8 + 0x18), s110)
																f = ld64(s78 + 8)
																g = ld64(s78)
																st64(s390 + 0x10, f)
																if (g != 2) {
																	break B68
																}
															} else {
																const cq = ld64(ld64(s410 + 0x58) + 0x18)
																st64(sff8 + 0x18, ld64(s3b0 + 0x10))
																st64(sff8 + 0x20, s110)
																st64(sff8 + 0x10, ld64(s390 + 0x20))
																st64(sff8, ld64(s390 + 8))
																st64(s1000, ld64(s390 + 0x10))
																st64(sff8 + 8, 0)
																s = fn_49708(s78, cq + 8, s1e8, ld64(s390 + 0x18), ld64(s1000), ld64(sff8), 0, ld64(sff8 + 0x10), ld64(sff8 + 0x18), s110)
																f = ld64(s78 + 8)
																g = ld64(s78)
																st64(s390 + 0x10, f)
																if (g != 2) {
																	break B68
																}
																const cs = ld64(ld64(s390 + 0x10) + (ld64(s390 + 0x20) != 0 ? 0 : 8))
																const cr = ld64(ld64(s410 + 0x58) + 0x10)
																st64(sff8 + 0x18, ld64(s3b0 + 0x10))
																st64(sff8 + 0x20, s198)
																st64(sff8 + 0x10, ld64(s390 + 0x28))
																st64(sff8, ld64(s398))
																st64(s1000, ld64(s390))
																st64(sff8 + 8, 0)
																s = fn_49708(s78, cr + 8, s218, cs, ld64(s1000), ld64(sff8), 0, ld64(sff8 + 0x10), ld64(sff8 + 0x18), s198)
																f = ld64(s78 + 8)
																g = ld64(s78)
																st64(s390 + 0x18, f)
																if (g != 2) {
																	break B68
																}
															}
															const ct = ld64(s390 + 0x18)
															st64(s390, ct + 8, ct + 8)
															if (ld64(s390 + 0x28) == 0) {
																st64(s390 + 8, ld64(s390 + 0x18))
															}
															B92: {
																B88: {
																	B85: {
																		const cu = ld64(ld64(s390 + 8))
																		if (ld64(s390 + 0x20) != 0) {
																			if (cu == ld64(ld64(s390 + 0x10))) {
																				if (ld64(s3b0 + 8) == 0) {
																					break B88
																				}
																				cy = ld64(s390 + 0x10) + 8
																				break B85
																			}
																		} else if (cu == ld64(ld64(s390 + 0x10) + 8)) {
																			cy = ld64(s390 + 0x10)
																			if (ld64(s3b0 + 8) != 0) {
																				break B85
																			}
																			break B88
																		}
																		s = fn_87630(s2c8, 0x33)
																		f = ld64(s2c8 + 8)
																		g = ld64(s2c8)
																		break B68
																	}
																	if (ld64(s3b0) > ld64(cy)) {
																		s = fn_87630(s328, 0x24)
																		f = ld64(s328 + 8)
																		g = ld64(s328)
																		break B68
																	}
																	break B92
																}
																let cz = ld64(s390 + 0x18)
																if (ld64(s390 + 0x28) == 0) {
																	cz = ld64(s390)
																}
																if (ld64(cz) > ld64(s3b0)) {
																	s = fn_87630(s2d8, 0x25)
																	f = ld64(s2d8 + 8)
																	g = ld64(s2d8)
																	break B68
																}
															}
															s = fn_5c328(s2e8, s1d0, ld64(s390 + 0x18) + 0x1d4, da, db, s)
															f = ld64(s2e8 + 8)
															g = ld64(s2e8)
															if (g == 2) {
																s = fn_5c328(s2f8, s148, ld64(s390 + 0x10) + 0x1d4, undef, undef, s)
																f = ld64(s2f8 + 8)
																g = ld64(s2f8)
																if (g == 2) {
																	let dc = ld64(s390 + 0x18)
																	if (ld64(s390 + 0x28) == 0) {
																		dc = ld64(s390)
																	}
																	st64(s398, ld64(dc))
																	st64(s410 + 0x48, ld64(ld64(s390 + 8)))
																	const dd = ld64(s390 + 0x18)
																	st64(s410 + 0x50, ld64(dd + 0x1c8))
																	st64(s3b0, ld64(dd + 0x10))
																	const de: TwoHopSwapAccounts = ld64(s410 + 0x58)
																	const df = ld64(de + 0x10)
																	st64(s3b0 + 8, ld64(df + 0x240))
																	st64(s410 + 0x40, ld64(df + 0x238))
																	st64(s390 + 8, de.token_owner_account_one_a)
																	st64(s390, de.token_owner_account_one_b)
																	const token_vault_one_a: TokenAccount = de.token_vault_one_a
																	const token_vault_one_b: TokenAccount = de.token_vault_one_b
																	st64(sff8 + 0x20, ld64(s390 + 0x28))
																	st64(sff8 + 0x28, ld64(s3b0 + 0x10))
																	st64(sff8 + 0x18, dd)
																	st64(sff8, token_vault_one_a, token_vault_one_b)
																	st64(s1000, ld64(s390))
																	st64(sff8 + 0x10, de)
																	st64(s390 + 0x18, de + 8)
																	s = fn_64930(s308, df, de + 8, ld64(s390 + 8), ld64(s1000), token_vault_one_a, token_vault_one_b, de, dd, ld64(sff8 + 0x20), ld64(sff8 + 0x28))
																	f = ld64(s308 + 8)
																	g = ld64(s308)
																	if (g == 2) {
																		const di = ld64(s390 + 0x10)
																		let dk = di + 8
																		if (ld64(s390 + 0x20) == 0) {
																			dk = ld64(s390 + 0x10)
																		}
																		let dj = ld64(s390 + 0x10)
																		dj = ld64(s390 + 0x20) != 0 ? dj : di + 8
																		st64(s410 + 0x38, ld64(dj))
																		st64(s410 + 0x18, ld64(dk))
																		const dl = ld64(s390 + 0x10)
																		st64(s410 + 0x20, ld64(dl + 0x1c8))
																		st64(s410 + 0x28, ld64(dl + 0x10))
																		const dm: TwoHopSwapAccounts = ld64(s410 + 0x58)
																		const dn = ld64(dm + 0x18)
																		st64(s410 + 0x30, ld64(dn + 0x240))
																		st64(s410 + 0x10, ld64(dn + 0x238))
																		st64(s390 + 8, dm.token_owner_account_two_a)
																		st64(s390, dm.token_owner_account_two_b)
																		const token_vault_two_a: TokenAccount = dm.token_vault_two_a
																		const token_vault_two_b: TokenAccount = dm.token_vault_two_b
																		st64(sff8 + 0x20, ld64(s390 + 0x20))
																		st64(sff8 + 0x28, ld64(s3b0 + 0x10))
																		st64(sff8, token_vault_two_a, token_vault_two_b, dm, dl)
																		st64(s1000, ld64(s390))
																		s = fn_64930(s318, dn, ld64(s390 + 0x18), ld64(s390 + 8), ld64(s1000), token_vault_two_a, token_vault_two_b, dm, dl, ld64(sff8 + 0x20), ld64(sff8 + 0x28))
																		f = ld64(s318 + 8)
																		g = ld64(s318)
																		if (g == 2) {
																			const dr = ld64(ld64(s410 + 0x58) + 0x10)
																			const ds = ld64(ld64(dr))
																			copyr(s78, ds, 0x20)
																			const du = ld64(dr + 0x240)
																			const dt = ld64(dr + 0x238)
																			st64(s48 + 0x18, ld64(s410 + 0x48))
																			st64(s48 + 0x10, ld64(s398))
																			st64(s28 + 0x18, ld64(s410 + 0x50))
																			st64(s28 + 0x10, ld64(s3b0))
																			st64(s60 + 8, ld64(s410 + 0x40))
																			st64(s60 + 0x10, ld64(s3b0 + 8))
																			st64(s48, dt, du)
																			st8(s28 + 0x20, ld64(s390 + 0x28))
																			st64(s28, 0, 0)
																			fn_89078(sc0, s78)
																			copyr(s88, sb8, 0x10)
																			log_data(s88, 1)
																			const dv = ld64(ld64(s410 + 0x58) + 0x18)
																			const dw = ld64(ld64(dv))
																			copyr(s78, dw, 0x20)
																			const dy = ld64(dv + 0x240)
																			const dx = ld64(dv + 0x238)
																			st64(s48 + 0x18, ld64(s410 + 0x18))
																			st64(s48 + 0x10, ld64(s410 + 0x38))
																			st64(s28 + 0x18, ld64(s410 + 0x20))
																			st64(s28 + 0x10, ld64(s410 + 0x28))
																			st64(s60 + 8, ld64(s410 + 0x10))
																			st64(s60 + 0x10, ld64(s410 + 0x30))
																			st64(s48, dx, dy)
																			st8(s28 + 0x20, ld64(s390 + 0x20))
																			st64(s28, 0, 0)
																			fn_89078(sc0, s78)
																			copyr(s88, sb8, 0x10)
																			const ee = log_data(s88, 1)
																			const ea = ld64(s138)
																			const dz = ld64(s148 + 8)
																			rc_dec(dz)
																			rc_dec(ea)
																			const ec = ld64(s1c0)
																			const eb = ld64(s1d0 + 8)
																			rc_dec(eb)
																			rc_dec(ec)
																			if (br != 0) {
																				let ed = bs + 0x18
																				do {
																					if (ld8(ed - 0x14) == 2) {
																						const ef = ld64(ed)
																						st64(ef, ld64(ef) + 1)
																					}
																					ed = ed + 0x78
																					br = br - 1
																				} while (br != 0)
																			}
																			const eh = fn_c710(ld64(s200 + 8), ld64(s200 + 0x10), ee)
																			if (ao == 0) {
																				s = fn_c710(ld64(s248 + 8), ld64(s248 + 0x10), eh)
																				r = ld64(s390 + 0x30)
																				st64(r + 8, undef)
																				st64(r, 2)
																				return s
																			}
																			let eg = ap + 0x18
																			while (true) {
																				if (ld8(eg - 0x14) == 2) {
																					const ei = ld64(eg)
																					st64(ei, ld64(ei) + 1)
																				}
																				eg = eg + 0x78
																				ao = ao - 1
																				if (ao == 0) {
																					s = fn_c710(ld64(s248 + 8), ld64(s248 + 0x10), eh)
																					r = ld64(s390 + 0x30)
																					st64(r + 8, undef)
																					st64(r, 2)
																					return s
																				}
																			}
																		}
																	}
																}
															}
														} else {
															f = ld64(s68)
															g = ld64(s78 + 8)
														}
													}
												} else {
													f = ld64(s78 + 8)
												}
											}
											const cp = ld64(s138)
											const co = ld64(s148 + 8)
											rc_dec(co)
											rc_dec(cp)
										}
									} else {
										f = ld64(s68)
										g = ld64(s78 + 8)
									}
								}
							} else {
								f = ld64(s78 + 8)
							}
							const by = ld64(s1c0)
							const bx = ld64(s1d0 + 8)
							rc_dec(bx)
							rc_dec(by)
						}
						if (br != 0) {
							let bz = bs + 0x18
							do {
								if (ld8(bz - 0x14) == 2) {
									const cb = ld64(bz)
									st64(cb, ld64(cb) + 1)
								}
								bz = bz + 0x78
								br = br - 1
							} while (br != 0)
						}
					}
					let ca = ld64(s200 + 0x10)
					if (ca != 0) {
						let cc = ld64(s200 + 8) + 0x10
						do {
							const ce = ld64(cc)
							const cd = ld64(cc - 8)
							rc_dec(cd)
							s = ld64(ce) - 1
							st64(ce, s)
							if (s == 0) {
								s = ld64(ce + 8) - 1
								st64(ce + 8, s)
							}
							cc = cc + 0x30
							ca = ca - 1
						} while (ca != 0)
					}
					if (ao != 0) {
						let cf = ap + 0x18
						do {
							if (ld8(cf - 0x14) == 2) {
								const ch = ld64(cf)
								st64(ch, ld64(ch) + 1)
							}
							cf = cf + 0x78
							ao = ao - 1
						} while (ao != 0)
					}
				}
				let cg = ld64(s248 + 0x10)
				r = ld64(s390 + 0x30)
				if (cg == 0) {
					st64(r + 8, f)
					st64(r, g)
					return s
				}
				let ci = ld64(s248 + 8) + 0x10
				while (true) {
					const ck = ld64(ci)
					const cj = ld64(ci - 8)
					rc_dec(cj)
					s = ld64(ck) - 1
					st64(ck, s)
					if (s == 0) {
						s = ld64(ck + 8) - 1
						st64(ck + 8, s)
					}
					ci = ci + 0x30
					cg = cg - 1
					if (cg == 0) {
						st64(r + 8, f)
						st64(r, g)
						return s
					}
				}
			}
			abort()
		}
		alloc_handle_alloc_error(8, 0x90)
	}
	s = fn_87630(s2b8, 0x29)
	g = ld64(s2b8)
	st64(r + 8, ld64(s2b8 + 8))
	st64(r, g)
	return s
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool_one, token_owner_account_one_a, token_vault_one_a, token_owner_account_one_b, token_vault_one_b, token_vault_two_b, token_owner_account_two_b, token_vault_two_a, token_owner_account_two_a, whirlpool_two
export function fn_d12a0(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158
	let aj, ak: u64
	fn_6aa0(s28, ld64(b + 0x10), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const f = ld64(s28)
	if (f != 2) {
		ak = Error_with_account_name(s38, f, ld64(s28 + 8), "whirlpool_one", 0xd)
		aj = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, aj)
		return ak
	}
	fn_6aa0(s48, ld64(b + 0x18), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const g = ld64(s48)
	if (g == 2) {
		const h = ld64(ld64(b + 0x20))
		if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
			const i = common_is_closed(h)
			if (i == 0) {
				fn_143448(s18, h, i)
				const k = ld64(s18 + 0x10)
				const j = ld64(s18)
				if (j != 0x800000000000001a /* Ok */) {
					const l = ld64(s18 + 8)
					st64(s18, j, l, k)
					fn_13b430(s68, s18)
					const m = ld64(s68)
					if (m != 2) {
						ak = Error_with_account_name(s78, m, ld64(s68 + 8), "token_owner_account_one_a", 0x19)
						aj = ld64(s78)
						st64(a + 8, ld64(s78 + 8))
						st64(a, aj)
						return ak
					}
				} else {
					st64(k, ld64(k) + 1)
				}
			}
		}
		const r = ld64(ld64(b + 0x28))
		if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
			const s = common_is_closed(r)
			if (s == 0) {
				fn_143448(s18, r, s)
				const u = ld64(s18 + 0x10)
				const t = ld64(s18)
				if (t != 0x800000000000001a /* Ok */) {
					const ad = ld64(s18 + 8)
					st64(s18, t, ad, u)
					fn_13b430(s88, s18)
					const ae = ld64(s88)
					if (ae != 2) {
						ak = Error_with_account_name(s98, ae, ld64(s88 + 8), "token_vault_one_a", 0x11)
						aj = ld64(s98)
						st64(a + 8, ld64(s98 + 8))
						st64(a, aj)
						return ak
					}
				} else {
					st64(u, ld64(u) + 1)
				}
			}
		}
		const v = ld64(ld64(b + 0x30))
		if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
			const w = common_is_closed(v)
			if (w == 0) {
				fn_143448(s18, v, w)
				const y = ld64(s18 + 0x10)
				const x = ld64(s18)
				if (x != 0x800000000000001a /* Ok */) {
					const af = ld64(s18 + 8)
					st64(s18, x, af, y)
					fn_13b430(sa8, s18)
					const ag = ld64(sa8)
					if (ag != 2) {
						ak = Error_with_account_name(sb8, ag, ld64(sa8 + 8), "token_owner_account_one_b", 0x19)
						aj = ld64(sb8)
						st64(a + 8, ld64(sb8 + 8))
						st64(a, aj)
						return ak
					}
				} else {
					st64(y, ld64(y) + 1)
				}
			}
		}
		const z = ld64(ld64(b + 0x38))
		if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
			const aa = common_is_closed(z)
			if (aa == 0) {
				fn_143448(s18, z, aa)
				const ac = ld64(s18 + 0x10)
				const ab = ld64(s18)
				if (ab != 0x800000000000001a /* Ok */) {
					const ah = ld64(s18 + 8)
					st64(s18, ab, ah, ac)
					fn_13b430(sc8, s18)
					const ai = ld64(sc8)
					if (ai != 2) {
						ak = Error_with_account_name(sd8, ai, ld64(sc8 + 8), "token_vault_one_b", 0x11)
						aj = ld64(sd8)
						st64(a + 8, ld64(sd8 + 8))
						st64(a, aj)
						return ak
					}
				} else {
					st64(ac, ld64(ac) + 1)
				}
			}
		}
		fn_6960(se8, ld64(ld64(b + 0x40)), 0x1001520e0 /* &TOKEN_PROGRAM */, c)
		const n = ld64(se8)
		if (n == 2) {
			fn_6960(s108, ld64(ld64(b + 0x48)), 0x1001520e0 /* &TOKEN_PROGRAM */, c)
			const o = ld64(s108)
			if (o == 2) {
				fn_6960(s128, ld64(ld64(b + 0x50)), 0x1001520e0 /* &TOKEN_PROGRAM */, c)
				const p = ld64(s128)
				if (p == 2) {
					ak = fn_6960(s148, ld64(ld64(b + 0x58)), 0x1001520e0 /* &TOKEN_PROGRAM */, c)
					const q = ld64(s148)
					if (q == 2) {
						st64(a + 8, undef)
						st64(a, 2)
						return ak
					}
					ak = Error_with_account_name(s158, q, ld64(s148 + 8), "token_vault_two_b", 0x11)
					aj = ld64(s158)
					st64(a + 8, ld64(s158 + 8))
					st64(a, aj)
					return ak
				}
				ak = Error_with_account_name(s138, p, ld64(s128 + 8), "token_owner_account_two_b", 0x19)
				aj = ld64(s138)
				st64(a + 8, ld64(s138 + 8))
				st64(a, aj)
				return ak
			}
			ak = Error_with_account_name(s118, o, ld64(s108 + 8), "token_vault_two_a", 0x11)
			aj = ld64(s118)
			st64(a + 8, ld64(s118 + 8))
			st64(a, aj)
			return ak
		}
		ak = Error_with_account_name(sf8, n, ld64(se8 + 8), "token_owner_account_two_a", 0x19)
		aj = ld64(sf8)
		st64(a + 8, ld64(sf8 + 8))
		st64(a, aj)
		return ak
	}
	ak = Error_with_account_name(s58, g, ld64(s48 + 8), "whirlpool_two", 0xd)
	aj = ld64(s58)
	st64(a + 8, ld64(s58 + 8))
	st64(a, aj)
	return ak
}
