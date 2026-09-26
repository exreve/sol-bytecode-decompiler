/// <reference path="../lib.d.ts" />
// instruction increase_limit_order
import { anchor_error_from, fn_1008, fn_13e5a0, fn_13e628, fn_14ed60, fn_16330, fn_181f8, fn_4130, fn_4bd8, fn_4dc0, fn_514e0, fn_51b90, fn_51c8, fn_53e8, fn_6d670, fn_6f618, fn_717b0, fn_7da68, fn_85138, fn_88360, fn_88558, fn_a80, fn_af28, log_data, memcpy } from '../shared.ts'

// instruction handler: increase_limit_order (discriminator sha256("global:increase_limit_order")[..8] = 0x637dbafaec5990b1)
// accounts [idl]: 0 owner [signer], 1 pool_state [mut], 2 tick_array [mut], 3 limit_order [mut], 4 input_token_account [mut], 5 input_vault [mut], 6 input_vault_mint, 7 input_token_program
// args [idl]: amount: u64
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, amount
export function ix_increase_limit_order(a: u64, program_id: u64, accounts: u64, accounts_len: u64, args: IncreaseLimitOrderArgs, ix_args_len: u64): u64 {
	const sd8 = fp - 0xd8, se8 = fp - 0xe8, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210
	let i, m: u64
	const f = sol_log("Instruction: IncreaseLimitOrder", 0x1f)
	if (8 > ix_args_len) {
		const k = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		if (2 > (k & 3) - 2) {
			m = anchor_error_from(s210, 0x66 /* anchor::InstructionDidNotDeserialize */)
			i = ld64(s210)
			st64(a + 8, ld64(s210 + 8))
			st64(a, i)
			return m
		}
		if ((k & 3) == 0) {
			m = anchor_error_from(s210, 0x66 /* anchor::InstructionDidNotDeserialize */)
			i = ld64(s210)
			st64(a + 8, ld64(s210 + 8))
			st64(a, i)
			return m
		}
		const l = ld64(ld64(k + 7))
		if (l == 0) {
			m = anchor_error_from(s210, 0x66 /* anchor::InstructionDidNotDeserialize */)
			i = ld64(s210)
			st64(a + 8, ld64(s210 + 8))
			st64(a, i)
			return m
		}
		callx(l, ld64(k - 1), l)
		m = anchor_error_from(s210, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s210)
		st64(a + 8, ld64(s210 + 8))
		st64(a, i)
		return m
	}
	const amount = args.amount
	st64(s1e0, accounts, accounts_len)
	m = accounts_increase_limit_order(se8, undef, s1e0, undef, fp, f)
	const h = ld64(se8 + 8)
	i = ld64(se8)
	const g = ld8(sd8 + 0xd4)
	if (g == 2) {
		st64(a + 8, h)
		st64(a, i)
		return m
	}
	const j = memcpy(s1c0, sd8, 0xd4)
	st16(s1c0 + 0xd5, ld16(sd8 + 0xd5))
	st8(s1c0 + 0xd7, ld8(sd8 + 0xd7))
	st8(s1c0 + 0xd4, g)
	st64(s1d0, i, h)
	copyr(sd8, s1e0, 0x10)
	st64(se8, program_id, s1d0)
	m = fn_521e8(s1f0, se8, amount, j)
	i = ld64(s1f0)
	if (i == 2) {
		m = fn_e7810(s200, s1d0, program_id)
		i = ld64(s200)
		st64(a + 8, ld64(s200 + 8))
		st64(a, i)
		return m
	}
	st64(a + 8, ld64(s1f0 + 8))
	st64(a, i)
	return m
}

// Anchor Accounts::try_accounts of instruction increase_limit_order (called by ix_increase_limit_order; name [str]: from the handler's "Instruction: …" log; was fn_e5a80)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: input_vault (ConstraintMut, ConstraintRaw), input_vault_mint (ConstraintAddress), input_token_program (ConstraintAddress), input_token_account (ConstraintMut), limit_order (ConstraintMut), tick_array (ConstraintMut, ConstraintRaw), pool_state (ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: input_vault_mint_box, pool_state [idl], tick_array [idl], input_vault [idl]
export function accounts_increase_limit_order(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const sc8 = fp - 0xc8, sd8 = fp - 0xd8, sf8 = fp - 0xf8, s118 = fp - 0x118, s138 = fp - 0x138, s158 = fp - 0x158, s170 = fp - 0x170, s190 = fp - 0x190, s1b0 = fp - 0x1b0, s250 = fp - 0x250, s2e0 = fp - 0x2e0, s2f8 = fp - 0x2f8, s300 = fp - 0x300, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4e0 = fp - 0x4e0, s4e8 = fp - 0x4e8, s4f0 = fp - 0x4f0, s4f8 = fp - 0x4f8, s500 = fp - 0x500
	let l, m, af, ag, ah, ak, al, ap, aq, ax, ay, az, bc, bd, bg, bi, bj, bk: u64
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
				st64(s4e0 + 0x20, p)
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
					st8(j + 0xe4, 2)
					return p
				}
				st64(s4e0, o, s250, q, j)
				memcpy(s250, sc8, 0x9c)
				st16(s2e0 + 0x8c, ld16(sc8 + 0x9d))
				st8(s2e0 + 0x8e, ld8(sc8 + 0x9f))
				st64(s4f0, p)
				st64(s300, p)
				st64(s4e8, s)
				st64(s318 + 0x10, s)
				memcpy(s2f8, ld64(s4e0 + 8), 0x9c)
				st8(s2e0 + 0x84, ld64(s4e0 + 0x10))
				st16(s2e0 + 0x85, ld16(s2e0 + 0x8c))
				st8(s2e0 + 0x87, ld8(s2e0 + 0x8e))
				p = try_accounts_1678(sd8, c)
				if (ld32(sc8 + 0xa0) == 2) {
					const y = ld64(0x300000000 /* heap bump-allocator cursor */)
					const ac = ld64(s4e0 + 0x18)
					const z = ld64(sd8)
					const aa = y != 0 ? sat_sub(y, 0x13) : 0x300007fed
					const ab = ld64(sd8 + 8)
					if (z != 0) {
						if (0x300000008 > aa) {
							raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008, ac)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, aa)
						st64(aa + 8, 0x6f6363615f6e656b)
						st64(aa, 0x6f745f7475706e69)
						st32(aa + 0xf, 0x746e756f)
						void ld64(ab)
					} else {
						if (0x300000008 > aa) {
							raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008, ac)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, aa)
						st64(aa + 8, 0x6f6363615f6e656b)
						st64(aa, 0x6f745f7475706e69)
						st32(aa + 0xf, 0x746e756f)
						void ld64(ab)
					}
					st64(ab + 0x10, aa, 0x13)
					st64(ab + 8, 0x13)
					st64(ab, 1)
					st64(ac + 8, ab)
					st64(ac, z)
					st8(ac + 0xe4, 2)
					return p
				}
				const w = ld64(0x300000000 /* heap bump-allocator cursor */)
				const pool_state: AccountInfo = ld64(s4e0)
				j = ld64(s4e0 + 0x18)
				const x = w != 0 ? sat_sub(w, 0xd8) : 0x300007f28
				if (0x300000008 > x) {
					alloc_handle_alloc_error(8, 0xd8)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, x & -8)
				if ((x & -8) != 0) {
					st64(s4f8, x & -8)
					memcpy(x & -8, sd8, 0xd8)
					try_accounts_1678(sd8, c)
					if (ld32(sc8 + 0xa0) == 2) {
						p = fn_4130(s318, ld64(sd8), ld64(sd8 + 8), 0x10015b11e /* "input_vault" */, 0xb)
						st64(s4e0 + 8, ld64(s318 + 8))
						f = ld64(s318)
						if (f != 2) {
							st64(j + 8, ld64(s4e0 + 8))
							st64(j, f)
							st8(j + 0xe4, 2)
							return p
						}
					} else {
						const ad = ld64(0x300000000 /* heap bump-allocator cursor */)
						const ae = ad != 0 ? sat_sub(ad, 0xd8) : 0x300007f28
						if (0x300000008 > ae) {
							alloc_handle_alloc_error(8, 0xd8)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ae & -8)
						if ((ae & -8) == 0) {
							alloc_handle_alloc_error(8, 0xd8)
						}
						st64(s4e0 + 8, ae & -8)
						memcpy(ae & -8, sd8, 0xd8)
					}
					fn_7768(sd8, c, af, ag, ah)
					let input_vault_mint_box: Mint = ld64(sd8 + 8)
					const ai = ld64(sd8)
					if (ai != 2) {
						p = fn_4130(s328, ai, input_vault_mint_box, "input_vault_mint", 0x10)
						input_vault_mint_box = ld64(s328 + 8)
						f = ld64(s328)
						if (f != 2) {
							st64(j + 8, input_vault_mint_box)
							st64(j, f)
							st8(j + 0xe4, 2)
							return p
						}
					}
					st64(s500, input_vault_mint_box)
					p = try_accounts_120(sd8, c, input_vault_mint_box, ak, al)
					input_vault_mint_box = ld64(sd8 + 8)
					const am = ld64(sd8)
					if (am != 2) {
						p = fn_4130(s338, am, input_vault_mint_box, "input_token_program", 0x13)
						input_vault_mint_box = ld64(s338 + 8)
						f = ld64(s338)
						tick_array = ld64(s4e0 + 0x20)
						if (f != 2) {
							st64(j + 8, input_vault_mint_box)
							st64(j, f)
							st8(j + 0xe4, 2)
							return p
						}
					} else {
						tick_array = ld64(s4e0 + 0x20)
					}
					if (pool_state.is_writable != 0) {
						if (tick_array.is_writable != 0) {
							const bp: Mint = input_vault_mint_box
							p = fn_4bd8(sd8, tick_array, p)
							o = ld64(sc8)
							f = ld64(sd8 + 8)
							if (ld64(sd8) != 0) {
								st64(j + 8, o)
								st64(j, f)
								st8(j + 0xe4, 2)
								return p
							}
							const ar = ld64(ld64(s4e0))
							copyr(s1b0, ar, 0x20)
							const at = memcmp(f, s1b0, 0x20)
							st64(o, ld64(o) - 1)
							if ((at as u32) == 0) {
								if (ld8(ld64(s4e8) + 0x29) != 0) {
									copyr(sd8, s1b0, 0x20)
									const au = memcmp(s300, sd8, 0x20)
									if ((au as u32) == 0) {
										const av = ld64(i)
										copyr(s190, av, 0x20)
										const aw = memcmp(s2e0, s190, 0x20)
										if ((aw as u32) == 0) {
											if (ld8(ld64(ld64(s4f8) + 0x20) + 0x29) != 0) {
												copyr(sd8, av, 0x20)
												if ((memcmp(ld64(s4f8) + 0x48, sd8, 0x20) as u32) != 0) {
													p = anchor_error_from(s408, 0x7df /* anchor::ConstraintTokenOwner */)
													bd = ld64(s408)
													bc = ld64(s4e0 + 0x18)
													st64(bc + 8, ld64(s408 + 8))
													st64(bc, bd)
													st8(bc + 0xe4, 2)
													return p
												}
												const ba = ld64(s4e0 + 8)
												copyr(sd8, ba + 0x28, 0x20)
												const bb = memcmp(ld64(s4f8) + 0x28, sd8, 0x20)
												if ((bb as u32) == 0) {
													const input_vault: AccountInfo = ld64(ld64(s4e0 + 8) + 0x20)
													if (input_vault.is_writable != 0) {
														if ((ld64(s4e0 + 0x10) & 1) != 0) {
															const bh = input_vault.key
															copyr(sd8, bh, 0x20)
															p = fn_4dc0(s170, ld64(s4e0), bb as u32)
															bj = ld64(s170 + 0x10)
															bg = ld64(s170 + 8)
															if (ld64(s170) != 0) {
																bi = ld64(s4e0 + 0x18)
																st64(bi + 8, bj)
																st64(bi, bg)
																st8(bi + 0xe4, 2)
																return p
															}
															bk = bg + 0x81
														} else {
															const bf = input_vault.key
															copyr(sd8, bf, 0x20)
															p = fn_4dc0(s170, ld64(s4e0), bb as u32)
															bj = ld64(s170 + 0x10)
															bg = ld64(s170 + 8)
															if (ld64(s170) != 0) {
																bi = ld64(s4e0 + 0x18)
																st64(bi + 8, bj)
																st64(bi, bg)
																st8(bi + 0xe4, 2)
																return p
															}
															bk = bg + 0xa1
														}
														const bl = memcmp(sd8, bk, 0x20)
														st64(bj, ld64(bj) - 1)
														if ((bl as u32) == 0) {
															const bm = ld64(s4e0 + 8)
															const bn = ld64(ld64(s500) + 0x58)
															const bo = ld64(bn)
															copyr(s158, bo, 0x20)
															copy(s138, bm + 0x28, 0x20)
															if ((memcmp(s158, s138, 0x20) as u32) != 0) {
																anchor_error_from(s468, 0x7dc /* anchor::ConstraintAddress */)
																const by = fn_4130(s478, ld64(s468), ld64(s468 + 8), "input_vault_mint", 0x10)
																const bx = ld64(s478 + 8)
																const bw = ld64(s478)
																copy(sd8, s158, 0x40)
																p = Error_with_pubkeys(s488, bw, bx, sd8, by)
																bd = ld64(s488)
																bc = ld64(s4e0 + 0x18)
																st64(bc + 8, ld64(s488 + 8))
																st64(bc, bd)
																st8(bc + 0xe4, 2)
																return p
															}
															const bq = ld64(bp)
															copyr(s118, bq, 0x20)
															const bs = AccountInfo_clone_f338(sd8, bn)
															const br = ld64(sc8 + 8)
															copy(sf8, br, 0x20)
															ptr_drop_in_place_fcd8(sd8, bs)
															if ((memcmp(s118, sf8, 0x20) as u32) == 0) {
																const bz = ld64(s4e0 + 0x18)
																p = memcpy(bz + 0x48, s250, 0x9c)
																const cb = ld8(s2e0 + 0x8e)
																const ca = ld16(s2e0 + 0x8c)
																st8(bz + 0xe4, ld64(s4e0 + 0x10))
																st64(bz + 0x40, ld64(s4f0))
																st64(bz + 0x38, ld64(s4e8))
																st64(bz + 0x30, bp)
																st64(bz + 0x28, ld64(s500))
																st64(bz + 0x20, ld64(s4e0 + 8))
																st64(bz + 0x18, ld64(s4f8))
																st64(bz + 0x10, ld64(s4e0 + 0x20))
																st64(bz + 8, ld64(s4e0))
																st64(bz, i)
																st16(bz + 0xe5, ca)
																st8(bz + 0xe7, cb)
																return p
															}
															anchor_error_from(s498, 0x7dc /* anchor::ConstraintAddress */)
															const bv = fn_4130(s4a8, ld64(s498), ld64(s498 + 8), "input_token_program", 0x13)
															const bu = ld64(s4a8 + 8)
															const bt = ld64(s4a8)
															copy(sd8, s118, 0x40)
															p = Error_with_pubkeys(s4b8, bt, bu, sd8, bv)
															bd = ld64(s4b8)
															bc = ld64(s4e0 + 0x18)
															st64(bc + 8, ld64(s4b8 + 8))
															st64(bc, bd)
															st8(bc + 0xe4, 2)
															return p
														}
														anchor_error_from(s448, 0x7d3 /* anchor::ConstraintRaw */)
														p = fn_4130(s458, ld64(s448), ld64(s448 + 8), 0x10015b11e /* "input_vault" */, 0xb)
														bd = ld64(s458)
														bc = ld64(s4e0 + 0x18)
														st64(bc + 8, ld64(s458 + 8))
														st64(bc, bd)
														st8(bc + 0xe4, 2)
														return p
													}
													anchor_error_from(s428, 0x7d0 /* anchor::ConstraintMut */)
													p = fn_4130(s438, ld64(s428), ld64(s428 + 8), 0x10015b11e /* "input_vault" */, 0xb)
													bd = ld64(s438)
													bc = ld64(s4e0 + 0x18)
													st64(bc + 8, ld64(s438 + 8))
													st64(bc, bd)
													st8(bc + 0xe4, 2)
													return p
												}
												p = anchor_error_from(s418, 0x7de /* anchor::ConstraintTokenMint */)
												bd = ld64(s418)
												bc = ld64(s4e0 + 0x18)
												st64(bc + 8, ld64(s418 + 8))
												st64(bc, bd)
												st8(bc + 0xe4, 2)
												return p
											}
											anchor_error_from(s3e8, 0x7d0 /* anchor::ConstraintMut */, ax, ay, az)
											p = fn_4130(s3f8, ld64(s3e8), ld64(s3e8 + 8), "input_token_account", 0x13)
											bd = ld64(s3f8)
											bc = ld64(s4e0 + 0x18)
											st64(bc + 8, ld64(s3f8 + 8))
											st64(bc, bd)
											st8(bc + 0xe4, 2)
											return p
										}
									}
									anchor_error_from(s3c8, 0x7d3 /* anchor::ConstraintRaw */, ax, ay, az)
									p = fn_4130(s3d8, ld64(s3c8), ld64(s3c8 + 8), 0x10015b336 /* "limit_order" */, 0xb)
									f = ld64(s3d8)
									st64(j + 8, ld64(s3d8 + 8))
									st64(j, f)
									st8(j + 0xe4, 2)
									return p
								}
								anchor_error_from(s3a8, 0x7d0 /* anchor::ConstraintMut */)
								p = fn_4130(s3b8, ld64(s3a8), ld64(s3a8 + 8), 0x10015b336 /* "limit_order" */, 0xb)
								f = ld64(s3b8)
								st64(j + 8, ld64(s3b8 + 8))
								st64(j, f)
								st8(j + 0xe4, 2)
								return p
							}
							anchor_error_from(s388, 0x7d3 /* anchor::ConstraintRaw */)
							p = fn_4130(s398, ld64(s388), ld64(s388 + 8), 0x10015a23e /* "tick_array" */, 0xa)
							f = ld64(s398)
							st64(j + 8, ld64(s398 + 8))
							st64(j, f)
							st8(j + 0xe4, 2)
							return p
						}
						anchor_error_from(s368, 0x7d0 /* anchor::ConstraintMut */, input_vault_mint_box, ap, aq)
						p = fn_4130(s378, ld64(s368), ld64(s368 + 8), 0x10015a23e /* "tick_array" */, 0xa)
						f = ld64(s378)
						st64(j + 8, ld64(s378 + 8))
						st64(j, f)
						st8(j + 0xe4, 2)
						return p
					}
					anchor_error_from(s348, 0x7d0 /* anchor::ConstraintMut */, input_vault_mint_box, ap, aq)
					p = fn_4130(s358, ld64(s348), ld64(s348 + 8), "pool_state", 0xa)
					f = ld64(s358)
					st64(j + 8, ld64(s358 + 8))
					st64(j, f)
					st8(j + 0xe4, 2)
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
			st8(j + 0xe4, 2)
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
		st8(j + 0xe4, 2)
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
	st8(j + 0xe4, 2)
	return p
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
// types [heur]: b: IncreaseLimitOrderContext (the handler ix_increase_limit_order passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_521e8(a: u64, b: IncreaseLimitOrderContext, c: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s38 = fp - 0x38, s68 = fp - 0x68, s98 = fp - 0x98, sc8 = fp - 0xc8, sf8 = fp - 0xf8, s108 = fp - 0x108, s120 = fp - 0x120, s128 = fp - 0x128, s138 = fp - 0x138, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s220 = fp - 0x220, s228 = fp - 0x228, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s330 = fp - 0x330
	let g, n, ad, ae, af, ag, al: u64
	if (c != 0) {
		st64(s2f0, b, c)
		const accounts: IncreaseLimitOrderAccounts = b.accounts
		n = fn_4dc0(s240, ld64(accounts + 8), r0)
		let h = ld64(s240 + 0x10)
		g = ld64(s240 + 8)
		if (ld64(s240) != 0) {
			st64(a + 8, h)
			st64(a, g)
			return n
		}
		if ((ld8(g + 0x17d) & 0x30) == 0) {
			const m = ld32(g + 0x105)
			const j = ld16(g + 0xe3)
			st64(h, ld64(h) - 1)
			const l = ld8(accounts + 0xe4)
			const k = ld32(accounts + 0xe0)
			st64(s330 + 0x38, j)
			n = fn_51b90(s260, k, l, m, j)
			h = ld64(s260 + 8)
			g = ld64(s260)
			if (g == 2) {
				st64(s330 + 0x30, ld32(accounts + 0xe0))
				n = fn_51c8(s240, ld64(accounts + 0x10), undef, undef, undef, n)
				const o = ld64(s240 + 0x10)
				const p = ld64(s240 + 8)
				h = o
				g = p
				if (ld64(s240) != 0) {
					st64(a + 8, h)
					st64(a, g)
					return n
				}
				st64(s330 + 0x28, o)
				st64(s330 + 0x18, ld8(p + 0x2784))
				st64(s330 + 0x10, ld32(p + 0x20))
				st64(s330 + 0x20, p)
				n = fn_717b0(s240, p, ld64(s330 + 0x30), ld64(s330 + 0x38))
				h = ld64(s240 + 8)
				g = ld64(s240)
				if (g != 2) {
					ad = ld64(s330 + 0x28)
					st64(ad, ld64(ad) + 1)
					st64(a + 8, h)
					st64(a, g)
					return n
				}
				let q = 1
				if ((ld64(h + 0x14) | ld64(h + 0x1c)) == 0 && ld64(h + 0x7c) == 0) {
					q = ld64(h + 0x84) != 0
				}
				st64(s330 + 0x38, q)
				const r = fn_16330(accounts.input_vault_mint)
				n = fn_7da68(s240, r, ld64(s2f0 + 8))
				const t = ld64(s240 + 8)
				g = ld64(s240)
				if (g != 2) {
					ad = ld64(s330 + 0x28)
					st64(ad, ld64(ad) + 1)
					st64(a + 8, t)
					st64(a, g)
					return n
				}
				const s = ld64(s2f0 + 8)
				if (t > s) {
					n = fn_88360(s2d0, 0x26)
					h = ld64(s2d0 + 8)
					g = ld64(s2d0)
					ad = ld64(s330 + 0x28)
					st64(ad, ld64(ad) + 1)
					st64(a + 8, h)
					st64(a, g)
					return n
				}
				st64(s330, s - t, t)
				n = fn_670b0(s270, accounts + 0x40, h, s - t)
				h = ld64(s270 + 8)
				g = ld64(s270)
				if (g == 2) {
					const u = ld64(ld64(accounts + 8))
					copyr(s240, u, 0x20)
					const v = ld64(ld64(accounts + 0x38))
					copyr(s220, v, 0x20)
					const x = ld64(accounts + 0x88)
					const w = ld8(accounts + 0xe4)
					st32(s1f8 + 0x10, ld32(accounts + 0xe0))
					st8(s1f8 + 0x14, w)
					copyr(s1f8, s330, 0x10)
					st64(s208 + 8, x)
					fn_10d420(s128, s240)
					copyr(s38, s120, 0x10)
					const y = log_data(s38, 1)
					n = fn_514e0(s280, ld64(accounts + 0x88), ld64(s330 + 0x30), ld8(accounts + 0xe4), y)
					h = ld64(s280 + 8)
					g = ld64(s280)
					if (g != 2) {
						ad = ld64(s330 + 0x28)
						st64(ad, ld64(ad) + 1)
						st64(a + 8, h)
						st64(a, g)
						return n
					}
					if ((ld64(s330 + 0x38) & 1) == 0) {
						const z = ld64(s330 + 0x20)
						const aa = ld8(z + 0x2784)
						if (aa == 0xff) {
							n = fn_88360(s290, 0x26)
							h = ld64(s290 + 8)
							g = ld64(s290)
							if (g != 2) {
								ad = ld64(s330 + 0x28)
								st64(ad, ld64(ad) + 1)
								st64(a + 8, h)
								st64(a, g)
								return n
							}
						} else {
							st8(z + 0x2784, aa + 1)
						}
						if (ld64(s330 + 0x18) == 0) {
							n = fn_53e8(s240, ld64(accounts + 8), ae, af, ag, n)
							h = ld64(s240 + 0x10)
							g = ld64(s240 + 8)
							if (ld64(s240) != 0) {
								ad = ld64(s330 + 0x28)
								st64(ad, ld64(ad) + 1)
								st64(a + 8, h)
								st64(a, g)
								return n
							}
							const ah = ld64(0x300000000 /* heap bump-allocator cursor */)
							const ai = ah != 0 ? sat_sub(ah, 4) & -4 : 0x300007ffc
							if (0x300000008 > ai) {
								alloc_handle_alloc_error(4, 4)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, ai)
							st32(ai, ld64(s330 + 0x10))
							st64(s240, 1, ai, 1)
							const aj = fn_6f618(g, s240)
							let ak = 0
							if (aj != 0) {
								if (ld64(ld64(s2f0) + 0x18) == 0) {
									fn_85138(s68, 0x1001598a0)
									st64(s38, 0, 1, 0)
									st64(s108, s38, 0x10015f818)
									st8(sf8 + 8, 3)
									st64(sf8, 0x20)
									st64(s120 + 8, 0)
									st64(s128, 0)
									if (fn_88558(0x1001598a0, s128) != 0) {
										fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
									}
									copyr(s208, s38, 0x18)
									copy(s220, s68, 0x18)
									st64(s240 + 8, 0x10015a248)
									st32(s1f8 + 0x50, 0x1772 /* error::AccountLack */)
									st8(s1f8 + 8, 2)
									st32(s228, 0x83)
									st64(s240 + 0x10, 0x41)
									st64(s240, 0)
									n = fn_13e5a0(s2b0, s240)
									al = ld64(s2b0 + 8)
									g = ld64(s2b0)
									st64(h, ld64(h) + 1)
									ad = ld64(s330 + 0x28)
									st64(ad, ld64(ad) + 1)
									st64(a + 8, al)
									st64(a, g)
									return n
								}
								ak = ld64(ld64(s2f0) + 0x10)
							}
							n = fn_6d670(s2a0, g, ak, ld64(s330 + 0x10))
							al = ld64(s2a0 + 8)
							g = ld64(s2a0)
							if (g != 2) {
								st64(h, ld64(h) + 1)
								ad = ld64(s330 + 0x28)
								st64(ad, ld64(ad) + 1)
								st64(a + 8, al)
								st64(a, g)
								return n
							}
							st64(h, ld64(h) + 1)
						}
					}
					AccountInfo_clone_f338(s228, ld64(accounts + 0x30))
					const ab = ld64(ld64(accounts + 0x18) + 0x20)
					st64(s2f0, s128)
					AccountInfo_clone_f338(s128, ab)
					AccountInfo_clone_f338(s68, ld64(ld64(accounts + 0x20) + 0x20))
					AccountInfo_clone_f338(s38, ld64(accounts))
					AccountInfo_clone_f338(sf8, accounts.input_vault_mint.info)
					memcpy(sc8, s68, 0x30)
					memcpy(s98, s38, 0x30)
					memcpy(s1f8, ld64(s2f0), 0xc0)
					st64(s138, 8, 0)
					st64(s240, 0, 8, 0)
					n = token_2022_transfer_checked(s2c0, s240, ld64(s2f0 + 8), accounts.input_vault_mint.decimals)
					h = ld64(s2c0 + 8)
					g = ld64(s2c0)
					if (g == 2) {
						const ac = ld64(s330 + 0x28)
						st64(ac, ld64(ac) + 1)
						st64(a + 8, h)
						st64(a, 2)
						return n
					}
					ad = ld64(s330 + 0x28)
					st64(ad, ld64(ad) + 1)
					st64(a + 8, h)
					st64(a, g)
					return n
				}
				ad = ld64(s330 + 0x28)
				st64(ad, ld64(ad) + 1)
				st64(a + 8, h)
				st64(a, g)
				return n
			}
			st64(a + 8, h)
			st64(a, g)
			return n
		}
		fn_85138(s68, 0x10015982c)
		st64(s38, 0, 1, 0)
		st64(s108, s38, 0x10015f818)
		st8(sf8 + 8, 3)
		st64(sf8, 0x20)
		st64(s120 + 8, 0)
		st64(s128, 0)
		if (fn_88558(0x10015982c, s128) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(s208, s38, 0x18)
		copy(s220, s68, 0x18)
		st64(s240 + 8, 0x10015a248)
		st32(s1f8 + 0x50, 0x1770 /* error::NotApproved */)
		st8(s1f8 + 8, 2)
		st32(s228, 0x4f)
		st64(s240 + 0x10, 0x41)
		st64(s240, 0)
		n = fn_13e5a0(s250, s240)
		const i = ld64(s250 + 8)
		g = ld64(s250)
		st64(h, ld64(h) - 1)
		st64(a + 8, i)
		st64(a, g)
		return n
	}
	fn_85138(s68, 0x100159888)
	st64(s38, 0, 1, 0)
	st64(s108, s38, 0x10015f818)
	st8(sf8 + 8, 3)
	st64(sf8, 0x20)
	st64(s120 + 8, 0)
	st64(s128, 0)
	if (fn_88558(0x100159888, s128) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(s208, s38, 0x18)
	copy(s220, s68, 0x18)
	st64(s240 + 8, 0x10015a248)
	st32(s1f8 + 0x50, 0x1784 /* error::ZeroAmountSpecified */)
	st8(s1f8 + 8, 2)
	st32(s228, 0x49)
	st64(s240 + 0x10, 0x41)
	st64(s240, 0)
	n = fn_13e5a0(s2e0, s240)
	g = ld64(s2e0)
	st64(a + 8, ld64(s2e0 + 8))
	st64(a, g)
	return n
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value)
export function fn_670b0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158
	let h, j: u64
	if (ld64(b + 0x40) != ld64(c + 0x74)) {
		fn_85138(s78, 0x1001598c0)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_88558(0x1001598c0, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(sf8, s78, 0x30)
		st64(s118 + 8, 0x10015a641)
		st32(sf8 + 0x78, 0x1799 /* error::InvalidOrderPhase */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0xa3)
		st64(s118 + 0x10, 0x26)
		st64(s118, 0)
		h = fn_13e5a0(s128, s118)
		j = ld64(s128)
		st64(a + 8, ld64(s128 + 8))
		st64(a, j)
		return h
	}
	const f = ld64(b + 0x48)
	if (f > f + d) {
		h = fn_88360(s158, 0x26)
		j = ld64(s158)
		st64(a + 8, ld64(s158 + 8))
		st64(a, j)
		return h
	}
	st64(b + 0x48, f + d)
	const g = ld64(b + 0x58)
	h = g + d
	if (g > h) {
		h = fn_88360(s148, 0x26)
		j = ld64(s148)
		st64(a + 8, ld64(s148 + 8))
		st64(a, j)
		return h
	}
	st64(b + 0x58, g + d)
	const i = ld64(c + 0x7c)
	if (i > i + d) {
		h = fn_88360(s138, 0x26)
		j = ld64(s138)
		st64(a + 8, ld64(s138 + 8))
		st64(a, j)
		return h
	}
	st64(c + 0x7c, i + d)
	st64(a + 8, i + d)
	st64(a, 2)
	return h
}

export function fn_10d420(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000007 >= g) {
		raw_vec_handle_error(1, 0x100, 0x100160a30, 0x300000007, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0xc81357c7cc0d780b /* event:IncreaseLimitOrderEvent */)
	st64(g + 0x20, ld64(b + 0x18))
	st64(g + 0x18, ld64(b + 0x10))
	st64(g + 0x10, ld64(b + 8))
	st64(g + 8, ld64(b))
	copy(g + 0x28, b + 0x20, 0x20)
	st8(g + 0x48, ld8(b + 0x5c))
	st32(g + 0x49, ld32(b + 0x58))
	copy(g + 0x4d, b + 0x40, 0x18)
	st64(a + 8, g, 0x65 /* anchor::InstructionFallbackNotFound */)
	st64(a, 0x100)
}

export function fn_e7810(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68
	let p, q, s, w: u64
	let k = fn_a80(s28, ld64(b + 8), c)
	let f = ld64(s28)
	if (f != 2) {
		const r = ld64(0x300000000 /* heap bump-allocator cursor */)
		s = 0xa > r
		p = r != 0 ? s != 0 ? 0 : r - 0xa : 0x300007ff6
		q = ld64(s28 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > p) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, s, w)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, p)
			st64(p, 0x6174735f6c6f6f70)
			st16(p + 8, 0x6574)
			void ld64(q)
		} else {
			if (0x300000008 > p) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, s, w)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, p)
			st64(p, 0x6174735f6c6f6f70)
			st16(p + 8, 0x6574)
			void ld64(q)
		}
	} else {
		k = fn_1008(s38, ld64(b + 0x10), c)
		f = ld64(s38)
		if (f == 2) {
			k = fn_af28(s48, b + 0x38, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
			let o = undef
			f = ld64(s48)
			if (f == 2) {
				const g = ld64(b + 0x18)
				const h = ld64(g + 0x20)
				if ((memcmp(g, c, 0x20) as u32) == 0 && (common_is_closed(h) == 0 && ld64(ld64(h + 0x10) + 0x10) != 0)) {
					st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
					k = fn_13e628(s58, s18)
					f = ld64(s58)
					if (f != 2) {
						const v = ld64(0x300000000 /* heap bump-allocator cursor */)
						p = v != 0 ? sat_sub(v, 0x13) : 0x300007fed
						q = ld64(s58 + 8)
						if ((f & 1) != 0) {
							if (0x300000008 > p) {
								raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x13 > v)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, p)
							st64(p + 8, 0x6f6363615f6e656b)
							st64(p, 0x6f745f7475706e69)
							st32(p + 0xf, 0x746e756f)
							void ld64(q)
						} else {
							if (0x300000008 > p) {
								raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x13 > v)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, p)
							st64(p + 8, 0x6f6363615f6e656b)
							st64(p, 0x6f745f7475706e69)
							st32(p + 0xf, 0x746e756f)
							void ld64(q)
						}
						st64(q + 8, 0x13)
						st64(q, 1)
						st64(q + 0x18, 0x13)
						st64(q + 0x10, p)
						st64(a + 8, q)
						st64(a, f)
						return k
					}
				}
				const i = ld64(b + 0x20)
				const l = ld64(i + 0x20)
				const j = memcmp(i, c, 0x20)
				q = undef
				k = j as u32
				if (k != 0) {
					st64(a + 8, q)
					st64(a, 2)
					return k
				}
				k = common_is_closed(l)
				q = undef
				if (k != 0) {
					st64(a + 8, q)
					st64(a, 2)
					return k
				}
				if (ld64(ld64(l + 0x10) + 0x10) == 0) {
					st64(a + 8, q)
					st64(a, 2)
					return k
				}
				st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
				k = fn_13e628(s68, s18)
				q = undef
				const m = ld64(s68)
				if (m == 2) {
					st64(a + 8, q)
					st64(a, 2)
					return k
				}
				const n = ld64(0x300000000 /* heap bump-allocator cursor */)
				o = 0xb > n
				p = n != 0 ? o != 0 ? 0 : n - 0xb : 0x300007ff5
				q = ld64(s68 + 8)
				if ((m & 1) != 0) {
					if (0x300000008 > p) {
						raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, o)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, p)
					st64(p, 0x61765f7475706e69)
					st32(p + 7, 0x746c7561)
					void ld64(q)
				} else {
					if (0x300000008 > p) {
						raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, o)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, p)
					st64(p, 0x61765f7475706e69)
					st32(p + 7, 0x746c7561)
					void ld64(q)
				}
				st64(q + 8, 0xb)
				st64(q, 1)
				st64(q + 0x18, 0xb)
				st64(q + 0x10, p)
				st64(a + 8, q)
				st64(a, m)
				return k
			}
			const u = ld64(0x300000000 /* heap bump-allocator cursor */)
			p = u != 0 ? sat_sub(u, 0xb) : 0x300007ff5
			q = ld64(s48 + 8)
			if ((f & 1) != 0) {
				if (0x300000008 > p) {
					raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0xb > u, o)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, p)
				st64(p, 0x726f5f74696d696c)
				st32(p + 7, 0x72656472)
				void ld64(q)
			} else {
				if (0x300000008 > p) {
					raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0xb > u, o)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, p)
				st64(p, 0x726f5f74696d696c)
				st32(p + 7, 0x72656472)
				void ld64(q)
			}
			st64(q + 8, 0xb)
			st64(q, 1)
			st64(q + 0x18, 0xb)
			st64(q + 0x10, p)
			st64(a + 8, q)
			st64(a, f)
			return k
		}
		const t = ld64(0x300000000 /* heap bump-allocator cursor */)
		s = 0xa > t
		p = t != 0 ? s != 0 ? 0 : t - 0xa : 0x300007ff6
		q = ld64(s38 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > p) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, s, w)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, p)
			st64(p, 0x7272615f6b636974)
			st16(p + 8, 0x7961)
			void ld64(q)
		} else {
			if (0x300000008 > p) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, s, w)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, p)
			st64(p, 0x7272615f6b636974)
			st16(p + 8, 0x7961)
			void ld64(q)
		}
	}
	st64(q + 8, 0xa)
	st64(q, 1)
	st64(q + 0x18, 0xa)
	st64(q + 0x10, p)
	st64(a + 8, q)
	st64(a, f)
	return k
}
