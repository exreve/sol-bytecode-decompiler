/// <reference path="../lib.d.ts" />
// instruction set_reward_authority
import { fn_6aa0, memcpy } from '../shared.ts'

// instruction handler: set_reward_authority (discriminator sha256("global:set_reward_authority")[..8] = 0x7f551c53fcb72722)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, new_reward_authority, reward_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
export function ix_set_reward_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64, p5: u64, ix_args_len: u64): u64 {
	const s288 = fp - 0x288, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8, s4f0 = fp - 0x4f0, s528 = fp - 0x528, s540 = fp - 0x540, s550 = fp - 0x550, s560 = fp - 0x560, s570 = fp - 0x570, s580 = fp - 0x580
	let h, p: u64
	sol_log("Instruction: SetRewardAuthority", 0x1f)
	if (ix_args_len == 0) {
		const n = fn_1459d0(0x100159468)
		if (2 > (n & 3) - 2) {
			p = anchor_error_from(s580, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s580)
			st64(a + 8, ld64(s580 + 8))
			st64(a, h)
			return p
		}
		if ((n & 3) == 0) {
			p = anchor_error_from(s580, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s580)
			st64(a + 8, ld64(s580 + 8))
			st64(a, h)
			return p
		}
		const o = ld64(ld64(n + 7))
		callx(o, ld64(n - 1), o)
		p = anchor_error_from(s580, 0x66 /* anchor::InstructionDidNotDeserialize */)
		h = ld64(s580)
		st64(a + 8, ld64(s580 + 8))
		st64(a, h)
		return p
	}
	st64(s550, accounts, accounts_len)
	p = accounts_set_reward_authority(s2a0, undef, s550, undef, fp)
	const g = ld64(s2a0 + 0x10)
	h = ld64(s2a0 + 8)
	const f = ld64(s2a0)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return p
	}
	memcpy(s528, s288, 0x288)
	st64(s540, f, h, g)
	const i = ld64(ld64(s2a8))
	const l = ld64(i + 8)
	const k = ld64(i + 0x10)
	const j = ld64(i + 0x18)
	st64(s528 + 0x30, ld64(i))
	st64(s4f0, l, k, j)
	p = fn_6aa0(s560, s540, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
	const m = ld64(s560)
	if (m != 2) {
		p = Error_with_account_name(s570, m, ld64(s560 + 8), 0x100152b28 /* "whirlpool" */, 9)
		h = ld64(s570)
		st64(a + 8, ld64(s570 + 8))
		st64(a, h)
		return p
	}
	st64(a + 8, g)
	st64(a, 2)
	return p
}

// Anchor Accounts::try_accounts of instruction set_reward_authority (called by ix_set_reward_authority; name [str]: from the handler's "Instruction: …" log; was fn_c8a10)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool (ConstraintMut), new_reward_authority (AccountNotEnoughKeys), reward_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpool, reward_authority
export function accounts_set_reward_authority(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s288 = fp - 0x288, s2b8 = fp - 0x2b8, s528 = fp - 0x528, s530 = fp - 0x530, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s598 = fp - 0x598, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s5c8 = fp - 0x5c8, s5d8 = fp - 0x5d8, s5e0 = fp - 0x5e0, s5e8 = fp - 0x5e8
	let j, m, s, t: u64
	try_accounts_11a48(s548, c, c, d, e)
	const g = ld64(s548 + 0x10)
	const k = ld64(s548 + 8)
	const whirlpool: AccountInfo = ld64(s548)
	if (whirlpool == 0) {
		t = Error_with_account_name(s5d8, k, g, 0x100152b28 /* "whirlpool" */, 9)
		s = ld64(s5d8)
		st64(a + 0x10, ld64(s5d8 + 8))
		st64(a + 8, s)
		st64(a, 0)
		return t
	}
	st64(s5e0, g)
	memcpy(s2b8, s530, 0x278)
	try_accounts_11718(s548, c)
	const reward_authority: AccountInfo = ld64(s548 + 8)
	const h = ld64(s548)
	if (h == 2) {
		const i = ld64(c + 8)
		if (i == 0) {
			anchor_error_from(s568, 0xbbd /* anchor::AccountNotEnoughKeys */, reward_authority, undef, m)
			j = ld64(s568 + 8)
			const n = ld64(s568)
			if (n != 2) {
				t = Error_with_account_name(s578, n, j, "new_reward_authority", 0x14)
				s = ld64(s578)
				st64(a + 0x10, ld64(s578 + 8))
				st64(a + 8, s)
				st64(a, 0)
				return t
			}
		} else {
			st64(c + 8, i - 1)
			j = ld64(c)
			st64(c, j + 0x30)
		}
		if (whirlpool.is_writable == 0) {
			anchor_error_from(s5b8, 0x7d0 /* anchor::ConstraintMut */, reward_authority, j, m)
			t = Error_with_account_name(s5c8, ld64(s5b8), ld64(s5b8 + 8), 0x100152b28 /* "whirlpool" */, 9)
			s = ld64(s5c8)
			st64(a + 0x10, ld64(s5c8 + 8))
			st64(a + 8, s)
			st64(a, 0)
			return t
		}
		st64(s5e8, j)
		const o = reward_authority.key
		copyr(s40, o, 0x20)
		copyr(s20, s288, 0x20)
		if ((memcmp(s40, s20, 0x20) as u32) != 0) {
			anchor_error_from(s588, 0x7dc /* anchor::ConstraintAddress */)
			const r = Error_with_account_name(s598, ld64(s588), ld64(s588 + 8), "reward_authority", 0x10)
			const q = ld64(s598 + 8)
			const p = ld64(s598)
			copyr(s548, s40, 0x20)
			copy(s528, s288, 0x20)
			t = fn_13b5c0(s5a8, p, q, s548, r)
			s = ld64(s5a8)
			st64(a + 0x10, ld64(s5a8 + 8))
			st64(a + 8, s)
			st64(a, 0)
			return t
		}
		t = memcpy(a + 0x18, s2b8, 0x278)
		st64(a + 0x298, ld64(s5e8))
		st64(a + 0x290, reward_authority)
		st64(a + 0x10, ld64(s5e0))
		st64(a + 8, k)
		st64(a, whirlpool)
		return t
	}
	t = Error_with_account_name(s558, h, reward_authority, "reward_authority", 0x10)
	s = ld64(s558)
	st64(a + 0x10, ld64(s558 + 8))
	st64(a + 8, s)
	st64(a, 0)
	return t
}
