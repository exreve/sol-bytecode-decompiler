/// <reference path="../lib.d.ts" />
// instruction initialize_dynamic_tick_array
import { fn_147e78, fn_149678, fn_14c4f0, fn_14c5c0, fn_14e1c0, fn_5ecd8, fn_5fd40, memcpy } from '../shared.ts'

// instruction handler: initialize_dynamic_tick_array (discriminator sha256("global:initialize_dynamic_tick_array")[..8] = 0x328ee778c8a52129)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, tick_array, funder, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
export function ix_initialize_dynamic_tick_array(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s10 = fp - 0x10, s11 = fp - 0x11, s2a8 = fp - 0x2a8, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s550 = fp - 0x550, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s1000 = fp - 0x1000
	let i, l, m, n, o, p: u64
	sol_log("Instruction: InitializeDynamicTickArray", 0x27)
	const f = ix_args_len
	if (f >= 4 && f != 4) {
		const g = ix_args
		const q = ld32(g)
		const h = ld8(g + 4)
		st8(s11, h)
		if (2 > h) {
			st8(s11, 0xff)
			st64(s10, accounts, accounts_len)
			st64(s1000, f, s11)
			p = accounts_initialize_dynamic_tick_array(s2c0, program_id, s10, g, fp)
			const r = ld64(s2c0)
			if (r == 0) {
				o = ld64(s2c0 + 8)
				st64(a + 8, ld64(s2b0))
				st64(a, o)
				return p
			}
			const t = ld64(s2c0 + 8)
			const s = ld64(s2b0)
			memcpy(s550, s2a8, 0x290)
			st64(s568, r, t, s)
			st8(s2a8 + 8, ld8(s11))
			copyr(s2b0, s10, 0x10)
			st64(s2c0, program_id, s568)
			p = fn_313b8(s578, s2c0, q, h != 0)
			o = ld64(s578)
			if (o == 2) {
				st64(a + 8, undef)
				st64(a, 2)
				return p
			}
			st64(a + 8, ld64(s578 + 8))
			st64(a, o)
			return p
		}
		st64(s2c0, 0x100159620)
		st64(s2b0, s10)
		st64(s10, s11, fn_14ef78)
		st64(s2a8 + 8, 0)
		st64(s2c0 + 8, 1)
		st64(s2a8, 1)
		// fmt "Invalid bool representation: {}" {} = h [fn_14ef78]
		fn_147e78(s568, s2c0, undef, g)
		i = fn_b580(s568)
	} else {
		i = fn_1459d0(0x100159468)
	}
	const j = i
	if (2 > (i & 3) - 2) {
		p = anchor_error_from(s588, 0x66 /* anchor::InstructionDidNotDeserialize */, l, m, n)
		o = ld64(s588)
		st64(a + 8, ld64(s588 + 8))
		st64(a, o)
		return p
	}
	if ((j & 3) == 0) {
		p = anchor_error_from(s588, 0x66 /* anchor::InstructionDidNotDeserialize */, l, m, n)
		o = ld64(s588)
		st64(a + 8, ld64(s588 + 8))
		st64(a, o)
		return p
	}
	const k = ld64(ld64(i + 7))
	callx(k, ld64(i - 1), k)
	p = anchor_error_from(s588, 0x66 /* anchor::InstructionDidNotDeserialize */)
	o = ld64(s588)
	st64(a + 8, ld64(s588 + 8))
	st64(a, o)
	return p
}

// Anchor Accounts::try_accounts of instruction initialize_dynamic_tick_array (called by ix_initialize_dynamic_tick_array; name [str]: from the handler's "Instruction: …" log; was fn_97e78)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool, tick_array (AccountNotEnoughKeys, ConstraintSeeds, ConstraintMut), funder (ConstraintMut), system_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpool, tick_array
export function accounts_initialize_dynamic_tick_array(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s30 = fp - 0x30, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s2e8 = fp - 0x2e8, s558 = fp - 0x558, s560 = fp - 0x560, s578 = fp - 0x578, s57c = fp - 0x57c, s590 = fp - 0x590, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s668 = fp - 0x668, s670 = fp - 0x670, s678 = fp - 0x678, s680 = fp - 0x680
	let o, p, z, aa, ab: u64
	if (4 > ld64(e - 0x1000)) {
		const m = fn_1459d0(0x100159468)
		if (2 > (m & 3) - 2) {
			ab = anchor_error_from(s650, 0x66 /* anchor::InstructionDidNotDeserialize */)
			aa = ld64(s650)
			st64(a + 0x10, ld64(s650 + 8))
			st64(a + 8, aa)
			st64(a, 0)
			return ab
		}
		if ((m & 3) == 0) {
			ab = anchor_error_from(s650, 0x66 /* anchor::InstructionDidNotDeserialize */)
			aa = ld64(s650)
			st64(a + 0x10, ld64(s650 + 8))
			st64(a + 8, aa)
			st64(a, 0)
			return ab
		}
		const n = ld64(ld64(m + 7))
		callx(n, ld64(m - 1), n)
		ab = anchor_error_from(s650, 0x66 /* anchor::InstructionDidNotDeserialize */)
		aa = ld64(s650)
		st64(a + 0x10, ld64(s650 + 8))
		st64(a + 8, aa)
		st64(a, 0)
		return ab
	}
	st64(s668 + 0x10, ld64(e - 0xff8))
	st32(s57c, ld32(d))
	try_accounts_11a48(s578, c, c, d, e)
	const h = ld64(s578 + 0x10)
	const g = ld64(s578 + 8)
	const whirlpool: AccountInfo = ld64(s578)
	if (whirlpool == 0) {
		ab = Error_with_account_name(s640, g, h, 0x100152b28 /* "whirlpool" */, 9)
		aa = ld64(s640)
		st64(a + 0x10, ld64(s640 + 8))
		st64(a + 8, aa)
		st64(a, 0)
		return ab
	}
	st64(s668, g, h)
	memcpy(s2e8, s560, 0x278)
	try_accounts_11718(s578, c)
	let j = ld64(s578 + 8)
	const i = ld64(s578)
	if (i == 2) {
		st64(s670, j)
		const k = ld64(c + 8)
		if (k == 0) {
			anchor_error_from(s5a0, 0xbbd /* anchor::AccountNotEnoughKeys */, j, o, p)
			j = undef
			st64(s678, ld64(s5a0 + 8))
			const q = ld64(s5a0)
			if (q != 2) {
				ab = Error_with_account_name(s5b0, q, ld64(s678), 0x100152e25 /* "tick_array" */, 0xa)
				aa = ld64(s5b0)
				st64(a + 0x10, ld64(s5b0 + 8))
				st64(a + 8, aa)
				st64(a, 0)
				return ab
			}
		} else {
			st64(c + 8, k - 1)
			const l: AccountInfo = ld64(c)
			st64(s678, l)
			st64(c, l + 0x30)
		}
		fn_122e8(s578, c, j, o, p)
		const s = ld64(s578 + 8)
		const r = ld64(s578)
		if (r == 2) {
			if (ld8(ld64(s670) + 0x29) == 0) {
				anchor_error_from(s620, 0x7d0 /* anchor::ConstraintMut */, s)
				ab = Error_with_account_name(s630, ld64(s620), ld64(s620 + 8), "funder", 6)
				aa = ld64(s630)
				st64(a + 0x10, ld64(s630 + 8))
				st64(a + 8, aa)
				st64(a, 0)
				return ab
			}
			st64(s680, s)
			const t = whirlpool.key
			copyr(s20, t, 0x20)
			st64(s70, 0, 1, 0)
			st64(s558, s70, 0x100159480)
			st8(s558 + 0x18, 3)
			st64(s558 + 0x10, 0x20)
			st64(s578 + 0x10, 0)
			st64(s578, 0)
			if (imp_fmt(s57c, s578) == 0) {
				copyr(s30, s68, 0x10)
				st64(s50, 0x100152e25, 0xa, s20, 0x20)
				// PDA find_program_address(["tick_array", *s20, ?], program *b)
				Pubkey_find_program_address(s578, s50, 3, b)
				copyr(s70, s578, 0x20)
				st8(ld64(s668 + 0x10), ld8(s558))
				const tick_array: AccountInfo = ld64(s678)
				const v = tick_array.key
				copyr(s578, v, 0x20)
				if ((memcmp(s578, s70, 0x20) as u32) != 0) {
					anchor_error_from(s5d0, 0x7d6 /* anchor::ConstraintSeeds */)
					const y = Error_with_account_name(s5e0, ld64(s5d0), ld64(s5d0 + 8), 0x100152e25 /* "tick_array" */, 0xa)
					const x = ld64(s5e0 + 8)
					const w = ld64(s5e0)
					copyr(s578, v, 0x20)
					copy(s558, s70, 0x20)
					ab = fn_13b5c0(s5f0, w, x, s578, y)
					z = ld64(s5f0 + 8)
					st64(a + 8, ld64(s5f0))
					st64(a + 0x10, z)
					st64(a, 0)
					return ab
				}
				if (tick_array.is_writable == 0) {
					anchor_error_from(s600, 0x7d0 /* anchor::ConstraintMut */)
					ab = Error_with_account_name(s610, ld64(s600), ld64(s600 + 8), 0x100152e25 /* "tick_array" */, 0xa)
					z = ld64(s610 + 8)
					st64(a + 8, ld64(s610))
					st64(a + 0x10, z)
					st64(a, 0)
					return ab
				}
				ab = memcpy(a + 0x18, s2e8, 0x278)
				st64(a + 0x2a0, ld64(s680))
				st64(a + 0x298, tick_array)
				st64(a + 0x290, ld64(s670))
				st64(a + 0x10, ld64(s668 + 8))
				st64(a + 8, ld64(s668))
				st64(a, whirlpool)
				return ab
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s50, 0x1001594b0, 0x1001594d0)
		}
		ab = Error_with_account_name(s5c0, r, s, "system_program", 0xe)
		aa = ld64(s5c0)
		st64(a + 0x10, ld64(s5c0 + 8))
		st64(a + 8, aa)
		st64(a, 0)
		return ab
	}
	ab = Error_with_account_name(s590, i, j, "funder", 6)
	aa = ld64(s590)
	st64(a + 0x10, ld64(s590 + 8))
	st64(a + 8, aa)
	st64(a, 0)
	return ab
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value)
// types [heur]: b: InitializeDynamicTickArrayContext (the handler ix_initialize_dynamic_tick_array passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_313b8(a: u64, b: InitializeDynamicTickArrayContext, c: u64, d: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s80 = fp - 0x80, sa0 = fp - 0xa0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, sd8 = fp - 0xd8, s100 = fp - 0x100, s108 = fp - 0x108, s130 = fp - 0x130, s138 = fp - 0x138, s160 = fp - 0x160, s164 = fp - 0x164, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8
	let j, au, az: u64
	st32(s164, c)
	const accounts: InitializeDynamicTickArrayAccounts = b.accounts
	let g = accounts.tick_array
	let h = ld64(g + 0x18)
	if ((memcmp(h, 0x100152180, 0x20) as u32) == 0) {
		az = fn_5fd40(s178)
		au = ld64(s178 + 8)
		j = ld64(s178)
		if (j != 2) {
			st64(a + 8, au)
			st64(a, j)
			return az
		}
		const k: AccountInfo = ld64(accounts + 0x2a0)
		const l: LamportsCell = k.lamports
		const w = k.key
		rc_inc(l)
		const r: DataCell = k.data
		rc_inc(r)
		const v = k.owner
		const u = k.rent_epoch
		const t = k.is_signer
		const s = k.is_writable
		st8(s138 + 2, k.executable)
		st8(s138, t, s)
		st64(s160, w, l, r, v, u)
		const funder: AccountInfo = accounts.funder
		const y: LamportsCell = funder.lamports
		const ae = funder.key
		rc_inc(y)
		const z: DataCell = funder.data
		rc_inc(z)
		const ad = funder.owner
		const ac = funder.rent_epoch
		const ab = funder.is_signer
		const aa = funder.is_writable
		st8(s108 + 2, funder.executable)
		st8(s108, ab, aa)
		st64(s130, ae, y, z, ad, ac)
		const tick_array: AccountInfo = accounts.tick_array
		const ag: LamportsCell = tick_array.lamports
		const am = tick_array.key
		rc_inc(ag)
		const ah: DataCell = tick_array.data
		rc_inc(ah)
		const al = tick_array.owner
		const ak = tick_array.rent_epoch
		const aj = tick_array.is_signer
		const ai = tick_array.is_writable
		st8(sd8 + 2, tick_array.executable)
		st8(sd8, aj, ai)
		st64(s100, am, ag, ah, al, ak)
		const an = accounts.whirlpool.key
		copyr(s80, an, 0x20)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x100159480)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (imp_fmt(s164, s48) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1, 0x1001594b0, 0x1001594d0)
		}
		const ap = ld64(s60 + 8)
		const ao = ld64(s60 + 0x10)
		const aq = ld8(b + 0x20)
		st64(sa0, ap, ao, s48)
		st64(sc0 + 0x10, s80)
		st64(sc0, 0x100152e25)
		st8(s48, aq)
		st64(sd0, sc0)
		st64(sa0 + 0x18, 1)
		st64(sc0 + 0x18, 0x20)
		st64(sc0 + 8, 0xa)
		st64(sd0 + 8, 4)
		az = fn_5ecd8(s188, s160, s130, s100, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x1d4fc0, 0x94, sd0, 1)
		j = ld64(s188)
		if (j != 2) {
			st64(a + 8, ld64(s188 + 8))
			st64(a, j)
			return az
		}
		g = accounts.tick_array
		h = ld64(g + 0x18)
	}
	const i = memcmp(h, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((i as u32) == 0) {
		az = fn_143448(s48, g, i as u32)
		let p = undef
		let q = undef
		const ar = ld64(s48 + 0x10)
		const n = ld64(s48 + 8)
		const m = ld64(s48)
		if (m == 0x800000000000001a /* Ok */) {
			const o = ld64(n + 8)
			if (o > 7) {
				let at = ld64(n)
				au = ld64(at)
				if (au != 0) {
					if (d != 0) {
						q = 0x38dac7e18ef6d811 /* account:DynamicTickArray */
						if (ld64(at) == 0x38dac7e18ef6d811 /* account:DynamicTickArray */) {
							st64(ar, ld64(ar) + 1)
							st64(a + 8, au)
							st64(a, 2)
							return az
						}
						at = ld64(at)
						p = 0xbb42076ebebd6145 /* account:TickArray */
						if (at == 0xbb42076ebebd6145 /* account:TickArray */) {
							st64(ar, ld64(ar) + 1)
							st64(a + 8, au)
							st64(a, 2)
							return az
						}
					}
					az = anchor_error_from(s1b8, 0xbb8 /* anchor::AccountDiscriminatorAlreadySet */, at, p, q)
					au = ld64(s1b8 + 8)
					j = ld64(s1b8)
					st64(ar, ld64(ar) + 1)
					st64(a + 8, au)
					st64(a, j)
					return az
				}
				st64(at, 0x38dac7e18ef6d811 /* account:DynamicTickArray */)
				const av = ld64(n + 8)
				if (av > 7) {
					B30: {
						const ba = ld64(n)
						const aw = ld16(accounts + 0x284)
						const ax = ld32(s164)
						const ay = ((ax as i32) - 0x6c4f5) as u32
						if (0xfff27617 > ay) {
							if ((ax as i32) > -0x6c4f4) {
								break B30
							}
							if (aw == 0) {
								fn_14e1c0(0x100159f30, aw * 0x58, ay, 0xfff27617, q)
							}
							if (0x6c4f4 % (aw * 0x58) - aw * 0x58 - 0x6c4f4 != (ax as i32)) {
								break B30
							}
						} else {
							if (aw == 0) {
								fn_14e1c0(0x100159f18, aw * 0x58, ay, 0xfff27617, q)
							}
							az = fn_151bf8(ax as i32, aw * 0x58)
							if (az != 0) {
								break B30
							}
						}
						st32(ba + 8, ax as i32)
						const bb = accounts.whirlpool.key
						st64(ba + 0x24, ld64(bb + 0x18))
						st64(ba + 0x1c, ld64(bb + 0x10))
						au = ld64(bb + 8)
						st64(ba + 0x14, au)
						st64(ba + 0xc, ld64(bb))
						st64(ar, ld64(ar) + 1)
						st64(a + 8, au)
						st64(a, 2)
						return az
					}
					az = fn_87630(s1c8, 1)
					au = ld64(s1c8 + 8)
					j = ld64(s1c8)
					st64(ar, ld64(ar) + 1)
					st64(a + 8, au)
					st64(a, j)
					return az
				}
				fn_14c4f0(8, av, 0x100159b40, p, q)
			}
			fn_14c5c0(8, o, 0x100159b28, p, q)
		}
		st64(s48, m, n, ar)
		az = fn_13b430(s1a8, s48)
		j = ld64(s1a8)
		st64(a + 8, ld64(s1a8 + 8))
		st64(a, j)
		return az
	}
	az = anchor_error_from(s198, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	j = ld64(s198)
	st64(a + 8, ld64(s198 + 8))
	st64(a, j)
	return az
}
