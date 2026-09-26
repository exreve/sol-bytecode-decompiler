/// <reference path="../lib.d.ts" />
// instruction open_position_v2
import { anchor_error_from, fn_13e5a0, fn_13e628, fn_1476d8, fn_147a20, fn_14ed60, fn_17748, fn_1c850, fn_4130, fn_4dc0, fn_85138, fn_88558, fn_8ed0, fn_960a0, fn_a80, fn_b4e0, memcpy } from '../shared.ts'

// instruction handler: open_position_v2 (discriminator sha256("global:open_position_v2")[..8] = 0xc7f15670d64ab84d)
// accounts [idl]: 0 payer [signer, mut], 1 position_nft_owner, 2 position_nft_mint [signer, mut], 3 position_nft_account [mut, pda], 4 metadata_account [mut], 5 pool_state [mut], 6 protocol_position, 7 tick_array_lower [mut, pda], 8 tick_array_upper [mut, pda], 9 personal_position [mut, pda], 10 token_account_0 [mut], 11 token_account_1 [mut], 12 token_vault_0 [mut], 13 token_vault_1 [mut], 14 rent [= SysvarRent111111111111111111111111111111111], 15 system_program [= 11111111111111111111111111111111], 16 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 17 associated_token_program [= ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL], 18 metadata_program [= metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s], 19 token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb], 20 vault_0_mint, 21 vault_1_mint
// args [idl]: tick_lower_index: i32, tick_upper_index: i32, tick_array_lower_start_index: i32, tick_array_upper_start_index: i32, liquidity: u128, amount_0_max: u64, amount_1_max: u64, with_metadata: bool, base_flag: Option<bool>
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args
export function ix_open_position_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc8 = fp - 0xc8, s178 = fp - 0x178, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1a3 = fp - 0x1a3, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s200 = fp - 0x200, s208 = fp - 0x208, s210 = fp - 0x210, s218 = fp - 0x218, s220 = fp - 0x220, s228 = fp - 0x228, s230 = fp - 0x230, s238 = fp - 0x238, s1000 = fp - 0x1000
	let h, i, j, k, p, s: u64
	B13: {
		st64(s1e8, accounts, program_id)
		sol_log("Instruction: OpenPositionV2", 0x1b)
		const f = ix_args_len
		if (f >= 4 && ((f & -4) != 4 && ((f & -4) != 8 && ((f & -4) != 0xc && ((f & -0x10) != 0x10 && ((f & -8) != 0x20 && (f & -8) != 0x28)))))) {
			const args: OpenPositionV2Args = ix_args
			st64(s200, args.tick_lower_index)
			st64(s208, args.tick_upper_index)
			st64(s210, args.tick_array_lower_start_index)
			st64(s220, args.tick_array_upper_start_index)
			copyr(s1f8, args.liquidity, 0x10)
			st64(s218, args.amount_0_max)
			st64(s228, args.amount_1_max)
			st64(s190, args + 0x30, f - 0x30)
			fn_145f8(sc8, s190, args)
			k = ld64(sc8 + 8)
			if (ld8(sc8) != 0) {
				break B13
			}
			st64(s230, ld8(sc8 + 1))
			fn_17748(sc8, s190, h, i, j, k)
			k = ld64(sc8 + 8)
			if (ld8(sc8) != 0) {
				break B13
			}
			st64(s238, ld8(sc8 + 1))
			st8(s1a3 + 2, 0xff)
			st16(s1a3, 0xffff)
			st64(s1a0 + 8, accounts_len)
			st64(s1a0, ld64(s1e8))
			st64(s1000, f, s1a3)
			s = accounts_open_position_v2(sc8, ld64(s1e8 + 8), s1a0, args, fp, k)
			const l = ld64(sc8)
			if (l == 0) {
				p = ld64(sc8 + 8)
				st64(a + 8, ld64(sb8))
				st64(a, p)
				return s
			}
			const n = ld64(sc8 + 8)
			const m = ld64(sb8)
			memcpy(s178, sb0, 0xb0)
			st64(s190 + 0x10, m)
			const o = ld64(s1e8 + 8)
			st64(s190, l, n)
			st16(sb0 + 8, ld16(s1a3))
			st8(sb0 + 0xa, ld8(s1a3 + 2))
			copyr(sb8, s1a0, 0x10)
			st64(sc8, o, s190)
			st64(s1000 + 0x38, ld64(s238))
			st64(s1000 + 0x30, ld64(s230) & 1)
			st64(s1000 + 0x28, ld64(s220))
			st64(s1000 + 0x20, ld64(s210))
			st64(s1000 + 0x18, ld64(s208))
			st64(s1000 + 0x10, ld64(s200))
			st64(s1000 + 8, ld64(s228))
			st64(s1000, ld64(s218))
			s = fn_25a60(s1b8, sc8, ld64(s1f8), ld64(s1f8 + 8), ld64(s1000), ld64(s1000 + 8), ld64(s1000 + 0x10), ld64(s1000 + 0x18), ld64(s1000 + 0x20), ld64(s1000 + 0x28), ld64(s1000 + 0x30), ld64(s1000 + 0x38))
			p = ld64(s1b8)
			if (p == 2) {
				s = fn_a09c8(s1c8, s190, o)
				p = ld64(s1c8)
				st64(a + 8, ld64(s1c8 + 8))
				st64(a, p)
				return s
			}
			st64(a + 8, ld64(s1b8 + 8))
			st64(a, p)
			return s
		}
		k = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	}
	const q = k
	if (2 > (k & 3) - 2) {
		s = anchor_error_from(s1d8, 0x66 /* anchor::InstructionDidNotDeserialize */, h, i, j)
		p = ld64(s1d8)
		st64(a + 8, ld64(s1d8 + 8))
		st64(a, p)
		return s
	}
	if ((q & 3) == 0) {
		s = anchor_error_from(s1d8, 0x66 /* anchor::InstructionDidNotDeserialize */, h, i, j)
		p = ld64(s1d8)
		st64(a + 8, ld64(s1d8 + 8))
		st64(a, p)
		return s
	}
	const r = ld64(ld64(k + 7))
	if (r == 0) {
		s = anchor_error_from(s1d8, 0x66 /* anchor::InstructionDidNotDeserialize */, h, i, j)
		p = ld64(s1d8)
		st64(a + 8, ld64(s1d8 + 8))
		st64(a, p)
		return s
	}
	callx(r, ld64(k - 1), r)
	s = anchor_error_from(s1d8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	p = ld64(s1d8)
	st64(a + 8, ld64(s1d8 + 8))
	st64(a, p)
	return s
}

// Anchor Accounts::try_accounts of instruction open_position_v2 (called by ix_open_position_v2; name [str]: from the handler's "Instruction: …" log; was fn_99848)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: pool_state (ConstraintMut), protocol_position (AccountNotEnoughKeys), tick_array_lower (ConstraintSeeds, ConstraintMut), tick_array_upper (AccountNotEnoughKeys, ConstraintSeeds, ConstraintMut), token_account_0 (ConstraintMut), token_account_1 (ConstraintMut), token_vault_0 (ConstraintMut, ConstraintRaw), token_vault_1 (ConstraintMut, ConstraintRaw), rent, system_program, token_program, associated_token_program, metadata_program, token_program_2022, vault_0_mint (ConstraintAddress), vault_1_mint (ConstraintAddress), metadata_account (ConstraintMut), payer (ConstraintMut), personal_position (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), position_nft_account (ConstraintMut, ConstraintRentExempt), position_nft_mint (ConstraintMut, ConstraintSigner, ConstraintRentExempt)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: token_vault_1_box, vault_0_mint_box, vault_1_mint_box, token_vault_0_box, token_vault_1_box_2, token_vault_0_box_2, token_vault_1_box_3, payer [idl], position_nft_mint [idl], position_nft_account [idl], personal_position [idl], token_vault_0, token_vault_1
export function accounts_open_position_v2(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s60 = fp - 0x60, s80 = fp - 0x80, sa0 = fp - 0xa0, sc0 = fp - 0xc0, se0 = fp - 0xe0, se4 = fp - 0xe4, s108 = fp - 0x108, s128 = fp - 0x128, s148 = fp - 0x148, s168 = fp - 0x168, s188 = fp - 0x188, s1b8 = fp - 0x1b8, s1d8 = fp - 0x1d8, s1d9 = fp - 0x1d9, s200 = fp - 0x200, s218 = fp - 0x218, s230 = fp - 0x230, s248 = fp - 0x248, s260 = fp - 0x260, s278 = fp - 0x278, s290 = fp - 0x290, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8, s2b0 = fp - 0x2b0, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2c8 = fp - 0x2c8, s2d0 = fp - 0x2d0, s2d8 = fp - 0x2d8, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s510 = fp - 0x510, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s560 = fp - 0x560, s570 = fp - 0x570, s580 = fp - 0x580, s590 = fp - 0x590, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s700 = fp - 0x700, s710 = fp - 0x710, s720 = fp - 0x720, s730 = fp - 0x730, s740 = fp - 0x740, s750 = fp - 0x750, s760 = fp - 0x760, s770 = fp - 0x770, s780 = fp - 0x780, s790 = fp - 0x790, s7a0 = fp - 0x7a0, s7b0 = fp - 0x7b0, s7c0 = fp - 0x7c0, s7d0 = fp - 0x7d0, s7e0 = fp - 0x7e0, s7f0 = fp - 0x7f0, s800 = fp - 0x800, s810 = fp - 0x810, s820 = fp - 0x820, s8a0 = fp - 0x8a0, s8a8 = fp - 0x8a8, s8b0 = fp - 0x8b0, s8b8 = fp - 0x8b8, s8c0 = fp - 0x8c0, s8c8 = fp - 0x8c8, s8d0 = fp - 0x8d0, s8d8 = fp - 0x8d8, s8e0 = fp - 0x8e0, s8e8 = fp - 0x8e8, s8f0 = fp - 0x8f0, s8f8 = fp - 0x8f8
	let i, j, m, n, t, z, aa, ab, ad, ae, al, am, ao, ap, ar, at, av, aw, bb, bc, be, bf, bh, bi, bl, bm, bp, bq, bt, bu, cq, cr: u64
	let token_vault_1_box: TokenAccount
	st64(s2e0, b)
	const f = ld64(e - 0x1000)
	if (f >= 4) {
		const cl = ld64(e - 0xff8)
		if ((f & -4) > 0xc || ((1 << (f & -4 & 0x3f)) & 0x1110) == 0) {
			st64(s8a0 + 0x78, ld32(d + 0xc))
			st64(s8a0 + 0x70, ld32(d + 8))
			j = try_accounts_17a30(s40, c, c, d, e, r0)
			const payer: AccountInfo = ld64(s38)
			i = ld64(s40)
			if (i == 2) {
				st64(s2d8, payer)
				const l = ld64(c + 8)
				if (l != 0) {
					t = ld64(c)
					st64(c, t + 0x30, l - 1)
					st64(s2d0, t)
					if (l == 1) {
						j = anchor_error_from(s810, 0xbbd /* anchor::AccountNotEnoughKeys */, m, n, t)
						i = ld64(s810)
						st64(a + 0x10, ld64(s810 + 8))
						st64(a + 8, i)
						st64(a, 0)
						return j
					}
					const u: AccountInfo = ld64(c)
					st64(s2c8, u)
					let v = l - 2
					st64(c + 8, v)
					st64(c, u + 0x30)
					if (v != 0) {
						st64(s8a0 + 0x68, t)
						st64(s2c0, u + 0x30)
						let w = l - 3
						st64(c + 8, w)
						j = u + 0x60
						st64(c, j)
						if (w == 0) {
							anchor_error_from(s2f0, 0xbbd /* anchor::AccountNotEnoughKeys */, w, v, t)
							w = undef
							v = undef
							t = undef
							j = ld64(s2f0 + 8)
							i = ld64(s2f0)
							if (i != 2) {
								const af = ld64(0x300000000 /* heap bump-allocator cursor */)
								const ag = af != 0 ? sat_sub(af, 0x10) : 0x300007ff0
								if ((i & 1) != 0) {
									if (0x300000008 > ag) {
										raw_vec_handle_error(1, 0x10, 0x10015f8f8, sat_sub(af, 0x10), 0x10 > af)
									}
									st64(0x300000000 /* heap bump-allocator cursor */, ag)
									st64(ag + 8, 0x746e756f6363615f)
									st64(ag, 0x617461646174656d)
									void ld64(j)
								} else {
									if (0x300000008 > ag) {
										raw_vec_handle_error(1, 0x10, 0x10015f8f8, sat_sub(af, 0x10), 0x10 > af)
									}
									st64(0x300000000 /* heap bump-allocator cursor */, ag)
									st64(ag + 8, 0x746e756f6363615f)
									st64(ag, 0x617461646174656d)
									void ld64(j)
								}
								st64(j + 0x10, ag, 0x10)
								st64(j + 8, 0x10)
								st64(j, 1)
								st64(a + 0x10, j)
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
						} else {
							st64(c + 8, l - 4)
							st64(c, u + 0x90)
						}
						st64(s8a0 + 0x60, j)
						fn_11e0(s40, c, w, v, t)
						token_vault_1_box = ld64(s38)
						const x = ld64(s40)
						if (x != 2) {
							j = fn_4130(s300, x, token_vault_1_box, "pool_state", 0xa)
							token_vault_1_box = ld64(s300 + 8)
							i = ld64(s300)
							if (i != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
						}
						B49: {
							B46: {
								B34: {
									B31: {
										st64(s8a0 + 0x58, token_vault_1_box)
										st64(s2b8, token_vault_1_box)
										const y = ld64(c + 8)
										if (y == 0) {
											anchor_error_from(s310, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_1_box, aa, ab)
											token_vault_1_box = ld64(s310 + 8)
											const ah = ld64(s310)
											if (ah == 2) {
												break B31
											}
											j = fn_4130(s320, ah, token_vault_1_box, 0x10015aff1 /* "protocol_position" */, 0x11)
											token_vault_1_box = ld64(s320 + 8)
											i = ld64(s320)
											if (i != 2) {
												st64(a + 0x10, token_vault_1_box)
												st64(a + 8, i)
												st64(a, 0)
												return j
											}
											z = ld64(c + 8)
											if (z == 0) {
												break B31
											}
										} else {
											token_vault_1_box = ld64(c)
											st64(c, token_vault_1_box.mint + 8)
											z = y - 1
											st64(c + 8, z)
											if (z == 0) {
												break B31
											}
										}
										st64(s8a0 + 0x50, token_vault_1_box)
										token_vault_1_box = ld64(c)
										st64(c, token_vault_1_box.mint + 8)
										ad = z - 1
										st64(c + 8, ad)
										if (ad == 0) {
											break B46
										}
										break B34
									}
									st64(s8a0 + 0x50, token_vault_1_box)
									anchor_error_from(s330, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_1_box, aa, ab)
									token_vault_1_box = ld64(s330 + 8)
									const ac = ld64(s330)
									if (ac == 2) {
										break B46
									}
									j = fn_4130(s340, ac, token_vault_1_box, "tick_array_lower", 0x10)
									token_vault_1_box = ld64(s340 + 8)
									i = ld64(s340)
									if (i != 2) {
										st64(a + 0x10, token_vault_1_box)
										st64(a + 8, i)
										st64(a, 0)
										return j
									}
									ad = ld64(c + 8)
									if (ad == 0) {
										break B46
									}
								}
								st64(s8a0 + 0x48, token_vault_1_box)
								token_vault_1_box = ld64(c)
								st64(c, token_vault_1_box.mint + 8)
								ae = ad - 1
								st64(c + 8, ae)
								if (ae == 0) {
									j = anchor_error_from(s7e0, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_1_box, aa, ab)
									i = ld64(s7e0)
									st64(a + 0x10, ld64(s7e0 + 8))
									st64(a + 8, i)
									st64(a, 0)
									return j
								}
								break B49
							}
							st64(s8a0 + 0x48, token_vault_1_box)
							anchor_error_from(s350, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_1_box, aa, ab)
							token_vault_1_box = undef
							const ai = ld64(s350)
							if (ai == 2) {
								j = anchor_error_from(s7e0, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_1_box, aa, ab)
								i = ld64(s7e0)
								st64(a + 0x10, ld64(s7e0 + 8))
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
							j = fn_4130(s360, ai, ld64(s350 + 8), "tick_array_upper", 0x10)
							token_vault_1_box = ld64(s360 + 8)
							i = ld64(s360)
							if (i != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
							ae = ld64(c + 8)
							if (ae == 0) {
								j = anchor_error_from(s7e0, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_1_box, aa, ab)
								i = ld64(s7e0)
								st64(a + 0x10, ld64(s7e0 + 8))
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
						}
						st64(s8a0 + 0x38, token_vault_1_box)
						const aj: AccountInfo = ld64(c)
						st64(s2b0, aj)
						st64(c + 8, ae - 1)
						st64(s8a0 + 0x40, aj)
						st64(c, aj + 0x30)
						fn_7498(s40, c, token_vault_1_box, aa, ab)
						token_vault_1_box = ld64(s38)
						const ak = ld64(s40)
						if (ak != 2) {
							j = fn_4130(s370, ak, token_vault_1_box, "token_account_0", 0xf)
							token_vault_1_box = ld64(s370 + 8)
							i = ld64(s370)
							if (i != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
						}
						st64(s8a0 + 0x30, token_vault_1_box)
						fn_7498(s40, c, token_vault_1_box, al, am)
						token_vault_1_box = ld64(s38)
						const an = ld64(s40)
						if (an != 2) {
							j = fn_4130(s380, an, token_vault_1_box, "token_account_1", 0xf)
							token_vault_1_box = ld64(s380 + 8)
							i = ld64(s380)
							if (i != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
						}
						st64(s8a0 + 0x28, token_vault_1_box)
						fn_7498(s40, c, token_vault_1_box, ao, ap)
						token_vault_1_box = ld64(s38)
						const aq = ld64(s40)
						if (aq != 2) {
							j = fn_4130(s390, aq, token_vault_1_box, "token_vault_0", 0xd)
							token_vault_1_box = ld64(s390 + 8)
							i = ld64(s390)
							if (i != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
						}
						st64(s8a0 + 0x20, token_vault_1_box)
						fn_7498(s40, c, token_vault_1_box, ar, at)
						token_vault_1_box = ld64(s38)
						const au = ld64(s40)
						if (au != 2) {
							j = fn_4130(s3a0, au, token_vault_1_box, "token_vault_1", 0xd)
							token_vault_1_box = ld64(s3a0 + 8)
							i = ld64(s3a0)
							if (i != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
						}
						st64(s8a0 + 0x18, token_vault_1_box)
						try_accounts_17ae0(s40, c, token_vault_1_box, av, aw)
						const az = ld64(s38 + 8)
						const ay = ld64(s38)
						const ax = ld64(s40)
						if (ax == 0) {
							j = fn_4130(s7d0, ay, az, 0x1001598f8 /* "rent" */, 4)
							i = ld64(s7d0)
							st64(a + 0x10, ld64(s7d0 + 8))
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
						st64(s8a0, ax, ay, az)
						st64(s8a8, ld64(s38 + 0x10))
						try_accounts_18870(s40, c, az)
						token_vault_1_box = ld64(s38)
						const ba = ld64(s40)
						if (ba != 2) {
							j = fn_4130(s3b0, ba, token_vault_1_box, "system_program", 0xe)
							token_vault_1_box = ld64(s3b0 + 8)
							i = ld64(s3b0)
							if (i != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
						}
						st64(s8b0, token_vault_1_box)
						st64(s2a8, token_vault_1_box)
						try_accounts_19190(s40, c, token_vault_1_box, bb, bc)
						token_vault_1_box = ld64(s38)
						const bd = ld64(s40)
						if (bd != 2) {
							j = fn_4130(s3c0, bd, token_vault_1_box, 0x10015b020 /* "token_program" */, 0xd)
							token_vault_1_box = ld64(s3c0 + 8)
							i = ld64(s3c0)
							if (i != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
						}
						st64(s8b8, token_vault_1_box)
						st64(s2a0, token_vault_1_box)
						try_accounts_18f40(s40, c, token_vault_1_box, be, bf)
						token_vault_1_box = ld64(s38)
						const bg = ld64(s40)
						if (bg != 2) {
							j = fn_4130(s3d0, bg, token_vault_1_box, "associated_token_program", 0x18)
							token_vault_1_box = ld64(s3d0 + 8)
							i = ld64(s3d0)
							if (i != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
						}
						st64(s8c8, token_vault_1_box)
						st64(s298, token_vault_1_box)
						try_accounts_18aa0(s40, c, token_vault_1_box, bh, bi)
						let bk = ld64(s38)
						const bj = ld64(s40)
						if (bj != 2) {
							j = fn_4130(s3e0, bj, bk, "metadata_program", 0x10)
							bk = undef
							st64(s8c0, ld64(s3e0 + 8))
							i = ld64(s3e0)
							if (i != 2) {
								st64(a + 0x10, ld64(s8c0))
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
						} else {
							st64(s8c0, bk)
						}
						fn_18cf0(s40, c, bk, bl, bm)
						let bo = ld64(s38)
						const bn = ld64(s40)
						if (bn != 2) {
							j = fn_4130(s3f0, bn, bo, "token_program_2022", 0x12)
							bo = undef
							st64(s8d0, ld64(s3f0 + 8))
							i = ld64(s3f0)
							if (i != 2) {
								st64(a + 0x10, ld64(s8d0))
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
						} else {
							st64(s8d0, bo)
						}
						fn_7768(s40, c, bo, bp, bq)
						let vault_0_mint_box: Mint = ld64(s38)
						const br = ld64(s40)
						if (br != 2) {
							j = fn_4130(s400, br, vault_0_mint_box, "vault_0_mint", 0xc)
							vault_0_mint_box = undef
							st64(s8d8, ld64(s400 + 8))
							i = ld64(s400)
							if (i != 2) {
								st64(a + 0x10, ld64(s8d8))
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
						} else {
							st64(s8d8, vault_0_mint_box)
						}
						fn_7768(s40, c, vault_0_mint_box, bt, bu)
						const vault_1_mint_box: Mint = ld64(s38)
						const bv = ld64(s40)
						if (bv != 2) {
							j = fn_4130(s410, bv, vault_1_mint_box, "vault_1_mint", 0xc)
							st64(s8e0, ld64(s410 + 8))
							i = ld64(s410)
							if (i != 2) {
								st64(a + 0x10, ld64(s8e0))
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
						} else {
							st64(s8e0, vault_1_mint_box)
						}
						rent_get(s40)
						copy(s278, s38, 0x18)
						if (ld64(s40) != 0) {
							j = fn_13e628(s7c0, s278)
							i = ld64(s7c0)
							st64(a + 0x10, ld64(s7c0 + 8))
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
						copyr(s290, s278, 0x18)
						st64(s40, s2c8, s290, s2d8, s2a8, s2a0, s2b8)
						j = fn_9d268(s1b8, s40)
						st64(s8e8, ld64(s1b8 + 8))
						i = ld64(s1b8)
						if (i == 2) {
							const position_nft_mint: AccountInfo = ld64(ld64(s8e8) + 0x58)
							if (position_nft_mint.is_writable != 0) {
								if (position_nft_mint.is_signer != 0) {
									AccountInfo_clone_f338(s1b8, position_nft_mint)
									st64(s8f0, fn_147a20(s1b8))
									AccountInfo_clone_f338(s40, ld64(ld64(s8e8) + 0x58))
									AccountInfo_try_data_len(s108, s40)
									const bz = ld64(s108 + 8)
									const by = ld64(s108)
									if (by != 0x800000000000001a /* Ok */) {
										st64(s108 + 0x10, ld64(s108 + 0x10))
										st64(s108, by, bz)
										cr = fn_13e628(s460, s108)
										cq = ld64(s460)
										st64(a + 0x10, ld64(s460 + 8))
										st64(a + 8, cq)
										st64(a, 0)
										return ptr_drop_in_place_fcd8(s1b8, ptr_drop_in_place_fcd8(s40, cr))
									}
									const ca = Rent_is_exempt(s290, ld64(s8f0), bz)
									ptr_drop_in_place_fcd8(s1b8, ptr_drop_in_place_fcd8(s40, ca))
									if (ca != 0) {
										rent_get(s40)
										copy(s248, s38, 0x18)
										if (ld64(s40) != 0) {
											j = fn_13e628(s7b0, s248)
											i = ld64(s7b0)
											st64(a + 0x10, ld64(s7b0 + 8))
											st64(a + 8, i)
											st64(a, 0)
											return j
										}
										copyr(s260, s248, 0x18)
										st64(s18, s2a8, s2a0)
										st64(s20, ld64(s8e8))
										st64(s40, s2c0, s298, s2d8, s2d0)
										j = fn_960a0(s1b8, s40)
										st64(s8f0, ld64(s1b8 + 8))
										i = ld64(s1b8)
										if (i == 2) {
											const position_nft_account: AccountInfo = ld64(ld64(s8f0))
											if (position_nft_account.is_writable != 0) {
												AccountInfo_clone_f338(s1b8, position_nft_account)
												st64(s8f8, fn_147a20(s1b8))
												AccountInfo_clone_f338(s40, ld64(ld64(s8f0)))
												AccountInfo_try_data_len(s108, s40)
												const cd = ld64(s108 + 8)
												const cc = ld64(s108)
												if (cc != 0x800000000000001a /* Ok */) {
													st64(s108 + 0x10, ld64(s108 + 0x10))
													st64(s108, cc, cd)
													cr = fn_13e628(s4b0, s108)
													cq = ld64(s4b0)
													st64(a + 0x10, ld64(s4b0 + 8))
													st64(a + 8, cq)
													st64(a, 0)
													return ptr_drop_in_place_fcd8(s1b8, ptr_drop_in_place_fcd8(s40, cr))
												}
												const ce = Rent_is_exempt(s260, ld64(s8f8), cd)
												ptr_drop_in_place_fcd8(s1b8, ptr_drop_in_place_fcd8(s40, ce))
												if (ce != 0) {
													rent_get(s40)
													copy(s218, s38, 0x18)
													if (ld64(s40) != 0) {
														j = fn_13e628(s7a0, s218)
														i = ld64(s7a0)
														st64(a + 0x10, ld64(s7a0 + 8))
														st64(a + 8, i)
														st64(a, 0)
														return j
													}
													copyr(s230, s218, 0x18)
													const cf = ld64(ld64(ld64(s8e8) + 0x58))
													const cj = ld64(cf)
													const ci = ld64(cf + 8)
													const ch = ld64(cf + 0x10)
													const cg = ld64(cf + 0x18)
													st64(s108, 0x100159360)
													st64(s108 + 0x10, s1b8)
													st64(s1b8, cj, ci, ch, cg)
													st64(s108 + 8, 8)
													st64(s108 + 0x18, 0x20)
													// PDA find_program_address(["position", *s1b8], program *(ld64(s2e0)))
													Pubkey_find_program_address(s40, s108, 2, ld64(s2e0))
													copyr(s200, s40, 0x20)
													const ck = ld8(s20)
													st8(s1d9, ck)
													st8(cl + 2, ck)
													const cm = ld64(ld64(s8a0 + 0x40))
													copyr(s1d8, cm, 0x20)
													if ((memcmp(s1d8, s200, 0x20) as u32) == 0) {
														st64(s18, s1d9, s2e0)
														st64(s20, ld64(s8e8))
														st64(s40, s2b0, s230, s2d8, s2a8)
														j = fn_9eed0(s1b8, s40)
														st64(s8a0 + 0x40, ld64(s1b8 + 8))
														i = ld64(s1b8)
														if (i == 2) {
															const personal_position: AccountInfo = ld64(ld64(s8a0 + 0x40))
															if (personal_position.is_writable != 0) {
																AccountInfo_clone_f338(s1b8, personal_position)
																st64(s8f8, fn_147a20(s1b8))
																AccountInfo_clone_f338(s40, ld64(ld64(s8a0 + 0x40)))
																AccountInfo_try_data_len(s108, s40)
																const cu = ld64(s108 + 8)
																const ct = ld64(s108)
																if (ct != 0x800000000000001a /* Ok */) {
																	st64(s108 + 0x10, ld64(s108 + 0x10))
																	st64(s108, ct, cu)
																	cr = fn_13e628(s530, s108)
																	cq = ld64(s530)
																	st64(a + 0x10, ld64(s530 + 8))
																	st64(a + 8, cq)
																	st64(a, 0)
																	return ptr_drop_in_place_fcd8(s1b8, ptr_drop_in_place_fcd8(s40, cr))
																}
																const cv = Rent_is_exempt(s230, ld64(s8f8), cu)
																ptr_drop_in_place_fcd8(s1b8, ptr_drop_in_place_fcd8(s40, cv))
																if (cv != 0) {
																	if (payer.is_writable != 0) {
																		if (ld8(ld64(s8a0 + 0x60) + 0x29) != 0) {
																			if (ld8(ld64(s8a0 + 0x58) + 0x29 /* is_writable */) != 0) {
																				const cw = ld64(ld64(s8a0 + 0x58) /* key */)
																				copyr(s168, cw, 0x20)
																				st64(s40, 0x10015a23e)
																				st64(s38 + 8, s168)
																				st64(s20, s108)
																				st32(s108, bswap32(ld64(s8a0 + 0x70)))
																				st64(s38, 0xa)
																				st64(s38 + 0x10, 0x20)
																				st64(s18, 4)
																				// PDA find_program_address(["tick_array", *cw, u32 bswap32(ld64(s8a0 + 0x70)) [ix data?]], program *(ld64(s2e0)))
																				Pubkey_find_program_address(s1b8, s40, 3, ld64(s2e0))
																				copyr(s188, s1b8, 0x20)
																				st8(cl, ld8(s1b8 + 0x20))
																				const cx = ld64(ld64(s8a0 + 0x48) /* key */)
																				copyr(s148, cx, 0x20)
																				if ((memcmp(s148, s188, 0x20) as u32) != 0) {
																					anchor_error_from(s5c0, 0x7d6 /* anchor::ConstraintSeeds */)
																					const db = fn_4130(s5d0, ld64(s5c0), ld64(s5c0 + 8), "tick_array_lower", 0x10)
																					const da = ld64(s5d0 + 8)
																					const cz = ld64(s5d0)
																					copyr(s40, s148, 0x20)
																					copy(s20, s188, 0x20)
																					j = Error_with_pubkeys(s5e0, cz, da, s40, db)
																					i = ld64(s5e0)
																					st64(a + 0x10, ld64(s5e0 + 8))
																					st64(a + 8, i)
																					st64(a, 0)
																					return j
																				}
																				if (ld8(ld64(s8a0 + 0x48) + 0x29 /* is_writable */) != 0) {
																					copyr(s108, s168, 0x20)
																					st64(s20, se4)
																					st64(s38 + 8, s108)
																					st64(s40, 0x10015a23e)
																					st32(se4, bswap32(ld64(s8a0 + 0x78)))
																					st64(s18, 4)
																					st64(s38 + 0x10, 0x20)
																					st64(s38, 0xa)
																					// PDA find_program_address(["tick_array", *s108, u32 bswap32(ld64(s8a0 + 0x78)) [ix data?]], program *(ld64(s2e0)))
																					Pubkey_find_program_address(s1b8, s40, 3, ld64(s2e0))
																					copyr(s128, s1b8, 0x20)
																					st8(cl + 1, ld8(s1b8 + 0x20))
																					const cy = ld64(ld64(s8a0 + 0x38) /* key */)
																					copyr(se0, cy, 0x20)
																					if ((memcmp(se0, s128, 0x20) as u32) != 0) {
																						anchor_error_from(s610, 0x7d6 /* anchor::ConstraintSeeds */)
																						const de = fn_4130(s620, ld64(s610), ld64(s610 + 8), "tick_array_upper", 0x10)
																						const dd = ld64(s620 + 8)
																						const dc = ld64(s620)
																						copyr(s40, se0, 0x20)
																						copy(s20, s128, 0x20)
																						j = Error_with_pubkeys(s630, dc, dd, s40, de)
																						i = ld64(s630)
																						st64(a + 0x10, ld64(s630 + 8))
																						st64(a + 8, i)
																						st64(a, 0)
																						return j
																					}
																					if (ld8(ld64(s8a0 + 0x38) + 0x29 /* is_writable */) != 0) {
																						if (ld8(ld64(ld64(s8a0 + 0x30) + 0x20) + 0x29) != 0) {
																							const token_vault_0_box: TokenAccount = ld64(s8a0 + 0x20)
																							copyr(s40, token_vault_0_box.mint, 0x20)
																							if ((memcmp(ld64(s8a0 + 0x30) + 0x28, s40, 0x20) as u32) != 0) {
																								j = anchor_error_from(s680, 0x7de /* anchor::ConstraintTokenMint */)
																								i = ld64(s680)
																								st64(a + 0x10, ld64(s680 + 8))
																								st64(a + 8, i)
																								st64(a, 0)
																								return j
																							}
																							if (ld8(ld64(ld64(s8a0 + 0x28) + 0x20) + 0x29) != 0) {
																								const token_vault_1_box_2: TokenAccount = ld64(s8a0 + 0x18)
																								copyr(s40, token_vault_1_box_2.mint, 0x20)
																								const dh = memcmp(ld64(s8a0 + 0x28) + 0x28, s40, 0x20)
																								if ((dh as u32) != 0) {
																									j = anchor_error_from(s6b0, 0x7de /* anchor::ConstraintTokenMint */)
																									i = ld64(s6b0)
																									st64(a + 0x10, ld64(s6b0 + 8))
																									st64(a + 8, i)
																									st64(a, 0)
																									return j
																								}
																								const token_vault_0: AccountInfo = ld64(ld64(s8a0 + 0x20) + 0x20)
																								if (token_vault_0.is_writable != 0) {
																									const dj = token_vault_0.key
																									copyr(s40, dj, 0x20)
																									j = fn_4dc0(s1b8, ld64(s2b8), dh as u32)
																									let dl = ld64(s1b8 + 0x10)
																									let dk = ld64(s1b8 + 8)
																									if (ld64(s1b8) != 0) {
																										st64(a + 0x10, dl)
																										st64(a + 8, dk)
																										st64(a, 0)
																										return j
																									}
																									const dm = memcmp(s40, dk + 0x81, 0x20)
																									st64(dl, ld64(dl) - 1)
																									if ((dm as u32) == 0) {
																										const token_vault_1: AccountInfo = ld64(ld64(s8a0 + 0x18) + 0x20)
																										if (token_vault_1.is_writable != 0) {
																											const dp = token_vault_1.key
																											copyr(s40, dp, 0x20)
																											j = fn_4dc0(s1b8, ld64(s2b8), dm as u32)
																											dl = ld64(s1b8 + 0x10)
																											dk = ld64(s1b8 + 8)
																											if (ld64(s1b8) != 0) {
																												st64(a + 0x10, dl)
																												st64(a + 8, dk)
																												st64(a, 0)
																												return j
																											}
																											const dq = memcmp(s40, dk + 0xa1, 0x20)
																											st64(dl, ld64(dl) - 1)
																											if ((dq as u32) == 0) {
																												const token_vault_0_box_2: TokenAccount = ld64(s8a0 + 0x20)
																												const ds = ld64(ld64(ld64(s8d8) + 0x58))
																												copyr(sc0, ds, 0x20)
																												copy(sa0, token_vault_0_box_2.mint, 0x20)
																												if ((memcmp(sc0, sa0, 0x20) as u32) != 0) {
																													anchor_error_from(s740, 0x7dc /* anchor::ConstraintAddress */)
																													const ea = fn_4130(s750, ld64(s740), ld64(s740 + 8), "vault_0_mint", 0xc)
																													const dz = ld64(s750 + 8)
																													const dy = ld64(s750)
																													copy(s40, sc0, 0x40)
																													j = Error_with_pubkeys(s760, dy, dz, s40, ea)
																													i = ld64(s760)
																													st64(a + 0x10, ld64(s760 + 8))
																													st64(a + 8, i)
																													st64(a, 0)
																													return j
																												}
																												const token_vault_1_box_3: TokenAccount = ld64(s8a0 + 0x18)
																												const du = ld64(ld64(ld64(s8e0) + 0x58))
																												copyr(s80, du, 0x20)
																												copy(s60, token_vault_1_box_3.mint, 0x20)
																												j = memcmp(s80, s60, 0x20) as u32
																												if (j == 0) {
																													st64(a + 0xc0, ld64(s8e0))
																													st64(a + 0xb8, ld64(s8d8))
																													st64(a + 0xb0, ld64(s8d0))
																													st64(a + 0xa8, ld64(s8c0))
																													st64(a + 0xa0, ld64(s8c8))
																													st64(a + 0x98, ld64(s8b8))
																													st64(a + 0x90, ld64(s8b0))
																													st64(a + 0x88, ld64(s8a8))
																													st64(a + 0x80, ld64(s8a0 + 0x10))
																													st64(a + 0x78, ld64(s8a0 + 8))
																													st64(a + 0x70, ld64(s8a0))
																													st64(a + 0x68, ld64(s8a0 + 0x18))
																													st64(a + 0x60, ld64(s8a0 + 0x20))
																													st64(a + 0x58, ld64(s8a0 + 0x28))
																													st64(a + 0x50, ld64(s8a0 + 0x30))
																													st64(a + 0x48, ld64(s8a0 + 0x40))
																													st64(a + 0x40, ld64(s8a0 + 0x38))
																													st64(a + 0x38, ld64(s8a0 + 0x48))
																													st64(a + 0x30, ld64(s8a0 + 0x50))
																													st64(a + 0x28, ld64(s8a0 + 0x58))
																													st64(a + 0x20, ld64(s8a0 + 0x60))
																													st64(a + 0x18, ld64(s8f0))
																													st64(a + 0x10, ld64(s8e8))
																													st64(a + 8, ld64(s8a0 + 0x68))
																													st64(a, payer)
																													return j
																												}
																												anchor_error_from(s770, 0x7dc /* anchor::ConstraintAddress */)
																												const dx = fn_4130(s780, ld64(s770), ld64(s770 + 8), "vault_1_mint", 0xc)
																												const dw = ld64(s780 + 8)
																												const dv = ld64(s780)
																												copy(s40, s80, 0x40)
																												j = Error_with_pubkeys(s790, dv, dw, s40, dx)
																												i = ld64(s790)
																												st64(a + 0x10, ld64(s790 + 8))
																												st64(a + 8, i)
																												st64(a, 0)
																												return j
																											}
																											anchor_error_from(s720, 0x7d3 /* anchor::ConstraintRaw */)
																											j = fn_4130(s730, ld64(s720), ld64(s720 + 8), "token_vault_1", 0xd)
																											i = ld64(s730)
																											st64(a + 0x10, ld64(s730 + 8))
																											st64(a + 8, i)
																											st64(a, 0)
																											return j
																										}
																										anchor_error_from(s700, 0x7d0 /* anchor::ConstraintMut */)
																										j = fn_4130(s710, ld64(s700), ld64(s700 + 8), "token_vault_1", 0xd)
																										i = ld64(s710)
																										st64(a + 0x10, ld64(s710 + 8))
																										st64(a + 8, i)
																										st64(a, 0)
																										return j
																									}
																									anchor_error_from(s6e0, 0x7d3 /* anchor::ConstraintRaw */)
																									j = fn_4130(s6f0, ld64(s6e0), ld64(s6e0 + 8), "token_vault_0", 0xd)
																									i = ld64(s6f0)
																									st64(a + 0x10, ld64(s6f0 + 8))
																									st64(a + 8, i)
																									st64(a, 0)
																									return j
																								}
																								anchor_error_from(s6c0, 0x7d0 /* anchor::ConstraintMut */)
																								j = fn_4130(s6d0, ld64(s6c0), ld64(s6c0 + 8), "token_vault_0", 0xd)
																								i = ld64(s6d0)
																								st64(a + 0x10, ld64(s6d0 + 8))
																								st64(a + 8, i)
																								st64(a, 0)
																								return j
																							}
																							anchor_error_from(s690, 0x7d0 /* anchor::ConstraintMut */)
																							j = fn_4130(s6a0, ld64(s690), ld64(s690 + 8), "token_account_1", 0xf)
																							i = ld64(s6a0)
																							st64(a + 0x10, ld64(s6a0 + 8))
																							st64(a + 8, i)
																							st64(a, 0)
																							return j
																						}
																						anchor_error_from(s660, 0x7d0 /* anchor::ConstraintMut */)
																						j = fn_4130(s670, ld64(s660), ld64(s660 + 8), "token_account_0", 0xf)
																						i = ld64(s670)
																						st64(a + 0x10, ld64(s670 + 8))
																						st64(a + 8, i)
																						st64(a, 0)
																						return j
																					}
																					anchor_error_from(s640, 0x7d0 /* anchor::ConstraintMut */)
																					j = fn_4130(s650, ld64(s640), ld64(s640 + 8), "tick_array_upper", 0x10)
																					i = ld64(s650)
																					st64(a + 0x10, ld64(s650 + 8))
																					st64(a + 8, i)
																					st64(a, 0)
																					return j
																				}
																				anchor_error_from(s5f0, 0x7d0 /* anchor::ConstraintMut */)
																				j = fn_4130(s600, ld64(s5f0), ld64(s5f0 + 8), "tick_array_lower", 0x10)
																				i = ld64(s600)
																				st64(a + 0x10, ld64(s600 + 8))
																				st64(a + 8, i)
																				st64(a, 0)
																				return j
																			}
																			anchor_error_from(s5a0, 0x7d0 /* anchor::ConstraintMut */)
																			j = fn_4130(s5b0, ld64(s5a0), ld64(s5a0 + 8), "pool_state", 0xa)
																			i = ld64(s5b0)
																			st64(a + 0x10, ld64(s5b0 + 8))
																			st64(a + 8, i)
																			st64(a, 0)
																			return j
																		}
																		anchor_error_from(s580, 0x7d0 /* anchor::ConstraintMut */)
																		j = fn_4130(s590, ld64(s580), ld64(s580 + 8), "metadata_account", 0x10)
																		i = ld64(s590)
																		st64(a + 0x10, ld64(s590 + 8))
																		st64(a + 8, i)
																		st64(a, 0)
																		return j
																	}
																	anchor_error_from(s560, 0x7d0 /* anchor::ConstraintMut */)
																	j = fn_4130(s570, ld64(s560), ld64(s560 + 8), "payer", 5)
																	i = ld64(s570)
																	st64(a + 0x10, ld64(s570 + 8))
																	st64(a + 8, i)
																	st64(a, 0)
																	return j
																}
																anchor_error_from(s540, 0x7d5 /* anchor::ConstraintRentExempt */)
																j = fn_4130(s550, ld64(s540), ld64(s540 + 8), 0x10015b06a /* "personal_position" */, 0x11)
																i = ld64(s550)
																st64(a + 0x10, ld64(s550 + 8))
																st64(a + 8, i)
																st64(a, 0)
																return j
															}
															anchor_error_from(s510, 0x7d0 /* anchor::ConstraintMut */)
															j = fn_4130(s520, ld64(s510), ld64(s510 + 8), 0x10015b06a /* "personal_position" */, 0x11)
															i = ld64(s520)
															st64(a + 0x10, ld64(s520 + 8))
															st64(a + 8, i)
															st64(a, 0)
															return j
														}
														st64(a + 0x10, ld64(s8a0 + 0x40))
														st64(a + 8, i)
														st64(a, 0)
														return j
													}
													anchor_error_from(s4e0, 0x7d6 /* anchor::ConstraintSeeds */)
													const cp = fn_4130(s4f0, ld64(s4e0), ld64(s4e0 + 8), 0x10015b06a /* "personal_position" */, 0x11)
													const co = ld64(s4f0 + 8)
													const cn = ld64(s4f0)
													copyr(s40, s1d8, 0x20)
													copy(s20, s200, 0x20)
													j = Error_with_pubkeys(s500, cn, co, s40, cp)
													i = ld64(s500)
													st64(a + 0x10, ld64(s500 + 8))
													st64(a + 8, i)
													st64(a, 0)
													return j
												}
												anchor_error_from(s4c0, 0x7d5 /* anchor::ConstraintRentExempt */)
												j = fn_4130(s4d0, ld64(s4c0), ld64(s4c0 + 8), "position_nft_account", 0x14)
												i = ld64(s4d0)
												st64(a + 0x10, ld64(s4d0 + 8))
												st64(a + 8, i)
												st64(a, 0)
												return j
											}
											anchor_error_from(s490, 0x7d0 /* anchor::ConstraintMut */)
											j = fn_4130(s4a0, ld64(s490), ld64(s490 + 8), "position_nft_account", 0x14)
											i = ld64(s4a0)
											st64(a + 0x10, ld64(s4a0 + 8))
											st64(a + 8, i)
											st64(a, 0)
											return j
										}
										st64(a + 0x10, ld64(s8f0))
										st64(a + 8, i)
										st64(a, 0)
										return j
									}
									anchor_error_from(s470, 0x7d5 /* anchor::ConstraintRentExempt */)
									j = fn_4130(s480, ld64(s470), ld64(s470 + 8), "position_nft_mint", 0x11)
									i = ld64(s480)
									st64(a + 0x10, ld64(s480 + 8))
									st64(a + 8, i)
									st64(a, 0)
									return j
								}
								anchor_error_from(s440, 0x7d2 /* anchor::ConstraintSigner */)
								j = fn_4130(s450, ld64(s440), ld64(s440 + 8), "position_nft_mint", 0x11)
								i = ld64(s450)
								st64(a + 0x10, ld64(s450 + 8))
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
							anchor_error_from(s420, 0x7d0 /* anchor::ConstraintMut */)
							j = fn_4130(s430, ld64(s420), ld64(s420 + 8), "position_nft_mint", 0x11)
							i = ld64(s430)
							st64(a + 0x10, ld64(s430 + 8))
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
						st64(a + 0x10, ld64(s8e8))
						st64(a + 8, i)
						st64(a, 0)
						return j
					}
					j = anchor_error_from(s7f0, 0xbbd /* anchor::AccountNotEnoughKeys */, u + 0x30, v, t)
					i = ld64(s7f0)
					st64(a + 0x10, ld64(s7f0 + 8))
					st64(a + 8, i)
					st64(a, 0)
					return j
				}
				j = anchor_error_from(s800, 0xbbd /* anchor::AccountNotEnoughKeys */, m, n)
				t = undef
				i = ld64(s800)
				if (i == 2) {
					j = anchor_error_from(s810, 0xbbd /* anchor::AccountNotEnoughKeys */, m, n, t)
					i = ld64(s810)
					st64(a + 0x10, ld64(s810 + 8))
					st64(a + 8, i)
					st64(a, 0)
					return j
				}
				const o = ld64(0x300000000 /* heap bump-allocator cursor */)
				const p = o != 0 ? sat_sub(o, 0x12) : 0x300007fee
				token_vault_1_box = ld64(s800 + 8)
				if ((i & 1) != 0) {
					if (0x300000008 > p) {
						raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008, 0x12 > o)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, p)
					st64(p + 8, 0x6e776f5f74666e5f)
					st64(p, 0x6e6f697469736f70)
					st16(p + 0x10, 0x7265)
					void ld64(token_vault_1_box)
				} else {
					if (0x300000008 > p) {
						raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008, 0x12 > o)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, p)
					st64(p + 8, 0x6e776f5f74666e5f)
					st64(p, 0x6e6f697469736f70)
					st16(p + 0x10, 0x7265)
					void ld64(token_vault_1_box)
				}
				st64(token_vault_1_box + 0x10, p, 0x12)
				st64(token_vault_1_box + 8, 0x12)
				st64(token_vault_1_box, 1)
				st64(a + 0x10, token_vault_1_box)
				st64(a + 8, i)
				st64(a, 0)
				return j
			}
			const r = ld64(0x300000000 /* heap bump-allocator cursor */)
			const s = r != 0 ? sat_sub(r, 5) : 0x300007ffb
			if ((i & 1) != 0) {
				if (0x300000008 > s) {
					raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(r, 5), 5 > r)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, s)
				st8(s + 4, 0x72)
				st32(s, 0x65796170)
				void payer.key
			} else {
				if (0x300000008 > s) {
					raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(r, 5), 5 > r)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, s)
				st8(s + 4, 0x72)
				st32(s, 0x65796170)
				void payer.key
			}
			st64(payer + 0x10, s, 5)
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
		j = anchor_error_from(s820, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s820)
		st64(a + 0x10, ld64(s820 + 8))
		st64(a + 8, i)
		st64(a, 0)
		return j
	}
	if ((g & 3) == 0) {
		j = anchor_error_from(s820, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s820)
		st64(a + 0x10, ld64(s820 + 8))
		st64(a + 8, i)
		st64(a, 0)
		return j
	}
	const h = ld64(ld64(g + 7))
	if (h == 0) {
		j = anchor_error_from(s820, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s820)
		st64(a + 0x10, ld64(s820 + 8))
		st64(a + 8, i)
		st64(a, 0)
		return j
	}
	callx(h, ld64(g - 1), h)
	j = anchor_error_from(s820, 0x66 /* anchor::InstructionDidNotDeserialize */)
	i = ld64(s820)
	st64(a + 0x10, ld64(s820 + 8))
	st64(a + 8, i)
	st64(a, 0)
	return j
}

export function fn_9d268(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, sc0 = fp - 0xc0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s108 = fp - 0x108, s128 = fp - 0x128, s148 = fp - 0x148, s168 = fp - 0x168, s178 = fp - 0x178, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s200 = fp - 0x200, s220 = fp - 0x220, s238 = fp - 0x238, s250 = fp - 0x250, s258 = fp - 0x258, s278 = fp - 0x278, s288 = fp - 0x288, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2e0 = fp - 0x2e0, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s310 = fp - 0x310, s318 = fp - 0x318, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3c0 = fp - 0x3c0, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s400 = fp - 0x400, s430 = fp - 0x430, s438 = fp - 0x438
	let ac, ae, db, dc, dd: u64
	const f: AccountInfo = ld64(ld64(b))
	const g = fn_147a20(f, b, c, d, e)
	st64(s3c0 + 0x18, a)
	if (g != 0) {
		const j = ld64(b + 0x10)
		const k = ld64(ld64(j))
		copyr(s278, k, 0x20)
		const l = f.key
		copy(s250, l + 8, 0x18)
		st64(s258, ld64(l))
		if ((memcmp(s278, s258, 0x20) as u32) == 0) {
			ErrorCode_name(s238, 0x100159890)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100159890, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(s2f8, s60, 0x18)
			copy(s310, s238, 0x18)
			st64(s330 + 8, 0x100159df2)
			st32(s2b8 + 0x20, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s2e0, 2)
			st32(s318, 9)
			st64(s330 + 0x10, 0x31)
			st64(s330, 0)
			const ah = fn_13e5a0(s370, s330)
			const ag = ld64(s370 + 8)
			const af = ld64(s370)
			copy(s330, s278, 0x40)
			dd = Error_with_pubkeys(s380, af, ag, s330, ah)
			const aj = ld64(s380)
			const ai = ld64(s3c0 + 0x18)
			st64(ai + 8, ld64(s380 + 8))
			st64(ai, aj)
			return dd
		}
		st64(s3c0 + 0x10, b)
		const m = max(fn_1476d8(ld64(b + 8), 0x52), 1)
		if (m > g) {
			const n: AccountInfo = ld64(j)
			const o: LamportsCell = n.lamports
			const ao = n.key
			rc_inc(o)
			const ak: DataCell = n.data
			rc_inc(ak)
			const al: LamportsCell = f.lamports
			st64(s3c0 + 8, al)
			const am = al.strong
			st64(s3e8, f.key)
			st64(s3e8 + 8, n.executable)
			st64(s3e8 + 0x10, n.is_writable)
			st64(s3e8 + 0x18, n.is_signer)
			st64(s3e8 + 0x20, n.rent_epoch)
			st64(s3c0, n.owner)
			rc_inc(ld64(s3c0 + 8), am)
			const an: DataCell = f.data
			rc_inc(an)
			st64(s400, ak, ao)
			const ap: AccountInfo = ld64(ld64(ld64(s3c0 + 0x10) + 0x18))
			const aq: LamportsCell = ap.lamports
			const ar = aq.strong
			st64(s3f8 + 8, o)
			st64(s430 + 0x10, f.executable)
			st64(s430 + 0x18, f.is_writable)
			st64(s430 + 0x20, f.is_signer)
			st64(s430 + 0x28, f.rent_epoch)
			const av = f.owner
			const aw = ap.key
			rc_inc(aq, ar)
			st64(s438, an)
			const at: DataCell = ap.data
			const au = at.strong
			st64(s430, aw, sat_sub(m, g))
			rc_inc(at, au)
			const bb = ap.owner
			const ba = ap.rent_epoch
			const az = ap.is_signer
			const ay = ap.is_writable
			const ax = ap.executable
			st8(s1d8 + 0x5a, ld64(s430 + 0x10))
			st8(s1d8 + 0x59, ld64(s430 + 0x18))
			st8(s1d8 + 0x58, ld64(s430 + 0x20))
			st64(s1d8 + 0x50, ld64(s430 + 0x28))
			st64(s1d8 + 0x48, av)
			st64(s1d8 + 0x40, ld64(s438))
			st64(s1d8 + 0x38, ld64(s3c0 + 8))
			st64(s1d8 + 0x30, ld64(s3e8))
			st8(s1d8 + 0x2a, ld64(s3e8 + 8))
			st8(s1d8 + 0x29, ld64(s3e8 + 0x10))
			st8(s1d8 + 0x28, ld64(s3e8 + 0x18))
			st64(s1d8 + 0x20, ld64(s3e8 + 0x20))
			st64(s1d8 + 0x18, ld64(s3c0))
			st64(s1d8 + 0x10, ld64(s400))
			copyr(s1d8, s3f8, 0x10)
			st8(s1e0, az, ay, ax)
			st64(s200, aq, at, bb, ba)
			st64(s220 + 0x18, ld64(s430))
			st64(s178, 8, 0)
			st64(s220, 0, 8, 0)
			dd = system_program_transfer(s340, s220, ld64(s430 + 8))
			ae = ld64(s340)
			if (ae != 2) {
				dc = ld64(s340 + 8)
				db = ld64(s3c0 + 0x18)
				st64(db, ae, dc)
				return dd
			}
		}
		const bc: LamportsCell = f.lamports
		st64(s3c0 + 8, bc)
		const bd = bc.strong
		const bf = f.key
		const bg = ld64(s3c0 + 0x10)
		rc_inc(ld64(s3c0 + 8), bd)
		const be: DataCell = f.data
		rc_inc(be)
		st64(s3c0, bf)
		const bh = ld64(bg + 0x18)
		const bi: AccountInfo = ld64(bh)
		const bj: LamportsCell = bi.lamports
		const bk = bj.strong
		st64(s3e8 + 8, f.executable)
		st64(s3e8 + 0x10, f.is_writable)
		st64(s3e8 + 0x18, f.is_signer)
		st64(s3e8 + 0x20, f.rent_epoch)
		const bq = f.owner
		st64(s3e8, bi.key)
		rc_inc(bj, bk)
		const bl: DataCell = bi.data
		rc_inc(bl)
		st64(s3f8 + 8, bh)
		const bp = bi.owner
		const bo = bi.rent_epoch
		const bn = bi.is_signer
		const bm = bi.is_writable
		st8(s2c0 + 2, bi.executable)
		st8(s2c0, bn, bm)
		st64(s2e0, bj, bl, bp, bo)
		st64(s2e8, ld64(s3e8))
		st8(s2f0 + 2, ld64(s3e8 + 8))
		st8(s2f0 + 1, ld64(s3e8 + 0x10))
		st8(s2f0, ld64(s3e8 + 0x18))
		st64(s2f8, ld64(s3e8 + 0x20))
		st64(s308, be, bq)
		copyr(s318, s3c0, 0x10)
		st64(s2b8, 8, 0)
		st64(s330, 0, 8, 0)
		dd = system_program_assign_13fb30(s350, s330, 0x52)
		ae = ld64(s350)
		if (ae != 2) {
			dc = ld64(s350 + 8)
			db = ld64(s3c0 + 0x18)
			st64(db, ae, dc)
			return dd
		}
		const br: LamportsCell = f.lamports
		const bz = f.key
		rc_inc(br)
		const bs: DataCell = f.data
		rc_inc(bs)
		const bt: AccountInfo = ld64(ld64(s3f8 + 8))
		const bu: LamportsCell = bt.lamports
		const bv = bu.strong
		st64(s3e8 + 0x18, f.executable)
		st64(s3e8 + 0x20, f.is_writable)
		st64(s3c0, f.is_signer)
		st64(s3c0 + 8, f.rent_epoch)
		const by = f.owner
		st64(s3e8 + 0x10, bt.key)
		rc_inc(bu, bv)
		st64(s3e8 + 8, br)
		const bw: DataCell = bt.data
		const bx = bw.strong
		st64(s3e8, bz)
		rc_inc(bw, bx)
		const cd = bt.owner
		const cc = bt.rent_epoch
		const cb = bt.is_signer
		const ca = bt.is_writable
		st8(s2c0 + 2, bt.executable)
		st8(s2c0, cb, ca)
		st64(s2e0, bu, bw, cd, cc)
		st64(s2e8, ld64(s3e8 + 0x10))
		st8(s2f0 + 2, ld64(s3e8 + 0x18))
		st8(s2f0 + 1, ld64(s3e8 + 0x20))
		st8(s2f0, ld64(s3c0))
		st64(s2f8, ld64(s3c0 + 8))
		st64(s308, bs, by)
		copyr(s318, s3e8, 0x10)
		st64(s2b8, 8, 0)
		st64(s330, 0, 8, 0)
		ac = ld64(ld64(s3c0 + 0x10) + 0x20)
		const ce = ld64(ld64(ac))
		copyr(s48, ce, 0x20)
		dd = system_program_assign_13ff40(s360, s330, s48)
		ae = ld64(s360)
		if (ae != 2) {
			dc = ld64(s360 + 8)
			db = ld64(s3c0 + 0x18)
			st64(db, ae, dc)
			return dd
		}
	} else {
		st64(s3c0, fn_1476d8(ld64(b + 8), 0x52))
		const h: AccountInfo = ld64(ld64(b + 0x10))
		const i: LamportsCell = h.lamports
		const y = h.key
		rc_inc(i)
		const p: DataCell = h.data
		rc_inc(p)
		const q: LamportsCell = f.lamports
		st64(s3c0 + 8, q)
		const r = q.strong
		st64(s3f8 + 8, f.key)
		st64(s3e8, h.executable)
		st64(s3e8 + 8, h.is_writable)
		st64(s3e8 + 0x10, h.is_signer)
		st64(s3e8 + 0x18, h.rent_epoch)
		st64(s3e8 + 0x20, h.owner)
		rc_inc(ld64(s3c0 + 8), r)
		const s: DataCell = f.data
		rc_inc(s)
		st64(s3f8, p)
		st64(s3c0 + 0x10, b)
		const t: AccountInfo = ld64(ld64(b + 0x18))
		const u: LamportsCell = t.lamports
		const v = u.strong
		st64(s430 + 0x10, f.executable)
		st64(s430 + 0x18, f.is_writable)
		st64(s430 + 0x20, f.is_signer)
		st64(s430 + 0x28, f.rent_epoch)
		st64(s400, f.owner)
		const w = t.key
		rc_inc(u, v)
		st64(s430 + 8, w)
		const x: DataCell = t.data
		rc_inc(x)
		st64(s430, t.owner)
		st64(s438, t.rent_epoch)
		const ab = t.is_signer
		const aa = t.is_writable
		const z = t.executable
		st8(s2b8 + 0x2a, ld64(s430 + 0x10))
		st8(s2b8 + 0x29, ld64(s430 + 0x18))
		st8(s2b8 + 0x28, ld64(s430 + 0x20))
		st64(s2b8 + 0x20, ld64(s430 + 0x28))
		st64(s2b8 + 0x18, ld64(s400))
		st64(s2b8 + 0x10, s)
		st64(s2b8 + 8, ld64(s3c0 + 8))
		st64(s2b8, ld64(s3f8 + 8))
		st8(s2c0 + 2, ld64(s3e8))
		st8(s2c0 + 1, ld64(s3e8 + 8))
		st8(s2c0, ld64(s3e8 + 0x10))
		st64(s2e0 + 0x18, ld64(s3e8 + 0x18))
		st64(s2e0 + 0x10, ld64(s3e8 + 0x20))
		st64(s2e0 + 8, ld64(s3f8))
		st64(s2e8, y, i)
		st8(s2f0, ab, aa, z)
		st64(s2f8, ld64(s438))
		st64(s308 + 8, ld64(s430))
		st64(s310, u, x)
		st64(s318, ld64(s430 + 8))
		st64(s288, 8, 0)
		st64(s330, 0, 8, 0)
		ac = ld64(ld64(s3c0 + 0x10) + 0x20)
		const ad = ld64(ld64(ac))
		copyr(s48, ad, 0x20)
		dd = system_program_create_account(s390, s330, ld64(s3c0), 0x52, s48)
		ae = ld64(s390)
		if (ae != 2) {
			dc = ld64(s390 + 8)
			db = ld64(s3c0 + 0x18)
			st64(db, ae, dc)
			return dd
		}
	}
	const cf: AccountInfo = ld64(ac)
	const cg: LamportsCell = cf.lamports
	const cl = cf.key
	rc_inc(cg)
	const ch: DataCell = cf.data
	rc_inc(ch)
	const ci: LamportsCell = f.lamports
	const cj = ci.strong
	st64(s3e8 + 0x18, f.key)
	st64(s3e8 + 0x20, cf.executable)
	st64(s3c0, cf.is_writable)
	st64(s3c0 + 8, cf.is_signer)
	const cn = cf.rent_epoch
	const cm = cf.owner
	rc_inc(ci, cj)
	const ck: DataCell = f.data
	rc_inc(ck)
	const cr = f.owner
	const cq = f.rent_epoch
	st64(s3e8, ch, cg, cl)
	const cp = f.is_signer
	const co = f.is_writable
	st8(s128 + 2, f.executable)
	st8(s128, cp, co)
	st64(s148, ci, ck, cr, cq)
	st64(s168 + 0x18, ld64(s3e8 + 0x18))
	st8(s108 + 0x12, ld64(s3e8 + 0x20))
	st8(s108 + 0x11, ld64(s3c0))
	st8(s108 + 0x10, ld64(s3c0 + 8))
	st64(s108, cm, cn)
	st64(s128 + 0x18, ld64(s3e8))
	st64(s128 + 0x10, ld64(s3e8 + 8))
	st64(s128 + 8, ld64(s3e8 + 0x10))
	st64(sf0, 8, 0)
	st64(s168, 0, 8, 0)
	const cs = ld64(ld64(ld64(ld64(s3c0 + 0x10) + 0x28)))
	copyr(se0, cs, 0x20)
	const cv = ld64(cs)
	const cu = ld64(cs + 8)
	const ct = ld64(cs + 0x10)
	st64(s48 + 0x18, ld64(cs + 0x18))
	st64(s48, cv, cu, ct)
	copyr(s330, se0, 0x20)
	dd = fn_12b0f8(s3a0, s168, 0, s48, s330)
	ae = ld64(s3a0)
	if (ae == 2) {
		dd = Account_try_from(sc0, f)
		const da = ld64(s3c0 + 0x18)
		if (ld32(sc0) == 2) {
			const cw = ld64(0x300000000 /* heap bump-allocator cursor */)
			const cy = cw != 0 ? sat_sub(cw, 0x11) : 0x300007fef
			const cz = ld64(sc0 + 0x10)
			const cx = ld64(sc0 + 8)
			if (cx != 0) {
				if (0x300000008 > cy) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, cy)
				st64(cy + 8, 0x6e696d5f74666e5f)
				st64(cy, 0x6e6f697469736f70)
				st8(cy + 0x10, 0x74)
				void ld64(cz)
			} else {
				if (0x300000008 > cy) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, cy)
				st64(cy + 8, 0x6e696d5f74666e5f)
				st64(cy, 0x6e6f697469736f70)
				st8(cy + 0x10, 0x74)
				void ld64(cz)
			}
			st64(cz + 0x10, cy, 0x11)
			st64(cz + 8, 0x11)
			st64(cz, 1)
			st64(da + 8, cz)
			st64(da, cx)
			return dd
		}
		const de = ld64(0x300000000 /* heap bump-allocator cursor */)
		const df = de != 0 ? sat_sub(de, 0x60) & -8 : 0x300007fa0
		if (0x300000008 > df) {
			alloc_handle_alloc_error(8, 0x60)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, df)
		dd = memcpy(df, sc0, 0x60)
		st64(da + 8, df)
		st64(da, 2)
		return dd
	}
	dc = ld64(s3a0 + 8)
	db = ld64(s3c0 + 0x18)
	st64(db, ae, dc)
	return dd
}

export function fn_9eed0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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
			st64(s380 + 8, 0x100159df2)
			st32(s300 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s330, 2)
			st32(s368, 9)
			st64(s380 + 0x10, 0x31)
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
		const bp = ld64(ld64(ld64(bi + 0x20) + 0x58))
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
		const ab = ld64(ld64(ld64(b + 0x20) + 0x58))
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
// types [heur]: b: OpenPositionV2Context (the handler ix_open_position_v2 passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_25a60(a: u64, b: OpenPositionV2Context, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s80 = fp - 0x80, s98 = fp - 0x98, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sc8 = fp - 0xc8, sd0 = fp - 0xd0, sd8 = fp - 0xd8, se0 = fp - 0xe0, sf8 = fp - 0xf8, s100 = fp - 0x100, s108 = fp - 0x108, s170 = fp - 0x170, s180 = fp - 0x180, s188 = fp - 0x188, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, sf90 = fp - 0xf90, s1000 = fp - 0x1000
	let i, j: u64
	let g = a
	const accounts: OpenPositionV2Accounts = b.accounts
	if (ld8(accounts.token_account_0 + 0x94) != 2 && ld8(accounts.token_account_1 + 0x94) != 2) {
		const k: AccountInfo = ld64(ld64(accounts + 0x10) + 0x58)
		const l: LamportsCell = k.lamports
		const bv = p12
		const bw = p11
		const bx = p10
		const by = p9
		const bz = p8
		const ca = p7
		const cb = p6
		const m = p5
		const s = k.key
		rc_inc(l)
		const n: DataCell = k.data
		rc_inc(n)
		const bu = g
		const r = k.owner
		const q = k.rent_epoch
		const p = k.is_signer
		const o = k.is_writable
		st8(se0 + 2, k.executable)
		st8(se0, p, o)
		st64(s108, s, l, n, r, q)
		const t: AccountInfo = ld64(ld64(accounts + 0x18))
		const u: LamportsCell = t.lamports
		const aa = t.key
		rc_inc(u)
		const v: DataCell = t.data
		rc_inc(v)
		const z = t.owner
		const y = t.rent_epoch
		const x = t.is_signer
		const w = t.is_writable
		st8(sb0 + 2, t.executable)
		st8(sb0, x, w)
		st64(sd8, aa, u, v, z, y)
		const ab: AccountInfo = accounts.token_account_0.info
		const ac: LamportsCell = ab.lamports
		const ai = ab.key
		rc_inc(ac)
		const ad: DataCell = ab.data
		rc_inc(ad)
		const ah = ab.owner
		const ag = ab.rent_epoch
		const af = ab.is_signer
		const ae = ab.is_writable
		st8(s80 + 2, ab.executable)
		st8(s80, af, ae)
		st64(sa8, ai, ac, ad, ah, ag)
		const aj: AccountInfo = accounts.token_account_1.info
		const ak: LamportsCell = aj.lamports
		const aq = aj.key
		rc_inc(ak)
		const al: DataCell = aj.data
		rc_inc(al)
		const ap = aj.owner
		const ao = aj.rent_epoch
		const an = aj.is_signer
		const am = aj.is_writable
		st8(s50 + 2, aj.executable)
		st8(s50, an, am)
		st64(s78, aq, ak, al, ap, ao)
		const ar: AccountInfo = accounts.token_vault_0.info
		const at: LamportsCell = ar.lamports
		const az = ar.key
		rc_inc(at)
		const au: DataCell = ar.data
		rc_inc(au)
		const ay = ar.owner
		const ax = ar.rent_epoch
		const aw = ar.is_signer
		const av = ar.is_writable
		st8(s20 + 2, ar.executable)
		st8(s20, aw, av)
		st64(s48, az, at, au, ay, ax)
		const ba: AccountInfo = accounts.token_vault_1.info
		const bb: LamportsCell = ba.lamports
		const bh = ba.key
		rc_inc(bb)
		const bc: DataCell = ba.data
		rc_inc(bc)
		const bg = ba.owner
		const bf = ba.rent_epoch
		const be = ba.is_signer
		const bd = ba.is_writable
		st8(s180 + 2, ba.executable)
		st8(s180, be, bd)
		st64(s1a8, bh, bb, bc, bg, bf)
		const bi = ld64(0x300000000 /* heap bump-allocator cursor */)
		const bj = bi != 0 ? sat_sub(bi, 0x80) & -8 : 0x300007f80
		if (bj > 0x300000007) {
			const vault_0_mint: Mint = accounts.vault_0_mint
			st64(0x300000000 /* heap bump-allocator cursor */, bj)
			const bl: AccountInfo = vault_0_mint.info
			memcpy(bj, vault_0_mint, 0x58)
			st64(bj + 0x58, bl)
			st64(bj + 0x78, ld64(vault_0_mint[1].mint_authority + 0x14))
			st64(bj + 0x70, ld64(vault_0_mint[1].mint_authority + 0xc))
			st64(bj + 0x68, ld64(vault_0_mint[1].mint_authority + 4))
			st64(bj + 0x60, ld64(vault_0_mint + 0x60))
			const bm = ld64(0x300000000 /* heap bump-allocator cursor */)
			const bn = bm != 0 ? sat_sub(bm, 0x80) & -8 : 0x300007f80
			if (bn > 0x300000007) {
				const vault_1_mint: Mint = accounts.vault_1_mint
				st64(0x300000000 /* heap bump-allocator cursor */, bn)
				const bt: AccountInfo = vault_1_mint.info
				const bs = memcpy(bn, vault_1_mint, 0x58)
				st64(bn + 0x58, bt)
				copy(bn + 0x60, vault_1_mint + 0x60, 0x20)
				const remaining_accounts: AccountInfo = b.remaining_accounts
				const bq = b.remaining_accounts_len
				const bp = ld8(b + 0x22)
				st64(sf90, accounts + 0xa8, accounts + 0xb0, bj, bn, remaining_accounts, bq, bp, c, d, m, cb, ca, bz, by, bx, bw, bv)
				st64(s1000, sd8, accounts + 0x20, accounts + 0x28, accounts + 0x38, accounts + 0x40, accounts + 0x48, sa8, s78, s48, s1a8, accounts + 0x70, accounts + 0x90, accounts + 0x98)
				st64(sf90 + 0x88, 0)
				j = fn_1c850(s1b8, accounts, accounts + 8, s108, fp, bs)
				i = ld64(s1b8 + 8)
				const h = ld64(s1b8)
				if (rc_release(bb)) {
					j = Rc_drop_slow_14df0(s1a0, j)
				}
				g = bu
				if (rc_release(bc)) {
					j = Rc_drop_slow_14df0(s198, j)
				}
				if (rc_release(at)) {
					j = Rc_drop_slow_14df0(s40, j)
				}
				if (rc_release(au)) {
					j = Rc_drop_slow_14df0(s38, j)
				}
				if (rc_release(ak)) {
					j = Rc_drop_slow_14df0(s70, j)
				}
				if (rc_release(al)) {
					j = Rc_drop_slow_14df0(s68, j)
				}
				if (rc_release(ac)) {
					j = Rc_drop_slow_14df0(sa0, j)
				}
				if (rc_release(ad)) {
					j = Rc_drop_slow_14df0(s98, j)
				}
				if (rc_release(u)) {
					j = Rc_drop_slow_14df0(sd0, j)
				}
				if (rc_release(v)) {
					j = Rc_drop_slow_14df0(sc8, j)
				}
				if (rc_release(l)) {
					j = Rc_drop_slow_14df0(s100, j)
				}
				if (!rc_release(n)) {
					st64(g, h, i)
					return j
				}
				j = Rc_drop_slow_14df0(sf8, j)
				st64(g, h, i)
				return j
			}
			alloc_handle_alloc_error(8, 0x80)
		}
		alloc_handle_alloc_error(8, 0x80)
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
	copyr(s170, s78, 0x18)
	copy(s188, sa8, 0x18)
	st64(s1a0, 0x100159df2)
	st32(s170 + 0x60, 0x1770 /* error::NotApproved */)
	st8(s170 + 0x18, 2)
	st32(s198 + 8, 0xa1)
	st64(s198, 0x31)
	st64(s1a8, 0)
	j = fn_13e5a0(s1c8, s1a8)
	i = ld64(s1c8 + 8)
	st64(g, ld64(s1c8))
	st64(g + 8, i)
	return j
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_account_1, token_vault_0, token_vault_1
export function fn_a09c8(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8
	let g, i, j, k, ad, ae: u64
	B48: {
		const f = ld64(ld64(b + 0x10) + 0x58)
		if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(f) == 0 && ld64(ld64(f + 0x10) + 0x10) != 0)) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			ad = fn_13e628(s28, s18)
			g = ld64(s28)
			if (g != 2) {
				const h = ld64(0x300000000 /* heap bump-allocator cursor */)
				i = 0x11 > h
				j = h != 0 ? i != 0 ? 0 : h - 0x11 : 0x300007fef
				k = ld64(s28 + 8)
				if ((g & 1) != 0) {
					if (0x300000008 > j) {
						raw_vec_handle_error(1, 0x11, 0x10015f8f8, i, ae)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 8, 0x6e696d5f74666e5f)
					st64(j, 0x6e6f697469736f70)
					st8(j + 0x10, 0x74)
					void ld64(k)
					break B48
				}
				if (0x300000008 > j) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, i, ae)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x6e696d5f74666e5f)
				st64(j, 0x6e6f697469736f70)
				st8(j + 0x10, 0x74)
				void ld64(k)
				break B48
			}
		}
		const l = ld64(ld64(b + 0x18))
		if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(l) == 0 && ld64(ld64(l + 0x10) + 0x10) != 0)) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			ad = fn_13e628(s38, s18)
			g = ld64(s38)
			if (g != 2) {
				const m = ld64(0x300000000 /* heap bump-allocator cursor */)
				const n = m != 0 ? sat_sub(m, 0x14) : 0x300007fec
				k = ld64(s38 + 8)
				if ((g & 1) != 0) {
					if (0x300000008 > n) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x14 > m)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, n)
					st64(n + 8, 0x6363615f74666e5f)
					st64(n, 0x6e6f697469736f70)
					st32(n + 0x10, 0x746e756f)
					void ld64(k)
				} else {
					if (0x300000008 > n) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x14 > m)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, n)
					st64(n + 8, 0x6363615f74666e5f)
					st64(n, 0x6e6f697469736f70)
					st32(n + 0x10, 0x746e756f)
					void ld64(k)
				}
				st64(k + 0x10, n, 0x14)
				st64(k + 8, 0x14)
				st64(k, 1)
				st64(a + 8, k)
				st64(a, g)
				return ad
			}
		}
		ad = fn_a80(s48, ld64(b + 0x28), c)
		g = ld64(s48)
		if (g != 2) {
			const o = ld64(0x300000000 /* heap bump-allocator cursor */)
			const p = o != 0 ? sat_sub(o, 0xa) : 0x300007ff6
			k = ld64(s48 + 8)
			if ((g & 1) != 0) {
				if (0x300000008 > p) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > o)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, p)
				st64(p, 0x6174735f6c6f6f70)
				st16(p + 8, 0x6574)
				void ld64(k)
			} else {
				if (0x300000008 > p) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > o)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, p)
				st64(p, 0x6174735f6c6f6f70)
				st16(p + 8, 0x6574)
				void ld64(k)
			}
			st64(k + 0x10, p, 0xa)
			st64(k + 8, 0xa)
			st64(k, 1)
			st64(a + 8, k)
			st64(a, g)
			return ad
		}
		ad = fn_b4e0(s58, ld64(b + 0x48), 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
		g = ld64(s58)
		if (g == 2) {
			const r = ld64(b + 0x50)
			const s = ld64(r + 0x20)
			if ((memcmp(r, c, 0x20) as u32) == 0 && (common_is_closed(s) == 0 && ld64(ld64(s + 0x10) + 0x10) != 0)) {
				st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
				ad = fn_13e628(s68, s18)
				g = ld64(s68)
				if (g != 2) {
					const t = ld64(0x300000000 /* heap bump-allocator cursor */)
					const u = t != 0 ? sat_sub(t, 0xf) : 0x300007ff1
					k = ld64(s68 + 8)
					if ((g & 1) != 0) {
						if (0x300000008 > u) {
							raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0xf > t)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, u)
						st64(u + 7, 0x305f746e756f6363)
						st64(u, 0x63615f6e656b6f74)
						void ld64(k)
					} else {
						if (0x300000008 > u) {
							raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0xf > t)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, u)
						st64(u + 7, 0x305f746e756f6363)
						st64(u, 0x63615f6e656b6f74)
						void ld64(k)
					}
					st64(k + 0x10, u, 0xf)
					st64(k + 8, 0xf)
					st64(k, 1)
					st64(a + 8, k)
					st64(a, g)
					return ad
				}
			}
			const v = ld64(b + 0x58)
			const w = ld64(v + 0x20)
			if ((memcmp(v, c, 0x20) as u32) == 0 && (common_is_closed(w) == 0 && ld64(ld64(w + 0x10) + 0x10) != 0)) {
				st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
				fn_13e628(s78, s18)
				const x = ld64(s78)
				if (x != 2) {
					ad = fn_4130(s88, x, ld64(s78 + 8), "token_account_1", 0xf)
					k = ld64(s88 + 8)
					g = ld64(s88)
					if (g != 2) {
						st64(a + 8, k)
						st64(a, g)
						return ad
					}
				}
			}
			const y = ld64(b + 0x60)
			fn_a1d8(s98, ld64(y + 0x20), y, c)
			const z = ld64(s98)
			if (z != 2) {
				ad = fn_4130(sa8, z, ld64(s98 + 8), "token_vault_0", 0xd)
				k = ld64(sa8 + 8)
				g = ld64(sa8)
				if (g != 2) {
					st64(a + 8, k)
					st64(a, g)
					return ad
				}
			}
			const aa = ld64(b + 0x68)
			ad = fn_a1d8(sb8, ld64(aa + 0x20), aa, c)
			k = undef
			const ab = ld64(sb8)
			if (ab == 2) {
				st64(a + 8, k)
				st64(a, 2)
				return ad
			}
			ad = fn_4130(sc8, ab, ld64(sb8 + 8), "token_vault_1", 0xd)
			k = undef
			const ac = ld64(sc8)
			if (ac == 2) {
				st64(a + 8, k)
				st64(a, 2)
				return ad
			}
			st64(a + 8, ld64(sc8 + 8))
			st64(a, ac)
			return ad
		}
		const q = ld64(0x300000000 /* heap bump-allocator cursor */)
		i = 0x11 > q
		j = q != 0 ? i != 0 ? 0 : q - 0x11 : 0x300007fef
		k = ld64(s58 + 8)
		if ((g & 1) != 0) {
			if (0x300000008 > j) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, i, ae)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x6f697469736f705f)
			st64(j, 0x6c616e6f73726570)
			st8(j + 0x10, 0x6e)
			void ld64(k)
		} else {
			if (0x300000008 > j) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, i, ae)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x6f697469736f705f)
			st64(j, 0x6c616e6f73726570)
			st8(j + 0x10, 0x6e)
			void ld64(k)
		}
	}
	st64(k + 0x10, j, 0x11)
	st64(k + 8, 0x11)
	st64(k, 1)
	st64(a + 8, k)
	st64(a, g)
	return ad
}
