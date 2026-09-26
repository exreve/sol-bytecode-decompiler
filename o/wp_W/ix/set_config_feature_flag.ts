/// <reference path="../lib.d.ts" />
// instruction set_config_feature_flag
import { fn_147e78, fn_8228, memcpy } from '../shared.ts'

// instruction handler: set_config_feature_flag (discriminator sha256("global:set_config_feature_flag")[..8] = 0x39d2f74312e4ad47)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config
export function ix_set_config_feature_flag(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s10 = fp - 0x10, s11 = fp - 0x11, s30 = fp - 0x30, s31 = fp - 0x31, s98 = fp - 0x98, sb0 = fp - 0xb0, s110 = fp - 0x110, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158
	let j, k, n, o, p, r, s: u64
	B8: {
		B5: {
			sol_log("Instruction: SetConfigFeatureFlag", 0x21)
			const f = ix_args_len
			if (f != 0) {
				const g = ix_args
				const h = ld8(g)
				st8(s31, h)
				if (h != 0) {
					st64(sb0, 0x100159668)
					st64(sb0 + 0x10, s128)
					st64(s128, s31, num_fmt_bae8)
					st64(s98 + 8, 0)
					st64(sb0 + 8, 1)
					st64(s98, 1)
					j = s30
				} else {
					if (f == 1) {
						break B5
					}
					const i = ld8(g + 1)
					st8(s11, i)
					if (2 > i) {
						st64(s30, accounts, accounts_len)
						s = accounts_set_config_feature_flag(sb0, g, s30, undef, fp)
						const q = ld64(sb0 + 0x10)
						r = ld64(sb0 + 8)
						const t = ld64(sb0)
						if (t == 0) {
							st64(a + 8, q)
							st64(a, r)
							return s
						}
						memcpy(s110, s98, 0x60)
						st16(s110 + 0x52, i)
						st64(s128, t, r, q)
						s = fn_8228(s138, s128, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
						const u = ld64(s138)
						if (u != 2) {
							s = Error_with_account_name(s148, u, ld64(s138 + 8), "whirlpools_config", 0x11)
							r = ld64(s148)
							st64(a + 8, ld64(s148 + 8))
							st64(a, r)
							return s
						}
						st64(a + 8, q)
						st64(a, 2)
						return s
					}
					st64(sb0, 0x100159620)
					st64(sb0 + 0x10, s10)
					st64(s10, s11, fn_14ef78)
					st64(s98 + 8, 0)
					st64(sb0 + 8, 1)
					st64(s98, 1)
					j = s128
				}
				fn_147e78(j, sb0, h)
				k = fn_b580(j)
				break B8
			}
		}
		k = fn_1459d0(0x100159468)
	}
	const l = k
	if (2 > (k & 3) - 2) {
		s = anchor_error_from(s158, 0x66 /* anchor::InstructionDidNotDeserialize */, n, o, p)
		r = ld64(s158)
		st64(a + 8, ld64(s158 + 8))
		st64(a, r)
		return s
	}
	if ((l & 3) == 0) {
		s = anchor_error_from(s158, 0x66 /* anchor::InstructionDidNotDeserialize */, n, o, p)
		r = ld64(s158)
		st64(a + 8, ld64(s158 + 8))
		st64(a, r)
		return s
	}
	const m = ld64(ld64(k + 7))
	callx(m, ld64(k - 1), m)
	s = anchor_error_from(s158, 0x66 /* anchor::InstructionDidNotDeserialize */)
	r = ld64(s158)
	st64(a + 8, ld64(s158 + 8))
	st64(a, r)
	return s
}

// Anchor Accounts::try_accounts of instruction set_config_feature_flag (called by ix_set_config_feature_flag; name [str]: from the handler's "Instruction: …" log; was fn_c6da0)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config (ConstraintMut), authority (ConstraintRaw)
export function accounts_set_config_feature_flag(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s58 = fp - 0x58, sb0 = fp - 0xb0, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s130 = fp - 0x130, s138 = fp - 0x138
	let l, m: u64
	try_accounts_11de0(sc8, c, c, d, e)
	const g = ld64(sc8 + 0x10)
	const k = ld64(sc8 + 8)
	const f = ld64(sc8)
	if (f == 0) {
		m = Error_with_account_name(s128, k, g, "whirlpools_config", 0x11)
		l = ld64(s128)
		st64(a + 0x10, ld64(s128 + 8))
		st64(a + 8, l)
		st64(a, 0)
		return m
	}
	st64(s130, g)
	memcpy(s58, sb0, 0x58)
	try_accounts_11718(sc8, c)
	const i = ld64(sc8 + 8)
	const h = ld64(sc8)
	if (h == 2) {
		if (ld8(f + 0x29) == 0) {
			anchor_error_from(s108, 0x7d0 /* anchor::ConstraintMut */)
			m = Error_with_account_name(s118, ld64(s108), ld64(s108 + 8), "whirlpools_config", 0x11)
			l = ld64(s118)
			st64(a + 0x10, ld64(s118 + 8))
			st64(a + 8, l)
			st64(a, 0)
			return m
		}
		const j = ld64(i)
		st64(s138, j)
		if ((memcmp(j, 0x100152d90 /* key GwH3Hiv5mACLX3ufTw1pFsrhSPon5tdw252DBs4Rx4PV */, 0x20) as u32) == 0) {
			m = memcpy(a + 0x18, s58, 0x58)
			st64(a + 0x70, i)
			st64(a + 0x10, ld64(s130))
			st64(a + 8, k)
			st64(a, f)
			return m
		}
		if ((memcmp(ld64(s138), 0x100152db0 /* key AqiJTdr9jLPDAk5prGhWFHtSM1qJszAsdZVV7oeinxhh */, 0x20) as u32) == 0) {
			m = memcpy(a + 0x18, s58, 0x58)
			st64(a + 0x70, i)
			st64(a + 0x10, ld64(s130))
			st64(a + 8, k)
			st64(a, f)
			return m
		}
		anchor_error_from(se8, 0x7d3 /* anchor::ConstraintRaw */)
		m = Error_with_account_name(sf8, ld64(se8), ld64(se8 + 8), 0x100154b87 /* "authority" */, 9)
		l = ld64(sf8)
		st64(a + 0x10, ld64(sf8 + 8))
		st64(a + 8, l)
		st64(a, 0)
		return m
	}
	m = Error_with_account_name(sd8, h, i, 0x100154b87 /* "authority" */, 9)
	l = ld64(sd8)
	st64(a + 0x10, ld64(sd8 + 8))
	st64(a + 8, l)
	st64(a, 0)
	return m
}
