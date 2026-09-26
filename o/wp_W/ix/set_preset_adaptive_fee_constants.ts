/// <reference path="../lib.d.ts" />
// instruction set_preset_adaptive_fee_constants
import { accounts_set_default_base_fee_rate, fn_5f98, memcpy } from '../shared.ts'

// instruction handler: set_preset_adaptive_fee_constants (discriminator sha256("global:set_preset_adaptive_fee_constants")[..8] = 0xc68658539442b984)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, adaptive_fee_tier, fee_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: adaptive_fee_tier
export function ix_set_preset_adaptive_fee_constants(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const se0 = fp - 0xe0, sf8 = fp - 0xf8, s180 = fp - 0x180, s1d8 = fp - 0x1d8, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s248 = fp - 0x248, s250 = fp - 0x250, s258 = fp - 0x258, s260 = fp - 0x260, s268 = fp - 0x268, s270 = fp - 0x270, s278 = fp - 0x278, s280 = fp - 0x280
	let k, r: u64
	st64(s248, program_id)
	sol_log("Instruction: SetPresetAdaptiveFeeConstants", 0x2a)
	const f = ix_args_len
	if (f >= 2 && ((f & -2) != 2 && ((f & -2) != 4 && (f - 6 >= 4 && (f - 0xa >= 4 && ((f & -2) != 0xe && (f & -2) != 0x10)))))) {
		const g = ix_args
		st64(s258, ld16(g))
		st64(s260, ld16(g + 2))
		st64(s278, ld16(g + 4))
		st64(s268, ld32(g + 6))
		st64(s270, ld32(g + 0xa))
		const h = ld16(g + 0xe)
		st64(s250, h)
		st64(s280, ld16(g + 0x10))
		st64(s200, accounts, accounts_len)
		r = accounts_set_default_base_fee_rate(sf8, h, s200, undef, fp)
		let j = ld64(sf8 + 0x10)
		k = ld64(sf8 + 8)
		const i = ld64(sf8)
		if (i == 0) {
			st64(a + 8, j)
			st64(a, k)
			return r
		}
		B24: {
			memcpy(s1d8, se0, 0xe0)
			st64(s1f0, i, k, j)
			const l = ld64(s258)
			const m = ld64(s250)
			if (l != 0 && (ld64(s260) > l && 0x1869f >= ld64(s268))) {
				const n = (ld64(s270) * m >> 0x20) != 0
				if (0x270f >= ld64(s278) && (n & 1) == 0) {
					const o = ld16(s180 + 0x72)
					if (o > ((m - 1) as u16) && (o % m == 0 && (ld64(s280) != 0 && o * 0x58 >= ld64(s280)))) {
						st16(s180 + 0x7a, ld64(s278))
						st16(s180 + 0x78, ld64(s260))
						st16(s180 + 0x76, l)
						st16(s180 + 0x7e, ld64(s280))
						st16(s180 + 0x7c, m)
						st32(s180 + 0x6c, ld64(s270))
						st32(s180 + 0x68, ld64(s268))
						break B24
					}
				}
			}
			r = fn_87630(s210, 0x3d)
			j = ld64(s210 + 8)
			k = ld64(s210)
			if (k != 2) {
				st64(a + 8, j)
				st64(a, k)
				return r
			}
		}
		r = fn_5f98(s220, s180, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, ld64(s248))
		const s = ld64(s220)
		if (s != 2) {
			r = Error_with_account_name(s230, s, ld64(s220 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
			k = ld64(s230)
			st64(a + 8, ld64(s230 + 8))
			st64(a, k)
			return r
		}
		st64(a + 8, j)
		st64(a, 2)
		return r
	}
	const p = fn_1459d0(0x100159468)
	if (2 > (p & 3) - 2) {
		r = anchor_error_from(s240, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s240)
		st64(a + 8, ld64(s240 + 8))
		st64(a, k)
		return r
	}
	if ((p & 3) == 0) {
		r = anchor_error_from(s240, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s240)
		st64(a + 8, ld64(s240 + 8))
		st64(a, k)
		return r
	}
	const q = ld64(ld64(p + 7))
	callx(q, ld64(p - 1), q)
	r = anchor_error_from(s240, 0x66 /* anchor::InstructionDidNotDeserialize */)
	k = ld64(s240)
	st64(a + 8, ld64(s240 + 8))
	st64(a, k)
	return r
}
