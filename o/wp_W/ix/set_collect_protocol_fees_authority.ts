/// <reference path="../lib.d.ts" />
// instruction set_collect_protocol_fees_authority
import { fn_8228, memcpy } from '../shared.ts'

// instruction handler: set_collect_protocol_fees_authority (discriminator sha256("global:set_collect_protocol_fees_authority")[..8] = 0x43e9e18bf45d9622)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, new_collect_protocol_fees_authority, collect_protocol_fees_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config
export function ix_set_collect_protocol_fees_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s68 = fp - 0x68, s80 = fp - 0x80, sd0 = fp - 0xd0, se8 = fp - 0xe8, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130
	sol_log("Instruction: SetCollectProtocolFeesAuthority", 0x2c)
	st64(s110, accounts, accounts_len)
	let n = accounts_set_collect_protocol_fees_authority(s80, undef, s110, undef, fp)
	const g = ld64(s80 + 0x10)
	let h = ld64(s80 + 8)
	const f = ld64(s80)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return n
	}
	memcpy(se8, s68, 0x68)
	st64(s100, f, h, g)
	const i = ld64(ld64(sd0 + 0x48))
	const l = ld64(i + 8)
	const k = ld64(i + 0x10)
	const j = ld64(i + 0x18)
	st64(se8 + 0x10, ld64(i))
	st64(sd0, l, k, j)
	n = fn_8228(s120, s100, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
	const m = ld64(s120)
	if (m != 2) {
		n = Error_with_account_name(s130, m, ld64(s120 + 8), "whirlpools_config", 0x11)
		h = ld64(s130)
		st64(a + 8, ld64(s130 + 8))
		st64(a, h)
		return n
	}
	st64(a + 8, g)
	st64(a, 2)
	return n
}

// Anchor Accounts::try_accounts of instruction set_collect_protocol_fees_authority (called by ix_set_collect_protocol_fees_authority; name [str]: from the handler's "Instruction: …" log; was fn_c6828)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config (ConstraintMut), new_collect_protocol_fees_authority (AccountNotEnoughKeys), collect_protocol_fees_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpools_config, collect_protocol_fees_authority
export function accounts_set_collect_protocol_fees_authority(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s88 = fp - 0x88, s98 = fp - 0x98, se8 = fp - 0xe8, sf0 = fp - 0xf0, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8
	let j, m, s, t: u64
	try_accounts_11de0(s108, c, c, d, e)
	const g = ld64(s108 + 0x10)
	const k = ld64(s108 + 8)
	const whirlpools_config: AccountInfo = ld64(s108)
	if (whirlpools_config == 0) {
		t = Error_with_account_name(s198, k, g, "whirlpools_config", 0x11)
		s = ld64(s198)
		st64(a + 0x10, ld64(s198 + 8))
		st64(a + 8, s)
		st64(a, 0)
		return t
	}
	st64(s1a0, g)
	memcpy(s98, sf0, 0x58)
	try_accounts_11718(s108, c)
	const collect_protocol_fees_authority: AccountInfo = ld64(s108 + 8)
	const h = ld64(s108)
	if (h == 2) {
		const i = ld64(c + 8)
		if (i == 0) {
			anchor_error_from(s128, 0xbbd /* anchor::AccountNotEnoughKeys */, collect_protocol_fees_authority, undef, m)
			j = ld64(s128 + 8)
			const n = ld64(s128)
			if (n != 2) {
				t = Error_with_account_name(s138, n, j, "new_collect_protocol_fees_authority", 0x23)
				s = ld64(s138)
				st64(a + 0x10, ld64(s138 + 8))
				st64(a + 8, s)
				st64(a, 0)
				return t
			}
		} else {
			st64(c + 8, i - 1)
			j = ld64(c)
			st64(c, j + 0x30)
		}
		if (whirlpools_config.is_writable == 0) {
			anchor_error_from(s178, 0x7d0 /* anchor::ConstraintMut */, collect_protocol_fees_authority, j, m)
			t = Error_with_account_name(s188, ld64(s178), ld64(s178 + 8), "whirlpools_config", 0x11)
			s = ld64(s188)
			st64(a + 0x10, ld64(s188 + 8))
			st64(a + 8, s)
			st64(a, 0)
			return t
		}
		st64(s1a8, j)
		const o = collect_protocol_fees_authority.key
		copyr(s40, o, 0x20)
		copyr(s20, s88, 0x20)
		if ((memcmp(s40, s20, 0x20) as u32) != 0) {
			anchor_error_from(s148, 0x7dc /* anchor::ConstraintAddress */)
			const r = Error_with_account_name(s158, ld64(s148), ld64(s148 + 8), "collect_protocol_fees_authority", 0x1f)
			const q = ld64(s158 + 8)
			const p = ld64(s158)
			copyr(s108, s40, 0x20)
			copy(se8, s88, 0x20)
			t = fn_13b5c0(s168, p, q, s108, r)
			s = ld64(s168)
			st64(a + 0x10, ld64(s168 + 8))
			st64(a + 8, s)
			st64(a, 0)
			return t
		}
		t = memcpy(a + 0x18, s98, 0x58)
		st64(a + 0x78, ld64(s1a8))
		st64(a + 0x70, collect_protocol_fees_authority)
		st64(a + 0x10, ld64(s1a0))
		st64(a + 8, k)
		st64(a, whirlpools_config)
		return t
	}
	t = Error_with_account_name(s118, h, collect_protocol_fees_authority, "collect_protocol_fees_authority", 0x1f)
	s = ld64(s118)
	st64(a + 0x10, ld64(s118 + 8))
	st64(a + 8, s)
	st64(a, 0)
	return t
}
