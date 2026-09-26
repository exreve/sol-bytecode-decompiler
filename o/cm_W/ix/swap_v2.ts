/// <reference path="../lib.d.ts" />
// instruction swap_v2
import { anchor_error_from, fn_13e5a0, fn_13e628, fn_14ed60, fn_3e038, fn_4130, fn_4dc0, fn_85138, fn_88558, fn_8a8, fn_a80, memcpy } from '../shared.ts'

// instruction handler: swap_v2 (discriminator sha256("global:swap_v2")[..8] = 0x621ec91a0bed042b)
// accounts [idl]: 0 payer [signer], 1 amm_config, 2 pool_state [mut], 3 input_token_account [mut], 4 output_token_account [mut], 5 input_vault [mut], 6 output_vault [mut], 7 observation_state [mut], 8 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 9 token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb], 10 memo_program [= MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr], 11 input_vault_mint, 12 output_vault_mint
// args [idl]: amount: u64, other_amount_threshold: u64, sqrt_price_limit_x64: u128, is_base_input: bool
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, amount, other_amount_threshold, is_base_input
export function ix_swap_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s10 = fp - 0x10, s11 = fp - 0x11, s68 = fp - 0x68, s70 = fp - 0x70, s80 = fp - 0x80, sd0 = fp - 0xd0, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s1000 = fp - 0x1000
	let l, o, p, q, r, s: u64
	const u = sol_log("Instruction: SwapV2", 0x13)
	const f = ix_args_len
	if (f >= 8 && ((f & -8) != 8 && ((f & -0x10) != 0x10 && f != 0x20))) {
		const args: SwapV2Args = ix_args
		const amount = args.amount
		const other_amount_threshold = args.other_amount_threshold
		const k = ld64(args.sqrt_price_limit_x64 + 8)
		const j = ld64(args.sqrt_price_limit_x64)
		const is_base_input = args.is_base_input
		st8(s11, is_base_input)
		if (2 > is_base_input) {
			st64(s10, accounts, accounts_len)
			s = accounts_swap_v2(s80, amount, s10, j, fp, u)
			const v = ld64(s80)
			if (v == 0) {
				r = ld64(s80 + 8)
				st64(a + 8, ld64(s70))
				st64(a, r)
				return s
			}
			const x = ld64(s80 + 8)
			const w = ld64(s70)
			memcpy(sd0, s68, 0x50)
			st64(se8, v, x, w)
			copyr(s70, s10, 0x10)
			st64(s80, program_id, se8)
			st64(s1000, j, k, is_base_input & 1)
			s = fn_414a8(sf8, s80, amount, other_amount_threshold, j, k, is_base_input & 1)
			r = ld64(sf8)
			if (r == 2) {
				s = fn_ba658(s108, se8, program_id)
				r = ld64(s108)
				st64(a + 8, ld64(s108 + 8))
				st64(a, r)
				return s
			}
			st64(a + 8, ld64(sf8 + 8))
			st64(a, r)
			return s
		}
		st64(s80, 0x10015f910)
		st64(s70, s10)
		st64(s10, s11, fn_154c88)
		st64(s68 + 8, 0)
		st64(s80 + 8, 1)
		st64(s68, 1)
		// fmt "Invalid bool representation: {}" {} = is_base_input [fn_154c88]
		fn_14de10(se8, s80, other_amount_threshold, j, k)
		l = fn_f128(se8)
	} else {
		l = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	}
	const m = l
	if (2 > (l & 3) - 2) {
		s = anchor_error_from(s118, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		r = ld64(s118)
		st64(a + 8, ld64(s118 + 8))
		st64(a, r)
		return s
	}
	if ((m & 3) == 0) {
		s = anchor_error_from(s118, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		r = ld64(s118)
		st64(a + 8, ld64(s118 + 8))
		st64(a, r)
		return s
	}
	const n = ld64(ld64(l + 7))
	if (n == 0) {
		s = anchor_error_from(s118, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		r = ld64(s118)
		st64(a + 8, ld64(s118 + 8))
		st64(a, r)
		return s
	}
	callx(n, ld64(l - 1), n)
	s = anchor_error_from(s118, 0x66 /* anchor::InstructionDidNotDeserialize */)
	r = ld64(s118)
	st64(a + 8, ld64(s118 + 8))
	st64(a, r)
	return s
}

// Anchor Accounts::try_accounts of instruction swap_v2 (called by ix_swap_v2; name [str]: from the handler's "Instruction: …" log; was fn_b8480)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: input_vault (ConstraintMut), output_vault (ConstraintMut), observation_state (ConstraintMut, ConstraintAddress), token_program, token_program_2022, memo_program, input_vault_mint (ConstraintAddress), output_vault_mint (ConstraintAddress), output_token_account (ConstraintMut), input_token_account (ConstraintMut), pool_state (ConstraintMut), amm_config (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: input_vault_mint_box, output_vault_mint_box, output_vault_box, output_vault_box_2
export function accounts_swap_v2(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const sd8 = fp - 0xd8, sf8 = fp - 0xf8, s118 = fp - 0x118, s138 = fp - 0x138, s158 = fp - 0x158, s178 = fp - 0x178, s198 = fp - 0x198, s1b8 = fp - 0x1b8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s410 = fp - 0x410, s418 = fp - 0x418, s420 = fp - 0x420, s428 = fp - 0x428, s430 = fp - 0x430, s438 = fp - 0x438, s440 = fp - 0x440, s448 = fp - 0x448, s450 = fp - 0x450, s458 = fp - 0x458
	let ad, ae, af, ah, ai, ak, al, an, ao, aq, ar, au, av, ax, ay, bc: u64
	let input_vault_mint_box: Mint
	let l = try_accounts_17a30(sd8, c, c, d, e, r0)
	const i = ld64(sd8 + 8)
	let f = ld64(sd8)
	if (f == 2) {
		l = try_accounts_184d8(sd8, c)
		let t = undef
		if (ld64(sd8) == 0) {
			const o = ld64(0x300000000 /* heap bump-allocator cursor */)
			f = ld64(sd8 + 8)
			const p = o != 0 ? sat_sub(o, 0xa) : 0x300007ff6
			input_vault_mint_box = ld64(sd8 + 0x10)
			if (f != 0) {
				if (0x300000008 > p) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, t)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, p)
				st64(p, 0x666e6f635f6d6d61)
				st16(p + 8, 0x6769)
				void ld64(input_vault_mint_box)
			} else {
				if (0x300000008 > p) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, t)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, p)
				st64(p, 0x666e6f635f6d6d61)
				st16(p + 8, 0x6769)
				void ld64(input_vault_mint_box)
			}
			st64(input_vault_mint_box.mint_authority + 0xc, p, 0xa)
			st64(input_vault_mint_box.mint_authority + 4, 0xa)
			st64(input_vault_mint_box, 1)
			st64(a + 0x10, input_vault_mint_box)
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
			memcpy(k & -8, sd8, 0x78)
			fn_11e0(sd8, c)
			l = ld64(sd8 + 8)
			f = ld64(sd8)
			if (f == 2) {
				st64(s410, l)
				l = try_accounts_1678(sd8, c)
				if (ld32(sd8 + 0xb0) == 2) {
					const v = ld64(0x300000000 /* heap bump-allocator cursor */)
					f = ld64(sd8)
					const w = v != 0 ? sat_sub(v, 0x13) : 0x300007fed
					input_vault_mint_box = ld64(sd8 + 8)
					if (f != 0) {
						if (0x300000008 > w) {
							raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, w)
						st64(w + 8, 0x6f6363615f6e656b)
						st64(w, 0x6f745f7475706e69)
						st32(w + 0xf, 0x746e756f)
						void ld64(input_vault_mint_box)
					} else {
						if (0x300000008 > w) {
							raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, w)
						st64(w + 8, 0x6f6363615f6e656b)
						st64(w, 0x6f745f7475706e69)
						st32(w + 0xf, 0x746e756f)
						void ld64(input_vault_mint_box)
					}
					st64(input_vault_mint_box.mint_authority + 0xc, w, 0x13)
					st64(input_vault_mint_box.mint_authority + 4, 0x13)
					st64(input_vault_mint_box, 1)
					st64(a + 0x10, input_vault_mint_box)
					st64(a + 8, f)
					st64(a, 0)
					return l
				}
				const m = ld64(0x300000000 /* heap bump-allocator cursor */)
				const n = m != 0 ? sat_sub(m, 0xd8) : 0x300007f28
				if (0x300000008 > n) {
					alloc_handle_alloc_error(8, 0xd8)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n & -8)
				if ((n & -8) != 0) {
					st64(s418, n & -8)
					memcpy(n & -8, sd8, 0xd8)
					l = try_accounts_1678(sd8, c)
					if (ld32(sd8 + 0xb0) == 2) {
						const z = ld64(0x300000000 /* heap bump-allocator cursor */)
						f = ld64(sd8)
						const aa = z != 0 ? sat_sub(z, 0x14) : 0x300007fec
						input_vault_mint_box = ld64(sd8 + 8)
						if (f != 0) {
							if (0x300000008 > aa) {
								raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, aa)
							st64(aa + 8, 0x6363615f6e656b6f)
							st64(aa, 0x745f74757074756f)
							st32(aa + 0x10, 0x746e756f)
							void ld64(input_vault_mint_box)
						} else {
							if (0x300000008 > aa) {
								raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, aa)
							st64(aa + 8, 0x6363615f6e656b6f)
							st64(aa, 0x745f74757074756f)
							st32(aa + 0x10, 0x746e756f)
							void ld64(input_vault_mint_box)
						}
						st64(input_vault_mint_box.mint_authority + 0xc, aa, 0x14)
						st64(input_vault_mint_box.mint_authority + 4, 0x14)
						st64(input_vault_mint_box, 1)
						st64(a + 0x10, input_vault_mint_box)
						st64(a + 8, f)
						st64(a, 0)
						return l
					}
					const x = ld64(0x300000000 /* heap bump-allocator cursor */)
					const y = x != 0 ? sat_sub(x, 0xd8) : 0x300007f28
					if (0x300000008 > y) {
						alloc_handle_alloc_error(8, 0xd8)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, y & -8)
					if ((y & -8) != 0) {
						st64(s428, y & -8)
						memcpy(y & -8, sd8, 0xd8)
						try_accounts_1678(sd8, c)
						if (ld32(sd8 + 0xb0) == 2) {
							l = fn_4130(s1e8, ld64(sd8), ld64(sd8 + 8), 0x10015b11e /* "input_vault" */, 0xb)
							st64(s420, ld64(s1e8 + 8))
							f = ld64(s1e8)
							if (f != 2) {
								st64(a + 0x10, ld64(s420))
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
						} else {
							const ab = ld64(0x300000000 /* heap bump-allocator cursor */)
							const ac = ab != 0 ? sat_sub(ab, 0xd8) : 0x300007f28
							if (0x300000008 > ac) {
								alloc_handle_alloc_error(8, 0xd8)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, ac & -8)
							if ((ac & -8) == 0) {
								alloc_handle_alloc_error(8, 0xd8)
							}
							st64(s420, ac & -8)
							memcpy(ac & -8, sd8, 0xd8)
						}
						fn_7498(sd8, c, ad, ae, af)
						input_vault_mint_box = ld64(sd8 + 8)
						const ag = ld64(sd8)
						if (ag != 2) {
							l = fn_4130(s1f8, ag, input_vault_mint_box, "output_vault", 0xc)
							input_vault_mint_box = ld64(s1f8 + 8)
							f = ld64(s1f8)
							if (f != 2) {
								st64(a + 0x10, input_vault_mint_box)
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
						}
						st64(s430, input_vault_mint_box)
						fn_14c8(sd8, c, input_vault_mint_box, ah, ai)
						input_vault_mint_box = ld64(sd8 + 8)
						const aj = ld64(sd8)
						if (aj != 2) {
							l = fn_4130(s208, aj, input_vault_mint_box, "observation_state", 0x11)
							input_vault_mint_box = ld64(s208 + 8)
							f = ld64(s208)
							if (f != 2) {
								st64(a + 0x10, input_vault_mint_box)
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
						}
						st64(s438, input_vault_mint_box)
						try_accounts_19190(sd8, c, input_vault_mint_box, ak, al)
						input_vault_mint_box = ld64(sd8 + 8)
						const am = ld64(sd8)
						if (am != 2) {
							l = fn_4130(s218, am, input_vault_mint_box, 0x10015b020 /* "token_program" */, 0xd)
							input_vault_mint_box = ld64(s218 + 8)
							f = ld64(s218)
							if (f != 2) {
								st64(a + 0x10, input_vault_mint_box)
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
						}
						st64(s440, input_vault_mint_box)
						fn_18cf0(sd8, c, input_vault_mint_box, an, ao)
						input_vault_mint_box = ld64(sd8 + 8)
						const ap = ld64(sd8)
						if (ap != 2) {
							l = fn_4130(s228, ap, input_vault_mint_box, "token_program_2022", 0x12)
							input_vault_mint_box = ld64(s228 + 8)
							f = ld64(s228)
							if (f != 2) {
								st64(a + 0x10, input_vault_mint_box)
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
						}
						st64(s448, input_vault_mint_box)
						fn_193e0(sd8, c, input_vault_mint_box, aq, ar)
						input_vault_mint_box = ld64(sd8 + 8)
						const at = ld64(sd8)
						if (at != 2) {
							l = fn_4130(s238, at, input_vault_mint_box, "memo_program", 0xc)
							input_vault_mint_box = ld64(s238 + 8)
							f = ld64(s238)
							if (f != 2) {
								st64(a + 0x10, input_vault_mint_box)
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
						}
						st64(s450, input_vault_mint_box)
						fn_7768(sd8, c, input_vault_mint_box, au, av)
						input_vault_mint_box = ld64(sd8 + 8)
						const aw = ld64(sd8)
						if (aw != 2) {
							l = fn_4130(s248, aw, input_vault_mint_box, "input_vault_mint", 0x10)
							input_vault_mint_box = ld64(s248 + 8)
							f = ld64(s248)
							if (f != 2) {
								st64(a + 0x10, input_vault_mint_box)
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
						}
						st64(s458, input_vault_mint_box)
						l = fn_7768(sd8, c, input_vault_mint_box, ax, ay)
						let output_vault_mint_box: Mint = ld64(sd8 + 8)
						const az = ld64(sd8)
						if (az != 2) {
							l = fn_4130(s258, az, output_vault_mint_box, "output_vault_mint", 0x11)
							output_vault_mint_box = ld64(s258 + 8)
							f = ld64(s258)
							bc = ld64(s410)
							if (f != 2) {
								st64(a + 0x10, output_vault_mint_box)
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
						} else {
							bc = ld64(s410)
						}
						const bb = ld64(ld64(k & -8))
						copyr(s1d8, bb, 0x20)
						l = fn_4dc0(sd8, bc, l)
						let bd = ld64(sd8 + 0x10)
						let be = ld64(sd8 + 8)
						if (ld64(sd8) != 0) {
							st64(a + 0x10, bd)
							st64(a + 8, be)
							st64(a, 0)
							return l
						}
						copyr(s1b8, be + 1, 0x20)
						st64(bd, ld64(bd) - 1)
						if ((memcmp(s1d8, s1b8, 0x20) as u32) == 0) {
							if (ld8(ld64(s410) + 0x29) != 0) {
								const bi = ld64(s418)
								if (ld8(ld64(bi + 0x20) + 0x29) != 0) {
									const bj = ld64(i)
									copyr(sd8, bj, 0x20)
									if ((memcmp(bi + 0x48, sd8, 0x20) as u32) != 0) {
										l = anchor_error_from(s2d8, 0x7df /* anchor::ConstraintTokenOwner */)
										f = ld64(s2d8)
										st64(a + 0x10, ld64(s2d8 + 8))
										st64(a + 8, f)
										st64(a, 0)
										return l
									}
									const bk = ld64(s420)
									copyr(sd8, bk + 0x28, 0x20)
									if ((memcmp(ld64(s418) + 0x28, sd8, 0x20) as u32) == 0) {
										if (ld8(ld64(ld64(s428) + 0x20) + 0x29) != 0) {
											const output_vault_box: TokenAccount = ld64(s430)
											copyr(sd8, output_vault_box.mint, 0x20)
											const bm = memcmp(ld64(s428) + 0x28, sd8, 0x20)
											if ((bm as u32) != 0) {
												l = anchor_error_from(s318, 0x7de /* anchor::ConstraintTokenMint */)
												f = ld64(s318)
												st64(a + 0x10, ld64(s318 + 8))
												st64(a + 8, f)
												st64(a, 0)
												return l
											}
											if (ld8(ld64(ld64(s420) + 0x20) + 0x29) != 0) {
												if (ld8(ld64(ld64(s430) + 0x20) + 0x29) != 0) {
													if (ld8(ld64(s438) + 0x29 /* is_writable */) != 0) {
														const bn = ld64(ld64(s438) /* key */)
														copyr(s198, bn, 0x20)
														l = fn_4dc0(sd8, ld64(s410), bm as u32)
														bd = ld64(sd8 + 0x10)
														be = ld64(sd8 + 8)
														if (ld64(sd8) != 0) {
															st64(a + 0x10, bd)
															st64(a + 8, be)
															st64(a, 0)
															return l
														}
														copyr(s178, be + 0xc1, 0x20)
														st64(bd, ld64(bd) - 1)
														if ((memcmp(s198, s178, 0x20) as u32) == 0) {
															const br = ld64(s420)
															const bs = ld64(ld64(ld64(s458) + 0x58))
															copyr(s158, bs, 0x20)
															copy(s138, br + 0x28, 0x20)
															if ((memcmp(s158, s138, 0x20) as u32) == 0) {
																const output_vault_box_2: TokenAccount = ld64(s430)
																const bx = output_vault_mint_box.info.key
																copyr(s118, bx, 0x20)
																copy(sf8, output_vault_box_2.mint, 0x20)
																l = memcmp(s118, sf8, 0x20) as u32
																if (l == 0) {
																	st64(a + 0x60, output_vault_mint_box)
																	st64(a + 0x58, ld64(s458))
																	st64(a + 0x50, ld64(s450))
																	st64(a + 0x48, ld64(s448))
																	st64(a + 0x40, ld64(s440))
																	st64(a + 0x38, ld64(s438))
																	st64(a + 0x30, ld64(s430))
																	st64(a + 0x28, ld64(s420))
																	st64(a + 0x20, ld64(s428))
																	st64(a + 0x18, ld64(s418))
																	st64(a + 0x10, ld64(s410))
																	st64(a + 8, k & -8)
																	st64(a, i)
																	return l
																}
																anchor_error_from(s3e8, 0x7dc /* anchor::ConstraintAddress */)
																const ca = fn_4130(s3f8, ld64(s3e8), ld64(s3e8 + 8), "output_vault_mint", 0x11)
																const bz = ld64(s3f8 + 8)
																const by = ld64(s3f8)
																copy(sd8, s118, 0x40)
																l = Error_with_pubkeys(s408, by, bz, sd8, ca)
																f = ld64(s408)
																st64(a + 0x10, ld64(s408 + 8))
																st64(a + 8, f)
																st64(a, 0)
																return l
															}
															anchor_error_from(s3b8, 0x7dc /* anchor::ConstraintAddress */)
															const bv = fn_4130(s3c8, ld64(s3b8), ld64(s3b8 + 8), "input_vault_mint", 0x10)
															const bu = ld64(s3c8 + 8)
															const bt = ld64(s3c8)
															copy(sd8, s158, 0x40)
															l = Error_with_pubkeys(s3d8, bt, bu, sd8, bv)
															f = ld64(s3d8)
															st64(a + 0x10, ld64(s3d8 + 8))
															st64(a + 8, f)
															st64(a, 0)
															return l
														}
														anchor_error_from(s388, 0x7dc /* anchor::ConstraintAddress */)
														const bq = fn_4130(s398, ld64(s388), ld64(s388 + 8), "observation_state", 0x11)
														const bp = ld64(s398 + 8)
														const bo = ld64(s398)
														copy(sd8, s198, 0x40)
														l = Error_with_pubkeys(s3a8, bo, bp, sd8, bq)
														f = ld64(s3a8)
														st64(a + 0x10, ld64(s3a8 + 8))
														st64(a + 8, f)
														st64(a, 0)
														return l
													}
													anchor_error_from(s368, 0x7d0 /* anchor::ConstraintMut */)
													l = fn_4130(s378, ld64(s368), ld64(s368 + 8), "observation_state", 0x11)
													f = ld64(s378)
													st64(a + 0x10, ld64(s378 + 8))
													st64(a + 8, f)
													st64(a, 0)
													return l
												}
												anchor_error_from(s348, 0x7d0 /* anchor::ConstraintMut */)
												l = fn_4130(s358, ld64(s348), ld64(s348 + 8), "output_vault", 0xc)
												f = ld64(s358)
												st64(a + 0x10, ld64(s358 + 8))
												st64(a + 8, f)
												st64(a, 0)
												return l
											}
											anchor_error_from(s328, 0x7d0 /* anchor::ConstraintMut */)
											l = fn_4130(s338, ld64(s328), ld64(s328 + 8), 0x10015b11e /* "input_vault" */, 0xb)
											f = ld64(s338)
											st64(a + 0x10, ld64(s338 + 8))
											st64(a + 8, f)
											st64(a, 0)
											return l
										}
										anchor_error_from(s2f8, 0x7d0 /* anchor::ConstraintMut */)
										l = fn_4130(s308, ld64(s2f8), ld64(s2f8 + 8), "output_token_account", 0x14)
										f = ld64(s308)
										st64(a + 0x10, ld64(s308 + 8))
										st64(a + 8, f)
										st64(a, 0)
										return l
									}
									l = anchor_error_from(s2e8, 0x7de /* anchor::ConstraintTokenMint */)
									f = ld64(s2e8)
									st64(a + 0x10, ld64(s2e8 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return l
								}
								anchor_error_from(s2b8, 0x7d0 /* anchor::ConstraintMut */, bi)
								l = fn_4130(s2c8, ld64(s2b8), ld64(s2b8 + 8), "input_token_account", 0x13)
								f = ld64(s2c8)
								st64(a + 0x10, ld64(s2c8 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
							anchor_error_from(s298, 0x7d0 /* anchor::ConstraintMut */)
							l = fn_4130(s2a8, ld64(s298), ld64(s298 + 8), "pool_state", 0xa)
							f = ld64(s2a8)
							st64(a + 0x10, ld64(s2a8 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return l
						}
						anchor_error_from(s268, 0x7dc /* anchor::ConstraintAddress */)
						const bh = fn_4130(s278, ld64(s268), ld64(s268 + 8), 0x10015af4d /* "amm_config" */, 0xa)
						const bg = ld64(s278 + 8)
						const bf = ld64(s278)
						copy(sd8, s1d8, 0x40)
						l = Error_with_pubkeys(s288, bf, bg, sd8, bh)
						f = ld64(s288)
						st64(a + 0x10, ld64(s288 + 8))
						st64(a + 8, f)
						st64(a, 0)
						return l
					}
					alloc_handle_alloc_error(8, 0xd8)
				}
				alloc_handle_alloc_error(8, 0xd8)
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
// types [heur]: b: SwapV2Context (the handler ix_swap_v2 passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_414a8(a: u64, b: SwapV2Context, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158
	const i = b.remaining_accounts_len
	const remaining_accounts: AccountInfo = b.remaining_accounts
	const accounts: SwapV2Accounts = b.accounts
	const f = p7
	let l = fn_3e038(s118, accounts, remaining_accounts, i, c, p5, p6, f)
	let j = ld64(s118)
	if (j != 2) {
		st64(a + 8, ld64(s118 + 8))
		st64(a, j)
		return l
	}
	const k = ld64(s118 + 8)
	if (f != 0) {
		if (d > k) {
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
			st64(s118 + 8, 0x100159ffe)
			st32(sf8 + 0x78, 0x1782 /* error::TooLittleOutputReceived */)
			st8(sf8 + 0x30, 2)
			st32(s118 + 0x18, 0x16c)
			st64(s118 + 0x10, 0x28)
			st64(s118, 0)
			fn_13e5a0(s148, s118)
			l = fn_1730(s158, ld64(s148), ld64(s148 + 8), k, d)
			j = ld64(s158)
			st64(a + 8, ld64(s158 + 8))
			st64(a, j)
			return l
		}
		st64(a + 8, undef)
		st64(a, 2)
		return l
	}
	if (k > d) {
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
		st64(s118 + 8, 0x100159ffe)
		st32(sf8 + 0x78, 0x1783 /* error::TooMuchInputPaid */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x172)
		st64(s118 + 0x10, 0x28)
		st64(s118, 0)
		fn_13e5a0(s128, s118)
		l = fn_1730(s138, ld64(s128), ld64(s128 + 8), d, k)
		j = ld64(s138)
		st64(a + 8, ld64(s138 + 8))
		st64(a, j)
		return l
	}
	st64(a + 8, undef)
	st64(a, 2)
	return l
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: observation_state
export function fn_ba658(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88
	let m: u64
	let y = fn_a80(s28, ld64(b + 0x10), c)
	let f = ld64(s28)
	if (f != 2) {
		const n = ld64(0x300000000 /* heap bump-allocator cursor */)
		const o = n != 0 ? sat_sub(n, 0xa) : 0x300007ff6
		m = ld64(s28 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > o) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > n)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, o)
			st64(o, 0x6174735f6c6f6f70)
			st16(o + 8, 0x6574)
			void ld64(m)
		} else {
			if (0x300000008 > o) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > n)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, o)
			st64(o, 0x6174735f6c6f6f70)
			st16(o + 8, 0x6574)
			void ld64(m)
		}
		st64(m + 0x10, o, 0xa)
		st64(m + 8, 0xa)
		st64(m, 1)
		st64(a + 8, m)
		st64(a, f)
		return y
	}
	const g = ld64(b + 0x18)
	const h = ld64(g + 0x20)
	if ((memcmp(g, c, 0x20) as u32) == 0 && (common_is_closed(h) == 0 && ld64(ld64(h + 0x10) + 0x10) != 0)) {
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		y = fn_13e628(s38, s18)
		f = ld64(s38)
		if (f != 2) {
			const z = ld64(0x300000000 /* heap bump-allocator cursor */)
			const aa = z != 0 ? sat_sub(z, 0x13) : 0x300007fed
			m = ld64(s38 + 8)
			if ((f & 1) != 0) {
				if (0x300000008 > aa) {
					raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008, 0x13 > z)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, aa)
				st64(aa + 8, 0x6f6363615f6e656b)
				st64(aa, 0x6f745f7475706e69)
				st32(aa + 0xf, 0x746e756f)
				void ld64(m)
			} else {
				if (0x300000008 > aa) {
					raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008, 0x13 > z)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, aa)
				st64(aa + 8, 0x6f6363615f6e656b)
				st64(aa, 0x6f745f7475706e69)
				st32(aa + 0xf, 0x746e756f)
				void ld64(m)
			}
			st64(m + 0x10, aa, 0x13)
			st64(m + 8, 0x13)
			st64(m, 1)
			st64(a + 8, m)
			st64(a, f)
			return y
		}
	}
	const i = ld64(b + 0x20)
	const j = ld64(i + 0x20)
	if ((memcmp(i, c, 0x20) as u32) == 0 && (common_is_closed(j) == 0 && ld64(ld64(j + 0x10) + 0x10) != 0)) {
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		y = fn_13e628(s48, s18)
		f = ld64(s48)
		if (f != 2) {
			const k = ld64(0x300000000 /* heap bump-allocator cursor */)
			const l = k != 0 ? sat_sub(k, 0x14) : 0x300007fec
			m = ld64(s48 + 8)
			if ((f & 1) != 0) {
				if (0x300000008 > l) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > k)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, l)
				st64(l + 8, 0x6363615f6e656b6f)
				st64(l, 0x745f74757074756f)
				st32(l + 0x10, 0x746e756f)
				void ld64(m)
			} else {
				if (0x300000008 > l) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > k)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, l)
				st64(l + 8, 0x6363615f6e656b6f)
				st64(l, 0x745f74757074756f)
				st32(l + 0x10, 0x746e756f)
				void ld64(m)
			}
			st64(m + 0x10, l, 0x14)
			st64(m + 8, 0x14)
			st64(m, 1)
			st64(a + 8, m)
			st64(a, f)
			return y
		}
	}
	const p = ld64(b + 0x28)
	const q = ld64(p + 0x20)
	if ((memcmp(p, c, 0x20) as u32) == 0 && (common_is_closed(q) == 0 && ld64(ld64(q + 0x10) + 0x10) != 0)) {
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		y = fn_13e628(s58, s18)
		f = ld64(s58)
		if (f != 2) {
			const r = ld64(0x300000000 /* heap bump-allocator cursor */)
			const s = r != 0 ? sat_sub(r, 0xb) : 0x300007ff5
			m = ld64(s58 + 8)
			if ((f & 1) != 0) {
				if (0x300000008 > s) {
					raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, 0xb > r)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, s)
				st64(s, 0x61765f7475706e69)
				st32(s + 7, 0x746c7561)
				void ld64(m)
			} else {
				if (0x300000008 > s) {
					raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, 0xb > r)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, s)
				st64(s, 0x61765f7475706e69)
				st32(s + 7, 0x746c7561)
				void ld64(m)
			}
			st64(m + 0x10, s, 0xb)
			st64(m + 8, 0xb)
			st64(m, 1)
			st64(a + 8, m)
			st64(a, f)
			return y
		}
	}
	const t = ld64(b + 0x30)
	const u = ld64(t + 0x20)
	if ((memcmp(t, c, 0x20) as u32) == 0 && (common_is_closed(u) == 0 && ld64(ld64(u + 0x10) + 0x10) != 0)) {
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		y = fn_13e628(s68, s18)
		f = ld64(s68)
		if (f != 2) {
			const v = ld64(0x300000000 /* heap bump-allocator cursor */)
			const w = v != 0 ? sat_sub(v, 0xc) : 0x300007ff4
			m = ld64(s68 + 8)
			if ((f & 1) != 0) {
				if (0x300000008 > w) {
					raw_vec_handle_error(1, 0xc, 0x10015f8f8, 0x300000008, 0xc > v)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, w)
				st64(w, 0x765f74757074756f)
				st32(w + 8, 0x746c7561)
				void ld64(m)
			} else {
				if (0x300000008 > w) {
					raw_vec_handle_error(1, 0xc, 0x10015f8f8, 0x300000008, 0xc > v)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, w)
				st64(w, 0x765f74757074756f)
				st32(w + 8, 0x746c7561)
				void ld64(m)
			}
			st64(m + 0x10, w, 0xc)
			st64(m + 8, 0xc)
			st64(m, 1)
			st64(a + 8, m)
			st64(a, f)
			return y
		}
	}
	y = fn_8a8(s78, ld64(b + 0x38), c)
	m = undef
	const x = ld64(s78)
	if (x == 2) {
		st64(a + 8, m)
		st64(a, 2)
		return y
	}
	y = fn_4130(s88, x, ld64(s78 + 8), "observation_state", 0x11)
	f = ld64(s88)
	st64(a + 8, ld64(s88 + 8))
	st64(a, f)
	return y
}
