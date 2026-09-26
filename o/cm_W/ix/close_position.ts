/// <reference path="../lib.d.ts" />
// instruction close_position
import { anchor_error_from, fn_13e190, fn_13e5a0, fn_13e628, fn_14ed60, fn_4130, fn_4dc0, fn_5608, fn_85138, fn_88360, fn_88558, memcpy } from '../shared.ts'

// instruction handler: close_position (discriminator sha256("global:close_position")[..8] = 0x626244310051867b)
// accounts [idl]: 0 nft_owner [signer, mut], 1 position_nft_mint [mut], 2 position_nft_account [mut], 3 personal_position [mut, pda], 4 system_program [= 11111111111111111111111111111111], 5 token_program
// args [idl]: (none)
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
export function ix_close_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s60 = fp - 0x60, s70 = fp - 0x70, s71 = fp - 0x71, s88 = fp - 0x88, s98 = fp - 0x98, sff8 = fp - 0xff8
	const f = sol_log("Instruction: ClosePosition", 0x1a)
	st8(s71, 0xff)
	st64(s70, accounts, accounts_len)
	st64(sff8, s71)
	let k = accounts_close_position(s30, program_id, s70, undef, fp, f)
	const i = ld64(s20)
	let j = ld64(s30 + 8)
	const g = ld64(s30)
	if (g == 0) {
		st64(a + 8, i)
		st64(a, j)
		return k
	}
	copyr(s40, s10, 0x10)
	const h = ld64(s20 + 8)
	st64(s60, g, j, i, h)
	st8(s10, ld8(s71))
	copyr(s20, s70, 0x10)
	st64(s30, program_id, s60)
	k = fn_28d58(s88, s30, g, h)
	j = ld64(s88)
	if (j == 2) {
		k = fn_a8b80(s98, s60, program_id)
		j = ld64(s98)
		st64(a + 8, ld64(s98 + 8))
		st64(a, j)
		return k
	}
	st64(a + 8, ld64(s88 + 8))
	st64(a, j)
	return k
}

// Anchor Accounts::try_accounts of instruction close_position (called by ix_close_position; name [str]: from the handler's "Instruction: …" log; was fn_a7120)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_program, position_nft_mint (ConstraintMut, ConstraintAddress), position_nft_account (ConstraintMut, ConstraintRaw), personal_position (ConstraintClose, ConstraintMut, ConstraintSeeds, ConstraintTokenTokenProgram, ConstraintTokenMint), nft_owner (ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: nft_owner [idl], position_nft_mint [idl], position_nft_account [idl]
export function accounts_close_position(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s100 = fp - 0x100, s120 = fp - 0x120, s140 = fp - 0x140, s160 = fp - 0x160, s180 = fp - 0x180, s1a0 = fp - 0x1a0, s1c0 = fp - 0x1c0, s1e0 = fp - 0x1e0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s3a8 = fp - 0x3a8, s3b0 = fp - 0x3b0, s3b8 = fp - 0x3b8
	let n, o, aa, ab, ae, az: u64
	st64(s3a8 + 0x30, b)
	let t = try_accounts_17a30(s120, c, c, d, e, r0)
	const nft_owner: AccountInfo = ld64(s120 + 8)
	let f = ld64(s120)
	if (f == 2) {
		const k = ld64(e - 0xff8)
		t = try_accounts_15c0(s120, c)
		if (ld32(s120) == 2) {
			const m = ld64(0x300000000 /* heap bump-allocator cursor */)
			f = ld64(s120 + 8)
			n = m != 0 ? sat_sub(m, 0x11) : 0x300007fef
			o = ld64(s120 + 0x10)
			if (f != 0) {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, az)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6e696d5f74666e5f)
				st64(n, 0x6e6f697469736f70)
				st8(n + 0x10, 0x74)
				void ld64(o)
			} else {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, az)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6e696d5f74666e5f)
				st64(n, 0x6e6f697469736f70)
				st8(n + 0x10, 0x74)
				void ld64(o)
			}
		} else {
			const j = ld64(0x300000000 /* heap bump-allocator cursor */)
			st64(s3a8 + 0x28, k)
			const l = j != 0 ? sat_sub(j, 0x80) : 0x300007f80
			if (0x300000008 > l) {
				alloc_handle_alloc_error(8, 0x80)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, l & -8)
			if ((l & -8) == 0) {
				alloc_handle_alloc_error(8, 0x80)
			}
			memcpy(l & -8, s120, 0x80)
			t = try_accounts_1678(s120, c)
			if (ld32(s100 + 0x90) == 2) {
				const r = ld64(0x300000000 /* heap bump-allocator cursor */)
				f = ld64(s120)
				const s = r != 0 ? sat_sub(r, 0x14) : 0x300007fec
				o = ld64(s120 + 8)
				if (f != 0) {
					if (0x300000008 > s) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, s)
					st64(s + 8, 0x6363615f74666e5f)
					st64(s, 0x6e6f697469736f70)
					st32(s + 0x10, 0x746e756f)
					void ld64(o)
				} else {
					if (0x300000008 > s) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, s)
					st64(s + 8, 0x6363615f74666e5f)
					st64(s, 0x6e6f697469736f70)
					st32(s + 0x10, 0x746e756f)
					void ld64(o)
				}
				st64(o + 0x10, s, 0x14)
				st64(o + 8, 0x14)
				st64(o, 1)
				st64(a + 0x10, o)
				st64(a + 8, f)
				st64(a, 0)
				return t
			}
			const p = ld64(0x300000000 /* heap bump-allocator cursor */)
			const q = p != 0 ? sat_sub(p, 0xd8) : 0x300007f28
			if (0x300000008 > q) {
				alloc_handle_alloc_error(8, 0xd8)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, q & -8)
			if ((q & -8) == 0) {
				alloc_handle_alloc_error(8, 0xd8)
			}
			st64(s3a8 + 0x20, q & -8)
			memcpy(q & -8, s120, 0xd8)
			t = try_accounts_18368(s120, c)
			if (ld64(s120) != 0) {
				const u = ld64(0x300000000 /* heap bump-allocator cursor */)
				const v = u != 0 ? sat_sub(u, 0x120) : 0x300007ee0
				if (0x300000008 > v) {
					alloc_handle_alloc_error(8, 0x120)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, v & -8)
				if ((v & -8) != 0) {
					st64(s3a8 + 0x18, v & -8)
					memcpy(v & -8, s120, 0x120)
					try_accounts_18870(s120, c)
					t = ld64(s120 + 8)
					f = ld64(s120)
					if (f == 2) {
						st64(s3a8 + 0x10, t)
						try_accounts_120(s120, c)
						o = ld64(s120 + 8)
						const z = ld64(s120)
						if (z != 2) {
							t = fn_4130(s210, z, o, 0x10015b020 /* "token_program" */, 0xd)
							o = ld64(s210 + 8)
							f = ld64(s210)
							ae = ld64(s3a8 + 0x18)
							if (f != 2) {
								st64(a + 0x10, o)
								st64(a + 8, f)
								st64(a, 0)
								return t
							}
						} else {
							ae = ld64(s3a8 + 0x18)
						}
						if (nft_owner.is_writable != 0) {
							const position_nft_mint: AccountInfo = ld64((l & -8) + 0x58)
							if (position_nft_mint.is_writable != 0) {
								st64(s3a8, position_nft_mint, o)
								const ad = position_nft_mint.key
								copyr(s200, ad, 0x20)
								copy(s1e0, ae + 8, 0x20)
								if ((memcmp(s200, s1e0, 0x20) as u32) != 0) {
									anchor_error_from(s260, 0x7dc /* anchor::ConstraintAddress */)
									const ai = fn_4130(s270, ld64(s260), ld64(s260 + 8), "position_nft_mint", 0x11)
									const ah = ld64(s270 + 8)
									const ag = ld64(s270)
									copy(s120, s200, 0x40)
									t = Error_with_pubkeys(s280, ag, ah, s120, ai)
									f = ld64(s280)
									st64(a + 0x10, ld64(s280 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return t
								}
								st64(s3b0, ad)
								const af = ld64(ld64(s3a8 + 8))
								copyr(s1c0, af, 0x20)
								if ((memcmp(ld64(ld64(s3a8) + 0x18), s1c0, 0x20) as u32) == 0) {
									const aj = ld64(s3a8 + 0x20)
									const position_nft_account: AccountInfo = ld64(aj + 0x20)
									if (position_nft_account.is_writable != 0) {
										if (ld64(aj + 0x68) != 1) {
											anchor_error_from(s2c0, 0x7d3 /* anchor::ConstraintRaw */, aj)
											t = fn_4130(s2d0, ld64(s2c0), ld64(s2c0 + 8), "position_nft_account", 0x14)
											f = ld64(s2d0)
											st64(a + 0x10, ld64(s2d0 + 8))
											st64(a + 8, f)
											st64(a, 0)
											return t
										}
										st64(s3b8, position_nft_account)
										st64(s3a8, af)
										const al = nft_owner.key
										copyr(s1a0, al, 0x20)
										if ((memcmp(aj + 0x48, s1a0, 0x20) as u32) == 0) {
											const am = ld64(s3b0)
											copyr(s120, am, 0x20)
											if ((memcmp(aj + 0x28, s120, 0x20) as u32) == 0) {
												const an = ld64(s3a8)
												copyr(s120, an, 0x20)
												if ((memcmp(ld64(ld64(s3b8) + 0x18), s120, 0x20) as u32) == 0) {
													const ao = ld64(s3b0)
													copyr(s140, ao, 0x20)
													st64(s160, 0x100159360, 8, s140, 0x20)
													// PDA find_program_address(["position", *ao], program *(ld64(s3a8 + 0x30)))
													Pubkey_find_program_address(s120, s160, 2, ld64(s3a8 + 0x30))
													copyr(s180, s120, 0x20)
													st8(ld64(s3a8 + 0x28), ld8(s100))
													const ap = ld64(ld64(s3a8 + 0x18))
													st64(s3a8 + 0x30, ap)
													const aq = ld64(ap)
													copyr(s120, aq, 0x20)
													if ((memcmp(s120, s180, 0x20) as u32) == 0) {
														if (ld8(ld64(s3a8 + 0x30) + 0x29) != 0) {
															copyr(s140, aq, 0x20)
															copyr(s120, s1a0, 0x20)
															t = memcmp(s140, s120, 0x20) as u32
															if (t == 0) {
																anchor_error_from(s360, 0x7db /* anchor::ConstraintClose */)
																t = fn_4130(s370, ld64(s360), ld64(s360 + 8), 0x10015b06a /* "personal_position" */, 0x11)
																f = ld64(s370)
																st64(a + 0x10, ld64(s370 + 8))
																st64(a + 8, f)
																st64(a, 0)
																return t
															}
															st64(a + 0x28, ld64(s3a8 + 8))
															st64(a + 0x20, ld64(s3a8 + 0x10))
															st64(a + 0x18, ld64(s3a8 + 0x18))
															st64(a + 0x10, ld64(s3a8 + 0x20))
															st64(a + 8, l & -8)
															st64(a, nft_owner)
															return t
														}
														anchor_error_from(s340, 0x7d0 /* anchor::ConstraintMut */)
														t = fn_4130(s350, ld64(s340), ld64(s340 + 8), 0x10015b06a /* "personal_position" */, 0x11)
														f = ld64(s350)
														st64(a + 0x10, ld64(s350 + 8))
														st64(a + 8, f)
														st64(a, 0)
														return t
													}
													anchor_error_from(s310, 0x7d6 /* anchor::ConstraintSeeds */)
													fn_4130(s320, ld64(s310), ld64(s310 + 8), 0x10015b06a /* "personal_position" */, 0x11)
													const ay = ld64(s320 + 8)
													const ax = ld64(s320)
													const ar = ld64(ld64(ld64(s3a8 + 0x18)))
													const aw = ld64(ar)
													const av = ld64(ar + 8)
													const au = ld64(ar + 0x10)
													const at = ld64(ar + 0x18)
													copy(s100, s180, 0x20)
													st64(s120, aw, av, au, at)
													t = Error_with_pubkeys(s330, ax, ay, s120, au)
													f = ld64(s330)
													st64(a + 0x10, ld64(s330 + 8))
													st64(a + 8, f)
													st64(a, 0)
													return t
												}
												t = anchor_error_from(s300, 0x7e5 /* anchor::ConstraintTokenTokenProgram */)
												f = ld64(s300)
												st64(a + 0x10, ld64(s300 + 8))
												st64(a + 8, f)
												st64(a, 0)
												return t
											}
											t = anchor_error_from(s2f0, 0x7de /* anchor::ConstraintTokenMint */)
											f = ld64(s2f0)
											st64(a + 0x10, ld64(s2f0 + 8))
											st64(a + 8, f)
											st64(a, 0)
											return t
										}
										t = anchor_error_from(s2e0, 0x7df /* anchor::ConstraintTokenOwner */)
										f = ld64(s2e0)
										st64(a + 0x10, ld64(s2e0 + 8))
										st64(a + 8, f)
										st64(a, 0)
										return t
									}
									anchor_error_from(s2a0, 0x7d0 /* anchor::ConstraintMut */, aj)
									t = fn_4130(s2b0, ld64(s2a0), ld64(s2a0 + 8), "position_nft_account", 0x14)
									f = ld64(s2b0)
									st64(a + 0x10, ld64(s2b0 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return t
								}
								t = anchor_error_from(s290, 0x7e6 /* anchor::ConstraintMintTokenProgram */)
								f = ld64(s290)
								st64(a + 0x10, ld64(s290 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return t
							}
							anchor_error_from(s240, 0x7d0 /* anchor::ConstraintMut */, o, position_nft_mint, ab)
							t = fn_4130(s250, ld64(s240), ld64(s240 + 8), "position_nft_mint", 0x11)
							f = ld64(s250)
							st64(a + 0x10, ld64(s250 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return t
						}
						anchor_error_from(s220, 0x7d0 /* anchor::ConstraintMut */, o, aa, ab)
						t = fn_4130(s230, ld64(s220), ld64(s220 + 8), "nft_owner", 9)
						f = ld64(s230)
						st64(a + 0x10, ld64(s230 + 8))
						st64(a + 8, f)
						st64(a, 0)
						return t
					}
					const w = ld64(0x300000000 /* heap bump-allocator cursor */)
					const x = w != 0 ? sat_sub(w, 0xe) : 0x300007ff2
					if ((f & 1) != 0) {
						if (0x300000008 > x) {
							raw_vec_handle_error(1, 0xe, 0x10015f8f8, sat_sub(w, 0xe), 0xe > w)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, x)
						st64(x + 6, 0x6d6172676f72705f)
						st64(x, 0x705f6d6574737973)
						void ld64(t)
					} else {
						if (0x300000008 > x) {
							raw_vec_handle_error(1, 0xe, 0x10015f8f8, sat_sub(w, 0xe), 0xe > w)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, x)
						st64(x + 6, 0x6d6172676f72705f)
						st64(x, 0x705f6d6574737973)
						void ld64(t)
					}
					st64(t + 0x10, x, 0xe)
					st64(t + 8, 0xe)
					st64(t, 1)
					st64(a + 0x10, t)
					st64(a + 8, f)
					st64(a, 0)
					return t
				}
				alloc_handle_alloc_error(8, 0x120)
			}
			const y = ld64(0x300000000 /* heap bump-allocator cursor */)
			f = ld64(s120 + 8)
			n = y != 0 ? sat_sub(y, 0x11) : 0x300007fef
			o = ld64(s120 + 0x10)
			if (f != 0) {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, az)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6f697469736f705f)
				st64(n, 0x6c616e6f73726570)
				st8(n + 0x10, 0x6e)
				void ld64(o)
			} else {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, az)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6f697469736f705f)
				st64(n, 0x6c616e6f73726570)
				st8(n + 0x10, 0x6e)
				void ld64(o)
			}
		}
		st64(o + 0x10, n, 0x11)
		st64(o + 8, 0x11)
		st64(o, 1)
		st64(a + 0x10, o)
		st64(a + 8, f)
		st64(a, 0)
		return t
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
		void nft_owner.key
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(g, 9), 9 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x656e776f5f74666e)
		st8(h + 8, 0x72)
		void nft_owner.key
	}
	st64(nft_owner + 0x10, h, 9)
	st64(nft_owner + 8 /* lamports */, 9)
	st64(nft_owner /* key */, 1)
	st64(a + 0x10, nft_owner)
	st64(a + 8, f)
	st64(a, 0)
	return t
}

// types [heur]: b: ClosePositionContext (the handler ix_close_position passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_28d58(a: u64, b: ClosePositionContext, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sd8 = fp - 0xd8, se0 = fp - 0xe0, sf8 = fp - 0xf8, s110 = fp - 0x110, s118 = fp - 0x118, s138 = fp - 0x138, s140 = fp - 0x140, s158 = fp - 0x158, s160 = fp - 0x160, s168 = fp - 0x168, s170 = fp - 0x170, s188 = fp - 0x188, s190 = fp - 0x190, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1c8 = fp - 0x1c8, s1e0 = fp - 0x1e0, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8
	let m, n, o: u64
	const accounts: ClosePositionAccounts = b.accounts
	const g = ld64(accounts + 0x18)
	const i = ld64(g + 0x50)
	const h = ld64(g + 0x48)
	if ((h | i) == 0 && (ld64(g + 0x78) == 0 && ld64(g + 0x80) == 0)) {
		let k = 0
		st64(s1c8, 0)
		let j = ld64(g + 0x98)
		if (j == 0) {
			k = 1
			st64(s1c8, 1)
			j = ld64(g + 0xb0)
			if (j == 0) {
				k = 2
				st64(s1c8, 2)
				j = ld64(g + 0xc8)
				if (j == 0) {
					const p: AccountInfo = ld64(accounts + 0x28)
					const q: LamportsCell = p.lamports
					const t = p.key
					rc_inc(q)
					const r: DataCell = p.data
					const s = r.strong
					st64(s290, t)
					rc_inc(r, s)
					const x = p.owner
					const w = p.rent_epoch
					const v = p.is_signer
					const u = p.is_writable
					st8(s1a0 + 2, p.executable)
					st8(s1a0, v, u)
					st64(s1c0, q, r, x, w)
					st64(s1c8, ld64(s290))
					const y: AccountInfo = ld64(ld64(accounts + 8) + 0x58)
					const z: LamportsCell = y.lamports
					const ac = y.key
					rc_inc(z)
					const aa: DataCell = y.data
					const ab = aa.strong
					st64(s290, ac)
					rc_inc(aa, ab)
					const ag = y.owner
					const af = y.rent_epoch
					const ae = y.is_signer
					const ad = y.is_writable
					st8(s170 + 2, y.executable)
					st8(s170, ae, ad)
					st64(s188 + 0x10, af)
					st64(s190, z, aa)
					st64(s198, ld64(s290))
					st64(s298, ag)
					st64(s188 + 8, ag)
					const ah: AccountInfo = ld64(ld64(accounts + 0x10) + 0x20)
					const ai: LamportsCell = ah.lamports
					const ap = ah.key
					rc_inc(ai)
					const aj: DataCell = ah.data
					const ak = aj.strong
					st64(s290, ai)
					rc_inc(aj, ak)
					B31: {
						const ao = ah.owner
						const an = ah.rent_epoch
						const am = ah.is_signer
						const al = ah.is_writable
						st8(s140 + 2, ah.executable)
						st8(s140, am, al)
						st64(s158, aj, ao, an)
						st64(s160, ld64(s290))
						st64(s168, ap)
						if (ld8(ld64(accounts + 0x10) + 0x94) == 2) {
							if (b.remaining_accounts_len == 0) {
								o = fn_88360(s288, 2)
								m = ld64(s288 + 8)
								n = ld64(s288)
								break B31
							}
							const remaining_accounts: AccountInfo = b.remaining_accounts
							const ar = remaining_accounts.key
							copyr(s138, ar, 0x20)
							if ((memcmp(s138, ld64(accounts + 0x18) + 0x28, 0x20) as u32) != 0) {
								fn_85138(s78, 0x10015982c)
								st64(s60, 0, 1, 0)
								st64(s28, s60, 0x10015f818)
								st8(s28 + 0x18, 3)
								st64(s28 + 0x10, 0x20)
								st64(s48 + 0x10, 0)
								st64(s48, 0)
								if (fn_88558(0x10015982c, s48) != 0) {
									fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
								}
								copy(sf8, s78, 0x30)
								st64(s110, 0x100159e62)
								st32(sd8 + 0x58, 0x1770 /* error::NotApproved */)
								st8(sd8 + 0x10, 2)
								st32(s110 + 0x10, 0x5b)
								st64(s110 + 8, 0x2f)
								st64(s118, 0)
								const aw = fn_13e5a0(s228, s118)
								const av = ld64(s228 + 8)
								const au = ld64(s228)
								const at = ld64(accounts + 0x18)
								copyr(sf8, at + 0x28, 0x20)
								copy(s118, s138, 0x20)
								o = Error_with_pubkeys(s238, au, av, s118, aw)
								st64(s290, ld64(s160))
								m = ld64(s238 + 8)
								n = ld64(s238)
								break B31
							}
							st64(s2a0, remaining_accounts)
							o = fn_5608(s118, remaining_accounts)
							m = ld64(s110)
							n = ld64(s118)
							if (n != 2) {
								break B31
							}
							o = fn_4dc0(s118, m, o)
							const ax = ld64(s110 + 8)
							n = ld64(s110)
							m = ax
							if (ld64(s118) != 0) {
								break B31
							}
							st64(s2a8, ax)
							const ay = ld16(n + 0x17f)
							st64(sf8 + 0x10, n + 0x61)
							st64(sf8, n + 0x41)
							st64(sd8 + 0x10, n)
							st64(s110 + 8, n + 1)
							st64(s118, 0x10015984c)
							st64(s48, s118)
							st64(sd8, ay != 0 ? n + 0x17f : 1, (ay != 0) << 1)
							st64(sd8 + 0x18, 1)
							st64(se0, 0x20)
							st64(sf8 + 8, 0x20)
							st64(s110 + 0x10, 0x20)
							st64(s110, 4)
							st64(s48 + 8, 6)
							o = fn_7cb20(s248, ld64(s2a0), s168, s198, s1c8, s48, 1)
							m = ld64(s248 + 8)
							n = ld64(s248)
							const az = ld64(s2a8)
							st64(az, ld64(az) - 1)
							if (n != 2) {
								break B31
							}
						}
						o = fn_7be40(s258, accounts, s198, s168, s1c8, 8, 0, 1)
						m = ld64(s258 + 8)
						n = ld64(s258)
						if (n == 2) {
							const nft_owner: AccountInfo = accounts.nft_owner
							o = fn_7b7e8(s268, nft_owner, nft_owner, s168, s1c8, 8, 0)
							m = ld64(s268 + 8)
							n = ld64(s268)
							if (n == 2) {
								o = memcmp(ld64(s298), 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32
								if (o != 0) {
									o = ptr_drop_in_place_fcd8(s1c8, ptr_drop_in_place_fcd8(s198, ptr_drop_in_place_fcd8(s168, o)))
									st64(a + 8, m)
									st64(a, 2)
									return o
								}
								AccountInfo_clone_f338(s48, ld64(ld64(accounts + 0x18)))
								const nft_owner_2: AccountInfo = accounts.nft_owner
								const bb = ld64(accounts + 0x18)
								st64(s118, 0x100159360)
								st64(s60, s118)
								st64(s110, 8, bb + 8, 0x20, bb + 0x118, 1)
								st64(s60 + 8, 3)
								const bd = fn_7b7e8(s278, s48, nft_owner_2, s198, s1c8, s60, 1)
								m = ld64(s278 + 8)
								n = ld64(s278)
								o = ptr_drop_in_place_fcd8(s48, bd)
								if (n == 2) {
									o = ptr_drop_in_place_fcd8(s1c8, ptr_drop_in_place_fcd8(s198, ptr_drop_in_place_fcd8(s168, o)))
									st64(a + 8, m)
									st64(a, 2)
									return o
								}
							}
						}
					}
					const be = ld64(s290)
					if (rc_release(be)) {
						o = Rc_drop_slow_14df0(s160, o)
					}
					const bf = ld64(s158)
					if (rc_release(bf)) {
						o = Rc_drop_slow_14df0(s158, o)
					}
					const bg: LamportsCell = ld64(s190)
					if (rc_release(bg)) {
						o = Rc_drop_slow_14df0(s190, o)
					}
					const bh: DataCell = ld64(s188)
					if (rc_release(bh)) {
						o = Rc_drop_slow_14df0(s188, o)
					}
					const bi: LamportsCell = ld64(s1c0)
					if (rc_release(bi)) {
						o = Rc_drop_slow_14df0(s1c0, o)
					}
					const bj: DataCell = ld64(s1b8)
					if (!rc_release(bj)) {
						st64(a + 8, m)
						st64(a, n)
						return o
					}
					o = Rc_drop_slow_14df0(s1b8, o)
					st64(a + 8, m)
					st64(a, n)
					return o
				}
			}
		}
		st64(s118, 0x10015fb48)
		st64(s110 + 8, s48)
		st64(s48 + 0x18, fn_155738)
		st64(s48, s1c8, fn_155738)
		const l = k * 0x18
		st64(s48 + 0x10, g + 0x88 + l + 0x10)
		st64(sf8, 0)
		st64(s110, 2)
		st64(s110 + 0x10, 2)
		// fmt "remaing reward index:{},amount:{}" {} = *s1c8 [fn_155738], {} = *(g + 0x88 + l + 0x10) [fn_155738]
		fn_14de10(s1e0, s118, l, j, e)
		sol_log(ld64(s1e0 + 8), ld64(s1e0 + 0x10))
		fn_85138(s198, 0x10015989c)
		st64(s168, 0, 1, 0)
		st64(s28, s168, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_88558(0x10015989c, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(se0, s168, 0x18)
		copy(sf8, s198, 0x18)
		st64(s110, 0x100159e62)
		st32(sd8 + 0x58, 0x1773 /* error::ClosePositionErr */)
		st8(sd8 + 0x10, 2)
		st32(s110 + 0x10, 0x4d)
		st64(s110 + 8, 0x2f)
		st64(s118, 0)
		o = fn_13e5a0(s218, s118)
		n = ld64(s218)
		st64(a + 8, ld64(s218 + 8))
		st64(a, n)
		return o
	}
	st64(s48, 0x10015fb68)
	st64(s48 + 0x10, s118)
	st64(s118, g + 0x48, fn_150868, g + 0x78, fn_155738, g + 0x80, fn_155738)
	st64(s28, 0)
	st64(s48 + 8, 3)
	st64(s48 + 0x18, 3)
	// fmt "remaing liquidity:{},token_fees_owed_0:{},token_fees_owed_1:{}" {} = *(g + 0x48) [fn_150868], {} = *(g + 0x78) [fn_155738], {} = *(g + 0x80) [fn_155738]
	fn_14de10(s1f8, s48, fn_155738, h | i, e)
	sol_log(ld64(s1f8 + 8), ld64(s1f8 + 0x10))
	fn_85138(s198, 0x10015989c)
	st64(s168, 0, 1, 0)
	st64(s28, s168, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x10015989c, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(se0, s168, 0x18)
	copy(sf8, s198, 0x18)
	st64(s110, 0x100159e62)
	st32(sd8 + 0x58, 0x1773 /* error::ClosePositionErr */)
	st8(sd8 + 0x10, 2)
	st32(s110 + 0x10, 0x43)
	st64(s110 + 8, 0x2f)
	st64(s118, 0)
	o = fn_13e5a0(s208, s118)
	n = ld64(s208)
	st64(a + 8, ld64(s208 + 8))
	st64(a, n)
	return o
}

export function fn_7cb20(a: u64, b: AccountInfo, c: AccountInfo, d: AccountInfo, p5: u64, p6: u64, p7: u64): u64 {
	const s10 = fp - 0x10, s18 = fp - 0x18, s40 = fp - 0x40, s48 = fp - 0x48, s70 = fp - 0x70, s78 = fp - 0x78, sa0 = fp - 0xa0, sa8 = fp - 0xa8, se8 = fp - 0xe8, sf8 = fp - 0xf8
	const f: AccountInfo = p5
	const g: LamportsCell = f.lamports
	const h = f.key
	rc_inc(g)
	const i: DataCell = f.data
	const an = p7
	const ao = p6
	rc_inc(i)
	const j: LamportsCell = c.lamports
	const aj = c.key
	const ak = f.executable
	const al = f.is_writable
	const am = f.is_signer
	const o = f.rent_epoch
	const p = f.owner
	rc_inc(j)
	const k: DataCell = c.data
	rc_inc(k)
	const l: LamportsCell = d.lamports
	const ae = d.key
	const af = c.executable
	const ag = c.is_writable
	const ah = c.is_signer
	const ai = c.rent_epoch
	const m = c.owner
	rc_inc(l)
	const n: DataCell = d.data
	rc_inc(n)
	const q: LamportsCell = b.lamports
	const aa = b.key
	const ab = d.executable
	const ac = d.is_writable
	const ad = d.is_signer
	const r = d.rent_epoch
	const t = d.owner
	rc_inc(q)
	const s: DataCell = b.data
	rc_inc(s)
	const x = b.owner
	const w = b.rent_epoch
	const v = b.is_signer
	const u = b.is_writable
	st8(s18 + 2, b.executable)
	st8(s18, v, u)
	st64(s40, aa, q, s, x, w)
	st8(s48, ad, ac, ab)
	st64(s70, ae, l, n, t, r)
	st8(s78, ah, ag, af)
	st64(sa0, aj, j, k, m, ai)
	st64(s10, ao, an)
	st8(sa8, am, al, ak)
	st64(se8, 0, 8, 0, h, g, i, p, o)
	const z = token_2022_close_account_12a8e8(sf8, se8)
	const y = ld64(sf8)
	st64(a + 8, ld64(sf8 + 8))
	st64(a, y)
	return z
}

// types [heur]: b: ClosePositionAccounts (every call passes one: fn_28d58)
export function fn_7be40(a: u64, b: ClosePositionAccounts, c: AccountInfo, d: AccountInfo, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s10 = fp - 0x10, s18 = fp - 0x18, s40 = fp - 0x40, s48 = fp - 0x48, s70 = fp - 0x70, s78 = fp - 0x78, sa0 = fp - 0xa0, sa8 = fp - 0xa8, se8 = fp - 0xe8, sf8 = fp - 0xf8
	const f: LamportsCell = c.lamports
	const p = c.key
	rc_inc(f)
	const g: DataCell = c.data
	const h = p8
	const ao = p7
	const ap = p6
	const i: AccountInfo = p5
	rc_inc(g)
	let aq = b
	const j: LamportsCell = i.lamports
	const an = i.key
	const aj = c.executable
	const ak = c.is_writable
	const al = c.is_signer
	const am = c.rent_epoch
	const o = c.owner
	rc_inc(j)
	const k: DataCell = i.data
	rc_inc(k)
	const l: LamportsCell = d.lamports
	const af = i.executable
	const ag = i.is_writable
	const ah = i.is_signer
	const ai = i.rent_epoch
	const m = i.owner
	const ae = d.key
	rc_inc(l)
	const n: DataCell = d.data
	rc_inc(n)
	const q: AccountInfo = ld64(aq)
	const r: LamportsCell = q.lamports
	const ad = d.executable
	aq = d.is_writable
	const aa = d.is_signer
	const u = d.rent_epoch
	const v = d.owner
	const s = q.key
	rc_inc(r)
	const t: DataCell = q.data
	rc_inc(t)
	const z = q.owner
	const y = q.rent_epoch
	const x = q.is_signer
	const w = q.is_writable
	st8(s18 + 2, q.executable)
	st8(s18, x, w)
	st64(s40, s, r, t, z, y)
	st8(s48, aa, aq, ad)
	st64(s70, ae, l, n, v, u)
	st8(s78, al, ak, aj)
	st64(sa0, p, f, g, o, am)
	st64(s10, ap, ao)
	st8(sa8, ah, ag, af)
	st64(se8, 0, 8, 0, an, j, k, m, ai)
	const ac = token_2022_burn(sf8, se8, h)
	const ab = ld64(sf8)
	st64(a + 8, ld64(sf8 + 8))
	st64(a, ab)
	return ac
}

export function fn_7b7e8(a: u64, b: AccountInfo, c: AccountInfo, d: AccountInfo, p5: u64, p6: u64, p7: u64): u64 {
	const s10 = fp - 0x10, s18 = fp - 0x18, s40 = fp - 0x40, s48 = fp - 0x48, s70 = fp - 0x70, s78 = fp - 0x78, sa0 = fp - 0xa0, sa8 = fp - 0xa8, se8 = fp - 0xe8, sf8 = fp - 0xf8
	const f: AccountInfo = p5
	const g: LamportsCell = f.lamports
	const h = f.key
	rc_inc(g)
	const i: DataCell = f.data
	const an = p7
	const ao = p6
	rc_inc(i)
	const j: LamportsCell = d.lamports
	const aj = d.key
	const ak = f.executable
	const al = f.is_writable
	const am = f.is_signer
	const o = f.rent_epoch
	const p = f.owner
	rc_inc(j)
	const k: DataCell = d.data
	rc_inc(k)
	const l: LamportsCell = c.lamports
	const ae = c.key
	const af = d.executable
	const ag = d.is_writable
	const ah = d.is_signer
	const ai = d.rent_epoch
	const m = d.owner
	rc_inc(l)
	const n: DataCell = c.data
	rc_inc(n)
	const q: LamportsCell = b.lamports
	const aa = b.key
	const ab = c.executable
	const ac = c.is_writable
	const ad = c.is_signer
	const r = c.rent_epoch
	const t = c.owner
	rc_inc(q)
	const s: DataCell = b.data
	rc_inc(s)
	const x = b.owner
	const w = b.rent_epoch
	const v = b.is_signer
	const u = b.is_writable
	st8(s18 + 2, b.executable)
	st8(s18, v, u)
	st64(s40, aa, q, s, x, w)
	st8(s48, ad, ac, ab)
	st64(s70, ae, l, n, t, r)
	st8(s78, ah, ag, af)
	st64(sa0, aj, j, k, m, ai)
	st64(s10, ao, an)
	st8(sa8, am, al, ak)
	st64(se8, 0, 8, 0, h, g, i, p, o)
	const z = token_2022_close_account_1298c8(sf8, se8)
	const y = ld64(sf8)
	st64(a + 8, ld64(sf8 + 8))
	st64(a, y)
	return z
}

export function fn_a8b80(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90
	let h, ab, ac, ad, ae: u64
	B17: {
		const f = ld64(b + 8)
		const g = ld64(f + 0x58)
		if ((memcmp(f + 0x60, c, 0x20) as u32) == 0 && (common_is_closed(g) == 0 && ld64(ld64(g + 0x10) + 0x10) != 0)) {
			st64(s30, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			ae = fn_13e628(s70, s30)
			h = ld64(s70)
			if (h != 2) {
				const af = ld64(0x300000000 /* heap bump-allocator cursor */)
				ab = 0x11 > af
				ac = af != 0 ? ab != 0 ? 0 : af - 0x11 : 0x300007fef
				ad = ld64(s70 + 8)
				if ((h & 1) != 0) {
					if (0x300000008 > ac) {
						raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, ab)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, ac)
					st64(ac + 8, 0x6e696d5f74666e5f)
					st64(ac, 0x6e6f697469736f70)
					st8(ac + 0x10, 0x74)
					void ld64(ad)
					break B17
				}
				if (0x300000008 > ac) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, ab)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ac)
				st64(ac + 8, 0x6e696d5f74666e5f)
				st64(ac, 0x6e6f697469736f70)
				st8(ac + 0x10, 0x74)
				void ld64(ad)
				break B17
			}
		}
		const i = ld64(b + 0x10)
		const j = ld64(i + 0x20)
		if ((memcmp(i, c, 0x20) as u32) == 0 && (common_is_closed(j) == 0 && ld64(ld64(j + 0x10) + 0x10) != 0)) {
			st64(s30, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			ae = fn_13e628(s80, s30)
			h = ld64(s80)
			if (h != 2) {
				const ag = ld64(0x300000000 /* heap bump-allocator cursor */)
				ac = ag != 0 ? sat_sub(ag, 0x14) : 0x300007fec
				ad = ld64(s80 + 8)
				if ((h & 1) != 0) {
					if (0x300000008 > ac) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > ag)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, ac)
					st64(ac + 8, 0x6363615f74666e5f)
					st64(ac, 0x6e6f697469736f70)
					st32(ac + 0x10, 0x746e756f)
					void ld64(ad)
				} else {
					if (0x300000008 > ac) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > ag)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, ac)
					st64(ac + 8, 0x6363615f74666e5f)
					st64(ac, 0x6e6f697469736f70)
					st32(ac + 0x10, 0x746e756f)
					void ld64(ad)
				}
				st64(ad + 8, 0x14)
				st64(ad, 1)
				st64(ad + 0x18, 0x14)
				st64(ad + 0x10, ac)
				st64(a + 8, ad)
				st64(a, h)
				return ae
			}
		}
		const k: AccountInfo = ld64(b)
		const l: LamportsCell = k.lamports
		const r = k.key
		rc_inc(l)
		const m: DataCell = k.data
		rc_inc(m)
		const q = k.owner
		const p = k.rent_epoch
		const o = k.is_signer
		const n = k.is_writable
		st8(s38 + 2, k.executable)
		st8(s38, o, n)
		st64(s60, r, l, m, q, p)
		const s: AccountInfo = ld64(ld64(b + 0x18))
		const t: LamportsCell = s.lamports
		const z = s.key
		rc_inc(t)
		const u: DataCell = s.data
		rc_inc(u)
		const y = s.owner
		const x = s.rent_epoch
		const w = s.is_signer
		const v = s.is_writable
		st8(s8 + 2, s.executable)
		st8(s8, w, v)
		st64(s30, z, t, u, y, x)
		ae = fn_13e190(s90, s30, s60, u, y)
		ad = undef
		h = ld64(s90)
		if (h == 2) {
			st64(a + 8, ad)
			st64(a, 2)
			return ae
		}
		const aa = ld64(0x300000000 /* heap bump-allocator cursor */)
		ab = 0x11 > aa
		ac = aa != 0 ? ab != 0 ? 0 : aa - 0x11 : 0x300007fef
		ad = ld64(s90 + 8)
		if ((h & 1) != 0) {
			if (0x300000008 > ac) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, ab)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, ac)
			st64(ac + 8, 0x6f697469736f705f)
			st64(ac, 0x6c616e6f73726570)
			st8(ac + 0x10, 0x6e)
			void ld64(ad)
		} else {
			if (0x300000008 > ac) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, ab)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, ac)
			st64(ac + 8, 0x6f697469736f705f)
			st64(ac, 0x6c616e6f73726570)
			st8(ac + 0x10, 0x6e)
			void ld64(ad)
		}
	}
	st64(ad + 8, 0x11)
	st64(ad, 1)
	st64(ad + 0x18, 0x11)
	st64(ad + 0x10, ac)
	st64(a + 8, ad)
	st64(a, h)
	return ae
}
