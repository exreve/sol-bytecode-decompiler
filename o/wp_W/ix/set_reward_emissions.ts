/// <reference path="../lib.d.ts" />
// instruction set_reward_emissions
import { fn_1495b0, fn_4e100, fn_6aa0, memcpy } from '../shared.ts'

// instruction handler: set_reward_emissions (discriminator sha256("global:set_reward_emissions")[..8] = 0xf41bb06da856c50d)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, reward_vault, reward_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
export function ix_set_reward_emissions(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s24 = fp - 0x24, s28 = fp - 0x28, s340 = fp - 0x340, s350 = fp - 0x350, s374 = fp - 0x374, s378 = fp - 0x378, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s1000 = fp - 0x1000
	let k, o: u64
	sol_log("Instruction: SetRewardEmissions", 0x1f)
	const f = ix_args_len
	if (f != 0 && f >= 0x11) {
		const g = ix_args
		const p = ld8(g)
		const q = ld64(g + 9)
		const h = ld64(g + 1)
		st64(s6b0, accounts, accounts_len)
		st64(s1000, f)
		o = accounts_set_reward_emissions(s350, h, s6b0, g, fp)
		let j = ld64(s350 + 8)
		k = ld64(s350)
		const i = ld32(s28)
		if (i == 2) {
			st64(a + 8, j)
			st64(a, k)
			return o
		}
		memcpy(s690, s340, 0x318)
		copy(s374, s24, 0x20)
		st32(s374 + 0x20, ld32(s24 + 0x20))
		st32(s378, i)
		st64(s6a0, k, j)
		copyr(s340, s6b0, 0x10)
		st64(s350 + 8, s6a0)
		j = program_id
		st64(s350, program_id)
		o = fn_367c0(s6c0, s350, p, h, q)
		k = ld64(s6c0)
		if (k == 2) {
			o = fn_6aa0(s6d0, s6a0, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, j)
			const l = ld64(s6d0)
			if (l != 2) {
				o = Error_with_account_name(s6e0, l, ld64(s6d0 + 8), 0x100152b28 /* "whirlpool" */, 9)
				k = ld64(s6e0)
				st64(a + 8, ld64(s6e0 + 8))
				st64(a, k)
				return o
			}
			st64(a + 8, j)
			st64(a, 2)
			return o
		}
		st64(a + 8, ld64(s6c0 + 8))
		st64(a, k)
		return o
	}
	const m = fn_1459d0(0x100159468)
	if (2 > (m & 3) - 2) {
		o = anchor_error_from(s6f0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s6f0)
		st64(a + 8, ld64(s6f0 + 8))
		st64(a, k)
		return o
	}
	if ((m & 3) == 0) {
		o = anchor_error_from(s6f0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s6f0)
		st64(a + 8, ld64(s6f0 + 8))
		st64(a, k)
		return o
	}
	const n = ld64(ld64(m + 7))
	callx(n, ld64(m - 1), n)
	o = anchor_error_from(s6f0, 0x66 /* anchor::InstructionDidNotDeserialize */)
	k = ld64(s6f0)
	st64(a + 8, ld64(s6f0 + 8))
	st64(a, k)
	return o
}

// Anchor Accounts::try_accounts of instruction set_reward_emissions (called by ix_set_reward_emissions; name [str]: from the handler's "Instruction: …" log; was fn_c98e8)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool (ConstraintMut), reward_vault (ConstraintAddress), reward_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpool, reward_authority
export function accounts_set_reward_emissions(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, sc0 = fp - 0xc0, se8 = fp - 0xe8, s330 = fp - 0x330, s360 = fp - 0x360, s370 = fp - 0x370, s378 = fp - 0x378, s574 = fp - 0x574, s5e8 = fp - 0x5e8, s5f0 = fp - 0x5f0, s5f8 = fp - 0x5f8, s608 = fp - 0x608, s618 = fp - 0x618, s628 = fp - 0x628, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s668 = fp - 0x668, s678 = fp - 0x678, s688 = fp - 0x688, s698 = fp - 0x698, s6a8 = fp - 0x6a8, s6b8 = fp - 0x6b8, s6c8 = fp - 0x6c8, s6d0 = fp - 0x6d0, s6d8 = fp - 0x6d8, s6e0 = fp - 0x6e0, s6e8 = fp - 0x6e8
	let p, r, s, t: u64
	let f = a
	if (ld64(e - 0x1000) == 0) {
		const n = fn_1459d0(0x100159468)
		if (2 > (n & 3) - 2) {
			t = anchor_error_from(s6c8, 0x66 /* anchor::InstructionDidNotDeserialize */)
			p = ld64(s6c8)
			st64(f + 8, ld64(s6c8 + 8))
			st64(f, p)
			st32(f + 0x328, 2)
			return t
		}
		if ((n & 3) == 0) {
			t = anchor_error_from(s6c8, 0x66 /* anchor::InstructionDidNotDeserialize */)
			p = ld64(s6c8)
			st64(f + 8, ld64(s6c8 + 8))
			st64(f, p)
			st32(f + 0x328, 2)
			return t
		}
		const o = ld64(ld64(n + 7))
		callx(o, ld64(n - 1), o)
		t = anchor_error_from(s6c8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		p = ld64(s6c8)
		st64(f + 8, ld64(s6c8 + 8))
		st64(f, p)
		st32(f + 0x328, 2)
		return t
	}
	st64(s6d0, f)
	st64(s6d8, ld8(d))
	try_accounts_11a48(s608, c, c, d, e)
	const h = ld64(s5f8)
	const i = ld64(s608 + 8)
	const whirlpool: AccountInfo = ld64(s608)
	if (whirlpool == 0) {
		t = Error_with_account_name(s6b8, i, h, 0x100152b28 /* "whirlpool" */, 9)
		s = ld64(s6b8)
		r = ld64(s6d0)
		st64(r + 8, ld64(s6b8 + 8))
		st64(r, s)
		st32(r + 0x328, 2)
		return t
	}
	memcpy(s360, s5f0, 0x278)
	st64(s378, whirlpool, i, h)
	try_accounts_11718(s608, c)
	const reward_authority: AccountInfo = ld64(s608 + 8)
	const j = ld64(s608)
	if (j == 2) {
		try_accounts_11f50(s608, c)
		const l = ld64(s608 + 8)
		const m = ld64(s608)
		const k = ld32(s5e8 + 0x70)
		if (k == 2) {
			t = Error_with_account_name(s6a8, m, l, "reward_vault", 0xc)
			s = ld64(s6a8)
			r = ld64(s6d0)
			st64(r + 8, ld64(s6a8 + 8))
			st64(r, s)
			st32(r + 0x328, 2)
			return t
		}
		st64(s6e0, m)
		memcpy(sc0, s5f8, 0x80)
		copy(se8, s574, 0x20)
		st32(se8 + 0x20, ld32(s574 + 0x20))
		if (whirlpool.is_writable == 0) {
			anchor_error_from(s688, 0x7d0 /* anchor::ConstraintMut */)
			t = Error_with_account_name(s698, ld64(s688), ld64(s688 + 8), 0x100152b28 /* "whirlpool" */, 9)
			s = ld64(s698)
			r = ld64(s6d0)
			st64(r + 8, ld64(s698 + 8))
			st64(r, s)
			st32(r + 0x328, 2)
			return t
		}
		const u = reward_authority.key
		copyr(s40, u, 0x20)
		copyr(s20, s330, 0x20)
		if ((memcmp(s40, s20, 0x20) as u32) != 0) {
			anchor_error_from(s628, 0x7dc /* anchor::ConstraintAddress */)
			const ae = Error_with_account_name(s638, ld64(s628), ld64(s628 + 8), "reward_authority", 0x10)
			const ad = ld64(s638 + 8)
			const ac = ld64(s638)
			copyr(s608, s40, 0x20)
			copy(s5e8, s330, 0x20)
			t = fn_13b5c0(s648, ac, ad, s608, ae)
			s = ld64(s648)
			r = ld64(s6d0)
			st64(r + 8, ld64(s648 + 8))
			st64(r, s)
			st32(r + 0x328, 2)
			return t
		}
		st64(s6e8, l)
		const v = ld64(ld64(s6e0))
		copyr(s40, v, 0x20)
		const w = ld64(s6d8)
		if (3 > w) {
			const x = s370 + (w << 7)
			copyr(s20, x + 0x20, 0x20)
			const y = memcmp(s40, s20, 0x20)
			f = ld64(s6d0)
			if ((y as u32) == 0) {
				memcpy(f, s378, 0x290)
				memcpy(f + 0x2a8, sc0, 0x80)
				const aj = ld32(se8 + 0x20)
				const ai = ld64(se8 + 0x18)
				const ah = ld64(se8 + 0x10)
				const ag = ld64(se8 + 8)
				const af = ld64(se8)
				st32(f + 0x328, k)
				st64(f + 0x2a0, ld64(s6e8))
				t = ld64(s6e0)
				st64(f + 0x298, t)
				st64(f + 0x290, reward_authority)
				st64(f + 0x32c, af, ag, ah, ai)
				st32(f + 0x34c, aj)
				return t
			}
			anchor_error_from(s658, 0x7dc /* anchor::ConstraintAddress */)
			const ab = Error_with_account_name(s668, ld64(s658), ld64(s658 + 8), "reward_vault", 0xc)
			const aa = ld64(s668 + 8)
			const z = ld64(s668)
			copyr(s608, s40, 0x20)
			copy(s5e8, x + 0x20, 0x20)
			t = fn_13b5c0(s678, z, aa, s608, ab)
			p = ld64(s678)
			st64(f + 8, ld64(s678 + 8))
			st64(f, p)
			st32(f + 0x328, 2)
			return t
		}
		fn_1495b0(w, 3, 0x10015a7a0)
	}
	t = Error_with_account_name(s618, j, reward_authority, "reward_authority", 0x10)
	s = ld64(s618)
	r = ld64(s6d0)
	st64(r + 8, ld64(s618 + 8))
	st64(r, s)
	st32(r + 0x328, 2)
	return t
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: e (value), d (value), c (value)
export function fn_367c0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s180 = fp - 0x180, s300 = fp - 0x300, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s390 = fp - 0x390, s398 = fp - 0x398, s3a0 = fp - 0x3a0
	let l, q: u64
	st64(s390, c)
	let m = a
	const h = ld64(b + 8)
	if ((d | e) != 0) {
		__multi3(s328, e, 0, 0x15180, 0)
		__multi3(s318, d, 0, 0x15180, 0)
		const f = ld64(s318 + 8)
		const g = ld64(s328)
		if ((ld64(s328 + 8) != 0 | f > f + g) != 0) {
			q = fn_87630(s348, 0x1e)
			l = ld64(s348)
			st64(m + 8, ld64(s348 + 8))
			st64(m, l)
			return q
		}
		if (f + g > ld64(h + 0x2e0)) {
			q = fn_87630(s338, 0x1b)
			l = ld64(s338)
			st64(m + 8, ld64(s338 + 8))
			st64(m, l)
			return q
		}
	}
	st64(s398, h)
	clock_get_13f308(s308)
	if (ld64(s308) == 0) {
		let k = ld64(s300 + 0x20)
		if (-1 >= (k as i64)) {
			q = fn_87630(s368, 0x15)
			k = ld64(s368 + 8)
			l = ld64(s368)
			if (l != 2) {
				st64(m + 8, k)
				st64(m, l)
				return q
			}
		}
		st64(s3a0, m)
		const n = ld64(s398)
		fn_4e100(s308, n + 8, k)
		if (ld32(s308) != 0) {
			q = fn_87630(s378, ld32(s308 + 4))
			l = ld64(s378)
			m = ld64(s3a0)
			st64(m + 8, ld64(s378 + 8))
			st64(m, l)
			return q
		}
		memcpy(s180, s300, 0x180)
		const o = ld64(s390)
		if ((o as u8) > 2) {
			q = fn_87630(s388, 0x1a)
			l = ld64(s388)
			m = ld64(s3a0)
			st64(m + 8, ld64(s388 + 8))
			st64(m, l)
			return q
		}
		st64(s390, o as u8)
		st64(ld64(s398) + 0x278, k)
		q = memcpy(n + 8, s180, 0x180)
		const p = n + 8 + (ld64(s390) << 7)
		st64(p + 0x68, e)
		st64(p + 0x60, d)
		m = ld64(s3a0)
		st64(m + 8, k)
		st64(m, 2)
		return q
	}
	const j = ld64(s300)
	const i = ld64(s300 + 8)
	st64(s300 + 8, ld64(s300 + 0x10))
	st64(s308, j, i)
	q = fn_13b430(s358, s308)
	l = ld64(s358)
	st64(m + 8, ld64(s358 + 8))
	st64(m, l)
	return q
}
