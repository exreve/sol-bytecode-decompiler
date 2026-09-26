/// <reference path="../lib.d.ts" />
// instruction increase_liquidity_v2
import { accounts_decrease_liquidity_v2, fn_11b3b8, fn_1494c8 } from '../shared.ts'

// instruction handler: increase_liquidity_v2 (discriminator sha256("global:increase_liquidity_v2")[..8] = 0xab0ee45df591d85)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, position, position_token_account, token_mint_a, token_mint_b, tick_array_lower, tick_array_upper, token_program_a, token_owner_account_a, token_vault_b, token_vault_a, token_owner_account_b, token_program_b, position_authority, memo_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: accounts, accounts_len, ix_args, ix_args_len
export function ix_increase_liquidity_v2(a: u64, b: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0
	let j, k: u64
	sol_log("Instruction: IncreaseLiquidityV2", 0x20)
	st64(s4d0, ix_args, ix_args_len)
	fn_11b3b8(s4c0, s4d0)
	const f = ld64(s4c0)
	if (f == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
		const g = ld64(s4c0 + 8)
		const h = (g & 3) - 2
		if (2 > h) {
			k = anchor_error_from(s4e0, 0x66 /* anchor::InstructionDidNotDeserialize */, h)
			j = ld64(s4e0)
			st64(a + 8, ld64(s4e0 + 8))
			st64(a, j)
			return k
		}
		if ((g & 3) == 0) {
			k = anchor_error_from(s4e0, 0x66 /* anchor::InstructionDidNotDeserialize */, h)
			j = ld64(s4e0)
			st64(a + 8, ld64(s4e0 + 8))
			st64(a, j)
			return k
		}
		const i = ld64(ld64(g + 7))
		callx(i, ld64(g - 1), i, h)
		k = anchor_error_from(s4e0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s4e0)
		st64(a + 8, ld64(s4e0 + 8))
		st64(a, j)
		return k
	}
	st64(s4d0, accounts, accounts_len)
	k = accounts_decrease_liquidity_v2(s4c0, f, s4d0, undef, fp)
	if (ld32(s4c0) == 2) {
		j = ld64(s4c0 + 8)
		st64(a + 8, ld64(s4c0 + 0x10))
		st64(a, j)
		return k
	}
	fn_1494c8("internal error: entered unreachable code", 0x28, 0x10015a970)
}
