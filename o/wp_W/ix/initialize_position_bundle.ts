/// <reference path="../lib.d.ts" />
// instruction initialize_position_bundle
import { fn_143100, fn_149678, fn_14f7f8, fn_3240, fn_6b9a8, fn_6c748, fn_7f28, fn_a4608, memcpy } from '../shared.ts'

// instruction handler: initialize_position_bundle (discriminator sha256("global:initialize_position_bundle")[..8] = 0x41c2121895f12d75)
// accounts [str: the program's account-error strings, in order of first use]: position_bundle_owner, rent, position_bundle, position_bundle_mint, position_bundle_token_account, token_program, funder, associated_token_program, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
export function ix_initialize_position_bundle(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, sc8 = fp - 0xc8, se0 = fp - 0xe0, s180 = fp - 0x180, s190 = fp - 0x190, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1a9 = fp - 0x1a9, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1000 = fp - 0x1000
	let w: u64
	let g = a
	sol_log("Instruction: InitializePositionBundle", 0x25)
	st8(s1a9, 0xff)
	st64(s1a8, accounts, accounts_len)
	st64(s1000 + 8, s1a9)
	let y = accounts_initialize_position_bundle(se0, program_id, s1a8, undef, fp)
	const f = ld32(se0)
	if (f == 2) {
		w = ld64(se0 + 8)
		st64(g + 8, ld64(se0 + 0x10))
		st64(g, w)
		return y
	}
	const z = g
	const j = ld32(se0 + 4)
	const i = ld64(se0 + 8)
	const h = ld64(se0 + 0x10)
	memcpy(s180, sc8, 0xa0)
	st64(s190, i, h)
	st32(s198, f, j)
	const k = ld64(s180 + 0x40)
	const l = ld64(k)
	const p = ld64(l)
	const o = ld64(l + 8)
	const n = ld64(l + 0x10)
	const r = ld8(s1a9)
	const m = ld64(s180 + 0x48)
	st64(m + 0x20, ld64(l + 0x18))
	st64(m + 0x18, n)
	st64(m + 0x10, o)
	st64(m + 8, p)
	const s = ld64(s180 + 0x50)
	const q = ld64(k)
	copyr(s28, q, 0x20)
	st64(se0, 0x100152e73)
	st64(se0 + 0x10, s28)
	st64(sc8 + 8, s1)
	st8(s1, r)
	st64(se0 + 8, 0xf)
	st64(sc8, 0x20)
	st64(sc8 + 0x10, 1)
	const v = ld64(s)
	const u = ld64(m)
	const t = ld64(s180 + 0x68)
	st64(s1000, t, se0, 3)
	y = fn_6b9a8(s1c0, u, k, v, t, se0, 3)
	w = ld64(s1c0)
	if (w == 2) {
		st64(s1000, se0, 3)
		y = fn_6c748(s1d0, u, k, t, se0, 3)
		const x = ld64(s1d0 + 8)
		w = ld64(s1d0)
		g = z
		if (w == 2) {
			y = fn_a5308(s1e0, s198, program_id)
			w = ld64(s1e0)
			st64(g + 8, ld64(s1e0 + 8))
			st64(g, w)
			return y
		}
		st64(g + 8, x)
		st64(g, w)
		return y
	}
	st64(z + 8, ld64(s1c0 + 8))
	st64(z, w)
	return y
}

// Anchor Accounts::try_accounts of instruction initialize_position_bundle (called by ix_initialize_position_bundle; name [str]: from the handler's "Instruction: …" log; was fn_9efa8)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_bundle_owner (AccountNotEnoughKeys), rent, position_bundle (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), position_bundle_mint (ConstraintMut, ConstraintSigner, ConstraintRentExempt), position_bundle_token_account (ConstraintMut, ConstraintRentExempt), token_program (ConstraintAddress), funder (ConstraintMut), associated_token_program, system_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_bundle, position_bundle_mint, position_bundle_token_account, funder
export function accounts_initialize_position_bundle(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s18 = fp - 0x18, s48 = fp - 0x48, s80 = fp - 0x80, s88 = fp - 0x88, s90 = fp - 0x90, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sf0 = fp - 0xf0, s108 = fp - 0x108, s120 = fp - 0x120, s138 = fp - 0x138, s139 = fp - 0x139, s160 = fp - 0x160, s178 = fp - 0x178, s190 = fp - 0x190, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, s1b0 = fp - 0x1b0, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1c8 = fp - 0x1c8, s1d0 = fp - 0x1d0, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s450 = fp - 0x450, s458 = fp - 0x458, s460 = fp - 0x460, s468 = fp - 0x468, s470 = fp - 0x470
	let v, w, bg: u64
	st64(s1d8, b)
	const f = ld64(c + 8)
	if (f != 0) {
		const ad = ld64(e - 0xff8)
		const g: AccountInfo = ld64(c)
		st64(s1d0, g)
		st64(c + 8, f - 1)
		st64(c, g + 0x30)
		if (f != 1) {
			st64(s1c8, g + 0x30)
			st64(c + 8, f - 2)
			st64(c, g + 0x60)
			if (f != 2) {
				st64(s1c0, g + 0x60)
				let h = f - 3
				st64(c + 8, h)
				let i = g + 0x90
				st64(c, i)
				if (h == 0) {
					anchor_error_from(s1e8, 0xbbd /* anchor::AccountNotEnoughKeys */, c, i, h)
					h = undef
					i = ld64(s1e8 + 8)
					const j = ld64(s1e8)
					if (j != 2) {
						w = Error_with_account_name(s1f8, j, i, "position_bundle_owner", 0x15)
						v = ld64(s1f8)
						st64(a + 0x10, ld64(s1f8 + 8))
						st64(a + 8, v)
						st32(a, 2)
						return w
					}
				} else {
					st64(c + 8, f - 4)
					st64(c, g + 0xc0)
				}
				st64(s1b8, i)
				try_accounts_11718(sa8, c, c, i, h)
				const l = ld64(sa0)
				const k = ld64(sa8)
				if (k == 2) {
					st64(s1b0, l)
					fn_129a0(sa8, c, l)
					const n = ld64(sa0)
					const m = ld64(sa8)
					if (m == 2) {
						st64(s1a8, n)
						fn_122e8(sa8, c, n)
						const p = ld64(sa0)
						const o = ld64(sa8)
						if (o == 2) {
							st64(s1a0, p)
							try_accounts_11990(sa8, c, p)
							const s = ld64(sa0 + 8)
							const r = ld64(sa0)
							const q = ld64(sa8)
							if (q == 0) {
								w = Error_with_account_name(s408, r, s, 0x100152d60 /* "rent" */, 4)
								v = ld64(s408)
								st64(a + 0x10, ld64(s408 + 8))
								st64(a + 8, v)
								st32(a, 2)
								return w
							}
							st64(s448, r, s)
							st64(s450, ld64(s90))
							fn_12510(sa8, c, s)
							const u = ld64(sa0)
							const t = ld64(sa8)
							if (t == 2) {
								st64(s198, u)
								rent_get(sa8)
								copy(s178, sa0, 0x18)
								if (ld64(sa8) == 0) {
									copyr(s190, s178, 0x18)
									const x = ld64(ld64(s1c8))
									const ab = ld64(x + 0x18)
									const aa = ld64(x + 0x10)
									const z = ld64(x + 8)
									const y = ld64(x)
									st64(s48, 0x100152e73)
									st64(s48 + 0x10, s108)
									st64(s108, y, z, aa, ab)
									st64(s48 + 8, 0xf)
									st64(s48 + 0x18, 0x20)
									// PDA find_program_address(["position_bundle", *s108], program *(ld64(s1d8)))
									Pubkey_find_program_address(sa8, s48, 2, ld64(s1d8))
									copyr(s160, sa8, 0x20)
									const ac = ld8(s88)
									st8(s139, ac)
									st8(ad, ac)
									const ae = ld64(ld64(s1d0))
									copy(sa8, ae, 0x20)
									if ((memcmp(sa8, s160, 0x20) as u32) == 0) {
										st64(s80, s139, s1d8)
										st64(s88, ld64(s1c8))
										st64(sa8, s1d0, s190, s1b0, s1a0)
										w = fn_a1098(s108, sa8)
										const am = ld64(s108 + 8)
										v = ld64(s108)
										if (v == 2) {
											const position_bundle: AccountInfo = ld64(am)
											if (position_bundle.is_writable == 0) {
												anchor_error_from(s3e8, 0x7d0 /* anchor::ConstraintMut */)
												w = Error_with_account_name(s3f8, ld64(s3e8), ld64(s3e8 + 8), "position_bundle", 0xf)
												v = ld64(s3f8)
												st64(a + 0x10, ld64(s3f8 + 8))
												st64(a + 8, v)
												st32(a, 2)
												return w
											}
											AccountInfo_clone(s108, position_bundle)
											st64(s458, fn_143100(s108))
											AccountInfo_clone(sa8, ld64(am))
											AccountInfo_try_data_len(s48, sa8)
											const ap = ld64(s48 + 8)
											const ao = ld64(s48)
											if (ao != 0x800000000000001a /* Ok */) {
												st64(s48 + 0x10, ld64(s48 + 0x10))
												st64(s48, ao, ap)
												w = fn_13b430(s288, s48)
												const bc = ld64(s288)
												st64(a + 0x10, ld64(s288 + 8))
												st64(a + 8, bc)
												st32(a, 2)
												const be = ld64(sa0 + 8)
												const bd = ld64(sa0)
												rc_dec(bd)
												rc_dec(be)
												bg = ld64(s108 + 0x10)
												const bf = ld64(s108 + 8)
												rc_dec(bf)
												if (!rc_release(bg)) {
													return w
												}
												st64(bg + 8, ld64(bg + 8) - 1)
												return w
											}
											st64(s468, am)
											const aq = __floatundidf(ld64(s190) * (ap + 0x80))
											const ar = fn_14f7f8(ld64(s190 + 8), aq)
											st64(s460, fn_151cb0(ar, 0))
											const at = fn_14f3e8(ar)
											const au = 0 > (ld64(s460) as i64) ? 0 : at
											const bb = (fn_151a40(ar, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : au
											const aw = ld64(sa0 + 8)
											const av = ld64(sa0)
											rc_dec(av)
											rc_dec(aw)
											const az = ld64(s108 + 0x10)
											const ax = ld64(s108 + 8)
											let ay = ld64(ax) - 1
											st64(ax, ay)
											if (ay == 0) {
												ay = ld64(ax + 8) - 1
												st64(ax + 8, ay)
											}
											let ba = ld64(az) - 1
											st64(az, ba)
											if (ba == 0) {
												ba = ld64(az + 8) - 1
												st64(az + 8, ba)
											}
											if (bb > ld64(s458)) {
												anchor_error_from(s3c8, 0x7d5 /* anchor::ConstraintRentExempt */, ba, ay)
												w = Error_with_account_name(s3d8, ld64(s3c8), ld64(s3c8 + 8), "position_bundle", 0xf)
												v = ld64(s3d8)
												st64(a + 0x10, ld64(s3d8 + 8))
												st64(a + 8, v)
												st32(a, 2)
												return w
											}
											rent_get(sa8)
											copy(s120, sa0, 0x18)
											if (ld64(sa8) != 0) {
												w = fn_13b430(s298, s120)
												v = ld64(s298)
												st64(a + 0x10, ld64(s298 + 8))
												st64(a + 8, v)
												st32(a, 2)
												return w
											}
											copyr(s138, s120, 0x18)
											st64(s48 + 0x28, ld64(s468))
											st64(s48, s1c8, s138, s1b0, s1a0, s1a8)
											w = fn_a2b38(sa8, s48)
											const bh = ld32(sa8)
											if (bh == 2) {
												v = ld64(sa0)
												st64(a + 0x10, ld64(sa0 + 8))
												st64(a + 8, v)
												st32(a, 2)
												return w
											}
											st64(s458, ld32(sa8 + 4))
											st64(s460, ld64(sa0))
											const bi = ld64(sa0 + 8)
											memcpy(sf0, s90, 0x48)
											st64(s108 + 0x10, bi)
											st64(s108 + 8, ld64(s460))
											st32(s108 + 4, ld64(s458))
											st32(s108, bh)
											const position_bundle_mint: AccountInfo = ld64(sf0 + 0x40)
											if (position_bundle_mint.is_writable == 0) {
												anchor_error_from(s3a8, 0x7d0 /* anchor::ConstraintMut */)
												w = Error_with_account_name(s3b8, ld64(s3a8), ld64(s3a8 + 8), "position_bundle_mint", 0x14)
												v = ld64(s3b8)
												st64(a + 0x10, ld64(s3b8 + 8))
												st64(a + 8, v)
												st32(a, 2)
												return w
											}
											if (position_bundle_mint.is_signer == 0) {
												anchor_error_from(s388, 0x7d2 /* anchor::ConstraintSigner */)
												w = Error_with_account_name(s398, ld64(s388), ld64(s388 + 8), "position_bundle_mint", 0x14)
												v = ld64(s398)
												st64(a + 0x10, ld64(s398 + 8))
												st64(a + 8, v)
												st32(a, 2)
												return w
											}
											AccountInfo_clone(s48, position_bundle_mint)
											st64(s458, fn_143100(s48))
											AccountInfo_clone(sa8, ld64(sf0 + 0x40))
											AccountInfo_try_data_len(s18, sa8)
											const bl = ld64(s18 + 8)
											const bk = ld64(s18)
											if (bk != 0x800000000000001a /* Ok */) {
												st64(s18 + 0x10, ld64(s18 + 0x10))
												st64(s18, bk, bl)
												w = fn_13b430(s2a8, s18)
												const bx = ld64(s2a8)
												st64(a + 0x10, ld64(s2a8 + 8))
												st64(a + 8, bx)
												st32(a, 2)
												const bz = ld64(sa0 + 8)
												const by = ld64(sa0)
												rc_dec(by)
												rc_dec(bz)
												bg = ld64(s48 + 0x10)
												const ca = ld64(s48 + 8)
												rc_dec(ca)
												if (!rc_release(bg)) {
													return w
												}
												st64(bg + 8, ld64(bg + 8) - 1)
												return w
											}
											const bm = __floatundidf(ld64(s138) * (bl + 0x80))
											const bn = fn_14f7f8(ld64(s138 + 8), bm)
											st64(s460, fn_151cb0(bn, 0))
											const bo = fn_14f3e8(bn)
											const bp = 0 > (ld64(s460) as i64) ? 0 : bo
											const bw = (fn_151a40(bn, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : bp
											const br = ld64(sa0 + 8)
											const bq = ld64(sa0)
											rc_dec(bq)
											rc_dec(br)
											const bu = ld64(s48 + 0x10)
											const bs = ld64(s48 + 8)
											let bt = ld64(bs) - 1
											st64(bs, bt)
											if (bt == 0) {
												bt = ld64(bs + 8) - 1
												st64(bs + 8, bt)
											}
											let bv = ld64(bu) - 1
											st64(bu, bv)
											if (bv == 0) {
												bv = ld64(bu + 8) - 1
												st64(bu + 8, bv)
											}
											if (bw > ld64(s458)) {
												anchor_error_from(s368, 0x7d5 /* anchor::ConstraintRentExempt */, bv, bt)
												w = Error_with_account_name(s378, ld64(s368), ld64(s368 + 8), "position_bundle_mint", 0x14)
												v = ld64(s378)
												st64(a + 0x10, ld64(s378 + 8))
												st64(a + 8, v)
												st32(a, 2)
												return w
											}
											rent_get(sa8)
											const cg = ld64(sa0 + 8)
											const cf = ld64(sa0)
											if (ld64(sa8) != 0) {
												st32(s48, ld32(s90 + 1))
												st32(s48 + 3, ld32(s90 + 4))
												const cr = ld8(s90)
												st32(sa0 + 0xc, ld32(s48 + 3))
												st32(sa0 + 9, ld32(s48))
												st8(sa0 + 8, cr)
												st64(sa8, cf, cg)
												w = fn_13b430(s2b8, sa8)
												v = ld64(s2b8)
												st64(a + 0x10, ld64(s2b8 + 8))
												st64(a + 8, v)
												st32(a, 2)
												return w
											}
											st64(sa8, s1c0, s198, s1b0, s1b8, s108, s1a0, s1a8)
											w = fn_a4608(s48, sa8)
											st64(s458, ld64(s48 + 8))
											v = ld64(s48)
											if (v == 2) {
												const position_bundle_token_account: AccountInfo = ld64(ld64(s458))
												if (position_bundle_token_account.is_writable == 0) {
													anchor_error_from(s348, 0x7d0 /* anchor::ConstraintMut */)
													w = Error_with_account_name(s358, ld64(s348), ld64(s348 + 8), "position_bundle_token_account", 0x1d)
													v = ld64(s358)
													st64(a + 0x10, ld64(s358 + 8))
													st64(a + 8, v)
													st32(a, 2)
													return w
												}
												st64(s460, s48)
												AccountInfo_clone(s48, position_bundle_token_account)
												st64(s470, fn_143100(ld64(s460)))
												const cc = ld64(ld64(s458))
												st64(s460, sa8)
												AccountInfo_clone(sa8, cc)
												AccountInfo_try_data_len(s18, ld64(s460))
												const ce = ld64(s18 + 8)
												const cd = ld64(s18)
												if (cd != 0x800000000000001a /* Ok */) {
													st64(s18 + 0x10, ld64(s18 + 0x10))
													st64(s18, cd, ce)
													w = fn_13b430(s2c8, s18)
													const cs = ld64(s2c8)
													st64(a + 0x10, ld64(s2c8 + 8))
													st64(a + 8, cs)
													st32(a, 2)
													const cu = ld64(sa0 + 8)
													const ct = ld64(sa0)
													rc_dec(ct)
													rc_dec(cu)
													bg = ld64(s48 + 0x10)
													const cv = ld64(s48 + 8)
													rc_dec(cv)
													if (!rc_release(bg)) {
														return w
													}
													st64(bg + 8, ld64(bg + 8) - 1)
													return w
												}
												const ch = fn_14f7f8(cg, __floatundidf((ce + 0x80) * cf))
												st64(s460, fn_151cb0(ch, 0))
												const ci = fn_14f3e8(ch)
												const cj = 0 > (ld64(s460) as i64) ? 0 : ci
												const cq = (fn_151a40(ch, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : cj
												const cl = ld64(sa0 + 8)
												const ck = ld64(sa0)
												rc_dec(ck)
												rc_dec(cl)
												const co = ld64(s48 + 0x10)
												const cm = ld64(s48 + 8)
												let cn = ld64(cm) - 1
												st64(cm, cn)
												if (cn == 0) {
													cn = ld64(cm + 8) - 1
													st64(cm + 8, cn)
												}
												let cp = ld64(co) - 1
												st64(co, cp)
												if (cp == 0) {
													cp = ld64(co + 8) - 1
													st64(co + 8, cp)
												}
												if (cq > ld64(s470)) {
													anchor_error_from(s328, 0x7d5 /* anchor::ConstraintRentExempt */, cp, cn)
													w = Error_with_account_name(s338, ld64(s328), ld64(s328 + 8), "position_bundle_token_account", 0x1d)
													v = ld64(s338)
													st64(a + 0x10, ld64(s338 + 8))
													st64(a + 8, v)
													st32(a, 2)
													return w
												}
												const funder: AccountInfo = ld64(s1b0)
												if (funder.is_writable != 0) {
													const cx = ld64(s1a8)
													const cy = ld64(cx)
													copy(s48, cy, 0x20)
													if ((memcmp(s48, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
														anchor_error_from(s2d8, 0x7dc /* anchor::ConstraintAddress */)
														const dd = Error_with_account_name(s2e8, ld64(s2d8), ld64(s2d8 + 8), "token_program", 0xd)
														const dc = ld64(s2e8 + 8)
														const db = ld64(s2e8)
														copyr(sa8, s48, 0x20)
														st64(s88, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
														w = fn_13b5c0(s2f8, db, dc, sa8, dd)
														v = ld64(s2f8)
														st64(a + 0x10, ld64(s2f8 + 8))
														st64(a + 8, v)
														st32(a, 2)
														return w
													}
													w = memcpy(a, s108, 0x60)
													const da = ld64(s198)
													const cz = ld64(s1a0)
													st64(a + 0x70, ld64(s1b8))
													st64(a + 0x60, ld64(s468))
													st64(a + 0x68, ld64(s458))
													st64(a + 0x78, funder, cx, cz, q)
													copy(a + 0x98, s448, 0x10)
													st64(a + 0xa8, ld64(s450))
													st64(a + 0xb0, da)
													return w
												}
												anchor_error_from(s308, 0x7d0 /* anchor::ConstraintMut */, cp, cn)
												w = Error_with_account_name(s318, ld64(s308), ld64(s308 + 8), "funder", 6)
												v = ld64(s318)
												st64(a + 0x10, ld64(s318 + 8))
												st64(a + 8, v)
												st32(a, 2)
												return w
											}
											st64(a + 0x10, ld64(s458))
											st64(a + 8, v)
											st32(a, 2)
											return w
										}
										st64(a + 0x10, am)
										st64(a + 8, v)
										st32(a, 2)
										return w
									}
									anchor_error_from(s258, 0x7d6 /* anchor::ConstraintSeeds */)
									Error_with_account_name(s268, ld64(s258), ld64(s258 + 8), "position_bundle", 0xf)
									const al = ld64(s268 + 8)
									const ak = ld64(s268)
									const af = ld64(ld64(s1d0))
									const aj = ld64(af + 0x18)
									const ai = ld64(af + 0x10)
									const ah = ld64(af + 8)
									const ag = ld64(af)
									copy(s88, s160, 0x20)
									st64(sa8, ag, ah, ai, aj)
									w = fn_13b5c0(s278, ak, al, sa8, ah)
									v = ld64(s278)
									st64(a + 0x10, ld64(s278 + 8))
									st64(a + 8, v)
									st32(a, 2)
									return w
								}
								w = fn_13b430(s248, s178)
								v = ld64(s248)
								st64(a + 0x10, ld64(s248 + 8))
								st64(a + 8, v)
								st32(a, 2)
								return w
							}
							w = Error_with_account_name(s238, t, u, "associated_token_program", 0x18)
							v = ld64(s238)
							st64(a + 0x10, ld64(s238 + 8))
							st64(a + 8, v)
							st32(a, 2)
							return w
						}
						w = Error_with_account_name(s228, o, p, "system_program", 0xe)
						v = ld64(s228)
						st64(a + 0x10, ld64(s228 + 8))
						st64(a + 8, v)
						st32(a, 2)
						return w
					}
					w = Error_with_account_name(s218, m, n, "token_program", 0xd)
					v = ld64(s218)
					st64(a + 0x10, ld64(s218 + 8))
					st64(a + 8, v)
					st32(a, 2)
					return w
				}
				w = Error_with_account_name(s208, k, l, "funder", 6)
				v = ld64(s208)
				st64(a + 0x10, ld64(s208 + 8))
				st64(a + 8, v)
				st32(a, 2)
				return w
			}
			w = anchor_error_from(s418, 0xbbd /* anchor::AccountNotEnoughKeys */, c, g + 0x60, f - 2)
			v = ld64(s418)
			st64(a + 0x10, ld64(s418 + 8))
			st64(a + 8, v)
			st32(a, 2)
			return w
		}
		w = anchor_error_from(s428, 0xbbd /* anchor::AccountNotEnoughKeys */, c, g + 0x30, f - 1)
		v = ld64(s428)
		st64(a + 0x10, ld64(s428 + 8))
		st64(a + 8, v)
		st32(a, 2)
		return w
	}
	w = anchor_error_from(s438, 0xbbd /* anchor::AccountNotEnoughKeys */, c, d, e)
	v = ld64(s438)
	st64(a + 0x10, ld64(s438 + 8))
	st64(a + 8, v)
	st32(a, 2)
	return w
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_bundle
export function fn_a1098(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s88 = fp - 0x88, s89 = fp - 0x89, sb0 = fp - 0xb0, sc0 = fp - 0xc0, se8 = fp - 0xe8, s128 = fp - 0x128, s148 = fp - 0x148, s168 = fp - 0x168, s180 = fp - 0x180, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s200 = fp - 0x200, s218 = fp - 0x218, s220 = fp - 0x220, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s300 = fp - 0x300, s308 = fp - 0x308, s338 = fp - 0x338, s340 = fp - 0x340, s348 = fp - 0x348, s350 = fp - 0x350
	let aw, dc, dd, de: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s2b8, f, b)
	if (g != 0) {
		const p = ld64(ld64(b + 0x10))
		st64(s300 + 0x30, p)
		const q = ld64(p)
		copyr(s38, q + 8, 0x18)
		st64(s300 + 0x38, q)
		st64(s40, ld64(q))
		const r = ld64(f)
		copyr(s238, r, 0x20)
		if ((memcmp(s40, s238, 0x20) as u32) == 0) {
			ErrorCode_name(s180, 0x100152d40)
			st64(sb0, 0, 1, 0)
			st64(s20, sb0, 0x100159480)
			st8(s20 + 0x18, 3)
			st64(s20 + 0x10, 0x20)
			st64(s38 + 8, 0)
			st64(s40, 0)
			if (ErrorCode_fmt(0x100152d40, s40) == 0) {
				copyr(s200, sb0, 0x18)
				copy(s218, s180, 0x18)
				st64(s238 + 8, 0x100154924)
				st32(s1b8 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s1e8, 2)
				st32(s220, 7)
				st64(s238 + 0x10, 0x41)
				st64(s238, 0)
				const ba = fn_13b3a8(s278, s238)
				const az = ld64(s278 + 8)
				const ay = ld64(s278)
				const ax = ld64(s300 + 0x38)
				copyr(s238, ax, 0x20)
				copy(s218, r, 0x20)
				de = fn_13b5c0(s288, ay, az, s238, ba)
				const bb = ld64(s288)
				st64(a + 8, ld64(s288 + 8))
				st64(a, bb)
				return de
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s238, 0x1001594b0, 0x1001594d0)
		}
		st64(s300 + 0x28, r)
		st64(s300 + 0x40, a)
		const s = ld64(b + 8)
		const t = __floatundidf(ld64(s) * 0x108)
		const u = fn_14f7f8(ld64(s + 8), t)
		const v = fn_151cb0(u, 0)
		const w = fn_14f3e8(u)
		const x = max((fn_151a40(u, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (v as i64) ? 0 : w, 1)
		let bd: AccountInfo = ld64(s2b8)
		let bj = ld64(s2b8 + 8)
		if (x > g) {
			const y: AccountInfo = ld64(s300 + 0x30)
			const z: LamportsCell = y.lamports
			rc_inc(z)
			const bc: DataCell = y.data
			rc_inc(bc)
			const be: LamportsCell = bd.lamports
			const bf = be.strong
			st64(s300 + 8, bd.key)
			st64(s300 + 0x10, y.executable)
			st64(s300 + 0x18, y.is_writable)
			st64(s300 + 0x20, y.is_signer)
			st64(s300 + 0x28, y.rent_epoch)
			const bi = y.owner
			rc_inc(be, bf)
			const bg: DataCell = bd.data
			const bh = bg.strong
			st64(s300 + 0x30, bi)
			rc_inc(bg, bh)
			const bk: AccountInfo = ld64(ld64(bj + 0x18))
			const bl: LamportsCell = bk.lamports
			const bm = bl.strong
			st64(s300, sat_sub(x, g))
			st64(s338 + 0x10, bd.executable)
			st64(s338 + 0x18, bd.is_writable)
			st64(s338 + 0x20, bd.is_signer)
			st64(s338 + 0x28, bd.rent_epoch)
			st64(s308, bd.owner)
			const bp = bk.key
			rc_inc(bl, bm)
			const bn: DataCell = bk.data
			const bo = bn.strong
			st64(s338, z, bp)
			rc_inc(bn, bo)
			st64(s340, bk.owner)
			const bt = bk.rent_epoch
			const bs = bk.is_signer
			const br = bk.is_writable
			const bq = bk.executable
			st8(se8 + 0x22, ld64(s338 + 0x10))
			st8(se8 + 0x21, ld64(s338 + 0x18))
			st8(se8 + 0x20, ld64(s338 + 0x20))
			st64(se8 + 0x18, ld64(s338 + 0x28))
			st64(se8 + 0x10, ld64(s308))
			st64(se8, be, bg)
			st64(s128 + 0x38, ld64(s300 + 8))
			st8(s128 + 0x32, ld64(s300 + 0x10))
			st8(s128 + 0x31, ld64(s300 + 0x18))
			st8(s128 + 0x30, ld64(s300 + 0x20))
			st64(s128 + 0x28, ld64(s300 + 0x28))
			st64(s128 + 0x20, ld64(s300 + 0x30))
			st64(s128 + 0x18, bc)
			st64(s128 + 0x10, ld64(s338))
			st64(s128 + 8, ld64(s300 + 0x38))
			st8(s128, bs, br, bq)
			st64(s148 + 0x18, bt)
			st64(s148 + 0x10, ld64(s340))
			st64(s148, bl, bn)
			st64(s168 + 0x18, ld64(s338 + 8))
			st64(sc0, 8, 0)
			st64(s168, 0, 8, 0)
			de = fn_13d318(s248, s168, ld64(s300))
			aw = ld64(s248)
			if (aw != 2) {
				dd = ld64(s248 + 8)
				dc = ld64(s300 + 0x40)
				st64(dc, aw, dd)
				return de
			}
			bd = ld64(s2b8)
			st64(s300 + 0x28, bd.key)
			bj = ld64(s2b8 + 8)
		}
		const bu: LamportsCell = bd.lamports
		rc_inc(bu)
		const bv: DataCell = bd.data
		rc_inc(bv)
		const bw: AccountInfo = ld64(ld64(bj + 0x18))
		const bx: LamportsCell = bw.lamports
		const by = bx.strong
		st64(s300 + 0x20, bd.executable)
		st64(s300 + 0x30, bd.is_writable)
		st64(s300 + 0x38, bd.is_signer)
		const cc = bd.rent_epoch
		const cd = bd.owner
		const cb = bw.key
		rc_inc(bx, by)
		const bz: DataCell = bw.data
		const ca = bz.strong
		st64(s308, cb, cc, cd, bv, bu)
		rc_inc(bz, ca)
		st64(s338 + 0x28, bw.owner)
		st64(s338 + 0x20, bw.rent_epoch)
		const ci = bw.is_signer
		const ch = bw.is_writable
		const cg = bw.executable
		const ce = ld64(s2b8 + 8)
		const cf = ld64(ld64(ce + 0x20))
		copyr(sb0, cf, 0x20)
		const cj = ld8(ld64(ce + 0x28))
		st64(s20, s89)
		st64(s38 + 8, sb0)
		st64(s40, 0x100152e73)
		st64(s180, s40)
		st64(s1c8 + 8, s180)
		st8(s1c8, ci, ch, cg)
		st64(s1e8 + 0x18, ld64(s338 + 0x20))
		st64(s1e8 + 0x10, ld64(s338 + 0x28))
		st64(s1e8, bx, bz)
		st64(s1f8 + 8, ld64(s308))
		st8(s1f8 + 2, ld64(s300 + 0x20))
		st8(s1f8 + 1, ld64(s300 + 0x30))
		st8(s1f8, ld64(s300 + 0x38))
		st64(s200, ld64(s300))
		st64(s218 + 0x10, ld64(s300 + 8))
		st64(s218 + 8, ld64(s300 + 0x10))
		st64(s218, ld64(s300 + 0x18))
		st64(s220, ld64(s300 + 0x28))
		st64(s300 + 0x38, cj)
		st8(s89, cj)
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 0xf)
		st64(s180 + 8, 3)
		st64(s1b8, 1)
		st64(s238, 0, 8, 0)
		de = fn_13c8b8(s258, s238, 0x88)
		aw = ld64(s258)
		if (aw != 2) {
			dd = ld64(s258 + 8)
			dc = ld64(s300 + 0x40)
			st64(dc, aw, dd)
			return de
		}
		const ck: AccountInfo = ld64(s2b8)
		const cl: LamportsCell = ck.lamports
		const cs = ck.key
		rc_inc(cl)
		const cm: DataCell = ck.data
		rc_inc(cm)
		const cn: LamportsCell = bw.lamports
		const co = cn.strong
		st64(s300 + 0x10, bw.key)
		st64(s300 + 0x18, ck.executable)
		st64(s300 + 0x20, ck.is_writable)
		st64(s300 + 0x28, ck.is_signer)
		st64(s300 + 0x30, ck.rent_epoch)
		const cr = ck.owner
		rc_inc(cn, co)
		const cp: DataCell = bw.data
		const cq = cp.strong
		st64(s308, cr, cs, cl)
		rc_inc(cp, cq)
		const cx = bw.owner
		const cw = bw.rent_epoch
		const cv = bw.is_signer
		const cu = bw.is_writable
		const ct = bw.executable
		copyr(sb0, cf, 0x20)
		st64(s20, s89)
		st64(s38 + 8, sb0)
		st64(s40, 0x100152e73)
		st64(s180, s40)
		st64(s1c8 + 8, s180)
		st8(s1c8, cv, cu, ct)
		st64(s1e8, cn, cp, cx, cw)
		st64(s1f8 + 8, ld64(s300 + 0x10))
		st8(s1f8 + 2, ld64(s300 + 0x18))
		st8(s1f8 + 1, ld64(s300 + 0x20))
		st8(s1f8, ld64(s300 + 0x28))
		st64(s200, ld64(s300 + 0x30))
		st64(s218 + 0x10, ld64(s308))
		st64(s218 + 8, cm)
		copyr(s220, s300, 0x10)
		st8(s89, ld64(s300 + 0x38))
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 0xf)
		st64(s180 + 8, 3)
		st64(s1b8, 1)
		st64(s238, 0, 8, 0)
		de = fn_13cc48(s268, s238, ld64(ld64(ld64(s2b8 + 8) + 0x30)))
		aw = ld64(s268)
		if (aw != 2) {
			dd = ld64(s268 + 8)
			dc = ld64(s300 + 0x40)
			st64(dc, aw, dd)
			return de
		}
	} else {
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0x108)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const ad = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		const m = ld64(s2b8 + 8)
		const n: AccountInfo = ld64(ld64(m + 0x10))
		const o: LamportsCell = n.lamports
		const aa = n.key
		const ae = ld64(s2b8)
		rc_inc(o)
		st64(s300 + 0x38, aa)
		const ab: DataCell = n.data
		const ac = ab.strong
		st64(s300 + 0x30, ab)
		rc_inc(ab, ac)
		const af = ld64(ae + 8)
		const ag = ld64(af)
		st64(s300, ld64(ae))
		st64(s300 + 8, n.executable)
		st64(s300 + 0x10, n.is_writable)
		st64(s300 + 0x18, n.is_signer)
		st64(s300 + 0x20, n.rent_epoch)
		st64(s300 + 0x28, n.owner)
		rc_inc(af, ag)
		const ah = ld64(ae + 0x10)
		rc_inc(ah)
		const ai: AccountInfo = ld64(ld64(m + 0x18))
		const aj: LamportsCell = ai.lamports
		const ak = aj.strong
		st64(s308, o)
		const al: AccountInfo = ld64(s2b8)
		st64(s338 + 8, al.executable)
		st64(s338 + 0x10, al.is_writable)
		st64(s338 + 0x18, al.is_signer)
		st64(s338 + 0x20, al.rent_epoch)
		st64(s338 + 0x28, al.owner)
		const ao = ai.key
		rc_inc(aj, ak)
		const am: DataCell = ai.data
		const an = am.strong
		st64(s340, ao, ad)
		st64(s300 + 0x40, a)
		rc_inc(am, an)
		st64(s348, ai.owner)
		st64(s350, ai.rent_epoch)
		const av = ai.is_signer
		const au = ai.is_writable
		const at = ai.executable
		const ap = ld64(s2b8 + 8)
		const aq = ld64(ld64(ap + 0x20))
		copyr(sb0, aq, 0x20)
		const ar = ld8(ld64(ap + 0x28))
		st64(s20, s89)
		st64(s38 + 8, sb0)
		st64(s40, 0x100152e73)
		st8(s89, ar)
		st64(s180, s40)
		st64(s1b8 + 0x28, s180)
		st8(s1b8 + 0x22, ld64(s338 + 8))
		st8(s1b8 + 0x21, ld64(s338 + 0x10))
		st8(s1b8 + 0x20, ld64(s338 + 0x18))
		st64(s1b8 + 0x18, ld64(s338 + 0x20))
		st64(s1b8 + 0x10, ld64(s338 + 0x28))
		st64(s1b8, af, ah)
		st64(s1c8 + 8, ld64(s300))
		st8(s1c8 + 2, ld64(s300 + 8))
		st8(s1c8 + 1, ld64(s300 + 0x10))
		st8(s1c8, ld64(s300 + 0x18))
		st64(s1e8 + 0x18, ld64(s300 + 0x20))
		st64(s1e8 + 0x10, ld64(s300 + 0x28))
		st64(s1e8 + 8, ld64(s300 + 0x30))
		st64(s1e8, ld64(s308))
		st64(s1f8 + 8, ld64(s300 + 0x38))
		st8(s1f8, av, au, at)
		st64(s200, ld64(s350))
		st64(s218 + 0x10, ld64(s348))
		st64(s218, aj, am)
		st64(s220, ld64(s340))
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 0xf)
		st64(s180 + 8, 3)
		st64(s1b8 + 0x30, 1)
		st64(s238, 0, 8, 0)
		de = fn_13cfd8(s298, s238, ld64(s338), 0x88, ld64(ld64(ap + 0x30)))
		aw = ld64(s298)
		if (aw != 2) {
			dd = ld64(s298 + 8)
			dc = ld64(s300 + 0x40)
			st64(dc, aw, dd)
			return de
		}
	}
	const da = ld64(s300 + 0x40)
	fn_3240(s88, ld64(s2b8))
	if (ld64(s88) == 0) {
		de = Error_with_account_name(s2a8, ld64(s88 + 8), ld64(s88 + 0x10), "position_bundle", 0xf)
		const db = ld64(s2a8)
		st64(da + 8, ld64(s2a8 + 8))
		st64(da, db)
		return de
	}
	const cy = ld64(0x300000000 /* heap bump-allocator cursor */)
	const cz = cy != 0 ? sat_sub(cy, 0x48) & -8 : 0x300007fb8
	if (cz > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, cz)
		de = memcpy(cz, s88, 0x48)
		st64(da + 8, cz)
		st64(da, 2)
		return de
	}
	alloc_handle_alloc_error(8, 0x48)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_bundle_mint
export function fn_a2b38(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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
				st64(s260, 0x100154924)
				st32(s1d8 + 8, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s218, 2)
				st32(s260 + 0x10, 7)
				st64(s260 + 8, 0x41)
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
			dv = Error_with_account_name(s2e8, ld64(s260), ld64(s260 + 8), "position_bundle_mint", 0x14)
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

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_bundle, position_bundle_mint, position_bundle_token_account
export function fn_a5308(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78
	let n, p: u64
	fn_7f28(s28, ld64(b + 0x60), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const f = ld64(s28)
	if (f != 2) {
		n = Error_with_account_name(s38, f, ld64(s28 + 8), "position_bundle", 0xf)
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
					n = Error_with_account_name(s58, l, ld64(s48 + 8), "position_bundle_mint", 0x14)
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
	const q = ld64(ld64(b + 0x68))
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
		n = Error_with_account_name(s78, t, ld64(s68 + 8), "position_bundle_token_account", 0x1d)
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
