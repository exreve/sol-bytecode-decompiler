/// <reference path="../lib.d.ts" />
// instruction initialize_reward
import { anchor_error_from, fn_13e5a0, fn_13e628, fn_14ec00, fn_14ed60, fn_154788, fn_16330, fn_4130, fn_4808, fn_4dc0, fn_53e8, fn_58930, fn_79050, fn_7d178, fn_7e058, fn_7e560, fn_81db0, fn_85138, fn_88360, fn_88558, fn_a80, memcpy } from '../shared.ts'

// instruction handler: initialize_reward (discriminator sha256("global:initialize_reward")[..8] = 0x44e681f2c4c0875f)
// accounts [idl]: 0 reward_funder [signer, mut], 1 funder_token_account [mut], 2 amm_config, 3 pool_state [mut], 4 operation_state [pda], 5 reward_token_mint, 6 reward_token_vault [mut, pda], 7 reward_token_program, 8 system_program [= 11111111111111111111111111111111], 9 rent [= SysvarRent111111111111111111111111111111111]
// args [idl]: param: InitializeRewardParam
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args
export function ix_initialize_reward(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s20 = fp - 0x20, s70 = fp - 0x70, s78 = fp - 0x78, s88 = fp - 0x88, sd8 = fp - 0xd8, sf0 = fp - 0xf0, s100 = fp - 0x100, s102 = fp - 0x102, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, sff8 = fp - 0xff8
	let n, r: u64
	const k = sol_log("Instruction: InitializeReward", 0x1d)
	const f = ix_args_len
	if (f >= 8 && ((f & -8) != 8 && (f & -0x10) != 0x10)) {
		const args: InitializeRewardArgs = ix_args
		const j = ld64(args.param.emissions_per_second_x64)
		const i = ld64(args.param.emissions_per_second_x64 + 8)
		const h = ld64(args.param)
		st64(s20 + 0x18, args.param.end_time)
		st64(s20, j, i, h)
		st16(s102, 0xffff)
		st64(s100, accounts, accounts_len)
		st64(sff8, s102)
		r = accounts_initialize_reward(s88, program_id, s100, h, fp, k)
		const m = ld64(s78)
		n = ld64(s88 + 8)
		const l = ld64(s88)
		if (l == 0) {
			st64(a + 8, m)
			st64(a, n)
			return r
		}
		const o = memcpy(sd8, s70, 0x50)
		st64(sf0, l, n, m)
		st8(s70 + 9, ld8(s102 + 1))
		st8(s70 + 8, ld8(s102))
		copyr(s78, s100, 0x10)
		st64(s88, program_id, sf0)
		r = fn_44080(s118, s88, s20, o)
		n = ld64(s118)
		if (n == 2) {
			r = fn_becb0(s128, sf0, program_id)
			n = ld64(s128)
			st64(a + 8, ld64(s128 + 8))
			st64(a, n)
			return r
		}
		st64(a + 8, ld64(s118 + 8))
		st64(a, n)
		return r
	}
	const p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (p & 3) - 2) {
		r = anchor_error_from(s138, 0x66 /* anchor::InstructionDidNotDeserialize */)
		n = ld64(s138)
		st64(a + 8, ld64(s138 + 8))
		st64(a, n)
		return r
	}
	if ((p & 3) == 0) {
		r = anchor_error_from(s138, 0x66 /* anchor::InstructionDidNotDeserialize */)
		n = ld64(s138)
		st64(a + 8, ld64(s138 + 8))
		st64(a, n)
		return r
	}
	const q = ld64(ld64(p + 7))
	if (q == 0) {
		r = anchor_error_from(s138, 0x66 /* anchor::InstructionDidNotDeserialize */)
		n = ld64(s138)
		st64(a + 8, ld64(s138 + 8))
		st64(a, n)
		return r
	}
	callx(q, ld64(p - 1), q)
	r = anchor_error_from(s138, 0x66 /* anchor::InstructionDidNotDeserialize */)
	n = ld64(s138)
	st64(a + 8, ld64(s138 + 8))
	st64(a, n)
	return r
}

// Anchor Accounts::try_accounts of instruction initialize_reward (called by ix_initialize_reward; name [str]: from the handler's "Instruction: …" log; was fn_bd048)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: reward_token_mint, reward_token_vault (AccountNotEnoughKeys, ConstraintMut, ConstraintSeeds), reward_token_program, system_program, rent, operation_state (ConstraintSeeds), pool_state (ConstraintMut), amm_config (ConstraintAddress), funder_token_account (ConstraintMut), reward_funder (ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: reward_funder [idl]
export function accounts_initialize_reward(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const sb8 = fp - 0xb8, sd8 = fp - 0xd8, sf8 = fp - 0xf8, s118 = fp - 0x118, s138 = fp - 0x138, s160 = fp - 0x160, s180 = fp - 0x180, s1a0 = fp - 0x1a0, s1c0 = fp - 0x1c0, s1e0 = fp - 0x1e0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s3e0 = fp - 0x3e0
	let o, ac, ae, af, ag, aj, ak, am, an: u64
	st64(s3e0 + 0x58, b)
	let r = try_accounts_17a30(sd8, c, c, d, e, r0)
	const reward_funder: AccountInfo = ld64(sd8 + 8)
	let f = ld64(sd8)
	if (f == 2) {
		const k = ld64(e - 0xff8)
		r = try_accounts_1678(sd8, c)
		if (ld32(sb8 + 0x90) == 2) {
			const m = ld64(0x300000000 /* heap bump-allocator cursor */)
			f = ld64(sd8)
			const n = m != 0 ? sat_sub(m, 0x14) : 0x300007fec
			o = ld64(sd8 + 8)
			if (f != 0) {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6363615f6e656b6f)
				st64(n, 0x745f7265646e7566)
				st32(n + 0x10, 0x746e756f)
				void ld64(o)
			} else {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6363615f6e656b6f)
				st64(n, 0x745f7265646e7566)
				st32(n + 0x10, 0x746e756f)
				void ld64(o)
			}
			st64(o + 0x10, n, 0x14)
			st64(o + 8, 0x14)
			st64(o, 1)
			st64(a + 0x10, o)
			st64(a + 8, f)
			st64(a, 0)
			return r
		}
		const j = ld64(0x300000000 /* heap bump-allocator cursor */)
		st64(s3e0 + 0x50, k)
		const l = j != 0 ? sat_sub(j, 0xd8) : 0x300007f28
		if (0x300000008 > l) {
			alloc_handle_alloc_error(8, 0xd8)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, l & -8)
		if ((l & -8) != 0) {
			memcpy(l & -8, sd8, 0xd8)
			r = try_accounts_184d8(sd8, c)
			let y = undef
			if (ld64(sd8) == 0) {
				const u = ld64(0x300000000 /* heap bump-allocator cursor */)
				f = ld64(sd8 + 8)
				const v = u != 0 ? sat_sub(u, 0xa) : 0x300007ff6
				o = ld64(sd8 + 0x10)
				if (f != 0) {
					if (0x300000008 > v) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, y)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, v)
					st64(v, 0x666e6f635f6d6d61)
					st16(v + 8, 0x6769)
					void ld64(o)
				} else {
					if (0x300000008 > v) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, y)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, v)
					st64(v, 0x666e6f635f6d6d61)
					st16(v + 8, 0x6769)
					void ld64(o)
				}
				st64(o + 0x10, v, 0xa)
				st64(o + 8, 0xa)
				st64(o, 1)
				st64(a + 0x10, o)
				st64(a + 8, f)
				st64(a, 0)
				return r
			}
			const p = ld64(0x300000000 /* heap bump-allocator cursor */)
			const q = p != 0 ? sat_sub(p, 0x78) : 0x300007f88
			if (0x300000008 > q) {
				alloc_handle_alloc_error(8, 0x78)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, q & -8)
			if ((q & -8) != 0) {
				st64(s3e0 + 0x48, q & -8)
				memcpy(q & -8, sd8, 0x78)
				fn_11e0(sd8, c)
				r = ld64(sd8 + 8)
				f = ld64(sd8)
				if (f == 2) {
					st64(s3e0 + 0x40, r)
					fn_12d8(sd8, c)
					r = ld64(sd8 + 8)
					f = ld64(sd8)
					if (f == 2) {
						st64(s3e0 + 0x30, r)
						try_accounts_15c0(sd8, c)
						if (ld32(sd8) == 2) {
							r = fn_4130(s210, ld64(sd8 + 8), ld64(sd8 + 0x10), "reward_token_mint", 0x11)
							ac = ld64(s210 + 8)
							f = ld64(s210)
							if (f != 2) {
								st64(a + 0x10, ac)
								st64(a + 8, f)
								st64(a, 0)
								return r
							}
						} else {
							const aa = ld64(0x300000000 /* heap bump-allocator cursor */)
							const ab = aa != 0 ? sat_sub(aa, 0x80) : 0x300007f80
							if (0x300000008 > ab) {
								alloc_handle_alloc_error(8, 0x80)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, ab & -8)
							if ((ab & -8) == 0) {
								alloc_handle_alloc_error(8, 0x80)
							}
							st64(s3e0 + 0x38, ab & -8)
							memcpy(ab & -8, sd8, 0x80)
							ac = ld64(s3e0 + 0x38)
						}
						st64(s3e0 + 0x38, ac)
						const ad = ld64(c + 8)
						if (ad == 0) {
							anchor_error_from(s220, 0xbbd /* anchor::AccountNotEnoughKeys */, ae, af, ag)
							o = ld64(s220 + 8)
							const ah = ld64(s220)
							if (ah != 2) {
								r = fn_4130(s230, ah, o, "reward_token_vault", 0x12)
								o = ld64(s230 + 8)
								f = ld64(s230)
								if (f != 2) {
									st64(a + 0x10, o)
									st64(a + 8, f)
									st64(a, 0)
									return r
								}
							}
						} else {
							st64(c + 8, ad - 1)
							o = ld64(c)
							st64(c, o + 0x30)
						}
						st64(s3e0 + 0x28, o)
						try_accounts_120(sd8, c, o, af, ag)
						o = ld64(sd8 + 8)
						const ai = ld64(sd8)
						if (ai != 2) {
							r = fn_4130(s240, ai, o, "reward_token_program", 0x14)
							o = ld64(s240 + 8)
							f = ld64(s240)
							if (f != 2) {
								st64(a + 0x10, o)
								st64(a + 8, f)
								st64(a, 0)
								return r
							}
						}
						st64(s3e0 + 0x20, o)
						try_accounts_18870(sd8, c, o, aj, ak)
						o = ld64(sd8 + 8)
						const al = ld64(sd8)
						if (al != 2) {
							r = fn_4130(s250, al, o, "system_program", 0xe)
							o = ld64(s250 + 8)
							f = ld64(s250)
							if (f != 2) {
								st64(a + 0x10, o)
								st64(a + 8, f)
								st64(a, 0)
								return r
							}
						}
						st64(s3e0 + 0x18, o)
						try_accounts_17ae0(sd8, c, o, am, an)
						const ap = ld64(sd8 + 0x10)
						const aq = ld64(sd8 + 8)
						const ao = ld64(sd8)
						if (ao == 0) {
							r = fn_4130(s380, aq, ap, 0x1001598f8 /* "rent" */, 4)
							f = ld64(s380)
							st64(a + 0x10, ld64(s380 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return r
						}
						if (reward_funder.is_writable != 0) {
							if (ld8(ld64((l & -8) + 0x20) + 0x29) != 0) {
								st64(s3e0, ap, aq)
								st64(s3e0 + 0x10, ld64(sd8 + 0x18))
								const ar = ld64(ld64(ld64(s3e0 + 0x38) + 0x58))
								copyr(sd8, ar, 0x20)
								const at = memcmp((l & -8) + 0x28, sd8, 0x20)
								if ((at as u32) != 0) {
									r = anchor_error_from(s2a0, 0x7de /* anchor::ConstraintTokenMint */)
									f = ld64(s2a0)
									st64(a + 0x10, ld64(s2a0 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return r
								}
								const au = ld64(ld64(ld64(s3e0 + 0x48)))
								copyr(s200, au, 0x20)
								r = fn_4dc0(sd8, ld64(s3e0 + 0x40), at as u32)
								const av = ld64(sd8 + 0x10)
								const aw = ld64(sd8 + 8)
								if (ld64(sd8) != 0) {
									st64(a + 0x10, av)
									st64(a + 8, aw)
									st64(a, 0)
									return r
								}
								copyr(s1e0, aw + 1, 0x20)
								st64(av, ld64(av) - 1)
								if ((memcmp(s200, s1e0, 0x20) as u32) == 0) {
									if (ld8(ld64(s3e0 + 0x40) + 0x29 /* is_writable */) != 0) {
										st64(s160, 0x10015b1ad, 9)
										// PDA find_program_address(["operation"], program *(ld64(s3e0 + 0x58)))
										Pubkey_find_program_address(sd8, s160, 1, ld64(s3e0 + 0x58))
										copyr(s1c0, sd8, 0x20)
										st8(ld64(s3e0 + 0x50), ld8(sb8))
										const ba = ld64(ld64(s3e0 + 0x30))
										copyr(s1a0, ba, 0x20)
										if ((memcmp(s1a0, s1c0, 0x20) as u32) != 0) {
											anchor_error_from(s300, 0x7d6 /* anchor::ConstraintSeeds */)
											const bn = fn_4130(s310, ld64(s300), ld64(s300 + 8), "operation_state", 0xf)
											const bm = ld64(s310 + 8)
											const bl = ld64(s310)
											copyr(sd8, s1a0, 0x20)
											copy(sb8, s1c0, 0x20)
											r = Error_with_pubkeys(s320, bl, bm, sd8, bn)
											f = ld64(s320)
											st64(a + 0x10, ld64(s320 + 8))
											st64(a + 8, f)
											st64(a, 0)
											return r
										}
										const bb = ld64(ld64(s3e0 + 0x40) /* key */)
										copyr(s138, bb, 0x20)
										const bc = ld64(ld64(ld64(s3e0 + 0x38) + 0x58))
										const bg = ld64(bc)
										const bf = ld64(bc + 8)
										const be = ld64(bc + 0x10)
										const bd = ld64(bc + 0x18)
										st64(sd8, 0x10015a08c)
										st64(sd8 + 0x10, s138)
										st64(sb8, s118)
										st64(s118, bg, bf, be, bd)
										st64(sd8 + 8, 0x11)
										st64(sd8 + 0x18, 0x20)
										st64(sb8 + 8, 0x20)
										// PDA find_program_address(["pool_reward_vault", *bb, *s118], program *(ld64(s3e0 + 0x58)))
										Pubkey_find_program_address(s160, sd8, 3, ld64(s3e0 + 0x58))
										copyr(s180, s160, 0x20)
										st8(ld64(s3e0 + 0x50) + 1, ld8(s160 + 0x20))
										const bh = ld64(ld64(s3e0 + 0x28) /* key */)
										copyr(sf8, bh, 0x20)
										r = memcmp(sf8, s180, 0x20) as u32
										if (r == 0) {
											if (ld8(ld64(s3e0 + 0x28) + 0x29 /* is_writable */) != 0) {
												st64(a + 0x60, ld64(s3e0 + 0x10))
												st64(a + 0x58, ld64(s3e0))
												st64(a + 0x50, ld64(s3e0 + 8))
												st64(a + 0x48, ao)
												st64(a + 0x40, ld64(s3e0 + 0x18))
												st64(a + 0x38, ld64(s3e0 + 0x20))
												st64(a + 0x30, ld64(s3e0 + 0x28))
												st64(a + 0x28, ld64(s3e0 + 0x38))
												st64(a + 0x20, ld64(s3e0 + 0x30))
												st64(a + 0x18, ld64(s3e0 + 0x40))
												st64(a + 0x10, ld64(s3e0 + 0x48))
												st64(a + 8, l & -8)
												st64(a, reward_funder)
												return r
											}
											anchor_error_from(s360, 0x7d0 /* anchor::ConstraintMut */)
											r = fn_4130(s370, ld64(s360), ld64(s360 + 8), "reward_token_vault", 0x12)
											f = ld64(s370)
											st64(a + 0x10, ld64(s370 + 8))
											st64(a + 8, f)
											st64(a, 0)
											return r
										}
										anchor_error_from(s330, 0x7d6 /* anchor::ConstraintSeeds */)
										const bk = fn_4130(s340, ld64(s330), ld64(s330 + 8), "reward_token_vault", 0x12)
										const bj = ld64(s340 + 8)
										const bi = ld64(s340)
										copyr(sd8, sf8, 0x20)
										copy(sb8, s180, 0x20)
										r = Error_with_pubkeys(s350, bi, bj, sd8, bk)
										f = ld64(s350)
										st64(a + 0x10, ld64(s350 + 8))
										st64(a + 8, f)
										st64(a, 0)
										return r
									}
									anchor_error_from(s2e0, 0x7d0 /* anchor::ConstraintMut */)
									r = fn_4130(s2f0, ld64(s2e0), ld64(s2e0 + 8), "pool_state", 0xa)
									f = ld64(s2f0)
									st64(a + 0x10, ld64(s2f0 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return r
								}
								anchor_error_from(s2b0, 0x7dc /* anchor::ConstraintAddress */)
								const az = fn_4130(s2c0, ld64(s2b0), ld64(s2b0 + 8), 0x10015af4d /* "amm_config" */, 0xa)
								const ay = ld64(s2c0 + 8)
								const ax = ld64(s2c0)
								copy(sd8, s200, 0x40)
								r = Error_with_pubkeys(s2d0, ax, ay, sd8, az)
								f = ld64(s2d0)
								st64(a + 0x10, ld64(s2d0 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return r
							}
							anchor_error_from(s280, 0x7d0 /* anchor::ConstraintMut */, ap)
							r = fn_4130(s290, ld64(s280), ld64(s280 + 8), "funder_token_account", 0x14)
							f = ld64(s290)
							st64(a + 0x10, ld64(s290 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return r
						}
						anchor_error_from(s260, 0x7d0 /* anchor::ConstraintMut */, ap)
						r = fn_4130(s270, ld64(s260), ld64(s260 + 8), "reward_funder", 0xd)
						f = ld64(s270)
						st64(a + 0x10, ld64(s270 + 8))
						st64(a + 8, f)
						st64(a, 0)
						return r
					}
					const s = ld64(0x300000000 /* heap bump-allocator cursor */)
					const t = s != 0 ? sat_sub(s, 0xf) : 0x300007ff1
					if ((f & 1) != 0) {
						if (0x300000008 > t) {
							raw_vec_handle_error(1, 0xf, 0x10015f8f8, sat_sub(s, 0xf), 0xf > s)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, t)
						st64(t + 7, 0x65746174735f6e6f)
						st64(t, 0x6f6974617265706f)
						void ld64(r)
					} else {
						if (0x300000008 > t) {
							raw_vec_handle_error(1, 0xf, 0x10015f8f8, sat_sub(s, 0xf), 0xf > s)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, t)
						st64(t + 7, 0x65746174735f6e6f)
						st64(t, 0x6f6974617265706f)
						void ld64(r)
					}
					st64(r + 0x10, t, 0xf)
					st64(r + 8, 0xf)
					st64(r, 1)
					st64(a + 0x10, r)
					st64(a + 8, f)
					st64(a, 0)
					return r
				}
				const x = ld64(0x300000000 /* heap bump-allocator cursor */)
				y = 0xa > x
				const w = y != 0 ? 0 : x - 0xa
				const z = x != 0 ? w : 0x300007ff6
				if ((f & 1) != 0) {
					if (0x300000008 > z) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, w, y)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, z)
					st64(z, 0x6174735f6c6f6f70)
					st16(z + 8, 0x6574)
					void ld64(r)
				} else {
					if (0x300000008 > z) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, w, y)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, z)
					st64(z, 0x6174735f6c6f6f70)
					st16(z + 8, 0x6574)
					void ld64(r)
				}
				st64(r + 0x10, z, 0xa)
				st64(r + 8, 0xa)
				st64(r, 1)
				st64(a + 0x10, r)
				st64(a + 8, f)
				st64(a, 0)
				return r
			}
			alloc_handle_alloc_error(8, 0x78)
		}
		alloc_handle_alloc_error(8, 0xd8)
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0xd) : 0x300007ff3
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xd, 0x10015f8f8, sat_sub(g, 0xd), 0xd > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 5, 0x7265646e75665f64)
		st64(h, 0x665f647261776572)
		void reward_funder.key
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xd, 0x10015f8f8, sat_sub(g, 0xd), 0xd > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 5, 0x7265646e75665f64)
		st64(h, 0x665f647261776572)
		void reward_funder.key
	}
	st64(reward_funder + 0x10, h, 0xd)
	st64(reward_funder + 8, 0xd)
	st64(reward_funder, 1)
	st64(a + 0x10, reward_funder)
	st64(a + 8, f)
	st64(a, 0)
	return r
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it)
// types [heur]: b: InitializeRewardContext (the handler ix_initialize_reward passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_44080(a: u64, b: InitializeRewardContext, c: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, sa8 = fp - 0xa8, s110 = fp - 0x110, s128 = fp - 0x128, s148 = fp - 0x148, s149 = fp - 0x149, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s270 = fp - 0x270, s278 = fp - 0x278, s280 = fp - 0x280, s288 = fp - 0x288, sff0 = fp - 0xff0, s1000 = fp - 0x1000
	let bc: u64
	st64(s250, c, a)
	const accounts: InitializeRewardAccounts = b.accounts
	let af = fn_7e058(s148, b.remaining_accounts, b.remaining_accounts_len, ld64(accounts + 0x28), r0)
	let an = ld64(s148 + 8)
	let g = ld64(s148)
	if (g != 2) {
		bc = ld64(s250 + 8)
		st64(bc + 8, an)
		st64(bc, g)
		return af
	}
	af = fn_7e560(s148, ld64(accounts + 0x28), ld8(s148 + 8) & 1)
	an = ld64(s148 + 8)
	g = ld64(s148)
	if (g != 2) {
		bc = ld64(s250 + 8)
		st64(bc + 8, an)
		st64(bc, g)
		return af
	}
	st64(s270 + 0x18, accounts)
	if ((ld8(s148 + 8) & 1) != 0) {
		const h: InitializeRewardAccounts = ld64(s270 + 0x18)
		const i: AccountInfo = ld64(h + 0x18)
		const j: LamportsCell = i.lamports
		const p = i.key
		rc_inc(j)
		const k: DataCell = i.data
		rc_inc(k)
		const o = i.owner
		const n = i.rent_epoch
		const m = i.is_signer
		const l = i.is_writable
		st8(s50 + 2, i.executable)
		st8(s50, m, l)
		st64(s78, p, j, k, o, n)
		const q: AccountInfo = ld64(h + 0x30)
		const r: LamportsCell = q.lamports
		const s = r.strong
		st64(s270 + 0x10, k)
		const t = q.key
		rc_inc(r, s)
		st64(s270, t)
		const u: DataCell = q.data
		const v = u.strong
		st64(s270 + 8, j)
		rc_inc(u, v)
		const z = q.owner
		const y = q.rent_epoch
		const x = q.is_signer
		const w = q.is_writable
		st8(s20 + 2, q.executable)
		st8(s20, x, w)
		st64(s38, u, z, y)
		st64(s48, ld64(s270))
		st64(s278, r)
		st64(s40, r)
		const ab = ld64(h + 0x28)
		const aa = ld64(ld64(h + 0x18))
		copyr(s170, aa, 0x20)
		const ac = ld64(ld64(ab + 0x58))
		copyr(sa8, ac, 0x20)
		const ad = ld8(b + 0x21)
		st64(s128 + 0x10, s149)
		st64(s128, sa8)
		st64(s148 + 0x10, s170)
		st64(s148, 0x10015a08c)
		st8(s149, ad)
		st64(s110, 1)
		st64(s128 + 8, 0x20)
		st64(s148 + 0x18, 0x20)
		st64(s148 + 8, 0x11)
		st64(s1000, ab, h + 0x40, h + 0x38, s148, 4)
		af = fn_81db0(s190, h, s78, s48, ab, h + 0x40, h + 0x38, s148, 4)
		an = ld64(s190 + 8)
		g = ld64(s190)
		const ae = ld64(s278)
		if (rc_release(ae)) {
			af = Rc_drop_slow_14df0(s40, af)
		}
		if (rc_release(u)) {
			af = Rc_drop_slow_14df0(s38, af)
		}
		const ag = ld64(s270 + 8)
		const ah = ld64(s270 + 0x10)
		if (rc_release(ag)) {
			af = Rc_drop_slow_14df0(s70, af)
		}
		if (rc_release(ah)) {
			af = Rc_drop_slow_14df0(s68, af)
		}
		const ai: InitializeRewardAccounts = ld64(s270 + 0x18)
		if (g == 2) {
			af = fn_4808(s148, ld64(ai + 0x20), af)
			let aj = ld64(s148 + 0x10)
			const ak = ld64(s148 + 8)
			an = aj
			g = ak
			if (ld64(s148) != 0) {
				bc = ld64(s250 + 8)
				st64(bc + 8, an)
				st64(bc, g)
				return af
			}
			st64(s270 + 0x10, ak)
			const al = ai.reward_funder.key
			copyr(s148, al, 0x20)
			const am = memcmp(s148, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20)
			if ((am as u32) != 0) {
				copyr(s148, al, 0x20)
				af = fn_4dc0(s48, ld64(ai + 0x18), am as u32)
				an = ld64(s38)
				g = ld64(s40)
				if (ld64(s48) != 0) {
					st64(aj, ld64(aj) - 1)
					bc = ld64(s250 + 8)
					st64(bc + 8, an)
					st64(bc, g)
					return af
				}
				const ao = memcmp(s148, g + 0x21, 0x20)
				st64(an, ld64(an) - 1)
				const ap: InitializeRewardAccounts = ld64(s270 + 0x18)
				if ((ao as u32) != 0 && fn_67ac0(ld64(s270 + 0x10), ap.reward_funder.key) == 0) {
					fn_85138(sa8, 0x10015982c)
					st64(s78, 0, 1, 0)
					st64(s28, s78, 0x10015f818)
					st8(s20 + 0x10, 3)
					st64(s20 + 8, 0x20)
					st64(s38, 0)
					st64(s48, 0)
					if (fn_88558(0x10015982c, s48) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
					}
					copyr(s110, s78, 0x18)
					copy(s128, sa8, 0x18)
					st64(s148 + 8, 0x10015a05a)
					st32(s110 + 0x60, 0x1770 /* error::NotApproved */)
					st8(s110 + 0x18, 2)
					st32(s148 + 0x18, 0x83)
					st64(s148 + 0x10, 0x32)
					st64(s148, 0)
					af = fn_13e5a0(s1a0, s148)
					an = ld64(s1a0 + 8)
					g = ld64(s1a0)
					st64(aj, ld64(aj) - 1)
					bc = ld64(s250 + 8)
					st64(bc + 8, an)
					st64(bc, g)
					return af
				}
			}
			const au = clock_get(s148)
			if (ld64(s148) != 0) {
				const ar = ld64(s148 + 8)
				const aq = ld64(s148 + 0x10)
				st64(s148 + 0x10, ld64(s148 + 0x18))
				st64(s148, ar, aq)
				af = fn_13e628(s240, s148)
				an = ld64(s240 + 8)
				g = ld64(s240)
				st64(aj, ld64(aj) - 1)
				bc = ld64(s250 + 8)
				st64(bc + 8, an)
				st64(bc, g)
				return af
			}
			const at = ld64(s250)
			af = fn_43fb8(s1b0, at, ld64(s128 + 8), au)
			an = ld64(s1b0 + 8)
			g = ld64(s1b0)
			if (g == 2) {
				const aw = ld64(at + 0x10)
				const av = ld64(at + 0x18)
				if (aw > av) {
					fn_154788(0x10015fe00)
				}
				st64(sa8, av - aw, 0)
				const ay = ld64(at)
				const ax = ld64(at + 8)
				st64(s70, ax)
				st64(s250, ay)
				st64(s78, ay)
				st64(s48, 0, 1)
				fn_58930(s148, sa8, s78, s48)
				const az: InitializeRewardAccounts = ld64(s270 + 0x18)
				if (ld64(s148) != 0) {
					st64(s270, ax, aw)
					if (ld64(s148 + 0x10) == 0) {
						const ba = ld64(s148 + 8)
						af = fn_7d178(s148, fn_16330(ld64(az + 0x28)), ba)
						const bb = ld64(s148 + 8)
						g = ld64(s148)
						if (g != 2) {
							st64(aj, ld64(aj) - 1)
							bc = ld64(s250 + 8)
							st64(bc + 8, bb)
							st64(bc, g)
							return af
						}
						st64(s278, av)
						const bd: InitializeRewardAccounts = ld64(s270 + 0x18)
						if (ba > bb + ba) {
							af = fn_88360(s230, 0x26)
							an = ld64(s230 + 8)
							g = ld64(s230)
							st64(aj, ld64(aj) - 1)
							bc = ld64(s250 + 8)
							st64(bc + 8, an)
							st64(bc, g)
							return af
						}
						if (bb + ba > ld64(ld64(bd + 8) + 0x68)) {
							ErrorCode_name(sa8, 0x100159858)
							st64(s78, 0, 1, 0)
							st64(s28, s78, 0x10015f818)
							st8(s20 + 0x10, 3)
							st64(s20 + 8, 0x20)
							st64(s38, 0)
							st64(s48, 0)
							if (ErrorCode_fmt(0x100159858, s48) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
							}
							copyr(s110, s78, 0x18)
							copy(s128, sa8, 0x18)
							st64(s148 + 8, 0x10015a05a)
							st32(s110 + 0x60, 0x9ca /* anchor::RequireGteViolated */)
							st8(s110 + 0x18, 2)
							st32(s148 + 0x18, 0x9c)
							st64(s148 + 0x10, 0x32)
							st64(s148, 0)
							fn_13e5a0(s210, s148)
							af = fn_1730(s220, ld64(s210), ld64(s210 + 8), ld64(ld64(bd + 8) + 0x68), bb + ba)
							an = ld64(s220 + 8)
							g = ld64(s220)
							st64(aj, ld64(aj) - 1)
							bc = ld64(s250 + 8)
							st64(bc + 8, an)
							st64(bc, g)
							return af
						}
						if (ba > 0x5555555555555554) {
							ErrorCode_name(sa8, 0x100159900)
							st64(s78, 0, 1, 0)
							st64(s28, s78, 0x10015f818)
							st8(s20 + 0x10, 3)
							st64(s20 + 8, 0x20)
							st64(s38, 0)
							st64(s48, 0)
							if (ErrorCode_fmt(0x100159900, s48) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
							}
							copyr(s110, s78, 0x18)
							copy(s128, sa8, 0x18)
							st64(s148 + 8, 0x10015a05a)
							st32(s110 + 0x60, 0x9c9 /* anchor::RequireGtViolated */)
							st8(s110 + 0x18, 2)
							st32(s148 + 0x18, 0xa1)
							st64(s148 + 0x10, 0x32)
							st64(s148, 0)
							fn_13e5a0(s1f0, s148)
							af = fn_1730(s200, ld64(s1f0), ld64(s1f0 + 8), 0x5555555555555555, ba)
							an = ld64(s200 + 8)
							g = ld64(s200)
							st64(aj, ld64(aj) - 1)
							bc = ld64(s250 + 8)
							st64(bc + 8, an)
							st64(bc, g)
							return af
						}
						st64(s280, bb + ba)
						af = fn_53e8(s148, ld64(bd + 0x18), undef, undef, undef, af)
						an = ld64(s148 + 0x10)
						g = ld64(s148 + 8)
						if (ld64(s148) != 0) {
							st64(aj, ld64(aj) - 1)
							bc = ld64(s250 + 8)
							st64(bc + 8, an)
							st64(bc, g)
							return af
						}
						st64(s288, aj)
						const be: InitializeRewardAccounts = ld64(s270 + 0x18)
						const bf = ld64(be + 0x28)
						const bg = ld64(ld64(bf + 0x58))
						copyr(sa8, bg, 0x20)
						st32(s128, ld32(bf + 0x54))
						copyr(s148, bf + 0x34, 0x20)
						const bh = ld64(ld64(be + 0x30))
						copyr(s78, bh, 0x20)
						const bi = be.reward_funder.key
						copyr(s48, bi, 0x20)
						st64(sff0 + 0x20, ld64(s270 + 0x10))
						st64(sff0, sa8, s148, s78, s48)
						st64(s1000 + 8, ld64(s270))
						st64(s1000, ld64(s250))
						af = fn_6ad88(s1d0, g, ld64(s270 + 8), ld64(s278), ld64(s1000), ld64(s1000 + 8), sa8, s148, s78, s48, ld64(sff0 + 0x20))
						let bs = ld64(s1d0 + 8)
						g = ld64(s1d0)
						if (g == 2) {
							const bj: InitializeRewardAccounts = ld64(s270 + 0x18)
							const bk = ld64(ld64(bj + 8) + 0x20)
							st64(s250, sa8)
							AccountInfo_clone_f338(sa8, bk)
							const bl = ld64(bj + 0x30)
							st64(s270 + 0x10, s78)
							AccountInfo_clone_f338(s78, bl)
							st64(s270 + 8, fn_16330(ld64(bj + 0x28)))
							const bm = ld64(bj + 0x38)
							st64(s270, s48)
							AccountInfo_clone_f338(s48, bm)
							const bo = AccountInfo_clone_f338(s148, ld64(bj + 0x38))
							st64(sff0 + 8, ld64(s280))
							st64(sff0, s148)
							st64(s1000, ld64(s270 + 8))
							st64(s1000 + 8, s48)
							const bn = ld64(s270 + 0x10)
							const bp = fn_79050(s1e0, bj, ld64(s250), bn, ld64(s1000), s48, s148, ld64(sff0 + 8), bo, bj)
							bs = ld64(s1e0 + 8)
							g = ld64(s1e0)
							const bq = ptr_drop_in_place_fcd8(bn, ptr_drop_in_place_fcd8(ld64(s270), bp))
							af = ptr_drop_in_place_fcd8(ld64(s250), bq)
							if (g == 2) {
								st64(an, ld64(an) + 1)
								const br = ld64(s288)
								st64(br, ld64(br) - 1)
								bc = ld64(s250 + 8)
								st64(bc + 8, an)
								st64(bc, 2)
								return af
							}
						}
						st64(an, ld64(an) + 1)
						aj = ld64(s288)
						st64(aj, ld64(aj) - 1)
						bc = ld64(s250 + 8)
						st64(bc + 8, bs)
						st64(bc, g)
						return af
					}
					st64(s148, 0x10015fe18, 1, 8, 0, 0)
					// fmt "Integer overflow when casting to u64"
					fn_14ec00(s148, 0x10015fe28)
				}
				af = fn_88360(s1c0, 0x26)
				an = ld64(s1c0 + 8)
				g = ld64(s1c0)
				st64(aj, ld64(aj) - 1)
				bc = ld64(s250 + 8)
				st64(bc + 8, an)
				st64(bc, g)
				return af
			}
			st64(aj, ld64(aj) - 1)
			bc = ld64(s250 + 8)
			st64(bc + 8, an)
			st64(bc, g)
			return af
		}
		bc = ld64(s250 + 8)
		st64(bc + 8, an)
		st64(bc, g)
		return af
	}
	fn_85138(sa8, 0x100159868)
	st64(s78, 0, 1, 0)
	st64(s28, s78, 0x10015f818)
	st8(s20 + 0x10, 3)
	st64(s20 + 8, 0x20)
	st64(s38, 0)
	st64(s48, 0)
	if (fn_88558(0x100159868, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(s110, s78, 0x18)
	copy(s128, sa8, 0x18)
	st64(s148 + 8, 0x10015a05a)
	st32(s110 + 0x60, 0x1792 /* error::NotSupportMint */)
	st8(s110 + 0x18, 2)
	st32(s148 + 0x18, 0x6f)
	st64(s148 + 0x10, 0x32)
	st64(s148, 0)
	af = fn_13e5a0(s180, s148)
	g = ld64(s180)
	bc = ld64(s250 + 8)
	st64(bc + 8, ld64(s180 + 8))
	st64(bc, g)
	return af
}

export function fn_67ac0(a: u64, b: u64): u64 {
	const s20 = fp - 0x20
	st64(s20, 0, 0, 0, 0)
	if ((memcmp(b, s20, 0x20) as u32) == 0) {
		return 0
	}
	if ((memcmp(a + 1, b, 0x20) as u32) == 0) {
		return 1
	}
	if ((memcmp(a + 0x21, b, 0x20) as u32) == 0) {
		return 1
	}
	if ((memcmp(a + 0x41, b, 0x20) as u32) == 0) {
		return 1
	}
	if ((memcmp(a + 0x61, b, 0x20) as u32) == 0) {
		return 1
	}
	if ((memcmp(a + 0x81, b, 0x20) as u32) == 0) {
		return 1
	}
	if ((memcmp(a + 0xa1, b, 0x20) as u32) == 0) {
		return 1
	}
	if ((memcmp(a + 0xc1, b, 0x20) as u32) == 0) {
		return 1
	}
	if ((memcmp(a + 0xe1, b, 0x20) as u32) == 0) {
		return 1
	}
	if ((memcmp(a + 0x101, b, 0x20) as u32) == 0) {
		return 1
	}
	return (memcmp(a + 0x121, b, 0x20) as u32) == 0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
export function fn_43fb8(a: u64, b: u64, c: u64, r0: u64): u64 {
	const s10 = fp - 0x10
	let i: u64
	const f = ld64(b + 0x18)
	if (c > f) {
		r0 = fn_88360(s10, 0x1d)
		i = ld64(s10)
		st64(a + 8, ld64(s10 + 8))
		st64(a, i)
		return r0
	}
	const g = ld64(b + 0x10)
	if (c > g) {
		r0 = fn_88360(s10, 0x1d)
		i = ld64(s10)
		st64(a + 8, ld64(s10 + 8))
		st64(a, i)
		return r0
	}
	if (g >= f) {
		r0 = fn_88360(s10, 0x1d)
		i = ld64(s10)
		st64(a + 8, ld64(s10 + 8))
		st64(a, i)
		return r0
	}
	const h = ld64(b) | ld64(b + 8)
	if (h == 0) {
		r0 = fn_88360(s10, 0x1d)
		i = ld64(s10)
		st64(a + 8, ld64(s10 + 8))
		st64(a, i)
		return r0
	}
	if (f - g - 0x76a701 > 0xffffffffff92937e) {
		st64(a + 8, h)
		st64(a, 2)
		return r0
	}
	r0 = fn_88360(s10, 0x1f)
	i = ld64(s10)
	st64(a + 8, ld64(s10 + 8))
	st64(a, i)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value), p7 (points to it), p9 (points to it), p10 (points to it)
export function fn_6ad88(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s188 = fp - 0x188, s231 = fp - 0x231, s2da = fp - 0x2da, s313 = fp - 0x313, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3d0 = fp - 0x3d0, s3d8 = fp - 0x3d8, s3e0 = fp - 0x3e0, s3e8 = fp - 0x3e8, s3f0 = fp - 0x3f0
	let m, n, r, s, t, u, y, ab: u64
	st64(s3b8, d, c)
	st64(s3a8 + 0x10, a)
	memcpy(s313, b + 0x185, 0x1fb)
	st64(s118, 0, 0, 0, 0)
	const f = memcmp(s2da, s118, 0x20)
	st64(s3d0, p6, p5)
	st64(s3a8, p11, p10)
	st64(s3d0 + 0x10, p9)
	st64(s3e0, p8)
	const k = p7
	let i = 0
	if ((f as u32) != 0) {
		st64(s118, 0, 0, 0, 0)
		const g = memcmp(s231, s118, 0x20)
		i = 1
		if ((g as u32) != 0) {
			st64(s118, 0, 0, 0, 0)
			const h = memcmp(s188, s118, 0x20)
			i = 2
			if ((h as u32) != 0) {
				u = fn_88360(s328, 0x1a)
				t = ld64(s328)
				r = ld64(s3a8 + 0x10)
				st64(r + 8, ld64(s328 + 8))
				st64(r, t)
				return u
			}
		}
	}
	st64(s3d8, i)
	const j = ld64(0x300000000 /* heap bump-allocator cursor */)
	st64(s3a8 + 0x18, k)
	const l = j != 0 ? sat_sub(j, 0x60) : 0x300007fa0
	if (l > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, l)
		st64(l + 0x18, ld64(b + 0x1d6))
		st64(l + 0x10, ld64(b + 0x1ce))
		st64(l + 8, ld64(b + 0x1c6))
		st64(l, ld64(b + 0x1be))
		copy(l + 0x20, b + 0x267, 0x20)
		copy(l + 0x40, b + 0x310, 0x20)
		const o = ld64(s3a8 + 0x18)
		if ((memcmp(l, o, 0x20) as u32) != 0) {
			st64(s3e8, l + 0x20)
			if ((memcmp(l + 0x20, o, 0x20) as u32) != 0) {
				st64(s3f0, l + 0x40)
				if ((memcmp(l + 0x40, o, 0x20) as u32) != 0) {
					const p = ld64(0x300000000 /* heap bump-allocator cursor */)
					const q = p != 0 ? sat_sub(p, 0xc80) : 0x300007380
					if (q > 0x300000007) {
						B35: {
							st64(0x300000000 /* heap bump-allocator cursor */, q)
							memcpy(q, ld64(s3a8) + 0x141, 0xc80)
							const v = ld64(s3d8)
							if (v == 0) {
								const z = memcmp(ld64(s3a8 + 0x18), b + 0x41, 0x20)
								if ((z as u32) != 0 && (memcmp(ld64(s3a8 + 0x18), b + 0x61, 0x20) as u32) != 0) {
									let aa = 0
									do {
										if (aa == 0xc80) {
											if ((ld32(ld64(s3e0)) & 1) == 0) {
												break
											}
											fn_85138(s78, 0x100159864)
											st64(s60, 0, 1, 0)
											st64(s28, s60, 0x10015f818)
											st8(s28 + 0x18, 3)
											st64(s28 + 0x10, 0x20)
											st64(s48 + 0x10, 0)
											st64(s48, 0)
											if (fn_88558(0x100159864, s48) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copy(sf8, s78, 0x30)
											st64(s118 + 8, 0x10015a741)
											st32(sf8 + 0x78, 0x178c /* error::ExceptRewardMint */)
											st8(sf8 + 0x30, 2)
											st32(s118 + 0x18, 0x11e)
											st64(s118 + 0x10, 0x1f)
											st64(s118, 0)
											u = fn_13e5a0(s368, s118)
											t = ld64(s368)
											r = ld64(s3a8 + 0x10)
											st64(r + 8, ld64(s368 + 8))
											st64(r, t)
											return u
										}
										ab = memcmp(q + aa, ld64(s3a8 + 0x18), 0x20)
										aa = aa + 0x20
									} while ((ab as u32) != 0)
								}
							} else if (v == 1) {
								st64(s3a8, q)
								if ((memcmp(l, b + 0x41, 0x20) as u32) != 0 && ((memcmp(ld64(s3e8), b + 0x41, 0x20) as u32) != 0 && ((memcmp(ld64(s3f0), b + 0x41, 0x20) as u32) != 0 && ((memcmp(l, b + 0x61, 0x20) as u32) != 0 && ((memcmp(ld64(s3e8), b + 0x61, 0x20) as u32) != 0 && (memcmp(ld64(s3f0), b + 0x61, 0x20) as u32) != 0))))) {
									const aj = memcmp(ld64(s3a8 + 0x18), b + 0x41, 0x20)
									if ((aj as u32) == 0) {
										break B35
									}
									if ((memcmp(ld64(s3a8 + 0x18), b + 0x61, 0x20) as u32) == 0) {
										break B35
									}
									let ak = 0
									while (true) {
										if (ak == 0xc80) {
											fn_85138(s78, 0x100159864)
											st64(s60, 0, 1, 0)
											st64(s28, s60, 0x10015f818)
											st8(s28 + 0x18, 3)
											st64(s28 + 0x10, 0x20)
											st64(s48 + 0x10, 0)
											st64(s48, 0)
											if (fn_88558(0x100159864, s48) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copy(sf8, s78, 0x30)
											st64(s118 + 8, 0x10015a741)
											st32(sf8 + 0x78, 0x178c /* error::ExceptRewardMint */)
											st8(sf8 + 0x30, 2)
											st32(s118 + 0x18, 0x12a)
											st64(s118 + 0x10, 0x1f)
											st64(s118, 0)
											u = fn_13e5a0(s348, s118)
											t = ld64(s348)
											r = ld64(s3a8 + 0x10)
											st64(r + 8, ld64(s348 + 8))
											st64(r, t)
											return u
										}
										const al = memcmp(ld64(s3a8) + ak, ld64(s3a8 + 0x18), 0x20)
										ak = ak + 0x20
										if ((al as u32) == 0) {
											break B35
										}
									}
								}
								const w = memcmp(ld64(s3a8 + 0x18), b + 0x41, 0x20)
								if ((w as u32) != 0 && (memcmp(ld64(s3a8 + 0x18), b + 0x61, 0x20) as u32) != 0) {
									let x = 0
									do {
										if (x == 0xc80) {
											if (ld32(ld64(s3e0)) != 1) {
												break
											}
											fn_85138(s78, 0x100159864)
											st64(s60, 0, 1, 0)
											st64(s28, s60, 0x10015f818)
											st8(s28 + 0x18, 3)
											st64(s28 + 0x10, 0x20)
											st64(s48 + 0x10, 0)
											st64(s48, 0)
											if (fn_88558(0x100159864, s48) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copy(sf8, s78, 0x30)
											st64(s118 + 8, 0x10015a741)
											st32(sf8 + 0x78, 0x178c /* error::ExceptRewardMint */)
											st8(sf8 + 0x30, 2)
											st32(s118 + 0x18, 0x137)
											st64(s118 + 0x10, 0x1f)
											st64(s118, 0)
											u = fn_13e5a0(s358, s118)
											t = ld64(s358)
											r = ld64(s3a8 + 0x10)
											st64(r + 8, ld64(s358 + 8))
											st64(r, t)
											return u
										}
										y = memcmp(ld64(s3a8) + x, ld64(s3a8 + 0x18), 0x20)
										x = x + 0x20
									} while ((y as u32) != 0)
								}
							} else if ((memcmp(ld64(s3a8 + 8), 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) != 0 && fn_67ac0(ld64(s3a8), ld64(s3a8 + 8)) == 0) {
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
								st64(s118 + 8, 0x10015a741)
								st32(sf8 + 0x78, 0x1770 /* error::NotApproved */)
								st8(sf8 + 0x30, 2)
								st32(s118 + 0x18, 0x13f)
								st64(s118 + 0x10, 0x1f)
								st64(s118, 0)
								u = fn_13e5a0(s338, s118)
								t = ld64(s338)
								r = ld64(s3a8 + 0x10)
								st64(r + 8, ld64(s338 + 8))
								st64(r, t)
								return u
							}
						}
						const ac = b + 0x185 + ld64(s3d8) * 0xa9
						st64(ac + 0x21, ld64(s3d0))
						st64(ac + 0x19, ld64(s3d0 + 8))
						st64(ac + 9, ld64(s3b8))
						const ad = ld64(s3b8 + 8)
						st64(ac + 1, ad)
						st64(ac + 0x11, ad)
						const ae = ld64(s3a8 + 0x18)
						st64(ac + 0x51, ld64(ae + 0x18))
						st64(ac + 0x49, ld64(ae + 0x10))
						st64(ac + 0x41, ld64(ae + 8))
						st64(ac + 0x39, ld64(ae))
						const af = ld64(s3d0 + 0x10)
						copy(ac + 0x59, af, 0x20)
						const ag = ld64(s3a8 + 8)
						copy(ac + 0x79, ag, 0x20)
						u = clock_get(s118)
						if (ld64(s118) != 0) {
							const ai = ld64(s118 + 8)
							const ah = ld64(s118 + 0x10)
							st64(s118 + 0x10, ld64(s118 + 0x18))
							st64(s118, ai, ah)
							u = fn_13e628(s378, s118)
							s = ld64(s378 + 8)
							t = ld64(s378)
							r = ld64(s3a8 + 0x10)
							if (t == 2) {
								st64(b + 0x438, s)
								st64(r + 8, s)
								st64(r, 2)
								return u
							}
							st64(r + 8, s)
							st64(r, t)
							return u
						}
						s = ld64(s118 + 0x18)
						r = ld64(s3a8 + 0x10)
						st64(b + 0x438, s)
						st64(r + 8, s)
						st64(r, 2)
						return u
					}
					raw_vec_handle_error(1, 0xc80, 0x10015f8f8, 0xc80 > p)
				}
			}
		}
		fn_85138(s78, 0x1001598f4)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_88558(0x1001598f4, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(sf8, s78, 0x30)
		st64(s118 + 8, 0x10015a741)
		st32(sf8 + 0x78, 0x178b /* error::RewardTokenAlreadyInUse */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x111)
		st64(s118 + 0x10, 0x1f)
		st64(s118, 0)
		u = fn_13e5a0(s388, s118)
		t = ld64(s388)
		r = ld64(s3a8 + 0x10)
		st64(r + 8, ld64(s388 + 8))
		st64(r, t)
		return u
	}
	raw_vec_handle_error(1, 0x60, 0x100160148, m, n)
}

export function fn_becb0(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38
	let h, j, k, l: u64
	const f = ld64(b + 8)
	const g = ld64(f + 0x20)
	if ((memcmp(f, c, 0x20) as u32) == 0 && (common_is_closed(g) == 0 && ld64(ld64(g + 0x10) + 0x10) != 0)) {
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		l = fn_13e628(s28, s18)
		h = ld64(s28)
		if (h != 2) {
			const m = ld64(0x300000000 /* heap bump-allocator cursor */)
			j = m != 0 ? sat_sub(m, 0x14) : 0x300007fec
			k = ld64(s28 + 8)
			if ((h & 1) != 0) {
				if (0x300000008 > j) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > m)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x6363615f6e656b6f)
				st64(j, 0x745f7265646e7566)
				st32(j + 0x10, 0x746e756f)
				void ld64(k)
			} else {
				if (0x300000008 > j) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > m)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x6363615f6e656b6f)
				st64(j, 0x745f7265646e7566)
				st32(j + 0x10, 0x746e756f)
				void ld64(k)
			}
			st64(k + 8, 0x14)
			st64(k, 1)
			st64(k + 0x18, 0x14)
			st64(k + 0x10, j)
			st64(a + 8, k)
			st64(a, h)
			return l
		}
	}
	l = fn_a80(s38, ld64(b + 0x18), c)
	k = undef
	h = ld64(s38)
	if (h == 2) {
		st64(a + 8, k)
		st64(a, 2)
		return l
	}
	const i = ld64(0x300000000 /* heap bump-allocator cursor */)
	j = i != 0 ? sat_sub(i, 0xa) : 0x300007ff6
	k = ld64(s38 + 8)
	if ((h & 1) != 0) {
		if (0x300000008 > j) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > i)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st64(j, 0x6174735f6c6f6f70)
		st16(j + 8, 0x6574)
		void ld64(k)
	} else {
		if (0x300000008 > j) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > i)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st64(j, 0x6174735f6c6f6f70)
		st16(j + 8, 0x6574)
		void ld64(k)
	}
	st64(k + 8, 0xa)
	st64(k, 1)
	st64(k + 0x18, 0xa)
	st64(k + 0x10, j)
	st64(a + 8, k)
	st64(a, h)
	return l
}
