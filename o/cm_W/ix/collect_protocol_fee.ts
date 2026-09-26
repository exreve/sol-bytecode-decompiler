/// <reference path="../lib.d.ts" />
// instruction collect_protocol_fee
import { anchor_error_from, fn_4130, fn_4dc0, fn_53e8, fn_7a038, fn_88360, fn_c9aa0, log_data, memcpy } from '../shared.ts'

// instruction handler: collect_protocol_fee (discriminator sha256("global:collect_protocol_fee")[..8] = 0x597e42c2ddfc8888)
// accounts [idl]: 0 owner [signer], 1 pool_state [mut], 2 amm_config, 3 token_vault_0 [mut], 4 token_vault_1 [mut], 5 vault_0_mint, 6 vault_1_mint, 7 recipient_token_account_0 [mut], 8 recipient_token_account_1 [mut], 9 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 10 token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb]
// args [idl]: amount_0_requested: u64, amount_1_requested: u64
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, amount_0_requested, amount_1_requested
export function ix_collect_protocol_fee(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc8 = fp - 0xc8, s178 = fp - 0x178, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0
	let l, p: u64
	const i = sol_log("Instruction: CollectProtocolFee", 0x1f)
	const f = ix_args_len
	if (f >= 8 && (f & -8) != 8) {
		const args: CollectProtocolFeeArgs = ix_args
		const amount_0_requested = args.amount_0_requested
		const amount_1_requested = args.amount_1_requested
		st64(s1a0, accounts, accounts_len)
		p = accounts_collect_protocol_fee(sc8, amount_0_requested, s1a0, undef, fp, i)
		const k = ld64(sb8)
		l = ld64(sc8 + 8)
		const j = ld64(sc8)
		if (j == 0) {
			st64(a + 8, k)
			st64(a, l)
			return p
		}
		const m = memcpy(s178, sb0, 0xb0)
		st64(s190, j, l, k)
		copyr(sb8, s1a0, 0x10)
		st64(sc8, program_id, s190)
		p = fn_4d0a8(s1b0, sc8, amount_0_requested, amount_1_requested, undef, m)
		l = ld64(s1b0)
		if (l == 2) {
			p = fn_c9aa0(s1c0, s190, program_id)
			l = ld64(s1c0)
			st64(a + 8, ld64(s1c0 + 8))
			st64(a, l)
			return p
		}
		st64(a + 8, ld64(s1b0 + 8))
		st64(a, l)
		return p
	}
	const n = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (n & 3) - 2) {
		p = anchor_error_from(s1d0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s1d0)
		st64(a + 8, ld64(s1d0 + 8))
		st64(a, l)
		return p
	}
	if ((n & 3) == 0) {
		p = anchor_error_from(s1d0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s1d0)
		st64(a + 8, ld64(s1d0 + 8))
		st64(a, l)
		return p
	}
	const o = ld64(ld64(n + 7))
	if (o == 0) {
		p = anchor_error_from(s1d0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s1d0)
		st64(a + 8, ld64(s1d0 + 8))
		st64(a, l)
		return p
	}
	callx(o, ld64(n - 1), o)
	p = anchor_error_from(s1d0, 0x66 /* anchor::InstructionDidNotDeserialize */)
	l = ld64(s1d0)
	st64(a + 8, ld64(s1d0 + 8))
	st64(a, l)
	return p
}

// Anchor Accounts::try_accounts of instruction collect_protocol_fee (called by ix_collect_protocol_fee; name [str]: from the handler's "Instruction: …" log; was fn_c5a90)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: vault_0_mint (ConstraintAddress), vault_1_mint (ConstraintAddress), recipient_token_account_0 (ConstraintMut), recipient_token_account_1 (ConstraintMut), token_program, token_program_2022, owner, token_vault_1 (ConstraintMut, ConstraintRaw), token_vault_0 (ConstraintMut, ConstraintRaw), amm_config (ConstraintAddress), pool_state (ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: recipient_token_account_1_box, pool_state [idl], token_vault_0, token_vault_1
export function accounts_collect_protocol_fee(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const sc0 = fp - 0xc0, sd8 = fp - 0xd8, sf8 = fp - 0xf8, s118 = fp - 0x118, s138 = fp - 0x138, s158 = fp - 0x158, s170 = fp - 0x170, s190 = fp - 0x190, s1b0 = fp - 0x1b0, s1d0 = fp - 0x1d0, s230 = fp - 0x230, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4b8 = fp - 0x4b8, s4c0 = fp - 0x4c0, s4c8 = fp - 0x4c8, s4d0 = fp - 0x4d0, s4d8 = fp - 0x4d8, s4e0 = fp - 0x4e0, s4e8 = fp - 0x4e8, s4f0 = fp - 0x4f0, s4f8 = fp - 0x4f8, s500 = fp - 0x500
	let l, m, aa, ai, aj, ak, am, an, ap, aq, at, au, aw, ax, bm, bn, bo, ci, cj: u64
	let recipient_token_account_1_box: TokenAccount
	let j = a
	let q = try_accounts_17a30(sd8, c, c, d, e, r0)
	const i = ld64(sd8 + 8)
	let f = ld64(sd8)
	if (f == 2) {
		q = fn_11e0(sd8, c)
		const o = ld64(sd8 + 8)
		f = ld64(sd8)
		if (f == 2) {
			try_accounts_184d8(sd8, c)
			q = ld64(sd8 + 0x10)
			l = ld64(sd8 + 8)
			const p = ld64(sd8)
			if (p == 0) {
				const u = ld64(0x300000000 /* heap bump-allocator cursor */)
				m = 0xa > u
				const v = u != 0 ? m != 0 ? 0 : u - 0xa : 0x300007ff6
				if ((l & 1) != 0) {
					if (0x300000008 > v) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, m, l)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, v)
					st64(v, 0x666e6f635f6d6d61)
					st16(v + 8, 0x6769)
					void ld64(q)
				} else {
					if (0x300000008 > v) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, m, l)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, v)
					st64(v, 0x666e6f635f6d6d61)
					st16(v + 8, 0x6769)
					void ld64(q)
				}
				st64(q + 0x10, v, 0xa)
				st64(q + 8, 0xa)
				st64(q, 1)
				st64(j + 0x10, q)
				st64(j + 8, l)
				st64(j, 0)
				return q
			}
			st64(s4b8, o, i, j, c)
			memcpy(s230, sc0, 0x60)
			st64(s4d0, q)
			st64(s2a0 + 8, q)
			st64(s4c8, l)
			st64(s2a0, l)
			st64(s4c0, p)
			st64(s2b8 + 0x10, p)
			const r = ld64(s4b8 + 0x18)
			memcpy(s290, s230, 0x60)
			q = try_accounts_1678(sd8, r)
			if (ld32(sc0 + 0x98) == 2) {
				const w = ld64(0x300000000 /* heap bump-allocator cursor */)
				aa = ld64(s4b8 + 0x10)
				const x = ld64(sd8)
				const y = w != 0 ? sat_sub(w, 0xd) : 0x300007ff3
				const z = ld64(sd8 + 8)
				if (x != 0) {
					if (0x300000008 > y) {
						raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0x300000008, aa)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, y)
					st64(y + 5, 0x305f746c7561765f)
					st64(y, 0x61765f6e656b6f74)
					void ld64(z)
				} else {
					if (0x300000008 > y) {
						raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0x300000008, aa)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, y)
					st64(y + 5, 0x305f746c7561765f)
					st64(y, 0x61765f6e656b6f74)
					void ld64(z)
				}
				st64(z + 0x10, y, 0xd)
				st64(z + 8, 0xd)
				st64(z, 1)
				st64(aa + 0x10, z)
				st64(aa + 8, x)
				st64(aa, 0)
				return q
			}
			const s = ld64(0x300000000 /* heap bump-allocator cursor */)
			j = ld64(s4b8 + 0x10)
			const az = ld64(s4b8 + 8)
			const t = s != 0 ? sat_sub(s, 0xd8) : 0x300007f28
			if (0x300000008 > t) {
				alloc_handle_alloc_error(8, 0xd8)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, t & -8)
			if ((t & -8) != 0) {
				memcpy(t & -8, sd8, 0xd8)
				q = try_accounts_1678(sd8, r)
				aa = undef
				if (ld32(sc0 + 0x98) == 2) {
					const ad = ld64(0x300000000 /* heap bump-allocator cursor */)
					f = ld64(sd8)
					const ae = ad != 0 ? sat_sub(ad, 0xd) : 0x300007ff3
					recipient_token_account_1_box = ld64(sd8 + 8)
					if (f != 0) {
						if (0x300000008 > ae) {
							raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0x300000008, aa)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ae)
						st64(ae + 5, 0x315f746c7561765f)
						st64(ae, 0x61765f6e656b6f74)
						void ld64(recipient_token_account_1_box)
					} else {
						if (0x300000008 > ae) {
							raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0x300000008, aa)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ae)
						st64(ae + 5, 0x315f746c7561765f)
						st64(ae, 0x61765f6e656b6f74)
						void ld64(recipient_token_account_1_box)
					}
					st64(recipient_token_account_1_box + 0x10, ae, 0xd)
					st64(recipient_token_account_1_box + 8, 0xd)
					st64(recipient_token_account_1_box, 1)
					st64(j + 0x10, recipient_token_account_1_box)
					st64(j + 8, f)
					st64(j, 0)
					return q
				}
				const ab = ld64(0x300000000 /* heap bump-allocator cursor */)
				const ac = ab != 0 ? sat_sub(ab, 0xd8) : 0x300007f28
				if (0x300000008 > ac) {
					alloc_handle_alloc_error(8, 0xd8)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ac & -8)
				if ((ac & -8) != 0) {
					memcpy(ac & -8, sd8, 0xd8)
					try_accounts_15c0(sd8, ld64(s4b8 + 0x18))
					if (ld32(sd8) == 2) {
						q = fn_4130(s2b8, ld64(sd8 + 8), ld64(sd8 + 0x10), "vault_0_mint", 0xc)
						st64(s4d8, ld64(s2b8 + 8))
						f = ld64(s2b8)
						if (f != 2) {
							st64(j + 0x10, ld64(s4d8))
							st64(j + 8, f)
							st64(j, 0)
							return q
						}
					} else {
						const ag = ld64(0x300000000 /* heap bump-allocator cursor */)
						const ah = ag != 0 ? sat_sub(ag, 0x80) : 0x300007f80
						if (0x300000008 > ah) {
							alloc_handle_alloc_error(8, 0x80)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ah & -8)
						if ((ah & -8) == 0) {
							alloc_handle_alloc_error(8, 0x80)
						}
						st64(s4d8, ah & -8)
						memcpy(ah & -8, sd8, 0x80)
					}
					fn_7768(sd8, ld64(s4b8 + 0x18), ai, aj, ak)
					recipient_token_account_1_box = ld64(sd8 + 8)
					const al = ld64(sd8)
					if (al != 2) {
						q = fn_4130(s2c8, al, recipient_token_account_1_box, "vault_1_mint", 0xc)
						recipient_token_account_1_box = ld64(s2c8 + 8)
						f = ld64(s2c8)
						if (f != 2) {
							st64(j + 0x10, recipient_token_account_1_box)
							st64(j + 8, f)
							st64(j, 0)
							return q
						}
					}
					st64(s4e0, recipient_token_account_1_box)
					fn_7498(sd8, ld64(s4b8 + 0x18), recipient_token_account_1_box, am, an)
					recipient_token_account_1_box = ld64(sd8 + 8)
					const ao = ld64(sd8)
					if (ao != 2) {
						q = fn_4130(s2d8, ao, recipient_token_account_1_box, "recipient_token_account_0", 0x19)
						recipient_token_account_1_box = ld64(s2d8 + 8)
						f = ld64(s2d8)
						if (f != 2) {
							st64(j + 0x10, recipient_token_account_1_box)
							st64(j + 8, f)
							st64(j, 0)
							return q
						}
					}
					st64(s4e8, recipient_token_account_1_box)
					fn_7498(sd8, ld64(s4b8 + 0x18), recipient_token_account_1_box, ap, aq)
					recipient_token_account_1_box = ld64(sd8 + 8)
					const ar = ld64(sd8)
					if (ar != 2) {
						q = fn_4130(s2e8, ar, recipient_token_account_1_box, "recipient_token_account_1", 0x19)
						recipient_token_account_1_box = ld64(s2e8 + 8)
						f = ld64(s2e8)
						if (f != 2) {
							st64(j + 0x10, recipient_token_account_1_box)
							st64(j + 8, f)
							st64(j, 0)
							return q
						}
					}
					st64(s4f0, recipient_token_account_1_box)
					try_accounts_19190(sd8, ld64(s4b8 + 0x18), recipient_token_account_1_box, at, au)
					recipient_token_account_1_box = ld64(sd8 + 8)
					const av = ld64(sd8)
					if (av != 2) {
						q = fn_4130(s2f8, av, recipient_token_account_1_box, 0x10015b020 /* "token_program" */, 0xd)
						recipient_token_account_1_box = ld64(s2f8 + 8)
						f = ld64(s2f8)
						if (f != 2) {
							st64(j + 0x10, recipient_token_account_1_box)
							st64(j + 8, f)
							st64(j, 0)
							return q
						}
					}
					st64(s4f8, recipient_token_account_1_box)
					fn_18cf0(sd8, ld64(s4b8 + 0x18), recipient_token_account_1_box, aw, ax)
					recipient_token_account_1_box = ld64(sd8 + 8)
					const ay = ld64(sd8)
					if (ay != 2) {
						q = fn_4130(s308, ay, recipient_token_account_1_box, "token_program_2022", 0x12)
						recipient_token_account_1_box = ld64(s308 + 8)
						f = ld64(s308)
						if (f != 2) {
							st64(j + 0x10, recipient_token_account_1_box)
							st64(j + 8, f)
							st64(j, 0)
							return q
						}
					}
					st64(s500, recipient_token_account_1_box)
					st64(s4b8 + 0x18, ac & -8)
					const ba = ld64(az)
					copyr(s1d0, ba, 0x20)
					const bb = memcmp(s1d0, s2a0, 0x20)
					let bc = bb as u32
					if (bc != 0) {
						copyr(sd8, ba, 0x20)
						const bd = memcmp(sd8, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20)
						bc = bd as u32
						if (bc != 0) {
							fn_88360(s318, 0)
							q = fn_4130(s328, ld64(s318), ld64(s318 + 8), 0x10015b1d0 /* "owner" */, 5)
							f = ld64(s328)
							st64(j + 0x10, ld64(s328 + 8))
							st64(j + 8, f)
							st64(j, 0)
							return q
						}
					}
					const pool_state: AccountInfo = ld64(s4b8)
					if (pool_state.is_writable != 0) {
						const bf = ld64(ld64(s4c0))
						copyr(s1b0, bf, 0x20)
						q = fn_4dc0(sd8, pool_state, bc)
						const bh = ld64(sd8 + 0x10)
						let bg = ld64(sd8 + 8)
						if (ld64(sd8) != 0) {
							st64(j + 0x10, bh)
							st64(j + 8, bg)
							st64(j, 0)
							return q
						}
						copyr(s190, bg + 1, 0x20)
						st64(bh, ld64(bh) - 1)
						const bi = memcmp(s1b0, s190, 0x20)
						if ((bi as u32) == 0) {
							const token_vault_0: AccountInfo = ld64((t & -8) + 0x20)
							if (token_vault_0.is_writable != 0) {
								const bq = token_vault_0.key
								copyr(sd8, bq, 0x20)
								q = fn_4dc0(s170, ld64(s4b8), bi as u32)
								const br = ld64(s170 + 0x10)
								bg = ld64(s170 + 8)
								if (ld64(s170) != 0) {
									st64(j + 0x10, br)
									st64(j + 8, bg)
									st64(j, 0)
									return q
								}
								const bs = memcmp(sd8, bg + 0x81, 0x20)
								st64(br, ld64(br) - 1)
								if ((bs as u32) == 0) {
									const token_vault_1: AccountInfo = ld64(ld64(s4b8 + 0x18) + 0x20)
									if (token_vault_1.is_writable != 0) {
										const bu = token_vault_1.key
										copyr(sd8, bu, 0x20)
										q = fn_4dc0(s170, ld64(s4b8), bs as u32)
										const bw = ld64(s170 + 0x10)
										const bv = ld64(s170 + 8)
										if (ld64(s170) != 0) {
											const by = ld64(s4b8 + 0x10)
											st64(by + 0x10, bw)
											st64(by + 8, bv)
											st64(by, 0)
											return q
										}
										const bx = memcmp(sd8, bv + 0xa1, 0x20)
										st64(bw, ld64(bw) - 1)
										if ((bx as u32) == 0) {
											const bz = ld64(ld64(ld64(s4d8) + 0x58))
											copyr(s158, bz, 0x20)
											copy(s138, (t & -8) + 0x28, 0x20)
											if ((memcmp(s158, s138, 0x20) as u32) != 0) {
												anchor_error_from(s408, 0x7dc /* anchor::ConstraintAddress */)
												const ch = fn_4130(s418, ld64(s408), ld64(s408 + 8), "vault_0_mint", 0xc)
												const cg = ld64(s418 + 8)
												const cf = ld64(s418)
												copy(sd8, s158, 0x40)
												q = Error_with_pubkeys(s428, cf, cg, sd8, ch)
												cj = ld64(s428)
												ci = ld64(s4b8 + 0x10)
												st64(ci + 0x10, ld64(s428 + 8))
												st64(ci + 8, cj)
												st64(ci, 0)
												return q
											}
											const ca = ld64(ld64(ld64(s4e0) + 0x58))
											copyr(s118, ca, 0x20)
											const cb = ld64(s4b8 + 0x18)
											copy(sf8, cb + 0x28, 0x20)
											if ((memcmp(s118, sf8, 0x20) as u32) == 0) {
												if (ld8(ld64(ld64(s4e8) + 0x20) + 0x29) != 0) {
													if (ld8(ld64(ld64(s4f0) + 0x20) + 0x29) != 0) {
														const ck = ld64(s4b8 + 0x10)
														q = memcpy(ck + 0x28, s230, 0x60)
														st64(ck + 0xc0, ld64(s500))
														st64(ck + 0xb8, ld64(s4f8))
														st64(ck + 0xb0, ld64(s4f0))
														st64(ck + 0xa8, ld64(s4e8))
														st64(ck + 0xa0, ld64(s4e0))
														st64(ck + 0x98, ld64(s4d8))
														st64(ck + 0x90, ld64(s4b8 + 0x18))
														st64(ck + 0x88, t & -8)
														st64(ck + 0x20, ld64(s4d0))
														st64(ck + 0x18, ld64(s4c8))
														st64(ck + 0x10, ld64(s4c0))
														st64(ck + 8, ld64(s4b8))
														st64(ck, ld64(s4b8 + 8))
														return q
													}
													anchor_error_from(s488, 0x7d0 /* anchor::ConstraintMut */)
													q = fn_4130(s498, ld64(s488), ld64(s488 + 8), "recipient_token_account_1", 0x19)
													cj = ld64(s498)
													ci = ld64(s4b8 + 0x10)
													st64(ci + 0x10, ld64(s498 + 8))
													st64(ci + 8, cj)
													st64(ci, 0)
													return q
												}
												anchor_error_from(s468, 0x7d0 /* anchor::ConstraintMut */)
												q = fn_4130(s478, ld64(s468), ld64(s468 + 8), "recipient_token_account_0", 0x19)
												cj = ld64(s478)
												ci = ld64(s4b8 + 0x10)
												st64(ci + 0x10, ld64(s478 + 8))
												st64(ci + 8, cj)
												st64(ci, 0)
												return q
											}
											anchor_error_from(s438, 0x7dc /* anchor::ConstraintAddress */)
											const ce = fn_4130(s448, ld64(s438), ld64(s438 + 8), "vault_1_mint", 0xc)
											const cd = ld64(s448 + 8)
											const cc = ld64(s448)
											copy(sd8, s118, 0x40)
											q = Error_with_pubkeys(s458, cc, cd, sd8, ce)
											cj = ld64(s458)
											ci = ld64(s4b8 + 0x10)
											st64(ci + 0x10, ld64(s458 + 8))
											st64(ci + 8, cj)
											st64(ci, 0)
											return q
										}
										anchor_error_from(s3e8, 0x7d3 /* anchor::ConstraintRaw */)
										q = fn_4130(s3f8, ld64(s3e8), ld64(s3e8 + 8), "token_vault_1", 0xd)
										cj = ld64(s3f8)
										ci = ld64(s4b8 + 0x10)
										st64(ci + 0x10, ld64(s3f8 + 8))
										st64(ci + 8, cj)
										st64(ci, 0)
										return q
									}
									anchor_error_from(s3c8, 0x7d0 /* anchor::ConstraintMut */)
									q = fn_4130(s3d8, ld64(s3c8), ld64(s3c8 + 8), "token_vault_1", 0xd)
									cj = ld64(s3d8)
									ci = ld64(s4b8 + 0x10)
									st64(ci + 0x10, ld64(s3d8 + 8))
									st64(ci + 8, cj)
									st64(ci, 0)
									return q
								}
								anchor_error_from(s3a8, 0x7d3 /* anchor::ConstraintRaw */)
								q = fn_4130(s3b8, ld64(s3a8), ld64(s3a8 + 8), "token_vault_0", 0xd)
								f = ld64(s3b8)
								st64(j + 0x10, ld64(s3b8 + 8))
								st64(j + 8, f)
								st64(j, 0)
								return q
							}
							anchor_error_from(s388, 0x7d0 /* anchor::ConstraintMut */)
							q = fn_4130(s398, ld64(s388), ld64(s388 + 8), "token_vault_0", 0xd)
							f = ld64(s398)
							st64(j + 0x10, ld64(s398 + 8))
							st64(j + 8, f)
							st64(j, 0)
							return q
						}
						anchor_error_from(s358, 0x7dc /* anchor::ConstraintAddress */)
						const bl = fn_4130(s368, ld64(s358), ld64(s358 + 8), 0x10015af4d /* "amm_config" */, 0xa)
						const bk = ld64(s368 + 8)
						const bj = ld64(s368)
						copy(sd8, s1b0, 0x40)
						q = Error_with_pubkeys(s378, bj, bk, sd8, bl)
						f = ld64(s378)
						st64(j + 0x10, ld64(s378 + 8))
						st64(j + 8, f)
						st64(j, 0)
						return q
					}
					anchor_error_from(s338, 0x7d0 /* anchor::ConstraintMut */, bm, bn, bo)
					q = fn_4130(s348, ld64(s338), ld64(s338 + 8), "pool_state", 0xa)
					f = ld64(s348)
					st64(j + 0x10, ld64(s348 + 8))
					st64(j + 8, f)
					st64(j, 0)
					return q
				}
				alloc_handle_alloc_error(8, 0xd8)
			}
			alloc_handle_alloc_error(8, 0xd8)
		}
		const k = ld64(0x300000000 /* heap bump-allocator cursor */)
		l = 0xa > k
		m = l != 0 ? 0 : k - 0xa
		const n = k != 0 ? m : 0x300007ff6
		if ((f & 1) != 0) {
			if (0x300000008 > n) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, m, l)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, n)
			st64(n, 0x6174735f6c6f6f70)
			st16(n + 8, 0x6574)
			void ld64(o)
		} else {
			if (0x300000008 > n) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, m, l)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, n)
			st64(n, 0x6174735f6c6f6f70)
			st16(n + 8, 0x6574)
			void ld64(o)
		}
		st64(o + 0x10, n, 0xa)
		st64(o + 8, 0xa)
		st64(o, 1)
		st64(j + 0x10, o)
		st64(j + 8, f)
		st64(j, 0)
		return q
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 5) : 0x300007ffb
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(g, 5), 5 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 4, 0x72)
		st32(h, 0x656e776f)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(g, 5), 5 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 4, 0x72)
		st32(h, 0x656e776f)
		void ld64(i)
	}
	st64(i + 0x10, h, 5)
	st64(i + 8, 5)
	st64(i, 1)
	st64(j + 0x10, i)
	st64(j + 8, f)
	st64(j, 0)
	return q
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value)
// types [heur]: b: CollectProtocolFeeContext (the handler ix_collect_protocol_fee passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_4d0a8(a: u64, b: CollectProtocolFeeContext, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s60 = fp - 0x60, s68 = fp - 0x68, s80 = fp - 0x80, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0
	let bz: u64
	const accounts: CollectProtocolFeeAccounts = b.accounts
	let an = fn_53e8(s60, ld64(accounts + 8), c, d, e, r0)
	let j = ld64(s60 + 0x10)
	let g = ld64(s60 + 8)
	if (ld64(s60) != 0) {
		st64(a + 8, j)
		st64(a, g)
		return an
	}
	const h = ld64(g + 0x135)
	st64(g + 0x135, h - min(h, d))
	const i = ld64(g + 0x12d)
	st64(g + 0x12d, i - min(i, c))
	st64(j, ld64(j) + 1)
	const k: AccountInfo = ld64(ld64(accounts + 0x88) + 0x20)
	const l: LamportsCell = k.lamports
	const r = k.key
	rc_inc(l)
	const m: DataCell = k.data
	rc_inc(m)
	const q = k.owner
	const p = k.rent_epoch
	const o = k.is_signer
	const n = k.is_writable
	st8(s98 + 2, k.executable)
	st8(s98, o, n)
	st64(sc0, r, l, m, q, p)
	const s: AccountInfo = accounts.recipient_token_account_0.info
	const t: LamportsCell = s.lamports
	const z = s.key
	rc_inc(t)
	const u: DataCell = s.data
	rc_inc(u)
	const y = s.owner
	const x = s.rent_epoch
	let ce = u
	const w = s.is_signer
	const v = s.is_writable
	st8(s68 + 2, s.executable)
	st8(s68, w, v)
	st64(s90, z, t, u, y, x)
	const aa = ld64(0x300000000 /* heap bump-allocator cursor */)
	let cb = t
	const ab = aa != 0 ? sat_sub(aa, 0x80) & -8 : 0x300007f80
	let cc = m
	let cd = l
	if (ab > 0x300000007) {
		const ac = ld64(accounts + 0x98)
		st64(0x300000000 /* heap bump-allocator cursor */, ab)
		const ad = ld64(ac + 0x58)
		memcpy(ab, ac, 0x58)
		st64(ab + 0x58, ad)
		copy(ab + 0x60, ac + 0x60, 0x20)
		const ae: AccountInfo = ld64(accounts + 0xc0)
		const af: LamportsCell = ae.lamports
		const ah = ld64(accounts + 0xb8)
		const am = ae.key
		rc_inc(af)
		const ag: DataCell = ae.data
		rc_inc(ag)
		const al = ae.owner
		const ak = ae.rent_epoch
		const aj = ae.is_signer
		const ai = ae.is_writable
		st8(s38 + 2, ae.executable)
		st8(s38, aj, ai)
		st64(s60, am, af, ag, al, ak)
		an = fn_7a038(sd0, accounts + 8, sc0, s90, ab, ah, s60, min(i, c), al)
		j = ld64(sd0 + 8)
		g = ld64(sd0)
		if (rc_release(cb)) {
			an = Rc_drop_slow_14df0(s88, an)
		}
		const ao = cc
		if (rc_release(ce)) {
			an = Rc_drop_slow_14df0(s80, an)
		}
		if (rc_release(cd)) {
			an = Rc_drop_slow_14df0(sb8, an)
		}
		if (rc_release(ao)) {
			an = Rc_drop_slow_14df0(sb0, an)
		}
		if (g != 2) {
			st64(a + 8, j)
			st64(a, g)
			return an
		}
		const ap: AccountInfo = ld64(ld64(accounts + 0x90) + 0x20)
		const aq: LamportsCell = ap.lamports
		const ax = ap.key
		rc_inc(aq)
		const ar: DataCell = ap.data
		rc_inc(ar)
		const aw = ap.owner
		const av = ap.rent_epoch
		const au = ap.is_signer
		const at = ap.is_writable
		st8(s98 + 2, ap.executable)
		st8(s98, au, at)
		st64(sc0, ax, aq, ar, aw, av)
		const ay: AccountInfo = accounts.recipient_token_account_1.info
		const az: LamportsCell = ay.lamports
		const bf = ay.key
		rc_inc(az)
		const ba: DataCell = ay.data
		rc_inc(ba)
		const be = ay.owner
		const bd = ay.rent_epoch
		const bc = ay.is_signer
		const bb = ay.is_writable
		st8(s68 + 2, ay.executable)
		st8(s68, bc, bb)
		st64(s90, bf, az, ba, be, bd)
		const bg = ld64(0x300000000 /* heap bump-allocator cursor */)
		ce = aq
		const bh = bg != 0 ? sat_sub(bg, 0x80) & -8 : 0x300007f80
		cc = az
		cd = ar
		if (bh > 0x300000007) {
			const vault_1_mint: Mint = accounts.vault_1_mint
			st64(0x300000000 /* heap bump-allocator cursor */, bh)
			const bj: AccountInfo = vault_1_mint.info
			memcpy(bh, vault_1_mint, 0x58)
			st64(bh + 0x58, bj)
			copy(bh + 0x60, vault_1_mint + 0x60, 0x20)
			const bk: AccountInfo = ld64(accounts + 0xc0)
			const bl: LamportsCell = bk.lamports
			const bn = ld64(accounts + 0xb8)
			const bs = bk.key
			rc_inc(bl)
			const bm: DataCell = bk.data
			rc_inc(bm)
			cb = ba
			const br = bk.owner
			const bq = bk.rent_epoch
			const bp = bk.is_signer
			const bo = bk.is_writable
			st8(s38 + 2, bk.executable)
			st8(s38, bp, bo)
			st64(s60, bs, bl, bm, br, bq)
			an = fn_7a038(se0, accounts + 8, sc0, s90, bh, bn, s60, min(h, d), br)
			j = ld64(se0 + 8)
			g = ld64(se0)
			if (rc_release(cc)) {
				an = Rc_drop_slow_14df0(s88, an)
			}
			const bt = ce
			if (rc_release(cb)) {
				an = Rc_drop_slow_14df0(s80, an)
			}
			if (rc_release(bt)) {
				an = Rc_drop_slow_14df0(sb8, an)
			}
			if (rc_release(cd)) {
				an = Rc_drop_slow_14df0(sb0, an)
			}
			if (g != 2) {
				st64(a + 8, j)
				st64(a, g)
				return an
			}
			const bu = ld64(ld64(accounts + 8))
			copyr(s60, bu, 0x20)
			const bv = accounts.recipient_token_account_0.info.key
			copyr(s40, bv, 0x20)
			const bw = accounts.recipient_token_account_1.info.key
			copyr(s20, bw, 0x20)
			const bx = ld64(0x300000000 /* heap bump-allocator cursor */)
			const by = bx != 0 ? sat_sub(bx, 0x100) : 0x300007f00
			if (by > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, by)
				st64(by, 0x3dd5292d4f1157ce /* event:CollectProtocolFeeEvent */)
				st64(by + 0x20, ld64(s60 + 0x18))
				st64(by + 0x18, ld64(s60 + 0x10))
				st64(by + 0x10, ld64(s60 + 8))
				st64(by + 8, ld64(s60))
				copy(by + 0x28, s40, 0x20)
				copy(by + 0x50, s18, 0x18)
				const ca = ld64(s20)
				st64(by + 0x70, min(h, d))
				st64(by + 0x68, min(i, c))
				st64(by + 0x48, ca)
				st64(s90, by, 0x78)
				an = log_data(s90, 1)
				st64(a + 8, j)
				st64(a, 2)
				return an
			}
			raw_vec_handle_error(1, 0x100, 0x100160b50, 0x100 > bx, bz)
		}
		alloc_handle_alloc_error(8, 0x80)
	}
	alloc_handle_alloc_error(8, 0x80)
}
