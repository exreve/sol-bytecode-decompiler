/// <reference path="../lib.d.ts" />
// instruction open_position
import { fn_143100, fn_149678, fn_14e1c0, fn_14f7f8, fn_4a30, fn_4c1a0, fn_5a40, fn_60930, fn_68310, fn_69330, fn_bba20, log_data, memcpy } from '../shared.ts'

// instruction handler: open_position (discriminator sha256("global:open_position")[..8] = 0x31f0980f4d2f8087)
// accounts [str: the program's account-error strings, in order of first use]: funder, whirlpool, rent, position, position_mint, position_token_account, token_program, associated_token_program, system_program, owner
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
export function ix_open_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const sa8 = fp - 0xa8, sb0 = fp - 0xb0, sc0 = fp - 0xc0, s168 = fp - 0x168, s178 = fp - 0x178, s180 = fp - 0x180, s190 = fp - 0x190, s191 = fp - 0x191, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, sff8 = fp - 0xff8
	let k, l: u64
	sol_log("Instruction: OpenPosition", 0x19)
	const f = ix_args_len
	if (f >= 5 && f - 5 >= 4) {
		const g = ix_args
		const q = ld32(g + 1)
		const p = ld32(g + 5)
		st8(s191, 0xff)
		st64(s190, accounts, accounts_len)
		st64(sff8, s191)
		l = accounts_open_position(sc0, program_id, s190, undef, fp)
		const h = ld32(sc0)
		if (h == 2) {
			k = ld64(sc0 + 8)
			st64(a + 8, ld64(sb0))
			st64(a, k)
			return l
		}
		const o = ld32(sc0 + 4)
		const n = ld64(sc0 + 8)
		const m = ld64(sb0)
		memcpy(s168, sa8, 0xa8)
		st64(s178, n, m)
		st32(s180, h, o)
		st8(sa8 + 8, ld8(s191))
		copyr(sb0, s190, 0x10)
		st64(sc0, program_id, s180)
		l = fn_34000(s1a8, sc0, undef, q, p)
		k = ld64(s1a8)
		if (k == 2) {
			l = fn_bc720(s1b8, s180, program_id)
			k = ld64(s1b8)
			st64(a + 8, ld64(s1b8 + 8))
			st64(a, k)
			return l
		}
		st64(a + 8, ld64(s1a8 + 8))
		st64(a, k)
		return l
	}
	const i = fn_1459d0(0x100159468)
	if (2 > (i & 3) - 2) {
		l = anchor_error_from(s1c8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s1c8)
		st64(a + 8, ld64(s1c8 + 8))
		st64(a, k)
		return l
	}
	if ((i & 3) == 0) {
		l = anchor_error_from(s1c8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s1c8)
		st64(a + 8, ld64(s1c8 + 8))
		st64(a, k)
		return l
	}
	const j = ld64(ld64(i + 7))
	callx(j, ld64(i - 1), j)
	l = anchor_error_from(s1c8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	k = ld64(s1c8)
	st64(a + 8, ld64(s1c8 + 8))
	st64(a, k)
	return l
}

// Anchor Accounts::try_accounts of instruction open_position (called by ix_open_position; name [str]: from the handler's "Instruction: …" log; was fn_b6240)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: funder (ConstraintMut), whirlpool, rent, position (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), position_mint (ConstraintMut, ConstraintSigner, ConstraintRentExempt), position_token_account (ConstraintMut, ConstraintRentExempt), token_program (ConstraintAddress), associated_token_program, system_program, owner (AccountNotEnoughKeys)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position, position_mint, position_token_account, funder
export function accounts_open_position(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s268 = fp - 0x268, s270 = fp - 0x270, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s2a8 = fp - 0x2a8, s2d8 = fp - 0x2d8, s320 = fp - 0x320, s338 = fp - 0x338, s350 = fp - 0x350, s368 = fp - 0x368, s369 = fp - 0x369, s390 = fp - 0x390, s3a8 = fp - 0x3a8, s3c0 = fp - 0x3c0, s3c8 = fp - 0x3c8, s3d0 = fp - 0x3d0, s3d8 = fp - 0x3d8, s3e0 = fp - 0x3e0, s3e8 = fp - 0x3e8, s3f0 = fp - 0x3f0, s3f8 = fp - 0x3f8, s400 = fp - 0x400, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s598 = fp - 0x598, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s5c8 = fp - 0x5c8, s5d8 = fp - 0x5d8, s5e8 = fp - 0x5e8, s5f8 = fp - 0x5f8, s608 = fp - 0x608, s618 = fp - 0x618, s628 = fp - 0x628, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s668 = fp - 0x668, s678 = fp - 0x678, s690 = fp - 0x690, s698 = fp - 0x698, s6a0 = fp - 0x6a0, s6a8 = fp - 0x6a8, s6b0 = fp - 0x6b0, s6b8 = fp - 0x6b8
	let i, j, m, o, p, bk: u64
	st64(s408, b)
	try_accounts_11718(s290, c, c, d, e)
	const g = ld64(s288)
	const f = ld64(s290)
	if (f != 2) {
		p = Error_with_account_name(s418, f, g, "funder", 6)
		o = ld64(s418)
		st64(a + 0x10, ld64(s418 + 8))
		st64(a + 8, o)
		st32(a, 2)
		return p
	}
	const ah = ld64(e - 0xff8)
	st64(s400, g)
	const h = ld64(c + 8)
	if (h != 0) {
		const l: AccountInfo = ld64(c)
		st64(c, l + 0x30)
		m = h - 1
		st64(c + 8, m)
		st64(s3f8, l)
		if (m == 0) {
			p = anchor_error_from(s678, 0xbbd /* anchor::AccountNotEnoughKeys */, m, i, j)
			o = ld64(s678)
			st64(a + 0x10, ld64(s678 + 8))
			st64(a + 8, o)
			st32(a, 2)
			return p
		}
		const n: AccountInfo = ld64(c)
		st64(s3f0, n)
		st64(c + 8, h - 2)
		st64(c, n + 0x30)
		if (h != 2) {
			st64(s3e8, n + 0x30)
			st64(c + 8, h - 3)
			st64(c, n + 0x60)
			if (h != 3) {
				st64(s3e0, n + 0x60)
				st64(c + 8, h - 4)
				st64(c, n + 0x90)
				try_accounts_11a48(s290, c, n + 0x60, h - 3, j)
				if (ld64(s290) == 0) {
					p = Error_with_account_name(s628, ld64(s288), ld64(s288 + 8), 0x100152b28 /* "whirlpool" */, 9)
					o = ld64(s628)
					st64(a + 0x10, ld64(s628 + 8))
					st64(a + 8, o)
					st32(a, 2)
					return p
				}
				const q = ld64(0x300000000 /* heap bump-allocator cursor */)
				const r = q != 0 ? sat_sub(q, 0x290) & -8 : 0x300007d70
				if (r > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, r)
					memcpy(r, s290, 0x290)
					fn_129a0(s290, c)
					const t = ld64(s288)
					const s = ld64(s290)
					if (s == 2) {
						st64(s3d8, t)
						fn_122e8(s290, c, t)
						const v = ld64(s288)
						const u = ld64(s290)
						if (u == 2) {
							st64(s3d0, v)
							try_accounts_11990(s290, c, v)
							const y = ld64(s288 + 8)
							const x = ld64(s288)
							const w = ld64(s290)
							if (w == 0) {
								p = Error_with_account_name(s618, x, y, 0x100152d60 /* "rent" */, 4)
								o = ld64(s618)
								st64(a + 0x10, ld64(s618 + 8))
								st64(a + 8, o)
								st32(a, 2)
								return p
							}
							st64(s690, w, x, y)
							st64(s698, ld64(s278))
							fn_12510(s290, c, y)
							const aa = ld64(s288)
							const z = ld64(s290)
							if (z == 2) {
								st64(s3c8, aa)
								rent_get(s290)
								copy(s3a8, s288, 0x18)
								if (ld64(s290) == 0) {
									copyr(s3c0, s3a8, 0x18)
									const ab = ld64(ld64(s3e8))
									const af = ld64(ab + 0x18)
									const ae = ld64(ab + 0x10)
									const ad = ld64(ab + 8)
									const ac = ld64(ab)
									st64(s2d8, 0x100151f20)
									st64(s2d8 + 0x10, s338)
									st64(s338, ac, ad, ae, af)
									st64(s2d8 + 8, 8)
									st64(s2d8 + 0x18, 0x20)
									// PDA find_program_address(["position", *s338], program *(ld64(s408)))
									Pubkey_find_program_address(s290, s2d8, 2, ld64(s408))
									copyr(s390, s290, 0x20)
									const ag = ld8(s270)
									st8(s369, ag)
									st8(ah, ag)
									const ai = ld64(ld64(s3f0))
									copy(s290, ai, 0x20)
									if ((memcmp(s290, s390, 0x20) as u32) == 0) {
										st64(s268, s369, s408)
										st64(s270, ld64(s3e8))
										st64(s290, s3f0, s3c0, s400, s3d0)
										p = fn_b84b0(s338, s290)
										const aq = ld64(s338 + 8)
										o = ld64(s338)
										if (o == 2) {
											const position: AccountInfo = ld64(aq)
											if (position.is_writable == 0) {
												anchor_error_from(s5f8, 0x7d0 /* anchor::ConstraintMut */)
												p = Error_with_account_name(s608, ld64(s5f8), ld64(s5f8 + 8), "position", 8)
												o = ld64(s608)
												st64(a + 0x10, ld64(s608 + 8))
												st64(a + 8, o)
												st32(a, 2)
												return p
											}
											AccountInfo_clone(s338, position)
											st64(s6a0, fn_143100(s338))
											st64(s6a8, aq)
											AccountInfo_clone(s290, ld64(aq))
											AccountInfo_try_data_len(s2d8, s290)
											const au = ld64(s2d8 + 8)
											const at = ld64(s2d8)
											if (at != 0x800000000000001a /* Ok */) {
												st64(s2d8 + 0x10, ld64(s2d8 + 0x10))
												st64(s2d8, at, au)
												p = fn_13b430(s498, s2d8)
												const bg = ld64(s498)
												st64(a + 0x10, ld64(s498 + 8))
												st64(a + 8, bg)
												st32(a, 2)
												const bi = ld64(s288 + 8)
												const bh = ld64(s288)
												rc_dec(bh)
												rc_dec(bi)
												bk = ld64(s338 + 0x10)
												const bj = ld64(s338 + 8)
												rc_dec(bj)
												if (!rc_release(bk)) {
													return p
												}
												st64(bk + 8, ld64(bk + 8) - 1)
												return p
											}
											const av = __floatundidf(ld64(s3c0) * (au + 0x80))
											const aw = fn_14f7f8(ld64(s3c0 + 8), av)
											st64(s6b0, fn_151cb0(aw, 0))
											const ax = fn_14f3e8(aw)
											const ay = 0 > (ld64(s6b0) as i64) ? 0 : ax
											const bf = (fn_151a40(aw, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : ay
											const ba = ld64(s288 + 8)
											const az = ld64(s288)
											rc_dec(az)
											rc_dec(ba)
											const bd = ld64(s338 + 0x10)
											const bb = ld64(s338 + 8)
											let bc = ld64(bb) - 1
											st64(bb, bc)
											if (bc == 0) {
												bc = ld64(bb + 8) - 1
												st64(bb + 8, bc)
											}
											let be = ld64(bd) - 1
											st64(bd, be)
											if (be == 0) {
												be = ld64(bd + 8) - 1
												st64(bd + 8, be)
											}
											if (bf > ld64(s6a0)) {
												anchor_error_from(s5d8, 0x7d5 /* anchor::ConstraintRentExempt */, be, bc)
												p = Error_with_account_name(s5e8, ld64(s5d8), ld64(s5d8 + 8), "position", 8)
												o = ld64(s5e8)
												st64(a + 0x10, ld64(s5e8 + 8))
												st64(a + 8, o)
												st32(a, 2)
												return p
											}
											rent_get(s290)
											copy(s350, s288, 0x18)
											if (ld64(s290) != 0) {
												p = fn_13b430(s4a8, s350)
												o = ld64(s4a8)
												st64(a + 0x10, ld64(s4a8 + 8))
												st64(a + 8, o)
												st32(a, 2)
												return p
											}
											copyr(s368, s350, 0x18)
											st64(s2d8, s3e8, s368, s400, s3d0, s3d8, r)
											p = fn_b9f50(s290, s2d8)
											const bl = ld32(s290)
											if (bl == 2) {
												o = ld64(s288)
												st64(a + 0x10, ld64(s288 + 8))
												st64(a + 8, o)
												st32(a, 2)
												return p
											}
											st64(s6a0, ld32(s290 + 4))
											st64(s6b0, ld64(s288))
											const bm = ld64(s288 + 8)
											memcpy(s320, s278, 0x48)
											st64(s338 + 0x10, bm)
											st64(s338 + 8, ld64(s6b0))
											st32(s338 + 4, ld64(s6a0))
											st32(s338, bl)
											const position_mint: AccountInfo = ld64(s320 + 0x40)
											if (position_mint.is_writable == 0) {
												anchor_error_from(s5b8, 0x7d0 /* anchor::ConstraintMut */)
												p = Error_with_account_name(s5c8, ld64(s5b8), ld64(s5b8 + 8), "position_mint", 0xd)
												o = ld64(s5c8)
												st64(a + 0x10, ld64(s5c8 + 8))
												st64(a + 8, o)
												st32(a, 2)
												return p
											}
											if (position_mint.is_signer == 0) {
												anchor_error_from(s598, 0x7d2 /* anchor::ConstraintSigner */)
												p = Error_with_account_name(s5a8, ld64(s598), ld64(s598 + 8), "position_mint", 0xd)
												o = ld64(s5a8)
												st64(a + 0x10, ld64(s5a8 + 8))
												st64(a + 8, o)
												st32(a, 2)
												return p
											}
											AccountInfo_clone(s2d8, position_mint)
											st64(s6a0, fn_143100(s2d8))
											AccountInfo_clone(s290, ld64(s320 + 0x40))
											AccountInfo_try_data_len(s2a8, s290)
											const bp = ld64(s2a8 + 8)
											const bo = ld64(s2a8)
											if (bo != 0x800000000000001a /* Ok */) {
												st64(s2a8 + 0x10, ld64(s2a8 + 0x10))
												st64(s2a8, bo, bp)
												p = fn_13b430(s4b8, s2a8)
												const cb = ld64(s4b8)
												st64(a + 0x10, ld64(s4b8 + 8))
												st64(a + 8, cb)
												st32(a, 2)
												const cd = ld64(s288 + 8)
												const cc = ld64(s288)
												rc_dec(cc)
												rc_dec(cd)
												bk = ld64(s2d8 + 0x10)
												const ce = ld64(s2d8 + 8)
												rc_dec(ce)
												if (!rc_release(bk)) {
													return p
												}
												st64(bk + 8, ld64(bk + 8) - 1)
												return p
											}
											const bq = __floatundidf(ld64(s368) * (bp + 0x80))
											const br = fn_14f7f8(ld64(s368 + 8), bq)
											st64(s6b0, fn_151cb0(br, 0))
											const bs = fn_14f3e8(br)
											const bt = 0 > (ld64(s6b0) as i64) ? 0 : bs
											const ca = (fn_151a40(br, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : bt
											const bv = ld64(s288 + 8)
											const bu = ld64(s288)
											rc_dec(bu)
											rc_dec(bv)
											const by = ld64(s2d8 + 0x10)
											const bw = ld64(s2d8 + 8)
											let bx = ld64(bw) - 1
											st64(bw, bx)
											if (bx == 0) {
												bx = ld64(bw + 8) - 1
												st64(bw + 8, bx)
											}
											let bz = ld64(by) - 1
											st64(by, bz)
											if (bz == 0) {
												bz = ld64(by + 8) - 1
												st64(by + 8, bz)
											}
											if (ca > ld64(s6a0)) {
												anchor_error_from(s578, 0x7d5 /* anchor::ConstraintRentExempt */, bz, bx)
												p = Error_with_account_name(s588, ld64(s578), ld64(s578 + 8), "position_mint", 0xd)
												o = ld64(s588)
												st64(a + 0x10, ld64(s588 + 8))
												st64(a + 8, o)
												st32(a, 2)
												return p
											}
											rent_get(s290)
											const ck = ld64(s288 + 8)
											const cj = ld64(s288)
											if (ld64(s290) != 0) {
												st32(s2d8, ld32(s278 + 1))
												st32(s2d8 + 3, ld32(s278 + 4))
												const cv = ld8(s278)
												st32(s288 + 0xc, ld32(s2d8 + 3))
												st32(s288 + 9, ld32(s2d8))
												st8(s288 + 8, cv)
												st64(s290, cj, ck)
												p = fn_13b430(s4c8, s290)
												o = ld64(s4c8)
												st64(a + 0x10, ld64(s4c8 + 8))
												st64(a + 8, o)
												st32(a, 2)
												return p
											}
											st64(s290, s3e0, s3c8, s400, s3f8, s338, s3d0, s3d8)
											p = fn_bba20(s2d8, s290)
											st64(s6a0, ld64(s2d8 + 8))
											o = ld64(s2d8)
											if (o == 2) {
												const position_token_account: AccountInfo = ld64(ld64(s6a0))
												if (position_token_account.is_writable == 0) {
													anchor_error_from(s558, 0x7d0 /* anchor::ConstraintMut */)
													p = Error_with_account_name(s568, ld64(s558), ld64(s558 + 8), "position_token_account", 0x16)
													o = ld64(s568)
													st64(a + 0x10, ld64(s568 + 8))
													st64(a + 8, o)
													st32(a, 2)
													return p
												}
												st64(s6b0, s2d8)
												AccountInfo_clone(s2d8, position_token_account)
												st64(s6b8, fn_143100(ld64(s6b0)))
												const cg = ld64(ld64(s6a0))
												st64(s6b0, s290)
												AccountInfo_clone(s290, cg)
												AccountInfo_try_data_len(s2a8, ld64(s6b0))
												const ci = ld64(s2a8 + 8)
												const ch = ld64(s2a8)
												if (ch != 0x800000000000001a /* Ok */) {
													st64(s2a8 + 0x10, ld64(s2a8 + 0x10))
													st64(s2a8, ch, ci)
													p = fn_13b430(s4d8, s2a8)
													const cw = ld64(s4d8)
													st64(a + 0x10, ld64(s4d8 + 8))
													st64(a + 8, cw)
													st32(a, 2)
													const cy = ld64(s288 + 8)
													const cx = ld64(s288)
													rc_dec(cx)
													rc_dec(cy)
													bk = ld64(s2d8 + 0x10)
													const cz = ld64(s2d8 + 8)
													rc_dec(cz)
													if (!rc_release(bk)) {
														return p
													}
													st64(bk + 8, ld64(bk + 8) - 1)
													return p
												}
												const cl = fn_14f7f8(ck, __floatundidf((ci + 0x80) * cj))
												st64(s6b0, fn_151cb0(cl, 0))
												const cm = fn_14f3e8(cl)
												const cn = 0 > (ld64(s6b0) as i64) ? 0 : cm
												const cu = (fn_151a40(cl, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : cn
												const cp = ld64(s288 + 8)
												const co = ld64(s288)
												rc_dec(co)
												rc_dec(cp)
												const cs = ld64(s2d8 + 0x10)
												const cq = ld64(s2d8 + 8)
												let cr = ld64(cq) - 1
												st64(cq, cr)
												if (cr == 0) {
													cr = ld64(cq + 8) - 1
													st64(cq + 8, cr)
												}
												let ct = ld64(cs) - 1
												st64(cs, ct)
												if (ct == 0) {
													ct = ld64(cs + 8) - 1
													st64(cs + 8, ct)
												}
												if (cu > ld64(s6b8)) {
													anchor_error_from(s538, 0x7d5 /* anchor::ConstraintRentExempt */, ct, cr)
													p = Error_with_account_name(s548, ld64(s538), ld64(s538 + 8), "position_token_account", 0x16)
													o = ld64(s548)
													st64(a + 0x10, ld64(s548 + 8))
													st64(a + 8, o)
													st32(a, 2)
													return p
												}
												const funder: AccountInfo = ld64(s400)
												if (funder.is_writable != 0) {
													const db = ld64(s3d8)
													const dc = ld64(db)
													copy(s2d8, dc, 0x20)
													if ((memcmp(s2d8, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
														anchor_error_from(s4e8, 0x7dc /* anchor::ConstraintAddress */)
														const dg = Error_with_account_name(s4f8, ld64(s4e8), ld64(s4e8 + 8), "token_program", 0xd)
														const df = ld64(s4f8 + 8)
														const de = ld64(s4f8)
														copyr(s290, s2d8, 0x20)
														st64(s270, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
														p = fn_13b5c0(s508, de, df, s290, dg)
														o = ld64(s508)
														st64(a + 0x10, ld64(s508 + 8))
														st64(a + 8, o)
														st32(a, 2)
														return p
													}
													st64(s6b0, ld64(s3f8))
													p = memcpy(a, s338, 0x60)
													const dd = ld64(s3c8)
													st64(a + 0x90, ld64(s3d0))
													st64(a + 0xb8, dd)
													st64(a + 0xb0, ld64(s698))
													st64(a + 0xa8, ld64(s690 + 0x10))
													st64(a + 0xa0, ld64(s690 + 8))
													st64(a + 0x98, ld64(s690))
													st64(a + 0x88, db)
													st64(a + 0x80, r)
													st64(a + 0x78, ld64(s6a0))
													st64(a + 0x70, ld64(s6a8))
													st64(a + 0x68, ld64(s6b0))
													st64(a + 0x60, funder)
													return p
												}
												anchor_error_from(s518, 0x7d0 /* anchor::ConstraintMut */, ct, cr)
												p = Error_with_account_name(s528, ld64(s518), ld64(s518 + 8), "funder", 6)
												o = ld64(s528)
												st64(a + 0x10, ld64(s528 + 8))
												st64(a + 8, o)
												st32(a, 2)
												return p
											}
											st64(a + 0x10, ld64(s6a0))
											st64(a + 8, o)
											st32(a, 2)
											return p
										}
										st64(a + 0x10, aq)
										st64(a + 8, o)
										st32(a, 2)
										return p
									}
									anchor_error_from(s468, 0x7d6 /* anchor::ConstraintSeeds */)
									Error_with_account_name(s478, ld64(s468), ld64(s468 + 8), "position", 8)
									const ap = ld64(s478 + 8)
									const ao = ld64(s478)
									const aj = ld64(ld64(s3f0))
									const an = ld64(aj + 0x18)
									const am = ld64(aj + 0x10)
									const al = ld64(aj + 8)
									const ak = ld64(aj)
									copy(s270, s390, 0x20)
									st64(s290, ak, al, am, an)
									p = fn_13b5c0(s488, ao, ap, s290, al)
									o = ld64(s488)
									st64(a + 0x10, ld64(s488 + 8))
									st64(a + 8, o)
									st32(a, 2)
									return p
								}
								p = fn_13b430(s458, s3a8)
								o = ld64(s458)
								st64(a + 0x10, ld64(s458 + 8))
								st64(a + 8, o)
								st32(a, 2)
								return p
							}
							p = Error_with_account_name(s448, z, aa, "associated_token_program", 0x18)
							o = ld64(s448)
							st64(a + 0x10, ld64(s448 + 8))
							st64(a + 8, o)
							st32(a, 2)
							return p
						}
						p = Error_with_account_name(s438, u, v, "system_program", 0xe)
						o = ld64(s438)
						st64(a + 0x10, ld64(s438 + 8))
						st64(a + 8, o)
						st32(a, 2)
						return p
					}
					p = Error_with_account_name(s428, s, t, "token_program", 0xd)
					o = ld64(s428)
					st64(a + 0x10, ld64(s428 + 8))
					st64(a + 8, o)
					st32(a, 2)
					return p
				}
				alloc_handle_alloc_error(8, 0x290)
			}
			p = anchor_error_from(s638, 0xbbd /* anchor::AccountNotEnoughKeys */, n + 0x60, h - 3, j)
			o = ld64(s638)
			st64(a + 0x10, ld64(s638 + 8))
			st64(a + 8, o)
			st32(a, 2)
			return p
		}
		p = anchor_error_from(s648, 0xbbd /* anchor::AccountNotEnoughKeys */, n + 0x30, h - 2, j)
		o = ld64(s648)
		st64(a + 0x10, ld64(s648 + 8))
		st64(a + 8, o)
		st32(a, 2)
		return p
	}
	anchor_error_from(s658, 0xbbd /* anchor::AccountNotEnoughKeys */, g, i, j)
	m = undef
	const k = ld64(s658)
	if (k == 2) {
		p = anchor_error_from(s678, 0xbbd /* anchor::AccountNotEnoughKeys */, m, i, j)
		o = ld64(s678)
		st64(a + 0x10, ld64(s678 + 8))
		st64(a + 8, o)
		st32(a, 2)
		return p
	}
	p = Error_with_account_name(s668, k, ld64(s658 + 8), 0x100154aba /* "owner" */, 5)
	o = ld64(s668)
	st64(a + 0x10, ld64(s668 + 8))
	st64(a + 8, o)
	st32(a, 2)
	return p
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position
export function fn_b84b0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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
				st64(s2c8 + 8, 0x100154a86)
				st32(s248 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s278, 2)
				st32(s2b0, 0xe)
				st64(s2c8 + 0x10, 0x34)
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
export function fn_b9f50(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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
				st64(s260, 0x100154a86)
				st32(s1d8 + 8, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s218, 2)
				st32(s260 + 0x10, 0xe)
				st64(s260 + 8, 0x34)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: e (value), d (value)
// types [heur]: b: OpenPositionContext (the handler ix_open_position passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_34000(a: u64, b: OpenPositionContext, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let h, m, n, t, aa, ae, ag: u64
	st64(sa8, a)
	const accounts: OpenPositionAccounts = b.accounts
	const g = ld64(accounts + 0x80)
	if ((memcmp(g + 0x148, 0x100152180, 0x20) as u32) == 0 && (ld16(g + 0xc8) & 1) != 0) {
		ag = fn_87630(sa0, 0x43)
		h = ld64(sa0)
		ae = ld64(sa8)
		st64(ae + 8, ld64(sa0 + 8))
		st64(ae, h)
		return ag
	}
	ag = fn_4c1a0(s60, accounts + 0x60, ld64(accounts + 0x70), accounts + 0x90)
	h = ld64(s60)
	if (h == 2) {
		const i = ld64(accounts + 0x80)
		const k = ld16(i + 0x284)
		const j = ld64(i + 0x240)
		st64(s1000, ld64(i + 0x238))
		st64(sff8, j)
		ag = fn_60930(s40, d, e, k, ld64(s1000), j)
		h = ld64(s40)
		if (h == 2) {
			B18: {
				n = ld32(s38)
				m = ld32(s38 + 4)
				st64(sb0, ld64(accounts + 0x80))
				t = ld64(accounts + 0x70)
				const l = ld64(ld64(accounts + 0x58))
				copyr(s40, l, 0x20)
				let s = 0xa
				if ((((n as i32) - 0x6c4f5) as u32) >= 0xfff27617) {
					const o = ld16(ld64(sb0) + 0x284)
					if (o == 0) {
						fn_14e1c0(0x100159f48, o, 0xfff27617)
					}
					st64(sb8, o)
					const p = fn_151bf8(n as i32, o)
					s = 0xa
					if ((((m as i32) - 0x6c4f5) as u32) >= 0xfff27617 && (p as u32) == 0) {
						const q = fn_151bf8(m as i32, ld64(sb8))
						s = 0xa
						if ((m as i32) > (n as i32) && (q as u32) == 0) {
							if ((ld64(sb8) as i16) > -1) {
								break B18
							}
							s = 0x36
							const r = 0x6c4f4 % ld64(sb8)
							if (r - 0x6c4f4 == (n as i32) && 0x6c4f4 - r == (m as i32)) {
								break B18
							}
						}
					}
				}
				ag = fn_87630(s70, s)
				h = ld64(s70)
				if (h != 2) {
					ae = ld64(sa8)
					st64(ae + 8, ld64(s70 + 8))
					st64(ae, h)
					return ag
				}
			}
			const u = ld64(ld64(ld64(sb0)))
			st64(t + 0x20, ld64(u + 0x18))
			st64(t + 0x18, ld64(u + 0x10))
			st64(t + 0x10, ld64(u + 8))
			st64(t + 8, ld64(u))
			copy(t + 0x30, s38, 0x18)
			const v = ld64(s40)
			st32(t + 0xd0, n as i32, m as i32)
			st64(t + 0x28, v)
			const w = ld64(ld64(ld64(accounts + 0x80)))
			copyr(s40, w, 0x20)
			const x = ld64(ld64(ld64(accounts + 0x70)))
			copyr(s20, x, 0x20)
			const y = ld64(0x300000000 /* heap bump-allocator cursor */)
			const z = y != 0 ? sat_sub(y, 0x100) : 0x300007f00
			if (z > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, z)
				st64(z, 0x79657593e6f3afed /* event:PositionOpened */)
				copy(z + 8, s40, 0x40)
				st32(z + 0x4c, m as i32)
				st32(z + 0x48, n as i32)
				st64(s50, z, 0x50)
				log_data(s50, 1)
				const ad = ld64(accounts + 0x88)
				const ac = ld64(accounts + 0x58)
				const ab = ld64(accounts + 0x80)
				ag = fn_68310(s80, ab, ac, ld64(ld64(accounts + 0x78)), ad)
				const af = ld64(s80 + 8)
				h = ld64(s80)
				if (h != 2) {
					ae = ld64(sa8)
					st64(ae + 8, af)
					st64(ae, h)
					return ag
				}
				ag = fn_69330(s90, ab, ac, ad)
				h = ld64(s90)
				ae = ld64(sa8)
				st64(ae + 8, ld64(s90 + 8))
				st64(ae, h)
				return ag
			}
			raw_vec_handle_error(1, 0x100, sat_sub(y, 0x100), 0x100 > y, aa)
		}
		ae = ld64(sa8)
		st64(ae + 8, ld64(s38))
		st64(ae, h)
		return ag
	}
	ae = ld64(sa8)
	st64(ae + 8, ld64(s60 + 8))
	st64(ae, h)
	return ag
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position, position_mint, position_token_account
export function fn_bc720(a: u64, b: u64, c: u64): u64 {
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
	const q = ld64(ld64(b + 0x78))
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
