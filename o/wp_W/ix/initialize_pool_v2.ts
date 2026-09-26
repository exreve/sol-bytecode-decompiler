/// <reference path="../lib.d.ts" />
// instruction initialize_pool_v2
import { fn_143100, fn_149678, fn_14f7f8, fn_3aa0, fn_5db48, fn_6aa0, fn_78f88, fn_80ca8, fn_81d00, fn_82008, fn_88db0, log_data, memcpy } from '../shared.ts'

// instruction handler: initialize_pool_v2 (discriminator sha256("global:initialize_pool_v2")[..8] = 0x43cc3f1bf2572dcf)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, token_mint_a, token_mint_b, token_badge_a, token_badge_b, token_vault_a, fee_tier, rent, whirlpool, funder, token_program_a, token_program_b, token_vault_b, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
export function ix_initialize_pool_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s188 = fp - 0x188, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s328 = fp - 0x328, s338 = fp - 0x338, s340 = fp - 0x340, s350 = fp - 0x350, s353 = fp - 0x353, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s1000 = fp - 0x1000
	let l, m: u64
	sol_log("Instruction: InitializePoolV2", 0x1d)
	const f = ix_args_len
	if (f >= 2 && f - 2 >= 0x10) {
		const g = ix_args
		const r = ld16(g)
		const s = ld64(g + 0xa)
		const q = ld64(g + 2)
		st8(s353 + 2, 0xff)
		st16(s353, 0xffff)
		st64(s350, accounts, accounts_len)
		st64(s1000, f, s353)
		m = accounts_initialize_pool_v2(s1a0, program_id, s350, g, fp)
		const h = ld32(s1a0)
		if (h == 2) {
			l = ld64(s1a0 + 8)
			st64(a + 8, ld64(s190))
			st64(a, l)
			return m
		}
		const p = ld32(s1a0 + 4)
		const o = ld64(s1a0 + 8)
		const n = ld64(s190)
		memcpy(s328, s188, 0x188)
		st64(s338, o, n)
		st32(s340, h, p)
		st16(s188 + 8, ld16(s353))
		st8(s188 + 0xa, ld8(s353 + 2))
		copyr(s190, s350, 0x10)
		st64(s1a0, program_id, s340)
		m = fn_3bd20(s368, s1a0, r, q, s)
		l = ld64(s368)
		if (l == 2) {
			m = fn_6aa0(s378, ld64(s328 + 0x108), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
			const k = ld64(s378)
			if (k != 2) {
				m = Error_with_account_name(s388, k, ld64(s378 + 8), 0x100152b28 /* "whirlpool" */, 9)
				l = ld64(s388)
				st64(a + 8, ld64(s388 + 8))
				st64(a, l)
				return m
			}
			st64(a + 8, k)
			st64(a, 2)
			return m
		}
		st64(a + 8, ld64(s368 + 8))
		st64(a, l)
		return m
	}
	const i = fn_1459d0(0x100159468)
	if (2 > (i & 3) - 2) {
		m = anchor_error_from(s398, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s398)
		st64(a + 8, ld64(s398 + 8))
		st64(a, l)
		return m
	}
	if ((i & 3) == 0) {
		m = anchor_error_from(s398, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s398)
		st64(a + 8, ld64(s398 + 8))
		st64(a, l)
		return m
	}
	const j = ld64(ld64(i + 7))
	callx(j, ld64(i - 1), j)
	m = anchor_error_from(s398, 0x66 /* anchor::InstructionDidNotDeserialize */)
	l = ld64(s398)
	st64(a + 8, ld64(s398 + 8))
	st64(a, l)
	return m
}

// Anchor Accounts::try_accounts of instruction initialize_pool_v2 (called by ix_initialize_pool_v2; name [str]: from the handler's "Instruction: …" log; was fn_db9d0)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, token_mint_a, token_mint_b, token_badge_a (AccountNotEnoughKeys, ConstraintSeeds), token_badge_b (ConstraintSeeds), token_vault_a (ConstraintMut), fee_tier (ConstraintHasOne, ConstraintRaw), rent, whirlpool (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), funder (ConstraintMut), token_program_a (ConstraintAddress), token_program_b (ConstraintAddress), token_vault_b (ConstraintMut), system_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: token_badge_a, whirlpool
export function accounts_initialize_pool_v2(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s80 = fp - 0x80, sd8 = fp - 0xd8, se0 = fp - 0xe0, se8 = fp - 0xe8, sf8 = fp - 0xf8, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s140 = fp - 0x140, s160 = fp - 0x160, s180 = fp - 0x180, s1b0 = fp - 0x1b0, s1b1 = fp - 0x1b1, s1d8 = fp - 0x1d8, s1f0 = fp - 0x1f0, s208 = fp - 0x208, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s238 = fp - 0x238, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2b8 = fp - 0x2b8, s320 = fp - 0x320, s330 = fp - 0x330, s338 = fp - 0x338, s33a = fp - 0x33a, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s598 = fp - 0x598, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s5c8 = fp - 0x5c8, s5d8 = fp - 0x5d8, s5e8 = fp - 0x5e8, s5f8 = fp - 0x5f8, s608 = fp - 0x608, s618 = fp - 0x618, s628 = fp - 0x628, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s690 = fp - 0x690, s6c0 = fp - 0x6c0, s6c8 = fp - 0x6c8, s6d0 = fp - 0x6d0, s6d8 = fp - 0x6d8, s6e0 = fp - 0x6e0, s6e8 = fp - 0x6e8, s6f0 = fp - 0x6f0
	let m, n, r, s, w, x, y, ab: u64
	let token_badge_a: AccountInfo
	let l = a
	st64(s348, b)
	if (2 > ld64(e - 0x1000)) {
		const i = fn_1459d0(0x100159468)
		if (2 > (i & 3) - 2) {
			n = anchor_error_from(s658, 0x66 /* anchor::InstructionDidNotDeserialize */)
			m = ld64(s658)
			st64(l + 0x10, ld64(s658 + 8))
			st64(l + 8, m)
			st32(l, 2)
			return n
		}
		if ((i & 3) == 0) {
			n = anchor_error_from(s658, 0x66 /* anchor::InstructionDidNotDeserialize */)
			m = ld64(s658)
			st64(l + 0x10, ld64(s658 + 8))
			st64(l + 8, m)
			st32(l, 2)
			return n
		}
		const j = ld64(ld64(i + 7))
		callx(j, ld64(i - 1), j)
		n = anchor_error_from(s658, 0x66 /* anchor::InstructionDidNotDeserialize */)
		m = ld64(s658)
		st64(l + 0x10, ld64(s658 + 8))
		st64(l + 8, m)
		st32(l, 2)
		return n
	}
	const g = ld64(e - 0xff8)
	st16(s33a, ld16(d))
	try_accounts_11de0(s100, c, c, d, e)
	if (ld64(s100) == 0) {
		n = Error_with_account_name(s648, ld64(sf8), ld64(sf8 + 8), "whirlpools_config", 0x11)
		m = ld64(s648)
		st64(l + 0x10, ld64(s648 + 8))
		st64(l + 8, m)
		st32(l, 2)
		return n
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	st64(s690 + 0x30, g)
	const h = f != 0 ? sat_sub(f, 0x70) & -8 : 0x300007f90
	if (h > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		memcpy(h, s100, 0x70)
		try_accounts_610(s100, c)
		const k = ld32(s100)
		if (k == 2) {
			n = Error_with_account_name(s638, ld64(sf8), ld64(sf8 + 8), "token_mint_a", 0xc)
			m = ld64(s638)
			st64(l + 0x10, ld64(s638 + 8))
			st64(l + 8, m)
			st32(l, 2)
			return n
		}
		st64(s690 + 0x18, h)
		st64(s690 + 0x28, l)
		st64(s690 + 0x20, ld32(s100 + 4))
		const p = ld64(sf8)
		const o = ld64(sf8 + 8)
		memcpy(s320, se8, 0x68)
		st64(s330, p, o)
		st32(s338 + 4, ld64(s690 + 0x20))
		st32(s338, k)
		try_accounts_610(s100, c)
		const q = ld32(s100)
		if (q == 2) {
			n = Error_with_account_name(s628, ld64(sf8), ld64(sf8 + 8), "token_mint_b", 0xc)
			s = ld64(s628)
			r = ld64(s690 + 0x28)
			st64(r + 0x10, ld64(s628 + 8))
			st64(r + 8, s)
			st32(r, 2)
			return n
		}
		B19: {
			st64(s690 + 0x20, ld32(s100 + 4))
			const u = ld64(sf8)
			const t = ld64(sf8 + 8)
			memcpy(s2a0, se8, 0x68)
			st64(s2b0, u, t)
			st32(s2b8 + 4, ld64(s690 + 0x20))
			st32(s2b8, q)
			const v = ld64(c + 8)
			if (v != 0) {
				token_badge_a = ld64(c)
				st64(c, token_badge_a + 0x30, v - 1)
				l = ld64(s690 + 0x28)
				if (v != 1) {
					st64(c + 8, v - 2)
					ab = ld64(c)
					st64(c, ab + 0x30)
					break B19
				}
			} else {
				anchor_error_from(s358, 0xbbd /* anchor::AccountNotEnoughKeys */, w, x, y)
				token_badge_a = ld64(s358 + 8)
				const z = ld64(s358)
				l = ld64(s690 + 0x28)
				if (z != 2) {
					n = Error_with_account_name(s368, z, token_badge_a, "token_badge_a", 0xd)
					m = ld64(s368)
					st64(l + 0x10, ld64(s368 + 8))
					st64(l + 8, m)
					st32(l, 2)
					return n
				}
			}
			anchor_error_from(s378, 0xbbd /* anchor::AccountNotEnoughKeys */, w, x, y)
			ab = ld64(s378 + 8)
			const aa = ld64(s378)
			if (aa != 2) {
				n = Error_with_account_name(s388, aa, ab, "token_badge_b", 0xd)
				m = ld64(s388)
				st64(l + 0x10, ld64(s388 + 8))
				st64(l + 8, m)
				st32(l, 2)
				return n
			}
		}
		try_accounts_11718(s100, c, w, x, y)
		const ae = ld64(sf8)
		const ad = ld64(s100)
		if (ad == 2) {
			st64(s238, ae)
			const af = ld64(c + 8)
			if (af == 0) {
				n = anchor_error_from(s618, 0xbbd /* anchor::AccountNotEnoughKeys */, ae)
				m = ld64(s618)
				st64(l + 0x10, ld64(s618 + 8))
				st64(l + 8, m)
				st32(l, 2)
				return n
			}
			const ag: AccountInfo = ld64(c)
			st64(s230, ag)
			st64(c + 8, af - 1)
			st64(c, ag + 0x30)
			try_accounts_11718(s100, c, ae)
			const ai = ld64(sf8)
			const ah = ld64(s100)
			if (ah != 2) {
				n = Error_with_account_name(s3a8, ah, ai, "token_vault_a", 0xd)
				m = ld64(s3a8)
				st64(l + 0x10, ld64(s3a8 + 8))
				st64(l + 8, m)
				st32(l, 2)
				return n
			}
			st64(s690 + 0x20, ai)
			try_accounts_11718(s100, c, ai)
			const ak = ld64(sf8)
			const aj = ld64(s100)
			if (aj == 2) {
				st64(s690 + 0x10, ak)
				try_accounts_12008(s100, c, ak)
				const an = ld64(sf8 + 8)
				const am = ld64(sf8)
				const al = ld64(s100)
				if (al == 0) {
					n = Error_with_account_name(s608, am, an, "fee_tier", 8)
					m = ld64(s608)
					st64(l + 0x10, ld64(s608 + 8))
					st64(l + 8, m)
					st32(l, 2)
					return n
				}
				st64(s6c0 + 0x20, al)
				st64(s690, am, an)
				copyr(s220, se8, 0x10)
				st32(s230 + 8, ld32(sd8 + 2))
				st16(s230 + 0xc, ld16(sd8 + 6))
				st64(s6c0 + 0x28, ld16(sd8))
				try_accounts_120(s100, c, an)
				const ap = ld64(sf8)
				const ao = ld64(s100)
				if (ao == 2) {
					st64(s6c0 + 0x18, ap)
					try_accounts_120(s100, c, ap)
					const ar = ld64(sf8)
					const aq = ld64(s100)
					if (aq == 2) {
						st64(s6c0 + 0x10, ar)
						fn_122e8(s100, c, ar)
						const au = ld64(sf8)
						const at = ld64(s100)
						if (at == 2) {
							st64(s210, au)
							try_accounts_11990(s100, c, au)
							const ax = ld64(sf8 + 8)
							const aw = ld64(sf8)
							const av = ld64(s100)
							if (av == 0) {
								n = Error_with_account_name(s5f8, aw, ax, 0x100152d60 /* "rent" */, 4)
								m = ld64(s5f8)
								st64(l + 0x10, ld64(s5f8 + 8))
								st64(l + 8, m)
								st32(l, 2)
								return n
							}
							st64(s6c0, aw, ax)
							st64(s6c8, ld64(se8))
							rent_get(s100)
							copy(s1f0, sf8, 0x18)
							if (ld64(s100) == 0) {
								st64(s6d0, ab)
								copyr(s208, s1f0, 0x18)
								const ay = ld64(ld64(ld64(s690 + 0x18)))
								copyr(s160, ay, 0x20)
								const az = ld64(ld64(s320 + 0x40))
								copy(s140, az, 0x20)
								const ba = ld64(ld64(s2a0 + 0x40))
								copy(s120, ba, 0x20)
								st16(s180, ld16(s33a))
								st64(s100, 0x100152b28, 9, s160, 0x20, s140, 0x20, s120, 0x20, s180, 2)
								// PDA find_program_address(["whirlpool", *ay, *az, *ba, u16 ld16(s33a) [ix data?]], program *(ld64(s348)))
								Pubkey_find_program_address(s1b0, s100, 5, ld64(s348))
								copyr(s1d8, s1b0, 0x20)
								const bb = ld8(s1b0 + 0x20)
								st8(s1b1, bb)
								st8(ld64(s690 + 0x30) + 2, bb)
								const bc = ld64(ld64(s230))
								copy(s100, bc, 0x20)
								if ((memcmp(s100, s1d8, 0x20) as u32) == 0) {
									st64(sd8, s338, s2b8, s33a, s1b1, s348)
									st64(se0, ld64(s690 + 0x18))
									st64(s100, s230, s208, s238, s210)
									n = fn_de388(s1b0, s100)
									st64(s6d8, ld64(s1b0 + 8))
									const bk = ld64(s1b0)
									if (bk == 2) {
										const whirlpool: AccountInfo = ld64(ld64(s6d8))
										if (whirlpool.is_writable == 0) {
											anchor_error_from(s5d8, 0x7d0 /* anchor::ConstraintMut */)
											n = Error_with_account_name(s5e8, ld64(s5d8), ld64(s5d8 + 8), 0x100152b28 /* "whirlpool" */, 9)
											s = ld64(s5e8)
											r = ld64(s690 + 0x28)
											st64(r + 0x10, ld64(s5e8 + 8))
											st64(r + 8, s)
											st32(r, 2)
											return n
										}
										AccountInfo_clone(s1b0, whirlpool)
										st64(s6e0, fn_143100(s1b0))
										AccountInfo_clone(s100, ld64(ld64(s6d8)))
										AccountInfo_try_data_len(s120, s100)
										const bn = ld64(s120 + 8)
										const bm = ld64(s120)
										if (bm != 0x800000000000001a /* Ok */) {
											st64(s110, ld64(s110))
											st64(s120, bm, bn)
											n = fn_13b430(s438, s120)
											const cb = ld64(s438)
											const ca = ld64(s690 + 0x28)
											st64(ca + 0x10, ld64(s438 + 8))
											st64(ca + 8, cb)
											st32(ca, 2)
											const cd = ld64(sf8 + 8)
											const cc = ld64(sf8)
											rc_dec(cc)
											rc_dec(cd)
											const cf = ld64(s1b0 + 0x10)
											const ce = ld64(s1b0 + 8)
											rc_dec(ce)
											if (!rc_release(cf)) {
												return n
											}
											st64(cf + 8, ld64(cf + 8) - 1)
											return n
										}
										const bo = __floatundidf(ld64(s208) * (bn + 0x80))
										const bp = fn_14f7f8(ld64(s208 + 8), bo)
										st64(s6e8, 0)
										st64(s6f0, fn_151cb0(bp, 0))
										const bq = fn_14f3e8(bp)
										if ((ld64(s6f0) as i64) >= 0) {
											st64(s6e8, bq)
										}
										const br = fn_151a40(bp, 0x43efffffffffffff)
										let by = -1
										if (0 >= (br as i64)) {
											by = ld64(s6e8)
										}
										const bt = ld64(sf8 + 8)
										const bs = ld64(sf8)
										rc_dec(bs)
										rc_dec(bt)
										const bw = ld64(s1b0 + 0x10)
										const bu = ld64(s1b0 + 8)
										let bv = ld64(bu) - 1
										st64(bu, bv)
										if (bv == 0) {
											bv = ld64(bu + 8) - 1
											st64(bu + 8, bv)
										}
										let bx = ld64(bw) - 1
										st64(bw, bx)
										if (bx == 0) {
											bx = ld64(bw + 8) - 1
											st64(bw + 8, bx)
										}
										if (by > ld64(s6e0)) {
											anchor_error_from(s5b8, 0x7d5 /* anchor::ConstraintRentExempt */, bx, bv)
											n = Error_with_account_name(s5c8, ld64(s5b8), ld64(s5b8 + 8), 0x100152b28 /* "whirlpool" */, 9)
											s = ld64(s5c8)
											r = ld64(s690 + 0x28)
											st64(r + 0x10, ld64(s5c8 + 8))
											st64(r + 8, s)
											st32(r, 2)
											return n
										}
										const cg = ld64(ld64(ld64(s690 + 0x18)))
										copyr(s140, cg, 0x20)
										const ch = ld64(ld64(s320 + 0x40))
										const cl = ld64(ch + 0x18)
										const ck = ld64(ch + 0x10)
										const cj = ld64(ch + 8)
										const ci = ld64(ch)
										st64(s120, ci, cj, ck, cl, 0x100154db3, 0xb, s140, 0x20, s120, 0x20)
										// PDA find_program_address(["token_badge", *cg, *s120], program *(ld64(s348)))
										Pubkey_find_program_address(s1b0, s100, 3, ld64(s348))
										copyr(s180, s1b0, 0x20)
										st8(ld64(s690 + 0x30), ld8(s1b0 + 0x20))
										const cm = token_badge_a.key
										copyr(s100, cm, 0x20)
										if ((memcmp(s100, s180, 0x20) as u32) != 0) {
											anchor_error_from(s448, 0x7d6 /* anchor::ConstraintSeeds */)
											const cz = Error_with_account_name(s458, ld64(s448), ld64(s448 + 8), "token_badge_a", 0xd)
											const cy = ld64(s458 + 8)
											const cx = ld64(s458)
											copyr(s100, cm, 0x20)
											copy(se0, s180, 0x20)
											n = fn_13b5c0(s468, cx, cy, s100, cz)
											s = ld64(s468)
											r = ld64(s690 + 0x28)
											st64(r + 0x10, ld64(s468 + 8))
											st64(r + 8, s)
											st32(r, 2)
											return n
										}
										const cn = ld64(ld64(ld64(s690 + 0x18)))
										copyr(s140, cn, 0x20)
										const co = ld64(ld64(s2a0 + 0x40))
										const cs = ld64(co + 0x18)
										const cr = ld64(co + 0x10)
										const cq = ld64(co + 8)
										const cp = ld64(co)
										st64(s120, cp, cq, cr, cs, 0x100154db3, 0xb, s140, 0x20, s120, 0x20)
										// PDA find_program_address(["token_badge", *cn, *s120], program *(ld64(s348)))
										Pubkey_find_program_address(s1b0, s100, 3, ld64(s348))
										copyr(s160, s1b0, 0x20)
										st8(ld64(s690 + 0x30) + 1, ld8(s1b0 + 0x20))
										const ct = ld64(ld64(s6d0))
										copyr(s100, ct, 0x20)
										if ((memcmp(s100, s160, 0x20) as u32) == 0) {
											if (ld8(ld64(s238) + 0x29) == 0) {
												anchor_error_from(s598, 0x7d0 /* anchor::ConstraintMut */)
												n = Error_with_account_name(s5a8, ld64(s598), ld64(s598 + 8), "funder", 6)
												s = ld64(s5a8)
												r = ld64(s690 + 0x28)
												st64(r + 0x10, ld64(s5a8 + 8))
												st64(r + 8, s)
												st32(r, 2)
												return n
											}
											if (ld8(ld64(s690 + 0x20) + 0x29) == 0) {
												anchor_error_from(s578, 0x7d0 /* anchor::ConstraintMut */)
												n = Error_with_account_name(s588, ld64(s578), ld64(s578 + 8), "token_vault_a", 0xd)
												s = ld64(s588)
												r = ld64(s690 + 0x28)
												st64(r + 0x10, ld64(s588 + 8))
												st64(r + 8, s)
												st32(r, 2)
												return n
											}
											if (ld8(ld64(s690 + 0x10) + 0x29) != 0) {
												copyr(s120, s690, 0x10)
												copy(s110, s220, 0x10)
												const da = ld64(ld64(ld64(s690 + 0x18)))
												copyr(s1b0, da, 0x20)
												if ((memcmp(s120, s1b0, 0x20) as u32) != 0) {
													anchor_error_from(s4a8, 0x7d1 /* anchor::ConstraintHasOne */)
													const dp = Error_with_account_name(s4b8, ld64(s4a8), ld64(s4a8 + 8), "fee_tier", 8)
													const dn = ld64(s4b8 + 8)
													const dm = ld64(s4b8)
													copyr(s100, s120, 0x20)
													copy(se0, s1b0, 0x20)
													n = fn_13b5c0(s4c8, dm, dn, s100, dp)
													s = ld64(s4c8)
													r = ld64(s690 + 0x28)
													st64(r + 0x10, ld64(s4c8 + 8))
													st64(r + 8, s)
													st32(r, 2)
													return n
												}
												if (ld64(s6c0 + 0x28) == ld16(s33a)) {
													const db = ld64(ld64(s6c0 + 0x18))
													copyr(s120, db, 0x20)
													AccountInfo_clone(s100, ld64(s320 + 0x40))
													const dc = ld64(se8)
													copy(s1b0, dc, 0x20)
													const de = ld64(sf8 + 8)
													const dd = ld64(sf8)
													rc_dec(dd)
													rc_dec(de)
													if ((memcmp(s120, s1b0, 0x20) as u32) != 0) {
														anchor_error_from(s4f8, 0x7dc /* anchor::ConstraintAddress */)
														const ds = Error_with_account_name(s508, ld64(s4f8), ld64(s4f8 + 8), "token_program_a", 0xf)
														const dr = ld64(s508 + 8)
														const dq = ld64(s508)
														copyr(s100, s120, 0x20)
														copy(se0, s1b0, 0x20)
														n = fn_13b5c0(s518, dq, dr, s100, ds)
														s = ld64(s518)
														r = ld64(s690 + 0x28)
														st64(r + 0x10, ld64(s518 + 8))
														st64(r + 8, s)
														st32(r, 2)
														return n
													}
													const df = ld64(ld64(s6c0 + 0x10))
													copyr(s120, df, 0x20)
													AccountInfo_clone(s100, ld64(s2a0 + 0x40))
													const dg = ld64(se8)
													copy(s1b0, dg, 0x20)
													const di = ld64(sf8 + 8)
													const dh = ld64(sf8)
													rc_dec(dh)
													rc_dec(di)
													if ((memcmp(s120, s1b0, 0x20) as u32) == 0) {
														st64(s6e0, s100)
														memcpy(s100, s338, 0x80)
														memcpy(s80, s2b8, 0x80)
														st64(s690 + 0x30, ld64(s238))
														const du = ld64(s210)
														const dt = ld64(s690 + 0x28)
														st64(dt + 0x158, ld64(s220 + 8))
														st64(dt + 0x150, ld64(s220))
														st32(dt + 0x162, ld32(s230 + 8))
														st16(dt + 0x166, ld16(s230 + 0xc))
														n = memcpy(dt, ld64(s6e0), 0x100)
														st64(dt + 0x198, ld64(s6c8))
														st64(dt + 0x190, ld64(s6c0 + 8))
														st64(dt + 0x188, ld64(s6c0))
														st64(dt + 0x180, av)
														st64(dt + 0x178, du)
														st64(dt + 0x170, ld64(s6c0 + 0x10))
														st64(dt + 0x168, ld64(s6c0 + 0x18))
														st16(dt + 0x160, ld64(s6c0 + 0x28))
														st64(dt + 0x148, ld64(s690 + 8))
														st64(dt + 0x140, ld64(s690))
														st64(dt + 0x138, ld64(s6c0 + 0x20))
														st64(dt + 0x130, ld64(s690 + 0x10))
														st64(dt + 0x128, ld64(s690 + 0x20))
														st64(dt + 0x120, ld64(s6d8))
														st64(dt + 0x118, ld64(s690 + 0x30))
														st64(dt + 0x110, ld64(s6d0))
														st64(dt + 0x108, token_badge_a)
														st64(dt + 0x100, ld64(s690 + 0x18))
														return n
													}
													anchor_error_from(s528, 0x7dc /* anchor::ConstraintAddress */)
													const dl = Error_with_account_name(s538, ld64(s528), ld64(s528 + 8), "token_program_b", 0xf)
													const dk = ld64(s538 + 8)
													const dj = ld64(s538)
													copyr(s100, s120, 0x20)
													copy(se0, s1b0, 0x20)
													n = fn_13b5c0(s548, dj, dk, s100, dl)
													s = ld64(s548)
													r = ld64(s690 + 0x28)
													st64(r + 0x10, ld64(s548 + 8))
													st64(r + 8, s)
													st32(r, 2)
													return n
												}
												anchor_error_from(s4d8, 0x7d3 /* anchor::ConstraintRaw */)
												n = Error_with_account_name(s4e8, ld64(s4d8), ld64(s4d8 + 8), "fee_tier", 8)
												s = ld64(s4e8)
												r = ld64(s690 + 0x28)
												st64(r + 0x10, ld64(s4e8 + 8))
												st64(r + 8, s)
												st32(r, 2)
												return n
											}
											anchor_error_from(s558, 0x7d0 /* anchor::ConstraintMut */)
											n = Error_with_account_name(s568, ld64(s558), ld64(s558 + 8), "token_vault_b", 0xd)
											s = ld64(s568)
											r = ld64(s690 + 0x28)
											st64(r + 0x10, ld64(s568 + 8))
											st64(r + 8, s)
											st32(r, 2)
											return n
										}
										anchor_error_from(s478, 0x7d6 /* anchor::ConstraintSeeds */)
										const cw = Error_with_account_name(s488, ld64(s478), ld64(s478 + 8), "token_badge_b", 0xd)
										const cv = ld64(s488 + 8)
										const cu = ld64(s488)
										copyr(s100, ct, 0x20)
										copy(se0, s160, 0x20)
										n = fn_13b5c0(s498, cu, cv, s100, cw)
										s = ld64(s498)
										r = ld64(s690 + 0x28)
										st64(r + 0x10, ld64(s498 + 8))
										st64(r + 8, s)
										st32(r, 2)
										return n
									}
									const bz = ld64(s690 + 0x28)
									st64(bz + 0x10, ld64(s6d8))
									st64(bz + 8, bk)
									st32(bz, 2)
									return n
								}
								anchor_error_from(s408, 0x7d6 /* anchor::ConstraintSeeds */)
								Error_with_account_name(s418, ld64(s408), ld64(s408 + 8), 0x100152b28 /* "whirlpool" */, 9)
								const bj = ld64(s418 + 8)
								const bi = ld64(s418)
								const bd = ld64(ld64(s230))
								const bh = ld64(bd + 0x18)
								const bg = ld64(bd + 0x10)
								const bf = ld64(bd + 8)
								const be = ld64(bd)
								copy(se0, s1d8, 0x20)
								st64(s100, be, bf, bg, bh)
								n = fn_13b5c0(s428, bi, bj, s100, bf)
								s = ld64(s428)
								r = ld64(s690 + 0x28)
								st64(r + 0x10, ld64(s428 + 8))
								st64(r + 8, s)
								st32(r, 2)
								return n
							}
							n = fn_13b430(s3f8, s1f0)
							m = ld64(s3f8)
							st64(l + 0x10, ld64(s3f8 + 8))
							st64(l + 8, m)
							st32(l, 2)
							return n
						}
						n = Error_with_account_name(s3e8, at, au, "system_program", 0xe)
						m = ld64(s3e8)
						st64(l + 0x10, ld64(s3e8 + 8))
						st64(l + 8, m)
						st32(l, 2)
						return n
					}
					n = Error_with_account_name(s3d8, aq, ar, "token_program_b", 0xf)
					m = ld64(s3d8)
					st64(l + 0x10, ld64(s3d8 + 8))
					st64(l + 8, m)
					st32(l, 2)
					return n
				}
				n = Error_with_account_name(s3c8, ao, ap, "token_program_a", 0xf)
				m = ld64(s3c8)
				st64(l + 0x10, ld64(s3c8 + 8))
				st64(l + 8, m)
				st32(l, 2)
				return n
			}
			n = Error_with_account_name(s3b8, aj, ak, "token_vault_b", 0xd)
			m = ld64(s3b8)
			st64(l + 0x10, ld64(s3b8 + 8))
			st64(l + 8, m)
			st32(l, 2)
			return n
		}
		n = Error_with_account_name(s398, ad, ae, "funder", 6)
		m = ld64(s398)
		st64(l + 0x10, ld64(s398 + 8))
		st64(l + 8, m)
		st32(l, 2)
		return n
	}
	alloc_handle_alloc_error(8, 0x70)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
export function fn_de388(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s290 = fp - 0x290, s291 = fp - 0x291, s294 = fp - 0x294, s2b8 = fp - 0x2b8, s2d8 = fp - 0x2d8, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, s338 = fp - 0x338, s350 = fp - 0x350, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s398 = fp - 0x398, s3e0 = fp - 0x3e0, s400 = fp - 0x400, s420 = fp - 0x420, s458 = fp - 0x458, s468 = fp - 0x468, s488 = fp - 0x488, s497 = fp - 0x497, s4a0 = fp - 0x4a0, s4b8 = fp - 0x4b8, s4d0 = fp - 0x4d0, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s5a0 = fp - 0x5a0, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s5d8 = fp - 0x5d8, s5e0 = fp - 0x5e0, s5e8 = fp - 0x5e8, s5f0 = fp - 0x5f0
	let az, dh, di, dj: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s558, b, f)
	if (g != 0) {
		const p = ld64(ld64(b + 0x10))
		st64(s5a0 + 0x28, p)
		const q = ld64(p)
		copyr(s350, q + 8, 0x18)
		st64(s5a0 + 0x30, q)
		st64(s358, ld64(q))
		const r = ld64(f)
		copyr(s4d0, r + 8, 0x18)
		st64(s5a0 + 0x38, r)
		st64(s4d8, ld64(r))
		if ((memcmp(s358, s4d8, 0x20) as u32) == 0) {
			ErrorCode_name(s2d8, 0x100152d40)
			st64(s2b8, 0, 1, 0)
			st64(s338, s2b8, 0x100159480)
			st8(s338 + 0x18, 3)
			st64(s338 + 0x10, 0x20)
			st64(s350 + 8, 0)
			st64(s358, 0)
			if (ErrorCode_fmt(0x100152d40, s358) == 0) {
				copyr(s4a0, s2b8, 0x18)
				copy(s4b8, s2d8, 0x18)
				st64(s4d0, 0x100154d7a)
				st32(s458 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s488, 2)
				st32(s4d0 + 0x10, 0xd)
				st64(s4d0 + 8, 0x39)
				st64(s4d8, 0)
				const be = fn_13b3a8(s518, s4d8)
				const bd = ld64(s518 + 8)
				const bc = ld64(s518)
				const ba = ld64(s5a0 + 0x30)
				copyr(s4d8, ba, 0x20)
				const bb = ld64(s5a0 + 0x38)
				copy(s4b8, bb, 0x20)
				dj = fn_13b5c0(s528, bc, bd, s4d8, be)
				const bf = ld64(s528)
				st64(a + 8, ld64(s528 + 8))
				st64(a, bf)
				return dj
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s4d8, 0x1001594b0, 0x1001594d0)
		}
		st64(s5a0 + 0x40, a)
		const s = ld64(b + 8)
		const t = __floatundidf(ld64(s) * 0x30d)
		const u = fn_14f7f8(ld64(s + 8), t)
		const v = fn_151cb0(u, 0)
		const w = fn_14f3e8(u)
		const x = max((fn_151a40(u, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (v as i64) ? 0 : w, 1)
		let bh: AccountInfo = ld64(s558 + 8)
		let cc = ld64(s558)
		if (x > g) {
			const y: AccountInfo = ld64(s5a0 + 0x28)
			const z: LamportsCell = y.lamports
			rc_inc(z)
			const bg: DataCell = y.data
			rc_inc(bg)
			const bi: LamportsCell = bh.lamports
			const bj = bi.strong
			st64(s5a0 + 0x10, bh.key)
			st64(s5a0 + 0x18, y.executable)
			st64(s5a0 + 0x20, y.is_writable)
			st64(s5a0 + 0x38, y.is_signer)
			const bl = y.rent_epoch
			const bm = y.owner
			rc_inc(bi, bj)
			const bk: DataCell = bh.data
			rc_inc(bk)
			st64(s5b8, bl, bm, bi, bg, z)
			const bn: AccountInfo = ld64(ld64(ld64(s558) + 0x18))
			const bo: LamportsCell = bn.lamports
			const bp = bo.strong
			st64(s5a0 + 0x28, sat_sub(x, g))
			const bq: AccountInfo = ld64(s558 + 8)
			st64(s5d8 + 0x10, bq.executable)
			st64(s5d8 + 0x18, bq.is_writable)
			const bu = bq.is_signer
			const bv = bq.rent_epoch
			const bw = bq.owner
			const bt = bn.key
			rc_inc(bo, bp)
			const br: DataCell = bn.data
			const bs = br.strong
			st64(s5d8 + 8, bt)
			rc_inc(br, bs)
			st64(s5d8, bn.owner)
			st64(s5e0, bn.rent_epoch)
			const bz = bn.is_signer
			const by = bn.is_writable
			const bx = bn.executable
			st8(s398 + 0x1a, ld64(s5d8 + 0x10))
			st8(s398 + 0x19, ld64(s5d8 + 0x18))
			st8(s398 + 0x18, bu)
			st64(s398, bk, bw, bv)
			st64(s3e0 + 0x40, ld64(s5a8))
			st64(s3e0 + 0x38, ld64(s5a0 + 0x10))
			st8(s3e0 + 0x32, ld64(s5a0 + 0x18))
			st8(s3e0 + 0x31, ld64(s5a0 + 0x20))
			st8(s3e0 + 0x30, ld64(s5a0 + 0x38))
			st64(s3e0 + 0x28, ld64(s5b8))
			st64(s3e0 + 0x20, ld64(s5b8 + 8))
			st64(s3e0 + 0x18, ld64(s5a0))
			st64(s3e0 + 0x10, ld64(s5a0 + 8))
			st64(s3e0 + 8, ld64(s5a0 + 0x30))
			st8(s3e0, bz, by, bx)
			st64(s400 + 0x18, ld64(s5e0))
			st64(s400 + 0x10, ld64(s5d8))
			st64(s400, bo, br)
			st64(s420 + 0x18, ld64(s5d8 + 8))
			st64(s378, 8, 0)
			st64(s420, 0, 8, 0)
			dj = fn_13d318(s4e8, s420, ld64(s5a0 + 0x28))
			az = ld64(s4e8)
			if (az != 2) {
				di = ld64(s4e8 + 8)
				dh = ld64(s5a0 + 0x40)
				st64(dh, az, di)
				return dj
			}
			bh = ld64(s558 + 8)
			st64(s5a0 + 0x38, bh.key)
			cc = ld64(s558)
		}
		const ca: LamportsCell = bh.lamports
		rc_inc(ca)
		const cb: DataCell = bh.data
		rc_inc(cb)
		const cd: AccountInfo = ld64(ld64(cc + 0x18))
		const ce: LamportsCell = cd.lamports
		const cf = ce.strong
		st64(s5a0 + 0x20, bh.executable)
		st64(s5a0 + 0x28, bh.is_writable)
		st64(s5a0 + 0x30, bh.is_signer)
		const ci = bh.rent_epoch
		const cj = bh.owner
		st64(s5a0 + 0x18, cd.key)
		rc_inc(ce, cf)
		const cg: DataCell = cd.data
		const ch = cg.strong
		st64(s5a0, ci, cj, ca)
		rc_inc(cg, ch)
		st64(s5a8, cd.owner)
		st64(s5b8 + 8, cd.rent_epoch)
		st64(s5b8, cd.is_signer)
		st64(s5d8 + 0x18, cd.is_writable)
		const co = cd.executable
		const ck = ld64(ld64(ld64(cc + 0x20)))
		copyr(s2f0, ck + 8, 0x18)
		st64(s5d8 + 0x10, ck)
		st64(s2f8, ld64(ck))
		const cl = ld64(ld64(ld64(cc + 0x28) + 0x58))
		copyr(s2d8, cl, 0x20)
		const cm = ld64(ld64(ld64(cc + 0x30) + 0x58))
		copyr(s2b8, cm, 0x20)
		const cn = ld16(ld64(cc + 0x38))
		st64(s5d8 + 8, cn)
		st16(s294, cn)
		const cp = ld8(ld64(cc + 0x40))
		st64(s338 + 0x30, s291)
		st64(s338 + 0x20, s294)
		st64(s338 + 0x10, s2b8)
		st64(s338, s2d8)
		st64(s350 + 8, s2f8)
		st64(s358, 0x100152b28)
		st64(s368, s358)
		st64(s468 + 8, s368)
		st8(s468 + 2, co)
		st8(s468 + 1, ld64(s5d8 + 0x18))
		st8(s468, ld64(s5b8))
		st64(s488 + 0x18, ld64(s5b8 + 8))
		st64(s488 + 0x10, ld64(s5a8))
		st64(s488, ce, cg)
		st64(s497 + 7, ld64(s5a0 + 0x18))
		st8(s497 + 1, ld64(s5a0 + 0x20))
		st8(s497, ld64(s5a0 + 0x28))
		st8(s4a0 + 8, ld64(s5a0 + 0x30))
		st64(s4a0, ld64(s5a0))
		st64(s4b8 + 0x10, ld64(s5a0 + 8))
		st64(s4b8 + 8, cb)
		st64(s4b8, ld64(s5a0 + 0x10))
		st64(s4d0 + 0x10, ld64(s5a0 + 0x38))
		st64(s5a0 + 0x38, cp)
		st8(s291, cp)
		st64(s338 + 0x38, 1)
		st64(s338 + 0x28, 2)
		st64(s338 + 0x18, 0x20)
		st64(s338 + 8, 0x20)
		st64(s350 + 0x10, 0x20)
		st64(s350, 9)
		st64(s368 + 8, 6)
		st64(s458, 1)
		st64(s4d8, 0, 8, 0)
		dj = fn_13c8b8(s4f8, s4d8, 0x28d)
		az = ld64(s4f8)
		if (az != 2) {
			di = ld64(s4f8 + 8)
			dh = ld64(s5a0 + 0x40)
			st64(dh, az, di)
			return dj
		}
		const cq: AccountInfo = ld64(s558 + 8)
		const cr: LamportsCell = cq.lamports
		const cv = cq.key
		rc_inc(cr)
		const cs: DataCell = cq.data
		rc_inc(cs)
		const ct: LamportsCell = cd.lamports
		const cu = ct.strong
		st64(s5a0 + 0x30, cv)
		st64(s5a0 + 8, cd.key)
		st64(s5a0 + 0x10, cq.executable)
		st64(s5a0 + 0x18, cq.is_writable)
		st64(s5a0 + 0x20, cq.is_signer)
		st64(s5a0 + 0x28, cq.rent_epoch)
		const cy = cq.owner
		rc_inc(ct, cu)
		const cw: DataCell = cd.data
		const cx = cw.strong
		st64(s5a8, cy, cr)
		rc_inc(cw, cx)
		st64(s5b8 + 8, cd.owner)
		st64(s5b8, cd.rent_epoch)
		const dc = cd.is_signer
		const db = cd.is_writable
		const da = cd.executable
		const cz = ld64(s5d8 + 0x10)
		copyr(s2f8, cz, 0x20)
		copyr(s2d8, cl, 0x20)
		copyr(s2b8, cm, 0x20)
		st16(s294, ld64(s5d8 + 8))
		st8(s291, ld64(s5a0 + 0x38))
		st64(s368, s358, 6, 0x100152b28, 9, s2f8, 0x20, s2d8, 0x20, s2b8, 0x20, s294, 2, s291, 1)
		st64(s468 + 8, s368)
		st8(s468, dc, db, da)
		st64(s488 + 0x18, ld64(s5b8))
		st64(s488 + 0x10, ld64(s5b8 + 8))
		st64(s488, ct, cw)
		st64(s497 + 7, ld64(s5a0 + 8))
		st8(s497 + 1, ld64(s5a0 + 0x10))
		st8(s497, ld64(s5a0 + 0x18))
		st8(s4a0 + 8, ld64(s5a0 + 0x20))
		st64(s4a0, ld64(s5a0 + 0x28))
		st64(s4b8 + 0x10, ld64(s5a8))
		st64(s4b8 + 8, cs)
		st64(s4b8, ld64(s5a0))
		st64(s4d0 + 0x10, ld64(s5a0 + 0x30))
		st64(s458, 1)
		st64(s4d8, 0, 8, 0)
		dj = fn_13cc48(s508, s4d8, ld64(ld64(ld64(s558) + 0x48)))
		az = ld64(s508)
		if (az != 2) {
			di = ld64(s508 + 8)
			dh = ld64(s5a0 + 0x40)
			st64(dh, az, di)
			return dj
		}
	} else {
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0x30d)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const ad = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		const m = ld64(s558)
		const n: AccountInfo = ld64(ld64(m + 0x10))
		const o: LamportsCell = n.lamports
		const ac = n.key
		const ae = ld64(s558 + 8)
		rc_inc(o)
		const aa: DataCell = n.data
		st64(s5a0 + 0x38, aa)
		const ab = aa.strong
		st64(s5a0 + 0x30, ac)
		rc_inc(ld64(s5a0 + 0x38), ab)
		const af = ld64(ae + 8)
		const ag = ld64(af)
		st64(s5a0, ld64(ae))
		st64(s5a0 + 8, n.executable)
		st64(s5a0 + 0x10, n.is_writable)
		st64(s5a0 + 0x18, n.is_signer)
		st64(s5a0 + 0x20, n.rent_epoch)
		st64(s5a0 + 0x28, n.owner)
		rc_inc(af, ag)
		const ah = ld64(ae + 0x10)
		const ai = ld64(ah)
		st64(s5a8, o)
		rc_inc(ah, ai)
		const aj: AccountInfo = ld64(ld64(m + 0x18))
		const ak: LamportsCell = aj.lamports
		const al = ak.strong
		st64(s5a0 + 0x40, a)
		const am: AccountInfo = ld64(s558 + 8)
		st64(s5d8 + 0x10, am.executable)
		st64(s5d8 + 0x18, am.is_writable)
		st64(s5b8, am.is_signer)
		st64(s5b8 + 8, am.rent_epoch)
		const aw = am.owner
		const ap = aj.key
		rc_inc(ak, al)
		const an: DataCell = aj.data
		const ao = an.strong
		st64(s5d8, ap, ad)
		rc_inc(an, ao)
		st64(s5e0, aj.owner)
		st64(s5e8, aj.rent_epoch)
		st64(s5f0, aj.is_signer)
		const ay = aj.is_writable
		const ax = aj.executable
		const aq = ld64(s558)
		const ar = ld64(ld64(ld64(aq + 0x20)))
		copyr(s2f8, ar, 0x20)
		const at = ld64(ld64(ld64(aq + 0x28) + 0x58))
		copyr(s2d8, at, 0x20)
		const au = ld64(ld64(ld64(aq + 0x30) + 0x58))
		copyr(s2b8, au, 0x20)
		st16(s294, ld16(ld64(aq + 0x38)))
		const av = ld8(ld64(aq + 0x40))
		st64(s338 + 0x30, s291)
		st64(s338 + 0x20, s294)
		st64(s338 + 0x10, s2b8)
		st64(s338, s2d8)
		st64(s350 + 8, s2f8)
		st64(s358, 0x100152b28)
		st8(s291, av)
		st64(s368, s358)
		st64(s458 + 0x28, s368)
		st8(s458 + 0x22, ld64(s5d8 + 0x10))
		st8(s458 + 0x21, ld64(s5d8 + 0x18))
		st8(s458 + 0x20, ld64(s5b8))
		st64(s458 + 0x18, ld64(s5b8 + 8))
		st64(s458, af, ah, aw)
		st64(s468 + 8, ld64(s5a0))
		st8(s468 + 2, ld64(s5a0 + 8))
		st8(s468 + 1, ld64(s5a0 + 0x10))
		st8(s468, ld64(s5a0 + 0x18))
		st64(s488 + 0x18, ld64(s5a0 + 0x20))
		st64(s488 + 0x10, ld64(s5a0 + 0x28))
		st64(s488 + 8, ld64(s5a0 + 0x38))
		st64(s488, ld64(s5a8))
		st64(s497 + 7, ld64(s5a0 + 0x30))
		st8(s497, ay, ax)
		st8(s4a0 + 8, ld64(s5f0))
		st64(s4a0, ld64(s5e8))
		st64(s4b8 + 0x10, ld64(s5e0))
		st64(s4b8, ak, an)
		st64(s4d0 + 0x10, ld64(s5d8))
		st64(s338 + 0x38, 1)
		st64(s338 + 0x28, 2)
		st64(s338 + 0x18, 0x20)
		st64(s338 + 8, 0x20)
		st64(s350 + 0x10, 0x20)
		st64(s350, 9)
		st64(s368 + 8, 6)
		st64(s458 + 0x30, 1)
		st64(s4d8, 0, 8, 0)
		dj = fn_13cfd8(s538, s4d8, ld64(s5d8 + 8), 0x28d, ld64(ld64(aq + 0x48)))
		az = ld64(s538)
		if (az != 2) {
			di = ld64(s538 + 8)
			dh = ld64(s5a0 + 0x40)
			st64(dh, az, di)
			return dj
		}
	}
	const df = ld64(s5a0 + 0x40)
	fn_3aa0(s290, ld64(s558 + 8))
	if (ld64(s290) == 0) {
		dj = Error_with_account_name(s548, ld64(s290 + 8), ld64(s290 + 0x10), 0x100152b28 /* "whirlpool" */, 9)
		const dg = ld64(s548)
		st64(df + 8, ld64(s548 + 8))
		st64(df, dg)
		return dj
	}
	const dd = ld64(0x300000000 /* heap bump-allocator cursor */)
	const de = dd != 0 ? sat_sub(dd, 0x290) & -8 : 0x300007d70
	if (de > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, de)
		dj = memcpy(de, s290, 0x290)
		st64(df + 8, de)
		st64(df, 2)
		return dj
	}
	alloc_handle_alloc_error(8, 0x290)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: e (value), d (value), c (value)
// types [heur]: b: InitializePoolV2Context (the handler ix_initialize_pool_v2 passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_3bd20(a: u64, b: InitializePoolV2Context, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s16 = fp - 0x16, s28 = fp - 0x28, s48 = fp - 0x48, s68 = fp - 0x68, s88 = fp - 0x88, sa8 = fp - 0xa8, sc0 = fp - 0xc0, sc8 = fp - 0xc8, sd0 = fp - 0xd0, se8 = fp - 0xe8, s100 = fp - 0x100, s108 = fp - 0x108, s128 = fp - 0x128, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1000 = fp - 0x1000
	let m, y: u64
	const accounts: InitializePoolV2Accounts = b.accounts
	const g = ld64(ld64(accounts + 0x58))
	copyr(s148, g, 0x20)
	const h = ld64(ld64(accounts + 0xd8))
	copyr(s128, h, 0x20)
	const bb = ld8(b + 0x22)
	const ba = ld16(accounts + 0x162)
	const i = ld64(ld64(ld64(accounts + 0x100)))
	copyr(s108, i, 0x20)
	copyr(se8, g, 0x20)
	let n = fn_81d00(s10, s108, se8, accounts + 0x108)
	let j = ld64(s10)
	if (j != 2) {
		st64(a + 8, ld64(s10 + 8))
		st64(a, j)
		return n
	}
	n = fn_80ca8(se8, accounts, ld8(s10 + 8))
	j = ld64(se8)
	if (j == 2) {
		if (ld8(se8 + 8) == 0) {
			n = fn_87630(s158, 0x2f)
			m = ld64(s158 + 8)
			j = ld64(s158)
			if (j != 2) {
				st64(a + 8, m)
				st64(a, j)
				return n
			}
		}
		const k = ld64(ld64(ld64(accounts + 0x100)))
		copyr(s108, k, 0x20)
		const l = ld64(ld64(accounts + 0xd8))
		copyr(se8, l, 0x20)
		n = fn_81d00(s10, s108, se8, accounts + 0x110)
		j = ld64(s10)
		if (j != 2) {
			st64(a + 8, ld64(s10 + 8))
			st64(a, j)
			return n
		}
		n = fn_80ca8(se8, accounts + 0x80, ld8(s10 + 8))
		j = ld64(se8)
		if (j == 2) {
			if (ld8(se8 + 8) == 0) {
				n = fn_87630(s168, 0x2f)
				m = ld64(s168 + 8)
				j = ld64(s168)
				if (j != 2) {
					st64(a + 8, m)
					st64(a, j)
					return n
				}
			}
			const o: AccountInfo = ld64(accounts + 0x58)
			const p: LamportsCell = o.lamports
			const r = ld64(accounts + 0x120)
			let az = o.key
			rc_inc(p)
			const q: DataCell = o.data
			let ay = r
			rc_inc(q)
			let ax = o.owner
			const u = o.rent_epoch
			const t = o.is_signer
			const s = o.is_writable
			st8(sc0 + 2, o.executable)
			st8(sc0, t, s)
			st64(sd0, ax, u)
			ax = q
			st64(se8, az, p, q)
			st64(s1000 + 8, ld64(accounts + 0x168))
			az = accounts + 0x178
			st64(s1000 + 0x10, accounts + 0x178)
			st64(s1000, accounts + 0x118)
			n = fn_78f88(s178, ay, accounts + 0x128, se8, accounts + 0x118, ld64(s1000 + 8), accounts + 0x178)
			j = ld64(s178)
			if (j != 2) {
				m = ld64(s178 + 8)
				rc_dec(p)
				y = ax
				if (!rc_release(ax)) {
					st64(a + 8, m)
					st64(a, j)
					return n
				}
				st64(y + 8, ld64(y + 8) - 1)
				st64(a + 8, m)
				st64(a, j)
				return n
			}
			rc_dec(p)
			const v = ax
			if (rc_release(ax)) {
				st64(v + 8, ld64(v + 8) - 1)
			}
			const w: AccountInfo = ld64(accounts + 0xd8)
			const x: LamportsCell = w.lamports
			const aa = ld64(accounts + 0x120)
			const z = w.key
			rc_inc(x)
			ax = z
			ay = aa
			const ab: DataCell = w.data
			rc_inc(ab)
			let aw = w.owner
			const ae = w.rent_epoch
			const ad = w.is_signer
			const ac = w.is_writable
			st8(sc0 + 2, w.executable)
			st8(sc0, ad, ac)
			st64(sd0, aw, ae)
			aw = ab
			st64(se8, ax, x, ab)
			st64(s1000 + 8, ld64(accounts + 0x170))
			st64(s1000 + 0x10, az)
			st64(s1000, accounts + 0x118)
			n = fn_78f88(s188, ay, accounts + 0x130, se8, accounts + 0x118, ld64(s1000 + 8), az)
			j = ld64(s188)
			if (j == 2) {
				rc_dec(x)
				const af = aw
				if (rc_release(aw)) {
					st64(af + 8, ld64(af + 8) - 1)
				}
				const ag = ld64(ld64(ld64(accounts + 0x100)))
				copyr(se8, ag, 0x20)
				n = fn_82008(s108, accounts + 0x108, se8, accounts)
				j = ld64(s108)
				if (j == 2) {
					let ak = ld8(s100)
					const ah = ld64(ld64(ld64(accounts + 0x100)))
					copyr(se8, ah, 0x20)
					n = fn_82008(s108, accounts + 0x110, se8, accounts + 0x80)
					j = ld64(s108)
					if (j == 2) {
						ak = ld8(s100) != 0 ? 1 : ak
						const am = ld64(accounts + 0x100)
						const al = ld64(accounts + 0x120)
						const ai = accounts.token_vault_a.key
						copyr(s108, ai, 0x20)
						const aj = accounts.token_vault_b.key
						copyr(se8, aj, 0x20)
						st64(s1000, bb, c, d, e, ba, s148, s108, s128, se8, ak as u8)
						n = fn_5db48(s198, al + 8, am, c, bb, c, d, e, ba, s148, s108, s128, se8, ak as u8)
						j = ld64(s198)
						if (j == 2) {
							const an = ld64(ld64(ld64(accounts + 0x120)))
							copyr(se8, an, 0x20)
							const ao = ld64(ld64(ld64(accounts + 0x100)))
							copyr(sc8, ao, 0x20)
							const ap = ld64(ld64(accounts + 0x58))
							copyr(sa8, ap, 0x20)
							const aq = ld64(ld64(accounts + 0xd8))
							copyr(s88, aq, 0x20)
							const ar = ld64(ld64(accounts + 0x168))
							copyr(s68, ar, 0x20)
							const at = ld64(ld64(accounts + 0x170))
							copyr(s48, at, 0x20)
							const av = ld8(accounts + 0x30)
							const au = ld8(accounts + 0xb0)
							st64(s28, d, e)
							st8(s16, av, au)
							st16(s28 + 0x10, c)
							fn_88db0(s108, se8)
							copyr(s10, s100, 0x10)
							n = log_data(s10, 1)
							st64(a + 8, undef)
							st64(a, 2)
							return n
						}
						st64(a + 8, ld64(s198 + 8))
						st64(a, j)
						return n
					}
					st64(a + 8, ld64(s100))
					st64(a, j)
					return n
				}
				st64(a + 8, ld64(s100))
				st64(a, j)
				return n
			}
			m = ld64(s188 + 8)
			rc_dec(x)
			y = aw
			if (!rc_release(aw)) {
				st64(a + 8, m)
				st64(a, j)
				return n
			}
			st64(y + 8, ld64(y + 8) - 1)
			st64(a + 8, m)
			st64(a, j)
			return n
		}
		st64(a + 8, ld64(se8 + 8))
		st64(a, j)
		return n
	}
	st64(a + 8, ld64(se8 + 8))
	st64(a, j)
	return n
}
