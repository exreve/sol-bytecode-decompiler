/// <reference path="../lib.d.ts" />
// instruction collect_reward
import { fn_1495b0, fn_20f8, fn_5a40, fn_60480, fn_652d0, memcpy } from '../shared.ts'

// instruction handler: collect_reward (discriminator sha256("global:collect_reward")[..8] = 0x22b1eb5657840546)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, position, position_token_account, reward_owner_account, reward_vault, token_program, position_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
export function ix_collect_reward(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s18 = fp - 0x18, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let j, t: u64
	sol_log("Instruction: CollectReward", 0x1a)
	const f = ix_args_len
	if (f == 0) {
		const l = fn_1459d0(0x100159468)
		if (2 > (l & 3) - 2) {
			t = anchor_error_from(sc0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			j = ld64(sc0)
			st64(a + 8, ld64(sc0 + 8))
			st64(a, j)
			return t
		}
		if ((l & 3) == 0) {
			t = anchor_error_from(sc0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			j = ld64(sc0)
			st64(a + 8, ld64(sc0 + 8))
			st64(a, j)
			return t
		}
		const m = ld64(ld64(l + 7))
		callx(m, ld64(l - 1), m)
		t = anchor_error_from(sc0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(sc0)
		st64(a + 8, ld64(sc0 + 8))
		st64(a, j)
		return t
	}
	const g = ix_args
	const n = ld8(g)
	st64(s80, accounts, accounts_len)
	st64(s1000, f)
	t = accounts_collect_reward(s38, undef, s80, g, fp)
	let i = ld64(s38 + 0x10)
	j = ld64(s38 + 8)
	const h = ld64(s38)
	if (h == 0) {
		st64(a + 8, i)
		st64(a, j)
		return t
	}
	copyr(s50, s18, 0x18)
	st64(s70, h, j, i)
	const k = ld64(s38 + 0x18)
	st64(s68 + 0x10, k)
	t = fn_60480(s90, k, s68)
	j = ld64(s90)
	if (j == 2) {
		if (3 > n) {
			const o = i + n * 0x18
			let q = ld64(o + 0x98)
			const p = ld64(s50 + 8)
			const r = ld64(p + 0x48)
			st64(o + 0x98, sat_sub(q, r))
			const s = ld64(s50)
			st64(s1000, s40)
			q = min(q, r)
			st64(sff8, q)
			t = fn_652d0(sa0, h, p, s, s40, q)
			i = ld64(sa0 + 8)
			j = ld64(sa0)
			if (j == 2) {
				t = fn_92920(sb0, s70, program_id)
				j = ld64(sb0)
				st64(a + 8, ld64(sb0 + 8))
				st64(a, j)
				return t
			}
			st64(a + 8, i)
			st64(a, j)
			return t
		}
		fn_1495b0(n, 3, 0x100159b10)
	}
	st64(a + 8, ld64(s90 + 8))
	st64(a, j)
	return t
}

// Anchor Accounts::try_accounts of instruction collect_reward (called by ix_collect_reward; name [str]: from the handler's "Instruction: …" log; was fn_91638)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool, position (ConstraintMut, ConstraintHasOne), position_token_account (ConstraintRaw), reward_owner_account (ConstraintMut, ConstraintRaw), reward_vault (ConstraintMut, ConstraintAddress), token_program (ConstraintAddress), position_authority
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_token_account_box, reward_owner_account_box, reward_vault_box, reward_owner_account_box_2, reward_vault
export function accounts_collect_reward(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s270 = fp - 0x270, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4d8 = fp - 0x4d8
	let ac, ad: u64
	if (ld64(e - 0x1000) == 0) {
		const m = fn_1459d0(0x100159468)
		if (2 > (m & 3) - 2) {
			ad = anchor_error_from(s4a0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			ac = ld64(s4a0)
			st64(a + 0x10, ld64(s4a0 + 8))
			st64(a + 8, ac)
			st64(a, 0)
			return ad
		}
		if ((m & 3) == 0) {
			ad = anchor_error_from(s4a0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			ac = ld64(s4a0)
			st64(a + 0x10, ld64(s4a0 + 8))
			st64(a + 8, ac)
			st64(a, 0)
			return ad
		}
		const n = ld64(ld64(m + 7))
		callx(n, ld64(m - 1), n)
		ad = anchor_error_from(s4a0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		ac = ld64(s4a0)
		st64(a + 0x10, ld64(s4a0 + 8))
		st64(a + 8, ac)
		st64(a, 0)
		return ad
	}
	const g = ld8(d)
	try_accounts_11a48(s290, c, c, d, e)
	if (ld64(s290) == 0) {
		ad = Error_with_account_name(s490, ld64(s290 + 8), ld64(s290 + 0x10), 0x100152b28 /* "whirlpool" */, 9)
		ac = ld64(s490)
		st64(a + 0x10, ld64(s490 + 8))
		st64(a + 8, ac)
		st64(a, 0)
		return ad
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	st64(s4d8 + 0x30, g)
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
				ad = Error_with_account_name(s480, ld64(s290 + 8), ld64(s290 + 0x10), "position", 8)
				ac = ld64(s480)
				st64(a + 0x10, ld64(s480 + 8))
				st64(a + 8, ac)
				st64(a, 0)
				return ad
			}
			const j = ld64(0x300000000 /* heap bump-allocator cursor */)
			const l = j != 0 ? sat_sub(j, 0xd8) & -8 : 0x300007f28
			st64(s4d8 + 0x20, k)
			if (l > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, l)
				st64(s4d8 + 0x28, l)
				memcpy(l, s290, 0xd8)
				try_accounts_558(s290, c)
				if (ld32(s270 + 0x90) == 2) {
					ad = Error_with_account_name(s470, ld64(s290), ld64(s290 + 8), "position_token_account", 0x16)
					ac = ld64(s470)
					st64(a + 0x10, ld64(s470 + 8))
					st64(a + 8, ac)
					st64(a, 0)
					return ad
				}
				const o = ld64(0x300000000 /* heap bump-allocator cursor */)
				const position_token_account_box: TokenAccount_2 = o != 0 ? sat_sub(o, 0xd8) & -8 : 0x300007f28
				if (position_token_account_box > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, position_token_account_box)
					st64(s4d8 + 0x18, position_token_account_box)
					memcpy(position_token_account_box, s290, 0xd8)
					try_accounts_11f50(s290, c)
					if (ld32(s270 + 0x70) == 2) {
						ad = Error_with_account_name(s460, ld64(s290), ld64(s290 + 8), "reward_owner_account", 0x14)
						ac = ld64(s460)
						st64(a + 0x10, ld64(s460 + 8))
						st64(a + 8, ac)
						st64(a, 0)
						return ad
					}
					const q = ld64(0x300000000 /* heap bump-allocator cursor */)
					const reward_owner_account_box: TokenAccount = q != 0 ? sat_sub(q, 0xb8) & -8 : 0x300007f48
					if (reward_owner_account_box > 0x300000007) {
						st64(0x300000000 /* heap bump-allocator cursor */, reward_owner_account_box)
						memcpy(reward_owner_account_box, s290, 0xb8)
						fn_20f8(s290, c)
						const reward_vault_box: TokenAccount = ld64(s290 + 8)
						const s = ld64(s290)
						if (s == 2) {
							st64(s4d8 + 0x10, reward_vault_box)
							fn_129a0(s290, c, reward_vault_box)
							const w = ld64(s290 + 8)
							const u = ld64(s290)
							if (u == 2) {
								const v = ld64(s4d8 + 0x28)
								if (ld8(ld64(v) + 0x29) == 0) {
									anchor_error_from(s440, 0x7d0 /* anchor::ConstraintMut */, w, v)
									ad = Error_with_account_name(s450, ld64(s440), ld64(s440 + 8), "position", 8)
									ac = ld64(s450)
									st64(a + 0x10, ld64(s450 + 8))
									st64(a + 8, ac)
									st64(a, 0)
									return ad
								}
								st64(s4d8, w, reward_owner_account_box)
								copyr(s2d0, v + 8, 0x20)
								const x = ld64(ld64(h))
								copyr(s2b0, x, 0x20)
								if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
									anchor_error_from(s310, 0x7d1 /* anchor::ConstraintHasOne */)
									const ab = Error_with_account_name(s320, ld64(s310), ld64(s310 + 8), "position", 8)
									const aa = ld64(s320 + 8)
									const z = ld64(s320)
									copy(s290, s2d0, 0x40)
									ad = fn_13b5c0(s330, z, aa, s290, ab)
									ac = ld64(s330)
									st64(a + 0x10, ld64(s330 + 8))
									st64(a + 8, ac)
									st64(a, 0)
									return ad
								}
								const y: TokenAccount_2 = ld64(s4d8 + 0x18)
								if ((memcmp(y.mint, v + 0x28, 0x20) as u32) == 0) {
									if (y.amount != 1) {
										anchor_error_from(s360, 0x7d3 /* anchor::ConstraintRaw */)
										ad = Error_with_account_name(s370, ld64(s360), ld64(s360 + 8), "position_token_account", 0x16)
										ac = ld64(s370)
										st64(a + 0x10, ld64(s370 + 8))
										st64(a + 8, ac)
										st64(a, 0)
										return ad
									}
									const reward_owner_account_box_2: TokenAccount = ld64(s4d8 + 8)
									if (reward_owner_account_box_2.info.is_writable == 0) {
										anchor_error_from(s420, 0x7d0 /* anchor::ConstraintMut */, reward_owner_account_box_2)
										ad = Error_with_account_name(s430, ld64(s420), ld64(s420 + 8), "reward_owner_account", 0x14)
										ac = ld64(s430)
										st64(a + 0x10, ld64(s430 + 8))
										st64(a + 8, ac)
										st64(a, 0)
										return ad
									}
									const af = ld64(s4d8 + 0x30)
									if (af > 2) {
										fn_1495b0(af, 3, 0x10015a788)
									}
									if ((memcmp(reward_owner_account_box_2.mint, h + 8 + (af << 7), 0x20) as u32) == 0) {
										const reward_vault: AccountInfo = ld64(ld64(s4d8 + 0x10))
										if (reward_vault.is_writable != 0) {
											const ah = reward_vault.key
											copyr(s2d0, ah, 0x20)
											const ai = h + 8 + (ld64(s4d8 + 0x30) << 7)
											copyr(s2b0, ai + 0x20, 0x20)
											if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
												anchor_error_from(s3a0, 0x7dc /* anchor::ConstraintAddress */)
												const ap = Error_with_account_name(s3b0, ld64(s3a0), ld64(s3a0 + 8), "reward_vault", 0xc)
												const ao = ld64(s3b0 + 8)
												const an = ld64(s3b0)
												copy(s290, s2d0, 0x40)
												ad = fn_13b5c0(s3c0, an, ao, s290, ap)
												ac = ld64(s3c0)
												st64(a + 0x10, ld64(s3c0 + 8))
												st64(a + 8, ac)
												st64(a, 0)
												return ad
											}
											const aj = ld64(ld64(s4d8))
											copyr(s2b0, aj, 0x20)
											ad = memcmp(s2b0, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32
											if (ad == 0) {
												st64(a + 0x30, ld64(s4d8))
												st64(a + 0x28, ld64(s4d8 + 0x10))
												st64(a + 0x20, ld64(s4d8 + 8))
												st64(a + 0x18, ld64(s4d8 + 0x18))
												st64(a + 0x10, ld64(s4d8 + 0x28))
												st64(a + 8, ld64(s4d8 + 0x20))
												st64(a, h)
												return ad
											}
											anchor_error_from(s3d0, 0x7dc /* anchor::ConstraintAddress */)
											const am = Error_with_account_name(s3e0, ld64(s3d0), ld64(s3d0 + 8), "token_program", 0xd)
											const al = ld64(s3e0 + 8)
											const ak = ld64(s3e0)
											copyr(s290, s2b0, 0x20)
											st64(s270, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
											ad = fn_13b5c0(s3f0, ak, al, s290, am)
											ac = ld64(s3f0)
											st64(a + 0x10, ld64(s3f0 + 8))
											st64(a + 8, ac)
											st64(a, 0)
											return ad
										}
										anchor_error_from(s400, 0x7d0 /* anchor::ConstraintMut */)
										ad = Error_with_account_name(s410, ld64(s400), ld64(s400 + 8), "reward_vault", 0xc)
										ac = ld64(s410)
										st64(a + 0x10, ld64(s410 + 8))
										st64(a + 8, ac)
										st64(a, 0)
										return ad
									}
									anchor_error_from(s380, 0x7d3 /* anchor::ConstraintRaw */)
									ad = Error_with_account_name(s390, ld64(s380), ld64(s380 + 8), "reward_owner_account", 0x14)
									ac = ld64(s390)
									st64(a + 0x10, ld64(s390 + 8))
									st64(a + 8, ac)
									st64(a, 0)
									return ad
								}
								anchor_error_from(s340, 0x7d3 /* anchor::ConstraintRaw */)
								ad = Error_with_account_name(s350, ld64(s340), ld64(s340 + 8), "position_token_account", 0x16)
								ac = ld64(s350)
								st64(a + 0x10, ld64(s350 + 8))
								st64(a + 8, ac)
								st64(a, 0)
								return ad
							}
							ad = Error_with_account_name(s300, u, w, "token_program", 0xd)
							ac = ld64(s300)
							st64(a + 0x10, ld64(s300 + 8))
							st64(a + 8, ac)
							st64(a, 0)
							return ad
						}
						ad = Error_with_account_name(s2f0, s, reward_vault_box, "reward_vault", 0xc)
						ac = ld64(s2f0)
						st64(a + 0x10, ld64(s2f0 + 8))
						st64(a + 8, ac)
						st64(a, 0)
						return ad
					}
					alloc_handle_alloc_error(8, 0xb8)
				}
				alloc_handle_alloc_error(8, 0xd8)
			}
			alloc_handle_alloc_error(8, 0xd8)
		}
		ad = Error_with_account_name(s2e0, i, k, "position_authority", 0x12)
		ac = ld64(s2e0)
		st64(a + 0x10, ld64(s2e0 + 8))
		st64(a + 8, ac)
		st64(a, 0)
		return ad
	}
	alloc_handle_alloc_error(8, 0x290)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position, reward_owner_account, reward_vault
export function fn_92920(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78
	let n, p: u64
	fn_5a40(s28, ld64(b + 0x10), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const f = ld64(s28)
	if (f != 2) {
		n = Error_with_account_name(s38, f, ld64(s28 + 8), "position", 8)
		p = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, p)
		return n
	}
	const g = ld64(ld64(b + 0x20))
	if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
		const h = common_is_closed(g)
		if (h == 0) {
			fn_143448(s18, g, h)
			const j = ld64(s18 + 0x10)
			const i = ld64(s18)
			if (i != 0x800000000000001a /* Ok */) {
				const k = ld64(s18 + 8)
				st64(s18, i, k, j)
				fn_13b430(s48, s18)
				const l = ld64(s48)
				if (l != 2) {
					n = Error_with_account_name(s58, l, ld64(s48 + 8), "reward_owner_account", 0x14)
					p = ld64(s58)
					st64(a + 8, ld64(s58 + 8))
					st64(a, p)
					return n
				}
			} else {
				st64(j, ld64(j) + 1)
			}
		}
	}
	const q = ld64(ld64(b + 0x28))
	const m = memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20)
	let o = undef
	n = m as u32
	if (n != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return n
	}
	n = common_is_closed(q)
	o = undef
	if (n != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return n
	}
	n = fn_143448(s18, q, n)
	o = ld64(s18 + 0x10)
	const r = ld64(s18)
	if (r != 0x800000000000001a /* Ok */) {
		const s = ld64(s18 + 8)
		st64(s18, r, s, o)
		n = fn_13b430(s68, s18)
		o = undef
		const t = ld64(s68)
		if (t == 2) {
			st64(a + 8, o)
			st64(a, 2)
			return n
		}
		n = Error_with_account_name(s78, t, ld64(s68 + 8), "reward_vault", 0xc)
		p = ld64(s78)
		st64(a + 8, ld64(s78 + 8))
		st64(a, p)
		return n
	}
	st64(o, ld64(o) + 1)
	st64(a + 8, o)
	st64(a, 2)
	return n
}
