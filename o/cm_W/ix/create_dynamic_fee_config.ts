/// <reference path="../lib.d.ts" />
// instruction create_dynamic_fee_config
import { anchor_error_from, fn_10c390, fn_13e5a0, fn_13e628, fn_1476d8, fn_147a20, fn_14ed60, fn_4130, fn_88360, fn_a2c0, memcpy } from '../shared.ts'

// instruction handler: create_dynamic_fee_config (discriminator sha256("global:create_dynamic_fee_config")[..8] = 0x3ee3765578b50ebd)
// accounts [idl]: 0 owner [signer, mut, = GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ], 1 dynamic_fee_config [mut, pda], 2 system_program [= 11111111111111111111111111111111]
// args [idl]: index: u16, filter_period: u16, decay_period: u16, reduction_factor: u16, dynamic_fee_control: u32, max_volatility_accumulator: u32
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, index, filter_period, decay_period, reduction_factor, dynamic_fee_control, max_volatility_accumulator
export function ix_create_dynamic_fee_config(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s50 = fp - 0x50, s68 = fp - 0x68, s76 = fp - 0x76, s80 = fp - 0x80, sb8 = fp - 0xb8, sd0 = fp - 0xd0, se0 = fp - 0xe0, se1 = fp - 0xe1, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s1000 = fp - 0x1000
	let k, n: u64
	const h = sol_log("Instruction: CreateDynamicFeeConfig", 0x23)
	const f = ix_args_len
	if (f >= 2 && ((f & -2) != 2 && ((f & -2) != 4 && ((f & -2) != 6 && ((f & -4) != 8 && (f & -4) != 0xc))))) {
		const args: CreateDynamicFeeConfigArgs = ix_args
		const index = args.index
		const filter_period = args.filter_period
		const decay_period = args.decay_period
		const reduction_factor = args.reduction_factor
		const dynamic_fee_control = args.dynamic_fee_control
		const max_volatility_accumulator = args.max_volatility_accumulator
		st64(se0, accounts, accounts_len)
		st64(s1000, f, se1)
		n = accounts_create_dynamic_fee_config(s68, program_id, se0, args, fp, h)
		let j = ld64(s68 + 0x10)
		k = ld64(s68 + 8)
		const i = ld64(s68)
		if (i == 0) {
			st64(a + 8, j)
			st64(a, k)
			return n
		}
		memcpy(sb8, s50, 0x50)
		st16(s80 + 8, index)
		st64(sd0, i, k, j)
		if (filter_period != 0 && (decay_period > filter_period && (0x270e >= ((reduction_factor - 1) as u16) && (0x1869e >= ((dynamic_fee_control - 1) as u32) && 0x418937 >= max_volatility_accumulator)))) {
			st16(s76, filter_period, decay_period, reduction_factor)
			st32(s80, dynamic_fee_control, max_volatility_accumulator)
			n = fn_d6698(s108, sd0, program_id)
			k = ld64(s108)
			st64(a + 8, ld64(s108 + 8))
			st64(a, k)
			return n
		}
		n = fn_88360(sf8, 0x2c)
		j = ld64(sf8 + 8)
		k = ld64(sf8)
		if (k == 2) {
			n = fn_d6698(s108, sd0, program_id)
			k = ld64(s108)
			st64(a + 8, ld64(s108 + 8))
			st64(a, k)
			return n
		}
		st64(a + 8, j)
		st64(a, k)
		return n
	}
	const l = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (l & 3) - 2) {
		n = anchor_error_from(s118, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s118)
		st64(a + 8, ld64(s118 + 8))
		st64(a, k)
		return n
	}
	if ((l & 3) == 0) {
		n = anchor_error_from(s118, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s118)
		st64(a + 8, ld64(s118 + 8))
		st64(a, k)
		return n
	}
	const m = ld64(ld64(l + 7))
	if (m == 0) {
		n = anchor_error_from(s118, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s118)
		st64(a + 8, ld64(s118 + 8))
		st64(a, k)
		return n
	}
	callx(m, ld64(l - 1), m)
	n = anchor_error_from(s118, 0x66 /* anchor::InstructionDidNotDeserialize */)
	k = ld64(s118)
	st64(a + 8, ld64(s118 + 8))
	st64(a, k)
	return n
}

// Anchor Accounts::try_accounts of instruction create_dynamic_fee_config (called by ix_create_dynamic_fee_config; name [str]: from the handler's "Instruction: …" log; was fn_d3b38)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: owner (ConstraintMut), dynamic_fee_config (ConstraintMut, ConstraintRentExempt)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: owner [idl], dynamic_fee_config [idl]
export function accounts_create_dynamic_fee_config(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s38 = fp - 0x38, s78 = fp - 0x78, sb0 = fp - 0xb0, se8 = fp - 0xe8, sf0 = fp - 0xf0, s100 = fp - 0x100, s108 = fp - 0x108, s128 = fp - 0x128, s129 = fp - 0x129, s150 = fp - 0x150, s168 = fp - 0x168, s180 = fp - 0x180, s188 = fp - 0x188, s190 = fp - 0x190, s198 = fp - 0x198, s19a = fp - 0x19a, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8, s2b0 = fp - 0x2b0, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0
	let i, s, ad, ae: u64
	let h = a
	st64(s1a8, b)
	if (ld64(e - 0x1000) > 1) {
		st64(s2a0, h)
		st64(s2a8, ld64(e - 0xff8))
		const j = ld16(d)
		st16(s19a, j)
		s = try_accounts_17a30(s108, c, c, d, e, r0)
		const owner: AccountInfo = ld64(s100)
		const k = ld64(s108)
		if (k == 2) {
			st64(s198, owner)
			const m = ld64(c + 8)
			if (m == 0) {
				s = anchor_error_from(s288, 0xbbd /* anchor::AccountNotEnoughKeys */)
				ae = ld64(s288)
				ad = ld64(s2a0)
				st64(ad + 0x10, ld64(s288 + 8))
				st64(ad + 8, ae)
				st64(ad, 0)
				return s
			}
			const n: AccountInfo = ld64(c)
			st64(s190, n)
			st64(c + 8, m - 1)
			st64(s2b0, n)
			st64(c, n + 0x30)
			try_accounts_18870(s108, c)
			const r = ld64(s100)
			const o = ld64(s108)
			if (o == 2) {
				st64(s188, r)
				rent_get(s108)
				copy(s168, s100, 0x18)
				if (ld64(s108) != 0) {
					s = fn_13e628(s278, s168)
					ae = ld64(s278)
					ad = ld64(s2a0)
					st64(ad + 0x10, ld64(s278 + 8))
					st64(ad + 8, ae)
					st64(ad, 0)
					return s
				}
				copyr(s180, s168, 0x18)
				st64(sb0 + 0x10, s18)
				st64(sb0, 0x10015b2ba)
				st16(s18, bswap16(j))
				st64(sb0 + 0x18, 2)
				st64(sb0 + 8, 0x12)
				// PDA find_program_address(["dynamic_fee_config", u16 bswap16(j) [ix data?]], program *b)
				Pubkey_find_program_address(s108, sb0, 2, b)
				copyr(s150, s108, 0x20)
				const w = ld8(se8)
				st8(s129, w)
				st8(ld64(s2a8), w)
				const x = ld64(ld64(s2b0))
				copyr(s128, x, 0x20)
				if ((memcmp(s128, s150, 0x20) as u32) == 0) {
					st64(sb0, s190, s180, s198, s188, s19a, s129, s1a8)
					s = fn_d4d48(s108, sb0)
					const ah = ld64(s100 + 8)
					st64(s2a8, ld64(s100))
					const af = ld64(s108)
					if (af == 0) {
						const al = ld64(s2a0)
						st64(al + 0x10, ah)
						st64(al + 8, ld64(s2a8))
						st64(al, 0)
						return s
					}
					st64(s2b0, af)
					memcpy(s78, sf0, 0x40)
					const dynamic_fee_config: AccountInfo = ld64(s2b0)
					if (dynamic_fee_config.is_writable != 0) {
						st64(s2c0, ah)
						AccountInfo_clone_f338(sb0, dynamic_fee_config)
						st64(s2b8, fn_147a20(sb0))
						AccountInfo_clone_f338(s108, dynamic_fee_config)
						AccountInfo_try_data_len(s18, s108)
						const aj = ld64(s18 + 8)
						const ai = ld64(s18)
						if (ai != 0x800000000000001a /* Ok */) {
							st64(s18 + 0x10, ld64(s18 + 0x10))
							st64(s18, ai, aj)
							const ao = fn_13e628(s1f8, s18)
							const an = ld64(s1f8)
							const am = ld64(s2a0)
							st64(am + 0x10, ld64(s1f8 + 8))
							st64(am + 8, an)
							st64(am, 0)
							return ptr_drop_in_place_fcd8(sb0, ptr_drop_in_place_fcd8(s108, ao))
						}
						const ak = Rent_is_exempt(s180, ld64(s2b8), aj)
						ptr_drop_in_place_fcd8(sb0, ptr_drop_in_place_fcd8(s108, ak))
						if (ak != 0) {
							if (owner.is_writable != 0) {
								const ap = owner.key
								copyr(s38, ap, 0x20)
								if ((memcmp(s38, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) != 0) {
									fn_88360(s248, 0)
									const au = fn_4130(s258, ld64(s248), ld64(s248 + 8), 0x10015b1d0 /* "owner" */, 5)
									const at = ld64(s258 + 8)
									const ar = ld64(s258)
									copyr(s108, s38, 0x20)
									st64(se8, 0xa6bd3bcb652bb6e5, 0x648eee6fe68868f5, 0xb1880f9c196055dc, 0xa18a9e05bd73e21f) // key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ
									s = Error_with_pubkeys(s268, ar, at, s108, au)
									ae = ld64(s268)
									ad = ld64(s2a0)
									st64(ad + 0x10, ld64(s268 + 8))
									st64(ad + 8, ae)
									st64(ad, 0)
									return s
								}
								const aq = ld64(s2a0)
								s = memcpy(aq + 0x20, s78, 0x40)
								st64(aq + 0x60, r)
								st64(aq + 0x18, ld64(s2c0))
								st64(aq + 0x10, ld64(s2a8))
								st64(aq + 8, ld64(s2b0))
								st64(aq, owner)
								return s
							}
							anchor_error_from(s228, 0x7d0 /* anchor::ConstraintMut */)
							s = fn_4130(s238, ld64(s228), ld64(s228 + 8), 0x10015b1d0 /* "owner" */, 5)
							ae = ld64(s238)
							ad = ld64(s2a0)
							st64(ad + 0x10, ld64(s238 + 8))
							st64(ad + 8, ae)
							st64(ad, 0)
							return s
						}
						anchor_error_from(s208, 0x7d5 /* anchor::ConstraintRentExempt */)
						s = fn_4130(s218, ld64(s208), ld64(s208 + 8), 0x10015b2ba /* "dynamic_fee_config" */, 0x12)
						ae = ld64(s218)
						ad = ld64(s2a0)
						st64(ad + 0x10, ld64(s218 + 8))
						st64(ad + 8, ae)
						st64(ad, 0)
						return s
					}
					anchor_error_from(s1d8, 0x7d0 /* anchor::ConstraintMut */)
					s = fn_4130(s1e8, ld64(s1d8), ld64(s1d8 + 8), 0x10015b2ba /* "dynamic_fee_config" */, 0x12)
					ae = ld64(s1e8)
					ad = ld64(s2a0)
					st64(ad + 0x10, ld64(s1e8 + 8))
					st64(ad + 8, ae)
					st64(ad, 0)
					return s
				}
				const ac = anchor_error_from(s1b8, 0x7d6 /* anchor::ConstraintSeeds */)
				const y = ld64(0x300000000 /* heap bump-allocator cursor */)
				h = ld64(s2a0)
				const aa = y != 0 ? sat_sub(y, 0x12) : 0x300007fee
				const ab = ld64(s1b8 + 8)
				const z = ld64(s1b8)
				if ((z & 1) != 0) {
					if (0x300000008 > aa) {
						raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, aa)
					st64(aa + 8, 0x666e6f635f656566)
					st64(aa, 0x5f63696d616e7964)
					st16(aa + 0x10, 0x6769)
					void ld64(ab)
				} else {
					if (0x300000008 > aa) {
						raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, aa)
					st64(aa + 8, 0x666e6f635f656566)
					st64(aa, 0x5f63696d616e7964)
					st16(aa + 0x10, 0x6769)
					void ld64(ab)
				}
				st64(ab + 0x10, aa, 0x12)
				st64(ab + 8, 0x12)
				st64(ab, 1)
				copyr(s108, s128, 0x20)
				copy(se8, s150, 0x20)
				s = Error_with_pubkeys(s1c8, z, ab, s108, ac)
				i = ld64(s1c8)
				st64(h + 0x10, ld64(s1c8 + 8))
				st64(h + 8, i)
				st64(h, 0)
				return s
			}
			const p = ld64(0x300000000 /* heap bump-allocator cursor */)
			s = ld64(s2a0)
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
		const v = ld64(s2a0)
		st64(v + 0x10, owner)
		st64(v + 8, k)
		st64(v, 0)
		return s
	}
	const f = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (f & 3) - 2) {
		s = anchor_error_from(s298, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s298)
		st64(h + 0x10, ld64(s298 + 8))
		st64(h + 8, i)
		st64(h, 0)
		return s
	}
	if ((f & 3) == 0) {
		s = anchor_error_from(s298, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s298)
		st64(h + 0x10, ld64(s298 + 8))
		st64(h + 8, i)
		st64(h, 0)
		return s
	}
	const g = ld64(ld64(f + 7))
	if (g == 0) {
		s = anchor_error_from(s298, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s298)
		st64(h + 0x10, ld64(s298 + 8))
		st64(h + 8, i)
		st64(h, 0)
		return s
	}
	callx(g, ld64(f - 1), g)
	s = anchor_error_from(s298, 0x66 /* anchor::InstructionDidNotDeserialize */)
	i = ld64(s298)
	st64(h + 0x10, ld64(s298 + 8))
	st64(h + 8, i)
	st64(h, 0)
	return s
}

export function fn_d4d48(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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
			st64(s230 + 8, 0x10015b27a)
			st32(s1a8 + 0x10, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s1e0, 2)
			st32(s230 + 0x18, 4)
			st64(s230 + 0x10, 0x40)
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
		const n = max(fn_1476d8(ld64(b + 8), 0x58), 1)
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
		st64(s48, 0x10015b2ba)
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
		st64(s48 + 8, 0x12)
		st64(s60 + 8, 3)
		st64(s1c0 + 0x10, 1)
		st64(s230, 0, 8, 0)
		cq = system_program_assign_13fb30(s250, s230, 0x58)
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
		st64(s48, 0x10015b2ba)
		st8(s61, ld8(s62))
		st64(s1c0 + 0x10, 1)
		st64(s230, 0, 8, 0)
		st64(s60 + 8, 3)
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 2)
		st64(s48 + 8, 0x12)
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
		st64(s2e0 + 0x38, fn_1476d8(ld64(b + 8), 0x58))
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
		st64(s48, 0x10015b2ba)
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
		st64(s48 + 8, 0x12)
		st64(s60 + 8, 3)
		st64(s1a8 + 0x28, 1)
		st64(s230, 0, 8, 0)
		cq = system_program_create_account(s290, s230, ld64(s2e0 + 0x38), 0x58, ld64(ld64(aa + 0x30)))
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
	cq = fn_8330(s230, f)
	if (ld64(s230) == 0) {
		const cl = ld64(0x300000000 /* heap bump-allocator cursor */)
		const cn = cl != 0 ? sat_sub(cl, 0x12) : 0x300007fee
		const co = ld64(s230 + 0x10)
		const cm = ld64(s230 + 8)
		if (cm != 0) {
			if (0x300000008 > cn) {
				raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, cn)
			st64(cn + 8, 0x666e6f635f656566)
			st64(cn, 0x5f63696d616e7964)
			st16(cn + 0x10, 0x6769)
			void ld64(co)
		} else {
			if (0x300000008 > cn) {
				raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, cn)
			st64(cn + 8, 0x666e6f635f656566)
			st64(cn, 0x5f63696d616e7964)
			st16(cn + 0x10, 0x6769)
			void ld64(co)
		}
		st64(co + 0x10, cn, 0x12)
		st64(co + 8, 0x12)
		st64(co, 1)
		st64(ck + 0x10, co)
		st64(ck + 8, cm)
		st64(ck, 0)
		return cq
	}
	return memcpy(ck, s230, 0x58)
}

export function fn_8330(a: u64, b: AccountInfo): u64 {
	const s38 = fp - 0x38, s40 = fp - 0x40, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8
	let q, r: u64
	const f = b.owner
	if ((memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0) {
		r = anchor_error_from(sa8, 0xbc4 /* anchor::AccountNotInitialized */)
		q = ld64(sa8)
		st64(a + 0x10, ld64(sa8 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s58, b, g as u32)
		const p = ld64(s58 + 0x10)
		const l = ld64(s58 + 8)
		const k = ld64(s58)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s68 + 8, ld64(l + 8))
			st64(s68, m)
			r = fn_10c390(s58, s68, 0x800000000000001a /* Ok */)
			const n = ld64(s58 + 0x10)
			const o = ld64(s58 + 8)
			if (ld64(s58) != 0) {
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, 0)
				st64(p, ld64(p) - 1)
				return r
			}
			r = memcpy(a + 0x18, s40, 0x40)
			st64(a + 0x10, n)
			st64(a + 8, o)
			st64(a, b)
			st64(p, ld64(p) - 1)
			return r
		}
		st64(s58, k, l, p)
		r = fn_13e628(s98, s58)
		q = ld64(s98)
		st64(a + 0x10, ld64(s98 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const j = anchor_error_from(s78, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	const i = ld64(s78 + 8)
	const h = ld64(s78)
	copyr(s58, f, 0x20)
	st64(s38, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
	r = Error_with_pubkeys(s88, h, i, s58, j)
	q = ld64(s88)
	st64(a + 0x10, ld64(s88 + 8))
	st64(a + 8, q)
	st64(a, 0)
	return r
}

export function fn_d6698(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10
	const j = fn_a2c0(s10, b + 8, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
	let i = undef
	const f = ld64(s10)
	if (f == 2) {
		st64(a + 8, i)
		st64(a, f)
		return j
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0x12) : 0x300007fee
	i = ld64(s10 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008, 0x12 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 8, 0x666e6f635f656566)
		st64(h, 0x5f63696d616e7964)
		st16(h + 0x10, 0x6769)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008, 0x12 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 8, 0x666e6f635f656566)
		st64(h, 0x5f63696d616e7964)
		st16(h + 0x10, 0x6769)
		void ld64(i)
	}
	st64(i + 0x10, h, 0x12)
	st64(i + 8, 0x12)
	st64(i, 1)
	st64(a + 8, i)
	st64(a, f)
	return j
}
