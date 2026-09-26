/// <reference path="../lib.d.ts" />
// instruction swap
import { anchor_error_from, fn_1008, fn_10fd98, fn_13e5a0, fn_13e628, fn_147a98, fn_14b50, fn_14ed60, fn_2be8, fn_374d0, fn_4130, fn_4bd8, fn_4dc0, fn_4fa8, fn_51c8, fn_53e8, fn_69b78, fn_76320, fn_79050, fn_7a038, fn_84be0, fn_85138, fn_88360, fn_88558, fn_8a8, fn_a80, fn_f680, log_data, memcpy } from '../shared.ts'

// instruction handler: swap (discriminator sha256("global:swap")[..8] = 0xc88775e1919ec6f8)
// accounts [idl]: 0 payer [signer], 1 amm_config, 2 pool_state [mut], 3 input_token_account [mut], 4 output_token_account [mut], 5 input_vault [mut], 6 output_vault [mut], 7 observation_state [mut], 8 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 9 tick_array [mut]
// args [idl]: amount: u64, other_amount_threshold: u64, sqrt_price_limit_x64: u128, is_base_input: bool
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, amount, other_amount_threshold, is_base_input
export function ix_swap(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s10 = fp - 0x10, s11 = fp - 0x11, s50 = fp - 0x50, s58 = fp - 0x58, s68 = fp - 0x68, sa0 = fp - 0xa0, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, s1000 = fp - 0x1000
	let l, o, p, q, r, s: u64
	const u = sol_log("Instruction: Swap", 0x11)
	const f = ix_args_len
	if (f >= 8 && ((f & -8) != 8 && ((f & -0x10) != 0x10 && f != 0x20))) {
		const args: SwapArgs = ix_args
		const amount = args.amount
		const other_amount_threshold = args.other_amount_threshold
		const k = ld64(args.sqrt_price_limit_x64 + 8)
		const j = ld64(args.sqrt_price_limit_x64)
		const is_base_input = args.is_base_input
		st8(s11, is_base_input)
		if (2 > is_base_input) {
			st64(s10, accounts, accounts_len)
			s = accounts_swap(s68, amount, s10, j, fp, u)
			const v = ld64(s68)
			if (v == 0) {
				r = ld64(s68 + 8)
				st64(a + 8, ld64(s58))
				st64(a, r)
				return s
			}
			const x = ld64(s68 + 8)
			const w = ld64(s58)
			memcpy(sa0, s50, 0x38)
			st64(sb8, v, x, w)
			copyr(s58, s10, 0x10)
			st64(s68, program_id, sb8)
			st64(s1000, j, k, is_base_input & 1)
			s = fn_3d6c0(sc8, s68, amount, other_amount_threshold, j, k, is_base_input & 1)
			r = ld64(sc8)
			if (r == 2) {
				s = fn_b7700(sd8, sb8, program_id)
				r = ld64(sd8)
				st64(a + 8, ld64(sd8 + 8))
				st64(a, r)
				return s
			}
			st64(a + 8, ld64(sc8 + 8))
			st64(a, r)
			return s
		}
		st64(s68, 0x10015f910)
		st64(s58, s10)
		st64(s10, s11, fn_154c88)
		st64(s50 + 8, 0)
		st64(s68 + 8, 1)
		st64(s50, 1)
		// fmt "Invalid bool representation: {}" {} = is_base_input [fn_154c88]
		fn_14de10(sb8, s68, other_amount_threshold, j, k)
		l = fn_f128(sb8)
	} else {
		l = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	}
	const m = l
	if (2 > (l & 3) - 2) {
		s = anchor_error_from(se8, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		r = ld64(se8)
		st64(a + 8, ld64(se8 + 8))
		st64(a, r)
		return s
	}
	if ((m & 3) == 0) {
		s = anchor_error_from(se8, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		r = ld64(se8)
		st64(a + 8, ld64(se8 + 8))
		st64(a, r)
		return s
	}
	const n = ld64(ld64(l + 7))
	if (n == 0) {
		s = anchor_error_from(se8, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		r = ld64(se8)
		st64(a + 8, ld64(se8 + 8))
		st64(a, r)
		return s
	}
	callx(n, ld64(l - 1), n)
	s = anchor_error_from(se8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	r = ld64(se8)
	st64(a + 8, ld64(se8 + 8))
	st64(a, r)
	return s
}

// Anchor Accounts::try_accounts of instruction swap (called by ix_swap; name [str]: from the handler's "Instruction: …" log; was fn_b5938)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: input_vault (ConstraintMut), output_vault (ConstraintMut), observation_state (ConstraintMut, ConstraintAddress), token_program, tick_array (ConstraintRaw, ConstraintMut), output_token_account (ConstraintMut), input_token_account (ConstraintMut), pool_state (ConstraintMut), amm_config (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: output_vault_box, output_vault_box_2, tick_array [idl]
export function accounts_swap(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const sb8 = fp - 0xb8, sd8 = fp - 0xd8, sf8 = fp - 0xf8, s118 = fp - 0x118, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s320 = fp - 0x320, s328 = fp - 0x328, s330 = fp - 0x330, s338 = fp - 0x338, s340 = fp - 0x340, s348 = fp - 0x348, s350 = fp - 0x350, s358 = fp - 0x358
	let ad, ae, af, ah, ai, ak, al, an, ao, at: u64
	let output_vault_box: TokenAccount_2
	let l = try_accounts_17a30(sb8, c, c, d, e, r0)
	const i = ld64(sb8 + 8)
	let f = ld64(sb8)
	if (f == 2) {
		l = try_accounts_184d8(sb8, c)
		let t = undef
		if (ld64(sb8) == 0) {
			const o = ld64(0x300000000 /* heap bump-allocator cursor */)
			f = ld64(sb8 + 8)
			const p = o != 0 ? sat_sub(o, 0xa) : 0x300007ff6
			output_vault_box = ld64(sb8 + 0x10)
			if (f != 0) {
				if (0x300000008 > p) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, t)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, p)
				st64(p, 0x666e6f635f6d6d61)
				st16(p + 8, 0x6769)
				void output_vault_box.info
			} else {
				if (0x300000008 > p) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, t)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, p)
				st64(p, 0x666e6f635f6d6d61)
				st16(p + 8, 0x6769)
				void output_vault_box.info
			}
			st64(output_vault_box.mint + 8, p, 0xa)
			st64(output_vault_box.mint, 0xa)
			st64(output_vault_box, 1)
			st64(a + 0x10, output_vault_box)
			st64(a + 8, f)
			st64(a, 0)
			return l
		}
		const j = ld64(0x300000000 /* heap bump-allocator cursor */)
		const k = j != 0 ? sat_sub(j, 0x78) : 0x300007f88
		if (0x300000008 > k) {
			alloc_handle_alloc_error(8, 0x78)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, k & -8)
		if ((k & -8) != 0) {
			memcpy(k & -8, sb8, 0x78)
			fn_11e0(sb8, c)
			l = ld64(sb8 + 8)
			f = ld64(sb8)
			if (f == 2) {
				st64(s320, l)
				l = try_accounts_182b0(sb8, c)
				if (ld32(sb8 + 0x90) == 2) {
					const v = ld64(0x300000000 /* heap bump-allocator cursor */)
					f = ld64(sb8)
					const w = v != 0 ? sat_sub(v, 0x13) : 0x300007fed
					output_vault_box = ld64(sb8 + 8)
					if (f != 0) {
						if (0x300000008 > w) {
							raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, w)
						st64(w + 8, 0x6f6363615f6e656b)
						st64(w, 0x6f745f7475706e69)
						st32(w + 0xf, 0x746e756f)
						void output_vault_box.info
					} else {
						if (0x300000008 > w) {
							raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, w)
						st64(w + 8, 0x6f6363615f6e656b)
						st64(w, 0x6f745f7475706e69)
						st32(w + 0xf, 0x746e756f)
						void output_vault_box.info
					}
					st64(output_vault_box.mint + 8, w, 0x13)
					st64(output_vault_box.mint, 0x13)
					st64(output_vault_box, 1)
					st64(a + 0x10, output_vault_box)
					st64(a + 8, f)
					st64(a, 0)
					return l
				}
				const m = ld64(0x300000000 /* heap bump-allocator cursor */)
				const n = m != 0 ? sat_sub(m, 0xb8) : 0x300007f48
				if (0x300000008 > n) {
					alloc_handle_alloc_error(8, 0xb8)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n & -8)
				if ((n & -8) != 0) {
					st64(s328, n & -8)
					memcpy(n & -8, sb8, 0xb8)
					l = try_accounts_182b0(sb8, c)
					if (ld32(sb8 + 0x90) == 2) {
						const z = ld64(0x300000000 /* heap bump-allocator cursor */)
						f = ld64(sb8)
						const aa = z != 0 ? sat_sub(z, 0x14) : 0x300007fec
						output_vault_box = ld64(sb8 + 8)
						if (f != 0) {
							if (0x300000008 > aa) {
								raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, aa)
							st64(aa + 8, 0x6363615f6e656b6f)
							st64(aa, 0x745f74757074756f)
							st32(aa + 0x10, 0x746e756f)
							void output_vault_box.info
						} else {
							if (0x300000008 > aa) {
								raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, aa)
							st64(aa + 8, 0x6363615f6e656b6f)
							st64(aa, 0x745f74757074756f)
							st32(aa + 0x10, 0x746e756f)
							void output_vault_box.info
						}
						st64(output_vault_box.mint + 8, aa, 0x14)
						st64(output_vault_box.mint, 0x14)
						st64(output_vault_box, 1)
						st64(a + 0x10, output_vault_box)
						st64(a + 8, f)
						st64(a, 0)
						return l
					}
					const x = ld64(0x300000000 /* heap bump-allocator cursor */)
					const y = x != 0 ? sat_sub(x, 0xb8) : 0x300007f48
					if (0x300000008 > y) {
						alloc_handle_alloc_error(8, 0xb8)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, y & -8)
					if ((y & -8) != 0) {
						st64(s338, y & -8)
						memcpy(y & -8, sb8, 0xb8)
						try_accounts_182b0(sb8, c)
						if (ld32(sb8 + 0x90) == 2) {
							l = fn_4130(s148, ld64(sb8), ld64(sb8 + 8), 0x10015b11e /* "input_vault" */, 0xb)
							st64(s330, ld64(s148 + 8))
							f = ld64(s148)
							if (f != 2) {
								st64(a + 0x10, ld64(s330))
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
						} else {
							const ab = ld64(0x300000000 /* heap bump-allocator cursor */)
							const ac = ab != 0 ? sat_sub(ab, 0xb8) : 0x300007f48
							if (0x300000008 > ac) {
								alloc_handle_alloc_error(8, 0xb8)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, ac & -8)
							if ((ac & -8) == 0) {
								alloc_handle_alloc_error(8, 0xb8)
							}
							st64(s330, ac & -8)
							memcpy(ac & -8, sb8, 0xb8)
						}
						fn_7600(sb8, c, ad, ae, af)
						output_vault_box = ld64(sb8 + 8)
						const ag = ld64(sb8)
						if (ag != 2) {
							l = fn_4130(s158, ag, output_vault_box, "output_vault", 0xc)
							output_vault_box = ld64(s158 + 8)
							f = ld64(s158)
							if (f != 2) {
								st64(a + 0x10, output_vault_box)
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
						}
						st64(s340, output_vault_box)
						fn_14c8(sb8, c, output_vault_box, ah, ai)
						output_vault_box = ld64(sb8 + 8)
						const aj = ld64(sb8)
						if (aj != 2) {
							l = fn_4130(s168, aj, output_vault_box, "observation_state", 0x11)
							output_vault_box = ld64(s168 + 8)
							f = ld64(s168)
							if (f != 2) {
								st64(a + 0x10, output_vault_box)
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
						}
						st64(s348, output_vault_box)
						try_accounts_19190(sb8, c, output_vault_box, ak, al)
						output_vault_box = ld64(sb8 + 8)
						const am = ld64(sb8)
						if (am != 2) {
							l = fn_4130(s178, am, output_vault_box, 0x10015b020 /* "token_program" */, 0xd)
							output_vault_box = ld64(s178 + 8)
							f = ld64(s178)
							if (f != 2) {
								st64(a + 0x10, output_vault_box)
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
						}
						st64(s350, output_vault_box)
						l = fn_13d0(sb8, c, output_vault_box, an, ao)
						let tick_array: AccountInfo = ld64(sb8 + 8)
						const ap = ld64(sb8)
						if (ap != 2) {
							l = fn_4130(s188, ap, tick_array, 0x10015a23e /* "tick_array" */, 0xa)
							tick_array = ld64(s188 + 8)
							f = ld64(s188)
							at = ld64(s320)
							if (f != 2) {
								st64(a + 0x10, tick_array)
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
						} else {
							at = ld64(s320)
						}
						const ar = ld64(ld64(k & -8))
						copyr(s138, ar, 0x20)
						l = fn_4dc0(sb8, at, l)
						let au = ld64(sb8 + 0x10)
						let av = ld64(sb8 + 8)
						if (ld64(sb8) != 0) {
							st64(a + 0x10, au)
							st64(a + 8, av)
							st64(a, 0)
							return l
						}
						copyr(s118, av + 1, 0x20)
						st64(au, ld64(au) - 1)
						if ((memcmp(s138, s118, 0x20) as u32) == 0) {
							if (ld8(ld64(s320) + 0x29 /* is_writable */) != 0) {
								const az = ld64(s328)
								if (ld8(ld64(az) + 0x29) != 0) {
									const ba = ld64(i)
									copyr(sb8, ba, 0x20)
									if ((memcmp(az + 0x28, sb8, 0x20) as u32) != 0) {
										l = anchor_error_from(s208, 0x7df /* anchor::ConstraintTokenOwner */)
										f = ld64(s208)
										st64(a + 0x10, ld64(s208 + 8))
										st64(a + 8, f)
										st64(a, 0)
										return l
									}
									const bb = ld64(s330)
									copyr(sb8, bb + 8, 0x20)
									if ((memcmp(ld64(s328) + 8, sb8, 0x20) as u32) == 0) {
										if (ld8(ld64(ld64(s338)) + 0x29) != 0) {
											const output_vault_box_2: TokenAccount_2 = ld64(s340)
											copyr(sb8, output_vault_box_2.mint, 0x20)
											const bd = memcmp(ld64(s338) + 8, sb8, 0x20)
											if ((bd as u32) != 0) {
												l = anchor_error_from(s248, 0x7de /* anchor::ConstraintTokenMint */)
												f = ld64(s248)
												st64(a + 0x10, ld64(s248 + 8))
												st64(a + 8, f)
												st64(a, 0)
												return l
											}
											if (ld8(ld64(ld64(s330)) + 0x29) != 0) {
												if (ld8(ld64(ld64(s340)) + 0x29) != 0) {
													if (ld8(ld64(s348) + 0x29 /* is_writable */) != 0) {
														const be = ld64(ld64(s348) /* key */)
														copyr(sf8, be, 0x20)
														l = fn_4dc0(sb8, ld64(s320), bd as u32)
														au = ld64(sb8 + 0x10)
														av = ld64(sb8 + 8)
														if (ld64(sb8) != 0) {
															st64(a + 0x10, au)
															st64(a + 8, av)
															st64(a, 0)
															return l
														}
														copyr(sd8, av + 0xc1, 0x20)
														st64(au, ld64(au) - 1)
														const bf = memcmp(sf8, sd8, 0x20)
														if ((bf as u32) == 0) {
															if (tick_array.is_writable != 0) {
																l = fn_4bd8(sb8, tick_array, bf as u32)
																st64(s358, ld64(sb8 + 0x10))
																f = ld64(sb8 + 8)
																if (ld64(sb8) != 0) {
																	st64(a + 0x10, ld64(s358))
																	st64(a + 8, f)
																	st64(a, 0)
																	return l
																}
																const bj = ld64(ld64(s320) /* key */)
																copyr(sb8, bj, 0x20)
																const bl = memcmp(f, sb8, 0x20)
																const bk = ld64(s358)
																st64(bk, ld64(bk) - 1)
																l = bl as u32
																if (l == 0) {
																	st64(a + 0x48, tick_array)
																	st64(a + 0x40, ld64(s350))
																	st64(a + 0x38, ld64(s348))
																	st64(a + 0x30, ld64(s340))
																	st64(a + 0x28, ld64(s330))
																	st64(a + 0x20, ld64(s338))
																	st64(a + 0x18, ld64(s328))
																	st64(a + 0x10, ld64(s320))
																	st64(a + 8, k & -8)
																	st64(a, i)
																	return l
																}
																anchor_error_from(s308, 0x7d3 /* anchor::ConstraintRaw */)
																l = fn_4130(s318, ld64(s308), ld64(s308 + 8), 0x10015a23e /* "tick_array" */, 0xa)
																f = ld64(s318)
																st64(a + 0x10, ld64(s318 + 8))
																st64(a + 8, f)
																st64(a, 0)
																return l
															}
															anchor_error_from(s2e8, 0x7d0 /* anchor::ConstraintMut */)
															l = fn_4130(s2f8, ld64(s2e8), ld64(s2e8 + 8), 0x10015a23e /* "tick_array" */, 0xa)
															f = ld64(s2f8)
															st64(a + 0x10, ld64(s2f8 + 8))
															st64(a + 8, f)
															st64(a, 0)
															return l
														}
														anchor_error_from(s2b8, 0x7dc /* anchor::ConstraintAddress */)
														const bi = fn_4130(s2c8, ld64(s2b8), ld64(s2b8 + 8), "observation_state", 0x11)
														const bh = ld64(s2c8 + 8)
														const bg = ld64(s2c8)
														copy(sb8, sf8, 0x40)
														l = Error_with_pubkeys(s2d8, bg, bh, sb8, bi)
														f = ld64(s2d8)
														st64(a + 0x10, ld64(s2d8 + 8))
														st64(a + 8, f)
														st64(a, 0)
														return l
													}
													anchor_error_from(s298, 0x7d0 /* anchor::ConstraintMut */)
													l = fn_4130(s2a8, ld64(s298), ld64(s298 + 8), "observation_state", 0x11)
													f = ld64(s2a8)
													st64(a + 0x10, ld64(s2a8 + 8))
													st64(a + 8, f)
													st64(a, 0)
													return l
												}
												anchor_error_from(s278, 0x7d0 /* anchor::ConstraintMut */)
												l = fn_4130(s288, ld64(s278), ld64(s278 + 8), "output_vault", 0xc)
												f = ld64(s288)
												st64(a + 0x10, ld64(s288 + 8))
												st64(a + 8, f)
												st64(a, 0)
												return l
											}
											anchor_error_from(s258, 0x7d0 /* anchor::ConstraintMut */)
											l = fn_4130(s268, ld64(s258), ld64(s258 + 8), 0x10015b11e /* "input_vault" */, 0xb)
											f = ld64(s268)
											st64(a + 0x10, ld64(s268 + 8))
											st64(a + 8, f)
											st64(a, 0)
											return l
										}
										anchor_error_from(s228, 0x7d0 /* anchor::ConstraintMut */)
										l = fn_4130(s238, ld64(s228), ld64(s228 + 8), "output_token_account", 0x14)
										f = ld64(s238)
										st64(a + 0x10, ld64(s238 + 8))
										st64(a + 8, f)
										st64(a, 0)
										return l
									}
									l = anchor_error_from(s218, 0x7de /* anchor::ConstraintTokenMint */)
									f = ld64(s218)
									st64(a + 0x10, ld64(s218 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return l
								}
								anchor_error_from(s1e8, 0x7d0 /* anchor::ConstraintMut */, az)
								l = fn_4130(s1f8, ld64(s1e8), ld64(s1e8 + 8), "input_token_account", 0x13)
								f = ld64(s1f8)
								st64(a + 0x10, ld64(s1f8 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
							anchor_error_from(s1c8, 0x7d0 /* anchor::ConstraintMut */)
							l = fn_4130(s1d8, ld64(s1c8), ld64(s1c8 + 8), "pool_state", 0xa)
							f = ld64(s1d8)
							st64(a + 0x10, ld64(s1d8 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return l
						}
						anchor_error_from(s198, 0x7dc /* anchor::ConstraintAddress */)
						const ay = fn_4130(s1a8, ld64(s198), ld64(s198 + 8), 0x10015af4d /* "amm_config" */, 0xa)
						const ax = ld64(s1a8 + 8)
						const aw = ld64(s1a8)
						copy(sb8, s138, 0x40)
						l = Error_with_pubkeys(s1b8, aw, ax, sb8, ay)
						f = ld64(s1b8)
						st64(a + 0x10, ld64(s1b8 + 8))
						st64(a + 8, f)
						st64(a, 0)
						return l
					}
					alloc_handle_alloc_error(8, 0xb8)
				}
				alloc_handle_alloc_error(8, 0xb8)
			}
			const s = ld64(0x300000000 /* heap bump-allocator cursor */)
			t = 0xa > s
			const q = t != 0 ? 0 : s - 0xa
			const u = s != 0 ? q : 0x300007ff6
			if ((f & 1) != 0) {
				if (0x300000008 > u) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, q, t)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, u)
				st64(u, 0x6174735f6c6f6f70)
				st16(u + 8, 0x6574)
				void ld64(l)
			} else {
				if (0x300000008 > u) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, q, t)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, u)
				st64(u, 0x6174735f6c6f6f70)
				st16(u + 8, 0x6574)
				void ld64(l)
			}
			st64(l + 0x10, u, 0xa)
			st64(l + 8, 0xa)
			st64(l, 1)
			st64(a + 0x10, l)
			st64(a + 8, f)
			st64(a, 0)
			return l
		}
		alloc_handle_alloc_error(8, 0x78)
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 5) : 0x300007ffb
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(g, 5), 5 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 4, 0x72)
		st32(h, 0x65796170)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(g, 5), 5 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 4, 0x72)
		st32(h, 0x65796170)
		void ld64(i)
	}
	st64(i + 0x10, h, 5)
	st64(i + 8, 5)
	st64(i, 1)
	st64(a + 0x10, i)
	st64(a + 8, f)
	st64(a, 0)
	return l
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value), p7 (value)
// types [heur]: b: SwapContext (the handler ix_swap passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_3d6c0(a: u64, b: SwapContext, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, se8 = fp - 0xe8, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0xb8) & -8 : 0x300007f48
	if (g > 0x300000007) {
		const y = p6
		const z = p5
		const aa = p7
		const accounts: SwapAccounts = b.accounts
		const x = ld64(accounts)
		const i = ld64(accounts + 0x18)
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		st64(g, ld64(i))
		memcpy(g + 8, i + 8, 0xb0)
		const j = ld64(0x300000000 /* heap bump-allocator cursor */)
		const k = j != 0 ? sat_sub(j, 0xb8) & -8 : 0x300007f48
		if (k > 0x300000007) {
			const l = ld64(accounts + 0x20)
			st64(0x300000000 /* heap bump-allocator cursor */, k)
			st64(k, ld64(l))
			memcpy(k + 8, l + 8, 0xb0)
			const m = ld64(0x300000000 /* heap bump-allocator cursor */)
			const n = m != 0 ? sat_sub(m, 0xb8) & -8 : 0x300007f48
			if (n > 0x300000007) {
				const o = ld64(accounts + 0x28)
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n, ld64(o))
				memcpy(n + 8, o + 8, 0xb0)
				const p = ld64(0x300000000 /* heap bump-allocator cursor */)
				const q = p != 0 ? sat_sub(p, 0xb8) & -8 : 0x300007f48
				if (q > 0x300000007) {
					const output_vault: TokenAccount_2 = accounts.output_vault
					st64(0x300000000 /* heap bump-allocator cursor */, q)
					st64(q, output_vault.info)
					memcpy(q + 8, output_vault.mint, 0xb0)
					st64(sf8 + 8, ld64(accounts + 0x40))
					st64(s118, x, g, k, n, q)
					st64(se8, accounts + 8, accounts + 0x10, accounts + 0x48, accounts + 0x38)
					const remaining_accounts: AccountInfo = b.remaining_accounts
					const t = b.remaining_accounts_len
					let w = fn_3aa80(s48, s118, remaining_accounts, t, c, z, y, aa)
					let u = ld64(s48)
					if (u != 2) {
						st64(a + 8, ld64(s48 + 8))
						st64(a, u)
						return w
					}
					const v = ld64(s48 + 8)
					if (aa != 0) {
						if (d > v) {
							fn_85138(s78, 0x100159894)
							st64(s60, 0, 1, 0)
							st64(s28, s60, 0x10015f818)
							st8(s28 + 0x18, 3)
							st64(s28 + 0x10, 0x20)
							st64(s48 + 0x10, 0)
							st64(s48, 0)
							if (fn_88558(0x100159894, s48) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
							}
							copy(sf8, s78, 0x30)
							st64(s118 + 8, 0x100159f83)
							st32(se8 + 0x68, 0x1782 /* error::TooLittleOutputReceived */)
							st8(se8 + 0x20, 2)
							st32(s118 + 0x18, 0x41e)
							st64(s118 + 0x10, 0x25)
							st64(s118, 0)
							w = fn_13e5a0(s138, s118)
							u = ld64(s138)
							st64(a + 8, ld64(s138 + 8))
							st64(a, u)
							return w
						}
						st64(a + 8, undef)
						st64(a, 2)
						return w
					}
					if (v > d) {
						fn_85138(s78, 0x10015988c)
						st64(s60, 0, 1, 0)
						st64(s28, s60, 0x10015f818)
						st8(s28 + 0x18, 3)
						st64(s28 + 0x10, 0x20)
						st64(s48 + 0x10, 0)
						st64(s48, 0)
						if (fn_88558(0x10015988c, s48) != 0) {
							fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
						}
						copy(sf8, s78, 0x30)
						st64(s118 + 8, 0x100159f83)
						st32(se8 + 0x68, 0x1783 /* error::TooMuchInputPaid */)
						st8(se8 + 0x20, 2)
						st32(s118 + 0x18, 0x423)
						st64(s118 + 0x10, 0x25)
						st64(s118, 0)
						w = fn_13e5a0(s128, s118)
						u = ld64(s128)
						st64(a + 8, ld64(s128 + 8))
						st64(a, u)
						return w
					}
					st64(a + 8, undef)
					st64(a, 2)
					return w
				}
				alloc_handle_alloc_error(8, 0xb8)
			}
			alloc_handle_alloc_error(8, 0xb8)
		}
		alloc_handle_alloc_error(8, 0xb8)
	}
	alloc_handle_alloc_error(8, 0xb8)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: p5 (value), p6 (value), p7 (value), p8 (value)
// types [heur]: c: AccountInfo (every call passes one: fn_3d6c0)
export function fn_3aa80(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s67 = fp - 0x67, s68 = fp - 0x68, s98 = fp - 0x98, sc8 = fp - 0xc8, sf0 = fp - 0xf0, s140 = fp - 0x140, s160 = fp - 0x160, s168 = fp - 0x168, s180 = fp - 0x180, s1a0 = fp - 0x1a0, s1c0 = fp - 0x1c0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3d8 = fp - 0x3d8, s408 = fp - 0x408, s420 = fp - 0x420, s458 = fp - 0x458, s468 = fp - 0x468, s470 = fp - 0x470, sfe8 = fp - 0xfe8, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let p, q, r, ai, am, bk, bm, cw, cy, dr, ds, dt, du, ec: u64
	st64(s3d8 + 0x40, d)
	let ay = c
	let f = a
	const j = clock_get(s1a0)
	if (ld64(s1a0) != 0) {
		const o = ld64(s1a0 + 8)
		const n = ld64(s1a0 + 0x10)
		st64(s1a0 + 0x10, ld64(s1a0 + 0x18))
		st64(s1a0, o, n)
		r = fn_13e628(s390, s1a0)
		q = ld64(s390)
		st64(f + 8, ld64(s390 + 8))
		st64(f, q)
		return r
	}
	st64(s3d8 + 0x38, f)
	st64(s3d8, p5, p8, p7, p6)
	const aa = ld64(s180 + 8)
	const g = ld64(b + 0x20)
	st64(s3d8 + 0x28, g)
	st64(s408 + 0x28, ld64(g + 0x48))
	const h = ld64(b + 0x18)
	st64(s3d8 + 0x30, h)
	st64(s408 + 0x20, ld64(h + 0x48))
	st64(s3d8 + 0x20, b)
	const i = ld64(b + 0x38)
	r = fn_4dc0(s1a0, ld64(i), j)
	const l = ld64(s1a0 + 0x10)
	const m = ld64(s1a0 + 8)
	if (ld64(s1a0) != 0) {
		const k = ld64(s3d8 + 0x38)
		st64(k + 8, l)
		st64(k, m)
		return r
	}
	const s = ld64(m + 0xfd)
	st64(s408 + 8, s)
	st64(s408, ld64(m + 0xf5))
	st64(l, ld64(l) - 1)
	st64(s408 + 0x10, i)
	r = fn_53e8(s1a0, ld64(i), s, undef, undef, r)
	const u = ld64(s1a0 + 0x10)
	const v = ld64(s1a0 + 8)
	if (ld64(s1a0) != 0) {
		const t = ld64(s3d8 + 0x38)
		st64(t + 8, u)
		st64(t, v)
		return r
	}
	st64(s420 + 0x10, u)
	st64(s1f0, v, u)
	const w = ld64(s3d8 + 0x30)
	st64(s408 + 0x18, v)
	let x = v + 0x41
	const y = memcmp(w + 8, x, 0x20)
	const ab = (y as u32) == 0
	const z = ld64(s408 + 0x18)
	if (aa > ld64(z + 0x430)) {
		B15: {
			st64(s420, ab, y)
			if ((y as u32) == 0) {
				const ag = ld64(ld64(ld64(s3d8 + 0x30)))
				copyr(s1a0, ag, 0x20)
				if ((memcmp(s1a0, z + 0x81, 0x20) as u32) != 0) {
					break B15
				}
				const ah = ld64(ld64(ld64(s3d8 + 0x28)))
				copyr(s1a0, ah, 0x20)
				ai = z + 0xa1
			} else {
				const ac = ld64(ld64(ld64(s3d8 + 0x30)))
				copyr(s1a0, ac, 0x20)
				if ((memcmp(s1a0, z + 0xa1, 0x20) as u32) != 0) {
					break B15
				}
				const ad = ld64(ld64(ld64(s3d8 + 0x28)))
				copyr(s1a0, ad, 0x20)
				ai = z + 0x81
			}
			const aj = memcmp(s1a0, ai, 0x20)
			if ((aj as u32) == 0) {
				st64(s1e0, 0, 8, 0, 0)
				let aq = fn_51c8(s1a0, ld64(ld64(ld64(s3d8 + 0x20) + 0x40)), undef, undef, undef, aj as u32)
				const ao = ld64(s1a0 + 0x10)
				const ap = ld64(s1a0 + 8)
				if (ld64(s1a0) != 0) {
					const an = ld64(s3d8 + 0x38)
					st64(an + 8, ao)
					st64(an, ap)
					r = fn_f680(s1e0, aq)
					am = ld64(s420 + 0x10)
					st64(am, ld64(am) + 1)
					return r
				}
				aq = fn_14d20(s1e0, ap, ao, 0x10015fd88, aq)
				let bd = undef
				let bc = undef
				st64(s458 + 0x30, 0)
				const ar = ld64(s3d8 + 0x40)
				if (ar != 0) {
					st64(s458 + 0x30, 0)
					st64(s458 + 0x18, s67)
					let bh = ar * 0x30
					const at = ld64(s408 + 0x18)
					st64(s3d8 + 0x40, at + 1)
					let au = at + 0x61
					st64(s458 + 0x20, au)
					st64(s458 + 0x10, at + 0x17f)
					st64(s458 + 0x28, x)
					while (true) {
						if (fn_147a98(ay, au, bd, bc, bk) == 0x2800) {
							const bg = ay
							aq = fn_84be0(s1a0, ay)
							const be = ld64(s1a0 + 0x10)
							const bf = ld64(s1a0 + 8)
							if (ld64(s1a0) != 0) {
								const cz = ld64(s3d8 + 0x38)
								st64(cz + 8, be)
								st64(cz, bf)
								r = fn_f680(s1e0, aq)
								am = ld64(s420 + 0x10)
								st64(am, ld64(am) + 1)
								return r
							}
							let ba = ld64(s1e0)
							let az = ld64(s1e0 + 0x18)
							if (az == ba) {
								aq = fn_14b50(s1e0, 0x10015fda0)
								ba = ld64(s1e0)
								az = ld64(s1e0 + 0x18)
							}
							const bb = ld64(s1e0 + 0x10) + az
							bc = ba > bb ? 0 : ba
							bd = bb - bc << 4
							au = ld64(s1e0 + 8) + bd
							st64(au + 8, be)
							st64(au, bf)
							st64(s1e0 + 0x18, az + 1)
							x = ld64(s458 + 0x28)
							ay = bg + 0x30
							bh = bh - 0x30
							if (bh == 0) {
								break
							}
						} else {
							aq = fn_147a98(ay)
							bd = undef
							bc = undef
							if (aq != 0x728) {
								break
							}
							const av = ld64(s408 + 0x18)
							const aw = ld16(av + 0x17f)
							let ax = 1
							if (aw != 0) {
								ax = ld64(s458 + 0x10)
							}
							st64(s160 + 0x10, av)
							st64(s180 + 0x10, ld64(s458 + 0x20))
							st64(s180, x)
							st64(s1a0 + 0x10, ld64(s3d8 + 0x40))
							st64(s1a0, 0x10015984c)
							st64(s160, ax, (aw != 0) << 1)
							st64(s160 + 0x18, 1)
							st64(s168, 0x20)
							st64(s180 + 8, 0x20)
							st64(s1a0 + 0x18, 0x20)
							st64(s1a0 + 8, 4)
							st64(s28, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
							// PDA create_program_address(["pool", *(ld64(s3d8 + 0x40)), *x, *(ld64(s458 + 0x20)), ax[..(aw != 0) << 1], av[..1]], program *s28)
							Pubkey_create_program_address(s68, s1a0, 6, s28, aq)
							if (ld8(s68) == 1) {
								st8(s1c0, ld8(s67))
								fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s1c0, 0x100160228, 0x100160248)
							}
							const bi = ld64(s458 + 0x18)
							copyr(s1c0, bi, 0x20)
							aq = fn_76320(s230, ay, s1c0)
							au = undef
							bd = undef
							bc = undef
							const bj = ld64(s230)
							st64(s458 + 0x30, ay)
							if (bj != 2) {
								const db = ld64(s230 + 8)
								const da = ld64(s3d8 + 0x38)
								st64(da, bj, db)
								r = fn_f680(s1e0, aq)
								am = ld64(s420 + 0x10)
								st64(am, ld64(am) + 1)
								return r
							}
							ay = ay + 0x30
							bh = bh - 0x30
							if (bh == 0) {
								break
							}
						}
					}
				}
				const bl = ld64(s3d8 + 0x20)
				const bs = ld64(ld64(bl + 0x30))
				aq = fn_4fa8(s68, ld64(ld64(bl + 0x48)), bd, bc, bk, aq)
				const bn = ld64(s60 + 8)
				let bo = ld64(s60)
				if (ld64(s68) != 0) {
					bm = ld64(s3d8 + 0x38)
					st64(bm + 8, bn)
					st64(bm, bo)
					r = fn_f680(s1e0, aq)
					am = ld64(s420 + 0x10)
					st64(am, ld64(am) + 1)
					return r
				}
				const bp = ld64(s420 + 8)
				let bu = (bp as u32) != 0 ? 0x845c1aa94e69579a : 0x100013b51
				const bq = ld64(s3d8 + 0x18)
				const br = ld64(s3d8 + 0x10)
				if ((bq | br) != 0) {
					bu = ld64(s3d8 + 0x18)
				}
				let bt = (bp as u32) != 0 ? 0xfffec4b1 : 0
				st64(s3d8 + 0x40, bs)
				if ((bq | br) != 0) {
					bt = ld64(s3d8 + 0x10)
				}
				st64(s28, bo, bn)
				st64(sfe8 + 0x20, fn_69b78())
				st64(sfe8 + 0x18, ld64(s3d8 + 8))
				st64(sfe8, bu, bt, (bp as u32) == 0)
				st64(sff8 + 8, ld64(s3d8))
				st64(sff8, ld64(s458 + 0x30))
				st64(s1000, s28)
				aq = fn_374d0(s1a0, ld64(s3d8 + 0x40) + 8, s1f0, s1e0, s28, ld64(sff8), ld64(sff8 + 8), bu, bt, (bp as u32) == 0, ld64(sfe8 + 0x18), ld64(sfe8 + 0x20))
				const bw = ld64(s1a0 + 8)
				if (ld64(s1a0) != 0) {
					const bv = ld64(s3d8 + 0x38)
					st64(bv + 8, ld64(s1a0 + 0x10))
					st64(bv, bw)
					st64(bn, ld64(bn) + 1)
					r = fn_f680(s1e0, aq)
					am = ld64(s420 + 0x10)
					st64(am, ld64(am) + 1)
					return r
				}
				const cc = ld64(s180)
				const cb = ld64(s1a0 + 0x18)
				const ca = ld32(s160 + 8)
				st64(s458 + 0x30, ld64(s160))
				const bz = ld64(s168)
				const by = ld64(s180 + 0x10)
				const bx = ld64(s180 + 8)
				st64(s408 + 0x18, ld64(s1a0 + 0x10))
				st64(bn, ld64(bn) + 1)
				st64(s3d8 + 0x40, bx)
				if (bx != 0 && by != 0) {
					st64(s468, bz, ca, cb, cc, bw)
					st64(s458 + 0x28, by)
					fn_f680(s1e0, cb)
					const cd = ld64(s420 + 0x10)
					st64(cd, ld64(cd) + 1)
					const ce = ld64(s420 + 8)
					const cf = ld64(s3d8 + 0x20)
					st64(s420 + 0x10, fn_16480(ld64(cf + ((ce as u32) != 0 ? 0x10 : 8))))
					st64(s458 + 0x20, fn_16480(ld64(cf + ((ce as u32) != 0 ? 8 : 0x10))))
					let cg = ld64(s3d8 + 0x30)
					if ((ce as u32) != 0) {
						cg = ld64(s3d8 + 0x28)
					}
					st64(s470, fn_16480(cg))
					let ch = ld64(s3d8 + 0x28)
					const ci = ld64(s408 + 0x10)
					if ((ce as u32) != 0) {
						ch = ld64(s3d8 + 0x30)
					}
					st64(s458 + 0x18, fn_16480(ch))
					const cj = ld64(ld64(ci))
					copyr(s1a0, cj, 0x20)
					const ck = ld64(ld64(cf))
					copyr(s180, ck, 0x20)
					const cl = ld64(ld64(ld64(s420 + 0x10)))
					copyr(s160, cl, 0x20)
					const cm = ld64(s458 + 0x20)
					const cn = ld64(ld64(cm))
					const cs = ld64(cn)
					const cr = ld64(cn + 8)
					const cq = ld64(cn + 0x10)
					const cp = ld64(cn + 0x18)
					st64(sf0 + 0x18, ld64(s458 + 0x30))
					st64(sf0 + 0x10, ld64(s468))
					st32(sf0 + 0x20, ld64(s468 + 8))
					st8(sf0 + 0x24, ld64(s420))
					const co = ld64(s458 + 0x28)
					st64(s140 + 0x30, co)
					st64(s140 + 0x20, ld64(s3d8 + 0x40))
					st64(s140 + 0x40, ld64(s458 + 0x10))
					st64(s140 + 0x48, ld64(s408 + 0x18))
					copy(sf0, s458, 0x10)
					st64(s140, cs, cr, cq, cp)
					st64(s140 + 0x38, 0)
					st64(s140 + 0x28, 0)
					fn_10fd98(s68, s1a0)
					copyr(s28, s60, 0x10)
					log_data(s28, 1)
					if ((ce as u32) == 0) {
						AccountInfo_clone_f338(s68, ld64(ld64(s420 + 0x10)))
						const de = AccountInfo_clone_f338(s1a0, ld64(ld64(s470)))
						const dd = ld64(cf + 0x28)
						st8(sc8 + 0x2a, 2)
						st64(sfe8, ld64(s3d8 + 0x40))
						st64(s1000, 0, dd, sc8)
						cw = fn_79050(s260, cf, s68, s1a0, 0, dd, sc8, ld64(sfe8), de, s1a0)
						cy = ld64(s260)
						if (cy != 2) {
							ds = ld64(s260 + 8)
							dr = ld64(s3d8 + 0x38)
							st64(dr, cy, ds)
							return ptr_drop_in_place_fcd8(s68, ptr_drop_in_place_fcd8(s1a0, cw))
						}
						ptr_drop_in_place_fcd8(s68, ptr_drop_in_place_fcd8(s1a0, cw))
						AccountInfo_clone_f338(s68, ld64(ld64(s458 + 0x18)))
						const df = AccountInfo_clone_f338(s1a0, ld64(ld64(s458 + 0x20)))
						st64(sfe8, ld64(s458 + 0x28))
						st64(s1000, 0, dd, sc8)
						cw = fn_7a038(s270, ld64(s408 + 0x10), s68, s1a0, 0, dd, sc8, ld64(sfe8), df)
						cy = ld64(s270)
						if (cy != 2) {
							ds = ld64(s270 + 8)
							dr = ld64(s3d8 + 0x38)
							st64(dr, cy, ds)
							return ptr_drop_in_place_fcd8(s68, ptr_drop_in_place_fcd8(s1a0, cw))
						}
					} else {
						AccountInfo_clone_f338(s68, ld64(cm))
						const cu = AccountInfo_clone_f338(s1a0, ld64(ld64(s458 + 0x18)))
						const ct = ld64(cf + 0x28)
						st8(s98 + 0x2a, 2)
						st64(s1000, 0, ct, s98, co)
						cw = fn_79050(s240, cf, s68, s1a0, 0, ct, s98, co, cu, s1a0)
						const cv = ld64(s240)
						if (cv != 2) {
							const dq = ld64(s240 + 8)
							const dp = ld64(s3d8 + 0x38)
							st64(dp, cv, dq)
							return ptr_drop_in_place_fcd8(s68, ptr_drop_in_place_fcd8(s1a0, cw))
						}
						ptr_drop_in_place_fcd8(s68, ptr_drop_in_place_fcd8(s1a0, cw))
						AccountInfo_clone_f338(s68, ld64(ld64(s470)))
						const cx = AccountInfo_clone_f338(s1a0, ld64(ld64(s420 + 0x10)))
						st64(sfe8, ld64(s3d8 + 0x40))
						st64(s1000, 0, ct, s98)
						cw = fn_7a038(s250, ld64(s408 + 0x10), s68, s1a0, 0, ct, s98, ld64(sfe8), cx)
						cy = ld64(s250)
						if (cy != 2) {
							ds = ld64(s250 + 8)
							dr = ld64(s3d8 + 0x38)
							st64(dr, cy, ds)
							return ptr_drop_in_place_fcd8(s68, ptr_drop_in_place_fcd8(s1a0, cw))
						}
					}
					const dg = ptr_drop_in_place_fcd8(s68, ptr_drop_in_place_fcd8(s1a0, cw))
					r = fn_bd88(s280, ld64(s3d8 + 0x28), dg)
					let dh = ld64(s280)
					if (dh == 2) {
						r = fn_bd88(s290, ld64(s3d8 + 0x30), r)
						dh = ld64(s290)
						if (dh == 2) {
							B78: {
								B82: {
									if ((ld64(s420 + 8) as u32) == 0) {
										let dy = ld64(s458 + 0x10) > ld64(s408)
										const dx = ld64(s408 + 0x18) > ld64(s408 + 8)
										const dv = ld64(s408 + 8)
										const dw = ld64(s408 + 0x18)
										dy = dv != dw ? dx : dy
										if ((dy & 1) != 0) {
											ErrorCode_name(s1c0, 0x100159858, dv, dw)
											st64(s28, 0, 1, 0)
											st64(s48, s28, 0x10015f818)
											st8(s48 + 0x18, 3)
											st64(s48 + 0x10, 0x20)
											st64(s60 + 8, 0)
											st64(s68, 0)
											if (ErrorCode_fmt(0x100159858, s68) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copyr(s168, s28, 0x18)
											copy(s180, s1c0, 0x18)
											st64(s1a0 + 8, 0x100159f83)
											st32(s140 + 0x38, 0x9ca /* anchor::RequireGteViolated */)
											st8(s160 + 0x10, 2)
											st32(s1a0 + 0x18, 0x3e3)
											st64(s1a0 + 0x10, 0x25)
											st64(s1a0, 0)
											fn_13e5a0(s360, s1a0)
											const ea = ld64(s360 + 8)
											const dz = ld64(s360)
											st64(sff8 + 8, ld64(s408 + 0x18))
											st64(sff8, ld64(s458 + 0x10))
											st64(s1000, ld64(s408 + 8))
											r = fn_2be8(s370, dz, ea, ld64(s408), ld64(s1000), ld64(sff8), ld64(sff8 + 8))
											q = ld64(s370)
											f = ld64(s3d8 + 0x38)
											st64(f + 8, ld64(s370 + 8))
											st64(f, q)
											return r
										}
										if ((ld64(s3d8 + 0x18) | ld64(s3d8 + 0x10)) == 0) {
											if (ld64(s3d8 + 8) != 0) {
												if (ld64(s3d8 + 0x40) == ld64(s3d8)) {
													break B78
												}
												ErrorCode_name(s1c0, 0x1001598b8, dv, dw)
												st64(s28, 0, 1, 0)
												st64(s48, s28, 0x10015f818)
												st8(s48 + 0x18, 3)
												st64(s48 + 0x10, 0x20)
												st64(s60 + 8, 0)
												st64(s68, 0)
												if (ErrorCode_fmt(0x1001598b8, s68) != 0) {
													fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
												}
												copyr(s168, s28, 0x18)
												copy(s180, s1c0, 0x18)
												st64(s1a0 + 8, 0x100159f83)
												st32(s140 + 0x38, 0x9c5 /* anchor::RequireEqViolated */)
												st8(s160 + 0x10, 2)
												st32(s1a0 + 0x18, 0x3eb)
												st64(s1a0 + 0x10, 0x25)
												st64(s1a0, 0)
												fn_13e5a0(s330, s1a0)
												r = fn_1730(s340, ld64(s330), ld64(s330 + 8), ld64(s3d8), ld64(s3d8 + 0x40))
												q = ld64(s340)
												f = ld64(s3d8 + 0x38)
												st64(f + 8, ld64(s340 + 8))
												st64(f, q)
												return r
											}
											if (ld64(s458 + 0x28) == ld64(s3d8)) {
												break B82
											}
											ErrorCode_name(s1c0, 0x1001598b8, dv, dw)
											st64(s28, 0, 1, 0)
											st64(s48, s28, 0x10015f818)
											st8(s48 + 0x18, 3)
											st64(s48 + 0x10, 0x20)
											st64(s60 + 8, 0)
											st64(s68, 0)
											if (ErrorCode_fmt(0x1001598b8, s68) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copyr(s168, s28, 0x18)
											copy(s180, s1c0, 0x18)
											st64(s1a0 + 8, 0x100159f83)
											st32(s140 + 0x38, 0x9c5 /* anchor::RequireEqViolated */)
											st8(s160 + 0x10, 2)
											st32(s1a0 + 0x18, 0x3f1)
											st64(s1a0 + 0x10, 0x25)
											st64(s1a0, 0)
											fn_13e5a0(s300, s1a0)
											r = fn_1730(s310, ld64(s300), ld64(s300 + 8), ld64(s3d8), ld64(s458 + 0x28))
											q = ld64(s310)
											f = ld64(s3d8 + 0x38)
											st64(f + 8, ld64(s310 + 8))
											st64(f, q)
											return r
										}
									} else {
										let dl = ld64(s408) > ld64(s458 + 0x10)
										const dk = ld64(s408 + 8) > ld64(s408 + 0x18)
										const dj = ld64(s408 + 8)
										const di = ld64(s408 + 0x18)
										dl = di != dj ? dk : dl
										if ((dl & 1) != 0) {
											ErrorCode_name(s1c0, 0x100159858, dj, di)
											st64(s28, 0, 1, 0)
											st64(s48, s28, 0x10015f818)
											st8(s48 + 0x18, 3)
											st64(s48 + 0x10, 0x20)
											st64(s60 + 8, 0)
											st64(s68, 0)
											if (ErrorCode_fmt(0x100159858, s68) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copyr(s168, s28, 0x18)
											copy(s180, s1c0, 0x18)
											st64(s1a0 + 8, 0x100159f83)
											st32(s140 + 0x38, 0x9ca /* anchor::RequireGteViolated */)
											st8(s160 + 0x10, 2)
											st32(s1a0 + 0x18, 0x3e5)
											st64(s1a0 + 0x10, 0x25)
											st64(s1a0, 0)
											fn_13e5a0(s2e0, s1a0)
											const dn = ld64(s2e0 + 8)
											const dm = ld64(s2e0)
											copyr(sff8, s408, 0x10)
											st64(s1000, ld64(s408 + 0x18))
											r = fn_2be8(s2f0, dm, dn, ld64(s458 + 0x10), ld64(s1000), ld64(sff8), ld64(sff8 + 8))
											q = ld64(s2f0)
											f = ld64(s3d8 + 0x38)
											st64(f + 8, ld64(s2f0 + 8))
											st64(f, q)
											return r
										}
										if ((ld64(s3d8 + 0x18) | ld64(s3d8 + 0x10)) == 0) {
											if (ld64(s3d8 + 8) != 0) {
												if (ld64(s458 + 0x28) == ld64(s3d8)) {
													break B78
												}
												ErrorCode_name(s1c0, 0x1001598b8, dj, di)
												st64(s28, 0, 1, 0)
												st64(s48, s28, 0x10015f818)
												st8(s48 + 0x18, 3)
												st64(s48 + 0x10, 0x20)
												st64(s60 + 8, 0)
												st64(s68, 0)
												if (ErrorCode_fmt(0x1001598b8, s68) != 0) {
													fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
												}
												copyr(s168, s28, 0x18)
												copy(s180, s1c0, 0x18)
												st64(s1a0 + 8, 0x100159f83)
												st32(s140 + 0x38, 0x9c5 /* anchor::RequireEqViolated */)
												st8(s160 + 0x10, 2)
												st32(s1a0 + 0x18, 0x3ed)
												st64(s1a0 + 0x10, 0x25)
												st64(s1a0, 0)
												fn_13e5a0(s2c0, s1a0)
												r = fn_1730(s2d0, ld64(s2c0), ld64(s2c0 + 8), ld64(s3d8), ld64(s458 + 0x28))
												q = ld64(s2d0)
												f = ld64(s3d8 + 0x38)
												st64(f + 8, ld64(s2d0 + 8))
												st64(f, q)
												return r
											}
											if (ld64(s3d8 + 0x40) == ld64(s3d8)) {
												break B82
											}
											ErrorCode_name(s1c0, 0x1001598b8, dj, di)
											st64(s28, 0, 1, 0)
											st64(s48, s28, 0x10015f818)
											st8(s48 + 0x18, 3)
											st64(s48 + 0x10, 0x20)
											st64(s60 + 8, 0)
											st64(s68, 0)
											if (ErrorCode_fmt(0x1001598b8, s68) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copyr(s168, s28, 0x18)
											copy(s180, s1c0, 0x18)
											st64(s1a0 + 8, 0x100159f83)
											st32(s140 + 0x38, 0x9c5 /* anchor::RequireEqViolated */)
											st8(s160 + 0x10, 2)
											st32(s1a0 + 0x18, 0x3f3)
											st64(s1a0 + 0x10, 0x25)
											st64(s1a0, 0)
											fn_13e5a0(s2a0, s1a0)
											r = fn_1730(s2b0, ld64(s2a0), ld64(s2a0 + 8), ld64(s3d8), ld64(s3d8 + 0x40))
											q = ld64(s2b0)
											f = ld64(s3d8 + 0x38)
											st64(f + 8, ld64(s2b0 + 8))
											st64(f, q)
											return r
										}
									}
									if (ld64(s3d8 + 8) != 0) {
										break B78
									}
								}
								const ed = ld64(ld64(s3d8 + 0x30) + 0x48)
								r = fn_88360(s320, 0x26)
								p = ld64(s320 + 8)
								q = ld64(s320)
								if (ld64(s408 + 0x20) > ed) {
									f = ld64(s3d8 + 0x38)
									st64(f + 8, p)
									st64(f, q)
									return r
								}
								ec = ld64(s3d8 + 0x38)
								st64(ec + 8, ed - ld64(s408 + 0x20))
								st64(ec, 2)
								return fn_fc80(q, p, r)
							}
							const eb = ld64(ld64(s3d8 + 0x28) + 0x48)
							r = fn_88360(s350, 0x26)
							p = ld64(s350 + 8)
							q = ld64(s350)
							if (eb > ld64(s408 + 0x28)) {
								f = ld64(s3d8 + 0x38)
								st64(f + 8, p)
								st64(f, q)
								return r
							}
							ec = ld64(s3d8 + 0x38)
							st64(ec + 8, ld64(s408 + 0x28) - eb)
							st64(ec, 2)
							return fn_fc80(q, p, r)
						}
						du = ld64(s290 + 8)
						dt = ld64(s3d8 + 0x38)
						st64(dt, dh, du)
						return r
					}
					du = ld64(s280 + 8)
					dt = ld64(s3d8 + 0x38)
					st64(dt, dh, du)
					return r
				}
				fn_85138(s1c0, 0x100159824)
				st64(s28, 0, 1, 0)
				st64(s48, s28, 0x10015f818)
				st8(s48 + 0x18, 3)
				st64(s48 + 0x10, 0x20)
				st64(s60 + 8, 0)
				st64(s68, 0)
				const dc = fn_88558(0x100159824, s68)
				bm = ld64(s3d8 + 0x38)
				if (dc != 0) {
					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
				}
				copyr(s168, s28, 0x18)
				copy(s180, s1c0, 0x18)
				st64(s1a0 + 8, 0x100159f83)
				st32(s140 + 0x38, 0x1786 /* error::TooSmallInputOrOutputAmount */)
				st8(s160 + 0x10, 2)
				st32(s1a0 + 0x18, 0x390)
				st64(s1a0 + 0x10, 0x25)
				st64(s1a0, 0)
				aq = fn_13e5a0(s380, s1a0)
				bo = ld64(s380)
				st64(bm + 8, ld64(s380 + 8))
				st64(bm, bo)
				r = fn_f680(s1e0, aq)
				am = ld64(s420 + 0x10)
				st64(am, ld64(am) + 1)
				return r
			}
		}
		fn_85138(s1c0, 0x10015990c)
		st64(s28, 0, 1, 0)
		st64(s48, s28, 0x10015f818)
		st8(s48 + 0x18, 3)
		st64(s48 + 0x10, 0x20)
		st64(s60 + 8, 0)
		st64(s68, 0)
		if (fn_88558(0x10015990c, s68) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(s168, s28, 0x18)
		copy(s180, s1c0, 0x18)
		st64(s1a0 + 8, 0x100159f83)
		st32(s140 + 0x38, 0x1785 /* error::InvalidInputPoolVault */)
		st8(s160 + 0x10, 2)
		st32(s1a0 + 0x18, 0x35a)
		st64(s1a0 + 0x10, 0x25)
		st64(s1a0, 0)
		r = fn_13e5a0(s220, s1a0)
		const al = ld64(s220)
		const ak = ld64(s3d8 + 0x38)
		st64(ak + 8, ld64(s220 + 8))
		st64(ak, al)
		am = ld64(s420 + 0x10)
		st64(am, ld64(am) + 1)
		return r
	}
	ErrorCode_name(s1c0, 0x100159900, undef, z)
	st64(s28, 0, 1, 0)
	st64(s48, s28, 0x10015f818)
	st8(s48 + 0x18, 3)
	st64(s48 + 0x10, 0x20)
	st64(s60 + 8, 0)
	st64(s68, 0)
	if (ErrorCode_fmt(0x100159900, s68) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(s168, s28, 0x18)
	copy(s180, s1c0, 0x18)
	st64(s1a0 + 8, 0x100159f83)
	st32(s140 + 0x38, 0x9c9 /* anchor::RequireGtViolated */)
	st8(s160 + 0x10, 2)
	st32(s1a0 + 0x18, 0x358)
	st64(s1a0 + 0x10, 0x25)
	st64(s1a0, 0)
	fn_13e5a0(s200, s1a0)
	r = fn_1730(s210, ld64(s200), ld64(s200 + 8), aa, ld64(ld64(s408 + 0x18) + 0x430))
	const af = ld64(s210)
	const ae = ld64(s3d8 + 0x38)
	st64(ae + 8, ld64(s210 + 8))
	st64(ae, af)
	am = ld64(s1f0 + 8)
	st64(am, ld64(am) + 1)
	return r
}

export function fn_14d20(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 {
	let h, i: u64
	let g = ld64(a)
	let f = ld64(a + 0x18)
	if (f == g) {
		r0 = fn_14b50(a, d)
		g = ld64(a)
		f = ld64(a + 0x18)
		h = ld64(a + 0x10) + f
		i = ld64(a + 8) + (h - (g > h ? 0 : g) << 4)
		st64(i + 8, c)
		st64(i, b)
		st64(a + 0x18, f + 1)
		return r0
	}
	h = ld64(a + 0x10) + f
	i = ld64(a + 8) + (h - (g > h ? 0 : g) << 4)
	st64(i + 8, c)
	st64(i, b)
	st64(a + 0x18, f + 1)
	return r0
}

export function fn_16480(a: u64): u64 {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0xb8) & -8 : 0x300007f48
	if (g > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		st64(g, ld64(a))
		memcpy(g + 8, a + 8, 0xb0)
		return g
	}
	alloc_handle_alloc_error(8, 0xb8)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: observation_state, tick_array
export function fn_b7700(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8
	let i: u64
	let x = fn_a80(s28, ld64(b + 0x10), c)
	let f = ld64(s28)
	if (f == 2) {
		const j = ld64(ld64(b + 0x18))
		if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(j) == 0 && ld64(ld64(j + 0x10) + 0x10) != 0)) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			x = fn_13e628(s38, s18)
			f = ld64(s38)
			if (f != 2) {
				const k = ld64(0x300000000 /* heap bump-allocator cursor */)
				const l = k != 0 ? sat_sub(k, 0x13) : 0x300007fed
				i = ld64(s38 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > l) {
						raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008, 0x13 > k)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, l)
					st64(l + 8, 0x6f6363615f6e656b)
					st64(l, 0x6f745f7475706e69)
					st32(l + 0xf, 0x746e756f)
					void ld64(i)
				} else {
					if (0x300000008 > l) {
						raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008, 0x13 > k)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, l)
					st64(l + 8, 0x6f6363615f6e656b)
					st64(l, 0x6f745f7475706e69)
					st32(l + 0xf, 0x746e756f)
					void ld64(i)
				}
				st64(i + 0x10, l, 0x13)
				st64(i + 8, 0x13)
				st64(i, 1)
				st64(a + 8, i)
				st64(a, f)
				return x
			}
		}
		const m = ld64(ld64(b + 0x20))
		if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(m) == 0 && ld64(ld64(m + 0x10) + 0x10) != 0)) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			x = fn_13e628(s48, s18)
			f = ld64(s48)
			if (f != 2) {
				const n = ld64(0x300000000 /* heap bump-allocator cursor */)
				const o = n != 0 ? sat_sub(n, 0x14) : 0x300007fec
				i = ld64(s48 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > o) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > n)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, o)
					st64(o + 8, 0x6363615f6e656b6f)
					st64(o, 0x745f74757074756f)
					st32(o + 0x10, 0x746e756f)
					void ld64(i)
				} else {
					if (0x300000008 > o) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > n)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, o)
					st64(o + 8, 0x6363615f6e656b6f)
					st64(o, 0x745f74757074756f)
					st32(o + 0x10, 0x746e756f)
					void ld64(i)
				}
				st64(i + 0x10, o, 0x14)
				st64(i + 8, 0x14)
				st64(i, 1)
				st64(a + 8, i)
				st64(a, f)
				return x
			}
		}
		const p = ld64(ld64(b + 0x28))
		if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(p) == 0 && ld64(ld64(p + 0x10) + 0x10) != 0)) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			x = fn_13e628(s58, s18)
			f = ld64(s58)
			if (f != 2) {
				const q = ld64(0x300000000 /* heap bump-allocator cursor */)
				const r = q != 0 ? sat_sub(q, 0xb) : 0x300007ff5
				i = ld64(s58 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > r) {
						raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, 0xb > q)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, r)
					st64(r, 0x61765f7475706e69)
					st32(r + 7, 0x746c7561)
					void ld64(i)
				} else {
					if (0x300000008 > r) {
						raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, 0xb > q)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, r)
					st64(r, 0x61765f7475706e69)
					st32(r + 7, 0x746c7561)
					void ld64(i)
				}
				st64(i + 0x10, r, 0xb)
				st64(i + 8, 0xb)
				st64(i, 1)
				st64(a + 8, i)
				st64(a, f)
				return x
			}
		}
		const s = ld64(ld64(b + 0x30))
		if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(s) == 0 && ld64(ld64(s + 0x10) + 0x10) != 0)) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			x = fn_13e628(s68, s18)
			f = ld64(s68)
			if (f != 2) {
				const t = ld64(0x300000000 /* heap bump-allocator cursor */)
				const u = t != 0 ? sat_sub(t, 0xc) : 0x300007ff4
				i = ld64(s68 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > u) {
						raw_vec_handle_error(1, 0xc, 0x10015f8f8, 0x300000008, 0xc > t)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, u)
					st64(u, 0x765f74757074756f)
					st32(u + 8, 0x746c7561)
					void ld64(i)
				} else {
					if (0x300000008 > u) {
						raw_vec_handle_error(1, 0xc, 0x10015f8f8, 0x300000008, 0xc > t)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, u)
					st64(u, 0x765f74757074756f)
					st32(u + 8, 0x746c7561)
					void ld64(i)
				}
				st64(i + 0x10, u, 0xc)
				st64(i + 8, 0xc)
				st64(i, 1)
				st64(a + 8, i)
				st64(a, f)
				return x
			}
		}
		fn_8a8(s78, ld64(b + 0x38), c)
		const v = ld64(s78)
		if (v != 2) {
			x = fn_4130(s88, v, ld64(s78 + 8), "observation_state", 0x11)
			i = ld64(s88 + 8)
			f = ld64(s88)
			if (f != 2) {
				st64(a + 8, i)
				st64(a, f)
				return x
			}
		}
		x = fn_1008(s98, ld64(b + 0x48), c)
		i = undef
		const w = ld64(s98)
		if (w == 2) {
			st64(a + 8, i)
			st64(a, 2)
			return x
		}
		x = fn_4130(sa8, w, ld64(s98 + 8), 0x10015a23e /* "tick_array" */, 0xa)
		f = ld64(sa8)
		st64(a + 8, ld64(sa8 + 8))
		st64(a, f)
		return x
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0xa) : 0x300007ff6
	i = ld64(s28 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x6174735f6c6f6f70)
		st16(h + 8, 0x6574)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > g)
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
