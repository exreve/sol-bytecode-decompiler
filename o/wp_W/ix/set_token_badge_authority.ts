/// <reference path="../lib.d.ts" />
// instruction set_token_badge_authority
import { fn_7598, memcpy } from '../shared.ts'

// instruction handler: set_token_badge_authority (discriminator sha256("global:set_token_badge_authority")[..8] = 0xb20d4fcd2004cacf)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, whirlpools_config_extension, new_token_badge_authority, config_extension_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config_extension
export function ix_set_token_badge_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s68 = fp - 0x68, s80 = fp - 0x80, sa8 = fp - 0xa8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130
	sol_log("Instruction: SetTokenBadgeAuthority", 0x23)
	st64(s110, accounts, accounts_len)
	let n = accounts_set_token_badge_authority(s80, undef, s110, undef, fp)
	const g = ld64(s80 + 0x10)
	let h = ld64(s80 + 8)
	const f = ld64(s80)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return n
	}
	memcpy(se8, s68, 0x68)
	st64(s100, f, h, g)
	const i = ld64(ld64(sa8 + 0x20))
	const l = ld64(i + 8)
	const k = ld64(i + 0x10)
	const j = ld64(i + 0x18)
	st64(se8 + 0x38, ld64(i))
	st64(sa8, l, k, j)
	n = fn_7598(s120, sf8, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
	const m = ld64(s120)
	if (m != 2) {
		n = Error_with_account_name(s130, m, ld64(s120 + 8), "whirlpools_config_extension", 0x1b)
		h = ld64(s130)
		st64(a + 8, ld64(s130 + 8))
		st64(a, h)
		return n
	}
	st64(a + 8, g)
	st64(a, 2)
	return n
}

// Anchor Accounts::try_accounts of instruction set_token_badge_authority (called by ix_set_token_badge_authority; name [str]: from the handler's "Instruction: …" log; was fn_f4c90)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, whirlpools_config_extension (ConstraintMut, ConstraintHasOne), new_token_badge_authority (AccountNotEnoughKeys), config_extension_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpools_config_extension, config_extension_authority
export function accounts_set_token_badge_authority(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s50 = fp - 0x50, s58 = fp - 0x58, s70 = fp - 0x70, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sf0 = fp - 0xf0, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8
	let m, o, y, z: u64
	try_accounts_11de0(s70, c, c, d, e)
	if (ld64(s70) == 0) {
		z = Error_with_account_name(s1d0, ld64(s70 + 8), ld64(s70 + 0x10), "whirlpools_config", 0x11)
		y = ld64(s1d0)
		st64(a + 0x10, ld64(s1d0 + 8))
		st64(a + 8, y)
		st64(a, 0)
		return z
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x70) & -8 : 0x300007f90
	if (g > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, s70, 0x70)
		try_accounts_120c0(s70, c)
		const j = ld64(s70 + 0x10)
		const i = ld64(s70 + 8)
		const whirlpools_config_extension: AccountInfo = ld64(s70)
		if (whirlpools_config_extension == 0) {
			z = Error_with_account_name(s1c0, i, j, "whirlpools_config_extension", 0x1b)
			y = ld64(s1c0)
			st64(a + 0x10, ld64(s1c0 + 8))
			st64(a + 8, y)
			st64(a, 0)
			return z
		}
		st64(s1e0, i, j)
		memcpy(s100, s58, 0x50)
		try_accounts_11718(s70, c)
		const config_extension_authority: AccountInfo = ld64(s70 + 8)
		const k = ld64(s70)
		if (k == 2) {
			const l = ld64(c + 8)
			if (l == 0) {
				anchor_error_from(s120, 0xbbd /* anchor::AccountNotEnoughKeys */, config_extension_authority, undef, o)
				m = ld64(s120 + 8)
				const p = ld64(s120)
				if (p != 2) {
					z = Error_with_account_name(s130, p, m, "new_token_badge_authority", 0x19)
					y = ld64(s130)
					st64(a + 0x10, ld64(s130 + 8))
					st64(a + 8, y)
					st64(a, 0)
					return z
				}
			} else {
				st64(c + 8, l - 1)
				m = ld64(c)
				st64(c, m + 0x30)
			}
			if (whirlpools_config_extension.is_writable == 0) {
				anchor_error_from(s1a0, 0x7d0 /* anchor::ConstraintMut */, config_extension_authority, m, o)
				z = Error_with_account_name(s1b0, ld64(s1a0), ld64(s1a0 + 8), "whirlpools_config_extension", 0x1b)
				y = ld64(s1b0)
				st64(a + 0x10, ld64(s1b0 + 8))
				st64(a + 8, y)
				st64(a, 0)
				return z
			}
			st64(s1e8, m)
			copyr(sb0, s1e0, 0x10)
			copy(sa0, s100, 0x10)
			const q = ld64(ld64(g))
			copyr(s90, q, 0x20)
			if ((memcmp(sb0, s90, 0x20) as u32) != 0) {
				anchor_error_from(s140, 0x7d1 /* anchor::ConstraintHasOne */)
				const x = Error_with_account_name(s150, ld64(s140), ld64(s140 + 8), "whirlpools_config_extension", 0x1b)
				const w = ld64(s150 + 8)
				const v = ld64(s150)
				copy(s70, sb0, 0x40)
				z = fn_13b5c0(s160, v, w, s70, x)
				y = ld64(s160)
				st64(a + 0x10, ld64(s160 + 8))
				st64(a + 8, y)
				st64(a, 0)
				return z
			}
			const r = config_extension_authority.key
			copyr(sb0, r, 0x20)
			copyr(s90, sf0, 0x20)
			if ((memcmp(sb0, s90, 0x20) as u32) == 0) {
				z = memcpy(a + 0x20, s100, 0x50)
				st64(a + 0x78, ld64(s1e8))
				st64(a + 0x70, config_extension_authority)
				st64(a + 0x18, ld64(s1e0 + 8))
				st64(a + 0x10, ld64(s1e0))
				st64(a + 8, whirlpools_config_extension)
				st64(a, g)
				return z
			}
			anchor_error_from(s170, 0x7dc /* anchor::ConstraintAddress */)
			const u = Error_with_account_name(s180, ld64(s170), ld64(s170 + 8), "config_extension_authority", 0x1a)
			const t = ld64(s180 + 8)
			const s = ld64(s180)
			copyr(s70, sb0, 0x20)
			copy(s50, sf0, 0x20)
			z = fn_13b5c0(s190, s, t, s70, u)
			y = ld64(s190)
			st64(a + 0x10, ld64(s190 + 8))
			st64(a + 8, y)
			st64(a, 0)
			return z
		}
		z = Error_with_account_name(s110, k, config_extension_authority, "config_extension_authority", 0x1a)
		y = ld64(s110)
		st64(a + 0x10, ld64(s110 + 8))
		st64(a + 8, y)
		st64(a, 0)
		return z
	}
	alloc_handle_alloc_error(8, 0x70)
}
