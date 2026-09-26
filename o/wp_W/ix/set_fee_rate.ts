/// <reference path="../lib.d.ts" />
// instruction set_fee_rate
import { accounts_set_fee_rate, fn_6aa0, memcpy } from '../shared.ts'

// instruction handler: set_fee_rate (discriminator sha256("global:set_fee_rate")[..8] = 0x69e8c084189f335)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, whirlpool, fee_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
export function ix_set_fee_rate(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s2f0 = fp - 0x2f0, s308 = fp - 0x308, s318 = fp - 0x318, s5a0 = fp - 0x5a0, s5f8 = fp - 0x5f8, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660
	let h, k: u64
	sol_log("Instruction: SetFeeRate", 0x17)
	if (2 > ix_args_len) {
		const i = fn_1459d0(0x100159468)
		if (2 > (i & 3) - 2) {
			k = anchor_error_from(s660, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s660)
			st64(a + 8, ld64(s660 + 8))
			st64(a, h)
			return k
		}
		if ((i & 3) == 0) {
			k = anchor_error_from(s660, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s660)
			st64(a + 8, ld64(s660 + 8))
			st64(a, h)
			return k
		}
		const j = ld64(ld64(i + 7))
		callx(j, ld64(i - 1), j)
		k = anchor_error_from(s660, 0x66 /* anchor::InstructionDidNotDeserialize */)
		h = ld64(s660)
		st64(a + 8, ld64(s660 + 8))
		st64(a, h)
		return k
	}
	const m = ld16(ix_args)
	st64(s620, accounts, accounts_len)
	k = accounts_set_fee_rate(s308, undef, s620, undef, fp)
	let g = ld64(s308 + 0x10)
	h = ld64(s308 + 8)
	const f = ld64(s308)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return k
	}
	memcpy(s5f8, s2f0, 0x2f0)
	st64(s610, f, h, g)
	if (m > 0xea60) {
		k = fn_87630(s630, 0x1c)
		g = ld64(s630 + 8)
		h = ld64(s630)
		if (h != 2) {
			st64(a + 8, g)
			st64(a, h)
			return k
		}
	} else {
		st16(s318, m)
	}
	k = fn_6aa0(s640, s5a0, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
	const l = ld64(s640)
	if (l != 2) {
		k = Error_with_account_name(s650, l, ld64(s640 + 8), 0x100152b28 /* "whirlpool" */, 9)
		h = ld64(s650)
		st64(a + 8, ld64(s650 + 8))
		st64(a, h)
		return k
	}
	st64(a + 8, g)
	st64(a, 2)
	return k
}
