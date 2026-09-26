/// <reference path="../lib.d.ts" />
// instruction close_bundled_position
import { fn_13aee8, fn_5ffd0, fn_7f28, fn_b9c0, memcpy } from '../shared.ts'

// instruction handler: close_bundled_position (discriminator sha256("global:close_bundled_position")[..8] = 0x4367551bf5d82429)
// accounts [str: the program's account-error strings, in order of first use]: bundled_position, position_bundle, position_bundle_token_account, receiver, position_bundle_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
export function ix_close_bundled_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const se0 = fp - 0xe0, se8 = fp - 0xe8, sf8 = fp - 0xf8, s1d8 = fp - 0x1d8, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s201 = fp - 0x201, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s1000 = fp - 0x1000
	let j, m: u64
	sol_log("Instruction: CloseBundledPosition", 0x21)
	const f = ix_args_len
	if (2 > f) {
		const k = fn_1459d0(0x100159468)
		if (2 > (k & 3) - 2) {
			m = anchor_error_from(s238, 0x66 /* anchor::InstructionDidNotDeserialize */)
			j = ld64(s238)
			st64(a + 8, ld64(s238 + 8))
			st64(a, j)
			return m
		}
		if ((k & 3) == 0) {
			m = anchor_error_from(s238, 0x66 /* anchor::InstructionDidNotDeserialize */)
			j = ld64(s238)
			st64(a + 8, ld64(s238 + 8))
			st64(a, j)
			return m
		}
		const l = ld64(ld64(k + 7))
		callx(l, ld64(k - 1), l)
		m = anchor_error_from(s238, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s238)
		st64(a + 8, ld64(s238 + 8))
		st64(a, j)
		return m
	}
	const g = ix_args
	const n = ld16(g)
	st8(s201, 0xff)
	st64(s200, accounts, accounts_len)
	st64(s1000, f, s201)
	m = accounts_close_bundled_position(sf8, program_id, s200, g, fp)
	const i = ld64(se8)
	j = ld64(sf8 + 8)
	const h = ld64(sf8)
	if (h == 0) {
		st64(a + 8, i)
		st64(a, j)
		return m
	}
	memcpy(s1d8, se0, 0xe0)
	st64(s1f0, h, j, i)
	st8(se0 + 8, ld8(s201))
	copyr(se8, s200, 0x10)
	st64(sf8, program_id, s1f0)
	m = fn_30e80(s218, sf8, n)
	j = ld64(s218)
	if (j == 2) {
		m = fn_8a170(s228, s1f0, program_id)
		j = ld64(s228)
		st64(a + 8, ld64(s228 + 8))
		st64(a, j)
		return m
	}
	st64(a + 8, ld64(s218 + 8))
	st64(a, j)
	return m
}

// Anchor Accounts::try_accounts of instruction close_bundled_position (called by ix_close_bundled_position; name [str]: from the handler's "Instruction: …" log; was fn_89260)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: bundled_position (ConstraintSeeds, ConstraintMut, ConstraintClose), position_bundle (ConstraintMut), position_bundle_token_account (ConstraintRaw), receiver (AccountNotEnoughKeys, ConstraintMut), position_bundle_authority
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_bundle_token_account_box, position_bundle_token_account_box_2, bundled_position, receiver
export function accounts_close_bundled_position(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s18 = fp - 0x18, s38 = fp - 0x38, s60 = fp - 0x60, s80 = fp - 0x80, s138 = fp - 0x138, s140 = fp - 0x140, s158 = fp - 0x158, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s230 = fp - 0x230, s232 = fp - 0x232, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c0 = fp - 0x3c0, s3c8 = fp - 0x3c8, s3d0 = fp - 0x3d0, s3d8 = fp - 0x3d8, s3e0 = fp - 0x3e0, s3e8 = fp - 0x3e8, s3f0 = fp - 0x3f0
	let u, v, w, ah: u64
	let g = a
	if (2 > ld64(e - 0x1000)) {
		const l = fn_1459d0(0x100159468)
		if (2 > (l & 3) - 2) {
			w = anchor_error_from(s3b8, 0x66 /* anchor::InstructionDidNotDeserialize */)
			v = ld64(s3b8)
			st64(g + 0x10, ld64(s3b8 + 8))
			st64(g + 8, v)
			st64(g, 0)
			return w
		}
		if ((l & 3) == 0) {
			w = anchor_error_from(s3b8, 0x66 /* anchor::InstructionDidNotDeserialize */)
			v = ld64(s3b8)
			st64(g + 0x10, ld64(s3b8 + 8))
			st64(g + 8, v)
			st64(g, 0)
			return w
		}
		const m = ld64(ld64(l + 7))
		callx(m, ld64(l - 1), m)
		w = anchor_error_from(s3b8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		v = ld64(s3b8)
		st64(g + 0x10, ld64(s3b8 + 8))
		st64(g + 8, v)
		st64(g, 0)
		return w
	}
	st64(s3d0, b)
	st64(s3c8, ld64(e - 0xff8))
	st16(s232, ld16(d))
	try_accounts_11b00(s158, c, c, d, e)
	const h = ld64(s158 + 0x10)
	const i = ld64(s158 + 8)
	const f = ld64(s158)
	if (f == 0) {
		w = Error_with_account_name(s3a8, i, h, "bundled_position", 0x10)
		v = ld64(s3a8)
		st64(g + 0x10, ld64(s3a8 + 8))
		st64(g + 8, v)
		st64(g, 0)
		return w
	}
	st64(s3c0, g)
	memcpy(s218, s140, 0xc0)
	st64(s228, i, h)
	st64(s3d8, f)
	st64(s230, f)
	try_accounts_11bb8(s158, c)
	if (ld64(s158) == 0) {
		w = Error_with_account_name(s398, ld64(s158 + 8), ld64(s158 + 0x10), "position_bundle", 0xf)
		const q = ld64(s398)
		const p = ld64(s3c0)
		st64(p + 0x10, ld64(s398 + 8))
		st64(p + 8, q)
		st64(p, 0)
		return w
	}
	const j = ld64(0x300000000 /* heap bump-allocator cursor */)
	g = ld64(s3c0)
	const k = j != 0 ? sat_sub(j, 0x48) & -8 : 0x300007fb8
	if (k > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, k)
		memcpy(k, s158, 0x48)
		try_accounts_11f50(s158, c)
		if (ld32(s138 + 0x70) == 2) {
			w = Error_with_account_name(s388, ld64(s158), ld64(s158 + 8), "position_bundle_token_account", 0x1d)
			v = ld64(s388)
			st64(g + 0x10, ld64(s388 + 8))
			st64(g + 8, v)
			st64(g, 0)
			return w
		}
		const n = ld64(0x300000000 /* heap bump-allocator cursor */)
		const position_bundle_token_account_box: TokenAccount = n != 0 ? sat_sub(n, 0xb8) & -8 : 0x300007f48
		if (position_bundle_token_account_box > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, position_bundle_token_account_box)
			memcpy(position_bundle_token_account_box, s158, 0xb8)
			try_accounts_11718(s158, c)
			const s = ld64(s158 + 8)
			const r = ld64(s158)
			if (r == 2) {
				st64(s3e8, s)
				const t = ld64(c + 8)
				if (t == 0) {
					anchor_error_from(s258, 0xbbd /* anchor::AccountNotEnoughKeys */, s)
					u = ld64(s258 + 8)
					const x = ld64(s258)
					if (x != 2) {
						w = Error_with_account_name(s268, x, u, "receiver", 8)
						v = ld64(s268)
						st64(g + 0x10, ld64(s268 + 8))
						st64(g + 8, v)
						st64(g, 0)
						return w
					}
				} else {
					st64(c + 8, t - 1)
					u = ld64(c)
					st64(c, u + 0x30)
				}
				st64(s3e0, u)
				st64(s3f0, position_bundle_token_account_box)
				copyr(s38, k + 8, 0x20)
				fn_b9c0(s18, s232)
				st64(s158 + 0x10, s38)
				st64(s158, 0x100153000)
				copyr(s138, s10, 0x10)
				st64(s140, 0x20)
				st64(s158 + 8, 0x10)
				// PDA find_program_address(["bundled_position", *s38, ?], program *(ld64(s3d0)))
				Pubkey_find_program_address(s60, s158, 3, ld64(s3d0))
				copyr(s80, s60, 0x20)
				st8(ld64(s3c8), ld8(s60 + 0x20))
				const bundled_position: AccountInfo = ld64(s3d8)
				const z = bundled_position.key
				copyr(s158, z, 0x20)
				if ((memcmp(s158, s80, 0x20) as u32) == 0) {
					if (bundled_position.is_writable == 0) {
						anchor_error_from(s368, 0x7d0 /* anchor::ConstraintMut */)
						w = Error_with_account_name(s378, ld64(s368), ld64(s368 + 8), "bundled_position", 0x10)
						ah = ld64(s378 + 8)
						st64(g + 8, ld64(s378))
						st64(g + 0x10, ah)
						st64(g, 0)
						return w
					}
					copyr(s60, z, 0x20)
					const ai = ld64(ld64(s3e0))
					copyr(s158, ai, 0x20)
					if ((memcmp(s60, s158, 0x20) as u32) == 0) {
						anchor_error_from(s348, 0x7db /* anchor::ConstraintClose */)
						w = Error_with_account_name(s358, ld64(s348), ld64(s348 + 8), "bundled_position", 0x10)
						ah = ld64(s358 + 8)
						st64(g + 8, ld64(s358))
						st64(g + 0x10, ah)
						st64(g, 0)
						return w
					}
					if (ld8(ld64(k) + 0x29) == 0) {
						anchor_error_from(s328, 0x7d0 /* anchor::ConstraintMut */)
						w = Error_with_account_name(s338, ld64(s328), ld64(s328 + 8), "position_bundle", 0xf)
						ah = ld64(s338 + 8)
						st64(g + 8, ld64(s338))
						st64(g + 0x10, ah)
						st64(g, 0)
						return w
					}
					const position_bundle_token_account_box_2: TokenAccount = ld64(s3f0)
					if ((memcmp(position_bundle_token_account_box_2.mint, s208, 0x20) as u32) == 0) {
						if ((memcmp(position_bundle_token_account_box_2.mint, k + 8, 0x20) as u32) == 0) {
							if (position_bundle_token_account_box_2.amount != 1) {
								anchor_error_from(s2e8, 0x7d3 /* anchor::ConstraintRaw */)
								w = Error_with_account_name(s2f8, ld64(s2e8), ld64(s2e8 + 8), "position_bundle_token_account", 0x1d)
								ah = ld64(s2f8 + 8)
								st64(g + 8, ld64(s2f8))
								st64(g + 0x10, ah)
								st64(g, 0)
								return w
							}
							const receiver: AccountInfo = ld64(s3e0)
							if (receiver.is_writable == 0) {
								anchor_error_from(s308, 0x7d0 /* anchor::ConstraintMut */)
								w = Error_with_account_name(s318, ld64(s308), ld64(s308 + 8), "receiver", 8)
								ah = ld64(s318 + 8)
								st64(g + 8, ld64(s318))
								st64(g + 0x10, ah)
								st64(g, 0)
								return w
							}
							w = memcpy(g, s230, 0xd8)
							st64(g + 0xf0, receiver)
							st64(g + 0xe8, ld64(s3e8))
							st64(g + 0xe0, position_bundle_token_account_box_2)
							st64(g + 0xd8, k)
							return w
						}
						anchor_error_from(s2c8, 0x7d3 /* anchor::ConstraintRaw */)
						w = Error_with_account_name(s2d8, ld64(s2c8), ld64(s2c8 + 8), "position_bundle_token_account", 0x1d)
						ah = ld64(s2d8 + 8)
						st64(g + 8, ld64(s2d8))
						st64(g + 0x10, ah)
						st64(g, 0)
						return w
					}
					anchor_error_from(s2a8, 0x7d3 /* anchor::ConstraintRaw */)
					w = Error_with_account_name(s2b8, ld64(s2a8), ld64(s2a8 + 8), "position_bundle_token_account", 0x1d)
					ah = ld64(s2b8 + 8)
					st64(g + 8, ld64(s2b8))
					st64(g + 0x10, ah)
					st64(g, 0)
					return w
				}
				anchor_error_from(s278, 0x7d6 /* anchor::ConstraintSeeds */)
				Error_with_account_name(s288, ld64(s278), ld64(s278 + 8), "bundled_position", 0x10)
				const ag = ld64(s288 + 8)
				const af = ld64(s288)
				const aa = ld64(ld64(s230))
				const ae = ld64(aa + 0x18)
				const ad = ld64(aa + 0x10)
				const ac = ld64(aa + 8)
				const ab = ld64(aa)
				copy(s138, s80, 0x20)
				st64(s158, ab, ac, ad, ae)
				w = fn_13b5c0(s298, af, ag, s158, ac)
				ah = ld64(s298 + 8)
				st64(g + 8, ld64(s298))
				st64(g + 0x10, ah)
				st64(g, 0)
				return w
			}
			w = Error_with_account_name(s248, r, s, "position_bundle_authority", 0x19)
			v = ld64(s248)
			st64(g + 0x10, ld64(s248 + 8))
			st64(g + 8, v)
			st64(g, 0)
			return w
		}
		alloc_handle_alloc_error(8, 0xb8)
	}
	alloc_handle_alloc_error(8, 0x48)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
// types [heur]: b: CloseBundledPositionContext (the handler ix_close_bundled_position passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_30e80(a: u64, b: CloseBundledPositionContext, c: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30
	const accounts: CloseBundledPositionAccounts = b.accounts
	let l = fn_5ffd0(s10, accounts.position_bundle_token_account.mint, accounts + 0xe8)
	let g = ld64(s10)
	if (g != 2) {
		st64(a + 8, ld64(s10 + 8))
		st64(a, g)
		return l
	}
	if ((ld64(accounts + 0x98) | ld64(accounts + 0xb0)) != 0) {
		l = fn_87630(s30, 5)
		g = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, g)
		return l
	}
	if (ld64(accounts + 0x78) != 0) {
		l = fn_87630(s30, 5)
		g = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, g)
		return l
	}
	if ((ld64(accounts + 0x48) | ld64(accounts + 0x50)) != 0) {
		l = fn_87630(s30, 5)
		g = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, g)
		return l
	}
	if ((ld64(accounts + 0xc8) | ld64(accounts + 0x80)) != 0) {
		l = fn_87630(s30, 5)
		g = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, g)
		return l
	}
	let k = 0x2b
	if (0xff >= (c as u16)) {
		const j = 1 << (c & 7)
		const h = ld64(accounts + 0xd8) + ((c & 0xfff8) >> 3)
		k = 0x2d
		const i = ld8(h + 0x28)
		if ((i & j) != 0) {
			st8(h + 0x28, i ^ j)
			st64(a + 8, 0x2d)
			st64(a, 2)
			return l
		}
	}
	l = fn_87630(s20, k)
	k = undef
	const m = ld64(s20)
	if (m == 2) {
		st64(a + 8, k)
		st64(a, 2)
		return l
	}
	st64(a + 8, ld64(s20 + 8))
	st64(a, m)
	return l
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: bundled_position, position_bundle
export function fn_8a170(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0
	let x, y: u64
	const f: AccountInfo = ld64(b + 0xf0)
	const g: LamportsCell = f.lamports
	const m = f.key
	rc_inc(g)
	const h: DataCell = f.data
	rc_inc(h)
	const l = f.owner
	const k = f.rent_epoch
	const j = f.is_signer
	const i = f.is_writable
	st8(s38 + 2, f.executable)
	st8(s38, j, i)
	st64(s60, m, g, h, l, k)
	const n: AccountInfo = ld64(b)
	const o: LamportsCell = n.lamports
	const u = n.key
	rc_inc(o)
	const p: DataCell = n.data
	rc_inc(p)
	const t = n.owner
	const s = n.rent_epoch
	const r = n.is_signer
	const q = n.is_writable
	st8(s8 + 2, n.executable)
	st8(s8, r, q)
	st64(s30, u, o, p, t, s)
	fn_13aee8(s70, s30, s60, p, t)
	const v = ld64(s70)
	if (v != 2) {
		y = Error_with_account_name(s80, v, ld64(s70 + 8), "bundled_position", 0x10)
		x = ld64(s80)
		st64(a + 8, ld64(s80 + 8))
		st64(a, x)
		return y
	}
	y = fn_7f28(s90, ld64(b + 0xd8), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const w = ld64(s90)
	if (w == 2) {
		st64(a + 8, undef)
		st64(a, 2)
		return y
	}
	y = Error_with_account_name(sa0, w, ld64(s90 + 8), "position_bundle", 0xf)
	x = ld64(sa0)
	st64(a + 8, ld64(sa0 + 8))
	st64(a, x)
	return y
}
