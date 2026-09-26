/// <reference path="../lib.d.ts" />
// instruction settle_limit_order
import { anchor_error_from, fn_13e5a0, fn_13e628, fn_14ec98, fn_14ed60, fn_181f8, fn_36a0, fn_4130, fn_4bd8, fn_4dc0, fn_667d0, fn_668d8, fn_71a20, fn_af28, log_data, memcpy } from '../shared.ts'

// instruction handler: settle_limit_order (discriminator sha256("global:settle_limit_order")[..8] = 0x601a695c21744ecd)
// accounts [idl]: 0 signer [signer], 1 pool_state, 2 tick_array, 3 limit_order [mut], 4 output_token_account [mut], 5 output_vault [mut], 6 output_vault_mint, 7 output_token_program
// args [idl]: (none)
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
export function ix_settle_limit_order(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const sd8 = fp - 0xd8, se8 = fp - 0xe8, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200
	const f = sol_log("Instruction: SettleLimitOrder", 0x1d)
	st64(s1e0, accounts, accounts_len)
	let k = accounts_settle_limit_order(se8, undef, s1e0, undef, fp, f)
	const h = ld64(se8 + 8)
	let i = ld64(se8)
	const g = ld8(sd8 + 0xd4)
	if (g == 2) {
		st64(a + 8, h)
		st64(a, i)
		return k
	}
	const j = memcpy(s1c0, sd8, 0xd4)
	st16(s1c0 + 0xd5, ld16(sd8 + 0xd5))
	st8(s1c0 + 0xd7, ld8(sd8 + 0xd7))
	st8(s1c0 + 0xd4, g)
	st64(s1d0, i, h)
	copyr(sd8, s1e0, 0x10)
	st64(se8, program_id, s1d0)
	k = fn_547d0(s1f0, se8, j)
	i = ld64(s1f0)
	if (i == 2) {
		k = fn_ed178(s200, s1d0, program_id)
		i = ld64(s200)
		st64(a + 8, ld64(s200 + 8))
		st64(a, i)
		return k
	}
	st64(a + 8, ld64(s1f0 + 8))
	st64(a, i)
	return k
}

// Anchor Accounts::try_accounts of instruction settle_limit_order (called by ix_settle_limit_order; name [str]: from the handler's "Instruction: …" log; was fn_eb400)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: output_vault (ConstraintMut, ConstraintRaw), output_vault_mint (ConstraintAddress), output_token_program (ConstraintAddress), signer (ConstraintRaw), output_token_account (ConstraintMut), limit_order (ConstraintMut, ConstraintRaw), tick_array (ConstraintRaw)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: output_vault_mint_box, output_vault [idl]
export function accounts_settle_limit_order(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const sc8 = fp - 0xc8, sd8 = fp - 0xd8, sf8 = fp - 0xf8, s118 = fp - 0x118, s138 = fp - 0x138, s158 = fp - 0x158, s170 = fp - 0x170, s190 = fp - 0x190, s1b0 = fp - 0x1b0, s238 = fp - 0x238, s250 = fp - 0x250, s2e0 = fp - 0x2e0, s2f8 = fp - 0x2f8, s300 = fp - 0x300, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4c0 = fp - 0x4c0, s4c8 = fp - 0x4c8, s4d0 = fp - 0x4d0, s4d8 = fp - 0x4d8, s4e0 = fp - 0x4e0
	let l, m, af, ag, ah, ak, al, aw, ay, az, ba, bo, bp: u64
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
				st64(s4c0 + 0x20, p)
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
				st64(s4c0, o, s250, q, j)
				memcpy(s250, sc8, 0x9c)
				st16(s2e0 + 0x8c, ld16(sc8 + 0x9d))
				st8(s2e0 + 0x8e, ld8(sc8 + 0x9f))
				st64(s4d0, p)
				st64(s300, p)
				st64(s4c8, s)
				st64(s318 + 0x10, s)
				memcpy(s2f8, ld64(s4c0 + 8), 0x9c)
				st8(s2e0 + 0x84, ld64(s4c0 + 0x10))
				st16(s2e0 + 0x85, ld16(s2e0 + 0x8c))
				st8(s2e0 + 0x87, ld8(s2e0 + 0x8e))
				p = try_accounts_1678(sd8, c)
				if (ld32(sc8 + 0xa0) == 2) {
					const y = ld64(0x300000000 /* heap bump-allocator cursor */)
					const ac = ld64(s4c0 + 0x18)
					const z = ld64(sd8)
					const aa = y != 0 ? sat_sub(y, 0x14) : 0x300007fec
					const ab = ld64(sd8 + 8)
					if (z != 0) {
						if (0x300000008 > aa) {
							raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, ac)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, aa)
						st64(aa + 8, 0x6363615f6e656b6f)
						st64(aa, 0x745f74757074756f)
						st32(aa + 0x10, 0x746e756f)
						void ld64(ab)
					} else {
						if (0x300000008 > aa) {
							raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, ac)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, aa)
						st64(aa + 8, 0x6363615f6e656b6f)
						st64(aa, 0x745f74757074756f)
						st32(aa + 0x10, 0x746e756f)
						void ld64(ab)
					}
					st64(ab + 0x10, aa, 0x14)
					st64(ab + 8, 0x14)
					st64(ab, 1)
					st64(ac + 8, ab)
					st64(ac, z)
					st8(ac + 0xe4, 2)
					return p
				}
				const w = ld64(0x300000000 /* heap bump-allocator cursor */)
				j = ld64(s4c0 + 0x18)
				const x = w != 0 ? sat_sub(w, 0xd8) : 0x300007f28
				if (0x300000008 > x) {
					alloc_handle_alloc_error(8, 0xd8)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, x & -8)
				if ((x & -8) != 0) {
					memcpy(x & -8, sd8, 0xd8)
					try_accounts_1678(sd8, c)
					if (ld32(sc8 + 0xa0) == 2) {
						p = fn_4130(s318, ld64(sd8), ld64(sd8 + 8), "output_vault", 0xc)
						st64(s4c0 + 8, ld64(s318 + 8))
						f = ld64(s318)
						if (f != 2) {
							st64(j + 8, ld64(s4c0 + 8))
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
						st64(s4c0 + 8, ae & -8)
						memcpy(ae & -8, sd8, 0xd8)
					}
					fn_7768(sd8, c, af, ag, ah)
					let output_vault_mint_box: Mint = ld64(sd8 + 8)
					const ai = ld64(sd8)
					if (ai != 2) {
						p = fn_4130(s328, ai, output_vault_mint_box, "output_vault_mint", 0x11)
						output_vault_mint_box = ld64(s328 + 8)
						f = ld64(s328)
						if (f != 2) {
							st64(j + 8, output_vault_mint_box)
							st64(j, f)
							st8(j + 0xe4, 2)
							return p
						}
					}
					st64(s4d8, output_vault_mint_box)
					try_accounts_120(sd8, c, output_vault_mint_box, ak, al)
					output_vault_mint_box = ld64(sd8 + 8)
					const am = ld64(sd8)
					if (am != 2) {
						p = fn_4130(s338, am, output_vault_mint_box, "output_token_program", 0x14)
						output_vault_mint_box = ld64(s338 + 8)
						f = ld64(s338)
						if (f != 2) {
							st64(j + 8, output_vault_mint_box)
							st64(j, f)
							st8(j + 0xe4, 2)
							return p
						}
					}
					st64(s4e0, output_vault_mint_box)
					const an = ld64(i)
					copyr(s1b0, an, 0x20)
					let ao = memcmp(s1b0, s2e0, 0x20) as u32
					if (ao != 0) {
						copyr(sd8, an, 0x20)
						ao = memcmp(sd8, 0x1001595a0 /* key Ray8HHtixhL9zvnokMyELCVGp622PDPJj96zcVC9RWp */, 0x20) as u32
						if (ao != 0) {
							anchor_error_from(s348, 0x7d3 /* anchor::ConstraintRaw */)
							p = fn_4130(s358, ld64(s348), ld64(s348 + 8), 0x10015b341 /* "signer" */, 6)
							f = ld64(s358)
							st64(j + 8, ld64(s358 + 8))
							st64(j, f)
							st8(j + 0xe4, 2)
							return p
						}
					}
					p = fn_4bd8(sd8, ld64(s4c0 + 0x20), ao)
					o = ld64(sc8)
					f = ld64(sd8 + 8)
					if (ld64(sd8) != 0) {
						st64(j + 8, o)
						st64(j, f)
						st8(j + 0xe4, 2)
						return p
					}
					const ap = ld64(ld64(s4c0))
					copyr(s190, ap, 0x20)
					const aq = memcmp(f, s190, 0x20)
					st64(o, ld64(o) - 1)
					if ((aq as u32) == 0) {
						if (ld8(ld64(s4c8) + 0x29) != 0) {
							copyr(sd8, s190, 0x20)
							if ((memcmp(s300, sd8, 0x20) as u32) == 0) {
								if (ld8(ld64((x & -8) + 0x20) + 0x29) != 0) {
									copyr(sd8, s238, 0x20)
									if ((memcmp((x & -8) + 0x48, sd8, 0x20) as u32) != 0) {
										p = anchor_error_from(s3e8, 0x7df /* anchor::ConstraintTokenOwner */)
										f = ld64(s3e8)
										st64(j + 8, ld64(s3e8 + 8))
										st64(j, f)
										st8(j + 0xe4, 2)
										return p
									}
									const ar = ld64(s4c0 + 8)
									copyr(sd8, ar + 0x28, 0x20)
									const at = memcmp((x & -8) + 0x28, sd8, 0x20)
									if ((at as u32) == 0) {
										const output_vault: AccountInfo = ld64(ld64(s4c0 + 8) + 0x20)
										if (output_vault.is_writable != 0) {
											if ((ld64(s4c0 + 0x10) & 1) != 0) {
												const ax = output_vault.key
												copyr(sd8, ax, 0x20)
												p = fn_4dc0(s170, ld64(s4c0), at as u32)
												az = ld64(s170 + 0x10)
												aw = ld64(s170 + 8)
												if (ld64(s170) != 0) {
													ay = ld64(s4c0 + 0x18)
													st64(ay + 8, az)
													st64(ay, aw)
													st8(ay + 0xe4, 2)
													return p
												}
												ba = aw + 0xa1
											} else {
												const av = output_vault.key
												copyr(sd8, av, 0x20)
												p = fn_4dc0(s170, ld64(s4c0), at as u32)
												az = ld64(s170 + 0x10)
												aw = ld64(s170 + 8)
												if (ld64(s170) != 0) {
													ay = ld64(s4c0 + 0x18)
													st64(ay + 8, az)
													st64(ay, aw)
													st8(ay + 0xe4, 2)
													return p
												}
												ba = aw + 0x81
											}
											const bb = memcmp(sd8, ba, 0x20)
											st64(az, ld64(az) - 1)
											if ((bb as u32) == 0) {
												const bc = ld64(s4c0 + 8)
												const bd = ld64(ld64(s4d8) + 0x58)
												const be = ld64(bd)
												copyr(s158, be, 0x20)
												copy(s138, bc + 0x28, 0x20)
												if ((memcmp(s158, s138, 0x20) as u32) != 0) {
													anchor_error_from(s448, 0x7dc /* anchor::ConstraintAddress */)
													const bn = fn_4130(s458, ld64(s448), ld64(s448 + 8), "output_vault_mint", 0x11)
													const bm = ld64(s458 + 8)
													const bl = ld64(s458)
													copy(sd8, s158, 0x40)
													p = Error_with_pubkeys(s468, bl, bm, sd8, bn)
													bp = ld64(s468)
													bo = ld64(s4c0 + 0x18)
													st64(bo + 8, ld64(s468 + 8))
													st64(bo, bp)
													st8(bo + 0xe4, 2)
													return p
												}
												const bf = ld64(ld64(s4e0))
												copyr(s118, bf, 0x20)
												const bh = AccountInfo_clone_f338(sd8, bd)
												const bg = ld64(sc8 + 8)
												copy(sf8, bg, 0x20)
												ptr_drop_in_place_fcd8(sd8, bh)
												if ((memcmp(s118, sf8, 0x20) as u32) == 0) {
													const bq = ld64(s4c0 + 0x18)
													p = memcpy(bq + 0x48, s250, 0x9c)
													const bs = ld8(s2e0 + 0x8e)
													const br = ld16(s2e0 + 0x8c)
													st8(bq + 0xe4, ld64(s4c0 + 0x10))
													st64(bq + 0x40, ld64(s4d0))
													st64(bq + 0x38, ld64(s4c8))
													st64(bq + 0x30, ld64(s4e0))
													st64(bq + 0x28, ld64(s4d8))
													st64(bq + 0x20, ld64(s4c0 + 8))
													st64(bq + 0x18, x & -8)
													st64(bq + 0x10, ld64(s4c0 + 0x20))
													st64(bq + 8, ld64(s4c0))
													st64(bq, i)
													st16(bq + 0xe5, br)
													st8(bq + 0xe7, bs)
													return p
												}
												anchor_error_from(s478, 0x7dc /* anchor::ConstraintAddress */)
												const bk = fn_4130(s488, ld64(s478), ld64(s478 + 8), "output_token_program", 0x14)
												const bj = ld64(s488 + 8)
												const bi = ld64(s488)
												copy(sd8, s118, 0x40)
												p = Error_with_pubkeys(s498, bi, bj, sd8, bk)
												bp = ld64(s498)
												bo = ld64(s4c0 + 0x18)
												st64(bo + 8, ld64(s498 + 8))
												st64(bo, bp)
												st8(bo + 0xe4, 2)
												return p
											}
											anchor_error_from(s428, 0x7d3 /* anchor::ConstraintRaw */)
											p = fn_4130(s438, ld64(s428), ld64(s428 + 8), "output_vault", 0xc)
											bp = ld64(s438)
											bo = ld64(s4c0 + 0x18)
											st64(bo + 8, ld64(s438 + 8))
											st64(bo, bp)
											st8(bo + 0xe4, 2)
											return p
										}
										anchor_error_from(s408, 0x7d0 /* anchor::ConstraintMut */)
										p = fn_4130(s418, ld64(s408), ld64(s408 + 8), "output_vault", 0xc)
										bp = ld64(s418)
										bo = ld64(s4c0 + 0x18)
										st64(bo + 8, ld64(s418 + 8))
										st64(bo, bp)
										st8(bo + 0xe4, 2)
										return p
									}
									p = anchor_error_from(s3f8, 0x7de /* anchor::ConstraintTokenMint */)
									bp = ld64(s3f8)
									bo = ld64(s4c0 + 0x18)
									st64(bo + 8, ld64(s3f8 + 8))
									st64(bo, bp)
									st8(bo + 0xe4, 2)
									return p
								}
								anchor_error_from(s3c8, 0x7d0 /* anchor::ConstraintMut */)
								p = fn_4130(s3d8, ld64(s3c8), ld64(s3c8 + 8), "output_token_account", 0x14)
								f = ld64(s3d8)
								st64(j + 8, ld64(s3d8 + 8))
								st64(j, f)
								st8(j + 0xe4, 2)
								return p
							}
							anchor_error_from(s3a8, 0x7d3 /* anchor::ConstraintRaw */)
							p = fn_4130(s3b8, ld64(s3a8), ld64(s3a8 + 8), 0x10015b336 /* "limit_order" */, 0xb)
							f = ld64(s3b8)
							st64(j + 8, ld64(s3b8 + 8))
							st64(j, f)
							st8(j + 0xe4, 2)
							return p
						}
						anchor_error_from(s388, 0x7d0 /* anchor::ConstraintMut */)
						p = fn_4130(s398, ld64(s388), ld64(s388 + 8), 0x10015b336 /* "limit_order" */, 0xb)
						f = ld64(s398)
						st64(j + 8, ld64(s398 + 8))
						st64(j, f)
						st8(j + 0xe4, 2)
						return p
					}
					anchor_error_from(s368, 0x7d3 /* anchor::ConstraintRaw */)
					p = fn_4130(s378, ld64(s368), ld64(s368 + 8), 0x10015a23e /* "tick_array" */, 0xa)
					f = ld64(s378)
					st64(j + 8, ld64(s378 + 8))
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
	const h = g != 0 ? sat_sub(g, 6) : 0x300007ffa
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 6, 0x10015f8f8, sat_sub(g, 6), 6 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st16(h + 4, 0x7265)
		st32(h, 0x6e676973)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 6, 0x10015f8f8, sat_sub(g, 6), 6 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st16(h + 4, 0x7265)
		st32(h, 0x6e676973)
		void ld64(i)
	}
	st64(i + 0x10, h, 6)
	st64(i + 8, 6)
	st64(i, 1)
	st64(j + 8, i)
	st64(j, f)
	st8(j + 0xe4, 2)
	return p
}

// types [heur]: b: SettleLimitOrderContext (the handler ix_settle_limit_order passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_547d0(a: u64, b: SettleLimitOrderContext, r0: u64): u64 {
	const s1 = fp - 0x1, s68 = fp - 0x68, s78 = fp - 0x78, sa8 = fp - 0xa8, sd8 = fp - 0xd8, s108 = fp - 0x108, s138 = fp - 0x138, s148 = fp - 0x148, s160 = fp - 0x160, s168 = fp - 0x168, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s268 = fp - 0x268, s270 = fp - 0x270, s278 = fp - 0x278, s290 = fp - 0x290, s298 = fp - 0x298, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0
	let m: u64
	let g = a
	const accounts: SettleLimitOrderAccounts = b.accounts
	let i = fn_4dc0(s2b0, ld64(accounts + 8), r0)
	let h = ld64(s2b0 + 0x10)
	if (ld64(s2b0) != 0) {
		m = ld64(s2b0 + 8)
		st64(g + 8, h)
		st64(g, m)
		return i
	}
	const aa = g
	const l = ld16(ld64(s2b0 + 8) + 0xe3)
	st64(h, ld64(h) - 1)
	const k = ld32(accounts + 0xe0)
	i = fn_4bd8(s2b0, ld64(accounts + 0x10), i)
	h = ld64(s2b0 + 0x10)
	if (ld64(s2b0) != 0) {
		m = ld64(s2b0 + 8)
		st64(aa + 8, h)
		st64(aa, m)
		return i
	}
	const z = h
	const j = ld64(s2b0 + 8)
	i = fn_71a20(s2b0, ld32(j + 0x20), k, l)
	m = ld64(s2b0)
	if (m != 2) {
		h = ld64(s2b0 + 8)
		st64(z, ld64(z) - 1)
		st64(aa + 8, h)
		st64(aa, m)
		return i
	}
	const n = ld64(s2b0 + 8)
	if (0x3c > n) {
		i = fn_668d8(s2b0, accounts + 0x40, j + n * 0xa8 + 0x24, i)
		h = ld64(s2b0 + 8)
		m = ld64(s2b0)
		if (m != 2) {
			st64(z, ld64(z) - 1)
			st64(aa + 8, h)
			st64(aa, m)
			return i
		}
		i = fn_667d0(s2b0, accounts + 0x40)
		const o = ld64(s2b0 + 8)
		m = ld64(s2b0)
		if (m == 2) {
			if (o != 0 && h == 0) {
				ErrorCode_name(sa8, 0x100159900)
				st64(s68, 0, 1, 0)
				st64(s148, s68, 0x10015f818)
				st8(s138 + 8, 3)
				st64(s138, 0x20)
				st64(s160 + 8, 0)
				st64(s168, 0)
				const p = ErrorCode_fmt(0x100159900, s168)
				g = aa
				if (p != 0) {
					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
				}
				copyr(s278, s68, 0x18)
				copy(s290, sa8, 0x18)
				st64(s2b0 + 8, 0x10015a2ca)
				st32(s268 + 0x50, 0x9c9 /* anchor::RequireGtViolated */)
				st8(s268 + 8, 2)
				st32(s298, 0x43)
				st64(s2b0 + 0x10, 0x3f)
				st64(s2b0, 0)
				fn_13e5a0(s2d0, s2b0)
				i = fn_36a0(s2e0, ld64(s2d0), ld64(s2d0 + 8), 0)
				h = ld64(s2e0 + 8)
				m = ld64(s2e0)
				st64(z, ld64(z) - 1)
				st64(g + 8, h)
				st64(g, m)
				return i
			}
			const q = ld64(ld64(accounts + 8))
			copyr(s2b0, q, 0x20)
			const r = ld64(ld64(accounts + 0x38))
			copyr(s290, r, 0x20)
			const u = ld64(accounts + 0x88)
			const t = ld64(accounts + 0x90)
			const s = ld8(accounts + 0xe4)
			st32(s268 + 0x10, ld32(accounts + 0xe0))
			st8(s268 + 0x14, s)
			st64(s270, u, t, h)
			fn_10d5f8(s168, s2b0)
			copyr(s68, s160, 0x10)
			log_data(s68, 1)
			AccountInfo_clone_f338(s198, ld64(accounts + 0x30))
			AccountInfo_clone_f338(s168, ld64(ld64(accounts + 0x20) + 0x20))
			AccountInfo_clone_f338(sa8, ld64(ld64(accounts + 0x18) + 0x20))
			AccountInfo_clone_f338(s68, ld64(accounts + 8))
			AccountInfo_clone_f338(s138, accounts.output_vault_mint.info)
			memcpy(s108, sa8, 0x30)
			const v = memcpy(sd8, s68, 0x30)
			const w = fn_4dc0(sa8, ld64(accounts + 8), v)
			const x = ld64(sa8 + 0x10)
			m = ld64(sa8 + 8)
			if (ld64(sa8) != 0) {
				i = ptr_drop_in_place_fcd8(s198, ptr_drop_in_place_fd78(s168, w))
				st64(z, ld64(z) - 1)
				st64(aa + 8, x)
				st64(aa, m)
				return i
			}
			const y = ld16(m + 0x17f)
			st64(s78, s68, 6, 0x10015984c, 4, m + 1, 0x20, m + 0x41, 0x20, m + 0x61, 0x20, y != 0 ? m + 0x17f : 1, (y != 0) << 1, m, 1)
			memcpy(s268, s168, 0xc0)
			st64(s2b0, 0, 8, 0)
			memcpy(s298, s198, 0x30)
			st64(s1a8, s78, 1)
			i = token_2022_transfer_checked(s2c0, s2b0, h, accounts.output_vault_mint.decimals)
			h = ld64(s2c0 + 8)
			m = ld64(s2c0)
			st64(x, ld64(x) - 1)
			if (m == 2) {
				st64(z, ld64(z) - 1)
				st64(aa + 8, h)
				st64(aa, 2)
				return i
			}
			st64(z, ld64(z) - 1)
			st64(aa + 8, h)
			st64(aa, m)
			return i
		}
		st64(z, ld64(z) - 1)
		st64(aa + 8, o)
		st64(aa, m)
		return i
	}
	fn_14ec98(n, 0x3c, 0x1001602f0)
}

export function fn_10d5f8(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000007 >= g) {
		raw_vec_handle_error(1, 0x100, 0x100160a48, 0x300000007, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0xc20a7c7da44d7758 /* event:SettleLimitOrderEvent */)
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

export function fn_ed178(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let n, o: u64
	let k = fn_af28(s28, b + 0x38, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
	let f = ld64(s28)
	if (f != 2) {
		const p = ld64(0x300000000 /* heap bump-allocator cursor */)
		n = p != 0 ? sat_sub(p, 0xb) : 0x300007ff5
		o = ld64(s28 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > n) {
				raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, 0xb > p)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, n)
			st64(n, 0x726f5f74696d696c)
			st32(n + 7, 0x72656472)
			void ld64(o)
		} else {
			if (0x300000008 > n) {
				raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, 0xb > p)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, n)
			st64(n, 0x726f5f74696d696c)
			st32(n + 7, 0x72656472)
			void ld64(o)
		}
		st64(o + 8, 0xb)
		st64(o, 1)
		st64(o + 0x18, 0xb)
		st64(o + 0x10, n)
		st64(a + 8, o)
		st64(a, f)
		return k
	}
	const g = ld64(b + 0x18)
	const h = ld64(g + 0x20)
	if ((memcmp(g, c, 0x20) as u32) == 0 && (common_is_closed(h) == 0 && ld64(ld64(h + 0x10) + 0x10) != 0)) {
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		k = fn_13e628(s38, s18)
		f = ld64(s38)
		if (f != 2) {
			const q = ld64(0x300000000 /* heap bump-allocator cursor */)
			n = q != 0 ? sat_sub(q, 0x14) : 0x300007fec
			o = ld64(s38 + 8)
			if ((f & 1) != 0) {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > q)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6363615f6e656b6f)
				st64(n, 0x745f74757074756f)
				st32(n + 0x10, 0x746e756f)
				void ld64(o)
			} else {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > q)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6363615f6e656b6f)
				st64(n, 0x745f74757074756f)
				st32(n + 0x10, 0x746e756f)
				void ld64(o)
			}
			st64(o + 8, 0x14)
			st64(o, 1)
			st64(o + 0x18, 0x14)
			st64(o + 0x10, n)
			st64(a + 8, o)
			st64(a, f)
			return k
		}
	}
	const i = ld64(b + 0x20)
	const l = ld64(i + 0x20)
	const j = memcmp(i, c, 0x20)
	o = undef
	k = j as u32
	if (k != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return k
	}
	k = common_is_closed(l)
	o = undef
	if (k != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return k
	}
	if (ld64(ld64(l + 0x10) + 0x10) == 0) {
		st64(a + 8, o)
		st64(a, 2)
		return k
	}
	st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
	k = fn_13e628(s48, s18)
	o = undef
	f = ld64(s48)
	if (f == 2) {
		st64(a + 8, o)
		st64(a, 2)
		return k
	}
	const m = ld64(0x300000000 /* heap bump-allocator cursor */)
	n = m != 0 ? sat_sub(m, 0xc) : 0x300007ff4
	o = ld64(s48 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > n) {
			raw_vec_handle_error(1, 0xc, 0x10015f8f8, 0x300000008, 0xc > m)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, n)
		st64(n, 0x765f74757074756f)
		st32(n + 8, 0x746c7561)
		void ld64(o)
	} else {
		if (0x300000008 > n) {
			raw_vec_handle_error(1, 0xc, 0x10015f8f8, 0x300000008, 0xc > m)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, n)
		st64(n, 0x765f74757074756f)
		st32(n + 8, 0x746c7561)
		void ld64(o)
	}
	st64(o + 8, 0xc)
	st64(o, 1)
	st64(o + 0x18, 0xc)
	st64(o + 0x10, n)
	st64(a + 8, o)
	st64(a, f)
	return k
}
