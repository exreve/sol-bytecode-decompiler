/// <reference path="../lib.d.ts" />
// instruction set_fee_authority
import { fn_8228, memcpy } from '../shared.ts'

// instruction handler: set_fee_authority (discriminator sha256("global:set_fee_authority")[..8] = 0x846165ed5732011f)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, new_fee_authority, fee_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config
export function ix_set_fee_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s68 = fp - 0x68, s80 = fp - 0x80, se8 = fp - 0xe8, sf0 = fp - 0xf0, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130
	let l: u64
	sol_log("Instruction: SetFeeAuthority", 0x1c)
	st64(s110, accounts, accounts_len)
	let m = accounts_set_fee_authority(s80, undef, s110, undef, fp)
	const f = ld64(s80)
	if (f == 0) {
		l = ld64(s80 + 8)
		st64(a + 8, ld64(s80 + 0x10))
		st64(a, l)
		return m
	}
	memcpy(se8, s68, 0x68)
	st64(s100, f)
	const g = ld64(ld64(se8 + 0x60))
	const j = ld64(g + 8)
	const i = ld64(g + 0x10)
	const h = ld64(g + 0x18)
	st64(s100 + 8, ld64(g))
	st64(sf0, j, i, h)
	m = fn_8228(s120, s100, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
	const k = ld64(s120)
	if (k != 2) {
		m = Error_with_account_name(s130, k, ld64(s120 + 8), "whirlpools_config", 0x11)
		l = ld64(s130)
		st64(a + 8, ld64(s130 + 8))
		st64(a, l)
		return m
	}
	st64(a + 8, k)
	st64(a, 2)
	return m
}

// Anchor Accounts::try_accounts of instruction set_fee_authority (called by ix_set_fee_authority; name [str]: from the handler's "Instruction: …" log; was fn_c7d08)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config (ConstraintMut), new_fee_authority (AccountNotEnoughKeys), fee_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpools_config, fee_authority
export function accounts_set_fee_authority(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s40 = fp - 0x40, s98 = fp - 0x98, sf0 = fp - 0xf0, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, s1b0 = fp - 0x1b0
	let j, m, t, u: u64
	try_accounts_11de0(s108, c, c, d, e)
	const g = ld64(s108 + 0x10)
	const k = ld64(s108 + 8)
	const whirlpools_config: AccountInfo = ld64(s108)
	if (whirlpools_config == 0) {
		u = Error_with_account_name(s198, k, g, "whirlpools_config", 0x11)
		t = ld64(s198)
		st64(a + 0x10, ld64(s198 + 8))
		st64(a + 8, t)
		st64(a, 0)
		return u
	}
	st64(s1a0, g)
	memcpy(s98, sf0, 0x58)
	try_accounts_11718(s108, c)
	const fee_authority: AccountInfo = ld64(s108 + 8)
	const h = ld64(s108)
	if (h == 2) {
		const i = ld64(c + 8)
		if (i == 0) {
			anchor_error_from(s128, 0xbbd /* anchor::AccountNotEnoughKeys */, fee_authority, undef, m)
			j = ld64(s128 + 8)
			const n = ld64(s128)
			if (n != 2) {
				u = Error_with_account_name(s138, n, j, "new_fee_authority", 0x11)
				t = ld64(s138)
				st64(a + 0x10, ld64(s138 + 8))
				st64(a + 8, t)
				st64(a, 0)
				return u
			}
		} else {
			st64(c + 8, i - 1)
			j = ld64(c)
			st64(c, j + 0x30)
		}
		if (whirlpools_config.is_writable == 0) {
			anchor_error_from(s178, 0x7d0 /* anchor::ConstraintMut */, fee_authority, j, m)
			u = Error_with_account_name(s188, ld64(s178), ld64(s178 + 8), "whirlpools_config", 0x11)
			t = ld64(s188)
			st64(a + 0x10, ld64(s188 + 8))
			st64(a + 8, t)
			st64(a, 0)
			return u
		}
		st64(s1a8, j)
		const o = fee_authority.key
		copyr(s40, o, 0x20)
		const p = ld64(s1a0)
		st64(s20, k, p)
		copy(s10, s98, 0x10)
		st64(s1b0, fee_authority)
		if ((memcmp(s40, s20, 0x20) as u32) != 0) {
			anchor_error_from(s148, 0x7dc /* anchor::ConstraintAddress */)
			const s = Error_with_account_name(s158, ld64(s148), ld64(s148 + 8), "fee_authority", 0xd)
			const r = ld64(s158 + 8)
			const q = ld64(s158)
			copy(s108, s40, 0x40)
			u = fn_13b5c0(s168, q, r, s108, s)
			t = ld64(s168)
			st64(a + 0x10, ld64(s168 + 8))
			st64(a + 8, t)
			st64(a, 0)
			return u
		}
		u = memcpy(a + 0x18, s98, 0x58)
		st64(a + 0x78, ld64(s1a8))
		st64(a + 0x70, ld64(s1b0))
		st64(a + 0x10, p)
		st64(a + 8, k)
		st64(a, whirlpools_config)
		return u
	}
	u = Error_with_account_name(s118, h, fee_authority, "fee_authority", 0xd)
	t = ld64(s118)
	st64(a + 0x10, ld64(s118 + 8))
	st64(a + 8, t)
	st64(a, 0)
	return u
}
