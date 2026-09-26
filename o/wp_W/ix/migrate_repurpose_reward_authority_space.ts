/// <reference path="../lib.d.ts" />
// instruction migrate_repurpose_reward_authority_space
import { fn_149478, fn_6aa0, memcpy } from '../shared.ts'

// instruction handler: migrate_repurpose_reward_authority_space (discriminator sha256("global:migrate_repurpose_reward_authority_space")[..8] = 0xe7ac62984ff8a1d6)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
export function ix_migrate_repurpose_reward_authority_space(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s278 = fp - 0x278, s290 = fp - 0x290, s3d8 = fp - 0x3d8, s458 = fp - 0x458, s508 = fp - 0x508, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s558 = fp - 0x558
	st64(s558, program_id)
	sol_log("Instruction: MigrateRepurposeRewardAuthoritySpace", 0x31)
	st64(s530, accounts, accounts_len)
	let j = accounts_migrate_repurpose_reward_authority_space(s290, undef, s530, undef, fp)
	const g = ld64(s290 + 0x10)
	let h = ld64(s290 + 8)
	const f = ld64(s290)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return j
	}
	memcpy(s508, s278, 0x278)
	st64(s520, f, h, g)
	if ((memcmp(s3d8, 0x100152180, 0x20) as u32) != 0) {
		st64(s458, 0, 0, 0, 0)
		st64(s3d8, 0, 0, 0, 0)
		j = fn_6aa0(s540, s520, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, ld64(s558))
		const i = ld64(s540)
		if (i != 2) {
			j = Error_with_account_name(s550, i, ld64(s540 + 8), 0x100152b28 /* "whirlpool" */, 9)
			h = ld64(s550)
			st64(a + 8, ld64(s550 + 8))
			st64(a, h)
			return j
		}
		st64(a + 8, g)
		st64(a, 2)
		return j
	}
	st64(s290, 0x100159bd8, 1, 8, 0, 0)
	// fmt "Whirlpool has been migrated already"
	fn_149478(s290, 0x100159be8)
}

// Anchor Accounts::try_accounts of instruction migrate_repurpose_reward_authority_space (called by ix_migrate_repurpose_reward_authority_space; name [str]: from the handler's "Instruction: …" log; was fn_101998)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool (ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpool
export function accounts_migrate_repurpose_reward_authority_space(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s278 = fp - 0x278, s4f0 = fp - 0x4f0, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538
	let i, j: u64
	try_accounts_11a48(s508, c, c, d, e)
	const g = ld64(s508 + 0x10)
	const h = ld64(s508 + 8)
	const whirlpool: AccountInfo = ld64(s508)
	if (whirlpool == 0) {
		j = Error_with_account_name(s538, h, g, 0x100152b28 /* "whirlpool" */, 9)
		i = ld64(s538)
		st64(a + 0x10, ld64(s538 + 8))
		st64(a + 8, i)
		st64(a, 0)
		return j
	}
	memcpy(s278, s4f0, 0x278)
	if (whirlpool.is_writable == 0) {
		anchor_error_from(s518, 0x7d0 /* anchor::ConstraintMut */)
		j = Error_with_account_name(s528, ld64(s518), ld64(s518 + 8), 0x100152b28 /* "whirlpool" */, 9)
		i = ld64(s528)
		st64(a + 0x10, ld64(s528 + 8))
		st64(a + 8, i)
		st64(a, 0)
		return j
	}
	j = memcpy(a + 0x18, s278, 0x278)
	st64(a + 0x10, g)
	st64(a + 8, h)
	st64(a, whirlpool)
	return j
}
