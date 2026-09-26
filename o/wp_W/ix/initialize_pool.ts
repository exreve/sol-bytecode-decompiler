/// <reference path="../lib.d.ts" />
// instruction initialize_pool
import { fn_143100, fn_149678, fn_14f7f8, fn_3aa0, fn_5db48, fn_6aa0, fn_78f88, log_data, memcpy } from '../shared.ts'

// instruction handler: initialize_pool (discriminator sha256("global:initialize_pool")[..8] = 0x28e8ae54ac0ab45f)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, token_mint_a, token_mint_b, token_vault_a, fee_tier, rent, whirlpool, token_program, token_vault_b, funder, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
export function ix_initialize_pool(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s130 = fp - 0x130, s138 = fp - 0x138, s148 = fp - 0x148, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2a1 = fp - 0x2a1, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s1000 = fp - 0x1000
	let l, m: u64
	sol_log("Instruction: InitializePool", 0x1b)
	const f = ix_args_len
	if (f >= 3 && f - 3 >= 0x10) {
		const g = ix_args
		const n = ld16(g + 1)
		const s = ld64(g + 0xb)
		const r = ld64(g + 3)
		st8(s2a1, 0xff)
		st64(s2a0, accounts, accounts_len)
		st64(s1000, f, s2a1)
		m = accounts_initialize_pool(s148, program_id, s2a0, g, fp)
		const h = ld32(s148)
		if (h == 2) {
			l = ld64(s148 + 8)
			st64(a + 8, ld64(s138))
			st64(a, l)
			return m
		}
		const q = ld32(s148 + 4)
		const p = ld64(s148 + 8)
		const o = ld64(s138)
		memcpy(s278, s130, 0x130)
		st64(s288, p, o)
		st32(s290, h, q)
		st8(s130 + 8, ld8(s2a1))
		copyr(s138, s2a0, 0x10)
		st64(s148, program_id, s290)
		st64(s1000, r, s)
		m = fn_31e50(s2b8, s148, undef, n, r, s)
		l = ld64(s2b8)
		if (l == 2) {
			m = fn_6aa0(s2c8, ld64(s278 + 0xb8), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
			const k = ld64(s2c8)
			if (k != 2) {
				m = Error_with_account_name(s2d8, k, ld64(s2c8 + 8), 0x100152b28 /* "whirlpool" */, 9)
				l = ld64(s2d8)
				st64(a + 8, ld64(s2d8 + 8))
				st64(a, l)
				return m
			}
			st64(a + 8, k)
			st64(a, 2)
			return m
		}
		st64(a + 8, ld64(s2b8 + 8))
		st64(a, l)
		return m
	}
	const i = fn_1459d0(0x100159468)
	if (2 > (i & 3) - 2) {
		m = anchor_error_from(s2e8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s2e8)
		st64(a + 8, ld64(s2e8 + 8))
		st64(a, l)
		return m
	}
	if ((i & 3) == 0) {
		m = anchor_error_from(s2e8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s2e8)
		st64(a + 8, ld64(s2e8 + 8))
		st64(a, l)
		return m
	}
	const j = ld64(ld64(i + 7))
	callx(j, ld64(i - 1), j)
	m = anchor_error_from(s2e8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	l = ld64(s2e8)
	st64(a + 8, ld64(s2e8 + 8))
	st64(a, l)
	return m
}

// Anchor Accounts::try_accounts of instruction initialize_pool (called by ix_initialize_pool; name [str]: from the handler's "Instruction: …" log; was fn_9b480)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, token_mint_a, token_mint_b, token_vault_a (ConstraintMut), fee_tier (ConstraintHasOne, ConstraintRaw), rent, whirlpool (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), token_program (ConstraintAddress), token_vault_b (ConstraintMut), funder (ConstraintMut), system_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpool, funder
export function accounts_initialize_pool(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s60 = fp - 0x60, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, s110 = fp - 0x110, s112 = fp - 0x112, s138 = fp - 0x138, s158 = fp - 0x158, s159 = fp - 0x159, s180 = fp - 0x180, s198 = fp - 0x198, s1b0 = fp - 0x1b0, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s228 = fp - 0x228, s238 = fp - 0x238, s240 = fp - 0x240, s288 = fp - 0x288, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2a2 = fp - 0x2a2, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s538 = fp - 0x538, s548 = fp - 0x548, s550 = fp - 0x550
	let l, m, ai, aj, bc: u64
	st64(s2b0, b)
	if (3 > ld64(e - 0x1000)) {
		const i = fn_1459d0(0x100159468)
		if (2 > (i & 3) - 2) {
			m = anchor_error_from(s4e0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			l = ld64(s4e0)
			st64(a + 0x10, ld64(s4e0 + 8))
			st64(a + 8, l)
			st32(a, 2)
			return m
		}
		if ((i & 3) == 0) {
			m = anchor_error_from(s4e0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			l = ld64(s4e0)
			st64(a + 0x10, ld64(s4e0 + 8))
			st64(a + 8, l)
			st32(a, 2)
			return m
		}
		const j = ld64(ld64(i + 7))
		callx(j, ld64(i - 1), j)
		m = anchor_error_from(s4e0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s4e0)
		st64(a + 0x10, ld64(s4e0 + 8))
		st64(a + 8, l)
		st32(a, 2)
		return m
	}
	const g = ld64(e - 0xff8)
	st16(s2a2, ld16(d + 1))
	try_accounts_11de0(sc0, c, c, d, e)
	if (ld64(sc0) == 0) {
		m = Error_with_account_name(s4d0, ld64(sb8), ld64(sb8 + 8), "whirlpools_config", 0x11)
		l = ld64(s4d0)
		st64(a + 0x10, ld64(s4d0 + 8))
		st64(a + 8, l)
		st32(a, 2)
		return m
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	st64(s538 + 0x50, g)
	const h = f != 0 ? sat_sub(f, 0x70) & -8 : 0x300007f90
	if (h > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		memcpy(h, sc0, 0x70)
		try_accounts_11e98(sc0, c)
		const k = ld32(sc0)
		if (k == 2) {
			m = Error_with_account_name(s4c0, ld64(sb8), ld64(sb8 + 8), "token_mint_a", 0xc)
			l = ld64(s4c0)
			st64(a + 0x10, ld64(s4c0 + 8))
			st64(a + 8, l)
			st32(a, 2)
			return m
		}
		st64(s538 + 0x38, h)
		st64(s538 + 0x48, a)
		st64(s538 + 0x40, ld32(sc0 + 4))
		const o = ld64(sb8)
		const n = ld64(sb8 + 8)
		memcpy(s288, sa8, 0x48)
		st64(s298, o, n)
		st32(s2a0 + 4, ld64(s538 + 0x40))
		st32(s2a0, k)
		try_accounts_11e98(sc0, c)
		const p = ld32(sc0)
		if (p == 2) {
			m = Error_with_account_name(s4b0, ld64(sb8), ld64(sb8 + 8), "token_mint_b", 0xc)
			aj = ld64(s4b0)
			ai = ld64(s538 + 0x48)
			st64(ai + 0x10, ld64(s4b0 + 8))
			st64(ai + 8, aj)
			st32(ai, 2)
			return m
		}
		st64(s538 + 0x40, ld32(sc0 + 4))
		const r = ld64(sb8)
		const q = ld64(sb8 + 8)
		memcpy(s228, sa8, 0x48)
		st64(s238, r, q)
		st32(s240 + 4, ld64(s538 + 0x40))
		st32(s240, p)
		try_accounts_11718(sc0, c)
		const t = ld64(sb8)
		const s = ld64(sc0)
		if (s == 2) {
			st64(s1e0, t)
			const u = ld64(c + 8)
			const bb = ld64(s538 + 0x48)
			if (u == 0) {
				m = anchor_error_from(s4a0, 0xbbd /* anchor::AccountNotEnoughKeys */, t)
				bc = ld64(s4a0)
				st64(bb + 0x10, ld64(s4a0 + 8))
				st64(bb + 8, bc)
				st32(bb, 2)
				return m
			}
			const v: AccountInfo = ld64(c)
			st64(s1d8, v)
			st64(c + 8, u - 1)
			st64(c, v + 0x30)
			try_accounts_11718(sc0, c, t)
			const ak = ld64(sb8)
			const w = ld64(sc0)
			if (w != 2) {
				m = Error_with_account_name(s2d0, w, ak, "token_vault_a", 0xd)
				bc = ld64(s2d0)
				st64(bb + 0x10, ld64(s2d0 + 8))
				st64(bb + 8, bc)
				st32(bb, 2)
				return m
			}
			try_accounts_11718(sc0, c)
			const al = ld64(sb8)
			const x = ld64(sc0)
			if (x == 2) {
				try_accounts_12008(sc0, c)
				const aa = ld64(sb8 + 8)
				const z = ld64(sb8)
				const y = ld64(sc0)
				if (y == 0) {
					m = Error_with_account_name(s490, z, aa, "fee_tier", 8)
					bc = ld64(s490)
					st64(bb + 0x10, ld64(s490 + 8))
					st64(bb + 8, bc)
					st32(bb, 2)
					return m
				}
				st64(s538 + 0x20, y)
				st64(s538 + 0x30, z)
				st64(s538 + 0x40, aa)
				copyr(s1c8, sa8, 0x10)
				st32(s1d8 + 8, ld32(sa0 + 0xa))
				st16(s1d8 + 0xc, ld16(sa0 + 0xe))
				st64(s538 + 0x28, ld16(sa0 + 8))
				fn_129a0(sc0, c, aa)
				const ac = ld64(sb8)
				const ab = ld64(sc0)
				if (ab == 2) {
					st64(s538 + 0x18, ac)
					fn_122e8(sc0, c, ac)
					const ae = ld64(sb8)
					const ad = ld64(sc0)
					if (ad == 2) {
						st64(s1b8, ae)
						try_accounts_11990(sc0, c, ae)
						const ah = ld64(sb8 + 8)
						const ag = ld64(sb8)
						const af = ld64(sc0)
						if (af == 0) {
							m = Error_with_account_name(s480, ag, ah, 0x100152d60 /* "rent" */, 4)
							bc = ld64(s480)
							st64(bb + 0x10, ld64(s480 + 8))
							st64(bb + 8, bc)
							st32(bb, 2)
							return m
						}
						st64(s538, af, ag, ah)
						const am = ld64(sa8)
						rent_get(sc0)
						copy(s198, sb8, 0x18)
						if (ld64(sc0) == 0) {
							st64(s548, am, al)
							copyr(s1b0, s198, 0x18)
							const an = ld64(s538 + 0x38)
							const ao = ld64(ld64(an))
							copyr(s158, ao, 0x20)
							const ap = ld64(ld64(s288 + 0x40))
							copy(s138, ap, 0x20)
							const aq = ld64(ld64(s228 + 0x40))
							copy(se0, aq, 0x20)
							st16(s112, ld16(s2a2))
							st64(sc0, 0x100152b28, 9, s158, 0x20, s138, 0x20, se0, 0x20, s112, 2)
							// PDA find_program_address(["whirlpool", *ao, *ap, *aq, u16 ld16(s2a2) [ix data?]], program *(ld64(s2b0)))
							Pubkey_find_program_address(s110, sc0, 5, ld64(s2b0))
							copyr(s180, s110, 0x20)
							const ar = ld8(s110 + 0x20)
							st8(s159, ar)
							st8(ld64(s538 + 0x50), ar)
							const at = ld64(ld64(s1d8))
							copy(sc0, at, 0x20)
							if ((memcmp(sc0, s180, 0x20) as u32) == 0) {
								st64(s538 + 0x50, ak)
								st64(sc0, s1d8, s1b0, s1e0, s1b8, an, s2a0, s240, s2a2, s159, s2b0)
								m = fn_9d160(s110, sc0)
								const bd = ld64(s110 + 8)
								bc = ld64(s110)
								if (bc == 2) {
									const whirlpool: AccountInfo = ld64(bd)
									if (whirlpool.is_writable == 0) {
										anchor_error_from(s460, 0x7d0 /* anchor::ConstraintMut */)
										m = Error_with_account_name(s470, ld64(s460), ld64(s460 + 8), 0x100152b28 /* "whirlpool" */, 9)
										aj = ld64(s470)
										ai = ld64(s538 + 0x48)
										st64(ai + 0x10, ld64(s470 + 8))
										st64(ai + 8, aj)
										st32(ai, 2)
										return m
									}
									AccountInfo_clone(s110, whirlpool)
									const bf = fn_143100(s110)
									AccountInfo_clone(sc0, ld64(bd))
									AccountInfo_try_data_len(se0, sc0)
									const bh = ld64(se0 + 8)
									const bg = ld64(se0)
									if (bg != 0x800000000000001a /* Ok */) {
										st64(sd0, ld64(sd0))
										st64(se0, bg, bh)
										m = fn_13b430(s350, se0)
										const bu = ld64(s350)
										const bt = ld64(s538 + 0x48)
										st64(bt + 0x10, ld64(s350 + 8))
										st64(bt + 8, bu)
										st32(bt, 2)
										const bw = ld64(sb8 + 8)
										const bv = ld64(sb8)
										rc_dec(bv)
										rc_dec(bw)
										const by = ld64(s110 + 0x10)
										const bx = ld64(s110 + 8)
										rc_dec(bx)
										if (!rc_release(by)) {
											return m
										}
										st64(by + 8, ld64(by + 8) - 1)
										return m
									}
									const bi = __floatundidf(ld64(s1b0) * (bh + 0x80))
									const bj = fn_14f7f8(ld64(s1b0 + 8), bi)
									st64(s550, fn_151cb0(bj, 0))
									const bk = fn_14f3e8(bj)
									const bl = 0 > (ld64(s550) as i64) ? 0 : bk
									const bs = (fn_151a40(bj, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : bl
									const bn = ld64(sb8 + 8)
									const bm = ld64(sb8)
									rc_dec(bm)
									rc_dec(bn)
									const bq = ld64(s110 + 0x10)
									const bo = ld64(s110 + 8)
									let bp = ld64(bo) - 1
									st64(bo, bp)
									if (bp == 0) {
										bp = ld64(bo + 8) - 1
										st64(bo + 8, bp)
									}
									let br = ld64(bq) - 1
									st64(bq, br)
									if (br == 0) {
										br = ld64(bq + 8) - 1
										st64(bq + 8, br)
									}
									if (bs > bf) {
										anchor_error_from(s440, 0x7d5 /* anchor::ConstraintRentExempt */, br, bp)
										m = Error_with_account_name(s450, ld64(s440), ld64(s440 + 8), 0x100152b28 /* "whirlpool" */, 9)
										aj = ld64(s450)
										ai = ld64(s538 + 0x48)
										st64(ai + 0x10, ld64(s450 + 8))
										st64(ai + 8, aj)
										st32(ai, 2)
										return m
									}
									const funder: AccountInfo = ld64(s1e0)
									if (funder.is_writable != 0) {
										if (ld8(ld64(s538 + 0x50) + 0x29) != 0) {
											if (ld8(ld64(s548 + 8) + 0x29) != 0) {
												st64(se0 + 8, ld64(s538 + 0x40))
												st64(se0, ld64(s538 + 0x30))
												copy(sd0, s1c8, 0x10)
												const ca = ld64(ld64(ld64(s538 + 0x38)))
												copyr(s110, ca, 0x20)
												if ((memcmp(se0, s110, 0x20) as u32) != 0) {
													anchor_error_from(s360, 0x7d1 /* anchor::ConstraintHasOne */)
													const cg = Error_with_account_name(s370, ld64(s360), ld64(s360 + 8), "fee_tier", 8)
													const cf = ld64(s370 + 8)
													const ce = ld64(s370)
													copyr(sc0, se0, 0x20)
													copy(sa0, s110, 0x20)
													m = fn_13b5c0(s380, ce, cf, sc0, cg)
													aj = ld64(s380)
													ai = ld64(s538 + 0x48)
													st64(ai + 0x10, ld64(s380 + 8))
													st64(ai + 8, aj)
													st32(ai, 2)
													return m
												}
												if (ld64(s538 + 0x28) == ld16(s2a2)) {
													const cb = ld64(ld64(s538 + 0x18))
													copyr(s110, cb, 0x20)
													if ((memcmp(s110, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
														anchor_error_from(s3b0, 0x7dc /* anchor::ConstraintAddress */)
														const cj = Error_with_account_name(s3c0, ld64(s3b0), ld64(s3b0 + 8), "token_program", 0xd)
														const ci = ld64(s3c0 + 8)
														const ch = ld64(s3c0)
														copyr(sc0, s110, 0x20)
														st64(sa0, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
														m = fn_13b5c0(s3d0, ch, ci, sc0, cj)
														aj = ld64(s3d0)
														ai = ld64(s538 + 0x48)
														st64(ai + 0x10, ld64(s3d0 + 8))
														st64(ai + 8, aj)
														st32(ai, 2)
														return m
													}
													st64(s550, sc0)
													memcpy(sc0, s2a0, 0x60)
													memcpy(s60, s240, 0x60)
													const cd = ld64(s1b8)
													const cc = ld64(s538 + 0x48)
													copy(cc + 0x100, s1c8, 0x10)
													st16(cc + 0x116, ld16(s1d8 + 0xc))
													st32(cc + 0x112, ld32(s1d8 + 8))
													m = memcpy(cc, ld64(s550), 0xc0)
													st64(cc + 0x140, ld64(s548))
													st64(cc + 0x138, ld64(s538 + 0x10))
													st64(cc + 0x130, ld64(s538 + 8))
													st64(cc + 0x128, ld64(s538))
													st64(cc + 0x120, cd)
													st64(cc + 0x118, ld64(s538 + 0x18))
													st16(cc + 0x110, ld64(s538 + 0x28))
													st64(cc + 0xf8, ld64(s538 + 0x40))
													st64(cc + 0xf0, ld64(s538 + 0x30))
													st64(cc + 0xe8, ld64(s538 + 0x20))
													st64(cc + 0xe0, ld64(s548 + 8))
													st64(cc + 0xd8, ld64(s538 + 0x50))
													st64(cc + 0xd0, bd)
													st64(cc + 0xc8, funder)
													st64(cc + 0xc0, ld64(s538 + 0x38))
													return m
												}
												anchor_error_from(s390, 0x7d3 /* anchor::ConstraintRaw */)
												m = Error_with_account_name(s3a0, ld64(s390), ld64(s390 + 8), "fee_tier", 8)
												aj = ld64(s3a0)
												ai = ld64(s538 + 0x48)
												st64(ai + 0x10, ld64(s3a0 + 8))
												st64(ai + 8, aj)
												st32(ai, 2)
												return m
											}
											anchor_error_from(s3e0, 0x7d0 /* anchor::ConstraintMut */, br, bp)
											m = Error_with_account_name(s3f0, ld64(s3e0), ld64(s3e0 + 8), "token_vault_b", 0xd)
											aj = ld64(s3f0)
											ai = ld64(s538 + 0x48)
											st64(ai + 0x10, ld64(s3f0 + 8))
											st64(ai + 8, aj)
											st32(ai, 2)
											return m
										}
										anchor_error_from(s400, 0x7d0 /* anchor::ConstraintMut */, br, bp)
										m = Error_with_account_name(s410, ld64(s400), ld64(s400 + 8), "token_vault_a", 0xd)
										aj = ld64(s410)
										ai = ld64(s538 + 0x48)
										st64(ai + 0x10, ld64(s410 + 8))
										st64(ai + 8, aj)
										st32(ai, 2)
										return m
									}
									anchor_error_from(s420, 0x7d0 /* anchor::ConstraintMut */, br, bp)
									m = Error_with_account_name(s430, ld64(s420), ld64(s420 + 8), "funder", 6)
									aj = ld64(s430)
									ai = ld64(s538 + 0x48)
									st64(ai + 0x10, ld64(s430 + 8))
									st64(ai + 8, aj)
									st32(ai, 2)
									return m
								}
								st64(bb + 0x10, bd)
								st64(bb + 8, bc)
								st32(bb, 2)
								return m
							}
							anchor_error_from(s320, 0x7d6 /* anchor::ConstraintSeeds */)
							Error_with_account_name(s330, ld64(s320), ld64(s320 + 8), 0x100152b28 /* "whirlpool" */, 9)
							const ba = ld64(s330 + 8)
							const az = ld64(s330)
							const au = ld64(ld64(s1d8))
							const ay = ld64(au + 0x18)
							const ax = ld64(au + 0x10)
							const aw = ld64(au + 8)
							const av = ld64(au)
							copy(sa0, s180, 0x20)
							st64(sc0, av, aw, ax, ay)
							m = fn_13b5c0(s340, az, ba, sc0, aw)
							bc = ld64(s340)
							st64(bb + 0x10, ld64(s340 + 8))
							st64(bb + 8, bc)
							st32(bb, 2)
							return m
						}
						m = fn_13b430(s310, s198)
						bc = ld64(s310)
						st64(bb + 0x10, ld64(s310 + 8))
						st64(bb + 8, bc)
						st32(bb, 2)
						return m
					}
					m = Error_with_account_name(s300, ad, ae, "system_program", 0xe)
					bc = ld64(s300)
					st64(bb + 0x10, ld64(s300 + 8))
					st64(bb + 8, bc)
					st32(bb, 2)
					return m
				}
				m = Error_with_account_name(s2f0, ab, ac, "token_program", 0xd)
				bc = ld64(s2f0)
				st64(bb + 0x10, ld64(s2f0 + 8))
				st64(bb + 8, bc)
				st32(bb, 2)
				return m
			}
			m = Error_with_account_name(s2e0, x, al, "token_vault_b", 0xd)
			bc = ld64(s2e0)
			st64(bb + 0x10, ld64(s2e0 + 8))
			st64(bb + 8, bc)
			st32(bb, 2)
			return m
		}
		m = Error_with_account_name(s2c0, s, t, "funder", 6)
		aj = ld64(s2c0)
		ai = ld64(s538 + 0x48)
		st64(ai + 0x10, ld64(s2c0 + 8))
		st64(ai + 8, aj)
		st32(ai, 2)
		return m
	}
	alloc_handle_alloc_error(8, 0x70)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
export function fn_9d160(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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
				st64(s4d0, 0x1001548d6)
				st32(s458 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s488, 2)
				st32(s4d0 + 0x10, 5)
				st64(s4d0 + 8, 0x36)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), p5 (value), p6 (value)
// types [heur]: b: InitializePoolContext (the handler ix_initialize_pool passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_31e50(a: u64, b: InitializePoolContext, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s80 = fp - 0x80, s98 = fp - 0x98, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, se0 = fp - 0xe0, s100 = fp - 0x100, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s1000 = fp - 0x1000
	let at, au: u64
	const accounts: InitializePoolAccounts = b.accounts
	const g: AccountInfo = ld64(accounts + 0x58)
	const h = g.key
	copyr(s120, h, 0x20)
	const i = ld64(ld64(accounts + 0xb8))
	copyr(s100, i, 0x20)
	const j: LamportsCell = g.lamports
	const k = ld8(b + 0x20)
	const m = ld16(accounts + 0x112)
	let az = ld64(accounts + 0xd0)
	let ay = j
	rc_inc(j)
	const l: DataCell = g.data
	const aw = p6
	const ax = p5
	rc_inc(l)
	const q = g.owner
	const p = g.rent_epoch
	const o = g.is_signer
	const n = g.is_writable
	st8(s98 + 2, g.executable)
	st8(s98, o, n)
	st64(sb0, l, q, p)
	const r = ay
	st64(sc0, h, ay)
	st64(s1000 + 8, ld64(accounts + 0x118))
	st64(s1000 + 0x10, accounts + 0x120)
	st64(s1000, accounts + 0xc8)
	let av = fn_78f88(s130, az, accounts + 0xd8, sc0, accounts + 0xc8, ld64(s1000 + 8), accounts + 0x120)
	let s = ld64(s130)
	let t = l
	if (s != 2) {
		au = ld64(s130 + 8)
		at = a
		rc_dec(r)
		if (!rc_release(t)) {
			st64(at + 8, au)
			st64(at, s)
			return av
		}
		st64(t + 8, ld64(t + 8) - 1)
		st64(at + 8, au)
		st64(at, s)
		return av
	}
	rc_dec(r)
	rc_dec(t)
	const u: AccountInfo = ld64(accounts + 0xb8)
	const v: LamportsCell = u.lamports
	const y = ld64(accounts + 0xd0)
	const x = u.key
	az = v
	rc_inc(v)
	const w: DataCell = u.data
	ay = y
	rc_inc(w)
	const ac = u.owner
	const ab = u.rent_epoch
	const aa = u.is_signer
	const z = u.is_writable
	st8(s98 + 2, u.executable)
	st8(s98, aa, z)
	st64(sb0, w, ac, ab)
	const ad = az
	st64(sc0, x, az)
	st64(s1000 + 8, ld64(accounts + 0x118))
	st64(s1000 + 0x10, accounts + 0x120)
	st64(s1000, accounts + 0xc8)
	av = fn_78f88(s140, ay, accounts + 0xe0, sc0, accounts + 0xc8, ld64(s1000 + 8), accounts + 0x120)
	s = ld64(s140)
	if (s == 2) {
		rc_dec(ad)
		rc_dec(w)
		const ah = ld64(accounts + 0xc0)
		const ag = ld64(accounts + 0xd0)
		const ae = accounts.token_vault_a.key
		copyr(se0, ae, 0x20)
		const af = accounts.token_vault_b.key
		copyr(sc0, af, 0x20)
		st64(s1000, k, d, ax, aw, m, s120, se0, s100, sc0, 0)
		av = fn_5db48(s150, ag + 8, ah, d, k, d, ax, aw, m, s120, se0, s100, sc0, 0)
		s = ld64(s150)
		if (s == 2) {
			const ai = ld64(ld64(ld64(accounts + 0xd0)))
			copyr(sc0, ai, 0x20)
			const aj = ld64(ld64(ld64(accounts + 0xc0)))
			copyr(sa0, aj, 0x20)
			const ak = ld64(ld64(accounts + 0x58))
			copyr(s80, ak, 0x20)
			const al = ld64(ld64(accounts + 0xb8))
			copyr(s60, al, 0x20)
			const am = ld64(ld64(accounts + 0x118))
			copyr(s40, am, 0x20)
			copyr(s20, am, 0x20)
			const an = ld64(0x300000000 /* heap bump-allocator cursor */)
			const ao = an != 0 ? sat_sub(an, 0x100) : 0x300007f00
			if (ao > 0x300000007) {
				const ar = ld8(accounts + 0x30)
				const aq = ld8(accounts + 0x90)
				st64(0x300000000 /* heap bump-allocator cursor */, ao)
				st64(ao, 0xe5fec60c57ad7664 /* event:PoolInitialized */)
				st64(ao + 0x20, ld64(sb0 + 8))
				st64(ao + 0x18, ld64(sb0))
				st64(ao + 0x10, ld64(sc0 + 8))
				st64(ao + 8, ld64(sc0))
				st64(ao + 0x40, ld64(s98 + 0x10))
				st64(ao + 0x38, ld64(s98 + 8))
				st64(ao + 0x30, ld64(s98))
				st64(ao + 0x28, ld64(sa0))
				st64(ao + 0x60, ld64(s80 + 0x18))
				st64(ao + 0x58, ld64(s80 + 0x10))
				st64(ao + 0x50, ld64(s80 + 8))
				st64(ao + 0x48, ld64(s80))
				copy(ao + 0x68, s60, 0x18)
				const ap = ld64(s60 + 0x18)
				st16(ao + 0x88, d)
				st64(ao + 0x80, ap)
				st64(ao + 0xa2, ld64(s40 + 0x18))
				st64(ao + 0x9a, ld64(s40 + 0x10))
				st64(ao + 0x92, ld64(s40 + 8))
				st64(ao + 0x8a, ld64(s40))
				st64(ao + 0xc2, ld64(s20 + 0x18))
				st64(ao + 0xba, ld64(s20 + 0x10))
				st64(ao + 0xb2, ld64(s20 + 8))
				st64(ao + 0xaa, ld64(s20))
				st64(ao + 0xd4, aw)
				st64(ao + 0xcc, ax)
				st8(ao + 0xcb, aq)
				st8(ao + 0xca, ar)
				st64(se0, ao, 0xdc)
				av = log_data(se0, 1)
				st64(a + 8, undef)
				st64(a, 2)
				return av
			}
			raw_vec_handle_error(1, 0x100, sat_sub(an, 0x100), 0x100 > an)
		}
		st64(a + 8, ld64(s150 + 8))
		st64(a, s)
		return av
	}
	au = ld64(s140 + 8)
	at = a
	rc_dec(ad)
	t = w
	if (!rc_release(w)) {
		st64(at + 8, au)
		st64(at, s)
		return av
	}
	st64(t + 8, ld64(t + 8) - 1)
	st64(at + 8, au)
	st64(at, s)
	return av
}
