/// <reference path="../lib.d.ts" />
// instruction idl_create_account
import { anchor_error_from, fn_11e480, fn_13e628, fn_1476d8, fn_14ed60, fn_154730, memcpy } from '../shared.ts'

// instruction handler: idl_create_account (discriminator sha256("global:idl_create_account")[..8] = 0x486e624882bf9020)
export function ix_idl_create_account(a: u64, b: u64, c: u64, d: u64): u64 {
	const s24 = fp - 0x24, s30 = fp - 0x30, s38 = fp - 0x38, s48 = fp - 0x48, s50 = fp - 0x50, s78 = fp - 0x78, s80 = fp - 0x80, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sd8 = fp - 0xd8, se0 = fp - 0xe0, sf0 = fp - 0xf0, sff = fp - 0xff, s100 = fp - 0x100, s108 = fp - 0x108, s118 = fp - 0x118, s120 = fp - 0x120, s170 = fp - 0x170, s171 = fp - 0x171, s188 = fp - 0x188, s1a0 = fp - 0x1a0, s1b8 = fp - 0x1b8, s1d0 = fp - 0x1d0, s1d8 = fp - 0x1d8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s1000 = fp - 0x1000
	let i, j, k: u64
	sol_log("Instruction: IdlCreateAccount", 0x1d)
	const f = ld64(c + 0x98)
	if ((memcmp(b, f, 0x20) as u32) != 0) {
		k = anchor_error_from(s208, 0x3e9 /* anchor::IdlInstructionInvalidProgram */)
		j = ld64(s208)
		st64(a + 8, ld64(s208 + 8))
		st64(a, j)
		return k
	}
	const bg = ld64(c + 8)
	Pubkey_find_program_address(s108, 8, 0, b)
	copyr(s1f8, s108, 0x20)
	let bf = ld8(sf0 + 8)
	Pubkey_create_with_seed(s108, s1f8, "anchor:idl", 0xa, f)
	if (ld8(s108) != 0) {
		st8(s170, ld8(s108 + 1))
		fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s170, 0x100160228, 0x100160bd8)
	}
	let g = d + 0x2c
	copyr(s1d0, sff, 0x18)
	const h = ld64(s108 + 1)
	st64(s1d8, h)
	if (d > g) {
		fn_154730(0x100160bd8, h)
	}
	rent_get(s108)
	if (ld64(s108) != 0) {
		copyr(s1a0, s100, 0x18)
		k = fn_13e628(s258, s1a0)
		j = ld64(s258)
		st64(a + 8, ld64(s258 + 8))
		st64(a, j)
		return k
	}
	const l = ld64(s100)
	st64(s1a0, l)
	st64(s1b8, l)
	const m = ld64(sff + 7)
	st64(s1a0 + 8, m)
	st64(s1b8 + 8, m)
	const n = ld64(sf0)
	st64(s1a0 + 0x10, n)
	st64(s1b8 + 0x10, n)
	g = min(g, 0x2710)
	const o = fn_1476d8(s1b8, g)
	st64(s188, s171)
	st8(s171, bf)
	st64(s188 + 8, 1)
	st64(s1000, 0x10015b68d, 0xa, o, g, f)
	fn_146f68(s170, bg, s1d8, s1f8, "anchor:idl", 0xa, o, g, f)
	const p = ld64(c + 0x10)
	rc_inc(p)
	const q = ld64(c + 0x18)
	rc_inc(q)
	const r = ld64(c + 0x40)
	const bd = ld64(c + 0x38)
	const be = ld8(c + 0x32)
	const u = ld8(c + 0x31)
	const w = ld8(c + 0x30)
	const x = ld64(c + 0x28)
	const y = ld64(c + 0x20)
	rc_inc(r)
	const s = ld64(c + 0x48)
	bf = s
	rc_inc(s)
	const t = ld64(c + 0x70)
	const ax = ld64(c + 0x68)
	const ay = ld8(c + 0x62)
	const az = ld8(c + 0x61)
	const ba = ld8(c + 0x60)
	const bb = ld64(c + 0x58)
	const bc = ld64(c + 0x50)
	rc_inc(t)
	const v = ld64(c + 0x78)
	rc_inc(v)
	const z: AccountInfo = ld64(c)
	const aa: LamportsCell = z.lamports
	const ar = ld8(c + 0x92)
	const at = ld8(c + 0x91)
	const au = ld8(c + 0x90)
	const av = ld64(c + 0x88)
	const aw = ld64(c + 0x80)
	const ag = z.key
	rc_inc(aa)
	const ab: DataCell = z.data
	rc_inc(ab)
	const af = z.owner
	const ae = z.rent_epoch
	const ad = z.is_signer
	const ac = z.is_writable
	st8(s50 + 2, z.executable)
	st8(s50, ad, ac)
	st64(s78, ag, aa, ab, af, ae)
	st8(s80, au, at, ar)
	st64(sa8, ax, t, v, aw, av)
	st8(sb0, ba, az, ay)
	st64(sd8, bd, r, bf, bc, bb)
	st8(se0, w, u, be)
	st64(s108, bg, p, q, y, x)
	st64(s48, s188, 1)
	st64(s1000, s48, 1)
	// CPI SYSTEM_PROGRAM.CreateAccountWithSeed { funder: *bg (w,s), new_account: ? (w), base: ? (s), base: ? }, signer seeds [? (1 bytes)] [exec]
	const ai = invoke_signed(s120, s170, s108, 4, fp)
	const ah = ld64(s120)
	if (ah == 0x800000000000001a /* Ok */) {
		AccountInfo_try_borrow_data(s108, c + 0x38, ptr_drop_in_place_fd78(s108, ai))
		const am = ld64(sff + 7)
		const ak = ld64(s100)
		const aj = ld64(s108)
		if (aj == 0x800000000000001a /* Ok */) {
			const al = ld64(ak)
			st64(s118, ld64(ak + 8))
			st64(s120, al)
			k = fn_125528(s108, s120)
			if (ld32(s108) != 0) {
				i = ld64(sff + 7)
				j = ld64(s100)
				st64(am, ld64(am) - 1)
				st64(a + 8, i)
				st64(a, j)
				return k
			}
			copy(s24, sf0, 0x10)
			st64(am, ld64(am) - 1)
			const ao = ld64(c + 8)
			copyr(s38, ao, 0x20)
			const ap = ld64(c + 0x48)
			if (ld64(ap + 0x10) == 0) {
				st64(ap + 0x10, -1)
				const aq = ld64(ap + 0x18)
				st64(s100, ld64(ap + 0x20))
				st64(s108, aq)
				st64(sff + 7, 0)
				k = fn_124d38(s248, s38, s108)
				i = ld64(s248 + 8)
				j = ld64(s248)
				st64(ap + 0x10, ld64(ap + 0x10) + 1)
				st64(a + 8, i)
				st64(a, j != 2 ? j : 2)
				return k
			}
			st64(sff + 7, ap + 0x10)
			st64(s108, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			k = fn_13e628(s238, s108)
			j = ld64(s238)
			st64(a + 8, ld64(s238 + 8))
			st64(a, j)
			return k
		}
		st64(s108, aj, ak, am)
		k = fn_13e628(s228, s108)
		j = ld64(s228)
		st64(a + 8, ld64(s228 + 8))
		st64(a, j)
		return k
	}
	copyr(s30, s118, 0x10)
	st64(s38, ah)
	const an = fn_13e628(s218, s38)
	i = ld64(s218 + 8)
	j = ld64(s218)
	k = ptr_drop_in_place_fd78(s108, an)
	st64(a + 8, i)
	st64(a, j)
	return k
}

export function fn_146f68(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64) {
	const s20 = fp - 0x20, s68 = fp - 0x68, s80 = fp - 0x80
	const f = __rust_alloc(0x66 /* anchor::InstructionDidNotDeserialize */, 1)
	if (f == 0) {
		alloc_handle_alloc_error(1, 0x66 /* anchor::InstructionDidNotDeserialize */)
	}
	const h = p9
	const j = p8
	const k = p7
	const g = p6
	const i = p5
	st64(f + 0x18, ld64(b + 0x18))
	st64(f + 0x10, ld64(b + 0x10))
	st64(f + 8, ld64(b + 8))
	st64(f, ld64(b))
	st16(f + 0x20, 0x101)
	copy(f + 0x22, c, 0x20)
	st16(f + 0x42, 0x100)
	copy(f + 0x44, d, 0x20)
	st16(f + 0x64, 1)
	st64(s80, 3, f, 3)
	if (0 > (g as i64)) {
		raw_vec_handle_error(0, g, 0x100161d70, j, k)
	}
	let m = 1
	if (g != 0) {
		const l = __rust_alloc(g, 1)
		m = l
		if (l == 0) {
			raw_vec_handle_error(1, g, 0x100161d70, j, k)
		}
	}
	memcpy(m, i, g)
	const q = ld64(d + 0x18)
	const p = ld64(d + 0x10)
	const o = ld64(d + 8)
	const n = ld64(d)
	st64(s68, g, m, g, n, o, p, q, k, j)
	copyr(s20, h, 0x20)
	const r = fn_1442d0(a, 0x100159560, s68, s80, j)
	if (g != 0) {
		fn_11e480(r)
	}
}

export function fn_1442d0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s38 = fp - 0x38, s40 = fp - 0x40
	let f, g, h, i, j, k, l, n, o, p, q, ac, ae: u64
	B20: {
		B18: {
			B16: {
				st64(s28, a, s1)
				f = ld64(c) ^ 0x8000000000000000
				f = 0xd > f ? f : 3
				h = 0xc
				st64(s38, b, d)
				if ((f as i64) > 5) {
					if ((f as i64) > 8) {
						if ((f as i64) > 0xa) {
							if (f == 0xb) {
								p = c
								c = ld64(c + 0x18)
								g = c + 0x14
								b = c > g
								if (b != 1) {
									break B16
								}
								fn_154730(0x100161e80, b, c, d, e)
							}
							p = c
							h = 4
							break B18
						}
						if (f == 9) {
							p = c
							st64(s20 + 8, 4)
							__serialize(s20, b, c, d, e)
							d = undef
							e = undef
							c = ld64(s20 + 8)
							const ab = c
							b = c > c + 8
							if (b != 1) {
								b = ab + 8 + ld64(p + 0x18)
								c = ab + 8 > b
								if (c != 1) {
									g = b + 8
									c = b > g
									if (c != 1) {
										break B16
									}
									fn_154730(0x100161e80, b, c, d, e)
								}
								fn_154730(0x100161e80, b, c, d, e)
							}
							fn_154730(0x100161e80, b, c, d, e)
						}
						p = c
						st64(s20 + 8, 4)
						__serialize(s20, b, c, d, e)
						d = undef
						e = undef
						c = ld64(s20 + 8)
						b = c + 8
						if (b >= c) {
							g = b + ld64(p + 0x18)
							c = b > g
							if (c != 1) {
								break B16
							}
							fn_154730(0x100161e80, b, c, d, e)
						}
						fn_154730(0x100161e80, b, c, d, e)
					}
					if (f == 6) {
						p = c
					} else {
						p = c
						if (f != 7) {
							break B18
						}
					}
				} else {
					if ((f as i64) > 2) {
						p = c
						if (f == 3) {
							st64(s20 + 8, 4)
							__serialize(s20, b, c, d, e)
							d = undef
							e = undef
							c = ld64(s20 + 8)
							const aa = c
							b = c > c + 8
							if (b != 1) {
								b = aa + 8 + ld64(p + 0x10)
								c = aa + 8 > b
								if (c != 1) {
									c = b + 8
									if (c >= b) {
										g = c + 8
										b = c > g
										if (b != 1) {
											break B16
										}
										fn_154730(0x100161e80, b, c, d, e)
									}
									fn_154730(0x100161e80, b, c, d, e)
								}
								fn_154730(0x100161e80, b, c, d, e)
							}
							fn_154730(0x100161e80, b, c, d, e)
						}
						h = f != 4 ? 0xc : 4
						break B18
					}
					p = c
					g = 0x14
					if (f == 0) {
						break B16
					}
					if (f != 1) {
						break B18
					}
				}
				g = 4
			}
			st64(s20 + 8, g)
			__serialize(s20, b, c, d, e)
			h = ld64(s20 + 8)
			if (0 > (h as i64)) {
				raw_vec_handle_error(0, h, 0x100161e98, j, k)
			}
			i = 1
			l = 0
			if (h == 0) {
				break B20
			}
		}
		i = __rust_alloc(h, 1)
		l = h
		if (i == 0) {
			raw_vec_handle_error(1, h, 0x100161e98, j, k)
		}
	}
	B144: {
		B143: {
			B28: {
				st64(s20, l, i, 0)
				if ((f as i64) > 5) {
					if ((f as i64) > 8) {
						const s = p
						if ((f as i64) > 0xa) {
							if (f == 0xb) {
								let bu = 0
								if (3 >= l) {
									reserve_do_reserve_and_handle_146840(s20, 0, 4, 1, 1)
									i = ld64(s20 + 8)
									bu = ld64(s20 + 0x10)
								}
								st32(i + bu, 0xb)
								let bv = bu + 4
								st64(s20 + 0x10, bv)
								const bw = ld64(s + 0x20)
								if (7 >= ld64(s20) - bv) {
									reserve_do_reserve_and_handle_146840(s20, bv, 8, 1, 1)
									bv = ld64(s20 + 0x10)
								}
								st64(ld64(s20 + 8) + bv, bw)
								let bx = bv + 8
								st64(s20 + 0x10, bx)
								const bz = ld64(s + 0x18)
								const by = ld64(s + 0x10)
								if (7 >= ld64(s20) - bx) {
									reserve_do_reserve_and_handle_146840(s20, bx, 8, 1, 1)
									bx = ld64(s20 + 0x10)
								}
								st64(ld64(s20 + 8) + bx, bz)
								let ca = bx + 8
								st64(s20 + 0x10, ca)
								if (bz > ld64(s20) - ca) {
									reserve_do_reserve_and_handle_146840(s20, ca, bz, 1, 1)
									ca = ld64(s20 + 0x10)
								}
								n = memcpy(ld64(s20 + 8) + ca, by, bz)
								let cd = s + 0x28
								ae = ca + bz
								let cb = 0
								st64(s20 + 0x10, ae)
								while (true) {
									const cc = ld8(cd + cb)
									if (ld64(s20) == ae) {
										n = reserve_do_reserve_and_handle_146840(s20, ae, 1, 1, 1)
										cd = s + 0x28
										ae = ld64(s20 + 0x10)
									}
									cb = cb + 1
									st8(ld64(s20 + 8) + ae, cc)
									ae = ae + 1
									st64(s20 + 0x10, ae)
									if (cb == 0x20) {
										break B144
									}
								}
							}
							ac = 0
							if (3 >= l) {
								reserve_do_reserve_and_handle_146840(s20, 0, 4, 1, 1)
								i = ld64(s20 + 8)
								ac = ld64(s20 + 0x10)
							}
							n = i + ac
							st32(n, 0xc)
							break B143
						}
						if (f == 9) {
							let bm = 0
							let bk = 0
							if (3 >= l) {
								reserve_do_reserve_and_handle_146840(s20, 0, 4, 1, 1)
								i = ld64(s20 + 8)
								bk = ld64(s20 + 0x10)
							}
							st64(s40, s + 0x48)
							st32(i + bk, 9)
							let bl = bk + 4
							st64(s20 + 0x10, bl)
							while (true) {
								const bn = ld8(s + 0x20 + bm)
								if (ld64(s20) == bl) {
									reserve_do_reserve_and_handle_146840(s20, bl, 1, 1, 1)
									bl = ld64(s20 + 0x10)
								}
								bm = bm + 1
								st8(ld64(s20 + 8) + bl, bn)
								bl = bl + 1
								st64(s20 + 0x10, bl)
								if (bm == 0x20) {
									const ce = ld64(s + 0x18)
									const bo = ld64(s + 0x10)
									if (7 >= ld64(s20) - bl) {
										reserve_do_reserve_and_handle_146840(s20, bl, 8, 1, 1)
										bl = ld64(s20 + 0x10)
									}
									st64(ld64(s20 + 8) + bl, ce)
									let cf = bl + 8
									st64(s20 + 0x10, cf)
									const ck = ld64(s40)
									if (ce > ld64(s20) - cf) {
										reserve_do_reserve_and_handle_146840(s20, cf, ce, 1, 1)
										cf = ld64(s20 + 0x10)
									}
									n = memcpy(ld64(s20 + 8) + cf, bo, ce)
									let cg = cf + ce
									st64(s20 + 0x10, cg)
									const ch = ld64(s + 0x40)
									if (7 >= ld64(s20) - cg) {
										n = reserve_do_reserve_and_handle_146840(s20, cg, 8, 1, 1)
										cg = ld64(s20 + 0x10)
									}
									st64(ld64(s20 + 8) + cg, ch)
									let ci = 0
									ae = cg + 8
									st64(s20 + 0x10, ae)
									while (true) {
										const cj = ld8(ck + ci)
										if (ld64(s20) == ae) {
											n = reserve_do_reserve_and_handle_146840(s20, ae, 1, 1, 1)
											ae = ld64(s20 + 0x10)
										}
										ci = ci + 1
										st8(ld64(s20 + 8) + ae, cj)
										ae = ae + 1
										st64(s20 + 0x10, ae)
										if (ci == 0x20) {
											break B144
										}
									}
								}
							}
						}
						let v = 0
						let t = 0
						if (3 >= l) {
							reserve_do_reserve_and_handle_146840(s20, 0, 4, 1, 1)
							i = ld64(s20 + 8)
							t = ld64(s20 + 0x10)
						}
						st64(s40, s + 0x40)
						st32(i + t, 0xa)
						let u = t + 4
						st64(s20 + 0x10, u)
						while (true) {
							const w = ld8(s + 0x20 + v)
							if (ld64(s20) == u) {
								reserve_do_reserve_and_handle_146840(s20, u, 1, 1, 1)
								u = ld64(s20 + 0x10)
							}
							v = v + 1
							st8(ld64(s20 + 8) + u, w)
							u = u + 1
							st64(s20 + 0x10, u)
							if (v == 0x20) {
								const bp = ld64(s + 0x18)
								const x = ld64(s + 0x10)
								if (7 >= ld64(s20) - u) {
									reserve_do_reserve_and_handle_146840(s20, u, 8, 1, 1)
									u = ld64(s20 + 0x10)
								}
								st64(ld64(s20 + 8) + u, bp)
								let bq = u + 8
								st64(s20 + 0x10, bq)
								const bt = ld64(s40)
								if (bp > ld64(s20) - bq) {
									reserve_do_reserve_and_handle_146840(s20, bq, bp, 1, 1)
									bq = ld64(s20 + 0x10)
								}
								n = memcpy(ld64(s20 + 8) + bq, x, bp)
								ae = bq + bp
								let br = 0
								st64(s20 + 0x10, ae)
								while (true) {
									const bs = ld8(bt + br)
									if (ld64(s20) == ae) {
										n = reserve_do_reserve_and_handle_146840(s20, ae, 1, 1, 1)
										ae = ld64(s20 + 0x10)
									}
									br = br + 1
									st8(ld64(s20 + 8) + ae, bs)
									ae = ae + 1
									st64(s20 + 0x10, ae)
									if (br == 0x20) {
										break B144
									}
								}
							}
						}
					}
					if (f == 6) {
						let af = 0
						let ad = 0
						if (3 >= l) {
							reserve_do_reserve_and_handle_146840(s20, 0, 4, 1, 1)
							i = ld64(s20 + 8)
							ad = ld64(s20 + 0x10)
						}
						const ah = p + 8
						n = i + ad
						st32(n, 6)
						ae = ad + 4
						st64(s20 + 0x10, ae)
						while (true) {
							const ag = ld8(ah + af)
							if (ld64(s20) == ae) {
								n = reserve_do_reserve_and_handle_146840(s20, ae, 1, 1, 1)
								ae = ld64(s20 + 0x10)
							}
							af = af + 1
							st8(ld64(s20 + 8) + ae, ag)
							ae = ae + 1
							st64(s20 + 0x10, ae)
							if (af == 0x20) {
								break B144
							}
						}
					}
					if (f == 7) {
						let bh = 0
						let bg = 0
						if (3 >= l) {
							reserve_do_reserve_and_handle_146840(s20, 0, 4, 1, 1)
							i = ld64(s20 + 8)
							bg = ld64(s20 + 0x10)
						}
						const bj = p + 8
						n = i + bg
						st32(n, 7)
						ae = bg + 4
						st64(s20 + 0x10, ae)
						while (true) {
							const bi = ld8(bj + bh)
							if (ld64(s20) == ae) {
								n = reserve_do_reserve_and_handle_146840(s20, ae, 1, 1, 1)
								ae = ld64(s20 + 0x10)
							}
							bh = bh + 1
							st8(ld64(s20 + 8) + ae, bi)
							ae = ae + 1
							st64(s20 + 0x10, ae)
							if (bh == 0x20) {
								break B144
							}
						}
					}
					let r = 0
					if (3 >= l) {
						reserve_do_reserve_and_handle_146840(s20, 0, 4, 1, 1)
						i = ld64(s20 + 8)
						r = ld64(s20 + 0x10)
					}
					n = i + r
					st32(n, 8)
					o = r + 4
					st64(s20 + 0x10, o)
					q = ld64(p + 8)
					if (ld64(s20) - o > 7) {
						break B28
					}
				} else if ((f as i64) > 2) {
					const y = p
					if (f == 3) {
						let at = 0
						let aq = 0
						if (3 >= l) {
							reserve_do_reserve_and_handle_146840(s20, 0, 4, 1, 1)
							i = ld64(s20 + 8)
							aq = ld64(s20 + 0x10)
						}
						st64(s40, y + 0x48)
						st32(i + aq, 3)
						let ar = aq + 4
						st64(s20 + 0x10, ar)
						while (true) {
							const au = ld8(y + 0x18 + at)
							if (ld64(s20) == ar) {
								reserve_do_reserve_and_handle_146840(s20, ar, 1, 1, 1)
								ar = ld64(s20 + 0x10)
							}
							at = at + 1
							st8(ld64(s20 + 8) + ar, au)
							ar = ar + 1
							st64(s20 + 0x10, ar)
							if (at == 0x20) {
								const aw = ld64(y + 0x10)
								const av = ld64(y + 8)
								if (7 >= ld64(s20) - ar) {
									reserve_do_reserve_and_handle_146840(s20, ar, 8, 1, 1)
									ar = ld64(s20 + 0x10)
								}
								st64(ld64(s20 + 8) + ar, aw)
								let ax = ar + 8
								st64(s20 + 0x10, ax)
								if (aw > ld64(s20) - ax) {
									reserve_do_reserve_and_handle_146840(s20, ax, aw, 1, 1)
									ax = ld64(s20 + 0x10)
								}
								n = memcpy(ld64(s20 + 8) + ax, av, aw)
								let ay = ax + aw
								st64(s20 + 0x10, ay)
								let az = y
								const ba = ld64(y + 0x38)
								if (7 >= ld64(s20) - ay) {
									n = reserve_do_reserve_and_handle_146840(s20, ay, 8, 1, 1)
									az = y
									ay = ld64(s20 + 0x10)
								}
								st64(ld64(s20 + 8) + ay, ba)
								let bb = ay + 8
								st64(s20 + 0x10, bb)
								const bc = ld64(az + 0x40)
								if (7 >= ld64(s20) - bb) {
									n = reserve_do_reserve_and_handle_146840(s20, bb, 8, 1, 1)
									bb = ld64(s20 + 0x10)
								}
								st64(ld64(s20 + 8) + bb, bc)
								let bd = 0
								ae = bb + 8
								st64(s20 + 0x10, ae)
								const bf = ld64(s40)
								while (true) {
									const be = ld8(bf + bd)
									if (ld64(s20) == ae) {
										n = reserve_do_reserve_and_handle_146840(s20, ae, 1, 1, 1)
										ae = ld64(s20 + 0x10)
									}
									bd = bd + 1
									st8(ld64(s20 + 8) + ae, be)
									ae = ae + 1
									st64(s20 + 0x10, ae)
									if (bd == 0x20) {
										break B144
									}
								}
							}
						}
					}
					if (f == 4) {
						ac = 0
						if (3 >= l) {
							reserve_do_reserve_and_handle_146840(s20, 0, 4, 1, 1)
							i = ld64(s20 + 8)
							ac = ld64(s20 + 0x10)
						}
						n = i + ac
						st32(n, 4)
						break B143
					}
					let z = 0
					q = ld64(y + 8)
					if (3 >= l) {
						reserve_do_reserve_and_handle_146840(s20, 0, 4, 1, 1)
						i = ld64(s20 + 8)
						z = ld64(s20 + 0x10)
					}
					n = i + z
					st32(n, 5)
					o = z + 4
					st64(s20 + 0x10, o)
					if (ld64(s20) - o > 7) {
						break B28
					}
				} else {
					if (f == 0) {
						let ai = 0
						if (3 >= l) {
							reserve_do_reserve_and_handle_146840(s20, 0, 4, 1, 1)
							i = ld64(s20 + 8)
							ai = ld64(s20 + 0x10)
						}
						n = i + ai
						st32(n, 0)
						let aj = ai + 4
						st64(s20 + 0x10, aj)
						const ak = ld64(p + 0x28)
						if (7 >= ld64(s20) - aj) {
							n = reserve_do_reserve_and_handle_146840(s20, aj, 8, 1, 1)
							aj = ld64(s20 + 0x10)
						}
						st64(ld64(s20 + 8) + aj, ak)
						let al = aj + 8
						st64(s20 + 0x10, al)
						const am = ld64(p + 0x30)
						if (7 >= ld64(s20) - al) {
							n = reserve_do_reserve_and_handle_146840(s20, al, 8, 1, 1)
							al = ld64(s20 + 0x10)
						}
						const ap = p + 8
						st64(ld64(s20 + 8) + al, am)
						let an = 0
						ae = al + 8
						st64(s20 + 0x10, ae)
						while (true) {
							const ao = ld8(ap + an)
							if (ld64(s20) == ae) {
								n = reserve_do_reserve_and_handle_146840(s20, ae, 1, 1, 1)
								ae = ld64(s20 + 0x10)
							}
							an = an + 1
							st8(ld64(s20 + 8) + ae, ao)
							ae = ae + 1
							st64(s20 + 0x10, ae)
							if (an == 0x20) {
								break B144
							}
						}
					}
					if (f == 1) {
						let cm = 0
						let cl = 0
						if (3 >= l) {
							reserve_do_reserve_and_handle_146840(s20, 0, 4, 1, 1)
							i = ld64(s20 + 8)
							cl = ld64(s20 + 0x10)
						}
						const co = p + 8
						n = i + cl
						st32(n, 1)
						ae = cl + 4
						st64(s20 + 0x10, ae)
						while (true) {
							const cn = ld8(co + cm)
							if (ld64(s20) == ae) {
								n = reserve_do_reserve_and_handle_146840(s20, ae, 1, 1, 1)
								ae = ld64(s20 + 0x10)
							}
							cm = cm + 1
							st8(ld64(s20 + 8) + ae, cn)
							ae = ae + 1
							st64(s20 + 0x10, ae)
							if (cm == 0x20) {
								break B144
							}
						}
					}
					let m = 0
					if (3 >= l) {
						reserve_do_reserve_and_handle_146840(s20, 0, 4, 1, 1)
						i = ld64(s20 + 8)
						m = ld64(s20 + 0x10)
					}
					n = i + m
					st32(n, 2)
					o = m + 4
					st64(s20 + 0x10, o)
					q = ld64(p + 8)
					if (ld64(s20) - o > 7) {
						break B28
					}
				}
				n = reserve_do_reserve_and_handle_146840(s20, o, 8, 1, 1)
				o = ld64(s20 + 0x10)
			}
			st64(ld64(s20 + 8) + o, q)
			ae = o + 8
			break B144
		}
		ae = ac + 4
	}
	const ct = ld64(s20 + 8)
	const cp = ld64(s20)
	if (cp == 0x8000000000000000) {
		st64(s20, ct)
		fn_14ed60(0x10015dabb /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s20, 0x100161d38, 0x100161d58)
	}
	const cq = ld64(s38)
	const cr = ld64(s28)
	st64(cr + 0x48, ld64(cq + 0x18))
	st64(cr + 0x40, ld64(cq + 0x10))
	st64(cr + 0x38, ld64(cq + 8))
	st64(cr + 0x30, ld64(cq))
	const cs = ld64(s38 + 8)
	copy(cr, cs, 0x18)
	st64(cr + 0x28, ae)
	st64(cr + 0x20, ct)
	st64(cr + 0x18, cp)
	return n
}
