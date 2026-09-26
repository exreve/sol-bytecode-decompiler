/// <reference path="../lib.d.ts" />
// instruction initialize_config_extension
import { fn_143100, fn_149678, fn_14c4f0, fn_14f7f8, fn_7598, memcpy } from '../shared.ts'

// instruction handler: initialize_config_extension (discriminator sha256("global:initialize_config_extension")[..8] = 0x34d1397209350937)
// accounts [str: the program's account-error strings, in order of first use]: config, funder, config_extension, fee_authority, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: config_extension
export function ix_initialize_config_extension(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s20 = fp - 0x20, s90 = fp - 0x90, sa8 = fp - 0xa8, se0 = fp - 0xe0, s100 = fp - 0x100, s118 = fp - 0x118, s120 = fp - 0x120, s128 = fp - 0x128, s130 = fp - 0x130, s140 = fp - 0x140, s141 = fp - 0x141, s158 = fp - 0x158, s168 = fp - 0x168, sff8 = fp - 0xff8
	sol_log("Instruction: InitializeConfigExtension", 0x26)
	st8(s141, 0xff)
	st64(s140, accounts, accounts_len)
	st64(sff8, s141)
	let n = accounts_initialize_config_extension(sa8, program_id, s140, undef, fp)
	let g = ld64(sa8 + 8)
	const f = ld64(sa8)
	if (f == 0) {
		st64(a + 8, ld64(sa8 + 0x10))
		st64(a, g)
		return n
	}
	memcpy(s118, s90, 0x70)
	st64(s130, f, g)
	const i = ld64(ld64(f))
	const h = ld64(ld64(se0 + 0x28))
	copy(s20, h, 0x20)
	const l = ld64(i)
	const k = ld64(i + 8)
	const j = ld64(i + 0x10)
	st64(s118 + 0x10, ld64(i + 0x18))
	st64(s120, l, k, j)
	copy(s100, s20, 0x20)
	copy(se0, s20, 0x20)
	n = fn_7598(s158, s128, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
	const m = ld64(s158)
	if (m != 2) {
		n = Error_with_account_name(s168, m, ld64(s158 + 8), "config_extension", 0x10)
		g = ld64(s168)
		st64(a + 8, ld64(s168 + 8))
		st64(a, g)
		return n
	}
	st64(a + 8, undef)
	st64(a, 2)
	return n
}

// Anchor Accounts::try_accounts of instruction initialize_config_extension (called by ix_initialize_config_extension; name [str]: from the handler's "Instruction: …" log; was fn_eadb0)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: config, funder (ConstraintMut), config_extension (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), fee_authority (ConstraintAddress), system_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: config_extension, funder
export function accounts_initialize_config_extension(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s50 = fp - 0x50, s58 = fp - 0x58, s68 = fp - 0x68, s70 = fp - 0x70, s90 = fp - 0x90, se0 = fp - 0xe0, s118 = fp - 0x118, s119 = fp - 0x119, s140 = fp - 0x140, s158 = fp - 0x158, s170 = fp - 0x170, s178 = fp - 0x178, s180 = fp - 0x180, s188 = fp - 0x188, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d8 = fp - 0x2d8, s2e0 = fp - 0x2e0, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0
	let p, q: u64
	st64(s190, b)
	try_accounts_11de0(s70, c, c, d, e)
	if (ld64(s70) == 0) {
		q = Error_with_account_name(s2c0, ld64(s68), ld64(s68 + 8), 0x100154883 /* "config" */, 6)
		p = ld64(s2c0)
		st64(a + 0x10, ld64(s2c0 + 8))
		st64(a + 8, p)
		st64(a, 0)
		return q
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x70) & -8 : 0x300007f90
	if (g > 0x300000007) {
		const x = ld64(e - 0xff8)
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, s70, 0x70)
		const h = ld64(c + 8)
		if (h == 0) {
			q = anchor_error_from(s2b0, 0xbbd /* anchor::AccountNotEnoughKeys */)
			p = ld64(s2b0)
			st64(a + 0x10, ld64(s2b0 + 8))
			st64(a + 8, p)
			st64(a, 0)
			return q
		}
		const i: AccountInfo = ld64(c)
		st64(s188, i)
		st64(c + 8, h - 1)
		st64(c, i + 0x30)
		try_accounts_11718(s70, c)
		const k = ld64(s68)
		const j = ld64(s70)
		if (j != 2) {
			q = Error_with_account_name(s1a0, j, k, "funder", 6)
			p = ld64(s1a0)
			st64(a + 0x10, ld64(s1a0 + 8))
			st64(a + 8, p)
			st64(a, 0)
			return q
		}
		st64(s180, k)
		try_accounts_11718(s70, c, k)
		const m = ld64(s68)
		const l = ld64(s70)
		if (l == 2) {
			st64(s2d8 + 0x10, m)
			fn_122e8(s70, c, m)
			const o = ld64(s68)
			const n = ld64(s70)
			if (n == 2) {
				st64(s178, o)
				rent_get(s70)
				copy(s158, s68, 0x18)
				if (ld64(s70) == 0) {
					copyr(s170, s158, 0x18)
					const r = ld64(ld64(g))
					const v = ld64(r)
					const u = ld64(r + 8)
					const t = ld64(r + 0x10)
					const s = ld64(r + 0x18)
					st64(s90, 0x1001531e0)
					st64(s90 + 0x10, s118)
					st64(s118, v, u, t, s)
					st64(s90 + 8, 0x10)
					st64(s90 + 0x18, 0x20)
					// PDA find_program_address(["config_extension", *s118], program *(ld64(s190)))
					Pubkey_find_program_address(s70, s90, 2, ld64(s190))
					copyr(s140, s70, 0x20)
					const w = ld8(s50)
					st8(s119, w)
					st8(x, w)
					const y = ld64(ld64(s188))
					copy(s70, y, 0x20)
					if ((memcmp(s70, s140, 0x20) as u32) == 0) {
						st64(s118, s188, s170, s180, s178, g, s119, s190)
						q = fn_ebed0(s70, s118)
						const ai = ld64(s68 + 8)
						p = ld64(s68)
						const ag = ld64(s70)
						if (ag == 0) {
							st64(a + 0x10, ai)
							st64(a + 8, p)
							st64(a, 0)
							return q
						}
						st64(s2d8, p, ag)
						memcpy(se0, s58, 0x50)
						const config_extension: AccountInfo = ld64(s2d8 + 8)
						if (config_extension.is_writable == 0) {
							anchor_error_from(s290, 0x7d0 /* anchor::ConstraintMut */)
							q = Error_with_account_name(s2a0, ld64(s290), ld64(s290 + 8), "config_extension", 0x10)
							p = ld64(s2a0)
							st64(a + 0x10, ld64(s2a0 + 8))
							st64(a + 8, p)
							st64(a, 0)
							return q
						}
						st64(s2e8, ai)
						AccountInfo_clone(s118, config_extension)
						st64(s2e0, fn_143100(s118))
						AccountInfo_clone(s70, config_extension)
						AccountInfo_try_data_len(s90, s70)
						const ak = ld64(s90 + 8)
						const aj = ld64(s90)
						if (aj != 0x800000000000001a /* Ok */) {
							st64(s90 + 0x10, ld64(s90 + 0x10))
							st64(s90, aj, ak)
							q = fn_13b430(s210, s90)
							const ax = ld64(s210)
							st64(a + 0x10, ld64(s210 + 8))
							st64(a + 8, ax)
							st64(a, 0)
							const az = ld64(s68 + 8)
							const ay = ld64(s68)
							rc_dec(ay)
							rc_dec(az)
							const bb = ld64(s118 + 0x10)
							const ba = ld64(s118 + 8)
							rc_dec(ba)
							if (!rc_release(bb)) {
								return q
							}
							st64(bb + 8, ld64(bb + 8) - 1)
							return q
						}
						const al = __floatundidf(ld64(s170) * (ak + 0x80))
						const am = fn_14f7f8(ld64(s170 + 8), al)
						st64(s2f0, fn_151cb0(am, 0))
						const an = fn_14f3e8(am)
						const ao = 0 > (ld64(s2f0) as i64) ? 0 : an
						const aw = (fn_151a40(am, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : ao
						const aq = ld64(s68 + 8)
						const ap = ld64(s68)
						rc_dec(ap)
						rc_dec(aq)
						const au = ld64(s118 + 0x10)
						const ar = ld64(s118 + 8)
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
						if (aw > ld64(s2e0)) {
							anchor_error_from(s270, 0x7d5 /* anchor::ConstraintRentExempt */, av, at)
							q = Error_with_account_name(s280, ld64(s270), ld64(s270 + 8), "config_extension", 0x10)
							p = ld64(s280)
							st64(a + 0x10, ld64(s280 + 8))
							st64(a + 8, p)
							st64(a, 0)
							return q
						}
						const funder: AccountInfo = ld64(s180)
						if (funder.is_writable != 0) {
							const bd = ld64(s2d8 + 0x10)
							const be = ld64(bd)
							copyr(s90, be, 0x20)
							copyr(s118, g + 8, 0x20)
							if ((memcmp(s90, s118, 0x20) as u32) != 0) {
								anchor_error_from(s220, 0x7dc /* anchor::ConstraintAddress */)
								const bh = Error_with_account_name(s230, ld64(s220), ld64(s220 + 8), "fee_authority", 0xd)
								const bg = ld64(s230 + 8)
								const bf = ld64(s230)
								copyr(s70, s90, 0x20)
								copy(s50, s118, 0x20)
								q = fn_13b5c0(s240, bf, bg, s70, bh)
								p = ld64(s240)
								st64(a + 0x10, ld64(s240 + 8))
								st64(a + 8, p)
								st64(a, 0)
								return q
							}
							st64(s2e0, ld64(s178))
							q = memcpy(a + 0x20, se0, 0x50)
							st64(a + 0x80, ld64(s2e0))
							st64(a + 0x78, bd)
							st64(a + 0x70, funder)
							st64(a + 0x18, ld64(s2e8))
							st64(a + 0x10, ld64(s2d8))
							st64(a + 8, ld64(s2d8 + 8))
							st64(a, g)
							return q
						}
						anchor_error_from(s250, 0x7d0 /* anchor::ConstraintMut */, av, at)
						q = Error_with_account_name(s260, ld64(s250), ld64(s250 + 8), "funder", 6)
						p = ld64(s260)
						st64(a + 0x10, ld64(s260 + 8))
						st64(a + 8, p)
						st64(a, 0)
						return q
					}
					anchor_error_from(s1e0, 0x7d6 /* anchor::ConstraintSeeds */)
					Error_with_account_name(s1f0, ld64(s1e0), ld64(s1e0 + 8), "config_extension", 0x10)
					const af = ld64(s1f0 + 8)
					const ae = ld64(s1f0)
					const z = ld64(ld64(s188))
					const ad = ld64(z + 0x18)
					const ac = ld64(z + 0x10)
					const ab = ld64(z + 8)
					const aa = ld64(z)
					copy(s50, s140, 0x20)
					st64(s70, aa, ab, ac, ad)
					q = fn_13b5c0(s200, ae, af, s70, ab)
					p = ld64(s200)
					st64(a + 0x10, ld64(s200 + 8))
					st64(a + 8, p)
					st64(a, 0)
					return q
				}
				q = fn_13b430(s1d0, s158)
				p = ld64(s1d0)
				st64(a + 0x10, ld64(s1d0 + 8))
				st64(a + 8, p)
				st64(a, 0)
				return q
			}
			q = Error_with_account_name(s1c0, n, o, "system_program", 0xe)
			p = ld64(s1c0)
			st64(a + 0x10, ld64(s1c0 + 8))
			st64(a + 8, p)
			st64(a, 0)
			return q
		}
		q = Error_with_account_name(s1b0, l, m, "fee_authority", 0xd)
		p = ld64(s1b0)
		st64(a + 0x10, ld64(s1b0 + 8))
		st64(a + 8, p)
		st64(a, 0)
		return q
	}
	alloc_handle_alloc_error(8, 0x70)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: config_extension
export function fn_ebed0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s41 = fp - 0x41, s68 = fp - 0x68, s78 = fp - 0x78, sa0 = fp - 0xa0, se0 = fp - 0xe0, s100 = fp - 0x100, s120 = fp - 0x120, s138 = fp - 0x138, s170 = fp - 0x170, s180 = fp - 0x180, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1b8 = fp - 0x1b8, s1d0 = fp - 0x1d0, s1d8 = fp - 0x1d8, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, s300 = fp - 0x300, s308 = fp - 0x308
	let aw, da, db, dc: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s270, f, b)
	if (g != 0) {
		const p = ld64(ld64(b + 0x10))
		st64(s2b8 + 0x30, p)
		const q = ld64(p)
		copyr(s38, q + 8, 0x18)
		st64(s2b8 + 0x38, q)
		st64(s40, ld64(q))
		const r = ld64(f)
		copyr(s1f0, r, 0x20)
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
				st64(s1f0 + 8, 0x100154f61)
				st32(s170 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s1a0, 2)
				st32(s1d8, 4)
				st64(s1f0 + 0x10, 0x45)
				st64(s1f0, 0)
				const ba = fn_13b3a8(s230, s1f0)
				const az = ld64(s230 + 8)
				const ay = ld64(s230)
				const ax = ld64(s2b8 + 0x38)
				copyr(s1f0, ax, 0x20)
				copy(s1d0, r, 0x20)
				dc = fn_13b5c0(s240, ay, az, s1f0, ba)
				const bb = ld64(s240)
				st64(a + 0x10, ld64(s240 + 8))
				st64(a + 8, bb)
				st64(a, 0)
				return dc
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1f0, 0x1001594b0, 0x1001594d0)
		}
		st64(s2b8 + 0x28, r)
		st64(s2b8 + 0x40, a)
		const s = ld64(b + 8)
		const t = __floatundidf(ld64(s) * 0x2e8)
		const u = fn_14f7f8(ld64(s + 8), t)
		const v = fn_151cb0(u, 0)
		const w = fn_14f3e8(u)
		const x = max((fn_151a40(u, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (v as i64) ? 0 : w, 1)
		let bd: AccountInfo = ld64(s270)
		let bj = ld64(s270 + 8)
		if (x > g) {
			const y: AccountInfo = ld64(s2b8 + 0x30)
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
			st64(s2b8 + 0x28, y.rent_epoch)
			const bi = y.owner
			rc_inc(be, bf)
			const bg: DataCell = bd.data
			const bh = bg.strong
			st64(s2b8 + 0x30, bi)
			rc_inc(bg, bh)
			const bk: AccountInfo = ld64(ld64(bj + 0x18))
			const bl: LamportsCell = bk.lamports
			const bm = bl.strong
			st64(s2b8, sat_sub(x, g))
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
			st64(se0 + 0x28, ld64(s2b8 + 0x28))
			st64(se0 + 0x20, ld64(s2b8 + 0x30))
			st64(se0 + 0x18, bc)
			st64(se0 + 0x10, ld64(s2f0))
			st64(se0 + 8, ld64(s2b8 + 0x38))
			st8(se0, bs, br, bq)
			st64(s100 + 0x18, bt)
			st64(s100 + 0x10, ld64(s2f8))
			st64(s100, bl, bn)
			st64(s120 + 0x18, ld64(s2f0 + 8))
			st64(s78, 8, 0)
			st64(s120, 0, 8, 0)
			dc = fn_13d318(s200, s120, ld64(s2b8))
			aw = ld64(s200)
			if (aw != 2) {
				db = ld64(s200 + 8)
				da = ld64(s2b8 + 0x40)
				st64(da + 8, aw, db)
				st64(da, 0)
				return dc
			}
			bd = ld64(s270)
			st64(s2b8 + 0x28, bd.key)
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
		st64(s2b8 + 0x30, bd.is_writable)
		st64(s2b8 + 0x38, bd.is_signer)
		const cc = bd.rent_epoch
		const cd = bd.owner
		const cb = bw.key
		rc_inc(bx, by)
		const bz: DataCell = bw.data
		const ca = bz.strong
		st64(s2c0, cb, cc, cd, bv, bu)
		rc_inc(bz, ca)
		st64(s2f0 + 0x28, bw.owner)
		st64(s2f0 + 0x20, bw.rent_epoch)
		const ci = bw.is_signer
		const ch = bw.is_writable
		const cg = bw.executable
		const ce = ld64(s270 + 8)
		const cf = ld64(ld64(ld64(ce + 0x20)))
		copyr(s68, cf, 0x20)
		const cj = ld8(ld64(ce + 0x28))
		st64(s20, s41)
		st64(s38 + 8, s68)
		st64(s40, 0x1001531e0)
		st64(s138, s40)
		st64(s180 + 8, s138)
		st8(s180, ci, ch, cg)
		st64(s1a0 + 0x18, ld64(s2f0 + 0x20))
		st64(s1a0 + 0x10, ld64(s2f0 + 0x28))
		st64(s1a0, bx, bz)
		st64(s1b0 + 8, ld64(s2c0))
		st8(s1b0 + 2, ld64(s2b8 + 0x20))
		st8(s1b0 + 1, ld64(s2b8 + 0x30))
		st8(s1b0, ld64(s2b8 + 0x38))
		st64(s1b8, ld64(s2b8))
		st64(s1d0 + 0x10, ld64(s2b8 + 8))
		st64(s1d0 + 8, ld64(s2b8 + 0x10))
		st64(s1d0, ld64(s2b8 + 0x18))
		st64(s1d8, ld64(s2b8 + 0x28))
		st64(s2b8 + 0x38, cj)
		st8(s41, cj)
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 0x10)
		st64(s138 + 8, 3)
		st64(s170, 1)
		st64(s1f0, 0, 8, 0)
		dc = fn_13c8b8(s210, s1f0, 0x268)
		aw = ld64(s210)
		if (aw != 2) {
			db = ld64(s210 + 8)
			da = ld64(s2b8 + 0x40)
			st64(da + 8, aw, db)
			st64(da, 0)
			return dc
		}
		const ck: AccountInfo = ld64(s270)
		const cl: LamportsCell = ck.lamports
		const cs = ck.key
		rc_inc(cl)
		const cm: DataCell = ck.data
		rc_inc(cm)
		const cn: LamportsCell = bw.lamports
		const co = cn.strong
		st64(s2b8 + 0x10, bw.key)
		st64(s2b8 + 0x18, ck.executable)
		st64(s2b8 + 0x20, ck.is_writable)
		st64(s2b8 + 0x28, ck.is_signer)
		st64(s2b8 + 0x30, ck.rent_epoch)
		const cr = ck.owner
		rc_inc(cn, co)
		const cp: DataCell = bw.data
		const cq = cp.strong
		st64(s2c0, cr, cs, cl)
		rc_inc(cp, cq)
		const cx = bw.owner
		const cw = bw.rent_epoch
		const cv = bw.is_signer
		const cu = bw.is_writable
		const ct = bw.executable
		copyr(s68, cf, 0x20)
		st64(s20, s41)
		st64(s38 + 8, s68)
		st64(s40, 0x1001531e0)
		st64(s138, s40)
		st64(s180 + 8, s138)
		st8(s180, cv, cu, ct)
		st64(s1a0, cn, cp, cx, cw)
		st64(s1b0 + 8, ld64(s2b8 + 0x10))
		st8(s1b0 + 2, ld64(s2b8 + 0x18))
		st8(s1b0 + 1, ld64(s2b8 + 0x20))
		st8(s1b0, ld64(s2b8 + 0x28))
		st64(s1b8, ld64(s2b8 + 0x30))
		st64(s1d0 + 0x10, ld64(s2c0))
		st64(s1d0 + 8, cm)
		copyr(s1d8, s2b8, 0x10)
		st8(s41, ld64(s2b8 + 0x38))
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 0x10)
		st64(s138 + 8, 3)
		st64(s170, 1)
		st64(s1f0, 0, 8, 0)
		dc = fn_13cc48(s220, s1f0, ld64(ld64(ld64(s270 + 8) + 0x30)))
		aw = ld64(s220)
		if (aw != 2) {
			db = ld64(s220 + 8)
			da = ld64(s2b8 + 0x40)
			st64(da + 8, aw, db)
			st64(da, 0)
			return dc
		}
	} else {
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0x2e8)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const ad = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		const m = ld64(s270 + 8)
		const n: AccountInfo = ld64(ld64(m + 0x10))
		const o: LamportsCell = n.lamports
		const aa = n.key
		const ae = ld64(s270)
		rc_inc(o)
		st64(s2b8 + 0x38, aa)
		const ab: DataCell = n.data
		const ac = ab.strong
		st64(s2b8 + 0x30, ab)
		rc_inc(ab, ac)
		const af = ld64(ae + 8)
		const ag = ld64(af)
		st64(s2b8, ld64(ae))
		st64(s2b8 + 8, n.executable)
		st64(s2b8 + 0x10, n.is_writable)
		st64(s2b8 + 0x18, n.is_signer)
		st64(s2b8 + 0x20, n.rent_epoch)
		st64(s2b8 + 0x28, n.owner)
		rc_inc(af, ag)
		const ah = ld64(ae + 0x10)
		rc_inc(ah)
		const ai: AccountInfo = ld64(ld64(m + 0x18))
		const aj: LamportsCell = ai.lamports
		const ak = aj.strong
		st64(s2c0, o)
		const al: AccountInfo = ld64(s270)
		st64(s2f0 + 8, al.executable)
		st64(s2f0 + 0x10, al.is_writable)
		st64(s2f0 + 0x18, al.is_signer)
		st64(s2f0 + 0x20, al.rent_epoch)
		st64(s2f0 + 0x28, al.owner)
		const ao = ai.key
		rc_inc(aj, ak)
		const am: DataCell = ai.data
		const an = am.strong
		st64(s2f8, ao, ad)
		st64(s2b8 + 0x40, a)
		rc_inc(am, an)
		st64(s300, ai.owner)
		st64(s308, ai.rent_epoch)
		const av = ai.is_signer
		const au = ai.is_writable
		const at = ai.executable
		const ap = ld64(s270 + 8)
		const aq = ld64(ld64(ld64(ap + 0x20)))
		copyr(s68, aq, 0x20)
		const ar = ld8(ld64(ap + 0x28))
		st64(s20, s41)
		st64(s38 + 8, s68)
		st64(s40, 0x1001531e0)
		st8(s41, ar)
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
		st8(s1b0, av, au, at)
		st64(s1b8, ld64(s308))
		st64(s1d0 + 0x10, ld64(s300))
		st64(s1d0, aj, am)
		st64(s1d8, ld64(s2f8))
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 0x10)
		st64(s138 + 8, 3)
		st64(s170 + 0x30, 1)
		st64(s1f0, 0, 8, 0)
		dc = fn_13cfd8(s250, s1f0, ld64(s2f0), 0x268, ld64(ld64(ap + 0x30)))
		aw = ld64(s250)
		if (aw != 2) {
			db = ld64(s250 + 8)
			da = ld64(s2b8 + 0x40)
			st64(da + 8, aw, db)
			st64(da, 0)
			return dc
		}
	}
	const cy = ld64(s2b8 + 0x40)
	fn_3670(s1f0, ld64(s270))
	if (ld64(s1f0) == 0) {
		dc = Error_with_account_name(s260, ld64(s1f0 + 8), ld64(s1f0 + 0x10), "config_extension", 0x10)
		const cz = ld64(s260)
		st64(cy + 0x10, ld64(s260 + 8))
		st64(cy + 8, cz)
		st64(cy, 0)
		return dc
	}
	return memcpy(cy, s1f0, 0x68)
}

export function fn_3670(a: u64, b: u64) {
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
			fn_102d80(s68, sc8, 0x800000000000001a /* Ok */)
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

export function fn_102d80(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20
	let r: u64
	const f = ld64(b + 8)
	if (7 >= f) {
		fn_14c4f0(8, f, 0x10015a828, d, e)
	}
	if (f - 8 >= 0x20) {
		const g = ld64(b)
		const h = ld64(g + 0xe)
		st8(s20 + 0x18, ld8(g + 0x16))
		st64(s20 + 0x10, h)
		if (f - 0x28 >= 0x20) {
			const k = ld64(s20 + 0x11)
			const i = ld64(g + 0x2e)
			st8(s20 + 0x18, ld8(g + 0x36))
			st64(s20 + 0x10, i)
			if (f - 0x48 >= 0x20) {
				const s = ld64(s20 + 0x11)
				const j = ld64(g + 0x4e)
				st8(s20 + 0x18, ld8(g + 0x56))
				st16(a + 0x45, ld16(g + 0x4c))
				st32(a + 0x41, ld32(g + 0x48))
				st64(s20 + 0x10, j)
				r = ld64(s20 + 0x11)
				st8(a + 0x60, ld8(g + 0x67))
				st64(a + 0x58, ld64(g + 0x5f))
				st64(a + 0x50, ld64(g + 0x57))
				st16(a + 5, ld16(g + 0xc))
				st32(a + 1, ld32(g + 8))
				st8(a + 0x20, ld8(g + 0x27))
				st64(a + 0x18, ld64(g + 0x1f))
				st64(a + 0x10, ld64(g + 0x17))
				st16(a + 0x25, ld16(g + 0x2c))
				st32(a + 0x21, ld32(g + 0x28))
				const n = ld8(g + 0x47)
				const m = ld64(g + 0x3f)
				const l = ld64(g + 0x37)
				st8(a + 7, h)
				st8(a + 0x27, i)
				st8(a + 0x47, j)
				st64(a + 0x28, s, l, m)
				st64(a + 8, k)
				st8(a + 0x40, n)
				st64(a + 0x48, r)
				st8(a, 0)
				return
			}
		}
	}
	const o = fn_1459d0(0x100159468)
	anchor_error_from(s20, 0xbbb /* anchor::AccountDidNotDeserialize */)
	r = ld64(s20 + 8)
	const q = ld64(s20)
	if (2 > (o & 3) - 2) {
		st64(a + 8, q, r)
		st8(a, 1)
	} else if ((o & 3) == 0) {
		st64(a + 8, q, r)
		st8(a, 1)
	} else {
		const p = ld64(ld64(o + 7))
		callx(p, ld64(o - 1), p)
		st64(a + 8, q, r)
		st8(a, 1)
	}
}
