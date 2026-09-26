/// <reference path="../lib.d.ts" />
// instruction swap_router_base_in
import { anchor_error_from, fn_10b930, fn_13e5a0, fn_13e628, fn_147a20, fn_147a98, fn_14ed60, fn_3e038, fn_4130, fn_4dc0, fn_5608, fn_85138, fn_88360, fn_88558, memcpy } from '../shared.ts'

// instruction handler: swap_router_base_in (discriminator sha256("global:swap_router_base_in")[..8] = 0xc4f2baf5da737d45)
// accounts [idl]: 0 payer [signer], 1 input_token_account [mut], 2 input_token_mint [mut], 3 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 4 token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb], 5 memo_program [= MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr]
// args [idl]: amount_in: u64, amount_out_minimum: u64
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, amount_in, amount_out_minimum
export function ix_swap_router_base_in(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s160 = fp - 0x160, s168 = fp - 0x168, s178 = fp - 0x178, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330
	let m, n: u64
	const i = sol_log("Instruction: SwapRouterBaseIn", 0x1d)
	const f = ix_args_len
	if (f >= 8 && (f & -8) != 8) {
		const args: SwapRouterBaseInArgs = ix_args
		const amount_in = args.amount_in
		const amount_out_minimum = args.amount_out_minimum
		st64(s300, accounts, accounts_len)
		n = accounts_swap_router_base_in(s178, amount_in, s300, undef, fp, i)
		const j = ld32(s178)
		if (j == 2) {
			m = ld64(s178 + 8)
			st64(a + 8, ld64(s168))
			st64(a, m)
			return n
		}
		const q = ld32(s178 + 4)
		const p = ld64(s178 + 8)
		const o = ld64(s168)
		memcpy(s2d8, s160, 0x160)
		st64(s2e8, p, o)
		st32(s2f0, j, q)
		copyr(s168, s300, 0x10)
		st64(s178, program_id, s2f0)
		n = fn_419a0(s310, s178, amount_in, amount_out_minimum)
		m = ld64(s310)
		if (m == 2) {
			n = fn_bc4f8(s320, s2f0, program_id)
			m = ld64(s320)
			st64(a + 8, ld64(s320 + 8))
			st64(a, m)
			return n
		}
		st64(a + 8, ld64(s310 + 8))
		st64(a, m)
		return n
	}
	const k = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (k & 3) - 2) {
		n = anchor_error_from(s330, 0x66 /* anchor::InstructionDidNotDeserialize */)
		m = ld64(s330)
		st64(a + 8, ld64(s330 + 8))
		st64(a, m)
		return n
	}
	if ((k & 3) == 0) {
		n = anchor_error_from(s330, 0x66 /* anchor::InstructionDidNotDeserialize */)
		m = ld64(s330)
		st64(a + 8, ld64(s330 + 8))
		st64(a, m)
		return n
	}
	const l = ld64(ld64(k + 7))
	if (l == 0) {
		n = anchor_error_from(s330, 0x66 /* anchor::InstructionDidNotDeserialize */)
		m = ld64(s330)
		st64(a + 8, ld64(s330 + 8))
		st64(a, m)
		return n
	}
	callx(l, ld64(k - 1), l)
	n = anchor_error_from(s330, 0x66 /* anchor::InstructionDidNotDeserialize */)
	m = ld64(s330)
	st64(a + 8, ld64(s330 + 8))
	st64(a, m)
	return n
}

// Anchor Accounts::try_accounts of instruction swap_router_base_in (called by ix_swap_router_base_in; name [str]: from the handler's "Instruction: …" log; was fn_bb318)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: memo_program, input_token_mint (ConstraintTokenOwner, ConstraintMut, ConstraintTokenMint), input_token_account (ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: input_token_account [idl]
export function accounts_swap_router_base_in(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s40 = fp - 0x40, s60 = fp - 0x60, s70 = fp - 0x70, sf8 = fp - 0xf8, s120 = fp - 0x120, s144 = fp - 0x144, s198 = fp - 0x198, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8, s21c = fp - 0x21c, s288 = fp - 0x288, s2a8 = fp - 0x2a8, s2c0 = fp - 0x2c0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s398 = fp - 0x398, s3a0 = fp - 0x3a0, s3a8 = fp - 0x3a8
	let s, u, z, ab, ac, ad: u64
	let n = try_accounts_17a30(s1f8, c, c, d, e, r0)
	const i = ld64(s1f0)
	const f = ld64(s1f8)
	if (f == 2) {
		st64(s398 + 0x50, a)
		try_accounts_1678(s1f8, c)
		n = ld64(s1f0)
		const l = ld64(s1f8)
		const j = ld32(s198 + 0x50)
		if (j == 2) {
			const k = ld64(0x300000000 /* heap bump-allocator cursor */)
			const m = k != 0 ? sat_sub(k, 0x13) : 0x300007fed
			if ((l & 1) != 0) {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x13 > k)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m + 8, 0x6f6363615f6e656b)
				st64(m, 0x6f745f7475706e69)
				st32(m + 0xf, 0x746e756f)
				void ld64(n)
			} else {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x13 > k)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m + 8, 0x6f6363615f6e656b)
				st64(m, 0x6f745f7475706e69)
				st32(m + 0xf, 0x746e756f)
				void ld64(n)
			}
			st64(n + 0x10, m, 0x13)
			st64(n + 8, 0x13)
			st64(n, 1)
			z = ld64(s398 + 0x50)
			st64(z + 0x10, n)
			st64(z + 8, l)
			st32(z, 2)
			return n
		}
		st64(s398 + 0x38, i)
		copyr(s70, s1e8, 0x10)
		st64(s398 + 0x40, ld64(s1e0 + 8))
		st64(s398 + 0x48, j)
		memcpy(sf8, s1d0, 0x88)
		copy(s120, s144, 0x20)
		st32(s120 + 0x20, ld32(s144 + 0x20))
		st64(s398 + 0x20, n)
		st64(s2e0 + 0x18, n)
		const input_token_account: AccountInfo = ld64(s398 + 0x40)
		st64(s398 + 0x28, l)
		st64(s2e0 + 0x10, l)
		const p = ld64(s398 + 0x48)
		copy(s2c0, s70, 0x10)
		st64(s2c0 + 0x10, input_token_account)
		st64(s398 + 0x30, s2a8)
		memcpy(s2a8, sf8, 0x88)
		st32(s288 + 0x68, p)
		copy(s21c, s120, 0x20)
		st32(s21c + 0x20, ld32(s120 + 0x20))
		n = try_accounts_15c0(s1f8, c)
		const q = ld32(s1f8)
		if (q == 2) {
			const r = ld64(0x300000000 /* heap bump-allocator cursor */)
			const t = r != 0 ? sat_sub(r, 0x10) : 0x300007ff0
			u = ld64(s1e8)
			s = ld64(s1f0)
			if (s != 0) {
				if (0x300000008 > t) {
					raw_vec_handle_error(1, 0x10, 0x10015f8f8, 0x10 > r)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, t)
				st64(t + 8, 0x746e696d5f6e656b)
				st64(t, 0x6f745f7475706e69)
				void ld64(u)
			} else {
				if (0x300000008 > t) {
					raw_vec_handle_error(1, 0x10, 0x10015f8f8, 0x10 > r)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, t)
				st64(t + 8, 0x746e696d5f6e656b)
				st64(t, 0x6f745f7475706e69)
				void ld64(u)
			}
			st64(u + 0x10, t, 0x10)
			st64(u + 8, 0x10)
			st64(u, 1)
			z = ld64(s398 + 0x50)
			st64(z + 0x10, u)
			st64(z + 8, s)
			st32(z, 2)
			return n
		}
		copyr(s398, s1f0, 0x10)
		st64(s398 + 0x10, ld32(s1f8 + 4))
		memcpy(s40, s1e0, 0x40)
		copy(s60, s198, 0x20)
		st64(s398 + 0x18, ld64(s1d0 + 0x30))
		try_accounts_19190(s1f8, c)
		n = ld64(s1f0)
		s = ld64(s1f8)
		if (s == 2) {
			st64(s3a0, n)
			fn_18cf0(s1f8, c)
			n = ld64(s1f0)
			s = ld64(s1f8)
			if (s == 2) {
				st64(s3a8, n)
				fn_193e0(s1f8, c)
				u = ld64(s1f0)
				const aa = ld64(s1f8)
				if (aa != 2) {
					n = fn_4130(s2e0, aa, u, "memo_program", 0xc)
					u = ld64(s2e0 + 8)
					s = ld64(s2e0)
					if (s != 2) {
						z = ld64(s398 + 0x50)
						st64(z + 0x10, u)
						st64(z + 8, s)
						st32(z, 2)
						return n
					}
				}
				if (input_token_account.is_writable != 0) {
					const ae = ld64(ld64(s398 + 0x38))
					copyr(s1f8, ae, 0x20)
					if ((memcmp(s288, s1f8, 0x20) as u32) != 0) {
						n = anchor_error_from(s310, 0x7df /* anchor::ConstraintTokenOwner */)
						s = ld64(s310)
						z = ld64(s398 + 0x50)
						st64(z + 0x10, ld64(s310 + 8))
						st64(z + 8, s)
						st32(z, 2)
						return n
					}
					const af = ld64(ld64(s398 + 0x18) /* key */)
					copyr(s1f8, af, 0x20)
					if ((memcmp(ld64(s398 + 0x30), s1f8, 0x20) as u32) == 0) {
						if (ld8(ld64(s398 + 0x18) + 0x29 /* is_writable */) != 0) {
							const ag = ld64(s398 + 0x50)
							st64(ag + 0x98, ld64(s70 + 8))
							st64(ag + 0x90, ld64(s70))
							memcpy(ag + 0xa8, sf8, 0x88)
							const ah = ld64(s398 + 0x50)
							copy(ah + 0x134, s120, 0x20)
							st32(ah + 0x154, ld32(s120 + 0x20))
							memcpy(ah + 0x18, s40, 0x40)
							const al = ld64(s60 + 0x18)
							const ak = ld64(s60 + 0x10)
							const aj = ld64(s60 + 8)
							const ai = ld64(s60)
							n = ld64(s398 + 0x50)
							copy(n + 8, s398, 0x10)
							st64(n + 0x58, ld64(s398 + 0x18))
							st64(n + 0x80, ld64(s398 + 0x28))
							st64(n + 0x88, ld64(s398 + 0x20))
							st64(n + 0xa0, input_token_account)
							st64(n + 0x158, ld64(s398 + 0x38))
							st64(n + 0x160, ld64(s3a0))
							st64(n + 0x168, ld64(s3a8))
							st64(n + 0x170, u)
							st32(n + 0x130, p)
							st32(n + 4, ld64(s398 + 0x10))
							st32(n, q)
							st64(n + 0x60, ai, aj, ak, al)
							return n
						}
						anchor_error_from(s330, 0x7d0 /* anchor::ConstraintMut */)
						n = fn_4130(s340, ld64(s330), ld64(s330 + 8), "input_token_mint", 0x10)
						s = ld64(s340)
						z = ld64(s398 + 0x50)
						st64(z + 0x10, ld64(s340 + 8))
						st64(z + 8, s)
						st32(z, 2)
						return n
					}
					n = anchor_error_from(s320, 0x7de /* anchor::ConstraintTokenMint */)
					s = ld64(s320)
					z = ld64(s398 + 0x50)
					st64(z + 0x10, ld64(s320 + 8))
					st64(z + 8, s)
					st32(z, 2)
					return n
				}
				anchor_error_from(s2f0, 0x7d0 /* anchor::ConstraintMut */, ab, ac, ad)
				n = fn_4130(s300, ld64(s2f0), ld64(s2f0 + 8), "input_token_account", 0x13)
				s = ld64(s300)
				z = ld64(s398 + 0x50)
				st64(z + 0x10, ld64(s300 + 8))
				st64(z + 8, s)
				st32(z, 2)
				return n
			}
			const x = ld64(0x300000000 /* heap bump-allocator cursor */)
			const y = x != 0 ? sat_sub(x, 0x12) : 0x300007fee
			if ((s & 1) != 0) {
				if (0x300000008 > y) {
					raw_vec_handle_error(1, 0x12, 0x10015f8f8, sat_sub(x, 0x12), 0x12 > x)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, y)
				st64(y + 8, 0x30325f6d6172676f)
				st64(y, 0x72705f6e656b6f74)
				st16(y + 0x10, 0x3232)
				void ld64(n)
			} else {
				if (0x300000008 > y) {
					raw_vec_handle_error(1, 0x12, 0x10015f8f8, sat_sub(x, 0x12), 0x12 > x)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, y)
				st64(y + 8, 0x30325f6d6172676f)
				st64(y, 0x72705f6e656b6f74)
				st16(y + 0x10, 0x3232)
				void ld64(n)
			}
			st64(n + 0x10, y, 0x12)
			st64(n + 8, 0x12)
			st64(n, 1)
			z = ld64(s398 + 0x50)
			st64(z + 0x10, n)
			st64(z + 8, s)
			st32(z, 2)
			return n
		}
		const v = ld64(0x300000000 /* heap bump-allocator cursor */)
		const w = v != 0 ? sat_sub(v, 0xd) : 0x300007ff3
		if ((s & 1) != 0) {
			if (0x300000008 > w) {
				raw_vec_handle_error(1, 0xd, 0x10015f8f8, sat_sub(v, 0xd), 0xd > v)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, w)
			st64(w + 5, 0x6d6172676f72705f)
			st64(w, 0x72705f6e656b6f74)
			void ld64(n)
		} else {
			if (0x300000008 > w) {
				raw_vec_handle_error(1, 0xd, 0x10015f8f8, sat_sub(v, 0xd), 0xd > v)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, w)
			st64(w + 5, 0x6d6172676f72705f)
			st64(w, 0x72705f6e656b6f74)
			void ld64(n)
		}
		st64(n + 0x10, w, 0xd)
		st64(n + 8, 0xd)
		st64(n, 1)
		z = ld64(s398 + 0x50)
		st64(z + 0x10, n)
		st64(z + 8, s)
		st32(z, 2)
		return n
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 5) : 0x300007ffb
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(g, 5), 5 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 4, 0x72)
		st32(h, 0x65796170)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(g, 5), 5 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 4, 0x72)
		st32(h, 0x65796170)
		void ld64(i)
	}
	st64(i + 0x10, h, 5)
	st64(i + 8, 5)
	st64(i, 1)
	st64(a + 0x10, i)
	st64(a + 8, f)
	st32(a, 2)
	return n
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value)
export function fn_419a0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s40 = fp - 0x40, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, s98 = fp - 0x98, s100 = fp - 0x100, s1a0 = fp - 0x1a0, s1c8 = fp - 0x1c8, s1ec = fp - 0x1ec, s260 = fp - 0x260, s280 = fp - 0x280, s288 = fp - 0x288, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s340 = fp - 0x340, s368 = fp - 0x368, s408 = fp - 0x408, s430 = fp - 0x430, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s510 = fp - 0x510, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s578 = fp - 0x578, s5c0 = fp - 0x5c0, s5e8 = fp - 0x5e8, s5f0 = fp - 0x5f0, s5f8 = fp - 0x5f8, s600 = fp - 0x600, s608 = fp - 0x608, s610 = fp - 0x610, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let w, x, y, z, aa, ae, cl, ct: u64
	st64(s5c0 + 0x30, d)
	st64(s578, c, a)
	const f = ld64(b + 8)
	memcpy(s2a0, f + 0xa8, 0xb0)
	const i = ld64(f + 0xa0)
	copyr(s40, f + 0x88, 0x18)
	st64(s5c0 + 0x40, f)
	st64(s48, ld64(f + 0x80))
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0xd8) & -8 : 0x300007f28
	if (0x300000008 > h) {
		alloc_handle_alloc_error(8, 0xd8)
	}
	st64(0x300000000 /* heap bump-allocator cursor */, h)
	st64(h + 0x18, ld64(s40 + 0x10))
	st64(h + 0x10, ld64(s40 + 8))
	st64(h + 8, ld64(s40))
	st64(h, ld64(s48))
	st64(h + 0x20, i)
	st64(s5c0 + 0x20, h)
	memcpy(h + 0x28, s2a0, 0xb0)
	const j = ld64(s5c0 + 0x40)
	memcpy(s2a0, j, 0x58)
	const m = ld64(j + 0x58)
	copyr(s48, j + 0x60, 0x20)
	const k = ld64(0x300000000 /* heap bump-allocator cursor */)
	const l = k != 0 ? sat_sub(k, 0x80) & -8 : 0x300007f80
	if (0x300000008 > l) {
		alloc_handle_alloc_error(8, 0x80)
	}
	B39: {
		st64(0x300000000 /* heap bump-allocator cursor */, l)
		aa = memcpy(l, s2a0, 0x58)
		x = undef
		st64(l + 0x58, m)
		copy(l + 0x60, s48, 0x18)
		const n = ld64(s40 + 0x10)
		st64(s5c0 + 0x18, l)
		st64(l + 0x78, n)
		const o = ld64(b + 0x18)
		st64(s578 + 0x18, o)
		if (o != 0) {
			st64(s5f0, s288)
			st64(s5c0 + 0x38, s1ec)
			st64(s5e8, s290, s290, s290, s288)
			let p = ld64(b + 0x10)
			let r = ld64(s578 + 0x18)
			L4: while (true) {
				let t = p + 0x150
				while (true) {
					const s = r
					st64(s578 + 0x20, t)
					const u = t
					const v = ld64(s578 + 0x18)
					let af = v
					if (r != v) {
						aa = fn_147a98(u - 0x150, w, x, y, z)
						x = undef
						af = r
						if (aa != 0x75) {
							t = ld64(s578 + 0x20) + 0x30
							const q = s * 0x30 - 0x30
							r = q / 0x30
							if (q == 0) {
								break B39
							}
							continue
						}
					}
					aa = fn_cf90(s2a0, u - 0x150)
					x = ld64(s290)
					ae = ld64(s2a0 + 8)
					const ab = ld64(s2a0)
					if (ab == 0) {
						cl = ld64(s578 + 8)
						st64(cl + 8, x)
						st64(cl, ae)
						return aa
					}
					st64(s578 + 0x10, x)
					memcpy(s490, ld64(s5e8 + 0x18), 0x60)
					const ac = ld64(0x300000000 /* heap bump-allocator cursor */)
					const ad = ac != 0 ? sat_sub(ac, 0x78) & -8 : 0x300007f88
					if (0x300000008 > ad) {
						alloc_handle_alloc_error(8, 0x78)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, ad)
					st64(ad + 0x10, ld64(s578 + 0x10))
					st64(ad + 8, ae)
					st64(ad, ab)
					st64(s5c0 + 0x10, ad)
					memcpy(ad + 0x18, s490, 0x60)
					if (af == 1) {
						aa = fn_88360(s530, 2)
						ae = ld64(s530)
						cl = ld64(s578 + 8)
						st64(cl + 8, ld64(s530 + 8))
						st64(cl, ae)
						return aa
					}
					aa = fn_5608(s2a0, ld64(s578 + 0x20) - 0x120)
					const ag = ld64(s2a0 + 8)
					ae = ld64(s2a0)
					st64(s5c0, ag)
					x = ag
					if (ae == 2) {
						if (af == 2) {
							aa = fn_88360(s520, 2)
							ae = ld64(s520)
							cl = ld64(s578 + 8)
							st64(cl + 8, ld64(s520 + 8))
							st64(cl, ae)
							return aa
						}
						aa = InterfaceAccount_try_from_unchecked(s2a0, ld64(s578 + 0x20) - 0xf0)
						x = ld64(s2a0 + 8)
						ae = ld64(s2a0)
						const ah = ld32(s260 + 0x70)
						if (ah != 2) {
							st64(s578 + 0x10, x)
							memcpy(s408, ld64(s5e8 + 0x10), 0xa0)
							const ai = ld64(s5c0 + 0x38)
							copy(s430, ai, 0x20)
							st32(s430 + 0x20, ld32(ai + 0x20))
							const aj = ld64(0x300000000 /* heap bump-allocator cursor */)
							const ak = aj != 0 ? sat_sub(aj, 0xd8) & -8 : 0x300007f28
							if (0x300000008 > ak) {
								alloc_handle_alloc_error(8, 0xd8)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, ak)
							st64(ak + 8, ld64(s578 + 0x10))
							st64(ak, ae)
							st64(s5c0 + 0x28, ak)
							memcpy(ak + 0x10, s408, 0xa0)
							const al = ld64(s5c0 + 0x28)
							st32(al + 0xb0, ah)
							copy(al + 0xb4, s430, 0x20)
							st32(al + 0xd4, ld32(s430 + 0x20))
							if (af == 3) {
								aa = fn_88360(s510, 2)
								ae = ld64(s510)
								cl = ld64(s578 + 8)
								st64(cl + 8, ld64(s510 + 8))
								st64(cl, ae)
								return aa
							}
							aa = InterfaceAccount_try_from_unchecked(s2a0, ld64(s578 + 0x20) - 0xc0)
							x = ld64(s2a0 + 8)
							ae = ld64(s2a0)
							const am = ld32(s260 + 0x70)
							if (am != 2) {
								st64(s578 + 0x10, x)
								memcpy(s340, ld64(s5e8 + 8), 0xa0)
								const an = ld64(s5c0 + 0x38)
								copy(s368, an, 0x20)
								st32(s368 + 0x20, ld32(an + 0x20))
								const ao = ld64(0x300000000 /* heap bump-allocator cursor */)
								const ap = ao != 0 ? sat_sub(ao, 0xd8) & -8 : 0x300007f28
								const aq = ld64(s578 + 0x10)
								if (0x300000008 > ap) {
									alloc_handle_alloc_error(8, 0xd8)
								}
								st64(0x300000000 /* heap bump-allocator cursor */, ap)
								st64(ap + 8, aq)
								st64(ap, ae)
								st64(s5c0 + 8, ap)
								memcpy(ap + 0x10, s340, 0xa0)
								const ar = ld64(s5c0 + 8)
								st32(ar + 0xb0, am)
								copy(ar + 0xb4, s368, 0x20)
								st32(ar + 0xd4, ld32(s368 + 0x20))
								if (af == 4) {
									aa = fn_88360(s500, 2)
									ae = ld64(s500)
									cl = ld64(s578 + 8)
									st64(cl + 8, ld64(s500 + 8))
									st64(cl, ae)
									return aa
								}
								aa = InterfaceAccount_try_from_unchecked(s2a0, ld64(s578 + 0x20) - 0x90)
								x = ld64(s2a0 + 8)
								ae = ld64(s2a0)
								const at = ld32(s260 + 0x70)
								if (at != 2) {
									st64(s578 + 0x10, x)
									memcpy(s1a0, ld64(s5e8), 0xa0)
									const au = ld64(s5c0 + 0x38)
									copy(s1c8, au, 0x20)
									st32(s1c8 + 0x20, ld32(au + 0x20))
									const av = ld64(0x300000000 /* heap bump-allocator cursor */)
									const aw = av != 0 ? sat_sub(av, 0xd8) & -8 : 0x300007f28
									const ax = ld64(s578 + 0x10)
									if (0x300000008 > aw) {
										alloc_handle_alloc_error(8, 0xd8)
									}
									st64(0x300000000 /* heap bump-allocator cursor */, aw)
									st64(aw + 8, ax)
									st64(aw, ae)
									st64(s578 + 0x10, aw)
									memcpy(aw + 0x10, s1a0, 0xa0)
									const ay = ld64(s578 + 0x10)
									st32(ay + 0xb0, at)
									copy(ay + 0xb4, s1c8, 0x20)
									st32(ay + 0xd4, ld32(s1c8 + 0x20))
									if (af == 5) {
										aa = fn_88360(s4f0, 2)
										ae = ld64(s4f0)
										cl = ld64(s578 + 8)
										st64(cl + 8, ld64(s4f0 + 8))
										st64(cl, ae)
										return aa
									}
									aa = InterfaceAccount_try_from(s2a0, ld64(s578 + 0x20) - 0x60)
									const az = ld32(s2a0)
									if (az == 2) {
										ae = ld64(s2a0 + 8)
										cl = ld64(s578 + 8)
										st64(cl + 8, ld64(s290))
										st64(cl, ae)
										return aa
									}
									st64(s600, ld64(s290))
									st64(s5f8, ld64(s2a0 + 8))
									const bc = ld32(s2a0 + 4)
									memcpy(s100, ld64(s5f0), 0x68)
									const ba = ld64(0x300000000 /* heap bump-allocator cursor */)
									const bb = ba != 0 ? sat_sub(ba, 0x80) & -8 : 0x300007f80
									if (0x300000008 > bb) {
										alloc_handle_alloc_error(8, 0x80)
									}
									st64(0x300000000 /* heap bump-allocator cursor */, bb)
									st64(bb + 0x10, ld64(s600))
									st64(bb + 8, ld64(s5f8))
									st32(bb + 4, bc)
									st32(bb, az)
									st64(s5e8 + 0x20, bb)
									memcpy(bb + 0x18, s100, 0x68)
									if (af == 6) {
										aa = fn_88360(s4e0, 2)
										ae = ld64(s4e0)
										cl = ld64(s578 + 8)
										st64(cl + 8, ld64(s4e0 + 8))
										st64(cl, ae)
										return aa
									}
									aa = fn_58f0(s2a0, ld64(s578 + 0x20) - 0x30)
									const bd = ld64(s2a0 + 8)
									ae = ld64(s2a0)
									x = bd
									if (ae == 2) {
										aa = fn_4dc0(s2a0, ld64(s5c0), aa)
										x = ld64(s290)
										ae = ld64(s2a0 + 8)
										if (ld64(s2a0) != 0) {
											cl = ld64(s578 + 8)
											st64(cl + 8, x)
											st64(cl, ae)
											return aa
										}
										const bi = x
										st64(s5f8, bd)
										const be = ld64(bd)
										copyr(s98, be, 0x20)
										const bf = ae
										if ((memcmp(ae + 0xc1, s98, 0x20) as u32) != 0) {
											ErrorCode_name(s78, 0x100159874)
											st64(s60, 0, 1, 0)
											st64(s28, s60, 0x10015f818)
											st8(s28 + 0x18, 3)
											st64(s28 + 0x10, 0x20)
											st64(s40 + 8, 0)
											st64(s48, 0)
											if (ErrorCode_fmt(0x100159874, s48) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copy(s280, s78, 0x30)
											st64(s2a0 + 8, 0x10015a026)
											st32(s260 + 0x58, 0x9c6 /* anchor::RequireKeysEqViolated */)
											st8(s260 + 0x10, 2)
											st32(s288, 0x4e)
											st64(s290, 0x34)
											st64(s2a0, 0)
											const co = fn_13e5a0(s4a0, s2a0)
											const cn = ld64(s4a0 + 8)
											const cm = ld64(s4a0)
											copyr(s2a0, bf + 0xc1, 0x20)
											copy(s280, s98, 0x20)
											aa = Error_with_pubkeys(s4b0, cm, cn, s2a0, co)
											ct = ld64(s4b0 + 8)
											ae = ld64(s4b0)
											st64(bi, ld64(bi) - 1)
											cl = ld64(s578 + 8)
											st64(cl + 8, ct)
											st64(cl, ae)
											return aa
										}
										const bg = ld64(ld64(ld64(s5c0 + 0x10)))
										copyr(s2a0, bg, 0x20)
										const bh = ae + 1
										if ((memcmp(bh, s2a0, 0x20) as u32) == 0) {
											st64(bi, ld64(bi) - 1)
											const bj = ld64(0x300000000 /* heap bump-allocator cursor */)
											const bk = bj != 0 ? sat_sub(bj, 0xd8) & -8 : 0x300007f28
											if (bk > 0x300000007) {
												st64(s600, ld64(ld64(s5c0 + 0x40) + 0x158))
												st64(0x300000000 /* heap bump-allocator cursor */, bk)
												const bl = ld64(s5c0 + 0x20)
												const bm = ld64(bl + 0x20)
												st64(bk + 0x18, ld64(bl + 0x18))
												st64(bk + 0x10, ld64(bl + 0x10))
												st64(bk + 8, ld64(bl + 8))
												st64(bk, ld64(bl))
												st64(bk + 0x20, bm)
												memcpy(bk + 0x28, bl + 0x28, 0xb0)
												const bn = ld64(0x300000000 /* heap bump-allocator cursor */)
												const bo = bn != 0 ? sat_sub(bn, 0xd8) & -8 : 0x300007f28
												const bp = ld64(s5c0 + 0x28)
												if (bo > 0x300000007) {
													st64(0x300000000 /* heap bump-allocator cursor */, bo)
													const bq = ld64(bp + 0x20)
													st64(bo + 0x18, ld64(bp + 0x18))
													st64(bo + 0x10, ld64(bp + 0x10))
													st64(bo + 8, ld64(bp + 8))
													st64(bo, ld64(bp))
													st64(bo + 0x20, bq)
													st64(s5c0 + 0x20, bo)
													memcpy(bo + 0x28, bp + 0x28, 0xb0)
													const br = ld64(0x300000000 /* heap bump-allocator cursor */)
													const bs = br != 0 ? sat_sub(br, 0xd8) & -8 : 0x300007f28
													const bt = ld64(s5c0 + 8)
													if (bs > 0x300000007) {
														st64(0x300000000 /* heap bump-allocator cursor */, bs)
														const bu = ld64(bt + 0x20)
														st64(bs + 0x18, ld64(bt + 0x18))
														st64(bs + 0x10, ld64(bt + 0x10))
														st64(bs + 8, ld64(bt + 8))
														st64(bs, ld64(bt))
														st64(bs + 0x20, bu)
														st64(s608, bs)
														memcpy(bs + 0x28, bt + 0x28, 0xb0)
														const bv = ld64(0x300000000 /* heap bump-allocator cursor */)
														st64(s5c0 + 8, bk)
														const bw = bv != 0 ? sat_sub(bv, 0xd8) & -8 : 0x300007f28
														const bx = ld64(s578 + 0x10)
														if (bw > 0x300000007) {
															st64(0x300000000 /* heap bump-allocator cursor */, bw)
															const by = ld64(bx + 0x20)
															st64(bw + 0x18, ld64(bx + 0x18))
															st64(bw + 0x10, ld64(bx + 0x10))
															st64(bw + 8, ld64(bx + 8))
															st64(bw, ld64(bx))
															st64(bw + 0x20, by)
															memcpy(bw + 0x28, bx + 0x28, 0xb0)
															const bz = ld64(0x300000000 /* heap bump-allocator cursor */)
															const ca = bz != 0 ? sat_sub(bz, 0x80) & -8 : 0x300007f80
															if (ca > 0x300000007) {
																st64(0x300000000 /* heap bump-allocator cursor */, ca)
																const cb = ld64(s5c0 + 0x18)
																st64(s578 + 0x10, ld64(cb + 0x58))
																memcpy(ca, cb, 0x58)
																st64(ca + 0x58, ld64(s578 + 0x10))
																st64(ca + 0x78, ld64(cb + 0x78))
																st64(ca + 0x70, ld64(cb + 0x70))
																st64(ca + 0x68, ld64(cb + 0x68))
																const cc = ld64(cb + 0x60)
																st64(s578 + 0x10, ca)
																st64(ca + 0x60, cc)
																const cd = ld64(0x300000000 /* heap bump-allocator cursor */)
																const ce = cd != 0 ? sat_sub(cd, 0x80) & -8 : 0x300007f80
																st64(s5c0 + 0x18, bw)
																if (ce > 0x300000007) {
																	const cf = s * 0x30 - 0x150
																	r = cf / 0x30
																	st64(0x300000000 /* heap bump-allocator cursor */, ce)
																	const cg = ld64(s5e8 + 0x20)
																	st64(s610, ld64(cg + 0x58))
																	memcpy(ce, cg, 0x58)
																	st64(ce + 0x58, ld64(s610))
																	copy(ce + 0x60, cg + 0x60, 0x20)
																	const ch = ld64(s5c0 + 0x40)
																	const ck = ld64(ch + 0x170)
																	const cj = ld64(ch + 0x168)
																	const ci = ld64(ch + 0x160)
																	st64(s2a0, ld64(s600))
																	st64(s2a0 + 8, ld64(s5c0 + 0x10))
																	copy(s290, s5c0, 0x10)
																	st64(s280, ld64(s5c0 + 0x20))
																	st64(s280 + 8, ld64(s608))
																	st64(s280 + 0x10, ld64(s5c0 + 0x18))
																	st64(s280 + 0x18, ld64(s5f8))
																	st64(s260, ci, cj, ck)
																	st64(s260 + 0x18, ld64(s578 + 0x10))
																	st64(s260 + 0x20, ce)
																	st64(s1000, ld64(s578))
																	st64(sff8, 0, 0, 1)
																	p = ld64(s578 + 0x20)
																	aa = fn_3e038(s48, s2a0, p, r, ld64(s1000), 0, 0, 1)
																	x = undef
																	st64(s578, ld64(s40))
																	ae = ld64(s48)
																	if (ae == 2) {
																		st64(s5c0 + 0x20, ld64(s5c0 + 0x28))
																		st64(s5c0 + 0x18, ld64(s5e8 + 0x20))
																		if (cf == 0) {
																			break B39
																		}
																		continue L4
																	}
																	cl = ld64(s578 + 8)
																	st64(cl + 8, ld64(s578))
																	st64(cl, ae)
																	return aa
																}
																alloc_handle_alloc_error(8, 0x80)
															}
															alloc_handle_alloc_error(8, 0x80)
														}
														alloc_handle_alloc_error(8, 0xd8)
													}
													alloc_handle_alloc_error(8, 0xd8)
												}
												alloc_handle_alloc_error(8, 0xd8)
											}
											alloc_handle_alloc_error(8, 0xd8)
										}
										ErrorCode_name(s78, 0x100159874)
										st64(s60, 0, 1, 0)
										st64(s28, s60, 0x10015f818)
										st8(s28 + 0x18, 3)
										st64(s28 + 0x10, 0x20)
										st64(s40 + 8, 0)
										st64(s48, 0)
										if (ErrorCode_fmt(0x100159874, s48) != 0) {
											fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
										}
										copy(s280, s78, 0x30)
										st64(s2a0 + 8, 0x10015a026)
										st32(s260 + 0x58, 0x9c6 /* anchor::RequireKeysEqViolated */)
										st8(s260 + 0x10, 2)
										st32(s288, 0x50)
										st64(s290, 0x34)
										st64(s2a0, 0)
										const cs = fn_13e5a0(s4c0, s2a0)
										const cr = ld64(s4c0 + 8)
										const cq = ld64(s4c0)
										copyr(s2a0, bh, 0x20)
										const cp = ld64(ld64(ld64(s5c0 + 0x10)))
										copyr(s280, cp, 0x20)
										aa = Error_with_pubkeys(s4d0, cq, cr, s2a0, cs)
										ct = ld64(s4d0 + 8)
										ae = ld64(s4d0)
										st64(bi, ld64(bi) - 1)
										cl = ld64(s578 + 8)
										st64(cl + 8, ct)
										st64(cl, ae)
										return aa
									}
									cl = ld64(s578 + 8)
									st64(cl + 8, x)
									st64(cl, ae)
									return aa
								}
								cl = ld64(s578 + 8)
								st64(cl + 8, x)
								st64(cl, ae)
								return aa
							}
							cl = ld64(s578 + 8)
							st64(cl + 8, x)
							st64(cl, ae)
							return aa
						}
						cl = ld64(s578 + 8)
						st64(cl + 8, x)
						st64(cl, ae)
						return aa
					}
					cl = ld64(s578 + 8)
					st64(cl + 8, x)
					st64(cl, ae)
					return aa
				}
			}
		}
	}
	if (ld64(s5c0 + 0x30) > ld64(s578)) {
		fn_85138(s78, 0x100159894)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s40 + 8, 0)
		st64(s48, 0)
		if (fn_88558(0x100159894, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(s280, s78, 0x30)
		st64(s2a0 + 8, 0x10015a026)
		st32(s260 + 0x58, 0x1782 /* error::TooLittleOutputReceived */)
		st8(s260 + 0x10, 2)
		st32(s288, 0x6e)
		st64(s290, 0x34)
		st64(s2a0, 0)
		fn_13e5a0(s540, s2a0)
		aa = fn_1730(s550, ld64(s540), ld64(s540 + 8), ld64(s578), ld64(s5c0 + 0x30))
		ae = ld64(s550)
		cl = ld64(s578 + 8)
		st64(cl + 8, ld64(s550 + 8))
		st64(cl, ae)
		return aa
	}
	cl = ld64(s578 + 8)
	st64(cl + 8, x)
	st64(cl, 2)
	return aa
}

export function fn_cf90(a: u64, b: u64): u64 {
	const s58 = fp - 0x58, s60 = fp - 0x60, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8
	let q, r: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0) {
		r = anchor_error_from(sc8, 0xbc4 /* anchor::AccountNotInitialized */)
		q = ld64(sc8)
		st64(a + 0x10, ld64(sc8 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s78, b, g as u32)
		const p = ld64(s78 + 0x10)
		const l = ld64(s78 + 8)
		const k = ld64(s78)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s88 + 8, ld64(l + 8))
			st64(s88, m)
			r = fn_10b4f0(s78, s88, 0x800000000000001a /* Ok */)
			const n = ld64(s78 + 0x10)
			const o = ld64(s78 + 8)
			if (ld64(s78) != 0) {
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, 0)
				st64(p, ld64(p) - 1)
				return r
			}
			r = memcpy(a + 0x18, s60, 0x60)
			st64(a + 0x10, n)
			st64(a + 8, o)
			st64(a, b)
			st64(p, ld64(p) - 1)
			return r
		}
		st64(s78, k, l, p)
		r = fn_13e628(sb8, s78)
		q = ld64(sb8)
		st64(a + 0x10, ld64(sb8 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const j = anchor_error_from(s98, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	const i = ld64(s98 + 8)
	const h = ld64(s98)
	copyr(s78, f, 0x20)
	st64(s58, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
	r = Error_with_pubkeys(sa8, h, i, s78, j)
	q = ld64(sa8)
	st64(a + 0x10, ld64(sa8 + 8))
	st64(a + 8, q)
	st64(a, 0)
	return r
}

export function fn_10b4f0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let g, j: u64
	if (8 > ld64(b + 8)) {
		j = anchor_error_from(s138, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		g = ld64(s138)
		st64(a + 0x10, ld64(s138 + 8))
		st64(a + 8, g)
		st64(a, 1)
		return j
	}
	if (ld64(ld64(b)) == 0x6f2bcbcb6821f4da /* account:AmmConfig */) {
		return fn_10b930(a, b, 0x6f2bcbcb6821f4da /* account:AmmConfig */, d, e)
	}
	ErrorCode_name(s78, 0x1001598e8, 0x6f2bcbcb6821f4da /* account:AmmConfig */, d, e)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (ErrorCode_fmt(0x1001598e8, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a620)
	st32(sf8 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0xb)
	st64(s118 + 0x10, 0x21)
	st64(s118, 0)
	j = fn_13e5a0(s128, s118)
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	g = ld64(s128)
	const h = f != 0 ? sat_sub(f, 9) : 0x300007ff7
	const i = ld64(s128 + 8)
	if ((g & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x69666e6f436d6d41)
		st8(h + 8, 0x67 /* anchor::InstructionDidNotSerialize */)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x69666e6f436d6d41)
		st8(h + 8, 0x67 /* anchor::InstructionDidNotSerialize */)
		void ld64(i)
	}
	st64(i + 0x10, h, 9)
	st64(i + 8, 9)
	st64(i, 1)
	st64(a + 0x10, i)
	st64(a + 8, g)
	st64(a, 1)
	return j
}

export function fn_58f0(a: u64, b: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	let k, p, q: u64
	const f = ld64(b + 0x18)
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) != 0) {
		const o = anchor_error_from(s50, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const n = ld64(s50 + 8)
		const m = ld64(s50)
		copyr(s40, f, 0x20)
		st64(s20, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
		q = Error_with_pubkeys(s60, m, n, s40, o)
		p = ld64(s60)
		st64(a + 8, ld64(s60 + 8))
		st64(a, p)
		return q
	}
	q = AccountInfo_try_borrow_data(s40, b, g as u32)
	const l = ld64(s40 + 0x10)
	const i = ld64(s40 + 8)
	const h = ld64(s40)
	if (h == 0x800000000000001a /* Ok */) {
		const j = ld64(i + 8)
		if (8 > j) {
			q = anchor_error_from(s80, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, j)
			k = ld64(s80)
			st64(a + 8, ld64(s80 + 8))
			st64(a, k)
			st64(l, ld64(l) - 1)
			return q
		}
		if (ld64(ld64(i)) != 0x84a5098135c5ae7a /* account:ObservationState */) {
			q = anchor_error_from(s80, 0xbba /* anchor::AccountDiscriminatorMismatch */, 0x84a5098135c5ae7a /* account:ObservationState */)
			k = ld64(s80)
			st64(a + 8, ld64(s80 + 8))
			st64(a, k)
			st64(l, ld64(l) - 1)
			return q
		}
		st64(a + 8, b)
		st64(a, 2)
		st64(l, ld64(l) - 1)
		return q
	}
	st64(s40, h, i, l)
	q = fn_13e628(s70, s40)
	p = ld64(s70)
	st64(a + 8, ld64(s70 + 8))
	st64(a, p)
	return q
}

export function fn_bc4f8(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38
	let g, i, l, m: u64
	const f = ld64(b + 0xa0)
	if ((memcmp(b + 0x80, c, 0x20) as u32) == 0 && (common_is_closed(f) == 0 && ld64(ld64(f + 0x10) + 0x10) != 0)) {
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		i = fn_13e628(s28, s18)
		g = ld64(s28)
		if (g != 2) {
			const n = ld64(0x300000000 /* heap bump-allocator cursor */)
			l = n != 0 ? sat_sub(n, 0x13) : 0x300007fed
			m = ld64(s28 + 8)
			if ((g & 1) != 0) {
				if (0x300000008 > l) {
					raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008, 0x13 > n)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, l)
				st64(l + 8, 0x6f6363615f6e656b)
				st64(l, 0x6f745f7475706e69)
				st32(l + 0xf, 0x746e756f)
				void ld64(m)
			} else {
				if (0x300000008 > l) {
					raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008, 0x13 > n)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, l)
				st64(l + 8, 0x6f6363615f6e656b)
				st64(l, 0x6f745f7475706e69)
				st32(l + 0xf, 0x746e756f)
				void ld64(m)
			}
			st64(m + 8, 0x13)
			st64(m, 1)
			st64(m + 0x18, 0x13)
			st64(m + 0x10, l)
			st64(a + 8, m)
			st64(a, g)
			return i
		}
	}
	const j = ld64(b + 0x58)
	const h = memcmp(b + 0x60, c, 0x20)
	m = undef
	i = h as u32
	if (i != 0) {
		st64(a + 8, m)
		st64(a, 2)
		return i
	}
	i = common_is_closed(j)
	m = undef
	if (i != 0) {
		st64(a + 8, m)
		st64(a, 2)
		return i
	}
	if (ld64(ld64(j + 0x10) + 0x10) == 0) {
		st64(a + 8, m)
		st64(a, 2)
		return i
	}
	st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
	i = fn_13e628(s38, s18)
	m = undef
	g = ld64(s38)
	if (g == 2) {
		st64(a + 8, m)
		st64(a, 2)
		return i
	}
	const k = ld64(0x300000000 /* heap bump-allocator cursor */)
	l = k != 0 ? sat_sub(k, 0x10) : 0x300007ff0
	m = ld64(s38 + 8)
	if ((g & 1) != 0) {
		if (0x300000008 > l) {
			raw_vec_handle_error(1, 0x10, 0x10015f8f8, 0x300000008, 0x10 > k)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, l)
		st64(l + 8, 0x746e696d5f6e656b)
		st64(l, 0x6f745f7475706e69)
		void ld64(m)
	} else {
		if (0x300000008 > l) {
			raw_vec_handle_error(1, 0x10, 0x10015f8f8, 0x300000008, 0x10 > k)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, l)
		st64(l + 8, 0x746e696d5f6e656b)
		st64(l, 0x6f745f7475706e69)
		void ld64(m)
	}
	st64(m + 8, 0x10)
	st64(m, 1)
	st64(m + 0x18, 0x10)
	st64(m + 0x10, l)
	st64(a + 8, m)
	st64(a, g)
	return i
}
