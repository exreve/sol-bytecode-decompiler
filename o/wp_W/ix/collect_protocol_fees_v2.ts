/// <reference path="../lib.d.ts" />
// instruction collect_protocol_fees_v2
import { fn_11150, fn_12758, fn_6aa0, fn_7a5e0, fn_7e5e0, fn_c9a0, memcpy } from '../shared.ts'

// instruction handler: collect_protocol_fees_v2 (discriminator sha256("global:collect_protocol_fees_v2")[..8] = 0xc816c87286de8067)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, whirlpool, token_mint_a, token_mint_b, token_vault_a, token_vault_b, token_destination_a, token_destination_b, token_program_a, token_program_b, collect_protocol_fees_authority, memo_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
export function ix_collect_protocol_fees_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s18 = fp - 0x18, s490 = fp - 0x490, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s920 = fp - 0x920, s930 = fp - 0x930, s938 = fp - 0x938, s948 = fp - 0x948, s958 = fp - 0x958, s968 = fp - 0x968, s978 = fp - 0x978
	let j, k: u64
	sol_log("Instruction: CollectProtocolFeesV2", 0x22)
	st64(s938, ix_args, ix_args_len)
	fn_11150(s4a8, s938)
	const h = ld64(s4a8 + 8)
	const f = ld64(s4a8)
	if (f == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
		if (2 > (h & 3) - 2) {
			k = anchor_error_from(s978, 0x66 /* anchor::InstructionDidNotDeserialize */)
			j = ld64(s978)
			st64(a + 8, ld64(s978 + 8))
			st64(a, j)
			return k
		}
		if ((h & 3) == 0) {
			k = anchor_error_from(s978, 0x66 /* anchor::InstructionDidNotDeserialize */)
			j = ld64(s978)
			st64(a + 8, ld64(s978 + 8))
			st64(a, j)
			return k
		}
		const i = ld64(ld64(h + 7))
		callx(i, ld64(h - 1), i)
		k = anchor_error_from(s978, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s978)
		st64(a + 8, ld64(s978 + 8))
		st64(a, j)
		return k
	}
	const o = ld64(s498)
	st64(s948, accounts, accounts_len)
	k = accounts_collect_protocol_fees_v2(s4a8, undef, s948, undef, fp)
	const g = ld32(s4a8)
	if (g == 2) {
		j = ld64(s4a8 + 8)
		st64(a + 8, ld64(s498))
		st64(a, j)
		return k
	}
	const n = ld32(s4a8 + 4)
	const m = ld64(s4a8 + 8)
	const l = ld64(s498)
	memcpy(s920, s490, 0x478)
	st64(s930, m, l)
	st32(s938, g, n)
	copyr(s498, s948, 0x10)
	st64(s4a8, program_id, s938)
	st64(s18, f, h, o)
	k = fn_3b6d8(s958, s4a8, s18, l)
	j = ld64(s958)
	if (j != 2) {
		st64(a + 8, ld64(s958 + 8))
		st64(a, j)
		return k
	}
	k = fn_d7470(s968, s938, program_id)
	j = ld64(s968)
	st64(a + 8, ld64(s968 + 8))
	st64(a, j)
	return k
}

// Anchor Accounts::try_accounts of instruction collect_protocol_fees_v2 (called by ix_collect_protocol_fees_v2; name [str]: from the handler's "Instruction: …" log; was fn_d4d68)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, whirlpool (ConstraintMut, ConstraintHasOne), token_mint_a (ConstraintAddress), token_mint_b (ConstraintAddress), token_vault_a (ConstraintMut, ConstraintAddress), token_vault_b (ConstraintMut, ConstraintAddress), token_destination_a (ConstraintMut, ConstraintRaw), token_destination_b (ConstraintMut, ConstraintRaw), token_program_a (ConstraintAddress), token_program_b (ConstraintAddress), collect_protocol_fees_authority (ConstraintAddress), memo_program
export function accounts_collect_protocol_fees_v2(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1dc = fp - 0x1dc, s230 = fp - 0x230, s268 = fp - 0x268, s278 = fp - 0x278, s280 = fp - 0x280, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2d0 = fp - 0x2d0, s2f4 = fp - 0x2f4, s380 = fp - 0x380, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3cc = fp - 0x3cc, s458 = fp - 0x458, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s518 = fp - 0x518, s540 = fp - 0x540, s550 = fp - 0x550, s5d8 = fp - 0x5d8, s600 = fp - 0x600, s640 = fp - 0x640, s660 = fp - 0x660, s6a0 = fp - 0x6a0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s700 = fp - 0x700, s710 = fp - 0x710, s720 = fp - 0x720, s730 = fp - 0x730, s740 = fp - 0x740, s750 = fp - 0x750, s760 = fp - 0x760, s770 = fp - 0x770, s780 = fp - 0x780, s790 = fp - 0x790, s7a0 = fp - 0x7a0, s7b0 = fp - 0x7b0, s7c0 = fp - 0x7c0, s7d0 = fp - 0x7d0, s7e0 = fp - 0x7e0, s7f0 = fp - 0x7f0, s800 = fp - 0x800, s810 = fp - 0x810, s820 = fp - 0x820, s830 = fp - 0x830, s840 = fp - 0x840, s850 = fp - 0x850, s860 = fp - 0x860, s870 = fp - 0x870, s880 = fp - 0x880, s890 = fp - 0x890, s8a0 = fp - 0x8a0, s8b0 = fp - 0x8b0, s8c0 = fp - 0x8c0, s8d0 = fp - 0x8d0, s8e0 = fp - 0x8e0, s8f0 = fp - 0x8f0, s900 = fp - 0x900, s910 = fp - 0x910, s920 = fp - 0x920, s930 = fp - 0x930, s940 = fp - 0x940, s950 = fp - 0x950, s960 = fp - 0x960, s970 = fp - 0x970, s980 = fp - 0x980, s990 = fp - 0x990, s9a0 = fp - 0x9a0, s9b0 = fp - 0x9b0, s9c0 = fp - 0x9c0, s9d0 = fp - 0x9d0, s9e0 = fp - 0x9e0, sa58 = fp - 0xa58, sa78 = fp - 0xa78, sa90 = fp - 0xa90
	let m, n: u64
	try_accounts_11de0(s290, c, c, d, e)
	if (ld64(s290) == 0) {
		n = Error_with_account_name(s9e0, ld64(s290 + 8), ld64(s280), "whirlpools_config", 0x11)
		m = ld64(s9e0)
		st64(a + 0x10, ld64(s9e0 + 8))
		st64(a + 8, m)
		st32(a, 2)
		return n
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x70) & -8 : 0x300007f90
	if (g > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, s290, 0x70)
		try_accounts_11a48(s290, c)
		if (ld64(s290) == 0) {
			n = Error_with_account_name(s9d0, ld64(s290 + 8), ld64(s280), 0x100152b28 /* "whirlpool" */, 9)
			m = ld64(s9d0)
			st64(a + 0x10, ld64(s9d0 + 8))
			st64(a + 8, m)
			st32(a, 2)
			return n
		}
		const h = ld64(0x300000000 /* heap bump-allocator cursor */)
		const i = h != 0 ? sat_sub(h, 0x290) & -8 : 0x300007d70
		if (i > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			memcpy(i, s290, 0x290)
			try_accounts_11718(s290, c)
			const k = ld64(s290 + 8)
			const j = ld64(s290)
			if (j == 2) {
				st64(sa58 + 0x70, k)
				try_accounts_610(s290, c, k)
				const l = ld32(s290)
				if (l == 2) {
					n = Error_with_account_name(s9c0, ld64(s290 + 8), ld64(s280), "token_mint_a", 0xc)
					m = ld64(s9c0)
					st64(a + 0x10, ld64(s9c0 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				st64(sa58 + 0x50, l)
				st64(sa58 + 0x58, ld64(s280))
				st64(sa58 + 0x60, ld64(s290 + 8))
				st64(sa58 + 0x48, ld32(s290 + 4))
				memcpy(s6a0, s278, 0x40)
				copy(s6c0, s230, 0x20)
				st64(sa58 + 0x68, ld64(s268 + 0x30))
				try_accounts_610(s290, c)
				const o = ld32(s290)
				if (o == 2) {
					n = Error_with_account_name(s9b0, ld64(s290 + 8), ld64(s280), "token_mint_b", 0xc)
					m = ld64(s9b0)
					st64(a + 0x10, ld64(s9b0 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				st64(sa58 + 0x28, o)
				st64(sa58 + 0x30, ld64(s280))
				st64(sa58 + 0x38, ld64(s290 + 8))
				st64(sa58 + 0x20, ld32(s290 + 4))
				memcpy(s640, s278, 0x40)
				copy(s660, s230, 0x20)
				st64(sa58 + 0x40, ld64(s268 + 0x30))
				try_accounts_558(s290, c)
				const r = ld64(s290 + 8)
				const q = ld64(s290)
				const p = ld32(s230 + 0x50)
				if (p == 2) {
					n = Error_with_account_name(s9a0, q, r, "token_vault_a", 0xd)
					m = ld64(s9a0)
					st64(a + 0x10, ld64(s9a0 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				st64(sa58, p, q, r)
				copyr(s550, s280, 0x10)
				st64(sa58 + 0x18, ld64(s278 + 8))
				memcpy(s5d8, s268, 0x88)
				copy(s600, s1dc, 0x20)
				st32(s600 + 0x20, ld32(s1dc + 0x20))
				try_accounts_558(s290, c)
				const u = ld64(s290 + 8)
				const t = ld64(s290)
				const s = ld32(s230 + 0x50)
				if (s == 2) {
					n = Error_with_account_name(s990, t, u, "token_vault_b", 0xd)
					m = ld64(s990)
					st64(a + 0x10, ld64(s990 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				st64(sa78, s, t, u)
				copyr(s490, s280, 0x10)
				st64(sa78 + 0x18, ld64(s278 + 8))
				memcpy(s518, s268, 0x88)
				copy(s540, s1dc, 0x20)
				st32(s540 + 0x20, ld32(s1dc + 0x20))
				try_accounts_558(s290, c)
				const x = ld64(s290 + 8)
				const w = ld64(s290)
				const v = ld32(s230 + 0x50)
				if (v == 2) {
					n = Error_with_account_name(s980, w, x, "token_destination_a", 0x13)
					m = ld64(s980)
					st64(a + 0x10, ld64(s980 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				st64(sa90, x, v, w)
				memcpy(s470, s280, 0xa0)
				copy(s3cc, s1dc, 0x20)
				st32(s3cc + 0x20, ld32(s1dc + 0x20))
				st32(s458 + 0x88, ld64(sa90 + 8))
				st64(s480 + 8, ld64(sa90))
				st64(s480, ld64(sa90 + 0x10))
				try_accounts_558(s290, c)
				const aa = ld64(s290 + 8)
				const z = ld64(s290)
				const y = ld32(s230 + 0x50)
				if (y == 2) {
					n = Error_with_account_name(s970, z, aa, "token_destination_b", 0x13)
					m = ld64(s970)
					st64(a + 0x10, ld64(s970 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				st64(sa90, aa, y, z)
				memcpy(s398, s280, 0xa0)
				copy(s2f4, s1dc, 0x20)
				st32(s2f4 + 0x20, ld32(s1dc + 0x20))
				st32(s380 + 0x88, ld64(sa90 + 8))
				st64(s3a8 + 8, ld64(sa90))
				st64(s3a8, ld64(sa90 + 0x10))
				try_accounts_120(s290, c)
				const ac = ld64(s290 + 8)
				const ab = ld64(s290)
				if (ab == 2) {
					st64(sa90 + 0x10, ac)
					try_accounts_120(s290, c, ac)
					const ae = ld64(s290 + 8)
					const ad = ld64(s290)
					if (ad == 2) {
						st64(sa90 + 8, ae)
						fn_12758(s290, c, ae)
						const ag = ld64(s290 + 8)
						const af = ld64(s290)
						if (af == 2) {
							if (ld8(ld64(i) + 0x29) == 0) {
								anchor_error_from(s950, 0x7d0 /* anchor::ConstraintMut */, ag)
								n = Error_with_account_name(s960, ld64(s950), ld64(s950 + 8), 0x100152b28 /* "whirlpool" */, 9)
								m = ld64(s960)
								st64(a + 0x10, ld64(s960 + 8))
								st64(a + 8, m)
								st32(a, 2)
								return n
							}
							copyr(s2d0, i + 0x188, 0x20)
							const ah = ld64(ld64(g))
							copyr(s2b0, ah, 0x20)
							if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
								anchor_error_from(s710, 0x7d1 /* anchor::ConstraintHasOne */)
								const ao = Error_with_account_name(s720, ld64(s710), ld64(s710 + 8), 0x100152b28 /* "whirlpool" */, 9)
								const an = ld64(s720 + 8)
								const am = ld64(s720)
								copy(s290, s2d0, 0x40)
								n = fn_13b5c0(s730, am, an, s290, ao)
								m = ld64(s730)
								st64(a + 0x10, ld64(s730 + 8))
								st64(a + 8, m)
								st32(a, 2)
								return n
							}
							const ai = ld64(ld64(sa58 + 0x70))
							copyr(s2d0, ai, 0x20)
							copyr(s2b0, g + 0x28, 0x20)
							if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
								const ap = ld64(ld64(sa58 + 0x68))
								copyr(s2d0, ap, 0x20)
								copyr(s2b0, i + 0x1a8, 0x20)
								if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
									const au = ld64(ld64(sa58 + 0x40))
									copyr(s2d0, au, 0x20)
									copyr(s2b0, i + 0x1e8, 0x20)
									if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
										if (ld8(ld64(sa58 + 0x18) + 0x29 /* is_writable */) == 0) {
											anchor_error_from(s930, 0x7d0 /* anchor::ConstraintMut */)
											n = Error_with_account_name(s940, ld64(s930), ld64(s930 + 8), "token_vault_a", 0xd)
											m = ld64(s940)
											st64(a + 0x10, ld64(s940 + 8))
											st64(a + 8, m)
											st32(a, 2)
											return n
										}
										const ay = ld64(ld64(sa58 + 0x18) /* key */)
										copyr(s2d0, ay, 0x20)
										copyr(s2b0, i + 0x1c8, 0x20)
										if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
											anchor_error_from(s7d0, 0x7dc /* anchor::ConstraintAddress */)
											const bc = Error_with_account_name(s7e0, ld64(s7d0), ld64(s7d0 + 8), "token_vault_a", 0xd)
											const bb = ld64(s7e0 + 8)
											const ba = ld64(s7e0)
											copy(s290, s2d0, 0x40)
											n = fn_13b5c0(s7f0, ba, bb, s290, bc)
											m = ld64(s7f0)
											st64(a + 0x10, ld64(s7f0 + 8))
											st64(a + 8, m)
											st32(a, 2)
											return n
										}
										if (ld8(ld64(sa78 + 0x18) + 0x29 /* is_writable */) == 0) {
											anchor_error_from(s910, 0x7d0 /* anchor::ConstraintMut */)
											n = Error_with_account_name(s920, ld64(s910), ld64(s910 + 8), "token_vault_b", 0xd)
											m = ld64(s920)
											st64(a + 0x10, ld64(s920 + 8))
											st64(a + 8, m)
											st32(a, 2)
											return n
										}
										const az = ld64(ld64(sa78 + 0x18) /* key */)
										copyr(s2d0, az, 0x20)
										copyr(s2b0, i + 0x208, 0x20)
										if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
											anchor_error_from(s800, 0x7dc /* anchor::ConstraintAddress */)
											const bf = Error_with_account_name(s810, ld64(s800), ld64(s800 + 8), "token_vault_b", 0xd)
											const be = ld64(s810 + 8)
											const bd = ld64(s810)
											copy(s290, s2d0, 0x40)
											n = fn_13b5c0(s820, bd, be, s290, bf)
											m = ld64(s820)
											st64(a + 0x10, ld64(s820 + 8))
											st64(a + 8, m)
											st32(a, 2)
											return n
										}
										if (ld8(ld64(s470 + 0x10) + 0x29) == 0) {
											anchor_error_from(s8f0, 0x7d0 /* anchor::ConstraintMut */)
											n = Error_with_account_name(s900, ld64(s8f0), ld64(s8f0 + 8), "token_destination_a", 0x13)
											m = ld64(s900)
											st64(a + 0x10, ld64(s900 + 8))
											st64(a + 8, m)
											st32(a, 2)
											return n
										}
										if ((memcmp(s458, i + 0x1a8, 0x20) as u32) == 0) {
											if (ld8(ld64(s398 + 0x10) + 0x29) != 0) {
												if ((memcmp(s380, i + 0x1e8, 0x20) as u32) == 0) {
													const bg = ld64(ld64(sa90 + 0x10))
													copyr(s2d0, bg, 0x20)
													AccountInfo_clone(s290, ld64(sa58 + 0x68))
													const bh = ld64(s278)
													copy(s2b0, bh, 0x20)
													const bj = ld64(s280)
													const bi = ld64(s290 + 8)
													rc_dec(bi)
													rc_dec(bj)
													if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
														anchor_error_from(s870, 0x7dc /* anchor::ConstraintAddress */)
														const bt = Error_with_account_name(s880, ld64(s870), ld64(s870 + 8), "token_program_a", 0xf)
														const bs = ld64(s880 + 8)
														const br = ld64(s880)
														copy(s290, s2d0, 0x40)
														n = fn_13b5c0(s890, br, bs, s290, bt)
														m = ld64(s890)
														st64(a + 0x10, ld64(s890 + 8))
														st64(a + 8, m)
														st32(a, 2)
														return n
													}
													const bk = ld64(ld64(sa90 + 8))
													copyr(s2d0, bk, 0x20)
													AccountInfo_clone(s290, ld64(sa58 + 0x40))
													const bl = ld64(s278)
													copy(s2b0, bl, 0x20)
													const bn = ld64(s280)
													const bm = ld64(s290 + 8)
													rc_dec(bm)
													rc_dec(bn)
													if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
														memcpy(a + 0x2b0, s480, 0xd8)
														memcpy(a + 0x388, s3a8, 0xd8)
														memcpy(a + 0x18, s6a0, 0x40)
														copy(a + 0x60, s6c0, 0x20)
														memcpy(a + 0x98, s640, 0x40)
														copy(a + 0xe0, s660, 0x20)
														st64(a + 0x118, ld64(s550 + 8))
														st64(a + 0x110, ld64(s550))
														memcpy(a + 0x128, s5d8, 0x88)
														copy(a + 0x1b4, s600, 0x20)
														st32(a + 0x1d4, ld32(s600 + 0x20))
														copy(a + 0x1e8, s490, 0x10)
														memcpy(a + 0x200, s518, 0x88)
														const by = ld32(s540 + 0x20)
														const bx = ld64(s540 + 0x18)
														const bw = ld64(s540 + 0x10)
														const bv = ld64(s540 + 8)
														const bu = ld64(s540)
														st32(a, ld64(sa58 + 0x50))
														st32(a + 4, ld64(sa58 + 0x48))
														st32(a + 0x80, ld64(sa58 + 0x28))
														st32(a + 0x84, ld64(sa58 + 0x20))
														st32(a + 0x1b0, ld64(sa58))
														st32(a + 0x288, ld64(sa78))
														st64(a + 0x488, ag)
														st64(a + 0x480, ld64(sa90 + 8))
														st64(a + 0x478, ld64(sa90 + 0x10))
														st64(a + 0x470, ld64(sa58 + 0x70))
														st64(a + 0x468, i)
														st64(a + 0x460, g)
														st64(a + 0x1f8, ld64(sa78 + 0x18))
														st64(a + 0x1e0, ld64(sa78 + 0x10))
														st64(a + 0x1d8, ld64(sa78 + 8))
														st64(a + 0x120, ld64(sa58 + 0x18))
														st64(a + 0x108, ld64(sa58 + 0x10))
														st64(a + 0x100, ld64(sa58 + 8))
														st64(a + 0xd8, ld64(sa58 + 0x40))
														st64(a + 0x90, ld64(sa58 + 0x30))
														st64(a + 0x88, ld64(sa58 + 0x38))
														st64(a + 0x58, ld64(sa58 + 0x68))
														st64(a + 0x10, ld64(sa58 + 0x58))
														n = ld64(sa58 + 0x60)
														st64(a + 8, n)
														st64(a + 0x28c, bu, bv, bw, bx)
														st32(a + 0x2ac, by)
														return n
													}
													anchor_error_from(s8a0, 0x7dc /* anchor::ConstraintAddress */)
													const bq = Error_with_account_name(s8b0, ld64(s8a0), ld64(s8a0 + 8), "token_program_b", 0xf)
													const bp = ld64(s8b0 + 8)
													const bo = ld64(s8b0)
													copy(s290, s2d0, 0x40)
													n = fn_13b5c0(s8c0, bo, bp, s290, bq)
													m = ld64(s8c0)
													st64(a + 0x10, ld64(s8c0 + 8))
													st64(a + 8, m)
													st32(a, 2)
													return n
												}
												anchor_error_from(s850, 0x7d3 /* anchor::ConstraintRaw */)
												n = Error_with_account_name(s860, ld64(s850), ld64(s850 + 8), "token_destination_b", 0x13)
												m = ld64(s860)
												st64(a + 0x10, ld64(s860 + 8))
												st64(a + 8, m)
												st32(a, 2)
												return n
											}
											anchor_error_from(s8d0, 0x7d0 /* anchor::ConstraintMut */)
											n = Error_with_account_name(s8e0, ld64(s8d0), ld64(s8d0 + 8), "token_destination_b", 0x13)
											m = ld64(s8e0)
											st64(a + 0x10, ld64(s8e0 + 8))
											st64(a + 8, m)
											st32(a, 2)
											return n
										}
										anchor_error_from(s830, 0x7d3 /* anchor::ConstraintRaw */)
										n = Error_with_account_name(s840, ld64(s830), ld64(s830 + 8), "token_destination_a", 0x13)
										m = ld64(s840)
										st64(a + 0x10, ld64(s840 + 8))
										st64(a + 8, m)
										st32(a, 2)
										return n
									}
									anchor_error_from(s7a0, 0x7dc /* anchor::ConstraintAddress */)
									const ax = Error_with_account_name(s7b0, ld64(s7a0), ld64(s7a0 + 8), "token_mint_b", 0xc)
									const aw = ld64(s7b0 + 8)
									const av = ld64(s7b0)
									copy(s290, s2d0, 0x40)
									n = fn_13b5c0(s7c0, av, aw, s290, ax)
									m = ld64(s7c0)
									st64(a + 0x10, ld64(s7c0 + 8))
									st64(a + 8, m)
									st32(a, 2)
									return n
								}
								anchor_error_from(s770, 0x7dc /* anchor::ConstraintAddress */)
								const at = Error_with_account_name(s780, ld64(s770), ld64(s770 + 8), "token_mint_a", 0xc)
								const ar = ld64(s780 + 8)
								const aq = ld64(s780)
								copy(s290, s2d0, 0x40)
								n = fn_13b5c0(s790, aq, ar, s290, at)
								m = ld64(s790)
								st64(a + 0x10, ld64(s790 + 8))
								st64(a + 8, m)
								st32(a, 2)
								return n
							}
							anchor_error_from(s740, 0x7dc /* anchor::ConstraintAddress */)
							const al = Error_with_account_name(s750, ld64(s740), ld64(s740 + 8), "collect_protocol_fees_authority", 0x1f)
							const ak = ld64(s750 + 8)
							const aj = ld64(s750)
							copy(s290, s2d0, 0x40)
							n = fn_13b5c0(s760, aj, ak, s290, al)
							m = ld64(s760)
							st64(a + 0x10, ld64(s760 + 8))
							st64(a + 8, m)
							st32(a, 2)
							return n
						}
						n = Error_with_account_name(s700, af, ag, "memo_program", 0xc)
						m = ld64(s700)
						st64(a + 0x10, ld64(s700 + 8))
						st64(a + 8, m)
						st32(a, 2)
						return n
					}
					n = Error_with_account_name(s6f0, ad, ae, "token_program_b", 0xf)
					m = ld64(s6f0)
					st64(a + 0x10, ld64(s6f0 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				n = Error_with_account_name(s6e0, ab, ac, "token_program_a", 0xf)
				m = ld64(s6e0)
				st64(a + 0x10, ld64(s6e0 + 8))
				st64(a + 8, m)
				st32(a, 2)
				return n
			}
			n = Error_with_account_name(s6d0, j, k, "collect_protocol_fees_authority", 0x1f)
			m = ld64(s6d0)
			st64(a + 0x10, ld64(s6d0 + 8))
			st64(a + 8, m)
			st32(a, 2)
			return n
		}
		alloc_handle_alloc_error(8, 0x290)
	}
	alloc_handle_alloc_error(8, 0x70)
}

// types [heur]: b: CollectProtocolFeesV2Context (the handler ix_collect_protocol_fees_v2 passes a frame object holding (program_id, address of a copy of the Accounts result))
export function fn_3b6d8(a: u64, b: CollectProtocolFeesV2Context, c: u64, r9: u64): u64 {
	const s120 = fp - 0x120, s138 = fp - 0x138, s258 = fp - 0x258, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290
	const accounts: CollectProtocolFeesV2Accounts = b.accounts
	const g = b.remaining_accounts_len
	const remaining_accounts: AccountInfo = b.remaining_accounts
	let r = fn_7a5e0(s138, remaining_accounts, g, c, 0x100152bf5, 2, accounts, r9)
	let j = ld64(s138 + 0x10)
	let k = ld64(s138 + 8)
	const i = ld64(s138)
	if (i == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
		st64(a + 8, j)
		st64(a, k)
		return r
	}
	memcpy(s258, s120, 0x120)
	st64(s270, i, k, j)
	const l = ld64(accounts + 0x468)
	const m = ld64(l + 0x268)
	let q = fn_7e5e0(s280, l, accounts, accounts.token_vault_a, accounts.token_destination_a, accounts + 0x478, accounts + 0x488, s270, m, "Orca CollectProtocolFees", 0x18)
	j = ld64(s280 + 8)
	k = ld64(s280)
	if (k == 2) {
		const n = ld64(accounts + 0x468)
		const o = ld64(n + 0x270)
		q = fn_7e5e0(s290, n, accounts.token_mint_b, accounts.token_vault_b, accounts.token_destination_b, accounts + 0x480, accounts + 0x488, s258, o, "Orca CollectProtocolFees", 0x18)
		j = ld64(s290 + 8)
		k = ld64(s290)
		if (k != 2) {
			r = fn_c9a0(s270, q)
			st64(a + 8, j)
			st64(a, k)
			return r
		}
		const p = ld64(accounts + 0x468)
		st64(p + 0x270, 0)
		st64(p + 0x268, 0)
		r = fn_c9a0(s270, q)
		st64(a + 8, j)
		st64(a, 2)
		return r
	}
	r = fn_c9a0(s270, q)
	st64(a + 8, j)
	st64(a, k)
	return r
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool, token_vault_a, token_vault_b, token_destination_a, token_destination_b
export function fn_d7470(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8
	let n, p: u64
	fn_6aa0(s28, ld64(b + 0x468), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const f = ld64(s28)
	if (f != 2) {
		n = Error_with_account_name(s38, f, ld64(s28 + 8), 0x100152b28 /* "whirlpool" */, 9)
		p = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, p)
		return n
	}
	const g = ld64(b + 0x120)
	if ((memcmp(b + 0x100, c, 0x20) as u32) == 0) {
		const h = common_is_closed(g)
		if (h == 0) {
			fn_143448(s18, g, h)
			const j = ld64(s18 + 0x10)
			const i = ld64(s18)
			if (i != 0x800000000000001a /* Ok */) {
				const k = ld64(s18 + 8)
				st64(s18, i, k, j)
				fn_13b430(s48, s18)
				const l = ld64(s48)
				if (l != 2) {
					n = Error_with_account_name(s58, l, ld64(s48 + 8), "token_vault_a", 0xd)
					p = ld64(s58)
					st64(a + 8, ld64(s58 + 8))
					st64(a, p)
					return n
				}
			} else {
				st64(j, ld64(j) + 1)
			}
		}
	}
	const q = ld64(b + 0x1f8)
	if ((memcmp(b + 0x1d8, c, 0x20) as u32) == 0) {
		const r = common_is_closed(q)
		if (r == 0) {
			fn_143448(s18, q, r)
			const t = ld64(s18 + 0x10)
			const s = ld64(s18)
			if (s != 0x800000000000001a /* Ok */) {
				const aa = ld64(s18 + 8)
				st64(s18, s, aa, t)
				fn_13b430(s68, s18)
				const ab = ld64(s68)
				if (ab != 2) {
					n = Error_with_account_name(s78, ab, ld64(s68 + 8), "token_vault_b", 0xd)
					p = ld64(s78)
					st64(a + 8, ld64(s78 + 8))
					st64(a, p)
					return n
				}
			} else {
				st64(t, ld64(t) + 1)
			}
		}
	}
	const u = ld64(b + 0x2d0)
	if ((memcmp(b + 0x2b0, c, 0x20) as u32) == 0) {
		const v = common_is_closed(u)
		if (v == 0) {
			fn_143448(s18, u, v)
			const x = ld64(s18 + 0x10)
			const w = ld64(s18)
			if (w != 0x800000000000001a /* Ok */) {
				const ac = ld64(s18 + 8)
				st64(s18, w, ac, x)
				fn_13b430(s88, s18)
				const ad = ld64(s88)
				if (ad != 2) {
					n = Error_with_account_name(s98, ad, ld64(s88 + 8), "token_destination_a", 0x13)
					p = ld64(s98)
					st64(a + 8, ld64(s98 + 8))
					st64(a, p)
					return n
				}
			} else {
				st64(x, ld64(x) + 1)
			}
		}
	}
	const y = ld64(b + 0x3a8)
	const m = memcmp(b + 0x388, c, 0x20)
	let o = undef
	n = m as u32
	if (n != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return n
	}
	n = common_is_closed(y)
	o = undef
	if (n != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return n
	}
	n = fn_143448(s18, y, n)
	o = ld64(s18 + 0x10)
	const z = ld64(s18)
	if (z != 0x800000000000001a /* Ok */) {
		const ae = ld64(s18 + 8)
		st64(s18, z, ae, o)
		n = fn_13b430(sa8, s18)
		o = undef
		const af = ld64(sa8)
		if (af == 2) {
			st64(a + 8, o)
			st64(a, 2)
			return n
		}
		n = Error_with_account_name(sb8, af, ld64(sa8 + 8), "token_destination_b", 0x13)
		p = ld64(sb8)
		st64(a + 8, ld64(sb8 + 8))
		st64(a, p)
		return n
	}
	st64(o, ld64(o) + 1)
	st64(a + 8, o)
	st64(a, 2)
	return n
}
