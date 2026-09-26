/// <reference path="../lib.d.ts" />
// instruction increase_liquidity_v2
import { anchor_error_from, fn_1008, fn_13e5a0, fn_13e628, fn_14ed60, fn_17748, fn_2aa40, fn_4130, fn_4bd8, fn_4dc0, fn_85138, fn_88558, fn_a80, fn_b4e0, memcpy } from '../shared.ts'

// instruction handler: increase_liquidity_v2 (discriminator sha256("global:increase_liquidity_v2")[..8] = 0xab0ee45df591d85)
// accounts [idl]: 0 nft_owner [signer], 1 nft_account, 2 pool_state [mut], 3 protocol_position, 4 personal_position [mut], 5 tick_array_lower [mut], 6 tick_array_upper [mut], 7 token_account_0 [mut], 8 token_account_1 [mut], 9 token_vault_0 [mut], 10 token_vault_1 [mut], 11 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 12 token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb], 13 vault_0_mint, 14 vault_1_mint
// args [idl]: liquidity: u128, amount_0_max: u64, amount_1_max: u64, base_flag: Option<bool>
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, amount_0_max, amount_1_max
export function ix_increase_liquidity_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s60 = fp - 0x60, s68 = fp - 0x68, s78 = fp - 0x78, sd8 = fp - 0xd8, sf0 = fp - 0xf0, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s1000 = fp - 0x1000
	let j, m, n, o, p, q: u64
	B6: {
		const i = sol_log("Instruction: IncreaseLiquidityV2", 0x20)
		const f = ix_args_len
		if (f >= 0x10 && ((f & -8) != 0x10 && (f & -8) != 0x18)) {
			const args: IncreaseLiquidityV2Args = ix_args
			const t = ld64(args.liquidity + 8)
			const y = ld64(args.liquidity)
			const amount_0_max = args.amount_0_max
			const amount_1_max = args.amount_1_max
			st64(sf0, args + 0x20, f - 0x20)
			const r = fn_17748(s78, sf0, amount_1_max, undef, undef, i)
			if (ld8(s78) != 0) {
				j = ld64(s78 + 8)
				break B6
			}
			const w = ld8(s78 + 1)
			st64(s100, accounts, accounts_len)
			q = accounts_increase_liquidity_v2(s78, undef, s100, n, fp, r)
			const s = ld64(s78)
			if (s == 0) {
				p = ld64(s78 + 8)
				st64(a + 8, ld64(s68))
				st64(a, p)
				return q
			}
			const v = ld64(s78 + 8)
			const u = ld64(s68)
			memcpy(sd8, s60, 0x60)
			st64(sf0, s, v, u)
			copyr(s68, s100, 0x10)
			st64(s78, program_id, sf0)
			st64(s1000, amount_0_max, amount_1_max, w)
			q = fn_11df50(s110, s78, y, t, amount_0_max, amount_1_max, w)
			p = ld64(s110)
			if (p == 2) {
				q = fn_ae830(s120, sf0, program_id)
				p = ld64(s120)
				st64(a + 8, ld64(s120 + 8))
				st64(a, p)
				return q
			}
			st64(a + 8, ld64(s110 + 8))
			st64(a, p)
			return q
		}
		j = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	}
	const k = j
	if (2 > (j & 3) - 2) {
		q = anchor_error_from(s130, 0x66 /* anchor::InstructionDidNotDeserialize */, m, n, o)
		p = ld64(s130)
		st64(a + 8, ld64(s130 + 8))
		st64(a, p)
		return q
	}
	if ((k & 3) == 0) {
		q = anchor_error_from(s130, 0x66 /* anchor::InstructionDidNotDeserialize */, m, n, o)
		p = ld64(s130)
		st64(a + 8, ld64(s130 + 8))
		st64(a, p)
		return q
	}
	const l = ld64(ld64(j + 7))
	if (l == 0) {
		q = anchor_error_from(s130, 0x66 /* anchor::InstructionDidNotDeserialize */, m, n, o)
		p = ld64(s130)
		st64(a + 8, ld64(s130 + 8))
		st64(a, p)
		return q
	}
	callx(l, ld64(j - 1), l)
	q = anchor_error_from(s130, 0x66 /* anchor::InstructionDidNotDeserialize */)
	p = ld64(s130)
	st64(a + 8, ld64(s130 + 8))
	st64(a, p)
	return q
}

// Anchor Accounts::try_accounts of instruction increase_liquidity_v2 (called by ix_increase_liquidity_v2; name [str]: from the handler's "Instruction: …" log; was fn_ac250)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: tick_array_lower (ConstraintMut, ConstraintRaw), tick_array_upper (ConstraintMut, ConstraintRaw), token_account_0 (ConstraintMut), token_account_1 (ConstraintMut), token_vault_0 (ConstraintMut, ConstraintRaw), token_vault_1 (ConstraintMut, ConstraintRaw), token_program, token_program_2022, vault_0_mint (ConstraintAddress), vault_1_mint (ConstraintAddress), nft_account (ConstraintRaw), personal_position (ConstraintMut, ConstraintRaw), pool_state (ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: vault_0_mint_box, vault_1_mint_box, token_vault_0_box, token_vault_1_box, token_vault_0_box_2, token_vault_1_box_2, pool_state [idl], token_vault_0, token_vault_1
export function accounts_increase_liquidity_v2(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s120 = fp - 0x120, s140 = fp - 0x140, s160 = fp - 0x160, s180 = fp - 0x180, s1a0 = fp - 0x1a0, s1b8 = fp - 0x1b8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s500 = fp - 0x500, s508 = fp - 0x508, s510 = fp - 0x510, s518 = fp - 0x518, s520 = fp - 0x520, s528 = fp - 0x528, s530 = fp - 0x530, s538 = fp - 0x538, s540 = fp - 0x540, s548 = fp - 0x548, s550 = fp - 0x550, s558 = fp - 0x558, s560 = fp - 0x560
	let s, t, u, z, ae, af, ah, ai, ak, al, an, ao, aq, ar, au, av, ax, ay, ba, bb, bd, be, bh: u64
	let vault_0_mint_box: Mint
	let q = try_accounts_17a30(s120, c, c, d, e, r0)
	const i = ld64(s120 + 8)
	let f = ld64(s120)
	if (f == 2) {
		q = try_accounts_1678(s120, c)
		if (ld32(s120 + 0xb0) == 2) {
			const l = ld64(0x300000000 /* heap bump-allocator cursor */)
			f = ld64(s120)
			const m = l != 0 ? sat_sub(l, 0xb) : 0x300007ff5
			vault_0_mint_box = ld64(s120 + 8)
			if (f != 0) {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m, 0x6f6363615f74666e)
				st32(m + 7, 0x746e756f)
				void ld64(vault_0_mint_box)
			} else {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m, 0x6f6363615f74666e)
				st32(m + 7, 0x746e756f)
				void ld64(vault_0_mint_box)
			}
			st64(vault_0_mint_box.mint_authority + 0xc, m, 0xb)
			st64(vault_0_mint_box.mint_authority + 4, 0xb)
			st64(vault_0_mint_box, 1)
			st64(a + 0x10, vault_0_mint_box)
			st64(a + 8, f)
			st64(a, 0)
			return q
		}
		const j = ld64(0x300000000 /* heap bump-allocator cursor */)
		const k = j != 0 ? sat_sub(j, 0xd8) : 0x300007f28
		if (0x300000008 > k) {
			alloc_handle_alloc_error(8, 0xd8)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, k & -8)
		if ((k & -8) != 0) {
			memcpy(k & -8, s120, 0xd8)
			fn_11e0(s120, c)
			q = ld64(s120 + 8)
			f = ld64(s120)
			if (f == 2) {
				st64(s500, q)
				const r = ld64(c + 8)
				if (r == 0) {
					anchor_error_from(s1e8, 0xbbd /* anchor::AccountNotEnoughKeys */, s, t, u)
					q = ld64(s1e8 + 8)
					f = ld64(s1e8)
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
				st64(s508, q)
				q = try_accounts_18368(s120, c, s, t, u)
				z = undef
				if (ld64(s120) == 0) {
					const ac = ld64(0x300000000 /* heap bump-allocator cursor */)
					f = ld64(s120 + 8)
					const ad = ac != 0 ? sat_sub(ac, 0x11) : 0x300007fef
					vault_0_mint_box = ld64(s120 + 0x10)
					if (f != 0) {
						if (0x300000008 > ad) {
							raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, z)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ad)
						st64(ad + 8, 0x6f697469736f705f)
						st64(ad, 0x6c616e6f73726570)
						st8(ad + 0x10, 0x6e)
						void ld64(vault_0_mint_box)
					} else {
						if (0x300000008 > ad) {
							raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, z)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ad)
						st64(ad + 8, 0x6f697469736f705f)
						st64(ad, 0x6c616e6f73726570)
						st8(ad + 0x10, 0x6e)
						void ld64(vault_0_mint_box)
					}
					st64(vault_0_mint_box.mint_authority + 0xc, ad, 0x11)
					st64(vault_0_mint_box.mint_authority + 4, 0x11)
					st64(vault_0_mint_box, 1)
					st64(a + 0x10, vault_0_mint_box)
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
					st64(s510, w & -8)
					memcpy(w & -8, s120, 0x120)
					fn_13d0(s120, c)
					vault_0_mint_box = ld64(s120 + 8)
					const x = ld64(s120)
					if (x != 2) {
						q = fn_4130(s1f8, x, vault_0_mint_box, "tick_array_lower", 0x10)
						vault_0_mint_box = ld64(s1f8 + 8)
						f = ld64(s1f8)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s518, vault_0_mint_box)
					fn_13d0(s120, c, vault_0_mint_box, ae, af)
					vault_0_mint_box = ld64(s120 + 8)
					const ag = ld64(s120)
					if (ag != 2) {
						q = fn_4130(s208, ag, vault_0_mint_box, "tick_array_upper", 0x10)
						vault_0_mint_box = ld64(s208 + 8)
						f = ld64(s208)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s520, vault_0_mint_box)
					fn_7498(s120, c, vault_0_mint_box, ah, ai)
					vault_0_mint_box = ld64(s120 + 8)
					const aj = ld64(s120)
					if (aj != 2) {
						q = fn_4130(s218, aj, vault_0_mint_box, "token_account_0", 0xf)
						vault_0_mint_box = ld64(s218 + 8)
						f = ld64(s218)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s528, vault_0_mint_box)
					fn_7498(s120, c, vault_0_mint_box, ak, al)
					vault_0_mint_box = ld64(s120 + 8)
					const am = ld64(s120)
					if (am != 2) {
						q = fn_4130(s228, am, vault_0_mint_box, "token_account_1", 0xf)
						vault_0_mint_box = ld64(s228 + 8)
						f = ld64(s228)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s530, vault_0_mint_box)
					fn_7498(s120, c, vault_0_mint_box, an, ao)
					vault_0_mint_box = ld64(s120 + 8)
					const ap = ld64(s120)
					if (ap != 2) {
						q = fn_4130(s238, ap, vault_0_mint_box, "token_vault_0", 0xd)
						vault_0_mint_box = ld64(s238 + 8)
						f = ld64(s238)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s538, vault_0_mint_box)
					fn_7498(s120, c, vault_0_mint_box, aq, ar)
					vault_0_mint_box = ld64(s120 + 8)
					const at = ld64(s120)
					if (at != 2) {
						q = fn_4130(s248, at, vault_0_mint_box, "token_vault_1", 0xd)
						vault_0_mint_box = ld64(s248 + 8)
						f = ld64(s248)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s540, vault_0_mint_box)
					try_accounts_19190(s120, c, vault_0_mint_box, au, av)
					vault_0_mint_box = ld64(s120 + 8)
					const aw = ld64(s120)
					if (aw != 2) {
						q = fn_4130(s258, aw, vault_0_mint_box, 0x10015b020 /* "token_program" */, 0xd)
						vault_0_mint_box = ld64(s258 + 8)
						f = ld64(s258)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s548, vault_0_mint_box)
					fn_18cf0(s120, c, vault_0_mint_box, ax, ay)
					vault_0_mint_box = ld64(s120 + 8)
					const az = ld64(s120)
					if (az != 2) {
						q = fn_4130(s268, az, vault_0_mint_box, "token_program_2022", 0x12)
						vault_0_mint_box = ld64(s268 + 8)
						f = ld64(s268)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s550, vault_0_mint_box)
					fn_7768(s120, c, vault_0_mint_box, ba, bb)
					vault_0_mint_box = ld64(s120 + 8)
					const bc = ld64(s120)
					if (bc != 2) {
						q = fn_4130(s278, bc, vault_0_mint_box, "vault_0_mint", 0xc)
						vault_0_mint_box = ld64(s278 + 8)
						f = ld64(s278)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s558, vault_0_mint_box)
					fn_7768(s120, c, vault_0_mint_box, bd, be)
					let vault_1_mint_box: Mint = ld64(s120 + 8)
					const bf = ld64(s120)
					if (bf != 2) {
						q = fn_4130(s288, bf, vault_1_mint_box, "vault_1_mint", 0xc)
						vault_1_mint_box = ld64(s288 + 8)
						f = ld64(s288)
						bh = ld64(s510)
						if (f != 2) {
							st64(a + 0x10, vault_1_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					} else {
						bh = ld64(s510)
					}
					if ((memcmp((k & -8) + 0x28, bh + 8, 0x20) as u32) == 0) {
						if (ld64((k & -8) + 0x68) != 1) {
							anchor_error_from(s2b8, 0x7d3 /* anchor::ConstraintRaw */)
							q = fn_4130(s2c8, ld64(s2b8), ld64(s2b8 + 8), 0x10015b0ae /* "nft_account" */, 0xb)
							f = ld64(s2c8)
							st64(a + 0x10, ld64(s2c8 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
						const bi = ld64(i)
						copyr(s120, bi, 0x20)
						if ((memcmp((k & -8) + 0x48, s120, 0x20) as u32) == 0) {
							const pool_state: AccountInfo = ld64(s500)
							if (pool_state.is_writable != 0) {
								const bk = ld64(s510)
								if (ld8(ld64(bk) + 0x29) != 0) {
									const bl = pool_state.key
									copyr(s1d8, bl, 0x20)
									const bm = memcmp(bk + 0x28, s1d8, 0x20)
									if ((bm as u32) == 0) {
										if (ld8(ld64(s518) + 0x29) != 0) {
											q = fn_4bd8(s120, ld64(s518), bm as u32)
											st64(s560, ld64(s120 + 0x10))
											f = ld64(s120 + 8)
											if (ld64(s120) != 0) {
												st64(a + 0x10, ld64(s560))
												st64(a + 8, f)
												st64(a, 0)
												return q
											}
											copyr(s120, s1d8, 0x20)
											const bo = memcmp(f, s120, 0x20)
											const bn = ld64(s560)
											st64(bn, ld64(bn) - 1)
											if ((bo as u32) == 0) {
												if (ld8(ld64(s520) + 0x29) != 0) {
													q = fn_4bd8(s120, ld64(s520), bo as u32)
													st64(s560, ld64(s120 + 0x10))
													f = ld64(s120 + 8)
													if (ld64(s120) != 0) {
														st64(a + 0x10, ld64(s560))
														st64(a + 8, f)
														st64(a, 0)
														return q
													}
													copyr(s120, s1d8, 0x20)
													const bq = memcmp(f, s120, 0x20)
													const bp = ld64(s560)
													st64(bp, ld64(bp) - 1)
													if ((bq as u32) == 0) {
														if (ld8(ld64(ld64(s528) + 0x20) + 0x29) != 0) {
															const token_vault_0_box: TokenAccount = ld64(s538)
															copyr(s120, token_vault_0_box.mint, 0x20)
															if ((memcmp(ld64(s528) + 0x28, s120, 0x20) as u32) != 0) {
																q = anchor_error_from(s3e8, 0x7de /* anchor::ConstraintTokenMint */)
																f = ld64(s3e8)
																st64(a + 0x10, ld64(s3e8 + 8))
																st64(a + 8, f)
																st64(a, 0)
																return q
															}
															if (ld8(ld64(ld64(s530) + 0x20) + 0x29) != 0) {
																const token_vault_1_box: TokenAccount = ld64(s540)
																copyr(s120, token_vault_1_box.mint, 0x20)
																const bt = memcmp(ld64(s530) + 0x28, s120, 0x20)
																if ((bt as u32) != 0) {
																	q = anchor_error_from(s418, 0x7de /* anchor::ConstraintTokenMint */)
																	f = ld64(s418)
																	st64(a + 0x10, ld64(s418 + 8))
																	st64(a + 8, f)
																	st64(a, 0)
																	return q
																}
																const token_vault_0: AccountInfo = ld64(ld64(s538) + 0x20)
																if (token_vault_0.is_writable != 0) {
																	const bv = token_vault_0.key
																	copyr(s120, bv, 0x20)
																	q = fn_4dc0(s1b8, ld64(s500), bt as u32)
																	st64(s560, ld64(s1b8 + 0x10))
																	let bw = ld64(s1b8 + 8)
																	if (ld64(s1b8) != 0) {
																		st64(a + 0x10, ld64(s560))
																		st64(a + 8, bw)
																		st64(a, 0)
																		return q
																	}
																	const by = memcmp(s120, bw + 0x81, 0x20)
																	const bx = ld64(s560)
																	st64(bx, ld64(bx) - 1)
																	if ((by as u32) == 0) {
																		const token_vault_1: AccountInfo = ld64(ld64(s540) + 0x20)
																		if (token_vault_1.is_writable != 0) {
																			const ca = token_vault_1.key
																			copyr(s120, ca, 0x20)
																			q = fn_4dc0(s1b8, ld64(s500), by as u32)
																			st64(s560, ld64(s1b8 + 0x10))
																			bw = ld64(s1b8 + 8)
																			if (ld64(s1b8) != 0) {
																				st64(a + 0x10, ld64(s560))
																				st64(a + 8, bw)
																				st64(a, 0)
																				return q
																			}
																			const cc = memcmp(s120, bw + 0xa1, 0x20)
																			const cb = ld64(s560)
																			st64(cb, ld64(cb) - 1)
																			if ((cc as u32) == 0) {
																				const token_vault_0_box_2: TokenAccount = ld64(s538)
																				const ce = ld64(ld64(ld64(s558) + 0x58))
																				copyr(s1a0, ce, 0x20)
																				copy(s180, token_vault_0_box_2.mint, 0x20)
																				if ((memcmp(s1a0, s180, 0x20) as u32) != 0) {
																					anchor_error_from(s4a8, 0x7dc /* anchor::ConstraintAddress */)
																					const cm = fn_4130(s4b8, ld64(s4a8), ld64(s4a8 + 8), "vault_0_mint", 0xc)
																					const cl = ld64(s4b8 + 8)
																					const ck = ld64(s4b8)
																					copy(s120, s1a0, 0x40)
																					q = Error_with_pubkeys(s4c8, ck, cl, s120, cm)
																					f = ld64(s4c8)
																					st64(a + 0x10, ld64(s4c8 + 8))
																					st64(a + 8, f)
																					st64(a, 0)
																					return q
																				}
																				const token_vault_1_box_2: TokenAccount = ld64(s540)
																				const cg = vault_1_mint_box.info.key
																				copyr(s160, cg, 0x20)
																				copy(s140, token_vault_1_box_2.mint, 0x20)
																				q = memcmp(s160, s140, 0x20) as u32
																				if (q == 0) {
																					st64(a + 0x70, vault_1_mint_box)
																					st64(a + 0x68, ld64(s558))
																					st64(a + 0x60, ld64(s550))
																					st64(a + 0x58, ld64(s548))
																					st64(a + 0x50, ld64(s540))
																					st64(a + 0x48, ld64(s538))
																					st64(a + 0x40, ld64(s530))
																					st64(a + 0x38, ld64(s528))
																					st64(a + 0x30, ld64(s520))
																					st64(a + 0x28, ld64(s518))
																					st64(a + 0x20, ld64(s510))
																					st64(a + 0x18, ld64(s508))
																					st64(a + 0x10, ld64(s500))
																					st64(a + 8, k & -8)
																					st64(a, i)
																					return q
																				}
																				anchor_error_from(s4d8, 0x7dc /* anchor::ConstraintAddress */)
																				const cj = fn_4130(s4e8, ld64(s4d8), ld64(s4d8 + 8), "vault_1_mint", 0xc)
																				const ci = ld64(s4e8 + 8)
																				const ch = ld64(s4e8)
																				copy(s120, s160, 0x40)
																				q = Error_with_pubkeys(s4f8, ch, ci, s120, cj)
																				f = ld64(s4f8)
																				st64(a + 0x10, ld64(s4f8 + 8))
																				st64(a + 8, f)
																				st64(a, 0)
																				return q
																			}
																			anchor_error_from(s488, 0x7d3 /* anchor::ConstraintRaw */)
																			q = fn_4130(s498, ld64(s488), ld64(s488 + 8), "token_vault_1", 0xd)
																			f = ld64(s498)
																			st64(a + 0x10, ld64(s498 + 8))
																			st64(a + 8, f)
																			st64(a, 0)
																			return q
																		}
																		anchor_error_from(s468, 0x7d0 /* anchor::ConstraintMut */)
																		q = fn_4130(s478, ld64(s468), ld64(s468 + 8), "token_vault_1", 0xd)
																		f = ld64(s478)
																		st64(a + 0x10, ld64(s478 + 8))
																		st64(a + 8, f)
																		st64(a, 0)
																		return q
																	}
																	anchor_error_from(s448, 0x7d3 /* anchor::ConstraintRaw */)
																	q = fn_4130(s458, ld64(s448), ld64(s448 + 8), "token_vault_0", 0xd)
																	f = ld64(s458)
																	st64(a + 0x10, ld64(s458 + 8))
																	st64(a + 8, f)
																	st64(a, 0)
																	return q
																}
																anchor_error_from(s428, 0x7d0 /* anchor::ConstraintMut */)
																q = fn_4130(s438, ld64(s428), ld64(s428 + 8), "token_vault_0", 0xd)
																f = ld64(s438)
																st64(a + 0x10, ld64(s438 + 8))
																st64(a + 8, f)
																st64(a, 0)
																return q
															}
															anchor_error_from(s3f8, 0x7d0 /* anchor::ConstraintMut */)
															q = fn_4130(s408, ld64(s3f8), ld64(s3f8 + 8), "token_account_1", 0xf)
															f = ld64(s408)
															st64(a + 0x10, ld64(s408 + 8))
															st64(a + 8, f)
															st64(a, 0)
															return q
														}
														anchor_error_from(s3c8, 0x7d0 /* anchor::ConstraintMut */)
														q = fn_4130(s3d8, ld64(s3c8), ld64(s3c8 + 8), "token_account_0", 0xf)
														f = ld64(s3d8)
														st64(a + 0x10, ld64(s3d8 + 8))
														st64(a + 8, f)
														st64(a, 0)
														return q
													}
													anchor_error_from(s3a8, 0x7d3 /* anchor::ConstraintRaw */)
													q = fn_4130(s3b8, ld64(s3a8), ld64(s3a8 + 8), "tick_array_upper", 0x10)
													f = ld64(s3b8)
													st64(a + 0x10, ld64(s3b8 + 8))
													st64(a + 8, f)
													st64(a, 0)
													return q
												}
												anchor_error_from(s388, 0x7d0 /* anchor::ConstraintMut */)
												q = fn_4130(s398, ld64(s388), ld64(s388 + 8), "tick_array_upper", 0x10)
												f = ld64(s398)
												st64(a + 0x10, ld64(s398 + 8))
												st64(a + 8, f)
												st64(a, 0)
												return q
											}
											anchor_error_from(s368, 0x7d3 /* anchor::ConstraintRaw */)
											q = fn_4130(s378, ld64(s368), ld64(s368 + 8), "tick_array_lower", 0x10)
											f = ld64(s378)
											st64(a + 0x10, ld64(s378 + 8))
											st64(a + 8, f)
											st64(a, 0)
											return q
										}
										anchor_error_from(s348, 0x7d0 /* anchor::ConstraintMut */)
										q = fn_4130(s358, ld64(s348), ld64(s348 + 8), "tick_array_lower", 0x10)
										f = ld64(s358)
										st64(a + 0x10, ld64(s358 + 8))
										st64(a + 8, f)
										st64(a, 0)
										return q
									}
									anchor_error_from(s328, 0x7d3 /* anchor::ConstraintRaw */)
									q = fn_4130(s338, ld64(s328), ld64(s328 + 8), 0x10015b06a /* "personal_position" */, 0x11)
									f = ld64(s338)
									st64(a + 0x10, ld64(s338 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return q
								}
								anchor_error_from(s308, 0x7d0 /* anchor::ConstraintMut */, bk)
								q = fn_4130(s318, ld64(s308), ld64(s308 + 8), 0x10015b06a /* "personal_position" */, 0x11)
								f = ld64(s318)
								st64(a + 0x10, ld64(s318 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return q
							}
							anchor_error_from(s2e8, 0x7d0 /* anchor::ConstraintMut */)
							q = fn_4130(s2f8, ld64(s2e8), ld64(s2e8 + 8), "pool_state", 0xa)
							f = ld64(s2f8)
							st64(a + 0x10, ld64(s2f8 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
						q = anchor_error_from(s2d8, 0x7df /* anchor::ConstraintTokenOwner */)
						f = ld64(s2d8)
						st64(a + 0x10, ld64(s2d8 + 8))
						st64(a + 8, f)
						st64(a, 0)
						return q
					}
					anchor_error_from(s298, 0x7d3 /* anchor::ConstraintRaw */)
					q = fn_4130(s2a8, ld64(s298), ld64(s298 + 8), 0x10015b0ae /* "nft_account" */, 0xb)
					f = ld64(s2a8)
					st64(a + 0x10, ld64(s2a8 + 8))
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
		alloc_handle_alloc_error(8, 0xd8)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), p5 (value), p6 (value)
// types [heur]: b: IncreaseLiquidityV2Context (the handler ix_increase_liquidity_v2 passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_11df50(a: u64, b: IncreaseLiquidityV2Context, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let i, j: u64
	const f = p7
	const g = p6
	const h = p5
	if ((c | d) == 0 && (f as u8) == 2) {
		fn_85138(s78, 0x1001598fc)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_88558(0x1001598fc, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(sf8, s78, 0x30)
		st64(s118 + 8, 0x10015b659)
		st32(sf8 + 0x78, 0x17a0 /* error::MissingBaseFlag */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x22e)
		st64(s118 + 0x10, 0x17)
		st64(s118, 0)
		j = fn_13e5a0(s138, s118)
		i = ld64(s138 + 8)
		st64(a, ld64(s138))
		st64(a + 8, i)
		return j
	}
	j = fn_2c3e0(s128, b, c, d, h, g, f)
	i = ld64(s128 + 8)
	st64(a, ld64(s128))
	st64(a + 8, i)
	return j
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value)
// types [heur]: b: IncreaseLiquidityV2Context (every call passes one: fn_11df50)
export function fn_2c3e0(a: u64, b: IncreaseLiquidityV2Context, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s28 = fp - 0x28, s30 = fp - 0x30, s38 = fp - 0x38, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60, s68 = fp - 0x68, s80 = fp - 0x80, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sd0 = fp - 0xd0, s1000 = fp - 0x1000
	const accounts: IncreaseLiquidityV2Accounts = b.accounts
	const g: AccountInfo = accounts.token_account_0.info
	const h: LamportsCell = g.lamports
	const o = g.key
	rc_inc(h)
	const i: DataCell = g.data
	const bc = p7
	const bd = p6
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
	const am = af.key
	rc_inc(ag)
	const ah: DataCell = af.data
	rc_inc(ah)
	const al = af.owner
	const ak = af.rent_epoch
	const aj = af.is_signer
	const ai = af.is_writable
	st8(s8 + 2, af.executable)
	st8(s8, aj, ai)
	st64(s30, am, ag, ah, al, ak)
	const an = ld64(0x300000000 /* heap bump-allocator cursor */)
	const ao = an != 0 ? sat_sub(an, 0x80) & -8 : 0x300007f80
	if (ao > 0x300000007) {
		const vault_0_mint: Mint = accounts.vault_0_mint
		st64(0x300000000 /* heap bump-allocator cursor */, ao)
		const aq: AccountInfo = vault_0_mint.info
		memcpy(ao, vault_0_mint, 0x58)
		st64(ao + 0x58, aq)
		st64(ao + 0x78, ld64(vault_0_mint[1].mint_authority + 0x14))
		st64(ao + 0x70, ld64(vault_0_mint[1].mint_authority + 0xc))
		st64(ao + 0x68, ld64(vault_0_mint[1].mint_authority + 4))
		st64(ao + 0x60, ld64(vault_0_mint + 0x60))
		const ar = ld64(0x300000000 /* heap bump-allocator cursor */)
		const at = ar != 0 ? sat_sub(ar, 0x80) & -8 : 0x300007f80
		if (at > 0x300000007) {
			const vault_1_mint: Mint = accounts.vault_1_mint
			st64(0x300000000 /* heap bump-allocator cursor */, at)
			const bb: AccountInfo = vault_1_mint.info
			const ax = memcpy(at, vault_1_mint, 0x58)
			st64(at + 0x58, bb)
			copy(at + 0x60, vault_1_mint + 0x60, 0x20)
			const remaining_accounts: AccountInfo = b.remaining_accounts
			const av = b.remaining_accounts_len
			st64(s1000, accounts + 0x28, accounts + 0x30, sc0, s90, s60, s30, accounts + 0x58, accounts + 0x60, ao, at, remaining_accounts, av, c, d, j, bd, bc)
			let ay = fn_2aa40(sd0, accounts, accounts + 0x10, accounts + 0x20, fp, ax)
			const az = ld64(sd0 + 8)
			const ba = ld64(sd0)
			if (rc_release(ag)) {
				ay = Rc_drop_slow_14df0(s28, ay)
			}
			if (rc_release(ah)) {
				ay = Rc_drop_slow_14df0(s20, ay)
			}
			if (rc_release(y)) {
				ay = Rc_drop_slow_14df0(s58, ay)
			}
			if (rc_release(z)) {
				ay = Rc_drop_slow_14df0(s50, ay)
			}
			if (rc_release(q)) {
				ay = Rc_drop_slow_14df0(s88, ay)
			}
			if (rc_release(r)) {
				ay = Rc_drop_slow_14df0(s80, ay)
			}
			if (rc_release(h)) {
				ay = Rc_drop_slow_14df0(sb8, ay)
			}
			if (!rc_release(i)) {
				st64(a + 8, az)
				st64(a, ba)
				return ay
			}
			ay = Rc_drop_slow_14df0(sb0, ay)
			st64(a + 8, az)
			st64(a, ba)
			return ay
		}
		alloc_handle_alloc_error(8, 0x80)
	}
	alloc_handle_alloc_error(8, 0x80)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_account_1, token_vault_0, token_vault_1
export function fn_ae830(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8
	let i, m, n, ac: u64
	let ab = fn_a80(s28, ld64(b + 0x10), c)
	let f = ld64(s28)
	if (f == 2) {
		ab = fn_b4e0(s38, ld64(b + 0x20), 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
		f = ld64(s38)
		if (f == 2) {
			ab = fn_1008(s48, ld64(b + 0x28), c)
			f = ld64(s48)
			if (f == 2) {
				ab = fn_1008(s58, ld64(b + 0x30), c)
				f = ld64(s58)
				if (f == 2) {
					const p = ld64(b + 0x38)
					const q = ld64(p + 0x20)
					if ((memcmp(p, c, 0x20) as u32) == 0 && (common_is_closed(q) == 0 && ld64(ld64(q + 0x10) + 0x10) != 0)) {
						st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
						ab = fn_13e628(s68, s18)
						f = ld64(s68)
						if (f != 2) {
							const r = ld64(0x300000000 /* heap bump-allocator cursor */)
							const s = r != 0 ? sat_sub(r, 0xf) : 0x300007ff1
							i = ld64(s68 + 8)
							if ((f & 1) != 0) {
								if (0x300000008 > s) {
									raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0xf > r)
								}
								st64(0x300000000 /* heap bump-allocator cursor */, s)
								st64(s + 7, 0x305f746e756f6363)
								st64(s, 0x63615f6e656b6f74)
								void ld64(i)
							} else {
								if (0x300000008 > s) {
									raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0xf > r)
								}
								st64(0x300000000 /* heap bump-allocator cursor */, s)
								st64(s + 7, 0x305f746e756f6363)
								st64(s, 0x63615f6e656b6f74)
								void ld64(i)
							}
							st64(i + 0x10, s, 0xf)
							st64(i + 8, 0xf)
							st64(i, 1)
							st64(a + 8, i)
							st64(a, f)
							return ab
						}
					}
					const t = ld64(b + 0x40)
					const u = ld64(t + 0x20)
					if ((memcmp(t, c, 0x20) as u32) == 0 && (common_is_closed(u) == 0 && ld64(ld64(u + 0x10) + 0x10) != 0)) {
						st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
						fn_13e628(s78, s18)
						const v = ld64(s78)
						if (v != 2) {
							ab = fn_4130(s88, v, ld64(s78 + 8), "token_account_1", 0xf)
							i = ld64(s88 + 8)
							f = ld64(s88)
							if (f != 2) {
								st64(a + 8, i)
								st64(a, f)
								return ab
							}
						}
					}
					const w = ld64(b + 0x48)
					fn_a1d8(s98, ld64(w + 0x20), w, c)
					const x = ld64(s98)
					if (x != 2) {
						ab = fn_4130(sa8, x, ld64(s98 + 8), "token_vault_0", 0xd)
						i = ld64(sa8 + 8)
						f = ld64(sa8)
						if (f != 2) {
							st64(a + 8, i)
							st64(a, f)
							return ab
						}
					}
					const y = ld64(b + 0x50)
					ab = fn_a1d8(sb8, ld64(y + 0x20), y, c)
					i = undef
					const z = ld64(sb8)
					if (z == 2) {
						st64(a + 8, i)
						st64(a, 2)
						return ab
					}
					ab = fn_4130(sc8, z, ld64(sb8 + 8), "token_vault_1", 0xd)
					i = undef
					const aa = ld64(sc8)
					if (aa == 2) {
						st64(a + 8, i)
						st64(a, 2)
						return ab
					}
					st64(a + 8, ld64(sc8 + 8))
					st64(a, aa)
					return ab
				}
				const o = ld64(0x300000000 /* heap bump-allocator cursor */)
				m = 0x10 > o
				n = o != 0 ? m != 0 ? 0 : o - 0x10 : 0x300007ff0
				i = ld64(s58 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > n) {
						raw_vec_handle_error(1, 0x10, 0x10015f8f8, m, ac)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, n)
					st64(n + 8, 0x72657070755f7961)
					st64(n, 0x7272615f6b636974)
					void ld64(i)
				} else {
					if (0x300000008 > n) {
						raw_vec_handle_error(1, 0x10, 0x10015f8f8, m, ac)
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
						raw_vec_handle_error(1, 0x10, 0x10015f8f8, m, ac)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, n)
					st64(n + 8, 0x7265776f6c5f7961)
					st64(n, 0x7272615f6b636974)
					void ld64(i)
				} else {
					if (0x300000008 > n) {
						raw_vec_handle_error(1, 0x10, 0x10015f8f8, m, ac)
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
			return ab
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
		return ab
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
	return ab
}
