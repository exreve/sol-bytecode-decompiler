/// <reference path="../lib.d.ts" />
// instruction initialize_tick_array
import { fn_1110, fn_13ae08, fn_143100, fn_149678, fn_14c5c0, fn_14e1c0, fn_14f7f8, memcpy } from '../shared.ts'

// instruction handler: initialize_tick_array (discriminator sha256("global:initialize_tick_array")[..8] = 0xb8955b8dd6c1bc0b)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, system_program, tick_array, funder
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
export function ix_initialize_tick_array(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s290 = fp - 0x290, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s538 = fp - 0x538, s550 = fp - 0x550, s560 = fp - 0x560, s561 = fp - 0x561, s578 = fp - 0x578, s588 = fp - 0x588, s598 = fp - 0x598, s1000 = fp - 0x1000
	let j, n: u64
	sol_log("Instruction: InitializeTickArray", 0x20)
	const f = ix_args_len
	if (4 > f) {
		const l = fn_1459d0(0x100159468)
		if (2 > (l & 3) - 2) {
			n = anchor_error_from(s598, 0x66 /* anchor::InstructionDidNotDeserialize */)
			j = ld64(s598)
			st64(a + 8, ld64(s598 + 8))
			st64(a, j)
			return n
		}
		if ((l & 3) == 0) {
			n = anchor_error_from(s598, 0x66 /* anchor::InstructionDidNotDeserialize */)
			j = ld64(s598)
			st64(a + 8, ld64(s598 + 8))
			st64(a, j)
			return n
		}
		const m = ld64(ld64(l + 7))
		callx(m, ld64(l - 1), m)
		n = anchor_error_from(s598, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s598)
		st64(a + 8, ld64(s598 + 8))
		st64(a, j)
		return n
	}
	const g = ix_args
	const o = ld32(g)
	st8(s561, 0xff)
	st64(s560, accounts, accounts_len)
	st64(s1000, f, s561)
	n = accounts_initialize_tick_array(s2a8, program_id, s560, g, fp)
	const i = ld64(s298)
	j = ld64(s2a8 + 8)
	const h = ld64(s2a8)
	if (h == 0) {
		st64(a + 8, i)
		st64(a, j)
		return n
	}
	const k = memcpy(s538, s290, 0x290)
	st64(s550, h, j, i)
	st8(s290 + 8, ld8(s561))
	copyr(s298, s560, 0x10)
	st64(s2a8, program_id, s550)
	n = fn_32f48(s578, s2a8, o, undef, undef, k)
	j = ld64(s578)
	if (j == 2) {
		n = fn_aef00(s588, s550, program_id)
		j = ld64(s588)
		st64(a + 8, ld64(s588 + 8))
		st64(a, j)
		return n
	}
	st64(a + 8, ld64(s578 + 8))
	st64(a, j)
	return n
}

// Anchor Accounts::try_accounts of instruction initialize_tick_array (called by ix_initialize_tick_array; name [str]: from the handler's "Instruction: …" log; was fn_ac2a0)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool, system_program, tick_array (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), funder (ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: tick_array, funder
export function accounts_initialize_tick_array(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s30 = fp - 0x30, s50 = fp - 0x50, s51 = fp - 0x51, s70 = fp - 0x70, s78 = fp - 0x78, s90 = fp - 0x90, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc0 = fp - 0xc0, s330 = fp - 0x330, s338 = fp - 0x338, s348 = fp - 0x348, s350 = fp - 0x350, s5c8 = fp - 0x5c8, s5e0 = fp - 0x5e0, s5e4 = fp - 0x5e4, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s6f8 = fp - 0x6f8, s700 = fp - 0x700
	let q, r, s, u, v: u64
	st64(s5f0, b)
	if (4 > ld64(e - 0x1000)) {
		const o = fn_1459d0(0x100159468)
		if (2 > (o & 3) - 2) {
			v = anchor_error_from(s6f0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			q = ld64(s6f0)
			st64(a + 0x10, ld64(s6f0 + 8))
			st64(a + 8, q)
			st64(a, 0)
			return v
		}
		if ((o & 3) == 0) {
			v = anchor_error_from(s6f0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			q = ld64(s6f0)
			st64(a + 0x10, ld64(s6f0 + 8))
			st64(a + 8, q)
			st64(a, 0)
			return v
		}
		const p = ld64(ld64(o + 7))
		callx(p, ld64(o - 1), p)
		v = anchor_error_from(s6f0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		q = ld64(s6f0)
		st64(a + 0x10, ld64(s6f0 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return v
	}
	st64(s6f8, a)
	st64(s700, ld64(e - 0xff8))
	st32(s5e4, ld32(d))
	try_accounts_11a48(s350, c, c, d, e)
	const g = ld64(s348 + 8)
	const h = ld64(s348)
	const f = ld64(s350)
	if (f == 0) {
		v = Error_with_account_name(s6e0, h, g, 0x100152b28 /* "whirlpool" */, 9)
		s = ld64(s6e0)
		r = ld64(s6f8)
		st64(r + 0x10, ld64(s6e0 + 8))
		st64(r + 8, s)
		st64(r, 0)
		return v
	}
	memcpy(s5c8, s338, 0x278)
	st64(s5e0, f, h, g)
	try_accounts_11718(s350, c)
	const j = ld64(s348)
	const i = ld64(s350)
	if (i == 2) {
		st64(sc0, j)
		const k = ld64(c + 8)
		let t = ld64(s6f8)
		if (k == 0) {
			v = anchor_error_from(s6d0, 0xbbd /* anchor::AccountNotEnoughKeys */, j)
			u = ld64(s6d0)
			st64(t + 0x10, ld64(s6d0 + 8))
			st64(t + 8, u)
			st64(t, 0)
			return v
		}
		const l: AccountInfo = ld64(c)
		st64(sb8, l)
		st64(c + 8, k - 1)
		st64(c, l + 0x30)
		fn_122e8(s350, c, j)
		const n = ld64(s348)
		const m = ld64(s350)
		if (m != 2) {
			v = Error_with_account_name(s610, m, n, "system_program", 0xe)
			u = ld64(s610)
			st64(t + 0x10, ld64(s610 + 8))
			st64(t + 8, u)
			st64(t, 0)
			return v
		}
		st64(sb0, n)
		rent_get(s350)
		copy(s90, s348, 0x18)
		if (ld64(s350) == 0) {
			copyr(sa8, s90, 0x18)
			const w = ld64(ld64(s5e0))
			copy(s50, w, 0x20)
			st64(s78, 0, 1, 0)
			st64(s330, s78, 0x100159480)
			st8(s330 + 0x18, 3)
			st64(s330 + 0x10, 0x20)
			st64(s348 + 8, 0)
			st64(s350, 0)
			if (imp_fmt(s5e4, s350) == 0) {
				copyr(s10, s70, 0x10)
				st64(s30, 0x100152e25, 0xa, s50, 0x20)
				// PDA find_program_address(["tick_array", *s50, ?], program *(ld64(s5f0)))
				Pubkey_find_program_address(s350, s30, 3, ld64(s5f0))
				copyr(s78, s350, 0x20)
				const x = ld8(s330)
				st8(s51, x)
				st8(ld64(s700), x)
				const y = ld64(ld64(sb8))
				copy(s350, y, 0x20)
				if ((memcmp(s350, s78, 0x20) as u32) == 0) {
					st64(s350, sb8, sa8, sc0, sb0, s5e0, s5e4, s51, s5f0)
					v = fn_ad230(s30, s350)
					const tick_array: AccountInfo = ld64(s30 + 8)
					u = ld64(s30)
					if (u == 2) {
						if (tick_array.is_writable == 0) {
							anchor_error_from(s6b0, 0x7d0 /* anchor::ConstraintMut */)
							v = Error_with_account_name(s6c0, ld64(s6b0), ld64(s6b0 + 8), 0x100152e25 /* "tick_array" */, 0xa)
							u = ld64(s6c0)
							st64(t + 0x10, ld64(s6c0 + 8))
							st64(t + 8, u)
							st64(t, 0)
							return v
						}
						AccountInfo_clone(s30, tick_array)
						const ah = fn_143100(s30)
						AccountInfo_clone(s350, tick_array)
						AccountInfo_try_data_len(s50, s350)
						const aj = ld64(s50 + 8)
						const ai = ld64(s50)
						if (ai != 0x800000000000001a /* Ok */) {
							st64(s50 + 0x10, ld64(s50 + 0x10))
							st64(s50, ai, aj)
							v = fn_13b430(s660, s50)
							const ay = ld64(s660)
							const ax = ld64(s6f8)
							st64(ax + 0x10, ld64(s660 + 8))
							st64(ax + 8, ay)
							st64(ax, 0)
							const ba = ld64(s348 + 8)
							const az = ld64(s348)
							rc_dec(az)
							rc_dec(ba)
							const bc = ld64(s30 + 0x10)
							const bb = ld64(s30 + 8)
							rc_dec(bb)
							if (!rc_release(bc)) {
								return v
							}
							st64(bc + 8, ld64(bc + 8) - 1)
							return v
						}
						const ak = __floatundidf(ld64(sa8) * (aj + 0x80))
						const al = fn_14f7f8(ld64(sa8 + 8), ak)
						st64(s700, 0)
						const am = fn_151cb0(al, 0)
						const an = fn_14f3e8(al)
						if ((am as i64) >= 0) {
							st64(s700, an)
						}
						const ao = fn_151a40(al, 0x43efffffffffffff)
						let aw = -1
						if (0 >= (ao as i64)) {
							aw = ld64(s700)
						}
						const aq = ld64(s348 + 8)
						const ap = ld64(s348)
						t = ld64(s6f8)
						rc_dec(ap)
						rc_dec(aq)
						const au = ld64(s30 + 0x10)
						const ar = ld64(s30 + 8)
						let at = ld64(ar) - 1
						st64(ar, at)
						if (at == 0) {
							at = ld64(ar + 8) - 1
							st64(ar + 8, at)
						}
						let av = ld64(au) - 1
						st64(au, av)
						if (av == 0) {
							av = ld64(au + 8) - 1
							st64(au + 8, av)
						}
						if (aw > ah) {
							anchor_error_from(s690, 0x7d5 /* anchor::ConstraintRentExempt */, av, at)
							v = Error_with_account_name(s6a0, ld64(s690), ld64(s690 + 8), 0x100152e25 /* "tick_array" */, 0xa)
							u = ld64(s6a0)
							st64(t + 0x10, ld64(s6a0 + 8))
							st64(t + 8, u)
							st64(t, 0)
							return v
						}
						const funder: AccountInfo = ld64(sc0)
						if (funder.is_writable != 0) {
							v = memcpy(t, s5e0, 0x290)
							st64(t + 0x2a0, ld64(sb0))
							st64(t + 0x290, funder, tick_array)
							return v
						}
						anchor_error_from(s670, 0x7d0 /* anchor::ConstraintMut */, av, at)
						v = Error_with_account_name(s680, ld64(s670), ld64(s670 + 8), "funder", 6)
						u = ld64(s680)
						st64(t + 0x10, ld64(s680 + 8))
						st64(t + 8, u)
						st64(t, 0)
						return v
					}
					st64(t + 0x10, tick_array)
					st64(t + 8, u)
					st64(t, 0)
					return v
				}
				anchor_error_from(s630, 0x7d6 /* anchor::ConstraintSeeds */)
				Error_with_account_name(s640, ld64(s630), ld64(s630 + 8), 0x100152e25 /* "tick_array" */, 0xa)
				const af = ld64(s640 + 8)
				const ae = ld64(s640)
				const z = ld64(ld64(sb8))
				const ad = ld64(z + 0x18)
				const ac = ld64(z + 0x10)
				const ab = ld64(z + 8)
				const aa = ld64(z)
				copy(s330, s78, 0x20)
				st64(s350, aa, ab, ac, ad)
				v = fn_13b5c0(s650, ae, af, s350, ab)
				u = ld64(s650)
				st64(t + 0x10, ld64(s650 + 8))
				st64(t + 8, u)
				st64(t, 0)
				return v
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s30, 0x1001594b0, 0x1001594d0)
		}
		v = fn_13b430(s620, s90)
		u = ld64(s620)
		st64(t + 0x10, ld64(s620 + 8))
		st64(t + 8, u)
		st64(t, 0)
		return v
	}
	v = Error_with_account_name(s600, i, j, "funder", 6)
	s = ld64(s600)
	r = ld64(s6f8)
	st64(r + 0x10, ld64(s600 + 8))
	st64(r + 8, s)
	st64(r, 0)
	return v
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: tick_array
export function fn_ad230(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s40 = fp - 0x40, s48 = fp - 0x48, s58 = fp - 0x58, s60 = fp - 0x60, s80 = fp - 0x80, sa0 = fp - 0xa0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, s108 = fp - 0x108, s148 = fp - 0x148, s168 = fp - 0x168, s188 = fp - 0x188, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s220 = fp - 0x220, s228 = fp - 0x228, s238 = fp - 0x238, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s308 = fp - 0x308, s318 = fp - 0x318, s340 = fp - 0x340, s350 = fp - 0x350, s358 = fp - 0x358, s360 = fp - 0x360, s368 = fp - 0x368, s370 = fp - 0x370, s378 = fp - 0x378
	let bp, da, dd, de, df: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s2c0, f, b)
	if (g != 0) {
		const o = ld64(ld64(b + 0x10))
		st64(s308 + 0x28, o)
		const p = ld64(o)
		copyr(s40, p + 8, 0x18)
		st64(s308 + 0x30, p)
		st64(s48, ld64(p))
		const q = ld64(f)
		copyr(s238, q + 8, 0x18)
		st64(s308 + 0x38, q)
		st64(s240, ld64(q))
		if ((memcmp(s48, s240, 0x20) as u32) == 0) {
			ErrorCode_name(s80, 0x100152d40)
			st64(sc0, 0, 1, 0)
			st64(s28, sc0, 0x100159480)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s40 + 8, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100152d40, s48) == 0) {
				copyr(s208, sc0, 0x18)
				copy(s220, s80, 0x18)
				st64(s238, 0x100154a03)
				st32(s1f0 + 0x48, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s1f0, 2)
				st32(s228, 5)
				st64(s238 + 8, 0x3c)
				st64(s240, 0)
				const av = fn_13b3a8(s280, s240)
				const au = ld64(s280 + 8)
				const at = ld64(s280)
				const aq = ld64(s308 + 0x30)
				copyr(s240, aq, 0x20)
				const ar = ld64(s308 + 0x38)
				copy(s220, ar, 0x20)
				df = fn_13b5c0(s290, at, au, s240, av)
				const aw = ld64(s290)
				st64(a + 8, ld64(s290 + 8))
				st64(a, aw)
				return df
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1, 0x1001594b0, 0x1001594d0)
		}
		st64(s308 + 0x40, a)
		const r = ld64(b + 8)
		const s = __floatundidf(ld64(r) * 0x2784)
		const t = fn_14f7f8(ld64(r + 8), s)
		const u = fn_151cb0(t, 0)
		const v = fn_14f3e8(t)
		const w = fn_151a40(t, 0x43efffffffffffff)
		let ay: AccountInfo = ld64(s2c0)
		const x = max((w as i64) > 0 ? 0xffffffffffffffff : 0 > (u as i64) ? 0 : v, 1)
		let bs = ld64(s2c0 + 8)
		if (x > g) {
			const y: AccountInfo = ld64(s308 + 0x28)
			const z: LamportsCell = y.lamports
			rc_inc(z)
			const ax: DataCell = y.data
			rc_inc(ax)
			const az: LamportsCell = ay.lamports
			const ba = az.strong
			st64(s308 + 0x10, ay.key)
			st64(s308 + 0x18, y.executable)
			st64(s308 + 0x20, y.is_writable)
			st64(s308 + 0x38, y.is_signer)
			const bd = y.rent_epoch
			const be = y.owner
			rc_inc(az, ba)
			const bb: DataCell = ay.data
			const bc = bb.strong
			st64(s308 + 8, bd)
			st64(s308 + 0x28, be)
			rc_inc(bb, bc)
			const bf: AccountInfo = ld64(ld64(ld64(s2c0 + 8) + 0x18))
			const bg: LamportsCell = bf.lamports
			const bh = bg.strong
			st64(s308, sat_sub(x, g))
			st64(s340 + 0x10, ay.executable)
			st64(s340 + 0x18, ay.is_writable)
			st64(s340 + 0x20, ay.is_signer)
			st64(s318, ay.rent_epoch)
			st64(s318 + 8, ay.owner)
			const bk = bf.key
			rc_inc(bg, bh)
			const bi: DataCell = bf.data
			const bj = bi.strong
			st64(s340, z, bk)
			rc_inc(bi, bj)
			st64(s350 + 8, bf.owner)
			const bo = bf.rent_epoch
			const bn = bf.is_signer
			const bm = bf.is_writable
			const bl = bf.executable
			st8(s108 + 0x22, ld64(s340 + 0x10))
			st8(s108 + 0x21, ld64(s340 + 0x18))
			st8(s108 + 0x20, ld64(s340 + 0x20))
			st64(s108 + 0x18, ld64(s318))
			st64(s108 + 0x10, ld64(s318 + 8))
			st64(s108, az, bb)
			st64(s148 + 0x38, ld64(s308 + 0x10))
			st8(s148 + 0x32, ld64(s308 + 0x18))
			st8(s148 + 0x31, ld64(s308 + 0x20))
			st8(s148 + 0x30, ld64(s308 + 0x38))
			st64(s148 + 0x28, ld64(s308 + 8))
			st64(s148 + 0x20, ld64(s308 + 0x28))
			st64(s148 + 0x18, ax)
			st64(s148 + 0x10, ld64(s340))
			st64(s148 + 8, ld64(s308 + 0x30))
			st8(s148, bn, bm, bl)
			st64(s168 + 0x18, bo)
			st64(s168 + 0x10, ld64(s350 + 8))
			st64(s168, bg, bi)
			st64(s188 + 0x18, ld64(s340 + 8))
			st64(se0, 8, 0)
			st64(s188, 0, 8, 0)
			df = fn_13d318(s250, s188, ld64(s308))
			bp = ld64(s250)
			if (bp != 2) {
				de = ld64(s250 + 8)
				dd = ld64(s308 + 0x40)
				st64(dd, bp, de)
				return df
			}
			ay = ld64(s2c0)
			st64(s308 + 0x38, ay.key)
			bs = ld64(s2c0 + 8)
		}
		const bq: LamportsCell = ay.lamports
		rc_inc(bq)
		const br: DataCell = ay.data
		rc_inc(br)
		const bt: AccountInfo = ld64(ld64(bs + 0x18))
		const bu: LamportsCell = bt.lamports
		const bv = bu.strong
		st64(s308 + 0x28, ay.executable)
		st64(s308 + 0x30, ay.is_writable)
		const by = ay.is_signer
		const bz = ay.rent_epoch
		const ca = ay.owner
		st64(s308 + 0x20, bt.key)
		rc_inc(bu, bv)
		const bw: DataCell = bt.data
		const bx = bw.strong
		st64(s318, by, bz, ca, bu, br, bq)
		rc_inc(bw, bx)
		st64(s340, bt.executable)
		st64(s340 + 8, bt.is_writable)
		st64(s340 + 0x10, bt.is_signer)
		st64(s340 + 0x18, bt.rent_epoch)
		st64(s340 + 0x20, bt.owner)
		const cb = ld64(s2c0 + 8)
		const cc = ld64(ld64(ld64(cb + 0x20)))
		copyr(sc0, cc, 0x20)
		const cd = ld64(cb + 0x28)
		st64(s80, 0, 1, 0)
		st64(s220, s80, 0x100159480)
		st8(s208, 3)
		st64(s220 + 0x10, 0x20)
		st64(s238 + 8, 0)
		st64(s240, 0)
		st64(s350 + 8, cd)
		if (imp_fmt(cd, s240) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1, 0x1001594b0, 0x1001594d0)
		}
		const cf = ld64(s80 + 8)
		const ce = ld64(s80 + 0x10)
		const cg = ld8(ld64(cb + 0x30))
		st64(s28, cf, ce, s80)
		st64(s40 + 8, sc0)
		st64(s48, 0x100152e25)
		st64(s60, s48)
		st64(s1f0 + 0x28, s60)
		st8(s1f0 + 0x22, ld64(s340))
		st8(s1f0 + 0x21, ld64(s340 + 8))
		st8(s1f0 + 0x20, ld64(s340 + 0x10))
		st64(s1f0 + 0x18, ld64(s340 + 0x18))
		st64(s1f0 + 0x10, ld64(s340 + 0x20))
		st64(s1f0 + 8, bw)
		st64(s1f0, ld64(s308 + 8))
		st64(s1f8, ld64(s308 + 0x20))
		st8(s208 + 0xa, ld64(s308 + 0x28))
		st8(s208 + 9, ld64(s308 + 0x30))
		st8(s208 + 8, ld64(s318))
		st64(s208, ld64(s318 + 8))
		st64(s220 + 0x10, ld64(s308))
		st64(s220 + 8, ld64(s308 + 0x10))
		st64(s220, ld64(s308 + 0x18))
		st64(s228, ld64(s308 + 0x38))
		st8(s80, cg)
		st64(s28 + 0x18, 1)
		st64(s40 + 0x10, 0x20)
		st64(s40, 0xa)
		st64(s58, 4)
		st64(s1f0 + 0x30, 1)
		st64(s240, 0, 8, 0)
		df = fn_13c8b8(s260, s240, 0x2704)
		bp = ld64(s260)
		if (bp != 2) {
			de = ld64(s260 + 8)
			dd = ld64(s308 + 0x40)
			st64(dd, bp, de)
			return df
		}
		const ch: AccountInfo = ld64(s2c0)
		const ci: LamportsCell = ch.lamports
		const cq = ch.key
		rc_inc(ci)
		const cj: DataCell = ch.data
		const ck = cj.strong
		st64(s308 + 0x38, cg)
		rc_inc(cj, ck)
		const cl: LamportsCell = bt.lamports
		const cm = cl.strong
		st64(s308 + 0x10, bt.key)
		st64(s308 + 0x18, ch.executable)
		st64(s308 + 0x20, ch.is_writable)
		st64(s308 + 0x28, ch.is_signer)
		st64(s308 + 0x30, ch.rent_epoch)
		const cp = ch.owner
		rc_inc(cl, cm)
		const cn: DataCell = bt.data
		const co = cn.strong
		st64(s318, cp, cj, cq, ci)
		rc_inc(cn, co)
		st64(s340 + 8, bt.executable)
		st64(s340 + 0x10, bt.is_writable)
		st64(s340 + 0x18, bt.is_signer)
		st64(s340 + 0x20, bt.rent_epoch)
		const cx = bt.owner
		copyr(s80, cc, 0x20)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x100159480)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s40 + 8, 0)
		st64(s48, 0)
		if (imp_fmt(ld64(s350 + 8), s48) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1, 0x1001594b0, 0x1001594d0)
		}
		st64(sa0 + 0x10, s48)
		copyr(sa0, s58, 0x10)
		st64(sc0 + 0x10, s80)
		st64(sc0, 0x100152e25)
		st64(sd0, sc0)
		st64(s1f0 + 0x28, sd0)
		st8(s1f0 + 0x22, ld64(s340 + 8))
		st8(s1f0 + 0x21, ld64(s340 + 0x10))
		st8(s1f0 + 0x20, ld64(s340 + 0x18))
		st64(s1f0 + 0x18, ld64(s340 + 0x20))
		st64(s1f0, cl, cn, cx)
		st64(s1f8, ld64(s308 + 0x10))
		st8(s208 + 0xa, ld64(s308 + 0x18))
		st8(s208 + 9, ld64(s308 + 0x20))
		st8(s208 + 8, ld64(s308 + 0x28))
		st64(s208, ld64(s308 + 0x30))
		st64(s220 + 0x10, ld64(s318))
		st64(s220 + 8, ld64(s318 + 8))
		copyr(s228, s308, 0x10)
		st8(s48, ld64(s308 + 0x38))
		st64(sa0 + 0x18, 1)
		st64(sc0 + 0x18, 0x20)
		st64(sc0 + 8, 0xa)
		st64(sd0 + 8, 4)
		st64(s1f0 + 0x30, 1)
		st64(s240, 0, 8, 0)
		df = fn_13cc48(s270, s240, ld64(ld64(ld64(s2c0 + 8) + 0x38)))
		const cy = ld64(s270)
		da = ld64(s308 + 0x40)
		if (cy != 2) {
			const dg = ld64(s270 + 8)
			st64(da, cy, dg)
			return df
		}
	} else {
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0x2784)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const ac = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		const m: AccountInfo = ld64(ld64(ld64(s2c0 + 8) + 0x10))
		const n: LamportsCell = m.lamports
		const ad: AccountInfo = ld64(s2c0)
		const ap = m.key
		rc_inc(n)
		const aa: DataCell = m.data
		const ab = aa.strong
		st64(s308 + 0x38, ac)
		rc_inc(aa, ab)
		const ae: LamportsCell = ad.lamports
		const af = ae.strong
		st64(s308, ad.key)
		st64(s308 + 8, m.executable)
		st64(s308 + 0x10, m.is_writable)
		st64(s308 + 0x18, m.is_signer)
		st64(s308 + 0x20, m.rent_epoch)
		st64(s308 + 0x28, m.owner)
		st64(s308 + 0x30, ae)
		rc_inc(ae, af)
		const ag: DataCell = ad.data
		const ah = ag.strong
		st64(s318 + 8, aa)
		rc_inc(ag, ah)
		const ai: AccountInfo = ld64(ld64(ld64(s2c0 + 8) + 0x18))
		const aj: LamportsCell = ai.lamports
		const ak = aj.strong
		st64(s308 + 0x40, a)
		st64(s340 + 0x10, ad.executable)
		st64(s340 + 0x18, ad.is_writable)
		st64(s340 + 0x20, ad.is_signer)
		st64(s318, ad.rent_epoch)
		const an = ad.owner
		const ao = ai.key
		rc_inc(aj, ak)
		const al: DataCell = ai.data
		const am = al.strong
		st64(s350, an, ao, ap, n)
		rc_inc(al, am)
		st64(s378, ai.executable)
		st64(s370, ai.is_writable)
		st64(s368, ai.is_signer)
		st64(s360, ai.rent_epoch)
		st64(s358, ai.owner)
		const cr = ld64(s2c0 + 8)
		const cs = ld64(ld64(ld64(cr + 0x20)))
		copyr(sc0, cs, 0x20)
		const ct = ld64(cr + 0x28)
		st64(s80, 0, 1, 0)
		st64(s220, s80, 0x100159480)
		st8(s208, 3)
		st64(s220 + 0x10, 0x20)
		st64(s238 + 8, 0)
		st64(s240, 0)
		if (imp_fmt(ct, s240) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1, 0x1001594b0, 0x1001594d0)
		}
		const cv = ld64(s80 + 8)
		const cu = ld64(s80 + 0x10)
		const cw = ld8(ld64(cr + 0x30))
		st64(s28, cv, cu, s80)
		st64(s40 + 8, sc0)
		st64(s48, 0x100152e25)
		st8(s80, cw)
		st64(s60, s48)
		st64(s1f0 + 0x58, s60)
		st8(s1f0 + 0x52, ld64(s340 + 0x10))
		st8(s1f0 + 0x51, ld64(s340 + 0x18))
		st8(s1f0 + 0x50, ld64(s340 + 0x20))
		st64(s1f0 + 0x48, ld64(s318))
		st64(s1f0 + 0x40, ld64(s350))
		st64(s1f0 + 0x38, ag)
		st64(s1f0 + 0x30, ld64(s308 + 0x30))
		st64(s1f0 + 0x28, ld64(s308))
		st8(s1f0 + 0x22, ld64(s308 + 8))
		st8(s1f0 + 0x21, ld64(s308 + 0x10))
		st8(s1f0 + 0x20, ld64(s308 + 0x18))
		st64(s1f0 + 0x18, ld64(s308 + 0x20))
		st64(s1f0 + 0x10, ld64(s308 + 0x28))
		st64(s1f0 + 8, ld64(s318 + 8))
		copyr(s1f8, s340, 0x10)
		st8(s208 + 0xa, ld64(s378))
		st8(s208 + 9, ld64(s370))
		st8(s208 + 8, ld64(s368))
		st64(s208, ld64(s360))
		st64(s220 + 0x10, ld64(s358))
		st64(s220, aj, al)
		st64(s228, ld64(s350 + 8))
		st64(s28 + 0x18, 1)
		st64(s40 + 0x10, 0x20)
		st64(s40, 0xa)
		st64(s58, 4)
		st64(s1f0 + 0x60, 1)
		st64(s240, 0, 8, 0)
		df = fn_13cfd8(s2a0, s240, ld64(s308 + 0x38), 0x2704, ld64(ld64(cr + 0x38)))
		bp = ld64(s2a0)
		if (bp != 2) {
			de = ld64(s2a0 + 8)
			dd = ld64(s308 + 0x40)
			st64(dd, bp, de)
			return df
		}
		da = ld64(s308 + 0x40)
	}
	df = fn_1110(s240, ld64(s2c0))
	const db = ld64(s238)
	const cz = ld64(s240)
	if (cz == 2) {
		st64(da + 8, db)
		st64(da, 2)
		return df
	}
	df = Error_with_account_name(s2b0, cz, db, 0x100152e25 /* "tick_array" */, 0xa)
	const dc = ld64(s2b0)
	st64(da + 8, ld64(s2b0 + 8))
	st64(da, dc)
	return df
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
// types [heur]: b: InitializeTickArrayContext (the handler ix_initialize_tick_array passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_32f48(a: u64, b: InitializeTickArrayContext, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58
	let m, n, o: u64
	const accounts: InitializeTickArrayAccounts = b.accounts
	const tick_array: AccountInfo = accounts.tick_array
	if (tick_array.is_writable != 0) {
		o = fn_143448(s18, tick_array, r0)
		const k = ld64(s18 + 0x10)
		const i = ld64(s18 + 8)
		const h = ld64(s18)
		if (h != 0x800000000000001a /* Ok */) {
			st64(s18, h, i, k)
			o = fn_13b430(s28, s18)
			n = ld64(s28)
			st64(a + 8, ld64(s28 + 8))
			st64(a, n)
			return o
		}
		const j = ld64(i + 8)
		if (j > 7) {
			const l = ld64(i)
			if (ld8(l) == 0 && (ld8(l + 1) == 0 && (ld8(l + 2) == 0 && (ld8(l + 3) == 0 && (ld8(l + 4) == 0 && (ld8(l + 5) == 0 && (ld8(l + 6) == 0 && ld8(l + 7) == 0))))))) {
				if (j > 0x2703) {
					B20: {
						const p = ld16(accounts + 0x284)
						const q = (c - 0x6c4f5) as u32
						if (0xfff27617 > q) {
							if ((c as i32) > -0x6c4f4) {
								break B20
							}
							if (p == 0) {
								fn_14e1c0(0x100159f30, p * 0x58, c as i32, 0xfff27617, l)
							}
							if (((0x6c4f4 % (p * 0x58) - p * 0x58 - 0x6c4f4) as u32) != (c as u32)) {
								break B20
							}
						} else {
							if (p == 0) {
								fn_14e1c0(0x100159f18, p * 0x58, q, 0xfff27617, l)
							}
							o = fn_151bf8(c as i32, p * 0x58)
							if (o != 0) {
								break B20
							}
						}
						const r = ld64(ld64(accounts))
						const u = ld64(r)
						const t = ld64(r + 8)
						const s = ld64(r + 0x10)
						m = ld64(r + 0x18)
						st32(l + 8, c)
						st64(l + 0x26fc, m)
						st64(l + 0x26f4, s)
						st64(l + 0x26ec, t)
						st64(l + 0x26e4, u)
						st64(k, ld64(k) + 1)
						st64(a + 8, m)
						st64(a, 2)
						return o
					}
					o = fn_87630(s48, 1)
					m = ld64(s48 + 8)
					n = ld64(s48)
					st64(k, ld64(k) + 1)
					st64(a + 8, m)
					st64(a, n)
					return o
				}
				fn_14c5c0(0x2704, j, 0x100159330, undef, l)
			}
			o = anchor_error_from(s38, 0xbb8 /* anchor::AccountDiscriminatorAlreadySet */, 0x800000000000001a /* Ok */, undef, l)
			m = ld64(s38 + 8)
			n = ld64(s38)
			st64(k, ld64(k) + 1)
			st64(a + 8, m)
			st64(a, n)
			return o
		}
		fn_14c5c0(8, j, 0x100159318)
	}
	o = anchor_error_from(s58, 0xbbe /* anchor::AccountNotMutable */, c, d, e)
	n = ld64(s58)
	st64(a + 8, ld64(s58 + 8))
	st64(a, n)
	return o
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: tick_array
export function fn_aef00(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40
	const h = ld64(b + 0x298)
	const f = memcmp(0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c, 0x20)
	let m = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, m)
		st64(a, 2)
		return g
	}
	g = common_is_closed(h)
	m = undef
	if (g != 0) {
		st64(a + 8, m)
		st64(a, 2)
		return g
	}
	fn_143448(s20, h, g)
	const l = ld64(s20 + 0x10)
	const j = ld64(s20 + 8)
	const i = ld64(s20)
	if (i != 0x800000000000001a /* Ok */) {
		st64(s20, i, j, l)
		g = fn_13b430(s30, s20)
		m = undef
		const n = ld64(s30)
		if (n == 2) {
			st64(a + 8, m)
			st64(a, 2)
			return g
		}
		g = Error_with_account_name(s40, n, ld64(s30 + 8), 0x100152e25 /* "tick_array" */, 0xa)
		const o = ld64(s40)
		st64(a + 8, ld64(s40 + 8))
		st64(a, o)
		return g
	}
	const k = ld64(j)
	st64(s20 + 8, ld64(j + 8))
	st64(s20, k)
	st64(s20 + 0x10, 0)
	g = fn_13ae08(s20, 0x100151ec8, 8)
	if (g != 0) {
		st64(s8, g)
		fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s8, 0x1001592b0, 0x1001592d0)
	}
	m = ld64(l) + 1
	st64(l, m)
	st64(a + 8, m)
	st64(a, 2)
	return g
}
