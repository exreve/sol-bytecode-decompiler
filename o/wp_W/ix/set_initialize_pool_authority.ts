/// <reference path="../lib.d.ts" />
// instruction set_initialize_pool_authority
import { fn_5f98, memcpy } from '../shared.ts'

// instruction handler: set_initialize_pool_authority (discriminator sha256("global:set_initialize_pool_authority")[..8] = 0xec6a1a95eb7f2b7d)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, adaptive_fee_tier, new_initialize_pool_authority, fee_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: adaptive_fee_tier
export function ix_set_initialize_pool_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const se8 = fp - 0xe8, s100 = fp - 0x100, s160 = fp - 0x160, s190 = fp - 0x190, s1e8 = fp - 0x1e8, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230
	sol_log("Instruction: SetInitializePoolAuthority", 0x27)
	st64(s210, accounts, accounts_len)
	let n = accounts_set_initialize_pool_authority(s100, undef, s210, undef, fp)
	const g = ld64(s100 + 0x10)
	let h = ld64(s100 + 8)
	const f = ld64(s100)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return n
	}
	memcpy(s1e8, se8, 0xe8)
	st64(s200, f, h, g)
	const i = ld64(ld64(s160 + 0x58))
	const l = ld64(i + 8)
	const k = ld64(i + 0x10)
	const j = ld64(i + 0x18)
	st64(s190 + 0x28, ld64(i))
	st64(s160, l, k, j)
	n = fn_5f98(s220, s190, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
	const m = ld64(s220)
	if (m != 2) {
		n = Error_with_account_name(s230, m, ld64(s220 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
		h = ld64(s230)
		st64(a + 8, ld64(s230 + 8))
		st64(a, h)
		return n
	}
	st64(a + 8, g)
	st64(a, 2)
	return n
}

// Anchor Accounts::try_accounts of instruction set_initialize_pool_authority (called by ix_set_initialize_pool_authority; name [str]: from the handler's "Instruction: …" log; was fn_101100)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, adaptive_fee_tier (ConstraintMut, ConstraintHasOne), new_initialize_pool_authority (AccountNotEnoughKeys), fee_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpools_config, adaptive_fee_tier, fee_authority
export function accounts_set_initialize_pool_authority(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, sa8 = fp - 0xa8, s110 = fp - 0x110, s128 = fp - 0x128, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s278 = fp - 0x278, s280 = fp - 0x280
	let n, p, aa, ab: u64
	try_accounts_11de0(s128, c, c, d, e)
	const h = ld64(s128 + 0x10)
	const g = ld64(s128 + 8)
	const whirlpools_config: AccountInfo = ld64(s128)
	if (whirlpools_config == 0) {
		ab = Error_with_account_name(s250, g, h, "whirlpools_config", 0x11)
		aa = ld64(s250)
		st64(a + 0x10, ld64(s250 + 8))
		st64(a + 8, aa)
		st64(a, 0)
		return ab
	}
	st64(s260, h, g)
	memcpy(s180, s110, 0x58)
	try_accounts_11d28(s128, c)
	const k = ld64(s128 + 0x10)
	const j = ld64(s128 + 8)
	const adaptive_fee_tier: AccountInfo = ld64(s128)
	if (adaptive_fee_tier == 0) {
		ab = Error_with_account_name(s240, j, k, 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
		aa = ld64(s240)
		st64(a + 0x10, ld64(s240 + 8))
		st64(a + 8, aa)
		st64(a, 0)
		return ab
	}
	st64(s270, j, k)
	memcpy(sa8, s110, 0x68)
	try_accounts_11718(s128, c)
	const fee_authority: AccountInfo = ld64(s128 + 8)
	const l = ld64(s128)
	if (l == 2) {
		const m = ld64(c + 8)
		if (m == 0) {
			anchor_error_from(s1a0, 0xbbd /* anchor::AccountNotEnoughKeys */, fee_authority, undef, p)
			n = ld64(s1a0 + 8)
			const q = ld64(s1a0)
			if (q != 2) {
				ab = Error_with_account_name(s1b0, q, n, "new_initialize_pool_authority", 0x1d)
				aa = ld64(s1b0)
				st64(a + 0x10, ld64(s1b0 + 8))
				st64(a + 8, aa)
				st64(a, 0)
				return ab
			}
		} else {
			st64(c + 8, m - 1)
			n = ld64(c)
			st64(c, n + 0x30)
		}
		if (adaptive_fee_tier.is_writable == 0) {
			anchor_error_from(s220, 0x7d0 /* anchor::ConstraintMut */, fee_authority, n, p)
			ab = Error_with_account_name(s230, ld64(s220), ld64(s220 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
			aa = ld64(s230)
			st64(a + 0x10, ld64(s230 + 8))
			st64(a + 8, aa)
			st64(a, 0)
			return ab
		}
		st64(s278, n)
		copyr(s40, s270, 0x10)
		copy(s30, sa8, 0x10)
		const r = whirlpools_config.key
		copyr(s20, r, 0x20)
		if ((memcmp(s40, s20, 0x20) as u32) != 0) {
			anchor_error_from(s1c0, 0x7d1 /* anchor::ConstraintHasOne */)
			const z = Error_with_account_name(s1d0, ld64(s1c0), ld64(s1c0 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
			const y = ld64(s1d0 + 8)
			const x = ld64(s1d0)
			copy(s128, s40, 0x40)
			ab = fn_13b5c0(s1e0, x, y, s128, z)
			aa = ld64(s1e0)
			st64(a + 0x10, ld64(s1e0 + 8))
			st64(a + 8, aa)
			st64(a, 0)
			return ab
		}
		st64(s280, fee_authority)
		const s = fee_authority.key
		copyr(s40, s, 0x20)
		const t = ld64(s260)
		st64(s20 + 8, t)
		st64(s20, ld64(s260 + 8))
		copy(s10, s180, 0x10)
		if ((memcmp(s40, s20, 0x20) as u32) == 0) {
			memcpy(a + 0x18, s180, 0x58)
			ab = memcpy(a + 0x88, sa8, 0x68)
			st64(a + 0xf8, ld64(s278))
			st64(a + 0xf0, ld64(s280))
			st64(a + 0x80, ld64(s270 + 8))
			st64(a + 0x78, ld64(s270))
			st64(a + 0x70, adaptive_fee_tier)
			st64(a + 0x10, t)
			st64(a + 8, ld64(s260 + 8))
			st64(a, whirlpools_config)
			return ab
		}
		anchor_error_from(s1f0, 0x7dc /* anchor::ConstraintAddress */)
		const w = Error_with_account_name(s200, ld64(s1f0), ld64(s1f0 + 8), "fee_authority", 0xd)
		const v = ld64(s200 + 8)
		const u = ld64(s200)
		copy(s128, s40, 0x40)
		ab = fn_13b5c0(s210, u, v, s128, w)
		aa = ld64(s210)
		st64(a + 0x10, ld64(s210 + 8))
		st64(a + 8, aa)
		st64(a, 0)
		return ab
	}
	ab = Error_with_account_name(s190, l, fee_authority, "fee_authority", 0xd)
	aa = ld64(s190)
	st64(a + 0x10, ld64(s190 + 8))
	st64(a + 8, aa)
	st64(a, 0)
	return ab
}
