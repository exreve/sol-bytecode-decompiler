/// <reference path="../lib.d.ts" />
// instruction increase_liquidity
import { anchor_error_from, fn_1008, fn_13e5a0, fn_13e628, fn_14ed60, fn_2150, fn_2aa40, fn_4130, fn_4bd8, fn_4dc0, fn_a80, fn_b4e0, memcpy } from '../shared.ts'

// instruction handler: increase_liquidity (discriminator sha256("global:increase_liquidity")[..8] = 0xb2fbcd0d76f39c2e)
// accounts [idl]: 0 nft_owner [signer], 1 nft_account, 2 pool_state [mut], 3 protocol_position, 4 personal_position [mut], 5 tick_array_lower [mut], 6 tick_array_upper [mut], 7 token_account_0 [mut], 8 token_account_1 [mut], 9 token_vault_0 [mut], 10 token_vault_1 [mut], 11 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA]
// args [idl]: liquidity: u128, amount_0_max: u64, amount_1_max: u64
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, amount_0_max, amount_1_max
export function ix_increase_liquidity(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s48 = fp - 0x48, s50 = fp - 0x50, s60 = fp - 0x60, sa8 = fp - 0xa8, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s100 = fp - 0x100, s1000 = fp - 0x1000
	let l, o: u64
	const i = sol_log(0x10015ba42 /* "Instruction: IncreaseLiquidity" */, 0x1e)
	const f = ix_args_len
	if (f >= 0x10 && ((f & -8) != 0x10 && (f & -8) != 0x18)) {
		const args: IncreaseLiquidityArgs = ix_args
		const r = ld64(args.liquidity + 8)
		const q = ld64(args.liquidity)
		const amount_0_max = args.amount_0_max
		const amount_1_max = args.amount_1_max
		st64(sd0, accounts, accounts_len)
		o = accounts_increase_liquidity(s60, amount_0_max, sd0, undef, fp, i)
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
		st64(s1000, amount_0_max, amount_1_max)
		o = fn_11dc98(se0, s60, q, r, fp)
		l = ld64(se0)
		if (l == 2) {
			o = fn_ab558(sf0, sc0, program_id)
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

// Anchor Accounts::try_accounts of instruction increase_liquidity (called by ix_increase_liquidity; name [str]: from the handler's "Instruction: …" log; was fn_a9500)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: tick_array_lower (ConstraintMut, ConstraintRaw), tick_array_upper (ConstraintMut, ConstraintRaw), token_account_0 (ConstraintMut), token_account_1 (ConstraintMut), token_vault_0 (ConstraintMut, ConstraintRaw), token_vault_1 (ConstraintRaw, ConstraintMut), token_program, nft_account (ConstraintRaw), personal_position (ConstraintMut, ConstraintRaw), pool_state (ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: token_vault_1_box, token_vault_0_box, token_vault_1_box_2, pool_state [idl], token_vault_0, token_vault_1
export function accounts_increase_liquidity(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s120 = fp - 0x120, s138 = fp - 0x138, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f0 = fp - 0x3f0, s3f8 = fp - 0x3f8, s400 = fp - 0x400, s408 = fp - 0x408, s410 = fp - 0x410, s418 = fp - 0x418, s420 = fp - 0x420, s428 = fp - 0x428, s430 = fp - 0x430, s438 = fp - 0x438
	let s, t, u, z, ae, af, ah, ai, ak, al, an, ao, aq, ar, au, av, ay: u64
	let token_vault_1_box: TokenAccount_2
	let q = try_accounts_17a30(s120, c, c, d, e, r0)
	const i = ld64(s120 + 8)
	let f = ld64(s120)
	if (f == 2) {
		q = try_accounts_182b0(s120, c)
		if (ld32(s120 + 0x90) == 2) {
			const l = ld64(0x300000000 /* heap bump-allocator cursor */)
			f = ld64(s120)
			const m = l != 0 ? sat_sub(l, 0xb) : 0x300007ff5
			token_vault_1_box = ld64(s120 + 8)
			if (f != 0) {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m, 0x6f6363615f74666e)
				st32(m + 7, 0x746e756f)
				void token_vault_1_box.info
			} else {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m, 0x6f6363615f74666e)
				st32(m + 7, 0x746e756f)
				void token_vault_1_box.info
			}
			st64(token_vault_1_box.mint + 8, m, 0xb)
			st64(token_vault_1_box.mint, 0xb)
			st64(token_vault_1_box, 1)
			st64(a + 0x10, token_vault_1_box)
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
			fn_11e0(s120, c)
			q = ld64(s120 + 8)
			f = ld64(s120)
			if (f == 2) {
				st64(s3f0, q)
				const r = ld64(c + 8)
				if (r == 0) {
					anchor_error_from(s168, 0xbbd /* anchor::AccountNotEnoughKeys */, s, t, u)
					q = ld64(s168 + 8)
					f = ld64(s168)
					if (f != 2) {
						const y = ld64(0x300000000 /* heap bump-allocator cursor */)
						z = 0x11 > y
						const aa = z != 0 ? 0 : y - 0x11
						const ab = y != 0 ? aa : 0x300007fef
						if ((f & 1) != 0) {
							if (0x300000008 > ab) {
								raw_vec_handle_error(1, 0x11, 0x10015f8f8, aa, z)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, ab)
							st64(ab + 8, 0x6f697469736f705f)
							st64(ab, 0x6c6f636f746f7270)
							st8(ab + 0x10, 0x6e)
							void ld64(q)
						} else {
							if (0x300000008 > ab) {
								raw_vec_handle_error(1, 0x11, 0x10015f8f8, aa, z)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, ab)
							st64(ab + 8, 0x6f697469736f705f)
							st64(ab, 0x6c6f636f746f7270)
							st8(ab + 0x10, 0x6e)
							void ld64(q)
						}
						st64(q + 0x10, ab, 0x11)
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
				st64(s3f8, q)
				q = try_accounts_18368(s120, c, s, t, u)
				z = undef
				if (ld64(s120) == 0) {
					const ac = ld64(0x300000000 /* heap bump-allocator cursor */)
					f = ld64(s120 + 8)
					const ad = ac != 0 ? sat_sub(ac, 0x11) : 0x300007fef
					token_vault_1_box = ld64(s120 + 0x10)
					if (f != 0) {
						if (0x300000008 > ad) {
							raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, z)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ad)
						st64(ad + 8, 0x6f697469736f705f)
						st64(ad, 0x6c616e6f73726570)
						st8(ad + 0x10, 0x6e)
						void token_vault_1_box.info
					} else {
						if (0x300000008 > ad) {
							raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, z)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ad)
						st64(ad + 8, 0x6f697469736f705f)
						st64(ad, 0x6c616e6f73726570)
						st8(ad + 0x10, 0x6e)
						void token_vault_1_box.info
					}
					st64(token_vault_1_box.mint + 8, ad, 0x11)
					st64(token_vault_1_box.mint, 0x11)
					st64(token_vault_1_box, 1)
					st64(a + 0x10, token_vault_1_box)
					st64(a + 8, f)
					st64(a, 0)
					return q
				}
				const v = ld64(0x300000000 /* heap bump-allocator cursor */)
				const w = v != 0 ? sat_sub(v, 0x120) : 0x300007ee0
				if (0x300000008 > w) {
					alloc_handle_alloc_error(8, 0x120)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, w & -8)
				if ((w & -8) != 0) {
					st64(s400, w & -8)
					memcpy(w & -8, s120, 0x120)
					fn_13d0(s120, c)
					token_vault_1_box = ld64(s120 + 8)
					const x = ld64(s120)
					if (x != 2) {
						q = fn_4130(s178, x, token_vault_1_box, "tick_array_lower", 0x10)
						token_vault_1_box = ld64(s178 + 8)
						f = ld64(s178)
						if (f != 2) {
							st64(a + 0x10, token_vault_1_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s408, token_vault_1_box)
					fn_13d0(s120, c, token_vault_1_box, ae, af)
					token_vault_1_box = ld64(s120 + 8)
					const ag = ld64(s120)
					if (ag != 2) {
						q = fn_4130(s188, ag, token_vault_1_box, "tick_array_upper", 0x10)
						token_vault_1_box = ld64(s188 + 8)
						f = ld64(s188)
						if (f != 2) {
							st64(a + 0x10, token_vault_1_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s410, token_vault_1_box)
					fn_7600(s120, c, token_vault_1_box, ah, ai)
					token_vault_1_box = ld64(s120 + 8)
					const aj = ld64(s120)
					if (aj != 2) {
						q = fn_4130(s198, aj, token_vault_1_box, "token_account_0", 0xf)
						token_vault_1_box = ld64(s198 + 8)
						f = ld64(s198)
						if (f != 2) {
							st64(a + 0x10, token_vault_1_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s418, token_vault_1_box)
					fn_7600(s120, c, token_vault_1_box, ak, al)
					token_vault_1_box = ld64(s120 + 8)
					const am = ld64(s120)
					if (am != 2) {
						q = fn_4130(s1a8, am, token_vault_1_box, "token_account_1", 0xf)
						token_vault_1_box = ld64(s1a8 + 8)
						f = ld64(s1a8)
						if (f != 2) {
							st64(a + 0x10, token_vault_1_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s420, token_vault_1_box)
					fn_7600(s120, c, token_vault_1_box, an, ao)
					token_vault_1_box = ld64(s120 + 8)
					const ap = ld64(s120)
					if (ap != 2) {
						q = fn_4130(s1b8, ap, token_vault_1_box, "token_vault_0", 0xd)
						token_vault_1_box = ld64(s1b8 + 8)
						f = ld64(s1b8)
						if (f != 2) {
							st64(a + 0x10, token_vault_1_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s428, token_vault_1_box)
					fn_7600(s120, c, token_vault_1_box, aq, ar)
					token_vault_1_box = ld64(s120 + 8)
					const at = ld64(s120)
					if (at != 2) {
						q = fn_4130(s1c8, at, token_vault_1_box, "token_vault_1", 0xd)
						token_vault_1_box = ld64(s1c8 + 8)
						f = ld64(s1c8)
						if (f != 2) {
							st64(a + 0x10, token_vault_1_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s430, token_vault_1_box)
					try_accounts_19190(s120, c, token_vault_1_box, au, av)
					let ax = ld64(s120 + 8)
					const aw = ld64(s120)
					if (aw != 2) {
						q = fn_4130(s1d8, aw, ax, 0x10015b020 /* "token_program" */, 0xd)
						ax = ld64(s1d8 + 8)
						f = ld64(s1d8)
						ay = ld64(s400)
						if (f != 2) {
							st64(a + 0x10, ax)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					} else {
						ay = ld64(s400)
					}
					if ((memcmp((k & -8) + 8, ay + 8, 0x20) as u32) == 0) {
						if (ld64((k & -8) + 0x48) != 1) {
							anchor_error_from(s208, 0x7d3 /* anchor::ConstraintRaw */)
							q = fn_4130(s218, ld64(s208), ld64(s208 + 8), 0x10015b0ae /* "nft_account" */, 0xb)
							f = ld64(s218)
							st64(a + 0x10, ld64(s218 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
						const az = ld64(i)
						copyr(s120, az, 0x20)
						if ((memcmp((k & -8) + 0x28, s120, 0x20) as u32) == 0) {
							const pool_state: AccountInfo = ld64(s3f0)
							if (pool_state.is_writable != 0) {
								const bb = ld64(s400)
								if (ld8(ld64(bb) + 0x29) != 0) {
									const bc = pool_state.key
									copyr(s158, bc, 0x20)
									const bd = memcmp(bb + 0x28, s158, 0x20)
									if ((bd as u32) == 0) {
										if (ld8(ld64(s408) + 0x29) != 0) {
											q = fn_4bd8(s120, ld64(s408), bd as u32)
											st64(s438, ld64(s120 + 0x10))
											f = ld64(s120 + 8)
											if (ld64(s120) != 0) {
												st64(a + 0x10, ld64(s438))
												st64(a + 8, f)
												st64(a, 0)
												return q
											}
											copyr(s120, s158, 0x20)
											const bf = memcmp(f, s120, 0x20)
											const be = ld64(s438)
											st64(be, ld64(be) - 1)
											if ((bf as u32) == 0) {
												if (ld8(ld64(s410) + 0x29) != 0) {
													q = fn_4bd8(s120, ld64(s410), bf as u32)
													st64(s438, ld64(s120 + 0x10))
													f = ld64(s120 + 8)
													if (ld64(s120) != 0) {
														st64(a + 0x10, ld64(s438))
														st64(a + 8, f)
														st64(a, 0)
														return q
													}
													copyr(s120, s158, 0x20)
													const bh = memcmp(f, s120, 0x20)
													const bg = ld64(s438)
													st64(bg, ld64(bg) - 1)
													if ((bh as u32) == 0) {
														if (ld8(ld64(ld64(s418)) + 0x29) != 0) {
															const token_vault_0_box: TokenAccount_2 = ld64(s428)
															copyr(s120, token_vault_0_box.mint, 0x20)
															if ((memcmp(ld64(s418) + 8, s120, 0x20) as u32) != 0) {
																q = anchor_error_from(s338, 0x7de /* anchor::ConstraintTokenMint */)
																f = ld64(s338)
																st64(a + 0x10, ld64(s338 + 8))
																st64(a + 8, f)
																st64(a, 0)
																return q
															}
															if (ld8(ld64(ld64(s420)) + 0x29) != 0) {
																const token_vault_1_box_2: TokenAccount_2 = ld64(s430)
																copyr(s120, token_vault_1_box_2.mint, 0x20)
																const bk = memcmp(ld64(s420) + 8, s120, 0x20)
																if ((bk as u32) != 0) {
																	q = anchor_error_from(s368, 0x7de /* anchor::ConstraintTokenMint */)
																	f = ld64(s368)
																	st64(a + 0x10, ld64(s368 + 8))
																	st64(a + 8, f)
																	st64(a, 0)
																	return q
																}
																const token_vault_0: AccountInfo = ld64(ld64(s428))
																if (token_vault_0.is_writable != 0) {
																	const bm = token_vault_0.key
																	copyr(s120, bm, 0x20)
																	q = fn_4dc0(s138, ld64(s3f0), bk as u32)
																	st64(s438, ld64(s138 + 0x10))
																	let bn = ld64(s138 + 8)
																	if (ld64(s138) != 0) {
																		st64(a + 0x10, ld64(s438))
																		st64(a + 8, bn)
																		st64(a, 0)
																		return q
																	}
																	const bp = memcmp(s120, bn + 0x81, 0x20)
																	const bo = ld64(s438)
																	st64(bo, ld64(bo) - 1)
																	if ((bp as u32) == 0) {
																		const token_vault_1: AccountInfo = ld64(ld64(s430))
																		if (token_vault_1.is_writable != 0) {
																			const br = token_vault_1.key
																			copyr(s120, br, 0x20)
																			q = fn_4dc0(s138, ld64(s3f0), bp as u32)
																			st64(s438, ld64(s138 + 0x10))
																			bn = ld64(s138 + 8)
																			if (ld64(s138) != 0) {
																				st64(a + 0x10, ld64(s438))
																				st64(a + 8, bn)
																				st64(a, 0)
																				return q
																			}
																			const bt = memcmp(s120, bn + 0xa1, 0x20)
																			const bs = ld64(s438)
																			st64(bs, ld64(bs) - 1)
																			q = bt as u32
																			if (q == 0) {
																				st64(a + 0x58, ax)
																				st64(a + 0x50, ld64(s430))
																				st64(a + 0x48, ld64(s428))
																				st64(a + 0x40, ld64(s420))
																				st64(a + 0x38, ld64(s418))
																				st64(a + 0x30, ld64(s410))
																				st64(a + 0x28, ld64(s408))
																				st64(a + 0x20, ld64(s400))
																				st64(a + 0x18, ld64(s3f8))
																				st64(a + 0x10, ld64(s3f0))
																				st64(a + 8, k & -8)
																				st64(a, i)
																				return q
																			}
																			anchor_error_from(s3d8, 0x7d3 /* anchor::ConstraintRaw */)
																			q = fn_4130(s3e8, ld64(s3d8), ld64(s3d8 + 8), "token_vault_1", 0xd)
																			f = ld64(s3e8)
																			st64(a + 0x10, ld64(s3e8 + 8))
																			st64(a + 8, f)
																			st64(a, 0)
																			return q
																		}
																		anchor_error_from(s3b8, 0x7d0 /* anchor::ConstraintMut */)
																		q = fn_4130(s3c8, ld64(s3b8), ld64(s3b8 + 8), "token_vault_1", 0xd)
																		f = ld64(s3c8)
																		st64(a + 0x10, ld64(s3c8 + 8))
																		st64(a + 8, f)
																		st64(a, 0)
																		return q
																	}
																	anchor_error_from(s398, 0x7d3 /* anchor::ConstraintRaw */)
																	q = fn_4130(s3a8, ld64(s398), ld64(s398 + 8), "token_vault_0", 0xd)
																	f = ld64(s3a8)
																	st64(a + 0x10, ld64(s3a8 + 8))
																	st64(a + 8, f)
																	st64(a, 0)
																	return q
																}
																anchor_error_from(s378, 0x7d0 /* anchor::ConstraintMut */)
																q = fn_4130(s388, ld64(s378), ld64(s378 + 8), "token_vault_0", 0xd)
																f = ld64(s388)
																st64(a + 0x10, ld64(s388 + 8))
																st64(a + 8, f)
																st64(a, 0)
																return q
															}
															anchor_error_from(s348, 0x7d0 /* anchor::ConstraintMut */)
															q = fn_4130(s358, ld64(s348), ld64(s348 + 8), "token_account_1", 0xf)
															f = ld64(s358)
															st64(a + 0x10, ld64(s358 + 8))
															st64(a + 8, f)
															st64(a, 0)
															return q
														}
														anchor_error_from(s318, 0x7d0 /* anchor::ConstraintMut */)
														q = fn_4130(s328, ld64(s318), ld64(s318 + 8), "token_account_0", 0xf)
														f = ld64(s328)
														st64(a + 0x10, ld64(s328 + 8))
														st64(a + 8, f)
														st64(a, 0)
														return q
													}
													anchor_error_from(s2f8, 0x7d3 /* anchor::ConstraintRaw */)
													q = fn_4130(s308, ld64(s2f8), ld64(s2f8 + 8), "tick_array_upper", 0x10)
													f = ld64(s308)
													st64(a + 0x10, ld64(s308 + 8))
													st64(a + 8, f)
													st64(a, 0)
													return q
												}
												anchor_error_from(s2d8, 0x7d0 /* anchor::ConstraintMut */)
												q = fn_4130(s2e8, ld64(s2d8), ld64(s2d8 + 8), "tick_array_upper", 0x10)
												f = ld64(s2e8)
												st64(a + 0x10, ld64(s2e8 + 8))
												st64(a + 8, f)
												st64(a, 0)
												return q
											}
											anchor_error_from(s2b8, 0x7d3 /* anchor::ConstraintRaw */)
											q = fn_4130(s2c8, ld64(s2b8), ld64(s2b8 + 8), "tick_array_lower", 0x10)
											f = ld64(s2c8)
											st64(a + 0x10, ld64(s2c8 + 8))
											st64(a + 8, f)
											st64(a, 0)
											return q
										}
										anchor_error_from(s298, 0x7d0 /* anchor::ConstraintMut */)
										q = fn_4130(s2a8, ld64(s298), ld64(s298 + 8), "tick_array_lower", 0x10)
										f = ld64(s2a8)
										st64(a + 0x10, ld64(s2a8 + 8))
										st64(a + 8, f)
										st64(a, 0)
										return q
									}
									anchor_error_from(s278, 0x7d3 /* anchor::ConstraintRaw */)
									q = fn_4130(s288, ld64(s278), ld64(s278 + 8), 0x10015b06a /* "personal_position" */, 0x11)
									f = ld64(s288)
									st64(a + 0x10, ld64(s288 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return q
								}
								anchor_error_from(s258, 0x7d0 /* anchor::ConstraintMut */, bb)
								q = fn_4130(s268, ld64(s258), ld64(s258 + 8), 0x10015b06a /* "personal_position" */, 0x11)
								f = ld64(s268)
								st64(a + 0x10, ld64(s268 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return q
							}
							anchor_error_from(s238, 0x7d0 /* anchor::ConstraintMut */)
							q = fn_4130(s248, ld64(s238), ld64(s238 + 8), "pool_state", 0xa)
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
				alloc_handle_alloc_error(8, 0x120)
			}
			const o = ld64(0x300000000 /* heap bump-allocator cursor */)
			const p = o != 0 ? sat_sub(o, 0xa) : 0x300007ff6
			if ((f & 1) != 0) {
				if (0x300000008 > p) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, sat_sub(o, 0xa), 0xa > o)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, p)
				st64(p, 0x6174735f6c6f6f70)
				st16(p + 8, 0x6574)
				void ld64(q)
			} else {
				if (0x300000008 > p) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, sat_sub(o, 0xa), 0xa > o)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, p)
				st64(p, 0x6174735f6c6f6f70)
				st16(p + 8, 0x6574)
				void ld64(q)
			}
			st64(q + 0x10, p, 0xa)
			st64(q + 8, 0xa)
			st64(q, 1)
			st64(a + 0x10, q)
			st64(a + 8, f)
			st64(a, 0)
			return q
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value)
// types [heur]: b: IncreaseLiquidityContext (the handler ix_increase_liquidity passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_11dc98(a: u64, b: IncreaseLiquidityContext, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let g, h: u64
	if ((c | d) == 0) {
		ErrorCode_name(s78, 0x100159900, c, d, e)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (ErrorCode_fmt(0x100159900, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(sf8, s78, 0x30)
		st64(s118 + 8, 0x10015b659)
		st32(sf8 + 0x78, 0x9c9 /* anchor::RequireGtViolated */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x218)
		st64(s118 + 0x10, 0x17)
		st64(s118, 0)
		fn_13e5a0(s138, s118)
		h = fn_2150(s148, ld64(s138), ld64(s138 + 8), 0, 0)
		g = ld64(s148 + 8)
		st64(a, ld64(s148))
		st64(a + 8, g)
		return h
	}
	const f = ld64(e - 0x1000)
	st64(sff8, ld64(e - 0xff8))
	st64(s1000, f)
	st64(sff0, 2)
	h = fn_2a150(s128, b, c, d, f, ld64(sff8), 2)
	g = ld64(s128 + 8)
	st64(a, ld64(s128))
	st64(a + 8, g)
	return h
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value)
// types [heur]: b: IncreaseLiquidityContext (every call passes one: fn_11dc98)
export function fn_2a150(a: u64, b: IncreaseLiquidityContext, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s28 = fp - 0x28, s30 = fp - 0x30, s38 = fp - 0x38, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60, s68 = fp - 0x68, s80 = fp - 0x80, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sd0 = fp - 0xd0, s1000 = fp - 0x1000
	const accounts: IncreaseLiquidityAccounts = b.accounts
	const g: AccountInfo = accounts.token_account_0.info
	const h: LamportsCell = g.lamports
	const o = g.key
	rc_inc(h)
	const i: DataCell = g.data
	const at = p7
	const au = p6
	const j = p5
	rc_inc(i)
	const n = g.owner
	const m = g.rent_epoch
	const l = g.is_signer
	const k = g.is_writable
	st8(s98 + 2, g.executable)
	st8(s98, l, k)
	st64(sc0, o, h, i, n, m)
	const p: AccountInfo = accounts.token_account_1.info
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
	const x: AccountInfo = accounts.token_vault_0.info
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
	const af: AccountInfo = accounts.token_vault_1.info
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
	st64(s1000, accounts + 0x28, accounts + 0x30, sc0, s90, s60, s30, accounts + 0x58, 0, 0, 0, remaining_accounts, an, c, d, j, au, at)
	let ap = fn_2aa40(sd0, accounts, accounts + 0x10, accounts + 0x20, fp, accounts + 0x20)
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

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_account_1, token_vault_0, token_vault_1
export function fn_ab558(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8
	let i, m, n, y: u64
	let x = fn_a80(s28, ld64(b + 0x10), c)
	let f = ld64(s28)
	if (f == 2) {
		x = fn_b4e0(s38, ld64(b + 0x20), 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
		f = ld64(s38)
		if (f == 2) {
			x = fn_1008(s48, ld64(b + 0x28), c)
			f = ld64(s48)
			if (f == 2) {
				x = fn_1008(s58, ld64(b + 0x30), c)
				f = ld64(s58)
				if (f == 2) {
					const p = ld64(ld64(b + 0x38))
					if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(p) == 0 && ld64(ld64(p + 0x10) + 0x10) != 0)) {
						st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
						x = fn_13e628(s68, s18)
						f = ld64(s68)
						if (f != 2) {
							const q = ld64(0x300000000 /* heap bump-allocator cursor */)
							const r = q != 0 ? sat_sub(q, 0xf) : 0x300007ff1
							i = ld64(s68 + 8)
							if ((f & 1) != 0) {
								if (0x300000008 > r) {
									raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0xf > q)
								}
								st64(0x300000000 /* heap bump-allocator cursor */, r)
								st64(r + 7, 0x305f746e756f6363)
								st64(r, 0x63615f6e656b6f74)
								void ld64(i)
							} else {
								if (0x300000008 > r) {
									raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0xf > q)
								}
								st64(0x300000000 /* heap bump-allocator cursor */, r)
								st64(r + 7, 0x305f746e756f6363)
								st64(r, 0x63615f6e656b6f74)
								void ld64(i)
							}
							st64(i + 0x10, r, 0xf)
							st64(i + 8, 0xf)
							st64(i, 1)
							st64(a + 8, i)
							st64(a, f)
							return x
						}
					}
					const s = ld64(ld64(b + 0x40))
					if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(s) == 0 && ld64(ld64(s + 0x10) + 0x10) != 0)) {
						st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
						fn_13e628(s78, s18)
						const t = ld64(s78)
						if (t != 2) {
							x = fn_4130(s88, t, ld64(s78 + 8), "token_account_1", 0xf)
							i = ld64(s88 + 8)
							f = ld64(s88)
							if (f != 2) {
								st64(a + 8, i)
								st64(a, f)
								return x
							}
						}
					}
					fn_a1d8(s98, ld64(ld64(b + 0x48)), 0x1001594a0 /* &TOKEN_PROGRAM */, c)
					const u = ld64(s98)
					if (u != 2) {
						x = fn_4130(sa8, u, ld64(s98 + 8), "token_vault_0", 0xd)
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
					x = fn_4130(sc8, v, ld64(sb8 + 8), "token_vault_1", 0xd)
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
				const o = ld64(0x300000000 /* heap bump-allocator cursor */)
				m = 0x10 > o
				n = o != 0 ? m != 0 ? 0 : o - 0x10 : 0x300007ff0
				i = ld64(s58 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > n) {
						raw_vec_handle_error(1, 0x10, 0x10015f8f8, m, y)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, n)
					st64(n + 8, 0x72657070755f7961)
					st64(n, 0x7272615f6b636974)
					void ld64(i)
				} else {
					if (0x300000008 > n) {
						raw_vec_handle_error(1, 0x10, 0x10015f8f8, m, y)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, n)
					st64(n + 8, 0x72657070755f7961)
					st64(n, 0x7272615f6b636974)
					void ld64(i)
				}
			} else {
				const l = ld64(0x300000000 /* heap bump-allocator cursor */)
				m = 0x10 > l
				n = l != 0 ? m != 0 ? 0 : l - 0x10 : 0x300007ff0
				i = ld64(s48 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > n) {
						raw_vec_handle_error(1, 0x10, 0x10015f8f8, m, y)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, n)
					st64(n + 8, 0x7265776f6c5f7961)
					st64(n, 0x7272615f6b636974)
					void ld64(i)
				} else {
					if (0x300000008 > n) {
						raw_vec_handle_error(1, 0x10, 0x10015f8f8, m, y)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, n)
					st64(n + 8, 0x7265776f6c5f7961)
					st64(n, 0x7272615f6b636974)
					void ld64(i)
				}
			}
			st64(i + 0x10, n, 0x10)
			st64(i + 8, 0x10)
			st64(i, 1)
			st64(a + 8, i)
			st64(a, f)
			return x
		}
		const j = ld64(0x300000000 /* heap bump-allocator cursor */)
		const k = j != 0 ? sat_sub(j, 0x11) : 0x300007fef
		i = ld64(s38 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > k) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x11 > j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, k)
			st64(k + 8, 0x6f697469736f705f)
			st64(k, 0x6c616e6f73726570)
			st8(k + 0x10, 0x6e)
			void ld64(i)
		} else {
			if (0x300000008 > k) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x11 > j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, k)
			st64(k + 8, 0x6f697469736f705f)
			st64(k, 0x6c616e6f73726570)
			st8(k + 0x10, 0x6e)
			void ld64(i)
		}
		st64(i + 0x10, k, 0x11)
		st64(i + 8, 0x11)
		st64(i, 1)
		st64(a + 8, i)
		st64(a, f)
		return x
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0xa) : 0x300007ff6
	i = ld64(s28 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x6174735f6c6f6f70)
		st16(h + 8, 0x6574)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > g)
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
	return x
}
