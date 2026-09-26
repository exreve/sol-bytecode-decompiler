/// <reference path="../lib.d.ts" />
// instruction decrease_limit_order
import { anchor_error_from, fn_1008, fn_13e5a0, fn_13e628, fn_14ec98, fn_14ed60, fn_16330, fn_181f8, fn_4130, fn_4bd8, fn_4dc0, fn_514e0, fn_51c8, fn_53e8, fn_667d0, fn_668d8, fn_6d670, fn_6f618, fn_71a20, fn_72940, fn_7a038, fn_7da68, fn_85138, fn_88360, fn_88558, fn_a80, fn_af28, log_data, memcpy } from '../shared.ts'

// instruction handler: decrease_limit_order (discriminator sha256("global:decrease_limit_order")[..8] = 0xa33142673c9d75)
// accounts [idl]: 0 owner [signer], 1 pool_state [mut], 2 tick_array [mut], 3 limit_order [mut], 4 input_token_account [mut], 5 output_token_account [mut], 6 input_vault [mut], 7 output_vault [mut], 8 input_vault_mint, 9 output_vault_mint, 10 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 11 token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb]
// args [idl]: amount: u64, amount_min: u64
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, amount, amount_min
export function ix_decrease_limit_order(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const sf8 = fp - 0xf8, s108 = fp - 0x108, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250
	let l, p: u64
	const i = sol_log("Instruction: DecreaseLimitOrder", 0x1f)
	const f = ix_args_len
	if (f >= 8 && (f & -8) != 8) {
		const args: DecreaseLimitOrderArgs = ix_args
		const amount = args.amount
		const amount_min = args.amount_min
		st64(s220, accounts, accounts_len)
		p = accounts_decrease_limit_order(s108, amount, s220, undef, fp, i)
		const k = ld64(s108 + 8)
		l = ld64(s108)
		const j = ld8(sf8 + 0xf4)
		if (j == 2) {
			st64(a + 8, k)
			st64(a, l)
			return p
		}
		const m = memcpy(s200, sf8, 0xf4)
		st16(s200 + 0xf5, ld16(sf8 + 0xf5))
		st8(s200 + 0xf7, ld8(sf8 + 0xf7))
		st8(s200 + 0xf4, j)
		st64(s210, l, k)
		copyr(sf8, s220, 0x10)
		st64(s108, program_id, s210)
		p = fn_530f0(s230, s108, amount, amount_min, m)
		l = ld64(s230)
		if (l == 2) {
			p = fn_ea788(s240, s210, program_id)
			l = ld64(s240)
			st64(a + 8, ld64(s240 + 8))
			st64(a, l)
			return p
		}
		st64(a + 8, ld64(s230 + 8))
		st64(a, l)
		return p
	}
	const n = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (n & 3) - 2) {
		p = anchor_error_from(s250, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s250)
		st64(a + 8, ld64(s250 + 8))
		st64(a, l)
		return p
	}
	if ((n & 3) == 0) {
		p = anchor_error_from(s250, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s250)
		st64(a + 8, ld64(s250 + 8))
		st64(a, l)
		return p
	}
	const o = ld64(ld64(n + 7))
	if (o == 0) {
		p = anchor_error_from(s250, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s250)
		st64(a + 8, ld64(s250 + 8))
		st64(a, l)
		return p
	}
	callx(o, ld64(n - 1), o)
	p = anchor_error_from(s250, 0x66 /* anchor::InstructionDidNotDeserialize */)
	l = ld64(s250)
	st64(a + 8, ld64(s250 + 8))
	st64(a, l)
	return p
}

// Anchor Accounts::try_accounts of instruction decrease_limit_order (called by ix_decrease_limit_order; name [str]: from the handler's "Instruction: …" log; was fn_e82b8)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: output_token_account (ConstraintMut), input_vault (ConstraintMut, ConstraintRaw), output_vault (ConstraintMut, ConstraintRaw), input_vault_mint (ConstraintAddress), output_vault_mint (ConstraintAddress), token_program, token_program_2022, input_token_account (ConstraintMut), limit_order (ConstraintMut), tick_array (ConstraintMut, ConstraintRaw), pool_state (ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: output_vault_mint_box, input_vault_box, output_vault_box, input_vault_box_2, output_vault_box_2, pool_state [idl], tick_array [idl], input_vault [idl], output_vault [idl]
export function accounts_decrease_limit_order(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const sc8 = fp - 0xc8, sd8 = fp - 0xd8, sf8 = fp - 0xf8, s118 = fp - 0x118, s138 = fp - 0x138, s158 = fp - 0x158, s170 = fp - 0x170, s190 = fp - 0x190, s1b0 = fp - 0x1b0, s250 = fp - 0x250, s2e0 = fp - 0x2e0, s2f8 = fp - 0x2f8, s300 = fp - 0x300, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s598 = fp - 0x598, s5a0 = fp - 0x5a0, s5a8 = fp - 0x5a8, s5b0 = fp - 0x5b0, s5b8 = fp - 0x5b8, s5c0 = fp - 0x5c0, s5c8 = fp - 0x5c8, s5d0 = fp - 0x5d0, s5d8 = fp - 0x5d8, s5e0 = fp - 0x5e0, s5e8 = fp - 0x5e8
	let l, m, ag, ah, ai, al, am, ao, ap, ar, at, av, aw, ay, az, bd, be, bk, bl, bm, bo, bp, bu, bw, bx, by, cd: u64
	let tick_array: AccountInfo
	let j = a
	let p = try_accounts_17a30(sd8, c, c, d, e, r0)
	const i = ld64(sd8 + 8)
	let f = ld64(sd8)
	if (f == 2) {
		p = fn_11e0(sd8, c)
		let o = ld64(sd8 + 8)
		f = ld64(sd8)
		if (f == 2) {
			fn_13d0(sd8, c)
			p = ld64(sd8 + 8)
			f = ld64(sd8)
			if (f == 2) {
				st64(s598 + 0x18, p)
				fn_181f8(sd8, c)
				p = ld64(sd8 + 8)
				const s = ld64(sd8)
				const q = ld8(sc8 + 0x9c)
				if (q == 2) {
					const r = ld64(0x300000000 /* heap bump-allocator cursor */)
					const t = r != 0 ? sat_sub(r, 0xb) : 0x300007ff5
					if ((s & 1) != 0) {
						if (0x300000008 > t) {
							raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0xb > r, s)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, t)
						st64(t, 0x726f5f74696d696c)
						st32(t + 7, 0x72656472)
						void ld64(p)
					} else {
						if (0x300000008 > t) {
							raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0xb > r, s)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, t)
						st64(t, 0x726f5f74696d696c)
						st32(t + 7, 0x72656472)
						void ld64(p)
					}
					st64(p + 0x10, t, 0xb)
					st64(p + 8, 0xb)
					st64(p, 1)
					st64(j + 8, p)
					st64(j, s)
					st8(j + 0x104, 2)
					return p
				}
				st64(s5a8, i)
				st64(s598, o, q, j)
				memcpy(s250, sc8, 0x9c)
				st16(s2e0 + 0x8c, ld16(sc8 + 0x9d))
				st8(s2e0 + 0x8e, ld8(sc8 + 0x9f))
				st64(s5b0, p)
				st64(s300, p)
				st64(s5a0, s)
				st64(s318 + 0x10, s)
				memcpy(s2f8, s250, 0x9c)
				const w = ld64(s598 + 8)
				st8(s2e0 + 0x84, w)
				st16(s2e0 + 0x85, ld16(s2e0 + 0x8c))
				st8(s2e0 + 0x87, ld8(s2e0 + 0x8e))
				p = try_accounts_1678(sd8, c)
				if (ld32(sc8 + 0xa0) == 2) {
					const z = ld64(0x300000000 /* heap bump-allocator cursor */)
					const ad = ld64(s598 + 0x10)
					const aa = ld64(sd8)
					const ab = z != 0 ? sat_sub(z, 0x13) : 0x300007fed
					const ac = ld64(sd8 + 8)
					if (aa != 0) {
						if (0x300000008 > ab) {
							raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008, ad)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ab)
						st64(ab + 8, 0x6f6363615f6e656b)
						st64(ab, 0x6f745f7475706e69)
						st32(ab + 0xf, 0x746e756f)
						void ld64(ac)
					} else {
						if (0x300000008 > ab) {
							raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008, ad)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ab)
						st64(ab + 8, 0x6f6363615f6e656b)
						st64(ab, 0x6f745f7475706e69)
						st32(ab + 0xf, 0x746e756f)
						void ld64(ac)
					}
					st64(ac + 0x10, ab, 0x13)
					st64(ac + 8, 0x13)
					st64(ac, 1)
					st64(ad + 8, ac)
					st64(ad, aa)
					st8(ad + 0x104, 2)
					return p
				}
				const x = ld64(0x300000000 /* heap bump-allocator cursor */)
				const pool_state: AccountInfo = ld64(s598)
				j = ld64(s598 + 0x10)
				const y = x != 0 ? sat_sub(x, 0xd8) : 0x300007f28
				if (0x300000008 > y) {
					alloc_handle_alloc_error(8, 0xd8)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, y & -8)
				if ((y & -8) != 0) {
					st64(s5c0, y & -8)
					memcpy(y & -8, sd8, 0xd8)
					try_accounts_1678(sd8, c)
					if (ld32(sc8 + 0xa0) == 2) {
						p = fn_4130(s318, ld64(sd8), ld64(sd8 + 8), "output_token_account", 0x14)
						st64(s5b8, ld64(s318 + 8))
						f = ld64(s318)
						if (f != 2) {
							st64(j + 8, ld64(s5b8))
							st64(j, f)
							st8(j + 0x104, 2)
							return p
						}
					} else {
						const ae = ld64(0x300000000 /* heap bump-allocator cursor */)
						const af = ae != 0 ? sat_sub(ae, 0xd8) : 0x300007f28
						if (0x300000008 > af) {
							alloc_handle_alloc_error(8, 0xd8)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, af & -8)
						if ((af & -8) == 0) {
							alloc_handle_alloc_error(8, 0xd8)
						}
						st64(s5b8, af & -8)
						memcpy(af & -8, sd8, 0xd8)
					}
					fn_7498(sd8, c, ag, ah, ai)
					let output_vault_mint_box: Mint = ld64(sd8 + 8)
					const aj = ld64(sd8)
					if (aj != 2) {
						p = fn_4130(s328, aj, output_vault_mint_box, 0x10015b11e /* "input_vault" */, 0xb)
						output_vault_mint_box = ld64(s328 + 8)
						f = ld64(s328)
						if (f != 2) {
							st64(j + 8, output_vault_mint_box)
							st64(j, f)
							st8(j + 0x104, 2)
							return p
						}
					}
					st64(s5c8, output_vault_mint_box)
					fn_7498(sd8, c, output_vault_mint_box, al, am)
					output_vault_mint_box = ld64(sd8 + 8)
					const an = ld64(sd8)
					if (an != 2) {
						p = fn_4130(s338, an, output_vault_mint_box, "output_vault", 0xc)
						output_vault_mint_box = ld64(s338 + 8)
						f = ld64(s338)
						if (f != 2) {
							st64(j + 8, output_vault_mint_box)
							st64(j, f)
							st8(j + 0x104, 2)
							return p
						}
					}
					st64(s5d0, output_vault_mint_box)
					fn_7768(sd8, c, output_vault_mint_box, ao, ap)
					output_vault_mint_box = ld64(sd8 + 8)
					const aq = ld64(sd8)
					if (aq != 2) {
						p = fn_4130(s348, aq, output_vault_mint_box, "input_vault_mint", 0x10)
						output_vault_mint_box = ld64(s348 + 8)
						f = ld64(s348)
						if (f != 2) {
							st64(j + 8, output_vault_mint_box)
							st64(j, f)
							st8(j + 0x104, 2)
							return p
						}
					}
					st64(s5d8, output_vault_mint_box)
					fn_7768(sd8, c, output_vault_mint_box, ar, at)
					output_vault_mint_box = ld64(sd8 + 8)
					const au = ld64(sd8)
					if (au != 2) {
						p = fn_4130(s358, au, output_vault_mint_box, "output_vault_mint", 0x11)
						output_vault_mint_box = ld64(s358 + 8)
						f = ld64(s358)
						if (f != 2) {
							st64(j + 8, output_vault_mint_box)
							st64(j, f)
							st8(j + 0x104, 2)
							return p
						}
					}
					st64(s5e0, output_vault_mint_box)
					try_accounts_19190(sd8, c, output_vault_mint_box, av, aw)
					output_vault_mint_box = ld64(sd8 + 8)
					const ax = ld64(sd8)
					if (ax != 2) {
						p = fn_4130(s368, ax, output_vault_mint_box, 0x10015b020 /* "token_program" */, 0xd)
						output_vault_mint_box = ld64(s368 + 8)
						f = ld64(s368)
						if (f != 2) {
							st64(j + 8, output_vault_mint_box)
							st64(j, f)
							st8(j + 0x104, 2)
							return p
						}
					}
					st64(s5e8, output_vault_mint_box)
					p = fn_18cf0(sd8, c, output_vault_mint_box, ay, az)
					output_vault_mint_box = ld64(sd8 + 8)
					const ba = ld64(sd8)
					if (ba != 2) {
						p = fn_4130(s378, ba, output_vault_mint_box, "token_program_2022", 0x12)
						output_vault_mint_box = ld64(s378 + 8)
						f = ld64(s378)
						tick_array = ld64(s598 + 0x18)
						if (f != 2) {
							st64(j + 8, output_vault_mint_box)
							st64(j, f)
							st8(j + 0x104, 2)
							return p
						}
					} else {
						tick_array = ld64(s598 + 0x18)
					}
					if (pool_state.is_writable != 0) {
						if (tick_array.is_writable != 0) {
							const cq: Mint = output_vault_mint_box
							p = fn_4bd8(sd8, tick_array, p)
							o = ld64(sc8)
							f = ld64(sd8 + 8)
							if (ld64(sd8) != 0) {
								st64(j + 8, o)
								st64(j, f)
								st8(j + 0x104, 2)
								return p
							}
							const bf = ld64(ld64(s598))
							copyr(s1b0, bf, 0x20)
							const bg = memcmp(f, s1b0, 0x20)
							st64(o, ld64(o) - 1)
							if ((bg as u32) == 0) {
								if (ld8(ld64(s5a0) + 0x29) != 0) {
									copyr(sd8, s1b0, 0x20)
									const bh = memcmp(s300, sd8, 0x20)
									if ((bh as u32) == 0) {
										const bi = ld64(ld64(s5a8))
										copyr(s190, bi, 0x20)
										const bj = memcmp(s2e0, s190, 0x20)
										if ((bj as u32) == 0) {
											if (ld8(ld64(ld64(s5c0) + 0x20) + 0x29) != 0) {
												copyr(sd8, bi, 0x20)
												if ((memcmp(ld64(s5c0) + 0x48, sd8, 0x20) as u32) != 0) {
													p = anchor_error_from(s448, 0x7df /* anchor::ConstraintTokenOwner */)
													bp = ld64(s448)
													bo = ld64(s598 + 0x10)
													st64(bo + 8, ld64(s448 + 8))
													st64(bo, bp)
													st8(bo + 0x104, 2)
													return p
												}
												const input_vault_box: TokenAccount = ld64(s5c8)
												copyr(sd8, input_vault_box.mint, 0x20)
												if ((memcmp(ld64(s5c0) + 0x28, sd8, 0x20) as u32) == 0) {
													if (ld8(ld64(ld64(s5b8) + 0x20) + 0x29) != 0) {
														copyr(sd8, bi, 0x20)
														if ((memcmp(ld64(s5b8) + 0x48, sd8, 0x20) as u32) != 0) {
															p = anchor_error_from(s488, 0x7df /* anchor::ConstraintTokenOwner */)
															bp = ld64(s488)
															bo = ld64(s598 + 0x10)
															st64(bo + 8, ld64(s488 + 8))
															st64(bo, bp)
															st8(bo + 0x104, 2)
															return p
														}
														const output_vault_box: TokenAccount = ld64(s5d0)
														copyr(sd8, output_vault_box.mint, 0x20)
														const br = memcmp(ld64(s5b8) + 0x28, sd8, 0x20)
														if ((br as u32) == 0) {
															const input_vault: AccountInfo = ld64(ld64(s5c8) + 0x20)
															if (input_vault.is_writable != 0) {
																if ((w & 1) != 0) {
																	const bv = input_vault.key
																	copyr(sd8, bv, 0x20)
																	p = fn_4dc0(s170, ld64(s598), br as u32)
																	bx = ld64(s170 + 0x10)
																	bu = ld64(s170 + 8)
																	if (ld64(s170) != 0) {
																		bw = ld64(s598 + 0x10)
																		st64(bw + 8, bx)
																		st64(bw, bu)
																		st8(bw + 0x104, 2)
																		return p
																	}
																	by = bu + 0x81
																} else {
																	const bt = input_vault.key
																	copyr(sd8, bt, 0x20)
																	p = fn_4dc0(s170, ld64(s598), br as u32)
																	bx = ld64(s170 + 0x10)
																	bu = ld64(s170 + 8)
																	if (ld64(s170) != 0) {
																		bw = ld64(s598 + 0x10)
																		st64(bw + 8, bx)
																		st64(bw, bu)
																		st8(bw + 0x104, 2)
																		return p
																	}
																	by = bu + 0xa1
																}
																const bz = memcmp(sd8, by, 0x20)
																st64(bx, ld64(bx) - 1)
																if ((bz as u32) == 0) {
																	const output_vault: AccountInfo = ld64(ld64(s5d0) + 0x20)
																	if (output_vault.is_writable != 0) {
																		if ((w & 1) != 0) {
																			const cc = output_vault.key
																			copyr(sd8, cc, 0x20)
																			p = fn_4dc0(s170, ld64(s598), bz as u32)
																			bx = ld64(s170 + 0x10)
																			bu = ld64(s170 + 8)
																			if (ld64(s170) != 0) {
																				bw = ld64(s598 + 0x10)
																				st64(bw + 8, bx)
																				st64(bw, bu)
																				st8(bw + 0x104, 2)
																				return p
																			}
																			cd = bu + 0xa1
																		} else {
																			const cb = output_vault.key
																			copyr(sd8, cb, 0x20)
																			p = fn_4dc0(s170, ld64(s598), bz as u32)
																			bx = ld64(s170 + 0x10)
																			bu = ld64(s170 + 8)
																			if (ld64(s170) != 0) {
																				bw = ld64(s598 + 0x10)
																				st64(bw + 8, bx)
																				st64(bw, bu)
																				st8(bw + 0x104, 2)
																				return p
																			}
																			cd = bu + 0x81
																		}
																		const ce = memcmp(sd8, cd, 0x20)
																		st64(bx, ld64(bx) - 1)
																		if ((ce as u32) == 0) {
																			const input_vault_box_2: TokenAccount = ld64(s5c8)
																			const cg = ld64(ld64(ld64(s5d8) + 0x58))
																			copyr(s158, cg, 0x20)
																			copy(s138, input_vault_box_2.mint, 0x20)
																			if ((memcmp(s158, s138, 0x20) as u32) != 0) {
																				anchor_error_from(s528, 0x7dc /* anchor::ConstraintAddress */)
																				const co = fn_4130(s538, ld64(s528), ld64(s528 + 8), "input_vault_mint", 0x10)
																				const cn = ld64(s538 + 8)
																				const cm = ld64(s538)
																				copy(sd8, s158, 0x40)
																				p = Error_with_pubkeys(s548, cm, cn, sd8, co)
																				bp = ld64(s548)
																				bo = ld64(s598 + 0x10)
																				st64(bo + 8, ld64(s548 + 8))
																				st64(bo, bp)
																				st8(bo + 0x104, 2)
																				return p
																			}
																			const output_vault_box_2: TokenAccount = ld64(s5d0)
																			const ci = ld64(ld64(ld64(s5e0) + 0x58))
																			copyr(s118, ci, 0x20)
																			copy(sf8, output_vault_box_2.mint, 0x20)
																			if ((memcmp(s118, sf8, 0x20) as u32) == 0) {
																				const cp = ld64(s598 + 0x10)
																				p = memcpy(cp + 0x68, s250, 0x9c)
																				const cs = ld8(s2e0 + 0x8e)
																				const cr = ld16(s2e0 + 0x8c)
																				st8(cp + 0x104, w)
																				st64(cp + 0x60, ld64(s5b0))
																				st64(cp + 0x58, ld64(s5a0))
																				st64(cp + 0x50, cq)
																				st64(cp + 0x48, ld64(s5e8))
																				st64(cp + 0x40, ld64(s5e0))
																				st64(cp + 0x38, ld64(s5d8))
																				st64(cp + 0x30, ld64(s5d0))
																				st64(cp + 0x28, ld64(s5c8))
																				st64(cp + 0x20, ld64(s5b8))
																				st64(cp + 0x18, ld64(s5c0))
																				st64(cp + 0x10, ld64(s598 + 0x18))
																				st64(cp + 8, ld64(s598))
																				st64(cp, ld64(s5a8))
																				st16(cp + 0x105, cr)
																				st8(cp + 0x107, cs)
																				return p
																			}
																			anchor_error_from(s558, 0x7dc /* anchor::ConstraintAddress */)
																			const cl = fn_4130(s568, ld64(s558), ld64(s558 + 8), "output_vault_mint", 0x11)
																			const ck = ld64(s568 + 8)
																			const cj = ld64(s568)
																			copy(sd8, s118, 0x40)
																			p = Error_with_pubkeys(s578, cj, ck, sd8, cl)
																			bp = ld64(s578)
																			bo = ld64(s598 + 0x10)
																			st64(bo + 8, ld64(s578 + 8))
																			st64(bo, bp)
																			st8(bo + 0x104, 2)
																			return p
																		}
																		anchor_error_from(s508, 0x7d3 /* anchor::ConstraintRaw */)
																		p = fn_4130(s518, ld64(s508), ld64(s508 + 8), "output_vault", 0xc)
																		bp = ld64(s518)
																		bo = ld64(s598 + 0x10)
																		st64(bo + 8, ld64(s518 + 8))
																		st64(bo, bp)
																		st8(bo + 0x104, 2)
																		return p
																	}
																	anchor_error_from(s4e8, 0x7d0 /* anchor::ConstraintMut */)
																	p = fn_4130(s4f8, ld64(s4e8), ld64(s4e8 + 8), "output_vault", 0xc)
																	bp = ld64(s4f8)
																	bo = ld64(s598 + 0x10)
																	st64(bo + 8, ld64(s4f8 + 8))
																	st64(bo, bp)
																	st8(bo + 0x104, 2)
																	return p
																}
																anchor_error_from(s4c8, 0x7d3 /* anchor::ConstraintRaw */)
																p = fn_4130(s4d8, ld64(s4c8), ld64(s4c8 + 8), 0x10015b11e /* "input_vault" */, 0xb)
																bp = ld64(s4d8)
																bo = ld64(s598 + 0x10)
																st64(bo + 8, ld64(s4d8 + 8))
																st64(bo, bp)
																st8(bo + 0x104, 2)
																return p
															}
															anchor_error_from(s4a8, 0x7d0 /* anchor::ConstraintMut */)
															p = fn_4130(s4b8, ld64(s4a8), ld64(s4a8 + 8), 0x10015b11e /* "input_vault" */, 0xb)
															bp = ld64(s4b8)
															bo = ld64(s598 + 0x10)
															st64(bo + 8, ld64(s4b8 + 8))
															st64(bo, bp)
															st8(bo + 0x104, 2)
															return p
														}
														p = anchor_error_from(s498, 0x7de /* anchor::ConstraintTokenMint */)
														bp = ld64(s498)
														bo = ld64(s598 + 0x10)
														st64(bo + 8, ld64(s498 + 8))
														st64(bo, bp)
														st8(bo + 0x104, 2)
														return p
													}
													anchor_error_from(s468, 0x7d0 /* anchor::ConstraintMut */)
													p = fn_4130(s478, ld64(s468), ld64(s468 + 8), "output_token_account", 0x14)
													bp = ld64(s478)
													bo = ld64(s598 + 0x10)
													st64(bo + 8, ld64(s478 + 8))
													st64(bo, bp)
													st8(bo + 0x104, 2)
													return p
												}
												p = anchor_error_from(s458, 0x7de /* anchor::ConstraintTokenMint */)
												bp = ld64(s458)
												bo = ld64(s598 + 0x10)
												st64(bo + 8, ld64(s458 + 8))
												st64(bo, bp)
												st8(bo + 0x104, 2)
												return p
											}
											anchor_error_from(s428, 0x7d0 /* anchor::ConstraintMut */, bk, bl, bm)
											p = fn_4130(s438, ld64(s428), ld64(s428 + 8), "input_token_account", 0x13)
											bp = ld64(s438)
											bo = ld64(s598 + 0x10)
											st64(bo + 8, ld64(s438 + 8))
											st64(bo, bp)
											st8(bo + 0x104, 2)
											return p
										}
									}
									anchor_error_from(s408, 0x7d3 /* anchor::ConstraintRaw */, bk, bl, bm)
									p = fn_4130(s418, ld64(s408), ld64(s408 + 8), 0x10015b336 /* "limit_order" */, 0xb)
									f = ld64(s418)
									st64(j + 8, ld64(s418 + 8))
									st64(j, f)
									st8(j + 0x104, 2)
									return p
								}
								anchor_error_from(s3e8, 0x7d0 /* anchor::ConstraintMut */)
								p = fn_4130(s3f8, ld64(s3e8), ld64(s3e8 + 8), 0x10015b336 /* "limit_order" */, 0xb)
								f = ld64(s3f8)
								st64(j + 8, ld64(s3f8 + 8))
								st64(j, f)
								st8(j + 0x104, 2)
								return p
							}
							anchor_error_from(s3c8, 0x7d3 /* anchor::ConstraintRaw */)
							p = fn_4130(s3d8, ld64(s3c8), ld64(s3c8 + 8), 0x10015a23e /* "tick_array" */, 0xa)
							f = ld64(s3d8)
							st64(j + 8, ld64(s3d8 + 8))
							st64(j, f)
							st8(j + 0x104, 2)
							return p
						}
						anchor_error_from(s3a8, 0x7d0 /* anchor::ConstraintMut */, output_vault_mint_box, bd, be)
						p = fn_4130(s3b8, ld64(s3a8), ld64(s3a8 + 8), 0x10015a23e /* "tick_array" */, 0xa)
						f = ld64(s3b8)
						st64(j + 8, ld64(s3b8 + 8))
						st64(j, f)
						st8(j + 0x104, 2)
						return p
					}
					anchor_error_from(s388, 0x7d0 /* anchor::ConstraintMut */, output_vault_mint_box, bd, be)
					p = fn_4130(s398, ld64(s388), ld64(s388 + 8), "pool_state", 0xa)
					f = ld64(s398)
					st64(j + 8, ld64(s398 + 8))
					st64(j, f)
					st8(j + 0x104, 2)
					return p
				}
				alloc_handle_alloc_error(8, 0xd8)
			}
			const u = ld64(0x300000000 /* heap bump-allocator cursor */)
			l = 0xa > u
			m = l != 0 ? 0 : u - 0xa
			const v = u != 0 ? m : 0x300007ff6
			if ((f & 1) != 0) {
				if (0x300000008 > v) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, m, l)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, v)
				st64(v, 0x7272615f6b636974)
				st16(v + 8, 0x7961)
				void ld64(p)
			} else {
				if (0x300000008 > v) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, m, l)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, v)
				st64(v, 0x7272615f6b636974)
				st16(v + 8, 0x7961)
				void ld64(p)
			}
			st64(p + 0x10, v, 0xa)
			st64(p + 8, 0xa)
			st64(p, 1)
			st64(j + 8, p)
			st64(j, f)
			st8(j + 0x104, 2)
			return p
		}
		const k = ld64(0x300000000 /* heap bump-allocator cursor */)
		l = 0xa > k
		m = l != 0 ? 0 : k - 0xa
		const n = k != 0 ? m : 0x300007ff6
		if ((f & 1) != 0) {
			if (0x300000008 > n) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, m, l)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, n)
			st64(n, 0x6174735f6c6f6f70)
			st16(n + 8, 0x6574)
			void ld64(o)
		} else {
			if (0x300000008 > n) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, m, l)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, n)
			st64(n, 0x6174735f6c6f6f70)
			st16(n + 8, 0x6574)
			void ld64(o)
		}
		st64(o + 0x10, n, 0xa)
		st64(o + 8, 0xa)
		st64(o, 1)
		st64(j + 8, o)
		st64(j, f)
		st8(j + 0x104, 2)
		return p
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 5) : 0x300007ffb
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(g, 5), 5 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 4, 0x72)
		st32(h, 0x656e776f)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(g, 5), 5 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 4, 0x72)
		st32(h, 0x656e776f)
		void ld64(i)
	}
	st64(i + 0x10, h, 5)
	st64(i + 8, 5)
	st64(i, 1)
	st64(j + 8, i)
	st64(j, f)
	st8(j + 0x104, 2)
	return p
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value)
// types [heur]: b: DecreaseLimitOrderContext (the handler ix_decrease_limit_order passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_530f0(a: u64, b: DecreaseLimitOrderContext, c: u64, d: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s90 = fp - 0x90, s108 = fp - 0x108, s110 = fp - 0x110, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8, s200 = fp - 0x200, s208 = fp - 0x208, s210 = fp - 0x210, s218 = fp - 0x218, s1000 = fp - 0x1000
	let g, i, o, p, bu, cd, ce, cf, cn: u64
	st64(s1d8 + 0x10, a)
	if (c != 0) {
		st64(s1d8, b, d)
		const accounts: DecreaseLimitOrderAccounts = b.accounts
		i = fn_4dc0(s130, ld64(accounts + 8), r0)
		let h = ld64(s130 + 0x10)
		g = ld64(s130 + 8)
		if (ld64(s130) != 0) {
			p = ld64(s1d8 + 0x10)
			st64(p + 8, h)
			st64(p, g)
			return i
		}
		const l = ld16(g + 0xe3)
		st64(h, ld64(h) - 1)
		i = fn_51c8(s130, ld64(accounts + 0x10), h, undef, undef, i)
		const j = ld64(s130 + 0x10)
		const k = ld64(s130 + 8)
		h = j
		g = k
		if (ld64(s130) != 0) {
			p = ld64(s1d8 + 0x10)
			st64(p + 8, h)
			st64(p, g)
			return i
		}
		st64(s1e0, j)
		const m = ld32(accounts + 0x100)
		st64(s1e8, k)
		i = fn_71a20(s130, ld32(k + 0x20), m, l)
		g = ld64(s130)
		if (g != 2) {
			h = ld64(s130 + 8)
			o = ld64(s1e0)
			st64(o, ld64(o) + 1)
			p = ld64(s1d8 + 0x10)
			st64(p + 8, h)
			st64(p, g)
			return i
		}
		const n = ld64(s130 + 8)
		if (0x3c > n) {
			const q = ld64(s1e8) + 0x24 + n * 0xa8
			let r = 1
			if ((ld64(q + 0x14) | ld64(q + 0x1c)) == 0 && ld64(q + 0x7c) == 0) {
				r = ld64(q + 0x84) != 0
			}
			st64(s1f8, r)
			st64(s208, l)
			st64(s1f0, accounts)
			i = fn_67490(s130, accounts + 0x60, q, c, i)
			let s = ld64(s130 + 0x10)
			const t = ld64(s130 + 8)
			h = s
			g = t
			if (ld64(s130) != 0) {
				o = ld64(s1e0)
				st64(o, ld64(o) + 1)
				p = ld64(s1d8 + 0x10)
				st64(p + 8, h)
				st64(p, g)
				return i
			}
			const u: DecreaseLimitOrderAccounts = ld64(s1f0)
			const v = ld64(ld64(u + 8))
			copyr(s130, v, 0x20)
			const w = ld64(ld64(u + 0x58))
			copyr(s110, w, 0x20)
			const x = ld64(0x300000000 /* heap bump-allocator cursor */)
			const y = x != 0 ? sat_sub(x, 0x100) : 0x300007f00
			st64(s200, t)
			if (y > 0x300000007) {
				B35: {
					B17: {
						st64(s210, u + 8)
						const ad = ld8(u + 0x104)
						const ac = ld32(u + 0x100)
						const ab = ld64(u + 0xa8)
						const aa = ld64(u + 0xb0)
						st64(0x300000000 /* heap bump-allocator cursor */, y)
						st64(y, 0xa3d4eddbdd283046 /* event:DecreaseLimitOrderEvent */)
						copy(y + 8, s130, 0x40)
						st64(y + 0x65, s)
						const z = ld64(s200)
						st64(y + 0x5d, z)
						st64(y + 0x55, aa)
						st64(y + 0x4d, ab)
						st32(y + 0x49, ac)
						st8(y + 0x48, ad)
						st64(s48, y, 0x6d)
						i = log_data(s48, 1)
						h = undef
						if ((ld64(s1f8) & 1) != 0 && ((ld64(q + 0x14) | ld64(q + 0x1c)) == 0 && (ld64(q + 0x7c) == 0 && ld64(q + 0x84) == 0))) {
							const bs = ld64(s1e8)
							const bt = ld8(bs + 0x2784)
							if (bt == 0) {
								i = fn_88360(s140, 0x26)
								h = ld64(s140 + 8)
								g = ld64(s140)
								if (g != 2) {
									o = ld64(s1e0)
									st64(o, ld64(o) + 1)
									p = ld64(s1d8 + 0x10)
									st64(p + 8, h)
									st64(p, g)
									return i
								}
								bu = ld8(ld64(s1e8) + 0x2784)
							} else {
								bu = bt - 1
								st8(bs + 0x2784, bu)
							}
							if ((bu as u8) == 0) {
								i = fn_53e8(s130, ld64(ld64(s210)), h, ce, cf, i)
								h = ld64(s130 + 0x10)
								g = ld64(s130 + 8)
								if (ld64(s130) != 0) {
									o = ld64(s1e0)
									st64(o, ld64(o) + 1)
									p = ld64(s1d8 + 0x10)
									st64(p + 8, h)
									st64(p, g)
									return i
								}
								const cm = h
								const cg = fn_72940(ld32(ld64(s1f0) + 0x100), ld64(s208), h)
								const ch = ld64(0x300000000 /* heap bump-allocator cursor */)
								const ci = ch != 0 ? sat_sub(ch, 4) & -4 : 0x300007ffc
								if (0x300000008 > ci) {
									alloc_handle_alloc_error(4, 4)
								}
								B61: {
									st64(0x300000000 /* heap bump-allocator cursor */, ci)
									st32(ci, cg)
									st64(s130, 1, ci, 1)
									const cj = fn_6f618(g, s130)
									let cl = 0
									if (cj != 0) {
										const ck = ld64(s1d8)
										if (ld64(ck + 0x18) == 0) {
											fn_85138(s90, 0x1001598a0)
											st64(s78, 0, 1, 0)
											st64(s28, s78, 0x10015f818)
											st8(s20 + 0x10, 3)
											st64(s20 + 8, 0x20)
											st64(s38, 0)
											st64(s48, 0)
											if (fn_88558(0x1001598a0, s48) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copy(s110, s90, 0x30)
											st64(s130 + 8, 0x10015a289)
											st32(s108 + 0x70, 0x1772 /* error::AccountLack */)
											st8(s108 + 0x28, 2)
											st32(s130 + 0x18, 0x89)
											st64(s130 + 0x10, 0x41)
											st64(s130, 0)
											i = fn_13e5a0(s1b0, s130)
											cn = ld64(s1b0 + 8)
											g = ld64(s1b0)
											break B61
										}
										cl = ld64(ck + 0x10)
									}
									i = fn_6d670(s150, g, cl, cg)
									h = undef
									cn = ld64(s150 + 8)
									g = ld64(s150)
									if (g == 2) {
										st64(cm, ld64(cm) + 1)
										if (ld64(s200) == 0) {
											break B35
										}
										break B17
									}
								}
								st64(cm, ld64(cm) + 1)
								o = ld64(s1e0)
								st64(o, ld64(o) + 1)
								p = ld64(s1d8 + 0x10)
								st64(p + 8, cn)
								st64(p, g)
								return i
							}
						}
						if (z == 0) {
							break B35
						}
					}
					const ae: DecreaseLimitOrderAccounts = ld64(s1f0)
					const af: AccountInfo = ae.output_vault.info
					const ag: LamportsCell = af.lamports
					const am = af.key
					rc_inc(ag)
					const ah: DataCell = af.data
					rc_inc(ah)
					const al = af.owner
					const ak = af.rent_epoch
					const aj = af.is_signer
					const ai = af.is_writable
					st8(s50 + 2, af.executable)
					st8(s50, aj, ai)
					st64(s78, am, ag, ah, al, ak)
					const an: AccountInfo = ld64(ld64(ae + 0x20) + 0x20)
					const ao: LamportsCell = an.lamports
					const ap = ao.strong
					st64(s1e8, s)
					const ax = an.key
					rc_inc(ao, ap)
					const aq: DataCell = an.data
					const ar = aq.strong
					st64(s1d8, ao)
					rc_inc(aq, ar)
					const aw = an.owner
					const av = an.rent_epoch
					const au = an.is_signer
					const at = an.is_writable
					st8(s20 + 2, an.executable)
					st8(s20, au, at)
					st64(s38, aq, aw, av)
					st64(s40, ld64(s1d8))
					st64(s48, ax)
					const ay = ld64(0x300000000 /* heap bump-allocator cursor */)
					st64(s1f8, ag)
					const az = ay != 0 ? sat_sub(ay, 0x80) & -8 : 0x300007f80
					st64(s208, ah)
					if (0x300000007 >= az) {
						alloc_handle_alloc_error(8, 0x80)
					}
					st64(s218, aq)
					const output_vault_mint: Mint = ae.output_vault_mint
					st64(0x300000000 /* heap bump-allocator cursor */, az)
					const bb: AccountInfo = output_vault_mint.info
					memcpy(az, output_vault_mint, 0x58)
					st64(az + 0x58, bb)
					const bc: DecreaseLimitOrderAccounts = ld64(s1f0)
					copy(az + 0x60, output_vault_mint + 0x60, 0x20)
					const bd: AccountInfo = ld64(bc + 0x50)
					const be: LamportsCell = bd.lamports
					const bl = ld64(bc + 0x48)
					const bk = bd.key
					rc_inc(be)
					const bf: DataCell = bd.data
					rc_inc(bf)
					const bj = bd.owner
					const bi = bd.rent_epoch
					const bh = bd.is_signer
					const bg = bd.is_writable
					st8(s108 + 2, bd.executable)
					st8(s108, bh, bg)
					st64(s130, bk, be, bf, bj, bi)
					st64(s1000 + 0x18, ld64(s200))
					st64(s1000, az, bl, s130)
					i = fn_7a038(s160, ld64(s210), s78, s48, az, bl, s130, ld64(s1000 + 0x18), bj)
					h = ld64(s160 + 8)
					g = ld64(s160)
					const bm = ld64(s1d8)
					const bn = h
					if (rc_release(bm)) {
						i = Rc_drop_slow_14df0(s40, i)
						h = bn
					}
					const bo: DataCell = ld64(s218)
					const bq = ld64(s208)
					if (rc_release(bo)) {
						i = Rc_drop_slow_14df0(s38, i)
						h = bn
					}
					const bp = ld64(s1f8)
					s = ld64(s1e8)
					if (rc_release(bp)) {
						i = Rc_drop_slow_14df0(s70, i)
						h = bn
					}
					if (rc_release(bq)) {
						i = Rc_drop_slow_14df0(s68, i)
						h = bn
					}
					if (g != 2) {
						o = ld64(s1e0)
						st64(o, ld64(o) + 1)
						p = ld64(s1d8 + 0x10)
						st64(p + 8, h)
						st64(p, g)
						return i
					}
				}
				if (s == 0) {
					cd = ld64(s1e0)
					st64(cd, ld64(cd) + 1)
					p = ld64(s1d8 + 0x10)
					st64(p + 8, h)
					st64(p, 2)
					return i
				}
				i = fn_7da68(s130, fn_16330(ld64(ld64(s1f0) + 0x38)), s)
				h = ld64(s130 + 8)
				g = ld64(s130)
				if (g != 2) {
					o = ld64(s1e0)
					st64(o, ld64(o) + 1)
					p = ld64(s1d8 + 0x10)
					st64(p + 8, h)
					st64(p, g)
					return i
				}
				if (h > s) {
					i = fn_88360(s1a0, 0x26)
					h = ld64(s1a0 + 8)
					g = ld64(s1a0)
					o = ld64(s1e0)
					st64(o, ld64(o) + 1)
					p = ld64(s1d8 + 0x10)
					st64(p + 8, h)
					st64(p, g)
					return i
				}
				const br = s - h
				if (ld64(s1d8 + 8) > br) {
					fn_85138(s90, 0x100159904)
					st64(s78, 0, 1, 0)
					st64(s28, s78, 0x10015f818)
					st8(s20 + 0x10, 3)
					st64(s20 + 8, 0x20)
					st64(s38, 0)
					st64(s48, 0)
					if (fn_88558(0x100159904, s48) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
					}
					copy(s110, s90, 0x30)
					st64(s130 + 8, 0x10015a289)
					st32(s108 + 0x70, 0x1781 /* error::PriceSlippageCheck */)
					st8(s108 + 0x28, 2)
					st32(s130 + 0x18, 0xa5)
					st64(s130 + 0x10, 0x41)
					st64(s130, 0)
					fn_13e5a0(s180, s130)
					i = fn_1730(s190, ld64(s180), ld64(s180 + 8), br, ld64(s1d8 + 8))
					h = ld64(s190 + 8)
					g = ld64(s190)
					o = ld64(s1e0)
					st64(o, ld64(o) + 1)
					p = ld64(s1d8 + 0x10)
					st64(p + 8, h)
					st64(p, g)
					return i
				}
				st64(s1e8, s)
				const bv: DecreaseLimitOrderAccounts = ld64(s1f0)
				const bw: AccountInfo = bv.input_vault.info
				st64(s1d8 + 8, s78)
				AccountInfo_clone_f338(s78, bw)
				AccountInfo_clone_f338(s48, ld64(ld64(bv + 0x18) + 0x20))
				const bx = fn_16330(bv.input_vault_mint)
				const by = ld64(bv + 0x48)
				const ca = AccountInfo_clone_f338(s130, ld64(bv + 0x50))
				st64(s1000 + 0x18, ld64(s1e8))
				st64(s1000, bx, by, s130)
				const bz = ld64(s1d8 + 8)
				const cb = fn_7a038(s170, ld64(s210), bz, s48, bx, by, s130, ld64(s1000 + 0x18), ca)
				const cc = ld64(s170 + 8)
				g = ld64(s170)
				i = ptr_drop_in_place_fcd8(bz, ptr_drop_in_place_fcd8(s48, cb))
				h = cc
				if (g == 2) {
					cd = ld64(s1e0)
					st64(cd, ld64(cd) + 1)
					p = ld64(s1d8 + 0x10)
					st64(p + 8, h)
					st64(p, 2)
					return i
				}
				o = ld64(s1e0)
				st64(o, ld64(o) + 1)
				p = ld64(s1d8 + 0x10)
				st64(p + 8, h)
				st64(p, g)
				return i
			}
			raw_vec_handle_error(1, 0x100, 0x100160a60, 0x100 > x, t)
		}
		fn_14ec98(n, 0x3c, 0x1001602d8)
	}
	fn_85138(s90, 0x100159888)
	st64(s78, 0, 1, 0)
	st64(s28, s78, 0x10015f818)
	st8(s20 + 0x10, 3)
	st64(s20 + 8, 0x20)
	st64(s38, 0)
	st64(s48, 0)
	if (fn_88558(0x100159888, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(s110, s90, 0x30)
	st64(s130 + 8, 0x10015a289)
	st32(s108 + 0x70, 0x1784 /* error::ZeroAmountSpecified */)
	st8(s108 + 0x28, 2)
	st32(s130 + 0x18, 0x61)
	st64(s130 + 0x10, 0x41)
	st64(s130, 0)
	i = fn_13e5a0(s1c0, s130)
	g = ld64(s1c0)
	p = ld64(s1d8 + 0x10)
	st64(p + 8, ld64(s1c0 + 8))
	st64(p, g)
	return i
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value)
export function fn_67490(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158
	let h = fn_668d8(s118, b, c, r0)
	let g = ld64(s118 + 8)
	let f = ld64(s118)
	if (f != 2) {
		st64(a + 0x10, g)
		st64(a + 8, f)
		st64(a, 1)
		return h
	}
	const v = g
	fn_667d0(s118, b)
	h = ld64(s118 + 8)
	f = ld64(s118)
	if (f == 2) {
		if (h == 0) {
			st64(a + 8, v, 0)
			st64(a, 0)
			return h
		}
		const j = ld64(c + 0x74)
		const i = ld64(b + 0x40)
		if (i == j) {
			h = min(h, d)
			const l = ld64(c + 0x7c)
			if (h > l) {
				h = fn_88360(s158, 0x26)
				f = ld64(s158)
				st64(a + 0x10, ld64(s158 + 8))
				st64(a + 8, f)
				st64(a, 1)
				return h
			}
			st64(c + 0x7c, l - h)
			if (h == 0) {
				st64(a + 8, v, 0)
				st64(a, 0)
				return h
			}
		} else {
			if ((i != -1 ? i + 1 : 0xffffffffffffffff) != j) {
				fn_85138(s78, 0x100159840)
				st64(s60, 0, 1, 0)
				st64(s28, s60, 0x10015f818)
				st8(s28 + 0x18, 3)
				st64(s28 + 0x10, 0x20)
				st64(s48 + 0x10, 0)
				st64(s48, 0)
				if (fn_88558(0x100159840, s48) != 0) {
					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
				}
				copy(sf8, s78, 0x30)
				st64(s118 + 8, 0x10015a641)
				st32(sf8 + 0x78, 0x1798 /* error::OrderAlreadyFilled */)
				st8(sf8 + 0x30, 2)
				st32(s118 + 0x18, 0xd9)
				st64(s118 + 0x10, 0x26)
				st64(s118, 0)
				h = fn_13e5a0(s128, s118)
				f = ld64(s128)
				st64(a + 0x10, ld64(s128 + 8))
				st64(a + 8, f)
				st64(a, 1)
				return h
			}
			const k = ld64(c + 0x84)
			h = min(min(h, d), k)
			st64(c + 0x84, k - h)
			if (h == 0) {
				st64(a + 8, v, 0)
				st64(a, 0)
				return h
			}
		}
		const m = ld64(b + 0x48)
		if (h > m) {
			h = fn_88360(s148, 0x26)
			f = ld64(s148)
			st64(a + 0x10, ld64(s148 + 8))
			st64(a + 8, f)
			st64(a, 1)
			return h
		}
		const u = h
		let n = m - h
		st64(b + 0x48, n)
		let r = 0x58
		if ((i != -1 ? i + 1 : 0xffffffffffffffff) == j) {
			h = fn_667d0(s118, b)
			const p = ld64(s118 + 8)
			const o = ld64(s118)
			if (o != 2) {
				st64(a + 0x10, p)
				st64(a + 8, o)
				st64(a, 1)
				return h
			}
			st64(b + 0x58, p)
			const q = ld64(c + 0x8c)
			st64(b + 0x78, ld64(c + 0x94))
			st64(b + 0x70, q)
			n = 0
			r = 0x60
		}
		st64(b + r, n)
		h = fn_667d0(s118, b)
		g = ld64(s118 + 8)
		f = ld64(s118)
		if (f == 2) {
			if (g == 0) {
				st64(a + 0x10, u)
				st64(a + 8, v)
				st64(a, 0)
				return h
			}
			h = fn_514e0(s138, g, ld32(b + 0xa0), ld8(b + 0xa4), h)
			const s = ld64(s138)
			if (s == 2) {
				st64(a + 0x10, u)
				st64(a + 8, v)
				st64(a, 0)
				return h
			}
			const t = ld64(s138 + 8)
			st64(a + 8, s, t)
			st64(a, 1)
			return h
		}
		st64(a + 0x10, g)
		st64(a + 8, f)
		st64(a, 1)
		return h
	}
	st64(a + 0x10, h)
	st64(a + 8, f)
	st64(a, 1)
	return h
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: input_vault, output_vault
export function fn_ea788(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8
	let h, i, j: u64
	let n = fn_a80(s28, ld64(b + 8), c)
	let f = ld64(s28)
	if (f == 2) {
		n = fn_1008(s38, ld64(b + 0x10), c)
		f = ld64(s38)
		if (f == 2) {
			n = fn_af28(s48, b + 0x58, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
			f = ld64(s48)
			if (f == 2) {
				const o = ld64(b + 0x18)
				const p = ld64(o + 0x20)
				if ((memcmp(o, c, 0x20) as u32) == 0 && (common_is_closed(p) == 0 && ld64(ld64(p + 0x10) + 0x10) != 0)) {
					st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
					n = fn_13e628(s58, s18)
					f = ld64(s58)
					if (f != 2) {
						const q = ld64(0x300000000 /* heap bump-allocator cursor */)
						const r = q != 0 ? sat_sub(q, 0x13) : 0x300007fed
						j = ld64(s58 + 8)
						if ((f & 1) != 0) {
							if (0x300000008 > r) {
								raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008, 0x13 > q)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, r)
							st64(r + 8, 0x6f6363615f6e656b)
							st64(r, 0x6f745f7475706e69)
							st32(r + 0xf, 0x746e756f)
							void ld64(j)
						} else {
							if (0x300000008 > r) {
								raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008, 0x13 > q)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, r)
							st64(r + 8, 0x6f6363615f6e656b)
							st64(r, 0x6f745f7475706e69)
							st32(r + 0xf, 0x746e756f)
							void ld64(j)
						}
						st64(j + 0x10, r, 0x13)
						st64(j + 8, 0x13)
						st64(j, 1)
						st64(a + 8, j)
						st64(a, f)
						return n
					}
				}
				const s = ld64(b + 0x20)
				const t = ld64(s + 0x20)
				if ((memcmp(s, c, 0x20) as u32) == 0 && (common_is_closed(t) == 0 && ld64(ld64(t + 0x10) + 0x10) != 0)) {
					st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
					n = fn_13e628(s68, s18)
					f = ld64(s68)
					if (f != 2) {
						const u = ld64(0x300000000 /* heap bump-allocator cursor */)
						const v = u != 0 ? sat_sub(u, 0x14) : 0x300007fec
						j = ld64(s68 + 8)
						if ((f & 1) != 0) {
							if (0x300000008 > v) {
								raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > u)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, v)
							st64(v + 8, 0x6363615f6e656b6f)
							st64(v, 0x745f74757074756f)
							st32(v + 0x10, 0x746e756f)
							void ld64(j)
						} else {
							if (0x300000008 > v) {
								raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > u)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, v)
							st64(v + 8, 0x6363615f6e656b6f)
							st64(v, 0x745f74757074756f)
							st32(v + 0x10, 0x746e756f)
							void ld64(j)
						}
						st64(j + 0x10, v, 0x14)
						st64(j + 8, 0x14)
						st64(j, 1)
						st64(a + 8, j)
						st64(a, f)
						return n
					}
				}
				const w = ld64(b + 0x28)
				const x = ld64(w + 0x20)
				if ((memcmp(w, c, 0x20) as u32) == 0 && (common_is_closed(x) == 0 && ld64(ld64(x + 0x10) + 0x10) != 0)) {
					st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
					fn_13e628(s78, s18)
					const y = ld64(s78)
					if (y != 2) {
						n = fn_4130(s88, y, ld64(s78 + 8), 0x10015b11e /* "input_vault" */, 0xb)
						j = ld64(s88 + 8)
						f = ld64(s88)
						if (f != 2) {
							st64(a + 8, j)
							st64(a, f)
							return n
						}
					}
				}
				const z = ld64(b + 0x30)
				n = fn_a1d8(s98, ld64(z + 0x20), z, c)
				j = undef
				const aa = ld64(s98)
				if (aa == 2) {
					st64(a + 8, j)
					st64(a, 2)
					return n
				}
				n = fn_4130(sa8, aa, ld64(s98 + 8), "output_vault", 0xc)
				f = ld64(sa8)
				st64(a + 8, ld64(sa8 + 8))
				st64(a, f)
				return n
			}
			const l = ld64(0x300000000 /* heap bump-allocator cursor */)
			const m = l != 0 ? sat_sub(l, 0xb) : 0x300007ff5
			j = ld64(s48 + 8)
			if ((f & 1) != 0) {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, 0xb > l)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m, 0x726f5f74696d696c)
				st32(m + 7, 0x72656472)
				void ld64(j)
			} else {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, 0xb > l)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m, 0x726f5f74696d696c)
				st32(m + 7, 0x72656472)
				void ld64(j)
			}
			st64(j + 0x10, m, 0xb)
			st64(j + 8, 0xb)
			st64(j, 1)
			st64(a + 8, j)
			st64(a, f)
			return n
		}
		const k = ld64(0x300000000 /* heap bump-allocator cursor */)
		h = 0xa > k
		i = k != 0 ? h != 0 ? 0 : k - 0xa : 0x300007ff6
		j = ld64(s38 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i, 0x7272615f6b636974)
			st16(i + 8, 0x7961)
			void ld64(j)
		} else {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i, 0x7272615f6b636974)
			st16(i + 8, 0x7961)
			void ld64(j)
		}
	} else {
		const g = ld64(0x300000000 /* heap bump-allocator cursor */)
		h = 0xa > g
		i = g != 0 ? h != 0 ? 0 : g - 0xa : 0x300007ff6
		j = ld64(s28 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i, 0x6174735f6c6f6f70)
			st16(i + 8, 0x6574)
			void ld64(j)
		} else {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i, 0x6174735f6c6f6f70)
			st16(i + 8, 0x6574)
			void ld64(j)
		}
	}
	st64(j + 0x10, i, 0xa)
	st64(j + 8, 0xa)
	st64(j, 1)
	st64(a + 8, j)
	st64(a, f)
	return n
}
