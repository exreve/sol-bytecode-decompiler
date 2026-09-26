/// <reference path="../lib.d.ts" />
// instruction open_position
import { anchor_error_from, fn_13e5a0, fn_13e628, fn_1476d8, fn_147a20, fn_14ed60, fn_1c850, fn_4130, fn_4dc0, fn_85138, fn_88558, fn_8ed0, fn_960a0, fn_a80, fn_b4e0, memcpy } from '../shared.ts'

// instruction handler: open_position (discriminator sha256("global:open_position")[..8] = 0x31f0980f4d2f8087)
// accounts [idl]: 0 payer [signer, mut], 1 position_nft_owner, 2 position_nft_mint [signer, mut], 3 position_nft_account [mut, pda], 4 metadata_account [mut], 5 pool_state [mut], 6 protocol_position, 7 tick_array_lower [mut, pda], 8 tick_array_upper [mut, pda], 9 personal_position [mut, pda], 10 token_account_0 [mut], 11 token_account_1 [mut], 12 token_vault_0 [mut], 13 token_vault_1 [mut], 14 rent [= SysvarRent111111111111111111111111111111111], 15 system_program [= 11111111111111111111111111111111], 16 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 17 associated_token_program [= ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL], 18 metadata_program [= metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s]
// args [idl]: tick_lower_index: i32, tick_upper_index: i32, tick_array_lower_start_index: i32, tick_array_upper_start_index: i32, liquidity: u128, amount_0_max: u64, amount_1_max: u64
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, tick_lower_index, tick_upper_index, tick_array_lower_start_index, tick_array_upper_start_index, amount_0_max, amount_1_max
export function ix_open_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s98 = fp - 0x98, sa0 = fp - 0xa0, sb0 = fp - 0xb0, s148 = fp - 0x148, s160 = fp - 0x160, s170 = fp - 0x170, s173 = fp - 0x173, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1000 = fp - 0x1000
	let k, n: u64
	const h = sol_log("Instruction: OpenPosition", 0x19)
	const f = ix_args_len
	if (f >= 4 && ((f & -4) != 4 && ((f & -4) != 8 && ((f & -4) != 0xc && ((f & -0x10) != 0x10 && ((f & -8) != 0x20 && (f & -8) != 0x28)))))) {
		const args: OpenPositionArgs = ix_args
		const tick_lower_index = args.tick_lower_index
		const tick_upper_index = args.tick_upper_index
		const tick_array_lower_start_index = args.tick_array_lower_start_index
		const tick_array_upper_start_index = args.tick_array_upper_start_index
		const v = ld64(args.liquidity + 8)
		const u = ld64(args.liquidity)
		const amount_0_max = args.amount_0_max
		const amount_1_max = args.amount_1_max
		st8(s173 + 2, 0xff)
		st16(s173, 0xffff)
		st64(s170, accounts, accounts_len)
		st64(s1000, f, s173)
		n = accounts_open_position(sb0, program_id, s170, args, fp, h)
		const j = ld64(sa0)
		k = ld64(sb0 + 8)
		const i = ld64(sb0)
		if (i == 0) {
			st64(a + 8, j)
			st64(a, k)
			return n
		}
		memcpy(s148, s98, 0x98)
		st64(s160, i, k, j)
		st16(s98 + 8, ld16(s173))
		st8(s98 + 0xa, ld8(s173 + 2))
		copyr(sa0, s170, 0x10)
		st64(sb0, program_id, s160)
		st64(s1000, amount_0_max, amount_1_max, tick_lower_index, tick_upper_index, tick_array_lower_start_index, tick_array_upper_start_index, 1, 2)
		n = fn_1b850(s188, sb0, u, v, amount_0_max, amount_1_max, tick_lower_index, tick_upper_index, tick_array_lower_start_index, tick_array_upper_start_index, 1, 2)
		k = ld64(s188)
		if (k == 2) {
			n = fn_989f8(s198, s160, program_id)
			k = ld64(s198)
			st64(a + 8, ld64(s198 + 8))
			st64(a, k)
			return n
		}
		st64(a + 8, ld64(s188 + 8))
		st64(a, k)
		return n
	}
	const l = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (l & 3) - 2) {
		n = anchor_error_from(s1a8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s1a8)
		st64(a + 8, ld64(s1a8 + 8))
		st64(a, k)
		return n
	}
	if ((l & 3) == 0) {
		n = anchor_error_from(s1a8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s1a8)
		st64(a + 8, ld64(s1a8 + 8))
		st64(a, k)
		return n
	}
	const m = ld64(ld64(l + 7))
	if (m == 0) {
		n = anchor_error_from(s1a8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s1a8)
		st64(a + 8, ld64(s1a8 + 8))
		st64(a, k)
		return n
	}
	callx(m, ld64(l - 1), m)
	n = anchor_error_from(s1a8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	k = ld64(s1a8)
	st64(a + 8, ld64(s1a8 + 8))
	st64(a, k)
	return n
}

// Anchor Accounts::try_accounts of instruction open_position (called by ix_open_position; name [str]: from the handler's "Instruction: …" log; was fn_91098)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: pool_state (ConstraintMut), protocol_position (AccountNotEnoughKeys), tick_array_lower (ConstraintSeeds, ConstraintMut), tick_array_upper (AccountNotEnoughKeys, ConstraintSeeds, ConstraintMut), token_account_0 (ConstraintMut), token_account_1 (ConstraintMut), token_vault_0 (ConstraintMut, ConstraintRaw), token_vault_1 (ConstraintRaw, ConstraintMut), rent, system_program, token_program, associated_token_program, metadata_program, metadata_account (ConstraintMut), payer (ConstraintMut), personal_position (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), position_nft_account (ConstraintMut, ConstraintRentExempt), position_nft_mint (ConstraintMut, ConstraintSigner, ConstraintRentExempt)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: token_vault_1_box, token_vault_0_box, token_vault_1_box_2, payer [idl], position_nft_mint [idl], position_nft_account [idl], personal_position [idl], token_vault_0, token_vault_1
export function accounts_open_position(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s60 = fp - 0x60, s64 = fp - 0x64, s88 = fp - 0x88, sa8 = fp - 0xa8, sc8 = fp - 0xc8, se8 = fp - 0xe8, s108 = fp - 0x108, s138 = fp - 0x138, s158 = fp - 0x158, s159 = fp - 0x159, s180 = fp - 0x180, s198 = fp - 0x198, s1b0 = fp - 0x1b0, s1c8 = fp - 0x1c8, s1e0 = fp - 0x1e0, s1f8 = fp - 0x1f8, s210 = fp - 0x210, s218 = fp - 0x218, s220 = fp - 0x220, s228 = fp - 0x228, s230 = fp - 0x230, s238 = fp - 0x238, s240 = fp - 0x240, s248 = fp - 0x248, s250 = fp - 0x250, s258 = fp - 0x258, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s510 = fp - 0x510, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s560 = fp - 0x560, s570 = fp - 0x570, s580 = fp - 0x580, s590 = fp - 0x590, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s700 = fp - 0x700, s710 = fp - 0x710, s790 = fp - 0x790, s798 = fp - 0x798, s7a0 = fp - 0x7a0, s7a8 = fp - 0x7a8, s7b0 = fp - 0x7b0, s7b8 = fp - 0x7b8, s7c0 = fp - 0x7c0, s7c8 = fp - 0x7c8, s7d0 = fp - 0x7d0
	let j, k, n, o, u, aa, ab, ac, ae, af, am, an, ap, aq, at, au, aw, ax, bc, bd, bf, bg, bi, bj, cf, cg: u64
	let token_vault_1_box: TokenAccount_2
	st64(s260, b)
	const f = ld64(e - 0x1000)
	if (f >= 4) {
		const ca = ld64(e - 0xff8)
		if ((f & -4) > 0xc || ((1 << (f & -4 & 0x3f)) & 0x1110) == 0) {
			st64(s790 + 0x78, ld32(d + 0xc))
			st64(s790 + 0x70, ld32(d + 8))
			k = try_accounts_17a30(s40, c, c, d, e, r0)
			const payer: AccountInfo = ld64(s38)
			j = ld64(s40)
			if (j == 2) {
				st64(s258, payer)
				const m = ld64(c + 8)
				if (m != 0) {
					u = ld64(c)
					st64(c, u + 0x30, m - 1)
					st64(s250, u)
					if (m == 1) {
						k = anchor_error_from(s700, 0xbbd /* anchor::AccountNotEnoughKeys */, n, o, u)
						j = ld64(s700)
						st64(a + 0x10, ld64(s700 + 8))
						st64(a + 8, j)
						st64(a, 0)
						return k
					}
					const v: AccountInfo = ld64(c)
					st64(s248, v)
					let w = m - 2
					st64(c + 8, w)
					st64(c, v + 0x30)
					if (w != 0) {
						st64(s790 + 0x68, u)
						st64(s240, v + 0x30)
						let x = m - 3
						st64(c + 8, x)
						k = v + 0x60
						st64(c, k)
						if (x == 0) {
							anchor_error_from(s270, 0xbbd /* anchor::AccountNotEnoughKeys */, x, w, u)
							x = undef
							w = undef
							u = undef
							k = ld64(s270 + 8)
							j = ld64(s270)
							if (j != 2) {
								const ag = ld64(0x300000000 /* heap bump-allocator cursor */)
								const ah = ag != 0 ? sat_sub(ag, 0x10) : 0x300007ff0
								if ((j & 1) != 0) {
									if (0x300000008 > ah) {
										raw_vec_handle_error(1, 0x10, 0x10015f8f8, sat_sub(ag, 0x10), 0x10 > ag)
									}
									st64(0x300000000 /* heap bump-allocator cursor */, ah)
									st64(ah + 8, 0x746e756f6363615f)
									st64(ah, 0x617461646174656d)
									void ld64(k)
								} else {
									if (0x300000008 > ah) {
										raw_vec_handle_error(1, 0x10, 0x10015f8f8, sat_sub(ag, 0x10), 0x10 > ag)
									}
									st64(0x300000000 /* heap bump-allocator cursor */, ah)
									st64(ah + 8, 0x746e756f6363615f)
									st64(ah, 0x617461646174656d)
									void ld64(k)
								}
								st64(k + 0x10, ah, 0x10)
								st64(k + 8, 0x10)
								st64(k, 1)
								st64(a + 0x10, k)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						} else {
							st64(c + 8, m - 4)
							st64(c, v + 0x90)
						}
						st64(s790 + 0x60, k)
						fn_11e0(s40, c, x, w, u)
						token_vault_1_box = ld64(s38)
						const y = ld64(s40)
						if (y != 2) {
							k = fn_4130(s280, y, token_vault_1_box, "pool_state", 0xa)
							token_vault_1_box = ld64(s280 + 8)
							j = ld64(s280)
							if (j != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						B50: {
							B47: {
								B34: {
									B31: {
										st64(s790 + 0x58, token_vault_1_box)
										st64(s238, token_vault_1_box)
										const z = ld64(c + 8)
										if (z == 0) {
											anchor_error_from(s290, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_1_box, ab, ac)
											token_vault_1_box = ld64(s290 + 8)
											const ai = ld64(s290)
											if (ai == 2) {
												break B31
											}
											k = fn_4130(s2a0, ai, token_vault_1_box, 0x10015aff1 /* "protocol_position" */, 0x11)
											token_vault_1_box = ld64(s2a0 + 8)
											j = ld64(s2a0)
											if (j != 2) {
												st64(a + 0x10, token_vault_1_box)
												st64(a + 8, j)
												st64(a, 0)
												return k
											}
											aa = ld64(c + 8)
											if (aa == 0) {
												break B31
											}
										} else {
											token_vault_1_box = ld64(c)
											st64(c, token_vault_1_box.owner + 8)
											aa = z - 1
											st64(c + 8, aa)
											if (aa == 0) {
												break B31
											}
										}
										st64(s790 + 0x50, token_vault_1_box)
										token_vault_1_box = ld64(c)
										st64(c, token_vault_1_box.owner + 8)
										ae = aa - 1
										st64(c + 8, ae)
										if (ae == 0) {
											break B47
										}
										break B34
									}
									st64(s790 + 0x50, token_vault_1_box)
									anchor_error_from(s2b0, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_1_box, ab, ac)
									token_vault_1_box = ld64(s2b0 + 8)
									const ad = ld64(s2b0)
									if (ad == 2) {
										break B47
									}
									k = fn_4130(s2c0, ad, token_vault_1_box, "tick_array_lower", 0x10)
									token_vault_1_box = ld64(s2c0 + 8)
									j = ld64(s2c0)
									if (j != 2) {
										st64(a + 0x10, token_vault_1_box)
										st64(a + 8, j)
										st64(a, 0)
										return k
									}
									ae = ld64(c + 8)
									if (ae == 0) {
										break B47
									}
								}
								st64(s790 + 0x48, token_vault_1_box)
								token_vault_1_box = ld64(c)
								st64(c, token_vault_1_box.owner + 8)
								af = ae - 1
								st64(c + 8, af)
								if (af == 0) {
									k = anchor_error_from(s6d0, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_1_box, ab, ac)
									j = ld64(s6d0)
									st64(a + 0x10, ld64(s6d0 + 8))
									st64(a + 8, j)
									st64(a, 0)
									return k
								}
								break B50
							}
							st64(s790 + 0x48, token_vault_1_box)
							anchor_error_from(s2d0, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_1_box, ab, ac)
							token_vault_1_box = undef
							const aj = ld64(s2d0)
							if (aj == 2) {
								k = anchor_error_from(s6d0, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_1_box, ab, ac)
								j = ld64(s6d0)
								st64(a + 0x10, ld64(s6d0 + 8))
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
							k = fn_4130(s2e0, aj, ld64(s2d0 + 8), "tick_array_upper", 0x10)
							token_vault_1_box = ld64(s2e0 + 8)
							j = ld64(s2e0)
							if (j != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
							af = ld64(c + 8)
							if (af == 0) {
								k = anchor_error_from(s6d0, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_1_box, ab, ac)
								j = ld64(s6d0)
								st64(a + 0x10, ld64(s6d0 + 8))
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						st64(s790 + 0x38, token_vault_1_box)
						const ak: AccountInfo = ld64(c)
						st64(s230, ak)
						st64(c + 8, af - 1)
						st64(s790 + 0x40, ak)
						st64(c, ak + 0x30)
						fn_7600(s40, c, token_vault_1_box, ab, ac)
						token_vault_1_box = ld64(s38)
						const al = ld64(s40)
						if (al != 2) {
							k = fn_4130(s2f0, al, token_vault_1_box, "token_account_0", 0xf)
							token_vault_1_box = ld64(s2f0 + 8)
							j = ld64(s2f0)
							if (j != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						st64(s790 + 0x30, token_vault_1_box)
						fn_7600(s40, c, token_vault_1_box, am, an)
						token_vault_1_box = ld64(s38)
						const ao = ld64(s40)
						if (ao != 2) {
							k = fn_4130(s300, ao, token_vault_1_box, "token_account_1", 0xf)
							token_vault_1_box = ld64(s300 + 8)
							j = ld64(s300)
							if (j != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						st64(s790 + 0x28, token_vault_1_box)
						fn_7600(s40, c, token_vault_1_box, ap, aq)
						token_vault_1_box = ld64(s38)
						const ar = ld64(s40)
						if (ar != 2) {
							k = fn_4130(s310, ar, token_vault_1_box, "token_vault_0", 0xd)
							token_vault_1_box = ld64(s310 + 8)
							j = ld64(s310)
							if (j != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						st64(s790 + 0x20, token_vault_1_box)
						fn_7600(s40, c, token_vault_1_box, at, au)
						token_vault_1_box = ld64(s38)
						const av = ld64(s40)
						if (av != 2) {
							k = fn_4130(s320, av, token_vault_1_box, "token_vault_1", 0xd)
							token_vault_1_box = ld64(s320 + 8)
							j = ld64(s320)
							if (j != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						st64(s790 + 0x18, token_vault_1_box)
						try_accounts_17ae0(s40, c, token_vault_1_box, aw, ax)
						const ba = ld64(s38 + 8)
						const az = ld64(s38)
						const ay = ld64(s40)
						if (ay == 0) {
							k = fn_4130(s6c0, az, ba, 0x1001598f8 /* "rent" */, 4)
							j = ld64(s6c0)
							st64(a + 0x10, ld64(s6c0 + 8))
							st64(a + 8, j)
							st64(a, 0)
							return k
						}
						st64(s790, ay, az, ba)
						st64(s798, ld64(s38 + 0x10))
						try_accounts_18870(s40, c, ba)
						token_vault_1_box = ld64(s38)
						const bb = ld64(s40)
						if (bb != 2) {
							k = fn_4130(s330, bb, token_vault_1_box, "system_program", 0xe)
							token_vault_1_box = ld64(s330 + 8)
							j = ld64(s330)
							if (j != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						st64(s7a0, token_vault_1_box)
						st64(s228, token_vault_1_box)
						try_accounts_19190(s40, c, token_vault_1_box, bc, bd)
						token_vault_1_box = ld64(s38)
						const be = ld64(s40)
						if (be != 2) {
							k = fn_4130(s340, be, token_vault_1_box, 0x10015b020 /* "token_program" */, 0xd)
							token_vault_1_box = ld64(s340 + 8)
							j = ld64(s340)
							if (j != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						st64(s7a8, token_vault_1_box)
						st64(s220, token_vault_1_box)
						try_accounts_18f40(s40, c, token_vault_1_box, bf, bg)
						token_vault_1_box = ld64(s38)
						const bh = ld64(s40)
						if (bh != 2) {
							k = fn_4130(s350, bh, token_vault_1_box, "associated_token_program", 0x18)
							token_vault_1_box = ld64(s350 + 8)
							j = ld64(s350)
							if (j != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						st64(s7b0, token_vault_1_box)
						st64(s218, token_vault_1_box)
						try_accounts_18aa0(s40, c, token_vault_1_box, bi, bj)
						let bl = ld64(s38)
						const bk = ld64(s40)
						if (bk != 2) {
							k = fn_4130(s360, bk, bl, "metadata_program", 0x10)
							bl = ld64(s360 + 8)
							j = ld64(s360)
							if (j != 2) {
								st64(a + 0x10, bl)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						rent_get(s40)
						copy(s1f8, s38, 0x18)
						if (ld64(s40) != 0) {
							k = fn_13e628(s6b0, s1f8)
							j = ld64(s6b0)
							st64(a + 0x10, ld64(s6b0 + 8))
							st64(a + 8, j)
							st64(a, 0)
							return k
						}
						st64(s7b8, bl)
						copyr(s210, s1f8, 0x18)
						st64(s40, s248, s210, s258, s228, s220, s238)
						k = fn_94438(s138, s40)
						const i = ld64(s138 + 8)
						j = ld64(s138)
						if (j == 2) {
							st64(s7c0, i)
							const position_nft_mint: AccountInfo = ld64(i + 0x58)
							if (position_nft_mint.is_writable != 0) {
								if (position_nft_mint.is_signer != 0) {
									AccountInfo_clone_f338(s138, position_nft_mint)
									st64(s7c8, fn_147a20(s138))
									AccountInfo_clone_f338(s40, ld64(ld64(s7c0) + 0x58))
									AccountInfo_try_data_len(s88, s40)
									const bo = ld64(s88 + 8)
									const bn = ld64(s88)
									if (bn != 0x800000000000001a /* Ok */) {
										st64(s88 + 0x10, ld64(s88 + 0x10))
										st64(s88, bn, bo)
										cg = fn_13e628(s3b0, s88)
										cf = ld64(s3b0)
										st64(a + 0x10, ld64(s3b0 + 8))
										st64(a + 8, cf)
										st64(a, 0)
										return ptr_drop_in_place_fcd8(s138, ptr_drop_in_place_fcd8(s40, cg))
									}
									const bp = Rent_is_exempt(s210, ld64(s7c8), bo)
									ptr_drop_in_place_fcd8(s138, ptr_drop_in_place_fcd8(s40, bp))
									if (bp != 0) {
										rent_get(s40)
										copy(s1c8, s38, 0x18)
										if (ld64(s40) != 0) {
											k = fn_13e628(s6a0, s1c8)
											j = ld64(s6a0)
											st64(a + 0x10, ld64(s6a0 + 8))
											st64(a + 8, j)
											st64(a, 0)
											return k
										}
										copyr(s1e0, s1c8, 0x18)
										st64(s18, s228, s220)
										st64(s20, ld64(s7c0))
										st64(s40, s240, s218, s258, s250)
										k = fn_960a0(s138, s40)
										st64(s7c8, ld64(s138 + 8))
										j = ld64(s138)
										if (j == 2) {
											const position_nft_account: AccountInfo = ld64(ld64(s7c8))
											if (position_nft_account.is_writable != 0) {
												AccountInfo_clone_f338(s138, position_nft_account)
												st64(s7d0, fn_147a20(s138))
												AccountInfo_clone_f338(s40, ld64(ld64(s7c8)))
												AccountInfo_try_data_len(s88, s40)
												const bs = ld64(s88 + 8)
												const br = ld64(s88)
												if (br != 0x800000000000001a /* Ok */) {
													st64(s88 + 0x10, ld64(s88 + 0x10))
													st64(s88, br, bs)
													cg = fn_13e628(s400, s88)
													cf = ld64(s400)
													st64(a + 0x10, ld64(s400 + 8))
													st64(a + 8, cf)
													st64(a, 0)
													return ptr_drop_in_place_fcd8(s138, ptr_drop_in_place_fcd8(s40, cg))
												}
												const bt = Rent_is_exempt(s1e0, ld64(s7d0), bs)
												ptr_drop_in_place_fcd8(s138, ptr_drop_in_place_fcd8(s40, bt))
												if (bt != 0) {
													rent_get(s40)
													copy(s198, s38, 0x18)
													if (ld64(s40) != 0) {
														k = fn_13e628(s690, s198)
														j = ld64(s690)
														st64(a + 0x10, ld64(s690 + 8))
														st64(a + 8, j)
														st64(a, 0)
														return k
													}
													copyr(s1b0, s198, 0x18)
													const bu = ld64(ld64(ld64(s7c0) + 0x58))
													const by = ld64(bu)
													const bx = ld64(bu + 8)
													const bw = ld64(bu + 0x10)
													const bv = ld64(bu + 0x18)
													st64(s88, 0x100159360)
													st64(s88 + 0x10, s138)
													st64(s138, by, bx, bw, bv)
													st64(s88 + 8, 8)
													st64(s88 + 0x18, 0x20)
													// PDA find_program_address(["position", *s138], program *(ld64(s260)))
													Pubkey_find_program_address(s40, s88, 2, ld64(s260))
													copyr(s180, s40, 0x20)
													const bz = ld8(s20)
													st8(s159, bz)
													st8(ca + 2, bz)
													const cb = ld64(ld64(s790 + 0x40))
													copyr(s158, cb, 0x20)
													if ((memcmp(s158, s180, 0x20) as u32) == 0) {
														st64(s18, s159, s260)
														st64(s20, ld64(s7c0))
														st64(s40, s230, s1b0, s258, s228)
														k = fn_96f00(s138, s40)
														st64(s790 + 0x40, ld64(s138 + 8))
														j = ld64(s138)
														if (j == 2) {
															const personal_position: AccountInfo = ld64(ld64(s790 + 0x40))
															if (personal_position.is_writable != 0) {
																AccountInfo_clone_f338(s138, personal_position)
																st64(s7d0, fn_147a20(s138))
																AccountInfo_clone_f338(s40, ld64(ld64(s790 + 0x40)))
																AccountInfo_try_data_len(s88, s40)
																const cj = ld64(s88 + 8)
																const ci = ld64(s88)
																if (ci != 0x800000000000001a /* Ok */) {
																	st64(s88 + 0x10, ld64(s88 + 0x10))
																	st64(s88, ci, cj)
																	cg = fn_13e628(s480, s88)
																	cf = ld64(s480)
																	st64(a + 0x10, ld64(s480 + 8))
																	st64(a + 8, cf)
																	st64(a, 0)
																	return ptr_drop_in_place_fcd8(s138, ptr_drop_in_place_fcd8(s40, cg))
																}
																const ck = Rent_is_exempt(s1b0, ld64(s7d0), cj)
																ptr_drop_in_place_fcd8(s138, ptr_drop_in_place_fcd8(s40, ck))
																if (ck != 0) {
																	if (payer.is_writable != 0) {
																		if (ld8(ld64(s790 + 0x60) + 0x29) != 0) {
																			if (ld8(ld64(s790 + 0x58) + 0x29 /* is_writable */) != 0) {
																				const cl = ld64(ld64(s790 + 0x58) /* key */)
																				copyr(se8, cl, 0x20)
																				st64(s40, 0x10015a23e)
																				st64(s38 + 8, se8)
																				st64(s20, s88)
																				st32(s88, bswap32(ld64(s790 + 0x70)))
																				st64(s38, 0xa)
																				st64(s38 + 0x10, 0x20)
																				st64(s18, 4)
																				// PDA find_program_address(["tick_array", *cl, u32 bswap32(ld64(s790 + 0x70)) [ix data?]], program *(ld64(s260)))
																				Pubkey_find_program_address(s138, s40, 3, ld64(s260))
																				copyr(s108, s138, 0x20)
																				st8(ca, ld8(s138 + 0x20))
																				const cm = ld64(ld64(s790 + 0x48) /* key */)
																				copyr(sc8, cm, 0x20)
																				if ((memcmp(sc8, s108, 0x20) as u32) != 0) {
																					anchor_error_from(s510, 0x7d6 /* anchor::ConstraintSeeds */)
																					const cq = fn_4130(s520, ld64(s510), ld64(s510 + 8), "tick_array_lower", 0x10)
																					const cp = ld64(s520 + 8)
																					const co = ld64(s520)
																					copyr(s40, sc8, 0x20)
																					copy(s20, s108, 0x20)
																					k = Error_with_pubkeys(s530, co, cp, s40, cq)
																					j = ld64(s530)
																					st64(a + 0x10, ld64(s530 + 8))
																					st64(a + 8, j)
																					st64(a, 0)
																					return k
																				}
																				if (ld8(ld64(s790 + 0x48) + 0x29 /* is_writable */) != 0) {
																					copyr(s88, se8, 0x20)
																					st64(s20, s64)
																					st64(s38 + 8, s88)
																					st64(s40, 0x10015a23e)
																					st32(s64, bswap32(ld64(s790 + 0x78)))
																					st64(s18, 4)
																					st64(s38 + 0x10, 0x20)
																					st64(s38, 0xa)
																					// PDA find_program_address(["tick_array", *s88, u32 bswap32(ld64(s790 + 0x78)) [ix data?]], program *(ld64(s260)))
																					Pubkey_find_program_address(s138, s40, 3, ld64(s260))
																					copyr(sa8, s138, 0x20)
																					st8(ca + 1, ld8(s138 + 0x20))
																					const cn = ld64(ld64(s790 + 0x38) /* key */)
																					copyr(s60, cn, 0x20)
																					if ((memcmp(s60, sa8, 0x20) as u32) != 0) {
																						anchor_error_from(s560, 0x7d6 /* anchor::ConstraintSeeds */)
																						const ct = fn_4130(s570, ld64(s560), ld64(s560 + 8), "tick_array_upper", 0x10)
																						const cs = ld64(s570 + 8)
																						const cr = ld64(s570)
																						copyr(s40, s60, 0x20)
																						copy(s20, sa8, 0x20)
																						k = Error_with_pubkeys(s580, cr, cs, s40, ct)
																						j = ld64(s580)
																						st64(a + 0x10, ld64(s580 + 8))
																						st64(a + 8, j)
																						st64(a, 0)
																						return k
																					}
																					if (ld8(ld64(s790 + 0x38) + 0x29 /* is_writable */) != 0) {
																						if (ld8(ld64(ld64(s790 + 0x30)) + 0x29) != 0) {
																							const token_vault_0_box: TokenAccount_2 = ld64(s790 + 0x20)
																							copyr(s40, token_vault_0_box.mint, 0x20)
																							if ((memcmp(ld64(s790 + 0x30) + 8, s40, 0x20) as u32) != 0) {
																								k = anchor_error_from(s5d0, 0x7de /* anchor::ConstraintTokenMint */)
																								j = ld64(s5d0)
																								st64(a + 0x10, ld64(s5d0 + 8))
																								st64(a + 8, j)
																								st64(a, 0)
																								return k
																							}
																							if (ld8(ld64(ld64(s790 + 0x28)) + 0x29) != 0) {
																								const token_vault_1_box_2: TokenAccount_2 = ld64(s790 + 0x18)
																								copyr(s40, token_vault_1_box_2.mint, 0x20)
																								const cw = memcmp(ld64(s790 + 0x28) + 8, s40, 0x20)
																								if ((cw as u32) != 0) {
																									k = anchor_error_from(s600, 0x7de /* anchor::ConstraintTokenMint */)
																									j = ld64(s600)
																									st64(a + 0x10, ld64(s600 + 8))
																									st64(a + 8, j)
																									st64(a, 0)
																									return k
																								}
																								const token_vault_0: AccountInfo = ld64(ld64(s790 + 0x20))
																								if (token_vault_0.is_writable != 0) {
																									const cy = token_vault_0.key
																									copyr(s40, cy, 0x20)
																									k = fn_4dc0(s138, ld64(s238), cw as u32)
																									let da = ld64(s138 + 0x10)
																									let cz = ld64(s138 + 8)
																									if (ld64(s138) != 0) {
																										st64(a + 0x10, da)
																										st64(a + 8, cz)
																										st64(a, 0)
																										return k
																									}
																									const db = memcmp(s40, cz + 0x81, 0x20)
																									st64(da, ld64(da) - 1)
																									if ((db as u32) == 0) {
																										const token_vault_1: AccountInfo = ld64(ld64(s790 + 0x18))
																										if (token_vault_1.is_writable != 0) {
																											const dd = token_vault_1.key
																											copyr(s40, dd, 0x20)
																											k = fn_4dc0(s138, ld64(s238), db as u32)
																											da = ld64(s138 + 0x10)
																											cz = ld64(s138 + 8)
																											if (ld64(s138) != 0) {
																												st64(a + 0x10, da)
																												st64(a + 8, cz)
																												st64(a, 0)
																												return k
																											}
																											const de = memcmp(s40, cz + 0xa1, 0x20)
																											st64(da, ld64(da) - 1)
																											k = de as u32
																											if (k == 0) {
																												st64(a + 0xa8, ld64(s7b8))
																												st64(a + 0xa0, ld64(s7b0))
																												st64(a + 0x98, ld64(s7a8))
																												st64(a + 0x90, ld64(s7a0))
																												st64(a + 0x88, ld64(s798))
																												st64(a + 0x80, ld64(s790 + 0x10))
																												st64(a + 0x78, ld64(s790 + 8))
																												st64(a + 0x70, ld64(s790))
																												st64(a + 0x68, ld64(s790 + 0x18))
																												st64(a + 0x60, ld64(s790 + 0x20))
																												st64(a + 0x58, ld64(s790 + 0x28))
																												st64(a + 0x50, ld64(s790 + 0x30))
																												st64(a + 0x48, ld64(s790 + 0x40))
																												st64(a + 0x40, ld64(s790 + 0x38))
																												st64(a + 0x38, ld64(s790 + 0x48))
																												st64(a + 0x30, ld64(s790 + 0x50))
																												st64(a + 0x28, ld64(s790 + 0x58))
																												st64(a + 0x20, ld64(s790 + 0x60))
																												st64(a + 0x18, ld64(s7c8))
																												st64(a + 0x10, ld64(s7c0))
																												st64(a + 8, ld64(s790 + 0x68))
																												st64(a, payer)
																												return k
																											}
																											anchor_error_from(s670, 0x7d3 /* anchor::ConstraintRaw */)
																											k = fn_4130(s680, ld64(s670), ld64(s670 + 8), "token_vault_1", 0xd)
																											j = ld64(s680)
																											st64(a + 0x10, ld64(s680 + 8))
																											st64(a + 8, j)
																											st64(a, 0)
																											return k
																										}
																										anchor_error_from(s650, 0x7d0 /* anchor::ConstraintMut */)
																										k = fn_4130(s660, ld64(s650), ld64(s650 + 8), "token_vault_1", 0xd)
																										j = ld64(s660)
																										st64(a + 0x10, ld64(s660 + 8))
																										st64(a + 8, j)
																										st64(a, 0)
																										return k
																									}
																									anchor_error_from(s630, 0x7d3 /* anchor::ConstraintRaw */)
																									k = fn_4130(s640, ld64(s630), ld64(s630 + 8), "token_vault_0", 0xd)
																									j = ld64(s640)
																									st64(a + 0x10, ld64(s640 + 8))
																									st64(a + 8, j)
																									st64(a, 0)
																									return k
																								}
																								anchor_error_from(s610, 0x7d0 /* anchor::ConstraintMut */)
																								k = fn_4130(s620, ld64(s610), ld64(s610 + 8), "token_vault_0", 0xd)
																								j = ld64(s620)
																								st64(a + 0x10, ld64(s620 + 8))
																								st64(a + 8, j)
																								st64(a, 0)
																								return k
																							}
																							anchor_error_from(s5e0, 0x7d0 /* anchor::ConstraintMut */)
																							k = fn_4130(s5f0, ld64(s5e0), ld64(s5e0 + 8), "token_account_1", 0xf)
																							j = ld64(s5f0)
																							st64(a + 0x10, ld64(s5f0 + 8))
																							st64(a + 8, j)
																							st64(a, 0)
																							return k
																						}
																						anchor_error_from(s5b0, 0x7d0 /* anchor::ConstraintMut */)
																						k = fn_4130(s5c0, ld64(s5b0), ld64(s5b0 + 8), "token_account_0", 0xf)
																						j = ld64(s5c0)
																						st64(a + 0x10, ld64(s5c0 + 8))
																						st64(a + 8, j)
																						st64(a, 0)
																						return k
																					}
																					anchor_error_from(s590, 0x7d0 /* anchor::ConstraintMut */)
																					k = fn_4130(s5a0, ld64(s590), ld64(s590 + 8), "tick_array_upper", 0x10)
																					j = ld64(s5a0)
																					st64(a + 0x10, ld64(s5a0 + 8))
																					st64(a + 8, j)
																					st64(a, 0)
																					return k
																				}
																				anchor_error_from(s540, 0x7d0 /* anchor::ConstraintMut */)
																				k = fn_4130(s550, ld64(s540), ld64(s540 + 8), "tick_array_lower", 0x10)
																				j = ld64(s550)
																				st64(a + 0x10, ld64(s550 + 8))
																				st64(a + 8, j)
																				st64(a, 0)
																				return k
																			}
																			anchor_error_from(s4f0, 0x7d0 /* anchor::ConstraintMut */)
																			k = fn_4130(s500, ld64(s4f0), ld64(s4f0 + 8), "pool_state", 0xa)
																			j = ld64(s500)
																			st64(a + 0x10, ld64(s500 + 8))
																			st64(a + 8, j)
																			st64(a, 0)
																			return k
																		}
																		anchor_error_from(s4d0, 0x7d0 /* anchor::ConstraintMut */)
																		k = fn_4130(s4e0, ld64(s4d0), ld64(s4d0 + 8), "metadata_account", 0x10)
																		j = ld64(s4e0)
																		st64(a + 0x10, ld64(s4e0 + 8))
																		st64(a + 8, j)
																		st64(a, 0)
																		return k
																	}
																	anchor_error_from(s4b0, 0x7d0 /* anchor::ConstraintMut */)
																	k = fn_4130(s4c0, ld64(s4b0), ld64(s4b0 + 8), "payer", 5)
																	j = ld64(s4c0)
																	st64(a + 0x10, ld64(s4c0 + 8))
																	st64(a + 8, j)
																	st64(a, 0)
																	return k
																}
																anchor_error_from(s490, 0x7d5 /* anchor::ConstraintRentExempt */)
																k = fn_4130(s4a0, ld64(s490), ld64(s490 + 8), 0x10015b06a /* "personal_position" */, 0x11)
																j = ld64(s4a0)
																st64(a + 0x10, ld64(s4a0 + 8))
																st64(a + 8, j)
																st64(a, 0)
																return k
															}
															anchor_error_from(s460, 0x7d0 /* anchor::ConstraintMut */)
															k = fn_4130(s470, ld64(s460), ld64(s460 + 8), 0x10015b06a /* "personal_position" */, 0x11)
															j = ld64(s470)
															st64(a + 0x10, ld64(s470 + 8))
															st64(a + 8, j)
															st64(a, 0)
															return k
														}
														st64(a + 0x10, ld64(s790 + 0x40))
														st64(a + 8, j)
														st64(a, 0)
														return k
													}
													anchor_error_from(s430, 0x7d6 /* anchor::ConstraintSeeds */)
													const ce = fn_4130(s440, ld64(s430), ld64(s430 + 8), 0x10015b06a /* "personal_position" */, 0x11)
													const cd = ld64(s440 + 8)
													const cc = ld64(s440)
													copyr(s40, s158, 0x20)
													copy(s20, s180, 0x20)
													k = Error_with_pubkeys(s450, cc, cd, s40, ce)
													j = ld64(s450)
													st64(a + 0x10, ld64(s450 + 8))
													st64(a + 8, j)
													st64(a, 0)
													return k
												}
												anchor_error_from(s410, 0x7d5 /* anchor::ConstraintRentExempt */)
												k = fn_4130(s420, ld64(s410), ld64(s410 + 8), "position_nft_account", 0x14)
												j = ld64(s420)
												st64(a + 0x10, ld64(s420 + 8))
												st64(a + 8, j)
												st64(a, 0)
												return k
											}
											anchor_error_from(s3e0, 0x7d0 /* anchor::ConstraintMut */)
											k = fn_4130(s3f0, ld64(s3e0), ld64(s3e0 + 8), "position_nft_account", 0x14)
											j = ld64(s3f0)
											st64(a + 0x10, ld64(s3f0 + 8))
											st64(a + 8, j)
											st64(a, 0)
											return k
										}
										st64(a + 0x10, ld64(s7c8))
										st64(a + 8, j)
										st64(a, 0)
										return k
									}
									anchor_error_from(s3c0, 0x7d5 /* anchor::ConstraintRentExempt */)
									k = fn_4130(s3d0, ld64(s3c0), ld64(s3c0 + 8), "position_nft_mint", 0x11)
									j = ld64(s3d0)
									st64(a + 0x10, ld64(s3d0 + 8))
									st64(a + 8, j)
									st64(a, 0)
									return k
								}
								anchor_error_from(s390, 0x7d2 /* anchor::ConstraintSigner */)
								k = fn_4130(s3a0, ld64(s390), ld64(s390 + 8), "position_nft_mint", 0x11)
								j = ld64(s3a0)
								st64(a + 0x10, ld64(s3a0 + 8))
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
							anchor_error_from(s370, 0x7d0 /* anchor::ConstraintMut */)
							k = fn_4130(s380, ld64(s370), ld64(s370 + 8), "position_nft_mint", 0x11)
							j = ld64(s380)
							st64(a + 0x10, ld64(s380 + 8))
							st64(a + 8, j)
							st64(a, 0)
							return k
						}
						st64(a + 0x10, i)
						st64(a + 8, j)
						st64(a, 0)
						return k
					}
					k = anchor_error_from(s6e0, 0xbbd /* anchor::AccountNotEnoughKeys */, v + 0x30, w, u)
					j = ld64(s6e0)
					st64(a + 0x10, ld64(s6e0 + 8))
					st64(a + 8, j)
					st64(a, 0)
					return k
				}
				k = anchor_error_from(s6f0, 0xbbd /* anchor::AccountNotEnoughKeys */, n, o)
				u = undef
				j = ld64(s6f0)
				if (j == 2) {
					k = anchor_error_from(s700, 0xbbd /* anchor::AccountNotEnoughKeys */, n, o, u)
					j = ld64(s700)
					st64(a + 0x10, ld64(s700 + 8))
					st64(a + 8, j)
					st64(a, 0)
					return k
				}
				const p = ld64(0x300000000 /* heap bump-allocator cursor */)
				const q = p != 0 ? sat_sub(p, 0x12) : 0x300007fee
				token_vault_1_box = ld64(s6f0 + 8)
				if ((j & 1) != 0) {
					if (0x300000008 > q) {
						raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008, 0x12 > p)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, q)
					st64(q + 8, 0x6e776f5f74666e5f)
					st64(q, 0x6e6f697469736f70)
					st16(q + 0x10, 0x7265)
					void token_vault_1_box.info
				} else {
					if (0x300000008 > q) {
						raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008, 0x12 > p)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, q)
					st64(q + 8, 0x6e776f5f74666e5f)
					st64(q, 0x6e6f697469736f70)
					st16(q + 0x10, 0x7265)
					void token_vault_1_box.info
				}
				st64(token_vault_1_box.mint + 8, q, 0x12)
				st64(token_vault_1_box.mint, 0x12)
				st64(token_vault_1_box, 1)
				st64(a + 0x10, token_vault_1_box)
				st64(a + 8, j)
				st64(a, 0)
				return k
			}
			const s = ld64(0x300000000 /* heap bump-allocator cursor */)
			const t = s != 0 ? sat_sub(s, 5) : 0x300007ffb
			if ((j & 1) != 0) {
				if (0x300000008 > t) {
					raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(s, 5), 5 > s)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, t)
				st8(t + 4, 0x72)
				st32(t, 0x65796170)
				void payer.key
			} else {
				if (0x300000008 > t) {
					raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(s, 5), 5 > s)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, t)
				st8(t + 4, 0x72)
				st32(t, 0x65796170)
				void payer.key
			}
			st64(payer + 0x10, t, 5)
			st64(payer + 8, 5)
			st64(payer, 1)
			st64(a + 0x10, payer)
			st64(a + 8, j)
			st64(a, 0)
			return k
		}
	}
	const g = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (g & 3) - 2) {
		k = anchor_error_from(s710, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s710)
		st64(a + 0x10, ld64(s710 + 8))
		st64(a + 8, j)
		st64(a, 0)
		return k
	}
	if ((g & 3) == 0) {
		k = anchor_error_from(s710, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s710)
		st64(a + 0x10, ld64(s710 + 8))
		st64(a + 8, j)
		st64(a, 0)
		return k
	}
	const h = ld64(ld64(g + 7))
	if (h == 0) {
		k = anchor_error_from(s710, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s710)
		st64(a + 0x10, ld64(s710 + 8))
		st64(a + 8, j)
		st64(a, 0)
		return k
	}
	callx(h, ld64(g - 1), h)
	k = anchor_error_from(s710, 0x66 /* anchor::InstructionDidNotDeserialize */)
	j = ld64(s710)
	st64(a + 0x10, ld64(s710 + 8))
	st64(a + 8, j)
	st64(a, 0)
	return k
}

export function fn_94438(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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
			st64(s330 + 8, 0x100159d93)
			st32(s2b8 + 0x20, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s2e0, 2)
			st32(s318, 0x17)
			st64(s330 + 0x10, 0x2e)
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

export function fn_96f00(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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
			st64(s380 + 8, 0x100159d93)
			st32(s300 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s330, 2)
			st32(s368, 0x17)
			st64(s380 + 0x10, 0x2e)
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
// types [heur]: b: OpenPositionContext (the handler ix_open_position passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_1b850(a: u64, b: OpenPositionContext, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s80 = fp - 0x80, s98 = fp - 0x98, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sc8 = fp - 0xc8, sd0 = fp - 0xd0, sd8 = fp - 0xd8, se0 = fp - 0xe0, sf8 = fp - 0xf8, s100 = fp - 0x100, s108 = fp - 0x108, s170 = fp - 0x170, s180 = fp - 0x180, s188 = fp - 0x188, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, sf70 = fp - 0xf70, sf88 = fp - 0xf88, s1000 = fp - 0x1000
	let i, j: u64
	let g = a
	const accounts: OpenPositionAccounts = b.accounts
	if (ld8(accounts.token_account_0 + 0x74) != 2 && ld8(accounts.token_account_1 + 0x74) != 2) {
		const bs = g
		const k: AccountInfo = ld64(ld64(accounts + 0x10) + 0x58)
		const l: LamportsCell = k.lamports
		const bl = p12
		const bm = p11
		const bn = p10
		const bo = p9
		const bp = p8
		const bq = p7
		const br = p6
		const m = p5
		const s = k.key
		rc_inc(l)
		const n: DataCell = k.data
		rc_inc(n)
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
		const bd = ba.key
		rc_inc(bb)
		const bc: DataCell = ba.data
		rc_inc(bc)
		const bh = ba.owner
		const bg = ba.rent_epoch
		const bf = ba.is_signer
		const be = ba.is_writable
		st8(s180 + 2, ba.executable)
		st8(s180, bf, be)
		st64(s1a8, bd, bb, bc, bh, bg)
		const remaining_accounts: AccountInfo = b.remaining_accounts
		const bj = b.remaining_accounts_len
		const bi = ld8(b + 0x22)
		st64(sf70, remaining_accounts, bj, bi, c, d, m, br, bq, bp, bo, bn, bm, bl)
		st64(s1000 + 0x70, accounts + 0xa8)
		st64(s1000, sd8, accounts + 0x20, accounts + 0x28, accounts + 0x38, accounts + 0x40, accounts + 0x48, sa8, s78, s48, s1a8, accounts + 0x70, accounts + 0x90, accounts + 0x98)
		st64(sf70 + 0x68, 0)
		st64(sf88, 0, 0, 0)
		j = fn_1c850(s1b8, accounts, accounts + 8, s108, fp, bd)
		i = ld64(s1b8 + 8)
		const h = ld64(s1b8)
		if (rc_release(bb)) {
			j = Rc_drop_slow_14df0(s1a0, j)
		}
		g = bs
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
	st64(s1a0, 0x100159d93)
	st32(s170 + 0x60, 0x1770 /* error::NotApproved */)
	st8(s170 + 0x18, 2)
	st32(s198 + 8, 0xa4)
	st64(s198, 0x2e)
	st64(s1a8, 0)
	j = fn_13e5a0(s1c8, s1a8)
	i = ld64(s1c8 + 8)
	st64(g, ld64(s1c8))
	st64(g + 8, i)
	return j
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_account_1, token_vault_0, token_vault_1
export function fn_989f8(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8
	let g, i, j, k, z, aa: u64
	B48: {
		const f = ld64(ld64(b + 0x10) + 0x58)
		if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(f) == 0 && ld64(ld64(f + 0x10) + 0x10) != 0)) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			z = fn_13e628(s28, s18)
			g = ld64(s28)
			if (g != 2) {
				const h = ld64(0x300000000 /* heap bump-allocator cursor */)
				i = 0x11 > h
				j = h != 0 ? i != 0 ? 0 : h - 0x11 : 0x300007fef
				k = ld64(s28 + 8)
				if ((g & 1) != 0) {
					if (0x300000008 > j) {
						raw_vec_handle_error(1, 0x11, 0x10015f8f8, i, aa)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 8, 0x6e696d5f74666e5f)
					st64(j, 0x6e6f697469736f70)
					st8(j + 0x10, 0x74)
					void ld64(k)
					break B48
				}
				if (0x300000008 > j) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, i, aa)
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
			z = fn_13e628(s38, s18)
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
				return z
			}
		}
		z = fn_a80(s48, ld64(b + 0x28), c)
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
			return z
		}
		z = fn_b4e0(s58, ld64(b + 0x48), 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
		g = ld64(s58)
		if (g == 2) {
			const r = ld64(ld64(b + 0x50))
			if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(r) == 0 && ld64(ld64(r + 0x10) + 0x10) != 0)) {
				st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
				z = fn_13e628(s68, s18)
				g = ld64(s68)
				if (g != 2) {
					const s = ld64(0x300000000 /* heap bump-allocator cursor */)
					const t = s != 0 ? sat_sub(s, 0xf) : 0x300007ff1
					k = ld64(s68 + 8)
					if ((g & 1) != 0) {
						if (0x300000008 > t) {
							raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0xf > s)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, t)
						st64(t + 7, 0x305f746e756f6363)
						st64(t, 0x63615f6e656b6f74)
						void ld64(k)
					} else {
						if (0x300000008 > t) {
							raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0xf > s)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, t)
						st64(t + 7, 0x305f746e756f6363)
						st64(t, 0x63615f6e656b6f74)
						void ld64(k)
					}
					st64(k + 0x10, t, 0xf)
					st64(k + 8, 0xf)
					st64(k, 1)
					st64(a + 8, k)
					st64(a, g)
					return z
				}
			}
			const u = ld64(ld64(b + 0x58))
			if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(u) == 0 && ld64(ld64(u + 0x10) + 0x10) != 0)) {
				st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
				fn_13e628(s78, s18)
				const v = ld64(s78)
				if (v != 2) {
					z = fn_4130(s88, v, ld64(s78 + 8), "token_account_1", 0xf)
					k = ld64(s88 + 8)
					g = ld64(s88)
					if (g != 2) {
						st64(a + 8, k)
						st64(a, g)
						return z
					}
				}
			}
			fn_a1d8(s98, ld64(ld64(b + 0x60)), 0x1001594a0 /* &TOKEN_PROGRAM */, c)
			const w = ld64(s98)
			if (w != 2) {
				z = fn_4130(sa8, w, ld64(s98 + 8), "token_vault_0", 0xd)
				k = ld64(sa8 + 8)
				g = ld64(sa8)
				if (g != 2) {
					st64(a + 8, k)
					st64(a, g)
					return z
				}
			}
			z = fn_a1d8(sb8, ld64(ld64(b + 0x68)), 0x1001594a0 /* &TOKEN_PROGRAM */, c)
			k = undef
			const x = ld64(sb8)
			if (x == 2) {
				st64(a + 8, k)
				st64(a, 2)
				return z
			}
			z = fn_4130(sc8, x, ld64(sb8 + 8), "token_vault_1", 0xd)
			k = undef
			const y = ld64(sc8)
			if (y == 2) {
				st64(a + 8, k)
				st64(a, 2)
				return z
			}
			st64(a + 8, ld64(sc8 + 8))
			st64(a, y)
			return z
		}
		const q = ld64(0x300000000 /* heap bump-allocator cursor */)
		i = 0x11 > q
		j = q != 0 ? i != 0 ? 0 : q - 0x11 : 0x300007fef
		k = ld64(s58 + 8)
		if ((g & 1) != 0) {
			if (0x300000008 > j) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, i, aa)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x6f697469736f705f)
			st64(j, 0x6c616e6f73726570)
			st8(j + 0x10, 0x6e)
			void ld64(k)
		} else {
			if (0x300000008 > j) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, i, aa)
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
	return z
}
