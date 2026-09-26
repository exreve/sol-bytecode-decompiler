/// <reference path="../lib.d.ts" />
// instruction open_position_with_token22_nft
import { anchor_error_from, fn_11e480, fn_132bd8, fn_13e5a0, fn_13e628, fn_142568, fn_1476d8, fn_147a20, fn_14ed60, fn_17748, fn_1c850, fn_4130, fn_4dc0, fn_85138, fn_88558, fn_8ed0, fn_a80, fn_b4e0, memcpy } from '../shared.ts'

// instruction handler: open_position_with_token22_nft (discriminator sha256("global:open_position_with_token22_nft")[..8] = 0x2ec91d7d52aeff4d)
// accounts [idl]: 0 payer [signer, mut], 1 position_nft_owner, 2 position_nft_mint [signer, mut], 3 position_nft_account [mut], 4 pool_state [mut], 5 protocol_position, 6 tick_array_lower [mut, pda], 7 tick_array_upper [mut, pda], 8 personal_position [mut, pda], 9 token_account_0 [mut], 10 token_account_1 [mut], 11 token_vault_0 [mut], 12 token_vault_1 [mut], 13 rent [= SysvarRent111111111111111111111111111111111], 14 system_program [= 11111111111111111111111111111111], 15 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 16 associated_token_program [= ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL], 17 token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb], 18 vault_0_mint, 19 vault_1_mint
// args [idl]: tick_lower_index: i32, tick_upper_index: i32, tick_array_lower_start_index: i32, tick_array_upper_start_index: i32, liquidity: u128, amount_0_max: u64, amount_1_max: u64, with_metadata: bool, base_flag: Option<bool>
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args
export function ix_open_position_with_token22_nft(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const sa0 = fp - 0xa0, sa8 = fp - 0xa8, sb8 = fp - 0xb8, s158 = fp - 0x158, s170 = fp - 0x170, s180 = fp - 0x180, s183 = fp - 0x183, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8, s200 = fp - 0x200, s208 = fp - 0x208, s210 = fp - 0x210, s218 = fp - 0x218, s1000 = fp - 0x1000
	let h, i, j, k, p, s: u64
	B13: {
		st64(s1c8, accounts, program_id)
		sol_log("Instruction: OpenPositionWithToken22Nft", 0x27)
		const f = ix_args_len
		if (f >= 4 && ((f & -4) != 4 && ((f & -4) != 8 && ((f & -4) != 0xc && ((f & -0x10) != 0x10 && ((f & -8) != 0x20 && (f & -8) != 0x28)))))) {
			const args: OpenPositionWithToken22NftArgs = ix_args
			st64(s1e0, args.tick_lower_index)
			st64(s1e8, args.tick_upper_index)
			st64(s1f0, args.tick_array_lower_start_index)
			st64(s200, args.tick_array_upper_start_index)
			copyr(s1d8, args.liquidity, 0x10)
			st64(s1f8, args.amount_0_max)
			st64(s208, args.amount_1_max)
			st64(s170, args + 0x30, f - 0x30)
			fn_145f8(sb8, s170, args)
			k = ld64(sb8 + 8)
			if (ld8(sb8) != 0) {
				break B13
			}
			st64(s210, ld8(sb8 + 1))
			fn_17748(sb8, s170, h, i, j, k)
			k = ld64(sb8 + 8)
			if (ld8(sb8) != 0) {
				break B13
			}
			st64(s218, ld8(sb8 + 1))
			st8(s183 + 2, 0xff)
			st16(s183, 0xffff)
			st64(s180 + 8, accounts_len)
			st64(s180, ld64(s1c8))
			st64(s1000, f, s183)
			s = accounts_open_position_with_token22_nft(sb8, ld64(s1c8 + 8), s180, args, fp, k)
			const l = ld64(sb8)
			if (l == 0) {
				p = ld64(sb8 + 8)
				st64(a + 8, ld64(sa8))
				st64(a, p)
				return s
			}
			const n = ld64(sb8 + 8)
			const m = ld64(sa8)
			memcpy(s158, sa0, 0xa0)
			st64(s170 + 0x10, m)
			const o = ld64(s1c8 + 8)
			st64(s170, l, n)
			st16(sa0 + 8, ld16(s183))
			st8(sa0 + 0xa, ld8(s183 + 2))
			copyr(sa8, s180, 0x10)
			st64(sb8, o, s170)
			st64(s1000 + 0x38, ld64(s218))
			st64(s1000 + 0x30, ld64(s210) & 1)
			st64(s1000 + 0x28, ld64(s200))
			st64(s1000 + 0x20, ld64(s1f0))
			st64(s1000 + 0x18, ld64(s1e8))
			st64(s1000 + 0x10, ld64(s1e0))
			st64(s1000 + 8, ld64(s208))
			st64(s1000, ld64(s1f8))
			s = fn_26d98(s198, sb8, ld64(s1d8), ld64(s1d8 + 8), ld64(s1000), ld64(s1000 + 8), ld64(s1000 + 0x10), ld64(s1000 + 0x18), ld64(s1000 + 0x20), ld64(s1000 + 0x28), ld64(s1000 + 0x30), ld64(s1000 + 0x38))
			p = ld64(s198)
			if (p == 2) {
				s = fn_a6478(s1a8, s170, o)
				p = ld64(s1a8)
				st64(a + 8, ld64(s1a8 + 8))
				st64(a, p)
				return s
			}
			st64(a + 8, ld64(s198 + 8))
			st64(a, p)
			return s
		}
		k = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	}
	const q = k
	if (2 > (k & 3) - 2) {
		s = anchor_error_from(s1b8, 0x66 /* anchor::InstructionDidNotDeserialize */, h, i, j)
		p = ld64(s1b8)
		st64(a + 8, ld64(s1b8 + 8))
		st64(a, p)
		return s
	}
	if ((q & 3) == 0) {
		s = anchor_error_from(s1b8, 0x66 /* anchor::InstructionDidNotDeserialize */, h, i, j)
		p = ld64(s1b8)
		st64(a + 8, ld64(s1b8 + 8))
		st64(a, p)
		return s
	}
	const r = ld64(ld64(k + 7))
	if (r == 0) {
		s = anchor_error_from(s1b8, 0x66 /* anchor::InstructionDidNotDeserialize */, h, i, j)
		p = ld64(s1b8)
		st64(a + 8, ld64(s1b8 + 8))
		st64(a, p)
		return s
	}
	callx(r, ld64(k - 1), r)
	s = anchor_error_from(s1b8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	p = ld64(s1b8)
	st64(a + 8, ld64(s1b8 + 8))
	st64(a, p)
	return s
}

// Anchor Accounts::try_accounts of instruction open_position_with_token22_nft (called by ix_open_position_with_token22_nft; name [str]: from the handler's "Instruction: …" log; was fn_a17d8)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: pool_state (ConstraintMut), protocol_position (AccountNotEnoughKeys), tick_array_lower (ConstraintSeeds, ConstraintMut), tick_array_upper (AccountNotEnoughKeys, ConstraintSeeds, ConstraintMut), token_account_0 (ConstraintMut), token_account_1 (ConstraintMut), token_vault_0 (ConstraintMut, ConstraintRaw), token_vault_1 (ConstraintMut, ConstraintRaw), rent, system_program, token_program, associated_token_program, token_program_2022, vault_0_mint (ConstraintAddress), vault_1_mint (ConstraintAddress), position_nft_account (ConstraintMut), position_nft_mint (ConstraintMut), payer (ConstraintMut), personal_position (ConstraintSeeds, ConstraintMut, ConstraintRentExempt)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: vault_0_mint_box, vault_1_mint_box, token_vault_0_box, token_vault_1_box, token_vault_0_box_2, token_vault_1_box_2, payer [idl], personal_position [idl], token_vault_0, token_vault_1
export function accounts_open_position_with_token22_nft(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s60 = fp - 0x60, s80 = fp - 0x80, sa0 = fp - 0xa0, sc0 = fp - 0xc0, se0 = fp - 0xe0, se4 = fp - 0xe4, s108 = fp - 0x108, s128 = fp - 0x128, s148 = fp - 0x148, s168 = fp - 0x168, s188 = fp - 0x188, s1b8 = fp - 0x1b8, s1d8 = fp - 0x1d8, s1d9 = fp - 0x1d9, s200 = fp - 0x200, s218 = fp - 0x218, s230 = fp - 0x230, s238 = fp - 0x238, s240 = fp - 0x240, s248 = fp - 0x248, s250 = fp - 0x250, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s598 = fp - 0x598, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s5c8 = fp - 0x5c8, s5d8 = fp - 0x5d8, s5e8 = fp - 0x5e8, s5f8 = fp - 0x5f8, s608 = fp - 0x608, s618 = fp - 0x618, s628 = fp - 0x628, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s668 = fp - 0x668, s678 = fp - 0x678, s688 = fp - 0x688, s698 = fp - 0x698, s6a8 = fp - 0x6a8, s730 = fp - 0x730, s738 = fp - 0x738, s740 = fp - 0x740, s748 = fp - 0x748, s750 = fp - 0x750, s758 = fp - 0x758, s760 = fp - 0x760, s768 = fp - 0x768, s770 = fp - 0x770
	let i, j, m, n, o, q, r, s, w, x, y, aa, ab, ao, ap, ar, at, av, aw, ay, az, be, bf, bh, bi, bk, bl, bn, bo, bq, br: u64
	st64(s258, b)
	const f = ld64(e - 0x1000)
	if (f >= 4) {
		const bw = ld64(e - 0xff8)
		if ((f & -4) > 0xc || ((1 << (f & -4 & 0x3f)) & 0x1110) == 0) {
			st64(s730 + 0x78, ld32(d + 0xc))
			st64(s730 + 0x80, ld32(d + 8))
			j = try_accounts_17a30(s40, c, c, d, e, r0)
			const payer: AccountInfo = ld64(s38)
			i = ld64(s40)
			if (i == 2) {
				st64(s250, payer)
				const l = ld64(c + 8)
				if (l == 0) {
					anchor_error_from(s268, 0xbbd /* anchor::AccountNotEnoughKeys */, m, n, o)
					j = ld64(s268 + 8)
					i = ld64(s268)
					if (i != 2) {
						const ag = ld64(0x300000000 /* heap bump-allocator cursor */)
						const ah = ag != 0 ? sat_sub(ag, 0x12) : 0x300007fee
						if ((i & 1) != 0) {
							if (0x300000008 > ah) {
								raw_vec_handle_error(1, 0x12, 0x10015f8f8, sat_sub(ag, 0x12), 0x12 > ag)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, ah)
							st64(ah + 8, 0x6e776f5f74666e5f)
							st64(ah, 0x6e6f697469736f70)
							st16(ah + 0x10, 0x7265)
							void ld64(j)
						} else {
							if (0x300000008 > ah) {
								raw_vec_handle_error(1, 0x12, 0x10015f8f8, sat_sub(ag, 0x12), 0x12 > ag)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, ah)
							st64(ah + 8, 0x6e776f5f74666e5f)
							st64(ah, 0x6e6f697469736f70)
							st16(ah + 0x10, 0x7265)
							void ld64(j)
						}
						st64(j + 0x10, ah, 0x12)
						st64(j + 8, 0x12)
						st64(j, 1)
						st64(a + 0x10, j)
						st64(a + 8, i)
						st64(a, 0)
						return j
					}
				} else {
					st64(c + 8, l - 1)
					j = ld64(c)
					st64(c, j + 0x30)
				}
				st64(s730 + 0x70, j)
				try_accounts_17a30(s40, c, m, n, o, j)
				j = ld64(s38)
				i = ld64(s40)
				if (i == 2) {
					st64(s730 + 0x68, j)
					st64(s248, j)
					const p = ld64(c + 8)
					if (p == 0) {
						anchor_error_from(s278, 0xbbd /* anchor::AccountNotEnoughKeys */, q, r, s)
						j = ld64(s278 + 8)
						i = ld64(s278)
						if (i != 2) {
							const ai = ld64(0x300000000 /* heap bump-allocator cursor */)
							const aj = ai != 0 ? sat_sub(ai, 0x14) : 0x300007fec
							if ((i & 1) != 0) {
								if (0x300000008 > aj) {
									raw_vec_handle_error(1, 0x14, 0x10015f8f8, sat_sub(ai, 0x14), 0x14 > ai)
								}
								st64(0x300000000 /* heap bump-allocator cursor */, aj)
								st64(aj + 8, 0x6363615f74666e5f)
								st64(aj, 0x6e6f697469736f70)
								st32(aj + 0x10, 0x746e756f)
								void ld64(j)
							} else {
								if (0x300000008 > aj) {
									raw_vec_handle_error(1, 0x14, 0x10015f8f8, sat_sub(ai, 0x14), 0x14 > ai)
								}
								st64(0x300000000 /* heap bump-allocator cursor */, aj)
								st64(aj + 8, 0x6363615f74666e5f)
								st64(aj, 0x6e6f697469736f70)
								st32(aj + 0x10, 0x746e756f)
								void ld64(j)
							}
							st64(j + 0x10, aj, 0x14)
							st64(j + 8, 0x14)
							st64(j, 1)
							st64(a + 0x10, j)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					} else {
						st64(c + 8, p - 1)
						j = ld64(c)
						st64(c, j + 0x30)
					}
					st64(s730 + 0x60, j)
					fn_11e0(s40, c, q, r, s)
					let vault_0_mint_box: Mint = ld64(s38)
					const t = ld64(s40)
					if (t != 2) {
						j = fn_4130(s288, t, vault_0_mint_box, "pool_state", 0xa)
						vault_0_mint_box = ld64(s288 + 8)
						i = ld64(s288)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					B53: {
						B50: {
							B21: {
								B18: {
									st64(s730 + 0x58, vault_0_mint_box)
									const v = ld64(c + 8)
									if (v == 0) {
										anchor_error_from(s298, 0xbbd /* anchor::AccountNotEnoughKeys */, vault_0_mint_box, x, y)
										vault_0_mint_box = ld64(s298 + 8)
										const ak = ld64(s298)
										if (ak == 2) {
											break B18
										}
										j = fn_4130(s2a8, ak, vault_0_mint_box, 0x10015aff1 /* "protocol_position" */, 0x11)
										vault_0_mint_box = ld64(s2a8 + 8)
										i = ld64(s2a8)
										if (i != 2) {
											st64(a + 0x10, vault_0_mint_box)
											st64(a + 8, i)
											st64(a, 0)
											return j
										}
										w = ld64(c + 8)
										if (w == 0) {
											break B18
										}
									} else {
										vault_0_mint_box = ld64(c)
										st64(c, vault_0_mint_box + 0x30)
										w = v - 1
										st64(c + 8, w)
										if (w == 0) {
											break B18
										}
									}
									st64(s730 + 0x50, vault_0_mint_box)
									vault_0_mint_box = ld64(c)
									st64(c, vault_0_mint_box + 0x30)
									aa = w - 1
									st64(c + 8, aa)
									if (aa == 0) {
										break B50
									}
									break B21
								}
								st64(s730 + 0x50, vault_0_mint_box)
								anchor_error_from(s2b8, 0xbbd /* anchor::AccountNotEnoughKeys */, vault_0_mint_box, x, y)
								vault_0_mint_box = ld64(s2b8 + 8)
								const z = ld64(s2b8)
								if (z == 2) {
									break B50
								}
								j = fn_4130(s2c8, z, vault_0_mint_box, "tick_array_lower", 0x10)
								vault_0_mint_box = ld64(s2c8 + 8)
								i = ld64(s2c8)
								if (i != 2) {
									st64(a + 0x10, vault_0_mint_box)
									st64(a + 8, i)
									st64(a, 0)
									return j
								}
								aa = ld64(c + 8)
								if (aa == 0) {
									break B50
								}
							}
							st64(s730 + 0x48, vault_0_mint_box)
							vault_0_mint_box = ld64(c)
							st64(c, vault_0_mint_box + 0x30)
							ab = aa - 1
							st64(c + 8, ab)
							if (ab == 0) {
								j = anchor_error_from(s698, 0xbbd /* anchor::AccountNotEnoughKeys */, vault_0_mint_box, x, y)
								i = ld64(s698)
								st64(a + 0x10, ld64(s698 + 8))
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
							break B53
						}
						st64(s730 + 0x48, vault_0_mint_box)
						anchor_error_from(s2d8, 0xbbd /* anchor::AccountNotEnoughKeys */, vault_0_mint_box, x, y)
						vault_0_mint_box = undef
						const al = ld64(s2d8)
						if (al == 2) {
							j = anchor_error_from(s698, 0xbbd /* anchor::AccountNotEnoughKeys */, vault_0_mint_box, x, y)
							i = ld64(s698)
							st64(a + 0x10, ld64(s698 + 8))
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
						j = fn_4130(s2e8, al, ld64(s2d8 + 8), "tick_array_upper", 0x10)
						vault_0_mint_box = ld64(s2e8 + 8)
						i = ld64(s2e8)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
						ab = ld64(c + 8)
						if (ab == 0) {
							j = anchor_error_from(s698, 0xbbd /* anchor::AccountNotEnoughKeys */, vault_0_mint_box, x, y)
							i = ld64(s698)
							st64(a + 0x10, ld64(s698 + 8))
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s730 + 0x38, vault_0_mint_box)
					const am: AccountInfo = ld64(c)
					st64(s240, am)
					st64(c + 8, ab - 1)
					st64(s730 + 0x40, am)
					st64(c, am + 0x30)
					fn_7498(s40, c, vault_0_mint_box, x, y)
					vault_0_mint_box = ld64(s38)
					const an = ld64(s40)
					if (an != 2) {
						j = fn_4130(s2f8, an, vault_0_mint_box, "token_account_0", 0xf)
						vault_0_mint_box = ld64(s2f8 + 8)
						i = ld64(s2f8)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s730 + 0x30, vault_0_mint_box)
					fn_7498(s40, c, vault_0_mint_box, ao, ap)
					vault_0_mint_box = ld64(s38)
					const aq = ld64(s40)
					if (aq != 2) {
						j = fn_4130(s308, aq, vault_0_mint_box, "token_account_1", 0xf)
						vault_0_mint_box = ld64(s308 + 8)
						i = ld64(s308)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s730 + 0x28, vault_0_mint_box)
					fn_7498(s40, c, vault_0_mint_box, ar, at)
					vault_0_mint_box = ld64(s38)
					const au = ld64(s40)
					if (au != 2) {
						j = fn_4130(s318, au, vault_0_mint_box, "token_vault_0", 0xd)
						vault_0_mint_box = ld64(s318 + 8)
						i = ld64(s318)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s730 + 0x20, vault_0_mint_box)
					fn_7498(s40, c, vault_0_mint_box, av, aw)
					vault_0_mint_box = ld64(s38)
					const ax = ld64(s40)
					if (ax != 2) {
						j = fn_4130(s328, ax, vault_0_mint_box, "token_vault_1", 0xd)
						vault_0_mint_box = ld64(s328 + 8)
						i = ld64(s328)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s730 + 0x18, vault_0_mint_box)
					try_accounts_17ae0(s40, c, vault_0_mint_box, ay, az)
					const bc = ld64(s38 + 8)
					const bb = ld64(s38)
					const ba = ld64(s40)
					if (ba == 0) {
						j = fn_4130(s688, bb, bc, 0x1001598f8 /* "rent" */, 4)
						i = ld64(s688)
						st64(a + 0x10, ld64(s688 + 8))
						st64(a + 8, i)
						st64(a, 0)
						return j
					}
					st64(s730, ba, bb, bc)
					st64(s738, ld64(s38 + 0x10))
					try_accounts_18870(s40, c, bc)
					vault_0_mint_box = ld64(s38)
					const bd = ld64(s40)
					if (bd != 2) {
						j = fn_4130(s338, bd, vault_0_mint_box, "system_program", 0xe)
						vault_0_mint_box = ld64(s338 + 8)
						i = ld64(s338)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s740, vault_0_mint_box)
					st64(s238, vault_0_mint_box)
					try_accounts_19190(s40, c, vault_0_mint_box, be, bf)
					vault_0_mint_box = ld64(s38)
					const bg = ld64(s40)
					if (bg != 2) {
						j = fn_4130(s348, bg, vault_0_mint_box, 0x10015b020 /* "token_program" */, 0xd)
						vault_0_mint_box = ld64(s348 + 8)
						i = ld64(s348)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s748, vault_0_mint_box)
					try_accounts_18f40(s40, c, vault_0_mint_box, bh, bi)
					vault_0_mint_box = ld64(s38)
					const bj = ld64(s40)
					if (bj != 2) {
						j = fn_4130(s358, bj, vault_0_mint_box, "associated_token_program", 0x18)
						vault_0_mint_box = ld64(s358 + 8)
						i = ld64(s358)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s750, vault_0_mint_box)
					fn_18cf0(s40, c, vault_0_mint_box, bk, bl)
					vault_0_mint_box = ld64(s38)
					const bm = ld64(s40)
					if (bm != 2) {
						j = fn_4130(s368, bm, vault_0_mint_box, "token_program_2022", 0x12)
						vault_0_mint_box = ld64(s368 + 8)
						i = ld64(s368)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s758, vault_0_mint_box)
					fn_7768(s40, c, vault_0_mint_box, bn, bo)
					vault_0_mint_box = ld64(s38)
					const bp = ld64(s40)
					if (bp != 2) {
						j = fn_4130(s378, bp, vault_0_mint_box, "vault_0_mint", 0xc)
						vault_0_mint_box = ld64(s378 + 8)
						i = ld64(s378)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s760, vault_0_mint_box)
					fn_7768(s40, c, vault_0_mint_box, bq, br)
					let vault_1_mint_box: Mint = ld64(s38)
					const bs = ld64(s40)
					if (bs != 2) {
						j = fn_4130(s388, bs, vault_1_mint_box, "vault_1_mint", 0xc)
						vault_1_mint_box = ld64(s388 + 8)
						i = ld64(s388)
						if (i != 2) {
							st64(a + 0x10, vault_1_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					rent_get(s40)
					copy(s218, s38, 0x18)
					if (ld64(s40) != 0) {
						j = fn_13e628(s678, s218)
						i = ld64(s678)
						st64(a + 0x10, ld64(s678 + 8))
						st64(a + 8, i)
						st64(a, 0)
						return j
					}
					copyr(s230, s218, 0x18)
					const bu = ld64(ld64(s730 + 0x68) /* key */)
					copyr(s1b8, bu, 0x20)
					st64(s108, 0x100159360, 8, s1b8, 0x20)
					// PDA find_program_address(["position", *bu], program *(ld64(s258)))
					Pubkey_find_program_address(s40, s108, 2, ld64(s258))
					copyr(s200, s40, 0x20)
					const bv = ld8(s20)
					st8(s1d9, bv)
					st8(bw + 2, bv)
					const bx = ld64(ld64(s730 + 0x40))
					copyr(s1d8, bx, 0x20)
					if ((memcmp(s1d8, s200, 0x20) as u32) == 0) {
						st64(s40, s240, s230, s250, s238, s248, s1d9, s258)
						j = fn_a4980(s1b8, s40)
						st64(s730 + 0x40, ld64(s1b8 + 8))
						i = ld64(s1b8)
						if (i == 2) {
							const personal_position: AccountInfo = ld64(ld64(s730 + 0x40))
							if (personal_position.is_writable != 0) {
								st64(s768, s1b8)
								AccountInfo_clone_f338(s1b8, personal_position)
								st64(s770, fn_147a20(ld64(s768)))
								const cc = ld64(ld64(s730 + 0x40))
								st64(s768, s40)
								AccountInfo_clone_f338(s40, cc)
								AccountInfo_try_data_len(s108, ld64(s768))
								const ce = ld64(s108 + 8)
								const cd = ld64(s108)
								if (cd != 0x800000000000001a /* Ok */) {
									st64(s108 + 0x10, ld64(s108 + 0x10))
									st64(s108, cd, ce)
									const ch = fn_13e628(s3e8, s108)
									const cg = ld64(s3e8)
									st64(a + 0x10, ld64(s3e8 + 8))
									st64(a + 8, cg)
									st64(a, 0)
									return ptr_drop_in_place_fcd8(s1b8, ptr_drop_in_place_fcd8(s40, ch))
								}
								const cf = Rent_is_exempt(s230, ld64(s770), ce)
								st64(s768, cf)
								ptr_drop_in_place_fcd8(s1b8, ptr_drop_in_place_fcd8(s40, cf))
								if (ld64(s768) != 0) {
									if (payer.is_writable != 0) {
										if (ld8(ld64(s730 + 0x68) + 0x29 /* is_writable */) != 0) {
											if (ld8(ld64(s730 + 0x60) + 0x29) != 0) {
												if (ld8(ld64(s730 + 0x58) + 0x29 /* is_writable */) != 0) {
													const ci = ld64(ld64(s730 + 0x58) /* key */)
													copyr(s168, ci, 0x20)
													st64(s40, 0x10015a23e)
													st64(s38 + 8, s168)
													st64(s20, s108)
													st32(s108, bswap32(ld64(s730 + 0x80)))
													st64(s38, 0xa)
													st64(s38 + 0x10, 0x20)
													st64(s20 + 8, 4)
													// PDA find_program_address(["tick_array", *ci, u32 bswap32(ld64(s730 + 0x80)) [ix data?]], program *(ld64(s258)))
													Pubkey_find_program_address(s1b8, s40, 3, ld64(s258))
													copyr(s188, s1b8, 0x20)
													st8(bw, ld8(s1b8 + 0x20))
													const cj = ld64(ld64(s730 + 0x48) /* key */)
													copyr(s148, cj, 0x20)
													if ((memcmp(s148, s188, 0x20) as u32) != 0) {
														anchor_error_from(s498, 0x7d6 /* anchor::ConstraintSeeds */)
														const cn = fn_4130(s4a8, ld64(s498), ld64(s498 + 8), "tick_array_lower", 0x10)
														const cm = ld64(s4a8 + 8)
														const cl = ld64(s4a8)
														copyr(s40, s148, 0x20)
														copy(s20, s188, 0x20)
														j = Error_with_pubkeys(s4b8, cl, cm, s40, cn)
														i = ld64(s4b8)
														st64(a + 0x10, ld64(s4b8 + 8))
														st64(a + 8, i)
														st64(a, 0)
														return j
													}
													if (ld8(ld64(s730 + 0x48) + 0x29 /* is_writable */) != 0) {
														copyr(s108, s168, 0x20)
														st64(s20, se4)
														st64(s38 + 8, s108)
														st64(s40, 0x10015a23e)
														st32(se4, bswap32(ld64(s730 + 0x78)))
														st64(s20 + 8, 4)
														st64(s38 + 0x10, 0x20)
														st64(s38, 0xa)
														// PDA find_program_address(["tick_array", *s108, u32 bswap32(ld64(s730 + 0x78)) [ix data?]], program *(ld64(s258)))
														Pubkey_find_program_address(s1b8, s40, 3, ld64(s258))
														copyr(s128, s1b8, 0x20)
														st8(bw + 1, ld8(s1b8 + 0x20))
														const ck = ld64(ld64(s730 + 0x38) /* key */)
														copyr(se0, ck, 0x20)
														if ((memcmp(se0, s128, 0x20) as u32) != 0) {
															anchor_error_from(s4e8, 0x7d6 /* anchor::ConstraintSeeds */)
															const cq = fn_4130(s4f8, ld64(s4e8), ld64(s4e8 + 8), "tick_array_upper", 0x10)
															const cp = ld64(s4f8 + 8)
															const co = ld64(s4f8)
															copyr(s40, se0, 0x20)
															copy(s20, s128, 0x20)
															j = Error_with_pubkeys(s508, co, cp, s40, cq)
															i = ld64(s508)
															st64(a + 0x10, ld64(s508 + 8))
															st64(a + 8, i)
															st64(a, 0)
															return j
														}
														if (ld8(ld64(s730 + 0x38) + 0x29 /* is_writable */) != 0) {
															if (ld8(ld64(ld64(s730 + 0x30) + 0x20) + 0x29) != 0) {
																const token_vault_0_box: TokenAccount = ld64(s730 + 0x20)
																copyr(s40, token_vault_0_box.mint, 0x20)
																if ((memcmp(ld64(s730 + 0x30) + 0x28, s40, 0x20) as u32) != 0) {
																	j = anchor_error_from(s558, 0x7de /* anchor::ConstraintTokenMint */)
																	i = ld64(s558)
																	st64(a + 0x10, ld64(s558 + 8))
																	st64(a + 8, i)
																	st64(a, 0)
																	return j
																}
																if (ld8(ld64(ld64(s730 + 0x28) + 0x20) + 0x29) != 0) {
																	const token_vault_1_box: TokenAccount = ld64(s730 + 0x18)
																	copyr(s40, token_vault_1_box.mint, 0x20)
																	const ct = memcmp(ld64(s730 + 0x28) + 0x28, s40, 0x20)
																	if ((ct as u32) != 0) {
																		j = anchor_error_from(s588, 0x7de /* anchor::ConstraintTokenMint */)
																		i = ld64(s588)
																		st64(a + 0x10, ld64(s588 + 8))
																		st64(a + 8, i)
																		st64(a, 0)
																		return j
																	}
																	const token_vault_0: AccountInfo = ld64(ld64(s730 + 0x20) + 0x20)
																	if (token_vault_0.is_writable != 0) {
																		const cv = token_vault_0.key
																		copyr(s40, cv, 0x20)
																		j = fn_4dc0(s1b8, ld64(s730 + 0x58), ct as u32)
																		let cx = ld64(s1b8 + 0x10)
																		let cw = ld64(s1b8 + 8)
																		if (ld64(s1b8) != 0) {
																			st64(a + 0x10, cx)
																			st64(a + 8, cw)
																			st64(a, 0)
																			return j
																		}
																		const cy = memcmp(s40, cw + 0x81, 0x20)
																		st64(cx, ld64(cx) - 1)
																		if ((cy as u32) == 0) {
																			const token_vault_1: AccountInfo = ld64(ld64(s730 + 0x18) + 0x20)
																			if (token_vault_1.is_writable != 0) {
																				const da = token_vault_1.key
																				copyr(s40, da, 0x20)
																				j = fn_4dc0(s1b8, ld64(s730 + 0x58), cy as u32)
																				cx = ld64(s1b8 + 0x10)
																				cw = ld64(s1b8 + 8)
																				if (ld64(s1b8) != 0) {
																					st64(a + 0x10, cx)
																					st64(a + 8, cw)
																					st64(a, 0)
																					return j
																				}
																				const db = memcmp(s40, cw + 0xa1, 0x20)
																				st64(cx, ld64(cx) - 1)
																				if ((db as u32) == 0) {
																					const token_vault_0_box_2: TokenAccount = ld64(s730 + 0x20)
																					const dd = ld64(ld64(ld64(s760) + 0x58))
																					copyr(sc0, dd, 0x20)
																					copy(sa0, token_vault_0_box_2.mint, 0x20)
																					if ((memcmp(sc0, sa0, 0x20) as u32) != 0) {
																						anchor_error_from(s618, 0x7dc /* anchor::ConstraintAddress */)
																						const dl = fn_4130(s628, ld64(s618), ld64(s618 + 8), "vault_0_mint", 0xc)
																						const dk = ld64(s628 + 8)
																						const dj = ld64(s628)
																						copy(s40, sc0, 0x40)
																						j = Error_with_pubkeys(s638, dj, dk, s40, dl)
																						i = ld64(s638)
																						st64(a + 0x10, ld64(s638 + 8))
																						st64(a + 8, i)
																						st64(a, 0)
																						return j
																					}
																					const token_vault_1_box_2: TokenAccount = ld64(s730 + 0x18)
																					const df = vault_1_mint_box.info.key
																					copyr(s80, df, 0x20)
																					copy(s60, token_vault_1_box_2.mint, 0x20)
																					j = memcmp(s80, s60, 0x20) as u32
																					if (j == 0) {
																						st64(a + 0xb0, vault_1_mint_box)
																						st64(a + 0xa8, ld64(s760))
																						st64(a + 0xa0, ld64(s758))
																						st64(a + 0x98, ld64(s750))
																						st64(a + 0x90, ld64(s748))
																						st64(a + 0x88, ld64(s740))
																						st64(a + 0x80, ld64(s738))
																						st64(a + 0x78, ld64(s730 + 0x10))
																						st64(a + 0x70, ld64(s730 + 8))
																						st64(a + 0x68, ld64(s730))
																						st64(a + 0x60, ld64(s730 + 0x18))
																						st64(a + 0x58, ld64(s730 + 0x20))
																						st64(a + 0x50, ld64(s730 + 0x28))
																						st64(a + 0x48, ld64(s730 + 0x30))
																						st64(a + 0x40, ld64(s730 + 0x40))
																						st64(a + 0x38, ld64(s730 + 0x38))
																						st64(a + 0x30, ld64(s730 + 0x48))
																						st64(a + 0x28, ld64(s730 + 0x50))
																						st64(a + 0x20, ld64(s730 + 0x58))
																						st64(a + 0x18, ld64(s730 + 0x60))
																						st64(a + 0x10, ld64(s730 + 0x68))
																						st64(a + 8, ld64(s730 + 0x70))
																						st64(a, payer)
																						return j
																					}
																					anchor_error_from(s648, 0x7dc /* anchor::ConstraintAddress */)
																					const di = fn_4130(s658, ld64(s648), ld64(s648 + 8), "vault_1_mint", 0xc)
																					const dh = ld64(s658 + 8)
																					const dg = ld64(s658)
																					copy(s40, s80, 0x40)
																					j = Error_with_pubkeys(s668, dg, dh, s40, di)
																					i = ld64(s668)
																					st64(a + 0x10, ld64(s668 + 8))
																					st64(a + 8, i)
																					st64(a, 0)
																					return j
																				}
																				anchor_error_from(s5f8, 0x7d3 /* anchor::ConstraintRaw */)
																				j = fn_4130(s608, ld64(s5f8), ld64(s5f8 + 8), "token_vault_1", 0xd)
																				i = ld64(s608)
																				st64(a + 0x10, ld64(s608 + 8))
																				st64(a + 8, i)
																				st64(a, 0)
																				return j
																			}
																			anchor_error_from(s5d8, 0x7d0 /* anchor::ConstraintMut */)
																			j = fn_4130(s5e8, ld64(s5d8), ld64(s5d8 + 8), "token_vault_1", 0xd)
																			i = ld64(s5e8)
																			st64(a + 0x10, ld64(s5e8 + 8))
																			st64(a + 8, i)
																			st64(a, 0)
																			return j
																		}
																		anchor_error_from(s5b8, 0x7d3 /* anchor::ConstraintRaw */)
																		j = fn_4130(s5c8, ld64(s5b8), ld64(s5b8 + 8), "token_vault_0", 0xd)
																		i = ld64(s5c8)
																		st64(a + 0x10, ld64(s5c8 + 8))
																		st64(a + 8, i)
																		st64(a, 0)
																		return j
																	}
																	anchor_error_from(s598, 0x7d0 /* anchor::ConstraintMut */)
																	j = fn_4130(s5a8, ld64(s598), ld64(s598 + 8), "token_vault_0", 0xd)
																	i = ld64(s5a8)
																	st64(a + 0x10, ld64(s5a8 + 8))
																	st64(a + 8, i)
																	st64(a, 0)
																	return j
																}
																anchor_error_from(s568, 0x7d0 /* anchor::ConstraintMut */)
																j = fn_4130(s578, ld64(s568), ld64(s568 + 8), "token_account_1", 0xf)
																i = ld64(s578)
																st64(a + 0x10, ld64(s578 + 8))
																st64(a + 8, i)
																st64(a, 0)
																return j
															}
															anchor_error_from(s538, 0x7d0 /* anchor::ConstraintMut */)
															j = fn_4130(s548, ld64(s538), ld64(s538 + 8), "token_account_0", 0xf)
															i = ld64(s548)
															st64(a + 0x10, ld64(s548 + 8))
															st64(a + 8, i)
															st64(a, 0)
															return j
														}
														anchor_error_from(s518, 0x7d0 /* anchor::ConstraintMut */)
														j = fn_4130(s528, ld64(s518), ld64(s518 + 8), "tick_array_upper", 0x10)
														i = ld64(s528)
														st64(a + 0x10, ld64(s528 + 8))
														st64(a + 8, i)
														st64(a, 0)
														return j
													}
													anchor_error_from(s4c8, 0x7d0 /* anchor::ConstraintMut */)
													j = fn_4130(s4d8, ld64(s4c8), ld64(s4c8 + 8), "tick_array_lower", 0x10)
													i = ld64(s4d8)
													st64(a + 0x10, ld64(s4d8 + 8))
													st64(a + 8, i)
													st64(a, 0)
													return j
												}
												anchor_error_from(s478, 0x7d0 /* anchor::ConstraintMut */)
												j = fn_4130(s488, ld64(s478), ld64(s478 + 8), "pool_state", 0xa)
												i = ld64(s488)
												st64(a + 0x10, ld64(s488 + 8))
												st64(a + 8, i)
												st64(a, 0)
												return j
											}
											anchor_error_from(s458, 0x7d0 /* anchor::ConstraintMut */)
											j = fn_4130(s468, ld64(s458), ld64(s458 + 8), "position_nft_account", 0x14)
											i = ld64(s468)
											st64(a + 0x10, ld64(s468 + 8))
											st64(a + 8, i)
											st64(a, 0)
											return j
										}
										anchor_error_from(s438, 0x7d0 /* anchor::ConstraintMut */)
										j = fn_4130(s448, ld64(s438), ld64(s438 + 8), "position_nft_mint", 0x11)
										i = ld64(s448)
										st64(a + 0x10, ld64(s448 + 8))
										st64(a + 8, i)
										st64(a, 0)
										return j
									}
									anchor_error_from(s418, 0x7d0 /* anchor::ConstraintMut */)
									j = fn_4130(s428, ld64(s418), ld64(s418 + 8), "payer", 5)
									i = ld64(s428)
									st64(a + 0x10, ld64(s428 + 8))
									st64(a + 8, i)
									st64(a, 0)
									return j
								}
								anchor_error_from(s3f8, 0x7d5 /* anchor::ConstraintRentExempt */)
								j = fn_4130(s408, ld64(s3f8), ld64(s3f8 + 8), 0x10015b06a /* "personal_position" */, 0x11)
								i = ld64(s408)
								st64(a + 0x10, ld64(s408 + 8))
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
							anchor_error_from(s3c8, 0x7d0 /* anchor::ConstraintMut */)
							j = fn_4130(s3d8, ld64(s3c8), ld64(s3c8 + 8), 0x10015b06a /* "personal_position" */, 0x11)
							i = ld64(s3d8)
							st64(a + 0x10, ld64(s3d8 + 8))
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
						st64(a + 0x10, ld64(s730 + 0x40))
						st64(a + 8, i)
						st64(a, 0)
						return j
					}
					anchor_error_from(s398, 0x7d6 /* anchor::ConstraintSeeds */)
					const ca = fn_4130(s3a8, ld64(s398), ld64(s398 + 8), 0x10015b06a /* "personal_position" */, 0x11)
					const bz = ld64(s3a8 + 8)
					const by = ld64(s3a8)
					copyr(s40, s1d8, 0x20)
					copy(s20, s200, 0x20)
					j = Error_with_pubkeys(s3b8, by, bz, s40, ca)
					i = ld64(s3b8)
					st64(a + 0x10, ld64(s3b8 + 8))
					st64(a + 8, i)
					st64(a, 0)
					return j
				}
				const ae = ld64(0x300000000 /* heap bump-allocator cursor */)
				const af = ae != 0 ? sat_sub(ae, 0x11) : 0x300007fef
				if ((i & 1) != 0) {
					if (0x300000008 > af) {
						raw_vec_handle_error(1, 0x11, 0x10015f8f8, sat_sub(ae, 0x11), 0x11 > ae)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, af)
					st64(af + 8, 0x6e696d5f74666e5f)
					st64(af, 0x6e6f697469736f70)
					st8(af + 0x10, 0x74)
					void ld64(j)
				} else {
					if (0x300000008 > af) {
						raw_vec_handle_error(1, 0x11, 0x10015f8f8, sat_sub(ae, 0x11), 0x11 > ae)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, af)
					st64(af + 8, 0x6e696d5f74666e5f)
					st64(af, 0x6e6f697469736f70)
					st8(af + 0x10, 0x74)
					void ld64(j)
				}
				st64(j + 0x10, af, 0x11)
				st64(j + 8, 0x11)
				st64(j, 1)
				st64(a + 0x10, j)
				st64(a + 8, i)
				st64(a, 0)
				return j
			}
			const ac = ld64(0x300000000 /* heap bump-allocator cursor */)
			const ad = ac != 0 ? sat_sub(ac, 5) : 0x300007ffb
			if ((i & 1) != 0) {
				if (0x300000008 > ad) {
					raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(ac, 5), 5 > ac)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ad)
				st8(ad + 4, 0x72)
				st32(ad, 0x65796170)
				void payer.key
			} else {
				if (0x300000008 > ad) {
					raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(ac, 5), 5 > ac)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ad)
				st8(ad + 4, 0x72)
				st32(ad, 0x65796170)
				void payer.key
			}
			st64(payer + 0x10, ad, 5)
			st64(payer + 8, 5)
			st64(payer, 1)
			st64(a + 0x10, payer)
			st64(a + 8, i)
			st64(a, 0)
			return j
		}
	}
	const g = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (g & 3) - 2) {
		j = anchor_error_from(s6a8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s6a8)
		st64(a + 0x10, ld64(s6a8 + 8))
		st64(a + 8, i)
		st64(a, 0)
		return j
	}
	if ((g & 3) == 0) {
		j = anchor_error_from(s6a8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s6a8)
		st64(a + 0x10, ld64(s6a8 + 8))
		st64(a + 8, i)
		st64(a, 0)
		return j
	}
	const h = ld64(ld64(g + 7))
	if (h == 0) {
		j = anchor_error_from(s6a8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s6a8)
		st64(a + 0x10, ld64(s6a8 + 8))
		st64(a + 8, i)
		st64(a, 0)
		return j
	}
	callx(h, ld64(g - 1), h)
	j = anchor_error_from(s6a8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	i = ld64(s6a8)
	st64(a + 0x10, ld64(s6a8 + 8))
	st64(a + 8, i)
	st64(a, 0)
	return j
}

export function fn_a4980(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s168 = fp - 0x168, s169 = fp - 0x169, s190 = fp - 0x190, s191 = fp - 0x191, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s228 = fp - 0x228, s230 = fp - 0x230, s250 = fp - 0x250, s270 = fp - 0x270, s288 = fp - 0x288, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8, s2c8 = fp - 0x2c8, s300 = fp - 0x300, s310 = fp - 0x310, s330 = fp - 0x330, s338 = fp - 0x338, s33f = fp - 0x33f, s348 = fp - 0x348, s360 = fp - 0x360, s368 = fp - 0x368, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s428 = fp - 0x428, s430 = fp - 0x430, s438 = fp - 0x438, s440 = fp - 0x440, s448 = fp - 0x448, s450 = fp - 0x450, s458 = fp - 0x458, s460 = fp - 0x460, s468 = fp - 0x468, s470 = fp - 0x470, s478 = fp - 0x478, s480 = fp - 0x480, s488 = fp - 0x488
	let af, cq, cr, cs: u64
	const f: AccountInfo = ld64(ld64(b))
	const g = fn_147a20(f, b, c, d, e)
	st64(s428 + 0x40, a)
	if (g != 0) {
		const j = ld64(b + 0x10)
		const k = ld64(ld64(j))
		copyr(s2c8, k, 0x20)
		const l = f.key
		copy(s2a0, l + 8, 0x18)
		st64(s2a8, ld64(l))
		if ((memcmp(s2c8, s2a8, 0x20) as u32) == 0) {
			ErrorCode_name(s288, 0x100159890)
			st64(s190, 0, 1, 0)
			st64(s28, s190, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100159890, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(s348, s190, 0x18)
			copy(s360, s288, 0x18)
			st64(s380 + 8, 0x100159e23)
			st32(s300 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s330, 2)
			st32(s368, 0xa)
			st64(s380 + 0x10, 0x3f)
			st64(s380, 0)
			const ai = fn_13e5a0(s3c0, s380)
			const ah = ld64(s3c0 + 8)
			const ag = ld64(s3c0)
			copy(s380, s2c8, 0x40)
			cs = Error_with_pubkeys(s3d0, ag, ah, s380, ai)
			const ak = ld64(s3d0)
			const aj = ld64(s428 + 0x40)
			st64(aj + 8, ld64(s3d0 + 8))
			st64(aj, ak)
			return cs
		}
		st64(s428 + 0x38, b)
		const m = max(fn_1476d8(ld64(b + 8), 0x119), 1)
		if (m > g) {
			const n: AccountInfo = ld64(j)
			const o: LamportsCell = n.lamports
			const ap = n.key
			rc_inc(o)
			const al: DataCell = n.data
			rc_inc(al)
			const am: LamportsCell = f.lamports
			st64(s428 + 0x30, am)
			const an = am.strong
			st64(s428, f.key)
			st64(s428 + 8, n.executable)
			st64(s428 + 0x10, n.is_writable)
			st64(s428 + 0x18, n.is_signer)
			st64(s428 + 0x20, n.rent_epoch)
			st64(s428 + 0x28, n.owner)
			rc_inc(ld64(s428 + 0x30), an)
			const ao: DataCell = f.data
			const aq = ld64(s428 + 0x38)
			rc_inc(ao)
			st64(s440, al, ap)
			const ar: AccountInfo = ld64(ld64(aq + 0x18))
			const at: LamportsCell = ar.lamports
			const au = at.strong
			st64(s430, o)
			st64(s468, f.executable)
			st64(s460, f.is_writable)
			st64(s458, f.is_signer)
			st64(s450, f.rent_epoch)
			const ax = f.owner
			st64(s448, ar.key)
			rc_inc(at, au)
			st64(s478, ao)
			const av: DataCell = ar.data
			const aw = av.strong
			st64(s470, sat_sub(m, g))
			rc_inc(av, aw)
			st64(s480, ar.owner)
			const bb = ar.rent_epoch
			const ba = ar.is_signer
			const az = ar.is_writable
			const ay = ar.executable
			st8(s228 + 0x5a, ld64(s468))
			st8(s228 + 0x59, ld64(s460))
			st8(s228 + 0x58, ld64(s458))
			st64(s228 + 0x50, ld64(s450))
			st64(s228 + 0x48, ax)
			st64(s228 + 0x40, ld64(s478))
			st64(s228 + 0x38, ld64(s428 + 0x30))
			st64(s228 + 0x30, ld64(s428))
			st8(s228 + 0x2a, ld64(s428 + 8))
			st8(s228 + 0x29, ld64(s428 + 0x10))
			st8(s228 + 0x28, ld64(s428 + 0x18))
			st64(s228 + 0x20, ld64(s428 + 0x20))
			st64(s228 + 0x18, ld64(s428 + 0x28))
			st64(s228 + 0x10, ld64(s440))
			copyr(s228, s438, 0x10)
			st8(s230, ba, az, ay)
			st64(s250 + 0x18, bb)
			st64(s250 + 0x10, ld64(s480))
			st64(s250, at, av)
			st64(s270 + 0x18, ld64(s448))
			st64(s1c8, 8, 0)
			st64(s270, 0, 8, 0)
			cs = system_program_transfer(s390, s270, ld64(s470))
			const bc = ld64(s390)
			const bd = ld64(s428 + 0x40)
			if (bc != 2) {
				const be = ld64(s390 + 8)
				st64(bd, bc, be)
				return cs
			}
		}
		const bf: LamportsCell = f.lamports
		const bg = bf.strong
		st64(s428 + 0x30, f.key)
		const bi = ld64(s428 + 0x38)
		rc_inc(bf, bg)
		const bh: DataCell = f.data
		rc_inc(bh)
		st64(s428 + 0x28, bh)
		const bj = ld64(bi + 0x18)
		const bk: AccountInfo = ld64(bj)
		const bl: LamportsCell = bk.lamports
		const bm = bl.strong
		st64(s428, f.executable)
		st64(s428 + 8, f.is_writable)
		st64(s428 + 0x10, f.is_signer)
		st64(s428 + 0x18, f.rent_epoch)
		st64(s428 + 0x20, f.owner)
		const bn = bk.key
		rc_inc(bl, bm)
		st64(s430, bn)
		const bo: DataCell = bk.data
		rc_inc(bo)
		st64(s448, bj)
		st64(s440, bk.owner)
		st64(s438, bf)
		const bu = bk.rent_epoch
		const bt = bk.is_signer
		const bs = bk.is_writable
		const br = bk.executable
		const bp = ld64(ld64(ld64(bi + 0x20)))
		copyr(s1b8, bp, 0x20)
		const bq = ld8(ld64(bi + 0x28))
		st64(s28, s191)
		st64(s48 + 0x10, s1b8)
		st64(s48, 0x100159360)
		st8(s191, bq)
		st64(s190, s48)
		st64(s310 + 8, s190)
		st8(s310, bt, bs, br)
		st64(s330 + 0x18, bu)
		st64(s330 + 0x10, ld64(s440))
		st64(s330, bl, bo)
		st64(s338, ld64(s430))
		st8(s33f + 1, ld64(s428))
		st8(s33f, ld64(s428 + 8))
		st8(s348 + 8, ld64(s428 + 0x10))
		st64(s348, ld64(s428 + 0x18))
		st64(s360 + 0x10, ld64(s428 + 0x20))
		st64(s360 + 8, ld64(s428 + 0x28))
		st64(s360, ld64(s438))
		st64(s368, ld64(s428 + 0x30))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 8)
		st64(s190 + 8, 3)
		st64(s300, 1)
		st64(s380, 0, 8, 0)
		cs = system_program_assign_13fb30(s3a0, s380, 0x119)
		af = ld64(s3a0)
		if (af != 2) {
			cr = ld64(s3a0 + 8)
			cq = ld64(s428 + 0x40)
			st64(cq, af, cr)
			return cs
		}
		const bv: LamportsCell = f.lamports
		const cd = f.key
		rc_inc(bv)
		const bw: DataCell = f.data
		rc_inc(bw)
		const bx: AccountInfo = ld64(ld64(s448))
		const by: LamportsCell = bx.lamports
		const bz = by.strong
		st64(s428 + 0x18, f.executable)
		st64(s428 + 0x20, f.is_writable)
		st64(s428 + 0x28, f.is_signer)
		st64(s428 + 0x30, f.rent_epoch)
		const cc = f.owner
		st64(s428 + 0x10, bx.key)
		rc_inc(by, bz)
		const ca: DataCell = bx.data
		const cb = ca.strong
		st64(s430, cc, cd, bv)
		rc_inc(ca, cb)
		const ci = bx.owner
		const ch = bx.rent_epoch
		const cg = bx.is_signer
		const cf = bx.is_writable
		const ce = bx.executable
		copyr(s190, s1b8, 0x20)
		st64(s28, s169)
		st64(s48 + 0x10, s190)
		st64(s48, 0x100159360)
		st8(s169, ld8(s191))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 8)
		st64(s288, s48, 3)
		st64(s310 + 8, s288)
		st8(s310, cg, cf, ce)
		st64(s330, by, ca, ci, ch)
		st64(s338, ld64(s428 + 0x10))
		st8(s33f + 1, ld64(s428 + 0x18))
		st8(s33f, ld64(s428 + 0x20))
		st8(s348 + 8, ld64(s428 + 0x28))
		st64(s348, ld64(s428 + 0x30))
		st64(s360 + 0x10, ld64(s430))
		st64(s360 + 8, bw)
		copyr(s368, s428, 0x10)
		st64(s300, 1)
		st64(s380, 0, 8, 0)
		cs = system_program_assign_13ff40(s3b0, s380, ld64(ld64(ld64(s428 + 0x38) + 0x30)))
		af = ld64(s3b0)
		if (af != 2) {
			cr = ld64(s3b0 + 8)
			cq = ld64(s428 + 0x40)
			st64(cq, af, cr)
			return cs
		}
	} else {
		const p = fn_1476d8(ld64(b + 8), 0x119)
		const h: AccountInfo = ld64(ld64(b + 0x10))
		const i: LamportsCell = h.lamports
		const v = h.key
		rc_inc(i)
		st64(s428 + 0x30, p)
		const q: DataCell = h.data
		rc_inc(q)
		st64(s428 + 0x28, q)
		const r: LamportsCell = f.lamports
		const s = r.strong
		st64(s428, f.key)
		st64(s428 + 8, h.executable)
		st64(s428 + 0x10, h.is_writable)
		st64(s428 + 0x18, h.is_signer)
		st64(s428 + 0x20, h.rent_epoch)
		const t = h.owner
		rc_inc(r, s)
		st64(s430, t)
		const u: DataCell = f.data
		rc_inc(u)
		st64(s440, v, i)
		const w: AccountInfo = ld64(ld64(b + 0x18))
		const x: LamportsCell = w.lamports
		const y = x.strong
		st64(s468, f.executable)
		st64(s460, f.is_writable)
		st64(s458, f.is_signer)
		st64(s450, f.rent_epoch)
		st64(s448, f.owner)
		const z = w.key
		rc_inc(x, y)
		st64(s470, z)
		const aa: DataCell = w.data
		rc_inc(aa)
		st64(s478, w.owner)
		st64(s480, w.rent_epoch)
		st64(s488, w.is_signer)
		const ae = w.is_writable
		const ad = w.executable
		const ab = ld64(ld64(ld64(b + 0x20)))
		copyr(s190, ab, 0x20)
		const ac = ld8(ld64(b + 0x28))
		st64(s28, s169)
		st64(s48 + 0x10, s190)
		st64(s48, 0x100159360)
		st8(s169, ac)
		st64(s288, s48)
		st64(s300 + 0x28, s288)
		st8(s300 + 0x22, ld64(s468))
		st8(s300 + 0x21, ld64(s460))
		st8(s300 + 0x20, ld64(s458))
		st64(s300 + 0x18, ld64(s450))
		st64(s300 + 0x10, ld64(s448))
		st64(s300, r, u)
		st64(s310 + 8, ld64(s428))
		st8(s310 + 2, ld64(s428 + 8))
		st8(s310 + 1, ld64(s428 + 0x10))
		st8(s310, ld64(s428 + 0x18))
		st64(s330 + 0x18, ld64(s428 + 0x20))
		st64(s330 + 0x10, ld64(s430))
		st64(s330 + 8, ld64(s428 + 0x28))
		copyr(s338, s440, 0x10)
		st8(s33f, ae, ad)
		st8(s348 + 8, ld64(s488))
		st64(s348, ld64(s480))
		st64(s360 + 0x10, ld64(s478))
		st64(s360, x, aa)
		st64(s368, ld64(s470))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 8)
		st64(s288 + 8, 3)
		st64(s300 + 0x30, 1)
		st64(s380, 0, 8, 0)
		cs = system_program_create_account(s3e0, s380, ld64(s428 + 0x30), 0x119, ld64(ld64(b + 0x30)))
		af = ld64(s3e0)
		if (af != 2) {
			cr = ld64(s3e0 + 8)
			cq = ld64(s428 + 0x40)
			st64(cq, af, cr)
			return cs
		}
	}
	const cl = ld64(s428 + 0x40)
	cs = fn_8ed0(s168, f)
	if (ld64(s168) == 0) {
		const cm = ld64(0x300000000 /* heap bump-allocator cursor */)
		const co = cm != 0 ? sat_sub(cm, 0x11) : 0x300007fef
		const cp = ld64(s168 + 0x10)
		const cn = ld64(s168 + 8)
		if (cn != 0) {
			if (0x300000008 > co) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, co)
			st64(co + 8, 0x6f697469736f705f)
			st64(co, 0x6c616e6f73726570)
			st8(co + 0x10, 0x6e)
			void ld64(cp)
		} else {
			if (0x300000008 > co) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, co)
			st64(co + 8, 0x6f697469736f705f)
			st64(co, 0x6c616e6f73726570)
			st8(co + 0x10, 0x6e)
			void ld64(cp)
		}
		st64(cp + 0x10, co, 0x11)
		st64(cp + 8, 0x11)
		st64(cp, 1)
		st64(cl + 8, cp)
		st64(cl, cn)
		return cs
	}
	const cj = ld64(0x300000000 /* heap bump-allocator cursor */)
	const ck = cj != 0 ? sat_sub(cj, 0x120) & -8 : 0x300007ee0
	if (0x300000008 > ck) {
		alloc_handle_alloc_error(8, 0x120)
	}
	st64(0x300000000 /* heap bump-allocator cursor */, ck)
	cs = memcpy(ck, s168, 0x120)
	st64(cl + 8, ck)
	st64(cl, 2)
	return cs
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value), p7 (value), p8 (value), p9 (value), p10 (value)
// types [heur]: b: OpenPositionWithToken22NftContext (the handler ix_open_position_with_token22_nft passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_26d98(a: u64, b: OpenPositionWithToken22NftContext, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s80 = fp - 0x80, s98 = fp - 0x98, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc0 = fp - 0xc0, se8 = fp - 0xe8, sf0 = fp - 0xf0, s118 = fp - 0x118, s120 = fp - 0x120, s148 = fp - 0x148, s150 = fp - 0x150, s178 = fp - 0x178, s180 = fp - 0x180, s1a8 = fp - 0x1a8, s1b0 = fp - 0x1b0, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s200 = fp - 0x200, s208 = fp - 0x208, s210 = fp - 0x210, s218 = fp - 0x218, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, sf88 = fp - 0xf88, sff0 = fp - 0xff0, s1000 = fp - 0x1000
	let i, j: u64
	let g = a
	const accounts: OpenPositionWithToken22NftAccounts = b.accounts
	if (ld8(accounts.token_account_0 + 0x94) != 2 && ld8(accounts.token_account_1 + 0x94) != 2) {
		const pool_state: AccountInfo = accounts.pool_state
		const l: LamportsCell = pool_state.lamports
		let fe = l
		const er = p12
		const fa = p11
		const es = p10
		const et = p9
		const eu = p8
		const ev = p7
		const ew = p6
		const ex = p5
		const m = ld64(accounts + 0x10)
		const s = pool_state.key
		rc_inc(l)
		let ez = m
		const n: DataCell = pool_state.data
		let fd = n
		rc_inc(n)
		const fb = g
		const r = pool_state.owner
		const q = pool_state.rent_epoch
		const p = pool_state.is_signer
		const o = pool_state.is_writable
		st8(s50 + 2, pool_state.executable)
		st8(s50, p, o)
		st64(s78, s, l, n, r, q)
		const t: AccountInfo = ld64(ld64(accounts + 0x40))
		const u: LamportsCell = t.lamports
		const aa = t.key
		rc_inc(u)
		const v: DataCell = t.data
		rc_inc(v)
		const z = t.owner
		const y = t.rent_epoch
		const x = t.is_signer
		let fc = v
		const w = t.is_writable
		st8(s20 + 2, t.executable)
		st8(s20, x, w)
		st64(s48, aa, u, v, z, y)
		const pool_state_2: AccountInfo = accounts.pool_state
		const ac: LamportsCell = pool_state_2.lamports
		const ai = pool_state_2.key
		rc_inc(ac)
		const ad: DataCell = pool_state_2.data
		rc_inc(ad)
		let ey = u
		const ah = pool_state_2.owner
		const ag = pool_state_2.rent_epoch
		const af = pool_state_2.is_signer
		const ae = pool_state_2.is_writable
		st8(s1f8 + 2, pool_state_2.executable)
		st8(s1f8, af, ae)
		st64(s220, ai, ac, ad, ah, ag)
		st64(s1000, s48, s220, accounts + 0x88, accounts + 0xa0, fa)
		j = fn_7ea90(s230, accounts, ez, s78, s48, s220, accounts + 0x88, accounts + 0xa0, fa)
		i = ld64(s230 + 8)
		let h = ld64(s230)
		if (rc_release(ac)) {
			j = Rc_drop_slow_14df0(s218, j)
		}
		if (rc_release(ad)) {
			j = Rc_drop_slow_14df0(s210, j)
		}
		g = fb
		if (rc_release(ey)) {
			j = Rc_drop_slow_14df0(s40, j)
		}
		if (rc_release(fc)) {
			j = Rc_drop_slow_14df0(s38, j)
		}
		if (rc_release(fe)) {
			j = Rc_drop_slow_14df0(s70, j)
		}
		if (rc_release(fd)) {
			j = Rc_drop_slow_14df0(s68, j)
		}
		if (h == 2) {
			const aj: AccountInfo = ld64(accounts + 0x98)
			const ak: LamportsCell = aj.lamports
			const am = aj.key
			rc_inc(ak)
			const al: DataCell = aj.data
			rc_inc(al)
			fc = am
			const payer: AccountInfo = accounts.payer
			const ao: LamportsCell = payer.lamports
			let en = aj.executable
			let eo = aj.is_writable
			let ep = aj.is_signer
			let eq = aj.rent_epoch
			const av = aj.owner
			let em = payer.key
			rc_inc(ao)
			const ap: DataCell = payer.data
			let el = ap
			rc_inc(ap)
			const aq: AccountInfo = ld64(accounts + 0x18)
			const ar: LamportsCell = aq.lamports
			fe = ar
			let eg = payer.executable
			let eh = payer.is_writable
			let ei = payer.is_signer
			let ej = payer.rent_epoch
			let ek = payer.owner
			const au = aq.key
			rc_inc(ar)
			const at: DataCell = aq.data
			ez = au
			let ef = at
			rc_inc(at)
			ey = av
			const aw: AccountInfo = ld64(accounts + 8)
			const ax: LamportsCell = aw.lamports
			fd = ax
			const ea = aq.executable
			const eb = aq.is_writable
			const ec = aq.is_signer
			const ed = aq.rent_epoch
			const ee = aq.owner
			const bg = aw.key
			rc_inc(ax)
			const ay: DataCell = aw.data
			rc_inc(ay)
			const az: AccountInfo = ld64(accounts + 0x10)
			const ba: LamportsCell = az.lamports
			const dv = aw.executable
			const dw = aw.is_writable
			const dx = aw.is_signer
			const dy = aw.rent_epoch
			const dz = aw.owner
			const du = az.key
			rc_inc(ba)
			const bb: DataCell = az.data
			rc_inc(bb)
			const bc: AccountInfo = ld64(accounts + 0x88)
			const bd: LamportsCell = bc.lamports
			const dq = az.executable
			const dr = az.is_writable
			const ds = az.is_signer
			const dt = az.rent_epoch
			const bf = az.owner
			const dp = bc.key
			rc_inc(bd)
			const be: DataCell = bc.data
			rc_inc(be)
			const bh: AccountInfo = ld64(accounts + 0xa0)
			const bi: LamportsCell = bh.lamports
			const dj = bc.executable
			const dk = bc.is_writable
			const dl = bc.is_signer
			const dm = bc.rent_epoch
			const dn = bc.owner
			const bo = bh.key
			rc_inc(bi)
			const bj: DataCell = bh.data
			rc_inc(bj)
			const bn = bh.owner
			const bm = bh.rent_epoch
			const bl = bh.is_signer
			const bk = bh.is_writable
			st8(sc0 + 2, bh.executable)
			st8(sc0, bl, bk)
			st64(se8, bo, bi, bj, bn, bm)
			st8(sf0, dl, dk, dj)
			st64(s118, dp, bd, be, dn, dm)
			st8(s120, ds, dr, dq)
			st64(s148, du, ba, bb, bf, dt)
			st8(s150, dx, dw, dv)
			st64(s178, bg, fd, ay, dz, dy)
			st8(s180, ec, eb, ea)
			st64(s1a8, ez, fe, ef, ee, ed)
			st8(s1b0, ei, eh, eg)
			st64(s1d8, em, ao, el, ek, ej)
			st8(s1e0, ep, eo, en)
			st64(s208, fc, ak, al, ey, eq)
			st64(sb8, 8, 0)
			st64(s220, 0, 8, 0)
			j = associated_token_create(s240, s220)
			i = ld64(s240 + 8)
			h = ld64(s240)
			g = fb
			if (h != 2) {
				st64(g, h, i)
				return j
			}
			const bp: AccountInfo = accounts.token_account_0.info
			const bq: LamportsCell = bp.lamports
			const bs = ld64(accounts + 0x18)
			const ca = ld64(accounts + 0x10)
			const bx = bp.key
			rc_inc(bq)
			const br: DataCell = bp.data
			fc = bs
			rc_inc(br)
			const bw = bp.owner
			const bv = bp.rent_epoch
			const bu = bp.is_signer
			const bt = bp.is_writable
			st8(s80 + 2, bp.executable)
			st8(s80, bu, bt)
			st64(s98, br, bw, bv)
			fe = bq
			st64(sa8, bx, bq)
			const by: AccountInfo = accounts.token_account_1.info
			const bz: LamportsCell = by.lamports
			ez = ca
			const cg = by.key
			rc_inc(bz)
			const cb: DataCell = by.data
			rc_inc(cb)
			const cf = by.owner
			const ce = by.rent_epoch
			const cd = by.is_signer
			const cc = by.is_writable
			st8(s50 + 2, by.executable)
			st8(s50, cd, cc)
			st64(s78, cg, bz, cb, cf, ce)
			const ch: AccountInfo = accounts.token_vault_0.info
			const ci: LamportsCell = ch.lamports
			const co = ch.key
			rc_inc(ci)
			const cj: DataCell = ch.data
			fd = ci
			ey = cb
			rc_inc(cj)
			const cn = ch.owner
			const cm = ch.rent_epoch
			const cl = ch.is_signer
			const ck = ch.is_writable
			st8(s20 + 2, ch.executable)
			st8(s20, cl, ck)
			st64(s48, co, fd, cj, cn, cm)
			const cp: AccountInfo = accounts.token_vault_1.info
			const cq: LamportsCell = cp.lamports
			const cw = cp.key
			rc_inc(cq)
			const cr: DataCell = cp.data
			eq = cj
			rc_inc(cr)
			const cv = cp.owner
			const cu = cp.rent_epoch
			const ct = cp.is_signer
			const cs = cp.is_writable
			st8(s1f8 + 2, cp.executable)
			st8(s1f8, ct, cs)
			st64(s220, cw, cq, cr, cv, cu)
			const cx = ld64(0x300000000 /* heap bump-allocator cursor */)
			eo = bz
			const cy = cx != 0 ? sat_sub(cx, 0x80) & -8 : 0x300007f80
			em = cr
			en = cq
			ep = br
			if (cy > 0x300000007) {
				const vault_0_mint: Mint = accounts.vault_0_mint
				st64(0x300000000 /* heap bump-allocator cursor */, cy)
				const da: AccountInfo = vault_0_mint.info
				memcpy(cy, vault_0_mint, 0x58)
				st64(cy + 0x58, da)
				st64(cy + 0x78, ld64(vault_0_mint[1].mint_authority + 0x14))
				st64(cy + 0x70, ld64(vault_0_mint[1].mint_authority + 0xc))
				st64(cy + 0x68, ld64(vault_0_mint[1].mint_authority + 4))
				st64(cy + 0x60, ld64(vault_0_mint + 0x60))
				const db = ld64(0x300000000 /* heap bump-allocator cursor */)
				const dc = db != 0 ? sat_sub(db, 0x80) & -8 : 0x300007f80
				if (dc > 0x300000007) {
					ek = accounts + 0x40
					el = accounts + 8
					ej = accounts + 0x38
					ei = accounts + 0x30
					eg = accounts + 0x90
					eh = accounts + 0x68
					const vault_1_mint: Mint = accounts.vault_1_mint
					st64(0x300000000 /* heap bump-allocator cursor */, dc)
					ef = vault_1_mint.info
					const dh = memcpy(dc, vault_1_mint, 0x58)
					st64(dc + 0x58, ef)
					copy(dc + 0x60, vault_1_mint + 0x60, 0x20)
					const remaining_accounts: AccountInfo = b.remaining_accounts
					const df = b.remaining_accounts_len
					const de = ld8(b + 0x22)
					st64(sf88, accounts + 0xa0, cy, dc, remaining_accounts, df, de, c, d, ex, ew, ev, eu, et, es, fa, er)
					st64(sff0, accounts + 0x20, ei, ej, ek, sa8, s78, s48, s220, eh, accounts + 0x88, eg)
					st64(s1000, fc)
					st64(sf88 + 0x80, 1)
					st64(sff0 + 0x60, 0)
					st64(s1000 + 8, 0)
					j = fn_1c850(s250, accounts, el, ez, fp, dh)
					i = ld64(s250 + 8)
					h = ld64(s250)
					if (rc_release(en)) {
						j = Rc_drop_slow_14df0(s218, j)
					}
					g = fb
					const di = fe
					if (rc_release(em)) {
						j = Rc_drop_slow_14df0(s210, j)
					}
					if (rc_release(fd)) {
						j = Rc_drop_slow_14df0(s40, j)
					}
					if (rc_release(eq)) {
						j = Rc_drop_slow_14df0(s38, j)
					}
					if (rc_release(eo)) {
						j = Rc_drop_slow_14df0(s70, j)
					}
					if (rc_release(ey)) {
						j = Rc_drop_slow_14df0(s68, j)
					}
					if (rc_release(di)) {
						j = Rc_drop_slow_14df0(sa0, j)
					}
					if (!rc_release(ep)) {
						st64(g, h, i)
						return j
					}
					j = Rc_drop_slow_14df0(s98, j)
					st64(g, h, i)
					return j
				}
				alloc_handle_alloc_error(8, 0x80)
			}
			alloc_handle_alloc_error(8, 0x80)
		}
		st64(g, h, i)
		return j
	}
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
	copyr(s1e8, s78, 0x18)
	copy(s200, sa8, 0x18)
	st64(s218, 0x100159e23)
	st32(s1a8 + 0x20, 0x1770 /* error::NotApproved */)
	st8(s1d8 + 8, 2)
	st32(s208, 0x92)
	st64(s210, 0x3f)
	st64(s220, 0)
	j = fn_13e5a0(s260, s220)
	i = ld64(s260 + 8)
	st64(g, ld64(s260))
	st64(g + 8, i)
	return j
}

// types [heur]: b: OpenPositionWithToken22NftAccounts (every call passes one: fn_26d98)
export function fn_7ea90(a: u64, b: OpenPositionWithToken22NftAccounts, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s90 = fp - 0x90, s97 = fp - 0x97, s98 = fp - 0x98, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sd8 = fp - 0xd8, se8 = fp - 0xe8, s118 = fp - 0x118, s120 = fp - 0x120, s148 = fp - 0x148, s150 = fp - 0x150, s158 = fp - 0x158, s160 = fp - 0x160, s168 = fp - 0x168, s170 = fp - 0x170, s178 = fp - 0x178, s180 = fp - 0x180, s188 = fp - 0x188, s190 = fp - 0x190, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s250 = fp - 0x250, s2f8 = fp - 0x2f8, s300 = fp - 0x300, s308 = fp - 0x308, s310 = fp - 0x310, s318 = fp - 0x318, s320 = fp - 0x320, s328 = fp - 0x328
	let k, l, q, s, t, au, av: u64
	st64(s250 + 8, b)
	st64(s2f8 + 0x90, p8)
	const u = p7
	const o = p6
	const f = p5
	const h = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = p9
	st64(s2f8 + 0x98, a)
	st64(s2f8 + 0x48, d)
	st64(s2f8 + 0x58, f)
	if (g != 0) {
		const j = h != 0 ? sat_sub(h, 4) : 0x300007ffc
		if (0x300000007 >= j) {
			raw_vec_handle_error(2, 4, 0x10015f8f8, d, 4 > h)
		}
		k = j & -2
		st64(0x300000000 /* heap bump-allocator cursor */, k)
		l = 2
		st32(k, 0x120003)
	} else {
		const i = h != 0 ? sat_sub(h, 2) : 0x300007ffe
		if (0x300000007 >= i) {
			raw_vec_handle_error(2, 2, 0x10015f8f8, d, 2 > h)
		}
		k = i & -2
		st64(0x300000000 /* heap bump-allocator cursor */, k)
		l = 1
		st16(k, 3)
	}
	st64(s250 + 0x10, l)
	fn_133040(s190, k, l)
	const n = ld64(s188)
	const m = ld64(s190)
	if (m != 0x800000000000001a /* Ok */) {
		st64(s180, ld64(s180))
		st64(s190, m, n)
		t = fn_13e628(s1b8, s190)
		s = ld64(s1b8 + 8)
		q = ld64(s2f8 + 0x98)
		st64(q, ld64(s1b8))
		st64(q + 8, s)
		return t
	}
	st64(s2f8 + 0x30, o)
	const p = fn_132bd8(n > n + 0xa6 ? 0xffffffffffffffff : n + 0xa6)
	rent_get(s190)
	copy(s1a8, s188, 0x18)
	if (ld64(s190) != 0) {
		t = fn_13e628(s238, s1a8)
		s = ld64(s238 + 8)
		q = ld64(s2f8 + 0x98)
		st64(q, ld64(s238))
		st64(q + 8, s)
		return t
	}
	copyr(s70, s1a8, 0x18)
	st64(s2f8 + 0x60, p)
	st64(s2f8 + 0x50, fn_1476d8(s70, p))
	const v: AccountInfo = ld64(u)
	const w: LamportsCell = v.lamports
	st64(s2f8 + 0x88, w)
	const x = w.strong
	st64(s2f8 + 0x78, v.key)
	rc_inc(ld64(s2f8 + 0x88), x)
	const y: DataCell = v.data
	rc_inc(y)
	const z: AccountInfo = ld64(ld64(s250 + 8))
	const aa: LamportsCell = z.lamports
	st64(s2f8 + 0x80, aa)
	const ab = aa.strong
	st64(s2f8 + 0x28, v.executable)
	st64(s2f8 + 0x38, v.is_writable)
	st64(s2f8 + 0x40, v.is_signer)
	st64(s2f8 + 0x68, v.rent_epoch)
	st64(s2f8 + 0x70, v.owner)
	st64(s2f8 + 0x20, z.key)
	rc_inc(ld64(s2f8 + 0x80), ab)
	st64(s2f8 + 0x18, y)
	const ac: DataCell = z.data
	rc_inc(ac)
	const ad: LamportsCell = c.lamports
	st64(s250 + 8, ad)
	const ae = ad.strong
	st64(s250, c.key)
	st64(s2f8 + 8, z.executable)
	st64(s2f8 + 0x10, z.is_writable)
	const ai = z.is_signer
	const ag = z.rent_epoch
	const ah = z.owner
	rc_inc(ld64(s250 + 8), ae)
	const af: DataCell = c.data
	rc_inc(af)
	st64(s300, ag)
	const an = c.owner
	st64(s2f8, ac)
	const am = c.rent_epoch
	const al = c.is_signer
	const ak = c.is_writable
	const aj = c.executable
	st64(s2f8 + 0xa0, af)
	st64(s118 + 0x10, af)
	copyr(s118, s250, 0x10)
	st8(s120 + 2, ld64(s2f8 + 8))
	st8(s120 + 1, ld64(s2f8 + 0x10))
	st8(s120, ai)
	st64(s148 + 0x20, ld64(s300))
	st64(s148 + 0x18, ah)
	st64(s148 + 0x10, ld64(s2f8))
	st64(s148 + 8, ld64(s2f8 + 0x80))
	st64(s148, ld64(s2f8 + 0x20))
	st8(s150 + 2, ld64(s2f8 + 0x28))
	st8(s150 + 1, ld64(s2f8 + 0x38))
	st8(s150, ld64(s2f8 + 0x40))
	st64(s158, ld64(s2f8 + 0x68))
	st64(s160, ld64(s2f8 + 0x70))
	st64(s168, ld64(s2f8 + 0x18))
	st64(s170, ld64(s2f8 + 0x88))
	st64(s178, ld64(s2f8 + 0x78))
	st64(s2f8 + 0x68, aj)
	st8(s118 + 0x2a, aj)
	st64(s2f8 + 0x70, ak)
	st8(s118 + 0x29, ak)
	st64(s2f8 + 0x78, al)
	st8(s118 + 0x28, al)
	st64(s2f8 + 0x80, am)
	st64(s118 + 0x20, am)
	st64(s2f8 + 0x88, an)
	st64(s118 + 0x18, an)
	st64(se8, 8, 0)
	st64(s190, 0, 8, 0)
	const ao: AccountInfo = ld64(ld64(s2f8 + 0x90))
	const ap = ao.key
	const aq = ld64(s2f8 + 0x50)
	const ar = ld64(s2f8 + 0x60)
	st64(s2f8 + 0x90, ap)
	t = system_program_create_account(s1c8, s190, aq, ar, ap)
	s = ld64(s1c8 + 8)
	let r = ld64(s1c8)
	if (r == 2) {
		st64(s300, s150)
		st64(s310, s158)
		st64(s320, s180)
		st64(s2f8 + 0x40, s188)
		st64(s2f8 + 0x18, s50)
		st64(s2f8 + 0x60, s68)
		st64(s2f8 + 0x10, s170)
		st64(s2f8 + 0x28, s97)
		st64(s308, s150)
		st64(s318, s158)
		st64(s328, s180)
		st64(s2f8 + 0x38, s188)
		st64(s2f8, s170, s50)
		let aw = ld64(s250 + 0x10) << 1
		st64(s2f8 + 0x20, ld64(ld64(s2f8 + 0x58)))
		while (true) {
			B23: {
				const ax = ld16(k)
				st64(s250 + 0x10, aw)
				if (ax == 3) {
					fn_137528(s190, ld64(s2f8 + 0x90), ld64(s250), ld64(s2f8 + 0x20))
					const be = ld64(s2f8 + 0x38)
					copy(s20, be, 0x18)
					const bf = ld64(s190)
					if (bf == 0x8000000000000000) {
						t = fn_13e628(s1e8, s20)
						s = ld64(s1e8 + 8)
						q = ld64(s2f8 + 0x98)
						st64(q, ld64(s1e8))
						st64(q + 8, s)
						return t
					}
					memcpy(ld64(s2f8 + 8), ld64(s2f8), 0x30)
					const bg = ld64(s2f8 + 0x60)
					st64(bg + 0x10, ld64(s20 + 0x10))
					st64(bg + 8, ld64(s20 + 8))
					st64(bg, ld64(s20))
					st64(s70, bf)
					const bh: LamportsCell = ao.lamports
					const br = ao.key
					rc_inc(bh)
					const bi: DataCell = ao.data
					rc_inc(bi)
					const bo = ao.executable
					const bp = ao.is_writable
					const bq = ao.is_signer
					st64(s2f8 + 0x50, ao.rent_epoch)
					st64(s2f8 + 0x58, ao.owner)
					const bk = ld64(s250 + 8)
					rc_inc(bk)
					const bm: DataCell = ld64(s2f8 + 0xa0)
					rc_inc(bm)
					st8(s148 + 0x12, ld64(s2f8 + 0x68))
					st8(s148 + 0x11, ld64(s2f8 + 0x70))
					st8(s148 + 0x10, ld64(s2f8 + 0x78))
					st64(s148 + 8, ld64(s2f8 + 0x80))
					st64(s148, ld64(s2f8 + 0x88))
					st64(s150, ld64(s2f8 + 0xa0))
					copyr(s160, s250, 0x10)
					st8(s168, bq, bp, bo)
					st64(s170, ld64(s2f8 + 0x50))
					st64(s178, ld64(s2f8 + 0x58))
					st64(s190, br, bh, bi)
					av = fn_142568(sc0, s70, s190, 2)
					const bs = ld64(sc0)
					if (bs != 0x800000000000001a /* Ok */) {
						copyr(s90, sb8, 0x10)
						st64(s98, bs)
						t = fn_13e628(s1d8, s98)
						s = ld64(s1d8 + 8)
						r = ld64(s1d8)
						const cv = ld64(s188)
						if (rc_release(cv)) {
							t = Rc_drop_slow_14df0(ld64(s2f8 + 0x38), t)
						}
						const cw = ld64(s180)
						if (rc_release(cw)) {
							t = Rc_drop_slow_14df0(ld64(s328), t)
						}
						const cx = ld64(s158)
						if (rc_release(cx)) {
							t = Rc_drop_slow_14df0(ld64(s318), t)
						}
						const cy = ld64(s150)
						if (!rc_release(cy)) {
							q = ld64(s2f8 + 0x98)
							st64(q, r, s)
							return t
						}
						t = Rc_drop_slow_14df0(ld64(s308), t)
						q = ld64(s2f8 + 0x98)
						st64(q, r, s)
						return t
					}
					const bt = ld64(s188)
					if (rc_release(bt)) {
						av = Rc_drop_slow_14df0(ld64(s2f8 + 0x38), av)
					}
					const bu = ld64(s180)
					if (rc_release(bu)) {
						av = Rc_drop_slow_14df0(ld64(s328), av)
					}
					const bv = ld64(s158)
					if (rc_release(bv)) {
						av = Rc_drop_slow_14df0(ld64(s318), av)
					}
					const at = ld64(s150)
					if (!rc_release(at)) {
						break B23
					}
					au = ld64(s308)
				} else {
					if (ax != 0x12) {
						fn_85138(sc0, 0x100159868)
						st64(s98, 0, 1, 0)
						st64(s50, s98, 0x10015f818)
						st8(s50 + 0x18, 3)
						st64(s50 + 0x10, 0x20)
						st64(s68 + 8, 0)
						st64(s70, 0)
						if (fn_88558(0x100159868, s70) != 0) {
							fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
						}
						copyr(s158, s98, 0x18)
						copy(s170, sc0, 0x18)
						st64(s188, 0x10015a809)
						st32(s118 + 0x20, 0x1792 /* error::NotSupportMint */)
						st8(s148 + 8, 2)
						st32(s178, 0x194)
						st64(s180, 0x1e)
						st64(s190, 0)
						t = fn_13e5a0(s228, s190)
						s = ld64(s228 + 8)
						q = ld64(s2f8 + 0x98)
						st64(q, ld64(s228))
						st64(q + 8, s)
						return t
					}
					st8(sc0, 0)
					const ay = ld64(s250)
					const az = ld64(s2f8 + 0x28)
					st64(az + 0x18, ld64(ay + 0x18))
					st64(az + 0x10, ld64(ay + 0x10))
					st64(az + 8, ld64(ay + 8))
					st64(az, ld64(ay))
					st8(s98, 1)
					fn_132070(s190, ld64(s2f8 + 0x90), ay, sc0, s98)
					const ba = ld64(s2f8 + 0x40)
					copy(sd8, ba, 0x18)
					const bb = ld64(s190)
					if (bb == 0x8000000000000000) {
						t = fn_13e628(s218, sd8)
						s = ld64(s218 + 8)
						q = ld64(s2f8 + 0x98)
						st64(q, ld64(s218))
						st64(q + 8, s)
						return t
					}
					memcpy(ld64(s2f8 + 0x18), ld64(s2f8 + 0x10), 0x30)
					const bc = ld64(s2f8 + 0x60)
					st64(bc + 0x10, ld64(sd8 + 0x10))
					st64(bc + 8, ld64(sd8 + 8))
					st64(bc, ld64(sd8))
					st64(s70, bb)
					const bd: LamportsCell = ao.lamports
					const bz = ao.key
					rc_inc(bd)
					const bj: DataCell = ao.data
					rc_inc(bj)
					const bw = ao.executable
					const bx = ao.is_writable
					const by = ao.is_signer
					st64(s2f8 + 0x50, ao.rent_epoch)
					st64(s2f8 + 0x58, ao.owner)
					const bl = ld64(s250 + 8)
					rc_inc(bl)
					const bn: DataCell = ld64(s2f8 + 0xa0)
					rc_inc(bn)
					st8(s148 + 0x12, ld64(s2f8 + 0x68))
					st8(s148 + 0x11, ld64(s2f8 + 0x70))
					st8(s148 + 0x10, ld64(s2f8 + 0x78))
					st64(s148 + 8, ld64(s2f8 + 0x80))
					st64(s148, ld64(s2f8 + 0x88))
					st64(s150, ld64(s2f8 + 0xa0))
					copyr(s160, s250, 0x10)
					st8(s168, by, bx, bw)
					st64(s170, ld64(s2f8 + 0x50))
					st64(s178, ld64(s2f8 + 0x58))
					st64(s190, bz, bd, bj)
					av = fn_142568(sc0, s70, s190, 2)
					const ca = ld64(sc0)
					if (ca != 0x800000000000001a /* Ok */) {
						copyr(s90, sb8, 0x10)
						st64(s98, ca)
						t = fn_13e628(s1f8, s98)
						s = ld64(s1f8 + 8)
						r = ld64(s1f8)
						const cr = ld64(s188)
						if (rc_release(cr)) {
							t = Rc_drop_slow_14df0(ld64(s2f8 + 0x40), t)
						}
						const cs = ld64(s180)
						if (rc_release(cs)) {
							t = Rc_drop_slow_14df0(ld64(s320), t)
						}
						const ct = ld64(s158)
						if (rc_release(ct)) {
							t = Rc_drop_slow_14df0(ld64(s310), t)
						}
						const cu = ld64(s150)
						if (!rc_release(cu)) {
							q = ld64(s2f8 + 0x98)
							st64(q, r, s)
							return t
						}
						t = Rc_drop_slow_14df0(ld64(s300), t)
						q = ld64(s2f8 + 0x98)
						st64(q, r, s)
						return t
					}
					const cb = ld64(s188)
					if (rc_release(cb)) {
						av = Rc_drop_slow_14df0(ld64(s2f8 + 0x40), av)
					}
					const cc = ld64(s180)
					if (rc_release(cc)) {
						av = Rc_drop_slow_14df0(ld64(s320), av)
					}
					const cd = ld64(s158)
					if (rc_release(cd)) {
						av = Rc_drop_slow_14df0(ld64(s310), av)
					}
					const ce = ld64(s150)
					if (!rc_release(ce)) {
						break B23
					}
					au = ld64(s300)
				}
				Rc_drop_slow_14df0(au, av)
			}
			k = k + 2
			aw = ld64(s250 + 0x10) - 2
			if (aw == 0) {
				const cf: LamportsCell = ao.lamports
				const co = ao.key
				rc_inc(cf)
				const cg: DataCell = ao.data
				rc_inc(cg)
				const cj = ao.executable
				const ck = ao.is_writable
				const cl = ao.is_signer
				const cm = ao.rent_epoch
				const cn = ao.owner
				const ch = ld64(s250 + 8)
				rc_inc(ch)
				const ci: DataCell = ld64(s2f8 + 0xa0)
				rc_inc(ci)
				st8(s150 + 2, ld64(s2f8 + 0x68))
				st8(s150 + 1, ld64(s2f8 + 0x70))
				st8(s150, ld64(s2f8 + 0x78))
				st64(s158, ld64(s2f8 + 0x80))
				st64(s160, ld64(s2f8 + 0x88))
				st64(s168, ld64(s2f8 + 0xa0))
				copyr(s178, s250, 0x10)
				st8(s120, cl, ck, cj)
				st64(s148, co, cf, cg, cn, cm)
				st64(s118, 8, 0)
				st64(s190, 0, 8, 0)
				const cp = ld64(ld64(s2f8 + 0x48))
				copyr(s98, cp, 0x20)
				const cq = ld64(ld64(s2f8 + 0x30))
				copyr(s70, cq, 0x20)
				t = fn_12b0f8(s208, s190, 0, s98, s70)
				s = ld64(s208 + 8)
				q = ld64(s2f8 + 0x98)
				st64(q, ld64(s208))
				st64(q + 8, s)
				return t
			}
		}
	}
	q = ld64(s2f8 + 0x98)
	st64(q, r, s)
	return t
}

export function fn_132070(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s18 = fp - 0x18, s3f = fp - 0x3f, s40 = fp - 0x40, s80 = fp - 0x80, sc0 = fp - 0xc0, s110 = fp - 0x110
	let g, h, i: u64
	if ((memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
	} else {
		const f = __rust_alloc(0x22, 1)
		if (f == 0) {
			alloc_handle_alloc_error(1, 0x22)
		}
		st64(f + 0x18, ld64(c + 0x18))
		st64(f + 0x10, ld64(c + 0x10))
		st64(f + 8, ld64(c + 8))
		st64(f, ld64(c))
		st16(f + 0x20, 0x100)
		st32(s110, 0x27)
		let j = fn_13c168(s40, d, f)
		if (ld8(s40) != 0) {
			g = ld64(s3f + 0x17)
			st64(s80 + 0x17, g)
			h = ld64(s3f + 0xf)
			st64(s80 + 0xf, h)
			i = ld64(s3f + 7)
			st64(s80 + 7, i)
			st64(a + 0x18, g)
			st64(a + 0x10, h)
			st64(a + 8, i)
			st64(a, 0x8000000000000000)
			fn_11e480(j)
		} else {
			copyr(s80, s3f, 0x20)
			j = fn_13c168(s40, e, j)
			if (ld8(s40) != 0) {
				g = ld64(s3f + 0x17)
				st64(s80 + 0x37, g)
				h = ld64(s3f + 0xf)
				st64(s80 + 0x2f, h)
				i = ld64(s3f + 7)
				st64(s80 + 0x27, i)
				st64(a + 0x18, g)
				st64(a + 0x10, h)
				st64(a + 8, i)
				st64(a, 0x8000000000000000)
				fn_11e480(j)
			} else {
				const k = ld64(s3f)
				st64(s80 + 0x20, k)
				st64(sc0 + 0x20, k)
				const l = ld64(s3f + 8)
				st64(s80 + 0x28, l)
				st64(sc0 + 0x28, l)
				const m = ld64(s3f + 0x10)
				st64(s80 + 0x30, m)
				st64(sc0 + 0x30, m)
				const n = ld64(s3f + 0x18)
				st64(s80 + 0x38, n)
				st64(sc0 + 0x38, n)
				copy(sc0, s80, 0x20)
				fn_1334b0(s18, s110)
				let p = ld64(s18)
				const o = ld64(s18 + 0x10)
				if (o == p) {
					RawVec_grow_one_131b28(s18, 0x1001610c0)
					p = ld64(s18)
				}
				let q = ld64(s18 + 8)
				st8(q + o, 0)
				let r = o + 1
				st64(s18 + 0x10, r)
				if (0x3f >= p - r) {
					reserve_do_reserve_and_handle_131e08(s18, r, 0x40, 1, 1)
					q = ld64(s18 + 8)
					r = ld64(s18 + 0x10)
				}
				memcpy(q + r, sc0, 0x40)
				st64(s18 + 0x10, r + 0x40)
				copy(a + 0x30, b, 0x20)
				st64(a + 8, f, 1)
				st64(a, 1)
				copy(a + 0x18, s18, 0x18)
			}
		}
	}
}

export function fn_137528(a: u64, b: u64, c: u64, d: u64) {
	const s44 = fp - 0x44, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60, s68 = fp - 0x68, s70 = fp - 0x70
	let i = ld64(s70)
	let j = ld64(s68)
	let k = ld64(s60)
	let l = ld64(s58)
	if ((memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
	} else {
		let f = 0
		if (d != 0) {
			l = ld64(d + 0x18)
			k = ld64(d + 0x10)
			j = ld64(d + 8)
			i = ld64(d)
			f = 1
		}
		const h = f
		const g = __rust_alloc(0x22, 1)
		if (g == 0) {
			alloc_handle_alloc_error(1, 0x22)
		}
		st64(g + 0x18, ld64(c + 0x18))
		st64(g + 0x10, ld64(c + 0x10))
		st64(g + 8, ld64(c + 8))
		st64(g, ld64(c))
		st16(g + 0x20, 0x100)
		st64(s44, i, j, k, l)
		st32(s50 + 8, h)
		st32(s50, 0x19)
		fn_1334b0(a + 0x18, s50)
		st64(a + 0x48, ld64(b + 0x18))
		st64(a + 0x40, ld64(b + 0x10))
		st64(a + 0x38, ld64(b + 8))
		st64(a + 0x30, ld64(b))
		st64(a + 8, g, 1)
		st64(a, 1)
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_vault_1
export function fn_a6478(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88
	let i, p, q, ad: u64
	let l = fn_a80(s28, ld64(b + 0x20), c)
	let f = ld64(s28)
	if (f == 2) {
		l = fn_b4e0(s38, ld64(b + 0x40), 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
		f = ld64(s38)
		if (f == 2) {
			B46: {
				const m = ld64(b + 0x48)
				const n = ld64(m + 0x20)
				if ((memcmp(m, c, 0x20) as u32) == 0 && (common_is_closed(n) == 0 && ld64(ld64(n + 0x10) + 0x10) != 0)) {
					st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
					l = fn_13e628(s48, s18)
					f = ld64(s48)
					if (f != 2) {
						const o = ld64(0x300000000 /* heap bump-allocator cursor */)
						p = 0xf > o
						q = o != 0 ? p != 0 ? 0 : o - 0xf : 0x300007ff1
						i = ld64(s48 + 8)
						if ((f & 1) != 0) {
							if (0x300000008 > q) {
								raw_vec_handle_error(1, 0xf, 0x10015f8f8, p, ad)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, q)
							st64(q + 7, 0x305f746e756f6363)
							st64(q, 0x63615f6e656b6f74)
							void ld64(i)
							break B46
						}
						if (0x300000008 > q) {
							raw_vec_handle_error(1, 0xf, 0x10015f8f8, p, ad)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, q)
						st64(q + 7, 0x305f746e756f6363)
						st64(q, 0x63615f6e656b6f74)
						void ld64(i)
						break B46
					}
				}
				const r = ld64(b + 0x50)
				const s = ld64(r + 0x20)
				if ((memcmp(r, c, 0x20) as u32) == 0 && (common_is_closed(s) == 0 && ld64(ld64(s + 0x10) + 0x10) != 0)) {
					st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
					l = fn_13e628(s58, s18)
					f = ld64(s58)
					if (f != 2) {
						const t = ld64(0x300000000 /* heap bump-allocator cursor */)
						p = 0xf > t
						q = t != 0 ? p != 0 ? 0 : t - 0xf : 0x300007ff1
						i = ld64(s58 + 8)
						if ((f & 1) != 0) {
							if (0x300000008 > q) {
								raw_vec_handle_error(1, 0xf, 0x10015f8f8, p, ad)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, q)
							st64(q + 7, 0x315f746e756f6363)
							st64(q, 0x63615f6e656b6f74)
							void ld64(i)
							break B46
						}
						if (0x300000008 > q) {
							raw_vec_handle_error(1, 0xf, 0x10015f8f8, p, ad)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, q)
						st64(q + 7, 0x315f746e756f6363)
						st64(q, 0x63615f6e656b6f74)
						void ld64(i)
						break B46
					}
				}
				const u = ld64(b + 0x58)
				const v = ld64(u + 0x20)
				if ((memcmp(u, c, 0x20) as u32) == 0 && (common_is_closed(v) == 0 && ld64(ld64(v + 0x10) + 0x10) != 0)) {
					st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
					l = fn_13e628(s68, s18)
					f = ld64(s68)
					if (f != 2) {
						const w = ld64(0x300000000 /* heap bump-allocator cursor */)
						const x = w != 0 ? sat_sub(w, 0xd) : 0x300007ff3
						i = ld64(s68 + 8)
						if ((f & 1) != 0) {
							if (0x300000008 > x) {
								raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0xd > w)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, x)
							st64(x + 5, 0x305f746c7561765f)
							st64(x, 0x61765f6e656b6f74)
							void ld64(i)
						} else {
							if (0x300000008 > x) {
								raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0xd > w)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, x)
							st64(x + 5, 0x305f746c7561765f)
							st64(x, 0x61765f6e656b6f74)
							void ld64(i)
						}
						st64(i + 0x10, x, 0xd)
						st64(i + 8, 0xd)
						st64(i, 1)
						st64(a + 8, i)
						st64(a, f)
						return l
					}
				}
				const y = ld64(b + 0x60)
				const aa = ld64(y + 0x20)
				const z = memcmp(y, c, 0x20)
				i = undef
				l = z as u32
				if (l != 0) {
					st64(a + 8, i)
					st64(a, 2)
					return l
				}
				l = common_is_closed(aa)
				i = undef
				if (l != 0) {
					st64(a + 8, i)
					st64(a, 2)
					return l
				}
				i = ld64(aa + 0x10)
				if (ld64(i + 0x10) == 0) {
					st64(a + 8, i)
					st64(a, 2)
					return l
				}
				st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
				l = fn_13e628(s78, s18)
				i = undef
				const ab = ld64(s78)
				if (ab == 2) {
					st64(a + 8, i)
					st64(a, 2)
					return l
				}
				l = fn_4130(s88, ab, ld64(s78 + 8), "token_vault_1", 0xd)
				i = undef
				const ac = ld64(s88)
				if (ac == 2) {
					st64(a + 8, i)
					st64(a, 2)
					return l
				}
				st64(a + 8, ld64(s88 + 8))
				st64(a, ac)
				return l
			}
			st64(i + 0x10, q, 0xf)
			st64(i + 8, 0xf)
			st64(i, 1)
			st64(a + 8, i)
			st64(a, f)
			return l
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
		return l
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
	return l
}
