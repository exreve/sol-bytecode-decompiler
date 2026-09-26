/// <reference path="../lib.d.ts" />
// instruction swap
import { fn_147e78, fn_14c5c0, fn_20f8, fn_49708, fn_5bad0, fn_5c138, fn_5c328, fn_60de8, fn_62750, fn_64930, fn_6aa0, fn_89078, log_data, memcpy } from '../shared.ts'

// instruction handler: swap (discriminator sha256("global:swap")[..8] = 0xc88775e1919ec6f8)
// accounts [str: the program's account-error strings, in order of first use]: token_program, whirlpool, token_owner_account_a, token_vault_a, token_owner_account_b, tick_array_0, tick_array_1, tick_array_2, oracle, token_vault_b, token_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
export function ix_swap(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s10 = fp - 0x10, s11 = fp - 0x11, s58 = fp - 0x58, s60 = fp - 0x60, s70 = fp - 0x70, sb0 = fp - 0xb0, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s1000 = fp - 0x1000
	let m, p, q, r, s, t: u64
	B9: {
		B8: {
			sol_log("Instruction: Swap", 0x11)
			const f = ix_args_len
			if (f >= 8 && ((f & -8) != 8 && ((f & -0x10) != 0x10 && f != 0x20))) {
				const g = ix_args
				const i = ld64(g)
				const j = ld64(g + 8)
				const u = ld64(g + 0x18)
				const k = ld64(g + 0x10)
				const h = ld8(g + 0x20)
				st8(s11, h)
				if (2 > h) {
					if (f == 0x21) {
						break B8
					}
					const l = ld8(g + 0x21)
					st8(s11, l)
					if (2 > l) {
						st8(s11, 0xff)
						st64(s10, accounts, accounts_len)
						st64(s1000 + 8, s11)
						t = accounts_swap(s70, program_id, s10, j, fp)
						const v = ld64(s70)
						if (v == 0) {
							s = ld64(s70 + 8)
							st64(a + 8, ld64(s60))
							st64(a, s)
							return t
						}
						const x = ld64(s70 + 8)
						const w = ld64(s60)
						memcpy(sb0, s58, 0x40)
						st64(sc8, v, x, w)
						st8(s58 + 8, ld8(s11))
						copyr(s60, s10, 0x10)
						st64(s70, program_id, sc8)
						st64(s1000, k, u, h != 0, l != 0)
						t = fn_36bf8(sd8, s70, i, j, k, u, h != 0, l != 0)
						s = ld64(sd8)
						if (s == 2) {
							t = fn_cc228(se8, sc8, program_id)
							s = ld64(se8)
							st64(a + 8, ld64(se8 + 8))
							st64(a, s)
							return t
						}
						st64(a + 8, ld64(sd8 + 8))
						st64(a, s)
						return t
					}
				}
				st64(s70, 0x100159620)
				st64(s60, s10)
				st64(s10, s11, fn_14ef78)
				st64(s58 + 8, 0)
				st64(s70 + 8, 1)
				st64(s58, 1)
				// fmt "Invalid bool representation: {}" {} = *s11 [fn_14ef78]
				fn_147e78(sc8, s70, i, j, k)
				m = fn_b580(sc8)
				break B9
			}
		}
		m = fn_1459d0(0x100159468)
	}
	const n = m
	if (2 > (m & 3) - 2) {
		t = anchor_error_from(sf8, 0x66 /* anchor::InstructionDidNotDeserialize */, p, q, r)
		s = ld64(sf8)
		st64(a + 8, ld64(sf8 + 8))
		st64(a, s)
		return t
	}
	if ((n & 3) == 0) {
		t = anchor_error_from(sf8, 0x66 /* anchor::InstructionDidNotDeserialize */, p, q, r)
		s = ld64(sf8)
		st64(a + 8, ld64(sf8 + 8))
		st64(a, s)
		return t
	}
	const o = ld64(ld64(m + 7))
	callx(o, ld64(m - 1), o)
	t = anchor_error_from(sf8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	s = ld64(sf8)
	st64(a + 8, ld64(sf8 + 8))
	st64(a, s)
	return t
}

// Anchor Accounts::try_accounts of instruction swap (called by ix_swap; name [str]: from the handler's "Instruction: …" log; was fn_ca7f0)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_program (ConstraintAddress), whirlpool (ConstraintMut), token_owner_account_a (ConstraintMut, ConstraintRaw), token_vault_a (ConstraintMut, ConstraintAddress), token_owner_account_b (ConstraintMut, ConstraintRaw), tick_array_0 (AccountNotEnoughKeys, ConstraintMut), tick_array_1 (ConstraintMut), tick_array_2 (ConstraintMut), oracle (ConstraintSeeds), token_vault_b (ConstraintMut, ConstraintAddress), token_authority
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: token_owner_account_a_box, token_vault_a_box, token_owner_account_b_box, token_vault_b_box, token_program, whirlpool, token_vault_a, token_vault_b
export function accounts_swap(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s270 = fp - 0x270, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2d0 = fp - 0x2d0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s510 = fp - 0x510, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s560 = fp - 0x560, s570 = fp - 0x570, s580 = fp - 0x580, s590 = fp - 0x590, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5e8 = fp - 0x5e8, s5f0 = fp - 0x5f0, s5f8 = fp - 0x5f8, s600 = fp - 0x600, s608 = fp - 0x608, s610 = fp - 0x610, s618 = fp - 0x618, s620 = fp - 0x620, s628 = fp - 0x628, s630 = fp - 0x630, s638 = fp - 0x638
	let u, v, x, y, z, ab, ad, af: u64
	st64(s5e8, b)
	fn_129a0(s290, c, c, d, e)
	const token_program: AccountInfo = ld64(s290 + 8)
	const f = ld64(s290)
	if (f != 2) {
		z = Error_with_account_name(s300, f, token_program, "token_program", 0xd)
		y = ld64(s300)
		st64(a + 0x10, ld64(s300 + 8))
		st64(a + 8, y)
		st64(a, 0)
		return z
	}
	st64(s5f0, ld64(e - 0xff8))
	try_accounts_11718(s290, c)
	const i = ld64(s290 + 8)
	const g = ld64(s290)
	if (g == 2) {
		try_accounts_11a48(s290, c)
		if (ld64(s290) == 0) {
			z = Error_with_account_name(s5e0, ld64(s290 + 8), ld64(s290 + 0x10), 0x100152b28 /* "whirlpool" */, 9)
			y = ld64(s5e0)
			st64(a + 0x10, ld64(s5e0 + 8))
			st64(a + 8, y)
			st64(a, 0)
			return z
		}
		const h = ld64(0x300000000 /* heap bump-allocator cursor */)
		const j = h != 0 ? sat_sub(h, 0x290) & -8 : 0x300007d70
		st64(s600, i)
		if (j > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(s5f8, j)
			memcpy(j, s290, 0x290)
			try_accounts_11f50(s290, c)
			if (ld32(s270 + 0x70) == 2) {
				z = Error_with_account_name(s5d0, ld64(s290), ld64(s290 + 8), "token_owner_account_a", 0x15)
				y = ld64(s5d0)
				st64(a + 0x10, ld64(s5d0 + 8))
				st64(a + 8, y)
				st64(a, 0)
				return z
			}
			const l = ld64(0x300000000 /* heap bump-allocator cursor */)
			const token_owner_account_a_box: TokenAccount = l != 0 ? sat_sub(l, 0xb8) & -8 : 0x300007f48
			if (token_owner_account_a_box > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, token_owner_account_a_box)
				st64(s608, token_owner_account_a_box)
				memcpy(token_owner_account_a_box, s290, 0xb8)
				try_accounts_11f50(s290, c)
				if (ld32(s270 + 0x70) == 2) {
					z = Error_with_account_name(s5c0, ld64(s290), ld64(s290 + 8), "token_vault_a", 0xd)
					y = ld64(s5c0)
					st64(a + 0x10, ld64(s5c0 + 8))
					st64(a + 8, y)
					st64(a, 0)
					return z
				}
				const n = ld64(0x300000000 /* heap bump-allocator cursor */)
				const token_vault_a_box: TokenAccount = n != 0 ? sat_sub(n, 0xb8) & -8 : 0x300007f48
				if (token_vault_a_box > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, token_vault_a_box)
					st64(s610, token_vault_a_box)
					memcpy(token_vault_a_box, s290, 0xb8)
					try_accounts_11f50(s290, c)
					if (ld32(s270 + 0x70) == 2) {
						z = Error_with_account_name(s5b0, ld64(s290), ld64(s290 + 8), "token_owner_account_b", 0x15)
						y = ld64(s5b0)
						st64(a + 0x10, ld64(s5b0 + 8))
						st64(a + 8, y)
						st64(a, 0)
						return z
					}
					const p = ld64(0x300000000 /* heap bump-allocator cursor */)
					const token_owner_account_b_box: TokenAccount = p != 0 ? sat_sub(p, 0xb8) & -8 : 0x300007f48
					if (token_owner_account_b_box > 0x300000007) {
						st64(0x300000000 /* heap bump-allocator cursor */, token_owner_account_b_box)
						memcpy(token_owner_account_b_box, s290, 0xb8)
						fn_20f8(s290, c)
						const token_vault_b_box: TokenAccount = ld64(s290 + 8)
						const r = ld64(s290)
						if (r == 2) {
							B32: {
								B28: {
									B27: {
										st64(s618, token_vault_b_box)
										const t = ld64(c + 8)
										if (t != 0) {
											x = ld64(c)
											st64(c, x + 0x30, t - 1)
											if (t != 1) {
												st64(s620, x)
												ab = ld64(c)
												st64(c, ab + 0x30, t - 2)
												if (t != 2) {
													st64(s628, ab)
													ad = ld64(c)
													st64(c, ad + 0x30, t - 3)
													if (t == 3) {
														break B28
													}
													st64(s630, ad)
													st64(c + 8, t - 4)
													af = ld64(c)
													st64(c, af + 0x30)
													break B32
												}
												break B27
											}
										} else {
											anchor_error_from(s330, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_b_box, u, v)
											x = ld64(s330 + 8)
											const w = ld64(s330)
											if (w != 2) {
												z = Error_with_account_name(s340, w, x, "tick_array_0", 0xc)
												y = ld64(s340)
												st64(a + 0x10, ld64(s340 + 8))
												st64(a + 8, y)
												st64(a, 0)
												return z
											}
										}
										st64(s620, x)
										anchor_error_from(s350, 0xbbd /* anchor::AccountNotEnoughKeys */, x, u, v)
										ab = ld64(s350 + 8)
										const aa = ld64(s350)
										if (aa != 2) {
											z = Error_with_account_name(s360, aa, ab, "tick_array_1", 0xc)
											y = ld64(s360)
											st64(a + 0x10, ld64(s360 + 8))
											st64(a + 8, y)
											st64(a, 0)
											return z
										}
									}
									st64(s628, ab)
									anchor_error_from(s370, 0xbbd /* anchor::AccountNotEnoughKeys */, ab, u, v)
									ad = ld64(s370 + 8)
									const ac = ld64(s370)
									if (ac != 2) {
										z = Error_with_account_name(s380, ac, ad, "tick_array_2", 0xc)
										y = ld64(s380)
										st64(a + 0x10, ld64(s380 + 8))
										st64(a + 8, y)
										st64(a, 0)
										return z
									}
								}
								st64(s630, ad)
								anchor_error_from(s390, 0xbbd /* anchor::AccountNotEnoughKeys */, ad, u, v)
								af = ld64(s390 + 8)
								const ae = ld64(s390)
								if (ae != 2) {
									z = Error_with_account_name(s3a0, ae, af, 0x100154c38 /* "oracle" */, 6)
									y = ld64(s3a0)
									st64(a + 0x10, ld64(s3a0 + 8))
									st64(a + 8, y)
									st64(a, 0)
									return z
								}
							}
							st64(s638, af)
							const ag = token_program.key
							copyr(s2b0, ag, 0x20)
							if ((memcmp(s2b0, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) == 0) {
								const ak = ld64(s5f8)
								const whirlpool: AccountInfo = ld64(ak)
								if (whirlpool.is_writable == 0) {
									anchor_error_from(s590, 0x7d0 /* anchor::ConstraintMut */)
									z = Error_with_account_name(s5a0, ld64(s590), ld64(s590 + 8), 0x100152b28 /* "whirlpool" */, 9)
									y = ld64(s5a0)
									st64(a + 0x10, ld64(s5a0 + 8))
									st64(a + 8, y)
									st64(a, 0)
									return z
								}
								const am: TokenAccount = ld64(s608)
								if (am.info.is_writable != 0) {
									if ((memcmp(am.mint, ak + 0x1a8, 0x20) as u32) == 0) {
										const token_vault_a: AccountInfo = ld64(ld64(s610))
										if (token_vault_a.is_writable != 0) {
											const ao = token_vault_a.key
											copyr(s2d0, ao, 0x20)
											const ap = ld64(s5f8)
											copyr(s2b0, ap + 0x1c8, 0x20)
											if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
												anchor_error_from(s400, 0x7dc /* anchor::ConstraintAddress */)
												const at = Error_with_account_name(s410, ld64(s400), ld64(s400 + 8), "token_vault_a", 0xd)
												const ar = ld64(s410 + 8)
												const aq = ld64(s410)
												copy(s290, s2d0, 0x40)
												z = fn_13b5c0(s420, aq, ar, s290, at)
												y = ld64(s420)
												st64(a + 0x10, ld64(s420 + 8))
												st64(a + 8, y)
												st64(a, 0)
												return z
											}
											if (token_owner_account_b_box.info.is_writable == 0) {
												anchor_error_from(s530, 0x7d0 /* anchor::ConstraintMut */)
												z = Error_with_account_name(s540, ld64(s530), ld64(s530 + 8), "token_owner_account_b", 0x15)
												y = ld64(s540)
												st64(a + 0x10, ld64(s540 + 8))
												st64(a + 8, y)
												st64(a, 0)
												return z
											}
											if ((memcmp(token_owner_account_b_box.mint, ld64(s5f8) + 0x1e8, 0x20) as u32) == 0) {
												const token_vault_b: AccountInfo = ld64(ld64(s618))
												if (token_vault_b.is_writable != 0) {
													const av = token_vault_b.key
													copyr(s2d0, av, 0x20)
													const aw = ld64(s5f8)
													copyr(s2b0, aw + 0x208, 0x20)
													if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
														anchor_error_from(s450, 0x7dc /* anchor::ConstraintAddress */)
														const az = Error_with_account_name(s460, ld64(s450), ld64(s450 + 8), "token_vault_b", 0xd)
														const ay = ld64(s460 + 8)
														const ax = ld64(s460)
														copy(s290, s2d0, 0x40)
														z = fn_13b5c0(s470, ax, ay, s290, az)
														y = ld64(s470)
														st64(a + 0x10, ld64(s470 + 8))
														st64(a + 8, y)
														st64(a, 0)
														return z
													}
													if (ld8(ld64(s620) + 0x29) == 0) {
														anchor_error_from(s4f0, 0x7d0 /* anchor::ConstraintMut */)
														z = Error_with_account_name(s500, ld64(s4f0), ld64(s4f0 + 8), "tick_array_0", 0xc)
														y = ld64(s500)
														st64(a + 0x10, ld64(s500 + 8))
														st64(a + 8, y)
														st64(a, 0)
														return z
													}
													if (ld8(ld64(s628) + 0x29) != 0) {
														if (ld8(ld64(s630) + 0x29) != 0) {
															const ba = whirlpool.key
															copyr(s2b0, ba, 0x20)
															st64(s2d0, 0x100154c38, 6, s2b0, 0x20)
															// PDA find_program_address(["oracle", *ba], program *(ld64(s5e8)))
															Pubkey_find_program_address(s290, s2d0, 2, ld64(s5e8))
															copyr(s2f0, s290, 0x20)
															st8(ld64(s5f0), ld8(s270))
															const bb = ld64(ld64(s638))
															copyr(s290, bb, 0x20)
															z = memcmp(s290, s2f0, 0x20) as u32
															if (z != 0) {
																anchor_error_from(s480, 0x7d6 /* anchor::ConstraintSeeds */)
																const be = Error_with_account_name(s490, ld64(s480), ld64(s480 + 8), 0x100154c38 /* "oracle" */, 6)
																const bd = ld64(s490 + 8)
																const bc = ld64(s490)
																copyr(s290, bb, 0x20)
																copy(s270, s2f0, 0x20)
																z = fn_13b5c0(s4a0, bc, bd, s290, be)
																y = ld64(s4a0)
																st64(a + 0x10, ld64(s4a0 + 8))
																st64(a + 8, y)
																st64(a, 0)
																return z
															}
															st64(a + 0x50, ld64(s638))
															st64(a + 0x48, ld64(s630))
															st64(a + 0x40, ld64(s628))
															st64(a + 0x38, ld64(s620))
															st64(a + 0x30, ld64(s618))
															st64(a + 0x28, token_owner_account_b_box)
															st64(a + 0x20, ld64(s610))
															st64(a + 0x18, ld64(s608))
															st64(a + 0x10, ld64(s5f8))
															st64(a + 8, ld64(s600))
															st64(a, token_program)
															return z
														}
														anchor_error_from(s4b0, 0x7d0 /* anchor::ConstraintMut */)
														z = Error_with_account_name(s4c0, ld64(s4b0), ld64(s4b0 + 8), "tick_array_2", 0xc)
														y = ld64(s4c0)
														st64(a + 0x10, ld64(s4c0 + 8))
														st64(a + 8, y)
														st64(a, 0)
														return z
													}
													anchor_error_from(s4d0, 0x7d0 /* anchor::ConstraintMut */)
													z = Error_with_account_name(s4e0, ld64(s4d0), ld64(s4d0 + 8), "tick_array_1", 0xc)
													y = ld64(s4e0)
													st64(a + 0x10, ld64(s4e0 + 8))
													st64(a + 8, y)
													st64(a, 0)
													return z
												}
												anchor_error_from(s510, 0x7d0 /* anchor::ConstraintMut */)
												z = Error_with_account_name(s520, ld64(s510), ld64(s510 + 8), "token_vault_b", 0xd)
												y = ld64(s520)
												st64(a + 0x10, ld64(s520 + 8))
												st64(a + 8, y)
												st64(a, 0)
												return z
											}
											anchor_error_from(s430, 0x7d3 /* anchor::ConstraintRaw */)
											z = Error_with_account_name(s440, ld64(s430), ld64(s430 + 8), "token_owner_account_b", 0x15)
											y = ld64(s440)
											st64(a + 0x10, ld64(s440 + 8))
											st64(a + 8, y)
											st64(a, 0)
											return z
										}
										anchor_error_from(s550, 0x7d0 /* anchor::ConstraintMut */)
										z = Error_with_account_name(s560, ld64(s550), ld64(s550 + 8), "token_vault_a", 0xd)
										y = ld64(s560)
										st64(a + 0x10, ld64(s560 + 8))
										st64(a + 8, y)
										st64(a, 0)
										return z
									}
									anchor_error_from(s3e0, 0x7d3 /* anchor::ConstraintRaw */)
									z = Error_with_account_name(s3f0, ld64(s3e0), ld64(s3e0 + 8), "token_owner_account_a", 0x15)
									y = ld64(s3f0)
									st64(a + 0x10, ld64(s3f0 + 8))
									st64(a + 8, y)
									st64(a, 0)
									return z
								}
								anchor_error_from(s570, 0x7d0 /* anchor::ConstraintMut */, am)
								z = Error_with_account_name(s580, ld64(s570), ld64(s570 + 8), "token_owner_account_a", 0x15)
								y = ld64(s580)
								st64(a + 0x10, ld64(s580 + 8))
								st64(a + 8, y)
								st64(a, 0)
								return z
							}
							anchor_error_from(s3b0, 0x7dc /* anchor::ConstraintAddress */)
							const aj = Error_with_account_name(s3c0, ld64(s3b0), ld64(s3b0 + 8), "token_program", 0xd)
							const ai = ld64(s3c0 + 8)
							const ah = ld64(s3c0)
							copyr(s290, s2b0, 0x20)
							st64(s270, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
							z = fn_13b5c0(s3d0, ah, ai, s290, aj)
							y = ld64(s3d0)
							st64(a + 0x10, ld64(s3d0 + 8))
							st64(a + 8, y)
							st64(a, 0)
							return z
						}
						z = Error_with_account_name(s320, r, token_vault_b_box, "token_vault_b", 0xd)
						y = ld64(s320)
						st64(a + 0x10, ld64(s320 + 8))
						st64(a + 8, y)
						st64(a, 0)
						return z
					}
					alloc_handle_alloc_error(8, 0xb8)
				}
				alloc_handle_alloc_error(8, 0xb8)
			}
			alloc_handle_alloc_error(8, 0xb8)
		}
		alloc_handle_alloc_error(8, 0x290)
	}
	z = Error_with_account_name(s310, g, i, "token_authority", 0xf)
	y = ld64(s310)
	st64(a + 0x10, ld64(s310 + 8))
	st64(a + 8, y)
	st64(a, 0)
	return z
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value), p7 (value), p8 (value)
// types [heur]: b: SwapContext (the handler ix_swap passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_36bf8(a: u64, b: SwapContext, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s58 = fp - 0x58, s60 = fp - 0x60, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, sb8 = fp - 0xb8, sc0 = fp - 0xc0, se8 = fp - 0xe8, sf9 = fp - 0xf9, s109 = fp - 0x109, s110 = fp - 0x110, s138 = fp - 0x138, s148 = fp - 0x148, s160 = fp - 0x160, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8
	let g, l: u64
	const accounts: SwapAccounts = b.accounts
	clock_get_13f308(s78)
	if (ld64(s78) != 0) {
		const k = ld64(s78 + 8)
		const j = ld64(s68)
		st64(s68, ld64(s60))
		st64(s78, k, j)
		l = fn_13b430(s188, s78)
		g = ld64(s188)
		st64(a + 8, ld64(s188 + 8))
		st64(a, g)
		return l
	}
	let cn = d
	const bz = p6
	const r = p5
	const co = p8
	const q = p7
	let f = ld64(s58 + 8)
	if (-1 >= (f as i64)) {
		l = fn_87630(s198, 0x15)
		f = ld64(s198 + 8)
		g = ld64(s198)
		if (g != 2) {
			st64(a + 8, f)
			st64(a, g)
			return l
		}
	}
	const h = ld64(0x300000000 /* heap bump-allocator cursor */)
	const i = h != 0 ? sat_sub(h, 0x90) & -8 : 0x300007f70
	if (i > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, i)
		const n: AccountInfo = ld64(accounts + 0x38)
		const o: LamportsCell = n.lamports
		let cl = n.key
		rc_inc(o)
		const p: DataCell = n.data
		let cm = q
		let ck = o
		rc_inc(p)
		const s: AccountInfo = ld64(accounts + 0x40)
		const t: LamportsCell = s.lamports
		let cp = t
		const cf = n.executable
		const cg = n.is_writable
		const ch = n.is_signer
		const ci = n.rent_epoch
		let cj = n.owner
		const z = s.key
		rc_inc(t)
		const u: DataCell = s.data
		rc_inc(u)
		const v: AccountInfo = ld64(accounts + 0x48)
		const w: LamportsCell = v.lamports
		const ca = s.executable
		const cb = s.is_writable
		const cc = s.is_signer
		const cd = s.rent_epoch
		const ce = s.owner
		const ae = v.key
		rc_inc(w)
		const x: DataCell = v.data
		const y = x.strong
		const by = f
		x.strong = y + 1
		if (y != -1) {
			const ad = v.owner
			const ac = v.rent_epoch
			const ab = v.is_signer
			const aa = v.is_writable
			st8(i + 0x8a, v.executable)
			st8(i + 0x89, aa)
			st8(i + 0x88, ab)
			st64(i + 0x80, ac)
			st64(i + 0x78, ad)
			st64(i + 0x70, x)
			st64(i + 0x68, w)
			st64(i + 0x60, ae)
			st8(i + 0x5a, ca)
			st8(i + 0x59, cb)
			st8(i + 0x58, cc)
			st64(i + 0x50, cd)
			st64(i + 0x48, ce)
			st64(i + 0x40, u)
			st64(i + 0x38, cp)
			st64(i + 0x30, z)
			st8(i + 0x2a, cf)
			st8(i + 0x29, cg)
			st8(i + 0x28, ch)
			st64(i + 0x20, ci)
			st64(i + 0x18, cj)
			st64(i + 0x10, p)
			st64(i + 8, ck)
			st64(i, cl)
			st64(s110, 3, i, 3)
			st64(s78, 0x8000000000000000)
			fn_60de8(s178, s110, s78, x, aa, ad)
			l = fn_62750(s78, s178, ld64(accounts + 0x10), co)
			let af = ld64(s68)
			const ag = ld64(s78 + 8)
			const ah = ld64(s78)
			let at = af
			g = ag
			if (ah != 0x8000000000000000) {
				st64(s160, ah, ag, af)
				const ai: AccountInfo = ld64(accounts + 0x50)
				const aj: LamportsCell = ai.lamports
				const aq = ld64(accounts + 0x10)
				const al = ai.key
				rc_inc(aj)
				const ak: DataCell = ai.data
				cp = al
				rc_inc(ak)
				const ap = ai.owner
				const ao = ai.rent_epoch
				const an = ai.is_signer
				const am = ai.is_writable
				st8(se8 + 2, ai.executable)
				st8(se8, an, am)
				st64(s110, cp, aj, ak, ap, ao)
				l = fn_5bad0(s78, aq, s110)
				at = ld64(s78 + 8)
				g = ld64(s78)
				const ar = ld8(s58 + 0x10)
				if (ar != 2) {
					B38: {
						copyr(s138, s68, 0x20)
						st32(s138 + 0x21, ld32(s58 + 0x11))
						st32(s138 + 0x24, ld32(s58 + 0x14))
						st64(s148, g, at)
						at = 1
						st8(s138 + 0x20, ar)
						if (ar != 0) {
							l = AccountInfo_try_borrow_data(s78, s148, l)
							const ax = ld64(s68)
							const av = ld64(s78 + 8)
							const au = ld64(s78)
							if (au != 0x800000000000001a /* Ok */) {
								st64(s78, au, av, ax)
								l = fn_13b430(s1a8, s78)
								at = ld64(s1a8 + 8)
								g = ld64(s1a8)
								if (g != 2) {
									break B38
								}
							} else {
								const aw = ld64(av + 8)
								if (0xfd >= aw) {
									fn_14c5c0(0xfe, aw, 0x100159ee8, 0x800000000000001a /* Ok */)
								}
								at = by >= ld64(ld64(av) + 0x28)
								st64(ax, ld64(ax) - 1)
							}
						}
						if ((at as u8) != 0) {
							l = fn_5c138(s78, s148, l)
							if (ld8(s78) == 0) {
								st32(s110 + 3, ld32(s78 + 4))
								st32(s110, ld32(s78 + 1))
								cp = ld64(s78 + 8)
								const ay = ld64(s68)
								memcpy(sc0, s60, 0x38)
								st64(s109, cp, ay)
								memcpy(sf9, sc0, 0x38)
								const ba = ld64(accounts + 0x10)
								const az = cm
								l = fn_49708(s78, ba + 8, s160, c, r, bz, cm, co, by, s110)
								const bb = ld64(s78 + 8)
								g = ld64(s78)
								at = bb
								if (g == 2) {
									B33: {
										if (az != 0) {
											if (co != 0) {
												if (ld64(bb + 8) >= cn) {
													break B33
												}
											} else if (ld64(bb) >= cn) {
												break B33
											}
											l = fn_87630(s1e8, 0x24)
											at = ld64(s1e8 + 8)
											g = ld64(s1e8)
											break B38
										}
										if (co != 0) {
											if (cn >= ld64(bb)) {
												break B33
											}
										} else if (cn >= ld64(bb + 8)) {
											break B33
										}
										l = fn_87630(s1b8, 0x25)
										at = ld64(s1b8 + 8)
										g = ld64(s1b8)
										break B38
									}
									l = fn_5c328(s1c8, s148, bb + 0x1d4, undef, undef, l)
									at = ld64(s1c8 + 8)
									g = ld64(s1c8)
									if (g == 2) {
										cp = ld64(bb + (co != 0 ? 0 : 8))
										ck = ld64(bb + (co != 0 ? 8 : 0))
										cl = ld64(bb + 0x1c8)
										cm = ld64(bb + 0x10)
										const bk = ld64(accounts + 0x10)
										cn = ld64(bk + 0x240)
										cj = ld64(bk + 0x238)
										const token_owner_account_a: TokenAccount = accounts.token_owner_account_a
										const token_owner_account_b: TokenAccount = accounts.token_owner_account_b
										const token_vault_a: TokenAccount = accounts.token_vault_a
										const token_vault_b: TokenAccount = accounts.token_vault_b
										l = fn_64930(s1d8, bk, accounts + 8, token_owner_account_a, token_owner_account_b, token_vault_a, token_vault_b, accounts, bb, co, by)
										at = ld64(s1d8 + 8)
										g = ld64(s1d8)
										if (g == 2) {
											const bp = ld64(accounts + 0x10)
											const bq = ld64(ld64(bp))
											copyr(s78, bq, 0x20)
											const bs = ld64(bp + 0x240)
											const br = ld64(bp + 0x238)
											st64(s38, cp, ck)
											st64(s18, cm, cl)
											st64(s58, cj, cn, br, bs)
											st8(s18 + 0x10, co)
											st64(s28, 0, 0)
											fn_89078(sc0, s78)
											copyr(s88, sb8, 0x10)
											const bw = log_data(s88, 1)
											const bu = ld64(s138)
											const bt = ld64(s148 + 8)
											rc_dec(bt)
											rc_dec(bu)
											if (af == 0) {
												l = fn_c710(ld64(s178 + 8), ld64(s178 + 0x10), bw)
												st64(a + 8, undef)
												st64(a, 2)
												return l
											}
											let bv = ag + 0x18
											while (true) {
												if (ld8(bv - 0x14) == 2) {
													const bx = ld64(bv)
													st64(bx, ld64(bx) + 1)
												}
												bv = bv + 0x78
												af = af - 1
												if (af == 0) {
													l = fn_c710(ld64(s178 + 8), ld64(s178 + 0x10), bw)
													st64(a + 8, undef)
													st64(a, 2)
													return l
												}
											}
										}
									}
								}
							} else {
								at = ld64(s68)
								g = ld64(s78 + 8)
							}
						} else {
							l = fn_87630(s1f8, 0x40)
							at = ld64(s1f8 + 8)
							g = ld64(s1f8)
						}
					}
					const bd = ld64(s138)
					const bc = ld64(s148 + 8)
					rc_dec(bc)
					rc_dec(bd)
				}
				if (af != 0) {
					let be = ag + 0x18
					do {
						if (ld8(be - 0x14) == 2) {
							const bg = ld64(be)
							st64(bg, ld64(bg) + 1)
						}
						be = be + 0x78
						af = af - 1
					} while (af != 0)
				}
			}
			let bf = ld64(s178 + 0x10)
			if (bf == 0) {
				st64(a + 8, at)
				st64(a, g)
				return l
			}
			let bh = ld64(s178 + 8) + 0x10
			while (true) {
				const bj = ld64(bh)
				const bi = ld64(bh - 8)
				rc_dec(bi)
				l = ld64(bj) - 1
				st64(bj, l)
				if (l == 0) {
					l = ld64(bj + 8) - 1
					st64(bj + 8, l)
				}
				bh = bh + 0x30
				bf = bf - 1
				if (bf == 0) {
					st64(a + 8, at)
					st64(a, g)
					return l
				}
			}
		}
		abort()
	}
	alloc_handle_alloc_error(8, 0x90)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool, token_owner_account_a, token_vault_a, token_owner_account_b, token_vault_b
export function fn_cc228(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8
	let n, p: u64
	fn_6aa0(s28, ld64(b + 0x10), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const f = ld64(s28)
	if (f != 2) {
		n = Error_with_account_name(s38, f, ld64(s28 + 8), 0x100152b28 /* "whirlpool" */, 9)
		p = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, p)
		return n
	}
	const g = ld64(ld64(b + 0x18))
	if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
		const h = common_is_closed(g)
		if (h == 0) {
			fn_143448(s18, g, h)
			const j = ld64(s18 + 0x10)
			const i = ld64(s18)
			if (i != 0x800000000000001a /* Ok */) {
				const k = ld64(s18 + 8)
				st64(s18, i, k, j)
				fn_13b430(s48, s18)
				const l = ld64(s48)
				if (l != 2) {
					n = Error_with_account_name(s58, l, ld64(s48 + 8), "token_owner_account_a", 0x15)
					p = ld64(s58)
					st64(a + 8, ld64(s58 + 8))
					st64(a, p)
					return n
				}
			} else {
				st64(j, ld64(j) + 1)
			}
		}
	}
	const q = ld64(ld64(b + 0x20))
	if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
		const r = common_is_closed(q)
		if (r == 0) {
			fn_143448(s18, q, r)
			const t = ld64(s18 + 0x10)
			const s = ld64(s18)
			if (s != 0x800000000000001a /* Ok */) {
				const aa = ld64(s18 + 8)
				st64(s18, s, aa, t)
				fn_13b430(s68, s18)
				const ab = ld64(s68)
				if (ab != 2) {
					n = Error_with_account_name(s78, ab, ld64(s68 + 8), "token_vault_a", 0xd)
					p = ld64(s78)
					st64(a + 8, ld64(s78 + 8))
					st64(a, p)
					return n
				}
			} else {
				st64(t, ld64(t) + 1)
			}
		}
	}
	const u = ld64(ld64(b + 0x28))
	if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
		const v = common_is_closed(u)
		if (v == 0) {
			fn_143448(s18, u, v)
			const x = ld64(s18 + 0x10)
			const w = ld64(s18)
			if (w != 0x800000000000001a /* Ok */) {
				const ac = ld64(s18 + 8)
				st64(s18, w, ac, x)
				fn_13b430(s88, s18)
				const ad = ld64(s88)
				if (ad != 2) {
					n = Error_with_account_name(s98, ad, ld64(s88 + 8), "token_owner_account_b", 0x15)
					p = ld64(s98)
					st64(a + 8, ld64(s98 + 8))
					st64(a, p)
					return n
				}
			} else {
				st64(x, ld64(x) + 1)
			}
		}
	}
	const y = ld64(ld64(b + 0x30))
	const m = memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20)
	let o = undef
	n = m as u32
	if (n != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return n
	}
	n = common_is_closed(y)
	o = undef
	if (n != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return n
	}
	n = fn_143448(s18, y, n)
	o = ld64(s18 + 0x10)
	const z = ld64(s18)
	if (z != 0x800000000000001a /* Ok */) {
		const ae = ld64(s18 + 8)
		st64(s18, z, ae, o)
		n = fn_13b430(sa8, s18)
		o = undef
		const af = ld64(sa8)
		if (af == 2) {
			st64(a + 8, o)
			st64(a, 2)
			return n
		}
		n = Error_with_account_name(sb8, af, ld64(sa8 + 8), "token_vault_b", 0xd)
		p = ld64(sb8)
		st64(a + 8, ld64(sb8 + 8))
		st64(a, p)
		return n
	}
	st64(o, ld64(o) + 1)
	st64(a + 8, o)
	st64(a, 2)
	return n
}
