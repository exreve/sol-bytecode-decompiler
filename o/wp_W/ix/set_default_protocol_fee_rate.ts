/// <reference path="../lib.d.ts" />
// instruction set_default_protocol_fee_rate
import { fn_8228, memcpy } from '../shared.ts'

// instruction handler: set_default_protocol_fee_rate (discriminator sha256("global:set_default_protocol_fee_rate")[..8] = 0x562397e2f9cd6b)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, fee_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config
export function ix_set_default_protocol_fee_rate(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s60 = fp - 0x60, s78 = fp - 0x78, sd8 = fp - 0xd8, sf0 = fp - 0xf0, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140
	let h, k: u64
	sol_log("Instruction: SetDefaultProtocolFeeRate", 0x26)
	if (2 > ix_args_len) {
		const i = fn_1459d0(0x100159468)
		if (2 > (i & 3) - 2) {
			k = anchor_error_from(s140, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s140)
			st64(a + 8, ld64(s140 + 8))
			st64(a, h)
			return k
		}
		if ((i & 3) == 0) {
			k = anchor_error_from(s140, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s140)
			st64(a + 8, ld64(s140 + 8))
			st64(a, h)
			return k
		}
		const j = ld64(ld64(i + 7))
		callx(j, ld64(i - 1), j)
		k = anchor_error_from(s140, 0x66 /* anchor::InstructionDidNotDeserialize */)
		h = ld64(s140)
		st64(a + 8, ld64(s140 + 8))
		st64(a, h)
		return k
	}
	const m = ld16(ix_args)
	st64(s100, accounts, accounts_len)
	k = accounts_set_default_protocol_fee_rate(s78, undef, s100, undef, fp)
	let g = ld64(s78 + 0x10)
	h = ld64(s78 + 8)
	const f = ld64(s78)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return k
	}
	memcpy(sd8, s60, 0x60)
	st64(sf0, f, h, g)
	if (m > 0x9c4 /* anchor::RequireViolated */) {
		k = fn_87630(s110, 0x1d)
		g = ld64(s110 + 8)
		h = ld64(s110)
		if (h != 2) {
			st64(a + 8, g)
			st64(a, h)
			return k
		}
	} else {
		st16(sd8 + 0x50, m)
	}
	k = fn_8228(s120, sf0, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
	const l = ld64(s120)
	if (l != 2) {
		k = Error_with_account_name(s130, l, ld64(s120 + 8), "whirlpools_config", 0x11)
		h = ld64(s130)
		st64(a + 8, ld64(s130 + 8))
		st64(a, h)
		return k
	}
	st64(a + 8, g)
	st64(a, 2)
	return k
}

// Anchor Accounts::try_accounts of instruction set_default_protocol_fee_rate (called by ix_set_default_protocol_fee_rate; name [str]: from the handler's "Instruction: …" log; was fn_c78a8)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config (ConstraintMut), fee_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpools_config, fee_authority
export function accounts_set_default_protocol_fee_rate(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s40 = fp - 0x40, s98 = fp - 0x98, sf0 = fp - 0xf0, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s180 = fp - 0x180
	let o, p: u64
	try_accounts_11de0(s108, c, c, d, e)
	const g = ld64(s108 + 0x10)
	const k = ld64(s108 + 8)
	const whirlpools_config: AccountInfo = ld64(s108)
	if (whirlpools_config == 0) {
		p = Error_with_account_name(s178, k, g, "whirlpools_config", 0x11)
		o = ld64(s178)
		st64(a + 0x10, ld64(s178 + 8))
		st64(a + 8, o)
		st64(a, 0)
		return p
	}
	st64(s180, g)
	memcpy(s98, sf0, 0x58)
	try_accounts_11718(s108, c)
	const fee_authority: AccountInfo = ld64(s108 + 8)
	const h = ld64(s108)
	if (h == 2) {
		if (whirlpools_config.is_writable == 0) {
			anchor_error_from(s158, 0x7d0 /* anchor::ConstraintMut */)
			p = Error_with_account_name(s168, ld64(s158), ld64(s158 + 8), "whirlpools_config", 0x11)
			o = ld64(s168)
			st64(a + 0x10, ld64(s168 + 8))
			st64(a + 8, o)
			st64(a, 0)
			return p
		}
		const j = fee_authority.key
		copyr(s40, j, 0x20)
		st64(s20 + 8, ld64(s180))
		st64(s20, k)
		copy(s10, s98, 0x10)
		if ((memcmp(s40, s20, 0x20) as u32) != 0) {
			anchor_error_from(s128, 0x7dc /* anchor::ConstraintAddress */)
			const n = Error_with_account_name(s138, ld64(s128), ld64(s128 + 8), "fee_authority", 0xd)
			const m = ld64(s138 + 8)
			const l = ld64(s138)
			copy(s108, s40, 0x40)
			p = fn_13b5c0(s148, l, m, s108, n)
			o = ld64(s148)
			st64(a + 0x10, ld64(s148 + 8))
			st64(a + 8, o)
			st64(a, 0)
			return p
		}
		p = memcpy(a + 0x18, s98, 0x58)
		st64(a + 0x70, fee_authority)
		st64(a + 0x10, ld64(s180))
		st64(a + 8, k)
		st64(a, whirlpools_config)
		return p
	}
	p = Error_with_account_name(s118, h, fee_authority, "fee_authority", 0xd)
	o = ld64(s118)
	st64(a + 0x10, ld64(s118 + 8))
	st64(a + 8, o)
	st64(a, 0)
	return p
}
