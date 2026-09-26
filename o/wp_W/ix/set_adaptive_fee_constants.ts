/// <reference path="../lib.d.ts" />
// instruction set_adaptive_fee_constants
import { fn_147e78, fn_14c5c0, fn_258, memcpy } from '../shared.ts'

// instruction handler: set_adaptive_fee_constants (discriminator sha256("global:set_adaptive_fee_constants")[..8] = 0x27490cedbdd49e85)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, whirlpools_config, oracle, fee_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: oracle
export function ix_set_adaptive_fee_constants(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s10 = fp - 0x10, s11 = fp - 0x11, s310 = fp - 0x310, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s620 = fp - 0x620, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s668 = fp - 0x668, s678 = fp - 0x678, s688 = fp - 0x688, s6a8 = fp - 0x6a8, s6b8 = fp - 0x6b8, s6c8 = fp - 0x6c8, s6d8 = fp - 0x6d8, s6e0 = fp - 0x6e0, s6f8 = fp - 0x6f8, s1000 = fp - 0x1000
	let i, l, aa, ad, ae, af, ah, ai: u64
	B34: {
		B32: {
			let am = ld64(s6f8)
			let ap = ld64(s6e0)
			let aq = ld64(s6d8)
			let at = ld64(s6c8)
			let av = ld64(s6b8)
			let ax = ld64(s6a8)
			sol_log("Instruction: SetAdaptiveFeeConstants", 0x24)
			const f = ix_args
			st64(s648, f)
			let g = ix_args_len
			if (g != 0) {
				B33: {
					let k = 0
					let h = g - 1
					i = ld8(f)
					st64(s648 + 8, h)
					l = f + 1
					st8(s11, i)
					if (i != 0) {
						if (i != 1) {
							break B33
						}
						if (3 > g) {
							break B32
						}
						k = 1
						ax = ld16(f + 1)
						const j = g - 3
						st64(s648, f + 3, j)
						l = f + 3
						h = j
					}
					if (h == 0) {
						break B32
					}
					const az = k
					let o = 0
					let p = h - 1
					g = l + 1
					i = ld8(l)
					st8(s11, i)
					if (i != 0) {
						if (i != 1) {
							break B33
						}
						if (3 > h) {
							break B32
						}
						o = 1
						av = ld16(l + 1)
						const m = h - 3
						st64(s648 + 8, m)
						const n = l + 3
						st64(s648, n)
						g = n
						p = m
					}
					const ay = o
					if (p == 0) {
						break B32
					}
					let s = 0
					let t = p - 1
					l = g + 1
					i = ld8(g)
					st8(s11, i)
					if (i != 0) {
						if (i != 1) {
							break B33
						}
						if (3 > p) {
							break B32
						}
						s = 1
						at = ld16(g + 1)
						const q = p - 3
						st64(s648 + 8, q)
						const r = g + 3
						st64(s648, r)
						l = r
						t = q
					}
					const aw = s
					if (t == 0) {
						break B32
					}
					let x = 0
					let w = t - 1
					g = l + 1
					i = ld8(l)
					st8(s11, i)
					if (i != 0) {
						if (i != 1) {
							break B33
						}
						if (5 > t) {
							break B32
						}
						x = 1
						aq = ld32(l + 1)
						const u = t - 5
						st64(s648 + 8, u)
						const v = l + 5
						st64(s648, v)
						g = v
						w = u
					}
					if (w == 0) {
						break B32
					}
					const ar = x
					let au = 0
					l = w - 1
					let y = g + 1
					i = ld8(g)
					st8(s11, i)
					if (i != 0) {
						if (i != 1) {
							break B33
						}
						if (5 > w) {
							break B32
						}
						au = 1
						ap = ld32(g + 1)
						y = g + 5
						l = w - 5
					}
					i = ar
					if (l == 0) {
						break B32
					}
					const z = ld8(y)
					st64(s648 + 8, l - 1)
					g = y + 1
					st64(s648, g)
					let ak = 0
					st8(s11, z)
					if (z != 0) {
						if (z != 1) {
							break B33
						}
						if (3 > l) {
							break B32
						}
						am = ld16(y + 1)
						st64(s648, y + 3, l - 3)
						ak = 1
					}
					fn_10f70(s328, s648)
					if (ld16(s328) == 0) {
						const ao = ld16(s328 + 4)
						const an = ld16(s328 + 2)
						st64(s10, accounts, accounts_len)
						ai = accounts_set_adaptive_fee_constants(s328, undef, s10, ae, fp)
						let ag = ld64(s318)
						ah = ld64(s328 + 8)
						const aj = ld64(s328)
						if (aj == 0) {
							st64(a + 8, ag)
							st64(a, ah)
							return ai
						}
						memcpy(s620, s310, 0x2f8)
						st64(s638, aj, ah, ag)
						copyr(s318, s10, 0x10)
						st64(s328 + 8, s638)
						ag = program_id
						st64(s328, program_id)
						st64(s1000, ay, av, aw, at, ar, aq, au, ap, ak, am, an, ao)
						ai = fn_44be8(s658, s328, az, ax, fp)
						ah = ld64(s658)
						if (ah == 2) {
							ai = fn_258(s668, ld64(s338), ag)
							const al = ld64(s668)
							if (al != 2) {
								ai = Error_with_account_name(s678, al, ld64(s668 + 8), 0x100154c38 /* "oracle" */, 6)
								ah = ld64(s678)
								st64(a + 8, ld64(s678 + 8))
								st64(a, ah)
								return ai
							}
							st64(a + 8, ag)
							st64(a, 2)
							return ai
						}
						st64(a + 8, ld64(s658 + 8))
						st64(a, ah)
						return ai
					}
					aa = ld64(s328 + 8)
					break B34
				}
				st64(s328, 0x1001596d8)
				st64(s318, s10)
				st64(s10, s11, fn_14ef78)
				st64(s310 + 8, 0)
				st64(s328 + 8, 2)
				st64(s310, 1)
				// fmt "Invalid Option representation: {}. The first byte must be 0 or 1" {} = *s11 [fn_14ef78]
				fn_147e78(s638, s328, g, l, i)
				aa = fn_b580(s638)
				break B34
			}
		}
		aa = fn_1459d0(0x100159468)
	}
	const ab = aa
	if (2 > (aa & 3) - 2) {
		ai = anchor_error_from(s688, 0x66 /* anchor::InstructionDidNotDeserialize */, ad, ae, af)
		ah = ld64(s688)
		st64(a + 8, ld64(s688 + 8))
		st64(a, ah)
		return ai
	}
	if ((ab & 3) == 0) {
		ai = anchor_error_from(s688, 0x66 /* anchor::InstructionDidNotDeserialize */, ad, ae, af)
		ah = ld64(s688)
		st64(a + 8, ld64(s688 + 8))
		st64(a, ah)
		return ai
	}
	const ac = ld64(ld64(aa + 7))
	callx(ac, ld64(aa - 1), ac)
	ai = anchor_error_from(s688, 0x66 /* anchor::InstructionDidNotDeserialize */)
	ah = ld64(s688)
	st64(a + 8, ld64(s688 + 8))
	st64(a, ah)
	return ai
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_10f70(a: u64, b: u64) {
	const s10 = fp - 0x10, s40 = fp - 0x40, s58 = fp - 0x58, s59 = fp - 0x59
	const f = ld64(b + 8)
	if (f == 0) {
		st64(a + 8, fn_1459d0(0x100159468))
		st16(a, 1)
	} else {
		const g = ld64(b)
		const h = ld8(g)
		st64(b + 8, f - 1)
		st64(b, g + 1)
		st8(s59, h)
		if (h == 1) {
			if (3 > f) {
				st64(a + 8, fn_1459d0(0x100159468))
				st16(a, 1)
			} else {
				const i = ld16(g + 1)
				st64(b + 8, f - 3)
				st64(b, g + 3)
				st16(a + 4, i)
				st16(a + 2, 1)
				st16(a, 0)
			}
		} else if (h != 0) {
			st64(s40, 0x1001596d8)
			st64(s40 + 0x10, s10)
			st64(s10, s59, fn_14ef78)
			st64(s40 + 0x20, 0)
			st64(s40 + 8, 2)
			st64(s40 + 0x18, 1)
			// fmt "Invalid Option representation: {}. The first byte must be 0 or 1" {} = h [fn_14ef78]
			fn_147e78(s58, s40, g, h, g + 1)
			st64(a + 8, fn_b580(s58))
			st16(a, 1)
		} else {
			st16(a + 2, 0)
			st16(a, 0)
		}
	}
}

// Anchor Accounts::try_accounts of instruction set_adaptive_fee_constants (called by ix_set_adaptive_fee_constants; name [str]: from the handler's "Instruction: …" log; was fn_fed28)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool (ConstraintHasOne), whirlpools_config, oracle (ConstraintMut, ConstraintHasOne), fee_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpool, whirlpools_config, oracle
export function accounts_set_adaptive_fee_constants(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s40 = fp - 0x40, s98 = fp - 0x98, s1a0 = fp - 0x1a0, s310 = fp - 0x310, s580 = fp - 0x580, s588 = fp - 0x588, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6d8 = fp - 0x6d8, s6e0 = fp - 0x6e0
	let u, v, ag: u64
	try_accounts_11a48(s5a0, c, c, d, e)
	const h = ld64(s5a0 + 0x10)
	const g = ld64(s5a0 + 8)
	const whirlpool: AccountInfo = ld64(s5a0)
	if (whirlpool == 0) {
		v = Error_with_account_name(s6b0, g, h, 0x100152b28 /* "whirlpool" */, 9)
		u = ld64(s6b0)
		st64(a + 0x10, ld64(s6b0 + 8))
		st64(a + 8, u)
		st64(a, 0)
		return v
	}
	st64(s6c0, g, h)
	memcpy(s310, s588, 0x278)
	try_accounts_11de0(s5a0, c)
	const k = ld64(s5a0 + 0x10)
	const j = ld64(s5a0 + 8)
	const whirlpools_config: AccountInfo = ld64(s5a0)
	if (whirlpools_config == 0) {
		v = Error_with_account_name(s6a0, j, k, "whirlpools_config", 0x11)
		u = ld64(s6a0)
		st64(a + 0x10, ld64(s6a0 + 8))
		st64(a + 8, u)
		st64(a, 0)
		return v
	}
	st64(s6d0, k, j)
	memcpy(s98, s588, 0x58)
	fn_460(s5a0, c)
	const m = ld64(s5a0 + 8)
	const l = ld64(s5a0)
	if (l == 2) {
		st64(s6d8, m)
		try_accounts_11718(s5a0, c, m)
		const t = ld64(s5a0 + 8)
		const n = ld64(s5a0)
		if (n == 2) {
			copyr(s40, s1a0, 0x20)
			const o = whirlpools_config.key
			copyr(s20, o, 0x20)
			const p = memcmp(s40, s20, 0x20)
			if ((p as u32) == 0) {
				const oracle: AccountInfo = ld64(s6d8)
				if (oracle.is_writable == 0) {
					anchor_error_from(s680, 0x7d0 /* anchor::ConstraintMut */)
					v = Error_with_account_name(s690, ld64(s680), ld64(s680 + 8), 0x100154c38 /* "oracle" */, 6)
					u = ld64(s690)
					st64(a + 0x10, ld64(s690 + 8))
					st64(a + 8, u)
					st64(a, 0)
					return v
				}
				st64(s6e0, t)
				AccountInfo_try_borrow_data(s5a0, oracle, p as u32)
				let ab = undef
				let ac = undef
				const ad = ld64(s5a0 + 0x10)
				const y = ld64(s5a0 + 8)
				const x = ld64(s5a0)
				if (x != 0x800000000000001a /* Ok */) {
					st64(s5a0, x, y, ad)
					v = fn_13b430(s600, s5a0)
					ag = ld64(s600 + 8)
					st64(a + 8, ld64(s600))
					st64(a + 0x10, ag)
					st64(a, 0)
					return v
				}
				let ae = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
				const z = ld64(y + 8)
				if (z >= 8) {
					ae = 0xbba /* anchor::AccountDiscriminatorMismatch */
					const aa = ld64(y)
					ab = ld64(aa)
					ac = 0xf4e5b38cb383c28b /* account:Oracle */
					if (ab == 0xf4e5b38cb383c28b /* account:Oracle */) {
						if (z > 0xfd) {
							copyr(s40, aa + 8, 0x20)
							st64(ad, ld64(ad) - 1)
							const ah = whirlpool.key
							copyr(s20, ah, 0x20)
							if ((memcmp(s40, s20, 0x20) as u32) == 0) {
								const al = ld64(ld64(s6e0))
								copyr(s40, al, 0x20)
								const am = ld64(s6d0)
								st64(s20 + 8, am)
								st64(s20, ld64(s6d0 + 8))
								copy(s10, s98, 0x10)
								if ((memcmp(s40, s20, 0x20) as u32) == 0) {
									memcpy(a + 0x18, s310, 0x278)
									v = memcpy(a + 0x2a8, s98, 0x58)
									st64(a + 0x308, ld64(s6e0))
									st64(a + 0x300, ld64(s6d8))
									st64(a + 0x2a0, am)
									st64(a + 0x298, ld64(s6d0 + 8))
									st64(a + 0x290, whirlpools_config)
									st64(a + 0x10, ld64(s6c0 + 8))
									st64(a + 8, ld64(s6c0))
									st64(a, whirlpool)
									return v
								}
								anchor_error_from(s640, 0x7dc /* anchor::ConstraintAddress */)
								const ap = Error_with_account_name(s650, ld64(s640), ld64(s640 + 8), "fee_authority", 0xd)
								const ao = ld64(s650 + 8)
								const an = ld64(s650)
								copy(s5a0, s40, 0x40)
								v = fn_13b5c0(s660, an, ao, s5a0, ap)
								u = ld64(s660)
								st64(a + 0x10, ld64(s660 + 8))
								st64(a + 8, u)
								st64(a, 0)
								return v
							}
							anchor_error_from(s610, 0x7d1 /* anchor::ConstraintHasOne */)
							const ak = Error_with_account_name(s620, ld64(s610), ld64(s610 + 8), 0x100154c38 /* "oracle" */, 6)
							const aj = ld64(s620 + 8)
							const ai = ld64(s620)
							copy(s5a0, s40, 0x40)
							v = fn_13b5c0(s630, ai, aj, s5a0, ak)
							u = ld64(s630)
							st64(a + 0x10, ld64(s630 + 8))
							st64(a + 8, u)
							st64(a, 0)
							return v
						}
						fn_14c5c0(0xfe, z, 0x1001592e8, ab, 0xf4e5b38cb383c28b /* account:Oracle */)
					}
				}
				v = anchor_error_from(s670, ae, ae, ab, ac)
				ag = ld64(s670 + 8)
				const af = ld64(s670)
				st64(ad, ld64(ad) - 1)
				st64(a + 8, af, ag)
				st64(a, 0)
				return v
			}
			anchor_error_from(s5d0, 0x7d1 /* anchor::ConstraintHasOne */)
			const s = Error_with_account_name(s5e0, ld64(s5d0), ld64(s5d0 + 8), 0x100152b28 /* "whirlpool" */, 9)
			const r = ld64(s5e0 + 8)
			const q = ld64(s5e0)
			copyr(s5a0, s1a0, 0x20)
			copy(s580, s20, 0x20)
			v = fn_13b5c0(s5f0, q, r, s5a0, s)
			u = ld64(s5f0)
			st64(a + 0x10, ld64(s5f0 + 8))
			st64(a + 8, u)
			st64(a, 0)
			return v
		}
		v = Error_with_account_name(s5c0, n, t, "fee_authority", 0xd)
		u = ld64(s5c0)
		st64(a + 0x10, ld64(s5c0 + 8))
		st64(a + 8, u)
		st64(a, 0)
		return v
	}
	v = Error_with_account_name(s5b0, l, m, 0x100154c38 /* "oracle" */, 6)
	u = ld64(s5b0)
	st64(a + 0x10, ld64(s5b0 + 8))
	st64(a + 8, u)
	st64(a, 0)
	return v
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value)
// types [heur]: b: SetAdaptiveFeeConstantsContext (the handler ix_set_adaptive_fee_constants passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_44be8(a: u64, b: SetAdaptiveFeeConstantsContext, c: u64, d: u64, e: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s80 = fp - 0x80, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sc8 = fp - 0xc8, sd0 = fp - 0xd0, sd8 = fp - 0xd8, se0 = fp - 0xe0
	let o, p, q, ap: u64
	let h = a
	const accounts: SetAdaptiveFeeConstantsAccounts = b.accounts
	const g = ld64(accounts + 0x300)
	if (ld8(g + 0x29) != 0) {
		st64(sc8, accounts)
		st64(s78, c, h)
		st64(sc0, ld64(e - 0xfa8))
		const s = ld64(e - 0xfb0)
		st64(sb8, ld64(e - 0xfb8))
		const u = ld64(e - 0xfc0)
		st64(sa0, ld64(e - 0xfc8))
		st64(s88, ld64(e - 0xfd0))
		st64(s98, ld64(e - 0xfd8))
		st64(s80, ld64(e - 0xfe0))
		st64(sb0, ld64(e - 0xfe8))
		const w = ld64(e - 0xff0)
		st64(sa8, ld64(e - 0xff8))
		st64(s90, ld64(e - 0x1000))
		fn_143448(s18, g, accounts)
		let n = undef
		const m = ld64(s18 + 0x10)
		const j = ld64(s18 + 8)
		const i = ld64(s18)
		if (i != 0x800000000000001a /* Ok */) {
			st64(s18, i, j, m)
			q = fn_13b430(s28, s18)
			p = ld64(s28)
			h = ld64(s78 + 8)
			st64(h + 8, ld64(s28 + 8))
			st64(h, p)
			return q
		}
		let l = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
		const k = ld64(j + 8)
		if (k >= 8) {
			l = 0xbba /* anchor::AccountDiscriminatorMismatch */
			const r = ld64(j)
			n = 0xf4e5b38cb383c28b /* account:Oracle */
			if (ld64(r) == 0xf4e5b38cb383c28b /* account:Oracle */) {
				if (k > 0xfd) {
					const t = ld16(r + 0x40)
					st64(sd0, t)
					st64(se0, d)
					const ae = ld64(s78)
					if ((s as u16) != 0) {
						st64(sd0, ld64(sc0))
					}
					st64(sd8, m)
					const v = ld16(r + 0x3e)
					st64(sc0, v)
					if ((u as u16) != 0) {
						st64(sc0, ld64(sb8))
					}
					const x = ld16(r + 0x34)
					st64(sb8, x)
					if ((w as u16) != 0) {
						st64(sb8, ld64(sb0))
					}
					const y = ld64(s90)
					const z = ld16(r + 0x32)
					st64(s90, z)
					if ((y as u16) != 0) {
						st64(s90, ld64(sa8))
					}
					const aa = ld64(s88)
					const ab = ld32(r + 0x3a)
					st64(s88, ab)
					if ((aa as u32) != 0) {
						st64(s88, ld64(sa0))
					}
					const ac = ld64(s80)
					st64(s80, r)
					const ad = ld32(r + 0x36)
					q = ad
					if ((ac as u32) != 0) {
						q = ld64(s98)
					}
					const af = ld16(ld64(s80) + 0x30)
					let ag = af
					if ((ae as u16) != 0) {
						ag = ld64(se0)
					}
					const ah = ag
					if ((ag as u16) == af && ((ld64(s90) as u16) == z && ((ld64(sb8) as u16) == x && ((q as u32) == ad && ((ld64(s88) as u32) == ab && ((ld64(sc0) as u16) == v && (ld64(sd0) as u16) == t)))))) {
						const ai = ld64(s80)
						if ((ld64(ai + 0x42) | ld64(ai + 0x4a)) == 0) {
							q = fn_87630(s48, 0x44)
							o = ld64(s48 + 8)
							p = ld64(s48)
							ap = ld64(sd8)
							st64(ap, ld64(ap) + 1)
							h = ld64(s78 + 8)
							st64(h + 8, o)
							st64(h, p)
							return q
						}
					}
					B43: {
						if ((ah as u16) != 0 && ((ld64(s90) as u16) > (ag as u16) && 0x1869f >= (q as u32))) {
							const aj = ((ld64(s88) as u32) * (ld64(sc0) as u16) >> 0x20) != 0
							if (0x270f >= (ld64(sb8) as u16) && (aj & 1) == 0) {
								const ak = ld16(ld64(sc8) + 0x284)
								if (ak > ((ld64(sc0) - 1) as u16) && ak % (ld64(sc0) as u16) == 0) {
									const al = ld64(sd0)
									if ((al as u16) != 0 && ak * 0x58 >= (al as u16)) {
										const am = ld64(s80)
										st16(am + 0x40, ld64(sd0))
										st16(am + 0x3e, ld64(sc0))
										st32(am + 0x3a, ld64(s88))
										st32(am + 0x36, q)
										st16(am + 0x34, ld64(sb8))
										st16(am + 0x32, ld64(s90))
										st16(am + 0x30, ag)
										st64(am + 0x4a, 0)
										st64(am + 0x42, 0)
										break B43
									}
								}
							}
						}
						q = fn_87630(s38, 0x3d)
						o = ld64(s38 + 8)
						p = ld64(s38)
						if (p != 2) {
							ap = ld64(sd8)
							st64(ap, ld64(ap) + 1)
							h = ld64(s78 + 8)
							st64(h + 8, o)
							st64(h, p)
							return q
						}
					}
					const an = ld64(s80)
					st32(an + 0x7a, 0)
					st64(an + 0x72, 0)
					st64(an + 0x6a, 0)
					st64(an + 0x62, 0)
					st64(an + 0x5a, 0)
					st64(an + 0x52, 0)
					const ao = ld64(sd8)
					o = ld64(ao) + 1
					st64(ao, o)
					h = ld64(s78 + 8)
					st64(h + 8, o)
					st64(h, 2)
					return q
				}
				fn_14c5c0(0xfe, k, 0x100159300, 0xf4e5b38cb383c28b /* account:Oracle */, m)
			}
		}
		q = anchor_error_from(s58, l, l, n, m)
		o = ld64(s58 + 8)
		p = ld64(s58)
		st64(m, ld64(m) + 1)
		h = ld64(s78 + 8)
		st64(h + 8, o)
		st64(h, p)
		return q
	}
	q = anchor_error_from(s68, 0xbbe /* anchor::AccountNotMutable */, c, d, e)
	p = ld64(s68)
	st64(h + 8, ld64(s68 + 8))
	st64(h, p)
	return q
}
