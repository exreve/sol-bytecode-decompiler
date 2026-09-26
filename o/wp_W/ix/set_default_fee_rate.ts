/// <reference path="../lib.d.ts" />
// instruction set_default_fee_rate
import { fn_7240, memcpy } from '../shared.ts'

// instruction handler: set_default_fee_rate (discriminator sha256("global:set_default_fee_rate")[..8] = 0xe4d0e5b69dd6d776)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, fee_tier, fee_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: fee_tier
export function ix_set_default_fee_rate(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s90 = fp - 0x90, sa8 = fp - 0xa8, se0 = fp - 0xe0, s138 = fp - 0x138, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0
	let h, k: u64
	sol_log("Instruction: SetDefaultFeeRate", 0x1e)
	if (2 > ix_args_len) {
		const i = fn_1459d0(0x100159468)
		if (2 > (i & 3) - 2) {
			k = anchor_error_from(s1a0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s1a0)
			st64(a + 8, ld64(s1a0 + 8))
			st64(a, h)
			return k
		}
		if ((i & 3) == 0) {
			k = anchor_error_from(s1a0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s1a0)
			st64(a + 8, ld64(s1a0 + 8))
			st64(a, h)
			return k
		}
		const j = ld64(ld64(i + 7))
		callx(j, ld64(i - 1), j)
		k = anchor_error_from(s1a0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		h = ld64(s1a0)
		st64(a + 8, ld64(s1a0 + 8))
		st64(a, h)
		return k
	}
	const m = ld16(ix_args)
	st64(s160, accounts, accounts_len)
	k = accounts_set_default_fee_rate(sa8, undef, s160, undef, fp)
	let g = ld64(sa8 + 0x10)
	h = ld64(sa8 + 8)
	const f = ld64(sa8)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return k
	}
	memcpy(s138, s90, 0x90)
	st64(s150, f, h, g)
	if (m > 0xea60) {
		k = fn_87630(s170, 0x1c)
		g = ld64(s170 + 8)
		h = ld64(s170)
		if (h != 2) {
			st64(a + 8, g)
			st64(a, h)
			return k
		}
	} else {
		st16(se0 + 0x2a, m)
	}
	k = fn_7240(s180, se0, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
	const l = ld64(s180)
	if (l != 2) {
		k = Error_with_account_name(s190, l, ld64(s180 + 8), "fee_tier", 8)
		h = ld64(s190)
		st64(a + 8, ld64(s190 + 8))
		st64(a, h)
		return k
	}
	st64(a + 8, g)
	st64(a, 2)
	return k
}

// Anchor Accounts::try_accounts of instruction set_default_fee_rate (called by ix_set_default_fee_rate; name [str]: from the handler's "Instruction: …" log; was fn_c7110)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, fee_tier (ConstraintMut, ConstraintHasOne), fee_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpools_config, fee_tier, fee_authority
export function accounts_set_default_fee_rate(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s58 = fp - 0x58, sb0 = fp - 0xb0, s108 = fp - 0x108, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8
	let w, x: u64
	try_accounts_11de0(s120, c, c, d, e)
	const h = ld64(s120 + 0x10)
	const g = ld64(s120 + 8)
	const whirlpools_config: AccountInfo = ld64(s120)
	if (whirlpools_config == 0) {
		x = Error_with_account_name(s1d0, g, h, "whirlpools_config", 0x11)
		w = ld64(s1d0)
		st64(a + 0x10, ld64(s1d0 + 8))
		st64(a + 8, w)
		st64(a, 0)
		return x
	}
	st64(s1e0, h, g)
	memcpy(sb0, s108, 0x58)
	try_accounts_12008(s120, c)
	const k = ld64(s120 + 0x10)
	const j = ld64(s120 + 8)
	const fee_tier: AccountInfo = ld64(s120)
	if (fee_tier == 0) {
		x = Error_with_account_name(s1c0, j, k, "fee_tier", 8)
		w = ld64(s1c0)
		st64(a + 0x10, ld64(s1c0 + 8))
		st64(a + 8, w)
		st64(a, 0)
		return x
	}
	st64(s1f0, j, k)
	copyr(s58, s108, 0x18)
	try_accounts_11718(s120, c, k)
	const fee_authority: AccountInfo = ld64(s120 + 8)
	const l = ld64(s120)
	if (l == 2) {
		if (fee_tier.is_writable == 0) {
			anchor_error_from(s1a0, 0x7d0 /* anchor::ConstraintMut */)
			x = Error_with_account_name(s1b0, ld64(s1a0), ld64(s1a0 + 8), "fee_tier", 8)
			w = ld64(s1b0)
			st64(a + 0x10, ld64(s1b0 + 8))
			st64(a + 8, w)
			st64(a, 0)
			return x
		}
		copyr(s40, s1f0, 0x10)
		copy(s30, s58, 0x10)
		const m = whirlpools_config.key
		copyr(s20, m, 0x20)
		if ((memcmp(s40, s20, 0x20) as u32) != 0) {
			anchor_error_from(s140, 0x7d1 /* anchor::ConstraintHasOne */)
			const v = Error_with_account_name(s150, ld64(s140), ld64(s140 + 8), "fee_tier", 8)
			const u = ld64(s150 + 8)
			const t = ld64(s150)
			copy(s120, s40, 0x40)
			x = fn_13b5c0(s160, t, u, s120, v)
			w = ld64(s160)
			st64(a + 0x10, ld64(s160 + 8))
			st64(a + 8, w)
			st64(a, 0)
			return x
		}
		const o = fee_authority.key
		copyr(s40, o, 0x20)
		st64(s1f8, fee_authority)
		const p = ld64(s1e0)
		st64(s20 + 8, p)
		st64(s20, ld64(s1e0 + 8))
		copy(s10, sb0, 0x10)
		if ((memcmp(s40, s20, 0x20) as u32) == 0) {
			x = memcpy(a + 0x18, sb0, 0x58)
			const aa = ld64(s58 + 0x10)
			const z = ld64(s58 + 8)
			const y = ld64(s58)
			st64(a + 0xa0, ld64(s1f8))
			st64(a + 0x80, ld64(s1f0 + 8))
			st64(a + 0x78, ld64(s1f0))
			st64(a + 0x70, fee_tier)
			st64(a + 0x10, p)
			st64(a + 8, ld64(s1e0 + 8))
			st64(a, whirlpools_config)
			st64(a + 0x88, y, z, aa)
			return x
		}
		anchor_error_from(s170, 0x7dc /* anchor::ConstraintAddress */)
		const s = Error_with_account_name(s180, ld64(s170), ld64(s170 + 8), "fee_authority", 0xd)
		const r = ld64(s180 + 8)
		const q = ld64(s180)
		copy(s120, s40, 0x40)
		x = fn_13b5c0(s190, q, r, s120, s)
		w = ld64(s190)
		st64(a + 0x10, ld64(s190 + 8))
		st64(a + 8, w)
		st64(a, 0)
		return x
	}
	x = Error_with_account_name(s130, l, fee_authority, "fee_authority", 0xd)
	w = ld64(s130)
	st64(a + 0x10, ld64(s130 + 8))
	st64(a + 8, w)
	st64(a, 0)
	return x
}
