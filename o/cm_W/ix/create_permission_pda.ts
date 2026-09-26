/// <reference path="../lib.d.ts" />
// instruction create_permission_pda
import { anchor_error_from, fn_13e070, fn_13e5a0, fn_13e628, fn_1476d8, fn_147a20, fn_14ed60, fn_153150, fn_153158, fn_154730, fn_4130, fn_88360, memcpy } from '../shared.ts'

// instruction handler: create_permission_pda (discriminator sha256("global:create_permission_pda")[..8] = 0xcab5a989d8028887)
// accounts [idl]: 0 owner [signer, mut], 1 permission_authority, 2 permission [mut, pda], 3 system_program [= 11111111111111111111111111111111]
// args [idl]: (none)
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
export function ix_create_permission_pda(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s118 = fp - 0x118, s130 = fp - 0x130, s248 = fp - 0x248, s260 = fp - 0x260, s270 = fp - 0x270, s271 = fp - 0x271, s288 = fp - 0x288, sff8 = fp - 0xff8
	const f = sol_log("Instruction: CreatePermissionPda", 0x20)
	st64(s270, accounts, accounts_len)
	st64(sff8, s271)
	let n = accounts_create_permission_pda(s130, program_id, s270, undef, fp, f)
	const h = ld64(s130 + 0x10)
	let i = ld64(s130 + 8)
	const g = ld64(s130)
	if (g == 0) {
		st64(a + 8, h)
		st64(a, i)
		return n
	}
	memcpy(s248, s118, 0x118)
	st64(s260, g, i, h)
	const j = ld64(i)
	const m = ld64(j)
	const l = ld64(j + 8)
	const k = ld64(j + 0x10)
	st64(s248 + 0x18, ld64(j + 0x18))
	st64(s248, m, l, k)
	n = fn_da208(s288, s260, program_id)
	i = ld64(s288)
	st64(a + 8, ld64(s288 + 8))
	st64(a, i)
	return n
}

// Anchor Accounts::try_accounts of instruction create_permission_pda (called by ix_create_permission_pda; name [str]: from the handler's "Instruction: …" log; was fn_d74c8)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: owner (ConstraintMut), permission (ConstraintMut, ConstraintRentExempt)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: owner [idl], permission [idl]
export function accounts_create_permission_pda(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s120 = fp - 0x120, s158 = fp - 0x158, s250 = fp - 0x250, s258 = fp - 0x258, s268 = fp - 0x268, s270 = fp - 0x270, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2b1 = fp - 0x2b1, s2d8 = fp - 0x2d8, s2f0 = fp - 0x2f0, s308 = fp - 0x308, s310 = fp - 0x310, s318 = fp - 0x318, s320 = fp - 0x320, s328 = fp - 0x328, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s428 = fp - 0x428, s430 = fp - 0x430, s438 = fp - 0x438, s440 = fp - 0x440
	let j, m, q, v, w: u64
	st64(s428 + 0x10, a)
	st64(s330, b)
	let x = try_accounts_17a30(s270, c, c, d, e, r0)
	const owner: AccountInfo = ld64(s268)
	let f = ld64(s270)
	if (f == 2) {
		let l = ld64(e - 0xff8)
		st64(s328, owner)
		const k = ld64(c + 8)
		if (k != 0) {
			q = ld64(c)
			st64(c, q + 0x30, k - 1)
			st64(s320, q)
			if (k != 1) {
				st64(s428, l, q)
				const r: AccountInfo = ld64(c)
				st64(s318, r)
				st64(c + 8, k - 2)
				st64(c, r + 0x30)
				x = try_accounts_18870(s270, c, q, l, m)
				const u = ld64(s268)
				f = ld64(s270)
				if (f == 2) {
					st64(s310, u)
					rent_get(s270)
					copy(s2f0, s268, 0x18)
					if (ld64(s270) != 0) {
						x = fn_13e628(s3f0, s2f0)
						w = ld64(s3f0)
						v = ld64(s428 + 0x10)
						st64(v + 0x10, ld64(s3f0 + 8))
						st64(v + 8, w)
						st64(v, 0)
						return x
					}
					copyr(s308, s2f0, 0x18)
					const y = ld64(ld64(s428 + 8))
					copyr(s158, y, 0x20)
					st64(s2b0, 0x10015b308, 0xa, s158, 0x20)
					// PDA find_program_address(["permission", *y], program *b)
					Pubkey_find_program_address(s270, s2b0, 2, b)
					copyr(s2d8, s270, 0x20)
					const z = ld8(s250)
					st8(s2b1, z)
					st8(ld64(s428), z)
					const aa = r.key
					copyr(s290, aa, 0x20)
					if ((memcmp(s290, s2d8, 0x20) as u32) == 0) {
						st64(s158, s318, s308, s328, s310, s320, s2b1, s330)
						x = fn_d8800(s270, s158)
						const aj = ld64(s268 + 8)
						const ah = ld64(s268)
						const ag = ld64(s270)
						if (ag == 0) {
							const an = ld64(s428 + 0x10)
							st64(an + 0x10, aj)
							st64(an + 8, ah)
							st64(an, 0)
							return x
						}
						st64(s430, ah, ag)
						memcpy(s120, s258, 0x100)
						const permission: AccountInfo = ld64(s428)
						if (permission.is_writable != 0) {
							st64(s440, aj)
							AccountInfo_clone_f338(s158, permission)
							st64(s438, fn_147a20(s158))
							AccountInfo_clone_f338(s270, permission)
							AccountInfo_try_data_len(s2b0, s270)
							const al = ld64(s2b0 + 8)
							const ak = ld64(s2b0)
							if (ak != 0x800000000000001a /* Ok */) {
								st64(s2b0 + 0x10, ld64(s2b0 + 0x10))
								st64(s2b0, ak, al)
								const aq = fn_13e628(s380, s2b0)
								const ap = ld64(s380)
								const ao = ld64(s428 + 0x10)
								st64(ao + 0x10, ld64(s380 + 8))
								st64(ao + 8, ap)
								st64(ao, 0)
								return ptr_drop_in_place_fcd8(s158, ptr_drop_in_place_fcd8(s270, aq))
							}
							const am = Rent_is_exempt(s308, ld64(s438), al)
							ptr_drop_in_place_fcd8(s158, ptr_drop_in_place_fcd8(s270, am))
							if (am != 0) {
								if (owner.is_writable != 0) {
									const ar = owner.key
									copyr(s20, ar, 0x20)
									if ((memcmp(s20, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) != 0) {
										copyr(s270, ar, 0x20)
										if ((memcmp(s270, 0x100159640 /* key RayzVBPm6p6xtG7fU3KX4k44UexK4NjewDk2QCwoLqa */, 0x20) as u32) != 0) {
											fn_88360(s3d0, 0)
											x = fn_4130(s3e0, ld64(s3d0), ld64(s3d0 + 8), 0x10015b1d0 /* "owner" */, 5)
											w = ld64(s3e0)
											v = ld64(s428 + 0x10)
											st64(v + 0x10, ld64(s3e0 + 8))
											st64(v + 8, w)
											st64(v, 0)
											return x
										}
									}
									const at = ld64(s428 + 0x10)
									x = memcpy(at + 0x28, s120, 0x100)
									st64(at + 0x128, u)
									st64(at + 0x20, ld64(s440))
									st64(at + 0x18, ld64(s430))
									st64(at + 0x10, ld64(s428))
									st64(at + 8, ld64(s428 + 8))
									st64(at, owner)
									return x
								}
								anchor_error_from(s3b0, 0x7d0 /* anchor::ConstraintMut */)
								x = fn_4130(s3c0, ld64(s3b0), ld64(s3b0 + 8), 0x10015b1d0 /* "owner" */, 5)
								w = ld64(s3c0)
								v = ld64(s428 + 0x10)
								st64(v + 0x10, ld64(s3c0 + 8))
								st64(v + 8, w)
								st64(v, 0)
								return x
							}
							anchor_error_from(s390, 0x7d5 /* anchor::ConstraintRentExempt */)
							x = fn_4130(s3a0, ld64(s390), ld64(s390 + 8), 0x10015b308 /* "permission" */, 0xa)
							w = ld64(s3a0)
							v = ld64(s428 + 0x10)
							st64(v + 0x10, ld64(s3a0 + 8))
							st64(v + 8, w)
							st64(v, 0)
							return x
						}
						anchor_error_from(s360, 0x7d0 /* anchor::ConstraintMut */)
						x = fn_4130(s370, ld64(s360), ld64(s360 + 8), 0x10015b308 /* "permission" */, 0xa)
						w = ld64(s370)
						v = ld64(s428 + 0x10)
						st64(v + 0x10, ld64(s370 + 8))
						st64(v + 8, w)
						st64(v, 0)
						return x
					}
					const af = anchor_error_from(s340, 0x7d6 /* anchor::ConstraintSeeds */)
					const ab = ld64(0x300000000 /* heap bump-allocator cursor */)
					const ad = ab != 0 ? sat_sub(ab, 0xa) : 0x300007ff6
					const ae = ld64(s340 + 8)
					const ac = ld64(s340)
					if ((ac & 1) != 0) {
						if (0x300000008 > ad) {
							raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ad)
						st64(ad, 0x697373696d726570)
						st16(ad + 8, 0x6e6f)
						void ld64(ae)
					} else {
						if (0x300000008 > ad) {
							raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ad)
						st64(ad, 0x697373696d726570)
						st16(ad + 8, 0x6e6f)
						void ld64(ae)
					}
					st64(ae + 0x10, ad, 0xa)
					st64(ae + 8, 0xa)
					st64(ae, 1)
					copyr(s270, s290, 0x20)
					copy(s250, s2d8, 0x20)
					x = Error_with_pubkeys(s350, ac, ae, s270, af)
					w = ld64(s350)
					v = ld64(s428 + 0x10)
					st64(v + 0x10, ld64(s350 + 8))
					st64(v + 8, w)
					st64(v, 0)
					return x
				}
				const s = ld64(0x300000000 /* heap bump-allocator cursor */)
				const t = s != 0 ? sat_sub(s, 0xe) : 0x300007ff2
				if ((f & 1) != 0) {
					if (0x300000008 > t) {
						raw_vec_handle_error(1, 0xe, 0x10015f8f8, sat_sub(s, 0xe), 0xe > s)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, t)
					st64(t + 6, 0x6d6172676f72705f)
					st64(t, 0x705f6d6574737973)
					void ld64(u)
				} else {
					if (0x300000008 > t) {
						raw_vec_handle_error(1, 0xe, 0x10015f8f8, sat_sub(s, 0xe), 0xe > s)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, t)
					st64(t + 6, 0x6d6172676f72705f)
					st64(t, 0x705f6d6574737973)
					void ld64(u)
				}
				st64(u + 0x10, t, 0xe)
				st64(u + 8, 0xe)
				st64(u, 1)
				j = ld64(s428 + 0x10)
				st64(j + 0x10, u)
				st64(j + 8, f)
				st64(j, 0)
				return x
			}
		} else {
			x = anchor_error_from(s400, 0xbbd /* anchor::AccountNotEnoughKeys */, undef, l, m)
			q = undef
			l = undef
			f = ld64(s400)
			if (f != 2) {
				const n = ld64(0x300000000 /* heap bump-allocator cursor */)
				const o = n != 0 ? sat_sub(n, 0x14) : 0x300007fec
				const p = ld64(s400 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > o) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > n)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, o)
					st64(o + 8, 0x6f687475615f6e6f)
					st64(o, 0x697373696d726570)
					st32(o + 0x10, 0x79746972)
					void ld64(p)
				} else {
					if (0x300000008 > o) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > n)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, o)
					st64(o + 8, 0x6f687475615f6e6f)
					st64(o, 0x697373696d726570)
					st32(o + 0x10, 0x79746972)
					void ld64(p)
				}
				st64(p + 0x10, o, 0x14)
				st64(p + 8, 0x14)
				st64(p, 1)
				j = ld64(s428 + 0x10)
				st64(j + 0x10, p)
				st64(j + 8, f)
				st64(j, 0)
				return x
			}
		}
		x = anchor_error_from(s410, 0xbbd /* anchor::AccountNotEnoughKeys */, q, l, m)
		w = ld64(s410)
		v = ld64(s428 + 0x10)
		st64(v + 0x10, ld64(s410 + 8))
		st64(v + 8, w)
		st64(v, 0)
		return x
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
		void owner.key
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(g, 5), 5 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 4, 0x72)
		st32(h, 0x656e776f)
		void owner.key
	}
	st64(owner + 0x10, h, 5)
	st64(owner + 8 /* lamports */, 5)
	st64(owner /* key */, 1)
	j = ld64(s428 + 0x10)
	st64(j + 0x10, owner)
	st64(j + 8, f)
	st64(j, 0)
	return x
}

export function fn_d8800(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, se0 = fp - 0xe0, sf0 = fp - 0xf0, s110 = fp - 0x110, s118 = fp - 0x118, s11f = fp - 0x11f, s128 = fp - 0x128, s140 = fp - 0x140, s148 = fp - 0x148, s160 = fp - 0x160, s161 = fp - 0x161, s188 = fp - 0x188, s189 = fp - 0x189, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s220 = fp - 0x220, s228 = fp - 0x228, s248 = fp - 0x248, s268 = fp - 0x268, s280 = fp - 0x280, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s368 = fp - 0x368, s370 = fp - 0x370, s378 = fp - 0x378, s380 = fp - 0x380, s388 = fp - 0x388, s390 = fp - 0x390, s398 = fp - 0x398, s3a0 = fp - 0x3a0, s3a8 = fp - 0x3a8, s3b0 = fp - 0x3b0, s3b8 = fp - 0x3b8, s3c0 = fp - 0x3c0, s3c8 = fp - 0x3c8
	let af, aj, co, cp: u64
	const f: AccountInfo = ld64(ld64(b))
	const g = fn_147a20(f, b, c, d, e)
	st64(s368 + 0x40, a)
	if (g != 0) {
		const j = ld64(b + 0x10)
		const k = ld64(ld64(j))
		copyr(s2c0, k, 0x20)
		const l = f.key
		copy(s298, l + 8, 0x18)
		st64(s2a0, ld64(l))
		if ((memcmp(s2c0, s2a0, 0x20) as u32) == 0) {
			ErrorCode_name(s280, 0x100159890)
			st64(s188, 0, 1, 0)
			st64(s28, s188, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100159890, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(s128, s188, 0x18)
			copy(s140, s280, 0x18)
			st64(s160 + 8, 0x10015b2cc)
			st32(se0 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s110, 2)
			st32(s148, 0xe)
			st64(s160 + 0x10, 0x3c)
			st64(s160, 0)
			const ai = fn_13e5a0(s300, s160)
			const ah = ld64(s300 + 8)
			const ag = ld64(s300)
			copy(s160, s2c0, 0x40)
			cp = Error_with_pubkeys(s310, ag, ah, s160, ai)
			const ak = ld64(s310)
			aj = ld64(s368 + 0x40)
			st64(aj + 0x10, ld64(s310 + 8))
			st64(aj + 8, ak)
			st64(aj, 0)
			return cp
		}
		st64(s368 + 0x38, b)
		const m = max(fn_1476d8(ld64(b + 8), 0x118), 1)
		if (m > g) {
			const n: AccountInfo = ld64(j)
			const o: LamportsCell = n.lamports
			const ap = n.key
			rc_inc(o)
			const al: DataCell = n.data
			rc_inc(al)
			const am: LamportsCell = f.lamports
			st64(s368 + 0x30, am)
			const an = am.strong
			st64(s368, f.key)
			st64(s368 + 8, n.executable)
			st64(s368 + 0x10, n.is_writable)
			st64(s368 + 0x18, n.is_signer)
			st64(s368 + 0x20, n.rent_epoch)
			st64(s368 + 0x28, n.owner)
			rc_inc(ld64(s368 + 0x30), an)
			const ao: DataCell = f.data
			const aq = ld64(s368 + 0x38)
			rc_inc(ao)
			st64(s380, al, ap)
			const ar: AccountInfo = ld64(ld64(aq + 0x18))
			const at: LamportsCell = ar.lamports
			const au = at.strong
			st64(s370, o)
			st64(s3a8, f.executable)
			st64(s3a0, f.is_writable)
			st64(s398, f.is_signer)
			st64(s390, f.rent_epoch)
			const ax = f.owner
			st64(s388, ar.key)
			rc_inc(at, au)
			st64(s3b8, ao)
			const av: DataCell = ar.data
			const aw = av.strong
			st64(s3b0, sat_sub(m, g))
			rc_inc(av, aw)
			st64(s3c0, ar.owner)
			const bb = ar.rent_epoch
			const ba = ar.is_signer
			const az = ar.is_writable
			const ay = ar.executable
			st8(s220 + 0x5a, ld64(s3a8))
			st8(s220 + 0x59, ld64(s3a0))
			st8(s220 + 0x58, ld64(s398))
			st64(s220 + 0x50, ld64(s390))
			st64(s220 + 0x48, ax)
			st64(s220 + 0x40, ld64(s3b8))
			st64(s220 + 0x38, ld64(s368 + 0x30))
			st64(s220 + 0x30, ld64(s368))
			st8(s220 + 0x2a, ld64(s368 + 8))
			st8(s220 + 0x29, ld64(s368 + 0x10))
			st8(s220 + 0x28, ld64(s368 + 0x18))
			st64(s220 + 0x20, ld64(s368 + 0x20))
			st64(s220 + 0x18, ld64(s368 + 0x28))
			st64(s220 + 0x10, ld64(s380))
			copyr(s220, s378, 0x10)
			st8(s228, ba, az, ay)
			st64(s248 + 0x18, bb)
			st64(s248 + 0x10, ld64(s3c0))
			st64(s248, at, av)
			st64(s268 + 0x18, ld64(s388))
			st64(s1c0, 8, 0)
			st64(s268, 0, 8, 0)
			cp = system_program_transfer(s2d0, s268, ld64(s3b0))
			const bc = ld64(s2d0)
			const bd = ld64(s368 + 0x40)
			if (bc != 2) {
				const be = ld64(s2d0 + 8)
				st64(bd + 8, bc, be)
				st64(bd, 0)
				return cp
			}
		}
		const bf: LamportsCell = f.lamports
		const bg = bf.strong
		st64(s368 + 0x30, f.key)
		const bi = ld64(s368 + 0x38)
		rc_inc(bf, bg)
		const bh: DataCell = f.data
		rc_inc(bh)
		st64(s368 + 0x28, bh)
		const bj = ld64(bi + 0x18)
		const bk: AccountInfo = ld64(bj)
		const bl: LamportsCell = bk.lamports
		const bm = bl.strong
		st64(s368, f.executable)
		st64(s368 + 8, f.is_writable)
		st64(s368 + 0x10, f.is_signer)
		st64(s368 + 0x18, f.rent_epoch)
		st64(s368 + 0x20, f.owner)
		const bn = bk.key
		rc_inc(bl, bm)
		st64(s370, bn)
		const bo: DataCell = bk.data
		rc_inc(bo)
		st64(s388, bj)
		st64(s380, bk.owner)
		st64(s378, bf)
		const bu = bk.rent_epoch
		const bt = bk.is_signer
		const bs = bk.is_writable
		const br = bk.executable
		const bp = ld64(ld64(ld64(bi + 0x20)))
		copyr(s1b0, bp, 0x20)
		const bq = ld8(ld64(bi + 0x28))
		st64(s28, s189)
		st64(s48 + 0x10, s1b0)
		st64(s48, 0x10015b308)
		st8(s189, bq)
		st64(s188, s48)
		st64(sf0 + 8, s188)
		st8(sf0, bt, bs, br)
		st64(s110 + 0x18, bu)
		st64(s110 + 0x10, ld64(s380))
		st64(s110, bl, bo)
		st64(s118, ld64(s370))
		st8(s11f + 1, ld64(s368))
		st8(s11f, ld64(s368 + 8))
		st8(s128 + 8, ld64(s368 + 0x10))
		st64(s128, ld64(s368 + 0x18))
		st64(s140 + 0x10, ld64(s368 + 0x20))
		st64(s140 + 8, ld64(s368 + 0x28))
		st64(s140, ld64(s378))
		st64(s148, ld64(s368 + 0x30))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0xa)
		st64(s188 + 8, 3)
		st64(se0, 1)
		st64(s160, 0, 8, 0)
		cp = system_program_assign_13fb30(s2e0, s160, 0x118)
		af = ld64(s2e0)
		if (af != 2) {
			co = ld64(s2e0 + 8)
			aj = ld64(s368 + 0x40)
			st64(aj + 8, af, co)
			st64(aj, 0)
			return cp
		}
		const bv: LamportsCell = f.lamports
		const cd = f.key
		rc_inc(bv)
		const bw: DataCell = f.data
		rc_inc(bw)
		const bx: AccountInfo = ld64(ld64(s388))
		const by: LamportsCell = bx.lamports
		const bz = by.strong
		st64(s368 + 0x18, f.executable)
		st64(s368 + 0x20, f.is_writable)
		st64(s368 + 0x28, f.is_signer)
		st64(s368 + 0x30, f.rent_epoch)
		const cc = f.owner
		st64(s368 + 0x10, bx.key)
		rc_inc(by, bz)
		const ca: DataCell = bx.data
		const cb = ca.strong
		st64(s370, cc, cd, bv)
		rc_inc(ca, cb)
		const ci = bx.owner
		const ch = bx.rent_epoch
		const cg = bx.is_signer
		const cf = bx.is_writable
		const ce = bx.executable
		copyr(s188, s1b0, 0x20)
		st64(s28, s161)
		st64(s48 + 0x10, s188)
		st64(s48, 0x10015b308)
		st8(s161, ld8(s189))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0xa)
		st64(s280, s48, 3)
		st64(sf0 + 8, s280)
		st8(sf0, cg, cf, ce)
		st64(s110, by, ca, ci, ch)
		st64(s118, ld64(s368 + 0x10))
		st8(s11f + 1, ld64(s368 + 0x18))
		st8(s11f, ld64(s368 + 0x20))
		st8(s128 + 8, ld64(s368 + 0x28))
		st64(s128, ld64(s368 + 0x30))
		st64(s140 + 0x10, ld64(s370))
		st64(s140 + 8, bw)
		copyr(s148, s368, 0x10)
		st64(se0, 1)
		st64(s160, 0, 8, 0)
		cp = system_program_assign_13ff40(s2f0, s160, ld64(ld64(ld64(s368 + 0x38) + 0x30)))
		af = ld64(s2f0)
		if (af != 2) {
			co = ld64(s2f0 + 8)
			aj = ld64(s368 + 0x40)
			st64(aj + 8, af, co)
			st64(aj, 0)
			return cp
		}
	} else {
		const p = fn_1476d8(ld64(b + 8), 0x118)
		const h: AccountInfo = ld64(ld64(b + 0x10))
		const i: LamportsCell = h.lamports
		const v = h.key
		rc_inc(i)
		st64(s368 + 0x30, p)
		const q: DataCell = h.data
		rc_inc(q)
		st64(s368 + 0x28, q)
		const r: LamportsCell = f.lamports
		const s = r.strong
		st64(s368, f.key)
		st64(s368 + 8, h.executable)
		st64(s368 + 0x10, h.is_writable)
		st64(s368 + 0x18, h.is_signer)
		st64(s368 + 0x20, h.rent_epoch)
		const t = h.owner
		rc_inc(r, s)
		st64(s370, t)
		const u: DataCell = f.data
		rc_inc(u)
		st64(s380, v, i)
		const w: AccountInfo = ld64(ld64(b + 0x18))
		const x: LamportsCell = w.lamports
		const y = x.strong
		st64(s3a8, f.executable)
		st64(s3a0, f.is_writable)
		st64(s398, f.is_signer)
		st64(s390, f.rent_epoch)
		st64(s388, f.owner)
		const z = w.key
		rc_inc(x, y)
		st64(s3b0, z)
		const aa: DataCell = w.data
		rc_inc(aa)
		st64(s3b8, w.owner)
		st64(s3c0, w.rent_epoch)
		st64(s3c8, w.is_signer)
		const ae = w.is_writable
		const ad = w.executable
		const ab = ld64(ld64(ld64(b + 0x20)))
		copyr(s188, ab, 0x20)
		const ac = ld8(ld64(b + 0x28))
		st64(s28, s161)
		st64(s48 + 0x10, s188)
		st64(s48, 0x10015b308)
		st8(s161, ac)
		st64(s280, s48)
		st64(se0 + 0x28, s280)
		st8(se0 + 0x22, ld64(s3a8))
		st8(se0 + 0x21, ld64(s3a0))
		st8(se0 + 0x20, ld64(s398))
		st64(se0 + 0x18, ld64(s390))
		st64(se0 + 0x10, ld64(s388))
		st64(se0, r, u)
		st64(sf0 + 8, ld64(s368))
		st8(sf0 + 2, ld64(s368 + 8))
		st8(sf0 + 1, ld64(s368 + 0x10))
		st8(sf0, ld64(s368 + 0x18))
		st64(s110 + 0x18, ld64(s368 + 0x20))
		st64(s110 + 0x10, ld64(s370))
		st64(s110 + 8, ld64(s368 + 0x28))
		copyr(s118, s380, 0x10)
		st8(s11f, ae, ad)
		st8(s128 + 8, ld64(s3c8))
		st64(s128, ld64(s3c0))
		st64(s140 + 0x10, ld64(s3b8))
		st64(s140, x, aa)
		st64(s148, ld64(s3b0))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0xa)
		st64(s280 + 8, 3)
		st64(se0 + 0x30, 1)
		st64(s160, 0, 8, 0)
		cp = system_program_create_account(s320, s160, ld64(s368 + 0x30), 0x118, ld64(ld64(b + 0x30)))
		af = ld64(s320)
		if (af != 2) {
			co = ld64(s320 + 8)
			aj = ld64(s368 + 0x40)
			st64(aj + 8, af, co)
			st64(aj, 0)
			return cp
		}
	}
	const cj = ld64(s368 + 0x40)
	cp = fn_9a48(s160, f)
	if (ld64(s160) == 0) {
		const ck = ld64(0x300000000 /* heap bump-allocator cursor */)
		const cm = ck != 0 ? sat_sub(ck, 0xa) : 0x300007ff6
		const cn = ld64(s160 + 0x10)
		const cl = ld64(s160 + 8)
		if (cl != 0) {
			if (0x300000008 > cm) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, cm)
			st64(cm, 0x697373696d726570)
			st16(cm + 8, 0x6e6f)
			void ld64(cn)
		} else {
			if (0x300000008 > cm) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, cm)
			st64(cm, 0x697373696d726570)
			st16(cm + 8, 0x6e6f)
			void ld64(cn)
		}
		st64(cn + 0x10, cm, 0xa)
		st64(cn + 8, 0xa)
		st64(cn, 1)
		st64(cj + 0x10, cn)
		st64(cj + 8, cl)
		st64(cj, 0)
		return cp
	}
	return memcpy(cj, s160, 0x118)
}

export function fn_9a48(a: u64, b: AccountInfo): u64 {
	const sf8 = fp - 0xf8, s100 = fp - 0x100, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168
	let q, r: u64
	const f = b.owner
	if ((memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0) {
		r = anchor_error_from(s168, 0xbc4 /* anchor::AccountNotInitialized */)
		q = ld64(s168)
		st64(a + 0x10, ld64(s168 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s118, b, g as u32)
		const p = ld64(s118 + 0x10)
		const l = ld64(s118 + 8)
		const k = ld64(s118)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s128 + 8, ld64(l + 8))
			st64(s128, m)
			r = fn_10e370(s118, s128, 0x800000000000001a /* Ok */)
			const n = ld64(s118 + 0x10)
			const o = ld64(s118 + 8)
			if (ld64(s118) != 0) {
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, 0)
				st64(p, ld64(p) - 1)
				return r
			}
			r = memcpy(a + 0x18, s100, 0x100)
			st64(a + 0x10, n)
			st64(a + 8, o)
			st64(a, b)
			st64(p, ld64(p) - 1)
			return r
		}
		st64(s118, k, l, p)
		r = fn_13e628(s158, s118)
		q = ld64(s158)
		st64(a + 0x10, ld64(s158 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const j = anchor_error_from(s138, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	const i = ld64(s138 + 8)
	const h = ld64(s138)
	copyr(s118, f, 0x20)
	st64(sf8, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
	r = Error_with_pubkeys(s148, h, i, s118, j)
	q = ld64(s148)
	st64(a + 0x10, ld64(s148 + 8))
	st64(a + 8, q)
	st64(a, 0)
	return r
}

export function fn_10e370(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const sf0 = fp - 0xf0, sf1 = fp - 0xf1, sf8 = fp - 0xf8, s118 = fp - 0x118
	let r, s, t, u, y, z: u64
	const f = ld64(b + 8)
	if (8 > f) {
		fn_153150(8, f, 0x100160a90, d, e)
	}
	B9: {
		if (f - 8 >= 0x20) {
			const g = ld64(b)
			const h = ld64(g + 0xe)
			st8(sf0, ld8(g + 0x16))
			st64(sf8, h)
			const j = ld64(sf8 + 1)
			st64(sf0 + 0xe8, 0)
			let i = f - 0x28
			if (i >= 8) {
				let k = 0
				while (true) {
					const l = ld64(g + 0x28 + k)
					st64(sf8 + k, l)
					const m = ld64(sf0 + 0xe8)
					if (m == -1) {
						fn_154730(0x10015fa18, i, k, m == -1, l)
					}
					st64(sf0 + 0xe8, m + 1)
					if (k == 0xe8) {
						y = ld64(sf8)
						z = memcpy(a + 0x30, sf0, 0xe8)
						st16(s118 + 0x14, ld16(g + 0xc))
						st32(s118 + 0x10, ld32(g + 8))
						const p = ld64(g + 0x17)
						const o = ld64(g + 0x1f)
						const n = ld8(g + 0x27)
						st8(s118 + 0x16, h)
						st8(sf0 + 0x17, n)
						st64(sf0 + 0xf, o)
						st64(s118 + 0x17, j)
						st64(sf1, j, p)
						st64(sf8, ld64(s118 + 0x10))
						st64(a + 0x20, ld64(sf0 + 0x10))
						st64(a + 0x18, ld64(sf0 + 8))
						st64(a + 0x10, ld64(sf0))
						st64(a + 8, ld64(sf8))
						st64(a + 0x28, y)
						st64(a, 0)
						return z
					}
					i = i - 8
					k = k + 8
					if (8 > i) {
						const aa = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
						r = aa
						if (0x1f > m + 1) {
							break B9
						}
						fn_153158(m + 1, 0x1e, 0x10015f7e8, t, u)
					}
				}
			}
		}
		const q = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		r = q
	}
	st64(s118 + 0x10, r)
	z = anchor_error_from(s118, 0xbbb /* anchor::AccountDidNotDeserialize */, s, t, u)
	y = ld64(s118 + 8)
	const x = ld64(s118)
	const v = r
	if (2 > (r & 3) - 2) {
		st64(a + 8, x, y)
		st64(a, 1)
		return z
	}
	if ((v & 3) == 0) {
		st64(a + 8, x, y)
		st64(a, 1)
		return z
	}
	const w = ld64(ld64(r + 7))
	if (w == 0) {
		st64(a + 8, x, y)
		st64(a, 1)
		return z
	}
	z = callx(w, ld64(r - 1), w)
	st64(a + 8, x, y)
	st64(a, 1)
	return z
}

export function fn_da208(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40
	let l, p, q, r, s: u64
	const f = memcmp(0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c, 0x20)
	let o = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return g
	}
	const h = ld64(b + 0x10)
	g = common_is_closed(h)
	o = undef
	if (g != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return g
	}
	let i = ld64(h + 0x10)
	if (ld64(i + 0x10) != 0) {
		st64(s20, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		g = fn_13e628(s30, s20)
		o = ld64(s30 + 8)
		s = ld64(s30)
		if (s == 2) {
			st64(a + 8, o)
			st64(a, 2)
			return g
		}
	} else {
		B16: {
			st64(i + 0x10, -1)
			const j = ld64(i + 0x18)
			st64(s20 + 8, ld64(i + 0x20))
			st64(s20, j)
			st64(s20 + 0x10, 0)
			g = fn_13e070(s20, 0x1001592f0, 8)
			if (g == 0) {
				const w = i
				g = fn_13e070(s20, b + 0x18, 0x20)
				if (g == 0) {
					let m = 0
					do {
						if (m == 0xf0) {
							o = ld64(w + 0x10) + 1
							st64(w + 0x10, o)
							st64(a + 8, o)
							st64(a, 2)
							return g
						}
						st64(s8, ld64(b + 0x38 + m))
						g = fn_13e070(s20, s8, 8)
						m = m + 8
					} while (g == 0)
				}
				const n = g
				i = w
				if (2 > (g & 3) - 2) {
					break B16
				}
				if ((n & 3) == 0) {
					break B16
				}
				l = ld64(ld64(g + 7))
				if (l == 0) {
					break B16
				}
			} else {
				const k = g
				if (2 > (g & 3) - 2) {
					break B16
				}
				if ((k & 3) == 0) {
					break B16
				}
				l = ld64(ld64(g + 7))
				if (l == 0) {
					break B16
				}
			}
			callx(l, ld64(g - 1), l)
		}
		g = anchor_error_from(s40, 0xbbc /* anchor::AccountDidNotSerialize */, p, q, r)
		o = ld64(s40 + 8)
		s = ld64(s40)
		st64(i + 0x10, ld64(i + 0x10) + 1)
		if (s == 2) {
			st64(a + 8, o)
			st64(a, 2)
			return g
		}
	}
	const u = s
	const t = ld64(0x300000000 /* heap bump-allocator cursor */)
	const v = t != 0 ? sat_sub(t, 0xa) : 0x300007ff6
	if ((s & 1) != 0) {
		if (0x300000008 > v) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, sat_sub(t, 0xa), 0xa > t)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, v)
		st64(v, 0x697373696d726570)
		st16(v + 8, 0x6e6f)
		void ld64(o)
	} else {
		if (0x300000008 > v) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, sat_sub(t, 0xa), 0xa > t)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, v)
		st64(v, 0x697373696d726570)
		st16(v + 8, 0x6e6f)
		void ld64(o)
	}
	st64(o + 0x10, v, 0xa)
	st64(o + 8, 0xa)
	st64(o, 1)
	st64(a + 8, o)
	st64(a, u)
	return g
}
