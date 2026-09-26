/// <reference path="../lib.d.ts" />
// instruction initialize_fee_tier
import { fn_143100, fn_149678, fn_14c4f0, fn_14f7f8, fn_7240, memcpy } from '../shared.ts'

// instruction handler: initialize_fee_tier (discriminator sha256("global:initialize_fee_tier")[..8] = 0x1e2a0270a09c4ab7)
// accounts [str: the program's account-error strings, in order of first use]: config, funder, fee_tier, fee_authority, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: fee_tier
export function ix_initialize_fee_tier(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s38 = fp - 0x38, s50 = fp - 0x50, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sb1 = fp - 0xb1, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s1000 = fp - 0x1000
	let j, n: u64
	sol_log("Instruction: InitializeFeeTier", 0x1e)
	const f = ix_args_len
	if (f >= 2 && (f & -2) != 2) {
		const g = ix_args
		const q = ld16(g)
		const p = ld16(g + 2)
		st8(sb1, 0xff)
		st64(sb0, accounts, accounts_len)
		st64(s1000, f, sb1)
		n = accounts_initialize_fee_tier(s50, program_id, sb0, g, fp)
		let i = ld64(s50 + 0x10)
		j = ld64(s50 + 8)
		const h = ld64(s50)
		if (h == 0) {
			st64(a + 8, i)
			st64(a, j)
			return n
		}
		memcpy(s88, s38, 0x38)
		st64(sa0, h, j, i)
		if (q == 0) {
			n = fn_87630(sd8, 4)
			i = ld64(sd8 + 8)
			j = ld64(sd8)
			if (j != 2) {
				st64(a + 8, i)
				st64(a, j)
				return n
			}
		} else {
			const k = ld64(ld64(h))
			copyr(s90, k, 0x20)
			st16(s88 + 0x18, q)
			if (p > 0xea60) {
				n = fn_87630(sc8, 0x1c)
				j = ld64(sc8)
				if (j != 2) {
					st64(a + 8, ld64(sc8 + 8))
					st64(a, j)
					return n
				}
			} else {
				st16(s88 + 0x1a, p)
			}
		}
		n = fn_7240(se8, s98, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
		const o = ld64(se8)
		if (o != 2) {
			n = Error_with_account_name(sf8, o, ld64(se8 + 8), "fee_tier", 8)
			j = ld64(sf8)
			st64(a + 8, ld64(sf8 + 8))
			st64(a, j)
			return n
		}
		st64(a + 8, i)
		st64(a, 2)
		return n
	}
	const l = fn_1459d0(0x100159468)
	if (2 > (l & 3) - 2) {
		n = anchor_error_from(s108, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s108)
		st64(a + 8, ld64(s108 + 8))
		st64(a, j)
		return n
	}
	if ((l & 3) == 0) {
		n = anchor_error_from(s108, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s108)
		st64(a + 8, ld64(s108 + 8))
		st64(a, j)
		return n
	}
	const m = ld64(ld64(l + 7))
	callx(m, ld64(l - 1), m)
	n = anchor_error_from(s108, 0x66 /* anchor::InstructionDidNotDeserialize */)
	j = ld64(s108)
	st64(a + 8, ld64(s108 + 8))
	st64(a, j)
	return n
}

// Anchor Accounts::try_accounts of instruction initialize_fee_tier (called by ix_initialize_fee_tier; name [str]: from the handler's "Instruction: …" log; was fn_987d8)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: config, funder (ConstraintMut), fee_tier (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), fee_authority (ConstraintAddress), system_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: fee_tier, funder
export function accounts_initialize_fee_tier(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s90 = fp - 0x90, sa8 = fp - 0xa8, sc0 = fp - 0xc0, sd8 = fp - 0xd8, sda = fp - 0xda, sdb = fp - 0xdb, s100 = fp - 0x100, s118 = fp - 0x118, s130 = fp - 0x130, s138 = fp - 0x138, s140 = fp - 0x140, s148 = fp - 0x148, s14a = fp - 0x14a, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8, s2b0 = fp - 0x2b0, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2c8 = fp - 0x2c8
	let r, s: u64
	st64(s158, b)
	if (2 > ld64(e - 0x1000)) {
		const h = fn_1459d0(0x100159468)
		if (2 > (h & 3) - 2) {
			s = anchor_error_from(s298, 0x66 /* anchor::InstructionDidNotDeserialize */)
			r = ld64(s298)
			st64(a + 0x10, ld64(s298 + 8))
			st64(a + 8, r)
			st64(a, 0)
			return s
		}
		if ((h & 3) == 0) {
			s = anchor_error_from(s298, 0x66 /* anchor::InstructionDidNotDeserialize */)
			r = ld64(s298)
			st64(a + 0x10, ld64(s298 + 8))
			st64(a + 8, r)
			st64(a, 0)
			return s
		}
		const i = ld64(ld64(h + 7))
		callx(i, ld64(h - 1), i)
		s = anchor_error_from(s298, 0x66 /* anchor::InstructionDidNotDeserialize */)
		r = ld64(s298)
		st64(a + 0x10, ld64(s298 + 8))
		st64(a + 8, r)
		st64(a, 0)
		return s
	}
	const v = ld64(e - 0xff8)
	st16(s14a, ld16(d))
	try_accounts_11de0(s70, c, c, d, e)
	if (ld64(s70) == 0) {
		s = Error_with_account_name(s288, ld64(s68), ld64(s68 + 8), 0x100154883 /* "config" */, 6)
		r = ld64(s288)
		st64(a + 0x10, ld64(s288 + 8))
		st64(a + 8, r)
		st64(a, 0)
		return s
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x70) & -8 : 0x300007f90
	if (g > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, s70, 0x70)
		const j = ld64(c + 8)
		if (j == 0) {
			s = anchor_error_from(s278, 0xbbd /* anchor::AccountNotEnoughKeys */)
			r = ld64(s278)
			st64(a + 0x10, ld64(s278 + 8))
			st64(a + 8, r)
			st64(a, 0)
			return s
		}
		const k: AccountInfo = ld64(c)
		st64(s148, k)
		st64(c + 8, j - 1)
		st64(c, k + 0x30)
		try_accounts_11718(s70, c)
		const m = ld64(s68)
		const l = ld64(s70)
		if (l != 2) {
			s = Error_with_account_name(s168, l, m, "funder", 6)
			r = ld64(s168)
			st64(a + 0x10, ld64(s168 + 8))
			st64(a + 8, r)
			st64(a, 0)
			return s
		}
		st64(s140, m)
		try_accounts_11718(s70, c, m)
		const o = ld64(s68)
		const n = ld64(s70)
		if (n == 2) {
			st64(s2a0, o)
			fn_122e8(s70, c, o)
			const q = ld64(s68)
			const p = ld64(s70)
			if (p == 2) {
				st64(s138, q)
				rent_get(s70)
				copy(s118, s68, 0x18)
				if (ld64(s70) == 0) {
					copyr(s130, s118, 0x18)
					const t = ld64(ld64(g))
					copyr(s90, t, 0x20)
					st64(s70, 0x100151ec0)
					st64(s68 + 8, s90)
					st64(s50, sda)
					st16(sda, ld16(s14a))
					st64(s68, 8)
					st64(s68 + 0x10, 0x20)
					st64(s50 + 8, 2)
					// PDA find_program_address(["fee_tier", *t, u16 ld16(s14a) [ix data?]], program *(ld64(s158)))
					Pubkey_find_program_address(sc0, s70, 3, ld64(s158))
					copyr(s100, sc0, 0x20)
					const u = ld8(sa8 + 8)
					st8(sdb, u)
					st8(v, u)
					const w = ld64(ld64(s148))
					copy(s70, w, 0x20)
					if ((memcmp(s70, s100, 0x20) as u32) == 0) {
						st64(s70, s148, s130, s140, s138, g, s14a, sdb, s158)
						s = fn_999e8(sc0, s70)
						const ag = ld64(sc0 + 0x10)
						const af = ld64(sc0 + 8)
						const fee_tier: AccountInfo = ld64(sc0)
						if (fee_tier == 0) {
							st64(a + 0x10, ag)
							st64(a + 8, af)
							st64(a, 0)
							return s
						}
						copyr(sd8, sa8, 0x18)
						if (fee_tier.is_writable == 0) {
							anchor_error_from(s258, 0x7d0 /* anchor::ConstraintMut */, ag, af)
							s = Error_with_account_name(s268, ld64(s258), ld64(s258 + 8), "fee_tier", 8)
							r = ld64(s268)
							st64(a + 0x10, ld64(s268 + 8))
							st64(a + 8, r)
							st64(a, 0)
							return s
						}
						st64(s2a8, af)
						st64(s2b8, ag)
						AccountInfo_clone(sc0, fee_tier)
						st64(s2b0, fn_143100(sc0))
						st64(s2c0, fee_tier)
						AccountInfo_clone(s70, fee_tier)
						AccountInfo_try_data_len(s90, s70)
						const ai = ld64(s90 + 8)
						const ah = ld64(s90)
						if (ah != 0x800000000000001a /* Ok */) {
							st64(s90 + 0x10, ld64(s90 + 0x10))
							st64(s90, ah, ai)
							s = fn_13b430(s1d8, s90)
							const av = ld64(s1d8)
							st64(a + 0x10, ld64(s1d8 + 8))
							st64(a + 8, av)
							st64(a, 0)
							const ax = ld64(s68 + 8)
							const aw = ld64(s68)
							rc_dec(aw)
							rc_dec(ax)
							const az = ld64(sc0 + 0x10)
							const ay = ld64(sc0 + 8)
							rc_dec(ay)
							if (!rc_release(az)) {
								return s
							}
							st64(az + 8, ld64(az + 8) - 1)
							return s
						}
						const aj = __floatundidf(ld64(s130) * (ai + 0x80))
						const ak = fn_14f7f8(ld64(s130 + 8), aj)
						st64(s2c8, fn_151cb0(ak, 0))
						const al = fn_14f3e8(ak)
						const am = 0 > (ld64(s2c8) as i64) ? 0 : al
						const au = (fn_151a40(ak, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : am
						const ao = ld64(s68 + 8)
						const an = ld64(s68)
						rc_dec(an)
						rc_dec(ao)
						const ar = ld64(sc0 + 0x10)
						const ap = ld64(sc0 + 8)
						let aq = ld64(ap) - 1
						st64(ap, aq)
						if (aq == 0) {
							aq = ld64(ap + 8) - 1
							st64(ap + 8, aq)
						}
						let at = ld64(ar) - 1
						st64(ar, at)
						if (at == 0) {
							at = ld64(ar + 8) - 1
							st64(ar + 8, at)
						}
						if (au > ld64(s2b0)) {
							anchor_error_from(s238, 0x7d5 /* anchor::ConstraintRentExempt */, at, aq)
							s = Error_with_account_name(s248, ld64(s238), ld64(s238 + 8), "fee_tier", 8)
							r = ld64(s248)
							st64(a + 0x10, ld64(s248 + 8))
							st64(a + 8, r)
							st64(a, 0)
							return s
						}
						const funder: AccountInfo = ld64(s140)
						if (funder.is_writable != 0) {
							const bb = ld64(s2a0)
							const bc = ld64(bb)
							copyr(s90, bc, 0x20)
							copyr(sc0, g + 8, 0x20)
							s = memcmp(s90, sc0, 0x20) as u32
							if (s != 0) {
								anchor_error_from(s1e8, 0x7dc /* anchor::ConstraintAddress */)
								const bj = Error_with_account_name(s1f8, ld64(s1e8), ld64(s1e8 + 8), "fee_authority", 0xd)
								const bi = ld64(s1f8 + 8)
								const bh = ld64(s1f8)
								copyr(s70, s90, 0x20)
								copy(s50, sc0, 0x20)
								s = fn_13b5c0(s208, bh, bi, s70, bj)
								r = ld64(s208)
								st64(a + 0x10, ld64(s208 + 8))
								st64(a + 8, r)
								st64(a, 0)
								return s
							}
							const bg = ld64(sd8)
							const bf = ld64(sd8 + 8)
							const be = ld64(sd8 + 0x10)
							const bd = ld64(s138)
							st64(a + 0x40, bb)
							st64(a + 0x38, funder)
							st64(a + 0x18, ld64(s2b8))
							st64(a + 0x10, ld64(s2a8))
							st64(a + 8, ld64(s2c0))
							st64(a, g)
							st64(a + 0x48, bd)
							st64(a + 0x30, be)
							st64(a + 0x28, bf)
							st64(a + 0x20, bg)
							return s
						}
						anchor_error_from(s218, 0x7d0 /* anchor::ConstraintMut */, at, aq)
						s = Error_with_account_name(s228, ld64(s218), ld64(s218 + 8), "funder", 6)
						r = ld64(s228)
						st64(a + 0x10, ld64(s228 + 8))
						st64(a + 8, r)
						st64(a, 0)
						return s
					}
					anchor_error_from(s1a8, 0x7d6 /* anchor::ConstraintSeeds */)
					Error_with_account_name(s1b8, ld64(s1a8), ld64(s1a8 + 8), "fee_tier", 8)
					const ad = ld64(s1b8 + 8)
					const ac = ld64(s1b8)
					const x = ld64(ld64(s148))
					const ab = ld64(x + 0x18)
					const aa = ld64(x + 0x10)
					const z = ld64(x + 8)
					const y = ld64(x)
					copy(s50, s100, 0x20)
					st64(s70, y, z, aa, ab)
					s = fn_13b5c0(s1c8, ac, ad, s70, z)
					r = ld64(s1c8)
					st64(a + 0x10, ld64(s1c8 + 8))
					st64(a + 8, r)
					st64(a, 0)
					return s
				}
				s = fn_13b430(s198, s118)
				r = ld64(s198)
				st64(a + 0x10, ld64(s198 + 8))
				st64(a + 8, r)
				st64(a, 0)
				return s
			}
			s = Error_with_account_name(s188, p, q, "system_program", 0xe)
			r = ld64(s188)
			st64(a + 0x10, ld64(s188 + 8))
			st64(a + 8, r)
			st64(a, 0)
			return s
		}
		s = Error_with_account_name(s178, n, o, "fee_authority", 0xd)
		r = ld64(s178)
		st64(a + 0x10, ld64(s178 + 8))
		st64(a + 8, r)
		st64(a, 0)
		return s
	}
	alloc_handle_alloc_error(8, 0x70)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: fee_tier
export function fn_999e8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s41 = fp - 0x41, s44 = fp - 0x44, s68 = fp - 0x68, s78 = fp - 0x78, sa0 = fp - 0xa0, se0 = fp - 0xe0, s100 = fp - 0x100, s120 = fp - 0x120, s138 = fp - 0x138, s170 = fp - 0x170, s180 = fp - 0x180, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1b8 = fp - 0x1b8, s1d0 = fp - 0x1d0, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, s300 = fp - 0x300, s308 = fp - 0x308
	let av, cz, da, db: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s270, f, b)
	if (g != 0) {
		const p = ld64(ld64(b + 0x10))
		st64(s2b8 + 0x28, p)
		const q = ld64(p)
		copyr(s38, q + 8, 0x18)
		st64(s2b8 + 0x30, q)
		st64(s40, ld64(q))
		const r = ld64(f)
		copyr(s1e8, r + 8, 0x18)
		st64(s2b8 + 0x38, r)
		st64(s1f0, ld64(r))
		if ((memcmp(s40, s1f0, 0x20) as u32) == 0) {
			ErrorCode_name(s138, 0x100152d40)
			st64(s68, 0, 1, 0)
			st64(s20, s68, 0x100159480)
			st8(s20 + 0x18, 3)
			st64(s20 + 0x10, 0x20)
			st64(s38 + 8, 0)
			st64(s40, 0)
			if (ErrorCode_fmt(0x100152d40, s40) == 0) {
				copyr(s1b8, s68, 0x18)
				copy(s1d0, s138, 0x18)
				st64(s1e8, 0x10015488f)
				st32(s170 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s1a0, 2)
				st32(s1d8, 4)
				st64(s1e8 + 8, 0x3a)
				st64(s1f0, 0)
				const ba = fn_13b3a8(s230, s1f0)
				const az = ld64(s230 + 8)
				const ay = ld64(s230)
				const aw = ld64(s2b8 + 0x30)
				copyr(s1f0, aw, 0x20)
				const ax = ld64(s2b8 + 0x38)
				copy(s1d0, ax, 0x20)
				db = fn_13b5c0(s240, ay, az, s1f0, ba)
				const bb = ld64(s240)
				st64(a + 0x10, ld64(s240 + 8))
				st64(a + 8, bb)
				st64(a, 0)
				return db
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1f0, 0x1001594b0, 0x1001594d0)
		}
		st64(s2b8 + 0x40, a)
		const s = ld64(b + 8)
		const t = __floatundidf(ld64(s) * 0xac)
		const u = fn_14f7f8(ld64(s + 8), t)
		const v = fn_151cb0(u, 0)
		const w = fn_14f3e8(u)
		const x = max((fn_151a40(u, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (v as i64) ? 0 : w, 1)
		let bd: AccountInfo = ld64(s270)
		let bj = ld64(s270 + 8)
		if (x > g) {
			const y: AccountInfo = ld64(s2b8 + 0x28)
			const z: LamportsCell = y.lamports
			rc_inc(z)
			const bc: DataCell = y.data
			rc_inc(bc)
			const be: LamportsCell = bd.lamports
			const bf = be.strong
			st64(s2b8 + 8, bd.key)
			st64(s2b8 + 0x10, y.executable)
			st64(s2b8 + 0x18, y.is_writable)
			st64(s2b8 + 0x20, y.is_signer)
			st64(s2b8 + 0x38, y.rent_epoch)
			const bi = y.owner
			rc_inc(be, bf)
			const bg: DataCell = bd.data
			const bh = bg.strong
			st64(s2b8 + 0x28, bi)
			rc_inc(bg, bh)
			st64(s2b8, sat_sub(x, g))
			const bk: AccountInfo = ld64(ld64(bj + 0x18))
			const bl: LamportsCell = bk.lamports
			const bm = bl.strong
			st64(s2f0 + 0x10, bd.executable)
			st64(s2f0 + 0x18, bd.is_writable)
			st64(s2f0 + 0x20, bd.is_signer)
			st64(s2f0 + 0x28, bd.rent_epoch)
			st64(s2c0, bd.owner)
			const bp = bk.key
			rc_inc(bl, bm)
			const bn: DataCell = bk.data
			const bo = bn.strong
			st64(s2f0, z, bp)
			rc_inc(bn, bo)
			st64(s2f8, bk.owner)
			const bt = bk.rent_epoch
			const bs = bk.is_signer
			const br = bk.is_writable
			const bq = bk.executable
			st8(sa0 + 0x22, ld64(s2f0 + 0x10))
			st8(sa0 + 0x21, ld64(s2f0 + 0x18))
			st8(sa0 + 0x20, ld64(s2f0 + 0x20))
			st64(sa0 + 0x18, ld64(s2f0 + 0x28))
			st64(sa0 + 0x10, ld64(s2c0))
			st64(sa0, be, bg)
			st64(se0 + 0x38, ld64(s2b8 + 8))
			st8(se0 + 0x32, ld64(s2b8 + 0x10))
			st8(se0 + 0x31, ld64(s2b8 + 0x18))
			st8(se0 + 0x30, ld64(s2b8 + 0x20))
			st64(se0 + 0x28, ld64(s2b8 + 0x38))
			st64(se0 + 0x20, ld64(s2b8 + 0x28))
			st64(se0 + 0x18, bc)
			st64(se0 + 0x10, ld64(s2f0))
			st64(se0 + 8, ld64(s2b8 + 0x30))
			st8(se0, bs, br, bq)
			st64(s100 + 0x18, bt)
			st64(s100 + 0x10, ld64(s2f8))
			st64(s100, bl, bn)
			st64(s120 + 0x18, ld64(s2f0 + 8))
			st64(s78, 8, 0)
			st64(s120, 0, 8, 0)
			db = fn_13d318(s200, s120, ld64(s2b8))
			av = ld64(s200)
			if (av != 2) {
				da = ld64(s200 + 8)
				cz = ld64(s2b8 + 0x40)
				st64(cz + 8, av, da)
				st64(cz, 0)
				return db
			}
			bd = ld64(s270)
			st64(s2b8 + 0x38, bd.key)
			bj = ld64(s270 + 8)
		}
		const bu: LamportsCell = bd.lamports
		rc_inc(bu)
		const bv: DataCell = bd.data
		rc_inc(bv)
		const bw: AccountInfo = ld64(ld64(bj + 0x18))
		const bx: LamportsCell = bw.lamports
		const by = bx.strong
		st64(s2b8 + 0x20, bd.executable)
		st64(s2b8 + 0x28, bd.is_writable)
		st64(s2b8 + 0x30, bd.is_signer)
		const cb = bd.rent_epoch
		const cc = bd.owner
		st64(s2b8 + 0x18, bw.key)
		rc_inc(bx, by)
		const bz: DataCell = bw.data
		const ca = bz.strong
		st64(s2c0, cb, cc, bv, bu)
		rc_inc(bz, ca)
		st64(s2f0 + 0x28, bw.owner)
		st64(s2f0 + 0x20, bw.rent_epoch)
		const ch = bw.is_signer
		const cg = bw.is_writable
		const cf = bw.executable
		const cd = ld64(ld64(ld64(bj + 0x20)))
		copyr(s68, cd, 0x20)
		const ce = ld16(ld64(bj + 0x28))
		st64(s2f0 + 0x18, ce)
		st16(s44, ce)
		const ci = ld8(ld64(bj + 0x30))
		st64(s20 + 0x10, s41)
		st64(s20, s44)
		st64(s38 + 8, s68)
		st64(s40, 0x100151ec0)
		st64(s138, s40)
		st64(s180 + 8, s138)
		st8(s180, ch, cg, cf)
		st64(s1a0 + 0x18, ld64(s2f0 + 0x20))
		st64(s1a0 + 0x10, ld64(s2f0 + 0x28))
		st64(s1a0, bx, bz)
		st64(s1b0 + 8, ld64(s2b8 + 0x18))
		st8(s1b0 + 2, ld64(s2b8 + 0x20))
		st8(s1b0 + 1, ld64(s2b8 + 0x28))
		st8(s1b0, ld64(s2b8 + 0x30))
		st64(s1b8, ld64(s2c0))
		st64(s1d0 + 0x10, ld64(s2b8))
		st64(s1d0 + 8, ld64(s2b8 + 8))
		st64(s1d0, ld64(s2b8 + 0x10))
		st64(s1d8, ld64(s2b8 + 0x38))
		st64(s2b8 + 0x38, ci)
		st8(s41, ci)
		st64(s20 + 0x18, 1)
		st64(s20 + 8, 2)
		st64(s38 + 0x10, 0x20)
		st64(s38, 8)
		st64(s138 + 8, 4)
		st64(s170, 1)
		st64(s1f0, 0, 8, 0)
		db = fn_13c8b8(s210, s1f0, 0x2c)
		av = ld64(s210)
		if (av != 2) {
			da = ld64(s210 + 8)
			cz = ld64(s2b8 + 0x40)
			st64(cz + 8, av, da)
			st64(cz, 0)
			return db
		}
		const cj: AccountInfo = ld64(s270)
		const ck: LamportsCell = cj.lamports
		const cr = cj.key
		rc_inc(ck)
		const cl: DataCell = cj.data
		rc_inc(cl)
		const cm: LamportsCell = bw.lamports
		const cn = cm.strong
		st64(s2b8 + 0x10, bw.key)
		st64(s2b8 + 0x18, cj.executable)
		st64(s2b8 + 0x20, cj.is_writable)
		st64(s2b8 + 0x28, cj.is_signer)
		st64(s2b8 + 0x30, cj.rent_epoch)
		const cq = cj.owner
		rc_inc(cm, cn)
		const co: DataCell = bw.data
		const cp = co.strong
		st64(s2c0, cq, cr, ck)
		rc_inc(co, cp)
		const cw = bw.owner
		const cv = bw.rent_epoch
		const cu = bw.is_signer
		const ct = bw.is_writable
		const cs = bw.executable
		copyr(s68, cd, 0x20)
		st16(s44, ld64(s2f0 + 0x18))
		st64(s20 + 0x10, s41)
		st64(s20, s44)
		st64(s38 + 8, s68)
		st64(s40, 0x100151ec0)
		st64(s138, s40)
		st8(s41, ld64(s2b8 + 0x38))
		st64(s20 + 0x18, 1)
		st64(s20 + 8, 2)
		st64(s38 + 0x10, 0x20)
		st64(s38, 8)
		st64(s138 + 8, 4)
		st64(s180 + 8, s138)
		st8(s180, cu, ct, cs)
		st64(s1a0, cm, co, cw, cv)
		st64(s1b0 + 8, ld64(s2b8 + 0x10))
		st8(s1b0 + 2, ld64(s2b8 + 0x18))
		st8(s1b0 + 1, ld64(s2b8 + 0x20))
		st8(s1b0, ld64(s2b8 + 0x28))
		st64(s1b8, ld64(s2b8 + 0x30))
		st64(s1d0 + 0x10, ld64(s2c0))
		st64(s1d0 + 8, cl)
		copyr(s1d8, s2b8, 0x10)
		st64(s170, 1)
		st64(s1f0, 0, 8, 0)
		db = fn_13cc48(s220, s1f0, ld64(ld64(ld64(s270 + 8) + 0x38)))
		av = ld64(s220)
		if (av != 2) {
			da = ld64(s220 + 8)
			cz = ld64(s2b8 + 0x40)
			st64(cz + 8, av, da)
			st64(cz, 0)
			return db
		}
	} else {
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0xac)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const ad = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		const m = ld64(s270 + 8)
		const n: AccountInfo = ld64(ld64(m + 0x10))
		const o: LamportsCell = n.lamports
		const aa = n.key
		const ae: AccountInfo = ld64(s270)
		rc_inc(o)
		st64(s2b8 + 0x38, aa)
		const ab: DataCell = n.data
		const ac = ab.strong
		st64(s2b8 + 0x30, ab)
		rc_inc(ab, ac)
		const af: LamportsCell = ae.lamports
		const ag = af.strong
		st64(s2b8, ae.key)
		st64(s2b8 + 8, n.executable)
		st64(s2b8 + 0x10, n.is_writable)
		st64(s2b8 + 0x18, n.is_signer)
		st64(s2b8 + 0x20, n.rent_epoch)
		st64(s2b8 + 0x28, n.owner)
		rc_inc(af, ag)
		const ah: DataCell = ae.data
		rc_inc(ah)
		const ai: AccountInfo = ld64(ld64(m + 0x18))
		const aj: LamportsCell = ai.lamports
		const ak = aj.strong
		st64(s2c0, o)
		st64(s2f0 + 8, ae.executable)
		st64(s2f0 + 0x10, ae.is_writable)
		st64(s2f0 + 0x18, ae.is_signer)
		st64(s2f0 + 0x20, ae.rent_epoch)
		st64(s2f0 + 0x28, ae.owner)
		const an = ai.key
		rc_inc(aj, ak)
		const al: DataCell = ai.data
		const am = al.strong
		st64(s2f8, an, ad)
		st64(s2b8 + 0x40, a)
		rc_inc(al, am)
		st64(s300, ai.owner)
		st64(s308, ai.rent_epoch)
		const au = ai.is_signer
		const at = ai.is_writable
		const ar = ai.executable
		const ao = ld64(s270 + 8)
		const ap = ld64(ld64(ld64(ao + 0x20)))
		copyr(s68, ap, 0x20)
		st16(s44, ld16(ld64(ao + 0x28)))
		const aq = ld8(ld64(ao + 0x30))
		st64(s20 + 0x10, s41)
		st64(s20, s44)
		st64(s38 + 8, s68)
		st64(s40, 0x100151ec0)
		st8(s41, aq)
		st64(s138, s40)
		st64(s170 + 0x28, s138)
		st8(s170 + 0x22, ld64(s2f0 + 8))
		st8(s170 + 0x21, ld64(s2f0 + 0x10))
		st8(s170 + 0x20, ld64(s2f0 + 0x18))
		st64(s170 + 0x18, ld64(s2f0 + 0x20))
		st64(s170 + 0x10, ld64(s2f0 + 0x28))
		st64(s170, af, ah)
		st64(s180 + 8, ld64(s2b8))
		st8(s180 + 2, ld64(s2b8 + 8))
		st8(s180 + 1, ld64(s2b8 + 0x10))
		st8(s180, ld64(s2b8 + 0x18))
		st64(s1a0 + 0x18, ld64(s2b8 + 0x20))
		st64(s1a0 + 0x10, ld64(s2b8 + 0x28))
		st64(s1a0 + 8, ld64(s2b8 + 0x30))
		st64(s1a0, ld64(s2c0))
		st64(s1b0 + 8, ld64(s2b8 + 0x38))
		st8(s1b0, au, at, ar)
		st64(s1b8, ld64(s308))
		st64(s1d0 + 0x10, ld64(s300))
		st64(s1d0, aj, al)
		st64(s1d8, ld64(s2f8))
		st64(s20 + 0x18, 1)
		st64(s20 + 8, 2)
		st64(s38 + 0x10, 0x20)
		st64(s38, 8)
		st64(s138 + 8, 4)
		st64(s170 + 0x30, 1)
		st64(s1f0, 0, 8, 0)
		db = fn_13cfd8(s250, s1f0, ld64(s2f0), 0x2c, ld64(ld64(ao + 0x38)))
		av = ld64(s250)
		if (av != 2) {
			da = ld64(s250 + 8)
			cz = ld64(s2b8 + 0x40)
			st64(cz + 8, av, da)
			st64(cz, 0)
			return db
		}
	}
	const cx = ld64(s2b8 + 0x40)
	fn_5220(s1f0, ld64(s270))
	if (ld64(s1f0) == 0) {
		db = Error_with_account_name(s260, ld64(s1e8), ld64(s1e8 + 8), "fee_tier", 8)
		const cy = ld64(s260)
		st64(cx + 0x10, ld64(s260 + 8))
		st64(cx + 8, cy)
		st64(cx, 0)
		return db
	}
	return memcpy(cx, s1f0, 0x30)
}

export function fn_5220(a: u64, b: u64) {
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
			fn_103878(s60, s20, 0x800000000000001a /* Ok */)
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

export function fn_103878(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20, s30 = fp - 0x30
	const f = ld64(b + 8)
	if (7 >= f) {
		fn_14c4f0(8, f, 0x10015a840, d, e)
	}
	if (f - 8 >= 0x20) {
		const g = ld64(b)
		const h = ld64(g + 0xe)
		st8(s20 + 8, ld8(g + 0x16))
		st64(s20, h)
		if ((f & -2) != 0x28 && (f & -2) != 0x2a) {
			const k = ld64(s20 + 1)
			const m = ld16(g + 0x28)
			const l = ld16(g + 0x2a)
			const i = ld32(g + 8)
			st32(s20 + 0x18, i)
			const j = ld16(g + 0xc)
			st16(s20 + 0x1c, j)
			copy(s20, g + 0x17, 0x10)
			st8(s20 + 0x10, ld8(g + 0x27))
			st64(a + 9, k)
			st8(a + 8, h)
			st16(a + 6, j)
			st32(a + 2, i)
			st8(a + 0x21, ld8(s20 + 0x10))
			st64(a + 0x19, ld64(s20 + 8))
			st64(a + 0x11, ld64(s20))
			st16(a + 0x24, l)
			st16(a + 0x22, m)
			st16(a, 0)
			return
		}
	}
	const n = fn_1459d0(0x100159468)
	anchor_error_from(s30, 0xbbb /* anchor::AccountDidNotDeserialize */)
	const p = ld64(s30 + 8)
	const q = ld64(s30)
	if (2 > (n & 3) - 2) {
		st64(a + 0x10, p)
		st64(a + 8, q)
		st16(a, 1)
	} else if ((n & 3) == 0) {
		st64(a + 0x10, p)
		st64(a + 8, q)
		st16(a, 1)
	} else {
		const o = ld64(ld64(n + 7))
		callx(o, ld64(n - 1), o)
		st64(a + 0x10, p)
		st64(a + 8, q)
		st16(a, 1)
	}
}
