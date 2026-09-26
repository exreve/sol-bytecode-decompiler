/// <reference path="../lib.d.ts" />
// instruction initialize_reward_v2
import { fn_5e558, fn_6aa0, fn_78f88, fn_80ca8, fn_81d00, memcpy } from '../shared.ts'

// instruction handler: initialize_reward_v2 (discriminator sha256("global:initialize_reward_v2")[..8] = 0x3185e5eb324d015b)
// accounts [str: the program's account-error strings, in order of first use]: reward_authority, whirlpool, reward_mint, reward_token_badge, rent, funder, reward_vault, reward_token_program, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
export function ix_initialize_reward_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s48 = fp - 0x48, s50 = fp - 0x50, s60 = fp - 0x60, sa8 = fp - 0xa8, sc0 = fp - 0xc0, sd0 = fp - 0xd0, sd1 = fp - 0xd1, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, sff8 = fp - 0xff8
	let h, l: u64
	sol_log("Instruction: InitializeRewardV2", 0x1f)
	if (ix_args_len == 0) {
		const j = fn_1459d0(0x100159468)
		if (2 > (j & 3) - 2) {
			l = anchor_error_from(s118, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s118)
			st64(a + 8, ld64(s118 + 8))
			st64(a, h)
			return l
		}
		if ((j & 3) == 0) {
			l = anchor_error_from(s118, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s118)
			st64(a + 8, ld64(s118 + 8))
			st64(a, h)
			return l
		}
		const k = ld64(ld64(j + 7))
		callx(k, ld64(j - 1), k)
		l = anchor_error_from(s118, 0x66 /* anchor::InstructionDidNotDeserialize */)
		h = ld64(s118)
		st64(a + 8, ld64(s118 + 8))
		st64(a, h)
		return l
	}
	const m = ld8(ix_args)
	st8(sd1, 0xff)
	st64(sd0, accounts, accounts_len)
	st64(sff8, sd1)
	l = accounts_initialize_reward_v2(s60, program_id, sd0, undef, fp)
	const g = ld64(s50)
	h = ld64(s60 + 8)
	const f = ld64(s60)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return l
	}
	memcpy(sa8, s48, 0x48)
	st64(sc0, f, h, g)
	st8(s48 + 8, ld8(sd1))
	copyr(s50, sd0, 0x10)
	st64(s60, program_id, sc0)
	l = fn_3cd20(se8, s60, m)
	h = ld64(se8)
	if (h == 2) {
		l = fn_6aa0(sf8, ld64(sc0 + 0x10), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
		const i = ld64(sf8)
		if (i != 2) {
			l = Error_with_account_name(s108, i, ld64(sf8 + 8), 0x100152b28 /* "whirlpool" */, 9)
			h = ld64(s108)
			st64(a + 8, ld64(s108 + 8))
			st64(a, h)
			return l
		}
		st64(a + 8, g)
		st64(a, 2)
		return l
	}
	st64(a + 8, ld64(se8 + 8))
	st64(a, h)
	return l
}

// Anchor Accounts::try_accounts of instruction initialize_reward_v2 (called by ix_initialize_reward_v2; name [str]: from the handler's "Instruction: …" log; was fn_e01d0)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: reward_authority (ConstraintAddress), whirlpool (ConstraintMut), reward_mint, reward_token_badge (AccountNotEnoughKeys, ConstraintSeeds), rent, funder (ConstraintMut), reward_vault (ConstraintMut), reward_token_program (ConstraintAddress), system_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: reward_mint_box, reward_authority, funder
export function accounts_initialize_reward_v2(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s270 = fp - 0x270, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2d8 = fp - 0x2d8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s4e8 = fp - 0x4e8, s4f0 = fp - 0x4f0
	let o, p, q, ag, ah: u64
	st64(s4e8 + 0x58, b)
	try_accounts_11718(s290, c, c, d, e)
	const reward_authority: AccountInfo = ld64(s290 + 8)
	const f = ld64(s290)
	if (f != 2) {
		ah = Error_with_account_name(s308, f, reward_authority, "reward_authority", 0x10)
		ag = ld64(s308)
		st64(a + 0x10, ld64(s308 + 8))
		st64(a + 8, ag)
		st64(a, 0)
		return ah
	}
	st64(s4e8 + 0x50, ld64(e - 0xff8))
	try_accounts_11718(s290, c)
	const i = ld64(s290 + 8)
	const g = ld64(s290)
	if (g == 2) {
		try_accounts_11a48(s290, c)
		if (ld64(s290) == 0) {
			ah = Error_with_account_name(s488, ld64(s290 + 8), ld64(s290 + 0x10), 0x100152b28 /* "whirlpool" */, 9)
			ag = ld64(s488)
			st64(a + 0x10, ld64(s488 + 8))
			st64(a + 8, ag)
			st64(a, 0)
			return ah
		}
		const h = ld64(0x300000000 /* heap bump-allocator cursor */)
		const j = h != 0 ? sat_sub(h, 0x290) & -8 : 0x300007d70
		st64(s4e8 + 0x48, i)
		if (j > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(s4e8 + 0x40, j)
			memcpy(j, s290, 0x290)
			try_accounts_610(s290, c)
			if (ld32(s290) == 2) {
				ah = Error_with_account_name(s478, ld64(s290 + 8), ld64(s290 + 0x10), "reward_mint", 0xb)
				ag = ld64(s478)
				st64(a + 0x10, ld64(s478 + 8))
				st64(a + 8, ag)
				st64(a, 0)
				return ah
			}
			const l = ld64(0x300000000 /* heap bump-allocator cursor */)
			const funder: AccountInfo = ld64(s4e8 + 0x48)
			const reward_mint_box: Mint = l != 0 ? sat_sub(l, 0x80) & -8 : 0x300007f80
			if (reward_mint_box > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, reward_mint_box)
				st64(s4e8 + 0x38, reward_mint_box)
				memcpy(reward_mint_box, s290, 0x80)
				const n = ld64(c + 8)
				if (n == 0) {
					anchor_error_from(s328, 0xbbd /* anchor::AccountNotEnoughKeys */, undef, p, q)
					o = ld64(s328 + 8)
					const r = ld64(s328)
					if (r != 2) {
						ah = Error_with_account_name(s338, r, o, "reward_token_badge", 0x12)
						ag = ld64(s338)
						st64(a + 0x10, ld64(s338 + 8))
						st64(a + 8, ag)
						st64(a, 0)
						return ah
					}
				} else {
					st64(c + 8, n - 1)
					o = ld64(c)
					st64(c, o + 0x30)
				}
				st64(s4e8 + 0x30, o)
				try_accounts_11718(s290, c, o, p, q)
				const t = ld64(s290 + 8)
				const s = ld64(s290)
				if (s == 2) {
					st64(s4e8 + 0x28, t)
					try_accounts_120(s290, c, t)
					const v = ld64(s290 + 8)
					const u = ld64(s290)
					if (u == 2) {
						st64(s4e8 + 0x20, v)
						fn_122e8(s290, c, v)
						const x = ld64(s290 + 8)
						const w = ld64(s290)
						if (w == 2) {
							st64(s4e8 + 0x18, x)
							try_accounts_11990(s290, c, x)
							const aa = ld64(s290 + 0x10)
							const z = ld64(s290 + 8)
							const y = ld64(s290)
							if (y == 0) {
								ah = Error_with_account_name(s468, z, aa, 0x100152d60 /* "rent" */, 4)
								ag = ld64(s468)
								st64(a + 0x10, ld64(s468 + 8))
								st64(a + 8, ag)
								st64(a, 0)
								return ah
							}
							st64(s4e8, y, z, aa)
							const ai = ld64(s290 + 0x18)
							const ab = reward_authority.key
							copyr(s2b0, ab, 0x20)
							const ac = ld64(s4e8 + 0x40)
							copyr(s2d8, ac + 0x48, 0x20)
							if ((memcmp(s2b0, s2d8, 0x20) as u32) == 0) {
								st64(s4f0, ai)
								if (funder.is_writable == 0) {
									anchor_error_from(s448, 0x7d0 /* anchor::ConstraintMut */)
									ah = Error_with_account_name(s458, ld64(s448), ld64(s448 + 8), "funder", 6)
									ag = ld64(s458)
									st64(a + 0x10, ld64(s458 + 8))
									st64(a + 8, ag)
									st64(a, 0)
									return ah
								}
								const ak = ld64(s4e8 + 0x40)
								if (ld8(ld64(ak) + 0x29) != 0) {
									const al = ld64(ld64(ld64(s4e8 + 0x38) + 0x58))
									const ap = ld64(al)
									const ao = ld64(al + 8)
									const an = ld64(al + 0x10)
									const am = ld64(al + 0x18)
									st64(s2b0, ap, ao, an, am, 0x100154db3, 0xb, ak + 0x188, 0x20, s2b0, 0x20)
									// PDA find_program_address(["token_badge", *(ak + 0x188), *s2b0], program *(ld64(s4e8 + 0x58)))
									Pubkey_find_program_address(s2d8, s290, 3, ld64(s4e8 + 0x58))
									copyr(s2f8, s2d8, 0x20)
									st8(ld64(s4e8 + 0x50), ld8(s2d8 + 0x20))
									const aq = ld64(ld64(s4e8 + 0x30))
									copyr(s290, aq, 0x20)
									if ((memcmp(s290, s2f8, 0x20) as u32) != 0) {
										anchor_error_from(s3a8, 0x7d6 /* anchor::ConstraintSeeds */)
										const bb = Error_with_account_name(s3b8, ld64(s3a8), ld64(s3a8 + 8), "reward_token_badge", 0x12)
										const ba = ld64(s3b8 + 8)
										const az = ld64(s3b8)
										copyr(s290, aq, 0x20)
										copy(s270, s2f8, 0x20)
										ah = fn_13b5c0(s3c8, az, ba, s290, bb)
										ag = ld64(s3c8)
										st64(a + 0x10, ld64(s3c8 + 8))
										st64(a + 8, ag)
										st64(a, 0)
										return ah
									}
									if (ld8(ld64(s4e8 + 0x28) + 0x29) == 0) {
										anchor_error_from(s408, 0x7d0 /* anchor::ConstraintMut */)
										ah = Error_with_account_name(s418, ld64(s408), ld64(s408 + 8), "reward_vault", 0xc)
										ag = ld64(s418)
										st64(a + 0x10, ld64(s418 + 8))
										st64(a + 8, ag)
										st64(a, 0)
										return ah
									}
									const ar = ld64(ld64(s4e8 + 0x20))
									copyr(s2b0, ar, 0x20)
									AccountInfo_clone(s290, ld64(ld64(s4e8 + 0x38) + 0x58))
									const at = ld64(s290 + 0x18)
									copy(s2d8, at, 0x20)
									const av = ld64(s290 + 0x10)
									const au = ld64(s290 + 8)
									rc_dec(au)
									rc_dec(av)
									ah = memcmp(s2b0, s2d8, 0x20) as u32
									if (ah == 0) {
										st64(a + 0x58, ld64(s4f0))
										st64(a + 0x50, ld64(s4e8 + 0x10))
										st64(a + 0x48, ld64(s4e8 + 8))
										st64(a + 0x40, ld64(s4e8))
										st64(a + 0x38, ld64(s4e8 + 0x18))
										st64(a + 0x30, ld64(s4e8 + 0x20))
										st64(a + 0x28, ld64(s4e8 + 0x28))
										st64(a + 0x20, ld64(s4e8 + 0x30))
										st64(a + 0x18, ld64(s4e8 + 0x38))
										st64(a + 0x10, ld64(s4e8 + 0x40))
										st64(a + 8, ld64(s4e8 + 0x48))
										st64(a, reward_authority)
										return ah
									}
									anchor_error_from(s3d8, 0x7dc /* anchor::ConstraintAddress */)
									const ay = Error_with_account_name(s3e8, ld64(s3d8), ld64(s3d8 + 8), "reward_token_program", 0x14)
									const ax = ld64(s3e8 + 8)
									const aw = ld64(s3e8)
									copyr(s290, s2b0, 0x20)
									copy(s270, s2d8, 0x20)
									ah = fn_13b5c0(s3f8, aw, ax, s290, ay)
									ag = ld64(s3f8)
									st64(a + 0x10, ld64(s3f8 + 8))
									st64(a + 8, ag)
									st64(a, 0)
									return ah
								}
								anchor_error_from(s428, 0x7d0 /* anchor::ConstraintMut */)
								ah = Error_with_account_name(s438, ld64(s428), ld64(s428 + 8), 0x100152b28 /* "whirlpool" */, 9)
								ag = ld64(s438)
								st64(a + 0x10, ld64(s438 + 8))
								st64(a + 8, ag)
								st64(a, 0)
								return ah
							}
							anchor_error_from(s378, 0x7dc /* anchor::ConstraintAddress */)
							const af = Error_with_account_name(s388, ld64(s378), ld64(s378 + 8), "reward_authority", 0x10)
							const ae = ld64(s388 + 8)
							const ad = ld64(s388)
							copyr(s290, s2b0, 0x20)
							copy(s270, s2d8, 0x20)
							ah = fn_13b5c0(s398, ad, ae, s290, af)
							ag = ld64(s398)
							st64(a + 0x10, ld64(s398 + 8))
							st64(a + 8, ag)
							st64(a, 0)
							return ah
						}
						ah = Error_with_account_name(s368, w, x, "system_program", 0xe)
						ag = ld64(s368)
						st64(a + 0x10, ld64(s368 + 8))
						st64(a + 8, ag)
						st64(a, 0)
						return ah
					}
					ah = Error_with_account_name(s358, u, v, "reward_token_program", 0x14)
					ag = ld64(s358)
					st64(a + 0x10, ld64(s358 + 8))
					st64(a + 8, ag)
					st64(a, 0)
					return ah
				}
				ah = Error_with_account_name(s348, s, t, "reward_vault", 0xc)
				ag = ld64(s348)
				st64(a + 0x10, ld64(s348 + 8))
				st64(a + 8, ag)
				st64(a, 0)
				return ah
			}
			alloc_handle_alloc_error(8, 0x80)
		}
		alloc_handle_alloc_error(8, 0x290)
	}
	ah = Error_with_account_name(s318, g, i, "funder", 6)
	ag = ld64(s318)
	st64(a + 0x10, ld64(s318 + 8))
	st64(a + 8, ag)
	st64(a, 0)
	return ah
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
// types [heur]: b: InitializeRewardV2Context (the handler ix_initialize_reward_v2 passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_3cd20(a: u64, b: InitializeRewardV2Context, c: u64): u64 {
	const s10 = fp - 0x10, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let w: u64
	const accounts: InitializeRewardV2Accounts = b.accounts
	const reward_mint: Mint = accounts.reward_mint
	const g = ld64(accounts + 0x10)
	copyr(s30, g + 0x188, 0x20)
	const i = reward_mint.info.key
	copyr(s60, i, 0x20)
	let x = fn_81d00(s10, s30, s60, accounts + 0x20)
	let j = ld64(s10)
	if (j != 2) {
		w = ld64(s10 + 8)
		st64(a, j, w)
		return x
	}
	x = fn_80ca8(s60, reward_mint, ld8(s10 + 8))
	j = ld64(s60)
	if (j == 2) {
		if (ld8(s60 + 8) == 0) {
			x = fn_87630(s70, 0x2f)
			w = ld64(s70 + 8)
			j = ld64(s70)
			if (j != 2) {
				st64(a, j, w)
				return x
			}
		}
		const k: AccountInfo = accounts.reward_mint.info
		const l: LamportsCell = k.lamports
		const o = ld64(accounts + 0x10)
		const n = k.key
		rc_inc(l)
		const m: DataCell = k.data
		rc_inc(m)
		const s = k.owner
		const r = k.rent_epoch
		const q = k.is_signer
		const p = k.is_writable
		st8(s38 + 2, k.executable)
		st8(s38, q, p)
		st64(s60, n, l, m, s, r)
		st64(sff8, ld64(accounts + 0x30))
		st64(sff0, accounts + 0x38)
		st64(s1000, accounts + 8)
		x = fn_78f88(s80, o, accounts + 0x28, s60, accounts + 8, ld64(sff8), accounts + 0x38)
		w = ld64(s80 + 8)
		j = ld64(s80)
		rc_dec(l)
		rc_dec(m)
		if (j != 2) {
			st64(a, j, w)
			return x
		}
		const v = ld64(accounts + 0x10)
		const t = accounts.reward_mint.info.key
		copyr(s30, t, 0x20)
		const u = accounts.reward_vault.key
		copyr(s60, u, 0x20)
		x = fn_5e558(s90, v + 8, c as u8, s30, s60)
		w = ld64(s90 + 8)
		st64(a, ld64(s90))
		st64(a + 8, w)
		return x
	}
	w = ld64(s60 + 8)
	st64(a, j, w)
	return x
}
