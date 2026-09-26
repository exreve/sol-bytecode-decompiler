/// <reference path="../lib.d.ts" />
// instruction close_position
import { fn_13aee8, fn_5ffd0, fn_65a18, memcpy } from '../shared.ts'

// instruction handler: close_position (discriminator sha256("global:close_position")[..8] = 0x626244310051867b)
// accounts [str: the program's account-error strings, in order of first use]: position_authority, receiver, position, position_mint, position_token_account, token_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
export function ix_close_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s140 = fp - 0x140, s158 = fp - 0x158, s160 = fp - 0x160, s248 = fp - 0x248, s250 = fp - 0x250, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2c1 = fp - 0x2c1, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s1000 = fp - 0x1000
	let l, m, o: u64
	let g = a
	sol_log("Instruction: ClosePosition", 0x1a)
	st64(s2c0, accounts, accounts_len)
	st64(s1000 + 8, s2c1)
	let n = accounts_close_position(s158, program_id, s2c0, undef, fp)
	const f = ld32(s158)
	if (f == 2) {
		l = ld64(s158 + 8)
		st64(g + 8, ld64(s158 + 0x10))
		st64(g, l)
		return n
	}
	st64(s318, program_id, g)
	const j = ld32(s158 + 4)
	const i = ld64(s158 + 8)
	const h = ld64(s158 + 0x10)
	memcpy(s298, s140, 0x140)
	st64(s2a8, i, h)
	st32(s2b0, f, j)
	const k = ld64(s248 + 0xe0)
	n = fn_5ffd0(s2d8, k + 8, s250)
	l = ld64(s2d8)
	if (l == 2) {
		if ((ld64(s248 + 0xa0) | ld64(s248 + 0xb8)) == 0 && (ld64(s248 + 0x80) == 0 && ((ld64(s248 + 0x50) | ld64(s248 + 0x58)) == 0 && (ld64(s248 + 0xd0) | ld64(s248 + 0x88)) == 0))) {
			st64(s1000, k, s160)
			n = fn_65a18(s2e8, s250, s248, s2b0, k, s160)
			m = ld64(s2e8 + 8)
			l = ld64(s2e8)
			g = ld64(s318 + 8)
			o = ld64(s318)
			if (l == 2) {
				n = fn_8b758(s308, s2b0, o)
				l = ld64(s308)
				st64(g + 8, ld64(s308 + 8))
				st64(g, l)
				return n
			}
			st64(g + 8, m)
			st64(g, l)
			return n
		}
		n = fn_87630(s2f8, 5)
		m = ld64(s2f8 + 8)
		l = ld64(s2f8)
		g = ld64(s318 + 8)
		o = ld64(s318)
		if (l == 2) {
			n = fn_8b758(s308, s2b0, o)
			l = ld64(s308)
			st64(g + 8, ld64(s308 + 8))
			st64(g, l)
			return n
		}
		st64(g + 8, m)
		st64(g, l)
		return n
	}
	g = ld64(s318 + 8)
	st64(g + 8, ld64(s2d8 + 8))
	st64(g, l)
	return n
}

// Anchor Accounts::try_accounts of instruction close_position (called by ix_close_position; name [str]: from the handler's "Instruction: …" log; was fn_8a4f8)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_authority, receiver (AccountNotEnoughKeys, ConstraintMut), position (ConstraintSeeds, ConstraintMut, ConstraintClose), position_mint (ConstraintMut, ConstraintAddress), position_token_account (ConstraintMut, ConstraintRaw), token_program (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_token_account_box, position
export function accounts_close_position(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, sa0 = fp - 0xa0, s158 = fp - 0x158, s160 = fp - 0x160, s178 = fp - 0x178, s228 = fp - 0x228, s238 = fp - 0x238, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s458 = fp - 0x458, s488 = fp - 0x488
	let h, k, l, m, ak, al, am: u64
	st64(s458 + 0x20, b)
	let j = a
	try_accounts_11718(s178, c, c, d, e)
	const i = ld64(s178 + 8)
	const f = ld64(s178)
	if (f != 2) {
		am = Error_with_account_name(s260, f, i, "position_authority", 0x12)
		k = ld64(s260)
		st64(j + 0x10, ld64(s260 + 8))
		st64(j + 8, k)
		st32(j, 2)
		return am
	}
	const o = ld64(e - 0xff8)
	const g = ld64(c + 8)
	if (g == 0) {
		anchor_error_from(s270, 0xbbd /* anchor::AccountNotEnoughKeys */, undef, l, m)
		h = ld64(s270 + 8)
		const n = ld64(s270)
		if (n != 2) {
			am = Error_with_account_name(s280, n, h, "receiver", 8)
			k = ld64(s280)
			st64(j + 0x10, ld64(s280 + 8))
			st64(j + 8, k)
			st32(j, 2)
			return am
		}
	} else {
		st64(c + 8, g - 1)
		h = ld64(c)
		st64(c, h + 0x30)
	}
	st64(s458, i, o, h, j)
	try_accounts_11b00(s178, c, h, l, m)
	const q = ld64(s178 + 0x10)
	const r = ld64(s178 + 8)
	const position: AccountInfo = ld64(s178)
	if (position == 0) {
		am = Error_with_account_name(s430, r, q, "position", 8)
		al = ld64(s430)
		ak = ld64(s458 + 0x18)
		st64(ak + 0x10, ld64(s430 + 8))
		st64(ak + 8, al)
		st32(ak, 2)
		return am
	}
	memcpy(s238, s160, 0xc0)
	st64(s250, position, r, q)
	try_accounts_11e98(s178, c)
	const s = ld32(s178)
	if (s == 2) {
		am = Error_with_account_name(s420, ld64(s178 + 8), ld64(s178 + 0x10), "position_mint", 0xd)
		al = ld64(s420)
		ak = ld64(s458 + 0x18)
		st64(ak + 0x10, ld64(s420 + 8))
		st64(ak + 8, al)
		st32(ak, 2)
		return am
	}
	st64(s488 + 0x18, ld64(s178 + 0x10))
	st64(s488 + 0x20, ld64(s178 + 8))
	const x = ld32(s178 + 4)
	memcpy(sa0, s160, 0x40)
	st64(s488 + 0x28, ld64(s158 + 0x38))
	try_accounts_11f50(s178, c)
	if (ld32(s158 + 0x70) == 2) {
		am = Error_with_account_name(s410, ld64(s178), ld64(s178 + 8), "position_token_account", 0x16)
		al = ld64(s410)
		ak = ld64(s458 + 0x18)
		st64(ak + 0x10, ld64(s410 + 8))
		st64(ak + 8, al)
		st32(ak, 2)
		return am
	}
	const t = ld64(0x300000000 /* heap bump-allocator cursor */)
	const position_token_account_box: TokenAccount = t != 0 ? sat_sub(t, 0xb8) & -8 : 0x300007f48
	if (position_token_account_box > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, position_token_account_box)
		st64(s488 + 0x10, position_token_account_box)
		memcpy(position_token_account_box, s178, 0xb8)
		fn_129a0(s178, c)
		const w = ld64(s178 + 8)
		const v = ld64(s178)
		if (v == 2) {
			if (ld8(ld64(s458 + 0x10) + 0x29 /* is_writable */) == 0) {
				anchor_error_from(s3f0, 0x7d0 /* anchor::ConstraintMut */, w)
				am = Error_with_account_name(s400, ld64(s3f0), ld64(s3f0 + 8), "receiver", 8)
				al = ld64(s400)
				ak = ld64(s458 + 0x18)
				st64(ak + 0x10, ld64(s400 + 8))
				st64(ak + 8, al)
				st32(ak, 2)
				return am
			}
			st64(s488, x, w)
			const y = ld64(ld64(s488 + 0x28) /* key */)
			copyr(s20, y, 0x20)
			st64(s40, 0x100151f20, 8, s20, 0x20)
			// PDA find_program_address(["position", *y], program *(ld64(s458 + 0x20)))
			Pubkey_find_program_address(s178, s40, 2, ld64(s458 + 0x20))
			copyr(s60, s178, 0x20)
			st8(ld64(s458 + 8), ld8(s158))
			const z = position.key
			copyr(s178, z, 0x20)
			if ((memcmp(s178, s60, 0x20) as u32) != 0) {
				anchor_error_from(s2a0, 0x7d6 /* anchor::ConstraintSeeds */)
				Error_with_account_name(s2b0, ld64(s2a0), ld64(s2a0 + 8), "position", 8)
				const aj = ld64(s2b0 + 8)
				const ai = ld64(s2b0)
				const ad = ld64(ld64(s250))
				const ah = ld64(ad + 0x18)
				const ag = ld64(ad + 0x10)
				const af = ld64(ad + 8)
				const ae = ld64(ad)
				copy(s158, s60, 0x20)
				st64(s178, ae, af, ag, ah)
				am = fn_13b5c0(s2c0, ai, aj, s178, af)
				al = ld64(s2c0)
				ak = ld64(s458 + 0x18)
				st64(ak + 0x10, ld64(s2c0 + 8))
				st64(ak + 8, al)
				st32(ak, 2)
				return am
			}
			if (position.is_writable == 0) {
				anchor_error_from(s3d0, 0x7d0 /* anchor::ConstraintMut */)
				am = Error_with_account_name(s3e0, ld64(s3d0), ld64(s3d0 + 8), "position", 8)
				al = ld64(s3e0)
				ak = ld64(s458 + 0x18)
				st64(ak + 0x10, ld64(s3e0 + 8))
				st64(ak + 8, al)
				st32(ak, 2)
				return am
			}
			copyr(s20, z, 0x20)
			const aa = ld64(ld64(s458 + 0x10) /* key */)
			copyr(s178, aa, 0x20)
			const ab = memcmp(s20, s178, 0x20)
			j = ld64(s458 + 0x18)
			if ((ab as u32) == 0) {
				anchor_error_from(s3b0, 0x7db /* anchor::ConstraintClose */)
				am = Error_with_account_name(s3c0, ld64(s3b0), ld64(s3b0 + 8), "position", 8)
				k = ld64(s3c0)
				st64(j + 0x10, ld64(s3c0 + 8))
				st64(j + 8, k)
				st32(j, 2)
				return am
			}
			if (ld8(ld64(s488 + 0x28) + 0x29 /* is_writable */) == 0) {
				anchor_error_from(s390, 0x7d0 /* anchor::ConstraintMut */)
				am = Error_with_account_name(s3a0, ld64(s390), ld64(s390 + 8), "position_mint", 0xd)
				k = ld64(s3a0)
				st64(j + 0x10, ld64(s3a0 + 8))
				st64(j + 8, k)
				st32(j, 2)
				return am
			}
			copyr(s40, y, 0x20)
			copyr(s20, s228, 0x20)
			if ((memcmp(s40, s20, 0x20) as u32) != 0) {
				anchor_error_from(s2d0, 0x7dc /* anchor::ConstraintAddress */)
				const ap = Error_with_account_name(s2e0, ld64(s2d0), ld64(s2d0 + 8), "position_mint", 0xd)
				const ao = ld64(s2e0 + 8)
				const an = ld64(s2e0)
				copy(s178, s40, 0x40)
				am = fn_13b5c0(s2f0, an, ao, s178, ap)
				k = ld64(s2f0)
				st64(j + 0x10, ld64(s2f0 + 8))
				st64(j + 8, k)
				st32(j, 2)
				return am
			}
			const ac: TokenAccount = ld64(s488 + 0x10)
			if (ac.info.is_writable == 0) {
				anchor_error_from(s370, 0x7d0 /* anchor::ConstraintMut */, ac)
				am = Error_with_account_name(s380, ld64(s370), ld64(s370 + 8), "position_token_account", 0x16)
				k = ld64(s380)
				st64(j + 0x10, ld64(s380 + 8))
				st64(j + 8, k)
				st32(j, 2)
				return am
			}
			if (ac.amount != 1) {
				anchor_error_from(s300, 0x7d3 /* anchor::ConstraintRaw */, ac)
				am = Error_with_account_name(s310, ld64(s300), ld64(s300 + 8), "position_token_account", 0x16)
				k = ld64(s310)
				st64(j + 0x10, ld64(s310 + 8))
				st64(j + 8, k)
				st32(j, 2)
				return am
			}
			if ((memcmp(ac.mint, s228, 0x20) as u32) == 0) {
				const aq = ld64(ld64(s488 + 8))
				copyr(s20, aq, 0x20)
				if ((memcmp(s20, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
					anchor_error_from(s340, 0x7dc /* anchor::ConstraintAddress */)
					const au = Error_with_account_name(s350, ld64(s340), ld64(s340 + 8), "token_program", 0xd)
					const at = ld64(s350 + 8)
					const ar = ld64(s350)
					copyr(s178, s20, 0x20)
					st64(s158, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
					am = fn_13b5c0(s360, ar, at, s178, au)
					k = ld64(s360)
					st64(j + 0x10, ld64(s360 + 8))
					st64(j + 8, k)
					st32(j, 2)
					return am
				}
				memcpy(j + 0x70, s250, 0xd8)
				am = memcpy(j + 0x18, sa0, 0x40)
				st64(j + 0x150, ld64(s488 + 8))
				st64(j + 0x148, ld64(s488 + 0x10))
				st64(j + 0x68, ld64(s458 + 0x10))
				st64(j + 0x60, ld64(s458))
				st64(j + 0x58, ld64(s488 + 0x28))
				st64(j + 0x10, ld64(s488 + 0x18))
				st64(j + 8, ld64(s488 + 0x20))
				st32(j + 4, ld64(s488))
				st32(j, s)
				return am
			}
			anchor_error_from(s320, 0x7d3 /* anchor::ConstraintRaw */)
			am = Error_with_account_name(s330, ld64(s320), ld64(s320 + 8), "position_token_account", 0x16)
			k = ld64(s330)
			st64(j + 0x10, ld64(s330 + 8))
			st64(j + 8, k)
			st32(j, 2)
			return am
		}
		am = Error_with_account_name(s290, v, w, "token_program", 0xd)
		al = ld64(s290)
		ak = ld64(s458 + 0x18)
		st64(ak + 0x10, ld64(s290 + 8))
		st64(ak + 8, al)
		st32(ak, 2)
		return am
	}
	alloc_handle_alloc_error(8, 0xb8)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position, position_mint, position_token_account
export function fn_8b758(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0
	let ad, af: u64
	const f: AccountInfo = ld64(b + 0x68)
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
	const n: AccountInfo = ld64(b + 0x70)
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
	if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
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
	const ag = ld64(ld64(b + 0x148))
	const ac = memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20)
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
