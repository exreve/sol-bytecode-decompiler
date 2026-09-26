/// <reference path="../lib.d.ts" />
// instruction delete_token_badge
import { fn_13aee8, memcpy } from '../shared.ts'

// instruction handler: delete_token_badge (discriminator sha256("global:delete_token_badge")[..8] = 0xb911751208449235)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, whirlpools_config_extension, token_mint, token_badge, receiver, token_badge_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
export function ix_delete_token_badge(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const sd8 = fp - 0xd8, sf0 = fp - 0xf0, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s1f1 = fp - 0x1f1, s208 = fp - 0x208, s218 = fp - 0x218, s220 = fp - 0x220, sff8 = fp - 0xff8
	let i: u64
	sol_log("Instruction: DeleteTokenBadge", 0x1d)
	st64(s1f0, accounts, accounts_len)
	st64(sff8, s1f1)
	let k = accounts_delete_token_badge(sf0, program_id, s1f0, undef, fp)
	const f = ld32(sf0)
	if (f == 2) {
		i = ld64(sf0 + 8)
		st64(a + 8, ld64(sf0 + 0x10))
		st64(a, i)
		return k
	}
	st64(s220, ld32(sf0 + 4))
	const h = ld64(sf0 + 8)
	const g = ld64(sf0 + 0x10)
	memcpy(s1c8, sd8, 0xd8)
	st64(s1d8, h, g)
	st32(s1e0 + 4, ld64(s220))
	st32(s1e0, f)
	if ((ld16(ld64(s1c8 + 0xb8) + 0x6a) & 1) != 0) {
		k = fn_eaae8(s218, s1e0)
		i = ld64(s218)
		st64(a + 8, ld64(s218 + 8))
		st64(a, i)
		return k
	}
	k = fn_87630(s208, 0x42)
	const j = ld64(s208 + 8)
	i = ld64(s208)
	if (i == 2) {
		k = fn_eaae8(s218, s1e0)
		i = ld64(s218)
		st64(a + 8, ld64(s218 + 8))
		st64(a, i)
		return k
	}
	st64(a + 8, j)
	st64(a, i)
	return k
}

// Anchor Accounts::try_accounts of instruction delete_token_badge (called by ix_delete_token_badge; name [str]: from the handler's "Instruction: …" log; was fn_e9688)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, whirlpools_config_extension (ConstraintHasOne), token_mint, token_badge (ConstraintSeeds, ConstraintMut, ConstraintHasOne, ConstraintClose), receiver (AccountNotEnoughKeys, ConstraintMut), token_badge_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: receiver
export function accounts_delete_token_badge(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s68 = fp - 0x68, s88 = fp - 0x88, sc0 = fp - 0xc0, s100 = fp - 0x100, s120 = fp - 0x120, s140 = fp - 0x140, s180 = fp - 0x180, s188 = fp - 0x188, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s338 = fp - 0x338, s340 = fp - 0x340, s348 = fp - 0x348, s350 = fp - 0x350, s358 = fp - 0x358, s360 = fp - 0x360, s368 = fp - 0x368, s370 = fp - 0x370, s378 = fp - 0x378, s380 = fp - 0x380, s388 = fp - 0x388, s390 = fp - 0x390, s398 = fp - 0x398
	let m, n, q: u64
	try_accounts_11de0(s1a0, c, c, d, e)
	if (ld64(s1a0) == 0) {
		n = Error_with_account_name(s330, ld64(s1a0 + 8), ld64(s1a0 + 0x10), "whirlpools_config", 0x11)
		m = ld64(s330)
		st64(a + 0x10, ld64(s330 + 8))
		st64(a + 8, m)
		st32(a, 2)
		return n
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	st64(s338, b)
	const g = f != 0 ? sat_sub(f, 0x70) & -8 : 0x300007f90
	if (g > 0x300000007) {
		st64(s340, ld64(e - 0xff8))
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, s1a0, 0x70)
		try_accounts_120c0(s1a0, c)
		if (ld64(s1a0) == 0) {
			n = Error_with_account_name(s320, ld64(s1a0 + 8), ld64(s1a0 + 0x10), "whirlpools_config_extension", 0x1b)
			m = ld64(s320)
			st64(a + 0x10, ld64(s320 + 8))
			st64(a + 8, m)
			st32(a, 2)
			return n
		}
		const h = ld64(0x300000000 /* heap bump-allocator cursor */)
		const i = h != 0 ? sat_sub(h, 0x68) & -8 : 0x300007f98
		if (i > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			memcpy(i, s1a0, 0x68)
			try_accounts_11718(s1a0, c)
			const k = ld64(s1a0 + 8)
			const j = ld64(s1a0)
			if (j == 2) {
				st64(s348, k)
				try_accounts_610(s1a0, c, k)
				const l = ld32(s1a0)
				if (l == 2) {
					n = Error_with_account_name(s310, ld64(s1a0 + 8), ld64(s1a0 + 0x10), 0x100154f57 /* "token_mint" */, 0xa)
					m = ld64(s310)
					st64(a + 0x10, ld64(s310 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				st64(s358, l)
				st64(s370, ld64(s1a0 + 0x10))
				st64(s368, ld64(s1a0 + 8))
				st64(s360, ld32(s1a0 + 4))
				memcpy(s100, s188, 0x40)
				copy(s120, s140, 0x20)
				st64(s350, ld64(s180 + 0x38))
				fn_12178(s1a0, c)
				const o = ld8(s1a0 + 8)
				if (o == 2) {
					n = Error_with_account_name(s300, ld64(s1a0 + 0x10), ld64(s188), "token_badge", 0xb)
					m = ld64(s300)
					st64(a + 0x10, ld64(s300 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				st64(s390, o)
				st32(sc0 + 0x30, ld32(s1a0 + 9))
				st32(sc0 + 0x33, ld32(s1a0 + 0xc))
				st64(s378, ld64(s1a0))
				st64(s380, ld64(s1a0 + 0x10))
				st64(s388, ld64(s188))
				memcpy(sc0, s180, 0x30)
				const p = ld64(c + 8)
				if (p == 0) {
					anchor_error_from(s1c0, 0xbbd /* anchor::AccountNotEnoughKeys */)
					q = ld64(s1c0 + 8)
					const r = ld64(s1c0)
					if (r != 2) {
						n = Error_with_account_name(s1d0, r, q, "receiver", 8)
						m = ld64(s1d0)
						st64(a + 0x10, ld64(s1d0 + 8))
						st64(a + 8, m)
						st32(a, 2)
						return n
					}
				} else {
					st64(c + 8, p - 1)
					q = ld64(c)
					st64(c, q + 0x30)
				}
				st64(s398, q)
				copyr(s20, i + 8, 0x20)
				const s = ld64(ld64(g))
				copyr(s68, s, 0x20)
				if ((memcmp(s20, s68, 0x20) as u32) == 0) {
					const w = ld64(ld64(s348))
					copyr(s20, w, 0x20)
					copyr(s68, i + 0x48, 0x20)
					if ((memcmp(s20, s68, 0x20) as u32) == 0) {
						copyr(s40, s, 0x20)
						const aa = ld64(ld64(s350))
						copyr(s20, aa, 0x20)
						st64(s1a0, 0x100154db3, 0xb, s40, 0x20, s20, 0x20)
						// PDA find_program_address(["token_badge", *s, *aa], program *(ld64(s338)))
						Pubkey_find_program_address(s68, s1a0, 3, ld64(s338))
						copyr(s88, s68, 0x20)
						st8(ld64(s340), ld8(s68 + 0x20))
						const ab = ld64(ld64(s378) /* key */)
						copyr(s1a0, ab, 0x20)
						if ((memcmp(s1a0, s88, 0x20) as u32) == 0) {
							if (ld8(ld64(s378) + 0x29 /* is_writable */) == 0) {
								anchor_error_from(s2e0, 0x7d0 /* anchor::ConstraintMut */)
								n = Error_with_account_name(s2f0, ld64(s2e0), ld64(s2e0 + 8), "token_badge", 0xb)
								m = ld64(s2f0)
								st64(a + 0x10, ld64(s2f0 + 8))
								st64(a + 8, m)
								st32(a, 2)
								return n
							}
							st32(s20 + 3, ld32(sc0 + 0x33))
							st32(s20, ld32(sc0 + 0x30))
							st64(s20 + 0xf, ld64(s388))
							st64(s20 + 7, ld64(s380))
							st64(s20 + 0x17, ld64(sc0))
							st8(s20 + 0x1f, ld8(sc0 + 8))
							const af = ld64(ld64(g))
							copyr(s68, af, 0x20)
							if ((memcmp(s20, s68, 0x20) as u32) == 0) {
								copyr(s68, ab, 0x20)
								const receiver: AccountInfo = ld64(s398)
								const ak = receiver.key
								copyr(s1a0, ak, 0x20)
								if ((memcmp(s68, s1a0, 0x20) as u32) == 0) {
									anchor_error_from(s2c0, 0x7db /* anchor::ConstraintClose */)
									n = Error_with_account_name(s2d0, ld64(s2c0), ld64(s2c0 + 8), "token_badge", 0xb)
									m = ld64(s2d0)
									st64(a + 0x10, ld64(s2d0 + 8))
									st64(a + 8, m)
									st32(a, 2)
									return n
								}
								if (receiver.is_writable == 0) {
									anchor_error_from(s2a0, 0x7d0 /* anchor::ConstraintMut */)
									n = Error_with_account_name(s2b0, ld64(s2a0), ld64(s2a0 + 8), "receiver", 8)
									m = ld64(s2b0)
									st64(a + 0x10, ld64(s2b0 + 8))
									st64(a + 8, m)
									st32(a, 2)
									return n
								}
								memcpy(a + 0x18, s100, 0x40)
								copy(a + 0x60, s120, 0x20)
								st32(a + 0x8c, ld32(sc0 + 0x33))
								st32(a + 0x89, ld32(sc0 + 0x30))
								n = memcpy(a + 0xa0, sc0, 0x30)
								st64(a + 0xe8, receiver)
								st64(a + 0xe0, ld64(s348))
								st64(a + 0xd8, i)
								st64(a + 0xd0, g)
								st64(a + 0x98, ld64(s388))
								st64(a + 0x90, ld64(s380))
								st8(a + 0x88, ld64(s390))
								st64(a + 0x80, ld64(s378))
								st64(a + 0x58, ld64(s350))
								st64(a + 0x10, ld64(s370))
								st64(a + 8, ld64(s368))
								st32(a + 4, ld64(s360))
								st32(a, ld64(s358))
								return n
							}
							anchor_error_from(s270, 0x7d1 /* anchor::ConstraintHasOne */)
							const ai = Error_with_account_name(s280, ld64(s270), ld64(s270 + 8), "token_badge", 0xb)
							const ah = ld64(s280 + 8)
							const ag = ld64(s280)
							copyr(s1a0, s20, 0x20)
							copy(s180, s68, 0x20)
							n = fn_13b5c0(s290, ag, ah, s1a0, ai)
							m = ld64(s290)
							st64(a + 0x10, ld64(s290 + 8))
							st64(a + 8, m)
							st32(a, 2)
							return n
						}
						anchor_error_from(s240, 0x7d6 /* anchor::ConstraintSeeds */)
						const ae = Error_with_account_name(s250, ld64(s240), ld64(s240 + 8), "token_badge", 0xb)
						const ad = ld64(s250 + 8)
						const ac = ld64(s250)
						copyr(s1a0, ab, 0x20)
						copy(s180, s88, 0x20)
						n = fn_13b5c0(s260, ac, ad, s1a0, ae)
						m = ld64(s260)
						st64(a + 0x10, ld64(s260 + 8))
						st64(a + 8, m)
						st32(a, 2)
						return n
					}
					anchor_error_from(s210, 0x7dc /* anchor::ConstraintAddress */)
					const z = Error_with_account_name(s220, ld64(s210), ld64(s210 + 8), "token_badge_authority", 0x15)
					const y = ld64(s220 + 8)
					const x = ld64(s220)
					copyr(s1a0, s20, 0x20)
					copy(s180, s68, 0x20)
					n = fn_13b5c0(s230, x, y, s1a0, z)
					m = ld64(s230)
					st64(a + 0x10, ld64(s230 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				anchor_error_from(s1e0, 0x7d1 /* anchor::ConstraintHasOne */)
				const v = Error_with_account_name(s1f0, ld64(s1e0), ld64(s1e0 + 8), "whirlpools_config_extension", 0x1b)
				const u = ld64(s1f0 + 8)
				const t = ld64(s1f0)
				copyr(s1a0, s20, 0x20)
				copy(s180, s68, 0x20)
				n = fn_13b5c0(s200, t, u, s1a0, v)
				m = ld64(s200)
				st64(a + 0x10, ld64(s200 + 8))
				st64(a + 8, m)
				st32(a, 2)
				return n
			}
			n = Error_with_account_name(s1b0, j, k, "token_badge_authority", 0x15)
			m = ld64(s1b0)
			st64(a + 0x10, ld64(s1b0 + 8))
			st64(a + 8, m)
			st32(a, 2)
			return n
		}
		alloc_handle_alloc_error(8, 0x68)
	}
	alloc_handle_alloc_error(8, 0x70)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_badge
export function fn_eaae8(a: u64, b: u64): u64 {
	const s8 = fp - 0x8, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	const f: AccountInfo = ld64(b + 0xe8)
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
	const n: AccountInfo = ld64(b + 0x80)
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
	let x = fn_13aee8(s70, s30, s60, p, t)
	const v = ld64(s70)
	if (v == 2) {
		st64(a + 8, undef)
		st64(a, 2)
		return x
	}
	x = Error_with_account_name(s80, v, ld64(s70 + 8), "token_badge", 0xb)
	const w = ld64(s80)
	st64(a + 8, ld64(s80 + 8))
	st64(a, w)
	return x
}
