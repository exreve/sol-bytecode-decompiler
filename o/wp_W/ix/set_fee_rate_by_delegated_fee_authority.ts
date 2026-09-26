/// <reference path="../lib.d.ts" />
// instruction set_fee_rate_by_delegated_fee_authority
import { fn_6aa0, memcpy } from '../shared.ts'

// instruction handler: set_fee_rate_by_delegated_fee_authority (discriminator sha256("global:set_fee_rate_by_delegated_fee_authority")[..8] = 0x68a2e68372367979)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, adaptive_fee_tier, delegated_fee_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
export function ix_set_fee_rate_by_delegated_fee_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s300 = fp - 0x300, s318 = fp - 0x318, s3a8 = fp - 0x3a8, s618 = fp - 0x618, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680
	let h, k: u64
	sol_log("Instruction: SetFeeRateByDelegatedFeeAuthority", 0x2e)
	if (2 > ix_args_len) {
		const i = fn_1459d0(0x100159468)
		if (2 > (i & 3) - 2) {
			k = anchor_error_from(s680, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s680)
			st64(a + 8, ld64(s680 + 8))
			st64(a, h)
			return k
		}
		if ((i & 3) == 0) {
			k = anchor_error_from(s680, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s680)
			st64(a + 8, ld64(s680 + 8))
			st64(a, h)
			return k
		}
		const j = ld64(ld64(i + 7))
		callx(j, ld64(i - 1), j)
		k = anchor_error_from(s680, 0x66 /* anchor::InstructionDidNotDeserialize */)
		h = ld64(s680)
		st64(a + 8, ld64(s680 + 8))
		st64(a, h)
		return k
	}
	const m = ld16(ix_args)
	st64(s640, accounts, accounts_len)
	k = accounts_set_fee_rate_by_delegated_fee_authority(s318, undef, s640, undef, fp)
	let g = ld64(s318 + 0x10)
	h = ld64(s318 + 8)
	const f = ld64(s318)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return k
	}
	memcpy(s618, s300, 0x300)
	st64(s630, f, h, g)
	if (m > 0xea60) {
		k = fn_87630(s650, 0x1c)
		g = ld64(s650 + 8)
		h = ld64(s650)
		if (h != 2) {
			st64(a + 8, g)
			st64(a, h)
			return k
		}
	} else {
		st16(s3a8, m)
	}
	k = fn_6aa0(s660, s630, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
	const l = ld64(s660)
	if (l != 2) {
		k = Error_with_account_name(s670, l, ld64(s660 + 8), 0x100152b28 /* "whirlpool" */, 9)
		h = ld64(s670)
		st64(a + 8, ld64(s670 + 8))
		st64(a, h)
		return k
	}
	st64(a + 8, g)
	st64(a, 2)
	return k
}

// Anchor Accounts::try_accounts of instruction set_fee_rate_by_delegated_fee_authority (called by ix_set_fee_rate_by_delegated_fee_authority; name [str]: from the handler's "Instruction: …" log; was fn_100938)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool (ConstraintMut, ConstraintRaw), adaptive_fee_tier (ConstraintRaw), delegated_fee_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: delegated_fee_authority
export function accounts_set_fee_rate_by_delegated_fee_authority(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s80 = fp - 0x80, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, s310 = fp - 0x310, s330 = fp - 0x330, s350 = fp - 0x350, s388 = fp - 0x388, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d0 = fp - 0x3d0, s4d8 = fp - 0x4d8, s648 = fp - 0x648, s658 = fp - 0x658, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s700 = fp - 0x700, s710 = fp - 0x710, s720 = fp - 0x720, s730 = fp - 0x730, s740 = fp - 0x740, s748 = fp - 0x748, s750 = fp - 0x750
	let p, q, w: u64
	let g = a
	try_accounts_11a48(s310, c, c, d, e)
	const h = ld64(s310 + 0x10)
	const i = ld64(s310 + 8)
	const f = ld64(s310)
	if (f == 0) {
		q = Error_with_account_name(s740, i, h, 0x100152b28 /* "whirlpool" */, 9)
		p = ld64(s740)
		st64(g + 0x10, ld64(s740 + 8))
		st64(g + 8, p)
		st64(g, 0)
		return q
	}
	st64(s748, g)
	memcpy(s648, s2f8, 0x278)
	st64(s658, i, h)
	st64(s750, f)
	st64(s660, f)
	try_accounts_11d28(s310, c)
	const k = ld64(s310 + 0x10)
	const l = ld64(s310 + 8)
	const j = ld64(s310)
	if (j == 0) {
		q = Error_with_account_name(s730, l, k, 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
		p = ld64(s730)
		g = ld64(s748)
		st64(g + 0x10, ld64(s730 + 8))
		st64(g + 8, p)
		st64(g, 0)
		return q
	}
	memcpy(s3b8, s2f8, 0x68)
	st64(s3d0, j, l, k)
	try_accounts_11718(s310, c)
	const delegated_fee_authority: AccountInfo = ld64(s310 + 8)
	const m = ld64(s310)
	if (m == 2) {
		const s = ld64(s748)
		if (ld8(ld64(s750) + 0x29) == 0) {
			anchor_error_from(s710, 0x7d0 /* anchor::ConstraintMut */, delegated_fee_authority)
			q = Error_with_account_name(s720, ld64(s710), ld64(s710 + 8), 0x100152b28 /* "whirlpool" */, 9)
			w = ld64(s720)
			st64(s + 0x10, ld64(s720 + 8))
			st64(s + 8, w)
			st64(s, 0)
			return q
		}
		const n = ld16(s4d8 + 0xfe)
		if (n != ld16(s4d8 + 0xfc)) {
			if ((memcmp(s3c8, s4d8, 0x20) as u32) == 0) {
				if (ld16(s388 + 0x28) == n) {
					const r = delegated_fee_authority.key
					copyr(s350, r, 0x20)
					copyr(s330, s388, 0x20)
					if ((memcmp(s350, s330, 0x20) as u32) != 0) {
						anchor_error_from(s6c0, 0x7dc /* anchor::ConstraintAddress */)
						const v = Error_with_account_name(s6d0, ld64(s6c0), ld64(s6c0 + 8), 0x10015517b /* "delegated_fee_authority" */, 0x17)
						const u = ld64(s6d0 + 8)
						const t = ld64(s6d0)
						copyr(s310, s350, 0x20)
						copy(s2f0, s388, 0x20)
						q = fn_13b5c0(s6e0, t, u, s310, v)
						w = ld64(s6e0)
						st64(s + 0x10, ld64(s6e0 + 8))
						st64(s + 8, w)
						st64(s, 0)
						return q
					}
					memcpy(s310, s660, 0x290)
					memcpy(s80, s3d0, 0x80)
					q = memcpy(s, s310, 0x310)
					st64(s + 0x310, delegated_fee_authority)
					return q
				}
				anchor_error_from(s6a0, 0x7d3 /* anchor::ConstraintRaw */)
				q = Error_with_account_name(s6b0, ld64(s6a0), ld64(s6a0 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
				w = ld64(s6b0)
				st64(s + 0x10, ld64(s6b0 + 8))
				st64(s + 8, w)
				st64(s, 0)
				return q
			}
			anchor_error_from(s680, 0x7d3 /* anchor::ConstraintRaw */)
			q = Error_with_account_name(s690, ld64(s680), ld64(s680 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
			w = ld64(s690)
			st64(s + 0x10, ld64(s690 + 8))
			st64(s + 8, w)
			st64(s, 0)
			return q
		}
		anchor_error_from(s6f0, 0x7d3 /* anchor::ConstraintRaw */, delegated_fee_authority)
		q = Error_with_account_name(s700, ld64(s6f0), ld64(s6f0 + 8), 0x100152b28 /* "whirlpool" */, 9)
		w = ld64(s700)
		st64(s + 0x10, ld64(s700 + 8))
		st64(s + 8, w)
		st64(s, 0)
		return q
	}
	q = Error_with_account_name(s670, m, delegated_fee_authority, 0x10015517b /* "delegated_fee_authority" */, 0x17)
	p = ld64(s670)
	g = ld64(s748)
	st64(g + 0x10, ld64(s670 + 8))
	st64(g + 8, p)
	st64(g, 0)
	return q
}
