/// <reference path="./lib.d.ts" />
// entrypoint, dispatcher and code outside instruction handlers
import { anchor_dispatch, fn_104598, fn_104ee8, fn_105168, fn_105ad8, fn_11b3b8, fn_12db08, fn_12dc70, fn_13fd08, fn_143100, fn_147e78, fn_1486f0, fn_1490e8, fn_149478, fn_1494c8, fn_1495b0, fn_149678, fn_14c4f0, fn_14c5c0, fn_14c690, fn_14e168, fn_14e1c0, fn_150f0, fn_501e0, fn_54ae0, fn_56670, fn_57158, fn_5fd40, fn_83078, fn_b6a0, memcpy } from './shared.ts'
import { fn_11b068 } from './ix/increase_liquidity_by_token_amounts_v2.ts'
import { fn_11abf0 } from './ix/reposition_liquidity_v2.ts'
import { fn_101e30 } from './ix/initialize_adaptive_fee_tier.ts'
import { fn_102650 } from './ix/initialize_config.ts'
import { fn_102d80 } from './ix/initialize_config_extension.ts'
import { fn_103878 } from './ix/initialize_fee_tier.ts'
import { fn_103d98 } from './ix/lock_position.ts'

export function entrypoint(input: Input): u64 {
	const s18 = fp - 0x18, s48 = fp - 0x48, s58 = fp - 0x58, s258 = fp - 0x258, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let k, n, p, r, v, y, am, ao, ar: u64
	let h = 0
	let g = input.acc0
	const f = input.num_accounts
	if (f != 0) {
		st64(s258, g)
		h = 1
		g = input + input.acc0.data_len + 0x286f & -8
		if (f != 1) {
			B29: {
				B28: {
					h = min(f, 0x40)
					v = f - h
					if (f == 2) {
						const u = ld8(g)
						if (u != 0xff) {
							st64(s258 + 8, ld64(s258 + (u << 3)))
							break B28
						}
						st64(s258 + 8, g)
					} else {
						let j = s258
						let l = h
						if (f >= 6) {
							j = s258
							l = h
							while (true) {
								const m = ld8(g)
								if (m == 0xff) {
									st64(j + 8, g)
									n = (g + ld64(g + 0x50) + 0x2867 & -8 /* next account record */)
								} else {
									st64(j + 8, ld64(s258 + (m << 3)))
									n = g + 8
								}
								const o = ld8(n)
								if (o != 0xff) {
									st64(j + 0x10, ld64(s258 + (o << 3)))
									p = n + 8
								} else {
									st64(j + 0x10, n)
									p = (n + ld64(n + 0x50) + 0x2867 & -8 /* next account record */)
								}
								const q = ld8(p)
								if (q != 0xff) {
									st64(j + 0x18, ld64(s258 + (q << 3)))
									r = p + 8
								} else {
									st64(j + 0x18, p)
									r = (p + ld64(p + 0x50) + 0x2867 & -8 /* next account record */)
								}
								const s = ld8(r)
								if (s != 0xff) {
									st64(j + 0x20, ld64(s258 + (s << 3)))
									k = r + 8
								} else {
									st64(j + 0x20, r)
									k = (r + ld64(r + 0x50) + 0x2867 & -8 /* next account record */)
								}
								const i = ld8(k)
								if (i != 0xff) {
									st64(j + 0x28, ld64(s258 + (i << 3)))
									g = k + 8
									j = j + 0x28
									l = l - 5
									if (5 >= l) {
										break
									}
								} else {
									st64(j + 0x28, k)
									g = (k + ld64(k + 0x50) + 0x2867 & -8 /* next account record */)
									j = j + 0x28
									l = l - 5
									if (5 >= l) {
										break
									}
								}
							}
						}
						if ((l as i64) > 2) {
							if (l == 3) {
								const aj = ld8(g)
								if (aj == 0xff) {
									st64(j + 8, g)
									g = (g + ld64(g + 0x50) + 0x2867 & -8 /* next account record */)
								} else {
									st64(j + 8, ld64(s258 + (aj << 3)))
									g = g + 8
								}
								const al = ld8(g)
								if (al != 0xff) {
									st64(j + 0x10, ld64(s258 + (al << 3)))
									break B28
								}
								st64(j + 0x10, g)
							} else if (l == 4) {
								const ak = ld8(g)
								if (ak == 0xff) {
									st64(j + 8, g)
									ar = (g + ld64(g + 0x50) + 0x2867 & -8 /* next account record */)
								} else {
									st64(j + 8, ld64(s258 + (ak << 3)))
									ar = g + 8
								}
								const at = ld8(ar)
								if (at != 0xff) {
									st64(j + 0x10, ld64(s258 + (at << 3)))
									g = ar + 8
								} else {
									st64(j + 0x10, ar)
									g = (ar + ld64(ar + 0x50) + 0x2867 & -8 /* next account record */)
								}
								const au = ld8(g)
								if (au != 0xff) {
									st64(j + 0x18, ld64(s258 + (au << 3)))
									break B28
								}
								st64(j + 0x18, g)
							} else {
								const ai = ld8(g)
								if (ai == 0xff) {
									st64(j + 8, g)
									am = (g + ld64(g + 0x50) + 0x2867 & -8 /* next account record */)
								} else {
									st64(j + 8, ld64(s258 + (ai << 3)))
									am = g + 8
								}
								const an = ld8(am)
								if (an != 0xff) {
									st64(j + 0x10, ld64(s258 + (an << 3)))
									ao = am + 8
								} else {
									st64(j + 0x10, am)
									ao = (am + ld64(am + 0x50) + 0x2867 & -8 /* next account record */)
								}
								const ap = ld8(ao)
								if (ap != 0xff) {
									st64(j + 0x18, ld64(s258 + (ap << 3)))
									g = ao + 8
								} else {
									st64(j + 0x18, ao)
									g = (ao + ld64(ao + 0x50) + 0x2867 & -8 /* next account record */)
								}
								const aq = ld8(g)
								if (aq != 0xff) {
									st64(j + 0x20, ld64(s258 + (aq << 3)))
									break B28
								}
								st64(j + 0x20, g)
							}
						} else {
							if (l == 1) {
								break B29
							}
							const t = ld8(g)
							if (t != 0xff) {
								st64(j + 8, ld64(s258 + (t << 3)))
								break B28
							}
							st64(j + 8, g)
						}
					}
					g = (g + ld64(g + 0x50) + 0x2867 & -8 /* next account record */)
					break B29
				}
				g = g + 8
			}
			if (v != 0) {
				let x = h - f
				let w = g
				do {
					g = g + 8
					if (ld8(w) == 0xff) {
						g = (w + ld64(w + 0x50) + 0x2867 & -8 /* next account record */)
					}
					x = x + 1
					w = g
				} while (x != 0)
			}
		}
	}
	B41: {
		y = ld64(g)
		if (y >= 8) {
			g = g + 8
			let z = 0x100159770
			if (ld64(g) != 0xb2fbcd0d76f39c2e /* ix:increase_liquidity */) {
				z = 0x100159788
				if (ld64(g) != 0x12c5b686fd026a0 /* ix:decrease_liquidity */) {
					z = 0x1001597a0
					if (ld64(g) != 0xab0ee45df591d85 /* ix:increase_liquidity_v2 */) {
						z = 0x1001597b8
						if (ld64(g) != 0x60c4524f3ebc7f3a /* ix:decrease_liquidity_v2 */) {
							z = 0x1001597d0
							if (ld64(g) != 0x2b35c6d27c09fbef /* ix:increase_liquidity_by_token_amounts_v2 */) {
								z = 0x1001597e8
								if (ld64(g) != 0xfd9e13830be0a9bf /* ix:reposition_liquidity_v2 */) {
									break B41
								}
							}
						}
					}
				}
			}
			callx(ld64(z + 0x10), s58, s258, h, g, y)
			if (ld64(s58) == 3) {
				return 0
			}
			return fn_150f0(s58, 0)
		}
	}
	fn_13fd08(s48, input, h, g, y)
	let ac = ld64(s48 + 0x10)
	const ab = ld64(s48 + 8)
	const ad = ld64(s48 + 0x18)
	const aa = ld64(s48 + 0x28)
	st64(s1000, ld64(s48 + 0x20))
	st64(sff8, aa)
	anchor_dispatch(s48, ad, ab, ac, ld64(s1000), aa)
	let ae = 0
	if (ld64(s48) != 0x800000000000001a /* Ok */) {
		copyr(s18, s48, 0x18)
		ae = fn_143da0(s18, 0)
	}
	if (ac == 0) {
		return ae
	}
	let af = ab + 0x10
	while (true) {
		const ah = ld64(af)
		const ag = ld64(af - 8)
		rc_dec(ag)
		rc_dec(ah)
		af = af + 0x30
		ac = ac - 1
		if (ac == 0) {
			return ae
		}
	}
}

export function fn_1d0(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const g = ld64(e - 0xff8)
	if (b > c) {
		fn_14c690(b, c, g, d, e)
	}
	const f = ld64(e - 0x1000)
	if (c > f) {
		fn_14c5c0(c, f, g, d, f)
	}
	st64(a + 8, c - b)
	st64(a, d + b)
}

export function fn_1290(a: u64, b: u64) {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	let k, p: u64
	const f = ld64(b + 0x18)
	const g = memcmp(f, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((g as u32) != 0) {
		const o = anchor_error_from(s50, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const n = ld64(s50 + 8)
		const m = ld64(s50)
		copyr(s40, f, 0x20)
		st64(s20, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		fn_13b5c0(s60, m, n, s40, o)
		p = ld64(s60)
		st64(a + 8, ld64(s60 + 8))
		st64(a, p)
	} else {
		AccountInfo_try_borrow_data(s40, b, g as u32)
		const l = ld64(s40 + 0x10)
		const i = ld64(s40 + 8)
		const h = ld64(s40)
		if (h == 0x800000000000001a /* Ok */) {
			const j = ld64(i + 8)
			if (8 > j) {
				anchor_error_from(s80, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, j)
				k = ld64(s80)
				st64(a + 8, ld64(s80 + 8))
				st64(a, k)
				st64(l, ld64(l) - 1)
			} else if (ld64(ld64(i)) != 0xf4e5b38cb383c28b /* account:Oracle */) {
				anchor_error_from(s80, 0xbba /* anchor::AccountDiscriminatorMismatch */, 0xf4e5b38cb383c28b /* account:Oracle */)
				k = ld64(s80)
				st64(a + 8, ld64(s80 + 8))
				st64(a, k)
				st64(l, ld64(l) - 1)
			} else {
				st64(a + 8, b)
				st64(a, 2)
				st64(l, ld64(l) - 1)
			}
		} else {
			st64(s40, h, i, l)
			fn_13b430(s70, s40)
			p = ld64(s70)
			st64(a + 8, ld64(s70 + 8))
			st64(a, p)
		}
	}
}

export function fn_27d8(a: u64, b: u64) {
	const s10 = fp - 0x10
	let q, r, s: u64
	const g = ld64(b + 0x10)
	const f = fn_1430f0(ld64(b))
	let p = undef
	if (f == 0) {
		anchor_error_from(s10, 0xbc7 /* anchor::AccountSysvarMismatch */, p, q, r)
		s = ld64(s10)
		st64(a + 0x10, ld64(s10 + 8))
		st64(a + 8, s)
		st64(a, 0)
	} else {
		const h = ld64(g + 0x10)
		if (h > 0x7ffffffffffffffe) {
			fn_1486f0(0x100159360, 0x7ffffffffffffffe, p, q, r)
		}
		st64(g + 0x10, h + 1)
		const i = ld64(g + 0x20)
		if (i >= 8 && (i != 0x10 && (i & -8) != 8)) {
			const j = ld64(g + 0x18)
			const m = ld64(j)
			const l = ld64(j + 8)
			const k = ld8(j + 0x10)
			st64(g + 0x10, h)
			st8(a + 0x18, k)
			st64(a + 0x10, l)
			st64(a + 8, m)
			st64(a, b)
			return
		}
		const n = error_from_1447e8(0x2500000003)
		p = undef
		const o = min(ld64(n) ^ 0x8000000000000000, 8)
		if (o - 1 >= 7 && o == 0) {
			const t = ld64(n + 8)
			p = (t & 3) - 2
			if (p >= 2 && (t & 3) != 0) {
				const u = ld64(ld64(t + 7))
				callx(u, ld64(t - 1), u, p)
				p = undef
			}
		}
		st64(g + 0x10, ld64(g + 0x10) - 1)
		anchor_error_from(s10, 0xbc7 /* anchor::AccountSysvarMismatch */, p, q, r)
		s = ld64(s10)
		st64(a + 0x10, ld64(s10 + 8))
		st64(a + 8, s)
		st64(a, 0)
	}
}

export function fn_85f0(a: u64, b: u64) {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0
	let p: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0) {
		anchor_error_from(sa0, 0xbc4 /* anchor::AccountNotInitialized */)
		p = ld64(sa0)
		st64(a + 0x10, ld64(sa0 + 8))
		st64(a + 8, p)
		st64(a, 0)
		return
	}
	const g = memcmp(f, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s60, b, g as u32)
		const o = ld64(s60 + 0x10)
		const l = ld64(s60 + 8)
		const k = ld64(s60)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s20 + 8, ld64(l + 8))
			st64(s20, m)
			fn_1035a0(s60, s20, 0x800000000000001a /* Ok */)
			if (ld16(s60) == 0) {
				st16(a + 0xc, ld16(s60 + 6))
				st32(a + 8, ld32(s60 + 2))
				st64(s20 + 0x10, ld64(s60 + 0x18))
				st64(s20 + 0x16, ld64(s60 + 0x1e))
				const r = ld64(s60 + 8)
				const q = ld64(s60 + 0x10)
				st64(a + 0x24, ld64(s20 + 0x16))
				st64(a + 0x1e, ld64(s20 + 0x10))
				st64(a + 0x16, q)
				st64(a + 0xe, r)
				st64(a, b)
				st64(o, ld64(o) - 1)
			} else {
				const n = ld64(s60 + 8)
				st64(a + 0x10, ld64(s60 + 0x10))
				st64(a + 8, n)
				st64(a, 0)
				st64(o, ld64(o) - 1)
			}
		} else {
			st64(s60, k, l, o)
			fn_13b430(s90, s60)
			p = ld64(s90)
			st64(a + 0x10, ld64(s90 + 8))
			st64(a + 8, p)
			st64(a, 0)
		}
	} else {
		const j = anchor_error_from(s70, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const i = ld64(s70 + 8)
		const h = ld64(s70)
		copyr(s60, f, 0x20)
		st64(s40, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		fn_13b5c0(s80, h, i, s60, j)
		p = ld64(s80)
		st64(a + 0x10, ld64(s80 + 8))
		st64(a + 8, p)
		st64(a, 0)
	}
}

export function fn_89e0(a: u64, b: u64) {
	const s270 = fp - 0x270, s278 = fp - 0x278, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0
	let q: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0) {
		anchor_error_from(s2e0, 0xbc4 /* anchor::AccountNotInitialized */)
		q = ld64(s2e0)
		st64(a + 0x10, ld64(s2e0 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return
	}
	const g = memcmp(f, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s290, b, g as u32)
		const p = ld64(s290 + 0x10)
		const l = ld64(s290 + 8)
		const k = ld64(s290)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s2a0 + 8, ld64(l + 8))
			st64(s2a0, m)
			fn_105800(s290, s2a0, 0x800000000000001a /* Ok */)
			const n = ld64(s290 + 0x10)
			const o = ld64(s290 + 8)
			if (ld64(s290) == 0) {
				memcpy(a + 0x18, s278, 0x278)
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, b)
				st64(p, ld64(p) - 1)
			} else {
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, 0)
				st64(p, ld64(p) - 1)
			}
		} else {
			st64(s290, k, l, p)
			fn_13b430(s2d0, s290)
			q = ld64(s2d0)
			st64(a + 0x10, ld64(s2d0 + 8))
			st64(a + 8, q)
			st64(a, 0)
		}
	} else {
		const j = anchor_error_from(s2b0, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const i = ld64(s2b0 + 8)
		const h = ld64(s2b0)
		copyr(s290, f, 0x20)
		st64(s270, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		fn_13b5c0(s2c0, h, i, s290, j)
		q = ld64(s2c0)
		st64(a + 0x10, ld64(s2c0 + 8))
		st64(a + 8, q)
		st64(a, 0)
	}
}

export function fn_8da0(a: u64, b: u64) {
	const s10 = fp - 0x10, s20 = fp - 0x20, s40 = fp - 0x40, s48 = fp - 0x48, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0
	let p: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0) {
		anchor_error_from(sa0, 0xbc4 /* anchor::AccountNotInitialized */)
		p = ld64(sa0)
		st64(a + 0x10, ld64(sa0 + 8))
		st64(a + 8, p)
		st64(a, 0)
		return
	}
	const g = memcmp(f, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s60, b, g as u32)
		const o = ld64(s60 + 0x10)
		const l = ld64(s60 + 8)
		const k = ld64(s60)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s20 + 8, ld64(l + 8))
			st64(s20, m)
			fn_11f4c8(s60, s20, 0x800000000000001a /* Ok */)
			if (ld32(s60) == 0) {
				copy(s10, s48, 0x10)
				const r = ld32(s60 + 4)
				const q = ld64(s60 + 8)
				st64(a + 0x14, ld64(s60 + 0x10))
				st64(a + 0xc, q)
				st32(a + 8, r)
				st64(a, b)
				copy(a + 0x1c, s10, 0x10)
				st64(o, ld64(o) - 1)
			} else {
				const n = ld64(s60 + 8)
				st64(a + 0x10, ld64(s60 + 0x10))
				st64(a + 8, n)
				st64(a, 0)
				st64(o, ld64(o) - 1)
			}
		} else {
			st64(s60, k, l, o)
			fn_13b430(s90, s60)
			p = ld64(s90)
			st64(a + 0x10, ld64(s90 + 8))
			st64(a + 8, p)
			st64(a, 0)
		}
	} else {
		const j = anchor_error_from(s70, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const i = ld64(s70 + 8)
		const h = ld64(s70)
		copyr(s60, f, 0x20)
		st64(s40, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		fn_13b5c0(s80, h, i, s60, j)
		p = ld64(s80)
		st64(a + 0x10, ld64(s80 + 8))
		st64(a + 8, p)
		st64(a, 0)
	}
}

export function fn_9180(a: u64, b: u64) {
	const s50 = fp - 0x50, s58 = fp - 0x58, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0
	let q: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0) {
		anchor_error_from(sc0, 0xbc4 /* anchor::AccountNotInitialized */)
		q = ld64(sc0)
		st64(a + 0x10, ld64(sc0 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return
	}
	const g = memcmp(f, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s70, b, g as u32)
		const p = ld64(s70 + 0x10)
		const l = ld64(s70 + 8)
		const k = ld64(s70)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s80 + 8, ld64(l + 8))
			st64(s80, m)
			fn_103ac0(s70, s80, 0x800000000000001a /* Ok */)
			const n = ld64(s70 + 0x10)
			const o = ld64(s70 + 8)
			if (ld64(s70) == 0) {
				memcpy(a + 0x18, s58, 0x58)
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, b)
				st64(p, ld64(p) - 1)
			} else {
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, 0)
				st64(p, ld64(p) - 1)
			}
		} else {
			st64(s70, k, l, p)
			fn_13b430(sb0, s70)
			q = ld64(sb0)
			st64(a + 0x10, ld64(sb0 + 8))
			st64(a + 8, q)
			st64(a, 0)
		}
	} else {
		const j = anchor_error_from(s90, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const i = ld64(s90 + 8)
		const h = ld64(s90)
		copyr(s70, f, 0x20)
		st64(s50, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		fn_13b5c0(sa0, h, i, s70, j)
		q = ld64(sa0)
		st64(a + 0x10, ld64(sa0 + 8))
		st64(a + 8, q)
		st64(a, 0)
	}
}

export function fn_9540(a: u64, b: u64) {
	const sb8 = fp - 0xb8, sc0 = fp - 0xc0, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128
	let q: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0) {
		anchor_error_from(s128, 0xbc4 /* anchor::AccountNotInitialized */)
		q = ld64(s128)
		st64(a + 0x10, ld64(s128 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return
	}
	const g = memcmp(f, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(sd8, b, g as u32)
		const p = ld64(sd8 + 0x10)
		const l = ld64(sd8 + 8)
		const k = ld64(sd8)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(se8 + 8, ld64(l + 8))
			st64(se8, m)
			fn_1042c0(sd8, se8, 0x800000000000001a /* Ok */)
			const n = ld64(sd8 + 0x10)
			const o = ld64(sd8 + 8)
			if (ld64(sd8) == 0) {
				memcpy(a + 0x18, sc0, 0xc0)
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, b)
				st64(p, ld64(p) - 1)
			} else {
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, 0)
				st64(p, ld64(p) - 1)
			}
		} else {
			st64(sd8, k, l, p)
			fn_13b430(s118, sd8)
			q = ld64(s118)
			st64(a + 0x10, ld64(s118 + 8))
			st64(a + 8, q)
			st64(a, 0)
		}
	} else {
		const j = anchor_error_from(sf8, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const i = ld64(sf8 + 8)
		const h = ld64(sf8)
		copyr(sd8, f, 0x20)
		st64(sb8, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		fn_13b5c0(s108, h, i, sd8, j)
		q = ld64(s108)
		st64(a + 0x10, ld64(s108 + 8))
		st64(a + 8, q)
		st64(a, 0)
	}
}

export function fn_9900(a: u64, b: u64) {
	const s48 = fp - 0x48, s50 = fp - 0x50, s68 = fp - 0x68, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108
	let p: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0) {
		anchor_error_from(s108, 0xbc4 /* anchor::AccountNotInitialized */)
		p = ld64(s108)
		st64(a + 0x10, ld64(s108 + 8))
		st64(a + 8, p)
		st64(a, 0)
		return
	}
	const g = memcmp(f, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s68, b, g as u32)
		const o = ld64(s68 + 0x10)
		const l = ld64(s68 + 8)
		const k = ld64(s68)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(sc8 + 8, ld64(l + 8))
			st64(sc8, m)
			fn_102378(s68, sc8, 0x800000000000001a /* Ok */)
			if (ld16(s68) == 0) {
				st16(a + 0xc, ld16(s68 + 6))
				st32(a + 8, ld32(s68 + 2))
				const r = ld64(s68 + 8)
				const q = ld64(s68 + 0x10)
				memcpy(sb8, s50, 0x4e)
				memcpy(a + 0x1e, sb8, 0x4e)
				st64(a + 0x16, q)
				st64(a + 0xe, r)
				st64(a, b)
				st64(o, ld64(o) - 1)
			} else {
				const n = ld64(s68 + 8)
				st64(a + 0x10, ld64(s68 + 0x10))
				st64(a + 8, n)
				st64(a, 0)
				st64(o, ld64(o) - 1)
			}
		} else {
			st64(s68, k, l, o)
			fn_13b430(sf8, s68)
			p = ld64(sf8)
			st64(a + 0x10, ld64(sf8 + 8))
			st64(a + 8, p)
			st64(a, 0)
		}
	} else {
		const j = anchor_error_from(sd8, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const i = ld64(sd8 + 8)
		const h = ld64(sd8)
		copyr(s68, f, 0x20)
		st64(s48, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		fn_13b5c0(se8, h, i, s68, j)
		p = ld64(se8)
		st64(a + 0x10, ld64(se8 + 8))
		st64(a + 8, p)
		st64(a, 0)
	}
}

export function fn_9d30(a: u64, b: u64) {
	const s48 = fp - 0x48, s50 = fp - 0x50, s68 = fp - 0x68, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108
	let p: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0) {
		anchor_error_from(s108, 0xbc4 /* anchor::AccountNotInitialized */)
		p = ld64(s108)
		st64(a + 0x10, ld64(s108 + 8))
		st64(a + 8, p)
		st64(a, 0)
		return
	}
	const g = memcmp(f, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s68, b, g as u32)
		const o = ld64(s68 + 0x10)
		const l = ld64(s68 + 8)
		const k = ld64(s68)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(sc8 + 8, ld64(l + 8))
			st64(sc8, m)
			fn_102aa8(s68, sc8, 0x800000000000001a /* Ok */)
			if (ld8(s68) == 0) {
				st32(a + 0xb, ld32(s68 + 4))
				st32(a + 8, ld32(s68 + 1))
				const r = ld64(s68 + 8)
				const q = ld64(s68 + 0x10)
				memcpy(sb8, s50, 0x49)
				memcpy(a + 0x1f, sb8, 0x49)
				st64(a + 0x17, q)
				st64(a + 0xf, r)
				st64(a, b)
				st64(o, ld64(o) - 1)
			} else {
				const n = ld64(s68 + 8)
				st64(a + 0x10, ld64(s68 + 0x10))
				st64(a + 8, n)
				st64(a, 0)
				st64(o, ld64(o) - 1)
			}
		} else {
			st64(s68, k, l, o)
			fn_13b430(sf8, s68)
			p = ld64(sf8)
			st64(a + 0x10, ld64(sf8 + 8))
			st64(a + 8, p)
			st64(a, 0)
		}
	} else {
		const j = anchor_error_from(sd8, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const i = ld64(sd8 + 8)
		const h = ld64(sd8)
		copyr(s68, f, 0x20)
		st64(s48, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		fn_13b5c0(se8, h, i, s68, j)
		p = ld64(se8)
		st64(a + 0x10, ld64(se8 + 8))
		st64(a + 8, p)
		st64(a, 0)
	}
}

export function fn_a160(a: u64, b: u64) {
	const s28 = fp - 0x28, s30 = fp - 0x30, s48 = fp - 0x48, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8
	let p: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0) {
		anchor_error_from(sc8, 0xbc4 /* anchor::AccountNotInitialized */)
		p = ld64(sc8)
		st64(a + 0x18, ld64(sc8 + 8))
		st64(a + 0x10, p)
		st8(a + 8, 2)
		return
	}
	const g = memcmp(f, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s48, b, g as u32)
		const o = ld64(s48 + 0x10)
		const l = ld64(s48 + 8)
		const k = ld64(s48)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s88 + 8, ld64(l + 8))
			st64(s88, m)
			fn_105168(s48, s88, 0x800000000000001a /* Ok */)
			if (ld8(s48) == 0) {
				st32(a + 0xb, ld32(s48 + 4))
				st32(a + 8, ld32(s48 + 1))
				const r = ld64(s48 + 8)
				const q = ld64(s48 + 0x10)
				memcpy(s78, s30, 0x2a)
				memcpy(a + 0x1f, s78, 0x2a)
				st64(a + 0x17, q)
				st64(a + 0xf, r)
				st64(a, b)
				st64(o, ld64(o) - 1)
			} else {
				const n = ld64(s48 + 8)
				st64(a + 0x18, ld64(s48 + 0x10))
				st64(a + 0x10, n)
				st8(a + 8, 2)
				st64(o, ld64(o) - 1)
			}
		} else {
			st64(s48, k, l, o)
			fn_13b430(sb8, s48)
			p = ld64(sb8)
			st64(a + 0x18, ld64(sb8 + 8))
			st64(a + 0x10, p)
			st8(a + 8, 2)
		}
	} else {
		const j = anchor_error_from(s98, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const i = ld64(s98 + 8)
		const h = ld64(s98)
		copyr(s48, f, 0x20)
		st64(s28, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		fn_13b5c0(sa8, h, i, s48, j)
		p = ld64(sa8)
		st64(a + 0x18, ld64(sa8 + 8))
		st64(a + 0x10, p)
		st8(a + 8, 2)
	}
}

export function fn_a590(a: u64, b: u64) {
	const s60 = fp - 0x60, s68 = fp - 0x68, s80 = fp - 0x80, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let p: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0) {
		anchor_error_from(s138, 0xbc4 /* anchor::AccountNotInitialized */)
		p = ld64(s138)
		st64(a + 0x10, ld64(s138 + 8))
		st64(a + 8, p)
		st64(a, 0)
		return
	}
	const g = memcmp(f, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s80, b, g as u32)
		const o = ld64(s80 + 0x10)
		const l = ld64(s80 + 8)
		const k = ld64(s80)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(sf8 + 8, ld64(l + 8))
			st64(sf8, m)
			fn_101b58(s80, sf8, 0x800000000000001a /* Ok */)
			if (ld32(s80) == 0) {
				const s = ld32(s80 + 4)
				const r = ld64(s80 + 8)
				const q = ld64(s80 + 0x10)
				memcpy(se8, s68, 0x64 /* anchor::InstructionMissing */)
				memcpy(a + 0x1c, se8, 0x64 /* anchor::InstructionMissing */)
				st64(a + 0x14, q)
				st64(a + 0xc, r)
				st32(a + 8, s)
				st64(a, b)
				st64(o, ld64(o) - 1)
			} else {
				const n = ld64(s80 + 8)
				st64(a + 0x10, ld64(s80 + 0x10))
				st64(a + 8, n)
				st64(a, 0)
				st64(o, ld64(o) - 1)
			}
		} else {
			st64(s80, k, l, o)
			fn_13b430(s128, s80)
			p = ld64(s128)
			st64(a + 0x10, ld64(s128 + 8))
			st64(a + 8, p)
			st64(a, 0)
		}
	} else {
		const j = anchor_error_from(s108, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const i = ld64(s108 + 8)
		const h = ld64(s108)
		copyr(s80, f, 0x20)
		st64(s60, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		fn_13b5c0(s118, h, i, s80, j)
		p = ld64(s118)
		st64(a + 0x10, ld64(s118 + 8))
		st64(a + 8, p)
		st64(a, 0)
	}
}

export function fn_a9c0(a: u64, b: u64) {
	const s28 = fp - 0x28, s30 = fp - 0x30, s48 = fp - 0x48, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8
	let p: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0) {
		anchor_error_from(sc8, 0xbc4 /* anchor::AccountNotInitialized */)
		p = ld64(sc8)
		st64(a + 0x10, ld64(sc8 + 8))
		st64(a + 8, p)
		st64(a, 0)
		return
	}
	const g = memcmp(f, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s48, b, g as u32)
		const o = ld64(s48 + 0x10)
		const l = ld64(s48 + 8)
		const k = ld64(s48)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s88 + 8, ld64(l + 8))
			st64(s88, m)
			fn_104c10(s48, s88, 0x800000000000001a /* Ok */)
			if (ld8(s48) == 0) {
				st32(a + 0xb, ld32(s48 + 4))
				st32(a + 8, ld32(s48 + 1))
				const r = ld64(s48 + 8)
				const q = ld64(s48 + 0x10)
				memcpy(s78, s30, 0x29)
				memcpy(a + 0x1f, s78, 0x29)
				st64(a + 0x17, q)
				st64(a + 0xf, r)
				st64(a, b)
				st64(o, ld64(o) - 1)
			} else {
				const n = ld64(s48 + 8)
				st64(a + 0x10, ld64(s48 + 0x10))
				st64(a + 8, n)
				st64(a, 0)
				st64(o, ld64(o) - 1)
			}
		} else {
			st64(s48, k, l, o)
			fn_13b430(sb8, s48)
			p = ld64(sb8)
			st64(a + 0x10, ld64(sb8 + 8))
			st64(a + 8, p)
			st64(a, 0)
		}
	} else {
		const j = anchor_error_from(s98, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const i = ld64(s98 + 8)
		const h = ld64(s98)
		copyr(s48, f, 0x20)
		st64(s28, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		fn_13b5c0(sa8, h, i, s48, j)
		p = ld64(sa8)
		st64(a + 0x10, ld64(sa8 + 8))
		st64(a + 8, p)
		st64(a, 0)
	}
}

export function fn_b9a8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fn_149140(ld64(a), b, c, d, e)
}

export function fn_bb50(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fn_14a698(a, 0x100159480, b, d, e)
}

export function fn_bb78(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fn_14a698(a, b, c, d, e)
}

export function fn_bc78(r0: u64): u64 {
	return r0
}

export function fn_bc80() {
}

export function fn_bc88() {
}

export function fn_bc90() {
}

export function fn_bc98() {
}

export function fn_bca0() {
}

export function fn_bca8() {
}

export function fn_bd10() {
}

export function fn_d510(a: u64) {
	st64(a, 0)
}

export function fn_d520() {
}

export function fn_f1c8(a: u64, b: u64, r0: u64) {
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
	fn_e478(s30, j << 3, k << 3, s18, r0)
	g = undef
	f = undef
	h = undef
	if (ld64(s30) != 0) {
		raw_vec_handle_error(ld64(s30 + 8), ld64(s30 + 0x10), g, f, h)
	}
	const n = ld64(s30 + 8)
	st64(a, i, n)
}

export function fn_f470(a: u64, b: u64, r0: u64) {
	const s18 = fp - 0x18, s30 = fp - 0x30
	let f = ld64(a)
	let g = f + 1
	let m = 0
	let h = g == 0
	if (h != 0) {
		raw_vec_handle_error(0, b, g, f, h)
	}
	let i = max(f << 1, g)
	const j = 0x111111111111112 > i
	i = max(i, 4)
	const k = i
	if (f != 0) {
		const l = ld64(a + 8)
		st64(s18 + 0x10, f * 0x78)
		st64(s18, l)
		m = 8
	}
	st64(s18 + 8, m)
	fn_e478(s30, j << 3, k * 0x78, s18, r0)
	g = undef
	f = undef
	h = undef
	if (ld64(s30) != 0) {
		raw_vec_handle_error(ld64(s30 + 8), ld64(s30 + 0x10), g, f, h)
	}
	const n = ld64(s30 + 8)
	st64(a, i, n)
}

export function fn_fbd0(a: u64, b: u64): u64 {
	const s10 = fp - 0x10
	const f = ld64(a)
	const h = ld64(b)
	const g = ld64(b + 8)
	st64(s10 + 8, ld64(a + 8))
	st64(s10, f)
	memcpy(h, s10, min(g, 0x10))
	const j = h + min(g, 0x10)
	const i = g - min(g, 0x10)
	st64(b + 8, i)
	st64(b, j)
	if (0x10 > g) {
		return 0x100159450
	}
	const k = ld64(a + 0x10)
	st64(s10 + 8, ld64(a + 0x18))
	st64(s10, k)
	memcpy(j, s10, min(i, 0x10))
	const m = j + min(i, 0x10)
	const l = i - min(i, 0x10)
	st64(b + 8, l)
	st64(b, m)
	if (0x10 > i) {
		return 0x100159450
	}
	const n = ld64(a + 0x20)
	st64(s10 + 8, ld64(a + 0x28))
	st64(s10, n)
	memcpy(m, s10, min(l, 0x10))
	st64(b + 8, l - min(l, 0x10))
	st64(b, m + min(l, 0x10))
	return 0x10 > l ? 0x100159450 : 0
}

export function fn_10ec0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s40 = fp - 0x40
	st64(s40, 0x1001596b8)
	st64(s40 + 0x10, s10)
	st64(s10, 0x1001596c8, fn_b980)
	st64(s40 + 0x20, 0)
	st64(s40 + 8, 1)
	st64(s40 + 0x18, 1)
	const f = ld64(b + 0x28)
	// fmt "CapacityError: {}" {} = *0x1001596c8 [fn_b980]
	return fn_14a698(ld64(b + 0x20), f, s40, f, e)
}

export function fn_118b0(a: u64, b: u64): u64 {
	let f = ld64(a)
	const g = ld64(a + 8)
	if (f == g) {
		return 0
	}
	const h = ld64(b)
	const j = ld64(h + 8)
	while (true) {
		const i = ld64(f)
		if (j == ld64(i) && memeq(h + 0x10, i + 8, 0x18)) {
			st64(a, f + 8)
			return 1
		}
		f = f + 8
		if (f == g) {
			st64(a, g)
			return 0
		}
	}
}

export function fn_13cc8(a: u64) {
	const s8 = fp - 0x8, s30 = fp - 0x30
	const g = ld64(ld64(a))
	const f = ld64(a + 8)
	st64(s30 + 0x20, ld64(a + 0x10))
	st64(s30, g + 8, s8, 0, f)
	// CPI: program *(g + 8) (id not a constant, and not compared with a known program id in this function), 0 accounts, data f[..ld64(a + 0x10)], no signer seeds
	sol_invoke_signed_c(s30, 8, 0, 8, 0)
}

// name [heur]: its CPI's data and accounts match SPL Token Transfer, but the program id is not a constant here (was fn_13d68)
export function cpi_token_transfer(a: u64, b: u64, c: u64): u64 {
	const s28 = fp - 0x28, s30 = fp - 0x30, s60 = fp - 0x60, s68 = fp - 0x68, s98 = fp - 0x98, sa0 = fp - 0xa0, sd0 = fp - 0xd0, sd9 = fp - 0xd9, s110 = fp - 0x110
	const h: AccountRecord = ld64(ld64(a + 8))
	const g: AccountRecord = ld64(ld64(a + 0x10))
	const f: AccountRecord = ld64(ld64(a + 0x18))
	st64(s110 + 0x20, f.key)
	st64(s110 + 0x10, g.key)
	st64(s110, h.key)
	st16(s110 + 0x28, 0x100)
	st16(s110 + 0x18, 1)
	st16(s110 + 8, 1)
	st8(sd9, 3)
	st64(sd9 + 1, ld64(a + 0x20))
	const u = h.executable != 0
	const t = g.is_signer != 0
	const s = g.is_writable != 0
	const i = g.executable != 0
	const q = f.is_signer != 0
	const j = f.is_writable != 0
	const p = f.executable != 0
	const o = h.is_signer != 0
	const n = ld64(ld64(a))
	const r = h.is_writable != 0
	const m = h.data_len
	const l = g.data_len
	const k = f.data_len
	st64(s60, f.key, f + 0x48, k, f.data, f.owner)
	st64(s98, g.key, g + 0x48, l, g.data, g.owner)
	st64(sd0, h.key, h + 0x48, m, h.data, h.owner)
	st8(s30, q, j, p)
	st8(s68, t, s, i)
	st8(sa0, o, r, u)
	st64(s60 + 0x28, 0)
	st64(s98 + 0x28, 0)
	st64(sd0 + 0x28, 0)
	st64(s28, n + 8, s110, 3, sd9, 9)
	// CPI program n + 8 (id not a constant, and not compared with a known program id in this function) — data and accounts match SPL Token Transfer; if it is SPL Token: { source: h.key (w), destination: g.key (w), authority: f.key (s), amount: ld64(a + 0x20) }, signer seeds b[..c] [exec]
	return sol_invoke_signed_c(s28, sd0, 3, b, c)
}

// name [heur]: its CPI's data and accounts match SPL Token TransferChecked, but the program id is not a constant here (was fn_14200)
export function cpi_token_transfer_checked(a: u64, b: u64, c: u64): u64 {
	const s28 = fp - 0x28, s30 = fp - 0x30, s60 = fp - 0x60, s68 = fp - 0x68, s98 = fp - 0x98, sa0 = fp - 0xa0, sd0 = fp - 0xd0, sd8 = fp - 0xd8, s108 = fp - 0x108, s112 = fp - 0x112, s158 = fp - 0x158
	const i: AccountRecord = ld64(ld64(a + 8))
	const h: AccountRecord = ld64(ld64(a + 0x10))
	const g: AccountRecord = ld64(ld64(a + 0x18))
	const f: AccountRecord = ld64(ld64(a + 0x20))
	st64(s158 + 0x30, f.key)
	st64(s158 + 0x20, g.key)
	st64(s158 + 0x10, h.key)
	st64(s158, i.key)
	st16(s158 + 0x38, 0x100)
	st16(s158 + 0x28, 1)
	st16(s158 + 0x18, 0)
	st16(s158 + 8, 1)
	st8(s112, 0xc)
	st64(s112 + 1, ld64(a + 0x28))
	st8(s112 + 9, ld8(a + 0x30))
	const z = f.executable != 0
	const y = h.is_writable != 0
	const x = f.is_signer != 0
	const s = f.is_writable != 0
	const l = i.executable != 0
	const v = h.is_signer != 0
	const r = g.executable != 0
	const k = i.is_signer != 0
	const u = i.is_writable != 0
	const j = h.executable != 0
	const t = g.is_signer != 0
	const q = ld64(ld64(a))
	const w = g.is_writable != 0
	const p = i.data_len
	const o = h.data_len
	const n = g.data_len
	const m = f.data_len
	st64(s60, f.key, f + 0x48, m, f.data, f.owner)
	st64(s98, g.key, g + 0x48, n, g.data, g.owner)
	st64(sd0, h.key, h + 0x48, o, h.data, h.owner)
	st64(s108, i.key, i + 0x48, p, i.data, i.owner)
	st8(s30, x, s, z)
	st8(s68, t, w, r)
	st8(sa0, v, y, j)
	st8(sd8, k, u, l)
	st64(s60 + 0x28, 0)
	st64(s98 + 0x28, 0)
	st64(sd0 + 0x28, 0)
	st64(s108 + 0x28, 0)
	st64(s28, q + 8, s158, 4, s112, 0xa)
	// CPI program q + 8 (id not a constant, and not compared with a known program id in this function) — data and accounts match SPL Token TransferChecked; if it is SPL Token: { source: i.key (w), mint: h.key, destination: g.key (w), authority: f.key (s), amount: ld64(a + 0x28), decimals: ld8(a + 0x30) }, signer seeds b[..c] [exec]
	return sol_invoke_signed_c(s28, s108, 4, b, c)
}

// name [heur]: its CPI's data and accounts match SPL Token TransferChecked, but the program id is not a constant here (was fn_14818)
export function cpi_token_transfer_checked_2(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s30 = fp - 0x30, s38 = fp - 0x38, s42 = fp - 0x42, s670 = fp - 0x670, s6a0 = fp - 0x6a0, s6a8 = fp - 0x6a8, s6d8 = fp - 0x6d8, s6e0 = fp - 0x6e0, s710 = fp - 0x710, s718 = fp - 0x718, s748 = fp - 0x748, s750 = fp - 0x750, s907 = fp - 0x907, s950 = fp - 0x950
	const f: AccountRecord = ld64(ld64(a + 8))
	st64(s950, f.key)
	st16(s950 + 8, 1)
	const g: AccountRecord = ld64(ld64(a + 0x10))
	st64(s950 + 0x10, g.key)
	st16(s950 + 0x18, 0)
	const h: AccountRecord = ld64(ld64(a + 0x18))
	let ap = h.key
	st64(s950 + 0x20, h.key)
	st16(s950 + 0x28, 1)
	const i: AccountRecord = ld64(ld64(a + 0x20))
	let aq = i.key
	st64(s950 + 0x30, i.key)
	st16(s950 + 0x38, 0x100)
	st32(s750, 0)
	let ao = f.is_signer
	const l = f.is_writable
	const k = f.executable
	const j = f.data_len
	st64(s748, f.key, f + 0x48, j, f.data, f.owner)
	st8(s718, ao != 0, l != 0, k != 0)
	st64(s748 + 0x28, 0)
	st32(s750, 1)
	const p = g.is_signer
	const o = g.is_writable
	const n = g.executable
	const m = g.data_len
	st64(s710, g.key, g + 0x48, m, g.data, g.owner)
	st8(s6e0, p != 0, o != 0, n != 0)
	st64(s710 + 0x28, 0)
	st32(s750, 2)
	const t = h.is_signer
	const s = h.is_writable
	const r = h.executable
	const q = h.data_len
	st64(s6d8, ap, h + 0x48, q, h.data, h.owner)
	st8(s6a8, t != 0, s != 0, r != 0)
	st64(s6d8 + 0x28, 0)
	st32(s750, 3)
	const x = i.is_signer != 0
	const w = i.is_writable != 0
	const v = i.executable != 0
	const u = i.data_len
	st64(s6a0, aq, i + 0x48, u, i.data, i.owner)
	st8(s670, x, w, v)
	let ag = 4
	st64(s6a0 + 0x28, 0)
	st32(s750, 4)
	const y = ld64(a + 0x30)
	if (y != 0) {
		let ah = ld64(a + 0x28)
		let ae = 0
		let aa = s907
		let ab = y << 3
		do {
			const ac: AccountRecord = ld64(ld64(ah))
			const ai = ac.is_signer != 0
			const aj = ac.is_writable != 0
			if (ag >= 0x20) {
				st8(s30, aj, ai)
				st64(s38, ac.key)
				fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s38, 0x1001596f8, 0x100159800)
			}
			const an = ah
			ap = ai
			st8(aa, ai)
			aq = aj
			st8(aa - 1, aj)
			st64(aa - 9, ac.key)
			const ad = ag
			const z = ac.executable != 0
			const al = aa
			const am = ab
			ao = ac.data_len
			if (ag >= 0x20) {
				st8(s8, ap, aq, z)
				st64(s38, ac.key, ac + 0x48, ao, ac.data, ac.owner, 0)
				fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s38, 0x100159718, 0x100159818)
			}
			ah = an + 8
			const af = s750 + ae
			st8(af + 0x11a, z)
			st8(af + 0x119, aq)
			st8(af + 0x118, ap)
			st64(af + 0x108, ac.owner)
			st64(af + 0x100, ac.data)
			st64(af + 0xf8, ao)
			st64(af + 0xf0, ac + 0x48)
			st64(af + 0xe8, ac.key)
			st64(af + 0x110, 0)
			aa = al + 0x10
			ae = ae + 0x38
			ag = ad + 1
			st32(s750, ag)
			ab = am - 8
		} while (ab != 0)
	}
	st8(s42, 0xc)
	st64(s42 + 1, ld64(a + 0x38))
	st8(s42 + 9, ld8(a + 0x40))
	const ak = ld64(ld64(a))
	st64(s38, ak + 8, s950, ag, s42, 0xa)
	// CPI program *(ak + 8) (id not a constant, and not compared with a known program id in this function) — data and accounts match SPL Token TransferChecked; if it is SPL Token: { amount: ld64(a + 0x38), decimals: ld8(a + 0x40) }
	return sol_invoke_signed_c(s38, s748, ag, b, c)
}

export function fn_15490(a: u64, b: u64): u64 {
	const s10 = fp - 0x10, s67 = fp - 0x67, s98 = fp - 0x98, sb0 = fp - 0xb0, se8 = fp - 0xe8, s108 = fp - 0x108, s110 = fp - 0x110
	let q: u64
	const f = ld8(b)
	if (f == 0) {
		st32(s110 + 3, 0xffffffff9bfe66b5)
		st32(s110, 0xffffffffb590071e)
		st8(s110 + 7, f)
		const n = ld64(b + 0x40)
		copyr(s108, n, 0x20)
		const o = ld64(b + 0x48)
		copyr(se8, o, 0x20)
		st32(se8 + 0x20, ld32(b + 4))
		st32(se8 + 0x24, ld32(b + 8))
		const p = ld64(b + 0x10)
		st64(se8 + 0x30, ld64(b + 0x18))
		st64(se8 + 0x28, p)
		copy(sb0, b + 0x20, 0x20)
		st8(s110 + 7, 0xa1)
		st64(s10, s110, 0x80)
		q = sol_log_data(s10, 1)
		st64(a, 3)
		return q
	}
	if (f == 1) {
		st32(s110 + 3, 0xffffffffb5ca7047)
		st32(s110, 0x472401a6)
		st8(s110 + 7, f)
		const k = ld64(b + 0x40)
		copyr(s108, k, 0x20)
		const l = ld64(b + 0x48)
		copyr(se8, l, 0x20)
		st32(se8 + 0x20, ld32(b + 4))
		st32(se8 + 0x24, ld32(b + 8))
		const m = ld64(b + 0x10)
		st64(se8 + 0x30, ld64(b + 0x18))
		st64(se8 + 0x28, m)
		copy(sb0, b + 0x20, 0x20)
		st8(s110 + 7, 0xab)
		st64(s10, s110, 0x80)
		q = sol_log_data(s10, 1)
		st64(a, 3)
		return q
	}
	st32(s110 + 3, 0xffffffffc332fb84)
	st32(s110, 0xffffffff84b5825f)
	st8(s110 + 7, 2)
	const g = ld64(b + 0x78)
	copyr(s108, g, 0x20)
	const h = ld64(b + 0x80)
	copyr(se8, h, 0x20)
	st32(se8 + 0x20, ld32(b + 4))
	st32(se8 + 0x24, ld32(b + 8))
	st32(se8 + 0x28, ld32(b + 0xc))
	st32(se8 + 0x2c, ld32(b + 0x10))
	const i = ld64(b + 0x18)
	st64(sb0, ld64(b + 0x20))
	st64(se8 + 0x30, i)
	const j = ld64(b + 0x28)
	st64(sb0 + 0x10, ld64(b + 0x30))
	st64(sb0 + 8, j)
	copy(s98, b + 0x38, 0x30)
	st8(s98 + 0x30, ld8(b + 1))
	copy(s67, b + 0x68, 0x10)
	st8(s67 + 0x10, ld8(b + 2))
	st8(s110 + 7, 0x26)
	st64(s10, s110, 0xba)
	q = sol_log_data(s10, 1)
	st64(a, 3)
	return q
}

export function fn_159d0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64): u64 {
	const s78 = fp - 0x78, s90 = fp - 0x90, s108 = fp - 0x108, s178 = fp - 0x178, s1e8 = fp - 0x1e8, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s340 = fp - 0x340, s378 = fp - 0x378, s3d0 = fp - 0x3d0, s410 = fp - 0x410, s418 = fp - 0x418, s428 = fp - 0x428, s440 = fp - 0x440, s448 = fp - 0x448, sfe8 = fp - 0xfe8, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let bg, bh, bi, bm, bo, bq, bv, by, bz, ca, cb, cf, cg, ch, ci, cn: u64
	st64(s340 + 0x10, b)
	const h = ld16(b + 0x29)
	const g = ld32(c + 0x58)
	const f = p5
	st64(s340 + 0x18, f)
	const i = ld64(f + 0x30)
	st64(s320, d, g)
	let cc = callx(i, s90, d, g, h, i)
	const k = ld64(s90 + 8)
	const j = ld64(s90)
	if (j != 3) {
		st64(a + 8, k)
		st64(a, j)
		st8(a + 0x1b0, 2)
		return cc
	}
	st64(s378 + 0x18, k)
	st64(s340, p9, a)
	const u = p8
	st64(s378 + 0x20, p10)
	const l = p7
	const m = p6
	st64(s378 + 0x30, l)
	const o = ld64(l + 0x30)
	const n = ld32(c + 0x5c)
	st64(s378 + 0x28, n)
	cc = callx(o, s90, m, n, h, o)
	const z = ld64(s90 + 8)
	const p = ld64(s90)
	if (p == 3) {
		const q = ld64(ld64(s340 + 0x18) + 0x18)
		st64(s320, callx(q, ld64(s320), q))
		const r = ld64(ld64(s378 + 0x30) + 0x18)
		const ab = callx(r, m, r)
		const t = ld64(c + 0x50)
		let s = ld64(s340)
		const v = ld64(c + 0x48)
		st64(s378 + 0x10, u)
		if ((u | v | (s | t)) == 0) {
			cc = fn_87630(s310, 0xc)
			cb = ld64(s310)
			ca = ld64(s340 + 8)
			st64(ca + 8, ld64(s310 + 8))
			st64(ca, cb)
			st8(ca + 0x1b0, 2)
			return cc
		}
		let w = ld64(s340 + 0x10)
		const y = ld64(w + 0x105)
		const x = ld64(s378 + 0x20)
		if (y > x) {
			cc = fn_87630(s300, 0x16)
			cb = ld64(s300)
			ca = ld64(s340 + 8)
			st64(ca + 8, ld64(s300 + 8))
			st64(ca, cb)
			st8(ca + 0x1b0, 2)
			return cc
		}
		st64(s3d0 + 0x28, c)
		st64(s3d0, v, t)
		st64(s3d0 + 0x48, z)
		st64(s320 + 8, ld64(s320 + 8) << 0x20)
		st64(s378 + 0x28, ld64(s378 + 0x28) as i32)
		st64(s378 + 0x30, ld64(w + 0x285))
		st64(s378, ld64(w + 0x27d))
		st64(s378 + 8, ld64(w + 0x205))
		st64(s3d0 + 0x50, ld64(w + 0x1fd))
		const aa = ld64(w + 0x39)
		st64(s340 + 0x18, aa)
		st64(s3d0 + 0x30, aa)
		const ac = ld64(w + 0x31)
		st64(s3d0 + 0x40, ld64(w + 0x185))
		let ah = ld64(w + 0x17d)
		st64(s3d0 + 0x10, ab)
		let ad = ac
		if (x != y && (ad | ld64(s340 + 0x18)) != 0) {
			let ag = x - y
			const af = ld64(w + 0x175)
			const ae = ld64(w + 0x16d)
			st64(s3d0 + 0x38, ad)
			st64(s378 + 0x20, ag)
			if ((ae | af) != 0) {
				const al = ah
				let ak = 0
				__multi3(s240, af, 0, ag, 0)
				__multi3(s230, ag, 0, ae, 0)
				const ai = ld64(s230 + 8)
				const aj = ld64(s240)
				let am = 0
				if ((ld64(s240 + 8) != 0 | ai > ai + aj) == 0) {
					__udivti3(s250, ld64(s230), ai + aj, ld64(s3d0 + 0x38), ld64(s3d0 + 0x30), ae)
					am = ld64(s250 + 8)
					ak = ld64(s250)
				}
				s = ld64(s340)
				w = ld64(s340 + 0x10)
				ah = ak + al
				st64(s3d0 + 0x40, am + ld64(s3d0 + 0x40) + (ak > ak + al))
				ad = ld64(s3d0 + 0x38)
				ag = ld64(s378 + 0x20)
			}
			const ao = ld64(w + 0x1f5)
			const an = ld64(w + 0x1ed)
			if ((an | ao) != 0) {
				let ar = 0
				__multi3(s270, ao, 0, ag, 0)
				__multi3(s260, ag, 0, an, 0)
				const ap = ld64(s260 + 8)
				const aq = ld64(s270)
				let au = 0
				if ((ld64(s270 + 8) != 0 | ap > ap + aq) == 0) {
					__udivti3(s280, ld64(s260), ap + aq, ld64(s3d0 + 0x38), ld64(s3d0 + 0x30), an)
					au = ld64(s280 + 8)
					ar = ld64(s280)
				}
				const at = ld64(s3d0 + 0x50)
				s = ld64(s340)
				w = ld64(s340 + 0x10)
				const av = au + ld64(s378 + 8) + (ar > ar + at)
				st64(s3d0 + 0x50, ar + at)
				st64(s378 + 8, av)
				ad = ld64(s3d0 + 0x38)
				ag = ld64(s378 + 0x20)
			}
			const ax = ld64(w + 0x275)
			const aw = ld64(w + 0x26d)
			if ((aw | ax) != 0) {
				let ba = 0
				__multi3(s2a0, ax, 0, ag, 0)
				__multi3(s290, ag, 0, aw, 0)
				const ay = ld64(s290 + 8)
				const az = ld64(s2a0)
				let bc = 0
				if ((ld64(s2a0 + 8) != 0 | ay > ay + az) == 0) {
					__udivti3(s2b0, ld64(s290), ay + az, ld64(s3d0 + 0x38), ld64(s3d0 + 0x30), aw)
					bc = ld64(s2b0 + 8)
					ba = ld64(s2b0)
				}
				const bb = ld64(s378)
				s = ld64(s340)
				w = ld64(s340 + 0x10)
				const bd = bc + ld64(s378 + 0x30) + (ba > ba + bb)
				st64(s378, ba + bb)
				st64(s378 + 0x30, bd)
				ad = ld64(s3d0 + 0x38)
			}
		}
		B45: {
			B33: {
				const be = ld64(s320 + 8)
				st64(s220 + 0x20, ld64(s378))
				st64(s220 + 0x10, ld64(s3d0 + 0x50))
				st64(s220 + 8, ld64(s3d0 + 0x40))
				st64(s220, ah)
				st64(s220 + 0x28, ld64(s378 + 0x30))
				st64(s220 + 0x18, ld64(s378 + 8))
				const bf = ld32(w + 0x51)
				bh = ld64(s378 + 0x10)
				bg = ld64(s378 + 0x28)
				st64(s320 + 8, sar(be, 0x20))
				st64(s378 + 0x20, bf as i32)
				if ((bg as i64) > (bf as i32) && ((bf as i32) >= (sar(be, 0x20) as i64) && (bh | s) != 0)) {
					B23: {
						if ((s != 0 ? 0 > (s as i64) : bh == 0) != 0) {
							const br = s + (bh != 0)
							const bs = -br > ld64(s3d0 + 0x30)
							w = ld64(s340 + 0x10)
							bm = 0xf
							if (((ld64(s3d0 + 0x30) != -br ? bs : -bh > ad) & 1) != 0) {
								break B23
							}
							bi = ad + ld64(s378 + 0x10)
							st64(s340 + 0x18, ld64(s340 + 0x18) + s + (ad > bi))
						} else {
							bi = ad + bh
							let bj = ad > bi
							const bk = ld64(s340 + 0x18) + s + bj
							st64(s340 + 0x18, bk)
							const bl = ld64(s3d0 + 0x30) > bk
							bj = ld64(s340 + 0x18) != ld64(s3d0 + 0x30) ? bl : bj
							bm = 0xe
							if ((bj & 1) != 0) {
								break B23
							}
						}
						bq = ld64(w + 0xfd)
						st64(s3d0 + 0x30, ld64(w + 0xf5))
						st64(s3d0 + 0x20, ld64(w + 0xad))
						bo = ld64(w + 0xa5)
						ad = bi
						bh = ld64(s378 + 0x10)
						break B33
					}
					cc = fn_87630(s2c0, bm)
					cb = ld64(s2c0)
					ca = ld64(s340 + 8)
					st64(ca + 8, ld64(s2c0 + 8))
					st64(ca, cb)
					st8(ca + 0x1b0, 2)
					return cc
				}
				bq = ld64(w + 0xfd)
				st64(s3d0 + 0x30, ld64(w + 0xf5))
				st64(s3d0 + 0x20, ld64(w + 0xad))
				bo = ld64(w + 0xa5)
				if ((bh | s) == 0) {
					st64(s3d0 + 0x18, bo)
					const bp = ld64(s378 + 0x18)
					st64(s410 + 0x38, ld8(bp) != 0)
					st64(s418, ld64(bp + 0x69))
					st64(s410, ld64(bp + 0x61))
					st64(s410 + 8, ld64(bp + 0x59))
					st64(s410 + 0x10, ld64(bp + 0x51))
					st64(s410 + 0x28, ld64(bp + 0x49))
					st64(s410 + 0x30, ld64(bp + 0x41))
					st64(s410 + 0x18, ld64(bp + 0x39))
					st64(s410 + 0x20, ld64(bp + 0x31))
					st64(s428, ld64(bp + 0x29))
					st64(s428 + 8, ld64(bp + 0x21))
					st64(s440, ld64(bp + 0x19))
					st64(s440 + 8, ld64(bp + 0x11))
					cn = ld64(bp + 9)
					st64(s440 + 0x10, ld64(bp + 1))
					cf = bq
					break B45
				}
			}
			B35: {
				st64(s3d0 + 0x18, bo)
				const bt = ld64(s378 + 0x18)
				const bw = ld64(bt + 0x19)
				const bu = ld64(bt + 0x11)
				st64(s3d0 + 0x40, bq)
				if ((s != 0 ? 0 > (s as i64) : bh == 0) != 0) {
					let ce = -ld64(s378 + 0x10) > bu
					const cd = ld64(s340) + (ld64(s378 + 0x10) != 0)
					ce = bw != -cd ? -cd > bw : ce
					bz = 0xf
					if ((ce & 1) != 0) {
						break B35
					}
					bv = bu + ld64(s378 + 0x10)
					by = bw + ld64(s340) + (bu > bv)
				} else {
					bv = bu + ld64(s378 + 0x10)
					let bx = bu > bv
					by = bw + ld64(s340) + bx
					bx = by != bw ? bw > by : bx
					bz = 0xe
					if ((bx & 1) != 0) {
						break B35
					}
				}
				st64(s440 + 0x10, 0)
				cn = 0
				st64(s440, 0, 0)
				st64(s428, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
				bg = ld64(s378 + 0x28)
				cf = ld64(s3d0 + 0x40)
				if ((bv | by) == 0) {
					break B45
				}
				if ((bu | bw) != 0) {
					cg = ld64(s378 + 0x18)
					st64(s418, ld64(cg + 0x69))
					st64(s410, ld64(cg + 0x61))
					st64(s410 + 8, ld64(cg + 0x59))
					st64(s410 + 0x10, ld64(cg + 0x51))
					st64(s410 + 0x28, ld64(cg + 0x49))
					st64(s410 + 0x30, ld64(cg + 0x41))
					st64(s410 + 0x18, ld64(cg + 0x39))
					st64(s410 + 0x20, ld64(cg + 0x31))
					ch = ld64(cg + 0x29)
					ci = ld64(cg + 0x21)
				} else {
					ci = 0
					ch = 0
					st64(s418, 0, 0, 0, 0, 0, 0, 0, 0)
					cg = ld64(s378 + 0x18)
					if ((ld64(s378 + 0x20) as i64) >= (ld64(s320 + 8) as i64)) {
						st64(s410 + 0x28, ld64(s220 + 8))
						st64(s410 + 0x30, ld64(s220))
						ci = ld64(s3d0 + 0x18)
						ch = ld64(s3d0 + 0x20)
						st64(s410 + 0x20, ld64(s3d0 + 0x30))
						st64(s410 + 0x18, cf)
						st64(s410 + 0x10, ld64(s3d0 + 0x50))
						copyr(s410, s378, 0x10)
						st64(s418, ld64(s378 + 0x30))
					}
				}
				st64(s428, ch, ci)
				const cj = ld64(cg + 1)
				const ck = ld64(s378 + 0x10)
				const cl = ld64(ld64(s378 + 0x18) + 9)
				const cm = ld64(s340)
				cn = cl + cm + (cj > cj + ck)
				bz = 0x10
				if (((~(cl ^ cm) & (cl ^ cn)) as i64) >= 0) {
					st64(s440 + 0x10, cj + ck)
					st64(s410 + 0x38, 1)
					st64(s440, by, bv)
					bg = ld64(s378 + 0x28)
					cf = ld64(s3d0 + 0x40)
					break B45
				}
			}
			cc = fn_87630(s2d0, bz)
			cb = ld64(s2d0)
			ca = ld64(s340 + 8)
			st64(ca + 8, ld64(s2d0 + 8))
			st64(ca, cb)
			st8(ca + 0x1b0, 2)
			return cc
		}
		st64(s3d0 + 0x40, cf)
		st64(s378 + 0x30, cn)
		st64(s3d0 + 0x38, ad)
		st64(sfe8 + 0x18, ld64(s340))
		st64(sfe8 + 0x10, ld64(s378 + 0x10))
		st64(sfe8, cf, s220)
		const co = ld64(s3d0 + 0x30)
		st64(sff0, co)
		const cp = ld64(s3d0 + 0x20)
		st64(sff8, cp)
		const cq = ld64(s3d0 + 0x18)
		st64(s1000, cq)
		st64(sfe8 + 0x20, 1)
		const cr = ld64(s3d0 + 0x48)
		cc = fn_187a0(s90, cr, bg, ld64(s378 + 0x20), cq, cp, co, cf, s220, ld64(sfe8 + 0x10), ld64(sfe8 + 0x18), 1)
		const cs = ld8(s78 + 0x58)
		if (cs == 2) {
			const ct = ld64(s90 + 8)
			st64(s178 + 8, ct)
			const cu = ld64(s90)
			st64(s178, cu)
			ca = ld64(s340 + 8)
			st64(ca + 8, ct)
			st64(ca, cu)
			st8(ca + 0x1b0, 2)
			return cc
		}
		st64(s448, cs)
		st64(s340 + 0x18, ld64(s340 + 0x18))
		st64(s378 + 8, s178)
		memcpy(s178, s90, 0x70)
		st32(s220 + 0x30, ld32(s78 + 0x59))
		st32(s220 + 0x33, ld32(s78 + 0x5c))
		memcpy(s1e8, ld64(s378 + 8), 0x70)
		st64(sfe8 + 8, co)
		st64(sfe8 + 0x10, ld64(s3d0 + 0x40))
		st64(sff0, cq, cp)
		st64(sff8, ld64(s378 + 0x28))
		st64(s1000, cr)
		const cv = ld64(s378 + 0x20)
		const cw = ld64(s378 + 0x18)
		const cx = ld64(s320 + 8)
		fn_19090(s2f0, cv, cw, cx, cr, ld64(sff8), cq, cp, co, ld64(sfe8 + 0x10))
		const cy = ld64(s340 + 0x10)
		st64(s340 + 0x10, ld64(s2f0))
		st64(s378 + 8, ld64(s2f0 + 8))
		st64(s378, ld64(s2f0 + 0x10))
		st64(s3d0 + 0x50, ld64(s2f0 + 0x18))
		st64(sff0, cy + 0x10d, s220)
		st64(sff8, ld64(s378 + 0x28))
		st64(s1000, cr)
		fn_194c8(s178, cv, cw, cx, cr, ld64(sff8), cy + 0x10d, s220)
		st64(sfe8, ld64(s3d0 + 0x50))
		st64(sfe8 + 8, s178)
		st64(sff0, ld64(s378))
		st64(sff8, ld64(s378 + 8))
		st64(s1000, ld64(s340 + 0x10))
		cc = fn_175c0(s90, ld64(s3d0 + 0x28), ld64(s378 + 0x10), ld64(s340), ld64(s1000), ld64(sff8), ld64(sff0), ld64(sfe8), s178)
		const db = ld64(s90 + 0x10)
		const da = ld64(s90 + 8)
		if (ld64(s90) == 0) {
			memcpy(s108, s78, 0x78)
			let df = 0
			let dg = 0
			const dh = ld64(s3d0 + 0x10)
			const dd = ld64(s3d0 + 8)
			const dc = ld64(s3d0)
			const de = ld64(s410 + 0x38)
			if (ld64(s320) != 0) {
				df = (dc | dd) != 0 ? (da | db) != 0 ? 0 : 2 : (da | db) != 0
				dg = ld8(ld64(s378 + 0x18)) != 0 ? (de as u8) != 0 ? 0 : 2 : (de as u8) != 0
			}
			st64(s320, df, dg)
			st64(s410 + 0x38, de)
			let dm = 0
			let di = 0
			const dj = ld64(s340 + 8)
			if (dh != 0) {
				dm = (dc | dd) != 0 ? (da | db) != 0 ? 0 : 2 : (da | db) != 0
				if (ld8(cr) == 0) {
					di = ld64(s448) != 0
				} else {
					di = ld64(s448) != 0 ? 0 : 2
				}
			}
			st64(s340 + 0x10, di)
			memcpy(dj + 0x10, s220, 0x30)
			memcpy(dj + 0x140, s1e8, 0x70)
			const dl = ld32(s220 + 0x33)
			const dk = ld32(s220 + 0x30)
			st64(dj + 0x48, db)
			st64(dj + 0x40, da)
			st64(dj + 8, ld64(s340 + 0x18))
			st64(dj, ld64(s3d0 + 0x38))
			st32(dj + 0x1b1, dk)
			st32(dj + 0x1b4, dl)
			cc = memcpy(dj + 0x50, s108, 0x78)
			st64(dj + 0x130, ld64(s418))
			st64(dj + 0x128, ld64(s410))
			st64(dj + 0x120, ld64(s410 + 8))
			st64(dj + 0x118, ld64(s410 + 0x10))
			st64(dj + 0x110, ld64(s410 + 0x28))
			st64(dj + 0x108, ld64(s410 + 0x30))
			st64(dj + 0x100, ld64(s410 + 0x18))
			st64(dj + 0xf8, ld64(s410 + 0x20))
			st64(dj + 0xf0, ld64(s428))
			st64(dj + 0xe8, ld64(s428 + 8))
			st64(dj + 0xe0, ld64(s440))
			st64(dj + 0xd8, ld64(s440 + 8))
			st8(dj + 0x1bb, ld64(s340 + 0x10))
			st8(dj + 0x1ba, dm)
			st8(dj + 0x1b9, ld64(s320 + 8))
			st8(dj + 0x1b8, ld64(s320))
			st8(dj + 0x1b0, ld64(s448))
			st8(dj + 0x138, ld64(s410 + 0x38))
			st64(dj + 0xd0, ld64(s378 + 0x30))
			st64(dj + 0xc8, ld64(s440 + 0x10))
			return cc
		}
		const cz = ld64(s340 + 8)
		st64(cz, da, db)
		st8(cz + 0x1b0, 2)
		return cc
	}
	const bn = ld64(s340 + 8)
	st64(bn + 8, z)
	st64(bn, p)
	st8(bn + 0x1b0, 2)
	return cc
}

export function fn_175c0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s100 = fp - 0x100, s120 = fp - 0x120, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s1a8 = fp - 0x1a8, s1b0 = fp - 0x1b0, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0
	let bl, bs, bt: u64
	st64(s1a8, c, d)
	let f = b
	st64(s1a8 + 0x10, a)
	const h = ld64(b + 0x68)
	const g = p6
	st64(s168 + 0x18, g)
	const j = ld64(b + 0x60)
	const i = p5
	st64(s168 + 0x10, i)
	st64(s168 + 0x30, 0)
	st64(s168 + 0x40, p8)
	let o = p7
	let n = p9
	let k = ld64(b + 0x50)
	let m = k
	let l = ld64(b + 0x48)
	st64(s120, b, l, k, l)
	st64(s168 + 0x38, n)
	st64(s168 + 0x28, o)
	st64(s1a8 + 0x18, k)
	if ((i ^ j | g ^ h) != 0 && (l | k) != 0) {
		const p = ld64(s168 + 0x10)
		st64(s168 + 0x30, 0)
		__multi3(s30, m, 0, p - j, 0)
		const q = ld64(s168 + 0x18) - h - (j > p)
		const r = ld64(s120 + 0x18)
		__multi3(s20, q, 0, r, 0)
		__multi3(s10, r, 0, p - j, 0)
		o = ld64(s168 + 0x28)
		l = ld64(s120 + 8)
		m = ld64(s120 + 0x10)
		n = ld64(s168 + 0x38)
		const s = ld64(s10 + 8)
		const t = s + (ld64(s30) + ld64(s20))
		k = ld64(s1a8 + 0x18)
		f = ld64(s120)
		if ((m != 0 & q != 0 | ld64(s30 + 8) != 0 | ld64(s20 + 8) != 0 | s > t) == 0) {
			st64(s168 + 0x30, t)
		}
	}
	B17: {
		B8: {
			const u = l | k
			if (u != 0) {
				const w = ld64(f + 0x80)
				const v = ld64(f + 0x78)
				if ((o ^ v | ld64(s168 + 0x40) ^ w) != 0) {
					__multi3(s60, m, 0, o - v, 0)
					const x = ld64(s168 + 0x40) - w - (v > o)
					const y = ld64(s120 + 0x18)
					__multi3(s50, x, 0, y, 0)
					__multi3(s40, y, 0, o - v, 0)
					l = ld64(s120 + 8)
					m = ld64(s120 + 0x10)
					n = ld64(s168 + 0x38)
					const z = ld64(s40 + 8)
					const aa = z + (ld64(s60) + ld64(s50))
					const ab = (m != 0 & x != 0 | ld64(s60 + 8) != 0 | ld64(s50 + 8) != 0 | z > aa) != 0 ? 0 : aa
					f = ld64(s120)
					st64(s1b0, ld64(f + 0x70) + ld64(s168 + 0x30))
					st64(s1b8, ld64(f + 0x88) + ab)
					break B8
				}
			}
			st64(s1b0, ld64(f + 0x70) + ld64(s168 + 0x30))
			st64(s1b8, ld64(f + 0x88))
			if (u == 0) {
				copyr(s188, n + 0x20, 0x10)
				copyr(s168, n, 0x10)
				copyr(s178, n + 0x10, 0x10)
				bs = ld64(f + 0xd0)
				bt = ld64(f + 0xa0)
				st64(s168 + 0x38, ld64(f + 0xb8))
				break B17
			}
		}
		const af = ld64(f + 0x90)
		const ad = ld64(f + 0x98)
		const ae = ld64(n)
		const ac = ld64(n + 8)
		st64(s168, ae, ac)
		st64(s168 + 0x30, 0)
		st64(s168 + 0x20, 0)
		if ((ae ^ af | ac ^ ad) != 0) {
			const ag = ld64(s168)
			st64(s168 + 0x20, 0)
			__multi3(s90, m, 0, ag - af, 0)
			const ah = ld64(s168 + 8) - ad - (af > ag)
			const ai = ld64(s120 + 0x18)
			__multi3(s80, ah, 0, ai, 0)
			__multi3(s70, ai, 0, ag - af, 0)
			l = ld64(s120 + 8)
			m = ld64(s120 + 0x10)
			o = ld64(s168 + 0x28)
			n = ld64(s168 + 0x38)
			const aj = ld64(s70 + 8)
			const ak = aj + (ld64(s90) + ld64(s80))
			f = ld64(s120)
			if ((m != 0 & ah != 0 | ld64(s90 + 8) != 0 | ld64(s80 + 8) != 0 | aj > ak) == 0) {
				st64(s168 + 0x20, ak)
			}
		}
		const an = ld64(n + 0x10)
		const al = ld64(n + 0x18)
		const am = ld64(f + 0xb0)
		st64(s178 + 8, al)
		const ao = ld64(f + 0xa8)
		st64(s178, an)
		st64(s1c0, ld64(f + 0xa0))
		if ((an ^ ao | al ^ am) != 0) {
			const ap = ld64(s178)
			st64(s168 + 0x30, 0)
			__multi3(sc0, m, 0, ap - ao, 0)
			const aq = ld64(s178 + 8) - am - (ao > ap)
			const ar = ld64(s120 + 0x18)
			__multi3(sb0, aq, 0, ar, 0)
			__multi3(sa0, ar, 0, ap - ao, 0)
			l = ld64(s120 + 8)
			m = ld64(s120 + 0x10)
			n = ld64(s168 + 0x38)
			o = ld64(s168 + 0x28)
			const at = ld64(sa0 + 8)
			const au = at + (ld64(sc0) + ld64(sb0))
			f = ld64(s120)
			if ((m != 0 & aq != 0 | ld64(sc0 + 8) != 0 | ld64(sb0 + 8) != 0 | at > au) == 0) {
				st64(s168 + 0x30, au)
			}
		}
		const ax = ld64(n + 0x20)
		const av = ld64(n + 0x28)
		const aw = ld64(f + 0xc8)
		st64(s188 + 8, av)
		const ay = ld64(f + 0xc0)
		st64(s188, ax)
		let az = ld64(f + 0xb8)
		let bf = 0
		if ((ax ^ ay | av ^ aw) != 0) {
			st64(s168 + 0x38, az)
			const ba = ld64(s188)
			__multi3(sf0, m, 0, ba - ay, 0)
			const bb = ld64(s188 + 8) - aw - (ay > ba)
			const bc = ld64(s120 + 0x18)
			__multi3(se0, bb, 0, bc, 0)
			__multi3(sd0, bc, 0, ba - ay, 0)
			l = ld64(s120 + 8)
			m = ld64(s120 + 0x10)
			o = ld64(s168 + 0x28)
			const bd = ld64(sd0 + 8)
			const be = bd + (ld64(sf0) + ld64(se0))
			f = ld64(s120)
			az = ld64(s168 + 0x38)
			bf = (m != 0 & bb != 0 | ld64(sf0 + 8) != 0 | ld64(se0 + 8) != 0 | bd > be) != 0 ? 0 : be
		}
		bt = ld64(s1c0) + ld64(s168 + 0x20)
		st64(s168 + 0x38, az + ld64(s168 + 0x30))
		bs = ld64(f + 0xd0) + bf
	}
	B24: {
		const bg = ld64(s1a8)
		const bh = ld64(s1a8 + 8)
		if ((bg | bh) != 0) {
			if ((bh != 0 ? 0 > (bh as i64) : bg == 0) != 0) {
				let br = -bg > ld64(s120 + 0x18)
				const bp = bh + (bg != 0)
				const bq = ld64(s120 + 0x10)
				br = bq != -bp ? -bp > bq : br
				bl = 0xf
				if ((br & 1) == 0) {
					l = l + bg
					m = ld64(s1a8 + 0x18) + bh + (ld64(s120 + 0x18) > l)
					st64(s120 + 0x18, l)
					break B24
				}
			} else {
				l = l + bg
				let bi = ld64(s120 + 0x18) > l
				const bj = ld64(s1a8 + 0x18) + bh + bi
				const bk = ld64(s120 + 0x10) > bj
				bi = bj != ld64(s120 + 0x10) ? bk : bi
				bl = 0xe
				if ((bi & 1) == 0) {
					st64(s120 + 0x18, l)
					m = bj
					break B24
				}
			}
			l = fn_87630(s100, bl)
			const bo = ld64(s100)
			const bm = ld64(s1a8 + 0x10)
			st64(bm + 0x10, ld64(s100 + 8))
			st64(bm + 8, bo)
			st64(bm, 1)
			return l
		}
	}
	const bn = ld64(s1a8 + 0x10)
	st64(bn + 0x78, ld64(s188))
	st64(bn + 0x60, ld64(s178))
	st64(bn + 0x48, ld64(s168))
	st64(bn + 0x28, o)
	st64(bn + 0x18, ld64(s168 + 0x10))
	st64(bn + 8, ld64(s120 + 0x18))
	st64(bn + 0x88, bs)
	st64(bn + 0x70, ld64(s168 + 0x38))
	st64(bn + 0x58, bt)
	st64(bn + 0x40, ld64(s1b8))
	st64(bn + 0x38, ld64(s1b0))
	st64(bn + 0x80, ld64(s188 + 8))
	st64(bn + 0x68, ld64(s178 + 8))
	st64(bn + 0x50, ld64(s168 + 8))
	st64(bn + 0x30, ld64(s168 + 0x40))
	st64(bn + 0x20, ld64(s168 + 0x18))
	st64(bn + 0x10, m)
	st64(bn, 0)
	return l
}

export function fn_187a0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30
	let p, s, t, x, y, z, ab, ad, ae, af, ag, ah, ai, aj, ak, ao, ap, aq, ar, at, au: u64
	const g = p11
	let f = p10
	if ((f | g) != 0) {
		ar = c
		at = d
		aq = p8
		ap = p7
		ao = p6
		const an = p5
		au = p12
		const am = p9
		const q = ld64(b + 0x19)
		const o = ld64(b + 0x11)
		if ((g != 0 ? 0 > (g as i64) : f == 0) != 0) {
			const u = f != 0
			if ((q != -(g + u) ? -(g + u) > q : -f > o) != 0) {
				f = fn_87630(s30, 0xf)
				t = ld64(s30)
				st64(a + 8, ld64(s30 + 8))
				st64(a, t)
				st8(a + 0x70, 2)
				return f
			}
			p = o + f
			s = q + g + (o > p)
		} else {
			p = o + f
			let r = o > p
			s = q + g + r
			r = s != q ? q > s : r
			if ((r & 1) != 0) {
				f = fn_87630(s30, 0xe)
				t = ld64(s30)
				st64(a + 8, ld64(s30 + 8))
				st64(a, t)
				st8(a + 0x70, 2)
				return f
			}
		}
		const al = p
		if ((p | s) == 0) {
			st64(a + 0x68, 0)
			st64(a + 0x60, 0)
			st64(a + 0x58, 0)
			st64(a + 0x50, 0)
			st64(a + 0x48, 0)
			st64(a + 0x40, 0)
			st64(a, 0, 0, 0, 0, 0, 0, 0, 0)
			st8(a + 0x70, 0)
			return f
		}
		if ((o | q) != 0) {
			x = ld64(b + 0x69)
			aj = ld64(b + 0x61)
			y = ld64(b + 0x59)
			ai = ld64(b + 0x51)
			at = ld64(b + 0x49)
			ah = ld64(b + 0x41)
			ak = ld64(b + 0x39)
			ag = ld64(b + 0x31)
			ar = ld64(b + 0x29)
			z = ld64(b + 0x21)
		} else {
			z = 0
			const v = ar
			const w = at
			x = 0
			ar = 0
			ag = 0
			ak = 0
			ah = 0
			at = 0
			ai = 0
			y = 0
			aj = 0
			if ((w as i32) >= (v as i32)) {
				x = ld64(am + 0x28)
				aj = ld64(am + 0x20)
				y = ld64(am + 0x18)
				ai = ld64(am + 0x10)
				at = ld64(am + 8)
				ah = ld64(am)
				z = an
				ar = ao
				ag = ap
				ak = aq
			}
		}
		ap = y
		const ac = ld64(b + 9)
		const aa = ld64(b + 1)
		aq = x
		if (au != 0) {
			ae = z
			ad = ac - g - (f > aa)
			ab = aa - f
			af = al
			if (0 > (((ac ^ g) & (ac ^ ad)) as i64)) {
				f = fn_87630(s20, 0x10)
				t = ld64(s20)
				st64(a + 8, ld64(s20 + 8))
				st64(a, t)
				st8(a + 0x70, 2)
				return f
			}
		} else {
			ae = z
			ab = aa + f
			ad = ac + g + (aa > ab)
			af = al
			if (0 > ((~(ac ^ g) & (ac ^ ad)) as i64)) {
				f = fn_87630(s10, 0x10)
				t = ld64(s10)
				st64(a + 8, ld64(s10 + 8))
				st64(a, t)
				st8(a + 0x70, 2)
				return f
			}
		}
		st64(a + 0x60, aj)
		st64(a + 0x50, ai)
		st64(a + 0x40, ah)
		st64(a + 0x30, ag)
		st64(a + 0x20, ae)
		st64(a + 0x10, af)
		st64(a, ab)
		st64(a + 0x68, aq)
		st64(a + 0x58, ap)
		st64(a + 0x48, at)
		st64(a + 0x38, ak)
		st64(a + 0x28, ar)
		st64(a + 0x18, s)
		st64(a + 8, ad)
		st8(a + 0x70, 1)
		return f
	}
	au = ld8(b)
	at = ld64(b + 9)
	ar = ld64(b + 1)
	aq = ld64(b + 0x19)
	ap = ld64(b + 0x11)
	ao = ld64(b + 0x29)
	const n = ld64(b + 0x21)
	const m = ld64(b + 0x39)
	const l = ld64(b + 0x31)
	f = ld64(b + 0x49)
	const k = ld64(b + 0x41)
	const j = ld64(b + 0x59)
	const i = ld64(b + 0x51)
	const h = ld64(b + 0x69)
	st64(a + 0x60, ld64(b + 0x61))
	st64(a + 0x68, h)
	st64(a + 0x50, i, j)
	st64(a + 0x40, k, f)
	st64(a + 0x30, l, m)
	st64(a + 0x20, n, ao)
	st64(a + 0x10, ap, aq)
	st64(a, ar, at)
	st8(a + 0x70, au != 0)
	return f
}

export function fn_19090(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64) {
	const s8 = fp - 0x8, s10 = fp - 0x10, s18 = fp - 0x18, s20 = fp - 0x20, s28 = fp - 0x28, s30 = fp - 0x30, s38 = fp - 0x38
	st64(s38, a)
	const i = p10
	const h = p9
	let g = p8
	const f = p7
	const o = p5
	const j = ld8(c)
	st64(s8, f)
	st64(s20, f)
	st64(s10, g)
	st64(s28, h)
	let t = i
	st64(s18, h)
	if (j != 0) {
		const l = ld64(c + 0x29)
		const k = ld64(c + 0x21)
		if ((d as i32) > (b as i32)) {
			st64(s20, k)
			const n = ld64(c + 0x39)
			const m = ld64(c + 0x31)
			st64(s28, 1)
			if (ld64(s8) >= ld64(s20)) {
				st64(s28, 0)
			}
			t = i - n - (m > h)
			g = ld64(s10) - l - ld64(s28)
			st64(s20, ld64(s8) - ld64(s20))
			st64(s28, ld64(s18) - m)
		} else {
			t = ld64(c + 0x39)
			st64(s28, ld64(c + 0x31))
			st64(s20, k)
			g = l
		}
	}
	st64(s30, i)
	let aa = 0
	let af = 0
	let w = 0
	let u = 0
	if (ld8(o) != 0) {
		const q = ld64(o + 0x29)
		const p = ld64(o + 0x21)
		if ((p6 as i32) > (b as i32)) {
			u = ld64(o + 0x39)
			w = ld64(o + 0x31)
			aa = p
			af = q
		} else {
			const s = ld64(o + 0x31)
			const r = ld64(s18)
			u = ld64(s30) - ld64(o + 0x39) - (s > r)
			af = ld64(s10) - q - (p > ld64(s8))
			aa = ld64(s8) - p
			w = r - s
		}
	}
	const v = ld64(s28)
	const x = v + w
	const y = ld64(s18)
	const z = ld64(s20)
	const ab = z + aa
	const ae = ld64(s30) - (t + u + (v > x)) - (x > y)
	const ag = ab > ld64(s8)
	const ac = ld64(s8)
	const ad = ld64(s38)
	st64(ad + 0x10, y - x)
	st64(ad, ac - ab)
	st64(ad + 0x18, ae)
	st64(ad + 8, ld64(s10) - (g + af + (z > ab)) - ag)
}

export function fn_194c8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64) {
	const s20 = fp - 0x20, s28 = fp - 0x28, s30 = fp - 0x30, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s80 = fp - 0x80, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sb0 = fp - 0xb0
	let af, dv, dx, dy: u64
	st64(s38, b)
	st64(s50, a)
	st64(sa8, ld64(c + 0x69))
	st64(s80, ld64(c + 0x61))
	st64(sb0, ld64(c + 0x59))
	st64(s88, ld64(c + 0x51))
	st64(sa0, ld64(c + 0x49))
	st64(s90, ld64(c + 0x41))
	const h = ld8(c)
	const f = p5
	st64(s98, ld64(f + 0x69))
	st64(s60, ld64(f + 0x61))
	st64(s70, ld64(f + 0x59))
	st64(s68, ld64(f + 0x51))
	st64(s58, ld64(f + 0x49))
	st64(s78, ld64(f + 0x41))
	const i = ld8(f)
	st64(s20, 0, 0, 0, 0)
	const g = p7
	st64(s30, g)
	const j = memcmp(g, s20, 0x20)
	st64(s28, p8)
	st64(s48, p6)
	if (h != 0) {
		if (i != 0) {
			if ((d as i32) > (ld64(s38) as i32)) {
				af = 0
				let cz = 0
				st64(s40, 0)
				let cv = ld64(s58)
				let cr = ld64(s78)
				if ((j as u32) != 0) {
					const cq = ld64(ld64(s28))
					const cw = cr > cq
					const cs = ld64(s48)
					const ct = ld64(s38)
					const cx = ld64(s90)
					if ((ct as i32) >= (cs as i32)) {
						cr = cq - cr
					}
					const cu = ld64(ld64(s28) + 8)
					if ((ct as i32) >= (cs as i32)) {
						cv = cu - cv - cw
					}
					const cy = cq + cr
					cz = cx - cy + cq
					st64(s40, ld64(sa0) - (cu + cv + (cq > cy)) - (cy > cx) + cu + (cx - cy > cz))
				}
				st64(s58, cz)
				st64(s20, 0, 0, 0, 0)
				const da = memcmp(ld64(s30) + 0x80, s20, 0x20)
				dy = 0
				const de = ld64(s38)
				if ((da as u32) != 0) {
					const db = ld64(ld64(s28) + 0x10)
					let dc = ld64(s68)
					const dh = dc > db
					const dd = ld64(s48)
					if ((de as i32) >= (dd as i32)) {
						dc = db - dc
					}
					const df = ld64(ld64(s28) + 0x18)
					let dg = ld64(s70)
					if ((de as i32) >= (dd as i32)) {
						dg = df - dg - dh
					}
					const dj = db + dc
					const di = ld64(s88)
					af = di - dj + db
					dy = ld64(sb0) - (df + dg + (db > dj)) - (dj > di) + df + (di - dj > af)
				}
				st64(s20, 0, 0, 0, 0)
				const dk = memcmp(ld64(s30) + 0x100, s20, 0x20)
				dv = 0
				dx = 0
				if ((dk as u32) != 0) {
					const dl = ld64(s28)
					const dm = ld64(dl + 0x20)
					let dn = ld64(s60)
					const ds = dn > dm
					const dp = ld64(s48)
					let dr = ld64(s98)
					if ((de as i32) >= (dp as i32)) {
						dn = dm - dn
					}
					const dq = ld64(dl + 0x28)
					if ((de as i32) >= (dp as i32)) {
						dr = dq - dr - ds
					}
					const du = dm + dn
					const dt = ld64(s80)
					dv = dt - du + dm
					dx = ld64(sa8) - (dq + dr + (dm > du)) - (du > dt) + dq + (dt - du > dv)
				}
			} else {
				af = 0
				let bx = 0
				st64(s40, 0)
				const bo = ld64(s28)
				let bu = ld64(s58)
				let bq = ld64(s78)
				if ((j as u32) != 0) {
					const bp = ld64(bo)
					const bv = bq > bp
					const bt = ld64(bo + 8)
					const br = ld64(s48)
					const bs = ld64(s38)
					if ((bs as i32) >= (br as i32)) {
						bu = bt - bu - bv
					}
					if ((bs as i32) >= (br as i32)) {
						bq = bp - bq
					}
					const bw = ld64(s90)
					st64(s40, bt - (bu + ld64(sa0) + (bq > bq + bw)) - (bq + bw > bp))
					bx = bp - (bq + bw)
				}
				st64(s58, bx)
				st64(s20, 0, 0, 0, 0)
				const by = memcmp(ld64(s30) + 0x80, s20, 0x20)
				dy = 0
				const cb = ld64(s38)
				if ((by as u32) != 0) {
					const bz = ld64(bo + 0x10)
					const ce = ld64(s68) > bz
					const cc = ld64(bo + 0x18)
					const ca = ld64(s48)
					let cd = ld64(s70)
					if ((cb as i32) >= (ca as i32)) {
						cd = cc - cd - ce
					}
					const cg = ld64(s88)
					if ((cb as i32) >= (ca as i32)) {
						st64(s68, bz - ld64(s68))
					}
					const cf = ld64(s68)
					dy = cc - (cd + ld64(sb0) + (cf > cf + cg)) - (cf + cg > bz)
					af = bz - (cf + cg)
				}
				st64(s20, 0, 0, 0, 0)
				const ch = memcmp(ld64(s30) + 0x100, s20, 0x20)
				dv = 0
				dx = 0
				if ((ch as u32) != 0) {
					const ci = ld64(s28)
					const cj = ld64(ci + 0x20)
					const cn = ld64(s60) > cj
					const cl = ld64(ci + 0x28)
					const ck = ld64(s48)
					let cm = ld64(s98)
					if ((cb as i32) >= (ck as i32)) {
						cm = cl - cm - cn
					}
					if ((cb as i32) >= (ck as i32)) {
						st64(s60, cj - ld64(s60))
					}
					const co = ld64(s60)
					const cp = ld64(s80)
					dx = cl - (cm + ld64(sa8) + (co > co + cp)) - (co + cp > cj)
					dv = cj - (co + cp)
				}
			}
		} else {
			af = 0
			let ax = 0
			st64(s40, 0)
			const au = ld64(s38)
			const ar = ld64(sa0)
			if ((j as u32) != 0) {
				const ao = ld64(s28)
				const aq = ld64(ao + 8)
				const ap = ld64(ao)
				const at = ld64(s90) > ap
				const av = ld64(s90)
				const aw = (d as i32) > (au as i32) ? ap - av : av
				st64(s40, aq - ((d as i32) > (au as i32) ? aq - ar - at : ar) - (aw > ap))
				ax = ap - aw
			}
			st64(s58, ax)
			st64(s20, 0, 0, 0, 0)
			const ay = memcmp(ld64(s30) + 0x80, s20, 0x20)
			dy = 0
			if ((ay as u32) != 0) {
				const az = ld64(s28)
				const bb = ld64(az + 0x18)
				const ba = ld64(az + 0x10)
				const bd = ld64(s88) > ba
				const bc = ld64(sb0)
				const be = ld64(s88)
				const bf = (d as i32) > (au as i32) ? ba - be : be
				dy = bb - ((d as i32) > (au as i32) ? bb - bc - bd : bc) - (bf > ba)
				af = ba - bf
			}
			st64(s20, 0, 0, 0, 0)
			const bg = memcmp(ld64(s30) + 0x100, s20, 0x20)
			dv = 0
			dx = 0
			if ((bg as u32) != 0) {
				const bh = ld64(s28)
				const bj = ld64(bh + 0x28)
				const bi = ld64(bh + 0x20)
				const bl = ld64(s80) > bi
				const bk = ld64(sa8)
				const bm = ld64(s80)
				const bn = (d as i32) > (au as i32) ? bi - bm : bm
				dx = bj - ((d as i32) > (au as i32) ? bj - bk - bl : bk) - (bn > bi)
				dv = bi - bn
			}
		}
	} else {
		st64(s80, i)
		af = 0
		let u = 0
		st64(s40, 0)
		let k = ld64(s28)
		if ((j as u32) != 0) {
			const p = k
			const l = ld64(k)
			let m = ld64(s78)
			const r = m > l
			const n = ld64(s48)
			const o = ld64(s38)
			let q = ld64(s58)
			if ((o as i32) >= (n as i32)) {
				q = ld64(p + 8) - q - r
			}
			if ((o as i32) >= (n as i32)) {
				m = l - m
			}
			const s = ld64(s80)
			const t = s != 0 ? m : 0
			k = p
			u = -t
			st64(s40, -((s != 0 ? q : 0) + (t != 0)))
		}
		st64(s58, u)
		st64(s20, 0, 0, 0, 0)
		const v = memcmp(ld64(s30) + 0x80, s20, 0x20)
		dy = 0
		const z = ld64(s38)
		if ((v as u32) != 0) {
			const w = ld64(k + 0x10)
			let x = ld64(s68)
			const aa = x > w
			const y = ld64(s48)
			if ((z as i32) >= (y as i32)) {
				st64(s70, ld64(k + 0x18) - ld64(s70) - aa)
			}
			if ((z as i32) >= (y as i32)) {
				x = w - x
			}
			const ab = ld64(s80)
			const ac = ld64(s70)
			const ad = ab != 0 ? x : 0
			af = -ad
			dy = -((ab != 0 ? ac : 0) + (ad != 0))
		}
		st64(s20, 0, 0, 0, 0)
		const ae = memcmp(ld64(s30) + 0x100, s20, 0x20)
		dv = 0
		dx = 0
		if ((ae as u32) != 0) {
			st64(s30, af)
			const ag = ld64(s28)
			const ah = ld64(ag + 0x20)
			let ai = ld64(s60)
			const al = ai > ah
			const aj = ld64(s48)
			let ak = ld64(s98)
			if ((z as i32) >= (aj as i32)) {
				ak = ld64(ag + 0x28) - ak - al
			}
			if ((z as i32) >= (aj as i32)) {
				ai = ah - ai
			}
			const am = ld64(s80)
			af = ld64(s30)
			const an = am != 0 ? ai : 0
			dv = -an
			dx = -((am != 0 ? ak : 0) + (an != 0))
		}
	}
	const dw = ld64(s50)
	st64(dw + 0x20, dv)
	st64(dw + 0x10, af)
	st64(dw, ld64(s58))
	st64(dw + 0x28, dx)
	st64(dw + 0x18, dy)
	st64(dw + 8, ld64(s40))
}

export function fn_1aa28(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64): u64 {
	const s10 = fp - 0x10
	const f = p8
	const g = ld64(f + 0x40)
	st64(c + 0x50, ld64(f + 0x48))
	st64(c + 0x48, g)
	const h = ld64(f + 0x50)
	st64(c + 0x68, ld64(f + 0x58))
	st64(c + 0x60, h)
	const i = ld64(f + 0x60)
	st64(c + 0x80, ld64(f + 0x68))
	st64(c + 0x78, i)
	st64(c + 0x70, ld64(f + 0x70))
	st64(c + 0x88, ld64(f + 0x78))
	st64(c + 0xa0, ld64(f + 0x90))
	const j = ld64(f + 0x80)
	st64(c + 0x98, ld64(f + 0x88))
	st64(c + 0x90, j)
	st64(c + 0xb8, ld64(f + 0xa8))
	const k = ld64(f + 0x98)
	st64(c + 0xb0, ld64(f + 0xa0))
	st64(c + 0xa8, k)
	st64(c + 0xd0, ld64(f + 0xc0))
	const l = ld64(f + 0xb0)
	st64(c + 0xc8, ld64(f + 0xb8))
	st64(c + 0xc0, l)
	const m = ld16(b + 0x29)
	const n = p5
	let t = callx(n, s10, d, ld32(c + 0x58), m, f + 0xc8)
	if (ld64(s10) != 3) {
		st64(a + 8, ld64(s10 + 8))
		st64(a, ld64(s10))
		return t
	}
	const u = p9
	const o = p6
	if (o == 0) {
		t = callx(n, s10, d, ld32(c + 0x5c), m, f + 0x140)
		if (ld64(s10) != 3) {
			st64(a + 8, ld64(s10 + 8))
			st64(a, ld64(s10))
			return t
		}
	} else {
		t = callx(ld64(p7 + 0x38), s10, o, ld32(c + 0x5c), m, f + 0x140)
		if (ld64(s10) != 3) {
			st64(a + 8, ld64(s10 + 8))
			st64(a, ld64(s10))
			return t
		}
	}
	const p = ld64(f)
	st64(b + 0x39, ld64(f + 8))
	st64(b + 0x31, p)
	const q = ld64(f + 0x10)
	st64(b + 0x185, ld64(f + 0x18))
	st64(b + 0x17d, q)
	const r = ld64(f + 0x20)
	st64(b + 0x205, ld64(f + 0x28))
	st64(b + 0x1fd, r)
	const s = ld64(f + 0x30)
	st64(b + 0x285, ld64(f + 0x38))
	st64(b + 0x27d, s)
	st64(b + 0x105, u)
	st64(a, 3)
	return t
}

export function fn_1ad88(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, s120 = fp - 0x120, sfe8 = fp - 0xfe8, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let x, ag, ak, al: u64
	let l = a
	const g = p8
	const f = p7
	if ((f | g) != 0) {
		st64(s120, d, c)
		st64(s120 + 0x28, g)
		const i = p6
		const h = p5
		st64(s120 + 0x20, f)
		const j = fn_501e0(s20, h, f)
		st64(s120 + 0x30, ld64(s20 + 8))
		st64(s120 + 0x38, ld64(s20))
		fn_501e0(s30, i, j)
		const k = ld64(s120 + 0x20)
		st64(s120 + 0x18, l)
		const m = ld64(s120 + 0x28)
		st64(s120 + 0x10, 0 > (m as i64) ? -k : k)
		const n = 0 > (m as i64) ? -(m + (k != 0)) : m
		const o = ld64(s30 + 8)
		const r = ld64(s30)
		if ((h as i32) > (b as i32)) {
			const t = ld64(s120 + 0x30)
			st64(sff0, n)
			st64(sff8, ld64(s120 + 0x10))
			st64(s1000, o)
			st64(sfe8, m != 0 ? (m as i64) > 0 : k != 0)
			x = fn_54ae0(s10, ld64(s120 + 0x38), t, r, fp)
			const u = ld32(s10)
			if (u != 2 && u == 0) {
				al = ld64(s10 + 8)
				l = ld64(s120 + 0x18)
				st64(l + 0x10, 0)
				st64(l + 8, al)
				st64(l, 0)
				return x
			}
			x = fn_87630(sd0, ld32(s10 + 4))
			ak = ld64(sd0)
			l = ld64(s120 + 0x18)
			st64(l + 0x10, ld64(sd0 + 8))
			st64(l + 8, ak)
			st64(l, 1)
			return x
		}
		if ((i as i32) > (b as i32)) {
			const q = ld64(s120)
			const p = ld64(s120 + 8)
			let an = ld64(s120 + 0x30)
			st64(sff0, n)
			st64(sff8, ld64(s120 + 0x10))
			st64(s1000, o)
			st64(sfe8, m != 0 ? (m as i64) > 0 : k != 0)
			x = fn_54ae0(s10, p, q, r, fp)
			const s = ld32(s10)
			if (s != 2 && s == 0) {
				ag = 0
				let am = ld64(s120 + 0x38)
				const ap = an != q ? an > q : am > p
				const ao = an != q ? q > an : p > am
				let aq = am
				if (ao == 0) {
					aq = ld64(s120 + 8)
				}
				if (ap == 0) {
					am = ld64(s120 + 8)
				}
				an = ao != 0 ? an : q
				if (ap == 0) {
					st64(s120 + 0x30, q)
				}
				let ar = ld64(s120 + 0x30) ^ an
				al = ld64(s10 + 8)
				let az = 0
				if ((am ^ aq | ar) != 0) {
					const at = am - aq
					st64(s120 + 8, at)
					st64(s120 + 0x38, am)
					__multi3(sa0, n, 0, at, 0)
					const au = ld64(s120 + 0x30) - an - (aq > ld64(s120 + 0x38))
					const av = ld64(s120 + 0x10)
					__multi3(s90, au, 0, av, 0)
					__multi3(s80, av, 0, ld64(s120 + 8), 0)
					const ax = ld64(s120 + 0x28)
					x = ld64(s120 + 0x20)
					const aw = ld64(s80 + 8)
					ag = aw + (ld64(sa0) + ld64(s90))
					ar = 0x1e
					az = 1
					if ((n != 0 & au != 0 | ld64(sa0 + 8) != 0 | ld64(s90 + 8) != 0 | aw > ag) == 0) {
						az = 0
						ar = 0 > (ax as i64)
						if (((ax != 0 ? ar : x == 0) & 1) == 0) {
							const ay = ld64(s80)
							az = ay != 0 & ag == -1
							ar = 0x21
							if (ag != -1 && ay != 0) {
								az = 0
								ag = ag + 1
							}
						}
					}
				}
				l = ld64(s120 + 0x18)
				if ((az as u32) == 0) {
					st64(l + 0x10, ag)
					st64(l + 8, al)
					st64(l, 0)
					return x
				}
				x = fn_87630(sb0, ar)
				ak = ld64(sb0)
				st64(l + 0x10, ld64(sb0 + 8))
				st64(l + 8, ak)
				st64(l, 1)
				return x
			}
			x = fn_87630(sc0, ld32(s10 + 4))
			ak = ld64(sc0)
			l = ld64(s120 + 0x18)
			st64(l + 0x10, ld64(sc0 + 8))
			st64(l + 8, ak)
			st64(l, 1)
			return x
		}
		ag = 0
		let y = ld64(s120 + 0x38) > r
		let v = ld64(s120 + 0x30)
		y = v != o ? v > o : y
		x = r > ld64(s120 + 0x38)
		x = v != o ? o > v : x
		let w = ld64(s120 + 0x38)
		const aa = x != 0 ? w : r
		w = y != 0 ? w : r
		const z = x != 0 ? v : o
		v = y != 0 ? v : o
		let ab = v ^ z
		let aj = 0
		if ((w ^ aa | ab) != 0) {
			st64(s120 + 0x30, v)
			const ac = w - aa
			st64(s120 + 0x38, w)
			__multi3(s60, n, 0, ac, 0)
			const ad = ld64(s120 + 0x30) - z - (aa > ld64(s120 + 0x38))
			const ae = ld64(s120 + 0x10)
			__multi3(s50, ad, 0, ae, 0)
			__multi3(s40, ae, 0, ac, 0)
			const ah = ld64(s120 + 0x28)
			x = ld64(s120 + 0x20)
			const af = ld64(s40 + 8)
			ag = af + (ld64(s60) + ld64(s50))
			ab = 0x1e
			aj = 1
			if ((n != 0 & ad != 0 | ld64(s60 + 8) != 0 | ld64(s50 + 8) != 0 | af > ag) == 0) {
				aj = 0
				ab = 0 > (ah as i64)
				if (((ah != 0 ? ab : x == 0) & 1) == 0) {
					const ai = ld64(s40)
					aj = ai != 0 & ag == -1
					ab = 0x21
					if (ag != -1 && ai != 0) {
						aj = 0
						ag = ag + 1
					}
				}
			}
		}
		l = ld64(s120 + 0x18)
		if ((aj as u32) == 0) {
			st64(l + 0x10, ag)
			st64(l + 8, 0)
			st64(l, 0)
			return x
		}
		x = fn_87630(s70, ab)
		ak = ld64(s70)
		st64(l + 0x10, ld64(s70 + 8))
		st64(l + 8, ak)
		st64(l, 1)
		return x
	}
	x = fn_87630(se0, 0xc)
	ak = ld64(se0)
	st64(l + 0x10, ld64(se0 + 8))
	st64(l + 8, ak)
	st64(l, 1)
	return x
}

export function fn_1ba30(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	let g = fn_5fd40(s20)
	const f = ld64(s20)
	if (f != 2) {
		const k = ld64(s20 + 8)
		st64(a, f, k)
		return g
	}
	const r = p8
	const h = p7
	const s = p6
	g = fn_1bf38(s10, p5, b, c, 0xbe500, g)
	if (ld64(s10) == 3) {
		g = fn_1bf38(s10, h, b, d, 0xbe500, g)
		if (ld64(s10) == 3) {
			if ((s as u8) != 0) {
				if ((s as u8) == 1) {
					if ((ld8(c) & 0xf) != 0xf) {
						st32(a + 8, 0xb)
						st64(a, 2)
						return g
					}
					const l = ld64(c + 0x50)
					if (l + 0x70 > 0x7fffffff) {
						st32(a + 8, 0x13)
						st64(a, 2)
						return g
					}
					if (((l + 0x70) as u32) != (l as u32)) {
						const m = sar((ld32(c + 4) << 0x20) + 0x7000000000, 0x20)
						if ((m as i64) > 0x2800) {
							st32(a + 8, 0x13)
							st64(a, 2)
							return g
						}
						st32(c + 4, m)
						st64(c + 0x50, l + 0x70)
						g = sol_memset(c + l + 0x58, 0, 0x70)
					}
				} else {
					if ((ld8(c) & 0xf) != 0xf) {
						st32(a + 8, 0xb)
						st64(a, 2)
						return g
					}
					const i = ld64(c + 0x50)
					if (i - 0x70 > 0x7fffffff) {
						st32(a + 8, 0x13)
						st64(a, 2)
						return g
					}
					const j = sar((ld32(c + 4) << 0x20) + 0xffffff9000000000, 0x20)
					if ((j as i64) > 0x2800) {
						st32(a + 8, 0x13)
						st64(a, 2)
						return g
					}
					st32(c + 4, j)
					st64(c + 0x50, i - 0x70)
				}
			}
			if ((r as u8) == 0) {
				st64(a, 3)
				return g
			}
			if ((r as u8) == 1) {
				if ((ld8(d) & 0xf) != 0xf) {
					st32(a + 8, 0xb)
					st64(a, 2)
					return 0xb
				}
				const p = ld64(d + 0x50)
				if (p + 0x70 > 0x7fffffff) {
					st32(a + 8, 0x13)
					st64(a, 2)
					return 0x13
				}
				if (((p + 0x70) as u32) == (p as u32)) {
					st64(a, 3)
					return 0x13
				}
				const q = sar((ld32(d + 4) << 0x20) + 0x7000000000, 0x20)
				if ((q as i64) > 0x2800) {
					st32(a + 8, 0x13)
					st64(a, 2)
					return 0x13
				}
				st32(d + 4, q)
				st64(d + 0x50, p + 0x70)
				g = sol_memset(d + p + 0x58, 0, 0x70)
				st64(a, 3)
				return g
			}
			if ((ld8(d) & 0xf) != 0xf) {
				st32(a + 8, 0xb)
				st64(a, 2)
				return 0xb
			}
			const n = ld64(d + 0x50)
			if (n - 0x70 > 0x7fffffff) {
				st32(a + 8, 0x13)
				st64(a, 2)
				return 0x13
			}
			const o = sar((ld32(d + 4) << 0x20) + 0xffffff9000000000, 0x20)
			if ((o as i64) > 0x2800) {
				st32(a + 8, 0x13)
				st64(a, 2)
				return 0x13
			}
			st32(d + 4, o)
			st64(d + 0x50, n - 0x70)
			st64(a, 3)
			return 0x13
		}
		st64(a + 8, ld64(s10 + 8))
		st64(a, ld64(s10))
		return g
	}
	st64(a + 8, ld64(s10 + 8))
	st64(a, ld64(s10))
	return g
}

export function fn_1bf38(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	let g, l: u64
	if ((b as u8) == 0) {
		st64(a, 3)
		return r0
	}
	if ((b as u8) == 1) {
		const i = ld8(c)
		if (0xf0 > i) {
			st64(a + 8, 0xb)
			st64(a, 2)
			return r0
		}
		g = i & 0x7f
		st8(c, g)
		r0 = ld8(d)
		if (r0 > 0xef) {
			st8(d, r0 & 0x7f)
			const j = ld64(c + 0x48)
			if (j >= e) {
				st64(c + 0x48, j - e)
				r0 = ld64(d + 0x48)
				const k = r0 + e
				if (k >= r0) {
					st64(d + 0x48, k)
					st64(a, 3)
					st8(d, ld8(d) | 0x80)
					st8(c, ld8(c) | 0x80)
					return r0
				}
			}
			r0 = fn_87630(s20, 0x41)
			l = ld64(s20)
			st64(a + 8, ld64(s20 + 8))
			st64(a, l)
			st8(d, ld8(d) | 0x80)
			st8(c, ld8(c) | 0x80)
			return r0
		}
		st64(a + 8, 0xb)
		st64(a, 2)
		st8(c, g | 0x80)
		return r0
	}
	const f = ld8(c)
	if (0xf0 > f) {
		st64(a + 8, 0xb)
		st64(a, 2)
		return r0
	}
	g = f & 0x7f
	st8(c, g)
	r0 = ld8(d)
	if (r0 > 0xef) {
		st8(d, r0 & 0x7f)
		const h = ld64(c + 0x48)
		r0 = h > h + e
		if (r0 == 0) {
			st64(c + 0x48, h + e)
			const m = ld64(d + 0x48)
			if (m >= e) {
				st64(d + 0x48, m - e)
				st64(a, 3)
				st8(d, ld8(d) | 0x80)
				st8(c, ld8(c) | 0x80)
				return r0
			}
		}
		r0 = fn_87630(s10, 0x41)
		l = ld64(s10)
		st64(a + 8, ld64(s10 + 8))
		st64(a, l)
		st8(d, ld8(d) | 0x80)
		st8(c, ld8(c) | 0x80)
		return r0
	}
	st64(a + 8, 0xb)
	st64(a, 2)
	st8(c, g | 0x80)
	return r0
}

// name [heur]: its CPI's data and accounts match System Transfer, but the program id is not a constant here (was fn_1c228)
export function cpi_system_transfer(a: u64, b: u64, c: u64, d: u64): u64 {
	const s8 = fp - 0x8, s30 = fp - 0x30, s38 = fp - 0x38, s68 = fp - 0x68, s70 = fp - 0x70, sa0 = fp - 0xa0, sac = fp - 0xac, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0
	let i: u64
	let j = fn_5fd40(se0)
	let f = ld64(se0)
	if (f != 2) {
		i = ld64(se0 + 8)
		st64(a, f, i)
		return j
	}
	j = fn_5fd40(sf0)
	f = ld64(sf0)
	if (f == 2) {
		const g: AccountRecord = ld64(c)
		const h = g.lamports
		if (0x3c5280 > h) {
			if (0x248880 > h) {
				st64(sa0, 0x100159830, 1, s8, 0, 0)
				// fmt "internal error: entered unreachable code: The position account must hold sufficient rent-exempt balance for itself"
				fn_149478(sa0, 0x100159840, undef, undef, g)
			}
			const k: AccountRecord = ld64(b)
			st64(sd0 + 0x10, g.key)
			st64(sd0, k.key)
			st16(sd0 + 0x18, 1)
			st16(sd0 + 8, 0x101)
			st64(sac + 4, 0x3c5280 - h)
			st32(sac, 2)
			const t = ld64(d)
			const s = k.is_signer
			const r = k.is_writable
			const q = k.executable
			const p = g.is_signer
			const o = g.is_writable
			const n = g.executable
			const m = k.data_len
			const l = g.data_len
			st64(s68, g.key, g + 0x48, l, g.data, g.owner)
			st64(sa0, k.key, k + 0x48, m, k.data, k.owner)
			st8(s38, p != 0, o != 0, n != 0)
			st8(s70, s != 0, r != 0, q != 0)
			st64(s68 + 0x28, 0)
			st64(sa0 + 0x28, 0)
			st64(s30, t + 8, sd0, 2, sac, 0xc)
			// CPI program t + 8 (id not a constant, and not compared with a known program id in this function) — data and accounts match System Transfer; if it is System: { from: k.key (w,s), to: g.key (w), lamports: ? }, no signer seeds [exec]
			j = sol_invoke_signed_c(s30, sa0, 2, 8, 0)
			st64(a, 3)
			return j
		}
		st64(a, 3)
		return j
	}
	i = ld64(sf0 + 8)
	st64(a, f, i)
	return j
}

export function fn_1c688(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s10 = fp - 0x10, s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, sd8 = fp - 0xd8, se0 = fp - 0xe0, se8 = fp - 0xe8, sf0 = fp - 0xf0, sf8 = fp - 0xf8, s100 = fp - 0x100, s108 = fp - 0x108, s110 = fp - 0x110, s118 = fp - 0x118, s120 = fp - 0x120, s128 = fp - 0x128, s130 = fp - 0x130, s138 = fp - 0x138, s140 = fp - 0x140, s148 = fp - 0x148, s150 = fp - 0x150, s158 = fp - 0x158, s160 = fp - 0x160, s168 = fp - 0x168, s170 = fp - 0x170, s178 = fp - 0x178, s180 = fp - 0x180, s188 = fp - 0x188, s190 = fp - 0x190, s198 = fp - 0x198, s1a0 = fp - 0x1a0
	let an: u64
	let aq = ld64(s1a0)
	let ar = ld64(s198)
	let at = ld64(s190)
	let au = ld64(s188)
	let av = ld64(s180)
	let aw = ld64(s178)
	let ax = ld64(s170)
	let ay = ld64(s168)
	let az = ld64(s160)
	let ba = ld64(s158)
	let bb = ld64(s150)
	let bc = ld64(s148)
	let bd = ld64(s140)
	let be = ld64(s138)
	let bf = ld64(s130)
	let bg = ld64(s128)
	let bh = ld64(s120)
	let bi = ld64(s118)
	let bj = ld64(s110)
	let bk = ld64(s108)
	let bl = ld64(s100)
	let bm = ld64(sf8)
	let bn = ld64(sf0)
	let bo = ld64(se8)
	let bp = ld64(se0)
	let bq = ld64(sd8)
	let k = a
	let f = ld64(d)
	if (f == 0x8000000000000000) {
		st64(k + 0x120, 0x8000000000000000)
		st64(k + 0x108, 0x8000000000000000)
		st64(k + 0xf0, 0x8000000000000000)
		st64(k + 0xd8, 0x8000000000000000)
		st64(k + 0xc0, 0x8000000000000000)
		st64(k + 0xa8, 0x8000000000000000)
		st64(k + 0x90, 0x8000000000000000)
		st64(k + 0x78, 0x8000000000000000)
		st64(k + 0x60, 0x8000000000000000)
		st64(k + 0x48, 0x8000000000000000)
		st64(k + 0x30, 0x8000000000000000)
		st64(k + 0x18, 0x8000000000000000)
		st64(k, 0x8000000000000000)
		return f
	}
	const cd = b + (c << 3)
	let h = p6
	const ch = p5
	let g = ld64(d + 8)
	let i = g + (ld64(d + 0x10) << 1)
	let l = 0x8000000000000000
	let ce = 0x8000000000000000
	f = 0x8000000000000000
	let cc = 0x8000000000000000
	let cb = 0x8000000000000000
	let ca = 0x8000000000000000
	let bv = 0x8000000000000000
	let bu = 0x8000000000000000
	let bt = 0x8000000000000000
	let bz = 0x8000000000000000
	let by = 0x8000000000000000
	let bx = 0x8000000000000000
	let bw = 0x8000000000000000
	const cg = h
	const cf = i
	L2: while (true) {
		const j = g
		if (g != i) {
			const o = ld8(j)
			let m = ch
			while (true) {
				if (h == 0) {
					f = fn_87630(s38, 0x30)
					const am = ld64(s38)
					st64(k + 0x10, ld64(s38 + 8))
					st64(k + 8, am)
					st64(k, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
					return f
				}
				h = h - 1
				const n = ld8(m)
				m = m + 1
				if (n == o) {
					const p = ld8(j + 1)
					h = cg
					i = cf
					g = j + 2
					if (p == 0) {
						continue L2
					}
					const bs = f
					const q = ld64(0x300000000 /* heap bump-allocator cursor */)
					const r = q != 0 ? q : 0x300008000
					const s = r - (p << 3)
					const ao = l
					const ap = k
					let t = (s > r ? 0 : s) & -8
					g = j + 2
					if (0x300000008 > t) {
						raw_vec_handle_error(8, p << 3, p << 3, 0x300000008, g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, t)
					st64(s18, p)
					let v = 0
					st64(s10, t, 0)
					let x = 0
					f = bs
					const br = b
					while (true) {
						const y = x
						const w = b + v
						if (w == cd) {
							f = fn_87630(s28, 0x31)
							an = ld64(s28)
							st64(ap + 0x10, ld64(s28 + 8))
							st64(ap + 8, an)
							st64(ap, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
							return f
						}
						let u = y
						if (y == ld64(s18)) {
							fn_f1c8(s18, b, f)
							u = y
							g = j + 2
							f = bs
							b = br
							t = ld64(s10)
						}
						x = u + 1
						st64(t + v, w)
						v = v + 8
						st64(s10 + 8, x)
						if ((x as u8) >= p) {
							b = b + v
							const z = ld8(j)
							if ((z as i64) > 5) {
								if ((z as i64) > 8) {
									if ((z as i64) > 0xa) {
										if (z == 0xb) {
											const ak = x
											if (bx != 0x8000000000000000) {
												f = fn_87630(s28, 0x35)
												an = ld64(s28)
												st64(ap + 0x10, ld64(s28 + 8))
												st64(ap + 8, an)
												st64(ap, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
												return f
											}
											bf = ld64(s10)
											bx = ld64(s18)
											ay = ak
										} else {
											const ae = x
											if (bw != 0x8000000000000000) {
												f = fn_87630(s28, 0x35)
												an = ld64(s28)
												st64(ap + 0x10, ld64(s28 + 8))
												st64(ap + 8, an)
												st64(ap, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
												return f
											}
											bd = ld64(s10)
											bw = ld64(s18)
											ax = ae
										}
									} else if (z == 9) {
										const aj = x
										if (bz != 0x8000000000000000) {
											f = fn_87630(s28, 0x35)
											an = ld64(s28)
											st64(ap + 0x10, ld64(s28 + 8))
											st64(ap + 8, an)
											st64(ap, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
											return f
										}
										bj = ld64(s10)
										bz = ld64(s18)
										ba = aj
									} else {
										const ac = x
										if (by != 0x8000000000000000) {
											f = fn_87630(s28, 0x35)
											an = ld64(s28)
											st64(ap + 0x10, ld64(s28 + 8))
											st64(ap + 8, an)
											st64(ap, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
											return f
										}
										bh = ld64(s10)
										by = ld64(s18)
										az = ac
									}
								} else if (z == 6) {
									const af = x
									if (x > 3) {
										f = fn_87630(s28, 0x37)
										an = ld64(s28)
										st64(ap + 0x10, ld64(s28 + 8))
										st64(ap + 8, an)
										st64(ap, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
										return f
									}
									if (bv != 0x8000000000000000) {
										f = fn_87630(s28, 0x35)
										an = ld64(s28)
										st64(ap + 0x10, ld64(s28 + 8))
										st64(ap + 8, an)
										st64(ap, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
										return f
									}
									aw = ld64(s10)
									bv = ld64(s18)
									at = af
								} else if (z == 7) {
									const ai = x
									if (x > 3) {
										f = fn_87630(s28, 0x37)
										an = ld64(s28)
										st64(ap + 0x10, ld64(s28 + 8))
										st64(ap + 8, an)
										st64(ap, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
										return f
									}
									if (bu != 0x8000000000000000) {
										f = fn_87630(s28, 0x35)
										an = ld64(s28)
										st64(ap + 0x10, ld64(s28 + 8))
										st64(ap + 8, an)
										st64(ap, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
										return f
									}
									av = ld64(s10)
									bu = ld64(s18)
									ar = ai
								} else {
									const ab = x
									if (x > 3) {
										f = fn_87630(s28, 0x37)
										an = ld64(s28)
										st64(ap + 0x10, ld64(s28 + 8))
										st64(ap + 8, an)
										st64(ap, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
										return f
									}
									if (bt != 0x8000000000000000) {
										f = fn_87630(s28, 0x35)
										an = ld64(s28)
										st64(ap + 0x10, ld64(s28 + 8))
										st64(ap + 8, an)
										st64(ap, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
										return f
									}
									au = ld64(s10)
									bt = ld64(s18)
									aq = ab
								}
							} else if ((z as i64) > 2) {
								if (z == 3) {
									const ah = x
									if (cc != 0x8000000000000000) {
										f = fn_87630(s28, 0x35)
										an = ld64(s28)
										st64(ap + 0x10, ld64(s28 + 8))
										st64(ap + 8, an)
										st64(ap, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
										return f
									}
									bn = ld64(s10)
									cc = ld64(s18)
									be = ah
								} else if (z == 4) {
									const al = x
									if (cb != 0x8000000000000000) {
										f = fn_87630(s28, 0x35)
										an = ld64(s28)
										st64(ap + 0x10, ld64(s28 + 8))
										st64(ap + 8, an)
										st64(ap, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
										return f
									}
									bm = ld64(s10)
									cb = ld64(s18)
									bc = al
								} else {
									const ad = x
									if (ca != 0x8000000000000000) {
										f = fn_87630(s28, 0x35)
										an = ld64(s28)
										st64(ap + 0x10, ld64(s28 + 8))
										st64(ap + 8, an)
										st64(ap, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
										return f
									}
									bl = ld64(s10)
									ca = ld64(s18)
									bb = ad
								}
							} else {
								if (z == 0) {
									const ag = x
									if (ao == 0x8000000000000000) {
										bq = ld64(s10)
										l = ld64(s18)
										bk = ag
										k = ap
										h = cg
										i = cf
										continue L2
									}
									f = fn_87630(s28, 0x35)
									an = ld64(s28)
									st64(ap + 0x10, ld64(s28 + 8))
									st64(ap + 8, an)
									st64(ap, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
									return f
								}
								const aa = x
								if (z == 1) {
									if (ce != 0x8000000000000000) {
										f = fn_87630(s28, 0x35)
										an = ld64(s28)
										st64(ap + 0x10, ld64(s28 + 8))
										st64(ap + 8, an)
										st64(ap, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
										return f
									}
									bp = ld64(s10)
									ce = ld64(s18)
									bi = aa
								} else {
									if (f != 0x8000000000000000) {
										f = fn_87630(s28, 0x35)
										an = ld64(s28)
										st64(ap + 0x10, ld64(s28 + 8))
										st64(ap + 8, an)
										st64(ap, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
										return f
									}
									bo = ld64(s10)
									f = ld64(s18)
									bg = aa
								}
							}
							k = ap
							l = ao
							h = cg
							i = cf
							continue L2
						}
					}
				}
			}
		}
		st64(k + 0x130, ax)
		st64(k + 0x128, bd)
		st64(k + 0x120, bw)
		st64(k + 0x118, ay)
		st64(k + 0x110, bf)
		st64(k + 0x108, bx)
		st64(k + 0x100, az)
		st64(k + 0xf8, bh)
		st64(k + 0xf0, by)
		st64(k + 0xe8, ba)
		st64(k + 0xe0, bj)
		st64(k + 0xd8, bz)
		st64(k + 0xd0, aq)
		st64(k + 0xc8, au)
		st64(k + 0xc0, bt)
		st64(k + 0xb8, ar)
		st64(k + 0xb0, av)
		st64(k + 0xa8, bu)
		st64(k + 0xa0, at)
		st64(k + 0x98, aw)
		st64(k + 0x90, bv)
		st64(k + 0x88, bb)
		st64(k + 0x80, bl)
		st64(k + 0x78, ca)
		st64(k + 0x70, bc)
		st64(k + 0x68, bm)
		st64(k + 0x60, cb)
		st64(k + 0x58, be)
		st64(k + 0x50, bn)
		st64(k + 0x48, cc)
		st64(k + 0x40, bg)
		st64(k + 0x38, bo)
		st64(k + 0x30, f)
		st64(k + 0x28, bi)
		st64(k + 0x20, bp)
		st64(k + 0x18, ce)
		st64(k + 0x10, bk)
		st64(k + 8, bq)
		st64(k, l)
		return f
	}
}

export function fn_1d488(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30
	let f, g, h: u64
	if (ld8(b + 0x48) == 1 && (memcmp(c + 8, b + 0x4c, 0x20) as u32) == 0) {
		f = memcmp(b + 0x4c, c + 8, 0x20) as u32
		if (f != 0 || ld8(c + 1) == 0) {
			f = fn_87630(s20, 0x13)
			g = ld64(s20)
			if (g != 3) {
				h = ld64(s20 + 8)
				st64(a, g, h)
				return f
			}
		}
		if (ld64(b + 0x79) == 1) {
			st64(a, 3)
			return f
		}
		f = fn_87630(s30, 0x14)
		const i = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, i)
		return f
	}
	f = memcmp(b + 0x20, c + 8, 0x20) as u32
	if (f == 0 && ld8(c + 1) != 0) {
		st64(a, 3)
		return f
	}
	f = fn_87630(s10, 0x13)
	g = ld64(s10)
	if (g == 3) {
		st64(a, 3)
		return f
	}
	h = ld64(s10 + 8)
	st64(a, g, h)
	return f
}

export function fn_1d6c0(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s30 = fp - 0x30, s60 = fp - 0x60, s70 = fp - 0x70
	let h = c
	let f = ld8(b)
	if ((f & 8) == 0) {
		st64(a + 0x10, 0xb)
		st64(a + 8, 2)
		st64(a, 1)
		return r0
	}
	if ((f & 7) != 0) {
		st8(b, f - 1)
		const g = ld64(b + 0x50)
		if (g > 0xa6) {
			const t = h
			const u = f
			let i = 0
			let v = 0
			while (true) {
				r0 = i + 2
				if (g - 0xa6 >= r0) {
					if (i >= 0xfffffffffffffffe) {
						fn_14c690(i, r0, 0x1001598c0, d, e)
					}
					const j = ld16(b + 0xfe + i)
					if (j != 0) {
						e = i + 4
						if (e > g - 0xa6) {
							st64(a + 0x10, 3)
							st64(a + 8, 2)
							st64(a, 1)
							st8(b, u)
							return r0
						}
						if (r0 > e) {
							fn_14c690(r0, e, 0x1001598d8, d, e)
						}
						r0 = ld16(b + 0xfe + r0)
						d = e + r0
						i = e > d ? 0xffffffffffffffff : d
						if (i > g - 0xa6) {
							st64(a + 0x10, 3)
							st64(a + 8, 2)
							st64(a, 1)
							st8(b, u)
							return r0
						}
						if (j == 1) {
							if (r0 != 0x6c) {
								st64(a + 0x10, 3)
								st64(a + 8, 2)
								st64(a, 1)
								st8(b, u)
								return r0
							}
							v = b + 0xfe + e
							if (g - 0xa6 > i) {
								continue
							}
						} else {
							if (j == 8) {
								if (r0 != 1) {
									st64(a + 0x10, 3)
									st64(a + 8, 2)
									st64(a, 1)
									st8(b, u)
									return r0
								}
							} else if (j == 0xe && r0 != 0x40) {
								st64(a + 0x10, 3)
								st64(a + 8, 2)
								st64(a, 1)
								st8(b, u)
								return r0
							}
							if (g - 0xa6 > i) {
								continue
							}
						}
					}
				}
				f = u
				h = t
				if (v == 0) {
					st64(a + 8, h, 0)
					st64(a, 0)
					st8(b, f)
					return r0
				}
				r0 = clock_get_139448(s30)
				if (ld32(s30) != 0) {
					const r = ld32(s30 + 4)
					st32(s60 + 0xe, r)
					st64(s60 + 6, 2)
					const s = ld32(s30 + 8)
					st32(a + 0x10, r, s)
					st64(a + 8, 2)
					st64(a, 1)
					st8(b, ld8(b) + 1)
					return r0
				}
				let m = 0x62
				let n = 0x6a
				const k = v
				let l = ld64(v + 0x5a)
				if (l > ld64(s30 + 0x18)) {
					m = 0x50
					n = 0x58
					l = ld64(k + 0x48)
				}
				const p = ld16(k + n)
				const o = ld64(k + m)
				st64(s60, l, o)
				st16(s60 + 0x10, p)
				st16(s30 + 0x10, p)
				st64(s30, l, o)
				r0 = fn_12db08(s70, s30, h, r0)
				if (ld64(s70) == 0) {
					fn_1490e8(0x100159858)
				}
				const q = ld64(s70 + 8)
				if (h >= q) {
					st64(a + 0x10, q)
					st64(a + 8, h - q)
					st64(a, 0)
					st8(b, ld8(b) + 1)
					return r0
				}
				fn_1490e8(0x100159870)
			}
		}
		st64(a + 8, h, 0)
		st64(a, 0)
		st8(b, f)
		return r0
	}
	st64(a + 0x10, 0xb)
	st64(a + 8, 2)
	st64(a, 1)
	return r0
}

export function fn_1db68(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s30 = fp - 0x30, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0
	let t, v: u64
	let f = c
	if (c != 0) {
		let g = ld8(b)
		if ((g & 8) == 0) {
			st64(a + 0x10, 0xb)
			st64(a + 8, 2)
			st64(a, 1)
			return r0
		}
		if ((g & 7) != 0) {
			st8(b, g - 1)
			const h = ld64(b + 0x50)
			if (h > 0xa6) {
				const w = f
				let x = g
				let i = 0
				let y = 0
				while (true) {
					r0 = i + 2
					if (h - 0xa6 >= r0) {
						if (i >= 0xfffffffffffffffe) {
							fn_14c690(i, r0, 0x1001598c0, d, e)
						}
						const j = ld16(b + 0xfe + i)
						if (j != 0) {
							e = i + 4
							if (e > h - 0xa6) {
								st64(a + 0x10, 3)
								st64(a + 8, 2)
								st64(a, 1)
								st8(b, x)
								return r0
							}
							if (r0 > e) {
								fn_14c690(r0, e, 0x1001598d8, d, e)
							}
							r0 = ld16(b + 0xfe + r0)
							d = e + r0
							i = e > d ? 0xffffffffffffffff : d
							if (i > h - 0xa6) {
								st64(a + 0x10, 3)
								st64(a + 8, 2)
								st64(a, 1)
								st8(b, x)
								return r0
							}
							if (j == 1) {
								if (r0 != 0x6c) {
									st64(a + 0x10, 3)
									st64(a + 8, 2)
									st64(a, 1)
									st8(b, x)
									return r0
								}
								y = b + 0xfe + e
								if (h - 0xa6 > i) {
									continue
								}
							} else {
								if (j == 8) {
									if (r0 != 1) {
										st64(a + 0x10, 3)
										st64(a + 8, 2)
										st64(a, 1)
										st8(b, x)
										return r0
									}
								} else if (j == 0xe && r0 != 0x40) {
									st64(a + 0x10, 3)
									st64(a + 8, 2)
									st64(a, 1)
									st8(b, x)
									return r0
								}
								if (h - 0xa6 > i) {
									continue
								}
							}
						}
					}
					const k = y
					g = x
					f = w
					if (y == 0) {
						st64(a + 8, f, 0)
						st64(a, 0)
						st8(b, g)
						return r0
					}
					x = b
					r0 = clock_get_139448(s30)
					if (ld32(s30) != 0) {
						const q = ld32(s30 + 4)
						st32(s60 + 0xe, q)
						st64(s60 + 6, 2)
						const r = ld32(s30 + 8)
						st32(a + 0x10, q, r)
						st64(a + 8, 2)
						st64(a, 1)
						st8(x, ld8(x) + 1)
						return r0
					}
					let m = 0x62
					let n = 0x6a
					let l = ld64(k + 0x5a)
					if (l > ld64(s30 + 0x18)) {
						m = 0x50
						n = 0x58
						l = ld64(k + 0x48)
					}
					const p = ld16(k + n)
					const o = ld64(k + m)
					st64(s60, l, o)
					st16(s60 + 0x10, p)
					st64(s30, l, o)
					st16(s30 + 0x10, p)
					let s = f
					if (p == 0x2710) {
						t = ld64(s30 + 8)
					} else {
						r0 = fn_12dc70(s70, s30, s, r0)
						if (ld64(s70) == 0) {
							r0 = fn_87630(s80, 0x34)
							v = ld64(s80)
							st64(a + 0x10, ld64(s80 + 8))
							st64(a + 8, v)
							st64(a, 1)
							st8(x, ld8(x) + 1)
							return r0
						}
						t = ld64(s70 + 8)
						s = f
					}
					const u = s + t
					if (s > u) {
						r0 = fn_87630(sb0, 0x34)
						v = ld64(sb0)
						st64(a + 0x10, ld64(sb0 + 8))
						st64(a + 8, v)
						st64(a, 1)
						st8(x, ld8(x) + 1)
						return r0
					}
					r0 = fn_12db08(s90, s30, u, r0)
					if (ld64(s90) == 0) {
						fn_1490e8(0x100159888)
					}
					if (t != ld64(s90 + 8)) {
						r0 = fn_87630(sa0, 0x34)
						v = ld64(sa0)
						st64(a + 0x10, ld64(sa0 + 8))
						st64(a + 8, v)
						st64(a, 1)
						st8(x, ld8(x) + 1)
						return r0
					}
					st64(a + 0x10, t)
					st64(a + 8, u)
					st64(a, 0)
					st8(x, ld8(x) + 1)
					return r0
				}
			}
			st64(a + 8, f, 0)
			st64(a, 0)
			st8(b, g)
			return r0
		}
		st64(a + 0x10, 0xb)
		st64(a + 8, 2)
		st64(a, 1)
		return r0
	}
	st64(a + 0x10, 0)
	st64(a + 8, 0)
	st64(a, 0)
	return r0
}

export function fn_1e190(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s48 = fp - 0x48, s50 = fp - 0x50, s52 = fp - 0x52, s78 = fp - 0x78, s90 = fp - 0x90, sa0 = fp - 0xa0
	let k, l, ah, ai, aj, ak: u64
	let i = a
	let f = ld64(c)
	const g = ld8(f)
	let h = g & 8
	if (h == 0) {
		st64(i + 8, 0xb)
		st64(i, 2)
		return h
	}
	h = g & 7
	if (h != 0) {
		B7: {
			B6: {
				aj = ld64(e - 0xfe0)
				ah = ld64(e - 0xfe8)
				const ag = ld64(e - 0xff0)
				l = ld64(e - 0xff8)
				ak = ld64(e - 0x1000)
				st8(f, g - 1)
				ai = ld8(f + 0x84)
				const j = ld64(f + 0x50)
				if (j > 0xa6) {
					const ad = l
					const ae = i
					let am = 0
					const af = f
					const m = f
					let al = 0
					let n = 0
					while (true) {
						B26: {
							h = n + 2
							if (j - 0xa6 >= h) {
								if (n >= 0xfffffffffffffffe) {
									fn_14c690(n, h, 0x1001598c0, m + 0xfe, e)
								}
								const o = ld16(m + 0xfe + n)
								if (o != 0) {
									e = n + 4
									if (e > j - 0xa6) {
										st64(ae + 8, 3)
										st64(ae, 2)
										st8(af, ld8(af) + 1)
										return h
									}
									if (h > e) {
										fn_14c690(h, e, 0x1001598d8, m + 0xfe, e)
									}
									h = ld16(m + 0xfe + h)
									const p = e + h
									n = e > p ? 0xffffffffffffffff : p
									if (n > j - 0xa6) {
										st64(ae + 8, 3)
										st64(ae, 2)
										st8(af, ld8(af) + 1)
										return h
									}
									if (o == 1) {
										if (h != 0x6c) {
											st64(ae + 8, 3)
											st64(ae, 2)
											st8(af, ld8(af) + 1)
											return h
										}
										am = m + 0xfe + e
										if (j - 0xa6 > n) {
											continue
										}
									} else {
										if (o == 8) {
											if (h != 1) {
												st64(ae + 8, 3)
												st64(ae, 2)
												st8(af, ld8(af) + 1)
												return h
											}
										} else if (o == 0xe) {
											if (h == 0x40) {
												al = m + 0xfe + e
												if (j - 0xa6 > n) {
													continue
												}
												break B26
											}
											st64(ae + 8, 3)
											st64(ae, 2)
											st8(af, ld8(af) + 1)
											return h
										}
										if (j - 0xa6 > n) {
											continue
										}
									}
								}
							}
						}
						f = af
						i = ae
						l = ad
						k = al
						if (am == 0) {
							break
						}
						const ac = b
						const x = c
						h = clock_get_139448(s48)
						if (ld32(s48) != 0) {
							st32(s78 + 8, ld32(s48 + 4))
							st64(s78, 2)
							const ab = ld64(s78 + 2)
							st32(i + 0xc, ld32(s48 + 8))
							st64(i + 2, ab)
							st16(i + 0xa, 0)
							st16(i, 2)
							st8(f, ld8(f) + 1)
							return h
						}
						const q = ld64(s48 + 0x18)
						const r = ld64(am + 0x5a)
						const t = r > q ? 0x50 : 0x62
						const s = r > q ? 0x58 : 0x6a
						const u = ld64(am + t)
						st16(s52, ld16(am + s))
						st64(s48, 0x1001598a0)
						st64(s48 + 0x10, s78)
						st64(s78, s52, fn_14efa0, s50, fn_14f060)
						st64(s50, u)
						st64(s48 + 0x20, 0)
						st64(s48 + 8, 2)
						st64(s48 + 0x18, 2)
						// fmt "TFe: {}, {}" {} = ld16(am + s) [fn_14efa0], {} = u [fn_14f060]
						fn_147e78(s90, s48, am + t, s)
						const v = ld64(s90 + 8)
						const w = ld64(ag)
						st64(s48 + 0x20, ld64(s90 + 0x10))
						st64(s48, w + 8, s78, 0, v)
						// CPI: program *(w + 8) (id not a constant, and not compared with a known program id in this function), 0 accounts, data v[..ld64(s90 + 0x10)], no signer seeds
						sol_invoke_signed_c(s48, 8, 0, 8, 0)
						c = x
						b = ac
						l = ad
						k = al
						if (al == 0) {
							break B7
						}
						break B6
					}
				} else {
					k = 0
				}
				if (k == 0) {
					break B7
				}
			}
			if (!keyeq(k + 0x20, "11111111111111111111111111111111")) {
				if (ld64(ah) == 0x8000000000000000) {
					h = fn_87630(sa0, 0x32)
					const y = ld64(sa0)
					st64(i + 8, ld64(sa0 + 8))
					st64(i, y)
					st8(f, ld8(f) + 1)
					return h
				}
				const aa = ld64(ah + 8)
				const z = ld64(ah + 0x10)
				st8(s48 + 0x40, ai)
				st64(s48, l, d, c, ak, b, aa, z, aj)
				h = cpi_token_transfer_checked_2(s48, 8, 0)
				st64(i, 3)
				st8(f, ld8(f) + 1)
				return h
			}
		}
		st8(s48 + 0x30, ai)
		st64(s48, l, d, c, ak, b, aj)
		h = cpi_token_transfer_checked(s48, 8, 0)
		st64(i, 3)
		st8(f, ld8(f) + 1)
		return h
	}
	st64(i + 8, 0xb)
	st64(i, 2)
	return h
}

export function fn_1e9a8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s60 = fp - 0x60, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sb2 = fp - 0xb2, sd0 = fp - 0xd0, se0 = fp - 0xe0
	let ar, at, aw: u64
	let f = ld64(d)
	let g = ld8(f)
	if ((g & 8) == 0) {
		st64(a + 8, 0xb)
		st64(a, 2)
		return g
	}
	if ((g & 7) != 0) {
		const ax = c
		const ao = ld64(e - 0xfd8)
		const am = ld64(e - 0xfe0)
		const al = ld64(e - 0xfe8)
		const aq = ld64(e - 0xff0)
		let h = ld64(e - 0xff8)
		const ap = ld64(e - 0x1000)
		g = g - 1
		st8(f, g)
		const an = ld8(f + 0x84)
		const i = ld64(f + 0x50)
		const au = d
		const av = h
		if (i > 0xa6) {
			at = 0
			ar = f
			c = f + 0xfe
			aw = 0
			let t = 0
			while (true) {
				B43: {
					g = t + 2
					if (i - 0xa6 >= g) {
						if (t >= 0xfffffffffffffffe) {
							fn_14c690(t, g, 0x1001598c0, d, e)
						}
						const u = ld16(c + t)
						if (u != 0) {
							e = t + 4
							if (e > i - 0xa6) {
								st64(a + 8, 3)
								st64(a, 2)
								st8(ar, ld8(ar) + 1)
								return g
							}
							if (g > e) {
								fn_14c690(g, e, 0x1001598d8, d, e)
							}
							g = ld16(c + g)
							const v = e + g
							t = e > v ? 0xffffffffffffffff : v
							if (t > i - 0xa6) {
								st64(a + 8, 3)
								st64(a, 2)
								st8(ar, ld8(ar) + 1)
								return g
							}
							if (u == 1) {
								if (g != 0x6c) {
									st64(a + 8, 3)
									st64(a, 2)
									st8(ar, ld8(ar) + 1)
									return g
								}
								at = c + e
								if (i - 0xa6 > t) {
									continue
								}
							} else {
								if (u == 8) {
									if (g != 1) {
										st64(a + 8, 3)
										st64(a, 2)
										st8(ar, ld8(ar) + 1)
										return g
									}
								} else if (u == 0xe) {
									if (g == 0x40) {
										aw = c + e
										if (i - 0xa6 > t) {
											continue
										}
										break B43
									}
									st64(a + 8, 3)
									st64(a, 2)
									st8(ar, ld8(ar) + 1)
									return g
								}
								if (i - 0xa6 > t) {
									continue
								}
							}
						}
					}
				}
				f = ar
				h = av
				const w = at
				if (at == 0) {
					break
				}
				g = clock_get_139448(s60)
				if (ld32(s60) != 0) {
					st32(sa8 + 8, ld32(s60 + 4))
					st64(sa8, 2)
					const ad = ld64(sa8 + 2)
					st32(a + 0xc, ld32(s60 + 8))
					st64(a + 2, ad)
					st16(a + 0xa, 0)
					st16(a, 2)
					st8(f, ld8(f) + 1)
					return g
				}
				const x = ld64(s60 + 0x18)
				const y = ld64(w + 0x5a)
				const z = y > x ? 0x58 : 0x6a
				const aa = ld64(w + (y > x ? 0x50 : 0x62))
				st16(sb2, ld16(w + z))
				st64(s60, 0x1001598a0)
				st64(s60 + 0x10, sa8)
				st64(sb0, aa, sb2, fn_14efa0, sb0, fn_14f060)
				st64(s60 + 0x20, 0)
				st64(s60 + 8, 2)
				st64(s60 + 0x18, 2)
				// fmt "TFe: {}, {}" {} = ld16(w + z) [fn_14efa0], {} = aa [fn_14f060]
				fn_147e78(sd0, s60, y, z)
				const ab = ld64(sd0 + 8)
				const ac = ld64(al)
				st64(s60 + 0x20, ld64(sd0 + 0x10))
				st64(s60, ac + 8, sa8, 0, ab)
				// CPI: program *(ac + 8) (id not a constant, and not compared with a known program id in this function), 0 accounts, data ab[..ld64(sd0 + 0x10)], no signer seeds
				g = sol_invoke_signed_c(s60, 8, 0, 8, 0)
				c = undef
				d = undef
				e = undef
				break
			}
		} else {
			aw = 0
		}
		g = fn_224b0(s60, ld64(h), c, d, e, g)
		let n = undef
		const j = ld64(s60 + 8)
		const k = ld64(s60)
		if (ld8(s60 + 0x20) == 2) {
			st64(a + 8, j)
			st64(a, k)
			st8(f, ld8(f) + 1)
			return g
		}
		const s = ld8(s60 + 0x18)
		at = ld64(s60 + 0x10)
		let ah = b
		let af = au
		if (j >= 0xa7) {
			ar = f
			let o = 0
			g = 0
			while (true) {
				B49: {
					const m = g
					if (j - 0xa6 >= g + 2) {
						if (g >= 0xfffffffffffffffe) {
							fn_14c690(g, m + 2, 0x1001598c0, n, o)
						}
						const l = ld16(k + 0xa6 + g)
						if (l != 0) {
							const p = g
							if (g + 4 > j - 0xa6) {
								st64(a + 8, 3)
								st64(a, 2)
								st8(at, ld8(at) + (1 << (s & 7)))
								st8(ar, ld8(ar) + 1)
								return g
							}
							if (m + 2 > p + 4) {
								fn_14c690(m + 2, p + 4, 0x1001598d8, n, o)
							}
							const q = ld16(k + 0xa6 + (m + 2))
							const r = p + 4 + q
							n = p + 4 > r
							g = n != 0 ? 0xffffffffffffffff : r
							if (g > j - 0xa6) {
								st64(a + 8, 3)
								st64(a, 2)
								st8(at, ld8(at) + (1 << (s & 7)))
								st8(ar, ld8(ar) + 1)
								return g
							}
							if (l == 1) {
								if (q != 0x6c) {
									st64(a + 8, 3)
									st64(a, 2)
									st8(at, ld8(at) + (1 << (s & 7)))
									st8(ar, ld8(ar) + 1)
									return g
								}
							} else {
								if (l == 8) {
									if (q != 1) {
										st64(a + 8, 3)
										st64(a, 2)
										st8(at, ld8(at) + (1 << (s & 7)))
										st8(ar, ld8(ar) + 1)
										return g
									}
									o = k + 0xa6 + (p + 4)
									if (j - 0xa6 > g) {
										continue
									}
									break B49
								}
								if (l == 0xe && q != 0x40) {
									st64(a + 8, 3)
									st64(a, 2)
									st8(at, ld8(at) + (1 << (s & 7)))
									st8(ar, ld8(ar) + 1)
									return g
								}
							}
							if (j - 0xa6 > g) {
								continue
							}
						}
					}
				}
				f = ar
				ah = b
				af = au
				if (o == 0) {
					break
				}
				if (ld8(o) != 0) {
					st64(s60, al, 0x100152bf7, 0xd)
					fn_13cc8(s60)
					f = ar
					break
				}
				break
			}
		}
		st8(at, ld8(at) + (1 << (s & 7)))
		const ae = aw
		if (aw != 0 && !keyeq(ae + 0x20, "11111111111111111111111111111111")) {
			const ak = af
			if (ld64(am) == 0x8000000000000000) {
				g = fn_87630(se0, 0x32)
				const ag = ld64(se0)
				st64(a + 8, ld64(se0 + 8))
				st64(a, ag)
				st8(f, ld8(f) + 1)
				return g
			}
			const aj = ld64(am + 8)
			const ai = ld64(am + 0x10)
			st8(sa8 + 0x40, an)
			st64(sa8, aq, ap, ak, av, ax, aj, ai, ao)
			st64(sd0, s60)
			st64(s60 + 0x50, ah + 0x28)
			st64(s60 + 0x40, ah + 0x2b)
			st64(s60 + 0x30, ah + 0xb5)
			st64(s60 + 0x20, ah + 0x65 /* anchor::InstructionFallbackNotFound */)
			st64(s60 + 0x10, ah + 8)
			st64(s60, 0x100152b28)
			st64(sd0 + 8, 6)
			st64(s60 + 0x58, 1)
			st64(s60 + 0x48, 2)
			st64(s60 + 0x38, 0x20)
			st64(s60 + 0x28, 0x20)
			st64(s60 + 0x18, 0x20)
			st64(s60 + 8, 9)
			g = cpi_token_transfer_checked_2(sa8, sd0, 1)
			st64(a, 3)
			st8(f, ld8(f) + 1)
			return g
		}
		st8(sa8 + 0x30, an)
		st64(sa8, aq, ap, af, av, ax, ao)
		st64(sd0, s60)
		st64(s60 + 0x50, ah + 0x28)
		st64(s60 + 0x40, ah + 0x2b)
		st64(s60 + 0x30, ah + 0xb5)
		st64(s60 + 0x20, ah + 0x65 /* anchor::InstructionFallbackNotFound */)
		st64(s60 + 0x10, ah + 8)
		st64(s60, 0x100152b28)
		st64(sd0 + 8, 6)
		st64(s60 + 0x58, 1)
		st64(s60 + 0x48, 2)
		st64(s60 + 0x38, 0x20)
		st64(s60 + 0x28, 0x20)
		st64(s60 + 0x18, 0x20)
		st64(s60 + 8, 9)
		g = cpi_token_transfer_checked(sa8, sd0, 1)
		st64(a, 3)
		st8(f, ld8(f) + 1)
		return g
	}
	st64(a + 8, 0xb)
	st64(a, 2)
	return g
}

export function fn_1f708(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s60 = fp - 0x60, s70 = fp - 0x70, s98 = fp - 0x98
	st64(s98, p6, d, p5, c, p7, s60, 6, 0x100152b28, 9, b + 8, 0x20, b + 0x65 /* anchor::InstructionFallbackNotFound */, 0x20, b + 0xb5, 0x20, b + 0x2b, 2, b + 0x28, 1)
	const f = cpi_token_transfer(s98, s70, 1)
	st64(a, 3)
	return f
}

export function fn_1f868(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s48 = fp - 0x48
	let g, h: u64
	if ((ld64(b + 0x48) | ld64(b + 0x50)) == 0) {
		if (ld32(b + 0x58) == (d as u32) && ld32(b + 0x5c) == (e as u32)) {
			h = fn_87630(s30, 0x3c)
			g = ld64(s30)
			st64(a + 8, ld64(s30 + 8))
			st64(a, g)
			return h
		}
		B16: {
			st64(s40, b, e)
			let f = 0xa
			if (((d - 0x6c4f5) as u32) >= 0xfff27617) {
				st64(s48, c)
				if ((c as u16) == 0) {
					fn_14e1c0(0x100159f48, 0xa, c, 0xfff27617, e)
				}
				const i = fn_151bf8(d as i32, c as u16)
				f = 0xa
				if (((ld64(s40 + 8) - 0x6c4f5) as u32) >= 0xfff27617 && (i as u32) == 0) {
					const j = ld64(s40 + 8)
					const k = fn_151bf8(j as i32, c as u16)
					f = 0xa
					const l = ld64(s48)
					if ((j as i32) > (d as i32)) {
						h = k as u32
						if (h == 0) {
							if ((l as i16) > -1) {
								break B16
							}
							f = 0x36
							const m = 0x6c4f4 % (c as u16)
							if (((m - 0x6c4f4) as u32) == (d as u32) && 0x6c4f4 - m == (ld64(s40 + 8) as u32)) {
								break B16
							}
						}
					}
				}
			}
			h = fn_87630(s20, f)
			const n = ld64(s20)
			if (n != 3) {
				const p = ld64(s20 + 8)
				st64(a, n, p)
				return h
			}
		}
		const o = ld64(s40)
		st32(o + 0x5c, ld64(s40 + 8))
		st32(o + 0x58, d)
		st64(o + 0xc8, 0)
		st64(o + 0xc0, 0)
		st64(o + 0xb0, 0)
		st64(o + 0xa8, 0)
		st64(o + 0x98, 0)
		st64(o + 0x90, 0)
		st64(o + 0x80, 0)
		st64(o + 0x78, 0)
		st64(o + 0x68, 0)
		st64(o + 0x60, 0)
		st64(a, 3)
		return h
	}
	h = fn_87630(s10, 5)
	g = ld64(s10)
	st64(a + 8, ld64(s10 + 8))
	st64(a, g)
	return h
}

export function fn_1fc58(a: u64): u64 {
	return ld32(a + 8)
}

export function fn_1fc68(a: u64): u64 {
	return a + 0xc
}

export function fn_1fc80(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	let o, t: u64
	let g = a
	if (0xfff27617 > ((c - 0x6c4f5) as u32)) {
		t = fn_87630(s20, 9)
		o = ld64(s20)
		st64(g + 8, ld64(s20 + 8))
		st64(g, o)
		return t
	}
	const f = ld32(b + 8)
	if ((f as i32) > (c as i32)) {
		t = fn_87630(s20, 9)
		o = ld64(s20)
		st64(g + 8, ld64(s20 + 8))
		st64(g, o)
		return t
	}
	if ((c as i32) >= (((f as i32) + (d as u16) * 0x58) as i32)) {
		t = fn_87630(s20, 9)
		o = ld64(s20)
		st64(g + 8, ld64(s20 + 8))
		st64(g, o)
		return t
	}
	const aa = g
	const h = sar(c - (f as i32) << 0x20, 0x3f)
	let j = (c - (f as i32) ^ h) - h
	let l = 0x40
	let k = 0
	let i = (d as u16) << 6
	let n = i
	while (true) {
		const p = n << 0x20
		const q = j as u32
		j = j - ((p >> 0x20) > q ? 0 : i)
		const m = ((p >> 0x20) > q ? 0 : l) + k
		l = l >> 1
		n = p >> 0x20 >> 1
		k = m
		i = n
		if ((d as u16) > n) {
			g = aa
			if ((j as u32) == 0) {
				__ashlti3(s10, -1, -1, m & 0x7f, k)
				const s = ld64(b + 0x34)
				const r = ld64(s10 + 8)
				t = (s & ~r) >> 1 & 0x5555555555555555
				const u = (s & ~r) - t
				const v = u >> 2 & 0x3333333333333333
				const w = (u & 0x3333333333333333) + v
				const x = (w + (w >> 4) & 0xf0f0f0f0f0f0f0f) * 0x101010101010101 >> 0x38
				const y = popcount(ld64(b + 0x2c) & ~ld64(s10)) + x
				const z = m - y + y * 0x71
				if (z > 0x26d7) {
					fn_1495b0(z, 0x26d8, 0x1001598f0, x, v)
				}
				if (ld8(b + z + 0x3c) == 0) {
					st64(g + 8, 0x100152ab7)
					st64(g, 3)
					return t
				}
				if (0x2668 > z) {
					st64(g + 8, b + z + 0x3c)
					st64(g, 3)
					return t
				}
				fn_14c5c0(z + 0x71, 0x26d8, 0x100159908, x, v)
			}
			t = fn_87630(s20, 9)
			o = ld64(s20)
			st64(g + 8, ld64(s20 + 8))
			st64(g, o)
			return t
		}
	}
}

export function fn_20138(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s58 = fp - 0x58
	let o, u: u64
	let g = a
	if (0xfff27617 > ((c - 0x6c4f5) as u32)) {
		u = fn_87630(s40, 9)
		o = ld64(s40)
		st64(g + 8, ld64(s40 + 8))
		st64(g, o)
		return u
	}
	const f = ld32(b + 8)
	if ((f as i32) > (c as i32)) {
		u = fn_87630(s40, 9)
		o = ld64(s40)
		st64(g + 8, ld64(s40 + 8))
		st64(g, o)
		return u
	}
	if ((c as i32) >= (((f as i32) + (d as u16) * 0x58) as i32)) {
		u = fn_87630(s40, 9)
		o = ld64(s40)
		st64(g + 8, ld64(s40 + 8))
		st64(g, o)
		return u
	}
	st64(s58 + 0x10, g)
	const h = sar(c - (f as i32) << 0x20, 0x3f)
	let j = (c - (f as i32) ^ h) - h
	let l = 0x40
	let k = 0
	let i = (d as u16) << 6
	let n = i
	while (true) {
		const p = n << 0x20
		const q = j as u32
		j = j - ((p >> 0x20) > q ? 0 : i)
		const m = ((p >> 0x20) > q ? 0 : l) + k
		l = l >> 1
		n = p >> 0x20 >> 1
		k = m
		i = n
		if ((d as u16) > n) {
			g = ld64(s58 + 0x10)
			if ((j as u32) == 0) {
				st64(s58, e, b)
				__ashlti3(s10, -1, -1, m & 0x7f, n)
				const r = ld64(s58 + 8)
				const t = ld64(r + 0x34)
				const s = ld64(s10 + 8)
				u = (t & ~s) >> 1 & 0x5555555555555555
				const v = (t & ~s) - u
				const w = v >> 2 & 0x3333333333333333
				const x = (v & 0x3333333333333333) + w
				const y = (x + (x >> 4) & 0xf0f0f0f0f0f0f0f) * 0x101010101010101 >> 0x38
				const z = popcount(ld64(r + 0x2c) & ~ld64(s10)) + y
				const aa = m - z + z * 0x71
				if (aa > 0x26d7) {
					fn_1495b0(aa, 0x26d8, 0x100159920, y, w)
				}
				let ab = ld64(s58)
				const ad = ld8(ab + 0x70)
				let ac = ld8(r + aa + 0x3c)
				const ae = r + aa + 0x3c
				if (ac == 0) {
					if (ad == 0) {
						st8(ae, 0)
						st64(ld64(s58 + 0x10), 3)
						return u
					}
					if (aa >= 0x2669) {
						fn_1494c8("assertion failed: k <= self.len()", 0x21, 0x100159500, ac, ab)
					}
					u = __ashlti3(s30, 1, 0, m & 0x7f, fn_da98(0x2668 - aa, r + 0x26a4, 0x70, u))
					ac = undef
					st64(r + 0x2c, ld64(r + 0x2c) | ld64(s30))
					st64(r + 0x34, ld64(r + 0x34) | ld64(s30 + 8))
					ab = ld64(s58)
				} else if (ad == 0) {
					if (0x2669 > aa) {
						u = __ashlti3(s20, 1, 0, m & 0x7f, fn_da98(0x70, ae + 0x70, 0x2668 - aa, u))
						const af = ld64(s58 + 8)
						st64(af + 0x2c, ld64(af + 0x2c) & ~ld64(s20))
						st64(af + 0x34, ld64(af + 0x34) & ~ld64(s20 + 8))
						st8(ae, 0)
						st64(ld64(s58 + 0x10), 3)
						return u
					}
					fn_1494c8("assertion failed: mid <= self.len()", 0x23, 0x1001594e8, ac, ab)
				}
				if (0x2668 > aa) {
					st8(ae, 1)
					const ag = ld64(ab)
					st64(ae + 9, ld64(ab + 8))
					st64(ae + 1, ag)
					const ah = ld64(ab + 0x10)
					st64(ae + 0x19, ld64(ab + 0x18))
					st64(ae + 0x11, ah)
					const ai = ld64(ab + 0x20)
					st64(ae + 0x29, ld64(ab + 0x28))
					st64(ae + 0x21, ai)
					const aj = ld64(ab + 0x30)
					st64(ae + 0x39, ld64(ab + 0x38))
					st64(ae + 0x31, aj)
					const ak = ld64(ab + 0x40)
					st64(ae + 0x49, ld64(ab + 0x48))
					st64(ae + 0x41, ak)
					const al = ld64(ab + 0x50)
					st64(ae + 0x59, ld64(ab + 0x58))
					st64(ae + 0x51, al)
					const am = ld64(ab + 0x60)
					st64(ae + 0x69, ld64(ab + 0x68))
					st64(ae + 0x61, am)
					st64(ld64(s58 + 0x10), 3)
					return u
				}
				fn_14c5c0(aa + 0x71, 0x26d8, 0x100159938, ac, ab)
			}
			u = fn_87630(s40, 9)
			o = ld64(s40)
			st64(g + 8, ld64(s40 + 8))
			st64(g, o)
			return u
		}
	}
}

export function fn_20900(a: u64): u64 {
	return ld32(a + 8)
}

export function fn_20910(a: u64): u64 {
	return a + 0x26e4
}

export function fn_20928(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10
	let n, o: u64
	let g = a
	if (0xfff27617 > ((c - 0x6c4f5) as u32)) {
		n = fn_87630(s10, 9)
		o = ld64(s10)
		st64(g + 8, ld64(s10 + 8))
		st64(g, o)
		return n
	}
	const f = ld32(b + 8)
	if ((f as i32) > (c as i32)) {
		n = fn_87630(s10, 9)
		o = ld64(s10)
		st64(g + 8, ld64(s10 + 8))
		st64(g, o)
		return n
	}
	if ((c as i32) >= (((f as i32) + (d as u16) * 0x58) as i32)) {
		n = fn_87630(s10, 9)
		o = ld64(s10)
		st64(g + 8, ld64(s10 + 8))
		st64(g, o)
		return n
	}
	const r = g
	const h = sar(c - (f as i32) << 0x20, 0x3f)
	let j = (c - (f as i32) ^ h) - h
	let l = 0x40
	let k = 0
	let i = (d as u16) << 6
	n = i
	while (true) {
		const p = n << 0x20
		const q = j as u32
		j = j - ((p >> 0x20) > q ? 0 : i)
		const m = ((p >> 0x20) > q ? 0 : l) + k
		l = l >> 1
		n = p >> 0x20 >> 1
		k = m
		i = n
		if ((d as u16) > n) {
			g = r
			if ((j as u32) == 0) {
				if (0x58 > m) {
					st64(g + 8, b + m * 0x71 + 0xc)
					st64(g, 3)
					return n
				}
				fn_1495b0(m, 0x58, 0x100159950, d as u16, l)
			}
			n = fn_87630(s10, 9)
			o = ld64(s10)
			st64(g + 8, ld64(s10 + 8))
			st64(g, o)
			return n
		}
	}
}

export function fn_20bb0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10
	let l, p: u64
	let g = a
	if (0xfff27617 > ((c - 0x6c4f5) as u32)) {
		l = fn_87630(s10, 9)
		p = ld64(s10)
		st64(g + 8, ld64(s10 + 8))
		st64(g, p)
		return l
	}
	const f = ld32(b + 8)
	if ((f as i32) > (c as i32)) {
		l = fn_87630(s10, 9)
		p = ld64(s10)
		st64(g + 8, ld64(s10 + 8))
		st64(g, p)
		return l
	}
	if ((c as i32) >= (((f as i32) + (d as u16) * 0x58) as i32)) {
		l = fn_87630(s10, 9)
		p = ld64(s10)
		st64(g + 8, ld64(s10 + 8))
		st64(g, p)
		return l
	}
	const aa = g
	const h = sar(c - (f as i32) << 0x20, 0x3f)
	let j = (c - (f as i32) ^ h) - h
	l = 0x40
	let k = 0
	let i = (d as u16) << 6
	let n = i
	while (true) {
		const q = n << 0x20
		const r = j as u32
		j = j - ((q >> 0x20) > r ? 0 : i)
		const m = ((q >> 0x20) > r ? 0 : l) + k
		l = l >> 1
		n = q >> 0x20 >> 1
		k = m
		i = n
		if ((d as u16) > n) {
			const o = j << 0x20
			g = aa
			if ((o >> 0x20) == 0) {
				if (0x58 > m) {
					const s = b + m * 0x71
					st8(s + 0xc, ld8(e + 0x70))
					const t = ld64(e)
					st64(s + 0x15, ld64(e + 8))
					st64(s + 0xd, t)
					const u = ld64(e + 0x10)
					st64(s + 0x25, ld64(e + 0x18))
					st64(s + 0x1d, u)
					const v = ld64(e + 0x20)
					st64(s + 0x35, ld64(e + 0x28))
					st64(s + 0x2d, v)
					const w = ld64(e + 0x30)
					st64(s + 0x45, ld64(e + 0x38))
					st64(s + 0x3d, w)
					const x = ld64(e + 0x40)
					st64(s + 0x55, ld64(e + 0x48))
					st64(s + 0x4d, x)
					const y = ld64(e + 0x50)
					st64(s + 0x65, ld64(e + 0x58))
					st64(s + 0x5d, y)
					const z = ld64(e + 0x60)
					st64(s + 0x75, ld64(e + 0x68))
					st64(s + 0x6d, z)
					st64(g, 3)
					return l
				}
				fn_1495b0(m, 0x58, 0x100159968, e, o >> 0x20)
			}
			l = fn_87630(s10, 9)
			p = ld64(s10)
			st64(g + 8, ld64(s10 + 8))
			st64(g, p)
			return l
		}
	}
}

export function fn_20f38(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40
	let f, h, k: u64
	if (ld8(b + 2) != 0) {
		if (ld64(b + 0x28) != 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */) {
			r0 = anchor_error_from(s10, 0xbbf /* anchor::AccountOwnedByWrongProgram */, c, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, e)
			f = ld64(s10)
			st64(a + 0x10, ld64(s10 + 8))
			st64(a + 8, f)
			st64(a, 0)
			return r0
		}
		if (ld64(b + 0x30) != 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */) {
			r0 = anchor_error_from(s10, 0xbbf /* anchor::AccountOwnedByWrongProgram */, c, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, e)
			f = ld64(s10)
			st64(a + 0x10, ld64(s10 + 8))
			st64(a + 8, f)
			st64(a, 0)
			return r0
		}
		if (ld64(b + 0x38) != 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */) {
			r0 = anchor_error_from(s10, 0xbbf /* anchor::AccountOwnedByWrongProgram */, c, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, e)
			f = ld64(s10)
			st64(a + 0x10, ld64(s10 + 8))
			st64(a + 8, f)
			st64(a, 0)
			return r0
		}
		if (ld64(b + 0x40) == 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) {
			const g = ld8(b)
			if ((g & 0xf) != 0xf) {
				st64(a + 0x10, 0xb)
				st64(a + 8, 2)
				st64(a, 0)
				return r0
			}
			B9: {
				st8(b, g & 0xf7)
				h = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
				if (ld64(b + 0x50) >= 8) {
					h = 0xbba /* anchor::AccountDiscriminatorMismatch */
					const j = ld8(b + 0x58)
					if (j == 0x11) {
						if (ld8(b + 0x59) != 0xd8) {
							break B9
						}
						if (ld8(b + 0x5a) != 0xf6) {
							break B9
						}
						if (ld8(b + 0x5b) != 0x8e) {
							break B9
						}
						if (ld8(b + 0x5c) != 0xe1) {
							break B9
						}
						if (ld8(b + 0x5d) != 0xc7) {
							break B9
						}
						if (ld8(b + 0x5e) != 0xda) {
							break B9
						}
						k = 0x1001599f0
						if (ld8(b + 0x5f) != 0x38) {
							break B9
						}
					} else {
						if (j != 0x45) {
							break B9
						}
						if (ld8(b + 0x59) != 0x61) {
							break B9
						}
						if (ld8(b + 0x5a) != 0xbd) {
							break B9
						}
						if (ld8(b + 0x5b) != 0xbe) {
							break B9
						}
						if (ld8(b + 0x5c) != 0x6e) {
							break B9
						}
						if (ld8(b + 0x5d) != 7) {
							break B9
						}
						if (ld8(b + 0x5e) != 0x42) {
							break B9
						}
						k = 0x100159980
						if (ld8(b + 0x5f) != 0xbb) {
							break B9
						}
					}
					const l = ld64(k + 0x20)
					r0 = memcmp(callx(l, b + 0x58, l, c, 0xbba /* anchor::AccountDiscriminatorMismatch */, e), c, 0x20) as u32
					if (r0 == 0) {
						st64(a + 0x10, b)
						st64(a + 8, k)
						st64(a, b + 0x58)
						st8(a + 0x18, 8)
						return r0
					}
					r0 = fn_87630(s20, 0x38)
					const m = ld64(s20)
					st64(a + 0x10, ld64(s20 + 8))
					st64(a + 8, m)
					st64(a, 0)
					st8(b, ld8(b) | 8)
					return r0
				}
			}
			r0 = anchor_error_from(s30, h, c, h, e)
			const i = ld64(s30)
			st64(a + 0x10, ld64(s30 + 8))
			st64(a + 8, i)
			st64(a, 0)
			st8(b, ld8(b) | 8)
			return r0
		}
		r0 = anchor_error_from(s10, 0xbbf /* anchor::AccountOwnedByWrongProgram */, c, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */, e)
		f = ld64(s10)
		st64(a + 0x10, ld64(s10 + 8))
		st64(a + 8, f)
		st64(a, 0)
		return r0
	}
	r0 = anchor_error_from(s40, 0xbbe /* anchor::AccountNotMutable */, c, d, e)
	f = ld64(s40)
	st64(a + 0x10, ld64(s40 + 8))
	st64(a + 8, f)
	st64(a, 0)
	return r0
}

export function fn_21378(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s60 = fp - 0x60
	let j = fn_20f38(s20, b, d, d, e, r0)
	const h = ld64(s18 + 8)
	const g = ld64(s18)
	const f = ld64(s20)
	if (f == 0) {
		st64(a + 0x10, h)
		st64(a + 8, g)
		st64(a, 0)
		return j
	}
	st64(s60, f, g)
	st64(s60 + 0x18, h)
	st64(s60 + 0x10, ld64(s18 + 0x10))
	const i = memcmp(b + 8, c + 8, 0x20)
	let l = undef
	let k = 0
	j = i as u32
	if (j != 0) {
		j = fn_20f38(s20, c, d, undef, undef, j)
		copy(s30, s18, 0x10)
		k = ld64(s20)
		if (k == 0) {
			st64(a + 0x10, ld64(s30 + 8))
			st64(a + 8, ld64(s30))
			st64(a, 0)
			const m = ld64(s60 + 0x18)
			st8(m, ld8(m) | ld64(s60 + 0x10))
			return j
		}
		copy(s40, s30, 0x10)
		l = ld64(s18 + 0x10)
	}
	st64(a + 0x20, k)
	st64(a + 0x18, ld64(s60 + 0x10))
	st64(a + 0x10, ld64(s60 + 0x18))
	st64(a + 8, ld64(s60 + 8))
	st64(a, ld64(s60))
	copy(a + 0x28, s40, 0x10)
	st64(a + 0x38, l)
	return j
}

export function fn_215c0(a: u64, b: u64, c: u64, d: u64): u64 {
	const f = d != 0 ? c as u16 : 0
	const g = ld32(a + 8)
	return (b as i32) >= ((g - f) as i32) & (((c as u16) * 0x58 - f + g) as i32) > (b as i32)
}

export function fn_21678(a: u64, b: u64, c: u64, d: u64): u64 {
	const f = d != 0 ? c as u16 : 0
	const g = ld32(a + 8)
	return (b as i32) >= ((g - f) as i32) & (((c as u16) * 0x58 - f + g) as i32) > (b as i32)
}

export function fn_21730(a: u64, b: u64, c: u64): u64 {
	const f = ld32(a + 8)
	return (b as i32) >= (f as i32) & ((f + (c as u16) * 0x58) as i32) > (b as i32)
}

export function fn_217c8(a: u64, b: u64, c: u64): u64 {
	const f = ld32(a + 8)
	return (b as i32) >= (f as i32) & ((f + (c as u16) * 0x58) as i32) > (b as i32)
}

export function fn_21860(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	let o: u64
	if (0xfff27617 > ((c - 0x6c4f5) as u32)) {
		st64(a + 8, e)
		st64(a, 0)
		return 0
	}
	const f = ld32(b + 8)
	if ((f as i32) > (c as i32)) {
		st64(a + 8, e)
		st64(a, 0)
		return 0
	}
	e = (d as u16) * 0x58
	if ((c as i32) >= (((f as i32) + e) as i32)) {
		st64(a + 8, e)
		st64(a, 0)
		return 0
	}
	const g = sar(c - (f as i32) << 0x20, 0x3f)
	let i = (c - (f as i32) ^ g) - g
	let h = (d as u16) << 6
	if ((d as u16) > h) {
		o = (i as u32) == 0
		st64(a + 8, 0)
		st64(a, o)
		return o
	}
	let k = 0x40
	let j = 0
	let l = h
	while (true) {
		const m = l << 0x20
		const n = i as u32
		i = i - ((m >> 0x20) > n ? 0 : h)
		e = ((m >> 0x20) > n ? 0 : k) + j
		k = k >> 1
		l = m >> 0x20 >> 1
		j = e
		h = l
		if ((d as u16) > l) {
			o = (i as u32) == 0
			st64(a + 8, e)
			st64(a, o)
			return o
		}
	}
}

export function fn_21a60(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	let o: u64
	if (0xfff27617 > ((c - 0x6c4f5) as u32)) {
		st64(a + 8, e)
		st64(a, 0)
		return 0
	}
	const f = ld32(b + 8)
	if ((f as i32) > (c as i32)) {
		st64(a + 8, e)
		st64(a, 0)
		return 0
	}
	e = (d as u16) * 0x58
	if ((c as i32) >= (((f as i32) + e) as i32)) {
		st64(a + 8, e)
		st64(a, 0)
		return 0
	}
	const g = sar(c - (f as i32) << 0x20, 0x3f)
	let i = (c - (f as i32) ^ g) - g
	let h = (d as u16) << 6
	if ((d as u16) > h) {
		o = (i as u32) == 0
		st64(a + 8, 0)
		st64(a, o)
		return o
	}
	let k = 0x40
	let j = 0
	let l = h
	while (true) {
		const m = l << 0x20
		const n = i as u32
		i = i - ((m >> 0x20) > n ? 0 : h)
		e = ((m >> 0x20) > n ? 0 : k) + j
		k = k >> 1
		l = m >> 0x20 >> 1
		j = e
		h = l
		if ((d as u16) > l) {
			o = (i as u32) == 0
			st64(a + 8, e)
			st64(a, o)
			return o
		}
	}
}

export function fn_21c60(a: u64): u64 {
	return -0x6c4f3 > (ld32(a + 8) as i32)
}

export function fn_21c98(a: u64): u64 {
	return -0x6c4f3 > (ld32(a + 8) as i32)
}

export function fn_21cd0(a: u64, b: u64): u64 {
	return ((ld32(a + 8) + (b as u16) * 0x58) as i32) > 0x6c4f4
}

export function fn_21d20(a: u64, b: u64): u64 {
	return ((ld32(a + 8) + (b as u16) * 0x58) as i32) > 0x6c4f4
}

export function fn_21d70(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10
	let g: u64
	if ((d as u16) != 0) {
		const f = ld32(b + 8)
		g = fn_151b50((c - f) as i32, d as u16)
		st64(a + 8, (((((c - f - g * (d as u16)) as i32) as u64) >> 0x1f) + g) as i32)
		st64(a, 3)
		return g
	}
	g = fn_87630(s10, 4)
	const h = ld64(s10)
	st64(a + 8, ld64(s10 + 8))
	st64(a, h)
	return g
}

export function fn_21e70(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10
	let g: u64
	if ((d as u16) != 0) {
		const f = ld32(b + 8)
		g = fn_151b50((c - f) as i32, d as u16)
		st64(a + 8, (((((c - f - g * (d as u16)) as i32) as u64) >> 0x1f) + g) as i32)
		st64(a, 3)
		return g
	}
	g = fn_87630(s10, 4)
	const h = ld64(s10)
	st64(a + 8, ld64(s10 + 8))
	st64(a, h)
	return g
}

export function fn_21f70(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	let f, g: u64
	if (ld64(b + 0x28) != 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */) {
		g = anchor_error_from(s10, 0xbbf /* anchor::AccountOwnedByWrongProgram */, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, d, e)
		f = ld64(s10)
		st64(a + 0x10, ld64(s10 + 8))
		st64(a + 8, f)
		st64(a, 0)
		return g
	}
	if (ld64(b + 0x30) != 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */) {
		g = anchor_error_from(s10, 0xbbf /* anchor::AccountOwnedByWrongProgram */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, d, e)
		f = ld64(s10)
		st64(a + 0x10, ld64(s10 + 8))
		st64(a + 8, f)
		st64(a, 0)
		return g
	}
	if (ld64(b + 0x38) != 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */) {
		g = anchor_error_from(s10, 0xbbf /* anchor::AccountOwnedByWrongProgram */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, d, e)
		f = ld64(s10)
		st64(a + 0x10, ld64(s10 + 8))
		st64(a + 8, f)
		st64(a, 0)
		return g
	}
	if (ld64(b + 0x40) == 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) {
		let j = 0
		let h = ld8(b)
		g = h & 8
		if (g == 0) {
			st32(a + 0x14, 0)
			st32(a + 0x10, 0xb)
			st64(a + 8, 2)
			st64(a, 0)
			return g
		}
		g = h & 7
		if (g == 0) {
			st32(a + 0x14, 0)
			st32(a + 0x10, 0xb)
			st64(a + 8, 2)
			st64(a, 0)
			return g
		}
		B11: {
			st8(b, h - 1)
			let k = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
			let i = ld64(b + 0x50)
			if (i >= 8) {
				k = 0xbba /* anchor::AccountDiscriminatorMismatch */
				i = ld64(b + 0x58)
				j = 0xd0f7407ae48fbcaa /* account:Position */
				if (i == 0xd0f7407ae48fbcaa /* account:Position */) {
					st8(b, h)
					break B11
				}
			}
			g = anchor_error_from(s20, k, k, i, j)
			h = ld8(b) + 1
			const m = ld64(s20)
			const l = ld64(s20 + 8)
			st8(b, h)
			j = l >> 0x20
			if (m != 3) {
				st32(a + 0x14, j)
				st32(a + 0x10, l)
				st64(a + 8, m)
				st64(a, 0)
				return g
			}
		}
		if ((h & 0xf) != 0xf) {
			st64(a + 0x10, 0xb)
			st64(a + 8, 2)
			st64(a, 0)
			return g
		}
		st8(b, h & 0xf7)
		st8(a + 0x10, 8)
		st64(a + 8, b)
		st64(a, b + 0x58)
		return g
	}
	g = anchor_error_from(s10, 0xbbf /* anchor::AccountOwnedByWrongProgram */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */, d, e)
	f = ld64(s10)
	st64(a + 0x10, ld64(s10 + 8))
	st64(a + 8, f)
	st64(a, 0)
	return g
}

export function fn_22210(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	let f, g: u64
	if (ld64(b + 0x28) != 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */) {
		g = anchor_error_from(s10, 0xbbf /* anchor::AccountOwnedByWrongProgram */, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, d, e)
		f = ld64(s10)
		st64(a + 0x10, ld64(s10 + 8))
		st64(a + 8, f)
		st64(a, 0)
		return g
	}
	if (ld64(b + 0x30) != 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */) {
		g = anchor_error_from(s10, 0xbbf /* anchor::AccountOwnedByWrongProgram */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, d, e)
		f = ld64(s10)
		st64(a + 0x10, ld64(s10 + 8))
		st64(a + 8, f)
		st64(a, 0)
		return g
	}
	if (ld64(b + 0x38) != 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */) {
		g = anchor_error_from(s10, 0xbbf /* anchor::AccountOwnedByWrongProgram */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, d, e)
		f = ld64(s10)
		st64(a + 0x10, ld64(s10 + 8))
		st64(a + 8, f)
		st64(a, 0)
		return g
	}
	if (ld64(b + 0x40) == 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) {
		let j = 0
		let h = ld8(b)
		g = h & 8
		if (g == 0) {
			st32(a + 0x14, 0)
			st32(a + 0x10, 0xb)
			st64(a + 8, 2)
			st64(a, 0)
			return g
		}
		g = h & 7
		if (g == 0) {
			st32(a + 0x14, 0)
			st32(a + 0x10, 0xb)
			st64(a + 8, 2)
			st64(a, 0)
			return g
		}
		B11: {
			st8(b, h - 1)
			let k = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
			let i = ld64(b + 0x50)
			if (i >= 8) {
				k = 0xbba /* anchor::AccountDiscriminatorMismatch */
				i = ld64(b + 0x58)
				j = 0x96380e10cd1953f /* account:Whirlpool */
				if (i == 0x96380e10cd1953f /* account:Whirlpool */) {
					st8(b, h)
					break B11
				}
			}
			g = anchor_error_from(s20, k, k, i, j)
			h = ld8(b) + 1
			const m = ld64(s20)
			const l = ld64(s20 + 8)
			st8(b, h)
			j = l >> 0x20
			if (m != 3) {
				st32(a + 0x14, j)
				st32(a + 0x10, l)
				st64(a + 8, m)
				st64(a, 0)
				return g
			}
		}
		if ((h & 0xf) != 0xf) {
			st64(a + 0x10, 0xb)
			st64(a + 8, 2)
			st64(a, 0)
			return g
		}
		st8(b, h & 0xf7)
		st8(a + 0x10, 8)
		st64(a + 8, b)
		st64(a, b + 0x58)
		return g
	}
	g = anchor_error_from(s10, 0xbbf /* anchor::AccountOwnedByWrongProgram */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */, d, e)
	f = ld64(s10)
	st64(a + 0x10, ld64(s10 + 8))
	st64(a + 8, f)
	st64(a, 0)
	return g
}

export function fn_224b0(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60
	let g, i, l: u64
	const f = ld8(b + 0x47)
	if (f == 0xa9) {
		if (ld64(b + 0x28) != 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */) {
			r0 = anchor_error_from(s20, 0xbbf /* anchor::AccountOwnedByWrongProgram */, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, d, e)
			i = ld64(s20)
			st64(a + 8, ld64(s20 + 8))
			st64(a, i)
			st8(a + 0x20, 2)
			return r0
		}
		if (ld64(b + 0x30) != 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */) {
			r0 = anchor_error_from(s20, 0xbbf /* anchor::AccountOwnedByWrongProgram */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, d, e)
			i = ld64(s20)
			st64(a + 8, ld64(s20 + 8))
			st64(a, i)
			st8(a + 0x20, 2)
			return r0
		}
		if (ld64(b + 0x38) != 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */) {
			r0 = anchor_error_from(s20, 0xbbf /* anchor::AccountOwnedByWrongProgram */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, d, e)
			i = ld64(s20)
			st64(a + 8, ld64(s20 + 8))
			st64(a, i)
			st8(a + 0x20, 2)
			return r0
		}
		l = 0
		g = ld64(b + 0x40)
		if (g != 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) {
			r0 = anchor_error_from(s20, 0xbbf /* anchor::AccountOwnedByWrongProgram */, g, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */, e)
			i = ld64(s20)
			st64(a + 8, ld64(s20 + 8))
			st64(a, i)
			st8(a + 0x20, 2)
			return r0
		}
	} else {
		if (f != 0xfc) {
			r0 = anchor_error_from(s60, 0xbbf /* anchor::AccountOwnedByWrongProgram */, c, d, e)
			i = ld64(s60)
			st64(a + 8, ld64(s60 + 8))
			st64(a, i)
			st8(a + 0x20, 2)
			return r0
		}
		if (ld64(b + 0x28) != 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */) {
			r0 = anchor_error_from(s10, 0xbbf /* anchor::AccountOwnedByWrongProgram */, 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */, d, e)
			i = ld64(s10)
			st64(a + 8, ld64(s10 + 8))
			st64(a, i)
			st8(a + 0x20, 2)
			return r0
		}
		if (ld64(b + 0x30) != 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */) {
			r0 = anchor_error_from(s10, 0xbbf /* anchor::AccountOwnedByWrongProgram */, 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */, d, e)
			i = ld64(s10)
			st64(a + 8, ld64(s10 + 8))
			st64(a, i)
			st8(a + 0x20, 2)
			return r0
		}
		if (ld64(b + 0x38) != 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */) {
			r0 = anchor_error_from(s10, 0xbbf /* anchor::AccountOwnedByWrongProgram */, 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */, d, e)
			i = ld64(s10)
			st64(a + 8, ld64(s10 + 8))
			st64(a, i)
			st8(a + 0x20, 2)
			return r0
		}
		l = 1
		g = ld64(b + 0x40)
		if (g != 0xfc8ba1d828f9bdfe /* TOKEN_2022_PROGRAM[3] */) {
			r0 = anchor_error_from(s10, 0xbbf /* anchor::AccountOwnedByWrongProgram */, g, 0xfc8ba1d828f9bdfe /* TOKEN_2022_PROGRAM[3] */, e)
			i = ld64(s10)
			st64(a + 8, ld64(s10 + 8))
			st64(a, i)
			st8(a + 0x20, 2)
			return r0
		}
	}
	const h = ld64(b + 0x50)
	if (h == 0x163) {
		r0 = anchor_error_from(s50, 0xbba /* anchor::AccountDiscriminatorMismatch */, g, h, e)
		i = ld64(s50)
		st64(a + 8, ld64(s50 + 8))
		st64(a, i)
		st8(a + 0x20, 2)
		return r0
	}
	if (0x6d > h) {
		r0 = anchor_error_from(s40, 0xbc4 /* anchor::AccountNotInitialized */, g, h, e)
		i = ld64(s40)
		st64(a + 8, ld64(s40 + 8))
		st64(a, i)
		st8(a + 0x20, 2)
		return r0
	}
	const j = ld8(b)
	if ((j & 8) == 0) {
		st8(a + 0x20, 2)
		st64(a + 8, 0xb)
		st64(a, 2)
		return r0
	}
	if ((j & 7) == 0) {
		st8(a + 0x20, 2)
		st64(a + 8, 0xb)
		st64(a, 2)
		return r0
	}
	st8(b, j - 1)
	let m = 0xbc4 /* anchor::AccountNotInitialized */
	let k = ld8(b + 0xc4)
	if (k != 0) {
		k = b + 0x58
		if (h == 0xa5) {
			st8(a + 0x20, l)
			st64(a + 0x10, b)
			st64(a, k)
			st8(a + 0x18, 0)
			st64(a + 8, 0xa5)
			return r0
		}
		m = 0xbba /* anchor::AccountDiscriminatorMismatch */
		if (h >= 0xa6) {
			r0 = ld8(b + 0xfd)
			if (r0 == 2) {
				st8(a + 0x20, l)
				st64(a + 0x10, b)
				st64(a + 8, h)
				st64(a, k)
				st8(a + 0x18, 0)
				return r0
			}
		}
	}
	r0 = anchor_error_from(s30, m, m, h, k)
	const n = ld64(s30)
	st64(a + 8, ld64(s30 + 8))
	st64(a, n)
	st8(a + 0x20, 2)
	st8(b, ld8(b) + 1)
	return r0
}

export function fn_228d8(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s10 = fp - 0x10
	let g: u64
	let f = ld64(b)
	if (f != ld64(c)) {
		r0 = anchor_error_from(s10, 0x7dc /* anchor::ConstraintAddress */, c, f, e)
		g = ld64(s10)
		st64(a + 8, ld64(s10 + 8))
		st64(a, g)
		return r0
	}
	f = ld64(b + 8)
	if (f != ld64(c + 8)) {
		r0 = anchor_error_from(s10, 0x7dc /* anchor::ConstraintAddress */, c, f, e)
		g = ld64(s10)
		st64(a + 8, ld64(s10 + 8))
		st64(a, g)
		return r0
	}
	f = ld64(b + 0x10)
	if (memeq(b + 0x10, c + 0x10, 0x10)) {
		st64(a, 3)
		return r0
	}
	r0 = anchor_error_from(s10, 0x7dc /* anchor::ConstraintAddress */, c, f, e)
	g = ld64(s10)
	st64(a + 8, ld64(s10 + 8))
	st64(a, g)
	return r0
}

export function fn_22998(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s370 = fp - 0x370, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s560 = fp - 0x560, s570 = fp - 0x570, s580 = fp - 0x580, s590 = fp - 0x590, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s708 = fp - 0x708, s730 = fp - 0x730, s790 = fp - 0x790, s7b8 = fp - 0x7b8, s7c0 = fp - 0x7c0, s7c8 = fp - 0x7c8, s7d0 = fp - 0x7d0, s7d8 = fp - 0x7d8, s7e0 = fp - 0x7e0, s7e8 = fp - 0x7e8, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let h, i, j, m, p, q, r, s, aa, ab, ac, ad, ae, af, ag, ah, ak, am, bo, bv: u64
	if (e > 7) {
		let f = e - 8
		if (0x10 > f) {
			j = fn_13b4d0(s6f0, fn_1459d0(0x100159468))
			i = ld64(s6f0)
			st64(a + 8, ld64(s6f0 + 8))
			st64(a, i)
			return j
		}
		const g = f
		if ((f & -8) == 0x10) {
			j = fn_13b4d0(s6f0, fn_1459d0(0x100159468))
			i = ld64(s6f0)
			st64(a + 8, ld64(s6f0 + 8))
			st64(a, i)
			return j
		}
		if ((g & -8) == 0x18) {
			j = fn_13b4d0(s6f0, fn_1459d0(0x100159468))
			i = ld64(s6f0)
			st64(a + 8, ld64(s6f0 + 8))
			st64(a, i)
			return j
		}
		if (f == 0x20) {
			copyr(s708, d + 8, 0x10)
			st64(s730 + 0x18, ld64(d + 0x18))
			let l = 1
			st64(s730 + 0x20, ld64(d + 0x20))
			let k = b
			st64(s708 + 0x10, b)
			if (c == 0) {
				j = anchor_error_from(s540, 0xbbd /* anchor::AccountNotEnoughKeys */, k, d, f)
				d = undef
				f = undef
				b = ld64(s708 + 0x10)
				l = 0
				k = ld64(s540 + 8)
				i = ld64(s540)
				if (i != 3) {
					st64(a + 8, k)
					st64(a, i)
					return j
				}
			}
			if (ld8(ld64(k) + 2) == 0) {
				j = anchor_error_from(s550, 0xbbe /* anchor::AccountNotMutable */, k, d, f)
				d = undef
				f = undef
				b = ld64(s708 + 0x10)
				k = ld64(s550 + 8)
				i = ld64(s550)
				if (i != 3) {
					st64(a + 8, k)
					st64(a, i)
					return j
				}
			}
			st64(s730 + 0x10, k)
			if (l >= c) {
				j = anchor_error_from(s560, 0xbbd /* anchor::AccountNotEnoughKeys */, k, d, f)
				d = undef
				f = undef
				m = ld64(s560 + 8)
				i = ld64(s560)
				if (i != 3) {
					st64(a + 8, m)
					st64(a, i)
					return j
				}
			} else {
				m = b + (l << 3)
				l = l + 1
			}
			B20: {
				const n = ld64(m)
				k = 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */
				if (ld64(n + 8) == 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */) {
					k = 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */
					if (ld64(n + 0x10) == 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */) {
						k = 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */
						if (ld64(n + 0x18) == 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */ && ld64(n + 0x20) == 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) {
							break B20
						}
					}
				}
				j = anchor_error_from(s570, 0xbc0 /* anchor::InvalidProgramId */, k, d, f)
				k = undef
				d = undef
				f = undef
				m = ld64(s570 + 8)
				i = ld64(s570)
				if (i != 3) {
					st64(a + 8, m)
					st64(a, i)
					return j
				}
			}
			B23: {
				let o = 0xbbd /* anchor::AccountNotEnoughKeys */
				if (c > l) {
					k = ld64(s708 + 0x10) + (l << 3)
					o = 0xbc2 /* anchor::AccountNotSigner */
					l = l + 1
					if (ld8(ld64(k) + 1) != 0) {
						break B23
					}
				}
				j = anchor_error_from(s580, o, k, d, f)
				d = undef
				f = undef
				k = ld64(s580 + 8)
				i = ld64(s580)
				if (i != 3) {
					st64(a + 8, k)
					st64(a, i)
					return j
				}
			}
			st64(s730, m, k)
			if (l >= c) {
				j = anchor_error_from(s590, 0xbbd /* anchor::AccountNotEnoughKeys */, k, d, f)
				k = undef
				d = undef
				f = undef
				r = ld64(s590 + 8)
				q = ld64(s590)
				p = ld64(s708 + 0x10)
				if (q != 3) {
					st64(a + 8, r)
					st64(a, q)
					return j
				}
			} else {
				p = ld64(s708 + 0x10)
				r = p + (l << 3)
				l = l + 1
			}
			if (ld8(ld64(r) + 2) == 0) {
				j = anchor_error_from(s5a0, 0xbbe /* anchor::AccountNotMutable */, k, d, f)
				k = undef
				d = undef
				f = undef
				p = ld64(s708 + 0x10)
				r = ld64(s5a0 + 8)
				q = ld64(s5a0)
				if (q != 3) {
					st64(a + 8, r)
					st64(a, q)
					return j
				}
			}
			if (l >= c) {
				j = anchor_error_from(s5b0, 0xbbd /* anchor::AccountNotEnoughKeys */, k, d, f)
				d = undef
				f = undef
				p = ld64(s708 + 0x10)
				s = ld64(s5b0 + 8)
				q = ld64(s5b0)
				if (q != 3) {
					st64(a + 8, s)
					st64(a, q)
					return j
				}
			} else {
				s = p + (l << 3)
				l = l + 1
			}
			st64(s790 + 0x58, s)
			if (l >= c) {
				j = anchor_error_from(s5c0, 0xbbd /* anchor::AccountNotEnoughKeys */, s, d, f)
				d = undef
				f = undef
				p = ld64(s708 + 0x10)
				s = ld64(s5c0 + 8)
				q = ld64(s5c0)
				if (q != 3) {
					st64(a + 8, s)
					st64(a, q)
					return j
				}
			} else {
				s = p + (l << 3)
				l = l + 1
			}
			if (ld8(ld64(s) + 2) == 0) {
				j = anchor_error_from(s5d0, 0xbbe /* anchor::AccountNotMutable */, s, d, f)
				d = undef
				f = undef
				p = ld64(s708 + 0x10)
				s = ld64(s5d0 + 8)
				q = ld64(s5d0)
				if (q != 3) {
					st64(a + 8, s)
					st64(a, q)
					return j
				}
			}
			st64(s790 + 0x50, s)
			if (l >= c) {
				j = anchor_error_from(s5e0, 0xbbd /* anchor::AccountNotEnoughKeys */, s, d, f)
				d = undef
				f = undef
				p = ld64(s708 + 0x10)
				s = ld64(s5e0 + 8)
				q = ld64(s5e0)
				if (q != 3) {
					st64(a + 8, s)
					st64(a, q)
					return j
				}
			} else {
				s = p + (l << 3)
				l = l + 1
			}
			if (ld8(ld64(s) + 2) == 0) {
				j = anchor_error_from(s5f0, 0xbbe /* anchor::AccountNotMutable */, s, d, f)
				d = undef
				f = undef
				p = ld64(s708 + 0x10)
				s = ld64(s5f0 + 8)
				q = ld64(s5f0)
				if (q != 3) {
					st64(a + 8, s)
					st64(a, q)
					return j
				}
			}
			st64(s790 + 0x48, s)
			if (l >= c) {
				j = anchor_error_from(s600, 0xbbd /* anchor::AccountNotEnoughKeys */, s, d, f)
				d = undef
				f = undef
				k = ld64(s600 + 8)
				i = ld64(s600)
				if (i != 3) {
					st64(a + 8, k)
					st64(a, i)
					return j
				}
			} else {
				k = p + (l << 3)
				l = l + 1
			}
			if (ld8(ld64(k) + 2) == 0) {
				j = anchor_error_from(s610, 0xbbe /* anchor::AccountNotMutable */, k, d, f)
				d = undef
				f = undef
				k = ld64(s610 + 8)
				i = ld64(s610)
				if (i != 3) {
					st64(a + 8, k)
					st64(a, i)
					return j
				}
			}
			st64(s790 + 0x40, k)
			if (l >= c) {
				j = anchor_error_from(s620, 0xbbd /* anchor::AccountNotEnoughKeys */, k, d, f)
				k = undef
				d = undef
				f = undef
				h = ld64(s620 + 8)
				i = ld64(s620)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			} else {
				h = ld64(s708 + 0x10) + (l << 3)
				l = l + 1
			}
			if (ld8(ld64(h) + 2) == 0) {
				j = anchor_error_from(s630, 0xbbe /* anchor::AccountNotMutable */, k, d, f)
				k = undef
				d = undef
				f = undef
				h = ld64(s630 + 8)
				i = ld64(s630)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			}
			st64(s790 + 0x38, h)
			if (l >= c) {
				j = anchor_error_from(s640, 0xbbd /* anchor::AccountNotEnoughKeys */, k, d, f)
				k = undef
				d = undef
				f = undef
				h = ld64(s640 + 8)
				i = ld64(s640)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			} else {
				h = ld64(s708 + 0x10) + (l << 3)
				l = l + 1
			}
			if (ld8(ld64(h) + 2) == 0) {
				j = anchor_error_from(s650, 0xbbe /* anchor::AccountNotMutable */, k, d, f)
				k = undef
				d = undef
				f = undef
				h = ld64(s650 + 8)
				i = ld64(s650)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			}
			st64(s790 + 0x30, r)
			const t = ld64(s708 + 0x10)
			st64(s790 + 0x28, h)
			if (l >= c) {
				j = anchor_error_from(s660, 0xbbd /* anchor::AccountNotEnoughKeys */, k, d, f)
				k = undef
				d = undef
				f = undef
				m = ld64(s660 + 8)
				i = ld64(s660)
				if (i != 3) {
					st64(a + 8, m)
					st64(a, i)
					return j
				}
			} else {
				m = t + (l << 3)
			}
			if (ld8(ld64(m) + 2) == 0) {
				j = anchor_error_from(s670, 0xbbe /* anchor::AccountNotMutable */, k, d, f)
				k = undef
				d = undef
				f = undef
				m = ld64(s670 + 8)
				i = ld64(s670)
				if (i != 3) {
					st64(a + 8, m)
					st64(a, i)
					return j
				}
			}
			const al = m
			j = fn_22210(s1c0, ld64(ld64(s730 + 0x10)), k, d, f)
			const v = ld8(s1b0)
			let x = ld64(s1c0 + 8)
			const u = ld64(s1c0)
			if (u == 0) {
				st32(s530 + 3, ld32(s1b0 + 4))
				st32(s530, ld32(s1b0 + 1))
				st32(a + 0xc, ld32(s530 + 3))
				st32(a + 9, ld32(s530))
				st8(a + 8, v)
				st64(a, x)
				return j
			}
			st64(s708 + 0x10, v)
			j = fn_21f70(s1c0, ld64(ld64(s790 + 0x30)))
			st64(s790 + 0x18, ld8(s1b0))
			st64(s790 + 0x20, ld64(s1c0 + 8))
			const w = ld64(s1c0)
			if (w == 0) {
				st32(s530 + 3, ld32(s1b0 + 4))
				st32(s530, ld32(s1b0 + 1))
				st32(a + 0xc, ld32(s530 + 3))
				st32(a + 9, ld32(s530))
				st8(a + 8, ld64(s790 + 0x18))
				st64(a, ld64(s790 + 0x20))
				st8(x, ld8(x) | ld64(s708 + 0x10))
				return j
			}
			B119: {
				st64(s790 + 0x10, x)
				const y = ld64(ld64(s730 + 0x10))
				st64(s790, y + 8, w)
				j = fn_228d8(s1c0, w + 8, y + 8, undef, undef, j)
				if (ld64(s1c0) == 3) {
					B81: {
						j = fn_224b0(s1c0, ld64(ld64(s790 + 0x58)), undef, undef, undef, j)
						st64(s790 + 0x58, ld64(s1c0))
						if (ld8(s1a0) != 2) {
							B87: {
								B86: {
									ah = ld8(s1b0 + 8)
									st64(s7b8 + 0x20, ld64(s1b0))
									const z = memcmp(ld64(s790 + 0x58), ld64(s790 + 8) + 0x28, 0x20)
									j = z as u32
									if (j != 0) {
										j = anchor_error_from(s680, 0x7d3 /* anchor::ConstraintRaw */, aa, ab, ac)
										ad = ld64(s680)
										if (ad != 3) {
											ag = ld64(s680 + 8)
											break B86
										}
									}
									if (ld64(ld64(s790 + 0x58) + 0x40) != 1) {
										j = anchor_error_from(s690, 0x7d3 /* anchor::ConstraintRaw */, aa, ab, ac)
										ad = ld64(s690)
										if (ad != 3) {
											ag = ld64(s690 + 8)
											break B86
										}
									}
									j = fn_228d8(s1c0, ld64(ld64(s790 + 0x40)) + 8, u + 0x85, ab, ac, j)
									if (ld64(s1c0) == 3) {
										j = fn_228d8(s1c0, ld64(ld64(s790 + 0x38)) + 8, u + 0xd5, undef, undef, j)
										if (ld64(s1c0) == 3) {
											j = fn_1d488(s1c0, ld64(s790 + 0x58), ld64(ld64(s730 + 8)))
											if (ld64(s1c0) == 3) {
												if (ld8(ld64(s790 + 0x58) + 0x6c) == 2) {
													j = fn_87630(s6e0, 0x3b)
													af = ld64(s6e0)
													st64(a + 8, ld64(s6e0 + 8))
													st64(a, af)
													break B87
												}
												const aj = ld64(s7b8 + 0x20)
												st8(aj, ld8(aj) + (1 << (ah & 7)))
												j = clock_get_139448(s1c0)
												if (ld32(s1c0) != 0) {
													st64(a + 8, ld64(s1c0 + 4))
													st64(a, 2)
													bv = ld64(s790 + 0x20)
													st8(bv, ld8(bv) | ld64(s790 + 0x18))
													x = ld64(s790 + 0x10)
													st8(x, ld8(x) | ld64(s708 + 0x10))
													return j
												}
												B109: {
													if ((ld64(s708) | ld64(s708 + 8)) == 0) {
														j = fn_87630(s6d0, 0xc)
														ak = ld64(s6d0)
														bo = ld64(s6d0 + 8)
													} else {
														if ((ld64(s708 + 8) as i64) >= 0) {
															st64(s730 + 8, ld64(s1a0 + 8))
															const ao = ld64(s708) != 0
															if (-1 >= (ld64(s730 + 8) as i64)) {
																j = fn_87630(s6a0, 0x15)
																st64(s730 + 8, ld64(s6a0 + 8))
																ak = ld64(s6a0)
																if (ak != 2) {
																	bo = ld64(s730 + 8)
																	break B109
																}
															}
															j = fn_21378(s1c0, ld64(ld64(s790 + 0x28)), ld64(al), ld64(s790), am, j)
															st64(s7b8 + 0x18, ld64(s1b0))
															st64(s790 + 0x58, ld64(s1c0 + 8))
															const an = ld64(s1c0)
															st64(s7b8 + 0x20, an)
															if (an == 0) {
																ae = ld64(s7b8 + 0x18)
																break B81
															}
															const ap = ld64(s708 + 8) + ao
															st64(s7b8, -ld64(s708))
															st64(s7b8 + 8, -ap)
															st64(s7c0, ld64(s1a0 + 8))
															const aq = ld64(s1a0)
															let at = ld64(s7b8 + 0x20)
															let ar = ld64(s790 + 0x58)
															st64(s7b8 + 0x10, aq)
															if (aq != 0) {
																at = ld64(s7b8 + 0x10)
																ar = ld64(s7c0)
															}
															st64(s7d8, ld8(s190 + 8))
															st64(s7d0, ld64(s190))
															st64(s7c8, ld8(s1b0 + 8))
															st64(sff0 + 0x10, ld64(s7b8 + 8))
															st64(sff0 + 0x18, ld64(s730 + 8))
															st64(sff0 + 8, ld64(s7b8))
															st64(sff8, at, ar)
															st64(s1000, ld64(s790 + 0x58))
															j = fn_159d0(s1c0, u, ld64(s790 + 8), ld64(s7b8 + 0x20), ld64(s1000), at, ar, ld64(sff0 + 8), ld64(sff0 + 0x10), ld64(sff0 + 0x18))
															const au = ld8(s190 + 0x180)
															if (au == 2) {
																const bm = ld64(s1c0 + 8)
																st64(s370 + 8, bm)
																const bn = ld64(s1c0)
																st64(s370, bn)
																st64(a + 8, bm)
																st64(a, bn)
															} else {
																st64(s7e0, s370)
																memcpy(s370, s1c0, 0x1b0)
																st64(s530 + 0x1b1, ld64(s190 + 0x181))
																st64(s530 + 0x1b8, ld64(s190 + 0x188))
																st64(s7e8, s530)
																memcpy(s530, ld64(s7e0), 0x1b0)
																st8(s530 + 0x1b0, au)
																const av = ld64(ld64(s790 + 0x58) + 0x38)
																st64(sff0 + 8, ld64(s7e8))
																st64(sff0 + 0x10, ld64(s730 + 8))
																st64(sff0, ld64(s7c0))
																st64(sff8, ld64(s7b8 + 0x10))
																st64(s1000, av)
																j = fn_1aa28(s1c0, u, ld64(s790 + 8), ld64(s7b8 + 0x20), av, ld64(sff8), ld64(sff0), ld64(sff0 + 8), ld64(sff0 + 0x10))
																if (ld64(s1c0) == 3) {
																	const aw = ld64(s7b8 + 0x18)
																	st8(aw, ld8(aw) | ld64(s7c8))
																	if (ld64(s7b8 + 0x10) != 0) {
																		const ax = ld64(s7d0)
																		st8(ax, ld8(ax) | ld64(s7d8))
																	}
																	const bd = ld64(al)
																	const bc = ld64(ld64(s790 + 0x28))
																	const bb = ld64(ld64(s790 + 0x30))
																	const ba = ld8(s530 + 0x1b8)
																	const az = ld8(s530 + 0x1b9)
																	const ay = ld8(s530 + 0x1bb)
																	st64(sff0, ld8(s530 + 0x1ba))
																	st64(sff0 + 8, ay)
																	st64(s1000, ba, az)
																	j = fn_1ba30(s1c0, bb, bc, bd, ba, az, ld64(sff0), ay)
																	if (ld64(s1c0) == 3) {
																		const bj = ld64(u + 0x49)
																		const bi = ld64(u + 0x41)
																		const bh = ld32(u + 0x51)
																		const be = ld64(s790 + 8)
																		const bg = ld32(be + 0x58)
																		const bf = ld32(be + 0x5c)
																		copy(sff0, s7b8, 0x10)
																		st64(s1000, bg, bf)
																		j = fn_1ad88(s1c0, bh, bi, bj, bg, bf, ld64(sff0), ld64(sff0 + 8))
																		const bk = ld64(s1b0)
																		const bl = ld64(s1c0 + 8)
																		if (ld64(s1c0) == 0) {
																			if (bl >= ld64(s730 + 0x18) && bk >= ld64(s730 + 0x20)) {
																				st64(sff8, ld64(s730))
																				st64(sff0, bl)
																				st64(s1000, ld64(s790 + 0x50))
																				j = fn_1f708(s1c0, u, ld64(s730 + 0x10), ld64(s790 + 0x40), ld64(s1000), ld64(sff8), bl)
																				if (ld64(s1c0) != 3) {
																					break B119
																				}
																				st64(sff8, ld64(s730))
																				st64(sff0, bk)
																				st64(s1000, ld64(s790 + 0x48))
																				j = fn_1f708(s1c0, u, ld64(s730 + 0x10), ld64(s790 + 0x38), ld64(s1000), ld64(sff8), bk)
																				if (ld64(s1c0) == 3) {
																					const bs = ld64(ld64(s790 + 0x30))
																					const br = ld64(ld64(s790 + 8) + 0x58)
																					copyr(s1b0, s708, 0x10)
																					st64(s190 + 0x10, ld64(s790))
																					st64(s1a0, bl, bk)
																					st64(s1c0 + 4, br)
																					st64(s190 + 0x18, bs + 8)
																					st64(s190, 0, 0)
																					st8(s1c0, 1)
																					j = fn_15490(s370, s1c0)
																					if (ld64(s370) == 3) {
																						st64(a, 3)
																						const bt = ld64(s790 + 0x20)
																						st8(bt, ld8(bt) | ld64(s790 + 0x18))
																						const bu = ld64(s790 + 0x10)
																						st8(bu, ld8(bu) | ld64(s708 + 0x10))
																						return j
																					}
																					st64(a + 8, ld64(s370 + 8))
																					st64(a, ld64(s370))
																					bv = ld64(s790 + 0x20)
																					st8(bv, ld8(bv) | ld64(s790 + 0x18))
																					x = ld64(s790 + 0x10)
																					st8(x, ld8(x) | ld64(s708 + 0x10))
																					return j
																				}
																				break B119
																			}
																			j = fn_87630(s6b0, 0x12)
																			ak = ld64(s6b0)
																			bo = ld64(s6b0 + 8)
																			break B109
																		}
																		st64(a + 8, bk)
																		st64(a, bl)
																		bv = ld64(s790 + 0x20)
																		st8(bv, ld8(bv) | ld64(s790 + 0x18))
																		x = ld64(s790 + 0x10)
																		st8(x, ld8(x) | ld64(s708 + 0x10))
																		return j
																	}
																	break B119
																}
																st64(a + 8, ld64(s1c0 + 8))
																st64(a, ld64(s1c0))
															}
															const bp = ld64(s7b8 + 0x18)
															st8(bp, ld8(bp) | ld64(s7c8))
															if (ld64(s7b8 + 0x10) == 0) {
																bv = ld64(s790 + 0x20)
																st8(bv, ld8(bv) | ld64(s790 + 0x18))
																x = ld64(s790 + 0x10)
																st8(x, ld8(x) | ld64(s708 + 0x10))
																return j
															}
															const bq = ld64(s7d0)
															st8(bq, ld8(bq) | ld64(s7d8))
															bv = ld64(s790 + 0x20)
															st8(bv, ld8(bv) | ld64(s790 + 0x18))
															x = ld64(s790 + 0x10)
															st8(x, ld8(x) | ld64(s708 + 0x10))
															return j
														}
														j = fn_87630(s6c0, 0xd)
														ak = ld64(s6c0)
														bo = ld64(s6c0 + 8)
													}
												}
												st64(a + 8, bo)
												st64(a, ak)
												bv = ld64(s790 + 0x20)
												st8(bv, ld8(bv) | ld64(s790 + 0x18))
												x = ld64(s790 + 0x10)
												st8(x, ld8(x) | ld64(s708 + 0x10))
												return j
											}
										}
									}
									st64(a + 8, ld64(s1c0 + 8))
									af = ld64(s1c0)
									st64(a, af)
									break B87
								}
								st64(a, ad, ag)
							}
							const ai = ld64(s7b8 + 0x20)
							st8(ai, ld8(ai) + (1 << (ah & 7)))
							bv = ld64(s790 + 0x20)
							st8(bv, ld8(bv) | ld64(s790 + 0x18))
							x = ld64(s790 + 0x10)
							st8(x, ld8(x) | ld64(s708 + 0x10))
							return j
						}
						ae = ld64(s1c0 + 8)
					}
					st64(a + 8, ae)
					st64(a, ld64(s790 + 0x58))
					bv = ld64(s790 + 0x20)
					st8(bv, ld8(bv) | ld64(s790 + 0x18))
					x = ld64(s790 + 0x10)
					st8(x, ld8(x) | ld64(s708 + 0x10))
					return j
				}
			}
			st64(a + 8, ld64(s1c0 + 8))
			st64(a, ld64(s1c0))
			bv = ld64(s790 + 0x20)
			st8(bv, ld8(bv) | ld64(s790 + 0x18))
			x = ld64(s790 + 0x10)
			st8(x, ld8(x) | ld64(s708 + 0x10))
			return j
		}
		j = fn_13b4d0(s6f0, fn_b6a0(0x15, "Not all bytes read", 0x12, d, f))
		i = ld64(s6f0)
		st64(a + 8, ld64(s6f0 + 8))
		st64(a, i)
		return j
	}
	fn_14c4f0(8, e, 0x100159a78, d, e)
}

export function fn_24370(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, s1b0 = fp - 0x1b0, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s370 = fp - 0x370, s528 = fp - 0x528, s530 = fp - 0x530, s650 = fp - 0x650, s660 = fp - 0x660, s668 = fp - 0x668, s688 = fp - 0x688, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s700 = fp - 0x700, s710 = fp - 0x710, s720 = fp - 0x720, s730 = fp - 0x730, s740 = fp - 0x740, s750 = fp - 0x750, s760 = fp - 0x760, s770 = fp - 0x770, s780 = fp - 0x780, s790 = fp - 0x790, s7a0 = fp - 0x7a0, s7b0 = fp - 0x7b0, s7c0 = fp - 0x7c0, s7d0 = fp - 0x7d0, s7e0 = fp - 0x7e0, s7f0 = fp - 0x7f0, s800 = fp - 0x800, s810 = fp - 0x810, s820 = fp - 0x820, s830 = fp - 0x830, s840 = fp - 0x840, s850 = fp - 0x850, s860 = fp - 0x860, s870 = fp - 0x870, s880 = fp - 0x880, s890 = fp - 0x890, s8a0 = fp - 0x8a0, s8b0 = fp - 0x8b0, s8c0 = fp - 0x8c0, s8d0 = fp - 0x8d0, s9b0 = fp - 0x9b0, s9b8 = fp - 0x9b8, s9c0 = fp - 0x9c0, s9c8 = fp - 0x9c8, s9d0 = fp - 0x9d0, s9d8 = fp - 0x9d8, s9e0 = fp - 0x9e0, sfe0 = fp - 0xfe0, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let g, h, k, l, o, r, u, w, ag, ai, aj, ak, al, am, an, ap, aw, ax, ay, bz: u64
	if (e > 7) {
		st64(s370, d + 8, e - 8)
		fn_11b3b8(s1c0, s370)
		const i = ld64(s1b8)
		const f = ld64(s1c0)
		if (f == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
			l = fn_13b4d0(s8d0, i, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, g, h)
			k = ld64(s8d0)
			st64(a + 8, ld64(s8d0 + 8))
			st64(a, k)
			return l
		}
		copyr(s530, s1b0, 0x28)
		if (ld64(s370 + 8) == 0) {
			copyr(s688, s528, 0x20)
			let m = ld64(s530)
			st64(s6a0, f, i, m)
			let n = 1
			let j = b
			if (c == 0) {
				l = anchor_error_from(s6b0, 0xbbd /* anchor::AccountNotEnoughKeys */, m, g, h)
				m = undef
				n = 0
				j = ld64(s6b0 + 8)
				k = ld64(s6b0)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			}
			if (ld8(ld64(j) + 2) == 0) {
				l = anchor_error_from(s6c0, 0xbbe /* anchor::AccountNotMutable */, m, g, h)
				m = undef
				j = ld64(s6c0 + 8)
				k = ld64(s6c0)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			}
			st64(s9b0 + 0xd8, j)
			if (n >= c) {
				l = anchor_error_from(s6d0, 0xbbd /* anchor::AccountNotEnoughKeys */, m, g, h)
				o = ld64(s6d0 + 8)
				k = ld64(s6d0)
				if (k != 3) {
					st64(a + 8, o)
					st64(a, k)
					return l
				}
			} else {
				o = b + (n << 3)
				n = n + 1
			}
			B22: {
				const p = ld64(o)
				const q = ld64(p + 8)
				if (q == 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */) {
					r = 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */
					if (ld64(p + 0x10) == 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */) {
						r = 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */
						if (ld64(p + 0x18) == 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */ && ld64(p + 0x20) == 0xfc8ba1d828f9bdfe /* TOKEN_2022_PROGRAM[3] */) {
							break B22
						}
					}
				} else {
					r = 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */
					if (q == 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */) {
						r = 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */
						if (ld64(p + 0x10) == 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */) {
							r = 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */
							if (ld64(p + 0x18) == 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */ && ld64(p + 0x20) == 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) {
								break B22
							}
						}
					}
				}
				l = anchor_error_from(s6e0, 0xbc0 /* anchor::InvalidProgramId */, r, o, h)
				r = undef
				o = ld64(s6e0 + 8)
				k = ld64(s6e0)
				if (k != 3) {
					st64(a + 8, o)
					st64(a, k)
					return l
				}
			}
			st64(s9b0 + 0xd0, o)
			if (n >= c) {
				l = anchor_error_from(s6f0, 0xbbd /* anchor::AccountNotEnoughKeys */, r, o, h)
				o = ld64(s6f0 + 8)
				k = ld64(s6f0)
				if (k != 3) {
					st64(a + 8, o)
					st64(a, k)
					return l
				}
			} else {
				o = b + (n << 3)
				n = n + 1
			}
			B34: {
				const s = ld64(o)
				const t = ld64(s + 8)
				if (t == 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */) {
					u = 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */
					if (ld64(s + 0x10) == 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */) {
						u = 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */
						if (ld64(s + 0x18) == 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */ && ld64(s + 0x20) == 0xfc8ba1d828f9bdfe /* TOKEN_2022_PROGRAM[3] */) {
							break B34
						}
					}
				} else {
					u = 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */
					if (t == 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */) {
						u = 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */
						if (ld64(s + 0x10) == 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */) {
							u = 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */
							if (ld64(s + 0x18) == 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */ && ld64(s + 0x20) == 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) {
								break B34
							}
						}
					}
				}
				l = anchor_error_from(s700, 0xbc0 /* anchor::InvalidProgramId */, u, o, h)
				u = undef
				o = ld64(s700 + 8)
				k = ld64(s700)
				if (k != 3) {
					st64(a + 8, o)
					st64(a, k)
					return l
				}
			}
			st64(s9b0 + 0xc8, o)
			if (n >= c) {
				l = anchor_error_from(s710, 0xbbd /* anchor::AccountNotEnoughKeys */, u, o, h)
				o = ld64(s710 + 8)
				k = ld64(s710)
				if (k != 3) {
					st64(a + 8, o)
					st64(a, k)
					return l
				}
			} else {
				o = b + (n << 3)
				n = n + 1
			}
			B42: {
				const v = ld64(o)
				w = 0x62129995a534a05 /* MEMO_PROGRAM */
				if (ld64(v + 8) == 0x62129995a534a05 /* MEMO_PROGRAM */) {
					w = 0x7c38da6071e8244d /* MEMO_PROGRAM[1] */
					if (ld64(v + 0x10) == 0x7c38da6071e8244d /* MEMO_PROGRAM[1] */) {
						w = 0x81bb92bcddb5357c /* MEMO_PROGRAM[2] */
						if (ld64(v + 0x18) == 0x81bb92bcddb5357c /* MEMO_PROGRAM[2] */ && ld64(v + 0x20) == 0x8d44054140a81fe4 /* MEMO_PROGRAM[3] */) {
							break B42
						}
					}
				}
				l = anchor_error_from(s720, 0xbc0 /* anchor::InvalidProgramId */, w, o, h)
				w = undef
				o = ld64(s720 + 8)
				k = ld64(s720)
				if (k != 3) {
					st64(a + 8, o)
					st64(a, k)
					return l
				}
			}
			B45: {
				let x = 0xbbd /* anchor::AccountNotEnoughKeys */
				st64(s9b0 + 0xc0, o)
				if (c > n) {
					w = b + (n << 3)
					x = 0xbc2 /* anchor::AccountNotSigner */
					n = n + 1
					if (ld8(ld64(w) + 1) != 0) {
						break B45
					}
				}
				l = anchor_error_from(s730, x, w, o, h)
				o = ld64(s9b0 + 0xc0)
				w = ld64(s730 + 8)
				k = ld64(s730)
				if (k != 3) {
					st64(a + 8, w)
					st64(a, k)
					return l
				}
			}
			st64(s9b0 + 0xb8, w)
			if (n >= c) {
				l = anchor_error_from(s740, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s740 + 8)
				k = ld64(s740)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(j) + 2) == 0) {
				l = anchor_error_from(s750, 0xbbe /* anchor::AccountNotMutable */, w, o, h)
				w = undef
				o = undef
				j = ld64(s750 + 8)
				k = ld64(s750)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			}
			st64(s9b0 + 0xb0, j)
			if (n >= c) {
				l = anchor_error_from(s760, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s760 + 8)
				k = ld64(s760)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			st64(s9b0 + 0xa8, j)
			if (n >= c) {
				l = anchor_error_from(s770, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s770 + 8)
				k = ld64(s770)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			st64(s9b0 + 0xa0, j)
			if (n >= c) {
				l = anchor_error_from(s780, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s780 + 8)
				k = ld64(s780)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			st64(s9b0 + 0x98, j)
			if (n >= c) {
				l = anchor_error_from(s790, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s790 + 8)
				k = ld64(s790)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(j) + 2) == 0) {
				l = anchor_error_from(s7a0, 0xbbe /* anchor::AccountNotMutable */, w, o, h)
				w = undef
				o = undef
				j = ld64(s7a0 + 8)
				k = ld64(s7a0)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			}
			st64(s9b0 + 0x90, j)
			if (n >= c) {
				l = anchor_error_from(s7b0, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s7b0 + 8)
				k = ld64(s7b0)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(j) + 2) == 0) {
				l = anchor_error_from(s7c0, 0xbbe /* anchor::AccountNotMutable */, w, o, h)
				w = undef
				o = undef
				j = ld64(s7c0 + 8)
				k = ld64(s7c0)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			}
			st64(s9b0 + 0x88, j)
			if (n >= c) {
				l = anchor_error_from(s7d0, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s7d0 + 8)
				k = ld64(s7d0)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(j) + 2) == 0) {
				l = anchor_error_from(s7e0, 0xbbe /* anchor::AccountNotMutable */, w, o, h)
				w = undef
				o = undef
				j = ld64(s7e0 + 8)
				k = ld64(s7e0)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			}
			st64(s9b0 + 0x80, j)
			if (n >= c) {
				l = anchor_error_from(s7f0, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s7f0 + 8)
				k = ld64(s7f0)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(j) + 2) == 0) {
				l = anchor_error_from(s800, 0xbbe /* anchor::AccountNotMutable */, w, o, h)
				w = undef
				o = undef
				j = ld64(s800 + 8)
				k = ld64(s800)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			}
			st64(s9b0 + 0x78, j)
			if (n >= c) {
				l = anchor_error_from(s810, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s810 + 8)
				k = ld64(s810)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(j) + 2) == 0) {
				l = anchor_error_from(s820, 0xbbe /* anchor::AccountNotMutable */, w, o, h)
				w = undef
				o = undef
				j = ld64(s820 + 8)
				k = ld64(s820)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			}
			st64(s9b0 + 0x60, j)
			if (n >= c) {
				l = anchor_error_from(s830, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s830 + 8)
				k = ld64(s830)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(j) + 2) == 0) {
				l = anchor_error_from(s840, 0xbbe /* anchor::AccountNotMutable */, w, o, h)
				w = undef
				o = undef
				j = ld64(s840 + 8)
				k = ld64(s840)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			}
			st64(s9b0 + 0x50, j)
			if (c >= n) {
				l = fn_22210(s1c0, ld64(ld64(s9b0 + 0xd8)), w, o, h)
				st64(s9b0 + 0x68, ld8(s1b0))
				st64(s9b0 + 0x70, ld64(s1b8))
				const y = ld64(s1c0)
				st64(s9b0 + 0x58, y)
				if (y == 0) {
					st32(s530 + 3, ld32(s1b0 + 4))
					st32(s530, ld32(s1b0 + 1))
					st32(a + 0xc, ld32(s530 + 3))
					st32(a + 9, ld32(s530))
					st8(a + 8, ld64(s9b0 + 0x68))
					st64(a, ld64(s9b0 + 0x70))
					return l
				}
				const aa = ld64(ld64(s9b0 + 0xa0))
				const z = ld64(ld64(s9b0 + 0xd0))
				st64(s9b0 + 0x48, aa)
				l = fn_228d8(s1c0, z + 8, aa + 0x28, undef, undef, l)
				if (ld64(s1c0) == 3) {
					const ac = ld64(ld64(s9b0 + 0x98))
					const ab = ld64(ld64(s9b0 + 0xc8))
					st64(s9b0 + 0x40, ac)
					l = fn_228d8(s1c0, ab + 8, ac + 0x28, undef, undef, l)
					if (ld64(s1c0) == 3) {
						l = fn_21f70(s1c0, ld64(ld64(s9b0 + 0xb0)))
						st64(s9b0 + 0x30, ld8(s1b0))
						st64(s9b0 + 0x38, ld64(s1b8))
						const ad = ld64(s1c0)
						st64(s9b0 + 0x28, ad)
						if (ad == 0) {
							st32(s530 + 3, ld32(s1b0 + 4))
							st32(s530, ld32(s1b0 + 1))
							st32(a + 0xc, ld32(s530 + 3))
							st32(a + 9, ld32(s530))
							st8(a + 8, ld64(s9b0 + 0x30))
							st64(a, ld64(s9b0 + 0x38))
							ag = ld64(s9b0 + 0x70)
							st8(ag, ld8(ag) | ld64(s9b0 + 0x68))
							return l
						}
						const af = ld64(ld64(s9b0 + 0xd8))
						const ae = ld64(s9b0 + 0x28)
						st64(s9b0 + 0x20, af + 8)
						l = fn_228d8(s1c0, ae + 8, af + 8, undef, undef, l)
						if (ld64(s1c0) == 3) {
							l = fn_224b0(s1c0, ld64(ld64(s9b0 + 0xa8)), undef, undef, undef, l)
							st64(s9b0 + 0xa8, ld64(s1c0))
							if (ld8(s1a0) == 2) {
								st64(a + 8, ld64(s1b8))
								st64(a, ld64(s9b0 + 0xa8))
								ap = ld64(s9b0 + 0x38)
								st8(ap, ld8(ap) | ld64(s9b0 + 0x30))
								ag = ld64(s9b0 + 0x70)
								st8(ag, ld8(ag) | ld64(s9b0 + 0x68))
								return l
							}
							B120: {
								B119: {
									st64(s9b0 + 0x10, ld8(s1a8))
									st64(s9b0 + 0x18, ld64(s1b0))
									const ah = memcmp(ld64(s9b0 + 0xa8), ld64(s9b0 + 0x28) + 0x28, 0x20)
									l = ah as u32
									if (l != 0) {
										l = anchor_error_from(s850, 0x7d3 /* anchor::ConstraintRaw */, ai, aj, ak)
										al = ld64(s850)
										if (al != 3) {
											an = ld64(s850 + 8)
											break B119
										}
									}
									if (ld64(ld64(s9b0 + 0xa8) + 0x40) != 1) {
										l = anchor_error_from(s860, 0x7d3 /* anchor::ConstraintRaw */, ai, aj, ak)
										al = ld64(s860)
										if (al != 3) {
											an = ld64(s860 + 8)
											break B119
										}
									}
									l = fn_228d8(s1c0, ld64(s9b0 + 0x48) + 8, ld64(s9b0 + 0x58) + 0x65 /* anchor::InstructionFallbackNotFound */, aj, ak, l)
									if (ld64(s1c0) == 3) {
										l = fn_228d8(s1c0, ld64(s9b0 + 0x40) + 8, ld64(s9b0 + 0x58) + 0xb5, undef, undef, l)
										if (ld64(s1c0) == 3) {
											l = fn_228d8(s1c0, ld64(ld64(s9b0 + 0x80)) + 8, ld64(s9b0 + 0x58) + 0x85, undef, undef, l)
											if (ld64(s1c0) == 3) {
												l = fn_228d8(s1c0, ld64(ld64(s9b0 + 0x78)) + 8, ld64(s9b0 + 0x58) + 0xd5, undef, undef, l)
												if (ld64(s1c0) == 3) {
													l = fn_1d488(s1c0, ld64(s9b0 + 0xa8), ld64(ld64(s9b0 + 0xb8)))
													if (ld64(s1c0) == 3) {
														if (ld8(ld64(s9b0 + 0xa8) + 0x6c) == 2) {
															l = fn_87630(s8c0, 0x3b)
															am = ld64(s8c0)
															st64(a + 8, ld64(s8c0 + 8))
															st64(a, am)
															break B120
														}
														const aq = ld64(s9b0 + 0x18)
														st8(aq, ld8(aq) + (1 << (ld64(s9b0 + 0x10) & 7)))
														l = clock_get_139448(s1c0)
														if (ld32(s1c0) != 0) {
															st64(a + 8, ld64(s1c0 + 4))
															st64(a, 2)
															ap = ld64(s9b0 + 0x38)
															st8(ap, ld8(ap) | ld64(s9b0 + 0x30))
															ag = ld64(s9b0 + 0x70)
															st8(ag, ld8(ag) | ld64(s9b0 + 0x68))
															return l
														}
														const at = ld64(s688 + 8)
														const ar = ld64(s688)
														st64(s9b0 + 0xa8, ar)
														st64(s9b0 + 0xb8, at)
														if ((ar | at) == 0) {
															l = fn_87630(s8b0, 0xc)
															const by = ld64(s8b0)
															st64(a + 8, ld64(s8b0 + 8))
															st64(a, by)
															ap = ld64(s9b0 + 0x38)
															st8(ap, ld8(ap) | ld64(s9b0 + 0x30))
															ag = ld64(s9b0 + 0x70)
															st8(ag, ld8(ag) | ld64(s9b0 + 0x68))
															return l
														}
														let av = ld64(s1a0 + 8)
														st64(s1000, 0x100152bf5, 2)
														l = fn_1c688(s1c0, b + (n << 3), c - n, s6a0, 0x100152bf5, 2)
														copy(s530, s1b8, 0x10)
														const au = ld64(s1c0)
														if (au == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
															st64(a + 8, ld64(s528))
															st64(a, ld64(s530))
															ap = ld64(s9b0 + 0x38)
															st8(ap, ld8(ap) | ld64(s9b0 + 0x30))
															ag = ld64(s9b0 + 0x70)
															st8(ag, ld8(ag) | ld64(s9b0 + 0x68))
															return l
														}
														B161: {
															B141: {
																st64(s9b0 + 0x18, s650)
																ay = memcpy(s650, s1a8, 0x120)
																st64(s668, au)
																copy(s660, s530, 0x10)
																if ((ld64(s9b0 + 0xb8) as i64) >= 0) {
																	const ba = ld64(s9b0 + 0xa8) != 0
																	if (-1 >= (av as i64)) {
																		ay = fn_87630(s870, 0x15)
																		av = ld64(s870 + 8)
																		aw = ld64(s870)
																		if (aw != 2) {
																			st64(a + 8, av)
																			break B161
																		}
																	}
																	ay = fn_21378(s1c0, ld64(ld64(s9b0 + 0x60)), ld64(ld64(s9b0 + 0x50)), ld64(s9b0 + 0x20), ax, ay)
																	st64(s9b0 + 0x40, ld64(s1b0))
																	st64(s9b0 + 0x48, ld64(s1b8))
																	const az = ld64(s1c0)
																	if (az == 0) {
																		st64(a + 8, ld64(s9b0 + 0x40))
																		aw = ld64(s9b0 + 0x48)
																		break B161
																	}
																	const bb = ld64(s9b0 + 0xb8) + ba
																	st64(s9b0, -ld64(s9b0 + 0xa8))
																	st64(s9b0 + 8, -bb)
																	st64(s9b8, ld64(s1a0 + 8))
																	const bc = ld64(s1a0)
																	let be = az
																	let bd = ld64(s9b0 + 0x48)
																	st64(s9b0 + 0x10, bc)
																	if (bc != 0) {
																		be = ld64(s9b0 + 0x10)
																		bd = ld64(s9b8)
																	}
																	st64(s9d0, ld8(s1a0 + 0x18))
																	st64(s9c8, ld64(s1a0 + 0x10))
																	st64(s9c0, ld8(s1a8))
																	st64(sfe0, ld64(s9b0 + 8))
																	st64(sfe0 + 8, av)
																	st64(sff0 + 8, ld64(s9b0))
																	st64(sff8, be, bd)
																	st64(s1000, ld64(s9b0 + 0x48))
																	ay = fn_159d0(s1c0, ld64(s9b0 + 0x58), ld64(s9b0 + 0x28), az, ld64(s1000), be, bd, ld64(sff0 + 8), ld64(sfe0), av)
																	const bf = ld8(s1a0 + 0x190)
																	if (bf == 2) {
																		const ca = ld64(s1b8)
																		st64(s370 + 8, ca)
																		const cb = ld64(s1c0)
																		st64(s370, cb)
																		st64(a + 8, ca)
																		st64(a, cb)
																	} else {
																		st64(s9d8, s370)
																		memcpy(s370, s1c0, 0x1b0)
																		st64(s528 + 0x1a9, ld64(s1a0 + 0x191))
																		st64(s528 + 0x1b0, ld64(s1a0 + 0x198))
																		st64(s9e0, s530)
																		memcpy(s530, ld64(s9d8), 0x1b0)
																		st8(s528 + 0x1a8, bf)
																		const bg = ld64(ld64(s9b0 + 0x48) + 0x38)
																		st64(sff0 + 8, ld64(s9e0))
																		st64(sfe0, av)
																		st64(sff0, ld64(s9b8))
																		st64(sff8, ld64(s9b0 + 0x10))
																		st64(s1000, bg)
																		ay = fn_1aa28(s1c0, ld64(s9b0 + 0x58), ld64(s9b0 + 0x28), az, bg, ld64(sff8), ld64(sff0), ld64(sff0 + 8), av)
																		if (ld64(s1c0) == 3) {
																			const bh = ld64(s9b0 + 0x40)
																			st8(bh, ld8(bh) | ld64(s9c0))
																			if (ld64(s9b0 + 0x10) != 0) {
																				const bi = ld64(s9c8)
																				st8(bi, ld8(bi) | ld64(s9d0))
																			}
																			const bo = ld64(ld64(s9b0 + 0x50))
																			const bn = ld64(ld64(s9b0 + 0x60))
																			const bm = ld64(ld64(s9b0 + 0xb0))
																			const bl = ld8(s528 + 0x1b0)
																			const bk = ld8(s528 + 0x1b1)
																			const bj = ld8(s528 + 0x1b3)
																			st64(sff0, ld8(s528 + 0x1b2))
																			st64(sff0 + 8, bj)
																			st64(s1000, bl, bk)
																			ay = fn_1ba30(s1c0, bm, bn, bo, bl, bk, ld64(sff0), bj)
																			if (ld64(s1c0) == 3) {
																				const bp = ld64(s9b0 + 0x58)
																				const bv = ld64(bp + 0x49)
																				const bu = ld64(bp + 0x41)
																				const bt = ld32(bp + 0x51)
																				const bq = ld64(s9b0 + 0x28)
																				const bs = ld32(bq + 0x58)
																				const br = ld32(bq + 0x5c)
																				copy(sff0, s9b0, 0x10)
																				st64(s1000, bs, br)
																				ay = fn_1ad88(s1c0, bt, bu, bv, bs, br, ld64(sff0), ld64(sff0 + 8))
																				const bw = ld64(s1b0)
																				const bx = ld64(s1b8)
																				if (ld64(s1c0) != 0) {
																					st64(a + 8, bw)
																					st64(a, bx)
																					l = fn_bc78(ay)
																					ap = ld64(s9b0 + 0x38)
																					st8(ap, ld8(ap) | ld64(s9b0 + 0x30))
																					ag = ld64(s9b0 + 0x70)
																					st8(ag, ld8(ag) | ld64(s9b0 + 0x68))
																					return l
																				}
																				ay = fn_1d6c0(s1c0, ld64(ld64(s9b0 + 0xa0)), bx, undef, undef, ay)
																				st64(s9b0 + 0x60, ld64(s1b0))
																				const ce = ld64(s1b8)
																				if (ld64(s1c0) != 0) {
																					st64(a + 8, ld64(s9b0 + 0x60))
																					st64(a, ce)
																					l = fn_bc78(ay)
																					ap = ld64(s9b0 + 0x38)
																					st8(ap, ld8(ap) | ld64(s9b0 + 0x30))
																					ag = ld64(s9b0 + 0x70)
																					st8(ag, ld8(ag) | ld64(s9b0 + 0x68))
																					return l
																				}
																				ay = fn_1d6c0(s1c0, ld64(ld64(s9b0 + 0x98)), bw, undef, undef, ay)
																				st64(s9b0 + 0x50, ld64(s1b0))
																				aw = ld64(s1b8)
																				if (ld64(s1c0) != 0) {
																					bz = ld64(s9b0 + 0x50)
																					break B141
																				}
																				if (ld64(s688 + 0x10) > ce) {
																					ay = fn_87630(s890, 0x12)
																					aw = ld64(s890)
																					bz = ld64(s890 + 8)
																					break B141
																				}
																				if (ld64(s688 + 0x18) > aw) {
																					ay = fn_87630(s880, 0x12)
																					aw = ld64(s880)
																					bz = ld64(s880 + 8)
																					break B141
																				}
																				st64(sfe0, s668, bx)
																				st64(sff0 + 8, ld64(s9b0 + 0xc0))
																				st64(sff0, ld64(s9b0 + 0xd0))
																				st64(sff8, ld64(s9b0 + 0x90))
																				st64(s1000, ld64(s9b0 + 0x80))
																				ay = fn_1e9a8(s1c0, ld64(s9b0 + 0x58), ld64(s9b0 + 0xd8), ld64(s9b0 + 0xa0), fp)
																				if (ld64(s1c0) == 3) {
																					st64(sfe0, ld64(s9b0 + 0x18))
																					st64(sfe0 + 8, bw)
																					st64(sff0 + 8, ld64(s9b0 + 0xc0))
																					st64(sff0, ld64(s9b0 + 0xc8))
																					st64(sff8, ld64(s9b0 + 0x88))
																					st64(s1000, ld64(s9b0 + 0x78))
																					ay = fn_1e9a8(s1c0, ld64(s9b0 + 0x58), ld64(s9b0 + 0xd8), ld64(s9b0 + 0x98), fp)
																					if (ld64(s1c0) == 3) {
																						const cg = ld64(ld64(s9b0 + 0xb0))
																						const cf = ld64(ld64(s9b0 + 0x28) + 0x58)
																						st64(s1a8, ld64(s9b0 + 0xb8))
																						st64(s1b0, ld64(s9b0 + 0xa8))
																						st64(s1a0 + 0x20, ld64(s9b0 + 0x20))
																						st64(s1a0 + 0x18, ld64(s9b0 + 0x50))
																						st64(s1a0 + 0x10, ld64(s9b0 + 0x60))
																						st64(s1a0, bx, bw)
																						st64(s1c0 + 4, cf)
																						st64(s1a0 + 0x28, cg + 8)
																						st8(s1c0, 1)
																						ay = fn_15490(s370, s1c0)
																						if (ld64(s370) == 3) {
																							st64(a, 3)
																							l = fn_bc78(ay)
																							ap = ld64(s9b0 + 0x38)
																							st8(ap, ld8(ap) | ld64(s9b0 + 0x30))
																							ag = ld64(s9b0 + 0x70)
																							st8(ag, ld8(ag) | ld64(s9b0 + 0x68))
																							return l
																						}
																						st64(a + 8, ld64(s370 + 8))
																						aw = ld64(s370)
																						break B161
																					}
																				}
																			}
																			st64(a + 8, ld64(s1b8))
																			aw = ld64(s1c0)
																			break B161
																		}
																		st64(a + 8, ld64(s1b8))
																		st64(a, ld64(s1c0))
																	}
																	const cc = ld64(s9b0 + 0x40)
																	st8(cc, ld8(cc) | ld64(s9c0))
																	if (ld64(s9b0 + 0x10) == 0) {
																		l = fn_bc78(ay)
																		ap = ld64(s9b0 + 0x38)
																		st8(ap, ld8(ap) | ld64(s9b0 + 0x30))
																		ag = ld64(s9b0 + 0x70)
																		st8(ag, ld8(ag) | ld64(s9b0 + 0x68))
																		return l
																	}
																	const cd = ld64(s9c8)
																	st8(cd, ld8(cd) | ld64(s9d0))
																	l = fn_bc78(ay)
																	ap = ld64(s9b0 + 0x38)
																	st8(ap, ld8(ap) | ld64(s9b0 + 0x30))
																	ag = ld64(s9b0 + 0x70)
																	st8(ag, ld8(ag) | ld64(s9b0 + 0x68))
																	return l
																}
																ay = fn_87630(s8a0, 0xd)
																aw = ld64(s8a0)
																bz = ld64(s8a0 + 8)
															}
															st64(a + 8, bz)
														}
														st64(a, aw)
														l = fn_bc78(ay)
														ap = ld64(s9b0 + 0x38)
														st8(ap, ld8(ap) | ld64(s9b0 + 0x30))
														ag = ld64(s9b0 + 0x70)
														st8(ag, ld8(ag) | ld64(s9b0 + 0x68))
														return l
													}
												}
											}
										}
									}
									st64(a + 8, ld64(s1b8))
									am = ld64(s1c0)
									st64(a, am)
									break B120
								}
								st64(a, al, an)
							}
							const ao = ld64(s9b0 + 0x18)
							st8(ao, ld8(ao) + (1 << (ld64(s9b0 + 0x10) & 7)))
							ap = ld64(s9b0 + 0x38)
							st8(ap, ld8(ap) | ld64(s9b0 + 0x30))
							ag = ld64(s9b0 + 0x70)
							st8(ag, ld8(ag) | ld64(s9b0 + 0x68))
							return l
						}
						st64(a + 8, ld64(s1b8))
						st64(a, ld64(s1c0))
						ap = ld64(s9b0 + 0x38)
						st8(ap, ld8(ap) | ld64(s9b0 + 0x30))
						ag = ld64(s9b0 + 0x70)
						st8(ag, ld8(ag) | ld64(s9b0 + 0x68))
						return l
					}
					st64(a + 8, ld64(s1b8))
					st64(a, ld64(s1c0))
					ag = ld64(s9b0 + 0x70)
					st8(ag, ld8(ag) | ld64(s9b0 + 0x68))
					return l
				}
				st64(a + 8, ld64(s1b8))
				st64(a, ld64(s1c0))
				ag = ld64(s9b0 + 0x70)
				st8(ag, ld8(ag) | ld64(s9b0 + 0x68))
				return l
			}
			fn_14c4f0(n, c, 0x100159a60, o, h)
		}
		l = fn_13b4d0(s8d0, fn_b6a0(0x15, "Not all bytes read", 0x12, g, h))
		k = ld64(s8d0)
		st64(a + 8, ld64(s8d0 + 8))
		st64(a, k)
		return l
	}
	fn_14c4f0(8, e, 0x100159a90, d, e)
}

export function fn_266f0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s370 = fp - 0x370, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s560 = fp - 0x560, s570 = fp - 0x570, s580 = fp - 0x580, s590 = fp - 0x590, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s700 = fp - 0x700, s708 = fp - 0x708, s710 = fp - 0x710, s718 = fp - 0x718, s720 = fp - 0x720, s728 = fp - 0x728, s730 = fp - 0x730, s738 = fp - 0x738, s740 = fp - 0x740, s748 = fp - 0x748, s750 = fp - 0x750, s758 = fp - 0x758, s760 = fp - 0x760, s768 = fp - 0x768, s770 = fp - 0x770, s778 = fp - 0x778, s780 = fp - 0x780, s788 = fp - 0x788, s790 = fp - 0x790, s798 = fp - 0x798, s7a0 = fp - 0x7a0, s7a8 = fp - 0x7a8, sff0 = fp - 0xff0, s1000 = fp - 0x1000
	let h, i, j, m, o, p, q, t, u, v, y, ab, ac, aj, ak, al, am, an, ao, ap, ar, au, bl, bv, bw, bz, ca, cb, cf: u64
	if (e > 7) {
		let f = e - 8
		if (0x10 > f) {
			j = fn_13b4d0(s6e0, fn_1459d0(0x100159468))
			i = ld64(s6e0)
			st64(a + 8, ld64(s6e0 + 8))
			st64(a, i)
			return j
		}
		const g = f
		if ((f & -8) == 0x10) {
			j = fn_13b4d0(s6e0, fn_1459d0(0x100159468))
			i = ld64(s6e0)
			st64(a + 8, ld64(s6e0 + 8))
			st64(a, i)
			return j
		}
		if ((g & -8) == 0x18) {
			j = fn_13b4d0(s6e0, fn_1459d0(0x100159468))
			i = ld64(s6e0)
			st64(a + 8, ld64(s6e0 + 8))
			st64(a, i)
			return j
		}
		if (f == 0x20) {
			copyr(s700, d + 8, 0x10)
			st64(s710, ld64(d + 0x18))
			let l = 1
			st64(s708, ld64(d + 0x20))
			let k = b
			st64(s6f0, b, c)
			if (c == 0) {
				j = anchor_error_from(s540, 0xbbd /* anchor::AccountNotEnoughKeys */, c, d, f)
				d = undef
				f = undef
				c = ld64(s6f0 + 8)
				b = ld64(s6f0)
				l = 0
				k = ld64(s540 + 8)
				i = ld64(s540)
				if (i != 3) {
					st64(a + 8, k)
					st64(a, i)
					return j
				}
			}
			if (ld8(ld64(k) + 2) == 0) {
				j = anchor_error_from(s550, 0xbbe /* anchor::AccountNotMutable */, c, d, f)
				d = undef
				f = undef
				c = ld64(s6f0 + 8)
				b = ld64(s6f0)
				k = ld64(s550 + 8)
				i = ld64(s550)
				if (i != 3) {
					st64(a + 8, k)
					st64(a, i)
					return j
				}
			}
			if (l >= c) {
				j = anchor_error_from(s560, 0xbbd /* anchor::AccountNotEnoughKeys */, c, d, f)
				f = undef
				m = ld64(s560 + 8)
				i = ld64(s560)
				if (i != 3) {
					st64(a + 8, m)
					st64(a, i)
					return j
				}
			} else {
				m = b + (l << 3)
				l = l + 1
			}
			B21: {
				const n = ld64(m)
				o = 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */
				if (ld64(n + 8) == 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */) {
					o = 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */
					if (ld64(n + 0x10) == 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */) {
						o = 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */
						if (ld64(n + 0x18) == 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */ && ld64(n + 0x20) == 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) {
							break B21
						}
					}
				}
				j = anchor_error_from(s570, 0xbc0 /* anchor::InvalidProgramId */, o, m, f)
				o = undef
				f = undef
				m = ld64(s570 + 8)
				i = ld64(s570)
				if (i != 3) {
					st64(a + 8, m)
					st64(a, i)
					return j
				}
			}
			B24: {
				let r = 0xbbd /* anchor::AccountNotEnoughKeys */
				p = ld64(s6f0 + 8)
				if (p > l) {
					q = ld64(s6f0) + (l << 3)
					r = 0xbc2 /* anchor::AccountNotSigner */
					l = l + 1
					o = ld8(ld64(q) + 1)
					if (o != 0) {
						break B24
					}
				}
				j = anchor_error_from(s580, r, o, m, f)
				o = undef
				f = undef
				p = ld64(s6f0 + 8)
				q = ld64(s580 + 8)
				const s = ld64(s580)
				if (s != 3) {
					st64(a + 8, q)
					st64(a, s)
					return j
				}
			}
			st64(s718, m)
			if (l >= p) {
				j = anchor_error_from(s590, 0xbbd /* anchor::AccountNotEnoughKeys */, o, m, f)
				f = undef
				p = ld64(s6f0 + 8)
				v = ld64(s590 + 8)
				u = ld64(s590)
				t = ld64(s6f0)
				if (u != 3) {
					st64(a + 8, v)
					st64(a, u)
					return j
				}
			} else {
				t = ld64(s6f0)
				v = t + (l << 3)
				l = l + 1
			}
			u = ld8(ld64(v) + 2)
			if (u == 0) {
				j = anchor_error_from(s5a0, 0xbbe /* anchor::AccountNotMutable */, u, v, f)
				f = undef
				p = ld64(s6f0 + 8)
				t = ld64(s6f0)
				v = ld64(s5a0 + 8)
				u = ld64(s5a0)
				if (u != 3) {
					st64(a + 8, v)
					st64(a, u)
					return j
				}
			}
			st64(s720, v)
			if (l >= p) {
				j = anchor_error_from(s5b0, 0xbbd /* anchor::AccountNotEnoughKeys */, u, v, f)
				f = undef
				p = ld64(s6f0 + 8)
				t = ld64(s6f0)
				v = ld64(s5b0 + 8)
				u = ld64(s5b0)
				if (u != 3) {
					st64(a + 8, v)
					st64(a, u)
					return j
				}
			} else {
				u = l << 3
				v = t + u
				l = l + 1
			}
			st64(s728, v)
			if (l >= p) {
				j = anchor_error_from(s5c0, 0xbbd /* anchor::AccountNotEnoughKeys */, u, v, f)
				f = undef
				p = ld64(s6f0 + 8)
				t = ld64(s6f0)
				v = ld64(s5c0 + 8)
				u = ld64(s5c0)
				if (u != 3) {
					st64(a + 8, v)
					st64(a, u)
					return j
				}
			} else {
				v = t + (l << 3)
				l = l + 1
			}
			u = ld8(ld64(v) + 2)
			if (u == 0) {
				j = anchor_error_from(s5d0, 0xbbe /* anchor::AccountNotMutable */, u, v, f)
				f = undef
				p = ld64(s6f0 + 8)
				t = ld64(s6f0)
				v = ld64(s5d0 + 8)
				u = ld64(s5d0)
				if (u != 3) {
					st64(a + 8, v)
					st64(a, u)
					return j
				}
			}
			st64(s730, v)
			if (l >= p) {
				j = anchor_error_from(s5e0, 0xbbd /* anchor::AccountNotEnoughKeys */, u, v, f)
				f = undef
				p = ld64(s6f0 + 8)
				t = ld64(s6f0)
				v = ld64(s5e0 + 8)
				u = ld64(s5e0)
				if (u != 3) {
					st64(a + 8, v)
					st64(a, u)
					return j
				}
			} else {
				v = t + (l << 3)
				l = l + 1
			}
			u = ld8(ld64(v) + 2)
			if (u == 0) {
				j = anchor_error_from(s5f0, 0xbbe /* anchor::AccountNotMutable */, u, v, f)
				f = undef
				p = ld64(s6f0 + 8)
				t = ld64(s6f0)
				v = ld64(s5f0 + 8)
				u = ld64(s5f0)
				if (u != 3) {
					st64(a + 8, v)
					st64(a, u)
					return j
				}
			}
			st64(s738, v)
			if (l >= p) {
				j = anchor_error_from(s600, 0xbbd /* anchor::AccountNotEnoughKeys */, u, v, f)
				u = undef
				v = undef
				f = undef
				h = ld64(s600 + 8)
				i = ld64(s600)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			} else {
				h = t + (l << 3)
				l = l + 1
			}
			if (ld8(ld64(h) + 2) == 0) {
				j = anchor_error_from(s610, 0xbbe /* anchor::AccountNotMutable */, u, v, f)
				u = undef
				v = undef
				f = undef
				h = ld64(s610 + 8)
				i = ld64(s610)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			}
			const w = ld64(s6f0 + 8)
			st64(s740, h)
			if (l >= w) {
				j = anchor_error_from(s620, 0xbbd /* anchor::AccountNotEnoughKeys */, u, v, f)
				u = undef
				v = undef
				f = undef
				h = ld64(s620 + 8)
				i = ld64(s620)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			} else {
				h = ld64(s6f0) + (l << 3)
				l = l + 1
			}
			if (ld8(ld64(h) + 2) == 0) {
				j = anchor_error_from(s630, 0xbbe /* anchor::AccountNotMutable */, u, v, f)
				u = undef
				v = undef
				f = undef
				h = ld64(s630 + 8)
				i = ld64(s630)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			}
			const x = ld64(s6f0 + 8)
			st64(s748, h)
			if (l >= x) {
				j = anchor_error_from(s640, 0xbbd /* anchor::AccountNotEnoughKeys */, u, v, f)
				v = undef
				f = undef
				y = ld64(s640 + 8)
				i = ld64(s640)
				if (i != 3) {
					st64(a + 8, y)
					st64(a, i)
					return j
				}
			} else {
				y = ld64(s6f0) + (l << 3)
				l = l + 1
			}
			if (ld8(ld64(y) + 2) == 0) {
				j = anchor_error_from(s650, 0xbbe /* anchor::AccountNotMutable */, y, v, f)
				v = undef
				f = undef
				y = ld64(s650 + 8)
				i = ld64(s650)
				if (i != 3) {
					st64(a + 8, y)
					st64(a, i)
					return j
				}
			}
			const aa = ld64(s6f0)
			const z = ld64(s6f0 + 8)
			st64(s750, y)
			if (l >= z) {
				j = anchor_error_from(s660, 0xbbd /* anchor::AccountNotEnoughKeys */, y, v, f)
				y = undef
				v = undef
				f = undef
				ac = ld64(s660 + 8)
				ab = ld64(s660)
				if (ab != 3) {
					st64(a + 8, ac)
					st64(a, ab)
					return j
				}
			} else {
				ac = aa + (l << 3)
			}
			if (ld8(ld64(ac) + 2) == 0) {
				j = anchor_error_from(s670, 0xbbe /* anchor::AccountNotMutable */, y, v, f)
				y = undef
				v = undef
				f = undef
				ac = ld64(s670 + 8)
				ab = ld64(s670)
				if (ab != 3) {
					st64(a + 8, ac)
					st64(a, ab)
					return j
				}
			}
			const at = ac
			j = fn_22210(s1c0, ld64(k), y, v, f)
			const ae = ld8(s1b0)
			const af = ld64(s1c0 + 8)
			const ad = ld64(s1c0)
			st64(s768, ad)
			if (ad == 0) {
				st32(s530 + 3, ld32(s1b0 + 4))
				st32(s530, ld32(s1b0 + 1))
				st32(a + 0xc, ld32(s530 + 3))
				st32(a + 9, ld32(s530))
				st8(a + 8, ae)
				st64(a, af)
				return j
			}
			st64(s6f0, ae, af)
			j = fn_21f70(s1c0, ld64(ld64(s720)), ae)
			st64(s760, ld8(s1b0))
			st64(s758, ld64(s1c0 + 8))
			const ag = ld64(s1c0)
			if (ag == 0) {
				st32(s530 + 3, ld32(s1b0 + 4))
				st32(s530, ld32(s1b0 + 1))
				st32(a + 0xc, ld32(s530 + 3))
				st32(a + 9, ld32(s530))
				st8(a + 8, ld64(s760))
				st64(a, ld64(s758))
				bw = ld64(s6f0 + 8)
				st8(bw, ld8(bw) | ld64(s6f0))
				return j
			}
			B102: {
				st64(s778, q)
				const ah = ld64(k)
				st64(s770, ag)
				st64(s780, ah + 8)
				j = fn_228d8(s1c0, ag + 8, ah + 8, undef, undef, j)
				if (ld64(s1c0) == 3) {
					j = fn_224b0(s1c0, ld64(ld64(s728)), undef, undef, undef, j)
					st64(s728, ld64(s1c0))
					if (ld8(s1b0 + 0x10) == 2) {
						st64(a + 8, ld64(s1c0 + 8))
						st64(a, ld64(s728))
						bv = ld64(s758)
						st8(bv, ld8(bv) | ld64(s760))
						bw = ld64(s6f0 + 8)
						st8(bw, ld8(bw) | ld64(s6f0))
						return j
					}
					B86: {
						an = ld8(s1b0 + 8)
						ao = ld64(s1b0)
						const ai = memcmp(ld64(s728), ld64(s770) + 0x28, 0x20)
						j = ai as u32
						if (j != 0) {
							j = anchor_error_from(s680, 0x7d3 /* anchor::ConstraintRaw */, aj, ak, al)
							am = ld64(s680)
							if (am != 3) {
								ap = ld64(s680 + 8)
								break B86
							}
						}
						if (ld64(ld64(s728) + 0x40) != 1) {
							j = anchor_error_from(s690, 0x7d3 /* anchor::ConstraintRaw */, aj, ak, al)
							am = ld64(s690)
							if (am != 3) {
								ap = ld64(s690 + 8)
								break B86
							}
						}
						j = fn_228d8(s1c0, ld64(ld64(s740)) + 8, ld64(s768) + 0x85, ak, al, j)
						if (ld64(s1c0) == 3) {
							j = fn_228d8(s1c0, ld64(ld64(s748)) + 8, ld64(s768) + 0xd5, undef, undef, j)
							if (ld64(s1c0) == 3) {
								j = fn_1d488(s1c0, ld64(s728), ld64(ld64(s778)))
								if (ld64(s1c0) == 3) {
									st8(ao, ld8(ao) + (1 << (an & 7)))
									j = clock_get_139448(s1c0)
									if (ld32(s1c0) == 0) {
										B109: {
											if ((ld64(s700) | ld64(s700 + 8)) == 0) {
												j = fn_87630(s6d0, 0xc)
												ar = ld64(s6d0)
												ca = ld64(s6d0 + 8)
											} else {
												if ((ld64(s700 + 8) as i64) >= 0) {
													const aq = ld64(s1b0 + 0x18)
													st64(s728, aq)
													if (-1 >= (aq as i64)) {
														j = fn_87630(s6a0, 0x15)
														st64(s728, ld64(s6a0 + 8))
														ar = ld64(s6a0)
														if (ar != 2) {
															ca = ld64(s728)
															break B109
														}
													}
													j = fn_21378(s1c0, ld64(ld64(s750)), ld64(at), ld64(s780), au, j)
													let ba = ld64(s1b0)
													ar = ld64(s1c0 + 8)
													const av = ld64(s1c0)
													if (av != 0) {
														const aw = ld64(s1b0 + 0x10)
														let ay = av
														let ax = ar
														st64(s788, aw)
														if (aw != 0) {
															ax = ld64(s1b0 + 0x18)
															ay = ld64(s788)
														}
														st64(s7a0, ld8(s1b0 + 0x28))
														st64(s798, ld64(s1b0 + 0x20))
														st64(s790, ld8(s1b0 + 8))
														st64(sff0 + 0x10, ld64(s700 + 8))
														st64(sff0 + 0x18, ld64(s728))
														st64(sff0 + 8, ld64(s700))
														st64(s1000, ar, ay, ax)
														j = fn_159d0(s1c0, ld64(s768), ld64(s770), av, ar, ay, ax, ld64(sff0 + 8), ld64(sff0 + 0x10), ld64(sff0 + 0x18))
														const az = ld8(s1b0 + 0x1a0)
														if (az == 2) {
															const bx = ld64(s1c0 + 8)
															st64(s370 + 8, bx)
															const by = ld64(s1c0)
															st64(s370, by)
															st64(a + 8, bx)
															st64(a, by)
															st8(ba, ld8(ba) | ld64(s790))
															if (ld64(s788) == 0) {
																bv = ld64(s758)
																st8(bv, ld8(bv) | ld64(s760))
																bw = ld64(s6f0 + 8)
																st8(bw, ld8(bw) | ld64(s6f0))
																return j
															}
															bz = ld64(s798)
															st8(bz, ld8(bz) | ld64(s7a0))
															bv = ld64(s758)
															st8(bv, ld8(bv) | ld64(s760))
															bw = ld64(s6f0 + 8)
															st8(bw, ld8(bw) | ld64(s6f0))
															return j
														}
														st64(s7a8, s370)
														memcpy(s370, s1c0, 0x1b0)
														st64(s530 + 0x1b1, ld64(s1b0 + 0x1a1))
														st64(s530 + 0x1b8, ld64(s1b0 + 0x1a8))
														memcpy(s530, ld64(s7a8), 0x1b0)
														st8(s530 + 0x1b0, az)
														st8(ba, ld8(ba) | ld64(s790))
														if (ld64(s788) != 0) {
															const bb = ld64(s798)
															st8(bb, ld8(bb) | ld64(s7a0))
														}
														const bh = ld64(at)
														const bg = ld64(ld64(s750))
														const bf = ld64(ld64(s720))
														const be = ld8(s530 + 0x1b8)
														const bd = ld8(s530 + 0x1b9)
														const bc = ld8(s530 + 0x1bb)
														st64(sff0, ld8(s530 + 0x1ba))
														st64(sff0 + 8, bc)
														st64(s1000, be, bd)
														j = fn_1ba30(s1c0, bf, bg, bh, be, bd, ld64(sff0), bc)
														if (ld64(s1c0) != 3) {
															break B102
														}
														j = fn_21378(s1c0, ld64(ld64(s750)), ld64(at), ld64(s780), undef, j)
														ba = ld64(s1b0)
														ar = ld64(s1c0 + 8)
														const bi = ld64(s1c0)
														if (bi != 0) {
															B112: {
																B111: {
																	st64(s790, ld8(s1b0 + 0x28))
																	st64(s788, ld64(s1b0 + 0x20))
																	st64(s750, ld8(s1b0 + 8))
																	bl = ld64(s1b0 + 0x10)
																	const bj = ld64(s1b0 + 0x18)
																	const bk = ld64(ar + 0x38)
																	st64(sff0 + 8, s530)
																	st64(sff0 + 0x10, ld64(s728))
																	st64(s1000, bk, bl, bj)
																	j = fn_1aa28(s1c0, ld64(s768), ld64(s770), bi, bk, bl, bj, s530, ld64(sff0 + 0x10))
																	if (ld64(s1c0) == 3) {
																		const bm = ld64(s768)
																		const bs = ld64(bm + 0x49)
																		const br = ld64(bm + 0x41)
																		const bq = ld32(bm + 0x51)
																		const bn = ld64(s770)
																		const bp = ld32(bn + 0x58)
																		const bo = ld32(bn + 0x5c)
																		copy(sff0, s700, 0x10)
																		st64(s1000, bp, bo)
																		j = fn_1ad88(s1c0, bq, br, bs, bp, bo, ld64(sff0), ld64(sff0 + 8))
																		const bt = ld64(s1b0)
																		const bu = ld64(s1c0 + 8)
																		if (ld64(s1c0) != 0) {
																			st64(a + 8, bt)
																			st64(a, bu)
																			break B112
																		}
																		if (ld64(s710) >= bu && ld64(s708) >= bt) {
																			st64(s1b0, ld64(s740))
																			st64(s1c0 + 8, ld64(s730))
																			st64(s728, bu)
																			st64(s1b0 + 0x10, bu)
																			st64(s1b0 + 8, ld64(s778))
																			st64(s1c0, ld64(s718))
																			cpi_token_transfer(s1c0, 8, 0)
																			st64(s1b0 + 8, ld64(s778))
																			st64(s1b0, ld64(s748))
																			st64(s1c0 + 8, ld64(s738))
																			st64(s1c0, ld64(s718))
																			st64(s1b0 + 0x10, bt)
																			cpi_token_transfer(s1c0, 8, 0)
																			const cd = ld64(ld64(s720))
																			const cc = ld64(ld64(s770) + 0x58)
																			copyr(s1b0, s700, 0x10)
																			st64(s1b0 + 0x30, ld64(s780))
																			st64(s1b0 + 0x18, bt)
																			st64(s1b0 + 0x10, ld64(s728))
																			st64(s1c0 + 4, cc)
																			st64(s1b0 + 0x38, cd + 8)
																			st64(s1b0 + 0x20, 0)
																			st8(s1c0, 0)
																			st64(s1b0 + 0x28, 0)
																			j = fn_15490(s370, s1c0)
																			if (ld64(s370) != 3) {
																				st64(a + 8, ld64(s370 + 8))
																				cb = ld64(s370)
																				break B111
																			}
																			st64(a, 3)
																			st8(ba, ld8(ba) | ld64(s750))
																			if (bl == 0) {
																				cf = ld64(s758)
																				st8(cf, ld8(cf) | ld64(s760))
																				bw = ld64(s6f0 + 8)
																				st8(bw, ld8(bw) | ld64(s6f0))
																				return j
																			}
																			const ce = ld64(s788)
																			st8(ce, ld8(ce) | ld64(s790))
																			cf = ld64(s758)
																			st8(cf, ld8(cf) | ld64(s760))
																			bw = ld64(s6f0 + 8)
																			st8(bw, ld8(bw) | ld64(s6f0))
																			return j
																		}
																		j = fn_87630(s6b0, 0x11)
																		cb = ld64(s6b0)
																		st64(a + 8, ld64(s6b0 + 8))
																	} else {
																		st64(a + 8, ld64(s1c0 + 8))
																		cb = ld64(s1c0)
																	}
																}
																st64(a, cb)
															}
															st8(ba, ld8(ba) | ld64(s750))
															if (bl == 0) {
																bv = ld64(s758)
																st8(bv, ld8(bv) | ld64(s760))
																bw = ld64(s6f0 + 8)
																st8(bw, ld8(bw) | ld64(s6f0))
																return j
															}
															bz = ld64(s788)
															st8(bz, ld8(bz) | ld64(s790))
															bv = ld64(s758)
															st8(bv, ld8(bv) | ld64(s760))
															bw = ld64(s6f0 + 8)
															st8(bw, ld8(bw) | ld64(s6f0))
															return j
														}
													}
													st64(a + 8, ba)
													st64(a, ar)
													bv = ld64(s758)
													st8(bv, ld8(bv) | ld64(s760))
													bw = ld64(s6f0 + 8)
													st8(bw, ld8(bw) | ld64(s6f0))
													return j
												}
												j = fn_87630(s6c0, 0xd)
												ar = ld64(s6c0)
												ca = ld64(s6c0 + 8)
											}
										}
										st64(a + 8, ca)
										st64(a, ar)
										bv = ld64(s758)
										st8(bv, ld8(bv) | ld64(s760))
										bw = ld64(s6f0 + 8)
										st8(bw, ld8(bw) | ld64(s6f0))
										return j
									}
									st64(a + 8, ld64(s1c0 + 4))
									st64(a, 2)
									bv = ld64(s758)
									st8(bv, ld8(bv) | ld64(s760))
									bw = ld64(s6f0 + 8)
									st8(bw, ld8(bw) | ld64(s6f0))
									return j
								}
							}
						}
						st64(a + 8, ld64(s1c0 + 8))
						st64(a, ld64(s1c0))
						st8(ao, ld8(ao) + (1 << (an & 7)))
						bv = ld64(s758)
						st8(bv, ld8(bv) | ld64(s760))
						bw = ld64(s6f0 + 8)
						st8(bw, ld8(bw) | ld64(s6f0))
						return j
					}
					st64(a, am, ap)
					st8(ao, ld8(ao) + (1 << (an & 7)))
					bv = ld64(s758)
					st8(bv, ld8(bv) | ld64(s760))
					bw = ld64(s6f0 + 8)
					st8(bw, ld8(bw) | ld64(s6f0))
					return j
				}
			}
			st64(a + 8, ld64(s1c0 + 8))
			st64(a, ld64(s1c0))
			bv = ld64(s758)
			st8(bv, ld8(bv) | ld64(s760))
			bw = ld64(s6f0 + 8)
			st8(bw, ld8(bw) | ld64(s6f0))
			return j
		}
		j = fn_13b4d0(s6e0, fn_b6a0(0x15, "Not all bytes read", 0x12, d, f))
		i = ld64(s6e0)
		st64(a + 8, ld64(s6e0 + 8))
		st64(a, i)
		return j
	}
	fn_14c4f0(8, e, 0x100159ab0, d, e)
}

export function fn_28148(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, s1b0 = fp - 0x1b0, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s370 = fp - 0x370, s530 = fp - 0x530, s650 = fp - 0x650, s660 = fp - 0x660, s668 = fp - 0x668, s698 = fp - 0x698, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s700 = fp - 0x700, s710 = fp - 0x710, s720 = fp - 0x720, s730 = fp - 0x730, s740 = fp - 0x740, s750 = fp - 0x750, s760 = fp - 0x760, s770 = fp - 0x770, s780 = fp - 0x780, s790 = fp - 0x790, s7a0 = fp - 0x7a0, s7b0 = fp - 0x7b0, s7c0 = fp - 0x7c0, s7d0 = fp - 0x7d0, s7e0 = fp - 0x7e0, s7f0 = fp - 0x7f0, s800 = fp - 0x800, s810 = fp - 0x810, s820 = fp - 0x820, s830 = fp - 0x830, s840 = fp - 0x840, s850 = fp - 0x850, s860 = fp - 0x860, s870 = fp - 0x870, s880 = fp - 0x880, s890 = fp - 0x890, s8a0 = fp - 0x8a0, s8b0 = fp - 0x8b0, s8c0 = fp - 0x8c0, s8d0 = fp - 0x8d0, s8e0 = fp - 0x8e0, s8f0 = fp - 0x8f0, s910 = fp - 0x910, s990 = fp - 0x990, s998 = fp - 0x998, s9a0 = fp - 0x9a0, s9a8 = fp - 0x9a8, s9b0 = fp - 0x9b0, s9b8 = fp - 0x9b8, s9c0 = fp - 0x9c0, s9c8 = fp - 0x9c8, s9d0 = fp - 0x9d0, s9d8 = fp - 0x9d8, s9e0 = fp - 0x9e0, s9e8 = fp - 0x9e8, s9f0 = fp - 0x9f0, sfe8 = fp - 0xfe8, sff0 = fp - 0xff0, s1000 = fp - 0x1000
	let i, j, k, l, m, o, r, u, w, y, ah, aj, ak, al, am, aw, ay, az, ba, bl, cp, ct, cw, cx, cy: u64
	st64(s910 + 0x18, b)
	if (e > 7) {
		st64(s370, d + 8, e - 8)
		fn_11b068(s1c0, s370)
		const g = ld64(s1b8)
		const f = ld64(s1c0)
		if (f == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
			j = fn_13b4d0(s8f0, g)
			i = ld64(s8f0)
			st64(a + 8, ld64(s8f0 + 8))
			st64(a, i)
			return j
		}
		memcpy(s530, s1b0, 0x38)
		if (ld64(s370 + 8) == 0) {
			memcpy(s6a0, s530, 0x38)
			st64(s6b0, f, g)
			let n = 1
			const x = ld64(s698 + 0x18)
			st64(s990 + 0x70, ld64(s698 + 0x10))
			copyr(s910, s698, 0x10)
			st64(s910 + 0x10, ld64(s698 + 0x28))
			st64(s990 + 0x78, ld64(s698 + 0x20))
			let h = ld64(s910 + 0x18)
			if (c == 0) {
				j = anchor_error_from(s6c0, 0xbbd /* anchor::AccountNotEnoughKeys */, k, l, m)
				n = 0
				h = ld64(s6c0 + 8)
				i = ld64(s6c0)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			}
			if (ld8(ld64(h) + 2) == 0) {
				j = anchor_error_from(s6d0, 0xbbe /* anchor::AccountNotMutable */, k, l, m)
				h = ld64(s6d0 + 8)
				i = ld64(s6d0)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			}
			st64(s990 + 0x68, h)
			if (n >= c) {
				j = anchor_error_from(s6e0, 0xbbd /* anchor::AccountNotEnoughKeys */, k, l, m)
				o = ld64(s6e0 + 8)
				i = ld64(s6e0)
				if (i != 3) {
					st64(a + 8, o)
					st64(a, i)
					return j
				}
			} else {
				o = ld64(s910 + 0x18) + (n << 3)
				n = n + 1
			}
			B22: {
				const p = ld64(o)
				const q = ld64(p + 8)
				if (q == 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */) {
					r = 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */
					if (ld64(p + 0x10) == 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */) {
						r = 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */
						if (ld64(p + 0x18) == 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */ && ld64(p + 0x20) == 0xfc8ba1d828f9bdfe /* TOKEN_2022_PROGRAM[3] */) {
							break B22
						}
					}
				} else {
					r = 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */
					if (q == 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */) {
						r = 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */
						if (ld64(p + 0x10) == 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */) {
							r = 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */
							if (ld64(p + 0x18) == 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */ && ld64(p + 0x20) == 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) {
								break B22
							}
						}
					}
				}
				j = anchor_error_from(s6f0, 0xbc0 /* anchor::InvalidProgramId */, r, o, m)
				r = undef
				o = ld64(s6f0 + 8)
				i = ld64(s6f0)
				if (i != 3) {
					st64(a + 8, o)
					st64(a, i)
					return j
				}
			}
			st64(s990 + 0x60, o)
			if (n >= c) {
				j = anchor_error_from(s700, 0xbbd /* anchor::AccountNotEnoughKeys */, r, o, m)
				o = ld64(s700 + 8)
				i = ld64(s700)
				if (i != 3) {
					st64(a + 8, o)
					st64(a, i)
					return j
				}
			} else {
				o = ld64(s910 + 0x18) + (n << 3)
				n = n + 1
			}
			B34: {
				const s = ld64(o)
				const t = ld64(s + 8)
				if (t == 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */) {
					u = 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */
					if (ld64(s + 0x10) == 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */) {
						u = 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */
						if (ld64(s + 0x18) == 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */ && ld64(s + 0x20) == 0xfc8ba1d828f9bdfe /* TOKEN_2022_PROGRAM[3] */) {
							break B34
						}
					}
				} else {
					u = 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */
					if (t == 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */) {
						u = 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */
						if (ld64(s + 0x10) == 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */) {
							u = 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */
							if (ld64(s + 0x18) == 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */ && ld64(s + 0x20) == 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) {
								break B34
							}
						}
					}
				}
				j = anchor_error_from(s710, 0xbc0 /* anchor::InvalidProgramId */, u, o, m)
				u = undef
				o = ld64(s710 + 8)
				i = ld64(s710)
				if (i != 3) {
					st64(a + 8, o)
					st64(a, i)
					return j
				}
			}
			st64(s990 + 0x58, o)
			if (n >= c) {
				j = anchor_error_from(s720, 0xbbd /* anchor::AccountNotEnoughKeys */, u, o, m)
				o = ld64(s720 + 8)
				i = ld64(s720)
				if (i != 3) {
					st64(a + 8, o)
					st64(a, i)
					return j
				}
			} else {
				o = ld64(s910 + 0x18) + (n << 3)
				n = n + 1
			}
			B42: {
				const v = ld64(o)
				w = 0x62129995a534a05 /* MEMO_PROGRAM */
				if (ld64(v + 8) == 0x62129995a534a05 /* MEMO_PROGRAM */) {
					w = 0x7c38da6071e8244d /* MEMO_PROGRAM[1] */
					if (ld64(v + 0x10) == 0x7c38da6071e8244d /* MEMO_PROGRAM[1] */) {
						w = 0x81bb92bcddb5357c /* MEMO_PROGRAM[2] */
						if (ld64(v + 0x18) == 0x81bb92bcddb5357c /* MEMO_PROGRAM[2] */ && ld64(v + 0x20) == 0x8d44054140a81fe4 /* MEMO_PROGRAM[3] */) {
							break B42
						}
					}
				}
				j = anchor_error_from(s730, 0xbc0 /* anchor::InvalidProgramId */, w, o, m)
				w = undef
				o = ld64(s730 + 8)
				i = ld64(s730)
				if (i != 3) {
					st64(a + 8, o)
					st64(a, i)
					return j
				}
			}
			B45: {
				st64(s990 + 0x50, x)
				let z = 0xbbd /* anchor::AccountNotEnoughKeys */
				if (c > n) {
					y = ld64(s910 + 0x18) + (n << 3)
					z = 0xbc2 /* anchor::AccountNotSigner */
					n = n + 1
					if (ld8(ld64(y) + 1) != 0) {
						break B45
					}
				}
				j = anchor_error_from(s740, z, w, o, m)
				w = undef
				y = ld64(s740 + 8)
				i = ld64(s740)
				if (i != 3) {
					st64(a + 8, y)
					st64(a, i)
					return j
				}
			}
			st64(s990 + 0x48, o)
			if (n >= c) {
				j = anchor_error_from(s750, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, m)
				w = undef
				o = undef
				h = ld64(s750 + 8)
				i = ld64(s750)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			} else {
				h = ld64(s910 + 0x18) + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(h) + 2) == 0) {
				j = anchor_error_from(s760, 0xbbe /* anchor::AccountNotMutable */, w, o, m)
				w = undef
				o = undef
				h = ld64(s760 + 8)
				i = ld64(s760)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			}
			st64(s990 + 0x40, h)
			if (n >= c) {
				j = anchor_error_from(s770, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, m)
				w = undef
				o = undef
				h = ld64(s770 + 8)
				i = ld64(s770)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			} else {
				h = ld64(s910 + 0x18) + (n << 3)
				n = n + 1
			}
			st64(s990 + 0x38, h)
			if (n >= c) {
				j = anchor_error_from(s780, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, m)
				w = undef
				o = undef
				h = ld64(s780 + 8)
				i = ld64(s780)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			} else {
				h = ld64(s910 + 0x18) + (n << 3)
				n = n + 1
			}
			st64(s990 + 0x30, h)
			if (n >= c) {
				j = anchor_error_from(s790, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, m)
				w = undef
				o = undef
				h = ld64(s790 + 8)
				i = ld64(s790)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			} else {
				h = ld64(s910 + 0x18) + (n << 3)
				n = n + 1
			}
			st64(s990 + 0x28, h)
			if (n >= c) {
				j = anchor_error_from(s7a0, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, m)
				w = undef
				o = undef
				h = ld64(s7a0 + 8)
				i = ld64(s7a0)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			} else {
				h = ld64(s910 + 0x18) + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(h) + 2) == 0) {
				j = anchor_error_from(s7b0, 0xbbe /* anchor::AccountNotMutable */, w, o, m)
				w = undef
				o = undef
				h = ld64(s7b0 + 8)
				i = ld64(s7b0)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			}
			st64(s990 + 0x20, h)
			if (n >= c) {
				j = anchor_error_from(s7c0, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, m)
				w = undef
				o = undef
				h = ld64(s7c0 + 8)
				i = ld64(s7c0)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			} else {
				h = ld64(s910 + 0x18) + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(h) + 2) == 0) {
				j = anchor_error_from(s7d0, 0xbbe /* anchor::AccountNotMutable */, w, o, m)
				w = undef
				o = undef
				h = ld64(s7d0 + 8)
				i = ld64(s7d0)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			}
			st64(s990 + 0x18, h)
			if (n >= c) {
				j = anchor_error_from(s7e0, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, m)
				w = undef
				o = undef
				h = ld64(s7e0 + 8)
				i = ld64(s7e0)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			} else {
				h = ld64(s910 + 0x18) + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(h) + 2) == 0) {
				j = anchor_error_from(s7f0, 0xbbe /* anchor::AccountNotMutable */, w, o, m)
				w = undef
				o = undef
				h = ld64(s7f0 + 8)
				i = ld64(s7f0)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			}
			st64(s990 + 0x10, h)
			if (n >= c) {
				j = anchor_error_from(s800, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, m)
				w = undef
				o = undef
				h = ld64(s800 + 8)
				i = ld64(s800)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			} else {
				h = ld64(s910 + 0x18) + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(h) + 2) == 0) {
				j = anchor_error_from(s810, 0xbbe /* anchor::AccountNotMutable */, w, o, m)
				w = undef
				o = undef
				h = ld64(s810 + 8)
				i = ld64(s810)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			}
			st64(s990, y, h)
			if (n >= c) {
				j = anchor_error_from(s820, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, m)
				w = undef
				o = undef
				h = ld64(s820 + 8)
				i = ld64(s820)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			} else {
				h = ld64(s910 + 0x18) + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(h) + 2) == 0) {
				j = anchor_error_from(s830, 0xbbe /* anchor::AccountNotMutable */, w, o, m)
				w = undef
				o = undef
				h = ld64(s830 + 8)
				i = ld64(s830)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			}
			st64(s9a8, h)
			if (n >= c) {
				j = anchor_error_from(s840, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, m)
				w = undef
				o = undef
				h = ld64(s840 + 8)
				i = ld64(s840)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			} else {
				h = ld64(s910 + 0x18) + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(h) + 2) == 0) {
				j = anchor_error_from(s850, 0xbbe /* anchor::AccountNotMutable */, w, o, m)
				w = undef
				o = undef
				h = ld64(s850 + 8)
				i = ld64(s850)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			}
			st64(s9b8, h)
			if (c >= n) {
				j = fn_22210(s1c0, ld64(ld64(s990 + 0x68)), w, o, m)
				st64(s9a0, ld8(s1b0))
				st64(s998, ld64(s1b8))
				const aa = ld64(s1c0)
				st64(s9b0, aa)
				if (aa == 0) {
					st32(s530 + 3, ld32(s1b0 + 4))
					st32(s530, ld32(s1b0 + 1))
					st32(a + 0xc, ld32(s530 + 3))
					st32(a + 9, ld32(s530))
					st8(a + 8, ld64(s9a0))
					st64(a, ld64(s998))
					return j
				}
				const ab = ld64(ld64(s990 + 0x30))
				j = fn_228d8(s1c0, ld64(ld64(s990 + 0x60)) + 8, ab + 0x28, undef, undef, j)
				if (ld64(s1c0) == 3) {
					const ad = ld64(ld64(s990 + 0x28))
					const ac = ld64(ld64(s990 + 0x58))
					st64(s9c0, ad)
					j = fn_228d8(s1c0, ac + 8, ad + 0x28, undef, undef, j)
					if (ld64(s1c0) == 3) {
						j = fn_21f70(s1c0, ld64(ld64(s990 + 0x40)))
						st64(s9d0, ld8(s1b0))
						st64(s9c8, ld64(s1b8))
						const ae = ld64(s1c0)
						st64(s9d8, ae)
						if (ae == 0) {
							st32(s530 + 3, ld32(s1b0 + 4))
							st32(s530, ld32(s1b0 + 1))
							st32(a + 0xc, ld32(s530 + 3))
							st32(a + 9, ld32(s530))
							st8(a + 8, ld64(s9d0))
							st64(a, ld64(s9c8))
							ah = ld64(s998)
							st8(ah, ld8(ah) | ld64(s9a0))
							return j
						}
						const ag = ld64(ld64(s990 + 0x68))
						const af = ld64(s9d8)
						st64(s9e0, ag + 8)
						j = fn_228d8(s1c0, af + 8, ag + 8, undef, undef, j)
						if (ld64(s1c0) == 3) {
							j = fn_224b0(s1c0, ld64(ld64(s990 + 0x38)), undef, undef, undef, j)
							st64(s990 + 0x68, ld64(s1c0))
							if (ld8(s1a0) == 2) {
								st64(a + 8, ld64(s1b8))
								st64(a, ld64(s990 + 0x68))
								ay = ld64(s9c8)
								st8(ay, ld8(ay) | ld64(s9d0))
								ah = ld64(s998)
								st8(ah, ld8(ah) | ld64(s9a0))
								return j
							}
							B122: {
								B121: {
									st64(s9e8, ld8(s1a8))
									st64(s990 + 0x38, ld64(s1b0))
									const ai = memcmp(ld64(s990 + 0x68), ld64(s9d8) + 0x28, 0x20)
									j = ai as u32
									if (j != 0) {
										j = anchor_error_from(s860, 0x7d3 /* anchor::ConstraintRaw */, aj, ak, al)
										am = ld64(s860)
										if (am != 3) {
											aw = ld64(s860 + 8)
											break B121
										}
									}
									if (ld64(ld64(s990 + 0x68) + 0x40) != 1) {
										j = anchor_error_from(s870, 0x7d3 /* anchor::ConstraintRaw */, aj, ak, al)
										am = ld64(s870)
										if (am != 3) {
											aw = ld64(s870 + 8)
											break B121
										}
									}
									j = fn_228d8(s1c0, ab + 8, ld64(s9b0) + 0x65 /* anchor::InstructionFallbackNotFound */, ak, al, j)
									if (ld64(s1c0) == 3) {
										j = fn_228d8(s1c0, ld64(s9c0) + 8, ld64(s9b0) + 0xb5, undef, undef, j)
										if (ld64(s1c0) == 3) {
											j = fn_228d8(s1c0, ld64(ld64(s990 + 0x10)) + 8, ld64(s9b0) + 0x85, undef, undef, j)
											if (ld64(s1c0) == 3) {
												j = fn_228d8(s1c0, ld64(ld64(s990 + 8)) + 8, ld64(s9b0) + 0xd5, undef, undef, j)
												if (ld64(s1c0) == 3) {
													j = fn_1d488(s1c0, ld64(s990 + 0x68), ld64(ld64(s990)))
													if (ld64(s1c0) == 3) {
														B124: {
															const an = ld64(s990 + 0x38)
															st8(an, ld8(an) + (1 << (ld64(s9e8) & 7)))
															const ao = ld64(ld64(s9b0) + 0x41)
															const ap = ld64(s910)
															st64(s990 + 0x68, ao)
															const aq = ld64(ld64(s9b0) + 0x49)
															const ar = ld64(s910 + 8)
															st64(s910, aq)
															if ((ld64(s910) != ld64(s910 + 8) ? ar > aq : ap > ao) == 0) {
																let av = ld64(s990 + 0x68) > ld64(s990 + 0x70)
																const au = ld64(s910) > ld64(s990 + 0x50)
																const at = ld64(s910)
																av = at != ld64(s990 + 0x50) ? au : av
																if ((av & 1) == 0) {
																	j = fn_1d6c0(s1c0, ld64(ld64(s990 + 0x30)), ld64(s990 + 0x78), at, undef, j)
																	const bb = ld64(s1b8)
																	if (ld64(s1c0) != 0) {
																		st64(a + 8, ld64(s1b0))
																		st64(a, bb)
																		ay = ld64(s9c8)
																		st8(ay, ld8(ay) | ld64(s9d0))
																		ah = ld64(s998)
																		st8(ah, ld8(ah) | ld64(s9a0))
																		return j
																	}
																	j = fn_1d6c0(s1c0, ld64(ld64(s990 + 0x28)), ld64(s910 + 0x10), undef, undef, j)
																	ba = ld64(s1b8)
																	if (ld64(s1c0) == 0) {
																		const bc = ld64(s9d8)
																		const be = ld32(bc + 0x58)
																		const bd = ld32(bc + 0x5c)
																		st64(s1000, bd, bb, ba)
																		fn_55bd0(s1c0, ld64(s990 + 0x68), ld64(s910), be, bd, bb, ba, j)
																		if (ld32(s1c0) == 0) {
																			const bg = ld64(s1b0)
																			const bf = ld64(s1b8)
																			st64(s990 + 0x70, bf)
																			st64(s910 + 8, bg)
																			if ((bf | bg) == 0) {
																				j = fn_87630(s8d0, 0xc)
																				ba = ld64(s8d0)
																				az = ld64(s8d0 + 8)
																				break B124
																			}
																			j = clock_get_139448(s1c0)
																			if (ld32(s1c0) != 0) {
																				st64(a + 8, ld64(s1c0 + 4))
																				st64(a, 2)
																				ay = ld64(s9c8)
																				st8(ay, ld8(ay) | ld64(s9d0))
																				ah = ld64(s998)
																				st8(ah, ld8(ah) | ld64(s9a0))
																				return j
																			}
																			const bh = ld64(s910 + 0x18)
																			let bj = ld64(s1a0 + 8)
																			st64(s1000, 0x100152bf5, 2)
																			j = fn_1c688(s1c0, bh + (n << 3), c - n, s6b0, 0x100152bf5, 2)
																			copy(s530, s1b8, 0x10)
																			const bi = ld64(s1c0)
																			if (bi == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
																				st64(a + 8, ld64(s530 + 8))
																				st64(a, ld64(s530))
																				ay = ld64(s9c8)
																				st8(ay, ld8(ay) | ld64(s9d0))
																				ah = ld64(s998)
																				st8(ah, ld8(ah) | ld64(s9a0))
																				return j
																			}
																			st64(s910 + 0x18, s650)
																			let bm = memcpy(s650, s1a8, 0x120)
																			st64(s668, bi)
																			copy(s660, s530, 0x10)
																			if (0 > (ld64(s910 + 8) as i64)) {
																				bm = fn_87630(s8c0, 0xd)
																				const cm = ld64(s8c0)
																				st64(a + 8, ld64(s8c0 + 8))
																				st64(a, cm)
																				j = fn_bc78(bm)
																				ay = ld64(s9c8)
																				st8(ay, ld8(ay) | ld64(s9d0))
																				ah = ld64(s998)
																				st8(ah, ld8(ah) | ld64(s9a0))
																				return j
																			}
																			if (-1 >= (bj as i64)) {
																				bm = fn_87630(s890, 0x15)
																				bj = ld64(s890 + 8)
																				const bk = ld64(s890)
																				if (bk != 2) {
																					st64(a + 8, bj)
																					st64(a, bk)
																					j = fn_bc78(bm)
																					ay = ld64(s9c8)
																					st8(ay, ld8(ay) | ld64(s9d0))
																					ah = ld64(s998)
																					st8(ah, ld8(ah) | ld64(s9a0))
																					return j
																				}
																			}
																			bm = fn_21378(s1c0, ld64(ld64(s9a8)), ld64(ld64(s9b8)), ld64(s9e0), bl, bm)
																			const bt = ld64(s1b0)
																			const bo = ld64(s1b8)
																			const bn = ld64(s1c0)
																			if (bn == 0) {
																				st64(a + 8, bt)
																				st64(a, bo)
																				j = fn_bc78(bm)
																				ay = ld64(s9c8)
																				st8(ay, ld8(ay) | ld64(s9d0))
																				ah = ld64(s998)
																				st8(ah, ld8(ah) | ld64(s9a0))
																				return j
																			}
																			const bp = ld64(s1a0)
																			let br = bn
																			let bq = bo
																			st64(s990 + 0x50, bp)
																			if (bp != 0) {
																				bq = ld64(s1a0 + 8)
																				br = ld64(s990 + 0x50)
																			}
																			st64(s9e8, ld8(s1a0 + 0x18))
																			st64(s9c0, ld64(s1a0 + 0x10))
																			st64(s990 + 0x38, ld8(s1a8))
																			st64(sfe8 + 8, ld64(s910 + 8))
																			st64(sfe8 + 0x10, bj)
																			st64(sfe8, ld64(s990 + 0x70))
																			st64(s1000, bo, br, bq)
																			bm = fn_159d0(s1c0, ld64(s9b0), ld64(s9d8), bn, bo, br, bq, ld64(sfe8), ld64(sfe8 + 8), bj)
																			const bs = ld8(s1a0 + 0x190)
																			if (bs == 2) {
																				const cn = ld64(s1b8)
																				st64(s370 + 8, cn)
																				const co = ld64(s1c0)
																				st64(s370, co)
																				st64(a + 8, cn)
																				st64(a, co)
																				st8(bt, ld8(bt) | ld64(s990 + 0x38))
																				if (ld64(s990 + 0x50) == 0) {
																					j = fn_bc78(bm)
																					ay = ld64(s9c8)
																					st8(ay, ld8(ay) | ld64(s9d0))
																					ah = ld64(s998)
																					st8(ah, ld8(ah) | ld64(s9a0))
																					return j
																				}
																				cp = ld64(s9c0)
																				cw = ld8(cp)
																				cx = ld64(s9e8)
																			} else {
																				st64(s9f0, s370)
																				memcpy(s370, s1c0, 0x1b0)
																				st64(s530 + 0x1b1, ld64(s1a0 + 0x191))
																				st64(s530 + 0x1b8, ld64(s1a0 + 0x198))
																				memcpy(s530, ld64(s9f0), 0x1b0)
																				st8(s530 + 0x1b0, bs)
																				st8(bt, ld8(bt) | ld64(s990 + 0x38))
																				if (ld64(s990 + 0x50) != 0) {
																					const bu = ld64(s9c0)
																					st8(bu, ld8(bu) | ld64(s9e8))
																				}
																				const ca = ld64(ld64(s9b8))
																				const bz = ld64(ld64(s9a8))
																				const by = ld64(ld64(s990 + 0x40))
																				const bx = ld8(s530 + 0x1b8)
																				const bw = ld8(s530 + 0x1b9)
																				const bv = ld8(s530 + 0x1bb)
																				st64(sff0, ld8(s530 + 0x1ba))
																				st64(sfe8, bv)
																				st64(s1000, bx, bw)
																				bm = fn_1ba30(s1c0, by, bz, ca, bx, bw, ld64(sff0), bv)
																				if (ld64(s1c0) != 3) {
																					st64(a + 8, ld64(s1b8))
																					st64(a, ld64(s1c0))
																					j = fn_bc78(bm)
																					ay = ld64(s9c8)
																					st8(ay, ld8(ay) | ld64(s9d0))
																					ah = ld64(s998)
																					st8(ah, ld8(ah) | ld64(s9a0))
																					return j
																				}
																				bm = fn_21378(s1c0, ld64(ld64(s9a8)), ld64(ld64(s9b8)), ld64(s9e0), undef, bm)
																				const cq = ld64(s1b0)
																				const cc = ld64(s1b8)
																				const cb = ld64(s1c0)
																				if (cb == 0) {
																					st64(a + 8, cq)
																					st64(a, cc)
																					j = fn_bc78(bm)
																					ay = ld64(s9c8)
																					st8(ay, ld8(ay) | ld64(s9d0))
																					ah = ld64(s998)
																					st8(ah, ld8(ah) | ld64(s9a0))
																					return j
																				}
																				B168: {
																					B172: {
																						B171: {
																							B170: {
																								st64(s9b8, ld8(s1a0 + 0x18))
																								st64(s9a8, ld64(s1a0 + 0x10))
																								st64(s990 + 0x38, ld8(s1a8))
																								const cf = ld64(s1a0)
																								const cd = ld64(s1a0 + 8)
																								const ce = ld64(cc + 0x38)
																								st64(sff0, cd, s530, bj)
																								st64(s1000, ce)
																								st64(s990 + 0x50, cf)
																								st64(s1000 + 8, cf)
																								bm = fn_1aa28(s1c0, ld64(s9b0), ld64(s9d8), cb, ce, cf, cd, s530, bj)
																								if (ld64(s1c0) == 3) {
																									const cj = ld32(ld64(s9b0) + 0x51)
																									const cg = ld64(s9d8)
																									const ci = ld32(cg + 0x58)
																									const ch = ld32(cg + 0x5c)
																									st64(sff0, ld64(s990 + 0x70))
																									st64(sfe8, ld64(s910 + 8))
																									st64(s1000, ci, ch)
																									bm = fn_1ad88(s1c0, cj, ld64(s990 + 0x68), ld64(s910), ci, ch, ld64(sff0), ld64(sfe8))
																									const ck = ld64(s1b0)
																									const cl = ld64(s1b8)
																									if (ld64(s1c0) == 0) {
																										bm = fn_1db68(s1c0, ld64(ld64(s990 + 0x30)), cl, undef, undef, bm)
																										st64(s910, ld64(s1b0))
																										const cr = ld64(s1b8)
																										if (ld64(s1c0) == 0) {
																											bm = fn_1db68(s1c0, ld64(ld64(s990 + 0x28)), ck, undef, undef, bm)
																											st64(s990 + 0x68, ld64(s1b0))
																											const cs = ld64(s1b8)
																											if (ld64(s1c0) == 0) {
																												if (cr > ld64(s990 + 0x78)) {
																													bm = fn_87630(s8b0, 0x11)
																													cy = ld64(s8b0)
																													ct = ld64(s8b0 + 8)
																												} else {
																													if (ld64(s910 + 0x10) >= cs) {
																														st64(sfe8, s668, cr)
																														st64(sff0, ld64(s990 + 0x48))
																														st64(s1000 + 8, ld64(s990 + 0x60))
																														st64(s1000, ld64(s990 + 0x10))
																														bm = fn_1e190(s1c0, ld64(s990), ld64(s990 + 0x30), ld64(s990 + 0x20), fp)
																														if (ld64(s1c0) == 3) {
																															st64(sfe8, ld64(s910 + 0x18))
																															st64(sfe8 + 8, cs)
																															st64(sff0, ld64(s990 + 0x48))
																															st64(s1000 + 8, ld64(s990 + 0x58))
																															st64(s1000, ld64(s990 + 8))
																															bm = fn_1e190(s1c0, ld64(s990), ld64(s990 + 0x28), ld64(s990 + 0x18), fp)
																															if (ld64(s1c0) == 3) {
																																const cv = ld64(ld64(s990 + 0x40))
																																const cu = ld64(ld64(s9d8) + 0x58)
																																st64(s1a8, ld64(s910 + 8))
																																st64(s1b0, ld64(s990 + 0x70))
																																st64(s1a0 + 0x20, ld64(s9e0))
																																st64(s1a0 + 0x18, ld64(s990 + 0x68))
																																st64(s1a0 + 0x10, ld64(s910))
																																st64(s1a0, cr, cs)
																																st64(s1c0 + 4, cu)
																																st64(s1a0 + 0x28, cv + 8)
																																st8(s1c0, 0)
																																bm = fn_15490(s370, s1c0)
																																if (ld64(s370) == 3) {
																																	st64(a, 3)
																																	st8(cq, ld8(cq) | ld64(s990 + 0x38))
																																	if (ld64(s990 + 0x50) == 0) {
																																		j = fn_bc78(bm)
																																		ay = ld64(s9c8)
																																		st8(ay, ld8(ay) | ld64(s9d0))
																																		ah = ld64(s998)
																																		st8(ah, ld8(ah) | ld64(s9a0))
																																		return j
																																	}
																																	break B168
																																}
																																st64(a + 8, ld64(s370 + 8))
																																cy = ld64(s370)
																																break B171
																															}
																															break B170
																														}
																														break B170
																													}
																													bm = fn_87630(s8a0, 0x11)
																													cy = ld64(s8a0)
																													ct = ld64(s8a0 + 8)
																												}
																												st64(a + 8, ct)
																												break B171
																											}
																											st64(a + 8, ld64(s990 + 0x68))
																											st64(a, cs)
																											break B172
																										}
																										st64(a + 8, ld64(s910))
																										st64(a, cr)
																										break B172
																									}
																									st64(a + 8, ck)
																									st64(a, cl)
																									break B172
																								}
																							}
																							st64(a + 8, ld64(s1b8))
																							cy = ld64(s1c0)
																						}
																						st64(a, cy)
																					}
																					st8(cq, ld8(cq) | ld64(s990 + 0x38))
																					if (ld64(s990 + 0x50) == 0) {
																						j = fn_bc78(bm)
																						ay = ld64(s9c8)
																						st8(ay, ld8(ay) | ld64(s9d0))
																						ah = ld64(s998)
																						st8(ah, ld8(ah) | ld64(s9a0))
																						return j
																					}
																				}
																				cp = ld64(s9a8)
																				cw = ld8(cp)
																				cx = ld64(s9b8)
																			}
																			st8(cp, cw | cx)
																			j = fn_bc78(bm)
																			ay = ld64(s9c8)
																			st8(ay, ld8(ay) | ld64(s9d0))
																			ah = ld64(s998)
																			st8(ah, ld8(ah) | ld64(s9a0))
																			return j
																		}
																		j = fn_87630(s880, ld32(s1c0 + 4))
																		ba = ld64(s880)
																		az = ld64(s880 + 8)
																		break B124
																	}
																	az = ld64(s1b0)
																	break B124
																}
															}
															j = fn_87630(s8e0, 0x45)
															ba = ld64(s8e0)
															az = ld64(s8e0 + 8)
														}
														st64(a + 8, az)
														st64(a, ba)
														ay = ld64(s9c8)
														st8(ay, ld8(ay) | ld64(s9d0))
														ah = ld64(s998)
														st8(ah, ld8(ah) | ld64(s9a0))
														return j
													}
												}
											}
										}
									}
									st64(a + 8, ld64(s1b8))
									st64(a, ld64(s1c0))
									break B122
								}
								st64(a, am, aw)
							}
							const ax = ld64(s990 + 0x38)
							st8(ax, ld8(ax) + (1 << (ld64(s9e8) & 7)))
							ay = ld64(s9c8)
							st8(ay, ld8(ay) | ld64(s9d0))
							ah = ld64(s998)
							st8(ah, ld8(ah) | ld64(s9a0))
							return j
						}
						st64(a + 8, ld64(s1b8))
						st64(a, ld64(s1c0))
						ay = ld64(s9c8)
						st8(ay, ld8(ay) | ld64(s9d0))
						ah = ld64(s998)
						st8(ah, ld8(ah) | ld64(s9a0))
						return j
					}
					st64(a + 8, ld64(s1b8))
					st64(a, ld64(s1c0))
					ah = ld64(s998)
					st8(ah, ld8(ah) | ld64(s9a0))
					return j
				}
				st64(a + 8, ld64(s1b8))
				st64(a, ld64(s1c0))
				ah = ld64(s998)
				st8(ah, ld8(ah) | ld64(s9a0))
				return j
			}
			fn_14c4f0(n, c, 0x100159a60, o, m)
		}
		j = fn_13b4d0(s8f0, fn_b6a0(0x15, "Not all bytes read", 0x12))
		i = ld64(s8f0)
		st64(a + 8, ld64(s8f0 + 8))
		st64(a, i)
		return j
	}
	fn_14c4f0(8, e, 0x100159ac8, d, e)
}

export function fn_2a7e0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1a8 = fp - 0x1a8, s1b0 = fp - 0x1b0, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s370 = fp - 0x370, s528 = fp - 0x528, s530 = fp - 0x530, s650 = fp - 0x650, s660 = fp - 0x660, s668 = fp - 0x668, s688 = fp - 0x688, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s700 = fp - 0x700, s710 = fp - 0x710, s720 = fp - 0x720, s730 = fp - 0x730, s740 = fp - 0x740, s750 = fp - 0x750, s760 = fp - 0x760, s770 = fp - 0x770, s780 = fp - 0x780, s790 = fp - 0x790, s7a0 = fp - 0x7a0, s7b0 = fp - 0x7b0, s7c0 = fp - 0x7c0, s7d0 = fp - 0x7d0, s7e0 = fp - 0x7e0, s7f0 = fp - 0x7f0, s800 = fp - 0x800, s810 = fp - 0x810, s820 = fp - 0x820, s830 = fp - 0x830, s840 = fp - 0x840, s850 = fp - 0x850, s860 = fp - 0x860, s870 = fp - 0x870, s880 = fp - 0x880, s890 = fp - 0x890, s8a0 = fp - 0x8a0, s8b0 = fp - 0x8b0, s8c0 = fp - 0x8c0, s8c8 = fp - 0x8c8, s8d0 = fp - 0x8d0, s8d8 = fp - 0x8d8, s8e0 = fp - 0x8e0, s8e8 = fp - 0x8e8, s8f0 = fp - 0x8f0, s8f8 = fp - 0x8f8, s900 = fp - 0x900, s908 = fp - 0x908, s910 = fp - 0x910, s918 = fp - 0x918, s920 = fp - 0x920, s928 = fp - 0x928, s930 = fp - 0x930, s938 = fp - 0x938, s940 = fp - 0x940, s948 = fp - 0x948, s950 = fp - 0x950, s958 = fp - 0x958, s960 = fp - 0x960, s968 = fp - 0x968, s970 = fp - 0x970, s978 = fp - 0x978, s980 = fp - 0x980, s988 = fp - 0x988, s990 = fp - 0x990, s998 = fp - 0x998, s9a0 = fp - 0x9a0, s1000 = fp - 0x1000
	let g, h, k, l, o, r, u, w, ag, ai, aj, ak, al, an, ap, aw, bp, cf, cj: u64
	if (e > 7) {
		st64(s370, d + 8, e - 8)
		fn_11b3b8(s1c0, s370)
		const i = ld64(s1b8)
		const f = ld64(s1c0)
		if (f == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
			l = fn_13b4d0(s8c0, i, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, g, h)
			k = ld64(s8c0)
			st64(a + 8, ld64(s8c0 + 8))
			st64(a, k)
			return l
		}
		copyr(s530, s1b0, 0x28)
		if (ld64(s370 + 8) == 0) {
			copyr(s688, s528, 0x20)
			let m = ld64(s530)
			st64(s6a0, f, i, m)
			let n = 1
			let j = b
			if (c == 0) {
				l = anchor_error_from(s6b0, 0xbbd /* anchor::AccountNotEnoughKeys */, m, g, h)
				m = undef
				n = 0
				j = ld64(s6b0 + 8)
				k = ld64(s6b0)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			}
			if (ld8(ld64(j) + 2) == 0) {
				l = anchor_error_from(s6c0, 0xbbe /* anchor::AccountNotMutable */, m, g, h)
				m = undef
				j = ld64(s6c0 + 8)
				k = ld64(s6c0)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			}
			st64(s8c8, j)
			if (n >= c) {
				l = anchor_error_from(s6d0, 0xbbd /* anchor::AccountNotEnoughKeys */, m, g, h)
				o = ld64(s6d0 + 8)
				k = ld64(s6d0)
				if (k != 3) {
					st64(a + 8, o)
					st64(a, k)
					return l
				}
			} else {
				o = b + (n << 3)
				n = n + 1
			}
			B22: {
				const p = ld64(o)
				const q = ld64(p + 8)
				if (q == 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */) {
					r = 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */
					if (ld64(p + 0x10) == 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */) {
						r = 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */
						if (ld64(p + 0x18) == 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */ && ld64(p + 0x20) == 0xfc8ba1d828f9bdfe /* TOKEN_2022_PROGRAM[3] */) {
							break B22
						}
					}
				} else {
					r = 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */
					if (q == 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */) {
						r = 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */
						if (ld64(p + 0x10) == 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */) {
							r = 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */
							if (ld64(p + 0x18) == 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */ && ld64(p + 0x20) == 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) {
								break B22
							}
						}
					}
				}
				l = anchor_error_from(s6e0, 0xbc0 /* anchor::InvalidProgramId */, r, o, h)
				r = undef
				o = ld64(s6e0 + 8)
				k = ld64(s6e0)
				if (k != 3) {
					st64(a + 8, o)
					st64(a, k)
					return l
				}
			}
			st64(s8d0, o)
			if (n >= c) {
				l = anchor_error_from(s6f0, 0xbbd /* anchor::AccountNotEnoughKeys */, r, o, h)
				o = ld64(s6f0 + 8)
				k = ld64(s6f0)
				if (k != 3) {
					st64(a + 8, o)
					st64(a, k)
					return l
				}
			} else {
				o = b + (n << 3)
				n = n + 1
			}
			B34: {
				const s = ld64(o)
				const t = ld64(s + 8)
				if (t == 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */) {
					u = 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */
					if (ld64(s + 0x10) == 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */) {
						u = 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */
						if (ld64(s + 0x18) == 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */ && ld64(s + 0x20) == 0xfc8ba1d828f9bdfe /* TOKEN_2022_PROGRAM[3] */) {
							break B34
						}
					}
				} else {
					u = 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */
					if (t == 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */) {
						u = 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */
						if (ld64(s + 0x10) == 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */) {
							u = 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */
							if (ld64(s + 0x18) == 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */ && ld64(s + 0x20) == 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) {
								break B34
							}
						}
					}
				}
				l = anchor_error_from(s700, 0xbc0 /* anchor::InvalidProgramId */, u, o, h)
				u = undef
				o = ld64(s700 + 8)
				k = ld64(s700)
				if (k != 3) {
					st64(a + 8, o)
					st64(a, k)
					return l
				}
			}
			st64(s8d8, o)
			if (n >= c) {
				l = anchor_error_from(s710, 0xbbd /* anchor::AccountNotEnoughKeys */, u, o, h)
				o = ld64(s710 + 8)
				k = ld64(s710)
				if (k != 3) {
					st64(a + 8, o)
					st64(a, k)
					return l
				}
			} else {
				o = b + (n << 3)
				n = n + 1
			}
			B42: {
				const v = ld64(o)
				w = 0x62129995a534a05 /* MEMO_PROGRAM */
				if (ld64(v + 8) == 0x62129995a534a05 /* MEMO_PROGRAM */) {
					w = 0x7c38da6071e8244d /* MEMO_PROGRAM[1] */
					if (ld64(v + 0x10) == 0x7c38da6071e8244d /* MEMO_PROGRAM[1] */) {
						w = 0x81bb92bcddb5357c /* MEMO_PROGRAM[2] */
						if (ld64(v + 0x18) == 0x81bb92bcddb5357c /* MEMO_PROGRAM[2] */ && ld64(v + 0x20) == 0x8d44054140a81fe4 /* MEMO_PROGRAM[3] */) {
							break B42
						}
					}
				}
				l = anchor_error_from(s720, 0xbc0 /* anchor::InvalidProgramId */, w, o, h)
				w = undef
				o = ld64(s720 + 8)
				k = ld64(s720)
				if (k != 3) {
					st64(a + 8, o)
					st64(a, k)
					return l
				}
			}
			B45: {
				let x = 0xbbd /* anchor::AccountNotEnoughKeys */
				st64(s8e0, o)
				if (c > n) {
					w = b + (n << 3)
					x = 0xbc2 /* anchor::AccountNotSigner */
					n = n + 1
					if (ld8(ld64(w) + 1) != 0) {
						break B45
					}
				}
				l = anchor_error_from(s730, x, w, o, h)
				o = ld64(s8e0)
				w = ld64(s730 + 8)
				k = ld64(s730)
				if (k != 3) {
					st64(a + 8, w)
					st64(a, k)
					return l
				}
			}
			st64(s8e8, w)
			if (n >= c) {
				l = anchor_error_from(s740, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s740 + 8)
				k = ld64(s740)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(j) + 2) == 0) {
				l = anchor_error_from(s750, 0xbbe /* anchor::AccountNotMutable */, w, o, h)
				w = undef
				o = undef
				j = ld64(s750 + 8)
				k = ld64(s750)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			}
			st64(s8f0, j)
			if (n >= c) {
				l = anchor_error_from(s760, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s760 + 8)
				k = ld64(s760)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			st64(s8f8, j)
			if (n >= c) {
				l = anchor_error_from(s770, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s770 + 8)
				k = ld64(s770)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			st64(s900, j)
			if (n >= c) {
				l = anchor_error_from(s780, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s780 + 8)
				k = ld64(s780)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			st64(s908, j)
			if (n >= c) {
				l = anchor_error_from(s790, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s790 + 8)
				k = ld64(s790)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(j) + 2) == 0) {
				l = anchor_error_from(s7a0, 0xbbe /* anchor::AccountNotMutable */, w, o, h)
				w = undef
				o = undef
				j = ld64(s7a0 + 8)
				k = ld64(s7a0)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			}
			st64(s910, j)
			if (n >= c) {
				l = anchor_error_from(s7b0, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s7b0 + 8)
				k = ld64(s7b0)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(j) + 2) == 0) {
				l = anchor_error_from(s7c0, 0xbbe /* anchor::AccountNotMutable */, w, o, h)
				w = undef
				o = undef
				j = ld64(s7c0 + 8)
				k = ld64(s7c0)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			}
			st64(s918, j)
			if (n >= c) {
				l = anchor_error_from(s7d0, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s7d0 + 8)
				k = ld64(s7d0)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(j) + 2) == 0) {
				l = anchor_error_from(s7e0, 0xbbe /* anchor::AccountNotMutable */, w, o, h)
				w = undef
				o = undef
				j = ld64(s7e0 + 8)
				k = ld64(s7e0)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			}
			st64(s920, j)
			if (n >= c) {
				l = anchor_error_from(s7f0, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s7f0 + 8)
				k = ld64(s7f0)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(j) + 2) == 0) {
				l = anchor_error_from(s800, 0xbbe /* anchor::AccountNotMutable */, w, o, h)
				w = undef
				o = undef
				j = ld64(s800 + 8)
				k = ld64(s800)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			}
			st64(s928, j)
			if (n >= c) {
				l = anchor_error_from(s810, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s810 + 8)
				k = ld64(s810)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(j) + 2) == 0) {
				l = anchor_error_from(s820, 0xbbe /* anchor::AccountNotMutable */, w, o, h)
				w = undef
				o = undef
				j = ld64(s820 + 8)
				k = ld64(s820)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			}
			st64(s940, j)
			if (n >= c) {
				l = anchor_error_from(s830, 0xbbd /* anchor::AccountNotEnoughKeys */, w, o, h)
				w = undef
				o = undef
				j = ld64(s830 + 8)
				k = ld64(s830)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			} else {
				j = b + (n << 3)
				n = n + 1
			}
			if (ld8(ld64(j) + 2) == 0) {
				l = anchor_error_from(s840, 0xbbe /* anchor::AccountNotMutable */, w, o, h)
				w = undef
				o = undef
				j = ld64(s840 + 8)
				k = ld64(s840)
				if (k != 3) {
					st64(a + 8, j)
					st64(a, k)
					return l
				}
			}
			st64(s950, j)
			if (c >= n) {
				l = fn_22210(s1c0, ld64(ld64(s8c8)), w, o, h)
				st64(s938, ld8(s1b0))
				st64(s930, ld64(s1b8))
				const y = ld64(s1c0)
				st64(s948, y)
				if (y == 0) {
					st32(s530 + 3, ld32(s1b0 + 4))
					st32(s530, ld32(s1b0 + 1))
					st32(a + 0xc, ld32(s530 + 3))
					st32(a + 9, ld32(s530))
					st8(a + 8, ld64(s938))
					st64(a, ld64(s930))
					return l
				}
				const aa = ld64(ld64(s900))
				const z = ld64(ld64(s8d0))
				st64(s958, aa)
				l = fn_228d8(s1c0, z + 8, aa + 0x28, undef, undef, l)
				if (ld64(s1c0) == 3) {
					const ac = ld64(ld64(s908))
					const ab = ld64(ld64(s8d8))
					st64(s960, ac)
					l = fn_228d8(s1c0, ab + 8, ac + 0x28, undef, undef, l)
					if (ld64(s1c0) == 3) {
						l = fn_21f70(s1c0, ld64(ld64(s8f0)))
						st64(s970, ld8(s1b0))
						st64(s968, ld64(s1b8))
						const ad = ld64(s1c0)
						st64(s978, ad)
						if (ad == 0) {
							st32(s530 + 3, ld32(s1b0 + 4))
							st32(s530, ld32(s1b0 + 1))
							st32(a + 0xc, ld32(s530 + 3))
							st32(a + 9, ld32(s530))
							st8(a + 8, ld64(s970))
							st64(a, ld64(s968))
							ag = ld64(s930)
							st8(ag, ld8(ag) | ld64(s938))
							return l
						}
						const af = ld64(ld64(s8c8))
						const ae = ld64(s978)
						st64(s980, af + 8)
						l = fn_228d8(s1c0, ae + 8, af + 8, undef, undef, l)
						if (ld64(s1c0) == 3) {
							l = fn_224b0(s1c0, ld64(ld64(s8f8)), undef, undef, undef, l)
							st64(s8c8, ld64(s1c0))
							if (ld8(s1a8 + 8) == 2) {
								st64(a + 8, ld64(s1b8))
								st64(a, ld64(s8c8))
								ap = ld64(s968)
								st8(ap, ld8(ap) | ld64(s970))
								ag = ld64(s930)
								st8(ag, ld8(ag) | ld64(s938))
								return l
							}
							B119: {
								B118: {
									st64(s988, ld8(s1a8))
									st64(s8f8, ld64(s1b0))
									const ah = memcmp(ld64(s8c8), ld64(s978) + 0x28, 0x20)
									l = ah as u32
									if (l != 0) {
										l = anchor_error_from(s850, 0x7d3 /* anchor::ConstraintRaw */, ai, aj, ak)
										al = ld64(s850)
										if (al != 3) {
											an = ld64(s850 + 8)
											break B118
										}
									}
									if (ld64(ld64(s8c8) + 0x40) != 1) {
										l = anchor_error_from(s860, 0x7d3 /* anchor::ConstraintRaw */, ai, aj, ak)
										al = ld64(s860)
										if (al != 3) {
											an = ld64(s860 + 8)
											break B118
										}
									}
									l = fn_228d8(s1c0, ld64(s958) + 8, ld64(s948) + 0x65 /* anchor::InstructionFallbackNotFound */, aj, ak, l)
									if (ld64(s1c0) == 3) {
										l = fn_228d8(s1c0, ld64(s960) + 8, ld64(s948) + 0xb5, undef, undef, l)
										if (ld64(s1c0) == 3) {
											l = fn_228d8(s1c0, ld64(ld64(s920)) + 8, ld64(s948) + 0x85, undef, undef, l)
											if (ld64(s1c0) == 3) {
												l = fn_228d8(s1c0, ld64(ld64(s928)) + 8, ld64(s948) + 0xd5, undef, undef, l)
												if (ld64(s1c0) == 3) {
													l = fn_1d488(s1c0, ld64(s8c8), ld64(ld64(s8e8)))
													if (ld64(s1c0) == 3) {
														const am = ld64(s8f8)
														st8(am, ld8(am) + (1 << (ld64(s988) & 7)))
														l = clock_get_139448(s1c0)
														if (ld32(s1c0) == 0) {
															const ar = ld64(s688 + 8)
															const aq = ld64(s688)
															st64(s8f8, aq)
															st64(s8c8, ar)
															if ((aq | ar) == 0) {
																l = fn_87630(s8b0, 0xc)
																const bz = ld64(s8b0)
																st64(a + 8, ld64(s8b0 + 8))
																st64(a, bz)
																ap = ld64(s968)
																st8(ap, ld8(ap) | ld64(s970))
																ag = ld64(s930)
																st8(ag, ld8(ag) | ld64(s938))
																return l
															}
															let au = ld64(s1a8 + 0x10)
															st64(s1000, 0x100152bf5, 2)
															l = fn_1c688(s1c0, b + (n << 3), c - n, s6a0, 0x100152bf5, 2)
															copy(s530, s1b8, 0x10)
															const at = ld64(s1c0)
															if (at == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
																st64(a + 8, ld64(s528))
																st64(a, ld64(s530))
																ap = ld64(s968)
																st8(ap, ld8(ap) | ld64(s970))
																ag = ld64(s930)
																st8(ag, ld8(ag) | ld64(s938))
																return l
															}
															st64(s958, s650)
															let ax = memcpy(s650, s1a8, 0x120)
															st64(s668, at)
															copy(s660, s530, 0x10)
															if (0 > (ld64(s8c8) as i64)) {
																ax = fn_87630(s8a0, 0xd)
																const ca = ld64(s8a0)
																st64(a + 8, ld64(s8a0 + 8))
																st64(a, ca)
																l = fn_bc78(ax)
																ap = ld64(s968)
																st8(ap, ld8(ap) | ld64(s970))
																ag = ld64(s930)
																st8(ag, ld8(ag) | ld64(s938))
																return l
															}
															if (-1 >= (au as i64)) {
																ax = fn_87630(s870, 0x15)
																au = ld64(s870 + 8)
																const av = ld64(s870)
																if (av != 2) {
																	st64(a + 8, au)
																	st64(a, av)
																	l = fn_bc78(ax)
																	ap = ld64(s968)
																	st8(ap, ld8(ap) | ld64(s970))
																	ag = ld64(s930)
																	st8(ag, ld8(ag) | ld64(s938))
																	return l
																}
															}
															ax = fn_21378(s1c0, ld64(ld64(s940)), ld64(ld64(s950)), ld64(s980), aw, ax)
															let be = ld64(s1b0)
															let az = ld64(s1b8)
															const ay = ld64(s1c0)
															if (ay != 0) {
																const ba = ld64(s1a8 + 8)
																let bc = ay
																let bb = az
																st64(s960, ba)
																if (ba != 0) {
																	bb = ld64(s1a8 + 0x10)
																	bc = ld64(s960)
																}
																st64(s998, ld8(s1a8 + 0x20))
																st64(s990, ld64(s1a8 + 0x18))
																st64(s988, ld8(s1a8))
																st64(s1000 + 0x20, ld64(s8c8))
																st64(s1000 + 0x28, au)
																st64(s1000 + 0x18, ld64(s8f8))
																st64(s1000, az, bc, bb)
																ax = fn_159d0(s1c0, ld64(s948), ld64(s978), ay, az, bc, bb, ld64(s1000 + 0x18), ld64(s1000 + 0x20), au)
																const bd = ld8(s1a8 + 0x198)
																if (bd == 2) {
																	const cb = ld64(s1b8)
																	st64(s370 + 8, cb)
																	const cc = ld64(s1c0)
																	st64(s370, cc)
																	st64(a + 8, cb)
																	st64(a, cc)
																	st8(be, ld8(be) | ld64(s988))
																	if (ld64(s960) == 0) {
																		l = fn_bc78(ax)
																		ap = ld64(s968)
																		st8(ap, ld8(ap) | ld64(s970))
																		ag = ld64(s930)
																		st8(ag, ld8(ag) | ld64(s938))
																		return l
																	}
																	const cd = ld64(s990)
																	st8(cd, ld8(cd) | ld64(s998))
																	l = fn_bc78(ax)
																	ap = ld64(s968)
																	st8(ap, ld8(ap) | ld64(s970))
																	ag = ld64(s930)
																	st8(ag, ld8(ag) | ld64(s938))
																	return l
																}
																st64(s9a0, s370)
																memcpy(s370, s1c0, 0x1b0)
																st64(s528 + 0x1a9, ld64(s1a8 + 0x199))
																st64(s528 + 0x1b0, ld64(s1a8 + 0x1a0))
																memcpy(s530, ld64(s9a0), 0x1b0)
																st8(s528 + 0x1a8, bd)
																st8(be, ld8(be) | ld64(s988))
																if (ld64(s960) != 0) {
																	const bf = ld64(s990)
																	st8(bf, ld8(bf) | ld64(s998))
																}
																const bl = ld64(ld64(s950))
																const bk = ld64(ld64(s940))
																const bj = ld64(ld64(s8f0))
																const bi = ld8(s528 + 0x1b0)
																const bh = ld8(s528 + 0x1b1)
																const bg = ld8(s528 + 0x1b3)
																st64(s1000 + 0x10, ld8(s528 + 0x1b2))
																st64(s1000 + 0x18, bg)
																st64(s1000, bi, bh)
																ax = fn_1ba30(s1c0, bj, bk, bl, bi, bh, ld64(s1000 + 0x10), bg)
																if (ld64(s1c0) != 3) {
																	st64(a + 8, ld64(s1b8))
																	st64(a, ld64(s1c0))
																	l = fn_bc78(ax)
																	ap = ld64(s968)
																	st8(ap, ld8(ap) | ld64(s970))
																	ag = ld64(s930)
																	st8(ag, ld8(ag) | ld64(s938))
																	return l
																}
																ax = fn_21378(s1c0, ld64(ld64(s940)), ld64(ld64(s950)), ld64(s980), undef, ax)
																be = ld64(s1b0)
																az = ld64(s1b8)
																const bm = ld64(s1c0)
																if (bm != 0) {
																	B157: {
																		B160: {
																			B159: {
																				B158: {
																					st64(s950, ld8(s1a8 + 0x20))
																					st64(s960, ld64(s1a8 + 0x18))
																					st64(s940, ld8(s1a8))
																					bp = ld64(s1a8 + 8)
																					const bn = ld64(s1a8 + 0x10)
																					const bo = ld64(az + 0x38)
																					st64(s1000, bo, bp, bn, s530, au)
																					ax = fn_1aa28(s1c0, ld64(s948), ld64(s978), bm, bo, bp, bn, s530, au)
																					if (ld64(s1c0) == 3) {
																						const bq = ld64(s948)
																						const bw = ld64(bq + 0x49)
																						const bv = ld64(bq + 0x41)
																						const bu = ld32(bq + 0x51)
																						const br = ld64(s978)
																						const bt = ld32(br + 0x58)
																						const bs = ld32(br + 0x5c)
																						st64(s1000 + 0x10, ld64(s8f8))
																						st64(s1000 + 0x18, ld64(s8c8))
																						st64(s1000, bt, bs)
																						ax = fn_1ad88(s1c0, bu, bv, bw, bt, bs, ld64(s1000 + 0x10), ld64(s1000 + 0x18))
																						const bx = ld64(s1b0)
																						const by = ld64(s1b8)
																						if (ld64(s1c0) == 0) {
																							ax = fn_1db68(s1c0, ld64(ld64(s900)), by, undef, undef, ax)
																							st64(s988, ld64(s1b0))
																							st64(s948, ld64(s1b8))
																							if (ld64(s1c0) == 0) {
																								ax = fn_1db68(s1c0, ld64(ld64(s908)), bx, undef, undef, ax)
																								st64(s990, ld64(s1b0))
																								const ce = ld64(s1b8)
																								if (ld64(s1c0) == 0) {
																									if (ld64(s948) > ld64(s688 + 0x10)) {
																										ax = fn_87630(s890, 0x11)
																										cj = ld64(s890)
																										cf = ld64(s890 + 8)
																									} else {
																										if (ld64(s688 + 0x18) >= ce) {
																											st64(s1000 + 0x18, s668)
																											st64(s1000 + 0x20, ld64(s948))
																											st64(s1000 + 0x10, ld64(s8e0))
																											st64(s1000 + 8, ld64(s8d0))
																											st64(s1000, ld64(s920))
																											ax = fn_1e190(s1c0, ld64(s8e8), ld64(s900), ld64(s910), fp)
																											if (ld64(s1c0) == 3) {
																												st64(s1000 + 0x18, ld64(s958))
																												st64(s1000 + 0x20, ce)
																												st64(s1000 + 0x10, ld64(s8e0))
																												st64(s1000 + 8, ld64(s8d8))
																												st64(s1000, ld64(s928))
																												ax = fn_1e190(s1c0, ld64(s8e8), ld64(s908), ld64(s918), fp)
																												if (ld64(s1c0) == 3) {
																													const ch = ld64(ld64(s8f0))
																													const cg = ld64(ld64(s978) + 0x58)
																													st64(s1a8, ld64(s8c8))
																													st64(s1b0, ld64(s8f8))
																													st64(s1a8 + 0x28, ld64(s980))
																													st64(s1a8 + 0x20, ld64(s990))
																													st64(s1a8 + 0x18, ld64(s988))
																													st64(s1a8 + 0x10, ce)
																													st64(s1a8 + 8, ld64(s948))
																													st64(s1c0 + 4, cg)
																													st64(s1a8 + 0x30, ch + 8)
																													st8(s1c0, 0)
																													ax = fn_15490(s370, s1c0)
																													if (ld64(s370) == 3) {
																														st64(a, 3)
																														st8(be, ld8(be) | ld64(s940))
																														if (bp == 0) {
																															l = fn_bc78(ax)
																															ap = ld64(s968)
																															st8(ap, ld8(ap) | ld64(s970))
																															ag = ld64(s930)
																															st8(ag, ld8(ag) | ld64(s938))
																															return l
																														}
																														break B157
																													}
																													st64(a + 8, ld64(s370 + 8))
																													cj = ld64(s370)
																													break B159
																												}
																												break B158
																											}
																											break B158
																										}
																										ax = fn_87630(s880, 0x11)
																										cj = ld64(s880)
																										cf = ld64(s880 + 8)
																									}
																									st64(a + 8, cf)
																									break B159
																								}
																								st64(a + 8, ld64(s990))
																								st64(a, ce)
																								break B160
																							}
																							st64(a + 8, ld64(s988))
																							cj = ld64(s948)
																							break B159
																						}
																						st64(a + 8, bx)
																						st64(a, by)
																						break B160
																					}
																				}
																				st64(a + 8, ld64(s1b8))
																				cj = ld64(s1c0)
																			}
																			st64(a, cj)
																		}
																		st8(be, ld8(be) | ld64(s940))
																		if (bp == 0) {
																			l = fn_bc78(ax)
																			ap = ld64(s968)
																			st8(ap, ld8(ap) | ld64(s970))
																			ag = ld64(s930)
																			st8(ag, ld8(ag) | ld64(s938))
																			return l
																		}
																	}
																	const ci = ld64(s960)
																	st8(ci, ld8(ci) | ld64(s950))
																	l = fn_bc78(ax)
																	ap = ld64(s968)
																	st8(ap, ld8(ap) | ld64(s970))
																	ag = ld64(s930)
																	st8(ag, ld8(ag) | ld64(s938))
																	return l
																}
															}
															st64(a + 8, be)
															st64(a, az)
															l = fn_bc78(ax)
															ap = ld64(s968)
															st8(ap, ld8(ap) | ld64(s970))
															ag = ld64(s930)
															st8(ag, ld8(ag) | ld64(s938))
															return l
														}
														st64(a + 8, ld64(s1c0 + 4))
														st64(a, 2)
														ap = ld64(s968)
														st8(ap, ld8(ap) | ld64(s970))
														ag = ld64(s930)
														st8(ag, ld8(ag) | ld64(s938))
														return l
													}
												}
											}
										}
									}
									st64(a + 8, ld64(s1b8))
									st64(a, ld64(s1c0))
									break B119
								}
								st64(a, al, an)
							}
							const ao = ld64(s8f8)
							st8(ao, ld8(ao) + (1 << (ld64(s988) & 7)))
							ap = ld64(s968)
							st8(ap, ld8(ap) | ld64(s970))
							ag = ld64(s930)
							st8(ag, ld8(ag) | ld64(s938))
							return l
						}
						st64(a + 8, ld64(s1b8))
						st64(a, ld64(s1c0))
						ap = ld64(s968)
						st8(ap, ld8(ap) | ld64(s970))
						ag = ld64(s930)
						st8(ag, ld8(ag) | ld64(s938))
						return l
					}
					st64(a + 8, ld64(s1b8))
					st64(a, ld64(s1c0))
					ag = ld64(s930)
					st8(ag, ld8(ag) | ld64(s938))
					return l
				}
				st64(a + 8, ld64(s1b8))
				st64(a, ld64(s1c0))
				ag = ld64(s930)
				st8(ag, ld8(ag) | ld64(s938))
				return l
			}
			fn_14c4f0(n, c, 0x100159a60, o, h)
		}
		l = fn_13b4d0(s8c0, fn_b6a0(0x15, "Not all bytes read", 0x12, g, h))
		k = ld64(s8c0)
		st64(a + 8, ld64(s8c0 + 8))
		st64(a, k)
		return l
	}
	fn_14c4f0(8, e, 0x100159ae0, d, e)
}

export function fn_2cb80(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s18 = fp - 0x18, s20 = fp - 0x20, s140 = fp - 0x140, s148 = fp - 0x148, s150 = fp - 0x150, s158 = fp - 0x158, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s2b8 = fp - 0x2b8, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s510 = fp - 0x510, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s560 = fp - 0x560, s570 = fp - 0x570, s580 = fp - 0x580, s5a0 = fp - 0x5a0, s618 = fp - 0x618, s620 = fp - 0x620, s628 = fp - 0x628, s630 = fp - 0x630, s638 = fp - 0x638, s640 = fp - 0x640, s648 = fp - 0x648, s650 = fp - 0x650, s658 = fp - 0x658, s660 = fp - 0x660, s668 = fp - 0x668, s670 = fp - 0x670, s678 = fp - 0x678, s680 = fp - 0x680, s688 = fp - 0x688, s690 = fp - 0x690, sfe0 = fp - 0xfe0, s1000 = fp - 0x1000
	let i, j, m, n, o, q, t, w, x, aa, ah, ap, ar, av, aw, ax, bg, bi, bj, bk, bl, bm, bn, bp, bu, cb, cc, cr: u64
	st64(s580 + 8, b)
	if (e > 7) {
		st64(s10, d + 8, e - 8)
		fn_11abf0(s158, s10)
		const g = ld64(s150)
		const f = ld64(s158)
		if (f == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
			j = fn_13b4d0(s570, g)
			i = ld64(s570)
			st64(a + 8, ld64(s570 + 8))
			st64(a, i)
			return j
		}
		memcpy(s290, s148, 0x40)
		if (ld64(s10 + 8) == 0) {
			memcpy(s2d0, s290, 0x40)
			st64(s2e0, f, g)
			const l = ld64(s2d0 + 0x10)
			const k = ld64(s2d0 + 8)
			if ((k | l) == 0) {
				j = fn_87630(s560, 0xc)
				i = ld64(s560)
				st64(a + 8, ld64(s560 + 8))
				st64(a, i)
				return j
			}
			st64(s580, l)
			copyr(s5a0, s2b8, 0x20)
			let p = 1
			let h = ld64(s580 + 8)
			if (c == 0) {
				j = anchor_error_from(s2f0, 0xbbd /* anchor::AccountNotEnoughKeys */, m, n, o)
				p = 0
				h = ld64(s2f0 + 8)
				i = ld64(s2f0)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			}
			if (ld8(ld64(h) + 2) == 0) {
				j = anchor_error_from(s300, 0xbbe /* anchor::AccountNotMutable */, m, n, o)
				h = ld64(s300 + 8)
				i = ld64(s300)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			}
			st64(s618 + 0x70, h)
			if (p >= c) {
				j = anchor_error_from(s310, 0xbbd /* anchor::AccountNotEnoughKeys */, m, n, o)
				q = ld64(s310 + 8)
				i = ld64(s310)
				if (i != 3) {
					st64(a + 8, q)
					st64(a, i)
					return j
				}
			} else {
				q = ld64(s580 + 8) + (p << 3)
				p = p + 1
			}
			B24: {
				const r = ld64(q)
				const s = ld64(r + 8)
				if (s == 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */) {
					t = 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */
					if (ld64(r + 0x10) == 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */) {
						t = 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */
						if (ld64(r + 0x18) == 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */ && ld64(r + 0x20) == 0xfc8ba1d828f9bdfe /* TOKEN_2022_PROGRAM[3] */) {
							break B24
						}
					}
				} else {
					t = 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */
					if (s == 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */) {
						t = 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */
						if (ld64(r + 0x10) == 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */) {
							t = 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */
							if (ld64(r + 0x18) == 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */ && ld64(r + 0x20) == 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) {
								break B24
							}
						}
					}
				}
				j = anchor_error_from(s320, 0xbc0 /* anchor::InvalidProgramId */, t, q, o)
				t = undef
				q = ld64(s320 + 8)
				i = ld64(s320)
				if (i != 3) {
					st64(a + 8, q)
					st64(a, i)
					return j
				}
			}
			st64(s618 + 0x60, q)
			if (p >= c) {
				j = anchor_error_from(s330, 0xbbd /* anchor::AccountNotEnoughKeys */, t, q, o)
				q = ld64(s330 + 8)
				i = ld64(s330)
				if (i != 3) {
					st64(a + 8, q)
					st64(a, i)
					return j
				}
			} else {
				q = ld64(s580 + 8) + (p << 3)
				p = p + 1
			}
			B36: {
				const u = ld64(q)
				const v = ld64(u + 8)
				if (v == 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */) {
					w = 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */
					if (ld64(u + 0x10) == 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */) {
						w = 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */
						if (ld64(u + 0x18) == 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */ && ld64(u + 0x20) == 0xfc8ba1d828f9bdfe /* TOKEN_2022_PROGRAM[3] */) {
							break B36
						}
					}
				} else {
					w = 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */
					if (v == 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */) {
						w = 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */
						if (ld64(u + 0x10) == 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */) {
							w = 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */
							if (ld64(u + 0x18) == 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */ && ld64(u + 0x20) == 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) {
								break B36
							}
						}
					}
				}
				j = anchor_error_from(s340, 0xbc0 /* anchor::InvalidProgramId */, w, q, o)
				w = undef
				q = ld64(s340 + 8)
				i = ld64(s340)
				if (i != 3) {
					st64(a + 8, q)
					st64(a, i)
					return j
				}
			}
			st64(s618 + 0x58, q)
			if (p >= c) {
				st64(s618 + 0x68, p)
				j = anchor_error_from(s350, 0xbbd /* anchor::AccountNotEnoughKeys */, w, q, o)
				x = ld64(s350 + 8)
				i = ld64(s350)
				if (i != 3) {
					st64(a + 8, x)
					st64(a, i)
					return j
				}
			} else {
				x = ld64(s580 + 8) + (p << 3)
				st64(s618 + 0x68, p + 1)
			}
			st64(s158, 0x100159aa8, 0x100159ab0)
			const y = fn_118b0(s158, x)
			let z = undef
			q = undef
			if (y == 0) {
				j = anchor_error_from(s360, 0xbc0 /* anchor::InvalidProgramId */, z, q, aa)
				z = undef
				q = undef
				x = ld64(s360 + 8)
				i = ld64(s360)
				if (i != 3) {
					st64(a + 8, x)
					st64(a, i)
					return j
				}
			}
			B44: {
				st64(s618 + 0x50, x)
				let ac = 0xbbd /* anchor::AccountNotEnoughKeys */
				if (c > ld64(s618 + 0x68)) {
					const ab = ld64(s618 + 0x68)
					x = ld64(s580 + 8) + (ab << 3)
					ac = 0xbc2 /* anchor::AccountNotSigner */
					z = ab + 1
					st64(s618 + 0x68, z)
					if (ld8(ld64(x) + 1) != 0) {
						break B44
					}
				}
				j = anchor_error_from(s370, ac, z, q, aa)
				z = undef
				q = undef
				x = ld64(s370 + 8)
				i = ld64(s370)
				if (i != 3) {
					st64(a + 8, x)
					st64(a, i)
					return j
				}
			}
			B48: {
				let af = 0xbbd /* anchor::AccountNotEnoughKeys */
				if (c > ld64(s618 + 0x68)) {
					const ad = ld64(s618 + 0x68)
					q = ld64(s580 + 8) + (ad << 3)
					af = 0xbbe /* anchor::AccountNotMutable */
					st64(s618 + 0x68, ad + 1)
					const ae = ld64(q)
					z = ld8(ae + 2)
					if (z != 0) {
						af = 0xbc2 /* anchor::AccountNotSigner */
						if (ld8(ae + 1) != 0) {
							break B48
						}
					}
				}
				j = anchor_error_from(s380, af, z, q, aa)
				z = undef
				q = ld64(s380 + 8)
				i = ld64(s380)
				if (i != 3) {
					st64(a + 8, q)
					st64(a, i)
					return j
				}
			}
			const ag = ld64(s618 + 0x68)
			st64(s618 + 0x48, q)
			if (ag >= c) {
				j = anchor_error_from(s390, 0xbbd /* anchor::AccountNotEnoughKeys */, z, q, aa)
				q = undef
				ah = ld64(s390 + 8)
				i = ld64(s390)
				if (i != 3) {
					st64(a + 8, ah)
					st64(a, i)
					return j
				}
			} else {
				ah = ld64(s580 + 8) + (ag << 3)
				st64(s618 + 0x68, ag + 1)
			}
			if (ld8(ld64(ah) + 2) == 0) {
				j = anchor_error_from(s3a0, 0xbbe /* anchor::AccountNotMutable */, ah, q, aa)
				q = undef
				ah = ld64(s3a0 + 8)
				i = ld64(s3a0)
				if (i != 3) {
					st64(a + 8, ah)
					st64(a, i)
					return j
				}
			}
			st64(s618 + 0x38, x)
			let ai = ld64(s618 + 0x68)
			st64(s618 + 0x40, ah)
			if (ai >= c) {
				j = anchor_error_from(s3b0, 0xbbd /* anchor::AccountNotEnoughKeys */, ah, q, aa)
				ah = undef
				q = undef
				h = ld64(s3b0 + 8)
				i = ld64(s3b0)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			} else {
				h = ld64(s580 + 8) + (ai << 3)
				ai = ai + 1
			}
			st64(s618 + 0x30, h)
			if (ai >= c) {
				j = anchor_error_from(s3c0, 0xbbd /* anchor::AccountNotEnoughKeys */, ah, q, aa)
				ah = undef
				q = undef
				h = ld64(s3c0 + 8)
				i = ld64(s3c0)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			} else {
				h = ld64(s580 + 8) + (ai << 3)
				ai = ai + 1
			}
			st64(s618 + 0x28, h)
			if (ai >= c) {
				j = anchor_error_from(s3d0, 0xbbd /* anchor::AccountNotEnoughKeys */, ah, q, aa)
				ah = undef
				q = undef
				h = ld64(s3d0 + 8)
				i = ld64(s3d0)
				if (i != 3) {
					st64(a + 8, h)
					st64(a, i)
					return j
				}
			} else {
				h = ld64(s580 + 8) + (ai << 3)
				ai = ai + 1
			}
			st64(s618 + 0x20, h)
			if (ai >= c) {
				st64(s618 + 0x68, ai)
				j = anchor_error_from(s3e0, 0xbbd /* anchor::AccountNotEnoughKeys */, ah, q, aa)
				q = undef
				ah = ld64(s3e0 + 8)
				i = ld64(s3e0)
				if (i != 3) {
					st64(a + 8, ah)
					st64(a, i)
					return j
				}
			} else {
				ah = ld64(s580 + 8) + (ai << 3)
				st64(s618 + 0x68, ai + 1)
			}
			if (ld8(ld64(ah) + 2) == 0) {
				j = anchor_error_from(s3f0, 0xbbe /* anchor::AccountNotMutable */, ah, q, aa)
				q = undef
				ah = ld64(s3f0 + 8)
				i = ld64(s3f0)
				if (i != 3) {
					st64(a + 8, ah)
					st64(a, i)
					return j
				}
			}
			const aj = ld64(s618 + 0x68)
			if (aj >= c) {
				cr = ah
				j = anchor_error_from(s400, 0xbbd /* anchor::AccountNotEnoughKeys */, ah, q, aa)
				q = undef
				ah = ld64(s400 + 8)
				i = ld64(s400)
				if (i != 3) {
					st64(a + 8, ah)
					st64(a, i)
					return j
				}
			} else {
				cr = ah
				ah = ld64(s580 + 8) + (aj << 3)
				st64(s618 + 0x68, aj + 1)
			}
			if (ld8(ld64(ah) + 2) == 0) {
				j = anchor_error_from(s410, 0xbbe /* anchor::AccountNotMutable */, ah, q, aa)
				q = undef
				ah = ld64(s410 + 8)
				i = ld64(s410)
				if (i != 3) {
					st64(a + 8, ah)
					st64(a, i)
					return j
				}
			}
			const ak = ld64(s618 + 0x68)
			st64(s618 + 0x18, ah)
			if (ak >= c) {
				j = anchor_error_from(s420, 0xbbd /* anchor::AccountNotEnoughKeys */, ah, q, aa)
				q = undef
				ah = ld64(s420 + 8)
				i = ld64(s420)
				if (i != 3) {
					st64(a + 8, ah)
					st64(a, i)
					return j
				}
			} else {
				ah = ld64(s580 + 8) + (ak << 3)
				st64(s618 + 0x68, ak + 1)
			}
			if (ld8(ld64(ah) + 2) == 0) {
				j = anchor_error_from(s430, 0xbbe /* anchor::AccountNotMutable */, ah, q, aa)
				q = undef
				ah = ld64(s430 + 8)
				i = ld64(s430)
				if (i != 3) {
					st64(a + 8, ah)
					st64(a, i)
					return j
				}
			}
			st64(s618 + 0x10, ah)
			if (ld64(s618 + 0x68) >= c) {
				j = anchor_error_from(s440, 0xbbd /* anchor::AccountNotEnoughKeys */, ah, q, aa)
				q = undef
				ah = ld64(s440 + 8)
				i = ld64(s440)
				if (i != 3) {
					st64(a + 8, ah)
					st64(a, i)
					return j
				}
			} else {
				const al = ld64(s618 + 0x68)
				ah = ld64(s580 + 8) + (al << 3)
				st64(s618 + 0x68, al + 1)
			}
			if (ld8(ld64(ah) + 2) == 0) {
				j = anchor_error_from(s450, 0xbbe /* anchor::AccountNotMutable */, ah, q, aa)
				q = undef
				ah = ld64(s450 + 8)
				i = ld64(s450)
				if (i != 3) {
					st64(a + 8, ah)
					st64(a, i)
					return j
				}
			}
			st64(s618, k, ah)
			if (ld64(s618 + 0x68) >= c) {
				j = anchor_error_from(s460, 0xbbd /* anchor::AccountNotEnoughKeys */, ah, q, aa)
				q = undef
				ah = ld64(s460 + 8)
				i = ld64(s460)
				if (i != 3) {
					st64(a + 8, ah)
					st64(a, i)
					return j
				}
			} else {
				const am = ld64(s618 + 0x68)
				ah = ld64(s580 + 8) + (am << 3)
				st64(s618 + 0x68, am + 1)
			}
			if (ld8(ld64(ah) + 2) == 0) {
				j = anchor_error_from(s470, 0xbbe /* anchor::AccountNotMutable */, ah, q, aa)
				q = undef
				ah = ld64(s470 + 8)
				i = ld64(s470)
				if (i != 3) {
					st64(a + 8, ah)
					st64(a, i)
					return j
				}
			}
			st64(s620, ah)
			if (ld64(s618 + 0x68) >= c) {
				j = anchor_error_from(s480, 0xbbd /* anchor::AccountNotEnoughKeys */, ah, q, aa)
				q = undef
				ah = ld64(s480 + 8)
				i = ld64(s480)
				if (i != 3) {
					st64(a + 8, ah)
					st64(a, i)
					return j
				}
			} else {
				const an = ld64(s618 + 0x68)
				ah = ld64(s580 + 8) + (an << 3)
				st64(s618 + 0x68, an + 1)
			}
			if (ld8(ld64(ah) + 2) == 0) {
				j = anchor_error_from(s490, 0xbbe /* anchor::AccountNotMutable */, ah, q, aa)
				q = undef
				ah = ld64(s490 + 8)
				i = ld64(s490)
				if (i != 3) {
					st64(a + 8, ah)
					st64(a, i)
					return j
				}
			}
			st64(s630, ah)
			if (ld64(s618 + 0x68) >= c) {
				j = anchor_error_from(s4a0, 0xbbd /* anchor::AccountNotEnoughKeys */, ah, q, aa)
				ah = undef
				q = undef
				ap = ld64(s4a0 + 8)
				i = ld64(s4a0)
				if (i != 3) {
					st64(a + 8, ap)
					st64(a, i)
					return j
				}
			} else {
				const ao = ld64(s618 + 0x68)
				ap = ld64(s580 + 8) + (ao << 3)
				st64(s618 + 0x68, ao + 1)
			}
			if (ld8(ld64(ap) + 2) == 0) {
				j = anchor_error_from(s4b0, 0xbbe /* anchor::AccountNotMutable */, ah, q, aa)
				ah = undef
				q = undef
				ap = ld64(s4b0 + 8)
				i = ld64(s4b0)
				if (i != 3) {
					st64(a + 8, ap)
					st64(a, i)
					return j
				}
			}
			if (ld64(s618 + 0x68) >= c) {
				j = anchor_error_from(s4c0, 0xbbd /* anchor::AccountNotEnoughKeys */, ah, q, aa)
				ar = undef
				q = undef
				st64(s628, ld64(s4c0 + 8))
				i = ld64(s4c0)
				if (i != 3) {
					st64(a + 8, ld64(s628))
					st64(a, i)
					return j
				}
			} else {
				const aq = ld64(s618 + 0x68)
				ar = ld64(s580 + 8) + (aq << 3)
				st64(s628, ar)
				st64(s618 + 0x68, aq + 1)
			}
			if (ld8(ld64(ld64(s628)) + 2) == 0) {
				j = anchor_error_from(s4d0, 0xbbe /* anchor::AccountNotMutable */, ar, q, aa)
				ar = undef
				q = undef
				st64(s628, ld64(s4d0 + 8))
				i = ld64(s4d0)
				if (i != 3) {
					st64(a + 8, ld64(s628))
					st64(a, i)
					return j
				}
			}
			if (ld64(s618 + 0x68) >= c) {
				j = anchor_error_from(s4e0, 0xbbd /* anchor::AccountNotEnoughKeys */, ar, q, aa)
				st64(s638, ld64(s4e0 + 8))
				i = ld64(s4e0)
				if (i != 3) {
					st64(a + 8, ld64(s638))
					st64(a, i)
					return j
				}
			} else {
				const at = ld64(s618 + 0x68)
				st64(s638, ld64(s580 + 8) + (at << 3))
				st64(s618 + 0x68, at + 1)
			}
			st64(s158, 0x100159348, 0x100159350)
			const au = fn_118b0(s158, ld64(s638))
			if (au == 0) {
				j = anchor_error_from(s4f0, 0xbc0 /* anchor::InvalidProgramId */, av, aw, ax)
				st64(s638, ld64(s4f0 + 8))
				i = ld64(s4f0)
				if (i != 3) {
					st64(a + 8, ld64(s638))
					st64(a, i)
					return j
				}
			}
			if (c >= ld64(s618 + 0x68)) {
				j = fn_22210(s158, ld64(ld64(s618 + 0x70)), av, aw, ax)
				st64(s648, ld8(s148))
				st64(s640, ld64(s150))
				const ay = ld64(s158)
				st64(s650, ay)
				if (ay == 0) {
					st32(s290 + 3, ld32(s148 + 4))
					st32(s290, ld32(s148 + 1))
					st32(a + 0xc, ld32(s290 + 3))
					st32(a + 9, ld32(s290))
					st8(a + 8, ld64(s648))
					st64(a, ld64(s640))
					return j
				}
				const ba = ld64(ld64(s618 + 0x28))
				const az = ld64(ld64(s618 + 0x60))
				st64(s658, ba)
				j = fn_228d8(s158, az + 8, ba + 0x28, undef, undef, j)
				if (ld64(s158) == 3) {
					const bc = ld64(ld64(s618 + 0x20))
					const bb = ld64(ld64(s618 + 0x58))
					st64(s660, bc)
					j = fn_228d8(s158, bb + 8, bc + 0x28, undef, undef, j)
					if (ld64(s158) == 3) {
						j = fn_21f70(s158, ld64(ld64(s618 + 0x40)))
						st64(s670, ld8(s148))
						st64(s668, ld64(s150))
						const bd = ld64(s158)
						st64(s678, bd)
						if (bd == 0) {
							st32(s290 + 3, ld32(s148 + 4))
							st32(s290, ld32(s148 + 1))
							st32(a + 0xc, ld32(s290 + 3))
							st32(a + 9, ld32(s290))
							st8(a + 8, ld64(s670))
							st64(a, ld64(s668))
							bg = ld64(s640)
							st8(bg, ld8(bg) | ld64(s648))
							return j
						}
						const bf = ld64(ld64(s618 + 0x70))
						const be = ld64(s678)
						st64(s680, bf + 8)
						j = fn_228d8(s158, be + 8, bf + 8, undef, undef, j)
						if (ld64(s158) == 3) {
							j = fn_224b0(s158, ld64(ld64(s618 + 0x30)), undef, undef, undef, j)
							st64(s618 + 0x30, ld64(s158))
							if (ld8(s140 + 8) == 2) {
								st64(a + 8, ld64(s150))
								st64(a, ld64(s618 + 0x30))
								bp = ld64(s668)
								st8(bp, ld8(bp) | ld64(s670))
								bg = ld64(s640)
								st8(bg, ld8(bg) | ld64(s648))
								return j
							}
							B142: {
								B141: {
									st64(s690, ld8(s140))
									st64(s688, ld64(s148))
									const bh = memcmp(ld64(s618 + 0x30), ld64(s678) + 0x28, 0x20)
									j = bh as u32
									if (j != 0) {
										j = anchor_error_from(s500, 0x7d3 /* anchor::ConstraintRaw */, bi, bj, bk)
										bl = ld64(s500)
										if (bl != 3) {
											bn = ld64(s500 + 8)
											break B141
										}
									}
									if (ld64(ld64(s618 + 0x30) + 0x40) != 1) {
										j = anchor_error_from(s510, 0x7d3 /* anchor::ConstraintRaw */, bi, bj, bk)
										bl = ld64(s510)
										if (bl != 3) {
											bn = ld64(s510 + 8)
											break B141
										}
									}
									j = fn_228d8(s158, ld64(s658) + 8, ld64(s650) + 0x65 /* anchor::InstructionFallbackNotFound */, bj, bk, j)
									if (ld64(s158) == 3) {
										j = fn_228d8(s158, ld64(s660) + 8, ld64(s650) + 0xb5, undef, undef, j)
										if (ld64(s158) == 3) {
											j = fn_228d8(s158, ld64(ld64(s618 + 0x10)) + 8, ld64(s650) + 0x85, undef, undef, j)
											if (ld64(s158) == 3) {
												j = fn_228d8(s158, ld64(ld64(s618 + 8)) + 8, ld64(s650) + 0xd5, undef, undef, j)
												if (ld64(s158) == 3) {
													j = fn_1d488(s158, ld64(s618 + 0x30), ld64(ld64(s618 + 0x38)))
													if (ld64(s158) == 3) {
														if (ld8(ld64(s618 + 0x30) + 0x6c) == 2) {
															j = fn_87630(s550, 0x3b)
															bm = ld64(s550)
															st64(a + 8, ld64(s550 + 8))
															st64(a, bm)
															break B142
														}
														const bq = ld64(s688)
														st8(bq, ld8(bq) + (1 << (ld64(s690) & 7)))
														j = clock_get_139448(s158)
														if (ld32(s158) != 0) {
															st64(a + 8, ld64(s158 + 4))
															st64(a, 2)
															bp = ld64(s668)
															st8(bp, ld8(bp) | ld64(s670))
															bg = ld64(s640)
															st8(bg, ld8(bg) | ld64(s648))
															return j
														}
														const br = ld64(s618 + 0x68)
														const bs = ld64(s580 + 8) + (br << 3)
														st64(s580 + 8, ld64(s140 + 0x10))
														st64(s1000, 0x100152d50, 4)
														j = fn_1c688(s158, bs, c - br, s2e0, 0x100152d50, 4)
														copy(s10, s150, 0x10)
														const bt = ld64(s158)
														if (bt == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
															st64(a + 8, ld64(s10 + 8))
															st64(a, ld64(s10))
															bp = ld64(s668)
															st8(bp, ld8(bp) | ld64(s670))
															bg = ld64(s640)
															st8(bg, ld8(bg) | ld64(s648))
															return j
														}
														B171: {
															B154: {
																memcpy(s278, s140, 0x120)
																st64(s290, bt)
																copy(s288, s10, 0x10)
																if (-1 >= (ld64(s580 + 8) as i64)) {
																	cb = fn_87630(s520, 0x15)
																	st64(s580 + 8, ld64(s520 + 8))
																	bu = ld64(s520)
																	if (bu != 2) {
																		cc = ld64(s580 + 8)
																		break B154
																	}
																}
																const bv = ld64(s678)
																const ct = ld64(bv + 0x50)
																st64(s658, ld64(bv + 0x48))
																st64(s618 + 0x30, ld32(bv + 0x5c))
																st64(s618 + 0x68, ld32(bv + 0x58))
																st64(s20, 0, 0)
																const by = ld64(ld64(s618 + 0x40))
																const bx = ld64(ld64(s620))
																const bw = ld64(ld64(s630))
																st64(sfe0, s20, s18)
																st64(s1000 + 0x18, ld64(s580 + 8))
																st64(s1000, by, bx, bw)
																cb = fn_2f238(s158, ld64(s680), ld64(s650), bv, fp)
																if (ld64(s158) == 3) {
																	cb = cpi_system_transfer(s158, ld64(s618 + 0x48), ld64(s618 + 0x40), ld64(s638))
																	if (ld64(s158) == 3) {
																		const ca = ld64(ld64(s618 + 0x28))
																		const bz = ld64(s20)
																		st64(s618 + 0x48, bz)
																		cb = fn_1d6c0(s158, ca, bz, undef, undef, cb)
																		bu = ld64(s150)
																		if (ld64(s158) == 0) {
																			if (ld64(s5a0) > bu) {
																				cb = fn_87630(s540, 0x12)
																				bu = ld64(s540)
																				cc = ld64(s540 + 8)
																				break B154
																			}
																			const ce = ld64(ld64(s618 + 0x20))
																			const cd = ld64(s18)
																			st64(s5a0, cd)
																			cb = fn_1d6c0(s158, ce, cd, undef, undef, cb)
																			bu = ld64(s150)
																			if (ld64(s158) == 0) {
																				if (ld64(s5a0 + 8) > bu) {
																					cb = fn_87630(s530, 0x12)
																					bu = ld64(s530)
																					cc = ld64(s530 + 8)
																					break B154
																				}
																				const ci = ld16(ld64(s650) + 0x29)
																				const cf = ld32(s2b8 + 0x20)
																				const cg = ld32(s2b8 + 0x24)
																				const ch = ld64(s678)
																				st64(s5a0 + 8, cf)
																				st64(s620, cg)
																				cb = fn_1f868(s158, ch, ci, cf, cg)
																				if (ld64(s158) == 3) {
																					const cl = ld64(ld64(s618 + 0x40))
																					const ck = ld64(ap)
																					const cj = ld64(ld64(s628))
																					copy(sfe0, s580, 0x10)
																					st64(s1000 + 0x18, ld64(s618))
																					st64(s1000, cl, ck, cj)
																					cb = fn_2fa40(s158, ld64(s680), ld64(s650), ld64(s678), fp)
																					st64(s580 + 8, ld64(s148))
																					const cm = ld64(s150)
																					if (ld64(s158) == 0) {
																						cb = fn_30758(s158, ld64(ld64(s618 + 0x28)), ld64(s618 + 0x48), cm, ld64(s5a0 + 0x10), cb)
																						st64(s628, ld64(s150))
																						st64(s5a0 + 0x10, ld64(s158))
																						const cn = ld8(s148)
																						st64(s630, cn)
																						if (cn == 2) {
																							st64(a + 8, ld64(s628))
																							bu = ld64(s5a0 + 0x10)
																							break B171
																						}
																						cb = fn_30758(s158, ld64(ld64(s618 + 0x20)), ld64(s5a0), ld64(s580 + 8), ld64(s5a0 + 0x18), cb)
																						const co = ld8(s148)
																						st64(s5a0 + 0x18, co)
																						if (co == 2) {
																							bu = ld64(s158)
																							cc = ld64(s150)
																							break B154
																						}
																						const cp = ld64(s5a0 + 0x18) != 0
																						const cq = ld64(s630) != 0
																						st64(s638, ld64(s150))
																						const cs = ld64(s158)
																						st64(sfe0 + 0x40, s290)
																						st64(sfe0 + 0x48, ld64(s618 + 0x50))
																						st64(sfe0 + 0x38, cp)
																						st64(sfe0 + 0x28, ld64(s618 + 0x58))
																						st64(sfe0 + 0x20, ld64(s618 + 0x18))
																						st64(sfe0 + 0x18, ld64(s618 + 8))
																						st64(sfe0 + 0x10, ld64(s618 + 0x20))
																						st64(sfe0 + 8, cq)
																						st64(sfe0, ld64(s5a0 + 0x10))
																						st64(s1000 + 0x18, ld64(s618 + 0x60))
																						st64(s1000 + 0x10, cr)
																						st64(s1000 + 8, ld64(s618 + 0x10))
																						st64(s1000, ld64(s618 + 0x28))
																						st64(sfe0 + 0x30, cs)
																						cb = fn_30388(s158, ld64(s618 + 0x70), ld64(s650), ld64(s618 + 0x38), ld64(s1000), ld64(s1000 + 8), cr, ld64(s1000 + 0x18), ld64(sfe0), cq, ld64(sfe0 + 0x10), ld64(sfe0 + 0x18), ld64(sfe0 + 0x20), ld64(sfe0 + 0x28), cs, cp, s290, ld64(sfe0 + 0x48))
																						if (ld64(s158) == 3) {
																							const cu = ld64(ld64(s618 + 0x40))
																							st64(s140 + 0x18, ld64(s580))
																							st64(s140 + 0x10, ld64(s618))
																							st64(s140 + 8, ct)
																							st64(s140, ld64(s658))
																							st64(s140 + 0x60, ld64(s680))
																							st64(s140 + 0x48, ld64(s628))
																							st64(s140 + 0x40, ld64(s5a0 + 0x10))
																							st64(s140 + 0x38, ld64(s580 + 8))
																							st64(s140 + 0x30, cm)
																							st64(s140 + 0x28, ld64(s5a0))
																							st64(s140 + 0x20, ld64(s618 + 0x48))
																							st32(s148, ld64(s620))
																							st32(s150 + 4, ld64(s5a0 + 8))
																							st32(s150, ld64(s618 + 0x30))
																							st32(s158 + 4, ld64(s618 + 0x68))
																							st64(s140 + 0x58, ld64(s638))
																							st64(s140 + 0x50, cs)
																							st8(s158 + 1, ld64(s630))
																							st8(s158 + 2, ld64(s5a0 + 0x18))
																							st64(s140 + 0x68, cu + 8)
																							st8(s158, 2)
																							cb = fn_15490(s10, s158)
																							if (ld64(s10) == 3) {
																								st64(a, 3)
																								j = fn_bc78(cb)
																								bp = ld64(s668)
																								st8(bp, ld8(bp) | ld64(s670))
																								bg = ld64(s640)
																								st8(bg, ld8(bg) | ld64(s648))
																								return j
																							}
																							st64(a + 8, ld64(s10 + 8))
																							bu = ld64(s10)
																							break B171
																						}
																						st64(a + 8, ld64(s150))
																						bu = ld64(s158)
																						break B171
																					}
																					st64(a + 8, ld64(s580 + 8))
																					st64(a, cm)
																					j = fn_bc78(cb)
																					bp = ld64(s668)
																					st8(bp, ld8(bp) | ld64(s670))
																					bg = ld64(s640)
																					st8(bg, ld8(bg) | ld64(s648))
																					return j
																				}
																				st64(a + 8, ld64(s150))
																				bu = ld64(s158)
																				break B171
																			}
																		}
																		cc = ld64(s148)
																		break B154
																	}
																}
																st64(a + 8, ld64(s150))
																bu = ld64(s158)
																break B171
															}
															st64(a + 8, cc)
														}
														st64(a, bu)
														j = fn_bc78(cb)
														bp = ld64(s668)
														st8(bp, ld8(bp) | ld64(s670))
														bg = ld64(s640)
														st8(bg, ld8(bg) | ld64(s648))
														return j
													}
												}
											}
										}
									}
									st64(a + 8, ld64(s150))
									bm = ld64(s158)
									st64(a, bm)
									break B142
								}
								st64(a, bl, bn)
							}
							const bo = ld64(s688)
							st8(bo, ld8(bo) + (1 << (ld64(s690) & 7)))
							bp = ld64(s668)
							st8(bp, ld8(bp) | ld64(s670))
							bg = ld64(s640)
							st8(bg, ld8(bg) | ld64(s648))
							return j
						}
						st64(a + 8, ld64(s150))
						st64(a, ld64(s158))
						bp = ld64(s668)
						st8(bp, ld8(bp) | ld64(s670))
						bg = ld64(s640)
						st8(bg, ld8(bg) | ld64(s648))
						return j
					}
					st64(a + 8, ld64(s150))
					st64(a, ld64(s158))
					bg = ld64(s640)
					st8(bg, ld8(bg) | ld64(s648))
					return j
				}
				st64(a + 8, ld64(s150))
				st64(a, ld64(s158))
				bg = ld64(s640)
				st8(bg, ld8(bg) | ld64(s648))
				return j
			}
			fn_14c4f0(ld64(s618 + 0x68), c, 0x100159a60, aw, ax)
		}
		j = fn_13b4d0(s570, fn_b6a0(0x15, "Not all bytes read", 0x12))
		i = ld64(s570)
		st64(a + 8, ld64(s570 + 8))
		st64(a, i)
		return j
	}
	fn_14c4f0(8, e, 0x100159af8, d, e)
}

export function fn_2f238(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1c0 = fp - 0x1c0, s370 = fp - 0x370, s530 = fp - 0x530, s540 = fp - 0x540, s568 = fp - 0x568, s580 = fp - 0x580, s5a8 = fp - 0x5a8, s5e0 = fp - 0x5e0, sfe8 = fp - 0xfe8, s1000 = fp - 0x1000
	let p, r, u, x, y, ab, ae: u64
	let k = b
	const g = ld64(d + 0x50)
	let f = ld64(d + 0x48)
	const i = ld64(e - 0xfd8)
	const h = ld64(e - 0xfe0)
	if ((f | g) != 0) {
		st64(s568, c, g, f, d)
		st64(s5a8, h, i)
		st64(s568 + 0x20, a)
		st64(s580 + 0x10, ld64(e - 0xfe8))
		const n = ld64(e - 0xff0)
		const j = ld64(e - 0xff8)
		st64(s5a8 + 0x10, ld64(e - 0x1000))
		f = fn_20f38(s1c0, j, k, d, e, f)
		const m = ld64(s1c0 + 0x10)
		let q = ld64(s1c0 + 8)
		const l = ld64(s1c0)
		if (l == 0) {
			x = ld64(s568 + 0x20)
			st64(x + 8, m)
			st64(x, q)
			return f
		}
		B19: {
			B5: {
				st64(s580, m, l)
				st64(s5a8 + 0x20, ld64(s1c0 + 0x18))
				st64(s5e0 + 0x28, j)
				const o = memcmp(j + 8, n + 8, 0x20)
				st64(s5a8 + 0x18, o)
				st64(s5e0 + 0x30, n)
				if ((o as u32) != 0) {
					f = fn_20f38(s1c0, n, k, undef, undef, o)
					k = ld64(s1c0 + 0x10)
					const w = ld64(s1c0 + 8)
					u = ld64(s1c0)
					ae = ld64(s568 + 0x18)
					if (u == 0) {
						const v = ld64(s580)
						st8(v, ld8(v) | ld64(s5a8 + 0x20))
						x = ld64(s568 + 0x20)
						st64(x + 8, k)
						st64(x, w)
						return f
					}
					st64(s5e0 + 0x20, ld64(s1c0 + 0x18))
					ab = q
					st64(s5e0 + 0x10, w)
					q = w
					y = u
					r = ld64(s568 + 8)
					p = ld64(s580 + 8)
					if (0 > (r as i64)) {
						break B5
					}
				} else {
					y = 0
					p = ld64(s580 + 8)
					u = p
					ab = q
					r = ld64(s568 + 8)
					ae = ld64(s568 + 0x18)
					if (0 > (r as i64)) {
						break B5
					}
				}
				st64(s568 + 8, y)
				const z = ld64(s568 + 0x10)
				const ac = r + (z != 0)
				const aa = ld64(s580 + 0x10)
				st64(sfe8 + 0x10, aa)
				st64(s1000, ab, u, q)
				st64(sfe8 + 8, -ac)
				st64(s568 + 0x10, -z)
				st64(sfe8, -z)
				const ad = ld64(s568)
				st64(s5e0 + 0x18, ab)
				f = fn_159d0(s1c0, ad, ae, p, ab, u, q, -z, -ac, aa)
				const af = ld8(s1c0 + 0x1b0)
				if (af == 2) {
					const ax = ld64(s1c0 + 8)
					st64(s370 + 8, ax)
					const ay = ld64(s1c0)
					st64(s370, ay)
					const az = ld64(s568 + 0x20)
					st64(az + 8, ax)
					st64(az, ay)
					break B19
				}
				st64(s5e0, k, s370)
				memcpy(s370, s1c0, 0x1b0)
				st64(s530 + 0x1b1, ld64(s1c0 + 0x1b1))
				st64(s530 + 0x1b8, ld64(s1c0 + 0x1b8))
				memcpy(s530, ld64(s5e0 + 8), 0x1b0)
				st8(s530 + 0x1b0, af)
				const ag = ld64(ld64(s5e0 + 0x18) + 0x38)
				st64(sfe8, s530, aa)
				st64(s1000 + 0x10, ld64(s5e0 + 0x10))
				st64(s1000 + 8, ld64(s568 + 8))
				st64(s1000, ag)
				const ah = ld64(s568)
				const ai = ld64(s568 + 0x18)
				f = fn_1aa28(s1c0, ah, ai, ld64(s580 + 8), ag, ld64(s1000 + 8), ld64(s1000 + 0x10), s530, aa)
				if (ld64(s1c0) == 3) {
					const aj = ld64(s580)
					st8(aj, ld8(aj) | ld64(s5a8 + 0x20))
					if ((ld64(s5a8 + 0x18) as u32) != 0) {
						const ak = ld64(s5e0)
						st8(ak, ld8(ak) | ld64(s5e0 + 0x20))
					}
					const an = ld8(s530 + 0x1b8)
					const am = ld8(s530 + 0x1b9)
					const al = ld8(s530 + 0x1bb)
					st64(s1000 + 0x10, ld8(s530 + 0x1ba))
					st64(sfe8, al)
					st64(s1000, an, am)
					f = fn_1ba30(s1c0, ld64(s5a8 + 0x10), ld64(s5e0 + 0x28), ld64(s5e0 + 0x30), an, am, ld64(s1000 + 0x10), al)
					if (ld64(s1c0) == 3) {
						const at = ld64(ah + 0x49)
						const ar = ld64(ah + 0x41)
						const aq = ld32(ah + 0x51)
						const ap = ld32(ai + 0x58)
						const ao = ld32(ai + 0x5c)
						st64(s1000 + 0x10, ld64(s568 + 0x10))
						st64(sfe8, -ac)
						st64(s1000, ap, ao)
						f = fn_1ad88(s1c0, aq, ar, at, ap, ao, ld64(s1000 + 0x10), -ac)
						const av = ld64(s1c0 + 0x10)
						const aw = ld64(s1c0 + 8)
						if (ld64(s1c0) == 0) {
							st64(ld64(s5a8), aw)
							st64(ld64(s5a8 + 8), av)
							st64(ld64(s568 + 0x20), 3)
							return f
						}
						const au = ld64(s568 + 0x20)
						st64(au + 8, av)
						st64(au, aw)
						return f
					}
					const bc = ld64(s568 + 0x20)
					st64(bc + 8, ld64(s1c0 + 8))
					st64(bc, ld64(s1c0))
					return f
				}
				const ba = ld64(s568 + 0x20)
				st64(ba + 8, ld64(s1c0 + 8))
				st64(ba, ld64(s1c0))
				k = ld64(s5e0)
				break B19
			}
			f = fn_87630(s540, 0xd)
			const t = ld64(s540)
			const s = ld64(s568 + 0x20)
			st64(s + 8, ld64(s540 + 8))
			st64(s, t)
		}
		const bb = ld64(s580)
		st8(bb, ld8(bb) | ld64(s5a8 + 0x20))
		if ((ld64(s5a8 + 0x18) as u32) == 0) {
			return f
		}
		st8(k, ld8(k) | ld64(s5e0 + 0x20))
		return f
	}
	st64(h, 0)
	st64(i, 0)
	st64(a, 3)
	return f
}

export function fn_2fa40(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1c0 = fp - 0x1c0, s370 = fp - 0x370, s530 = fp - 0x530, s540 = fp - 0x540, s570 = fp - 0x570, s580 = fp - 0x580, s5b0 = fp - 0x5b0, s5b8 = fp - 0x5b8, s5c0 = fp - 0x5c0, sfe8 = fp - 0xfe8, sff0 = fp - 0xff0, s1000 = fp - 0x1000
	let i, n, o, p, af, av, ay, az, ba: u64
	let k = a
	const f = ld64(e - 0xfe0)
	if (0 > (f as i64)) {
		o = fn_87630(s540, 0xd)
		i = ld64(s540)
		st64(k + 0x10, ld64(s540 + 8))
		st64(k + 8, i)
		st64(k, 1)
		return o
	}
	st64(s570 + 0x18, c)
	st64(s570 + 8, f)
	st64(s570 + 0x20, d)
	st64(s570, ld64(e - 0xfe8))
	st64(s570 + 0x10, ld64(e - 0xfd8))
	let l = ld64(e - 0xff0)
	const g = ld64(e - 0xff8)
	st64(s5b0 + 0x20, ld64(e - 0x1000))
	st64(s570 + 0x28, b)
	o = fn_20f38(s1c0, g, b, d, e, b)
	const j = ld64(s1c0 + 0x10)
	i = ld64(s1c0 + 8)
	const h = ld64(s1c0)
	if (h == 0) {
		st64(k + 0x10, j)
		st64(k + 8, i)
		st64(k, 1)
		return o
	}
	st64(s5b0 + 0x18, i)
	st64(s580, j, k)
	st64(s5b0 + 0x28, ld64(s1c0 + 0x18))
	st64(s5b0, l + 8, g)
	const m = memcmp(g + 8, l + 8, 0x20)
	st64(s5b0 + 0x10, l)
	if ((m as u32) != 0) {
		o = fn_20f38(s1c0, l, ld64(s570 + 0x28), undef, undef, m)
		l = ld64(s1c0 + 0x10)
		i = ld64(s1c0 + 8)
		p = ld64(s1c0)
		if (p == 0) {
			const q = ld64(s580)
			st8(q, ld8(q) | ld64(s5b0 + 0x28))
			k = ld64(s580 + 8)
			st64(k + 0x10, l)
			st64(k + 8, i)
			st64(k, 1)
			return o
		}
		st64(s5b8, g + 8)
		st64(s5c0, ld64(s1c0 + 0x18))
		n = ld64(s5b0 + 0x18)
	} else {
		st64(s5b8, g + 8)
		p = h
		n = ld64(s5b0 + 0x18)
		i = n
	}
	copy(sfe8, s570, 0x18)
	st64(s1000, n, p, i)
	o = fn_159d0(s1c0, ld64(s570 + 0x18), ld64(s570 + 0x20), h, n, p, i, ld64(sfe8), ld64(sfe8 + 8), ld64(sfe8 + 0x10))
	const r = ld8(s1c0 + 0x1b0)
	if (r == 2) {
		const ah = ld64(s1c0 + 8)
		st64(s370 + 8, ah)
		const ai = ld64(s1c0)
		st64(s370, ai)
		const aj = ld64(s580 + 8)
		st64(aj + 0x10, ah)
		st64(aj + 8, ai)
		st64(aj, 1)
		const ak = ld64(s580)
		st8(ak, ld8(ak) | ld64(s5b0 + 0x28))
		if ((m as u32) == 0) {
			return o
		}
		st8(l, ld8(l) | ld64(s5c0))
		return o
	}
	memcpy(s370, s1c0, 0x1b0)
	st64(s530 + 0x1b1, ld64(s1c0 + 0x1b1))
	st64(s530 + 0x1b8, ld64(s1c0 + 0x1b8))
	memcpy(s530, s370, 0x1b0)
	st8(s530 + 0x1b0, r)
	const s = ld64(s580)
	st8(s, ld8(s) | ld64(s5b0 + 0x28))
	if ((m as u32) != 0) {
		st8(l, ld8(l) | ld64(s5c0))
	}
	const v = ld8(s530 + 0x1b8)
	const u = ld8(s530 + 0x1b9)
	const t = ld8(s530 + 0x1bb)
	st64(sff0, ld8(s530 + 0x1ba))
	st64(sfe8, t)
	st64(s1000, v, u)
	const w = ld64(s5b0 + 8)
	o = fn_1ba30(s1c0, ld64(s5b0 + 0x20), w, ld64(s5b0 + 0x10), v, u, ld64(sff0), t)
	const x = ld64(s570 + 0x28)
	if (ld64(s1c0) == 3) {
		o = fn_20f38(s1c0, w, x, undef, undef, o)
		const z = ld64(s1c0 + 0x10)
		const ag = ld64(s1c0 + 8)
		const y = ld64(s1c0)
		if (y == 0) {
			af = ld64(s580 + 8)
			st64(af + 0x10, z)
			st64(af + 8, ag)
			st64(af, 1)
			return o
		}
		st64(s580, z)
		st64(s5b0 + 0x28, ld64(s1c0 + 0x18))
		const aa = memcmp(ld64(s5b8), ld64(s5b0), 0x20)
		let ad = undef
		let ab = 0
		if ((aa as u32) != 0) {
			o = fn_20f38(s1c0, ld64(s5b0 + 0x10), x, undef, undef, aa)
			const ae = ld64(s1c0 + 0x10)
			ad = ld64(s1c0 + 8)
			ab = ld64(s1c0)
			if (ab == 0) {
				const ac = ld64(s580)
				st8(ac, ld8(ac) | ld64(s5b0 + 0x28))
				af = ld64(s580 + 8)
				st64(af + 0x10, ae)
				st64(af + 8, ad)
				st64(af, 1)
				return o
			}
			st64(s5b0 + 0x18, ae)
			st64(s5b0 + 0x20, ld64(s1c0 + 0x18))
		}
		const am = ld64(ag + 0x38)
		st64(sfe8, s530)
		st64(sfe8 + 8, ld64(s570 + 0x10))
		st64(s1000, am, ab, ad)
		const an = ld64(s570 + 0x18)
		const ao = ld64(s570 + 0x20)
		o = fn_1aa28(s1c0, an, ao, y, am, ab, ad, s530, ld64(sfe8 + 8))
		if (ld64(s1c0) == 3) {
			const au = ld64(an + 0x49)
			const at = ld64(an + 0x41)
			const ar = ld32(an + 0x51)
			const aq = ld32(ao + 0x58)
			const ap = ld32(ao + 0x5c)
			copy(sff0, s570, 0x10)
			st64(s1000, aq, ap)
			o = fn_1ad88(s1c0, ar, at, au, aq, ap, ld64(sff0), ld64(sfe8))
			const ax = ld64(s1c0)
			const aw = ld64(s1c0 + 8)
			av = ld64(s580 + 8)
			st64(av + 0x10, ld64(s1c0 + 0x10))
			st64(av + 8, aw)
			ay = ld64(s580)
			if (ax == 0) {
				st64(av, 0)
				st8(ay, ld8(ay) | ld64(s5b0 + 0x28))
				ba = ld64(s5b0 + 0x20)
				if ((aa as u32) == 0) {
					return o
				}
				az = ld64(s5b0 + 0x18)
				st8(az, ld8(az) | ba)
				return o
			}
		} else {
			av = ld64(s580 + 8)
			st64(av + 0x10, ld64(s1c0 + 8))
			st64(av + 8, ld64(s1c0))
			ay = ld64(s580)
		}
		st64(av, 1)
		st8(ay, ld8(ay) | ld64(s5b0 + 0x28))
		ba = ld64(s5b0 + 0x20)
		if ((aa as u32) == 0) {
			return o
		}
		az = ld64(s5b0 + 0x18)
		st8(az, ld8(az) | ba)
		return o
	}
	const al = ld64(s580 + 8)
	st64(al + 0x10, ld64(s1c0 + 8))
	st64(al + 8, ld64(s1c0))
	st64(al, 1)
	return o
}

export function fn_30388(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64, p13: u64, p14: u64, p15: u64, p16: u64, p17: u64, p18: u64): u64 {
	const s10 = fp - 0x10, sfe0 = fp - 0xfe0, s1000 = fp - 0x1000
	let f, h, m, n, q, r, s, t, u: u64
	B3: {
		h = p18
		f = p17
		const p = p16
		q = p15
		r = p14
		t = p13
		s = p12
		u = p11
		const g = p9
		const i = p8
		const j = p7
		const k = p6
		const v = p5
		if (p10 != 0) {
			st64(s1000, k, i, h, f + 0xd8, g)
			m = d
			n = fn_1e190(s10, d, v, j, fp)
			if (ld64(s10) != 3) {
				st64(a + 8, ld64(s10 + 8))
				st64(a, ld64(s10))
				return n
			}
			if (p != 0) {
				break B3
			}
		} else {
			const o = f
			st64(sfe0, f + 0x108, g)
			const l = h
			st64(s1000, k, j, i, h)
			n = fn_1e9a8(s10, c, b, v, fp)
			if (ld64(s10) != 3) {
				st64(a + 8, ld64(s10 + 8))
				st64(a, ld64(s10))
				return n
			}
			m = d
			h = l
			f = o
			if (p != 0) {
				break B3
			}
		}
		st64(s1000, s, t, r, h, f + 0x120, q)
		n = fn_1e9a8(s10, c, b, u, fp)
		if (ld64(s10) == 3) {
			st64(a, 3)
			return n
		}
		st64(a + 8, ld64(s10 + 8))
		st64(a, ld64(s10))
		return n
	}
	st64(s1000, s, r, h, f + 0xf0, q)
	n = fn_1e190(s10, m, u, t, fp)
	if (ld64(s10) == 3) {
		st64(a, 3)
		return n
	}
	st64(a + 8, ld64(s10 + 8))
	st64(a, ld64(s10))
	return n
}

export function fn_30758(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s14 = fp - 0x14, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108
	let g, h, j, w, ac, ad, ae, af, aj: u64
	let f = c
	if (c > d) {
		h = f - d
		af = fn_1d6c0(se8, b, h, d, e, r0)
		if (ld64(se8) != 0) {
			const i = ld64(se8 + 8)
			st64(a + 8, ld64(se8 + 0x10))
			st64(a, i)
			st8(a + 0x10, 2)
			return af
		}
		j = 0
		g = ld64(se8 + 0x10)
	} else {
		af = fn_1db68(se8, b, d - f, d, e, r0)
		g = ld64(se8 + 0x10)
		h = ld64(se8 + 8)
		j = g
		if (ld64(se8) != 0) {
			st64(a + 8, g)
			st64(a, h)
			st8(a + 0x10, 2)
			return af
		}
	}
	const ak = h
	let k = d + j
	if (d > k) {
		af = fn_87630(s108, 0x34)
		ae = ld64(s108 + 8)
		w = ld64(s108)
		if (w == 3) {
			st64(a + 8, g)
			st64(a, ak)
			st8(a + 0x10, d >= f)
			return af
		}
		st64(a, w, ae)
		st8(a + 0x10, 2)
		return af
	}
	if (k > e) {
		B31: {
			B30: {
				aj = g
				st64(se8 + 0xc8, 0)
				sol_memcpy(se8, "new amount with fee ", 0x14)
				const l = ld64(se8 + 0xc8)
				st64(se8 + 0xc8, l + 0x14)
				if (0xc8 >= l + 0x14) {
					if (l == 0xb4) {
						break B30
					}
					const ah = f
					let n = 0
					while (true) {
						const m = k
						k = k / 0xa
						st8(s14 + n + 0x13, m - k * 0xa | 0x30)
						n = n - 1
						if (9 >= m) {
							const p = se8 + (l + 0x14)
							const o = -n
							let ai = min(o, 0xb4 - l)
							let ag = p
							sol_memcpy(p, s14 + n + 0x14, ai)
							const q = ai
							if (o > 0xb4 - l) {
								st8(ag + q - 1, 0x40)
							}
							const r = ld64(se8 + 0xc8)
							st64(se8 + 0xc8, r + q)
							f = ah
							if (r + q > 0xc8) {
								break
							}
							if (r + q == 0xc8) {
								break B30
							}
							const s = min(0xc8 - (r + q), 0x14)
							const t = se8 + (r + q)
							ag = t
							sol_memcpy(t, 0x100152d7c, s)
							if (r + q >= 0xb5) {
								st8(ag + s - 1, 0x40)
							}
							const u = ld64(se8 + 0xc8)
							st64(se8 + 0xc8, u + s)
							if (u + s > 0xc8) {
								break
							}
							if (u + s == 0xc8) {
								break B30
							}
							const v = se8 + (u + s)
							if (e != 0) {
								const ab = 0xc8 - (u + s)
								let z = 0
								let x = e
								while (true) {
									const y = x
									x = x / 0xa
									st8(s14 + z + 0x13, y - x * 0xa | 0x30)
									z = z - 1
									if (9 >= y) {
										const aa = -z
										ac = min(aa, ab)
										ai = v
										sol_memcpy(v, s14 + z + 0x14, ac)
										if (aa > ab) {
											st8(ai + ac - 1, 0x40)
										}
										f = ah
										break
									}
								}
							} else {
								st8(v, 0x30)
								ac = 1
							}
							ad = ld64(se8 + 0xc8) + ac
							st64(se8 + 0xc8, ad)
							if (0xc9 > ad) {
								break B31
							}
							break
						}
					}
				}
				st64(se8 + 0xc8, 0xc8)
			}
			ad = 0xc8
			st8(se8 + 0xc7, 0x40)
		}
		sol_log(se8, ad)
		af = fn_87630(sf8, 0x11)
		ae = ld64(sf8 + 8)
		w = ld64(sf8)
		g = aj
		if (w == 3) {
			st64(a + 8, g)
			st64(a, ak)
			st8(a + 0x10, d >= f)
			return af
		}
		st64(a, w, ae)
		st8(a + 0x10, 2)
		return af
	}
	st64(a + 8, g)
	st64(a, ak)
	st8(a + 0x10, d >= f)
	return af
}

export function fn_55bd0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, r0: u64) {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s1000 = fp - 0x1000
	const f = fn_501e0(s28, d, r0)
	const i = ld64(s28 + 8)
	const y = ld64(s28)
	fn_501e0(s38, p5, f)
	let g = ld64(s38 + 8)
	let h = ld64(s38)
	const j = p7
	if ((g != c ? c >= g : b >= h) != 0) {
		const m = g != i ? g > i : h > y
		const l = g != i ? i > g : y > h
		const o = l != 0 ? h : y
		h = m != 0 ? h : y
		const n = l != 0 ? g : i
		g = m != 0 ? g : i
		if ((h ^ o | g ^ n) == 0) {
			fn_14e168(0x100159d28, o, j, h, g)
		}
		__udivti3(s48, 0, j, h - o, g - n - (o > h), y)
		st64(a + 0x10, ld64(s48 + 8))
		st64(a + 8, ld64(s48))
		st32(a, 0)
	} else {
		const k = p6
		if ((i != c ? c > i : b > y) != 0) {
			st64(s1000, g, k)
			fn_56178(s18, b, c, h, fp)
			if (ld32(s18) == 0) {
				const r = c != i ? c > i : b > y
				const q = c != i ? i > c : y > b
				const s = q != 0 ? b : y
				const p = r != 0 ? b : y
				__udivti3(s58, 0, j, p - s, (r != 0 ? c : i) - (q != 0 ? c : i) - (s > p), y)
				const v = ld64(s18 + 8)
				const t = ld64(s18 + 0x10)
				const u = ld64(s58 + 8)
				const w = ld64(s58)
				const x = t != u ? u > t : w > v
				st64(a + 0x10, x != 0 ? t : u)
				st64(a + 8, x != 0 ? v : w)
				st32(a, 0)
			} else {
				st32(a + 4, ld32(s18 + 4))
				st32(a, 1)
			}
		} else {
			st64(s1000, g, k)
			fn_56178(a, y, i, h, fp)
		}
	}
}

export function fn_56178(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20, s58 = fp - 0x58, s60 = fp - 0x60, s80 = fp - 0x80, s98 = fp - 0x98, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s108 = fp - 0x108
	let v: u64
	const h = ld64(e - 0x1000)
	const j = c != h ? c > h : b > d
	const i = c != h ? h > c : d > b
	const k = i != 0 ? b : d
	st64(s108, j, e, a)
	const f = j != 0 ? b : d
	st64(sf0, f, k)
	__multi3(sb0, k, 0, f, 0)
	const l = i != 0 ? c : h
	__multi3(sc0, l, 0, ld64(sf0), 0)
	const g = ld64(s108) != 0 ? c : h
	__multi3(sd0, ld64(sf0 + 8), 0, g, 0)
	__multi3(se0, l, 0, g, 0)
	const n = ld64(sc0)
	const m = ld64(sb0 + 8)
	const o = m + n + ld64(sd0)
	st64(s20, ld64(sb0))
	st64(s20 + 8, o)
	const q = ld64(se0)
	const p = ld64(sc0 + 8)
	const r = p + q + ld64(sd0 + 8)
	const s = r + ((m > m + n) + (m + n > o))
	st64(s20 + 0x10, s)
	st64(s20 + 0x18, ld64(se0 + 8) + (p > p + q) + (p + q > r) + (r > s))
	st64(s60, ld64(ld64(s108 + 8) - 0xff8))
	st64(s58, 0, 0, 0)
	fn_56670(sa0, s20, s60)
	const u = ld64(sf0 + 8)
	const t = ld64(sf0)
	copyr(s80, s98, 0x18)
	st64(s80 + 0x18, 0)
	st64(s20, t - u, g - l - (u > t), 0, 0)
	fn_57158(s60, s80, s20, 0)
	if ((ld64(s58 + 0x10) | ld64(s58 + 8)) != 0) {
		v = ld64(s108 + 0x10)
		st32(v + 4, 8)
		st32(v, 1)
	} else {
		const w = ld64(s60)
		v = ld64(s108 + 0x10)
		st64(v + 0x10, ld64(s58))
		st64(v + 8, w)
		st32(v, 0)
	}
}

export function fn_59690(): u64 {
	return 1
}

export function fn_596a0(a: u64): u64 {
	return ld32(a)
}

export function fn_596f8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50
	let h, i, l, s: u64
	const g = e != 0 ? 0 : d as u16
	const f = ld32(b)
	if (((f - g) as i32) > (c as i32)) {
		i = fn_87630(s10, 0x17)
		h = ld64(s10)
		st64(a + 8, ld64(s10 + 8))
		st64(a, h)
		return i
	}
	if ((((d as u16) * 0x58 - g + f) as i32) > (c as i32)) {
		st64(s40 + 8, e)
		st64(s50, d as u16, a)
		if ((d as u16) == 0) {
			i = fn_87630(s20, 4)
			l = ld64(s20 + 8)
			const j = ld64(s20)
			if (j != 2) {
				const u = ld64(s50 + 8)
				st64(u + 8, l)
				st64(u, j)
				return i
			}
		} else {
			i = fn_151b50((c - f) as i32, d as u16)
			l = (((((c - f - i * (d as u16)) as i32) as u64) >> 0x1f) + i) as u32
		}
		const k = ld64(s40 + 8)
		let m = l + (k ^ 1)
		if ((m as u32) > 0x57) {
			s = ld64(s50 + 8)
			st64(s, 2)
			st32(s + 8, 0)
			return i
		}
		let o = k != 0 ? 0xffffffffffffffff : 1
		copyr(s40, b + 0x24, 0x10)
		const n = ld64(s50)
		let q = f + m * n
		const p = o
		while (true) {
			const r = o
			i = __lshrti3(s30, ld64(s40), ld64(s40 + 8), m as i32, i)
			if ((ld64(s30) & 1) != 0) {
				const t = ld64(s50 + 8)
				st32(t + 0xc, q)
				st32(t + 8, 1)
				st64(t, 2)
				return i
			}
			q = q + p * n
			o = r
			m = m + r
			if ((m as u32) >= 0x58) {
				s = ld64(s50 + 8)
				st64(s, 2)
				st32(s + 8, 0)
				return i
			}
		}
	}
	i = fn_87630(s10, 0x17)
	h = ld64(s10)
	st64(a + 8, ld64(s10 + 8))
	st64(a, h)
	return i
}

export function fn_59aa0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s30 = fp - 0x30, s60 = fp - 0x60, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8
	let h, i, n, p, r, t, z, aa, ab, ac, ad, ae, af: u64
	if (0xfff27617 > ((c - 0x6c4f5) as u32)) {
		i = fn_87630(sf8, 9)
		h = ld64(sf8)
		st64(a + 0x10, ld64(sf8 + 8))
		st64(a + 8, h)
		st8(a, 1)
		return i
	}
	const f = ld32(b)
	if ((f as i32) > (c as i32)) {
		i = fn_87630(sf8, 9)
		h = ld64(sf8)
		st64(a + 0x10, ld64(sf8 + 8))
		st64(a + 8, h)
		st8(a, 1)
		return i
	}
	const g = ((f as i32) + (d as u16) * 0x58) as i32
	if ((g as i64) > (c as i32)) {
		if ((d as u16) != 0) {
			let al = b
			if (fn_151bf8(c as i32, d as u16) == 0) {
				const j = fn_151b50((c - (f as i32)) as i32, d as u16)
				const k = (((((c - (f as i32) - j * (d as u16)) as i32) as u64) >> 0x1f) + j) as i32
				if (0 > (k as i64)) {
					i = fn_87630(sd8, 9)
					r = undef
					p = undef
					n = undef
					t = ld64(sd8 + 8)
					h = ld64(sd8)
					if (h != 2) {
						st64(a + 0x10, t)
						st64(a + 8, h)
						st8(a, 1)
						return i
					}
				} else {
					__ashlti3(sc8, -1, -1, k & 0x7f, j)
					const m = ld64(al + 0x2c)
					const l = ld64(sc8 + 8)
					n = (m & ~l) >> 1 & 0x5555555555555555
					const o = (m & ~l) - n
					p = o >> 2 & 0x3333333333333333
					const q = (o & 0x3333333333333333) + p
					r = (q + (q >> 4) & 0xf0f0f0f0f0f0f0f) * 0x101010101010101 >> 0x38
					const s = popcount(ld64(al + 0x24) & ~ld64(sc8)) + r
					t = (k as u32) - s + s * 0x71
				}
				const u = t
				if (t > 0xffffffffffffff8e) {
					fn_14c690(t, u + 0x71, 0x100159e28, p, n)
				}
				const v = al
				if (u + 0x71 > 0x26e0) {
					fn_14c5c0(u + 0x71, 0x26e0, 0x100159e28, p, n)
				}
				st64(sb8, v + 0x34 + t, 0x71)
				fn_1030e0(sa8, sb8, r, p, n, f as i32, d as u16)
				let x = ld64(sa8 + 8)
				const w = ld64(sa8)
				if (w == 2) {
					i = fn_13b4d0(se8, x)
					h = ld64(se8)
					st64(a + 0x10, ld64(se8 + 8))
					st64(a + 8, h)
					st8(a, 1)
					return i
				}
				const ai = ld64(sa8 + 0x40)
				let y = ld64(sa8 + 0x38)
				const aj = ld64(sa8 + 0x30)
				const ag = ld64(sa8 + 0x28)
				const ak = ld64(sa8 + 0x20)
				const ah = ld64(sa8 + 0x18)
				al = ld64(sa8 + 0x10)
				memcpy(s30, s60, 0x30)
				if (w != 0) {
					memcpy(sa8, s30, 0x30)
					ab = 1
					af = al
					ae = ak
					ad = aj
					ac = ai
					aa = ah
					z = ag
				} else {
					ab = 0
					st64(sa8, 0, 0, 0, 0, 0, 0)
					x = 0
					af = 0
					aa = 0
					ae = 0
					z = 0
					ad = 0
					y = 0
					ac = 0
				}
				st64(a + 0x32, y)
				st64(a + 0x22, z)
				st64(a + 0x12, aa)
				st64(a + 2, x)
				st8(a + 1, ab)
				st64(a + 0x3a, ac)
				st64(a + 0x2a, ad)
				st64(a + 0x1a, ae)
				st64(a + 0xa, af)
				i = memcpy(a + 0x42, sa8, 0x30)
				st8(a, 0)
				return i
			}
			i = fn_87630(sf8, 9)
			h = ld64(sf8)
			st64(a + 0x10, ld64(sf8 + 8))
			st64(a + 8, h)
			st8(a, 1)
			return i
		}
		fn_14e1c0(0x100159f48, (d as u16) * 0x58, g, d as u16, b)
	}
	i = fn_87630(sf8, 9)
	h = ld64(sf8)
	st64(a + 0x10, ld64(sf8 + 8))
	st64(a + 8, h)
	st8(a, 1)
	return i
}

export function fn_5a1f8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s40 = fp - 0x40, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s150 = fp - 0x150, s158 = fp - 0x158, s160 = fp - 0x160, s168 = fp - 0x168, s170 = fp - 0x170, s178 = fp - 0x178, s180 = fp - 0x180, s188 = fp - 0x188, s190 = fp - 0x190, s198 = fp - 0x198, s1000 = fp - 0x1000
	let h, i, j, k, p, r, t, ak, al, ax, ay, az: u64
	st64(s148, e, a)
	if (0xfff27617 > ((c - 0x6c4f5) as u32)) {
		k = fn_87630(s138, 9)
		j = ld64(s138)
		h = ld64(s148 + 8)
		st64(h + 8, ld64(s138 + 8))
		st64(h, j)
		return k
	}
	const f = ld32(b)
	if ((f as i32) > (c as i32)) {
		k = fn_87630(s138, 9)
		j = ld64(s138)
		h = ld64(s148 + 8)
		st64(h + 8, ld64(s138 + 8))
		st64(h, j)
		return k
	}
	const g = ((f as i32) + (d as u16) * 0x58) as i32
	if ((c as i32) >= (g as i64)) {
		k = fn_87630(s138, 9)
		j = ld64(s138)
		h = ld64(s148 + 8)
		st64(h + 8, ld64(s138 + 8))
		st64(h, j)
		return k
	}
	if ((d as u16) != 0) {
		if (fn_151bf8(c as i32, d as u16) == 0) {
			const l = fn_151b50((c - (f as i32)) as i32, d as u16)
			const m = (((((c - (f as i32) - l * (d as u16)) as i32) as u64) >> 0x1f) + l) as i32
			if (0 > (m as i64)) {
				k = fn_87630(sc8, 9)
				t = undef
				r = undef
				p = undef
				i = ld64(sc8 + 8)
				j = ld64(sc8)
				if (j != 2) {
					h = ld64(s148 + 8)
					st64(h + 8, i)
					st64(h, j)
					return k
				}
			} else {
				__ashlti3(sb8, -1, -1, m & 0x7f, l)
				const o = ld64(b + 0x2c)
				const n = ld64(sb8 + 8)
				p = (o & ~n) >> 1 & 0x5555555555555555
				const q = (o & ~n) - p
				r = q >> 2 & 0x3333333333333333
				const s = (q & 0x3333333333333333) + r
				t = (s + (s >> 4) & 0xf0f0f0f0f0f0f0f) * 0x101010101010101 >> 0x38
				const u = popcount(ld64(b + 0x24) & ~ld64(sb8)) + t
				i = m - u + u * 0x71
			}
			const v = i
			if (i > 0xffffffffffffff8e) {
				fn_14c690(i, v + 0x71, 0x100159e40, r, p)
			}
			st64(s158, v + 0x71)
			if (v + 0x71 > 0x26e0) {
				fn_14c5c0(ld64(s158), 0x26e0, 0x100159e40, r, p)
			}
			st64(s150, b + 0x34)
			const w = b + 0x34 + i
			st64(sa8, w, 0x71)
			const z = fn_1030e0(s88, sa8, t, r, p, b, m)
			const x = ld64(s88)
			if (x == 2) {
				k = fn_13b4d0(s128, ld64(s88 + 8))
				j = ld64(s128)
				h = ld64(s148 + 8)
				st64(h + 8, ld64(s128 + 8))
				st64(h, j)
				return k
			}
			B21: {
				B16: {
					const y = ld8(ld64(s148) + 0x70)
					if (x == 0) {
						if (y == 0) {
							break B16
						}
						__ashlti3(se8, 1, 0, m & 0x7f, fn_d5d0(w, 0x26e0 - i, undef, undef, undef, z))
						st64(b + 0x24, ld64(b + 0x24) | ld64(se8))
						st64(b + 0x2c, ld64(b + 0x2c) | ld64(se8 + 8))
					} else if (y == 0) {
						__ashlti3(sd8, 1, 0, m & 0x7f, fn_d560(w, 0x26e0 - i, undef, undef, undef, z))
						st64(b + 0x24, ld64(b + 0x24) & ~ld64(sd8))
						st64(b + 0x2c, ld64(b + 0x2c) & ~ld64(sd8 + 8))
						break B16
					}
					st64(s1000, 0x26e0, 0x100159e58)
					fn_1d0(sf8, i, ld64(s158), ld64(s150), fp)
					const ab = ld64(sf8 + 8)
					st64(s170, ab)
					st64(s98 + 8, ab)
					const ac = ld64(sf8)
					st64(s150, ac)
					st64(s98, ac)
					const ad = ld64(s148)
					st64(s178, ld64(ad))
					st64(s158, ld64(ad + 8))
					st64(s160, ld64(ad + 0x10))
					const ai = ld64(ad + 0x18)
					st64(s168, ld64(ad + 0x20))
					const ag = ld64(ad + 0x28)
					const af = ld64(ad + 0x30)
					const ae = ld64(ad + 0x38)
					memcpy(s40, ad + 0x40, 0x30)
					st64(s148, 0)
					ak = 1
					st64(s198, ae)
					st64(s88 + 0x40, ae)
					const ah = ld64(s168)
					st64(s190, af)
					st64(s88 + 0x38, af)
					st64(s188, ag)
					st64(s88 + 0x30, ag)
					al = ld64(s170)
					st64(s88 + 0x28, ah)
					st64(s180, ai)
					st64(s88 + 0x20, ai)
					st64(s88 + 0x18, ld64(s160))
					st64(s88 + 0x10, ld64(s158))
					const aj = ld64(s178)
					i = aj
					st64(s88 + 8, aj)
					break B21
				}
				st64(s1000, 0x26e0, 0x100159e58)
				fn_1d0(s108, i, i + 1, ld64(s150), fp)
				st64(s148, 1)
				ak = 0
				al = ld64(s108 + 8)
				const aa = ld64(s108)
				st64(s150, aa)
				st64(s98, aa)
			}
			st64(s88, ak)
			st8(s10, ak)
			const an = al != 0
			const am = ld64(s150)
			k = memcpy(am, s10, an)
			if (al == 0) {
				k = fn_13b4d0(s118, 0x100159450, ax, ay, az)
				j = ld64(s118)
				h = ld64(s148 + 8)
				st64(h + 8, ld64(s118 + 8))
				st64(h, j)
				return k
			}
			if (ld64(s148) != 0) {
				h = ld64(s148 + 8)
				st64(h + 8, i)
				st64(h, 2)
				return k
			}
			const ao = al - an
			st64(s10, i)
			st64(s10 + 8, ld64(s158))
			memcpy(am + an, s10, min(ao, 0x10))
			if (0x10 > ao) {
				k = fn_13b4d0(s118, 0x100159450, ax, ay, az)
				j = ld64(s118)
				h = ld64(s148 + 8)
				st64(h + 8, ld64(s118 + 8))
				st64(h, j)
				return k
			}
			st64(s10, ld64(s160))
			st64(s10 + 8, ld64(s180))
			const aq = am + an + min(ao, 0x10)
			const ap = ao - min(ao, 0x10)
			memcpy(aq, s10, min(ap, 0x10))
			if (0x10 > ap) {
				k = fn_13b4d0(s118, 0x100159450, ax, ay, az)
				j = ld64(s118)
				h = ld64(s148 + 8)
				st64(h + 8, ld64(s118 + 8))
				st64(h, j)
				return k
			}
			st64(s10, ld64(s168))
			st64(s10 + 8, ld64(s188))
			const at = aq + min(ap, 0x10)
			const ar = ap - min(ap, 0x10)
			memcpy(at, s10, min(ar, 0x10))
			if (0x10 > ar) {
				k = fn_13b4d0(s118, 0x100159450, ax, ay, az)
				j = ld64(s118)
				h = ld64(s148 + 8)
				st64(h + 8, ld64(s118 + 8))
				st64(h, j)
				return k
			}
			st64(s10, ld64(s190))
			st64(s10 + 8, ld64(s198))
			const av = at + min(ar, 0x10)
			const au = ar - min(ar, 0x10)
			memcpy(av, s10, min(au, 0x10))
			st64(s98, av + min(au, 0x10), au - min(au, 0x10))
			if (0x10 > au) {
				k = fn_13b4d0(s118, 0x100159450, ax, ay, az)
				j = ld64(s118)
				h = ld64(s148 + 8)
				st64(h + 8, ld64(s118 + 8))
				st64(h, j)
				return k
			}
			k = fn_fbd0(s40, s98)
			const aw = k
			if (k != 0) {
				k = fn_13b4d0(s118, aw, ax, ay, az)
				j = ld64(s118)
				h = ld64(s148 + 8)
				st64(h + 8, ld64(s118 + 8))
				st64(h, j)
				return k
			}
			h = ld64(s148 + 8)
			st64(h + 8, i)
			st64(h, 2)
			return k
		}
		k = fn_87630(s138, 9)
		j = ld64(s138)
		h = ld64(s148 + 8)
		st64(h + 8, ld64(s138 + 8))
		st64(h, j)
		return k
	}
	fn_14e1c0(0x100159f48, (d as u16) * 0x58, g, d as u16, e)
}

export function fn_5ae20(): u64 {
	return 0
}

export function fn_5ae30(a: u64): u64 {
	return ld32(a)
}

export function fn_5ae88(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	let h, i, j: u64
	const g = e != 0 ? 0 : d as u16
	const f = ld32(b)
	if (((f - g) as i32) > (c as i32)) {
		i = fn_87630(s10, 0x17)
		h = ld64(s10)
		st64(a + 8, ld64(s10 + 8))
		st64(a, h)
		return i
	}
	if ((((d as u16) * 0x58 - g + f) as i32) > (c as i32)) {
		if ((d as u16) == 0) {
			i = fn_87630(s20, 4)
			j = ld64(s20 + 8)
			const n = ld64(s20)
			if (n != 2) {
				st64(a + 8, j)
				st64(a, n)
				return i
			}
		} else {
			i = fn_151b50((c - f) as i32, d as u16)
			j = (((((c - f - i * (d as u16)) as i32) as u64) >> 0x1f) + i) as u32
		}
		let k = j + (e ^ 1)
		if (0x58 > (k as u32)) {
			const l = e != 0 ? 0xffffffffffffffff : 1
			let m = f + k * (d as u16)
			while (true) {
				if (ld8(b + 4 + (k as u32) * 0x71) != 0) {
					st32(a + 0xc, m)
					st32(a + 8, 1)
					st64(a, 2)
					return i
				}
				m = m + l * (d as u16)
				k = k + l
				if ((k as u32) >= 0x58) {
					st64(a, 2)
					st32(a + 8, 0)
					return i
				}
			}
		}
		st64(a, 2)
		st32(a + 8, 0)
		return i
	}
	i = fn_87630(s10, 0x17)
	h = ld64(s10)
	st64(a + 8, ld64(s10 + 8))
	st64(a, h)
	return i
}

export function fn_5b1c0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	let h, i: u64
	if (0xfff27617 > ((c - 0x6c4f5) as u32)) {
		i = fn_87630(s20, 9)
		h = ld64(s20)
		st64(a + 0x10, ld64(s20 + 8))
		st64(a + 8, h)
		st8(a, 1)
		return i
	}
	const f = ld32(b)
	if ((f as i32) > (c as i32)) {
		i = fn_87630(s20, 9)
		h = ld64(s20)
		st64(a + 0x10, ld64(s20 + 8))
		st64(a + 8, h)
		st8(a, 1)
		return i
	}
	const g = ((f as i32) + (d as u16) * 0x58) as i32
	if ((g as i64) > (c as i32)) {
		if ((d as u16) != 0) {
			if (fn_151bf8(c as i32, d as u16) == 0) {
				const j = fn_151b50((c - (f as i32)) as i32, d as u16)
				const k = (((((c - (f as i32) - j * (d as u16)) as i32) as u64) >> 0x1f) + j) as i32
				if (0 > (k as i64)) {
					i = fn_87630(s10, 9)
					h = ld64(s10)
					st64(a + 0x10, ld64(s10 + 8))
					st64(a + 8, h)
					st8(a, 1)
					return i
				}
				if (0x58 > k) {
					i = memcpy(a + 1, b + k * 0x71 + 4, 0x71)
					st8(a, 0)
					return i
				}
				fn_1495b0(k, 0x58, 0x100159e70)
			}
			i = fn_87630(s20, 9)
			h = ld64(s20)
			st64(a + 0x10, ld64(s20 + 8))
			st64(a + 8, h)
			st8(a, 1)
			return i
		}
		fn_14e1c0(0x100159f48, (d as u16) * 0x58, g, d as u16, b)
	}
	i = fn_87630(s20, 9)
	h = ld64(s20)
	st64(a + 0x10, ld64(s20 + 8))
	st64(a + 8, h)
	st8(a, 1)
	return i
}

export function fn_5b490(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	let h, i: u64
	if (0xfff27617 > ((c - 0x6c4f5) as u32)) {
		i = fn_87630(s20, 9)
		h = ld64(s20)
		st64(a + 8, ld64(s20 + 8))
		st64(a, h)
		return i
	}
	const f = ld32(b)
	if ((f as i32) > (c as i32)) {
		i = fn_87630(s20, 9)
		h = ld64(s20)
		st64(a + 8, ld64(s20 + 8))
		st64(a, h)
		return i
	}
	const g = ((f as i32) + (d as u16) * 0x58) as i32
	if ((c as i32) >= (g as i64)) {
		i = fn_87630(s20, 9)
		h = ld64(s20)
		st64(a + 8, ld64(s20 + 8))
		st64(a, h)
		return i
	}
	if ((d as u16) != 0) {
		if (fn_151bf8(c as i32, d as u16) == 0) {
			const j = fn_151b50((c - (f as i32)) as i32, d as u16)
			const k = sar(c - (f as i32) - j * (d as u16) << 0x20, 0x3f) + j
			if (0 > (k as i32)) {
				i = fn_87630(s10, 9)
				h = ld64(s10)
				st64(a + 8, ld64(s10 + 8))
				st64(a, h)
				return i
			}
			if ((k as u32) > 0x57) {
				fn_1490e8(0x100159e88, k as i32)
			}
			const l = b + (k as u32) * 0x71
			st8(l + 4, ld8(e + 0x70))
			const m = ld64(e)
			st64(l + 0xd, ld64(e + 8))
			st64(l + 5, m)
			const n = ld64(e + 0x10)
			st64(l + 0x1d, ld64(e + 0x18))
			st64(l + 0x15, n)
			const o = ld64(e + 0x20)
			st64(l + 0x2d, ld64(e + 0x28))
			st64(l + 0x25, o)
			const p = ld64(e + 0x30)
			st64(l + 0x3d, ld64(e + 0x38))
			st64(l + 0x35, p)
			i = memcpy(l + 0x45, e + 0x40, 0x30)
			st64(a + 8, undef)
			st64(a, 2)
			return i
		}
		i = fn_87630(s20, 9)
		h = ld64(s20)
		st64(a + 8, ld64(s20 + 8))
		st64(a, h)
		return i
	}
	fn_14e1c0(0x100159f48, (d as u16) * 0x58, g, d as u16, e)
}

export function fn_5cb68(a: u64, b: u64, c: u64, d: u64): u64 {
	const f = d != 0 ? c as u16 : 0
	const g = ld32(a)
	return (b as i32) >= ((g - f) as i32) & (((c as u16) * 0x58 - f + g) as i32) > (b as i32)
}

export function fn_5cc20(a: u64, b: u64, c: u64, d: u64): u64 {
	const f = d != 0 ? c as u16 : 0
	const g = ld32(a)
	return (b as i32) >= ((g - f) as i32) & (((c as u16) * 0x58 - f + g) as i32) > (b as i32)
}

export function fn_5ccd8(a: u64, b: u64, c: u64, d: u64): u64 {
	const f = d != 0 ? c as u16 : 0
	const g = ld32(a)
	return (b as i32) >= ((g - f) as i32) & (((c as u16) * 0x58 - f + g) as i32) > (b as i32)
}

export function fn_5cd90(a: u64, b: u64, c: u64): u64 {
	const f = ld32(a)
	return (b as i32) >= (f as i32) & ((f + (c as u16) * 0x58) as i32) > (b as i32)
}

export function fn_5ce28(a: u64, b: u64, c: u64): u64 {
	const f = ld32(a)
	return (b as i32) >= (f as i32) & ((f + (c as u16) * 0x58) as i32) > (b as i32)
}

export function fn_5cec0(a: u64, b: u64, c: u64): u64 {
	const f = ld32(a)
	return (b as i32) >= (f as i32) & ((f + (c as u16) * 0x58) as i32) > (b as i32)
}

export function fn_5d000(a: u64, b: u64): u64 {
	return ((ld32(a) + (b as u16) * 0x58) as i32) > 0x6c4f4
}

export function fn_5d050(a: u64, b: u64): u64 {
	return ((ld32(a) + (b as u16) * 0x58) as i32) > 0x6c4f4
}

export function fn_5d0a0(a: u64, b: u64): u64 {
	return ((ld32(a) + (b as u16) * 0x58) as i32) > 0x6c4f4
}

export function fn_5d0f0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10
	let g: u64
	if ((d as u16) != 0) {
		const f = ld32(b)
		g = fn_151b50((c - f) as i32, d as u16)
		st64(a + 8, (((((c - f - g * (d as u16)) as i32) as u64) >> 0x1f) + g) as i32)
		st64(a, 2)
		return g
	}
	g = fn_87630(s10, 4)
	const h = ld64(s10)
	st64(a + 8, ld64(s10 + 8))
	st64(a, h)
	return g
}

export function fn_5d1f0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10
	let g: u64
	if ((d as u16) != 0) {
		const f = ld32(b)
		g = fn_151b50((c - f) as i32, d as u16)
		st64(a + 8, (((((c - f - g * (d as u16)) as i32) as u64) >> 0x1f) + g) as i32)
		st64(a, 2)
		return g
	}
	g = fn_87630(s10, 4)
	const h = ld64(s10)
	st64(a + 8, ld64(s10 + 8))
	st64(a, h)
	return g
}

export function fn_5d2f0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10
	let g: u64
	if ((d as u16) != 0) {
		const f = ld32(b)
		g = fn_151b50((c - f) as i32, d as u16)
		st64(a + 8, (((((c - f - g * (d as u16)) as i32) as u64) >> 0x1f) + g) as i32)
		st64(a, 2)
		return g
	}
	g = fn_87630(s10, 4)
	const h = ld64(s10)
	st64(a + 8, ld64(s10 + 8))
	st64(a, h)
	return g
}

export function fn_5e838(): u64 {
	return 0
}

export function fn_5e848(a: u64): u64 {
	return ld32(a)
}

export function fn_5e858(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_1494c8("internal error: entered unreachable code", 0x28, 0x10015a080, d, e)
}

export function fn_5e888(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	let h: u64
	let g = e != 0 ? 0 : d as u16
	const f = ld32(b)
	if (((f - g) as i32) > (c as i32)) {
		g = fn_87630(s10, 0x17)
		h = ld64(s10)
		st64(a + 8, ld64(s10 + 8))
		st64(a, h)
		return g
	}
	if ((((d as u16) * 0x58 - g + f) as i32) > (c as i32)) {
		if ((d as u16) != 0) {
			st64(a, 2)
			st32(a + 8, 0)
			return g
		}
		g = fn_87630(s20, 4)
		const i = ld64(s20)
		if (i == 2) {
			st64(a, 2)
			st32(a + 8, 0)
			return g
		}
		const j = ld64(s20 + 8)
		st64(a, i, j)
		return g
	}
	g = fn_87630(s10, 0x17)
	h = ld64(s10)
	st64(a + 8, ld64(s10 + 8))
	st64(a, h)
	return g
}

export function fn_5e9f0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	let h, i: u64
	if (0xfff27617 > ((c - 0x6c4f5) as u32)) {
		i = fn_87630(s20, 9)
		h = ld64(s20)
		st64(a + 0x10, ld64(s20 + 8))
		st64(a + 8, h)
		st8(a, 1)
		return i
	}
	const f = ld32(b)
	if ((f as i32) > (c as i32)) {
		i = fn_87630(s20, 9)
		h = ld64(s20)
		st64(a + 0x10, ld64(s20 + 8))
		st64(a + 8, h)
		st8(a, 1)
		return i
	}
	const g = ((f as i32) + (d as u16) * 0x58) as i32
	if ((g as i64) > (c as i32)) {
		if ((d as u16) != 0) {
			if (fn_151bf8(c as i32, d as u16) == 0) {
				const j = fn_151b50((c - (f as i32)) as i32, d as u16)
				if (0 > ((((((c - (f as i32) - j * (d as u16)) as i32) as u64) >> 0x1f) + j) as i32)) {
					i = fn_87630(s10, 9)
					h = ld64(s10)
					st64(a + 0x10, ld64(s10 + 8))
					st64(a + 8, h)
					st8(a, 1)
					return i
				}
				i = memcpy(a + 1, b + 4, 0x71)
				st8(a, 0)
				return i
			}
			i = fn_87630(s20, 9)
			h = ld64(s20)
			st64(a + 0x10, ld64(s20 + 8))
			st64(a + 8, h)
			st8(a, 1)
			return i
		}
		fn_14e1c0(0x100159f48, (d as u16) * 0x58, g, d as u16, b)
	}
	i = fn_87630(s20, 9)
	h = ld64(s20)
	st64(a + 0x10, ld64(s20 + 8))
	st64(a + 8, h)
	st8(a, 1)
	return i
}

export function fn_5ec78(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x10015a098, 1, 8, 0, 0)
	// fmt "ZeroedTickArray must not be updated"
	fn_149478(s30, 0x10015a0a8, c, d, e)
}

export function fn_83340(a: u64, b: u64) {
	let h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, aa, ab, ac, ad, ae, af, ag, ah, ai, aj, ak, al, am: u64
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const f = ld32(b)
	if ((f as i64) > 0x22) {
		if ((f as i64) > 0x33) {
			if ((f as i64) > 0x3c) {
				if ((f as i64) > 0x40) {
					if ((f as i64) > 0x42) {
						if (f == 0x43) {
							ai = 0x23 > g
							aj = ai != 0 ? 0 : g - 0x23
							j = g != 0 ? aj : 0x300007fdd
							if (0x300000007 >= j) {
								raw_vec_handle_error(1, 0x23, 0x300000007, aj, ai)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, j)
							st64(j + 0x18, 0x6975716552736e6f)
							st64(j + 0x10, 0x69736e657478456e)
							st64(j + 8, 0x656b6f5468746957)
							st64(j, 0x6e6f697469736f50)
							st32(j + 0x1f, 0x64657269)
							st64(a + 8, j, 0x23)
							st64(a, 0x23)
						} else if (f == 0x44) {
							o = 0x1d > g
							p = o != 0 ? 0 : g - 0x1d
							j = g != 0 ? p : 0x300007fe3
							if (0x300000007 >= j) {
								raw_vec_handle_error(1, 0x1d, 0x300000007, p, o)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, j)
							st64(j + 0x15, 0x6465676e6168636e)
							st64(j + 0x10, 0x68636e5573746e61)
							st64(j + 8, 0x74736e6f43656546)
							st64(j, 0x6576697470616441)
							st64(a + 8, j, 0x1d)
							st64(a, 0x1d)
						} else {
							ac = 0x18 > g
							ad = ac != 0 ? 0 : g - 0x18
							j = g != 0 ? ad : 0x300007fe8
							if (0x300000007 >= j) {
								raw_vec_handle_error(1, 0x18, 0x300000007, ad, ac)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, j)
							st64(j + 0x10, 0x73646e756f42664f)
							st64(j + 8, 0x74754f6567617070)
							st64(j, 0x696c536563697250)
							st64(a + 8, j, 0x18)
							st64(a, 0x18)
						}
					} else if (f == 0x41) {
						y = 0x14 > g
						z = y != 0 ? 0 : g - 0x14
						j = g != 0 ? z : 0x300007fec
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x14, 0x300000007, z, y)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 8, 0x456e6f6974616c75)
						st64(j, 0x636c6143746e6552)
						st32(j + 0x10, 0x726f7272)
						st64(a + 8, j, 0x14)
						st64(a, 0x14)
					} else {
						q = 0x13 > g
						r = q != 0 ? 0 : g - 0x13
						j = g != 0 ? r : 0x300007fed
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x13, 0x300000007, r, q)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 8, 0x62616e45746f4e73)
						st64(j, 0x4965727574616546)
						st32(j + 0xf, 0x64656c62)
						st64(a + 8, j, 0x13)
						st64(a, 0x13)
					}
				} else if ((f as i64) > 0x3e) {
					if (f == 0x3f) {
						ak = 0x1b > g
						al = ak != 0 ? 0 : g - 0x1b
						j = g != 0 ? al : 0x300007fe5
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x1b, 0x300000007, al, ak)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 0x10, 0x7473656d6954656c)
						st64(j + 8, 0x62616e4565646172)
						st64(j, 0x5464696c61766e49)
						st32(j + 0x17, 0x706d6174)
						st64(a + 8, j, 0x1b)
						st64(a, 0x1b)
					} else {
						m = 0x11 > g
						n = m != 0 ? 0 : g - 0x11
						j = g != 0 ? n : 0x300007fef
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x11, 0x300000007, n, m)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 8, 0x656c62616e45746f)
						st64(j, 0x4e73496564617254)
						st8(j + 0x10, 0x64 /* anchor::InstructionMissing */)
						st64(a + 8, j, 0x11)
						st64(a, 0x11)
					}
				} else if (f == 0x3d) {
					ak = 0x1b > g
					al = ak != 0 ? 0 : g - 0x1b
					j = g != 0 ? al : 0x300007fe5
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x1b, 0x300000007, al, ak)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x10, 0x6174736e6f436565)
					st64(j + 8, 0x4665766974706164)
					st64(j, 0x4164696c61766e49)
					st32(j + 0x17, 0x73746e61)
					st64(a + 8, j, 0x1b)
					st64(a, 0x1b)
				} else {
					q = 0x13 > g
					r = q != 0 ? 0 : g - 0x13
					j = g != 0 ? r : 0x300007fed
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x13, 0x300000007, r, q)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 8, 0x6e49726569546565)
					st64(j, 0x4664696c61766e49)
					st32(j + 0xf, 0x7865646e)
					st64(a + 8, j, 0x13)
					st64(a, 0x13)
				}
			} else if ((f as i64) > 0x37) {
				if ((f as i64) > 0x39) {
					if (f == 0x3a) {
						q = 0x13 > g
						r = q != 0 ? 0 : g - 0x13
						j = g != 0 ? r : 0x300007fed
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x13, 0x300000007, r, q)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 8, 0x616b636f4c746f4e)
						st64(j, 0x6e6f697469736f50)
						st32(j + 0xf, 0x656c6261)
						st64(a + 8, j, 0x13)
						st64(a, 0x13)
					} else if (f == 0x3b) {
						ai = 0x23 > g
						aj = ai != 0 ? 0 : g - 0x23
						j = g != 0 ? aj : 0x300007fdd
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x23, 0x300000007, aj, ai)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 0x18, 0x7469736f5064656b)
						st64(j + 0x10, 0x636f4c6e4f646577)
						st64(j + 8, 0x6f6c6c41746f4e6e)
						st64(j, 0x6f6974617265704f)
						st32(j + 0x1f, 0x6e6f6974)
						st64(a + 8, j, 0x23)
						st64(a, 0x23)
					} else {
						w = 0x17 > g
						x = w != 0 ? 0 : g - 0x17
						j = g != 0 ? x : 0x300007fe9
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x17, 0x300000007, x, w)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 0xf, 0x6465776f6c6c4174)
						st64(j + 8, 0x746f4e65676e6152)
						st64(j, 0x6b636954656d6153)
						st64(a + 8, j, 0x17)
						st64(a, 0x17)
					}
				} else if (f == 0x38) {
					j = g != 0 ? sat_sub(g, 0x22) : 0x300007fde
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x22, 0x300000007, sat_sub(g, 0x22), 0x22 > g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x18, 0x756f636341796172)
					st64(j + 0x10, 0x72416b6369546c6f)
					st64(j + 8, 0x6f706c7269685774)
					st64(j, 0x6e65726566666944)
					st16(j + 0x20, 0x746e)
					st64(a + 8, j, 0x22)
					st64(a, 0x22)
				} else {
					h = 0x10 > g
					i = h != 0 ? 0 : g - 0x10
					j = g != 0 ? i : 0x300007ff0
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x10, 0x300000007, i, h)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 8, 0x726f7272456c6c69)
					st64(j, 0x466c616974726150)
					st64(a + 8, j, 0x10)
					st64(a, 0x10)
				}
			} else if ((f as i64) > 0x35) {
				if (f == 0x36) {
					m = 0x11 > g
					n = m != 0 ? 0 : g - 0x11
					j = g != 0 ? n : 0x300007fef
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x11, 0x300000007, n, m)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 8, 0x6f6f50796c6e4f65)
					st64(j, 0x676e61526c6c7546)
					st8(j + 0x10, 0x6c)
					st64(a + 8, j, 0x11)
					st64(a, 0x11)
				} else {
					o = 0x1d > g
					p = o != 0 ? 0 : g - 0x1d
					j = g != 0 ? p : 0x300007fe3
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x1d, 0x300000007, p, o)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x15, 0x7379617272416b63)
					st64(j + 0x10, 0x416b6369546c6174)
					st64(j + 8, 0x6e656d656c707075)
					st64(j, 0x53796e614d6f6f54)
					st64(a + 8, j, 0x1d)
					st64(a, 0x1d)
				}
			} else if (f == 0x34) {
				ak = 0x1b > g
				al = ak != 0 ? 0 : g - 0x1b
				j = g != 0 ? al : 0x300007fe5
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x1b, 0x300000007, al, ak)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x10, 0x72456e6f6974616c)
				st64(j + 8, 0x75636c6143656546)
				st64(j, 0x726566736e617254)
				st32(j + 0x17, 0x726f7272)
				st64(a + 8, j, 0x1b)
				st64(a, 0x1b)
			} else {
				j = g != 0 ? sat_sub(g, 0x27) : 0x300007fd9
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x27, 0x300000007, sat_sub(g, 0x27), 0x27 > g)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x1f, 0x6570795473746e75)
				st64(j + 0x18, 0x756f636341646574)
				st64(j + 0x10, 0x6163696c70754473)
				st64(j + 8, 0x746e756f63634167)
				st64(j, 0x6e696e69616d6552)
				st64(a + 8, j, 0x27)
				st64(a, 0x27)
			}
		} else if ((f as i64) > 0x2a) {
			if ((f as i64) > 0x2e) {
				if ((f as i64) > 0x30) {
					if (f != 0x31) {
						if (f == 0x32) {
							aa = 0x1e > g
							ab = aa != 0 ? 0 : g - 0x1e
							j = g != 0 ? ab : 0x300007fe2
							if (j > 0x300000007) {
								st64(0x300000000 /* heap bump-allocator cursor */, j)
								st64(j + 0x16, 0x6b6f6f4872656673)
								st64(j + 0x10, 0x66736e617254726f)
								st64(j + 8, 0x4673746e756f6363)
								st64(j, 0x4161727478456f4e)
								st64(a + 8, j, 0x1e)
								st64(a, 0x1e)
								return
							}
							raw_vec_handle_error(1, 0x1e, 0x300000007, ab, aa)
						}
						j = g != 0 ? sat_sub(g, 0x1f) : 0x300007fe1
						if (j > 0x300000007) {
							st64(0x300000000 /* heap bump-allocator cursor */, j)
							st64(j + 0x17, 0x686374616d73694d)
							st64(j + 0x10, 0x4d746e756f6d416e)
							st64(j + 8, 0x656b6f5465746169)
							st64(j, 0x64656d7265746e49)
							st64(a + 8, j, 0x1f)
							st64(a, 0x1f)
							return
						}
						raw_vec_handle_error(1, 0x1f, 0x300000007, sat_sub(g, 0x1f), 0x1f > g)
					}
					o = 0x1d > g
					p = o != 0 ? 0 : g - 0x1d
					j = g != 0 ? p : 0x300007fe3
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x1d, 0x300000007, p, o)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x15, 0x746e656963696666)
					am = 0x69666675736e4973
				} else {
					if (f == 0x2f) {
						y = 0x14 > g
						z = y != 0 ? 0 : g - 0x14
						j = g != 0 ? z : 0x300007fec
						if (j > 0x300000007) {
							st64(0x300000000 /* heap bump-allocator cursor */, j)
							st64(j + 8, 0x6e656b6f54646574)
							st64(j, 0x726f707075736e55)
							st32(j + 0x10, 0x746e694d)
							st64(a + 8, j, 0x14)
							st64(a, 0x14)
							return
						}
						raw_vec_handle_error(1, 0x14, 0x300000007, z, y)
					}
					o = 0x1d > g
					p = o != 0 ? 0 : g - 0x1d
					j = g != 0 ? p : 0x300007fe3
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x1d, 0x300000007, p, o)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x15, 0x6563696c5364696c)
					am = 0x64696c61766e4973
				}
				st64(j + 0x10, am)
				st64(j + 8, 0x746e756f63634167)
				st64(j, 0x6e696e69616d6552)
				st64(a + 8, j, 0x1d)
				st64(a, 0x1d)
			} else if ((f as i64) > 0x2c) {
				if (f == 0x2d) {
					u = 0x1c > g
					v = u != 0 ? 0 : g - 0x1c
					j = g != 0 ? v : 0x300007fe4
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x1c, 0x300000007, v, u)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x10, 0x6c4379646165726c)
					st64(j + 8, 0x416e6f697469736f)
					st64(j, 0x5064656c646e7542)
					st32(j + 0x18, 0x6465736f)
					st64(a + 8, j, 0x1c)
					st64(a, 0x1c)
				} else {
					ae = 0x1a > g
					af = ae != 0 ? 0 : g - 0x1a
					j = g != 0 ? af : 0x300007fe6
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x1a, 0x300000007, af, ae)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x10, 0x626174656c654474)
					st64(j + 8, 0x6f4e656c646e7542)
					st64(j, 0x6e6f697469736f50)
					st16(j + 0x18, 0x656c)
					st64(a + 8, j, 0x1a)
					st64(a, 0x1a)
				}
			} else if (f == 0x2b) {
				ag = 0x12 > g
				ah = ag != 0 ? 0 : g - 0x12
				j = g != 0 ? ah : 0x300007fee
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x12, 0x300000007, ah, ag)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x646e49656c646e75)
				st64(j, 0x4264696c61766e49)
				st16(j + 0x10, 0x7865)
				st64(a + 8, j, 0x12)
				st64(a, 0x12)
			} else {
				u = 0x1c > g
				v = u != 0 ? 0 : g - 0x1c
				j = g != 0 ? v : 0x300007fe4
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x1c, 0x300000007, v, u)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x10, 0x704f79646165726c)
				st64(j + 8, 0x416e6f697469736f)
				st64(j, 0x5064656c646e7542)
				st32(j + 0x18, 0x64656e65)
				st64(a + 8, j, 0x1c)
				st64(a, 0x1c)
			}
		} else if ((f as i64) > 0x26) {
			if ((f as i64) > 0x28) {
				if (f == 0x29) {
					w = 0x17 > g
					x = w != 0 ? 0 : g - 0x17
					j = g != 0 ? x : 0x300007fe9
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x17, 0x300000007, x, w)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0xf, 0x746e694d79726169)
					st64(j + 8, 0x6964656d7265746e)
					st64(j, 0x4964696c61766e49)
					st64(a + 8, j, 0x17)
					st64(a, 0x17)
				} else {
					q = 0x13 > g
					r = q != 0 ? 0 : g - 0x13
					j = g != 0 ? r : 0x300007fed
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x13, 0x300000007, r, q)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 8, 0x50706f486f775465)
					st64(j, 0x746163696c707544)
					st32(j + 0xf, 0x6c6f6f50)
					st64(a + 8, j, 0x13)
					st64(a, 0x13)
				}
			} else if (f == 0x27) {
				ag = 0x12 > g
				ah = ag != 0 ? 0 : g - 0x12
				j = g != 0 ? ah : 0x300007fee
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x12, 0x300000007, ah, ag)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x6c667265764f636c)
				st64(j, 0x6143746e756f6d41)
				st16(j + 0x10, 0x776f)
				st64(a + 8, j, 0x12)
				st64(a, 0x12)
			} else {
				w = 0x17 > g
				x = w != 0 ? 0 : g - 0x17
				j = g != 0 ? x : 0x300007fe9
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x17, 0x300000007, x, w)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0xf, 0x776f6c667265764f)
				st64(j + 8, 0x4f676e696e69616d)
				st64(j, 0x6552746e756f6d41)
				st64(a + 8, j, 0x17)
				st64(a, 0x17)
			}
		} else if ((f as i64) > 0x24) {
			if (f == 0x25) {
				y = 0x14 > g
				z = y != 0 ? 0 : g - 0x14
				j = g != 0 ? z : 0x300007fec
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x14, 0x300000007, z, y)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x78614d65766f6241)
				st64(j, 0x6e49746e756f6d41)
				st32(j + 0x10, 0x6d756d69)
				st64(a + 8, j, 0x14)
				st64(a, 0x14)
			} else {
				o = 0x1d > g
				p = o != 0 ? 0 : g - 0x1d
				j = g != 0 ? p : 0x300007fe3
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x1d, 0x300000007, p, o)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x15, 0x7865646e4964696c)
				st64(j + 0x10, 0x64696c61766e4965)
				st64(j + 8, 0x636e657571655379)
				st64(j, 0x617272416b636954)
				st64(a + 8, j, 0x1d)
				st64(a, 0x1d)
			}
		} else if (f == 0x23) {
			ag = 0x12 > g
			ah = ag != 0 ? 0 : g - 0x12
			j = g != 0 ? ah : 0x300007fee
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x12, 0x300000007, ah, ag)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x756f6d41656c6261)
			st64(j, 0x646172546f72655a)
			st16(j + 0x10, 0x746e)
			st64(a + 8, j, 0x12)
			st64(a, 0x12)
		} else {
			k = 0x15 > g
			l = k != 0 ? 0 : g - 0x15
			j = g != 0 ? l : 0x300007feb
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x15, 0x300000007, l, k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 0xd, 0x6d756d696e694d77)
			st64(j + 8, 0x694d776f6c654274)
			st64(j, 0x754f746e756f6d41)
			st64(a + 8, j, 0x15)
			st64(a, 0x15)
		}
	} else if ((f as i64) > 0x10) {
		if ((f as i64) > 0x19) {
			if ((f as i64) > 0x1d) {
				if ((f as i64) > 0x1f) {
					if (f == 0x20) {
						ag = 0x12 > g
						ah = ag != 0 ? 0 : g - 0x12
						j = g != 0 ? ah : 0x300007fee
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x12, 0x300000007, ah, ag)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 8, 0x706e4964696c6176)
						st64(j, 0x6e497669446c754d)
						st16(j + 0x10, 0x7475)
						st64(a + 8, j, 0x12)
						st64(a, 0x12)
					} else if (f == 0x21) {
						j = g != 0 ? sat_sub(g, 0x16) : 0x300007fea
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x16, 0x300000007, sat_sub(g, 0x16), 0x16 > g)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 0xe, 0x776f6c667265764f)
						st64(j + 8, 0x764f6e6f69746163)
						st64(j, 0x696c7069746c754d)
						st64(a + 8, j, 0x16)
						st64(a, 0x16)
					} else {
						aa = 0x1e > g
						ab = aa != 0 ? 0 : g - 0x1e
						j = g != 0 ? ab : 0x300007fe2
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x1e, 0x300000007, ab, aa)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 0x16, 0x6e6f697463657269)
						st64(j + 0x10, 0x72694474696d694c)
						st64(j + 8, 0x6563697250747271)
						st64(j, 0x5364696c61766e49)
						st64(a + 8, j, 0x1e)
						st64(a, 0x1e)
					}
				} else if (f == 0x1e) {
					j = g != 0 ? sat_sub(g, 0x20) : 0x300007fe0
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x20, 0x300000007, sat_sub(g, 0x20), 0x20 > g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x18, 0x776f6c667265764f)
					st64(j + 0x10, 0x7468676952746669)
					st64(j + 8, 0x68536e6f69746163)
					st64(j, 0x696c7069746c754d)
					st64(a + 8, j, 0x20)
					st64(a, 0x20)
				} else {
					j = g != 0 ? sat_sub(g, 0xe) : 0x300007ff2
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0xe, 0x300000007, sat_sub(g, 0xe), 0xe > g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 6, 0x776f6c667265764f)
					st64(j, 0x764f7669446c754d)
					st64(a + 8, j, 0xe)
					st64(a, 0xe)
				}
			} else if ((f as i64) > 0x1b) {
				if (f == 0x1c) {
					ag = 0x12 > g
					ah = ag != 0 ? 0 : g - 0x12
					j = g != 0 ? ah : 0x300007fee
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x12, 0x300000007, ah, ag)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 8, 0x6465656378457861)
					st64(j, 0x4d65746152656546)
					st16(j + 0x10, 0x6465)
					st64(a + 8, j, 0x12)
					st64(a, 0x12)
				} else {
					ae = 0x1a > g
					af = ae != 0 ? 0 : g - 0x1a
					j = g != 0 ? af : 0x300007fe6
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x1a, 0x300000007, af, ae)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x10, 0x6465656378457861)
					st64(j + 8, 0x4d65746152656546)
					st64(j, 0x6c6f636f746f7250)
					st16(j + 0x18, 0x6465)
					st64(a + 8, j, 0x1a)
					st64(a, 0x1a)
				}
			} else if (f == 0x1a) {
				ag = 0x12 > g
				ah = ag != 0 ? 0 : g - 0x12
				j = g != 0 ? ah : 0x300007fee
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x12, 0x300000007, ah, ag)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x646e496472617765)
				st64(j, 0x5264696c61766e49)
				st16(j + 0x10, 0x7865)
				st64(a + 8, j, 0x12)
				st64(a, 0x12)
			} else {
				o = 0x1d > g
				p = o != 0 ? 0 : g - 0x1d
				j = g != 0 ? p : 0x300007fe3
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x1d, 0x300000007, p, o)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x15, 0x746e656963696666)
				st64(j + 0x10, 0x69666675736e4974)
				st64(j + 8, 0x6e756f6d41746c75)
				st64(j, 0x6156647261776552)
				st64(a + 8, j, 0x1d)
				st64(a, 0x1d)
			}
		} else if ((f as i64) > 0x14) {
			if ((f as i64) > 0x16) {
				if (f == 0x17) {
					ac = 0x18 > g
					ad = ac != 0 ? 0 : g - 0x18
					j = g != 0 ? ad : 0x300007fe8
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x18, 0x300000007, ad, ac)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x10, 0x65636e6575716553)
					st64(j + 8, 0x79617272416b6369)
					st64(j, 0x5464696c61766e49)
					st64(a + 8, j, 0x18)
					st64(a, 0x18)
				} else if (f == 0x18) {
					k = 0x15 > g
					l = k != 0 ? 0 : g - 0x15
					j = g != 0 ? l : 0x300007feb
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x15, 0x300000007, l, k)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0xd, 0x726564724f746e69)
					st64(j + 8, 0x746e694d6e656b6f)
					st64(j, 0x5464696c61766e49)
					st64(a + 8, j, 0x15)
					st64(a, 0x15)
				} else {
					y = 0x14 > g
					z = y != 0 ? 0 : g - 0x14
					j = g != 0 ? z : 0x300007fec
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x14, 0x300000007, z, y)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 8, 0x6c616974696e4974)
					st64(j, 0x6f4e647261776552)
					st32(j + 0x10, 0x64657a69)
					st64(a + 8, j, 0x14)
					st64(a, 0x14)
				}
			} else if (f == 0x15) {
				ae = 0x1a > g
				af = ae != 0 ? 0 : g - 0x1a
				j = g != 0 ? af : 0x300007fe6
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x1a, 0x300000007, af, ae)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x10, 0x69737265766e6f43)
				st64(j + 8, 0x706d617473656d69)
				st64(j, 0x5464696c61766e49)
				st16(j + 0x18, 0x6e6f)
				st64(a + 8, j, 0x1a)
				st64(a, 0x1a)
			} else {
				h = 0x10 > g
				i = h != 0 ? 0 : g - 0x10
				j = g != 0 ? i : 0x300007ff0
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x10, 0x300000007, i, h)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x706d617473656d69)
				st64(j, 0x5464696c61766e49)
				st64(a + 8, j, 0x10)
				st64(a, 0x10)
			}
		} else if ((f as i64) > 0x12) {
			if (f == 0x13) {
				ac = 0x18 > g
				ad = ac != 0 ? 0 : g - 0x18
				j = g != 0 ? ad : 0x300007fe8
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x18, 0x300000007, ad, ac)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x10, 0x65746167656c6544)
				st64(j + 8, 0x64696c61766e4972)
				st64(j, 0x4f676e697373694d)
				st64(a + 8, j, 0x18)
				st64(a, 0x18)
			} else {
				ae = 0x1a > g
				af = ae != 0 ? 0 : g - 0x1a
				j = g != 0 ? af : 0x300007fe6
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x1a, 0x300000007, af, ae)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x10, 0x756f6d416e656b6f)
				st64(j + 8, 0x546e6f697469736f)
				st64(j, 0x5064696c61766e49)
				st16(j + 0x18, 0x746e)
				st64(a + 8, j, 0x1a)
				st64(a, 0x1a)
			}
		} else if (f == 0x11) {
			h = 0x10 > g
			i = h != 0 ? 0 : g - 0x10
			j = g != 0 ? i : 0x300007ff0
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x10, 0x300000007, i, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x6465646565637845)
			st64(j, 0x78614d6e656b6f54)
			st64(a + 8, j, 0x10)
			st64(a, 0x10)
		} else {
			m = 0x11 > g
			n = m != 0 ? 0 : g - 0x11
			j = g != 0 ? n : 0x300007fef
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x11, 0x300000007, n, m)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x6564656563627553)
			st64(j, 0x6e694d6e656b6f54)
			st8(j + 0x10, 0x64 /* anchor::InstructionMissing */)
			st64(a + 8, j, 0x11)
			st64(a, 0x11)
		}
	} else if ((f as i64) > 7) {
		if ((f as i64) > 0xb) {
			if ((f as i64) > 0xd) {
				if (f == 0xe) {
					m = 0x11 > g
					n = m != 0 ? 0 : g - 0x11
					j = g != 0 ? n : 0x300007fef
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x11, 0x300000007, n, m)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 8, 0x6f6c667265764f79)
					st64(j, 0x746964697571694c)
					st8(j + 0x10, 0x77)
					st64(a + 8, j, 0x11)
					st64(a, 0x11)
				} else if (f == 0xf) {
					ag = 0x12 > g
					ah = ag != 0 ? 0 : g - 0x12
					j = g != 0 ? ah : 0x300007fee
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x12, 0x300000007, ah, ag)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 8, 0x6c667265646e5579)
					st64(j, 0x746964697571694c)
					st16(j + 0x10, 0x776f)
					st64(a + 8, j, 0x12)
					st64(a, 0x12)
				} else {
					m = 0x11 > g
					n = m != 0 ? 0 : g - 0x11
					j = g != 0 ? n : 0x300007fef
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x11, 0x300000007, n, m)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 8, 0x6f72724574654e79)
					st64(j, 0x746964697571694c)
					st8(j + 0x10, 0x72)
					st64(a + 8, j, 0x11)
					st64(a, 0x11)
				}
			} else if (f == 0xc) {
				j = g != 0 ? sat_sub(g, 0xd) : 0x300007ff3
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0xd, 0x300000007, sat_sub(g, 0xd), 0xd > g)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 5, 0x6f72655a79746964)
				st64(j, 0x746964697571694c)
				st64(a + 8, j, 0xd)
				st64(a, 0xd)
			} else {
				h = 0x10 > g
				i = h != 0 ? 0 : g - 0x10
				j = g != 0 ? i : 0x300007ff0
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x10, 0x300000007, i, h)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x686769486f6f5479)
				st64(j, 0x746964697571694c)
				st64(a + 8, j, 0x10)
				st64(a, 0x10)
			}
		} else if ((f as i64) > 9) {
			if (f == 0xa) {
				h = 0x10 > g
				i = h != 0 ? 0 : g - 0x10
				j = g != 0 ? i : 0x300007ff0
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x10, 0x300000007, i, h)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x7865646e496b6369)
				st64(j, 0x5464696c61766e49)
				st64(a + 8, j, 0x10)
				st64(a, 0x10)
			} else {
				y = 0x14 > g
				z = y != 0 ? 0 : g - 0x14
				j = g != 0 ? z : 0x300007fec
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x14, 0x300000007, z, y)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x6f42664f74754f65)
				st64(j, 0x6369725074727153)
				st32(j + 0x10, 0x73646e75)
				st64(a + 8, j, 0x14)
				st64(a, 0x14)
			}
		} else if (f == 8) {
			q = 0x13 > g
			r = q != 0 ? 0 : g - 0x13
			j = g != 0 ? r : 0x300007fed
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x13, 0x300000007, r, q)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x7245747361436e77)
			st64(j, 0x6f447265626d754e)
			st32(j + 0xf, 0x726f7272)
			st64(a + 8, j, 0x13)
			st64(a, 0x13)
		} else {
			s = 0xc > g
			t = s != 0 ? 0 : g - 0xc
			j = g != 0 ? t : 0x300007ff4
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0xc, 0x300000007, t, s)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j, 0x46746f4e6b636954)
			st32(j + 8, 0x646e756f)
			st64(a + 8, j, 0xc)
			st64(a, 0xc)
		}
	} else if ((f as i64) > 3) {
		if ((f as i64) > 5) {
			if (f == 6) {
				s = 0xc > g
				t = s != 0 ? 0 : g - 0xc
				j = g != 0 ? t : 0x300007ff4
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0xc, 0x300000007, t, s)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j, 0x7942656469766944)
				st32(j + 8, 0x6f72655a)
				st64(a + 8, j, 0xc)
				st64(a, 0xc)
			} else {
				j = g != 0 ? sat_sub(g, 0xf) : 0x300007ff1
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0xf, 0x300000007, sat_sub(g, 0xf), 0xf > g)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 7, 0x726f727245747361)
				st64(j, 0x61437265626d754e)
				st64(a + 8, j, 0xf)
				st64(a, 0xf)
			}
		} else if (f == 4) {
			ag = 0x12 > g
			ah = ag != 0 ? 0 : g - 0x12
			j = g != 0 ? ah : 0x300007fee
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x12, 0x300000007, ah, ag)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x69636170536b6369)
			st64(j, 0x5464696c61766e49)
			st16(j + 0x10, 0x676e)
			st64(a + 8, j, 0x12)
			st64(a, 0x12)
		} else {
			k = 0x15 > g
			l = k != 0 ? 0 : g - 0x15
			j = g != 0 ? l : 0x300007feb
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x15, 0x300000007, l, k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 0xd, 0x7974706d45746f4e)
			st64(j + 8, 0x746f4e6e6f697469)
			st64(j, 0x736f5065736f6c43)
			st64(a + 8, j, 0x15)
			st64(a, 0x15)
		}
	} else if ((f as i64) > 1) {
		if (f == 2) {
			y = 0x14 > g
			z = y != 0 ? 0 : g - 0x14
			j = g != 0 ? z : 0x300007fec
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x14, 0x300000007, z, y)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x6e49747369784579)
			st64(j, 0x617272416b636954)
			st32(j + 0x10, 0x6c6f6f50)
			st64(a + 8, j, 0x14)
			st64(a, 0x14)
		} else {
			j = g != 0 ? sat_sub(g, 0x19) : 0x300007fe7
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x19, 0x300000007, sat_sub(g, 0x19), 0x19 > g)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 0x10, 0x646e756f42666f74)
			st64(j + 8, 0x754f7865646e4979)
			st64(j, 0x617272416b636954)
			st8(j + 0x18, 0x73)
			st64(a + 8, j, 0x19)
			st64(a, 0x19)
		}
	} else if (f == 0) {
		j = g != 0 ? sat_sub(g, 0xb) : 0x300007ff5
		if (0x300000007 >= j) {
			raw_vec_handle_error(1, 0xb, 0x300000007, sat_sub(g, 0xb), 0xb > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st64(j, 0x4564696c61766e49)
		st32(j + 7, 0x6d756e45)
		st64(a + 8, j, 0xb)
		st64(a, 0xb)
	} else {
		h = 0x10 > g
		i = h != 0 ? 0 : g - 0x10
		j = g != 0 ? i : 0x300007ff0
		if (0x300000007 >= j) {
			raw_vec_handle_error(1, 0x10, 0x300000007, i, h)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st64(j + 8, 0x6b63695474726174)
		st64(j, 0x5364696c61766e49)
		st64(a + 8, j, 0x10)
		st64(a, 0x10)
	}
}

export function fn_87828(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s30 = fp - 0x30
	const f = ld32(a)
	st64(s30, (f as i64) > 0x22 ? (f as i64) > 0x33 ? (f as i64) > 0x3c ? (f as i64) > 0x40 ? (f as i64) > 0x42 ? f != 0x43 ? f != 0x44 ? 0x10015a778 : 0x10015a768 : 0x10015a758 : f != 0x41 ? 0x10015a748 : 0x10015a738 : (f as i64) > 0x3e ? f != 0x3f ? 0x10015a728 : 0x10015a718 : f != 0x3d ? 0x10015a708 : 0x10015a6f8 : (f as i64) > 0x37 ? (f as i64) > 0x39 ? f != 0x3a ? f != 0x3b ? 0x10015a6e8 : 0x10015a6d8 : 0x10015a6c8 : f != 0x38 ? 0x10015a6b8 : 0x10015a6a8 : (f as i64) > 0x35 ? f != 0x36 ? 0x10015a698 : 0x10015a688 : f != 0x34 ? 0x10015a678 : 0x10015a668 : (f as i64) > 0x2a ? (f as i64) > 0x2e ? (f as i64) > 0x30 ? f != 0x31 ? f != 0x32 ? 0x10015a658 : 0x10015a648 : 0x10015a638 : f != 0x2f ? 0x10015a628 : 0x10015a618 : (f as i64) > 0x2c ? f != 0x2d ? 0x10015a608 : 0x10015a5f8 : f != 0x2b ? 0x10015a5e8 : 0x10015a5d8 : (f as i64) > 0x26 ? (f as i64) > 0x28 ? f != 0x29 ? 0x10015a5c8 : 0x10015a5b8 : f != 0x27 ? 0x10015a5a8 : 0x10015a598 : (f as i64) > 0x24 ? f != 0x25 ? 0x10015a588 : 0x10015a578 : f != 0x23 ? 0x10015a568 : 0x10015a558 : (f as i64) > 0x10 ? (f as i64) > 0x19 ? (f as i64) > 0x1d ? (f as i64) > 0x1f ? f != 0x20 ? f != 0x21 ? 0x10015a548 : 0x10015a538 : 0x10015a528 : f != 0x1e ? 0x10015a518 : 0x10015a508 : (f as i64) > 0x1b ? f != 0x1c ? 0x10015a4f8 : 0x10015a4e8 : f != 0x1a ? 0x10015a4d8 : 0x10015a4c8 : (f as i64) > 0x14 ? (f as i64) > 0x16 ? f != 0x17 ? f != 0x18 ? 0x10015a4b8 : 0x10015a4a8 : 0x10015a498 : f != 0x15 ? 0x10015a488 : 0x10015a478 : (f as i64) > 0x12 ? f != 0x13 ? 0x10015a468 : 0x10015a458 : f != 0x11 ? 0x10015a448 : 0x10015a438 : (f as i64) > 7 ? (f as i64) > 0xb ? (f as i64) > 0xd ? f != 0xe ? f != 0xf ? 0x10015a428 : 0x10015a418 : 0x10015a408 : f != 0xc ? 0x10015a3f8 : 0x10015a3e8 : (f as i64) > 9 ? f != 0xa ? 0x10015a3d8 : 0x10015a3c8 : f != 8 ? 0x10015a3b8 : 0x10015a3a8 : (f as i64) > 3 ? (f as i64) > 5 ? f != 6 ? 0x10015a398 : 0x10015a388 : f != 4 ? 0x10015a378 : 0x10015a368 : (f as i64) > 1 ? f != 2 ? 0x10015a358 : 0x10015a348 : f != 0 ? 0x10015a338 : 0x10015a328, 1, 8, 0, 0)
	const g = ld64(b + 0x28)
	return fn_bb78(ld64(b + 0x20), g, s30, g, e)
}

export function fn_88140(a: u64, b: u64): u64 {
	const f = ld32(a)
	if ((f as i64) > 0x22) {
		if ((f as i64) > 0x33) {
			if ((f as i64) > 0x3c) {
				if ((f as i64) > 0x40) {
					if ((f as i64) > 0x42) {
						if (f == 0x43) {
							return Formatter_write_str(b, "PositionWithTokenExtensionsRequired", 0x23)
						}
						if (f == 0x44) {
							return Formatter_write_str(b, "AdaptiveFeeConstantsUnchanged", 0x1d)
						}
						return Formatter_write_str(b, "PriceSlippageOutOfBounds", 0x18)
					}
					return Formatter_write_str(b, f != 0x41 ? 0x100153d4f : 0x100153d3b, f != 0x41 ? 0x13 : 0x14)
				}
				if ((f as i64) > 0x3e) {
					return Formatter_write_str(b, f != 0x3f ? 0x100153d2a : 0x100153d0f, f != 0x3f ? 0x11 : 0x1b)
				}
				return Formatter_write_str(b, f != 0x3d ? 0x100153cfc : 0x100153ce1, f != 0x3d ? 0x13 : 0x1b)
			}
			if ((f as i64) > 0x37) {
				if ((f as i64) > 0x39) {
					if (f == 0x3a) {
						return Formatter_write_str(b, "PositionNotLockable", 0x13)
					}
					return Formatter_write_str(b, f != 0x3b ? 0x100153cca : 0x100153ca7, f != 0x3b ? 0x17 : 0x23)
				}
				return Formatter_write_str(b, f != 0x38 ? 0x1001530a0 : 0x100153c72, f != 0x38 ? 0x10 : 0x22)
			}
			if ((f as i64) > 0x35) {
				if (f == 0x36) {
					return Formatter_write_str(b, "FullRangeOnlyPool", 0x11)
				}
				return Formatter_write_str(b, "TooManySupplementalTickArrays", 0x1d)
			}
			return Formatter_write_str(b, f != 0x34 ? 0x100153c1d : 0x100153c02, f != 0x34 ? 0x27 : 0x1b)
		}
		if ((f as i64) > 0x2a) {
			if ((f as i64) > 0x2e) {
				if ((f as i64) > 0x30) {
					if (f == 0x31) {
						return Formatter_write_str(b, "RemainingAccountsInsufficient", 0x1d)
					}
					return Formatter_write_str(b, f != 0x32 ? 0x100153be3 : 0x100153bc5, f != 0x32 ? 0x1f : 0x1e)
				}
				if (f == 0x2f) {
					return Formatter_write_str(b, "UnsupportedTokenMint", 0x14)
				}
				return Formatter_write_str(b, "RemainingAccountsInvalidSlice", 0x1d)
			}
			if ((f as i64) > 0x2c) {
				return Formatter_write_str(b, f != 0x2d ? 0x100153b5d : 0x100153b41, f != 0x2d ? 0x1a : 0x1c)
			}
			return Formatter_write_str(b, f != 0x2b ? 0x100153b25 : 0x100153b13, f != 0x2b ? 0x1c : 0x12)
		}
		if ((f as i64) > 0x26) {
			if ((f as i64) > 0x28) {
				return Formatter_write_str(b, f != 0x29 ? 0x100153b00 : 0x100153ae9, f != 0x29 ? 0x13 : 0x17)
			}
			return Formatter_write_str(b, f != 0x27 ? 0x100153ad2 : 0x100153ac0, f != 0x27 ? 0x17 : 0x12)
		}
		if ((f as i64) > 0x24) {
			if (f == 0x25) {
				return Formatter_write_str(b, "AmountInAboveMaximum", 0x14)
			}
			return Formatter_write_str(b, "TickArraySequenceInvalidIndex", 0x1d)
		}
		return Formatter_write_str(b, f != 0x23 ? 0x100153a7a : 0x100153a68, f != 0x23 ? 0x15 : 0x12)
	}
	if ((f as i64) > 0x10) {
		if ((f as i64) > 0x19) {
			if ((f as i64) > 0x1d) {
				if ((f as i64) > 0x1f) {
					if (f == 0x20) {
						return Formatter_write_str(b, "MulDivInvalidInput", 0x12)
					}
					return Formatter_write_str(b, f != 0x21 ? 0x100153a4a : 0x100153a34, f != 0x21 ? 0x1e : 0x16)
				}
				return Formatter_write_str(b, f != 0x1e ? 0x100153a14 : 0x100152160, f != 0x1e ? 0xe : 0x20)
			}
			if ((f as i64) > 0x1b) {
				return Formatter_write_str(b, f != 0x1c ? 0x1001539fa : 0x1001539e8, f != 0x1c ? 0x1a : 0x12)
			}
			if (f == 0x1a) {
				return Formatter_write_str(b, "InvalidRewardIndex", 0x12)
			}
			return Formatter_write_str(b, "RewardVaultAmountInsufficient", 0x1d)
		}
		if ((f as i64) > 0x14) {
			if ((f as i64) > 0x16) {
				if (f == 0x17) {
					return Formatter_write_str(b, "InvalidTickArraySequence", 0x18)
				}
				return Formatter_write_str(b, f != 0x18 ? 0x1001539a5 : 0x100153990, f != 0x18 ? 0x14 : 0x15)
			}
			return Formatter_write_str(b, f != 0x15 ? 0x1001531b0 : 0x10015395e, f != 0x15 ? 0x10 : 0x1a)
		}
		if ((f as i64) > 0x12) {
			return Formatter_write_str(b, f != 0x13 ? 0x100153944 : 0x10015392c, f != 0x13 ? 0x1a : 0x18)
		}
		return Formatter_write_str(b, f != 0x11 ? 0x10015391b : 0x100153010, f != 0x11 ? 0x11 : 0x10)
	}
	if ((f as i64) > 7) {
		if ((f as i64) > 0xb) {
			if ((f as i64) > 0xd) {
				if (f == 0xe) {
					return Formatter_write_str(b, "LiquidityOverflow", 0x11)
				}
				return Formatter_write_str(b, f != 0xf ? 0x10015390a : 0x1001538f8, f != 0xf ? 0x11 : 0x12)
			}
			return Formatter_write_str(b, f != 0xc ? 0x100153070 : 0x1001538da, f != 0xc ? 0x10 : 0xd)
		}
		if ((f as i64) > 9) {
			return Formatter_write_str(b, f != 0xa ? 0x1001538c6 : 0x1001530c0, f != 0xa ? 0x14 : 0x10)
		}
		return Formatter_write_str(b, f != 8 ? 0x1001538ba : 0x1001538a7, f != 8 ? 0xc : 0x13)
	}
	if ((f as i64) > 3) {
		if ((f as i64) > 5) {
			return Formatter_write_str(b, f != 6 ? 0x100153898 : 0x10015388c, f != 6 ? 0xf : 0xc)
		}
		return Formatter_write_str(b, f != 4 ? 0x100153877 : 0x100153865, f != 4 ? 0x15 : 0x12)
	}
	if ((f as i64) > 1) {
		return Formatter_write_str(b, f != 2 ? 0x10015384c : 0x100153838, f != 2 ? 0x19 : 0x14)
	}
	return Formatter_write_str(b, f != 0 ? 0x100153150 : 0x10015382d, f != 0 ? 0x10 : 0xb)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: AdaptiveFeeTier
export function fn_101b58(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20, s40 = fp - 0x40, s58 = fp - 0x58, s70 = fp - 0x70, sf0 = fp - 0xf0, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140
	let f: u64
	if (8 > ld64(b + 8)) {
		anchor_error_from(s140, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		f = ld64(s140)
		st64(a + 0x10, ld64(s140 + 8))
		st64(a + 8, f)
		st32(a, 1)
	} else if (ld64(ld64(b)) == 0x2e95922f74901093 /* account:AdaptiveFeeTier */) {
		fn_101e30(a, b, 0x2e95922f74901093 /* account:AdaptiveFeeTier */, d, e)
	} else {
		ErrorCode_name(s70, 0x100152d5c, 0x2e95922f74901093 /* account:AdaptiveFeeTier */, d, e)
		st64(s58, 0, 1, 0)
		st64(s20, s58, 0x100159480)
		st8(s20 + 0x18, 3)
		st64(s20 + 0x10, 0x20)
		st64(s40 + 0x10, 0)
		st64(s40, 0)
		if (ErrorCode_fmt(0x100152d5c, s40) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s110, 0x1001594b0, 0x1001594d0)
		}
		copy(sf0, s70, 0x30)
		st64(s110 + 8, 0x1001552d6)
		st32(sf0 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
		st8(sf0 + 0x30, 2)
		st32(s110 + 0x18, 8)
		st64(s110 + 0x10, 0x31)
		st64(s110, 0)
		fn_13b3a8(s120, s110)
		Error_with_account_name(s130, ld64(s120), ld64(s120 + 8), "AdaptiveFeeTier", 0xf)
		f = ld64(s130)
		st64(a + 0x10, ld64(s130 + 8))
		st64(a + 8, f)
		st32(a, 1)
	}
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: WhirlpoolsConfig
export function fn_102378(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20, s40 = fp - 0x40, s58 = fp - 0x58, s70 = fp - 0x70, sf0 = fp - 0xf0, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140
	let f: u64
	if (8 > ld64(b + 8)) {
		anchor_error_from(s140, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		f = ld64(s140)
		st64(a + 0x10, ld64(s140 + 8))
		st64(a + 8, f)
		st16(a, 1)
	} else if (ld64(ld64(b)) == 0xfec157d9e031149d /* account:WhirlpoolsConfig */) {
		fn_102650(a, b, 0xfec157d9e031149d /* account:WhirlpoolsConfig */, d, e)
	} else {
		ErrorCode_name(s70, 0x100152d5c, 0xfec157d9e031149d /* account:WhirlpoolsConfig */, d, e)
		st64(s58, 0, 1, 0)
		st64(s20, s58, 0x100159480)
		st8(s20 + 0x18, 3)
		st64(s20 + 0x10, 0x20)
		st64(s40 + 0x10, 0)
		st64(s40, 0)
		if (ErrorCode_fmt(0x100152d5c, s40) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s110, 0x1001594b0, 0x1001594d0)
		}
		copy(sf0, s70, 0x30)
		st64(s110 + 8, 0x100155316)
		st32(sf0 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
		st8(sf0 + 0x30, 2)
		st32(s110 + 0x18, 0xe)
		st64(s110 + 0x10, 0x26)
		st64(s110, 0)
		fn_13b3a8(s120, s110)
		Error_with_account_name(s130, ld64(s120), ld64(s120 + 8), "WhirlpoolsConfig", 0x10)
		f = ld64(s130)
		st64(a + 0x10, ld64(s130 + 8))
		st64(a + 8, f)
		st16(a, 1)
	}
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: WhirlpoolsConfigExtension
export function fn_102aa8(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20, s40 = fp - 0x40, s58 = fp - 0x58, s70 = fp - 0x70, sf0 = fp - 0xf0, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140
	let f: u64
	if (8 > ld64(b + 8)) {
		anchor_error_from(s140, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		f = ld64(s140)
		st64(a + 0x10, ld64(s140 + 8))
		st64(a + 8, f)
		st8(a, 1)
	} else if (ld64(ld64(b)) == 0x3a991af0a3d76302 /* account:WhirlpoolsConfigExtension */) {
		fn_102d80(a, b, 0x3a991af0a3d76302 /* account:WhirlpoolsConfigExtension */, d, e)
	} else {
		ErrorCode_name(s70, 0x100152d5c, 0x3a991af0a3d76302 /* account:WhirlpoolsConfigExtension */, d, e)
		st64(s58, 0, 1, 0)
		st64(s20, s58, 0x100159480)
		st8(s20 + 0x18, 3)
		st64(s20 + 0x10, 0x20)
		st64(s40 + 0x10, 0)
		st64(s40, 0)
		if (ErrorCode_fmt(0x100152d5c, s40) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s110, 0x1001594b0, 0x1001594d0)
		}
		copy(sf0, s70, 0x30)
		st64(s110 + 8, 0x10015533c)
		st32(sf0 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
		st8(sf0 + 0x30, 2)
		st32(s110 + 0x18, 3)
		st64(s110 + 0x10, 0x30)
		st64(s110, 0)
		fn_13b3a8(s120, s110)
		Error_with_account_name(s130, ld64(s120), ld64(s120 + 8), "WhirlpoolsConfigExtension", 0x19)
		f = ld64(s130)
		st64(a + 0x10, ld64(s130 + 8))
		st64(a + 8, f)
		st8(a, 1)
	}
}

export function fn_1030e0(a: u64, b: u64, c: u64, d: u64, e: u64, r7: u64, r9: u64): u64 {
	const s10 = fp - 0x10, s40 = fp - 0x40, s58 = fp - 0x58, s59 = fp - 0x59, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s80 = fp - 0x80, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sa0 = fp - 0xa0, sa8 = fp - 0xa8
	let g: u64
	let s = ld64(sa8)
	let t = ld64(sa0)
	let u = ld64(s98)
	let v = ld64(s90)
	let w = ld64(s88)
	let x = ld64(s80)
	let y = ld64(s78)
	let z = ld64(s70)
	let aa = ld64(s68)
	const f = ld64(b + 8)
	if (f == 0) {
		g = fn_1459d0(0x100159468)
		st64(a + 8, g)
		st64(a, 2)
		return g
	}
	g = ld64(b)
	let i = ld8(g)
	st64(b + 8, f - 1)
	let h = g + 1
	st64(b, h)
	st8(s59, i)
	if (i != 0) {
		if (i != 1) {
			st64(s40, 0x100159668)
			st64(s40 + 0x10, s10)
			st64(s10, s59, num_fmt_bae8)
			st64(s40 + 0x20, 0)
			st64(s40 + 8, 1)
			st64(s40 + 0x18, 1)
			// fmt "Unexpected variant index: {}" {} = i [num_fmt_bae8]
			fn_147e78(s58, s40, h, d, e)
			g = fn_b580(s58)
			st64(a + 8, g)
			st64(a, 2)
			return g
		}
		if (0x11 > f) {
			g = fn_1459d0(0x100159468)
			st64(a + 8, g)
			st64(a, 2)
			return g
		}
		const l = ld64(g + 9)
		const n = ld64(g + 1)
		st64(b, g + 0x11, f - 0x11)
		if (0x10 > f - 0x11) {
			g = fn_1459d0(0x100159468)
			st64(a + 8, g)
			st64(a, 2)
			return g
		}
		aa = ld64(g + 0x19)
		const j = ld64(g + 0x11)
		st64(b, g + 0x21, f - 0x21)
		if (0x10 > f - 0x21) {
			g = fn_1459d0(0x100159468)
			st64(a + 8, g)
			st64(a, 2)
			return g
		}
		const k = ld64(g + 0x29)
		z = ld64(g + 0x21)
		st64(b, g + 0x31, f - 0x31)
		if (0x10 > f - 0x31) {
			g = fn_1459d0(0x100159468)
			st64(a + 8, g)
			st64(a, 2)
			return g
		}
		const m = ld64(g + 0x39)
		const r = ld64(g + 0x31)
		st64(b, g + 0x41, f - 0x41)
		if (0x10 > f - 0x41) {
			g = fn_1459d0(0x100159468)
			st64(a + 8, g)
			st64(a, 2)
			return g
		}
		const p = ld64(g + 0x49)
		const q = ld64(g + 0x41)
		st64(b, g + 0x51, f - 0x51)
		if (0x10 > f - 0x51) {
			g = fn_1459d0(0x100159468)
			st64(a + 8, g)
			st64(a, 2)
			return g
		}
		y = ld64(g + 0x59)
		const o = ld64(g + 0x51)
		st64(b, g + 0x61, f - 0x61)
		if (0x10 > f - 0x61) {
			g = fn_1459d0(0x100159468)
			st64(a + 8, g)
			st64(a, 2)
			return g
		}
		v = j
		x = k
		u = ld64(g + 0x69)
		w = l
		t = ld64(g + 0x61)
		st64(b + 8, f - 0x71)
		g = g + 0x71
		st64(b, g)
		i = 1
		s = m
		e = n
		d = r
		h = q
		r7 = p
		r9 = o
	}
	st64(a + 0x68, t)
	st64(a + 0x58, r9)
	st64(a + 0x38, d)
	st64(a + 0x28, z)
	st64(a + 0x18, v)
	st64(a + 0x50, r7)
	st64(a + 0x48, h)
	st64(a + 0x10, w)
	st64(a + 8, e)
	st64(a, i)
	st64(a + 0x70, u)
	st64(a + 0x60, y)
	st64(a + 0x40, s)
	st64(a + 0x30, x)
	st64(a + 0x20, aa)
	return g
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: FeeTier
export function fn_1035a0(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20, s40 = fp - 0x40, s58 = fp - 0x58, s70 = fp - 0x70, sf0 = fp - 0xf0, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140
	let f: u64
	if (8 > ld64(b + 8)) {
		anchor_error_from(s140, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		f = ld64(s140)
		st64(a + 0x10, ld64(s140 + 8))
		st64(a + 8, f)
		st16(a, 1)
	} else if (ld64(ld64(b)) == 0x69be448e4c9f4b38 /* account:FeeTier */) {
		fn_103878(a, b, 0x69be448e4c9f4b38 /* account:FeeTier */, d, e)
	} else {
		ErrorCode_name(s70, 0x100152d5c, 0x69be448e4c9f4b38 /* account:FeeTier */, d, e)
		st64(s58, 0, 1, 0)
		st64(s20, s58, 0x100159480)
		st8(s20 + 0x18, 3)
		st64(s20 + 0x10, 0x20)
		st64(s40 + 0x10, 0)
		st64(s40, 0)
		if (ErrorCode_fmt(0x100152d5c, s40) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s110, 0x1001594b0, 0x1001594d0)
		}
		copy(sf0, s70, 0x30)
		st64(s110 + 8, 0x100155385)
		st32(sf0 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
		st8(sf0 + 0x30, 2)
		st32(s110 + 0x18, 5)
		st64(s110 + 0x10, 0x28)
		st64(s110, 0)
		fn_13b3a8(s120, s110)
		Error_with_account_name(s130, ld64(s120), ld64(s120 + 8), 0x1001553ad /* "FeeTier" */, 7)
		f = ld64(s130)
		st64(a + 0x10, ld64(s130 + 8))
		st64(a + 8, f)
		st16(a, 1)
	}
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: LockConfig
export function fn_103ac0(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20, s40 = fp - 0x40, s58 = fp - 0x58, s70 = fp - 0x70, sf0 = fp - 0xf0, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140
	let f: u64
	if (8 > ld64(b + 8)) {
		anchor_error_from(s140, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		f = ld64(s140)
		st64(a + 0x10, ld64(s140 + 8))
		st64(a + 8, f)
		st64(a, 1)
	} else if (ld64(ld64(b)) == 0xc0a00c7c9fee2f6a /* account:LockConfig */) {
		fn_103d98(a, b, 0xc0a00c7c9fee2f6a /* account:LockConfig */, d, e)
	} else {
		ErrorCode_name(s70, 0x100152d5c, 0xc0a00c7c9fee2f6a /* account:LockConfig */, d, e)
		st64(s58, 0, 1, 0)
		st64(s20, s58, 0x100159480)
		st8(s20 + 0x18, 3)
		st64(s20 + 0x10, 0x20)
		st64(s40 + 0x10, 0)
		st64(s40, 0)
		if (ErrorCode_fmt(0x100152d5c, s40) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s110, 0x1001594b0, 0x1001594d0)
		}
		copy(sf0, s70, 0x30)
		st64(s110 + 8, 0x1001553b4)
		st32(sf0 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
		st8(sf0 + 0x30, 2)
		st32(s110 + 0x18, 3)
		st64(s110 + 0x10, 0x2b)
		st64(s110, 0)
		fn_13b3a8(s120, s110)
		Error_with_account_name(s130, ld64(s120), ld64(s120 + 8), "LockConfig", 0xa)
		f = ld64(s130)
		st64(a + 0x10, ld64(s130 + 8))
		st64(a + 8, f)
		st64(a, 1)
	}
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: Position
export function fn_1042c0(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20, s40 = fp - 0x40, s58 = fp - 0x58, s70 = fp - 0x70, sf0 = fp - 0xf0, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140
	let f: u64
	if (8 > ld64(b + 8)) {
		anchor_error_from(s140, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		f = ld64(s140)
		st64(a + 0x10, ld64(s140 + 8))
		st64(a + 8, f)
		st64(a, 1)
	} else if (ld64(ld64(b)) == 0xd0f7407ae48fbcaa /* account:Position */) {
		fn_104598(a, b, 0xd0f7407ae48fbcaa /* account:Position */, d, e)
	} else {
		ErrorCode_name(s70, 0x100152d5c, 0xd0f7407ae48fbcaa /* account:Position */, d, e)
		st64(s58, 0, 1, 0)
		st64(s20, s58, 0x100159480)
		st8(s20 + 0x18, 3)
		st64(s20 + 0x10, 0x20)
		st64(s40 + 0x10, 0)
		st64(s40, 0)
		if (ErrorCode_fmt(0x100152d5c, s40) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s110, 0x1001594b0, 0x1001594d0)
		}
		copy(sf0, s70, 0x30)
		st64(s110 + 8, 0x1001534be)
		st32(sf0 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
		st8(sf0 + 0x30, 2)
		st32(s110 + 0x18, 0x12)
		st64(s110 + 0x10, 0x28)
		st64(s110, 0)
		fn_13b3a8(s120, s110)
		Error_with_account_name(s130, ld64(s120), ld64(s120 + 8), "Position", 8)
		f = ld64(s130)
		st64(a + 0x10, ld64(s130 + 8))
		st64(a + 8, f)
		st64(a, 1)
	}
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: PositionBundle
export function fn_104c10(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20, s40 = fp - 0x40, s58 = fp - 0x58, s70 = fp - 0x70, sf0 = fp - 0xf0, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140
	let f: u64
	if (8 > ld64(b + 8)) {
		anchor_error_from(s140, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		f = ld64(s140)
		st64(a + 0x10, ld64(s140 + 8))
		st64(a + 8, f)
		st8(a, 1)
	} else if (ld64(ld64(b)) == 0x64205fb941afa981 /* account:PositionBundle */) {
		fn_104ee8(a, b, 0x64205fb941afa981 /* account:PositionBundle */, d, e)
	} else {
		ErrorCode_name(s70, 0x100152d5c, 0x64205fb941afa981 /* account:PositionBundle */, d, e)
		st64(s58, 0, 1, 0)
		st64(s20, s58, 0x100159480)
		st8(s20 + 0x18, 3)
		st64(s20 + 0x10, 0x20)
		st64(s40 + 0x10, 0)
		st64(s40, 0)
		if (ErrorCode_fmt(0x100152d5c, s40) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s110, 0x1001594b0, 0x1001594d0)
		}
		copy(sf0, s70, 0x30)
		st64(s110 + 8, 0x1001534e6)
		st32(sf0 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
		st8(sf0 + 0x30, 2)
		st32(s110 + 0x18, 7)
		st64(s110 + 0x10, 0x2f)
		st64(s110, 0)
		fn_13b3a8(s120, s110)
		Error_with_account_name(s130, ld64(s120), ld64(s120 + 8), 0x1001553e9 /* "PositionBundle" */, 0xe)
		f = ld64(s130)
		st64(a + 0x10, ld64(s130 + 8))
		st64(a + 8, f)
		st8(a, 1)
	}
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: Whirlpool
export function fn_105800(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20, s40 = fp - 0x40, s58 = fp - 0x58, s70 = fp - 0x70, sf0 = fp - 0xf0, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140
	let f: u64
	if (8 > ld64(b + 8)) {
		anchor_error_from(s140, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		f = ld64(s140)
		st64(a + 0x10, ld64(s140 + 8))
		st64(a + 8, f)
		st64(a, 1)
	} else if (ld64(ld64(b)) == 0x96380e10cd1953f /* account:Whirlpool */) {
		fn_105ad8(a, b, 0x96380e10cd1953f /* account:Whirlpool */, d, e)
	} else {
		ErrorCode_name(s70, 0x100152d5c, 0x96380e10cd1953f /* account:Whirlpool */, d, e)
		st64(s58, 0, 1, 0)
		st64(s20, s58, 0x100159480)
		st8(s20 + 0x18, 3)
		st64(s20 + 0x10, 0x20)
		st64(s40 + 0x10, 0)
		st64(s40, 0)
		if (ErrorCode_fmt(0x100152d5c, s40) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s110, 0x1001594b0, 0x1001594d0)
		}
		copy(sf0, s70, 0x30)
		st64(s110 + 8, 0x100153563)
		st32(sf0 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
		st8(sf0 + 0x30, 2)
		st32(s110 + 0x18, 0xd)
		st64(s110 + 0x10, 0x29)
		st64(s110, 0)
		fn_13b3a8(s120, s110)
		Error_with_account_name(s130, ld64(s120), ld64(s120 + 8), 0x10015542c /* "Whirlpool" */, 9)
		f = ld64(s130)
		st64(a + 0x10, ld64(s130 + 8))
		st64(a + 8, f)
		st64(a, 1)
	}
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: IdlAccount
export function fn_11f4c8(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20, s40 = fp - 0x40, s58 = fp - 0x58, s70 = fp - 0x70, sf0 = fp - 0xf0, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140
	let f: u64
	if (8 > ld64(b + 8)) {
		anchor_error_from(s140, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		f = ld64(s140)
		st64(a + 0x10, ld64(s140 + 8))
		st64(a + 8, f)
		st32(a, 1)
	} else if (ld64(ld64(b)) == 0x9e7b903abf624618) {
		fn_11f7a0(a, b, 0x9e7b903abf624618, d, e)
	} else {
		ErrorCode_name(s70, 0x100152d5c, 0x9e7b903abf624618, d, e)
		st64(s58, 0, 1, 0)
		st64(s20, s58, 0x100159480)
		st8(s20 + 0x18, 3)
		st64(s20 + 0x10, 0x20)
		st64(s40 + 0x10, 0)
		st64(s40, 0)
		if (ErrorCode_fmt(0x100152d5c, s40) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s110, 0x1001594b0, 0x1001594d0)
		}
		copy(sf0, s70, 0x30)
		st64(s110 + 8, 0x100155435)
		st32(sf0 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
		st8(sf0 + 0x30, 2)
		st32(s110 + 0x18, 0x27)
		st64(s110 + 0x10, 0x1d)
		st64(s110, 0)
		fn_13b3a8(s120, s110)
		Error_with_account_name(s130, ld64(s120), ld64(s120 + 8), "IdlAccount", 0xa)
		f = ld64(s130)
		st64(a + 0x10, ld64(s130 + 8))
		st64(a + 8, f)
		st32(a, 1)
	}
}

export function fn_11f980(): never {
	__rg_oom()
}

export function fn_1274a8(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s26 = fp - 0x26, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s90 = fp - 0x90, sb8 = fp - 0xb8, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0
	let i: u64
	B4: {
		i = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
		if (ld64(b + 8) == 0x52) {
			Mint_unpack_from_slice_136290(s58, ld64(b), 0x52, d, e)
			const f = ld32(s58)
			if (f != 2) {
				copy(s68, s48, 0x10)
				copy(s90, s38, 0x10)
				st8(s90 + 0x10, ld8(s38 + 0x10))
				copy(sb8, s26, 0x20)
				st64(sb8 + 0x1e, ld64(s26 + 0x1e))
				const o = ld64(s58 + 8)
				const p = ld32(s58 + 4)
				const k = ld8(s38 + 0x11)
				copy(s78, s68, 0x10)
				if (k != 0) {
					copyr(se0, s78, 0x10)
					copy(sd0, s90, 0x10)
					st8(sd0 + 0x10, ld8(s90 + 0x10))
					st64(a + 0x50, ld64(sb8 + 0x1e))
					st64(a + 0x4a, ld64(sb8 + 0x18))
					st64(a + 0x42, ld64(sb8 + 0x10))
					st64(a + 0x3a, ld64(sb8 + 8))
					st64(a + 0x32, ld64(sb8))
					copyr(s58, se0, 0x10)
					const l = ld8(sd0 + 0x10)
					st8(s38, l)
					const m = ld64(sd0 + 8)
					st64(s48 + 8, m)
					const n = ld64(sd0)
					st64(s48, n)
					copyr(sb8, se0, 0x10)
					st8(a + 0x30, l)
					st64(a + 0x28, m)
					st64(a + 0x20, n)
					st64(a + 0x18, ld64(sb8 + 8))
					st64(a + 0x10, ld64(sb8))
					st8(a + 0x31, k)
					st64(a + 8, o)
					st32(a + 4, p)
					st32(a, f)
					return
				}
				i = 0x8000000000000009 /* Err(ProgramError::UninitializedAccount) */
				break B4
			}
			i = ld64(s58 + 8)
		}
		copy(se0, s48, 0x10)
	}
	const g = ld64(se0 + 8)
	st64(sb8 + 8, g)
	const h = ld64(se0)
	st64(sb8, h)
	st64(s58, i, h, g)
	fn_13b430(sf0, s58)
	const j = ld64(sf0)
	st64(a + 0x10, ld64(sf0 + 8))
	st64(a + 8, j)
	st32(a, 2)
}

export function fn_12abb0(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const f = ld64(a)
	if (2 > (f & 3) - 2) {
		return r0
	}
	if ((f & 3) == 0) {
		return r0
	}
	const g = ld64(f + 7)
	const h = ld64(g)
	const i = callx(h, ld64(f - 1), h, c, d, e)
	if (ld64(g + 8) == 0) {
		return fn_83078(i)
	}
	void ld64(g + 0x10)
	return fn_83078(fn_83078(i))
}

export function fn_12b450(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	if (ld64(a) != 0x8000000000000000) {
		let g = ld64(b + 0x10)
		if (ld64(b) == g) {
			fn_12adb8(b, g, 1, d, e)
			e = undef
			g = ld64(b + 0x10)
		}
		let h = ld64(b + 8)
		st8(h + g, 1)
		let i = g + 1
		st64(b + 0x10, i)
		const j = ld64(a + 0x10)
		if (j > 0xffffffff) {
			return 0x1400000003
		}
		let l = ld64(a + 8)
		if (3 >= ld64(b) - i) {
			fn_12adb8(b, i, 4, h, e)
			e = undef
			h = ld64(b + 8)
			i = ld64(b + 0x10)
		}
		st32(h + i, j)
		let k = i + 4
		st64(b + 0x10, k)
		if (j == 0) {
			return 0
		}
		let r = j * 0x22
		while (true) {
			let n = ld64(b)
			if (0x1f >= n - k) {
				fn_12adb8(b, k, 0x20, h, e)
				h = ld64(b + 8)
				n = ld64(b)
				k = ld64(b + 0x10)
			}
			e = h + k
			st64(e + 0x18, ld64(l + 0x19))
			st64(e + 0x10, ld64(l + 0x11))
			st64(e + 8, ld64(l + 9))
			st64(e, ld64(l + 1))
			let m = k + 0x20
			st64(b + 0x10, m)
			const o = ld8(l)
			if (n == m) {
				fn_12adb8(b, n, 1, h, e)
				e = undef
				n = ld64(b)
				h = ld64(b + 8)
				m = ld64(b + 0x10)
			}
			st8(h + m, o)
			let p = m + 1
			st64(b + 0x10, p)
			if (n == p) {
				fn_12adb8(b, n, 1, h, e)
				e = undef
				h = ld64(b + 8)
				p = ld64(b + 0x10)
			}
			const q = ld8(l + 0x21)
			l = l + 0x22
			st8(h + p, q)
			k = p + 1
			st64(b + 0x10, k)
			r = r - 0x22
			if (r == 0) {
				return 0
			}
		}
	}
	let f = ld64(b + 0x10)
	if (ld64(b) != f) {
		st8(ld64(b + 8) + f, 0)
		st64(b + 0x10, f + 1)
		return 0
	}
	fn_12adb8(b, f, 1, d, e)
	f = ld64(b + 0x10)
	st8(ld64(b + 8) + f, 0)
	st64(b + 0x10, f + 1)
	return 0
}

export function fn_12b800(a: u64, b: u64, c: u64, d: u64, e: u64) {
	let i, j: u64
	if (ld8(a + 0x10) != 3) {
		let h = ld64(b + 0x10)
		const g = ld64(b)
		if (g != h) {
			i = ld64(b + 8) + h
			st8(i, 1)
			j = h + 1
			st64(b + 0x10, j)
			Uses_serialize(a, b, j, i, e)
		} else {
			fn_12adb8(b, h, 1, g, e)
			h = ld64(b + 0x10)
			i = ld64(b + 8) + h
			st8(i, 1)
			j = h + 1
			st64(b + 0x10, j)
			Uses_serialize(a, b, j, i)
		}
	} else {
		let f = ld64(b + 0x10)
		if (ld64(b) != f) {
			st8(ld64(b + 8) + f, 0)
			st64(b + 0x10, f + 1)
		} else {
			fn_12adb8(b, f, 1, d, e)
			f = ld64(b + 0x10)
			st8(ld64(b + 8) + f, 0)
			st64(b + 0x10, f + 1)
		}
	}
}

export function fn_12b928(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const f = ld8(a)
	if (f != 2) {
		let h = ld64(b)
		let i = ld64(b + 0x10)
		if (h == i) {
			fn_12adb8(b, i, 1, h, e)
			h = ld64(b)
			i = ld64(b + 0x10)
		}
		let j = ld64(b + 8)
		st8(j + i, 1)
		let k = i + 1
		st64(b + 0x10, k)
		if (h == k) {
			fn_12adb8(b, h, 1, h, j)
			j = ld64(b + 8)
			h = ld64(b)
			k = ld64(b + 0x10)
		}
		st8(j + k, f)
		let l = k + 1
		st64(b + 0x10, l)
		const m = h - l
		if (0x1f >= m) {
			fn_12adb8(b, l, 0x20, m, j)
			j = ld64(b + 8)
			l = ld64(b + 0x10)
		}
		const n = j + l
		st64(n + 0x18, ld64(a + 0x19))
		st64(n + 0x10, ld64(a + 0x11))
		st64(n + 8, ld64(a + 9))
		st64(n, ld64(a + 1))
		st64(b + 0x10, l + 0x20)
	} else {
		let g = ld64(b + 0x10)
		if (ld64(b) != g) {
			st8(ld64(b + 8) + g, 0)
			st64(b + 0x10, g + 1)
		} else {
			fn_12adb8(b, g, 1, d, e)
			g = ld64(b + 0x10)
			st8(ld64(b + 8) + g, 0)
			st64(b + 0x10, g + 1)
		}
	}
}

export function fn_136d18(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const f = ld64(a)
	if (2 > (f & 3) - 2) {
		return r0
	}
	if ((f & 3) == 0) {
		return r0
	}
	const g = ld64(f + 7)
	const h = ld64(g)
	const i = callx(h, ld64(f - 1), h, c, d, e)
	if (ld64(g + 8) == 0) {
		return fn_83078(i)
	}
	void ld64(g + 0x10)
	return fn_83078(fn_83078(i))
}

export function fn_139088(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s1000 = fp - 0x1000
	st64(s1000, e, 0)
	fn_138b88(a, b, c, d, fp)
}

export function fn_1396a0(a: u64, b: u64): u64 {
	return str_fmt(ld64(a), ld64(a + 8), b)
}

export function fn_1396f8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fn_14a698(a, 0x10015abf0, b, d, e)
}

export function fn_139720(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fn_14a698(a, b, c, d, e)
}

export function fn_139760() {
}

export function fn_139768() {
}

export function fn_139ac8(a: u64) {
	st64(a, 0)
}

export function fn_139ad8() {
}

export function fn_13a320(a: u64, b: u64): u64 {
	return str_fmt(ld64(a + 8), ld64(a + 0x10), b)
}

export function fn_13f4b8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s50 = fp - 0x50
	let h = d
	let f = a
	let r = 1
	const w = ld64(e - 0xff8)
	const v = ld64(e - 0x1000)
	const g = ld64(b + 0x10)
	let x = 1
	if (g != 0) {
		const u = h
		let i = g * 0x22
		if (g > 0x3c3c3c3c3c3c3c3) {
			raw_vec_handle_error(0, i, f, d, e)
		}
		let k = ld64(b + 8)
		const j = __rust_alloc(i, 1)
		f = undef
		d = undef
		e = undef
		if (j == 0) {
			raw_vec_handle_error(1, i, f, d, e)
		}
		x = j
		let l = j + 0x21
		let p = g
		while (true) {
			if (i != 0) {
				const o = ld64(k)
				d = ld64(k + 8)
				e = ld64(k + 0x10)
				const n = ld64(k + 0x18)
				const m = ld8(k + 0x21)
				st8(l - 1, ld8(k + 0x20))
				st8(l, m)
				st64(l - 9, n)
				st64(l - 0x11, e)
				st64(l - 0x19, d)
				st64(l - 0x21, o)
				l = l + 0x22
				i = i - 0x22
				k = k + 0x22
				p = p - 1
				if (p != 0) {
					continue
				}
			}
			f = a
			h = u
			r = 1
			break
		}
	}
	const s = ld64(b + 0x20)
	const q = ld64(b + 0x28)
	if (q != 0) {
		if (0 > (q as i64)) {
			raw_vec_handle_error(0, q, f, d, e)
		}
		r = __rust_alloc(q, 1)
		f = undef
		d = undef
		e = undef
		if (r == 0) {
			raw_vec_handle_error(1, q, f, d, e)
		}
	}
	memcpy(r, s, q)
	st64(s50, x, g, g, r, q, q)
	copy(s20, b + 0x30, 0x20)
	// CPI: program *(b + 0x30) (id not a constant, and not compared with a known program id in this function), data r[..q]
	let t = sol_invoke_signed_rust(s50, c, h, v, w)
	if (t != 0) {
		t = fn_144198(a, t, t)
	} else {
		st64(a, 0x800000000000001a /* Ok */)
	}
	if (ld64(s50 + 8) != 0) {
		t = fn_83078(t)
	}
	if (ld64(s50 + 0x20) == 0) {
		return t
	}
	return fn_83078(t)
}

export function fn_142088(a: u64, b: u64): u64 {
	return fn_146390(ld64(a), b)
}

export function fn_142108() {
}

export function fn_1430f0(a: u64): u64 {
	return rent_check_id_144790(a)
}

export function fn_143718(a: u64, b: u64): u64 {
	return fn_14e4d8(ld64(a), b)
}

export function fn_1449d0() {
}

export function fn_1449d8() {
}

export function fn_144d40(a: u64): u64 {
	return sol_log_pubkey(a)
}

export function fn_145980(a: u64) {
	st64(a, 0)
}

export function fn_145990() {
}

export function fn_145d58(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fn_14bb30(ld64(a), ld64(a + 8), b, d, e)
}

export function fn_145d80(a: u64, b: u64): u64 {
	return str_fmt(ld64(a), ld64(a + 8), b)
}

export function fn_145e10() {
}

export function fn_145e18() {
}

export function fn_145e20() {
}

export function fn_145e58(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fn_14bb30(ld64(a + 8), ld64(a + 0x10), b, d, e)
}

export function fn_145e80(a: u64, b: u64): u64 {
	return str_fmt(ld64(a + 8), ld64(a + 0x10), b)
}

export function fn_146390(a: u64, b: u64): u64 {
	return fn_146a58(a, b)
}

export function fn_147230(): never {
	abort_()
}

export function log(a: u64, b: u64) {
	sol_log(a, b)
}

export function abort_(): never {
	abort()
}

export function fn_147900(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fn_14a698(a, 0x10015b800, b, d, e)
}

export function fn_147928() {
}

export function fn_147990(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x10015b830, 1, 8, 0, 0)
	// fmt "capacity overflow"
	fn_149478(s30, 0x10015b840, c, d, e)
}

export function fn_147e00(a: u64, b: u64) {
	st64(a + 8, ld64(b + 0x10))
	st64(a, ld64(b + 8))
}

export function fn_147e28(a: u64, b: u64): u64 {
	return str_fmt(ld64(a + 8), ld64(a + 0x10), b)
}

export function fn_147e50(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fn_14bb30(ld64(a + 8), ld64(a + 0x10), b, d, e)
}

export function fn_148360(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	let i: u64
	const h = ld64(b + 8)
	const f = ld64(b + 0x10)
	if (f == 0) {
		i = memcpy(1, h, f)
		st64(a + 8, 1, f)
		st64(a, f)
		return i
	}
	if (0 > (f as i64)) {
		raw_vec_handle_error(0, f, c, d, e)
	}
	const g = __rust_alloc(f, 1)
	c = undef
	d = undef
	e = undef
	if (g == 0) {
		raw_vec_handle_error(1, f, c, d, e)
	}
	i = memcpy(g, h, f)
	st64(a + 8, g, f)
	st64(a, f)
	return i
}

export function fn_1484d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	fn_1480b8(a, b, c, d, e)
	return 0
}

export function fn_1484f0() {
}

export function fn_1484f8() {
}

export function fn_14a670(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fn_14a698(a, 0x10015b940, b, d, e)
}

export function fn_14db38(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	let n, w: u64
	B11: {
		w = p7
		n = p6
		if (c != 0) {
			const x = b + (c << 1)
			let f = p5
			const h = (a & 0xff00) >> 8
			let j = 0
			const u = d
			const v = f
			L4: while (true) {
				let k = ld8(b + 1)
				const i = j + k
				const g = ld8(b)
				b = b + 2
				if (g == h) {
					if (j > i) {
						fn_14c690(j, i, 0x10015bb08, d, i)
					}
					if (i > f) {
						fn_14c5c0(i, v, 0x10015bb08, d, i)
					}
					let l = d + j
					while (true) {
						if (k == 0) {
							j = i
							d = u
							f = v
							if (b == x) {
								break B11
							}
							continue L4
						}
						k = k - 1
						const m = ld8(l)
						l = l + 1
						if (m == (a as u8)) {
							return 0
						}
					}
				}
				if (g > h) {
					break
				}
				j = i
				if (b == x) {
					break
				}
			}
		}
	}
	let t = 1
	if (w == 0) {
		return 1
	}
	const o = n
	let s = a as u16
	while (true) {
		const p = n
		let q = ld8(n)
		const r = q as i8
		if (0 > (r as i64)) {
			if (p + 1 == o + w) {
				fn_1490e8(0x10015baf0, o + w, q, p + 1, r)
			}
			q = ((q & 0x7f) << 8) | ld8(n + 1)
			n = n + 2
		} else {
			n = p + 1
		}
		s = (s - q) as i32
		if (0 > (s as i64)) {
			return t & 1
		}
		t = t ^ 1
		if (n == o + w) {
			return t & 1
		}
	}
}

export function fn_14f038(a: u64, b: u64): u64 {
	return fn_14ecd0(ld32(a), 1, b)
}

export function fn_14f0e8(a: u64): u64 {
	let g: u64
	let j = 0
	let i = 0x21
	let h = 0x21
	while (true) {
		let f = (i >> 1) + j
		const k = ld32((f << 2) + 0x100158f54) << 0x2b >> 0x20
		const l = a << 0x2b >> 0x20
		if (k == l) {
			g = f + 1
		} else {
			g = l > k ? f + 1 : j
			f = k > l ? f : h
			h = f
			i = f - g
			j = g
			if (f > g) {
				continue
			}
		}
		if (g > 0x20) {
			fn_1495b0(g, 0x21, 0x10015bb20, a << 0xb, h)
		}
		const m = (g << 2) + 0x100158f54
		let o = 0x2d7
		const n = ld32(m)
		if (g != 0x20 && m != -4) {
			o = ld32(m + 4) >> 0x15
		}
		let q = 0
		if (g != 0) {
			q = ld32((g << 2) + 0x100158f50) & 0x1fffff
		}
		const p = o + ~(n >> 0x15)
		if (p == 0) {
			return n >> 0x15 & 1
		}
		const r = a - q
		const u = (n >> 0x15) + 0x100158fd8
		let s = 0
		let v = 0
		while (true) {
			const t = (n >> 0x15) + s
			if (t > 0x2d6) {
				fn_1495b0(t, 0x2d7, 0x10015bb38, s, u)
			}
			v = v + ld8(u + s)
			if ((v as u32) > (r as u32)) {
				return (n >> 0x15) + s & 1
			}
			s = s + 1
			if (s >= p) {
				return (n >> 0x15) + s & 1
			}
		}
	}
}
