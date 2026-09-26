/// <reference path="../lib.d.ts" />
// instruction set_default_base_fee_rate
import { accounts_set_default_base_fee_rate, fn_5f98, memcpy } from '../shared.ts'

// instruction handler: set_default_base_fee_rate (discriminator sha256("global:set_default_base_fee_rate")[..8] = 0x7b786a4fb5442e5)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, adaptive_fee_tier, fee_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: adaptive_fee_tier
export function ix_set_default_base_fee_rate(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const se0 = fp - 0xe0, sf8 = fp - 0xf8, s180 = fp - 0x180, s1d8 = fp - 0x1d8, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240
	let h, k: u64
	sol_log("Instruction: SetDefaultBaseFeeRate", 0x22)
	if (2 > ix_args_len) {
		const i = fn_1459d0(0x100159468)
		if (2 > (i & 3) - 2) {
			k = anchor_error_from(s240, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s240)
			st64(a + 8, ld64(s240 + 8))
			st64(a, h)
			return k
		}
		if ((i & 3) == 0) {
			k = anchor_error_from(s240, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s240)
			st64(a + 8, ld64(s240 + 8))
			st64(a, h)
			return k
		}
		const j = ld64(ld64(i + 7))
		callx(j, ld64(i - 1), j)
		k = anchor_error_from(s240, 0x66 /* anchor::InstructionDidNotDeserialize */)
		h = ld64(s240)
		st64(a + 8, ld64(s240 + 8))
		st64(a, h)
		return k
	}
	const m = ld16(ix_args)
	st64(s200, accounts, accounts_len)
	k = accounts_set_default_base_fee_rate(sf8, undef, s200, undef, fp)
	let g = ld64(sf8 + 0x10)
	h = ld64(sf8 + 8)
	const f = ld64(sf8)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return k
	}
	memcpy(s1d8, se0, 0xe0)
	st64(s1f0, f, h, g)
	if (m > 0xea60) {
		k = fn_87630(s210, 0x1c)
		g = ld64(s210 + 8)
		h = ld64(s210)
		if (h != 2) {
			st64(a + 8, g)
			st64(a, h)
			return k
		}
	} else {
		st16(s180 + 0x74, m)
	}
	k = fn_5f98(s220, s180, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
	const l = ld64(s220)
	if (l != 2) {
		k = Error_with_account_name(s230, l, ld64(s220 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
		h = ld64(s230)
		st64(a + 8, ld64(s230 + 8))
		st64(a, h)
		return k
	}
	st64(a + 8, g)
	st64(a, 2)
	return k
}
