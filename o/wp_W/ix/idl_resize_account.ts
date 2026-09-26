/// <reference path="../lib.d.ts" />
// instruction idl_resize_account
import { fn_143100, fn_1434c0, fn_1486f0, fn_1490e8, fn_149478, fn_14f7f8 } from '../shared.ts'

// instruction handler: idl_resize_account (discriminator sha256("global:idl_resize_account")[..8] = 0xcaf918924f1f0e45)
export function ix_idl_resize_account(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s30 = fp - 0x30, s58 = fp - 0x58, s60 = fp - 0x60, s88 = fp - 0x88, s90 = fp - 0x90, sb8 = fp - 0xb8, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s100 = fp - 0x100, s110 = fp - 0x110
	let m, n, o, v: u64
	let f = a
	sol_log("Instruction: IdlResizeAccount", 0x1d)
	if (ld32(b + 0x28) != 0) {
		o = anchor_error_from(se0, 0x3ea /* anchor::IdlAccountNotEmpty */)
		v = ld64(se0)
		st64(f + 8, ld64(se0 + 8))
		st64(f, v)
		return o
	}
	const ba = f
	const g: AccountInfo = ld64(b)
	const h = fn_143178(g)
	const i = fn_143178(g)
	if (i > c) {
		fn_149110("data_len should always be >= the current account space", 0x36, 0x10015a8d0, m, n)
	}
	let k = h
	const j = min(c - i, 0x2710)
	f = ba
	let l = h > h + j
	if (l != 0) {
		fn_1490e8(0x10015a8d0, l, k, m, n)
	}
	o = fn_143178(g, l, k, m, n)
	if (h + j > o) {
		rent_get(sd0)
		const q = ld64(sd0 + 0x10)
		const p = ld64(sd0 + 8)
		if (ld64(sd0) != 0) {
			st32(s18, ld32(sb8 + 1))
			st32(s18 + 3, ld32(sb8 + 4))
			const w = ld8(sb8)
			st32(sd0 + 0x14, ld32(s18 + 3))
			st32(sd0 + 0x11, ld32(s18))
			st8(sd0 + 0x10, w)
			st64(sd0, p, q)
			o = fn_13b430(sf0, sd0)
			v = ld64(sf0)
			st64(f + 8, ld64(sf0 + 8))
			st64(f, v)
			return o
		}
		const r = fn_14f7f8(q, __floatundidf(p * (h + j + 0x80)))
		let az = fn_151cb0(r, 0)
		const s = fn_14f3e8(r)
		az = 0 > (az as i64) ? 0 : s
		const z = (fn_151a40(r, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : az
		const t: AccountInfo = ld64(b + 0x38)
		const u: LamportsCell = t.lamports
		const y = t.key
		rc_inc(u)
		const x: DataCell = t.data
		az = x
		rc_inc(x)
		const aa: AccountInfo = ld64(b + 0x30)
		const ab: LamportsCell = aa.lamports
		const au = t.executable
		const av = t.is_writable
		const aw = t.is_signer
		const ax = t.rent_epoch
		const ay = t.owner
		const at = aa.key
		rc_inc(ab)
		const ac: DataCell = aa.data
		rc_inc(ac)
		const ad: LamportsCell = g.lamports
		const an = g.key
		const ao = aa.executable
		const ap = aa.is_writable
		const aq = aa.is_signer
		const ar = aa.rent_epoch
		const af = aa.owner
		rc_inc(ad)
		const ae: DataCell = g.data
		rc_inc(ae)
		const ak = g.owner
		const aj = g.rent_epoch
		const ai = g.is_signer
		const ah = g.is_writable
		const ag = g.executable
		st8(s30, ai, ah, ag)
		st64(s58, an, ad, ae, ak, aj)
		st8(s60, aq, ap, ao)
		st64(s88, at, ab, ac, af, ar)
		st8(s90, aw, av, au)
		st64(sb8, y, u, az, ay, ax)
		st64(s28, 8, 0)
		st64(sd0, 0, 8, 0)
		const al = fn_143100(g, ak, aj, ah, ag)
		l = undef
		k = z
		if (al > z) {
			fn_1490e8(0x10015a8d0, l, k, m, n)
		}
		o = fn_13d318(s100, sd0, k - al)
		const am = ld64(s100)
		f = ba
		if (am != 2) {
			st64(f + 8, ld64(s100 + 8))
			st64(f, am)
			return o
		}
		o = fn_1434c0(s18, g, h + j, o)
		if (ld64(s18) == 0x800000000000001a /* Ok */) {
			st64(f + 8, 0x800000000000001a /* Ok */)
			st64(f, 2)
			return o
		}
		copyr(sd0, s18, 0x18)
		o = fn_13b430(s110, sd0)
		v = ld64(s110)
		st64(f + 8, ld64(s110 + 8))
		st64(f, v)
		return o
	}
	st64(f + 8, undef)
	st64(f, 2)
	return o
}

export function fn_143178(a: AccountInfo, b: u64, c: u64, d: u64, e: u64): u64 {
	const f: DataCell = a.data
	const g = f.borrow
	if (g > 0x7ffffffffffffffe) {
		fn_1486f0(0x10015b4f8, g, 0x7ffffffffffffffe, d, e)
	}
	return f.len
}

export function fn_149110(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s10 = fp - 0x10
	st64(s10, a, b)
	fn_149530(s10, c, c, d, e)
}

export function fn_149530(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s10 = fp - 0x10, s40 = fp - 0x40
	st64(s40, 0x100153110)
	st64(s40 + 0x10, s10)
	st64(s10, a, T_fmt_14f0b8)
	st64(s40 + 0x20, 0)
	st64(s40 + 8, 1)
	st64(s40 + 0x18, 1)
	fn_149478(s40, b, T_fmt_14f0b8, d, e)
}
