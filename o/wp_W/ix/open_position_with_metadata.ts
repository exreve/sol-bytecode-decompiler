/// <reference path="../lib.d.ts" />
// instruction open_position_with_metadata
import { fn_128fc0, fn_12e30, fn_143100, fn_147e78, fn_149678, fn_14e1c0, fn_14f7f8, fn_4a30, fn_4c1a0, fn_5a40, fn_60930, fn_68310, fn_69330, fn_bba20, log_data, memcpy } from '../shared.ts'

// instruction handler: open_position_with_metadata (discriminator sha256("global:open_position_with_metadata")[..8] = 0x3c0e6e3a30861df2)
// accounts [str: the program's account-error strings, in order of first use]: funder, whirlpool, rent, metadata_update_auth, position, position_mint, position_token_account, token_program, position_metadata_account, metadata_program, associated_token_program, system_program, owner
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
export function ix_open_position_with_metadata(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const sc0 = fp - 0xc0, sc8 = fp - 0xc8, sd8 = fp - 0xd8, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1c1 = fp - 0x1c1, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s1000 = fp - 0x1000
	let k, l: u64
	sol_log("Instruction: OpenPositionWithMetadata", 0x25)
	const f = ix_args_len
	if (f >= 6 && f - 6 >= 4) {
		const g = ix_args
		const m = ld32(g + 2)
		const q = ld32(g + 6)
		st8(s1c1, 0xff)
		st64(s1c0, accounts, accounts_len)
		st64(s1000 + 8, s1c1)
		l = accounts_open_position_with_metadata(sd8, program_id, s1c0, undef, fp)
		const h = ld32(sd8)
		if (h == 2) {
			k = ld64(sd8 + 8)
			st64(a + 8, ld64(sc8))
			st64(a, k)
			return l
		}
		const p = ld32(sd8 + 4)
		const o = ld64(sd8 + 8)
		const n = ld64(sc8)
		memcpy(s198, sc0, 0xc0)
		st64(s1a8, o, n)
		st32(s1b0, h, p)
		st8(sc0 + 8, ld8(s1c1))
		copyr(sc8, s1c0, 0x10)
		st64(sd8, program_id, s1b0)
		st64(s1000, m, q)
		l = fn_347f8(s1d8, sd8, undef, undef, m, q)
		k = ld64(s1d8)
		if (k == 2) {
			l = fn_c2790(s1e8, s1b0, program_id)
			k = ld64(s1e8)
			st64(a + 8, ld64(s1e8 + 8))
			st64(a, k)
			return l
		}
		st64(a + 8, ld64(s1d8 + 8))
		st64(a, k)
		return l
	}
	const i = fn_1459d0(0x100159468)
	if (2 > (i & 3) - 2) {
		l = anchor_error_from(s1f8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s1f8)
		st64(a + 8, ld64(s1f8 + 8))
		st64(a, k)
		return l
	}
	if ((i & 3) == 0) {
		l = anchor_error_from(s1f8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s1f8)
		st64(a + 8, ld64(s1f8 + 8))
		st64(a, k)
		return l
	}
	const j = ld64(ld64(i + 7))
	callx(j, ld64(i - 1), j)
	l = anchor_error_from(s1f8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	k = ld64(s1f8)
	st64(a + 8, ld64(s1f8 + 8))
	st64(a, k)
	return l
}

// Anchor Accounts::try_accounts of instruction open_position_with_metadata (called by ix_open_position_with_metadata; name [str]: from the handler's "Instruction: …" log; was fn_bcae8)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: funder (ConstraintMut), whirlpool, rent, metadata_update_auth (AccountNotEnoughKeys, ConstraintAddress), position (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), position_mint (ConstraintMut, ConstraintSigner, ConstraintRentExempt), position_token_account (ConstraintMut, ConstraintRentExempt), token_program (ConstraintAddress), position_metadata_account (AccountNotEnoughKeys, ConstraintMut), metadata_program, associated_token_program, system_program, owner (AccountNotEnoughKeys)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_metadata_account, position, position_mint, position_token_account, funder
export function accounts_open_position_with_metadata(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s268 = fp - 0x268, s270 = fp - 0x270, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s2a8 = fp - 0x2a8, s2d8 = fp - 0x2d8, s320 = fp - 0x320, s338 = fp - 0x338, s350 = fp - 0x350, s368 = fp - 0x368, s369 = fp - 0x369, s390 = fp - 0x390, s3a8 = fp - 0x3a8, s3c0 = fp - 0x3c0, s3c8 = fp - 0x3c8, s3d0 = fp - 0x3d0, s3d8 = fp - 0x3d8, s3e0 = fp - 0x3e0, s3e8 = fp - 0x3e8, s3f0 = fp - 0x3f0, s3f8 = fp - 0x3f8, s400 = fp - 0x400, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s598 = fp - 0x598, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s5c8 = fp - 0x5c8, s5d8 = fp - 0x5d8, s5e8 = fp - 0x5e8, s5f8 = fp - 0x5f8, s608 = fp - 0x608, s618 = fp - 0x618, s628 = fp - 0x628, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s668 = fp - 0x668, s678 = fp - 0x678, s688 = fp - 0x688, s698 = fp - 0x698, s6a8 = fp - 0x6a8, s6b8 = fp - 0x6b8, s6c8 = fp - 0x6c8, s6d8 = fp - 0x6d8, s6e8 = fp - 0x6e8, s6f8 = fp - 0x6f8, s708 = fp - 0x708, s718 = fp - 0x718, s740 = fp - 0x740, s748 = fp - 0x748, s750 = fp - 0x750, s758 = fp - 0x758, s760 = fp - 0x760, s768 = fp - 0x768, s770 = fp - 0x770, s778 = fp - 0x778
	let i, j, m, p, q, t, ai, bs: u64
	st64(s408, b)
	try_accounts_11718(s290, c, c, d, e)
	const g = ld64(s288)
	const f = ld64(s290)
	if (f != 2) {
		q = Error_with_account_name(s418, f, g, "funder", 6)
		p = ld64(s418)
		st64(a + 0x10, ld64(s418 + 8))
		st64(a + 8, p)
		st32(a, 2)
		return q
	}
	const aq = ld64(e - 0xff8)
	st64(s400, g)
	const h = ld64(c + 8)
	if (h != 0) {
		const l: AccountInfo = ld64(c)
		st64(c, l + 0x30)
		m = h - 1
		st64(c + 8, m)
		st64(s3f8, l)
		if (m == 0) {
			q = anchor_error_from(s718, 0xbbd /* anchor::AccountNotEnoughKeys */, m, i, j)
			p = ld64(s718)
			st64(a + 0x10, ld64(s718 + 8))
			st64(a + 8, p)
			st32(a, 2)
			return q
		}
		const position_metadata_account: AccountInfo = ld64(c)
		st64(s3f0, position_metadata_account)
		st64(c + 8, h - 2)
		st64(c, position_metadata_account + 0x30)
		if (h != 2) {
			st64(s3e8, position_metadata_account + 0x30)
			st64(c + 8, h - 3)
			let r = position_metadata_account + 0x60
			st64(c, r)
			if (h != 3) {
				t = h - 4
				st64(c + 8, t)
				st64(c, position_metadata_account + 0x90)
				if (t == 0) {
					q = anchor_error_from(s6d8, 0xbbd /* anchor::AccountNotEnoughKeys */, t, r, j)
					p = ld64(s6d8)
					st64(a + 0x10, ld64(s6d8 + 8))
					st64(a + 8, p)
					st32(a, 2)
					return q
				}
				st64(s740 + 0x20, r)
				st64(s3e0, position_metadata_account + 0x90)
				st64(c + 8, h - 5)
				st64(c, position_metadata_account + 0xc0)
				try_accounts_11a48(s290, c, t, r, j)
				if (ld64(s290) == 0) {
					q = Error_with_account_name(s6a8, ld64(s288), ld64(s288 + 8), 0x100152b28 /* "whirlpool" */, 9)
					p = ld64(s6a8)
					st64(a + 0x10, ld64(s6a8 + 8))
					st64(a + 8, p)
					st32(a, 2)
					return q
				}
				const u = ld64(0x300000000 /* heap bump-allocator cursor */)
				const v = u != 0 ? sat_sub(u, 0x290) & -8 : 0x300007d70
				if (v > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, v)
					st64(s740 + 0x18, v)
					memcpy(v, s290, 0x290)
					fn_129a0(s290, c)
					const x = ld64(s288)
					const w = ld64(s290)
					if (w == 2) {
						st64(s3d8, x)
						fn_122e8(s290, c, x)
						const z = ld64(s288)
						const y = ld64(s290)
						if (y == 2) {
							st64(s3d0, z)
							try_accounts_11990(s290, c, z)
							const ac = ld64(s288 + 8)
							const ab = ld64(s288)
							const aa = ld64(s290)
							if (aa == 0) {
								q = Error_with_account_name(s698, ab, ac, 0x100152d60 /* "rent" */, 4)
								p = ld64(s698)
								st64(a + 0x10, ld64(s698 + 8))
								st64(a + 8, p)
								st32(a, 2)
								return q
							}
							st64(s740, aa, ab, ac)
							st64(s748, ld64(s278))
							fn_12510(s290, c, ac)
							const ae = ld64(s288)
							const ad = ld64(s290)
							if (ad == 2) {
								st64(s3c8, ae)
								fn_12e30(s290, c, ae)
								const ag = ld64(s288)
								const af = ld64(s290)
								if (af == 2) {
									st64(s750, ag)
									const ah = ld64(c + 8)
									if (ah == 0) {
										anchor_error_from(s468, 0xbbd /* anchor::AccountNotEnoughKeys */, ag)
										ai = ld64(s468 + 8)
										const aj = ld64(s468)
										if (aj != 2) {
											q = Error_with_account_name(s478, aj, ai, "metadata_update_auth", 0x14)
											p = ld64(s478)
											st64(a + 0x10, ld64(s478 + 8))
											st64(a + 8, p)
											st32(a, 2)
											return q
										}
									} else {
										st64(c + 8, ah - 1)
										ai = ld64(c)
										st64(c, ai + 0x30)
									}
									st64(s758, ai)
									rent_get(s290)
									copy(s3a8, s288, 0x18)
									if (ld64(s290) == 0) {
										copyr(s3c0, s3a8, 0x18)
										const ak = ld64(ld64(s3e8))
										const ao = ld64(ak + 0x18)
										const an = ld64(ak + 0x10)
										const am = ld64(ak + 8)
										const al = ld64(ak)
										st64(s2d8, 0x100151f20)
										st64(s2d8 + 0x10, s338)
										st64(s338, al, am, an, ao)
										st64(s2d8 + 8, 8)
										st64(s2d8 + 0x18, 0x20)
										// PDA find_program_address(["position", *s338], program *(ld64(s408)))
										Pubkey_find_program_address(s290, s2d8, 2, ld64(s408))
										copyr(s390, s290, 0x20)
										const ap = ld8(s270)
										st8(s369, ap)
										st8(aq, ap)
										const ar = ld64(ld64(s3f0))
										copy(s290, ar, 0x20)
										if ((memcmp(s290, s390, 0x20) as u32) == 0) {
											st64(s268, s369, s408)
											st64(s270, ld64(s3e8))
											st64(s290, s3f0, s3c0, s400, s3d0)
											q = fn_bf220(s338, s290)
											const o = ld64(s338 + 8)
											p = ld64(s338)
											if (p == 2) {
												st64(s760, o)
												const position: AccountInfo = ld64(o)
												if (position.is_writable == 0) {
													anchor_error_from(s678, 0x7d0 /* anchor::ConstraintMut */)
													q = Error_with_account_name(s688, ld64(s678), ld64(s678 + 8), "position", 8)
													p = ld64(s688)
													st64(a + 0x10, ld64(s688 + 8))
													st64(a + 8, p)
													st32(a, 2)
													return q
												}
												AccountInfo_clone(s338, position)
												st64(s768, fn_143100(s338))
												AccountInfo_clone(s290, ld64(ld64(s760)))
												AccountInfo_try_data_len(s2d8, s290)
												const bc = ld64(s2d8 + 8)
												const bb = ld64(s2d8)
												if (bb != 0x800000000000001a /* Ok */) {
													st64(s2d8 + 0x10, ld64(s2d8 + 0x10))
													st64(s2d8, bb, bc)
													q = fn_13b430(s4c8, s2d8)
													const bo = ld64(s4c8)
													st64(a + 0x10, ld64(s4c8 + 8))
													st64(a + 8, bo)
													st32(a, 2)
													const bq = ld64(s288 + 8)
													const bp = ld64(s288)
													rc_dec(bp)
													rc_dec(bq)
													bs = ld64(s338 + 0x10)
													const br = ld64(s338 + 8)
													rc_dec(br)
													if (!rc_release(bs)) {
														return q
													}
													st64(bs + 8, ld64(bs + 8) - 1)
													return q
												}
												const bd = __floatundidf(ld64(s3c0) * (bc + 0x80))
												const be = fn_14f7f8(ld64(s3c0 + 8), bd)
												st64(s770, fn_151cb0(be, 0))
												const bf = fn_14f3e8(be)
												const bg = 0 > (ld64(s770) as i64) ? 0 : bf
												const bn = (fn_151a40(be, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : bg
												const bi = ld64(s288 + 8)
												const bh = ld64(s288)
												rc_dec(bh)
												rc_dec(bi)
												const bl = ld64(s338 + 0x10)
												const bj = ld64(s338 + 8)
												let bk = ld64(bj) - 1
												st64(bj, bk)
												if (bk == 0) {
													bk = ld64(bj + 8) - 1
													st64(bj + 8, bk)
												}
												let bm = ld64(bl) - 1
												st64(bl, bm)
												if (bm == 0) {
													bm = ld64(bl + 8) - 1
													st64(bl + 8, bm)
												}
												if (bn > ld64(s768)) {
													anchor_error_from(s658, 0x7d5 /* anchor::ConstraintRentExempt */, bm, bk)
													q = Error_with_account_name(s668, ld64(s658), ld64(s658 + 8), "position", 8)
													p = ld64(s668)
													st64(a + 0x10, ld64(s668 + 8))
													st64(a + 8, p)
													st32(a, 2)
													return q
												}
												rent_get(s290)
												copy(s350, s288, 0x18)
												if (ld64(s290) != 0) {
													q = fn_13b430(s4d8, s350)
													p = ld64(s4d8)
													st64(a + 0x10, ld64(s4d8 + 8))
													st64(a + 8, p)
													st32(a, 2)
													return q
												}
												copyr(s368, s350, 0x18)
												st64(s2d8 + 0x28, ld64(s740 + 0x18))
												st64(s2d8, s3e8, s368, s400, s3d0, s3d8)
												q = fn_c0cc0(s290, s2d8)
												const bt = ld32(s290)
												if (bt == 2) {
													p = ld64(s288)
													st64(a + 0x10, ld64(s288 + 8))
													st64(a + 8, p)
													st32(a, 2)
													return q
												}
												st64(s768, ld32(s290 + 4))
												st64(s770, ld64(s288))
												const bu = ld64(s288 + 8)
												memcpy(s320, s278, 0x48)
												st64(s338 + 0x10, bu)
												st64(s338 + 8, ld64(s770))
												st32(s338 + 4, ld64(s768))
												st32(s338, bt)
												const position_mint: AccountInfo = ld64(s320 + 0x40)
												if (position_mint.is_writable == 0) {
													anchor_error_from(s638, 0x7d0 /* anchor::ConstraintMut */)
													q = Error_with_account_name(s648, ld64(s638), ld64(s638 + 8), "position_mint", 0xd)
													p = ld64(s648)
													st64(a + 0x10, ld64(s648 + 8))
													st64(a + 8, p)
													st32(a, 2)
													return q
												}
												if (position_mint.is_signer == 0) {
													anchor_error_from(s618, 0x7d2 /* anchor::ConstraintSigner */)
													q = Error_with_account_name(s628, ld64(s618), ld64(s618 + 8), "position_mint", 0xd)
													p = ld64(s628)
													st64(a + 0x10, ld64(s628 + 8))
													st64(a + 8, p)
													st32(a, 2)
													return q
												}
												AccountInfo_clone(s2d8, position_mint)
												st64(s768, fn_143100(s2d8))
												AccountInfo_clone(s290, ld64(s320 + 0x40))
												AccountInfo_try_data_len(s2a8, s290)
												const bx = ld64(s2a8 + 8)
												const bw = ld64(s2a8)
												if (bw != 0x800000000000001a /* Ok */) {
													st64(s2a8 + 0x10, ld64(s2a8 + 0x10))
													st64(s2a8, bw, bx)
													q = fn_13b430(s4e8, s2a8)
													const cj = ld64(s4e8)
													st64(a + 0x10, ld64(s4e8 + 8))
													st64(a + 8, cj)
													st32(a, 2)
													const cl = ld64(s288 + 8)
													const ck = ld64(s288)
													rc_dec(ck)
													rc_dec(cl)
													bs = ld64(s2d8 + 0x10)
													const cm = ld64(s2d8 + 8)
													rc_dec(cm)
													if (!rc_release(bs)) {
														return q
													}
													st64(bs + 8, ld64(bs + 8) - 1)
													return q
												}
												const by = __floatundidf(ld64(s368) * (bx + 0x80))
												const bz = fn_14f7f8(ld64(s368 + 8), by)
												st64(s770, fn_151cb0(bz, 0))
												const ca = fn_14f3e8(bz)
												const cb = 0 > (ld64(s770) as i64) ? 0 : ca
												const ci = (fn_151a40(bz, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : cb
												const cd = ld64(s288 + 8)
												const cc = ld64(s288)
												rc_dec(cc)
												rc_dec(cd)
												const cg = ld64(s2d8 + 0x10)
												const ce = ld64(s2d8 + 8)
												let cf = ld64(ce) - 1
												st64(ce, cf)
												if (cf == 0) {
													cf = ld64(ce + 8) - 1
													st64(ce + 8, cf)
												}
												let ch = ld64(cg) - 1
												st64(cg, ch)
												if (ch == 0) {
													ch = ld64(cg + 8) - 1
													st64(cg + 8, ch)
												}
												if (ci > ld64(s768)) {
													anchor_error_from(s5f8, 0x7d5 /* anchor::ConstraintRentExempt */, ch, cf)
													q = Error_with_account_name(s608, ld64(s5f8), ld64(s5f8 + 8), "position_mint", 0xd)
													p = ld64(s608)
													st64(a + 0x10, ld64(s608 + 8))
													st64(a + 8, p)
													st32(a, 2)
													return q
												}
												rent_get(s290)
												const cs = ld64(s288 + 8)
												const cr = ld64(s288)
												if (ld64(s290) != 0) {
													st32(s2d8, ld32(s278 + 1))
													st32(s2d8 + 3, ld32(s278 + 4))
													const dd = ld8(s278)
													st32(s288 + 0xc, ld32(s2d8 + 3))
													st32(s288 + 9, ld32(s2d8))
													st8(s288 + 8, dd)
													st64(s290, cr, cs)
													q = fn_13b430(s4f8, s290)
													p = ld64(s4f8)
													st64(a + 0x10, ld64(s4f8 + 8))
													st64(a + 8, p)
													st32(a, 2)
													return q
												}
												st64(s290, s3e0, s3c8, s400, s3f8, s338, s3d0, s3d8)
												q = fn_bba20(s2d8, s290)
												st64(s768, ld64(s2d8 + 8))
												p = ld64(s2d8)
												if (p == 2) {
													const position_token_account: AccountInfo = ld64(ld64(s768))
													if (position_token_account.is_writable == 0) {
														anchor_error_from(s5d8, 0x7d0 /* anchor::ConstraintMut */)
														q = Error_with_account_name(s5e8, ld64(s5d8), ld64(s5d8 + 8), "position_token_account", 0x16)
														p = ld64(s5e8)
														st64(a + 0x10, ld64(s5e8 + 8))
														st64(a + 8, p)
														st32(a, 2)
														return q
													}
													st64(s770, s2d8)
													AccountInfo_clone(s2d8, position_token_account)
													st64(s778, fn_143100(ld64(s770)))
													const co = ld64(ld64(s768))
													st64(s770, s290)
													AccountInfo_clone(s290, co)
													AccountInfo_try_data_len(s2a8, ld64(s770))
													const cq = ld64(s2a8 + 8)
													const cp = ld64(s2a8)
													if (cp != 0x800000000000001a /* Ok */) {
														st64(s2a8 + 0x10, ld64(s2a8 + 0x10))
														st64(s2a8, cp, cq)
														q = fn_13b430(s508, s2a8)
														const de = ld64(s508)
														st64(a + 0x10, ld64(s508 + 8))
														st64(a + 8, de)
														st32(a, 2)
														const dg = ld64(s288 + 8)
														const df = ld64(s288)
														rc_dec(df)
														rc_dec(dg)
														bs = ld64(s2d8 + 0x10)
														const dh = ld64(s2d8 + 8)
														rc_dec(dh)
														if (!rc_release(bs)) {
															return q
														}
														st64(bs + 8, ld64(bs + 8) - 1)
														return q
													}
													const ct = fn_14f7f8(cs, __floatundidf((cq + 0x80) * cr))
													st64(s770, fn_151cb0(ct, 0))
													const cu = fn_14f3e8(ct)
													const cv = 0 > (ld64(s770) as i64) ? 0 : cu
													const dc = (fn_151a40(ct, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : cv
													const cx = ld64(s288 + 8)
													const cw = ld64(s288)
													rc_dec(cw)
													rc_dec(cx)
													const da = ld64(s2d8 + 0x10)
													const cy = ld64(s2d8 + 8)
													let cz = ld64(cy) - 1
													st64(cy, cz)
													if (cz == 0) {
														cz = ld64(cy + 8) - 1
														st64(cy + 8, cz)
													}
													let db = ld64(da) - 1
													st64(da, db)
													if (db == 0) {
														db = ld64(da + 8) - 1
														st64(da + 8, db)
													}
													if (dc > ld64(s778)) {
														anchor_error_from(s5b8, 0x7d5 /* anchor::ConstraintRentExempt */, db, cz)
														q = Error_with_account_name(s5c8, ld64(s5b8), ld64(s5b8 + 8), "position_token_account", 0x16)
														p = ld64(s5c8)
														st64(a + 0x10, ld64(s5c8 + 8))
														st64(a + 8, p)
														st32(a, 2)
														return q
													}
													const funder: AccountInfo = ld64(s400)
													if (funder.is_writable != 0) {
														if (position_metadata_account[2].is_writable != 0) {
															const dj = ld64(s3d8)
															const dk = ld64(dj)
															copy(s2d8, dk, 0x20)
															if ((memcmp(s2d8, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
																anchor_error_from(s518, 0x7dc /* anchor::ConstraintAddress */)
																const ds = Error_with_account_name(s528, ld64(s518), ld64(s518 + 8), "token_program", 0xd)
																const dr = ld64(s528 + 8)
																const dq = ld64(s528)
																copyr(s290, s2d8, 0x20)
																st64(s270, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
																q = fn_13b5c0(s538, dq, dr, s290, ds)
																p = ld64(s538)
																st64(a + 0x10, ld64(s538 + 8))
																st64(a + 8, p)
																st32(a, 2)
																return q
															}
															const dl = ld64(ld64(s758))
															copyr(s2d8, dl, 0x20)
															if ((memcmp(s2d8, 0x100152dd0 /* key 3axbTs2z5GBy6usVbNVoqEgZMng3vZvMnAoX29BFfwhr */, 0x20) as u32) == 0) {
																const du: AccountInfo = ld64(s3f8)
																q = memcpy(a, s338, 0x60)
																const dt = ld64(s3c8)
																st64(a + 0x98, ld64(s3d0))
																st64(a + 0xd0, ld64(s758))
																st64(a + 0xc8, ld64(s750))
																st64(a + 0xc0, dt)
																st64(a + 0xb8, ld64(s748))
																st64(a + 0xb0, ld64(s740 + 0x10))
																st64(a + 0xa8, ld64(s740 + 8))
																st64(a + 0xa0, ld64(s740))
																st64(a + 0x90, dj)
																st64(a + 0x88, ld64(s740 + 0x18))
																st64(a + 0x80, ld64(s768))
																st64(a + 0x78, ld64(s740 + 0x20))
																st64(a + 0x70, ld64(s760))
																st64(a + 0x68, du)
																st64(a + 0x60, funder)
																return q
															}
															anchor_error_from(s548, 0x7dc /* anchor::ConstraintAddress */)
															const dp = Error_with_account_name(s558, ld64(s548), ld64(s548 + 8), "metadata_update_auth", 0x14)
															const dn = ld64(s558 + 8)
															const dm = ld64(s558)
															copyr(s290, s2d8, 0x20)
															st64(s270, 0xf0e597ddae666a26, 0x3999c6e408d67144, 0x93d0cdb3999d7ad7, 0x69d20a916bfe8911) // key 3axbTs2z5GBy6usVbNVoqEgZMng3vZvMnAoX29BFfwhr
															q = fn_13b5c0(s568, dm, dn, s290, dp)
															p = ld64(s568)
															st64(a + 0x10, ld64(s568 + 8))
															st64(a + 8, p)
															st32(a, 2)
															return q
														}
														anchor_error_from(s578, 0x7d0 /* anchor::ConstraintMut */, db, cz)
														q = Error_with_account_name(s588, ld64(s578), ld64(s578 + 8), "position_metadata_account", 0x19)
														p = ld64(s588)
														st64(a + 0x10, ld64(s588 + 8))
														st64(a + 8, p)
														st32(a, 2)
														return q
													}
													anchor_error_from(s598, 0x7d0 /* anchor::ConstraintMut */, db, cz)
													q = Error_with_account_name(s5a8, ld64(s598), ld64(s598 + 8), "funder", 6)
													p = ld64(s5a8)
													st64(a + 0x10, ld64(s5a8 + 8))
													st64(a + 8, p)
													st32(a, 2)
													return q
												}
												st64(a + 0x10, ld64(s768))
												st64(a + 8, p)
												st32(a, 2)
												return q
											}
											st64(a + 0x10, o)
											st64(a + 8, p)
											st32(a, 2)
											return q
										}
										anchor_error_from(s498, 0x7d6 /* anchor::ConstraintSeeds */)
										Error_with_account_name(s4a8, ld64(s498), ld64(s498 + 8), "position", 8)
										const az = ld64(s4a8 + 8)
										const ay = ld64(s4a8)
										const at = ld64(ld64(s3f0))
										const ax = ld64(at + 0x18)
										const aw = ld64(at + 0x10)
										const av = ld64(at + 8)
										const au = ld64(at)
										copy(s270, s390, 0x20)
										st64(s290, au, av, aw, ax)
										q = fn_13b5c0(s4b8, ay, az, s290, av)
										p = ld64(s4b8)
										st64(a + 0x10, ld64(s4b8 + 8))
										st64(a + 8, p)
										st32(a, 2)
										return q
									}
									q = fn_13b430(s488, s3a8)
									p = ld64(s488)
									st64(a + 0x10, ld64(s488 + 8))
									st64(a + 8, p)
									st32(a, 2)
									return q
								}
								q = Error_with_account_name(s458, af, ag, "metadata_program", 0x10)
								p = ld64(s458)
								st64(a + 0x10, ld64(s458 + 8))
								st64(a + 8, p)
								st32(a, 2)
								return q
							}
							q = Error_with_account_name(s448, ad, ae, "associated_token_program", 0x18)
							p = ld64(s448)
							st64(a + 0x10, ld64(s448 + 8))
							st64(a + 8, p)
							st32(a, 2)
							return q
						}
						q = Error_with_account_name(s438, y, z, "system_program", 0xe)
						p = ld64(s438)
						st64(a + 0x10, ld64(s438 + 8))
						st64(a + 8, p)
						st32(a, 2)
						return q
					}
					q = Error_with_account_name(s428, w, x, "token_program", 0xd)
					p = ld64(s428)
					st64(a + 0x10, ld64(s428 + 8))
					st64(a + 8, p)
					st32(a, 2)
					return q
				}
				alloc_handle_alloc_error(8, 0x290)
			}
			anchor_error_from(s6b8, 0xbbd /* anchor::AccountNotEnoughKeys */, h - 2, r, j)
			t = undef
			r = undef
			const s = ld64(s6b8)
			if (s == 2) {
				q = anchor_error_from(s6d8, 0xbbd /* anchor::AccountNotEnoughKeys */, t, r, j)
				p = ld64(s6d8)
				st64(a + 0x10, ld64(s6d8 + 8))
				st64(a + 8, p)
				st32(a, 2)
				return q
			}
			q = Error_with_account_name(s6c8, s, ld64(s6b8 + 8), "position_metadata_account", 0x19)
			p = ld64(s6c8)
			st64(a + 0x10, ld64(s6c8 + 8))
			st64(a + 8, p)
			st32(a, 2)
			return q
		}
		q = anchor_error_from(s6e8, 0xbbd /* anchor::AccountNotEnoughKeys */, h - 2, i, j)
		p = ld64(s6e8)
		st64(a + 0x10, ld64(s6e8 + 8))
		st64(a + 8, p)
		st32(a, 2)
		return q
	}
	anchor_error_from(s6f8, 0xbbd /* anchor::AccountNotEnoughKeys */, g, i, j)
	m = undef
	const k = ld64(s6f8)
	if (k == 2) {
		q = anchor_error_from(s718, 0xbbd /* anchor::AccountNotEnoughKeys */, m, i, j)
		p = ld64(s718)
		st64(a + 0x10, ld64(s718 + 8))
		st64(a + 8, p)
		st32(a, 2)
		return q
	}
	q = Error_with_account_name(s708, k, ld64(s6f8 + 8), 0x100154aba /* "owner" */, 5)
	p = ld64(s708)
	st64(a + 0x10, ld64(s708 + 8))
	st64(a + 8, p)
	st32(a, 2)
	return q
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position
export function fn_bf220(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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
				st64(s2c8 + 8, 0x100154abf)
				st32(s248 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s278, 2)
				st32(s2b0, 0x13)
				st64(s2c8 + 0x10, 0x42)
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
		const cf = ld64(ld64(ce + 0x20))
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
		const aq = ld64(ld64(ap + 0x20))
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

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_mint
export function fn_c0cc0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s58 = fp - 0x58, s68 = fp - 0x68, s80 = fp - 0x80, s98 = fp - 0x98, sa0 = fp - 0xa0, sc0 = fp - 0xc0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s118 = fp - 0x118, s158 = fp - 0x158, s178 = fp - 0x178, s198 = fp - 0x198, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d8 = fp - 0x1d8, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8, s218 = fp - 0x218, s220 = fp - 0x220, s228 = fp - 0x228, s230 = fp - 0x230, s248 = fp - 0x248, s260 = fp - 0x260, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s330 = fp - 0x330, s338 = fp - 0x338, s378 = fp - 0x378, s380 = fp - 0x380
	let av, ax, dt, du, dv: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s2f8, b, f)
	if (g != 0) {
		const p = ld64(ld64(b + 0x10))
		st64(s330 + 0x18, p)
		const q = ld64(p)
		copyr(s38, q + 8, 0x18)
		st64(s330 + 0x20, q)
		st64(s40, ld64(q))
		const r = ld64(f)
		copyr(s260, r + 8, 0x18)
		st64(s330 + 0x28, r)
		st64(s268, ld64(r))
		if ((memcmp(s40, s268, 0x20) as u32) == 0) {
			ErrorCode_name(s1b0, 0x100152d40)
			st64(s58, 0, 1, 0)
			st64(s20, s58, 0x100159480)
			st8(s20 + 0x18, 3)
			st64(s20 + 0x10, 0x20)
			st64(s38 + 8, 0)
			st64(s40, 0)
			if (ErrorCode_fmt(0x100152d40, s40) == 0) {
				copyr(s230, s58, 0x18)
				copy(s248, s1b0, 0x18)
				st64(s260, 0x100154abf)
				st32(s1d8 + 8, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s218, 2)
				st32(s260 + 0x10, 0x13)
				st64(s260 + 8, 0x42)
				st64(s268, 0)
				const bc = fn_13b3a8(s2a8, s268)
				const bb = ld64(s2a8 + 8)
				const ba = ld64(s2a8)
				const ay = ld64(s330 + 0x20)
				copyr(s268, ay, 0x20)
				const az = ld64(s330 + 0x28)
				copy(s248, az, 0x20)
				dv = fn_13b5c0(s2b8, ba, bb, s268, bc)
				const bd = ld64(s2b8)
				st64(a + 0x10, ld64(s2b8 + 8))
				st64(a + 8, bd)
				st32(a, 2)
				return dv
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s268, 0x1001594b0, 0x1001594d0)
		}
		st64(s330 + 0x30, a)
		const s = ld64(b + 8)
		const t = __floatundidf(ld64(s) * 0xd2)
		const u = fn_14f7f8(ld64(s + 8), t)
		const v = fn_151cb0(u, 0)
		const w = fn_14f3e8(u)
		const x = max((fn_151a40(u, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (v as i64) ? 0 : w, 1)
		if (x > g) {
			const bf: AccountInfo = ld64(s2f8 + 8)
			const bl = ld64(s2f8)
			const y: AccountInfo = ld64(s330 + 0x18)
			const z: LamportsCell = y.lamports
			rc_inc(z)
			const be: DataCell = y.data
			rc_inc(be)
			const bg: LamportsCell = bf.lamports
			const bh = bg.strong
			st64(s338, bf.key)
			st64(s330, y.executable)
			st64(s330 + 8, y.is_writable)
			st64(s330 + 0x10, y.is_signer)
			st64(s330 + 0x28, y.rent_epoch)
			const bk = y.owner
			rc_inc(bg, bh)
			const bi: DataCell = bf.data
			const bj = bi.strong
			st64(s330 + 0x18, bk)
			rc_inc(bi, bj)
			const bm: AccountInfo = ld64(ld64(bl + 0x18))
			const bn: LamportsCell = bm.lamports
			const bo = bn.strong
			st64(s378 + 0x38, sat_sub(x, g))
			st64(s378 + 0x10, bf.executable)
			st64(s378 + 0x18, bf.is_writable)
			st64(s378 + 0x20, bf.is_signer)
			st64(s378 + 0x28, bf.rent_epoch)
			st64(s378 + 0x30, bf.owner)
			const br = bm.key
			rc_inc(bn, bo)
			const bp: DataCell = bm.data
			const bq = bp.strong
			st64(s378, z, br)
			rc_inc(bp, bq)
			st64(s380, bm.owner)
			const bv = bm.rent_epoch
			const bu = bm.is_signer
			const bt = bm.is_writable
			const bs = bm.executable
			st8(s118 + 0x22, ld64(s378 + 0x10))
			st8(s118 + 0x21, ld64(s378 + 0x18))
			st8(s118 + 0x20, ld64(s378 + 0x20))
			st64(s118 + 0x18, ld64(s378 + 0x28))
			st64(s118 + 0x10, ld64(s378 + 0x30))
			st64(s118, bg, bi)
			st64(s158 + 0x38, ld64(s338))
			st8(s158 + 0x32, ld64(s330))
			st8(s158 + 0x31, ld64(s330 + 8))
			st8(s158 + 0x30, ld64(s330 + 0x10))
			st64(s158 + 0x28, ld64(s330 + 0x28))
			st64(s158 + 0x20, ld64(s330 + 0x18))
			st64(s158 + 0x18, be)
			st64(s158 + 0x10, ld64(s378))
			st64(s158 + 8, ld64(s330 + 0x20))
			st8(s158, bu, bt, bs)
			st64(s178 + 0x18, bv)
			st64(s178 + 0x10, ld64(s380))
			st64(s178, bn, bp)
			st64(s198 + 0x18, ld64(s378 + 8))
			st64(sf0, 8, 0)
			st64(s198, 0, 8, 0)
			dv = fn_13d318(s278, s198, ld64(s378 + 0x38))
			ax = ld64(s278)
			if (ax != 2) {
				du = ld64(s278 + 8)
				dt = ld64(s330 + 0x30)
				st64(dt + 8, ax, du)
				st32(dt, 2)
				return dv
			}
			st64(s330 + 0x28, ld64(ld64(s2f8 + 8)))
		}
		const bw = ld64(ld64(s2f8 + 8) + 8)
		rc_inc(bw)
		const bx = ld64(ld64(s2f8 + 8) + 0x10)
		rc_inc(bx)
		const by: AccountInfo = ld64(ld64(ld64(s2f8) + 0x18))
		const bz: LamportsCell = by.lamports
		const ca = bz.strong
		const cb: AccountInfo = ld64(s2f8 + 8)
		st64(s330 + 0x10, cb.executable)
		st64(s330 + 0x18, cb.is_writable)
		st64(s330 + 0x20, cb.is_signer)
		const cf = cb.rent_epoch
		const ck = cb.owner
		const ce = by.key
		rc_inc(bz, ca)
		st64(s330 + 8, bx)
		const cc: DataCell = by.data
		const cd = cc.strong
		st64(s338, cf, bw)
		rc_inc(cc, cd)
		const cj = by.owner
		const ci = by.rent_epoch
		const ch = by.is_signer
		const cg = by.is_writable
		st8(s1f8 + 2, by.executable)
		st8(s1f8, ch, cg)
		st64(s220, ce, bz, cc, cj, ci)
		st8(s228 + 2, ld64(s330 + 0x10))
		st8(s228 + 1, ld64(s330 + 0x18))
		st8(s228, ld64(s330 + 0x20))
		st64(s230, ld64(s338))
		st64(s248 + 0x10, ck)
		copyr(s248, s330, 0x10)
		st64(s260 + 0x10, ld64(s330 + 0x28))
		st64(s1f0, 8, 0)
		st64(s268, 0, 8, 0)
		dv = fn_13c8b8(s288, s268, 0x52)
		ax = ld64(s288)
		if (ax != 2) {
			du = ld64(s288 + 8)
			dt = ld64(s330 + 0x30)
			st64(dt + 8, ax, du)
			st32(dt, 2)
			return dv
		}
		const cl: AccountInfo = ld64(s2f8 + 8)
		const cm: LamportsCell = cl.lamports
		const ct = cl.key
		rc_inc(cm)
		const cn: DataCell = cl.data
		rc_inc(cn)
		const co: LamportsCell = by.lamports
		const cp = co.strong
		st64(s330 + 0x10, by.key)
		st64(s330 + 0x18, cl.executable)
		st64(s330 + 0x20, cl.is_writable)
		st64(s330 + 0x28, cl.is_signer)
		const cq = cl.rent_epoch
		const cy = cl.owner
		rc_inc(co, cp)
		st64(s330, cq)
		const cr: DataCell = by.data
		const cs = cr.strong
		st64(s330 + 8, ct)
		rc_inc(cr, cs)
		const cx = by.owner
		const cw = by.rent_epoch
		const cv = by.is_signer
		const cu = by.is_writable
		st8(s1f8 + 2, by.executable)
		st8(s1f8, cv, cu)
		st64(s218, co, cr, cx, cw)
		st64(s220, ld64(s330 + 0x10))
		st8(s228 + 2, ld64(s330 + 0x18))
		st8(s228 + 1, ld64(s330 + 0x20))
		st8(s228, ld64(s330 + 0x28))
		st64(s230, ld64(s330))
		st64(s248, cm, cn, cy)
		st64(s260 + 0x10, ld64(s330 + 8))
		st64(s1f0, 8, 0)
		st64(s268, 0, 8, 0)
		av = ld64(ld64(s2f8) + 0x20)
		const cz = ld64(ld64(av))
		copyr(s40, cz, 0x20)
		dv = fn_13cc48(s298, s268, s40)
		ax = ld64(s298)
		if (ax != 2) {
			du = ld64(s298 + 8)
			dt = ld64(s330 + 0x30)
			st64(dt + 8, ax, du)
			st32(dt, 2)
			return dv
		}
	} else {
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0xd2)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const af = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		st64(s330 + 0x30, a)
		const m = ld64(s2f8)
		const n: AccountInfo = ld64(ld64(m + 0x10))
		const o: LamportsCell = n.lamports
		const aj = n.key
		const ab: AccountInfo = ld64(s2f8 + 8)
		rc_inc(o)
		const aa: DataCell = n.data
		rc_inc(aa)
		const ac: LamportsCell = ab.lamports
		st64(s330 + 0x28, ac)
		const ad = ac.strong
		st64(s338, ab.key)
		st64(s330, n.executable)
		st64(s330 + 8, n.is_writable)
		st64(s330 + 0x10, n.is_signer)
		st64(s330 + 0x18, n.rent_epoch)
		st64(s330 + 0x20, n.owner)
		rc_inc(ld64(s330 + 0x28), ad)
		const ae: DataCell = ab.data
		rc_inc(ae)
		st64(s378 + 0x28, aa)
		st64(s378 + 0x38, af)
		const ag: AccountInfo = ld64(ld64(m + 0x18))
		const ah: LamportsCell = ag.lamports
		const ai = ah.strong
		st64(s378 + 0x30, aj)
		st64(s378 + 0x18, ab.executable)
		st64(s378 + 0x20, ab.is_writable)
		const ap = ab.is_signer
		const ak = ab.rent_epoch
		const al = ab.owner
		const ao = ag.key
		rc_inc(ah, ai)
		st64(s378, al, ak)
		const am: DataCell = ag.data
		const an = am.strong
		st64(s378 + 0x10, ao)
		rc_inc(am, an)
		st64(s380, ag.owner)
		const au = ag.rent_epoch
		const at = ag.is_signer
		const ar = ag.is_writable
		const aq = ag.executable
		st8(s1d8 + 0x12, ld64(s378 + 0x18))
		st8(s1d8 + 0x11, ld64(s378 + 0x20))
		st8(s1d8 + 0x10, ap)
		copyr(s1d8, s378, 0x10)
		st64(s1f0 + 0x10, ae)
		st64(s1f0 + 8, ld64(s330 + 0x28))
		st64(s1f0, ld64(s338))
		st8(s1f8 + 2, ld64(s330))
		st8(s1f8 + 1, ld64(s330 + 8))
		st8(s1f8, ld64(s330 + 0x10))
		st64(s218 + 0x18, ld64(s330 + 0x18))
		st64(s218 + 0x10, ld64(s330 + 0x20))
		st64(s218 + 8, ld64(s378 + 0x28))
		st64(s218, o)
		st64(s220, ld64(s378 + 0x30))
		st8(s228, at, ar, aq)
		st64(s230, au)
		st64(s248 + 0x10, ld64(s380))
		st64(s248, ah, am)
		st64(s260 + 0x10, ld64(s378 + 0x10))
		st64(s1c0, 8, 0)
		st64(s268, 0, 8, 0)
		av = ld64(ld64(s2f8) + 0x20)
		const aw = ld64(ld64(av))
		copyr(s40, aw, 0x20)
		dv = fn_13cfd8(s2c8, s268, ld64(s378 + 0x38), 0x52, s40)
		ax = ld64(s2c8)
		if (ax != 2) {
			du = ld64(s2c8 + 8)
			dt = ld64(s330 + 0x30)
			st64(dt + 8, ax, du)
			st32(dt, 2)
			return dv
		}
	}
	const da: AccountInfo = ld64(av)
	const db: LamportsCell = da.lamports
	const dd: AccountInfo = ld64(s2f8 + 8)
	const dj = da.key
	rc_inc(db)
	const dc: DataCell = da.data
	rc_inc(dc)
	const de: LamportsCell = dd.lamports
	const df = de.strong
	st64(s330 + 0x10, dd.key)
	st64(s330 + 0x18, da.executable)
	st64(s330 + 0x20, da.is_writable)
	st64(s330 + 0x28, da.is_signer)
	const dp = da.rent_epoch
	const di = da.owner
	rc_inc(de, df)
	st64(s330 + 8, db)
	const dg: DataCell = dd.data
	const dh = dg.strong
	st64(s338, dc, dj)
	rc_inc(dg, dh)
	const dn = dd.owner
	const dm = dd.rent_epoch
	const dl = dd.is_signer
	const dk = dd.is_writable
	st8(sa0 + 2, dd.executable)
	st8(sa0, dl, dk)
	st64(sc0, de, dg, dn, dm)
	st64(se0 + 0x18, ld64(s330 + 0x10))
	st8(s80 + 0x12, ld64(s330 + 0x18))
	st8(s80 + 0x11, ld64(s330 + 0x20))
	st8(s80 + 0x10, ld64(s330 + 0x28))
	st64(s80, di, dp)
	st64(s98 + 0x10, ld64(s338))
	copyr(s98, s330, 0x10)
	st64(s68, 8, 0)
	st64(se0, 0, 8, 0)
	const dq = ld64(ld64(ld64(ld64(s2f8) + 0x28)))
	copyr(s268, dq, 0x20)
	dv = fn_127828(s2d8, se0, 0, s268, 0)
	ax = ld64(s2d8)
	if (ax == 2) {
		Account_try_from(s268, dd)
		const dr = ld64(s330 + 0x30)
		if (ld32(s268) == 2) {
			dv = Error_with_account_name(s2e8, ld64(s260), ld64(s260 + 8), "position_mint", 0xd)
			const ds = ld64(s2e8)
			st64(dr + 0x10, ld64(s2e8 + 8))
			st64(dr + 8, ds)
			st32(dr, 2)
			return dv
		}
		return memcpy(dr, s268, 0x60)
	}
	du = ld64(s2d8 + 8)
	dt = ld64(s330 + 0x30)
	st64(dt + 8, ax, du)
	st32(dt, 2)
	return dv
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: p5 (value), p6 (value)
// types [heur]: b: OpenPositionWithMetadataContext (the handler ix_open_position_with_metadata passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_347f8(a: u64, b: OpenPositionWithMetadataContext, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc0 = fp - 0xc0, s1000 = fp - 0x1000
	let j, t, z, aj, ak: u64
	st64(sb0 + 0x18, a)
	const accounts: OpenPositionWithMetadataAccounts = b.accounts
	const g = ld64(accounts + 0x88)
	const h = memcmp(g + 0x148, 0x100152180, 0x20)
	const n = p6
	const m = p5
	if ((h as u32) == 0 && (ld16(g + 0xc8) & 1) != 0) {
		ak = fn_87630(s90, 0x43)
		j = ld64(s90)
		aj = ld64(sb0 + 0x18)
		st64(aj + 8, ld64(s90 + 8))
		st64(aj, j)
		return ak
	}
	const i = ld64(accounts + 0x70)
	st64(sb0 + 0x10, accounts + 0x98)
	ak = fn_4c1a0(s60, accounts + 0x60, i, accounts + 0x98)
	j = ld64(s60)
	if (j == 2) {
		const k = ld64(accounts + 0x88)
		const o = ld16(k + 0x284)
		const l = ld64(k + 0x240)
		st64(s1000, ld64(k + 0x238))
		st64(s1000 + 8, l)
		ak = fn_60930(s40, m, n, o, ld64(s1000), l)
		j = ld64(s40)
		if (j == 2) {
			B18: {
				const r = ld32(s38)
				const q = ld32(s38 + 4)
				st64(sb8, ld64(accounts + 0x88))
				z = ld64(accounts + 0x70)
				const p = ld64(ld64(accounts + 0x58))
				copyr(s40, p, 0x20)
				t = 0xa
				st64(sb0, q as i32, r as i32)
				if ((((r as i32) - 0x6c4f5) as u32) >= 0xfff27617) {
					const s = ld16(ld64(sb8) + 0x284)
					if (s == 0) {
						fn_14e1c0(0x100159f48, s, r as i32, q as i32, 0xa)
					}
					const u = ld64(sb0 + 8)
					st64(sc0, s)
					const v = fn_151bf8(u, s)
					t = 0xa
					if (((ld64(sb0) - 0x6c4f5) as u32) >= 0xfff27617 && (v as u32) == 0) {
						const w = ld64(sb0)
						const x = fn_151bf8(w, ld64(sc0))
						t = 0xa
						if ((w as i64) > (ld64(sb0 + 8) as i64) && (x as u32) == 0) {
							if ((ld64(sc0) as i16) > -1) {
								break B18
							}
							t = 0x36
							const y = 0x6c4f4 % ld64(sc0)
							if (y - 0x6c4f4 == ld64(sb0 + 8) && 0x6c4f4 - y == ld64(sb0)) {
								break B18
							}
						}
					}
				}
				ak = fn_87630(s70, t)
				t = undef
				j = ld64(s70)
				if (j != 2) {
					aj = ld64(sb0 + 0x18)
					st64(aj + 8, ld64(s70 + 8))
					st64(aj, j)
					return ak
				}
			}
			const aa = ld64(ld64(ld64(sb8)))
			st64(z + 0x20, ld64(aa + 0x18))
			st64(z + 0x18, ld64(aa + 0x10))
			st64(z + 0x10, ld64(aa + 8))
			st64(z + 8, ld64(aa))
			copy(z + 0x30, s38, 0x18)
			const ab = ld64(s40)
			st32(z + 0xd0, ld64(sb0 + 8))
			st32(z + 0xd4, ld64(sb0))
			st64(z + 0x28, ab)
			const ac = ld64(ld64(ld64(accounts + 0x88)))
			copyr(s40, ac, 0x20)
			const ad = ld64(ld64(ld64(accounts + 0x70)))
			copyr(s20, ad, 0x20)
			const ae = ld64(0x300000000 /* heap bump-allocator cursor */)
			const af = ae != 0 ? sat_sub(ae, 0x100) : 0x300007f00
			if (af > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, af)
				st64(af, 0x79657593e6f3afed /* event:PositionOpened */)
				copy(af + 8, s40, 0x40)
				st32(af + 0x4c, ld64(sb0))
				st32(af + 0x48, ld64(sb0 + 8))
				st64(s50, af, 0x50)
				log_data(s50, 1)
				const ai = ld64(accounts + 0x70)
				const ah = ld64(accounts + 0x88)
				const ag = ld64(accounts + 0x80)
				st64(s1000 + 0x30, ld64(sb0 + 0x10))
				st64(s1000 + 0x38, accounts + 0xa0)
				st64(s1000, ag, accounts + 0x78, accounts + 0xd0, accounts + 0x60, accounts + 0xc8, accounts + 0x90)
				ak = fn_67020(s80, ah, ai, accounts, ag, accounts + 0x78, accounts + 0xd0, accounts + 0x60, accounts + 0xc8, accounts + 0x90, ld64(s1000 + 0x30), accounts + 0xa0)
				j = ld64(s80)
				aj = ld64(sb0 + 0x18)
				st64(aj + 8, ld64(s80 + 8))
				st64(aj, j)
				return ak
			}
			raw_vec_handle_error(1, 0x100, sat_sub(ae, 0x100), 0x100 > ae, t)
		}
		aj = ld64(sb0 + 0x18)
		st64(aj + 8, ld64(s38))
		st64(aj, j)
		return ak
	}
	aj = ld64(sb0 + 0x18)
	st64(aj + 8, ld64(s60 + 8))
	st64(aj, j)
	return ak
}

// types [heur]: d: OpenPositionWithMetadataAccounts (every call passes one: fn_347f8)
export function fn_67020(a: u64, b: u64, c: u64, d: OpenPositionWithMetadataAccounts, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s58 = fp - 0x58, s70 = fp - 0x70, se0 = fp - 0xe0, s100 = fp - 0x100, s110 = fp - 0x110, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s198 = fp - 0x198, s1c0 = fp - 0x1c0, s1c8 = fp - 0x1c8, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8, s220 = fp - 0x220, s228 = fp - 0x228, s250 = fp - 0x250, s258 = fp - 0x258, s280 = fp - 0x280, s288 = fp - 0x288, s2b0 = fp - 0x2b0, s2b8 = fp - 0x2b8, s2e0 = fp - 0x2e0, s2e8 = fp - 0x2e8, s310 = fp - 0x310, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358
	let aj = a
	const g = ld64(p10)
	const f: AccountInfo = ld64(d + 0x58)
	let bj = fn_68310(s338, b, f, ld64(p5), g)
	let bi = ld64(s338 + 8)
	let h = ld64(s338)
	if (h != 2) {
		st64(aj, h, bi)
		return bj
	}
	const i: AccountInfo = ld64(p9)
	const j: LamportsCell = i.lamports
	const t = p12
	let cq = p11
	let cs = p8
	let ct = p7
	const m = p6
	const k = i.key
	rc_inc(j)
	const l: DataCell = i.data
	rc_inc(l)
	const n: AccountInfo = ld64(m)
	const o: LamportsCell = n.lamports
	const co = i.executable
	const cp = i.is_writable
	const cu = i.is_signer
	const cn = i.rent_epoch
	const q = i.owner
	const cm = n.key
	rc_inc(o)
	const p: DataCell = n.data
	rc_inc(p)
	const r: LamportsCell = f.lamports
	const cg = f.key
	const ch = n.executable
	const ci = n.is_writable
	const cj = n.is_signer
	const ck = n.rent_epoch
	const cl = n.owner
	rc_inc(r)
	const s: DataCell = f.data
	rc_inc(s)
	let cr = t
	const u: AccountInfo = ld64(b)
	const v: LamportsCell = u.lamports
	const cb = f.executable
	const cc = f.is_writable
	const cd = f.is_signer
	const ce = f.rent_epoch
	const cf = f.owner
	const x = u.key
	rc_inc(v)
	const w: DataCell = u.data
	rc_inc(w)
	const y: AccountInfo = ld64(ct)
	const z: LamportsCell = y.lamports
	ct = z
	const bw = u.executable
	const bx = u.is_writable
	const by = u.is_signer
	const bz = u.rent_epoch
	const ca = u.owner
	const ae = y.key
	rc_inc(z)
	const aa: DataCell = y.data
	rc_inc(aa)
	const ab: AccountInfo = ld64(cs)
	const ac: LamportsCell = ab.lamports
	cs = ac
	const bq = y.executable
	const br = y.is_writable
	const bs = y.is_signer
	const bt = y.rent_epoch
	const bu = y.owner
	const bv = ab.key
	rc_inc(ac)
	const ad: DataCell = ab.data
	const af = cr
	rc_inc(ad)
	const ag: AccountInfo = ld64(af)
	const ah: LamportsCell = ag.lamports
	cr = ah
	const bn = ab.executable
	const bo = ab.is_writable
	const bp = ab.is_signer
	const ak = ab.rent_epoch
	const ar = ab.owner
	const bm = ag.key
	rc_inc(ah)
	const ai: DataCell = ag.data
	const bk = aj
	rc_inc(ai)
	const al: AccountInfo = ld64(cq)
	const am: LamportsCell = al.lamports
	const bl = ag.executable
	cq = ag.is_writable
	const an = ag.is_signer
	const aq = ag.rent_epoch
	const ao = ag.owner
	const ay = al.key
	rc_inc(am)
	const ap: DataCell = al.data
	rc_inc(ap)
	const ax = al.owner
	const aw = al.rent_epoch
	const av = al.is_signer
	const au = al.is_writable
	const at = al.executable
	st8(s198, an, cq, bl)
	st64(s1c0, bm, cr, ai, ao, aq)
	st8(s1c8, av, au, at)
	st64(s1f0, ay, am, ap, ax, aw)
	st8(s1f8, bs, br, bq)
	st64(s220, ae, ct, aa, bu, bt)
	st8(s228, bp, bo, bn)
	st64(s250, bv, cs, ad, ar, ak)
	st8(s258, by, bx, bw)
	st64(s280, x, v, w, ca, bz)
	st8(s288, cd, cc, cb)
	st64(s2b0, cg, r, s, cf, ce)
	st8(s2b8, cj, ci, ch)
	st64(s2e0, cm, o, p, cl, ck)
	st64(s180, s170, 6, 0x100152b28, 9, b + 0x188, 0x20, b + 0x1a8, 0x20, b + 0x1e8, 0x20, b + 0x286, 2, b + 0x28c, 1)
	st64(s310, k, j, l, q, cn)
	st8(s2e8, cu, cp, co)
	st8(s198 + 7, ld8(s110 + 4))
	st32(s198 + 3, ld32(s110))
	st32(s2e8 + 3, ld32(s70))
	st8(s2e8 + 7, ld8(s70 + 4))
	st64(s328, 0, 8, 0)
	st64(s190, s180, 1)
	const az = ld64(0x300000000 /* heap bump-allocator cursor */)
	const ba = az != 0 ? sat_sub(az, 0x17) : 0x300007fe9
	if (ba > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, ba)
		st64(ba + 0xf, 0x6e6f697469736f50)
		st64(ba + 8, 0x50206c6f6f706c72)
		st64(ba, 0x696857206163724f)
		const bb = ld64(0x300000000 /* heap bump-allocator cursor */)
		const bc = bb != 0 ? sat_sub(bb, 3) : 0x300007ffd
		if (bc > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, bc)
			st8(bc + 2, 0x50)
			st16(bc, 0x574f)
			const bd = ld64(ld64(c))
			const bh = ld64(bd)
			const bg = ld64(bd + 8)
			const bf = ld64(bd + 0x10)
			const be = ld64(bd + 0x18)
			st64(s40, 0x10015a1d0, fn_b980, s20, fn_145330)
			st64(s70, 0x10015a1b0)
			st64(s70 + 0x10, s40)
			st64(s20, bh, bg, bf, be)
			st64(s70 + 8, 2)
			st64(s58, 2, 0)
			fn_147e78(se0, s70, bg, bf, s40)
			st64(s100 + 0x10, bc)
			st64(s110 + 8, ba)
			st64(se0 + 0x18, 0x8000000000000000)
			st16(se0 + 0x48, 0)
			st64(s100 + 0x18, 3)
			st64(s100, 0x17, 3)
			st64(s110, 0x17)
			st8(se0 + 0x4a, 2)
			st8(se0 + 0x40, 3)
			st8(s70, 2)
			bj = fn_128fc0(s348, s328, s110, 1, 0, s70)
			bi = ld64(s348 + 8)
			h = ld64(s348)
			aj = bk
			if (h != 2) {
				st64(aj, h, bi)
				return bj
			}
			bj = fn_69330(s358, b, f, g)
			bi = ld64(s358 + 8)
			st64(aj, ld64(s358))
			st64(aj + 8, bi)
			return bj
		}
		raw_vec_handle_error(1, 3, bb - 3, 3 > bb, bm)
	}
	raw_vec_handle_error(1, 0x17, az - 0x17, 0x17 > az, bm)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position, position_mint, position_token_account
export function fn_c2790(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78
	let n, p: u64
	fn_5a40(s28, ld64(b + 0x70), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const f = ld64(s28)
	if (f != 2) {
		n = Error_with_account_name(s38, f, ld64(s28 + 8), "position", 8)
		p = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, p)
		return n
	}
	const g = ld64(b + 0x58)
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
					n = Error_with_account_name(s58, l, ld64(s48 + 8), "position_mint", 0xd)
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
	const q = ld64(ld64(b + 0x80))
	const m = memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20)
	let o = undef
	n = m as u32
	if (n != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return n
	}
	n = common_is_closed(q)
	o = undef
	if (n != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return n
	}
	n = fn_143448(s18, q, n)
	o = ld64(s18 + 0x10)
	const r = ld64(s18)
	if (r != 0x800000000000001a /* Ok */) {
		const s = ld64(s18 + 8)
		st64(s18, r, s, o)
		n = fn_13b430(s68, s18)
		o = undef
		const t = ld64(s68)
		if (t == 2) {
			st64(a + 8, o)
			st64(a, 2)
			return n
		}
		n = Error_with_account_name(s78, t, ld64(s68 + 8), "position_token_account", 0x16)
		p = ld64(s78)
		st64(a + 8, ld64(s78 + 8))
		st64(a, p)
		return n
	}
	st64(o, ld64(o) + 1)
	st64(a + 8, o)
	st64(a, 2)
	return n
}
