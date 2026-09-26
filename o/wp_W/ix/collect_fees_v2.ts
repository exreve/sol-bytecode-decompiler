/// <reference path="../lib.d.ts" />
// instruction collect_fees_v2
import { fn_11150, fn_12758, fn_2258, fn_5a40, fn_60480, fn_7a5e0, fn_7e5e0, fn_c9a0, memcpy } from '../shared.ts'

// instruction handler: collect_fees_v2 (discriminator sha256("global:collect_fees_v2")[..8] = 0xfe2b4e5bf5f75cf)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, position, position_token_account, token_mint_a, token_mint_b, token_owner_account_a, token_vault_a, token_owner_account_b, token_vault_b, token_program_b, token_program_a, memo_program, position_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
export function ix_collect_fees_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s18 = fp - 0x18, s158 = fp - 0x158, s160 = fp - 0x160, s170 = fp - 0x170, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308
	let j, k: u64
	sol_log("Instruction: CollectFeesV2", 0x1a)
	st64(s2c8, ix_args, ix_args_len)
	fn_11150(s170, s2c8)
	const h = ld64(s170 + 8)
	const f = ld64(s170)
	if (f == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
		if (2 > (h & 3) - 2) {
			k = anchor_error_from(s308, 0x66 /* anchor::InstructionDidNotDeserialize */)
			j = ld64(s308)
			st64(a + 8, ld64(s308 + 8))
			st64(a, j)
			return k
		}
		if ((h & 3) == 0) {
			k = anchor_error_from(s308, 0x66 /* anchor::InstructionDidNotDeserialize */)
			j = ld64(s308)
			st64(a + 8, ld64(s308 + 8))
			st64(a, j)
			return k
		}
		const i = ld64(ld64(h + 7))
		callx(i, ld64(h - 1), i)
		k = anchor_error_from(s308, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s308)
		st64(a + 8, ld64(s308 + 8))
		st64(a, j)
		return k
	}
	const o = ld64(s160)
	st64(s2d8, accounts, accounts_len)
	k = accounts_collect_fees_v2(s170, undef, s2d8, undef, fp)
	const g = ld32(s170)
	if (g == 2) {
		j = ld64(s170 + 8)
		st64(a + 8, ld64(s160))
		st64(a, j)
		return k
	}
	const n = ld32(s170 + 4)
	const m = ld64(s170 + 8)
	const l = ld64(s160)
	memcpy(s2b0, s158, 0x140)
	st64(s2c0, m, l)
	st32(s2c8, g, n)
	copyr(s160, s2d8, 0x10)
	st64(s170, program_id, s2c8)
	st64(s18, f, h, o)
	k = fn_3b360(s2e8, s170, s18)
	j = ld64(s2e8)
	if (j != 2) {
		st64(a + 8, ld64(s2e8 + 8))
		st64(a, j)
		return k
	}
	k = fn_d46d8(s2f8, s2c8, program_id)
	j = ld64(s2f8)
	st64(a + 8, ld64(s2f8 + 8))
	st64(a, j)
	return k
}

// Anchor Accounts::try_accounts of instruction collect_fees_v2 (called by ix_collect_fees_v2; name [str]: from the handler's "Instruction: …" log; was fn_d23e0)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool, position (ConstraintMut, ConstraintHasOne), position_token_account (ConstraintRaw), token_mint_a (ConstraintAddress), token_mint_b (ConstraintAddress), token_owner_account_a (ConstraintMut, ConstraintRaw), token_vault_a (ConstraintMut, ConstraintAddress), token_owner_account_b (ConstraintMut, ConstraintRaw), token_vault_b (ConstraintMut, ConstraintAddress), token_program_b (ConstraintAddress), token_program_a (ConstraintAddress), memo_program, position_authority
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_token_account_box, token_owner_account_a_box, token_vault_a_box, token_owner_account_b_box, token_vault_b_box, token_vault_a, token_vault_b
export function accounts_collect_fees_v2(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s230 = fp - 0x230, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2d0 = fp - 0x2d0, s310 = fp - 0x310, s330 = fp - 0x330, s370 = fp - 0x370, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s510 = fp - 0x510, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s560 = fp - 0x560, s570 = fp - 0x570, s580 = fp - 0x580, s590 = fp - 0x590, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s708 = fp - 0x708, s730 = fp - 0x730, s738 = fp - 0x738, s740 = fp - 0x740, s748 = fp - 0x748, s750 = fp - 0x750, s758 = fp - 0x758, s760 = fp - 0x760, s768 = fp - 0x768
	let ai, aj: u64
	try_accounts_11a48(s290, c, c, d, e)
	if (ld64(s290) == 0) {
		aj = Error_with_account_name(s6d0, ld64(s288), ld64(s288 + 8), 0x100152b28 /* "whirlpool" */, 9)
		ai = ld64(s6d0)
		st64(a + 0x10, ld64(s6d0 + 8))
		st64(a + 8, ai)
		st32(a, 2)
		return aj
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x290) & -8 : 0x300007d70
	if (g > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, s290, 0x290)
		try_accounts_11718(s290, c)
		const j = ld64(s288)
		const h = ld64(s290)
		if (h == 2) {
			try_accounts_11b00(s290, c)
			if (ld64(s290) == 0) {
				aj = Error_with_account_name(s6c0, ld64(s288), ld64(s288 + 8), "position", 8)
				ai = ld64(s6c0)
				st64(a + 0x10, ld64(s6c0 + 8))
				st64(a + 8, ai)
				st32(a, 2)
				return aj
			}
			const i = ld64(0x300000000 /* heap bump-allocator cursor */)
			const k = i != 0 ? sat_sub(i, 0xd8) & -8 : 0x300007f28
			st64(s6e0, j)
			if (k > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, k)
				st64(s6e0 + 8, k)
				memcpy(k, s290, 0xd8)
				try_accounts_558(s290, c)
				if (ld32(s230 + 0x50) == 2) {
					aj = Error_with_account_name(s6b0, ld64(s290), ld64(s288), "position_token_account", 0x16)
					ai = ld64(s6b0)
					st64(a + 0x10, ld64(s6b0 + 8))
					st64(a + 8, ai)
					st32(a, 2)
					return aj
				}
				const l = ld64(0x300000000 /* heap bump-allocator cursor */)
				const position_token_account_box: TokenAccount_2 = l != 0 ? sat_sub(l, 0xd8) & -8 : 0x300007f28
				if (position_token_account_box > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, position_token_account_box)
					memcpy(position_token_account_box, s290, 0xd8)
					try_accounts_610(s290, c)
					const n = ld32(s290)
					if (n == 2) {
						aj = Error_with_account_name(s6a0, ld64(s288), ld64(s288 + 8), "token_mint_a", 0xc)
						ai = ld64(s6a0)
						st64(a + 0x10, ld64(s6a0 + 8))
						st64(a + 8, ai)
						st32(a, 2)
						return aj
					}
					st64(s708 + 0x18, n)
					copyr(s708, s288, 0x10)
					st64(s708 + 0x10, ld32(s290 + 4))
					memcpy(s370, s278, 0x40)
					copy(s390, s230, 0x20)
					st64(s708 + 0x20, ld64(s278 + 0x40))
					try_accounts_610(s290, c)
					const o = ld32(s290)
					if (o == 2) {
						aj = Error_with_account_name(s690, ld64(s288), ld64(s288 + 8), "token_mint_b", 0xc)
						ai = ld64(s690)
						st64(a + 0x10, ld64(s690 + 8))
						st64(a + 8, ai)
						st32(a, 2)
						return aj
					}
					st64(s730 + 0x18, o)
					copyr(s730, s288, 0x10)
					st64(s730 + 0x10, ld32(s290 + 4))
					memcpy(s310, s278, 0x40)
					copy(s330, s230, 0x20)
					st64(s730 + 0x20, ld64(s278 + 0x40))
					fn_2258(s290, c)
					const token_owner_account_a_box: TokenAccount_2 = ld64(s288)
					const p = ld64(s290)
					if (p == 2) {
						st64(s738, token_owner_account_a_box)
						fn_2258(s290, c, token_owner_account_a_box)
						const token_vault_a_box: TokenAccount_2 = ld64(s288)
						const r = ld64(s290)
						if (r == 2) {
							st64(s740, token_vault_a_box)
							fn_2258(s290, c, token_vault_a_box)
							const token_owner_account_b_box: TokenAccount_2 = ld64(s288)
							const t = ld64(s290)
							if (t == 2) {
								st64(s748, token_owner_account_b_box)
								fn_2258(s290, c, token_owner_account_b_box)
								const token_vault_b_box: TokenAccount_2 = ld64(s288)
								const v = ld64(s290)
								if (v == 2) {
									st64(s750, token_vault_b_box)
									try_accounts_120(s290, c, token_vault_b_box)
									const y = ld64(s288)
									const x = ld64(s290)
									if (x == 2) {
										st64(s758, y)
										try_accounts_120(s290, c, y)
										const aa = ld64(s288)
										const z = ld64(s290)
										if (z == 2) {
											st64(s760, aa)
											fn_12758(s290, c, aa)
											const ac = ld64(s288)
											const ab = ld64(s290)
											if (ab == 2) {
												st64(s768, ac)
												const ad = ld64(s6e0 + 8)
												if (ld8(ld64(ad) + 0x29) == 0) {
													anchor_error_from(s670, 0x7d0 /* anchor::ConstraintMut */, ad)
													aj = Error_with_account_name(s680, ld64(s670), ld64(s670 + 8), "position", 8)
													ai = ld64(s680)
													st64(a + 0x10, ld64(s680 + 8))
													st64(a + 8, ai)
													st32(a, 2)
													return aj
												}
												copyr(s2d0, ad + 8, 0x20)
												const ae = ld64(ld64(g))
												copyr(s2b0, ae, 0x20)
												if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
													anchor_error_from(s420, 0x7d1 /* anchor::ConstraintHasOne */)
													const ah = Error_with_account_name(s430, ld64(s420), ld64(s420 + 8), "position", 8)
													const ag = ld64(s430 + 8)
													const af = ld64(s430)
													copy(s290, s2d0, 0x40)
													aj = fn_13b5c0(s440, af, ag, s290, ah)
													ai = ld64(s440)
													st64(a + 0x10, ld64(s440 + 8))
													st64(a + 8, ai)
													st32(a, 2)
													return aj
												}
												if ((memcmp(position_token_account_box.mint, ad + 0x28, 0x20) as u32) == 0) {
													if (position_token_account_box.amount != 1) {
														anchor_error_from(s470, 0x7d3 /* anchor::ConstraintRaw */)
														aj = Error_with_account_name(s480, ld64(s470), ld64(s470 + 8), "position_token_account", 0x16)
														ai = ld64(s480)
														st64(a + 0x10, ld64(s480 + 8))
														st64(a + 8, ai)
														st32(a, 2)
														return aj
													}
													const ak = ld64(ld64(s708 + 0x20))
													copyr(s2d0, ak, 0x20)
													copyr(s2b0, g + 0x1a8, 0x20)
													if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
														const ao = ld64(ld64(s730 + 0x20))
														copyr(s2d0, ao, 0x20)
														copyr(s2b0, g + 0x1e8, 0x20)
														if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
															if (ld8(ld64(ld64(s738) + 0x20) + 0x29) == 0) {
																anchor_error_from(s650, 0x7d0 /* anchor::ConstraintMut */)
																aj = Error_with_account_name(s660, ld64(s650), ld64(s650 + 8), "token_owner_account_a", 0x15)
																ai = ld64(s660)
																st64(a + 0x10, ld64(s660 + 8))
																st64(a + 8, ai)
																st32(a, 2)
																return aj
															}
															if ((memcmp(ld64(s738) + 0x28, g + 0x1a8, 0x20) as u32) == 0) {
																const token_vault_a: AccountInfo = ld64(ld64(s740) + 0x20)
																if (token_vault_a.is_writable != 0) {
																	const au = token_vault_a.key
																	copyr(s2d0, au, 0x20)
																	copyr(s2b0, g + 0x1c8, 0x20)
																	if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
																		anchor_error_from(s510, 0x7dc /* anchor::ConstraintAddress */)
																		const ax = Error_with_account_name(s520, ld64(s510), ld64(s510 + 8), "token_vault_a", 0xd)
																		const aw = ld64(s520 + 8)
																		const av = ld64(s520)
																		copy(s290, s2d0, 0x40)
																		aj = fn_13b5c0(s530, av, aw, s290, ax)
																		ai = ld64(s530)
																		st64(a + 0x10, ld64(s530 + 8))
																		st64(a + 8, ai)
																		st32(a, 2)
																		return aj
																	}
																	if (ld8(ld64(ld64(s748) + 0x20) + 0x29) == 0) {
																		anchor_error_from(s610, 0x7d0 /* anchor::ConstraintMut */)
																		aj = Error_with_account_name(s620, ld64(s610), ld64(s610 + 8), "token_owner_account_b", 0x15)
																		ai = ld64(s620)
																		st64(a + 0x10, ld64(s620 + 8))
																		st64(a + 8, ai)
																		st32(a, 2)
																		return aj
																	}
																	if ((memcmp(ld64(s748) + 0x28, g + 0x1e8, 0x20) as u32) == 0) {
																		const token_vault_b: AccountInfo = ld64(ld64(s750) + 0x20)
																		if (token_vault_b.is_writable != 0) {
																			const az = token_vault_b.key
																			copyr(s2d0, az, 0x20)
																			copyr(s2b0, g + 0x208, 0x20)
																			if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
																				anchor_error_from(s560, 0x7dc /* anchor::ConstraintAddress */)
																				const bj = Error_with_account_name(s570, ld64(s560), ld64(s560 + 8), "token_vault_b", 0xd)
																				const bi = ld64(s570 + 8)
																				const bh = ld64(s570)
																				copy(s290, s2d0, 0x40)
																				aj = fn_13b5c0(s580, bh, bi, s290, bj)
																				ai = ld64(s580)
																				st64(a + 0x10, ld64(s580 + 8))
																				st64(a + 8, ai)
																				st32(a, 2)
																				return aj
																			}
																			const ba = ld64(ld64(s758))
																			copyr(s2d0, ba, 0x20)
																			AccountInfo_clone(s290, ld64(s708 + 0x20))
																			const bb = ld64(s278)
																			copy(s2b0, bb, 0x20)
																			const bd = ld64(s288 + 8)
																			const bc = ld64(s288)
																			rc_dec(bc)
																			rc_dec(bd)
																			if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
																				const bk = ld64(ld64(s760))
																				copyr(s2d0, bk, 0x20)
																				AccountInfo_clone(s290, ld64(s730 + 0x20))
																				const bl = ld64(s278)
																				copy(s2b0, bl, 0x20)
																				const bn = ld64(s288 + 8)
																				const bm = ld64(s288)
																				rc_dec(bm)
																				rc_dec(bn)
																				if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
																					memcpy(a + 0x18, s370, 0x40)
																					copy(a + 0x60, s390, 0x20)
																					aj = memcpy(a + 0x98, s310, 0x40)
																					const bu = ld64(s330 + 0x18)
																					const bt = ld64(s330 + 0x10)
																					const bs = ld64(s330 + 8)
																					const br = ld64(s330)
																					copy(a + 8, s708, 0x10)
																					st64(a + 0x58, ld64(s708 + 0x20))
																					copy(a + 0x88, s730, 0x10)
																					st64(a + 0xd8, ld64(s730 + 0x20))
																					st64(a + 0x100, g)
																					copy(a + 0x108, s6e0, 0x10)
																					st64(a + 0x118, position_token_account_box)
																					st64(a + 0x120, ld64(s738))
																					st64(a + 0x128, ld64(s740))
																					st64(a + 0x130, ld64(s748))
																					st64(a + 0x138, ld64(s750))
																					st64(a + 0x140, ld64(s758))
																					st64(a + 0x148, ld64(s760))
																					st64(a + 0x150, ld64(s768))
																					st32(a + 0x84, ld64(s730 + 0x10))
																					st32(a + 0x80, ld64(s730 + 0x18))
																					st32(a + 4, ld64(s708 + 0x10))
																					st32(a, ld64(s708 + 0x18))
																					st64(a + 0xe0, br, bs, bt, bu)
																					return aj
																				}
																				anchor_error_from(s5c0, 0x7dc /* anchor::ConstraintAddress */)
																				const bq = Error_with_account_name(s5d0, ld64(s5c0), ld64(s5c0 + 8), "token_program_b", 0xf)
																				const bp = ld64(s5d0 + 8)
																				const bo = ld64(s5d0)
																				copy(s290, s2d0, 0x40)
																				aj = fn_13b5c0(s5e0, bo, bp, s290, bq)
																				ai = ld64(s5e0)
																				st64(a + 0x10, ld64(s5e0 + 8))
																				st64(a + 8, ai)
																				st32(a, 2)
																				return aj
																			}
																			anchor_error_from(s590, 0x7dc /* anchor::ConstraintAddress */)
																			const bg = Error_with_account_name(s5a0, ld64(s590), ld64(s590 + 8), "token_program_a", 0xf)
																			const bf = ld64(s5a0 + 8)
																			const be = ld64(s5a0)
																			copy(s290, s2d0, 0x40)
																			aj = fn_13b5c0(s5b0, be, bf, s290, bg)
																			ai = ld64(s5b0)
																			st64(a + 0x10, ld64(s5b0 + 8))
																			st64(a + 8, ai)
																			st32(a, 2)
																			return aj
																		}
																		anchor_error_from(s5f0, 0x7d0 /* anchor::ConstraintMut */)
																		aj = Error_with_account_name(s600, ld64(s5f0), ld64(s5f0 + 8), "token_vault_b", 0xd)
																		ai = ld64(s600)
																		st64(a + 0x10, ld64(s600 + 8))
																		st64(a + 8, ai)
																		st32(a, 2)
																		return aj
																	}
																	anchor_error_from(s540, 0x7d3 /* anchor::ConstraintRaw */)
																	aj = Error_with_account_name(s550, ld64(s540), ld64(s540 + 8), "token_owner_account_b", 0x15)
																	ai = ld64(s550)
																	st64(a + 0x10, ld64(s550 + 8))
																	st64(a + 8, ai)
																	st32(a, 2)
																	return aj
																}
																anchor_error_from(s630, 0x7d0 /* anchor::ConstraintMut */)
																aj = Error_with_account_name(s640, ld64(s630), ld64(s630 + 8), "token_vault_a", 0xd)
																ai = ld64(s640)
																st64(a + 0x10, ld64(s640 + 8))
																st64(a + 8, ai)
																st32(a, 2)
																return aj
															}
															anchor_error_from(s4f0, 0x7d3 /* anchor::ConstraintRaw */)
															aj = Error_with_account_name(s500, ld64(s4f0), ld64(s4f0 + 8), "token_owner_account_a", 0x15)
															ai = ld64(s500)
															st64(a + 0x10, ld64(s500 + 8))
															st64(a + 8, ai)
															st32(a, 2)
															return aj
														}
														anchor_error_from(s4c0, 0x7dc /* anchor::ConstraintAddress */)
														const ar = Error_with_account_name(s4d0, ld64(s4c0), ld64(s4c0 + 8), "token_mint_b", 0xc)
														const aq = ld64(s4d0 + 8)
														const ap = ld64(s4d0)
														copy(s290, s2d0, 0x40)
														aj = fn_13b5c0(s4e0, ap, aq, s290, ar)
														ai = ld64(s4e0)
														st64(a + 0x10, ld64(s4e0 + 8))
														st64(a + 8, ai)
														st32(a, 2)
														return aj
													}
													anchor_error_from(s490, 0x7dc /* anchor::ConstraintAddress */)
													const an = Error_with_account_name(s4a0, ld64(s490), ld64(s490 + 8), "token_mint_a", 0xc)
													const am = ld64(s4a0 + 8)
													const al = ld64(s4a0)
													copy(s290, s2d0, 0x40)
													aj = fn_13b5c0(s4b0, al, am, s290, an)
													ai = ld64(s4b0)
													st64(a + 0x10, ld64(s4b0 + 8))
													st64(a + 8, ai)
													st32(a, 2)
													return aj
												}
												anchor_error_from(s450, 0x7d3 /* anchor::ConstraintRaw */)
												aj = Error_with_account_name(s460, ld64(s450), ld64(s450 + 8), "position_token_account", 0x16)
												ai = ld64(s460)
												st64(a + 0x10, ld64(s460 + 8))
												st64(a + 8, ai)
												st32(a, 2)
												return aj
											}
											aj = Error_with_account_name(s410, ab, ac, "memo_program", 0xc)
											ai = ld64(s410)
											st64(a + 0x10, ld64(s410 + 8))
											st64(a + 8, ai)
											st32(a, 2)
											return aj
										}
										aj = Error_with_account_name(s400, z, aa, "token_program_b", 0xf)
										ai = ld64(s400)
										st64(a + 0x10, ld64(s400 + 8))
										st64(a + 8, ai)
										st32(a, 2)
										return aj
									}
									aj = Error_with_account_name(s3f0, x, y, "token_program_a", 0xf)
									ai = ld64(s3f0)
									st64(a + 0x10, ld64(s3f0 + 8))
									st64(a + 8, ai)
									st32(a, 2)
									return aj
								}
								aj = Error_with_account_name(s3e0, v, token_vault_b_box, "token_vault_b", 0xd)
								ai = ld64(s3e0)
								st64(a + 0x10, ld64(s3e0 + 8))
								st64(a + 8, ai)
								st32(a, 2)
								return aj
							}
							aj = Error_with_account_name(s3d0, t, token_owner_account_b_box, "token_owner_account_b", 0x15)
							ai = ld64(s3d0)
							st64(a + 0x10, ld64(s3d0 + 8))
							st64(a + 8, ai)
							st32(a, 2)
							return aj
						}
						aj = Error_with_account_name(s3c0, r, token_vault_a_box, "token_vault_a", 0xd)
						ai = ld64(s3c0)
						st64(a + 0x10, ld64(s3c0 + 8))
						st64(a + 8, ai)
						st32(a, 2)
						return aj
					}
					aj = Error_with_account_name(s3b0, p, token_owner_account_a_box, "token_owner_account_a", 0x15)
					ai = ld64(s3b0)
					st64(a + 0x10, ld64(s3b0 + 8))
					st64(a + 8, ai)
					st32(a, 2)
					return aj
				}
				alloc_handle_alloc_error(8, 0xd8)
			}
			alloc_handle_alloc_error(8, 0xd8)
		}
		aj = Error_with_account_name(s3a0, h, j, "position_authority", 0x12)
		ai = ld64(s3a0)
		st64(a + 0x10, ld64(s3a0 + 8))
		st64(a + 8, ai)
		st32(a, 2)
		return aj
	}
	alloc_handle_alloc_error(8, 0x290)
}

// types [heur]: b: CollectFeesV2Context (the handler ix_collect_fees_v2 passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_3b360(a: u64, b: CollectFeesV2Context, c: u64): u64 {
	const s120 = fp - 0x120, s138 = fp - 0x138, s258 = fp - 0x258, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0
	const accounts: CollectFeesV2Accounts = b.accounts
	let u = fn_60480(s280, accounts.position_token_account, accounts + 0x108)
	let g = ld64(s280)
	if (g != 2) {
		st64(a + 8, ld64(s280 + 8))
		st64(a, g)
		return u
	}
	const i = b.remaining_accounts_len
	const remaining_accounts: AccountInfo = b.remaining_accounts
	u = fn_7a5e0(s138, remaining_accounts, i, c, 0x100152bf5, 2, g, b)
	let k = ld64(s138 + 0x10)
	g = ld64(s138 + 8)
	const j = ld64(s138)
	if (j == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
		st64(a + 8, k)
		st64(a, g)
		return u
	}
	memcpy(s258, s120, 0x120)
	st64(s270, j, g, k)
	const l = ld64(accounts + 0x110)
	const m = ld64(l + 0x78)
	st64(l + 0x78, 0)
	const v = ld64(l + 0x80)
	st64(l + 0x80, 0)
	const token_vault_a: TokenAccount_2 = accounts.token_vault_a
	const o = ld64(accounts + 0x100)
	const token_owner_account_a: TokenAccount_2 = accounts.token_owner_account_a
	let t = fn_7e5e0(s290, o, accounts, token_vault_a, token_owner_account_a, accounts + 0x140, accounts + 0x150, s270, m, "Orca CollectFees", 0x10)
	k = ld64(s290 + 8)
	g = ld64(s290)
	if (g == 2) {
		const token_vault_b: TokenAccount_2 = accounts.token_vault_b
		const r = ld64(accounts + 0x100)
		const token_owner_account_b: TokenAccount_2 = accounts.token_owner_account_b
		t = fn_7e5e0(s2a0, r, accounts.token_mint_b, token_vault_b, token_owner_account_b, accounts + 0x148, accounts + 0x150, s258, v, "Orca CollectFees", 0x10)
		k = ld64(s2a0 + 8)
		g = ld64(s2a0)
		if (g != 2) {
			u = fn_c9a0(s270, t)
			st64(a + 8, k)
			st64(a, g)
			return u
		}
		u = fn_c9a0(s270, t)
		st64(a + 8, k)
		st64(a, 2)
		return u
	}
	u = fn_c9a0(s270, t)
	st64(a + 8, k)
	st64(a, g)
	return u
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position, token_owner_account_a, token_vault_a, token_owner_account_b, token_vault_b
export function fn_d46d8(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8
	let r, t: u64
	fn_5a40(s28, ld64(b + 0x110), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const f = ld64(s28)
	if (f != 2) {
		r = Error_with_account_name(s38, f, ld64(s28 + 8), "position", 8)
		t = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, t)
		return r
	}
	const g = ld64(b + 0x120)
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
	const n = ld64(b + 0x128)
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
	const o = ld64(b + 0x130)
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
	const p = ld64(b + 0x138)
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
