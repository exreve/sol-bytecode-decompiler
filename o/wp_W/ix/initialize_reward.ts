/// <reference path="../lib.d.ts" />
// instruction initialize_reward
import { fn_5e558, fn_6aa0, fn_78f88, memcpy } from '../shared.ts'

// instruction handler: initialize_reward (discriminator sha256("global:initialize_reward")[..8] = 0x44e681f2c4c0875f)
// accounts [str: the program's account-error strings, in order of first use]: reward_authority, whirlpool, reward_mint, rent, funder, token_program, reward_vault, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
export function ix_initialize_reward(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s40 = fp - 0x40, s48 = fp - 0x48, s58 = fp - 0x58, s98 = fp - 0x98, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s100 = fp - 0x100
	let h, l: u64
	sol_log("Instruction: InitializeReward", 0x1d)
	if (ix_args_len == 0) {
		const j = fn_1459d0(0x100159468)
		if (2 > (j & 3) - 2) {
			l = anchor_error_from(s100, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s100)
			st64(a + 8, ld64(s100 + 8))
			st64(a, h)
			return l
		}
		if ((j & 3) == 0) {
			l = anchor_error_from(s100, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s100)
			st64(a + 8, ld64(s100 + 8))
			st64(a, h)
			return l
		}
		const k = ld64(ld64(j + 7))
		callx(k, ld64(j - 1), k)
		l = anchor_error_from(s100, 0x66 /* anchor::InstructionDidNotDeserialize */)
		h = ld64(s100)
		st64(a + 8, ld64(s100 + 8))
		st64(a, h)
		return l
	}
	const m = ld8(ix_args)
	st64(sc0, accounts, accounts_len)
	l = accounts_initialize_reward(s58, undef, sc0, undef, fp)
	const g = ld64(s48)
	h = ld64(s58 + 8)
	const f = ld64(s58)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return l
	}
	memcpy(s98, s40, 0x40)
	st64(sb0, f, h, g)
	copyr(s48, sc0, 0x10)
	st64(s58, program_id, sb0)
	l = fn_32bc0(sd0, s58, m)
	h = ld64(sd0)
	if (h == 2) {
		l = fn_6aa0(se0, ld64(sb0 + 0x10), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
		const i = ld64(se0)
		if (i != 2) {
			l = Error_with_account_name(sf0, i, ld64(se0 + 8), 0x100152b28 /* "whirlpool" */, 9)
			h = ld64(sf0)
			st64(a + 8, ld64(sf0 + 8))
			st64(a, h)
			return l
		}
		st64(a + 8, g)
		st64(a, 2)
		return l
	}
	st64(a + 8, ld64(sd0 + 8))
	st64(a, h)
	return l
}

// Anchor Accounts::try_accounts of instruction initialize_reward (called by ix_initialize_reward; name [str]: from the handler's "Instruction: …" log; was fn_ab5c8)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: reward_authority (ConstraintAddress), whirlpool (ConstraintMut), reward_mint, rent, funder (ConstraintMut), token_program (ConstraintAddress), reward_vault (ConstraintMut), system_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: reward_mint_box, reward_authority
export function accounts_initialize_reward(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s270 = fp - 0x270, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s450 = fp - 0x450
	let ab, ac: u64
	try_accounts_11718(s290, c, c, d, e)
	const reward_authority: AccountInfo = ld64(s290 + 8)
	const f = ld64(s290)
	if (f != 2) {
		ac = Error_with_account_name(s2e0, f, reward_authority, "reward_authority", 0x10)
		ab = ld64(s2e0)
		st64(a + 0x10, ld64(s2e0 + 8))
		st64(a + 8, ab)
		st64(a, 0)
		return ac
	}
	try_accounts_11718(s290, c)
	const i = ld64(s290 + 8)
	const g = ld64(s290)
	if (g == 2) {
		try_accounts_11a48(s290, c)
		if (ld64(s290) == 0) {
			ac = Error_with_account_name(s410, ld64(s290 + 8), ld64(s290 + 0x10), 0x100152b28 /* "whirlpool" */, 9)
			ab = ld64(s410)
			st64(a + 0x10, ld64(s410 + 8))
			st64(a + 8, ab)
			st64(a, 0)
			return ac
		}
		const h = ld64(0x300000000 /* heap bump-allocator cursor */)
		const j = h != 0 ? sat_sub(h, 0x290) & -8 : 0x300007d70
		st64(s450 + 0x38, i)
		if (j > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(s450 + 0x30, j)
			memcpy(j, s290, 0x290)
			try_accounts_11e98(s290, c)
			if (ld32(s290) == 2) {
				ac = Error_with_account_name(s400, ld64(s290 + 8), ld64(s290 + 0x10), "reward_mint", 0xb)
				ab = ld64(s400)
				st64(a + 0x10, ld64(s400 + 8))
				st64(a + 8, ab)
				st64(a, 0)
				return ac
			}
			const l = ld64(0x300000000 /* heap bump-allocator cursor */)
			const reward_mint_box: Mint = l != 0 ? sat_sub(l, 0x60) & -8 : 0x300007fa0
			if (reward_mint_box > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, reward_mint_box)
				memcpy(reward_mint_box, s290, 0x60)
				try_accounts_11718(s290, c)
				const o = ld64(s290 + 8)
				const n = ld64(s290)
				if (n == 2) {
					st64(s450 + 0x28, o)
					fn_129a0(s290, c, o)
					const q = ld64(s290 + 8)
					const p = ld64(s290)
					if (p == 2) {
						st64(s450 + 0x20, q)
						fn_122e8(s290, c, q)
						const s = ld64(s290 + 8)
						const r = ld64(s290)
						if (r == 2) {
							st64(s450 + 0x18, s)
							try_accounts_11990(s290, c, s)
							const v = ld64(s290 + 0x10)
							const u = ld64(s290 + 8)
							const t = ld64(s290)
							if (t == 0) {
								ac = Error_with_account_name(s3f0, u, v, 0x100152d60 /* "rent" */, 4)
								ab = ld64(s3f0)
								st64(a + 0x10, ld64(s3f0 + 8))
								st64(a + 8, ab)
								st64(a, 0)
								return ac
							}
							st64(s450, u, v)
							st64(s450 + 0x10, ld64(s290 + 0x18))
							const w = reward_authority.key
							copyr(s2d0, w, 0x20)
							const x = ld64(s450 + 0x30)
							copyr(s2b0, x + 0x48, 0x20)
							if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
								if (ld8(ld64(s450 + 0x38) + 0x29) == 0) {
									anchor_error_from(s3d0, 0x7d0 /* anchor::ConstraintMut */)
									ac = Error_with_account_name(s3e0, ld64(s3d0), ld64(s3d0 + 8), "funder", 6)
									ab = ld64(s3e0)
									st64(a + 0x10, ld64(s3e0 + 8))
									st64(a + 8, ab)
									st64(a, 0)
									return ac
								}
								if (ld8(ld64(ld64(s450 + 0x30)) + 0x29) != 0) {
									if (ld8(ld64(s450 + 0x28) + 0x29) != 0) {
										const ad = ld64(ld64(s450 + 0x20))
										copyr(s2b0, ad, 0x20)
										ac = memcmp(s2b0, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32
										if (ac != 0) {
											anchor_error_from(s360, 0x7dc /* anchor::ConstraintAddress */)
											const ag = Error_with_account_name(s370, ld64(s360), ld64(s360 + 8), "token_program", 0xd)
											const af = ld64(s370 + 8)
											const ae = ld64(s370)
											copyr(s290, s2b0, 0x20)
											st64(s270, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
											ac = fn_13b5c0(s380, ae, af, s290, ag)
											ab = ld64(s380)
											st64(a + 0x10, ld64(s380 + 8))
											st64(a + 8, ab)
											st64(a, 0)
											return ac
										}
										st64(a + 0x50, ld64(s450 + 0x10))
										st64(a + 0x48, ld64(s450 + 8))
										st64(a + 0x40, ld64(s450))
										st64(a + 0x38, t)
										st64(a + 0x30, ld64(s450 + 0x18))
										st64(a + 0x28, ld64(s450 + 0x20))
										st64(a + 0x20, ld64(s450 + 0x28))
										st64(a + 0x18, reward_mint_box)
										st64(a + 0x10, ld64(s450 + 0x30))
										st64(a + 8, ld64(s450 + 0x38))
										st64(a, reward_authority)
										return ac
									}
									anchor_error_from(s390, 0x7d0 /* anchor::ConstraintMut */)
									ac = Error_with_account_name(s3a0, ld64(s390), ld64(s390 + 8), "reward_vault", 0xc)
									ab = ld64(s3a0)
									st64(a + 0x10, ld64(s3a0 + 8))
									st64(a + 8, ab)
									st64(a, 0)
									return ac
								}
								anchor_error_from(s3b0, 0x7d0 /* anchor::ConstraintMut */)
								ac = Error_with_account_name(s3c0, ld64(s3b0), ld64(s3b0 + 8), 0x100152b28 /* "whirlpool" */, 9)
								ab = ld64(s3c0)
								st64(a + 0x10, ld64(s3c0 + 8))
								st64(a + 8, ab)
								st64(a, 0)
								return ac
							}
							anchor_error_from(s330, 0x7dc /* anchor::ConstraintAddress */)
							const aa = Error_with_account_name(s340, ld64(s330), ld64(s330 + 8), "reward_authority", 0x10)
							const z = ld64(s340 + 8)
							const y = ld64(s340)
							copy(s290, s2d0, 0x40)
							ac = fn_13b5c0(s350, y, z, s290, aa)
							ab = ld64(s350)
							st64(a + 0x10, ld64(s350 + 8))
							st64(a + 8, ab)
							st64(a, 0)
							return ac
						}
						ac = Error_with_account_name(s320, r, s, "system_program", 0xe)
						ab = ld64(s320)
						st64(a + 0x10, ld64(s320 + 8))
						st64(a + 8, ab)
						st64(a, 0)
						return ac
					}
					ac = Error_with_account_name(s310, p, q, "token_program", 0xd)
					ab = ld64(s310)
					st64(a + 0x10, ld64(s310 + 8))
					st64(a + 8, ab)
					st64(a, 0)
					return ac
				}
				ac = Error_with_account_name(s300, n, o, "reward_vault", 0xc)
				ab = ld64(s300)
				st64(a + 0x10, ld64(s300 + 8))
				st64(a + 8, ab)
				st64(a, 0)
				return ac
			}
			alloc_handle_alloc_error(8, 0x60)
		}
		alloc_handle_alloc_error(8, 0x290)
	}
	ac = Error_with_account_name(s2f0, g, i, "funder", 6)
	ab = ld64(s2f0)
	st64(a + 0x10, ld64(s2f0 + 8))
	st64(a + 8, ab)
	st64(a, 0)
	return ac
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
// types [heur]: b: InitializeRewardContext (the handler ix_initialize_reward passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_32bc0(a: u64, b: InitializeRewardContext, c: u64): u64 {
	const s20 = fp - 0x20, s28 = fp - 0x28, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s90 = fp - 0x90, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	const accounts: InitializeRewardAccounts = b.accounts
	const g: AccountInfo = accounts.reward_mint.info
	const h: LamportsCell = g.lamports
	const l = ld64(accounts + 0x10)
	const k = g.key
	rc_inc(h)
	const i: DataCell = g.data
	const j = i.strong
	st64(s90, c, k, l, a)
	rc_inc(i, j)
	const p = g.owner
	const o = g.rent_epoch
	const n = g.is_signer
	const m = g.is_writable
	st8(s28 + 2, g.executable)
	st8(s28, n, m)
	st64(s40, i, p, o)
	st64(s50, ld64(s90 + 8))
	st64(s50 + 8, h)
	st64(sff8, ld64(accounts + 0x28))
	st64(sff0, accounts + 0x30)
	st64(s1000, accounts + 8)
	let w = fn_78f88(s60, ld64(s90 + 0x10), accounts + 0x20, s50, accounts + 8, ld64(sff8), accounts + 0x30)
	let v = ld64(s60 + 8)
	const q = ld64(s60)
	rc_dec(h)
	const u = ld64(s90 + 0x18)
	rc_dec(i)
	if (q != 2) {
		st64(u, q, v)
		return w
	}
	const t = ld64(accounts + 0x10)
	const r = accounts.reward_mint.info.key
	copyr(s20, r, 0x20)
	const s = accounts.reward_vault.key
	copyr(s50, s, 0x20)
	w = fn_5e558(s70, t + 8, ld64(s90) as u8, s20, s50)
	v = ld64(s70 + 8)
	st64(u, ld64(s70))
	st64(u + 8, v)
	return w
}
