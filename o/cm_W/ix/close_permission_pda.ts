/// <reference path="../lib.d.ts" />
// instruction close_permission_pda
import { anchor_error_from, fn_13e190, fn_4130, fn_88360, memcpy } from '../shared.ts'

// instruction handler: close_permission_pda (discriminator sha256("global:close_permission_pda")[..8] = 0x7b4687457620549c)
// accounts [idl]: 0 owner [signer, mut], 1 permission_authority, 2 permission [mut, pda]
// args [idl]: (none)
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
export function ix_close_permission_pda(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s110 = fp - 0x110, s128 = fp - 0x128, s238 = fp - 0x238, s250 = fp - 0x250, s260 = fp - 0x260, s261 = fp - 0x261, s278 = fp - 0x278, sff8 = fp - 0xff8
	const f = sol_log("Instruction: ClosePermissionPda", 0x1f)
	st64(s260, accounts, accounts_len)
	st64(sff8, s261)
	let j = accounts_close_permission_pda(s128, program_id, s260, undef, fp, f)
	const h = ld64(s128 + 0x10)
	let i = ld64(s128 + 8)
	const g = ld64(s128)
	if (g == 0) {
		st64(a + 8, h)
		st64(a, i)
		return j
	}
	memcpy(s238, s110, 0x110)
	st64(s250, g, i, h)
	j = fn_db8b8(s278, s250)
	i = ld64(s278)
	st64(a + 8, ld64(s278 + 8))
	st64(a, i)
	return j
}

// Anchor Accounts::try_accounts of instruction close_permission_pda (called by ix_close_permission_pda; name [str]: from the handler's "Instruction: …" log; was fn_da710)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: permission (ConstraintClose, ConstraintMut, ConstraintSeeds)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: permission [idl]
export function accounts_close_permission_pda(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s80 = fp - 0x80, sa0 = fp - 0xa0, s1a0 = fp - 0x1a0, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s368 = fp - 0x368, s370 = fp - 0x370
	let h, j, n, o, p, q, ag, ah, ai, ap, aq: u64
	st64(s368 + 0x18, a)
	let ar = try_accounts_17a30(s2b8, c, c, d, e, r0)
	const m: AccountInfo = ld64(s2b8 + 8)
	let f = ld64(s2b8)
	if (f != 2) {
		const i = ld64(0x300000000 /* heap bump-allocator cursor */)
		j = 5 > i
		const k = j != 0 ? 0 : i - 5
		const l = i != 0 ? k : 0x300007ffb
		if ((f & 1) != 0) {
			if (0x300000008 > l) {
				raw_vec_handle_error(1, 5, 0x10015f8f8, k, j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, l)
			st8(l + 4, 0x72)
			st32(l, 0x656e776f)
			void m.key
		} else {
			if (0x300000008 > l) {
				raw_vec_handle_error(1, 5, 0x10015f8f8, k, j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, l)
			st8(l + 4, 0x72)
			st32(l, 0x656e776f)
			void m.key
		}
		st64(m + 0x10, l, 5)
		st64(m + 8 /* lamports */, 5)
		st64(m /* key */, 1)
		n = ld64(s368 + 0x18)
		st64(n + 0x10, m)
		st64(n + 8, f)
		st64(n, 0)
		return ar
	}
	st64(s368 + 0x10, ld64(e - 0xff8))
	const g = ld64(c + 8)
	if (g == 0) {
		ar = anchor_error_from(s2c8, 0xbbd /* anchor::AccountNotEnoughKeys */, o, p, q)
		h = ld64(s2c8 + 8)
		f = ld64(s2c8)
		if (f != 2) {
			const aj = ld64(0x300000000 /* heap bump-allocator cursor */)
			const ak = aj != 0 ? sat_sub(aj, 0x14) : 0x300007fec
			if ((f & 1) != 0) {
				if (0x300000008 > ak) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, sat_sub(aj, 0x14), 0x14 > aj)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ak)
				st64(ak + 8, 0x6f687475615f6e6f)
				st64(ak, 0x697373696d726570)
				st32(ak + 0x10, 0x79746972)
				void ld64(h)
			} else {
				if (0x300000008 > ak) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, sat_sub(aj, 0x14), 0x14 > aj)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ak)
				st64(ak + 8, 0x6f687475615f6e6f)
				st64(ak, 0x697373696d726570)
				st32(ak + 0x10, 0x79746972)
				void ld64(h)
			}
			st64(h + 0x10, ak, 0x14)
			st64(h + 8, 0x14)
			st64(h, 1)
			n = ld64(s368 + 0x18)
			st64(n + 0x10, h)
			st64(n + 8, f)
			st64(n, 0)
			return ar
		}
	} else {
		st64(c + 8, g - 1)
		h = ld64(c)
		st64(c, h + 0x30)
	}
	ar = try_accounts_18700(s2b8, c, o, p, q)
	let s = ld64(s2b8 + 0x10)
	const t = ld64(s2b8 + 8)
	const r = ld64(s2b8)
	if (r == 0) {
		const ad = ld64(0x300000000 /* heap bump-allocator cursor */)
		const ae = ad != 0 ? sat_sub(ad, 0xa) : 0x300007ff6
		if ((t & 1) != 0) {
			if (0x300000008 > ae) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > ad, s)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, ae)
			st64(ae, 0x697373696d726570)
			st16(ae + 8, 0x6e6f)
			void ld64(s)
		} else {
			if (0x300000008 > ae) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > ad, s)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, ae)
			st64(ae, 0x697373696d726570)
			st16(ae + 8, 0x6e6f)
			void ld64(s)
		}
		st64(s + 0x10, ae, 0xa)
		st64(s + 8, 0xa)
		st64(s, 1)
		const al = ld64(s368 + 0x18)
		st64(al + 0x10, s)
		st64(al + 8, t)
		st64(al, 0)
		return ar
	}
	B44: {
		st64(s368, s, r)
		memcpy(s1a0, s2a0, 0x100)
		if (m.is_writable != 0) {
			st64(s370, t)
			const u = m.key
			copyr(sa0, u, 0x20)
			if ((memcmp(sa0, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) != 0) {
				copyr(s2b8, u, 0x20)
				if ((memcmp(s2b8, 0x100159640 /* key RayzVBPm6p6xtG7fU3KX4k44UexK4NjewDk2QCwoLqa */, 0x20) as u32) != 0) {
					ar = fn_88360(s2e8, 0)
					j = undef
					const am = ld64(0x300000000 /* heap bump-allocator cursor */)
					ah = am != 0 ? sat_sub(am, 5) : 0x300007ffb
					ai = ld64(s2e8 + 8)
					ag = ld64(s2e8)
					if ((ag & 1) != 0) {
						if (0x300000008 > ah) {
							raw_vec_handle_error(1, 5, 0x10015f8f8, 0x300000008, j)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ah)
						st8(ah + 4, 0x72)
						st32(ah, 0x656e776f)
						void ld64(ai)
						break B44
					}
					if (0x300000008 > ah) {
						raw_vec_handle_error(1, 5, 0x10015f8f8, 0x300000008, j)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, ah)
					st8(ah + 4, 0x72)
					st32(ah, 0x656e776f)
					void ld64(ai)
					break B44
				}
			}
			const v = ld64(h)
			copyr(s20, v, 0x20)
			st64(s60, 0x10015b308, 0xa, s20, 0x20)
			// PDA find_program_address(["permission", *v], program *b)
			Pubkey_find_program_address(s2b8, s60, 2, b)
			copyr(s80, s2b8, 0x20)
			st8(ld64(s368 + 0x10), ld8(s298))
			const permission: AccountInfo = ld64(s368 + 8)
			const x = permission.key
			copyr(s40, x, 0x20)
			if ((memcmp(s40, s80, 0x20) as u32) == 0) {
				if (permission.is_writable != 0) {
					copyr(s20, x, 0x20)
					copyr(s2b8, sa0, 0x20)
					if ((memcmp(s20, s2b8, 0x20) as u32) == 0) {
						anchor_error_from(s338, 0x7db /* anchor::ConstraintClose */)
						ar = fn_4130(s348, ld64(s338), ld64(s338 + 8), 0x10015b308 /* "permission" */, 0xa)
						aq = ld64(s348)
						ap = ld64(s368 + 0x18)
						st64(ap + 0x10, ld64(s348 + 8))
						st64(ap + 8, aq)
						st64(ap, 0)
						return ar
					}
					const an = ld64(s368 + 0x18)
					ar = memcpy(an + 0x28, s1a0, 0x100)
					st64(an + 0x20, ld64(s368))
					st64(an + 0x18, ld64(s370))
					st64(an + 0x10, ld64(s368 + 8))
					st64(an + 8, h)
					st64(an, m)
					return ar
				}
				anchor_error_from(s318, 0x7d0 /* anchor::ConstraintMut */)
				ar = fn_4130(s328, ld64(s318), ld64(s318 + 8), 0x10015b308 /* "permission" */, 0xa)
				aq = ld64(s328)
				ap = ld64(s368 + 0x18)
				st64(ap + 0x10, ld64(s328 + 8))
				st64(ap + 8, aq)
				st64(ap, 0)
				return ar
			}
			const ac = anchor_error_from(s2f8, 0x7d6 /* anchor::ConstraintSeeds */)
			s = undef
			const y = ld64(0x300000000 /* heap bump-allocator cursor */)
			const aa = y != 0 ? sat_sub(y, 0xa) : 0x300007ff6
			const ab = ld64(s2f8 + 8)
			const z = ld64(s2f8)
			if ((z & 1) != 0) {
				if (0x300000008 > aa) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, s)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, aa)
				st64(aa, 0x697373696d726570)
				st16(aa + 8, 0x6e6f)
				void ld64(ab)
			} else {
				if (0x300000008 > aa) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, s)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, aa)
				st64(aa, 0x697373696d726570)
				st16(aa + 8, 0x6e6f)
				void ld64(ab)
			}
			st64(ab + 0x10, aa, 0xa)
			st64(ab + 8, 0xa)
			st64(ab, 1)
			copyr(s2b8, s40, 0x20)
			copy(s298, s80, 0x20)
			ar = Error_with_pubkeys(s308, z, ab, s2b8, ac)
			aq = ld64(s308)
			ap = ld64(s368 + 0x18)
			st64(ap + 0x10, ld64(s308 + 8))
			st64(ap + 8, aq)
			st64(ap, 0)
			return ar
		}
		ar = anchor_error_from(s2d8, 0x7d0 /* anchor::ConstraintMut */)
		j = undef
		const af = ld64(0x300000000 /* heap bump-allocator cursor */)
		ah = af != 0 ? sat_sub(af, 5) : 0x300007ffb
		ai = ld64(s2d8 + 8)
		ag = ld64(s2d8)
		if ((ag & 1) != 0) {
			if (0x300000008 > ah) {
				raw_vec_handle_error(1, 5, 0x10015f8f8, 0x300000008, j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, ah)
			st8(ah + 4, 0x72)
			st32(ah, 0x656e776f)
			void ld64(ai)
		} else {
			if (0x300000008 > ah) {
				raw_vec_handle_error(1, 5, 0x10015f8f8, 0x300000008, j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, ah)
			st8(ah + 4, 0x72)
			st32(ah, 0x656e776f)
			void ld64(ai)
		}
	}
	st64(ai + 0x10, ah, 5)
	st64(ai + 8, 5)
	st64(ai, 1)
	const ao = ld64(s368 + 0x18)
	st64(ao + 0x10, ai)
	st64(ao + 8, ag)
	st64(ao, 0)
	return ar
}

export function fn_db8b8(a: u64, b: u64): u64 {
	const s8 = fp - 0x8, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s70 = fp - 0x70
	const f: AccountInfo = ld64(b)
	const g: LamportsCell = f.lamports
	const m = f.key
	rc_inc(g)
	const h: DataCell = f.data
	rc_inc(h)
	const l = f.owner
	const k = f.rent_epoch
	const j = f.is_signer
	const i = f.is_writable
	st8(s38 + 2, f.executable)
	st8(s38, j, i)
	st64(s60, m, g, h, l, k)
	const n: AccountInfo = ld64(b + 0x10)
	const o: LamportsCell = n.lamports
	const u = n.key
	rc_inc(o)
	const p: DataCell = n.data
	rc_inc(p)
	const t = n.owner
	const s = n.rent_epoch
	const r = n.is_signer
	const q = n.is_writable
	st8(s8 + 2, n.executable)
	st8(s8, r, q)
	st64(s30, u, o, p, t, s)
	const z = fn_13e190(s70, s30, s60, p, t)
	let y = undef
	const v = ld64(s70)
	if (v == 2) {
		st64(a + 8, y)
		st64(a, v)
		return z
	}
	const w = ld64(0x300000000 /* heap bump-allocator cursor */)
	const x = w != 0 ? sat_sub(w, 0xa) : 0x300007ff6
	y = ld64(s70 + 8)
	if ((v & 1) != 0) {
		if (0x300000008 > x) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > w)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, x)
		st64(x, 0x697373696d726570)
		st16(x + 8, 0x6e6f)
		void ld64(y)
	} else {
		if (0x300000008 > x) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > w)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, x)
		st64(x, 0x697373696d726570)
		st16(x + 8, 0x6e6f)
		void ld64(y)
	}
	st64(y + 0x10, x, 0xa)
	st64(y + 8, 0xa)
	st64(y, 1)
	st64(a + 8, y)
	st64(a, v)
	return z
}
