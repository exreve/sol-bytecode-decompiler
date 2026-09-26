/// <reference path="../lib.d.ts" />
// instruction open_bundled_position
import { fn_143100, fn_149678, fn_14e1c0, fn_14efa0, fn_14f7f8, fn_4a30, fn_4c1a0, fn_5a40, fn_5ffd0, fn_60930, fn_7f28, fn_b9c0, log_data, memcpy } from '../shared.ts'

// instruction handler: open_bundled_position (discriminator sha256("global:open_bundled_position")[..8] = 0x31d4acd5ab7e71a9)
// accounts [str: the program's account-error strings, in order of first use]: position_bundle, position_bundle_token_account, whirlpool, rent, bundled_position, funder, system_program, position_bundle_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: bundled_position, position_bundle
export function ix_open_bundled_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s40 = fp - 0x40, s48 = fp - 0x48, s58 = fp - 0x58, s98 = fp - 0x98, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sc1 = fp - 0xc1, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s1000 = fp - 0x1000
	let j, o: u64
	sol_log("Instruction: OpenBundledPosition", 0x20)
	const f = ix_args_len
	if (f >= 2 && (f - 2 >= 4 && f - 6 >= 4)) {
		const g = ix_args
		const r = ld16(g)
		const q = ld32(g + 2)
		const p = ld32(g + 6)
		st8(sc1, 0xff)
		st64(sc0, accounts, accounts_len)
		st64(s1000, f, sc1)
		o = accounts_open_bundled_position(s58, program_id, sc0, g, fp)
		const i = ld64(s48)
		j = ld64(s58 + 8)
		const h = ld64(s58)
		if (h == 0) {
			st64(a + 8, i)
			st64(a, j)
			return o
		}
		memcpy(s98, s40, 0x40)
		st64(sb0, h, j, i)
		st8(s40 + 8, ld8(sc1))
		copyr(s48, sc0, 0x10)
		st64(s58, program_id, sb0)
		o = fn_338a0(sd8, s58, r, q, p)
		j = ld64(sd8)
		if (j == 2) {
			fn_5a40(se8, ld64(sb0), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
			const k = ld64(se8)
			if (k != 2) {
				o = Error_with_account_name(sf8, k, ld64(se8 + 8), "bundled_position", 0x10)
				j = ld64(sf8)
				st64(a + 8, ld64(sf8 + 8))
				st64(a, j)
				return o
			}
			o = fn_7f28(s108, ld64(sb0 + 8), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
			const l = ld64(s108)
			if (l == 2) {
				st64(a + 8, i)
				st64(a, 2)
				return o
			}
			o = Error_with_account_name(s118, l, ld64(s108 + 8), "position_bundle", 0xf)
			j = ld64(s118)
			st64(a + 8, ld64(s118 + 8))
			st64(a, j)
			return o
		}
		st64(a + 8, ld64(sd8 + 8))
		st64(a, j)
		return o
	}
	const m = fn_1459d0(0x100159468)
	if (2 > (m & 3) - 2) {
		o = anchor_error_from(s128, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s128)
		st64(a + 8, ld64(s128 + 8))
		st64(a, j)
		return o
	}
	if ((m & 3) == 0) {
		o = anchor_error_from(s128, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s128)
		st64(a + 8, ld64(s128 + 8))
		st64(a, j)
		return o
	}
	const n = ld64(ld64(m + 7))
	callx(n, ld64(m - 1), n)
	o = anchor_error_from(s128, 0x66 /* anchor::InstructionDidNotDeserialize */)
	j = ld64(s128)
	st64(a + 8, ld64(s128 + 8))
	st64(a, j)
	return o
}

// Anchor Accounts::try_accounts of instruction open_bundled_position (called by ix_open_bundled_position; name [str]: from the handler's "Instruction: …" log; was fn_b2f30)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_bundle (ConstraintMut), position_bundle_token_account (ConstraintRaw), whirlpool, rent, bundled_position (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), funder (ConstraintMut), system_program, position_bundle_authority
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_bundle_token_account_box, bundled_position, funder
export function accounts_open_bundled_position(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s270 = fp - 0x270, s288 = fp - 0x288, s290 = fp - 0x290, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2d8 = fp - 0x2d8, s2f8 = fp - 0x2f8, s2f9 = fp - 0x2f9, s320 = fp - 0x320, s338 = fp - 0x338, s350 = fp - 0x350, s358 = fp - 0x358, s360 = fp - 0x360, s368 = fp - 0x368, s36a = fp - 0x36a, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s548 = fp - 0x548, s550 = fp - 0x550, s558 = fp - 0x558, s560 = fp - 0x560, s568 = fp - 0x568, s570 = fp - 0x570
	let aj, ak: u64
	st64(s378, b)
	if (2 > ld64(e - 0x1000)) {
		const k = fn_1459d0(0x100159468)
		if (2 > (k & 3) - 2) {
			ak = anchor_error_from(s518, 0x66 /* anchor::InstructionDidNotDeserialize */)
			aj = ld64(s518)
			st64(a + 0x10, ld64(s518 + 8))
			st64(a + 8, aj)
			st64(a, 0)
			return ak
		}
		if ((k & 3) == 0) {
			ak = anchor_error_from(s518, 0x66 /* anchor::InstructionDidNotDeserialize */)
			aj = ld64(s518)
			st64(a + 0x10, ld64(s518 + 8))
			st64(a + 8, aj)
			st64(a, 0)
			return ak
		}
		const l = ld64(ld64(k + 7))
		callx(l, ld64(k - 1), l)
		ak = anchor_error_from(s518, 0x66 /* anchor::InstructionDidNotDeserialize */)
		aj = ld64(s518)
		st64(a + 0x10, ld64(s518 + 8))
		st64(a + 8, aj)
		st64(a, 0)
		return ak
	}
	const i = ld64(e - 0xff8)
	st16(s36a, ld16(d))
	const f = ld64(c + 8)
	if (f == 0) {
		ak = anchor_error_from(s508, 0xbbd /* anchor::AccountNotEnoughKeys */, c, d, e)
		aj = ld64(s508)
		st64(a + 0x10, ld64(s508 + 8))
		st64(a + 8, aj)
		st64(a, 0)
		return ak
	}
	const g: AccountInfo = ld64(c)
	st64(s368, g)
	st64(c + 8, f - 1)
	st64(c, g + 0x30)
	try_accounts_11bb8(s290, c, c, d, e)
	if (ld64(s290) == 0) {
		ak = Error_with_account_name(s4f8, ld64(s288), ld64(s288 + 8), "position_bundle", 0xf)
		aj = ld64(s4f8)
		st64(a + 0x10, ld64(s4f8 + 8))
		st64(a + 8, aj)
		st64(a, 0)
		return ak
	}
	const h = ld64(0x300000000 /* heap bump-allocator cursor */)
	st64(s548 + 0x28, i)
	const j = h != 0 ? sat_sub(h, 0x48) & -8 : 0x300007fb8
	if (j > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		memcpy(j, s290, 0x48)
		try_accounts_11f50(s290, c)
		if (ld32(s270 + 0x70) == 2) {
			ak = Error_with_account_name(s4e8, ld64(s290), ld64(s288), "position_bundle_token_account", 0x1d)
			aj = ld64(s4e8)
			st64(a + 0x10, ld64(s4e8 + 8))
			st64(a + 8, aj)
			st64(a, 0)
			return ak
		}
		const m = ld64(0x300000000 /* heap bump-allocator cursor */)
		const position_bundle_token_account_box: TokenAccount = m != 0 ? sat_sub(m, 0xb8) & -8 : 0x300007f48
		if (position_bundle_token_account_box > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, position_bundle_token_account_box)
			memcpy(position_bundle_token_account_box, s290, 0xb8)
			try_accounts_11718(s290, c)
			const p = ld64(s288)
			const o = ld64(s290)
			if (o == 2) {
				st64(s548 + 0x20, p)
				try_accounts_11a48(s290, c, p)
				if (ld64(s290) == 0) {
					ak = Error_with_account_name(s4d8, ld64(s288), ld64(s288 + 8), 0x100152b28 /* "whirlpool" */, 9)
					aj = ld64(s4d8)
					st64(a + 0x10, ld64(s4d8 + 8))
					st64(a + 8, aj)
					st64(a, 0)
					return ak
				}
				const q = ld64(0x300000000 /* heap bump-allocator cursor */)
				const r = q != 0 ? sat_sub(q, 0x290) & -8 : 0x300007d70
				if (r > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, r)
					st64(s548 + 0x18, r)
					memcpy(r, s290, 0x290)
					try_accounts_11718(s290, c)
					const t = ld64(s288)
					const s = ld64(s290)
					if (s == 2) {
						st64(s360, t)
						fn_122e8(s290, c, t)
						const v = ld64(s288)
						const u = ld64(s290)
						if (u == 2) {
							st64(s358, v)
							try_accounts_11990(s290, c, v)
							const y = ld64(s288 + 8)
							const x = ld64(s288)
							const w = ld64(s290)
							if (w == 0) {
								ak = Error_with_account_name(s4c8, x, y, 0x100152d60 /* "rent" */, 4)
								aj = ld64(s4c8)
								st64(a + 0x10, ld64(s4c8 + 8))
								st64(a + 8, aj)
								st64(a, 0)
								return ak
							}
							st64(s548, w, x, y)
							const z = ld64(s288 + 0x10)
							rent_get(s290)
							copy(s338, s288, 0x18)
							if (ld64(s290) == 0) {
								st64(s550, z)
								copyr(s350, s338, 0x18)
								copyr(s2f8, j + 8, 0x20)
								fn_b9c0(s2d8, s36a)
								st64(s288 + 8, s2f8)
								st64(s290, 0x100153000)
								copyr(s270, s2d0, 0x10)
								st64(s288 + 0x10, 0x20)
								st64(s288, 0x10)
								// PDA find_program_address(["bundled_position", *s2f8, ?], program *(ld64(s378)))
								Pubkey_find_program_address(s2c0, s290, 3, ld64(s378))
								copyr(s320, s2c0, 0x20)
								const aa = ld8(s2c0 + 0x20)
								st8(s2f9, aa)
								st8(ld64(s548 + 0x28), aa)
								const ab = ld64(ld64(s368))
								copy(s290, ab, 0x20)
								if ((memcmp(s290, s320, 0x20) as u32) == 0) {
									st64(s548 + 0x28, position_bundle_token_account_box)
									st64(s290, s368, s350, s360, s358, j, s36a, s2f9, s378)
									ak = fn_b4498(s2c0, s290)
									const al = ld64(s2c0 + 8)
									aj = ld64(s2c0)
									if (aj == 2) {
										const bundled_position: AccountInfo = ld64(al)
										if (bundled_position.is_writable == 0) {
											anchor_error_from(s4a8, 0x7d0 /* anchor::ConstraintMut */)
											ak = Error_with_account_name(s4b8, ld64(s4a8), ld64(s4a8 + 8), "bundled_position", 0x10)
											aj = ld64(s4b8)
											st64(a + 0x10, ld64(s4b8 + 8))
											st64(a + 8, aj)
											st64(a, 0)
											return ak
										}
										AccountInfo_clone(s2c0, bundled_position)
										st64(s558, fn_143100(s2c0))
										AccountInfo_clone(s290, ld64(al))
										AccountInfo_try_data_len(s2f8, s290)
										const ao = ld64(s2f8 + 8)
										const an = ld64(s2f8)
										if (an != 0x800000000000001a /* Ok */) {
											st64(s2f8 + 0x10, ld64(s2f8 + 0x10))
											st64(s2f8, an, ao)
											ak = fn_13b430(s3f8, s2f8)
											const bb = ld64(s3f8)
											st64(a + 0x10, ld64(s3f8 + 8))
											st64(a + 8, bb)
											st64(a, 0)
											const bd = ld64(s288 + 8)
											const bc = ld64(s288)
											rc_dec(bc)
											rc_dec(bd)
											const bf = ld64(s2c0 + 0x10)
											const be = ld64(s2c0 + 8)
											rc_dec(be)
											if (!rc_release(bf)) {
												return ak
											}
											st64(bf + 8, ld64(bf + 8) - 1)
											return ak
										}
										const ap = __floatundidf(ld64(s350) * (ao + 0x80))
										const aq = fn_14f7f8(ld64(s350 + 8), ap)
										st64(s560, 0)
										st64(s570, fn_151cb0(aq, 0))
										st64(s568, aq)
										const ar = fn_14f3e8(aq)
										if ((ld64(s570) as i64) >= 0) {
											st64(s560, ar)
										}
										const at = fn_151a40(ld64(s568), 0x43efffffffffffff)
										let ba = -1
										if (0 >= (at as i64)) {
											ba = ld64(s560)
										}
										const av = ld64(s288 + 8)
										const au = ld64(s288)
										rc_dec(au)
										rc_dec(av)
										const ay = ld64(s2c0 + 0x10)
										const aw = ld64(s2c0 + 8)
										let ax = ld64(aw) - 1
										st64(aw, ax)
										if (ax == 0) {
											ax = ld64(aw + 8) - 1
											st64(aw + 8, ax)
										}
										let az = ld64(ay) - 1
										st64(ay, az)
										if (az == 0) {
											az = ld64(ay + 8) - 1
											st64(ay + 8, az)
										}
										if (ba > ld64(s558)) {
											anchor_error_from(s488, 0x7d5 /* anchor::ConstraintRentExempt */, az, ax)
											ak = Error_with_account_name(s498, ld64(s488), ld64(s488 + 8), "bundled_position", 0x10)
											aj = ld64(s498)
											st64(a + 0x10, ld64(s498 + 8))
											st64(a + 8, aj)
											st64(a, 0)
											return ak
										}
										if (ld8(ld64(j) + 0x29) != 0) {
											ak = memcmp(ld64(s548 + 0x28) + 8, j + 8, 0x20) as u32
											if (ak == 0) {
												if (ld64(ld64(s548 + 0x28) + 0x48) != 1) {
													anchor_error_from(s428, 0x7d3 /* anchor::ConstraintRaw */)
													ak = Error_with_account_name(s438, ld64(s428), ld64(s428 + 8), "position_bundle_token_account", 0x1d)
													aj = ld64(s438)
													st64(a + 0x10, ld64(s438 + 8))
													st64(a + 8, aj)
													st64(a, 0)
													return ak
												}
												const funder: AccountInfo = ld64(s360)
												if (funder.is_writable == 0) {
													anchor_error_from(s448, 0x7d0 /* anchor::ConstraintMut */)
													ak = Error_with_account_name(s458, ld64(s448), ld64(s448 + 8), "funder", 6)
													aj = ld64(s458)
													st64(a + 0x10, ld64(s458 + 8))
													st64(a + 8, aj)
													st64(a, 0)
													return ak
												}
												const bh = ld64(s358)
												st64(a + 0x50, ld64(s550))
												st64(a + 0x48, ld64(s548 + 0x10))
												st64(a + 0x40, ld64(s548 + 8))
												st64(a + 0x38, ld64(s548))
												st64(a + 0x30, bh)
												st64(a + 0x28, funder)
												st64(a + 0x20, ld64(s548 + 0x18))
												st64(a + 0x18, ld64(s548 + 0x20))
												st64(a + 0x10, ld64(s548 + 0x28))
												st64(a + 8, j)
												st64(a, al)
												return ak
											}
											anchor_error_from(s408, 0x7d3 /* anchor::ConstraintRaw */)
											ak = Error_with_account_name(s418, ld64(s408), ld64(s408 + 8), "position_bundle_token_account", 0x1d)
											aj = ld64(s418)
											st64(a + 0x10, ld64(s418 + 8))
											st64(a + 8, aj)
											st64(a, 0)
											return ak
										}
										anchor_error_from(s468, 0x7d0 /* anchor::ConstraintMut */, az, ax)
										ak = Error_with_account_name(s478, ld64(s468), ld64(s468 + 8), "position_bundle", 0xf)
										aj = ld64(s478)
										st64(a + 0x10, ld64(s478 + 8))
										st64(a + 8, aj)
										st64(a, 0)
										return ak
									}
									st64(a + 0x10, al)
									st64(a + 8, aj)
									st64(a, 0)
									return ak
								}
								anchor_error_from(s3c8, 0x7d6 /* anchor::ConstraintSeeds */)
								Error_with_account_name(s3d8, ld64(s3c8), ld64(s3c8 + 8), "bundled_position", 0x10)
								const ai = ld64(s3d8 + 8)
								const ah = ld64(s3d8)
								const ac = ld64(ld64(s368))
								const ag = ld64(ac + 0x18)
								const af = ld64(ac + 0x10)
								const ae = ld64(ac + 8)
								const ad = ld64(ac)
								copy(s270, s320, 0x20)
								st64(s290, ad, ae, af, ag)
								ak = fn_13b5c0(s3e8, ah, ai, s290, ae)
								aj = ld64(s3e8)
								st64(a + 0x10, ld64(s3e8 + 8))
								st64(a + 8, aj)
								st64(a, 0)
								return ak
							}
							ak = fn_13b430(s3b8, s338)
							aj = ld64(s3b8)
							st64(a + 0x10, ld64(s3b8 + 8))
							st64(a + 8, aj)
							st64(a, 0)
							return ak
						}
						ak = Error_with_account_name(s3a8, u, v, "system_program", 0xe)
						aj = ld64(s3a8)
						st64(a + 0x10, ld64(s3a8 + 8))
						st64(a + 8, aj)
						st64(a, 0)
						return ak
					}
					ak = Error_with_account_name(s398, s, t, "funder", 6)
					aj = ld64(s398)
					st64(a + 0x10, ld64(s398 + 8))
					st64(a + 8, aj)
					st64(a, 0)
					return ak
				}
				alloc_handle_alloc_error(8, 0x290)
			}
			ak = Error_with_account_name(s388, o, p, "position_bundle_authority", 0x19)
			aj = ld64(s388)
			st64(a + 0x10, ld64(s388 + 8))
			st64(a + 8, aj)
			st64(a, 0)
			return ak
		}
		alloc_handle_alloc_error(8, 0xb8)
	}
	alloc_handle_alloc_error(8, 0x48)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: bundled_position
export function fn_b4498(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s40 = fp - 0x40, s48 = fp - 0x48, s58 = fp - 0x58, s60 = fp - 0x60, s138 = fp - 0x138, s158 = fp - 0x158, s178 = fp - 0x178, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1e0 = fp - 0x1e0, s220 = fp - 0x220, s240 = fp - 0x240, s260 = fp - 0x260, s2c8 = fp - 0x2c8, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f8 = fp - 0x2f8, s300 = fp - 0x300, s310 = fp - 0x310, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s418 = fp - 0x418, s428 = fp - 0x428, s430 = fp - 0x430, s438 = fp - 0x438, s440 = fp - 0x440, s448 = fp - 0x448, s450 = fp - 0x450
	let bp, db, dd, de, df: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s398, f, b)
	if (g != 0) {
		const o = ld64(ld64(b + 0x10))
		st64(s3e0 + 0x28, o)
		const p = ld64(o)
		copyr(s40, p + 8, 0x18)
		st64(s3e0 + 0x30, p)
		st64(s48, ld64(p))
		const q = ld64(f)
		copyr(s310, q + 8, 0x18)
		st64(s3e0 + 0x38, q)
		st64(s318, ld64(q))
		if ((memcmp(s48, s318, 0x20) as u32) == 0) {
			ErrorCode_name(s158, 0x100152d40)
			st64(s198, 0, 1, 0)
			st64(s28, s198, 0x100159480)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s40 + 8, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100152d40, s48) == 0) {
				copyr(s2e0, s198, 0x18)
				copy(s2f8, s158, 0x18)
				st64(s310, 0x100154a4a)
				st32(s2c8 + 0x48, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s2c8, 2)
				st32(s300, 0xc)
				st64(s310 + 8, 0x3c)
				st64(s318, 0)
				const av = fn_13b3a8(s358, s318)
				const au = ld64(s358 + 8)
				const at = ld64(s358)
				const aq = ld64(s3e0 + 0x30)
				copyr(s318, aq, 0x20)
				const ar = ld64(s3e0 + 0x38)
				copy(s2f8, ar, 0x20)
				df = fn_13b5c0(s368, at, au, s318, av)
				const aw = ld64(s368)
				st64(a + 8, ld64(s368 + 8))
				st64(a, aw)
				return df
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1, 0x1001594b0, 0x1001594d0)
		}
		st64(s3e0 + 0x40, a)
		const r = ld64(b + 8)
		const s = __floatundidf(ld64(r) * 0x158)
		const t = fn_14f7f8(ld64(r + 8), s)
		const u = fn_151cb0(t, 0)
		const v = fn_14f3e8(t)
		const w = fn_151a40(t, 0x43efffffffffffff)
		let ay: AccountInfo = ld64(s398)
		const x = max((w as i64) > 0 ? 0xffffffffffffffff : 0 > (u as i64) ? 0 : v, 1)
		let bs = ld64(s398 + 8)
		if (x > g) {
			const y: AccountInfo = ld64(s3e0 + 0x28)
			const z: LamportsCell = y.lamports
			rc_inc(z)
			const ax: DataCell = y.data
			rc_inc(ax)
			const az: LamportsCell = ay.lamports
			const ba = az.strong
			st64(s3e0 + 0x10, ay.key)
			st64(s3e0 + 0x18, y.executable)
			st64(s3e0 + 0x20, y.is_writable)
			st64(s3e0 + 0x38, y.is_signer)
			const bd = y.rent_epoch
			const be = y.owner
			rc_inc(az, ba)
			const bb: DataCell = ay.data
			const bc = bb.strong
			st64(s3e0 + 8, bd)
			st64(s3e0 + 0x28, be)
			rc_inc(bb, bc)
			const bf: AccountInfo = ld64(ld64(ld64(s398 + 8) + 0x18))
			const bg: LamportsCell = bf.lamports
			const bh = bg.strong
			st64(s3e0, sat_sub(x, g))
			st64(s418 + 0x10, ay.executable)
			st64(s418 + 0x18, ay.is_writable)
			st64(s418 + 0x20, ay.is_signer)
			st64(s3f0, ay.rent_epoch)
			st64(s3f0 + 8, ay.owner)
			const bk = bf.key
			rc_inc(bg, bh)
			const bi: DataCell = bf.data
			const bj = bi.strong
			st64(s418, z, bk)
			rc_inc(bi, bj)
			st64(s428 + 8, bf.owner)
			const bo = bf.rent_epoch
			const bn = bf.is_signer
			const bm = bf.is_writable
			const bl = bf.executable
			st8(s1e0 + 0x22, ld64(s418 + 0x10))
			st8(s1e0 + 0x21, ld64(s418 + 0x18))
			st8(s1e0 + 0x20, ld64(s418 + 0x20))
			st64(s1e0 + 0x18, ld64(s3f0))
			st64(s1e0 + 0x10, ld64(s3f0 + 8))
			st64(s1e0, az, bb)
			st64(s220 + 0x38, ld64(s3e0 + 0x10))
			st8(s220 + 0x32, ld64(s3e0 + 0x18))
			st8(s220 + 0x31, ld64(s3e0 + 0x20))
			st8(s220 + 0x30, ld64(s3e0 + 0x38))
			st64(s220 + 0x28, ld64(s3e0 + 8))
			st64(s220 + 0x20, ld64(s3e0 + 0x28))
			st64(s220 + 0x18, ax)
			st64(s220 + 0x10, ld64(s418))
			st64(s220 + 8, ld64(s3e0 + 0x30))
			st8(s220, bn, bm, bl)
			st64(s240 + 0x18, bo)
			st64(s240 + 0x10, ld64(s428 + 8))
			st64(s240, bg, bi)
			st64(s260 + 0x18, ld64(s418 + 8))
			st64(s1b8, 8, 0)
			st64(s260, 0, 8, 0)
			df = fn_13d318(s328, s260, ld64(s3e0))
			bp = ld64(s328)
			if (bp != 2) {
				de = ld64(s328 + 8)
				dd = ld64(s3e0 + 0x40)
				st64(dd, bp, de)
				return df
			}
			ay = ld64(s398)
			st64(s3e0 + 0x38, ay.key)
			bs = ld64(s398 + 8)
		}
		const bq: LamportsCell = ay.lamports
		rc_inc(bq)
		const br: DataCell = ay.data
		rc_inc(br)
		const bt: AccountInfo = ld64(ld64(bs + 0x18))
		const bu: LamportsCell = bt.lamports
		const bv = bu.strong
		st64(s3e0 + 0x28, ay.executable)
		st64(s3e0 + 0x30, ay.is_writable)
		const by = ay.is_signer
		const bz = ay.rent_epoch
		const ca = ay.owner
		st64(s3e0 + 0x20, bt.key)
		rc_inc(bu, bv)
		const bw: DataCell = bt.data
		const bx = bw.strong
		st64(s3f0, by, bz, ca, bu, br, bq)
		rc_inc(bw, bx)
		st64(s418, bt.executable)
		st64(s418 + 8, bt.is_writable)
		st64(s418 + 0x10, bt.is_signer)
		st64(s418 + 0x18, bt.rent_epoch)
		st64(s418 + 0x20, bt.owner)
		const cb = ld64(s398 + 8)
		const cc = ld64(cb + 0x20)
		copyr(s198, cc + 8, 0x20)
		const cd = ld64(cb + 0x28)
		st64(s158, 0, 1, 0)
		st64(s2f8, s158, 0x100159480)
		st8(s2e0, 3)
		st64(s2f8 + 0x10, 0x20)
		st64(s310 + 8, 0)
		st64(s318, 0)
		st64(s428 + 8, cd)
		if (fn_14efa0(cd, s318) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1, 0x1001594b0, 0x1001594d0)
		}
		const cf = ld64(s158 + 8)
		const ce = ld64(s158 + 0x10)
		const cg = ld8(ld64(cb + 0x30))
		st64(s28, cf, ce, s158)
		st64(s40 + 8, s198)
		st64(s48, 0x100153000)
		st64(s60, s48)
		st64(s2c8 + 0x28, s60)
		st8(s2c8 + 0x22, ld64(s418))
		st8(s2c8 + 0x21, ld64(s418 + 8))
		st8(s2c8 + 0x20, ld64(s418 + 0x10))
		st64(s2c8 + 0x18, ld64(s418 + 0x18))
		st64(s2c8 + 0x10, ld64(s418 + 0x20))
		st64(s2c8 + 8, bw)
		st64(s2c8, ld64(s3e0 + 8))
		st64(s2d0, ld64(s3e0 + 0x20))
		st8(s2e0 + 0xa, ld64(s3e0 + 0x28))
		st8(s2e0 + 9, ld64(s3e0 + 0x30))
		st8(s2e0 + 8, ld64(s3f0))
		st64(s2e0, ld64(s3f0 + 8))
		st64(s2f8 + 0x10, ld64(s3e0))
		st64(s2f8 + 8, ld64(s3e0 + 0x10))
		st64(s2f8, ld64(s3e0 + 0x18))
		st64(s300, ld64(s3e0 + 0x38))
		st8(s158, cg)
		st64(s28 + 0x18, 1)
		st64(s40 + 0x10, 0x20)
		st64(s40, 0x10)
		st64(s58, 4)
		st64(s2c8 + 0x30, 1)
		st64(s318, 0, 8, 0)
		df = fn_13c8b8(s338, s318, 0xd8)
		bp = ld64(s338)
		if (bp != 2) {
			de = ld64(s338 + 8)
			dd = ld64(s3e0 + 0x40)
			st64(dd, bp, de)
			return df
		}
		const ch: AccountInfo = ld64(s398)
		const ci: LamportsCell = ch.lamports
		const cq = ch.key
		rc_inc(ci)
		const cj: DataCell = ch.data
		const ck = cj.strong
		st64(s3e0 + 0x38, cg)
		rc_inc(cj, ck)
		const cl: LamportsCell = bt.lamports
		const cm = cl.strong
		st64(s3e0 + 0x10, bt.key)
		st64(s3e0 + 0x18, ch.executable)
		st64(s3e0 + 0x20, ch.is_writable)
		st64(s3e0 + 0x28, ch.is_signer)
		st64(s3e0 + 0x30, ch.rent_epoch)
		const cp = ch.owner
		rc_inc(cl, cm)
		const cn: DataCell = bt.data
		const co = cn.strong
		st64(s3f0, cp, cj, cq, ci)
		rc_inc(cn, co)
		st64(s418 + 8, bt.executable)
		st64(s418 + 0x10, bt.is_writable)
		st64(s418 + 0x18, bt.is_signer)
		st64(s418 + 0x20, bt.rent_epoch)
		const cx = bt.owner
		copyr(s158, cc + 8, 0x20)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x100159480)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s40 + 8, 0)
		st64(s48, 0)
		if (fn_14efa0(ld64(s428 + 8), s48) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1, 0x1001594b0, 0x1001594d0)
		}
		st64(s178 + 0x10, s48)
		copyr(s178, s58, 0x10)
		st64(s198 + 0x10, s158)
		st64(s198, 0x100153000)
		st64(s1a8, s198)
		st64(s2c8 + 0x28, s1a8)
		st8(s2c8 + 0x22, ld64(s418 + 8))
		st8(s2c8 + 0x21, ld64(s418 + 0x10))
		st8(s2c8 + 0x20, ld64(s418 + 0x18))
		st64(s2c8 + 0x18, ld64(s418 + 0x20))
		st64(s2c8, cl, cn, cx)
		st64(s2d0, ld64(s3e0 + 0x10))
		st8(s2e0 + 0xa, ld64(s3e0 + 0x18))
		st8(s2e0 + 9, ld64(s3e0 + 0x20))
		st8(s2e0 + 8, ld64(s3e0 + 0x28))
		st64(s2e0, ld64(s3e0 + 0x30))
		st64(s2f8 + 0x10, ld64(s3f0))
		st64(s2f8 + 8, ld64(s3f0 + 8))
		copyr(s300, s3e0, 0x10)
		st8(s48, ld64(s3e0 + 0x38))
		st64(s178 + 0x18, 1)
		st64(s198 + 0x18, 0x20)
		st64(s198 + 8, 0x10)
		st64(s1a8 + 8, 4)
		st64(s2c8 + 0x30, 1)
		st64(s318, 0, 8, 0)
		df = fn_13cc48(s348, s318, ld64(ld64(ld64(s398 + 8) + 0x38)))
		const cy = ld64(s348)
		db = ld64(s3e0 + 0x40)
		if (cy != 2) {
			const dg = ld64(s348 + 8)
			st64(db, cy, dg)
			return df
		}
	} else {
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0x158)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const ac = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		const m: AccountInfo = ld64(ld64(ld64(s398 + 8) + 0x10))
		const n: LamportsCell = m.lamports
		const ad: AccountInfo = ld64(s398)
		const ap = m.key
		rc_inc(n)
		const aa: DataCell = m.data
		const ab = aa.strong
		st64(s3e0 + 0x38, ac)
		rc_inc(aa, ab)
		const ae: LamportsCell = ad.lamports
		const af = ae.strong
		st64(s3e0, ad.key)
		st64(s3e0 + 8, m.executable)
		st64(s3e0 + 0x10, m.is_writable)
		st64(s3e0 + 0x18, m.is_signer)
		st64(s3e0 + 0x20, m.rent_epoch)
		st64(s3e0 + 0x28, m.owner)
		st64(s3e0 + 0x30, ae)
		rc_inc(ae, af)
		const ag: DataCell = ad.data
		const ah = ag.strong
		st64(s3f0 + 8, aa)
		rc_inc(ag, ah)
		const ai: AccountInfo = ld64(ld64(ld64(s398 + 8) + 0x18))
		const aj: LamportsCell = ai.lamports
		const ak = aj.strong
		st64(s3e0 + 0x40, a)
		st64(s418 + 0x10, ad.executable)
		st64(s418 + 0x18, ad.is_writable)
		st64(s418 + 0x20, ad.is_signer)
		st64(s3f0, ad.rent_epoch)
		const an = ad.owner
		const ao = ai.key
		rc_inc(aj, ak)
		const al: DataCell = ai.data
		const am = al.strong
		st64(s428, an, ao, ap, n)
		rc_inc(al, am)
		st64(s450, ai.executable)
		st64(s448, ai.is_writable)
		st64(s440, ai.is_signer)
		st64(s438, ai.rent_epoch)
		st64(s430, ai.owner)
		const cr = ld64(s398 + 8)
		const cs = ld64(cr + 0x20)
		copyr(s198, cs + 8, 0x20)
		const ct = ld64(cr + 0x28)
		st64(s158, 0, 1, 0)
		st64(s2f8, s158, 0x100159480)
		st8(s2e0, 3)
		st64(s2f8 + 0x10, 0x20)
		st64(s310 + 8, 0)
		st64(s318, 0)
		if (fn_14efa0(ct, s318) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1, 0x1001594b0, 0x1001594d0)
		}
		const cv = ld64(s158 + 8)
		const cu = ld64(s158 + 0x10)
		const cw = ld8(ld64(cr + 0x30))
		st64(s28, cv, cu, s158)
		st64(s40 + 8, s198)
		st64(s48, 0x100153000)
		st8(s158, cw)
		st64(s60, s48)
		st64(s2c8 + 0x58, s60)
		st8(s2c8 + 0x52, ld64(s418 + 0x10))
		st8(s2c8 + 0x51, ld64(s418 + 0x18))
		st8(s2c8 + 0x50, ld64(s418 + 0x20))
		st64(s2c8 + 0x48, ld64(s3f0))
		st64(s2c8 + 0x40, ld64(s428))
		st64(s2c8 + 0x38, ag)
		st64(s2c8 + 0x30, ld64(s3e0 + 0x30))
		st64(s2c8 + 0x28, ld64(s3e0))
		st8(s2c8 + 0x22, ld64(s3e0 + 8))
		st8(s2c8 + 0x21, ld64(s3e0 + 0x10))
		st8(s2c8 + 0x20, ld64(s3e0 + 0x18))
		st64(s2c8 + 0x18, ld64(s3e0 + 0x20))
		st64(s2c8 + 0x10, ld64(s3e0 + 0x28))
		st64(s2c8 + 8, ld64(s3f0 + 8))
		copyr(s2d0, s418, 0x10)
		st8(s2e0 + 0xa, ld64(s450))
		st8(s2e0 + 9, ld64(s448))
		st8(s2e0 + 8, ld64(s440))
		st64(s2e0, ld64(s438))
		st64(s2f8 + 0x10, ld64(s430))
		st64(s2f8, aj, al)
		st64(s300, ld64(s428 + 8))
		st64(s28 + 0x18, 1)
		st64(s40 + 0x10, 0x20)
		st64(s40, 0x10)
		st64(s58, 4)
		st64(s2c8 + 0x60, 1)
		st64(s318, 0, 8, 0)
		df = fn_13cfd8(s378, s318, ld64(s3e0 + 0x38), 0xd8, ld64(ld64(cr + 0x38)))
		bp = ld64(s378)
		if (bp != 2) {
			de = ld64(s378 + 8)
			dd = ld64(s3e0 + 0x40)
			st64(dd, bp, de)
			return df
		}
		db = ld64(s3e0 + 0x40)
	}
	fn_4a30(s138, ld64(s398))
	if (ld64(s138) == 0) {
		df = Error_with_account_name(s388, ld64(s138 + 8), ld64(s138 + 0x10), "bundled_position", 0x10)
		const dc = ld64(s388)
		st64(db + 8, ld64(s388 + 8))
		st64(db, dc)
		return df
	}
	const cz = ld64(0x300000000 /* heap bump-allocator cursor */)
	const da = cz != 0 ? sat_sub(cz, 0xd8) & -8 : 0x300007f28
	if (da > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, da)
		df = memcpy(da, s138, 0xd8)
		st64(db + 8, da)
		st64(db, 2)
		return df
	}
	alloc_handle_alloc_error(8, 0xd8)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: e (value), d (value), c (value)
// types [heur]: b: OpenBundledPositionContext (the handler ix_open_bundled_position passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_338a0(a: u64, b: OpenBundledPositionContext, c: u64, d: u64, e: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s40 = fp - 0x40, s48 = fp - 0x48, s58 = fp - 0x58, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, sd8 = fp - 0xd8, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let h, q, r, ad: u64
	st64(sd0, d, e)
	const accounts: OpenBundledPositionAccounts = b.accounts
	const g = ld64(accounts + 0x20)
	if ((memcmp(g + 0x148, 0x100152180, 0x20) as u32) == 0 && (ld16(g + 0xc8) & 1) != 0) {
		ad = fn_87630(sc0, 0x43)
		h = ld64(sc0)
		st64(a + 8, ld64(sc0 + 8))
		st64(a, h)
		return ad
	}
	ad = fn_5ffd0(s80, accounts.position_bundle_token_account.mint, accounts + 0x18)
	h = ld64(s80)
	if (h == 2) {
		ad = fn_4c1a0(s90, accounts + 0x28, ld64(accounts), accounts + 0x30)
		h = ld64(s90)
		if (h == 2) {
			B11: {
				let l = 0x2b
				if (0xff >= (c as u16)) {
					const k = 1 << (c & 7)
					const i = ld64(accounts + 8) + ((c & 0xfff8) >> 3)
					l = 0x2c
					const j = ld8(i + 0x28)
					if ((j & k) == 0) {
						st8(i + 0x28, j ^ k)
						break B11
					}
				}
				ad = fn_87630(sa0, l)
				const ac = ld64(sa0 + 8)
				h = ld64(sa0)
				if (h != 2) {
					st64(a + 8, ac)
					st64(a, h)
					return ad
				}
			}
			const m = ld64(accounts + 0x20)
			const o = ld16(m + 0x284)
			const n = ld64(m + 0x240)
			st64(s1000, ld64(m + 0x238))
			st64(sff8, n)
			ad = fn_60930(s48, ld64(sd0), ld64(sd0 + 8), o, ld64(s1000), n)
			h = ld64(s48)
			if (h != 2) {
				st64(a + 8, ld64(s40))
				st64(a, h)
				return ad
			}
			B24: {
				r = ld32(s40)
				q = ld32(s40 + 4)
				st64(sd0 + 8, ld64(accounts + 0x20))
				st64(sd0, ld64(accounts))
				const p = ld64(accounts + 8)
				copyr(s48, p + 8, 0x20)
				let w = 0xa
				if ((((r as i32) - 0x6c4f5) as u32) >= 0xfff27617) {
					const s = ld16(ld64(sd0 + 8) + 0x284)
					if (s == 0) {
						fn_14e1c0(0x100159f48, s, 0xfff27617)
					}
					st64(sd8, s)
					const t = fn_151bf8(r as i32, s)
					w = 0xa
					if ((((q as i32) - 0x6c4f5) as u32) >= 0xfff27617 && (t as u32) == 0) {
						const u = fn_151bf8(q as i32, ld64(sd8))
						w = 0xa
						if ((q as i32) > (r as i32) && (u as u32) == 0) {
							if ((ld64(sd8) as i16) > -1) {
								break B24
							}
							w = 0x36
							const v = 0x6c4f4 % ld64(sd8)
							if (v - 0x6c4f4 == (r as i32) && 0x6c4f4 - v == (q as i32)) {
								break B24
							}
						}
					}
				}
				ad = fn_87630(sb0, w)
				h = ld64(sb0)
				if (h != 2) {
					st64(a + 8, ld64(sb0 + 8))
					st64(a, h)
					return ad
				}
			}
			const x = ld64(sd0)
			const y = ld64(ld64(ld64(sd0 + 8)))
			st64(x + 0x20, ld64(y + 0x18))
			st64(x + 0x18, ld64(y + 0x10))
			st64(x + 0x10, ld64(y + 8))
			st64(x + 8, ld64(y))
			copy(x + 0x30, s40, 0x18)
			st64(x + 0x28, ld64(s48))
			st32(x + 0xd0, r as i32, q as i32)
			const z = ld64(ld64(ld64(accounts + 0x20)))
			copyr(s48, z, 0x20)
			const aa = ld64(ld64(ld64(accounts)))
			copy(s20, aa + 8, 0x18)
			const ab = ld64(aa)
			st32(s8, r as i32, q as i32)
			st64(s40 + 0x18, ab)
			fn_88c18(s60, s48)
			copyr(s70, s58, 0x10)
			ad = log_data(s70, 1)
			st64(a + 8, undef)
			st64(a, 2)
			return ad
		}
		st64(a + 8, ld64(s90 + 8))
		st64(a, h)
		return ad
	}
	st64(a + 8, ld64(s80 + 8))
	st64(a, h)
	return ad
}

export function fn_88c18(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000008 > g) {
		raw_vec_handle_error(1, 0x100, g, 0x300000008, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0x79657593e6f3afed /* event:PositionOpened */)
	st64(g + 0x20, ld64(b + 0x18))
	st64(g + 0x18, ld64(b + 0x10))
	st64(g + 0x10, ld64(b + 8))
	st64(g + 8, ld64(b))
	copy(g + 0x28, b + 0x20, 0x20)
	st32(g + 0x48, ld32(b + 0x40))
	st32(g + 0x4c, ld32(b + 0x44))
	st64(a + 8, g, 0x50)
	st64(a, 0x100)
}
