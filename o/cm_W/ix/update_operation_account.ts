/// <reference path="../lib.d.ts" />
// instruction update_operation_account
import { anchor_error_from, fn_13e5a0, fn_13e628, fn_14ec00, fn_14ed60, fn_153150, fn_153158, fn_4130, fn_85138, fn_88360, fn_88558, fn_ccf98, memcpy, memmove, memset2 } from '../shared.ts'

// instruction handler: update_operation_account (discriminator sha256("global:update_operation_account")[..8] = 0x73de3bc2877467f)
// accounts [idl]: 0 owner [signer, = GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ], 1 operation_state [mut, pda], 2 system_program [= 11111111111111111111111111111111]
// args [idl]: param: u8, keys: Vec<pubkey>
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
export function ix_update_operation_account(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s18 = fp - 0x18, s30 = fp - 0x30, s38 = fp - 0x38, s40 = fp - 0x40, s58 = fp - 0x58, s68 = fp - 0x68, s69 = fp - 0x69, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sff8 = fp - 0xff8
	let p, q, s, t, u, v, aa, ae, af: u64
	B14: {
		B13: {
			sol_log("Instruction: UpdateOperationAccount", 0x23)
			v = undef
			const f = ix_args_len
			if (f != 0 && f >= 5) {
				const g = ix_args
				const ah = ld8(g)
				const h = ld32(g + 1)
				if (h != 0) {
					const i = ld64(0x300000000 /* heap bump-allocator cursor */)
					const j = i != 0 ? i : 0x300008000
					const k = j - (min(h, 0x80) << 5)
					let l = k > j ? 0 : k
					if (0x300000007 >= l) {
						raw_vec_handle_error(1, min(h, 0x80) << 5, 0x10015fa80, 0x300000007, k)
					}
					let r = f - 5
					st64(0x300000000 /* heap bump-allocator cursor */, l)
					st64(s40, min(h, 0x80))
					let m = 0
					st64(s38, l, 0)
					let x = 0
					s = h
					while (true) {
						if (0x20 > r) {
							break B13
						}
						const y = g + m
						q = x + 1
						const o = ld64(y + 0xb)
						st8(s58 + 8, ld8(y + 0x13))
						st64(s58, o)
						const ai = ld64(s58 + 1)
						st64(s18, ld64(y + 0x14))
						v = ld64(y + 0x1c)
						st64(s18 + 8, v)
						st8(s18 + 0x10, ld8(y + 0x24))
						if (x == ld64(s40)) {
							fn_15458(s40, x)
							v = undef
							s = h
							l = ld64(s38)
						}
						const n = l + m
						st16(n + 4, ld16(y + 9))
						st32(n, ld32(y + 5))
						st64(n + 7, ai)
						st8(n + 6, o)
						copy(n + 0xf, s18, 0x10)
						p = ld8(s18 + 0x10)
						st8(n + 0x1f, p)
						st64(s30, q)
						r = r - 0x20
						m = m + 0x20
						x = q
						if (q >= s) {
							aa = ld64(s38)
							t = ld64(s40)
							u = program_id
							if (t == 0x8000000000000000) {
								break B14
							}
							break
						}
					}
				} else {
					aa = 1
					q = 0
					t = 0
					u = program_id
				}
				const ag = q
				st8(s69, 0xff)
				st64(s68, accounts, accounts_len)
				st64(sff8, s69)
				af = accounts_update_operation_account(s40, u, s68, v, fp, q)
				const ad = ld64(s30)
				ae = ld64(s38)
				const w = ld64(s40)
				if (w != 0) {
					st64(s58, w, ae, ad)
					st8(s30 + 0x10, ld8(s69))
					copyr(s30, s68, 0x10)
					st64(s40, u, s58)
					st64(s18, t, aa, ag)
					af = fn_4f4c8(s80, s40, ah, s18)
					ae = ld64(s80)
					if (ae != 2) {
						st64(a + 8, ld64(s80 + 8))
						st64(a, ae)
						return af
					}
					af = fn_ccf98(s90, s58, u)
					ae = ld64(s90)
					st64(a + 8, ld64(s90 + 8))
					st64(a, ae)
					return af
				}
				st64(a + 8, ad)
				st64(a, ae)
				return af
			}
		}
		const z = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		p = undef
		v = undef
		s = undef
		aa = z
	}
	const ab = aa
	if (2 > (aa & 3) - 2) {
		af = anchor_error_from(sa0, 0x66 /* anchor::InstructionDidNotDeserialize */, p, v, s)
		ae = ld64(sa0)
		st64(a + 8, ld64(sa0 + 8))
		st64(a, ae)
		return af
	}
	if ((ab & 3) == 0) {
		af = anchor_error_from(sa0, 0x66 /* anchor::InstructionDidNotDeserialize */, p, v, s)
		ae = ld64(sa0)
		st64(a + 8, ld64(sa0 + 8))
		st64(a, ae)
		return af
	}
	const ac = ld64(ld64(aa + 7))
	if (ac == 0) {
		af = anchor_error_from(sa0, 0x66 /* anchor::InstructionDidNotDeserialize */, p, v, s)
		ae = ld64(sa0)
		st64(a + 8, ld64(sa0 + 8))
		st64(a, ae)
		return af
	}
	callx(ac, ld64(aa - 1), ac, p, v, s)
	af = anchor_error_from(sa0, 0x66 /* anchor::InstructionDidNotDeserialize */)
	ae = ld64(sa0)
	st64(a + 8, ld64(sa0 + 8))
	st64(a, ae)
	return af
}

// Anchor Accounts::try_accounts of instruction update_operation_account (called by ix_update_operation_account; name [str]: from the handler's "Instruction: …" log; was fn_cd1b0)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), d (value)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: operation_state (ConstraintMut, ConstraintSeeds)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: operation_state [idl]
export function accounts_update_operation_account(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s70 = fp - 0x70, s90 = fp - 0x90, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s100 = fp - 0x100, s110 = fp - 0x110, s118 = fp - 0x118, s120 = fp - 0x120
	let p, s, w, ai, aj: u64
	st64(s118, a)
	let aa = try_accounts_17a30(s40, c, c, d, e, r0)
	const g = ld64(s40 + 8)
	let f = ld64(s40)
	if (f != 2) {
		const o = ld64(0x300000000 /* heap bump-allocator cursor */)
		p = 5 > o
		const l = p != 0 ? 0 : o - 5
		const q = o != 0 ? l : 0x300007ffb
		if ((f & 1) != 0) {
			if (0x300000008 > q) {
				raw_vec_handle_error(1, 5, 0x10015f8f8, l, p)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, q)
			st8(q + 4, 0x72)
			st32(q, 0x656e776f)
			void ld64(g)
		} else {
			if (0x300000008 > q) {
				raw_vec_handle_error(1, 5, 0x10015f8f8, l, p)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, q)
			st8(q + 4, 0x72)
			st32(q, 0x656e776f)
			void ld64(g)
		}
		st64(g + 0x10, q, 5)
		st64(g + 8, 5)
		st64(g, 1)
		w = ld64(s118)
		st64(w + 0x10, g)
		st64(w + 8, f)
		st64(w, 0)
		return aa
	}
	st64(s120, ld64(e - 0xff8))
	aa = fn_12d8(s40, c)
	const operation_state: AccountInfo = ld64(s40 + 8)
	f = ld64(s40)
	if (f == 2) {
		aa = try_accounts_18870(s40, c)
		const z = ld64(s40 + 8)
		f = ld64(s40)
		if (f == 2) {
			const h = ld64(g)
			copyr(sb0, h, 0x20)
			if ((memcmp(sb0, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) == 0) {
				st64(s70, 0x10015b1ad, 9)
				// PDA find_program_address(["operation"], program *b)
				Pubkey_find_program_address(s40, s70, 1, b)
				copyr(s90, s40, 0x20)
				st8(ld64(s120), ld8(s20))
				const ab = operation_state.key
				copyr(s60, ab, 0x20)
				aa = memcmp(s60, s90, 0x20) as u32
				if (aa == 0) {
					if (operation_state.is_writable != 0) {
						const ah = ld64(s118)
						st64(ah + 0x10, z)
						st64(ah + 8, operation_state)
						st64(ah, g)
						return aa
					}
					anchor_error_from(s100, 0x7d0 /* anchor::ConstraintMut */)
					aa = fn_4130(s110, ld64(s100), ld64(s100 + 8), "operation_state", 0xf)
					aj = ld64(s110)
					ai = ld64(s118)
					st64(ai + 0x10, ld64(s110 + 8))
					st64(ai + 8, aj)
					st64(ai, 0)
					return aa
				}
				const ag = anchor_error_from(se0, 0x7d6 /* anchor::ConstraintSeeds */)
				s = undef
				const ac = ld64(0x300000000 /* heap bump-allocator cursor */)
				const ae = ac != 0 ? sat_sub(ac, 0xf) : 0x300007ff1
				const af = ld64(se0 + 8)
				const ad = ld64(se0)
				if ((ad & 1) != 0) {
					if (0x300000008 > ae) {
						raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0x300000008, s)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, ae)
					st64(ae + 7, 0x65746174735f6e6f)
					st64(ae, 0x6f6974617265706f)
					void ld64(af)
				} else {
					if (0x300000008 > ae) {
						raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0x300000008, s)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, ae)
					st64(ae + 7, 0x65746174735f6e6f)
					st64(ae, 0x6f6974617265706f)
					void ld64(af)
				}
				st64(af + 0x10, ae, 0xf)
				st64(af + 8, 0xf)
				st64(af, 1)
				copyr(s40, s60, 0x20)
				copy(s20, s90, 0x20)
				aa = Error_with_pubkeys(sf0, ad, af, s40, ag)
				aj = ld64(sf0)
				ai = ld64(s118)
				st64(ai + 0x10, ld64(sf0 + 8))
				st64(ai + 8, aj)
				st64(ai, 0)
				return aa
			}
			const n = fn_88360(sc0, 0)
			p = undef
			const i = ld64(0x300000000 /* heap bump-allocator cursor */)
			const k = i != 0 ? sat_sub(i, 5) : 0x300007ffb
			const m = ld64(sc0 + 8)
			const j = ld64(sc0)
			if ((j & 1) != 0) {
				if (0x300000008 > k) {
					raw_vec_handle_error(1, 5, 0x10015f8f8, 0x300000008, p)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, k)
				st8(k + 4, 0x72)
				st32(k, 0x656e776f)
				void ld64(m)
			} else {
				if (0x300000008 > k) {
					raw_vec_handle_error(1, 5, 0x10015f8f8, 0x300000008, p)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, k)
				st8(k + 4, 0x72)
				st32(k, 0x656e776f)
				void ld64(m)
			}
			st64(m + 0x10, k, 5)
			st64(m + 8, 5)
			st64(m, 1)
			copyr(s40, sb0, 0x20)
			st64(s20, 0xa6bd3bcb652bb6e5, 0x648eee6fe68868f5, 0xb1880f9c196055dc, 0xa18a9e05bd73e21f) // key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ
			aa = Error_with_pubkeys(sd0, j, m, s40, n)
			aj = ld64(sd0)
			ai = ld64(s118)
			st64(ai + 0x10, ld64(sd0 + 8))
			st64(ai + 8, aj)
			st64(ai, 0)
			return aa
		}
		const x = ld64(0x300000000 /* heap bump-allocator cursor */)
		const y = x != 0 ? sat_sub(x, 0xe) : 0x300007ff2
		if ((f & 1) != 0) {
			if (0x300000008 > y) {
				raw_vec_handle_error(1, 0xe, 0x10015f8f8, sat_sub(x, 0xe), 0xe > x)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, y)
			st64(y + 6, 0x6d6172676f72705f)
			st64(y, 0x705f6d6574737973)
			void ld64(z)
		} else {
			if (0x300000008 > y) {
				raw_vec_handle_error(1, 0xe, 0x10015f8f8, sat_sub(x, 0xe), 0xe > x)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, y)
			st64(y + 6, 0x6d6172676f72705f)
			st64(y, 0x705f6d6574737973)
			void ld64(z)
		}
		st64(z + 0x10, y, 0xe)
		st64(z + 8, 0xe)
		st64(z, 1)
		w = ld64(s118)
		st64(w + 0x10, z)
		st64(w + 8, f)
		st64(w, 0)
		return aa
	}
	const r = ld64(0x300000000 /* heap bump-allocator cursor */)
	s = 0xf > r
	const t = s != 0 ? 0 : r - 0xf
	const u = r != 0 ? t : 0x300007ff1
	if ((f & 1) != 0) {
		if (0x300000008 > u) {
			raw_vec_handle_error(1, 0xf, 0x10015f8f8, t, s)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, u)
		st64(u + 7, 0x65746174735f6e6f)
		st64(u, 0x6f6974617265706f)
		void operation_state.key
	} else {
		if (0x300000008 > u) {
			raw_vec_handle_error(1, 0xf, 0x10015f8f8, t, s)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, u)
		st64(u + 7, 0x65746174735f6e6f)
		st64(u, 0x6f6974617265706f)
		void operation_state.key
	}
	st64(operation_state + 0x10, u, 0xf)
	st64(operation_state + 8 /* lamports */, 0xf)
	st64(operation_state /* key */, 1)
	w = ld64(s118)
	st64(w + 0x10, operation_state)
	st64(w + 8, f)
	st64(w, 0)
	return aa
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), c (value), d (points to it)
// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: operation_state_data: OperationStateAccount
export function fn_4f4c8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158
	let k, l, m: u64
	const f = ld64(ld64(b + 8) + 8)
	if (ld8(f + 0x29) != 0) {
		const g = ld64(f + 0x10)
		if (ld64(g + 0x10) != 0) {
			st64(s118, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			m = fn_13e628(s138, s118)
			l = ld64(s138)
			st64(a + 8, ld64(s138 + 8))
			st64(a, l)
			return m
		}
		let j = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
		st64(g + 0x10, -1)
		const h = ld64(g + 0x20)
		if (h >= 8) {
			j = 0xbba /* anchor::AccountDiscriminatorMismatch */
			const operation_state_data: OperationStateAccount = ld64(g + 0x18)
			if (operation_state_data.discriminator == 0xfcb7de51ed3aec13 /* account:OperationState */) {
				if (h > 0xdc8) {
					if (((c as u8) as i64) > 1) {
						if ((c as u8) == 2) {
							m = fn_68d08(operation_state_data + 8, d)
							k = ld64(g + 0x10) + 1
							st64(g + 0x10, k)
							st64(a + 8, k)
							st64(a, 2)
							return m
						}
						if ((c as u8) == 3) {
							m = fn_69378(operation_state_data + 8, d)
							k = ld64(g + 0x10) + 1
							st64(g + 0x10, k)
							st64(a + 8, k)
							st64(a, 2)
							return m
						}
					} else {
						if ((c as u8) == 0) {
							m = fn_67dd8(operation_state_data + 8, d, c as u8, d, 0xbba /* anchor::AccountDiscriminatorMismatch */)
							k = ld64(g + 0x10) + 1
							st64(g + 0x10, k)
							st64(a + 8, k)
							st64(a, 2)
							return m
						}
						if ((c as u8) == 1) {
							m = fn_68450(operation_state_data + 8, d)
							k = ld64(g + 0x10) + 1
							st64(g + 0x10, k)
							st64(a + 8, k)
							st64(a, 2)
							return m
						}
					}
					fn_85138(s78, 0x1001598bc)
					st64(s60, 0, 1, 0)
					st64(s28, s60, 0x10015f818)
					st8(s28 + 0x18, 3)
					st64(s28 + 0x10, 0x20)
					st64(s48 + 0x10, 0)
					st64(s48, 0)
					if (fn_88558(0x1001598bc, s48) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
					}
					copy(sf8, s78, 0x30)
					st64(s118 + 8, 0x10015a1c2)
					st32(sf8 + 0x78, 0x1771 /* error::InvalidUpdateConfigFlag */)
					st8(sf8 + 0x30, 2)
					st32(s118 + 0x18, 0x26)
					st64(s118 + 0x10, 0x3f)
					st64(s118, 0)
					m = fn_13e5a0(s148, s118)
					k = ld64(s148 + 8)
					l = ld64(s148)
					st64(g + 0x10, ld64(g + 0x10) + 1)
					st64(a + 8, k)
					st64(a, l)
					return m
				}
				fn_153158(0xdc9, h, 0x10015f718, d, 0xbba /* anchor::AccountDiscriminatorMismatch */)
			}
		}
		m = anchor_error_from(s158, j, c, d, j)
		k = ld64(s158 + 8)
		l = ld64(s158)
		st64(g + 0x10, ld64(g + 0x10) + 1)
		st64(a + 8, k)
		st64(a, l)
		return m
	}
	m = anchor_error_from(s128, 0xbbe /* anchor::AccountNotMutable */, c, d, e)
	l = ld64(s128)
	st64(a + 8, ld64(s128 + 8))
	st64(a, l)
	return m
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (value)
export function fn_68450(a: u64, b: u64): u64 {
	const s8 = fp - 0x8, s10 = fp - 0x10, s18 = fp - 0x18, s20 = fp - 0x20, s28 = fp - 0x28
	let p, au: u64
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x140) : 0x300007ec0
	if (g > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		st64(s8, g)
		st64(s28, a + 1)
		memcpy(g, a + 1, 0x140)
		const i = ld64(b + 8)
		const h = ld64(b + 0x10)
		st64(s18, h)
		let j = h << 5
		st64(s20, i)
		let k = i
		let at = 1
		while (true) {
			B35: {
				B29: {
					if (j == 0) {
						let n = ld64(s18) << 5
						const m = ld64(s8)
						let o = ld64(s20)
						at = 2
						do {
							if (n == 0) {
								let r = ld64(s18) << 5
								const q = ld64(s8)
								let s = ld64(s20)
								at = 3
								while (true) {
									if (r == 0) {
										let v = ld64(s18) << 5
										const u = ld64(s8)
										let w = ld64(s20)
										at = 4
										while (true) {
											if (v == 0) {
												let z = ld64(s18) << 5
												const y = ld64(s8)
												let aa = ld64(s20)
												at = 5
												while (true) {
													if (z == 0) {
														let ad = ld64(s18) << 5
														const ac = ld64(s8)
														let ae = ld64(s20)
														at = 6
														while (true) {
															if (ad == 0) {
																let ah = ld64(s18) << 5
																const ag = ld64(s8)
																let ai = ld64(s20)
																at = 7
																while (true) {
																	if (ah == 0) {
																		let al = ld64(s18) << 5
																		const ak = ld64(s8)
																		let am = ld64(s20)
																		at = 8
																		while (true) {
																			if (al == 0) {
																				let ap = ld64(s18) << 5
																				const ao = ld64(s8)
																				let aq = ld64(s20)
																				at = 9
																				while (true) {
																					if (ap == 0) {
																						st64(s18, ld64(s18) << 5)
																						au = ld64(s8)
																						const bc = au
																						while (true) {
																							st64(s10, 0)
																							if (ld64(s18) == 0) {
																								break B35
																							}
																							const bd = ld64(s20)
																							const be = memcmp(bd, bc + 0x120, 0x20)
																							st64(s10, 1)
																							st64(s18, ld64(s18) - 0x20)
																							st64(s20, bd + 0x20)
																							if ((be as u32) == 0) {
																								break B35
																							}
																						}
																					}
																					const ar = memcmp(aq, ao + 0x100, 0x20)
																					ap = ap - 0x20
																					aq = aq + 0x20
																					if ((ar as u32) == 0) {
																						break B29
																					}
																				}
																			}
																			const an = memcmp(am, ak + 0xe0, 0x20)
																			al = al - 0x20
																			am = am + 0x20
																			if ((an as u32) == 0) {
																				break B29
																			}
																		}
																	}
																	const aj = memcmp(ai, ag + 0xc0, 0x20)
																	ah = ah - 0x20
																	ai = ai + 0x20
																	if ((aj as u32) == 0) {
																		break B29
																	}
																}
															}
															const af = memcmp(ae, ac + 0xa0, 0x20)
															ad = ad - 0x20
															ae = ae + 0x20
															if ((af as u32) == 0) {
																break B29
															}
														}
													}
													const ab = memcmp(aa, y + 0x80, 0x20)
													z = z - 0x20
													aa = aa + 0x20
													if ((ab as u32) == 0) {
														break B29
													}
												}
											}
											const x = memcmp(w, u + 0x60, 0x20)
											v = v - 0x20
											w = w + 0x20
											if ((x as u32) == 0) {
												break B29
											}
										}
									}
									const t = memcmp(s, q + 0x40, 0x20)
									r = r - 0x20
									s = s + 0x20
									if ((t as u32) == 0) {
										break B29
									}
								}
							}
							p = memcmp(o, m + 0x20, 0x20)
							n = n - 0x20
							o = o + 0x20
						} while ((p as u32) != 0)
					} else {
						const l = memcmp(k, ld64(s8), 0x20)
						j = j - 0x20
						k = k + 0x20
						if ((l as u32) != 0) {
							continue
						}
					}
				}
				st64(s10, 1)
				st64(s18, ld64(s18) << 5)
				au = ld64(s8)
				L31: while (true) {
					const av = au + (at << 5)
					let ax = ld64(s18)
					let ay = ld64(s20)
					while (true) {
						if (ax == 0) {
							au = ld64(s8)
							const aw = au + (at - ld64(s10) << 5)
							st64(aw + 0x18, ld64(av + 0x18))
							st64(aw + 0x10, ld64(av + 0x10))
							st64(aw + 8, ld64(av + 8))
							st64(aw, ld64(av))
							at = at + 1
							if (at == 0xa) {
								break B35
							}
							continue L31
						}
						const az = memcmp(ay, av, 0x20)
						ax = ax - 0x20
						ay = ay + 0x20
						if ((az as u32) == 0) {
							st64(s10, ld64(s10) + 1)
							au = ld64(s8)
							at = at + 1
							if (at == 0xa) {
								break B35
							}
							continue L31
						}
					}
				}
			}
			const ba = ld64(s28)
			memset2(ba, 0, 0x140)
			const bb = ld64(s10)
			if (0xb > bb) {
				return memcpy(ba, au, 0xa - bb << 5)
			}
			fn_153158(0xa - bb, 0xa, 0x100160178)
		}
	}
	raw_vec_handle_error(1, 0x140, 0x10015f8f8, 0x140 > f, a)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (value)
export function fn_69378(a: u64, b: u64): u64 {
	const s8 = fp - 0x8, s10 = fp - 0x10, s18 = fp - 0x18, s20 = fp - 0x20, s28 = fp - 0x28, s30 = fp - 0x30, s38 = fp - 0x38
	let y, z: u64
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	let g = f != 0 ? sat_sub(f, 0xc80) : 0x300007380
	if (g > 0x300000007) {
		st64(s28, a)
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		st64(s38, a + 0x141)
		memcpy(g, a + 0x141, 0xc80)
		let j = 0
		st64(s18, ld64(b + 8))
		const h = ld64(b + 0x10)
		st64(s20, h)
		let i = h << 5
		st64(s10, g)
		st64(s30, i)
		L3: while (true) {
			const m = g + (j << 5)
			let k = i
			let l = ld64(s18)
			while (true) {
				B14: {
					if (k == 0) {
						st64(s8, 0)
						j = j + 1
						g = ld64(s10)
						i = ld64(s30)
						if (j != 0x64 /* anchor::InstructionMissing */) {
							continue L3
						}
					} else {
						const n = memcmp(l, m, 0x20)
						k = k - 0x20
						l = l + 0x20
						if ((n as u32) != 0) {
							continue
						}
						st64(s8, 1)
						let o = j + 1
						g = ld64(s10)
						if (o != 0x64 /* anchor::InstructionMissing */) {
							st64(s8, 1)
							st64(s20, ld64(s20) << 5)
							L10: while (true) {
								const p = g + (o << 5)
								let r = ld64(s20)
								let s = ld64(s18)
								while (true) {
									if (r == 0) {
										g = ld64(s10)
										const q = g + (o - ld64(s8) << 5)
										st64(q + 0x18, ld64(p + 0x18))
										st64(q + 0x10, ld64(p + 0x10))
										st64(q + 8, ld64(p + 8))
										st64(q, ld64(p))
										o = o + 1
										if (o == 0x64 /* anchor::InstructionMissing */) {
											break B14
										}
										continue L10
									}
									const t = memcmp(s, p, 0x20)
									r = r - 0x20
									s = s + 0x20
									if ((t as u32) == 0) {
										st64(s8, ld64(s8) + 1)
										g = ld64(s10)
										o = o + 1
										if (o == 0x64 /* anchor::InstructionMissing */) {
											break B14
										}
										continue L10
									}
								}
							}
						}
					}
				}
				let v = 0x141
				const u = ld64(s28)
				while (true) {
					const w = u + v
					st64(w + 0x18, 0)
					st64(w + 0x10, 0)
					st64(w + 8, 0)
					st64(w, 0)
					v = v + 0x20
					if (v == 0xdc1) {
						const x = ld64(s8)
						if (0x65 /* anchor::InstructionFallbackNotFound */ > x) {
							return memcpy(ld64(s38), g, 0x64 /* anchor::InstructionMissing */ - x << 5)
						}
						fn_153158(0x64 /* anchor::InstructionMissing */ - x, 0x64 /* anchor::InstructionMissing */, 0x1001601a8, y, z)
					}
				}
			}
		}
	}
	raw_vec_handle_error(1, 0xc80, 0x10015f8f8, 0xc80 > f, f)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (value)
export function fn_67dd8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s30 = fp - 0x30, s70 = fp - 0x70, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	let g = f != 0 ? sat_sub(f, 0x140) : 0x300007ec0
	if (g > 0x300000007) {
		let h = a + 1
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, h, 0x140)
		let k = 0xa
		st64(s88, 0xa, g, 0xa)
		const j = ld64(b + 8)
		const i = ld64(b + 0x10)
		if (i != 0) {
			reserve_do_reserve_and_handle_156f8(s88, 0xa, i, 1, 0x20)
			g = ld64(s88 + 8)
			k = ld64(s88 + 0x10)
		}
		let p = memcpy(g + (k << 5), j, i << 5)
		const l = k + i
		let z = 0
		st64(s88 + 0x10, l)
		let t = 0
		if (l != 0) {
			st64(s90, h)
			let m = l
			st64(s98, g)
			let n = g
			let q = 0
			while (true) {
				if (m != 0) {
					st64(s30, 0, 0, 0, 0)
					const o = memcmp(n, s30, 0x20)
					m = m - 1
					n = n + 0x20
					p = o as u32
					if (p != 0) {
						continue
					}
					q = 1
					if (m != 0) {
						while (true) {
							st64(s30, 0, 0, 0, 0)
							p = memcmp(n, s30, 0x20) as u32
							if (p != 0) {
								const r = n - (q << 5)
								st64(r + 0x18, ld64(n + 0x18))
								st64(r + 0x10, ld64(n + 0x10))
								st64(r + 8, ld64(n + 8))
								st64(r, ld64(n))
								n = n + 0x20
								m = m - 1
								if (m == 0) {
									break
								}
							} else {
								q = q + 1
								n = n + 0x20
								m = m - 1
								if (m == 0) {
									break
								}
							}
						}
					}
				}
				const s = l - q
				st64(s88 + 0x10, s)
				t = s
				h = ld64(s90)
				g = ld64(s98)
				z = 0
				break
			}
		}
		st64(s30 + 0x18, ld64(0x10015fae8))
		st64(s30 + 0x10, ld64(0x10015fae0))
		st64(s30 + 8, ld64(0x10015fad8))
		st64(s30, ld64(0x10015fad0))
		st64(s10, 0, 0)
		let y = fn_1d0(s30, g, g + (t << 5), p)
		let x = undef
		const w = ld64(s30 + 0x18)
		const v = ld64(s30 + 8)
		const u = ld64(s30)
		const aa = ld64(u)
		if (v != 0) {
			z = 8
			y = v * 0x21 + 0x29
			x = u - (v << 5) - 0x20
		}
		st64(s70, z, y, x, u, ~aa & 0x8080808080808080, u + 8, u + v + 1, w)
		fn_17b98(s30, s70)
		const ac = ld64(s30 + 8)
		const ab = ld64(s30 + 0x10)
		if (ab >= 2) {
			if (0x15 > ab) {
				fn_10f00(ac, ab)
			} else {
				fn_11118(ac, ab)
			}
		}
		memset2(h, 0, 0x140)
		if (0xb > ab) {
			return memcpy(h, ac, ab << 5)
		}
		fn_153158(ab, 0xa, 0x100160160)
	}
	raw_vec_handle_error(1, 0x140, 0x10015f8f8, 0x140 > f, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value)
export function fn_1d0(a: u64, b: u64, c: u64, r0: u64): u64 {
	const s58 = fp - 0x58, s60 = fp - 0x60
	let t: u64
	let f = a
	st64(s58 + 0x28, b)
	const g = c - b >> 5
	const h = ld64(a + 0x18)
	st64(s58 + 0x20, g)
	let i = g
	if (h != 0) {
		i = ld64(s58 + 0x20) + 1 >> 1
	}
	if (i > ld64(f + 0x10)) {
		r0 = fn_19630(f, i, f + 0x20)
	}
	if (ld64(s58 + 0x28) == c) {
		return r0
	}
	let ae = 0
	st64(s58 + 0x18, f)
	L21: while (true) {
		st64(s58 + 0x50, ae)
		const af = ld64(s58 + 0x28) + (ae << 5)
		let k = fn_10220(ld64(f + 0x20), ld64(f + 0x28), af)
		if (ld64(f + 0x10) == 0) {
			fn_19630(f, 1, f + 0x20)
			f = ld64(s58 + 0x18)
		}
		let j = 0
		let r = k >> 0x39
		let o = r * 0x101010101010101
		let l = ld64(f + 8)
		let m = ld64(f)
		st64(s58 + 0x40, m - 0x20)
		st64(s58 + 0x30, 0)
		let s = af
		st64(s58 + 0x10, o)
		while (true) {
			B19: {
				st64(s58 + 0x38, j)
				r0 = k & l
				const n = ld64(m + r0)
				st64(s58 + 0x48, n)
				const p = n ^ o
				let q = ~p & p + 0xfefefefefefefeff & 0x8080808080808080
				if (q != 0) {
					st64(s58, r, m)
					do {
						const u = r0
						const w = l
						const v = s
						r0 = memcmp(s, ld64(s58 + 0x40) - (((ld8(((q & -q) * 0x218a392cd3d5dbf >> 0x3a) + 0x100159088) >> 3) + r0 & l) << 5), 0x20) as u32
						if (r0 == 0) {
							break B19
						}
						t = q - 1 & q
						q = t
						r0 = u
						f = ld64(s58 + 0x18)
						s = v
						m = ld64(s58 + 8)
						r = ld64(s58)
						l = w
					} while (t != 0)
				}
				const x = ld64(s58 + 0x48)
				let aa = 1
				let y = ld64(s60)
				if (ld64(s58 + 0x30) != 1) {
					if ((x & 0x8080808080808080) != 0) {
						y = ld8(((x & 0x8080808080808080 & -(x & 0x8080808080808080)) * 0x218a392cd3d5dbf >> 0x3a) + 0x100159088) >> 3
					}
					aa = (x & 0x8080808080808080) != 0
					y = y + r0 & l
				}
				if ((x & 0x8080808080808080 & (ld64(s58 + 0x48) << 1)) == 0) {
					st64(s60, y)
					const z = ld64(s58 + 0x38)
					k = r0 + (z + 8)
					st64(s58 + 0x30, aa)
					j = z + 8
					o = ld64(s58 + 0x10)
					continue
				}
				let ab = ld8(m + y) as i8
				if ((ab as i64) >= 0) {
					const ac = ld64(m)
					y = ld8(((ac & 0x8080808080808080 & -(ac & 0x8080808080808080)) * 0x218a392cd3d5dbf >> 0x3a) + 0x100159088) >> 3
					ab = ld8(m + y)
				}
				st64(f + 0x10, ld64(f + 0x10) - (ab & 1))
				st8(m + y, r)
				st8(m + (y - 8 & l) + 8, r)
				st64(f + 0x18, ld64(f + 0x18) + 1)
				const ad = m - (y << 5)
				st64(ad - 8, ld64(s + 0x18))
				st64(ad - 0x10, ld64(s + 0x10))
				st64(ad - 0x18, ld64(s + 8))
				st64(ad - 0x20, ld64(s))
			}
			ae = ld64(s58 + 0x50) + 1
			f = ld64(s58 + 0x18)
			if (ae != ld64(s58 + 0x20)) {
				continue L21
			}
			return r0
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
export function fn_19630(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s58 = fp - 0x58, s70 = fp - 0x70, s88 = fp - 0x88, sa8 = fp - 0xa8
	let t, v, w, bf: u64
	const f = ld64(a + 0x18)
	const g = f > f + b
	if ((g & 1) != 0) {
		fn_14d500(s40, 1, c, f + b, g & 1)
		return ld64(s40)
	}
	let k = f + b
	const h = ld64(a + 8)
	const i = h + 1 >> 3
	const j = 8 > h ? h : i * 7
	if (k > (j >> 1)) {
		k = k > j ? k : j + 1
		if (8 > k) {
			w = 4 > k ? 4 : 8
		} else {
			if (k > 0x1fffffffffffffff) {
				fn_14d500(s10, 1, c, j >> 1, k)
				return ld64(s10)
			}
			const l = (k << 3) / 7 - 1
			const m = l | l >> 1
			const n = m | m >> 2
			const o = n | n >> 4
			const p = o | o >> 8
			const q = p | p >> 0x10
			const r = ~(q | q >> 0x20)
			const s = r - (r >> 1 & 0x5555555555555555)
			t = s >> 2 & 0x3333333333333333
			const u = (s & 0x3333333333333333) + t
			v = 0xffffffffffffffff >> ((u + (u >> 4) & 0xf0f0f0f0f0f0f0f) * 0x101010101010101 >> 0x38 & 0x3f)
			w = v + 1
			if (v > 0x7fffffffffffffe) {
				fn_14d500(s30, 1, c, v, t)
				return ld64(s30)
			}
		}
		t = w + 8
		const x = w
		v = (w << 5) + t
		if ((w << 5) > v) {
			fn_14d500(s30, 1, c, v, t)
			return ld64(s30)
		}
		v = (x << 5) + t
		if (0x7ffffffffffffff9 > v) {
			st64(s58 + 8, c)
			const ac = ld64(0x300000000 /* heap bump-allocator cursor */)
			const ad = ac != 0 ? ac : 0x300008000
			const ae = ad - v
			const af = ae > ad ? 0 : ae
			if (0x300000008 > af) {
				fn_14d578(s20, 1, 8, v)
				return ld64(s20)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, af & -8)
			if ((af & -8) != 0) {
				st64(sa8 + 0x10, a)
				const ak = ld64(s58 + 8)
				const ag = (af & -8) + (x << 5)
				st64(s70 + 8, ag)
				memset2(ag, 0xff, t)
				let ah = w - 1
				st64(s58 + 0x10, ah)
				ah = 9 > w ? ah : (w >> 3) * 7
				st64(sa8, ah, f)
				let ai = ld64(s70 + 8)
				if (f == 0) {
					bf = ld64(sa8 + 0x10)
					st64(bf + 8, ld64(s58 + 0x10))
					st64(bf, ai)
					st64(bf + 0x10, ld64(sa8) - ld64(sa8 + 8))
					return 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */
				}
				st64(s70, ai + 8)
				const aj = ld64(ld64(sa8 + 0x10))
				let al = ~ld64(aj) & 0x8080808080808080
				let ay = 0
				copyr(s88, ak, 0x10)
				st64(sa8 + 0x18, aj - 0x20)
				let ax = ld64(sa8 + 8)
				st64(s88 + 0x10, aj)
				let az = aj
				while (true) {
					if (al == 0) {
						while (true) {
							ay = ay + 8
							const ba = ld64(az + 8)
							az = az + 8
							if ((ba & 0x8080808080808080) != 0x8080808080808080) {
								al = ba & 0x8080808080808080 ^ 0x8080808080808080
								break
							}
						}
					}
					st64(s58 + 8, ax)
					const bb = ay + (ld8(((al & -al) * 0x218a392cd3d5dbf >> 0x3a) + 0x100159108) >> 3)
					st64(s58, bb)
					const bc = fn_10220(ld64(s88), ld64(s88 + 8), ld64(sa8 + 0x18) - (bb << 5))
					st64(s70 + 0x10, bc)
					const bd = ld64(s58 + 0x10)
					let ao = bc & bd
					ai = ld64(s70 + 8)
					let an = ld64(ai + ao) & 0x8080808080808080
					if (an == 0) {
						let be = 8
						do {
							ao = ao + be & bd
							an = ld64(ai + ao) & 0x8080808080808080
							be = be + 8
						} while (an == 0)
					}
					const am = al
					const ap = ld64(s58 + 0x10)
					let aq = (ld8(((an & -an) * 0x218a392cd3d5dbf >> 0x3a) + 0x100159108) >> 3) + ao & ap
					const at = ld64(s58 + 8)
					if ((ld8(ai + aq) as i8) >= 0) {
						const ar = ld64(ai)
						aq = ld8(((ar & 0x8080808080808080 & -(ar & 0x8080808080808080)) * 0x218a392cd3d5dbf >> 0x3a) + 0x100159108) >> 3
					}
					ax = at - 1
					const au = ld64(s70 + 0x10)
					st8(ai + aq, au >> 0x39)
					st8(ld64(s70) + (aq - 8 & ap), au >> 0x39)
					const av = aq << 5
					const aw = ld64(s88 + 0x10) - (ld64(s58) << 5)
					st64(ai - av - 8, ld64(aw - 8))
					st64(ai - av - 0x10, ld64(aw - 0x10))
					st64(ai - av - 0x18, ld64(aw - 0x18))
					st64(ai - av - 0x20, ld64(aw - 0x20))
					al = am - 1 & al
					if (ax == 0) {
						bf = ld64(sa8 + 0x10)
						st64(bf + 8, ld64(s58 + 0x10))
						st64(bf, ai)
						st64(bf + 0x10, ld64(sa8) - ld64(sa8 + 8))
						return 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */
					}
				}
			}
			fn_14d578(s20, 1, 8, v)
			return ld64(s20)
		}
		fn_14d500(s30, 1, c, v, t)
		return ld64(s30)
	}
	st64(s88 + 0x10, j)
	st64(sa8 + 8, f)
	let y = i + ((h + 1 & 7) != 0)
	st64(sa8 + 0x10, a)
	const z = ld64(a)
	if (y != 0) {
		let aa = z
		do {
			const ab = ld64(aa)
			st64(aa, (~ab >> 7 & 0x101010101010101) + (ab | 0x7f7f7f7f7f7f7f7f))
			aa = aa + 8
			y = y - 1
		} while (y != 0)
	}
	if (8 > h + 1) {
		memmove(z + 8, z, h + 1)
		if (h == -1) {
			st64(ld64(sa8 + 0x10) + 0x10, ld64(s88 + 0x10) - ld64(sa8 + 8))
			return 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */
		}
	} else {
		st64(z + (h + 1), ld64(z))
	}
	let br = 0
	copyr(s58, c, 0x10)
	st64(s58 + 0x10, z + 8)
	st64(s70 + 0x10, z - 0x20)
	while (true) {
		const bn = br
		if (ld8(z + br) == 0x80) {
			let bg = ld64(s70 + 0x10) - (bn << 5)
			st64(s70, bg, z - (bn << 5) - 0x20)
			while (true) {
				const bh = fn_10220(ld64(s58), ld64(s58 + 8), bg)
				let bi = ld64(z + (bh & h)) & 0x8080808080808080
				let bj = bh & h
				if (bi == 0) {
					let bk = 8
					bj = bh & h
					do {
						bj = bj + bk & h
						bi = ld64(z + bj) & 0x8080808080808080
						bk = bk + 8
					} while (bi == 0)
				}
				let bl = (ld8(((bi & -bi) * 0x218a392cd3d5dbf >> 0x3a) + 0x100159108) >> 3) + bj & h
				if ((ld8(z + bl) as i8) >= 0) {
					const bm = ld64(z)
					bl = ld8(((bm & 0x8080808080808080 & -(bm & 0x8080808080808080)) * 0x218a392cd3d5dbf >> 0x3a) + 0x100159108) >> 3
				}
				if (8 > ((bl - (bh & h) ^ bn - (bh & h)) & h)) {
					st8(z + bn, bh >> 0x39)
					st8(ld64(s58 + 0x10) + (bn - 8 & h), bh >> 0x39)
					break
				}
				const bo = z + bl
				const bp = ld8(bo)
				st8(bo, bh >> 0x39)
				st8(ld64(s58 + 0x10) + (bl - 8 & h), bh >> 0x39)
				const bq = z - (bl << 5) - 0x20
				if (bp == 0xff) {
					st8(z + bn, 0xff)
					st8(ld64(s58 + 0x10) + (bn - 8 & h), 0xff)
					const bs = ld64(s70 + 8)
					st64(bq + 0x18, ld64(bs + 0x18))
					st64(bq + 0x10, ld64(bs + 0x10))
					st64(bq + 8, ld64(bs + 8))
					st64(bq, ld64(bs))
					break
				}
				fn_f800(ld64(s70 + 8), bq)
				bg = ld64(s70)
			}
		}
		br = bn + 1
		if (bn == h) {
			st64(ld64(sa8 + 0x10) + 0x10, ld64(s88 + 0x10) - ld64(sa8 + 8))
			return 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), e (value)
export function fn_14d500(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s30 = fp - 0x30
	if (b != 0) {
		st64(s30, 0x1001621d0, 1, 8, 0, 0)
		// fmt "Hash table capacity overflow"
		fn_14ec00(s30, 0x1001621e0, c, d, e)
	}
	st64(a, 0)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
export function fn_f800(a: u64, b: u64) {
	const f = ld8(a)
	st8(a, ld8(b))
	st8(b, f)
	const g = ld8(a + 1)
	st8(a + 1, ld8(b + 1))
	st8(b + 1, g)
	const h = ld8(a + 2)
	st8(a + 2, ld8(b + 2))
	st8(b + 2, h)
	const i = ld8(a + 3)
	st8(a + 3, ld8(b + 3))
	st8(b + 3, i)
	const j = ld8(a + 4)
	st8(a + 4, ld8(b + 4))
	st8(b + 4, j)
	const k = ld8(a + 5)
	st8(a + 5, ld8(b + 5))
	st8(b + 5, k)
	const l = ld8(a + 6)
	st8(a + 6, ld8(b + 6))
	st8(b + 6, l)
	const m = ld8(a + 7)
	st8(a + 7, ld8(b + 7))
	st8(b + 7, m)
	const n = ld8(a + 8)
	st8(a + 8, ld8(b + 8))
	st8(b + 8, n)
	const o = ld8(a + 9)
	st8(a + 9, ld8(b + 9))
	st8(b + 9, o)
	const p = ld8(a + 0xa)
	st8(a + 0xa, ld8(b + 0xa))
	st8(b + 0xa, p)
	const q = ld8(a + 0xb)
	st8(a + 0xb, ld8(b + 0xb))
	st8(b + 0xb, q)
	const r = ld8(a + 0xc)
	st8(a + 0xc, ld8(b + 0xc))
	st8(b + 0xc, r)
	const s = ld8(a + 0xd)
	st8(a + 0xd, ld8(b + 0xd))
	st8(b + 0xd, s)
	const t = ld8(a + 0xe)
	st8(a + 0xe, ld8(b + 0xe))
	st8(b + 0xe, t)
	const u = ld8(a + 0xf)
	st8(a + 0xf, ld8(b + 0xf))
	st8(b + 0xf, u)
	const v = ld8(a + 0x10)
	st8(a + 0x10, ld8(b + 0x10))
	st8(b + 0x10, v)
	const w = ld8(a + 0x11)
	st8(a + 0x11, ld8(b + 0x11))
	st8(b + 0x11, w)
	const x = ld8(a + 0x12)
	st8(a + 0x12, ld8(b + 0x12))
	st8(b + 0x12, x)
	const y = ld8(a + 0x13)
	st8(a + 0x13, ld8(b + 0x13))
	st8(b + 0x13, y)
	const z = ld8(a + 0x14)
	st8(a + 0x14, ld8(b + 0x14))
	st8(b + 0x14, z)
	const aa = ld8(a + 0x15)
	st8(a + 0x15, ld8(b + 0x15))
	st8(b + 0x15, aa)
	const ab = ld8(a + 0x16)
	st8(a + 0x16, ld8(b + 0x16))
	st8(b + 0x16, ab)
	const ac = ld8(a + 0x17)
	st8(a + 0x17, ld8(b + 0x17))
	st8(b + 0x17, ac)
	const ad = ld8(a + 0x18)
	st8(a + 0x18, ld8(b + 0x18))
	st8(b + 0x18, ad)
	const ae = ld8(a + 0x19)
	st8(a + 0x19, ld8(b + 0x19))
	st8(b + 0x19, ae)
	const af = ld8(a + 0x1a)
	st8(a + 0x1a, ld8(b + 0x1a))
	st8(b + 0x1a, af)
	const ag = ld8(a + 0x1b)
	st8(a + 0x1b, ld8(b + 0x1b))
	st8(b + 0x1b, ag)
	const ah = ld8(a + 0x1c)
	st8(a + 0x1c, ld8(b + 0x1c))
	st8(b + 0x1c, ah)
	const ai = ld8(a + 0x1d)
	st8(a + 0x1d, ld8(b + 0x1d))
	st8(b + 0x1d, ai)
	const aj = ld8(a + 0x1e)
	st8(a + 0x1e, ld8(b + 0x1e))
	st8(b + 0x1e, aj)
	const ak = ld8(a + 0x1f)
	st8(a + 0x1f, ld8(b + 0x1f))
	st8(b + 0x1f, ak)
}

export function fn_17b98(a: u64, b: u64) {
	const s38 = fp - 0x38, s60 = fp - 0x60, s78 = fp - 0x78
	let k, l: u64
	const f = ld64(b + 0x38)
	if (f == 0) {
		st64(a + 0x10, 0)
		st64(a + 8, 1)
		st64(a, 0)
	} else {
		let h = ld64(b + 0x18)
		let g = ld64(b + 0x20)
		if (g != 0) {
			l = g - 1 & g
			k = f - 1
			st64(b + 0x38, k)
			st64(b + 0x20, l)
			if (h == 0) {
				st64(a + 0x10, 0)
				st64(a + 8, 1)
				st64(a, 0)
				return
			}
		} else {
			let i = ld64(b + 0x28)
			while (true) {
				h = h - 0x100
				const j = ld64(i)
				i = i + 8
				if ((j & 0x8080808080808080) != 0x8080808080808080) {
					st64(b + 0x18, h)
					st64(b + 0x28, i)
					g = j & 0x8080808080808080 ^ 0x8080808080808080
					k = f - 1
					st64(b + 0x38, k)
					l = g - 1 & g
					st64(b + 0x20, l)
					break
				}
			}
		}
		const ag = k
		const m = k + 1
		const r = m != 0 ? m : 0xffffffffffffffff
		const n = h - ((ld8(((g & -g) * 0x218a392cd3d5dbf >> 0x3a) + 0x1001590c8) << 2) & 0x1e0)
		const q = ld64(n - 0x20)
		const p = ld64(n - 0x18)
		const o = ld64(n - 0x10)
		st64(s60 + 0x18, ld64(n - 8))
		st64(s60, q, p, o)
		if (r > 0x7ffffffffffffff) {
			raw_vec_handle_error(0, max(r, 4) << 5, 0x100160148, max(r, 4) << 5, r)
		}
		if (0 > ((max(r, 4) << 5) as i64)) {
			raw_vec_handle_error(0, max(r, 4) << 5, 0x100160148, max(r, 4) << 5, r)
		}
		const s = ld64(0x300000000 /* heap bump-allocator cursor */)
		const t = s != 0 ? s : 0x300008000
		const u = t - (max(r, 4) << 5)
		let v = u > t ? 0 : u
		if (0x300000008 > v) {
			raw_vec_handle_error(1, max(r, 4) << 5, 0x100160148, max(r, 4) << 5, r)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, v)
		st64(v + 0x18, ld64(s60 + 0x18))
		st64(v + 0x10, ld64(s60 + 0x10))
		st64(v + 8, ld64(s60 + 8))
		st64(v, ld64(s60))
		st64(s78, max(r, 4), v, 1)
		let w = ag
		if (ag != 0) {
			let y = ld64(b + 0x28)
			let x = 1
			while (true) {
				const ah = x
				if (l == 0) {
					while (true) {
						h = h - 0x100
						const z = ld64(y)
						y = y + 8
						if ((z & 0x8080808080808080) != 0x8080808080808080) {
							l = z & 0x8080808080808080 ^ 0x8080808080808080
							break
						}
					}
				}
				const aa = h - ((ld8(((l & -l) * 0x218a392cd3d5dbf >> 0x3a) + 0x1001590c8) << 2) & 0x1e0)
				const ad = ld64(aa - 8)
				const ac = ld64(aa - 0x10)
				const ab = ld64(aa - 0x18)
				st64(s60 + 0x20, ld64(aa - 0x20))
				st64(s38, ab, ac, ad)
				w = w - 1
				let ae = ah
				if (ah == ld64(s78)) {
					reserve_do_reserve_and_handle_156f8(s78, ae, w != -1 ? w + 1 : 0xffffffffffffffff, 1, 0x20)
					ae = ah
					v = ld64(s78 + 8)
				}
				const af = v + (ae << 5)
				st64(af + 0x18, ld64(s38 + 0x10))
				st64(af + 0x10, ld64(s38 + 8))
				st64(af + 8, ld64(s38))
				st64(af, ld64(s60 + 0x20))
				x = ae + 1
				st64(s78 + 0x10, x)
				l = l - 1 & l
				if (w == 0) {
					st64(a + 0x10, ld64(s78 + 0x10))
					st64(a + 8, ld64(s78 + 8))
					st64(a, ld64(s78))
					return
				}
			}
		}
		st64(a + 0x10, ld64(s78 + 0x10))
		st64(a + 8, ld64(s78 + 8))
		st64(a, ld64(s78))
	}
}

export function fn_11118(a: u64, b: u64) {
	const s800 = fp - 0x800
	const f = max(b >> 1, min(b, 0x3d090))
	if (0x41 > f) {
		fn_112c8(a, b, s800, 0x40, 0x41 > b)
	} else {
		if (b > 0xfffffffffffffff) {
			raw_vec_handle_error(0, f << 5, 0x10015f9b0, f, 0)
		}
		if (0 > ((f << 5) as i64)) {
			raw_vec_handle_error(0, f << 5, 0x10015f9b0, f, 0)
		}
		const g = ld64(0x300000000 /* heap bump-allocator cursor */)
		const h = g != 0 ? g : 0x300008000
		const i = h - (f << 5)
		const j = i > h ? 0 : i
		if (0x300000008 > j) {
			raw_vec_handle_error(1, f << 5, 0x10015f9b0, f, 1)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		fn_112c8(a, b, j, f, 0x41 > b)
	}
}

export function fn_112c8(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s42 = fp - 0x42, s258 = fp - 0x258, s288 = fp - 0x288, s300 = fp - 0x300
	let k, l, aj, ak, al, am, au, az, bb, cm: u64
	st64(s300 + 0x18, e)
	st64(s288 + 0x20, c)
	let f = b
	st64(s300 + 0x58, a)
	st64(s300 + 0x28, b + 0x3fffffffffffffff)
	st64(s288 + 0x10, d)
	if (0x1001 > b) {
		const h = f - (f >> 1)
		st64(s300 + 0x30, h)
		if (h >= 0x40) {
			st64(s300 + 0x30, 0x40)
		}
	} else {
		const g = fn_152f48(f)
		d = ld64(s288 + 0x10)
		st64(s300 + 0x30, g)
	}
	st64(s300 + 0x28, ld64(s300 + 0x28) / f)
	let v = 0
	let u = 1
	const i = ld64(s300 + 0x58)
	st64(s300 + 0x20, i - 0x20)
	st64(s300, i - 0x10, i + 0xf, i + 0x20)
	let t = 0
	st64(s300 + 0x40, f)
	while (true) {
		let s = 0
		st64(s300 + 0x50, 1)
		st64(s300 + 0x68, v)
		if (f > v) {
			B54: {
				B33: {
					am = ld64(s300 + 0x58) + (v << 5)
					al = f - v
					if (al >= ld64(s300 + 0x30)) {
						let ba = al
						if (al >= 2) {
							B50: {
								const ao = memcmp(am + 0x20, am, 0x20)
								st64(s288 + 0x28, al)
								if (0 > (ao as i32)) {
									if (al == 2) {
										bb = 2
										if (ld64(s300 + 0x30) > 2) {
											break B33
										}
										break B50
									}
									st64(s288 + 8, ao as i32)
									st64(s288 + 0x18, am)
									let av = ld64(s300 + 0x10) + (ld64(s300 + 0x68) << 5)
									let ay = 2
									let aw = av
									do {
										aw = aw + 0x20
										const ax = memcmp(aw, av, 0x20)
										ba = ay
										if ((ax as i32) > -1) {
											break
										}
										ay = ay + 1
										av = aw
										az = ld64(s288 + 0x28)
										ba = az
									} while (az > ay)
								} else {
									if (al == 2) {
										ba = 2
										if (ld64(s300 + 0x30) > 2) {
											break B33
										}
										cm = (ba << 1) | 1
										break B54
									}
									st64(s288 + 8, ao as i32)
									st64(s288 + 0x18, am)
									let ap = ld64(s300 + 0x10) + (ld64(s300 + 0x68) << 5)
									let at = 2
									let aq = ap
									do {
										aq = aq + 0x20
										const ar = memcmp(aq, ap, 0x20)
										ba = at
										if (0 > (ar as i32)) {
											break
										}
										at = at + 1
										ap = aq
										au = ld64(s288 + 0x28)
										ba = au
									} while (au > at)
								}
								al = ld64(s288 + 0x28)
								am = ld64(s288 + 0x18)
								if (ld64(s300 + 0x30) > ba) {
									break B33
								}
								bb = ba
								if ((ld64(s288 + 8) as i64) >= 0) {
									cm = (ba << 1) | 1
									break B54
								}
							}
							ba = 1
							if (bb >= 2) {
								let cl = bb >> 1
								const bc = ld64(s300 + 0x68)
								let bd = ld64(s300 + 8) + (bc << 5)
								let be = ld64(s300) + (bb + bc << 5)
								do {
									const bf = ld8(bd - 0xf)
									st8(bd - 0xf, ld8(be - 0x10))
									st8(be - 0x10, bf)
									const bg = ld8(bd - 0xe)
									st8(bd - 0xe, ld8(be - 0xf))
									st8(be - 0xf, bg)
									const bh = ld8(bd - 0xd)
									st8(bd - 0xd, ld8(be - 0xe))
									st8(be - 0xe, bh)
									const bi = ld8(bd - 0xc)
									st8(bd - 0xc, ld8(be - 0xd))
									st8(be - 0xd, bi)
									const bj = ld8(bd - 0xb)
									st8(bd - 0xb, ld8(be - 0xc))
									st8(be - 0xc, bj)
									const bk = ld8(bd - 0xa)
									st8(bd - 0xa, ld8(be - 0xb))
									st8(be - 0xb, bk)
									const bl = ld8(bd - 9)
									st8(bd - 9, ld8(be - 0xa))
									st8(be - 0xa, bl)
									const bm = ld8(bd - 8)
									st8(bd - 8, ld8(be - 9))
									st8(be - 9, bm)
									const bn = ld8(bd - 7)
									st8(bd - 7, ld8(be - 8))
									st8(be - 8, bn)
									const bo = ld8(bd - 6)
									st8(bd - 6, ld8(be - 7))
									st8(be - 7, bo)
									const bp = ld8(bd - 5)
									st8(bd - 5, ld8(be - 6))
									st8(be - 6, bp)
									const bq = ld8(bd - 4)
									st8(bd - 4, ld8(be - 5))
									st8(be - 5, bq)
									const br = ld8(bd - 3)
									st8(bd - 3, ld8(be - 4))
									st8(be - 4, br)
									const bs = ld8(bd - 2)
									st8(bd - 2, ld8(be - 3))
									st8(be - 3, bs)
									const bt = ld8(bd - 1)
									st8(bd - 1, ld8(be - 2))
									st8(be - 2, bt)
									const bu = ld8(bd)
									st8(bd, ld8(be - 1))
									st8(be - 1, bu)
									const bv = ld8(bd + 1)
									st8(bd + 1, ld8(be))
									st8(be, bv)
									const bw = ld8(bd + 2)
									st8(bd + 2, ld8(be + 1))
									st8(be + 1, bw)
									const bx = ld8(bd + 3)
									st8(bd + 3, ld8(be + 2))
									st8(be + 2, bx)
									const by = ld8(bd + 4)
									st8(bd + 4, ld8(be + 3))
									st8(be + 3, by)
									const bz = ld8(bd + 5)
									st8(bd + 5, ld8(be + 4))
									st8(be + 4, bz)
									const ca = ld8(bd + 6)
									st8(bd + 6, ld8(be + 5))
									st8(be + 5, ca)
									const cb = ld8(bd + 7)
									st8(bd + 7, ld8(be + 6))
									st8(be + 6, cb)
									const cc = ld8(bd + 8)
									st8(bd + 8, ld8(be + 7))
									st8(be + 7, cc)
									const cd = ld8(bd + 9)
									st8(bd + 9, ld8(be + 8))
									st8(be + 8, cd)
									const ce = ld8(bd + 0xa)
									st8(bd + 0xa, ld8(be + 9))
									st8(be + 9, ce)
									const cf = ld8(bd + 0xb)
									st8(bd + 0xb, ld8(be + 0xa))
									st8(be + 0xa, cf)
									const cg = ld8(bd + 0xc)
									st8(bd + 0xc, ld8(be + 0xb))
									st8(be + 0xb, cg)
									const ch = ld8(bd + 0xd)
									st8(bd + 0xd, ld8(be + 0xc))
									st8(be + 0xc, ch)
									const ci = ld8(bd + 0xe)
									st8(bd + 0xe, ld8(be + 0xd))
									st8(be + 0xd, ci)
									const cj = ld8(bd + 0xf)
									st8(bd + 0xf, ld8(be + 0xe))
									st8(be + 0xe, cj)
									const ck = ld8(bd + 0x10)
									st8(bd + 0x10, ld8(be + 0xf))
									st8(be + 0xf, ck)
									bd = bd + 0x20
									be = be - 0x20
									cl = cl - 1
									ba = bb
								} while (cl != 0)
							}
						}
						cm = (ba << 1) | 1
						break B54
					}
				}
				if (ld64(s300 + 0x18) != 0) {
					const an = ld64(s288 + 0x10)
					al = min(al, 0x20)
					fn_129d0(am, al, ld64(s288 + 0x20), an, 0, 0)
					cm = (al << 1) | 1
				} else {
					cm = min(ld64(s300 + 0x30), al) << 1
				}
			}
			v = ld64(s300 + 0x68)
			st64(s300 + 0x50, cm)
			const cn = ld64(s300 + 0x28)
			s = clz(((cm >> 1) + (v << 1)) * cn ^ ((v << 1) - (u >> 1)) * cn)
			d = ld64(s288 + 0x10)
		}
		if (t >= 2) {
			st64(s300 + 0x38, ld64(s300 + 0x20) + (v << 5))
			st64(s288 + 0x18, ld64(s300 + 0x58) + (v << 5))
			let r = t
			let q = t
			st64(s300 + 0x60, s)
			do {
				q = q - 1
				t = r
				if (s > ld8(s42 + q)) {
					break
				}
				const w = ld64(s258 + (q << 3))
				const x = u
				let y = (w >> 1) + (u >> 1)
				if (d >= y && ((w | u) & 1) == 0) {
					ak = y << 1
				} else {
					st64(s300 + 0x70, u)
					st64(s288 + 0x28, ld64(s300 + 0x58) + (v - y << 5))
					st64(s288, y, q)
					if ((w & 1) == 0) {
						fn_129d0(ld64(s288 + 0x28), (w >> 1), ld64(s288 + 0x20), ld64(s288 + 0x10), ((clz(w >> 1 | 1) << 1) ^ 0x7e), 0)
						y = ld64(s288)
						q = ld64(s288 + 8)
						s = ld64(s300 + 0x60)
						v = ld64(s300 + 0x68)
						d = ld64(s288 + 0x10)
					}
					const z = ld64(s300 + 0x70)
					if ((z & 1) == 0) {
						const aa = ld64(s288 + 0x28) + (w >> 1 << 5)
						fn_129d0(aa, (x >> 1), ld64(s288 + 0x20), ld64(s288 + 0x10), ((clz(x >> 1 | 1) << 1) ^ 0x7e), 0)
						y = ld64(s288)
						q = ld64(s288 + 8)
						s = ld64(s300 + 0x60)
						v = ld64(s300 + 0x68)
						d = ld64(s288 + 0x10)
					}
					if (z >= 2 && w >= 2) {
						const ab = min(x >> 1, w >> 1)
						if (d >= ab) {
							let ac = ld64(s288 + 0x28) + (w >> 1 << 5)
							st64(s300 + 0x70, ac)
							if ((x >> 1) >= (w >> 1)) {
								ac = ld64(s288 + 0x28)
							}
							st64(s300 + 0x48, ab << 5)
							const ad = ld64(s288 + 0x20)
							memcpy(ad, ac, ab << 5)
							let m = ad + ld64(s300 + 0x48)
							if ((x >> 1) >= (w >> 1)) {
								l = ad
								k = ld64(s288 + 0x28)
								let o = ld64(s300 + 0x70)
								if (ab != 0) {
									k = ld64(s288 + 0x28)
									l = ad
									do {
										const p = o
										const n = memcmp(o, l, 0x20)
										const j = (n as i32) > -1 ? l : o
										copy(k, j, 0x20)
										l = l + (((n as i32) > -1) << 5)
										k = k + 0x20
										if (l == m) {
											break
										}
										o = p + ((n & 0x80000000) >> 0x1a)
									} while (o != ld64(s288 + 0x18))
								}
							} else {
								let ag = ld64(s300 + 0x38)
								k = ld64(s300 + 0x70)
								do {
									const ah = m - 0x20
									const ai = k - 0x20
									const ae = memcmp(ah, ai, 0x20)
									const af = (ae as i32) > -1 ? ah : ai
									copy(ag, af, 0x20)
									m = ah + ((ae & 0x80000000) >> 0x1a)
									k = ai + (((ae as i32) > -1) << 5)
									aj = ld64(s288 + 0x20)
									l = aj
									if (k == ld64(s288 + 0x28)) {
										break
									}
									ag = ag - 0x20
									l = aj
								} while (m != aj)
							}
							memcpy(k, l, m - l)
							d = ld64(s288 + 0x10)
							v = ld64(s300 + 0x68)
							s = ld64(s300 + 0x60)
							q = ld64(s288 + 8)
							y = ld64(s288)
						}
					}
					ak = (y << 1) | 1
				}
				t = 1
				r = q
				u = ak
			} while (q > 1)
		}
		st8(s42 + t, s)
		st64(s258 + (t << 3), u)
		f = ld64(s300 + 0x40)
		if (v >= f) {
			if ((u & 1) != 0) {
				return
			}
			fn_129d0(ld64(s300 + 0x58), f, ld64(s288 + 0x20), d, (clz(f | 1) << 1) ^ 0x7e, 0)
			return
		}
		u = ld64(s300 + 0x50)
		t = t + 1
		v = (u >> 1) + v
	}
}

export function fn_129d0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64) {
	const s30 = fp - 0x30, s50 = fp - 0x50, s60 = fp - 0x60, s80 = fp - 0x80, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sa0 = fp - 0xa0, sa8 = fp - 0xa8
	let f, g, h, q, cv: u64
	B34: {
		st64(s90, d)
		f = c
		g = b
		h = a
		st64(s60 + 8, c)
		if (b >= 0x21) {
			st64(s98, p6)
			let i = p5
			st64(sa0, f - 0x20)
			let j = g
			L2: while (true) {
				st64(s80 + 0x10, h)
				L3: while (true) {
					if ((i as u32) == 0) {
						fn_112c8(h, j, f, ld64(s90), 1)
						return
					}
					st64(s88, i)
					const k = j
					let m = h + (j >> 3) * 0xe0
					const l = h + (j >> 3 << 7)
					st64(s80 + 8, j)
					if (0x40 > j) {
						const n = memcmp(h, l, 0x20)
						const o = memcmp(h, m, 0x20)
						st64(s60, n)
						f = ld64(s60 + 8)
						q = h
						if (((o ^ n) as i32) >= 0) {
							const p = memcmp(l, m, 0x20)
							m = 0 > ((p ^ ld64(s60)) as i32) ? m : l
							q = m
						}
					} else {
						q = fn_10d18(h, l, m, k >> 3)
					}
					B22: {
						st64(s60, q)
						const r = ld64(s88)
						copyr(s50, q, 0x20)
						st64(s80, q - h >> 5)
						const s = ld64(s98)
						st64(s88, r - 1)
						if (s != 0) {
							const t = memcmp(ld64(s98), q, 0x20)
							q = ld64(s60)
							if ((t as i32) > -1) {
								break B22
							}
						}
						const u = ld64(s80 + 8)
						if (u > ld64(s90)) {
							abort()
						}
						let y = h
						let ab = f + (u << 5)
						g = 0
						let v = ld64(s80)
						while (true) {
							st64(s80 + 0x18, v)
							const x = v << 5
							const w = ld64(s80 + 0x10)
							let z = q
							if (w + x > y) {
								do {
									const aa = memcmp(y, z, 0x20)
									ab = ab - 0x20
									let ac = ld64(s60 + 8)
									ac = 0 > (aa as i32) ? ac : ab
									const ad = ac + (g << 5)
									copy(ad, y, 0x20)
									g = g + ((aa & 0x80000000) >> 0x1f)
									y = y + 0x20
									z = ld64(s60)
								} while (w + x > y)
							}
							const ae = ld64(s80 + 8)
							if (ld64(s80 + 0x18) == ae) {
								const ag = g
								h = ld64(s80 + 0x10)
								f = ld64(s60 + 8)
								memcpy(h, f, g << 5)
								let aj = undef
								let ah = ld64(s80 + 8)
								const al = ah - g
								if (ah != g) {
									let ai = ld64(sa0) + (ah << 5)
									ah = h + (ag << 5)
									let ak = 0
									do {
										st64(ah + 0x18, ld64(ai + 0x18))
										st64(ah + 0x10, ld64(ai + 0x10))
										st64(ah + 8, ld64(ai + 8))
										aj = ld64(ai)
										st64(ah, aj)
										ai = ai - 0x20
										ah = ah + 0x20
										ak = ak + 1
									} while (al > ak)
								}
								i = ld64(s88)
								q = ld64(s60)
								if (g == 0) {
									break
								}
								if (g > ld64(s80 + 8)) {
									st64(s30, 0x10015f7d8, 1, 8, 0, 0)
									// fmt "mid > len"
									fn_14ec00(s30, 0x10015f880, ah, q, aj)
								}
								fn_129d0(h + (g << 5), al, f, ld64(s90), i, s50)
								j = g
								if (0x21 > g) {
									break B34
								}
								continue L3
							}
							q = z
							ab = ab - 0x20
							const af = ab + (g << 5)
							st64(af + 0x18, ld64(y + 0x18))
							st64(af + 0x10, ld64(y + 0x10))
							st64(af + 8, ld64(y + 8))
							st64(af, ld64(y))
							y = y + 0x20
							v = ae
						}
					}
					const am = ld64(s80 + 8)
					if (am > ld64(s90)) {
						abort()
					}
					let aq = h
					let au = f + (am << 5)
					let av = 0
					let an = ld64(s80)
					while (true) {
						st64(s80, an)
						const ap = an << 5
						const ao = ld64(s80 + 0x10)
						let ar = q
						if (ao + ap > aq) {
							do {
								const at = memcmp(ar, aq, 0x20)
								au = au - 0x20
								let aw = ld64(s60 + 8)
								aw = (at as i32) > -1 ? aw : au
								const ax = aw + (av << 5)
								copy(ax, aq, 0x20)
								av = av + ((at as i32) > -1)
								aq = aq + 0x20
								ar = ld64(s60)
							} while (ao + ap > aq)
						}
						const ay = ld64(s80 + 8)
						if (ld64(s80) == ay) {
							const ba = av
							const bb = ld64(s80 + 0x10)
							memcpy(bb, ld64(s60 + 8), av << 5)
							let bf = undef
							let be = undef
							const bc = ld64(s80 + 8)
							g = bc - av
							if (bc != av) {
								let bd = ld64(sa0) + (bc << 5)
								be = bb + (ba << 5)
								let bg = 0
								do {
									st64(be + 0x18, ld64(bd + 0x18))
									st64(be + 0x10, ld64(bd + 0x10))
									st64(be + 8, ld64(bd + 8))
									bf = ld64(bd)
									st64(be, bf)
									bd = bd - 0x20
									be = be + 0x20
									bg = bg + 1
								} while (g > bg)
							}
							if (bc >= av) {
								h = bb + (av << 5)
								st64(s98, 0)
								j = g
								f = ld64(s60 + 8)
								i = ld64(s88)
								if (0x21 > g) {
									break B34
								}
								continue L2
							}
							fn_153150(av, bc, 0x10015f898, bf, be)
						}
						q = ar
						const az = ld64(s60 + 8) + (av << 5)
						st64(az + 0x18, ld64(aq + 0x18))
						st64(az + 0x10, ld64(aq + 0x10))
						st64(az + 8, ld64(aq + 8))
						st64(az, ld64(aq))
						aq = aq + 0x20
						av = av + 1
						au = au - 0x20
						an = ay
					}
				}
			}
		}
	}
	if (g >= 2) {
		if (g + 0x10 > ld64(s90)) {
			abort()
		}
		st64(s90, g >> 1)
		const bh = g >> 1 << 5
		const bi = f + bh
		const bj = h + bh
		st64(s80 + 0x10, h)
		st64(s60, bi)
		st64(s88, bj)
		if (g > 7) {
			const bk = memcmp(h + 0x20, h, 0x20)
			st64(s80 + 0x18, bk)
			const bl = memcmp(h + 0x60, h + 0x40, 0x20)
			st64(s80 + 8, h + ((bk & 0x80000000) >> 0x1a))
			const bn = 0 > (bl as i32) ? 0x60 : 0x40
			const bm = ld64(s80 + 0x10)
			const bo = memcmp(bm + bn, ld64(s80 + 8), 0x20)
			const bp = (ld64(s80 + 0x18) as i32) > -1
			st64(s80 + 0x18, bo)
			const bq = 0 > (bl as i32) ? 0x40 : 0x60
			st64(s98, bm + bq)
			let bt = bm + (bp << 5)
			const br = memcmp(bm + bq, bm + (bp << 5), 0x20)
			const bs = ld64(s80 + 0x18)
			let bu = ld64(s98)
			bu = 0 > (br as i32) ? bu : 0 > (bs as i32) ? bt : bm + bn
			st64(s80, bm + bn)
			let bv = ld64(s80 + 8)
			st64(s80 + 0x18, bs as i32)
			bv = 0 > (bs as i32) ? bv : 0 > (br as i32) ? bm + bn : bt
			st64(sa0, bu)
			const bw = memcmp(bu, bv, 0x20)
			if ((ld64(s80 + 0x18) as i64) >= 0) {
				st64(s80, ld64(s80 + 8))
			}
			const bx = ld64(sa0)
			const ca = 0 > (bw as i32) ? bx : bv
			bv = 0 > (bw as i32) ? bv : bx
			if ((br as i32) >= 0) {
				bt = ld64(s98)
			}
			const by = ld64(s80)
			const bz = ld64(s60 + 8)
			st64(bz + 0x18, ld64(by + 0x18))
			st64(bz + 0x10, ld64(by + 0x10))
			st64(bz + 8, ld64(by + 8))
			st64(bz, ld64(by))
			st64(bz + 0x38, ld64(ca + 0x18))
			st64(bz + 0x30, ld64(ca + 0x10))
			st64(bz + 0x28, ld64(ca + 8))
			st64(bz + 0x20, ld64(ca))
			copy(bz + 0x40, bv, 0x20)
			copy(bz + 0x60, bt, 0x20)
			const cb = ld64(s88)
			const cc = memcmp(cb + 0x20, cb, 0x20)
			st64(s80, cc)
			const cd = memcmp(cb + 0x60, cb + 0x40, 0x20)
			st64(s80 + 8, cb + ((cc & 0x80000000) >> 0x1a))
			const cf = 0 > (cd as i32) ? 0x60 : 0x40
			const ce = ld64(s88)
			st64(s98, ce + cf)
			const cg = memcmp(ce + cf, ld64(s80 + 8), 0x20)
			const ci = 0 > (cd as i32) ? 0x40 : 0x60
			st64(s80 + 0x18, cg)
			const ch = (ld64(s80) as i32) > -1
			const cj = memcmp(ce + ci, ce + (ch << 5), 0x20)
			const ck = ld64(s80 + 0x18)
			st64(s80, ce + (ch << 5))
			let cl = ld64(s98)
			const cn = 0 > (cj as i32) ? ce + ci : 0 > (ck as i32) ? ce + (ch << 5) : cl
			st64(sa8, ce + ci)
			let cm = cl
			if ((cj as i32) >= 0) {
				cm = ld64(s80)
			}
			let co = ld64(s80 + 8)
			st64(s80 + 0x18, ck as i32)
			co = 0 > (ck as i32) ? co : cm
			st64(sa0, cn)
			const cp = memcmp(cn, co, 0x20)
			if ((ld64(s80 + 0x18) as i64) >= 0) {
				cl = ld64(s80 + 8)
			}
			const cq = ld64(sa0)
			const cs = 0 > (cp as i32) ? cq : co
			co = 0 > (cp as i32) ? co : cq
			if ((cj as i32) >= 0) {
				st64(s80, ld64(sa8))
			}
			const cr = ld64(s60)
			st64(cr + 0x18, ld64(cl + 0x18))
			st64(cr + 0x10, ld64(cl + 0x10))
			st64(cr + 8, ld64(cl + 8))
			st64(cr, ld64(cl))
			st64(cr + 0x38, ld64(cs + 0x18))
			st64(cr + 0x30, ld64(cs + 0x10))
			st64(cr + 0x28, ld64(cs + 8))
			st64(cr + 0x20, ld64(cs))
			copy(cr + 0x40, co, 0x20)
			const ct = ld64(s80)
			copy(cr + 0x60, ct, 0x20)
			cv = 4
		} else {
			st64(f + 0x18, ld64(h + 0x18))
			st64(f + 0x10, ld64(h + 0x10))
			st64(f + 8, ld64(h + 8))
			st64(f, ld64(h))
			st64(bi + 0x18, ld64(bj + 0x18))
			st64(bi + 0x10, ld64(bj + 0x10))
			st64(bi + 8, ld64(bj + 8))
			st64(bi, ld64(bj))
			cv = 1
		}
		const cu = ld64(s90)
		st64(s98, g - cu)
		st64(s80, cv)
		if (cu > cv) {
			let cw = ld64(s80)
			let dc = cw << 5
			do {
				const de = ld64(s60 + 8) + (cw << 5)
				const dd = ld64(s80 + 0x10) + (cw << 5)
				st64(de + 0x18, ld64(dd + 0x18))
				st64(de + 0x10, ld64(dd + 0x10))
				st64(de + 8, ld64(dd + 8))
				st64(de, ld64(dd))
				if ((memcmp(de, de - 0x20, 0x20) as i32) <= -1) {
					copyr(s30, dd, 0x20)
					let cy = dc
					while (true) {
						const cx = ld64(s60 + 8)
						const cz = cx + cy
						st64(cz + 0x18, ld64(cz - 8))
						st64(cz + 0x10, ld64(cz - 0x10))
						st64(cz + 8, ld64(cz - 0x18))
						st64(cz, ld64(cz - 0x20))
						let db = cx
						if (cy != 0x20) {
							const da = memcmp(s30, cz - 0x40, 0x20)
							cy = cy - 0x20
							if (0 > (da as i32)) {
								continue
							}
							db = ld64(s60 + 8) + cy
						}
						st64(db + 0x18, ld64(s30 + 0x18))
						st64(db + 0x10, ld64(s30 + 0x10))
						st64(db + 8, ld64(s30 + 8))
						st64(db, ld64(s30))
						break
					}
				}
				cw = cw + 1
				dc = dc + 0x20
			} while (ld64(s90) > cw)
		}
		let dh = ld64(s60)
		let df = ld64(s80)
		if (ld64(s98) > df) {
			st64(s80 + 0x18, 0x20)
			const dg = df
			st64(s80 + 8, dh)
			do {
				st64(s80, df)
				const dq = df << 5
				const dr = ld64(s88)
				st64(dh + dq + 0x18, ld64(dr + dq + 0x18))
				st64(dh + dq + 0x10, ld64(dr + dq + 0x10))
				st64(dh + dq + 8, ld64(dr + dq + 8))
				st64(dh + dq, ld64(dr + dq))
				if ((memcmp(dh + dq, dh + dq - 0x20, 0x20) as i32) <= -1) {
					copyr(s30, dr + dq, 0x20)
					let dk = ld64(s80 + 0x18)
					let di = ld64(s80 + 8)
					while (true) {
						const dj = di + (dg << 5)
						st64(dj + 0x18, ld64(dj - 8))
						st64(dj + 0x10, ld64(dj - 0x10))
						st64(dj + 8, ld64(dj - 0x18))
						st64(dj, ld64(dj - 0x20))
						let dm = ld64(s60)
						if ((dg << 5) != dk) {
							const dl = memcmp(s30, dj - 0x40, 0x20)
							dk = dk + 0x20
							di = di - 0x20
							if (0 > (dl as i32)) {
								continue
							}
							dm = di + (dg << 5)
						}
						st64(dm + 0x18, ld64(s30 + 0x18))
						st64(dm + 0x10, ld64(s30 + 0x10))
						st64(dm + 8, ld64(s30 + 8))
						st64(dm, ld64(s30))
						dh = ld64(s60)
						break
					}
				}
				df = ld64(s80) + 1
				st64(s80 + 0x18, ld64(s80 + 0x18) - 0x20)
				st64(s80 + 8, ld64(s80 + 8) + 0x20)
			} while (ld64(s98) > df)
		}
		const dn = (g << 5) - 0x20
		let dt = ld64(s80 + 0x10) + dn
		let dp = ld64(s60 + 8)
		st64(s80 + 0x18, dp + dn)
		let dy = 0
		let ea = dh - 0x20
		while (true) {
			st64(s80, dy, ea)
			st64(s60, dh, dp)
			const eb = memcmp(dh, dp, 0x20)
			const ee = (eb as i32) > -1
			let ec = ld64(s60 + 8)
			const ef = ld64(s80 + 8)
			if (-1 >= (eb as i32)) {
				ec = ld64(s60)
			}
			const ed = ld64(s80 + 0x10)
			copy(ed, ec, 0x20)
			st64(s88, ee << 5)
			let ds = ld64(s80 + 0x18)
			const eg = memcmp(ds, ef, 0x20)
			const dw = ld64(s80 + 8)
			const dx = ld64(s80)
			ds = (eg as i32) > -1 ? ds : dw
			dh = ld64(s60) + ((eb & 0x80000000) >> 0x1a)
			dp = ld64(s60 + 8) + ld64(s88)
			copy(dt, ds, 0x10)
			let du = ld64(ds + 0x10)
			st64(dt + 0x10, du)
			st64(dt + 0x18, ld64(ds + 0x18))
			const dv = sar(eg << 0x20, 0x3f)
			ea = dw + (dv << 5)
			st64(s80 + 0x18, ld64(s80 + 0x18) + (~dv << 5))
			dt = dt - 0x20
			st64(s80 + 0x10, ld64(s80 + 0x10) + 0x20)
			dy = dx + 1
			let dz = ld64(s90)
			if (dy >= dz) {
				const eh = ea + 0x20
				if ((g & 1) != 0) {
					const ei = eh > dp ? dp : dh
					dy = ld64(s80 + 0x10)
					st64(dy + 0x18, ld64(ei + 0x18))
					st64(dy + 0x10, ld64(ei + 0x10))
					st64(dy + 8, ld64(ei + 8))
					st64(dy, ld64(ei))
					du = (dp >= eh) << 5
					dh = dh + du
					dz = (eh > dp) << 5
					dp = dp + dz
				}
				if (dp != eh) {
					fn_1530f0(dz, dp, du, dy, eh)
				}
				dz = ld64(s80 + 0x18) + 0x20
				if (dh == dz) {
					return
				}
				fn_1530f0(dz, dp, du, dy, eh)
			}
		}
	}
}

export function fn_10d18(a: u64, b: u64, c: u64, d: u64): u64 {
	let h = c
	let i = b
	let f = a
	if (d >= 8) {
		const g = d >> 3 << 7
		const l = h
		const j = (d >> 3) * 0xe0
		f = fn_10d18(f, f + g, f + j, d >> 3)
		i = fn_10d18(i, i + g, i + j, d >> 3)
		h = fn_10d18(l, l + g, l + j, d >> 3)
	}
	const k = memcmp(f, i, 0x20)
	if (((memcmp(f, h, 0x20) ^ k) as i32) < 0) {
		return f
	}
	return ((memcmp(i, h, 0x20) ^ k) as i32) < 0 ? h : i
}

export function fn_1530f0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x100162428, 1, 8, 0, 0)
	// fmt "user-provided comparison function does not correctly implement a total order"
	fn_14ec00(s30, 0x100162438, c, d, e)
}

export function fn_10f00(a: u64, b: u64) {
	const s20 = fp - 0x20, s28 = fp - 0x28
	if (b != 1) {
		let f = a + (b << 5)
		let j = 0
		let l = a + 0x20
		let m = a
		st64(s28, f)
		while (true) {
			const k = l
			if ((memcmp(l, m, 0x20) as i32) <= -1) {
				copyr(s20, k, 0x20)
				let g = j
				while (true) {
					const h = a + g
					st64(h + 0x38, ld64(h + 0x18))
					st64(h + 0x30, ld64(h + 0x10))
					st64(h + 0x28, ld64(h + 8))
					st64(h + 0x20, ld64(h))
					let i = a
					if (g != 0) {
						g = g - 0x20
						if ((memcmp(s20, g + a, 0x20) as i32) < 0) {
							continue
						}
						i = a + g + 0x20
					}
					st64(i + 0x18, ld64(s20 + 0x18))
					st64(i + 0x10, ld64(s20 + 0x10))
					st64(i + 8, ld64(s20 + 8))
					st64(i, ld64(s20))
					f = ld64(s28)
					break
				}
			}
			j = j + 0x20
			l = k + 0x20
			m = k
			if (l == f) {
				return
			}
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (value)
export function fn_68d08(a: u64, b: u64): u64 {
	const s10 = fp - 0x10, s30 = fp - 0x30, s70 = fp - 0x70, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sa0 = fp - 0xa0
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0xc80) : 0x300007380
	if (g > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		st64(s90, a + 0x141)
		memcpy(g, a + 0x141, 0xc80)
		let h = g
		let k = 0x64 /* anchor::InstructionMissing */
		st64(s88, 0x64 /* anchor::InstructionMissing */, g, 0x64 /* anchor::InstructionMissing */)
		const j = ld64(b + 8)
		const i = ld64(b + 0x10)
		if (i != 0) {
			reserve_do_reserve_and_handle_156f8(s88, 0x64 /* anchor::InstructionMissing */, i, 1, 0x20)
			h = ld64(s88 + 8)
			k = ld64(s88 + 0x10)
		}
		st64(s98, i)
		let n = h
		let q = memcpy(h + (k << 5), j, i << 5)
		const l = k
		const m = ld64(s98)
		let r = 0
		st64(s88 + 0x10, k + m)
		let t = 0
		let ad = ld64(s90)
		if (k + m != 0) {
			st64(sa0, l + m)
			let o = l + m
			st64(s98, n)
			while (true) {
				if (o != 0) {
					st64(s30, 0, 0, 0, 0)
					const p = memcmp(n, s30, 0x20)
					o = o - 1
					n = n + 0x20
					q = p as u32
					if (q != 0) {
						continue
					}
					r = 1
					if (o != 0) {
						while (true) {
							st64(s30, 0, 0, 0, 0)
							q = memcmp(n, s30, 0x20) as u32
							if (q != 0) {
								const s = n - (r << 5)
								st64(s + 0x18, ld64(n + 0x18))
								st64(s + 0x10, ld64(n + 0x10))
								st64(s + 8, ld64(n + 8))
								st64(s, ld64(n))
								n = n + 0x20
								o = o - 1
								if (o == 0) {
									break
								}
							} else {
								r = r + 1
								n = n + 0x20
								o = o - 1
								if (o == 0) {
									break
								}
							}
						}
					}
				}
				t = ld64(sa0) - r
				st64(s88 + 0x10, t)
				ad = ld64(s90)
				n = ld64(s98)
				r = 0
				break
			}
		}
		st64(s30 + 0x18, ld64(0x10015fae8))
		st64(s30 + 0x10, ld64(0x10015fae0))
		st64(s30 + 8, ld64(0x10015fad8))
		st64(s30, ld64(0x10015fad0))
		st64(s10, 0, 0)
		let y = fn_1d0(s30, n, n + (t << 5), q)
		let x = undef
		const w = ld64(s30 + 0x18)
		const v = ld64(s30 + 8)
		const u = ld64(s30)
		const z = ld64(u)
		if (v != 0) {
			r = 8
			y = v * 0x21 + 0x29
			x = u - (v << 5) - 0x20
		}
		st64(s70, r, y, x, u, ~z & 0x8080808080808080, u + 8, u + v + 1, w)
		fn_17b98(s30, s70)
		let aa = 0x141
		while (true) {
			const ab = a + aa
			st64(ab + 0x18, 0)
			st64(ab + 0x10, 0)
			st64(ab + 8, 0)
			st64(ab, 0)
			aa = aa + 0x20
			if (aa == 0xdc1) {
				const ac = ld64(s30 + 0x10)
				if (0x65 /* anchor::InstructionFallbackNotFound */ > ac) {
					return memcpy(ad, ld64(s30 + 8), ac << 5)
				}
				fn_153158(ac, 0x64 /* anchor::InstructionMissing */, 0x100160190)
			}
		}
	}
	raw_vec_handle_error(1, 0xc80, 0x10015f8f8, 0xc80 > f, f)
}
