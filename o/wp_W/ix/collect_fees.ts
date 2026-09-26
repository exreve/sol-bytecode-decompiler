/// <reference path="../lib.d.ts" />
// instruction collect_fees
import { fn_20f8, fn_5a40, fn_60480, fn_652d0, memcpy } from '../shared.ts'

// instruction handler: collect_fees (discriminator sha256("global:collect_fees")[..8] = 0xb613ba1e63cf98a4)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, position, position_token_account, token_owner_account_a, token_vault_a, token_owner_account_b, token_vault_b, token_program, position_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
export function ix_collect_fees(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s30 = fp - 0x30, s48 = fp - 0x48, s50 = fp - 0x50, s78 = fp - 0x78, s88 = fp - 0x88, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, s1000 = fp - 0x1000
	sol_log("Instruction: CollectFees", 0x18)
	st64(sa0, accounts, accounts_len)
	let n = accounts_collect_fees(s48, undef, sa0, undef, fp)
	const g = ld64(s48 + 0x10)
	let h = ld64(s48 + 8)
	const f = ld64(s48)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return n
	}
	memcpy(s78, s30, 0x30)
	st64(s90, f, h, g)
	n = fn_60480(sb0, ld64(s78), s88)
	h = ld64(sb0)
	if (h != 2) {
		st64(a + 8, ld64(sb0 + 8))
		st64(a, h)
		return n
	}
	const i = ld64(g + 0x78)
	st64(g + 0x78, 0)
	const o = ld64(g + 0x80)
	st64(g + 0x80, 0)
	const k = ld64(s78 + 8)
	const j = ld64(s78 + 0x10)
	st64(s1000, s50, i)
	n = fn_652d0(sc0, f, j, k, s50, i)
	h = ld64(sc0)
	if (h == 2) {
		const m = ld64(s78 + 0x18)
		const l = ld64(s78 + 0x20)
		st64(s1000, s50, o)
		n = fn_652d0(sd0, f, l, m, s50, o)
		h = ld64(sd0)
		if (h == 2) {
			n = fn_8ef60(se0, s90, program_id)
			h = ld64(se0)
			st64(a + 8, ld64(se0 + 8))
			st64(a, h)
			return n
		}
		st64(a + 8, ld64(sd0 + 8))
		st64(a, h)
		return n
	}
	st64(a + 8, ld64(sc0 + 8))
	st64(a, h)
	return n
}

// Anchor Accounts::try_accounts of instruction collect_fees (called by ix_collect_fees; name [str]: from the handler's "Instruction: …" log; was fn_8d7b0)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool, position (ConstraintMut, ConstraintHasOne), position_token_account (ConstraintRaw), token_owner_account_a (ConstraintMut, ConstraintRaw), token_vault_a (ConstraintMut, ConstraintAddress), token_owner_account_b (ConstraintMut, ConstraintRaw), token_vault_b (ConstraintMut, ConstraintAddress), token_program (ConstraintAddress), position_authority
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_token_account_box, token_owner_account_a_box, token_vault_a_box, token_owner_account_b_box, token_vault_b_box, token_vault_a, token_vault_b
export function accounts_collect_fees(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s270 = fp - 0x270, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s510 = fp - 0x510, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s580 = fp - 0x580
	let ad, ae: u64
	try_accounts_11a48(s290, c, c, d, e)
	if (ld64(s290) == 0) {
		ae = Error_with_account_name(s540, ld64(s290 + 8), ld64(s290 + 0x10), 0x100152b28 /* "whirlpool" */, 9)
		ad = ld64(s540)
		st64(a + 0x10, ld64(s540 + 8))
		st64(a + 8, ad)
		st64(a, 0)
		return ae
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x290) & -8 : 0x300007d70
	if (g > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, s290, 0x290)
		try_accounts_11718(s290, c)
		const j = ld64(s290 + 8)
		const h = ld64(s290)
		if (h == 2) {
			try_accounts_11b00(s290, c)
			if (ld64(s290) == 0) {
				ae = Error_with_account_name(s530, ld64(s290 + 8), ld64(s290 + 0x10), "position", 8)
				ad = ld64(s530)
				st64(a + 0x10, ld64(s530 + 8))
				st64(a + 8, ad)
				st64(a, 0)
				return ae
			}
			const i = ld64(0x300000000 /* heap bump-allocator cursor */)
			const k = i != 0 ? sat_sub(i, 0xd8) & -8 : 0x300007f28
			st64(s580 + 0x30, j)
			if (k > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, k)
				st64(s580 + 0x38, k)
				memcpy(k, s290, 0xd8)
				try_accounts_558(s290, c)
				if (ld32(s270 + 0x90) == 2) {
					ae = Error_with_account_name(s520, ld64(s290), ld64(s290 + 8), "position_token_account", 0x16)
					ad = ld64(s520)
					st64(a + 0x10, ld64(s520 + 8))
					st64(a + 8, ad)
					st64(a, 0)
					return ae
				}
				const l = ld64(0x300000000 /* heap bump-allocator cursor */)
				const position_token_account_box: TokenAccount_2 = l != 0 ? sat_sub(l, 0xd8) & -8 : 0x300007f28
				if (position_token_account_box > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, position_token_account_box)
					st64(s580 + 0x28, position_token_account_box)
					memcpy(position_token_account_box, s290, 0xd8)
					try_accounts_11f50(s290, c)
					if (ld32(s270 + 0x70) == 2) {
						ae = Error_with_account_name(s510, ld64(s290), ld64(s290 + 8), "token_owner_account_a", 0x15)
						ad = ld64(s510)
						st64(a + 0x10, ld64(s510 + 8))
						st64(a + 8, ad)
						st64(a, 0)
						return ae
					}
					const n = ld64(0x300000000 /* heap bump-allocator cursor */)
					const token_owner_account_a_box: TokenAccount = n != 0 ? sat_sub(n, 0xb8) & -8 : 0x300007f48
					if (token_owner_account_a_box > 0x300000007) {
						st64(0x300000000 /* heap bump-allocator cursor */, token_owner_account_a_box)
						st64(s580 + 0x20, token_owner_account_a_box)
						memcpy(token_owner_account_a_box, s290, 0xb8)
						try_accounts_11f50(s290, c)
						if (ld32(s270 + 0x70) == 2) {
							ae = Error_with_account_name(s500, ld64(s290), ld64(s290 + 8), "token_vault_a", 0xd)
							ad = ld64(s500)
							st64(a + 0x10, ld64(s500 + 8))
							st64(a + 8, ad)
							st64(a, 0)
							return ae
						}
						const p = ld64(0x300000000 /* heap bump-allocator cursor */)
						const token_vault_a_box: TokenAccount = p != 0 ? sat_sub(p, 0xb8) & -8 : 0x300007f48
						if (token_vault_a_box > 0x300000007) {
							st64(0x300000000 /* heap bump-allocator cursor */, token_vault_a_box)
							memcpy(token_vault_a_box, s290, 0xb8)
							fn_20f8(s290, c)
							const token_owner_account_b_box: TokenAccount = ld64(s290 + 8)
							const r = ld64(s290)
							if (r == 2) {
								st64(s580 + 0x18, token_owner_account_b_box)
								fn_20f8(s290, c, token_owner_account_b_box)
								const token_vault_b_box: TokenAccount = ld64(s290 + 8)
								const t = ld64(s290)
								if (t == 2) {
									st64(s580 + 0x10, token_vault_b_box)
									fn_129a0(s290, c, token_vault_b_box)
									const x = ld64(s290 + 8)
									const v = ld64(s290)
									if (v == 2) {
										const w = ld64(s580 + 0x38)
										if (ld8(ld64(w) + 0x29) == 0) {
											anchor_error_from(s4e0, 0x7d0 /* anchor::ConstraintMut */, x, w)
											ae = Error_with_account_name(s4f0, ld64(s4e0), ld64(s4e0 + 8), "position", 8)
											ad = ld64(s4f0)
											st64(a + 0x10, ld64(s4f0 + 8))
											st64(a + 8, ad)
											st64(a, 0)
											return ae
										}
										st64(s580, x, token_vault_a_box)
										copyr(s2d0, w + 8, 0x20)
										const y = ld64(ld64(g))
										copyr(s2b0, y, 0x20)
										if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
											anchor_error_from(s320, 0x7d1 /* anchor::ConstraintHasOne */)
											const ac = Error_with_account_name(s330, ld64(s320), ld64(s320 + 8), "position", 8)
											const ab = ld64(s330 + 8)
											const aa = ld64(s330)
											copy(s290, s2d0, 0x40)
											ae = fn_13b5c0(s340, aa, ab, s290, ac)
											ad = ld64(s340)
											st64(a + 0x10, ld64(s340 + 8))
											st64(a + 8, ad)
											st64(a, 0)
											return ae
										}
										const z: TokenAccount_2 = ld64(s580 + 0x28)
										if ((memcmp(z.mint, w + 0x28, 0x20) as u32) == 0) {
											if (z.amount != 1) {
												anchor_error_from(s370, 0x7d3 /* anchor::ConstraintRaw */)
												ae = Error_with_account_name(s380, ld64(s370), ld64(s370 + 8), "position_token_account", 0x16)
												ad = ld64(s380)
												st64(a + 0x10, ld64(s380 + 8))
												st64(a + 8, ad)
												st64(a, 0)
												return ae
											}
											const af: TokenAccount = ld64(s580 + 0x20)
											if (af.info.is_writable == 0) {
												anchor_error_from(s4c0, 0x7d0 /* anchor::ConstraintMut */)
												ae = Error_with_account_name(s4d0, ld64(s4c0), ld64(s4c0 + 8), "token_owner_account_a", 0x15)
												ad = ld64(s4d0)
												st64(a + 0x10, ld64(s4d0 + 8))
												st64(a + 8, ad)
												st64(a, 0)
												return ae
											}
											if ((memcmp(af.mint, g + 0x1a8, 0x20) as u32) == 0) {
												const token_vault_a: AccountInfo = ld64(ld64(s580 + 8))
												if (token_vault_a.is_writable != 0) {
													const ah = token_vault_a.key
													copyr(s2d0, ah, 0x20)
													copyr(s2b0, g + 0x1c8, 0x20)
													if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
														anchor_error_from(s3b0, 0x7dc /* anchor::ConstraintAddress */)
														const ak = Error_with_account_name(s3c0, ld64(s3b0), ld64(s3b0 + 8), "token_vault_a", 0xd)
														const aj = ld64(s3c0 + 8)
														const ai = ld64(s3c0)
														copy(s290, s2d0, 0x40)
														ae = fn_13b5c0(s3d0, ai, aj, s290, ak)
														ad = ld64(s3d0)
														st64(a + 0x10, ld64(s3d0 + 8))
														st64(a + 8, ad)
														st64(a, 0)
														return ae
													}
													if (ld8(ld64(ld64(s580 + 0x18)) + 0x29) == 0) {
														anchor_error_from(s480, 0x7d0 /* anchor::ConstraintMut */)
														ae = Error_with_account_name(s490, ld64(s480), ld64(s480 + 8), "token_owner_account_b", 0x15)
														ad = ld64(s490)
														st64(a + 0x10, ld64(s490 + 8))
														st64(a + 8, ad)
														st64(a, 0)
														return ae
													}
													if ((memcmp(ld64(s580 + 0x18) + 8, g + 0x1e8, 0x20) as u32) == 0) {
														const token_vault_b: AccountInfo = ld64(ld64(s580 + 0x10))
														if (token_vault_b.is_writable != 0) {
															const am = token_vault_b.key
															copyr(s2d0, am, 0x20)
															copyr(s2b0, g + 0x208, 0x20)
															if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
																anchor_error_from(s400, 0x7dc /* anchor::ConstraintAddress */)
																const au = Error_with_account_name(s410, ld64(s400), ld64(s400 + 8), "token_vault_b", 0xd)
																const at = ld64(s410 + 8)
																const ar = ld64(s410)
																copy(s290, s2d0, 0x40)
																ae = fn_13b5c0(s420, ar, at, s290, au)
																ad = ld64(s420)
																st64(a + 0x10, ld64(s420 + 8))
																st64(a + 8, ad)
																st64(a, 0)
																return ae
															}
															const an = ld64(ld64(s580))
															copyr(s2b0, an, 0x20)
															ae = memcmp(s2b0, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32
															if (ae == 0) {
																st64(a + 0x40, ld64(s580))
																st64(a + 0x38, ld64(s580 + 0x10))
																st64(a + 0x30, ld64(s580 + 0x18))
																st64(a + 0x28, ld64(s580 + 8))
																st64(a + 0x20, ld64(s580 + 0x20))
																st64(a + 0x18, ld64(s580 + 0x28))
																st64(a + 0x10, ld64(s580 + 0x38))
																st64(a + 8, ld64(s580 + 0x30))
																st64(a, g)
																return ae
															}
															anchor_error_from(s430, 0x7dc /* anchor::ConstraintAddress */)
															const aq = Error_with_account_name(s440, ld64(s430), ld64(s430 + 8), "token_program", 0xd)
															const ap = ld64(s440 + 8)
															const ao = ld64(s440)
															copyr(s290, s2b0, 0x20)
															st64(s270, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
															ae = fn_13b5c0(s450, ao, ap, s290, aq)
															ad = ld64(s450)
															st64(a + 0x10, ld64(s450 + 8))
															st64(a + 8, ad)
															st64(a, 0)
															return ae
														}
														anchor_error_from(s460, 0x7d0 /* anchor::ConstraintMut */)
														ae = Error_with_account_name(s470, ld64(s460), ld64(s460 + 8), "token_vault_b", 0xd)
														ad = ld64(s470)
														st64(a + 0x10, ld64(s470 + 8))
														st64(a + 8, ad)
														st64(a, 0)
														return ae
													}
													anchor_error_from(s3e0, 0x7d3 /* anchor::ConstraintRaw */)
													ae = Error_with_account_name(s3f0, ld64(s3e0), ld64(s3e0 + 8), "token_owner_account_b", 0x15)
													ad = ld64(s3f0)
													st64(a + 0x10, ld64(s3f0 + 8))
													st64(a + 8, ad)
													st64(a, 0)
													return ae
												}
												anchor_error_from(s4a0, 0x7d0 /* anchor::ConstraintMut */)
												ae = Error_with_account_name(s4b0, ld64(s4a0), ld64(s4a0 + 8), "token_vault_a", 0xd)
												ad = ld64(s4b0)
												st64(a + 0x10, ld64(s4b0 + 8))
												st64(a + 8, ad)
												st64(a, 0)
												return ae
											}
											anchor_error_from(s390, 0x7d3 /* anchor::ConstraintRaw */)
											ae = Error_with_account_name(s3a0, ld64(s390), ld64(s390 + 8), "token_owner_account_a", 0x15)
											ad = ld64(s3a0)
											st64(a + 0x10, ld64(s3a0 + 8))
											st64(a + 8, ad)
											st64(a, 0)
											return ae
										}
										anchor_error_from(s350, 0x7d3 /* anchor::ConstraintRaw */)
										ae = Error_with_account_name(s360, ld64(s350), ld64(s350 + 8), "position_token_account", 0x16)
										ad = ld64(s360)
										st64(a + 0x10, ld64(s360 + 8))
										st64(a + 8, ad)
										st64(a, 0)
										return ae
									}
									ae = Error_with_account_name(s310, v, x, "token_program", 0xd)
									ad = ld64(s310)
									st64(a + 0x10, ld64(s310 + 8))
									st64(a + 8, ad)
									st64(a, 0)
									return ae
								}
								ae = Error_with_account_name(s300, t, token_vault_b_box, "token_vault_b", 0xd)
								ad = ld64(s300)
								st64(a + 0x10, ld64(s300 + 8))
								st64(a + 8, ad)
								st64(a, 0)
								return ae
							}
							ae = Error_with_account_name(s2f0, r, token_owner_account_b_box, "token_owner_account_b", 0x15)
							ad = ld64(s2f0)
							st64(a + 0x10, ld64(s2f0 + 8))
							st64(a + 8, ad)
							st64(a, 0)
							return ae
						}
						alloc_handle_alloc_error(8, 0xb8)
					}
					alloc_handle_alloc_error(8, 0xb8)
				}
				alloc_handle_alloc_error(8, 0xd8)
			}
			alloc_handle_alloc_error(8, 0xd8)
		}
		ae = Error_with_account_name(s2e0, h, j, "position_authority", 0x12)
		ad = ld64(s2e0)
		st64(a + 0x10, ld64(s2e0 + 8))
		st64(a + 8, ad)
		st64(a, 0)
		return ae
	}
	alloc_handle_alloc_error(8, 0x290)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position, token_owner_account_a, token_vault_a, token_owner_account_b, token_vault_b
export function fn_8ef60(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8
	let n, p: u64
	fn_5a40(s28, ld64(b + 0x10), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const f = ld64(s28)
	if (f != 2) {
		n = Error_with_account_name(s38, f, ld64(s28 + 8), "position", 8)
		p = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, p)
		return n
	}
	const g = ld64(ld64(b + 0x20))
	if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
		const h = common_is_closed(g)
		if (h == 0) {
			fn_143448(s18, g, h)
			const j = ld64(s18 + 0x10)
			const i = ld64(s18)
			if (i != 0x800000000000001a /* Ok */) {
				const k = ld64(s18 + 8)
				st64(s18, i, k, j)
				fn_13b430(s48, s18)
				const l = ld64(s48)
				if (l != 2) {
					n = Error_with_account_name(s58, l, ld64(s48 + 8), "token_owner_account_a", 0x15)
					p = ld64(s58)
					st64(a + 8, ld64(s58 + 8))
					st64(a, p)
					return n
				}
			} else {
				st64(j, ld64(j) + 1)
			}
		}
	}
	const q = ld64(ld64(b + 0x28))
	if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
		const r = common_is_closed(q)
		if (r == 0) {
			fn_143448(s18, q, r)
			const t = ld64(s18 + 0x10)
			const s = ld64(s18)
			if (s != 0x800000000000001a /* Ok */) {
				const aa = ld64(s18 + 8)
				st64(s18, s, aa, t)
				fn_13b430(s68, s18)
				const ab = ld64(s68)
				if (ab != 2) {
					n = Error_with_account_name(s78, ab, ld64(s68 + 8), "token_vault_a", 0xd)
					p = ld64(s78)
					st64(a + 8, ld64(s78 + 8))
					st64(a, p)
					return n
				}
			} else {
				st64(t, ld64(t) + 1)
			}
		}
	}
	const u = ld64(ld64(b + 0x30))
	if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
		const v = common_is_closed(u)
		if (v == 0) {
			fn_143448(s18, u, v)
			const x = ld64(s18 + 0x10)
			const w = ld64(s18)
			if (w != 0x800000000000001a /* Ok */) {
				const ac = ld64(s18 + 8)
				st64(s18, w, ac, x)
				fn_13b430(s88, s18)
				const ad = ld64(s88)
				if (ad != 2) {
					n = Error_with_account_name(s98, ad, ld64(s88 + 8), "token_owner_account_b", 0x15)
					p = ld64(s98)
					st64(a + 8, ld64(s98 + 8))
					st64(a, p)
					return n
				}
			} else {
				st64(x, ld64(x) + 1)
			}
		}
	}
	const y = ld64(ld64(b + 0x38))
	const m = memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20)
	let o = undef
	n = m as u32
	if (n != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return n
	}
	n = common_is_closed(y)
	o = undef
	if (n != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return n
	}
	n = fn_143448(s18, y, n)
	o = ld64(s18 + 0x10)
	const z = ld64(s18)
	if (z != 0x800000000000001a /* Ok */) {
		const ae = ld64(s18 + 8)
		st64(s18, z, ae, o)
		n = fn_13b430(sa8, s18)
		o = undef
		const af = ld64(sa8)
		if (af == 2) {
			st64(a + 8, o)
			st64(a, 2)
			return n
		}
		n = Error_with_account_name(sb8, af, ld64(sa8 + 8), "token_vault_b", 0xd)
		p = ld64(sb8)
		st64(a + 8, ld64(sb8 + 8))
		st64(a, p)
		return n
	}
	st64(o, ld64(o) + 1)
	st64(a + 8, o)
	st64(a, 2)
	return n
}
