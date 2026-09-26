/// <reference path="../lib.d.ts" />
// instruction delete_position_bundle
import { fn_13aee8, fn_65a18, memcpy } from '../shared.ts'

// instruction handler: delete_position_bundle (discriminator sha256("global:delete_position_bundle")[..8] = 0xad7cefd902631964)
// accounts [str: the program's account-error strings, in order of first use]: position_bundle, position_bundle_mint, position_bundle_token_account, receiver, token_program, position_bundle_owner
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
export function ix_delete_position_bundle(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const sb0 = fp - 0xb0, sc8 = fp - 0xc8, sd0 = fp - 0xd0, sd8 = fp - 0xd8, se0 = fp - 0xe0, s128 = fp - 0x128, s178 = fp - 0x178, s188 = fp - 0x188, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let k, l, m: u64
	let g = a
	sol_log("Instruction: DeletePositionBundle", 0x21)
	st64(s1a0, accounts, accounts_len)
	let n = accounts_delete_position_bundle(sc8, undef, s1a0, undef, fp)
	const f = ld32(sc8)
	if (f == 2) {
		k = ld64(sc8 + 8)
		st64(g + 8, ld64(sc8 + 0x10))
		st64(g, k)
		return n
	}
	const o = g
	const j = ld32(sc8 + 4)
	const i = ld64(sc8 + 8)
	const h = ld64(sc8 + 0x10)
	memcpy(s178, sb0, 0xb0)
	st64(s188, i, h)
	st32(s190, f, j)
	if (fn_5c948(s128) != 0) {
		st64(s1000, ld64(s128 + 0x40))
		st64(sff8, sd0)
		n = fn_65a18(s1c0, se0, sd8, s190, ld64(s1000), sd0)
		m = ld64(s1c0 + 8)
		k = ld64(s1c0)
		g = o
		l = program_id
		if (k == 2) {
			n = fn_93d90(s1d0, s190, l)
			k = ld64(s1d0)
			st64(g + 8, ld64(s1d0 + 8))
			st64(g, k)
			return n
		}
		st64(g + 8, m)
		st64(g, k)
		return n
	}
	n = fn_87630(s1b0, 0x2e)
	m = ld64(s1b0 + 8)
	k = ld64(s1b0)
	g = o
	l = program_id
	if (k == 2) {
		n = fn_93d90(s1d0, s190, l)
		k = ld64(s1d0)
		st64(g + 8, ld64(s1d0 + 8))
		st64(g, k)
		return n
	}
	st64(g + 8, m)
	st64(g, k)
	return n
}

// Anchor Accounts::try_accounts of instruction delete_position_bundle (called by ix_delete_position_bundle; name [str]: from the handler's "Instruction: …" log; was fn_92cf0)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_bundle (ConstraintMut, ConstraintClose), position_bundle_mint (ConstraintMut, ConstraintAddress), position_bundle_token_account (ConstraintMut, ConstraintRaw), receiver (AccountNotEnoughKeys, ConstraintMut), token_program (ConstraintAddress), position_bundle_owner
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_bundle_token_account_box, position_bundle, position_bundle_mint
export function accounts_delete_position_bundle(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s98 = fp - 0x98, sa0 = fp - 0xa0, sb8 = fp - 0xb8, sd8 = fp - 0xd8, sf8 = fp - 0xf8, s138 = fp - 0x138, s168 = fp - 0x168, s178 = fp - 0x178, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s358 = fp - 0x358, s360 = fp - 0x360, s368 = fp - 0x368, s370 = fp - 0x370, s378 = fp - 0x378, s380 = fp - 0x380, s388 = fp - 0x388, s390 = fp - 0x390, s398 = fp - 0x398
	let q, r, s, ad, ae: u64
	let g = a
	try_accounts_11bb8(sb8, c, c, d, e)
	const h = ld64(sb8 + 0x10)
	const i = ld64(sb8 + 8)
	const position_bundle: AccountInfo = ld64(sb8)
	if (position_bundle == 0) {
		ae = Error_with_account_name(s350, i, h, "position_bundle", 0xf)
		ad = ld64(s350)
		st64(g + 0x10, ld64(s350 + 8))
		st64(g + 8, ad)
		st32(g, 2)
		return ae
	}
	st64(s358, g)
	memcpy(s168, sa0, 0x30)
	st64(s180, position_bundle, i, h)
	try_accounts_11e98(sb8, c)
	const j = ld32(sb8)
	if (j == 2) {
		ae = Error_with_account_name(s340, ld64(sb8 + 8), ld64(sb8 + 0x10), "position_bundle_mint", 0x14)
		ad = ld64(s340)
		g = ld64(s358)
		st64(g + 0x10, ld64(s340 + 8))
		st64(g + 8, ad)
		st32(g, 2)
		return ae
	}
	st64(s370, ld64(sb8 + 0x10))
	st64(s368, ld64(sb8 + 8))
	const l = ld32(sb8 + 4)
	memcpy(s138, sa0, 0x40)
	st64(s360, ld64(s98 + 0x38))
	try_accounts_11f50(sb8, c)
	if (ld32(s98 + 0x70) == 2) {
		ae = Error_with_account_name(s330, ld64(sb8), ld64(sb8 + 8), "position_bundle_token_account", 0x1d)
		ad = ld64(s330)
		g = ld64(s358)
		st64(g + 0x10, ld64(s330 + 8))
		st64(g + 8, ad)
		st32(g, 2)
		return ae
	}
	const k = ld64(0x300000000 /* heap bump-allocator cursor */)
	st64(s378, l)
	const position_bundle_token_account_box: TokenAccount = k != 0 ? sat_sub(k, 0xb8) & -8 : 0x300007f48
	if (position_bundle_token_account_box > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, position_bundle_token_account_box)
		memcpy(position_bundle_token_account_box, sb8, 0xb8)
		try_accounts_11718(sb8, c)
		const o = ld64(sb8 + 8)
		const n = ld64(sb8)
		if (n == 2) {
			st64(s388, o)
			const p = ld64(c + 8)
			if (p == 0) {
				anchor_error_from(s1a0, 0xbbd /* anchor::AccountNotEnoughKeys */, o, r, s)
				q = ld64(s1a0 + 8)
				const t = ld64(s1a0)
				if (t != 2) {
					ae = Error_with_account_name(s1b0, t, q, "receiver", 8)
					ad = ld64(s1b0)
					g = ld64(s358)
					st64(g + 0x10, ld64(s1b0 + 8))
					st64(g + 8, ad)
					st32(g, 2)
					return ae
				}
			} else {
				st64(c + 8, p - 1)
				q = ld64(c)
				st64(c, q + 0x30)
			}
			st64(s380, q)
			fn_129a0(sb8, c, q, r, s)
			const y = ld64(sb8 + 8)
			const u = ld64(sb8)
			if (u == 2) {
				st64(s390, j)
				if (position_bundle.is_writable == 0) {
					anchor_error_from(s310, 0x7d0 /* anchor::ConstraintMut */)
					ae = Error_with_account_name(s320, ld64(s310), ld64(s310 + 8), "position_bundle", 0xf)
					ad = ld64(s320)
					g = ld64(s358)
					st64(g + 0x10, ld64(s320 + 8))
					st64(g + 8, ad)
					st32(g, 2)
					return ae
				}
				const v = position_bundle.key
				copyr(sd8, v, 0x20)
				const w = ld64(ld64(s380) /* key */)
				copyr(sb8, w, 0x20)
				if ((memcmp(sd8, sb8, 0x20) as u32) == 0) {
					anchor_error_from(s2f0, 0x7db /* anchor::ConstraintClose */)
					ae = Error_with_account_name(s300, ld64(s2f0), ld64(s2f0 + 8), "position_bundle", 0xf)
					ad = ld64(s300)
					g = ld64(s358)
					st64(g + 0x10, ld64(s300 + 8))
					st64(g + 8, ad)
					st32(g, 2)
					return ae
				}
				const position_bundle_mint: AccountInfo = ld64(s360)
				g = ld64(s358)
				if (position_bundle_mint.is_writable == 0) {
					anchor_error_from(s2d0, 0x7d0 /* anchor::ConstraintMut */)
					ae = Error_with_account_name(s2e0, ld64(s2d0), ld64(s2d0 + 8), "position_bundle_mint", 0x14)
					ad = ld64(s2e0)
					st64(g + 0x10, ld64(s2e0 + 8))
					st64(g + 8, ad)
					st32(g, 2)
					return ae
				}
				st64(s398, y)
				const z = position_bundle_mint.key
				copyr(sf8, z, 0x20)
				copyr(sd8, s178, 0x20)
				if ((memcmp(sf8, sd8, 0x20) as u32) != 0) {
					anchor_error_from(s1d0, 0x7dc /* anchor::ConstraintAddress */)
					const ac = Error_with_account_name(s1e0, ld64(s1d0), ld64(s1d0 + 8), "position_bundle_mint", 0x14)
					const ab = ld64(s1e0 + 8)
					const aa = ld64(s1e0)
					copyr(sb8, sf8, 0x20)
					copy(s98, s178, 0x20)
					ae = fn_13b5c0(s1f0, aa, ab, sb8, ac)
					ad = ld64(s1f0)
					st64(g + 0x10, ld64(s1f0 + 8))
					st64(g + 8, ad)
					st32(g, 2)
					return ae
				}
				if (position_bundle_token_account_box.info.is_writable == 0) {
					anchor_error_from(s2b0, 0x7d0 /* anchor::ConstraintMut */)
					ae = Error_with_account_name(s2c0, ld64(s2b0), ld64(s2b0 + 8), "position_bundle_token_account", 0x1d)
					ad = ld64(s2c0)
					st64(g + 0x10, ld64(s2c0 + 8))
					st64(g + 8, ad)
					st32(g, 2)
					return ae
				}
				if ((memcmp(position_bundle_token_account_box.mint, s178, 0x20) as u32) == 0) {
					const af = ld64(ld64(s388))
					copyr(sb8, af, 0x20)
					if ((memcmp(position_bundle_token_account_box.owner, sb8, 0x20) as u32) == 0) {
						if (position_bundle_token_account_box.amount != 1) {
							anchor_error_from(s240, 0x7d3 /* anchor::ConstraintRaw */)
							ae = Error_with_account_name(s250, ld64(s240), ld64(s240 + 8), "position_bundle_token_account", 0x1d)
							ad = ld64(s250)
							st64(g + 0x10, ld64(s250 + 8))
							st64(g + 8, ad)
							st32(g, 2)
							return ae
						}
						if (ld8(ld64(s380) + 0x29 /* is_writable */) == 0) {
							anchor_error_from(s290, 0x7d0 /* anchor::ConstraintMut */)
							ae = Error_with_account_name(s2a0, ld64(s290), ld64(s290 + 8), "receiver", 8)
							ad = ld64(s2a0)
							st64(g + 0x10, ld64(s2a0 + 8))
							st64(g + 8, ad)
							st32(g, 2)
							return ae
						}
						const ag = ld64(ld64(s398))
						copyr(sd8, ag, 0x20)
						if ((memcmp(sd8, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
							anchor_error_from(s260, 0x7dc /* anchor::ConstraintAddress */)
							const aj = Error_with_account_name(s270, ld64(s260), ld64(s260 + 8), "token_program", 0xd)
							const ai = ld64(s270 + 8)
							const ah = ld64(s270)
							copyr(sb8, sd8, 0x20)
							st64(s98, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
							ae = fn_13b5c0(s280, ah, ai, sb8, aj)
							ad = ld64(s280)
							st64(g + 0x10, ld64(s280 + 8))
							st64(g + 8, ad)
							st32(g, 2)
							return ae
						}
						memcpy(g + 0x60, s180, 0x48)
						ae = memcpy(g + 0x18, s138, 0x40)
						st64(g + 0xc0, ld64(s398))
						st64(g + 0xb8, ld64(s380))
						st64(g + 0xb0, ld64(s388))
						st64(g + 0xa8, position_bundle_token_account_box)
						st64(g + 0x58, ld64(s360))
						st64(g + 0x10, ld64(s370))
						st64(g + 8, ld64(s368))
						st32(g + 4, ld64(s378))
						st32(g, ld64(s390))
						return ae
					}
					anchor_error_from(s220, 0x7d3 /* anchor::ConstraintRaw */)
					ae = Error_with_account_name(s230, ld64(s220), ld64(s220 + 8), "position_bundle_token_account", 0x1d)
					ad = ld64(s230)
					st64(g + 0x10, ld64(s230 + 8))
					st64(g + 8, ad)
					st32(g, 2)
					return ae
				}
				anchor_error_from(s200, 0x7d3 /* anchor::ConstraintRaw */)
				ae = Error_with_account_name(s210, ld64(s200), ld64(s200 + 8), "position_bundle_token_account", 0x1d)
				ad = ld64(s210)
				st64(g + 0x10, ld64(s210 + 8))
				st64(g + 8, ad)
				st32(g, 2)
				return ae
			}
			ae = Error_with_account_name(s1c0, u, y, "token_program", 0xd)
			ad = ld64(s1c0)
			g = ld64(s358)
			st64(g + 0x10, ld64(s1c0 + 8))
			st64(g + 8, ad)
			st32(g, 2)
			return ae
		}
		ae = Error_with_account_name(s190, n, o, "position_bundle_owner", 0x15)
		ad = ld64(s190)
		g = ld64(s358)
		st64(g + 0x10, ld64(s190 + 8))
		st64(g + 8, ad)
		st32(g, 2)
		return ae
	}
	alloc_handle_alloc_error(8, 0xb8)
}

export function fn_5c948(a: u64): u64 {
	return (ld8(a + 0x20) | ld8(a + 0x21) | ld8(a + 0x22) | ld8(a + 0x23) | ld8(a + 0x24) | ld8(a + 0x25) | ld8(a + 0x26) | ld8(a + 0x27) | ld8(a + 0x28) | ld8(a + 0x29) | ld8(a + 0x2a) | ld8(a + 0x2b) | ld8(a + 0x2c) | ld8(a + 0x2d) | ld8(a + 0x2e) | ld8(a + 0x2f) | ld8(a + 0x30) | ld8(a + 0x31) | ld8(a + 0x32) | ld8(a + 0x33) | ld8(a + 0x34) | ld8(a + 0x35) | ld8(a + 0x36) | ld8(a + 0x37) | ld8(a + 0x38) | ld8(a + 0x39) | ld8(a + 0x3a) | ld8(a + 0x3b) | ld8(a + 0x3c) | ld8(a + 0x3d) | ld8(a + 0x3e) | ld8(a + 0x3f)) == 0
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_bundle, position_bundle_mint, position_bundle_token_account
export function fn_93d90(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0
	let ad, af: u64
	const f: AccountInfo = ld64(b + 0xb8)
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
	const n: AccountInfo = ld64(b + 0x60)
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
	fn_13aee8(s70, s30, s60, p, t)
	const v = ld64(s70)
	if (v != 2) {
		ad = Error_with_account_name(s80, v, ld64(s70 + 8), "position_bundle", 0xf)
		af = ld64(s80)
		st64(a + 8, ld64(s80 + 8))
		st64(a, af)
		return ad
	}
	const w = ld64(b + 0x58)
	if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
		const x = common_is_closed(w)
		if (x == 0) {
			fn_143448(s30, w, x)
			const z = ld64(s30 + 0x10)
			const y = ld64(s30)
			if (y != 0x800000000000001a /* Ok */) {
				const aa = ld64(s30 + 8)
				st64(s30, y, aa, z)
				fn_13b430(s90, s30)
				const ab = ld64(s90)
				if (ab != 2) {
					ad = Error_with_account_name(sa0, ab, ld64(s90 + 8), "position_bundle_mint", 0x14)
					af = ld64(sa0)
					st64(a + 8, ld64(sa0 + 8))
					st64(a, af)
					return ad
				}
			} else {
				st64(z, ld64(z) + 1)
			}
		}
	}
	const ag = ld64(ld64(b + 0xa8))
	const ac = memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20)
	let ae = undef
	ad = ac as u32
	if (ad != 0) {
		st64(a + 8, ae)
		st64(a, 2)
		return ad
	}
	ad = common_is_closed(ag)
	ae = undef
	if (ad != 0) {
		st64(a + 8, ae)
		st64(a, 2)
		return ad
	}
	ad = fn_143448(s30, ag, ad)
	ae = ld64(s30 + 0x10)
	const ah = ld64(s30)
	if (ah != 0x800000000000001a /* Ok */) {
		const ai = ld64(s30 + 8)
		st64(s30, ah, ai, ae)
		ad = fn_13b430(sb0, s30)
		ae = undef
		const aj = ld64(sb0)
		if (aj == 2) {
			st64(a + 8, ae)
			st64(a, 2)
			return ad
		}
		ad = Error_with_account_name(sc0, aj, ld64(sb0 + 8), "position_bundle_token_account", 0x1d)
		af = ld64(sc0)
		st64(a + 8, ld64(sc0 + 8))
		st64(a, af)
		return ad
	}
	st64(ae, ld64(ae) + 1)
	st64(a + 8, ae)
	st64(a, 2)
	return ad
}
