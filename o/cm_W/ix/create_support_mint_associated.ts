/// <reference path="../lib.d.ts" />
// instruction create_support_mint_associated
import { anchor_error_from, fn_1111c0, fn_13e070, fn_13e5a0, fn_13e628, fn_1476d8, fn_147a20, fn_14ed60, fn_4130, fn_88360, memcpy } from '../shared.ts'

// instruction handler: create_support_mint_associated (discriminator sha256("global:create_support_mint_associated")[..8] = 0xa90ef2885c41fb11)
// accounts [idl]: 0 owner [signer, mut], 1 token_mint, 2 support_mint_associated [mut, pda], 3 system_program [= 11111111111111111111111111111111]
// args [idl]: (none)
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
export function ix_create_support_mint_associated(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const se8 = fp - 0xe8, s100 = fp - 0x100, s128 = fp - 0x128, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s200 = fp - 0x200, s210 = fp - 0x210, s211 = fp - 0x211, s228 = fp - 0x228, sff8 = fp - 0xff8
	let m: u64
	const f = sol_log("Instruction: CreateSupportMintAssociated", 0x28)
	st8(s211, 0xff)
	st64(s210, accounts, accounts_len)
	st64(sff8, s211)
	let n = accounts_create_support_mint_associated(s100, program_id, s210, undef, fp, f)
	const g = ld32(s100)
	if (g == 2) {
		m = ld64(s100 + 8)
		st64(a + 8, ld64(s100 + 0x10))
		st64(a, m)
		return n
	}
	const p = ld32(s100 + 4)
	const o = ld64(s100 + 8)
	const h = ld64(s100 + 0x10)
	memcpy(s1e8, se8, 0xe8)
	st64(s1f8, o, h)
	st32(s200, g, p)
	st8(s128 + 0x18, ld8(s211))
	const i = ld64(ld64(s1e8 + 0x40))
	const l = ld64(i + 8)
	const k = ld64(i + 0x10)
	const j = ld64(i + 0x18)
	st64(s1e8 + 0xb8, ld64(i))
	st64(s128, l, k, j)
	n = fn_d24d0(s228, s200, program_id)
	m = ld64(s228)
	st64(a + 8, ld64(s228 + 8))
	st64(a, m)
	return n
}

// Anchor Accounts::try_accounts of instruction create_support_mint_associated (called by ix_create_support_mint_associated; name [str]: from the handler's "Instruction: …" log; was fn_cf3b0)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: owner (ConstraintMut), token_mint, support_mint_associated (ConstraintMut, ConstraintRentExempt)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: support_mint_associated [idl], owner [idl]
export function accounts_create_support_mint_associated(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s78 = fp - 0x78, sb0 = fp - 0xb0, sd0 = fp - 0xd0, sf0 = fp - 0xf0, sf1 = fp - 0xf1, s118 = fp - 0x118, s130 = fp - 0x130, s148 = fp - 0x148, s150 = fp - 0x150, s158 = fp - 0x158, s198 = fp - 0x198, s1b8 = fp - 0x1b8, s1d8 = fp - 0x1d8, s218 = fp - 0x218, s220 = fp - 0x220, s230 = fp - 0x230, s238 = fp - 0x238, s258 = fp - 0x258, s2a0 = fp - 0x2a0, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3f8 = fp - 0x3f8, s400 = fp - 0x400, s408 = fp - 0x408, s410 = fp - 0x410, s418 = fp - 0x418
	let j, ai, aj: u64
	st64(s3f8 + 0x28, a)
	st64(s2c8, b)
	let ak = try_accounts_17a30(s238, c, c, d, e, r0)
	const i = ld64(s230)
	let f = ld64(s238)
	if (f == 2) {
		const q = ld64(e - 0xff8)
		st64(s2c0, i)
		ak = try_accounts_15c0(s238, c)
		const k = ld32(s238)
		if (k == 2) {
			const l = ld64(0x300000000 /* heap bump-allocator cursor */)
			const n = l != 0 ? sat_sub(l, 0xa) : 0x300007ff6
			const o = ld64(s230 + 8)
			const m = ld64(s230)
			if (m != 0) {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n, 0x696d5f6e656b6f74)
				st16(n + 8, 0x746e)
				void ld64(o)
			} else {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n, 0x696d5f6e656b6f74)
				st16(n + 8, 0x746e)
				void ld64(o)
			}
			st64(o + 0x10, n, 0xa)
			st64(o + 8, 0xa)
			st64(o, 1)
			const p = ld64(s3f8 + 0x28)
			st64(p + 0x10, o)
			st64(p + 8, m)
			st32(p, 2)
			return ak
		}
		st64(s3f8, i, q, b)
		st64(s3f8 + 0x20, ld32(s238 + 4))
		const s = ld64(s230)
		const r = ld64(s230 + 8)
		st64(s3f8 + 0x18, s198)
		memcpy(s198, s220, 0x40)
		copy(s1b8, s1d8, 0x20)
		st64(s400, k)
		st32(s2b8, k)
		st64(s410, r)
		st64(s2b8 + 0x10, r)
		st64(s408, s)
		st64(s2b8 + 8, s)
		const t = ld64(s3f8 + 0x20)
		st32(s2b8 + 4, t)
		const u = ld64(s218 + 0x38)
		memcpy(s2a0, ld64(s3f8 + 0x18), 0x40)
		copyr(s258, s1b8, 0x20)
		st64(s2a0 + 0x40, u)
		const v = ld64(c + 8)
		if (v == 0) {
			ak = anchor_error_from(s3c8, 0xbbd /* anchor::AccountNotEnoughKeys */)
			aj = ld64(s3c8)
			ai = ld64(s3f8 + 0x28)
			st64(ai + 0x10, ld64(s3c8 + 8))
			st64(ai + 8, aj)
			st32(ai, 2)
			return ak
		}
		const w: AccountInfo = ld64(c)
		st64(s158, w)
		st64(c + 8, v - 1)
		st64(c, w + 0x30)
		ak = try_accounts_18870(s238, c)
		const z = ld64(s230)
		f = ld64(s238)
		if (f == 2) {
			st64(s150, z)
			rent_get(s238)
			copy(s130, s230, 0x18)
			if (ld64(s238) != 0) {
				ak = fn_13e628(s3b8, s130)
				aj = ld64(s3b8)
				ai = ld64(s3f8 + 0x28)
				st64(ai + 0x10, ld64(s3b8 + 8))
				st64(ai + 8, aj)
				st32(ai, 2)
				return ak
			}
			copyr(s148, s130, 0x18)
			const aa = ld64(u)
			copyr(sb0, aa, 0x20)
			st64(sf0, 0x10015a827, 0xc, sb0, 0x20)
			// PDA find_program_address(["support_mint", *aa], program *(ld64(s3f8 + 0x10)))
			Pubkey_find_program_address(s238, sf0, 2, ld64(s3f8 + 0x10))
			copyr(s118, s238, 0x20)
			const ab = ld8(s218)
			st8(sf1, ab)
			st8(ld64(s3f8 + 8), ab)
			const ac = w.key
			copyr(sd0, ac, 0x20)
			if ((memcmp(sd0, s118, 0x20) as u32) == 0) {
				st64(s418, u)
				st64(sb0, s158, s148, s2c0, s150, s2b8, sf1, s2c8)
				ak = fn_d0a78(s238, sb0)
				const am = ld64(s230 + 8)
				const an = ld64(s230)
				const support_mint_associated: AccountInfo = ld64(s238)
				if (support_mint_associated == 0) {
					const at = ld64(s3f8 + 0x28)
					st64(at + 0x10, am)
					st64(at + 8, an)
					st32(at, 2)
					return ak
				}
				st64(s3f8 + 0x18, am)
				memcpy(s78, s220, 0x58)
				if (support_mint_associated.is_writable != 0) {
					st64(s3f8 + 8, an)
					AccountInfo_clone_f338(sb0, support_mint_associated)
					st64(s3f8 + 0x10, fn_147a20(sb0))
					AccountInfo_clone_f338(s238, support_mint_associated)
					AccountInfo_try_data_len(sf0, s238)
					const ap = ld64(sf0 + 8)
					const ao = ld64(sf0)
					if (ao != 0x800000000000001a /* Ok */) {
						st64(sf0 + 0x10, ld64(sf0 + 0x10))
						st64(sf0, ao, ap)
						const aw = fn_13e628(s318, sf0)
						const av = ld64(s318)
						const au = ld64(s3f8 + 0x28)
						st64(au + 0x10, ld64(s318 + 8))
						st64(au + 8, av)
						st32(au, 2)
						return ptr_drop_in_place_fcd8(sb0, ptr_drop_in_place_fcd8(s238, aw))
					}
					const aq = Rent_is_exempt(s148, ld64(s3f8 + 0x10), ap)
					ptr_drop_in_place_fcd8(sb0, ptr_drop_in_place_fcd8(s238, aq))
					if (aq != 0) {
						const owner: AccountInfo = ld64(s3f8)
						if (owner.is_writable != 0) {
							const ax = owner.key
							copyr(s20, ax, 0x20)
							if ((memcmp(s20, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) != 0) {
								copyr(s238, ax, 0x20)
								if ((memcmp(s238, 0x100159420 /* key RayVyjyJQz9vAi126A4sGexKnSU1XeZaHTRcM1mZMPY */, 0x20) as u32) != 0) {
									fn_88360(s368, 0)
									ak = fn_4130(s378, ld64(s368), ld64(s368 + 8), 0x10015b1d0 /* "owner" */, 5)
									aj = ld64(s378)
									ai = ld64(s3f8 + 0x28)
									st64(ai + 0x10, ld64(s378 + 8))
									st64(ai + 8, aj)
									st32(ai, 2)
									return ak
								}
							}
							const ay = ld64(ld64(s418) + 0x18)
							if ((memcmp(ay, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) == 0) {
								const bc = ld64(s3f8 + 0x28)
								memcpy(bc + 0x18, s198, 0x40)
								copy(bc + 0x60, s1b8, 0x20)
								ak = memcpy(bc + 0xa0, s78, 0x58)
								st64(bc + 0xf8, z)
								st64(bc + 0x98, ld64(s3f8 + 0x18))
								st64(bc + 0x90, ld64(s3f8 + 8))
								st64(bc + 0x88, support_mint_associated)
								st64(bc + 0x80, ld64(s3f8))
								st64(bc + 0x58, ld64(s418))
								st64(bc + 0x10, ld64(s410))
								st64(bc + 8, ld64(s408))
								st32(bc + 4, t)
								st32(bc, ld64(s400))
								return ak
							}
							fn_88360(s388, 0)
							const bb = fn_4130(s398, ld64(s388), ld64(s388 + 8), 0x10015b214 /* "token_mint" */, 0xa)
							const ba = ld64(s398 + 8)
							const az = ld64(s398)
							copyr(s238, ay, 0x20)
							st64(s218, 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */, 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */, 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */, 0xfc8ba1d828f9bdfe /* TOKEN_2022_PROGRAM[3] */) // key TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
							ak = Error_with_pubkeys(s3a8, az, ba, s238, bb)
							aj = ld64(s3a8)
							ai = ld64(s3f8 + 0x28)
							st64(ai + 0x10, ld64(s3a8 + 8))
							st64(ai + 8, aj)
							st32(ai, 2)
							return ak
						}
						anchor_error_from(s348, 0x7d0 /* anchor::ConstraintMut */)
						ak = fn_4130(s358, ld64(s348), ld64(s348 + 8), 0x10015b1d0 /* "owner" */, 5)
						aj = ld64(s358)
						ai = ld64(s3f8 + 0x28)
						st64(ai + 0x10, ld64(s358 + 8))
						st64(ai + 8, aj)
						st32(ai, 2)
						return ak
					}
					anchor_error_from(s328, 0x7d5 /* anchor::ConstraintRentExempt */)
					ak = fn_4130(s338, ld64(s328), ld64(s328 + 8), 0x10015b263 /* "support_mint_associated" */, 0x17)
					aj = ld64(s338)
					ai = ld64(s3f8 + 0x28)
					st64(ai + 0x10, ld64(s338 + 8))
					st64(ai + 8, aj)
					st32(ai, 2)
					return ak
				}
				anchor_error_from(s2f8, 0x7d0 /* anchor::ConstraintMut */)
				ak = fn_4130(s308, ld64(s2f8), ld64(s2f8 + 8), 0x10015b263 /* "support_mint_associated" */, 0x17)
				aj = ld64(s308)
				ai = ld64(s3f8 + 0x28)
				st64(ai + 0x10, ld64(s308 + 8))
				st64(ai + 8, aj)
				st32(ai, 2)
				return ak
			}
			const ah = anchor_error_from(s2d8, 0x7d6 /* anchor::ConstraintSeeds */)
			const ad = ld64(0x300000000 /* heap bump-allocator cursor */)
			const af = ad != 0 ? sat_sub(ad, 0x17) : 0x300007fe9
			const ag = ld64(s2d8 + 8)
			const ae = ld64(s2d8)
			if ((ae & 1) != 0) {
				if (0x300000008 > af) {
					raw_vec_handle_error(1, 0x17, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, af)
				st64(af + 0xf, 0x6465746169636f73)
				st64(af + 8, 0x7373615f746e696d)
				st64(af, 0x5f74726f70707573)
				void ld64(ag)
			} else {
				if (0x300000008 > af) {
					raw_vec_handle_error(1, 0x17, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, af)
				st64(af + 0xf, 0x6465746169636f73)
				st64(af + 8, 0x7373615f746e696d)
				st64(af, 0x5f74726f70707573)
				void ld64(ag)
			}
			st64(ag + 0x10, af, 0x17)
			st64(ag + 8, 0x17)
			st64(ag, 1)
			copyr(s238, sd0, 0x20)
			copy(s218, s118, 0x20)
			ak = Error_with_pubkeys(s2e8, ae, ag, s238, ah)
			aj = ld64(s2e8)
			ai = ld64(s3f8 + 0x28)
			st64(ai + 0x10, ld64(s2e8 + 8))
			st64(ai + 8, aj)
			st32(ai, 2)
			return ak
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
		j = ld64(s3f8 + 0x28)
		st64(j + 0x10, z)
		st64(j + 8, f)
		st32(j, 2)
		return ak
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
	j = ld64(s3f8 + 0x28)
	st64(j + 0x10, i)
	st64(j + 8, f)
	st32(j, 2)
	return ak
}

export function fn_d0a78(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s49 = fp - 0x49, s70 = fp - 0x70, s71 = fp - 0x71, s98 = fp - 0x98, sa8 = fp - 0xa8, s108 = fp - 0x108, s110 = fp - 0x110, s130 = fp - 0x130, s150 = fp - 0x150, s168 = fp - 0x168, s180 = fp - 0x180, s188 = fp - 0x188, s1a8 = fp - 0x1a8, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s210 = fp - 0x210, s218 = fp - 0x218, s21f = fp - 0x21f, s228 = fp - 0x228, s240 = fp - 0x240, s248 = fp - 0x248, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s308 = fp - 0x308, s310 = fp - 0x310, s318 = fp - 0x318, s320 = fp - 0x320, s328 = fp - 0x328, s330 = fp - 0x330, s338 = fp - 0x338, s340 = fp - 0x340, s348 = fp - 0x348, s350 = fp - 0x350, s358 = fp - 0x358, s360 = fp - 0x360, s368 = fp - 0x368
	let af, aj, co, cp: u64
	const f: AccountInfo = ld64(ld64(b))
	const g = fn_147a20(f, b, c, d, e)
	st64(s308 + 0x40, a)
	if (g != 0) {
		const j = ld64(b + 0x10)
		const k = ld64(ld64(j))
		copyr(s1a8, k, 0x20)
		const l = f.key
		copy(s180, l + 8, 0x18)
		st64(s188, ld64(l))
		if ((memcmp(s1a8, s188, 0x20) as u32) == 0) {
			ErrorCode_name(s168, 0x100159890)
			st64(s70, 0, 1, 0)
			st64(s28, s70, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100159890, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(s228, s70, 0x18)
			copy(s240, s168, 0x18)
			st64(s260 + 8, 0x10015b21e)
			st32(s1e0 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s210, 2)
			st32(s248, 0xf)
			st64(s260 + 0x10, 0x45)
			st64(s260, 0)
			const ai = fn_13e5a0(s2a0, s260)
			const ah = ld64(s2a0 + 8)
			const ag = ld64(s2a0)
			copy(s260, s1a8, 0x40)
			cp = Error_with_pubkeys(s2b0, ag, ah, s260, ai)
			const ak = ld64(s2b0)
			aj = ld64(s308 + 0x40)
			st64(aj + 0x10, ld64(s2b0 + 8))
			st64(aj + 8, ak)
			st64(aj, 0)
			return cp
		}
		st64(s308 + 0x38, b)
		const m = max(fn_1476d8(ld64(b + 8), 0x69), 1)
		if (m > g) {
			const n: AccountInfo = ld64(j)
			const o: LamportsCell = n.lamports
			const ap = n.key
			rc_inc(o)
			const al: DataCell = n.data
			rc_inc(al)
			const am: LamportsCell = f.lamports
			st64(s308 + 0x30, am)
			const an = am.strong
			st64(s308, f.key)
			st64(s308 + 8, n.executable)
			st64(s308 + 0x10, n.is_writable)
			st64(s308 + 0x18, n.is_signer)
			st64(s308 + 0x20, n.rent_epoch)
			st64(s308 + 0x28, n.owner)
			rc_inc(ld64(s308 + 0x30), an)
			const ao: DataCell = f.data
			const aq = ld64(s308 + 0x38)
			rc_inc(ao)
			st64(s320, al, ap)
			const ar: AccountInfo = ld64(ld64(aq + 0x18))
			const at: LamportsCell = ar.lamports
			const au = at.strong
			st64(s310, o)
			st64(s348, f.executable)
			st64(s340, f.is_writable)
			st64(s338, f.is_signer)
			st64(s330, f.rent_epoch)
			const ax = f.owner
			st64(s328, ar.key)
			rc_inc(at, au)
			st64(s358, ao)
			const av: DataCell = ar.data
			const aw = av.strong
			st64(s350, sat_sub(m, g))
			rc_inc(av, aw)
			st64(s360, ar.owner)
			const bb = ar.rent_epoch
			const ba = ar.is_signer
			const az = ar.is_writable
			const ay = ar.executable
			st8(s108 + 0x5a, ld64(s348))
			st8(s108 + 0x59, ld64(s340))
			st8(s108 + 0x58, ld64(s338))
			st64(s108 + 0x50, ld64(s330))
			st64(s108 + 0x48, ax)
			st64(s108 + 0x40, ld64(s358))
			st64(s108 + 0x38, ld64(s308 + 0x30))
			st64(s108 + 0x30, ld64(s308))
			st8(s108 + 0x2a, ld64(s308 + 8))
			st8(s108 + 0x29, ld64(s308 + 0x10))
			st8(s108 + 0x28, ld64(s308 + 0x18))
			st64(s108 + 0x20, ld64(s308 + 0x20))
			st64(s108 + 0x18, ld64(s308 + 0x28))
			st64(s108 + 0x10, ld64(s320))
			copyr(s108, s318, 0x10)
			st8(s110, ba, az, ay)
			st64(s130 + 0x18, bb)
			st64(s130 + 0x10, ld64(s360))
			st64(s130, at, av)
			st64(s150 + 0x18, ld64(s328))
			st64(sa8, 8, 0)
			st64(s150, 0, 8, 0)
			cp = system_program_transfer(s270, s150, ld64(s350))
			const bc = ld64(s270)
			const bd = ld64(s308 + 0x40)
			if (bc != 2) {
				const be = ld64(s270 + 8)
				st64(bd + 8, bc, be)
				st64(bd, 0)
				return cp
			}
		}
		const bf: LamportsCell = f.lamports
		const bg = bf.strong
		st64(s308 + 0x30, f.key)
		const bi = ld64(s308 + 0x38)
		rc_inc(bf, bg)
		const bh: DataCell = f.data
		rc_inc(bh)
		st64(s308 + 0x28, bh)
		const bj = ld64(bi + 0x18)
		const bk: AccountInfo = ld64(bj)
		const bl: LamportsCell = bk.lamports
		const bm = bl.strong
		st64(s308, f.executable)
		st64(s308 + 8, f.is_writable)
		st64(s308 + 0x10, f.is_signer)
		st64(s308 + 0x18, f.rent_epoch)
		st64(s308 + 0x20, f.owner)
		const bn = bk.key
		rc_inc(bl, bm)
		st64(s310, bn)
		const bo: DataCell = bk.data
		rc_inc(bo)
		st64(s328, bj)
		st64(s320, bk.owner)
		st64(s318, bf)
		const bu = bk.rent_epoch
		const bt = bk.is_signer
		const bs = bk.is_writable
		const br = bk.executable
		const bp = ld64(ld64(ld64(bi + 0x20) + 0x58))
		copyr(s98, bp, 0x20)
		const bq = ld8(ld64(bi + 0x28))
		st64(s28, s71)
		st64(s48 + 0x10, s98)
		st64(s48, 0x10015a827)
		st8(s71, bq)
		st64(s70, s48)
		st64(s1f0 + 8, s70)
		st8(s1f0, bt, bs, br)
		st64(s210 + 0x18, bu)
		st64(s210 + 0x10, ld64(s320))
		st64(s210, bl, bo)
		st64(s218, ld64(s310))
		st8(s21f + 1, ld64(s308))
		st8(s21f, ld64(s308 + 8))
		st8(s228 + 8, ld64(s308 + 0x10))
		st64(s228, ld64(s308 + 0x18))
		st64(s240 + 0x10, ld64(s308 + 0x20))
		st64(s240 + 8, ld64(s308 + 0x28))
		st64(s240, ld64(s318))
		st64(s248, ld64(s308 + 0x30))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0xc)
		st64(s70 + 8, 3)
		st64(s1e0, 1)
		st64(s260, 0, 8, 0)
		cp = system_program_assign_13fb30(s280, s260, 0x69)
		af = ld64(s280)
		if (af != 2) {
			co = ld64(s280 + 8)
			aj = ld64(s308 + 0x40)
			st64(aj + 8, af, co)
			st64(aj, 0)
			return cp
		}
		const bv: LamportsCell = f.lamports
		const cd = f.key
		rc_inc(bv)
		const bw: DataCell = f.data
		rc_inc(bw)
		const bx: AccountInfo = ld64(ld64(s328))
		const by: LamportsCell = bx.lamports
		const bz = by.strong
		st64(s308 + 0x18, f.executable)
		st64(s308 + 0x20, f.is_writable)
		st64(s308 + 0x28, f.is_signer)
		st64(s308 + 0x30, f.rent_epoch)
		const cc = f.owner
		st64(s308 + 0x10, bx.key)
		rc_inc(by, bz)
		const ca: DataCell = bx.data
		const cb = ca.strong
		st64(s310, cc, cd, bv)
		rc_inc(ca, cb)
		const ci = bx.owner
		const ch = bx.rent_epoch
		const cg = bx.is_signer
		const cf = bx.is_writable
		const ce = bx.executable
		copyr(s70, s98, 0x20)
		st64(s28, s49)
		st64(s48 + 0x10, s70)
		st64(s48, 0x10015a827)
		st8(s49, ld8(s71))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0xc)
		st64(s168, s48, 3)
		st64(s1f0 + 8, s168)
		st8(s1f0, cg, cf, ce)
		st64(s210, by, ca, ci, ch)
		st64(s218, ld64(s308 + 0x10))
		st8(s21f + 1, ld64(s308 + 0x18))
		st8(s21f, ld64(s308 + 0x20))
		st8(s228 + 8, ld64(s308 + 0x28))
		st64(s228, ld64(s308 + 0x30))
		st64(s240 + 0x10, ld64(s310))
		st64(s240 + 8, bw)
		copyr(s248, s308, 0x10)
		st64(s1e0, 1)
		st64(s260, 0, 8, 0)
		cp = system_program_assign_13ff40(s290, s260, ld64(ld64(ld64(s308 + 0x38) + 0x30)))
		af = ld64(s290)
		if (af != 2) {
			co = ld64(s290 + 8)
			aj = ld64(s308 + 0x40)
			st64(aj + 8, af, co)
			st64(aj, 0)
			return cp
		}
	} else {
		const p = fn_1476d8(ld64(b + 8), 0x69)
		const h: AccountInfo = ld64(ld64(b + 0x10))
		const i: LamportsCell = h.lamports
		const v = h.key
		rc_inc(i)
		st64(s308 + 0x30, p)
		const q: DataCell = h.data
		rc_inc(q)
		st64(s308 + 0x28, q)
		const r: LamportsCell = f.lamports
		const s = r.strong
		st64(s308, f.key)
		st64(s308 + 8, h.executable)
		st64(s308 + 0x10, h.is_writable)
		st64(s308 + 0x18, h.is_signer)
		st64(s308 + 0x20, h.rent_epoch)
		const t = h.owner
		rc_inc(r, s)
		st64(s310, t)
		const u: DataCell = f.data
		rc_inc(u)
		st64(s320, v, i)
		const w: AccountInfo = ld64(ld64(b + 0x18))
		const x: LamportsCell = w.lamports
		const y = x.strong
		st64(s348, f.executable)
		st64(s340, f.is_writable)
		st64(s338, f.is_signer)
		st64(s330, f.rent_epoch)
		st64(s328, f.owner)
		const z = w.key
		rc_inc(x, y)
		st64(s350, z)
		const aa: DataCell = w.data
		rc_inc(aa)
		st64(s358, w.owner)
		st64(s360, w.rent_epoch)
		st64(s368, w.is_signer)
		const ae = w.is_writable
		const ad = w.executable
		const ab = ld64(ld64(ld64(b + 0x20) + 0x58))
		copyr(s70, ab, 0x20)
		const ac = ld8(ld64(b + 0x28))
		st64(s28, s49)
		st64(s48 + 0x10, s70)
		st64(s48, 0x10015a827)
		st8(s49, ac)
		st64(s168, s48)
		st64(s1e0 + 0x28, s168)
		st8(s1e0 + 0x22, ld64(s348))
		st8(s1e0 + 0x21, ld64(s340))
		st8(s1e0 + 0x20, ld64(s338))
		st64(s1e0 + 0x18, ld64(s330))
		st64(s1e0 + 0x10, ld64(s328))
		st64(s1e0, r, u)
		st64(s1f0 + 8, ld64(s308))
		st8(s1f0 + 2, ld64(s308 + 8))
		st8(s1f0 + 1, ld64(s308 + 0x10))
		st8(s1f0, ld64(s308 + 0x18))
		st64(s210 + 0x18, ld64(s308 + 0x20))
		st64(s210 + 0x10, ld64(s310))
		st64(s210 + 8, ld64(s308 + 0x28))
		copyr(s218, s320, 0x10)
		st8(s21f, ae, ad)
		st8(s228 + 8, ld64(s368))
		st64(s228, ld64(s360))
		st64(s240 + 0x10, ld64(s358))
		st64(s240, x, aa)
		st64(s248, ld64(s350))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0xc)
		st64(s168 + 8, 3)
		st64(s1e0 + 0x30, 1)
		st64(s260, 0, 8, 0)
		cp = system_program_create_account(s2c0, s260, ld64(s308 + 0x30), 0x69, ld64(ld64(b + 0x30)))
		af = ld64(s2c0)
		if (af != 2) {
			co = ld64(s2c0 + 8)
			aj = ld64(s308 + 0x40)
			st64(aj + 8, af, co)
			st64(aj, 0)
			return cp
		}
	}
	const cj = ld64(s308 + 0x40)
	cp = fn_9e10(s260, f)
	if (ld64(s260) == 0) {
		const ck = ld64(0x300000000 /* heap bump-allocator cursor */)
		const cm = ck != 0 ? sat_sub(ck, 0x17) : 0x300007fe9
		const cn = ld64(s260 + 0x10)
		const cl = ld64(s260 + 8)
		if (cl != 0) {
			if (0x300000008 > cm) {
				raw_vec_handle_error(1, 0x17, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, cm)
			st64(cm + 0xf, 0x6465746169636f73)
			st64(cm + 8, 0x7373615f746e696d)
			st64(cm, 0x5f74726f70707573)
			void ld64(cn)
		} else {
			if (0x300000008 > cm) {
				raw_vec_handle_error(1, 0x17, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, cm)
			st64(cm + 0xf, 0x6465746169636f73)
			st64(cm + 8, 0x7373615f746e696d)
			st64(cm, 0x5f74726f70707573)
			void ld64(cn)
		}
		st64(cn + 0x10, cm, 0x17)
		st64(cn + 8, 0x17)
		st64(cn, 1)
		st64(cj + 0x10, cn)
		st64(cj + 8, cl)
		st64(cj, 0)
		return cp
	}
	return memcpy(cj, s260, 0x70)
}

export function fn_9e10(a: u64, b: AccountInfo): u64 {
	const s50 = fp - 0x50, s58 = fp - 0x58, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0
	let q, r: u64
	const f = b.owner
	if ((memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0) {
		r = anchor_error_from(sc0, 0xbc4 /* anchor::AccountNotInitialized */)
		q = ld64(sc0)
		st64(a + 0x10, ld64(sc0 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s70, b, g as u32)
		const p = ld64(s70 + 0x10)
		const l = ld64(s70 + 8)
		const k = ld64(s70)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s80 + 8, ld64(l + 8))
			st64(s80, m)
			r = fn_1111c0(s70, s80, 0x800000000000001a /* Ok */)
			const n = ld64(s70 + 0x10)
			const o = ld64(s70 + 8)
			if (ld64(s70) != 0) {
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, 0)
				st64(p, ld64(p) - 1)
				return r
			}
			r = memcpy(a + 0x18, s58, 0x58)
			st64(a + 0x10, n)
			st64(a + 8, o)
			st64(a, b)
			st64(p, ld64(p) - 1)
			return r
		}
		st64(s70, k, l, p)
		r = fn_13e628(sb0, s70)
		q = ld64(sb0)
		st64(a + 0x10, ld64(sb0 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const j = anchor_error_from(s90, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	const i = ld64(s90 + 8)
	const h = ld64(s90)
	copyr(s70, f, 0x20)
	st64(s50, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
	r = Error_with_pubkeys(sa0, h, i, s70, j)
	q = ld64(sa0)
	st64(a + 0x10, ld64(sa0 + 8))
	st64(a + 8, q)
	st64(a, 0)
	return r
}

export function fn_d24d0(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38
	let l, o, p, q, r: u64
	const f = memcmp(0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c, 0x20)
	let m = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, m)
		st64(a, 2)
		return g
	}
	const h = ld64(b + 0x88)
	g = common_is_closed(h)
	m = undef
	if (g != 0) {
		st64(a + 8, m)
		st64(a, 2)
		return g
	}
	const i = ld64(h + 0x10)
	if (ld64(i + 0x10) != 0) {
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		g = fn_13e628(s28, s18)
		m = ld64(s28 + 8)
		r = ld64(s28)
		if (r == 2) {
			st64(a + 8, m)
			st64(a, 2)
			return g
		}
	} else {
		B15: {
			st64(i + 0x10, -1)
			const j = ld64(i + 0x18)
			st64(s18 + 8, ld64(i + 0x20))
			st64(s18, j)
			st64(s18 + 0x10, 0)
			g = fn_13e070(s18, 0x100159330, 8)
			if (g == 0) {
				g = fn_13e070(s18, b + 0xf0, 1)
				if (g == 0) {
					g = fn_13e070(s18, b + 0xd0, 0x20)
					if (g == 0) {
						g = fn_15de8(b + 0x90, s18)
						if (g == 0) {
							m = ld64(i + 0x10) + 1
							st64(i + 0x10, m)
							st64(a + 8, m)
							st64(a, 2)
							return g
						}
					}
				}
				const n = g
				if (2 > (g & 3) - 2) {
					break B15
				}
				if ((n & 3) == 0) {
					break B15
				}
				l = ld64(ld64(g + 7))
				if (l == 0) {
					break B15
				}
			} else {
				const k = g
				if (2 > (g & 3) - 2) {
					break B15
				}
				if ((k & 3) == 0) {
					break B15
				}
				l = ld64(ld64(g + 7))
				if (l == 0) {
					break B15
				}
			}
			callx(l, ld64(g - 1), l)
		}
		g = anchor_error_from(s38, 0xbbc /* anchor::AccountDidNotSerialize */, o, p, q)
		m = ld64(s38 + 8)
		r = ld64(s38)
		st64(i + 0x10, ld64(i + 0x10) + 1)
		if (r == 2) {
			st64(a + 8, m)
			st64(a, 2)
			return g
		}
	}
	const t = r
	const s = ld64(0x300000000 /* heap bump-allocator cursor */)
	const u = s != 0 ? sat_sub(s, 0x17) : 0x300007fe9
	if ((r & 1) != 0) {
		if (0x300000008 > u) {
			raw_vec_handle_error(1, 0x17, 0x10015f8f8, sat_sub(s, 0x17), 0x17 > s)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, u)
		st64(u + 0xf, 0x6465746169636f73)
		st64(u + 8, 0x7373615f746e696d)
		st64(u, 0x5f74726f70707573)
		void ld64(m)
	} else {
		if (0x300000008 > u) {
			raw_vec_handle_error(1, 0x17, 0x10015f8f8, sat_sub(s, 0x17), 0x17 > s)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, u)
		st64(u + 0xf, 0x6465746169636f73)
		st64(u + 8, 0x7373615f746e696d)
		st64(u, 0x5f74726f70707573)
		void ld64(m)
	}
	st64(m + 0x10, u, 0x17)
	st64(m + 8, 0x17)
	st64(m, 1)
	st64(a + 8, m)
	st64(a, t)
	return g
}
