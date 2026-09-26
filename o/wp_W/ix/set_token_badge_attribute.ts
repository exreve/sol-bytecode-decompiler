/// <reference path="../lib.d.ts" />
// instruction set_token_badge_attribute
import { fn_147e78, fn_7be0, memcpy } from '../shared.ts'

// instruction handler: set_token_badge_attribute (discriminator sha256("global:set_token_badge_attribute")[..8] = 0x89f6938a214158e0)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, whirlpools_config_extension, token_mint, token_badge, token_badge_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_badge
export function ix_set_token_badge_attribute(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s10 = fp - 0x10, s11 = fp - 0x11, s30 = fp - 0x30, s31 = fp - 0x31, s108 = fp - 0x108, s120 = fp - 0x120, s188 = fp - 0x188, s1f0 = fp - 0x1f0, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s250 = fp - 0x250, s258 = fp - 0x258, s260 = fp - 0x260
	let j, k, n, o, p, r, s: u64
	B8: {
		B5: {
			st64(s250, program_id)
			sol_log("Instruction: SetTokenBadgeAttribute", 0x23)
			const f = ix_args_len
			if (f != 0) {
				const g = ix_args
				const h = ld8(g)
				st8(s31, h)
				if (h != 0) {
					st64(s120, 0x100159668)
					st64(s120 + 0x10, s208)
					st64(s208, s31, num_fmt_bae8)
					st64(s108 + 8, 0)
					st64(s120 + 8, 1)
					st64(s108, 1)
					j = s30
				} else {
					if (f == 1) {
						break B5
					}
					const i = ld8(g + 1)
					st8(s11, i)
					if (2 > i) {
						st64(s30, accounts, accounts_len)
						s = accounts_set_token_badge_attribute(s120, g, s30, undef, fp)
						const t = ld32(s120)
						if (t == 2) {
							r = ld64(s120 + 8)
							st64(a + 8, ld64(s120 + 0x10))
							st64(a, r)
							return s
						}
						st64(s258, ld32(s120 + 4))
						st64(s260, ld64(s120 + 8))
						const u = ld64(s120 + 0x10)
						memcpy(s1f0, s108, 0xd0)
						st64(s208 + 0x10, u)
						st64(s208 + 8, ld64(s260))
						st32(s208 + 4, ld64(s258))
						st32(s208, t)
						if ((ld16(ld64(s188 + 0x50) + 0x6a) & 1) == 0) {
							s = fn_87630(s218, 0x42)
							r = ld64(s218)
							if (r != 2) {
								st64(a + 8, ld64(s218 + 8))
								st64(a, r)
								return s
							}
						}
						st8(s188 + 8, i)
						s = fn_7be0(s228, s188, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, ld64(s250))
						const q = ld64(s228)
						if (q != 2) {
							s = Error_with_account_name(s238, q, ld64(s228 + 8), "token_badge", 0xb)
							r = ld64(s238)
							st64(a + 8, ld64(s238 + 8))
							st64(a, r)
							return s
						}
						st64(a + 8, q)
						st64(a, 2)
						return s
					}
					st64(s120, 0x100159620)
					st64(s120 + 0x10, s10)
					st64(s10, s11, fn_14ef78)
					st64(s108 + 8, 0)
					st64(s120 + 8, 1)
					st64(s108, 1)
					j = s208
				}
				fn_147e78(j, s120, h)
				k = fn_b580(j)
				break B8
			}
		}
		k = fn_1459d0(0x100159468)
	}
	const l = k
	if (2 > (k & 3) - 2) {
		s = anchor_error_from(s248, 0x66 /* anchor::InstructionDidNotDeserialize */, n, o, p)
		r = ld64(s248)
		st64(a + 8, ld64(s248 + 8))
		st64(a, r)
		return s
	}
	if ((l & 3) == 0) {
		s = anchor_error_from(s248, 0x66 /* anchor::InstructionDidNotDeserialize */, n, o, p)
		r = ld64(s248)
		st64(a + 8, ld64(s248 + 8))
		st64(a, r)
		return s
	}
	const m = ld64(ld64(k + 7))
	callx(m, ld64(k - 1), m)
	s = anchor_error_from(s248, 0x66 /* anchor::InstructionDidNotDeserialize */)
	r = ld64(s248)
	st64(a + 8, ld64(s248 + 8))
	st64(a, r)
	return s
}

// Anchor Accounts::try_accounts of instruction set_token_badge_attribute (called by ix_set_token_badge_attribute; name [str]: from the handler's "Instruction: …" log; was fn_f3c40)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, whirlpools_config_extension (ConstraintHasOne), token_mint, token_badge (ConstraintMut, ConstraintHasOne), token_badge_authority (ConstraintAddress)
export function accounts_set_token_badge_attribute(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s6f = fp - 0x6f, s78 = fp - 0x78, sb8 = fp - 0xb8, sd8 = fp - 0xd8, sf8 = fp - 0xf8, s138 = fp - 0x138, s140 = fp - 0x140, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8, s2b0 = fp - 0x2b0, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2c8 = fp - 0x2c8, s2d0 = fp - 0x2d0, s2d8 = fp - 0x2d8
	let m, n: u64
	try_accounts_11de0(s158, c, c, d, e)
	if (ld64(s158) == 0) {
		n = Error_with_account_name(s288, ld64(s158 + 8), ld64(s158 + 0x10), "whirlpools_config", 0x11)
		m = ld64(s288)
		st64(a + 0x10, ld64(s288 + 8))
		st64(a + 8, m)
		st32(a, 2)
		return n
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x70) & -8 : 0x300007f90
	if (g > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, s158, 0x70)
		try_accounts_120c0(s158, c)
		if (ld64(s158) == 0) {
			n = Error_with_account_name(s278, ld64(s158 + 8), ld64(s158 + 0x10), "whirlpools_config_extension", 0x1b)
			m = ld64(s278)
			st64(a + 0x10, ld64(s278 + 8))
			st64(a + 8, m)
			st32(a, 2)
			return n
		}
		const h = ld64(0x300000000 /* heap bump-allocator cursor */)
		const i = h != 0 ? sat_sub(h, 0x68) & -8 : 0x300007f98
		if (i > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			memcpy(i, s158, 0x68)
			try_accounts_11718(s158, c)
			const k = ld64(s158 + 8)
			const j = ld64(s158)
			if (j == 2) {
				st64(s290, k)
				try_accounts_610(s158, c, k)
				const l = ld32(s158)
				if (l == 2) {
					n = Error_with_account_name(s268, ld64(s158 + 8), ld64(s158 + 0x10), 0x100154f57 /* "token_mint" */, 0xa)
					m = ld64(s268)
					st64(a + 0x10, ld64(s268 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				st64(s2a0, l)
				st64(s2b8, ld64(s158 + 0x10))
				st64(s2b0, ld64(s158 + 8))
				st64(s2a8, ld32(s158 + 4))
				memcpy(sb8, s140, 0x40)
				copy(sd8, sf8, 0x20)
				st64(s298, ld64(s138 + 0x38))
				fn_12178(s158, c)
				const o = ld8(s158 + 8)
				if (o == 2) {
					n = Error_with_account_name(s258, ld64(s158 + 0x10), ld64(s140), "token_badge", 0xb)
					m = ld64(s258)
					st64(a + 0x10, ld64(s258 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				st64(s2d8, o)
				st32(s6f + 0x27, ld32(s158 + 9))
				st32(s6f + 0x2a, ld32(s158 + 0xc))
				st64(s2c0, ld64(s158))
				st64(s2c8, ld64(s158 + 0x10))
				st64(s2d0, ld64(s140))
				memcpy(s78, s138, 0x30)
				copyr(s40, i + 8, 0x20)
				const p = ld64(ld64(g))
				copyr(s20, p, 0x20)
				if ((memcmp(s40, s20, 0x20) as u32) == 0) {
					const t = ld64(ld64(s290))
					copyr(s40, t, 0x20)
					copyr(s20, i + 0x48, 0x20)
					if ((memcmp(s40, s20, 0x20) as u32) == 0) {
						if (ld8(ld64(s2c0) + 0x29) == 0) {
							anchor_error_from(s238, 0x7d0 /* anchor::ConstraintMut */)
							n = Error_with_account_name(s248, ld64(s238), ld64(s238 + 8), "token_badge", 0xb)
							m = ld64(s248)
							st64(a + 0x10, ld64(s248 + 8))
							st64(a + 8, m)
							st32(a, 2)
							return n
						}
						st32(s40 + 3, ld32(s6f + 0x2a))
						st32(s40, ld32(s6f + 0x27))
						st64(s40 + 0xf, ld64(s2d0))
						st64(s40 + 7, ld64(s2c8))
						st64(s40 + 0x17, ld64(s78))
						st8(s40 + 0x1f, ld8(s78 + 8))
						copyr(s20, p, 0x20)
						if ((memcmp(s40, s20, 0x20) as u32) != 0) {
							anchor_error_from(s1d8, 0x7d1 /* anchor::ConstraintHasOne */)
							const ae = Error_with_account_name(s1e8, ld64(s1d8), ld64(s1d8 + 8), "token_badge", 0xb)
							const ad = ld64(s1e8 + 8)
							const ac = ld64(s1e8)
							copy(s158, s40, 0x40)
							n = fn_13b5c0(s1f8, ac, ad, s158, ae)
							m = ld64(s1f8)
							st64(a + 0x10, ld64(s1f8 + 8))
							st64(a + 8, m)
							st32(a, 2)
							return n
						}
						copyr(s40, s6f, 0x20)
						const x = ld64(s298)
						const y = ld64(x)
						copyr(s20, y, 0x20)
						if ((memcmp(s40, s20, 0x20) as u32) == 0) {
							memcpy(a + 0x18, sb8, 0x40)
							copy(a + 0x60, sd8, 0x20)
							st32(a + 0x8c, ld32(s6f + 0x2a))
							st32(a + 0x89, ld32(s6f + 0x27))
							n = memcpy(a + 0xa0, s78, 0x30)
							st64(a + 0xe0, ld64(s290))
							st64(a + 0xd8, i)
							st64(a + 0xd0, g)
							st64(a + 0x98, ld64(s2d0))
							st64(a + 0x90, ld64(s2c8))
							st8(a + 0x88, ld64(s2d8))
							st64(a + 0x80, ld64(s2c0))
							st64(a + 0x58, x)
							st64(a + 0x10, ld64(s2b8))
							st64(a + 8, ld64(s2b0))
							st32(a + 4, ld64(s2a8))
							st32(a, ld64(s2a0))
							return n
						}
						anchor_error_from(s208, 0x7d1 /* anchor::ConstraintHasOne */)
						const ab = Error_with_account_name(s218, ld64(s208), ld64(s208 + 8), "token_badge", 0xb)
						const aa = ld64(s218 + 8)
						const z = ld64(s218)
						copyr(s158, s6f, 0x20)
						copy(s138, s20, 0x20)
						n = fn_13b5c0(s228, z, aa, s158, ab)
						m = ld64(s228)
						st64(a + 0x10, ld64(s228 + 8))
						st64(a + 8, m)
						st32(a, 2)
						return n
					}
					anchor_error_from(s1a8, 0x7dc /* anchor::ConstraintAddress */)
					const w = Error_with_account_name(s1b8, ld64(s1a8), ld64(s1a8 + 8), "token_badge_authority", 0x15)
					const v = ld64(s1b8 + 8)
					const u = ld64(s1b8)
					copy(s158, s40, 0x40)
					n = fn_13b5c0(s1c8, u, v, s158, w)
					m = ld64(s1c8)
					st64(a + 0x10, ld64(s1c8 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				anchor_error_from(s178, 0x7d1 /* anchor::ConstraintHasOne */)
				const s = Error_with_account_name(s188, ld64(s178), ld64(s178 + 8), "whirlpools_config_extension", 0x1b)
				const r = ld64(s188 + 8)
				const q = ld64(s188)
				copy(s158, s40, 0x40)
				n = fn_13b5c0(s198, q, r, s158, s)
				m = ld64(s198)
				st64(a + 0x10, ld64(s198 + 8))
				st64(a + 8, m)
				st32(a, 2)
				return n
			}
			n = Error_with_account_name(s168, j, k, "token_badge_authority", 0x15)
			m = ld64(s168)
			st64(a + 0x10, ld64(s168 + 8))
			st64(a + 8, m)
			st32(a, 2)
			return n
		}
		alloc_handle_alloc_error(8, 0x68)
	}
	alloc_handle_alloc_error(8, 0x70)
}
