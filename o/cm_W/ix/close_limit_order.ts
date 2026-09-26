/// <reference path="../lib.d.ts" />
// instruction close_limit_order
import { anchor_error_from, fn_13e190, fn_13e5a0, fn_14ed60, fn_181f8, fn_4130, fn_667d0, fn_85138, fn_88558, fn_af28, memcpy } from '../shared.ts'

// instruction handler: close_limit_order (discriminator sha256("global:close_limit_order")[..8] = 0xfa2557d50f807c4c)
// accounts [idl]: 0 signer [signer], 1 rent_receiver [mut], 2 limit_order [mut]
// args [idl]: (none)
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
export function ix_close_limit_order(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const sb0 = fp - 0xb0, sc0 = fp - 0xc0, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0
	const f = sol_log("Instruction: CloseLimitOrder", 0x1c)
	st64(s190, accounts, accounts_len)
	let j = accounts_close_limit_order(sc0, undef, s190, undef, fp, f)
	const h = ld64(sc0 + 8)
	let i = ld64(sc0)
	const g = ld8(sb0 + 0xac)
	if (g == 2) {
		st64(a + 8, h)
		st64(a, i)
		return j
	}
	memcpy(s170, sb0, 0xac)
	st16(s170 + 0xad, ld16(sb0 + 0xad))
	st8(s170 + 0xaf, ld8(sb0 + 0xaf))
	st8(s170 + 0xac, g)
	st64(s180, i, h)
	copyr(sb0, s190, 0x10)
	st64(sc0, program_id, s180)
	j = fn_551a8(s1a0, sc0)
	i = ld64(s1a0)
	if (i == 2) {
		j = fn_ee970(s1b0, s180, program_id)
		i = ld64(s1b0)
		st64(a + 8, ld64(s1b0 + 8))
		st64(a, i)
		return j
	}
	st64(a + 8, ld64(s1a0 + 8))
	st64(a, i)
	return j
}

// Anchor Accounts::try_accounts of instruction close_limit_order (called by ix_close_limit_order; name [str]: from the handler's "Instruction: …" log; was fn_ed8b8)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: limit_order (ConstraintAddress, ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: limit_order [idl], limit_order_2 [idl]
export function accounts_close_limit_order(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, se8 = fp - 0xe8, s100 = fp - 0x100, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s240 = fp - 0x240, s258 = fp - 0x258, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, s300 = fp - 0x300
	let j, o, p, q, ak, al, am, ao, aq: u64
	let n = a
	let h = try_accounts_17a30(s1b8, c, c, d, e, r0)
	const m = ld64(s1b8 + 8)
	let f = ld64(s1b8)
	if (f != 2) {
		const i = ld64(0x300000000 /* heap bump-allocator cursor */)
		j = 6 > i
		const k = j != 0 ? 0 : i - 6
		const l = i != 0 ? k : 0x300007ffa
		if ((f & 1) != 0) {
			if (0x300000008 > l) {
				raw_vec_handle_error(1, 6, 0x10015f8f8, k, j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, l)
			st16(l + 4, 0x7265)
			st32(l, 0x6e676973)
			void ld64(m)
		} else {
			if (0x300000008 > l) {
				raw_vec_handle_error(1, 6, 0x10015f8f8, k, j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, l)
			st16(l + 4, 0x7265)
			st32(l, 0x6e676973)
			void ld64(m)
		}
		st64(m + 0x10, l, 6)
		st64(m + 8, 6)
		st64(m, 1)
		st64(n + 8, m)
		st64(n, f)
		st8(n + 0xbc, 2)
		return h
	}
	const g = ld64(c + 8)
	if (g == 0) {
		anchor_error_from(s278, 0xbbd /* anchor::AccountNotEnoughKeys */, o, p, q)
		h = ld64(s278 + 8)
		f = ld64(s278)
		if (f != 2) {
			const ah = ld64(0x300000000 /* heap bump-allocator cursor */)
			j = 0xd > ah
			const ai = j != 0 ? 0 : ah - 0xd
			const aj = ah != 0 ? ai : 0x300007ff3
			if ((f & 1) != 0) {
				if (0x300000008 > aj) {
					raw_vec_handle_error(1, 0xd, 0x10015f8f8, ai, j)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, aj)
				st64(aj + 5, 0x7265766965636572)
				st64(aj, 0x6365725f746e6572)
				void ld64(h)
			} else {
				if (0x300000008 > aj) {
					raw_vec_handle_error(1, 0xd, 0x10015f8f8, ai, j)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, aj)
				st64(aj + 5, 0x7265766965636572)
				st64(aj, 0x6365725f746e6572)
				void ld64(h)
			}
			st64(h + 0x10, aj, 0xd)
			st64(h + 8, 0xd)
			st64(h, 1)
			st64(n + 8, h)
			st64(n, f)
			st8(n + 0xbc, 2)
			return h
		}
	} else {
		st64(c + 8, g - 1)
		h = ld64(c)
		st64(c, h + 0x30)
	}
	st64(s2e8, h, n)
	h = fn_181f8(s1b8, c, o, p, q)
	const v = ld64(s1b8 + 8)
	const t = ld64(s1b8)
	const r = ld8(s1a8 + 0x9c)
	if (r == 2) {
		const s = ld64(0x300000000 /* heap bump-allocator cursor */)
		const u = s != 0 ? sat_sub(s, 0xb) : 0x300007ff5
		if ((t & 1) != 0) {
			if (0x300000008 > u) {
				raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0xb > s)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, u)
			st64(u, 0x726f5f74696d696c)
			st32(u + 7, 0x72656472)
			void ld64(v)
		} else {
			if (0x300000008 > u) {
				raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0xb > s)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, u)
			st64(u, 0x726f5f74696d696c)
			st32(u + 7, 0x72656472)
			void ld64(v)
		}
		st64(v + 0x10, u, 0xb)
		st64(v + 8, 0xb)
		st64(v, 1)
		const w = ld64(s2e8 + 8)
		st64(w + 8, v)
		st64(w, t)
		st8(w + 0xbc, 2)
		return h
	}
	st64(s2f0, r)
	memcpy(s100, s1a8, 0x9c)
	st16(s1a8 + 0xa4, ld16(s1a8 + 0x9d))
	st8(s1a8 + 0xa6, ld8(s1a8 + 0x9f))
	st64(s300, v)
	st64(s278 + 0x18, v)
	st64(s2f8, t)
	st64(s278 + 0x10, t)
	const x = ld64(s2f0)
	memcpy(s258, s100, 0x9c)
	st8(s240 + 0x84, x)
	st16(s240 + 0x85, ld16(s1a8 + 0xa4))
	st8(s240 + 0x87, ld8(s1a8 + 0xa6))
	const y = ld64(m)
	copyr(s60, y, 0x20)
	const z = memcmp(s60, s240, 0x20)
	if ((z as u32) != 0) {
		copyr(s1b8, y, 0x20)
		const aa = memcmp(s1b8, 0x1001595a0 /* key Ray8HHtixhL9zvnokMyELCVGp622PDPJj96zcVC9RWp */, 0x20)
		if ((aa as u32) != 0) {
			h = anchor_error_from(s288, 0x7d3 /* anchor::ConstraintRaw */, ak, al, am)
			const an = ld64(0x300000000 /* heap bump-allocator cursor */)
			j = ld64(s2e8 + 8)
			const ap = an != 0 ? sat_sub(an, 6) : 0x300007ffa
			aq = ld64(s288 + 8)
			ao = ld64(s288)
			if ((ao & 1) != 0) {
				if (0x300000008 > ap) {
					raw_vec_handle_error(1, 6, 0x10015f8f8, 0x300000008, j)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ap)
				st16(ap + 4, 0x7265)
				st32(ap, 0x6e676973)
				void ld64(aq)
			} else {
				if (0x300000008 > ap) {
					raw_vec_handle_error(1, 6, 0x10015f8f8, 0x300000008, j)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ap)
				st16(ap + 4, 0x7265)
				st32(ap, 0x6e676973)
				void ld64(aq)
			}
			st64(aq + 0x10, ap, 6)
			st64(aq + 8, 6)
			st64(aq, 1)
			st64(j + 8, aq)
			st64(j, ao)
			st8(j + 0xbc, 2)
			return h
		}
	}
	const limit_order: AccountInfo = ld64(s2e8)
	if (limit_order.is_writable != 0) {
		const ac = limit_order.key
		copyr(s40, ac, 0x20)
		copy(s20, se8, 0x20)
		if ((memcmp(s40, s20, 0x20) as u32) != 0) {
			const ay = anchor_error_from(s2a8, 0x7dc /* anchor::ConstraintAddress */)
			j = undef
			const au = ld64(0x300000000 /* heap bump-allocator cursor */)
			n = ld64(s2e8 + 8)
			const aw = au != 0 ? sat_sub(au, 0xd) : 0x300007ff3
			const ax = ld64(s2a8 + 8)
			const av = ld64(s2a8)
			if ((av & 1) != 0) {
				if (0x300000008 > aw) {
					raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0x300000008, j)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, aw)
				st64(aw + 5, 0x7265766965636572)
				st64(aw, 0x6365725f746e6572)
				void ld64(ax)
			} else {
				if (0x300000008 > aw) {
					raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0x300000008, j)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, aw)
				st64(aw + 5, 0x7265766965636572)
				st64(aw, 0x6365725f746e6572)
				void ld64(ax)
			}
			st64(ax + 0x10, aw, 0xd)
			st64(ax + 8, 0xd)
			st64(ax, 1)
			copy(s1b8, s40, 0x40)
			h = Error_with_pubkeys(s2b8, av, ax, s1b8, ay)
			f = ld64(s2b8)
			st64(n + 8, ld64(s2b8 + 8))
			st64(n, f)
			st8(n + 0xbc, 2)
			return h
		}
		const limit_order_2: AccountInfo = ld64(s2f8)
		if (limit_order_2.is_writable != 0) {
			const ae = ld64(s2e8 + 8)
			h = memcpy(ae + 0x20, s100, 0x9c)
			const ag = ld8(s1a8 + 0xa6)
			const af = ld16(s1a8 + 0xa4)
			st8(ae + 0xbc, x)
			st64(ae + 0x18, ld64(s300))
			st64(ae + 0x10, limit_order_2)
			st64(ae + 8, ld64(s2e8))
			st64(ae, m)
			st16(ae + 0xbd, af)
			st8(ae + 0xbf, ag)
			return h
		}
		anchor_error_from(s2c8, 0x7d0 /* anchor::ConstraintMut */, undef, limit_order_2)
		h = fn_4130(s2d8, ld64(s2c8), ld64(s2c8 + 8), 0x10015b336 /* "limit_order" */, 0xb)
		const ba = ld64(s2d8)
		const az = ld64(s2e8 + 8)
		st64(az + 8, ld64(s2d8 + 8))
		st64(az, ba)
		st8(az + 0xbc, 2)
		return h
	}
	h = anchor_error_from(s298, 0x7d0 /* anchor::ConstraintMut */, ak, al, am)
	const ar = ld64(0x300000000 /* heap bump-allocator cursor */)
	j = ld64(s2e8 + 8)
	const at = ar != 0 ? sat_sub(ar, 0xd) : 0x300007ff3
	aq = ld64(s298 + 8)
	ao = ld64(s298)
	if ((ao & 1) != 0) {
		if (0x300000008 > at) {
			raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0x300000008, j)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, at)
		st64(at + 5, 0x7265766965636572)
		st64(at, 0x6365725f746e6572)
		void ld64(aq)
	} else {
		if (0x300000008 > at) {
			raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0x300000008, j)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, at)
		st64(at + 5, 0x7265766965636572)
		st64(at, 0x6365725f746e6572)
		void ld64(aq)
	}
	st64(aq + 0x10, at, 0xd)
	st64(aq + 8, 0xd)
	st64(aq, 1)
	st64(j + 8, aq)
	st64(j, ao)
	st8(j + 0xbc, 2)
	return h
}

// types [heur]: b: CloseLimitOrderContext (the handler ix_close_limit_order passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_551a8(a: u64, b: CloseLimitOrderContext): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf0 = fp - 0xf0, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	const accounts: CloseLimitOrderAccounts = b.accounts
	let h = fn_667d0(s118, accounts + 0x18)
	let g = ld64(s118)
	if (g != 2) {
		st64(a + 8, ld64(s118 + 8))
		st64(a, g)
		return h
	}
	if (ld64(s118 + 8) == 0) {
		const i: AccountInfo = ld64(accounts + 8)
		const j: LamportsCell = i.lamports
		const p = i.key
		rc_inc(j)
		const k: DataCell = i.data
		rc_inc(k)
		const o = i.owner
		const n = i.rent_epoch
		const m = i.is_signer
		const l = i.is_writable
		st8(s20 + 2, i.executable)
		st8(s20, m, l)
		st64(s48, p, j, k, o, n)
		const limit_order: AccountInfo = accounts.limit_order
		const r: LamportsCell = limit_order.lamports
		const x = limit_order.key
		rc_inc(r)
		const s: DataCell = limit_order.data
		rc_inc(s)
		const w = limit_order.owner
		const v = limit_order.rent_epoch
		const u = limit_order.is_signer
		const t = limit_order.is_writable
		st8(sf0 + 2, limit_order.executable)
		st8(sf0, u, t)
		st64(s118, x, r, s, w, v)
		h = fn_13e190(s138, s118, s48, s, w)
		const y = ld64(s138)
		if (y == 2) {
			st64(a + 8, undef)
			st64(a, 2)
			return h
		}
		st64(a + 8, ld64(s138 + 8))
		st64(a, y)
		return h
	}
	fn_85138(s78, 0x100159834)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s20 + 0x10, 3)
	st64(s20 + 8, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x100159834, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a309)
	st32(sf0 + 0x70, 0x179a /* error::InvalidLimitOrderAmount */)
	st8(sf0 + 0x28, 2)
	st32(s118 + 0x18, 0x17)
	st64(s118 + 0x10, 0x3e)
	st64(s118, 0)
	h = fn_13e5a0(s128, s118)
	g = ld64(s128)
	st64(a + 8, ld64(s128 + 8))
	st64(a, g)
	return h
}

export function fn_ee970(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10
	const j = fn_af28(s10, b + 0x10, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
	let i = undef
	const f = ld64(s10)
	if (f == 2) {
		st64(a + 8, i)
		st64(a, f)
		return j
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0xb) : 0x300007ff5
	i = ld64(s10 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, 0xb > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x726f5f74696d696c)
		st32(h + 7, 0x72656472)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, 0xb > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x726f5f74696d696c)
		st32(h + 7, 0x72656472)
		void ld64(i)
	}
	st64(i + 0x10, h, 0xb)
	st64(i + 8, 0xb)
	st64(i, 1)
	st64(a + 8, i)
	st64(a, f)
	return j
}
