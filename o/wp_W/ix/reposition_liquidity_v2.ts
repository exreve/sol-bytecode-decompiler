/// <reference path="../lib.d.ts" />
// instruction reposition_liquidity_v2
import { fn_11150, fn_12758, fn_147e78, fn_1494c8, fn_2258, memcpy } from '../shared.ts'

// instruction handler: reposition_liquidity_v2 (discriminator sha256("global:reposition_liquidity_v2")[..8] = 0xfd9e13830be0a9bf)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, position, token_mint_a, token_mint_b, existing_tick_array_lower, existing_tick_array_upper, new_tick_array_lower, new_tick_array_upper, token_program_a, funder, position_token_account, token_owner_account_a, token_vault_b, token_vault_a, token_owner_account_b, token_program_b, system_program, position_authority, memo_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: accounts, accounts_len, ix_args, ix_args_len
export function ix_reposition_liquidity_v2(a: u64, b: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500
	let j, k: u64
	sol_log("Instruction: RepositionLiquidityV2", 0x22)
	st64(s4f0, ix_args, ix_args_len)
	fn_11abf0(s4e0, s4f0)
	const f = ld64(s4e0)
	if (f == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
		const g = ld64(s4e0 + 8)
		const h = (g & 3) - 2
		if (2 > h) {
			k = anchor_error_from(s500, 0x66 /* anchor::InstructionDidNotDeserialize */, h)
			j = ld64(s500)
			st64(a + 8, ld64(s500 + 8))
			st64(a, j)
			return k
		}
		if ((g & 3) == 0) {
			k = anchor_error_from(s500, 0x66 /* anchor::InstructionDidNotDeserialize */, h)
			j = ld64(s500)
			st64(a + 8, ld64(s500 + 8))
			st64(a, j)
			return k
		}
		const i = ld64(ld64(g + 7))
		callx(i, ld64(g - 1), i, h)
		k = anchor_error_from(s500, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s500)
		st64(a + 8, ld64(s500 + 8))
		st64(a, j)
		return k
	}
	st64(s4f0, accounts, accounts_len)
	k = accounts_reposition_liquidity_v2(s4e0, f, s4f0, undef, fp)
	if (ld32(s4e0) == 2) {
		j = ld64(s4e0 + 8)
		st64(a + 8, ld64(s4e0 + 0x10))
		st64(a, j)
		return k
	}
	fn_1494c8("internal error: entered unreachable code", 0x28, 0x10015a9a0)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_11abf0(a: u64, b: u64) {
	const s10 = fp - 0x10, s40 = fp - 0x40, s58 = fp - 0x58, s59 = fp - 0x59
	let i: u64
	const f = ld64(b + 8)
	if (4 > f) {
		st64(a + 8, fn_1459d0(0x100159468))
		st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
	} else {
		const g = ld64(b)
		const o = ld32(g)
		st64(b, g + 4, f - 4)
		if (4 > f - 4) {
			st64(a + 8, fn_1459d0(0x100159468))
			st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
		} else {
			const n = ld32(g + 4)
			st64(b, g + 8, f - 8)
			if (f == 8) {
				i = fn_1459d0(0x100159468)
				st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, i)
			} else {
				const h = ld8(g + 8)
				st64(b + 8, f - 9)
				st64(b, g + 9)
				st8(s59, h)
				if (h != 0) {
					st64(s40, 0x100159668)
					st64(s40 + 0x10, s10)
					st64(s10, s59, num_fmt_bae8)
					st64(s40 + 0x20, 0)
					st64(s40 + 8, 1)
					st64(s40 + 0x18, 1)
					// fmt "Unexpected variant index: {}" {} = h [num_fmt_bae8]
					fn_147e78(s58, s40, g, f - 8, g + 9)
					i = fn_b580(s58)
					st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, i)
				} else if (0x11 > f - 8) {
					i = fn_1459d0(0x100159468)
					st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, i)
				} else {
					const k = ld64(g + 0x11)
					const p = ld64(g + 9)
					st64(b, g + 0x19, f - 0x19)
					if (8 > f - 0x19) {
						i = fn_1459d0(0x100159468)
						st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, i)
					} else {
						const j = ld64(g + 0x19)
						st64(b, g + 0x21, f - 0x21)
						if (8 > f - 0x21) {
							i = fn_1459d0(0x100159468)
							st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, i)
						} else {
							const t = ld64(g + 0x21)
							st64(b, g + 0x29, f - 0x29)
							if (8 > f - 0x29) {
								i = fn_1459d0(0x100159468)
								st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, i)
							} else {
								const s = ld64(g + 0x29)
								st64(b, g + 0x31, f - 0x31)
								if (f - 0x31 > 7) {
									const r = ld64(g + 0x31)
									st64(b + 8, f - 0x39)
									st64(b, g + 0x39)
									fn_11150(s40, b)
									const m = ld64(s40 + 8)
									const l = ld64(s40)
									if (l == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
										st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, m)
									} else {
										const q = ld64(s40 + 0x10)
										st32(a + 0x4c, n)
										st32(a + 0x48, o)
										st64(a + 0x40, r)
										st64(a + 0x38, s)
										st64(a + 0x30, t)
										st64(a + 0x28, j)
										st64(a + 0x20, k)
										st64(a + 0x18, p)
										st64(a + 0x10, q)
										st64(a + 8, m)
										st64(a, l)
									}
								} else {
									i = fn_1459d0(0x100159468)
									st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, i)
								}
							}
						}
					}
				}
			}
		}
	}
}

// Anchor Accounts::try_accounts of instruction reposition_liquidity_v2 (called by ix_reposition_liquidity_v2; name [str]: from the handler's "Instruction: …" log; was fn_f0b70)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool (ConstraintMut), position (ConstraintMut, ConstraintHasOne), token_mint_a (ConstraintAddress), token_mint_b (ConstraintAddress), existing_tick_array_lower (AccountNotEnoughKeys, ConstraintMut), existing_tick_array_upper (ConstraintMut), new_tick_array_lower (ConstraintMut), new_tick_array_upper (ConstraintMut), token_program_a (ConstraintAddress), funder (ConstraintMut), position_token_account (ConstraintRaw), token_owner_account_a (ConstraintMut, ConstraintRaw), token_vault_b (ConstraintMut, ConstraintRaw), token_vault_a (ConstraintMut, ConstraintRaw), token_owner_account_b (ConstraintMut, ConstraintRaw), token_program_b (ConstraintAddress), system_program, position_authority, memo_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_token_account_box, token_owner_account_a_box, token_owner_account_b_box, token_vault_a_box, token_vault_b_box, whirlpool, token_program_a, token_vault_a, token_vault_b
export function accounts_reposition_liquidity_v2(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s80 = fp - 0x80, sa0 = fp - 0xa0, se0 = fp - 0xe0, s100 = fp - 0x100, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1d8 = fp - 0x1d8, s408 = fp - 0x408, s448 = fp - 0x448, s450 = fp - 0x450, s460 = fp - 0x460, s468 = fp - 0x468, s4f0 = fp - 0x4f0, s510 = fp - 0x510, s530 = fp - 0x530, s550 = fp - 0x550, s6e0 = fp - 0x6e0, s6f8 = fp - 0x6f8, s708 = fp - 0x708, s718 = fp - 0x718, s728 = fp - 0x728, s738 = fp - 0x738, s748 = fp - 0x748, s758 = fp - 0x758, s768 = fp - 0x768, s778 = fp - 0x778, s788 = fp - 0x788, s798 = fp - 0x798, s7a8 = fp - 0x7a8, s7b8 = fp - 0x7b8, s7c8 = fp - 0x7c8, s7d8 = fp - 0x7d8, s7e8 = fp - 0x7e8, s7f8 = fp - 0x7f8, s808 = fp - 0x808, s818 = fp - 0x818, s828 = fp - 0x828, s838 = fp - 0x838, s848 = fp - 0x848, s858 = fp - 0x858, s868 = fp - 0x868, s878 = fp - 0x878, s888 = fp - 0x888, s898 = fp - 0x898, s8a8 = fp - 0x8a8, s8b8 = fp - 0x8b8, s8c8 = fp - 0x8c8, s8d8 = fp - 0x8d8, s8e8 = fp - 0x8e8, s8f8 = fp - 0x8f8, s908 = fp - 0x908, s918 = fp - 0x918, s928 = fp - 0x928, s938 = fp - 0x938, s948 = fp - 0x948, s958 = fp - 0x958, s968 = fp - 0x968, s978 = fp - 0x978, s988 = fp - 0x988, s998 = fp - 0x998, s9a8 = fp - 0x9a8, s9b8 = fp - 0x9b8, s9c8 = fp - 0x9c8, s9d8 = fp - 0x9d8, s9e8 = fp - 0x9e8, s9f8 = fp - 0x9f8, sa08 = fp - 0xa08, sa18 = fp - 0xa18, sa28 = fp - 0xa28, sa38 = fp - 0xa38, sa48 = fp - 0xa48, sa58 = fp - 0xa58, sa68 = fp - 0xa68, sa78 = fp - 0xa78, sa88 = fp - 0xa88, sa98 = fp - 0xa98, saa8 = fp - 0xaa8, sab8 = fp - 0xab8, sac8 = fp - 0xac8, sad8 = fp - 0xad8, sae8 = fp - 0xae8, saf8 = fp - 0xaf8, sb08 = fp - 0xb08, sb18 = fp - 0xb18, sb28 = fp - 0xb28, sb38 = fp - 0xb38, sb48 = fp - 0xb48, sb58 = fp - 0xb58, sb68 = fp - 0xb68, sb78 = fp - 0xb78, sba8 = fp - 0xba8, sbd0 = fp - 0xbd0, sbf8 = fp - 0xbf8, sc00 = fp - 0xc00, sc08 = fp - 0xc08, sc10 = fp - 0xc10, sc18 = fp - 0xc18, sc20 = fp - 0xc20, sc28 = fp - 0xc28, sc30 = fp - 0xc30, sc38 = fp - 0xc38, sc40 = fp - 0xc40
	let z, ab, ac, an, ao: u64
	let g = a
	try_accounts_11a48(s468, c, c, d, e)
	const h = ld64(s460 + 8)
	const i = ld64(s460)
	const whirlpool: AccountInfo = ld64(s468)
	if (whirlpool == 0) {
		ac = Error_with_account_name(sb78, i, h, 0x100152b28 /* "whirlpool" */, 9)
		z = ld64(sb78)
		st64(g + 0x10, ld64(sb78 + 8))
		st64(g + 8, z)
		st32(g, 2)
		return ac
	}
	st64(sba8 + 0x28, g)
	memcpy(s6e0, s450, 0x278)
	st64(s6f8, whirlpool, i, h)
	try_accounts_120(s468, c)
	const token_program_a: AccountInfo = ld64(s460)
	const j = ld64(s468)
	if (j == 2) {
		try_accounts_120(s468, c)
		const l = ld64(s460)
		const k = ld64(s468)
		const aa = ld64(sba8 + 0x28)
		if (k == 2) {
			st64(sba8 + 0x20, l)
			fn_12758(s468, c, l)
			const n = ld64(s460)
			const m = ld64(s468)
			if (m == 2) {
				st64(sba8 + 0x18, n)
				try_accounts_11718(s468, c, n)
				const p = ld64(s460)
				const o = ld64(s468)
				if (o == 2) {
					st64(sba8 + 0x10, p)
					try_accounts_11718(s468, c, p)
					const r = ld64(s460)
					const q = ld64(s468)
					if (q == 2) {
						st64(sbd0 + 0x20, r)
						try_accounts_11b00(s468, c, r)
						const u = ld64(s460 + 8)
						const t = ld64(s460)
						const s = ld64(s468)
						if (s == 0) {
							ac = Error_with_account_name(sb68, t, u, "position", 8)
							z = ld64(sb68)
							g = ld64(sba8 + 0x28)
							st64(g + 0x10, ld64(sb68 + 8))
							st64(g + 8, z)
							st32(g, 2)
							return ac
						}
						st64(sba8, u, t)
						memcpy(s1c0, s450, 0xc0)
						st64(s1d0 + 8, ld64(sba8))
						st64(s1d0, ld64(sba8 + 8))
						st64(sba8 + 8, s)
						st64(s1d8, s)
						fn_2258(s468, c)
						const position_token_account_box: TokenAccount_2 = ld64(s460)
						const v = ld64(s468)
						if (v == 2) {
							st64(sba8, position_token_account_box)
							try_accounts_610(s468, c, position_token_account_box)
							const x = ld32(s468)
							if (x == 2) {
								ac = Error_with_account_name(sb58, ld64(s460), ld64(s460 + 8), "token_mint_a", 0xc)
								z = ld64(sb58)
								g = ld64(sba8 + 0x28)
								st64(g + 0x10, ld64(sb58 + 8))
								st64(g + 8, z)
								st32(g, 2)
								return ac
							}
							copyr(sbd0, s460, 0x10)
							st64(sbd0 + 0x10, ld32(s468 + 4))
							memcpy(se0, s450, 0x40)
							copy(s100, s408, 0x20)
							st64(sbd0 + 0x18, ld64(s448 + 0x38))
							try_accounts_610(s468, c)
							const ad = ld32(s468)
							if (ad == 2) {
								ac = Error_with_account_name(sb48, ld64(s460), ld64(s460 + 8), "token_mint_b", 0xc)
								z = ld64(sb48)
								g = ld64(sba8 + 0x28)
								st64(g + 0x10, ld64(sb48 + 8))
								st64(g + 8, z)
								st32(g, 2)
								return ac
							}
							st64(sbf8 + 0x18, ad)
							copyr(sbf8, s460, 0x10)
							st64(sbf8 + 0x10, ld32(s468 + 4))
							memcpy(s80, s450, 0x40)
							copy(sa0, s408, 0x20)
							st64(sbf8 + 0x20, ld64(s448 + 0x38))
							fn_2258(s468, c)
							const token_owner_account_a_box: TokenAccount_2 = ld64(s460)
							const ae = ld64(s468)
							if (ae == 2) {
								st64(sc00, token_owner_account_a_box)
								fn_2258(s468, c, token_owner_account_a_box)
								const token_owner_account_b_box: TokenAccount_2 = ld64(s460)
								const ag = ld64(s468)
								if (ag == 2) {
									st64(sc08, token_owner_account_b_box)
									fn_2258(s468, c, token_owner_account_b_box)
									const token_vault_a_box: TokenAccount_2 = ld64(s460)
									const ai = ld64(s468)
									if (ai == 2) {
										st64(sc10, token_vault_a_box)
										fn_2258(s468, c, token_vault_a_box)
										let token_vault_b_box: TokenAccount_2 = ld64(s460)
										const ak = ld64(s468)
										if (ak == 2) {
											B40: {
												B36: {
													B35: {
														st64(sc28, token_vault_b_box)
														const am = ld64(c + 8)
														if (am != 0) {
															const aq: AccountInfo = ld64(c)
															st64(sc18, aq)
															st64(c, aq + 0x30, am - 1)
															if (am != 1) {
																const at: AccountInfo = ld64(c)
																st64(sc20, at)
																st64(c, at + 0x30, am - 2)
																if (am != 2) {
																	const aw: AccountInfo = ld64(c)
																	st64(sc30, aw)
																	st64(c, aw + 0x30, am - 3)
																	if (am == 3) {
																		break B36
																	}
																	st64(c + 8, am - 4)
																	const ax: AccountInfo = ld64(c)
																	st64(sc38, ax)
																	st64(c, ax + 0x30)
																	break B40
																}
																break B35
															}
														} else {
															anchor_error_from(s7a8, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_b_box, an, ao)
															token_vault_b_box = undef
															st64(sc18, ld64(s7a8 + 8))
															const ap = ld64(s7a8)
															if (ap != 2) {
																ac = Error_with_account_name(s7b8, ap, ld64(sc18), "existing_tick_array_lower", 0x19)
																z = ld64(s7b8)
																g = ld64(sba8 + 0x28)
																st64(g + 0x10, ld64(s7b8 + 8))
																st64(g + 8, z)
																st32(g, 2)
																return ac
															}
														}
														anchor_error_from(s7c8, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_b_box, an, ao)
														token_vault_b_box = undef
														st64(sc20, ld64(s7c8 + 8))
														const ar = ld64(s7c8)
														if (ar != 2) {
															ac = Error_with_account_name(s7d8, ar, ld64(sc20), "existing_tick_array_upper", 0x19)
															z = ld64(s7d8)
															g = ld64(sba8 + 0x28)
															st64(g + 0x10, ld64(s7d8 + 8))
															st64(g + 8, z)
															st32(g, 2)
															return ac
														}
													}
													anchor_error_from(s7e8, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_b_box, an, ao)
													token_vault_b_box = undef
													st64(sc30, ld64(s7e8 + 8))
													const au = ld64(s7e8)
													if (au != 2) {
														ac = Error_with_account_name(s7f8, au, ld64(sc30), "new_tick_array_lower", 0x14)
														z = ld64(s7f8)
														g = ld64(sba8 + 0x28)
														st64(g + 0x10, ld64(s7f8 + 8))
														st64(g + 8, z)
														st32(g, 2)
														return ac
													}
												}
												anchor_error_from(s808, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_b_box, an, ao)
												token_vault_b_box = undef
												st64(sc38, ld64(s808 + 8))
												const av = ld64(s808)
												if (av != 2) {
													ac = Error_with_account_name(s818, av, ld64(sc38), "new_tick_array_upper", 0x14)
													z = ld64(s818)
													g = ld64(sba8 + 0x28)
													st64(g + 0x10, ld64(s818 + 8))
													st64(g + 8, z)
													st32(g, 2)
													return ac
												}
											}
											fn_122e8(s468, c, token_vault_b_box, an, ao)
											st64(sc40, ld64(s460))
											const ay = ld64(s468)
											if (ay == 2) {
												if (whirlpool.is_writable == 0) {
													anchor_error_from(sb28, 0x7d0 /* anchor::ConstraintMut */)
													ac = Error_with_account_name(sb38, ld64(sb28), ld64(sb28 + 8), 0x100152b28 /* "whirlpool" */, 9)
													z = ld64(sb38)
													g = ld64(sba8 + 0x28)
													st64(g + 0x10, ld64(sb38 + 8))
													st64(g + 8, z)
													st32(g, 2)
													return ac
												}
												const az = token_program_a.key
												copyr(s40, az, 0x20)
												AccountInfo_clone(s468, ld64(sbd0 + 0x18))
												const ba = ld64(s450)
												copy(s20, ba, 0x20)
												const bc = ld64(s460 + 8)
												const bb = ld64(s460)
												rc_dec(bb)
												rc_dec(bc)
												if ((memcmp(s40, s20, 0x20) as u32) != 0) {
													anchor_error_from(s838, 0x7dc /* anchor::ConstraintAddress */)
													const bm = Error_with_account_name(s848, ld64(s838), ld64(s838 + 8), "token_program_a", 0xf)
													const bl = ld64(s848 + 8)
													const bk = ld64(s848)
													copy(s468, s40, 0x40)
													ac = fn_13b5c0(s858, bk, bl, s468, bm)
													z = ld64(s858)
													g = ld64(sba8 + 0x28)
													st64(g + 0x10, ld64(s858 + 8))
													st64(g + 8, z)
													st32(g, 2)
													return ac
												}
												const bd = ld64(ld64(sba8 + 0x20))
												copyr(s40, bd, 0x20)
												AccountInfo_clone(s468, ld64(sbf8 + 0x20))
												const be = ld64(s450)
												copy(s20, be, 0x20)
												const bg = ld64(s460 + 8)
												const bf = ld64(s460)
												rc_dec(bf)
												rc_dec(bg)
												if ((memcmp(s40, s20, 0x20) as u32) == 0) {
													if (ld8(ld64(sbd0 + 0x20) + 0x29) == 0) {
														anchor_error_from(sb08, 0x7d0 /* anchor::ConstraintMut */)
														ac = Error_with_account_name(sb18, ld64(sb08), ld64(sb08 + 8), "funder", 6)
														z = ld64(sb18)
														g = ld64(sba8 + 0x28)
														st64(g + 0x10, ld64(sb18 + 8))
														st64(g + 8, z)
														st32(g, 2)
														return ac
													}
													if (ld8(ld64(sba8 + 8) + 0x29) != 0) {
														copyr(s40, s1d0, 0x20)
														const bn = whirlpool.key
														copyr(s20, bn, 0x20)
														if ((memcmp(s40, s20, 0x20) as u32) != 0) {
															anchor_error_from(s898, 0x7d1 /* anchor::ConstraintHasOne */)
															const bq = Error_with_account_name(s8a8, ld64(s898), ld64(s898 + 8), "position", 8)
															const bp = ld64(s8a8 + 8)
															const bo = ld64(s8a8)
															copyr(s468, s1d0, 0x20)
															copy(s448, s20, 0x20)
															ac = fn_13b5c0(s8b8, bo, bp, s468, bq)
															z = ld64(s8b8)
															g = ld64(sba8 + 0x28)
															st64(g + 0x10, ld64(s8b8 + 8))
															st64(g + 8, z)
															st32(g, 2)
															return ac
														}
														if ((memcmp(ld64(sba8) + 0x28, s1b0, 0x20) as u32) == 0) {
															if (ld64(ld64(sba8) + 0x68) != 1) {
																anchor_error_from(s8e8, 0x7d3 /* anchor::ConstraintRaw */)
																ac = Error_with_account_name(s8f8, ld64(s8e8), ld64(s8e8 + 8), "position_token_account", 0x16)
																z = ld64(s8f8)
																g = ld64(sba8 + 0x28)
																st64(g + 0x10, ld64(s8f8 + 8))
																st64(g + 8, z)
																st32(g, 2)
																return ac
															}
															const br = ld64(ld64(sbd0 + 0x18))
															copyr(s40, br, 0x20)
															copyr(s20, s550, 0x20)
															if ((memcmp(s40, s20, 0x20) as u32) == 0) {
																const bv = ld64(ld64(sbf8 + 0x20))
																copyr(s40, bv, 0x20)
																copyr(s20, s510, 0x20)
																if ((memcmp(s40, s20, 0x20) as u32) == 0) {
																	if (ld8(ld64(ld64(sc00) + 0x20) + 0x29) == 0) {
																		anchor_error_from(sac8, 0x7d0 /* anchor::ConstraintMut */)
																		ac = Error_with_account_name(sad8, ld64(sac8), ld64(sac8 + 8), "token_owner_account_a", 0x15)
																		z = ld64(sad8)
																		g = ld64(sba8 + 0x28)
																		st64(g + 0x10, ld64(sad8 + 8))
																		st64(g + 8, z)
																		st32(g, 2)
																		return ac
																	}
																	if ((memcmp(ld64(sc00) + 0x28, s550, 0x20) as u32) == 0) {
																		if (ld8(ld64(ld64(sc08) + 0x20) + 0x29) != 0) {
																			if ((memcmp(ld64(sc08) + 0x28, s510, 0x20) as u32) == 0) {
																				const token_vault_a: AccountInfo = ld64(ld64(sc10) + 0x20)
																				if (token_vault_a.is_writable != 0) {
																					const ca = token_vault_a.key
																					copyr(s468, ca, 0x20)
																					if ((memcmp(s468, s530, 0x20) as u32) == 0) {
																						const token_vault_b: AccountInfo = ld64(ld64(sc28) + 0x20)
																						if (token_vault_b.is_writable != 0) {
																							const cc = token_vault_b.key
																							copyr(s468, cc, 0x20)
																							if ((memcmp(s468, s4f0, 0x20) as u32) == 0) {
																								if (ld8(ld64(sc18) + 0x29) != 0) {
																									if (ld8(ld64(sc20) + 0x29) != 0) {
																										if (ld8(ld64(sc30) + 0x29) != 0) {
																											if (ld8(ld64(sc38) + 0x29) != 0) {
																												const cd = ld64(sba8 + 0x28)
																												memcpy(cd + 0x100, s6f8, 0x290)
																												memcpy(cd + 0x3b8, s1d8, 0xd8)
																												memcpy(cd + 0x18, se0, 0x40)
																												copy(cd + 0x60, s100, 0x20)
																												ac = memcpy(cd + 0x98, s80, 0x40)
																												const ch = ld64(sa0 + 0x18)
																												const cg = ld64(sa0 + 0x10)
																												const cf = ld64(sa0 + 8)
																												const ce = ld64(sa0)
																												copy(cd + 8, sbd0, 0x10)
																												st64(cd + 0x58, ld64(sbd0 + 0x18))
																												copy(cd + 0x88, sbf8, 0x10)
																												st64(cd + 0xd8, ld64(sbf8 + 0x20))
																												st64(cd + 0x390, token_program_a)
																												st64(cd + 0x398, ld64(sba8 + 0x20))
																												st64(cd + 0x3a0, ld64(sba8 + 0x18))
																												st64(cd + 0x3a8, ld64(sba8 + 0x10))
																												st64(cd + 0x3b0, ld64(sbd0 + 0x20))
																												st64(cd + 0x490, ld64(sba8))
																												st64(cd + 0x498, ld64(sc00))
																												st64(cd + 0x4a0, ld64(sc08))
																												st64(cd + 0x4a8, ld64(sc10))
																												st64(cd + 0x4b0, ld64(sc28))
																												st64(cd + 0x4b8, ld64(sc18))
																												st64(cd + 0x4c0, ld64(sc20))
																												st64(cd + 0x4c8, ld64(sc30))
																												st64(cd + 0x4d0, ld64(sc38))
																												st64(cd + 0x4d8, ld64(sc40))
																												st32(cd + 0x84, ld64(sbf8 + 0x10))
																												st32(cd + 0x80, ld64(sbf8 + 0x18))
																												st32(cd + 4, ld64(sbd0 + 0x10))
																												st32(cd, x)
																												st64(cd + 0xe0, ce, cf, cg, ch)
																												return ac
																											}
																											anchor_error_from(s9e8, 0x7d0 /* anchor::ConstraintMut */)
																											ac = Error_with_account_name(s9f8, ld64(s9e8), ld64(s9e8 + 8), "new_tick_array_upper", 0x14)
																											z = ld64(s9f8)
																											g = ld64(sba8 + 0x28)
																											st64(g + 0x10, ld64(s9f8 + 8))
																											st64(g + 8, z)
																											st32(g, 2)
																											return ac
																										}
																										anchor_error_from(sa08, 0x7d0 /* anchor::ConstraintMut */)
																										ac = Error_with_account_name(sa18, ld64(sa08), ld64(sa08 + 8), "new_tick_array_lower", 0x14)
																										z = ld64(sa18)
																										g = ld64(sba8 + 0x28)
																										st64(g + 0x10, ld64(sa18 + 8))
																										st64(g + 8, z)
																										st32(g, 2)
																										return ac
																									}
																									anchor_error_from(sa28, 0x7d0 /* anchor::ConstraintMut */)
																									ac = Error_with_account_name(sa38, ld64(sa28), ld64(sa28 + 8), "existing_tick_array_upper", 0x19)
																									z = ld64(sa38)
																									g = ld64(sba8 + 0x28)
																									st64(g + 0x10, ld64(sa38 + 8))
																									st64(g + 8, z)
																									st32(g, 2)
																									return ac
																								}
																								anchor_error_from(sa48, 0x7d0 /* anchor::ConstraintMut */)
																								ac = Error_with_account_name(sa58, ld64(sa48), ld64(sa48 + 8), "existing_tick_array_lower", 0x19)
																								z = ld64(sa58)
																								g = ld64(sba8 + 0x28)
																								st64(g + 0x10, ld64(sa58 + 8))
																								st64(g + 8, z)
																								st32(g, 2)
																								return ac
																							}
																							anchor_error_from(s9c8, 0x7d3 /* anchor::ConstraintRaw */)
																							ac = Error_with_account_name(s9d8, ld64(s9c8), ld64(s9c8 + 8), "token_vault_b", 0xd)
																							z = ld64(s9d8)
																							g = ld64(sba8 + 0x28)
																							st64(g + 0x10, ld64(s9d8 + 8))
																							st64(g + 8, z)
																							st32(g, 2)
																							return ac
																						}
																						anchor_error_from(sa68, 0x7d0 /* anchor::ConstraintMut */)
																						ac = Error_with_account_name(sa78, ld64(sa68), ld64(sa68 + 8), "token_vault_b", 0xd)
																						z = ld64(sa78)
																						g = ld64(sba8 + 0x28)
																						st64(g + 0x10, ld64(sa78 + 8))
																						st64(g + 8, z)
																						st32(g, 2)
																						return ac
																					}
																					anchor_error_from(s9a8, 0x7d3 /* anchor::ConstraintRaw */)
																					ac = Error_with_account_name(s9b8, ld64(s9a8), ld64(s9a8 + 8), "token_vault_a", 0xd)
																					z = ld64(s9b8)
																					g = ld64(sba8 + 0x28)
																					st64(g + 0x10, ld64(s9b8 + 8))
																					st64(g + 8, z)
																					st32(g, 2)
																					return ac
																				}
																				anchor_error_from(sa88, 0x7d0 /* anchor::ConstraintMut */)
																				ac = Error_with_account_name(sa98, ld64(sa88), ld64(sa88 + 8), "token_vault_a", 0xd)
																				z = ld64(sa98)
																				g = ld64(sba8 + 0x28)
																				st64(g + 0x10, ld64(sa98 + 8))
																				st64(g + 8, z)
																				st32(g, 2)
																				return ac
																			}
																			anchor_error_from(s988, 0x7d3 /* anchor::ConstraintRaw */)
																			ac = Error_with_account_name(s998, ld64(s988), ld64(s988 + 8), "token_owner_account_b", 0x15)
																			z = ld64(s998)
																			g = ld64(sba8 + 0x28)
																			st64(g + 0x10, ld64(s998 + 8))
																			st64(g + 8, z)
																			st32(g, 2)
																			return ac
																		}
																		anchor_error_from(saa8, 0x7d0 /* anchor::ConstraintMut */)
																		ac = Error_with_account_name(sab8, ld64(saa8), ld64(saa8 + 8), "token_owner_account_b", 0x15)
																		z = ld64(sab8)
																		g = ld64(sba8 + 0x28)
																		st64(g + 0x10, ld64(sab8 + 8))
																		st64(g + 8, z)
																		st32(g, 2)
																		return ac
																	}
																	anchor_error_from(s968, 0x7d3 /* anchor::ConstraintRaw */)
																	ac = Error_with_account_name(s978, ld64(s968), ld64(s968 + 8), "token_owner_account_a", 0x15)
																	z = ld64(s978)
																	g = ld64(sba8 + 0x28)
																	st64(g + 0x10, ld64(s978 + 8))
																	st64(g + 8, z)
																	st32(g, 2)
																	return ac
																}
																anchor_error_from(s938, 0x7dc /* anchor::ConstraintAddress */)
																const by = Error_with_account_name(s948, ld64(s938), ld64(s938 + 8), "token_mint_b", 0xc)
																const bx = ld64(s948 + 8)
																const bw = ld64(s948)
																copyr(s468, s40, 0x20)
																copy(s448, s510, 0x20)
																ac = fn_13b5c0(s958, bw, bx, s468, by)
																z = ld64(s958)
																g = ld64(sba8 + 0x28)
																st64(g + 0x10, ld64(s958 + 8))
																st64(g + 8, z)
																st32(g, 2)
																return ac
															}
															anchor_error_from(s908, 0x7dc /* anchor::ConstraintAddress */)
															const bu = Error_with_account_name(s918, ld64(s908), ld64(s908 + 8), "token_mint_a", 0xc)
															const bt = ld64(s918 + 8)
															const bs = ld64(s918)
															copyr(s468, s40, 0x20)
															copy(s448, s550, 0x20)
															ac = fn_13b5c0(s928, bs, bt, s468, bu)
															z = ld64(s928)
															g = ld64(sba8 + 0x28)
															st64(g + 0x10, ld64(s928 + 8))
															st64(g + 8, z)
															st32(g, 2)
															return ac
														}
														anchor_error_from(s8c8, 0x7d3 /* anchor::ConstraintRaw */)
														ac = Error_with_account_name(s8d8, ld64(s8c8), ld64(s8c8 + 8), "position_token_account", 0x16)
														z = ld64(s8d8)
														g = ld64(sba8 + 0x28)
														st64(g + 0x10, ld64(s8d8 + 8))
														st64(g + 8, z)
														st32(g, 2)
														return ac
													}
													anchor_error_from(sae8, 0x7d0 /* anchor::ConstraintMut */)
													ac = Error_with_account_name(saf8, ld64(sae8), ld64(sae8 + 8), "position", 8)
													z = ld64(saf8)
													g = ld64(sba8 + 0x28)
													st64(g + 0x10, ld64(saf8 + 8))
													st64(g + 8, z)
													st32(g, 2)
													return ac
												}
												anchor_error_from(s868, 0x7dc /* anchor::ConstraintAddress */)
												const bj = Error_with_account_name(s878, ld64(s868), ld64(s868 + 8), "token_program_b", 0xf)
												const bi = ld64(s878 + 8)
												const bh = ld64(s878)
												copy(s468, s40, 0x40)
												ac = fn_13b5c0(s888, bh, bi, s468, bj)
												z = ld64(s888)
												g = ld64(sba8 + 0x28)
												st64(g + 0x10, ld64(s888 + 8))
												st64(g + 8, z)
												st32(g, 2)
												return ac
											}
											ac = Error_with_account_name(s828, ay, ld64(sc40), "system_program", 0xe)
											z = ld64(s828)
											g = ld64(sba8 + 0x28)
											st64(g + 0x10, ld64(s828 + 8))
											st64(g + 8, z)
											st32(g, 2)
											return ac
										}
										ac = Error_with_account_name(s798, ak, token_vault_b_box, "token_vault_b", 0xd)
										z = ld64(s798)
										g = ld64(sba8 + 0x28)
										st64(g + 0x10, ld64(s798 + 8))
										st64(g + 8, z)
										st32(g, 2)
										return ac
									}
									ac = Error_with_account_name(s788, ai, token_vault_a_box, "token_vault_a", 0xd)
									z = ld64(s788)
									g = ld64(sba8 + 0x28)
									st64(g + 0x10, ld64(s788 + 8))
									st64(g + 8, z)
									st32(g, 2)
									return ac
								}
								ac = Error_with_account_name(s778, ag, token_owner_account_b_box, "token_owner_account_b", 0x15)
								z = ld64(s778)
								g = ld64(sba8 + 0x28)
								st64(g + 0x10, ld64(s778 + 8))
								st64(g + 8, z)
								st32(g, 2)
								return ac
							}
							ac = Error_with_account_name(s768, ae, token_owner_account_a_box, "token_owner_account_a", 0x15)
							z = ld64(s768)
							g = ld64(sba8 + 0x28)
							st64(g + 0x10, ld64(s768 + 8))
							st64(g + 8, z)
							st32(g, 2)
							return ac
						}
						ac = Error_with_account_name(s758, v, position_token_account_box, "position_token_account", 0x16)
						z = ld64(s758)
						g = ld64(sba8 + 0x28)
						st64(g + 0x10, ld64(s758 + 8))
						st64(g + 8, z)
						st32(g, 2)
						return ac
					}
					ac = Error_with_account_name(s748, q, r, "funder", 6)
					ab = ld64(s748)
					st64(aa + 0x10, ld64(s748 + 8))
					st64(aa + 8, ab)
					st32(aa, 2)
					return ac
				}
				ac = Error_with_account_name(s738, o, p, "position_authority", 0x12)
				ab = ld64(s738)
				st64(aa + 0x10, ld64(s738 + 8))
				st64(aa + 8, ab)
				st32(aa, 2)
				return ac
			}
			ac = Error_with_account_name(s728, m, n, "memo_program", 0xc)
			ab = ld64(s728)
			st64(aa + 0x10, ld64(s728 + 8))
			st64(aa + 8, ab)
			st32(aa, 2)
			return ac
		}
		ac = Error_with_account_name(s718, k, l, "token_program_b", 0xf)
		ab = ld64(s718)
		st64(aa + 0x10, ld64(s718 + 8))
		st64(aa + 8, ab)
		st32(aa, 2)
		return ac
	}
	ac = Error_with_account_name(s708, j, token_program_a, "token_program_a", 0xf)
	z = ld64(s708)
	g = ld64(sba8 + 0x28)
	st64(g + 0x10, ld64(s708 + 8))
	st64(g + 8, z)
	st32(g, 2)
	return ac
}
