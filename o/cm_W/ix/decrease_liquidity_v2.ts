/// <reference path="../lib.d.ts" />
// instruction decrease_liquidity_v2
import { anchor_error_from, fn_1008, fn_13e628, fn_2d880, fn_4130, fn_4bd8, fn_4dc0, fn_a80, fn_b4e0, memcpy } from '../shared.ts'

// instruction handler: decrease_liquidity_v2 (discriminator sha256("global:decrease_liquidity_v2")[..8] = 0x60c4524f3ebc7f3a)
// accounts [idl]: 0 nft_owner [signer], 1 nft_account, 2 personal_position [mut], 3 pool_state [mut], 4 protocol_position, 5 token_vault_0 [mut], 6 token_vault_1 [mut], 7 tick_array_lower [mut], 8 tick_array_upper [mut], 9 recipient_token_account_0 [mut], 10 recipient_token_account_1 [mut], 11 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 12 token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb], 13 memo_program [= MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr], 14 vault_0_mint, 15 vault_1_mint
// args [idl]: liquidity: u128, amount_0_min: u64, amount_1_min: u64
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, amount_0_min, amount_1_min
export function ix_decrease_liquidity_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s68 = fp - 0x68, s70 = fp - 0x70, s80 = fp - 0x80, se8 = fp - 0xe8, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s1000 = fp - 0x1000
	let l, o: u64
	const i = sol_log("Instruction: DecreaseLiquidityV2", 0x20)
	const f = ix_args_len
	if (f >= 0x10 && ((f & -8) != 0x10 && (f & -8) != 0x18)) {
		const args: DecreaseLiquidityV2Args = ix_args
		const r = ld64(args.liquidity + 8)
		const q = ld64(args.liquidity)
		const amount_0_min = args.amount_0_min
		const amount_1_min = args.amount_1_min
		st64(s110, accounts, accounts_len)
		o = accounts_decrease_liquidity_v2(s80, amount_0_min, s110, undef, fp, i)
		const k = ld64(s70)
		l = ld64(s80 + 8)
		const j = ld64(s80)
		if (j == 0) {
			st64(a + 8, k)
			st64(a, l)
			return o
		}
		memcpy(se8, s68, 0x68)
		st64(s100, j, l, k)
		copyr(s70, s110, 0x10)
		st64(s80, program_id, s100)
		st64(s1000, amount_0_min, amount_1_min)
		o = fn_34050(s120, s80, q, r, amount_0_min, amount_1_min)
		l = ld64(s120)
		if (l == 2) {
			o = fn_b4c78(s130, s100, program_id)
			l = ld64(s130)
			st64(a + 8, ld64(s130 + 8))
			st64(a, l)
			return o
		}
		st64(a + 8, ld64(s120 + 8))
		st64(a, l)
		return o
	}
	const m = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (m & 3) - 2) {
		o = anchor_error_from(s140, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s140)
		st64(a + 8, ld64(s140 + 8))
		st64(a, l)
		return o
	}
	if ((m & 3) == 0) {
		o = anchor_error_from(s140, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s140)
		st64(a + 8, ld64(s140 + 8))
		st64(a, l)
		return o
	}
	const n = ld64(ld64(m + 7))
	if (n == 0) {
		o = anchor_error_from(s140, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s140)
		st64(a + 8, ld64(s140 + 8))
		st64(a, l)
		return o
	}
	callx(n, ld64(m - 1), n)
	o = anchor_error_from(s140, 0x66 /* anchor::InstructionDidNotDeserialize */)
	l = ld64(s140)
	st64(a + 8, ld64(s140 + 8))
	st64(a, l)
	return o
}

// Anchor Accounts::try_accounts of instruction decrease_liquidity_v2 (called by ix_decrease_liquidity_v2; name [str]: from the handler's "Instruction: …" log; was fn_b22c0)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_vault_0 (ConstraintMut, ConstraintRaw), token_vault_1 (ConstraintMut, ConstraintRaw), tick_array_lower (ConstraintMut, ConstraintRaw), tick_array_upper (ConstraintMut, ConstraintRaw), recipient_token_account_0 (ConstraintMut), recipient_token_account_1 (ConstraintMut), token_program, token_program_2022, memo_program (AccountNotEnoughKeys, ConstraintAddress), vault_0_mint (ConstraintAddress), vault_1_mint (ConstraintAddress), nft_account (ConstraintRaw), pool_state (ConstraintMut), personal_position (ConstraintMut, ConstraintRaw)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: vault_0_mint_box, vault_1_mint_box, token_vault_1_box, token_vault_1_box_2, token_vault_0, token_vault_1
export function accounts_decrease_liquidity_v2(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s100 = fp - 0x100, s120 = fp - 0x120, s140 = fp - 0x140, s160 = fp - 0x160, s180 = fp - 0x180, s1a0 = fp - 0x1a0, s1c0 = fp - 0x1c0, s1d8 = fp - 0x1d8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s570 = fp - 0x570, s578 = fp - 0x578, s580 = fp - 0x580, s588 = fp - 0x588, s590 = fp - 0x590, s598 = fp - 0x598, s5a0 = fp - 0x5a0, s5a8 = fp - 0x5a8, s5b0 = fp - 0x5b0, s5b8 = fp - 0x5b8, s5c0 = fp - 0x5c0, s5c8 = fp - 0x5c8, s5d0 = fp - 0x5d0, s5d8 = fp - 0x5d8
	let s, t, u, v, w, x, aj, ak, am, an, ap, aq, at, au, aw, ax, az, ba, bd, be, bh, bi, bl: u64
	let vault_0_mint_box: Mint
	let q = try_accounts_17a30(s120, c, c, d, e, r0)
	const i = ld64(s120 + 8)
	let f = ld64(s120)
	if (f == 2) {
		q = try_accounts_1678(s120, c)
		if (ld32(s100 + 0x90) == 2) {
			const l = ld64(0x300000000 /* heap bump-allocator cursor */)
			f = ld64(s120)
			const m = l != 0 ? sat_sub(l, 0xb) : 0x300007ff5
			vault_0_mint_box = ld64(s120 + 8)
			if (f != 0) {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m, 0x6f6363615f74666e)
				st32(m + 7, 0x746e756f)
				void ld64(vault_0_mint_box)
			} else {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m, 0x6f6363615f74666e)
				st32(m + 7, 0x746e756f)
				void ld64(vault_0_mint_box)
			}
			st64(vault_0_mint_box.mint_authority + 0xc, m, 0xb)
			st64(vault_0_mint_box.mint_authority + 4, 0xb)
			st64(vault_0_mint_box, 1)
			st64(a + 0x10, vault_0_mint_box)
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
			memcpy(k & -8, s120, 0xd8)
			q = try_accounts_18368(s120, c)
			let ah = undef
			if (ld64(s120) == 0) {
				const z = ld64(0x300000000 /* heap bump-allocator cursor */)
				f = ld64(s120 + 8)
				const aa = z != 0 ? sat_sub(z, 0x11) : 0x300007fef
				vault_0_mint_box = ld64(s120 + 0x10)
				if (f != 0) {
					if (0x300000008 > aa) {
						raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, ah)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, aa)
					st64(aa + 8, 0x6f697469736f705f)
					st64(aa, 0x6c616e6f73726570)
					st8(aa + 0x10, 0x6e)
					void ld64(vault_0_mint_box)
				} else {
					if (0x300000008 > aa) {
						raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, ah)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, aa)
					st64(aa + 8, 0x6f697469736f705f)
					st64(aa, 0x6c616e6f73726570)
					st8(aa + 0x10, 0x6e)
					void ld64(vault_0_mint_box)
				}
				st64(vault_0_mint_box.mint_authority + 0xc, aa, 0x11)
				st64(vault_0_mint_box.mint_authority + 4, 0x11)
				st64(vault_0_mint_box, 1)
				st64(a + 0x10, vault_0_mint_box)
				st64(a + 8, f)
				st64(a, 0)
				return q
			}
			const o = ld64(0x300000000 /* heap bump-allocator cursor */)
			const p = o != 0 ? sat_sub(o, 0x120) : 0x300007ee0
			if (0x300000008 > p) {
				alloc_handle_alloc_error(8, 0x120)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, p & -8)
			if ((p & -8) != 0) {
				st64(s570, p & -8)
				memcpy(p & -8, s120, 0x120)
				fn_11e0(s120, c)
				q = ld64(s120 + 8)
				f = ld64(s120)
				if (f == 2) {
					st64(s580, q)
					const r = ld64(c + 8)
					if (r == 0) {
						anchor_error_from(s208, 0xbbd /* anchor::AccountNotEnoughKeys */, s, t, u)
						q = ld64(s208 + 8)
						f = ld64(s208)
						if (f != 2) {
							const ag = ld64(0x300000000 /* heap bump-allocator cursor */)
							ah = 0x11 > ag
							const ab = ah != 0 ? 0 : ag - 0x11
							const ai = ag != 0 ? ab : 0x300007fef
							if ((f & 1) != 0) {
								if (0x300000008 > ai) {
									raw_vec_handle_error(1, 0x11, 0x10015f8f8, ab, ah)
								}
								st64(0x300000000 /* heap bump-allocator cursor */, ai)
								st64(ai + 8, 0x6f697469736f705f)
								st64(ai, 0x6c6f636f746f7270)
								st8(ai + 0x10, 0x6e)
								void ld64(q)
							} else {
								if (0x300000008 > ai) {
									raw_vec_handle_error(1, 0x11, 0x10015f8f8, ab, ah)
								}
								st64(0x300000000 /* heap bump-allocator cursor */, ai)
								st64(ai + 8, 0x6f697469736f705f)
								st64(ai, 0x6c6f636f746f7270)
								st8(ai + 0x10, 0x6e)
								void ld64(q)
							}
							st64(q + 0x10, ai, 0x11)
							st64(q + 8, 0x11)
							st64(q, 1)
							st64(a + 0x10, q)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					} else {
						st64(c + 8, r - 1)
						q = ld64(c)
						st64(c, q + 0x30)
					}
					st64(s588, q)
					try_accounts_1678(s120, c, s, t, u)
					if (ld32(s100 + 0x90) == 2) {
						q = fn_4130(s218, ld64(s120), ld64(s120 + 8), "token_vault_0", 0xd)
						st64(s578, ld64(s218 + 8))
						f = ld64(s218)
						if (f != 2) {
							st64(a + 0x10, ld64(s578))
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					} else {
						const ae = ld64(0x300000000 /* heap bump-allocator cursor */)
						const af = ae != 0 ? sat_sub(ae, 0xd8) : 0x300007f28
						if (0x300000008 > af) {
							alloc_handle_alloc_error(8, 0xd8)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, af & -8)
						if ((af & -8) == 0) {
							alloc_handle_alloc_error(8, 0xd8)
						}
						st64(s578, af & -8)
						memcpy(af & -8, s120, 0xd8)
					}
					fn_7498(s120, c, v, w, x)
					vault_0_mint_box = ld64(s120 + 8)
					const y = ld64(s120)
					if (y != 2) {
						q = fn_4130(s228, y, vault_0_mint_box, "token_vault_1", 0xd)
						vault_0_mint_box = ld64(s228 + 8)
						f = ld64(s228)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s590, vault_0_mint_box)
					fn_13d0(s120, c, vault_0_mint_box, aj, ak)
					vault_0_mint_box = ld64(s120 + 8)
					const al = ld64(s120)
					if (al != 2) {
						q = fn_4130(s238, al, vault_0_mint_box, "tick_array_lower", 0x10)
						vault_0_mint_box = ld64(s238 + 8)
						f = ld64(s238)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s598, vault_0_mint_box)
					fn_13d0(s120, c, vault_0_mint_box, am, an)
					vault_0_mint_box = ld64(s120 + 8)
					const ao = ld64(s120)
					if (ao != 2) {
						q = fn_4130(s248, ao, vault_0_mint_box, "tick_array_upper", 0x10)
						vault_0_mint_box = ld64(s248 + 8)
						f = ld64(s248)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s5a0, vault_0_mint_box)
					fn_7498(s120, c, vault_0_mint_box, ap, aq)
					vault_0_mint_box = ld64(s120 + 8)
					const ar = ld64(s120)
					if (ar != 2) {
						q = fn_4130(s258, ar, vault_0_mint_box, "recipient_token_account_0", 0x19)
						vault_0_mint_box = ld64(s258 + 8)
						f = ld64(s258)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s5a8, vault_0_mint_box)
					fn_7498(s120, c, vault_0_mint_box, at, au)
					vault_0_mint_box = ld64(s120 + 8)
					const av = ld64(s120)
					if (av != 2) {
						q = fn_4130(s268, av, vault_0_mint_box, "recipient_token_account_1", 0x19)
						vault_0_mint_box = ld64(s268 + 8)
						f = ld64(s268)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s5b0, vault_0_mint_box)
					try_accounts_19190(s120, c, vault_0_mint_box, aw, ax)
					vault_0_mint_box = ld64(s120 + 8)
					const ay = ld64(s120)
					if (ay != 2) {
						q = fn_4130(s278, ay, vault_0_mint_box, 0x10015b020 /* "token_program" */, 0xd)
						vault_0_mint_box = ld64(s278 + 8)
						f = ld64(s278)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s5b8, vault_0_mint_box)
					fn_18cf0(s120, c, vault_0_mint_box, az, ba)
					vault_0_mint_box = ld64(s120 + 8)
					const bb = ld64(s120)
					if (bb != 2) {
						q = fn_4130(s288, bb, vault_0_mint_box, "token_program_2022", 0x12)
						vault_0_mint_box = ld64(s288 + 8)
						f = ld64(s288)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s5c0, vault_0_mint_box)
					const bc = ld64(c + 8)
					if (bc == 0) {
						anchor_error_from(s298, 0xbbd /* anchor::AccountNotEnoughKeys */, vault_0_mint_box, bd, be)
						vault_0_mint_box = ld64(s298 + 8)
						const bf = ld64(s298)
						if (bf != 2) {
							q = fn_4130(s2a8, bf, vault_0_mint_box, "memo_program", 0xc)
							vault_0_mint_box = ld64(s2a8 + 8)
							f = ld64(s2a8)
							if (f != 2) {
								st64(a + 0x10, vault_0_mint_box)
								st64(a + 8, f)
								st64(a, 0)
								return q
							}
						}
					} else {
						st64(c + 8, bc - 1)
						vault_0_mint_box = ld64(c)
						st64(c, vault_0_mint_box + 0x30)
					}
					st64(s5c8, vault_0_mint_box)
					fn_7768(s120, c, vault_0_mint_box, bd, be)
					vault_0_mint_box = ld64(s120 + 8)
					const bg = ld64(s120)
					if (bg != 2) {
						q = fn_4130(s2b8, bg, vault_0_mint_box, "vault_0_mint", 0xc)
						vault_0_mint_box = ld64(s2b8 + 8)
						f = ld64(s2b8)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s5d0, vault_0_mint_box)
					fn_7768(s120, c, vault_0_mint_box, bh, bi)
					let vault_1_mint_box: Mint = ld64(s120 + 8)
					const bj = ld64(s120)
					if (bj != 2) {
						q = fn_4130(s2c8, bj, vault_1_mint_box, "vault_1_mint", 0xc)
						vault_1_mint_box = ld64(s2c8 + 8)
						f = ld64(s2c8)
						bl = ld64(s570)
						if (f != 2) {
							st64(a + 0x10, vault_1_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					} else {
						bl = ld64(s570)
					}
					if ((memcmp((k & -8) + 0x28, bl + 8, 0x20) as u32) == 0) {
						if (ld64((k & -8) + 0x68) != 1) {
							anchor_error_from(s2f8, 0x7d3 /* anchor::ConstraintRaw */)
							q = fn_4130(s308, ld64(s2f8), ld64(s2f8 + 8), 0x10015b0ae /* "nft_account" */, 0xb)
							f = ld64(s308)
							st64(a + 0x10, ld64(s308 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
						const bm = ld64(i)
						copyr(s120, bm, 0x20)
						if ((memcmp((k & -8) + 0x48, s120, 0x20) as u32) == 0) {
							const bn = ld64(s570)
							if (ld8(ld64(bn) + 0x29) != 0) {
								const bo = ld64(ld64(s580) /* key */)
								copyr(s1f8, bo, 0x20)
								const bp = memcmp(bn + 0x28, s1f8, 0x20)
								if ((bp as u32) == 0) {
									if (ld8(ld64(s580) + 0x29 /* is_writable */) != 0) {
										const token_vault_0: AccountInfo = ld64(ld64(s578) + 0x20)
										if (token_vault_0.is_writable != 0) {
											const br = token_vault_0.key
											copyr(s120, br, 0x20)
											q = fn_4dc0(s1d8, ld64(s580), bp as u32)
											st64(s5d8, ld64(s1d8 + 0x10))
											let bs = ld64(s1d8 + 8)
											if (ld64(s1d8) != 0) {
												st64(a + 0x10, ld64(s5d8))
												st64(a + 8, bs)
												st64(a, 0)
												return q
											}
											const bu = memcmp(s120, bs + 0x81, 0x20)
											const bt = ld64(s5d8)
											st64(bt, ld64(bt) - 1)
											if ((bu as u32) == 0) {
												const token_vault_1: AccountInfo = ld64(ld64(s590) + 0x20)
												if (token_vault_1.is_writable != 0) {
													const bw = token_vault_1.key
													copyr(s120, bw, 0x20)
													q = fn_4dc0(s1d8, ld64(s580), bu as u32)
													st64(s5d8, ld64(s1d8 + 0x10))
													bs = ld64(s1d8 + 8)
													if (ld64(s1d8) != 0) {
														st64(a + 0x10, ld64(s5d8))
														st64(a + 8, bs)
														st64(a, 0)
														return q
													}
													const by = memcmp(s120, bs + 0xa1, 0x20)
													const bx = ld64(s5d8)
													st64(bx, ld64(bx) - 1)
													if ((by as u32) == 0) {
														if (ld8(ld64(s598) + 0x29) != 0) {
															q = fn_4bd8(s120, ld64(s598), by as u32)
															st64(s5d8, ld64(s120 + 0x10))
															f = ld64(s120 + 8)
															if (ld64(s120) != 0) {
																st64(a + 0x10, ld64(s5d8))
																st64(a + 8, f)
																st64(a, 0)
																return q
															}
															copyr(s120, s1f8, 0x20)
															const ca = memcmp(f, s120, 0x20)
															const bz = ld64(s5d8)
															st64(bz, ld64(bz) - 1)
															if ((ca as u32) == 0) {
																if (ld8(ld64(s5a0) + 0x29) != 0) {
																	q = fn_4bd8(s120, ld64(s5a0), ca as u32)
																	st64(s5d8, ld64(s120 + 0x10))
																	f = ld64(s120 + 8)
																	if (ld64(s120) != 0) {
																		st64(a + 0x10, ld64(s5d8))
																		st64(a + 8, f)
																		st64(a, 0)
																		return q
																	}
																	copyr(s120, s1f8, 0x20)
																	const cc = memcmp(f, s120, 0x20)
																	const cb = ld64(s5d8)
																	st64(cb, ld64(cb) - 1)
																	if ((cc as u32) == 0) {
																		if (ld8(ld64(ld64(s5a8) + 0x20) + 0x29) != 0) {
																			const cd = ld64(s578)
																			copyr(s120, cd + 0x28, 0x20)
																			if ((memcmp(ld64(s5a8) + 0x28, s120, 0x20) as u32) != 0) {
																				q = anchor_error_from(s4a8, 0x7de /* anchor::ConstraintTokenMint */)
																				f = ld64(s4a8)
																				st64(a + 0x10, ld64(s4a8 + 8))
																				st64(a + 8, f)
																				st64(a, 0)
																				return q
																			}
																			if (ld8(ld64(ld64(s5b0) + 0x20) + 0x29) != 0) {
																				const token_vault_1_box: TokenAccount = ld64(s590)
																				copyr(s120, token_vault_1_box.mint, 0x20)
																				if ((memcmp(ld64(s5b0) + 0x28, s120, 0x20) as u32) != 0) {
																					q = anchor_error_from(s4d8, 0x7de /* anchor::ConstraintTokenMint */)
																					f = ld64(s4d8)
																					st64(a + 0x10, ld64(s4d8 + 8))
																					st64(a + 8, f)
																					st64(a, 0)
																					return q
																				}
																				const cf = ld64(ld64(s5c8))
																				copyr(s1c0, cf, 0x20)
																				if ((memcmp(s1c0, 0x1001594c0 /* &MEMO_PROGRAM */, 0x20) as u32) == 0) {
																					const cj = ld64(s578)
																					const ck = ld64(ld64(ld64(s5d0) + 0x58))
																					copyr(s1a0, ck, 0x20)
																					copy(s180, cj + 0x28, 0x20)
																					if ((memcmp(s1a0, s180, 0x20) as u32) == 0) {
																						const token_vault_1_box_2: TokenAccount = ld64(s590)
																						const cp = vault_1_mint_box.info.key
																						copyr(s160, cp, 0x20)
																						copy(s140, token_vault_1_box_2.mint, 0x20)
																						q = memcmp(s160, s140, 0x20) as u32
																						if (q == 0) {
																							st64(a + 0x78, vault_1_mint_box)
																							st64(a + 0x70, ld64(s5d0))
																							st64(a + 0x68, ld64(s5c8))
																							st64(a + 0x60, ld64(s5c0))
																							st64(a + 0x58, ld64(s5b8))
																							st64(a + 0x50, ld64(s5b0))
																							st64(a + 0x48, ld64(s5a8))
																							st64(a + 0x40, ld64(s5a0))
																							st64(a + 0x38, ld64(s598))
																							st64(a + 0x30, ld64(s590))
																							st64(a + 0x28, ld64(s578))
																							st64(a + 0x20, ld64(s588))
																							st64(a + 0x18, ld64(s580))
																							st64(a + 0x10, ld64(s570))
																							st64(a + 8, k & -8)
																							st64(a, i)
																							return q
																						}
																						anchor_error_from(s548, 0x7dc /* anchor::ConstraintAddress */)
																						const cs = fn_4130(s558, ld64(s548), ld64(s548 + 8), "vault_1_mint", 0xc)
																						const cr = ld64(s558 + 8)
																						const cq = ld64(s558)
																						copy(s120, s160, 0x40)
																						q = Error_with_pubkeys(s568, cq, cr, s120, cs)
																						f = ld64(s568)
																						st64(a + 0x10, ld64(s568 + 8))
																						st64(a + 8, f)
																						st64(a, 0)
																						return q
																					}
																					anchor_error_from(s518, 0x7dc /* anchor::ConstraintAddress */)
																					const cn = fn_4130(s528, ld64(s518), ld64(s518 + 8), "vault_0_mint", 0xc)
																					const cm = ld64(s528 + 8)
																					const cl = ld64(s528)
																					copy(s120, s1a0, 0x40)
																					q = Error_with_pubkeys(s538, cl, cm, s120, cn)
																					f = ld64(s538)
																					st64(a + 0x10, ld64(s538 + 8))
																					st64(a + 8, f)
																					st64(a, 0)
																					return q
																				}
																				anchor_error_from(s4e8, 0x7dc /* anchor::ConstraintAddress */)
																				const ci = fn_4130(s4f8, ld64(s4e8), ld64(s4e8 + 8), "memo_program", 0xc)
																				const ch = ld64(s4f8 + 8)
																				const cg = ld64(s4f8)
																				copyr(s120, s1c0, 0x20)
																				st64(s100, 0x62129995a534a05 /* MEMO_PROGRAM */, 0x7c38da6071e8244d /* MEMO_PROGRAM[1] */, 0x81bb92bcddb5357c /* MEMO_PROGRAM[2] */, 0x8d44054140a81fe4 /* MEMO_PROGRAM[3] */) // key MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
																				q = Error_with_pubkeys(s508, cg, ch, s120, ci)
																				f = ld64(s508)
																				st64(a + 0x10, ld64(s508 + 8))
																				st64(a + 8, f)
																				st64(a, 0)
																				return q
																			}
																			anchor_error_from(s4b8, 0x7d0 /* anchor::ConstraintMut */)
																			q = fn_4130(s4c8, ld64(s4b8), ld64(s4b8 + 8), "recipient_token_account_1", 0x19)
																			f = ld64(s4c8)
																			st64(a + 0x10, ld64(s4c8 + 8))
																			st64(a + 8, f)
																			st64(a, 0)
																			return q
																		}
																		anchor_error_from(s488, 0x7d0 /* anchor::ConstraintMut */)
																		q = fn_4130(s498, ld64(s488), ld64(s488 + 8), "recipient_token_account_0", 0x19)
																		f = ld64(s498)
																		st64(a + 0x10, ld64(s498 + 8))
																		st64(a + 8, f)
																		st64(a, 0)
																		return q
																	}
																	anchor_error_from(s468, 0x7d3 /* anchor::ConstraintRaw */)
																	q = fn_4130(s478, ld64(s468), ld64(s468 + 8), "tick_array_upper", 0x10)
																	f = ld64(s478)
																	st64(a + 0x10, ld64(s478 + 8))
																	st64(a + 8, f)
																	st64(a, 0)
																	return q
																}
																anchor_error_from(s448, 0x7d0 /* anchor::ConstraintMut */)
																q = fn_4130(s458, ld64(s448), ld64(s448 + 8), "tick_array_upper", 0x10)
																f = ld64(s458)
																st64(a + 0x10, ld64(s458 + 8))
																st64(a + 8, f)
																st64(a, 0)
																return q
															}
															anchor_error_from(s428, 0x7d3 /* anchor::ConstraintRaw */)
															q = fn_4130(s438, ld64(s428), ld64(s428 + 8), "tick_array_lower", 0x10)
															f = ld64(s438)
															st64(a + 0x10, ld64(s438 + 8))
															st64(a + 8, f)
															st64(a, 0)
															return q
														}
														anchor_error_from(s408, 0x7d0 /* anchor::ConstraintMut */)
														q = fn_4130(s418, ld64(s408), ld64(s408 + 8), "tick_array_lower", 0x10)
														f = ld64(s418)
														st64(a + 0x10, ld64(s418 + 8))
														st64(a + 8, f)
														st64(a, 0)
														return q
													}
													anchor_error_from(s3e8, 0x7d3 /* anchor::ConstraintRaw */)
													q = fn_4130(s3f8, ld64(s3e8), ld64(s3e8 + 8), "token_vault_1", 0xd)
													f = ld64(s3f8)
													st64(a + 0x10, ld64(s3f8 + 8))
													st64(a + 8, f)
													st64(a, 0)
													return q
												}
												anchor_error_from(s3c8, 0x7d0 /* anchor::ConstraintMut */)
												q = fn_4130(s3d8, ld64(s3c8), ld64(s3c8 + 8), "token_vault_1", 0xd)
												f = ld64(s3d8)
												st64(a + 0x10, ld64(s3d8 + 8))
												st64(a + 8, f)
												st64(a, 0)
												return q
											}
											anchor_error_from(s3a8, 0x7d3 /* anchor::ConstraintRaw */)
											q = fn_4130(s3b8, ld64(s3a8), ld64(s3a8 + 8), "token_vault_0", 0xd)
											f = ld64(s3b8)
											st64(a + 0x10, ld64(s3b8 + 8))
											st64(a + 8, f)
											st64(a, 0)
											return q
										}
										anchor_error_from(s388, 0x7d0 /* anchor::ConstraintMut */)
										q = fn_4130(s398, ld64(s388), ld64(s388 + 8), "token_vault_0", 0xd)
										f = ld64(s398)
										st64(a + 0x10, ld64(s398 + 8))
										st64(a + 8, f)
										st64(a, 0)
										return q
									}
									anchor_error_from(s368, 0x7d0 /* anchor::ConstraintMut */)
									q = fn_4130(s378, ld64(s368), ld64(s368 + 8), "pool_state", 0xa)
									f = ld64(s378)
									st64(a + 0x10, ld64(s378 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return q
								}
								anchor_error_from(s348, 0x7d3 /* anchor::ConstraintRaw */)
								q = fn_4130(s358, ld64(s348), ld64(s348 + 8), 0x10015b06a /* "personal_position" */, 0x11)
								f = ld64(s358)
								st64(a + 0x10, ld64(s358 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return q
							}
							anchor_error_from(s328, 0x7d0 /* anchor::ConstraintMut */, bn)
							q = fn_4130(s338, ld64(s328), ld64(s328 + 8), 0x10015b06a /* "personal_position" */, 0x11)
							f = ld64(s338)
							st64(a + 0x10, ld64(s338 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
						q = anchor_error_from(s318, 0x7df /* anchor::ConstraintTokenOwner */)
						f = ld64(s318)
						st64(a + 0x10, ld64(s318 + 8))
						st64(a + 8, f)
						st64(a, 0)
						return q
					}
					anchor_error_from(s2d8, 0x7d3 /* anchor::ConstraintRaw */)
					q = fn_4130(s2e8, ld64(s2d8), ld64(s2d8 + 8), 0x10015b0ae /* "nft_account" */, 0xb)
					f = ld64(s2e8)
					st64(a + 0x10, ld64(s2e8 + 8))
					st64(a + 8, f)
					st64(a, 0)
					return q
				}
				const ac = ld64(0x300000000 /* heap bump-allocator cursor */)
				const ad = ac != 0 ? sat_sub(ac, 0xa) : 0x300007ff6
				if ((f & 1) != 0) {
					if (0x300000008 > ad) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, sat_sub(ac, 0xa), 0xa > ac)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, ad)
					st64(ad, 0x6174735f6c6f6f70)
					st16(ad + 8, 0x6574)
					void ld64(q)
				} else {
					if (0x300000008 > ad) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, sat_sub(ac, 0xa), 0xa > ac)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, ad)
					st64(ad, 0x6174735f6c6f6f70)
					st16(ad + 8, 0x6574)
					void ld64(q)
				}
				st64(q + 0x10, ad, 0xa)
				st64(q + 8, 0xa)
				st64(q, 1)
				st64(a + 0x10, q)
				st64(a + 8, f)
				st64(a, 0)
				return q
			}
			alloc_handle_alloc_error(8, 0x120)
		}
		alloc_handle_alloc_error(8, 0xd8)
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 9) : 0x300007ff7
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(g, 9), 9 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x656e776f5f74666e)
		st8(h + 8, 0x72)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(g, 9), 9 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x656e776f5f74666e)
		st8(h + 8, 0x72)
		void ld64(i)
	}
	st64(i + 0x10, h, 9)
	st64(i + 8, 9)
	st64(i, 1)
	st64(a + 0x10, i)
	st64(a + 8, f)
	st64(a, 0)
	return q
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value)
// types [heur]: b: DecreaseLiquidityV2Context (the handler ix_decrease_liquidity_v2 passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_34050(a: u64, b: DecreaseLiquidityV2Context, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s28 = fp - 0x28, s30 = fp - 0x30, s38 = fp - 0x38, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60, s68 = fp - 0x68, s80 = fp - 0x80, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sd0 = fp - 0xd0, sfc0 = fp - 0xfc0, s1000 = fp - 0x1000
	const accounts: DecreaseLiquidityV2Accounts = b.accounts
	let be = accounts
	const g: AccountInfo = ld64(ld64(accounts + 0x28) + 0x20)
	const h: LamportsCell = g.lamports
	const o = g.key
	rc_inc(h)
	const i: DataCell = g.data
	const bd = p6
	const j = p5
	rc_inc(i)
	const n = g.owner
	const m = g.rent_epoch
	const l = g.is_signer
	const k = g.is_writable
	st8(s98 + 2, g.executable)
	st8(s98, l, k)
	st64(sc0, o, h, i, n, m)
	const p: AccountInfo = ld64(ld64(be + 0x30) + 0x20)
	const q: LamportsCell = p.lamports
	const w = p.key
	rc_inc(q)
	const r: DataCell = p.data
	rc_inc(r)
	const v = p.owner
	const u = p.rent_epoch
	const t = p.is_signer
	const s = p.is_writable
	st8(s68 + 2, p.executable)
	st8(s68, t, s)
	st64(s90, w, q, r, v, u)
	const x: AccountInfo = ld64(ld64(be + 0x48) + 0x20)
	const y: LamportsCell = x.lamports
	const ae = x.key
	rc_inc(y)
	const z: DataCell = x.data
	rc_inc(z)
	const ad = x.owner
	const ac = x.rent_epoch
	const ab = x.is_signer
	const aa = x.is_writable
	st8(s38 + 2, x.executable)
	st8(s38, ab, aa)
	st64(s60, ae, y, z, ad, ac)
	const af: AccountInfo = ld64(ld64(be + 0x50) + 0x20)
	const ag: LamportsCell = af.lamports
	const am = af.key
	rc_inc(ag)
	const ah: DataCell = af.data
	rc_inc(ah)
	const al = af.owner
	const ak = af.rent_epoch
	const aj = af.is_signer
	const ai = af.is_writable
	st8(s8 + 2, af.executable)
	st8(s8, aj, ai)
	st64(s30, am, ag, ah, al, ak)
	const an = ld64(0x300000000 /* heap bump-allocator cursor */)
	const ao = an != 0 ? sat_sub(an, 0x80) & -8 : 0x300007f80
	if (ao > 0x300000007) {
		const bc = ld64(be + 0x60)
		const ap = ld64(be + 0x70)
		st64(0x300000000 /* heap bump-allocator cursor */, ao)
		const aq = ld64(ap + 0x58)
		memcpy(ao, ap, 0x58)
		st64(ao + 0x58, aq)
		st64(ao + 0x78, ld64(ap + 0x78))
		st64(ao + 0x70, ld64(ap + 0x70))
		st64(ao + 0x68, ld64(ap + 0x68))
		st64(ao + 0x60, ld64(ap + 0x60))
		const ar = ld64(0x300000000 /* heap bump-allocator cursor */)
		const at = ar != 0 ? sat_sub(ar, 0x80) & -8 : 0x300007f80
		if (at > 0x300000007) {
			const au = be
			const av = ld64(be + 0x78)
			st64(0x300000000 /* heap bump-allocator cursor */, at)
			be = ld64(av + 0x58)
			const ay = memcpy(at, av, 0x58)
			st64(at + 0x58, be)
			copy(at + 0x60, av + 0x60, 0x20)
			const remaining_accounts: AccountInfo = b.remaining_accounts
			const aw = b.remaining_accounts_len
			st64(sfc0, ao, at, remaining_accounts, aw, c, d, j, bd)
			st64(s1000, s90, au + 0x38, au + 0x40, s60, s30, au + 0x58, bc)
			let az = fn_2d880(sd0, au + 0x18, au + 0x10, sc0, fp, ay)
			const ba = ld64(sd0 + 8)
			const bb = ld64(sd0)
			if (rc_release(ag)) {
				az = Rc_drop_slow_14df0(s28, az)
			}
			if (rc_release(ah)) {
				az = Rc_drop_slow_14df0(s20, az)
			}
			if (rc_release(y)) {
				az = Rc_drop_slow_14df0(s58, az)
			}
			if (rc_release(z)) {
				az = Rc_drop_slow_14df0(s50, az)
			}
			if (rc_release(q)) {
				az = Rc_drop_slow_14df0(s88, az)
			}
			if (rc_release(r)) {
				az = Rc_drop_slow_14df0(s80, az)
			}
			if (rc_release(h)) {
				az = Rc_drop_slow_14df0(sb8, az)
			}
			if (!rc_release(i)) {
				st64(a + 8, ba)
				st64(a, bb)
				return az
			}
			az = Rc_drop_slow_14df0(sb0, az)
			st64(a + 8, ba)
			st64(a, bb)
			return az
		}
		alloc_handle_alloc_error(8, 0x80)
	}
	alloc_handle_alloc_error(8, 0x80)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: tick_array_upper, recipient_token_account_0, recipient_token_account_1
export function fn_b4c78(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8
	let i, o, p, ac: u64
	let ab = fn_b4e0(s28, ld64(b + 0x10), 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
	let f = ld64(s28)
	if (f == 2) {
		ab = fn_a80(s38, ld64(b + 0x18), c)
		f = ld64(s38)
		if (f == 2) {
			B46: {
				const l = ld64(b + 0x28)
				const m = ld64(l + 0x20)
				if ((memcmp(l, c, 0x20) as u32) == 0 && (common_is_closed(m) == 0 && ld64(ld64(m + 0x10) + 0x10) != 0)) {
					st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
					ab = fn_13e628(s48, s18)
					f = ld64(s48)
					if (f != 2) {
						const n = ld64(0x300000000 /* heap bump-allocator cursor */)
						o = 0xd > n
						p = n != 0 ? o != 0 ? 0 : n - 0xd : 0x300007ff3
						i = ld64(s48 + 8)
						if ((f & 1) != 0) {
							if (0x300000008 > p) {
								raw_vec_handle_error(1, 0xd, 0x10015f8f8, o, ac)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, p)
							st64(p + 5, 0x305f746c7561765f)
							st64(p, 0x61765f6e656b6f74)
							void ld64(i)
							break B46
						}
						if (0x300000008 > p) {
							raw_vec_handle_error(1, 0xd, 0x10015f8f8, o, ac)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, p)
						st64(p + 5, 0x305f746c7561765f)
						st64(p, 0x61765f6e656b6f74)
						void ld64(i)
						break B46
					}
				}
				const q = ld64(b + 0x30)
				const r = ld64(q + 0x20)
				if ((memcmp(q, c, 0x20) as u32) == 0 && (common_is_closed(r) == 0 && ld64(ld64(r + 0x10) + 0x10) != 0)) {
					st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
					ab = fn_13e628(s58, s18)
					f = ld64(s58)
					if (f != 2) {
						const s = ld64(0x300000000 /* heap bump-allocator cursor */)
						o = 0xd > s
						p = s != 0 ? o != 0 ? 0 : s - 0xd : 0x300007ff3
						i = ld64(s58 + 8)
						if ((f & 1) != 0) {
							if (0x300000008 > p) {
								raw_vec_handle_error(1, 0xd, 0x10015f8f8, o, ac)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, p)
							st64(p + 5, 0x315f746c7561765f)
							st64(p, 0x61765f6e656b6f74)
							void ld64(i)
							break B46
						}
						if (0x300000008 > p) {
							raw_vec_handle_error(1, 0xd, 0x10015f8f8, o, ac)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, p)
						st64(p + 5, 0x315f746c7561765f)
						st64(p, 0x61765f6e656b6f74)
						void ld64(i)
						break B46
					}
				}
				ab = fn_1008(s68, ld64(b + 0x38), c)
				f = ld64(s68)
				if (f == 2) {
					fn_1008(s78, ld64(b + 0x40), c)
					const v = ld64(s78)
					if (v != 2) {
						ab = fn_4130(s88, v, ld64(s78 + 8), "tick_array_upper", 0x10)
						i = ld64(s88 + 8)
						f = ld64(s88)
						if (f != 2) {
							st64(a + 8, i)
							st64(a, f)
							return ab
						}
					}
					const w = ld64(b + 0x48)
					fn_a1d8(s98, ld64(w + 0x20), w, c)
					const x = ld64(s98)
					if (x != 2) {
						ab = fn_4130(sa8, x, ld64(s98 + 8), "recipient_token_account_0", 0x19)
						i = ld64(sa8 + 8)
						f = ld64(sa8)
						if (f != 2) {
							st64(a + 8, i)
							st64(a, f)
							return ab
						}
					}
					const y = ld64(b + 0x50)
					ab = fn_a1d8(sb8, ld64(y + 0x20), y, c)
					i = undef
					const z = ld64(sb8)
					if (z == 2) {
						st64(a + 8, i)
						st64(a, 2)
						return ab
					}
					ab = fn_4130(sc8, z, ld64(sb8 + 8), "recipient_token_account_1", 0x19)
					i = undef
					const aa = ld64(sc8)
					if (aa == 2) {
						st64(a + 8, i)
						st64(a, 2)
						return ab
					}
					st64(a + 8, ld64(sc8 + 8))
					st64(a, aa)
					return ab
				}
				const t = ld64(0x300000000 /* heap bump-allocator cursor */)
				const u = t != 0 ? sat_sub(t, 0x10) : 0x300007ff0
				i = ld64(s68 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > u) {
						raw_vec_handle_error(1, 0x10, 0x10015f8f8, 0x10 > t)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, u)
					st64(u + 8, 0x7265776f6c5f7961)
					st64(u, 0x7272615f6b636974)
					void ld64(i)
				} else {
					if (0x300000008 > u) {
						raw_vec_handle_error(1, 0x10, 0x10015f8f8, 0x10 > t)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, u)
					st64(u + 8, 0x7265776f6c5f7961)
					st64(u, 0x7272615f6b636974)
					void ld64(i)
				}
				st64(i + 0x10, u, 0x10)
				st64(i + 8, 0x10)
				st64(i, 1)
				st64(a + 8, i)
				st64(a, f)
				return ab
			}
			st64(i + 0x10, p, 0xd)
			st64(i + 8, 0xd)
			st64(i, 1)
			st64(a + 8, i)
			st64(a, f)
			return ab
		}
		const j = ld64(0x300000000 /* heap bump-allocator cursor */)
		const k = j != 0 ? sat_sub(j, 0xa) : 0x300007ff6
		i = ld64(s38 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > k) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, k)
			st64(k, 0x6174735f6c6f6f70)
			st16(k + 8, 0x6574)
			void ld64(i)
		} else {
			if (0x300000008 > k) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, k)
			st64(k, 0x6174735f6c6f6f70)
			st16(k + 8, 0x6574)
			void ld64(i)
		}
		st64(i + 0x10, k, 0xa)
		st64(i + 8, 0xa)
		st64(i, 1)
		st64(a + 8, i)
		st64(a, f)
		return ab
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0x11) : 0x300007fef
	i = ld64(s28 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x11 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 8, 0x6f697469736f705f)
		st64(h, 0x6c616e6f73726570)
		st8(h + 0x10, 0x6e)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x11 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 8, 0x6f697469736f705f)
		st64(h, 0x6c616e6f73726570)
		st8(h + 0x10, 0x6e)
		void ld64(i)
	}
	st64(i + 0x10, h, 0x11)
	st64(i + 8, 0x11)
	st64(i, 1)
	st64(a + 8, i)
	st64(a, f)
	return ab
}
