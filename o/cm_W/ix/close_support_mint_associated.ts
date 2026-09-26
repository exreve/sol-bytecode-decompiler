/// <reference path="../lib.d.ts" />
// instruction close_support_mint_associated
import { anchor_error_from, fn_13e190, fn_4130, fn_88360, memcpy } from '../shared.ts'

// instruction handler: close_support_mint_associated (discriminator sha256("global:close_support_mint_associated")[..8] = 0x8336984863b78860)
// accounts [idl]: 0 owner [signer, mut], 1 token_mint, 2 support_mint_associated [mut, pda]
// args [idl]: (none)
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
export function ix_close_support_mint_associated(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const se0 = fp - 0xe0, sf8 = fp - 0xf8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s201 = fp - 0x201, s218 = fp - 0x218, sff8 = fp - 0xff8
	let j: u64
	const f = sol_log("Instruction: CloseSupportMintAssociated", 0x27)
	st64(s200, accounts, accounts_len)
	st64(sff8, s201)
	let k = accounts_close_support_mint_associated(sf8, program_id, s200, undef, fp, f)
	const g = ld32(sf8)
	if (g == 2) {
		j = ld64(sf8 + 8)
		st64(a + 8, ld64(sf8 + 0x10))
		st64(a, j)
		return k
	}
	const l = ld32(sf8 + 4)
	const i = ld64(sf8 + 8)
	const h = ld64(sf8 + 0x10)
	memcpy(s1d8, se0, 0xe0)
	st64(s1e8, i, h)
	st32(s1f0, g, l)
	k = fn_dd130(s218, s1f0)
	j = ld64(s218)
	st64(a + 8, ld64(s218 + 8))
	st64(a, j)
	return k
}

// Anchor Accounts::try_accounts of instruction close_support_mint_associated (called by ix_close_support_mint_associated; name [str]: from the handler's "Instruction: …" log; was fn_dbcd8)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: support_mint_associated (ConstraintClose, ConstraintMut, ConstraintSeeds)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: support_mint_associated [idl]
export function accounts_close_support_mint_associated(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s80 = fp - 0x80, sa0 = fp - 0xa0, sf8 = fp - 0xf8, s138 = fp - 0x138, s158 = fp - 0x158, s178 = fp - 0x178, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s2c8 = fp - 0x2c8, s2d0 = fp - 0x2d0, s2d8 = fp - 0x2d8
	let h, p, q, r, y, ar, at, au: u64
	st64(s2c8 + 0x38, a)
	let ap = try_accounts_17a30(s1d8, c, c, d, e, r0)
	const k: AccountInfo = ld64(s1d8 + 8)
	const f = ld64(s1d8)
	if (f == 2) {
		st64(s2c8 + 0x30, ld64(e - 0xff8))
		ap = try_accounts_15c0(s1d8, c)
		const l = ld32(s1d8)
		if (l == 2) {
			const t = ld64(0x300000000 /* heap bump-allocator cursor */)
			const u = t != 0 ? sat_sub(t, 0xa) : 0x300007ff6
			r = ld64(s1d8 + 0x10)
			p = ld64(s1d8 + 8)
			if (p != 0) {
				if (0x300000008 > u) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, au)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, u)
				st64(u, 0x696d5f6e656b6f74)
				st16(u + 8, 0x746e)
				void ld64(r)
			} else {
				if (0x300000008 > u) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, au)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, u)
				st64(u, 0x696d5f6e656b6f74)
				st16(u + 8, 0x746e)
				void ld64(r)
			}
			st64(r + 0x10, u, 0xa)
			st64(r + 8, 0xa)
			st64(r, 1)
			y = ld64(s2c8 + 0x38)
			st64(y + 0x10, r)
			st64(y + 8, p)
			st32(y, 2)
			return ap
		}
		st64(s2c8 + 0x10, ld64(s1d8 + 0x10))
		st64(s2c8 + 0x18, ld64(s1d8 + 8))
		st64(s2c8 + 0x20, ld32(s1d8 + 4))
		memcpy(s138, s1c0, 0x40)
		copy(s158, s178, 0x20)
		st64(s2c8 + 0x28, ld64(s1b8 + 0x38))
		ap = try_accounts_18590(s1d8, c)
		const n = ld64(s1d8 + 0x10)
		const w = ld64(s1d8 + 8)
		const m = ld64(s1d8)
		if (m == 0) {
			const v = ld64(0x300000000 /* heap bump-allocator cursor */)
			const x = v != 0 ? sat_sub(v, 0x17) : 0x300007fe9
			if ((w & 1) != 0) {
				if (0x300000008 > x) {
					raw_vec_handle_error(1, 0x17, 0x10015f8f8, 0x17 > v, n)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, x)
				st64(x + 0xf, 0x6465746169636f73)
				st64(x + 8, 0x7373615f746e696d)
				st64(x, 0x5f74726f70707573)
				void ld64(n)
			} else {
				if (0x300000008 > x) {
					raw_vec_handle_error(1, 0x17, 0x10015f8f8, 0x17 > v, n)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, x)
				st64(x + 0xf, 0x6465746169636f73)
				st64(x + 8, 0x7373615f746e696d)
				st64(x, 0x5f74726f70707573)
				void ld64(n)
			}
			st64(n + 0x10, x, 0x17)
			st64(n + 8, 0x17)
			st64(n, 1)
			y = ld64(s2c8 + 0x38)
			st64(y + 0x10, n)
			st64(y + 8, w)
			st32(y, 2)
			return ap
		}
		B41: {
			st64(s2c8, n, m)
			memcpy(sf8, s1c0, 0x58)
			if (k.is_writable != 0) {
				st64(s2d0, w)
				const z = k.key
				copyr(sa0, z, 0x20)
				if ((memcmp(sa0, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) != 0) {
					copyr(s1d8, z, 0x20)
					if ((memcmp(s1d8, 0x100159420 /* key RayVyjyJQz9vAi126A4sGexKnSU1XeZaHTRcM1mZMPY */, 0x20) as u32) != 0) {
						ap = fn_88360(s1f8, 0)
						h = undef
						const ai = ld64(0x300000000 /* heap bump-allocator cursor */)
						q = ai != 0 ? sat_sub(ai, 5) : 0x300007ffb
						r = ld64(s1f8 + 8)
						p = ld64(s1f8)
						if ((p & 1) != 0) {
							if (0x300000008 > q) {
								raw_vec_handle_error(1, 5, 0x10015f8f8, 0x300000008, h)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, q)
							st8(q + 4, 0x72)
							st32(q, 0x656e776f)
							void ld64(r)
							break B41
						}
						if (0x300000008 > q) {
							raw_vec_handle_error(1, 5, 0x10015f8f8, 0x300000008, h)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, q)
						st8(q + 4, 0x72)
						st32(q, 0x656e776f)
						void ld64(r)
						break B41
					}
				}
				const aa = ld64(s2c8 + 0x28)
				const ab = ld64(aa + 0x18)
				st64(s2d8, ab)
				if ((memcmp(ab, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) == 0) {
					const aj = ld64(aa)
					copyr(s20, aj, 0x20)
					st64(s60, 0x10015a827, 0xc, s20, 0x20)
					// PDA find_program_address(["support_mint", *aj], program *b)
					Pubkey_find_program_address(s1d8, s60, 2, b)
					copyr(s80, s1d8, 0x20)
					st8(ld64(s2c8 + 0x30), ld8(s1b8))
					const support_mint_associated: AccountInfo = ld64(s2c8 + 8)
					const al = support_mint_associated.key
					copyr(s40, al, 0x20)
					if ((memcmp(s40, s80, 0x20) as u32) == 0) {
						if (support_mint_associated.is_writable != 0) {
							copyr(s20, al, 0x20)
							copyr(s1d8, sa0, 0x20)
							if ((memcmp(s20, s1d8, 0x20) as u32) == 0) {
								anchor_error_from(s278, 0x7db /* anchor::ConstraintClose */)
								ap = fn_4130(s288, ld64(s278), ld64(s278 + 8), 0x10015b263 /* "support_mint_associated" */, 0x17)
								at = ld64(s288)
								ar = ld64(s2c8 + 0x38)
								st64(ar + 0x10, ld64(s288 + 8))
								st64(ar + 8, at)
								st32(ar, 2)
								return ap
							}
							const aq = ld64(s2c8 + 0x38)
							memcpy(aq + 0x18, s138, 0x40)
							copy(aq + 0x60, s158, 0x20)
							ap = memcpy(aq + 0xa0, sf8, 0x58)
							st64(aq + 0x98, ld64(s2c8))
							st64(aq + 0x90, ld64(s2d0))
							st64(aq + 0x88, ld64(s2c8 + 8))
							st64(aq + 0x80, k)
							st64(aq + 0x58, ld64(s2c8 + 0x28))
							st64(aq + 0x10, ld64(s2c8 + 0x10))
							st64(aq + 8, ld64(s2c8 + 0x18))
							st32(aq + 4, ld64(s2c8 + 0x20))
							st32(aq, l)
							return ap
						}
						anchor_error_from(s258, 0x7d0 /* anchor::ConstraintMut */)
						ap = fn_4130(s268, ld64(s258), ld64(s258 + 8), 0x10015b263 /* "support_mint_associated" */, 0x17)
						at = ld64(s268)
						ar = ld64(s2c8 + 0x38)
						st64(ar + 0x10, ld64(s268 + 8))
						st64(ar + 8, at)
						st32(ar, 2)
						return ap
					}
					anchor_error_from(s228, 0x7d6 /* anchor::ConstraintSeeds */)
					const ao = fn_4130(s238, ld64(s228), ld64(s228 + 8), 0x10015b263 /* "support_mint_associated" */, 0x17)
					const an = ld64(s238 + 8)
					const am = ld64(s238)
					copyr(s1d8, s40, 0x20)
					copy(s1b8, s80, 0x20)
					ap = Error_with_pubkeys(s248, am, an, s1d8, ao)
					at = ld64(s248)
					ar = ld64(s2c8 + 0x38)
					st64(ar + 0x10, ld64(s248 + 8))
					st64(ar + 8, at)
					st32(ar, 2)
					return ap
				}
				const ah = fn_88360(s208, 0)
				const ac = ld64(0x300000000 /* heap bump-allocator cursor */)
				const ae = ac != 0 ? sat_sub(ac, 0xa) : 0x300007ff6
				const af = ld64(s208 + 8)
				const ad = ld64(s208)
				if ((ad & 1) != 0) {
					if (0x300000008 > ae) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, au)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, ae)
					st64(ae, 0x696d5f6e656b6f74)
					st16(ae + 8, 0x746e)
					void ld64(af)
				} else {
					if (0x300000008 > ae) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, au)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, ae)
					st64(ae, 0x696d5f6e656b6f74)
					st16(ae + 8, 0x746e)
					void ld64(af)
				}
				st64(af + 0x10, ae, 0xa)
				st64(af + 8, 0xa)
				st64(af, 1)
				const ag = ld64(s2d8)
				copyr(s1d8, ag, 0x20)
				st64(s1b8, 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */, 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */, 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */, 0xfc8ba1d828f9bdfe /* TOKEN_2022_PROGRAM[3] */) // key TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
				ap = Error_with_pubkeys(s218, ad, af, s1d8, ah)
				at = ld64(s218)
				ar = ld64(s2c8 + 0x38)
				st64(ar + 0x10, ld64(s218 + 8))
				st64(ar + 8, at)
				st32(ar, 2)
				return ap
			}
			ap = anchor_error_from(s1e8, 0x7d0 /* anchor::ConstraintMut */)
			h = undef
			const o = ld64(0x300000000 /* heap bump-allocator cursor */)
			q = o != 0 ? sat_sub(o, 5) : 0x300007ffb
			r = ld64(s1e8 + 8)
			p = ld64(s1e8)
			if ((p & 1) != 0) {
				if (0x300000008 > q) {
					raw_vec_handle_error(1, 5, 0x10015f8f8, 0x300000008, h)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, q)
				st8(q + 4, 0x72)
				st32(q, 0x656e776f)
				void ld64(r)
			} else {
				if (0x300000008 > q) {
					raw_vec_handle_error(1, 5, 0x10015f8f8, 0x300000008, h)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, q)
				st8(q + 4, 0x72)
				st32(q, 0x656e776f)
				void ld64(r)
			}
		}
		st64(r + 0x10, q, 5)
		st64(r + 8, 5)
		st64(r, 1)
		y = ld64(s2c8 + 0x38)
		st64(y + 0x10, r)
		st64(y + 8, p)
		st32(y, 2)
		return ap
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	h = 5 > g
	const i = h != 0 ? 0 : g - 5
	const j = g != 0 ? i : 0x300007ffb
	if ((f & 1) != 0) {
		if (0x300000008 > j) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, i, h)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st8(j + 4, 0x72)
		st32(j, 0x656e776f)
		void k.key
	} else {
		if (0x300000008 > j) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, i, h)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st8(j + 4, 0x72)
		st32(j, 0x656e776f)
		void k.key
	}
	st64(k + 0x10, j, 5)
	st64(k + 8 /* lamports */, 5)
	st64(k /* key */, 1)
	const s = ld64(s2c8 + 0x38)
	st64(s + 0x10, k)
	st64(s + 8, f)
	st32(s, 2)
	return ap
}

export function fn_dd130(a: u64, b: u64): u64 {
	const s8 = fp - 0x8, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s70 = fp - 0x70
	const f: AccountInfo = ld64(b + 0x80)
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
	const n: AccountInfo = ld64(b + 0x88)
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
	const x = w != 0 ? sat_sub(w, 0x17) : 0x300007fe9
	y = ld64(s70 + 8)
	if ((v & 1) != 0) {
		if (0x300000008 > x) {
			raw_vec_handle_error(1, 0x17, 0x10015f8f8, 0x300000008, 0x17 > w)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, x)
		st64(x + 0xf, 0x6465746169636f73)
		st64(x + 8, 0x7373615f746e696d)
		st64(x, 0x5f74726f70707573)
		void ld64(y)
	} else {
		if (0x300000008 > x) {
			raw_vec_handle_error(1, 0x17, 0x10015f8f8, 0x300000008, 0x17 > w)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, x)
		st64(x + 0xf, 0x6465746169636f73)
		st64(x + 8, 0x7373615f746e696d)
		st64(x, 0x5f74726f70707573)
		void ld64(y)
	}
	st64(y + 0x10, x, 0x17)
	st64(y + 8, 0x17)
	st64(y, 1)
	st64(a + 8, y)
	st64(a, v)
	return z
}
