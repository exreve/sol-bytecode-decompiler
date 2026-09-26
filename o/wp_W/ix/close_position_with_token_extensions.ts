/// <reference path="../lib.d.ts" />
// instruction close_position_with_token_extensions
import { fn_12be8, fn_12e9c0, fn_130750, fn_1390b0, fn_13aee8, fn_60480, memcpy } from '../shared.ts'

// instruction handler: close_position_with_token_extensions (discriminator sha256("global:close_position_with_token_extensions")[..8] = 0xdf63199b3b87b601)
// accounts [str: the program's account-error strings, in order of first use]: position_authority, receiver, position, position_mint, position_token_account, token_2022_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
export function ix_close_position_with_token_extensions(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s230 = fp - 0x230, s238 = fp - 0x238, s248 = fp - 0x248, s478 = fp - 0x478, s488 = fp - 0x488, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4a1 = fp - 0x4a1, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, sff8 = fp - 0xff8
	let i: u64
	sol_log("Instruction: ClosePositionWithTokenExtensions", 0x2d)
	st8(s4a1, 0xff)
	st64(s4a0, accounts, accounts_len)
	st64(sff8, s4a1)
	let j = accounts_close_position_with_token_extensions(s248, program_id, s4a0, undef, fp)
	const f = ld32(s248)
	if (f == 2) {
		i = ld64(s248 + 8)
		st64(a + 8, ld64(s238))
		st64(a, i)
		return j
	}
	const k = ld32(s248 + 4)
	const h = ld64(s248 + 8)
	const g = ld64(s238)
	memcpy(s478, s230, 0x230)
	st64(s488, h, g)
	st32(s490, f, k)
	st8(s230 + 8, ld8(s4a1))
	copyr(s238, s4a0, 0x10)
	st64(s248, program_id, s490)
	j = fn_310a0(s4b8, s248)
	i = ld64(s4b8)
	if (i == 2) {
		j = fn_8d1d0(s4c8, s490, program_id)
		i = ld64(s4c8)
		st64(a + 8, ld64(s4c8 + 8))
		st64(a, i)
		return j
	}
	st64(a + 8, ld64(s4b8 + 8))
	st64(a, i)
	return j
}

// Anchor Accounts::try_accounts of instruction close_position_with_token_extensions (called by ix_close_position_with_token_extensions; name [str]: from the handler's "Instruction: …" log; was fn_8bd50)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_authority, receiver (AccountNotEnoughKeys, ConstraintMut), position (ConstraintSeeds, ConstraintMut, ConstraintClose), position_mint (ConstraintMut, ConstraintOwner, ConstraintAddress), position_token_account (ConstraintMut, ConstraintRaw), token_2022_program (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position, receiver, position_mint
export function accounts_close_position_with_token_extensions(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s84 = fp - 0x84, sd8 = fp - 0xd8, s118 = fp - 0x118, s120 = fp - 0x120, s128 = fp - 0x128, s130 = fp - 0x130, s138 = fp - 0x138, s15c = fp - 0x15c, s1e8 = fp - 0x1e8, s200 = fp - 0x200, s210 = fp - 0x210, s250 = fp - 0x250, s270 = fp - 0x270, s320 = fp - 0x320, s330 = fp - 0x330, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s580 = fp - 0x580, s5a8 = fp - 0x5a8, s5b0 = fp - 0x5b0
	let h, j, k, l, ao, ap, aq: u64
	st64(s580 + 0x20, b)
	try_accounts_11718(s138, c, c, d, e)
	const i = ld64(s130)
	const f = ld64(s138)
	if (f != 2) {
		aq = Error_with_account_name(s358, f, i, "position_authority", 0x12)
		j = ld64(s358)
		st64(a + 0x10, ld64(s358 + 8))
		st64(a + 8, j)
		st32(a, 2)
		return aq
	}
	const n = ld64(e - 0xff8)
	const g = ld64(c + 8)
	if (g == 0) {
		anchor_error_from(s368, 0xbbd /* anchor::AccountNotEnoughKeys */, undef, k, l)
		h = ld64(s368 + 8)
		const m = ld64(s368)
		if (m != 2) {
			aq = Error_with_account_name(s378, m, h, "receiver", 8)
			j = ld64(s378)
			st64(a + 0x10, ld64(s378 + 8))
			st64(a + 8, j)
			st32(a, 2)
			return aq
		}
	} else {
		st64(c + 8, g - 1)
		h = ld64(c)
		st64(c, h + 0x30)
	}
	st64(s580, i, n, h, a)
	try_accounts_11b00(s138, c, h, k, l)
	const p = ld64(s128)
	const q = ld64(s130)
	const position: AccountInfo = ld64(s138)
	if (position == 0) {
		aq = Error_with_account_name(s558, q, p, "position", 8)
		ap = ld64(s558)
		ao = ld64(s580 + 0x18)
		st64(ao + 0x10, ld64(s558 + 8))
		st64(ao + 8, ap)
		st32(ao, 2)
		return aq
	}
	memcpy(s330, s120, 0xc0)
	st64(s348, position, q, p)
	try_accounts_610(s138, c)
	const r = ld32(s138)
	if (r == 2) {
		aq = Error_with_account_name(s548, ld64(s130), ld64(s128), "position_mint", 0xd)
		ap = ld64(s548)
		ao = ld64(s580 + 0x18)
		st64(ao + 0x10, ld64(s548 + 8))
		st64(ao + 8, ap)
		st32(ao, 2)
		return aq
	}
	st64(s5a8 + 0x18, r)
	copyr(s5a8, s130, 0x10)
	st64(s5a8 + 0x10, ld32(s138 + 4))
	memcpy(s250, s120, 0x40)
	copy(s270, sd8, 0x20)
	st64(s5a8 + 0x20, ld64(s118 + 0x38))
	try_accounts_558(s138, c)
	const u = ld64(s130)
	const t = ld64(s138)
	const s = ld32(sd8 + 0x50)
	if (s == 2) {
		aq = Error_with_account_name(s538, t, u, "position_token_account", 0x16)
		ap = ld64(s538)
		ao = ld64(s580 + 0x18)
		st64(ao + 0x10, ld64(s538 + 8))
		st64(ao + 8, ap)
		st32(ao, 2)
		return aq
	}
	st64(s5b0, u)
	memcpy(s200, s128, 0xa0)
	copy(s15c, s84, 0x20)
	st32(s15c + 0x20, ld32(s84 + 0x20))
	st32(s1e8 + 0x88, s)
	st64(s210 + 8, ld64(s5b0))
	st64(s210, t)
	fn_12be8(s138, c)
	const x = ld64(s130)
	const v = ld64(s138)
	if (v == 2) {
		const receiver: AccountInfo = ld64(s580 + 0x10)
		if (receiver.is_writable == 0) {
			anchor_error_from(s518, 0x7d0 /* anchor::ConstraintMut */, x)
			aq = Error_with_account_name(s528, ld64(s518), ld64(s518 + 8), "receiver", 8)
			ap = ld64(s528)
			ao = ld64(s580 + 0x18)
			st64(ao + 0x10, ld64(s528 + 8))
			st64(ao + 8, ap)
			st32(ao, 2)
			return aq
		}
		st64(s5b0, x)
		const y = ld64(ld64(s5a8 + 0x20))
		copyr(s20, y, 0x20)
		st64(s40, 0x100151f20, 8, s20, 0x20)
		// PDA find_program_address(["position", *y], program *(ld64(s580 + 0x20)))
		Pubkey_find_program_address(s138, s40, 2, ld64(s580 + 0x20))
		copyr(s60, s138, 0x20)
		st8(ld64(s580 + 8), ld8(s118))
		const z = position.key
		copyr(s138, z, 0x20)
		if ((memcmp(s138, s60, 0x20) as u32) != 0) {
			anchor_error_from(s398, 0x7d6 /* anchor::ConstraintSeeds */)
			Error_with_account_name(s3a8, ld64(s398), ld64(s398 + 8), "position", 8)
			const an = ld64(s3a8 + 8)
			const am = ld64(s3a8)
			const ah = ld64(ld64(s348))
			const al = ld64(ah + 0x18)
			const ak = ld64(ah + 0x10)
			const aj = ld64(ah + 8)
			const ai = ld64(ah)
			copy(s118, s60, 0x20)
			st64(s138, ai, aj, ak, al)
			aq = fn_13b5c0(s3b8, am, an, s138, aj)
			ap = ld64(s3b8)
			ao = ld64(s580 + 0x18)
			st64(ao + 0x10, ld64(s3b8 + 8))
			st64(ao + 8, ap)
			st32(ao, 2)
			return aq
		}
		if (position.is_writable == 0) {
			anchor_error_from(s4f8, 0x7d0 /* anchor::ConstraintMut */)
			aq = Error_with_account_name(s508, ld64(s4f8), ld64(s4f8 + 8), "position", 8)
			ap = ld64(s508)
			ao = ld64(s580 + 0x18)
			st64(ao + 0x10, ld64(s508 + 8))
			st64(ao + 8, ap)
			st32(ao, 2)
			return aq
		}
		copyr(s20, z, 0x20)
		const aa = receiver.key
		copyr(s138, aa, 0x20)
		if ((memcmp(s20, s138, 0x20) as u32) == 0) {
			anchor_error_from(s4d8, 0x7db /* anchor::ConstraintClose */)
			aq = Error_with_account_name(s4e8, ld64(s4d8), ld64(s4d8 + 8), "position", 8)
			ap = ld64(s4e8)
			ao = ld64(s580 + 0x18)
			st64(ao + 0x10, ld64(s4e8 + 8))
			st64(ao + 8, ap)
			st32(ao, 2)
			return aq
		}
		const position_mint: AccountInfo = ld64(s5a8 + 0x20)
		if (position_mint.is_writable == 0) {
			anchor_error_from(s4b8, 0x7d0 /* anchor::ConstraintMut */)
			aq = Error_with_account_name(s4c8, ld64(s4b8), ld64(s4b8 + 8), "position_mint", 0xd)
			ap = ld64(s4c8)
			ao = ld64(s580 + 0x18)
			st64(ao + 0x10, ld64(s4c8 + 8))
			st64(ao + 8, ap)
			st32(ao, 2)
			return aq
		}
		const ad = position_mint.owner
		const ac = ld64(ld64(s5b0))
		copyr(s20, ac, 0x20)
		if ((memcmp(ad, s20, 0x20) as u32) != 0) {
			anchor_error_from(s3c8, 0x7d4 /* anchor::ConstraintOwner */)
			const au = Error_with_account_name(s3d8, ld64(s3c8), ld64(s3c8 + 8), "position_mint", 0xd)
			const at = ld64(s3d8 + 8)
			const ar = ld64(s3d8)
			copyr(s138, ad, 0x20)
			copy(s118, s20, 0x20)
			aq = fn_13b5c0(s3e8, ar, at, s138, au)
			ap = ld64(s3e8)
			ao = ld64(s580 + 0x18)
			st64(ao + 0x10, ld64(s3e8 + 8))
			st64(ao + 8, ap)
			st32(ao, 2)
			return aq
		}
		copyr(s40, y, 0x20)
		copyr(s20, s320, 0x20)
		if ((memcmp(s40, s20, 0x20) as u32) == 0) {
			if (ld8(ld64(s200 + 0x10) + 0x29) == 0) {
				anchor_error_from(s498, 0x7d0 /* anchor::ConstraintMut */)
				aq = Error_with_account_name(s4a8, ld64(s498), ld64(s498 + 8), "position_token_account", 0x16)
				ap = ld64(s4a8)
				ao = ld64(s580 + 0x18)
				st64(ao + 0x10, ld64(s4a8 + 8))
				st64(ao + 8, ap)
				st32(ao, 2)
				return aq
			}
			if (ld64(s1e8 + 0x40) != 1) {
				anchor_error_from(s428, 0x7d3 /* anchor::ConstraintRaw */)
				aq = Error_with_account_name(s438, ld64(s428), ld64(s428 + 8), "position_token_account", 0x16)
				ap = ld64(s438)
				ao = ld64(s580 + 0x18)
				st64(ao + 0x10, ld64(s438 + 8))
				st64(ao + 8, ap)
				st32(ao, 2)
				return aq
			}
			if ((memcmp(s1e8, s320, 0x20) as u32) == 0) {
				copyr(s20, ac, 0x20)
				if ((memcmp(s20, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0) {
					anchor_error_from(s468, 0x7dc /* anchor::ConstraintAddress */)
					const bc = Error_with_account_name(s478, ld64(s468), ld64(s468 + 8), "token_2022_program", 0x12)
					const bb = ld64(s478 + 8)
					const ba = ld64(s478)
					copyr(s138, s20, 0x20)
					st64(s118, 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */, 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */, 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */, 0xfc8ba1d828f9bdfe /* TOKEN_2022_PROGRAM[3] */) // key TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
					aq = fn_13b5c0(s488, ba, bb, s138, bc)
					ap = ld64(s488)
					ao = ld64(s580 + 0x18)
					st64(ao + 0x10, ld64(s488 + 8))
					st64(ao + 8, ap)
					st32(ao, 2)
					return aq
				}
				const av = ld64(s580 + 0x18)
				memcpy(av + 0x168, s348, 0xd8)
				memcpy(av + 0x80, s210, 0xd8)
				aq = memcpy(av + 0x18, s250, 0x40)
				const az = ld64(s270 + 0x18)
				const ay = ld64(s270 + 0x10)
				const ax = ld64(s270 + 8)
				const aw = ld64(s270)
				copy(av + 8, s5a8, 0x10)
				st64(av + 0x58, ld64(s5a8 + 0x20))
				st64(av + 0x158, ld64(s580))
				st64(av + 0x160, ld64(s580 + 0x10))
				st64(av + 0x240, ld64(s5b0))
				st32(av + 4, ld64(s5a8 + 0x10))
				st32(av, ld64(s5a8 + 0x18))
				st64(av + 0x60, aw, ax, ay, az)
				return aq
			}
			anchor_error_from(s448, 0x7d3 /* anchor::ConstraintRaw */)
			aq = Error_with_account_name(s458, ld64(s448), ld64(s448 + 8), "position_token_account", 0x16)
			ap = ld64(s458)
			ao = ld64(s580 + 0x18)
			st64(ao + 0x10, ld64(s458 + 8))
			st64(ao + 8, ap)
			st32(ao, 2)
			return aq
		}
		anchor_error_from(s3f8, 0x7dc /* anchor::ConstraintAddress */)
		const ag = Error_with_account_name(s408, ld64(s3f8), ld64(s3f8 + 8), "position_mint", 0xd)
		const af = ld64(s408 + 8)
		const ae = ld64(s408)
		copy(s138, s40, 0x40)
		aq = fn_13b5c0(s418, ae, af, s138, ag)
		ap = ld64(s418)
		ao = ld64(s580 + 0x18)
		st64(ao + 0x10, ld64(s418 + 8))
		st64(ao + 8, ap)
		st32(ao, 2)
		return aq
	}
	aq = Error_with_account_name(s388, v, x, "token_2022_program", 0x12)
	ap = ld64(s388)
	ao = ld64(s580 + 0x18)
	st64(ao + 0x10, ld64(s388 + 8))
	st64(ao + 8, ap)
	st32(ao, 2)
	return aq
}

// types [heur]: b: ClosePositionWithTokenExtensionsContext (the handler ix_close_position_with_token_extensions passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_310a0(a: u64, b: ClosePositionWithTokenExtensionsContext): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98
	const accounts: ClosePositionWithTokenExtensionsAccounts = b.accounts
	let j = fn_60480(s68, accounts.position_token_account, accounts + 0x158)
	let g = ld64(s68)
	if (g != 2) {
		st64(a + 8, ld64(s68 + 8))
		st64(a, g)
		return j
	}
	if (ld8(accounts.position_token_account + 0x94) == 2) {
		j = fn_87630(s98, 0x3b)
		g = ld64(s98)
		st64(a + 8, ld64(s98 + 8))
		st64(a, g)
		return j
	}
	if ((ld64(accounts + 0x200) | ld64(accounts + 0x218)) != 0) {
		j = fn_87630(s88, 5)
		g = ld64(s88)
		st64(a + 8, ld64(s88 + 8))
		st64(a, g)
		return j
	}
	if (ld64(accounts + 0x1e0) != 0) {
		j = fn_87630(s88, 5)
		g = ld64(s88)
		st64(a + 8, ld64(s88 + 8))
		st64(a, g)
		return j
	}
	if ((ld64(accounts + 0x1b0) | ld64(accounts + 0x1b8)) != 0) {
		j = fn_87630(s88, 5)
		g = ld64(s88)
		st64(a + 8, ld64(s88 + 8))
		st64(a, g)
		return j
	}
	if ((ld64(accounts + 0x230) | ld64(accounts + 0x1e8)) != 0) {
		j = fn_87630(s88, 5)
		g = ld64(s88)
		st64(a + 8, ld64(s88 + 8))
		st64(a, g)
		return j
	}
	const h = accounts.position_mint.info.key
	copyr(s28, h, 0x20)
	const i = ld8(b + 0x20)
	st64(s58 + 0x20, s1)
	st64(s58 + 0x10, s28)
	st64(s58, 0x100151f20)
	st8(s1, i)
	st64(s58 + 0x28, 1)
	st64(s58 + 0x18, 0x20)
	st64(s58 + 8, 8)
	j = fn_737c0(s78, accounts + 0x158, accounts + 0x160, accounts, accounts.position_token_account, accounts + 0x240, accounts + 0x168, s58, 3)
	g = ld64(s78)
	if (g != 2) {
		st64(a + 8, ld64(s78 + 8))
		st64(a, g)
		return j
	}
	st64(a + 8, undef)
	st64(a, 2)
	return j
}

// types [heur]: d: ClosePositionWithTokenExtensionsAccounts (every call passes one: fn_310a0); p5: TokenAccount_2 (every call passes one: fn_310a0)
export function fn_737c0(a: u64, b: u64, c: u64, d: ClosePositionWithTokenExtensionsAccounts, p5: TokenAccount_2, p6: u64, p7: u64, p8: u64, p9: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s30 = fp - 0x30, s58 = fp - 0x58, s60 = fp - 0x60, s88 = fp - 0x88, s90 = fp - 0x90, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sc8 = fp - 0xc8, se0 = fp - 0xe0, se8 = fp - 0xe8, s108 = fp - 0x108, s120 = fp - 0x120, s150 = fp - 0x150, s168 = fp - 0x168, s170 = fp - 0x170, s188 = fp - 0x188, s1a0 = fp - 0x1a0, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s1000 = fp - 0x1000
	let bb, dd, dp, dq: u64
	let el = c
	const f: AccountInfo = p5.info
	const g: LamportsCell = f.lamports
	let ev = g
	const h = ld64(p6)
	const q = f.key
	let es = ld64(h)
	rc_inc(g)
	let ep = f
	const i: DataCell = f.data
	let eu = i
	const n = p9
	const j = p8
	let ej = p7
	rc_inc(i)
	let eo = h
	const info: AccountInfo = d.position_mint.info
	const l: LamportsCell = info.lamports
	let et = l
	const r = info.key
	rc_inc(l)
	let er: AccountInfo = info
	const m: DataCell = info.data
	let v = a
	let eq = m
	rc_inc(m)
	const o: AccountInfo = ld64(b)
	const p = o.key
	st64(s1000 + 0x20, d.position_mint.decimals)
	st64(s1000, p, 8, 0, 1)
	fn_132170(se8, es, q, r, p, 8, 0, 1, ld64(s1000 + 0x20))
	copy(s1b8, se0, 0x18)
	const s = ld64(se8)
	if (s == 0x8000000000000000) {
		dq = fn_13b430(s218, s1b8)
		dd = ld64(s218 + 8)
		dp = ld64(s218)
	} else {
		let ek = p
		memcpy(s150, sc8, 0x30)
		st64(s170, s)
		copy(s168, s1b8, 0x18)
		const t: AccountInfo = eo
		const u = ld64(eo + 8)
		const ab = ld64(eo)
		let em = u
		const ac: AccountInfo = er
		const x: AccountInfo = ep
		rc_inc(u)
		const aa = v
		const w: DataCell = t.data
		let en = w
		rc_inc(w)
		const y: LamportsCell = x.lamports
		let ed = x.key
		let ee = t.executable
		let ef = t.is_writable
		let eg = t.is_signer
		let eh = t.rent_epoch
		const af = t.owner
		let ei = y
		rc_inc(y)
		const z: DataCell = x.data
		let ec = ab
		rc_inc(z)
		const ad: LamportsCell = ac.lamports
		let dw = ac.key
		let dx = x.executable
		let dy = x.is_writable
		let dz = x.is_signer
		let ea = x.rent_epoch
		let eb = x.owner
		rc_inc(ad)
		const ae: DataCell = ac.data
		rc_inc(ae)
		let du = ad
		let dv = af
		const ag: LamportsCell = o.lamports
		const dr = o.key
		let ds = er.executable
		let dt = er.is_writable
		const am = er.is_signer
		const an = er.rent_epoch
		const ao = er.owner
		rc_inc(ag)
		const ah: DataCell = o.data
		rc_inc(ah)
		const al = o.owner
		const ak = o.rent_epoch
		const aj = o.is_signer
		const ai = o.is_writable
		st8(s30 + 2, o.executable)
		st8(s30, aj, ai)
		st64(s58, dr, ag, ah, al, ak)
		st8(s60, am, dt, ds)
		st64(s88, dw, du, ae, ao, an)
		st8(s90, dz, dy, dx)
		st64(sb8, ed, ei, z, eb, ea)
		st8(sc0, eg, ef, ee)
		st64(se8, ec, em, en, dv, eh)
		const ap = fn_1390b0(s18, s170, se8, 4)
		if (ld64(s18) == 0x800000000000001a /* Ok */) {
			ptr_drop_in_place_c1b0(se8, ap)
			const aq = et
			v = aa
			const au = eu
			const at = ev
			if (rc_release(et)) {
				st64(aq + 8, ld64(aq + 8) - 1)
			}
			const ar = eq
			const av = ep
			const be = ek
			if (rc_release(eq)) {
				st64(ar + 8, ld64(ar + 8) - 1)
			}
			rc_dec(at)
			rc_dec(au)
			const aw = ld64(av + 8)
			const bg = ld64(av)
			rc_inc(aw)
			const bc = ld64(av + 0x10)
			eu = aw
			ev = bc
			rc_inc(bc)
			const bd = ld64(el)
			et = bd
			const bf = ld64(bd)
			st64(s1000, be, 8, 0)
			en = bf
			fn_130750(se8, es, bg, bf, be, 8, 0)
			copy(s1a0, se0, 0x18)
			const bh = ld64(se8)
			if (bh == 0x8000000000000000) {
				dq = fn_13b430(s208, s1a0)
				dd = ld64(s208 + 8)
				dp = ld64(s208)
			} else {
				memcpy(s150, sc8, 0x30)
				st64(s170, bh)
				copy(s168, s1a0, 0x18)
				const bi: AccountInfo = eo
				const bj = ld64(eo + 8)
				const br = ld64(eo)
				const bo: AccountInfo = et
				const bl: AccountInfo = ep
				rc_inc(bj)
				const bk: DataCell = bi.data
				rc_inc(bk)
				eq = bj
				const bm: LamportsCell = bl.lamports
				eh = bl.key
				ei = bi.executable
				ek = bi.is_writable
				el = bi.is_signer
				em = bi.rent_epoch
				const bs = bi.owner
				rc_inc(bm)
				const bn: DataCell = bl.data
				eg = bm
				rc_inc(bn)
				const bp: LamportsCell = bo.lamports
				eb = bo.key
				ec = bl.executable
				ed = bl.is_writable
				ee = bl.is_signer
				ef = bl.rent_epoch
				ep = bl.owner
				rc_inc(bp)
				const bq: DataCell = bo.data
				dy = bn
				dz = bk
				ea = br
				rc_inc(bq)
				dw = bq
				dx = bp
				const bt: LamportsCell = o.lamports
				du = o.key
				dv = bo.executable
				const bv = bo.is_writable
				const ca = bo.is_signer
				const cb = bo.rent_epoch
				const cc = bo.owner
				rc_inc(bt)
				const bu: DataCell = o.data
				ds = bv
				dt = bs
				rc_inc(bu)
				const bz = o.owner
				const by = o.rent_epoch
				const bx = o.is_signer
				const bw = o.is_writable
				st8(s30 + 2, o.executable)
				st8(s30, bx, bw)
				st64(s58, du, bt, bu, bz, by)
				st8(s60, ca, ds, dv)
				st64(s88, eb, dx, dw, cc, cb)
				st8(s90, ee, ed, ec)
				st64(sb8, eh, eg, dy, ep, ef)
				st8(sc0, el, ek, ei)
				st64(se8, ea, eq, dz, dt, em)
				const cd = fn_1390b0(s18, s170, se8, 4)
				if (ld64(s18) == 0x800000000000001a /* Ok */) {
					ptr_drop_in_place_c1b0(se8, cd)
					const ce = eu
					v = aa
					if (rc_release(eu)) {
						st64(ce + 8, ld64(ce + 8) - 1)
					}
					const cf = ev
					const cg: AccountInfo = er
					if (rc_release(ev)) {
						st64(cf + 8, ld64(cf + 8) - 1)
					}
					const ch: LamportsCell = cg.lamports
					const cn = cg.key
					rc_inc(ch)
					const ck: DataCell = cg.data
					eu = ch
					ev = ck
					rc_inc(ck)
					const cl: AccountInfo = ld64(ej)
					const cm = cl.key
					copyr(s108, cm, 0x20)
					st64(s1000, s108, 8, 0)
					fn_130750(se8, es, cn, en, s108, 8, 0)
					copy(s120, se0, 0x18)
					const co = ld64(se8)
					if (co == 0x8000000000000000) {
						dq = fn_13b430(s1f8, s120)
						dd = ld64(s1f8 + 8)
						dp = ld64(s1f8)
					} else {
						memcpy(s150, sc8, 0x30)
						st64(s170, co)
						copy(s168, s120, 0x18)
						const cp: AccountInfo = eo
						const cq = ld64(eo + 8)
						const cz = ld64(eo)
						const cs: AccountInfo = er
						rc_inc(cq)
						const cr: DataCell = cp.data
						rc_inc(cr)
						const ct: LamportsCell = cs.lamports
						el = cs.key
						em = cp.executable
						en = cp.is_writable
						ep = cp.is_signer
						eq = cp.rent_epoch
						const cv = cp.owner
						rc_inc(ct)
						const cu: DataCell = cs.data
						es = cu
						const cw: AccountInfo = et
						eo = cv
						rc_inc(cu)
						const cx: LamportsCell = cw.lamports
						ek = ct
						ef = cw.key
						eg = cs.executable
						eh = cs.is_writable
						ei = cs.is_signer
						ej = cs.rent_epoch
						const db = cs.owner
						rc_inc(cx)
						const cy: DataCell = cw.data
						rc_inc(cy)
						ee = cr
						er = cz
						const da: LamportsCell = cl.lamports
						ed = db
						dy = cl.key
						dz = cw.executable
						ea = cw.is_writable
						eb = cw.is_signer
						ec = cw.rent_epoch
						const di = cw.owner
						rc_inc(da)
						const dc: DataCell = cl.data
						et = cq
						rc_inc(dc)
						const dh = cl.owner
						const dg = cl.rent_epoch
						const df = cl.is_signer
						const de = cl.is_writable
						dd = cl.executable
						st8(s30, df, de, dd)
						st64(s58, dy, da, dc, dh, dg)
						st8(s60, eb, ea, dz)
						st64(s88, ef, cx, cy, di, ec)
						st8(s90, ei, eh, eg)
						st64(sb8, el, ek, es, ed, ej)
						st8(sc0, ep, en, em)
						st64(se8, er, et, ee, eo, eq)
						st64(s28, j, n)
						st64(s1000, s28, 1)
						const dj = fn_1390d8(s188, s170, se8, 4, fp)
						if (ld64(s188) == 0x800000000000001a /* Ok */) {
							dq = ptr_drop_in_place_c1b0(se8, dj)
							const dk = eu
							v = aa
							if (rc_release(eu)) {
								st64(dk + 8, ld64(dk + 8) - 1)
							}
							const dl = ev
							if (!rc_release(ev)) {
								st64(v + 8, dd)
								st64(v, 2)
								return dq
							}
							st64(dl + 8, ld64(dl + 8) - 1)
							st64(v + 8, dd)
							st64(v, 2)
							return dq
						}
						copyr(s18, s188, 0x18)
						const dm = fn_13b430(s1e8, s18)
						dd = ld64(s1e8 + 8)
						dp = ld64(s1e8)
						dq = ptr_drop_in_place_c1b0(se8, dm)
						v = aa
					}
					const dn = eu
					bb = ev
					if (rc_release(eu)) {
						st64(dn + 8, ld64(dn + 8) - 1)
					}
					if (!rc_release(bb)) {
						st64(v + 8, dd)
						st64(v, dp)
						return dq
					}
					st64(bb + 8, ld64(bb + 8) - 1)
					st64(v + 8, dd)
					st64(v, dp)
					return dq
				}
				copyr(s108, s18, 0x18)
				const ci = fn_13b430(s1d8, s108)
				dd = ld64(s1d8 + 8)
				dp = ld64(s1d8)
				dq = ptr_drop_in_place_c1b0(se8, ci)
				v = aa
			}
			const cj = eu
			bb = ev
			if (rc_release(eu)) {
				st64(cj + 8, ld64(cj + 8) - 1)
			}
			if (!rc_release(bb)) {
				st64(v + 8, dd)
				st64(v, dp)
				return dq
			}
			st64(bb + 8, ld64(bb + 8) - 1)
			st64(v + 8, dd)
			st64(v, dp)
			return dq
		}
		copyr(s108, s18, 0x18)
		const ax = fn_13b430(s1c8, s108)
		dd = ld64(s1c8 + 8)
		dp = ld64(s1c8)
		dq = ptr_drop_in_place_c1b0(se8, ax)
		v = aa
	}
	bb = eu
	const ba = ev
	const ay = et
	const az = eq
	if (rc_release(et)) {
		st64(ay + 8, ld64(ay + 8) - 1)
	}
	rc_dec(az)
	rc_dec(ba)
	if (!rc_release(bb)) {
		st64(v + 8, dd)
		st64(v, dp)
		return dq
	}
	st64(bb + 8, ld64(bb + 8) - 1)
	st64(v + 8, dd)
	st64(v, dp)
	return dq
}

export function fn_132170(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s80 = fp - 0x80
	let m, n, x, y, z: u64
	const f = memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20)
	const h = p9
	const g = p8
	const j = p7
	let p = p6
	const i = p5
	if ((f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	st8(s40, h)
	st64(s50 + 8, g)
	st32(s50, 0xf)
	const o = fn_12e9c0(s80, s50)
	let k = j + 3
	if (k == 0) {
		st64(s68, 0, 1, 0)
		copyr(s50, c, 0x20)
		fn_12d0a0(s68, c, o)
		n = undef
		k = ld64(s68)
		m = ld64(s68 + 8)
	} else {
		const l = k
		if (k > 0x3c3c3c3c3c3c3c3) {
			raw_vec_handle_error(0, l * 0x22, x, y, z)
		}
		m = __rust_alloc(l * 0x22, 1)
		if (m == 0) {
			raw_vec_handle_error(1, l * 0x22, x, y, z)
		}
		st64(s68, k, m)
		n = c
		copyr(s50, c, 0x20)
	}
	st64(m + 0x18, ld64(s38))
	st64(m + 0x10, ld64(s40))
	st64(m + 8, ld64(s50 + 8))
	st64(m, ld64(s50))
	st16(m + 0x20, 0x100)
	st64(s68 + 0x10, 1)
	if (k == 1) {
		fn_12d0a0(s68, n, m)
		k = ld64(s68)
		m = ld64(s68 + 8)
	}
	let w = b
	st64(m + 0x3a, ld64(d + 0x18))
	st64(m + 0x32, ld64(d + 0x10))
	st64(m + 0x2a, ld64(d + 8))
	st64(m + 0x22, ld64(d))
	st16(m + 0x42, 0x100)
	st64(s68 + 0x10, 2)
	if (k == 2) {
		fn_12d0a0(s68, d, m)
		w = b
		m = ld64(s68 + 8)
	}
	st64(m + 0x5c, ld64(i + 0x18))
	st64(m + 0x54, ld64(i + 0x10))
	st64(m + 0x4c, ld64(i + 8))
	st64(m + 0x44, ld64(i))
	st8(m + 0x64, j == 0, 0)
	st64(s68 + 0x10, 3)
	if (j != 0) {
		let s = 3
		let q = 0
		let t = j << 3
		do {
			const u = ld64(p)
			copyr(s40, u + 0x10, 0x10)
			const v = ld64(u + 8)
			st64(s50 + 8, v)
			st64(s50, ld64(u))
			if (s == ld64(s68)) {
				fn_12d0a0(s68, v, m)
				w = b
				m = ld64(s68 + 8)
			}
			p = p + 8
			const r = m + q
			st64(r + 0x7e, ld64(s38))
			st64(r + 0x76, ld64(s40))
			st64(r + 0x6e, ld64(s50 + 8))
			st64(r + 0x66, ld64(s50))
			st16(r + 0x86, 1)
			q = q + 0x22
			s = s + 1
			st64(s68 + 0x10, s)
			t = t - 8
		} while (t != 0)
	}
	copyr(s20, w, 0x20)
	copy(s50, s68, 0x18)
	copy(s38, s80, 0x18)
	memcpy(a, s50, 0x50)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position, position_mint, position_token_account
export function fn_8d1d0(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0
	let ad, af: u64
	const f: AccountInfo = ld64(b + 0x160)
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
	const n: AccountInfo = ld64(b + 0x168)
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
		ad = Error_with_account_name(s80, v, ld64(s70 + 8), "position", 8)
		af = ld64(s80)
		st64(a + 8, ld64(s80 + 8))
		st64(a, af)
		return ad
	}
	const w = ld64(b + 0x58)
	if ((memcmp(b + 0x60, c, 0x20) as u32) == 0) {
		const x = common_is_closed(w)
		if (x == 0) {
			fn_143448(s30, w, x)
			const z = ld64(s30 + 0x10)
			const y = ld64(s30)
			if (y != 0x800000000000001a /* Ok */) {
				const aa = ld64(s30 + 8)
				st64(s30, y, aa, z)
				fn_13b430(s90, s30)
				const ab = ld64(s90)
				if (ab != 2) {
					ad = Error_with_account_name(sa0, ab, ld64(s90 + 8), "position_mint", 0xd)
					af = ld64(sa0)
					st64(a + 8, ld64(sa0 + 8))
					st64(a, af)
					return ad
				}
			} else {
				st64(z, ld64(z) + 1)
			}
		}
	}
	const ag = ld64(b + 0xa0)
	const ac = memcmp(b + 0x80, c, 0x20)
	let ae = undef
	ad = ac as u32
	if (ad != 0) {
		st64(a + 8, ae)
		st64(a, 2)
		return ad
	}
	ad = common_is_closed(ag)
	ae = undef
	if (ad != 0) {
		st64(a + 8, ae)
		st64(a, 2)
		return ad
	}
	ad = fn_143448(s30, ag, ad)
	ae = ld64(s30 + 0x10)
	const ah = ld64(s30)
	if (ah != 0x800000000000001a /* Ok */) {
		const ai = ld64(s30 + 8)
		st64(s30, ah, ai, ae)
		ad = fn_13b430(sb0, s30)
		ae = undef
		const aj = ld64(sb0)
		if (aj == 2) {
			st64(a + 8, ae)
			st64(a, 2)
			return ad
		}
		ad = Error_with_account_name(sc0, aj, ld64(sb0 + 8), "position_token_account", 0x16)
		af = ld64(sc0)
		st64(a + 8, ld64(sc0 + 8))
		st64(a, af)
		return ad
	}
	st64(ae, ld64(ae) + 1)
	st64(a + 8, ae)
	st64(a, 2)
	return ad
}
