/// <reference path="../lib.d.ts" />
// instruction open_position_with_token_extensions
import { fn_12be8, fn_12e9c0, fn_1390b0, fn_143100, fn_145330, fn_147e78, fn_149678, fn_14c5c0, fn_14c690, fn_14d330, fn_14e1c0, fn_14f7f8, fn_4a30, fn_4c1a0, fn_5a40, fn_5ecd8, fn_60930, fn_83078, fn_afd0, fn_ec20, log_data, memcpy } from '../shared.ts'

// instruction handler: open_position_with_token_extensions (discriminator sha256("global:open_position_with_token_extensions")[..8] = 0xfa8366725c5f2fd4)
// accounts [str: the program's account-error strings, in order of first use]: funder, position_mint, position_token_account, whirlpool, metadata_update_auth, position, token_2022_program, associated_token_program, system_program, owner
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position
export function ix_open_position_with_token_extensions(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s10 = fp - 0x10, s11 = fp - 0x11, s50 = fp - 0x50, s58 = fp - 0x58, s68 = fp - 0x68, sa0 = fp - 0xa0, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, sff8 = fp - 0xff8
	let j, m, n, o, q, r: u64
	sol_log("Instruction: OpenPositionWithTokenExtensions", 0x2c)
	const f = ix_args_len
	if (f >= 4 && ((f & -4) != 4 && f != 8)) {
		const g = ix_args
		const s = ld32(g)
		const i = ld32(g + 4)
		const h = ld8(g + 8)
		st8(s11, h)
		if (2 > h) {
			st8(s11, 0xff)
			st64(s10, accounts, accounts_len)
			st64(sff8, s11)
			r = accounts_open_position_with_token_extensions(s68, program_id, s10, undef, fp)
			const t = ld64(s68)
			if (t == 0) {
				q = ld64(s68 + 8)
				st64(a + 8, ld64(s58))
				st64(a, q)
				return r
			}
			const v = ld64(s68 + 8)
			const u = ld64(s58)
			memcpy(sa0, s50, 0x38)
			st64(sb8, t, v, u)
			st8(s50 + 8, ld8(s11))
			copyr(s58, s10, 0x10)
			st64(s68, program_id, sb8)
			r = fn_35098(sc8, s68, s, i, h != 0)
			q = ld64(sc8)
			if (q == 2) {
				r = fn_5a40(sd8, ld64(sb8 + 0x10), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
				const p = ld64(sd8)
				if (p != 2) {
					r = Error_with_account_name(se8, p, ld64(sd8 + 8), "position", 8)
					q = ld64(se8)
					st64(a + 8, ld64(se8 + 8))
					st64(a, q)
					return r
				}
				st64(a + 8, p)
				st64(a, 2)
				return r
			}
			st64(a + 8, ld64(sc8 + 8))
			st64(a, q)
			return r
		}
		st64(s68, 0x100159620)
		st64(s58, s10)
		st64(s10, s11, fn_14ef78)
		st64(s50 + 8, 0)
		st64(s68 + 8, 1)
		st64(s50, 1)
		// fmt "Invalid bool representation: {}" {} = h [fn_14ef78]
		fn_147e78(sb8, s68, i)
		j = fn_b580(sb8)
	} else {
		j = fn_1459d0(0x100159468)
	}
	const k = j
	if (2 > (j & 3) - 2) {
		r = anchor_error_from(sf8, 0x66 /* anchor::InstructionDidNotDeserialize */, m, n, o)
		q = ld64(sf8)
		st64(a + 8, ld64(sf8 + 8))
		st64(a, q)
		return r
	}
	if ((k & 3) == 0) {
		r = anchor_error_from(sf8, 0x66 /* anchor::InstructionDidNotDeserialize */, m, n, o)
		q = ld64(sf8)
		st64(a + 8, ld64(sf8 + 8))
		st64(a, q)
		return r
	}
	const l = ld64(ld64(j + 7))
	callx(l, ld64(j - 1), l)
	r = anchor_error_from(sf8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	q = ld64(sf8)
	st64(a + 8, ld64(sf8 + 8))
	st64(a, q)
	return r
}

// Anchor Accounts::try_accounts of instruction open_position_with_token_extensions (called by ix_open_position_with_token_extensions; name [str]: from the handler's "Instruction: …" log; was fn_c2b58)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: funder (ConstraintMut), position_mint (ConstraintMut), position_token_account (AccountNotEnoughKeys, ConstraintMut), whirlpool, metadata_update_auth (AccountNotEnoughKeys, ConstraintAddress), position (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), token_2022_program (ConstraintAddress), associated_token_program, system_program, owner (AccountNotEnoughKeys)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position, funder, position_mint
export function accounts_open_position_with_token_extensions(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s270 = fp - 0x270, s288 = fp - 0x288, s290 = fp - 0x290, s2c0 = fp - 0x2c0, s2e0 = fp - 0x2e0, s2e1 = fp - 0x2e1, s308 = fp - 0x308, s320 = fp - 0x320, s338 = fp - 0x338, s340 = fp - 0x340, s348 = fp - 0x348, s350 = fp - 0x350, s358 = fp - 0x358, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s510 = fp - 0x510, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s560 = fp - 0x560, s570 = fp - 0x570, s580 = fp - 0x580, s588 = fp - 0x588, s590 = fp - 0x590, s598 = fp - 0x598, s5a0 = fp - 0x5a0, s5a8 = fp - 0x5a8, s5b0 = fp - 0x5b0, s5b8 = fp - 0x5b8, s5c0 = fp - 0x5c0
	let i, j, q, r, s, ad, av, aw: u64
	st64(s360, b)
	try_accounts_11718(s290, c, c, d, e)
	let g = ld64(s288)
	const f = ld64(s290)
	if (f != 2) {
		aw = Error_with_account_name(s370, f, g, "funder", 6)
		av = ld64(s370)
		st64(a + 0x10, ld64(s370 + 8))
		st64(a + 8, av)
		st64(a, 0)
		return aw
	}
	const al = ld64(e - 0xff8)
	st64(s358, g)
	const h = ld64(c + 8)
	if (h != 0) {
		const l: AccountInfo = ld64(c)
		st64(c, l + 0x30, h - 1)
		if (h == 1) {
			aw = anchor_error_from(s580, 0xbbd /* anchor::AccountNotEnoughKeys */, g, i, j)
			av = ld64(s580)
			st64(a + 0x10, ld64(s580 + 8))
			st64(a + 8, av)
			st64(a, 0)
			return aw
		}
		const m: AccountInfo = ld64(c)
		st64(s350, m)
		st64(c + 8, h - 2)
		st64(c, m + 0x30)
		try_accounts_11718(s290, c, g, i, j)
		const o = ld64(s288)
		const n = ld64(s290)
		if (n != 2) {
			aw = Error_with_account_name(s380, n, o, "position_mint", 0xd)
			av = ld64(s380)
			st64(a + 0x10, ld64(s380 + 8))
			st64(a + 8, av)
			st64(a, 0)
			return aw
		}
		st64(s348, o)
		const p = ld64(c + 8)
		if (p == 0) {
			anchor_error_from(s390, 0xbbd /* anchor::AccountNotEnoughKeys */, o, r, s)
			q = ld64(s390 + 8)
			const t = ld64(s390)
			if (t != 2) {
				aw = Error_with_account_name(s3a0, t, q, "position_token_account", 0x16)
				av = ld64(s3a0)
				st64(a + 0x10, ld64(s3a0 + 8))
				st64(a + 8, av)
				st64(a, 0)
				return aw
			}
		} else {
			st64(c + 8, p - 1)
			q = ld64(c)
			st64(c, q + 0x30)
		}
		st64(s588, q)
		try_accounts_11a48(s290, c, q, r, s)
		if (ld64(s290) == 0) {
			aw = Error_with_account_name(s550, ld64(s288), ld64(s288 + 8), 0x100152b28 /* "whirlpool" */, 9)
			av = ld64(s550)
			st64(a + 0x10, ld64(s550 + 8))
			st64(a + 8, av)
			st64(a, 0)
			return aw
		}
		const u = ld64(0x300000000 /* heap bump-allocator cursor */)
		const v = u != 0 ? sat_sub(u, 0x290) & -8 : 0x300007d70
		if (v > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, v)
			st64(s590, v)
			memcpy(v, s290, 0x290)
			fn_12be8(s290, c)
			const x = ld64(s288)
			const w = ld64(s290)
			if (w == 2) {
				st64(s598, x)
				fn_122e8(s290, c, x)
				const z = ld64(s288)
				const y = ld64(s290)
				if (y == 2) {
					st64(s340, z)
					fn_12510(s290, c, z)
					const ab = ld64(s288)
					const aa = ld64(s290)
					if (aa == 2) {
						st64(s5a0, ab)
						const ac = ld64(c + 8)
						if (ac == 0) {
							anchor_error_from(s3e0, 0xbbd /* anchor::AccountNotEnoughKeys */, ab)
							ad = ld64(s3e0 + 8)
							const ae = ld64(s3e0)
							if (ae != 2) {
								aw = Error_with_account_name(s3f0, ae, ad, "metadata_update_auth", 0x14)
								av = ld64(s3f0)
								st64(a + 0x10, ld64(s3f0 + 8))
								st64(a + 8, av)
								st64(a, 0)
								return aw
							}
						} else {
							st64(c + 8, ac - 1)
							ad = ld64(c)
							st64(c, ad + 0x30)
						}
						st64(s5a8, ad)
						rent_get(s290)
						copy(s320, s288, 0x18)
						if (ld64(s290) == 0) {
							copyr(s338, s320, 0x18)
							const af = ld64(ld64(s348))
							const aj = ld64(af + 0x18)
							const ai = ld64(af + 0x10)
							const ah = ld64(af + 8)
							const ag = ld64(af)
							st64(s2e0, 0x100151f20, 8, s2c0, 0x20, ag, ah, ai, aj)
							// PDA find_program_address(["position", *s2c0], program *(ld64(s360)))
							Pubkey_find_program_address(s290, s2e0, 2, ld64(s360))
							copyr(s308, s290, 0x20)
							const ak = ld8(s270)
							st8(s2e1, ak)
							st8(al, ak)
							const am = ld64(ld64(s350))
							copy(s290, am, 0x20)
							if ((memcmp(s290, s308, 0x20) as u32) == 0) {
								st64(s290, s350, s338, s358, s340, s348, s2e1, s360)
								aw = fn_c42a0(s2c0, s290)
								const ax = ld64(s2c0 + 8)
								av = ld64(s2c0)
								if (av == 2) {
									const position: AccountInfo = ld64(ax)
									if (position.is_writable == 0) {
										anchor_error_from(s530, 0x7d0 /* anchor::ConstraintMut */)
										aw = Error_with_account_name(s540, ld64(s530), ld64(s530 + 8), "position", 8)
										av = ld64(s540)
										st64(a + 0x10, ld64(s540 + 8))
										st64(a + 8, av)
										st64(a, 0)
										return aw
									}
									AccountInfo_clone(s2c0, position)
									st64(s5b0, fn_143100(s2c0))
									AccountInfo_clone(s290, ld64(ax))
									AccountInfo_try_data_len(s2e0, s290)
									const ba = ld64(s2e0 + 8)
									const az = ld64(s2e0)
									if (az != 0x800000000000001a /* Ok */) {
										st64(s2e0 + 0x10, ld64(s2e0 + 0x10))
										st64(s2e0, az, ba)
										aw = fn_13b430(s440, s2e0)
										const bm = ld64(s440)
										st64(a + 0x10, ld64(s440 + 8))
										st64(a + 8, bm)
										st64(a, 0)
										const bo = ld64(s288 + 8)
										const bn = ld64(s288)
										rc_dec(bn)
										rc_dec(bo)
										const bq = ld64(s2c0 + 0x10)
										const bp = ld64(s2c0 + 8)
										rc_dec(bp)
										if (!rc_release(bq)) {
											return aw
										}
										st64(bq + 8, ld64(bq + 8) - 1)
										return aw
									}
									const bb = __floatundidf(ld64(s338) * (ba + 0x80))
									const bc = fn_14f7f8(ld64(s338 + 8), bb)
									st64(s5b8, 0)
									st64(s5c0, fn_151cb0(bc, 0))
									const bd = fn_14f3e8(bc)
									if ((ld64(s5c0) as i64) >= 0) {
										st64(s5b8, bd)
									}
									const be = fn_151a40(bc, 0x43efffffffffffff)
									let bl = -1
									if (0 >= (be as i64)) {
										bl = ld64(s5b8)
									}
									const bg = ld64(s288 + 8)
									const bf = ld64(s288)
									rc_dec(bf)
									rc_dec(bg)
									const bj = ld64(s2c0 + 0x10)
									const bh = ld64(s2c0 + 8)
									let bi = ld64(bh) - 1
									st64(bh, bi)
									if (bi == 0) {
										bi = ld64(bh + 8) - 1
										st64(bh + 8, bi)
									}
									let bk = ld64(bj) - 1
									st64(bj, bk)
									if (bk == 0) {
										bk = ld64(bj + 8) - 1
										st64(bj + 8, bk)
									}
									if (bl > ld64(s5b0)) {
										anchor_error_from(s510, 0x7d5 /* anchor::ConstraintRentExempt */, bk, bi)
										aw = Error_with_account_name(s520, ld64(s510), ld64(s510 + 8), "position", 8)
										av = ld64(s520)
										st64(a + 0x10, ld64(s520 + 8))
										st64(a + 8, av)
										st64(a, 0)
										return aw
									}
									const funder: AccountInfo = ld64(s358)
									if (funder.is_writable != 0) {
										const position_mint: AccountInfo = ld64(s348)
										st64(s5b0, position_mint)
										if (position_mint.is_writable != 0) {
											if (ld8(ld64(s588) + 0x29) != 0) {
												const bt = ld64(ld64(s598))
												copyr(s2c0, bt, 0x20)
												if ((memcmp(s2c0, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0) {
													anchor_error_from(s450, 0x7dc /* anchor::ConstraintAddress */)
													const ca = Error_with_account_name(s460, ld64(s450), ld64(s450 + 8), "token_2022_program", 0x12)
													const bz = ld64(s460 + 8)
													const by = ld64(s460)
													copyr(s290, s2c0, 0x20)
													st64(s270, 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */, 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */, 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */, 0xfc8ba1d828f9bdfe /* TOKEN_2022_PROGRAM[3] */) // key TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
													aw = fn_13b5c0(s470, by, bz, s290, ca)
													av = ld64(s470)
													st64(a + 0x10, ld64(s470 + 8))
													st64(a + 8, av)
													st64(a, 0)
													return aw
												}
												const bu = ld64(ld64(s5a8))
												copyr(s2c0, bu, 0x20)
												aw = memcmp(s2c0, 0x100152dd0 /* key 3axbTs2z5GBy6usVbNVoqEgZMng3vZvMnAoX29BFfwhr */, 0x20) as u32
												if (aw == 0) {
													const cb = ld64(s340)
													st64(a + 0x48, ld64(s5a8))
													st64(a + 0x40, ld64(s5a0))
													st64(a + 0x38, cb)
													st64(a + 0x30, ld64(s598))
													st64(a + 0x28, ld64(s590))
													st64(a + 0x20, ld64(s588))
													st64(a + 0x18, ld64(s5b0))
													st64(a + 0x10, ax)
													st64(a + 8, l)
													st64(a, funder)
													return aw
												}
												anchor_error_from(s480, 0x7dc /* anchor::ConstraintAddress */)
												const bx = Error_with_account_name(s490, ld64(s480), ld64(s480 + 8), "metadata_update_auth", 0x14)
												const bw = ld64(s490 + 8)
												const bv = ld64(s490)
												copyr(s290, s2c0, 0x20)
												st64(s270, 0xf0e597ddae666a26, 0x3999c6e408d67144, 0x93d0cdb3999d7ad7, 0x69d20a916bfe8911) // key 3axbTs2z5GBy6usVbNVoqEgZMng3vZvMnAoX29BFfwhr
												aw = fn_13b5c0(s4a0, bv, bw, s290, bx)
												av = ld64(s4a0)
												st64(a + 0x10, ld64(s4a0 + 8))
												st64(a + 8, av)
												st64(a, 0)
												return aw
											}
											anchor_error_from(s4b0, 0x7d0 /* anchor::ConstraintMut */, bk, bi)
											aw = Error_with_account_name(s4c0, ld64(s4b0), ld64(s4b0 + 8), "position_token_account", 0x16)
											av = ld64(s4c0)
											st64(a + 0x10, ld64(s4c0 + 8))
											st64(a + 8, av)
											st64(a, 0)
											return aw
										}
										anchor_error_from(s4d0, 0x7d0 /* anchor::ConstraintMut */, bk, bi)
										aw = Error_with_account_name(s4e0, ld64(s4d0), ld64(s4d0 + 8), "position_mint", 0xd)
										av = ld64(s4e0)
										st64(a + 0x10, ld64(s4e0 + 8))
										st64(a + 8, av)
										st64(a, 0)
										return aw
									}
									anchor_error_from(s4f0, 0x7d0 /* anchor::ConstraintMut */, bk, bi)
									aw = Error_with_account_name(s500, ld64(s4f0), ld64(s4f0 + 8), "funder", 6)
									av = ld64(s500)
									st64(a + 0x10, ld64(s500 + 8))
									st64(a + 8, av)
									st64(a, 0)
									return aw
								}
								st64(a + 0x10, ax)
								st64(a + 8, av)
								st64(a, 0)
								return aw
							}
							anchor_error_from(s410, 0x7d6 /* anchor::ConstraintSeeds */)
							Error_with_account_name(s420, ld64(s410), ld64(s410 + 8), "position", 8)
							const au = ld64(s420 + 8)
							const at = ld64(s420)
							const an = ld64(ld64(s350))
							const ar = ld64(an + 0x18)
							const aq = ld64(an + 0x10)
							const ap = ld64(an + 8)
							const ao = ld64(an)
							copy(s270, s308, 0x20)
							st64(s290, ao, ap, aq, ar)
							aw = fn_13b5c0(s430, at, au, s290, ap)
							av = ld64(s430)
							st64(a + 0x10, ld64(s430 + 8))
							st64(a + 8, av)
							st64(a, 0)
							return aw
						}
						aw = fn_13b430(s400, s320)
						av = ld64(s400)
						st64(a + 0x10, ld64(s400 + 8))
						st64(a + 8, av)
						st64(a, 0)
						return aw
					}
					aw = Error_with_account_name(s3d0, aa, ab, "associated_token_program", 0x18)
					av = ld64(s3d0)
					st64(a + 0x10, ld64(s3d0 + 8))
					st64(a + 8, av)
					st64(a, 0)
					return aw
				}
				aw = Error_with_account_name(s3c0, y, z, "system_program", 0xe)
				av = ld64(s3c0)
				st64(a + 0x10, ld64(s3c0 + 8))
				st64(a + 8, av)
				st64(a, 0)
				return aw
			}
			aw = Error_with_account_name(s3b0, w, x, "token_2022_program", 0x12)
			av = ld64(s3b0)
			st64(a + 0x10, ld64(s3b0 + 8))
			st64(a + 8, av)
			st64(a, 0)
			return aw
		}
		alloc_handle_alloc_error(8, 0x290)
	}
	anchor_error_from(s560, 0xbbd /* anchor::AccountNotEnoughKeys */, g, i, j)
	g = undef
	const k = ld64(s560)
	if (k == 2) {
		aw = anchor_error_from(s580, 0xbbd /* anchor::AccountNotEnoughKeys */, g, i, j)
		av = ld64(s580)
		st64(a + 0x10, ld64(s580 + 8))
		st64(a + 8, av)
		st64(a, 0)
		return aw
	}
	aw = Error_with_account_name(s570, k, ld64(s560 + 8), 0x100154aba /* "owner" */, 5)
	av = ld64(s570)
	st64(a + 0x10, ld64(s570 + 8))
	st64(a + 8, av)
	st64(a, 0)
	return aw
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position
export function fn_c42a0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s118 = fp - 0x118, s119 = fp - 0x119, s140 = fp - 0x140, s150 = fp - 0x150, s178 = fp - 0x178, s1b8 = fp - 0x1b8, s1d8 = fp - 0x1d8, s1f8 = fp - 0x1f8, s210 = fp - 0x210, s248 = fp - 0x248, s258 = fp - 0x258, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s2a8 = fp - 0x2a8, s2b0 = fp - 0x2b0, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s390 = fp - 0x390, s398 = fp - 0x398, s3c8 = fp - 0x3c8, s3d0 = fp - 0x3d0, s3d8 = fp - 0x3d8, s3e0 = fp - 0x3e0
	let aw, dc, dd, de: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s348, f, b)
	if (g != 0) {
		const p = ld64(ld64(b + 0x10))
		st64(s390 + 0x30, p)
		const q = ld64(p)
		copyr(s38, q + 8, 0x18)
		st64(s390 + 0x38, q)
		st64(s40, ld64(q))
		const r = ld64(f)
		copyr(s2c8, r, 0x20)
		if ((memcmp(s40, s2c8, 0x20) as u32) == 0) {
			ErrorCode_name(s210, 0x100152d40)
			st64(s140, 0, 1, 0)
			st64(s20, s140, 0x100159480)
			st8(s20 + 0x18, 3)
			st64(s20 + 0x10, 0x20)
			st64(s38 + 8, 0)
			st64(s40, 0)
			if (ErrorCode_fmt(0x100152d40, s40) == 0) {
				copyr(s290, s140, 0x18)
				copy(s2a8, s210, 0x18)
				st64(s2c8 + 8, 0x100154b1a)
				st32(s248 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s278, 2)
				st32(s2b0, 0x11)
				st64(s2c8 + 0x10, 0x4a)
				st64(s2c8, 0)
				const ba = fn_13b3a8(s308, s2c8)
				const az = ld64(s308 + 8)
				const ay = ld64(s308)
				const ax = ld64(s390 + 0x38)
				copyr(s2c8, ax, 0x20)
				copy(s2a8, r, 0x20)
				de = fn_13b5c0(s318, ay, az, s2c8, ba)
				const bb = ld64(s318)
				st64(a + 8, ld64(s318 + 8))
				st64(a, bb)
				return de
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s2c8, 0x1001594b0, 0x1001594d0)
		}
		st64(s390 + 0x28, r)
		st64(s390 + 0x40, a)
		const s = ld64(b + 8)
		const t = __floatundidf(ld64(s) * 0x158)
		const u = fn_14f7f8(ld64(s + 8), t)
		const v = fn_151cb0(u, 0)
		const w = fn_14f3e8(u)
		const x = max((fn_151a40(u, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (v as i64) ? 0 : w, 1)
		let bd: AccountInfo = ld64(s348)
		let bj = ld64(s348 + 8)
		if (x > g) {
			const y: AccountInfo = ld64(s390 + 0x30)
			const z: LamportsCell = y.lamports
			rc_inc(z)
			const bc: DataCell = y.data
			rc_inc(bc)
			const be: LamportsCell = bd.lamports
			const bf = be.strong
			st64(s390 + 8, bd.key)
			st64(s390 + 0x10, y.executable)
			st64(s390 + 0x18, y.is_writable)
			st64(s390 + 0x20, y.is_signer)
			st64(s390 + 0x28, y.rent_epoch)
			const bi = y.owner
			rc_inc(be, bf)
			const bg: DataCell = bd.data
			const bh = bg.strong
			st64(s390 + 0x30, bi)
			rc_inc(bg, bh)
			const bk: AccountInfo = ld64(ld64(bj + 0x18))
			const bl: LamportsCell = bk.lamports
			const bm = bl.strong
			st64(s390, sat_sub(x, g))
			st64(s3c8 + 0x10, bd.executable)
			st64(s3c8 + 0x18, bd.is_writable)
			st64(s3c8 + 0x20, bd.is_signer)
			st64(s3c8 + 0x28, bd.rent_epoch)
			st64(s398, bd.owner)
			const bp = bk.key
			rc_inc(bl, bm)
			const bn: DataCell = bk.data
			const bo = bn.strong
			st64(s3c8, z, bp)
			rc_inc(bn, bo)
			st64(s3d0, bk.owner)
			const bt = bk.rent_epoch
			const bs = bk.is_signer
			const br = bk.is_writable
			const bq = bk.executable
			st8(s178 + 0x22, ld64(s3c8 + 0x10))
			st8(s178 + 0x21, ld64(s3c8 + 0x18))
			st8(s178 + 0x20, ld64(s3c8 + 0x20))
			st64(s178 + 0x18, ld64(s3c8 + 0x28))
			st64(s178 + 0x10, ld64(s398))
			st64(s178, be, bg)
			st64(s1b8 + 0x38, ld64(s390 + 8))
			st8(s1b8 + 0x32, ld64(s390 + 0x10))
			st8(s1b8 + 0x31, ld64(s390 + 0x18))
			st8(s1b8 + 0x30, ld64(s390 + 0x20))
			st64(s1b8 + 0x28, ld64(s390 + 0x28))
			st64(s1b8 + 0x20, ld64(s390 + 0x30))
			st64(s1b8 + 0x18, bc)
			st64(s1b8 + 0x10, ld64(s3c8))
			st64(s1b8 + 8, ld64(s390 + 0x38))
			st8(s1b8, bs, br, bq)
			st64(s1d8 + 0x18, bt)
			st64(s1d8 + 0x10, ld64(s3d0))
			st64(s1d8, bl, bn)
			st64(s1f8 + 0x18, ld64(s3c8 + 8))
			st64(s150, 8, 0)
			st64(s1f8, 0, 8, 0)
			de = fn_13d318(s2d8, s1f8, ld64(s390))
			aw = ld64(s2d8)
			if (aw != 2) {
				dd = ld64(s2d8 + 8)
				dc = ld64(s390 + 0x40)
				st64(dc, aw, dd)
				return de
			}
			bd = ld64(s348)
			st64(s390 + 0x28, bd.key)
			bj = ld64(s348 + 8)
		}
		const bu: LamportsCell = bd.lamports
		rc_inc(bu)
		const bv: DataCell = bd.data
		rc_inc(bv)
		const bw: AccountInfo = ld64(ld64(bj + 0x18))
		const bx: LamportsCell = bw.lamports
		const by = bx.strong
		st64(s390 + 0x20, bd.executable)
		st64(s390 + 0x30, bd.is_writable)
		st64(s390 + 0x38, bd.is_signer)
		const cc = bd.rent_epoch
		const cd = bd.owner
		const cb = bw.key
		rc_inc(bx, by)
		const bz: DataCell = bw.data
		const ca = bz.strong
		st64(s398, cb, cc, cd, bv, bu)
		rc_inc(bz, ca)
		st64(s3c8 + 0x28, bw.owner)
		st64(s3c8 + 0x20, bw.rent_epoch)
		const ci = bw.is_signer
		const ch = bw.is_writable
		const cg = bw.executable
		const ce = ld64(s348 + 8)
		const cf = ld64(ld64(ld64(ce + 0x20)))
		copyr(s140, cf, 0x20)
		const cj = ld8(ld64(ce + 0x28))
		st64(s20, s119)
		st64(s38 + 8, s140)
		st64(s40, 0x100151f20)
		st64(s210, s40)
		st64(s258 + 8, s210)
		st8(s258, ci, ch, cg)
		st64(s278 + 0x18, ld64(s3c8 + 0x20))
		st64(s278 + 0x10, ld64(s3c8 + 0x28))
		st64(s278, bx, bz)
		st64(s288 + 8, ld64(s398))
		st8(s288 + 2, ld64(s390 + 0x20))
		st8(s288 + 1, ld64(s390 + 0x30))
		st8(s288, ld64(s390 + 0x38))
		st64(s290, ld64(s390))
		st64(s2a8 + 0x10, ld64(s390 + 8))
		st64(s2a8 + 8, ld64(s390 + 0x10))
		st64(s2a8, ld64(s390 + 0x18))
		st64(s2b0, ld64(s390 + 0x28))
		st64(s390 + 0x38, cj)
		st8(s119, cj)
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 8)
		st64(s210 + 8, 3)
		st64(s248, 1)
		st64(s2c8, 0, 8, 0)
		de = fn_13c8b8(s2e8, s2c8, 0xd8)
		aw = ld64(s2e8)
		if (aw != 2) {
			dd = ld64(s2e8 + 8)
			dc = ld64(s390 + 0x40)
			st64(dc, aw, dd)
			return de
		}
		const ck: AccountInfo = ld64(s348)
		const cl: LamportsCell = ck.lamports
		const cs = ck.key
		rc_inc(cl)
		const cm: DataCell = ck.data
		rc_inc(cm)
		const cn: LamportsCell = bw.lamports
		const co = cn.strong
		st64(s390 + 0x10, bw.key)
		st64(s390 + 0x18, ck.executable)
		st64(s390 + 0x20, ck.is_writable)
		st64(s390 + 0x28, ck.is_signer)
		st64(s390 + 0x30, ck.rent_epoch)
		const cr = ck.owner
		rc_inc(cn, co)
		const cp: DataCell = bw.data
		const cq = cp.strong
		st64(s398, cr, cs, cl)
		rc_inc(cp, cq)
		const cx = bw.owner
		const cw = bw.rent_epoch
		const cv = bw.is_signer
		const cu = bw.is_writable
		const ct = bw.executable
		copyr(s140, cf, 0x20)
		st64(s20, s119)
		st64(s38 + 8, s140)
		st64(s40, 0x100151f20)
		st64(s210, s40)
		st64(s258 + 8, s210)
		st8(s258, cv, cu, ct)
		st64(s278, cn, cp, cx, cw)
		st64(s288 + 8, ld64(s390 + 0x10))
		st8(s288 + 2, ld64(s390 + 0x18))
		st8(s288 + 1, ld64(s390 + 0x20))
		st8(s288, ld64(s390 + 0x28))
		st64(s290, ld64(s390 + 0x30))
		st64(s2a8 + 0x10, ld64(s398))
		st64(s2a8 + 8, cm)
		copyr(s2b0, s390, 0x10)
		st8(s119, ld64(s390 + 0x38))
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 8)
		st64(s210 + 8, 3)
		st64(s248, 1)
		st64(s2c8, 0, 8, 0)
		de = fn_13cc48(s2f8, s2c8, ld64(ld64(ld64(s348 + 8) + 0x30)))
		aw = ld64(s2f8)
		if (aw != 2) {
			dd = ld64(s2f8 + 8)
			dc = ld64(s390 + 0x40)
			st64(dc, aw, dd)
			return de
		}
	} else {
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0x158)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const ad = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		const m = ld64(s348 + 8)
		const n: AccountInfo = ld64(ld64(m + 0x10))
		const o: LamportsCell = n.lamports
		const aa = n.key
		const ae = ld64(s348)
		rc_inc(o)
		st64(s390 + 0x38, aa)
		const ab: DataCell = n.data
		const ac = ab.strong
		st64(s390 + 0x30, ab)
		rc_inc(ab, ac)
		const af = ld64(ae + 8)
		const ag = ld64(af)
		st64(s390, ld64(ae))
		st64(s390 + 8, n.executable)
		st64(s390 + 0x10, n.is_writable)
		st64(s390 + 0x18, n.is_signer)
		st64(s390 + 0x20, n.rent_epoch)
		st64(s390 + 0x28, n.owner)
		rc_inc(af, ag)
		const ah = ld64(ae + 0x10)
		rc_inc(ah)
		const ai: AccountInfo = ld64(ld64(m + 0x18))
		const aj: LamportsCell = ai.lamports
		const ak = aj.strong
		st64(s398, o)
		const al: AccountInfo = ld64(s348)
		st64(s3c8 + 8, al.executable)
		st64(s3c8 + 0x10, al.is_writable)
		st64(s3c8 + 0x18, al.is_signer)
		st64(s3c8 + 0x20, al.rent_epoch)
		st64(s3c8 + 0x28, al.owner)
		const ao = ai.key
		rc_inc(aj, ak)
		const am: DataCell = ai.data
		const an = am.strong
		st64(s3d0, ao, ad)
		st64(s390 + 0x40, a)
		rc_inc(am, an)
		st64(s3d8, ai.owner)
		st64(s3e0, ai.rent_epoch)
		const av = ai.is_signer
		const au = ai.is_writable
		const at = ai.executable
		const ap = ld64(s348 + 8)
		const aq = ld64(ld64(ld64(ap + 0x20)))
		copyr(s140, aq, 0x20)
		const ar = ld8(ld64(ap + 0x28))
		st64(s20, s119)
		st64(s38 + 8, s140)
		st64(s40, 0x100151f20)
		st8(s119, ar)
		st64(s210, s40)
		st64(s248 + 0x28, s210)
		st8(s248 + 0x22, ld64(s3c8 + 8))
		st8(s248 + 0x21, ld64(s3c8 + 0x10))
		st8(s248 + 0x20, ld64(s3c8 + 0x18))
		st64(s248 + 0x18, ld64(s3c8 + 0x20))
		st64(s248 + 0x10, ld64(s3c8 + 0x28))
		st64(s248, af, ah)
		st64(s258 + 8, ld64(s390))
		st8(s258 + 2, ld64(s390 + 8))
		st8(s258 + 1, ld64(s390 + 0x10))
		st8(s258, ld64(s390 + 0x18))
		st64(s278 + 0x18, ld64(s390 + 0x20))
		st64(s278 + 0x10, ld64(s390 + 0x28))
		st64(s278 + 8, ld64(s390 + 0x30))
		st64(s278, ld64(s398))
		st64(s288 + 8, ld64(s390 + 0x38))
		st8(s288, av, au, at)
		st64(s290, ld64(s3e0))
		st64(s2a8 + 0x10, ld64(s3d8))
		st64(s2a8, aj, am)
		st64(s2b0, ld64(s3d0))
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 8)
		st64(s210 + 8, 3)
		st64(s248 + 0x30, 1)
		st64(s2c8, 0, 8, 0)
		de = fn_13cfd8(s328, s2c8, ld64(s3c8), 0xd8, ld64(ld64(ap + 0x30)))
		aw = ld64(s328)
		if (aw != 2) {
			dd = ld64(s328 + 8)
			dc = ld64(s390 + 0x40)
			st64(dc, aw, dd)
			return de
		}
	}
	const da = ld64(s390 + 0x40)
	fn_4a30(s118, ld64(s348))
	if (ld64(s118) == 0) {
		de = Error_with_account_name(s338, ld64(s118 + 8), ld64(s118 + 0x10), "position", 8)
		const db = ld64(s338)
		st64(da + 8, ld64(s338 + 8))
		st64(da, db)
		return de
	}
	const cy = ld64(0x300000000 /* heap bump-allocator cursor */)
	const cz = cy != 0 ? sat_sub(cy, 0xd8) & -8 : 0x300007f28
	if (cz > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, cz)
		de = memcpy(cz, s118, 0xd8)
		st64(da + 8, cz)
		st64(da, 2)
		return de
	}
	alloc_handle_alloc_error(8, 0xd8)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: e (value), d (value), c (value)
// types [heur]: b: OpenPositionWithTokenExtensionsContext (the handler ix_open_position_with_token_extensions passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_35098(a: u64, b: OpenPositionWithTokenExtensionsContext, c: u64, d: u64, e: u64): u64 {
	const s28 = fp - 0x28, s40 = fp - 0x40, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, s90 = fp - 0x90, sa0 = fp - 0xa0, sa1 = fp - 0xa1, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s150 = fp - 0x150, s158 = fp - 0x158, s160 = fp - 0x160, s1000 = fp - 0x1000
	let o, u, ab, am: u64
	st64(s148, e, a)
	const accounts: OpenPositionWithTokenExtensionsAccounts = b.accounts
	const g = accounts.position_mint.key
	const h = ld8(b + 0x20)
	st64(sd8 + 0x20, sa1)
	st64(sd8 + 0x10, g)
	st64(sd8, 0x100151f20)
	st8(sa1, h)
	st64(sd8 + 0x28, 1)
	st64(sd8 + 0x18, 0x20)
	st64(sd8 + 8, 8)
	let an = fn_4c1a0(se8, accounts, ld64(accounts + 0x10), accounts + 0x38)
	let i = ld64(se8)
	if (i != 2) {
		am = ld64(s148 + 8)
		st64(am + 8, ld64(se8 + 8))
		st64(am, i)
		return an
	}
	const j = ld64(accounts + 0x28)
	const l = ld16(j + 0x284)
	const k = ld64(j + 0x240)
	st64(s1000, ld64(j + 0x238))
	st64(s1000 + 8, k)
	an = fn_60930(s48, c, d, l, ld64(s1000), k)
	i = ld64(s48)
	if (i == 2) {
		B15: {
			o = ld32(s40)
			const n = ld32(s40 + 4)
			st64(s158, ld64(accounts + 0x28))
			u = ld64(accounts + 0x10)
			const m = accounts.position_mint.key
			copyr(s48, m, 0x20)
			let q = 0xa
			st64(s150, n as i32)
			if ((((o as i32) - 0x6c4f5) as u32) >= 0xfff27617) {
				const p = ld16(ld64(s158) + 0x284)
				if (p == 0) {
					fn_14e1c0(0x100159f48, p, n as i32, 0xa)
				}
				st64(s160, p)
				const r = fn_151bf8(o as i32, p)
				q = 0xa
				if (((ld64(s150) - 0x6c4f5) as u32) >= 0xfff27617 && (r as u32) == 0) {
					const s = fn_151bf8(ld64(s150), ld64(s160))
					q = 0xa
					if ((ld64(s150) as i64) > (o as i32) && (s as u32) == 0) {
						if ((ld64(s160) as i16) > -1) {
							break B15
						}
						q = 0x36
						const t = 0x6c4f4 % ld64(s160)
						if (t - 0x6c4f4 == (o as i32) && 0x6c4f4 - t == ld64(s150)) {
							break B15
						}
					}
				}
			}
			an = fn_87630(sf8, q)
			i = ld64(sf8)
			if (i != 2) {
				am = ld64(s148 + 8)
				st64(am + 8, ld64(sf8 + 8))
				st64(am, i)
				return an
			}
		}
		const v = ld64(ld64(ld64(s158)))
		st64(u + 0x20, ld64(v + 0x18))
		st64(u + 0x18, ld64(v + 0x10))
		st64(u + 0x10, ld64(v + 8))
		st64(u + 8, ld64(v))
		copy(u + 0x30, s40, 0x18)
		const w = ld64(s48)
		st32(u + 0xd0, o as i32)
		st32(u + 0xd4, ld64(s150))
		st64(u + 0x28, w)
		const x = ld64(ld64(ld64(accounts + 0x28)))
		copyr(s48, x, 0x20)
		const y = ld64(ld64(ld64(accounts + 0x10)))
		copyr(s28, y, 0x20)
		const z = ld64(0x300000000 /* heap bump-allocator cursor */)
		const aa = z != 0 ? sat_sub(z, 0x100) : 0x300007f00
		if (aa > 0x300000007) {
			st64(s158, accounts + 0x18)
			st64(0x300000000 /* heap bump-allocator cursor */, aa)
			st64(aa, 0x79657593e6f3afed /* event:PositionOpened */)
			copy(aa + 8, s48, 0x40)
			st32(aa + 0x4c, ld64(s150))
			st32(aa + 0x48, o as i32)
			st64(sa0, aa, 0x50)
			log_data(sa0, 1)
			const ac = ld64(accounts + 0x28)
			const ae = (memcmp(ac + 0x148, 0x100152180, 0x20) as u32) == 0
			const af = ld16(ac + 0xc8)
			const ag = ld64(accounts + 0x10)
			const ad = ld64(s148)
			st64(s1000, accounts + 0x38, accounts + 0x30, ad, ae & af)
			an = fn_6d4c8(s108, ld64(s158), accounts, ag, accounts + 0x38, accounts + 0x30, ad, ae & af)
			i = ld64(s108)
			if (i == 2) {
				if (ad != 0) {
					const ah = ld64(s158)
					const aj = fn_75820(s48, ah, ld64(accounts + 0x10))
					copy(s90, s48, 0x48)
					const ai = ld64(accounts + 0x10)
					st64(s1000, ah, ai, accounts + 0x48, accounts, accounts + 0x38, accounts + 0x30, sd8, 3)
					an = fn_6f218(s118, s90, s78, s60, ah, ai, accounts + 0x48, accounts, accounts + 0x38, accounts + 0x30, sd8, 3, aj)
					i = ld64(s118)
					if (i != 2) {
						am = ld64(s148 + 8)
						st64(am + 8, ld64(s118 + 8))
						st64(am, i)
						return an
					}
				}
				st64(s1000, accounts + 8, accounts + 0x30, accounts + 0x38, accounts + 0x40)
				const ak = ld64(s158)
				an = fn_70d88(s128, accounts + 0x20, ak, accounts, accounts + 8, accounts + 0x30, accounts + 0x38, accounts + 0x40)
				i = ld64(s128)
				if (i == 2) {
					const al = ld64(accounts + 0x10)
					st64(s1000, accounts + 0x30, sd8, 3)
					an = fn_718c8(s138, al, ak, accounts + 0x20, accounts + 0x30, sd8, 3)
					i = ld64(s138)
					if (i == 2) {
						am = ld64(s148 + 8)
						st64(am + 8, undef)
						st64(am, 2)
						return an
					}
					am = ld64(s148 + 8)
					st64(am + 8, ld64(s138 + 8))
					st64(am, i)
					return an
				}
				am = ld64(s148 + 8)
				st64(am + 8, ld64(s128 + 8))
				st64(am, i)
				return an
			}
			am = ld64(s148 + 8)
			st64(am + 8, ld64(s108 + 8))
			st64(am, i)
			return an
		}
		raw_vec_handle_error(1, 0x100, sat_sub(z, 0x100), 0x100 > z, ab)
	}
	am = ld64(s148 + 8)
	st64(am + 8, ld64(s40))
	st64(am, i)
	return an
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: p7 (value)
// types [heur]: c: OpenPositionWithTokenExtensionsAccounts (every call passes one: fn_35098)
export function fn_6d4c8(a: u64, b: u64, c: OpenPositionWithTokenExtensionsAccounts, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s8 = fp - 0x8, s28 = fp - 0x28, s2f = fp - 0x2f, s30 = fp - 0x30, s60 = fp - 0x60, s90 = fp - 0x90, s98 = fp - 0x98, sc0 = fp - 0xc0, sc8 = fp - 0xc8, sf0 = fp - 0xf0, sf8 = fp - 0xf8, s100 = fp - 0x100, s118 = fp - 0x118, s120 = fp - 0x120, s140 = fp - 0x140, s160 = fp - 0x160, s178 = fp - 0x178, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, s1c0 = fp - 0x1c0, s1c8 = fp - 0x1c8, s1e0 = fp - 0x1e0, s1f8 = fp - 0x1f8, s210 = fp - 0x210, s228 = fp - 0x228, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0
	let r, s, ci: u64
	let cz = c
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	let g = f - 2
	let h = f != 0 ? (g > f ? 0 : g) & -2 : 0x300007ffe
	if (h > 0x300000007) {
		let da = p8
		const i = p7
		let cw = p6
		let cy = p5
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		let j = 1
		st16(h, 3)
		st64(s240, 1, h, 1)
		if (i != 0) {
			g = fn_ec20(s240, 0x300000000 /* heap bump-allocator cursor */, g)
			j = 2
			h = ld64(s240 + 8)
			st16(h + 2, 0x12)
			st64(s240 + 0x10, 2)
		}
		if (da != 0) {
			if (j == ld64(s240)) {
				g = fn_ec20(s240, cz, g)
				h = ld64(s240 + 8)
			}
			st16(h + (j << 1), 9)
			j = j + 1
			st64(s240 + 0x10, j)
		}
		fn_12e5a8(s120, ld64(s240 + 8), j, g)
		const l = ld64(s118)
		const k = ld64(s120)
		if (k != 0x800000000000001a /* Ok */) {
			st64(s118 + 8, ld64(s118 + 8))
			st64(s120, k, l)
			s = fn_13b430(s250, s120)
			r = ld64(s250)
			st64(a + 8, ld64(s250 + 8))
			st64(a, r)
			return s
		}
		let cv = d
		let cx = b
		const m = fn_12e150(l > l + 0xa6 ? 0xffffffffffffffff : l + 0xa6)
		rent_get(s120)
		const o = ld64(s118 + 8)
		const p = ld64(s118)
		if (ld64(s120) == 0) {
			let cu = m
			const t = fn_14f7f8(o, __floatundidf(p * (m + 0x80)))
			const u = fn_151cb0(t, 0)
			const v = fn_14f3e8(t)
			const ay = (fn_151a40(t, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (u as i64) ? 0 : v
			const w: AccountInfo = ld64(cy)
			const x: LamportsCell = w.lamports
			const ad = w.key
			const ae = cz
			rc_inc(x)
			const y: DataCell = w.data
			rc_inc(y)
			const ac = w.owner
			const ab = w.rent_epoch
			const aa = w.is_signer
			const z = w.is_writable
			st8(s8 + 2, w.executable)
			st8(s8, aa, z)
			st64(s30, ad, x, y, ac, ab)
			const af: AccountInfo = ld64(ae)
			const ag: LamportsCell = af.lamports
			const am = af.key
			rc_inc(ag)
			const ah: DataCell = af.data
			rc_inc(ah)
			const al = af.owner
			const ak = af.rent_epoch
			const aj = af.is_signer
			const ai = af.is_writable
			st8(s1a0 + 2, af.executable)
			st8(s1a0, aj, ai)
			st64(s1c8, am, ag, ah, al, ak)
			const an: AccountInfo = ld64(cx)
			const ao: LamportsCell = an.lamports
			const av = an.key
			rc_inc(ao)
			const ap: DataCell = an.data
			rc_inc(ap)
			const au = an.owner
			const at = an.rent_epoch
			const ar = an.is_signer
			const aq = an.is_writable
			st8(sf8 + 2, an.executable)
			st8(sf8, ar, aq)
			st64(s120, av, ao, ap, au, at)
			const aw = ld64(cw)
			cz = aw
			const ax = ld64(aw)
			copyr(s60, ax, 0x20)
			s = fn_5ecd8(s270, s30, s1c8, s120, s60, ay, cu, 8, 0)
			let q = ld64(s270 + 8)
			r = ld64(s270)
			if (r == 2) {
				const bb = an.key
				const az: AccountInfo = ld64(cv)
				const ba = az.key
				copyr(s28, ba + 8, 0x18)
				cw = ba
				st64(s30, ld64(ba))
				cx = bb
				fn_132b28(s120, ax, bb, s30)
				copy(s228, s118, 0x18)
				const bc = ld64(s120)
				if (bc == 0x8000000000000000) {
					s = fn_13b430(s2f0, s228)
					r = ld64(s2f0)
					st64(a + 8, ld64(s2f0 + 8))
					st64(a, r)
					return s
				}
				memcpy(s1a8, s100, 0x30)
				st64(s1c8, bc)
				copy(s1c0, s228, 0x18)
				const bd: LamportsCell = an.lamports
				const bj = an.key
				const bh: AccountInfo = cz
				rc_inc(bd)
				const be: DataCell = an.data
				rc_inc(be)
				cy = bd
				const bf: LamportsCell = az.lamports
				const cp = az.key
				const cq = an.executable
				const cr = an.is_writable
				const cs = an.is_signer
				const ct = an.rent_epoch
				cu = an.owner
				cv = bf
				rc_inc(bf)
				const bg: DataCell = az.data
				rc_inc(bg)
				const bi: LamportsCell = bh.lamports
				const cl = bh.key
				const cm = az.executable
				const cn = az.is_writable
				const co = az.is_signer
				const bk = az.rent_epoch
				const bl = az.owner
				rc_inc(bi)
				const bm: DataCell = bh.data
				rc_inc(bm)
				const bq = bh.owner
				const bp = bh.rent_epoch
				const bo = bh.is_signer
				const bn = bh.is_writable
				st8(s98 + 2, bh.executable)
				st8(s98, bo, bn)
				st64(sc0, cl, bi, bm, bq, bp)
				st8(sc8, co, cn, cm)
				st64(sf0, cp, cv, bg, bl, bk)
				st8(sf8, cs, cr, cq)
				st64(s120, bj, cy, be, cu, ct)
				fn_1390b0(s90, s1c8, s120, 3)
				if (ld64(s90) == 0x800000000000001a /* Ok */) {
					const bs = ld64(s118 + 8)
					const br = ld64(s118)
					rc_dec(br)
					rc_dec(bs)
					const bu: DataCell = ld64(sf0 + 0x10)
					const bt = ld64(sf0 + 8)
					rc_dec(bt)
					rc_dec(bu)
					const bw: DataCell = ld64(sc0 + 0x10)
					const bv: LamportsCell = ld64(sc0 + 8)
					rc_dec(bv)
					rc_dec(bw)
					if (i != 0) {
						st8(s60, 0)
						copyr(s2f, cx, 0x20)
						st8(s30, 1)
						fn_12d618(s120, ax, cx, s60, s30)
						copy(s210, s118, 0x18)
						const bx = ld64(s120)
						if (bx == 0x8000000000000000) {
							s = fn_13b430(s2e0, s210)
							r = ld64(s2e0)
							st64(a + 8, ld64(s2e0 + 8))
							st64(a, r)
							return s
						}
						memcpy(s1a8, s100, 0x30)
						st64(s1c8, bx)
						copy(s1c0, s210, 0x18)
						AccountInfo_clone(s90, an)
						cv = s60
						AccountInfo_clone(s60, az)
						cy = s30
						AccountInfo_clone(s30, cz)
						memcpy(s120, s90, 0x30)
						memcpy(sf0, cv, 0x30)
						memcpy(sc0, cy, 0x30)
						const by = fn_1390b0(s140, s1c8, s120, 3)
						if (ld64(s140) != 0x800000000000001a /* Ok */) {
							copyr(s30, s140, 0x18)
							ci = fn_13b430(s290, s30)
							q = ld64(s290 + 8)
							r = ld64(s290)
							s = ptr_drop_in_place_c028(s120, ci)
							st64(a + 8, q)
							st64(a, r)
							return s
						}
						ptr_drop_in_place_c028(s120, by)
					}
					if (da != 0) {
						fn_132f68(s120, ax, cx)
						copy(s1f8, s118, 0x18)
						const bz = ld64(s120)
						if (bz == 0x8000000000000000) {
							s = fn_13b430(s2d0, s1f8)
							r = ld64(s2d0)
							st64(a + 8, ld64(s2d0 + 8))
							st64(a, r)
							return s
						}
						memcpy(s1a8, s100, 0x30)
						st64(s1c8, bz)
						copy(s1c0, s1f8, 0x18)
						AccountInfo_clone(s60, an)
						da = s30
						AccountInfo_clone(s30, cz)
						memcpy(s120, s60, 0x30)
						memcpy(sf0, da, 0x30)
						const ca = fn_1390b0(s90, s1c8, s120, 2)
						if (ld64(s90) != 0x800000000000001a /* Ok */) {
							copyr(s30, s90, 0x18)
							const ck = fn_13b430(s2a0, s30)
							q = ld64(s2a0 + 8)
							r = ld64(s2a0)
							s = ptr_drop_in_place_bf20(s120, ck)
							st64(a + 8, q)
							st64(a, r)
							return s
						}
						ptr_drop_in_place_bf20(s120, ca)
					}
					copyr(s160, cw, 0x20)
					copyr(s140, cw, 0x20)
					fn_12f460(s120, ax, cx, s160, s140, 0)
					copy(s178, s118, 0x18)
					const cb = ld64(s120)
					if (cb == 0x8000000000000000) {
						s = fn_13b430(s2c0, s178)
						r = ld64(s2c0)
						st64(a + 8, ld64(s2c0 + 8))
						st64(a, r)
						return s
					}
					memcpy(s1a8, s100, 0x30)
					st64(s1c8, cb)
					copy(s1c0, s178, 0x18)
					AccountInfo_clone(s90, an)
					AccountInfo_clone(s60, az)
					AccountInfo_clone(s30, cz)
					q = s120
					memcpy(q, s90, 0x30)
					memcpy(sf0, s60, 0x30)
					memcpy(sc0, s30, 0x30)
					const cj = fn_1390b0(s1e0, s1c8, q, 3)
					if (ld64(s1e0) == 0x800000000000001a /* Ok */) {
						s = ptr_drop_in_place_c028(s120, cj)
						st64(a + 8, q)
						st64(a, 2)
						return s
					}
					copyr(s30, s1e0, 0x18)
					ci = fn_13b430(s2b0, s30)
					q = ld64(s2b0 + 8)
					r = ld64(s2b0)
					s = ptr_drop_in_place_c028(s120, ci)
					st64(a + 8, q)
					st64(a, r)
					return s
				}
				copyr(s60, s90, 0x18)
				s = fn_13b430(s280, s60)
				q = ld64(s280 + 8)
				r = ld64(s280)
				const cd = ld64(s118 + 8)
				const cc = ld64(s118)
				rc_dec(cc)
				rc_dec(cd)
				const cf: DataCell = ld64(sf0 + 0x10)
				const ce = ld64(sf0 + 8)
				rc_dec(ce)
				rc_dec(cf)
				const ch: DataCell = ld64(sc0 + 0x10)
				const cg: LamportsCell = ld64(sc0 + 8)
				rc_dec(cg)
				if (!rc_release(ch)) {
					st64(a + 8, q)
					st64(a, r)
					return s
				}
				ch.weak = ch.weak - 1
				st64(a + 8, q)
				st64(a, r)
				return s
			}
			st64(a + 8, q)
			st64(a, r)
			return s
		}
		st32(s1c8, ld32(s118 + 0x11))
		st32(s1c8 + 3, ld32(s118 + 0x14))
		const n = ld8(s118 + 0x10)
		st32(s118 + 0xc, ld32(s1c8 + 3))
		st32(s118 + 9, ld32(s1c8))
		st8(s118 + 8, n)
		st64(s120, p, o)
		s = fn_13b430(s260, s120)
		r = ld64(s260)
		st64(a + 8, ld64(s260 + 8))
		st64(a, r)
		return s
	}
	alloc_handle_alloc_error(2, 2)
}

export function fn_12e5a8(a: u64, b: u64, c: u64, r0: u64) {
	const s18 = fp - 0x18
	let f, q, r, u, w: u64
	B51: {
		B14: {
			let g = b
			f = a
			u = 0
			let l = 8
			st64(s18, 0, 8, 0)
			if (c != 0) {
				const x = f
				const h = g + (c << 1)
				let i = 0
				L3: while (true) {
					const m = g
					const j = i
					g = g + 2
					let k = 0
					while (true) {
						if ((j << 3) == k) {
							const o = ld64(s18)
							if (i == o) {
								r0 = fn_12d340(s18, o, r0)
								l = ld64(s18 + 8)
							}
							st64(l + (i << 3), m)
							i = i + 1
							st64(s18 + 0x10, i)
						} else {
							const n = l + k
							k = k + 8
							if (ld16(ld64(n)) != ld16(m)) {
								continue
							}
						}
						if (g == h) {
							u = 0
							const v = ld64(s18 + 8)
							f = x
							if (i == 0) {
								break B14
							}
							let s = 0
							const t = i << 3
							while (true) {
								B13: {
									B44: {
										r = u
										const p = ld16(ld64(v + s))
										if ((p as i64) > 0xd) {
											if ((p as i64) > 0x14) {
												if ((p as i64) > 0x17) {
													if ((p as i64) > 0x19) {
														if (p == 0x1a) {
															q = 0x25
															break B13
														}
														break B44
													}
													q = p != 0x18 ? 0x3c : 0xc8
													break B13
												}
												if (p == 0x15) {
													q = 0x54
													break B13
												}
												if (p != 0x16) {
													q = 0x4c
													break B13
												}
											} else if ((p as i64) > 0x10) {
												if ((p as i64) > 0x12 && p != 0x14) {
													w = 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */
													break B51
												}
											} else if (p != 0xe) {
												if (p == 0xf) {
													q = 5
													break B13
												}
												q = 0x85
												break B13
											}
											q = 0x44
											break B13
										}
										if ((p as i64) > 6) {
											if (9 >= (p as i64)) {
												if (p == 7) {
													break B44
												}
												if (p == 8) {
													q = 5
													break B13
												}
												break B44
											}
											if (0xb >= (p as i64)) {
												if (p == 0xa) {
													q = 0x38
													break B13
												}
												q = 5
												break B13
											}
											if (p != 0xc) {
												break B44
											}
										} else {
											if (2 >= (p as i64)) {
												if (p == 0) {
													break B44
												}
												q = p != 1 ? 0xc : 0x70
												break B13
											}
											if ((p as i64) > 4) {
												if (p == 5) {
													q = 0x12b
													break B13
												}
												q = 5
												break B13
											}
											if (p != 3) {
												q = 0x45
												break B13
											}
										}
										q = 0x24
										break B13
									}
									q = 4
								}
								u = q + r
								s = s + 8
								if (t == s) {
									break B14
								}
							}
						}
						continue L3
					}
				}
			}
		}
		st64(f + 8, u)
		w = 0x800000000000001a /* Ok */
	}
	st64(f, w)
	if (ld64(s18) != 0) {
		fn_83078(r0)
	}
}

export function fn_12d340(a: u64, b: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s30 = fp - 0x30
	let f = ld64(a)
	let g = f + 1
	let m = 0
	let h = g == 0
	if (h != 0) {
		raw_vec_handle_error(0, b, g, f, h)
	}
	let i = max(f << 1, g)
	const j = 0x1000000000000000 > i
	i = max(i, 4)
	const k = i
	if (f != 0) {
		const l = ld64(a + 8)
		st64(s18 + 0x10, f << 3)
		st64(s18, l)
		m = 8
	}
	st64(s18 + 8, m)
	const o = fn_12ce08(s30, j << 3, k << 3, s18, r0)
	g = undef
	f = undef
	h = undef
	if (ld64(s30) == 0) {
		const n = ld64(s30 + 8)
		st64(a, i, n)
		return o
	}
	raw_vec_handle_error(ld64(s30 + 8), ld64(s30 + 0x10), g, f, h)
}

export function fn_12e150(a: u64): u64 {
	return a != 0x163 ? a : 0x165
}

export function fn_132b28(a: u64, b: u64, c: u64, d: u64) {
	const s44 = fp - 0x44, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60, s68 = fp - 0x68, s70 = fp - 0x70
	let i = ld64(s70)
	let j = ld64(s68)
	let k = ld64(s60)
	let l = ld64(s58)
	if ((memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0) {
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
		fn_12e9c0(a + 0x18, s50)
		st64(a + 0x48, ld64(b + 0x18))
		st64(a + 0x40, ld64(b + 0x10))
		st64(a + 0x38, ld64(b + 8))
		st64(a + 0x30, ld64(b))
		st64(a + 8, g, 1)
		st64(a, 1)
	}
}

export function fn_12d618(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s18 = fp - 0x18, s3f = fp - 0x3f, s40 = fp - 0x40, s80 = fp - 0x80, sc0 = fp - 0xc0, s110 = fp - 0x110
	let g, h, i, t, u: u64
	if ((memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0) {
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
		let j = fn_138938(s40, d, f)
		if (ld8(s40) == 0) {
			copyr(s80, s3f, 0x20)
			j = fn_138938(s40, e, j)
			if (ld8(s40) == 0) {
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
				let q = fn_12e9c0(s18, s110)
				let p = ld64(s18)
				const o = ld64(s18 + 0x10)
				if (o == p) {
					q = RawVec_grow_one_12d200(s18, p, q)
					p = ld64(s18)
				}
				let r = ld64(s18 + 8)
				st8(r + o, 0)
				let s = o + 1
				st64(s18 + 0x10, s)
				if (0x3f >= p - s) {
					fn_12cf58(s18, s, 0x40, t, u, q)
					r = ld64(s18 + 8)
					s = ld64(s18 + 0x10)
				}
				memcpy(r + s, sc0, 0x40)
				st64(s18 + 0x10, s + 0x40)
				copy(a + 0x30, b, 0x20)
				st64(a + 8, f, 1)
				st64(a, 1)
				copy(a + 0x18, s18, 0x18)
			} else {
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
				fn_83078(j)
			}
		} else {
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
			fn_83078(j)
		}
	}
}

export function fn_138938(a: u64, b: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40
	if (ld8(b) != 0) {
		copyr(s40, b + 1, 0x20)
		st64(s20, 0, 0, 0, 0)
		r0 = memcmp(s40, s20, 0x20) as u32
		if (r0 == 0) {
			st64(a + 8, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
			st8(a, 1)
			return r0
		}
		st64(a + 0x19, ld64(b + 0x19))
		st64(a + 0x11, ld64(b + 0x11))
		st64(a + 9, ld64(b + 9))
		st64(a + 1, ld64(b + 1))
		st8(a, 0)
		return r0
	}
	st64(a + 0x19, 0)
	st64(a + 0x11, 0)
	st64(a + 9, 0)
	st64(a + 1, 0)
	st8(a, 0)
	return r0
}

export function fn_12f460(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64) {
	const s20 = fp - 0x20, s47 = fp - 0x47, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s80 = fp - 0x80, s88 = fp - 0x88
	let k = ld64(s88)
	let l = ld64(s80)
	let m = ld64(s78)
	let n = ld64(s70)
	const f = memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20)
	const g = p6
	const h = p5
	if ((f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	let i = 0
	if (h != 0) {
		n = ld64(h + 0x18)
		m = ld64(h + 0x10)
		l = ld64(h + 8)
		k = ld64(h)
		i = 1
	}
	st8(s50 + 8, g)
	copy(s47, d, 0x20)
	st32(s47 + 0x23, i)
	st64(s20, k, l, m, n)
	st32(s50, 0x14)
	fn_12e9c0(s68, s50)
	const j = __rust_alloc(0x22, 1)
	if (j == 0) {
		alloc_handle_alloc_error(1, 0x22)
	}
	st64(j + 0x18, ld64(c + 0x18))
	st64(j + 0x10, ld64(c + 0x10))
	st64(j + 8, ld64(c + 8))
	st64(j, ld64(c))
	st16(j + 0x20, 0x100)
	st64(a + 0x48, ld64(b + 0x18))
	st64(a + 0x40, ld64(b + 0x10))
	st64(a + 0x38, ld64(b + 8))
	st64(a + 0x30, ld64(b))
	copy(a + 0x18, s68, 0x18)
	st64(a + 8, j, 1)
	st64(a, 1)
}

export function fn_75820(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s28 = fp - 0x28, s40 = fp - 0x40, s60 = fp - 0x60, s78 = fp - 0x78, s88 = fp - 0x88, sb8 = fp - 0xb8, sd0 = fp - 0xd0
	let j: u64
	const f = ld64(ld64(b))
	copyr(sb8, f, 0x20)
	st64(s60, 0, 1, 0)
	st64(s20, s60, 0x100159480)
	st8(s20 + 0x18, 3)
	st64(s20 + 0x10, 0x20)
	st64(s40 + 0x10, 0)
	st64(s40, 0)
	const g = fn_145330(sb8, s40, c, d, e, c)
	let k = undef
	if (g == 0) {
		const i = ld64(s60 + 8)
		const h = ld64(s60 + 0x10)
		if (h > 4) {
			if (-0x41 >= (ld8(i + 4) as i8)) {
				fn_14d330(i, h, 0, 4, 0x10015a250)
			}
			st64(s88, i)
			j = h - 4
			st64(s88 + 8, 4)
			k = ld8(i + j) as i8
			if (-0x41 >= (k as i64)) {
				fn_14d330(i, h, j, h, 0x10015a268)
			}
		} else {
			if (h != 4) {
				fn_14d330(i, h, 0, 4, 0x10015a250)
			}
			st64(s88, i)
			j = 0
			st64(s88 + 8, 4)
		}
		st64(s20, s60)
		st64(s40 + 0x10, s88)
		st64(s40, 0x10015a240)
		st64(sb8, 0x10015a210)
		st64(sb8 + 0x10, s40)
		st64(s60, i + j)
		st64(s20 + 8, fn_b980)
		st64(s28, fn_b980)
		st64(s40 + 8, fn_b980)
		st64(s60 + 8, 4)
		st64(sb8 + 0x20, 0)
		st64(sb8 + 8, 3)
		st64(sb8 + 0x18, 3)
		// fmt "{} {}...{}" {} = *0x10015a240 [fn_b980], {} = *s88 [fn_b980], {} = i + j [fn_b980]
		fn_147e78(sd0, sb8, j, k)
		const l = ld64(ld64(c))
		const p = ld64(l)
		const o = ld64(l + 8)
		const n = ld64(l + 0x10)
		const m = ld64(l + 0x18)
		st64(s60, 0x10015a1d0, fn_b980, sb8, fn_145330, 0x10015a1b0)
		st64(s40 + 0x10, s60)
		st64(sb8, p, o, n, m)
		st64(s40 + 8, 2)
		st64(s28, 2, 0)
		const s = fn_147e78(s78, s40, o, n, s60)
		const q = ld64(0x300000000 /* heap bump-allocator cursor */)
		const r = q != 0 ? sat_sub(q, 3) : 0x300007ffd
		if (r > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, r)
			st8(r + 2, 0x50)
			st16(r, 0x574f)
			st64(a + 0x10, ld64(sd0 + 0x10))
			st64(a + 8, ld64(sd0 + 8))
			st64(a, ld64(sd0))
			st64(a + 0x20, r, 3)
			st64(a + 0x18, 3)
			copy(a + 0x30, s78, 0x18)
			return s
		}
		raw_vec_handle_error(1, 3, sat_sub(q, 3), 3 > q)
	}
	fn_149678("a Display implementation returned an error unexpectedly", 0x37, s88, 0x1001594b0, 0x1001594d0)
}

// types [heur]: p8: OpenPositionWithTokenExtensionsAccounts (every call passes one: fn_35098)
export function fn_6f218(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: OpenPositionWithTokenExtensionsAccounts, p9: u64, p10: u64, p11: u64, p12: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s48 = fp - 0x48, s50 = fp - 0x50, s78 = fp - 0x78, s80 = fp - 0x80, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sd8 = fp - 0xd8, sf0 = fp - 0xf0, s110 = fp - 0x110, s160 = fp - 0x160, s178 = fp - 0x178, s1b8 = fp - 0x1b8, s1d0 = fp - 0x1d0, s1e8 = fp - 0x1e8, s200 = fp - 0x200, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s1000 = fp - 0x1000
	let q, r, ae, ai, ap, aq, ar, dm, dn, dq: u64
	let p = a
	st64(s1b8, 0, 0, 0, 0, 0, 0, 0, 0)
	copyr(s218, b, 0x18)
	copy(s200, c, 0x18)
	copyr(s1e8, d, 0x10)
	st64(s1e8 + 0x10, ld64(d + 0x10))
	st64(s1d0, 0, 8, 0)
	const f = ld64(p5)
	const i = AccountInfo_try_borrow_data(sd8, f, r0)
	const m = ld64(sd8 + 0x10)
	const h = ld64(sd8 + 8)
	const g = ld64(sd8)
	if (g != 0x800000000000001a /* Ok */) {
		st64(sd8, g, h, m)
		ar = fn_13b430(s228, sd8)
		aq = ld64(s228)
		st64(p + 8, ld64(s228 + 8))
		st64(p, aq)
		return ar
	}
	let dw: AccountInfo = f
	const dr = p12
	const n = p11
	let dt = p10
	let du = p9
	let dv = p8
	let ds = p7
	const o = p6
	fn_afd0(sd8, ld64(h), ld64(h + 8), undef, undef, i)
	if (ld32(sd8) == 2) {
		const j = ld64(sd8 + 0x18)
		st64(s160 + 0x14, j)
		const k = ld64(sd8 + 0x10)
		st64(s160 + 0xc, k)
		const l = ld64(sd8 + 8)
		st64(s160 + 4, l)
		st64(sd8, l, k, j)
		ar = fn_13b430(s278, sd8)
		ap = ld64(s278 + 8)
		aq = ld64(s278)
		st64(m, ld64(m) - 1)
		st64(p + 8, ap)
		st64(p, aq)
		return ar
	}
	B22: {
		let dp = o
		dq = p
		const u = ld64(s78)
		const t = ld64(s80)
		fn_1387b0(sd8, s218)
		r = ld64(sd8 + 8)
		q = ld64(sd8)
		if (q == 0x800000000000001a /* Ok */) {
			const s = fn_12e170(r)
			let dx = t
			fn_12e1b8(sd8, t, u)
			if (ld64(sd8) == 0x8000000000000000) {
				q = ld64(sd8 + 8)
				ae = ld64(sd8 + 0x18)
				r = ld64(sd8 + 0x10)
				if (q != 0x800000000000001a /* Ok */) {
					break B22
				}
			} else {
				B29: {
					const v = ld64(sd8 + 0x18)
					dn = s
					dm = v > v + 0xa6 ? 0xffffffffffffffff : v + 0xa6
					if (u != 0) {
						let w = 0
						do {
							const ab = fn_12e0b0(s160, w)
							const x = ld64(s160 + 0x10)
							if (x > u) {
								break
							}
							const y = ld64(s160 + 8)
							const z = ld64(s160)
							if (z > y) {
								fn_14c690(z, y, 0x100159390)
							}
							const aa = dx
							if (y > u) {
								fn_14c5c0(y, u, 0x100159390)
							}
							fn_12e558(sd8, aa + z, y - z, ab)
							if (ld64(sd8) != 0x800000000000001a /* Ok */) {
								break
							}
							const ac = ld16(sd8 + 8)
							if (ac > 0x1b) {
								break
							}
							if (((1 << (ac & 0x3f)) & 0x7f5565a) == 0) {
								if (((1 << (ac & 0x3f)) & 0x802a9a4) != 0) {
									break
								}
								if (ac == 0x13) {
									if (x >= y) {
										const af = dx
										if (x - y == 2) {
											const ag = ld16(af + y)
											const ah = x > x + ag ? 0xffffffffffffffff : x + ag
											if (ah > u) {
												break
											}
											ai = fn_12e170(ah - x)
											break B29
										}
										break
									}
									fn_14c690(y, x, 0x100159378)
								}
								break
							}
							if (y > x) {
								fn_14c690(y, x, 0x1001593a8)
							}
							if (x - y != 2) {
								break
							}
							const ad = ld16(dx + y)
							w = x > x + ad ? 0xffffffffffffffff : x + ad
						} while (u > w)
					}
					ai = 0
				}
				const al = dn
				const aj = dm - ai
				const ak = aj > dm ? 0 : aj
				r = fn_12e150(ak > ak + al ? 0xffffffffffffffff : ak + al)
			}
			rent_get(sd8)
			const an = ld64(sd8 + 0x10)
			const ao = ld64(sd8 + 8)
			if (ld64(sd8) == 0) {
				dx = fn_143100(dw)
				st64(m, ld64(m) - 1)
				const at = fn_14f7f8(an, __floatundidf(ao * (r + 0x80)))
				const au = fn_151cb0(at, 0)
				const av = fn_14f3e8(at)
				const aw = (fn_151a40(at, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (au as i64) ? 0 : av
				const ay = dw.key
				const ax: AccountInfo = ld64(dv)
				fn_142e70(s160, ax.key, ay, sat_sub(aw, dx))
				const az: LamportsCell = ax.lamports
				const bh = ax.key
				rc_inc(az)
				const ba: DataCell = ax.data
				const bb: AccountInfo = dw
				rc_inc(ba)
				const bc: LamportsCell = bb.lamports
				let dl = bb.key
				dm = ax.executable
				dn = ax.is_writable
				dv = ax.is_signer
				dx = ax.rent_epoch
				const be = ax.owner
				rc_inc(bc)
				const bd: DataCell = bb.data
				let di = be
				let dj = bc
				let dk = ba
				rc_inc(bd)
				const bf: AccountInfo = ld64(du)
				const bg: LamportsCell = bf.lamports
				let de = bb.executable
				let df = bb.is_writable
				let dg = bb.is_signer
				let dh = bb.rent_epoch
				du = bb.owner
				const bn = bf.key
				rc_inc(bg)
				let dd = bh
				const bi: DataCell = bf.data
				let dc = ay
				rc_inc(bi)
				const bm = bf.owner
				const bl = bf.rent_epoch
				const bk = bf.is_signer
				const bj = bf.is_writable
				st8(s50 + 2, bf.executable)
				st8(s50, bk, bj)
				st64(s78, bn, bg, bi, bm, bl)
				st8(s80, dg, df, de)
				st64(sa8, dl, dj, bd, du, dh)
				st8(sb0, dv, dn, dm)
				st64(sd8, dd, az, dk, di, dx)
				fn_1390b0(s18, s160, sd8, 3)
				if (ld64(s18) == 0x800000000000001a /* Ok */) {
					const bp = ld64(sd8 + 0x10)
					const bo = ld64(sd8 + 8)
					rc_dec(bo)
					const by = dc
					rc_dec(bp)
					const br = ld64(sa8 + 0x10)
					const bq = ld64(sa8 + 8)
					rc_dec(bq)
					rc_dec(br)
					const bt = ld64(s78 + 0x10)
					const bs = ld64(s78 + 8)
					rc_dec(bs)
					rc_dec(bt)
					const bv: AccountInfo = ld64(dt)
					const bu: AccountInfo = ld64(ds)
					const ca = bu.key
					const bz = bv.key
					const bw: AccountInfo = ld64(dp)
					const bx = bw.key
					copyr(s110, bx, 0x20)
					copyr(sf0, s218, 0x18)
					copyr(s18, s200, 0x18)
					copyr(sd8, s1e8, 0x18)
					st64(s1000, by, s110, sf0, s18, sd8)
					fn_1384c0(s160, bz, by, ca, by, s110, sf0, s18, sd8)
					const cb: LamportsCell = dw.lamports
					const cc: AccountInfo = dw
					const ck = dw.key
					rc_inc(cb)
					const cj: DataCell = cc.data
					rc_inc(cj)
					dx = ck
					const cl: LamportsCell = bw.lamports
					dp = bw.key
					ds = dw.executable
					dt = dw.is_writable
					du = dw.is_signer
					dv = dw.rent_epoch
					const cr = dw.owner
					rc_inc(cl)
					const cm: DataCell = bw.data
					dw = cl
					rc_inc(cm)
					const cn: LamportsCell = bu.lamports
					dn = cj
					di = bu.key
					dj = bw.executable
					dk = bw.is_writable
					dl = bw.is_signer
					dm = bw.rent_epoch
					const cp = bw.owner
					rc_inc(cn)
					const co: DataCell = bu.data
					dh = cm
					rc_inc(co)
					df = cp
					const cq: LamportsCell = bv.lamports
					dg = cr
					const da = bv.key
					const db = bu.executable
					dc = bu.is_writable
					dd = bu.is_signer
					de = bu.rent_epoch
					const cx = bu.owner
					rc_inc(cq)
					const cs: DataCell = bv.data
					rc_inc(cs)
					const cw = bv.owner
					const cv = bv.rent_epoch
					const cu = bv.is_signer
					const ct = bv.is_writable
					ap = bv.executable
					st8(s20, cu, ct, ap)
					st64(s48, da, cq, cs, cw, cv)
					st8(s50, dd, dc, db)
					st64(s78, di, cn, co, cx, de)
					st8(s80, dl, dk, dj)
					st64(sa8, dp, dw, dh, df, dm)
					st8(sb0, du, dt, ds)
					st64(sd8, dx, cb, dn, dg, dv)
					st64(sf0, n, dr)
					st64(s1000, sf0, 1)
					const cy = fn_1390d8(s178, s160, sd8, 4, fp)
					if (ld64(s178) == 0x800000000000001a /* Ok */) {
						ar = ptr_drop_in_place_c1b0(sd8, cy)
						st64(dq + 8, ap)
						st64(dq, 2)
						return ar
					}
					copyr(s18, s178, 0x18)
					const cz = fn_13b430(s268, s18)
					ap = ld64(s268 + 8)
					aq = ld64(s268)
					ar = ptr_drop_in_place_c1b0(sd8, cz)
					st64(dq + 8, ap)
					st64(dq, aq)
					return ar
				}
				copyr(s110, s18, 0x18)
				ar = fn_13b430(s258, s110)
				ap = ld64(s258 + 8)
				aq = ld64(s258)
				const ce = ld64(sd8 + 0x10)
				const cd = ld64(sd8 + 8)
				p = dq
				rc_dec(cd)
				rc_dec(ce)
				const cg = ld64(sa8 + 0x10)
				const cf = ld64(sa8 + 8)
				rc_dec(cf)
				rc_dec(cg)
				const ci = ld64(s78 + 0x10)
				const ch = ld64(s78 + 8)
				rc_dec(ch)
				if (!rc_release(ci)) {
					st64(p + 8, ap)
					st64(p, aq)
					return ar
				}
				st64(ci + 8, ld64(ci + 8) - 1)
				st64(p + 8, ap)
				st64(p, aq)
				return ar
			}
			st32(s160, ld32(sd8 + 0x19))
			st32(s160 + 3, ld32(sd8 + 0x1c))
			const am = ld8(sd8 + 0x18)
			st32(sd8 + 0x14, ld32(s160 + 3))
			st32(sd8 + 0x11, ld32(s160))
			st8(sd8 + 0x10, am)
			st64(sd8, ao, an)
			ar = fn_13b430(s248, sd8)
			ap = ld64(s248 + 8)
			aq = ld64(s248)
			st64(m, ld64(m) - 1)
			st64(dq + 8, ap)
			st64(dq, aq)
			return ar
		}
		ae = ld64(sd8 + 0x10)
	}
	st64(sd8, q, r, ae)
	ar = fn_13b430(s238, sd8)
	ap = ld64(s238 + 8)
	aq = ld64(s238)
	st64(m, ld64(m) - 1)
	st64(dq + 8, ap)
	st64(dq, aq)
	return ar
}

export function fn_1387b0(a: u64, b: u64, c: u64, d: u64, e: u64) {
	let f = ld64(b + 0x10)
	if (f > 0xffffffff) {
		fn_144640(a, 0x1500000003, f, 0xffffffff, e)
	} else {
		e = ld64(b + 0x28)
		if (e > 0xffffffff) {
			fn_144640(a, 0x1500000003, f, 0xffffffff, e)
		} else {
			const h = ld64(b + 0x40)
			if (h > 0xffffffff) {
				fn_144640(a, 0x1500000003, f, 0xffffffff, e)
			} else {
				let g = ld64(b + 0x58)
				if (g > 0xffffffff) {
					fn_144640(a, 0x1500000003, f, g, e)
				} else {
					f = f + e + h + 0x50
					if (g != 0) {
						let i = ld64(b + 0x50) + 0x28
						g = g * 0x30
						while (true) {
							const j = ld64(i - 0x18)
							if (j > 0xffffffff) {
								fn_144640(a, 0x1500000003, f, g, 0xffffffff)
								return
							}
							const k = ld64(i)
							if (k > 0xffffffff) {
								fn_144640(a, 0x1500000003, f, g, 0xffffffff)
								return
							}
							i = i + 0x30
							f = f + j + k + 8
							g = g - 0x30
							if (g == 0) {
								st64(a, 0x800000000000001a /* Ok */, f)
								return
							}
						}
					}
					st64(a, 0x800000000000001a /* Ok */, f)
				}
			}
		}
	}
}

export function fn_12e1b8(a: u64, b: u64, c: u64) {
	const s18 = fp - 0x18, s40 = fp - 0x40
	let q, r: u64
	let s = ld64(s40)
	let f = 2
	let t = 2
	let i = 0
	st64(s18, 0, 2, 0)
	let n = 0
	let h = 0
	const u = c
	while (true) {
		if (c > h) {
			const v = i
			let j = h > h + 4
			const m = j != 0 ? 0xffffffffffffffff : h + 4
			const k = h > h + 2 ? 0xffffffffffffffff : h + 2
			c = u
			if (k > u) {
				st64(a + 0x10, ld64(s18 + 0x10))
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				st64(a + 0x18, h)
				return
			}
			B17: {
				if (k - h == 2) {
					let l = b + h
					const g = ld16(l)
					if (0x1c > g) {
						if (g == 0) {
							st64(a + 0x10, ld64(s18 + 0x10))
							st64(a + 8, ld64(s18 + 8))
							st64(a, ld64(s18))
							st64(a + 0x18, h)
							return
						}
						if (c >= m) {
							const o = ld64(s18)
							if (n == o) {
								j = fn_12d4a8(s18, o, j)
								l = undef
								c = u
								t = ld64(s18 + 8)
							}
							st16(t + v, g)
							n = n + 1
							st64(s18 + 0x10, n)
							if (k > m) {
								fn_14c690(k, m, 0x10015aa98, l, v)
							}
							if (m - k != 2) {
								q = a
								st64(a + 0x10, s)
								r = 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */
								break B17
							}
							s = b + k
							const p = ld16(b + k)
							h = m > m + p ? 0xffffffffffffffff : m + p
							i = v + 2
							f = g
							if (c >= h) {
								continue
							}
						}
						r = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
						q = a
						break B17
					}
				}
				q = a
				st16(a + 0x10, f)
				r = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
			}
			st64(q + 8, r)
			st64(q, 0x8000000000000000)
			if (ld64(s18) == 0) {
				return
			}
			fn_83078(j)
			return
		}
		st64(a + 0x10, ld64(s18 + 0x10))
		st64(a + 8, ld64(s18 + 8))
		st64(a, ld64(s18))
		st64(a + 0x18, h)
		return
	}
}

export function fn_12d4a8(a: u64, b: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s30 = fp - 0x30
	let f = ld64(a)
	let g = f + 1
	let h = g == 0
	if (h != 0) {
		raw_vec_handle_error(0, b, g, f, h)
	}
	const i = f
	let j = max(f << 1, g)
	let n = 0
	const k = 0x4000000000000000 > j
	j = max(j, 4)
	const l = j
	if (f != 0) {
		const m = ld64(a + 8)
		st64(s18 + 0x10, i << 1)
		st64(s18, m)
		n = 2
	}
	st64(s18 + 8, n)
	const p = fn_12ce08(s30, k << 1, l << 1, s18, r0)
	g = undef
	f = undef
	h = undef
	if (ld64(s30) == 0) {
		const o = ld64(s30 + 8)
		st64(a, j, o)
		return p
	}
	raw_vec_handle_error(ld64(s30 + 8), ld64(s30 + 0x10), g, f, h)
}

export function fn_1384c0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64) {
	const s18 = fp - 0x18, s30 = fp - 0x30, s48 = fp - 0x48
	const f = p7
	copyr(s48, f, 0x18)
	const g = p8
	copy(s30, g, 0x18)
	const h = p9
	copy(s18, h, 0x18)
	const i = __rust_alloc(0x88, 1)
	if (i == 0) {
		alloc_handle_alloc_error(1, 0x88)
	}
	const l = p6
	const j = p5
	st64(i + 0x18, ld64(c + 0x18))
	st64(i + 0x10, ld64(c + 0x10))
	st64(i + 8, ld64(c + 8))
	st64(i, ld64(c))
	st16(i + 0x20, 0x100)
	copy(i + 0x22, d, 0x20)
	st16(i + 0x42, 0)
	copy(i + 0x44, j, 0x10)
	const k = ld64(j + 0x10)
	st64(i + 0x54, k)
	st64(i + 0x5c, ld64(j + 0x18))
	st16(i + 0x64, 0)
	st64(i + 0x7e, ld64(l + 0x18))
	st64(i + 0x76, ld64(l + 0x10))
	st64(i + 0x6e, ld64(l + 8))
	st64(i + 0x66, ld64(l))
	st16(i + 0x86, 1)
	const m = fn_137220(a + 0x18, s48, k, d)
	st64(a + 0x48, ld64(b + 0x18))
	st64(a + 0x40, ld64(b + 0x10))
	st64(a + 0x38, ld64(b + 8))
	st64(a + 0x30, ld64(b))
	st64(a + 8, i, 4)
	st64(a, 4)
	fn_136dd0(s48, m)
}

export function fn_137220(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s18 = fp - 0x18, s30 = fp - 0x30, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48, s50 = fp - 0x50
	let ai, aq, ar, az, ba, bg, bh, bm, bq, br, bx, by, bz, cf, ch, ci: u64
	let h = a
	st64(s30, 0, 1, 0)
	const f = ld64(b)
	const g = -0x7ffffffffffffffc > (f as i64) ? f + 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */ : 0
	st64(s38, b)
	if ((g as i64) > 1) {
		if (g == 2) {
			fn_1370d8(s30, 0, 8, f, e)
			const ab = ld64(s30 + 0x10)
			const aa = ld64(s30 + 8)
			st64(s48, aa)
			st64(aa + ab, 0xb5258d59382012ea)
			let ac = ab + 8
			st64(s30 + 0x10, ac)
			const ad = __rust_alloc(0x400, 1)
			let ae = ad
			if (ad == 0) {
				raw_vec_handle_error(1, 0x400, br, aq, ar)
			}
			st64(s18, 0x400, ae)
			const af = ld64(s38)
			st8(ae, ld8(af + 0x20))
			const ag = ld64(af + 0x18)
			if (ag > 0xffffffff) {
				fn_83078(ad)
				st64(s18, 0x1500000003)
				fn_149678(0x100156086 /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x10015ab10, 0x10015ab60)
			}
			st64(s40, h)
			const ah = ld64(af + 0x10)
			st32(ae + 1, ag)
			st64(s18 + 0x10, 5)
			if (ag > 0x3fb) {
				st64(s50, ah)
				fn_1370d8(s18, 5, ag, aq, ar)
				st64(s38, ld64(s18))
				ae = ld64(s18 + 8)
				const cg = ld64(s18 + 0x10)
				memcpy(ae + cg, ld64(s50), ag)
				ai = cg + ag
				if (ld64(s38) == 0x8000000000000000) {
					st64(s18, ae)
					fn_149678(0x100156086 /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x10015ab10, 0x10015ab60)
				}
			} else {
				memcpy(ae + 5, ah, ag)
				st64(s38, 0x400)
				ai = ag + 5
			}
			let aj = ld64(s48)
			if (ai > ld64(s30) - ac) {
				fn_1370d8(s30, ac, ai, ch, ci)
				aj = ld64(s30 + 8)
				ac = ld64(s30 + 0x10)
			}
			bq = memcpy(aj + ac, ae, ai)
			st64(s30 + 0x10, ac + ai)
			h = ld64(s40)
			if (ld64(s38) == 0) {
				st64(h + 0x10, ld64(s30 + 0x10))
				st64(h + 8, ld64(s30 + 8))
				st64(h, ld64(s30))
				return bq
			}
			bq = fn_83078(bq)
			st64(h + 0x10, ld64(s30 + 0x10))
			st64(h + 8, ld64(s30 + 8))
			st64(h, ld64(s30))
			return bq
		}
		if (g == 3) {
			fn_1370d8(s30, 0, 8, f, e)
			const bo = ld64(s30 + 0x10)
			let bn = ld64(s30 + 8)
			st64(bn + bo, 0x7b566454e4a6e4d7)
			let bp = bo + 8
			st64(s30 + 0x10, bp)
			bq = __rust_alloc(0x400, 1)
			if (bq != 0) {
				const bs = ld64(s38)
				st64(bq + 0x18, ld64(bs + 0x20))
				st64(bq + 0x10, ld64(bs + 0x18))
				st64(bq + 8, ld64(bs + 0x10))
				st64(bq, ld64(bs + 8))
				if (0x1f >= ld64(s30) - bp) {
					fn_1370d8(s30, bp, 0x20, aq, ar)
					bn = ld64(s30 + 8)
					bp = ld64(s30 + 0x10)
				}
				const bt = bn + bp
				st64(bt + 0x18, ld64(bq + 0x18))
				st64(bt + 0x10, ld64(bq + 0x10))
				st64(bt + 8, ld64(bq + 8))
				st64(bt, ld64(bq))
				st64(s30 + 0x10, bp + 0x20)
				bq = fn_83078(bq)
				st64(h + 0x10, ld64(s30 + 0x10))
				st64(h + 8, ld64(s30 + 8))
				st64(h, ld64(s30))
				return bq
			}
			raw_vec_handle_error(1, 0x400, br, aq, ar)
		}
		st64(s40, h)
		let t = 0
		fn_1370d8(s30, 0, 8, f, e)
		const p = ld64(s30 + 0x10)
		let o = ld64(s30 + 8)
		st64(o + p, 0x46b80c0dfab4a6fa)
		let q = p + 8
		st64(s30 + 0x10, q)
		let u = 1
		const r = __rust_alloc(0x400, 1)
		if (r == 0) {
			raw_vec_handle_error(1, 0x400, br, aq, ar)
		}
		const s = ld64(s38)
		if (ld64(s + 8) != 0) {
			st64(r + 1, ld64(s + 0x10))
			u = 9
			t = 1
		}
		st8(r, t)
		const v = r + u
		let x = 1
		let w = 0
		if (ld64(s + 0x18) != 0) {
			st64(v + 1, ld64(s + 0x20))
			x = 9
			w = 1
		}
		st8(v, w)
		const y = x + u
		if (y > ld64(s30) - q) {
			fn_1370d8(s30, q, y, r, ar)
			o = ld64(s30 + 8)
			q = ld64(s30 + 0x10)
		}
		const z = memcpy(o + q, r, y)
		st64(s30 + 0x10, q + y)
		bq = fn_83078(z)
		h = ld64(s40)
		st64(h + 0x10, ld64(s30 + 0x10))
		st64(h + 8, ld64(s30 + 8))
		st64(h, ld64(s30))
		return bq
	}
	st64(s40, h)
	if (g == 0) {
		fn_1370d8(s30, 0, 8, f, e)
		const ak = ld64(s30 + 0x10)
		st64(ld64(s30 + 8) + ak, 0x8d4db858a21ee1d2 /* ix:initialize_token_metadata */)
		st64(s30 + 0x10, ak + 8)
		let ax = 0x400
		let al = __rust_alloc(0x400, 1)
		let am = al
		if (al == 0) {
			raw_vec_handle_error(1, 0x400, br, aq, ar)
		}
		st64(s18, 0x400, am)
		const an = ld64(s38)
		const ao = ld64(an + 0x10)
		if (ao > 0xffffffff) {
			fn_83078(al)
			st64(s18, 0x1500000003)
			fn_149678(0x100156086 /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x10015ab10, 0x10015ab30)
		}
		const ap = ld64(an + 8)
		st32(am, ao)
		let at = 4
		st64(s18 + 0x10, 4)
		if (ao >= 0x3fd) {
			fn_1370d8(s18, 4, ao, aq, ar)
			ax = ld64(s18)
			am = ld64(s18 + 8)
			at = ld64(s18 + 0x10)
		}
		al = memcpy(am + at, ap, ao)
		let au = at + ao
		st64(s18 + 0x10, au)
		const av = ld64(s38)
		const aw = ld64(av + 0x28)
		if (0xffffffff >= aw) {
			const ay = ld64(av + 0x20)
			if (3 >= ax - au) {
				fn_1370d8(s18, au, 4, az, ba)
				am = ld64(s18 + 8)
				ax = ld64(s18)
				au = ld64(s18 + 0x10)
			}
			st32(am + au, aw)
			let bb = au + 4
			st64(s18 + 0x10, bb)
			if (aw > ax - bb) {
				fn_1370d8(s18, bb, aw, az, ba)
				am = ld64(s18 + 8)
				bb = ld64(s18 + 0x10)
			}
			al = memcpy(am + bb, ay, aw)
			let bc = bb + aw
			st64(s18 + 0x10, bc)
			ax = ld64(s18)
			const bd = ld64(s38)
			const be = ld64(bd + 0x40)
			if (0xffffffff >= be) {
				const bf = ld64(bd + 0x38)
				if (3 >= ax - bc) {
					fn_1370d8(s18, bc, 4, bg, bh)
					am = ld64(s18 + 8)
					ax = ld64(s18)
					bc = ld64(s18 + 0x10)
				}
				st32(am + bc, be)
				let bi = bc + 4
				st64(s18 + 0x10, bi)
				if (be > ax - bi) {
					fn_1370d8(s18, bi, be, bg, bh)
					bm = ld64(s18 + 8)
					bi = ld64(s18 + 0x10)
					am = bm
				} else {
					bm = ld64(s18 + 8)
				}
				memcpy(am + bi, bf, be)
				const bj = ld64(s18)
				if (bj == 0x8000000000000000) {
					st64(s18, bm)
					fn_149678(0x100156086 /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x10015ab10, 0x10015ab30)
				}
				const bl = bi + be
				let bk = ld64(s30 + 0x10)
				if (bl > ld64(s30) - bk) {
					fn_1370d8(s30, bk, bl)
					bk = ld64(s30 + 0x10)
				}
				bq = memcpy(ld64(s30 + 8) + bk, bm, bl)
				st64(s30 + 0x10, bk + bl)
				h = ld64(s40)
				if (bj == 0) {
					st64(h + 0x10, ld64(s30 + 0x10))
					st64(h + 8, ld64(s30 + 8))
					st64(h, ld64(s30))
					return bq
				}
				bq = fn_83078(bq)
				st64(h + 0x10, ld64(s30 + 0x10))
				st64(h + 8, ld64(s30 + 8))
				st64(h, ld64(s30))
				return bq
			}
		}
		if (ax == 0) {
			st64(s18, 0x1500000003)
			fn_149678(0x100156086 /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x10015ab10, 0x10015ab30)
		}
		fn_83078(al)
		st64(s18, 0x1500000003)
		fn_149678(0x100156086 /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x10015ab10, 0x10015ab30)
	}
	fn_1370d8(s30, 0, 8, f, e)
	const i = ld64(s30 + 0x10)
	st64(ld64(s30 + 8) + i, 0xc8dccab52d31e9dd)
	st64(s30 + 0x10, i + 8)
	let j = __rust_alloc(0x400, 1)
	let k = j
	if (j == 0) {
		raw_vec_handle_error(1, 0x400, br, aq, ar)
	}
	st64(s18, 0x400, k)
	let l = ld64(s38)
	const m = ld64(l + 0x20)
	const n = min(m ^ 0x8000000000000000, 3)
	st8(k, (n as i64) > 1 ? n != 2 ? 3 : 2 : n != 0)
	st64(s18 + 0x10, 1)
	if (3 > (m ^ 0x8000000000000000)) {
		bx = 1
		bz = 0x400
		by = ld64(l + 0x18)
		if (by > 0xffffffff) {
			fn_83078(j)
			st64(s18, 0x1500000003)
			fn_149678(0x100156086 /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x10015ab10, 0x10015ab48)
		}
	} else {
		bz = 0x400
		const bu = ld64(l + 0x30)
		if (bu > 0xffffffff) {
			fn_83078(j)
			st64(s18, 0x1500000003)
			fn_149678(0x100156086 /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x10015ab10, 0x10015ab48)
		}
		const bv = ld64(l + 0x28)
		st32(k + 1, bu)
		let bw = 5
		st64(s18 + 0x10, 5)
		if (bu >= 0x3fc) {
			fn_1370d8(s18, 5, bu, aq, ar)
			bz = ld64(s18)
			k = ld64(s18 + 8)
			bw = ld64(s18 + 0x10)
		}
		j = memcpy(k + bw, bv, bu)
		bx = bw + bu
		st64(s18 + 0x10, bx)
		l = ld64(s38)
		by = ld64(l + 0x18)
		if (by > 0xffffffff) {
			if (bz == 0) {
				st64(s18, 0x1500000003)
				fn_149678(0x100156086 /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x10015ab10, 0x10015ab48)
			}
			fn_83078(j)
			st64(s18, 0x1500000003)
			fn_149678(0x100156086 /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x10015ab10, 0x10015ab48)
		}
	}
	const ca = ld64(l + 0x10)
	if (3 >= bz - bx) {
		fn_1370d8(s18, bx, 4, aq, ar)
		k = ld64(s18 + 8)
		bz = ld64(s18)
		bx = ld64(s18 + 0x10)
	}
	st32(k + bx, by)
	let cb = bx + 4
	st64(s18 + 0x10, cb)
	if (by > bz - cb) {
		fn_1370d8(s18, cb, by, aq, ar)
		cf = ld64(s18 + 8)
		cb = ld64(s18 + 0x10)
		k = cf
	} else {
		cf = ld64(s18 + 8)
	}
	memcpy(k + cb, ca, by)
	const cc = ld64(s18)
	if (cc == 0x8000000000000000) {
		st64(s18, cf)
		fn_149678(0x100156086 /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x10015ab10, 0x10015ab48)
	}
	const ce = cb + by
	let cd = ld64(s30 + 0x10)
	if (ce > ld64(s30) - cd) {
		fn_1370d8(s30, cd, ce)
		cd = ld64(s30 + 0x10)
	}
	bq = memcpy(ld64(s30 + 8) + cd, cf, ce)
	st64(s30 + 0x10, cd + ce)
	h = ld64(s40)
	if (cc == 0) {
		st64(h + 0x10, ld64(s30 + 0x10))
		st64(h + 8, ld64(s30 + 8))
		st64(h, ld64(s30))
		return bq
	}
	bq = fn_83078(bq)
	st64(h + 0x10, ld64(s30 + 0x10))
	st64(h + 8, ld64(s30 + 8))
	st64(h, ld64(s30))
	return bq
}

// types [heur]: d: OpenPositionWithTokenExtensionsAccounts (every call passes one: fn_35098)
export function fn_70d88(a: u64, b: u64, c: u64, d: OpenPositionWithTokenExtensionsAccounts, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s10 = fp - 0x10, s18 = fp - 0x18, s40 = fp - 0x40, s48 = fp - 0x48, s70 = fp - 0x70, s78 = fp - 0x78, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sd0 = fp - 0xd0, sd8 = fp - 0xd8, s100 = fp - 0x100, s108 = fp - 0x108, s130 = fp - 0x130, s138 = fp - 0x138, s160 = fp - 0x160, s178 = fp - 0x178, s188 = fp - 0x188
	const f: AccountInfo = ld64(p8)
	const g: LamportsCell = f.lamports
	const h = f.key
	rc_inc(g)
	const i: DataCell = f.data
	let bs = p7
	let br = p6
	const r = p5
	rc_inc(i)
	const funder: AccountInfo = d.funder
	const k: LamportsCell = funder.lamports
	const bm = f.executable
	const bn = f.is_writable
	const bo = f.is_signer
	const bp = f.rent_epoch
	const bq = f.owner
	const m = funder.key
	rc_inc(k)
	const l: DataCell = funder.data
	rc_inc(l)
	const n: AccountInfo = ld64(b)
	const o: LamportsCell = n.lamports
	const bh = funder.executable
	const bi = funder.is_writable
	const bj = funder.is_signer
	const bk = funder.rent_epoch
	const bl = funder.owner
	const q = n.key
	rc_inc(o)
	const p: DataCell = n.data
	rc_inc(p)
	const s: AccountInfo = ld64(r)
	const t: LamportsCell = s.lamports
	const bc = n.executable
	const bd = n.is_writable
	const be = n.is_signer
	const bf = n.rent_epoch
	const bg = n.owner
	const bt = s.key
	rc_inc(t)
	const u: DataCell = s.data
	rc_inc(u)
	const v: AccountInfo = ld64(c)
	const w: LamportsCell = v.lamports
	const ax = s.executable
	const ay = s.is_writable
	const az = s.is_signer
	const ba = s.rent_epoch
	const bb = s.owner
	const aw = v.key
	rc_inc(w)
	const x: DataCell = v.data
	rc_inc(x)
	const y: AccountInfo = ld64(bs)
	const z: LamportsCell = y.lamports
	const ar = v.executable
	const at = v.is_writable
	const au = v.is_signer
	const av = v.rent_epoch
	bs = v.owner
	const ad = y.key
	rc_inc(z)
	const aa: DataCell = y.data
	rc_inc(aa)
	const ab: AccountInfo = ld64(br)
	const ac: LamportsCell = ab.lamports
	br = k
	const an = y.executable
	const ao = y.is_writable
	const ap = y.is_signer
	const aq = y.rent_epoch
	const af = y.owner
	const ak = ab.key
	rc_inc(ac)
	const ae: DataCell = ab.data
	rc_inc(ae)
	const aj = ab.owner
	const ai = ab.rent_epoch
	const ah = ab.is_signer
	const ag = ab.is_writable
	st8(s18 + 2, ab.executable)
	st8(s18, ah, ag)
	st64(s40, ak, ac, ae, aj, ai)
	st8(s48, ap, ao, an)
	st64(s70, ad, z, aa, af, aq)
	st8(s78, au, at, ar)
	st64(sa0, aw, w, x, bs, av)
	st8(sa8, az, ay, ax)
	st64(sd0, bt, t, u, bb, ba)
	st8(sd8, be, bd, bc)
	st64(s100, q, o, p, bg, bf)
	st8(s108, bj, bi, bh)
	st64(s130, m, br, l, bl, bk)
	st8(s138, bo, bn, bm)
	st64(s160, h, g, i, bq, bp)
	st64(s10, 8, 0)
	st64(s178, 0, 8, 0)
	const am = associated_token_create(s188, s178)
	const al = ld64(s188)
	st64(a + 8, ld64(s188 + 8))
	st64(a, al)
	return am
}

export function fn_718c8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s30 = fp - 0x30, s48 = fp - 0x48, s78 = fp - 0x78, s90 = fp - 0x90, s98 = fp - 0x98, sb0 = fp - 0xb0, sb8 = fp - 0xb8, se0 = fp - 0xe0, se8 = fp - 0xe8, s110 = fp - 0x110, s118 = fp - 0x118, s140 = fp - 0x140, s148 = fp - 0x148, s150 = fp - 0x150, s168 = fp - 0x168, s170 = fp - 0x170, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1000 = fp - 0x1000
	let bc, bj, bk, bz, ca: u64
	const f = ld64(c)
	const g = ld64(f + 8)
	const h: AccountInfo = ld64(p5)
	const j = ld64(f)
	let ek = h.key
	let ei = g
	rc_inc(g)
	const i = ld64(f + 0x10)
	let ej = j
	let el: AccountInfo = f
	const eb = p7
	const ec = p6
	let eh = i
	rc_inc(i)
	const k = ld64(d)
	const l = ld64(k + 8)
	const u = ld64(k)
	rc_inc(l)
	const m = ld64(k + 0x10)
	let ea = k
	rc_inc(m)
	const n: AccountInfo = ld64(b)
	const o: LamportsCell = n.lamports
	let en = o
	const t = n.key
	rc_inc(o)
	const p: DataCell = n.data
	let em = p
	let eg = l
	let aa = a
	rc_inc(p)
	const q: LamportsCell = n.lamports
	const s = n.key
	rc_inc(q)
	const r: DataCell = n.data
	let ee = q
	let ef = m
	rc_inc(r)
	st64(s30, s)
	st64(s1000, t, s30, 1, 1)
	fn_1300e0(s170, ek, ej, u, t, s30, 1, 1)
	copy(s188, s168, 0x18)
	const v = ld64(s170)
	let ed = r
	if (v == 0x8000000000000000) {
		fn_13b430(s1c8, s188)
		bj = ld64(s1c8 + 8)
		bk = ld64(s1c8)
	} else {
		memcpy(s78, s150, 0x30)
		st64(s98, v)
		copy(s90, s188, 0x18)
		const w: LamportsCell = el.lamports
		const x: AccountInfo = el
		const z = el.key
		rc_inc(w)
		const y: DataCell = x.data
		ej = z
		const ab: AccountInfo = ea
		rc_inc(y)
		const ae = aa
		let dy = y
		const ac: LamportsCell = ab.lamports
		let dz = ac
		let ds = ab.key
		let dt = el.executable
		let du = el.is_writable
		let dv = el.is_signer
		let dw = el.rent_epoch
		let dx = el.owner
		rc_inc(ac)
		const ad: DataCell = ab.data
		rc_inc(ad)
		const af: LamportsCell = n.lamports
		let dr = w
		const dl = n.key
		const dm = ab.executable
		const dn = ab.is_writable
		const dp = ab.is_signer
		const dq = ab.rent_epoch
		const ai = ab.owner
		rc_inc(af)
		const ag: DataCell = n.data
		rc_inc(ag)
		const ah: LamportsCell = h.lamports
		const df = h.key
		const dg = n.executable
		const dh = n.is_writable
		const di = n.is_signer
		const dj = n.rent_epoch
		const dk = n.owner
		rc_inc(ah)
		const aj: DataCell = h.data
		ea = ae
		rc_inc(aj)
		const an = h.owner
		const am = h.rent_epoch
		const al = h.is_signer
		const ak = h.is_writable
		st8(sb8 + 2, h.executable)
		st8(sb8, al, ak)
		st64(se0, df, ah, aj, an, am)
		st8(se8, di, dh, dg)
		st64(s110, dl, af, ag, dk, dj)
		st8(s118, dp, dn, dm)
		st64(s140, ds, dz, ad, ai, dq)
		st8(s148, dv, du, dt)
		st64(s170, ej, dr, dy, dx, dw)
		st64(s28, ec, eb)
		st64(s1000, s28, 1)
		const ao = fn_1390d8(sb0, s98, s170, 4, fp)
		if (ld64(sb0) == 0x800000000000001a /* Ok */) {
			ptr_drop_in_place_c1b0(s170, ao)
			const ap = ee
			const bp = ea
			const av = ef
			const at = em
			const ar = en
			if (rc_release(ee)) {
				st64(ap + 8, ld64(ap + 8) - 1)
			}
			const aq = ed
			const ay: AccountInfo = el
			const au = eg
			if (rc_release(ed)) {
				st64(aq + 8, ld64(aq + 8) - 1)
			}
			rc_dec(ar)
			rc_dec(at)
			rc_dec(au)
			rc_dec(av)
			const aw = ei
			if (rc_release(ei)) {
				st64(aw + 8, ld64(aw + 8) - 1)
			}
			const ax = eh
			if (rc_release(eh)) {
				st64(ax + 8, ld64(ax + 8) - 1)
			}
			const az: LamportsCell = ay.lamports
			const bm = ay.key
			rc_inc(az)
			const bl: DataCell = ay.data
			rc_inc(bl)
			ej = bm
			const bn: LamportsCell = n.lamports
			const bt = n.key
			ei = bn
			rc_inc(bn)
			const bo: DataCell = n.data
			eh = bo
			rc_inc(bo)
			const bq: LamportsCell = n.lamports
			en = bq
			const bs = n.key
			rc_inc(bq)
			const br: DataCell = n.data
			em = br
			aa = bp
			ef = az
			eg = bl
			rc_inc(br)
			st64(s30, bs)
			st64(s1000, 0, bt, s30, 1)
			fn_12fa60(s170, ek, ej, 0, 0, bt, s30, 1)
			copy(s48, s168, 0x18)
			const bu = ld64(s170)
			if (bu == 0x8000000000000000) {
				bc = fn_13b430(s1b8, s48)
				bj = ld64(s1b8 + 8)
				bk = ld64(s1b8)
				ca = eg
				bz = ef
			} else {
				memcpy(s78, s150, 0x30)
				st64(s98, bu)
				copy(s90, s48, 0x18)
				const cb: LamportsCell = ay.lamports
				const cg = ay.key
				rc_inc(cb)
				const cc: DataCell = ay.data
				rc_inc(cc)
				const cd: LamportsCell = n.lamports
				dz = n.key
				ed = ay.executable
				ee = ay.is_writable
				ej = ay.is_signer
				ek = ay.rent_epoch
				const ch = ay.owner
				rc_inc(cd)
				const ce: DataCell = n.data
				el = cc
				rc_inc(ce)
				dx = cd
				const cf: LamportsCell = h.lamports
				dy = cg
				ds = h.key
				dt = n.executable
				du = n.is_writable
				dv = n.is_signer
				dw = n.rent_epoch
				const cm = n.owner
				rc_inc(cf)
				dr = ch
				const ci: DataCell = h.data
				rc_inc(ci)
				const cl = h.owner
				const ck = h.rent_epoch
				bj = h.is_signer
				const cj = h.is_writable
				st8(se8 + 2, h.executable)
				st8(se8, bj, cj)
				st64(s110, ds, cf, ci, cl, ck)
				st8(s118, dv, du, dt)
				st64(s140, dz, dx, ce, cm, dw)
				st8(s148, ej, ee, ed)
				st64(s170, dy, cb, el, dr, ek)
				st64(s28, ec, eb)
				st64(s1000, s28, 1)
				bc = fn_1390d8(sb0, s98, s170, 3, fp)
				if (ld64(sb0) == 0x800000000000001a /* Ok */) {
					const co = ld64(s168 + 8)
					const cn = ld64(s168)
					aa = ea
					const cx = ef
					rc_dec(cn)
					const cy = eg
					rc_dec(co)
					const cq = ld64(s140 + 0x10)
					const cp = ld64(s140 + 8)
					rc_dec(cp)
					rc_dec(cq)
					const cs = ld64(s110 + 0x10)
					const cr = ld64(s110 + 8)
					rc_dec(cr)
					rc_dec(cs)
					const ct = en
					const cu = em
					if (rc_release(en)) {
						st64(ct + 8, ld64(ct + 8) - 1)
					}
					rc_dec(cu)
					const cv = ei
					if (rc_release(ei)) {
						st64(cv + 8, ld64(cv + 8) - 1)
					}
					const cw = eh
					if (rc_release(eh)) {
						st64(cw + 8, ld64(cw + 8) - 1)
					}
					rc_dec(cx)
					if (!rc_release(cy)) {
						st64(aa + 8, bj)
						st64(aa, 2)
						return bc
					}
					st64(cy + 8, ld64(cy + 8) - 1)
					st64(aa + 8, bj)
					st64(aa, 2)
					return bc
				}
				copyr(s18, sb0, 0x18)
				bc = fn_13b430(s1a8, s18)
				bj = ld64(s1a8 + 8)
				bk = ld64(s1a8)
				const da = ld64(s168 + 8)
				const cz = ld64(s168)
				aa = ea
				bz = ef
				rc_dec(cz)
				ca = eg
				rc_dec(da)
				const dc = ld64(s140 + 0x10)
				const db = ld64(s140 + 8)
				rc_dec(db)
				rc_dec(dc)
				const de = ld64(s110 + 0x10)
				const dd = ld64(s110 + 8)
				rc_dec(dd)
				rc_dec(de)
			}
			const bw = em
			const bv = en
			if (rc_release(en)) {
				st64(bv + 8, ld64(bv + 8) - 1)
			}
			rc_dec(bw)
			const bx = ei
			if (rc_release(ei)) {
				st64(bx + 8, ld64(bx + 8) - 1)
			}
			const by = eh
			if (rc_release(eh)) {
				st64(by + 8, ld64(by + 8) - 1)
			}
			rc_dec(bz)
			if (!rc_release(ca)) {
				st64(aa + 8, bj)
				st64(aa, bk)
				return bc
			}
			st64(ca + 8, ld64(ca + 8) - 1)
			st64(aa + 8, bj)
			st64(aa, bk)
			return bc
		}
		copyr(s18, sb0, 0x18)
		const ba = fn_13b430(s198, s18)
		bj = ld64(s198 + 8)
		bk = ld64(s198)
		ptr_drop_in_place_c1b0(s170, ba)
		aa = ea
	}
	const bg = ef
	const be = em
	const bd = en
	const bb = ee
	const bf = eg
	if (rc_release(ee)) {
		st64(bb + 8, ld64(bb + 8) - 1)
	}
	bc = ed
	if (rc_release(ed)) {
		st64(bc + 8, ld64(bc + 8) - 1)
	}
	rc_dec(bd)
	rc_dec(be)
	rc_dec(bf)
	rc_dec(bg)
	const bh = ei
	if (rc_release(ei)) {
		st64(bh + 8, ld64(bh + 8) - 1)
	}
	const bi = eh
	if (!rc_release(eh)) {
		st64(aa + 8, bj)
		st64(aa, bk)
		return bc
	}
	st64(bi + 8, ld64(bi + 8) - 1)
	st64(aa + 8, bj)
	st64(aa, bk)
	return bc
}

export function fn_1300e0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s80 = fp - 0x80
	let l, m, w, x, y: u64
	const f = memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20)
	const g = p8
	const i = p7
	let o = p6
	const h = p5
	if ((f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	st64(s50 + 8, g)
	st32(s50, 7)
	const n = fn_12e9c0(s80, s50)
	let j = i + 3
	if (j == 0) {
		st64(s68, 0, 1, 0)
		copyr(s50, c, 0x20)
		fn_12d0a0(s68, c, n)
		m = undef
		j = ld64(s68)
		l = ld64(s68 + 8)
	} else {
		const k = j
		if (j > 0x3c3c3c3c3c3c3c3) {
			raw_vec_handle_error(0, k * 0x22, w, x, y)
		}
		l = __rust_alloc(k * 0x22, 1)
		if (l == 0) {
			raw_vec_handle_error(1, k * 0x22, w, x, y)
		}
		st64(s68, j, l)
		m = c
		copyr(s50, c, 0x20)
	}
	st64(l + 0x18, ld64(s38))
	st64(l + 0x10, ld64(s40))
	st64(l + 8, ld64(s50 + 8))
	st64(l, ld64(s50))
	st16(l + 0x20, 0x100)
	st64(s68 + 0x10, 1)
	if (j == 1) {
		fn_12d0a0(s68, m, l)
		j = ld64(s68)
		l = ld64(s68 + 8)
	}
	let v = b
	st64(l + 0x3a, ld64(d + 0x18))
	st64(l + 0x32, ld64(d + 0x10))
	st64(l + 0x2a, ld64(d + 8))
	st64(l + 0x22, ld64(d))
	st16(l + 0x42, 0x100)
	st64(s68 + 0x10, 2)
	if (j == 2) {
		fn_12d0a0(s68, d, l)
		v = b
		l = ld64(s68 + 8)
	}
	st64(l + 0x5c, ld64(h + 0x18))
	st64(l + 0x54, ld64(h + 0x10))
	st64(l + 0x4c, ld64(h + 8))
	st64(l + 0x44, ld64(h))
	st8(l + 0x64, i == 0, 0)
	st64(s68 + 0x10, 3)
	if (i != 0) {
		let r = 3
		let p = 0
		let s = i << 3
		do {
			const t = ld64(o)
			copyr(s40, t + 0x10, 0x10)
			const u = ld64(t + 8)
			st64(s50 + 8, u)
			st64(s50, ld64(t))
			if (r == ld64(s68)) {
				fn_12d0a0(s68, u, l)
				v = b
				l = ld64(s68 + 8)
			}
			o = o + 8
			const q = l + p
			st64(q + 0x7e, ld64(s38))
			st64(q + 0x76, ld64(s40))
			st64(q + 0x6e, ld64(s50 + 8))
			st64(q + 0x66, ld64(s50))
			st16(q + 0x86, 1)
			p = p + 0x22
			r = r + 1
			st64(s68 + 0x10, r)
			s = s - 8
		} while (s != 0)
	}
	copyr(s20, v, 0x20)
	copy(s50, s68, 0x18)
	copy(s38, s80, 0x18)
	memcpy(a, s50, 0x50)
}

export function fn_12fa60(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s80 = fp - 0x80, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sa0 = fp - 0xa0
	let l, m, w, x, y: u64
	let aa = ld64(sa0)
	let ab = ld64(s98)
	let ac = ld64(s90)
	let ad = ld64(s88)
	const f = memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20)
	const i = p8
	let o = p7
	const z = p6
	const h = p5
	if ((f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	let g = 0
	if (d != 0) {
		ad = ld64(d + 0x18)
		ac = ld64(d + 0x10)
		ab = ld64(d + 8)
		aa = ld64(d)
		g = 1
	}
	st32(s50 + 0xc, g)
	st8(s50 + 8, h)
	st64(s40, aa, ab, ac, ad)
	st32(s50, 6)
	const n = fn_12e9c0(s80, s50)
	let j = i + 3
	if (j == 0) {
		st64(s68, 0, 1, 0)
		copyr(s50, c, 0x20)
		fn_12d0a0(s68, c, n)
		m = undef
		j = ld64(s68)
		l = ld64(s68 + 8)
	} else {
		const k = j
		if (j > 0x3c3c3c3c3c3c3c3) {
			raw_vec_handle_error(0, k * 0x22, w, x, y)
		}
		l = __rust_alloc(k * 0x22, 1)
		if (l == 0) {
			raw_vec_handle_error(1, k * 0x22, w, x, y)
		}
		st64(s68, j, l)
		m = c
		copyr(s50, c, 0x20)
	}
	let v = b
	st64(l + 0x18, ld64(s38))
	st64(l + 0x10, ld64(s40))
	st64(l + 8, ld64(s50 + 8))
	st64(l, ld64(s50))
	st16(l + 0x20, 0x100)
	st64(s68 + 0x10, 1)
	if (j == 1) {
		fn_12d0a0(s68, m, l)
		v = b
		l = ld64(s68 + 8)
	}
	st64(l + 0x3a, ld64(z + 0x18))
	st64(l + 0x32, ld64(z + 0x10))
	st64(l + 0x2a, ld64(z + 8))
	st64(l + 0x22, ld64(z))
	st8(l + 0x42, i == 0, 0)
	st64(s68 + 0x10, 2)
	if (i != 0) {
		let r = 2
		let p = 0
		let s = i << 3
		do {
			const t = ld64(o)
			copyr(s40, t + 0x10, 0x10)
			const u = ld64(t + 8)
			st64(s50 + 8, u)
			st64(s50, ld64(t))
			if (r == ld64(s68)) {
				fn_12d0a0(s68, u, l)
				v = b
				l = ld64(s68 + 8)
			}
			o = o + 8
			const q = l + p
			st64(q + 0x5c, ld64(s38))
			st64(q + 0x54, ld64(s40))
			st64(q + 0x4c, ld64(s50 + 8))
			st64(q + 0x44, ld64(s50))
			st16(q + 0x64, 1)
			p = p + 0x22
			r = r + 1
			st64(s68 + 0x10, r)
			s = s - 8
		} while (s != 0)
	}
	copyr(s20, v, 0x20)
	copy(s50, s68, 0x18)
	copy(s38, s80, 0x18)
	memcpy(a, s50, 0x50)
}
