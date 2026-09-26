/// <reference path="../lib.d.ts" />
// instruction set_reward_params
import { anchor_error_from, fn_13e5a0, fn_13e628, fn_14b198, fn_14ec00, fn_14ed60, fn_2150, fn_4130, fn_4808, fn_4dc0, fn_53e8, fn_58930, fn_6c2a0, fn_79050, fn_7d178, fn_85138, fn_88360, fn_88558, fn_a80, memcpy } from '../shared.ts'

// instruction handler: set_reward_params (discriminator sha256("global:set_reward_params")[..8] = 0x89d3c9204ba73470)
// accounts [idl]: 0 authority [signer], 1 amm_config, 2 pool_state [mut], 3 operation_state [pda], 4 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 5 token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb]
// args [idl]: reward_index: u8, emissions_per_second_x64: u128, open_time: u64, end_time: u64
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, reward_index, open_time, end_time
export function ix_set_reward_params(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s88 = fp - 0x88, s90 = fp - 0x90, sa0 = fp - 0xa0, s128 = fp - 0x128, s140 = fp - 0x140, s150 = fp - 0x150, s151 = fp - 0x151, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s1000 = fp - 0x1000
	let k, o: u64
	const h = sol_log("Instruction: SetRewardParams", 0x1c)
	const f = ix_args_len
	if (f != 0 && (f >= 0x11 && (f - 0x11 >= 8 && f - 0x19 >= 8))) {
		const args: SetRewardParamsArgs = ix_args
		const reward_index = args.reward_index
		const r = ld64(args.emissions_per_second_x64 + 8)
		const s = ld64(args.emissions_per_second_x64)
		const open_time = args.open_time
		const end_time = args.end_time
		st8(s151, 0xff)
		st64(s150, accounts, accounts_len)
		st64(s1000 + 8, s151)
		o = accounts_set_reward_params(sa0, program_id, s150, undef, fp, h)
		const j = ld64(s90)
		k = ld64(sa0 + 8)
		const i = ld64(sa0)
		if (i == 0) {
			st64(a + 8, j)
			st64(a, k)
			return o
		}
		const l = memcpy(s128, s88, 0x88)
		st64(s140, i, k, j)
		st8(s88 + 8, ld8(s151))
		copyr(s90, s150, 0x10)
		st64(sa0, program_id, s140)
		st64(s1000, r, open_time, end_time)
		o = fn_45880(s168, sa0, reward_index, s, fp, l)
		k = ld64(s168)
		if (k == 2) {
			o = fn_c03e8(s178, s140, program_id)
			k = ld64(s178)
			st64(a + 8, ld64(s178 + 8))
			st64(a, k)
			return o
		}
		st64(a + 8, ld64(s168 + 8))
		st64(a, k)
		return o
	}
	const m = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (m & 3) - 2) {
		o = anchor_error_from(s188, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s188)
		st64(a + 8, ld64(s188 + 8))
		st64(a, k)
		return o
	}
	if ((m & 3) == 0) {
		o = anchor_error_from(s188, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s188)
		st64(a + 8, ld64(s188 + 8))
		st64(a, k)
		return o
	}
	const n = ld64(ld64(m + 7))
	if (n == 0) {
		o = anchor_error_from(s188, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s188)
		st64(a + 8, ld64(s188 + 8))
		st64(a, k)
		return o
	}
	callx(n, ld64(m - 1), n)
	o = anchor_error_from(s188, 0x66 /* anchor::InstructionDidNotDeserialize */)
	k = ld64(s188)
	st64(a + 8, ld64(s188 + 8))
	st64(a, k)
	return o
}

// Anchor Accounts::try_accounts of instruction set_reward_params (called by ix_set_reward_params; name [str]: from the handler's "Instruction: …" log; was fn_bf170)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_program_2022, operation_state (ConstraintSeeds), pool_state (ConstraintMut, ConstraintRaw), amm_config (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: pool_state [idl]
export function accounts_set_reward_params(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s30 = fp - 0x30, s50 = fp - 0x50, s70 = fp - 0x70, s90 = fp - 0x90, sf0 = fp - 0xf0, s148 = fp - 0x148, s150 = fp - 0x150, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s238 = fp - 0x238, s240 = fp - 0x240, s248 = fp - 0x248, s250 = fp - 0x250, s258 = fp - 0x258
	let p, z: u64
	st64(s238 + 0x18, b)
	let l = try_accounts_17a30(s168, c, c, d, e, r0)
	const i = ld64(s168 + 8)
	let f = ld64(s168)
	if (f == 2) {
		st64(s238 + 0x10, ld64(e - 0xff8))
		l = try_accounts_184d8(s168, c)
		const r = ld64(s168 + 0x10)
		let k = ld64(s168 + 8)
		const j = ld64(s168)
		if (j == 0) {
			const o = ld64(0x300000000 /* heap bump-allocator cursor */)
			p = 0xa > o
			const q = o != 0 ? p != 0 ? 0 : o - 0xa : 0x300007ff6
			if ((k & 1) != 0) {
				if (0x300000008 > q) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, p, k)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, q)
				st64(q, 0x666e6f635f6d6d61)
				st16(q + 8, 0x6769)
				void ld64(r)
			} else {
				if (0x300000008 > q) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, p, k)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, q)
				st64(q, 0x666e6f635f6d6d61)
				st16(q + 8, 0x6769)
				void ld64(r)
			}
			st64(r + 0x10, q, 0xa)
			st64(r + 8, 0xa)
			st64(r, 1)
			st64(a + 0x10, r)
			st64(a + 8, k)
			st64(a, 0)
			return l
		}
		st64(s238, k, j)
		memcpy(sf0, s150, 0x60)
		fn_11e0(s168, c)
		l = ld64(s168 + 8)
		f = ld64(s168)
		if (f == 2) {
			st64(s240, l)
			fn_12d8(s168, c)
			l = ld64(s168 + 8)
			f = ld64(s168)
			if (f == 2) {
				st64(s248, l)
				try_accounts_19190(s168, c)
				l = ld64(s168 + 8)
				f = ld64(s168)
				if (f == 2) {
					st64(s250, l)
					l = fn_18cf0(s168, c)
					let x = ld64(s168 + 8)
					const w = ld64(s168)
					if (w != 2) {
						l = fn_4130(s178, w, x, "token_program_2022", 0x12)
						x = ld64(s178 + 8)
						f = ld64(s178)
						z = ld64(s240)
						if (f != 2) {
							st64(a + 0x10, x)
							st64(a + 8, f)
							st64(a, 0)
							return l
						}
					} else {
						z = ld64(s240)
					}
					const y = ld64(ld64(s238 + 8))
					copyr(s90, y, 0x20)
					l = fn_4dc0(s168, z, l)
					const aa = ld64(s168 + 0x10)
					const ab = ld64(s168 + 8)
					if (ld64(s168) != 0) {
						st64(a + 0x10, aa)
						st64(a + 8, ab)
						st64(a, 0)
						return l
					}
					copyr(s70, ab + 1, 0x20)
					st64(aa, ld64(aa) - 1)
					const ac = memcmp(s90, s70, 0x20)
					if ((ac as u32) == 0) {
						const pool_state: AccountInfo = ld64(s240)
						if (pool_state.is_writable != 0) {
							l = fn_4dc0(s168, pool_state, ac as u32)
							const ah = ld64(s168 + 0x10)
							f = ld64(s168 + 8)
							if (ld64(s168) != 0) {
								st64(a + 0x10, ah)
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
							copyr(s168, s90, 0x20)
							st64(s258, ah)
							const aj = memcmp(f + 1, s168, 0x20)
							const ai = ld64(s258)
							st64(ai, ld64(ai) - 1)
							if ((aj as u32) == 0) {
								st64(s30, 0x10015b1ad, 9)
								// PDA find_program_address(["operation"], program *(ld64(s238 + 0x18)))
								Pubkey_find_program_address(s168, s30, 1, ld64(s238 + 0x18))
								copyr(s50, s168, 0x20)
								st8(ld64(s238 + 0x10), ld8(s148))
								const ak = ld64(ld64(s248))
								copyr(s20, ak, 0x20)
								if ((memcmp(s20, s50, 0x20) as u32) != 0) {
									anchor_error_from(s1f8, 0x7d6 /* anchor::ConstraintSeeds */)
									const an = fn_4130(s208, ld64(s1f8), ld64(s1f8 + 8), "operation_state", 0xf)
									const am = ld64(s208 + 8)
									const al = ld64(s208)
									copyr(s168, s20, 0x20)
									copy(s148, s50, 0x20)
									l = Error_with_pubkeys(s218, al, am, s168, an)
									f = ld64(s218)
									st64(a + 0x10, ld64(s218 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return l
								}
								l = memcpy(a + 0x20, sf0, 0x60)
								st64(a + 0x98, x)
								st64(a + 0x90, ld64(s250))
								st64(a + 0x88, ld64(s248))
								st64(a + 0x80, ld64(s240))
								st64(a + 0x18, r)
								st64(a + 0x10, ld64(s238))
								st64(a + 8, ld64(s238 + 8))
								st64(a, i)
								return l
							}
							anchor_error_from(s1d8, 0x7d3 /* anchor::ConstraintRaw */)
							l = fn_4130(s1e8, ld64(s1d8), ld64(s1d8 + 8), "pool_state", 0xa)
							f = ld64(s1e8)
							st64(a + 0x10, ld64(s1e8 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return l
						}
						anchor_error_from(s1b8, 0x7d0 /* anchor::ConstraintMut */)
						l = fn_4130(s1c8, ld64(s1b8), ld64(s1b8 + 8), "pool_state", 0xa)
						f = ld64(s1c8)
						st64(a + 0x10, ld64(s1c8 + 8))
						st64(a + 8, f)
						st64(a, 0)
						return l
					}
					anchor_error_from(s188, 0x7dc /* anchor::ConstraintAddress */)
					const af = fn_4130(s198, ld64(s188), ld64(s188 + 8), 0x10015af4d /* "amm_config" */, 0xa)
					const ae = ld64(s198 + 8)
					const ad = ld64(s198)
					copy(s168, s90, 0x40)
					l = Error_with_pubkeys(s1a8, ad, ae, s168, af)
					f = ld64(s1a8)
					st64(a + 0x10, ld64(s1a8 + 8))
					st64(a + 8, f)
					st64(a, 0)
					return l
				}
				const u = ld64(0x300000000 /* heap bump-allocator cursor */)
				const v = u != 0 ? sat_sub(u, 0xd) : 0x300007ff3
				if ((f & 1) != 0) {
					if (0x300000008 > v) {
						raw_vec_handle_error(1, 0xd, 0x10015f8f8, sat_sub(u, 0xd), 0xd > u)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, v)
					st64(v + 5, 0x6d6172676f72705f)
					st64(v, 0x72705f6e656b6f74)
					void ld64(l)
				} else {
					if (0x300000008 > v) {
						raw_vec_handle_error(1, 0xd, 0x10015f8f8, sat_sub(u, 0xd), 0xd > u)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, v)
					st64(v + 5, 0x6d6172676f72705f)
					st64(v, 0x72705f6e656b6f74)
					void ld64(l)
				}
				st64(l + 0x10, v, 0xd)
				st64(l + 8, 0xd)
				st64(l, 1)
				st64(a + 0x10, l)
				st64(a + 8, f)
				st64(a, 0)
				return l
			}
			const m = ld64(0x300000000 /* heap bump-allocator cursor */)
			const n = m != 0 ? sat_sub(m, 0xf) : 0x300007ff1
			if ((f & 1) != 0) {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0xf, 0x10015f8f8, sat_sub(m, 0xf), 0xf > m)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 7, 0x65746174735f6e6f)
				st64(n, 0x6f6974617265706f)
				void ld64(l)
			} else {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0xf, 0x10015f8f8, sat_sub(m, 0xf), 0xf > m)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 7, 0x65746174735f6e6f)
				st64(n, 0x6f6974617265706f)
				void ld64(l)
			}
			st64(l + 0x10, n, 0xf)
			st64(l + 8, 0xf)
			st64(l, 1)
			st64(a + 0x10, l)
			st64(a + 8, f)
			st64(a, 0)
			return l
		}
		const s = ld64(0x300000000 /* heap bump-allocator cursor */)
		k = 0xa > s
		p = k != 0 ? 0 : s - 0xa
		const t = s != 0 ? p : 0x300007ff6
		if ((f & 1) != 0) {
			if (0x300000008 > t) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, p, k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, t)
			st64(t, 0x6174735f6c6f6f70)
			st16(t + 8, 0x6574)
			void ld64(l)
		} else {
			if (0x300000008 > t) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, p, k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, t)
			st64(t, 0x6174735f6c6f6f70)
			st16(t + 8, 0x6574)
			void ld64(l)
		}
		st64(l + 0x10, t, 0xa)
		st64(l + 8, 0xa)
		st64(l, 1)
		st64(a + 0x10, l)
		st64(a + 8, f)
		st64(a, 0)
		return l
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 9) : 0x300007ff7
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(g, 9), 9 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x7469726f68747561)
		st8(h + 8, 0x79)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(g, 9), 9 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x7469726f68747561)
		st8(h + 8, 0x79)
		void ld64(i)
	}
	st64(i + 0x10, h, 9)
	st64(i + 8, 9)
	st64(i, 1)
	st64(a + 0x10, i)
	st64(a + 8, f)
	st64(a, 0)
	return l
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value)
export function fn_45880(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s70 = fp - 0x70, s88 = fp - 0x88, sa8 = fp - 0xa8, se8 = fp - 0xe8, s108 = fp - 0x108, s190 = fp - 0x190, s1a8 = fp - 0x1a8, s1cc = fp - 0x1cc, s258 = fp - 0x258, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s2a0 = fp - 0x2a0, s2c4 = fp - 0x2c4, s330 = fp - 0x330, s350 = fp - 0x350, s360 = fp - 0x360, s368 = fp - 0x368, s378 = fp - 0x378, s3c8 = fp - 0x3c8, s3e8 = fp - 0x3e8, s421 = fp - 0x421, s574 = fp - 0x574, s5c8 = fp - 0x5c8, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s608 = fp - 0x608, s610 = fp - 0x610, s618 = fp - 0x618, s621 = fp - 0x621, s628 = fp - 0x628, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s668 = fp - 0x668, s678 = fp - 0x678, s688 = fp - 0x688, s698 = fp - 0x698, s6a8 = fp - 0x6a8, s6b8 = fp - 0x6b8, s6c8 = fp - 0x6c8, s6d8 = fp - 0x6d8, s6e8 = fp - 0x6e8, s6f8 = fp - 0x6f8, s708 = fp - 0x708, s718 = fp - 0x718, s728 = fp - 0x728, s738 = fp - 0x738, s748 = fp - 0x748, s758 = fp - 0x758, s768 = fp - 0x768, s778 = fp - 0x778, s788 = fp - 0x788, s798 = fp - 0x798, s7a8 = fp - 0x7a8, s7b8 = fp - 0x7b8, s7c8 = fp - 0x7c8, s7f8 = fp - 0x7f8, s800 = fp - 0x800, s808 = fp - 0x808, s810 = fp - 0x810, s818 = fp - 0x818, s820 = fp - 0x820, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let m, o, am, an, ao, bf, bg, bh, bi, bj, bk: u64
	st64(s7f8 + 0x28, a)
	if (3 > (c as u8)) {
		const f = ld64(e - 0xff0)
		const g = ld64(e - 0xff8)
		if (f > g) {
			const h = ld64(e - 0x1000)
			if ((d | h) == 0) {
				ErrorCode_name(s40, 0x100159900, h, d, e)
				st64(s378, 0, 1, 0)
				st64(s260, s378, 0x10015f818)
				st8(s258 + 0x10, 3)
				st64(s258 + 8, 0x20)
				st64(s270, 0)
				st64(s280, 0)
				if (ErrorCode_fmt(0x100159900, s280) != 0) {
					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
				}
				copyr(s5f0, s378, 0x18)
				copy(s608, s40, 0x18)
				st64(s621 + 1, 0x10015a0e6)
				st32(s5c8 + 0x38, 0x9c9 /* anchor::RequireGtViolated */)
				st8(s5e0 + 8, 2)
				st32(s610, 0x35)
				st64(s618, 0x32)
				st64(s628, 0)
				fn_13e5a0(s7b8, s628)
				bk = fn_2150(s7c8, ld64(s7b8), ld64(s7b8 + 8), 0, 0)
				m = ld64(s7c8)
				bj = ld64(s7f8 + 0x28)
				st64(bj + 8, ld64(s7c8 + 8))
				st64(bj, m)
				return bk
			}
			st64(s7f8, h, f)
			st64(s7f8 + 0x18, g)
			st64(s800, b)
			const i = ld64(b + 8)
			st64(s7f8 + 0x20, i)
			bk = fn_4808(s628, ld64(i + 0x88), r0)
			const j = ld64(s618)
			m = ld64(s621 + 1)
			let ad = j
			if (ld64(s628) != 0) {
				bj = ld64(s7f8 + 0x28)
				st64(bj + 8, ad)
				st64(bj, m)
				return bk
			}
			st64(s7f8 + 0x10, j)
			const k = ld64(0x300000000 /* heap bump-allocator cursor */)
			const l = k != 0 ? sat_sub(k, 0x140) : 0x300007ec0
			if (l > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, l)
				memcpy(l, m + 1, 0x140)
				const n = ld64(ld64(ld64(s7f8 + 0x20)))
				copyr(s280, n, 0x20)
				st64(s628, 0, 0, 0, 0)
				if ((memcmp(s280, s628, 0x20) as u32) == 0) {
					ErrorCode_name(s40, 0x100159830)
					st64(s378, 0, 1, 0)
					st64(s260, s378, 0x10015f818)
					st8(s258 + 0x10, 3)
					st64(s258 + 8, 0x20)
					st64(s270, 0)
					st64(s280, 0)
					if (ErrorCode_fmt(0x100159830, s280) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
					}
					B82: {
						copyr(s5f0, s378, 0x18)
						copy(s608, s40, 0x18)
						st64(s621 + 1, 0x10015a0e6)
						st32(s5c8 + 0x38, 0x9c7 /* anchor::RequireNeqViolated */)
						st8(s5e0 + 8, 2)
						st32(s610, 0x38)
						st64(s618, 0x32)
						st64(s628, 0)
						fn_13e5a0(s7a8, s628)
						ad = ld64(s7a8 + 8)
						m = ld64(s7a8)
						const x = ld64(ld64(ld64(s7f8 + 0x20)))
						const aa = ld64(x)
						const z = ld64(x + 8)
						const y = ld64(x + 0x10)
						st64(s270 + 8, ld64(x + 0x18))
						st64(s280, aa, z, y)
						st64(s260, 0, 0, 0, 0)
						if ((m & 1) != 0) {
							st64(s378, 0, 1, 0)
							st64(s608, s378, 0x10015f818)
							st8(s5f0, 3)
							st64(s600 + 8, 0x20)
							st64(s618, 0)
							st64(s628, 0)
							if (fn_14b198(s280, s628) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
							}
							copyr(s70, s378, 0x18)
							st64(s40, 0, 1, 0)
							st64(s608, s40, 0x10015f818)
							st8(s5f0, 3)
							st64(s600 + 8, 0x20)
							st64(s618, 0)
							st64(s628, 0)
							if (fn_14b198(s260, s628) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
							}
							copyr(s360, s40, 0x18)
							copy(s378, s70, 0x18)
							memcpy(s621, s378, 0x30)
							bh = s628
							bg = 0x39
							bf = ad + 0x38
							if (ld8(ad + 0x38) != 0) {
								break B82
							}
						} else {
							st64(s378, 0, 1, 0)
							st64(s608, s378, 0x10015f818)
							st8(s5f0, 3)
							st64(s600 + 8, 0x20)
							st64(s618, 0)
							st64(s628, 0)
							if (fn_14b198(s280, s628) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
							}
							copyr(s70, s378, 0x18)
							st64(s40, 0, 1, 0)
							st64(s608, s40, 0x10015f818)
							st8(s5f0, 3)
							st64(s600 + 8, 0x20)
							st64(s618, 0)
							st64(s628, 0)
							if (fn_14b198(s260, s628) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
							}
							copyr(s360, s40, 0x18)
							copy(s378, s70, 0x18)
							memcpy(s621, s378, 0x30)
							bh = s628
							bg = 0x51
							bf = ad + 0x50
							if (ld8(ad + 0x50) != 0) {
								break B82
							}
						}
						bh = s628
					}
					st8(bf, 0)
					bk = memcpy(ad + bg, bh, 0x37)
					bi = ld64(s7f8 + 0x10)
					st64(bi, ld64(bi) - 1)
					bj = ld64(s7f8 + 0x28)
					st64(bj + 8, ad)
					st64(bj, m)
					return bk
				}
				copyr(s628, n, 0x20)
				if ((memcmp(l, s628, 0x20) as u32) != 0 && ((memcmp(l + 0x20, s628, 0x20) as u32) != 0 && ((memcmp(l + 0x40, s628, 0x20) as u32) != 0 && ((memcmp(l + 0x60, s628, 0x20) as u32) != 0 && ((memcmp(l + 0x80, s628, 0x20) as u32) != 0 && ((memcmp(l + 0xa0, s628, 0x20) as u32) != 0 && ((memcmp(l + 0xc0, s628, 0x20) as u32) != 0 && ((memcmp(l + 0xe0, s628, 0x20) as u32) != 0 && ((memcmp(l + 0x100, s628, 0x20) as u32) != 0 && (memcmp(l + 0x120, s628, 0x20) as u32) != 0))))))))) {
					copyr(s628, n, 0x20)
					o = (memcmp(s628, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) == 0
				} else {
					o = 1
				}
				const q = ld64(s7f8 + 0x18)
				const r = clock_get(s628)
				if (ld64(s628) != 0) {
					const ac = ld64(s621 + 1)
					const ab = ld64(s618)
					st64(s618, ld64(s610))
					st64(s628, ac, ab)
					bk = fn_13e628(s798, s628)
					ad = ld64(s798 + 8)
					m = ld64(s798)
					bi = ld64(s7f8 + 0x10)
					st64(bi, ld64(bi) - 1)
					bj = ld64(s7f8 + 0x28)
					st64(bj + 8, ad)
					st64(bj, m)
					return bk
				}
				st64(s808, o)
				const p = ld64(s600)
				if ((p as i64) > -1) {
					if (q > p) {
						st64(s810, p)
						bk = fn_53e8(s628, ld64(ld64(s7f8 + 0x20) + 0x80), undef, undef, undef, r)
						const s = ld64(s618)
						const t = ld64(s621 + 1)
						ad = s
						m = t
						bi = ld64(s7f8 + 0x10)
						if (ld64(s628) != 0) {
							st64(bi, ld64(bi) - 1)
							bj = ld64(s7f8 + 0x28)
							st64(bj + 8, ad)
							st64(bj, m)
							return bk
						}
						B46: {
							st64(s818, s)
							if ((ld64(s808) & 1) == 0) {
								const u = ld64(ld64(ld64(s7f8 + 0x20)))
								copyr(s628, u, 0x20)
								const v = t + (c as u8) * 0xa9 + 0x1fe
								if ((memcmp(s628, v, 0x20) as u32) != 0) {
									ErrorCode_name(s40, 0x100159874, undef, t)
									st64(s378, 0, 1, 0)
									st64(s260, s378, 0x10015f818)
									st8(s258 + 0x10, 3)
									st64(s258 + 8, 0x20)
									st64(s270, 0)
									st64(s280, 0)
									if (ErrorCode_fmt(0x100159874, s280) != 0) {
										fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
									}
									copyr(s5f0, s378, 0x18)
									copy(s608, s40, 0x18)
									st64(s621 + 1, 0x10015a0e6)
									st32(s5c8 + 0x38, 0x9c6 /* anchor::RequireKeysEqViolated */)
									st8(s5e0 + 8, 2)
									st32(s610, 0x43)
									st64(s618, 0x32)
									st64(s628, 0)
									const ah = fn_13e5a0(s698, s628)
									const ag = ld64(s698 + 8)
									const af = ld64(s698)
									const ae = ld64(ld64(ld64(s7f8 + 0x20)))
									copyr(s628, ae, 0x20)
									copy(s608, v, 0x20)
									bk = Error_with_pubkeys(s6a8, af, ag, s628, ah)
									ad = ld64(s6a8 + 8)
									m = ld64(s6a8)
									break B46
								}
							}
							st64(s820, t)
							bk = fn_6c2a0(s628, t, ld64(s810))
							ad = ld64(s618)
							m = ld64(s621 + 1)
							if (ld8(s628) == 0) {
								const w = ld64(s820) + (c as u8) * 0xa9 + 0x185
								memcpy(s421, w, 0xa9)
								st64(s628, 0, 0, 0, 0)
								if ((memcmp(s3e8, s628, 0x20) as u32) != 0) {
									if ((ld64(s808) & 1) != 0) {
										st64(sff8 + 8, ld64(s7f8 + 8))
										st64(sff8, ld64(s7f8 + 0x18))
										st64(s1000, ld64(s7f8))
										bk = fn_494d0(s628, s421, ld64(s810), d, ld64(s1000), ld64(sff8), ld64(sff8 + 8))
										ad = ld64(s621 + 1)
										m = ld64(s628)
										if (m != 2) {
											break B46
										}
									} else {
										const al = ld64(s7f8 + 0x18)
										const ak = ld64(s7f8 + 8)
										const aj = ld64(s810)
										if (ld64(s421 + 1) >= aj) {
											fn_85138(s40, 0x10015982c)
											st64(s378, 0, 1, 0)
											st64(s260, s378, 0x10015f818)
											st8(s258 + 0x10, 3)
											st64(s258 + 8, 0x20)
											st64(s270, 0)
											st64(s280, 0)
											if (fn_88558(0x10015982c, s280) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
											}
											copyr(s5f0, s378, 0x18)
											copy(s608, s40, 0x18)
											st64(s621 + 1, 0x10015a0e6)
											st32(s5c8 + 0x38, 0x1770 /* error::NotApproved */)
											st8(s5e0 + 8, 2)
											st32(s610, 0x5a)
											st64(s618, 0x32)
											st64(s628, 0)
											bk = fn_13e5a0(s6b8, s628)
											ad = ld64(s6b8 + 8)
											m = ld64(s6b8)
											break B46
										}
										st64(sff8, al, ak)
										st64(s1000, ld64(s7f8))
										bk = fn_48a08(s628, s421, aj, d, ld64(s1000), al, ak)
										ad = ld64(s621 + 1)
										m = ld64(s628)
										if (m != 2) {
											break B46
										}
									}
									if (ad > 0x5555555555555554) {
										ErrorCode_name(s40, 0x100159900, am, an, ao)
										st64(s378, 0, 1, 0)
										st64(s260, s378, 0x10015f818)
										st8(s258 + 0x10, 3)
										st64(s258 + 8, 0x20)
										st64(s270, 0)
										st64(s280, 0)
										if (ErrorCode_fmt(0x100159900, s280) != 0) {
											fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
										}
										copyr(s5f0, s378, 0x18)
										copy(s608, s40, 0x18)
										st64(s621 + 1, 0x10015a0e6)
										st32(s5c8 + 0x38, 0x9c9 /* anchor::RequireGtViolated */)
										st8(s5e0 + 8, 2)
										st32(s610, 0x66 /* anchor::InstructionDidNotDeserialize */)
										st64(s618, 0x32)
										st64(s628, 0)
										fn_13e5a0(s768, s628)
										bk = fn_1730(s778, ld64(s768), ld64(s768 + 8), 0x5555555555555555, ad)
										ad = ld64(s778 + 8)
										m = ld64(s778)
									} else {
										const ap = ld64(s421 + 0x29)
										if (ap + ad >= ap) {
											bk = memcpy(w, s421, 0xa9)
											if (ad != 0) {
												const aq = ld64(ld64(s800) + 0x18)
												st64(s7f8 + 0x18, aq)
												if (aq == 0) {
													bk = fn_88360(s748, 2)
													ad = ld64(s748 + 8)
													m = ld64(s748)
													break B46
												}
												const ar = ld64(ld64(s800) + 0x10)
												st64(s7f8 + 8, ar)
												bk = InterfaceAccount_try_from_unchecked(s628, ar)
												const au = ld64(s621 + 1)
												m = ld64(s628)
												const at = ld32(s5c8 + 0x50)
												if (at == 2) {
													ad = au
													break B46
												}
												copyr(s368, s618, 0x10)
												copy(s2a0, s600, 0x20)
												st64(s7f8, ld64(s608))
												memcpy(s330, s5e0, 0x68)
												copy(s2c4, s574, 0x20)
												st32(s2c4 + 0x20, ld32(s574 + 0x20))
												st64(s378, m, au)
												copy(s350, s2a0, 0x20)
												st64(s360 + 8, ld64(s7f8))
												st32(s330 + 0x68, at)
												if (ld64(s7f8 + 0x18) == 1) {
													bk = fn_88360(s738, 2)
													ad = ld64(s738 + 8)
													m = ld64(s738)
													break B46
												}
												bk = InterfaceAccount_try_from_unchecked(s628, ld64(s7f8 + 8) + 0x30)
												const aw = ld64(s621 + 1)
												m = ld64(s628)
												const av = ld32(s5c8 + 0x50)
												if (av == 2) {
													ad = aw
													break B46
												}
												st64(s800, s1a8)
												memcpy(s1a8, s618, 0xa0)
												copy(s1cc, s574, 0x20)
												st32(s1cc + 0x20, ld32(s574 + 0x20))
												st64(s280, m, aw)
												memcpy(s270, ld64(s800), 0xa0)
												st32(s258 + 0x88, av)
												if (ld64(s7f8 + 0x18) == 2) {
													bk = fn_88360(s728, 2)
													ad = ld64(s728 + 8)
													m = ld64(s728)
													break B46
												}
												bk = InterfaceAccount_try_from(s628, ld64(s7f8 + 8) + 0x60)
												const ax = ld32(s628)
												if (ax == 2) {
													ad = ld64(s618)
													m = ld64(s621 + 1)
													break B46
												}
												st64(s800, ld64(s618))
												st64(s7f8 + 8, ld64(s621 + 1))
												st64(s7f8 + 0x18, ld32(s628 + 4))
												memcpy(se8, s610, 0x40)
												copy(s108, s5c8, 0x20)
												const bn = ld64(s5e0 + 0x10)
												if ((memcmp(s350, s258, 0x20) as u32) != 0) {
													ErrorCode_name(s88, 0x100159874)
													st64(s70, 0, 1, 0)
													st64(s20, s70, 0x10015f818)
													st8(s20 + 0x18, 3)
													st64(s20 + 0x10, 0x20)
													st64(s40 + 0x10, 0)
													st64(s40, 0)
													if (ErrorCode_fmt(0x100159874, s40) != 0) {
														fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
													}
													copy(s608, s88, 0x30)
													st64(s621 + 1, 0x10015a0e6)
													st32(s5c8 + 0x38, 0x9c6 /* anchor::RequireKeysEqViolated */)
													st8(s5e0 + 8, 2)
													st32(s610, 0x7b)
													st64(s618, 0x32)
													st64(s628, 0)
													const be = fn_13e5a0(s6c8, s628)
													const bd = ld64(s6c8 + 8)
													const bc = ld64(s6c8)
													copyr(s628, s2a0, 0x20)
													copy(s608, s190, 0x20)
													bk = Error_with_pubkeys(s6d8, bc, bd, s628, be)
													ad = ld64(s6d8 + 8)
													m = ld64(s6d8)
													break B46
												}
												const ay = ld64(ld64(s7f8))
												copyr(sa8, ay, 0x20)
												if ((memcmp(sa8, s3c8, 0x20) as u32) != 0) {
													ErrorCode_name(s88, 0x100159874)
													st64(s70, 0, 1, 0)
													st64(s20, s70, 0x10015f818)
													st8(s20 + 0x18, 3)
													st64(s20 + 0x10, 0x20)
													st64(s40 + 0x10, 0)
													st64(s40, 0)
													if (ErrorCode_fmt(0x100159874, s40) != 0) {
														fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
													}
													copy(s608, s88, 0x30)
													st64(s621 + 1, 0x10015a0e6)
													st32(s5c8 + 0x38, 0x9c6 /* anchor::RequireKeysEqViolated */)
													st8(s5e0 + 8, 2)
													st32(s610, 0x7c)
													st64(s618, 0x32)
													st64(s628, 0)
													const bb = fn_13e5a0(s6e8, s628)
													const ba = ld64(s6e8 + 8)
													const az = ld64(s6e8)
													copyr(s608, s3c8, 0x20)
													copy(s628, sa8, 0x20)
													bk = Error_with_pubkeys(s6f8, az, ba, s628, bb)
													ad = ld64(s6f8 + 8)
													m = ld64(s6f8)
													break B46
												}
												const bl = ld64(0x300000000 /* heap bump-allocator cursor */)
												const bm = bl != 0 ? sat_sub(bl, 0x80) & -8 : 0x300007f80
												if (0x300000008 > bm) {
													alloc_handle_alloc_error(8, 0x80)
												}
												st64(0x300000000 /* heap bump-allocator cursor */, bm)
												st64(bm + 0x10, ld64(s800))
												st64(bm + 8, ld64(s7f8 + 8))
												st32(bm + 4, ld64(s7f8 + 0x18))
												st32(bm, ax)
												memcpy(bm + 0x18, se8, 0x40)
												st64(bm + 0x58, bn)
												copy(bm + 0x60, s108, 0x20)
												bk = fn_7d178(s628, bm, ad)
												const bo = ld64(s621 + 1)
												m = ld64(s628)
												if (m != 2) {
													ad = bo
													break B46
												}
												const bp = bo + ad
												st64(s808, bp)
												if (ad > bp) {
													bk = fn_88360(s718, 0x26)
													ad = ld64(s718 + 8)
													m = ld64(s718)
													break B46
												}
												AccountInfo_clone_f338(s70, ld64(s260))
												AccountInfo_clone_f338(s40, ld64(s7f8))
												const bq = ld64(0x300000000 /* heap bump-allocator cursor */)
												const br = bq != 0 ? sat_sub(bq, 0x80) & -8 : 0x300007f80
												if (0x300000008 > br) {
													alloc_handle_alloc_error(8, 0x80)
												}
												st64(0x300000000 /* heap bump-allocator cursor */, br)
												st64(br + 0x10, ld64(s800))
												st64(br + 8, ld64(s7f8 + 8))
												st32(br + 4, ld64(s7f8 + 0x18))
												st32(br, ax)
												memcpy(br + 0x18, se8, 0x40)
												st64(br + 0x58, bn)
												copy(br + 0x60, s108, 0x20)
												const bs = ld64(s7f8 + 0x20)
												const bt = ld64(bs + 0x90)
												const bu = AccountInfo_clone_f338(s628, ld64(bs + 0x98))
												st64(sff8 + 0x10, ld64(s808))
												st64(s1000, br, bt, s628)
												const bv = fn_79050(s708, bs, s70, s40, br, bt, s628, ld64(sff8 + 0x10), bu, br)
												ad = ld64(s708 + 8)
												m = ld64(s708)
												bk = ptr_drop_in_place_fcd8(s70, ptr_drop_in_place_fcd8(s40, bv))
												if (m != 2) {
													break B46
												}
											}
											const bw = ld64(s818)
											st64(bw, ld64(bw) + 1)
											const bx = ld64(s7f8 + 0x10)
											st64(bx, ld64(bx) - 1)
											bj = ld64(s7f8 + 0x28)
											st64(bj + 8, ad)
											st64(bj, 2)
											return bk
										}
										bk = fn_88360(s758, 0x25)
										ad = ld64(s758 + 8)
										m = ld64(s758)
									}
								} else {
									fn_85138(s40, 0x100159910)
									st64(s378, 0, 1, 0)
									st64(s260, s378, 0x10015f818)
									st8(s258 + 0x10, 3)
									st64(s258 + 8, 0x20)
									st64(s270, 0)
									st64(s280, 0)
									if (fn_88558(0x100159910, s280) != 0) {
										fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
									}
									copyr(s5f0, s378, 0x18)
									copy(s608, s40, 0x18)
									st64(s621 + 1, 0x10015a0e6)
									st32(s5c8 + 0x38, 0x1791 /* error::UnInitializedRewardInfo */)
									st8(s5e0 + 8, 2)
									st32(s610, 0x4d)
									st64(s618, 0x32)
									st64(s628, 0)
									bk = fn_13e5a0(s788, s628)
									ad = ld64(s788 + 8)
									m = ld64(s788)
								}
							}
						}
						const ai = ld64(s818)
						st64(ai, ld64(ai) + 1)
						bi = ld64(s7f8 + 0x10)
						st64(bi, ld64(bi) - 1)
						bj = ld64(s7f8 + 0x28)
						st64(bj + 8, ad)
						st64(bj, m)
						return bk
					}
					ErrorCode_name(s40, 0x100159900)
					st64(s378, 0, 1, 0)
					st64(s260, s378, 0x10015f818)
					st8(s258 + 0x10, 3)
					st64(s258 + 8, 0x20)
					st64(s270, 0)
					st64(s280, 0)
					if (ErrorCode_fmt(0x100159900, s280) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
					}
					copyr(s5f0, s378, 0x18)
					copy(s608, s40, 0x18)
					st64(s621 + 1, 0x10015a0e6)
					st32(s5c8 + 0x38, 0x9c9 /* anchor::RequireGtViolated */)
					st8(s5e0 + 8, 2)
					st32(s610, 0x3e)
					st64(s618, 0x32)
					st64(s628, 0)
					fn_13e5a0(s678, s628)
					bk = fn_1730(s688, ld64(s678), ld64(s678 + 8), q, p)
					ad = ld64(s688 + 8)
					m = ld64(s688)
					bi = ld64(s7f8 + 0x10)
					st64(bi, ld64(bi) - 1)
					bj = ld64(s7f8 + 0x28)
					st64(bj + 8, ad)
					st64(bj, m)
					return bk
				}
				bk = fn_88360(s668, 0x26)
				ad = ld64(s668 + 8)
				m = ld64(s668)
				bi = ld64(s7f8 + 0x10)
				st64(bi, ld64(bi) - 1)
				bj = ld64(s7f8 + 0x28)
				st64(bj + 8, ad)
				st64(bj, m)
				return bk
			}
			raw_vec_handle_error(1, 0x140, 0x10015f8f8, 0x140 > k)
		}
		ErrorCode_name(s40, 0x100159900, c, d, e)
		st64(s378, 0, 1, 0)
		st64(s260, s378, 0x10015f818)
		st8(s258 + 0x10, 3)
		st64(s258 + 8, 0x20)
		st64(s270, 0)
		st64(s280, 0)
		if (ErrorCode_fmt(0x100159900, s280) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
		}
		copyr(s5f0, s378, 0x18)
		copy(s608, s40, 0x18)
		st64(s621 + 1, 0x10015a0e6)
		st32(s5c8 + 0x38, 0x9c9 /* anchor::RequireGtViolated */)
		st8(s5e0 + 8, 2)
		st32(s610, 0x34)
		st64(s618, 0x32)
		st64(s628, 0)
		fn_13e5a0(s648, s628)
		bk = fn_1730(s658, ld64(s648), ld64(s648 + 8), f, g)
		m = ld64(s658)
		bj = ld64(s7f8 + 0x28)
		st64(bj + 8, ld64(s658 + 8))
		st64(bj, m)
		return bk
	}
	fn_85138(s40, 0x1001598cc)
	st64(s378, 0, 1, 0)
	st64(s260, s378, 0x10015f818)
	st8(s258 + 0x10, 3)
	st64(s258 + 8, 0x20)
	st64(s270, 0)
	st64(s280, 0)
	if (fn_88558(0x1001598cc, s280) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
	}
	copyr(s5f0, s378, 0x18)
	copy(s608, s40, 0x18)
	st64(s621 + 1, 0x10015a0e6)
	st32(s5c8 + 0x38, 0x1789 /* error::InvalidRewardIndex */)
	st8(s5e0 + 8, 2)
	st32(s610, 0x30)
	st64(s618, 0x32)
	st64(s628, 0)
	bk = fn_13e5a0(s638, s628)
	m = ld64(s638)
	bj = ld64(s7f8 + 0x28)
	st64(bj + 8, ld64(s638 + 8))
	st64(bj, m)
	return bk
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), d (value), c (value), p5 (value), p6 (value), p7 (value)
export function fn_494d0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, sd8 = fp - 0xd8, se0 = fp - 0xe0, se8 = fp - 0xe8
	let m, r, s, u, v, w, x, y: u64
	st64(sd8, d)
	const g = p5
	const l = p7
	const q = p6
	const f = ld64(b + 9)
	if (ld64(b + 0x11) != f && c >= ld64(b + 1)) {
		st64(se0, a)
		if (c > f) {
			w = fn_88360(sa0, 0x26)
			v = ld64(sa0)
			u = ld64(se0)
			st64(u + 8, ld64(sa0 + 8))
			st64(u, v)
			return w
		}
		const h = ld64(b + 0x21)
		const i = ld64(b + 0x19)
		st64(se8, 0)
		const j = g - h - (i > ld64(sd8))
		let k = d - i > ld64(sd8)
		k = j != g ? j > g : k
		st64(s60, f - c, 0, k != 0 ? 0 : d - i, k != 0 ? 0 : j, 0, 1)
		fn_58930(s30, s60, s50, s40)
		m = f > l
		if (m == 0) {
			st64(se8, l - f)
		}
		if (ld64(s30) != 0) {
			if (ld64(s30 + 0x10) == 0) {
				const o = ld64(s30 + 8)
				const n = ld64(sd8)
				st64(b + 0x19, n, g)
				st64(s60, ld64(se8))
				st64(s58, 0, n, g, 0, 1)
				w = fn_58930(s30, s60, s50, s40)
				m = undef
				if (ld64(s30) != 1) {
					w = fn_88360(s80, 0x26)
					v = ld64(s80)
					u = ld64(se0)
					st64(u + 8, ld64(s80 + 8))
					st64(u, v)
					return w
				}
				if (ld64(s30 + 0x10) == 0) {
					const p = ld64(s30 + 8)
					if (o > o + p) {
						w = fn_88360(s90, 0x26)
						v = ld64(s90)
						u = ld64(se0)
						st64(u + 8, ld64(s90 + 8))
						st64(u, v)
						return w
					}
					st64(b + 9, l)
					r = ld64(se0)
					st64(r + 8, p + o)
					st64(r, 2)
					return w
				}
				st64(s30, 0x10015fe18, 1, 8, 0, 0)
				// fmt "Integer overflow when casting to u64"
				fn_14ec00(s30, 0x10015fe28, m, x, y)
			}
			st64(s30, 0x10015fe18, 1, 8, 0, 0)
			// fmt "Integer overflow when casting to u64"
			fn_14ec00(s30, 0x10015fe28, m, x, y)
		}
		w = fn_88360(s70, 0x26)
		v = ld64(s70)
		u = ld64(se0)
		st64(u + 8, ld64(s70 + 8))
		st64(u, v)
		return w
	}
	if (q > l) {
		w = fn_88360(sd0, 0x26)
		s = ld64(sd0)
		st64(a + 8, ld64(sd0 + 8))
		st64(a, s)
		return w
	}
	r = a
	if (l == q) {
		w = fn_88360(sc0, 0x1f)
		s = ld64(sc0)
		st64(r + 8, ld64(sc0 + 8))
		st64(r, s)
		return w
	}
	st64(se0, l)
	st64(s60, l - q, 0)
	st64(s50 + 8, g)
	st64(s50, ld64(sd8))
	st64(s40, 0, 1)
	w = fn_58930(s30, s60, s50, s40)
	m = undef
	if (ld64(s30) != 1) {
		w = fn_88360(sb0, 0x26)
		s = ld64(sb0)
		st64(r + 8, ld64(sb0 + 8))
		st64(r, s)
		return w
	}
	if (ld64(s30 + 0x10) == 0) {
		const t = ld64(s30 + 8)
		st64(b + 0x19, ld64(sd8))
		st64(b + 0x11, q)
		st64(b + 1, q)
		st64(b + 9, ld64(se0))
		st64(b + 0x21, g)
		st64(r + 8, t)
		st64(r, 2)
		return w
	}
	st64(s30, 0x10015fe18, 1, 8, 0, 0)
	// fmt "Integer overflow when casting to u64"
	fn_14ec00(s30, 0x10015fe28, m, x, y)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), d (value), c (value), p5 (value), p6 (value), p7 (value)
export function fn_48a08(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8
	let s, t, u, v, w, x: u64
	const i = p5
	const g = p7
	const f = ld64(b + 9)
	if (ld64(b + 0x11) == f) {
		const h = p6
		if (h > g) {
			t = fn_88360(s1c8, 0x26)
			s = ld64(s1c8)
			st64(a + 8, ld64(s1c8 + 8))
			st64(a, s)
			return t
		}
		if (0xffffffffff92937f > g - h - 0x76a701) {
			t = fn_88360(s1b8, 0x1f)
			s = ld64(s1b8)
			st64(a + 8, ld64(s1b8 + 8))
			st64(a, s)
			return t
		}
		x = b
		st64(s78, g - h, 0)
		st64(s60, d, i)
		st64(s48, 0, 1)
		t = fn_58930(s118, s78, s60, s48)
		if (ld64(s118) != 1) {
			t = fn_88360(s1a8, 0x26)
			s = ld64(s1a8)
			st64(a + 8, ld64(s1a8 + 8))
			st64(a, s)
			return t
		}
		if (ld64(s118 + 0x10) == 0) {
			const j = ld64(s118 + 8)
			st64(x + 0x19, d)
			st64(x + 0x11, h)
			st64(x + 1, h, g)
			st64(x + 0x21, i)
			st64(a + 8, j)
			st64(a, 2)
			return t
		}
	} else {
		if (c > f) {
			t = fn_88360(s198, 0x26)
			s = ld64(s198)
			st64(a + 8, ld64(s198 + 8))
			st64(a, s)
			return t
		}
		if (f > g) {
			t = fn_88360(s188, 0x26)
			s = ld64(s188)
			st64(a + 8, ld64(s188 + 8))
			st64(a, s)
			return t
		}
		if (0xffffffffff92937f > g - f - 0x76a701) {
			fn_85138(s78, 0x1001598c4)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (fn_88558(0x1001598c4, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copy(sf8, s78, 0x30)
			st64(s118 + 8, 0x10015a0e6)
			st32(sf8 + 0x78, 0x1790 /* error::NotApproveUpdateRewardEmissions */)
			st8(sf8 + 0x30, 2)
			st32(s118 + 0x18, 0xbc)
			st64(s118 + 0x10, 0x32)
			st64(s118, 0)
			t = fn_13e5a0(s178, s118)
			s = ld64(s178)
			st64(a + 8, ld64(s178 + 8))
			st64(a, s)
			return t
		}
		const l = ld64(b + 0x21)
		const k = ld64(b + 0x19)
		if (f - c >= 0x3f480) {
			const m = l != i ? l > i : k > d
			if ((m & 1) != 0) {
				ErrorCode_name(s78, 0x100159900, k, d, m & 1)
				st64(s60, 0, 1, 0)
				st64(s28, s60, 0x10015f818)
				st8(s28 + 0x18, 3)
				st64(s28 + 0x10, 0x20)
				st64(s48 + 0x10, 0)
				st64(s48, 0)
				if (ErrorCode_fmt(0x100159900, s48) != 0) {
					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
				}
				copy(sf8, s78, 0x30)
				st64(s118 + 8, 0x10015a0e6)
				st32(sf8 + 0x78, 0x9c9 /* anchor::RequireGtViolated */)
				st8(sf8 + 0x30, 2)
				st32(s118 + 0x18, 0xc1)
				st64(s118 + 0x10, 0x32)
				st64(s118, 0)
				fn_13e5a0(s158, s118)
				t = fn_1730(s168, ld64(s158), ld64(s158 + 8), 0x3f480, f - c)
				s = ld64(s168)
				st64(a + 8, ld64(s168 + 8))
				st64(a, s)
				return t
			}
		}
		const n = i - l - (k > d)
		const o = n != i ? n > i : k > d
		x = b
		st64(s78, f - c, 0)
		st64(s60, o != 0 ? 0 : d - k, o != 0 ? 0 : n)
		st64(s48, 0, 1)
		fn_58930(s118, s78, s60, s48)
		if (ld64(s118) == 0) {
			t = fn_88360(s128, 0x26)
			s = ld64(s128)
			st64(a + 8, ld64(s128 + 8))
			st64(a, s)
			return t
		}
		if (ld64(s118 + 0x10) == 0) {
			const p = ld64(s118 + 8)
			st64(x + 0x19, d, i)
			st64(s78, g - f, 0)
			st64(s60, d, i)
			st64(s48, 0, 1)
			t = fn_58930(s118, s78, s60, s48)
			if (ld64(s118) != 1) {
				t = fn_88360(s138, 0x26)
				s = ld64(s138)
				st64(a + 8, ld64(s138 + 8))
				st64(a, s)
				return t
			}
			if (ld64(s118 + 0x10) == 0) {
				const q = ld64(s118 + 8)
				const r = x
				if (p > p + q) {
					t = fn_88360(s148, 0x26)
					s = ld64(s148)
					st64(a + 8, ld64(s148 + 8))
					st64(a, s)
					return t
				}
				st64(r + 9, g)
				st64(a + 8, q + p)
				st64(a, 2)
				return t
			}
		}
	}
	st64(s118, 0x10015fe18, 1, 8, 0, 0)
	// fmt "Integer overflow when casting to u64"
	fn_14ec00(s118, 0x10015fe28, u, v, w)
}

export function fn_c03e8(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10
	const j = fn_a80(s10, ld64(b + 0x80), c)
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
		st64(h, 0x6174735f6c6f6f70)
		st16(h + 8, 0x6574)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x6174735f6c6f6f70)
		st16(h + 8, 0x6574)
		void ld64(i)
	}
	st64(i + 0x10, h, 0xa)
	st64(i + 8, 0xa)
	st64(i, 1)
	st64(a + 8, i)
	st64(a, f)
	return j
}
