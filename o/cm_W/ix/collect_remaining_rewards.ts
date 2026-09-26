/// <reference path="../lib.d.ts" />
// instruction collect_remaining_rewards
import { anchor_error_from, fn_13e5a0, fn_13e628, fn_14ec98, fn_14ed60, fn_4130, fn_53e8, fn_6c2a0, fn_7a038, fn_85138, fn_88360, fn_88558, fn_a80, memcpy } from '../shared.ts'

// instruction handler: collect_remaining_rewards (discriminator sha256("global:collect_remaining_rewards")[..8] = 0x90d51022c5a6ed12)
// accounts [idl]: 0 reward_funder [signer], 1 funder_token_account [mut], 2 pool_state [mut], 3 reward_token_vault [mut], 4 reward_vault_mint, 5 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 6 token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb], 7 memo_program [= MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr]
// args [idl]: reward_index: u8
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, reward_index
export function ix_collect_remaining_rewards(a: u64, program_id: u64, accounts: u64, accounts_len: u64, args: CollectRemainingRewardsArgs, ix_args_len: u64): u64 {
	const s28 = fp - 0x28, s30 = fp - 0x30, s40 = fp - 0x40, s68 = fp - 0x68, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0
	let i, m: u64
	const f = sol_log("Instruction: CollectRemainingRewards", 0x24)
	if (ix_args_len == 0) {
		const k = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		if (2 > (k & 3) - 2) {
			m = anchor_error_from(sc0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			i = ld64(sc0)
			st64(a + 8, ld64(sc0 + 8))
			st64(a, i)
			return m
		}
		if ((k & 3) == 0) {
			m = anchor_error_from(sc0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			i = ld64(sc0)
			st64(a + 8, ld64(sc0 + 8))
			st64(a, i)
			return m
		}
		const l = ld64(ld64(k + 7))
		if (l == 0) {
			m = anchor_error_from(sc0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			i = ld64(sc0)
			st64(a + 8, ld64(sc0 + 8))
			st64(a, i)
			return m
		}
		callx(l, ld64(k - 1), l)
		m = anchor_error_from(sc0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(sc0)
		st64(a + 8, ld64(sc0 + 8))
		st64(a, i)
		return m
	}
	const reward_index = args.reward_index
	st64(s90, accounts, accounts_len)
	m = accounts_collect_remaining_rewards(s40, undef, s90, undef, fp, f)
	const h = ld64(s30)
	i = ld64(s40 + 8)
	const g = ld64(s40)
	if (g == 0) {
		st64(a + 8, h)
		st64(a, i)
		return m
	}
	copyr(s68, s28, 0x28)
	st64(s80, g, i, h)
	copyr(s30, s90, 0x10)
	st64(s40, program_id, s80)
	m = fn_49b88(sa0, s40, reward_index)
	i = ld64(sa0)
	if (i == 2) {
		m = fn_c1ac0(sb0, s80, program_id)
		i = ld64(sb0)
		st64(a + 8, ld64(sb0 + 8))
		st64(a, i)
		return m
	}
	st64(a + 8, ld64(sa0 + 8))
	st64(a, i)
	return m
}

// Anchor Accounts::try_accounts of instruction collect_remaining_rewards (called by ix_collect_remaining_rewards; name [str]: from the handler's "Instruction: …" log; was fn_c05e0)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_program (ConstraintAddress), token_program_2022, memo_program, reward_vault_mint (ConstraintAddress), reward_token_vault (ConstraintMut), pool_state (ConstraintMut), funder_token_account (ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: pool_state [idl]
export function accounts_collect_remaining_rewards(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const sb8 = fp - 0xb8, sd8 = fp - 0xd8, sf8 = fp - 0xf8, s118 = fp - 0x118, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s230 = fp - 0x230, s238 = fp - 0x238, s240 = fp - 0x240, s248 = fp - 0x248, s250 = fp - 0x250, s258 = fp - 0x258
	let n, aa, ab, ad, ae, ag, ah: u64
	let pool_state: AccountInfo
	let q = try_accounts_17a30(sd8, c, c, d, e, r0)
	const i = ld64(sd8 + 8)
	let f = ld64(sd8)
	if (f == 2) {
		q = try_accounts_1678(sd8, c)
		if (ld32(sb8 + 0x90) == 2) {
			const l = ld64(0x300000000 /* heap bump-allocator cursor */)
			f = ld64(sd8)
			const m = l != 0 ? sat_sub(l, 0x14) : 0x300007fec
			n = ld64(sd8 + 8)
			if (f != 0) {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m + 8, 0x6363615f6e656b6f)
				st64(m, 0x745f7265646e7566)
				st32(m + 0x10, 0x746e756f)
				void ld64(n)
			} else {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m + 8, 0x6363615f6e656b6f)
				st64(m, 0x745f7265646e7566)
				st32(m + 0x10, 0x746e756f)
				void ld64(n)
			}
			st64(n + 0x10, m, 0x14)
			st64(n + 8, 0x14)
			st64(n, 1)
			st64(a + 0x10, n)
			st64(a + 8, f)
			st64(a, 0)
			return q
		}
		const j = ld64(0x300000000 /* heap bump-allocator cursor */)
		const k = j != 0 ? sat_sub(j, 0xd8) : 0x300007f28
		if (0x300000008 > k) {
			alloc_handle_alloc_error(8, 0xd8)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, k & -8)
		if ((k & -8) != 0) {
			memcpy(k & -8, sd8, 0xd8)
			fn_11e0(sd8, c)
			q = ld64(sd8 + 8)
			f = ld64(sd8)
			if (f == 2) {
				st64(s230, q)
				q = try_accounts_1678(sd8, c)
				if (ld32(sb8 + 0x90) == 2) {
					const t = ld64(0x300000000 /* heap bump-allocator cursor */)
					f = ld64(sd8)
					const u = t != 0 ? sat_sub(t, 0x12) : 0x300007fee
					n = ld64(sd8 + 8)
					if (f != 0) {
						if (0x300000008 > u) {
							raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, u)
						st64(u + 8, 0x7561765f6e656b6f)
						st64(u, 0x745f647261776572)
						st16(u + 0x10, 0x746c)
						void ld64(n)
					} else {
						if (0x300000008 > u) {
							raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, u)
						st64(u + 8, 0x7561765f6e656b6f)
						st64(u, 0x745f647261776572)
						st16(u + 0x10, 0x746c)
						void ld64(n)
					}
					st64(n + 0x10, u, 0x12)
					st64(n + 8, 0x12)
					st64(n, 1)
					st64(a + 0x10, n)
					st64(a + 8, f)
					st64(a, 0)
					return q
				}
				const r = ld64(0x300000000 /* heap bump-allocator cursor */)
				const s = r != 0 ? sat_sub(r, 0xd8) : 0x300007f28
				if (0x300000008 > s) {
					alloc_handle_alloc_error(8, 0xd8)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, s & -8)
				if ((s & -8) != 0) {
					st64(s238, s & -8)
					memcpy(s & -8, sd8, 0xd8)
					q = try_accounts_15c0(sd8, c)
					if (ld32(sd8) == 2) {
						const x = ld64(0x300000000 /* heap bump-allocator cursor */)
						f = ld64(sd8 + 8)
						const y = x != 0 ? sat_sub(x, 0x11) : 0x300007fef
						n = ld64(sd8 + 0x10)
						if (f != 0) {
							if (0x300000008 > y) {
								raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, y)
							st64(y + 8, 0x6e696d5f746c7561)
							st64(y, 0x765f647261776572)
							st8(y + 0x10, 0x74)
							void ld64(n)
						} else {
							if (0x300000008 > y) {
								raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, y)
							st64(y + 8, 0x6e696d5f746c7561)
							st64(y, 0x765f647261776572)
							st8(y + 0x10, 0x74)
							void ld64(n)
						}
						st64(n + 0x10, y, 0x11)
						st64(n + 8, 0x11)
						st64(n, 1)
						st64(a + 0x10, n)
						st64(a + 8, f)
						st64(a, 0)
						return q
					}
					const v = ld64(0x300000000 /* heap bump-allocator cursor */)
					const w = v != 0 ? sat_sub(v, 0x80) : 0x300007f80
					if (0x300000008 > w) {
						alloc_handle_alloc_error(8, 0x80)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, w & -8)
					if ((w & -8) != 0) {
						st64(s240, w & -8)
						memcpy(w & -8, sd8, 0x80)
						try_accounts_19190(sd8, c)
						n = ld64(sd8 + 8)
						const z = ld64(sd8)
						if (z != 2) {
							q = fn_4130(s148, z, n, 0x10015b020 /* "token_program" */, 0xd)
							n = ld64(s148 + 8)
							f = ld64(s148)
							if (f != 2) {
								st64(a + 0x10, n)
								st64(a + 8, f)
								st64(a, 0)
								return q
							}
						}
						st64(s248, n)
						fn_18cf0(sd8, c, n, aa, ab)
						n = ld64(sd8 + 8)
						const ac = ld64(sd8)
						if (ac != 2) {
							q = fn_4130(s158, ac, n, "token_program_2022", 0x12)
							n = ld64(s158 + 8)
							f = ld64(s158)
							if (f != 2) {
								st64(a + 0x10, n)
								st64(a + 8, f)
								st64(a, 0)
								return q
							}
						}
						st64(s250, n)
						fn_193e0(sd8, c, n, ad, ae)
						n = ld64(sd8 + 8)
						const af = ld64(sd8)
						if (af != 2) {
							q = fn_4130(s168, af, n, "memo_program", 0xc)
							n = ld64(s168 + 8)
							f = ld64(s168)
							pool_state = ld64(s230)
							if (f != 2) {
								st64(a + 0x10, n)
								st64(a + 8, f)
								st64(a, 0)
								return q
							}
						} else {
							pool_state = ld64(s230)
						}
						if (ld8(ld64((k & -8) + 0x20) + 0x29) != 0) {
							if (pool_state.is_writable != 0) {
								const aj = ld64(s238)
								if (ld8(ld64(aj + 0x20) + 0x29) != 0) {
									st64(s258, n)
									const ak = ld64(ld64(ld64(s240) + 0x58))
									copyr(s138, ak, 0x20)
									copy(s118, aj + 0x28, 0x20)
									if ((memcmp(s138, s118, 0x20) as u32) != 0) {
										anchor_error_from(s1d8, 0x7dc /* anchor::ConstraintAddress */)
										const at = fn_4130(s1e8, ld64(s1d8), ld64(s1d8 + 8), "reward_vault_mint", 0x11)
										const ar = ld64(s1e8 + 8)
										const aq = ld64(s1e8)
										copy(sd8, s138, 0x40)
										q = Error_with_pubkeys(s1f8, aq, ar, sd8, at)
										f = ld64(s1f8)
										st64(a + 0x10, ld64(s1f8 + 8))
										st64(a + 8, f)
										st64(a, 0)
										return q
									}
									const al = ld64(s248)
									const am = ld64(al)
									copyr(sf8, am, 0x20)
									q = memcmp(sf8, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32
									if (q == 0) {
										st64(a + 0x38, ld64(s258))
										st64(a + 0x30, ld64(s250))
										st64(a + 0x28, al)
										st64(a + 0x20, ld64(s240))
										st64(a + 0x18, ld64(s238))
										st64(a + 0x10, ld64(s230))
										st64(a + 8, k & -8)
										st64(a, i)
										return q
									}
									anchor_error_from(s208, 0x7dc /* anchor::ConstraintAddress */)
									const ap = fn_4130(s218, ld64(s208), ld64(s208 + 8), 0x10015b020 /* "token_program" */, 0xd)
									const ao = ld64(s218 + 8)
									const an = ld64(s218)
									copyr(sd8, sf8, 0x20)
									st64(sb8, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
									q = Error_with_pubkeys(s228, an, ao, sd8, ap)
									f = ld64(s228)
									st64(a + 0x10, ld64(s228 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return q
								}
								anchor_error_from(s1b8, 0x7d0 /* anchor::ConstraintMut */, n, aj, ah)
								q = fn_4130(s1c8, ld64(s1b8), ld64(s1b8 + 8), "reward_token_vault", 0x12)
								f = ld64(s1c8)
								st64(a + 0x10, ld64(s1c8 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return q
							}
							anchor_error_from(s198, 0x7d0 /* anchor::ConstraintMut */, n, ag, ah)
							q = fn_4130(s1a8, ld64(s198), ld64(s198 + 8), "pool_state", 0xa)
							f = ld64(s1a8)
							st64(a + 0x10, ld64(s1a8 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
						anchor_error_from(s178, 0x7d0 /* anchor::ConstraintMut */, n, ag, ah)
						q = fn_4130(s188, ld64(s178), ld64(s178 + 8), "funder_token_account", 0x14)
						f = ld64(s188)
						st64(a + 0x10, ld64(s188 + 8))
						st64(a + 8, f)
						st64(a, 0)
						return q
					}
					alloc_handle_alloc_error(8, 0x80)
				}
				alloc_handle_alloc_error(8, 0xd8)
			}
			const o = ld64(0x300000000 /* heap bump-allocator cursor */)
			const p = o != 0 ? sat_sub(o, 0xa) : 0x300007ff6
			if ((f & 1) != 0) {
				if (0x300000008 > p) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, sat_sub(o, 0xa), 0xa > o)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, p)
				st64(p, 0x6174735f6c6f6f70)
				st16(p + 8, 0x6574)
				void ld64(q)
			} else {
				if (0x300000008 > p) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, sat_sub(o, 0xa), 0xa > o)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, p)
				st64(p, 0x6174735f6c6f6f70)
				st16(p + 8, 0x6574)
				void ld64(q)
			}
			st64(q + 0x10, p, 0xa)
			st64(q + 8, 0xa)
			st64(q, 1)
			st64(a + 0x10, q)
			st64(a + 8, f)
			st64(a, 0)
			return q
		}
		alloc_handle_alloc_error(8, 0xd8)
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0xd) : 0x300007ff3
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xd, 0x10015f8f8, sat_sub(g, 0xd), 0xd > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 5, 0x7265646e75665f64)
		st64(h, 0x665f647261776572)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xd, 0x10015f8f8, sat_sub(g, 0xd), 0xd > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 5, 0x7265646e75665f64)
		st64(h, 0x665f647261776572)
		void ld64(i)
	}
	st64(i + 0x10, h, 0xd)
	st64(i + 8, 0xd)
	st64(i, 1)
	st64(a + 0x10, i)
	st64(a + 8, f)
	st64(a, 0)
	return q
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
export function fn_49b88(a: u64, b: u64, c: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf0 = fp - 0xf0, sf8 = fp - 0xf8, s108 = fp - 0x108, s110 = fp - 0x110, s118 = fp - 0x118, s138 = fp - 0x138, s2bf = fp - 0x2bf, s2df = fp - 0x2df, s2ff = fp - 0x2ff, s310 = fp - 0x310, s338 = fp - 0x338, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s448 = fp - 0x448, s470 = fp - 0x470, sfe8 = fp - 0xfe8, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let m, n, bf, bo: u64
	B18: {
		st64(s448 + 0x20, a)
		const f = ld64(b + 8)
		const h = ld64(f + 0x18)
		const g = ld64(ld64(f))
		copyr(s358, g, 0x20)
		const bp = ld64(h + 0x20)
		const i = ld64(h + 0x68)
		st64(s448 + 0x28, f)
		const k = ld64(f + 0x10)
		const l = clock_get(s338)
		if (ld64(s338) != 0) {
			const u = ld64(s338 + 8)
			const t = ld64(s338 + 0x10)
			st64(s338 + 0x10, ld64(s338 + 0x18))
			st64(s338, u, t)
			bf = fn_13e628(s408, s338)
			m = ld64(s408 + 8)
			n = ld64(s408)
		} else {
			st64(s448 + 0x18, i)
			const j = ld64(s310)
			if ((j as i64) > -1) {
				bf = fn_53e8(s338, k, undef, undef, undef, l)
				m = ld64(s338 + 0x10)
				n = ld64(s338 + 8)
				if (ld64(s338) == 0) {
					st64(s448 + 0x10, m)
					bf = fn_6c2a0(s338, n, j)
					let w = ld64(s338 + 0x10)
					let x = ld64(s338 + 8)
					if (ld8(s338) == 0) {
						if ((c as u8) > 2) {
							fn_14ec98(c as u8, 3, 0x10015fe40)
						}
						memcpy(s338, n + (c as u8) * 0xa9 + 0x185, 0xa9)
						st64(s118, 0, 0, 0, 0)
						if ((memcmp(s2ff, s118, 0x20) as u32) == 0) {
							fn_85138(s78, 0x100159910)
							st64(s60, 0, 1, 0)
							st64(s28, s60, 0x10015f818)
							st8(s20 + 0x10, 3)
							st64(s20 + 8, 0x20)
							st64(s38, 0)
							st64(s48, 0)
							if (fn_88558(0x100159910, s48) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
							}
							copy(sf8, s78, 0x30)
							st64(s110, 0x10015a118)
							st32(sf0 + 0x70, 0x1791 /* error::UnInitializedRewardInfo */)
							st8(sf0 + 0x28, 2)
							st32(s108 + 8, 0x52)
							st64(s108, 0x3a)
							st64(s118, 0)
							bf = fn_13e5a0(s3f8, s118)
							w = ld64(s3f8 + 8)
							x = ld64(s3f8)
						} else {
							const p = ld64(s338 + 9)
							const o = ld64(s338 + 0x11)
							if (o == p) {
								if ((memcmp(s358, s2bf, 0x20) as u32) == 0) {
									const bq = ld64(bp)
									copyr(s138, bq, 0x20)
									if ((memcmp(s138, s2df, 0x20) as u32) == 0) {
										const bv = ld64(s310 + 9)
										const bu = ld64(s310 + 1)
										if (bv > bu) {
											bf = fn_88360(s3e8, 0x26)
											w = ld64(s3e8 + 8)
											x = ld64(s3e8)
										} else {
											const bw = ld64(s448 + 0x18)
											if (bw >= bu - bv) {
												const bx = ld64(s448 + 0x10)
												st64(bx, ld64(bx) + 1)
												m = bw - (bu - bv)
												break B18
											}
											bf = fn_88360(s3d8, 0x26)
											w = ld64(s3d8 + 8)
											x = ld64(s3d8)
										}
									} else {
										ErrorCode_name(s78, 0x100159874)
										st64(s60, 0, 1, 0)
										st64(s28, s60, 0x10015f818)
										st8(s20 + 0x10, 3)
										st64(s20 + 8, 0x20)
										st64(s38, 0)
										st64(s48, 0)
										if (ErrorCode_fmt(0x100159874, s48) != 0) {
											fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
										}
										copy(sf8, s78, 0x30)
										st64(s110, 0x10015a118)
										st32(sf0 + 0x70, 0x9c6 /* anchor::RequireKeysEqViolated */)
										st8(sf0 + 0x28, 2)
										st32(s108 + 8, 0x5a)
										st64(s108, 0x3a)
										st64(s118, 0)
										const bt = fn_13e5a0(s3b8, s118)
										const bs = ld64(s3b8 + 8)
										const br = ld64(s3b8)
										copyr(sf8, s2df, 0x20)
										copy(s118, s138, 0x20)
										bf = Error_with_pubkeys(s3c8, br, bs, s118, bt)
										w = ld64(s3c8 + 8)
										x = ld64(s3c8)
									}
								} else {
									ErrorCode_name(s78, 0x100159874)
									st64(s60, 0, 1, 0)
									st64(s28, s60, 0x10015f818)
									st8(s20 + 0x10, 3)
									st64(s20 + 8, 0x20)
									st64(s38, 0)
									st64(s48, 0)
									if (ErrorCode_fmt(0x100159874, s48) != 0) {
										fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
									}
									copy(sf8, s78, 0x30)
									st64(s110, 0x10015a118)
									st32(sf0 + 0x70, 0x9c6 /* anchor::RequireKeysEqViolated */)
									st8(sf0 + 0x28, 2)
									st32(s108 + 8, 0x59)
									st64(s108, 0x3a)
									st64(s118, 0)
									const s = fn_13e5a0(s398, s118)
									const r = ld64(s398 + 8)
									const q = ld64(s398)
									copyr(sf8, s2bf, 0x20)
									copy(s118, s358, 0x20)
									bf = Error_with_pubkeys(s3a8, q, r, s118, s)
									w = ld64(s3a8 + 8)
									x = ld64(s3a8)
								}
							} else {
								fn_85138(s78, 0x10015982c)
								st64(s60, 0, 1, 0)
								st64(s28, s60, 0x10015f818)
								st8(s20 + 0x10, 3)
								st64(s20 + 8, 0x20)
								st64(s38, 0)
								st64(s48, 0)
								if (fn_88558(0x10015982c, s48) != 0) {
									fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
								}
								copy(sf8, s78, 0x30)
								st64(s110, 0x10015a118)
								st32(sf0 + 0x70, 0x1770 /* error::NotApproved */)
								st8(sf0 + 0x28, 2)
								st32(s108 + 8, 0x54)
								st64(s108, 0x3a)
								st64(s118, 0)
								fn_13e5a0(s378, s118)
								bf = fn_1730(s388, ld64(s378), ld64(s378 + 8), o, p)
								w = ld64(s388 + 8)
								x = ld64(s388)
							}
						}
					}
					const v = ld64(s448 + 0x10)
					st64(v, ld64(v) + 1)
					m = w
					n = x
				}
			} else {
				bf = fn_88360(s368, 0x26)
				m = ld64(s368 + 8)
				n = ld64(s368)
			}
		}
		if (n != 2) {
			bo = ld64(s448 + 0x20)
			st64(bo + 8, m)
			st64(bo, n)
			return bf
		}
	}
	const y = ld64(s448 + 0x28)
	const z: AccountInfo = ld64(ld64(y + 0x18) + 0x20)
	const aa: LamportsCell = z.lamports
	const ag = z.key
	rc_inc(aa)
	const ab: DataCell = z.data
	rc_inc(ab)
	st64(s448 + 0x10, m)
	const af = z.owner
	const ae = z.rent_epoch
	const ad = z.is_signer
	const ac = z.is_writable
	st8(s20 + 2, z.executable)
	st8(s20, ad, ac)
	st64(s48, ag, aa, ab, af, ae)
	const ah: AccountInfo = ld64(ld64(y + 8) + 0x20)
	const ai: LamportsCell = ah.lamports
	const ao = ah.key
	rc_inc(ai)
	const aj: DataCell = ah.data
	rc_inc(aj)
	const an = ah.owner
	const am = ah.rent_epoch
	st64(s448 + 0x18, ai)
	const al = ah.is_signer
	const ak = ah.is_writable
	st8(sf0 + 2, ah.executable)
	st8(sf0, al, ak)
	st64(s108, aj, an, am)
	st64(s110, ld64(s448 + 0x18))
	st64(s118, ao)
	const ap = ld64(0x300000000 /* heap bump-allocator cursor */)
	st64(s470 + 0x20, aj)
	const aq = ap != 0 ? sat_sub(ap, 0x80) & -8 : 0x300007f80
	st64(s448, aa, ab)
	if (aq > 0x300000007) {
		const ar = ld64(y + 0x20)
		st64(0x300000000 /* heap bump-allocator cursor */, aq)
		const at = ld64(ar + 0x58)
		memcpy(aq, ar, 0x58)
		st64(aq + 0x58, at)
		const au = ld64(s448 + 0x28)
		copy(aq + 0x60, ar + 0x60, 0x20)
		const av: AccountInfo = ld64(au + 0x30)
		const aw: LamportsCell = av.lamports
		const ay = ld64(au + 0x28)
		const bd = av.key
		rc_inc(aw)
		const ax: DataCell = av.data
		rc_inc(ax)
		st64(s448 + 0x28, ay)
		st64(s470, s110, s108, s40, s38)
		const bc = av.owner
		const bb = av.rent_epoch
		const ba = av.is_signer
		const az = av.is_writable
		st8(s310 + 2, av.executable)
		st8(s310, ba, az)
		st64(s338, bd, aw, ax, bc, bb)
		st64(sfe8, ld64(s448 + 0x10))
		st64(sff0, s338)
		st64(sff8, ld64(s448 + 0x28))
		st64(s1000, aq)
		bf = fn_7a038(s418, au + 0x10, s48, s118, aq, ld64(sff8), s338, ld64(sfe8), bc)
		m = undef
		n = ld64(s418)
		if (n == 2) {
			const be = ld64(s448 + 0x18)
			const bi: DataCell = ld64(s448 + 8)
			const bh: LamportsCell = ld64(s448)
			if (rc_release(be)) {
				bf = Rc_drop_slow_14df0(ld64(s470), bf)
				m = undef
			}
			const bg: DataCell = ld64(s470 + 0x20)
			if (rc_release(bg)) {
				bf = Rc_drop_slow_14df0(ld64(s470 + 8), bf)
				m = undef
			}
			if (rc_release(bh)) {
				bf = Rc_drop_slow_14df0(ld64(s470 + 0x10), bf)
				m = undef
			}
			if (!rc_release(bi)) {
				bo = ld64(s448 + 0x20)
				st64(bo + 8, m)
				st64(bo, 2)
				return bf
			}
			bf = Rc_drop_slow_14df0(ld64(s470 + 0x18), bf)
			bo = ld64(s448 + 0x20)
			st64(bo + 8, undef)
			st64(bo, 2)
			return bf
		}
		m = ld64(s418 + 8)
		const bj = ld64(s448 + 0x18)
		const bk = m
		const bn: DataCell = ld64(s448 + 8)
		const bm: LamportsCell = ld64(s448)
		if (rc_release(bj)) {
			bf = Rc_drop_slow_14df0(ld64(s470), bf)
			m = bk
		}
		const bl: DataCell = ld64(s470 + 0x20)
		if (rc_release(bl)) {
			bf = Rc_drop_slow_14df0(ld64(s470 + 8), bf)
			m = bk
		}
		if (rc_release(bm)) {
			bf = Rc_drop_slow_14df0(ld64(s470 + 0x10), bf)
			m = bk
		}
		if (!rc_release(bn)) {
			bo = ld64(s448 + 0x20)
			st64(bo + 8, m)
			st64(bo, n)
			return bf
		}
		bf = Rc_drop_slow_14df0(ld64(s470 + 0x18), bf)
		bo = ld64(s448 + 0x20)
		st64(bo + 8, bk)
		st64(bo, n)
		return bf
	}
	alloc_handle_alloc_error(8, 0x80)
}

export function fn_c1ac0(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let h, k, n, o: u64
	const f = ld64(b + 8)
	const g = ld64(f + 0x20)
	if ((memcmp(f, c, 0x20) as u32) == 0 && (common_is_closed(g) == 0 && ld64(ld64(g + 0x10) + 0x10) != 0)) {
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		k = fn_13e628(s28, s18)
		h = ld64(s28)
		if (h != 2) {
			const q = ld64(0x300000000 /* heap bump-allocator cursor */)
			n = q != 0 ? sat_sub(q, 0x14) : 0x300007fec
			o = ld64(s28 + 8)
			if ((h & 1) != 0) {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > q)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6363615f6e656b6f)
				st64(n, 0x745f7265646e7566)
				st32(n + 0x10, 0x746e756f)
				void ld64(o)
			} else {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > q)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6363615f6e656b6f)
				st64(n, 0x745f7265646e7566)
				st32(n + 0x10, 0x746e756f)
				void ld64(o)
			}
			st64(o + 8, 0x14)
			st64(o, 1)
			st64(o + 0x18, 0x14)
			st64(o + 0x10, n)
			st64(a + 8, o)
			st64(a, h)
			return k
		}
	}
	k = fn_a80(s38, ld64(b + 0x10), c)
	h = ld64(s38)
	if (h == 2) {
		const i = ld64(b + 0x18)
		const l = ld64(i + 0x20)
		const j = memcmp(i, c, 0x20)
		o = undef
		k = j as u32
		if (k != 0) {
			st64(a + 8, o)
			st64(a, 2)
			return k
		}
		k = common_is_closed(l)
		o = undef
		if (k != 0) {
			st64(a + 8, o)
			st64(a, 2)
			return k
		}
		if (ld64(ld64(l + 0x10) + 0x10) == 0) {
			st64(a + 8, o)
			st64(a, 2)
			return k
		}
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		k = fn_13e628(s48, s18)
		o = undef
		h = ld64(s48)
		if (h == 2) {
			st64(a + 8, o)
			st64(a, 2)
			return k
		}
		const m = ld64(0x300000000 /* heap bump-allocator cursor */)
		n = m != 0 ? sat_sub(m, 0x12) : 0x300007fee
		o = ld64(s48 + 8)
		if ((h & 1) != 0) {
			if (0x300000008 > n) {
				raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008, 0x12 > m)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, n)
			st64(n + 8, 0x7561765f6e656b6f)
			st64(n, 0x745f647261776572)
			st16(n + 0x10, 0x746c)
			void ld64(o)
		} else {
			if (0x300000008 > n) {
				raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008, 0x12 > m)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, n)
			st64(n + 8, 0x7561765f6e656b6f)
			st64(n, 0x745f647261776572)
			st16(n + 0x10, 0x746c)
			void ld64(o)
		}
		st64(o + 8, 0x12)
		st64(o, 1)
		st64(o + 0x18, 0x12)
		st64(o + 0x10, n)
		st64(a + 8, o)
		st64(a, h)
		return k
	}
	const p = ld64(0x300000000 /* heap bump-allocator cursor */)
	n = p != 0 ? sat_sub(p, 0xa) : 0x300007ff6
	o = ld64(s38 + 8)
	if ((h & 1) != 0) {
		if (0x300000008 > n) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > p)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, n)
		st64(n, 0x6174735f6c6f6f70)
		st16(n + 8, 0x6574)
		void ld64(o)
	} else {
		if (0x300000008 > n) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > p)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, n)
		st64(n, 0x6174735f6c6f6f70)
		st16(n + 8, 0x6574)
		void ld64(o)
	}
	st64(o + 8, 0xa)
	st64(o, 1)
	st64(o + 0x18, 0xa)
	st64(o + 0x10, n)
	st64(a + 8, o)
	st64(a, h)
	return k
}
