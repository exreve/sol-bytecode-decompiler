/// <reference path="../lib.d.ts" />
// instruction create_amm_config
import { anchor_error_from, fn_10b930, fn_13e5a0, fn_13e628, fn_1476d8, fn_147a20, fn_14ed60, fn_154730, fn_154e18, fn_26a0, fn_4130, fn_88360, fn_aa20, log_data, memcpy } from '../shared.ts'

// instruction handler: create_amm_config (discriminator sha256("global:create_amm_config")[..8] = 0x686c75d7d4ed3489)
// accounts [idl]: 0 owner [signer, mut, = GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ], 1 amm_config [mut, pda], 2 system_program [= 11111111111111111111111111111111]
// args [idl]: index: u16, tick_spacing: u16, trade_fee_rate: u32, protocol_fee_rate: u32, fund_fee_rate: u32
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, index, tick_spacing, trade_fee_rate, fund_fee_rate, protocol_fee_rate
export function ix_create_amm_config(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s70 = fp - 0x70, s78 = fp - 0x78, s88 = fp - 0x88, sf8 = fp - 0xf8, s110 = fp - 0x110, s120 = fp - 0x120, s121 = fp - 0x121, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s1000 = fp - 0x1000
	let k, n: u64
	const h = sol_log("Instruction: CreateAmmConfig", 0x1c)
	const f = ix_args_len
	if (f >= 2 && ((f & -2) != 2 && ((f & -4) != 4 && (f & -4 | 4) != 0xc))) {
		const args: CreateAmmConfigArgs = ix_args
		const index = args.index
		const tick_spacing = args.tick_spacing
		const trade_fee_rate = args.trade_fee_rate
		const fund_fee_rate = args.fund_fee_rate
		const protocol_fee_rate = args.protocol_fee_rate
		st8(s121, 0xff)
		st64(s120, accounts, accounts_len)
		st64(s1000, f, s121)
		n = accounts_create_amm_config(s88, program_id, s120, args, fp, h)
		const j = ld64(s78)
		k = ld64(s88 + 8)
		const i = ld64(s88)
		if (i == 0) {
			st64(a + 8, j)
			st64(a, k)
			return n
		}
		memcpy(sf8, s70, 0x70)
		st64(s110, i, k, j)
		st8(s70 + 8, ld8(s121))
		copyr(s78, s120, 0x10)
		st64(s88, program_id, s110)
		st64(s1000, trade_fee_rate, protocol_fee_rate, fund_fee_rate)
		n = fn_4b0e0(s138, s88, index, tick_spacing, fp)
		k = ld64(s138)
		if (k == 2) {
			n = fn_c4d20(s148, s110, program_id)
			k = ld64(s148)
			st64(a + 8, ld64(s148 + 8))
			st64(a, k)
			return n
		}
		st64(a + 8, ld64(s138 + 8))
		st64(a, k)
		return n
	}
	const l = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (l & 3) - 2) {
		n = anchor_error_from(s158, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s158)
		st64(a + 8, ld64(s158 + 8))
		st64(a, k)
		return n
	}
	if ((l & 3) == 0) {
		n = anchor_error_from(s158, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s158)
		st64(a + 8, ld64(s158 + 8))
		st64(a, k)
		return n
	}
	const m = ld64(ld64(l + 7))
	if (m == 0) {
		n = anchor_error_from(s158, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s158)
		st64(a + 8, ld64(s158 + 8))
		st64(a, k)
		return n
	}
	callx(m, ld64(l - 1), m)
	n = anchor_error_from(s158, 0x66 /* anchor::InstructionDidNotDeserialize */)
	k = ld64(s158)
	st64(a + 8, ld64(s158 + 8))
	st64(a, k)
	return n
}

// Anchor Accounts::try_accounts of instruction create_amm_config (called by ix_create_amm_config; name [str]: from the handler's "Instruction: …" log; was fn_c2220)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: owner (ConstraintMut), amm_config (ConstraintMut, ConstraintRentExempt)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: owner [idl], amm_config [idl]
export function accounts_create_amm_config(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s38 = fp - 0x38, s98 = fp - 0x98, sd0 = fp - 0xd0, s128 = fp - 0x128, s130 = fp - 0x130, s140 = fp - 0x140, s148 = fp - 0x148, s168 = fp - 0x168, s169 = fp - 0x169, s190 = fp - 0x190, s1a8 = fp - 0x1a8, s1c0 = fp - 0x1c0, s1c8 = fp - 0x1c8, s1d0 = fp - 0x1d0, s1d8 = fp - 0x1d8, s1da = fp - 0x1da, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e0 = fp - 0x2e0, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, s300 = fp - 0x300
	let i, s, ad, ae: u64
	let h = a
	st64(s1e8, b)
	if (ld64(e - 0x1000) > 1) {
		st64(s2e0, h)
		st64(s2e8, ld64(e - 0xff8))
		const j = ld16(d)
		st16(s1da, j)
		s = try_accounts_17a30(s148, c, c, d, e, r0)
		const owner: AccountInfo = ld64(s140)
		const k = ld64(s148)
		if (k == 2) {
			st64(s1d8, owner)
			const m = ld64(c + 8)
			if (m == 0) {
				s = anchor_error_from(s2c8, 0xbbd /* anchor::AccountNotEnoughKeys */)
				ae = ld64(s2c8)
				ad = ld64(s2e0)
				st64(ad + 0x10, ld64(s2c8 + 8))
				st64(ad + 8, ae)
				st64(ad, 0)
				return s
			}
			const n: AccountInfo = ld64(c)
			st64(s1d0, n)
			st64(c + 8, m - 1)
			st64(s2f0, n)
			st64(c, n + 0x30)
			try_accounts_18870(s148, c)
			const r = ld64(s140)
			const o = ld64(s148)
			if (o == 2) {
				st64(s1c8, r)
				rent_get(s148)
				copy(s1a8, s140, 0x18)
				if (ld64(s148) != 0) {
					s = fn_13e628(s2b8, s1a8)
					ae = ld64(s2b8)
					ad = ld64(s2e0)
					st64(ad + 0x10, ld64(s2b8 + 8))
					st64(ad + 8, ae)
					st64(ad, 0)
					return s
				}
				copyr(s1c0, s1a8, 0x18)
				st64(sd0 + 0x10, s18)
				st64(sd0, 0x10015af4d)
				st16(s18, bswap16(j))
				st64(sd0 + 0x18, 2)
				st64(sd0 + 8, 0xa)
				// PDA find_program_address(["amm_config", u16 bswap16(j) [ix data?]], program *b)
				Pubkey_find_program_address(s148, sd0, 2, b)
				copyr(s190, s148, 0x20)
				const w = ld8(s128)
				st8(s169, w)
				st8(ld64(s2e8), w)
				const x = ld64(ld64(s2f0))
				copyr(s168, x, 0x20)
				if ((memcmp(s168, s190, 0x20) as u32) == 0) {
					st64(sd0, s1d0, s1c0, s1d8, s1c8, s1da, s169, s1e8)
					s = fn_c3400(s148, sd0)
					const ah = ld64(s140 + 8)
					st64(s2e8, ld64(s140))
					const af = ld64(s148)
					if (af == 0) {
						const al = ld64(s2e0)
						st64(al + 0x10, ah)
						st64(al + 8, ld64(s2e8))
						st64(al, 0)
						return s
					}
					st64(s2f0, af)
					memcpy(s98, s130, 0x60)
					const amm_config: AccountInfo = ld64(s2f0)
					if (amm_config.is_writable != 0) {
						st64(s300, ah)
						AccountInfo_clone_f338(sd0, amm_config)
						st64(s2f8, fn_147a20(sd0))
						AccountInfo_clone_f338(s148, amm_config)
						AccountInfo_try_data_len(s18, s148)
						const aj = ld64(s18 + 8)
						const ai = ld64(s18)
						if (ai != 0x800000000000001a /* Ok */) {
							st64(s18 + 0x10, ld64(s18 + 0x10))
							st64(s18, ai, aj)
							const ao = fn_13e628(s238, s18)
							const an = ld64(s238)
							const am = ld64(s2e0)
							st64(am + 0x10, ld64(s238 + 8))
							st64(am + 8, an)
							st64(am, 0)
							return ptr_drop_in_place_fcd8(sd0, ptr_drop_in_place_fcd8(s148, ao))
						}
						const ak = Rent_is_exempt(s1c0, ld64(s2f8), aj)
						ptr_drop_in_place_fcd8(sd0, ptr_drop_in_place_fcd8(s148, ak))
						if (ak != 0) {
							if (owner.is_writable != 0) {
								const ap = owner.key
								copyr(s38, ap, 0x20)
								if ((memcmp(s38, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) != 0) {
									fn_88360(s288, 0)
									const au = fn_4130(s298, ld64(s288), ld64(s288 + 8), 0x10015b1d0 /* "owner" */, 5)
									const at = ld64(s298 + 8)
									const ar = ld64(s298)
									copyr(s148, s38, 0x20)
									st64(s128, 0xa6bd3bcb652bb6e5, 0x648eee6fe68868f5, 0xb1880f9c196055dc, 0xa18a9e05bd73e21f) // key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ
									s = Error_with_pubkeys(s2a8, ar, at, s148, au)
									ae = ld64(s2a8)
									ad = ld64(s2e0)
									st64(ad + 0x10, ld64(s2a8 + 8))
									st64(ad + 8, ae)
									st64(ad, 0)
									return s
								}
								const aq = ld64(s2e0)
								s = memcpy(aq + 0x20, s98, 0x60)
								st64(aq + 0x80, r)
								st64(aq + 0x18, ld64(s300))
								st64(aq + 0x10, ld64(s2e8))
								st64(aq + 8, ld64(s2f0))
								st64(aq, owner)
								return s
							}
							anchor_error_from(s268, 0x7d0 /* anchor::ConstraintMut */)
							s = fn_4130(s278, ld64(s268), ld64(s268 + 8), 0x10015b1d0 /* "owner" */, 5)
							ae = ld64(s278)
							ad = ld64(s2e0)
							st64(ad + 0x10, ld64(s278 + 8))
							st64(ad + 8, ae)
							st64(ad, 0)
							return s
						}
						anchor_error_from(s248, 0x7d5 /* anchor::ConstraintRentExempt */)
						s = fn_4130(s258, ld64(s248), ld64(s248 + 8), 0x10015af4d /* "amm_config" */, 0xa)
						ae = ld64(s258)
						ad = ld64(s2e0)
						st64(ad + 0x10, ld64(s258 + 8))
						st64(ad + 8, ae)
						st64(ad, 0)
						return s
					}
					anchor_error_from(s218, 0x7d0 /* anchor::ConstraintMut */)
					s = fn_4130(s228, ld64(s218), ld64(s218 + 8), 0x10015af4d /* "amm_config" */, 0xa)
					ae = ld64(s228)
					ad = ld64(s2e0)
					st64(ad + 0x10, ld64(s228 + 8))
					st64(ad + 8, ae)
					st64(ad, 0)
					return s
				}
				const ac = anchor_error_from(s1f8, 0x7d6 /* anchor::ConstraintSeeds */)
				const y = ld64(0x300000000 /* heap bump-allocator cursor */)
				h = ld64(s2e0)
				const aa = y != 0 ? sat_sub(y, 0xa) : 0x300007ff6
				const ab = ld64(s1f8 + 8)
				const z = ld64(s1f8)
				if ((z & 1) != 0) {
					if (0x300000008 > aa) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, aa)
					st64(aa, 0x666e6f635f6d6d61)
					st16(aa + 8, 0x6769)
					void ld64(ab)
				} else {
					if (0x300000008 > aa) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, aa)
					st64(aa, 0x666e6f635f6d6d61)
					st16(aa + 8, 0x6769)
					void ld64(ab)
				}
				st64(ab + 0x10, aa, 0xa)
				st64(ab + 8, 0xa)
				st64(ab, 1)
				copyr(s148, s168, 0x20)
				copy(s128, s190, 0x20)
				s = Error_with_pubkeys(s208, z, ab, s148, ac)
				i = ld64(s208)
				st64(h + 0x10, ld64(s208 + 8))
				st64(h + 8, i)
				st64(h, 0)
				return s
			}
			const p = ld64(0x300000000 /* heap bump-allocator cursor */)
			s = ld64(s2e0)
			const q = p != 0 ? sat_sub(p, 0xe) : 0x300007ff2
			if ((o & 1) != 0) {
				if (0x300000008 > q) {
					raw_vec_handle_error(1, 0xe, 0x10015f8f8, sat_sub(p, 0xe), 0xe > p)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, q)
				st64(q + 6, 0x6d6172676f72705f)
				st64(q, 0x705f6d6574737973)
				void ld64(r)
			} else {
				if (0x300000008 > q) {
					raw_vec_handle_error(1, 0xe, 0x10015f8f8, sat_sub(p, 0xe), 0xe > p)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, q)
				st64(q + 6, 0x6d6172676f72705f)
				st64(q, 0x705f6d6574737973)
				void ld64(r)
			}
			st64(r + 0x10, q, 0xe)
			st64(r + 8, 0xe)
			st64(r, 1)
			st64(s + 0x10, r)
			st64(s + 8, o)
			st64(s, 0)
			return s
		}
		const t = ld64(0x300000000 /* heap bump-allocator cursor */)
		const u = t != 0 ? sat_sub(t, 5) : 0x300007ffb
		if ((k & 1) != 0) {
			if (0x300000008 > u) {
				raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(t, 5), 5 > t)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, u)
			st8(u + 4, 0x72)
			st32(u, 0x656e776f)
			void owner.key
		} else {
			if (0x300000008 > u) {
				raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(t, 5), 5 > t)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, u)
			st8(u + 4, 0x72)
			st32(u, 0x656e776f)
			void owner.key
		}
		st64(owner + 0x10, u, 5)
		st64(owner + 8 /* lamports */, 5)
		st64(owner /* key */, 1)
		const v = ld64(s2e0)
		st64(v + 0x10, owner)
		st64(v + 8, k)
		st64(v, 0)
		return s
	}
	const f = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (f & 3) - 2) {
		s = anchor_error_from(s2d8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s2d8)
		st64(h + 0x10, ld64(s2d8 + 8))
		st64(h + 8, i)
		st64(h, 0)
		return s
	}
	if ((f & 3) == 0) {
		s = anchor_error_from(s2d8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s2d8)
		st64(h + 0x10, ld64(s2d8 + 8))
		st64(h + 8, i)
		st64(h, 0)
		return s
	}
	const g = ld64(ld64(f + 7))
	if (g == 0) {
		s = anchor_error_from(s2d8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s2d8)
		st64(h + 0x10, ld64(s2d8 + 8))
		st64(h + 8, i)
		st64(h, 0)
		return s
	}
	callx(g, ld64(f - 1), g)
	s = anchor_error_from(s2d8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	i = ld64(s2d8)
	st64(h + 0x10, ld64(s2d8 + 8))
	st64(h + 8, i)
	st64(h, 0)
	return s
}

export function fn_c3400(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s61 = fp - 0x61, s62 = fp - 0x62, s78 = fp - 0x78, se0 = fp - 0xe0, s100 = fp - 0x100, s120 = fp - 0x120, s138 = fp - 0x138, s150 = fp - 0x150, s158 = fp - 0x158, s178 = fp - 0x178, s1a8 = fp - 0x1a8, s1c0 = fp - 0x1c0, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s1f8 = fp - 0x1f8, s210 = fp - 0x210, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2e0 = fp - 0x2e0, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s320 = fp - 0x320, s328 = fp - 0x328, s330 = fp - 0x330, s338 = fp - 0x338
	let ae, ai, cp, cq: u64
	const f: AccountInfo = ld64(ld64(b))
	const g = fn_147a20(f, b, c, d, e)
	st64(s2a0, b, a)
	if (g != 0) {
		const k = ld64(b + 0x10)
		const l = ld64(ld64(k))
		copyr(s178, l, 0x20)
		const m = f.key
		copy(s150, m + 8, 0x18)
		st64(s158, ld64(m))
		if ((memcmp(s178, s158, 0x20) as u32) == 0) {
			ErrorCode_name(s138, 0x100159890)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100159890, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(s1f8, s60, 0x18)
			copy(s210, s138, 0x18)
			st64(s230 + 8, 0x10015a152)
			st32(s1a8 + 0x10, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s1e0, 2)
			st32(s230 + 0x18, 6)
			st64(s230 + 0x10, 0x38)
			st64(s230, 0)
			const ah = fn_13e5a0(s270, s230)
			const ag = ld64(s270 + 8)
			const af = ld64(s270)
			copy(s230, s178, 0x40)
			cq = Error_with_pubkeys(s280, af, ag, s230, ah)
			const aj = ld64(s280)
			ai = ld64(s2a0 + 8)
			st64(ai + 0x10, ld64(s280 + 8))
			st64(ai + 8, aj)
			st64(ai, 0)
			return cq
		}
		const n = max(fn_1476d8(ld64(b + 8), 0x75), 1)
		if (n > g) {
			const o: AccountInfo = ld64(k)
			const p: LamportsCell = o.lamports
			const av = o.key
			const ap = ld64(s2a0)
			rc_inc(p)
			const ak: DataCell = o.data
			rc_inc(ak)
			st64(s2e0 + 0x30, sat_sub(n, g))
			const al: LamportsCell = f.lamports
			st64(s2e0 + 0x38, al)
			const am = al.strong
			st64(s2e0, f.key)
			st64(s2e0 + 8, o.executable)
			st64(s2e0 + 0x10, o.is_writable)
			st64(s2e0 + 0x18, o.is_signer)
			st64(s2e0 + 0x20, o.rent_epoch)
			st64(s2e0 + 0x28, o.owner)
			rc_inc(ld64(s2e0 + 0x38), am)
			const an: DataCell = f.data
			const ao = an.strong
			st64(s2e8, ak)
			rc_inc(an, ao)
			const aq: AccountInfo = ld64(ld64(ap + 0x18))
			const ar: LamportsCell = aq.lamports
			const at = ar.strong
			st64(s320 + 0x10, f.executable)
			st64(s320 + 0x18, f.is_writable)
			st64(s320 + 0x20, f.is_signer)
			st64(s320 + 0x28, f.rent_epoch)
			st64(s2f0, f.owner)
			const au = aq.key
			rc_inc(ar, at)
			st64(s320, au, av)
			const aw: DataCell = aq.data
			rc_inc(aw)
			st64(s328, aq.owner)
			const ba = aq.rent_epoch
			const az = aq.is_signer
			const ay = aq.is_writable
			const ax = aq.executable
			st8(se0 + 0x62, ld64(s320 + 0x10))
			st8(se0 + 0x61, ld64(s320 + 0x18))
			st8(se0 + 0x60, ld64(s320 + 0x20))
			st64(se0 + 0x58, ld64(s320 + 0x28))
			st64(se0 + 0x50, ld64(s2f0))
			st64(se0 + 0x48, an)
			st64(se0 + 0x40, ld64(s2e0 + 0x38))
			st64(se0 + 0x38, ld64(s2e0))
			st8(se0 + 0x32, ld64(s2e0 + 8))
			st8(se0 + 0x31, ld64(s2e0 + 0x10))
			st8(se0 + 0x30, ld64(s2e0 + 0x18))
			st64(se0 + 0x28, ld64(s2e0 + 0x20))
			st64(se0 + 0x20, ld64(s2e0 + 0x28))
			st64(se0 + 0x18, ld64(s2e8))
			st64(se0 + 0x10, p)
			st64(se0 + 8, ld64(s320 + 8))
			st8(se0, az, ay, ax)
			st64(s100 + 0x18, ba)
			st64(s100 + 0x10, ld64(s328))
			st64(s100, ar, aw)
			st64(s120 + 0x18, ld64(s320))
			st64(s78, 8, 0)
			st64(s120, 0, 8, 0)
			cq = system_program_transfer(s240, s120, ld64(s2e0 + 0x30))
			ae = ld64(s240)
			if (ae != 2) {
				cp = ld64(s240 + 8)
				ai = ld64(s2a0 + 8)
				st64(ai + 8, ae, cp)
				st64(ai, 0)
				return cq
			}
		}
		const bb: LamportsCell = f.lamports
		const bc = bb.strong
		st64(s2e0 + 0x38, f.key)
		const be = ld64(s2a0)
		rc_inc(bb, bc)
		const bd: DataCell = f.data
		rc_inc(bd)
		const bf = ld64(be + 0x18)
		const bg: AccountInfo = ld64(bf)
		const bh: LamportsCell = bg.lamports
		const bi = bh.strong
		st64(s2e0 + 0x10, f.executable)
		st64(s2e0 + 0x18, f.is_writable)
		st64(s2e0 + 0x20, f.is_signer)
		st64(s2e0 + 0x28, f.rent_epoch)
		st64(s2e0 + 0x30, f.owner)
		const bk = bg.key
		rc_inc(bh, bi)
		st64(s2e0 + 8, bd)
		const bj: DataCell = bg.data
		rc_inc(bj)
		st64(s2f0, bf)
		const bs = bg.owner
		st64(s2e0, bb)
		const br = bg.rent_epoch
		st64(s2e8, bk)
		const bq = bg.is_signer
		const bp = bg.is_writable
		const bo = bg.executable
		const bl = ld64(s2a0)
		const bm = ld16(ld64(bl + 0x20))
		st64(s320 + 0x28, bswap16(bm))
		st16(s138, bswap16(bm))
		const bn = ld8(ld64(bl + 0x28))
		st64(s28, s62)
		st64(s48 + 0x10, s138)
		st64(s48, 0x10015af4d)
		st8(s62, bn)
		st64(s60, s48)
		st64(s1c0 + 8, s60)
		st8(s1c0, bq, bp, bo)
		st64(s1e0, bh, bj, bs, br)
		st64(s1f8 + 0x10, ld64(s2e8))
		st8(s1f8 + 0xa, ld64(s2e0 + 0x10))
		st8(s1f8 + 9, ld64(s2e0 + 0x18))
		st8(s1f8 + 8, ld64(s2e0 + 0x20))
		st64(s1f8, ld64(s2e0 + 0x28))
		st64(s210 + 0x10, ld64(s2e0 + 0x30))
		copyr(s210, s2e0, 0x10)
		st64(s230 + 0x18, ld64(s2e0 + 0x38))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 2)
		st64(s48 + 8, 0xa)
		st64(s60 + 8, 3)
		st64(s1c0 + 0x10, 1)
		st64(s230, 0, 8, 0)
		cq = system_program_assign_13fb30(s250, s230, 0x75)
		ae = ld64(s250)
		if (ae != 2) {
			cp = ld64(s250 + 8)
			ai = ld64(s2a0 + 8)
			st64(ai + 8, ae, cp)
			st64(ai, 0)
			return cq
		}
		const bt: LamportsCell = f.lamports
		const bv = ld64(s2f0)
		const bz = f.key
		rc_inc(bt)
		const bu: DataCell = f.data
		rc_inc(bu)
		st64(s2e0 + 0x30, bu)
		const bw: AccountInfo = ld64(bv)
		const bx: LamportsCell = bw.lamports
		const by = bx.strong
		st64(s2e0 + 0x38, bz)
		st64(s2e0 + 0x20, f.executable)
		st64(s2e0 + 0x28, f.is_writable)
		const cc = f.is_signer
		const cd = f.rent_epoch
		const cj = f.owner
		st64(s2e0 + 0x18, bw.key)
		rc_inc(bx, by)
		const ca: DataCell = bw.data
		const cb = ca.strong
		st64(s2e0, cc, cd, bt)
		rc_inc(ca, cb)
		const ci = bw.owner
		const ch = bw.rent_epoch
		const cg = bw.is_signer
		const cf = bw.is_writable
		const ce = bw.executable
		st16(s138, ld64(s320 + 0x28))
		st64(s1c0 + 8, s60)
		st8(s1c0, cg, cf, ce)
		st64(s1e0, bx, ca, ci, ch)
		st64(s1f8 + 0x10, ld64(s2e0 + 0x18))
		st8(s1f8 + 0xa, ld64(s2e0 + 0x20))
		st8(s1f8 + 9, ld64(s2e0 + 0x28))
		st8(s1f8 + 8, ld64(s2e0))
		st64(s1f8, ld64(s2e0 + 8))
		st64(s210 + 0x10, cj)
		st64(s210 + 8, ld64(s2e0 + 0x30))
		st64(s210, ld64(s2e0 + 0x10))
		st64(s230 + 0x18, ld64(s2e0 + 0x38))
		st64(s60, s48)
		st64(s28, s61)
		st64(s48 + 0x10, s138)
		st64(s48, 0x10015af4d)
		st8(s61, ld8(s62))
		st64(s1c0 + 0x10, 1)
		st64(s230, 0, 8, 0)
		st64(s60 + 8, 3)
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 2)
		st64(s48 + 8, 0xa)
		cq = system_program_assign_13ff40(s260, s230, ld64(ld64(ld64(s2a0) + 0x30)))
		ae = ld64(s260)
		if (ae != 2) {
			cp = ld64(s260 + 8)
			ai = ld64(s2a0 + 8)
			st64(ai + 8, ae, cp)
			st64(ai, 0)
			return cq
		}
	} else {
		st64(s2e0 + 0x38, fn_1476d8(ld64(b + 8), 0x75))
		const h: AccountInfo = ld64(ld64(b + 0x10))
		const i: LamportsCell = h.lamports
		const j = i.strong
		st64(s2e0 + 0x30, h.key)
		rc_inc(i, j)
		const q: DataCell = h.data
		rc_inc(q)
		const r: LamportsCell = f.lamports
		const s = r.strong
		st64(s2e0 + 8, f.key)
		st64(s2e0 + 0x10, h.executable)
		st64(s2e0 + 0x18, h.is_writable)
		st64(s2e0 + 0x20, h.is_signer)
		st64(s2e0 + 0x28, h.rent_epoch)
		const t = h.owner
		rc_inc(r, s)
		st64(s2e0, t)
		const u: DataCell = f.data
		rc_inc(u)
		st64(s2f0, r, q)
		const v: AccountInfo = ld64(ld64(b + 0x18))
		const w: LamportsCell = v.lamports
		const x = w.strong
		st64(s320 + 0x10, f.executable)
		st64(s320 + 0x18, f.is_writable)
		st64(s320 + 0x20, f.is_signer)
		st64(s320 + 0x28, f.rent_epoch)
		const ac = f.owner
		const y = v.key
		rc_inc(w, x)
		st64(s320 + 8, y)
		const z: DataCell = v.data
		rc_inc(z)
		st64(s320, v.owner)
		st64(s328, v.rent_epoch)
		st64(s330, v.is_signer)
		st64(s338, v.is_writable)
		const ad = v.executable
		const aa = ld64(s2a0)
		st16(s138, bswap16(ld16(ld64(aa + 0x20))))
		const ab = ld8(ld64(aa + 0x28))
		st64(s28, s61)
		st64(s48 + 0x10, s138)
		st64(s48, 0x10015af4d)
		st8(s61, ab)
		st64(s60, s48)
		st64(s1a8 + 0x20, s60)
		st8(s1a8 + 0x1a, ld64(s320 + 0x10))
		st8(s1a8 + 0x19, ld64(s320 + 0x18))
		st8(s1a8 + 0x18, ld64(s320 + 0x20))
		st64(s1a8 + 0x10, ld64(s320 + 0x28))
		st64(s1a8, u, ac)
		st64(s1c0 + 0x10, ld64(s2f0))
		st64(s1c0 + 8, ld64(s2e0 + 8))
		st8(s1c0 + 2, ld64(s2e0 + 0x10))
		st8(s1c0 + 1, ld64(s2e0 + 0x18))
		st8(s1c0, ld64(s2e0 + 0x20))
		st64(s1d8 + 0x10, ld64(s2e0 + 0x28))
		copyr(s1d8, s2e8, 0x10)
		st64(s1e0, i)
		st64(s1f8 + 0x10, ld64(s2e0 + 0x30))
		st8(s1f8 + 0xa, ad)
		st8(s1f8 + 9, ld64(s338))
		st8(s1f8 + 8, ld64(s330))
		st64(s1f8, ld64(s328))
		st64(s210 + 0x10, ld64(s320))
		st64(s210, w, z)
		st64(s230 + 0x18, ld64(s320 + 8))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 2)
		st64(s48 + 8, 0xa)
		st64(s60 + 8, 3)
		st64(s1a8 + 0x28, 1)
		st64(s230, 0, 8, 0)
		cq = system_program_create_account(s290, s230, ld64(s2e0 + 0x38), 0x75, ld64(ld64(aa + 0x30)))
		ae = ld64(s290)
		if (ae != 2) {
			cp = ld64(s290 + 8)
			ai = ld64(s2a0 + 8)
			st64(ai + 8, ae, cp)
			st64(ai, 0)
			return cq
		}
	}
	const ck = ld64(s2a0 + 8)
	cq = fn_86f8(s230, f)
	if (ld64(s230) == 0) {
		const cl = ld64(0x300000000 /* heap bump-allocator cursor */)
		const cn = cl != 0 ? sat_sub(cl, 0xa) : 0x300007ff6
		const co = ld64(s230 + 0x10)
		const cm = ld64(s230 + 8)
		if (cm != 0) {
			if (0x300000008 > cn) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, cn)
			st64(cn, 0x666e6f635f6d6d61)
			st16(cn + 8, 0x6769)
			void ld64(co)
		} else {
			if (0x300000008 > cn) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, cn)
			st64(cn, 0x666e6f635f6d6d61)
			st16(cn + 8, 0x6769)
			void ld64(co)
		}
		st64(co + 0x10, cn, 0xa)
		st64(co + 8, 0xa)
		st64(co, 1)
		st64(ck + 0x10, co)
		st64(ck + 8, cm)
		st64(ck, 0)
		return cq
	}
	return memcpy(ck, s230, 0x78)
}

export function fn_86f8(a: u64, b: AccountInfo): u64 {
	const s58 = fp - 0x58, s60 = fp - 0x60, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8
	let q, r: u64
	const f = b.owner
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
			r = fn_10b930(s78, s88, 0x800000000000001a /* Ok */)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value)
// types [heur]: b: CreateAmmConfigContext (the handler ix_create_amm_config passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_4b0e0(a: u64, b: CreateAmmConfigContext, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s38 = fp - 0x38, s3a = fp - 0x3a, s3c = fp - 0x3c, s60 = fp - 0x60, s80 = fp - 0x80, s100 = fp - 0x100, s119 = fp - 0x119, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170
	let k, u, w, x, y: u64
	let g = a
	const f = ld64(e - 0x1000)
	if ((f as u32) > 0xf423f) {
		ErrorCode_name(s38, 0x100159900, c, d, e)
		st64(s20, 0, 1, 0)
		st64(s60, s20, 0x10015f818)
		st8(s60 + 0x18, 3)
		st64(s60 + 0x10, 0x20)
		st64(s80 + 0x10, 0)
		st64(s80, 0)
		if (ErrorCode_fmt(0x100159900, s80) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(s100, s38, 0x30)
		st64(s119 + 1, 0x10015a152)
		st32(s100 + 0x78, 0x9c9 /* anchor::RequireGtViolated */)
		st8(s100 + 0x30, 2)
		st32(s119 + 0x11, 0x28)
		st64(s119 + 9, 0x38)
		st64(s120, 0)
		fn_13e5a0(s160, s120)
		y = fn_26a0(s170, ld64(s160), ld64(s160 + 8), f)
		k = ld64(s170)
		st64(g + 8, ld64(s170 + 8))
		st64(g, k)
		return y
	}
	const ab = g
	const i = ld64(e - 0xff0)
	const h = ld64(e - 0xff8)
	const j = (i as u32) + (h as u32)
	if ((j as u32) != j) {
		fn_154730(0x10015fe58, b, c, d, j as u32)
	}
	if ((j as u32) > 0xf4240) {
		ErrorCode_name(s38, 0x100159858, c, d, j as u32)
		st64(s20, 0, 1, 0)
		st64(s60, s20, 0x10015f818)
		st8(s60 + 0x18, 3)
		st64(s60 + 0x10, 0x20)
		st64(s80 + 0x10, 0)
		st64(s80, 0)
		if (ErrorCode_fmt(0x100159858, s80) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(s100, s38, 0x30)
		st64(s119 + 1, 0x10015a152)
		st32(s100 + 0x78, 0x9ca /* anchor::RequireGteViolated */)
		st8(s100 + 0x30, 2)
		st32(s119 + 0x11, 0x29)
		st64(s119 + 9, 0x38)
		st64(s120, 0)
		fn_13e5a0(s140, s120)
		y = fn_26a0(s150, ld64(s140), ld64(s140 + 8), j)
		k = ld64(s150)
		st64(ab + 8, ld64(s150 + 8))
		st64(ab, k)
		return y
	}
	if ((d as u16) > 0x3e8 /* anchor::IdlInstructionStub */) {
		ErrorCode_name(s38, 0x100159858, c, d, d as u16)
		st64(s20, 0, 1, 0)
		st64(s60, s20, 0x10015f818)
		st8(s60 + 0x18, 3)
		st64(s60 + 0x10, 0x20)
		st64(s80 + 0x10, 0)
		st64(s80, 0)
		if (ErrorCode_fmt(0x100159858, s80) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(s100, s38, 0x30)
		st64(s119 + 1, 0x10015a152)
		st32(s100 + 0x78, 0x9ca /* anchor::RequireGteViolated */)
		st8(s100 + 0x30, 2)
		st32(s119 + 0x11, 0x2d)
		st64(s119 + 9, 0x38)
		st64(s120, 0)
		fn_13e5a0(s130, s120)
		u = ld64(s130 + 8)
		k = ld64(s130)
		st16(s3c, 0x3e8 /* anchor::IdlInstructionStub */, d)
		g = ab
		if ((k & 1) != 0) {
			st64(s80, 0, 1, 0)
			st64(s100, s80, 0x10015f818)
			st8(s100 + 0x18, 3)
			st64(s100 + 0x10, 0x20)
			st64(s119 + 9, 0)
			st64(s120, 0)
			if (fn_154e18(s3c, s120) == 0) {
				copyr(s38, s80, 0x18)
				st64(s20, 0, 1, 0)
				st64(s100, s20, 0x10015f818)
				st8(s100 + 0x18, 3)
				st64(s100 + 0x10, 0x20)
				st64(s119 + 9, 0)
				st64(s120, 0)
				if (fn_154e18(s3a, s120) == 0) {
					copy(s80, s38, 0x30)
					memcpy(s119, s80, 0x30)
					x = s120
					w = u + 0x38
					if (ld8(u + 0x38) != 0) {
						st8(w, 0)
						y = memcpy(u + 0x39, x, 0x37)
						st64(g + 8, u)
						st64(g, k)
						return y
					}
					st8(w, 0)
					y = memcpy(u + 0x39, s120, 0x37)
					st64(g + 8, u)
					st64(g, k)
					return y
				}
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		st64(s80, 0, 1, 0)
		st64(s100, s80, 0x10015f818)
		st8(s100 + 0x18, 3)
		st64(s100 + 0x10, 0x20)
		st64(s119 + 9, 0)
		st64(s120, 0)
		if (fn_154e18(s3c, s120) == 0) {
			copyr(s38, s80, 0x18)
			st64(s20, 0, 1, 0)
			st64(s100, s20, 0x10015f818)
			st8(s100 + 0x18, 3)
			st64(s100 + 0x10, 0x20)
			st64(s119 + 9, 0)
			st64(s120, 0)
			if (fn_154e18(s3a, s120) == 0) {
				copy(s80, s38, 0x30)
				memcpy(s119, s80, 0x30)
				x = s120
				w = u + 0x50
				if (ld8(u + 0x50) != 0) {
					st8(w, 0)
					y = memcpy(u + 0x51, x, 0x37)
					st64(g + 8, u)
					st64(g, k)
					return y
				}
				st8(w, 0)
				y = memcpy(u + 0x51, s120, 0x37)
				st64(g + 8, u)
				st64(g, k)
				return y
			}
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	const accounts: CreateAmmConfigAccounts = b.accounts
	const owner: AccountInfo = accounts.owner
	const n = owner.key
	let aa = ld64(n + 8)
	const z = ld64(n + 0x10)
	const o = ld64(n + 0x18)
	st64(accounts + 0x10, ld64(n))
	st64(accounts + 0x28, o)
	st64(accounts + 0x20, z)
	st64(accounts + 0x18, aa)
	st8(accounts + 0x7c, ld8(b + 0x20))
	st32(accounts + 0x70, i)
	st16(accounts + 0x7a, d)
	st32(accounts + 0x68, h, f)
	st16(accounts + 0x78, c)
	st32(accounts + 0x74, 0)
	const p = owner.key
	aa = ld64(p + 0x18)
	const r = ld64(p + 0x10)
	const q = ld64(p + 8)
	st64(accounts + 0x30, ld64(p))
	st64(accounts + 0x38, q, r, aa)
	const s = owner.key
	copyr(s120, s, 0x20)
	copyr(s100, accounts + 0x30, 0x20)
	const t = ld64(0x300000000 /* heap bump-allocator cursor */)
	u = sat_sub(t, 0x100)
	const v = t != 0 ? u : 0x300007f00
	if (v > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, v)
		st16(v + 8, c)
		st64(v, 0x975f706a7707bdf7 /* event:ConfigChangeEvent */)
		copy(v + 0xa, s120, 0x20)
		st32(v + 0x34, i)
		st16(v + 0x32, d)
		st32(v + 0x2e, f)
		st32(v + 0x2a, h)
		copy(v + 0x38, s100, 0x20)
		st64(s80, v, 0x58)
		y = log_data(s80, 1)
		st64(ab + 8, u)
		st64(ab, 2)
		return y
	}
	raw_vec_handle_error(1, 0x100, 0x1001609d0, d, t)
}

export function fn_c4d20(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10
	const j = fn_aa20(s10, b + 8, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
	let i = undef
	const f = ld64(s10)
	if (f == 2) {
		st64(a + 8, i)
		st64(a, f)
		return j
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0xa) : 0x300007ff6
	i = ld64(s10 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x666e6f635f6d6d61)
		st16(h + 8, 0x6769)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x666e6f635f6d6d61)
		st16(h + 8, 0x6769)
		void ld64(i)
	}
	st64(i + 0x10, h, 0xa)
	st64(i + 8, 0xa)
	st64(i, 1)
	st64(a + 8, i)
	st64(a, f)
	return j
}
