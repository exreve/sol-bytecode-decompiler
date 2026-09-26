/// <reference path="../lib.d.ts" />
// instruction transfer_reward_owner
import { anchor_error_from, fn_53e8, fn_88360, fn_cf1b8 } from '../shared.ts'

// instruction handler: transfer_reward_owner (discriminator sha256("global:transfer_reward_owner")[..8] = 0x79302bf2530c1607)
// accounts [idl]: 0 authority [signer, = GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ], 1 pool_state [mut]
// args [idl]: new_owner: pubkey
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args
export function ix_transfer_reward_owner(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s60 = fp - 0x60, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s80 = fp - 0x80
	let m, q: u64
	st64(s60, program_id)
	let f = a
	const i = sol_log("Instruction: TransferRewardOwner", 0x20)
	if (0x20 > ix_args_len) {
		const j = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		if (2 > (j & 3) - 2) {
			m = anchor_error_from(s58, 0x66 /* anchor::InstructionDidNotDeserialize */)
			q = ld64(s58)
			st64(f + 8, ld64(s58 + 8))
			st64(f, q)
			return m
		}
		if ((j & 3) == 0) {
			m = anchor_error_from(s58, 0x66 /* anchor::InstructionDidNotDeserialize */)
			q = ld64(s58)
			st64(f + 8, ld64(s58 + 8))
			st64(f, q)
			return m
		}
		const k = ld64(ld64(j + 7))
		if (k == 0) {
			m = anchor_error_from(s58, 0x66 /* anchor::InstructionDidNotDeserialize */)
			q = ld64(s58)
			st64(f + 8, ld64(s58 + 8))
			st64(f, q)
			return m
		}
		callx(k, ld64(j - 1), k)
		m = anchor_error_from(s58, 0x66 /* anchor::InstructionDidNotDeserialize */)
		q = ld64(s58)
		st64(f + 8, ld64(s58 + 8))
		st64(f, q)
		return m
	}
	st64(s68, f)
	const args: TransferRewardOwnerArgs = ix_args
	const h = ld64(args.new_owner + 6)
	st8(s18 + 8, ld8(args.new_owner + 0xe))
	st64(s78, ld16(args.new_owner + 3))
	st64(s80, ld8(args.new_owner + 5))
	st64(s18, h)
	st64(s70, ld64(s18 + 1))
	st64(s38, accounts, accounts_len)
	m = fn_cdf88(s18, undef, s38, undef, fp, i)
	let l = ld64(s18 + 0x10)
	if (ld64(s18) != 0) {
		q = ld64(s18 + 8)
		f = ld64(s68)
		st64(f + 8, l)
		st64(f, q)
		return m
	}
	st64(s28, ld64(s18 + 8))
	st64(s28 + 8, l)
	m = fn_53e8(s18, l, undef, undef, undef, m)
	l = ld64(s18 + 0x10)
	if (ld64(s18) != 0) {
		q = ld64(s18 + 8)
		f = ld64(s68)
		st64(f + 8, l)
		st64(f, q)
		return m
	}
	const p = (h << 0x18) | (ld64(s78) | (ld64(s80) << 0x10))
	const n = ld64(s18 + 8)
	st8(n + 0x200, ld8(args.new_owner + 2))
	st16(n + 0x1fe, ld16(args.new_owner))
	const o = ld64(s70)
	st64(n + 0x205, o)
	st32(n + 0x201, p)
	copy(n + 0x20d, args.new_owner + 0xf, 0x10)
	st8(n + 0x21d, ld8(args.new_owner + 0x1f))
	st16(n + 0x2a7, ld16(args.new_owner))
	st8(n + 0x2a9, ld8(args.new_owner + 2))
	st64(n + 0x2ae, o)
	st32(n + 0x2aa, p)
	copy(n + 0x2b6, args.new_owner + 0xf, 0x10)
	st8(n + 0x2c6, ld8(args.new_owner + 0x1f))
	st16(n + 0x350, ld16(args.new_owner))
	st8(n + 0x352, ld8(args.new_owner + 2))
	st32(n + 0x353, p)
	st64(n + 0x357, o)
	st8(n + 0x36f, ld8(args.new_owner + 0x1f))
	st64(n + 0x367, ld64(args.new_owner + 0x17))
	st64(n + 0x35f, ld64(args.new_owner + 0xf))
	st16(n + 0x21, ld16(args.new_owner))
	st8(n + 0x23, ld8(args.new_owner + 2))
	st64(n + 0x28, o)
	st32(n + 0x24, p)
	st8(n + 0x40, ld8(args.new_owner + 0x1f))
	st64(n + 0x38, ld64(args.new_owner + 0x17))
	st64(n + 0x30, ld64(args.new_owner + 0xf))
	st64(l, ld64(l) + 1)
	m = fn_cf1b8(s48, s28, ld64(s60))
	q = ld64(s48)
	f = ld64(s68)
	st64(f + 8, ld64(s48 + 8))
	st64(f, q)
	return m
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
export function fn_cdf88(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90
	let r, u, v: u64
	let j = try_accounts_17a30(s40, c, c, d, e, r0)
	let h = ld64(s40 + 8)
	const f = ld64(s40)
	if (f != 2) {
		const q = ld64(0x300000000 /* heap bump-allocator cursor */)
		r = 9 > q
		const n = r != 0 ? 0 : q - 9
		const s = q != 0 ? n : 0x300007ff7
		if ((f & 1) != 0) {
			if (0x300000008 > s) {
				raw_vec_handle_error(1, 9, 0x10015f8f8, n, r)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, s)
			st64(s, 0x7469726f68747561)
			st8(s + 8, 0x79)
			void ld64(h)
		} else {
			if (0x300000008 > s) {
				raw_vec_handle_error(1, 9, 0x10015f8f8, n, r)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, s)
			st64(s, 0x7469726f68747561)
			st8(s + 8, 0x79)
			void ld64(h)
		}
		st64(h + 0x10, s, 9)
		st64(h + 8, 9)
		st64(h, 1)
		st64(a + 8, f)
		st64(a, 1)
		st64(a + 0x10, h)
		return j
	}
	j = fn_11e0(s40, c)
	const x = ld64(s40 + 8)
	const g = ld64(s40)
	if (g == 2) {
		const i = ld64(h)
		copyr(s60, i, 0x20)
		j = memcmp(s60, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32
		if (j == 0) {
			if (ld8(x + 0x29) != 0) {
				st64(a + 8, h)
				st64(a, 0)
				st64(a + 0x10, x)
				return j
			}
			j = anchor_error_from(s90, 0x7d0 /* anchor::ConstraintMut */)
			u = undef
			const y = ld64(0x300000000 /* heap bump-allocator cursor */)
			v = 0xa > y
			const aa = y != 0 ? v != 0 ? 0 : y - 0xa : 0x300007ff6
			h = ld64(s90 + 8)
			const z = ld64(s90)
			if ((z & 1) != 0) {
				if (0x300000008 > aa) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, v, u)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, aa)
				st64(aa, 0x6174735f6c6f6f70)
				st16(aa + 8, 0x6574)
				void ld64(h)
			} else {
				if (0x300000008 > aa) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, v, u)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, aa)
				st64(aa, 0x6174735f6c6f6f70)
				st16(aa + 8, 0x6574)
				void ld64(h)
			}
			st64(h + 0x10, aa, 0xa)
			st64(h + 8, 0xa)
			st64(h, 1)
			st64(a + 8, z)
			st64(a, 1)
			st64(a + 0x10, h)
			return j
		}
		const p = fn_88360(s70, 0)
		r = undef
		const k = ld64(0x300000000 /* heap bump-allocator cursor */)
		const m = k != 0 ? sat_sub(k, 9) : 0x300007ff7
		const o = ld64(s70 + 8)
		const l = ld64(s70)
		if ((l & 1) != 0) {
			if (0x300000008 > m) {
				raw_vec_handle_error(1, 9, 0x10015f8f8, 0x300000008, r)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, m)
			st64(m, 0x7469726f68747561)
			st8(m + 8, 0x79)
			void ld64(o)
		} else {
			if (0x300000008 > m) {
				raw_vec_handle_error(1, 9, 0x10015f8f8, 0x300000008, r)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, m)
			st64(m, 0x7469726f68747561)
			st8(m + 8, 0x79)
			void ld64(o)
		}
		st64(o + 0x10, m, 9)
		st64(o + 8, 9)
		st64(o, 1)
		copyr(s40, s60, 0x20)
		st64(s20, 0xa6bd3bcb652bb6e5, 0x648eee6fe68868f5, 0xb1880f9c196055dc, 0xa18a9e05bd73e21f) // key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ
		j = Error_with_pubkeys(s80, l, o, s40, p)
		h = ld64(s80 + 8)
		st64(a + 8, ld64(s80))
		st64(a, 1)
		st64(a + 0x10, h)
		return j
	}
	const t = ld64(0x300000000 /* heap bump-allocator cursor */)
	u = 0xa > t
	v = u != 0 ? 0 : t - 0xa
	const w = t != 0 ? v : 0x300007ff6
	if ((g & 1) != 0) {
		if (0x300000008 > w) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, v, u)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, w)
		st64(w, 0x6174735f6c6f6f70)
		st16(w + 8, 0x6574)
		void ld64(x)
	} else {
		if (0x300000008 > w) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, v, u)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, w)
		st64(w, 0x6174735f6c6f6f70)
		st16(w + 8, 0x6574)
		void ld64(x)
	}
	st64(x + 0x10, w, 0xa)
	st64(x + 8, 0xa)
	st64(x, 1)
	st64(a + 8, g)
	st64(a, 1)
	st64(a + 0x10, x)
	return j
}
