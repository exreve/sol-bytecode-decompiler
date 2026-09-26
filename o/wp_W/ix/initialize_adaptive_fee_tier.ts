/// <reference path="../lib.d.ts" />
// instruction initialize_adaptive_fee_tier
import { fn_143100, fn_149678, fn_14c4f0, fn_14f7f8, fn_5f98, memcpy } from '../shared.ts'

// instruction handler: initialize_adaptive_fee_tier (discriminator sha256("global:initialize_adaptive_fee_tier")[..8] = 0x30757b8dc8d0634d)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, funder, adaptive_fee_tier, fee_authority, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: adaptive_fee_tier
export function ix_initialize_adaptive_fee_tier(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s11 = fp - 0x11, s20 = fp - 0x20, s31 = fp - 0x31, s40 = fp - 0x40, s58 = fp - 0x58, se8 = fp - 0xe8, s100 = fp - 0x100, s188 = fp - 0x188, s190 = fp - 0x190, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1b1 = fp - 0x1b1, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s1000 = fp - 0x1000
	let n, s: u64
	sol_log("Instruction: InitializeAdaptiveFeeTier", 0x26)
	const f = ix_args_len
	if (f >= 2 && ((f & -2) != 2 && f - 4 >= 0x20)) {
		const g = ix_args
		const i = ld16(g)
		const o = ld16(g + 2)
		const h = ld64(g + 0xa)
		st8(s100 + 8, ld8(g + 0x12))
		st64(s100, h)
		if (f - 0x24 >= 0x20) {
			let ag = ld64(s100 + 1)
			const j = ld64(g + 0x2a)
			st8(s100 + 8, ld8(g + 0x32))
			st64(s100, j)
			if ((f & -2) != 0x44 && ((f & -2) != 0x46 && ((f & -2) != 0x48 && ((f & -2) != 0x4a && ((f & -4) != 0x4c && ((f & -4) != 0x50 && ((f & -2) != 0x54 && (f & -2) != 0x56))))))) {
				const af = ld64(s100 + 1)
				const aa = ld16(g + 0x44)
				const z = ld16(g + 0x46)
				const y = ld16(g + 0x48)
				const x = ld16(g + 0x4a)
				const w = ld32(g + 0x4c)
				const v = ld32(g + 0x50)
				const u = ld16(g + 0x54)
				const t = ld16(g + 0x56)
				const ad = ld16(g + 8)
				const ac = ld32(g + 4)
				st8(s58 + 0x10, ld8(g + 0x23))
				copyr(s58, g + 0x13, 0x10)
				st16(se8 + 0x8c, ld16(g + 0x28))
				st32(se8 + 0x88, ld32(g + 0x24))
				const ae = ld8(g + 0x43)
				const ab = ld64(g + 0x33)
				const k = ld64(g + 0x3b)
				st32(s40, ac)
				st16(s40 + 4, ad)
				st8(s40 + 6, h)
				st64(s40 + 7, ag)
				st64(s11, ab, k)
				st8(s11 + 0x10, ae)
				copy(s31, s58, 0x10)
				st8(s31 + 0x10, ld8(s58 + 0x10))
				st32(s20, ld32(se8 + 0x88))
				st16(s20 + 4, ld16(se8 + 0x8c))
				st64(s20 + 7, af)
				st8(s20 + 6, j)
				st8(s1b1, 0xff)
				st64(s1b0, accounts, accounts_len)
				st64(s1000, f, s1b1)
				s = accounts_initialize_adaptive_fee_tier(s100, program_id, s1b0, g, fp)
				const m = ld64(s100 + 0x10)
				n = ld64(s100 + 8)
				const l = ld64(s100)
				ag = l
				if (l == 0) {
					st64(a + 8, m)
					st64(a, n)
					return s
				}
				memcpy(s188, se8, 0x88)
				st64(s1a0, ag, n, m)
				st64(s1000, o, s40, s20, aa, z, y, x, w, v, u, t)
				s = fn_590d8(s1c8, s190, ag, i, o, s40, s20, aa, z, y, x, w, v, u, t)
				n = ld64(s1c8)
				if (n == 2) {
					s = fn_5f98(s1d8, s198, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
					const p = ld64(s1d8)
					if (p != 2) {
						s = Error_with_account_name(s1e8, p, ld64(s1d8 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
						n = ld64(s1e8)
						st64(a + 8, ld64(s1e8 + 8))
						st64(a, n)
						return s
					}
					st64(a + 8, m)
					st64(a, 2)
					return s
				}
				st64(a + 8, ld64(s1c8 + 8))
				st64(a, n)
				return s
			}
		}
	}
	const q = fn_1459d0(0x100159468)
	if (2 > (q & 3) - 2) {
		s = anchor_error_from(s1f8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		n = ld64(s1f8)
		st64(a + 8, ld64(s1f8 + 8))
		st64(a, n)
		return s
	}
	if ((q & 3) == 0) {
		s = anchor_error_from(s1f8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		n = ld64(s1f8)
		st64(a + 8, ld64(s1f8 + 8))
		st64(a, n)
		return s
	}
	const r = ld64(ld64(q + 7))
	callx(r, ld64(q - 1), r)
	s = anchor_error_from(s1f8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	n = ld64(s1f8)
	st64(a + 8, ld64(s1f8 + 8))
	st64(a, n)
	return s
}

// Anchor Accounts::try_accounts of instruction initialize_adaptive_fee_tier (called by ix_initialize_adaptive_fee_tier; name [str]: from the handler's "Instruction: …" log; was fn_f5598)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, funder (ConstraintMut), adaptive_fee_tier (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), fee_authority (ConstraintAddress), system_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: adaptive_fee_tier, funder
export function accounts_initialize_adaptive_fee_tier(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s88 = fp - 0x88, sc8 = fp - 0xc8, s128 = fp - 0x128, s130 = fp - 0x130, s140 = fp - 0x140, s148 = fp - 0x148, s14a = fp - 0x14a, s14b = fp - 0x14b, s170 = fp - 0x170, s188 = fp - 0x188, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, s1b0 = fp - 0x1b0, s1b8 = fp - 0x1b8, s1ba = fp - 0x1ba, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s320 = fp - 0x320, s328 = fp - 0x328, s330 = fp - 0x330, s338 = fp - 0x338
	let r, s: u64
	st64(s1c8, b)
	if (2 > ld64(e - 0x1000)) {
		const h = fn_1459d0(0x100159468)
		if (2 > (h & 3) - 2) {
			s = anchor_error_from(s308, 0x66 /* anchor::InstructionDidNotDeserialize */)
			r = ld64(s308)
			st64(a + 0x10, ld64(s308 + 8))
			st64(a + 8, r)
			st64(a, 0)
			return s
		}
		if ((h & 3) == 0) {
			s = anchor_error_from(s308, 0x66 /* anchor::InstructionDidNotDeserialize */)
			r = ld64(s308)
			st64(a + 0x10, ld64(s308 + 8))
			st64(a + 8, r)
			st64(a, 0)
			return s
		}
		const i = ld64(ld64(h + 7))
		callx(i, ld64(h - 1), i)
		s = anchor_error_from(s308, 0x66 /* anchor::InstructionDidNotDeserialize */)
		r = ld64(s308)
		st64(a + 0x10, ld64(s308 + 8))
		st64(a + 8, r)
		st64(a, 0)
		return s
	}
	const v = ld64(e - 0xff8)
	st16(s1ba, ld16(d))
	try_accounts_11de0(s148, c, c, d, e)
	if (ld64(s148) == 0) {
		s = Error_with_account_name(s2f8, ld64(s140), ld64(s140 + 8), "whirlpools_config", 0x11)
		r = ld64(s2f8)
		st64(a + 0x10, ld64(s2f8 + 8))
		st64(a + 8, r)
		st64(a, 0)
		return s
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x70) & -8 : 0x300007f90
	if (g > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, s148, 0x70)
		const j = ld64(c + 8)
		if (j == 0) {
			s = anchor_error_from(s2e8, 0xbbd /* anchor::AccountNotEnoughKeys */)
			r = ld64(s2e8)
			st64(a + 0x10, ld64(s2e8 + 8))
			st64(a + 8, r)
			st64(a, 0)
			return s
		}
		const k: AccountInfo = ld64(c)
		st64(s1b8, k)
		st64(c + 8, j - 1)
		st64(c, k + 0x30)
		try_accounts_11718(s148, c)
		const m = ld64(s140)
		const l = ld64(s148)
		if (l != 2) {
			s = Error_with_account_name(s1d8, l, m, "funder", 6)
			r = ld64(s1d8)
			st64(a + 0x10, ld64(s1d8 + 8))
			st64(a + 8, r)
			st64(a, 0)
			return s
		}
		st64(s1b0, m)
		try_accounts_11718(s148, c, m)
		const o = ld64(s140)
		const n = ld64(s148)
		if (n == 2) {
			st64(s320 + 0x10, o)
			fn_122e8(s148, c, o)
			const q = ld64(s140)
			const p = ld64(s148)
			if (p == 2) {
				st64(s1a8, q)
				rent_get(s148)
				copy(s188, s140, 0x18)
				if (ld64(s148) == 0) {
					copyr(s1a0, s188, 0x18)
					const t = ld64(ld64(g))
					copyr(s20, t, 0x20)
					st64(s148, 0x100151ec0)
					st64(s140 + 8, s20)
					st64(s128, s14a)
					st16(s14a, ld16(s1ba))
					st64(s140, 8)
					st64(s130, 0x20)
					st64(s128 + 8, 2)
					// PDA find_program_address(["fee_tier", *t, u16 ld16(s1ba) [ix data?]], program *(ld64(s1c8)))
					Pubkey_find_program_address(sc8, s148, 3, ld64(s1c8))
					copyr(s170, sc8, 0x20)
					const u = ld8(sc8 + 0x20)
					st8(s14b, u)
					st8(v, u)
					const w = ld64(ld64(s1b8))
					copy(s148, w, 0x20)
					if ((memcmp(s148, s170, 0x20) as u32) == 0) {
						st64(sc8, s1b8, s1a0, s1b0, s1a8, g, s1ba, s14b, s1c8)
						s = fn_f67b8(s148, sc8)
						const ag = ld64(s140 + 8)
						r = ld64(s140)
						const ae = ld64(s148)
						if (ae == 0) {
							st64(a + 0x10, ag)
							st64(a + 8, r)
							st64(a, 0)
							return s
						}
						st64(s320, r, ae)
						memcpy(s88, s130, 0x68)
						const adaptive_fee_tier: AccountInfo = ld64(s320 + 8)
						if (adaptive_fee_tier.is_writable == 0) {
							anchor_error_from(s2c8, 0x7d0 /* anchor::ConstraintMut */)
							s = Error_with_account_name(s2d8, ld64(s2c8), ld64(s2c8 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
							r = ld64(s2d8)
							st64(a + 0x10, ld64(s2d8 + 8))
							st64(a + 8, r)
							st64(a, 0)
							return s
						}
						st64(s330, ag)
						AccountInfo_clone(sc8, adaptive_fee_tier)
						st64(s328, fn_143100(sc8))
						AccountInfo_clone(s148, adaptive_fee_tier)
						AccountInfo_try_data_len(s20, s148)
						const ai = ld64(s20 + 8)
						const ah = ld64(s20)
						if (ah != 0x800000000000001a /* Ok */) {
							st64(s20 + 0x10, ld64(s20 + 0x10))
							st64(s20, ah, ai)
							s = fn_13b430(s248, s20)
							const av = ld64(s248)
							st64(a + 0x10, ld64(s248 + 8))
							st64(a + 8, av)
							st64(a, 0)
							const ax = ld64(s140 + 8)
							const aw = ld64(s140)
							rc_dec(aw)
							rc_dec(ax)
							const az = ld64(sc8 + 0x10)
							const ay = ld64(sc8 + 8)
							rc_dec(ay)
							if (!rc_release(az)) {
								return s
							}
							st64(az + 8, ld64(az + 8) - 1)
							return s
						}
						const aj = __floatundidf(ld64(s1a0) * (ai + 0x80))
						const ak = fn_14f7f8(ld64(s1a0 + 8), aj)
						st64(s338, fn_151cb0(ak, 0))
						const al = fn_14f3e8(ak)
						const am = 0 > (ld64(s338) as i64) ? 0 : al
						const au = (fn_151a40(ak, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : am
						const ao = ld64(s140 + 8)
						const an = ld64(s140)
						rc_dec(an)
						rc_dec(ao)
						const ar = ld64(sc8 + 0x10)
						const ap = ld64(sc8 + 8)
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
						if (au > ld64(s328)) {
							anchor_error_from(s2a8, 0x7d5 /* anchor::ConstraintRentExempt */, at, aq)
							s = Error_with_account_name(s2b8, ld64(s2a8), ld64(s2a8 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
							r = ld64(s2b8)
							st64(a + 0x10, ld64(s2b8 + 8))
							st64(a + 8, r)
							st64(a, 0)
							return s
						}
						const funder: AccountInfo = ld64(s1b0)
						if (funder.is_writable != 0) {
							const bb = ld64(s320 + 0x10)
							const bc = ld64(bb)
							copyr(s20, bc, 0x20)
							copyr(sc8, g + 8, 0x20)
							if ((memcmp(s20, sc8, 0x20) as u32) != 0) {
								anchor_error_from(s258, 0x7dc /* anchor::ConstraintAddress */)
								const bf = Error_with_account_name(s268, ld64(s258), ld64(s258 + 8), "fee_authority", 0xd)
								const be = ld64(s268 + 8)
								const bd = ld64(s268)
								copyr(s148, s20, 0x20)
								copy(s128, sc8, 0x20)
								s = fn_13b5c0(s278, bd, be, s148, bf)
								r = ld64(s278)
								st64(a + 0x10, ld64(s278 + 8))
								st64(a + 8, r)
								st64(a, 0)
								return s
							}
							st64(s328, ld64(s1a8))
							s = memcpy(a + 0x20, s88, 0x68)
							st64(a + 0x98, ld64(s328))
							st64(a + 0x90, bb)
							st64(a + 0x88, funder)
							st64(a + 0x18, ld64(s330))
							st64(a + 0x10, ld64(s320))
							st64(a + 8, ld64(s320 + 8))
							st64(a, g)
							return s
						}
						anchor_error_from(s288, 0x7d0 /* anchor::ConstraintMut */, at, aq)
						s = Error_with_account_name(s298, ld64(s288), ld64(s288 + 8), "funder", 6)
						r = ld64(s298)
						st64(a + 0x10, ld64(s298 + 8))
						st64(a + 8, r)
						st64(a, 0)
						return s
					}
					anchor_error_from(s218, 0x7d6 /* anchor::ConstraintSeeds */)
					Error_with_account_name(s228, ld64(s218), ld64(s218 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
					const ad = ld64(s228 + 8)
					const ac = ld64(s228)
					const x = ld64(ld64(s1b8))
					const ab = ld64(x + 0x18)
					const aa = ld64(x + 0x10)
					const z = ld64(x + 8)
					const y = ld64(x)
					copy(s128, s170, 0x20)
					st64(s148, y, z, aa, ab)
					s = fn_13b5c0(s238, ac, ad, s148, z)
					r = ld64(s238)
					st64(a + 0x10, ld64(s238 + 8))
					st64(a + 8, r)
					st64(a, 0)
					return s
				}
				s = fn_13b430(s208, s188)
				r = ld64(s208)
				st64(a + 0x10, ld64(s208 + 8))
				st64(a + 8, r)
				st64(a, 0)
				return s
			}
			s = Error_with_account_name(s1f8, p, q, "system_program", 0xe)
			r = ld64(s1f8)
			st64(a + 0x10, ld64(s1f8 + 8))
			st64(a + 8, r)
			st64(a, 0)
			return s
		}
		s = Error_with_account_name(s1e8, n, o, "fee_authority", 0xd)
		r = ld64(s1e8)
		st64(a + 0x10, ld64(s1e8 + 8))
		st64(a + 8, r)
		st64(a, 0)
		return s
	}
	alloc_handle_alloc_error(8, 0x70)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: adaptive_fee_tier
export function fn_f67b8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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
				st64(s1e8, 0x100155091)
				st32(s170 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s1a0, 2)
				st32(s1d8, 4)
				st64(s1e8 + 8, 0x50)
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
		const t = __floatundidf(ld64(s) * 0x180)
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
		db = fn_13c8b8(s210, s1f0, 0x100)
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
		const i = __floatundidf(ld64(h) * 0x180)
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
		db = fn_13cfd8(s250, s1f0, ld64(s2f0), 0x100, ld64(ld64(ao + 0x38)))
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
	fn_2a00(s1f0, ld64(s270))
	if (ld64(s1f0) == 0) {
		db = Error_with_account_name(s260, ld64(s1e8), ld64(s1e8 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
		const cy = ld64(s260)
		st64(cx + 0x10, ld64(s260 + 8))
		st64(cx + 8, cy)
		st64(cx, 0)
		return db
	}
	return memcpy(cx, s1f0, 0x80)
}

export function fn_2a00(a: u64, b: u64) {
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
			fn_101e30(s80, sf8, 0x800000000000001a /* Ok */)
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

export function fn_101e30(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20
	const f = ld64(b + 8)
	if (7 >= f) {
		fn_14c4f0(8, f, 0x10015a7f8, d, e)
	}
	if (f - 8 >= 0x20) {
		const g = ld64(b)
		const h = ld64(g + 0xe)
		st8(s20 + 0x18, ld8(g + 0x16))
		st64(s20 + 0x10, h)
		if ((f & -2) != 0x28 && ((f & -2) != 0x2a && f - 0x2c >= 0x20)) {
			const l = ld64(s20 + 0x11)
			const j = ld16(g + 0x28)
			const n = ld16(g + 0x2a)
			const i = ld64(g + 0x32)
			st8(s20 + 0x18, ld8(g + 0x3a))
			st64(s20 + 0x10, i)
			if (f - 0x4c >= 0x20) {
				const ac = ld64(s20 + 0x11)
				const k = ld64(g + 0x52)
				st8(s20 + 0x18, ld8(g + 0x5a))
				st64(s20 + 0x10, k)
				if ((f & -2) != 0x6c && ((f & -2) != 0x6e && ((f & -2) != 0x70 && ((f & -2) != 0x72 && ((f & -4) != 0x74 && ((f & -4) != 0x78 && ((f & -2) != 0x7c && (f & -2) != 0x7e))))))) {
					const x = ld64(s20 + 0x11)
					const ab = ld16(g + 0x6c)
					const z = ld16(g + 0x6e)
					const y = ld16(g + 0x70)
					const w = ld16(g + 0x72)
					const aa = ld32(g + 0x74)
					const v = ld16(g + 0x7e)
					const u = ld16(g + 0x7c)
					const t = ld32(g + 0x78)
					const s = ld32(g + 8)
					const m = ld16(g + 0xc)
					st8(a + 0x23, ld8(g + 0x27))
					st64(a + 0x1b, ld64(g + 0x1f))
					st64(a + 0x13, ld64(g + 0x17))
					st16(a + 0x28, ld16(g + 0x30))
					st32(a + 0x24, ld32(g + 0x2c))
					st8(a + 0x43, ld8(g + 0x4b))
					st64(a + 0x3b, ld64(g + 0x43))
					st64(a + 0x33, ld64(g + 0x3b))
					st32(a + 0x44, ld32(g + 0x4c))
					st16(a + 0x48, ld16(g + 0x50))
					copy(a + 0x53, g + 0x5b, 0x10)
					st8(a + 0x63, ld8(g + 0x6b))
					st64(a + 0xb, l)
					st8(a + 0xa, h)
					st16(a + 8, m)
					st32(a + 4, s)
					st64(a + 0x2b, ac)
					st64(a + 0x4b, x)
					st32(a + 0x68, t)
					st16(a + 0x78, u, v)
					st16(a + 0x76, w)
					st16(a + 0x74, y)
					st16(a + 0x72, z)
					st16(a + 0x70, ab)
					st16(a + 0x6e, n)
					st16(a + 0x6c, j)
					st32(a + 0x64, aa)
					st8(a + 0x4a, k)
					st8(a + 0x2a, i)
					st32(a, 0)
					return
				}
			}
		}
	}
	const o = fn_1459d0(0x100159468)
	anchor_error_from(s20, 0xbbb /* anchor::AccountDidNotDeserialize */)
	const q = ld64(s20 + 8)
	const r = ld64(s20)
	if (2 > (o & 3) - 2) {
		st64(a + 0x10, q)
		st64(a + 8, r)
		st32(a, 1)
	} else if ((o & 3) == 0) {
		st64(a + 0x10, q)
		st64(a + 8, r)
		st32(a, 1)
	} else {
		const p = ld64(ld64(o + 7))
		callx(p, ld64(o - 1), p)
		st64(a + 0x10, q)
		st64(a + 8, r)
		st32(a, 1)
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (points to it), p7 (points to it), p8 (value), p9 (value), p10 (value), p11 (value), p12 (value), p13 (value), p14 (value), p15 (value)
export function fn_590d8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64, p13: u64, p14: u64, p15: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s80 = fp - 0x80, s88 = fp - 0x88
	let p, u, w: u64
	let g = a
	const f = p5
	if ((d as u16) == (f as u16)) {
		p = fn_87630(s40, 0x3e)
		w = ld64(s40)
		st64(g + 8, ld64(s40 + 8))
		st64(g, w)
		return p
	}
	if ((f as u16) == 0) {
		p = fn_87630(s30, 4)
		w = ld64(s30)
		st64(g + 8, ld64(s30 + 8))
		st64(g, w)
		return p
	}
	st64(s80, p15, p11, p13, p12, p10, p9, p14, g)
	const m = p8
	const o = p7
	const n = p6
	const h = ld64(ld64(c))
	const l = ld64(h)
	const k = ld64(h + 8)
	const j = ld64(h + 0x10)
	const i = ld64(h + 0x18)
	st16(b + 0x68, d, f)
	st64(b + 0x18, i)
	st64(b + 0x10, j)
	st64(b + 8, k)
	st64(b, l)
	if ((m as u16) > 0xea60) {
		st64(s88, b)
		p = fn_87630(s10, 0x1c)
		b = ld64(s88)
		u = ld64(s10 + 8)
		w = ld64(s10)
		g = ld64(s80 + 0x38)
		if (w != 2) {
			st64(g + 8, u)
			st64(g, w)
			return p
		}
	} else {
		st16(b + 0x6c, m)
		g = ld64(s80 + 0x38)
	}
	st64(b + 0x38, ld64(n + 0x18))
	st64(b + 0x30, ld64(n + 0x10))
	st64(b + 0x28, ld64(n + 8))
	st64(b + 0x20, ld64(n))
	copy(b + 0x40, o, 0x20)
	p = ld64(s80 + 0x28)
	const q = p
	const r = ld64(s80 + 0x30)
	if ((p as u16) != 0 && ((ld64(s80 + 0x20) as u16) > (q as u16) && 0x1869f >= (ld64(s80 + 0x18) as u32))) {
		const s = ((ld64(s80 + 0x10) as u32) * (r as u16) >> 0x20) != 0
		if ((f as u16) > ((r - 1) as u16) && (0x270f >= (ld64(s80 + 8) as u16) && ((s & 1) == 0 && (f as u16) % (r as u16) == 0))) {
			const t = ld64(s80)
			if ((t as u16) != 0 && (f as u16) * 0x58 >= (t as u16)) {
				st16(b + 0x72, ld64(s80 + 8))
				st16(b + 0x70, ld64(s80 + 0x20))
				st16(b + 0x6e, p)
				st16(b + 0x76, ld64(s80))
				st16(b + 0x74, r)
				st32(b + 0x64, ld64(s80 + 0x10))
				u = ld64(s80 + 0x18)
				st32(b + 0x60, u)
				st64(g + 8, u)
				st64(g, 2)
				return p
			}
		}
	}
	p = fn_87630(s20, 0x3d)
	u = undef
	const v = ld64(s20)
	if (v == 2) {
		st64(g + 8, u)
		st64(g, 2)
		return p
	}
	st64(g + 8, ld64(s20 + 8))
	st64(g, v)
	return p
}
