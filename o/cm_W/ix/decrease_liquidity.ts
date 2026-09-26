/// <reference path="../lib.d.ts" />
// instruction decrease_liquidity
import { anchor_error_from, fn_1008, fn_13e628, fn_2d880, fn_4130, fn_4bd8, fn_4dc0, fn_a80, fn_b4e0, memcpy } from '../shared.ts'

// instruction handler: decrease_liquidity (discriminator sha256("global:decrease_liquidity")[..8] = 0x12c5b686fd026a0)
// accounts [idl]: 0 nft_owner [signer], 1 nft_account, 2 personal_position [mut], 3 pool_state [mut], 4 protocol_position, 5 token_vault_0 [mut], 6 token_vault_1 [mut], 7 tick_array_lower [mut], 8 tick_array_upper [mut], 9 recipient_token_account_0 [mut], 10 recipient_token_account_1 [mut], 11 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA]
// args [idl]: liquidity: u128, amount_0_min: u64, amount_1_min: u64
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, amount_0_min, amount_1_min
export function ix_decrease_liquidity(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s48 = fp - 0x48, s50 = fp - 0x50, s60 = fp - 0x60, sa8 = fp - 0xa8, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s100 = fp - 0x100, s1000 = fp - 0x1000
	let l, o: u64
	const i = sol_log(0x10015ba60 /* "Instruction: DecreaseLiquidity" */, 0x1e)
	const f = ix_args_len
	if (f >= 0x10 && ((f & -8) != 0x10 && (f & -8) != 0x18)) {
		const args: DecreaseLiquidityArgs = ix_args
		const r = ld64(args.liquidity + 8)
		const q = ld64(args.liquidity)
		const amount_0_min = args.amount_0_min
		const amount_1_min = args.amount_1_min
		st64(sd0, accounts, accounts_len)
		o = accounts_decrease_liquidity(s60, amount_0_min, sd0, undef, fp, i)
		const k = ld64(s50)
		l = ld64(s60 + 8)
		const j = ld64(s60)
		if (j == 0) {
			st64(a + 8, k)
			st64(a, l)
			return o
		}
		memcpy(sa8, s48, 0x48)
		st64(sc0, j, l, k)
		copyr(s50, sd0, 0x10)
		st64(s60, program_id, sc0)
		st64(s1000, amount_0_min, amount_1_min)
		o = fn_2cfa8(se0, s60, q, r, amount_0_min, amount_1_min)
		l = ld64(se0)
		if (l == 2) {
			o = fn_b15c0(sf0, sc0, program_id)
			l = ld64(sf0)
			st64(a + 8, ld64(sf0 + 8))
			st64(a, l)
			return o
		}
		st64(a + 8, ld64(se0 + 8))
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

// Anchor Accounts::try_accounts of instruction decrease_liquidity (called by ix_decrease_liquidity; name [str]: from the handler's "Instruction: …" log; was fn_af4e8)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_vault_0 (ConstraintMut, ConstraintRaw), token_vault_1 (ConstraintMut, ConstraintRaw), tick_array_lower (ConstraintMut, ConstraintRaw), tick_array_upper (ConstraintMut, ConstraintRaw), recipient_token_account_0 (ConstraintMut), recipient_token_account_1 (ConstraintTokenMint, ConstraintMut), token_program, nft_account (ConstraintRaw), pool_state (ConstraintMut), personal_position (ConstraintMut, ConstraintRaw)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: recipient_token_account_1_box, token_vault_1_box, token_vault_0, token_vault_1
export function accounts_decrease_liquidity(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s120 = fp - 0x120, s138 = fp - 0x138, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f0 = fp - 0x3f0, s3f8 = fp - 0x3f8, s400 = fp - 0x400, s408 = fp - 0x408, s410 = fp - 0x410, s418 = fp - 0x418, s420 = fp - 0x420, s428 = fp - 0x428, s430 = fp - 0x430, s438 = fp - 0x438
	let s, t, u, v, w, x, aj, ak, am, an, ap, aq, at, au, aw, ax, ba: u64
	let recipient_token_account_1_box: TokenAccount_2
	let q = try_accounts_17a30(s120, c, c, d, e, r0)
	const i = ld64(s120 + 8)
	let f = ld64(s120)
	if (f == 2) {
		q = try_accounts_182b0(s120, c)
		if (ld32(s120 + 0x90) == 2) {
			const l = ld64(0x300000000 /* heap bump-allocator cursor */)
			f = ld64(s120)
			const m = l != 0 ? sat_sub(l, 0xb) : 0x300007ff5
			recipient_token_account_1_box = ld64(s120 + 8)
			if (f != 0) {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m, 0x6f6363615f74666e)
				st32(m + 7, 0x746e756f)
				void recipient_token_account_1_box.info
			} else {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m, 0x6f6363615f74666e)
				st32(m + 7, 0x746e756f)
				void recipient_token_account_1_box.info
			}
			st64(recipient_token_account_1_box.mint + 8, m, 0xb)
			st64(recipient_token_account_1_box.mint, 0xb)
			st64(recipient_token_account_1_box, 1)
			st64(a + 0x10, recipient_token_account_1_box)
			st64(a + 8, f)
			st64(a, 0)
			return q
		}
		const j = ld64(0x300000000 /* heap bump-allocator cursor */)
		const k = j != 0 ? sat_sub(j, 0xb8) : 0x300007f48
		if (0x300000008 > k) {
			alloc_handle_alloc_error(8, 0xb8)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, k & -8)
		if ((k & -8) != 0) {
			memcpy(k & -8, s120, 0xb8)
			q = try_accounts_18368(s120, c)
			let ah = undef
			if (ld64(s120) == 0) {
				const z = ld64(0x300000000 /* heap bump-allocator cursor */)
				f = ld64(s120 + 8)
				const aa = z != 0 ? sat_sub(z, 0x11) : 0x300007fef
				recipient_token_account_1_box = ld64(s120 + 0x10)
				if (f != 0) {
					if (0x300000008 > aa) {
						raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, ah)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, aa)
					st64(aa + 8, 0x6f697469736f705f)
					st64(aa, 0x6c616e6f73726570)
					st8(aa + 0x10, 0x6e)
					void recipient_token_account_1_box.info
				} else {
					if (0x300000008 > aa) {
						raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, ah)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, aa)
					st64(aa + 8, 0x6f697469736f705f)
					st64(aa, 0x6c616e6f73726570)
					st8(aa + 0x10, 0x6e)
					void recipient_token_account_1_box.info
				}
				st64(recipient_token_account_1_box.mint + 8, aa, 0x11)
				st64(recipient_token_account_1_box.mint, 0x11)
				st64(recipient_token_account_1_box, 1)
				st64(a + 0x10, recipient_token_account_1_box)
				st64(a + 8, f)
				st64(a, 0)
				return q
			}
			const o = ld64(0x300000000 /* heap bump-allocator cursor */)
			const p = o != 0 ? sat_sub(o, 0x120) : 0x300007ee0
			if (0x300000008 > p) {
				alloc_handle_alloc_error(8, 0x120)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, p & -8)
			if ((p & -8) != 0) {
				st64(s3f0, p & -8)
				memcpy(p & -8, s120, 0x120)
				fn_11e0(s120, c)
				q = ld64(s120 + 8)
				f = ld64(s120)
				if (f == 2) {
					st64(s400, q)
					const r = ld64(c + 8)
					if (r == 0) {
						anchor_error_from(s168, 0xbbd /* anchor::AccountNotEnoughKeys */, s, t, u)
						q = ld64(s168 + 8)
						f = ld64(s168)
						if (f != 2) {
							const ag = ld64(0x300000000 /* heap bump-allocator cursor */)
							ah = 0x11 > ag
							const ab = ah != 0 ? 0 : ag - 0x11
							const ai = ag != 0 ? ab : 0x300007fef
							if ((f & 1) != 0) {
								if (0x300000008 > ai) {
									raw_vec_handle_error(1, 0x11, 0x10015f8f8, ab, ah)
								}
								st64(0x300000000 /* heap bump-allocator cursor */, ai)
								st64(ai + 8, 0x6f697469736f705f)
								st64(ai, 0x6c6f636f746f7270)
								st8(ai + 0x10, 0x6e)
								void ld64(q)
							} else {
								if (0x300000008 > ai) {
									raw_vec_handle_error(1, 0x11, 0x10015f8f8, ab, ah)
								}
								st64(0x300000000 /* heap bump-allocator cursor */, ai)
								st64(ai + 8, 0x6f697469736f705f)
								st64(ai, 0x6c6f636f746f7270)
								st8(ai + 0x10, 0x6e)
								void ld64(q)
							}
							st64(q + 0x10, ai, 0x11)
							st64(q + 8, 0x11)
							st64(q, 1)
							st64(a + 0x10, q)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					} else {
						st64(c + 8, r - 1)
						q = ld64(c)
						st64(c, q + 0x30)
					}
					st64(s408, q)
					try_accounts_182b0(s120, c, s, t, u)
					if (ld32(s120 + 0x90) == 2) {
						q = fn_4130(s178, ld64(s120), ld64(s120 + 8), "token_vault_0", 0xd)
						st64(s3f8, ld64(s178 + 8))
						f = ld64(s178)
						if (f != 2) {
							st64(a + 0x10, ld64(s3f8))
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					} else {
						const ae = ld64(0x300000000 /* heap bump-allocator cursor */)
						const af = ae != 0 ? sat_sub(ae, 0xb8) : 0x300007f48
						if (0x300000008 > af) {
							alloc_handle_alloc_error(8, 0xb8)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, af & -8)
						if ((af & -8) == 0) {
							alloc_handle_alloc_error(8, 0xb8)
						}
						st64(s3f8, af & -8)
						memcpy(af & -8, s120, 0xb8)
					}
					fn_7600(s120, c, v, w, x)
					recipient_token_account_1_box = ld64(s120 + 8)
					const y = ld64(s120)
					if (y != 2) {
						q = fn_4130(s188, y, recipient_token_account_1_box, "token_vault_1", 0xd)
						recipient_token_account_1_box = ld64(s188 + 8)
						f = ld64(s188)
						if (f != 2) {
							st64(a + 0x10, recipient_token_account_1_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s410, recipient_token_account_1_box)
					fn_13d0(s120, c, recipient_token_account_1_box, aj, ak)
					recipient_token_account_1_box = ld64(s120 + 8)
					const al = ld64(s120)
					if (al != 2) {
						q = fn_4130(s198, al, recipient_token_account_1_box, "tick_array_lower", 0x10)
						recipient_token_account_1_box = ld64(s198 + 8)
						f = ld64(s198)
						if (f != 2) {
							st64(a + 0x10, recipient_token_account_1_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s418, recipient_token_account_1_box)
					fn_13d0(s120, c, recipient_token_account_1_box, am, an)
					recipient_token_account_1_box = ld64(s120 + 8)
					const ao = ld64(s120)
					if (ao != 2) {
						q = fn_4130(s1a8, ao, recipient_token_account_1_box, "tick_array_upper", 0x10)
						recipient_token_account_1_box = ld64(s1a8 + 8)
						f = ld64(s1a8)
						if (f != 2) {
							st64(a + 0x10, recipient_token_account_1_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s420, recipient_token_account_1_box)
					fn_7600(s120, c, recipient_token_account_1_box, ap, aq)
					recipient_token_account_1_box = ld64(s120 + 8)
					const ar = ld64(s120)
					if (ar != 2) {
						q = fn_4130(s1b8, ar, recipient_token_account_1_box, "recipient_token_account_0", 0x19)
						recipient_token_account_1_box = ld64(s1b8 + 8)
						f = ld64(s1b8)
						if (f != 2) {
							st64(a + 0x10, recipient_token_account_1_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s428, recipient_token_account_1_box)
					fn_7600(s120, c, recipient_token_account_1_box, at, au)
					recipient_token_account_1_box = ld64(s120 + 8)
					const av = ld64(s120)
					if (av != 2) {
						q = fn_4130(s1c8, av, recipient_token_account_1_box, "recipient_token_account_1", 0x19)
						recipient_token_account_1_box = ld64(s1c8 + 8)
						f = ld64(s1c8)
						if (f != 2) {
							st64(a + 0x10, recipient_token_account_1_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s430, recipient_token_account_1_box)
					try_accounts_19190(s120, c, recipient_token_account_1_box, aw, ax)
					let az = ld64(s120 + 8)
					const ay = ld64(s120)
					if (ay != 2) {
						q = fn_4130(s1d8, ay, az, 0x10015b020 /* "token_program" */, 0xd)
						az = ld64(s1d8 + 8)
						f = ld64(s1d8)
						ba = ld64(s3f0)
						if (f != 2) {
							st64(a + 0x10, az)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					} else {
						ba = ld64(s3f0)
					}
					if ((memcmp((k & -8) + 8, ba + 8, 0x20) as u32) == 0) {
						if (ld64((k & -8) + 0x48) != 1) {
							anchor_error_from(s208, 0x7d3 /* anchor::ConstraintRaw */)
							q = fn_4130(s218, ld64(s208), ld64(s208 + 8), 0x10015b0ae /* "nft_account" */, 0xb)
							f = ld64(s218)
							st64(a + 0x10, ld64(s218 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
						const bb = ld64(i)
						copyr(s120, bb, 0x20)
						if ((memcmp((k & -8) + 0x28, s120, 0x20) as u32) == 0) {
							const bc = ld64(s3f0)
							if (ld8(ld64(bc) + 0x29) != 0) {
								const bd = ld64(ld64(s400) /* key */)
								copyr(s158, bd, 0x20)
								const be = memcmp(bc + 0x28, s158, 0x20)
								if ((be as u32) == 0) {
									if (ld8(ld64(s400) + 0x29 /* is_writable */) != 0) {
										const token_vault_0: AccountInfo = ld64(ld64(s3f8))
										if (token_vault_0.is_writable != 0) {
											const bg = token_vault_0.key
											copyr(s120, bg, 0x20)
											q = fn_4dc0(s138, ld64(s400), be as u32)
											st64(s438, ld64(s138 + 0x10))
											let bh = ld64(s138 + 8)
											if (ld64(s138) != 0) {
												st64(a + 0x10, ld64(s438))
												st64(a + 8, bh)
												st64(a, 0)
												return q
											}
											const bj = memcmp(s120, bh + 0x81, 0x20)
											const bi = ld64(s438)
											st64(bi, ld64(bi) - 1)
											if ((bj as u32) == 0) {
												const token_vault_1: AccountInfo = ld64(ld64(s410))
												if (token_vault_1.is_writable != 0) {
													const bl = token_vault_1.key
													copyr(s120, bl, 0x20)
													q = fn_4dc0(s138, ld64(s400), bj as u32)
													st64(s438, ld64(s138 + 0x10))
													bh = ld64(s138 + 8)
													if (ld64(s138) != 0) {
														st64(a + 0x10, ld64(s438))
														st64(a + 8, bh)
														st64(a, 0)
														return q
													}
													const bn = memcmp(s120, bh + 0xa1, 0x20)
													const bm = ld64(s438)
													st64(bm, ld64(bm) - 1)
													if ((bn as u32) == 0) {
														if (ld8(ld64(s418) + 0x29) != 0) {
															q = fn_4bd8(s120, ld64(s418), bn as u32)
															st64(s438, ld64(s120 + 0x10))
															f = ld64(s120 + 8)
															if (ld64(s120) != 0) {
																st64(a + 0x10, ld64(s438))
																st64(a + 8, f)
																st64(a, 0)
																return q
															}
															copyr(s120, s158, 0x20)
															const bp = memcmp(f, s120, 0x20)
															const bo = ld64(s438)
															st64(bo, ld64(bo) - 1)
															if ((bp as u32) == 0) {
																if (ld8(ld64(s420) + 0x29) != 0) {
																	q = fn_4bd8(s120, ld64(s420), bp as u32)
																	st64(s438, ld64(s120 + 0x10))
																	f = ld64(s120 + 8)
																	if (ld64(s120) != 0) {
																		st64(a + 0x10, ld64(s438))
																		st64(a + 8, f)
																		st64(a, 0)
																		return q
																	}
																	copyr(s120, s158, 0x20)
																	const br = memcmp(f, s120, 0x20)
																	const bq = ld64(s438)
																	st64(bq, ld64(bq) - 1)
																	if ((br as u32) == 0) {
																		if (ld8(ld64(ld64(s428)) + 0x29) != 0) {
																			const bs = ld64(s3f8)
																			copyr(s120, bs + 8, 0x20)
																			if ((memcmp(ld64(s428) + 8, s120, 0x20) as u32) != 0) {
																				q = anchor_error_from(s3b8, 0x7de /* anchor::ConstraintTokenMint */)
																				f = ld64(s3b8)
																				st64(a + 0x10, ld64(s3b8 + 8))
																				st64(a + 8, f)
																				st64(a, 0)
																				return q
																			}
																			if (ld8(ld64(ld64(s430)) + 0x29) != 0) {
																				const token_vault_1_box: TokenAccount_2 = ld64(s410)
																				copyr(s120, token_vault_1_box.mint, 0x20)
																				q = memcmp(ld64(s430) + 8, s120, 0x20) as u32
																				if (q != 0) {
																					q = anchor_error_from(s3e8, 0x7de /* anchor::ConstraintTokenMint */)
																					f = ld64(s3e8)
																					st64(a + 0x10, ld64(s3e8 + 8))
																					st64(a + 8, f)
																					st64(a, 0)
																					return q
																				}
																				st64(a + 0x58, az)
																				st64(a + 0x50, ld64(s430))
																				st64(a + 0x48, ld64(s428))
																				st64(a + 0x40, ld64(s420))
																				st64(a + 0x38, ld64(s418))
																				st64(a + 0x30, ld64(s410))
																				st64(a + 0x28, ld64(s3f8))
																				st64(a + 0x20, ld64(s408))
																				st64(a + 0x18, ld64(s400))
																				st64(a + 0x10, ld64(s3f0))
																				st64(a + 8, k & -8)
																				st64(a, i)
																				return q
																			}
																			anchor_error_from(s3c8, 0x7d0 /* anchor::ConstraintMut */)
																			q = fn_4130(s3d8, ld64(s3c8), ld64(s3c8 + 8), "recipient_token_account_1", 0x19)
																			f = ld64(s3d8)
																			st64(a + 0x10, ld64(s3d8 + 8))
																			st64(a + 8, f)
																			st64(a, 0)
																			return q
																		}
																		anchor_error_from(s398, 0x7d0 /* anchor::ConstraintMut */)
																		q = fn_4130(s3a8, ld64(s398), ld64(s398 + 8), "recipient_token_account_0", 0x19)
																		f = ld64(s3a8)
																		st64(a + 0x10, ld64(s3a8 + 8))
																		st64(a + 8, f)
																		st64(a, 0)
																		return q
																	}
																	anchor_error_from(s378, 0x7d3 /* anchor::ConstraintRaw */)
																	q = fn_4130(s388, ld64(s378), ld64(s378 + 8), "tick_array_upper", 0x10)
																	f = ld64(s388)
																	st64(a + 0x10, ld64(s388 + 8))
																	st64(a + 8, f)
																	st64(a, 0)
																	return q
																}
																anchor_error_from(s358, 0x7d0 /* anchor::ConstraintMut */)
																q = fn_4130(s368, ld64(s358), ld64(s358 + 8), "tick_array_upper", 0x10)
																f = ld64(s368)
																st64(a + 0x10, ld64(s368 + 8))
																st64(a + 8, f)
																st64(a, 0)
																return q
															}
															anchor_error_from(s338, 0x7d3 /* anchor::ConstraintRaw */)
															q = fn_4130(s348, ld64(s338), ld64(s338 + 8), "tick_array_lower", 0x10)
															f = ld64(s348)
															st64(a + 0x10, ld64(s348 + 8))
															st64(a + 8, f)
															st64(a, 0)
															return q
														}
														anchor_error_from(s318, 0x7d0 /* anchor::ConstraintMut */)
														q = fn_4130(s328, ld64(s318), ld64(s318 + 8), "tick_array_lower", 0x10)
														f = ld64(s328)
														st64(a + 0x10, ld64(s328 + 8))
														st64(a + 8, f)
														st64(a, 0)
														return q
													}
													anchor_error_from(s2f8, 0x7d3 /* anchor::ConstraintRaw */)
													q = fn_4130(s308, ld64(s2f8), ld64(s2f8 + 8), "token_vault_1", 0xd)
													f = ld64(s308)
													st64(a + 0x10, ld64(s308 + 8))
													st64(a + 8, f)
													st64(a, 0)
													return q
												}
												anchor_error_from(s2d8, 0x7d0 /* anchor::ConstraintMut */)
												q = fn_4130(s2e8, ld64(s2d8), ld64(s2d8 + 8), "token_vault_1", 0xd)
												f = ld64(s2e8)
												st64(a + 0x10, ld64(s2e8 + 8))
												st64(a + 8, f)
												st64(a, 0)
												return q
											}
											anchor_error_from(s2b8, 0x7d3 /* anchor::ConstraintRaw */)
											q = fn_4130(s2c8, ld64(s2b8), ld64(s2b8 + 8), "token_vault_0", 0xd)
											f = ld64(s2c8)
											st64(a + 0x10, ld64(s2c8 + 8))
											st64(a + 8, f)
											st64(a, 0)
											return q
										}
										anchor_error_from(s298, 0x7d0 /* anchor::ConstraintMut */)
										q = fn_4130(s2a8, ld64(s298), ld64(s298 + 8), "token_vault_0", 0xd)
										f = ld64(s2a8)
										st64(a + 0x10, ld64(s2a8 + 8))
										st64(a + 8, f)
										st64(a, 0)
										return q
									}
									anchor_error_from(s278, 0x7d0 /* anchor::ConstraintMut */)
									q = fn_4130(s288, ld64(s278), ld64(s278 + 8), "pool_state", 0xa)
									f = ld64(s288)
									st64(a + 0x10, ld64(s288 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return q
								}
								anchor_error_from(s258, 0x7d3 /* anchor::ConstraintRaw */)
								q = fn_4130(s268, ld64(s258), ld64(s258 + 8), 0x10015b06a /* "personal_position" */, 0x11)
								f = ld64(s268)
								st64(a + 0x10, ld64(s268 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return q
							}
							anchor_error_from(s238, 0x7d0 /* anchor::ConstraintMut */, bc)
							q = fn_4130(s248, ld64(s238), ld64(s238 + 8), 0x10015b06a /* "personal_position" */, 0x11)
							f = ld64(s248)
							st64(a + 0x10, ld64(s248 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
						q = anchor_error_from(s228, 0x7df /* anchor::ConstraintTokenOwner */)
						f = ld64(s228)
						st64(a + 0x10, ld64(s228 + 8))
						st64(a + 8, f)
						st64(a, 0)
						return q
					}
					anchor_error_from(s1e8, 0x7d3 /* anchor::ConstraintRaw */)
					q = fn_4130(s1f8, ld64(s1e8), ld64(s1e8 + 8), 0x10015b0ae /* "nft_account" */, 0xb)
					f = ld64(s1f8)
					st64(a + 0x10, ld64(s1f8 + 8))
					st64(a + 8, f)
					st64(a, 0)
					return q
				}
				const ac = ld64(0x300000000 /* heap bump-allocator cursor */)
				const ad = ac != 0 ? sat_sub(ac, 0xa) : 0x300007ff6
				if ((f & 1) != 0) {
					if (0x300000008 > ad) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, sat_sub(ac, 0xa), 0xa > ac)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, ad)
					st64(ad, 0x6174735f6c6f6f70)
					st16(ad + 8, 0x6574)
					void ld64(q)
				} else {
					if (0x300000008 > ad) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, sat_sub(ac, 0xa), 0xa > ac)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, ad)
					st64(ad, 0x6174735f6c6f6f70)
					st16(ad + 8, 0x6574)
					void ld64(q)
				}
				st64(q + 0x10, ad, 0xa)
				st64(q + 8, 0xa)
				st64(q, 1)
				st64(a + 0x10, q)
				st64(a + 8, f)
				st64(a, 0)
				return q
			}
			alloc_handle_alloc_error(8, 0x120)
		}
		alloc_handle_alloc_error(8, 0xb8)
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 9) : 0x300007ff7
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(g, 9), 9 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x656e776f5f74666e)
		st8(h + 8, 0x72)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(g, 9), 9 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x656e776f5f74666e)
		st8(h + 8, 0x72)
		void ld64(i)
	}
	st64(i + 0x10, h, 9)
	st64(i + 8, 9)
	st64(i, 1)
	st64(a + 0x10, i)
	st64(a + 8, f)
	st64(a, 0)
	return q
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value)
// types [heur]: b: DecreaseLiquidityContext (the handler ix_decrease_liquidity passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_2cfa8(a: u64, b: DecreaseLiquidityContext, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s28 = fp - 0x28, s30 = fp - 0x30, s38 = fp - 0x38, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60, s68 = fp - 0x68, s80 = fp - 0x80, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sd0 = fp - 0xd0, sfb0 = fp - 0xfb0, sfc0 = fp - 0xfc0, s1000 = fp - 0x1000
	const accounts: DecreaseLiquidityAccounts = b.accounts
	const g: AccountInfo = ld64(ld64(accounts + 0x28))
	const h: LamportsCell = g.lamports
	const o = g.key
	rc_inc(h)
	const i: DataCell = g.data
	const at = p6
	const j = p5
	rc_inc(i)
	const n = g.owner
	const m = g.rent_epoch
	const l = g.is_signer
	const k = g.is_writable
	st8(s98 + 2, g.executable)
	st8(s98, l, k)
	st64(sc0, o, h, i, n, m)
	const p: AccountInfo = accounts.token_vault_1.info
	const q: LamportsCell = p.lamports
	const w = p.key
	rc_inc(q)
	const r: DataCell = p.data
	rc_inc(r)
	const v = p.owner
	const u = p.rent_epoch
	const t = p.is_signer
	const s = p.is_writable
	st8(s68 + 2, p.executable)
	st8(s68, t, s)
	st64(s90, w, q, r, v, u)
	const x: AccountInfo = accounts.recipient_token_account_0.info
	const y: LamportsCell = x.lamports
	const ae = x.key
	rc_inc(y)
	const z: DataCell = x.data
	rc_inc(z)
	const ad = x.owner
	const ac = x.rent_epoch
	const ab = x.is_signer
	const aa = x.is_writable
	st8(s38 + 2, x.executable)
	st8(s38, ab, aa)
	st64(s60, ae, y, z, ad, ac)
	const af: AccountInfo = accounts.recipient_token_account_1.info
	const ag: LamportsCell = af.lamports
	const ai = af.key
	rc_inc(ag)
	const ah: DataCell = af.data
	rc_inc(ah)
	const am = af.owner
	const al = af.rent_epoch
	const ak = af.is_signer
	const aj = af.is_writable
	st8(s8 + 2, af.executable)
	st8(s8, ak, aj)
	st64(s30, ai, ag, ah, am, al)
	const remaining_accounts: AccountInfo = b.remaining_accounts
	const an = b.remaining_accounts_len
	st64(sfb0, remaining_accounts, an, c, d, j, at)
	st64(s1000, s90, accounts + 0x38, accounts + 0x40, s60, s30, accounts + 0x58)
	st64(sfc0, 0, 0)
	st64(s1000 + 0x30, 0)
	let ap = fn_2d880(sd0, accounts + 0x18, accounts + 0x10, sc0, fp, ah)
	const aq = ld64(sd0 + 8)
	const ar = ld64(sd0)
	if (rc_release(ag)) {
		ap = Rc_drop_slow_14df0(s28, ap)
	}
	if (rc_release(ah)) {
		ap = Rc_drop_slow_14df0(s20, ap)
	}
	if (rc_release(y)) {
		ap = Rc_drop_slow_14df0(s58, ap)
	}
	if (rc_release(z)) {
		ap = Rc_drop_slow_14df0(s50, ap)
	}
	if (rc_release(q)) {
		ap = Rc_drop_slow_14df0(s88, ap)
	}
	if (rc_release(r)) {
		ap = Rc_drop_slow_14df0(s80, ap)
	}
	if (rc_release(h)) {
		ap = Rc_drop_slow_14df0(sb8, ap)
	}
	if (!rc_release(i)) {
		st64(a + 8, aq)
		st64(a, ar)
		return ap
	}
	ap = Rc_drop_slow_14df0(sb0, ap)
	st64(a + 8, aq)
	st64(a, ar)
	return ap
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: tick_array_upper, recipient_token_account_0, recipient_token_account_1
export function fn_b15c0(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8
	let i, n, o, y: u64
	let x = fn_b4e0(s28, ld64(b + 0x10), 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
	let f = ld64(s28)
	if (f == 2) {
		x = fn_a80(s38, ld64(b + 0x18), c)
		f = ld64(s38)
		if (f == 2) {
			B46: {
				const l = ld64(ld64(b + 0x28))
				if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(l) == 0 && ld64(ld64(l + 0x10) + 0x10) != 0)) {
					st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
					x = fn_13e628(s48, s18)
					f = ld64(s48)
					if (f != 2) {
						const m = ld64(0x300000000 /* heap bump-allocator cursor */)
						n = 0xd > m
						o = m != 0 ? n != 0 ? 0 : m - 0xd : 0x300007ff3
						i = ld64(s48 + 8)
						if ((f & 1) != 0) {
							if (0x300000008 > o) {
								raw_vec_handle_error(1, 0xd, 0x10015f8f8, n, y)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, o)
							st64(o + 5, 0x305f746c7561765f)
							st64(o, 0x61765f6e656b6f74)
							void ld64(i)
							break B46
						}
						if (0x300000008 > o) {
							raw_vec_handle_error(1, 0xd, 0x10015f8f8, n, y)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, o)
						st64(o + 5, 0x305f746c7561765f)
						st64(o, 0x61765f6e656b6f74)
						void ld64(i)
						break B46
					}
				}
				const p = ld64(ld64(b + 0x30))
				if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(p) == 0 && ld64(ld64(p + 0x10) + 0x10) != 0)) {
					st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
					x = fn_13e628(s58, s18)
					f = ld64(s58)
					if (f != 2) {
						const q = ld64(0x300000000 /* heap bump-allocator cursor */)
						n = 0xd > q
						o = q != 0 ? n != 0 ? 0 : q - 0xd : 0x300007ff3
						i = ld64(s58 + 8)
						if ((f & 1) != 0) {
							if (0x300000008 > o) {
								raw_vec_handle_error(1, 0xd, 0x10015f8f8, n, y)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, o)
							st64(o + 5, 0x315f746c7561765f)
							st64(o, 0x61765f6e656b6f74)
							void ld64(i)
							break B46
						}
						if (0x300000008 > o) {
							raw_vec_handle_error(1, 0xd, 0x10015f8f8, n, y)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, o)
						st64(o + 5, 0x315f746c7561765f)
						st64(o, 0x61765f6e656b6f74)
						void ld64(i)
						break B46
					}
				}
				x = fn_1008(s68, ld64(b + 0x38), c)
				f = ld64(s68)
				if (f == 2) {
					fn_1008(s78, ld64(b + 0x40), c)
					const t = ld64(s78)
					if (t != 2) {
						x = fn_4130(s88, t, ld64(s78 + 8), "tick_array_upper", 0x10)
						i = ld64(s88 + 8)
						f = ld64(s88)
						if (f != 2) {
							st64(a + 8, i)
							st64(a, f)
							return x
						}
					}
					fn_a1d8(s98, ld64(ld64(b + 0x48)), 0x1001594a0 /* &TOKEN_PROGRAM */, c)
					const u = ld64(s98)
					if (u != 2) {
						x = fn_4130(sa8, u, ld64(s98 + 8), "recipient_token_account_0", 0x19)
						i = ld64(sa8 + 8)
						f = ld64(sa8)
						if (f != 2) {
							st64(a + 8, i)
							st64(a, f)
							return x
						}
					}
					x = fn_a1d8(sb8, ld64(ld64(b + 0x50)), 0x1001594a0 /* &TOKEN_PROGRAM */, c)
					i = undef
					const v = ld64(sb8)
					if (v == 2) {
						st64(a + 8, i)
						st64(a, 2)
						return x
					}
					x = fn_4130(sc8, v, ld64(sb8 + 8), "recipient_token_account_1", 0x19)
					i = undef
					const w = ld64(sc8)
					if (w == 2) {
						st64(a + 8, i)
						st64(a, 2)
						return x
					}
					st64(a + 8, ld64(sc8 + 8))
					st64(a, w)
					return x
				}
				const r = ld64(0x300000000 /* heap bump-allocator cursor */)
				const s = r != 0 ? sat_sub(r, 0x10) : 0x300007ff0
				i = ld64(s68 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > s) {
						raw_vec_handle_error(1, 0x10, 0x10015f8f8, 0x10 > r)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, s)
					st64(s + 8, 0x7265776f6c5f7961)
					st64(s, 0x7272615f6b636974)
					void ld64(i)
				} else {
					if (0x300000008 > s) {
						raw_vec_handle_error(1, 0x10, 0x10015f8f8, 0x10 > r)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, s)
					st64(s + 8, 0x7265776f6c5f7961)
					st64(s, 0x7272615f6b636974)
					void ld64(i)
				}
				st64(i + 0x10, s, 0x10)
				st64(i + 8, 0x10)
				st64(i, 1)
				st64(a + 8, i)
				st64(a, f)
				return x
			}
			st64(i + 0x10, o, 0xd)
			st64(i + 8, 0xd)
			st64(i, 1)
			st64(a + 8, i)
			st64(a, f)
			return x
		}
		const j = ld64(0x300000000 /* heap bump-allocator cursor */)
		const k = j != 0 ? sat_sub(j, 0xa) : 0x300007ff6
		i = ld64(s38 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > k) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, k)
			st64(k, 0x6174735f6c6f6f70)
			st16(k + 8, 0x6574)
			void ld64(i)
		} else {
			if (0x300000008 > k) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, k)
			st64(k, 0x6174735f6c6f6f70)
			st16(k + 8, 0x6574)
			void ld64(i)
		}
		st64(i + 0x10, k, 0xa)
		st64(i + 8, 0xa)
		st64(i, 1)
		st64(a + 8, i)
		st64(a, f)
		return x
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0x11) : 0x300007fef
	i = ld64(s28 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x11 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 8, 0x6f697469736f705f)
		st64(h, 0x6c616e6f73726570)
		st8(h + 0x10, 0x6e)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x11 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 8, 0x6f697469736f705f)
		st64(h, 0x6c616e6f73726570)
		st8(h + 0x10, 0x6e)
		void ld64(i)
	}
	st64(i + 0x10, h, 0x11)
	st64(i + 8, 0x11)
	st64(i, 1)
	st64(a + 8, i)
	st64(a, f)
	return x
}
