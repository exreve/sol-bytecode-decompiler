/// <reference path="../lib.d.ts" />
// instruction decrease_liquidity
import { accounts_increase_liquidity, fn_1494c8 } from '../shared.ts'

// instruction handler: decrease_liquidity (discriminator sha256("global:decrease_liquidity")[..8] = 0x12c5b686fd026a0)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, position, position_token_account, token_owner_account_a, token_owner_account_b, tick_array_lower, tick_array_upper, token_program, token_vault_b, token_vault_a, position_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: accounts, accounts_len, ix_args_len
export function ix_decrease_liquidity(a: u64, b: u64, accounts: u64, accounts_len: u64, p5: u64, ix_args_len: u64): u64 {
	const s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0
	let i, j: u64
	sol_log(0x100155663 /* "Instruction: DecreaseLiquidity" */, 0x1e)
	const f = ix_args_len
	if (f >= 0x10 && ((f | 8) & -8) != 0x18) {
		st64(s3c0, accounts, accounts_len)
		j = accounts_increase_liquidity(s3b0, undef, s3c0, undef, fp)
		if (ld64(s3b0) == 0) {
			i = ld64(s3b0 + 8)
			st64(a + 8, ld64(s3b0 + 0x10))
			st64(a, i)
			return j
		}
		fn_1494c8("internal error: entered unreachable code", 0x28, 0x10015a940)
	}
	const g = fn_1459d0(0x100159468)
	if (2 > (g & 3) - 2) {
		j = anchor_error_from(s3d0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s3d0)
		st64(a + 8, ld64(s3d0 + 8))
		st64(a, i)
		return j
	}
	if ((g & 3) == 0) {
		j = anchor_error_from(s3d0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s3d0)
		st64(a + 8, ld64(s3d0 + 8))
		st64(a, i)
		return j
	}
	const h = ld64(ld64(g + 7))
	callx(h, ld64(g - 1), h)
	j = anchor_error_from(s3d0, 0x66 /* anchor::InstructionDidNotDeserialize */)
	i = ld64(s3d0)
	st64(a + 8, ld64(s3d0 + 8))
	st64(a, i)
	return j
}
