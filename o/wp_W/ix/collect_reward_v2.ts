/// <reference path="../lib.d.ts" />
// instruction collect_reward_v2
import { fn_11150, fn_12758, fn_1495b0, fn_2258, fn_5a40, fn_60480, fn_7a5e0, fn_7e5e0, fn_c9a0, memcpy } from '../shared.ts'

// instruction handler: collect_reward_v2 (discriminator sha256("global:collect_reward_v2")[..8] = 0xd13113a0b4256bb1)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, position, position_token_account, reward_owner_account, reward_mint, reward_vault, reward_token_program, memo_program, position_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
export function ix_collect_reward_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s18 = fp - 0x18, s48 = fp - 0x48, s50 = fp - 0x50, s60 = fp - 0x60, s90 = fp - 0x90, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, s1000 = fp - 0x1000
	let k, l, p, q, r, s: u64
	sol_log("Instruction: CollectRewardV2", 0x1c)
	const f = ix_args_len
	if (f == 0) {
		const m = fn_1459d0(0x100159468)
		l = m
	} else {
		const g = ix_args
		const u = ld8(g)
		st64(sa8, g + 1, f - 1)
		fn_11150(s60, sa8)
		l = ld64(s60 + 8)
		const h = ld64(s60)
		if (h != 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
			const t = ld64(s50)
			st64(sb8, accounts, accounts_len)
			st64(s1000, f)
			s = accounts_collect_reward_v2(s60, h, sb8, g, fp)
			const j = ld64(s50)
			k = ld64(s60 + 8)
			const i = ld64(s60)
			if (i == 0) {
				st64(a + 8, j)
				st64(a, k)
				return s
			}
			memcpy(s90, s48, 0x30)
			st64(sa8, i, k, j)
			copyr(s50, sb8, 0x10)
			st64(s60, program_id, sa8)
			st64(s18, h, l, t)
			s = fn_3ba00(sc8, s60, u, s18)
			k = ld64(sc8)
			if (k != 2) {
				st64(a + 8, ld64(sc8 + 8))
				st64(a, k)
				return s
			}
			s = fn_d9230(sd8, sa8, program_id)
			k = ld64(sd8)
			st64(a + 8, ld64(sd8 + 8))
			st64(a, k)
			return s
		}
	}
	const n = l
	if (2 > (l & 3) - 2) {
		s = anchor_error_from(se8, 0x66 /* anchor::InstructionDidNotDeserialize */, p, q, r)
		k = ld64(se8)
		st64(a + 8, ld64(se8 + 8))
		st64(a, k)
		return s
	}
	if ((n & 3) == 0) {
		s = anchor_error_from(se8, 0x66 /* anchor::InstructionDidNotDeserialize */, p, q, r)
		k = ld64(se8)
		st64(a + 8, ld64(se8 + 8))
		st64(a, k)
		return s
	}
	const o = ld64(ld64(l + 7))
	callx(o, ld64(l - 1), o)
	s = anchor_error_from(se8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	k = ld64(se8)
	st64(a + 8, ld64(se8 + 8))
	st64(a, k)
	return s
}

// Anchor Accounts::try_accounts of instruction collect_reward_v2 (called by ix_collect_reward_v2; name [str]: from the handler's "Instruction: …" log; was fn_d7b20)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool, position (ConstraintMut, ConstraintHasOne), position_token_account (ConstraintRaw), reward_owner_account (ConstraintMut, ConstraintRaw), reward_mint (ConstraintAddress), reward_vault (ConstraintMut, ConstraintAddress), reward_token_program (ConstraintAddress), memo_program, position_authority
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_token_account_box, reward_owner_account_box, reward_mint_box, reward_vault_box, reward_vault
export function accounts_collect_reward_v2(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s538 = fp - 0x538, s540 = fp - 0x540
	let ag, ah: u64
	if (ld64(e - 0x1000) == 0) {
		const m = fn_1459d0(0x100159468)
		if (2 > (m & 3) - 2) {
			ah = anchor_error_from(s4f0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			ag = ld64(s4f0)
			st64(a + 0x10, ld64(s4f0 + 8))
			st64(a + 8, ag)
			st64(a, 0)
			return ah
		}
		if ((m & 3) == 0) {
			ah = anchor_error_from(s4f0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			ag = ld64(s4f0)
			st64(a + 0x10, ld64(s4f0 + 8))
			st64(a + 8, ag)
			st64(a, 0)
			return ah
		}
		const n = ld64(ld64(m + 7))
		callx(n, ld64(m - 1), n)
		ah = anchor_error_from(s4f0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		ag = ld64(s4f0)
		st64(a + 0x10, ld64(s4f0 + 8))
		st64(a + 8, ag)
		st64(a, 0)
		return ah
	}
	const g = ld8(d)
	try_accounts_11a48(s290, c, c, d, e)
	if (ld64(s290) == 0) {
		ah = Error_with_account_name(s4e0, ld64(s290 + 8), ld64(s290 + 0x10), 0x100152b28 /* "whirlpool" */, 9)
		ag = ld64(s4e0)
		st64(a + 0x10, ld64(s4e0 + 8))
		st64(a + 8, ag)
		st64(a, 0)
		return ah
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	st64(s538 + 0x40, g)
	const h = f != 0 ? sat_sub(f, 0x290) & -8 : 0x300007d70
	if (h > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		memcpy(h, s290, 0x290)
		try_accounts_11718(s290, c)
		const k = ld64(s290 + 8)
		const i = ld64(s290)
		if (i == 2) {
			try_accounts_11b00(s290, c)
			if (ld64(s290) == 0) {
				ah = Error_with_account_name(s4d0, ld64(s290 + 8), ld64(s290 + 0x10), "position", 8)
				ag = ld64(s4d0)
				st64(a + 0x10, ld64(s4d0 + 8))
				st64(a + 8, ag)
				st64(a, 0)
				return ah
			}
			const j = ld64(0x300000000 /* heap bump-allocator cursor */)
			const l = j != 0 ? sat_sub(j, 0xd8) & -8 : 0x300007f28
			st64(s538 + 0x30, k)
			if (l > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, l)
				st64(s538 + 0x38, l)
				memcpy(l, s290, 0xd8)
				try_accounts_558(s290, c)
				if (ld32(s290 + 0xb0) == 2) {
					ah = Error_with_account_name(s4c0, ld64(s290), ld64(s290 + 8), "position_token_account", 0x16)
					ag = ld64(s4c0)
					st64(a + 0x10, ld64(s4c0 + 8))
					st64(a + 8, ag)
					st64(a, 0)
					return ah
				}
				const o = ld64(0x300000000 /* heap bump-allocator cursor */)
				const position_token_account_box: TokenAccount_2 = o != 0 ? sat_sub(o, 0xd8) & -8 : 0x300007f28
				if (position_token_account_box > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, position_token_account_box)
					st64(s538 + 0x28, position_token_account_box)
					memcpy(position_token_account_box, s290, 0xd8)
					try_accounts_558(s290, c)
					if (ld32(s290 + 0xb0) == 2) {
						ah = Error_with_account_name(s4b0, ld64(s290), ld64(s290 + 8), "reward_owner_account", 0x14)
						ag = ld64(s4b0)
						st64(a + 0x10, ld64(s4b0 + 8))
						st64(a + 8, ag)
						st64(a, 0)
						return ah
					}
					const q = ld64(0x300000000 /* heap bump-allocator cursor */)
					const reward_owner_account_box: TokenAccount_2 = q != 0 ? sat_sub(q, 0xd8) & -8 : 0x300007f28
					if (reward_owner_account_box > 0x300000007) {
						st64(0x300000000 /* heap bump-allocator cursor */, reward_owner_account_box)
						memcpy(reward_owner_account_box, s290, 0xd8)
						fn_2518(s290, c)
						const reward_mint_box: Mint = ld64(s290 + 8)
						const s = ld64(s290)
						if (s == 2) {
							st64(s538 + 0x20, reward_mint_box)
							fn_2258(s290, c, reward_mint_box)
							const reward_vault_box: TokenAccount_2 = ld64(s290 + 8)
							const u = ld64(s290)
							if (u == 2) {
								st64(s538 + 0x18, reward_vault_box)
								try_accounts_120(s290, c, reward_vault_box)
								const x = ld64(s290 + 8)
								const w = ld64(s290)
								if (w == 2) {
									st64(s538 + 0x10, x)
									fn_12758(s290, c, x)
									const aa = ld64(s290 + 8)
									const y = ld64(s290)
									if (y == 2) {
										const z = ld64(s538 + 0x38)
										if (ld8(ld64(z) + 0x29) == 0) {
											anchor_error_from(s490, 0x7d0 /* anchor::ConstraintMut */, aa, z)
											ah = Error_with_account_name(s4a0, ld64(s490), ld64(s490 + 8), "position", 8)
											ag = ld64(s4a0)
											st64(a + 0x10, ld64(s4a0 + 8))
											st64(a + 8, ag)
											st64(a, 0)
											return ah
										}
										st64(s538, aa, reward_owner_account_box)
										copyr(s2d0, z + 8, 0x20)
										const ab = ld64(ld64(h))
										copyr(s2b0, ab, 0x20)
										if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
											anchor_error_from(s330, 0x7d1 /* anchor::ConstraintHasOne */)
											const af = Error_with_account_name(s340, ld64(s330), ld64(s330 + 8), "position", 8)
											const ae = ld64(s340 + 8)
											const ad = ld64(s340)
											copy(s290, s2d0, 0x40)
											ah = fn_13b5c0(s350, ad, ae, s290, af)
											ag = ld64(s350)
											st64(a + 0x10, ld64(s350 + 8))
											st64(a + 8, ag)
											st64(a, 0)
											return ah
										}
										const ac: TokenAccount_2 = ld64(s538 + 0x28)
										if ((memcmp(ac.mint, z + 0x28, 0x20) as u32) == 0) {
											if (ac.amount != 1) {
												anchor_error_from(s380, 0x7d3 /* anchor::ConstraintRaw */)
												ah = Error_with_account_name(s390, ld64(s380), ld64(s380 + 8), "position_token_account", 0x16)
												ag = ld64(s390)
												st64(a + 0x10, ld64(s390 + 8))
												st64(a + 8, ag)
												st64(a, 0)
												return ah
											}
											if (ld8(ld64(ld64(s538 + 8) + 0x20) + 0x29) == 0) {
												anchor_error_from(s470, 0x7d0 /* anchor::ConstraintMut */)
												ah = Error_with_account_name(s480, ld64(s470), ld64(s470 + 8), "reward_owner_account", 0x14)
												ag = ld64(s480)
												st64(a + 0x10, ld64(s480 + 8))
												st64(a + 8, ag)
												st64(a, 0)
												return ah
											}
											if (ld64(s538 + 0x40) > 2) {
												fn_1495b0(ld64(s538 + 0x40), 3, 0x10015a7b8)
											}
											const ai = h + 8 + (ld64(s538 + 0x40) << 7)
											if ((memcmp(ld64(s538 + 8) + 0x28, ai, 0x20) as u32) == 0) {
												const aj = ld64(ld64(s538 + 0x20) + 0x58)
												st64(s540, aj)
												const ak = ld64(aj)
												copyr(s2d0, ak, 0x20)
												copyr(s2b0, ai, 0x20)
												if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
													anchor_error_from(s3c0, 0x7dc /* anchor::ConstraintAddress */)
													const ay = Error_with_account_name(s3d0, ld64(s3c0), ld64(s3c0 + 8), "reward_mint", 0xb)
													const ax = ld64(s3d0 + 8)
													const aw = ld64(s3d0)
													copy(s290, s2d0, 0x40)
													ah = fn_13b5c0(s3e0, aw, ax, s290, ay)
													ag = ld64(s3e0)
													st64(a + 0x10, ld64(s3e0 + 8))
													st64(a + 8, ag)
													st64(a, 0)
													return ah
												}
												const reward_vault: AccountInfo = ld64(ld64(s538 + 0x18) + 0x20)
												if (reward_vault.is_writable == 0) {
													anchor_error_from(s450, 0x7d0 /* anchor::ConstraintMut */)
													ah = Error_with_account_name(s460, ld64(s450), ld64(s450 + 8), "reward_vault", 0xc)
													ag = ld64(s460)
													st64(a + 0x10, ld64(s460 + 8))
													st64(a + 8, ag)
													st64(a, 0)
													return ah
												}
												const am = reward_vault.key
												copyr(s2d0, am, 0x20)
												const an = h + 8 + (ld64(s538 + 0x40) << 7)
												copyr(s2b0, an + 0x20, 0x20)
												if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
													anchor_error_from(s3f0, 0x7dc /* anchor::ConstraintAddress */)
													const bb = Error_with_account_name(s400, ld64(s3f0), ld64(s3f0 + 8), "reward_vault", 0xc)
													const ba = ld64(s400 + 8)
													const az = ld64(s400)
													copy(s290, s2d0, 0x40)
													ah = fn_13b5c0(s410, az, ba, s290, bb)
													ag = ld64(s410)
													st64(a + 0x10, ld64(s410 + 8))
													st64(a + 8, ag)
													st64(a, 0)
													return ah
												}
												const ao = ld64(ld64(s538 + 0x10))
												copyr(s2d0, ao, 0x20)
												AccountInfo_clone(s290, ld64(s540))
												const ap = ld64(s290 + 0x18)
												copy(s2b0, ap, 0x20)
												const ar = ld64(s290 + 0x10)
												const aq = ld64(s290 + 8)
												rc_dec(aq)
												rc_dec(ar)
												ah = memcmp(s2d0, s2b0, 0x20) as u32
												if (ah == 0) {
													st64(a + 0x40, ld64(s538))
													st64(a + 0x38, ld64(s538 + 0x10))
													st64(a + 0x30, ld64(s538 + 0x18))
													st64(a + 0x28, ld64(s538 + 0x20))
													st64(a + 0x20, ld64(s538 + 8))
													st64(a + 0x18, ld64(s538 + 0x28))
													st64(a + 0x10, ld64(s538 + 0x38))
													st64(a + 8, ld64(s538 + 0x30))
													st64(a, h)
													return ah
												}
												anchor_error_from(s420, 0x7dc /* anchor::ConstraintAddress */)
												const av = Error_with_account_name(s430, ld64(s420), ld64(s420 + 8), "reward_token_program", 0x14)
												const au = ld64(s430 + 8)
												const at = ld64(s430)
												copy(s290, s2d0, 0x40)
												ah = fn_13b5c0(s440, at, au, s290, av)
												ag = ld64(s440)
												st64(a + 0x10, ld64(s440 + 8))
												st64(a + 8, ag)
												st64(a, 0)
												return ah
											}
											anchor_error_from(s3a0, 0x7d3 /* anchor::ConstraintRaw */)
											ah = Error_with_account_name(s3b0, ld64(s3a0), ld64(s3a0 + 8), "reward_owner_account", 0x14)
											ag = ld64(s3b0)
											st64(a + 0x10, ld64(s3b0 + 8))
											st64(a + 8, ag)
											st64(a, 0)
											return ah
										}
										anchor_error_from(s360, 0x7d3 /* anchor::ConstraintRaw */)
										ah = Error_with_account_name(s370, ld64(s360), ld64(s360 + 8), "position_token_account", 0x16)
										ag = ld64(s370)
										st64(a + 0x10, ld64(s370 + 8))
										st64(a + 8, ag)
										st64(a, 0)
										return ah
									}
									ah = Error_with_account_name(s320, y, aa, "memo_program", 0xc)
									ag = ld64(s320)
									st64(a + 0x10, ld64(s320 + 8))
									st64(a + 8, ag)
									st64(a, 0)
									return ah
								}
								ah = Error_with_account_name(s310, w, x, "reward_token_program", 0x14)
								ag = ld64(s310)
								st64(a + 0x10, ld64(s310 + 8))
								st64(a + 8, ag)
								st64(a, 0)
								return ah
							}
							ah = Error_with_account_name(s300, u, reward_vault_box, "reward_vault", 0xc)
							ag = ld64(s300)
							st64(a + 0x10, ld64(s300 + 8))
							st64(a + 8, ag)
							st64(a, 0)
							return ah
						}
						ah = Error_with_account_name(s2f0, s, reward_mint_box, "reward_mint", 0xb)
						ag = ld64(s2f0)
						st64(a + 0x10, ld64(s2f0 + 8))
						st64(a + 8, ag)
						st64(a, 0)
						return ah
					}
					alloc_handle_alloc_error(8, 0xd8)
				}
				alloc_handle_alloc_error(8, 0xd8)
			}
			alloc_handle_alloc_error(8, 0xd8)
		}
		ah = Error_with_account_name(s2e0, i, k, "position_authority", 0x12)
		ag = ld64(s2e0)
		st64(a + 0x10, ld64(s2e0 + 8))
		st64(a + 8, ag)
		st64(a, 0)
		return ah
	}
	alloc_handle_alloc_error(8, 0x290)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
// types [heur]: b: CollectRewardV2Context (the handler ix_collect_reward_v2 passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_3ba00(a: u64, b: CollectRewardV2Context, c: u64, d: u64): u64 {
	const s120 = fp - 0x120, s138 = fp - 0x138, s240 = fp - 0x240, s258 = fp - 0x258, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290
	const accounts: CollectRewardV2Accounts = b.accounts
	let t = fn_60480(s280, accounts.position_token_account, accounts + 8)
	let g = ld64(s280)
	if (g != 2) {
		st64(a + 8, ld64(s280 + 8))
		st64(a, g)
		return t
	}
	const i = b.remaining_accounts_len
	const remaining_accounts: AccountInfo = b.remaining_accounts
	t = fn_7a5e0(s138, remaining_accounts, i, d, 0x100152331, 1, accounts, b)
	let k = ld64(s138 + 0x10)
	g = ld64(s138 + 8)
	const j = ld64(s138)
	if (j == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
		st64(a + 8, k)
		st64(a, g)
		return t
	}
	memcpy(s258, s120, 0x120)
	st64(s270, j, g, k)
	if (3 > (c as u8)) {
		const l = ld64(accounts + 0x10) + (c as u8) * 0x18
		const n = accounts.reward_vault.amount
		const m = ld64(l + 0x98)
		st64(l + 0x98, sat_sub(m, n))
		const reward_vault: TokenAccount_2 = accounts.reward_vault
		const reward_mint: Mint = accounts.reward_mint
		const p = ld64(accounts)
		const reward_owner_account: TokenAccount_2 = accounts.reward_owner_account
		const s = fn_7e5e0(s290, p, reward_mint, reward_vault, reward_owner_account, accounts + 0x38, accounts + 0x40, s240, min(m, n), "Orca CollectReward", 0x12)
		k = ld64(s290 + 8)
		g = ld64(s290)
		t = fn_c9a0(s270, s)
		st64(a + 8, k)
		st64(a, g)
		return t
	}
	fn_1495b0(c as u8, 3, 0x100159bc0)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position, reward_owner_account, reward_vault
export function fn_d9230(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78
	let p, r: u64
	fn_5a40(s28, ld64(b + 0x10), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const f = ld64(s28)
	if (f != 2) {
		p = Error_with_account_name(s38, f, ld64(s28 + 8), "position", 8)
		r = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, r)
		return p
	}
	const g = ld64(b + 0x20)
	const h = ld64(g + 0x20)
	if ((memcmp(g, c, 0x20) as u32) == 0) {
		const i = common_is_closed(h)
		if (i == 0) {
			fn_143448(s18, h, i)
			const k = ld64(s18 + 0x10)
			const j = ld64(s18)
			if (j != 0x800000000000001a /* Ok */) {
				const l = ld64(s18 + 8)
				st64(s18, j, l, k)
				fn_13b430(s48, s18)
				const m = ld64(s48)
				if (m != 2) {
					p = Error_with_account_name(s58, m, ld64(s48 + 8), "reward_owner_account", 0x14)
					r = ld64(s58)
					st64(a + 8, ld64(s58 + 8))
					st64(a, r)
					return p
				}
			} else {
				st64(k, ld64(k) + 1)
			}
		}
	}
	const n = ld64(b + 0x30)
	const s = ld64(n + 0x20)
	const o = memcmp(n, c, 0x20)
	let q = undef
	p = o as u32
	if (p != 0) {
		st64(a + 8, q)
		st64(a, 2)
		return p
	}
	p = common_is_closed(s)
	q = undef
	if (p != 0) {
		st64(a + 8, q)
		st64(a, 2)
		return p
	}
	p = fn_143448(s18, s, p)
	q = ld64(s18 + 0x10)
	const t = ld64(s18)
	if (t != 0x800000000000001a /* Ok */) {
		const u = ld64(s18 + 8)
		st64(s18, t, u, q)
		p = fn_13b430(s68, s18)
		q = undef
		const v = ld64(s68)
		if (v == 2) {
			st64(a + 8, q)
			st64(a, 2)
			return p
		}
		p = Error_with_account_name(s78, v, ld64(s68 + 8), "reward_vault", 0xc)
		r = ld64(s78)
		st64(a + 8, ld64(s78 + 8))
		st64(a, r)
		return p
	}
	st64(q, ld64(q) + 1)
	st64(a + 8, q)
	st64(a, 2)
	return p
}
