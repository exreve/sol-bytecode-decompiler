/// <reference path="../lib.d.ts" />
// instruction initialize_pool_with_adaptive_fee
import { fn_1110, fn_143100, fn_147e78, fn_149678, fn_14c5c0, fn_14f7f8, fn_258, fn_3aa0, fn_5db48, fn_6aa0, fn_78f88, fn_80ca8, fn_81d00, fn_82008, fn_88db0, log_data, memcpy } from '../shared.ts'

// instruction handler: initialize_pool_with_adaptive_fee (discriminator sha256("global:initialize_pool_with_adaptive_fee")[..8] = 0xc7777cac4c605e8f)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, token_mint_a, token_mint_b, token_badge_a, token_badge_b, token_vault_a, rent, whirlpool, oracle, funder, adaptive_fee_tier, token_program_b, token_program_a, token_vault_b, initialize_pool_authority, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool, oracle
export function ix_initialize_pool_with_adaptive_fee(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s10 = fp - 0x10, s90 = fp - 0x90, s98 = fp - 0x98, sa8 = fp - 0xa8, s128 = fp - 0x128, s140 = fp - 0x140, s144 = fp - 0x144, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1d0 = fp - 0x1d0, s1000 = fp - 0x1000
	let m, p, s, t, u, v, w: u64
	B12: {
		B11: {
			let x = ld64(s1d0)
			sol_log("Instruction: InitializePoolWithAdaptiveFee", 0x2a)
			const f = ix_args_len
			if (f >= 0x10 && f != 0x10) {
				const g = ix_args
				const j = ld64(g + 8)
				const i = ld64(g)
				let h = ld8(g + 0x10)
				st8(s144, h)
				if (h != 0) {
					if (h != 1) {
						st64(sa8, 0x1001596d8)
						st64(s98, s10)
						st64(s10, s144, fn_14ef78)
						st64(s90 + 8, 0)
						st64(sa8 + 8, 2)
						st64(s90, 1)
						// fmt "Invalid Option representation: {}. The first byte must be 0 or 1" {} = h [fn_14ef78]
						fn_147e78(s140, sa8, j, i)
						p = fn_b580(s140)
						break B12
					}
					if (9 > f - 0x10) {
						break B11
					}
					h = 1
					x = ld64(g + 0x11)
				}
				st32(s144, -1)
				st64(s10, accounts, accounts_len)
				st64(s1000 + 8, s144)
				w = accounts_initialize_pool_with_adaptive_fee(sa8, program_id, s10, i, fp)
				const k = ld64(sa8)
				if (k == 0) {
					m = ld64(sa8 + 8)
					st64(a + 8, ld64(s98))
					st64(a, m)
					return w
				}
				const y = ld64(sa8 + 8)
				const l = ld64(s98)
				memcpy(s128, s90, 0x80)
				st64(s140, k, y, l)
				st32(s90 + 8, ld32(s144))
				copyr(s98, s10, 0x10)
				st64(sa8, program_id, s140)
				st64(s1000, h, x)
				w = fn_43888(s158, sa8, i, j, h, x)
				m = ld64(s158)
				if (m == 2) {
					fn_6aa0(s168, ld64(s128 + 0x20), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
					const n = ld64(s168)
					if (n != 2) {
						w = Error_with_account_name(s178, n, ld64(s168 + 8), 0x100152b28 /* "whirlpool" */, 9)
						m = ld64(s178)
						st64(a + 8, ld64(s178 + 8))
						st64(a, m)
						return w
					}
					w = fn_258(s188, ld64(s128 + 0x28), program_id)
					const o = ld64(s188)
					v = a
					if (o == 2) {
						st64(v + 8, undef)
						st64(v, 2)
						return w
					}
					w = Error_with_account_name(s198, o, ld64(s188 + 8), 0x100154c38 /* "oracle" */, 6)
					m = ld64(s198)
					st64(v + 8, ld64(s198 + 8))
					st64(v, m)
					return w
				}
				st64(a + 8, ld64(s158 + 8))
				st64(a, m)
				return w
			}
		}
		p = fn_1459d0(0x100159468)
	}
	const q = p
	v = a
	if (2 > (p & 3) - 2) {
		w = anchor_error_from(s1a8, 0x66 /* anchor::InstructionDidNotDeserialize */, s, t, u)
		m = ld64(s1a8)
		st64(v + 8, ld64(s1a8 + 8))
		st64(v, m)
		return w
	}
	if ((q & 3) == 0) {
		w = anchor_error_from(s1a8, 0x66 /* anchor::InstructionDidNotDeserialize */, s, t, u)
		m = ld64(s1a8)
		st64(v + 8, ld64(s1a8 + 8))
		st64(v, m)
		return w
	}
	const r = ld64(ld64(p + 7))
	callx(r, ld64(p - 1), r)
	w = anchor_error_from(s1a8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	m = ld64(s1a8)
	st64(v + 8, ld64(s1a8 + 8))
	st64(v, m)
	return w
}

// Anchor Accounts::try_accounts of instruction initialize_pool_with_adaptive_fee (called by ix_initialize_pool_with_adaptive_fee; name [str]: from the handler's "Instruction: …" log; was fn_f8250)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, token_mint_a, token_mint_b, token_badge_a (AccountNotEnoughKeys, ConstraintSeeds), token_badge_b (ConstraintSeeds), token_vault_a (ConstraintMut), rent, whirlpool (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), oracle (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), funder (ConstraintMut), adaptive_fee_tier (ConstraintHasOne), token_program_b (ConstraintAddress), token_program_a (ConstraintAddress), token_vault_b (ConstraintMut), initialize_pool_authority (ConstraintRaw), system_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: token_mint_a_box, token_mint_b_box, whirlpool
export function accounts_initialize_pool_with_adaptive_fee(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s40 = fp - 0x40, s58 = fp - 0x58, s60 = fp - 0x60, s78 = fp - 0x78, s80 = fp - 0x80, sa0 = fp - 0xa0, sc0 = fp - 0xc0, se0 = fp - 0xe0, s100 = fp - 0x100, s130 = fp - 0x130, s131 = fp - 0x131, s158 = fp - 0x158, s170 = fp - 0x170, s188 = fp - 0x188, s189 = fp - 0x189, s1b0 = fp - 0x1b0, s1c8 = fp - 0x1c8, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8, s200 = fp - 0x200, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s598 = fp - 0x598, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s620 = fp - 0x620, s628 = fp - 0x628, s630 = fp - 0x630, s638 = fp - 0x638, s640 = fp - 0x640, s648 = fp - 0x648, s650 = fp - 0x650
	let m, n, p, r, bb, bu, cj: u64
	st64(s208, b)
	try_accounts_11de0(s80, c, c, d, e)
	if (ld64(s80) == 0) {
		cj = Error_with_account_name(s5b8, ld64(s78), ld64(s78 + 8), "whirlpools_config", 0x11)
		bb = ld64(s5b8)
		st64(a + 0x10, ld64(s5b8 + 8))
		st64(a + 8, bb)
		st64(a, 0)
		return cj
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x70) & -8 : 0x300007f90
	if (g > 0x300000007) {
		st64(s620 + 0x60, ld64(e - 0xff8))
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, s80, 0x70)
		try_accounts_610(s80, c)
		if (ld32(s80) == 2) {
			cj = Error_with_account_name(s5a8, ld64(s78), ld64(s78 + 8), "token_mint_a", 0xc)
			bb = ld64(s5a8)
			st64(a + 0x10, ld64(s5a8 + 8))
			st64(a + 8, bb)
			st64(a, 0)
			return cj
		}
		const h = ld64(0x300000000 /* heap bump-allocator cursor */)
		const token_mint_a_box: Mint = h != 0 ? sat_sub(h, 0x80) & -8 : 0x300007f80
		if (token_mint_a_box > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, token_mint_a_box)
			st64(s620 + 0x58, token_mint_a_box)
			memcpy(token_mint_a_box, s80, 0x80)
			try_accounts_610(s80, c)
			if (ld32(s80) == 2) {
				cj = Error_with_account_name(s598, ld64(s78), ld64(s78 + 8), "token_mint_b", 0xc)
				bb = ld64(s598)
				st64(a + 0x10, ld64(s598 + 8))
				st64(a + 8, bb)
				st64(a, 0)
				return cj
			}
			const j = ld64(0x300000000 /* heap bump-allocator cursor */)
			const token_mint_b_box: Mint = j != 0 ? sat_sub(j, 0x80) & -8 : 0x300007f80
			if (token_mint_b_box > 0x300000007) {
				B17: {
					st64(0x300000000 /* heap bump-allocator cursor */, token_mint_b_box)
					memcpy(token_mint_b_box, s80, 0x80)
					const l = ld64(c + 8)
					if (l != 0) {
						p = ld64(c)
						st64(c, p + 0x30, l - 1)
						if (l != 1) {
							st64(s620 + 0x50, p)
							st64(c + 8, l - 2)
							r = ld64(c)
							st64(c, r + 0x30)
							break B17
						}
					} else {
						anchor_error_from(s218, 0xbbd /* anchor::AccountNotEnoughKeys */, undef, m, n)
						p = ld64(s218 + 8)
						const o = ld64(s218)
						if (o != 2) {
							cj = Error_with_account_name(s228, o, p, "token_badge_a", 0xd)
							bb = ld64(s228)
							st64(a + 0x10, ld64(s228 + 8))
							st64(a + 8, bb)
							st64(a, 0)
							return cj
						}
					}
					st64(s620 + 0x50, p)
					anchor_error_from(s238, 0xbbd /* anchor::AccountNotEnoughKeys */, p, m, n)
					r = ld64(s238 + 8)
					const q = ld64(s238)
					if (q != 2) {
						cj = Error_with_account_name(s248, q, r, "token_badge_b", 0xd)
						bb = ld64(s248)
						st64(a + 0x10, ld64(s248 + 8))
						st64(a + 8, bb)
						st64(a, 0)
						return cj
					}
				}
				st64(s620 + 0x48, r)
				try_accounts_11718(s80, c, r, m, n)
				const t = ld64(s78)
				const s = ld64(s80)
				if (s == 2) {
					st64(s200, t)
					try_accounts_11718(s80, c, t)
					const x = ld64(s78)
					const u = ld64(s80)
					if (u == 2) {
						const v = ld64(c + 8)
						if (v == 0) {
							cj = anchor_error_from(s588, 0xbbd /* anchor::AccountNotEnoughKeys */, x)
							bb = ld64(s588)
							st64(a + 0x10, ld64(s588 + 8))
							st64(a + 8, bb)
							st64(a, 0)
							return cj
						}
						const w: AccountInfo = ld64(c)
						st64(s1f8, w)
						st64(c + 8, v - 1)
						st64(c, w + 0x30)
						if (v != 1) {
							st64(s620 + 0x40, x)
							st64(s1f0, w + 0x30)
							st64(c + 8, v - 2)
							st64(c, w + 0x60)
							try_accounts_11718(s80, c, x, v - 1, w + 0x30)
							const z = ld64(s78)
							const y = ld64(s80)
							if (y != 2) {
								cj = Error_with_account_name(s278, y, z, "token_vault_a", 0xd)
								bb = ld64(s278)
								st64(a + 0x10, ld64(s278 + 8))
								st64(a + 8, bb)
								st64(a, 0)
								return cj
							}
							st64(s620 + 0x38, z)
							try_accounts_11718(s80, c, z)
							const ab = ld64(s78)
							const aa = ld64(s80)
							if (aa == 2) {
								st64(s620 + 0x30, ab)
								fn_23b8(s80, c, ab)
								const ad = ld64(s78)
								const ac = ld64(s80)
								if (ac == 2) {
									st64(s620 + 0x28, ad)
									try_accounts_120(s80, c, ad)
									const af = ld64(s78)
									const ae = ld64(s80)
									if (ae == 2) {
										st64(s620 + 0x20, af)
										try_accounts_120(s80, c, af)
										const ah = ld64(s78)
										const ag = ld64(s80)
										if (ag == 2) {
											st64(s620 + 0x18, ah)
											fn_122e8(s80, c, ah)
											const aj = ld64(s78)
											const ai = ld64(s80)
											if (ai == 2) {
												st64(s1e8, aj)
												try_accounts_11990(s80, c, aj)
												const am = ld64(s78 + 8)
												const al = ld64(s78)
												const ak = ld64(s80)
												if (ak == 0) {
													cj = Error_with_account_name(s568, al, am, 0x100152d60 /* "rent" */, 4)
													bb = ld64(s568)
													st64(a + 0x10, ld64(s568 + 8))
													st64(a + 8, bb)
													st64(a, 0)
													return cj
												}
												st64(s620, ak, al, am)
												st64(s628, ld64(s78 + 0x10))
												rent_get(s80)
												copy(s1c8, s78, 0x18)
												if (ld64(s80) == 0) {
													copyr(s1e0, s1c8, 0x18)
													const an = ld64(ld64(g))
													copyr(se0, an, 0x20)
													const ao = ld64(ld64(ld64(s620 + 0x58) + 0x58))
													copyr(sc0, ao, 0x20)
													const ap = token_mint_b_box.info.key
													copyr(sa0, ap, 0x20)
													const aq = ld16(ld64(s620 + 0x28) + 0x70)
													st64(s40, s100)
													st64(s58 + 8, sa0)
													st64(s60, sc0)
													st64(s78 + 8, se0)
													st64(s80, 0x100152b28)
													st16(s100, aq)
													st64(s40 + 8, 2)
													st64(s58 + 0x10, 0x20)
													st64(s58, 0x20)
													st64(s78 + 0x10, 0x20)
													st64(s78, 9)
													// PDA find_program_address(["whirlpool", *an, *ao, *ap, u16 aq], program *(ld64(s208)))
													Pubkey_find_program_address(s130, s80, 5, ld64(s208))
													copyr(s1b0, s130, 0x20)
													const ar = ld8(s130 + 0x20)
													st8(s189, ar)
													st8(ld64(s620 + 0x60) + 2, ar)
													const at = ld64(ld64(s1f8))
													copy(s80, at, 0x20)
													if ((memcmp(s80, s1b0, 0x20) as u32) == 0) {
														st64(s40, s189, s208)
														st64(s58 + 0x10, ld64(s620 + 0x28))
														st64(s58 + 8, token_mint_b_box)
														st64(s58, ld64(s620 + 0x58))
														st64(s80, s1f8, s1e0, s200, s1e8, g)
														cj = fn_fb520(s130, s80)
														st64(s630, ld64(s130 + 8))
														bb = ld64(s130)
														if (bb == 2) {
															const whirlpool: AccountInfo = ld64(ld64(s630))
															if (whirlpool.is_writable == 0) {
																anchor_error_from(s548, 0x7d0 /* anchor::ConstraintMut */)
																cj = Error_with_account_name(s558, ld64(s548), ld64(s548 + 8), 0x100152b28 /* "whirlpool" */, 9)
																bb = ld64(s558)
																st64(a + 0x10, ld64(s558 + 8))
																st64(a + 8, bb)
																st64(a, 0)
																return cj
															}
															AccountInfo_clone(s130, whirlpool)
															st64(s638, fn_143100(s130))
															AccountInfo_clone(s80, ld64(ld64(s630)))
															AccountInfo_try_data_len(sa0, s80)
															const be = ld64(sa0 + 8)
															const bd = ld64(sa0)
															if (bd != 0x800000000000001a /* Ok */) {
																st64(sa0 + 0x10, ld64(sa0 + 0x10))
																st64(sa0, bd, be)
																cj = fn_13b430(s318, sa0)
																const bq = ld64(s318)
																st64(a + 0x10, ld64(s318 + 8))
																st64(a + 8, bq)
																st64(a, 0)
																const bs = ld64(s78 + 8)
																const br = ld64(s78)
																rc_dec(br)
																rc_dec(bs)
																bu = ld64(s130 + 0x10)
																const bt = ld64(s130 + 8)
																rc_dec(bt)
																if (!rc_release(bu)) {
																	return cj
																}
																st64(bu + 8, ld64(bu + 8) - 1)
																return cj
															}
															const bf = __floatundidf(ld64(s1e0) * (be + 0x80))
															const bg = fn_14f7f8(ld64(s1e0 + 8), bf)
															st64(s640, 0)
															st64(s648, fn_151cb0(bg, 0))
															const bh = fn_14f3e8(bg)
															if ((ld64(s648) as i64) >= 0) {
																st64(s640, bh)
															}
															const bi = fn_151a40(bg, 0x43efffffffffffff)
															let bp = -1
															if (0 >= (bi as i64)) {
																bp = ld64(s640)
															}
															const bk = ld64(s78 + 8)
															const bj = ld64(s78)
															rc_dec(bj)
															rc_dec(bk)
															const bn = ld64(s130 + 0x10)
															const bl = ld64(s130 + 8)
															let bm = ld64(bl) - 1
															st64(bl, bm)
															if (bm == 0) {
																bm = ld64(bl + 8) - 1
																st64(bl + 8, bm)
															}
															let bo = ld64(bn) - 1
															st64(bn, bo)
															if (bo == 0) {
																bo = ld64(bn + 8) - 1
																st64(bn + 8, bo)
															}
															if (bp > ld64(s638)) {
																anchor_error_from(s528, 0x7d5 /* anchor::ConstraintRentExempt */, bo, bm)
																cj = Error_with_account_name(s538, ld64(s528), ld64(s528 + 8), 0x100152b28 /* "whirlpool" */, 9)
																bb = ld64(s538)
																st64(a + 0x10, ld64(s538 + 8))
																st64(a + 8, bb)
																st64(a, 0)
																return cj
															}
															rent_get(s80)
															copy(s170, s78, 0x18)
															if (ld64(s80) != 0) {
																cj = fn_13b430(s328, s170)
																bb = ld64(s328)
																st64(a + 0x10, ld64(s328 + 8))
																st64(a + 8, bb)
																st64(a, 0)
																return cj
															}
															copyr(s188, s170, 0x18)
															const bv = ld64(ld64(ld64(s630)))
															const bz = ld64(bv)
															const by = ld64(bv + 8)
															const bx = ld64(bv + 0x10)
															const bw = ld64(bv + 0x18)
															st64(sa0, 0x100154c38)
															st64(sa0 + 0x10, s130)
															st64(s130, bz, by, bx, bw)
															st64(sa0 + 8, 6)
															st64(sa0 + 0x18, 0x20)
															// PDA find_program_address(["oracle", *s130], program *(ld64(s208)))
															Pubkey_find_program_address(s80, sa0, 2, ld64(s208))
															copyr(s158, s80, 0x20)
															const ca = ld8(s60)
															st8(s131, ca)
															st8(ld64(s620 + 0x60) + 3, ca)
															const cb = ld64(ld64(s1f0))
															copy(s80, cb, 0x20)
															if ((memcmp(s80, s158, 0x20) as u32) == 0) {
																st64(s58, s131, s208)
																st64(s60, ld64(s630))
																st64(s80, s1f0, s188, s200, s1e8)
																cj = fn_fd368(s130, s80)
																st64(s638, ld64(s130 + 8))
																bb = ld64(s130)
																if (bb == 2) {
																	if (ld8(ld64(s638) + 0x29) == 0) {
																		anchor_error_from(s508, 0x7d0 /* anchor::ConstraintMut */)
																		cj = Error_with_account_name(s518, ld64(s508), ld64(s508 + 8), 0x100154c38 /* "oracle" */, 6)
																		bb = ld64(s518)
																		st64(a + 0x10, ld64(s518 + 8))
																		st64(a + 8, bb)
																		st64(a, 0)
																		return cj
																	}
																	AccountInfo_clone(s130, ld64(s638))
																	st64(s640, fn_143100(s130))
																	AccountInfo_clone(s80, ld64(s638))
																	AccountInfo_try_data_len(sa0, s80)
																	const cl = ld64(sa0 + 8)
																	const ck = ld64(sa0)
																	if (ck != 0x800000000000001a /* Ok */) {
																		st64(sa0 + 0x10, ld64(sa0 + 0x10))
																		st64(sa0, ck, cl)
																		cj = fn_13b430(s368, sa0)
																		const cx = ld64(s368)
																		st64(a + 0x10, ld64(s368 + 8))
																		st64(a + 8, cx)
																		st64(a, 0)
																		const cz = ld64(s78 + 8)
																		const cy = ld64(s78)
																		rc_dec(cy)
																		rc_dec(cz)
																		bu = ld64(s130 + 0x10)
																		const da = ld64(s130 + 8)
																		rc_dec(da)
																		if (!rc_release(bu)) {
																			return cj
																		}
																		st64(bu + 8, ld64(bu + 8) - 1)
																		return cj
																	}
																	const cm = __floatundidf(ld64(s188) * (cl + 0x80))
																	const cn = fn_14f7f8(ld64(s188 + 8), cm)
																	st64(s648, 0)
																	st64(s650, fn_151cb0(cn, 0))
																	const co = fn_14f3e8(cn)
																	if ((ld64(s650) as i64) >= 0) {
																		st64(s648, co)
																	}
																	const cp = fn_151a40(cn, 0x43efffffffffffff)
																	let cw = -1
																	if (0 >= (cp as i64)) {
																		cw = ld64(s648)
																	}
																	const cr = ld64(s78 + 8)
																	const cq = ld64(s78)
																	rc_dec(cq)
																	rc_dec(cr)
																	const cu = ld64(s130 + 0x10)
																	const cs = ld64(s130 + 8)
																	let ct = ld64(cs) - 1
																	st64(cs, ct)
																	if (ct == 0) {
																		ct = ld64(cs + 8) - 1
																		st64(cs + 8, ct)
																	}
																	let cv = ld64(cu) - 1
																	st64(cu, cv)
																	if (cv == 0) {
																		cv = ld64(cu + 8) - 1
																		st64(cu + 8, cv)
																	}
																	if (cw > ld64(s640)) {
																		anchor_error_from(s4e8, 0x7d5 /* anchor::ConstraintRentExempt */, cv, ct)
																		cj = Error_with_account_name(s4f8, ld64(s4e8), ld64(s4e8 + 8), 0x100154c38 /* "oracle" */, 6)
																		bb = ld64(s4f8)
																		st64(a + 0x10, ld64(s4f8 + 8))
																		st64(a + 8, bb)
																		st64(a, 0)
																		return cj
																	}
																	const db = ld64(ld64(g))
																	copyr(sc0, db, 0x20)
																	const dc = ld64(ld64(ld64(s620 + 0x58) + 0x58))
																	const dg = ld64(dc)
																	const df = ld64(dc + 8)
																	const de = ld64(dc + 0x10)
																	const dd = ld64(dc + 0x18)
																	st64(sa0, dg, df, de, dd, 0x100154db3, 0xb, sc0, 0x20, sa0, 0x20)
																	// PDA find_program_address(["token_badge", *db, *sa0], program *(ld64(s208)))
																	Pubkey_find_program_address(s130, s80, 3, ld64(s208))
																	copyr(s100, s130, 0x20)
																	st8(ld64(s620 + 0x60), ld8(s130 + 0x20))
																	const dh = ld64(ld64(s620 + 0x50))
																	copyr(s80, dh, 0x20)
																	if ((memcmp(s80, s100, 0x20) as u32) != 0) {
																		anchor_error_from(s378, 0x7d6 /* anchor::ConstraintSeeds */)
																		const dv = Error_with_account_name(s388, ld64(s378), ld64(s378 + 8), "token_badge_a", 0xd)
																		const du = ld64(s388 + 8)
																		const dt = ld64(s388)
																		copyr(s80, dh, 0x20)
																		copy(s60, s100, 0x20)
																		cj = fn_13b5c0(s398, dt, du, s80, dv)
																		bb = ld64(s398)
																		st64(a + 0x10, ld64(s398 + 8))
																		st64(a + 8, bb)
																		st64(a, 0)
																		return cj
																	}
																	const di = ld64(ld64(g))
																	copyr(sc0, di, 0x20)
																	const dj = token_mint_b_box.info.key
																	const dn = ld64(dj)
																	const dm = ld64(dj + 8)
																	const dl = ld64(dj + 0x10)
																	const dk = ld64(dj + 0x18)
																	st64(sa0, dn, dm, dl, dk, 0x100154db3, 0xb, sc0, 0x20, sa0, 0x20)
																	// PDA find_program_address(["token_badge", *di, *sa0], program *(ld64(s208)))
																	Pubkey_find_program_address(s130, s80, 3, ld64(s208))
																	copyr(se0, s130, 0x20)
																	st8(ld64(s620 + 0x60) + 1, ld8(s130 + 0x20))
																	const dp = ld64(ld64(s620 + 0x48))
																	copyr(s80, dp, 0x20)
																	if ((memcmp(s80, se0, 0x20) as u32) == 0) {
																		if (ld8(ld64(s200) + 0x29) == 0) {
																			anchor_error_from(s4c8, 0x7d0 /* anchor::ConstraintMut */)
																			cj = Error_with_account_name(s4d8, ld64(s4c8), ld64(s4c8 + 8), "funder", 6)
																			bb = ld64(s4d8)
																			st64(a + 0x10, ld64(s4d8 + 8))
																			st64(a + 8, bb)
																			st64(a, 0)
																			return cj
																		}
																		const dw = ld64(s620 + 0x28)
																		if (fn_595a8(dw + 8, ld64(ld64(s620 + 0x40))) != 0) {
																			if (ld8(ld64(s620 + 0x38) + 0x29) != 0) {
																				if (ld8(ld64(s620 + 0x30) + 0x29) != 0) {
																					copyr(sa0, dw + 8, 0x20)
																					const dx = ld64(ld64(g))
																					copyr(s130, dx, 0x20)
																					if ((memcmp(sa0, s130, 0x20) as u32) != 0) {
																						anchor_error_from(s3f8, 0x7d1 /* anchor::ConstraintHasOne */)
																						const eh = Error_with_account_name(s408, ld64(s3f8), ld64(s3f8 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
																						const eg = ld64(s408 + 8)
																						const ef = ld64(s408)
																						copyr(s80, sa0, 0x20)
																						copy(s60, s130, 0x20)
																						cj = fn_13b5c0(s418, ef, eg, s80, eh)
																						bb = ld64(s418)
																						st64(a + 0x10, ld64(s418 + 8))
																						st64(a + 8, bb)
																						st64(a, 0)
																						return cj
																					}
																					const dy = ld64(ld64(s620 + 0x20))
																					copyr(sa0, dy, 0x20)
																					AccountInfo_clone(s80, ld64(ld64(s620 + 0x58) + 0x58))
																					const dz = ld64(s78 + 0x10)
																					copy(s130, dz, 0x20)
																					const eb = ld64(s78 + 8)
																					const ea = ld64(s78)
																					rc_dec(ea)
																					rc_dec(eb)
																					if ((memcmp(sa0, s130, 0x20) as u32) == 0) {
																						const ei = ld64(ld64(s620 + 0x18))
																						copyr(sa0, ei, 0x20)
																						AccountInfo_clone(s80, token_mint_b_box.info)
																						const ej = ld64(s78 + 0x10)
																						copy(s130, ej, 0x20)
																						const el = ld64(s78 + 8)
																						const ek = ld64(s78)
																						rc_dec(ek)
																						rc_dec(el)
																						cj = memcmp(sa0, s130, 0x20) as u32
																						if (cj == 0) {
																							const eq = ld64(s200)
																							const ep = ld64(s1e8)
																							st64(a + 0x90, ld64(s628))
																							st64(a + 0x88, ld64(s620 + 0x10))
																							st64(a + 0x80, ld64(s620 + 8))
																							st64(a + 0x78, ld64(s620))
																							st64(a + 0x70, ep)
																							st64(a + 0x68, ld64(s620 + 0x18))
																							st64(a + 0x60, ld64(s620 + 0x20))
																							st64(a + 0x58, ld64(s620 + 0x28))
																							st64(a + 0x50, ld64(s620 + 0x30))
																							st64(a + 0x48, ld64(s620 + 0x38))
																							st64(a + 0x40, ld64(s638))
																							st64(a + 0x38, ld64(s630))
																							st64(a + 0x30, ld64(s620 + 0x40))
																							st64(a + 0x28, eq)
																							st64(a + 0x20, ld64(s620 + 0x48))
																							st64(a + 0x18, ld64(s620 + 0x50))
																							st64(a + 0x10, token_mint_b_box)
																							st64(a + 8, ld64(s620 + 0x58))
																							st64(a, g)
																							return cj
																						}
																						anchor_error_from(s458, 0x7dc /* anchor::ConstraintAddress */)
																						const eo = Error_with_account_name(s468, ld64(s458), ld64(s458 + 8), "token_program_b", 0xf)
																						const en = ld64(s468 + 8)
																						const em = ld64(s468)
																						copyr(s80, sa0, 0x20)
																						copy(s60, s130, 0x20)
																						cj = fn_13b5c0(s478, em, en, s80, eo)
																						bb = ld64(s478)
																						st64(a + 0x10, ld64(s478 + 8))
																						st64(a + 8, bb)
																						st64(a, 0)
																						return cj
																					}
																					anchor_error_from(s428, 0x7dc /* anchor::ConstraintAddress */)
																					const ee = Error_with_account_name(s438, ld64(s428), ld64(s428 + 8), "token_program_a", 0xf)
																					const ed = ld64(s438 + 8)
																					const ec = ld64(s438)
																					copyr(s80, sa0, 0x20)
																					copy(s60, s130, 0x20)
																					cj = fn_13b5c0(s448, ec, ed, s80, ee)
																					bb = ld64(s448)
																					st64(a + 0x10, ld64(s448 + 8))
																					st64(a + 8, bb)
																					st64(a, 0)
																					return cj
																				}
																				anchor_error_from(s488, 0x7d0 /* anchor::ConstraintMut */)
																				cj = Error_with_account_name(s498, ld64(s488), ld64(s488 + 8), "token_vault_b", 0xd)
																				bb = ld64(s498)
																				st64(a + 0x10, ld64(s498 + 8))
																				st64(a + 8, bb)
																				st64(a, 0)
																				return cj
																			}
																			anchor_error_from(s4a8, 0x7d0 /* anchor::ConstraintMut */)
																			cj = Error_with_account_name(s4b8, ld64(s4a8), ld64(s4a8 + 8), "token_vault_a", 0xd)
																			bb = ld64(s4b8)
																			st64(a + 0x10, ld64(s4b8 + 8))
																			st64(a + 8, bb)
																			st64(a, 0)
																			return cj
																		}
																		anchor_error_from(s3d8, 0x7d3 /* anchor::ConstraintRaw */)
																		cj = Error_with_account_name(s3e8, ld64(s3d8), ld64(s3d8 + 8), "initialize_pool_authority", 0x19)
																		bb = ld64(s3e8)
																		st64(a + 0x10, ld64(s3e8 + 8))
																		st64(a + 8, bb)
																		st64(a, 0)
																		return cj
																	}
																	anchor_error_from(s3a8, 0x7d6 /* anchor::ConstraintSeeds */)
																	const ds = Error_with_account_name(s3b8, ld64(s3a8), ld64(s3a8 + 8), "token_badge_b", 0xd)
																	const dr = ld64(s3b8 + 8)
																	const dq = ld64(s3b8)
																	copyr(s80, dp, 0x20)
																	copy(s60, se0, 0x20)
																	cj = fn_13b5c0(s3c8, dq, dr, s80, ds)
																	bb = ld64(s3c8)
																	st64(a + 0x10, ld64(s3c8 + 8))
																	st64(a + 8, bb)
																	st64(a, 0)
																	return cj
																}
																st64(a + 0x10, ld64(s638))
																st64(a + 8, bb)
																st64(a, 0)
																return cj
															}
															anchor_error_from(s338, 0x7d6 /* anchor::ConstraintSeeds */)
															Error_with_account_name(s348, ld64(s338), ld64(s338 + 8), 0x100154c38 /* "oracle" */, 6)
															const ci = ld64(s348 + 8)
															const ch = ld64(s348)
															const cc = ld64(ld64(s1f0))
															const cg = ld64(cc + 0x18)
															const cf = ld64(cc + 0x10)
															const ce = ld64(cc + 8)
															const cd = ld64(cc)
															copy(s60, s158, 0x20)
															st64(s80, cd, ce, cf, cg)
															cj = fn_13b5c0(s358, ch, ci, s80, ce)
															bb = ld64(s358)
															st64(a + 0x10, ld64(s358 + 8))
															st64(a + 8, bb)
															st64(a, 0)
															return cj
														}
														st64(a + 0x10, ld64(s630))
														st64(a + 8, bb)
														st64(a, 0)
														return cj
													}
													anchor_error_from(s2e8, 0x7d6 /* anchor::ConstraintSeeds */)
													Error_with_account_name(s2f8, ld64(s2e8), ld64(s2e8 + 8), 0x100152b28 /* "whirlpool" */, 9)
													const ba = ld64(s2f8 + 8)
													const az = ld64(s2f8)
													const au = ld64(ld64(s1f8))
													const ay = ld64(au + 0x18)
													const ax = ld64(au + 0x10)
													const aw = ld64(au + 8)
													const av = ld64(au)
													copy(s60, s1b0, 0x20)
													st64(s80, av, aw, ax, ay)
													cj = fn_13b5c0(s308, az, ba, s80, aw)
													bb = ld64(s308)
													st64(a + 0x10, ld64(s308 + 8))
													st64(a + 8, bb)
													st64(a, 0)
													return cj
												}
												cj = fn_13b430(s2d8, s1c8)
												bb = ld64(s2d8)
												st64(a + 0x10, ld64(s2d8 + 8))
												st64(a + 8, bb)
												st64(a, 0)
												return cj
											}
											cj = Error_with_account_name(s2c8, ai, aj, "system_program", 0xe)
											bb = ld64(s2c8)
											st64(a + 0x10, ld64(s2c8 + 8))
											st64(a + 8, bb)
											st64(a, 0)
											return cj
										}
										cj = Error_with_account_name(s2b8, ag, ah, "token_program_b", 0xf)
										bb = ld64(s2b8)
										st64(a + 0x10, ld64(s2b8 + 8))
										st64(a + 8, bb)
										st64(a, 0)
										return cj
									}
									cj = Error_with_account_name(s2a8, ae, af, "token_program_a", 0xf)
									bb = ld64(s2a8)
									st64(a + 0x10, ld64(s2a8 + 8))
									st64(a + 8, bb)
									st64(a, 0)
									return cj
								}
								cj = Error_with_account_name(s298, ac, ad, 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
								bb = ld64(s298)
								st64(a + 0x10, ld64(s298 + 8))
								st64(a + 8, bb)
								st64(a, 0)
								return cj
							}
							cj = Error_with_account_name(s288, aa, ab, "token_vault_b", 0xd)
							bb = ld64(s288)
							st64(a + 0x10, ld64(s288 + 8))
							st64(a + 8, bb)
							st64(a, 0)
							return cj
						}
						cj = anchor_error_from(s578, 0xbbd /* anchor::AccountNotEnoughKeys */, x, v - 1, w + 0x30)
						bb = ld64(s578)
						st64(a + 0x10, ld64(s578 + 8))
						st64(a + 8, bb)
						st64(a, 0)
						return cj
					}
					cj = Error_with_account_name(s268, u, x, "initialize_pool_authority", 0x19)
					bb = ld64(s268)
					st64(a + 0x10, ld64(s268 + 8))
					st64(a + 8, bb)
					st64(a, 0)
					return cj
				}
				cj = Error_with_account_name(s258, s, t, "funder", 6)
				bb = ld64(s258)
				st64(a + 0x10, ld64(s258 + 8))
				st64(a + 8, bb)
				st64(a, 0)
				return cj
			}
			alloc_handle_alloc_error(8, 0x80)
		}
		alloc_handle_alloc_error(8, 0x80)
	}
	alloc_handle_alloc_error(8, 0x70)
}

export function fn_23b8(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s80 = fp - 0x80
	try_accounts_11d28(s80, b, c, d, e)
	if (ld64(s80) == 0) {
		const h = ld64(s80 + 8)
		st64(a + 8, ld64(s80 + 0x10))
		st64(a, h)
	} else {
		const f = ld64(0x300000000 /* heap bump-allocator cursor */)
		const g = f != 0 ? sat_sub(f, 0x80) & -8 : 0x300007f80
		if (0x300000007 >= g) {
			alloc_handle_alloc_error(8, 0x80)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, s80, 0x80)
		st64(a + 8, g)
		st64(a, 2)
	}
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
export function fn_fb520(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s290 = fp - 0x290, s291 = fp - 0x291, s294 = fp - 0x294, s2b8 = fp - 0x2b8, s2d8 = fp - 0x2d8, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, s338 = fp - 0x338, s350 = fp - 0x350, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s398 = fp - 0x398, s3e0 = fp - 0x3e0, s400 = fp - 0x400, s420 = fp - 0x420, s458 = fp - 0x458, s468 = fp - 0x468, s488 = fp - 0x488, s497 = fp - 0x497, s4a0 = fp - 0x4a0, s4b8 = fp - 0x4b8, s4d0 = fp - 0x4d0, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s5a0 = fp - 0x5a0, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s5d8 = fp - 0x5d8, s5e0 = fp - 0x5e0, s5e8 = fp - 0x5e8, s5f0 = fp - 0x5f0
	let az, dh, di, dj: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s558, b, f)
	if (g != 0) {
		const p = ld64(ld64(b + 0x10))
		st64(s5a0 + 0x28, p)
		const q = ld64(p)
		copyr(s350, q + 8, 0x18)
		st64(s5a0 + 0x30, q)
		st64(s358, ld64(q))
		const r = ld64(f)
		copyr(s4d0, r + 8, 0x18)
		st64(s5a0 + 0x38, r)
		st64(s4d8, ld64(r))
		if ((memcmp(s358, s4d8, 0x20) as u32) == 0) {
			ErrorCode_name(s2d8, 0x100152d40)
			st64(s2b8, 0, 1, 0)
			st64(s338, s2b8, 0x100159480)
			st8(s338 + 0x18, 3)
			st64(s338 + 0x10, 0x20)
			st64(s350 + 8, 0)
			st64(s358, 0)
			if (ErrorCode_fmt(0x100152d40, s358) == 0) {
				copyr(s4a0, s2b8, 0x18)
				copy(s4b8, s2d8, 0x18)
				st64(s4d0, 0x1001550f2)
				st32(s458 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s488, 2)
				st32(s4d0 + 0x10, 0xe)
				st64(s4d0 + 8, 0x55)
				st64(s4d8, 0)
				const be = fn_13b3a8(s518, s4d8)
				const bd = ld64(s518 + 8)
				const bc = ld64(s518)
				const ba = ld64(s5a0 + 0x30)
				copyr(s4d8, ba, 0x20)
				const bb = ld64(s5a0 + 0x38)
				copy(s4b8, bb, 0x20)
				dj = fn_13b5c0(s528, bc, bd, s4d8, be)
				const bf = ld64(s528)
				st64(a + 8, ld64(s528 + 8))
				st64(a, bf)
				return dj
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s4d8, 0x1001594b0, 0x1001594d0)
		}
		st64(s5a0 + 0x40, a)
		const s = ld64(b + 8)
		const t = __floatundidf(ld64(s) * 0x30d)
		const u = fn_14f7f8(ld64(s + 8), t)
		const v = fn_151cb0(u, 0)
		const w = fn_14f3e8(u)
		const x = max((fn_151a40(u, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (v as i64) ? 0 : w, 1)
		let bh: AccountInfo = ld64(s558 + 8)
		let cc = ld64(s558)
		if (x > g) {
			const y: AccountInfo = ld64(s5a0 + 0x28)
			const z: LamportsCell = y.lamports
			rc_inc(z)
			const bg: DataCell = y.data
			rc_inc(bg)
			const bi: LamportsCell = bh.lamports
			const bj = bi.strong
			st64(s5a0 + 0x10, bh.key)
			st64(s5a0 + 0x18, y.executable)
			st64(s5a0 + 0x20, y.is_writable)
			st64(s5a0 + 0x38, y.is_signer)
			const bl = y.rent_epoch
			const bm = y.owner
			rc_inc(bi, bj)
			const bk: DataCell = bh.data
			rc_inc(bk)
			st64(s5b8, bl, bm, bi, bg, z)
			const bn: AccountInfo = ld64(ld64(ld64(s558) + 0x18))
			const bo: LamportsCell = bn.lamports
			const bp = bo.strong
			st64(s5a0 + 0x28, sat_sub(x, g))
			const bq: AccountInfo = ld64(s558 + 8)
			st64(s5d8 + 0x10, bq.executable)
			st64(s5d8 + 0x18, bq.is_writable)
			const bu = bq.is_signer
			const bv = bq.rent_epoch
			const bw = bq.owner
			const bt = bn.key
			rc_inc(bo, bp)
			const br: DataCell = bn.data
			const bs = br.strong
			st64(s5d8 + 8, bt)
			rc_inc(br, bs)
			st64(s5d8, bn.owner)
			st64(s5e0, bn.rent_epoch)
			const bz = bn.is_signer
			const by = bn.is_writable
			const bx = bn.executable
			st8(s398 + 0x1a, ld64(s5d8 + 0x10))
			st8(s398 + 0x19, ld64(s5d8 + 0x18))
			st8(s398 + 0x18, bu)
			st64(s398, bk, bw, bv)
			st64(s3e0 + 0x40, ld64(s5a8))
			st64(s3e0 + 0x38, ld64(s5a0 + 0x10))
			st8(s3e0 + 0x32, ld64(s5a0 + 0x18))
			st8(s3e0 + 0x31, ld64(s5a0 + 0x20))
			st8(s3e0 + 0x30, ld64(s5a0 + 0x38))
			st64(s3e0 + 0x28, ld64(s5b8))
			st64(s3e0 + 0x20, ld64(s5b8 + 8))
			st64(s3e0 + 0x18, ld64(s5a0))
			st64(s3e0 + 0x10, ld64(s5a0 + 8))
			st64(s3e0 + 8, ld64(s5a0 + 0x30))
			st8(s3e0, bz, by, bx)
			st64(s400 + 0x18, ld64(s5e0))
			st64(s400 + 0x10, ld64(s5d8))
			st64(s400, bo, br)
			st64(s420 + 0x18, ld64(s5d8 + 8))
			st64(s378, 8, 0)
			st64(s420, 0, 8, 0)
			dj = fn_13d318(s4e8, s420, ld64(s5a0 + 0x28))
			az = ld64(s4e8)
			if (az != 2) {
				di = ld64(s4e8 + 8)
				dh = ld64(s5a0 + 0x40)
				st64(dh, az, di)
				return dj
			}
			bh = ld64(s558 + 8)
			st64(s5a0 + 0x38, bh.key)
			cc = ld64(s558)
		}
		const ca: LamportsCell = bh.lamports
		rc_inc(ca)
		const cb: DataCell = bh.data
		rc_inc(cb)
		const cd: AccountInfo = ld64(ld64(cc + 0x18))
		const ce: LamportsCell = cd.lamports
		const cf = ce.strong
		st64(s5a0 + 0x20, bh.executable)
		st64(s5a0 + 0x28, bh.is_writable)
		st64(s5a0 + 0x30, bh.is_signer)
		const ci = bh.rent_epoch
		const cj = bh.owner
		st64(s5a0 + 0x18, cd.key)
		rc_inc(ce, cf)
		const cg: DataCell = cd.data
		const ch = cg.strong
		st64(s5a0, ci, cj, ca)
		rc_inc(cg, ch)
		st64(s5a8, cd.owner)
		st64(s5b8 + 8, cd.rent_epoch)
		st64(s5b8, cd.is_signer)
		st64(s5d8 + 0x18, cd.is_writable)
		const co = cd.executable
		const ck = ld64(ld64(ld64(cc + 0x20)))
		copyr(s2f0, ck + 8, 0x18)
		st64(s5d8 + 0x10, ck)
		st64(s2f8, ld64(ck))
		const cl = ld64(ld64(ld64(cc + 0x28) + 0x58))
		copyr(s2d8, cl, 0x20)
		const cm = ld64(ld64(ld64(cc + 0x30) + 0x58))
		copyr(s2b8, cm, 0x20)
		const cn = ld16(ld64(cc + 0x38) + 0x70)
		st64(s5d8 + 8, cn)
		st16(s294, cn)
		const cp = ld8(ld64(cc + 0x40))
		st64(s338 + 0x30, s291)
		st64(s338 + 0x20, s294)
		st64(s338 + 0x10, s2b8)
		st64(s338, s2d8)
		st64(s350 + 8, s2f8)
		st64(s358, 0x100152b28)
		st64(s368, s358)
		st64(s468 + 8, s368)
		st8(s468 + 2, co)
		st8(s468 + 1, ld64(s5d8 + 0x18))
		st8(s468, ld64(s5b8))
		st64(s488 + 0x18, ld64(s5b8 + 8))
		st64(s488 + 0x10, ld64(s5a8))
		st64(s488, ce, cg)
		st64(s497 + 7, ld64(s5a0 + 0x18))
		st8(s497 + 1, ld64(s5a0 + 0x20))
		st8(s497, ld64(s5a0 + 0x28))
		st8(s4a0 + 8, ld64(s5a0 + 0x30))
		st64(s4a0, ld64(s5a0))
		st64(s4b8 + 0x10, ld64(s5a0 + 8))
		st64(s4b8 + 8, cb)
		st64(s4b8, ld64(s5a0 + 0x10))
		st64(s4d0 + 0x10, ld64(s5a0 + 0x38))
		st64(s5a0 + 0x38, cp)
		st8(s291, cp)
		st64(s338 + 0x38, 1)
		st64(s338 + 0x28, 2)
		st64(s338 + 0x18, 0x20)
		st64(s338 + 8, 0x20)
		st64(s350 + 0x10, 0x20)
		st64(s350, 9)
		st64(s368 + 8, 6)
		st64(s458, 1)
		st64(s4d8, 0, 8, 0)
		dj = fn_13c8b8(s4f8, s4d8, 0x28d)
		az = ld64(s4f8)
		if (az != 2) {
			di = ld64(s4f8 + 8)
			dh = ld64(s5a0 + 0x40)
			st64(dh, az, di)
			return dj
		}
		const cq: AccountInfo = ld64(s558 + 8)
		const cr: LamportsCell = cq.lamports
		const cv = cq.key
		rc_inc(cr)
		const cs: DataCell = cq.data
		rc_inc(cs)
		const ct: LamportsCell = cd.lamports
		const cu = ct.strong
		st64(s5a0 + 0x30, cv)
		st64(s5a0 + 8, cd.key)
		st64(s5a0 + 0x10, cq.executable)
		st64(s5a0 + 0x18, cq.is_writable)
		st64(s5a0 + 0x20, cq.is_signer)
		st64(s5a0 + 0x28, cq.rent_epoch)
		const cy = cq.owner
		rc_inc(ct, cu)
		const cw: DataCell = cd.data
		const cx = cw.strong
		st64(s5a8, cy, cr)
		rc_inc(cw, cx)
		st64(s5b8 + 8, cd.owner)
		st64(s5b8, cd.rent_epoch)
		const dc = cd.is_signer
		const db = cd.is_writable
		const da = cd.executable
		const cz = ld64(s5d8 + 0x10)
		copyr(s2f8, cz, 0x20)
		copyr(s2d8, cl, 0x20)
		copyr(s2b8, cm, 0x20)
		st16(s294, ld64(s5d8 + 8))
		st8(s291, ld64(s5a0 + 0x38))
		st64(s368, s358, 6, 0x100152b28, 9, s2f8, 0x20, s2d8, 0x20, s2b8, 0x20, s294, 2, s291, 1)
		st64(s468 + 8, s368)
		st8(s468, dc, db, da)
		st64(s488 + 0x18, ld64(s5b8))
		st64(s488 + 0x10, ld64(s5b8 + 8))
		st64(s488, ct, cw)
		st64(s497 + 7, ld64(s5a0 + 8))
		st8(s497 + 1, ld64(s5a0 + 0x10))
		st8(s497, ld64(s5a0 + 0x18))
		st8(s4a0 + 8, ld64(s5a0 + 0x20))
		st64(s4a0, ld64(s5a0 + 0x28))
		st64(s4b8 + 0x10, ld64(s5a8))
		st64(s4b8 + 8, cs)
		st64(s4b8, ld64(s5a0))
		st64(s4d0 + 0x10, ld64(s5a0 + 0x30))
		st64(s458, 1)
		st64(s4d8, 0, 8, 0)
		dj = fn_13cc48(s508, s4d8, ld64(ld64(ld64(s558) + 0x48)))
		az = ld64(s508)
		if (az != 2) {
			di = ld64(s508 + 8)
			dh = ld64(s5a0 + 0x40)
			st64(dh, az, di)
			return dj
		}
	} else {
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0x30d)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const ad = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		const m = ld64(s558)
		const n: AccountInfo = ld64(ld64(m + 0x10))
		const o: LamportsCell = n.lamports
		const ac = n.key
		const ae = ld64(s558 + 8)
		rc_inc(o)
		const aa: DataCell = n.data
		st64(s5a0 + 0x38, aa)
		const ab = aa.strong
		st64(s5a0 + 0x30, ac)
		rc_inc(ld64(s5a0 + 0x38), ab)
		const af = ld64(ae + 8)
		const ag = ld64(af)
		st64(s5a0, ld64(ae))
		st64(s5a0 + 8, n.executable)
		st64(s5a0 + 0x10, n.is_writable)
		st64(s5a0 + 0x18, n.is_signer)
		st64(s5a0 + 0x20, n.rent_epoch)
		st64(s5a0 + 0x28, n.owner)
		rc_inc(af, ag)
		const ah = ld64(ae + 0x10)
		const ai = ld64(ah)
		st64(s5a8, o)
		rc_inc(ah, ai)
		const aj: AccountInfo = ld64(ld64(m + 0x18))
		const ak: LamportsCell = aj.lamports
		const al = ak.strong
		st64(s5a0 + 0x40, a)
		const am: AccountInfo = ld64(s558 + 8)
		st64(s5d8 + 0x10, am.executable)
		st64(s5d8 + 0x18, am.is_writable)
		st64(s5b8, am.is_signer)
		st64(s5b8 + 8, am.rent_epoch)
		const aw = am.owner
		const ap = aj.key
		rc_inc(ak, al)
		const an: DataCell = aj.data
		const ao = an.strong
		st64(s5d8, ap, ad)
		rc_inc(an, ao)
		st64(s5e0, aj.owner)
		st64(s5e8, aj.rent_epoch)
		st64(s5f0, aj.is_signer)
		const ay = aj.is_writable
		const ax = aj.executable
		const aq = ld64(s558)
		const ar = ld64(ld64(ld64(aq + 0x20)))
		copyr(s2f8, ar, 0x20)
		const at = ld64(ld64(ld64(aq + 0x28) + 0x58))
		copyr(s2d8, at, 0x20)
		const au = ld64(ld64(ld64(aq + 0x30) + 0x58))
		copyr(s2b8, au, 0x20)
		st16(s294, ld16(ld64(aq + 0x38) + 0x70))
		const av = ld8(ld64(aq + 0x40))
		st64(s338 + 0x30, s291)
		st64(s338 + 0x20, s294)
		st64(s338 + 0x10, s2b8)
		st64(s338, s2d8)
		st64(s350 + 8, s2f8)
		st64(s358, 0x100152b28)
		st8(s291, av)
		st64(s368, s358)
		st64(s458 + 0x28, s368)
		st8(s458 + 0x22, ld64(s5d8 + 0x10))
		st8(s458 + 0x21, ld64(s5d8 + 0x18))
		st8(s458 + 0x20, ld64(s5b8))
		st64(s458 + 0x18, ld64(s5b8 + 8))
		st64(s458, af, ah, aw)
		st64(s468 + 8, ld64(s5a0))
		st8(s468 + 2, ld64(s5a0 + 8))
		st8(s468 + 1, ld64(s5a0 + 0x10))
		st8(s468, ld64(s5a0 + 0x18))
		st64(s488 + 0x18, ld64(s5a0 + 0x20))
		st64(s488 + 0x10, ld64(s5a0 + 0x28))
		st64(s488 + 8, ld64(s5a0 + 0x38))
		st64(s488, ld64(s5a8))
		st64(s497 + 7, ld64(s5a0 + 0x30))
		st8(s497, ay, ax)
		st8(s4a0 + 8, ld64(s5f0))
		st64(s4a0, ld64(s5e8))
		st64(s4b8 + 0x10, ld64(s5e0))
		st64(s4b8, ak, an)
		st64(s4d0 + 0x10, ld64(s5d8))
		st64(s338 + 0x38, 1)
		st64(s338 + 0x28, 2)
		st64(s338 + 0x18, 0x20)
		st64(s338 + 8, 0x20)
		st64(s350 + 0x10, 0x20)
		st64(s350, 9)
		st64(s368 + 8, 6)
		st64(s458 + 0x30, 1)
		st64(s4d8, 0, 8, 0)
		dj = fn_13cfd8(s538, s4d8, ld64(s5d8 + 8), 0x28d, ld64(ld64(aq + 0x48)))
		az = ld64(s538)
		if (az != 2) {
			di = ld64(s538 + 8)
			dh = ld64(s5a0 + 0x40)
			st64(dh, az, di)
			return dj
		}
	}
	const df = ld64(s5a0 + 0x40)
	fn_3aa0(s290, ld64(s558 + 8))
	if (ld64(s290) == 0) {
		dj = Error_with_account_name(s548, ld64(s290 + 8), ld64(s290 + 0x10), 0x100152b28 /* "whirlpool" */, 9)
		const dg = ld64(s548)
		st64(df + 8, ld64(s548 + 8))
		st64(df, dg)
		return dj
	}
	const dd = ld64(0x300000000 /* heap bump-allocator cursor */)
	const de = dd != 0 ? sat_sub(dd, 0x290) & -8 : 0x300007d70
	if (de > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, de)
		dj = memcpy(de, s290, 0x290)
		st64(df + 8, de)
		st64(df, 2)
		return dj
	}
	alloc_handle_alloc_error(8, 0x290)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: oracle
export function fn_fd368(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s41 = fp - 0x41, s68 = fp - 0x68, s78 = fp - 0x78, sa0 = fp - 0xa0, se0 = fp - 0xe0, s100 = fp - 0x100, s120 = fp - 0x120, s138 = fp - 0x138, s170 = fp - 0x170, s180 = fp - 0x180, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1b8 = fp - 0x1b8, s1d0 = fp - 0x1d0, s1d8 = fp - 0x1d8, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, s300 = fp - 0x300, s308 = fp - 0x308
	let aw, dc, dd, de: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s270, f, b)
	if (g != 0) {
		const p = ld64(ld64(b + 0x10))
		st64(s2b8 + 0x30, p)
		const q = ld64(p)
		copyr(s38, q + 8, 0x18)
		st64(s2b8 + 0x38, q)
		st64(s40, ld64(q))
		const r = ld64(f)
		copyr(s1f0, r, 0x20)
		if ((memcmp(s40, s1f0, 0x20) as u32) == 0) {
			ErrorCode_name(s138, 0x100152d40)
			st64(s68, 0, 1, 0)
			st64(s20, s68, 0x100159480)
			st8(s20 + 0x18, 3)
			st64(s20 + 0x10, 0x20)
			st64(s38 + 8, 0)
			st64(s40, 0)
			if (ErrorCode_fmt(0x100152d40, s40) == 0) {
				copyr(s1b8, s68, 0x18)
				copy(s1d0, s138, 0x18)
				st64(s1f0 + 8, 0x1001550f2)
				st32(s170 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s1a0, 2)
				st32(s1d8, 0xe)
				st64(s1f0 + 0x10, 0x55)
				st64(s1f0, 0)
				const ba = fn_13b3a8(s230, s1f0)
				const az = ld64(s230 + 8)
				const ay = ld64(s230)
				const ax = ld64(s2b8 + 0x38)
				copyr(s1f0, ax, 0x20)
				copy(s1d0, r, 0x20)
				de = fn_13b5c0(s240, ay, az, s1f0, ba)
				const bb = ld64(s240)
				st64(a + 8, ld64(s240 + 8))
				st64(a, bb)
				return de
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1f0, 0x1001594b0, 0x1001594d0)
		}
		st64(s2b8 + 0x28, r)
		st64(s2b8 + 0x40, a)
		const s = ld64(b + 8)
		const t = __floatundidf(ld64(s) * 0x17e)
		const u = fn_14f7f8(ld64(s + 8), t)
		const v = fn_151cb0(u, 0)
		const w = fn_14f3e8(u)
		const x = max((fn_151a40(u, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (v as i64) ? 0 : w, 1)
		let bd: AccountInfo = ld64(s270)
		let bj = ld64(s270 + 8)
		if (x > g) {
			const y: AccountInfo = ld64(s2b8 + 0x30)
			const z: LamportsCell = y.lamports
			rc_inc(z)
			const bc: DataCell = y.data
			rc_inc(bc)
			const be: LamportsCell = bd.lamports
			const bf = be.strong
			st64(s2b8 + 8, bd.key)
			st64(s2b8 + 0x10, y.executable)
			st64(s2b8 + 0x18, y.is_writable)
			st64(s2b8 + 0x20, y.is_signer)
			st64(s2b8 + 0x28, y.rent_epoch)
			const bi = y.owner
			rc_inc(be, bf)
			const bg: DataCell = bd.data
			const bh = bg.strong
			st64(s2b8 + 0x30, bi)
			rc_inc(bg, bh)
			const bk: AccountInfo = ld64(ld64(bj + 0x18))
			const bl: LamportsCell = bk.lamports
			const bm = bl.strong
			st64(s2b8, sat_sub(x, g))
			st64(s2f0 + 0x10, bd.executable)
			st64(s2f0 + 0x18, bd.is_writable)
			st64(s2f0 + 0x20, bd.is_signer)
			st64(s2f0 + 0x28, bd.rent_epoch)
			st64(s2c0, bd.owner)
			const bp = bk.key
			rc_inc(bl, bm)
			const bn: DataCell = bk.data
			const bo = bn.strong
			st64(s2f0, z, bp)
			rc_inc(bn, bo)
			st64(s2f8, bk.owner)
			const bt = bk.rent_epoch
			const bs = bk.is_signer
			const br = bk.is_writable
			const bq = bk.executable
			st8(sa0 + 0x22, ld64(s2f0 + 0x10))
			st8(sa0 + 0x21, ld64(s2f0 + 0x18))
			st8(sa0 + 0x20, ld64(s2f0 + 0x20))
			st64(sa0 + 0x18, ld64(s2f0 + 0x28))
			st64(sa0 + 0x10, ld64(s2c0))
			st64(sa0, be, bg)
			st64(se0 + 0x38, ld64(s2b8 + 8))
			st8(se0 + 0x32, ld64(s2b8 + 0x10))
			st8(se0 + 0x31, ld64(s2b8 + 0x18))
			st8(se0 + 0x30, ld64(s2b8 + 0x20))
			st64(se0 + 0x28, ld64(s2b8 + 0x28))
			st64(se0 + 0x20, ld64(s2b8 + 0x30))
			st64(se0 + 0x18, bc)
			st64(se0 + 0x10, ld64(s2f0))
			st64(se0 + 8, ld64(s2b8 + 0x38))
			st8(se0, bs, br, bq)
			st64(s100 + 0x18, bt)
			st64(s100 + 0x10, ld64(s2f8))
			st64(s100, bl, bn)
			st64(s120 + 0x18, ld64(s2f0 + 8))
			st64(s78, 8, 0)
			st64(s120, 0, 8, 0)
			de = fn_13d318(s200, s120, ld64(s2b8))
			aw = ld64(s200)
			if (aw != 2) {
				dd = ld64(s200 + 8)
				dc = ld64(s2b8 + 0x40)
				st64(dc, aw, dd)
				return de
			}
			bd = ld64(s270)
			st64(s2b8 + 0x28, bd.key)
			bj = ld64(s270 + 8)
		}
		const bu: LamportsCell = bd.lamports
		rc_inc(bu)
		const bv: DataCell = bd.data
		rc_inc(bv)
		const bw: AccountInfo = ld64(ld64(bj + 0x18))
		const bx: LamportsCell = bw.lamports
		const by = bx.strong
		st64(s2b8 + 0x20, bd.executable)
		st64(s2b8 + 0x30, bd.is_writable)
		st64(s2b8 + 0x38, bd.is_signer)
		const cc = bd.rent_epoch
		const cd = bd.owner
		const cb = bw.key
		rc_inc(bx, by)
		const bz: DataCell = bw.data
		const ca = bz.strong
		st64(s2c0, cb, cc, cd, bv, bu)
		rc_inc(bz, ca)
		st64(s2f0 + 0x28, bw.owner)
		st64(s2f0 + 0x20, bw.rent_epoch)
		const ci = bw.is_signer
		const ch = bw.is_writable
		const cg = bw.executable
		const ce = ld64(s270 + 8)
		const cf = ld64(ld64(ld64(ce + 0x20)))
		copyr(s68, cf, 0x20)
		const cj = ld8(ld64(ce + 0x28))
		st64(s20, s41)
		st64(s38 + 8, s68)
		st64(s40, 0x100154c38)
		st64(s138, s40)
		st64(s180 + 8, s138)
		st8(s180, ci, ch, cg)
		st64(s1a0 + 0x18, ld64(s2f0 + 0x20))
		st64(s1a0 + 0x10, ld64(s2f0 + 0x28))
		st64(s1a0, bx, bz)
		st64(s1b0 + 8, ld64(s2c0))
		st8(s1b0 + 2, ld64(s2b8 + 0x20))
		st8(s1b0 + 1, ld64(s2b8 + 0x30))
		st8(s1b0, ld64(s2b8 + 0x38))
		st64(s1b8, ld64(s2b8))
		st64(s1d0 + 0x10, ld64(s2b8 + 8))
		st64(s1d0 + 8, ld64(s2b8 + 0x10))
		st64(s1d0, ld64(s2b8 + 0x18))
		st64(s1d8, ld64(s2b8 + 0x28))
		st64(s2b8 + 0x38, cj)
		st8(s41, cj)
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 6)
		st64(s138 + 8, 3)
		st64(s170, 1)
		st64(s1f0, 0, 8, 0)
		de = fn_13c8b8(s210, s1f0, 0xfe)
		aw = ld64(s210)
		if (aw != 2) {
			dd = ld64(s210 + 8)
			dc = ld64(s2b8 + 0x40)
			st64(dc, aw, dd)
			return de
		}
		const ck: AccountInfo = ld64(s270)
		const cl: LamportsCell = ck.lamports
		const cs = ck.key
		rc_inc(cl)
		const cm: DataCell = ck.data
		rc_inc(cm)
		const cn: LamportsCell = bw.lamports
		const co = cn.strong
		st64(s2b8 + 0x10, bw.key)
		st64(s2b8 + 0x18, ck.executable)
		st64(s2b8 + 0x20, ck.is_writable)
		st64(s2b8 + 0x28, ck.is_signer)
		st64(s2b8 + 0x30, ck.rent_epoch)
		const cr = ck.owner
		rc_inc(cn, co)
		const cp: DataCell = bw.data
		const cq = cp.strong
		st64(s2c0, cr, cs, cl)
		rc_inc(cp, cq)
		const cx = bw.owner
		const cw = bw.rent_epoch
		const cv = bw.is_signer
		const cu = bw.is_writable
		const ct = bw.executable
		copyr(s68, cf, 0x20)
		st64(s20, s41)
		st64(s38 + 8, s68)
		st64(s40, 0x100154c38)
		st64(s138, s40)
		st64(s180 + 8, s138)
		st8(s180, cv, cu, ct)
		st64(s1a0, cn, cp, cx, cw)
		st64(s1b0 + 8, ld64(s2b8 + 0x10))
		st8(s1b0 + 2, ld64(s2b8 + 0x18))
		st8(s1b0 + 1, ld64(s2b8 + 0x20))
		st8(s1b0, ld64(s2b8 + 0x28))
		st64(s1b8, ld64(s2b8 + 0x30))
		st64(s1d0 + 0x10, ld64(s2c0))
		st64(s1d0 + 8, cm)
		copyr(s1d8, s2b8, 0x10)
		st8(s41, ld64(s2b8 + 0x38))
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 6)
		st64(s138 + 8, 3)
		st64(s170, 1)
		st64(s1f0, 0, 8, 0)
		de = fn_13cc48(s220, s1f0, ld64(ld64(ld64(s270 + 8) + 0x30)))
		aw = ld64(s220)
		if (aw != 2) {
			dd = ld64(s220 + 8)
			dc = ld64(s2b8 + 0x40)
			st64(dc, aw, dd)
			return de
		}
	} else {
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0x17e)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const ad = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		const m = ld64(s270 + 8)
		const n: AccountInfo = ld64(ld64(m + 0x10))
		const o: LamportsCell = n.lamports
		const aa = n.key
		const ae = ld64(s270)
		rc_inc(o)
		st64(s2b8 + 0x38, aa)
		const ab: DataCell = n.data
		const ac = ab.strong
		st64(s2b8 + 0x30, ab)
		rc_inc(ab, ac)
		const af = ld64(ae + 8)
		const ag = ld64(af)
		st64(s2b8, ld64(ae))
		st64(s2b8 + 8, n.executable)
		st64(s2b8 + 0x10, n.is_writable)
		st64(s2b8 + 0x18, n.is_signer)
		st64(s2b8 + 0x20, n.rent_epoch)
		st64(s2b8 + 0x28, n.owner)
		rc_inc(af, ag)
		const ah = ld64(ae + 0x10)
		rc_inc(ah)
		const ai: AccountInfo = ld64(ld64(m + 0x18))
		const aj: LamportsCell = ai.lamports
		const ak = aj.strong
		st64(s2c0, o)
		const al: AccountInfo = ld64(s270)
		st64(s2f0 + 8, al.executable)
		st64(s2f0 + 0x10, al.is_writable)
		st64(s2f0 + 0x18, al.is_signer)
		st64(s2f0 + 0x20, al.rent_epoch)
		st64(s2f0 + 0x28, al.owner)
		const ao = ai.key
		rc_inc(aj, ak)
		const am: DataCell = ai.data
		const an = am.strong
		st64(s2f8, ao, ad)
		st64(s2b8 + 0x40, a)
		rc_inc(am, an)
		st64(s300, ai.owner)
		st64(s308, ai.rent_epoch)
		const av = ai.is_signer
		const au = ai.is_writable
		const at = ai.executable
		const ap = ld64(s270 + 8)
		const aq = ld64(ld64(ld64(ap + 0x20)))
		copyr(s68, aq, 0x20)
		const ar = ld8(ld64(ap + 0x28))
		st64(s20, s41)
		st64(s38 + 8, s68)
		st64(s40, 0x100154c38)
		st8(s41, ar)
		st64(s138, s40)
		st64(s170 + 0x28, s138)
		st8(s170 + 0x22, ld64(s2f0 + 8))
		st8(s170 + 0x21, ld64(s2f0 + 0x10))
		st8(s170 + 0x20, ld64(s2f0 + 0x18))
		st64(s170 + 0x18, ld64(s2f0 + 0x20))
		st64(s170 + 0x10, ld64(s2f0 + 0x28))
		st64(s170, af, ah)
		st64(s180 + 8, ld64(s2b8))
		st8(s180 + 2, ld64(s2b8 + 8))
		st8(s180 + 1, ld64(s2b8 + 0x10))
		st8(s180, ld64(s2b8 + 0x18))
		st64(s1a0 + 0x18, ld64(s2b8 + 0x20))
		st64(s1a0 + 0x10, ld64(s2b8 + 0x28))
		st64(s1a0 + 8, ld64(s2b8 + 0x30))
		st64(s1a0, ld64(s2c0))
		st64(s1b0 + 8, ld64(s2b8 + 0x38))
		st8(s1b0, av, au, at)
		st64(s1b8, ld64(s308))
		st64(s1d0 + 0x10, ld64(s300))
		st64(s1d0, aj, am)
		st64(s1d8, ld64(s2f8))
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 6)
		st64(s138 + 8, 3)
		st64(s170 + 0x30, 1)
		st64(s1f0, 0, 8, 0)
		de = fn_13cfd8(s250, s1f0, ld64(s2f0), 0xfe, ld64(ld64(ap + 0x30)))
		aw = ld64(s250)
		if (aw != 2) {
			dd = ld64(s250 + 8)
			dc = ld64(s2b8 + 0x40)
			st64(dc, aw, dd)
			return de
		}
	}
	const cz = ld64(s2b8 + 0x40)
	de = fn_1110(s1f0, ld64(s270))
	const da = ld64(s1f0 + 8)
	const cy = ld64(s1f0)
	if (cy == 2) {
		st64(cz + 8, da)
		st64(cz, 2)
		return de
	}
	de = Error_with_account_name(s260, cy, da, 0x100154c38 /* "oracle" */, 6)
	const db = ld64(s260)
	st64(cz + 8, ld64(s260 + 8))
	st64(cz, db)
	return de
}

export function fn_595a8(a: u64, b: u64): u64 {
	const s20 = fp - 0x20
	st64(s20, 0, 0, 0, 0)
	if ((memcmp(a + 0x20, s20, 0x20) as u32) == 0) {
		return 1
	}
	return (memcmp(a + 0x20, b, 0x20) as u32) == 0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), a (points to it), p5 (value), p6 (value)
// types [heur]: b: InitializePoolWithAdaptiveFeeContext (the handler ix_initialize_pool_with_adaptive_fee passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_43888(a: u64, b: InitializePoolWithAdaptiveFeeContext, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s10 = fp - 0x10, s16 = fp - 0x16, s28 = fp - 0x28, s48 = fp - 0x48, s68 = fp - 0x68, s88 = fp - 0x88, sa8 = fp - 0xa8, sc0 = fp - 0xc0, sc8 = fp - 0xc8, se8 = fp - 0xe8, s100 = fp - 0x100, s108 = fp - 0x108, s128 = fp - 0x128, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1000 = fp - 0x1000
	let q: u64
	const accounts: InitializePoolWithAdaptiveFeeAccounts = b.accounts
	const token_mint_a: Mint = accounts.token_mint_a
	const h = token_mint_a.info.key
	copyr(s148, h, 0x20)
	const i = accounts.token_mint_b.info.key
	copyr(s128, i, 0x20)
	const bs = ld8(b + 0x22)
	const j = ld64(accounts + 0x58)
	const bt = ld16(j + 0x70)
	const bu = ld16(j + 0x72)
	const br = ld16(j + 0x74)
	const k = ld64(ld64(ld64(accounts)))
	copyr(s108, k, 0x20)
	copyr(se8, h, 0x20)
	let r = fn_81d00(s10, s108, se8, accounts + 0x18)
	let l = ld64(s10)
	if (l != 2) {
		st64(a + 8, ld64(s10 + 8))
		st64(a, l)
		return r
	}
	const bq = p6
	const m = p5
	r = fn_80ca8(se8, token_mint_a, ld8(s10 + 8))
	l = ld64(se8)
	if (l == 2) {
		if (ld8(se8 + 8) == 0) {
			r = fn_87630(s158, 0x2f)
			q = ld64(s158 + 8)
			l = ld64(s158)
			if (l != 2) {
				st64(a + 8, q)
				st64(a, l)
				return r
			}
		}
		const token_mint_b: Mint = accounts.token_mint_b
		const n = ld64(ld64(ld64(accounts)))
		copyr(s108, n, 0x20)
		const p = token_mint_b.info.key
		copyr(se8, p, 0x20)
		r = fn_81d00(s10, s108, se8, accounts + 0x20)
		l = ld64(s10)
		if (l != 2) {
			st64(a + 8, ld64(s10 + 8))
			st64(a, l)
			return r
		}
		r = fn_80ca8(se8, token_mint_b, ld8(s10 + 8))
		l = ld64(se8)
		if (l == 2) {
			if (ld8(se8 + 8) == 0) {
				r = fn_87630(s168, 0x2f)
				q = ld64(s168 + 8)
				l = ld64(s168)
				if (l != 2) {
					st64(a + 8, q)
					st64(a, l)
					return r
				}
			}
			clock_get_13f308(se8)
			if (ld64(se8) != 0) {
				const v = ld64(se8 + 8)
				const u = ld64(se8 + 0x10)
				st64(se8 + 0x10, ld64(se8 + 0x18))
				st64(se8, v, u)
				r = fn_13b430(s178, se8)
				l = ld64(s178)
				st64(a + 8, ld64(s178 + 8))
				st64(a, l)
				return r
			}
			q = ld64(sc0)
			if (-1 >= (q as i64)) {
				r = fn_87630(s188, 0x15)
				q = ld64(s188 + 8)
				l = ld64(s188)
				if (l != 2) {
					st64(a + 8, q)
					st64(a, l)
					return r
				}
			}
			const s = ld64(accounts + 0x58)
			st64(se8, 0, 0, 0, 0)
			const t = memcmp(s + 0x28, se8, 0x20)
			if (m != 0) {
				if ((t as u32) == 0) {
					r = fn_87630(s198, 0x3f)
					l = ld64(s198)
					st64(a + 8, ld64(s198 + 8))
					st64(a, l)
					return r
				}
				if ((bq > q ? 0x3f481 > bq - q : 0x1f > q - bq) == 0) {
					r = fn_87630(s198, 0x3f)
					l = ld64(s198)
					st64(a + 8, ld64(s198 + 8))
					st64(a, l)
					return r
				}
			}
			const w: AccountInfo = accounts.token_mint_a.info
			const x: LamportsCell = w.lamports
			const aa = ld64(accounts + 0x38)
			const z = w.key
			rc_inc(x)
			const y: DataCell = w.data
			let bn = z
			let bo = aa
			let bp = x
			rc_inc(y)
			const ae = w.owner
			const ad = w.rent_epoch
			const ac = w.is_signer
			const ab = w.is_writable
			st8(sc0 + 2, w.executable)
			st8(sc0, ac, ab)
			st64(se8, bn, bp, y, ae, ad)
			st64(s1000 + 8, ld64(accounts + 0x60))
			bn = accounts + 0x70
			st64(s1000 + 0x10, accounts + 0x70)
			st64(s1000, accounts + 0x28)
			r = fn_78f88(s1a8, bo, accounts + 0x48, se8, accounts + 0x28, ld64(s1000 + 8), accounts + 0x70)
			l = ld64(s1a8)
			if (l == 2) {
				const af = bp
				if (rc_release(bp)) {
					st64(af + 8, ld64(af + 8) - 1)
				}
				rc_dec(y)
				bp = ld64(accounts + 0x38)
				bo = se8
				AccountInfo_clone(se8, accounts.token_mint_b.info)
				st64(s1000 + 8, ld64(accounts + 0x68))
				st64(s1000 + 0x10, bn)
				st64(s1000, accounts + 0x28)
				r = fn_78f88(s1b8, bp, accounts + 0x50, bo, accounts + 0x28, ld64(s1000 + 8), bn)
				l = ld64(s1b8)
				if (l == 2) {
					const ah = ld64(se8 + 0x10)
					const ag = ld64(se8 + 8)
					rc_dec(ag)
					rc_dec(ah)
					const ai = ld64(ld64(ld64(accounts)))
					copyr(se8, ai, 0x20)
					r = fn_82008(s108, accounts + 0x18, se8, accounts.token_mint_a)
					l = ld64(s108)
					if (l == 2) {
						let am = ld8(s100)
						const aj = ld64(ld64(ld64(accounts)))
						copyr(se8, aj, 0x20)
						r = fn_82008(s108, accounts + 0x20, se8, accounts.token_mint_b)
						l = ld64(s108)
						if (l == 2) {
							am = ld8(s100) != 0 ? 1 : am
							const ao = ld64(accounts)
							const an = ld64(accounts + 0x38)
							const ak = accounts.token_vault_a.key
							copyr(s108, ak, 0x20)
							const al = accounts.token_vault_b.key
							copyr(se8, al, 0x20)
							st64(s1000, bs, bu, c, d, br, s148, s108, s128, se8, am as u8)
							r = fn_5db48(s1c8, an + 8, ao, bt, bs, bu, c, d, br, s148, s108, s128, se8, am as u8)
							l = ld64(s1c8)
							if (l == 2) {
								r = fn_1578(se8, ld64(accounts + 0x40), undef, undef, undef, r)
								q = ld64(se8 + 0x10)
								if (ld64(se8) == 0) {
									const bb = ld64(se8 + 8)
									const at = ld64(ld64(ld64(accounts + 0x38)))
									copyr(se8, at, 0x20)
									const au = ld64(accounts + 0x58)
									const ba = ld16(au + 0x76)
									const az = ld16(au + 0x78)
									const ay = ld16(au + 0x7a)
									const ax = ld32(au + 0x68)
									const aw = ld32(au + 0x6c)
									const av = ld16(au + 0x7e)
									st64(s1000 + 0x38, ld16(au + 0x7c))
									st64(s1000 + 0x40, av)
									st64(s1000, bq, bu, ba, az, ay, ax, aw)
									r = fn_5b7e8(s1d8, bb, se8, m, bq, bu, ba, az, ay, ax, aw, ld64(s1000 + 0x38), av)
									l = ld64(s1d8)
									if (l == 2) {
										const bc = ld64(ld64(ld64(accounts + 0x38)))
										copyr(se8, bc, 0x20)
										const bd = ld64(ld64(ld64(accounts)))
										copyr(sc8, bd, 0x20)
										const token_mint_a_2: Mint = accounts.token_mint_a
										const bf = token_mint_a_2.info.key
										copyr(sa8, bf, 0x20)
										const token_mint_b_2: Mint = accounts.token_mint_b
										const bh = token_mint_b_2.info.key
										copyr(s88, bh, 0x20)
										const bi = ld64(ld64(accounts + 0x60))
										copyr(s68, bi, 0x20)
										const bj = ld64(ld64(accounts + 0x68))
										copyr(s48, bj, 0x20)
										const bl = token_mint_a_2.decimals
										const bk = token_mint_b_2.decimals
										st64(s28, c, d)
										st8(s16, bl, bk)
										st16(s28 + 0x10, bu)
										fn_88db0(s108, se8)
										copyr(s10, s100, 0x10)
										r = log_data(s10, 1)
										st64(q, ld64(q) + 1)
										st64(a + 8, q)
										st64(a, 2)
										return r
									}
									const bm = ld64(s1d8 + 8)
									st64(q, ld64(q) + 1)
									st64(a + 8, bm)
									st64(a, l)
									return r
								}
								l = ld64(se8 + 8)
								st64(a + 8, q)
								st64(a, l)
								return r
							}
							st64(a + 8, ld64(s1c8 + 8))
							st64(a, l)
							return r
						}
						st64(a + 8, ld64(s100))
						st64(a, l)
						return r
					}
					st64(a + 8, ld64(s100))
					st64(a, l)
					return r
				}
				q = ld64(s1b8 + 8)
				const ar = ld64(se8 + 0x10)
				const aq = ld64(se8 + 8)
				rc_dec(aq)
				if (!rc_release(ar)) {
					st64(a + 8, q)
					st64(a, l)
					return r
				}
				st64(ar + 8, ld64(ar + 8) - 1)
				st64(a + 8, q)
				st64(a, l)
				return r
			}
			q = ld64(s1a8 + 8)
			const ap = bp
			if (rc_release(bp)) {
				st64(ap + 8, ld64(ap + 8) - 1)
			}
			if (!rc_release(y)) {
				st64(a + 8, q)
				st64(a, l)
				return r
			}
			y.weak = y.weak - 1
			st64(a + 8, q)
			st64(a, l)
			return r
		}
		st64(a + 8, ld64(se8 + 8))
		st64(a, l)
		return r
	}
	st64(a + 8, ld64(se8 + 8))
	st64(a, l)
	return r
}

export function fn_1578(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let j, n: u64
	if (ld8(b + 0x29) != 0) {
		n = fn_143448(s18, b, r0)
		const i = ld64(s18 + 0x10)
		const g = ld64(s18 + 8)
		const f = ld64(s18)
		if (f == 0x800000000000001a /* Ok */) {
			const h = ld64(g + 8)
			if (h > 7) {
				const k = ld64(g)
				let l = ld8(k)
				if (l == 0) {
					l = ld8(k + 1)
					if (l == 0) {
						l = ld8(k + 2)
						if (l == 0) {
							l = ld8(k + 3)
							if (l == 0) {
								l = ld8(k + 4)
								if (l == 0) {
									l = ld8(k + 5)
									if (l == 0) {
										l = ld8(k + 6)
										if (l == 0) {
											l = ld8(k + 7)
											if (l == 0) {
												if (h > 0xfd) {
													st64(a + 0x10, i)
													st64(a + 8, k + 8)
													st64(a, 0)
													return n
												}
												fn_14c5c0(0xfe, h, 0x100159330)
											}
										}
									}
								}
							}
						}
					}
				}
				n = anchor_error_from(s38, 0xbb8 /* anchor::AccountDiscriminatorAlreadySet */, l)
				const m = ld64(s38)
				st64(a + 0x10, ld64(s38 + 8))
				st64(a + 8, m)
				st64(a, 1)
				st64(i, ld64(i) + 1)
				return n
			}
			fn_14c5c0(8, h, 0x100159318)
		}
		st64(s18, f, g, i)
		n = fn_13b430(s28, s18)
		j = ld64(s28)
		st64(a + 0x10, ld64(s28 + 8))
		st64(a + 8, j)
		st64(a, 1)
		return n
	}
	n = anchor_error_from(s48, 0xbbe /* anchor::AccountNotMutable */, c, d, e)
	j = ld64(s48)
	st64(a + 0x10, ld64(s48 + 8))
	st64(a + 8, j)
	st64(a, 1)
	return n
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), p5 (value)
export function fn_5b7e8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64, p13: u64): u64 {
	const s10 = fp - 0x10
	let g, p: u64
	let f = 0
	if (d != 0) {
		f = p5
	}
	B13: {
		st64(b + 0x18, ld64(c + 0x18))
		st64(b + 0x10, ld64(c + 0x10))
		st64(b + 8, ld64(c + 8))
		st64(b, ld64(c))
		st64(b + 0x20, f)
		g = p7
		const h = g
		if ((g as u16) != 0) {
			const i = p8
			if ((i as u16) > (h as u16)) {
				const j = p10
				if (0x1869f >= (j as u32)) {
					const l = p12
					const k = p11
					const m = p6
					const o = ((k as u32) * (l as u16) >> 0x20) != 0
					if ((m as u16) > ((l - 1) as u16)) {
						const n = p9
						if (0x270f >= (n as u16) && (o & 1) == 0) {
							p = (m as u16) % (l as u16)
							if (p == 0) {
								const q = p13
								if ((q as u16) != 0 && (m as u16) * 0x58 >= (q as u16)) {
									st16(b + 0x38, q)
									st16(b + 0x36, l)
									st32(b + 0x32, k)
									st32(b + 0x2e, j)
									st16(b + 0x2c, n)
									st16(b + 0x2a, i)
									st16(b + 0x28, g)
									st64(b + 0x3a, 0, 0)
									break B13
								}
							}
						}
					}
				}
			}
		}
		p = fn_87630(s10, 0x3d)
		g = ld64(s10 + 8)
		const r = ld64(s10)
		if (r != 2) {
			st64(a + 8, g)
			st64(a, r)
			return p
		}
	}
	st32(b + 0x72, 0)
	st64(b + 0x6a, 0)
	st64(b + 0x62, 0)
	st64(b + 0x5a, 0)
	st64(b + 0x52, 0)
	st64(b + 0x4a, 0)
	st64(a + 8, g)
	st64(a, 2)
	return p
}
