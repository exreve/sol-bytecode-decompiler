/// <reference path="../lib.d.ts" />
// instruction set_reward_authority_by_super_authority
import { fn_6aa0, memcpy } from '../shared.ts'

// instruction handler: set_reward_authority_by_super_authority (discriminator sha256("global:set_reward_authority_by_super_authority")[..8] = 0x19385d94c6c99af0)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, whirlpool, new_reward_authority, reward_emissions_super_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
export function ix_set_reward_authority_by_super_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64, p5: u64, ix_args_len: u64): u64 {
	const s2f8 = fp - 0x2f8, s310 = fp - 0x310, s318 = fp - 0x318, s560 = fp - 0x560, s5b0 = fp - 0x5b0, s608 = fp - 0x608, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s1000 = fp - 0x1000
	let i, q: u64
	sol_log("Instruction: SetRewardAuthorityBySuperAuthority", 0x2f)
	const f = ix_args_len
	if (f == 0) {
		const o = fn_1459d0(0x100159468)
		if (2 > (o & 3) - 2) {
			q = anchor_error_from(s660, 0x66 /* anchor::InstructionDidNotDeserialize */)
			i = ld64(s660)
			st64(a + 8, ld64(s660 + 8))
			st64(a, i)
			return q
		}
		if ((o & 3) == 0) {
			q = anchor_error_from(s660, 0x66 /* anchor::InstructionDidNotDeserialize */)
			i = ld64(s660)
			st64(a + 8, ld64(s660 + 8))
			st64(a, i)
			return q
		}
		const p = ld64(ld64(o + 7))
		callx(p, ld64(o - 1), p)
		q = anchor_error_from(s660, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s660)
		st64(a + 8, ld64(s660 + 8))
		st64(a, i)
		return q
	}
	st64(s630, accounts, accounts_len)
	st64(s1000, f)
	q = accounts_set_reward_authority_by_super_authority(s310, undef, s630, undef, fp)
	const h = ld64(s310 + 0x10)
	i = ld64(s310 + 8)
	const g = ld64(s310)
	if (g == 0) {
		st64(a + 8, h)
		st64(a, i)
		return q
	}
	memcpy(s608, s2f8, 0x2f8)
	st64(s620, g, i, h)
	const j = ld64(ld64(s318))
	const m = ld64(j + 8)
	const l = ld64(j + 0x10)
	const k = ld64(j + 0x18)
	st64(s5b0 + 0x48, ld64(j))
	st64(s560, m, l, k)
	q = fn_6aa0(s640, s5b0, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
	const n = ld64(s640)
	if (n != 2) {
		q = Error_with_account_name(s650, n, ld64(s640 + 8), 0x100152b28 /* "whirlpool" */, 9)
		i = ld64(s650)
		st64(a + 8, ld64(s650 + 8))
		st64(a, i)
		return q
	}
	st64(a + 8, h)
	st64(a, 2)
	return q
}

// Anchor Accounts::try_accounts of instruction set_reward_authority_by_super_authority (called by ix_set_reward_authority_by_super_authority; name [str]: from the handler's "Instruction: …" log; was fn_c8f88)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, whirlpool (ConstraintMut, ConstraintHasOne), new_reward_authority (AccountNotEnoughKeys), reward_emissions_super_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpools_config, whirlpool, reward_emissions_super_authority
export function accounts_set_reward_authority_by_super_authority(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s148 = fp - 0x148, s2b8 = fp - 0x2b8, s528 = fp - 0x528, s530 = fp - 0x530, s548 = fp - 0x548, s570 = fp - 0x570, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6a8 = fp - 0x6a8
	let n, r, ab, ac: u64
	if (ld64(e - 0x1000) == 0) {
		const o = fn_1459d0(0x100159468)
		if (2 > (o & 3) - 2) {
			ac = anchor_error_from(s680, 0x66 /* anchor::InstructionDidNotDeserialize */)
			ab = ld64(s680)
			st64(a + 0x10, ld64(s680 + 8))
			st64(a + 8, ab)
			st64(a, 0)
			return ac
		}
		if ((o & 3) == 0) {
			ac = anchor_error_from(s680, 0x66 /* anchor::InstructionDidNotDeserialize */)
			ab = ld64(s680)
			st64(a + 0x10, ld64(s680 + 8))
			st64(a + 8, ab)
			st64(a, 0)
			return ac
		}
		const p = ld64(ld64(o + 7))
		callx(p, ld64(o - 1), p)
		ac = anchor_error_from(s680, 0x66 /* anchor::InstructionDidNotDeserialize */)
		ab = ld64(s680)
		st64(a + 0x10, ld64(s680 + 8))
		st64(a + 8, ab)
		st64(a, 0)
		return ac
	}
	try_accounts_11de0(s548, c, c, d, e)
	const h = ld64(s548 + 0x10)
	const g = ld64(s548 + 8)
	const whirlpools_config: AccountInfo = ld64(s548)
	if (whirlpools_config == 0) {
		ac = Error_with_account_name(s670, g, h, "whirlpools_config", 0x11)
		ab = ld64(s670)
		st64(a + 0x10, ld64(s670 + 8))
		st64(a + 8, ab)
		st64(a, 0)
		return ac
	}
	st64(s690, g, h)
	memcpy(s5a0, s530, 0x58)
	try_accounts_11a48(s548, c)
	const k = ld64(s548 + 0x10)
	const j = ld64(s548 + 8)
	const whirlpool: AccountInfo = ld64(s548)
	if (whirlpool == 0) {
		ac = Error_with_account_name(s660, j, k, 0x100152b28 /* "whirlpool" */, 9)
		ab = ld64(s660)
		st64(a + 0x10, ld64(s660 + 8))
		st64(a + 8, ab)
		st64(a, 0)
		return ac
	}
	st64(s6a0, j, k)
	memcpy(s2b8, s530, 0x278)
	try_accounts_11718(s548, c)
	const reward_emissions_super_authority: AccountInfo = ld64(s548 + 8)
	const l = ld64(s548)
	if (l == 2) {
		const m = ld64(c + 8)
		if (m == 0) {
			anchor_error_from(s5c0, 0xbbd /* anchor::AccountNotEnoughKeys */, reward_emissions_super_authority, undef, r)
			n = ld64(s5c0 + 8)
			const s = ld64(s5c0)
			if (s != 2) {
				ac = Error_with_account_name(s5d0, s, n, "new_reward_authority", 0x14)
				ab = ld64(s5d0)
				st64(a + 0x10, ld64(s5d0 + 8))
				st64(a + 8, ab)
				st64(a, 0)
				return ac
			}
		} else {
			st64(c + 8, m - 1)
			n = ld64(c)
			st64(c, n + 0x30)
		}
		if (whirlpool.is_writable == 0) {
			anchor_error_from(s640, 0x7d0 /* anchor::ConstraintMut */, reward_emissions_super_authority, n, r)
			ac = Error_with_account_name(s650, ld64(s640), ld64(s640 + 8), 0x100152b28 /* "whirlpool" */, 9)
			ab = ld64(s650)
			st64(a + 0x10, ld64(s650 + 8))
			st64(a + 8, ab)
			st64(a, 0)
			return ac
		}
		st64(s6a8, n)
		copyr(s40, s148, 0x20)
		const t = whirlpools_config.key
		copyr(s20, t, 0x20)
		if ((memcmp(s40, s20, 0x20) as u32) != 0) {
			anchor_error_from(s5e0, 0x7d1 /* anchor::ConstraintHasOne */)
			const aa = Error_with_account_name(s5f0, ld64(s5e0), ld64(s5e0 + 8), 0x100152b28 /* "whirlpool" */, 9)
			const z = ld64(s5f0 + 8)
			const y = ld64(s5f0)
			copyr(s548, s148, 0x20)
			copy(s528, s20, 0x20)
			ac = fn_13b5c0(s600, y, z, s548, aa)
			ab = ld64(s600)
			st64(a + 0x10, ld64(s600 + 8))
			st64(a + 8, ab)
			st64(a, 0)
			return ac
		}
		const u = reward_emissions_super_authority.key
		copyr(s40, u, 0x20)
		copyr(s20, s570, 0x20)
		if ((memcmp(s40, s20, 0x20) as u32) == 0) {
			memcpy(a + 0x18, s5a0, 0x58)
			ac = memcpy(a + 0x88, s2b8, 0x278)
			st64(a + 0x308, ld64(s6a8))
			st64(a + 0x300, reward_emissions_super_authority)
			st64(a + 0x80, ld64(s6a0 + 8))
			st64(a + 0x78, ld64(s6a0))
			st64(a + 0x70, whirlpool)
			st64(a + 0x10, ld64(s690 + 8))
			st64(a + 8, ld64(s690))
			st64(a, whirlpools_config)
			return ac
		}
		anchor_error_from(s610, 0x7dc /* anchor::ConstraintAddress */)
		const x = Error_with_account_name(s620, ld64(s610), ld64(s610 + 8), "reward_emissions_super_authority", 0x20)
		const w = ld64(s620 + 8)
		const v = ld64(s620)
		copyr(s548, s40, 0x20)
		copy(s528, s570, 0x20)
		ac = fn_13b5c0(s630, v, w, s548, x)
		ab = ld64(s630)
		st64(a + 0x10, ld64(s630 + 8))
		st64(a + 8, ab)
		st64(a, 0)
		return ac
	}
	ac = Error_with_account_name(s5b0, l, reward_emissions_super_authority, "reward_emissions_super_authority", 0x20)
	ab = ld64(s5b0)
	st64(a + 0x10, ld64(s5b0 + 8))
	st64(a + 8, ab)
	st64(a, 0)
	return ac
}
