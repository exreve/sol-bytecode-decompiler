/// <reference path="../lib.d.ts" />
// instruction update_amm_config
import { anchor_error_from, fn_13e5a0, fn_14ed60, fn_154730, fn_26a0, fn_85138, fn_88360, fn_88558, fn_aa20, log_data, memcpy } from '../shared.ts'

// instruction handler: update_amm_config (discriminator sha256("global:update_amm_config")[..8] = 0xc8741c9a88ae3c31)
// accounts [idl]: 0 owner [signer, = GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ], 1 amm_config [mut]
// args [idl]: param: u8, value: u32
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, value, param
export function ix_update_amm_config(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s68 = fp - 0x68, s70 = fp - 0x70, s80 = fp - 0x80, se8 = fp - 0xe8, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140
	let k, n: u64
	const h = sol_log("Instruction: UpdateAmmConfig", 0x1c)
	if (5 > ix_args_len) {
		const l = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		if (2 > (l & 3) - 2) {
			n = anchor_error_from(s140, 0x66 /* anchor::InstructionDidNotDeserialize */)
			k = ld64(s140)
			st64(a + 8, ld64(s140 + 8))
			st64(a, k)
			return n
		}
		if ((l & 3) == 0) {
			n = anchor_error_from(s140, 0x66 /* anchor::InstructionDidNotDeserialize */)
			k = ld64(s140)
			st64(a + 8, ld64(s140 + 8))
			st64(a, k)
			return n
		}
		const m = ld64(ld64(l + 7))
		if (m == 0) {
			n = anchor_error_from(s140, 0x66 /* anchor::InstructionDidNotDeserialize */)
			k = ld64(s140)
			st64(a + 8, ld64(s140 + 8))
			st64(a, k)
			return n
		}
		callx(m, ld64(l - 1), m)
		n = anchor_error_from(s140, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s140)
		st64(a + 8, ld64(s140 + 8))
		st64(a, k)
		return n
	}
	const args: UpdateAmmConfigArgs = ix_args
	const value = args.value
	const param = args.param
	st64(s110, accounts, accounts_len)
	n = fn_c4f30(s80, value, s110, undef, fp, h)
	const j = ld64(s70)
	k = ld64(s80 + 8)
	const i = ld64(s80)
	if (i == 0) {
		st64(a + 8, j)
		st64(a, k)
		return n
	}
	memcpy(se8, s68, 0x68)
	st64(s100, i, k, j)
	copyr(s70, s110, 0x10)
	st64(s80, program_id, s100)
	n = fn_4bfc8(s120, s80, param, value)
	k = ld64(s120)
	if (k == 2) {
		n = fn_c5880(s130, s100, program_id)
		k = ld64(s130)
		st64(a + 8, ld64(s130 + 8))
		st64(a, k)
		return n
	}
	st64(a + 8, ld64(s120 + 8))
	st64(a, k)
	return n
}

export function fn_c4f30(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s80 = fp - 0x80, sd8 = fp - 0xd8, se0 = fp - 0xe0, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s130 = fp - 0x130
	let r: u64
	let aa = try_accounts_17a30(sf8, c, c, d, e, r0)
	const i = ld64(sf8 + 8)
	let f = ld64(sf8)
	if (f != 2) {
		const q = ld64(0x300000000 /* heap bump-allocator cursor */)
		r = 5 > q
		const n = r != 0 ? 0 : q - 5
		const s = q != 0 ? n : 0x300007ffb
		if ((f & 1) != 0) {
			if (0x300000008 > s) {
				raw_vec_handle_error(1, 5, 0x10015f8f8, n, r)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, s)
			st8(s + 4, 0x72)
			st32(s, 0x656e776f)
			void ld64(i)
		} else {
			if (0x300000008 > s) {
				raw_vec_handle_error(1, 5, 0x10015f8f8, n, r)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, s)
			st8(s + 4, 0x72)
			st32(s, 0x656e776f)
			void ld64(i)
		}
		st64(i + 0x10, s, 5)
		st64(i + 8, 5)
		st64(i, 1)
		st64(a + 0x10, i)
		st64(a + 8, f)
		st64(a, 0)
		return aa
	}
	aa = try_accounts_184d8(sf8, c)
	const v = ld64(sf8 + 0x10)
	let h = ld64(sf8 + 8)
	const g = ld64(sf8)
	if (g == 0) {
		const t = ld64(0x300000000 /* heap bump-allocator cursor */)
		const u = t != 0 ? sat_sub(t, 0xa) : 0x300007ff6
		if ((h & 1) != 0) {
			if (0x300000008 > u) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > t, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, u)
			st64(u, 0x666e6f635f6d6d61)
			st16(u + 8, 0x6769)
			void ld64(v)
		} else {
			if (0x300000008 > u) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > t, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, u)
			st64(u, 0x666e6f635f6d6d61)
			st16(u + 8, 0x6769)
			void ld64(v)
		}
		st64(v + 0x10, u, 0xa)
		st64(v + 8, 0xa)
		st64(v, 1)
		st64(a + 0x10, v)
		st64(a + 8, h)
		st64(a, 0)
		return aa
	}
	st64(s130, h)
	memcpy(s80, se0, 0x60)
	const j = ld64(i)
	copyr(s20, j, 0x20)
	if ((memcmp(s20, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) == 0) {
		if (ld8(g + 0x29) != 0) {
			aa = memcpy(a + 0x20, s80, 0x60)
			st64(a + 0x18, v)
			st64(a + 0x10, ld64(s130))
			st64(a + 8, g)
			st64(a, i)
			return aa
		}
		aa = anchor_error_from(s128, 0x7d0 /* anchor::ConstraintMut */)
		h = undef
		const w = ld64(0x300000000 /* heap bump-allocator cursor */)
		const y = w != 0 ? sat_sub(w, 0xa) : 0x300007ff6
		const z = ld64(s128 + 8)
		const x = ld64(s128)
		if ((x & 1) != 0) {
			if (0x300000008 > y) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, y)
			st64(y, 0x666e6f635f6d6d61)
			st16(y + 8, 0x6769)
			void ld64(z)
		} else {
			if (0x300000008 > y) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, y)
			st64(y, 0x666e6f635f6d6d61)
			st16(y + 8, 0x6769)
			void ld64(z)
		}
		st64(z + 0x10, y, 0xa)
		st64(z + 8, 0xa)
		st64(z, 1)
		st64(a + 0x10, z)
		st64(a + 8, x)
		st64(a, 0)
		return aa
	}
	const p = fn_88360(s108, 0)
	r = undef
	const k = ld64(0x300000000 /* heap bump-allocator cursor */)
	const m = k != 0 ? sat_sub(k, 5) : 0x300007ffb
	const o = ld64(s108 + 8)
	const l = ld64(s108)
	if ((l & 1) != 0) {
		if (0x300000008 > m) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, 0x300000008, r)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, m)
		st8(m + 4, 0x72)
		st32(m, 0x656e776f)
		void ld64(o)
	} else {
		if (0x300000008 > m) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, 0x300000008, r)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, m)
		st8(m + 4, 0x72)
		st32(m, 0x656e776f)
		void ld64(o)
	}
	st64(o + 0x10, m, 5)
	st64(o + 8, 5)
	st64(o, 1)
	copyr(sf8, s20, 0x20)
	st64(sd8, 0xa6bd3bcb652bb6e5, 0x648eee6fe68868f5, 0xb1880f9c196055dc, 0xa18a9e05bd73e21f) // key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ
	aa = Error_with_pubkeys(s118, l, o, sf8, p)
	f = ld64(s118)
	st64(a + 0x10, ld64(s118 + 8))
	st64(a + 8, f)
	st64(a, 0)
	return aa
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value)
export function fn_4bfc8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8
	let f, q, y, z: u64
	B35: {
		f = ld64(b + 8)
		if (((c as u8) as i64) > 1) {
			if ((c as u8) == 2) {
				if ((d as u32) > 0xf4240) {
					ErrorCode_name(s78, 0x100159858, c as u8, d as u32, e)
					st64(s60, 0, 1, 0)
					st64(s28, s60, 0x10015f818)
					st8(s28 + 0x18, 3)
					st64(s28 + 0x10, 0x20)
					st64(s48 + 0x10, 0)
					st64(s48, 0)
					if (ErrorCode_fmt(0x100159858, s48) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
					}
					copy(sf8, s78, 0x30)
					st64(s118 + 8, 0x10015a18a)
					st32(sf8 + 0x78, 0x9ca /* anchor::RequireGteViolated */)
					st8(sf8 + 0x30, 2)
					st32(s118 + 0x18, 0x4d)
					st64(s118 + 0x10, 0x38)
					st64(s118, 0)
					fn_13e5a0(s168, s118)
					z = fn_26a0(s178, ld64(s168), ld64(s168 + 8), d)
					y = ld64(s178 + 8)
					q = ld64(s178)
					if (q == 2) {
						break B35
					}
					st64(a + 8, y)
					st64(a, q)
					return z
				}
				const h = (d as u32) + ld32(f + 0x68)
				if ((h as u32) != h) {
					fn_154730(0x10015fe88, b, c as u8, h, e)
				}
				if ((h as u32) > 0xf4240) {
					ErrorCode_name(s78, 0x100159858, c as u8, h, e)
					st64(s60, 0, 1, 0)
					st64(s28, s60, 0x10015f818)
					st8(s28 + 0x18, 3)
					st64(s28 + 0x10, 0x20)
					st64(s48 + 0x10, 0)
					st64(s48, 0)
					if (ErrorCode_fmt(0x100159858, s48) == 0) {
						copy(sf8, s78, 0x30)
						st64(s118 + 8, 0x10015a18a)
						st32(sf8 + 0x78, 0x9ca /* anchor::RequireGteViolated */)
						st8(sf8 + 0x30, 2)
						st32(s118 + 0x18, 0x4e)
						st64(s118 + 0x10, 0x38)
						st64(s118, 0)
						fn_13e5a0(s148, s118)
						z = fn_26a0(s158, ld64(s148), ld64(s148 + 8), h)
						y = ld64(s158 + 8)
						q = ld64(s158)
						if (q == 2) {
							break B35
						}
						st64(a + 8, y)
						st64(a, q)
						return z
					}
					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
				}
				st32(f + 0x70, d)
				break B35
			}
			if ((c as u8) == 3) {
				if (ld64(b + 0x18) == 0) {
					z = fn_88360(s138, 2)
					q = ld64(s138)
					st64(a + 8, ld64(s138 + 8))
					st64(a, q)
					return z
				}
				const i = ld64(ld64(b + 0x10))
				const l = ld64(i)
				const k = ld64(i + 8)
				const j = ld64(i + 0x10)
				st64(f + 0x28, ld64(i + 0x18))
				st64(f + 0x20, j)
				st64(f + 0x18, k)
				st64(f + 0x10, l)
				break B35
			}
			if ((c as u8) == 4) {
				if (ld64(b + 0x18) == 0) {
					z = fn_88360(s128, 2)
					q = ld64(s128)
					st64(a + 8, ld64(s128 + 8))
					st64(a, q)
					return z
				}
				const m = ld64(ld64(b + 0x10))
				const p = ld64(m)
				const o = ld64(m + 8)
				const n = ld64(m + 0x10)
				st64(f + 0x48, ld64(m + 0x18))
				st64(f + 0x40, n)
				st64(f + 0x38, o)
				st64(f + 0x30, p)
				break B35
			}
		} else {
			if ((c as u8) == 0) {
				if ((d as u32) > 0xf423f) {
					ErrorCode_name(s78, 0x100159900, c as u8, d as u32, e)
					st64(s60, 0, 1, 0)
					st64(s28, s60, 0x10015f818)
					st8(s28 + 0x18, 3)
					st64(s28 + 0x10, 0x20)
					st64(s48 + 0x10, 0)
					st64(s48, 0)
					if (ErrorCode_fmt(0x100159900, s48) == 0) {
						copy(sf8, s78, 0x30)
						st64(s118 + 8, 0x10015a18a)
						st32(sf8 + 0x78, 0x9c9 /* anchor::RequireGtViolated */)
						st8(sf8 + 0x30, 2)
						st32(s118 + 0x18, 0x47)
						st64(s118 + 0x10, 0x38)
						st64(s118, 0)
						fn_13e5a0(s1c8, s118)
						z = fn_26a0(s1d8, ld64(s1c8), ld64(s1c8 + 8), d)
						y = ld64(s1d8 + 8)
						q = ld64(s1d8)
						if (q == 2) {
							break B35
						}
						st64(a + 8, y)
						st64(a, q)
						return z
					}
					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
				}
				st32(f + 0x6c, d)
				break B35
			}
			if ((c as u8) == 1) {
				if ((d as u32) > 0xf4240) {
					ErrorCode_name(s78, 0x100159858, c as u8, d as u32, e)
					st64(s60, 0, 1, 0)
					st64(s28, s60, 0x10015f818)
					st8(s28 + 0x18, 3)
					st64(s28 + 0x10, 0x20)
					st64(s48 + 0x10, 0)
					st64(s48, 0)
					if (ErrorCode_fmt(0x100159858, s48) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
					}
					copy(sf8, s78, 0x30)
					st64(s118 + 8, 0x10015a18a)
					st32(sf8 + 0x78, 0x9ca /* anchor::RequireGteViolated */)
					st8(sf8 + 0x30, 2)
					st32(s118 + 0x18, 0x3d)
					st64(s118 + 0x10, 0x38)
					st64(s118, 0)
					fn_13e5a0(s1a8, s118)
					z = fn_26a0(s1b8, ld64(s1a8), ld64(s1a8 + 8), d)
					y = ld64(s1b8 + 8)
					q = ld64(s1b8)
					if (q == 2) {
						break B35
					}
					st64(a + 8, y)
					st64(a, q)
					return z
				}
				const g = (d as u32) + ld32(f + 0x70)
				if ((g as u32) != g) {
					fn_154730(0x10015fe70, b, c as u8, g, e)
				}
				if ((g as u32) > 0xf4240) {
					ErrorCode_name(s78, 0x100159858, c as u8, g, e)
					st64(s60, 0, 1, 0)
					st64(s28, s60, 0x10015f818)
					st8(s28 + 0x18, 3)
					st64(s28 + 0x10, 0x20)
					st64(s48 + 0x10, 0)
					st64(s48, 0)
					if (ErrorCode_fmt(0x100159858, s48) == 0) {
						copy(sf8, s78, 0x30)
						st64(s118 + 8, 0x10015a18a)
						st32(sf8 + 0x78, 0x9ca /* anchor::RequireGteViolated */)
						st8(sf8 + 0x30, 2)
						st32(s118 + 0x18, 0x3e)
						st64(s118 + 0x10, 0x38)
						st64(s118, 0)
						fn_13e5a0(s188, s118)
						z = fn_26a0(s198, ld64(s188), ld64(s188 + 8), g)
						y = ld64(s198 + 8)
						q = ld64(s198)
						if (q == 2) {
							break B35
						}
						st64(a + 8, y)
						st64(a, q)
						return z
					}
					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
				}
				st32(f + 0x68, d)
				break B35
			}
		}
		fn_85138(s78, 0x1001598bc)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_88558(0x1001598bc, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(sf8, s78, 0x30)
		st64(s118 + 8, 0x10015a18a)
		st32(sf8 + 0x78, 0x1771 /* error::InvalidUpdateConfigFlag */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x29)
		st64(s118 + 0x10, 0x38)
		st64(s118, 0)
		z = fn_13e5a0(s1e8, s118)
		q = ld64(s1e8)
		st64(a + 8, ld64(s1e8 + 8))
		st64(a, q)
		return z
	}
	const t = ld16(f + 0x78)
	copyr(s118, f + 0x10, 0x20)
	const w = ld32(f + 0x6c)
	const x = ld32(f + 0x68)
	const v = ld16(f + 0x7a)
	const u = ld32(f + 0x70)
	copyr(sf8, f + 0x30, 0x20)
	const r = ld64(0x300000000 /* heap bump-allocator cursor */)
	const s = r != 0 ? sat_sub(r, 0x100) : 0x300007f00
	if (s > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, s)
		st16(s + 8, t)
		st64(s, 0x975f706a7707bdf7 /* event:ConfigChangeEvent */)
		copy(s + 0xa, s118, 0x20)
		st32(s + 0x34, u)
		st16(s + 0x32, v)
		st32(s + 0x2e, w)
		st32(s + 0x2a, x)
		copy(s + 0x38, sf8, 0x20)
		st64(s48, s, 0x58)
		z = log_data(s48, 1)
		st64(a + 8, undef)
		st64(a, 2)
		return z
	}
	raw_vec_handle_error(1, 0x100, 0x1001609d0, t, u)
}

export function fn_c5880(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10
	const j = fn_aa20(s10, b + 8, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
	let i = undef
	const f = ld64(s10)
	if (f == 2) {
		st64(a + 8, i)
		st64(a, f)
		return j
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0xa) : 0x300007ff6
	i = ld64(s10 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x666e6f635f6d6d61)
		st16(h + 8, 0x6769)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x666e6f635f6d6d61)
		st16(h + 8, 0x6769)
		void ld64(i)
	}
	st64(i + 0x10, h, 0xa)
	st64(i + 8, 0xa)
	st64(i, 1)
	st64(a + 8, i)
	st64(a, f)
	return j
}
