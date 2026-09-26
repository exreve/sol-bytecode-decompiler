/// <reference path="../lib.d.ts" />
// instruction collect_protocol_fees
import { fn_652d0, fn_6aa0, memcpy } from '../shared.ts'

// instruction handler: collect_protocol_fees (discriminator sha256("global:collect_protocol_fees")[..8] = 0xdc46b29662174316)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, whirlpool, token_vault_a, token_vault_b, token_destination_a, token_destination_b, token_program, collect_protocol_fees_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
export function ix_collect_protocol_fees(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s24 = fp - 0x24, s28 = fp - 0x28, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s324 = fp - 0x324, s3b8 = fp - 0x3b8, s470 = fp - 0x470, s528 = fp - 0x528, s5e0 = fp - 0x5e0, s5e8 = fp - 0x5e8, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s1000 = fp - 0x1000
	sol_log("Instruction: CollectProtocolFees", 0x20)
	st64(s610, accounts, accounts_len)
	let j = accounts_collect_protocol_fees(s300, undef, s610, undef, fp)
	const h = ld64(s300 + 8)
	let g = ld64(s300)
	const f = ld32(s28)
	if (f == 2) {
		st64(a + 8, h)
		st64(a, g)
		return j
	}
	memcpy(s5f0, s2f0, 0x2c8)
	copy(s324, s24, 0x20)
	st32(s324 + 0x20, ld32(s24 + 0x20))
	st32(s3b8 + 0x90, f)
	st64(s600, g, h)
	st64(s1000 + 8, ld64(h + 0x268))
	st64(s1000, s5e8)
	j = fn_652d0(s620, h, s5e0, s470, s5e8, ld64(s1000 + 8))
	g = ld64(s620)
	if (g != 2) {
		st64(a + 8, ld64(s620 + 8))
		st64(a, g)
		return j
	}
	const i = ld64(h + 0x270)
	st64(s1000, s5e8, i)
	j = fn_652d0(s630, h, s528, s3b8, s5e8, i)
	g = ld64(s630)
	if (g == 2) {
		st64(h + 0x270, 0)
		st64(h + 0x268, 0)
		j = fn_90f88(s640, s600, program_id)
		g = ld64(s640)
		st64(a + 8, ld64(s640 + 8))
		st64(a, g)
		return j
	}
	st64(a + 8, ld64(s630 + 8))
	st64(a, g)
	return j
}

// Anchor Accounts::try_accounts of instruction collect_protocol_fees (called by ix_collect_protocol_fees; name [str]: from the handler's "Instruction: …" log; was fn_8f630)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, whirlpool (ConstraintMut, ConstraintHasOne), token_vault_a (ConstraintMut, ConstraintAddress), token_vault_b (ConstraintMut, ConstraintAddress), token_destination_a (ConstraintMut, ConstraintRaw), token_destination_b (ConstraintMut, ConstraintRaw), token_program (ConstraintAddress), collect_protocol_fees_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: token_program, token_vault_a, token_vault_b
export function accounts_collect_protocol_fees(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1fc = fp - 0x1fc, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2d0 = fp - 0x2d0, s2f4 = fp - 0x2f4, s378 = fp - 0x378, s380 = fp - 0x380, s388 = fp - 0x388, s3ac = fp - 0x3ac, s430 = fp - 0x430, s438 = fp - 0x438, s440 = fp - 0x440, s4c0 = fp - 0x4c0, s4e8 = fp - 0x4e8, s568 = fp - 0x568, s590 = fp - 0x590, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s700 = fp - 0x700, s710 = fp - 0x710, s720 = fp - 0x720, s730 = fp - 0x730, s740 = fp - 0x740, s750 = fp - 0x750, s760 = fp - 0x760, s770 = fp - 0x770, s780 = fp - 0x780, s790 = fp - 0x790, s7a0 = fp - 0x7a0, s7b0 = fp - 0x7b0, s7c0 = fp - 0x7c0, s7d0 = fp - 0x7d0, s7e0 = fp - 0x7e0, s800 = fp - 0x800, s838 = fp - 0x838
	let o, p: u64
	try_accounts_11de0(s290, c, c, d, e)
	if (ld64(s290) == 0) {
		p = Error_with_account_name(s7e0, ld64(s290 + 8), ld64(s280), "whirlpools_config", 0x11)
		o = ld64(s7e0)
		st64(a + 8, ld64(s7e0 + 8))
		st64(a, o)
		st32(a + 0x2d8, 2)
		return p
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x70) & -8 : 0x300007f90
	if (g > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, s290, 0x70)
		try_accounts_11a48(s290, c)
		if (ld64(s290) == 0) {
			p = Error_with_account_name(s7d0, ld64(s290 + 8), ld64(s280), 0x100152b28 /* "whirlpool" */, 9)
			o = ld64(s7d0)
			st64(a + 8, ld64(s7d0 + 8))
			st64(a, o)
			st32(a + 0x2d8, 2)
			return p
		}
		const h = ld64(0x300000000 /* heap bump-allocator cursor */)
		const i = h != 0 ? sat_sub(h, 0x290) & -8 : 0x300007d70
		if (i > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			memcpy(i, s290, 0x290)
			try_accounts_11718(s290, c)
			const k = ld64(s290 + 8)
			const j = ld64(s290)
			if (j == 2) {
				st64(s800 + 0x18, k)
				try_accounts_11f50(s290, c, k)
				const n = ld64(s290 + 8)
				const m = ld64(s290)
				const l = ld32(s270 + 0x70)
				if (l == 2) {
					p = Error_with_account_name(s7c0, m, n, "token_vault_a", 0xd)
					o = ld64(s7c0)
					st64(a + 8, ld64(s7c0 + 8))
					st64(a, o)
					st32(a + 0x2d8, 2)
					return p
				}
				st64(s800, l, n, m)
				memcpy(s568, s280, 0x80)
				copy(s590, s1fc, 0x20)
				st32(s590 + 0x20, ld32(s1fc + 0x20))
				try_accounts_11f50(s290, c)
				const s = ld64(s290 + 8)
				const r = ld64(s290)
				const q = ld32(s270 + 0x70)
				if (q == 2) {
					p = Error_with_account_name(s7b0, r, s, "token_vault_b", 0xd)
					o = ld64(s7b0)
					st64(a + 8, ld64(s7b0 + 8))
					st64(a, o)
					st32(a + 0x2d8, 2)
					return p
				}
				st64(s838 + 0x18, q)
				st64(s838 + 0x30, r)
				st64(s838 + 0x20, s)
				memcpy(s4c0, s280, 0x80)
				copy(s4e8, s1fc, 0x20)
				st32(s4e8 + 0x20, ld32(s1fc + 0x20))
				try_accounts_11f50(s290, c)
				const v = ld64(s290 + 8)
				const u = ld64(s290)
				const t = ld32(s270 + 0x70)
				if (t == 2) {
					p = Error_with_account_name(s7a0, u, v, "token_destination_a", 0x13)
					o = ld64(s7a0)
					st64(a + 8, ld64(s7a0 + 8))
					st64(a, o)
					st32(a + 0x2d8, 2)
					return p
				}
				st64(s838 + 0x10, t)
				st64(s838 + 0x28, u)
				st64(s838 + 8, v)
				memcpy(s430, s280, 0x80)
				copy(s3ac, s1fc, 0x20)
				st32(s3ac + 0x20, ld32(s1fc + 0x20))
				st32(s430 + 0x80, ld64(s838 + 0x10))
				st64(s438, ld64(s838 + 8))
				st64(s440, ld64(s838 + 0x28))
				try_accounts_11f50(s290, c)
				const y = ld64(s290 + 8)
				const x = ld64(s290)
				const w = ld32(s270 + 0x70)
				if (w == 2) {
					p = Error_with_account_name(s790, x, y, "token_destination_b", 0x13)
					o = ld64(s790)
					st64(a + 8, ld64(s790 + 8))
					st64(a, o)
					st32(a + 0x2d8, 2)
					return p
				}
				st64(s838, y, w, x)
				memcpy(s378, s280, 0x80)
				copy(s2f4, s1fc, 0x20)
				st32(s2f4 + 0x20, ld32(s1fc + 0x20))
				st32(s378 + 0x80, ld64(s838 + 8))
				st64(s380, ld64(s838))
				st64(s388, ld64(s838 + 0x10))
				fn_129a0(s290, c)
				const token_program: AccountInfo = ld64(s290 + 8)
				const z = ld64(s290)
				if (z == 2) {
					if (ld8(ld64(i) + 0x29) == 0) {
						anchor_error_from(s770, 0x7d0 /* anchor::ConstraintMut */, token_program)
						p = Error_with_account_name(s780, ld64(s770), ld64(s770 + 8), 0x100152b28 /* "whirlpool" */, 9)
						o = ld64(s780)
						st64(a + 8, ld64(s780 + 8))
						st64(a, o)
						st32(a + 0x2d8, 2)
						return p
					}
					copyr(s2d0, i + 0x188, 0x20)
					const ab = ld64(ld64(g))
					copyr(s2b0, ab, 0x20)
					if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
						anchor_error_from(s5c0, 0x7d1 /* anchor::ConstraintHasOne */)
						const ai = Error_with_account_name(s5d0, ld64(s5c0), ld64(s5c0 + 8), 0x100152b28 /* "whirlpool" */, 9)
						const ah = ld64(s5d0 + 8)
						const ag = ld64(s5d0)
						copy(s290, s2d0, 0x40)
						p = fn_13b5c0(s5e0, ag, ah, s290, ai)
						o = ld64(s5e0)
						st64(a + 8, ld64(s5e0 + 8))
						st64(a, o)
						st32(a + 0x2d8, 2)
						return p
					}
					const ac = ld64(ld64(s800 + 0x18))
					copyr(s2d0, ac, 0x20)
					copyr(s2b0, g + 0x28, 0x20)
					if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
						const token_vault_a: AccountInfo = ld64(s800 + 0x10)
						if (token_vault_a.is_writable == 0) {
							anchor_error_from(s750, 0x7d0 /* anchor::ConstraintMut */)
							p = Error_with_account_name(s760, ld64(s750), ld64(s750 + 8), "token_vault_a", 0xd)
							o = ld64(s760)
							st64(a + 8, ld64(s760 + 8))
							st64(a, o)
							st32(a + 0x2d8, 2)
							return p
						}
						const ak = token_vault_a.key
						copyr(s2d0, ak, 0x20)
						copyr(s2b0, i + 0x1c8, 0x20)
						if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
							anchor_error_from(s620, 0x7dc /* anchor::ConstraintAddress */)
							const ap = Error_with_account_name(s630, ld64(s620), ld64(s620 + 8), "token_vault_a", 0xd)
							const ao = ld64(s630 + 8)
							const an = ld64(s630)
							copy(s290, s2d0, 0x40)
							p = fn_13b5c0(s640, an, ao, s290, ap)
							o = ld64(s640)
							st64(a + 8, ld64(s640 + 8))
							st64(a, o)
							st32(a + 0x2d8, 2)
							return p
						}
						const token_vault_b: AccountInfo = ld64(s838 + 0x30)
						if (token_vault_b.is_writable == 0) {
							anchor_error_from(s730, 0x7d0 /* anchor::ConstraintMut */)
							p = Error_with_account_name(s740, ld64(s730), ld64(s730 + 8), "token_vault_b", 0xd)
							o = ld64(s740)
							st64(a + 8, ld64(s740 + 8))
							st64(a, o)
							st32(a + 0x2d8, 2)
							return p
						}
						const am = token_vault_b.key
						copyr(s2d0, am, 0x20)
						copyr(s2b0, i + 0x208, 0x20)
						if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
							anchor_error_from(s650, 0x7dc /* anchor::ConstraintAddress */)
							const at = Error_with_account_name(s660, ld64(s650), ld64(s650 + 8), "token_vault_b", 0xd)
							const ar = ld64(s660 + 8)
							const aq = ld64(s660)
							copy(s290, s2d0, 0x40)
							p = fn_13b5c0(s670, aq, ar, s290, at)
							o = ld64(s670)
							st64(a + 8, ld64(s670 + 8))
							st64(a, o)
							st32(a + 0x2d8, 2)
							return p
						}
						if (ld8(ld64(s838 + 0x28) + 0x29) == 0) {
							anchor_error_from(s710, 0x7d0 /* anchor::ConstraintMut */)
							p = Error_with_account_name(s720, ld64(s710), ld64(s710 + 8), "token_destination_a", 0x13)
							o = ld64(s720)
							st64(a + 8, ld64(s720 + 8))
							st64(a, o)
							st32(a + 0x2d8, 2)
							return p
						}
						if ((memcmp(s438, i + 0x1a8, 0x20) as u32) == 0) {
							if (ld8(ld64(s838 + 0x10) + 0x29) != 0) {
								if ((memcmp(s380, i + 0x1e8, 0x20) as u32) == 0) {
									const au = token_program.key
									copyr(s2b0, au, 0x20)
									if ((memcmp(s2b0, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
										anchor_error_from(s6c0, 0x7dc /* anchor::ConstraintAddress */)
										const bc = Error_with_account_name(s6d0, ld64(s6c0), ld64(s6c0 + 8), "token_program", 0xd)
										const bb = ld64(s6d0 + 8)
										const ba = ld64(s6d0)
										copyr(s290, s2b0, 0x20)
										st64(s270, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
										p = fn_13b5c0(s6e0, ba, bb, s290, bc)
										o = ld64(s6e0)
										st64(a + 8, ld64(s6e0 + 8))
										st64(a, o)
										st32(a + 0x2d8, 2)
										return p
									}
									memcpy(a + 0x190, s440, 0xb8)
									memcpy(a + 0x248, s388, 0xb8)
									memcpy(a + 0x30, s568, 0x80)
									copy(a + 0xb4, s590, 0x20)
									st32(a + 0xd4, ld32(s590 + 0x20))
									memcpy(a + 0xe8, s4c0, 0x80)
									const az = ld32(s4e8 + 0x20)
									const ay = ld64(s4e8 + 0x18)
									const ax = ld64(s4e8 + 0x10)
									const aw = ld64(s4e8 + 8)
									const av = ld64(s4e8)
									st32(a + 0xb0, ld64(s800))
									st32(a + 0x168, ld64(s838 + 0x18))
									st64(a + 0xe0, ld64(s838 + 0x20))
									st64(a + 0xd8, ld64(s838 + 0x30))
									st64(a + 0x28, ld64(s800 + 8))
									st64(a + 0x20, ld64(s800 + 0x10))
									st64(a + 0x18, token_program)
									p = ld64(s800 + 0x18)
									st64(a + 0x10, p)
									st64(a + 8, i)
									st64(a, g)
									st64(a + 0x16c, av, aw, ax, ay)
									st32(a + 0x18c, az)
									return p
								}
								anchor_error_from(s6a0, 0x7d3 /* anchor::ConstraintRaw */)
								p = Error_with_account_name(s6b0, ld64(s6a0), ld64(s6a0 + 8), "token_destination_b", 0x13)
								o = ld64(s6b0)
								st64(a + 8, ld64(s6b0 + 8))
								st64(a, o)
								st32(a + 0x2d8, 2)
								return p
							}
							anchor_error_from(s6f0, 0x7d0 /* anchor::ConstraintMut */)
							p = Error_with_account_name(s700, ld64(s6f0), ld64(s6f0 + 8), "token_destination_b", 0x13)
							o = ld64(s700)
							st64(a + 8, ld64(s700 + 8))
							st64(a, o)
							st32(a + 0x2d8, 2)
							return p
						}
						anchor_error_from(s680, 0x7d3 /* anchor::ConstraintRaw */)
						p = Error_with_account_name(s690, ld64(s680), ld64(s680 + 8), "token_destination_a", 0x13)
						o = ld64(s690)
						st64(a + 8, ld64(s690 + 8))
						st64(a, o)
						st32(a + 0x2d8, 2)
						return p
					}
					anchor_error_from(s5f0, 0x7dc /* anchor::ConstraintAddress */)
					const af = Error_with_account_name(s600, ld64(s5f0), ld64(s5f0 + 8), "collect_protocol_fees_authority", 0x1f)
					const ae = ld64(s600 + 8)
					const ad = ld64(s600)
					copy(s290, s2d0, 0x40)
					p = fn_13b5c0(s610, ad, ae, s290, af)
					o = ld64(s610)
					st64(a + 8, ld64(s610 + 8))
					st64(a, o)
					st32(a + 0x2d8, 2)
					return p
				}
				p = Error_with_account_name(s5b0, z, token_program, "token_program", 0xd)
				o = ld64(s5b0)
				st64(a + 8, ld64(s5b0 + 8))
				st64(a, o)
				st32(a + 0x2d8, 2)
				return p
			}
			p = Error_with_account_name(s5a0, j, k, "collect_protocol_fees_authority", 0x1f)
			o = ld64(s5a0)
			st64(a + 8, ld64(s5a0 + 8))
			st64(a, o)
			st32(a + 0x2d8, 2)
			return p
		}
		alloc_handle_alloc_error(8, 0x290)
	}
	alloc_handle_alloc_error(8, 0x70)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool, token_vault_a, token_vault_b, token_destination_a, token_destination_b
export function fn_90f88(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8
	let n, p: u64
	fn_6aa0(s28, ld64(b + 8), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const f = ld64(s28)
	if (f != 2) {
		n = Error_with_account_name(s38, f, ld64(s28 + 8), 0x100152b28 /* "whirlpool" */, 9)
		p = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, p)
		return n
	}
	const g = ld64(b + 0x20)
	if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
		const h = common_is_closed(g)
		if (h == 0) {
			fn_143448(s18, g, h)
			const j = ld64(s18 + 0x10)
			const i = ld64(s18)
			if (i != 0x800000000000001a /* Ok */) {
				const k = ld64(s18 + 8)
				st64(s18, i, k, j)
				fn_13b430(s48, s18)
				const l = ld64(s48)
				if (l != 2) {
					n = Error_with_account_name(s58, l, ld64(s48 + 8), "token_vault_a", 0xd)
					p = ld64(s58)
					st64(a + 8, ld64(s58 + 8))
					st64(a, p)
					return n
				}
			} else {
				st64(j, ld64(j) + 1)
			}
		}
	}
	const q = ld64(b + 0xd8)
	if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
		const r = common_is_closed(q)
		if (r == 0) {
			fn_143448(s18, q, r)
			const t = ld64(s18 + 0x10)
			const s = ld64(s18)
			if (s != 0x800000000000001a /* Ok */) {
				const aa = ld64(s18 + 8)
				st64(s18, s, aa, t)
				fn_13b430(s68, s18)
				const ab = ld64(s68)
				if (ab != 2) {
					n = Error_with_account_name(s78, ab, ld64(s68 + 8), "token_vault_b", 0xd)
					p = ld64(s78)
					st64(a + 8, ld64(s78 + 8))
					st64(a, p)
					return n
				}
			} else {
				st64(t, ld64(t) + 1)
			}
		}
	}
	const u = ld64(b + 0x190)
	if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
		const v = common_is_closed(u)
		if (v == 0) {
			fn_143448(s18, u, v)
			const x = ld64(s18 + 0x10)
			const w = ld64(s18)
			if (w != 0x800000000000001a /* Ok */) {
				const ac = ld64(s18 + 8)
				st64(s18, w, ac, x)
				fn_13b430(s88, s18)
				const ad = ld64(s88)
				if (ad != 2) {
					n = Error_with_account_name(s98, ad, ld64(s88 + 8), "token_destination_a", 0x13)
					p = ld64(s98)
					st64(a + 8, ld64(s98 + 8))
					st64(a, p)
					return n
				}
			} else {
				st64(x, ld64(x) + 1)
			}
		}
	}
	const y = ld64(b + 0x248)
	const m = memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20)
	let o = undef
	n = m as u32
	if (n != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return n
	}
	n = common_is_closed(y)
	o = undef
	if (n != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return n
	}
	n = fn_143448(s18, y, n)
	o = ld64(s18 + 0x10)
	const z = ld64(s18)
	if (z != 0x800000000000001a /* Ok */) {
		const ae = ld64(s18 + 8)
		st64(s18, z, ae, o)
		n = fn_13b430(sa8, s18)
		o = undef
		const af = ld64(sa8)
		if (af == 2) {
			st64(a + 8, o)
			st64(a, 2)
			return n
		}
		n = Error_with_account_name(sb8, af, ld64(sa8 + 8), "token_destination_b", 0x13)
		p = ld64(sb8)
		st64(a + 8, ld64(sb8 + 8))
		st64(a, p)
		return n
	}
	st64(o, ld64(o) + 1)
	st64(a + 8, o)
	st64(a, 2)
	return n
}
