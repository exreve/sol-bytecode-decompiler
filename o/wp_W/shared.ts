/// <reference path="./lib.d.ts" />
// helpers used by several instructions
import { ix_initialize_config } from './ix/initialize_config.ts'
import { ix_initialize_pool } from './ix/initialize_pool.ts'
import { ix_initialize_tick_array } from './ix/initialize_tick_array.ts'
import { ix_initialize_dynamic_tick_array } from './ix/initialize_dynamic_tick_array.ts'
import { ix_initialize_fee_tier } from './ix/initialize_fee_tier.ts'
import { ix_initialize_reward } from './ix/initialize_reward.ts'
import { ix_set_reward_emissions } from './ix/set_reward_emissions.ts'
import { ix_open_position } from './ix/open_position.ts'
import { ix_open_position_with_metadata } from './ix/open_position_with_metadata.ts'
import { ix_increase_liquidity } from './ix/increase_liquidity.ts'
import { ix_decrease_liquidity } from './ix/decrease_liquidity.ts'
import { ix_update_fees_and_rewards } from './ix/update_fees_and_rewards.ts'
import { ix_collect_fees } from './ix/collect_fees.ts'
import { ix_collect_reward } from './ix/collect_reward.ts'
import { ix_collect_protocol_fees } from './ix/collect_protocol_fees.ts'
import { ix_swap } from './ix/swap.ts'
import { ix_close_position } from './ix/close_position.ts'
import { ix_set_default_fee_rate } from './ix/set_default_fee_rate.ts'
import { ix_set_default_protocol_fee_rate } from './ix/set_default_protocol_fee_rate.ts'
import { ix_set_fee_rate } from './ix/set_fee_rate.ts'
import { ix_set_protocol_fee_rate } from './ix/set_protocol_fee_rate.ts'
import { ix_set_fee_authority } from './ix/set_fee_authority.ts'
import { ix_set_collect_protocol_fees_authority } from './ix/set_collect_protocol_fees_authority.ts'
import { ix_set_reward_authority } from './ix/set_reward_authority.ts'
import { ix_set_reward_authority_by_super_authority } from './ix/set_reward_authority_by_super_authority.ts'
import { ix_set_reward_emissions_super_authority } from './ix/set_reward_emissions_super_authority.ts'
import { ix_two_hop_swap } from './ix/two_hop_swap.ts'
import { ix_initialize_position_bundle } from './ix/initialize_position_bundle.ts'
import { ix_initialize_position_bundle_with_metadata } from './ix/initialize_position_bundle_with_metadata.ts'
import { ix_delete_position_bundle } from './ix/delete_position_bundle.ts'
import { ix_open_bundled_position } from './ix/open_bundled_position.ts'
import { ix_close_bundled_position } from './ix/close_bundled_position.ts'
import { ix_open_position_with_token_extensions } from './ix/open_position_with_token_extensions.ts'
import { ix_close_position_with_token_extensions } from './ix/close_position_with_token_extensions.ts'
import { ix_lock_position } from './ix/lock_position.ts'
import { ix_reset_position_range } from './ix/reset_position_range.ts'
import { ix_transfer_locked_position } from './ix/transfer_locked_position.ts'
import { ix_initialize_adaptive_fee_tier } from './ix/initialize_adaptive_fee_tier.ts'
import { ix_set_default_base_fee_rate } from './ix/set_default_base_fee_rate.ts'
import { ix_set_delegated_fee_authority } from './ix/set_delegated_fee_authority.ts'
import { ix_set_initialize_pool_authority } from './ix/set_initialize_pool_authority.ts'
import { ix_set_preset_adaptive_fee_constants } from './ix/set_preset_adaptive_fee_constants.ts'
import { ix_initialize_pool_with_adaptive_fee } from './ix/initialize_pool_with_adaptive_fee.ts'
import { ix_set_fee_rate_by_delegated_fee_authority } from './ix/set_fee_rate_by_delegated_fee_authority.ts'
import { ix_set_adaptive_fee_constants } from './ix/set_adaptive_fee_constants.ts'
import { ix_set_config_feature_flag } from './ix/set_config_feature_flag.ts'
import { ix_migrate_repurpose_reward_authority_space } from './ix/migrate_repurpose_reward_authority_space.ts'
import { ix_collect_fees_v2 } from './ix/collect_fees_v2.ts'
import { ix_collect_protocol_fees_v2 } from './ix/collect_protocol_fees_v2.ts'
import { ix_collect_reward_v2 } from './ix/collect_reward_v2.ts'
import { ix_decrease_liquidity_v2 } from './ix/decrease_liquidity_v2.ts'
import { ix_increase_liquidity_v2 } from './ix/increase_liquidity_v2.ts'
import { ix_increase_liquidity_by_token_amounts_v2 } from './ix/increase_liquidity_by_token_amounts_v2.ts'
import { ix_initialize_pool_v2 } from './ix/initialize_pool_v2.ts'
import { ix_initialize_reward_v2 } from './ix/initialize_reward_v2.ts'
import { ix_set_reward_emissions_v2 } from './ix/set_reward_emissions_v2.ts'
import { ix_swap_v2 } from './ix/swap_v2.ts'
import { ix_two_hop_swap_v2 } from './ix/two_hop_swap_v2.ts'
import { ix_reposition_liquidity_v2 } from './ix/reposition_liquidity_v2.ts'
import { ix_initialize_config_extension } from './ix/initialize_config_extension.ts'
import { ix_set_config_extension_authority } from './ix/set_config_extension_authority.ts'
import { ix_set_token_badge_authority } from './ix/set_token_badge_authority.ts'
import { ix_initialize_token_badge } from './ix/initialize_token_badge.ts'
import { ix_delete_token_badge } from './ix/delete_token_badge.ts'
import { ix_set_token_badge_attribute } from './ix/set_token_badge_attribute.ts'
import { ix_idl_include } from './ix/idl_include.ts'
import { ix_idl_close_account } from './ix/idl_close_account.ts'
import { ix_idl_resize_account } from './ix/idl_resize_account.ts'
import { ix_idl_set_buffer } from './ix/idl_set_buffer.ts'
import { ix_idl_create_account } from './ix/idl_create_account.ts'
import { ix_idl_write } from './ix/idl_write.ts'

export function fn_258(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s30 = fp - 0x30
	const f = memcmp(0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c, 0x20)
	let l = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, l)
		st64(a, 2)
		return g
	}
	g = common_is_closed(b)
	l = undef
	if (g != 0) {
		st64(a + 8, l)
		st64(a, 2)
		return g
	}
	fn_143448(s20, b, g)
	const k = ld64(s20 + 0x10)
	const i = ld64(s20 + 8)
	const h = ld64(s20)
	if (h != 0x800000000000001a /* Ok */) {
		st64(s20, h, i, k)
		g = fn_13b430(s30, s20)
		const m = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, m)
		return g
	}
	const j = ld64(i)
	st64(s20 + 8, ld64(i + 8))
	st64(s20, j)
	st64(s20 + 0x10, 0)
	g = fn_13ae08(s20, 0x100151ea8, 8)
	if (g == 0) {
		l = ld64(k) + 1
		st64(k, l)
		st64(a + 8, l)
		st64(a, 2)
		return g
	}
	st64(s8, g)
	fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s8, 0x1001592b0, 0x1001592d0)
}

export function fn_1110(a: u64, b: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60
	let f = b
	const g = ld64(b + 0x18)
	let h = memcmp(g, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20) as u32
	if (h == 0) {
		st64(a, 2, f)
		return h
	}
	const k = anchor_error_from(s50, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	const j = ld64(s50 + 8)
	const i = ld64(s50)
	copyr(s40, g, 0x20)
	st64(s20, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
	h = fn_13b5c0(s60, i, j, s40, k)
	f = ld64(s60 + 8)
	st64(a, ld64(s60))
	st64(a + 8, f)
	return h
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
// types [heur]: c: TokenAccount (6 of 12 calls pass one, the others an untyped value: accounts_collect_fees, accounts_two_hop_swap)
export function fn_20f8(a: u64, b: u64, c: TokenAccount, d: u64, e: u64) {
	const sb8 = fp - 0xb8
	try_accounts_11f50(sb8, b, c, d, e)
	if (ld32(sb8 + 0x90) == 2) {
		const h = ld64(sb8)
		st64(a + 8, ld64(sb8 + 8))
		st64(a, h)
	} else {
		const f = ld64(0x300000000 /* heap bump-allocator cursor */)
		const g = f != 0 ? sat_sub(f, 0xb8) & -8 : 0x300007f48
		if (0x300000007 >= g) {
			alloc_handle_alloc_error(8, 0xb8)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, sb8, 0xb8)
		st64(a + 8, g)
		st64(a, 2)
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (points to it), c (value)
export function fn_2258(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const sd8 = fp - 0xd8
	try_accounts_558(sd8, b, c, d, e)
	if (ld32(sd8 + 0xb0) == 2) {
		const h = ld64(sd8)
		st64(a + 8, ld64(sd8 + 8))
		st64(a, h)
	} else {
		const f = ld64(0x300000000 /* heap bump-allocator cursor */)
		const g = f != 0 ? sat_sub(f, 0xd8) & -8 : 0x300007f28
		if (0x300000007 >= g) {
			alloc_handle_alloc_error(8, 0xd8)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, sd8, 0xd8)
		st64(a + 8, g)
		st64(a, 2)
	}
}

export function fn_3240(a: u64, b: u64) {
	const s28 = fp - 0x28, s30 = fp - 0x30, s48 = fp - 0x48, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8
	let p: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0) {
		anchor_error_from(sc8, 0xbc4 /* anchor::AccountNotInitialized */)
		p = ld64(sc8)
		st64(a + 0x10, ld64(sc8 + 8))
		st64(a + 8, p)
		st64(a, 0)
		return
	}
	const g = memcmp(f, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s48, b, g as u32)
		const o = ld64(s48 + 0x10)
		const l = ld64(s48 + 8)
		const k = ld64(s48)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s88 + 8, ld64(l + 8))
			st64(s88, m)
			fn_104ee8(s48, s88, 0x800000000000001a /* Ok */)
			if (ld8(s48) == 0) {
				st32(a + 0xb, ld32(s48 + 4))
				st32(a + 8, ld32(s48 + 1))
				const r = ld64(s48 + 8)
				const q = ld64(s48 + 0x10)
				memcpy(s78, s30, 0x29)
				memcpy(a + 0x1f, s78, 0x29)
				st64(a + 0x17, q)
				st64(a + 0xf, r)
				st64(a, b)
				st64(o, ld64(o) - 1)
			} else {
				const n = ld64(s48 + 8)
				st64(a + 0x10, ld64(s48 + 0x10))
				st64(a + 8, n)
				st64(a, 0)
				st64(o, ld64(o) - 1)
			}
		} else {
			st64(s48, k, l, o)
			fn_13b430(sb8, s48)
			p = ld64(sb8)
			st64(a + 0x10, ld64(sb8 + 8))
			st64(a + 8, p)
			st64(a, 0)
		}
	} else {
		const j = anchor_error_from(s98, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const i = ld64(s98 + 8)
		const h = ld64(s98)
		copyr(s48, f, 0x20)
		st64(s28, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		fn_13b5c0(sa8, h, i, s48, j)
		p = ld64(sa8)
		st64(a + 0x10, ld64(sa8 + 8))
		st64(a + 8, p)
		st64(a, 0)
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
export function fn_3aa0(a: u64, b: u64) {
	const s270 = fp - 0x270, s278 = fp - 0x278, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0
	let q: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0) {
		anchor_error_from(s2e0, 0xbc4 /* anchor::AccountNotInitialized */)
		q = ld64(s2e0)
		st64(a + 0x10, ld64(s2e0 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return
	}
	const g = memcmp(f, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s290, b, g as u32)
		const p = ld64(s290 + 0x10)
		const l = ld64(s290 + 8)
		const k = ld64(s290)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s2a0 + 8, ld64(l + 8))
			st64(s2a0, m)
			fn_105ad8(s290, s2a0, 0x800000000000001a /* Ok */)
			const n = ld64(s290 + 0x10)
			const o = ld64(s290 + 8)
			if (ld64(s290) == 0) {
				memcpy(a + 0x18, s278, 0x278)
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, b)
				st64(p, ld64(p) - 1)
			} else {
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, 0)
				st64(p, ld64(p) - 1)
			}
		} else {
			st64(s290, k, l, p)
			fn_13b430(s2d0, s290)
			q = ld64(s2d0)
			st64(a + 0x10, ld64(s2d0 + 8))
			st64(a + 8, q)
			st64(a, 0)
		}
	} else {
		const j = anchor_error_from(s2b0, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const i = ld64(s2b0 + 8)
		const h = ld64(s2b0)
		copyr(s290, f, 0x20)
		st64(s270, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		fn_13b5c0(s2c0, h, i, s290, j)
		q = ld64(s2c0)
		st64(a + 0x10, ld64(s2c0 + 8))
		st64(a + 8, q)
		st64(a, 0)
	}
}

export function fn_3e60(a: u64, b: AccountInfo) {
	const s10 = fp - 0x10, s20 = fp - 0x20, s40 = fp - 0x40, s48 = fp - 0x48, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0
	let p: u64
	const f = b.owner
	if ((memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0) {
		anchor_error_from(sa0, 0xbc4 /* anchor::AccountNotInitialized */)
		p = ld64(sa0)
		st64(a + 0x10, ld64(sa0 + 8))
		st64(a + 8, p)
		st64(a, 0)
		return
	}
	const g = memcmp(f, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s60, b, g as u32)
		const o = ld64(s60 + 0x10)
		const l = ld64(s60 + 8)
		const k = ld64(s60)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s20 + 8, ld64(l + 8))
			st64(s20, m)
			fn_11f7a0(s60, s20, 0x800000000000001a /* Ok */)
			if (ld32(s60) == 0) {
				copy(s10, s48, 0x10)
				const r = ld32(s60 + 4)
				const q = ld64(s60 + 8)
				st64(a + 0x14, ld64(s60 + 0x10))
				st64(a + 0xc, q)
				st32(a + 8, r)
				st64(a, b)
				copy(a + 0x1c, s10, 0x10)
				st64(o, ld64(o) - 1)
			} else {
				const n = ld64(s60 + 8)
				st64(a + 0x10, ld64(s60 + 0x10))
				st64(a + 8, n)
				st64(a, 0)
				st64(o, ld64(o) - 1)
			}
		} else {
			st64(s60, k, l, o)
			fn_13b430(s90, s60)
			p = ld64(s90)
			st64(a + 0x10, ld64(s90 + 8))
			st64(a + 8, p)
			st64(a, 0)
		}
	} else {
		const j = anchor_error_from(s70, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const i = ld64(s70 + 8)
		const h = ld64(s70)
		copyr(s60, f, 0x20)
		st64(s40, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		fn_13b5c0(s80, h, i, s60, j)
		p = ld64(s80)
		st64(a + 0x10, ld64(s80 + 8))
		st64(a + 8, p)
		st64(a, 0)
	}
}

export function fn_4a30(a: u64, b: u64) {
	const sb8 = fp - 0xb8, sc0 = fp - 0xc0, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128
	let q: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0) {
		anchor_error_from(s128, 0xbc4 /* anchor::AccountNotInitialized */)
		q = ld64(s128)
		st64(a + 0x10, ld64(s128 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return
	}
	const g = memcmp(f, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(sd8, b, g as u32)
		const p = ld64(sd8 + 0x10)
		const l = ld64(sd8 + 8)
		const k = ld64(sd8)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(se8 + 8, ld64(l + 8))
			st64(se8, m)
			fn_104598(sd8, se8, 0x800000000000001a /* Ok */)
			const n = ld64(sd8 + 0x10)
			const o = ld64(sd8 + 8)
			if (ld64(sd8) == 0) {
				memcpy(a + 0x18, sc0, 0xc0)
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, b)
				st64(p, ld64(p) - 1)
			} else {
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, 0)
				st64(p, ld64(p) - 1)
			}
		} else {
			st64(sd8, k, l, p)
			fn_13b430(s118, sd8)
			q = ld64(s118)
			st64(a + 0x10, ld64(s118 + 8))
			st64(a + 8, q)
			st64(a, 0)
		}
	} else {
		const j = anchor_error_from(sf8, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const i = ld64(sf8 + 8)
		const h = ld64(sf8)
		copyr(sd8, f, 0x20)
		st64(sb8, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		fn_13b5c0(s108, h, i, sd8, j)
		q = ld64(s108)
		st64(a + 0x10, ld64(s108 + 8))
		st64(a + 8, q)
		st64(a, 0)
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
export function fn_5a40(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let t, u, v: u64
	const f = memcmp(c, d, 0x20)
	let q = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, q)
		st64(a, 2)
		return g
	}
	const h = ld64(b)
	g = common_is_closed(h)
	q = undef
	if (g != 0) {
		st64(a + 8, q)
		st64(a, 2)
		return g
	}
	fn_143448(s28, h, g)
	const m = ld64(s28 + 0x10)
	const j = ld64(s28 + 8)
	const i = ld64(s28)
	if (i != 0x800000000000001a /* Ok */) {
		st64(s28, i, j, m)
		g = fn_13b430(s38, s28)
		const x = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, x)
		return g
	}
	B21: {
		const k = ld64(j)
		st64(s28 + 8, ld64(j + 8))
		st64(s28, k)
		st64(s28 + 0x10, 0)
		g = fn_13ae08(s28, 0x100151f30, 8)
		if (g == 0) {
			g = fn_13ae08(s28, b + 8, 0x20)
			if (g == 0) {
				g = fn_13ae08(s28, b + 0x28, 0x20)
				if (g == 0) {
					const n = ld64(b + 0x48)
					st64(s10 + 8, ld64(b + 0x50))
					st64(s10, n)
					g = fn_13ae08(s28, s10, 0x10)
					if (g == 0) {
						st32(s10, ld32(b + 0xd0))
						g = fn_13ae08(s28, s10, 4)
						if (g == 0) {
							st32(s10, ld32(b + 0xd4))
							g = fn_13ae08(s28, s10, 4)
							if (g == 0) {
								const o = ld64(b + 0x58)
								st64(s10 + 8, ld64(b + 0x60))
								st64(s10, o)
								g = fn_13ae08(s28, s10, 0x10)
								if (g == 0) {
									st64(s10, ld64(b + 0x78))
									g = fn_13ae08(s28, s10, 8)
									if (g == 0) {
										const p = ld64(b + 0x68)
										st64(s10 + 8, ld64(b + 0x70))
										st64(s10, p)
										g = fn_13ae08(s28, s10, 0x10)
										if (g == 0) {
											st64(s10, ld64(b + 0x80))
											g = fn_13ae08(s28, s10, 8)
											if (g == 0) {
												g = fn_fa00(b + 0x88, s28)
												if (g == 0) {
													q = ld64(m) + 1
													st64(m, q)
													st64(a + 8, q)
													st64(a, 2)
													return g
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
			const r = g
			if (2 > (g & 3) - 2) {
				break B21
			}
			if ((r & 3) == 0) {
				break B21
			}
		} else {
			const l = g
			if (2 > (g & 3) - 2) {
				break B21
			}
			if ((l & 3) == 0) {
				break B21
			}
		}
		const s = ld64(ld64(g + 7))
		callx(s, ld64(g - 1), s)
	}
	g = anchor_error_from(s48, 0xbbc /* anchor::AccountDidNotSerialize */, t, u, v)
	q = ld64(s48 + 8)
	const w = ld64(s48)
	st64(m, ld64(m) + 1)
	st64(a + 8, q)
	st64(a, w != 2 ? w : 2)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_5f98(a: u64, b: u64, c: u64, d: u64): u64 {
	const s4 = fp - 0x4, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40
	let q, r, s: u64
	const f = memcmp(c, d, 0x20)
	let n = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	const h = ld64(b)
	g = common_is_closed(h)
	n = undef
	if (g != 0) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	fn_143448(s20, h, g)
	const m = ld64(s20 + 0x10)
	const j = ld64(s20 + 8)
	const i = ld64(s20)
	if (i != 0x800000000000001a /* Ok */) {
		st64(s20, i, j, m)
		g = fn_13b430(s30, s20)
		const u = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, u)
		return g
	}
	B24: {
		const k = ld64(j)
		st64(s20 + 8, ld64(j + 8))
		st64(s20, k)
		st64(s20 + 0x10, 0)
		g = fn_13ae08(s20, 0x100151f08, 8)
		if (g == 0) {
			g = fn_13ae08(s20, b + 8, 0x20)
			if (g == 0) {
				st16(s4, ld16(b + 0x70))
				g = fn_13ae08(s20, s4, 2)
				if (g == 0) {
					st16(s4, ld16(b + 0x72))
					g = fn_13ae08(s20, s4, 2)
					if (g == 0) {
						g = fn_13ae08(s20, b + 0x28, 0x20)
						if (g == 0) {
							g = fn_13ae08(s20, b + 0x48, 0x20)
							if (g == 0) {
								st16(s4, ld16(b + 0x74))
								g = fn_13ae08(s20, s4, 2)
								if (g == 0) {
									st16(s4, ld16(b + 0x76))
									g = fn_13ae08(s20, s4, 2)
									if (g == 0) {
										st16(s4, ld16(b + 0x78))
										g = fn_13ae08(s20, s4, 2)
										if (g == 0) {
											st16(s4, ld16(b + 0x7a))
											g = fn_13ae08(s20, s4, 2)
											if (g == 0) {
												st32(s4, ld32(b + 0x68))
												g = fn_13ae08(s20, s4, 4)
												if (g == 0) {
													st32(s4, ld32(b + 0x6c))
													g = fn_13ae08(s20, s4, 4)
													if (g == 0) {
														st16(s4, ld16(b + 0x7c))
														g = fn_13ae08(s20, s4, 2)
														if (g == 0) {
															st16(s4, ld16(b + 0x7e))
															g = fn_13ae08(s20, s4, 2)
															if (g == 0) {
																n = ld64(m) + 1
																st64(m, n)
																st64(a + 8, n)
																st64(a, 2)
																return g
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
			const o = g
			if (2 > (g & 3) - 2) {
				break B24
			}
			if ((o & 3) == 0) {
				break B24
			}
		} else {
			const l = g
			if (2 > (g & 3) - 2) {
				break B24
			}
			if ((l & 3) == 0) {
				break B24
			}
		}
		const p = ld64(ld64(g + 7))
		callx(p, ld64(g - 1), p)
	}
	g = anchor_error_from(s40, 0xbbc /* anchor::AccountDidNotSerialize */, q, r, s)
	n = ld64(s40 + 8)
	const t = ld64(s40)
	st64(m, ld64(m) + 1)
	st64(a + 8, n)
	st64(a, t != 2 ? t : 2)
	return g
}

export function fn_65a0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40
	let q, r, s: u64
	const f = memcmp(c, d, 0x20)
	let n = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	const h = ld64(b)
	g = common_is_closed(h)
	n = undef
	if (g != 0) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	fn_143448(s20, h, g)
	const m = ld64(s20 + 0x10)
	const j = ld64(s20 + 8)
	const i = ld64(s20)
	if (i != 0x800000000000001a /* Ok */) {
		st64(s20, i, j, m)
		g = fn_13b430(s30, s20)
		const u = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, u)
		return g
	}
	B16: {
		const k = ld64(j)
		st64(s20 + 8, ld64(j + 8))
		st64(s20, k)
		st64(s20 + 0x10, 0)
		g = fn_13ae08(s20, 0x100151ef0, 8)
		if (g == 0) {
			g = fn_13ae08(s20, b + 8, 0x20)
			if (g == 0) {
				g = fn_13ae08(s20, b + 0x28, 0x20)
				if (g == 0) {
					g = fn_13ae08(s20, b + 0x48, 0x20)
					if (g == 0) {
						st64(s8, ld64(b + 0x68))
						g = fn_13ae08(s20, s8, 8)
						if (g == 0) {
							st8(s8, 0)
							g = fn_13ae08(s20, s8, 1)
							if (g == 0) {
								n = ld64(m) + 1
								st64(m, n)
								st64(a + 8, n)
								st64(a, 2)
								return g
							}
						}
					}
				}
			}
			const o = g
			if (2 > (g & 3) - 2) {
				break B16
			}
			if ((o & 3) == 0) {
				break B16
			}
		} else {
			const l = g
			if (2 > (g & 3) - 2) {
				break B16
			}
			if ((l & 3) == 0) {
				break B16
			}
		}
		const p = ld64(ld64(g + 7))
		callx(p, ld64(g - 1), p)
	}
	g = anchor_error_from(s40, 0xbbc /* anchor::AccountDidNotSerialize */, q, r, s)
	n = ld64(s40 + 8)
	const t = ld64(s40)
	st64(m, ld64(m) + 1)
	st64(a + 8, n)
	st64(a, t != 2 ? t : 2)
	return g
}

export function fn_6960(a: u64, b: u64, c: u64, d: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28
	const f = memcmp(c, d, 0x20)
	let i = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, i)
		st64(a, 2)
		return g
	}
	g = common_is_closed(b)
	i = undef
	if (g != 0) {
		st64(a + 8, i)
		st64(a, 2)
		return g
	}
	g = fn_143448(s18, b, g)
	i = ld64(s18 + 0x10)
	const h = ld64(s18)
	if (h != 0x800000000000001a /* Ok */) {
		const j = ld64(s18 + 8)
		st64(s18, h, j, i)
		g = fn_13b430(s28, s18)
		const k = ld64(s28)
		st64(a + 8, ld64(s28 + 8))
		st64(a, k)
		return g
	}
	st64(i, ld64(i) + 1)
	st64(a + 8, i)
	st64(a, 2)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
export function fn_6aa0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let u, v, w: u64
	const f = memcmp(c, d, 0x20)
	let r = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, r)
		st64(a, 2)
		return g
	}
	const h = ld64(b)
	g = common_is_closed(h)
	r = undef
	if (g != 0) {
		st64(a + 8, r)
		st64(a, 2)
		return g
	}
	fn_143448(s28, h, g)
	const m = ld64(s28 + 0x10)
	const j = ld64(s28 + 8)
	const i = ld64(s28)
	if (i != 0x800000000000001a /* Ok */) {
		st64(s28, i, j, m)
		g = fn_13b430(s38, s28)
		const y = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, y)
		return g
	}
	B30: {
		const k = ld64(j)
		st64(s28 + 8, ld64(j + 8))
		st64(s28, k)
		st64(s28 + 0x10, 0)
		g = fn_13ae08(s28, 0x100151ea0, 8)
		if (g == 0) {
			g = fn_13ae08(s28, b + 0x188, 0x20)
			if (g == 0) {
				g = fn_13ae08(s28, b + 0x28c, 1)
				if (g == 0) {
					st16(s10, ld16(b + 0x284))
					g = fn_13ae08(s28, s10, 2)
					if (g == 0) {
						g = fn_13ae08(s28, b + 0x286, 2)
						if (g == 0) {
							st16(s10, ld16(b + 0x288))
							g = fn_13ae08(s28, s10, 2)
							if (g == 0) {
								st16(s10, ld16(b + 0x28a))
								g = fn_13ae08(s28, s10, 2)
								if (g == 0) {
									const n = ld64(b + 0x228)
									st64(s10 + 8, ld64(b + 0x230))
									st64(s10, n)
									g = fn_13ae08(s28, s10, 0x10)
									if (g == 0) {
										const o = ld64(b + 0x238)
										st64(s10 + 8, ld64(b + 0x240))
										st64(s10, o)
										g = fn_13ae08(s28, s10, 0x10)
										if (g == 0) {
											st32(s10, ld32(b + 0x280))
											g = fn_13ae08(s28, s10, 4)
											if (g == 0) {
												st64(s10, ld64(b + 0x268))
												g = fn_13ae08(s28, s10, 8)
												if (g == 0) {
													st64(s10, ld64(b + 0x270))
													g = fn_13ae08(s28, s10, 8)
													if (g == 0) {
														g = fn_13ae08(s28, b + 0x1a8, 0x20)
														if (g == 0) {
															g = fn_13ae08(s28, b + 0x1c8, 0x20)
															if (g == 0) {
																const p = ld64(b + 0x248)
																st64(s10 + 8, ld64(b + 0x250))
																st64(s10, p)
																g = fn_13ae08(s28, s10, 0x10)
																if (g == 0) {
																	g = fn_13ae08(s28, b + 0x1e8, 0x20)
																	if (g == 0) {
																		g = fn_13ae08(s28, b + 0x208, 0x20)
																		if (g == 0) {
																			const q = ld64(b + 0x258)
																			st64(s10 + 8, ld64(b + 0x260))
																			st64(s10, q)
																			g = fn_13ae08(s28, s10, 0x10)
																			if (g == 0) {
																				st64(s10, ld64(b + 0x278))
																				g = fn_13ae08(s28, s10, 8)
																				if (g == 0) {
																					g = fn_f658(b + 8, s28)
																					if (g == 0) {
																						r = ld64(m) + 1
																						st64(m, r)
																						st64(a + 8, r)
																						st64(a, 2)
																						return g
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
			const s = g
			if (2 > (g & 3) - 2) {
				break B30
			}
			if ((s & 3) == 0) {
				break B30
			}
		} else {
			const l = g
			if (2 > (g & 3) - 2) {
				break B30
			}
			if ((l & 3) == 0) {
				break B30
			}
		}
		const t = ld64(ld64(g + 7))
		callx(t, ld64(g - 1), t)
	}
	g = anchor_error_from(s48, 0xbbc /* anchor::AccountDidNotSerialize */, u, v, w)
	r = ld64(s48 + 8)
	const x = ld64(s48)
	st64(m, ld64(m) + 1)
	st64(a + 8, r)
	st64(a, x != 2 ? x : 2)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_7240(a: u64, b: u64, c: u64, d: u64): u64 {
	const s2 = fp - 0x2, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40
	let q, r, s: u64
	const f = memcmp(c, d, 0x20)
	let n = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	const h = ld64(b)
	g = common_is_closed(h)
	n = undef
	if (g != 0) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	fn_143448(s20, h, g)
	const m = ld64(s20 + 0x10)
	const j = ld64(s20 + 8)
	const i = ld64(s20)
	if (i != 0x800000000000001a /* Ok */) {
		st64(s20, i, j, m)
		g = fn_13b430(s30, s20)
		const u = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, u)
		return g
	}
	B14: {
		const k = ld64(j)
		st64(s20 + 8, ld64(j + 8))
		st64(s20, k)
		st64(s20 + 0x10, 0)
		g = fn_13ae08(s20, 0x100151e90, 8)
		if (g == 0) {
			g = fn_13ae08(s20, b + 8, 0x20)
			if (g == 0) {
				st16(s2, ld16(b + 0x28))
				g = fn_13ae08(s20, s2, 2)
				if (g == 0) {
					st16(s2, ld16(b + 0x2a))
					g = fn_13ae08(s20, s2, 2)
					if (g == 0) {
						n = ld64(m) + 1
						st64(m, n)
						st64(a + 8, n)
						st64(a, 2)
						return g
					}
				}
			}
			const o = g
			if (2 > (g & 3) - 2) {
				break B14
			}
			if ((o & 3) == 0) {
				break B14
			}
		} else {
			const l = g
			if (2 > (g & 3) - 2) {
				break B14
			}
			if ((l & 3) == 0) {
				break B14
			}
		}
		const p = ld64(ld64(g + 7))
		callx(p, ld64(g - 1), p)
	}
	g = anchor_error_from(s40, 0xbbc /* anchor::AccountDidNotSerialize */, q, r, s)
	n = ld64(s40 + 8)
	const t = ld64(s40)
	st64(m, ld64(m) + 1)
	st64(a + 8, n)
	st64(a, t != 2 ? t : 2)
	return g
}

export function fn_7598(a: u64, b: u64, c: u64, d: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38
	let q, r, s: u64
	const f = memcmp(c, d, 0x20)
	let n = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	const h = ld64(b)
	g = common_is_closed(h)
	n = undef
	if (g != 0) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	fn_143448(s18, h, g)
	const m = ld64(s18 + 0x10)
	const j = ld64(s18 + 8)
	const i = ld64(s18)
	if (i != 0x800000000000001a /* Ok */) {
		st64(s18, i, j, m)
		g = fn_13b430(s28, s18)
		const u = ld64(s28)
		st64(a + 8, ld64(s28 + 8))
		st64(a, u)
		return g
	}
	B14: {
		const k = ld64(j)
		st64(s18 + 8, ld64(j + 8))
		st64(s18, k)
		st64(s18 + 0x10, 0)
		g = fn_13ae08(s18, 0x100151e80, 8)
		if (g == 0) {
			g = fn_13ae08(s18, b + 8, 0x20)
			if (g == 0) {
				g = fn_13ae08(s18, b + 0x28, 0x20)
				if (g == 0) {
					g = fn_13ae08(s18, b + 0x48, 0x20)
					if (g == 0) {
						n = ld64(m) + 1
						st64(m, n)
						st64(a + 8, n)
						st64(a, 2)
						return g
					}
				}
			}
			const o = g
			if (2 > (g & 3) - 2) {
				break B14
			}
			if ((o & 3) == 0) {
				break B14
			}
		} else {
			const l = g
			if (2 > (g & 3) - 2) {
				break B14
			}
			if ((l & 3) == 0) {
				break B14
			}
		}
		const p = ld64(ld64(g + 7))
		callx(p, ld64(g - 1), p)
	}
	g = anchor_error_from(s38, 0xbbc /* anchor::AccountDidNotSerialize */, q, r, s)
	n = ld64(s38 + 8)
	const t = ld64(s38)
	st64(m, ld64(m) + 1)
	st64(a + 8, n)
	st64(a, t != 2 ? t : 2)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_7be0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40
	let q, r, s: u64
	const f = memcmp(c, d, 0x20)
	let n = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	const h = ld64(b)
	g = common_is_closed(h)
	n = undef
	if (g != 0) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	fn_143448(s20, h, g)
	const m = ld64(s20 + 0x10)
	const j = ld64(s20 + 8)
	const i = ld64(s20)
	if (i != 0x800000000000001a /* Ok */) {
		st64(s20, i, j, m)
		g = fn_13b430(s30, s20)
		const u = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, u)
		return g
	}
	B14: {
		const k = ld64(j)
		st64(s20 + 8, ld64(j + 8))
		st64(s20, k)
		st64(s20 + 0x10, 0)
		g = fn_13ae08(s20, 0x100151f28, 8)
		if (g == 0) {
			g = fn_13ae08(s20, b + 9, 0x20)
			if (g == 0) {
				g = fn_13ae08(s20, b + 0x29, 0x20)
				if (g == 0) {
					st8(s1, ld8(b + 8))
					g = fn_13ae08(s20, s1, 1)
					if (g == 0) {
						n = ld64(m) + 1
						st64(m, n)
						st64(a + 8, n)
						st64(a, 2)
						return g
					}
				}
			}
			const o = g
			if (2 > (g & 3) - 2) {
				break B14
			}
			if ((o & 3) == 0) {
				break B14
			}
		} else {
			const l = g
			if (2 > (g & 3) - 2) {
				break B14
			}
			if ((l & 3) == 0) {
				break B14
			}
		}
		const p = ld64(ld64(g + 7))
		callx(p, ld64(g - 1), p)
	}
	g = anchor_error_from(s40, 0xbbc /* anchor::AccountDidNotSerialize */, q, r, s)
	n = ld64(s40 + 8)
	const t = ld64(s40)
	st64(m, ld64(m) + 1)
	st64(a + 8, n)
	st64(a, t != 2 ? t : 2)
	return g
}

export function fn_7f28(a: u64, b: u64, c: u64, d: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38
	let q, r, s: u64
	const f = memcmp(c, d, 0x20)
	let n = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	const h = ld64(b)
	g = common_is_closed(h)
	n = undef
	if (g != 0) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	fn_143448(s18, h, g)
	const m = ld64(s18 + 0x10)
	const j = ld64(s18 + 8)
	const i = ld64(s18)
	if (i != 0x800000000000001a /* Ok */) {
		st64(s18, i, j, m)
		g = fn_13b430(s28, s18)
		const u = ld64(s28)
		st64(a + 8, ld64(s28 + 8))
		st64(a, u)
		return g
	}
	B13: {
		const k = ld64(j)
		st64(s18 + 8, ld64(j + 8))
		st64(s18, k)
		st64(s18 + 0x10, 0)
		g = fn_13ae08(s18, 0x100151ed8, 8)
		if (g == 0) {
			g = fn_13ae08(s18, b + 8, 0x20)
			if (g == 0) {
				g = fn_13ae08(s18, b + 0x28, 0x20)
				if (g == 0) {
					n = ld64(m) + 1
					st64(m, n)
					st64(a + 8, n)
					st64(a, 2)
					return g
				}
			}
			const o = g
			if (2 > (g & 3) - 2) {
				break B13
			}
			if ((o & 3) == 0) {
				break B13
			}
		} else {
			const l = g
			if (2 > (g & 3) - 2) {
				break B13
			}
			if ((l & 3) == 0) {
				break B13
			}
		}
		const p = ld64(ld64(g + 7))
		callx(p, ld64(g - 1), p)
	}
	g = anchor_error_from(s38, 0xbbc /* anchor::AccountDidNotSerialize */, q, r, s)
	n = ld64(s38 + 8)
	const t = ld64(s38)
	st64(m, ld64(m) + 1)
	st64(a + 8, n)
	st64(a, t != 2 ? t : 2)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_8228(a: u64, b: u64, c: u64, d: u64): u64 {
	const s2 = fp - 0x2, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40
	let q, r, s: u64
	const f = memcmp(c, d, 0x20)
	let n = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	const h = ld64(b)
	g = common_is_closed(h)
	n = undef
	if (g != 0) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	fn_143448(s20, h, g)
	const m = ld64(s20 + 0x10)
	const j = ld64(s20 + 8)
	const i = ld64(s20)
	if (i != 0x800000000000001a /* Ok */) {
		st64(s20, i, j, m)
		g = fn_13b430(s30, s20)
		const u = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, u)
		return g
	}
	B16: {
		const k = ld64(j)
		st64(s20 + 8, ld64(j + 8))
		st64(s20, k)
		st64(s20 + 0x10, 0)
		g = fn_13ae08(s20, 0x100151e98, 8)
		if (g == 0) {
			g = fn_13ae08(s20, b + 8, 0x20)
			if (g == 0) {
				g = fn_13ae08(s20, b + 0x28, 0x20)
				if (g == 0) {
					g = fn_13ae08(s20, b + 0x48, 0x20)
					if (g == 0) {
						st16(s2, ld16(b + 0x68))
						g = fn_13ae08(s20, s2, 2)
						if (g == 0) {
							st16(s2, ld16(b + 0x6a))
							g = fn_13ae08(s20, s2, 2)
							if (g == 0) {
								n = ld64(m) + 1
								st64(m, n)
								st64(a + 8, n)
								st64(a, 2)
								return g
							}
						}
					}
				}
			}
			const o = g
			if (2 > (g & 3) - 2) {
				break B16
			}
			if ((o & 3) == 0) {
				break B16
			}
		} else {
			const l = g
			if (2 > (g & 3) - 2) {
				break B16
			}
			if ((l & 3) == 0) {
				break B16
			}
		}
		const p = ld64(ld64(g + 7))
		callx(p, ld64(g - 1), p)
	}
	g = anchor_error_from(s40, 0xbbc /* anchor::AccountDidNotSerialize */, q, r, s)
	n = ld64(s40 + 8)
	const t = ld64(s40)
	st64(m, ld64(m) + 1)
	st64(a + 8, n)
	st64(a, t != 2 ? t : 2)
	return g
}

export function fn_afd0(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s26 = fp - 0x26, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s90 = fp - 0x90, sb8 = fp - 0xb8, sd0 = fp - 0xd0, se0 = fp - 0xe0, s118 = fp - 0x118, s140 = fp - 0x140, s158 = fp - 0x158, s160 = fp - 0x160, s168 = fp - 0x168
	let j: u64
	if (c == 0x163) {
		st64(a + 8, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
		st32(a, 2)
		return r0
	}
	if (c > 0x51) {
		st64(s158 + 0x10, b)
		r0 = Mint_unpack_from_slice_133108(s58, b, 0x52, d, e, r0)
		const f = ld32(s58)
		if (f == 2) {
			copy(se0, s48, 0x10)
			j = ld64(s58 + 8)
		} else {
			copy(s68, s48, 0x10)
			copy(s90, s38, 0x10)
			st8(s90 + 0x10, ld8(s38 + 0x10))
			copy(sb8, s26, 0x20)
			st64(sb8 + 0x1e, ld64(s26 + 0x1e))
			let n = ld64(s58 + 8)
			let m = ld32(s58 + 4)
			let g = ld8(s38 + 0x11)
			copy(s78, s68, 0x10)
			if (g != 0) {
				copyr(se0, s78, 0x10)
				copy(sd0, s90, 0x10)
				st8(sd0 + 0x10, ld8(s90 + 0x10))
				copy(s140, sb8, 0x20)
				st64(s140 + 0x1e, ld64(sb8 + 0x1e))
				st8(s118 + 0x10, ld8(sd0 + 0x10))
				copyr(s118, sd0, 0x10)
				const k = ld64(se0 + 8)
				st64(s118 + 0x30, k)
				st64(s118 + 0x20, k)
				const l = ld64(se0)
				st64(s118 + 0x28, l)
				st64(s118 + 0x18, l)
				let r = 0
				let s = 1
				if (c != 0x52) {
					if (0x55 > c - 0x52) {
						st64(a + 8, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
						st64(a + 0x18, 0x54)
						st64(a + 0x10, 0x53)
						st32(a, 2)
						return r0
					}
					st64(s158, m, n)
					const o = ld64(0x300000000 /* heap bump-allocator cursor */)
					st64(s160, g)
					const q = ld64(s158 + 0x10)
					const p = o != 0 ? sat_sub(o, 0x53) : 0x300007fad
					if (0x300000007 >= p) {
						raw_vec_handle_error(1, 0x53, q, o - 0x53, 0x53 > o)
					}
					st64(s168, q + 0x52)
					st64(0x300000000 /* heap bump-allocator cursor */, p)
					memset(p, 0, 0x53)
					r0 = memcmp(ld64(s168), p, 0x53) as u32
					n = ld64(s158 + 8)
					m = ld64(s158)
					g = ld64(s160)
					if (r0 != 0) {
						st64(a + 8, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
						st64(a + 0x18, 0x54)
						st64(a + 0x10, 0x53)
						st32(a, 2)
						return r0
					}
					if (ld8(ld64(s158 + 0x10) + 0xa5) != 1) {
						st64(a + 8, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
						st64(a + 0x18, 0x54)
						st64(a + 0x10, 0x53)
						st32(a, 2)
						return r0
					}
					s = ld64(s158 + 0x10) + 0xa6
					r = c - 0xa6
				}
				st64(a + 0x18, ld64(s118 + 0x20))
				st64(a + 0x10, ld64(s118 + 0x18))
				copy(a + 0x20, s118, 0x10)
				st8(a + 0x30, ld8(s118 + 0x10))
				st64(a + 0x4a, ld64(s140 + 0x18))
				st64(a + 0x42, ld64(s140 + 0x10))
				st64(a + 0x3a, ld64(s140 + 8))
				st64(a + 0x32, ld64(s140))
				const t = ld64(s140 + 0x1e)
				st32(a, f, m)
				st8(a + 0x31, g)
				st64(a + 0x60, r)
				st64(a + 0x58, s)
				st64(a + 8, n)
				st64(a + 0x50, t)
				return r0
			}
			j = 0x8000000000000009 /* Err(ProgramError::UninitializedAccount) */
		}
		const h = ld64(se0 + 8)
		st64(s118 + 0x30, h)
		const i = ld64(se0)
		st64(s118 + 0x28, i)
		st64(a + 0x18, h)
		st64(a + 0x10, i)
		st64(a + 8, j)
		st32(a, 2)
		return r0
	}
	st64(a + 8, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
	st32(a, 2)
	return r0
}

export function fn_b6a0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	let g = 1
	if (c != 0) {
		if (0 > (c as i64)) {
			raw_vec_handle_error(0, c, c, d, e)
		}
		const f = ld64(0x300000000 /* heap bump-allocator cursor */)
		d = f != 0 ? f : 0x300008000
		e = c > d
		g = e != 0 ? 0 : d - c
		if (0x300000008 > g) {
			raw_vec_handle_error(1, c, 0x300000008, d, e)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, g)
	}
	memcpy(g, b, c)
	const h = ld64(0x300000000 /* heap bump-allocator cursor */)
	const i = h != 0 ? sat_sub(h, 0x18) & -8 : 0x300007fe8
	if (i > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, i)
		st64(i + 8, g, c)
		st64(i, c)
		return Error__new(a, i, 0x1001593e0)
	}
	alloc_handle_alloc_error(8, 0x18)
}

export function fn_b980(a: u64, b: u64): u64 {
	return str_fmt(ld64(a), ld64(a + 8), b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_b9c0(a: u64, b: u64) {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x100159480)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_14efa0(b, s48) != 0) {
		fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1, 0x1001594b0, 0x1001594d0)
	}
	st64(a + 0x10, ld64(s60 + 0x10))
	st64(a + 8, ld64(s60 + 8))
	st64(a, ld64(s60))
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
export function fn_bb88(a: u64, r0: u64): u64 {
	if (ld64(a) != 0x8000000000000000) {
		let f = ld64(a + 0x10)
		if (f == 0) {
			return r0
		}
		let g = ld64(a + 8) + 0x10
		while (true) {
			const i = ld64(g)
			const h = ld64(g - 8)
			rc_dec(h)
			rc_dec(i)
			g = g + 0x30
			f = f - 1
			if (f == 0) {
				return r0
			}
		}
	}
	return r0
}

export function fn_c7d0(a: u64, r0: u64): u64 {
	let f = ld64(a)
	if (f == 0) {
		return r0
	}
	let h = ld64(a + 8)
	let g = ld64(a + 0x10)
	if (g == 0) {
		if (h != 0) {
			do {
				f = ld64(f + 0x170)
				h = h - 1
			} while (h != 0)
		}
	} else {
		r0 = f
		f = 0
		do {
			let i = h
			let k = r0
			if (f == 0) {
				i = 0
				k = 0
				f = r0
				if (h != 0) {
					f = r0
					do {
						f = ld64(f + 0x170)
						h = h - 1
						k = 0
					} while (h != 0)
				}
			}
			if (i >= ld16(f + 0x16a)) {
				while (true) {
					const j = ld64(f + 0x160)
					if (j == 0) {
						fn_1490e8(0x100159630, f, j, k, i)
					}
					k = k + 1
					i = ld16(f + 0x168)
					f = j
					if (ld16(j + 0x16a) > i) {
						f = j
						break
					}
				}
			}
			const l = i + 1
			h = l
			if (k != 0) {
				h = 0
				f = ld64(f + (l << 3) + 0x170)
				let m = k - 1
				if (m != 0) {
					do {
						f = ld64(f + 0x170)
						m = m - 1
					} while (m != 0)
				}
			}
			g = g - 1
			r0 = 0
		} while (g != 0)
	}
	while (true) {
		f = ld64(f + 0x160)
		if (f == 0) {
			return r0
		}
	}
}

export function fn_c9a0(a: u64, r0: u64): u64 {
	if (ld64(a) != 0x8000000000000000) {
		let f = ld64(a + 0x10)
		if (f != 0) {
			let g = ld64(a + 8) + 0x10
			do {
				const j = ld64(g)
				const i = ld64(g - 8)
				rc_dec(i)
				r0 = ld64(j) - 1
				st64(j, r0)
				if (r0 == 0) {
					r0 = ld64(j + 8) - 1
					st64(j + 8, r0)
				}
				g = g + 0x30
				f = f - 1
			} while (f != 0)
		}
	}
	if (ld64(a + 0x18) != 0x8000000000000000) {
		let h = ld64(a + 0x28)
		if (h != 0) {
			let k = ld64(a + 0x20) + 0x10
			do {
				const n = ld64(k)
				const m = ld64(k - 8)
				r0 = ld64(m) - 1
				st64(m, r0)
				if (r0 == 0) {
					r0 = ld64(m + 8) - 1
					st64(m + 8, r0)
				}
				rc_dec(n)
				k = k + 0x30
				h = h - 1
			} while (h != 0)
		}
	}
	if (ld64(a + 0x30) != 0x8000000000000000) {
		let l = ld64(a + 0x40)
		if (l != 0) {
			let o = ld64(a + 0x38) + 0x10
			do {
				const r = ld64(o)
				const q = ld64(o - 8)
				rc_dec(q)
				r0 = ld64(r) - 1
				st64(r, r0)
				if (r0 == 0) {
					r0 = ld64(r + 8) - 1
					st64(r + 8, r0)
				}
				o = o + 0x30
				l = l - 1
			} while (l != 0)
		}
	}
	if (ld64(a + 0x48) != 0x8000000000000000) {
		let p = ld64(a + 0x58)
		if (p != 0) {
			let s = ld64(a + 0x50) + 0x10
			do {
				const v = ld64(s)
				const u = ld64(s - 8)
				r0 = ld64(u) - 1
				st64(u, r0)
				if (r0 == 0) {
					r0 = ld64(u + 8) - 1
					st64(u + 8, r0)
				}
				rc_dec(v)
				s = s + 0x30
				p = p - 1
			} while (p != 0)
		}
	}
	if (ld64(a + 0x60) != 0x8000000000000000) {
		let t = ld64(a + 0x70)
		if (t != 0) {
			let w = ld64(a + 0x68) + 0x10
			do {
				const z = ld64(w)
				const y = ld64(w - 8)
				rc_dec(y)
				r0 = ld64(z) - 1
				st64(z, r0)
				if (r0 == 0) {
					r0 = ld64(z + 8) - 1
					st64(z + 8, r0)
				}
				w = w + 0x30
				t = t - 1
			} while (t != 0)
		}
	}
	if (ld64(a + 0x78) != 0x8000000000000000) {
		let x = ld64(a + 0x88)
		if (x != 0) {
			let aa = ld64(a + 0x80) + 0x10
			do {
				const ad = ld64(aa)
				const ac = ld64(aa - 8)
				r0 = ld64(ac) - 1
				st64(ac, r0)
				if (r0 == 0) {
					r0 = ld64(ac + 8) - 1
					st64(ac + 8, r0)
				}
				rc_dec(ad)
				aa = aa + 0x30
				x = x - 1
			} while (x != 0)
		}
	}
	if (ld64(a + 0x90) != 0x8000000000000000) {
		let ab = ld64(a + 0xa0)
		if (ab != 0) {
			let ae = ld64(a + 0x98) + 0x10
			do {
				const ah = ld64(ae)
				const ag = ld64(ae - 8)
				rc_dec(ag)
				r0 = ld64(ah) - 1
				st64(ah, r0)
				if (r0 == 0) {
					r0 = ld64(ah + 8) - 1
					st64(ah + 8, r0)
				}
				ae = ae + 0x30
				ab = ab - 1
			} while (ab != 0)
		}
	}
	if (ld64(a + 0xa8) != 0x8000000000000000) {
		let af = ld64(a + 0xb8)
		if (af != 0) {
			let ai = ld64(a + 0xb0) + 0x10
			do {
				const al = ld64(ai)
				const ak = ld64(ai - 8)
				r0 = ld64(ak) - 1
				st64(ak, r0)
				if (r0 == 0) {
					r0 = ld64(ak + 8) - 1
					st64(ak + 8, r0)
				}
				rc_dec(al)
				ai = ai + 0x30
				af = af - 1
			} while (af != 0)
		}
	}
	if (ld64(a + 0xc0) != 0x8000000000000000) {
		let aj = ld64(a + 0xd0)
		if (aj != 0) {
			let am = ld64(a + 0xc8) + 0x10
			do {
				const ap = ld64(am)
				const ao = ld64(am - 8)
				rc_dec(ao)
				r0 = ld64(ap) - 1
				st64(ap, r0)
				if (r0 == 0) {
					r0 = ld64(ap + 8) - 1
					st64(ap + 8, r0)
				}
				am = am + 0x30
				aj = aj - 1
			} while (aj != 0)
		}
	}
	if (ld64(a + 0xd8) != 0x8000000000000000) {
		let an = ld64(a + 0xe8)
		if (an != 0) {
			let aq = ld64(a + 0xe0) + 0x10
			do {
				const au = ld64(aq)
				const at = ld64(aq - 8)
				r0 = ld64(at) - 1
				st64(at, r0)
				if (r0 == 0) {
					r0 = ld64(at + 8) - 1
					st64(at + 8, r0)
				}
				rc_dec(au)
				aq = aq + 0x30
				an = an - 1
			} while (an != 0)
		}
	}
	if (ld64(a + 0xf0) != 0x8000000000000000) {
		let ar = ld64(a + 0x100)
		if (ar != 0) {
			let av = ld64(a + 0xf8) + 0x10
			do {
				const ay = ld64(av)
				const ax = ld64(av - 8)
				rc_dec(ax)
				r0 = ld64(ay) - 1
				st64(ay, r0)
				if (r0 == 0) {
					r0 = ld64(ay + 8) - 1
					st64(ay + 8, r0)
				}
				av = av + 0x30
				ar = ar - 1
			} while (ar != 0)
		}
	}
	if (ld64(a + 0x108) != 0x8000000000000000) {
		let aw = ld64(a + 0x118)
		if (aw != 0) {
			let az = ld64(a + 0x110) + 0x10
			do {
				const bc = ld64(az)
				const bb = ld64(az - 8)
				r0 = ld64(bb) - 1
				st64(bb, r0)
				if (r0 == 0) {
					r0 = ld64(bb + 8) - 1
					st64(bb + 8, r0)
				}
				rc_dec(bc)
				az = az + 0x30
				aw = aw - 1
			} while (aw != 0)
		}
	}
	if (ld64(a + 0x120) == 0x8000000000000000) {
		return r0
	}
	let ba = ld64(a + 0x130)
	if (ba == 0) {
		return r0
	}
	let bd = ld64(a + 0x128) + 0x10
	while (true) {
		const bf = ld64(bd)
		const be = ld64(bd - 8)
		rc_dec(be)
		rc_dec(bf)
		bd = bd + 0x30
		ba = ba - 1
		if (ba == 0) {
			return r0
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value), a (value), d (value), e (value)
export function fn_d648(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s18 = fp - 0x18, s20 = fp - 0x20, s40 = fp - 0x40, s68 = fp - 0x68, s70 = fp - 0x70, s98 = fp - 0x98
	let f = c
	let g = b
	st64(s98 + 0x20, a)
	if (c - 1 >= b) {
		fn_1494c8("assertion failed: offset != 0 && offset <= len", 0x2e, 0x1001595f0, d, e)
	}
	if (g > f) {
		const h = ld64(s98 + 0x20)
		st64(s98, g, h - 0x60, f * 0x30 + h - 0x30)
		while (true) {
			const k = ld64(s98 + 0x20) + f * 0x30
			const j = f * 0x30 + ld64(s98 + 8)
			const m = ld64(j + 0x30)
			const l = ld64(k)
			copyr(s18, l + 8, 0x18)
			st64(s70, l)
			st64(s20, ld64(l))
			copyr(s68, m, 0x20)
			if ((memcmp(s20, s68, 0x20) as i32) <= -1) {
				let i = j + 0x30
				copyr(s68, k + 8, 0x28)
				memcpy(k, i, 0x30)
				st64(s98 + 0x18, f)
				if (f != 1) {
					let r = 1
					let n = ld64(s98 + 0x10)
					do {
						const p = ld64(n - 0x30)
						const o = ld64(s70)
						copyr(s40, o, 0x20)
						copyr(s20, p, 0x20)
						const q = memcmp(s40, s20, 0x20)
						i = n
						if ((q as i32) > -1) {
							break
						}
						memcpy(n, n - 0x30, 0x30)
						r = r + 1
						i = ld64(s98 + 0x20)
						n = n - 0x30
					} while (ld64(s98 + 0x18) != r)
				}
				copy(i, s70, 0x30)
				f = ld64(s98 + 0x18)
				g = ld64(s98)
			}
			f = f + 1
			st64(s98 + 0x10, ld64(s98 + 0x10) + 0x30)
			if (f >= g) {
				return
			}
		}
	}
}

export function fn_e7f8(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s30 = fp - 0x30
	let f = b + c
	let g = b > f
	if (g != 0) {
		raw_vec_handle_error(0, b, g, f, e)
	}
	const h = ld64(a)
	let i = max(h << 1, f)
	let m = 0
	const j = 0x2000000000000000 > i
	i = max(i, 4)
	const k = i
	if (h != 0) {
		const l = ld64(a + 8)
		st64(s18 + 0x10, h << 2)
		st64(s18, l)
		m = 4
	}
	st64(s18 + 8, m)
	const o = fn_e478(s30, j << 2, k << 2, s18, r0)
	g = undef
	f = undef
	e = undef
	if (ld64(s30) == 0) {
		const n = ld64(s30 + 8)
		st64(a, i, n)
		return o
	}
	raw_vec_handle_error(ld64(s30 + 8), ld64(s30 + 0x10), g, f, e)
}

export function fn_ec20(a: u64, b: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s30 = fp - 0x30
	let f = ld64(a)
	let g = f + 1
	let h = g == 0
	if (h != 0) {
		raw_vec_handle_error(0, b, g, f, h)
	}
	const i = f
	let j = max(f << 1, g)
	let n = 0
	const k = 0x4000000000000000 > j
	j = max(j, 4)
	const l = j
	if (f != 0) {
		const m = ld64(a + 8)
		st64(s18 + 0x10, i << 1)
		st64(s18, m)
		n = 2
	}
	st64(s18 + 8, n)
	const p = fn_e478(s30, k << 1, l << 1, s18, r0)
	g = undef
	f = undef
	h = undef
	if (ld64(s30) == 0) {
		const o = ld64(s30 + 8)
		st64(a, j, o)
		return p
	}
	raw_vec_handle_error(ld64(s30 + 8), ld64(s30 + 0x10), g, f, h)
}

export function fn_ed90(a: u64, b: u64, r0: u64) {
	const s18 = fp - 0x18, s30 = fp - 0x30
	let f = ld64(a)
	let g = f + 1
	let m = 0
	let h = g == 0
	if (h != 0) {
		raw_vec_handle_error(0, b, g, f, h)
	}
	let i = max(f << 1, g)
	const j = 0x555555555555556 > i
	i = max(i, 4)
	const k = i
	if (f != 0) {
		const l = ld64(a + 8)
		st64(s18 + 0x10, f * 0x18)
		st64(s18, l)
		m = 8
	}
	st64(s18 + 8, m)
	fn_e478(s30, j << 3, k * 0x18, s18, r0)
	g = undef
	f = undef
	h = undef
	if (ld64(s30) != 0) {
		raw_vec_handle_error(ld64(s30 + 8), ld64(s30 + 0x10), g, f, h)
	}
	const n = ld64(s30 + 8)
	st64(a, i, n)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (points to it)
export function fn_eef8(a: u64, b: u64, r0: u64) {
	const s18 = fp - 0x18, s30 = fp - 0x30
	let f = ld64(a)
	let g = f + 1
	let h = g == 0
	if (h != 0) {
		raw_vec_handle_error(0, b, g, f, h)
	}
	const i = f
	let j = max(f << 1, g)
	let m = 0
	const n = 0x4000000000000000 > j
	j = max(j, 4)
	const k = j
	if (f != 0) {
		const l = ld64(a + 8)
		st64(s18 + 0x10, i << 1)
		st64(s18, l)
		m = 1
	}
	st64(s18 + 8, m)
	fn_e478(s30, n, k << 1, s18, r0)
	g = undef
	f = undef
	h = undef
	if (ld64(s30) != 0) {
		raw_vec_handle_error(ld64(s30 + 8), ld64(s30 + 0x10), g, f, h)
	}
	const o = ld64(s30 + 8)
	st64(a, j, o)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (points to it)
export function fn_ff18(a: u64, b: u64) {
	const s20 = fp - 0x20, s39 = fp - 0x39, s40 = fp - 0x40, s1d8 = fp - 0x1d8
	let w, x, y: u64
	let m = 0
	st64(s1d8 + 0x180, 0)
	const ai = ld64(b)
	let f = ld64(b + 8)
	let g = 0
	const z = b
	while (true) {
		B10: {
			if (f >= 0x20) {
				const i = ai + g
				const h = f - 0x20
				st64(b + 8, h)
				st64(b, i + 0x20)
				const j = ld64(i + 6)
				st8(s20 + 8, ld8(i + 0xe))
				st64(s20, j)
				if (h >= 0x20) {
					const ag = ld64(s20 + 1)
					let ah = g
					const k = ai + g
					st64(b + 8, h - 0x20)
					st64(b, k + 0x40)
					const l = ld64(k + 0x26)
					st8(s20 + 8, ld8(k + 0x2e))
					st64(s20, l)
					if (h - 0x20 >= 0x20) {
						const ac = m
						const af = ld64(s20 + 1)
						st64(b + 8, h - 0x40)
						st64(b, k + 0x60)
						const n = ld64(k + 0x46)
						st8(s20 + 8, ld8(k + 0x4e))
						st64(s20, n)
						if (h - 0x40 >= 0x10) {
							const ae = ld64(s20 + 1)
							const o = ah
							const q = ld64(k + 0x60)
							const ad = ld64(ai + ah + 0x68)
							st64(b + 8, h - 0x50)
							const p = ai + ah + 0x70
							st64(b, p)
							if (h - 0x50 >= 0x10) {
								const r = s1d8 + o
								ah = o + 0x80
								const ab = ld64(ai + o + 0x78)
								const aa = ld64(p)
								st64(z, ai + o + 0x80)
								f = h - 0x60
								st64(z + 8, f)
								st16(s1d8 + 0x18c, ld16(i + 4))
								st32(s1d8 + 0x188, ld32(i))
								st8(s39 + 0x10, ld8(i + 0x1f))
								copyr(s39, i + 0xf, 0x10)
								st16(s39 + 0x15, ld16(i + 0x24))
								st32(s39 + 0x11, ld32(i + 0x20))
								st64(s1d8 + 0x18f, ag)
								st8(s1d8 + 0x18e, j)
								st32(s40 + 3, ld32(s1d8 + 0x193))
								st32(s40, ld32(s1d8 + 0x190))
								const s = ld64(s1d8 + 0x188)
								st64(s20 + 0x16, ld64(s39 + 0xf))
								copyr(s20, s40, 0x18)
								st64(r, s)
								copy(r + 8, s20, 0x18)
								st64(r + 0x1e, ld64(s20 + 0x16))
								st64(r + 0x27, af)
								st8(r + 0x26, l)
								copy(r + 0x2f, k + 0x2f, 0x10)
								st8(r + 0x3f, ld8(k + 0x3f))
								st32(r + 0x40, ld32(k + 0x40))
								st16(r + 0x44, ld16(k + 0x44))
								st64(r + 0x47, ae)
								st8(r + 0x46, n)
								const v = ld8(k + 0x5f)
								const u = ld64(k + 0x57)
								const t = ld64(k + 0x4f)
								st64(r + 0x68, ad)
								st64(r + 0x60, q)
								st64(r + 0x78, ab)
								st64(r + 0x70, aa)
								st64(r + 0x4f, t)
								g = ah
								st64(r + 0x57, u)
								st8(r + 0x5f, v)
								m = ld64(s1d8 + 0x180) + 1
								st64(s1d8 + 0x180, m)
								b = z
								if (ah != 0x180) {
									continue
								}
								memcpy(a + 8, s1d8, 0x180)
								st64(a, 0)
								return
							}
						}
						w = fn_1459d0(0x100159468)
						m = ac
						break B10
					}
				}
			}
			w = fn_1459d0(0x100159468)
		}
		st64(a + 8, w)
		st64(a, 1)
		if (4 > m) {
			return
		}
		fn_14c5c0(m, 3, 0x100159438, x, y)
	}
}

export function fn_10590(a: u64, b: u64) {
	const f = ld64(b + 8)
	if (0x10 > f) {
		st64(a + 8, fn_1459d0(0x100159468))
		st64(a, 1)
	} else {
		const g = ld64(b)
		const i = ld64(g + 8)
		const j = ld64(g)
		st64(b, g + 0x10, f - 0x10)
		if (8 > f - 0x10) {
			st64(a + 8, fn_1459d0(0x100159468))
			st64(a, 1)
		} else {
			const m = ld64(g + 0x10)
			st64(b, g + 0x18, f - 0x18)
			if (0x10 > f - 0x18) {
				st64(a + 8, fn_1459d0(0x100159468))
				st64(a, 1)
			} else {
				const p = ld64(g + 0x20)
				const h = ld64(g + 0x18)
				st64(b, g + 0x28, f - 0x28)
				if (8 > f - 0x28) {
					st64(a + 8, fn_1459d0(0x100159468))
					st64(a, 1)
				} else {
					const l = ld64(g + 0x28)
					st64(b, g + 0x30, f - 0x30)
					if (0x10 > f - 0x30) {
						st64(a + 8, fn_1459d0(0x100159468))
						st64(a, 1)
					} else {
						const n = ld64(g + 0x38)
						const o = ld64(g + 0x30)
						st64(b, g + 0x40, f - 0x40)
						if (8 > f - 0x40) {
							st64(a + 8, fn_1459d0(0x100159468))
							st64(a, 1)
						} else {
							const k = ld64(g + 0x40)
							st64(b + 8, f - 0x48)
							st64(b, g + 0x48)
							st64(a + 0x40, n)
							st64(a + 0x38, o)
							st64(a + 0x28, p)
							st64(a + 0x20, h)
							st64(a + 0x10, i)
							st64(a + 8, j)
							st64(a + 0x48, k)
							st64(a + 0x30, l)
							st64(a + 0x18, m)
							st64(a, 0)
						}
					}
				}
			}
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_11150(a: u64, b: u64) {
	const s10 = fp - 0x10, s40 = fp - 0x40, s58 = fp - 0x58, s59 = fp - 0x59, s70 = fp - 0x70, s78 = fp - 0x78, s90 = fp - 0x90, s91 = fp - 0x91
	let z: u64
	let k = a
	const f = ld64(b + 8)
	if (f == 0) {
		z = fn_1459d0(0x100159468)
		st64(k, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, z)
	} else {
		const g = ld64(b)
		const h = ld8(g)
		st64(b + 8, f - 1)
		st64(b, g + 1)
		st8(s91, h)
		if (h == 0) {
			st64(k, 0x8000000000000000)
		} else if (h == 1) {
			if (5 > f) {
				z = fn_1459d0(0x100159468)
				st64(k, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, z)
			} else {
				const i = ld32(g + 1)
				st64(b + 8, f - 5)
				st64(b, g + 5)
				let p = 0
				if (i != 0) {
					const j = ld64(0x300000000 /* heap bump-allocator cursor */)
					const l = j != 0 ? j : 0x300008000
					const aa = k
					const m = l - (min(i, 0x800) << 1)
					let n = m > l ? 0 : m
					if (0x300000008 > n) {
						raw_vec_handle_error(1, min(i, 0x800) << 1, min(i, 0x800) << 1, min(i, 0x800), 0x300000008)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, n)
					st64(s78, min(i, 0x800))
					let q = 0
					st64(s70, n, 0)
					let o = f - 5
					let w = o
					let v = g + 5
					const ab = b
					while (true) {
						if (o == q) {
							z = fn_1459d0(0x100159468)
							st64(aa, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, z)
							return
						}
						const y = v + q
						const x = w
						const t = ld8(y)
						st64(b + 8, w - 1)
						st64(b, y + 1)
						st8(s59, t)
						if (t >= 0xd) {
							st64(s40, 0x100159668)
							st64(s40 + 0x10, s10)
							st64(s10, s59, num_fmt_bae8)
							st64(s40 + 0x20, 0)
							st64(s40 + 8, 1)
							st64(s40 + 0x18, 1)
							// fmt "Unexpected variant index: {}" {} = t [num_fmt_bae8]
							fn_147e78(s58, s40, y + 1, x - 1, o)
							z = fn_b580(s58)
							st64(aa, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, z)
							return
						}
						if (x == 1) {
							z = fn_1459d0(0x100159468)
							st64(aa, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, z)
							return
						}
						const s = ld8(y + 1)
						st64(b, y + 2)
						w = w - 2
						st64(b + 8, w)
						if (p == ld64(s78)) {
							fn_eef8(s78, b, v)
							v = g + 5
							o = f - 5
							b = ab
							n = ld64(s70)
						}
						p = p + 1
						const r = n + q
						st8(r + 1, s)
						st8(r, t)
						st64(s70 + 8, p)
						q = q + 2
						if (p >= i) {
							z = ld64(s70)
							const u = ld64(s78)
							k = aa
							if (u == 0x8000000000000000) {
								st64(k, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, z)
								return
							}
							st64(k + 0x10, p)
							st64(k + 8, z)
							st64(k, u)
							return
						}
					}
				}
				st64(k + 0x10, 0)
				st64(k + 8, 1)
				st64(k, 0)
			}
		} else {
			st64(s40, 0x1001596d8)
			st64(s40 + 0x10, s58)
			st64(s58, s91, fn_14ef78)
			st64(s40 + 0x20, 0)
			st64(s40 + 8, 2)
			st64(s40 + 0x18, 1)
			// fmt "Invalid Option representation: {}. The first byte must be 0 or 1" {} = h [fn_14ef78]
			fn_147e78(s90, s40, g + 1, f, g)
			st64(k + 8, fn_b580(s90))
			st64(k, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
		}
	}
}

export function fn_117c8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s51 = fp - 0x51, s68 = fp - 0x68
	st64(s68, a, b)
	st8(s51, c)
	st64(s50, 0x100159738)
	st64(s50 + 0x10, s20)
	st64(s20, s68, fn_b980, s51, fn_145c70)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	fn_149478(s50, 0x100159758, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (points to it), c (value)
export function fn_12758(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	let l: u64
	const f = ld64(b + 8)
	if (f != 0) {
		st64(b + 8, f - 1)
		const g: AccountInfo = ld64(b)
		st64(b, g + 0x30)
		const h = g.key
		if ((memcmp(h, 0x100152100 /* &MEMO_PROGRAM */, 0x20) as u32) != 0) {
			const k = anchor_error_from(s50, 0xbc0 /* anchor::InvalidProgramId */)
			const j = ld64(s50 + 8)
			const i = ld64(s50)
			copyr(s40, h, 0x20)
			st64(s20, 0x62129995a534a05 /* MEMO_PROGRAM */, 0x7c38da6071e8244d /* MEMO_PROGRAM[1] */, 0x81bb92bcddb5357c /* MEMO_PROGRAM[2] */, 0x8d44054140a81fe4 /* MEMO_PROGRAM[3] */) // key MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
			fn_13b5c0(s60, i, j, s40, k)
			l = ld64(s60)
			st64(a + 8, ld64(s60 + 8))
			st64(a, l)
		} else if (g.executable == 0) {
			anchor_error_from(s70, 0xbc1 /* anchor::InvalidProgramExecutable */)
			l = ld64(s70)
			st64(a + 8, ld64(s70 + 8))
			st64(a, l)
		} else {
			st64(a + 8, g)
			st64(a, 2)
		}
	} else {
		anchor_error_from(s80, 0xbbd /* anchor::AccountNotEnoughKeys */, c, d, e)
		l = ld64(s80)
		st64(a + 8, ld64(s80 + 8))
		st64(a, l)
	}
}

export function fn_12be8(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	let l: u64
	const f = ld64(b + 8)
	if (f != 0) {
		st64(b + 8, f - 1)
		const g: AccountInfo = ld64(b)
		st64(b, g + 0x30)
		const h = g.key
		if ((memcmp(h, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0) {
			const k = anchor_error_from(s50, 0xbc0 /* anchor::InvalidProgramId */)
			const j = ld64(s50 + 8)
			const i = ld64(s50)
			copyr(s40, h, 0x20)
			st64(s20, 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */, 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */, 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */, 0xfc8ba1d828f9bdfe /* TOKEN_2022_PROGRAM[3] */) // key TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
			fn_13b5c0(s60, i, j, s40, k)
			l = ld64(s60)
			st64(a + 8, ld64(s60 + 8))
			st64(a, l)
		} else if (g.executable == 0) {
			anchor_error_from(s70, 0xbc1 /* anchor::InvalidProgramExecutable */)
			l = ld64(s70)
			st64(a + 8, ld64(s70 + 8))
			st64(a, l)
		} else {
			st64(a + 8, g)
			st64(a, 2)
		}
	} else {
		anchor_error_from(s80, 0xbbd /* anchor::AccountNotEnoughKeys */, c, d, e)
		l = ld64(s80)
		st64(a + 8, ld64(s80 + 8))
		st64(a, l)
	}
}

export function fn_12e30(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	let l: u64
	const f = ld64(b + 8)
	if (f != 0) {
		st64(b + 8, f - 1)
		const g: AccountInfo = ld64(b)
		st64(b, g + 0x30)
		const h = g.key
		if ((memcmp(h, 0x1001521a0 /* &TOKEN_METADATA_PROGRAM */, 0x20) as u32) != 0) {
			const k = anchor_error_from(s50, 0xbc0 /* anchor::InvalidProgramId */)
			const j = ld64(s50 + 8)
			const i = ld64(s50)
			copyr(s40, h, 0x20)
			st64(s20, 0x457cd1e3b165700b /* TOKEN_METADATA_PROGRAM */, 0xcdc3046b7f529d38 /* TOKEN_METADATA_PROGRAM[1] */, 0xb5fda01a736cb858 /* TOKEN_METADATA_PROGRAM[2] */, 0x4629f803bcd1b649 /* TOKEN_METADATA_PROGRAM[3] */) // key metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s
			fn_13b5c0(s60, i, j, s40, k)
			l = ld64(s60)
			st64(a + 8, ld64(s60 + 8))
			st64(a, l)
		} else if (g.executable == 0) {
			anchor_error_from(s70, 0xbc1 /* anchor::InvalidProgramExecutable */)
			l = ld64(s70)
			st64(a + 8, ld64(s70 + 8))
			st64(a, l)
		} else {
			st64(a + 8, g)
			st64(a, 2)
		}
	} else {
		anchor_error_from(s80, 0xbbd /* anchor::AccountNotEnoughKeys */, c, d, e)
		l = ld64(s80)
		st64(a + 8, ld64(s80 + 8))
		st64(a, l)
	}
}

export function fn_13b50(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64, r7: u64): u64 {
	const s18 = fp - 0x18, s48 = fp - 0x48, s58 = fp - 0x58, s258 = fp - 0x258, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let g, j: u64
	st64(r0 + 0x18, ld64(r7))
	const f = ld8(d + 8)
	if (f != 0xff) {
		st64(r0 + 0x20, ld64(s258 + (f << 3)))
		g = d + 0x10
	} else {
		st64(r0 + 0x20, d + 8)
		g = d + 8 + ld64(d + 0x58) + 0x2867 & -8
	}
	if (e != 0) {
		let i = c - a
		let h = g
		do {
			g = g + 8
			if (ld8(h) == 0xff) {
				g = (h + ld64(h + 0x50) + 0x2867 & -8 /* next account record */)
			}
			i = i + 1
			h = g
		} while (i != 0)
	}
	B13: {
		j = ld64(g)
		if (j >= 8) {
			g = g + 8
			let k = 0x100159770
			if (ld64(g) != 0xb2fbcd0d76f39c2e /* ix:increase_liquidity */) {
				k = 0x100159788
				if (ld64(g) != 0x12c5b686fd026a0 /* ix:decrease_liquidity */) {
					k = 0x1001597a0
					if (ld64(g) != 0xab0ee45df591d85 /* ix:increase_liquidity_v2 */) {
						k = 0x1001597b8
						if (ld64(g) != 0x60c4524f3ebc7f3a /* ix:decrease_liquidity_v2 */) {
							k = 0x1001597d0
							if (ld64(g) != 0x2b35c6d27c09fbef /* ix:increase_liquidity_by_token_amounts_v2 */) {
								k = 0x1001597e8
								if (ld64(g) != 0xfd9e13830be0a9bf /* ix:reposition_liquidity_v2 */) {
									break B13
								}
							}
						}
					}
				}
			}
			callx(ld64(k + 0x10), s58, s258, c, g, j)
			if (ld64(s58) == 3) {
				return 0
			}
			return fn_150f0(s58, 0)
		}
	}
	fn_13fd08(s48, b, c, g, j)
	let n = ld64(s48 + 0x10)
	const m = ld64(s48 + 8)
	const o = ld64(s48 + 0x18)
	const l = ld64(s48 + 0x28)
	st64(s1000, ld64(s48 + 0x20))
	st64(sff8, l)
	anchor_dispatch(s48, o, m, n, ld64(s1000), l)
	let p = 0
	if (ld64(s48) != 0x800000000000001a /* Ok */) {
		copyr(s18, s48, 0x18)
		p = fn_143da0(s18, 0)
	}
	if (n == 0) {
		return p
	}
	let q = m + 0x10
	while (true) {
		const s = ld64(q)
		const r = ld64(q - 8)
		rc_dec(r)
		rc_dec(s)
		q = q + 0x30
		n = n - 1
		if (n == 0) {
			return p
		}
	}
}

export function fn_150f0(a: u64, r0: u64): u64 {
	const s18 = fp - 0x18
	const f = ld64(a)
	if (f != 2) {
		return fn_143da0(s18, error_from_13c648(s18, f, ld64(a + 8), r0))
	}
	const g = ld32(a + 8)
	if ((g as i64) > 0xc) {
		if ((g as i64) > 0x12) {
			if ((g as i64) > 0x15) {
				if ((g as i64) > 0x17) {
					return g != 0x18 ? 0x1a00000000 : 0x1900000000
				}
				return g != 0x16 ? 0x1800000000 : 0x1700000000
			}
			if (g == 0x13) {
				return 0x1400000000 /* ProgramError::InvalidRealloc */
			}
			return g != 0x14 ? 0x1600000000 : 0x1500000000
		}
		if ((g as i64) > 0xf) {
			if (g == 0x10) {
				return 0x1100000000 /* ProgramError::UnsupportedSysvar */
			}
			return g != 0x11 ? 0x1300000000 : 0x1200000000
		}
		if (g == 0xd) {
			return 0xe00000000 /* ProgramError::InvalidSeeds */
		}
		return g != 0xe ? 0x1000000000 : 0xf00000000
	}
	if ((g as i64) > 5) {
		if ((g as i64) > 8) {
			if ((g as i64) > 0xa) {
				return g != 0xb ? 0xd00000000 : 0xc00000000
			}
			return g != 9 ? 0xb00000000 : 0xa00000000
		}
		if (g == 6) {
			return 0x700000000 /* ProgramError::IncorrectProgramId */
		}
		return g != 7 ? 0x900000000 : 0x800000000
	}
	if ((g as i64) > 2) {
		if (g == 3) {
			return 0x400000000 /* ProgramError::InvalidAccountData */
		}
		return g != 4 ? 0x600000000 : 0x500000000
	}
	if (g == 0) {
		const h = ld32(a + 0xc)
		return h != 0 ? h : 0x100000000
	}
	return g != 1 ? 0x300000000 /* heap bump-allocator cursor */ : 0x200000000
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (points to it), c (value), d (value), p5 (points to it), p6 (value), p7 (value), p8 (value), p9 (value), p10 (value), p11 (value)
export function fn_3f9a0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64): u64 {
	const s180 = fp - 0x180, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8, s200 = fp - 0x200, s208 = fp - 0x208, s210 = fp - 0x210, s218 = fp - 0x218, s220 = fp - 0x220, s228 = fp - 0x228, s230 = fp - 0x230
	let n, v, w, x, y, ad, ae, ag, ah, aj, aq: u64
	st64(s200, b)
	st64(s1e8, a)
	const f = p10
	st64(s1f0, f != 0 ? c : d)
	const t = p8
	const u = p7
	const r = p12
	const q = p11
	const h = p6
	st64(s208, p5)
	const g = p9
	st64(s1f8, f)
	if (g != 0) {
		st64(s210, h)
		n = fn_82718(s180, ld64(s1f0))
		if (ld8(s180) != 0) {
			const p = ld64(s180 + 8)
			const o = ld64(s1e8)
			st64(o + 8, ld64(s180 + 0x10))
			st64(o, p)
			return n
		}
		st32(s1d0, ld32(s180 + 2))
		st16(s1d0 + 4, ld16(s180 + 6))
		const k = ld64(s210)
		let ac = k
		if ((ld8(s180 + 1) & 1) != 0) {
			const l = ld32(s180 + 0x10)
			const m = ld64(s180 + 8)
			st16(s180 + 4, ld16(s1d0 + 4))
			st32(s180, ld32(s1d0))
			st32(s180 + 0xe, l)
			st64(s180 + 6, m)
			fn_12db08(s1e0, s180, k, n)
			if (ld64(s1e0) == 0) {
				fn_1490e8(0x10015a2b0)
			}
			const aa = ld64(s1e0 + 8)
			const z = ld64(s210)
			if (aa > z) {
				fn_1490e8(0x10015a2c8, z)
			}
			ac = z - aa
		}
		const ab = ld64(s1f8)
		const af = ac
		n = fn_49708(s180, ld64(s200), ld64(s208), ac, u, t, 1, ab, q, r)
		w = ld64(s180 + 8)
		v = ld64(s180)
		if (v == 2) {
			B22: {
				if (ab != 0) {
					ad = ld64(w + 8)
					ae = ld64(w)
					ah = ld64(s210)
					y = ad
					if (ae == af) {
						break B22
					}
				} else {
					ad = ld64(w)
					ae = ld64(w + 8)
					ah = ad
					y = ld64(s210)
					if (ae == af) {
						break B22
					}
				}
				n = fn_823e0(s180, ld64(s1f0), ae, n)
				y = ld64(s180 + 8)
				if (ld64(s180) != 0) {
					x = ld64(s1e8)
					st64(x + 8, ld64(s180 + 0x10))
					st64(x, y)
					return n
				}
				ah = ad
				if (ld64(s1f8) != 0) {
					ah = y
					y = ad
				}
			}
			const al = ah
			st64(s228, ld64(w + 0x40))
			st64(s220, ld64(w + 0x38))
			st64(s218, ld64(w + 0x30))
			st64(s210, ld64(w + 0x28))
			st64(s208, ld64(w + 0x20))
			st64(s200, ld64(w + 0x18))
			st64(s1f0, ld32(w + 0x1d0))
			const ak = ld64(w + 0x10)
			memcpy(s180, w + 0x48, 0x180)
			st64(s1f8, ld64(w + 0x1c8))
			memcpy(s1d0, w + 0x1d4, 0x4f)
			const ai = ld64(0x300000000 /* heap bump-allocator cursor */)
			aj = ai != 0 ? sat_sub(ai, 0x228) & -8 : 0x300007dd8
			if (aj > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, aj)
				st64(aj + 0x40, ld64(s228))
				st64(aj + 0x38, ld64(s220))
				st64(aj + 0x30, ld64(s218))
				st64(aj + 0x28, ld64(s210))
				st64(aj + 0x20, ld64(s208))
				st64(aj + 0x18, ld64(s200))
				st64(aj + 0x10, ak)
				st64(aj + 8, y)
				st64(aj, al)
				memcpy(aj + 0x48, s180, 0x180)
				st32(aj + 0x1d0, ld64(s1f0))
				st64(aj + 0x1c8, ld64(s1f8))
				n = memcpy(aj + 0x1d4, s1d0, 0x4f)
				aq = ld64(s1e8)
				st64(aq + 8, aj)
				st64(aq, 2)
				return n
			}
			alloc_handle_alloc_error(8, 0x228)
		}
		ag = ld64(s1e8)
		st64(ag + 8, w)
		st64(ag, v)
		return n
	}
	d = f != 0 ? d : c
	n = fn_823e0(s180, d, h, h)
	const j = ld64(s180 + 8)
	if (ld64(s180) == 0) {
		const s = ld64(s1f8)
		n = fn_49708(s180, ld64(s200), ld64(s208), j, u, t, 0, s, q, r)
		w = ld64(s180 + 8)
		v = ld64(s180)
		if (v == 2) {
			const ao = ld64(w + (s != 0 ? 8 : 0))
			n = fn_823e0(s180, ld64(s1f0), ld64(w + (s != 0 ? 0 : 8)), n)
			y = ld64(s180 + 8)
			if (ld64(s180) == 0) {
				st64(s230, ld64(w + 0x40))
				st64(s228, ld64(w + 0x38))
				st64(s220, ld64(w + 0x30))
				st64(s218, ld64(w + 0x28))
				st64(s210, ld64(w + 0x20))
				st64(s208, ld64(w + 0x18))
				st64(s1f0, ld32(w + 0x1d0))
				const ap = ld64(w + 0x10)
				memcpy(s180, w + 0x48, 0x180)
				st64(s200, ld64(w + 0x1c8))
				memcpy(s1d0, w + 0x1d4, 0x4f)
				const am = ld64(0x300000000 /* heap bump-allocator cursor */)
				const an = ld64(s1f8)
				aj = am != 0 ? sat_sub(am, 0x228) & -8 : 0x300007dd8
				if (aj > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, aj)
					st64(aj + 0x40, ld64(s230))
					st64(aj + 0x38, ld64(s228))
					st64(aj + 0x30, ld64(s220))
					st64(aj + 0x28, ld64(s218))
					st64(aj + 0x20, ld64(s210))
					st64(aj + 0x18, ld64(s208))
					st64(aj + 0x10, ap)
					st64(aj + 8, an != 0 ? ao : y)
					st64(aj, an != 0 ? y : ao)
					memcpy(aj + 0x48, s180, 0x180)
					st32(aj + 0x1d0, ld64(s1f0))
					st64(aj + 0x1c8, ld64(s200))
					n = memcpy(aj + 0x1d4, s1d0, 0x4f)
					aq = ld64(s1e8)
					st64(aq + 8, aj)
					st64(aq, 2)
					return n
				}
				alloc_handle_alloc_error(8, 0x228)
			}
			x = ld64(s1e8)
			st64(x + 8, ld64(s180 + 0x10))
			st64(x, y)
			return n
		}
		ag = ld64(s1e8)
		st64(ag + 8, w)
		st64(ag, v)
		return n
	}
	const i = ld64(s1e8)
	st64(i + 8, ld64(s180 + 0x10))
	st64(i, j)
	return n
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), a (points to it), b (value)
export function fn_45408(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, sc0 = fp - 0xc0, sc8 = fp - 0xc8, sd0 = fp - 0xd0, sd8 = fp - 0xd8, se0 = fp - 0xe0, se8 = fp - 0xe8, sf0 = fp - 0xf0
	let r: u64
	st64(sc0 + 0x48, d)
	const g = ld64(e - 0x1000)
	const f = ld64(e - 0xff8)
	if (ld8(f) != 0) {
		st64(sc0, b, g)
		st64(sc0 + 0x50, f)
		const h = ld16(f + 0x3b)
		if (h != 0) {
			st64(sc0 + 0x58, h)
			const i = fn_151b50(c as i32, h)
			let j = ld64(sc0 + 0x50)
			const l = ld64(j + 9)
			const k = ld64(j + 1)
			r0 = i - (1 > (c as i32) & ((c - i * ld64(sc0 + 0x58)) as u32) != 0)
			st64(sc0 + 0x18, ld32(j + 0x19))
			const n = ld32(j + 0x15)
			const o = ld32(j + 0x11)
			st64(sc0 + 0x40, ld32(j + 0x37))
			st64(sd0, ld32(j + 0x33))
			st64(sc0 + 0x10, ld16(j + 0x31))
			st64(sc0 + 0x20, ld16(j + 0x2f))
			st64(sc0 + 0x30, ld16(j + 0x2d))
			const m = ld64(sc0 + 0x48)
			st64(sc0 + 0x28, r0)
			st64(sc8, l)
			if (max(k, l) > m) {
				fn_87630(s40, 0x16)
				j = ld64(sc0 + 0x50)
				const q = ld64(s40)
				r0 = n
				r = o
				st64(sc0 + 0x38, k)
				if (q != 2) {
					const ag = ld64(s40 + 8)
					st64(a, q, ag)
					st64(a + 0x20, 3)
					return r0
				}
			} else {
				r = 0
				st64(sc0 + 0x38, m)
				if (0xe10 >= m - k) {
					const p = m - max(k, l)
					r0 = n
					r = o
					st64(sc0 + 0x38, k)
					if (p >= ld64(sc0 + 0x30)) {
						r0 = ld64(sc0 + 0x28)
						r = 0
						st64(sc0 + 0x38, m)
						if (ld64(sc0 + 0x20) > p) {
							r = ld64(sc0 + 0x18) * ld64(sc0 + 0x10) / 0x2710
							r0 = ld64(sc0 + 0x28)
							st64(sc0 + 0x38, m)
						}
					}
				}
			}
			const s = ld64(sc0 + 0x40)
			st64(sc0 + 0x48, r)
			const t = s - r
			let u = ((t as u32) / 0x2710 * 0x2710) as u32
			let z = 0
			const v = (t as u32) / 0x2710 + (u != (t as u32))
			const w = v + r0
			const x = ld64(sc0 + 0x58)
			st64(se0, r0 - v)
			const ab = ((w + 1) * x) as i32
			let y = ((r0 - v) * x) as i32
			if ((y as i64) > -0x6c4f4) {
				fn_501e0(s50, y, r0)
				y = undef
				u = undef
				j = ld64(sc0 + 0x50)
				z = 1
				st64(sf0, ld64(s50 + 8))
				st64(se8, ld64(s50))
			}
			st64(sd8, z)
			const aa = j
			let ac = j + 0x3d
			let af = 0
			if (0x6c4f3 >= (ab as i64)) {
				st64(sc0 + 0x50, ac)
				fn_501e0(s60, ab, r0)
				ac = ld64(sc0 + 0x50)
				af = 1
				u = ld64(s60 + 8)
				y = ld64(s60)
			}
			st16(a + 0x92, ld16(ac + 0x10))
			st64(a + 0x8a, ld64(ac + 8))
			st64(a + 0x82, ld64(ac))
			const ae = ld64(aa + 0x25)
			const ad = ld64(aa + 0x1d)
			st64(a + 0x38, u)
			st64(a + 0x30, y)
			st64(a + 0x18, ld64(sf0))
			st64(a + 0x10, ld64(se8))
			st64(a + 0x60, ad, ae)
			st8(a + 0x94, ld64(sc0))
			st16(a + 0x80, ld64(sc0 + 0x58))
			st32(a + 0x7c, ld64(sc0 + 0x40))
			st32(a + 0x78, ld64(sd0))
			st16(a + 0x76, ld64(sc0 + 0x10))
			st16(a + 0x74, ld64(sc0 + 0x20))
			st16(a + 0x72, ld64(sc0 + 0x30))
			st16(a + 0x70, ld64(sc0 + 8))
			st32(a + 0x5c, ld64(sc0 + 0x18))
			st32(a + 0x58, r0)
			st32(a + 0x54, ld64(sc0 + 0x48))
			st64(a + 0x4c, ld64(sc8))
			st64(a + 0x44, ld64(sc0 + 0x38))
			st32(a + 0x40, ld64(sc0 + 0x28))
			st32(a + 0x28, w)
			st64(a + 0x20, af)
			st32(a + 8, ld64(se0))
			st64(a, ld64(sd8))
			return r0
		}
		st64(s30, 0x100159c98, 1, 8, 0, 0)
		// fmt "Divisor must be positive."
		fn_149478(s30, 0x100159ca8, g, f, e)
	}
	st16(a, g)
	st64(a + 0x20, 2)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), d (value), c (value), p5 (value), p6 (value), p7 (value)
export function fn_45af0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	let p, q: u64
	if (ld64(b + 0x20) == 2) {
		st64(a + 8, r0)
		st64(a, 2)
		return r0
	}
	const h = p7
	const f = p6
	let g = p5
	fn_501e0(s70, ld16(b + 0x82), r0)
	const j = g != h ? h > g : f > d
	let i = d
	const l = ld64(s70)
	const k = ld64(s70 + 8)
	st64(s40, j != 0 ? d : f, j != 0 ? g : h, 0, 0, l, k, 0, 0)
	fn_56670(s60, s40, s20)
	if (ld64(s60 + 0x18) != 0) {
		fn_87630(s80, 8)
		r0 = ld64(s80 + 8)
		const o = ld64(s80)
		q = c
		p = b
		if (o != 2) {
			st64(a + 8, r0)
			st64(a, o)
			return r0
		}
	} else {
		q = c
		p = b
		const m = g != h ? g > h : i > f
		g = m != 0 ? g : h
		i = m != 0 ? i : f
		r0 = i >= ld64(s60 + 8)
		const n = ld64(s60 + 0x10)
		r0 = g != n ? g >= n : r0
	}
	if ((r0 as u8) == 0) {
		st64(a + 8, r0)
		st64(a, 2)
		return r0
	}
	st64(p + 0x4c, q)
	st64(a + 8, r0)
	st64(a, 2)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), b (points to it)
export function fn_45de8(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30
	let h, i, l, m, q, r, s, t, u, v: u64
	st64(s10, c, d)
	if (ld64(b + 0x20) == 2) {
		fn_1494c8("internal error: entered unreachable code", 0x28, 0x100159c30, d, e)
	}
	B13: {
		B11: {
			B8: {
				const f = ld64(e - 0xff8)
				const g = c ^ ld64(e - 0x1000) | d ^ f
				st64(s30, a, b)
				if (g == 0) {
					h = ld16(b + 0x80)
					if (h == 0) {
						fn_14e1c0(0x100159c18, d ^ f, g, f, e)
					}
					i = ld64(e - 0xff0)
					const j = fn_151bf8(i as i32, h)
					l = 1
					if (j == 0) {
						break B8
					}
				} else {
					i = fn_53940(s10)
					h = ld16(b + 0x80)
					if (h == 0) {
						fn_14e1c0(0x100159c00)
					}
					const k = fn_151bf8(i as i32, h)
					if (k != 0) {
						break B11
					}
					fn_501e0(s20, i, k)
					l = 1
					if ((ld64(s20) ^ c | ld64(s20 + 8) ^ d) == 0) {
						break B8
					}
				}
				l = 0
			}
			if ((l & 1) != 0 && ld8(ld64(s30 + 8) + 0x94) == 0) {
				const n = fn_151b50(i as i32, h)
				q = 0
				m = ld64(s30 + 8)
				s = ld32(m + 0x40)
				t = m + 0x40
				r = n - 1
				u = ld64(s30)
				break B13
			}
		}
		const o = i as i32
		const p = fn_151b50(o, h)
		m = ld64(s30 + 8)
		t = m + 0x40
		s = ld32(m + 0x40) as i32
		r = (p - (1 > (o as i64) & ((i - p * h) as u32) != 0)) as i32
		q = ld8(m + 0x94)
		u = ld64(s30)
		if (q != 0 && (s as i64) > (r as i64)) {
			v = ld32(m + 0x58) - r
			st32(m + 0x40, r)
			st32(m + 0x5c, min((((v as i32) ^ sar(v as i32, 0x3f)) - sar(v as i32, 0x3f)) * 0x2710 + ld32(m + 0x54), ld32(m + 0x7c)))
			st32(t, r - 1)
			st64(u, 2)
			return
		}
	}
	if (q != 0) {
		st32(t, s + (q != 0 ? 0xffffffffffffffff : 1))
		st64(u, 2)
	} else if ((r as i32) > (s as i32)) {
		v = ld32(m + 0x58) - r
		st32(m + 0x40, r)
		st32(m + 0x5c, min((((v as i32) ^ sar(v as i32, 0x3f)) - sar(v as i32, 0x3f)) * 0x2710 + ld32(m + 0x54), ld32(m + 0x7c)))
		st32(t, r + 1)
		st64(u, 2)
	} else {
		st32(t, s + (q != 0 ? 0xffffffffffffffff : 1))
		st64(u, 2)
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it), b (value), d (value), p5 (value), p6 (value), p7 (value), p8 (value), p9 (value), p10 (points to it)
export function fn_49708(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64): u64 {
	const s22 = fp - 0x22, s4e = fp - 0x4e, s88 = fp - 0x88, sae = fp - 0xae, sdc = fp - 0xdc, sf8 = fp - 0xf8, s110 = fp - 0x110, s120 = fp - 0x120, s280 = fp - 0x280, s288 = fp - 0x288, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8, s328 = fp - 0x328, s3a8 = fp - 0x3a8, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s598 = fp - 0x598, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s5c8 = fp - 0x5c8, s5d8 = fp - 0x5d8, s5e8 = fp - 0x5e8, s628 = fp - 0x628, s640 = fp - 0x640, s668 = fp - 0x668, s720 = fp - 0x720, s778 = fp - 0x778, s780 = fp - 0x780, s788 = fp - 0x788, s790 = fp - 0x790, s798 = fp - 0x798, s7a0 = fp - 0x7a0, s7a8 = fp - 0x7a8, s7b0 = fp - 0x7b0, s7b8 = fp - 0x7b8, s7c0 = fp - 0x7c0, s7c8 = fp - 0x7c8, s7d0 = fp - 0x7d0, s7d8 = fp - 0x7d8, s7e0 = fp - 0x7e0, s7e8 = fp - 0x7e8, s7f0 = fp - 0x7f0, s7f8 = fp - 0x7f8, s800 = fp - 0x800, sfe8 = fp - 0xfe8, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let f, i, k, l, n, q, r, ab, ac, ah, aj, am, ba, bb, bc, bf, bg, bn, br, bt, cb, cd, ce, cr, el, ep, eq, fb, fi, fs, ft, fv, fw: u64
	B7: {
		B3: {
			st64(s628 + 0x18, c)
			const g = p6
			f = p5
			st64(s628 + 0x38, g)
			l = p10
			st64(s628 + 0x20, p9)
			const h = p8
			r = p7
			st64(s628 + 0x28, h)
			if ((f | g) == 0) {
				k = 0xfffec4b1
				q = 0x35bb7f32a81b33af
				st64(s628 + 0x30, 0)
				i = fn_13b50
				if (h != 0) {
					break B3
				}
			} else {
				i = f
				const j = ld64(s628 + 0x38) + (f >= fn_13b50)
				if ((j != 0xfffec4b2 ? 0xfffec4b1 > j - 1 : 0x35bb7f31a819f860 > f + 0xfffffffefffec4b0) == 0) {
					ac = fn_87630(s438, 0xb)
					ab = ld64(s438)
					st64(a + 8, ld64(s438 + 8))
					st64(a, ab)
					return ac
				}
				f = i
				k = ld64(s628 + 0x38)
				st64(s628 + 0x30, k)
				q = i
				if (ld64(s628 + 0x28) != 0) {
					break B3
				}
			}
			st64(s628 + 0x10, l)
			const p = ld64(b + 0x230)
			st64(s628 + 8, p)
			n = ld64(b + 0x238)
			st64(s628, q)
			st64(s628 + 0x30, k)
			if ((k != n ? n >= k : p >= q) != 0) {
				ac = fn_87630(s448, 0x22)
				ab = ld64(s448)
				st64(a + 8, ld64(s448 + 8))
				st64(a, ab)
				return ac
			}
			break B7
		}
		st64(s628 + 0x10, l)
		const m = ld64(b + 0x230)
		st64(s628, i, m)
		n = ld64(b + 0x238)
		const o = n > ld64(s628 + 0x30)
		if (((ld64(s628 + 0x30) != n ? o : m > i) & 1) == 0) {
			ac = fn_87630(s448, 0x22)
			ab = ld64(s448)
			st64(a + 8, ld64(s448 + 8))
			st64(a, ab)
			return ac
		}
	}
	if (d == 0) {
		ac = fn_87630(s5e8, 0x23)
		ab = ld64(s5e8)
		st64(a + 8, ld64(s5e8 + 8))
		st64(a, ab)
		return ac
	}
	st64(s720 + 0xb0, n)
	st64(s720 + 0x98, f)
	st64(s640 + 0x10, r)
	st64(s720 + 0xa8, d)
	const u = ld16(b + 0x282)
	st64(s668 + 0x18, ld16(b + 0x280))
	const t = ld16(b + 0x27c)
	st64(s668 + 0x20, b)
	const s = ld64(s628 + 0x20)
	fn_4e100(s2a8, b, s)
	if (ld32(s2a8) != 0) {
		ac = fn_87630(s458, ld32(s2a8 + 4))
		ab = ld64(s458)
		st64(a + 8, ld64(s458 + 8))
		st64(a, ab)
		return ac
	}
	st64(s720 + 0x30, t)
	st64(s720 + 0x58, u)
	st64(s720 + 0x80, s2a0)
	const y = memcpy(s428, s2a0, 0x180)
	const v = ld64(s668 + 0x20)
	copyr(s720, v + 0x250, 0x10)
	st64(s720 + 0x18, ld64(v + 0x248))
	st64(s720 + 0x20, ld64(v + 0x240))
	copyr(s640, v + 0x220, 0x10)
	const x = ld32(v + 0x278)
	st64(s1000, ld64(s668 + 0x18))
	st64(sff8, ld64(s628 + 0x10))
	const w = ld64(s628 + 0x28)
	st64(s720 + 0x60, x)
	ac = fn_45408(s2a8, w, x, s, fp, y)
	const aa = ld64(s2a0)
	ab = ld64(s2a8)
	const z = ld64(s288)
	if (z == 3) {
		st64(a + 8, aa)
		st64(a, ab)
		return ac
	}
	st64(s628 + 0x10, ab)
	copyr(s110, s298, 0x10)
	memcpy(sf8, s280, 0x70)
	let ad = ld64(s720 + 0x20)
	if (w == 0) {
		ad = ld64(s720)
	}
	st64(s720 + 0x40, ad)
	st64(s720 + 0x68, a)
	let ae = ld64(s720 + 0x18)
	const ak = ld64(s720 + 0xa8)
	let al = ld64(s628 + 0x18)
	if (ld64(s628 + 0x28) == 0) {
		ae = ld64(s720 + 8)
	}
	B132: {
		st64(s720 + 0x50, ae)
		const af = ld64(s628)
		const ag = ld64(s628 + 8)
		ah = ld64(s720 + 0xb0)
		const ai = ld64(s628 + 0x30) ^ ah
		st64(s110 + 0x10, z)
		st64(s120 + 8, aa)
		st64(s120, ld64(s628 + 0x10))
		ba = 0
		aj = 0
		st64(s720 + 0x88, 0)
		st64(s668 + 0x18, ag)
		am = ah
		st64(s668 + 0x10, 0)
		st64(s628 + 0x10, ak)
		fi = ld64(s640 + 0x10)
		fb = ld64(s628 + 0x20)
		if ((af ^ ag | ai) != 0) {
			st64(s780, ld64(s328 + 0x78))
			st64(s778 + 0x20, ld64(s328 + 0x70))
			st64(s788, ld64(s3a8 + 0x78))
			st64(s778 + 0x18, ld64(s3a8 + 0x70))
			st64(s790, ld64(s428 + 0x78))
			st64(s778 + 0x10, ld64(s428 + 0x70))
			st64(s668 + 0x10, 0)
			st64(s778, s3a8, s328)
			st64(s778 + 0x28, ld64(al + 8))
			st64(s720 + 0x10, ld64(al + 0x10))
			st64(s628 + 0x10, ak)
			st64(s668 + 0x18, ld64(s628 + 8))
			am = ld64(s720 + 0xb0)
			st64(s720 + 0x88, 0)
			let ao = 0
			L20: while (true) {
				const at = am
				const an = ld64(s628 + 0x28)
				st64(s1000, an)
				st64(s778 + 0x48, ao)
				st64(sff8, ao)
				ac = fn_643d0(s2a8, al, ld64(s720 + 0x60), ld64(s720 + 0x30), an, ao)
				st64(s720 + 0x28, ld64(s2a0))
				if (ld64(s2a8) == 0) {
					const ap = ld32(s298)
					st64(s720 + 0x48, ap)
					fn_501e0(s468, ap, ac)
					st64(s720 + 0xa0, ld64(s468 + 8))
					const aq = ld64(s468)
					st64(s720 + 0x38, aq)
					if (an != 0) {
						const aw = ld64(s628)
						bb = at
						const ax = ld64(s720 + 0xa0) > ld64(s628 + 0x30)
						const ay = ld64(s720 + 0xa0) != ld64(s628 + 0x30) ? ax : aq > aw
						bc = ld64(s720 + 0xa0)
						if (ay == 0) {
							bc = ld64(s628 + 0x30)
						}
						st64(s668 + 0x20, aq)
						if (ay == 0) {
							st64(s668 + 0x20, aw)
						}
					} else {
						const ar = ld64(s628)
						bb = at
						const au = ld64(s720 + 0xa0) > ld64(s628 + 0x30)
						const av = ld64(s628 + 0x30) != ld64(s720 + 0xa0) ? au : aq > ar
						bc = ld64(s628 + 0x30)
						if (av == 0) {
							bc = ld64(s720 + 0xa0)
						}
						st64(s668 + 0x20, ar)
						if (av == 0) {
							st64(s668 + 0x20, aq)
						}
					}
					const az = ld64(s720 + 0x28)
					st64(s778 + 0x50, ld64(s778 + 0x28) + az * 0x78)
					st64(s778 + 0x30, ld64(s720 + 0x48) - 1)
					st64(s778 + 0x40, az + 1)
					st64(s720 + 0x90, ba)
					st64(s668 + 8, ld64(s668 + 0x18))
					st64(s668, bb)
					st64(s720 + 0x78, bc)
					while (true) {
						B118: {
							const en = ld64(s110 + 0x10)
							st64(s720 + 0x70, en)
							if (en != 2) {
								const eu = ld32(sf8 + 0x18)
								const ev = (ld32(sdc + 0x14) - (eu as i32)) as i32
								const ew = min(((ev ^ sar(ev, 0x3f)) - sar(ev, 0x3f)) * 0x2710 + ld32(sdc + 0x10), ld32(sae + 0xa))
								st32(sdc + 0x18, ew)
								const ex = ld16(sae + 0xe)
								st64(s778 + 0x38, ex)
								const ey = ld32(sae + 6)
								st64(s668 + 0x18, ey)
								__multi3(s478, ((ew * ex) as u32) * ((ew * ex) as u32), 0, ey, 0)
								const ez = ld64(s478)
								const fa = ld64(s478 + 8)
								__udivti3(s488, ez, fa, 0x9184e72a000, 0, fb)
								const fc = ld64(s488)
								const cg = __multi3(s498, fc, ld64(s488 + 8), 0x9184e72a000, 0)
								bn = 1
								ep = ld64(s628 + 0x28)
								const cc = ld64(s720 + 0x78)
								eq = min(min(fc + ((ld64(s498) ^ ez | ld64(s498 + 8) ^ fa) != 0), 0x186a0) + ld16(sdc + 0x2c), 0x186a0)
								cd = ld64(s668 + 0x20)
								ce = cc
								if ((ld64(s640) | ld64(s640 + 8)) != 0) {
									cd = ld64(s668 + 0x20)
									ce = cc
									if (ld64(s668 + 0x18) != 0) {
										if (ld64(s120) != 0) {
											cb = ld8(sae + 0x22)
											if ((ld32(s120 + 8) as i32) > (eu as i32)) {
												cd = ld64(s668 + 0x20)
												ce = cc
												if (cb != 0) {
													break B118
												}
												const cj = ld64(s110)
												let cl = cj > ld64(s668 + 0x20)
												const ck = ld64(s110 + 8)
												cl = cc != ck ? ck > cc : cl
												ce = cl != 0 ? cc : ck
												cd = ld64(s668 + 0x20)
												cd = cl != 0 ? cd : cj
												break B118
											}
										} else {
											cb = ld8(sae + 0x22)
										}
										if (ld64(s720 + 0x70) != 0 && (eu as i32) > (ld32(sf8) as i32)) {
											cd = ld64(s668 + 0x20)
											ce = cc
											if (cb == 0) {
												break B118
											}
											cd = ld64(sf8 + 8)
											let cf = cd > ld64(s668 + 0x20)
											ce = ld64(sf8 + 0x10)
											cf = ce != cc ? ce > cc : cf
											ce = cf != 0 ? ce : cc
											if (cf != 0) {
												break B118
											}
										} else {
											if (cb == 0) {
												fn_501e0(s4b8, smax(smin((((eu as i32) + 1) * ld64(s778 + 0x38)) as i32, 0x6c4f4), 0xfffffffffff93b0c), cg)
												bn = 0
												const cn = ld64(s4b8 + 8)
												const cm = ld64(s720 + 0x78)
												const co = ld64(s4b8)
												let cp = co > ld64(s668 + 0x20)
												cp = cm != cn ? cn > cm : cp
												ce = cp != 0 ? cm : cn
												cd = ld64(s668 + 0x20)
												cd = cp != 0 ? cd : co
												break B118
											}
											fn_501e0(s4a8, smax(smin(((eu as i32) * ld64(s778 + 0x38)) as i32, 0x6c4f4), 0xfffffffffff93b0c), cg)
											bn = 0
											ce = ld64(s4a8 + 8)
											const ch = ld64(s720 + 0x78)
											cd = ld64(s4a8)
											let ci = cd > ld64(s668 + 0x20)
											ci = ce != ch ? ce > ch : ci
											ce = ci != 0 ? ce : ch
											if (ci != 0) {
												break B118
											}
										}
										cd = ld64(s668 + 0x20)
									}
								}
							} else {
								bn = 0
								eq = ld16(s120)
								cd = ld64(s668 + 0x20)
								ce = bc
								ep = ld64(s628 + 0x28)
							}
						}
						const eo = ld64(s640 + 0x10)
						st64(sfe8, cd, ce, eo, ep)
						st64(sff0, ld64(s668))
						st64(sff8, ld64(s668 + 8))
						st64(s1000, ld64(s640 + 8))
						fn_4e7c8(s2a8, ld64(s628 + 0x10), eq, ld64(s640), ld64(s1000), ld64(sff8), ld64(sff0), cd, ce, eo, ep)
						if (ld32(s2a8) != 0) {
							ac = fn_87630(s4c8, ld32(s2a8 + 4))
							bt = ld64(s4c8)
							fw = ld64(s720 + 0x68)
							st64(fw + 8, ld64(s4c8 + 8))
							st64(fw, bt)
							return ac
						}
						const er = ld64(s720 + 0x80)
						copyr(s88, er, 0x28)
						const fu = ld64(s720 + 0x68)
						if (eo != 0) {
							const et = ld64(s88 + 0x10)
							const es = ld64(s628 + 0x10)
							if (et > es) {
								ac = fn_87630(s5b8, 0x28)
								fv = ld64(s5b8)
								st64(fu + 8, ld64(s5b8 + 8))
								st64(fu, fv)
								return ac
							}
							bf = ld64(s88 + 0x20)
							if (bf > es - et) {
								ac = fn_87630(s5a8, 0x28)
								fv = ld64(s5a8)
								st64(fu + 8, ld64(s5a8 + 8))
								st64(fu, fv)
								return ac
							}
							const be = ld64(s88 + 0x18)
							const bd = ld64(s668 + 0x10)
							if (bd > bd + be) {
								ac = fn_87630(s598, 0x27)
								fv = ld64(s598)
								st64(fu + 8, ld64(s598 + 8))
								st64(fu, fv)
								return ac
							}
							bg = es - et - bf
							st64(s668 + 0x10, bd + be)
						} else {
							const fe = ld64(s88 + 0x18)
							const fd = ld64(s628 + 0x10)
							if (fe > fd) {
								ac = fn_87630(s4f8, 0x28)
								fv = ld64(s4f8)
								st64(fu + 8, ld64(s4f8 + 8))
								st64(fu, fv)
								return ac
							}
							const fg = ld64(s88 + 0x10)
							const ff = ld64(s668 + 0x10)
							if (ff > ff + fg) {
								ac = fn_87630(s4e8, 0x27)
								fv = ld64(s4e8)
								st64(fu + 8, ld64(s4e8 + 8))
								st64(fu, fv)
								return ac
							}
							bf = ld64(s88 + 0x20)
							const fh = ff + fg + bf
							st64(s668 + 0x10, fh)
							bg = fd - fe
							if (ff + fg > fh) {
								ac = fn_87630(s4d8, 0x27)
								fv = ld64(s4d8)
								st64(fu + 8, ld64(s4d8 + 8))
								st64(fu, fv)
								return ac
							}
						}
						st64(s628 + 0x10, bg)
						const bh = ld64(s720 + 0x90)
						ba = bh + bf
						if (bh > ba) {
							ac = fn_87630(s588, 0x27)
							bt = ld64(s588)
							fw = ld64(s720 + 0x68)
							st64(fw + 8, ld64(s588 + 8))
							st64(fw, bt)
							return ac
						}
						const bi = ld64(s720 + 0x58)
						if (bi != 0) {
							__multi3(s508, bf, 0, bi, 0)
							const bu = ld64(s508 + 8)
							if (bu >= 0x2710) {
								fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s2a8, 0x100159c60, 0x100159c80)
							}
							__udivti3(s518, ld64(s508), bu, 0x2710, 0, bf)
							const bv = ld64(s518)
							st64(s720 + 0x88, ld64(s720 + 0x88) + bv)
							bf = bf - bv
						}
						if ((ld64(s640) | ld64(s640 + 8)) != 0) {
							__udivti3(s528, 0, bf, ld64(s640), ld64(s640 + 8), bf)
							const bj = ld64(s528)
							const bk = ld64(s720 + 0x40)
							const bl = ld64(s528 + 8)
							const bm = ld64(s720 + 0x50)
							st64(s720 + 0x40, bj + bk)
							st64(s720 + 0x50, bl + bm + (bj > bj + bk))
						}
						B76: {
							B70: {
								B74: {
									st64(s720 + 0x90, bn)
									ah = ld64(s88)
									const bo = ld64(s720 + 0x38)
									const bp = ld64(s88 + 8)
									const bq = ld64(s720 + 0xa0)
									st64(s668 + 0x18, ah)
									if ((ah ^ bo | bp ^ bq) == 0) {
										B65: {
											B64: {
												B41: {
													B40: {
														am = bp
														fi = ld64(s640 + 0x10)
														fb = ld64(s628 + 0x20)
														if (ld64(s720 + 0x10) > ld64(s720 + 0x28)) {
															const bw = ld64(s778 + 0x50)
															let bz = ld64(bw + 8)
															const bx = ld8(bw + 4)
															bz = bx != 2 ? bw : bz
															let by = ld64(bw + 0x10)
															by = bx != 2 ? 0x10015a128 : by
															const ca = ld64(by + 0x38)
															callx(ca, s2a8, bz, ld64(s720 + 0x48), ld64(s720 + 0x30), ca)
															if (ld8(s2a8) == 0) {
																const cq = ld8(s2a8 + 1)
																if (cq != 0) {
																	if (cq == 2) {
																		fn_1490e8(0x100159c48)
																	}
																	st64(s7d0, cq)
																	const cx = ld64(s280 + 0x1a)
																	st64(s7c0, 1)
																	const cy = ld64(s778 + 0x10)
																	st64(s720 + 0x60, cx)
																	st64(s798, ld64(s280 + 0x42))
																	st64(s668, ld64(s280 + 0x3a))
																	st64(s778 + 0x38, ld64(s280 + 0x32))
																	st64(s668 + 8, ld64(s280 + 0x2a))
																	st64(s778 + 0x48, ld64(s280 + 0x22))
																	st64(s7f0, ld64(s280 + 0x12))
																	st64(s7a8, ld64(s280 + 0xa))
																	st64(s7e8, ld64(s280 + 2))
																	st64(s7b0, ld64(s288 + 2))
																	st64(s7e0, ld64(s298 + 0xa))
																	st64(s7d8, ld64(s298 + 2))
																	st64(s7b8, ld64(s2a0 + 2))
																	st64(s7a0, ld64(s2a8 + 2))
																	st64(s2a8, 0, 0, 0, 0)
																	const cz = memcmp(s428, s2a8, 0x20)
																	if ((cz as u32) != 0) {
																		st64(s778 + 0x48, ld64(s790) - ld64(s778 + 0x48) - (cx > cy))
																	}
																	if ((cz as u32) != 0) {
																		st64(s720 + 0x60, ld64(s778 + 0x10) - ld64(s720 + 0x60))
																	}
																	const db = ld64(s668 + 8) > ld64(s778 + 0x18)
																	st64(s2a8, 0, 0, 0, 0)
																	const da = memcmp(ld64(s778), s2a8, 0x20)
																	if ((da as u32) != 0) {
																		st64(s778 + 0x38, ld64(s788) - ld64(s778 + 0x38) - db)
																	}
																	if ((da as u32) != 0) {
																		st64(s668 + 8, ld64(s778 + 0x18) - ld64(s668 + 8))
																	}
																	const dd = ld64(s668) > ld64(s778 + 0x20)
																	st64(s2a8, 0, 0, 0, 0)
																	const dc = memcmp(ld64(s778 + 8), s2a8, 0x20)
																	if ((dc as u32) != 0) {
																		st64(s798, ld64(s780) - ld64(s798) - dd)
																	}
																	const de = ld64(s720 + 0x40)
																	const dg = ld64(s720 + 0x20)
																	const dh = ld64(s7a0)
																	if ((dc as u32) != 0) {
																		st64(s668, ld64(s778 + 0x20) - ld64(s668))
																	}
																	const df = ld64(s628 + 0x28)
																	const dj = df != 0 ? de : dg
																	let di = ld64(s720)
																	let dk = ld64(s7b8)
																	di = df != 0 ? di : de
																	let dw = ld64(s720 + 8)
																	if (df == 0) {
																		dw = ld64(s720 + 0x50)
																	}
																	st64(s7c8, 1)
																	if (di >= ld64(s7a8)) {
																		st64(s7c8, 0)
																	}
																	if (dj >= ld64(s7b0)) {
																		st64(s7c0, 0)
																	}
																	st64(s7f8, dj)
																	let dx = ld64(s720 + 0x50)
																	if (df == 0) {
																		dx = ld64(s720 + 0x18)
																	}
																	const dl = ld64(s628 + 0x28) != 0 ? -dh : dh
																	const dm = ld64(s628 + 0x28) != 0 ? -(dk + (dh != 0)) : dk
																	if ((dl | dm) != 0) {
																		if ((dm != 0 ? 0 > (dm as i64) : dl == 0) != 0) {
																			st64(s800, 1)
																			let dt = -dl > ld64(s640)
																			const ds = dm + (dl != 0)
																			if (ld64(s640 + 8) >= -ds) {
																				st64(s800, 0)
																			}
																			if (ld64(s640 + 8) != -ds) {
																				dt = ld64(s800)
																			}
																			if ((dt & 1) != 0) {
																				ac = fn_87630(s558, 0xf)
																				bt = ld64(s558)
																				fw = ld64(s720 + 0x68)
																				st64(fw + 8, ld64(s558 + 8))
																				st64(fw, bt)
																				return ac
																			}
																			const du = ld64(s640)
																			const dv = dm + ld64(s640 + 8) + (dl > dl + du)
																			st64(s640, dl + du, dv)
																		} else {
																			const dn = ld64(s640)
																			st64(s800, 1)
																			let dp = dn > dn + dl
																			const dq = ld64(s640 + 8)
																			const dr = dq + dm + dp
																			if (dr >= dq) {
																				st64(s800, 0)
																			}
																			if (dr != ld64(s640 + 8)) {
																				dp = ld64(s800)
																			}
																			if ((dp & 1) != 0) {
																				ac = fn_87630(s558, 0xe)
																				bt = ld64(s558)
																				fw = ld64(s720 + 0x68)
																				st64(fw + 8, ld64(s558 + 8))
																				st64(fw, bt)
																				return ac
																			}
																			st64(s640, dn + dl, dr)
																		}
																		dk = ld64(s7b8)
																	}
																	const ea = dw - ld64(s7f0)
																	const dy = dx - ld64(s7e8)
																	const dz = ld64(s7c0)
																	const eb = ld64(s7c8)
																	const ed = ld64(s7b0)
																	const ec = ld64(s7f8)
																	const ef = di - ld64(s7a8)
																	const ee = ld64(s7a0)
																	st64(s88 + 0x2c, (ee >> 0x20 | (dk << 0x20)))
																	st32(s88 + 0x28, ee)
																	const eg = ld64(s88 + 0x28)
																	st64(s280 + 0x40, ld64(s798))
																	st64(s280 + 0x38, ld64(s668))
																	st64(s280 + 0x30, ld64(s778 + 0x38))
																	st64(s280 + 0x28, ld64(s668 + 8))
																	st64(s280 + 0x20, ld64(s778 + 0x48))
																	st64(s280 + 0x18, ld64(s720 + 0x60))
																	st64(s288, ec - ed, dy - dz, ef, ea - eb)
																	st64(s298 + 8, ld64(s7e0))
																	st64(s298, ld64(s7d8))
																	st8(s280 + 0x48, ld64(s7d0))
																	st64(s2a8, eg, dk)
																	const eh = ld64(s778 + 0x50)
																	let ek = ld64(eh + 8)
																	const ei = ld8(eh + 4)
																	ek = ei != 2 ? eh : ek
																	let ej = ld64(eh + 0x10)
																	fi = ld64(s640 + 0x10)
																	fb = ld64(s628 + 0x20)
																	ej = ei != 2 ? 0x10015a128 : ej
																	ac = callx(ld64(ej + 0x40), s568, ek, ld64(s720 + 0x48), ld64(s720 + 0x30), s2a8)
																	el = ld64(s568)
																	if (el != 2) {
																		ft = ld64(s568 + 8)
																		fs = ld64(s720 + 0x68)
																		st64(fs, el, ft)
																		return ac
																	}
																}
																cr = ld64(s778 + 0x50)
																break B64
															}
															br = ld64(s298)
															if (ld64(s2a0) != 0) {
																break B40
															}
														} else {
															fn_87630(s538, 3)
															br = ld64(s538 + 8)
															st64(s298, br)
															const bs = ld64(s538)
															st64(s2a0, bs)
															st8(s2a8, 1)
															if (bs != 0) {
																break B40
															}
														}
														void ld64(br)
														cr = ld64(s778 + 0x50)
														void ld8(br + 0x50)
														break B41
													}
													void ld64(br)
													cr = ld64(s778 + 0x50)
													void ld8(br + 0x38)
												}
												if (ld64(s720 + 0x28) >= ld64(s720 + 0x10)) {
													ac = fn_87630(s548, 3)
													st64(s2a0, ld64(s548 + 8))
													bt = ld64(s548)
													st64(s2a8, bt)
													if (bt == 2) {
														break B65
													}
													fw = ld64(s720 + 0x68)
													st64(fw + 8, ld64(s2a0))
													st64(fw, bt)
													return ac
												}
											}
											let cu = ld64(cr + 8)
											const cs = ld8(cr + 4)
											cu = cs != 2 ? cr : cu
											let ct = ld64(cr + 0x10)
											ct = cs != 2 ? 0x10015a128 : ct
											const cv = ld64(ct + 0x68)
											ac = callx(cv, s2a8, cu, ld64(s720 + 0x48), ld64(s720 + 0x30), cv)
											bt = ld64(s2a8)
											if (bt != 2) {
												fw = ld64(s720 + 0x68)
												st64(fw + 8, ld64(s2a0))
												st64(fw, bt)
												return ac
											}
										}
										const cw = ld64(s2a0)
										if (ld64(s628 + 0x28) == 0) {
											st64(s778 + 0x48, ld64(s778 + 0x40))
											ah = ld64(s668 + 0x18)
											if (cw != 0x57) {
												st64(s778 + 0x48, ld64(s720 + 0x28))
											}
											st64(s720 + 0x60, ld64(s720 + 0x48))
											if (ld64(s720 + 0x90) != 0) {
												break B70
											}
											break B74
										}
										st64(s778 + 0x48, ld64(s778 + 0x40))
										ah = ld64(s668 + 0x18)
										if (cw != 0) {
											st64(s778 + 0x48, ld64(s720 + 0x28))
										}
										st64(s720 + 0x60, ld64(s778 + 0x30))
									} else {
										am = bp
										fi = ld64(s640 + 0x10)
										fb = ld64(s628 + 0x20)
										if ((ah ^ ld64(s668 + 8) | bp ^ ld64(s668)) != 0) {
											st64(s720 + 0x60, fn_53940(s88))
											ah = ld64(s668 + 0x18)
											if (ld64(s720 + 0x90) != 0) {
												break B70
											}
											break B74
										}
									}
									if (ld64(s720 + 0x90) != 0) {
										break B70
									}
								}
								al = ld64(s628 + 0x18)
								bc = ld64(s720 + 0x78)
								if (ld64(s720 + 0x70) == 2) {
									break B76
								}
								st32(sf8 + 0x18, (ld8(sae + 0x22) != 0 ? 0xffffffffffffffff : 1) + ld32(sf8 + 0x18))
								break B76
							}
							st64(sff0, ld64(s720 + 0x48))
							st64(s1000, ld64(s720 + 0x38))
							st64(sff8, ld64(s720 + 0xa0))
							fn_45de8(s578, s120, ah, am, fp)
							ah = ld64(s668 + 0x18)
							al = ld64(s628 + 0x18)
							bc = ld64(s720 + 0x78)
						}
						aj = ld64(s628 + 0x10) == 0
						if (ld64(s628 + 0x10) != 0) {
							const em = ld64(s668 + 0x20)
							st64(s720 + 0x90, ba)
							st64(s668, am, ah)
							if ((ah ^ em | am ^ bc) != 0) {
								continue
							}
						}
						ao = ld64(s778 + 0x48)
						if ((ld64(s628) ^ ah | ld64(s628 + 0x30) ^ am) == 0) {
							break B132
						}
						if (ld64(s628 + 0x10) != 0) {
							continue L20
						}
						break B132
					}
				}
				const fx = ld64(s720 + 0x68)
				st64(fx + 8, ld64(s298))
				st64(fx, ld64(s720 + 0x28))
				return ac
			}
		}
	}
	if ((ld64(s720 + 0x98) | ld64(s628 + 0x38)) == 0 && ((aj & 1) == 0 && fi == 0)) {
		ac = fn_87630(s5c8, 0x39)
		bt = ld64(s5c8)
		fw = ld64(s720 + 0x68)
		st64(fw + 8, ld64(s5c8 + 8))
		st64(fw, bt)
		return ac
	}
	st64(sff8, ld64(s668 + 0x18))
	st64(s628 + 0x38, am)
	st64(sff0, am)
	st64(s1000, ld64(s720 + 0xb0))
	ac = fn_45af0(s5d8, s120, fb, ld64(s628 + 8), ld64(s1000), ld64(sff8), am, ah)
	const fj = ld64(s720 + 0xa8)
	const fk = ld64(s628 + 0x10)
	const fl = fi ^ ld64(s628 + 0x28)
	let fo = fj - fk
	if (fl == 0) {
		fo = ld64(s668 + 0x10)
	}
	if (fl == 0) {
		st64(s668 + 0x10, fj - fk)
	}
	el = ld64(s5d8)
	if (el == 2) {
		const fn = ba - ld64(s720 + 0x88)
		let fq = 0
		if (ld64(s110 + 0x10) != 2) {
			st16(s22 + 0x20, ld16(sae + 0x20))
			copyr(s22, sae, 0x20)
			memcpy(s4e, sdc, 0x2c)
			fq = 1
		}
		const fm = fn_e368(0x228, 8)
		st64(fm + 0x40, ld64(s720 + 0x50))
		st64(fm + 0x38, ld64(s720 + 0x40))
		st64(fm + 0x30, ld64(s628 + 0x38))
		st64(fm + 0x28, ld64(s668 + 0x18))
		st64(fm + 0x20, ld64(s640 + 8))
		st64(fm + 0x18, ld64(s640))
		st64(fm + 0x10, fn)
		st64(fm + 8, fo)
		st64(fm, ld64(s668 + 0x10))
		memcpy(fm + 0x48, s428, 0x180)
		st8(fm + 0x1d4, fq)
		st32(fm + 0x1d0, ld64(s720 + 0x60))
		st64(fm + 0x1c8, ld64(s720 + 0x88))
		ac = memcpy(fm + 0x1d5, s4e, 0x4e)
		const fr = ld64(s720 + 0x68)
		st64(fr + 8, fm)
		st64(fr, 2)
		return ac
	}
	ft = ld64(s5d8 + 8)
	fs = ld64(s720 + 0x68)
	st64(fs, el, ft)
	return ac
}

export function fn_4c1a0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s18 = fp - 0x18, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s68 = fp - 0x68, s90 = fp - 0x90, s98 = fp - 0x98, sc0 = fp - 0xc0, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140
	let al = fn_5fd40(s120)
	let ae = ld64(s120 + 8)
	let f = ld64(s120)
	if (f != 2) {
		st64(a + 8, ae)
		st64(a, f)
		return al
	}
	const g: AccountInfo = ld64(c)
	const h = fn_143100(g, f)
	al = fn_5fd40(s130)
	ae = ld64(s130 + 8)
	f = ld64(s130)
	if (f != 2) {
		st64(a + 8, ae)
		st64(a, f)
		return al
	}
	const i: LamportsCell = g.lamports
	const l = g.key
	rc_inc(i)
	const j: DataCell = g.data
	rc_inc(j)
	const aq = g.executable
	const ar = g.is_writable
	const at = g.is_signer
	const au = g.rent_epoch
	const av = g.owner
	const k: AccountInfo = ld64(b)
	fn_142e70(s110, k.key, l, sat_sub(0x248880, h) + 0x17ca00)
	const m: LamportsCell = k.lamports
	const r = k.key
	rc_inc(m)
	const n: DataCell = k.data
	rc_inc(n)
	const am = k.executable
	const an = k.is_writable
	const ao = k.is_signer
	const ap = k.rent_epoch
	const o = k.owner
	rc_inc(i)
	rc_inc(j)
	const p: AccountInfo = ld64(d)
	const q: LamportsCell = p.lamports
	const x = p.key
	rc_inc(q)
	const s: DataCell = p.data
	rc_inc(s)
	const w = p.owner
	const v = p.rent_epoch
	const u = p.is_signer
	const t = p.is_writable
	st8(s38 + 2, p.executable)
	st8(s38, u, t)
	st64(s60, x, q, s, w, v)
	st8(s68, at, ar, aq)
	st64(s90, l, i, j, av, au)
	st8(s98, ao, an, am)
	st64(sc0, r, m, n, o, ap)
	al = fn_1390b0(s30, s110, sc0, 3)
	if (ld64(s30) != 0x800000000000001a /* Ok */) {
		copyr(s18, s30, 0x18)
		fn_13b430(s140, s18)
		const ag: DataCell = ld64(sc0 + 0x10)
		ae = ld64(s140 + 8)
		f = ld64(s140)
		const af: LamportsCell = ld64(sc0 + 8)
		rc_dec(af)
		al = i
		rc_dec(ag)
		const ai: DataCell = ld64(s90 + 0x10)
		const ah: LamportsCell = ld64(s90 + 8)
		rc_dec(ah)
		rc_dec(ai)
		const ak: DataCell = ld64(s60 + 0x10)
		const aj: LamportsCell = ld64(s60 + 8)
		rc_dec(aj)
		rc_dec(ak)
		rc_dec(al)
		if (!rc_release(j)) {
			st64(a + 8, ae)
			st64(a, f)
			return al
		}
		j.weak = j.weak - 1
		st64(a + 8, ae)
		st64(a, f)
		return al
	}
	const z: DataCell = ld64(sc0 + 0x10)
	const y: LamportsCell = ld64(sc0 + 8)
	rc_dec(y)
	rc_dec(z)
	const ab: DataCell = ld64(s90 + 0x10)
	const aa: LamportsCell = ld64(s90 + 8)
	rc_dec(aa)
	rc_dec(ab)
	const ad: DataCell = ld64(s60 + 0x10)
	const ac: LamportsCell = ld64(s60 + 8)
	rc_dec(ac)
	rc_dec(ad)
	ae = i.strong - 1
	i.strong = ae
	if (ae == 0) {
		ae = i.weak - 1
		i.weak = ae
	}
	if (rc_release(j)) {
		j.weak = j.weak - 1
		st64(a + 8, ae)
		st64(a, 2)
		return al
	}
	st64(a + 8, ae)
	st64(a, 2)
	return al
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), a (points to it), b (value)
export function fn_4e100(a: u64, b: u64, c: u64) {
	const s20 = fp - 0x20, sa0 = fp - 0xa0, s120 = fp - 0x120, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240
	const f = ld64(b + 0x270)
	if (f > c) {
		st32(a + 4, 0x16)
		st32(a, 1)
	} else if (c == f) {
		memcpy(a + 8, b, 0x180)
		st32(a, 0)
	} else {
		const h = ld64(b + 0x228)
		const g = ld64(b + 0x220)
		st64(s240, g, h)
		if ((g | h) == 0) {
			memcpy(a + 8, b, 0x180)
			st32(a, 0)
		} else {
			memcpy(s1a0, b, 0x180)
			st64(s20, 0, 0, 0, 0)
			if ((memcmp(s1a0, s20, 0x20) as u32) != 0) {
				let l = 0
				__multi3(s1c0, ld64(s1a0 + 0x68), 0, c - f, 0)
				__multi3(s1b0, c - f, 0, ld64(s1a0 + 0x60), 0)
				const j = ld64(s1c0)
				const i = ld64(s1b0 + 8)
				let n = 0
				if ((ld64(s1c0 + 8) != 0 | i > i + j) == 0) {
					__udivti3(s1d0, ld64(s1b0), i + j, ld64(s240), ld64(s240 + 8), f)
					n = ld64(s1d0 + 8)
					l = ld64(s1d0)
				}
				const k = ld64(s1a0 + 0x70)
				const m = k + l
				st64(s1a0 + 0x70, m)
				st64(s1a0 + 0x78, ld64(s1a0 + 0x78) + n + (k > m))
			}
			st64(s20, 0, 0, 0, 0)
			if ((memcmp(s120, s20, 0x20) as u32) != 0) {
				let r = 0
				__multi3(s1f0, ld64(s120 + 0x68), 0, c - f, 0)
				__multi3(s1e0, c - f, 0, ld64(s120 + 0x60), 0)
				const p = ld64(s1f0)
				const o = ld64(s1e0 + 8)
				let t = 0
				if ((ld64(s1f0 + 8) != 0 | o > o + p) == 0) {
					__udivti3(s200, ld64(s1e0), o + p, ld64(s240), ld64(s240 + 8), f)
					t = ld64(s200 + 8)
					r = ld64(s200)
				}
				const q = ld64(s120 + 0x70)
				const s = q + r
				st64(s120 + 0x70, s)
				st64(s120 + 0x78, ld64(s120 + 0x78) + t + (q > s))
			}
			st64(s20, 0, 0, 0, 0)
			if ((memcmp(sa0, s20, 0x20) as u32) == 0) {
				memcpy(a + 8, s1a0, 0x180)
				st32(a, 0)
			} else {
				let x = 0
				__multi3(s220, ld64(sa0 + 0x68), 0, c - f, 0)
				__multi3(s210, c - f, 0, ld64(sa0 + 0x60), 0)
				const v = ld64(s220)
				const u = ld64(s210 + 8)
				let z = 0
				if ((ld64(s220 + 8) != 0 | u > u + v) == 0) {
					__udivti3(s230, ld64(s210), u + v, ld64(s240), ld64(s240 + 8), f)
					z = ld64(s230 + 8)
					x = ld64(s230)
				}
				const w = ld64(sa0 + 0x70)
				const y = w + x
				st64(sa0 + 0x70, y)
				st64(sa0 + 0x78, ld64(sa0 + 0x78) + z + (w > y))
				memcpy(a + 8, s1a0, 0x180)
				st32(a, 0)
			}
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value), a (points to it), d (value), p5 (value), p6 (value), p7 (value), p8 (value), p9 (value), p10 (value), p11 (value)
export function fn_4e7c8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64) {
	const s10 = fp - 0x10, s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s140 = fp - 0x140, s158 = fp - 0x158, s160 = fp - 0x160, s168 = fp - 0x168, s170 = fp - 0x170, s178 = fp - 0x178, s180 = fp - 0x180, s188 = fp - 0x188, s190 = fp - 0x190, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, sff0 = fp - 0xff0, s1000 = fp - 0x1000
	let n, q, r, ab, ad, ai, ak, az, bc, be, cg, ci, cq: u64
	B17: {
		B14: {
			st64(s188, c)
			st64(s140, b)
			st64(s170, d)
			const l = p9
			const h = p8
			let k = p7
			const j = p6
			const i = p5
			const g = p11
			const f = p10
			st64(s160, h)
			st64(s158 + 0x10, f)
			st64(s140 + 8, i)
			st64(s178, d)
			st64(s140 + 0x10, j)
			st64(s180, f ^ g)
			st64(s158, a, k)
			if (f != (g ^ 1)) {
				st64(s1000, l, d, i, f)
				fn_54ae0(s18, j, k, h, fp)
				n = ld32(s18)
				if (n == 2) {
					st32(a + 4, ld32(s18 + 4))
					st32(a, 1)
					return
				}
				st64(s198, l)
				st64(s168, ld64(s10))
				q = ld64(s160)
				ab = ld64(s158 + 0x10)
				r = ld64(s140 + 8)
				ak = a
			} else {
				const o = k != l ? l > k : h > j
				let m = ld64(s140 + 0x10) > h
				m = k != l ? k > l : m
				k = m != 0 ? k : l
				st64(s190, ld64(s158 + 8))
				n = 0
				st64(s168, 0)
				ak = a
				if (o == 0) {
					st64(s190, l)
				}
				st64(s198, l)
				let p = ld64(s140 + 0x10)
				q = h
				ab = ld64(s158 + 0x10)
				const s = m != 0 ? p : h
				r = ld64(s140 + 8)
				p = o != 0 ? p : h
				if ((ld64(s170) | r) != 0) {
					n = 0
					if ((s ^ p | k ^ ld64(s190)) != 0) {
						const t = s - p
						__multi3(s48, r, 0, t, 0)
						const u = k - ld64(s190) - (p > s)
						const v = ld64(s178)
						__multi3(s38, u, 0, v, 0)
						__multi3(s28, v, 0, t, 0)
						ak = ld64(s158)
						q = ld64(s160)
						ab = ld64(s158 + 0x10)
						const w = ld64(s140 + 8)
						const x = ld64(s48 + 8) != 0
						const y = ld64(s38 + 8) != 0
						const z = ld64(s28 + 8)
						const aa = z + (ld64(s48) + ld64(s38))
						st64(s168, aa)
						n = 1
						r = w
						if (((w != 0 & u != 0 | x | y | z > aa) & 1) == 0) {
							n = 0
							if (ab != 0) {
								const ac = ld64(s28)
								if (ac != 0 && ld64(s168) == -1) {
									n = 1
									ad = ld64(s140)
									break B14
								}
								if (ac != 0) {
									st64(s168, ld64(s168) + 1)
								}
							}
						}
					}
				}
			}
			ad = ld64(s140)
			ai = ad
			if (ab == 0) {
				break B17
			}
		}
		st64(s1a0, n)
		const af = ad
		const ae = ld64(s188)
		__multi3(s68, -((ae as u32) > 0xf4240), 0, ad, 0)
		__multi3(s58, ad, 0, 0xf4240 - (ae as u32), 0)
		const ag = ld64(s58 + 8)
		const ah = ld64(s68)
		if ((ld64(s68 + 8) != 0 | ag > ag + ah) != 0) {
			ak = ld64(s158)
			st32(ak + 4, 0x1f)
			st32(ak, 1)
			return
		}
		if (ag + ah > 0xf423f) {
			ak = ld64(s158)
			st32(ak + 4, 7)
			st32(ak, 1)
			return
		}
		__udivti3(s78, ld64(s58), ag + ah, 0xf4240, 0, af)
		ai = ld64(s78)
		q = ld64(s160)
		ab = ld64(s158 + 0x10)
		r = ld64(s140 + 8)
		n = ld64(s1a0)
		ad = af
		ak = ld64(s158)
	}
	B33: {
		if (n == 0) {
			st64(s190, q)
			az = ld64(s198)
			if (ai >= ld64(s168)) {
				break B33
			}
		}
		if (ld64(s180) == 0) {
			st64(s1000, r, ai, ab)
			fn_55308(s18, ld64(s140 + 0x10), ld64(s158 + 8), ld64(s178), r, ai, ab)
			q = ld64(s160)
			if (ld32(s18) != 0) {
				st32(ak + 4, ld32(s18 + 4))
				st32(ak, 1)
				return
			}
		} else {
			if ((ld64(s170) | r) == 0) {
				st32(s18 + 4, 6)
				st32(ak + 4, ld32(s18 + 4))
				st32(ak, 1)
				return
			}
			st64(s1a0, n)
			const aj = ld64(s178)
			__udivti3(s88, 0, ai, aj, r, ak)
			const am = ld64(s88 + 8)
			const al = ld64(s88)
			if (ld64(s158 + 0x10) != 0) {
				const av = ld64(s140 + 0x10)
				let ax = av > av + al
				const aw = ld64(s158 + 8)
				const ay = aw + am + ax
				q = ld64(s160)
				ax = ay != aw ? aw > ay : ax
				if ((ax & 1) != 0) {
					st32(s18 + 4, 0xb)
					st32(ak + 4, ld32(s18 + 4))
					st32(ak, 1)
					return
				}
				st64(s10, av + al, ay)
				n = ld64(s1a0)
			} else {
				st64(s1a8, al)
				st64(s190, am)
				__multi3(s98, al, am, aj, ld64(s140 + 8))
				const an = ld64(s98)
				q = ld64(s160)
				const ap = (-an | ai - ld64(s98 + 8) - (an != 0)) != 0
				const ao = ld64(s1a8)
				const aq = ld64(s158 + 8)
				const ar = ld64(s190) + (ao > ao + ap)
				let at = ao + ap > ld64(s140 + 0x10)
				at = aq != ar ? ar > aq : at
				if ((at & 1) != 0) {
					st32(s18 + 4, 0xb)
					st32(ak + 4, ld32(s18 + 4))
					st32(ak, 1)
					return
				}
				const au = ao + ap > ld64(s140 + 0x10)
				st64(s10, ld64(s140 + 0x10) - (ao + ap))
				st64(s10 + 8, aq - ar - au)
				n = ld64(s1a0)
			}
		}
		az = ld64(s10 + 8)
		st64(s190, ld64(s10))
		ab = ld64(s158 + 0x10)
		r = ld64(s140 + 8)
	}
	st64(s1a0, n)
	if (ld64(s180) == 0) {
		let br = ld64(s158 + 8)
		let bt = ld64(s190) > ld64(s140 + 0x10)
		bt = br != az ? az > br : bt
		let bs = ld64(s140 + 0x10) > ld64(s190)
		bc = 0
		bs = br != az ? br > az : bs
		br = bs != 0 ? br : az
		st64(s180, ld64(s158 + 8))
		if (bt == 0) {
			st64(s180, az)
		}
		st64(s1a8, az)
		let bu = ld64(s140 + 0x10)
		if (bs == 0) {
			bu = ld64(s190)
		}
		st64(s168, ld64(s168))
		let bv = ld64(s140 + 0x10)
		if (bt == 0) {
			bv = ld64(s190)
		}
		be = ld64(s140 + 8)
		let cc = 0
		if ((ld64(s170) | be) != 0) {
			be = br ^ ld64(s180)
			if ((bu ^ bv | be) != 0) {
				const bw = bu - bv
				const bx = ld64(s140 + 8)
				st64(s170, bw)
				__multi3(sc8, bx, 0, bw, 0)
				cc = 1
				const by = br - ld64(s180) - (bv > bu)
				const bz = ld64(s178)
				__multi3(sb8, by, 0, bz, 0)
				__multi3(sa8, bz, 0, ld64(s170), 0)
				q = ld64(s160)
				ab = ld64(s158 + 0x10)
				const ca = ld64(sa8 + 8)
				bc = ca + (ld64(sc8) + ld64(sb8))
				be = 0x1e
				if ((ld64(s140 + 8) != 0 & by != 0 | ld64(sc8 + 8) != 0 | ld64(sb8 + 8) != 0 | ca > bc) == 0) {
					cc = 0
					if (ab == 0) {
						const cb = ld64(sa8)
						cc = cb != 0 & bc == -1
						be = 0x21
						if (bc != -1 && cb != 0) {
							cc = 0
							bc = bc + 1
						}
					}
				}
			}
		}
		if ((cc as u32) != 0) {
			ak = ld64(s158)
			st32(ak + 4, be)
			st32(ak, 1)
			return
		}
		az = ld64(s1a8)
		ad = ld64(s140)
		const ce = ld64(s158 + 8)
		const cd = ld64(s140 + 0x10)
		if ((ld64(s190) ^ q | az ^ ld64(s198)) != 0 || ld64(s1a0) != 0) {
			const cr = bc
			st64(sff0, ld64(s140 + 8))
			st64(sff0 + 8, ab)
			st64(s1000 + 8, ld64(s178))
			st64(s1000, az)
			fn_54ae0(s18, cd, ce, ld64(s190), fp)
			const cf = ld32(s18)
			if (cf == 2) {
				ak = ld64(s158)
				st32(ak + 4, ld32(s18 + 4))
				st32(ak, 1)
				return
			}
			if (cf != 0) {
				ak = ld64(s158)
				st32(ak + 4, ld32(s18 + 4))
				st32(ak, 1)
				return
			}
			st64(s168, ld64(s10))
			q = ld64(s160)
			ab = ld64(s158 + 0x10)
			bc = cr
		}
	} else {
		st64(sff0, r, ab ^ 1)
		st64(s1000 + 8, ld64(s178))
		st64(s1000, az)
		let ba = ld64(s158 + 8)
		fn_54ae0(s18, ld64(s140 + 0x10), ba, ld64(s190), fp)
		const bb = ld32(s18)
		if (bb == 2) {
			ak = ld64(s158)
			st32(ak + 4, ld32(s18 + 4))
			st32(ak, 1)
			return
		}
		if (bb != 0) {
			ak = ld64(s158)
			st32(ak + 4, ld32(s18 + 4))
			st32(ak, 1)
			return
		}
		st64(s168, ld64(s168))
		q = ld64(s160)
		bc = ld64(s10)
		ab = ld64(s158 + 0x10)
		if ((ld64(s190) ^ q | az ^ ld64(s198)) != 0 || ld64(s1a0) != 0) {
			st64(s180, bc)
			be = ld64(s190) > ld64(s140 + 0x10)
			be = ba != az ? az > ba : be
			let bd = ld64(s140 + 0x10) > ld64(s190)
			bd = ba != az ? ba > az : bd
			ba = bd != 0 ? ba : az
			const bf = ld64(s140 + 8)
			if (be == 0) {
				st64(s158 + 8, az)
			}
			st64(s1a8, az)
			let bg = ld64(s140 + 0x10)
			if (bd == 0) {
				bg = ld64(s190)
			}
			st64(s168, 0)
			if (be == 0) {
				be = ld64(s190)
				st64(s140 + 0x10, be)
			}
			let bq = 0
			if ((ld64(s170) | bf) != 0) {
				be = ba ^ ld64(s158 + 8)
				if ((bg ^ ld64(s140 + 0x10) | be) != 0) {
					const bh = ld64(s140 + 0x10)
					st64(s140 + 0x10, bh)
					__multi3(sf8, bf, 0, bg - bh, 0)
					bq = 1
					const bi = ba - ld64(s158 + 8) - (ld64(s140 + 0x10) > bg)
					const bj = ld64(s178)
					__multi3(se8, bi, 0, bj, 0)
					__multi3(sd8, bj, 0, bg - bh, 0)
					ad = ld64(s140)
					q = ld64(s160)
					ab = ld64(s158 + 0x10)
					const bk = ld64(s140 + 8) != 0
					const bl = ld64(sf8 + 8) != 0
					const bm = ld64(se8 + 8) != 0
					const bn = ld64(sd8 + 8)
					const bo = bn + (ld64(sf8) + ld64(se8))
					st64(s168, bo)
					be = 0x1e
					if (((bk & bi != 0 | bl | bm | bn > bo) & 1) == 0) {
						bq = 0
						if (ab != 0) {
							const bp = ld64(sd8)
							bq = bp != 0 & ld64(s168) == -1
							be = 0x21
							if (ld64(s168) != -1 && bp != 0) {
								bq = 0
								be = ld64(s168) + 1
								st64(s168, be)
							}
						}
					}
				}
			}
			bc = ld64(s180)
			az = ld64(s1a8)
			if ((bq as u32) != 0) {
				ak = ld64(s158)
				st32(ak + 4, be)
				st32(ak, 1)
				return
			}
		}
	}
	B77: {
		if (ab != 0) {
			cg = ld64(s168)
			ci = cg
			if ((ld64(s190) ^ q | az ^ ld64(s198)) != 0) {
				cq = ad - cg
				break B77
			}
		} else {
			ci = bc
			bc = min(ld64(s168), ad)
		}
		if ((ld64(s188) as u32) == 0xf4240) {
			ak = ld64(s158)
			st32(ak + 4, 6)
			st32(ak, 1)
			return
		}
		st64(s180, bc)
		st64(s1a8, az)
		const ch = ld64(s188)
		st64(s140 + 0x10, ci)
		__multi3(s108, ci, 0, ch as u32, 0)
		const cj = (ch as u32) > 0xf4240
		const ck = ld64(s108)
		const cl = ld64(s108 + 8)
		__udivti3(s118, ck, cl, 0xf4240 - (ch as u32), -cj, ck)
		const cm = ld64(s118)
		const cn = ld64(s118 + 8)
		st64(s140, cm, cn)
		__multi3(s128, cm, cn, 0xf4240 - (ch as u32), -cj)
		const co = ld64(s128)
		az = ld64(s1a8)
		bc = ld64(s180)
		cg = ld64(s140 + 0x10)
		const cp = ld64(s140)
		cq = cp + ((ck - co | cl - ld64(s128 + 8) - (co > ck)) != 0)
		if (ld64(s140 + 8) + (cp > cq) != 0) {
			ak = ld64(s158)
			st32(ak + 4, 7)
			st32(ak, 1)
			return
		}
	}
	ak = ld64(s158)
	st64(ak + 8, ld64(s190))
	st64(ak + 0x28, cq)
	st64(ak + 0x20, bc)
	st64(ak + 0x18, cg)
	st64(ak + 0x10, az)
	st32(ak, 0)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
export function fn_501e0(a: u64, b: u64, r0: u64): u64 {
	const s4 = fp - 0x4, s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s598 = fp - 0x598, s5a8 = fp - 0x5a8
	if ((b as i32) > -1) {
		let j = (b & 1) != 0 ? 0x1000346d6 : 0x100000000
		let h = -(b & 1) & 0xff11672ae55ad00f
		if ((b & 2) != 0) {
			const i = h & 0xff11672ae55ad00f
			__multi3(s138, i, 0, 0xbac710cb295e9e1b, 0)
			__multi3(s148, i, 0, fn_68db8, 0)
			__multi3(s158, j, 0, 0xbac710cb295e9e1b, 0)
			r0 = __multi3(s168, j, 0, fn_68db8, 0)
			const k = ld64(s138 + 8)
			const l = k + (ld64(s148) & -8)
			const m = l + (ld64(s158) & -2)
			const n = ld64(s148 + 8) + ld64(s168) + ld64(s158 + 8) + ((k > l) + (l > m))
			j = n >> 0x20 | 0x100000000
			h = (n << 0x20) | m >> 0x20
		}
		if ((b & 4) != 0) {
			__multi3(s178, h, 0, 0x68abe5f76b30fb75, 0)
			__multi3(s188, h, 0, 0x1000d1b9c, 0)
			__multi3(s198, j, 0, 0x68abe5f76b30fb75, 0)
			__multi3(s1a8, j, 0, 0x1000d1b9c, 0)
			const o = ld64(s178 + 8)
			const p = o + (ld64(s188) & -4)
			const q = p + ld64(s198)
			const r = ld64(s188 + 8)
			r0 = r + ld64(s1a8)
			const s = ld64(s198 + 8)
			const t = r0 + s + ((o > p) + (p > q))
			const u = ld64(s1a8 + 8) + (r > r0) + (r0 > r0 + s) + (r0 + s > t)
			if (u >= 0x100000000) {
				st32(s4, 8)
				fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s4, 0x100159cf0, 0x100159d10)
			}
			j = (u << 0x20) | t >> 0x20
			h = (t << 0x20) | q >> 0x20
		}
		if ((b & 8) != 0) {
			__multi3(s1b8, h, 0, 0xa234cb0830516e51, 0)
			__multi3(s1c8, h, 0, 0x1001a37e4, 0)
			__multi3(s1d8, j, 0, 0xa234cb0830516e51, 0)
			__multi3(s1e8, j, 0, 0x1001a37e4, 0)
			const v = ld64(s1b8 + 8)
			const w = v + (ld64(s1c8) & -4)
			const x = w + ld64(s1d8)
			const y = ld64(s1c8 + 8)
			r0 = y + ld64(s1e8)
			const z = ld64(s1d8 + 8)
			const aa = r0 + z + ((v > w) + (w > x))
			const ab = ld64(s1e8 + 8) + (y > r0) + (r0 > r0 + z) + (r0 + z > aa)
			if (ab >= 0x100000000) {
				st32(s4, 8)
				fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s4, 0x100159cf0, 0x100159d10)
			}
			j = (ab << 0x20) | aa >> 0x20
			h = (aa << 0x20) | x >> 0x20
		}
		if ((b & 0x10) != 0) {
			__multi3(s1f8, h, 0, 0xab0e92ada25ab460, 0)
			__multi3(s208, h, 0, 0x100347278, 0)
			__multi3(s218, j, 0, 0xab0e92ada25ab460, 0)
			__multi3(s228, j, 0, 0x100347278, 0)
			const ac = ld64(s1f8 + 8)
			const ad = ac + (ld64(s208) & -8)
			const ae = ad + (ld64(s218) & -0x20)
			const af = ld64(s208 + 8)
			r0 = af + ld64(s228)
			const ag = ld64(s218 + 8)
			const ah = r0 + ag + ((ac > ad) + (ad > ae))
			const ai = ld64(s228 + 8) + (af > r0) + (r0 > r0 + ag) + (r0 + ag > ah)
			if (ai >= 0x100000000) {
				st32(s4, 8)
				fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s4, 0x100159cf0, 0x100159d10)
			}
			j = (ai << 0x20) | ah >> 0x20
			h = (ah << 0x20) | ae >> 0x20
		}
		if ((b & 0x20) != 0) {
			__multi3(s238, h, 0, 0xa525480a5d7fdc2, 0)
			__multi3(s248, h, 0, 0x10068efb0, 0)
			__multi3(s258, j, 0, 0xa525480a5d7fdc2, 0)
			__multi3(s268, j, 0, 0x10068efb0, 0)
			const aj = ld64(s238 + 8)
			const ak = aj + (ld64(s248) & -0x10)
			const al = ak + (ld64(s258) & -2)
			const am = ld64(s248 + 8)
			r0 = am + ld64(s268)
			const an = ld64(s258 + 8)
			const ao = r0 + an + ((aj > ak) + (ak > al))
			const ap = ld64(s268 + 8) + (am > r0) + (r0 > r0 + an) + (r0 + an > ao)
			if (ap >= 0x100000000) {
				st32(s4, 8)
				fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s4, 0x100159cf0, 0x100159d10)
			}
			j = (ap << 0x20) | ao >> 0x20
			h = (ao << 0x20) | al >> 0x20
		}
		if ((b & 0x40) != 0) {
			__multi3(s278, h, 0, 0xb4173839df9daaa5, 0)
			__multi3(s288, h, 0, 0x100d20a63, 0)
			__multi3(s298, j, 0, 0xb4173839df9daaa5, 0)
			__multi3(s2a8, j, 0, 0x100d20a63, 0)
			const ar = ld64(s288)
			const aq = ld64(s278 + 8)
			const at = aq + ar + ld64(s298)
			const au = ld64(s288 + 8)
			r0 = au + ld64(s2a8)
			const av = ld64(s298 + 8)
			const aw = r0 + av + ((aq > aq + ar) + (aq + ar > at))
			const ax = ld64(s2a8 + 8) + (au > r0) + (r0 > r0 + av) + (r0 + av > aw)
			if (ax >= 0x100000000) {
				st32(s4, 8)
				fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s4, 0x100159cf0, 0x100159d10)
			}
			j = (ax << 0x20) | aw >> 0x20
			h = (aw << 0x20) | at >> 0x20
		}
		if ((b & 0x80) != 0) {
			__multi3(s2b8, h, 0, 0x742dd7729738df5e, 0)
			__multi3(s2c8, h, 0, 0x101a4c11c, 0)
			__multi3(s2d8, j, 0, 0x742dd7729738df5e, 0)
			__multi3(s2e8, j, 0, 0x101a4c11c, 0)
			const ay = ld64(s2b8 + 8)
			const az = ay + (ld64(s2c8) & -4)
			const ba = az + (ld64(s2d8) & -2)
			const bb = ld64(s2c8 + 8)
			r0 = bb + ld64(s2e8)
			const bc = ld64(s2d8 + 8)
			const bd = r0 + bc + ((ay > az) + (az > ba))
			const be = ld64(s2e8 + 8) + (bb > r0) + (r0 > r0 + bc) + (r0 + bc > bd)
			if (be >= 0x100000000) {
				st32(s4, 8)
				fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s4, 0x100159cf0, 0x100159d10)
			}
			j = (be << 0x20) | bd >> 0x20
			h = (bd << 0x20) | ba >> 0x20
		}
		if ((b & 0x100) != 0) {
			__multi3(s2f8, h, 0, 0x1f64cfa6dc0d6de4, 0)
			__multi3(s308, h, 0, 0x1034c35c3, 0)
			__multi3(s318, j, 0, 0x1f64cfa6dc0d6de4, 0)
			__multi3(s328, j, 0, 0x1034c35c3, 0)
			const bg = ld64(s308)
			const bf = ld64(s2f8 + 8)
			const bh = bf + bg + (ld64(s318) & -4)
			const bi = ld64(s308 + 8)
			r0 = bi + ld64(s328)
			const bj = ld64(s318 + 8)
			const bk = r0 + bj + ((bf > bf + bg) + (bf + bg > bh))
			const bl = ld64(s328 + 8) + (bi > r0) + (r0 > r0 + bj) + (r0 + bj > bk)
			if (bl >= 0x100000000) {
				st32(s4, 8)
				fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s4, 0x100159cf0, 0x100159d10)
			}
			j = (bl << 0x20) | bk >> 0x20
			h = (bk << 0x20) | bh >> 0x20
		}
		if ((b & 0x200) != 0) {
			__multi3(s338, h, 0, 0xc8aaffbf81bed5a3, 0)
			__multi3(s348, h, 0, 0x106a34b78, 0)
			__multi3(s358, j, 0, 0xc8aaffbf81bed5a3, 0)
			__multi3(s368, j, 0, 0x106a34b78, 0)
			const bm = ld64(s338 + 8)
			const bn = bm + (ld64(s348) & -8)
			const bo = bn + ld64(s358)
			const bp = ld64(s348 + 8)
			r0 = bp + ld64(s368)
			const bq = ld64(s358 + 8)
			const br = r0 + bq + ((bm > bn) + (bn > bo))
			const bs = ld64(s368 + 8) + (bp > r0) + (r0 > r0 + bq) + (r0 + bq > br)
			if (bs >= 0x100000000) {
				st32(s4, 8)
				fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s4, 0x100159cf0, 0x100159d10)
			}
			j = (bs << 0x20) | br >> 0x20
			h = (br << 0x20) | bo >> 0x20
		}
		if ((b & 0x400) != 0) {
			__multi3(s378, h, 0, 0x6ccd8bce9ae771b1, 0)
			__multi3(s388, h, 0, 0x10d72a6a4, 0)
			__multi3(s398, j, 0, 0x6ccd8bce9ae771b1, 0)
			__multi3(s3a8, j, 0, 0x10d72a6a4, 0)
			const bt = ld64(s378 + 8)
			const bu = bt + (ld64(s388) & -4)
			const bv = bu + ld64(s398)
			const bw = ld64(s388 + 8)
			r0 = bw + ld64(s3a8)
			const bx = ld64(s398 + 8)
			const by = r0 + bx + ((bt > bu) + (bu > bv))
			const bz = ld64(s3a8 + 8) + (bw > r0) + (r0 > r0 + bx) + (r0 + bx > by)
			if (bz >= 0x100000000) {
				st32(s4, 8)
				fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s4, 0x100159cf0, 0x100159d10)
			}
			j = (bz << 0x20) | by >> 0x20
			h = (by << 0x20) | bv >> 0x20
		}
		if ((b & 0x800) != 0) {
			__multi3(s3b8, h, 0, 0x63928596dc757faa, 0)
			__multi3(s3c8, h, 0, 0x11b9a258e, 0)
			__multi3(s3d8, j, 0, 0x63928596dc757faa, 0)
			__multi3(s3e8, j, 0, 0x11b9a258e, 0)
			const ca = ld64(s3b8 + 8)
			const cb = ca + (ld64(s3c8) & -2)
			const cc = cb + (ld64(s3d8) & -2)
			const cd = ld64(s3c8 + 8)
			r0 = cd + ld64(s3e8)
			const ce = ld64(s3d8 + 8)
			const cf = r0 + ce + ((ca > cb) + (cb > cc))
			const cg = ld64(s3e8 + 8) + (cd > r0) + (r0 > r0 + ce) + (r0 + ce > cf)
			if (cg >= 0x100000000) {
				st32(s4, 8)
				fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s4, 0x100159cf0, 0x100159d10)
			}
			j = (cg << 0x20) | cf >> 0x20
			h = (cf << 0x20) | cc >> 0x20
		}
		if ((b & 0x1000) != 0) {
			__multi3(s3f8, h, 0, 0x4f8379f3cd17be5, 0)
			__multi3(s408, h, 0, 0x13a2e2bda, 0)
			__multi3(s418, j, 0, 0x4f8379f3cd17be5, 0)
			__multi3(s428, j, 0, 0x13a2e2bda, 0)
			const ch = ld64(s3f8 + 8)
			const ci = ch + (ld64(s408) & -2)
			const cj = ci + ld64(s418)
			const ck = ld64(s408 + 8)
			r0 = ck + ld64(s428)
			const cl = ld64(s418 + 8)
			const cm = r0 + cl + ((ch > ci) + (ci > cj))
			const cn = ld64(s428 + 8) + (ck > r0) + (r0 > r0 + cl) + (r0 + cl > cm)
			if (cn >= 0x100000000) {
				st32(s4, 8)
				fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s4, 0x100159cf0, 0x100159d10)
			}
			j = (cn << 0x20) | cm >> 0x20
			h = (cm << 0x20) | cj >> 0x20
		}
		if ((b & 0x2000) != 0) {
			__multi3(s438, h, 0, 0x9e0da8fe77f2ab42, 0)
			__multi3(s448, h, 0, 0x181954be6, 0)
			__multi3(s458, j, 0, 0x9e0da8fe77f2ab42, 0)
			__multi3(s468, j, 0, 0x181954be6, 0)
			const co = ld64(s438 + 8)
			const cp = co + (ld64(s448) & -2)
			const cq = cp + (ld64(s458) & -2)
			const cr = ld64(s448 + 8)
			r0 = cr + ld64(s468)
			const cs = ld64(s458 + 8)
			const ct = r0 + cs + ((co > cp) + (cp > cq))
			const cu = ld64(s468 + 8) + (cr > r0) + (r0 > r0 + cs) + (r0 + cs > ct)
			if (cu >= 0x100000000) {
				st32(s4, 8)
				fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s4, 0x100159cf0, 0x100159d10)
			}
			j = (cu << 0x20) | ct >> 0x20
			h = (ct << 0x20) | cq >> 0x20
		}
		if ((b & 0x4000) != 0) {
			__multi3(s478, h, 0, 0x185a029080252877, 0)
			__multi3(s488, h, 0, 0x244c2655d, 0)
			__multi3(s498, j, 0, 0x185a029080252877, 0)
			__multi3(s4a8, j, 0, 0x244c2655d, 0)
			const cw = ld64(s488)
			const cv = ld64(s478 + 8)
			const cx = cv + cw + ld64(s498)
			const cy = ld64(s488 + 8)
			r0 = cy + ld64(s4a8)
			const cz = ld64(s498 + 8)
			const da = r0 + cz + ((cv > cv + cw) + (cv + cw > cx))
			const db = ld64(s4a8 + 8) + (cy > r0) + (r0 > r0 + cz) + (r0 + cz > da)
			if (db >= 0x100000000) {
				st32(s4, 8)
				fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s4, 0x100159cf0, 0x100159d10)
			}
			j = (db << 0x20) | da >> 0x20
			h = (da << 0x20) | cx >> 0x20
		}
		if ((b & 0x8000) != 0) {
			__multi3(s4b8, h, 0, 0x9f935b1c616779e8, 0)
			__multi3(s4c8, h, 0, 0x525816eeb, 0)
			__multi3(s4d8, j, 0, 0x9f935b1c616779e8, 0)
			__multi3(s4e8, j, 0, 0x525816eeb, 0)
			const dd = ld64(s4c8)
			const dc = ld64(s4b8 + 8)
			const de = dc + dd + (ld64(s4d8) & -8)
			const df = ld64(s4c8 + 8)
			r0 = df + ld64(s4e8)
			const dg = ld64(s4d8 + 8)
			const dh = r0 + dg + ((dc > dc + dd) + (dc + dd > de))
			const di = ld64(s4e8 + 8) + (df > r0) + (r0 > r0 + dg) + (r0 + dg > dh)
			if (di >= 0x100000000) {
				st32(s4, 8)
				fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s4, 0x100159cf0, 0x100159d10)
			}
			j = (di << 0x20) | dh >> 0x20
			h = (dh << 0x20) | de >> 0x20
		}
		if ((b & 0x10000) != 0) {
			__multi3(s4f8, h, 0, 0x51684ff4d31ae065, 0)
			__multi3(s508, h, 0, 0x1a7c8d00b5, 0)
			__multi3(s518, j, 0, 0x51684ff4d31ae065, 0)
			__multi3(s528, j, 0, 0x1a7c8d00b5, 0)
			const dk = ld64(s508)
			const dj = ld64(s4f8 + 8)
			const dl = dj + dk + ld64(s518)
			const dm = ld64(s508 + 8)
			r0 = dm + ld64(s528)
			const dn = ld64(s518 + 8)
			const dp = r0 + dn + ((dj > dj + dk) + (dj + dk > dl))
			const dq = ld64(s528 + 8) + (dm > r0) + (r0 > r0 + dn) + (r0 + dn > dp)
			if (dq >= 0x100000000) {
				st32(s4, 8)
				fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s4, 0x100159cf0, 0x100159d10)
			}
			j = (dq << 0x20) | dp >> 0x20
			h = (dp << 0x20) | dl >> 0x20
		}
		if ((b & 0x20000) != 0) {
			__multi3(s538, h, 0, 0xf7c97884590c66cd, 0)
			__multi3(s548, h, 0, 0x2bd893d0b2d, 0)
			__multi3(s558, j, 0, 0xf7c97884590c66cd, 0)
			__multi3(s568, j, 0, 0x2bd893d0b2d, 0)
			const ds = ld64(s548)
			const dr = ld64(s538 + 8)
			const dt = dr + ds + ld64(s558)
			const du = ld64(s548 + 8)
			r0 = du + ld64(s568)
			const dv = ld64(s558 + 8)
			const dw = r0 + dv + ((dr > dr + ds) + (dr + ds > dt))
			const dx = ld64(s568 + 8) + (du > r0) + (r0 > r0 + dv) + (r0 + dv > dw)
			if (dx >= 0x100000000) {
				st32(s4, 8)
				fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s4, 0x100159cf0, 0x100159d10)
			}
			j = (dx << 0x20) | dw >> 0x20
			h = (dw << 0x20) | dt >> 0x20
		}
		if ((b & 0x40000) == 0) {
			st64(a, (h >> 0x20 | (j << 0x20)), (j >> 0x20))
			return r0
		}
		__multi3(s578, h, 0, 0x8cf8b95d2152dccf, 0)
		__multi3(s588, h, 0, 0x78278e1e19e44, 0)
		__multi3(s598, j, 0, 0x8cf8b95d2152dccf, 0)
		__multi3(s5a8, j, 0, 0x78278e1e19e44, 0)
		const dy = ld64(s578 + 8)
		const dz = dy + (ld64(s588) & -4)
		const ea = ld64(s588 + 8)
		const eb = ld64(s5a8)
		const ed = (dy > dz) + (dz > dz + ld64(s598))
		r0 = ea + eb + ld64(s598 + 8)
		const ec = r0
		const ee = ld64(s5a8 + 8) + (ea > ea + eb) + (ea + eb > r0) + (r0 > r0 + ed)
		if (0x100000000 > ee) {
			j = (ee << 0x20) | ec + ed >> 0x20
			st64(a, (((ec + ed) as u32) | (j << 0x20)), (j >> 0x20))
			return r0
		}
		st32(s4, 8)
		fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s4, 0x100159cf0, 0x100159d10)
	}
	let g = (-b & 1) == 0
	let f = -(-b & 1) & 0xfffcb933bd6fad37
	__multi3(s18, f, g, 0xfff97272373d4132, 0)
	if ((-b & 2) != 0) {
		f = ld64(s18 + 8)
	}
	g = (-b & 2) != 0 ? 0 : g
	__multi3(s28, f, g, 0xfff2e50f5f656932, 0)
	if ((-b & 4) != 0) {
		f = ld64(s28 + 8)
	}
	g = (-b & 4) != 0 ? 0 : g
	__multi3(s38, f, g, 0xffe5caca7e10e4e6, 0)
	if ((-b & 8) != 0) {
		f = ld64(s38 + 8)
	}
	g = (-b & 8) != 0 ? 0 : g
	__multi3(s48, f, g, 0xffcb9843d60f6159, 0)
	if ((-b & 0x10) != 0) {
		f = ld64(s48 + 8)
	}
	g = (-b & 0x10) != 0 ? 0 : g
	__multi3(s58, f, g, 0xff973b41fa98c081, 0)
	if ((-b & 0x20) != 0) {
		f = ld64(s58 + 8)
	}
	g = (-b & 0x20) != 0 ? 0 : g
	__multi3(s68, f, g, 0xff2ea16466c96a38, 0)
	if ((-b & 0x40) != 0) {
		f = ld64(s68 + 8)
	}
	g = (-b & 0x40) != 0 ? 0 : g
	__multi3(s78, f, g, 0xfe5dee046a99a2a8, 0)
	if ((-b & 0x80) != 0) {
		f = ld64(s78 + 8)
	}
	g = (-b & 0x80) != 0 ? 0 : g
	__multi3(s88, f, g, 0xfcbe86c7900a88ae, 0)
	if ((-b & 0x100) != 0) {
		f = ld64(s88 + 8)
	}
	g = (-b & 0x100) != 0 ? 0 : g
	__multi3(s98, f, g, 0xf987a7253ac41317, 0)
	if ((-b & 0x200) != 0) {
		f = ld64(s98 + 8)
	}
	g = (-b & 0x200) != 0 ? 0 : g
	__multi3(sa8, f, g, 0xf3392b0822b70005, 0)
	if ((-b & 0x400) != 0) {
		f = ld64(sa8 + 8)
	}
	g = (-b & 0x400) != 0 ? 0 : g
	__multi3(sb8, f, g, 0xe7159475a2c29b74, 0)
	if ((-b & 0x800) != 0) {
		f = ld64(sb8 + 8)
	}
	g = (-b & 0x800) != 0 ? 0 : g
	__multi3(sc8, f, g, 0xd097f3bdfd2022b8, 0)
	if ((-b & 0x1000) != 0) {
		f = ld64(sc8 + 8)
	}
	g = (-b & 0x1000) != 0 ? 0 : g
	__multi3(sd8, f, g, 0xa9f746462d870fdf, 0)
	if ((-b & 0x2000) != 0) {
		f = ld64(sd8 + 8)
	}
	g = (-b & 0x2000) != 0 ? 0 : g
	__multi3(se8, f, g, 0x70d869a156d2a1b8, 0)
	if ((-b & 0x4000) != 0) {
		f = ld64(se8 + 8)
	}
	g = (-b & 0x4000) != 0 ? 0 : g
	__multi3(sf8, f, g, 0x31be135f97d08fd9, 0)
	if ((-b & 0x8000) != 0) {
		f = ld64(sf8 + 8)
	}
	g = (-b & 0x8000) != 0 ? 0 : g
	__multi3(s108, f, g, 0x9aa508b5b7a84e1, 0)
	if ((-b & 0x10000) != 0) {
		f = ld64(s108 + 8)
	}
	g = (-b & 0x10000) != 0 ? 0 : g
	__multi3(s118, f, g, 0x5d6af8dedb8119, 0)
	if ((-b & 0x20000) != 0) {
		f = ld64(s118 + 8)
	}
	g = (-b & 0x20000) != 0 ? 0 : g
	r0 = __multi3(s128, f, g, 0x2216e584f5fa, 0)
	g = (-b & 0x40000) != 0 ? 0 : g
	if ((-b & 0x40000) == 0) {
		st64(a, f, g)
		return r0
	}
	st64(a, ld64(s128 + 8))
	st64(a + 8, g)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
export function fn_53940(a: u64): u64 {
	const s1 = fp - 0x1, s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s210 = fp - 0x210, s218 = fp - 0x218, s220 = fp - 0x220, s228 = fp - 0x228, s230 = fp - 0x230, s238 = fp - 0x238, s240 = fp - 0x240, s248 = fp - 0x248, s250 = fp - 0x250, s258 = fp - 0x258, s260 = fp - 0x260
	let k, l: u64
	const g = ld64(a)
	const f = ld64(a + 8)
	const h = f != 0 ? clz(f) : clz(g) + 0x40
	const i = (0x7f - h << 0x20) + 0xffffffc000000000
	st64(s210, i)
	const j = (0x7f - h << 0x20) > i
	st64(s208, j, f)
	st64(s260, g)
	if (0x7f - h > 0x3f) {
		__lshrti3(s28, g, f, 0x40 - h & 0x7f, j)
		l = ld64(s28 + 8)
		k = ld64(s28)
	} else {
		__ashlti3(s18, g, f, h & 0x7f ^ 0x40, j)
		l = ld64(s18 + 8)
		k = ld64(s18)
	}
	const n = __multi3(s38, k, l, k, l)
	const m = ld64(s38 + 8)
	st64(s218, m)
	__lshrti3(s48, ld64(s38), m, (m >> 0x3f) + 0x3f, n)
	const o = ld64(s48)
	const p = ld64(s48 + 8)
	const r = __multi3(s58, o, p, o, p)
	const q = ld64(s58 + 8)
	st64(s220, q)
	__lshrti3(s68, ld64(s58), q, (q >> 0x3f) + 0x3f, r)
	const s = ld64(s68)
	const t = ld64(s68 + 8)
	const v = __multi3(s78, s, t, s, t)
	const u = ld64(s78 + 8)
	st64(s228, u)
	__lshrti3(s88, ld64(s78), u, (u >> 0x3f) + 0x3f, v)
	const w = ld64(s88)
	const x = ld64(s88 + 8)
	const z = __multi3(s98, w, x, w, x)
	const y = ld64(s98 + 8)
	st64(s230, y)
	__lshrti3(sa8, ld64(s98), y, (y >> 0x3f) + 0x3f, z)
	const aa = ld64(sa8)
	const ab = ld64(sa8 + 8)
	const ad = __multi3(sb8, aa, ab, aa, ab)
	const ac = ld64(sb8 + 8)
	st64(s238, ac)
	__lshrti3(sc8, ld64(sb8), ac, (ac >> 0x3f) + 0x3f, ad)
	const ae = ld64(sc8)
	const af = ld64(sc8 + 8)
	const ah = __multi3(sd8, ae, af, ae, af)
	const ag = ld64(sd8 + 8)
	st64(s240, ag)
	__lshrti3(se8, ld64(sd8), ag, (ag >> 0x3f) + 0x3f, ah)
	const ai = ld64(se8)
	const aj = ld64(se8 + 8)
	const al = __multi3(sf8, ai, aj, ai, aj)
	const ak = ld64(sf8 + 8)
	st64(s248, ak)
	__lshrti3(s108, ld64(sf8), ak, (ak >> 0x3f) + 0x3f, al)
	const am = ld64(s108)
	const an = ld64(s108 + 8)
	const ap = __multi3(s118, am, an, am, an)
	const ao = ld64(s118 + 8)
	st64(s250, ao)
	__lshrti3(s128, ld64(s118), ao, (ao >> 0x3f) + 0x3f, ap)
	const aq = ld64(s128)
	const ar = ld64(s128 + 8)
	const au = __multi3(s138, aq, ar, aq, ar)
	const at = ld64(s138 + 8)
	st64(s258, at)
	__lshrti3(s148, ld64(s138), at, (at >> 0x3f) + 0x3f, au)
	const av = ld64(s148)
	const aw = ld64(s148 + 8)
	const ay = __multi3(s158, av, aw, av, aw)
	const ax = ld64(s158 + 8)
	__lshrti3(s168, ld64(s158), ax, (ax >> 0x3f) + 0x3f, ay)
	const az = ld64(s168)
	const ba = ld64(s168 + 8)
	const bc = __multi3(s178, az, ba, az, ba)
	const bb = ld64(s178 + 8)
	__lshrti3(s188, ld64(s178), bb, (bb >> 0x3f) + 0x3f, bc)
	const bd = ld64(s188)
	const be = ld64(s188 + 8)
	const bg = __multi3(s198, bd, be, bd, be)
	const bf = ld64(s198 + 8)
	__lshrti3(s1a8, ld64(s198), bf, (bf >> 0x3f) + 0x3f, bg)
	const bh = ld64(s1a8)
	const bi = ld64(s1a8 + 8)
	const bk = __multi3(s1b8, bh, bi, bh, bi)
	const bj = ld64(s1b8 + 8)
	__lshrti3(s1c8, ld64(s1b8), bj, (bj >> 0x3f) + 0x3f, bk)
	const bl = ld64(s1c8)
	const bm = ld64(s1c8 + 8)
	__multi3(s1d8, bl, bm, bl, bm)
	const bp = ld64(s258) >> 8 & 0x80000000000000
	const bn = ld64(s250) >> 7 & 0x100000000000000
	const bo = bn + (ld64(s248) >> 6 & 0x200000000000000 | (ld64(s240) >> 5 & 0x400000000000000 | (ld64(s238) >> 4 & 0x800000000000000 | (ld64(s230) >> 3 & 0x1000000000000000 | (ld64(s228) >> 2 & 0x2000000000000000 | (ld64(s220) >> 1 & 0x4000000000000000 | ld64(s218) & 0x8000000000000000))))))
	const bq = ax >> 9 & 0x40000000000000
	const br = bq + (bp + bo)
	const bs = bb >> 0xa & 0x20000000000000
	const bt = bf >> 0xb & 0x10000000000000
	const bu = bt + (bs + br)
	const bv = bj >> 0xc & 0x8000000000000
	const ch = ld64(s208 + 8)
	const bw = ld64(s1d8 + 8) >> 0xd & 0x4000000000000
	const bx = bw + (bv + bu)
	const by = (bn > bo) + (bp > bp + bo) + (bq > br) + (bs > bs + br) + (bt > bu) + (bv > bv + bu) + (bw > bx)
	const bz = ld64(s210)
	const ca = bz + (bx >> 0x20 | (by << 0x20))
	const cf = __multi3(s1e8, ca, ld64(s208) - 1 + (by >> 0x20) + (bz > ca), 0x3627a301d710, 0)
	const cb = ld64(s1e8)
	const cc = ld64(s1e8 + 8)
	const cd = cc + (cb >= 0x28f5c28f5c28f5c)
	if ((sar(cd - 1, 0x3f) + (cd - 1 > cd - 0x80000001) != 0 ? 0 : cd - 0x80000001 > 0xfffffffeffffffff) != 0) {
		const ce = cc + (cb >= 0x24d217cfadfc1ac7)
		if ((sar(ce, 0x3f) + (ce >= 0x80000000) != 0 ? 0 : ce - 0x80000000 > 0xfffffffeffffffff) != 0) {
			if (((cd - 1) as u32) == (ce as u32)) {
				return cd - 1
			}
			fn_501e0(s1f8, ce, cf)
			const ci = ld64(s1f8) > ld64(s260)
			const cg = ld64(s1f8 + 8)
			return (cg != ch ? cg > ch : ci) != 0 ? cd - 1 : ce
		}
		fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s1, 0x100159c60, 0x100159cc0)
	}
	fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s1, 0x100159c60, 0x100159cd8)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), d (value), c (value)
export function fn_54ae0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s58 = fp - 0x58, s60 = fp - 0x60, s78 = fp - 0x78, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s100 = fp - 0x100
	let al: u64
	const f = ld64(e - 0x1000)
	const h = c != f ? c > f : b > d
	const g = c != f ? f > c : d > b
	const i = g != 0 ? b : d
	b = h != 0 ? b : d
	const ao = b
	const j = b - i
	let an = e
	const k = ld64(e - 0xff8)
	__multi3(s90, j, 0, k, 0)
	const m = g != 0 ? c : f
	const l = h != 0 ? c : f
	const n = l - m - (i > b)
	__multi3(sb0, n, 0, k, 0)
	const o = ld64(e - 0xff0)
	__multi3(sa0, j, 0, o, 0)
	__multi3(sc0, n, 0, o, 0)
	const p = ld64(s90 + 8)
	const q = ld64(sb0)
	let r = p + q + ld64(sa0)
	const v = p + q > r
	const u = p > p + q
	const t = ld64(sc0)
	const s = ld64(sb0 + 8)
	const w = s + t + ld64(sa0 + 8)
	if (ld64(sc0 + 8) + (s > s + t) + (s + t > w) + (w > w + (u + v)) == 0) {
		an = ld64(an - 0xfe8)
		const am = ld64(s90)
		__multi3(sd0, i, 0, ao, 0)
		__multi3(sf0, m, 0, ao, 0)
		__multi3(se0, i, 0, l, 0)
		__multi3(s100, m, 0, l, 0)
		const x = ld64(sd0 + 8)
		const y = ld64(sf0)
		const aa = x > x + y
		const z = x + y + ld64(se0)
		const ab = x + y > z
		const ad = ld64(s100)
		const ac = ld64(sf0 + 8)
		const ae = ac + ad + ld64(se0 + 8)
		st64(s78, am, r, w + (u + v))
		st64(s60, ld64(sd0))
		st64(s58, z, ae + (aa + ab))
		st64(s58 + 0x10, ld64(s100 + 8) + (ac > ac + ad) + (ac + ad > ae) + (ae > ae + (aa + ab)))
		st64(s80, 0)
		r = fn_57158(s40, s80, s60, an)
		const af = ld64(s40 + 0x18)
		const ag = ld64(s40 + 0x10)
		const ah = ld64(s40 + 8)
		let ai = ld64(s40)
		if (an != 0 && !keyeq(s20, "11111111111111111111111111111111")) {
			const aj = ai == -1
			const ak = aj > aj + ah
			r = ak > ak + ag
			al = a
			if (ak + ag != 0) {
				st64(al, 0x800000001)
				return r
			}
			r = -r
			if (af != r) {
				st64(al, 0x800000001)
				return r
			}
			ai = ai + 1
			if (aj + ah == 0) {
				st64(al + 8, ai)
				st32(al, 0)
				return r
			}
			st64(al, 0x1100000001)
			return r
		}
		al = a
		if ((af | ag) != 0) {
			st64(al, 0x800000001)
			return r
		}
		if (ah == 0) {
			st64(al + 8, ai)
			st32(al, 0)
			return r
		}
		st64(al, 0x1100000001)
		return r
	}
	st64(a, 0x2100000002)
	return r
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), b (value), p5 (value), p6 (value), p7 (value)
export function fn_55308(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64) {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s80 = fp - 0x80, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s100 = fp - 0x100
	let y, aa, af: u64
	const f = p6
	if (f != 0) {
		const ap = p5
		const an = p7
		__multi3(sb0, b, 0, f, 0)
		__multi3(sc0, c, 0, f, 0)
		__multi3(sd0, d, 0, b, 0)
		__multi3(se0, d, 0, c, 0)
		__multi3(sf0, ap, 0, b, 0)
		__multi3(s100, ap, 0, c, 0)
		const h = ld64(s100)
		const g = ld64(se0 + 8)
		const i = g + h + ld64(sf0 + 8)
		const j = ld64(sd0 + 8)
		const k = ld64(se0)
		const l = j + k + ld64(sf0)
		const m = i + ((j > j + k) + (j + k > l))
		const n = ld64(sb0 + 8)
		const o = ld64(sc0)
		const p = n > n + o
		const q = ld64(sc0 + 8)
		const ao = p > p + q
		if (ld64(s100 + 8) + (g > g + h) + (g + h > i) + (i > m) == 0) {
			const r = ld64(sd0)
			let s = ld64(sb0)
			st64(sa0, 0, r, l, m, 0, d, ap, 0)
			if (an != 0) {
				y = n + o + d
				const z = n + o > y
				aa = z + ap + (p + q)
				af = (z > z + ap) + ao + (z + ap > aa)
			} else {
				st64(s40, s, n + o, p + q)
				let v = 0x18
				st64(s40 + 0x18, 0)
				let t = 0x18
				while (true) {
					t = t - 8
					if (t == -0x10) {
						st32(a + 4, 6)
						st32(a, 1)
						return
					}
					const x = ld64(s40 + v)
					const w = ld64(s80 + v)
					const u = x > w ? 0xffffffffffffffff : w != x
					v = t
					if (u != 0) {
						if ((u as u8) == 1) {
							const ab = d - (n + o)
							const ac = s != 0
							const ae = n + o > d | ac > ab
							const ad = ap - (p + q)
							aa = ad - ae
							y = ab - ac
							s = -s
							af = -(p + q > ap | ae > ad)
							break
						}
						st32(a + 4, 6)
						st32(a, 1)
						return
					}
				}
			}
			st64(s60, s, y, aa, af)
			fn_57158(s40, sa0, s60, 1)
			let am = ld64(s40 + 0x18)
			let ak = ld64(s40 + 0x10)
			let ai = ld64(s40 + 8)
			let ag = ld64(s40)
			if (!keyeq(s20, "11111111111111111111111111111111")) {
				ag = ag + 1
				const ah = ag == 0
				const aj = ah + ai
				const al = (ah > aj) + ak
				am = am + ((ah > aj) > al)
				ai = aj
				ak = al
			}
			if ((am | ak) != 0) {
				st32(a + 4, 8)
				st32(a, 1)
			} else if ((ai != 0 ? 0 : fn_13b50 > ag) != 0) {
				st32(a + 4, 0x12)
				st32(a, 1)
			} else if ((ai != 0xfffec4b1 ? ai > 0xfffec4b1 : ag > 0x35bb7f32a81b33af) != 0) {
				st32(a + 4, 0x11)
				st32(a, 1)
			} else {
				st64(a + 8, ag, ai)
				st32(a, 0)
			}
		} else {
			st64(a, 0x2100000001)
		}
	} else {
		st64(a + 8, b, c)
		st32(a, 0)
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_56670(a: u64, b: u64, c: u64) {
	const s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0
	let o, p, ai, aj: u64
	let l = 4
	let ak = 0
	let m = 1
	st64(s20, 0, 0, 0, 0)
	const f = ld64(b + 0x18)
	let g = 1
	let ao = 1
	let an = 1
	let am = 0
	let al = 0
	let i = 4
	if (f == 0) {
		i = 3
		ao = 1
		an = 1
		am = 0
		al = 0
		if (ld64(b + 0x10) == 0) {
			i = 2
			an = 0
			g = 1
			ao = 1
			ak = 1
			am = 0
			al = 0
			if (ld64(b + 8) == 0) {
				ao = 0
				g = 1
				an = 0
				ak = 1
				am = 1
				al = 0
				i = 1
				if (ld64(b) == 0) {
					ak = 1
					g = 0
					ao = 0
					an = 0
					am = 1
					al = 1
					i = 0
				}
			}
		}
	}
	const h = ld64(c + 0x18)
	let n = 1
	if (h == 0) {
		l = 3
		if (ld64(c + 0x10) == 0) {
			l = 2
			n = 0
			if (ld64(c + 8) == 0) {
				l = 1
				m = 0
				if (ld64(c) == 0) {
					st64(a + 0x18, ld64(s20 + 0x18))
					st64(a + 0x10, ld64(s20 + 0x10))
					st64(a + 8, ld64(s20 + 8))
					st64(a, ld64(s20))
					return
				}
			}
		}
	}
	if (g == 0) {
		let k = s20 + (i << 3)
		let j = 0
		while (true) {
			if (4 > i + j) {
				st64(k, 0)
			}
			j = j + 1
			k = k + 8
			if (j >= l) {
				st64(a + 0x18, ld64(s20 + 0x18))
				st64(a + 0x10, ld64(s20 + 0x10))
				st64(a + 8, ld64(s20 + 8))
				st64(a, ld64(s20))
				return
			}
		}
	}
	B20: {
		B19: {
			aj = m
			ai = n
			o = ld64(b)
			__multi3(s30, ld64(c), 0, o, 0)
			st64(s20, ld64(s30))
			p = ld64(s30 + 8)
			if (ao != 0) {
				__multi3(s40, ld64(c), 0, ld64(b + 8), 0)
				const q = ld64(s40)
				st64(s20 + 8, p + q)
				p = ld64(s40 + 8) + (p > p + q)
				if (an != 0) {
					__multi3(s50, ld64(c), 0, ld64(b + 0x10), 0)
					const r = ld64(s50)
					st64(s20 + 0x10, p + r)
					p = ld64(s50 + 8) + (p > p + r)
					if (f == 0) {
						break B19
					}
					__multi3(s60, ld64(c), undef, f)
					st64(s20 + 0x18, p + ld64(s60))
					break B20
				}
			}
			if (f != 0) {
				break B20
			}
		}
		st64(s20 + (i << 3), p)
	}
	if (aj == 0) {
		st64(a + 0x18, ld64(s20 + 0x18))
		st64(a + 0x10, ld64(s20 + 0x10))
		st64(a + 8, ld64(s20 + 8))
		st64(a, ld64(s20))
	} else {
		__multi3(s70, ld64(c + 8), 0, o, 0)
		const t = ld64(s20 + 8)
		const s = ld64(s70)
		st64(s20 + 8, s + t)
		let u = ld64(s70 + 8) + (s > s + t)
		if (ao != 0) {
			__multi3(s80, ld64(c + 8), 0, ld64(b + 8), 0)
			const v = ld64(s20 + 0x10)
			const w = u + v + ld64(s80)
			st64(s20 + 0x10, w)
			u = (u > u + v) + ld64(s80 + 8) + (u + v > w)
			if (an != 0) {
				__multi3(s90, ld64(c + 8), 0, ld64(b + 0x10), 0)
				const x = ld64(s20 + 0x18)
				const y = u + x + ld64(s90)
				st64(s20 + 0x18, y)
				u = (u > u + x) + ld64(s90 + 8) + (u + x > y)
			}
		}
		if (ak != 0) {
			st64((i << 3) + s20 + 8, u)
		}
		if (ai == 0) {
			st64(a + 0x18, ld64(s20 + 0x18))
			st64(a + 0x10, ld64(s20 + 0x10))
			st64(a + 8, ld64(s20 + 8))
			st64(a, ld64(s20))
		} else {
			__multi3(sa0, ld64(c + 0x10), 0, o, 0)
			const aa = ld64(s20 + 0x10)
			const z = ld64(sa0)
			st64(s20 + 0x10, z + aa)
			let ab = ld64(sa0 + 8) + (z > z + aa)
			if (ao != 0) {
				__multi3(sb0, ld64(c + 0x10), 0, ld64(b + 8), 0)
				const ac = ld64(s20 + 0x18)
				const ad = ab + ac + ld64(sb0)
				st64(s20 + 0x18, ad)
				ab = (ab > ab + ac) + ld64(sb0 + 8) + (ab + ac > ad)
			}
			if (am != 0) {
				st64((i << 3) + s20 + 0x10, ab)
			}
			if (h == 0) {
				st64(a + 0x18, ld64(s20 + 0x18))
				st64(a + 0x10, ld64(s20 + 0x10))
				st64(a + 8, ld64(s20 + 8))
				st64(a, ld64(s20))
			} else {
				__multi3(sc0, h, 0, o, 0)
				const af = ld64(s20 + 0x18)
				const ae = ld64(sc0)
				const ah = ae > ae + af
				const ag = ld64(sc0 + 8)
				st64(s20 + 0x18, ae + af)
				if (al == 0) {
					st64(a + 0x18, ld64(s20 + 0x18))
					st64(a + 0x10, ld64(s20 + 0x10))
					st64(a + 8, ld64(s20 + 8))
					st64(a, ld64(s20))
				} else {
					st64((i << 3) + s20 + 0x18, ag + ah)
					st64(a + 0x18, ld64(s20 + 0x18))
					st64(a + 0x10, ld64(s20 + 0x10))
					st64(a + 8, ld64(s20 + 8))
					st64(a, ld64(s20))
				}
			}
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), c (points to it)
export function fn_57158(a: u64, b: u64, c: u64, d: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s80 = fp - 0x80, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sc8 = fp - 0xc8, sd0 = fp - 0xd0, se8 = fp - 0xe8, sf0 = fp - 0xf0, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1d0 = fp - 0x1d0, s220 = fp - 0x220, s228 = fp - 0x228, s230 = fp - 0x230
	let l, ba, cy: u64
	st64(s220 + 0x20, d)
	st64(s220 + 0x38, a)
	copyr(se8, b, 0x18)
	let o = 4
	let k = 0
	let f = ld64(b + 0x18)
	st64(sd0, f, 0, 0, 0, 0)
	let j = 0
	st64(s1a8 + 8, 4)
	if (f == 0) {
		st64(s1a8 + 8, 3)
		if (ld64(se8 + 0x10) == 0) {
			st64(s1a8 + 8, 2)
			j = 1
			if (ld64(se8 + 8) == 0) {
				const g = ld64(se8)
				st64(s1a8 + 8, 1)
				if (g == 0) {
					st64(s1a8 + 8, 0)
					k = 1
				}
			}
		}
	}
	const h = ld64(c + 0x18)
	let i = h
	let m = 0
	st64(s1d0, 0, 0)
	st64(s220 + 0x28, h)
	if (h == 0) {
		o = 3
		st64(s1d0, 1)
		i = ld64(c + 0x10)
		st64(s1d0 + 8, 0)
		if (i == 0) {
			o = 2
			st64(s1d0 + 8, 1)
			i = ld64(c + 8)
			st64(s1d0, 0)
			if (i == 0) {
				m = 1
				i = ld64(c)
				st64(s1d0, 0, 0)
				o = 1
				if (i == 0) {
					st64(sa0, 0x100159d88, 1, 8, 0, 0)
					// fmt "divide by zero"
					fn_149478(sa0, 0x100159d98, c, j, k)
				}
			}
		}
	}
	if (k == 0) {
		const n = ld64(s1a8 + 8)
		if (n >= o) {
			if (j != 0) {
				const p = ld64(s220 + 0x28)
				if ((f | ld64(se8 + 0x10)) == 0) {
					const q = ld64(c + 0x10)
					if ((p | q) == 0) {
						const s = ld64(c + 8)
						const r = ld64(c)
						if ((r | s) == 0) {
							fn_14e168(0x100159dc8, p | q, c, j, k)
						}
						const u = ld64(se8 + 8)
						const t = ld64(se8)
						m = __udivti3(s188, t, u, r, s, s)
						const w = ld64(s188 + 8)
						const v = ld64(s188)
						if (ld64(s220 + 0x20) != 0) {
							st64(s1a8, v, w)
							m = __multi3(s198, v, w, r, s)
							const x = ld64(s198)
							const y = ld64(s220 + 0x38)
							copy(y, s1a8, 0x10)
							st64(y + 0x20, t - x)
							st64(y + 0x28, u - ld64(s198 + 8) - (x > t))
							st64(y + 0x10, 0, 0)
							st64(y + 0x30, 0, 0)
							return m
						}
						const cz = ld64(s220 + 0x38)
						st64(cz, v, w, 0, 0, 0, 0, 0, 0)
						return m
					}
					st32(sa0, 8)
					fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, sa0, 0x100159cf0, 0x100159de0)
				}
				st32(sa0, 8)
				fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, sa0, 0x100159cf0, 0x100159df8)
			}
			if (m == 0) {
				st64(s230, clz(i))
				const ag = ld64((n << 3) + se8 - 8)
				const ah = ld64(s230)
				st64(sa8, f != 0 ? clz(ag) >= ah ? 0 : ag >> (-ah & 0x3f) : 0)
				let al = ld64(se8 + 0x10)
				let ak = ld64(se8 + 8)
				let aj = ld64(se8)
				let an = f
				const ai = ld64(s230)
				if (ai != 0) {
					st64(s1a8, aj)
					const am = (shl(al, ai & 0x3f)) | ak >> (-ah & 0x3f)
					an = al >> (-ah & 0x3f) | (f << (ai & 0x3f))
					st64(s1a8, ld64(s1a8) << (ai & 0x3f))
					ak = (shl(ak, ai & 0x3f)) | aj >> (-ah & 0x3f)
					aj = ld64(s1a8)
					al = am
				}
				st64(se8, aj, ak, al, an)
				let ar = ld64(c + 0x10)
				let aq = ld64(c + 8)
				let ap = ld64(c)
				const ao = ld64(s220 + 0x28)
				m = ao
				if (ai != 0) {
					st64(s1a8, ap)
					const at = (shl(ar, ai & 0x3f)) | aq >> (-ah & 0x3f)
					m = ar >> (-ah & 0x3f) | (ao << (ai & 0x3f))
					st64(s1a8, ld64(s1a8) << (ai & 0x3f))
					aq = (shl(aq, ai & 0x3f)) | ap >> (-ah & 0x3f)
					ap = ld64(s1a8)
					ar = at
				}
				st64(c + 0x18, m)
				st64(c + 0x10, ar)
				st64(c + 8, aq)
				st64(c, ap)
				const au = ld64(s1a8 + 8) - o
				st64(s1d0 + 0x18, au + 1)
				if (au != -1) {
					st64(s220 + 0x10, s40 + (o - 1 << 3))
					let av = o - 2
					if (av > 3) {
						copyr(s40, c, 0x20)
						ba = ld64(ld64(s220 + 0x10))
						if (ba == 0) {
							fn_14e168(0x100159e10, ba, c, ar, aq)
						}
						if (4 > ld64(s1a8 + 8) - 2) {
							fn_1495b0(av, 4, 0x100159d70, ar, aq)
						}
						fn_1495b0(-1, 4, 0x100159d58, ar, aq)
					}
					st64(s228, s80)
					ar = ld64(s1d0 + 0x18)
					st64(s220, o, c)
					st64(s220 + 0x40, s40 + (av << 3))
					do {
						copyr(s60, se8, 0x20)
						copyr(s40, c, 0x20)
						copyr(s20, sc8, 0x20)
						ba = sa8
						let ay = 3
						ar = ar - 1
						aq = ar + o
						if (aq != 4) {
							if (aq > 3) {
								fn_1495b0(aq, 4, 0x100159d58, ar, aq)
							}
							ba = s60 + (aq << 3)
							ay = aq - 1
							if (ay > 3) {
								fn_1495b0(ay, 4, 0x100159d58, ar, aq)
							}
						}
						st64(s1d0 + 0x10, ar)
						ar = ld64(ld64(s220 + 0x10))
						st64(s1a8, ar)
						if (ar == 0) {
							fn_14e168(0x100159e10, ba, c, ar, aq)
						}
						ar = s60
						const az = aq
						if (aq - 2 > 3) {
							fn_1495b0(-1, 4, 0x100159d58, ar, aq)
						}
						st64(s220 + 0x48, aq)
						const bc = ld64(ba)
						const bb = ld64(ar + (ay << 3))
						__udivti3(sf8, bb, bc, ld64(s1a8), 0, f)
						const bd = ld64(sf8)
						st64(s1d0 + 0x20, bd)
						let be = ld64(sf0)
						__multi3(s108, bd, be, ld64(s1a8), 0)
						const bf = ld64(ld64(s220 + 0x40))
						const bg = ld64(s1d0 + 0x20)
						st64(s1a8 + 8, bf)
						__multi3(s118, bg, be, bf, 0)
						const bh = ld64(s108)
						let bl = bb - bh
						const bm = ld64(s108 + 8)
						const bj = ld64(s60 + (az - 2 << 3))
						let bk = ld64(s118 + 8)
						let bi = ld64(s118)
						if (be != 0 || (bk != bl ? bl >= bk : bj >= bi) == 0) {
							let bt = bc - bm - (bh > bb)
							let bn = ld64(s1d0 + 0x20)
							while (true) {
								ar = bl + ld64(s1a8)
								aq = bl > ar
								be = be - (bn == 0)
								bt = bt + aq
								bn = bn - 1
								if (bt == 0) {
									bk = bk - (ld64(s1a8 + 8) > bi)
									bi = bi - ld64(s1a8 + 8)
									bl = ar
									if (be != 0) {
										continue
									}
									aq = bk != ar ? bk > ar : bi > bj
									bl = ar
									if (aq != 0) {
										continue
									}
								}
								st64(s1d0 + 0x20, bn)
								const dk = ld64(s1d0 + 0x10)
								if (ld64(s1d0 + 0x18) > 4) {
									fn_1495b0(dk, 4, 0x100159d70, ar, aq)
								}
								break
							}
						}
						const bo = ld64(s40)
						const bp = ld64(s1d0 + 0x20)
						st64(s1a8 + 8, bo)
						__multi3(s128, bp, be, bo, 0)
						aq = undef
						const bq = ld64(s1d0 + 0x10)
						ar = s60 + (bq << 3)
						const br = ld64(ar)
						const bs = ld64(s128)
						st64(s1a8, ar)
						st64(ar, br - bs)
						if (bq == 3) {
							fn_1495b0(4, 4, 0x100159d70, ar, aq)
						}
						const bw = ld64(s128 + 8)
						const bu = ld64(s40 + 8)
						const bv = ld64(s1d0 + 0x20)
						st64(s220 + 0x30, bu)
						__multi3(s138, bv, be, bu, 0)
						const bx = ld64(s138)
						const by = bx + (bw - -(bs > br))
						m = s60 + (ld64(s1d0 + 0x18) << 3)
						const bz = ld64(m)
						ar = bz - by
						st64(m, ar)
						let cb = ld64(s138 + 8) + ((bx > by) + (by > bz))
						let aw = ld64(s1d0 + 0x20)
						if (ld64(s1d0 + 8) == 0) {
							if (ld64(s1d0 + 0x18) > 2) {
								fn_1495b0(4, 4, 0x100159d70, ar, 0)
							}
							st64(s220 + 0x18, m)
							aw = ld64(s1d0 + 0x20)
							__multi3(s148, aw, be, ld64(s40 + 0x10), 0)
							const ca = ld64(s148)
							const cc = ca + cb
							const cd = (ld64(s1d0 + 0x18) << 3) + s60
							const ce = ld64(cd + 8)
							m = ld64(s220 + 0x18)
							ar = ce - cc
							st64(cd + 8, ar)
							cb = ld64(s148 + 8) + ((ca > cc) + (cc > ce))
							if (ld64(s1d0) == 0) {
								if (ld64(s1d0 + 0x10) != 0) {
									fn_1495b0(4, 4, 0x100159d70, ar, 0)
								}
								aw = ld64(s1d0 + 0x20)
								__multi3(s158, aw, be, ld64(s40 + 0x18), 0)
								const cg = (ld64(s1d0 + 0x18) << 3) + s60
								const cf = ld64(s158)
								const ci = cf + cb
								const ch = ld64(cg + 0x10)
								st64(cg + 0x10, ch - ci)
								ar = ci > ch
								m = ld64(s220 + 0x18)
								cb = ld64(s158 + 8) + ((cf > ci) + ar)
								if (ld64(s220 + 0x28) == 0) {
									fn_1495b0(4, 4, 0x100159d70, ar, 0)
								}
							}
						}
						let cj = sa8
						f = ld64(s220 + 0x48)
						if (f != 4) {
							if (f > 3) {
								fn_1495b0(f, 4, 0x100159d70, ar, 0)
							}
							cj = s60 + (f << 3)
						}
						const ck = ld64(cj)
						st64(cj, ck - cb)
						ar = ld64(s1d0 + 0x10)
						c = ld64(s220 + 8)
						o = ld64(s220)
						if (ck >= cb) {
							if (ld64(s1d0 + 0x18) > 4) {
								fn_1495b0(ar, 4, 0x100159d40, ar, 0)
							}
						} else {
							av = ar
							if (ld64(s1d0 + 0x18) > 4) {
								fn_1495b0(av, 4, 0x100159d70, ar, 0)
							}
							const cl = ld64(s1a8)
							const cn = ld64(cl)
							const cm = ld64(s1a8 + 8)
							st64(cl, cm + cn)
							ar = cm > cm + cn
							const co = m
							m = ar + ld64(m)
							aq = m + ld64(s220 + 0x30)
							st64(co, aq)
							let cq = (ar > m) + (m > aq)
							if (ld64(s1d0 + 8) == 0) {
								ar = ld64(s1d0 + 0x18)
								if (ar > 2) {
									fn_1495b0(4, 4, 0x100159d70, ar, aq)
								}
								const cp = (ld64(s1d0 + 0x18) << 3) + s60
								const cr = ld64(cp + 8)
								m = cq + cr + ld64(s40 + 0x10)
								st64(cp + 8, m)
								aq = cq + cr > m
								const cs = (cq > cq + cr) + aq
								cq = cs
								ar = ld64(s1d0)
								if (ar == 0) {
									if (ld64(s1d0 + 0x10) != 0) {
										fn_1495b0(4, 4, 0x100159d70, ar, aq)
									}
									const ct = (ld64(s1d0 + 0x18) << 3) + s60
									aq = cs + ld64(ct + 0x10)
									m = ld64(s40 + 0x18)
									const cu = aq + m
									st64(ct + 0x10, cu)
									cq = (cs > aq) + (aq > cu)
									ar = ld64(s220 + 0x28)
									f = ld64(s220 + 0x48)
									if (ar == 0) {
										fn_1495b0(4, 4, 0x100159d70, ar, aq)
									}
								}
							}
							if (f > 3) {
								fn_1495b0(f, 4, 0x100159d70, ar, aq)
							}
							f = f << 3
							const cv = s60 + f
							st64(cv, ld64(cv) + cq)
							aw = ld64(s1d0 + 0x20) - 1
							ar = ld64(s1d0 + 0x10)
						}
						st64(s20 + (ar << 3), aw)
						copy(sa0, s20, 0x20)
						const ax = ld64(s228)
						st64(ax + 0x18, ld64(s60 + 0x18))
						st64(ax + 0x10, ld64(s60 + 0x10))
						st64(ax + 8, ld64(s60 + 8))
						st64(ax, ld64(s60))
						copyr(sc8, sa0, 0x20)
						copy(se8, ax, 0x20)
						st64(s1d0 + 0x18, ar)
					} while (ar != 0)
				}
				if (ld64(s220 + 0x20) != 0) {
					let dd = ld64(sd0)
					let dc = ld64(se8 + 0x10)
					let de = ld64(se8 + 8)
					let dg = ld64(se8)
					const db = ld64(s230)
					if (db != 0) {
						const di = (shl(dd, -db & 0x3f)) | dc >> (db & 0x3f)
						const df = dc << (-db & 0x3f)
						m = de >> (db & 0x3f)
						const dh = de << (-db & 0x3f)
						dd = dd >> (db & 0x3f)
						dc = di
						de = df | m
						dg = dh | dg >> (db & 0x3f)
					}
					st64(se8, dg, de, dc, dd)
					const dj = ld64(s220 + 0x38)
					st64(dj + 0x18, ld64(sc8 + 0x18))
					st64(dj + 0x10, ld64(sc8 + 0x10))
					st64(dj + 8, ld64(sc8 + 8))
					st64(dj, ld64(sc8))
					copy(dj + 0x20, se8, 0x20)
					return m
				}
				cy = ld64(s220 + 0x38)
				st64(cy + 0x18, ld64(sc8 + 0x18))
				st64(cy + 0x10, ld64(sc8 + 0x10))
				st64(cy + 8, ld64(sc8 + 8))
				st64(cy, ld64(sc8))
				st64(cy + 0x20, 0, 0, 0, 0)
				return m
			}
			const aa = ld64(c)
			if (aa == 0) {
				fn_14e168(0x100159db0, b, c, j, k)
			}
			let ae = 0
			st64(s1a8, sf0)
			let ad = n << 3
			while (true) {
				const ab = ld64(ld64(s1a8) + ad)
				st64(s1a8 + 8, ae)
				__udivti3(s168, ab, ae, aa, 0, aa)
				const af = ld64(s168)
				m = __multi3(s178, af, ld64(s168 + 8), aa, 0)
				st64(sc8 + ad - 8, af)
				const ac = ld64(s178)
				ae = ab - ac
				ad = ad - 8
				if (ad == 0) {
					if (ld64(s220 + 0x20) != 0) {
						const cx = ld64(s178 + 8)
						const cw = ld64(s1a8 + 8)
						cy = ld64(s220 + 0x38)
						st64(cy + 0x18, ld64(sc8 + 0x18))
						st64(cy + 0x10, ld64(sc8 + 0x10))
						st64(cy + 8, ld64(sc8 + 8))
						st64(cy, ld64(sc8))
						st64(cy + 0x20, ae, cw - cx - (ac > ab), 0, 0)
						return m
					}
					const da = ld64(s220 + 0x38)
					l = da + 0x20
					st64(da + 0x18, ld64(sc8 + 0x18))
					st64(da + 0x10, ld64(sc8 + 0x10))
					st64(da + 8, ld64(sc8 + 8))
					st64(da, ld64(sc8))
					st64(l + 0x18, 0)
					st64(l + 0x10, 0)
					st64(l + 8, 0)
					st64(l, 0)
					return m
				}
			}
		}
		if (ld64(s220 + 0x20) != 0) {
			const z = ld64(s220 + 0x38)
			st64(z + 0x38, ld64(b + 0x18))
			st64(z + 0x30, ld64(b + 0x10))
			st64(z + 0x28, ld64(b + 8))
			st64(z + 0x20, ld64(b))
			st64(z, 0, 0, 0, 0)
			return m
		}
	}
	l = ld64(s220 + 0x38)
	st64(l + 0x38, 0)
	st64(l + 0x30, 0)
	st64(l + 0x28, 0)
	st64(l + 0x20, 0)
	st64(l + 0x18, 0)
	st64(l + 0x10, 0)
	st64(l + 8, 0)
	st64(l, 0)
	return m
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), a (points to it), b (value)
export function fn_5bad0(a: u64, b: u64, c: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0
	let s, t, u: u64
	const f = ld64(ld64(b))
	copyr(s60, f, 0x20)
	const g = ld64(c + 0x18)
	if ((memcmp(g, 0x100152180, 0x20) as u32) == 0 && fn_143248(c) != 0) {
		u = memcpy(a, c, 0x30)
		st8(a + 0x30, 0)
		return u
	}
	const h = memcmp(g, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((h as u32) != 0) {
		const r = anchor_error_from(s70, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const q = ld64(s70 + 8)
		const p = ld64(s70)
		copyr(s40, g, 0x20)
		st64(s20, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		u = fn_13b5c0(s80, p, q, s40, r)
		t = ld64(s80 + 8)
		s = ld64(s80)
	} else {
		AccountInfo_try_borrow_data(s40, c, h as u32)
		let m = undef
		let n = undef
		const o = ld64(s40 + 0x10)
		const j = ld64(s40 + 8)
		const i = ld64(s40)
		if (i == 0x800000000000001a /* Ok */) {
			let l = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
			const k = ld64(j + 8)
			if (k >= 8) {
				l = 0xbba /* anchor::AccountDiscriminatorMismatch */
				const x = ld64(j)
				m = ld64(x)
				n = 0xf4e5b38cb383c28b /* account:Oracle */
				if (m == 0xf4e5b38cb383c28b /* account:Oracle */) {
					if (k > 0xfd) {
						if ((memcmp(x + 8, s60, 0x20) as u32) != 0) {
							fn_1494c8("internal error: entered unreachable code", 0x28, 0x100159eb8)
						}
						st64(o, ld64(o) - 1)
						u = memcpy(a, c, 0x30)
						st8(a + 0x30, 1)
						return u
					}
					fn_14c5c0(0xfe, k, 0x100159ed0, m, 0xf4e5b38cb383c28b /* account:Oracle */)
				}
			}
			u = anchor_error_from(sa0, l, l, m, n)
			t = ld64(sa0 + 8)
			s = ld64(sa0)
			st64(o, ld64(o) - 1)
		} else {
			st64(s40, i, j, o)
			u = fn_13b430(s90, s40)
			t = ld64(s90 + 8)
			s = ld64(s90)
		}
	}
	if (s != 2) {
		st64(a + 8, t)
		st64(a, s)
		st8(a + 0x30, 2)
		const w = ld64(c + 0x10)
		const v = ld64(c + 8)
		rc_dec(v)
		if (!rc_release(w)) {
			return u
		}
		st64(w + 8, ld64(w + 8) - 1)
		return u
	}
	u = memcpy(a, c, 0x30)
	st8(a + 0x30, t)
	return u
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), a (points to it), b (points to it)
export function fn_5bfc8(a: u64, b: u64, c: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28
	if (ld8(b + 0x30) != 0) {
		r0 = AccountInfo_try_borrow_data(s18, b, r0)
		const i = ld64(s18 + 0x10)
		const g = ld64(s18 + 8)
		const f = ld64(s18)
		if (f != 0x800000000000001a /* Ok */) {
			st64(s18, f, g, i)
			r0 = fn_13b430(s28, s18)
			const j = ld64(s28)
			st64(a + 8, ld64(s28 + 8))
			st64(a, j)
			return r0
		}
		const h = ld64(g + 8)
		if (h > 0xfd) {
			st8(a + 8, c >= ld64(ld64(g) + 0x28))
			st64(a, 2)
			st64(i, ld64(i) - 1)
			return r0
		}
		fn_14c5c0(0xfe, h, 0x100159ee8, 0x800000000000001a /* Ok */)
	}
	st64(a, 2)
	st8(a + 8, 1)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (points to it)
export function fn_5c138(a: u64, b: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s3a = fp - 0x3a, s66 = fp - 0x66, s78 = fp - 0x78
	if (ld8(b + 0x30) != 0) {
		AccountInfo_try_borrow_data(s18, b, r0)
		const i = ld64(s18 + 0x10)
		const g = ld64(s18 + 8)
		const f = ld64(s18)
		if (f != 0x800000000000001a /* Ok */) {
			st64(s18, f, g, i)
			r0 = fn_13b430(s78, s18)
			const j = ld64(s78)
			st64(a + 0x10, ld64(s78 + 8))
			st64(a + 8, j)
			st8(a, 1)
			return r0
		}
		const h = ld64(g + 8)
		if (h > 0xfd) {
			const k = ld64(g)
			st16(s3a + 0x20, ld16(k + 0x50))
			copyr(s3a, k + 0x30, 0x20)
			memcpy(s66, k + 0x52, 0x2c)
			st8(a + 1, 1)
			r0 = memcpy(a + 2, s66, 0x4e)
			st8(a, 0)
			st64(i, ld64(i) - 1)
			return r0
		}
		fn_14c5c0(0xfe, h, 0x100159ee8)
	}
	st16(a, 0)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (points to it)
export function fn_5c328(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38
	let k: u64
	const f = ld8(c)
	if (ld8(b + 0x30) != 0) {
		if (f != 0) {
			if (ld8(b + 0x29) != 0) {
				fn_143448(s18, b, r0)
				const j = ld64(s18 + 0x10)
				const h = ld64(s18 + 8)
				const g = ld64(s18)
				if (g != 0x800000000000001a /* Ok */) {
					st64(s18, g, h, j)
					r0 = fn_13b430(s28, s18)
					k = ld64(s28)
					st64(a + 8, ld64(s28 + 8))
					st64(a, k)
					return r0
				}
				const i = ld64(h + 8)
				if (i > 0xfd) {
					r0 = memcpy(ld64(h) + 0x52, c + 1, 0x2c)
					st64(j, ld64(j) + 1)
					st64(a + 8, undef)
					st64(a, 2)
					return r0
				}
				fn_14c5c0(0xfe, i, 0x100159f00)
			}
			r0 = anchor_error_from(s38, 0xbbe /* anchor::AccountNotMutable */, c, f, e)
			k = ld64(s38)
			st64(a + 8, ld64(s38 + 8))
			st64(a, k)
			return r0
		}
		fn_1494c8("internal error: entered unreachable code", 0x28, 0x100159ea0, f, e)
	}
	if (f == 0) {
		st64(a + 8, b)
		st64(a, 2)
		return r0
	}
	fn_1494c8("internal error: entered unreachable code", 0x28, 0x100159ea0, f, e)
}

export function fn_5d748(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	let j, m, n, q, r, t: u64
	if (ld8(b + 0x29) != 0) {
		const f = memcmp(ld64(b + 0x18), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
		if ((f as u32) == 0) {
			fn_143448(s20, b, f as u32)
			let k = undef
			const l = ld64(s20 + 0x10)
			const h = ld64(s20 + 8)
			const g = ld64(s20)
			if (g == 0x800000000000001a /* Ok */) {
				B6: {
					j = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
					const i = ld64(h + 8)
					if (i >= 8) {
						const o = ld64(h)
						const p = ld64(o)
						if (p == 0x38dac7e18ef6d811 /* account:DynamicTickArray */) {
							r = 0x100159f60
							q = o + 8
						} else {
							j = 0xbba /* anchor::AccountDiscriminatorMismatch */
							k = 0xbb42076ebebd6145 /* account:TickArray */
							if (p != 0xbb42076ebebd6145 /* account:TickArray */) {
								break B6
							}
							q = fn_5dad8(o, i, 0xbba /* anchor::AccountDiscriminatorMismatch */, 0xbb42076ebebd6145 /* account:TickArray */)
							r = 0x100159fd0
						}
						st64(s80, q, r)
						const s = ld64(r + 0x28)
						callx(s, s20, q, s)
						n = memcmp(s20, c, 0x20) as u32
						if (n != 0) {
							n = fn_87630(s50, 0x38)
							t = ld64(s50)
							st64(a + 0x10, ld64(s50 + 8))
							st64(a + 8, t)
							st64(a, 0)
							st64(l, ld64(l) + 1)
							return n
						}
						st64(a + 0x10, l)
						st64(a + 8, ld64(s80 + 8))
						st64(a, ld64(s80))
						return n
					}
				}
				n = anchor_error_from(s60, j, j, k)
				t = ld64(s60)
				st64(a + 0x10, ld64(s60 + 8))
				st64(a + 8, t)
				st64(a, 0)
				st64(l, ld64(l) + 1)
				return n
			}
			st64(s20, g, h, l)
			n = fn_13b430(s40, s20)
			m = ld64(s40)
			st64(a + 0x10, ld64(s40 + 8))
			st64(a + 8, m)
			st64(a, 0)
			return n
		}
		n = anchor_error_from(s30, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		m = ld64(s30)
		st64(a + 0x10, ld64(s30 + 8))
		st64(a + 8, m)
		st64(a, 0)
		return n
	}
	n = anchor_error_from(s70, 0xbbe /* anchor::AccountNotMutable */, c, d, e)
	m = ld64(s70)
	st64(a + 0x10, ld64(s70 + 8))
	st64(a + 8, m)
	st64(a, 0)
	return n
}

export function fn_5dad8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	if (b > 7) {
		if (b != 0x2704) {
			fn_117c8("from_bytes_mut", 0xe, 2, d, e)
		}
		return a + 8
	}
	fn_14c4f0(8, b, 0x10015a040, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), p6 (value), p7 (value), p8 (value)
export function fn_5db48(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64, p13: u64, p14: u64): u64 {
	const s8 = fp - 0x8, s28 = fp - 0x28, s48 = fp - 0x48, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8
	let r, x, ag, ah: u64
	let am = c
	const f = p8
	st64(s98 + 8, f)
	const g = p7
	st64(s98, g)
	const h = p10
	const i = p12
	if ((memcmp(h, i, 0x20) as i32) < 0) {
		const j = f + (g >= fn_13b50)
		if ((j != 0xfffec4b2 ? 0xfffec4b1 > j - 1 : 0x35bb7f31a819f860 > g + 0xfffffffefffec4b0) != 0) {
			const k = p6
			if ((k as u16) != 0) {
				const ai = p14
				const ak = p13
				const aj = p11
				const q = p9
				const m = p5
				const l = ld64(ld64(am))
				const al = ld64(l)
				const p = ld64(l + 8)
				const o = ld64(l + 0x10)
				const n = ld64(l + 0x18)
				st16(b + 0x27e, d)
				st8(b + 0x284, m)
				st16(b + 0x27c, k)
				st64(b + 0x198, n)
				st64(b + 0x190, o)
				st64(b + 0x188, p)
				st64(b + 0x180, al)
				if ((q as u16) > 0xea60) {
					ah = fn_87630(sb8, 0x1c)
					ag = ld64(sb8 + 8)
					r = ld64(sb8)
					if (r != 2) {
						st64(a + 8, ag)
						st64(a, r)
						return ah
					}
				} else {
					st16(b + 0x280, q)
				}
				const s = ld16(am + 0x68)
				if (s > 0x9c4 /* anchor::RequireViolated */) {
					ah = fn_87630(sc8, 0x1d)
					ag = ld64(sc8 + 8)
					r = ld64(sc8)
					if (r != 2) {
						st64(a + 8, ag)
						st64(a, r)
						return ah
					}
				} else {
					st16(b + 0x282, s)
				}
				st64(b + 0x230, g, f)
				st64(b + 0x228, 0)
				st64(b + 0x220, 0)
				st32(b + 0x278, fn_53940(s98))
				st64(b + 0x268, 0)
				st64(b + 0x260, 0)
				copy(b + 0x1a0, h, 0x20)
				copy(b + 0x1c0, aj, 0x20)
				st64(b + 0x248, 0)
				st64(b + 0x240, 0)
				copy(b + 0x1e0, i, 0x20)
				copy(b + 0x200, ak, 0x20)
				st64(b + 0x258, 0)
				st64(b + 0x250, 0)
				copyr(s48, am + 0x48, 0x20)
				st64(s88, 0, 0, 0, 0, 0, 0, 0, 0)
				st64(s28, 0, 0, 0, 0)
				memcpy(b, s88, 0x80)
				const t = ld64(0x300000000 /* heap bump-allocator cursor */)
				let u = 0x400 > t
				let v = u != 0 ? 0 : t - 0x400
				const w = t != 0 ? v : 0x300007c00
				if (w > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, w)
					st16(w, ai)
					st64(w + 2, 0, 0, 0)
					st64(w + 0x18, 0)
					st32(s48, ld32(w))
					st32(s48 + 3, ld32(w + 3))
					am = ld64(w + 7)
					const aa = ld64(w + 0xf)
					const z = ld64(w + 0x17)
					const y = ld8(w + 0x1f)
					st64(s88, 0, 0, 0, 0, 0, 0, 0, 0)
					memcpy(b + 0x80, s88, 0x47)
					st8(b + 0xdf, y)
					st64(b + 0xd7, z)
					st64(b + 0xcf, aa)
					st64(b + 0xc7, am)
					st64(b + 0xe0, 0, 0, 0, 0)
					const ab = ld64(0x300000000 /* heap bump-allocator cursor */)
					u = 0x400 > ab
					v = u != 0 ? 0 : ab - 0x400
					const ac = ab != 0 ? v : 0x300007c00
					if (ac > 0x300000007) {
						st64(0x300000000 /* heap bump-allocator cursor */, ac)
						st64(ac + 0x18, 0)
						st64(ac + 0x10, 0)
						st64(ac + 8, 0)
						st64(ac, 0)
						st32(s48 + 3, 0)
						st32(s48, 0)
						am = ld64(ac + 7)
						const af = ld64(ac + 0xf)
						const ae = ld64(ac + 0x17)
						const ad = ld8(ac + 0x1f)
						st64(s88, 0, 0, 0, 0, 0, 0, 0, 0)
						ah = memcpy(b + 0x100, s88, 0x47)
						st8(b + 0x15f, ad)
						st64(b + 0x157, ae)
						st64(b + 0x14f, af)
						st64(b + 0x147, am)
						st64(b + 0x160, 0, 0, 0, 0)
						st64(a + 8, am)
						st64(a, 2)
						return ah
					}
					raw_vec_handle_error(1, 0x400, v, u, x)
				}
				raw_vec_handle_error(1, 0x400, v, u, x)
			}
			st64(s88, 0x10015a058, 1, s8, 0, 0)
			// fmt "internal error: entered unreachable code: tick_spacing must be greater than 0"
			fn_149478(s88, 0x10015a068, j - 1, 0xfffec4b1)
		}
		ah = fn_87630(sa8, 0xb)
		r = ld64(sa8)
		st64(a + 8, ld64(sa8 + 8))
		st64(a, r)
		return ah
	}
	ah = fn_87630(sd8, 0x18)
	r = ld64(sd8)
	st64(a + 8, ld64(sd8 + 8))
	st64(a, r)
	return ah
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
export function fn_5e558(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50
	let g, m: u64
	if (c > 2) {
		g = fn_87630(s50, 0x1a)
		m = ld64(s50)
		st64(a + 8, ld64(s50 + 8))
		st64(a, m)
		return g
	}
	st64(s20, 0, 0, 0, 0)
	const f = memcmp(b, s20, 0x20)
	let j = 0
	g = f as u32
	if (g != 0) {
		st64(s20, 0, 0, 0, 0)
		const h = memcmp(b + 0x80, s20, 0x20)
		j = 1
		g = h as u32
		if (g != 0) {
			st64(s20, 0, 0, 0, 0)
			const i = memcmp(b + 0x100, s20, 0x20)
			j = 2
			g = i as u32
			if (g != 0) {
				g = fn_87630(s30, 0x1a)
				m = ld64(s30)
				st64(a + 8, ld64(s30 + 8))
				st64(a, m)
				return g
			}
		}
	}
	if (j == c) {
		const k = b + (c << 7)
		st64(k + 0x18, ld64(d + 0x18))
		st64(k + 0x10, ld64(d + 0x10))
		st64(k + 8, ld64(d + 8))
		st64(k, ld64(d))
		copy(k + 0x20, e, 0x18)
		const l = ld64(e + 0x18)
		st64(k + 0x38, l)
		st64(a + 8, l)
		st64(a, 2)
		return g
	}
	g = fn_87630(s40, 0x1a)
	m = ld64(s40)
	st64(a + 8, ld64(s40 + 8))
	st64(a, m)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it), c (points to it), p5 (value), p7 (value)
export function fn_5ecd8(a: u64, b: u64, c: u64, d: AccountInfo, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s40 = fp - 0x40, s48 = fp - 0x48, s78 = fp - 0x78, sa8 = fp - 0xa8, sf8 = fp - 0xf8, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s180 = fp - 0x180, s188 = fp - 0x188, s190 = fp - 0x190, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, s1b0 = fp - 0x1b0, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1c8 = fp - 0x1c8, s1d0 = fp - 0x1d0, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8, s200 = fp - 0x200, s1000 = fp - 0x1000
	let g, az, bg, bh, bi: u64
	B5: {
		g = c
		st64(s150, a, b)
		const f = ld64(b)
		copyr(sa8, f, 0x20)
		if ((memcmp(d.owner, sa8, 0x20) as u32) == 0) {
			st64(s160, p8, p9)
			st64(s180, p7, p6)
			let v = p5
			let h = fn_143100(d)
			let i = ld64(g)
			if (h != 0) {
				const j = d.key
				st64(s188, i)
				st64(s1f8, h)
				fn_142e70(sf8, j, i, h)
				const k: AccountInfo = ld64(s150 + 8)
				const l: LamportsCell = k.lamports
				rc_inc(l)
				const t: DataCell = k.data
				const u = t.strong
				st64(s180 + 0x18, l)
				rc_inc(t, u)
				const aa = v
				const w: LamportsCell = d.lamports
				const x = w.strong
				st64(s1b0, d.key)
				st64(s1a8, k.executable)
				st64(s1a0, k.is_writable)
				st64(s198, k.is_signer)
				st64(s190, k.rent_epoch)
				const ag = k.owner
				rc_inc(w, x)
				const y: DataCell = d.data
				st64(s180 + 0x10, y)
				const z = y.strong
				st64(s1b8, w)
				rc_inc(ld64(s180 + 0x10), z)
				const ad: AccountInfo = g
				const ab = ld64(g + 8)
				const ac = ld64(ab)
				st64(s1c0, t)
				st64(s1e0, d.executable)
				st64(s1d8, d.is_writable)
				st64(s1d0, d.is_signer)
				st64(s1c8, d.rent_epoch)
				const al = d.owner
				rc_inc(ab, ac)
				const ae: DataCell = ad.data
				const af = ae.strong
				st64(s1e8, ag)
				st64(s200, aa)
				rc_inc(ae, af)
				const ak = ad.owner
				const aj = ad.rent_epoch
				const ai = ad.is_signer
				const ah = ad.is_writable
				st64(s1f0, ad)
				st8(s20 + 2, ad.executable)
				st8(s20, ai, ah)
				st64(s40, ab, ae, ak, aj)
				st64(s48, ld64(s188))
				st8(s78 + 0x2a, ld64(s1e0))
				st8(s78 + 0x29, ld64(s1d8))
				st8(s78 + 0x28, ld64(s1d0))
				st64(s78 + 0x20, ld64(s1c8))
				st64(s78 + 0x18, al)
				st64(s78 + 0x10, ld64(s180 + 0x10))
				st64(s78 + 8, ld64(s1b8))
				st64(s78, ld64(s1b0))
				st8(sa8 + 0x2a, ld64(s1a8))
				st8(sa8 + 0x29, ld64(s1a0))
				st8(sa8 + 0x28, ld64(s198))
				st64(sa8 + 0x20, ld64(s190))
				st64(sa8 + 0x18, ld64(s1e8))
				st64(sa8 + 0x10, ld64(s1c0))
				st64(sa8 + 8, ld64(s180 + 0x18))
				st64(sa8, f)
				copy(s1000, s160, 0x10)
				fn_1390d8(s110, sf8, sa8, 3, fp)
				if (ld64(s110) != 0x800000000000001a /* Ok */) {
					copyr(s18, s110, 0x18)
					bi = fn_13b430(s130, s18)
					az = ld64(s130 + 8)
					bh = ld64(s130)
					const bk = ld64(sa8 + 0x10)
					const bj = ld64(sa8 + 8)
					rc_dec(bj)
					g = ld64(s1f0)
					rc_dec(bk)
					const bm = ld64(s78 + 0x10)
					const bl = ld64(s78 + 8)
					rc_dec(bl)
					rc_dec(bm)
					const bo: DataCell = ld64(s40 + 8)
					const bn = ld64(s40)
					rc_dec(bn)
					if (!rc_release(bo)) {
						break B5
					}
					bo.weak = bo.weak - 1
					break B5
				}
				const an = ld64(sa8 + 0x10)
				const am = ld64(sa8 + 8)
				rc_dec(am)
				g = ld64(s1f0)
				h = ld64(s1f8)
				i = ld64(s188)
				v = ld64(s200)
				rc_dec(an)
				const ap = ld64(s78 + 0x10)
				const ao = ld64(s78 + 8)
				rc_dec(ao)
				rc_dec(ap)
				const ar: DataCell = ld64(s40 + 8)
				const aq = ld64(s40)
				rc_dec(aq)
				rc_dec(ar)
			}
			const at = d.key
			st64(s1000, ld64(s180))
			st64(s1000 + 8, v)
			h = max(h, ld64(s180 + 8))
			fn_142800(sf8, i, at, h, fp)
			memcpy(s48, d, 0x30)
			memcpy(sa8, ld64(s150 + 8), 0x30)
			memcpy(s78, g, 0x30)
			copy(s1000, s160, 0x10)
			bi = fn_1390d8(s110, sf8, sa8, 3, fp)
			if (ld64(s110) == 0x800000000000001a /* Ok */) {
				const av = ld64(sa8 + 0x10)
				const au = ld64(sa8 + 8)
				rc_dec(au)
				bg = ld64(s150)
				rc_dec(av)
				const ax = ld64(s78 + 0x10)
				const aw = ld64(s78 + 8)
				rc_dec(aw)
				rc_dec(ax)
				az = ld64(s40 + 8)
				const ay = ld64(s40)
				rc_dec(ay)
				if (!rc_release(az)) {
					st64(bg + 8, az)
					st64(bg, 2)
					return bi
				}
				st64(az + 8, ld64(az + 8) - 1)
				st64(bg + 8, az)
				st64(bg, 2)
				return bi
			}
			copyr(s18, s110, 0x18)
			bi = fn_13b430(s140, s18)
			az = ld64(s140 + 8)
			bh = ld64(s140)
			const bb = ld64(sa8 + 0x10)
			const ba = ld64(sa8 + 8)
			rc_dec(ba)
			rc_dec(bb)
			const bd = ld64(s78 + 0x10)
			const bc = ld64(s78 + 8)
			rc_dec(bc)
			rc_dec(bd)
			const bf: DataCell = ld64(s40 + 8)
			const be = ld64(s40)
			rc_dec(be)
			if (!rc_release(bf)) {
				bg = ld64(s150)
				st64(bg + 8, az)
				st64(bg, bh)
				return bi
			}
			bf.weak = bf.weak - 1
			bg = ld64(s150)
			st64(bg + 8, az)
			st64(bg, bh)
			return bi
		}
		bi = anchor_error_from(s120, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		az = ld64(s120 + 8)
		bh = ld64(s120)
	}
	const n: DataCell = d.data
	const m: LamportsCell = d.lamports
	rc_dec(m)
	rc_dec(n)
	const p = ld64(g + 0x10)
	const o = ld64(g + 8)
	rc_dec(o)
	rc_dec(p)
	const q = ld64(s150 + 8)
	const s = ld64(q + 0x10)
	const r = ld64(q + 8)
	rc_dec(r)
	bg = ld64(s150)
	if (!rc_release(s)) {
		st64(bg + 8, az)
		st64(bg, bh)
		return bi
	}
	st64(s + 8, ld64(s + 8) - 1)
	st64(bg + 8, az)
	st64(bg, bh)
	return bi
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
export function fn_5fd40(a: u64): u64 {
	const s28 = fp - 0x28, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s98 = fp - 0x98, sc8 = fp - 0xc8, se0 = fp - 0xe0, sf8 = fp - 0xf8, s108 = fp - 0x108
	let j = rent_get(s70)
	copy(se0, s68, 0x18)
	if (ld64(s70) != 0) {
		j = fn_13b430(s108, se0)
		const i = ld64(s108)
		st64(a + 8, ld64(s108 + 8))
		st64(a, i)
		return j
	}
	st64(sf8 + 0x10, ld64(se0 + 0x10))
	const f = ld64(se0)
	st64(sf8, f)
	const g = ld64(se0 + 8)
	st64(sf8 + 8, g)
	let h = 0x3ff0000000000000
	if (g == 0x3ff0000000000000) {
		if (0x1b31 > f) {
			st64(a + 8, f)
			st64(a, 2)
			return j
		}
	} else {
		h = 0x4000000000000000
		if (g == 0x4000000000000000 && f == 0xd98) {
			st64(a + 8, f)
			st64(a, 2)
			return j
		}
	}
	st64(s98, sf8, fn_14f060, s78, fn_14e7a8, g)
	st64(s28 + 0x18, 0xc00000020)
	st8(s28 + 0x20, 3)
	st64(s28, 0, 0x12, 1)
	st64(s50 + 0x18, 2)
	st8(s50 + 0x10, 3)
	st64(s50, 0, 0x20)
	st64(s68 + 8, 2)
	st64(s70, 2)
	st64(sc8, 0x10015a0c0, 2, s98, 2, s70, 2)
	// fmt pieces ["internal error: entered unreachable code: unexpected Rent configuration on the Solana network: lamports_per_byte_year=",", exemption_threshold_bits="] (with placeholder specs), arguments: *sf8 [fn_14f060], g [fn_14e7a8]
	fn_149478(sc8, 0x10015a0e0, h)
}

export function fn_5ffd0(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30
	let l, m, n, s: u64
	const f: AccountInfo = ld64(c)
	const g = f.key
	if (ld32(b + 0x48) != 0 && (memcmp(g, b + 0x4c, 0x20) as u32) == 0) {
		const o: LamportsCell = f.lamports
		rc_inc(o)
		const p: DataCell = f.data
		rc_inc(p)
		B17: {
			const q = f.is_signer
			const r = memcmp(b + 0x4c, g, 0x20)
			n = undef
			if (q != 0) {
				m = 2
				l = r as u32
				if (l == 0) {
					break B17
				}
			}
			l = fn_87630(s10, 0x13)
			n = ld64(s10 + 8)
			m = ld64(s10)
		}
		rc_dec(o)
		s = a
		rc_dec(p)
		if (m != 2) {
			st64(s + 8, n)
			st64(s, m)
			return l
		}
		if (ld64(b + 0x80) == 1) {
			st64(s + 8, n)
			st64(s, 2)
			return l
		}
		l = fn_87630(s20, 0x14)
		m = ld64(s20)
		st64(s + 8, ld64(s20 + 8))
		st64(s, m)
		return l
	}
	const h: LamportsCell = f.lamports
	rc_inc(h)
	const i: DataCell = f.data
	rc_inc(i)
	B8: {
		const j = f.is_signer
		const k = memcmp(b + 0x20, g, 0x20)
		n = undef
		if (j != 0) {
			l = k as u32
			if (l == 0) {
				break B8
			}
		}
		l = fn_87630(s30, 0x13)
		n = undef
		m = ld64(s30)
		if (m != 2) {
			n = ld64(s30 + 8)
			rc_dec(h)
			s = a
			if (!rc_release(i)) {
				st64(s + 8, n)
				st64(s, m)
				return l
			}
			i.weak = i.weak - 1
			st64(s + 8, n)
			st64(s, m)
			return l
		}
	}
	rc_dec(h)
	s = a
	if (!rc_release(i)) {
		st64(s + 8, n)
		st64(s, 2)
		return l
	}
	n = i.weak - 1
	i.weak = n
	st64(s + 8, n)
	st64(s, 2)
	return l
}

// types [heur]: b: TokenAccount_2 (5 of 7 calls pass one, the others an untyped value: fn_310a0, fn_33380, fn_35bf0, …)
export function fn_60480(a: u64, b: TokenAccount_2, c: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30
	let l, m, n, s: u64
	const f: AccountInfo = ld64(c)
	const g = f.key
	if (ld32(b + 0x70) != 0 && (memcmp(g, b.delegate, 0x20) as u32) == 0) {
		const o: LamportsCell = f.lamports
		rc_inc(o)
		const p: DataCell = f.data
		rc_inc(p)
		B17: {
			const q = f.is_signer
			const r = memcmp(b.delegate, g, 0x20)
			n = undef
			if (q != 0) {
				m = 2
				l = r as u32
				if (l == 0) {
					break B17
				}
			}
			l = fn_87630(s10, 0x13)
			n = ld64(s10 + 8)
			m = ld64(s10)
		}
		rc_dec(o)
		s = a
		rc_dec(p)
		if (m != 2) {
			st64(s + 8, n)
			st64(s, m)
			return l
		}
		if (b.delegated_amount == 1) {
			st64(s + 8, n)
			st64(s, 2)
			return l
		}
		l = fn_87630(s20, 0x14)
		m = ld64(s20)
		st64(s + 8, ld64(s20 + 8))
		st64(s, m)
		return l
	}
	const h: LamportsCell = f.lamports
	rc_inc(h)
	const i: DataCell = f.data
	rc_inc(i)
	B8: {
		const j = f.is_signer
		const k = memcmp(b.owner, g, 0x20)
		n = undef
		if (j != 0) {
			l = k as u32
			if (l == 0) {
				break B8
			}
		}
		l = fn_87630(s30, 0x13)
		n = undef
		m = ld64(s30)
		if (m != 2) {
			n = ld64(s30 + 8)
			rc_dec(h)
			s = a
			if (!rc_release(i)) {
				st64(s + 8, n)
				st64(s, m)
				return l
			}
			i.weak = i.weak - 1
			st64(s + 8, n)
			st64(s, m)
			return l
		}
	}
	rc_dec(h)
	s = a
	if (!rc_release(i)) {
		st64(s + 8, n)
		st64(s, 2)
		return l
	}
	n = i.weak - 1
	i.weak = n
	st64(s + 8, n)
	st64(s, 2)
	return l
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), c (value)
export function fn_60930(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70
	let j, p, q, r, t: u64
	let f = b
	st64(s68 + 0x10, a)
	let g = c as u32
	const h = p6
	st64(s10 + 8, h)
	const i = p5
	st64(s10, i)
	if (((b as u32) != 0x80000000 & g != 0x7fffffff) != 0) {
		j = ld64(s68 + 0x10)
		st32(j + 0xc, c)
		st32(j + 8, f)
		st64(j, 2)
		return g
	}
	if ((d as i16) > -1) {
		const k = f as u32
		if (k == 0x80000000 && (c as u32) == 0x7fffffff) {
			g = fn_87630(s20, 0xa)
			r = ld64(s20)
			q = ld64(s68 + 0x10)
			st64(q + 8, ld64(s20 + 8))
			st64(q, r)
			return g
		}
		st64(s68, d, c)
		const l = fn_53940(s10)
		st64(s70, l)
		g = fn_501e0(s30, l, l)
		let m = ld64(s68)
		let n = ld64(s68 + 8)
		const s = m as u16
		if (k == 0x80000000) {
			if (s == 0) {
				fn_14e1c0(0x10015a0f8, s, 0x80000000, m, t)
			}
			const u = ld64(s70) + ((ld64(s30) ^ i | ld64(s30 + 8) ^ h) != 0)
			g = fn_151bf8(u as i32, s)
			const v = (g >> 0x1f & s) + g
			f = (((v as u32) != 0 ? s - v : 0) + u) as i32
			n = ld64(s68 + 8)
			m = ld64(s68)
			if ((f as i64) >= 0x6c4f5) {
				g = fn_87630(s40, 0xa)
				r = ld64(s40)
				q = ld64(s68 + 0x10)
				st64(q + 8, ld64(s40 + 8))
				st64(q, r)
				return g
			}
		}
		const o = n as u32
		if (o != 0x7fffffff) {
			p = ld64(s68 + 0x10)
			st32(p + 0xc, n)
			st32(p + 8, f)
			st64(p, 2)
			return g
		}
		const w = m as u16
		if (w != 0) {
			const x = ld64(s70)
			const y = fn_151bf8(x as i32, s)
			g = y + (y >> 0x1f & s)
			const z = x - g
			n = z as i32
			if ((z as i32) > -0x6c4f5) {
				p = ld64(s68 + 0x10)
				st32(p + 0xc, n)
				st32(p + 8, f)
				st64(p, 2)
				return g
			}
			g = fn_87630(s50, 0xa)
			r = ld64(s50)
			q = ld64(s68 + 0x10)
			st64(q + 8, ld64(s50 + 8))
			st64(q, r)
			return g
		}
		fn_14e1c0(0x10015a110, s, o, w, t)
	}
	j = ld64(s68 + 0x10)
	st32(j + 0xc, c)
	st32(j + 8, f)
	st64(j, 2)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), c (points to it)
export function fn_60de8(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64) {
	const s20 = fp - 0x20, s50 = fp - 0x50, s68 = fp - 0x68, sb0 = fp - 0xb0, sc8 = fp - 0xc8, s118 = fp - 0x118, s120 = fp - 0x120
	let g, n, ak, al, ao, aq, ax, bi, bl, bm, bn, cb, cp, di: u64
	B4: {
		B2: {
			copyr(s68, b, 0x18)
			const f = ld64(c)
			st64(s120, a)
			if (f != 0x8000000000000000) {
				let o = ld64(s68 + 0x10)
				const q = ld64(c + 8)
				const p = ld64(c + 0x10)
				if (p > ld64(s68) - o) {
					fn_e968(s68, o, p, d, e, r0)
					o = ld64(s68 + 0x10)
				}
				const r = ld64(s68 + 8)
				st64(s118 + 0x48, r)
				memcpy(r + o * 0x30, q, p * 0x30)
				d = undef
				e = undef
				g = o + p
				st64(s68 + 0x10, g)
				if (0x15 > g) {
					break B2
				}
			} else {
				g = ld64(s68 + 0x10)
				st64(s118 + 0x48, ld64(s68 + 8))
				if (0x15 > g) {
					break B2
				}
			}
			const s = ld64(0x300000000 /* heap bump-allocator cursor */)
			const t = s != 0 ? s : 0x300008000
			const u = t - (g >> 1) * 0x30
			const v = u > t ? 0 : u
			if ((v & -8) > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, v & -8)
				st64(sb0 + 0x30, v & -8)
				let w = (v & -8) - 0x100
				if (w > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, w)
					st64(s118 + 0x18, 0x10)
					let y = 0
					const x = ld64(s118 + 0x48)
					st64(s118 + 0x20, x - 0x30)
					st64(s118, x - 0x18, x + 0x18, x + 0x60)
					let z = 0
					st64(s118 + 0x38, g)
					while (true) {
						B25: {
							st64(sb0 + 0x28, z)
							st64(s118 + 0x40, w)
							const aa = y
							st64(sb0 + 0x20, ld64(s118 + 0x48) + y * 0x30)
							st64(sb0 + 0x38, y)
							const ab = g - y
							al = ab
							st64(sb0 + 0x40, ab)
							if (ab >= 2) {
								const ac = ld64(sb0 + 0x20)
								const ae = ld64(ac)
								let ad = ld64(ac + 0x30)
								copyr(s20, ad, 0x20)
								copyr(s50, ae, 0x20)
								const af = memcmp(s20, s50, 0x20)
								z = undef
								if (0 > (af as i32)) {
									st64(sb0 + 0x18, aa * 0x30)
									let cq = 2
									if (ld64(sb0 + 0x40) != 2) {
										let cl = ld64(s118 + 0x10) + ld64(sb0 + 0x18)
										let co = 2
										do {
											const cm = ld64(cl)
											copyr(s20, cm, 0x20)
											copyr(s50, ad, 0x20)
											const cn = memcmp(s20, s50, 0x20)
											cq = co
											if ((cn as i32) > -1) {
												break
											}
											cl = cl + 0x30
											co = co + 1
											ad = cm
											cp = ld64(sb0 + 0x40)
											cq = cp
										} while (cp > co)
									}
									const cr = cq
									const cs = ld64(sb0 + 0x38)
									g = ld64(s118 + 0x38)
									const ct = cq
									z = ld64(sb0 + 0x18)
									if (cq > cq + cs) {
										fn_14c690(cs, cr + cs, 0x100159518, cq, z)
									}
									st64(s118 + 0x28, cr + cs)
									if (cr + cs > g) {
										fn_14c5c0(ld64(s118 + 0x28), g, 0x100159518, cq, z)
									}
									al = 1
									if (2 > ct) {
										break B25
									}
									let db = ct >> 1
									let cu = ld64(s118 + 8) + z
									z = ld64(s118) + (ld64(sb0 + 0x38) + ct) * 0x30
									while (true) {
										const cv = ld64(cu - 0x18)
										st64(cu - 0x18, ld64(z - 0x18))
										st64(z - 0x18, cv)
										const cw = ld64(cu - 0x10)
										st64(cu - 0x10, ld64(z - 0x10))
										st64(z - 0x10, cw)
										const cx = ld64(cu - 8)
										st64(cu - 8, ld64(z - 8))
										st64(z - 8, cx)
										const cy = ld64(cu)
										st64(cu, ld64(z))
										st64(z, cy)
										const cz = ld64(cu + 8)
										st64(cu + 8, ld64(z + 8))
										st64(z + 8, cz)
										const da = ld64(cu + 0x10)
										st64(cu + 0x10, ld64(z + 0x10))
										st64(z + 0x10, da)
										cu = cu + 0x30
										z = z - 0x30
										db = db - 1
										al = ct
										if (db == 0) {
											break B25
										}
									}
								}
								al = 2
								if (ld64(sb0 + 0x40) != 2) {
									let ag = ld64(s118 + 0x10) + aa * 0x30
									let aj = 2
									do {
										const ah = ld64(ag)
										copyr(s20, ah, 0x20)
										copyr(s50, ad, 0x20)
										const ai = memcmp(s20, s50, 0x20)
										z = undef
										al = aj
										if (0 > (ai as i32)) {
											break
										}
										ag = ag + 0x30
										aj = aj + 1
										ad = ah
										ak = ld64(sb0 + 0x40)
										al = ak
									} while (ak > aj)
								}
							}
							st64(s118 + 0x28, al + ld64(sb0 + 0x38))
							g = ld64(s118 + 0x38)
						}
						const am = ld64(s118 + 0x28)
						let an = ld64(sb0 + 0x38)
						if (an > am) {
							fn_1494c8(("assertion failed: end >= start && end <= len"), 0x2c, 0x1001595c0, an, z)
						}
						if (am > g) {
							fn_1494c8(("assertion failed: end >= start && end <= len"), 0x2c, 0x1001595c0, an, z)
						}
						B36: {
							B34: {
								w = ld64(s118 + 0x40)
								ao = ld64(sb0 + 0x28)
								if (g > am && 0xa > al) {
									const ap = min(an + 0xa, g)
									if (0xfffffffffffffff6 > an) {
										aq = ap - an
										fn_d648(ld64(sb0 + 0x20), aq, am != an ? al : 1, an, ao)
										an = ld64(sb0 + 0x38)
										st64(s118 + 0x28, ap)
										ao = ld64(sb0 + 0x28)
										if (ao != ld64(s118 + 0x18)) {
											break B36
										}
										break B34
									}
									fn_14c690(an, ap, 0x1001595d8, an, ao)
								}
								aq = am - an
								if (ao != ld64(s118 + 0x18)) {
									break B36
								}
							}
							const ar = ld64(0x300000000 /* heap bump-allocator cursor */)
							const at = ar != 0 ? ar : 0x300008000
							const au = at - (ao << 5)
							const av = au > at ? 0 : au
							if (0x300000008 > (av & -8)) {
								fn_1490e8(0x1001595a8, at, au > at, 0x300000000 /* heap bump-allocator cursor */, ao)
							}
							st64(s118 + 0x18, ao << 1)
							st64(0x300000000 /* heap bump-allocator cursor */, av & -8)
							memcpy(av & -8, w, ao << 4)
							ao = ld64(sb0 + 0x28)
							w = av & -8
							an = ld64(sb0 + 0x38)
						}
						const aw = w + (ao << 4)
						st64(aw + 8, an)
						st64(aw, aq)
						z = ao + 1
						if (z >= 2) {
							let bd = z
							st64(s118 + 0x40, w)
							do {
								B47: {
									B46: {
										bm = bd
										bi = bd - 1
										const bj = w + (bi << 4)
										bl = ld64(bj + 8)
										const bk = ld64(bj)
										if (bk + bl != g) {
											bl = ld64((bm << 4) + w - 0x20)
											if (bl > bk) {
												z = 2
												if (bm == 2) {
													break
												}
												an = bl + bk
												bn = bm - 3
												z = w + (bn << 4)
												const ci = ld64(z)
												if (ci > an) {
													z = 3
													if (3 >= bm) {
														break
													}
													an = ci + bl
													bl = ld64((bm << 4) + w - 0x40)
													z = bm
													if (bl > an) {
														break
													}
												}
												if (bk > ci) {
													break B47
												}
												break B46
											}
										}
										if (bm != 2) {
											bn = bm - 3
											bl = w + (bn << 4)
											if (bk > ld64(bl)) {
												break B47
											}
										}
									}
									bn = bm - 2
								}
								if (bn >= bm) {
									st64(s50, 0x100159350, 1, 8, 0, 0)
									// fmt "Index out of bounds"
									fn_149478(s50, 0x100159530, bl, an, z)
								}
								const bo = bn
								if (bn + 1 >= bm) {
									st64(s50, 0x100159350, 1, 8, 0, 0)
									// fmt "Index out of bounds"
									fn_149478(s50, 0x100159548, bl, bo + 1, z)
								}
								const bp = w + (bn << 4)
								const bt = ld64(bp + 8)
								const bq = w + (bo + 1 << 4)
								const bs = ld64(bq)
								const br = ld64(bq + 8)
								if (bt > br + bs) {
									fn_14c690(bt, br + bs, 0x100159560, bs, z)
								}
								if (br + bs > g) {
									fn_14c5c0(br + bs, g, 0x100159560, bs, z)
								}
								st64(sc8, bs, bq)
								st64(sb0, bp, bn, bm, bi)
								const bu = ld64(bp)
								st64(sb0 + 0x28, (br + bs) * 0x30)
								const bw = br + bs - bt
								st64(sc8 + 0x10, bt)
								const bv = ld64(s118 + 0x48) + bt * 0x30
								let ay = bv + bu * 0x30
								st64(sb0 + 0x38, bv)
								st64(sb0 + 0x20, bu)
								if (bw - bu >= bu) {
									memcpy(ld64(sb0 + 0x30), bv, bu * 0x30)
									const ck = ld64(sb0 + 0x38)
									let ba = ay
									const cj = ld64(sb0 + 0x30)
									st64(sb0 + 0x40, cj + bu * 0x30)
									ay = ck
									ax = cj
									if ((bu as i64) >= 1) {
										ay = ck
										ax = ld64(sb0 + 0x30)
										if ((bw as i64) > (ld64(sb0 + 0x20) as i64)) {
											st64(sb0 + 0x28, ld64(s118 + 0x48) + ld64(sb0 + 0x28))
											ax = ld64(sb0 + 0x30)
											ay = ck
											do {
												const bf = ld64(ax)
												st64(sb0 + 0x38, ba)
												const be = ld64(ba)
												copyr(s20, be, 0x20)
												copyr(s50, bf, 0x20)
												const bg = memcmp(s20, s50, 0x20)
												let bh = ax
												if (-1 >= (bg as i32)) {
													bh = ld64(sb0 + 0x38)
												}
												memcpy(ay, bh, 0x30)
												ax = ax + ((bg as i32) > -1) * 0x30
												ay = ay + 0x30
												const az = ld64(sb0 + 0x38)
												if (ax >= ld64(sb0 + 0x40)) {
													break
												}
												ba = az + ((bg & 0x80000000) >> 0x1f) * 0x30
											} while (ld64(sb0 + 0x28) > ba)
										}
									}
								} else {
									st64(s118 + 0x30, bw - bu)
									const by = (bw - bu) * 0x30
									const bx = ld64(sb0 + 0x30)
									memcpy(bx, ay, by)
									const bz = ay
									st64(sb0 + 0x40, bx + by)
									ax = bx
									if ((bu as i64) >= 1) {
										ay = bz
										ax = ld64(sb0 + 0x30)
										if ((ld64(s118 + 0x30) as i64) >= 1) {
											let ca = ld64(s118 + 0x20) + ld64(sb0 + 0x28)
											ay = bz
											do {
												const ce = ld64(ay - 0x30)
												const cc = ld64(sb0 + 0x40)
												const cd = ld64(cc - 0x30)
												copyr(s20, cd, 0x20)
												copyr(s50, ce, 0x20)
												const cf = memcmp(s20, s50, 0x20)
												const cg = sar(cf << 0x20, 0x3f)
												ay = ay + cg * 0x30
												const ch = cc + ~cg * 0x30
												st64(sb0 + 0x40, ch)
												memcpy(ca, (cf as i32) > -1 ? ch : ay, 0x30)
												ax = ld64(sb0 + 0x30)
												if (ld64(sb0 + 0x38) >= ay) {
													break
												}
												ca = ca - 0x30
												cb = ld64(sb0 + 0x30)
												ax = cb
											} while (ld64(sb0 + 0x40) > cb)
										}
									}
								}
								memcpy(ay, ax, ld64(sb0 + 0x40) - ax)
								const bb = ld64(sc8 + 8)
								st64(bb + 8, ld64(sc8 + 0x10))
								st64(bb, ld64(sc8) + ld64(sb0 + 0x20))
								const bc = ld64(sb0)
								memmove(bc, bc + 0x10, ld64(sb0 + 0x10) + ~ld64(sb0 + 8) << 4)
								an = undef
								z = 1
								g = ld64(s118 + 0x38)
								w = ld64(s118 + 0x40)
								bd = ld64(sb0 + 0x18)
							} while (bd > 1)
						}
						y = ld64(s118 + 0x28)
						if (y >= g) {
							break B4
						}
					}
				}
				fn_1490e8(0x100159590, 0x300000000 /* heap bump-allocator cursor */, u > t, v & -8, e)
			}
			fn_1490e8(0x100159578, u, u > t, v & -8, e)
		}
		if (1 >= g) {
			n = ld64(s120)
			st64(n + 0x10, ld64(s68 + 0x10))
			st64(n + 8, ld64(s68 + 8))
			st64(n, ld64(s68))
			return
		}
		fn_d648(ld64(s118 + 0x48), g, 1, d, e)
	}
	const h = ld64(s68 + 0x10)
	if (h >= 2) {
		let m = 1
		const i = ld64(s68 + 8)
		st64(sb0 + 0x40, i)
		let j = i + 0x60
		while (true) {
			const l = ld64(j - 0x60)
			const k = ld64(j - 0x30)
			copyr(s20, k, 0x20)
			copyr(s50, l, 0x20)
			if ((memcmp(s20, s50, 0x20) as u32) == 0) {
				const dd = ld64(j - 0x20)
				const dc = ld64(j - 0x28)
				rc_dec(dc)
				rc_dec(dd)
				let de = m + 1
				if (de >= h) {
					st64(s68 + 0x10, m)
					n = ld64(s120)
					st64(n + 0x10, ld64(s68 + 0x10))
					st64(n + 8, ld64(s68 + 8))
					st64(n, ld64(s68))
					return
				}
				st64(sb0 + 0x38, h)
				while (true) {
					const df = ld64(sb0 + 0x40) + m * 0x30
					const dg = ld64(j)
					const dh = ld64(df - 0x30)
					copyr(s20, dg, 0x20)
					copyr(s50, dh, 0x20)
					if ((memcmp(s20, s50, 0x20) as u32) == 0) {
						const dk = ld64(j + 0x10)
						const dj = ld64(j + 8)
						rc_dec(dj)
						di = ld64(sb0 + 0x38)
						rc_dec(dk)
					} else {
						memcpy(df, j, 0x30)
						m = m + 1
						di = ld64(sb0 + 0x38)
					}
					j = j + 0x30
					de = de + 1
					if (de >= di) {
						st64(s68 + 0x10, m)
						n = ld64(s120)
						st64(n + 0x10, ld64(s68 + 0x10))
						st64(n + 8, ld64(s68 + 8))
						st64(n, ld64(s68))
						return
					}
				}
			}
			j = j + 0x30
			m = m + 1
			if (h == m) {
				n = ld64(s120)
				st64(n + 0x10, ld64(s68 + 0x10))
				st64(n + 8, ld64(s68 + 8))
				st64(n, ld64(s68))
				return
			}
		}
	}
	n = ld64(s120)
	st64(n + 0x10, ld64(s68 + 0x10))
	st64(n + 8, ld64(s68 + 8))
	st64(n, ld64(s68))
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), a (points to it)
export function fn_62750(a: u64, b: u64, c: u64, d: u64): u64 {
	const s20 = fp - 0x20, s24 = fp - 0x24, s78 = fp - 0x78, s98 = fp - 0x98, sf0 = fp - 0xf0, s10d = fp - 0x10d, s110 = fp - 0x110, s180 = fp - 0x180, s188 = fp - 0x188, s1a8 = fp - 0x1a8, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s228 = fp - 0x228, s230 = fp - 0x230, s238 = fp - 0x238, s240 = fp - 0x240, s248 = fp - 0x248, s250 = fp - 0x250, s258 = fp - 0x258, s260 = fp - 0x260, s268 = fp - 0x268, s270 = fp - 0x270, s278 = fp - 0x278
	let v, ad, af, ah, am, au, av, bl, bm, bo, bp, du: u64
	st64(s250, d)
	st64(s238, c)
	st64(s248, a)
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	let g = 0x48 > f
	let h = g != 0 ? 0 : f - 0x48
	let i = 0x300007fb8
	if (f != 0) {
		h = h & -8
		i = h
	}
	if (0x300000008 > i) {
		raw_vec_handle_error(8, 0x48, h, i, g)
	}
	B93: {
		st64(0x300000000 /* heap bump-allocator cursor */, i)
		st64(s228 + 0x10, i)
		st64(s1f8, 3, i, 0)
		st64(s240, ld64(b + 8))
		const j = ld64(b + 0x10)
		st64(s230, j)
		if (j != 0) {
			let r = ld64(s230) * 0x30
			st64(s228 + 0x18, 0)
			st64(s228, ld64(ld64(s238)))
			let q = ld64(s240)
			do {
				B6: {
					const s = memcmp(ld64(q + 0x18), 0x100152180, 0x20)
					i = undef
					g = undef
					if ((s as u32) == 0) {
						const t = fn_143248(q, undef, undef, i, g)
						h = undef
						i = undef
						g = undef
						if (t != 0) {
							break B6
						}
					}
					st64(s228 + 8, r)
					const u = ld64(ld64(s228))
					copyr(s98, u, 0x20)
					v = fn_5d748(s110, q, s98, i, g)
					i = undef
					g = undef
					const n = ld64(s10d + 0xd)
					const o = ld64(s10d + 5)
					const p = ld64(s110)
					if (p == 0) {
						const ac = ld64(s248)
						st64(ac + 0x10, n)
						st64(ac + 8, o)
						st64(ac, 0x8000000000000000)
						du = ld64(s228 + 0x18)
						break B93
					}
					let k = ld64(s228 + 0x18)
					let l = ld64(s228 + 0x10)
					if (k == ld64(s1f8)) {
						fn_ed90(s1f8, l, v)
						i = undef
						g = undef
						k = ld64(s228 + 0x18)
						l = ld64(s1f8 + 8)
					}
					st64(s228 + 0x10, l)
					const m = l + k * 0x18
					st64(m + 0x10, n)
					st64(m + 8, o)
					st64(m, p)
					h = k + 1
					st64(s228 + 0x18, h)
					st64(s1f8 + 0x10, h)
					r = ld64(s228 + 8)
				}
				q = q + 0x30
				r = r - 0x30
			} while (r != 0)
		}
		const w = ld64(s238)
		const x = ld16(w + 0x284)
		if (x == 0) {
			st64(s98, 0x100159c98, 1, 8, 0, 0)
			// fmt "Divisor must be positive."
			fn_149478(s98, 0x100159ca8, h, i, g)
		}
		const y = ld32(w + 0x280)
		const z = fn_151b50(y as i32, (x * 0x58) as i32)
		const aa = 1 > (y as i32)
		const ab = (((y as i32) - z * (x * 0x58)) as u32) != 0
		if (ld64(s250) != 0) {
			st64(s110, 0xffffffff00000000)
			ad = 0
			ah = 0xffffffff
			am = 0xfffffffe
			st32(s10d + 5, -2)
		} else if ((((z - (aa & ab) + 1) * (x * 0x58)) as i32) > (((y as i32) + x) as i32)) {
			st64(s110, 0x100000000)
			ad = 0
			ah = 1
			am = 2
			st32(s10d + 5, 2)
		} else {
			st64(s110, 0x200000001)
			ad = 1
			ah = 2
			am = 3
			st32(s10d + 5, 3)
		}
		B48: {
			B30: {
				st64(s228 + 0x18, z - (aa & ab))
				const ae = (ad + (z - (aa & ab))) * (x * 0x58)
				af = ae as i32
				if (0xfff27617 > ((ae - 0x6c4f5) as u32)) {
					if (-0x6c4f4 >= (af as i64)) {
						av = 4
						au = 0
						if (((0x6c4f4 % (x * 0x58) - x * 0x58 - 0x6c4f4) as u32) == (af as u32)) {
							break B30
						}
					}
				} else {
					const ag = fn_151bf8(af, x * 0x58)
					av = 4
					au = 0
					if (ag == 0) {
						break B30
					}
				}
				const ai = (ah + ld64(s228 + 0x18)) * (x * 0x58)
				af = ai as i32
				if (0xfff27617 > ((ai - 0x6c4f5) as u32)) {
					if (-0x6c4f4 >= (af as i64)) {
						av = 8
						au = 0
						const ak = 0x6c4f4 % (x * 0x58) - x * 0x58 - 0x6c4f4
						const al = af << 0x20
						af = ak
						if ((ak as u32) == (al >> 0x20)) {
							break B30
						}
					}
				} else {
					const aj = fn_151bf8(af, x * 0x58)
					av = 8
					au = 0
					if (aj == 0) {
						break B30
					}
				}
				const an = (am + ld64(s228 + 0x18)) * (x * 0x58)
				af = an as i32
				if (0xfff27617 > ((an - 0x6c4f5) as u32)) {
					if (-0x6c4f4 >= (af as i64)) {
						av = 0xc
						au = 1
						const bf = 0x6c4f4 % (x * 0x58) - x * 0x58 - 0x6c4f4
						const bg = af << 0x20
						af = bf
						if ((bf as u32) == (bg >> 0x20)) {
							break B30
						}
					}
				} else {
					const ao = fn_151bf8(af, x * 0x58)
					av = 0xc
					au = 1
					if (ao == 0) {
						break B30
					}
				}
				bm = 4
				bl = 0
				break B48
			}
			const ap = ld64(0x300000000 /* heap bump-allocator cursor */)
			let aq = 0x10 > ap
			let ar = aq != 0 ? 0 : ap - 0x10
			let at = 0x300007ff0
			if (ap != 0) {
				ar = ar & -4
				at = ar
			}
			if (0x300000008 > at) {
				raw_vec_handle_error(4, 0x10, 0x300000008, ar, at)
			}
			B44: {
				st64(0x300000000 /* heap bump-allocator cursor */, at)
				st32(at, af)
				st64(s228, at)
				st64(s98 + 8, at)
				st64(s228 + 8, 1)
				st64(s98 + 0x10, 1)
				st64(s98, 4)
				let ba = ld64(s228 + 0x18)
				if (au == 0) {
					st64(s228 + 8, 1)
					st64(s228 + 0x10, 0x6c4f4 % (x * 0x58) - x * 0x58)
					L35: while (true) {
						let az = av
						while (true) {
							B38: {
								const bb = (ld32(s110 + az) + ba) * (x * 0x58)
								let aw = bb as i32
								if (0xfff27617 > ((bb - 0x6c4f5) as u32)) {
									if ((aw as i64) > -0x6c4f4) {
										break B38
									}
									const ax = ld64(s228 + 0x10)
									const ay = aw << 0x20
									aw = ax - 0x6c4f4
									if (((ax - 0x6c4f4) as u32) != (ay >> 0x20)) {
										break B38
									}
								} else {
									aq = fn_151bf8(aw, x * 0x58)
									at = undef
									ba = ld64(s228 + 0x18)
									if (aq != 0) {
										break B38
									}
								}
								let bc = ld64(s228 + 8)
								let bd = ld64(s228)
								if (bc == ld64(s98)) {
									aq = fn_e7f8(s98, bc, 1, ba, at, aq)
									bc = ld64(s228 + 8)
									ba = ld64(s228 + 0x18)
									bd = ld64(s98 + 8)
								}
								av = az + 4
								at = bc << 2
								st64(s228, bd)
								st32(bd + at, aw)
								const be = bc + 1
								st64(s228 + 8, be)
								st64(s98 + 0x10, be)
								if (az != 8) {
									continue L35
								}
								break B44
							}
							az = az + 4
							if (az == 0xc) {
								break B44
							}
						}
					}
				}
			}
			bm = ld64(s98 + 8)
			bl = ld64(s228 + 8)
		}
		const bh = ld64(0x300000000 /* heap bump-allocator cursor */)
		let bi = bh - 0x168
		let bj = bi > bh
		let bk = bh != 0 ? (bj != 0 ? 0 : bi) & -8 : 0x300007e98
		if (0x300000007 >= bk) {
			raw_vec_handle_error(8, 0x168, bi, bj, bl)
		}
		B68: {
			st64(0x300000000 /* heap bump-allocator cursor */, bk)
			st64(s1e0 + 8, bk)
			bo = 0
			bp = ld64(s1f8 + 0x10)
			st64(s1d0, 0, 0)
			st64(s1e0, 3)
			if (bl != 0) {
				bl = bl << 2
				st64(s268, bm + bl)
				let bn = 3
				st64(s258, 0)
				st64(s278, s10d)
				st64(s270, ld64(s1f8 + 8))
				st64(s230, ld64(s230) * 0x30)
				st64(s260, ld64(ld64(s238)))
				L52: while (true) {
					st64(s250, bn)
					st64(s238, bk)
					st64(s228, bm + 4, bm, bo, bp)
					if (bp != 0) {
						const bq = ld64(s228 + 0x18)
						let br = ld64(s270)
						const bw = br + bq * 0x18
						const bs = ld32(ld64(s228 + 8))
						let bv = bq * 0x18 - 0x18
						do {
							const bt = ld64(ld64(br + 8) + 0x20)
							const bu = callx(bt, ld64(br), bt, bi, bj, bl)
							bi = undef
							bj = undef
							bl = undef
							if ((bu as u32) == bs) {
								copyr(s1c0, br, 0x18)
								const ci = memmove(br, br + 0x18, bv)
								const cg = ld64(s278)
								st64(cg + 0x10, ld64(s1c0 + 0x10))
								st64(cg + 8, ld64(s1c0 + 8))
								st64(cg, ld64(s1c0))
								let ch = ld64(s228 + 0x10)
								bk = ld64(s238)
								bn = ld64(s250)
								if (ch == bn) {
									fn_e248(s1e0, cg, ci)
									bk = ld64(s1e0 + 8)
									st64(s258, ld64(s1d0))
									bn = ld64(s1e0)
									ch = ld64(s1d0 + 8)
								}
								const cj = ld64(s258) + ch
								const ck = ld64(s228 + 0x18)
								const cl = bk + (cj - (bn > cj ? 0 : bn)) * 0x78
								st8(cl + 4, 2)
								copy(cl + 5, s110, 0x18)
								st32(cl + 0x1c, ld32(s10d + 0x14))
								memcpy(cl + 0x20, s98, 0x58)
								bj = undef
								bl = undef
								bp = ck - 1
								bo = ch + 1
								st64(s1d0 + 8, bo)
								bi = ld64(s228)
								bm = bi
								if (bi == ld64(s268)) {
									break B68
								}
								continue L52
							}
							bv = bv - 0x18
							br = br + 0x18
						} while (br != bw)
					}
					const bx = ld32(ld64(s228 + 8))
					st32(s24, bx)
					const by = ld64(ld64(s260))
					copyr(s20, by, 0x20)
					st64(s188, 0, 1, 0)
					st64(s78, s188, 0x100159480)
					st8(s78 + 0x18, 3)
					st64(s78 + 0x10, 0x20)
					st64(s98 + 0x10, 0)
					st64(s98, 0)
					if (imp_fmt(s24, s98) == 0) {
						copyr(sf0, s180, 0x10)
						st64(s110, 0x100152e25, 0xa, s20, 0x20)
						st64(s188, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
						// PDA find_program_address(["tick_array", *s20, ?], program *s188)
						Pubkey_find_program_address(s98, s110, 3, s188)
						bj = undef
						bl = undef
						copyr(s1a8, s98, 0x20)
						let bz = ld64(s230)
						let ca = ld64(s240)
						bo = ld64(s228 + 0x10)
						while (true) {
							if (bz == 0) {
								bp = ld64(s228 + 0x18)
								break B68
							}
							const cb = ld64(ca)
							copyr(s98, cb, 0x20)
							const cc = memcmp(s98, s1a8, 0x20)
							bj = undef
							bl = undef
							bz = bz - 0x30
							ca = ca + 0x30
							if ((cc as u32) == 0) {
								bn = ld64(s1e0)
								if (bo == bn) {
									fn_e248(s1e0, undef, cc as u32)
									bn = ld64(s1e0)
									bo = ld64(s1d0 + 8)
								}
								const cd = ld64(s1d0)
								st64(s258, cd)
								const ce = cd + bo
								bk = ld64(s1e0 + 8)
								const cf = bk + (ce - (bn > ce ? 0 : bn)) * 0x78
								st32(cf, bx)
								memset(cf + 4, 0, 0x71)
								bj = undef
								bl = undef
								bo = bo + 1
								st64(s1d0 + 8, bo)
								bi = ld64(s228)
								bm = bi
								bp = ld64(s228 + 0x18)
								if (bi == ld64(s268)) {
									break B68
								}
								continue L52
							}
						}
					}
					fn_149678("a Display implementation returned an error unexpectedly", 0x37, s110, 0x1001594b0, 0x1001594d0)
				}
			}
		}
		st64(s228 + 0x18, bp)
		if (bo != 0) {
			const cm = ld64(s1d0)
			let cn = ld64(s1e0)
			const cr = cn > cm + 1 ? 0 : cn
			const co = ld64(s1e0 + 8)
			const cp = co + cm * 0x78
			const cq = ld8(cp + 4)
			st64(s228, cq)
			if (cq == 3) {
				fn_1490e8(0x10015a198, cp, cq, bj, bl)
			}
			let cs = cm + 1 - cr
			st64(s228 + 0x10, bo)
			st64(s230, ld32(cp))
			memcpy(s188, cp + 5, 0x73)
			if (bo != 1) {
				const ct = co + cs * 0x78
				st64(s238, ld8(ct + 4))
				st64(s250, ld32(ct))
				memcpy(s110, ct + 5, 0x73)
				const cu = cs + 1
				bl = 0
				cs = cu - (cn > cu ? 0 : cn)
				st64(s228 + 8, 3)
				const cv = ld64(s228 + 0x10)
				if (cv != 2) {
					const cw = co + cs * 0x78
					st64(s228 + 8, ld8(cw + 4))
					st64(s258, ld32(cw))
					memcpy(s98, cw + 5, 0x73)
					const cx = cs + 1
					cs = cx - (cn > cx ? 0 : cn)
					bl = cv - 3
				}
			} else {
				st64(s238, 3)
				bl = 0
				st64(s228 + 8, 3)
			}
			const cy = ld64(0x300000000 /* heap bump-allocator cursor */)
			bj = 0x168 > cy
			bi = cy != 0 ? (bj != 0 ? 0 : cy - 0x168) & -8 : 0x300007e98
			st64(s240, bl)
			if (0x300000008 > bi) {
				raw_vec_handle_error(8, 0x168, bi, bj, bl)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, bi)
			st8(bi + 4, ld64(s228))
			st32(bi, ld64(s230))
			st64(s228 + 0x10, bi)
			v = memcpy(bi + 5, s188, 0x73)
			let dc = 1
			const cz = ld64(s238)
			if ((cz as u8) != 3) {
				const da = ld64(s228 + 0x10)
				st8(da + 0x7c, cz)
				st32(da + 0x78, ld64(s250))
				v = memcpy(da + 0x7d, s110, 0x73)
				dc = 2
			}
			const db = ld64(s228 + 8)
			if ((db as u8) != 3) {
				const dd = ld64(s228 + 0x10) + dc * 0x78
				st8(dd + 4, db)
				st32(dd, ld64(s258))
				v = memcpy(dd + 5, s98, 0x73)
				dc = dc + 1
			}
			const de = ld64(s248)
			st64(de + 0x10, dc)
			st64(de + 8, ld64(s228 + 0x10))
			st64(de, 3)
			let dq = ld64(s228 + 0x18)
			const df = ld64(s240)
			if (df != 0) {
				const dg = cn > cs ? 0 : cn
				const di = cs - dg
				const dh = cn
				const dj = df - (cn - di)
				v = dj > df
				let dp = v != 0 ? 0 : dj
				cn = df > cn - di ? cn : di + df
				if (cn != di) {
					let dl = cn - di
					let dk = cs * 0x78 - dg * 0x78 + co + 0x18
					do {
						if (ld8(dk - 0x14) == 2) {
							const dm = ld64(dk)
							st64(dm, ld64(dm) + 1)
						}
						dk = dk + 0x78
						dl = dl - 1
					} while (dl != 0)
				}
				dq = ld64(s228 + 0x18)
				if (df > dh - di) {
					let dn = co + 0x18
					do {
						if (ld8(dn - 0x14) == 2) {
							const dr = ld64(dn)
							st64(dr, ld64(dr) + 1)
						}
						dn = dn + 0x78
						dp = dp - 1
					} while (dp != 0)
				}
			}
			if (dq == 0) {
				return v
			}
			let dx = ld64(s1f8 + 8) + 0x10
			while (true) {
				const dy = ld64(dx)
				st64(dy, ld64(dy) + 1)
				dx = dx + 0x18
				dq = dq - 1
				if (dq == 0) {
					return v
				}
			}
		}
		v = fn_87630(s208, 0x17)
		du = ld64(s228 + 0x18)
		const dt = ld64(s208)
		const ds = ld64(s248)
		st64(ds + 0x10, ld64(s208 + 8))
		st64(ds + 8, dt)
		st64(ds, 0x8000000000000000)
	}
	if (du == 0) {
		return v
	}
	let dv = ld64(s1f8 + 8) + 0x10
	while (true) {
		const dw = ld64(dv)
		st64(dw, ld64(dw) + 1)
		dv = dv + 0x18
		du = du - 1
		if (du == 0) {
			return v
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), a (points to it), b (points to it), p5 (value), p6 (value)
export function fn_643d0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s28 = fp - 0x28, s30 = fp - 0x30, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48
	let q, am: u64
	st64(s28, d)
	let o = c
	let h = a
	const f = ld64(b + 0x10)
	let g = p6
	st64(s30, f)
	if (g >= f) {
		o = fn_87630(s20, 0x26)
		q = ld64(s20)
		st64(h + 0x10, ld64(s20 + 8))
		st64(h + 8, q)
		st64(h, 1)
		return o
	}
	st64(s48, h)
	const j = ld64(b + 8)
	const i = g
	let l = j + g * 0x78
	if (p5 != 0) {
		st64(s38, ld64(s30) - 1)
		let aa = i * 0x78 + j + 0x78
		while (true) {
			let ac = ld64(l + 0x10)
			const ab = ld8(l + 4)
			ac = ab != 2 ? 0x10015a128 : ac
			let ad = ld64(l + 8)
			ad = ab != 2 ? l : ad
			o = callx(ld64(ac + 0x30), s10, ad, o, ld64(s28), 1)
			q = ld64(s10)
			if (q != 2) {
				h = ld64(s48)
				st64(h + 0x10, ld64(s10 + 8))
				st64(h + 8, q)
				st64(h, 1)
				return o
			}
			am = ld32(s10 + 0xc)
			if (ld32(s10 + 8) != 0) {
				h = ld64(s48)
				st32(h + 0x10, am)
				st64(h + 8, g)
				st64(h, 0)
				return o
			}
			let ag = ld64(l + 8)
			const ae = ld8(l + 4)
			ag = ae != 2 ? l : ag
			let af = ld64(l + 0x10)
			af = ae != 2 ? 0x10015a128 : af
			const ah = ld64(af + 0x58)
			o = callx(ah, ag, ah, af)
			if (o != 0) {
				h = ld64(s48)
				st64(h + 8, g)
				st32(h + 0x10, 0xfffffffffff93b0c)
				st64(h, 0)
				return o
			}
			let ak = ld64(l + 8)
			const ai = ld8(l + 4)
			ak = ai != 2 ? l : ak
			let aj = ld64(l + 0x10)
			aj = ai != 2 ? 0x10015a128 : aj
			const al = ld64(aj + 0x20)
			o = callx(al, ak, al, aj)
			if (ld64(s38) == g) {
				h = ld64(s48)
				st32(h + 0x10, o)
				st64(h + 8, g)
				st64(h, 0)
				return o
			}
			l = ld64(s30) > g + 1 ? aa : 0
			g = g + 1
			aa = aa + 0x78
			o = o - 1
		}
	}
	st64(s38, (ld64(s28) as u16) * 0x58)
	let k = i * 0x78 + j
	st64(s40, ld64(s30) - 1)
	while (true) {
		k = k + 0x78
		let n = ld64(l + 0x10)
		const m = ld8(l + 4)
		n = m != 2 ? 0x10015a128 : n
		let p = ld64(l + 8)
		p = m != 2 ? l : p
		o = callx(ld64(n + 0x30), s10, p, o, ld64(s28), 0)
		q = ld64(s10)
		if (q != 2) {
			h = ld64(s48)
			st64(h + 0x10, ld64(s10 + 8))
			st64(h + 8, q)
			st64(h, 1)
			return o
		}
		am = ld32(s10 + 0xc)
		if (ld32(s10 + 8) != 0) {
			h = ld64(s48)
			st32(h + 0x10, am)
			st64(h + 8, g)
			st64(h, 0)
			return o
		}
		let t = ld64(l + 8)
		const r = ld8(l + 4)
		t = r != 2 ? l : t
		let s = ld64(l + 0x10)
		s = r != 2 ? 0x10015a128 : s
		const u = ld64(s + 0x60)
		o = callx(u, t, ld64(s28), u)
		if (o != 0) {
			h = ld64(s48)
			st64(h + 8, g)
			st32(h + 0x10, 0x6c4f4)
			st64(h, 0)
			return o
		}
		let x = ld64(l + 8)
		const v = ld8(l + 4)
		x = v != 2 ? l : x
		let w = ld64(l + 0x10)
		w = v != 2 ? 0x10015a128 : w
		const y = ld64(w + 0x20)
		const z = callx(y, x, y, w)
		o = z + ld64(s38) - 1
		if (ld64(s40) == g) {
			h = ld64(s48)
			st32(h + 0x10, o)
			st64(h + 8, g)
			st64(h, 0)
			return o
		}
		l = ld64(s30) > g + 1 ? k : 0
		g = g + 1
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p9 (value), p10 (value), p11 (value)
// types [heur]: p6: TokenAccount (every call passes one: fn_36bf8, fn_386c8); p7: TokenAccount (every call passes one: fn_36bf8, fn_386c8)
export function fn_64930(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: TokenAccount, p7: TokenAccount, p8: u64, p9: u64, p10: u64, p11: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	const f = p9
	let z = ld64(f + 0x1c8)
	let y = ld64(f + 0x40)
	let x = ld64(f + 0x38)
	const j = ld64(f + 0x20)
	const i = ld64(f + 0x18)
	const h = ld32(f + 0x1d0)
	const g = ld64(f + 0x30)
	st64(b + 0x238, ld64(f + 0x28))
	st64(b + 0x240, g)
	st32(b + 0x280, h)
	st64(b + 0x228, i, j)
	memcpy(b + 8, f + 0x48, 0x180)
	st64(b + 0x278, p11)
	const k = p10
	const l = k != 0 ? 0x248 : 0x258
	st64(b + l, x, y)
	const m = k != 0 ? 0x268 : 0x270
	st64(b + m, ld64(b + m) + z)
	const o = ld64(f + 8)
	let n = ld64(f)
	const w = n
	n = k != 0 ? n : o
	const p = p5
	y = p
	z = o
	const s: TokenAccount = p7
	const r: TokenAccount = p6
	const q = p8
	x = s
	let v = fn_64c60(s10, c, k != 0 ? d : p, k != 0 ? r : s, q, n)
	let u = ld64(s10 + 8)
	let t = ld64(s10)
	if (t != 2) {
		st64(a + 8, u)
		st64(a, t)
		return v
	}
	v = fn_652d0(s20, b, k != 0 ? x : r, k != 0 ? y : d, q, k != 0 ? z : w)
	u = ld64(s20 + 8)
	t = ld64(s20)
	if (t == 2) {
		st64(a + 8, u)
		st64(a, 2)
		return v
	}
	st64(a + 8, u)
	st64(a, t)
	return v
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value), d (value), p6 (value)
export function fn_64c60(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s10 = fp - 0x10, s18 = fp - 0x18, s40 = fp - 0x40, s48 = fp - 0x48, s70 = fp - 0x70, s78 = fp - 0x78, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sd0 = fp - 0xd0, se8 = fp - 0xe8, sf8 = fp - 0xf8
	let ar = b
	const f: AccountInfo = ld64(p5)
	const g: LamportsCell = f.lamports
	const h = f.key
	rc_inc(g)
	const i: DataCell = f.data
	const n = p6
	rc_inc(i)
	const j: AccountInfo = ld64(c)
	const k: LamportsCell = j.lamports
	const an = f.executable
	const ao = f.is_writable
	const ap = f.is_signer
	const aq = f.rent_epoch
	const m = f.owner
	const am = j.key
	rc_inc(k)
	const l: DataCell = j.data
	rc_inc(l)
	const o: AccountInfo = ld64(d)
	const p: LamportsCell = o.lamports
	const ah = j.executable
	const ai = j.is_writable
	const aj = j.is_signer
	const ak = j.rent_epoch
	const al = j.owner
	const r = o.key
	rc_inc(p)
	const q: DataCell = o.data
	rc_inc(q)
	const s: AccountInfo = ld64(ar)
	const t: LamportsCell = s.lamports
	ar = p
	const ad = o.executable
	const ae = o.is_writable
	const af = o.is_signer
	const ag = o.rent_epoch
	const aa = o.owner
	const u = s.key
	rc_inc(t)
	const v: DataCell = s.data
	rc_inc(v)
	const z = s.owner
	const y = s.rent_epoch
	const x = s.is_signer
	const w = s.is_writable
	st8(s18 + 2, s.executable)
	st8(s18, x, w)
	st64(s40, u, t, v, z, y)
	st8(s48, af, ae, ad)
	st64(s70, r, ar, q, aa, ag)
	st8(s78, aj, ai, ah)
	st64(sa0, am, k, l, al, ak)
	st8(sa8, ap, ao, an)
	st64(sd0, h, g, i, m, aq)
	st64(s10, 8, 0)
	st64(se8, 0, 8, 0)
	const ac = fn_1269b8(sf8, se8, n)
	const ab = ld64(sf8)
	st64(a + 8, ld64(sf8 + 8))
	st64(a, ab)
	return ac
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), p6 (value)
export function fn_652d0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s60 = fp - 0x60, s70 = fp - 0x70, s88 = fp - 0x88, sb0 = fp - 0xb0, sb8 = fp - 0xb8, se0 = fp - 0xe0, se8 = fp - 0xe8, s110 = fp - 0x110, s118 = fp - 0x118, s140 = fp - 0x140, s158 = fp - 0x158, s168 = fp - 0x168
	const f: AccountInfo = ld64(p5)
	const g: LamportsCell = f.lamports
	const s = f.key
	rc_inc(g)
	const h: DataCell = f.data
	const aq = p6
	rc_inc(h)
	const i: AccountInfo = ld64(c)
	const j: LamportsCell = i.lamports
	const am = f.executable
	const an = f.is_writable
	const ao = f.is_signer
	const ap = f.rent_epoch
	const r = f.owner
	const l = i.key
	rc_inc(j)
	const k: DataCell = i.data
	rc_inc(k)
	const m: AccountInfo = ld64(d)
	const n: LamportsCell = m.lamports
	const ai = i.executable
	const aj = i.is_writable
	const ak = i.is_signer
	const al = i.rent_epoch
	const q = i.owner
	const p = m.key
	rc_inc(n)
	const o: DataCell = m.data
	rc_inc(o)
	const t: AccountInfo = ld64(b)
	const u: LamportsCell = t.lamports
	const af = m.executable
	const ag = m.is_writable
	const ah = m.is_signer
	const v = m.rent_epoch
	const ab = m.owner
	const ae = t.key
	rc_inc(u)
	const w: DataCell = t.data
	rc_inc(w)
	const aa = t.owner
	const z = t.rent_epoch
	const y = t.is_signer
	const x = t.is_writable
	st8(s88 + 2, t.executable)
	st8(s88, y, x)
	st64(sb0, ae, u, w, aa, z)
	st8(sb8, ah, ag, af)
	st64(se0, p, n, o, ab, v)
	st8(se8, ak, aj, ai)
	st64(s110, l, j, k, q, al)
	st64(s70, s60, 6, 0x100152b28, 9, b + 0x188, 0x20, b + 0x1a8, 0x20, b + 0x1e8, 0x20, b + 0x286, 2, b + 0x28c, 1)
	st64(s88 + 8, s70)
	st8(s118, ao, an, am)
	st64(s140, s, g, h, r, ap)
	st64(s88 + 0x10, 1)
	st64(s158, 0, 8, 0)
	const ad = fn_1269b8(s168, s158, aq)
	const ac = ld64(s168)
	st64(a + 8, ld64(s168 + 8))
	st64(a, ac)
	return ad
}

export function fn_65a18(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s48 = fp - 0x48, s50 = fp - 0x50, s78 = fp - 0x78, s80 = fp - 0x80, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sd0 = fp - 0xd0, sd8 = fp - 0xd8, sf0 = fp - 0xf0, s120 = fp - 0x120, s138 = fp - 0x138, s140 = fp - 0x140, s158 = fp - 0x158, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1000 = fp - 0x1000
	let at, bm, bw, bx: u64
	let cs = c
	const f: AccountInfo = ld64(p5)
	const g: LamportsCell = f.lamports
	const h = ld64(p6)
	const j = f.key
	let cu = h
	let cy = ld64(h)
	let cw = g
	rc_inc(g)
	const i: DataCell = f.data
	let cx = j
	rc_inc(i)
	const k: AccountInfo = ld64(d + 0x58)
	const l: LamportsCell = k.lamports
	let da = l
	const p = k.key
	rc_inc(l)
	const m: DataCell = k.data
	let cz = m
	let v = a
	let cv = i
	rc_inc(m)
	const n: AccountInfo = ld64(b)
	const o = n.key
	st64(s1000 + 0x20, ld8(d + 0x30))
	let cr = o
	st64(s1000, o, 8, 0, 1)
	fn_135c58(sd8, cy, cx, p, o, 8, 0, 1, ld64(s1000 + 0x20))
	copy(s170, sd0, 0x18)
	const q = ld64(sd8)
	if (q == 0x8000000000000000) {
		bx = fn_13b430(s1b0, s170)
		bm = ld64(s1b0 + 8)
		bw = ld64(s1b0)
	} else {
		memcpy(s120, sb8, 0x30)
		st64(s140, q)
		copy(s138, s170, 0x18)
		const r: AccountInfo = cu
		const s = ld64(cu + 8)
		const u = ld64(cu)
		rc_inc(s)
		const t: DataCell = r.data
		let ct = u
		rc_inc(t)
		const y = v
		const w: LamportsCell = f.lamports
		cx = w
		let cl = f.key
		let cm = r.executable
		let cn = r.is_writable
		let co = r.is_signer
		let cp = r.rent_epoch
		let cq = r.owner
		rc_inc(w)
		const x: DataCell = f.data
		let ck = t
		rc_inc(x)
		const z: LamportsCell = k.lamports
		let ce = k.key
		let cf = f.executable
		let cg = f.is_writable
		let ch = f.is_signer
		let ci = f.rent_epoch
		let cj = f.owner
		rc_inc(z)
		const aa: DataCell = k.data
		let cd = x
		rc_inc(aa)
		const ab: LamportsCell = n.lamports
		const by = n.key
		const bz = k.executable
		const ca = k.is_writable
		const cb = k.is_signer
		const cc = k.rent_epoch
		const ah = k.owner
		rc_inc(ab)
		const ac: DataCell = n.data
		rc_inc(ac)
		const ag = n.owner
		const af = n.rent_epoch
		const ae = n.is_signer
		const ad = n.is_writable
		st8(s20 + 2, n.executable)
		st8(s20, ae, ad)
		st64(s48, by, ab, ac, ag, af)
		st8(s50, cb, ca, bz)
		st64(s78, ce, z, aa, ah, cc)
		st8(s80, ch, cg, cf)
		st64(sa8, cl, cx, cd, cj, ci)
		st8(sb0, co, cn, cm)
		st64(sd8, ct, s, ck, cq, cp)
		st64(s1000, 8, 0)
		const ai = fn_1390d8(s158, s140, sd8, 4, fp)
		if (ld64(s158) == 0x800000000000001a /* Ok */) {
			ptr_drop_in_place_c1b0(sd8, ai)
			const aj = da
			v = y
			const am = cv
			const al = cw
			const ak = cz
			if (rc_release(da)) {
				st64(aj + 8, ld64(aj + 8) - 1)
			}
			rc_dec(ak)
			rc_dec(al)
			rc_dec(am)
			const an: LamportsCell = f.lamports
			const aw = f.key
			rc_inc(an)
			const au: DataCell = f.data
			cz = an
			da = au
			rc_inc(au)
			const av: AccountInfo = ld64(cs)
			const ax = av.key
			st64(s1000, cr, 8, 0)
			fn_135660(sd8, cy, aw, ax, cr, 8, 0)
			copy(sf0, sd0, 0x18)
			const ay = ld64(sd8)
			if (ay == 0x8000000000000000) {
				bx = fn_13b430(s1a0, sf0)
				bm = ld64(s1a0 + 8)
				bw = ld64(s1a0)
			} else {
				memcpy(s120, sb8, 0x30)
				st64(s140, ay)
				copy(s138, sf0, 0x18)
				const az: AccountInfo = cu
				const ba = ld64(cu + 8)
				const bh = ld64(cu)
				rc_inc(ba)
				const bb: DataCell = az.data
				rc_inc(bb)
				const bc: LamportsCell = f.lamports
				ct = f.key
				cv = az.executable
				cw = az.is_writable
				cx = az.is_signer
				cy = az.rent_epoch
				const bl = az.owner
				rc_inc(bc)
				const bd: DataCell = f.data
				cu = bc
				rc_inc(bd)
				const be: LamportsCell = av.lamports
				cs = bb
				cn = av.key
				co = f.executable
				cp = f.is_writable
				cq = f.is_signer
				cr = f.rent_epoch
				const bg = f.owner
				rc_inc(be)
				const bf: DataCell = av.data
				cm = bg
				rc_inc(bf)
				ck = bh
				cl = ba
				const bi: LamportsCell = n.lamports
				cf = n.key
				cg = av.executable
				ch = av.is_writable
				ci = av.is_signer
				cj = av.rent_epoch
				const bk = av.owner
				rc_inc(bi)
				ce = bd
				const bj: DataCell = n.data
				cd = bl
				rc_inc(bj)
				const bq = n.owner
				const bp = n.rent_epoch
				const bo = n.is_signer
				const bn = n.is_writable
				bm = n.executable
				st8(s20, bo, bn, bm)
				st64(s48, cf, bi, bj, bq, bp)
				st8(s50, ci, ch, cg)
				st64(s78, cn, be, bf, bk, cj)
				st8(s80, cq, cp, co)
				st64(sa8, ct, cu, ce, cm, cr)
				st8(sb0, cx, cw, cv)
				st64(sd8, ck, cl, cs, cd, cy)
				st64(s1000, 8, 0)
				const br = fn_1390d8(s158, s140, sd8, 4, fp)
				if (ld64(s158) == 0x800000000000001a /* Ok */) {
					bx = ptr_drop_in_place_c1b0(sd8, br)
					const bs = cz
					v = y
					if (rc_release(cz)) {
						st64(bs + 8, ld64(bs + 8) - 1)
					}
					const bt = da
					if (!rc_release(da)) {
						st64(v + 8, bm)
						st64(v, 2)
						return bx
					}
					st64(bt + 8, ld64(bt + 8) - 1)
					st64(v + 8, bm)
					st64(v, 2)
					return bx
				}
				copyr(s18, s158, 0x18)
				const bu = fn_13b430(s190, s18)
				bm = ld64(s190 + 8)
				bw = ld64(s190)
				bx = ptr_drop_in_place_c1b0(sd8, bu)
				v = y
			}
			const bv = cz
			at = da
			if (rc_release(cz)) {
				st64(bv + 8, ld64(bv + 8) - 1)
			}
			if (!rc_release(at)) {
				st64(v + 8, bm)
				st64(v, bw)
				return bx
			}
			st64(at + 8, ld64(at + 8) - 1)
			st64(v + 8, bm)
			st64(v, bw)
			return bx
		}
		copyr(s18, s158, 0x18)
		const ao = fn_13b430(s180, s18)
		bm = ld64(s180 + 8)
		bw = ld64(s180)
		bx = ptr_drop_in_place_c1b0(sd8, ao)
		v = y
	}
	at = cv
	const ar = cw
	const aq = cz
	const ap = da
	if (rc_release(da)) {
		st64(ap + 8, ld64(ap + 8) - 1)
	}
	rc_dec(aq)
	rc_dec(ar)
	if (!rc_release(at)) {
		st64(v + 8, bm)
		st64(v, bw)
		return bx
	}
	st64(at + 8, ld64(at + 8) - 1)
	st64(v + 8, bm)
	st64(v, bw)
	return bx
}

export function fn_68310(a: u64, b: u64, c: AccountInfo, d: AccountInfo, e: AccountInfo): u64 {
	const s18 = fp - 0x18, s78 = fp - 0x78, s88 = fp - 0x88, s90 = fp - 0x90, sb8 = fp - 0xb8, sc0 = fp - 0xc0, se8 = fp - 0xe8, sf0 = fp - 0xf0, s118 = fp - 0x118, s120 = fp - 0x120, s128 = fp - 0x128, s140 = fp - 0x140, s148 = fp - 0x148, s150 = fp - 0x150, s168 = fp - 0x168, s198 = fp - 0x198, s1b0 = fp - 0x1b0, s1b8 = fp - 0x1b8, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s1000 = fp - 0x1000
	let ak, al, an, ao: u64
	const f: LamportsCell = c.lamports
	const h = c.key
	let bf = e.key
	rc_inc(f)
	const g: DataCell = c.data
	let be = h
	rc_inc(g)
	const i: LamportsCell = d.lamports
	const r = d.key
	rc_inc(i)
	const j: DataCell = d.data
	rc_inc(j)
	const k: AccountInfo = ld64(b)
	const l: LamportsCell = k.lamports
	const q = k.key
	rc_inc(l)
	const m: DataCell = k.data
	rc_inc(m)
	const n: LamportsCell = k.lamports
	const p = k.key
	rc_inc(n)
	const o: DataCell = k.data
	rc_inc(o)
	st64(s150, p)
	st64(s1000, q, s150, 1, 1)
	fn_135038(s148, bf, be, r, q, s150, 1, 1)
	copy(s168, s140, 0x18)
	const s = ld64(s148)
	if (s == 0x8000000000000000) {
		fn_13b430(s1f0, s168)
		ak = ld64(s1f0 + 8)
		ao = ld64(s1f0)
	} else {
		memcpy(s198, s128, 0x30)
		st64(s1b8, s)
		copy(s1b0, s168, 0x18)
		const t: LamportsCell = c.lamports
		const aa = c.key
		rc_inc(t)
		const u: DataCell = c.data
		rc_inc(u)
		const v: LamportsCell = d.lamports
		const bb = d.key
		const bc = c.executable
		const bd = c.is_writable
		be = c.is_signer
		const x = c.rent_epoch
		const ae = c.owner
		rc_inc(v)
		const w: DataCell = d.data
		bf = w
		rc_inc(w)
		const y: LamportsCell = k.lamports
		const aw = k.key
		const ax = d.executable
		const ay = d.is_writable
		const az = d.is_signer
		const ba = d.rent_epoch
		const ac = d.owner
		rc_inc(y)
		const z: DataCell = k.data
		rc_inc(z)
		const ab: LamportsCell = e.lamports
		const ap = e.key
		const aq = k.executable
		const ar = k.is_writable
		const at = k.is_signer
		const au = k.rent_epoch
		const av = k.owner
		rc_inc(ab)
		const ad: DataCell = e.data
		rc_inc(ad)
		const ai = e.owner
		const ah = e.rent_epoch
		const ag = e.is_signer
		const af = e.is_writable
		st8(s90 + 2, e.executable)
		st8(s90, ag, af)
		st64(sb8, ap, ab, ad, ai, ah)
		st8(sc0, at, ar, aq)
		st64(se8, aw, y, z, av, au)
		st8(sf0, az, ay, ax)
		st64(s118, bb, v, bf, ac, ba)
		st8(s120, be, bd, bc)
		st64(s148, aa, t, u, ae, x)
		st64(s88, s78, 6, 0x100152b28, 9, b + 0x188, 0x20, b + 0x1a8, 0x20, b + 0x1e8, 0x20, b + 0x286, 2, b + 0x28c, 1)
		st64(s1000, s88, 1)
		const aj = fn_1390d8(s1d0, s1b8, s148, 4, fp)
		if (ld64(s1d0) == 0x800000000000001a /* Ok */) {
			ptr_drop_in_place_c1b0(s148, aj)
			an = a
			ak = m
			rc_dec(n)
			al = i
			rc_dec(o)
			rc_dec(l)
			rc_dec(ak)
			rc_dec(al)
			rc_dec(j)
			rc_dec(f)
			if (!rc_release(g)) {
				st64(an + 8, ak)
				st64(an, 2)
				return al
			}
			g.weak = g.weak - 1
			st64(an + 8, ak)
			st64(an, 2)
			return al
		}
		copyr(s18, s1d0, 0x18)
		const am = fn_13b430(s1e0, s18)
		ak = ld64(s1e0 + 8)
		ao = ld64(s1e0)
		ptr_drop_in_place_c1b0(s148, am)
	}
	an = a
	al = l
	rc_dec(n)
	rc_dec(o)
	rc_dec(al)
	rc_dec(m)
	rc_dec(i)
	rc_dec(j)
	rc_dec(f)
	if (!rc_release(g)) {
		st64(an + 8, ak)
		st64(an, ao)
		return al
	}
	g.weak = g.weak - 1
	st64(an + 8, ak)
	st64(an, ao)
	return al
}

export function fn_68db8(): u64 {
	const s18 = fp - 0x18, s88 = fp - 0x88, s148 = fp - 0x148, s1b8 = fp - 0x1b8, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f8 = fp - 0x1f8, s200 = fp - 0x200, s218 = fp - 0x218, s220 = fp - 0x220, s228 = fp - 0x228, s238 = fp - 0x238, s240 = fp - 0x240, s248 = fp - 0x248, s250 = fp - 0x250, s1000 = fp - 0x1000
	let g, h, j: u64
	const l = ld64(s250)
	const m = ld64(s248)
	const n = ld64(s240)
	const o = ld64(s238)
	const p = ld64(s228)
	const q = ld64(s220)
	const r = ld64(s218)
	const s = ld64(s200)
	const t = ld64(s1f8)
	st64(s88 + 0x38, 0x20)
	st64(s88 + 0x28, 0x20)
	st64(s88 + 0x18, 9)
	st64(s1000, s88, 1)
	const f = fn_1390d8(s1d0, s1b8, s148, 4, fp)
	if (ld64(s1d0) == 0x800000000000001a /* Ok */) {
		ptr_drop_in_place_c1b0(s148, f)
		j = o
		g = s
		rc_dec(l)
		h = r
		rc_dec(m)
		rc_dec(t)
		rc_dec(g)
		rc_dec(h)
		rc_dec(p)
		rc_dec(q)
		if (!rc_release(n)) {
			st64(j + 8, g)
			st64(j, 2)
			return h
		}
		st64(n + 8, ld64(n + 8) - 1)
		st64(j + 8, g)
		st64(j, 2)
		return h
	}
	copyr(s18, s1d0, 0x18)
	const i = fn_13b430(s1e0, s18)
	g = ld64(s1e0 + 8)
	const k = ld64(s1e0)
	ptr_drop_in_place_c1b0(s148, i)
	j = o
	h = t
	rc_dec(l)
	rc_dec(m)
	rc_dec(h)
	rc_dec(s)
	rc_dec(r)
	rc_dec(p)
	rc_dec(q)
	if (!rc_release(n)) {
		st64(j + 8, g)
		st64(j, k)
		return h
	}
	st64(n + 8, ld64(n + 8) - 1)
	st64(j + 8, g)
	st64(j, k)
	return h
}

export function fn_69330(a: u64, b: u64, c: AccountInfo, d: AccountInfo): u64 {
	const s18 = fp - 0x18, s78 = fp - 0x78, s88 = fp - 0x88, s90 = fp - 0x90, sb8 = fp - 0xb8, sc0 = fp - 0xc0, se8 = fp - 0xe8, sf0 = fp - 0xf0, sf8 = fp - 0xf8, s110 = fp - 0x110, s118 = fp - 0x118, s120 = fp - 0x120, s138 = fp - 0x138, s168 = fp - 0x168, s180 = fp - 0x180, s188 = fp - 0x188, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1000 = fp - 0x1000
	let s, t, u, v, ao, ap, aq: u64
	const f: LamportsCell = c.lamports
	const p = c.key
	const o = d.key
	rc_inc(f)
	const g: DataCell = c.data
	rc_inc(g)
	const h: AccountInfo = ld64(b)
	const i: LamportsCell = h.lamports
	const n = h.key
	rc_inc(i)
	const j: DataCell = h.data
	rc_inc(j)
	const k: LamportsCell = h.lamports
	const m = h.key
	rc_inc(k)
	const l: DataCell = h.data
	rc_inc(l)
	st64(s120, m)
	st64(s1000, 0, n, s120, 1)
	fn_134a08(s118, o, p, 0, 0, n, s120, 1)
	copy(s138, s110, 0x18)
	const q = ld64(s118)
	if (q == 0x8000000000000000) {
		fn_13b430(s1c0, s138)
		ao = ld64(s1c0 + 8)
		aq = ld64(s1c0)
		ap = a
		v = g
		u = f
		t = l
		s = k
	} else {
		memcpy(s168, sf8, 0x30)
		st64(s188, q)
		copy(s180, s138, 0x18)
		const r: LamportsCell = c.lamports
		const aa = c.key
		rc_inc(r)
		const w: DataCell = c.data
		rc_inc(w)
		const x: LamportsCell = h.lamports
		const bd = h.key
		const be = c.executable
		const bf = c.is_writable
		const bg = c.is_signer
		const bh = c.rent_epoch
		const z = c.owner
		rc_inc(x)
		const y: DataCell = h.data
		rc_inc(y)
		const ab: LamportsCell = d.lamports
		const ay = d.key
		const az = h.executable
		const ba = h.is_writable
		const bb = h.is_signer
		const bc = h.rent_epoch
		const ac = h.owner
		rc_inc(ab)
		const ad: DataCell = d.data
		rc_inc(ad)
		const ah = d.owner
		const ag = d.rent_epoch
		const af = d.is_signer
		const ae = d.is_writable
		st8(s90 + 2, d.executable)
		st8(s90, af, ae)
		st64(sb8, ay, ab, ad, ah, ag)
		st8(sc0, bb, ba, az)
		st64(se8, bd, x, y, ac, bc)
		st8(sf0, bg, bf, be)
		st64(s118, aa, r, w, z, bh)
		st64(s88, s78, 6, 0x100152b28, 9, b + 0x188, 0x20, b + 0x1a8, 0x20, b + 0x1e8, 0x20, b + 0x286, 2, b + 0x28c, 1)
		st64(s1000, s88, 1)
		fn_1390d8(s1a0, s188, s118, 3, fp)
		if (ld64(s1a0) == 0x800000000000001a /* Ok */) {
			const aj: DataCell = ld64(s110 + 8)
			const ai: LamportsCell = ld64(s110)
			ap = a
			rc_dec(ai)
			rc_dec(aj)
			const al: DataCell = ld64(se8 + 0x10)
			const ak: LamportsCell = ld64(se8 + 8)
			rc_dec(ak)
			rc_dec(al)
			const an: DataCell = ld64(sb8 + 0x10)
			const am: LamportsCell = ld64(sb8 + 8)
			rc_dec(am)
			rc_dec(an)
			rc_dec(k)
			rc_dec(l)
			rc_dec(i)
			rc_dec(j)
			rc_dec(f)
			ao = g.strong - 1
			g.strong = ao
			if (ao != 0) {
				st64(ap + 8, ao)
				st64(ap, 2)
				return ap
			}
			ao = g.weak - 1
			g.weak = ao
			st64(ap + 8, ao)
			st64(ap, 2)
			return ap
		}
		copyr(s18, s1a0, 0x18)
		fn_13b430(s1b0, s18)
		ao = ld64(s1b0 + 8)
		aq = ld64(s1b0)
		const at: DataCell = ld64(s110 + 8)
		const ar: LamportsCell = ld64(s110)
		ap = a
		v = g
		u = f
		t = l
		s = k
		rc_dec(ar)
		rc_dec(at)
		const av: DataCell = ld64(se8 + 0x10)
		const au: LamportsCell = ld64(se8 + 8)
		rc_dec(au)
		rc_dec(av)
		const ax: DataCell = ld64(sb8 + 0x10)
		const aw: LamportsCell = ld64(sb8 + 8)
		rc_dec(aw)
		rc_dec(ax)
	}
	rc_dec(s)
	rc_dec(t)
	rc_dec(i)
	rc_dec(j)
	rc_dec(u)
	if (!rc_release(v)) {
		st64(ap + 8, ao)
		st64(ap, aq)
		return ap
	}
	st64(v + 8, ld64(v + 8) - 1)
	st64(ap + 8, ao)
	st64(ap, aq)
	return ap
}

export function fn_6b9a8(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s30 = fp - 0x30, s58 = fp - 0x58, s60 = fp - 0x60, s88 = fp - 0x88, s90 = fp - 0x90, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sc8 = fp - 0xc8, se0 = fp - 0xe0, se8 = fp - 0xe8, s100 = fp - 0x100, s130 = fp - 0x130, s148 = fp - 0x148, s150 = fp - 0x150, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s1000 = fp - 0x1000
	let ah, an, ap: u64
	let bg: AccountInfo = b
	const f: LamportsCell = c.lamports
	const p = c.key
	const g: AccountInfo = p5
	const o = g.key
	rc_inc(f)
	const h: DataCell = c.data
	const bd = p7
	const be = p6
	rc_inc(h)
	const i = ld64(d + 8)
	const q = ld64(d)
	rc_inc(i)
	const j = ld64(d + 0x10)
	rc_inc(j)
	let bf = d
	const k: AccountInfo = bg
	const l: LamportsCell = bg.lamports
	const n = bg.key
	rc_inc(l)
	const m: DataCell = k.data
	rc_inc(m)
	st64(s1000, n, 8, 0, 1)
	fn_135038(se8, o, p, q, n, 8, 0, 1)
	copy(s100, se0, 0x18)
	const r = ld64(se8)
	if (r == 0x8000000000000000) {
		an = fn_13b430(s188, s100)
		ah = ld64(s188 + 8)
		ap = ld64(s188)
	} else {
		memcpy(s130, sc8, 0x30)
		st64(s150, r)
		copy(s148, s100, 0x18)
		const s: LamportsCell = c.lamports
		const u = c.key
		const y: AccountInfo = bg
		const v: AccountInfo = bf
		rc_inc(s)
		const t: DataCell = c.data
		rc_inc(t)
		const w: LamportsCell = v.lamports
		const ay = v.key
		const az = c.executable
		const ba = c.is_writable
		const bb = c.is_signer
		const bc = c.rent_epoch
		const ab = c.owner
		rc_inc(w)
		const x: DataCell = v.data
		rc_inc(x)
		const z: LamportsCell = y.lamports
		const at = y.key
		const au = v.executable
		const av = v.is_writable
		const aw = v.is_signer
		const ax = v.rent_epoch
		bf = v.owner
		rc_inc(z)
		const aa: DataCell = y.data
		rc_inc(aa)
		const ac: LamportsCell = g.lamports
		const aq = g.key
		const ar = bg.executable
		const ae = bg.is_writable
		const aj = bg.is_signer
		const ak = bg.rent_epoch
		const al = bg.owner
		rc_inc(ac)
		const ad: DataCell = g.data
		bg = ae
		rc_inc(ad)
		const ai = g.owner
		ah = g.rent_epoch
		const ag = g.is_signer
		const af = g.is_writable
		st8(s30 + 2, g.executable)
		st8(s30, ag, af)
		st64(s58, aq, ac, ad, ai, ah)
		st8(s60, aj, bg, ar)
		st64(s88, at, z, aa, al, ak)
		st8(s90, aw, av, au)
		st64(sb8, ay, w, x, bf, ax)
		st8(sc0, bb, ba, az)
		st64(se8, u, s, t, ab, bc)
		st64(s28, be, bd)
		st64(s1000, s28, 1)
		const am = fn_1390d8(s168, s150, se8, 4, fp)
		if (ld64(s168) == 0x800000000000001a /* Ok */) {
			ptr_drop_in_place_c1b0(se8, am)
			rc_dec(l)
			an = m
			if (rc_release(m)) {
				st64(an + 8, ld64(an + 8) - 1)
			}
			rc_dec(i)
			rc_dec(j)
			rc_dec(f)
			if (!rc_release(h)) {
				st64(a + 8, ah)
				st64(a, 2)
				return an
			}
			h.weak = h.weak - 1
			st64(a + 8, ah)
			st64(a, 2)
			return an
		}
		copyr(s18, s168, 0x18)
		const ao = fn_13b430(s178, s18)
		ah = ld64(s178 + 8)
		ap = ld64(s178)
		an = ptr_drop_in_place_c1b0(se8, ao)
	}
	rc_dec(l)
	rc_dec(m)
	rc_dec(i)
	rc_dec(j)
	rc_dec(f)
	if (!rc_release(h)) {
		st64(a + 8, ah)
		st64(a, ap)
		return an
	}
	h.weak = h.weak - 1
	st64(a + 8, ah)
	st64(a, ap)
	return an
}

export function fn_6c748(a: u64, b: u64, c: AccountInfo, d: AccountInfo, p5: u64, p6: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s30 = fp - 0x30, s58 = fp - 0x58, s60 = fp - 0x60, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sd0 = fp - 0xd0, s100 = fp - 0x100, s118 = fp - 0x118, s120 = fp - 0x120, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s1000 = fp - 0x1000
	let p, q, r, ak, al, am: u64
	let bg = b
	const f: LamportsCell = c.lamports
	const h = c.key
	const m = d.key
	rc_inc(f)
	const g: DataCell = c.data
	let bf = h
	const bd = p6
	const be = p5
	rc_inc(g)
	const i = bg
	const j = ld64(bg + 8)
	const l = ld64(bg)
	rc_inc(j)
	const k = ld64(i + 0x10)
	rc_inc(k)
	st64(s1000, 0, l, 8, 0)
	fn_134a08(sb8, m, bf, 0, 0, l, 8, 0)
	copy(sd0, sb0, 0x18)
	const n = ld64(sb8)
	if (n == 0x8000000000000000) {
		fn_13b430(s158, sd0)
		ak = ld64(s158 + 8)
		am = ld64(s158)
		al = a
		r = g
		q = k
		p = j
	} else {
		memcpy(s100, s98, 0x30)
		st64(s120, n)
		copy(s118, sd0, 0x18)
		const o: LamportsCell = c.lamports
		const x = c.key
		const t: AccountInfo = bg
		rc_inc(o)
		const s: DataCell = c.data
		rc_inc(s)
		const u: LamportsCell = t.lamports
		const az = t.key
		const ba = c.executable
		const bb = c.is_writable
		const bc = c.is_signer
		bf = c.rent_epoch
		const w = c.owner
		rc_inc(u)
		const v: DataCell = t.data
		rc_inc(v)
		const y: LamportsCell = d.lamports
		const au = d.key
		const av = t.executable
		const aw = t.is_writable
		const ax = t.is_signer
		const ay = t.rent_epoch
		bg = t.owner
		rc_inc(y)
		const z: DataCell = d.data
		rc_inc(z)
		const ad = d.owner
		const ac = d.rent_epoch
		const ab = d.is_signer
		const aa = d.is_writable
		st8(s30 + 2, d.executable)
		st8(s30, ab, aa)
		st64(s58, au, y, z, ad, ac)
		st8(s60, ax, aw, av)
		st64(s88, az, u, v, bg, ay)
		st8(s90, bc, bb, ba)
		st64(sb8, x, o, s, w, bf)
		st64(s28, be, bd)
		st64(s1000, s28, 1)
		fn_1390d8(s138, s120, sb8, 3, fp)
		if (ld64(s138) == 0x800000000000001a /* Ok */) {
			const af: DataCell = ld64(sb0 + 8)
			const ae: LamportsCell = ld64(sb0)
			rc_dec(ae)
			al = a
			rc_dec(af)
			const ah: DataCell = ld64(s88 + 0x10)
			const ag: LamportsCell = ld64(s88 + 8)
			rc_dec(ag)
			rc_dec(ah)
			const aj: DataCell = ld64(s58 + 0x10)
			const ai: LamportsCell = ld64(s58 + 8)
			rc_dec(ai)
			rc_dec(aj)
			rc_dec(j)
			rc_dec(k)
			rc_dec(f)
			ak = g.strong - 1
			g.strong = ak
			if (ak != 0) {
				st64(al + 8, ak)
				st64(al, 2)
				return al
			}
			ak = g.weak - 1
			g.weak = ak
			st64(al + 8, ak)
			st64(al, 2)
			return al
		}
		copyr(s18, s138, 0x18)
		fn_13b430(s148, s18)
		ak = ld64(s148 + 8)
		am = ld64(s148)
		const ao: DataCell = ld64(sb0 + 8)
		const an: LamportsCell = ld64(sb0)
		r = g
		q = k
		p = j
		rc_dec(an)
		al = a
		rc_dec(ao)
		const aq: DataCell = ld64(s88 + 0x10)
		const ap: LamportsCell = ld64(s88 + 8)
		rc_dec(ap)
		rc_dec(aq)
		const at: DataCell = ld64(s58 + 0x10)
		const ar: LamportsCell = ld64(s58 + 8)
		rc_dec(ar)
		rc_dec(at)
	}
	rc_dec(p)
	rc_dec(q)
	rc_dec(f)
	if (!rc_release(r)) {
		st64(al + 8, ak)
		st64(al, am)
		return al
	}
	st64(r + 8, ld64(r + 8) - 1)
	st64(al + 8, ak)
	st64(al, am)
	return al
}

// types [heur]: c: TokenAccount_2 (every call passes one: fn_33380, fn_37fd8)
export function fn_75db0(a: u64, b: u64, c: TokenAccount_2, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s30 = fp - 0x30, s58 = fp - 0x58, s60 = fp - 0x60, s88 = fp - 0x88, s90 = fp - 0x90, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sc8 = fp - 0xc8, se0 = fp - 0xe0, se8 = fp - 0xe8, s108 = fp - 0x108, s120 = fp - 0x120, s150 = fp - 0x150, s168 = fp - 0x168, s170 = fp - 0x170, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1000 = fp - 0x1000
	let af, am, an, ao: u64
	const f: AccountInfo = c.info
	const g: LamportsCell = f.lamports
	const h: AccountInfo = ld64(d)
	const i = f.key
	const r = h.key
	rc_inc(g)
	let bg = i
	const j: DataCell = f.data
	const bf = p7
	const k = p6
	const o = p5
	rc_inc(j)
	const l: AccountInfo = ld64(b + 0x58)
	const m: LamportsCell = l.lamports
	const s = l.key
	rc_inc(m)
	const n: DataCell = l.data
	rc_inc(n)
	const p: AccountInfo = ld64(o)
	const q = p.key
	copyr(s108, q, 0x20)
	st64(s1000, s108, 8, 0)
	fn_130da0(se8, r, bg, s, s108, 8, 0)
	copy(s120, se0, 0x18)
	const t = ld64(se8)
	if (t == 0x8000000000000000) {
		fn_13b430(s1a8, s120)
		af = ld64(s1a8 + 8)
		ao = ld64(s1a8)
	} else {
		memcpy(s150, sc8, 0x30)
		st64(s170, t)
		copy(s168, s120, 0x18)
		const u: LamportsCell = h.lamports
		const ab = h.key
		rc_inc(u)
		const v: DataCell = h.data
		rc_inc(v)
		const w: LamportsCell = f.lamports
		const bb = f.key
		const bc = h.executable
		const bd = h.is_writable
		const be = h.is_signer
		const y = h.rent_epoch
		const ae = h.owner
		rc_inc(w)
		const x: DataCell = f.data
		bg = x
		rc_inc(x)
		const z: LamportsCell = l.lamports
		const av = l.key
		const aw = f.executable
		const ax = f.is_writable
		const ay = f.is_signer
		const az = f.rent_epoch
		const ba = f.owner
		rc_inc(z)
		const aa: DataCell = l.data
		rc_inc(aa)
		const ac: LamportsCell = p.lamports
		const ap = p.key
		const aq = l.executable
		const ar = l.is_writable
		const at = l.is_signer
		const au = l.rent_epoch
		const aj = l.owner
		rc_inc(ac)
		const ad: DataCell = p.data
		rc_inc(ad)
		const ai = p.owner
		const ah = p.rent_epoch
		const ag = p.is_signer
		af = p.is_writable
		st8(s30 + 2, p.executable)
		st8(s30, ag, af)
		st64(s58, ap, ac, ad, ai, ah)
		st8(s60, at, ar, aq)
		st64(s88, av, z, aa, aj, au)
		st8(s90, ay, ax, aw)
		st64(sb8, bb, w, bg, ba, az)
		st8(sc0, be, bd, bc)
		st64(se8, ab, u, v, ae, y)
		st64(s28, k, bf)
		st64(s1000, s28, 1)
		const ak = fn_1390d8(s188, s170, se8, 4, fp)
		if (ld64(s188) == 0x800000000000001a /* Ok */) {
			am = ptr_drop_in_place_c1b0(se8, ak)
			an = a
			rc_dec(m)
			rc_dec(n)
			rc_dec(g)
			if (!rc_release(j)) {
				st64(an + 8, af)
				st64(an, 2)
				return am
			}
			j.weak = j.weak - 1
			st64(an + 8, af)
			st64(an, 2)
			return am
		}
		copyr(s18, s188, 0x18)
		const al = fn_13b430(s198, s18)
		af = ld64(s198 + 8)
		ao = ld64(s198)
		ptr_drop_in_place_c1b0(se8, al)
	}
	an = a
	am = m
	if (rc_release(m)) {
		st64(am + 8, ld64(am + 8) - 1)
	}
	rc_dec(n)
	rc_dec(g)
	if (!rc_release(j)) {
		st64(an + 8, af)
		st64(an, ao)
		return am
	}
	j.weak = j.weak - 1
	st64(an + 8, af)
	st64(an, ao)
	return am
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: p6 (value)
export function fn_78f88(a: u64, b: u64, c: u64, d: AccountInfo, p5: u64, p6: u64, p7: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s48 = fp - 0x48, s60 = fp - 0x60, s80 = fp - 0x80, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sd0 = fp - 0xd0, sd8 = fp - 0xd8, sf0 = fp - 0xf0, s118 = fp - 0x118, s120 = fp - 0x120, s138 = fp - 0x138, s140 = fp - 0x140, s158 = fp - 0x158, s170 = fp - 0x170, s178 = fp - 0x178, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s280 = fp - 0x280, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8, s2b0 = fp - 0x2b0, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2c8 = fp - 0x2c8, sfe8 = fp - 0xfe8, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let aa, ab, ah: u64
	st64(s280 + 0x10, c)
	st64(s298, b)
	st64(s280 + 0x20, a)
	const f: AccountInfo = p6
	const g = f.key
	copyr(sd0, g + 8, 0x18)
	st64(s280 + 0x58, g)
	st64(sd8, ld64(g))
	const n = memcmp(sd8, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20)
	const h: LamportsCell = f.lamports
	rc_inc(h)
	const i: DataCell = f.data
	const o = p7
	const p = p5
	rc_inc(i)
	st64(s280 + 0x50, h)
	const j: LamportsCell = d.lamports
	const k = j.strong
	st64(s280 + 0x48, d.key)
	st64(s280 + 0x28, f.executable)
	st64(s280 + 0x30, f.is_writable)
	st64(s280 + 0x38, f.is_signer)
	st64(s280 + 0x40, f.rent_epoch)
	st64(s280 + 0x60, f.owner)
	rc_inc(j, k)
	const l: DataCell = d.data
	st64(s280 + 0x68, l)
	const m = l.strong
	rc_inc(ld64(s280 + 0x68), m)
	st64(s280, p, o)
	st64(s298 + 8, n)
	st64(s280 + 0x18, (n as u32) == 0)
	const v = d.owner
	const u = d.rent_epoch
	const t = d.is_signer
	const s = d.is_writable
	const r = d.executable
	st64(sb0, ld64(s280 + 0x68))
	st64(s2a0, j)
	st64(sb8, j)
	const q = ld64(s280 + 0x48)
	st64(sd0 + 0x10, q)
	st8(s80 + 0x1a, ld64(s280 + 0x28))
	st8(s80 + 0x19, ld64(s280 + 0x30))
	st8(s80 + 0x18, ld64(s280 + 0x38))
	st64(s80 + 0x10, ld64(s280 + 0x40))
	st64(s80 + 8, ld64(s280 + 0x60))
	st64(s298 + 0x10, i)
	st64(s80, i)
	st64(sa0 + 0x18, ld64(s280 + 0x50))
	st64(sa0 + 0x10, ld64(s280 + 0x58))
	st64(s2c8, r)
	st8(sa0 + 0xa, r)
	st64(s2c0, s)
	st8(sa0 + 9, s)
	st64(s2b8, t)
	st8(sa0 + 8, t)
	st64(s2b0, u)
	st64(sa0, u)
	st64(s2a8, v)
	st64(sa8, v)
	st64(s60, 8, 0)
	st64(sd8, 0, 8, 0)
	let ac = fn_127df0(s140, sd8, (n as u32) != 0 ? 2 : 0x1001537e4, ld64(s280 + 0x18))
	let w = ld64(s140)
	if (w != 2) {
		aa = ld64(s280 + 0x20)
		st64(aa + 8, ld64(s138))
		st64(aa, w)
		return ac
	}
	const ad = ld64(s138)
	copyr(sd8, q, 0x20)
	if (rent_check_id_136a18(sd8) != 0) {
		ac = fn_5fd40(s1c0)
		ah = 0x1f1df0
		ab = ld64(s1c0 + 8)
		w = ld64(s1c0)
		if (w != 2) {
			aa = ld64(s280 + 0x20)
			st64(aa + 8, ab)
			st64(aa, w)
			return ac
		}
	} else {
		rent_get(sd8)
		const y = ld64(sd0 + 8)
		const z = ld64(sd0)
		if (ld64(sd8) != 0) {
			st32(s140, ld32(sd0 + 0x11))
			st32(s140 + 3, ld32(sd0 + 0x14))
			const x = ld8(sd0 + 0x10)
			st32(sd0 + 0xc, ld32(s140 + 3))
			st32(sd0 + 9, ld32(s140))
			st8(sd0 + 8, x)
			st64(sd8, z, y)
			ac = fn_13b430(s1b0, sd8)
			w = ld64(s1b0)
			aa = ld64(s280 + 0x20)
			st64(aa + 8, ld64(s1b0 + 8))
			st64(aa, w)
			return ac
		}
		const ae = fn_14f7f8(y, __floatundidf(z * (ad + 0x80)))
		const af = fn_151cb0(ae, 0)
		const ag = fn_14f3e8(ae)
		ah = (fn_151a40(ae, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (af as i64) ? 0 : ag
	}
	st64(s280 + 0x18, ah)
	const ai: AccountInfo = ld64(ld64(s280 + 8))
	const aj: LamportsCell = ai.lamports
	const ap = ai.key
	rc_inc(aj)
	const ak: DataCell = ai.data
	rc_inc(ak)
	const ao = ai.owner
	const an = ai.rent_epoch
	const am = ai.is_signer
	const al = ai.is_writable
	st8(s178 + 2, ai.executable)
	st8(s178, am, al)
	st64(s1a0, ap, aj, ak, ao, an)
	const aq: AccountInfo = ld64(ld64(s280))
	const ar: LamportsCell = aq.lamports
	const ay = aq.key
	rc_inc(ar)
	const at: DataCell = aq.data
	rc_inc(at)
	const ax = aq.owner
	const aw = aq.rent_epoch
	const av = aq.is_signer
	const au = aq.is_writable
	st8(s118 + 2, aq.executable)
	st8(s118, av, au)
	st64(s140, ay, ar, at, ax, aw)
	const az: AccountInfo = ld64(ld64(s280 + 0x10))
	const ba: LamportsCell = az.lamports
	const bg = az.key
	rc_inc(ba)
	const bb: DataCell = az.data
	rc_inc(bb)
	const bf = az.owner
	const be = az.rent_epoch
	const bd = az.is_signer
	const bc = az.is_writable
	st8(sb0 + 2, az.executable)
	st8(sb0, bd, bc)
	st64(sd8, bg, ba, bb, bf, be)
	st64(sff0, ad)
	st64(sff8, ld64(s280 + 0x18))
	st64(s1000, ld64(s280 + 0x58))
	st64(sfe8, 8, 0)
	ac = fn_5ecd8(s1d0, s1a0, s140, sd8, ld64(s1000), ld64(sff8), ad, 8, 0)
	w = ld64(s1d0)
	if (w != 2) {
		aa = ld64(s280 + 0x20)
		st64(aa + 8, ld64(s1d0 + 8))
		st64(aa, w)
		return ac
	}
	if ((ld64(s298 + 8) as u32) == 0) {
		fn_132d88(sd8, ld64(s280 + 0x58), az.key)
		copy(s170, sd0, 0x18)
		const bl = ld64(sd8)
		if (bl == 0x8000000000000000) {
			ac = fn_13b430(s210, s170)
			w = ld64(s210)
			aa = ld64(s280 + 0x20)
			st64(aa + 8, ld64(s210 + 8))
			st64(aa, w)
			return ac
		}
		memcpy(s120, sb8, 0x30)
		st64(s140, bl)
		copy(s138, s170, 0x18)
		const bm: LamportsCell = ld64(s280 + 0x50)
		const cf: DataCell = ld64(s298 + 0x10)
		rc_inc(bm)
		rc_inc(cf)
		const cg: LamportsCell = az.lamports
		const cm = az.key
		rc_inc(cg)
		const ch: DataCell = az.data
		rc_inc(ch)
		const cl = az.owner
		const ck = az.rent_epoch
		const cj = az.is_signer
		const ci = az.is_writable
		st8(s80 + 2, az.executable)
		st8(s80, cj, ci)
		st64(sa8, cm, cg, ch, cl, ck)
		st8(sb0 + 2, ld64(s280 + 0x28))
		st8(sb0 + 1, ld64(s280 + 0x30))
		st8(sb0, ld64(s280 + 0x38))
		st64(sb8, ld64(s280 + 0x40))
		st64(sd0 + 0x10, ld64(s280 + 0x60))
		st64(sd0 + 8, ld64(s298 + 0x10))
		st64(sd0, ld64(s280 + 0x50))
		st64(sd8, ld64(s280 + 0x58))
		const cn = fn_1390b0(s18, s140, sd8, 2)
		if (ld64(s18) != 0x800000000000001a /* Ok */) {
			copyr(s1a0, s18, 0x18)
			const cp = fn_13b430(s1e0, s1a0)
			ab = ld64(s1e0 + 8)
			w = ld64(s1e0)
			ac = ptr_drop_in_place_bf20(sd8, cp)
			aa = ld64(s280 + 0x20)
			st64(aa + 8, ab)
			st64(aa, w)
			return ac
		}
		ptr_drop_in_place_bf20(sd8, cn)
	}
	const bj = az.key
	const bh: AccountInfo = ld64(ld64(s298))
	const bi = bh.key
	copyr(s1a0, bi, 0x20)
	fn_12f7b0(sd8, ld64(s280 + 0x58), bj, ld64(s280 + 0x48), s1a0)
	copy(sf0, sd0, 0x18)
	const bk = ld64(sd8)
	if (bk == 0x8000000000000000) {
		ac = fn_13b430(s200, sf0)
		w = ld64(s200)
		aa = ld64(s280 + 0x20)
		st64(aa + 8, ld64(s200 + 8))
		st64(aa, w)
		return ac
	}
	memcpy(s120, sb8, 0x30)
	st64(s140, bk)
	copy(s138, sf0, 0x18)
	const bn: LamportsCell = ld64(s280 + 0x50)
	const bo: DataCell = ld64(s298 + 0x10)
	rc_inc(bn)
	rc_inc(bo)
	const bp: LamportsCell = az.lamports
	const by = az.key
	rc_inc(bp)
	const bq: DataCell = az.data
	rc_inc(bq)
	st64(s280 + 8, az.executable)
	st64(s280 + 0x10, az.is_writable)
	st64(s280 + 0x18, az.is_signer)
	const bu = az.rent_epoch
	const bw = az.owner
	const br: LamportsCell = ld64(s2a0)
	rc_inc(br)
	const bs: DataCell = ld64(s280 + 0x68)
	const bt = bs.strong
	bs.strong = bt + 1
	st64(s280, bu)
	if (bt != -1) {
		ab = bh.lamports
		const bv = ld64(ab)
		st64(s298 + 8, bq)
		const cd = bh.key
		rc_inc(ab, bv)
		st64(s298, bp)
		const bx: DataCell = bh.data
		rc_inc(bx)
		const cc = bh.owner
		const cb = bh.rent_epoch
		const ca = bh.is_signer
		const bz = bh.is_writable
		st8(s20 + 2, bh.executable)
		st8(s20, ca, bz)
		st64(s48, cd, ab, bx, cc, cb)
		st8(s60 + 0x12, ld64(s2c8))
		st8(s60 + 0x11, ld64(s2c0))
		st8(s60 + 0x10, ld64(s2b8))
		st64(s60 + 8, ld64(s2b0))
		st64(s60, ld64(s2a8))
		st64(s80 + 0x18, ld64(s280 + 0x68))
		st64(s80 + 0x10, ld64(s2a0))
		st64(s80 + 8, ld64(s280 + 0x48))
		st8(s80 + 2, ld64(s280 + 8))
		st8(s80 + 1, ld64(s280 + 0x10))
		st8(s80, ld64(s280 + 0x18))
		st64(sa0 + 0x18, ld64(s280))
		st64(sa0 + 0x10, bw)
		copyr(sa0, s298, 0x10)
		st64(sa8, by)
		st8(sb0 + 2, ld64(s280 + 0x28))
		st8(sb0 + 1, ld64(s280 + 0x30))
		st8(sb0, ld64(s280 + 0x38))
		st64(sb8, ld64(s280 + 0x40))
		st64(sd0 + 0x10, ld64(s280 + 0x60))
		st64(sd0 + 8, ld64(s298 + 0x10))
		st64(sd0, ld64(s280 + 0x50))
		st64(sd8, ld64(s280 + 0x58))
		const ce = fn_1390b0(s158, s140, sd8, 4)
		if (ld64(s158) == 0x800000000000001a /* Ok */) {
			ac = ptr_drop_in_place_c1b0(sd8, ce)
			aa = ld64(s280 + 0x20)
			st64(aa + 8, ab)
			st64(aa, 2)
			return ac
		}
		copyr(s18, s158, 0x18)
		const co = fn_13b430(s1f0, s18)
		ab = ld64(s1f0 + 8)
		w = ld64(s1f0)
		ac = ptr_drop_in_place_c1b0(sd8, co)
		aa = ld64(s280 + 0x20)
		st64(aa + 8, ab)
		st64(aa, w)
		return ac
	}
	abort()
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), d (value), r9 (value), r6 (value)
// types [heur]: b: AccountInfo (every call passes one: fn_3b360, fn_3b6d8, fn_3ba00, …)
export function fn_7a5e0(a: u64, b: AccountInfo, c: u64, d: u64, p5: u64, p6: u64, r6: u64, r9: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s48 = fp - 0x48, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s80 = fp - 0x80, s140 = fp - 0x140, s148 = fp - 0x148, s150 = fp - 0x150, s158 = fp - 0x158, s160 = fp - 0x160, s168 = fp - 0x168, s170 = fp - 0x170, s178 = fp - 0x178, s180 = fp - 0x180, s188 = fp - 0x188, s190 = fp - 0x190, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8
	let ag, an, ax, bc, bh, bm, br, bw, cb: u64
	let de = ld64(s1a8)
	let df = ld64(s1a0)
	let dg = ld64(s198)
	let dh = ld64(s190)
	let di = ld64(s188)
	let dj = ld64(s180)
	let dk = ld64(s178)
	let dl = ld64(s170)
	let dm = ld64(s168)
	let dn = ld64(s160)
	let dp = ld64(s158)
	let dq = ld64(s150)
	let dr = ld64(s148)
	let ds = ld64(s140)
	let eo = ld64(s80)
	let ep = ld64(s78)
	let eq = ld64(s70)
	let er = ld64(s68)
	let es = ld64(s60)
	let et = ld64(s58)
	let eu = ld64(s50)
	let ev = ld64(s48)
	let en = b
	if (ld64(d) == 0x8000000000000000) {
		st64(a + 0x108, 0x8000000000000000)
		st64(a + 0xf0, 0x8000000000000000)
		st64(a + 0xd8, 0x8000000000000000)
		st64(a + 0xc0, 0x8000000000000000)
		st64(a + 0xa8, 0x8000000000000000)
		st64(a + 0x90, 0x8000000000000000)
		st64(a + 0x78, 0x8000000000000000)
		st64(a + 0x60, 0x8000000000000000)
		st64(a + 0x48, 0x8000000000000000)
		st64(a + 0x30, 0x8000000000000000)
		st64(a + 0x18, 0x8000000000000000)
		st64(a, 0x8000000000000000)
		st64(a + 0x120, 0x8000000000000000)
		return 0x8000000000000000
	}
	let g = c * 0x30
	const du = en + g
	const ek = p6
	let i = p5
	let h = ld64(d + 8)
	let j = h + (ld64(d + 0x10) << 1)
	let ea = 0x8000000000000000
	let eb = 0x8000000000000000
	let ec = 0x8000000000000000
	let ed = 0x8000000000000000
	let ee = 0x8000000000000000
	let ef = 0x8000000000000000
	let dx = 0x8000000000000000
	let dy = 0x8000000000000000
	let dz = 0x8000000000000000
	let eg = 0x8000000000000000
	let eh = 0x8000000000000000
	let ei = 0x8000000000000000
	let ej = 0x8000000000000000
	const dw = i
	const dv = j
	L2: while (true) {
		const k = h
		if (h != j) {
			const el = d
			const em = g
			const o = ld8(k)
			h = k + 2
			let l = ek
			let m = i
			while (true) {
				B66: {
					if (l == 0) {
						fn_87630(s40, 0x30)
						const af = ld64(s40)
						st64(a + 0x10, ld64(s40 + 8))
						st64(a + 8, af)
						st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
					} else {
						l = l - 1
						const n = ld8(m)
						m = m + 1
						if (n != o) {
							continue
						}
						const p = ld8(k + 1)
						g = em
						d = el
						i = dw
						j = dv
						if (p == 0) {
							continue L2
						}
						const cx = h
						const q = ld64(0x300000000 /* heap bump-allocator cursor */)
						const r = q != 0 ? q : 0x300008000
						const s = r - p * 0x30
						const t = s > r ? 0 : s
						if (0x300000008 > (t & -8)) {
							raw_vec_handle_error(8, p * 0x30, p * 0x30, 0x300000008, r)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, t & -8)
						st64(s20, p)
						let aa = 0
						let ab = 0x2b
						let dd = t & -8
						st64(s18, t & -8, 0)
						while (true) {
							B63: {
								const ad = en + ab
								ag = 0x31
								if (ad - 0x2b != du) {
									const dc = ab
									const dt = aa
									const ae = ld64(ad - 0x23)
									const db = ld64(ad - 0x2b)
									let v = dd
									rc_inc(ae)
									const z = ld64(ad - 0x1b)
									rc_inc(z)
									const cy = ld8(ad - 1)
									const cz = ld8(ad - 2)
									const x = ld8(ad - 3)
									const da = ld64(ad - 0xb)
									const y = ld64(ad - 0x13)
									let u = dt
									if (dt == ld64(s20)) {
										fn_f060(s20, en, z)
										u = dt
										v = ld64(s18)
									}
									const w = u + 1
									dd = v
									st8(v + dc - 1, cy)
									st8(v + dc - 2, cz)
									aa = w
									st8(v + dc - 3, x)
									st64(v + dc - 0xb, da)
									st64(v + dc - 0x13, y)
									st64(v + dc - 0x1b, z)
									st64(v + dc - 0x23, ae)
									st64(v + dc - 0x2b, db)
									st32(v + dc, ld32(s18 + 0x13))
									st8(v + dc + 4, ld8(s18 + 0x17))
									ab = dc + 0x30
									st64(s18 + 8, w)
									if (p > (w as u8)) {
										continue
									}
									B59: {
										en = en + ab - 0x2b
										const ac = ld8(k)
										if ((ac as i64) > 5) {
											if ((ac as i64) > 8) {
												if ((ac as i64) > 0xa) {
													if (ac == 0xb) {
														ag = 0x35
														if (ei != 0x8000000000000000) {
															break B63
														}
														dq = ld64(s18)
														ei = ld64(s20)
														dn = aa
													} else {
														ag = 0x35
														if (ej != 0x8000000000000000) {
															break B63
														}
														ds = ld64(s18)
														ej = ld64(s20)
														dr = aa
													}
												} else if (ac == 9) {
													ag = 0x35
													if (eg != 0x8000000000000000) {
														break B63
													}
													dm = ld64(s18)
													eg = ld64(s20)
													dk = aa
												} else {
													ag = 0x35
													if (eh != 0x8000000000000000) {
														break B63
													}
													dp = ld64(s18)
													eh = ld64(s20)
													dl = aa
												}
											} else if (ac == 6) {
												ag = 0x37
												if (aa > 3) {
													break B63
												}
												ag = 0x35
												if (dx != 0x8000000000000000) {
													break B63
												}
												de = ld64(s18)
												dx = ld64(s20)
												eo = aa
											} else {
												if (ac == 7) {
													ag = 0x37
													if (aa > 3) {
														break B63
													}
													ag = 0x35
													if (dy != 0x8000000000000000) {
														break B63
													}
													g = ld64(s18)
													dy = ld64(s20)
													ep = aa
													break B59
												}
												ag = 0x37
												if (aa > 3) {
													break B63
												}
												ag = 0x35
												if (dz != 0x8000000000000000) {
													break B63
												}
												df = ld64(s18)
												dz = ld64(s20)
												eq = aa
											}
										} else if ((ac as i64) > 2) {
											if (ac == 3) {
												ag = 0x35
												if (ed != 0x8000000000000000) {
													break B63
												}
												di = ld64(s18)
												ed = ld64(s20)
												et = aa
											} else {
												if (ac != 4) {
													ag = 0x35
													if (ef == 0x8000000000000000) {
														d = ld64(s18)
														ef = ld64(s20)
														ev = aa
														g = em
														i = dw
														j = dv
														h = cx
														continue L2
													}
													break B63
												}
												ag = 0x35
												if (ee != 0x8000000000000000) {
													break B63
												}
												dj = ld64(s18)
												ee = ld64(s20)
												eu = aa
											}
										} else if (ac == 0) {
											ag = 0x35
											if (ea != 0x8000000000000000) {
												break B63
											}
											r6 = ld64(s18)
											ea = ld64(s20)
											er = aa
										} else if (ac == 1) {
											ag = 0x35
											if (eb != 0x8000000000000000) {
												break B63
											}
											r9 = ld64(s18)
											eb = ld64(s20)
											dh = aa
										} else {
											ag = 0x35
											if (ec != 0x8000000000000000) {
												break B63
											}
											dg = ld64(s18)
											ec = ld64(s20)
											es = aa
										}
										g = em
									}
									d = el
									i = dw
									j = dv
									h = cx
									continue L2
								}
							}
							fn_87630(s30, ag)
							let ai = aa
							const ah = ld64(s30)
							st64(a + 0x10, ld64(s30 + 8))
							st64(a + 8, ah)
							st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
							if (aa == 0) {
								break
							}
							let aj = ld64(s18) + 0x10
							while (true) {
								const al = ld64(aj)
								const ak = ld64(aj - 8)
								rc_dec(ak)
								rc_dec(al)
								aj = aj + 0x30
								ai = ai - 1
								if (ai == 0) {
									break B66
								}
							}
						}
					}
				}
				const cr = ds
				let f = dr
				const cn = dq
				const at = dg
				if (ea != 0x8000000000000000 && er != 0) {
					let am = r6 + 0x10
					do {
						const aq = ld64(am)
						const ap = ld64(am - 8)
						rc_dec(ap)
						rc_dec(aq)
						am = am + 0x30
						an = er
						er = er - 1
					} while (an != 1)
				}
				const ci = dp
				let ao = dh
				if (eb != 0x8000000000000000 && ao != 0) {
					let ar = r9 + 0x10
					do {
						const av = ld64(ar)
						const au = ld64(ar - 8)
						rc_dec(au)
						rc_dec(av)
						ar = ar + 0x30
						ao = ao - 1
					} while (ao != 0)
				}
				const bx = df
				if (ec != 0x8000000000000000 && es != 0) {
					let aw = at + 0x10
					do {
						const ba = ld64(aw)
						const az = ld64(aw - 8)
						rc_dec(az)
						rc_dec(ba)
						aw = aw + 0x30
						ax = es
						es = es - 1
					} while (ax != 1)
				}
				const cd = dm
				const ay = di
				if (ed != 0x8000000000000000 && et != 0) {
					let bb = ay + 0x10
					do {
						const bf = ld64(bb)
						const be = ld64(bb - 8)
						rc_dec(be)
						rc_dec(bf)
						bb = bb + 0x30
						bc = et
						et = et - 1
					} while (bc != 1)
				}
				const bd = dj
				if (ee != 0x8000000000000000 && eu != 0) {
					let bi = bd + 0x10
					do {
						const bk = ld64(bi)
						const bg = bi
						const bj = ld64(bi - 8)
						rc_dec(bj)
						rc_dec(bk)
						bi = bg + 0x30
						bh = eu
						eu = eu - 1
					} while (bh != 1)
				}
				if (ef != 0x8000000000000000 && ev != 0) {
					let bl = el + 0x10
					do {
						const bp = ld64(bl)
						const bo = ld64(bl - 8)
						rc_dec(bo)
						rc_dec(bp)
						bl = bl + 0x30
						bm = ev
						ev = ev - 1
					} while (bm != 1)
				}
				const bn = de
				if (dx != 0x8000000000000000 && eo != 0) {
					let bs = bn + 0x10
					do {
						const bu = ld64(bs)
						const bq = bs
						const bt = ld64(bs - 8)
						rc_dec(bt)
						rc_dec(bu)
						bs = bq + 0x30
						br = eo
						eo = eo - 1
					} while (br != 1)
				}
				if (dy != 0x8000000000000000 && ep != 0) {
					let bv = em + 0x10
					do {
						const bz = ld64(bv)
						const by = ld64(bv - 8)
						rc_dec(by)
						rc_dec(bz)
						bv = bv + 0x30
						bw = ep
						ep = ep - 1
					} while (bw != 1)
				}
				if (dz != 0x8000000000000000 && eq != 0) {
					let ca = bx + 0x10
					do {
						const cf = ld64(ca)
						const ce = ld64(ca - 8)
						rc_dec(ce)
						rc_dec(cf)
						ca = ca + 0x30
						cb = eq
						eq = eq - 1
					} while (cb != 1)
				}
				let cc = dk
				if (eg != 0x8000000000000000 && cc != 0) {
					let cg = cd + 0x10
					do {
						const ck = ld64(cg)
						const cj = ld64(cg - 8)
						rc_dec(cj)
						rc_dec(ck)
						cg = cg + 0x30
						cc = cc - 1
					} while (cc != 0)
				}
				let ch = dl
				if (eh != 0x8000000000000000 && ch != 0) {
					let cl = ci + 0x10
					do {
						const cp = ld64(cl)
						const co = ld64(cl - 8)
						rc_dec(co)
						rc_dec(cp)
						cl = cl + 0x30
						ch = ch - 1
					} while (ch != 0)
				}
				let cm = dn
				if (ei != 0x8000000000000000 && cm != 0) {
					let cq = cn + 0x10
					do {
						const ct = ld64(cq)
						const cs = ld64(cq - 8)
						rc_dec(cs)
						rc_dec(ct)
						cq = cq + 0x30
						cm = cm - 1
					} while (cm != 0)
				}
				if (ej == 0x8000000000000000) {
					return f
				}
				if (f == 0) {
					return f
				}
				let cu = cr + 0x10
				while (true) {
					const cw = ld64(cu)
					const cv = ld64(cu - 8)
					rc_dec(cv)
					rc_dec(cw)
					cu = cu + 0x30
					f = f - 1
					if (f == 0) {
						return f
					}
				}
			}
		}
		st64(a + 0x128, ds)
		st64(a + 0x120, ej)
		st64(a + 0x118, dn)
		st64(a + 0x110, dq)
		st64(a + 0x108, ei)
		st64(a + 0x100, dl)
		st64(a + 0xf8, dp)
		st64(a + 0xf0, eh)
		st64(a + 0xe8, dk)
		st64(a + 0xe0, dm)
		st64(a + 0xd8, eg)
		st64(a + 0xd0, eq)
		st64(a + 0xc8, df)
		st64(a + 0xc0, dz)
		st64(a + 0xb8, ep)
		st64(a + 0xb0, g)
		st64(a + 0xa8, dy)
		st64(a + 0xa0, eo)
		st64(a + 0x98, de)
		st64(a + 0x90, dx)
		st64(a + 0x88, ev)
		st64(a + 0x80, d)
		st64(a + 0x78, ef)
		st64(a + 0x70, eu)
		st64(a + 0x68, dj)
		st64(a + 0x60, ee)
		st64(a + 0x58, et)
		st64(a + 0x50, di)
		st64(a + 0x48, ed)
		st64(a + 0x40, es)
		st64(a + 0x38, dg)
		st64(a + 0x30, ec)
		st64(a + 0x28, dh)
		st64(a + 0x20, r9)
		st64(a + 0x18, eb)
		st64(a + 0x10, er)
		st64(a + 8, r6)
		st64(a, ea)
		st64(a + 0x130, dr)
		return dr
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value), p8 (value), p9 (value)
// types [heur]: c: TwoHopSwapV2Accounts (1 of 2 calls pass one, the others an untyped value: fn_7c768)
export function fn_7cf50(a: u64, b: u64, c: TwoHopSwapV2Accounts, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64): u64 {
	const s8 = fp - 0x8, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s68 = fp - 0x68, s90 = fp - 0x90, sa8 = fp - 0xa8, sc2 = fp - 0xc2, sc8 = fp - 0xc8, sf8 = fp - 0xf8, s110 = fp - 0x110, s140 = fp - 0x140, s158 = fp - 0x158, s160 = fp - 0x160, s170 = fp - 0x170, s178 = fp - 0x178, s190 = fp - 0x190, s198 = fp - 0x198, s1b0 = fp - 0x1b0, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s228 = fp - 0x228, s230 = fp - 0x230, s238 = fp - 0x238, s240 = fp - 0x240, s248 = fp - 0x248, s250 = fp - 0x250, s258 = fp - 0x258, s260 = fp - 0x260, s268 = fp - 0x268, s270 = fp - 0x270, s278 = fp - 0x278, s280 = fp - 0x280, s288 = fp - 0x288, s290 = fp - 0x290, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8, s2b0 = fp - 0x2b0, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2c8 = fp - 0x2c8, s2d0 = fp - 0x2d0, s2d8 = fp - 0x2d8, s2e0 = fp - 0x2e0, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, sfd8 = fp - 0xfd8, s1000 = fp - 0x1000
	let p, q, r: u64
	st64(s228 + 0x18, a)
	let s = fn_82718(s1b8, c)
	if (ld8(s1b8) != 0) {
		r = ld64(s1b0)
		p = ld64(s228 + 0x18)
		st64(p + 8, ld64(s1b0 + 8))
		st64(p, r)
		return s
	}
	let g = p9
	st64(s240, p8)
	let h = p6
	let i = p5
	const f = ld8(s1b8 + 1)
	st64(s228 + 0x10, g)
	if ((f & 1) != 0) {
		st64(s228, h, i)
		const l = p7
		const j = ld32(s1b0 + 8)
		const k = ld64(s1b0)
		st16(s90, j >> 0x10)
		st64(s1b8, 0x1001598a0)
		st64(s1b0 + 8, s160)
		st64(s160, s90, fn_14efa0, s60, fn_14f060)
		st64(s60, ((j << 0x30) | k >> 0x10))
		st64(s198, 0)
		st64(s1b0, 2)
		st64(s1b0 + 0x10, 2)
		// fmt "TFe: {}, {}" {} = j >> 0x10 [fn_14efa0], {} = (j << 0x30) | k >> 0x10 [fn_14f060]
		fn_147e78(s30, s1b8, s90, g, i)
		const m: AccountInfo = ld64(l)
		const n: LamportsCell = m.lamports
		const o = n.strong
		const w = ld64(s30 + 8)
		const v = ld64(s30 + 0x10)
		st64(s230, m.key)
		rc_inc(n, o)
		const t: DataCell = m.data
		const u = t.strong
		st64(s248, v)
		st64(s238, w)
		rc_inc(t, u)
		const aa = m.owner
		const z = m.rent_epoch
		const y = m.is_signer
		const x = m.is_writable
		st8(s178 + 2, m.executable)
		st8(s178, y, x)
		st64(s198, n, t, aa, z)
		st64(s1b0 + 0x10, ld64(s230))
		st64(s170, 8, 0)
		st64(s1b8, 0, 8, 0)
		s = fn_129f28(s1c8, s1b8, ld64(s238), ld64(s248))
		r = ld64(s1c8)
		g = ld64(s228 + 0x10)
		i = ld64(s228 + 8)
		h = ld64(s228)
		if (r != 2) {
			p = ld64(s228 + 0x18)
			st64(p + 8, ld64(s1c8 + 8))
			st64(p, r)
			return s
		}
	}
	const ak = ld64(ld64(h))
	const ab = ld64(d + 0x20)
	st64(s228, ab)
	const ac = ld64(ab)
	copyr(s90, ac, 0x20)
	const info: AccountInfo = c.token_mint_input.info
	st64(s228 + 8, info)
	const ae = info.key
	copyr(s60, ae, 0x20)
	const af: AccountInfo = ld64(i + 0x20)
	const ag = af.key
	copyr(s30, ag, 0x20)
	const ai = c.token_mint_input.decimals
	const ah: AccountInfo = ld64(b)
	const aj = ah.key
	st64(s1000, s30, aj, 8, 0, g, ai)
	fn_131a40(s1b8, ak, s90, s60, s30, aj, 8, 0, g, ai)
	copy(s110, s1b0, 0x18)
	const al = ld64(s1b8)
	if (al == 0x8000000000000000) {
		s = fn_13b430(s208, s110)
		r = ld64(s208)
		p = ld64(s228 + 0x18)
		st64(p + 8, ld64(s208 + 8))
		st64(p, r)
		return s
	}
	memcpy(s140, s198, 0x30)
	st64(s160, al)
	copy(s158, s110, 0x18)
	const am = ld64(0x300000000 /* heap bump-allocator cursor */)
	const at: AccountInfo = ld64(s228 + 8)
	const ao: AccountInfo = ld64(s228)
	const an = am != 0 ? sat_sub(am, 0xc0) & -8 : 0x300007f40
	if (an > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, an)
		const ap: LamportsCell = ao.lamports
		const ar = ao.key
		rc_inc(ap)
		const aq: DataCell = ao.data
		rc_inc(aq)
		st64(s238, ar)
		const au: LamportsCell = at.lamports
		st64(s230, au)
		const av = au.strong
		st64(s270, at.key)
		st64(s268, ao.executable)
		st64(s260, ao.is_writable)
		st64(s258, ao.is_signer)
		st64(s250, ao.rent_epoch)
		st64(s248, ao.owner)
		rc_inc(ld64(s230), av)
		const aw: DataCell = at.data
		rc_inc(aw)
		const ax: LamportsCell = af.lamports
		const ay = ax.strong
		st64(s278, aq)
		st64(s2a0, af.key)
		st64(s298, at.executable)
		st64(s290, at.is_writable)
		st64(s288, at.is_signer)
		st64(s280, at.rent_epoch)
		const bd = at.owner
		rc_inc(ax, ay)
		const az: DataCell = af.data
		const ba = az.strong
		st64(s2a8, aw)
		rc_inc(az, ba)
		const bb: LamportsCell = ah.lamports
		const bc = bb.strong
		st64(s2b0, bd)
		st64(s2e0, ah.key)
		st64(s2d8, af.executable)
		st64(s2d0, af.is_writable)
		st64(s2c8, af.is_signer)
		st64(s2c0, af.rent_epoch)
		st64(s2b8, af.owner)
		rc_inc(bb, bc)
		const be: DataCell = ah.data
		const bf = be.strong
		st64(s2e8, ap)
		st64(s2f8, af)
		be.strong = bf + 1
		if (bf != -1) {
			B21: {
				const bj = ah.owner
				const bi = ah.rent_epoch
				const bh = ah.is_signer
				const bg = ah.is_writable
				st64(s2f0, ah)
				st8(an + 0xba, ah.executable)
				st8(an + 0xb9, bg)
				st8(an + 0xb8, bh)
				st64(an + 0xb0, bi)
				st64(an + 0xa8, bj)
				st64(an + 0xa0, be)
				st64(an + 0x98, bb)
				st64(an + 0x90, ld64(s2e0))
				st8(an + 0x8a, ld64(s2d8))
				st8(an + 0x89, ld64(s2d0))
				st8(an + 0x88, ld64(s2c8))
				st64(an + 0x80, ld64(s2c0))
				st64(an + 0x78, ld64(s2b8))
				st64(an + 0x70, az)
				st64(an + 0x68, ax)
				st64(an + 0x60, ld64(s2a0))
				st8(an + 0x5a, ld64(s298))
				st8(an + 0x59, ld64(s290))
				st8(an + 0x58, ld64(s288))
				st64(an + 0x50, ld64(s280))
				st64(an + 0x48, ld64(s2b0))
				st64(an + 0x40, ld64(s2a8))
				st64(an + 0x38, ld64(s230))
				st64(an + 0x30, ld64(s270))
				st8(an + 0x2a, ld64(s268))
				st8(an + 0x29, ld64(s260))
				st8(an + 0x28, ld64(s258))
				st64(an + 0x20, ld64(s250))
				st64(an + 0x18, ld64(s248))
				st64(an + 0x10, ld64(s278))
				st64(an + 8, ld64(s2e8))
				st64(an, ld64(s238))
				st64(sf8, 4, an, 4)
				s = fn_804a8(s1b8, ld64(s228 + 8))
				if (ld8(s1b8) == 0) {
					st32(sf8 + 0x28, ld32(s1b8 + 2))
					st16(sf8 + 0x2c, ld16(s1b8 + 6))
					st64(sf8 + 0x18, ld64(s1b0 + 0x10))
					st16(sf8 + 0x20, ld16(s198))
					if ((ld8(s1b8 + 1) & 1) != 0) {
						const bo = ld64(s1b0 + 8)
						const bp = ld64(s1b0)
						st16(sc2 + 0x18, ld16(sf8 + 0x20))
						st64(sc2 + 0x10, ld64(sf8 + 0x18))
						st16(sc8 + 4, ld16(sf8 + 0x2c))
						st32(sc8, ld32(sf8 + 0x28))
						st64(sc2, bp, bo)
						const bq = ld64(s240)
						if (ld64(bq) == 0x8000000000000000) {
							s = fn_87630(s1e8, 0x32)
							q = ld64(s1e8 + 8)
							r = ld64(s1e8)
							break B21
						}
						const br: AccountInfo = ld64(s228)
						const bs: LamportsCell = br.lamports
						const cy = ld64(bq + 0x10)
						const cx = ld64(bq + 8)
						const by = br.key
						rc_inc(bs)
						const bt: DataCell = br.data
						rc_inc(bt)
						const bx = br.owner
						const bw = br.rent_epoch
						const bv = br.is_signer
						const bu = br.is_writable
						st8(s68 + 2, br.executable)
						st8(s68, bv, bu)
						st64(s90, by, bs, bt, bx, bw)
						const bz: AccountInfo = ld64(s228 + 8)
						const ca: LamportsCell = bz.lamports
						const cg = bz.key
						rc_inc(ca)
						const cb: DataCell = bz.data
						rc_inc(cb)
						const cf = bz.owner
						const ce = bz.rent_epoch
						const cd = bz.is_signer
						const cc = bz.is_writable
						st8(s38 + 2, bz.executable)
						st8(s38, cd, cc)
						st64(s60, cg, ca, cb, cf, ce)
						const ch: AccountInfo = ld64(s2f8)
						const ci: LamportsCell = ch.lamports
						const co = ch.key
						rc_inc(ci)
						const cj: DataCell = ch.data
						rc_inc(cj)
						const cn = ch.owner
						const cm = ch.rent_epoch
						const cl = ch.is_signer
						const ck = ch.is_writable
						st8(s8 + 2, ch.executable)
						st8(s8, cl, ck)
						st64(s30, co, ci, cj, cn, cm)
						const cp: AccountInfo = ld64(s2f0)
						const cq: LamportsCell = cp.lamports
						const cw = cp.key
						rc_inc(cq)
						const cr: DataCell = cp.data
						rc_inc(cr)
						const cv = cp.owner
						const cu = cp.rent_epoch
						const ct = cp.is_signer
						const cs = cp.is_writable
						st8(s190 + 2, cp.executable)
						st8(s190, ct, cs)
						st64(s1b8, cw, cq, cr, cv, cu)
						st64(sfd8, cx, cy)
						st64(s1000 + 0x20, ld64(s228 + 0x10))
						st64(s1000, s90, s60, s30, s1b8)
						fn_1225a0(sa8, s160, sf8, sc8, s90, s60, s30, s1b8, ld64(s1000 + 0x20), cx, cy)
						if (ld64(sa8) != 0x800000000000001a /* Ok */) {
							copyr(s1b8, sa8, 0x18)
							s = fn_13b430(s1d8, s1b8)
							q = ld64(s1d8 + 8)
							r = ld64(s1d8)
							break B21
						}
					}
					const cz = ld64(sf8 + 8)
					const da = ld64(sf8 + 0x10)
					st64(s1000, 8, 0)
					s = fn_1390d8(s30, s160, cz, da, fp)
					if (ld64(s30) == 0x800000000000001a /* Ok */) {
						q = ld64(sf8 + 0x10)
						if (q == 0) {
							p = ld64(s228 + 0x18)
							st64(p + 8, q)
							st64(p, 2)
							return s
						}
						let db = ld64(sf8 + 8) + 0x10
						while (true) {
							const dd = ld64(db)
							const dc = ld64(db - 8)
							rc_dec(dc)
							rc_dec(dd)
							db = db + 0x30
							q = q - 1
							if (q == 0) {
								p = ld64(s228 + 0x18)
								st64(p + 8, q)
								st64(p, 2)
								return s
							}
						}
					}
					copyr(s1b8, s30, 0x18)
					s = fn_13b430(s1f8, s1b8)
					q = ld64(s1f8 + 8)
					r = ld64(s1f8)
				} else {
					q = ld64(s1b0 + 8)
					r = ld64(s1b0)
				}
			}
			let bk = ld64(sf8 + 0x10)
			if (bk == 0) {
				p = ld64(s228 + 0x18)
				st64(p + 8, q)
				st64(p, r)
				return s
			}
			let bl = ld64(sf8 + 8) + 0x10
			while (true) {
				const bn = ld64(bl)
				const bm = ld64(bl - 8)
				rc_dec(bm)
				s = ld64(bn) - 1
				st64(bn, s)
				if (s == 0) {
					s = ld64(bn + 8) - 1
					st64(bn + 8, s)
				}
				bl = bl + 0x30
				bk = bk - 1
				if (bk == 0) {
					p = ld64(s228 + 0x18)
					st64(p + 8, q)
					st64(p, r)
					return s
				}
			}
		}
		abort()
	}
	alloc_handle_alloc_error(8, 0xc0)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), b (value), p5 (value), p6 (value), p8 (value), p9 (value)
// types [heur]: d: TokenAccount_2 (5 of 8 calls pass one, the others an untyped value: fn_3b360, fn_3b6d8, fn_3ba00); p5: TokenAccount_2 (5 of 8 calls pass one, the others an untyped value: fn_3b360, fn_3b6d8, fn_3ba00)
export function fn_7e5e0(a: u64, b: u64, c: u64, d: TokenAccount_2, p5: TokenAccount_2, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64): u64 {
	const s68 = fp - 0x68, s70 = fp - 0x70, s90 = fp - 0x90, s98 = fp - 0x98, sa8 = fp - 0xa8, sb0 = fp - 0xb0, se0 = fp - 0xe0, s110 = fp - 0x110, s140 = fp - 0x140, s158 = fp - 0x158, s172 = fp - 0x172, s178 = fp - 0x178, s1a8 = fp - 0x1a8, s1c0 = fp - 0x1c0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s208 = fp - 0x208, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2d8 = fp - 0x2d8, s2e0 = fp - 0x2e0, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, s300 = fp - 0x300, s308 = fp - 0x308, s310 = fp - 0x310, s318 = fp - 0x318, s320 = fp - 0x320, s328 = fp - 0x328, s330 = fp - 0x330, s338 = fp - 0x338, s340 = fp - 0x340, s348 = fp - 0x348, s350 = fp - 0x350, s358 = fp - 0x358, s360 = fp - 0x360, s368 = fp - 0x368, s370 = fp - 0x370, s378 = fp - 0x378, s380 = fp - 0x380, s388 = fp - 0x388, sfd8 = fp - 0xfd8, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let l, m, aq, bd, bg, bk: u64
	st64(s2d8 + 0x40, b)
	let n = fn_82718(sb0, c)
	if (ld8(sb0) != 0) {
		m = ld64(sa8)
		st64(a + 8, ld64(sa8 + 8))
		st64(a, m)
		return n
	}
	st64(s2d8 + 0x30, d)
	st64(s2d8, p10, p11)
	st64(s2d8 + 0x18, p9)
	st64(s2e0, p8)
	st64(s2d8 + 0x28, p7)
	st64(s2d8 + 0x10, p6)
	let q = p5
	const f = ld8(sb0 + 1)
	let k = a
	st64(s2d8 + 0x38, c)
	if ((f & 1) != 0) {
		const g = ld32(sa8 + 8)
		const h = ld64(sa8)
		st16(s140, g >> 0x10)
		st64(sb0, 0x1001598a0)
		st64(sa8 + 8, s210)
		st64(s210, s140, fn_14efa0, s110, fn_14f060)
		st64(s110, ((g << 0x30) | h >> 0x10))
		st64(s90, 0)
		st64(sa8, 2)
		st64(s98, 2)
		// fmt "TFe: {}, {}" {} = g >> 0x10 [fn_14efa0], {} = (g << 0x30) | h >> 0x10 [fn_14f060]
		fn_147e78(se0, sb0, s140)
		const i: AccountInfo = ld64(ld64(s2d8 + 0x28))
		const j: LamportsCell = i.lamports
		const w = ld64(se0 + 8)
		const x = ld64(se0 + 0x10)
		const v = i.key
		rc_inc(j)
		const o: DataCell = i.data
		const p = o.strong
		st64(s2e8, q)
		st64(s2d8 + 0x20, k)
		rc_inc(o, p)
		const u = i.owner
		const t = i.rent_epoch
		const s = i.is_signer
		const r = i.is_writable
		st8(s70 + 2, i.executable)
		st8(s70, s, r)
		st64(s98, v, j, o, u, t)
		st64(s68, 8, 0)
		st64(sb0, 0, 8, 0)
		n = fn_129f28(s220, sb0, w, x)
		m = ld64(s220)
		k = ld64(s2d8 + 0x20)
		q = ld64(s2e8)
		if (m != 2) {
			st64(k + 8, ld64(s220 + 8))
			st64(k, m)
			return n
		}
	}
	const y: AccountInfo = ld64(q + 0x20)
	const z: LamportsCell = y.lamports
	const ae = y.key
	rc_inc(z)
	const aa: DataCell = y.data
	rc_inc(aa)
	B32: {
		const af = y.owner
		const ad = y.rent_epoch
		const ac = y.is_signer
		const ab = y.is_writable
		st8(s1e8 + 2, y.executable)
		st8(s1e8, ac, ab)
		st64(s210, ae, z, aa, af, ad)
		const ag = memcmp(af, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20)
		l = 0
		m = 2
		n = ag as u32
		bk = ld64(s2d8 + 0x40)
		bg = ld64(s2d8 + 0x38)
		if (n != 0) {
			AccountInfo_try_borrow_data(sb0, s210, n)
			const aj = ld64(sa8 + 8)
			const ak = ld64(sa8)
			let ah = ld64(sb0)
			let ai = 0x800000000000001a /* Ok */
			if (ah != 0x800000000000001a /* Ok */) {
				st64(sb0, ah, ak, aj)
				n = fn_13b430(s230, sb0)
				l = ld64(s230 + 8)
				m = ld64(s230)
			} else {
				B26: {
					st64(s2d8 + 0x20, aj)
					const al = ld64(ak + 8)
					aq = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
					if (al != 0x163 && al >= 0xa5) {
						const am = ld64(ak)
						st64(s2e8, am)
						Account_unpack_from_slice_1333d0(sb0, am, 0xa5, ak)
						ai = undef
						ah = ld32(s68 + 0x40)
						if (ah == 2) {
							ah = ld64(sa8 + 8)
							ai = ld64(sa8)
							aq = ld64(sb0)
						} else {
							aq = 0x8000000000000009 /* Err(ProgramError::UninitializedAccount) */
							if (ld8(s68 + 0x24) != 0) {
								ai = 0
								ah = 1
								aq = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
								if (al != 0xa6) {
									B20: {
										B19: {
											if (al != 0xa5) {
												aq = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
												if (ld8(ld64(s2e8) + 0xa5) != 2) {
													break B26
												}
												st64(s2e8, ld64(s2e8) + 0xa6)
												st64(s2f0, al - 0xa6)
												while (true) {
													const df = fn_12e0b0(se0, ai)
													const dc = ld64(s2f0)
													bd = ld64(s2d8 + 0x30)
													const db = ld64(se0 + 0x10)
													if (db > dc) {
														break B19
													}
													const dd = ld64(se0 + 8)
													const de = ld64(se0)
													if (de > dd) {
														fn_14c690(de, dd, 0x100159390, dd, bd)
													}
													st64(s2f8, db)
													if (dd > dc) {
														fn_14c5c0(dd, ld64(s2f0), 0x100159390, dd, bd)
													}
													fn_12e558(sb0, ld64(s2e8) + de, dd - de, df)
													if (ld64(sb0) != 0x800000000000001a /* Ok */) {
														break
													}
													const dg = ld16(sa8)
													bd = ld64(s2d8 + 0x30)
													if (0x1b >= dg) {
														const da = ld64(s2f0)
														const dh = ld64(s2f8)
														if (((1 << (dg & 0x3f)) & 0x802a8a4) != 0) {
															if (dh >= dd) {
																if (dh - dd != 2) {
																	break B19
																}
																const di = ld16(ld64(s2e8) + dd)
																ai = dh > dh + di ? 0xffffffffffffffff : dh + di
																if (da > ai) {
																	continue
																}
																break B19
															}
															fn_14c690(dd, dh, 0x1001593a8, dg, bd)
														}
														if (((1 << (dg & 0x3f)) & 0x7fd565a) != 0) {
															break B19
														}
														if (dg == 8) {
															const dk = ld64(s2e8)
															const dj = k
															if (ld64(s2f8) >= dd) {
																k = dj
																bg = ld64(s2d8 + 0x38)
																bd = ld64(s2d8 + 0x30)
																if (ld64(s2f8) - dd == 2) {
																	const dm = ld16(dk + dd)
																	const dl = ld64(s2f8)
																	const dn = dl > dl + dm ? 0xffffffffffffffff : dl + dm
																	k = dj
																	bg = ld64(s2d8 + 0x38)
																	bd = ld64(s2d8 + 0x30)
																	if (dn > ld64(s2f0)) {
																		break B19
																	}
																	if (dn - ld64(s2f8) == 1) {
																		l = ld8(dk + ld64(s2f8)) != 0
																		k = dj
																		bg = ld64(s2d8 + 0x38)
																		bd = ld64(s2d8 + 0x30)
																		break B20
																	}
																	break B19
																}
																break B19
															}
															fn_14c690(dd, ld64(s2f8), 0x100159378, dj, bd)
														}
													}
													bg = ld64(s2d8 + 0x38)
													break
												}
											}
											bd = ld64(s2d8 + 0x30)
										}
										l = 0
									}
									const an = ld64(s2d8 + 0x20)
									st64(an, ld64(an) - 1)
									const ap = ld64(s208 + 8)
									const ao = ld64(s208)
									bk = ld64(s2d8 + 0x40)
									rc_dec(ao)
									if (!rc_release(ap)) {
										break B32
									}
									st64(ap + 8, ld64(ap + 8) - 1)
									break B32
								}
							}
						}
					}
				}
				st64(sb0, aq, ai, ah)
				n = fn_13b430(s240, sb0)
				l = ld64(s240 + 8)
				m = ld64(s240)
				const ar = ld64(s2d8 + 0x20)
				st64(ar, ld64(ar) - 1)
				bk = ld64(s2d8 + 0x40)
			}
		}
		const au = ld64(s208 + 8)
		const at = ld64(s208)
		rc_dec(at)
		rc_dec(au)
		bd = ld64(s2d8 + 0x30)
		if (m != 2) {
			st64(k + 8, l)
			st64(k, m)
			return n
		}
	}
	if ((l as u8) != 0) {
		const av: AccountInfo = ld64(ld64(s2d8 + 0x28))
		const aw: LamportsCell = av.lamports
		const bc = av.key
		rc_inc(aw)
		const ax: DataCell = av.data
		rc_inc(ax)
		const bb = av.owner
		const ba = av.rent_epoch
		const az = av.is_signer
		const ay = av.is_writable
		st8(s70 + 2, av.executable)
		st8(s70, az, ay)
		st64(s98, bc, aw, ax, bb, ba)
		st64(s68, 8, 0)
		st64(sb0, 0, 8, 0)
		n = fn_129f28(s250, sb0, ld64(s2d8), ld64(s2d8 + 8))
		m = ld64(s250)
		bk = ld64(s2d8 + 0x40)
		bg = ld64(s2d8 + 0x38)
		bd = ld64(s2d8 + 0x30)
		if (m != 2) {
			st64(k + 8, ld64(s250 + 8))
			st64(k, m)
			return n
		}
	}
	st64(s2d8 + 0x20, k)
	const bo = ld64(ld64(ld64(s2d8 + 0x10)))
	const be = ld64(bd + 0x20)
	st64(s2d8 + 0x10, be)
	const bf = ld64(be)
	copyr(s178, bf, 0x20)
	const bh = ld64(bg + 0x58)
	st64(s2d8 + 0x28, bh)
	const bi = ld64(bh)
	copyr(s140, bi, 0x20)
	const bj = y.key
	copyr(s110, bj, 0x20)
	const bl = ld64(bk)
	st64(s2d8 + 0x30, bl)
	const bm = ld64(bl)
	copyr(se0, bm, 0x20)
	const bn = ld8(bg + 0x30)
	st64(sff8 + 0x18, ld64(s2d8 + 0x18))
	st64(sfd8, bn)
	st64(s1000, s110, se0, 8, 0)
	fn_131a40(sb0, bo, s178, s140, s110, se0, 8, 0, ld64(sff8 + 0x18), bn)
	copy(s1c0, sa8, 0x18)
	const bp = ld64(sb0)
	if (bp == 0x8000000000000000) {
		n = fn_13b430(s290, s1c0)
		m = ld64(s290)
		k = ld64(s2d8 + 0x20)
		st64(k + 8, ld64(s290 + 8))
		st64(k, m)
		return n
	}
	memcpy(s1f0, s90, 0x30)
	st64(s210, bp)
	copy(s208, s1c0, 0x18)
	const bq = ld64(0x300000000 /* heap bump-allocator cursor */)
	const bw: AccountInfo = ld64(s2d8 + 0x28)
	let br = bq != 0 ? sat_sub(bq, 0xc0) & -8 : 0x300007f40
	const bs: AccountInfo = ld64(s2d8 + 0x10)
	if (br > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, br)
		const bt: LamportsCell = bs.lamports
		const bu = bt.strong
		st64(s2d8 + 8, bs.key)
		rc_inc(bt, bu)
		const bv: DataCell = bs.data
		rc_inc(bv)
		const bx: LamportsCell = bw.lamports
		st64(s2d8 + 0x38, bx)
		const by = bx.strong
		st64(s310, bw.key)
		st64(s308, bs.executable)
		st64(s300, bs.is_writable)
		st64(s2f8, bs.is_signer)
		st64(s2f0, bs.rent_epoch)
		st64(s2e8, bs.owner)
		rc_inc(ld64(s2d8 + 0x38), by)
		const bz: DataCell = bw.data
		rc_inc(bz)
		const ca: LamportsCell = y.lamports
		const cb = ca.strong
		st64(s318, bv)
		st64(s340, y.key)
		st64(s338, bw.executable)
		st64(s330, bw.is_writable)
		st64(s328, bw.is_signer)
		st64(s320, bw.rent_epoch)
		const ch = bw.owner
		rc_inc(ca, cb)
		const cc: DataCell = y.data
		const cd = cc.strong
		st64(s348, ca)
		rc_inc(cc, cd)
		st64(s2d8, bz)
		const ce = ld64(s2d8 + 0x30)
		const cf = ld64(ce + 8)
		const cg = ld64(cf)
		st64(s378, ld64(ce))
		st64(s370, y.executable)
		st64(s368, y.is_writable)
		st64(s360, y.is_signer)
		st64(s358, y.rent_epoch)
		st64(s350, y.owner)
		rc_inc(cf, cg)
		st64(s388, ch)
		const ci = ld64(ce + 0x10)
		const cj = ld64(ci)
		st64(s380, bt)
		st64(ci, cj + 1)
		if (cj != -1) {
			B50: {
				const ck: AccountInfo = ld64(s2d8 + 0x30)
				const co = ck.owner
				const cn = ck.rent_epoch
				const cm = ck.is_signer
				const cl = ck.is_writable
				st8(br + 0xba, ck.executable)
				st8(br + 0xb9, cl)
				st8(br + 0xb8, cm)
				st64(br + 0xb0, cn)
				st64(br + 0xa8, co)
				st64(br + 0xa0, ci)
				st64(br + 0x98, cf)
				st64(br + 0x90, ld64(s378))
				st8(br + 0x8a, ld64(s370))
				st8(br + 0x89, ld64(s368))
				st8(br + 0x88, ld64(s360))
				st64(br + 0x80, ld64(s358))
				st64(br + 0x78, ld64(s350))
				st64(br + 0x70, cc)
				st64(br + 0x68, ld64(s348))
				st64(br + 0x60, ld64(s340))
				st8(br + 0x5a, ld64(s338))
				st8(br + 0x59, ld64(s330))
				st8(br + 0x58, ld64(s328))
				st64(br + 0x50, ld64(s320))
				st64(br + 0x48, ld64(s388))
				st64(br + 0x40, ld64(s2d8))
				st64(br + 0x38, ld64(s2d8 + 0x38))
				st64(br + 0x30, ld64(s310))
				st8(br + 0x2a, ld64(s308))
				st8(br + 0x29, ld64(s300))
				st8(br + 0x28, ld64(s2f8))
				st64(br + 0x20, ld64(s2f0))
				st64(br + 0x18, ld64(s2e8))
				st64(br + 0x10, ld64(s318))
				st64(br + 8, ld64(s380))
				st64(br, ld64(s2d8 + 8))
				st64(s1a8, 4, br, 4)
				const cp = ld64(s2d8 + 0x28)
				n = fn_804a8(sb0, cp)
				if (ld8(sb0) == 0) {
					st32(s1a8 + 0x28, ld32(sb0 + 2))
					st16(s1a8 + 0x2c, ld16(sb0 + 6))
					st64(s1a8 + 0x18, ld64(s98))
					st16(s1a8 + 0x20, ld16(s90))
					let cy = 4
					if ((ld8(sb0 + 1) & 1) != 0) {
						const cu = ld64(sa8 + 8)
						const cv = ld64(sa8)
						st16(s172 + 0x18, ld16(s1a8 + 0x20))
						st64(s172 + 0x10, ld64(s1a8 + 0x18))
						st16(s178 + 4, ld16(s1a8 + 0x2c))
						st32(s178, ld32(s1a8 + 0x28))
						st64(s172, cv, cu)
						const cw = ld64(s2e0)
						if (ld64(cw) == 0x8000000000000000) {
							n = fn_87630(s270, 0x32)
							l = ld64(s270 + 8)
							m = ld64(s270)
							break B50
						}
						copyr(s2d8, cw + 8, 0x10)
						st64(s2d8 + 0x38, s140)
						AccountInfo_clone(s140, ld64(s2d8 + 0x10))
						AccountInfo_clone(s110, cp)
						AccountInfo_clone(se0, y)
						AccountInfo_clone(sb0, ld64(s2d8 + 0x30))
						copy(sfd8, s2d8, 0x10)
						st64(sff8 + 0x18, ld64(s2d8 + 0x18))
						st64(sff8, s110, se0, sb0)
						st64(s1000, ld64(s2d8 + 0x38))
						fn_1225a0(s158, s210, s1a8, s178, ld64(s1000), s110, se0, sb0, ld64(sff8 + 0x18), ld64(sfd8), ld64(sfd8 + 8))
						if (ld64(s158) != 0x800000000000001a /* Ok */) {
							copyr(sb0, s158, 0x18)
							n = fn_13b430(s260, sb0)
							l = ld64(s260 + 8)
							m = ld64(s260)
							break B50
						}
						cy = ld64(s1a8 + 0x10)
						br = ld64(s1a8 + 8)
					}
					st64(s140, sb0)
					const cx = ld64(s2d8 + 0x40)
					st64(s68 + 8, cx + 0x28c)
					st64(s70, cx + 0x286)
					st64(s90 + 0x10, cx + 0x1e8)
					st64(s90, cx + 0x1a8)
					st64(sa8 + 8, cx + 0x188)
					st64(sb0, 0x100152b28)
					st64(s140 + 8, 6)
					st64(s68 + 0x10, 1)
					st64(s68, 2)
					st64(s90 + 0x18, 0x20)
					st64(s90 + 8, 0x20)
					st64(s98, 0x20)
					st64(sa8, 9)
					st64(s1000, s140, 1)
					const cz = fn_1390d8(s110, s210, br, cy, fp)
					if (ld64(s110) == 0x800000000000001a /* Ok */) {
						n = fn_c640(s1a8, cz)
						k = ld64(s2d8 + 0x20)
						st64(k + 8, undef)
						st64(k, 2)
						return n
					}
					copyr(se0, s110, 0x18)
					n = fn_13b430(s280, se0)
					l = ld64(s280 + 8)
					m = ld64(s280)
				} else {
					l = ld64(sa8 + 8)
					m = ld64(sa8)
				}
			}
			k = ld64(s2d8 + 0x20)
			let cq = ld64(s1a8 + 0x10)
			if (cq == 0) {
				st64(k + 8, l)
				st64(k, m)
				return n
			}
			let cr = ld64(s1a8 + 8) + 0x10
			while (true) {
				const ct = ld64(cr)
				const cs = ld64(cr - 8)
				rc_dec(cs)
				n = ld64(ct) - 1
				st64(ct, n)
				if (n == 0) {
					n = ld64(ct + 8) - 1
					st64(ct + 8, n)
				}
				cr = cr + 0x30
				cq = cq - 1
				if (cq == 0) {
					st64(k + 8, l)
					st64(k, m)
					return n
				}
			}
		}
		abort()
	}
	alloc_handle_alloc_error(8, 0xc0)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (value)
export function fn_804a8(a: u64, b: AccountInfo): u64 {
	const s20 = fp - 0x20, s88 = fp - 0x88, s90 = fp - 0x90, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8
	let x: u64
	const f: LamportsCell = b.lamports
	const k = b.key
	rc_inc(f)
	const g: DataCell = b.data
	rc_inc(g)
	const l = b.owner
	const j = b.rent_epoch
	const i = b.is_signer
	const h = b.is_writable
	st8(s90 + 2, b.executable)
	st8(s90, i, h)
	st64(sb8, k, f, g, l, j)
	let m = memcmp(l, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32
	if (m == 0) {
		st16(a, 0)
	} else {
		const p = AccountInfo_try_borrow_data(s88, sb8, m)
		const u = ld64(s88 + 0x10)
		const o = ld64(s88 + 8)
		const n = ld64(s88)
		if (n == 0x800000000000001a /* Ok */) {
			m = fn_afd0(s88, ld64(o), ld64(o + 8), undef, undef, p)
			if (ld32(s88) != 2) {
				B33: {
					const y = ld64(s88 + 0x60)
					if (y != 0) {
						const ai = ld64(s88 + 0x58)
						let z = 0
						do {
							m = fn_12e0b0(s20, z)
							const aa = ld64(s20 + 0x10)
							if (aa > y) {
								break
							}
							const ab = ld64(s20 + 8)
							const ac = ld64(s20)
							if (ac > ab) {
								fn_14c690(ac, ab, 0x100159390)
							}
							if (ab > y) {
								fn_14c5c0(ab, y, 0x100159390)
							}
							m = fn_12e558(s88, ai + ac, ab - ac, m)
							if (ld64(s88) != 0x800000000000001a /* Ok */) {
								break
							}
							const ad = ld16(s88 + 8)
							if (ad > 0x1b) {
								break
							}
							if (((1 << (ad & 0x3f)) & 0x7fd165a) == 0) {
								if (((1 << (ad & 0x3f)) & 0x802a9a4) != 0) {
									break
								}
								if (ad == 0xe) {
									if (aa >= ab) {
										if (aa - ab == 2) {
											const af = ld16(ai + ab)
											const ag = aa > aa + af ? 0xffffffffffffffff : aa + af
											if (ag > y) {
												break
											}
											if (ag - aa != 0x40) {
												break
											}
											copyr(s20, ai + aa + 0x20, 0x20)
											m = fn_138ab8(s88, s20)
											break B33
										}
										break
									}
									fn_14c690(ab, aa, 0x100159378)
								}
								break
							}
							if (ab > aa) {
								fn_14c690(ab, aa, 0x1001593a8)
							}
							if (aa - ab != 2) {
								break
							}
							const ae = ld16(ai + ab)
							z = aa > aa + ae ? 0xffffffffffffffff : aa + ae
						} while (y > z)
					}
					st8(s88, 0)
				}
				st8(a + 0x21, ld8(s88 + 0x20))
				st64(a + 0x19, ld64(s88 + 0x18))
				st64(a + 0x11, ld64(s88 + 0x10))
				st64(a + 9, ld64(s88 + 8))
				st64(a + 1, ld64(s88))
				st8(a, 0)
				st64(u, ld64(u) - 1)
				x = ld64(sb8 + 0x10)
				const ah: LamportsCell = ld64(sb8 + 8)
				rc_dec(ah)
				if (!rc_release(x)) {
					return m
				}
				st64(x + 8, ld64(x + 8) - 1)
				return m
			}
			const q = ld64(s88 + 0x18)
			st64(s20 + 0x14, q)
			const r = ld64(s88 + 0x10)
			st64(s20 + 0xc, r)
			const s = ld64(s88 + 8)
			st64(s20 + 4, s)
			st64(s88, s, r, q)
			m = fn_13b430(sd8, s88)
			const t = ld64(sd8)
			st64(a + 0x10, ld64(sd8 + 8))
			st64(a + 8, t)
			st8(a, 1)
			st64(u, ld64(u) - 1)
		} else {
			st64(s88, n, o, u)
			m = fn_13b430(sc8, s88)
			const v = ld64(sc8)
			st64(a + 0x10, ld64(sc8 + 8))
			st64(a + 8, v)
			st8(a, 1)
		}
	}
	x = ld64(sb8 + 0x10)
	const w: LamportsCell = ld64(sb8 + 8)
	rc_dec(w)
	if (!rc_release(x)) {
		return m
	}
	st64(x + 8, ld64(x + 8) - 1)
	return m
}

export function fn_80ca8(a: u64, b: u64, c: u64): u64 {
	const s60 = fp - 0x60, s68 = fp - 0x68, s88 = fp - 0x88, s90 = fp - 0x90, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s130 = fp - 0x130, s140 = fp - 0x140, s148 = fp - 0x148, s150 = fp - 0x150, s158 = fp - 0x158, s160 = fp - 0x160
	let n, t, ab, ac, bb, bm: u64
	st64(s128, c, a)
	const f: AccountInfo = ld64(b + 0x58)
	const g: LamportsCell = f.lamports
	const l = f.key
	rc_inc(g)
	const h: DataCell = f.data
	rc_inc(h)
	B9: {
		const m = f.owner
		const k = f.rent_epoch
		const j = f.is_signer
		const i = f.is_writable
		st8(s90 + 2, f.executable)
		st8(s90, j, i)
		st64(sb8, l, g, h, m, k)
		n = memcmp(m, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32
		if (n == 0) {
			const r = ld64(s128 + 8)
			st64(r, 2)
			st8(r + 8, 1)
		} else {
			const o = f.key
			copyr(s68, o, 0x20)
			n = rent_check_id_133890(s68)
			if (n == 0) {
				const p = ld32(b + 0x34)
				if (p == 0 || ld64(s128) != 0) {
					const w = AccountInfo_try_borrow_data(s68, sb8, n)
					let ad = ld64(s60 + 8)
					const v = ld64(s60)
					const u = ld64(s68)
					if (u == 0x800000000000001a /* Ok */) {
						B15: {
							fn_afd0(s68, ld64(v), ld64(v + 8), undef, undef, w)
							let ak = undef
							if (ld32(s68) != 2) {
								st64(s150, p)
								let av = 2
								n = 0
								let ah = ld64(s60 + 0x50)
								let ag = ld64(s60 + 0x58)
								st64(s88, 0, 2, 0)
								let at = 0
								st64(s140, ah, ag)
								if (ag != 0) {
									st64(s148, ad)
									let ap = 2
									ak = 1
									let aj = 0
									let ar = 0
									let ai = 0
									while (true) {
										B32: {
											n = ak
											const al = ai
											if (ag >= ai + 2) {
												if (0xfffffffffffffffe > ai) {
													const am = ld16(ah + ai)
													ak = am - 1
													if (0x1b > ak) {
														const an = ai + 4
														if (an > ag) {
															st64(s68, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
															fn_13b430(se8, s68)
															ak = undef
															n = ld64(se8 + 8)
															av = ld64(se8)
														} else {
															const ao = n
															if (n - 1 == ld64(s88)) {
																st64(s130, n)
																fn_ec20(s88, ao - 1, n)
																n = ld64(s130)
																ah = ld64(s140)
																ag = ld64(s140 + 8)
																ap = ld64(s88 + 8)
															}
															st16(ap + aj, am)
															st64(s88 + 0x10, n)
															if (al + 2 > an) {
																fn_14c690(al + 2, an, 0x10015a310, ag, ah)
															}
															const aq = ld16(ah + (al + 2))
															ai = an > an + aq ? 0xffffffffffffffff : an + aq
															if (ag >= ai) {
																aj = aj + 2
																ak = n + 1
																ar = n
																if (ag > ai) {
																	continue
																}
																av = ld64(s88 + 8)
																at = ld64(s88)
																ad = ld64(s148)
																break
															}
															st64(s68, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
															fn_13b430(sd8, s68)
															ak = undef
															n = ld64(sd8 + 8)
															av = ld64(sd8)
														}
													} else {
														if (am == 0) {
															break B32
														}
														st64(s68, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
														fn_13b430(sf8, s68)
														ak = undef
														n = ld64(sf8 + 8)
														av = ld64(sf8)
													}
													ad = ld64(s148)
													at = 0x8000000000000000
													ag = ld64(s140 + 8)
													break
												}
												fn_14c690(ai, al + 2, 0x10015a2f8, ag, ah)
											}
										}
										av = ld64(s88 + 8)
										at = ld64(s88)
										n = ar
										ad = ld64(s148)
										break
									}
								}
								if (at == 0x8000000000000000) {
									const au = ld64(s128 + 8)
									st64(au + 8, n)
									st64(au, av)
									st64(ad, ld64(ad) - 1)
									break B9
								}
								B83: {
									if (n != 0) {
										B90: {
											if (ld64(s128) != 0) {
												B95: {
													B94: {
														if (ag != 0) {
															n = n << 1
															let ax = av + n
															while (true) {
																const ay = ld16(av)
																if (ay > 0x1a) {
																	break B90
																}
																if (((1 << (ay & 0x3f)) & 0x60d541a) == 0) {
																	if (ay != 6) {
																		break B90
																	}
																	st64(s158, ax)
																	let az = 0
																	while (true) {
																		const bh = fn_12e0b0(s88, az)
																		ag = undef
																		const bd = ld64(s140 + 8)
																		st64(s128, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
																		bb = 0x14
																		st64(s130, 0x14)
																		const bc = ld64(s88 + 0x10)
																		ak = 0
																		if (bc > bd) {
																			break B94
																		}
																		const be = ld64(s88 + 8)
																		const bf = ld64(s88)
																		if (bf > be) {
																			fn_14c690(bf, be, 0x100159390, ag)
																		}
																		const bg = ld64(s140)
																		if (be > bd) {
																			fn_14c5c0(be, ld64(s140 + 8), 0x100159390, ag)
																		}
																		n = fn_12e558(s68, bg + bf, be - bf, bh)
																		ag = undef
																		const bj = ld16(s60)
																		const bi = ld64(s68)
																		if (bi != 0x800000000000001a /* Ok */) {
																			ag = ld64(s60 + 8)
																			bb = ld32(s60 + 4)
																			ak = ld16(s60 + 2)
																			st64(s130, bj, bi)
																			break B94
																		}
																		if (0x1b >= bj) {
																			const ba = ld64(s140 + 8)
																			if (((1 << (bj & 0x3f)) & 0x7fd561a) != 0) {
																				if (be > bc) {
																					fn_14c690(be, bc, 0x1001593a8, ag, ba)
																				}
																				if (bc - be != 2) {
																					st64(s128, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
																					const bs = ld64(s148)
																					bb = bs >> 0x20
																					ak = bs >> 0x10
																					st64(s130, bs)
																					break B94
																				}
																				const bk = ld64(s140)
																				st64(s148, bk + be)
																				bb = bc + ld16(bk + be)
																				ak = 0
																				ag = bc > bb
																				az = ag != 0 ? 0xffffffffffffffff : bb
																				if (ba > az) {
																					continue
																				}
																				break B94
																			}
																			bb = (1 << (bj & 0x3f)) & 0x802a9a4
																			if (bb != 0) {
																				ak = 0
																				st64(s128, 0x8000000000000000)
																				break B94
																			}
																			if (bj == 6) {
																				const bl = ad
																				if (be > bc) {
																					fn_14c690(be, bc, 0x100159378, ag, bl)
																				}
																				bm = ld64(s140) + be
																				st64(s128, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
																				ad = bl
																				if (bc - be != 2) {
																					break B95
																				}
																				const bn = ld16(bm)
																				const bo = bc > bc + bn ? 0xffffffffffffffff : bc + bn
																				bm = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
																				st64(s128, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
																				ad = bl
																				if (bo > ld64(s140 + 8)) {
																					break B95
																				}
																				st64(s128, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
																				bm = ld64(s160)
																				if (bo - bc != 1) {
																					break B95
																				}
																				st64(s160, ld64(s140) + bc)
																				ax = ld64(s158)
																				if (ld64(s150) != 0) {
																					break
																				}
																				if (ld8(ld64(s160)) != 1) {
																					break B90
																				}
																				break
																			}
																		}
																		bb = 0x30
																		st64(s130, 0x30)
																		ak = 0
																		st64(s128, 0x8000000000000000)
																		break B94
																	}
																}
																av = av + 2
																if (av == ax) {
																	break B83
																}
															}
														}
														n = n << 1
														while (true) {
															const bp = ld16(av)
															if (bp > 0x1a) {
																break B90
															}
															if (((1 << (bp & 0x3f)) & 0x60d541a) == 0) {
																if (bp == 6) {
																	bb = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
																	st64(s128, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
																	break
																}
																break B90
															}
															av = av + 2
															n = n - 2
															if (n == 0) {
																break B83
															}
														}
													}
													bm = (bb << 0x20) | (((ak as u16) << 0x10) | (ld64(s130) as u16))
												}
												st64(s60, bm, ag)
												st64(s68, ld64(s128))
												n = fn_13b430(s108, s68)
												ac = ld64(s108)
												ab = ld64(s108 + 8)
												break B15
											}
											n = n << 1
											while (true) {
												B49: {
													const aw = ld16(av)
													if ((aw as i64) > 9) {
														if (0x1a >= aw) {
															if (((1 << (aw & 0x3f)) & 0x20d0000) != 0) {
																break B49
															}
															if (aw == 0xe) {
																break
															}
															if (aw == 0x1a) {
																break
															}
														}
														if (aw != 0xa) {
															break
														}
													} else if ((aw as i64) > 3) {
														if (aw != 4) {
															break
														}
													} else if (aw != 1) {
														break
													}
												}
												av = av + 2
												n = n - 2
												if (n == 0) {
													break B83
												}
											}
										}
										const bt = ld64(s128 + 8)
										st64(bt, 2)
										st8(bt + 8, 0)
										st64(ad, ld64(ad) - 1)
										break B9
									}
								}
								const bq = ld64(s128 + 8)
								st64(bq, 2)
								st8(bq + 8, 1)
								st64(ad, ld64(ad) - 1)
								t = ld64(sb8 + 0x10)
								const br: LamportsCell = ld64(sb8 + 8)
								rc_dec(br)
								if (!rc_release(t)) {
									return n
								}
								st64(t + 8, ld64(t + 8) - 1)
								return n
							}
							const x = ld64(s60 + 0x10)
							st64(s88 + 0x14, x)
							const y = ld64(s60 + 8)
							st64(s88 + 0xc, y)
							const z = ld64(s60)
							st64(s88 + 4, z)
							st64(s68, z, y, x)
							n = fn_13b430(s118, s68)
							ac = ld64(s118)
							ab = ld64(s118 + 8)
						}
						const aa = ld64(s128 + 8)
						st64(aa + 8, ab)
						st64(aa, ac)
						st64(ad, ld64(ad) - 1)
						break B9
					}
					st64(s68, u, v, ad)
					n = fn_13b430(sc8, s68)
					const af = ld64(sc8)
					const ae = ld64(s128 + 8)
					st64(ae + 8, ld64(sc8 + 8))
					st64(ae, af)
					break B9
				}
			}
			const q = ld64(s128 + 8)
			st64(q, 2)
			st8(q + 8, 0)
		}
	}
	t = ld64(sb8 + 0x10)
	const s: LamportsCell = ld64(sb8 + 8)
	rc_dec(s)
	if (!rc_release(t)) {
		return n
	}
	st64(t + 8, ld64(t + 8) - 1)
	return n
}

export function fn_81d00(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10, s40 = fp - 0x40, s58 = fp - 0x58, s88 = fp - 0x88, sab = fp - 0xab, sb5 = fp - 0xb5, scb = fp - 0xcb, scc = fp - 0xcc, sd8 = fp - 0xd8, se0 = fp - 0xe0, se8 = fp - 0xe8
	const f = ld64(d)
	let g = memcmp(ld64(f + 0x18), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20) as u32
	if (g != 0) {
		st64(a, 2)
		st8(a + 8, 0)
		return g
	}
	const h = ld64(f + 0x10)
	const i = ld64(h + 0x10)
	if (0x7fffffffffffffff > i) {
		st64(h + 0x10, i + 1)
		const j = ld64(h + 0x18)
		st64(s10 + 8, ld64(h + 0x20))
		st64(s10, j)
		g = fn_105168(s58, s10)
		if (ld8(s58) == 0) {
			st64(se8, c)
			st32(scb + 2, ld32(s58 + 4))
			st32(scc, ld32(s58 + 1))
			st64(sd8, ld64(s58 + 8))
			st64(se0, ld64(s58 + 0x10))
			memcpy(s88, s40, 0x2a)
			memcpy(sb5, s88, 0x2a)
			st64(scb + 0xe, ld64(se0))
			st64(scb + 6, ld64(sd8))
			st64(h + 0x10, ld64(h + 0x10) - 1)
			g = memcmp(scb, b, 0x20) as u32
			if (g == 0) {
				g = memcmp(sab, ld64(se8), 0x20) as u32
				st8(a + 8, g == 0)
				st64(a, 2)
				return g
			}
			st8(a + 8, 0)
			st64(a, 2)
			return g
		}
		const k = ld64(s58 + 8)
		st64(a + 8, ld64(s58 + 0x10))
		st64(a, k)
		st64(h + 0x10, ld64(h + 0x10) - 1)
		return g
	}
	fn_1486f0(0x10015a280, 0x7fffffffffffffff)
}

export function fn_82008(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10, s58 = fp - 0x58
	const f = ld64(ld64(d + 0x58))
	copyr(s58, f, 0x20)
	let m = fn_81d00(s10, c, s58, b)
	const g = ld64(s10)
	if (g != 2) {
		st64(a + 8, ld64(s10 + 8))
		st64(a, g)
		return m
	}
	if (ld8(s10 + 8) == 0) {
		st64(a, 2)
		st8(a + 8, 0)
		return m
	}
	const h = ld64(ld64(b) + 0x10)
	const i = ld64(h + 0x10)
	if (0x7fffffffffffffff > i) {
		st64(h + 0x10, i + 1)
		const j = ld64(h + 0x18)
		st64(s10 + 8, ld64(h + 0x20))
		st64(s10, j)
		m = fn_105168(s58, s10)
		if (ld8(s58) == 0) {
			const l = ld8(s58 + 1)
			st64(h + 0x10, ld64(h + 0x10) - 1)
			st8(a + 8, l & 1)
			st64(a, 2)
			return m
		}
		const k = ld64(s58 + 8)
		st64(a + 8, ld64(s58 + 0x10))
		st64(a, k)
		st64(h + 0x10, ld64(h + 0x10) - 1)
		return m
	}
	fn_1486f0(0x10015a298, 0x7fffffffffffffff)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), a (points to it), b (value)
export function fn_82238(a: u64, b: u64, c: u64): u64 {
	const s20 = fp - 0x20, s30 = fp - 0x30
	let i = fn_82718(s20, b)
	if (ld8(s20) != 0) {
		const f = ld64(s20 + 8)
		st64(a + 0x10, ld64(s20 + 0x10))
		st64(a + 8, f)
		st64(a, 1)
		return i
	}
	st32(s20 + 0x18, ld32(s20 + 2))
	st16(s20 + 0x1c, ld16(s20 + 6))
	if ((ld8(s20 + 1) & 1) == 0) {
		st64(a + 8, c, 0)
		st64(a, 0)
		return i
	}
	const g = ld32(s20 + 0x10)
	const h = ld64(s20 + 8)
	st16(s20 + 4, ld16(s20 + 0x1c))
	st32(s20, ld32(s20 + 0x18))
	st32(s20 + 0xe, g)
	st64(s20 + 6, h)
	i = fn_12db08(s30, s20, c, i)
	if (ld64(s30) == 0) {
		fn_1490e8(0x10015a2b0)
	}
	const j = ld64(s30 + 8)
	if (c >= j) {
		st64(a + 0x10, j)
		st64(a + 8, c - j)
		st64(a, 0)
		return i
	}
	fn_1490e8(0x10015a2c8)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value)
export function fn_823e0(a: u64, b: u64, c: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70
	let i, k: u64
	if (c != 0) {
		r0 = fn_82718(s20, b)
		if (ld8(s20) == 0) {
			st32(s20 + 0x18, ld32(s20 + 2))
			st16(s20 + 0x1c, ld16(s20 + 6))
			if ((ld8(s20 + 1) & 1) == 0) {
				st64(a + 8, c, 0)
				st64(a, 0)
				return r0
			}
			const h = ld32(s20 + 0x10)
			const g = ld64(s20 + 8)
			st16(s20 + 4, ld16(s20 + 0x1c))
			st32(s20, ld32(s20 + 0x18))
			st64(s20 + 6, g)
			st32(s20 + 0xe, h)
			if ((h & 0xffff0000) == 0x27100000) {
				i = ld64(s20 + 8)
			} else {
				r0 = fn_12dc70(s30, s20, c, r0)
				if (ld64(s30) == 0) {
					r0 = fn_87630(s40, 0x34)
					k = ld64(s40)
					st64(a + 0x10, ld64(s40 + 8))
					st64(a + 8, k)
					st64(a, 1)
					return r0
				}
				i = ld64(s30 + 8)
			}
			const j = c + i
			if (c > j) {
				r0 = fn_87630(s70, 0x34)
				k = ld64(s70)
				st64(a + 0x10, ld64(s70 + 8))
				st64(a + 8, k)
				st64(a, 1)
				return r0
			}
			r0 = fn_12db08(s50, s20, j, r0)
			if (ld64(s50) == 0) {
				fn_1490e8(0x10015a2e0)
			}
			if (i != ld64(s50 + 8)) {
				r0 = fn_87630(s60, 0x34)
				k = ld64(s60)
				st64(a + 0x10, ld64(s60 + 8))
				st64(a + 8, k)
				st64(a, 1)
				return r0
			}
			st64(a + 0x10, i)
			st64(a + 8, j)
			st64(a, 0)
			return r0
		}
		const f = ld64(s20 + 8)
		st64(a + 0x10, ld64(s20 + 0x10))
		st64(a + 8, f)
		st64(a, 1)
		return r0
	}
	st64(a + 0x10, 0)
	st64(a + 8, 0)
	st64(a, 0)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (value)
export function fn_82718(a: u64, b: u64): u64 {
	const s68 = fp - 0x68, s88 = fp - 0x88, s90 = fp - 0x90, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8
	let y: u64
	const f: AccountInfo = ld64(b + 0x58)
	const g: LamportsCell = f.lamports
	const l = f.key
	rc_inc(g)
	const h: DataCell = f.data
	rc_inc(h)
	const m = f.owner
	const k = f.rent_epoch
	const j = f.is_signer
	const i = f.is_writable
	st8(s90 + 2, f.executable)
	st8(s90, j, i)
	st64(sb8, l, g, h, m, k)
	let n = memcmp(m, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32
	if (n == 0) {
		st16(a, 0)
	} else {
		const q = AccountInfo_try_borrow_data(s68, sb8, n)
		let v = ld64(s68 + 0x10)
		const p = ld64(s68 + 8)
		const o = ld64(s68)
		if (o == 0x800000000000001a /* Ok */) {
			B7: {
				n = fn_afd0(s68, ld64(p), ld64(p + 8), undef, undef, q)
				if (ld32(s68) != 2) {
					const ao = v
					const z = ld64(s68 + 0x60)
					if (z != 0) {
						const ae = ld64(s68 + 0x58)
						let aa = 0
						do {
							n = fn_12e0b0(s88, aa)
							const ab = ld64(s88 + 0x10)
							if (ab > z) {
								break
							}
							const ac = ld64(s88 + 8)
							const ad = ld64(s88)
							if (ad > ac) {
								fn_14c690(ad, ac, 0x100159390)
							}
							if (ac > z) {
								fn_14c5c0(ac, z, 0x100159390)
							}
							n = fn_12e558(s68, ae + ad, ac - ad, n)
							if (ld64(s68) != 0x800000000000001a /* Ok */) {
								break
							}
							const af = ld16(s68 + 8)
							if (af > 0x1b) {
								break
							}
							if (((1 << (af & 0x3f)) & 0x7fd5658) == 0) {
								if (((1 << (af & 0x3f)) & 0x802a9a4) != 0) {
									break
								}
								if (af == 1) {
									if (ab >= ac) {
										if (ab - ac == 2) {
											const ah = ld16(ae + ac)
											const ai = ab > ab + ah ? 0xffffffffffffffff : ab + ah
											if (ai > z) {
												break
											}
											if (ai - ab == 0x6c) {
												n = clock_get_13f308(s68)
												if (ld64(s68) == 0) {
													const an = ld64(ae + ab + 0x5a) > ld64(s68 + 0x18) ? ae + ab + 0x48 : ae + ab + 0x5a
													st16(a + 0x12, ld16(an + 0x10))
													st64(a + 0xa, ld64(an + 8))
													st64(a + 2, ld64(an))
													st16(a, 0x100)
												} else {
													const ak = ld64(s68 + 8)
													const aj = ld64(s68 + 0x10)
													st64(s68 + 0x10, ld64(s68 + 0x18))
													st64(s68, ak, aj)
													n = fn_13b430(sd8, s68)
													const al = ld64(sd8)
													st64(a + 0x10, ld64(sd8 + 8))
													st64(a + 8, al)
													st8(a, 1)
												}
												v = ao
												break B7
											}
											break
										}
										break
									}
									fn_14c690(ac, ab, 0x100159378)
								}
								break
							}
							if (ac > ab) {
								fn_14c690(ac, ab, 0x1001593a8)
							}
							if (ab - ac != 2) {
								break
							}
							const ag = ld16(ae + ac)
							aa = ab > ab + ag ? 0xffffffffffffffff : ab + ag
						} while (z > aa)
					}
					st16(a, 0)
					st64(ao, ld64(ao) - 1)
					y = ld64(sb8 + 0x10)
					const am: LamportsCell = ld64(sb8 + 8)
					rc_dec(am)
					if (!rc_release(y)) {
						return n
					}
					st64(y + 8, ld64(y + 8) - 1)
					return n
				}
				const r = ld64(s68 + 0x18)
				st64(s88 + 0x14, r)
				const s = ld64(s68 + 0x10)
				st64(s88 + 0xc, s)
				const t = ld64(s68 + 8)
				st64(s88 + 4, t)
				st64(s68, t, s, r)
				n = fn_13b430(se8, s68)
				const u = ld64(se8)
				st64(a + 0x10, ld64(se8 + 8))
				st64(a + 8, u)
				st8(a, 1)
			}
			st64(v, ld64(v) - 1)
		} else {
			st64(s68, o, p, v)
			n = fn_13b430(sc8, s68)
			const w = ld64(sc8)
			st64(a + 0x10, ld64(sc8 + 8))
			st64(a + 8, w)
			st8(a, 1)
		}
	}
	y = ld64(sb8 + 0x10)
	const x: LamportsCell = ld64(sb8 + 8)
	rc_dec(x)
	if (!rc_release(y)) {
		return n
	}
	st64(y + 8, ld64(y + 8) - 1)
	return n
}

export function fn_83078(r0: u64): u64 {
	return r0
}

export function fn_88db0(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000008 > g) {
		raw_vec_handle_error(1, 0x100, g, 0x300000008, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0xe5fec60c57ad7664 /* event:PoolInitialized */)
	st64(g + 0x20, ld64(b + 0x18))
	st64(g + 0x18, ld64(b + 0x10))
	st64(g + 0x10, ld64(b + 8))
	st64(g + 8, ld64(b))
	st64(g + 0x40, ld64(b + 0x38))
	st64(g + 0x38, ld64(b + 0x30))
	st64(g + 0x30, ld64(b + 0x28))
	st64(g + 0x28, ld64(b + 0x20))
	st64(g + 0x60, ld64(b + 0x58))
	st64(g + 0x58, ld64(b + 0x50))
	st64(g + 0x50, ld64(b + 0x48))
	st64(g + 0x48, ld64(b + 0x40))
	st64(g + 0x80, ld64(b + 0x78))
	st64(g + 0x78, ld64(b + 0x70))
	st64(g + 0x70, ld64(b + 0x68))
	st64(g + 0x68, ld64(b + 0x60))
	st16(g + 0x88, ld16(b + 0xd0))
	st64(g + 0xa2, ld64(b + 0x98))
	st64(g + 0x9a, ld64(b + 0x90))
	st64(g + 0x92, ld64(b + 0x88))
	st64(g + 0x8a, ld64(b + 0x80))
	copy(g + 0xaa, b + 0xa0, 0x20)
	st8(g + 0xca, ld8(b + 0xd2))
	st8(g + 0xcb, ld8(b + 0xd3))
	const h = ld64(b + 0xc0)
	st64(g + 0xd4, ld64(b + 0xc8))
	st64(g + 0xcc, h)
	st64(a + 8, g, 0xdc)
	st64(a, 0x100)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_89078(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000008 > g) {
		raw_vec_handle_error(1, 0x100, g, 0x300000008, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0x96a02b93af49cae1 /* event:Traded */)
	copy(g + 8, b, 0x20)
	st8(g + 0x28, ld8(b + 0x70))
	const h = ld64(b + 0x20)
	st64(g + 0x31, ld64(b + 0x28))
	st64(g + 0x29, h)
	const i = ld64(b + 0x30)
	st64(g + 0x41, ld64(b + 0x38))
	st64(g + 0x39, i)
	copy(g + 0x49, b + 0x40, 0x30)
	st64(a + 8, g, 0x79)
	st64(a, 0x100)
}

// Anchor Accounts::try_accounts of instruction increase_liquidity (called by ix_increase_liquidity; name [str]: from the handler's "Instruction: …" log; was fn_94430)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool (ConstraintMut), position (ConstraintMut, ConstraintHasOne), position_token_account (ConstraintRaw), token_owner_account_a (ConstraintMut, ConstraintRaw), token_owner_account_b (ConstraintMut, ConstraintRaw), tick_array_lower (AccountNotEnoughKeys, ConstraintMut), tick_array_upper (ConstraintMut), token_program (ConstraintAddress), token_vault_b (ConstraintMut, ConstraintRaw), token_vault_a (ConstraintMut, ConstraintRaw), position_authority
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_token_account_box, token_owner_account_a_box, token_owner_account_b_box, token_vault_a_box, token_vault_b_box, token_vault_a, token_vault_b, tick_array_upper
export function accounts_increase_liquidity(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, sf0 = fp - 0xf0, s100 = fp - 0x100, s110 = fp - 0x110, s118 = fp - 0x118, s388 = fp - 0x388, s390 = fp - 0x390, s3a8 = fp - 0x3a8, s430 = fp - 0x430, s450 = fp - 0x450, s470 = fp - 0x470, s490 = fp - 0x490, s620 = fp - 0x620, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s668 = fp - 0x668, s678 = fp - 0x678, s688 = fp - 0x688, s698 = fp - 0x698, s6a8 = fp - 0x6a8, s6b8 = fp - 0x6b8, s6c8 = fp - 0x6c8, s6d8 = fp - 0x6d8, s6e8 = fp - 0x6e8, s6f8 = fp - 0x6f8, s708 = fp - 0x708, s718 = fp - 0x718, s728 = fp - 0x728, s738 = fp - 0x738, s748 = fp - 0x748, s758 = fp - 0x758, s768 = fp - 0x768, s778 = fp - 0x778, s788 = fp - 0x788, s798 = fp - 0x798, s7a8 = fp - 0x7a8, s7b8 = fp - 0x7b8, s7c8 = fp - 0x7c8, s7d8 = fp - 0x7d8, s7e8 = fp - 0x7e8, s7f8 = fp - 0x7f8, s808 = fp - 0x808, s818 = fp - 0x818, s828 = fp - 0x828, s838 = fp - 0x838, s848 = fp - 0x848, s858 = fp - 0x858, s868 = fp - 0x868, s878 = fp - 0x878, s888 = fp - 0x888, s898 = fp - 0x898, s8a8 = fp - 0x8a8, s8b8 = fp - 0x8b8, s8c8 = fp - 0x8c8, s8d8 = fp - 0x8d8, s8e8 = fp - 0x8e8, s8f8 = fp - 0x8f8, s908 = fp - 0x908, s918 = fp - 0x918, s928 = fp - 0x928, s948 = fp - 0x948, s950 = fp - 0x950, s958 = fp - 0x958, s960 = fp - 0x960, s968 = fp - 0x968, s970 = fp - 0x970
	let ab, ac, ae, ag, ai, aj, aq: u64
	let g = a
	try_accounts_11a48(s3a8, c, c, d, e)
	const h = ld64(s3a8 + 0x10)
	const i = ld64(s3a8 + 8)
	const f = ld64(s3a8)
	if (f == 0) {
		aj = Error_with_account_name(s928, i, h, 0x100152b28 /* "whirlpool" */, 9)
		ai = ld64(s928)
		st64(g + 0x10, ld64(s928 + 8))
		st64(g + 8, ai)
		st64(g, 0)
		return aj
	}
	st64(s948 + 0x18, g)
	memcpy(s620, s390, 0x278)
	st64(s638, f, i, h)
	fn_129a0(s3a8, c)
	const m = ld64(s3a8 + 8)
	const j = ld64(s3a8)
	if (j == 2) {
		try_accounts_11718(s3a8, c)
		const l = ld64(s3a8 + 8)
		const k = ld64(s3a8)
		if (k == 2) {
			st64(s948, l, m, f)
			try_accounts_11b00(s3a8, c, l)
			const o = ld64(s3a8 + 0x10)
			const p = ld64(s3a8 + 8)
			const n = ld64(s3a8)
			if (n == 0) {
				aj = Error_with_account_name(s918, p, o, "position", 8)
				ai = ld64(s918)
				g = ld64(s948 + 0x18)
				st64(g + 0x10, ld64(s918 + 8))
				st64(g + 8, ai)
				st64(g, 0)
				return aj
			}
			memcpy(s100, s390, 0xc0)
			st64(s118, n, p, o)
			try_accounts_558(s3a8, c)
			if (ld32(s388 + 0x90) == 2) {
				aj = Error_with_account_name(s908, ld64(s3a8), ld64(s3a8 + 8), "position_token_account", 0x16)
				ai = ld64(s908)
				g = ld64(s948 + 0x18)
				st64(g + 0x10, ld64(s908 + 8))
				st64(g + 8, ai)
				st64(g, 0)
				return aj
			}
			const q = ld64(0x300000000 /* heap bump-allocator cursor */)
			st64(s950, c)
			const position_token_account_box: TokenAccount_2 = q != 0 ? sat_sub(q, 0xd8) & -8 : 0x300007f28
			if (position_token_account_box > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, position_token_account_box)
				memcpy(position_token_account_box, s3a8, 0xd8)
				try_accounts_11f50(s3a8, ld64(s950))
				if (ld32(s388 + 0x70) == 2) {
					aj = Error_with_account_name(s8f8, ld64(s3a8), ld64(s3a8 + 8), "token_owner_account_a", 0x15)
					ai = ld64(s8f8)
					g = ld64(s948 + 0x18)
					st64(g + 0x10, ld64(s8f8 + 8))
					st64(g + 8, ai)
					st64(g, 0)
					return aj
				}
				const s = ld64(0x300000000 /* heap bump-allocator cursor */)
				const token_owner_account_a_box: TokenAccount = s != 0 ? sat_sub(s, 0xb8) & -8 : 0x300007f48
				if (token_owner_account_a_box > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, token_owner_account_a_box)
					st64(s958, token_owner_account_a_box)
					memcpy(token_owner_account_a_box, s3a8, 0xb8)
					try_accounts_11f50(s3a8, ld64(s950))
					if (ld32(s388 + 0x70) == 2) {
						aj = Error_with_account_name(s8e8, ld64(s3a8), ld64(s3a8 + 8), "token_owner_account_b", 0x15)
						ai = ld64(s8e8)
						g = ld64(s948 + 0x18)
						st64(g + 0x10, ld64(s8e8 + 8))
						st64(g + 8, ai)
						st64(g, 0)
						return aj
					}
					const u = ld64(0x300000000 /* heap bump-allocator cursor */)
					const token_owner_account_b_box: TokenAccount = u != 0 ? sat_sub(u, 0xb8) & -8 : 0x300007f48
					st64(s960, n)
					if (token_owner_account_b_box > 0x300000007) {
						st64(0x300000000 /* heap bump-allocator cursor */, token_owner_account_b_box)
						memcpy(token_owner_account_b_box, s3a8, 0xb8)
						const w = ld64(s950)
						fn_20f8(s3a8, w)
						const token_vault_a_box: TokenAccount = ld64(s3a8 + 8)
						const x = ld64(s3a8)
						if (x == 2) {
							fn_20f8(s3a8, w)
							const token_vault_b_box: TokenAccount = ld64(s3a8 + 8)
							const y = ld64(s3a8)
							if (y == 2) {
								B29: {
									st64(s968, token_vault_b_box)
									const aa = ld64(w + 8)
									if (aa != 0) {
										ae = ld64(w)
										st64(w, ae + 0x30, aa - 1)
										if (aa != 1) {
											st64(s970, ae)
											st64(w + 8, aa - 2)
											ag = ld64(w)
											st64(w, ag + 0x30)
											break B29
										}
									} else {
										anchor_error_from(s688, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_b_box, ab, ac)
										ae = ld64(s688 + 8)
										const ad = ld64(s688)
										if (ad != 2) {
											aj = Error_with_account_name(s698, ad, ae, "tick_array_lower", 0x10)
											ai = ld64(s698)
											g = ld64(s948 + 0x18)
											st64(g + 0x10, ld64(s698 + 8))
											st64(g + 8, ai)
											st64(g, 0)
											return aj
										}
									}
									st64(s970, ae)
									anchor_error_from(s6a8, 0xbbd /* anchor::AccountNotEnoughKeys */, ae, ab, ac)
									ag = ld64(s6a8 + 8)
									const af = ld64(s6a8)
									if (af != 2) {
										aj = Error_with_account_name(s6b8, af, ag, "tick_array_upper", 0x10)
										ai = ld64(s6b8)
										g = ld64(s948 + 0x18)
										st64(g + 0x10, ld64(s6b8 + 8))
										st64(g + 8, ai)
										st64(g, 0)
										return aj
									}
								}
								st64(s950, token_vault_a_box)
								const ap = ld64(s948 + 0x18)
								if (ld8(ld64(s948 + 0x10) + 0x29 /* is_writable */) == 0) {
									anchor_error_from(s8c8, 0x7d0 /* anchor::ConstraintMut */, ag, ab, ac)
									aj = Error_with_account_name(s8d8, ld64(s8c8), ld64(s8c8 + 8), 0x100152b28 /* "whirlpool" */, 9)
									aq = ld64(s8d8)
									st64(ap + 0x10, ld64(s8d8 + 8))
									st64(ap + 8, aq)
									st64(ap, 0)
									return aj
								}
								const tick_array_upper: AccountInfo = ag
								const ak = ld64(ld64(s948 + 8))
								copyr(s20, ak, 0x20)
								if ((memcmp(s20, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
									anchor_error_from(s6c8, 0x7dc /* anchor::ConstraintAddress */)
									const ao = Error_with_account_name(s6d8, ld64(s6c8), ld64(s6c8 + 8), "token_program", 0xd)
									const an = ld64(s6d8 + 8)
									const am = ld64(s6d8)
									copyr(s3a8, s20, 0x20)
									st64(s388, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
									aj = fn_13b5c0(s6e8, am, an, s3a8, ao)
									aq = ld64(s6e8)
									st64(ap + 0x10, ld64(s6e8 + 8))
									st64(ap + 8, aq)
									st64(ap, 0)
									return aj
								}
								if (ld8(ld64(s960) + 0x29) == 0) {
									anchor_error_from(s8a8, 0x7d0 /* anchor::ConstraintMut */)
									aj = Error_with_account_name(s8b8, ld64(s8a8), ld64(s8a8 + 8), "position", 8)
									aq = ld64(s8b8)
									st64(ap + 0x10, ld64(s8b8 + 8))
									st64(ap + 8, aq)
									st64(ap, 0)
									return aj
								}
								st64(s960, token_owner_account_b_box)
								copyr(s40, s110, 0x20)
								const al = ld64(ld64(s948 + 0x10) /* key */)
								copyr(s20, al, 0x20)
								if ((memcmp(s40, s20, 0x20) as u32) != 0) {
									anchor_error_from(s6f8, 0x7d1 /* anchor::ConstraintHasOne */)
									const au = Error_with_account_name(s708, ld64(s6f8), ld64(s6f8 + 8), "position", 8)
									const at = ld64(s708 + 8)
									const ar = ld64(s708)
									copyr(s3a8, s110, 0x20)
									copy(s388, s20, 0x20)
									aj = fn_13b5c0(s718, ar, at, s3a8, au)
									aq = ld64(s718)
									st64(ap + 0x10, ld64(s718 + 8))
									st64(ap + 8, aq)
									st64(ap, 0)
									return aj
								}
								if ((memcmp(position_token_account_box.mint, sf0, 0x20) as u32) == 0) {
									if (position_token_account_box.amount != 1) {
										anchor_error_from(s748, 0x7d3 /* anchor::ConstraintRaw */)
										aj = Error_with_account_name(s758, ld64(s748), ld64(s748 + 8), "position_token_account", 0x16)
										ai = ld64(s758)
										g = ld64(s948 + 0x18)
										st64(g + 0x10, ld64(s758 + 8))
										st64(g + 8, ai)
										st64(g, 0)
										return aj
									}
									if (ld8(ld64(ld64(s958)) + 0x29) == 0) {
										anchor_error_from(s888, 0x7d0 /* anchor::ConstraintMut */)
										aj = Error_with_account_name(s898, ld64(s888), ld64(s888 + 8), "token_owner_account_a", 0x15)
										ai = ld64(s898)
										g = ld64(s948 + 0x18)
										st64(g + 0x10, ld64(s898 + 8))
										st64(g + 8, ai)
										st64(g, 0)
										return aj
									}
									if ((memcmp(ld64(s958) + 8, s490, 0x20) as u32) == 0) {
										if (ld8(ld64(ld64(s960)) + 0x29) != 0) {
											if ((memcmp(ld64(s960) + 8, s450, 0x20) as u32) == 0) {
												const token_vault_a: AccountInfo = ld64(ld64(s950))
												if (token_vault_a.is_writable != 0) {
													const aw = token_vault_a.key
													copyr(s3a8, aw, 0x20)
													if ((memcmp(s3a8, s470, 0x20) as u32) == 0) {
														const token_vault_b: AccountInfo = ld64(ld64(s968))
														if (token_vault_b.is_writable != 0) {
															const ay = token_vault_b.key
															copyr(s3a8, ay, 0x20)
															if ((memcmp(s3a8, s430, 0x20) as u32) == 0) {
																if (ld8(ld64(s970) + 0x29) != 0) {
																	if (tick_array_upper.is_writable != 0) {
																		const ba = ld64(s948 + 0x18)
																		memcpy(ba, s638, 0x290)
																		aj = memcpy(ba + 0x2a0, s118, 0xd8)
																		st64(ba + 0x3a8, tick_array_upper)
																		st64(ba + 0x3a0, ld64(s970))
																		st64(ba + 0x398, ld64(s968))
																		st64(ba + 0x390, ld64(s950))
																		st64(ba + 0x388, ld64(s960))
																		st64(ba + 0x380, ld64(s958))
																		st64(ba + 0x378, position_token_account_box)
																		st64(ba + 0x298, ld64(s948))
																		st64(ba + 0x290, ld64(s948 + 8))
																		return aj
																	}
																	anchor_error_from(s7e8, 0x7d0 /* anchor::ConstraintMut */)
																	aj = Error_with_account_name(s7f8, ld64(s7e8), ld64(s7e8 + 8), "tick_array_upper", 0x10)
																	ai = ld64(s7f8)
																	g = ld64(s948 + 0x18)
																	st64(g + 0x10, ld64(s7f8 + 8))
																	st64(g + 8, ai)
																	st64(g, 0)
																	return aj
																}
																anchor_error_from(s808, 0x7d0 /* anchor::ConstraintMut */)
																aj = Error_with_account_name(s818, ld64(s808), ld64(s808 + 8), "tick_array_lower", 0x10)
																ai = ld64(s818)
																g = ld64(s948 + 0x18)
																st64(g + 0x10, ld64(s818 + 8))
																st64(g + 8, ai)
																st64(g, 0)
																return aj
															}
															anchor_error_from(s7c8, 0x7d3 /* anchor::ConstraintRaw */)
															aj = Error_with_account_name(s7d8, ld64(s7c8), ld64(s7c8 + 8), "token_vault_b", 0xd)
															ai = ld64(s7d8)
															g = ld64(s948 + 0x18)
															st64(g + 0x10, ld64(s7d8 + 8))
															st64(g + 8, ai)
															st64(g, 0)
															return aj
														}
														anchor_error_from(s828, 0x7d0 /* anchor::ConstraintMut */)
														aj = Error_with_account_name(s838, ld64(s828), ld64(s828 + 8), "token_vault_b", 0xd)
														ai = ld64(s838)
														g = ld64(s948 + 0x18)
														st64(g + 0x10, ld64(s838 + 8))
														st64(g + 8, ai)
														st64(g, 0)
														return aj
													}
													anchor_error_from(s7a8, 0x7d3 /* anchor::ConstraintRaw */)
													aj = Error_with_account_name(s7b8, ld64(s7a8), ld64(s7a8 + 8), "token_vault_a", 0xd)
													ai = ld64(s7b8)
													g = ld64(s948 + 0x18)
													st64(g + 0x10, ld64(s7b8 + 8))
													st64(g + 8, ai)
													st64(g, 0)
													return aj
												}
												anchor_error_from(s848, 0x7d0 /* anchor::ConstraintMut */)
												aj = Error_with_account_name(s858, ld64(s848), ld64(s848 + 8), "token_vault_a", 0xd)
												ai = ld64(s858)
												g = ld64(s948 + 0x18)
												st64(g + 0x10, ld64(s858 + 8))
												st64(g + 8, ai)
												st64(g, 0)
												return aj
											}
											anchor_error_from(s788, 0x7d3 /* anchor::ConstraintRaw */)
											aj = Error_with_account_name(s798, ld64(s788), ld64(s788 + 8), "token_owner_account_b", 0x15)
											ai = ld64(s798)
											g = ld64(s948 + 0x18)
											st64(g + 0x10, ld64(s798 + 8))
											st64(g + 8, ai)
											st64(g, 0)
											return aj
										}
										anchor_error_from(s868, 0x7d0 /* anchor::ConstraintMut */)
										aj = Error_with_account_name(s878, ld64(s868), ld64(s868 + 8), "token_owner_account_b", 0x15)
										ai = ld64(s878)
										g = ld64(s948 + 0x18)
										st64(g + 0x10, ld64(s878 + 8))
										st64(g + 8, ai)
										st64(g, 0)
										return aj
									}
									anchor_error_from(s768, 0x7d3 /* anchor::ConstraintRaw */)
									aj = Error_with_account_name(s778, ld64(s768), ld64(s768 + 8), "token_owner_account_a", 0x15)
									ai = ld64(s778)
									g = ld64(s948 + 0x18)
									st64(g + 0x10, ld64(s778 + 8))
									st64(g + 8, ai)
									st64(g, 0)
									return aj
								}
								anchor_error_from(s728, 0x7d3 /* anchor::ConstraintRaw */)
								aj = Error_with_account_name(s738, ld64(s728), ld64(s728 + 8), "position_token_account", 0x16)
								aq = ld64(s738)
								st64(ap + 0x10, ld64(s738 + 8))
								st64(ap + 8, aq)
								st64(ap, 0)
								return aj
							}
							aj = Error_with_account_name(s678, y, token_vault_b_box, "token_vault_b", 0xd)
							ai = ld64(s678)
							g = ld64(s948 + 0x18)
							st64(g + 0x10, ld64(s678 + 8))
							st64(g + 8, ai)
							st64(g, 0)
							return aj
						}
						aj = Error_with_account_name(s668, x, token_vault_a_box, "token_vault_a", 0xd)
						ai = ld64(s668)
						g = ld64(s948 + 0x18)
						st64(g + 0x10, ld64(s668 + 8))
						st64(g + 8, ai)
						st64(g, 0)
						return aj
					}
					alloc_handle_alloc_error(8, 0xb8)
				}
				alloc_handle_alloc_error(8, 0xb8)
			}
			alloc_handle_alloc_error(8, 0xd8)
		}
		aj = Error_with_account_name(s658, k, l, "position_authority", 0x12)
		ai = ld64(s658)
		g = ld64(s948 + 0x18)
		st64(g + 0x10, ld64(s658 + 8))
		st64(g + 8, ai)
		st64(g, 0)
		return aj
	}
	aj = Error_with_account_name(s648, j, m, "token_program", 0xd)
	ai = ld64(s648)
	g = ld64(s948 + 0x18)
	st64(g + 0x10, ld64(s648 + 8))
	st64(g + 8, ai)
	st64(g, 0)
	return aj
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_bundle_token_account
export function fn_a4608(a: u64, b: u64): u64 {
	const sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd0 = fp - 0xd0, sf8 = fp - 0xf8, s100 = fp - 0x100, s128 = fp - 0x128, s130 = fp - 0x130, s158 = fp - 0x158, s160 = fp - 0x160, s188 = fp - 0x188, s190 = fp - 0x190, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s218 = fp - 0x218, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250
	const f: AccountInfo = ld64(ld64(b + 8))
	const g: LamportsCell = f.lamports
	const m: AccountInfo = ld64(ld64(b))
	const p = f.key
	rc_inc(g)
	const h: DataCell = f.data
	rc_inc(h)
	const i: AccountInfo = ld64(ld64(b + 0x10))
	const j: LamportsCell = i.lamports
	const br = f.executable
	const bs = f.is_writable
	const bt = f.is_signer
	const bu = f.rent_epoch
	const bv = f.owner
	const l = i.key
	rc_inc(j)
	const k: DataCell = i.data
	rc_inc(k)
	const n: LamportsCell = m.lamports
	const bl = m.key
	const bm = i.executable
	const bn = i.is_writable
	const bo = i.is_signer
	const bp = i.rent_epoch
	const bq = i.owner
	rc_inc(n)
	const o: DataCell = m.data
	rc_inc(o)
	const q: AccountInfo = ld64(ld64(b + 0x18))
	const r: LamportsCell = q.lamports
	const bg = m.executable
	const bh = m.is_writable
	const bi = m.is_signer
	const bj = m.rent_epoch
	const bk = m.owner
	const bf = q.key
	rc_inc(r)
	const s: DataCell = q.data
	rc_inc(s)
	const t: AccountInfo = ld64(ld64(b + 0x20) + 0x58)
	const u: LamportsCell = t.lamports
	const ba = q.executable
	const bb = q.is_writable
	const bc = q.is_signer
	const bd = q.rent_epoch
	const be = q.owner
	const az = t.key
	rc_inc(u)
	const v: DataCell = t.data
	rc_inc(v)
	const w: AccountInfo = ld64(ld64(b + 0x28))
	const x: LamportsCell = w.lamports
	const av = t.executable
	const aw = t.is_writable
	const ax = t.is_signer
	const ay = t.rent_epoch
	const ad = t.owner
	const au = w.key
	rc_inc(x)
	const y: DataCell = w.data
	rc_inc(y)
	const z: AccountInfo = ld64(ld64(b + 0x30))
	const aa: LamportsCell = z.lamports
	const ap = w.executable
	const aq = w.is_writable
	const ar = w.is_signer
	const at = w.rent_epoch
	const ab = w.owner
	const ai = z.key
	rc_inc(aa)
	const ac: DataCell = z.data
	rc_inc(ac)
	const ah = z.owner
	const ag = z.rent_epoch
	const af = z.is_signer
	const ae = z.is_writable
	st8(sd0 + 2, z.executable)
	st8(sd0, af, ae)
	st64(sf8, ai, aa, ac, ah, ag)
	st8(s100, ar, aq, ap)
	st64(s128, au, x, y, ab, at)
	st8(s130, ax, aw, av)
	st64(s158, az, u, v, ad, ay)
	st8(s160, bc, bb, ba)
	st64(s188, bf, r, s, be, bd)
	st8(s190, bi, bh, bg)
	st64(s1b8, bl, n, o, bk, bj)
	st8(s1c0, bo, bn, bm)
	st64(s1e8, l, j, k, bq, bp)
	st8(s1f0, bt, bs, br)
	st64(s218, p, g, h, bv, bu)
	st64(sc8, 8, 0)
	st64(s230, 0, 8, 0)
	let ao = associated_token_create(s240, s230)
	const aj = ld64(s240)
	if (aj != 2) {
		const al = ld64(s240 + 8)
		st64(a, aj, al)
		return ao
	}
	Account_try_from_unchecked(sb8, m)
	if (ld32(sb8 + 0x90) == 2) {
		ao = Error_with_account_name(s250, ld64(sb8), ld64(sb8 + 8), "position_bundle_token_account", 0x1d)
		const ak = ld64(s250)
		st64(a + 8, ld64(s250 + 8))
		st64(a, ak)
		return ao
	}
	const am = ld64(0x300000000 /* heap bump-allocator cursor */)
	const an = am != 0 ? sat_sub(am, 0xb8) & -8 : 0x300007f48
	if (an > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, an)
		ao = memcpy(an, sb8, 0xb8)
		st64(a + 8, an)
		st64(a, 2)
		return ao
	}
	alloc_handle_alloc_error(8, 0xb8)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_token_account
export function fn_bba20(a: u64, b: u64): u64 {
	const sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd0 = fp - 0xd0, sf8 = fp - 0xf8, s100 = fp - 0x100, s128 = fp - 0x128, s130 = fp - 0x130, s158 = fp - 0x158, s160 = fp - 0x160, s188 = fp - 0x188, s190 = fp - 0x190, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s218 = fp - 0x218, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250
	const f: AccountInfo = ld64(ld64(b + 8))
	const g: LamportsCell = f.lamports
	const m: AccountInfo = ld64(ld64(b))
	const p = f.key
	rc_inc(g)
	const h: DataCell = f.data
	rc_inc(h)
	const i: AccountInfo = ld64(ld64(b + 0x10))
	const j: LamportsCell = i.lamports
	const br = f.executable
	const bs = f.is_writable
	const bt = f.is_signer
	const bu = f.rent_epoch
	const bv = f.owner
	const l = i.key
	rc_inc(j)
	const k: DataCell = i.data
	rc_inc(k)
	const n: LamportsCell = m.lamports
	const bl = m.key
	const bm = i.executable
	const bn = i.is_writable
	const bo = i.is_signer
	const bp = i.rent_epoch
	const bq = i.owner
	rc_inc(n)
	const o: DataCell = m.data
	rc_inc(o)
	const q: AccountInfo = ld64(ld64(b + 0x18))
	const r: LamportsCell = q.lamports
	const bg = m.executable
	const bh = m.is_writable
	const bi = m.is_signer
	const bj = m.rent_epoch
	const bk = m.owner
	const bf = q.key
	rc_inc(r)
	const s: DataCell = q.data
	rc_inc(s)
	const t: AccountInfo = ld64(ld64(b + 0x20) + 0x58)
	const u: LamportsCell = t.lamports
	const ba = q.executable
	const bb = q.is_writable
	const bc = q.is_signer
	const bd = q.rent_epoch
	const be = q.owner
	const az = t.key
	rc_inc(u)
	const v: DataCell = t.data
	rc_inc(v)
	const w: AccountInfo = ld64(ld64(b + 0x28))
	const x: LamportsCell = w.lamports
	const av = t.executable
	const aw = t.is_writable
	const ax = t.is_signer
	const ay = t.rent_epoch
	const ad = t.owner
	const au = w.key
	rc_inc(x)
	const y: DataCell = w.data
	rc_inc(y)
	const z: AccountInfo = ld64(ld64(b + 0x30))
	const aa: LamportsCell = z.lamports
	const ap = w.executable
	const aq = w.is_writable
	const ar = w.is_signer
	const at = w.rent_epoch
	const ab = w.owner
	const ai = z.key
	rc_inc(aa)
	const ac: DataCell = z.data
	rc_inc(ac)
	const ah = z.owner
	const ag = z.rent_epoch
	const af = z.is_signer
	const ae = z.is_writable
	st8(sd0 + 2, z.executable)
	st8(sd0, af, ae)
	st64(sf8, ai, aa, ac, ah, ag)
	st8(s100, ar, aq, ap)
	st64(s128, au, x, y, ab, at)
	st8(s130, ax, aw, av)
	st64(s158, az, u, v, ad, ay)
	st8(s160, bc, bb, ba)
	st64(s188, bf, r, s, be, bd)
	st8(s190, bi, bh, bg)
	st64(s1b8, bl, n, o, bk, bj)
	st8(s1c0, bo, bn, bm)
	st64(s1e8, l, j, k, bq, bp)
	st8(s1f0, bt, bs, br)
	st64(s218, p, g, h, bv, bu)
	st64(sc8, 8, 0)
	st64(s230, 0, 8, 0)
	let ao = associated_token_create(s240, s230)
	const aj = ld64(s240)
	if (aj != 2) {
		const al = ld64(s240 + 8)
		st64(a, aj, al)
		return ao
	}
	Account_try_from_unchecked(sb8, m)
	if (ld32(sb8 + 0x90) == 2) {
		ao = Error_with_account_name(s250, ld64(sb8), ld64(sb8 + 8), "position_token_account", 0x16)
		const ak = ld64(s250)
		st64(a + 8, ld64(s250 + 8))
		st64(a, ak)
		return ao
	}
	const am = ld64(0x300000000 /* heap bump-allocator cursor */)
	const an = am != 0 ? sat_sub(am, 0xb8) & -8 : 0x300007f48
	if (an > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, an)
		ao = memcpy(an, sb8, 0xb8)
		st64(a + 8, an)
		st64(a, 2)
		return ao
	}
	alloc_handle_alloc_error(8, 0xb8)
}

// Anchor Accounts::try_accounts of instruction set_fee_rate (called by ix_set_fee_rate; name [str]: from the handler's "Instruction: …" log; was fn_c8268)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, whirlpool (ConstraintMut, ConstraintHasOne), fee_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpools_config, whirlpool, fee_authority
export function accounts_set_fee_rate(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s40 = fp - 0x40, s148 = fp - 0x148, s2b8 = fp - 0x2b8, s528 = fp - 0x528, s530 = fp - 0x530, s548 = fp - 0x548, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s678 = fp - 0x678
	let w, x: u64
	try_accounts_11de0(s548, c, c, d, e)
	const h = ld64(s548 + 0x10)
	const g = ld64(s548 + 8)
	const whirlpools_config: AccountInfo = ld64(s548)
	if (whirlpools_config == 0) {
		x = Error_with_account_name(s650, g, h, "whirlpools_config", 0x11)
		w = ld64(s650)
		st64(a + 0x10, ld64(s650 + 8))
		st64(a + 8, w)
		st64(a, 0)
		return x
	}
	st64(s660, h, g)
	memcpy(s5a0, s530, 0x58)
	try_accounts_11a48(s548, c)
	const k = ld64(s548 + 0x10)
	const j = ld64(s548 + 8)
	const whirlpool: AccountInfo = ld64(s548)
	if (whirlpool == 0) {
		x = Error_with_account_name(s640, j, k, 0x100152b28 /* "whirlpool" */, 9)
		w = ld64(s640)
		st64(a + 0x10, ld64(s640 + 8))
		st64(a + 8, w)
		st64(a, 0)
		return x
	}
	st64(s670, j, k)
	memcpy(s2b8, s530, 0x278)
	try_accounts_11718(s548, c)
	const fee_authority: AccountInfo = ld64(s548 + 8)
	const l = ld64(s548)
	if (l == 2) {
		if (whirlpool.is_writable == 0) {
			anchor_error_from(s620, 0x7d0 /* anchor::ConstraintMut */)
			x = Error_with_account_name(s630, ld64(s620), ld64(s620 + 8), 0x100152b28 /* "whirlpool" */, 9)
			w = ld64(s630)
			st64(a + 0x10, ld64(s630 + 8))
			st64(a + 8, w)
			st64(a, 0)
			return x
		}
		copyr(s40, s148, 0x20)
		const m = whirlpools_config.key
		copyr(s20, m, 0x20)
		if ((memcmp(s40, s20, 0x20) as u32) != 0) {
			anchor_error_from(s5c0, 0x7d1 /* anchor::ConstraintHasOne */)
			const v = Error_with_account_name(s5d0, ld64(s5c0), ld64(s5c0 + 8), 0x100152b28 /* "whirlpool" */, 9)
			const u = ld64(s5d0 + 8)
			const t = ld64(s5d0)
			copyr(s548, s148, 0x20)
			copy(s528, s20, 0x20)
			x = fn_13b5c0(s5e0, t, u, s548, v)
			w = ld64(s5e0)
			st64(a + 0x10, ld64(s5e0 + 8))
			st64(a + 8, w)
			st64(a, 0)
			return x
		}
		const o = fee_authority.key
		copyr(s40, o, 0x20)
		st64(s678, fee_authority)
		const p = ld64(s660)
		st64(s20 + 8, p)
		st64(s20, ld64(s660 + 8))
		copy(s10, s5a0, 0x10)
		if ((memcmp(s40, s20, 0x20) as u32) == 0) {
			memcpy(a + 0x18, s5a0, 0x58)
			x = memcpy(a + 0x88, s2b8, 0x278)
			st64(a + 0x300, ld64(s678))
			st64(a + 0x80, ld64(s670 + 8))
			st64(a + 0x78, ld64(s670))
			st64(a + 0x70, whirlpool)
			st64(a + 0x10, p)
			st64(a + 8, ld64(s660 + 8))
			st64(a, whirlpools_config)
			return x
		}
		anchor_error_from(s5f0, 0x7dc /* anchor::ConstraintAddress */)
		const s = Error_with_account_name(s600, ld64(s5f0), ld64(s5f0 + 8), "fee_authority", 0xd)
		const r = ld64(s600 + 8)
		const q = ld64(s600)
		copy(s548, s40, 0x40)
		x = fn_13b5c0(s610, q, r, s548, s)
		w = ld64(s610)
		st64(a + 0x10, ld64(s610 + 8))
		st64(a + 8, w)
		st64(a, 0)
		return x
	}
	x = Error_with_account_name(s5b0, l, fee_authority, "fee_authority", 0xd)
	w = ld64(s5b0)
	st64(a + 0x10, ld64(s5b0 + 8))
	st64(a + 8, w)
	st64(a, 0)
	return x
}

// Anchor Accounts::try_accounts of instruction decrease_liquidity_v2 (called by ix_decrease_liquidity_v2; name [str]: from the handler's "Instruction: …" log; was fn_d95e0)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool (ConstraintMut), position (ConstraintMut, ConstraintHasOne), position_token_account (ConstraintRaw), token_mint_a (ConstraintAddress), token_mint_b (ConstraintAddress), tick_array_lower (AccountNotEnoughKeys, ConstraintMut), tick_array_upper (ConstraintMut), token_program_a (ConstraintAddress), token_owner_account_a (ConstraintMut, ConstraintRaw), token_vault_b (ConstraintMut, ConstraintRaw), token_vault_a (ConstraintMut, ConstraintRaw), token_owner_account_b (ConstraintMut, ConstraintRaw), token_program_b (ConstraintAddress), position_authority, memo_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_token_account_box, token_owner_account_a_box, token_owner_account_b_box, token_vault_a_box, token_vault_b_box, position, token_vault_a, token_vault_b
export function accounts_decrease_liquidity_v2(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s80 = fp - 0x80, sa0 = fp - 0xa0, se0 = fp - 0xe0, s100 = fp - 0x100, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1d8 = fp - 0x1d8, s408 = fp - 0x408, s448 = fp - 0x448, s450 = fp - 0x450, s460 = fp - 0x460, s468 = fp - 0x468, s4f0 = fp - 0x4f0, s510 = fp - 0x510, s530 = fp - 0x530, s550 = fp - 0x550, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s6f8 = fp - 0x6f8, s708 = fp - 0x708, s718 = fp - 0x718, s728 = fp - 0x728, s738 = fp - 0x738, s748 = fp - 0x748, s758 = fp - 0x758, s768 = fp - 0x768, s778 = fp - 0x778, s788 = fp - 0x788, s798 = fp - 0x798, s7a8 = fp - 0x7a8, s7b8 = fp - 0x7b8, s7c8 = fp - 0x7c8, s7d8 = fp - 0x7d8, s7e8 = fp - 0x7e8, s7f8 = fp - 0x7f8, s808 = fp - 0x808, s818 = fp - 0x818, s828 = fp - 0x828, s838 = fp - 0x838, s848 = fp - 0x848, s858 = fp - 0x858, s868 = fp - 0x868, s878 = fp - 0x878, s888 = fp - 0x888, s898 = fp - 0x898, s8a8 = fp - 0x8a8, s8b8 = fp - 0x8b8, s8c8 = fp - 0x8c8, s8d8 = fp - 0x8d8, s8e8 = fp - 0x8e8, s8f8 = fp - 0x8f8, s908 = fp - 0x908, s918 = fp - 0x918, s928 = fp - 0x928, s938 = fp - 0x938, s948 = fp - 0x948, s958 = fp - 0x958, s968 = fp - 0x968, s978 = fp - 0x978, s988 = fp - 0x988, s998 = fp - 0x998, s9a8 = fp - 0x9a8, s9b8 = fp - 0x9b8, s9c8 = fp - 0x9c8, s9d8 = fp - 0x9d8, s9e8 = fp - 0x9e8, s9f8 = fp - 0x9f8, sa08 = fp - 0xa08, sa18 = fp - 0xa18, sa28 = fp - 0xa28, sa38 = fp - 0xa38, sa48 = fp - 0xa48, sa58 = fp - 0xa58, sa68 = fp - 0xa68, sa78 = fp - 0xa78, sa88 = fp - 0xa88, sa98 = fp - 0xa98, saa8 = fp - 0xaa8, sab8 = fp - 0xab8, sae8 = fp - 0xae8, sb10 = fp - 0xb10, sb30 = fp - 0xb30, sb38 = fp - 0xb38, sb40 = fp - 0xb40, sb48 = fp - 0xb48, sb50 = fp - 0xb50, sb58 = fp - 0xb58, sb60 = fp - 0xb60
	let w, y, z, al, am, ao, aq: u64
	let g = a
	try_accounts_11a48(s468, c, c, d, e)
	const h = ld64(s460 + 8)
	const i = ld64(s460)
	const f = ld64(s468)
	if (f == 0) {
		z = Error_with_account_name(sab8, i, h, 0x100152b28 /* "whirlpool" */, 9)
		w = ld64(sab8)
		st64(g + 0x10, ld64(sab8 + 8))
		st64(g + 8, w)
		st32(g, 2)
		return z
	}
	st64(sae8 + 0x28, g)
	memcpy(s6e0, s450, 0x278)
	st64(s6f0, i, h)
	st64(sae8 + 0x20, f)
	st64(s6f8, f)
	try_accounts_120(s468, c)
	const q = ld64(s460)
	const j = ld64(s468)
	if (j == 2) {
		try_accounts_120(s468, c)
		const l = ld64(s460)
		const k = ld64(s468)
		const x = ld64(sae8 + 0x28)
		if (k == 2) {
			st64(sae8 + 0x18, l)
			fn_12758(s468, c, l)
			const n = ld64(s460)
			const m = ld64(s468)
			if (m == 2) {
				st64(sae8 + 0x10, n)
				try_accounts_11718(s468, c, n)
				const p = ld64(s460)
				const o = ld64(s468)
				if (o == 2) {
					st64(sae8, p, q)
					try_accounts_11b00(s468, c, p)
					const s = ld64(s460 + 8)
					const t = ld64(s460)
					const position: AccountInfo = ld64(s468)
					if (position == 0) {
						z = Error_with_account_name(saa8, t, s, "position", 8)
						w = ld64(saa8)
						g = ld64(sae8 + 0x28)
						st64(g + 0x10, ld64(saa8 + 8))
						st64(g + 8, w)
						st32(g, 2)
						return z
					}
					memcpy(s1c0, s450, 0xc0)
					st64(s1d8, position, t, s)
					try_accounts_558(s468, c)
					if (ld32(s408 + 0x50) == 2) {
						z = Error_with_account_name(sa98, ld64(s468), ld64(s460), "position_token_account", 0x16)
						w = ld64(sa98)
						g = ld64(sae8 + 0x28)
						st64(g + 0x10, ld64(sa98 + 8))
						st64(g + 8, w)
						st32(g, 2)
						return z
					}
					const u = ld64(0x300000000 /* heap bump-allocator cursor */)
					const position_token_account_box: TokenAccount_2 = u != 0 ? sat_sub(u, 0xd8) & -8 : 0x300007f28
					if (position_token_account_box > 0x300000007) {
						st64(0x300000000 /* heap bump-allocator cursor */, position_token_account_box)
						memcpy(position_token_account_box, s468, 0xd8)
						try_accounts_610(s468, c)
						const aa = ld32(s468)
						if (aa == 2) {
							z = Error_with_account_name(sa88, ld64(s460), ld64(s460 + 8), "token_mint_a", 0xc)
							w = ld64(sa88)
							g = ld64(sae8 + 0x28)
							st64(g + 0x10, ld64(sa88 + 8))
							st64(g + 8, w)
							st32(g, 2)
							return z
						}
						st64(sb10 + 0x18, position_token_account_box)
						copyr(sb10, s460, 0x10)
						st64(sb10 + 0x10, ld32(s468 + 4))
						memcpy(se0, s450, 0x40)
						copy(s100, s408, 0x20)
						st64(sb10 + 0x20, ld64(s448 + 0x38))
						try_accounts_610(s468, c)
						const ab = ld32(s468)
						if (ab == 2) {
							z = Error_with_account_name(sa78, ld64(s460), ld64(s460 + 8), "token_mint_b", 0xc)
							w = ld64(sa78)
							g = ld64(sae8 + 0x28)
							st64(g + 0x10, ld64(sa78 + 8))
							st64(g + 8, w)
							st32(g, 2)
							return z
						}
						copyr(sb30, s460, 0x10)
						st64(sb30 + 0x10, ld32(s468 + 4))
						memcpy(s80, s450, 0x40)
						copy(sa0, s408, 0x20)
						st64(sb30 + 0x18, ld64(s448 + 0x38))
						fn_2258(s468, c)
						const token_owner_account_a_box: TokenAccount_2 = ld64(s460)
						const ac = ld64(s468)
						if (ac == 2) {
							st64(sb38, token_owner_account_a_box)
							fn_2258(s468, c, token_owner_account_a_box)
							const token_owner_account_b_box: TokenAccount_2 = ld64(s460)
							const ae = ld64(s468)
							if (ae == 2) {
								st64(sb40, token_owner_account_b_box)
								fn_2258(s468, c, token_owner_account_b_box)
								const token_vault_a_box: TokenAccount_2 = ld64(s460)
								const ag = ld64(s468)
								if (ag == 2) {
									st64(sb48, token_vault_a_box)
									fn_2258(s468, c, token_vault_a_box)
									const token_vault_b_box: TokenAccount_2 = ld64(s460)
									const ai = ld64(s468)
									if (ai == 2) {
										B34: {
											st64(sb50, token_vault_b_box)
											const ak = ld64(c + 8)
											if (ak != 0) {
												ao = ld64(c)
												st64(c, ao + 0x30, ak - 1)
												if (ak != 1) {
													st64(sb58, ao)
													st64(c + 8, ak - 2)
													aq = ld64(c)
													st64(c, aq + 0x30)
													break B34
												}
											} else {
												anchor_error_from(s788, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_b_box, al, am)
												ao = ld64(s788 + 8)
												const an = ld64(s788)
												if (an != 2) {
													z = Error_with_account_name(s798, an, ao, "tick_array_lower", 0x10)
													w = ld64(s798)
													g = ld64(sae8 + 0x28)
													st64(g + 0x10, ld64(s798 + 8))
													st64(g + 8, w)
													st32(g, 2)
													return z
												}
											}
											st64(sb58, ao)
											anchor_error_from(s7a8, 0xbbd /* anchor::AccountNotEnoughKeys */, ao, al, am)
											aq = ld64(s7a8 + 8)
											const ap = ld64(s7a8)
											if (ap != 2) {
												z = Error_with_account_name(s7b8, ap, aq, "tick_array_upper", 0x10)
												w = ld64(s7b8)
												g = ld64(sae8 + 0x28)
												st64(g + 0x10, ld64(s7b8 + 8))
												st64(g + 8, w)
												st32(g, 2)
												return z
											}
										}
										st64(sb60, aq)
										if (ld8(ld64(sae8 + 0x20) + 0x29 /* is_writable */) == 0) {
											anchor_error_from(sa58, 0x7d0 /* anchor::ConstraintMut */, aq, al, am)
											z = Error_with_account_name(sa68, ld64(sa58), ld64(sa58 + 8), 0x100152b28 /* "whirlpool" */, 9)
											w = ld64(sa68)
											g = ld64(sae8 + 0x28)
											st64(g + 0x10, ld64(sa68 + 8))
											st64(g + 8, w)
											st32(g, 2)
											return z
										}
										const ar = ld64(ld64(sae8 + 8))
										copyr(s40, ar, 0x20)
										AccountInfo_clone(s468, ld64(sb10 + 0x20))
										const at = ld64(s450)
										copy(s20, at, 0x20)
										const av = ld64(s460 + 8)
										const au = ld64(s460)
										rc_dec(au)
										rc_dec(av)
										if ((memcmp(s40, s20, 0x20) as u32) != 0) {
											anchor_error_from(s7c8, 0x7dc /* anchor::ConstraintAddress */)
											const bf = Error_with_account_name(s7d8, ld64(s7c8), ld64(s7c8 + 8), "token_program_a", 0xf)
											const be = ld64(s7d8 + 8)
											const bd = ld64(s7d8)
											copy(s468, s40, 0x40)
											z = fn_13b5c0(s7e8, bd, be, s468, bf)
											w = ld64(s7e8)
											g = ld64(sae8 + 0x28)
											st64(g + 0x10, ld64(s7e8 + 8))
											st64(g + 8, w)
											st32(g, 2)
											return z
										}
										const aw = ld64(ld64(sae8 + 0x18))
										copyr(s40, aw, 0x20)
										AccountInfo_clone(s468, ld64(sb30 + 0x18))
										const ax = ld64(s450)
										copy(s20, ax, 0x20)
										const az = ld64(s460 + 8)
										const ay = ld64(s460)
										rc_dec(ay)
										rc_dec(az)
										if ((memcmp(s40, s20, 0x20) as u32) == 0) {
											if (position.is_writable == 0) {
												anchor_error_from(sa38, 0x7d0 /* anchor::ConstraintMut */)
												z = Error_with_account_name(sa48, ld64(sa38), ld64(sa38 + 8), "position", 8)
												w = ld64(sa48)
												g = ld64(sae8 + 0x28)
												st64(g + 0x10, ld64(sa48 + 8))
												st64(g + 8, w)
												st32(g, 2)
												return z
											}
											copyr(s40, s1d0, 0x20)
											const bg = ld64(ld64(sae8 + 0x20) /* key */)
											copyr(s20, bg, 0x20)
											if ((memcmp(s40, s20, 0x20) as u32) != 0) {
												anchor_error_from(s828, 0x7d1 /* anchor::ConstraintHasOne */)
												const bj = Error_with_account_name(s838, ld64(s828), ld64(s828 + 8), "position", 8)
												const bi = ld64(s838 + 8)
												const bh = ld64(s838)
												copyr(s468, s1d0, 0x20)
												copy(s448, s20, 0x20)
												z = fn_13b5c0(s848, bh, bi, s468, bj)
												w = ld64(s848)
												g = ld64(sae8 + 0x28)
												st64(g + 0x10, ld64(s848 + 8))
												st64(g + 8, w)
												st32(g, 2)
												return z
											}
											if ((memcmp(ld64(sb10 + 0x18) + 0x28, s1b0, 0x20) as u32) == 0) {
												if (ld64(ld64(sb10 + 0x18) + 0x68) != 1) {
													anchor_error_from(s878, 0x7d3 /* anchor::ConstraintRaw */)
													z = Error_with_account_name(s888, ld64(s878), ld64(s878 + 8), "position_token_account", 0x16)
													w = ld64(s888)
													g = ld64(sae8 + 0x28)
													st64(g + 0x10, ld64(s888 + 8))
													st64(g + 8, w)
													st32(g, 2)
													return z
												}
												const bk = ld64(ld64(sb10 + 0x20))
												copyr(s40, bk, 0x20)
												copyr(s20, s550, 0x20)
												if ((memcmp(s40, s20, 0x20) as u32) == 0) {
													const bo = ld64(ld64(sb30 + 0x18))
													copyr(s40, bo, 0x20)
													copyr(s20, s510, 0x20)
													if ((memcmp(s40, s20, 0x20) as u32) == 0) {
														if (ld8(ld64(ld64(sb38) + 0x20) + 0x29) == 0) {
															anchor_error_from(sa18, 0x7d0 /* anchor::ConstraintMut */)
															z = Error_with_account_name(sa28, ld64(sa18), ld64(sa18 + 8), "token_owner_account_a", 0x15)
															w = ld64(sa28)
															g = ld64(sae8 + 0x28)
															st64(g + 0x10, ld64(sa28 + 8))
															st64(g + 8, w)
															st32(g, 2)
															return z
														}
														if ((memcmp(ld64(sb38) + 0x28, s550, 0x20) as u32) == 0) {
															if (ld8(ld64(ld64(sb40) + 0x20) + 0x29) != 0) {
																if ((memcmp(ld64(sb40) + 0x28, s510, 0x20) as u32) == 0) {
																	const token_vault_a: AccountInfo = ld64(ld64(sb48) + 0x20)
																	if (token_vault_a.is_writable != 0) {
																		const bt = token_vault_a.key
																		copyr(s468, bt, 0x20)
																		if ((memcmp(s468, s530, 0x20) as u32) == 0) {
																			const token_vault_b: AccountInfo = ld64(ld64(sb50) + 0x20)
																			if (token_vault_b.is_writable != 0) {
																				const bv = token_vault_b.key
																				copyr(s468, bv, 0x20)
																				if ((memcmp(s468, s4f0, 0x20) as u32) == 0) {
																					if (ld8(ld64(sb58) + 0x29) != 0) {
																						if (ld8(ld64(sb60) + 0x29) != 0) {
																							const bw = ld64(sae8 + 0x28)
																							memcpy(bw + 0x100, s6f8, 0x290)
																							memcpy(bw + 0x3b0, s1d8, 0xd8)
																							memcpy(bw + 0x18, se0, 0x40)
																							copy(bw + 0x60, s100, 0x20)
																							z = memcpy(bw + 0x98, s80, 0x40)
																							const ca = ld64(sa0 + 0x18)
																							const bz = ld64(sa0 + 0x10)
																							const by = ld64(sa0 + 8)
																							const bx = ld64(sa0)
																							copy(bw + 8, sb10, 0x10)
																							st64(bw + 0x58, ld64(sb10 + 0x20))
																							copy(bw + 0x88, sb30, 0x10)
																							st64(bw + 0xd8, ld64(sb30 + 0x18))
																							st64(bw + 0x390, ld64(sae8 + 8))
																							st64(bw + 0x398, ld64(sae8 + 0x18))
																							st64(bw + 0x3a0, ld64(sae8 + 0x10))
																							st64(bw + 0x3a8, ld64(sae8))
																							st64(bw + 0x488, ld64(sb10 + 0x18))
																							st64(bw + 0x490, ld64(sb38))
																							st64(bw + 0x498, ld64(sb40))
																							st64(bw + 0x4a0, ld64(sb48))
																							st64(bw + 0x4a8, ld64(sb50))
																							st64(bw + 0x4b0, ld64(sb58))
																							st64(bw + 0x4b8, ld64(sb60))
																							st32(bw + 0x84, ld64(sb30 + 0x10))
																							st32(bw + 0x80, ab)
																							st32(bw + 4, ld64(sb10 + 0x10))
																							st32(bw, aa)
																							st64(bw + 0xe0, bx, by, bz, ca)
																							return z
																						}
																						anchor_error_from(s978, 0x7d0 /* anchor::ConstraintMut */)
																						z = Error_with_account_name(s988, ld64(s978), ld64(s978 + 8), "tick_array_upper", 0x10)
																						w = ld64(s988)
																						g = ld64(sae8 + 0x28)
																						st64(g + 0x10, ld64(s988 + 8))
																						st64(g + 8, w)
																						st32(g, 2)
																						return z
																					}
																					anchor_error_from(s998, 0x7d0 /* anchor::ConstraintMut */)
																					z = Error_with_account_name(s9a8, ld64(s998), ld64(s998 + 8), "tick_array_lower", 0x10)
																					w = ld64(s9a8)
																					g = ld64(sae8 + 0x28)
																					st64(g + 0x10, ld64(s9a8 + 8))
																					st64(g + 8, w)
																					st32(g, 2)
																					return z
																				}
																				anchor_error_from(s958, 0x7d3 /* anchor::ConstraintRaw */)
																				z = Error_with_account_name(s968, ld64(s958), ld64(s958 + 8), "token_vault_b", 0xd)
																				w = ld64(s968)
																				g = ld64(sae8 + 0x28)
																				st64(g + 0x10, ld64(s968 + 8))
																				st64(g + 8, w)
																				st32(g, 2)
																				return z
																			}
																			anchor_error_from(s9b8, 0x7d0 /* anchor::ConstraintMut */)
																			z = Error_with_account_name(s9c8, ld64(s9b8), ld64(s9b8 + 8), "token_vault_b", 0xd)
																			w = ld64(s9c8)
																			g = ld64(sae8 + 0x28)
																			st64(g + 0x10, ld64(s9c8 + 8))
																			st64(g + 8, w)
																			st32(g, 2)
																			return z
																		}
																		anchor_error_from(s938, 0x7d3 /* anchor::ConstraintRaw */)
																		z = Error_with_account_name(s948, ld64(s938), ld64(s938 + 8), "token_vault_a", 0xd)
																		w = ld64(s948)
																		g = ld64(sae8 + 0x28)
																		st64(g + 0x10, ld64(s948 + 8))
																		st64(g + 8, w)
																		st32(g, 2)
																		return z
																	}
																	anchor_error_from(s9d8, 0x7d0 /* anchor::ConstraintMut */)
																	z = Error_with_account_name(s9e8, ld64(s9d8), ld64(s9d8 + 8), "token_vault_a", 0xd)
																	w = ld64(s9e8)
																	g = ld64(sae8 + 0x28)
																	st64(g + 0x10, ld64(s9e8 + 8))
																	st64(g + 8, w)
																	st32(g, 2)
																	return z
																}
																anchor_error_from(s918, 0x7d3 /* anchor::ConstraintRaw */)
																z = Error_with_account_name(s928, ld64(s918), ld64(s918 + 8), "token_owner_account_b", 0x15)
																w = ld64(s928)
																g = ld64(sae8 + 0x28)
																st64(g + 0x10, ld64(s928 + 8))
																st64(g + 8, w)
																st32(g, 2)
																return z
															}
															anchor_error_from(s9f8, 0x7d0 /* anchor::ConstraintMut */)
															z = Error_with_account_name(sa08, ld64(s9f8), ld64(s9f8 + 8), "token_owner_account_b", 0x15)
															w = ld64(sa08)
															g = ld64(sae8 + 0x28)
															st64(g + 0x10, ld64(sa08 + 8))
															st64(g + 8, w)
															st32(g, 2)
															return z
														}
														anchor_error_from(s8f8, 0x7d3 /* anchor::ConstraintRaw */)
														z = Error_with_account_name(s908, ld64(s8f8), ld64(s8f8 + 8), "token_owner_account_a", 0x15)
														w = ld64(s908)
														g = ld64(sae8 + 0x28)
														st64(g + 0x10, ld64(s908 + 8))
														st64(g + 8, w)
														st32(g, 2)
														return z
													}
													anchor_error_from(s8c8, 0x7dc /* anchor::ConstraintAddress */)
													const br = Error_with_account_name(s8d8, ld64(s8c8), ld64(s8c8 + 8), "token_mint_b", 0xc)
													const bq = ld64(s8d8 + 8)
													const bp = ld64(s8d8)
													copyr(s468, s40, 0x20)
													copy(s448, s510, 0x20)
													z = fn_13b5c0(s8e8, bp, bq, s468, br)
													w = ld64(s8e8)
													g = ld64(sae8 + 0x28)
													st64(g + 0x10, ld64(s8e8 + 8))
													st64(g + 8, w)
													st32(g, 2)
													return z
												}
												anchor_error_from(s898, 0x7dc /* anchor::ConstraintAddress */)
												const bn = Error_with_account_name(s8a8, ld64(s898), ld64(s898 + 8), "token_mint_a", 0xc)
												const bm = ld64(s8a8 + 8)
												const bl = ld64(s8a8)
												copyr(s468, s40, 0x20)
												copy(s448, s550, 0x20)
												z = fn_13b5c0(s8b8, bl, bm, s468, bn)
												w = ld64(s8b8)
												g = ld64(sae8 + 0x28)
												st64(g + 0x10, ld64(s8b8 + 8))
												st64(g + 8, w)
												st32(g, 2)
												return z
											}
											anchor_error_from(s858, 0x7d3 /* anchor::ConstraintRaw */)
											z = Error_with_account_name(s868, ld64(s858), ld64(s858 + 8), "position_token_account", 0x16)
											w = ld64(s868)
											g = ld64(sae8 + 0x28)
											st64(g + 0x10, ld64(s868 + 8))
											st64(g + 8, w)
											st32(g, 2)
											return z
										}
										anchor_error_from(s7f8, 0x7dc /* anchor::ConstraintAddress */)
										const bc = Error_with_account_name(s808, ld64(s7f8), ld64(s7f8 + 8), "token_program_b", 0xf)
										const bb = ld64(s808 + 8)
										const ba = ld64(s808)
										copy(s468, s40, 0x40)
										z = fn_13b5c0(s818, ba, bb, s468, bc)
										w = ld64(s818)
										g = ld64(sae8 + 0x28)
										st64(g + 0x10, ld64(s818 + 8))
										st64(g + 8, w)
										st32(g, 2)
										return z
									}
									z = Error_with_account_name(s778, ai, token_vault_b_box, "token_vault_b", 0xd)
									w = ld64(s778)
									g = ld64(sae8 + 0x28)
									st64(g + 0x10, ld64(s778 + 8))
									st64(g + 8, w)
									st32(g, 2)
									return z
								}
								z = Error_with_account_name(s768, ag, token_vault_a_box, "token_vault_a", 0xd)
								w = ld64(s768)
								g = ld64(sae8 + 0x28)
								st64(g + 0x10, ld64(s768 + 8))
								st64(g + 8, w)
								st32(g, 2)
								return z
							}
							z = Error_with_account_name(s758, ae, token_owner_account_b_box, "token_owner_account_b", 0x15)
							w = ld64(s758)
							g = ld64(sae8 + 0x28)
							st64(g + 0x10, ld64(s758 + 8))
							st64(g + 8, w)
							st32(g, 2)
							return z
						}
						z = Error_with_account_name(s748, ac, token_owner_account_a_box, "token_owner_account_a", 0x15)
						w = ld64(s748)
						g = ld64(sae8 + 0x28)
						st64(g + 0x10, ld64(s748 + 8))
						st64(g + 8, w)
						st32(g, 2)
						return z
					}
					alloc_handle_alloc_error(8, 0xd8)
				}
				z = Error_with_account_name(s738, o, p, "position_authority", 0x12)
				y = ld64(s738)
				st64(x + 0x10, ld64(s738 + 8))
				st64(x + 8, y)
				st32(x, 2)
				return z
			}
			z = Error_with_account_name(s728, m, n, "memo_program", 0xc)
			y = ld64(s728)
			st64(x + 0x10, ld64(s728 + 8))
			st64(x + 8, y)
			st32(x, 2)
			return z
		}
		z = Error_with_account_name(s718, k, l, "token_program_b", 0xf)
		y = ld64(s718)
		st64(x + 0x10, ld64(s718 + 8))
		st64(x + 8, y)
		st32(x, 2)
		return z
	}
	z = Error_with_account_name(s708, j, q, "token_program_a", 0xf)
	w = ld64(s708)
	g = ld64(sae8 + 0x28)
	st64(g + 0x10, ld64(s708 + 8))
	st64(g + 8, w)
	st32(g, 2)
	return z
}

// Anchor Accounts::try_accounts of instruction set_default_base_fee_rate (called by ix_set_default_base_fee_rate; name [str]: from the handler's "Instruction: …" log; was fn_ff908)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, adaptive_fee_tier (ConstraintMut, ConstraintHasOne), fee_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpools_config, adaptive_fee_tier, fee_authority
export function accounts_set_default_base_fee_rate(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, sa8 = fp - 0xa8, s110 = fp - 0x110, s128 = fp - 0x128, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s258 = fp - 0x258
	let w, x: u64
	try_accounts_11de0(s128, c, c, d, e)
	const h = ld64(s128 + 0x10)
	const g = ld64(s128 + 8)
	const whirlpools_config: AccountInfo = ld64(s128)
	if (whirlpools_config == 0) {
		x = Error_with_account_name(s230, g, h, "whirlpools_config", 0x11)
		w = ld64(s230)
		st64(a + 0x10, ld64(s230 + 8))
		st64(a + 8, w)
		st64(a, 0)
		return x
	}
	st64(s240, h, g)
	memcpy(s180, s110, 0x58)
	try_accounts_11d28(s128, c)
	const k = ld64(s128 + 0x10)
	const j = ld64(s128 + 8)
	const adaptive_fee_tier: AccountInfo = ld64(s128)
	if (adaptive_fee_tier == 0) {
		x = Error_with_account_name(s220, j, k, 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
		w = ld64(s220)
		st64(a + 0x10, ld64(s220 + 8))
		st64(a + 8, w)
		st64(a, 0)
		return x
	}
	st64(s250, j, k)
	memcpy(sa8, s110, 0x68)
	try_accounts_11718(s128, c)
	const fee_authority: AccountInfo = ld64(s128 + 8)
	const l = ld64(s128)
	if (l == 2) {
		if (adaptive_fee_tier.is_writable == 0) {
			anchor_error_from(s200, 0x7d0 /* anchor::ConstraintMut */)
			x = Error_with_account_name(s210, ld64(s200), ld64(s200 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
			w = ld64(s210)
			st64(a + 0x10, ld64(s210 + 8))
			st64(a + 8, w)
			st64(a, 0)
			return x
		}
		copyr(s40, s250, 0x10)
		copy(s30, sa8, 0x10)
		const m = whirlpools_config.key
		copyr(s20, m, 0x20)
		if ((memcmp(s40, s20, 0x20) as u32) != 0) {
			anchor_error_from(s1a0, 0x7d1 /* anchor::ConstraintHasOne */)
			const v = Error_with_account_name(s1b0, ld64(s1a0), ld64(s1a0 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
			const u = ld64(s1b0 + 8)
			const t = ld64(s1b0)
			copy(s128, s40, 0x40)
			x = fn_13b5c0(s1c0, t, u, s128, v)
			w = ld64(s1c0)
			st64(a + 0x10, ld64(s1c0 + 8))
			st64(a + 8, w)
			st64(a, 0)
			return x
		}
		const o = fee_authority.key
		copyr(s40, o, 0x20)
		st64(s258, fee_authority)
		const p = ld64(s240)
		st64(s20 + 8, p)
		st64(s20, ld64(s240 + 8))
		copy(s10, s180, 0x10)
		if ((memcmp(s40, s20, 0x20) as u32) == 0) {
			memcpy(a + 0x18, s180, 0x58)
			x = memcpy(a + 0x88, sa8, 0x68)
			st64(a + 0xf0, ld64(s258))
			st64(a + 0x80, ld64(s250 + 8))
			st64(a + 0x78, ld64(s250))
			st64(a + 0x70, adaptive_fee_tier)
			st64(a + 0x10, p)
			st64(a + 8, ld64(s240 + 8))
			st64(a, whirlpools_config)
			return x
		}
		anchor_error_from(s1d0, 0x7dc /* anchor::ConstraintAddress */)
		const s = Error_with_account_name(s1e0, ld64(s1d0), ld64(s1d0 + 8), "fee_authority", 0xd)
		const r = ld64(s1e0 + 8)
		const q = ld64(s1e0)
		copy(s128, s40, 0x40)
		x = fn_13b5c0(s1f0, q, r, s128, s)
		w = ld64(s1f0)
		st64(a + 0x10, ld64(s1f0 + 8))
		st64(a + 8, w)
		st64(a, 0)
		return x
	}
	x = Error_with_account_name(s190, l, fee_authority, "fee_authority", 0xd)
	w = ld64(s190)
	st64(a + 0x10, ld64(s190 + 8))
	st64(a + 8, w)
	st64(a, 0)
	return x
}

export function fn_104598(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s40 = fp - 0x40, s50 = fp - 0x50, s70 = fp - 0x70, s90 = fp - 0x90, sb8 = fp - 0xb8, sc8 = fp - 0xc8
	let n, o, p, q: u64
	const f = ld64(b + 8)
	if (7 >= f) {
		fn_14c4f0(8, f, 0x10015a870, d, e)
	}
	B13: {
		const g = ld64(b)
		st64(sb8 + 8, f - 8)
		if (f - 8 >= 0x20) {
			st64(sb8, g + 0x28)
			const h = ld64(g + 0xe)
			st8(s50 + 8, ld8(g + 0x16))
			st32(s90 + 0x18, ld32(g + 8))
			st16(s90 + 0x1c, ld16(g + 0xc))
			st64(s50, h)
			const v = ld64(s50 + 1)
			copy(s90, g + 0x17, 0x10)
			st8(s90 + 0x10, ld8(g + 0x27))
			if (f - 0x28 >= 0x20) {
				const i = ld64(g + 0x2e)
				st8(s50 + 8, ld8(g + 0x36))
				st32(s70 + 0x18, ld32(g + 0x28))
				st16(s70 + 0x1c, ld16(g + 0x2c))
				st64(s50, i)
				const l = ld64(s50 + 1)
				copy(s70, g + 0x37, 0x10)
				st8(s70 + 0x10, ld8(g + 0x47))
				if (f - 0x48 >= 0x10 && (f & -4) != 0x58) {
					const af = ld64(g + 0x50)
					const j = ld64(g + 0x48)
					const k = ld32(g + 0x58)
					st64(sb8 + 8, f - 0x5c)
					if (f - 0x5c >= 4) {
						const ae = ld32(g + 0x5c)
						st64(sb8, g + 0x60)
						if ((f & -0x10) != 0x60 && ((f & -8) != 0x70 && (f - 0x78 >= 0x10 && (f & -8) != 0x88))) {
							const aa = ld64(g + 0x68)
							const ab = ld64(g + 0x60)
							const ad = ld64(g + 0x70)
							const y = ld64(g + 0x80)
							const z = ld64(g + 0x78)
							const ac = ld64(g + 0x88)
							st64(sb8, g + 0x90, f - 0x90)
							fn_10590(s50, sb8)
							q = ld64(s50 + 8)
							if (ld64(s50) == 0) {
								memcpy(a + 0x90, s40, 0x40)
								st32(sb8 + 0x10, ld32(s90 + 0x18))
								st16(sb8 + 0x14, ld16(s90 + 0x1c))
								copy(s50, s90, 0x10)
								st8(s40, ld8(s90 + 0x10))
								st32(sb8 + 0x18, ld32(s70 + 0x18))
								st16(sb8 + 0x1c, ld16(s70 + 0x1c))
								st8(a + 0x47, ld8(s70 + 0x10))
								st64(a + 0x3f, ld64(s70 + 8))
								st64(a + 0x37, ld64(s70))
								st16(sb8 + 0x24, ld16(sb8 + 0x14))
								st32(sb8 + 0x20, ld32(sb8 + 0x10))
								st16(a + 0xc, ld16(sb8 + 0x24))
								st32(a + 8, ld32(sb8 + 0x20))
								st64(a + 0xf, v)
								st8(a + 0xe, h)
								copy(a + 0x17, s50, 0x10)
								st8(a + 0x27, ld8(s40))
								const x = ld16(sb8 + 0x1c)
								const w = ld32(sb8 + 0x18)
								st64(a + 0x70, y)
								st64(a + 0x68, z)
								st64(a + 0x60, aa)
								st64(a + 0x58, ab)
								st64(a + 0x50, af)
								st64(a + 0x48, j)
								st32(a + 0x28, w)
								st16(a + 0x2c, x)
								st32(a + 0xd4, ae)
								st32(a + 0xd0, k)
								st64(a + 0x88, q)
								st64(a + 0x80, ac)
								st64(a + 0x78, ad)
								st64(a + 0x2f, l)
								st8(a + 0x2e, i)
								st64(a, 0)
								return
							}
							break B13
						}
					}
				}
			}
		}
		const m = fn_1459d0(0x100159468)
		q = m
	}
	anchor_error_from(sc8, 0xbbb /* anchor::AccountDidNotDeserialize */, n, o, p)
	const t = ld64(sc8 + 8)
	const u = ld64(sc8)
	const r = q
	if (2 > (q & 3) - 2) {
		st64(a + 0x10, t)
		st64(a + 8, u)
		st64(a, 1)
	} else if ((r & 3) == 0) {
		st64(a + 0x10, t)
		st64(a + 8, u)
		st64(a, 1)
	} else {
		const s = ld64(ld64(q + 7))
		callx(s, ld64(q - 1), s)
		st64(a + 0x10, t)
		st64(a + 8, u)
		st64(a, 1)
	}
}

export function fn_104ee8(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20
	let q: u64
	const f = ld64(b + 8)
	if (7 >= f) {
		fn_14c4f0(8, f, 0x10015a888, d, e)
	}
	if (f - 8 >= 0x20) {
		const g = ld64(b)
		const h = ld64(g + 0xe)
		st8(s20 + 0x18, ld8(g + 0x16))
		st64(s20 + 0x10, h)
		if (f - 0x28 >= 0x20) {
			const l = ld64(s20 + 0x11)
			const i = ld64(g + 0x2e)
			st8(s20 + 0x18, ld8(g + 0x36))
			st16(a + 0x25, ld16(g + 0x2c))
			st32(a + 0x21, ld32(g + 0x28))
			st64(s20 + 0x10, i)
			q = ld64(s20 + 0x11)
			st8(a + 0x40, ld8(g + 0x47))
			st64(a + 0x38, ld64(g + 0x3f))
			st64(a + 0x30, ld64(g + 0x37))
			st32(a + 1, ld32(g + 8))
			st16(a + 5, ld16(g + 0xc))
			const m = ld8(g + 0x27)
			const k = ld64(g + 0x17)
			const j = ld64(g + 0x1f)
			st8(a + 0x27, i)
			st64(a + 0x18, j)
			st64(a + 0x10, k)
			st64(a + 8, l)
			st8(a + 7, h)
			st8(a + 0x20, m)
			st64(a + 0x28, q)
			st8(a, 0)
			return
		}
	}
	const n = fn_1459d0(0x100159468)
	anchor_error_from(s20, 0xbbb /* anchor::AccountDidNotDeserialize */)
	q = ld64(s20 + 8)
	const p = ld64(s20)
	if (2 > (n & 3) - 2) {
		st64(a + 8, p, q)
		st8(a, 1)
	} else if ((n & 3) == 0) {
		st64(a + 8, p, q)
		st8(a, 1)
	} else {
		const o = ld64(ld64(n + 7))
		callx(o, ld64(n - 1), o)
		st64(a + 8, p, q)
		st8(a, 1)
	}
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: TokenBadge
export function fn_105168(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s58 = fp - 0x58, s70 = fp - 0x70, sf0 = fp - 0xf0, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140
	let f, g: u64
	if (8 > ld64(b + 8)) {
		g = anchor_error_from(s140, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		f = ld64(s140)
		st64(a + 0x10, ld64(s140 + 8))
		st64(a + 8, f)
		st8(a, 1)
		return g
	}
	if (ld64(ld64(b)) == 0x96ff74f9e5ccdb74 /* account:TokenBadge */) {
		return fn_105440(a, b, 0x96ff74f9e5ccdb74 /* account:TokenBadge */, d, e)
	}
	ErrorCode_name(s70, 0x100152d5c, 0x96ff74f9e5ccdb74 /* account:TokenBadge */, d, e)
	st64(s58, 0, 1, 0)
	st64(s20, s58, 0x100159480)
	st8(s20 + 0x18, 3)
	st64(s20 + 0x10, 0x20)
	st64(s40 + 0x10, 0)
	st64(s40, 0)
	if (ErrorCode_fmt(0x100152d5c, s40) == 0) {
		copy(sf0, s70, 0x30)
		st64(s110 + 8, 0x1001553f7)
		st32(sf0 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
		st8(sf0 + 0x30, 2)
		st32(s110 + 0x18, 3)
		st64(s110 + 0x10, 0x2b)
		st64(s110, 0)
		fn_13b3a8(s120, s110)
		g = Error_with_account_name(s130, ld64(s120), ld64(s120 + 8), "TokenBadge", 0xa)
		f = ld64(s130)
		st64(a + 0x10, ld64(s130 + 8))
		st64(a + 8, f)
		st8(a, 1)
		return g
	}
	fn_149678("a Display implementation returned an error unexpectedly", 0x37, s110, 0x1001594b0, 0x1001594d0)
}

export function fn_105440(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s40 = fp - 0x40, s58 = fp - 0x58, s59 = fp - 0x59, s70 = fp - 0x70
	let i, k, l, m, q: u64
	const f = ld64(b + 8)
	if (f > 7) {
		B5: {
			if (f - 8 >= 0x20) {
				const g = ld64(b)
				const h = ld64(g + 0xe)
				st8(s40 + 8, ld8(g + 0x16))
				st64(s40, h)
				if (f - 0x28 >= 0x20) {
					const t = ld64(s40 + 1)
					const r = ld64(g + 0x2e)
					st8(s40 + 8, ld8(g + 0x36))
					st64(s40, r)
					if (f != 0x48) {
						const u = ld64(s40 + 1)
						const s = ld8(g + 0x48)
						st8(s59, s)
						if (2 > s) {
							st16(a + 6, ld16(g + 0xc))
							st32(a + 2, ld32(g + 8))
							st8(a + 0x21, ld8(g + 0x27))
							st64(a + 0x19, ld64(g + 0x1f))
							st64(a + 0x11, ld64(g + 0x17))
							st32(a + 0x22, ld32(g + 0x28))
							st16(a + 0x26, ld16(g + 0x2c))
							st64(a + 0x31, ld64(g + 0x37))
							q = ld64(g + 0x3f)
							st64(a + 0x39, q)
							st8(a + 0x41, ld8(g + 0x47))
							st64(s58 + 1, t)
							st8(s58, h)
							st8(a + 0x10, ld8(s58 + 8))
							st64(a + 8, ld64(s58))
							st64(a + 0x29, u)
							st8(a + 0x28, r)
							st8(a + 1, s)
							st8(a, 0)
							return q
						}
						st64(s40, 0x100159620)
						st64(s40 + 0x10, s10)
						st64(s10, s59, fn_14ef78)
						st64(s40 + 0x20, 0)
						st64(s40 + 8, 1)
						st64(s40 + 0x18, 1)
						// fmt "Invalid bool representation: {}" {} = s [fn_14ef78]
						fn_147e78(s58, s40, g, r, t)
						i = fn_b580(s58)
						break B5
					}
				}
			}
			i = fn_1459d0(0x100159468)
		}
		const j = i
		st64(s58, i)
		q = anchor_error_from(s70, 0xbbb /* anchor::AccountDidNotDeserialize */, k, l, m)
		const o = ld64(s70 + 8)
		const p = ld64(s70)
		if (2 > (i & 3) - 2) {
			st64(a + 0x10, o)
			st64(a + 8, p)
			st8(a, 1)
			return q
		}
		if ((j & 3) == 0) {
			st64(a + 0x10, o)
			st64(a + 8, p)
			st8(a, 1)
			return q
		}
		const n = ld64(ld64(j + 7))
		q = callx(n, ld64(j - 1), n)
		st64(a + 0x10, o)
		st64(a + 8, p)
		st8(a, 1)
		return q
	}
	fn_14c4f0(8, f, 0x10015a8a0, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (points to it)
export function fn_105ad8(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s178 = fp - 0x178, s188 = fp - 0x188, s1a8 = fp - 0x1a8, s1c8 = fp - 0x1c8, s1e8 = fp - 0x1e8, s208 = fp - 0x208, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248
	let r, t, u, v: u64
	const f = ld64(b + 8)
	if (7 >= f) {
		fn_14c4f0(8, f, 0x10015a8b8, d, e)
	}
	B24: {
		B23: {
			const g = ld64(b)
			st64(s238, g + 8, f - 8)
			if (f - 8 >= 0x20) {
				st64(s238, g + 0x28, f - 0x28)
				const h = ld64(g + 0xe)
				st8(s188 + 8, ld8(g + 0x16))
				st32(s228 + 0x18, ld32(g + 8))
				st16(s228 + 0x1c, ld16(g + 0xc))
				st64(s188, h)
				const q = ld64(s188 + 1)
				copy(s228, g + 0x17, 0x10)
				st8(s228 + 0x10, ld8(g + 0x27))
				if (f != 0x28) {
					const l = ld8(g + 0x28)
					st64(s238, g + 0x29, f - 0x29)
					if (f - 0x28 >= 3) {
						const k = ld16(g + 0x29)
						st64(s238, g + 0x2b, f - 0x2b)
						if (f - 0x2b >= 2) {
							const j = ld16(g + 0x2b)
							st64(s238, g + 0x2d, f - 0x2d)
							if (f - 0x2d >= 2) {
								const i = ld16(g + 0x2d)
								st64(s238, g + 0x2f, f - 0x2f)
								if (f - 0x2f >= 2) {
									const aq = ld16(g + 0x2f)
									st64(s238, g + 0x31, f - 0x31)
									if (f - 0x31 >= 0x10) {
										const ao = ld64(g + 0x39)
										const ap = ld64(g + 0x31)
										st64(s238, g + 0x41, f - 0x41)
										if (f - 0x41 >= 0x10) {
											const am = ld64(g + 0x49)
											const an = ld64(g + 0x41)
											st64(s238, g + 0x51, f - 0x51)
											if (f - 0x51 >= 4) {
												const al = ld32(g + 0x51)
												st64(s238, g + 0x55, f - 0x55)
												if (f - 0x55 >= 8) {
													const ak = ld64(g + 0x55)
													st64(s238, g + 0x5d, f - 0x5d)
													if (f - 0x5d >= 8) {
														const aj = ld64(g + 0x5d)
														st64(s238, g + 0x65 /* anchor::InstructionFallbackNotFound */, f - 0x65)
														fn_fe08(s188, s238)
														if (ld8(s188) == 0) {
															st32(s208 + 0x1b, ld32(s188 + 4))
															st32(s208 + 0x18, ld32(s188 + 1))
															copy(s208, s178, 0x10)
															st8(s208 + 0x10, ld8(s178 + 0x10))
															const ai = ld64(s188 + 8)
															fn_fe08(s188, s238)
															if (ld8(s188) == 0) {
																st32(s1e8 + 0x1b, ld32(s188 + 4))
																st32(s1e8 + 0x18, ld32(s188 + 1))
																copy(s1e8, s178, 0x10)
																st8(s1e8 + 0x10, ld8(s178 + 0x10))
																const m = ld64(s238 + 8)
																if (0x10 > m) {
																	break B23
																}
																const ah = ld64(s188 + 8)
																const n = ld64(s238)
																const af = ld64(n + 8)
																const ag = ld64(n)
																st64(s238, n + 0x10, m - 0x10)
																fn_fe08(s188, s238)
																if (ld8(s188) == 0) {
																	st32(s1c8 + 0x1b, ld32(s188 + 4))
																	st32(s1c8 + 0x18, ld32(s188 + 1))
																	copy(s1c8, s178, 0x10)
																	st8(s1c8 + 0x10, ld8(s178 + 0x10))
																	const ae = ld64(s188 + 8)
																	fn_fe08(s188, s238)
																	if (ld8(s188) == 0) {
																		st32(s1a8 + 0x1b, ld32(s188 + 4))
																		st32(s1a8 + 0x18, ld32(s188 + 1))
																		copy(s1a8, s178, 0x10)
																		st8(s1a8 + 0x10, ld8(s178 + 0x10))
																		const o = ld64(s238 + 8)
																		if (0x10 > o) {
																			break B23
																		}
																		const ad = ld64(s188 + 8)
																		const p = ld64(s238)
																		const ab = ld64(p + 8)
																		const ac = ld64(p)
																		st64(s238, p + 0x10, o - 0x10)
																		if (8 > o - 0x10) {
																			break B23
																		}
																		const aa = ld64(p + 0x10)
																		st64(s238, p + 0x18, o - 0x18)
																		fn_ff18(s188, s238)
																		r = ld64(s188 + 8)
																		if (ld64(s188) == 0) {
																			memcpy(a + 0x10, s178, 0x178)
																			st16(a + 0x18c, ld16(s228 + 0x1c))
																			st32(a + 0x188, ld32(s228 + 0x18))
																			st8(a + 0x1a7, ld8(s228 + 0x10))
																			st64(a + 0x19f, ld64(s228 + 8))
																			st64(a + 0x197, ld64(s228))
																			st32(a + 0x1ab, ld32(s208 + 0x1b))
																			st32(a + 0x1a8, ld32(s208 + 0x18))
																			st8(a + 0x1c7, ld8(s208 + 0x10))
																			st64(a + 0x1bf, ld64(s208 + 8))
																			st64(a + 0x1b7, ld64(s208))
																			st32(a + 0x1c8, ld32(s1e8 + 0x18))
																			st32(a + 0x1cb, ld32(s1e8 + 0x1b))
																			copy(a + 0x1d7, s1e8, 0x10)
																			st8(a + 0x1e7, ld8(s1e8 + 0x10))
																			st32(a + 0x1e8, ld32(s1c8 + 0x18))
																			st32(a + 0x1eb, ld32(s1c8 + 0x1b))
																			copy(a + 0x1f7, s1c8, 0x10)
																			st8(a + 0x207, ld8(s1c8 + 0x10))
																			st32(a + 0x208, ld32(s1a8 + 0x18))
																			st32(a + 0x20b, ld32(s1a8 + 0x1b))
																			st64(a + 0x217, ld64(s1a8))
																			st8(a + 0x227, ld8(s1a8 + 0x10))
																			st64(a + 0x21f, ld64(s1a8 + 8))
																			st64(a + 0x260, ab)
																			st64(a + 0x258, ac)
																			st64(a + 0x250, af)
																			st64(a + 0x248, ag)
																			st64(a + 0x240, am)
																			st64(a + 0x238, an)
																			st64(a + 0x230, ao)
																			st64(a + 0x228, ap)
																			st8(a + 0x28c, l)
																			st16(a + 0x28a, aq)
																			st16(a + 0x288, i)
																			st16(a + 0x286, j)
																			st16(a + 0x284, k)
																			st32(a + 0x280, al)
																			st64(a + 0x278, aa)
																			st64(a + 0x270, aj)
																			st64(a + 0x268, ak)
																			st64(a + 0x20f, ad)
																			st64(a + 0x1ef, ae)
																			st64(a + 0x1cf, ah)
																			st64(a + 0x1af, ai)
																			st64(a + 0x18f, q)
																			st8(a + 0x18e, h)
																			st64(a + 8, r)
																			st64(a, 0)
																			return
																		}
																		break B24
																	}
																}
															}
														}
														r = ld64(s188 + 8)
														break B24
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		const s = fn_1459d0(0x100159468)
		r = s
	}
	anchor_error_from(s248, 0xbbb /* anchor::AccountDidNotDeserialize */, t, u, v)
	const y = ld64(s248 + 8)
	const z = ld64(s248)
	const w = r
	if (2 > (r & 3) - 2) {
		st64(a + 0x10, y)
		st64(a + 8, z)
		st64(a, 1)
	} else if ((w & 3) == 0) {
		st64(a + 0x10, y)
		st64(a + 8, z)
		st64(a, 1)
	} else {
		const x = ld64(ld64(r + 7))
		callx(x, ld64(r - 1), x)
		st64(a + 0x10, y)
		st64(a + 8, z)
		st64(a, 1)
	}
}

// name [heur]: compares the instruction data's first 8 bytes with 66 handlers' discriminators and calls the matching handler (was fn_1066b0)
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: ix_data, program_id, accounts, accounts_len, ix_data_len
export function anchor_dispatch(a: u64, program_id: u64, accounts: u64, accounts_len: u64, p5: u64, p6: u64) {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470
	let k, l, m, n, o, p, q: u64
	B72: {
		const f = memcmp(program_id, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
		let i = undef
		let j = undef
		if ((f as u32) != 0) {
			q = anchor_error_from(s20, 0x1004 /* anchor::DeclaredProgramIdMismatch */, i, j)
			l = ld64(s20 + 8)
			k = ld64(s20)
		} else {
			const ix_data_len = p6
			if (ix_data_len >= 8) {
				const ix_data = p5
				if (ld64(ix_data) == 0x46c4bec201157fd0 /* ix:initialize_config */) {
					q = ix_initialize_config(s460, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s460 + 8)
					k = ld64(s460)
					break B72
				}
				if (ld64(ix_data) == 0x28e8ae54ac0ab45f /* ix:initialize_pool */) {
					q = ix_initialize_pool(s450, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s450 + 8)
					k = ld64(s450)
					break B72
				}
				if (ld64(ix_data) == 0xb8955b8dd6c1bc0b /* ix:initialize_tick_array */) {
					q = ix_initialize_tick_array(s440, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s440 + 8)
					k = ld64(s440)
					break B72
				}
				if (ld64(ix_data) == 0x328ee778c8a52129 /* ix:initialize_dynamic_tick_array */) {
					q = ix_initialize_dynamic_tick_array(s430, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s430 + 8)
					k = ld64(s430)
					break B72
				}
				if (ld64(ix_data) == 0x1e2a0270a09c4ab7 /* ix:initialize_fee_tier */) {
					q = ix_initialize_fee_tier(s420, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s420 + 8)
					k = ld64(s420)
					break B72
				}
				if (ld64(ix_data) == 0x44e681f2c4c0875f /* ix:initialize_reward */) {
					q = ix_initialize_reward(s410, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s410 + 8)
					k = ld64(s410)
					break B72
				}
				if (ld64(ix_data) == 0xf41bb06da856c50d /* ix:set_reward_emissions */) {
					q = ix_set_reward_emissions(s400, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s400 + 8)
					k = ld64(s400)
					break B72
				}
				if (ld64(ix_data) == 0x31f0980f4d2f8087 /* ix:open_position */) {
					q = ix_open_position(s3f0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s3f0 + 8)
					k = ld64(s3f0)
					break B72
				}
				if (ld64(ix_data) == 0x3c0e6e3a30861df2 /* ix:open_position_with_metadata */) {
					q = ix_open_position_with_metadata(s3e0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s3e0 + 8)
					k = ld64(s3e0)
					break B72
				}
				if (ld64(ix_data) == 0xb2fbcd0d76f39c2e /* ix:increase_liquidity */) {
					q = ix_increase_liquidity(s3d0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s3d0 + 8)
					k = ld64(s3d0)
					break B72
				}
				if (ld64(ix_data) == 0x12c5b686fd026a0 /* ix:decrease_liquidity */) {
					q = ix_decrease_liquidity(s3c0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s3c0 + 8)
					k = ld64(s3c0)
					break B72
				}
				if (ld64(ix_data) == 0xdf4bd1ec0dfae69a /* ix:update_fees_and_rewards */) {
					q = ix_update_fees_and_rewards(s3b0, program_id, accounts, accounts_len)
					l = ld64(s3b0 + 8)
					k = ld64(s3b0)
					break B72
				}
				if (ld64(ix_data) == 0xb613ba1e63cf98a4 /* ix:collect_fees */) {
					q = ix_collect_fees(s3a0, program_id, accounts, accounts_len)
					l = ld64(s3a0 + 8)
					k = ld64(s3a0)
					break B72
				}
				if (ld64(ix_data) == 0x22b1eb5657840546 /* ix:collect_reward */) {
					q = ix_collect_reward(s390, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s390 + 8)
					k = ld64(s390)
					break B72
				}
				if (ld64(ix_data) == 0xdc46b29662174316 /* ix:collect_protocol_fees */) {
					q = ix_collect_protocol_fees(s380, program_id, accounts, accounts_len)
					l = ld64(s380 + 8)
					k = ld64(s380)
					break B72
				}
				if (ld64(ix_data) == 0xc88775e1919ec6f8 /* ix:swap */) {
					q = ix_swap(s370, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s370 + 8)
					k = ld64(s370)
					break B72
				}
				if (ld64(ix_data) == 0x626244310051867b /* ix:close_position */) {
					q = ix_close_position(s360, program_id, accounts, accounts_len)
					l = ld64(s360 + 8)
					k = ld64(s360)
					break B72
				}
				if (ld64(ix_data) == 0xe4d0e5b69dd6d776 /* ix:set_default_fee_rate */) {
					q = ix_set_default_fee_rate(s350, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s350 + 8)
					k = ld64(s350)
					break B72
				}
				if (ld64(ix_data) == 0x562397e2f9cd6b /* ix:set_default_protocol_fee_rate */) {
					q = ix_set_default_protocol_fee_rate(s340, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s340 + 8)
					k = ld64(s340)
					break B72
				}
				if (ld64(ix_data) == 0x69e8c084189f335 /* ix:set_fee_rate */) {
					q = ix_set_fee_rate(s330, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s330 + 8)
					k = ld64(s330)
					break B72
				}
				if (ld64(ix_data) == 0x839c4f9a3204075f /* ix:set_protocol_fee_rate */) {
					q = ix_set_protocol_fee_rate(s320, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s320 + 8)
					k = ld64(s320)
					break B72
				}
				if (ld64(ix_data) == 0x846165ed5732011f /* ix:set_fee_authority */) {
					q = ix_set_fee_authority(s310, program_id, accounts, accounts_len)
					l = ld64(s310 + 8)
					k = ld64(s310)
					break B72
				}
				if (ld64(ix_data) == 0x43e9e18bf45d9622 /* ix:set_collect_protocol_fees_authority */) {
					q = ix_set_collect_protocol_fees_authority(s300, program_id, accounts, accounts_len)
					l = ld64(s300 + 8)
					k = ld64(s300)
					break B72
				}
				if (ld64(ix_data) == 0x7f551c53fcb72722 /* ix:set_reward_authority */) {
					q = ix_set_reward_authority(s2f0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s2f0 + 8)
					k = ld64(s2f0)
					break B72
				}
				if (ld64(ix_data) == 0x19385d94c6c99af0 /* ix:set_reward_authority_by_super_authority */) {
					q = ix_set_reward_authority_by_super_authority(s2e0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s2e0 + 8)
					k = ld64(s2e0)
					break B72
				}
				if (ld64(ix_data) == 0xb752387ad1c805cf /* ix:set_reward_emissions_super_authority */) {
					q = ix_set_reward_emissions_super_authority(s2d0, program_id, accounts, accounts_len)
					l = ld64(s2d0 + 8)
					k = ld64(s2d0)
					break B72
				}
				if (ld64(ix_data) == 0xe6dba2446ced60c3 /* ix:two_hop_swap */) {
					q = ix_two_hop_swap(s2c0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s2c0 + 8)
					k = ld64(s2c0)
					break B72
				}
				if (ld64(ix_data) == 0x41c2121895f12d75 /* ix:initialize_position_bundle */) {
					q = ix_initialize_position_bundle(s2b0, program_id, accounts, accounts_len)
					l = ld64(s2b0 + 8)
					k = ld64(s2b0)
					break B72
				}
				if (ld64(ix_data) == 0xf57383f9b3107c5d /* ix:initialize_position_bundle_with_metadata */) {
					q = ix_initialize_position_bundle_with_metadata(s2a0, program_id, accounts, accounts_len)
					l = ld64(s2a0 + 8)
					k = ld64(s2a0)
					break B72
				}
				if (ld64(ix_data) == 0xad7cefd902631964 /* ix:delete_position_bundle */) {
					q = ix_delete_position_bundle(s290, program_id, accounts, accounts_len)
					l = ld64(s290 + 8)
					k = ld64(s290)
					break B72
				}
				if (ld64(ix_data) == 0x31d4acd5ab7e71a9 /* ix:open_bundled_position */) {
					q = ix_open_bundled_position(s280, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s280 + 8)
					k = ld64(s280)
					break B72
				}
				if (ld64(ix_data) == 0x4367551bf5d82429 /* ix:close_bundled_position */) {
					q = ix_close_bundled_position(s270, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s270 + 8)
					k = ld64(s270)
					break B72
				}
				if (ld64(ix_data) == 0xfa8366725c5f2fd4 /* ix:open_position_with_token_extensions */) {
					q = ix_open_position_with_token_extensions(s260, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s260 + 8)
					k = ld64(s260)
					break B72
				}
				if (ld64(ix_data) == 0xdf63199b3b87b601 /* ix:close_position_with_token_extensions */) {
					q = ix_close_position_with_token_extensions(s250, program_id, accounts, accounts_len)
					l = ld64(s250 + 8)
					k = ld64(s250)
					break B72
				}
				if (ld64(ix_data) == 0xb9ab0af7fc023ee3 /* ix:lock_position */) {
					q = ix_lock_position(s240, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s240 + 8)
					k = ld64(s240)
					break B72
				}
				if (ld64(ix_data) == 0xafa064c28db47ba4 /* ix:reset_position_range */) {
					q = ix_reset_position_range(s230, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s230 + 8)
					k = ld64(s230)
					break B72
				}
				if (ld64(ix_data) == 0x8ac28a432ee579b3 /* ix:transfer_locked_position */) {
					q = ix_transfer_locked_position(s220, program_id, accounts, accounts_len)
					l = ld64(s220 + 8)
					k = ld64(s220)
					break B72
				}
				if (ld64(ix_data) == 0x30757b8dc8d0634d /* ix:initialize_adaptive_fee_tier */) {
					q = ix_initialize_adaptive_fee_tier(s210, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s210 + 8)
					k = ld64(s210)
					break B72
				}
				if (ld64(ix_data) == 0x7b786a4fb5442e5 /* ix:set_default_base_fee_rate */) {
					q = ix_set_default_base_fee_rate(s200, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s200 + 8)
					k = ld64(s200)
					break B72
				}
				if (ld64(ix_data) == 0x7a03398a93e7eac1 /* ix:set_delegated_fee_authority */) {
					q = ix_set_delegated_fee_authority(s1f0, program_id, accounts, accounts_len)
					l = ld64(s1f0 + 8)
					k = ld64(s1f0)
					break B72
				}
				if (ld64(ix_data) == 0xec6a1a95eb7f2b7d /* ix:set_initialize_pool_authority */) {
					q = ix_set_initialize_pool_authority(s1e0, program_id, accounts, accounts_len)
					l = ld64(s1e0 + 8)
					k = ld64(s1e0)
					break B72
				}
				if (ld64(ix_data) == 0xc68658539442b984 /* ix:set_preset_adaptive_fee_constants */) {
					q = ix_set_preset_adaptive_fee_constants(s1d0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s1d0 + 8)
					k = ld64(s1d0)
					break B72
				}
				if (ld64(ix_data) == 0xc7777cac4c605e8f /* ix:initialize_pool_with_adaptive_fee */) {
					q = ix_initialize_pool_with_adaptive_fee(s1c0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s1c0 + 8)
					k = ld64(s1c0)
					break B72
				}
				if (ld64(ix_data) == 0x68a2e68372367979 /* ix:set_fee_rate_by_delegated_fee_authority */) {
					q = ix_set_fee_rate_by_delegated_fee_authority(s1b0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s1b0 + 8)
					k = ld64(s1b0)
					break B72
				}
				if (ld64(ix_data) == 0x27490cedbdd49e85 /* ix:set_adaptive_fee_constants */) {
					q = ix_set_adaptive_fee_constants(s1a0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s1a0 + 8)
					k = ld64(s1a0)
					break B72
				}
				if (ld64(ix_data) == 0x39d2f74312e4ad47 /* ix:set_config_feature_flag */) {
					q = ix_set_config_feature_flag(s190, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s190 + 8)
					k = ld64(s190)
					break B72
				}
				if (ld64(ix_data) == 0xe7ac62984ff8a1d6 /* ix:migrate_repurpose_reward_authority_space */) {
					q = ix_migrate_repurpose_reward_authority_space(s180, program_id, accounts, accounts_len)
					l = ld64(s180 + 8)
					k = ld64(s180)
					break B72
				}
				if (ld64(ix_data) == 0xfe2b4e5bf5f75cf /* ix:collect_fees_v2 */) {
					q = ix_collect_fees_v2(s170, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s170 + 8)
					k = ld64(s170)
					break B72
				}
				if (ld64(ix_data) == 0xc816c87286de8067 /* ix:collect_protocol_fees_v2 */) {
					q = ix_collect_protocol_fees_v2(s160, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s160 + 8)
					k = ld64(s160)
					break B72
				}
				if (ld64(ix_data) == 0xd13113a0b4256bb1 /* ix:collect_reward_v2 */) {
					q = ix_collect_reward_v2(s150, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s150 + 8)
					k = ld64(s150)
					break B72
				}
				if (ld64(ix_data) == 0x60c4524f3ebc7f3a /* ix:decrease_liquidity_v2 */) {
					q = ix_decrease_liquidity_v2(s140, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s140 + 8)
					k = ld64(s140)
					break B72
				}
				if (ld64(ix_data) == 0xab0ee45df591d85 /* ix:increase_liquidity_v2 */) {
					q = ix_increase_liquidity_v2(s130, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s130 + 8)
					k = ld64(s130)
					break B72
				}
				if (ld64(ix_data) == 0x2b35c6d27c09fbef /* ix:increase_liquidity_by_token_amounts_v2 */) {
					q = ix_increase_liquidity_by_token_amounts_v2(s120, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s120 + 8)
					k = ld64(s120)
					break B72
				}
				if (ld64(ix_data) == 0x43cc3f1bf2572dcf /* ix:initialize_pool_v2 */) {
					q = ix_initialize_pool_v2(s110, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s110 + 8)
					k = ld64(s110)
					break B72
				}
				if (ld64(ix_data) == 0x3185e5eb324d015b /* ix:initialize_reward_v2 */) {
					q = ix_initialize_reward_v2(s100, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s100 + 8)
					k = ld64(s100)
					break B72
				}
				if (ld64(ix_data) == 0x66a030c12048e472 /* ix:set_reward_emissions_v2 */) {
					q = ix_set_reward_emissions_v2(sf0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(sf0 + 8)
					k = ld64(sf0)
					break B72
				}
				if (ld64(ix_data) == 0x621ec91a0bed042b /* ix:swap_v2 */) {
					q = ix_swap_v2(se0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(se0 + 8)
					k = ld64(se0)
					break B72
				}
				if (ld64(ix_data) == 0x75c202fe1dd18fba /* ix:two_hop_swap_v2 */) {
					q = ix_two_hop_swap_v2(sd0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(sd0 + 8)
					k = ld64(sd0)
					break B72
				}
				if (ld64(ix_data) == 0xfd9e13830be0a9bf /* ix:reposition_liquidity_v2 */) {
					q = ix_reposition_liquidity_v2(sc0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(sc0 + 8)
					k = ld64(sc0)
					break B72
				}
				if (ld64(ix_data) == 0x34d1397209350937 /* ix:initialize_config_extension */) {
					q = ix_initialize_config_extension(sb0, program_id, accounts, accounts_len)
					l = ld64(sb0 + 8)
					k = ld64(sb0)
					break B72
				}
				if (ld64(ix_data) == 0x8f3cbc1874f15e2c /* ix:set_config_extension_authority */) {
					q = ix_set_config_extension_authority(sa0, program_id, accounts, accounts_len)
					l = ld64(sa0 + 8)
					k = ld64(sa0)
					break B72
				}
				if (ld64(ix_data) == 0xb20d4fcd2004cacf /* ix:set_token_badge_authority */) {
					q = ix_set_token_badge_authority(s90, program_id, accounts, accounts_len)
					l = ld64(s90 + 8)
					k = ld64(s90)
					break B72
				}
				if (ld64(ix_data) == 0xdf59e01b5fcd4dfd /* ix:initialize_token_badge */) {
					q = ix_initialize_token_badge(s80, program_id, accounts, accounts_len)
					l = ld64(s80 + 8)
					k = ld64(s80)
					break B72
				}
				if (ld64(ix_data) == 0xb911751208449235 /* ix:delete_token_badge */) {
					q = ix_delete_token_badge(s70, program_id, accounts, accounts_len)
					l = ld64(s70 + 8)
					k = ld64(s70)
					break B72
				}
				if (ld64(ix_data) == 0x89f6938a214158e0 /* ix:set_token_badge_attribute */) {
					q = ix_set_token_badge_attribute(s60, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s60 + 8)
					k = ld64(s60)
					break B72
				}
				if (ld64(ix_data) == 0x1f81c13c7979fddf /* ix:idl_include */) {
					q = ix_idl_include(s50, program_id, accounts, accounts_len)
					l = ld64(s50 + 8)
					k = ld64(s50)
					break B72
				}
				i = ld64(ix_data)
				j = 0xa69e9a778bcf440
				if (i == 0xa69e9a778bcf440) {
					q = fn_108e38(s40, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8, accounts_len)
					l = ld64(s40 + 8)
					k = ld64(s40)
					break B72
				}
				if (ld64(ix_data) == 0x1d9acb512ea545e4) {
					q = anchor_error_from(s30, 0x5dc /* anchor::EventInstructionStub */, i, 0xa69e9a778bcf440)
					l = ld64(s30 + 8)
					k = ld64(s30)
					break B72
				}
			}
			q = anchor_error_from(s470, 0x65 /* anchor::InstructionFallbackNotFound */, i, j)
			l = ld64(s470 + 8)
			k = ld64(s470)
		}
	}
	if (k != 2) {
		st64(s10, k, l)
		error_from_13c648(a, k, l, Error_log(s10, m, n, o, p, q))
	} else {
		st64(a, 0x800000000000001a /* Ok */)
	}
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: idl, buffer
export function fn_108e38(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, r8: u64): u64 {
	const s4 = fp - 0x4, s5 = fp - 0x5, s20 = fp - 0x20, s40 = fp - 0x40, sf0 = fp - 0xf0, sf8 = fp - 0xf8, s100 = fp - 0x100, s108 = fp - 0x108, s1a0 = fp - 0x1a0, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s328 = fp - 0x328, s330 = fp - 0x330, s338 = fp - 0x338, sff8 = fp - 0xff8
	let g, h, n, o, r, s, t, ao, ap, ax, ay, ba, bb, bc, bw: u64
	B19: {
		B18: {
			let m = b
			st64(s1e8, c, d)
			const f = p6
			st64(s328 + 0x18, a)
			if (f != 0) {
				B52: {
					B25: {
						B24: {
							g = p5
							n = 0
							h = ld8(g)
							st8(s5, h)
							if ((h as i64) > 2) {
								if ((h as i64) > 4) {
									if (h == 5) {
										break B25
									}
									if (h == 6) {
										if (9 > f) {
											break B18
										}
										break B24
									}
								} else {
									if (h == 3) {
										break B25
									}
									if (h == 4) {
										if (0x21 > f) {
											break B18
										}
										n = ld64(g + 7)
										st8(s100, ld8(g + 0xf))
										st16(s4, ld16(g + 1))
										st8(s4 + 2, ld8(g + 3))
										c = ld16(g + 4) | (ld8(g + 6) << 0x10)
										st64(s108, n)
										st64(s328 + 8, ld64(s108 + 1))
										b = ld8(g + 0x20)
										r8 = ld64(g + 0x18)
										st64(s328, ld64(g + 0x10))
										break B25
									}
								}
							} else {
								if (h == 0) {
									if (9 > f) {
										break B18
									}
									break B24
								}
								if (h == 1) {
									break B25
								}
								if (h == 2) {
									if (5 > f) {
										break B18
									}
									st64(s328, 1)
									const i = ld32(g + 1)
									r8 = 0
									st64(s328 + 8, 0)
									if (i == 0) {
										break B25
									}
									st64(s330, i)
									st64(s328 + 0x10, h)
									const j = ld64(0x300000000 /* heap bump-allocator cursor */)
									const k = j != 0 ? j : 0x300008000
									const l = k - min(i, 0x100000)
									r8 = l > k ? 0 : l
									st64(s338, m)
									if (r8 > 0x300000007) {
										let aa = f - 5
										let ac = g + 5
										st64(0x300000000 /* heap bump-allocator cursor */, r8)
										let w = 0
										st64(s328, min(i, 0x100000))
										memset(r8, 0, min(i, 0x100000))
										s = ld64(s328)
										st64(s108, s, r8, s)
										t = ld64(s330)
										o = r8
										while (true) {
											const v = w
											if (w == s) {
												let x = min(s << 1, t)
												if (x > s) {
													const y = x - s
													if (y > ld64(s108) - s) {
														fn_ead8(s108, s, y, s, t, o)
														t = ld64(s330)
														o = ld64(s100)
														s = ld64(sf8)
													}
													let z = o + s
													if (y >= 2) {
														st64(s328, s, o)
														memset(z, 0, y - 1)
														t = ld64(s330)
														s = ld64(s328) + (y - 1)
														z = ld64(s328 + 8) + s
													}
													st8(z, 0)
													x = s + 1
												}
												st64(sf8, x)
												s = x
											}
											if (v > s) {
												fn_14c4f0(v, s, 0x100159608, s, t)
											}
											const u = min(s - v, aa)
											o = ld64(s100)
											const ab = o
											if (u != 1) {
												st64(s328, aa, o)
												memcpy(ab + v, ac, u)
												o = ld64(s328 + 8)
												t = ld64(s330)
												ac = ac + u
												aa = ld64(s328) - u
												if (u == 0) {
													o = fn_b6a0(0x14, "Unexpected length of input", 0x1a, s, t)
													r = undef
													s = undef
													t = undef
													break B19
												}
											} else {
												st8(ab + v, ld8(ac))
												ac = ac + 1
												aa = aa - 1
											}
											w = u + v
											if (w >= t) {
												r = ld64(s108)
												if (r == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
													break B19
												}
												b = o
												if (r == 0x8000000000000000) {
													const ad = ld64(0x300000000 /* heap bump-allocator cursor */)
													const af = ad != 0 ? ad : 0x300008000
													const ae = max(min(t, 0x1000), 1)
													let ag = af - ae
													const ah = ag > af
													let ai = ah != 0 ? 0 : ag
													if (0x300000008 > ai) {
														raw_vec_handle_error(1, ae, 0x300000008, ah, t)
													}
													st64(0x300000000 /* heap bump-allocator cursor */, ai)
													st64(s108, ae)
													s = 0
													st64(s100, ai, 0)
													while (true) {
														if (aa == s) {
															break B18
														}
														const ak = ld8(ac + s)
														const al = ld64(s108)
														if (s == al) {
															ag = RawVec_grow_one_f330(s108, al, ag)
															t = ld64(s330)
															ai = ld64(s100)
														}
														const aj = ai + s
														s = s + 1
														st8(aj, ak)
														st64(sf8, s)
														if (s >= t) {
															b = ld64(s100)
															r = ld64(s108)
															o = b
															if (r == 0x8000000000000000) {
																break B19
															}
															break
														}
													}
												}
												st64(s328, b)
												r8 = s
												st8(s1e8 + 0x12, ld8(s4 + 2))
												st16(s1e8 + 0x10, ld16(s4))
												t = 0
												st64(s328 + 8, r)
												o = r
												m = ld64(s338)
												if (ld64(s328 + 0x10) == 7) {
													break B19
												}
												break B52
											}
										}
									}
									raw_vec_handle_error(1, min(i, 0x100000), min(i, 0x100000), l > k, 0)
								}
							}
							st64(s108, 0x100159668)
							st64(sf8, s20)
							st64(s20, s5, num_fmt_bae8)
							st64(sf0 + 8, 0)
							st64(s100, 1)
							st64(sf0, 1)
							// fmt "Unexpected variant index: {}" {} = *s5 [num_fmt_bae8]
							fn_147e78(s1d0, s108, c, g + 1, 0)
							o = fn_b580(s1d0)
							r = undef
							s = undef
							t = undef
							break B19
						}
						st64(s328 + 8, ld64(g + 1))
					}
					st64(s328 + 0x10, h)
					st8(s1e8 + 0x12, ld8(s4 + 2))
					s = ld16(s4)
					st16(s1e8 + 0x10, s)
					t = (n << 0x18) | c & 0xffffff
				}
				st8(s1e8 + 0x16, ld8(s1e8 + 0x12))
				st16(s1e8 + 0x14, ld16(s1e8 + 0x10))
				const am = ld64(s328 + 0x10)
				if ((am as i64) > 2) {
					if ((am as i64) > 4) {
						if (am == 5) {
							st64(s20 + 0x10, 0)
							st64(s20, 0)
							ax = fn_11b560(s108, b, s1e8, s, fp)
							ao = ld64(s100)
							ap = ld64(s108)
							const bt = ld8(sf0 + 0x4a)
							if (bt == 2) {
								bw = ld64(s328 + 0x18)
								st64(bw + 8, ao)
								st64(bw, ap)
								return ax
							}
							memcpy(s1c0, sf8, 0x52)
							st32(s1a0 + 0x33, ld32(sf0 + 0x4b))
							st8(s1a0 + 0x37, ld8(sf0 + 0x4f))
							st8(s1a0 + 0x32, bt)
							st64(s1d0, ap, ao)
							ix_idl_close_account()
							ax = fn_11bf68(s228, s1d0)
							const bv = ld64(s1a0 + 0x18)
							const bu = ld64(s1a0 + 0x10)
							ao = ld64(s228 + 8)
							ap = ld64(s228)
							rc_dec(bu)
							rc_dec(bv)
							if (ap == 2) {
								ax = fn_c7d0(s20, ax)
								bw = ld64(s328 + 0x18)
								st64(bw + 8, ao)
								st64(bw, 2)
								return ax
							}
							bw = ld64(s328 + 0x18)
							st64(bw + 8, ao)
							st64(bw, ap)
							return ax
						}
						const bj = m
						st64(s20 + 0x10, 0)
						st64(s20, 0)
						ax = fn_11d508(s108, b, s1e8, s, fp)
						ao = ld64(sf8)
						ap = ld64(s100)
						const bi = ld64(s108)
						if (bi == 0) {
							bw = ld64(s328 + 0x18)
							st64(bw + 8, ao)
							st64(bw, ap)
							return ax
						}
						copyr(s1b8, sf0, 0x28)
						st64(s1d0, bi, ap, ao)
						ax = ix_idl_resize_account(s1f8, s1d0, ld64(s328 + 8))
						ap = ld64(s1f8)
						if (ap == 2) {
							ax = fn_78d0(s208, s1d0, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, bj)
							const bk = ld64(s208)
							if (bk == 2) {
								ax = fn_c7d0(s20, ax)
								bw = ld64(s328 + 0x18)
								st64(bw + 8, ao)
								st64(bw, 2)
								return ax
							}
							ax = Error_with_account_name(s218, bk, ld64(s208 + 8), 0x100155d61 /* "idl" */, 3)
							ap = ld64(s218)
							if (ap == 2) {
								ax = fn_c7d0(s20, ax)
								bw = ld64(s328 + 0x18)
								st64(bw + 8, ao)
								st64(bw, 2)
								return ax
							}
							ao = ld64(s218 + 8)
							let bl = ld64(s20)
							if (bl == 0) {
								bw = ld64(s328 + 0x18)
								st64(bw + 8, ao)
								st64(bw, ap)
								return ax
							}
							let bx = ld64(s20 + 8)
							ay = ld64(s20 + 0x10)
							if (ay == 0) {
								if (bx != 0) {
									do {
										bl = ld64(bl + 0x170)
										bx = bx - 1
									} while (bx != 0)
								}
							} else {
								ax = bl
								bl = 0
								do {
									ba = bx
									bc = ax
									if (bl == 0) {
										ba = 0
										bc = 0
										bl = ax
										if (bx != 0) {
											bl = ax
											do {
												bl = ld64(bl + 0x170)
												bx = bx - 1
												bc = 0
											} while (bx != 0)
										}
									}
									if (ba >= ld16(bl + 0x16a)) {
										while (true) {
											bb = ld64(bl + 0x160)
											if (bb == 0) {
												fn_1490e8(0x100159630, ay, bb, bc, ba)
											}
											bc = bc + 1
											ba = ld16(bl + 0x168)
											bl = bb
											if (ld16(bb + 0x16a) > ba) {
												bl = bb
												break
											}
										}
									}
									const by = ba + 1
									bx = by
									if (bc != 0) {
										bx = 0
										bl = ld64(bl + (by << 3) + 0x170)
										let bz = bc - 1
										if (bz != 0) {
											do {
												bl = ld64(bl + 0x170)
												bz = bz - 1
											} while (bz != 0)
										}
									}
									ay = ay - 1
									ax = 0
								} while (ay != 0)
							}
							while (true) {
								bl = ld64(bl + 0x160)
								if (bl == 0) {
									bw = ld64(s328 + 0x18)
									st64(bw + 8, ao)
									st64(bw, ap)
									return ax
								}
							}
						}
						bw = ld64(s328 + 0x18)
						st64(bw + 8, ld64(s1f8 + 8))
						st64(bw, ap)
						return ax
					}
					if (am == 3) {
						const bq = m
						st64(s20 + 0x10, 0)
						st64(s20, 0)
						ax = fn_11c228(s108, b, s1e8, s, fp)
						ao = ld64(sf8)
						ap = ld64(s100)
						const bp = ld64(s108)
						if (bp == 0) {
							bw = ld64(s328 + 0x18)
							st64(bw + 8, ao)
							st64(bw, ap)
							return ax
						}
						memcpy(s1b8, sf0, 0x50)
						st64(s1d0, bp, ap, ao)
						ax = ix_idl_set_buffer(s258, s1d0)
						ap = ld64(s258)
						if (ap == 2) {
							fn_78d0(s268, s1d0, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, bq)
							const br = ld64(s268)
							if (br != 2) {
								ax = Error_with_account_name(s278, br, ld64(s268 + 8), 0x100155d5b /* "buffer" */, 6)
								ao = ld64(s278 + 8)
								ap = ld64(s278)
							} else {
								ax = fn_78d0(s288, s1a0, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, bq)
								const bs = ld64(s288)
								if (bs == 2) {
									ax = fn_c7d0(s20, ax)
									bw = ld64(s328 + 0x18)
									st64(bw + 8, ao)
									st64(bw, 2)
									return ax
								}
								ax = Error_with_account_name(s298, bs, ld64(s288 + 8), 0x100155d61 /* "idl" */, 3)
								ao = ld64(s298 + 8)
								ap = ld64(s298)
							}
							if (ap == 2) {
								ax = fn_c7d0(s20, ax)
								bw = ld64(s328 + 0x18)
								st64(bw + 8, ao)
								st64(bw, 2)
								return ax
							}
							let ca = ld64(s20)
							if (ca == 0) {
								bw = ld64(s328 + 0x18)
								st64(bw + 8, ao)
								st64(bw, ap)
								return ax
							}
							let cb = ld64(s20 + 8)
							ay = ld64(s20 + 0x10)
							if (ay == 0) {
								if (cb != 0) {
									do {
										ca = ld64(ca + 0x170)
										cb = cb - 1
									} while (cb != 0)
								}
							} else {
								ax = ca
								ca = 0
								do {
									ba = cb
									bc = ax
									if (ca == 0) {
										ba = 0
										bc = 0
										ca = ax
										if (cb != 0) {
											ca = ax
											do {
												ca = ld64(ca + 0x170)
												cb = cb - 1
												bc = 0
											} while (cb != 0)
										}
									}
									if (ba >= ld16(ca + 0x16a)) {
										while (true) {
											bb = ld64(ca + 0x160)
											if (bb == 0) {
												fn_1490e8(0x100159630, ay, bb, bc, ba)
											}
											bc = bc + 1
											ba = ld16(ca + 0x168)
											ca = bb
											if (ld16(bb + 0x16a) > ba) {
												ca = bb
												break
											}
										}
									}
									const cc = ba + 1
									cb = cc
									if (bc != 0) {
										cb = 0
										ca = ld64(ca + (cc << 3) + 0x170)
										let cd = bc - 1
										if (cd != 0) {
											do {
												ca = ld64(ca + 0x170)
												cd = cd - 1
											} while (cd != 0)
										}
									}
									ay = ay - 1
									ax = 0
								} while (ay != 0)
							}
							while (true) {
								ca = ld64(ca + 0x160)
								if (ca == 0) {
									bw = ld64(s328 + 0x18)
									st64(bw + 8, ao)
									st64(bw, ap)
									return ax
								}
							}
						}
						bw = ld64(s328 + 0x18)
						st64(bw + 8, ld64(s258 + 8))
						st64(bw, ap)
						return ax
					}
					const bg = m
					st8(s40 + 2, ld8(s1e8 + 0x16))
					st16(s40, ld16(s1e8 + 0x14))
					st8(s40 + 0x1f, b)
					st64(s40 + 0x17, r8)
					st64(s40 + 0xf, ld64(s328))
					st64(s40 + 7, ld64(s328 + 8))
					st32(s40 + 3, t)
					ax = fn_11db60(s108, b, s1e8, s, fp)
					ao = ld64(sf8)
					ap = ld64(s100)
					const bf = ld64(s108)
					if (bf == 0) {
						bw = ld64(s328 + 0x18)
						st64(bw + 8, ao)
						st64(bw, ap)
						return ax
					}
					copyr(s1b8, sf0, 0x20)
					st64(s1d0, bf, ap, ao)
					log_10c800(s1d0, s40)
					ax = fn_78d0(s238, s1d0, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, bg)
					const bh = ld64(s238)
					if (bh != 2) {
						ax = Error_with_account_name(s248, bh, ld64(s238 + 8), 0x100155d61 /* "idl" */, 3)
						ap = ld64(s248)
						if (ap == 2) {
							bw = ld64(s328 + 0x18)
							st64(bw + 8, ao)
							st64(bw, 2)
							return ax
						}
						bw = ld64(s328 + 0x18)
						st64(bw + 8, ld64(s248 + 8))
						st64(bw, ap)
						return ax
					}
					bw = ld64(s328 + 0x18)
					st64(bw + 8, ao)
					st64(bw, 2)
					return ax
				}
				if (am == 0) {
					st64(s20 + 0x10, 0)
					st64(s20, 0)
					st64(sff8, s4)
					ax = fn_11e088(s108, m, s1e8, s, fp)
					ao = ld64(s100)
					const av = m
					ap = ld64(s108)
					const au = ld8(sf0 + 0xaa)
					if (au == 2) {
						bw = ld64(s328 + 0x18)
						st64(bw + 8, ao)
						st64(bw, ap)
						return ax
					}
					memcpy(s1c0, sf8, 0xb2)
					st32(s1a0 + 0x93, ld32(sf0 + 0xab))
					st8(s1a0 + 0x97, ld8(sf0 + 0xaf))
					st8(s1a0 + 0x92, au)
					st64(s1d0, ap, ao)
					const aw = ix_idl_create_account(s2f8, av, s1d0, ld64(s328 + 8))
					ap = ld64(s2f8)
					if (ap == 2) {
						ax = fn_c7d0(s20, fn_bd18(s1d0, aw))
						bw = ld64(s328 + 0x18)
						st64(bw + 8, ao)
						st64(bw, 2)
						return ax
					}
					ao = ld64(s2f8 + 8)
					ax = fn_bd18(s1d0, aw)
					bw = ld64(s328 + 0x18)
					st64(bw + 8, ao)
					st64(bw, ap)
					return ax
				}
				if (am == 1) {
					const bn = m
					ax = fn_11c9a8(s108, b, s1e8, s, fp)
					ao = ld64(sf8)
					ap = ld64(s100)
					const bm = ld64(s108)
					if (bm == 0) {
						bw = ld64(s328 + 0x18)
						st64(bw + 8, ao)
						st64(bw, ap)
						return ax
					}
					copyr(s1b8, sf0, 0x20)
					st64(s1d0, bm, ap, ao)
					log_10c220(s1d0)
					ax = fn_78d0(s2d8, s1d0, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, bn)
					const bo = ld64(s2d8)
					if (bo != 2) {
						ax = Error_with_account_name(s2e8, bo, ld64(s2d8 + 8), 0x100155d5b /* "buffer" */, 6)
						ap = ld64(s2e8)
						if (ap == 2) {
							bw = ld64(s328 + 0x18)
							st64(bw + 8, ao)
							st64(bw, 2)
							return ax
						}
						bw = ld64(s328 + 0x18)
						st64(bw + 8, ld64(s2e8 + 8))
						st64(bw, ap)
						return ax
					}
					bw = ld64(s328 + 0x18)
					st64(bw + 8, ao)
					st64(bw, 2)
					return ax
				}
				const aq = m
				st64(s20 + 0x10, 0)
				st64(s20, 0)
				ax = fn_11db60(s108, b, s1e8, s, fp)
				ao = ld64(sf8)
				ap = ld64(s100)
				const an = ld64(s108)
				if (an != 0) {
					copyr(s1b8, sf0, 0x20)
					st64(s1d0, an, ap, ao)
					st64(sf8, r8)
					st64(s100, ld64(s328))
					st64(s108, ld64(s328 + 8))
					ax = ix_idl_write(s2a8, s1d0, s108)
					ap = ld64(s2a8)
					if (ap == 2) {
						ax = fn_78d0(s2b8, s1d0, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, aq)
						const ar = ld64(s2b8)
						if (ar == 2) {
							ax = fn_c7d0(s20, ax)
							bw = ld64(s328 + 0x18)
							st64(bw + 8, ao)
							st64(bw, 2)
							return ax
						}
						ax = Error_with_account_name(s2c8, ar, ld64(s2b8 + 8), 0x100155d61 /* "idl" */, 3)
						ap = ld64(s2c8)
						if (ap == 2) {
							ax = fn_c7d0(s20, ax)
							bw = ld64(s328 + 0x18)
							st64(bw + 8, ao)
							st64(bw, 2)
							return ax
						}
						ao = ld64(s2c8 + 8)
						let at = ld64(s20)
						if (at != 0) {
							let az = ld64(s20 + 8)
							ay = ld64(s20 + 0x10)
							if (ay == 0) {
								if (az != 0) {
									do {
										at = ld64(at + 0x170)
										az = az - 1
									} while (az != 0)
								}
							} else {
								ax = at
								at = 0
								do {
									ba = az
									bc = ax
									if (at == 0) {
										ba = 0
										bc = 0
										at = ax
										if (az != 0) {
											at = ax
											do {
												at = ld64(at + 0x170)
												az = az - 1
												bc = 0
											} while (az != 0)
										}
									}
									if (ba >= ld16(at + 0x16a)) {
										while (true) {
											bb = ld64(at + 0x160)
											if (bb == 0) {
												fn_1490e8(0x100159630, ay, bb, bc, ba)
											}
											bc = bc + 1
											ba = ld16(at + 0x168)
											at = bb
											if (ld16(bb + 0x16a) > ba) {
												at = bb
												break
											}
										}
									}
									const bd = ba + 1
									az = bd
									if (bc != 0) {
										az = 0
										at = ld64(at + (bd << 3) + 0x170)
										let be = bc - 1
										if (be != 0) {
											do {
												at = ld64(at + 0x170)
												be = be - 1
											} while (be != 0)
										}
									}
									ay = ay - 1
									ax = 0
								} while (ay != 0)
							}
							while (true) {
								at = ld64(at + 0x160)
								if (at == 0) {
									bw = ld64(s328 + 0x18)
									st64(bw + 8, ao)
									st64(bw, ap)
									return ax
								}
							}
						}
						bw = ld64(s328 + 0x18)
						st64(bw + 8, ao)
						st64(bw, ap)
						return ax
					}
					bw = ld64(s328 + 0x18)
					st64(bw + 8, ld64(s2a8 + 8))
					st64(bw, ap)
					return ax
				}
				bw = ld64(s328 + 0x18)
				st64(bw + 8, ao)
				st64(bw, ap)
				return ax
			}
		}
		o = fn_1459d0(0x100159468)
		r = undef
		s = undef
		t = undef
	}
	const p = o
	if (2 > (o & 3) - 2) {
		ax = anchor_error_from(s308, 0x66 /* anchor::InstructionDidNotDeserialize */, r, s, t)
		ap = ld64(s308)
		bw = ld64(s328 + 0x18)
		st64(bw + 8, ld64(s308 + 8))
		st64(bw, ap)
		return ax
	}
	if ((p & 3) == 0) {
		ax = anchor_error_from(s308, 0x66 /* anchor::InstructionDidNotDeserialize */, r, s, t)
		ap = ld64(s308)
		bw = ld64(s328 + 0x18)
		st64(bw + 8, ld64(s308 + 8))
		st64(bw, ap)
		return ax
	}
	const q = ld64(ld64(o + 7))
	callx(q, ld64(o - 1), q, r, s, t)
	ax = anchor_error_from(s308, 0x66 /* anchor::InstructionDidNotDeserialize */)
	ap = ld64(s308)
	bw = ld64(s328 + 0x18)
	st64(bw + 8, ld64(s308 + 8))
	st64(bw, ap)
	return ax
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_11b3b8(a: u64, b: u64) {
	const s18 = fp - 0x18
	let m: u64
	const f = ld64(b + 8)
	if (0x10 > f) {
		m = fn_1459d0(0x100159468)
		st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, m)
	} else {
		const g = ld64(b)
		const i = ld64(g + 8)
		const j = ld64(g)
		st64(b, g + 0x10, f - 0x10)
		if (8 > f - 0x10) {
			m = fn_1459d0(0x100159468)
			st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, m)
		} else {
			const k = ld64(g + 0x10)
			st64(b, g + 0x18, f - 0x18)
			if (8 > f - 0x18) {
				m = fn_1459d0(0x100159468)
				st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, m)
			} else {
				const n = ld64(g + 0x18)
				st64(b + 8, f - 0x20)
				st64(b, g + 0x20)
				fn_11150(s18, b)
				m = ld64(s18 + 8)
				const h = ld64(s18)
				if (h == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
					st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, m)
				} else {
					const l = ld64(s18 + 0x10)
					st64(a + 0x20, i)
					st64(a + 0x18, j)
					st64(a + 0x30, n)
					st64(a + 0x28, k)
					st64(a + 0x10, l)
					st64(a + 8, m)
					st64(a, h)
				}
			}
		}
	}
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: authority (ConstraintRaw), buffer (ConstraintZero, ConstraintMut, ConstraintRentExempt)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: buffer
export function fn_11c9a8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s18 = fp - 0x18, s40 = fp - 0x40, s48 = fp - 0x48, s78 = fp - 0x78, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180
	let m, n, u: u64
	const f = ld64(c + 8)
	if (f != 0) {
		st64(c + 8, f - 1)
		const g: AccountInfo = ld64(c)
		st64(c, g + 0x30)
		try_accounts_11718(s48, c, c, d, e)
		const l = ld64(s40)
		const h = ld64(s48)
		if (h != 2) {
			n = Error_with_account_name(sb0, h, l, 0x100154b87 /* "authority" */, 9)
			m = ld64(sb0)
			st64(a + 0x10, ld64(sb0 + 8))
			st64(a + 8, m)
			st64(a, 0)
			return n
		}
		const o = rent_get(s48)
		const j = ld64(s40 + 8)
		const k = ld64(s40)
		if (ld64(s48) == 0) {
			let ao = j
			AccountInfo_try_borrow_data(s48, g, o)
			const s = ld64(s40 + 8)
			const q = ld64(s40)
			const p = ld64(s48)
			if (p == 0x800000000000001a /* Ok */) {
				const r = ld64(q + 8)
				if (r > 7) {
					let an = s
					const t = ld64(q)
					if (ld8(t) == 0 && (ld8(t + 1) == 0 && (ld8(t + 2) == 0 && (ld8(t + 3) == 0 && (ld8(t + 4) == 0 && (ld8(t + 5) == 0 && (ld8(t + 6) == 0 && ld8(t + 7) == 0))))))) {
						fn_3e60(s48, g)
						const buffer: AccountInfo = ld64(s48)
						if (buffer == 0) {
							n = Error_with_account_name(s170, ld64(s40), ld64(s40 + 8), 0x100155d5b /* "buffer" */, 6)
							u = ld64(s170)
							st64(a + 0x10, ld64(s170 + 8))
							st64(a + 8, u)
							st64(a, 0)
							st64(an, ld64(an) - 1)
							return n
						}
						copyr(sa0, s40, 0x28)
						st64(an, ld64(an) - 1)
						if (buffer.is_writable == 0) {
							anchor_error_from(s150, 0x7d0 /* anchor::ConstraintMut */)
							n = Error_with_account_name(s160, ld64(s150), ld64(s150 + 8), 0x100155d5b /* "buffer" */, 6)
							m = ld64(s160)
							st64(a + 0x10, ld64(s160 + 8))
							st64(a + 8, m)
							st64(a, 0)
							return n
						}
						AccountInfo_clone(s78, buffer)
						an = fn_143100(s78)
						AccountInfo_clone(s48, buffer)
						AccountInfo_try_data_len(s18, s48)
						const x = ld64(s18 + 8)
						const w = ld64(s18)
						if (w != 0x800000000000001a /* Ok */) {
							st64(s18 + 0x10, ld64(s18 + 0x10))
							st64(s18, w, x)
							n = fn_13b430(s100, s18)
							const ai = ld64(s100)
							st64(a + 0x10, ld64(s100 + 8))
							st64(a + 8, ai)
							st64(a, 0)
							const ak = ld64(s40 + 8)
							const aj = ld64(s40)
							rc_dec(aj)
							rc_dec(ak)
							const am = ld64(s78 + 0x10)
							const al = ld64(s78 + 8)
							rc_dec(al)
							if (!rc_release(am)) {
								return n
							}
							st64(am + 8, ld64(am + 8) - 1)
							return n
						}
						const y = fn_14f7f8(ao, __floatundidf((x + 0x80) * k))
						const z = fn_151cb0(y, 0)
						const aa = fn_14f3e8(y)
						ao = 0 > (z as i64) ? 0 : aa
						const ah = (fn_151a40(y, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : ao
						const ac = ld64(s40 + 8)
						const ab = ld64(s40)
						rc_dec(ab)
						rc_dec(ac)
						const af = ld64(s78 + 0x10)
						const ad = ld64(s78 + 8)
						let ae = ld64(ad) - 1
						st64(ad, ae)
						if (ae == 0) {
							ae = ld64(ad + 8) - 1
							st64(ad + 8, ae)
						}
						let ag = ld64(af) - 1
						st64(af, ag)
						if (ag == 0) {
							ag = ld64(af + 8) - 1
							st64(af + 8, ag)
						}
						if (ah > an) {
							anchor_error_from(s130, 0x7d5 /* anchor::ConstraintRentExempt */, ag, ae)
							n = Error_with_account_name(s140, ld64(s130), ld64(s130 + 8), 0x100155d5b /* "buffer" */, 6)
							m = ld64(s140)
							st64(a + 0x10, ld64(s140 + 8))
							st64(a + 8, m)
							st64(a, 0)
							return n
						}
						n = memcmp(ld64(l), 0x100152180, 0x20) as u32
						if (n != 0) {
							st64(a + 0x28, ld64(sa0 + 0x20))
							st64(a + 0x20, ld64(sa0 + 0x18))
							st64(a + 0x18, ld64(sa0 + 0x10))
							st64(a + 0x10, ld64(sa0 + 8))
							st64(a + 8, ld64(sa0))
							st64(a + 0x30, l)
							st64(a, buffer)
							return n
						}
						anchor_error_from(s110, 0x7d3 /* anchor::ConstraintRaw */)
						n = Error_with_account_name(s120, ld64(s110), ld64(s110 + 8), 0x100154b87 /* "authority" */, 9)
						m = ld64(s120)
						st64(a + 0x10, ld64(s120 + 8))
						st64(a + 8, m)
						st64(a, 0)
						return n
					}
					anchor_error_from(se0, 0x7dd /* anchor::ConstraintZero */, 0x800000000000001a /* Ok */, s)
					n = Error_with_account_name(sf0, ld64(se0), ld64(se0 + 8), 0x100155d5b /* "buffer" */, 6)
					u = ld64(sf0)
					st64(a + 0x10, ld64(sf0 + 8))
					st64(a + 8, u)
					st64(a, 0)
					st64(an, ld64(an) - 1)
					return n
				}
				fn_14c5c0(8, r, 0x10015a8d0, s)
			}
			st64(s48, p, q, s)
			n = fn_13b430(sd0, s48)
			m = ld64(sd0)
			st64(a + 0x10, ld64(sd0 + 8))
			st64(a + 8, m)
			st64(a, 0)
			return n
		}
		st32(s78, ld32(s40 + 0x11))
		st32(s78 + 3, ld32(s40 + 0x14))
		const i = ld8(s40 + 0x10)
		st32(s40 + 0xc, ld32(s78 + 3))
		st32(s40 + 9, ld32(s78))
		st8(s40 + 8, i)
		st64(s48, k, j)
		n = fn_13b430(sc0, s48)
		m = ld64(sc0)
		st64(a + 0x10, ld64(sc0 + 8))
		st64(a + 8, m)
		st64(a, 0)
		return n
	}
	n = anchor_error_from(s180, 0xbbd /* anchor::AccountNotEnoughKeys */, c, d, e)
	m = ld64(s180)
	st64(a + 0x10, ld64(s180 + 8))
	st64(a + 8, m)
	st64(a, 0)
	return n
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), p5 (value), p6 (value), p7 (value)
export function fn_11f990(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s48 = fp - 0x48, s54 = fp - 0x54, s74 = fp - 0x74, s88 = fp - 0x88, sb8 = fp - 0xb8, sc8 = fp - 0xc8, s110 = fp - 0x110, s118 = fp - 0x118, s120 = fp - 0x120, s128 = fp - 0x128
	let j, k, l, ai, an, ao, aq, at, aw, ay, bj, bs, bv, cd, ce, cz: u64
	st64(s88, c, b)
	let i = fn_125850(s48, d, p5, r0)
	const h = ld64(s48 + 0x10)
	const g = ld64(s48 + 8)
	const f = ld64(s48)
	if (f != 0x800000000000001a /* Ok */) {
		st64(a + 0x10, h)
		st64(a + 8, g)
		st64(a, f)
		return i
	}
	st64(sb8 + 0x28, p7)
	const r = p6
	i = fn_124f80(s48, g, h, 0x1a66fb4bc5652569, 0, 1, 0, i)
	if (ld64(s48) != 0) {
		l = ld64(s48 + 0x10)
		k = ld64(s48 + 0x18)
		const n = ld64(s48 + 8)
		j = 0x800000000000001a /* Ok */
		if (n != 0x800000000000001a /* Ok */) {
			st64(a + 0x10, k)
			st64(a + 8, l)
			st64(a, n)
			return i
		}
	} else {
		j = ld64(s48 + 0x18)
		k = ld64(s48 + 0x10)
		if (k > j) {
			fn_14c690(k, j, 0x10015a9b8)
		}
		if (j > h) {
			fn_14c5c0(j, h, 0x10015a9b8)
		}
		l = g + k
		if (j - k != 4) {
			st64(a + 0x10, k)
			st64(a + 8, l)
			st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
			return i
		}
		const m = ld32(l)
		k = j > j + m ? 0xffffffffffffffff : j + m
		if (k > h) {
			st64(a + 0x10, k)
			st64(a + 8, l)
			st64(a, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
			return i
		}
		k = k - j
		l = g + j
	}
	if (4 > k) {
		st64(a + 0x10, j)
		st64(a + 8, 1)
		st64(a, 0x8000000000000000)
		return i
	}
	const o = k - 4
	j = o / 0x23
	const p = j
	if (j * 0x23 == o) {
		let q = l + 4
		if (o - p * 0x23 == 0) {
			st64(s110 + 0x20, r)
			const s = ld32(l)
			if (j >= s) {
				let u = ld64(s88 + 8)
				if (s == 0) {
					st64(a, 0x800000000000001a /* Ok */)
					return i
				}
				st64(sb8 + 0x28, ld64(sb8 + 0x28) * 0x30)
				const t = ld64(s88)
				let v = ld64(t + 0x10)
				st64(sc8, ld64(t + 8))
				st64(s110, s * 0x23 + l + 4, u + 0x30)
				L20: while (true) {
					B38: {
						st64(s110 + 0x40, q)
						if (v == 0) {
							i = 8
							aq = 0
							ai = 0
						} else {
							st64(sb8 + 0x20, v)
							const w = ld64(sc8)
							const x = ld64(w)
							const ab = ld64(x + 0x18)
							st64(sb8, ld64(x + 0x10))
							st64(sb8 + 8, ld64(x + 8))
							st64(sb8 + 0x10, ld64(x))
							i = AccountInfo_try_borrow_data(s48, w, i)
							const z = ld64(s48 + 0x10)
							const aa = ld64(s48 + 8)
							const y = ld64(s48)
							if (y != 0x800000000000001a /* Ok */) {
								st64(sb8, z, aa)
								st64(a + 0x10, ld64(sb8))
								st64(a + 8, ld64(sb8 + 8))
								st64(a, y)
								return i
							}
							if (aa == 0) {
								i = 8
								aq = 0
								ai = 0
								u = ld64(s88 + 8)
								q = ld64(s110 + 0x40)
								an = ld64(sb8 + 0x10)
								if (an != 0x800000000000001a /* Ok */) {
									st64(a + 0x10, ld64(sb8))
									st64(a + 8, ld64(sb8 + 8))
									st64(a, an)
									return 8
								}
							} else {
								i = __rust_alloc(0xc0, 8)
								if (i == 0) {
									raw_vec_handle_error(8, 0xc0)
								}
								st64(i + 0x28, z)
								st64(i + 0x20, aa)
								st64(i + 0x18, ab)
								st64(i + 0x10, ld64(sb8))
								st64(i + 8, ld64(sb8 + 8))
								st64(i, ld64(sb8 + 0x10))
								st64(s18 + 8, i)
								aq = 4
								ai = 1
								st64(s18 + 0x10, 1)
								st64(s18, 4)
								const ac = ld64(sb8 + 0x20)
								if (ac != 1) {
									st64(s110 + 0x38, ld64(sc8) + 0x30)
									st64(s110 + 0x28, 0x30 - ac * 0x30)
									let ad = 0x58
									while (true) {
										st64(sb8 + 0x20, i)
										const al = ld64(sc8) + ad
										const ak = ld64(ld64(s110 + 0x38) + ad - 0x58)
										st64(sc8 + 8, ld64(ak + 0x18))
										st64(sb8, ld64(ak + 0x10))
										st64(sb8 + 8, ld64(ak + 8))
										st64(sb8 + 0x10, ld64(ak))
										AccountInfo_try_borrow_data(s48, al - 0x28, i)
										let af = ld64(s48 + 0x10)
										const ag = ld64(s48 + 8)
										const am = ld64(s48)
										if (am == 0x800000000000001a /* Ok */) {
											if (ag != 0) {
												i = ld64(sb8 + 0x20)
												let ah = ld64(sb8 + 0x10)
												if (ai == ld64(s18)) {
													st64(sb8 + 0x20, af)
													fn_121930(s18, ai, 1, af)
													af = ld64(sb8 + 0x20)
													ah = ld64(sb8 + 0x10)
													i = ld64(s18 + 8)
												}
												const ae = i + ad
												st64(ae, af)
												st64(ae - 8, ag)
												st64(ae - 0x10, ld64(sc8 + 8))
												st64(ae - 0x18, ld64(sb8))
												st64(ae - 0x20, ld64(sb8 + 8))
												st64(ae - 0x28, ah)
												ad = ad + 0x30
												const aj = ld64(s110 + 0x28) + ad
												ai = ai + 1
												st64(s18 + 0x10, ai)
												if (aj == 0x58) {
													i = ld64(s18 + 8)
													aq = ld64(s18)
													break
												}
												continue
											}
											i = ld64(s18 + 8)
											aq = ld64(s18)
											u = ld64(s88 + 8)
											q = ld64(s110 + 0x40)
											ao = ld64(sb8 + 0x10)
											if (ao == 0x800000000000001a /* Ok */) {
												break B38
											}
										} else {
											i = ld64(s18 + 8)
											aq = ld64(s18)
											ao = am
											st64(sb8, af, ag)
										}
										const cy = ao
										const cx = aq
										let cv = i + 0x28
										while (true) {
											const cw = ld64(cv)
											st64(cw, ld64(cw) - 1)
											cv = cv + 0x30
											ai = ai - 1
											if (ai == 0) {
												an = cy
												if (cx == 0) {
													st64(a + 0x10, ld64(sb8))
													st64(a + 8, ld64(sb8 + 8))
													st64(a, an)
													return i
												}
												i = fn_83078(i)
												st64(a + 0x10, ld64(sb8))
												st64(a + 8, ld64(sb8 + 8))
												st64(a, cy)
												return i
											}
										}
									}
								}
								u = ld64(s88 + 8)
								q = ld64(s110 + 0x40)
							}
						}
					}
					B93: {
						B92: {
							B128: {
								copyr(sc8, u + 0x20, 0x10)
								const ap = ld8(q)
								let av = ld64(s110 + 8)
								st64(sb8 + 0x20, i)
								if (ap != 1) {
									if (ap == 0) {
										st32(s54 + 7, ld32(q + 4))
										st32(s54 + 4, ld32(q + 1))
										st64(sc8 + 8, ld8(q + 0x22))
										ce = ld8(q + 0x21)
										st64(sb8, ld8(q + 0x20))
										st64(s110 + 0x30, ld64(q + 0x18))
										bv = ld64(q + 0x10)
										st64(sb8 + 0x10, ld64(q + 8))
										break B93
									}
									st64(s110 + 0x10, aq)
									if ((ap as i8) >= 0) {
										aw = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
										ay = ld64(s110 + 0x30)
										at = ld64(sb8 + 0x18)
										if ((ap as i8) == 2) {
											i = fn_1242d0(s48, ld64(s110 + 0x40) + 1, 0x20, i)
											const cc = ld8(s48 + 0xa)
											const ca = ld8(s48 + 9)
											const au = ld8(s48 + 8)
											const ar = ld64(s48)
											at = 0x800000000000001a /* Ok */
											if (ar != 0x800000000000001a /* Ok */) {
												i = (ld8(s48 + 0xf) << 0x38) | (ld32(s48 + 0xb) << 0x18)
												ay = ld64(s48 + 0x10)
												aw = ar
												at = (ca << 8) | au | (cc << 0x10) | i
												break B128
											}
											if (au == 1) {
												at = 0xa261c2cb
												aw = 0x8000000000000000
												ay = ld64(s110 + 0x30)
												if (ca + 0x20 > ld64(sc8 + 8)) {
													break B128
												}
												cd = ld64(sc8) + ca
											} else {
												if (au != 2) {
													ay = ld64(s110 + 0x30)
													break B128
												}
												at = 0xa261c2cc
												aw = 0x8000000000000000
												ay = ld64(s110 + 0x30)
												if (ca >= ai) {
													break B128
												}
												at = 0xa261c2cf
												const cb = ld64(ld64(sb8 + 0x20) + ca * 0x30 + 0x20)
												ay = ld64(s110 + 0x30)
												if (cc + 0x20 > ld64(cb + 8)) {
													break B128
												}
												cd = ld64(cb) + cc
											}
											st32(s54 + 7, ld32(cd + 3))
											st32(s54 + 4, ld32(cd))
											q = ld64(s110 + 0x40)
											st64(sc8 + 8, ld8(q + 0x22))
											ce = ld8(q + 0x21)
											st64(sb8 + 0x10, ld64(cd + 7))
											bv = ld64(cd + 0xf)
											st64(s110 + 0x30, ld64(cd + 0x17))
											st64(sb8, ld8(cd + 0x1f))
											u = ld64(s88 + 8)
											break B92
										}
										break B128
									}
									at = 0xa261c2cc
									aw = 0x8000000000000000
									ay = ld64(s110 + 0x30)
									if (((ap as i8) & 0x7f) >= ai) {
										break B128
									}
									av = ld64(sb8 + 0x20) + ((ap as i8) & 0x7f) * 0x30
									q = ld64(s110 + 0x40)
									aq = ld64(s110 + 0x10)
								}
								st64(s128, av)
								st64(s110 + 0x10, aq)
								i = fn_124408(s48, q + 1, q)
								ay = ld64(s48 + 0x18)
								at = ld64(s48 + 0x10)
								aw = ld64(s48 + 8)
								const ax = ld64(s48)
								st64(s118, aw)
								st64(sb8 + 8, at)
								if (ax == 0) {
									let bu = 8
									let bl = 0
									st64(s18, 0, 8, 0)
									let bf = 0
									if (ay != 0) {
										let bi = 8
										st64(sb8 + 0x18, ay * 0x18)
										let bk = ld64(sb8 + 8)
										while (true) {
											B66: {
												B65: {
													let br = ld64(bk + bl) ^ 0x8000000000000000
													br = 5 > br ? br : 1
													if ((br as i64) > 1) {
														B118: {
															if (br != 2) {
																if (br == 3) {
																	let bq = ld8(bk + bl + 8)
																	if (ai > bq) {
																		if (bf == ld64(s18)) {
																			st64(sb8, bf)
																			st64(sb8 + 0x10, bq)
																			fn_122018(s18, br)
																			bq = ld64(sb8 + 0x10)
																			bf = ld64(sb8)
																			bk = ld64(sb8 + 8)
																		}
																		st64(s110 + 0x28, ld64(s110 + 0x28) & 0xffffffff00000000 | 0xa261c2cc)
																		bi = ld64(s18 + 8)
																		bj = bi + (bf << 4)
																		st64(bj, ld64(sb8 + 0x20) + bq * 0x30)
																		bs = 0x20
																		break B65
																	}
																	cz = ld64(s110 + 0x28)
																} else {
																	const ba = bk + bl
																	const az = ld8(ba + 8)
																	if (ai > az) {
																		const bd = ld64(sb8 + 0x20) + az * 0x30
																		at = 0xa261c2cf
																		const bb = ld8(ba + 0xa)
																		const bc = ld8(ba + 9)
																		st64(sb8 + 0x10, bb)
																		st64(s110 + 0x38, bc)
																		const be = ld64(bd + 0x20)
																		if (bb + bc > ld64(be + 8)) {
																			break B118
																		}
																		let bh = ld64(be)
																		const bg = ld64(s18)
																		if (bf == bg) {
																			st64(sb8, bf)
																			st64(s120, bh)
																			fn_122018(s18, bg)
																			bh = ld64(s120)
																			bf = ld64(sb8)
																			bi = ld64(s18 + 8)
																		}
																		st64(s110 + 0x18, ld64(s110 + 0x18) & 0xffffffff00000000 | 0xa261c2cc)
																		bj = bi + (bf << 4)
																		st64(bj, bh + ld64(s110 + 0x38))
																		bk = ld64(sb8 + 8)
																		bs = ld64(sb8 + 0x10)
																		break B65
																	}
																	cz = ld64(s110 + 0x18)
																}
																at = cz & 0xffffffff00000000 | 0xa261c2cc
															} else {
																const bm = bk + bl
																at = 0xa261c2cb
																const bn = ld8(bm + 9)
																let bo = ld8(bm + 8)
																st64(sb8 + 0x10, bn)
																const bp = ld64(sc8 + 8)
																if (bp >= bn + bo) {
																	if (bf == ld64(s18)) {
																		st64(sb8, bf)
																		st64(s110 + 0x38, bo)
																		fn_122018(s18, bp)
																		bo = ld64(s110 + 0x38)
																		bf = ld64(sb8)
																	}
																	bi = ld64(s18 + 8)
																	bj = bi + (bf << 4)
																	st64(bj, ld64(sc8) + bo)
																	bk = ld64(sb8 + 8)
																	bs = ld64(sb8 + 0x10)
																	break B65
																}
															}
														}
														const da = ld64(s18)
														st64(sb8 + 0x18, at)
														if (da != 0) {
															fn_83078(bf)
															at = ld64(sb8 + 0x18)
														}
														let db = ld64(sb8 + 8) + 8
														i = 0x8000000000000000
														while (true) {
															const dc = ld64(db - 8)
															const dd = 5 > (dc ^ 0x8000000000000000)
															if (dc != 0 && (dd & dc != 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) == 0) {
																void ld64(db)
																fn_83078(0x8000000000000000)
																i = 0x8000000000000000
																at = ld64(sb8 + 0x18)
															}
															db = db + 0x18
															ay = ay - 1
															if (ay == 0) {
																aw = 0x8000000000000000
																ay = ld64(s110 + 0x30)
																if (ld64(s118) == 0) {
																	break B128
																}
																i = fn_83078(0x8000000000000000)
																at = ld64(sb8 + 0x18)
																ay = ld64(s110 + 0x30)
																break B128
															}
														}
													}
													if (br == 0) {
														break B66
													}
													const bt = bk + bl
													bs = ld64(bt + 0x10)
													st64(s110 + 0x38, ld64(bt + 8))
													if (bf == ld64(s18)) {
														st64(sb8, bf)
														st64(sb8 + 0x10, bs)
														fn_122018(s18, br)
														bs = ld64(sb8 + 0x10)
														bf = ld64(sb8)
														bk = ld64(sb8 + 8)
													}
													bi = ld64(s18 + 8)
													bj = bi + (bf << 4)
													st64(bj, ld64(s110 + 0x38))
												}
												st64(bj + 8, bs)
												bf = bf + 1
												st64(s18 + 0x10, bf)
											}
											bl = bl + 0x18
											if (ld64(sb8 + 0x18) == bl) {
												bl = ld64(s18)
												bu = ld64(s18 + 8)
												break
											}
										}
									}
									st64(sc8 + 8, bu)
									i = Pubkey_find_program_address(s48, bu, bf, ld64(s128))
									st32(s48 + 0x2b, ld32(s48 + 3))
									st32(s48 + 0x28, ld32(s48))
									st64(sb8, ld8(s48 + 0x1f))
									st64(s110 + 0x30, ld64(s48 + 0x17))
									bv = ld64(s48 + 0xf)
									st64(sb8 + 0x10, ld64(s48 + 7))
									st64(sb8 + 0x18, bv)
									if (bl != 0) {
										i = fn_83078(i)
										bv = ld64(sb8 + 0x18)
									}
									const bw = ld64(s110 + 0x40)
									st64(sc8 + 8, ld8(bw + 0x22))
									st64(sc8, ld8(bw + 0x21))
									st32(s54 + 7, ld32(s48 + 0x2b))
									st32(s54 + 4, ld32(s48 + 0x28))
									if (ay != 0) {
										let bx = ld64(sb8 + 8) + 8
										do {
											const by = ld64(bx - 8)
											const bz = 5 > (by ^ 0x8000000000000000)
											if (by != 0 && (bz & by != 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) == 0) {
												void ld64(bx)
												i = fn_83078(i)
												bv = ld64(sb8 + 0x18)
											}
											bx = bx + 0x18
											ay = ay - 1
										} while (ay != 0)
									}
									u = ld64(s88 + 8)
									q = ld64(s110 + 0x40)
									aq = ld64(s110 + 0x10)
									ce = ld64(sc8)
									if (ld64(s118) == 0) {
										break B93
									}
									i = fn_83078(i)
									ce = ld64(sc8)
									bv = ld64(sb8 + 0x18)
									break B92
								}
							}
							st64(a + 0x10, ay)
							st64(a + 8, at)
							st64(a, aw)
							if (ai != 0) {
								let de = ld64(sb8 + 0x20) + 0x28
								do {
									const df = ld64(de)
									st64(df, ld64(df) - 1)
									de = de + 0x30
									ai = ai - 1
								} while (ai != 0)
							}
							if (ld64(s110 + 0x10) == 0) {
								return i
							}
							return fn_83078(i)
						}
						aq = ld64(s110 + 0x10)
					}
					const cf = ld64(sc8 + 8) != 0
					st32(s74, ld32(s54 + 4))
					st32(s74 + 3, ld32(s54 + 7))
					st8(s74 + 0x1f, ld64(sb8))
					st64(s74 + 0x17, ld64(s110 + 0x30))
					st64(sb8 + 0x18, bv)
					st64(s74 + 0xf, bv)
					st64(s74 + 7, ld64(sb8 + 0x10))
					st8(s54, ce != 0, cf)
					if (ai != 0) {
						let cg = ld64(sb8 + 0x20) + 0x28
						do {
							const ch = ld64(cg)
							st64(ch, ld64(ch) - 1)
							cg = cg + 0x30
							ai = ai - 1
						} while (ai != 0)
					}
					if (aq != 0) {
						i = fn_83078(i)
					}
					st64(s110 + 0x40, q + 0x23)
					i = fn_124ae0(s74, ld64(u + 8), ld64(u + 0x10), i)
					let ci = ld64(sb8 + 0x28)
					let cj = ld64(s110 + 0x20)
					while (true) {
						if (ci == 0) {
							st64(a, 0x8000000000000000)
							st32(a + 8, 0xffffffffa261c2c0)
							return i
						}
						const ck = ld64(cj)
						const cl = memcmp(ck, s74, 0x20)
						ci = ci - 0x30
						cj = cj + 0x30
						i = cl as u32
						if (i == 0) {
							let cm = ld64(cj - 0x28)
							let cr = ld64(s88)
							rc_inc(cm)
							i = ld64(cj - 0x20)
							const cn = ld64(i)
							st64(i, cn + 1)
							if (cn != -1) {
								st64(s110 + 0x28, ld8(cj - 6))
								st64(s110 + 0x38, ld8(cj - 7))
								st64(sc8 + 8, ld8(cj - 8))
								st64(sb8, ld64(cj - 0x10))
								st64(sb8 + 8, ld64(cj - 0x18))
								st16(s48 + 0x20, ld16(s54))
								copyr(s48, s74, 0x20)
								u = ld64(s88 + 8)
								const co = ld64(u + 0x10)
								const cp = ld64(u)
								st64(sb8 + 0x20, cm)
								st64(sb8 + 0x10, i)
								if (co == cp) {
									fn_121d50(u, cn == -1)
									i = ld64(sb8 + 0x10)
									cm = ld64(sb8 + 0x20)
									cr = ld64(s88)
								}
								const cq = ld64(u + 8) + co * 0x22
								st16(cq + 0x20, ld16(s48 + 0x20))
								st64(cq + 0x18, ld64(s48 + 0x18))
								st64(cq + 0x10, ld64(s48 + 0x10))
								st64(cq + 8, ld64(s48 + 8))
								st64(cq, ld64(s48))
								st64(u + 0x10, co + 1)
								const cs = ld64(cr + 0x10)
								if (cs == ld64(cr)) {
									fn_121eb0(cr, cq)
									i = ld64(sb8 + 0x10)
									cm = ld64(sb8 + 0x20)
									cr = ld64(s88)
								}
								const ct = ld64(cr + 8)
								st64(sc8, ct)
								const cu = ct + cs * 0x30
								st8(cu + 0x2a, ld64(s110 + 0x28))
								st8(cu + 0x29, ld64(s110 + 0x38))
								st8(cu + 0x28, ld64(sc8 + 8))
								st64(cu + 0x20, ld64(sb8))
								st64(cu + 0x18, ld64(sb8 + 8))
								st64(cu + 0x10, i)
								st64(cu + 8, cm)
								st64(cu, ck)
								v = cs + 1
								st64(cr + 0x10, v)
								q = ld64(s110 + 0x40)
								if (q == ld64(s110)) {
									st64(a, 0x800000000000001a /* Ok */)
									return i
								}
								continue L20
							}
							abort()
						}
					}
				}
			}
			fn_14c5c0(s, j, 0x10015a9d0, s, p * 0x23)
		}
		st64(a + 0x10, j)
		st64(a + 8, q)
		st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
		return i
	}
	st64(a + 0x10, j)
	st64(a + 8, 0x23 > o ? 1 : 2)
	st64(a, 0x8000000000000000)
	return i
}

export function fn_122180(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s18 = fp - 0x18
	let g, l, m, n, o, p, y: u64
	st64(s18, 0, 1, 0)
	const f = ld32(b)
	if (f == 0) {
		fn_121c08(s18, 0, 8, d, e)
		const v = ld64(s18 + 0x10)
		let u = ld64(s18 + 8)
		st64(u + v, 0x1a66fb4bc5652569)
		let w = v + 8
		st64(s18 + 0x10, w)
		const x = ld64(b + 8)
		if (7 >= ld64(s18) - w) {
			fn_121c08(s18, w, 8)
			u = ld64(s18 + 8)
			w = ld64(s18 + 0x10)
		}
		st64(u + w, x)
		y = w + 8
		st64(s18 + 0x10, y)
		st64(a + 0x10, y)
		st64(a + 8, ld64(s18 + 8))
		st64(a, ld64(s18))
	} else {
		B5: {
			if (f == 1) {
				fn_121c08(s18, 0, 8, d, e)
				const q = ld64(s18 + 0x10)
				g = ld64(s18 + 8)
				st64(g + q, 0xebeb58a7310d222b)
				let r = q + 8
				st64(s18 + 0x10, r)
				let s = ld64(s18)
				const t = ld64(b + 0x18)
				if (3 >= s - r) {
					fn_121c08(s18, r, 4, o, p)
					s = ld64(s18)
					g = ld64(s18 + 8)
					r = ld64(s18 + 0x10)
				}
				st32(g + r, t)
				l = r + 4
				st64(s18 + 0x10, l)
				n = ld64(b + 0x10)
				m = t * 0x23
				if (s - l >= m) {
					break B5
				}
			} else {
				fn_121c08(s18, 0, 8, d, e)
				const h = ld64(s18 + 0x10)
				g = ld64(s18 + 8)
				st64(g + h, 0xaef15566922a699d)
				let i = h + 8
				st64(s18 + 0x10, i)
				let j = ld64(s18)
				const k = ld64(b + 0x18)
				if (3 >= j - i) {
					fn_121c08(s18, i, 4, o, p)
					j = ld64(s18)
					g = ld64(s18 + 8)
					i = ld64(s18 + 0x10)
				}
				st32(g + i, k)
				l = i + 4
				st64(s18 + 0x10, l)
				n = ld64(b + 0x10)
				m = k * 0x23
				if (j - l >= m) {
					break B5
				}
			}
			fn_121c08(s18, l, m, o, p)
			g = ld64(s18 + 8)
			l = ld64(s18 + 0x10)
		}
		memcpy(g + l, n, m)
		y = l + m
		st64(s18 + 0x10, y)
		st64(a + 0x10, y)
		st64(a + 8, ld64(s18 + 8))
		st64(a, ld64(s18))
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it), b (points to it), d (points to it), p5 (value), p6 (points to it), p7 (points to it), p8 (points to it), p9 (value), p10 (value), p11 (value)
export function fn_1225a0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64) {
	const s18 = fp - 0x18, s20 = fp - 0x20, s38 = fp - 0x38, s50 = fp - 0x50, s70 = fp - 0x70, s88 = fp - 0x88, sa0 = fp - 0xa0, sc0 = fp - 0xc0
	let z, aa, ab, ae, ao, dg: u64
	const f = p6
	const g = ld64(f)
	st64(s20, 0x100155d9d)
	let dn = g
	st64(s18, 0x13, g, 0x20)
	let dr = d
	// PDA find_program_address(["extra-account-metas", *g [ix data?]], program *d)
	let m = Pubkey_find_program_address(sa0, s20, 2, d)
	copy(sc0, sa0, 0x20)
	let j = 0
	const h = p10
	let dp = p9
	const dj = p8
	const dk = p7
	const dl = p5
	const i = p11
	let dm = i
	while (true) {
		if (i * 0x30 == j) {
			st64(a, 0x8000000000000000)
			st32(a + 8, 0x7dc8348c)
			const t = ld64(dj + 0x10)
			const s = ld64(dj + 8)
			if (rc_release(s)) {
				if (rc_release(s + 8)) {
					m = fn_83078(m)
				}
			}
			if (rc_release(t)) {
				if (rc_release(t + 8)) {
					m = fn_83078(m)
				}
			}
			const v = ld64(dk + 0x10)
			const u = ld64(dk + 8)
			if (rc_release(u)) {
				if (rc_release(u + 8)) {
					m = fn_83078(m)
				}
			}
			if (rc_release(v)) {
				if (rc_release(v + 8)) {
					m = fn_83078(m)
				}
			}
			const x = ld64(f + 0x10)
			const w = ld64(f + 8)
			if (rc_release(w)) {
				if (rc_release(w + 8)) {
					m = fn_83078(m)
				}
			}
			if (rc_release(x)) {
				if (rc_release(x + 8)) {
					m = fn_83078(m)
				}
			}
			z = ld64(dl + 0x10)
			const y = ld64(dl + 8)
			if (rc_release(y)) {
				if (rc_release(y + 8)) {
					m = fn_83078(m)
				}
			}
			if (!rc_release(z)) {
				return
			}
			if (!rc_release(z + 8)) {
				return
			}
			fn_83078(m)
			return
		}
		const k = ld64(h + j)
		const l = memcmp(k, dr, 0x20)
		j = j + 0x30
		m = l as u32
		if (m == 0) {
			let dq = h
			let n = 0
			while (true) {
				B32: {
					if (i * 0x30 != n) {
						const o = ld64(dq + n)
						const p = memcmp(o, sc0, 0x20)
						const q = n
						n = n + 0x30
						if ((p as u32) != 0) {
							continue
						}
						dg = q
						const ay = ld64(dj)
						let di = ld64(dk)
						const ax = ld64(dl)
						st64(s18, dp)
						st32(s20, 0)
						fn_122180(s38, s20)
						const r = __rust_alloc(0x88, 1)
						if (r != 0) {
							st64(r + 0x18, ld64(ax + 0x18))
							st64(r + 0x10, ld64(ax + 0x10))
							st64(r + 8, ld64(ax + 8))
							st64(r, ld64(ax))
							st16(r + 0x20, 0)
							copy(r + 0x22, dn, 0x20)
							st16(r + 0x42, 0)
							copy(r + 0x44, di, 0x20)
							st16(r + 0x64, 0)
							st64(r + 0x7e, ld64(ay + 0x18))
							st64(r + 0x76, ld64(ay + 0x10))
							st64(r + 0x6e, ld64(ay + 8))
							st64(r + 0x66, ld64(ay))
							st16(r + 0x86, 0)
							copyr(s70, dr, 0x20)
							st64(sa0 + 8, r)
							copy(s88, s38, 0x18)
							st64(sa0 + 0x10, 4)
							st64(sa0, 4)
							fn_121d50(sa0, dr)
							const az = ld64(sa0 + 8)
							st64(az + 0xa0, ld64(sc0 + 0x18))
							st64(az + 0x98, ld64(sc0 + 0x10))
							st64(az + 0x90, ld64(sc0 + 8))
							st64(az + 0x88, ld64(sc0))
							st16(az + 0xa8, 0)
							st64(sa0 + 0x10, 5)
							const ba = __rust_alloc(0xf0, 8)
							if (ba != 0) {
								const bb = ld64(dq + n - 0x28)
								rc_inc(bb)
								const bc = ld64(dq + n - 0x20)
								rc_inc(bc)
								dp = dq + n - 0x30
								const bd = dq + n
								const dd = ld64(bd - 0x18)
								const df = ld64(bd - 0x10)
								const de = ld8(bd - 8)
								const bf = ld8(bd - 7)
								const be = ld8(bd - 6)
								memcpy(ba, dl, 0x30)
								memcpy(ba + 0x30, f, 0x30)
								memcpy(ba + 0x60, dk, 0x30)
								const bg = memcpy(ba + 0x90, dj, 0x30)
								st64(ba + 0xd0, bc)
								st64(ba + 0xc8, bb)
								st64(ba + 0xc0, o)
								st8(ba + 0xea, be)
								st8(ba + 0xe9, bf)
								st8(ba + 0xe8, de)
								st64(ba + 0xe0, df)
								st64(ba + 0xd8, dd)
								st64(s50, 5, ba, 5)
								let bl = AccountInfo_try_borrow_data(s20, dp, bg)
								const bm = ld64(s18 + 8)
								const bi = ld64(s18)
								const bh = ld64(s20)
								if (bh == 0x800000000000001a /* Ok */) {
									const bk = ld64(bi)
									const bj = ld64(bi + 8)
									bl = fn_11f990(s38, sa0, s50, bk, bj, dq, dm, bl)
									let bo = undef
									let bp = undef
									if (ld64(s38) == 0x800000000000001a /* Ok */) {
										st64(bm, ld64(bm) - 1)
										const bn = ld64(sa0 + 0x10)
										if (bn > 4) {
											const bt = ld64(sa0 + 8)
											let bq = b
											let br = ld64(b + 0x10)
											let bs = bn - 5
											if (bs > ld64(b) - br) {
												fn_121aa0(bq, br, bs, bo, bp)
												bo = undef
												bp = undef
												bq = b
												br = ld64(b + 0x10)
											}
											let dc = ld64(bq + 8)
											if (bs != 0) {
												let bu = bt + 0xcb
												let bv = br * 0x22 + dc + 0x20
												do {
													dp = ld64(bu - 0x21)
													const bx = ld64(bu - 0x19)
													bo = ld64(bu - 0x11)
													bp = ld64(bu - 9)
													const bw = ld8(bu)
													st8(bv, ld8(bu - 1))
													st8(bv + 1, bw)
													st64(bv - 8, bp)
													st64(bv - 0x10, bo)
													st64(bv - 0x18, bx)
													st64(bv - 0x20, dp)
													bv = bv + 0x22
													bu = bu + 0x22
													br = br + 1
													bs = bs - 1
												} while (bs != 0)
											}
											st64(b + 0x10, br)
											const by = ld64(s50 + 0x10)
											if (by > 4) {
												const da = br
												let cc = ld64(s50 + 8)
												let bz = c
												let ca = ld64(c + 0x10)
												let cb = by - 5
												if (cb > ld64(c) - ca) {
													fn_121930(bz, ca, cb, bo, bp)
													bz = c
													ca = ld64(c + 0x10)
												}
												let db = ld64(bz + 8)
												if (cb != 0) {
													di = db + ca * 0x30
													let ce = 0
													const dh = cc
													do {
														const cq = cc + ce
														const ck = ld64(cq + 0xf8)
														const cl = ld64(cq + 0xf0)
														rc_inc(ck)
														const cf = cc
														const cd = ld64(cc + ce + 0x100)
														dp = cb
														rc_inc(cd)
														const ch = di + ce
														const cg = cf + ce
														dn = ld64(cg + 0x108)
														const cj = ld64(cg + 0x110)
														dm = ld8(cg + 0x118)
														const ci = ld8(cg + 0x119)
														st8(ch + 0x2a, ld8(cg + 0x11a))
														st8(ch + 0x29, ci)
														st8(ch + 0x28, dm)
														st64(ch + 0x20, cj)
														st64(ch + 0x18, dn)
														st64(ch + 0x10, cd)
														cc = dh
														st64(ch + 8, ck)
														st64(ch, cl)
														ce = ce + 0x30
														ca = ca + 1
														cb = dp - 1
													} while (cb != 0)
												}
												let cm = c
												const cw = ca
												st64(c + 0x10, ca)
												let cn = b
												const cp = ld64(b)
												let co = da
												if (da == cp) {
													fn_121d50(cn, cp)
													co = da
													cn = b
													cm = c
													dc = ld64(b + 8)
												}
												const cr = dc + co * 0x22
												st64(cr + 0x18, ld64(sc0 + 0x18))
												st64(cr + 0x10, ld64(sc0 + 0x10))
												st64(cr + 8, ld64(sc0 + 8))
												st64(cr, ld64(sc0))
												st16(cr + 0x20, 0)
												const cs = co + 1
												st64(cn + 0x10, cs)
												let ct = bb
												ae = dq
												let cy = o
												let cu = bc
												rc_inc(bb)
												const cv = ld64(cu)
												st64(cu, cv + 1)
												if (cv != -1) {
													if (cw == ld64(cm)) {
														fn_121eb0(cm, cv + 1)
														cu = bc
														ct = bb
														cy = o
														cm = c
														db = ld64(c + 8)
													}
													const cx = db + cw * 0x30
													st8(cx + 0x2a, be)
													st8(cx + 0x29, bf)
													st8(cx + 0x28, de)
													st64(cx + 0x20, df)
													st64(cx + 0x18, dd)
													st64(cx + 0x10, cu)
													st64(cx + 8, ct)
													st64(cx, cy)
													st64(cm + 0x10, cw + 1)
													let cz = ptr_drop_in_place_121690(s50, cu)
													if (ld64(sa0) != 0) {
														cz = fn_83078(cz)
													}
													ao = k
													if (ld64(s88) != 0) {
														fn_83078(cz)
													}
													aa = b
													ab = cs
													break B32
												}
												abort()
											}
											fn_14c4f0(5, by, 0x10015aa00, bo, bp)
										}
										fn_14c4f0(5, bn, 0x10015a9e8, bo, bp)
									}
									st64(a + 0x10, ld64(s38 + 0x10))
									st64(a + 8, ld64(s38 + 8))
									st64(a, ld64(s38))
									st64(bm, ld64(bm) - 1)
								} else {
									st64(a + 0x10, bm)
									st64(a + 8, bi)
									st64(a, bh)
								}
								m = ptr_drop_in_place_121690(s50, bl)
								if (ld64(sa0) != 0) {
									m = fn_83078(m)
								}
								if (ld64(s88) == 0) {
									return
								}
								fn_83078(m)
								return
							}
							alloc_handle_alloc_error(8, 0xf0)
						}
						alloc_handle_alloc_error(1, 0x88)
					}
					dg = n
					aa = b
					ab = ld64(b + 0x10)
					ae = dq
					ao = k
				}
				const ac = ld64(aa)
				if (ab == ac) {
					fn_121d50(aa, ac)
					aa = b
				}
				const ad = ld64(aa + 8) + ab * 0x22
				st64(ad + 0x18, ld64(dr + 0x18))
				st64(ad + 0x10, ld64(dr + 0x10))
				st64(ad + 8, ld64(dr + 8))
				st64(ad, ld64(dr))
				st16(ad + 0x20, 0)
				st64(aa + 0x10, ab + 1)
				const af = ld64(ae + j - 0x28)
				let ai = c
				rc_inc(af)
				const ag = ld64(dq + j - 0x20)
				rc_inc(ag)
				const ah = dq + j
				dq = ld8(ah - 6)
				dr = ld8(ah - 7)
				m = ld8(ah - 8)
				const am = ld64(ah - 0x10)
				const al = ld64(ah - 0x18)
				const aj = ld64(ai + 0x10)
				const ak = ld64(ai)
				if (aj == ak) {
					fn_121eb0(ai, ak)
					ao = k
					ai = c
				}
				const an = ld64(ai + 8) + aj * 0x30
				st8(an + 0x2a, dq)
				st8(an + 0x29, dr)
				st8(an + 0x28, m)
				st64(an + 0x20, am)
				st64(an + 0x18, al)
				st64(an + 0x10, ag)
				st64(an + 8, af)
				st64(an, ao)
				st64(ai + 0x10, aj + 1)
				st64(a, 0x800000000000001a /* Ok */)
				if (i * 0x30 == dg) {
					const aq = ld64(dj + 0x10)
					const ap = ld64(dj + 8)
					if (rc_release(ap)) {
						if (rc_release(ap + 8)) {
							m = fn_83078(m)
						}
					}
					if (rc_release(aq)) {
						if (rc_release(aq + 8)) {
							m = fn_83078(m)
						}
					}
					const at = ld64(dk + 0x10)
					const ar = ld64(dk + 8)
					if (rc_release(ar)) {
						if (rc_release(ar + 8)) {
							m = fn_83078(m)
						}
					}
					if (rc_release(at)) {
						if (rc_release(at + 8)) {
							m = fn_83078(m)
						}
					}
					const av = ld64(f + 0x10)
					const au = ld64(f + 8)
					if (rc_release(au)) {
						if (rc_release(au + 8)) {
							m = fn_83078(m)
						}
					}
					if (rc_release(av)) {
						if (rc_release(av + 8)) {
							m = fn_83078(m)
						}
					}
					z = ld64(dl + 0x10)
					const aw = ld64(dl + 8)
					if (rc_release(aw)) {
						if (rc_release(aw + 8)) {
							m = fn_83078(m)
						}
					}
					if (!rc_release(z)) {
						return
					}
					if (!rc_release(z + 8)) {
						return
					}
					fn_83078(m)
					return
				}
				return
			}
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
export function fn_124168(a: u64, b: u64) {
	const s18 = fp - 0x18, s30 = fp - 0x30
	let f = ld64(a)
	let g = f + 1
	let m = 0
	let h = g == 0
	if (h != 0) {
		raw_vec_handle_error(0, b, g, f, h)
	}
	let i = max(f << 1, g)
	const j = 0x555555555555556 > i
	i = max(i, 4)
	const k = i
	if (f != 0) {
		const l = ld64(a + 8)
		st64(s18 + 0x10, f * 0x18)
		st64(s18, l)
		m = 8
	}
	st64(s18 + 8, m)
	fn_124030(s30, j << 3, k * 0x18, s18)
	g = undef
	f = undef
	h = undef
	if (ld64(s30) != 0) {
		raw_vec_handle_error(ld64(s30 + 8), ld64(s30 + 0x10), g, f, h)
	}
	const n = ld64(s30 + 8)
	st64(a, i, n)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (value)
export function fn_1242d0(a: u64, b: u64, c: u64, r0: u64): u64 {
	if (c != 0) {
		const f = ld8(b)
		if (f == 0) {
			st64(a, 0x800000000000001a /* Ok */)
			st8(a + 8, 0)
			return r0
		}
		if (f == 1) {
			if (c == 1) {
				st64(a, 0x8000000000000000)
				st32(a + 8, 0xffffffffa261c2d2)
				return r0
			}
			st8(a + 9, ld8(b + 1))
			st64(a, 0x800000000000001a /* Ok */)
			st8(a + 8, 1)
			return r0
		}
		if (f == 2) {
			if (3 > c) {
				st64(a, 0x8000000000000000)
				st32(a + 8, 0xffffffffa261c2d2)
				return r0
			}
			const g = ld8(b + 1)
			st8(a + 0xa, ld8(b + 2))
			st8(a + 9, g)
			st64(a, 0x800000000000001a /* Ok */)
			st8(a + 8, 2)
			return r0
		}
		st64(a, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
		return r0
	}
	st64(a, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (points to it), r7 (value)
export function fn_124408(a: u64, b: u64, r7: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s28 = fp - 0x28, s30 = fp - 0x30, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48
	let n, r, v, x, y: u64
	st64(s28, b)
	st64(s48, a)
	let i = 8
	let j = 0
	st64(s18, 0, 8, 0)
	let m = 0
	st64(s20, 0)
	while (true) {
		B33: {
			B32: {
				B22: {
					y = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
					const o = ld64(s28)
					const p = ld64(s20)
					const q = ld8(o + p)
					if ((q as i64) > 1) {
						if (q == 2) {
							if (0x1d >= ld64(s20)) {
								r = 0x8000000000000002 /* Err(ProgramError::InvalidInstructionData) */
								r7 = (ld8(o + p + 2) << 8) | (r7 & 0xffffffffffff0000 | ld8(o + p + 1))
								break B22
							}
						} else if (q == 3) {
							if (p != 0x1f) {
								r7 = r7 & -0x100 | ld8(o + p + 1)
								r = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
								break B22
							}
						} else {
							const t = i
							x = r7
							if (q != 4) {
								break B33
							}
							if (0x1c >= ld64(s20)) {
								r = 0x8000000000000004 /* Err(ProgramError::AccountDataTooSmall) */
								r7 = (ld8(o + p + 2) << 8) | (r7 & 0xffffffffff000000 | ld8(o + p + 1)) | (ld8(o + p + 3) << 0x10)
								i = t
								break B22
							}
						}
						v = r7 & 0xffffffff00000000 | 0xa261c2c9
						y = 0x8000000000000000
						break B32
					}
					r = 0x8000000000000000
					if (q != 0) {
						st64(s38, i)
						x = r7
						if (q != 1) {
							break B33
						}
						y = 0x8000000000000000
						x = 0xa261c2c9
						if (p == 0x1f) {
							break B33
						}
						r = ld8(o + p + 1)
						if (r > 0x1e - ld64(s20)) {
							v = r7 & 0xffffffff00000000 | 0xa261c2c9
							break B32
						}
						st64(s40, j)
						r7 = 1
						if (r != 0) {
							st64(s30, r)
							const s = __rust_alloc(r, 1)
							r7 = s
							if (s == 0) {
								raw_vec_handle_error(1, ld64(s30))
							}
							r = ld64(s30)
						}
						memcpy(r7, o + p + 2, r)
						st64(s30, r)
						j = ld64(s40)
						i = ld64(s38)
					}
				}
				let f = r ^ 0x8000000000000000
				const l = r
				f = 5 > f ? f : 1
				if ((f as i64) > 1) {
					if (f == 2) {
						f = 3
					} else {
						f = f != 3 ? 4 : 2
					}
				} else if (f != 0) {
					f = ld64(s30) + 2
				}
				if (l == 0x8000000000000000) {
					n = ld64(s48)
					st64(n + 0x18, ld64(s18 + 0x10))
					st64(n + 0x10, ld64(s18 + 8))
					st64(n + 8, ld64(s18))
					st64(n, 0)
					return j
				}
				if (m == ld64(s18)) {
					const u = ld64(s28)
					st64(s38, r7)
					fn_124168(s18, u)
					r7 = ld64(s38)
					i = ld64(s18 + 8)
				}
				const g = f as u8
				const h = ld64(s20)
				const k = i + j
				st64(k + 0x10, ld64(s30))
				st64(k + 8, r7)
				st64(k, l)
				j = j + 0x18
				m = m + 1
				st64(s18 + 0x10, m)
				st64(s20, g + h)
				if (0x20 > g + h) {
					continue
				}
				n = ld64(s48)
				st64(n + 0x18, ld64(s18 + 0x10))
				st64(n + 0x10, ld64(s18 + 8))
				st64(n + 8, ld64(s18))
				st64(n, 0)
				return j
			}
			x = v
		}
		const w = ld64(s48)
		st64(w + 0x18, ld64(s30))
		st64(w + 0x10, x)
		st64(w + 8, y)
		st64(w, 1)
		const z = ld64(s18 + 8)
		if (m != 0) {
			let aa = z + 8
			do {
				const ab = ld64(aa - 8)
				const ac = 5 > (ab ^ 0x8000000000000000)
				if (ab != 0 && (ac & ab != 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) == 0) {
					void ld64(aa)
					j = fn_83078(j)
				}
				aa = aa + 0x18
				m = m - 1
			} while (m != 0)
		}
		if (ld64(s18) == 0) {
			return j
		}
		return fn_83078(j)
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
export function fn_124ae0(a: u64, b: u64, c: u64, r0: u64): u64 {
	const s8 = fp - 0x8
	let g = b
	let f = c * 0x22
	while (true) {
		if (f == 0) {
			return r0
		}
		const h = memcmp(g, a, 0x20)
		f = f - 0x22
		g = g + 0x22
		r0 = h as u32
		if (r0 == 0) {
			st64(s8, ld8(g - 1) != 0)
			let i = ld8(g - 2) != 0
			if (f != 0) {
				let k = f / 0x22
				do {
					r0 = memcmp(g, a, 0x20) as u32
					if (r0 == 0) {
						const j = ld8(g + 0x20) != 0
						st64(s8, ld64(s8) | ld8(g + 0x21) != 0)
						i = i | j
					}
					g = g + 0x22
					k = k - 1
				} while (k != 0)
			}
			if ((i & 1) == 0 && ld8(a + 0x20) != 0) {
				st8(a + 0x20, 0)
			}
			if (((ld64(s8) | ld8(a + 0x21) == 0) & 1) != 0) {
				return r0
			}
			st8(a + 0x21, 0)
			return r0
		}
	}
}

export function fn_124e20(a: u64, b: u64) {
	const s18 = fp - 0x18, s30 = fp - 0x30
	let f = ld64(a)
	let g = f + 1
	let l = 0
	let h = g == 0
	if (h != 0) {
		raw_vec_handle_error(0, b, g, f, h)
	}
	let i = max(f << 1, g)
	const m = 0x1000000000000000 > i
	i = max(i, 4)
	const j = i
	if (f != 0) {
		const k = ld64(a + 8)
		st64(s18 + 0x10, f << 3)
		st64(s18, k)
		l = 1
	}
	st64(s18 + 8, l)
	fn_124ce8(s30, m, j << 3, s18)
	g = undef
	f = undef
	h = undef
	if (ld64(s30) != 0) {
		raw_vec_handle_error(ld64(s30 + 8), ld64(s30 + 0x10), g, f, h)
	}
	const n = ld64(s30 + 8)
	st64(a, i, n)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), b (value)
export function fn_124f80(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s38 = fp - 0x38
	let q: u64
	let v = ld64(s38)
	if (c == 0) {
		st64(a + 8, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
		st64(a, 1)
		return r0
	}
	const t = p7
	const u = p6
	const s = p5
	let w = 0
	let f = 0
	while (true) {
		r0 = f > f + 0xc
		const g = f
		const h = f > f + 8
		const j = h != 0 ? 0xffffffffffffffff : f + 8
		const i = r0 != 0 ? 0xffffffffffffffff : f + 0xc
		if (i > c) {
			st64(a + 8, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
			st64(a, 1)
			return r0
		}
		const k = c
		if (j > c) {
			fn_14c5c0(j, k, 0x10015aa18, g + 8, h)
		}
		const n = b
		r0 = fn_1388f0(s18, b + f, j - f, r0)
		let o = undef
		const m = ld64(s18 + 8)
		const l = ld64(s18)
		if (l != 0x800000000000001a /* Ok */) {
			st64(a + 0x18, ld64(s18 + 0x10))
			st64(a + 0x10, m)
			st64(a + 8, l)
			st64(a, 1)
			return r0
		}
		if (m == d) {
			c = k
			b = n
			const p = w
			o = u
			if (u == 1) {
				o = t
				if (p == t) {
					st64(a + 0x20, t)
					st64(a + 0x18, i)
					st64(a + 0x10, j)
					st64(a + 8, f)
					st64(a, 0)
					return r0
				}
			}
			w = p + 1
			q = i
		} else {
			c = k
			b = n
			q = i
			if (m == 0) {
				if (s != 0) {
					st64(a + 0x20, w)
					st64(a + 0x18, q)
					st64(a + 0x10, j)
					st64(a + 8, f)
					st64(a, 0)
					return r0
				}
				st64(a + 8, 0x8000000000000000)
				st32(a + 0x10, 0x47af3bc0)
				st64(a, 1)
				return r0
			}
		}
		if (j > q) {
			fn_14c690(j, q, 0x10015aa30, o, q)
		}
		if (q - j != 4) {
			st64(a + 0x10, v)
			st64(a + 8, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
			st64(a, 1)
			return r0
		}
		v = b + j
		const r = ld32(b + j)
		f = q > q + r ? 0xffffffffffffffff : q + r
		if (f >= c) {
			st64(a + 8, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
			st64(a, 1)
			return r0
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), c (value)
export function fn_1253c0(a: u64, b: u64, c: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s30 = fp - 0x30, s68 = fp - 0x68
	let j, n, o, s: u64
	let t = ld64(s68)
	let f = a
	let v = 1
	let i = 0
	st64(s30, 0, 1, 0)
	let x = 0
	let g = 0
	const u = b
	while (true) {
		if (c > g) {
			B21: {
				r0 = g > g + 0xc
				const y = r0 != 0 ? 0xffffffffffffffff : g + 0xc
				const h = g > g + 8 ? 0xffffffffffffffff : g + 8
				if (h > c) {
					let r = b + g
					f = a
					do {
						if (g == c) {
							st64(f + 0x10, ld64(s30 + 0x10))
							st64(f + 8, ld64(s30 + 8))
							st64(f, ld64(s30))
							st64(f + 0x18, g)
							return r0
						}
						c = c - 1
						s = ld8(r)
						r = r + 1
					} while (s == 0)
				} else {
					const w = i
					const l = c
					r0 = fn_1388f0(s18, b + g, h - g, r0)
					const k = ld64(s18 + 8)
					j = ld64(s18)
					if (j != 0x800000000000001a /* Ok */) {
						f = a
						st64(a + 0x18, ld64(s18 + 0x10))
						st64(a + 0x10, k)
						break B21
					}
					if (k == 0) {
						st64(a + 0x10, ld64(s30 + 0x10))
						st64(a + 8, ld64(s30 + 8))
						st64(a, ld64(s30))
						st64(a + 0x18, g)
						return r0
					}
					c = l
					r0 = y
					if (y > l) {
						j = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
						f = a
						break B21
					}
					const m = x
					if (x == ld64(s30)) {
						fn_124e20(s30, 0x800000000000001a /* Ok */)
						r0 = y
						c = l
						v = ld64(s30 + 8)
					}
					st64(v + w, k)
					st64(s30 + 0x10, m + 1)
					if (h > r0) {
						fn_14c690(h, r0, 0x10015aa48, n, o)
					}
					f = a
					b = u
					if (r0 - h != 4) {
						st64(f + 0x10, t)
						j = 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */
						break B21
					}
					x = m + 1
					const p = b + h
					t = p
					const q = ld32(p)
					g = r0 > r0 + q ? 0xffffffffffffffff : r0 + q
					i = w + 8
					if (c >= g) {
						continue
					}
				}
				j = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
			}
			st64(f + 8, j)
			st64(f, 0x8000000000000000)
			if (ld64(s30) == 0) {
				return r0
			}
			return fn_83078(r0)
		}
		st64(f + 0x10, ld64(s30 + 0x10))
		st64(f + 8, ld64(s30 + 8))
		st64(f, ld64(s30))
		st64(f + 0x18, g)
		return r0
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value), a (points to it)
export function fn_125850(a: u64, b: u64, c: u64, r0: u64): u64 {
	const s20 = fp - 0x20
	let g = fn_1253c0(s20, b, c, r0)
	const h = ld64(s20 + 8)
	const f = ld64(s20)
	if (f == 0x8000000000000000) {
		const j = ld64(s20 + 0x18)
		const i = ld64(s20 + 0x10)
		if (h != 0x800000000000001a /* Ok */) {
			st64(a + 0x10, j)
			st64(a + 8, i)
			st64(a, h)
			return g
		}
		st64(a + 0x10, c)
		st64(a + 8, b)
		st64(a, 0x800000000000001a /* Ok */)
		return g
	}
	if (f == 0) {
		st64(a + 0x10, c)
		st64(a + 8, b)
		st64(a, 0x800000000000001a /* Ok */)
		return g
	}
	g = fn_83078(g)
	st64(a + 0x10, c)
	st64(a + 8, b)
	st64(a, 0x800000000000001a /* Ok */)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
export function fn_1269b8(a: u64, b: u64, c: u64): u64 {
	const s30 = fp - 0x30, s60 = fp - 0x60, s70 = fp - 0x70, s88 = fp - 0x88, s90 = fp - 0x90, sa8 = fp - 0xa8, sc0 = fp - 0xc0, sf0 = fp - 0xf0, s108 = fp - 0x108, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s1000 = fp - 0x1000
	let j, n, o, p: u64
	const h = ld64(b + 0x78)
	const g = ld64(b + 0x48)
	const f = ld64(b + 0xa8)
	st64(s1000, f, 8, 0, c)
	fn_1343e0(s90, 0x1001520e0 /* &TOKEN_PROGRAM */, g, h, f, 8, 0, c)
	copy(sc0, s88, 0x18)
	let i = ld64(s90)
	if (i == 0x8000000000000000) {
		let r = fn_13b430(s130, sc0)
		j = ld64(s130 + 8)
		p = ld64(s130)
		const s = ld64(b + 0x58)
		const q = ld64(b + 0x50)
		if (rc_release(q)) {
			if (rc_release(q + 8)) {
				r = fn_83078(r)
			}
		}
		if (rc_release(s)) {
			if (rc_release(s + 8)) {
				r = fn_83078(r)
			}
		}
		const u = ld64(b + 0x88)
		const t = ld64(b + 0x80)
		if (rc_release(t)) {
			if (rc_release(t + 8)) {
				r = fn_83078(r)
			}
		}
		if (rc_release(u)) {
			if (rc_release(u + 8)) {
				r = fn_83078(r)
			}
		}
		const w = ld64(b + 0xb8)
		const v = ld64(b + 0xb0)
		if (rc_release(v)) {
			if (rc_release(v + 8)) {
				r = fn_83078(r)
			}
		}
		if (rc_release(w)) {
			if (rc_release(w + 8)) {
				r = fn_83078(r)
			}
		}
		n = ptr_drop_in_place_126088(b, r)
		o = ld64(b + 0x28)
		const x = ld64(b + 0x20)
		if (rc_release(x)) {
			if (rc_release(x + 8)) {
				n = fn_83078(n)
			}
		}
		if (!rc_release(o)) {
			st64(a + 8, j)
			st64(a, p)
			return n
		}
		if (!rc_release(o + 8)) {
			st64(a + 8, j)
			st64(a, p)
			return n
		}
		n = fn_83078(n)
		st64(a + 8, j)
		st64(a, p)
		return n
	}
	j = b + 0x78
	memcpy(sf0, s70, 0x30)
	st64(s110, i)
	copy(s108, sc0, 0x18)
	memcpy(s90, b + 0x48, 0x30)
	memcpy(s60, j, 0x30)
	memcpy(s30, b + 0xa8, 0x30)
	const k = ld64(b + 0xe0)
	st64(s1000, ld64(b + 0xd8))
	st64(s1000 + 8, k)
	let l = fn_13eea8(sa8, s110, s90, 3, ld64(s1000), k)
	p = 2
	if (ld64(sa8) != 0x800000000000001a /* Ok */) {
		l = fn_13b430(s120, sa8)
		i = ld64(s110)
		j = ld64(s120 + 8)
		p = ld64(s120)
	}
	if (i != 0) {
		l = fn_83078(l)
	}
	if (ld64(s108 + 0x10) != 0) {
		l = fn_83078(l)
	}
	n = ptr_drop_in_place_126088(b, ptr_drop_in_place_125960(s90, l))
	o = ld64(b + 0x28)
	const m = ld64(b + 0x20)
	if (rc_release(m)) {
		if (rc_release(m + 8)) {
			n = fn_83078(n)
		}
	}
	if (!rc_release(o)) {
		st64(a + 8, j)
		st64(a, p)
		return n
	}
	if (!rc_release(o + 8)) {
		st64(a + 8, j)
		st64(a, p)
		return n
	}
	n = fn_83078(n)
	st64(a + 8, j)
	st64(a, p)
	return n
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (points to it)
export function fn_127df0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s38 = fp - 0x38, s50 = fp - 0x50, s80 = fp - 0x80, s98 = fp - 0x98, sa0 = fp - 0xa0, sb8 = fp - 0xb8, se8 = fp - 0xe8, s100 = fp - 0x100, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s140 = fp - 0x140
	let n, u, v, ab, ae: u64
	B26: {
		const f = ld64(b + 0x48)
		fn_132800(sa0, f, ld64(b + 0x18), c, d)
		copy(sb8, s98, 0x18)
		const g = ld64(sa0)
		if (g == 0x8000000000000000) {
			n = fn_13b430(s138, sb8)
			const l = ld64(s138)
			st64(a + 8, ld64(s138 + 8))
			st64(a, l)
			const o = ld64(b + 0x28)
			const m = ld64(b + 0x20)
			if (rc_release(m)) {
				if (rc_release(m + 8)) {
					n = fn_83078(n)
				}
			}
			if (!rc_release(o)) {
				break B26
			}
			if (!rc_release(o + 8)) {
				break B26
			}
		} else {
			st64(s140, a)
			memcpy(se8, s80, 0x30)
			st64(s108, g)
			copy(s100, sb8, 0x18)
			memcpy(sa0, b + 0x18, 0x30)
			let i = fn_13ee80(s50, s108, sa0, 1)
			if (ld64(s50) == 0x800000000000001a /* Ok */) {
				const j = ld64(s98 + 8)
				const h = ld64(s98)
				if (rc_release(h)) {
					if (rc_release(h + 8)) {
						i = fn_83078(i)
					}
				}
				if (rc_release(j)) {
					if (rc_release(j + 8)) {
						fn_83078(i)
					}
				}
				B40: {
					B39: {
						fn_13f890(s38)
						const k = ld64(s38 + 0x20)
						if (k == 0x8000000000000000) {
							ae = 0x8000000000000002 /* Err(ProgramError::InvalidInstructionData) */
						} else {
							const z = ld64(s38)
							const y = ld64(s38 + 8)
							const x = ld64(s38 + 0x10)
							const w = ld64(s38 + 0x18)
							st64(s80 + 0x10, ld64(s38 + 0x30))
							st64(sa0, z, y, x, w)
							const aa = ld64(s38 + 0x28)
							st64(s80 + 8, aa)
							ab = memcmp(sa0, f, 0x20) as u32
							if (ab != 0) {
								ae = 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */
								if (k == 0) {
									break B39
								}
							} else {
								if (ld64(s80 + 0x10) == 8) {
									const ad = ld64(aa)
									if (k != 0) {
										ab = fn_83078(ab)
									}
									const ac = ld64(s140)
									st64(ac + 8, ad)
									st64(ac, 2)
									break B40
								}
								ae = 0x8000000000000002 /* Err(ProgramError::InvalidInstructionData) */
								if (k == 0) {
									break B39
								}
							}
							fn_83078(ab)
						}
					}
					st64(sa0, ae)
					ab = fn_13b430(s128, sa0)
					const ag = ld64(s128)
					const af = ld64(s140)
					st64(af + 8, ld64(s128 + 8))
					st64(af, ag)
				}
				if (ld64(s108) != 0) {
					ab = fn_83078(ab)
				}
				if (ld64(s100 + 0x10) != 0) {
					ab = fn_83078(ab)
				}
				v = ptr_drop_in_place_126088(b, ab)
				u = ld64(b + 0x58)
				const ah = ld64(b + 0x50)
				if (rc_release(ah)) {
					if (rc_release(ah + 8)) {
						v = fn_83078(v)
					}
				}
				if (!rc_release(u)) {
					return v
				}
				if (!rc_release(u + 8)) {
					return v
				}
				return fn_83078(v)
			}
			copyr(s38, s50, 0x18)
			n = fn_13b430(s118, s38)
			const q = ld64(s118)
			const p = ld64(s140)
			st64(p + 8, ld64(s118 + 8))
			st64(p, q)
			const s = ld64(s98 + 8)
			const r = ld64(s98)
			if (rc_release(r)) {
				if (rc_release(r + 8)) {
					n = fn_83078(n)
				}
			}
			if (rc_release(s)) {
				if (rc_release(s + 8)) {
					n = fn_83078(n)
				}
			}
			if (ld64(s108) != 0) {
				n = fn_83078(n)
			}
			if (ld64(s100 + 0x10) == 0) {
				break B26
			}
		}
		n = fn_83078(n)
	}
	v = ptr_drop_in_place_126088(b, n)
	u = ld64(b + 0x58)
	const t = ld64(b + 0x50)
	if (rc_release(t)) {
		if (rc_release(t + 8)) {
			v = fn_83078(v)
		}
	}
	if (!rc_release(u)) {
		return v
	}
	if (rc_release(u + 8)) {
		return fn_83078(v)
	}
	return v
}

export function fn_128fc0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s18 = fp - 0x18, s30 = fp - 0x30, sd0 = fp - 0xd0, sf0 = fp - 0xf0, s110 = fp - 0x110, s136 = fp - 0x136, s156 = fp - 0x156, s196 = fp - 0x196, s1b6 = fp - 0x1b6, s1d7 = fp - 0x1d7, s1f8 = fp - 0x1f8, s248 = fp - 0x248, s258 = fp - 0x258, s278 = fp - 0x278, s2a0 = fp - 0x2a0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let bg: u64
	st64(s2a0 + 0x10, a)
	const j = ld64(b + 0x48)
	const f = ld64(b + 0x78)
	copyr(s110, f, 0x20)
	const g = ld64(b + 0xa8)
	copyr(sf0, g, 0x20)
	const h = ld64(b + 0xd8)
	copyr(s248, h, 0x20)
	const i = ld64(b + 0x108)
	copyr(sd0, i, 0x20)
	const m = ld64(j)
	const l = ld64(j + 8)
	const k = ld64(j + 0x10)
	st64(s1b6 + 0x18, ld64(j + 0x18))
	st64(s1b6, m, l, k)
	copy(s196, s110, 0x40)
	copyr(s156, s248, 0x20)
	copyr(s1d7, sd0, 0x20)
	st8(s1d7 + 0x20, p5)
	st64(s136, 0, 0, 0, 0)
	st8(s1f8, 0)
	memcpy(sd0, c, 0xa0)
	st8(s30 + 0x10, d)
	const n = p6
	copy(s30, n, 0x10)
	fn_12bb90(s248, s1f8, sd0)
	fn_12a2b8(s1f8, b + 0x48)
	let o = ld64(s1f8 + 0x10)
	const p = ld64(s1f8) - o
	st64(s278 + 0x18, ld64(b + 8))
	st64(s2a0 + 0x18, b)
	let q = ld64(b + 0x10)
	if (q > p) {
		fn_126340(s1f8, o, q)
		o = ld64(s1f8 + 0x10)
	}
	st64(s2a0 + 0x20, ld64(s1f8 + 8))
	if (q != 0) {
		st64(s278, ld64(s2a0 + 0x20) + o * 0x30)
		let s = 0
		do {
			const ab = ld64(s278 + 0x18) + s
			const x = ld64(ab + 8)
			const y = ld64(ab)
			rc_inc(x)
			const r = ld64(ld64(s278 + 0x18) + s + 0x10)
			rc_inc(r)
			const u = ld64(s278) + s
			const t: AccountInfo = ld64(s278 + 0x18) + s
			st64(s278 + 0x10, t.owner)
			st64(s278 + 8, t.rent_epoch)
			const w = t.is_signer
			const v = t.is_writable
			st8(u + 0x2a, t.executable)
			st8(u + 0x29, v)
			st8(u + 0x28, w)
			st64(u + 0x20, ld64(s278 + 8))
			st64(u + 0x18, ld64(s278 + 0x10))
			st64(u + 0x10, r)
			st64(u + 8, x)
			st64(u, y)
			s = s + 0x30
			o = o + 1
			q = q - 1
		} while (q != 0)
	}
	st64(s1f8 + 0x10, o)
	const z = ld64(s2a0 + 0x18)
	const aa = ld64(z + 0x20)
	let ae = ld64(z + 0x18)
	rc_inc(aa)
	let ac = ld64(z + 0x28)
	const ad = ld64(ac)
	st64(ac, ad + 1)
	if (ad != -1) {
		st64(s278 + 0x10, ld8(z + 0x42))
		st64(s278 + 0x18, ld8(z + 0x41))
		let ah = ld8(z + 0x40)
		let ag = ld64(z + 0x38)
		let af = ld64(z + 0x30)
		if (o == ld64(s1f8)) {
			st64(s278, af, ae)
			st64(s2a0, ah, ag)
			fn_1264b0(s1f8, ad + 1)
			ah = ld64(s2a0)
			ag = ld64(s2a0 + 8)
			af = ld64(s278)
			ae = ld64(s278 + 8)
			st64(s2a0 + 0x20, ld64(s1f8 + 8))
		}
		const ai = ld64(s2a0 + 0x20) + o * 0x30
		st8(ai + 0x2a, ld64(s278 + 0x10))
		st8(ai + 0x29, ld64(s278 + 0x18))
		st8(ai + 0x28, ah)
		st64(ai + 0x20, ag)
		st64(ai + 0x18, af)
		st64(ai + 0x10, ac)
		st64(ai + 8, aa)
		st64(ai, ae)
		st64(sd0, ld64(s1f8))
		const aj = o + 1
		st64(sd0 + 0x10, aj)
		const ak = ld64(s1f8 + 8)
		st64(sd0 + 8, ak)
		const al = ld64(z + 0x1a0)
		st64(s1000, ld64(z + 0x198))
		st64(sff8, al)
		let am = fn_13eea8(s18, s248, ak, aj, ld64(s1000), al)
		let bh = 2
		if (ld64(s18) != 0x800000000000001a /* Ok */) {
			am = fn_13b430(s258, s18)
			ac = ld64(s258 + 8)
			bh = ld64(s258)
		}
		if (ld64(s248) != 0) {
			am = fn_83078(am)
		}
		if (ld64(s248 + 0x18) != 0) {
			am = fn_83078(am)
		}
		let ao = ptr_drop_in_place_126088(sd0, am)
		const ap = ld64(z + 0x58)
		const an = ld64(z + 0x50)
		if (rc_release(an)) {
			if (rc_release(an + 8)) {
				ao = fn_83078(ao)
			}
		}
		if (rc_release(ap)) {
			if (rc_release(ap + 8)) {
				ao = fn_83078(ao)
			}
		}
		const ar = ld64(z + 0x88)
		const aq = ld64(z + 0x80)
		if (rc_release(aq)) {
			if (rc_release(aq + 8)) {
				ao = fn_83078(ao)
			}
		}
		if (rc_release(ar)) {
			if (rc_release(ar + 8)) {
				ao = fn_83078(ao)
			}
		}
		const au = ld64(z + 0xb8)
		const at = ld64(z + 0xb0)
		if (rc_release(at)) {
			if (rc_release(at + 8)) {
				ao = fn_83078(ao)
			}
		}
		if (rc_release(au)) {
			if (rc_release(au + 8)) {
				ao = fn_83078(ao)
			}
		}
		const aw = ld64(z + 0xe8)
		const av = ld64(z + 0xe0)
		if (rc_release(av)) {
			if (rc_release(av + 8)) {
				ao = fn_83078(ao)
			}
		}
		if (rc_release(aw)) {
			if (rc_release(aw + 8)) {
				ao = fn_83078(ao)
			}
		}
		const ay = ld64(z + 0x118)
		const ax = ld64(z + 0x110)
		if (rc_release(ax)) {
			if (rc_release(ax + 8)) {
				ao = fn_83078(ao)
			}
		}
		if (rc_release(ay)) {
			if (rc_release(ay + 8)) {
				ao = fn_83078(ao)
			}
		}
		const ba = ld64(z + 0x148)
		const az = ld64(z + 0x140)
		if (rc_release(az)) {
			if (rc_release(az + 8)) {
				ao = fn_83078(ao)
			}
		}
		if (rc_release(ba)) {
			if (rc_release(ba + 8)) {
				ao = fn_83078(ao)
			}
		}
		const bc = ld64(z + 0x178)
		const bb = ld64(z + 0x170)
		if (rc_release(bb)) {
			if (rc_release(bb + 8)) {
				ao = fn_83078(ao)
			}
		}
		if (rc_release(bc)) {
			if (rc_release(bc + 8)) {
				ao = fn_83078(ao)
			}
		}
		let be = ptr_drop_in_place_126088(z, ao)
		const bf = ld64(z + 0x28)
		const bd = ld64(z + 0x20)
		if (rc_release(bd)) {
			if (rc_release(bd + 8)) {
				be = fn_83078(be)
			}
		}
		if (!rc_release(bf)) {
			bg = ld64(s2a0 + 0x10)
			st64(bg + 8, ac)
			st64(bg, bh)
			return be
		}
		if (!rc_release(bf + 8)) {
			bg = ld64(s2a0 + 0x10)
			st64(bg + 8, ac)
			st64(bg, bh)
			return be
		}
		be = fn_83078(be)
		bg = ld64(s2a0 + 0x10)
		st64(bg + 8, ac)
		st64(bg, bh)
		return be
	}
	abort()
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), c (value), d (value)
export function fn_129f28(a: u64, b: u64, c: u64, d: u64): u64 {
	const s18 = fp - 0x18, s68 = fp - 0x68, s78 = fp - 0x78, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let g = ld64(b + 8)
	let f = ld64(b + 0x10)
	if (f != 0) {
		const s = g
		const h = f
		const i = __rust_alloc(f << 3, 8)
		if (i == 0) {
			raw_vec_handle_error(8, h << 3)
		}
		let j = s
		let k = i
		let l = f
		while (true) {
			st64(k, ld64(j))
			j = j + 0x30
			k = k + 8
			l = l - 1
			if (l == 0) {
				fn_83078(fn_136a70(s68, c, d, i, f))
				g = s
				break
			}
		}
	} else {
		fn_136a70(s68, c, d, 8, 0)
	}
	const m = ld64(b + 0x50)
	st64(s1000, ld64(b + 0x48))
	st64(sff8, m)
	let n = fn_13eea8(s18, s68, g, f, ld64(s1000), m)
	let r = 2
	if (ld64(s18) != 0x800000000000001a /* Ok */) {
		n = fn_13b430(s78, s18)
		f = ld64(s78 + 8)
		r = ld64(s78)
	}
	if (ld64(s68) != 0) {
		n = fn_83078(n)
	}
	if (ld64(s68 + 0x18) != 0) {
		n = fn_83078(n)
	}
	let p = ptr_drop_in_place_126088(b, n)
	const q = ld64(b + 0x28)
	const o = ld64(b + 0x20)
	if (rc_release(o)) {
		if (rc_release(o + 8)) {
			p = fn_83078(p)
		}
	}
	if (!rc_release(q)) {
		st64(a + 8, f)
		st64(a, r)
		return p
	}
	if (!rc_release(q + 8)) {
		st64(a + 8, f)
		st64(a, r)
		return p
	}
	p = fn_83078(p)
	st64(a + 8, f)
	st64(a, r)
	return p
}

export function fn_12a2b8(a: u64, b: u64) {
	const s18 = fp - 0x18, s30 = fp - 0x30, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48, s50 = fp - 0x50
	let aw: u64
	st64(s48, a)
	st64(s30, 0, 8, 0)
	st64(s40, b)
	fn_13ac38(s18, b)
	let h = 0
	let i = 8
	const g = ld64(s18 + 8)
	const k = ld64(s18)
	const f = ld64(s18 + 0x10)
	if (f != 0) {
		fn_126340(s30, 0, f)
		i = ld64(s30 + 8)
		h = ld64(s30 + 0x10)
	}
	st64(s50, g)
	st64(s38, i)
	const l = memcpy(i + h * 0x30, g, f * 0x30)
	let j = h + f
	st64(s30 + 0x10, j)
	if (k != 0) {
		fn_83078(l)
	}
	fn_13ac38(s18, ld64(s40) + 0x30)
	const n = ld64(s18 + 8)
	const q = ld64(s18)
	const m = ld64(s18 + 0x10)
	let o = ld64(s38)
	if (m > ld64(s30) - j) {
		fn_126340(s30, j, m, n)
		o = ld64(s30 + 8)
		j = ld64(s30 + 0x10)
	}
	st64(s38, o)
	const r = memcpy(o + j * 0x30, n, m * 0x30)
	let p = j + m
	st64(s30 + 0x10, p)
	if (q != 0) {
		fn_83078(r)
	}
	fn_13ac38(s18, ld64(s40) + 0x60)
	const t = ld64(s18 + 8)
	const w = ld64(s18)
	const s = ld64(s18 + 0x10)
	let u = ld64(s38)
	if (s > ld64(s30) - p) {
		fn_126340(s30, p, s, t)
		u = ld64(s30 + 8)
		p = ld64(s30 + 0x10)
	}
	st64(s38, u)
	const x = memcpy(u + p * 0x30, t, s * 0x30)
	let v = p + s
	st64(s30 + 0x10, v)
	if (w != 0) {
		fn_83078(x)
	}
	fn_13ac38(s18, ld64(s40) + 0x90)
	const z = ld64(s18 + 8)
	const ac = ld64(s18)
	const y = ld64(s18 + 0x10)
	let aa = ld64(s38)
	if (y > ld64(s30) - v) {
		fn_126340(s30, v, y, z)
		aa = ld64(s30 + 8)
		v = ld64(s30 + 0x10)
	}
	st64(s38, aa)
	const ad = memcpy(aa + v * 0x30, z, y * 0x30)
	let ab = v + y
	st64(s30 + 0x10, ab)
	if (ac != 0) {
		fn_83078(ad)
	}
	fn_13ac38(s18, ld64(s40) + 0xc0)
	const af = ld64(s18 + 8)
	const ai = ld64(s18)
	const ae = ld64(s18 + 0x10)
	let ag = ld64(s38)
	if (ae > ld64(s30) - ab) {
		fn_126340(s30, ab, ae, af)
		ag = ld64(s30 + 8)
		ab = ld64(s30 + 0x10)
	}
	st64(s38, ag)
	const aj = memcpy(ag + ab * 0x30, af, ae * 0x30)
	let ah = ab + ae
	st64(s30 + 0x10, ah)
	if (ai != 0) {
		fn_83078(aj)
	}
	fn_13ac38(s18, ld64(s40) + 0xf0)
	const al = ld64(s18 + 8)
	const ao = ld64(s18)
	const ak = ld64(s18 + 0x10)
	let am = ld64(s38)
	if (ak > ld64(s30) - ah) {
		fn_126340(s30, ah, ak, al)
		am = ld64(s30 + 8)
		ah = ld64(s30 + 0x10)
	}
	st64(s38, am)
	const ap = memcpy(am + ah * 0x30, al, ak * 0x30)
	let an = ah + ak
	st64(s30 + 0x10, an)
	if (ao != 0) {
		fn_83078(ap)
	}
	fn_13ac38(s18, ld64(s40) + 0x120)
	const ar = ld64(s18 + 8)
	const au = ld64(s18)
	const aq = ld64(s18 + 0x10)
	let at = ld64(s38)
	if (aq > ld64(s30) - an) {
		fn_126340(s30, an, aq)
		at = ld64(s30 + 8)
		an = ld64(s30 + 0x10)
	}
	st64(s40, ar)
	const av = memcpy(at + an * 0x30, ar, aq * 0x30)
	st64(s30 + 0x10, an + aq)
	if (au == 0) {
		aw = ld64(s48)
		st64(aw + 0x10, ld64(s30 + 0x10))
		st64(aw + 8, ld64(s30 + 8))
		st64(aw, ld64(s30))
	} else {
		fn_83078(av)
		aw = ld64(s48)
		st64(aw + 0x10, ld64(s30 + 0x10))
		st64(aw + 8, ld64(s30 + 8))
		st64(aw, ld64(s30))
	}
}

export function fn_12b1c8(a: u64, b: u64) {
	const s18 = fp - 0x18
	let i, j: u64
	const f = __rust_alloc(0x400, 1)
	if (f == 0) {
		raw_vec_handle_error(1, 0x400)
	}
	st64(s18, 0x400, f, 0)
	const g = DataV2_serialize(b, s18)
	if (g != 0) {
		st64(a, 0x8000000000000000, g)
		if (ld64(s18) != 0) {
			fn_83078(g)
		}
	} else {
		const l = ld8(b + 0xb0)
		let h = ld64(s18 + 0x10)
		if (ld64(s18) == h) {
			fn_12adb8(s18, h, 1, i, j)
			h = ld64(s18 + 0x10)
		}
		let k = ld64(s18 + 8)
		st8(k + h, l)
		let m = h + 1
		st64(s18 + 0x10, m)
		if (ld8(b + 0xa0) != 2) {
			let n = ld64(s18)
			if (n == m) {
				fn_12adb8(s18, m, 1, i, j)
				n = undef
				k = ld64(s18 + 8)
				m = ld64(s18 + 0x10)
			}
			st8(k + m, 1)
			st64(s18 + 0x10, m + 1)
			CollectionDetails_serialize(b + 0xa0, s18, n, i, j)
			st64(a + 0x10, ld64(s18 + 0x10))
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
		} else if (ld64(s18) != m) {
			st8(k + m, 0)
			st64(s18 + 0x10, m + 1)
			st64(a + 0x10, ld64(s18 + 0x10))
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
		} else {
			fn_12adb8(s18, m, 1, i, j)
			m = ld64(s18 + 0x10)
			st8(ld64(s18 + 8) + m, 0)
			st64(s18 + 0x10, m + 1)
			st64(a + 0x10, ld64(s18 + 0x10))
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
		}
	}
}

export function fn_12bb90(a: u64, b: u64, c: u64) {
	fn_12bbb0(a, b, c, 1, 0)
}

export function fn_12bbb0(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s8 = fp - 0x8, s20 = fp - 0x20, s38 = fp - 0x38, s50 = fp - 0x50
	let f = e
	const t = d
	let g = b
	let j = 1
	let h = e + 7
	const ai = b
	if (h != 0) {
		const i = h
		if (h > 0x3c3c3c3c3c3c3c3) {
			raw_vec_handle_error(0, i * 0x22, g, d, e)
		}
		j = __rust_alloc(i * 0x22, 1)
		b = undef
		g = undef
		d = undef
		e = undef
		if (j == 0) {
			raw_vec_handle_error(1, i * 0x22, g, d, e)
		}
		g = ai
	}
	st64(s50 + 8, j)
	const k = g
	st64(s50, h)
	st64(s50 + 0x10, 0)
	if (h == 0) {
		fn_12b068(s50, b)
		b = undef
		d = undef
		e = undef
		g = ai
		h = ld64(s50)
		j = ld64(s50 + 8)
	}
	st64(j + 0x18, ld64(k + 0x5a))
	st64(j + 0x10, ld64(k + 0x52))
	st64(j + 8, ld64(k + 0x4a))
	st64(j, ld64(k + 0x42))
	st16(j + 0x20, 0x100)
	const l = g
	st64(s50 + 0x10, 1)
	if (h == 1) {
		fn_12b068(s50, b)
		b = undef
		d = undef
		e = undef
		g = ai
		h = ld64(s50)
		j = ld64(s50 + 8)
	}
	st64(j + 0x3a, ld64(l + 0x7a))
	st64(j + 0x32, ld64(l + 0x72))
	st64(j + 0x2a, ld64(l + 0x6a))
	st64(j + 0x22, ld64(l + 0x62))
	st16(j + 0x42, 0)
	const m = g
	st64(s50 + 0x10, 2)
	if (h == 2) {
		fn_12b068(s50, b)
		b = undef
		d = undef
		e = undef
		g = ai
		h = ld64(s50)
		j = ld64(s50 + 8)
	}
	st64(j + 0x5c, ld64(m + 0x9a))
	st64(j + 0x54, ld64(m + 0x92))
	st64(j + 0x4c, ld64(m + 0x8a))
	st64(j + 0x44, ld64(m + 0x82))
	st16(j + 0x64, 1)
	const n = g
	st64(s50 + 0x10, 3)
	if (h == 3) {
		fn_12b068(s50, b)
		d = undef
		e = undef
		g = ai
		h = ld64(s50)
		j = ld64(s50 + 8)
	}
	st64(j + 0x7e, ld64(n + 0xba))
	st64(j + 0x76, ld64(n + 0xb2))
	st64(j + 0x6e, ld64(n + 0xaa))
	st64(j + 0x66, ld64(n + 0xa2))
	st16(j + 0x86, 0x101)
	const o = g
	st64(s50 + 0x10, 4)
	const p = ld8(g + 0x41)
	if (h == 4) {
		fn_12b068(s50, p)
		d = undef
		e = undef
		g = ai
		h = ld64(s50)
		j = ld64(s50 + 8)
	}
	st64(j + 0xa0, ld64(o + 0x39))
	st64(j + 0x98, ld64(o + 0x31))
	st64(j + 0x90, ld64(o + 0x29))
	st64(j + 0x88, ld64(o + 0x21))
	st8(j + 0xa8, p, 0)
	const q = g
	st64(s50 + 0x10, 5)
	if (h == 5) {
		fn_12b068(s50, p)
		d = undef
		e = undef
		g = ai
		h = ld64(s50)
		j = ld64(s50 + 8)
	}
	st64(j + 0xc2, ld64(q + 0xda))
	st64(j + 0xba, ld64(q + 0xd2))
	st64(j + 0xb2, ld64(q + 0xca))
	st64(j + 0xaa, ld64(q + 0xc2))
	st16(j + 0xca, 0)
	let s = 6
	st64(s50 + 0x10, 6)
	if (ld8(g) != 0) {
		const r = g + 1
		if (h == 6) {
			fn_12b068(s50, 6)
			d = undef
			e = undef
			h = ld64(s50)
			j = ld64(s50 + 8)
		}
		st64(j + 0xe4, ld64(r + 0x18))
		st64(j + 0xdc, ld64(r + 0x10))
		st64(j + 0xd4, ld64(r + 8))
		st64(j + 0xcc, ld64(r))
		st16(j + 0xec, 0)
		s = 7
		st64(s50 + 0x10, 7)
	}
	if (f > h - s) {
		fn_12af00(s50, s, f, d, e)
		j = ld64(s50 + 8)
		s = ld64(s50 + 0x10)
	}
	if (f != 0) {
		let u = t + 0x21
		let v = s * 0x22 + j + 0x20
		do {
			const aa = ld64(u - 0x21)
			const z = ld64(u - 0x19)
			const y = ld64(u - 0x11)
			const x = ld64(u - 9)
			const w = ld8(u)
			st8(v, ld8(u - 1))
			st8(v + 1, w)
			st64(v - 8, x)
			st64(v - 0x10, y)
			st64(v - 0x18, z)
			st64(v - 0x20, aa)
			v = v + 0x22
			u = u + 0x22
			s = s + 1
			f = f - 1
		} while (f != 0)
	}
	st64(s50 + 0x10, s)
	const ab = __rust_alloc(0x400, 1)
	let ac = ab
	if (ab == 0) {
		raw_vec_handle_error(1, 0x400)
	}
	st8(ac, 0x21)
	st64(s38, 0x400, ac, 1)
	fn_12b1c8(s20, c)
	const ad = ld64(s20)
	if (ad == 0x8000000000000000) {
		st64(s8, ld64(s20 + 8))
		fn_149678(0x100155dfc /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s8, 0x10015aa60, 0x10015aa80)
	}
	let ag = 1
	const af = ld64(s20 + 8)
	const ae = ld64(s20 + 0x10)
	if (ae >= 0x400) {
		fn_12adb8(s38, 1, ae)
		ac = ld64(s38 + 8)
		ag = ld64(s38 + 0x10)
	}
	let ah = memcpy(ac + ag, af, ae)
	st64(s38 + 0x10, ag + ae)
	st64(a + 0x10, ld64(s50 + 0x10))
	st64(a + 8, ld64(s50 + 8))
	st64(a, ld64(s50))
	copy(a + 0x18, s38, 0x18)
	st64(a + 0x48, 0x4629f803bcd1b649 /* TOKEN_METADATA_PROGRAM[3] */)
	st64(a + 0x40, 0xb5fda01a736cb858 /* TOKEN_METADATA_PROGRAM[2] */)
	st64(a + 0x38, 0xcdc3046b7f529d38 /* TOKEN_METADATA_PROGRAM[1] */)
	st64(a + 0x30, 0x457cd1e3b165700b /* TOKEN_METADATA_PROGRAM */)
	if (ad != 0) {
		ah = fn_83078(ah)
	}
	if (ld64(c) != 0) {
		void ld64(c + 8)
		ah = fn_83078(ah)
	}
	if (ld64(c + 0x18) != 0) {
		void ld64(c + 0x20)
		ah = fn_83078(ah)
	}
	if (ld64(c + 0x30) != 0) {
		void ld64(c + 0x38)
		ah = fn_83078(ah)
	}
	if ((ld64(c + 0x48) | 0x8000000000000000) != 0x8000000000000000) {
		void ld64(c + 0x50)
		fn_83078(ah)
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
export function fn_12db08(a: u64, b: u64, c: u64, r0: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	if (c == 0) {
		st64(a + 8, 0)
		st64(a, 1)
		return r0
	}
	const f = ld16(b + 0x10)
	if (f == 0) {
		st64(a + 8, 0)
		st64(a, 1)
		return r0
	}
	r0 = __multi3(s10, f, 0, c, 0)
	const g = ld64(s10 + 8)
	const h = ld64(s10)
	if ((g != 0x270f ? g > 0x270f : h > 0xffffffffffffd8f0) != 0) {
		st64(a + 8, g > 0x270f)
		st64(a, 0)
		return r0
	}
	r0 = __udivti3(s20, h + 0x270f, g + (h > h + 0x270f), 0x2710, 0, 1)
	st64(a + 8, min(ld64(s20), ld64(b + 8)))
	st64(a, 1)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
export function fn_12dc70(a: u64, b: u64, c: u64, r0: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s58 = fp - 0x58
	let h: u64
	if (c == 0) {
		st64(a + 8, 0)
		st64(a, 1)
		return r0
	}
	const f = ld16(b + 0x10)
	if (f == 0) {
		st64(a + 8, 0)
		st64(a, 1)
		return r0
	}
	let g = ld64(b + 8)
	if (f != 0x2710) {
		if (f >= 0x2711) {
			st64(a + 8, 0)
			st64(a, 0)
			return r0
		}
		st64(s58, c, a, g)
		__multi3(s10, c, 0, 0x2710, 0)
		const i = ld64(s10)
		const j = i - f + 0x270f
		r0 = __udivti3(s20, j, ld64(s10 + 8) - (f > i) + (i - f > j), 0x2710 - f, -(f > 0x2710), 0)
		h = ld64(s20)
		const k = ld64(s58)
		const l = ld64(s20 + 8)
		a = ld64(s58 + 8)
		if ((l != 0 ? 0 : k > h) != 0) {
			st64(a + 8, 0)
			st64(a, 0)
			return r0
		}
		r0 = k > h
		let m = ld64(s58 + 0x10) > h - k
		m = l - r0 != 0 ? 0 : m
		if ((m & 1) != 0) {
			g = ld64(s58 + 0x10)
			if (l != 0) {
				st64(a + 8, 0)
				st64(a, 0)
				return r0
			}
		} else {
			g = ld64(s58 + 0x10)
			h = k + g
			if (k > h) {
				st64(a + 8, 0)
				st64(a, 0)
				return r0
			}
		}
	} else {
		h = g + c
		if (g > h) {
			st64(a + 8, 0)
			st64(a, 0)
			return r0
		}
	}
	if (h == 0) {
		st64(a + 8, 0)
		st64(a, 1)
		return r0
	}
	st64(s58 + 0x10, g)
	const p = a
	r0 = __multi3(s30, h, 0, f, 0)
	const n = ld64(s30 + 8)
	const o = ld64(s30)
	if ((n != 0x270f ? n > 0x270f : o > 0xffffffffffffd8f0) != 0) {
		st64(a + 8, 0)
		st64(a, 0)
		return r0
	}
	r0 = __udivti3(s40, o + 0x270f, n + (o > o + 0x270f), 0x2710, 0, 0)
	st64(p + 8, min(ld64(s40), ld64(s58 + 0x10)))
	st64(p, 1)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (points to it)
export function fn_12e9c0(a: u64, b: u64): u64 {
	const s18 = fp - 0x18
	let n, o: u64
	let f = __rust_alloc(0x50, 1)
	if (f == 0) {
		raw_vec_handle_error(1, 0x50, undef, n, o)
	}
	B73: {
		st64(s18, 0x50, f)
		const g = ld32(b)
		if (0x15 >= (g as i64)) {
			if ((g as i64) > 0xa) {
				if (0xf >= (g as i64)) {
					if ((g as i64) > 0xc) {
						if (g == 0xd) {
							const v = ld64(b + 8)
							st8(f + 9, ld8(b + 0x10))
							st64(f + 1, v)
							st8(f, 0xd)
							st64(s18 + 0x10, 0xa)
							st64(a + 0x10, ld64(s18 + 0x10))
							st64(a + 8, ld64(s18 + 8))
							st64(a, ld64(s18))
							return f
						}
						if (g == 0xe) {
							const z = ld64(b + 8)
							st8(f + 9, ld8(b + 0x10))
							st64(f + 1, z)
							st8(f, 0xe)
							st64(s18 + 0x10, 0xa)
							st64(a + 0x10, ld64(s18 + 0x10))
							st64(a + 8, ld64(s18 + 8))
							st64(a, ld64(s18))
							return f
						}
						const p = ld64(b + 8)
						st8(f + 9, ld8(b + 0x10))
						st64(f + 1, p)
						st8(f, 0xf)
						st64(s18 + 0x10, 0xa)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					if (g == 0xb) {
						st8(f, 0xb)
						st64(s18 + 0x10, 1)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					const h = ld64(b + 8)
					st8(f + 9, ld8(b + 0x10))
					st64(f + 1, h)
					st8(f, 0xc)
					st64(s18 + 0x10, 0xa)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				if (0x12 >= (g as i64)) {
					if (g == 0x10) {
						st8(f, 0x10)
						break B73
					}
					if (g == 0x11) {
						st8(f, 0x11)
						st64(s18 + 0x10, 1)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					st8(f, 0x12)
					break B73
				}
				if (g == 0x13) {
					st8(f + 1, ld8(b + 8))
					st8(f, 0x13)
					st64(s18 + 0x10, 2)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				if (g != 0x14) {
					st8(f, 0x15)
					st64(s18 + 0x10, 1)
					const q = ld64(b + 0x18)
					if (q == 0) {
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					let r = ld64(b + 0x10)
					let s = 1
					let u = q << 1
					while (true) {
						const t = ld16(r)
						if (1 >= ld64(s18) - s) {
							f = fn_12cf58(s18, s, 2, n, o, f)
							s = ld64(s18 + 0x10)
						}
						r = r + 2
						st16(ld64(s18 + 8) + s, t)
						s = s + 2
						st64(s18 + 0x10, s)
						u = u - 2
						if (u == 0) {
							st64(a + 0x10, ld64(s18 + 0x10))
							st64(a + 8, ld64(s18 + 8))
							st64(a, ld64(s18))
							return f
						}
					}
				}
				st8(f + 1, ld8(b + 8))
				st8(f, 0x14)
				st64(f + 0x1a, ld64(b + 0x21))
				st64(f + 0x12, ld64(b + 0x19))
				st64(f + 0xa, ld64(b + 0x11))
				st64(f + 2, ld64(b + 9))
				if (ld32(b + 0x2c) == 0) {
					st8(f + 0x22, 0)
					st64(s18 + 0x10, 0x23)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
			} else {
				if ((g as i64) > 4) {
					if ((g as i64) > 7) {
						if (g == 8) {
							st64(f + 1, ld64(b + 8))
							st8(f, 8)
							st64(s18 + 0x10, 9)
							st64(a + 0x10, ld64(s18 + 0x10))
							st64(a + 8, ld64(s18 + 8))
							st64(a, ld64(s18))
							return f
						}
						if (g == 9) {
							st8(f, 9)
							st64(s18 + 0x10, 1)
							st64(a + 0x10, ld64(s18 + 0x10))
							st64(a + 8, ld64(s18 + 8))
							st64(a, ld64(s18))
							return f
						}
						st8(f, 0xa)
						st64(s18 + 0x10, 1)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					if (g == 5) {
						st8(f, 5)
						st64(s18 + 0x10, 1)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					if (g == 6) {
						st8(f, 6)
						st8(f + 1, ld8(b + 8))
						if (ld32(b + 0xc) != 0) {
							st8(f + 2, 1)
							copy(f + 3, b + 0x10, 0x20)
							st64(s18 + 0x10, 0x23)
							st64(a + 0x10, ld64(s18 + 0x10))
							st64(a + 8, ld64(s18 + 8))
							st64(a, ld64(s18))
							return f
						}
						st8(f + 2, 0)
						st64(s18 + 0x10, 3)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					st64(f + 1, ld64(b + 8))
					st8(f, 7)
					st64(s18 + 0x10, 9)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				if ((g as i64) > 1) {
					if (g == 2) {
						st8(f + 1, ld8(b + 8))
						st8(f, 2)
						st64(s18 + 0x10, 2)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					if (g == 3) {
						st64(f + 1, ld64(b + 8))
						st8(f, 3)
						st64(s18 + 0x10, 9)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					st64(f + 1, ld64(b + 8))
					st8(f, 4)
					st64(s18 + 0x10, 9)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				if (g != 0) {
					st8(f, 1)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				st8(f + 1, ld8(b + 8))
				st8(f, 0)
				st64(f + 0x1a, ld64(b + 0x21))
				st64(f + 0x12, ld64(b + 0x19))
				st64(f + 0xa, ld64(b + 0x11))
				st64(f + 2, ld64(b + 9))
				if (ld32(b + 0x2c) == 0) {
					st8(f + 0x22, 0)
					st64(s18 + 0x10, 0x23)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
			}
			st8(f + 0x22, 1)
			copy(f + 0x23, b + 0x30, 0x20)
			st64(s18 + 0x10, 0x43)
			st64(a + 0x10, ld64(s18 + 0x10))
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return f
		}
		if (0x20 >= (g as i64)) {
			if ((g as i64) > 0x1a) {
				if ((g as i64) > 0x1d) {
					if (g == 0x1e) {
						st8(f, 0x1e)
						st64(s18 + 0x10, 1)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					if (g == 0x1f) {
						st8(f, 0x1f)
						st64(s18 + 0x10, 1)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					st8(f, 0x20)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				if (g == 0x1b) {
					st8(f, 0x1b)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				if (g == 0x1c) {
					st8(f, 0x1c)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				st8(f, 0x1d)
				st64(s18 + 0x10, 1)
				const i = ld64(b + 0x18)
				if (i == 0) {
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				let j = ld64(b + 0x10)
				let k = 1
				let m = i << 1
				while (true) {
					const l = ld16(j)
					if (1 >= ld64(s18) - k) {
						f = fn_12cf58(s18, k, 2, n, o, f)
						k = ld64(s18 + 0x10)
					}
					j = j + 2
					st16(ld64(s18 + 8) + k, l)
					k = k + 2
					st64(s18 + 0x10, k)
					m = m - 2
					if (m == 0) {
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
				}
			}
			if ((g as i64) > 0x17) {
				if (g == 0x18) {
					st8(f, 0x18)
					st64(s18 + 0x10, 1)
					const x = ld64(b + 8)
					const w = ld64(b + 0x10)
					if (0x50 > w) {
						f = memcpy(f + 1, x, w)
						st64(s18 + 0x10, w + 1)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					fn_12cf58(s18, 1, w, n, o, f)
					const y = ld64(s18 + 0x10)
					f = memcpy(ld64(s18 + 8) + y, x, w)
					st64(s18 + 0x10, y + w)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				if (g == 0x19) {
					st8(f, 0x19)
					if (ld32(b + 8) != 0) {
						st8(f + 1, 1)
						copy(f + 2, b + 0xc, 0x20)
						st64(s18 + 0x10, 0x22)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					st8(f + 1, 0)
					st64(s18 + 0x10, 2)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				st8(f, 0x1a)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, ld64(s18 + 0x10))
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return f
			}
			if (g == 0x16) {
				st8(f, 0x16)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, ld64(s18 + 0x10))
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return f
			}
			st64(f + 1, ld64(b + 8))
			st8(f, 0x17)
			st64(s18 + 0x10, 9)
			st64(a + 0x10, ld64(s18 + 0x10))
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return f
		}
		if ((g as i64) > 0x26) {
			if ((g as i64) > 0x29) {
				if (g == 0x2a) {
					st8(f, 0x2a)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				if (g == 0x2b) {
					st8(f, 0x2b)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				st8(f, 0x2c)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, ld64(s18 + 0x10))
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return f
			}
			if (g == 0x27) {
				st8(f, 0x27)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, ld64(s18 + 0x10))
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return f
			}
			if (g == 0x28) {
				st8(f, 0x28)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, ld64(s18 + 0x10))
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return f
			}
			st8(f, 0x29)
			st64(s18 + 0x10, 1)
			st64(a + 0x10, ld64(s18 + 0x10))
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return f
		}
		if ((g as i64) > 0x23) {
			if (g == 0x24) {
				st8(f, 0x24)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, ld64(s18 + 0x10))
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return f
			}
			if (g == 0x25) {
				st8(f, 0x25)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, ld64(s18 + 0x10))
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return f
			}
			st8(f, 0x26)
			st64(s18 + 0x10, 1)
			st64(a + 0x10, ld64(s18 + 0x10))
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return f
		}
		if (g == 0x21) {
			st8(f, 0x21)
			st64(s18 + 0x10, 1)
			st64(a + 0x10, ld64(s18 + 0x10))
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return f
		}
		if (g == 0x22) {
			st8(f, 0x22)
			st64(s18 + 0x10, 1)
			st64(a + 0x10, ld64(s18 + 0x10))
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return f
		}
		st8(f, 0x23)
	}
	copy(f + 1, b + 8, 0x20)
	st64(s18 + 0x10, 0x21)
	st64(a + 0x10, ld64(s18 + 0x10))
	st64(a + 8, ld64(s18 + 8))
	st64(a, ld64(s18))
	return f
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (points to it)
export function fn_12f7b0(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s48 = fp - 0x48, s50 = fp - 0x50, s68 = fp - 0x68
	if ((memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	copyr(s48, e, 0x20)
	st32(s50, 0x12)
	fn_12e9c0(s68, s50)
	const f = __rust_alloc(0x44, 1)
	if (f == 0) {
		alloc_handle_alloc_error(1, 0x44)
	}
	st64(f + 0x18, ld64(c + 0x18))
	st64(f + 0x10, ld64(c + 0x10))
	st64(f + 8, ld64(c + 8))
	st64(f, ld64(c))
	st16(f + 0x20, 0x100)
	copy(f + 0x22, d, 0x20)
	st16(f + 0x42, 0)
	st64(a + 0x48, ld64(b + 0x18))
	st64(a + 0x40, ld64(b + 0x10))
	st64(a + 0x38, ld64(b + 8))
	st64(a + 0x30, ld64(b))
	copy(a + 0x18, s68, 0x18)
	st64(a + 8, f, 2)
	st64(a, 2)
}

export function fn_130750(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s80 = fp - 0x80
	let k, l, v, w, x: u64
	const f = memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20)
	const h = p7
	let n = p6
	const g = p5
	if ((f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	const m = fn_12e9c0(s80, 0x100155e78)
	let i = h + 3
	if (i == 0) {
		st64(s68, 0, 1, 0)
		copyr(s50, c, 0x20)
		fn_12d0a0(s68, c, m)
		l = undef
		i = ld64(s68)
		k = ld64(s68 + 8)
	} else {
		const j = i
		if (i > 0x3c3c3c3c3c3c3c3) {
			raw_vec_handle_error(0, j * 0x22, v, w, x)
		}
		k = __rust_alloc(j * 0x22, 1)
		if (k == 0) {
			raw_vec_handle_error(1, j * 0x22, v, w, x)
		}
		st64(s68, i, k)
		l = c
		copyr(s50, c, 0x20)
	}
	st64(k + 0x18, ld64(s38))
	st64(k + 0x10, ld64(s40))
	st64(k + 8, ld64(s50 + 8))
	st64(k, ld64(s50))
	st16(k + 0x20, 0x100)
	st64(s68 + 0x10, 1)
	if (i == 1) {
		fn_12d0a0(s68, l, k)
		i = ld64(s68)
		k = ld64(s68 + 8)
	}
	let u = b
	st64(k + 0x3a, ld64(d + 0x18))
	st64(k + 0x32, ld64(d + 0x10))
	st64(k + 0x2a, ld64(d + 8))
	st64(k + 0x22, ld64(d))
	st16(k + 0x42, 0x100)
	st64(s68 + 0x10, 2)
	if (i == 2) {
		fn_12d0a0(s68, d, k)
		u = b
		k = ld64(s68 + 8)
	}
	st64(k + 0x5c, ld64(g + 0x18))
	st64(k + 0x54, ld64(g + 0x10))
	st64(k + 0x4c, ld64(g + 8))
	st64(k + 0x44, ld64(g))
	st8(k + 0x64, h == 0, 0)
	st64(s68 + 0x10, 3)
	if (h != 0) {
		let q = 3
		let o = 0
		let r = h << 3
		do {
			const s = ld64(n)
			copyr(s40, s + 0x10, 0x10)
			const t = ld64(s + 8)
			st64(s50 + 8, t)
			st64(s50, ld64(s))
			if (q == ld64(s68)) {
				fn_12d0a0(s68, t, k)
				u = b
				k = ld64(s68 + 8)
			}
			n = n + 8
			const p = k + o
			st64(p + 0x7e, ld64(s38))
			st64(p + 0x76, ld64(s40))
			st64(p + 0x6e, ld64(s50 + 8))
			st64(p + 0x66, ld64(s50))
			st16(p + 0x86, 1)
			o = o + 0x22
			q = q + 1
			st64(s68 + 0x10, q)
			r = r - 8
		} while (r != 0)
	}
	copyr(s20, u, 0x20)
	copy(s50, s68, 0x18)
	copy(s38, s80, 0x18)
	memcpy(a, s50, 0x50)
}

export function fn_130da0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s80 = fp - 0x80
	let k, l, v, w, x: u64
	const f = memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20)
	const h = p7
	let n = p6
	const g = p5
	if ((f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	const m = fn_12e9c0(s80, 0x100155ec8)
	let i = h + 3
	if (i == 0) {
		st64(s68, 0, 1, 0)
		copyr(s50, c, 0x20)
		fn_12d0a0(s68, c, m)
		l = undef
		i = ld64(s68)
		k = ld64(s68 + 8)
	} else {
		const j = i
		if (i > 0x3c3c3c3c3c3c3c3) {
			raw_vec_handle_error(0, j * 0x22, v, w, x)
		}
		k = __rust_alloc(j * 0x22, 1)
		if (k == 0) {
			raw_vec_handle_error(1, j * 0x22, v, w, x)
		}
		st64(s68, i, k)
		l = c
		copyr(s50, c, 0x20)
	}
	st64(k + 0x18, ld64(s38))
	st64(k + 0x10, ld64(s40))
	st64(k + 8, ld64(s50 + 8))
	st64(k, ld64(s50))
	st16(k + 0x20, 0x100)
	st64(s68 + 0x10, 1)
	if (i == 1) {
		fn_12d0a0(s68, l, k)
		i = ld64(s68)
		k = ld64(s68 + 8)
	}
	let u = b
	st64(k + 0x3a, ld64(d + 0x18))
	st64(k + 0x32, ld64(d + 0x10))
	st64(k + 0x2a, ld64(d + 8))
	st64(k + 0x22, ld64(d))
	st16(k + 0x42, 0)
	st64(s68 + 0x10, 2)
	if (i == 2) {
		fn_12d0a0(s68, d, k)
		u = b
		k = ld64(s68 + 8)
	}
	st64(k + 0x5c, ld64(g + 0x18))
	st64(k + 0x54, ld64(g + 0x10))
	st64(k + 0x4c, ld64(g + 8))
	st64(k + 0x44, ld64(g))
	st8(k + 0x64, h == 0, 0)
	st64(s68 + 0x10, 3)
	if (h != 0) {
		let q = 3
		let o = 0
		let r = h << 3
		do {
			const s = ld64(n)
			copyr(s40, s + 0x10, 0x10)
			const t = ld64(s + 8)
			st64(s50 + 8, t)
			st64(s50, ld64(s))
			if (q == ld64(s68)) {
				fn_12d0a0(s68, t, k)
				u = b
				k = ld64(s68 + 8)
			}
			n = n + 8
			const p = k + o
			st64(p + 0x7e, ld64(s38))
			st64(p + 0x76, ld64(s40))
			st64(p + 0x6e, ld64(s50 + 8))
			st64(p + 0x66, ld64(s50))
			st16(p + 0x86, 1)
			o = o + 0x22
			q = q + 1
			st64(s68 + 0x10, q)
			r = r - 8
		} while (r != 0)
	}
	copyr(s20, u, 0x20)
	copy(s50, s68, 0x18)
	copy(s38, s80, 0x18)
	memcpy(a, s50, 0x50)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it), c (points to it), b (value), a (points to it), p5 (points to it), p6 (points to it), p9 (value), p10 (value)
export function fn_131a40(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s80 = fp - 0x80
	let l, m, w, x, y: u64
	const f = memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20)
	const h = p10
	const g = p9
	const i = p8
	let o = p7
	const z = p6
	const aa = p5
	if ((f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	st8(s40, h)
	st64(s50 + 8, g)
	st32(s50, 0xc)
	const n = fn_12e9c0(s80, s50)
	let j = i + 4
	if (j == 0) {
		st64(s68, 0, 1, 0)
		copyr(s50, c, 0x20)
		fn_12d0a0(s68, c, n)
		m = undef
		j = ld64(s68)
		l = ld64(s68 + 8)
	} else {
		const k = j
		if (j > 0x3c3c3c3c3c3c3c3) {
			raw_vec_handle_error(0, k * 0x22, w, x, y)
		}
		l = __rust_alloc(k * 0x22, 1)
		if (l == 0) {
			raw_vec_handle_error(1, k * 0x22, w, x, y)
		}
		st64(s68, j, l)
		m = c
		copyr(s50, c, 0x20)
	}
	st64(l + 0x18, ld64(s38))
	st64(l + 0x10, ld64(s40))
	st64(l + 8, ld64(s50 + 8))
	st64(l, ld64(s50))
	st16(l + 0x20, 0x100)
	st64(s68 + 0x10, 1)
	if (j == 1) {
		fn_12d0a0(s68, m, l)
		j = ld64(s68)
		l = ld64(s68 + 8)
	}
	st64(l + 0x3a, ld64(d + 0x18))
	st64(l + 0x32, ld64(d + 0x10))
	st64(l + 0x2a, ld64(d + 8))
	st64(l + 0x22, ld64(d))
	st16(l + 0x42, 0)
	st64(s68 + 0x10, 2)
	if (j == 2) {
		fn_12d0a0(s68, d, l)
		j = ld64(s68)
		l = ld64(s68 + 8)
	}
	let v = b
	st64(l + 0x5c, ld64(aa + 0x18))
	st64(l + 0x54, ld64(aa + 0x10))
	st64(l + 0x4c, ld64(aa + 8))
	st64(l + 0x44, ld64(aa))
	st16(l + 0x64, 0x100)
	st64(s68 + 0x10, 3)
	if (j == 3) {
		fn_12d0a0(s68, aa, l)
		v = b
		l = ld64(s68 + 8)
	}
	st64(l + 0x7e, ld64(z + 0x18))
	st64(l + 0x76, ld64(z + 0x10))
	st64(l + 0x6e, ld64(z + 8))
	st64(l + 0x66, ld64(z))
	st8(l + 0x86, i == 0, 0)
	st64(s68 + 0x10, 4)
	if (i != 0) {
		let r = 4
		let p = 0
		let s = i << 3
		do {
			const t = ld64(o)
			copyr(s40, t + 0x10, 0x10)
			const u = ld64(t + 8)
			st64(s50 + 8, u)
			st64(s50, ld64(t))
			if (r == ld64(s68)) {
				fn_12d0a0(s68, u, l)
				v = b
				l = ld64(s68 + 8)
			}
			o = o + 8
			const q = l + p
			st64(q + 0xa0, ld64(s38))
			st64(q + 0x98, ld64(s40))
			st64(q + 0x90, ld64(s50 + 8))
			st64(q + 0x88, ld64(s50))
			st16(q + 0xa8, 1)
			p = p + 0x22
			r = r + 1
			st64(s68 + 0x10, r)
			s = s - 8
		} while (s != 0)
	}
	copyr(s20, v, 0x20)
	copy(s50, s68, 0x18)
	copy(s38, s80, 0x18)
	memcpy(a, s50, 0x50)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value)
export function fn_132800(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s48 = fp - 0x48, s50 = fp - 0x50
	let j, k: u64
	if ((memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	const f = __rust_alloc(0x22, 1)
	if (f == 0) {
		alloc_handle_alloc_error(1, 0x22)
	}
	st64(f + 0x18, ld64(c + 0x18))
	st64(f + 0x10, ld64(c + 0x10))
	st64(f + 8, ld64(c + 8))
	st64(f, ld64(c))
	st16(f + 0x20, 0)
	let i = 2
	let g = 0
	if (e != 0) {
		g = e << 1
		if (e > 0x3fffffffffffffff) {
			raw_vec_handle_error(0, g, g, j, k)
		}
		const h = __rust_alloc(g, 2)
		i = h
		if (h == 0) {
			raw_vec_handle_error(2, g, g, j, k)
		}
	}
	memcpy(i, d, g)
	st64(s48, e, i, e)
	st32(s50, 0x15)
	const l = fn_12e9c0(a + 0x18, s50)
	st64(a + 0x48, ld64(b + 0x18))
	st64(a + 0x40, ld64(b + 0x10))
	st64(a + 0x38, ld64(b + 8))
	st64(a + 0x30, ld64(b))
	st64(a + 8, f, 1)
	st64(a, 1)
	if (e != 0) {
		fn_83078(l)
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (points to it)
export function fn_132d88(a: u64, b: u64, c: u64) {
	if ((memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	const f = __rust_alloc(0x22, 1)
	if (f == 0) {
		alloc_handle_alloc_error(1, 0x22)
	}
	st64(f + 0x18, ld64(c + 0x18))
	st64(f + 0x10, ld64(c + 0x10))
	st64(f + 8, ld64(c + 8))
	st64(f, ld64(c))
	st16(f + 0x20, 0x100)
	fn_12e9c0(a + 0x18, 0x100155f68)
	st64(a + 0x48, ld64(b + 0x18))
	st64(a + 0x40, ld64(b + 0x10))
	st64(a + 0x38, ld64(b + 8))
	st64(a + 0x30, ld64(b))
	st64(a + 8, f, 1)
	st64(a, 1)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
export function fn_133ce0(a: u64, b: u64) {
	const s18 = fp - 0x18
	let f = __rust_alloc(0x50, 1)
	if (f == 0) {
		raw_vec_handle_error(1, 0x50)
	}
	B16: {
		st64(s18, 0x50, f)
		const g = ld32(b)
		if ((g as i64) > 0xb) {
			if ((g as i64) > 0x11) {
				if ((g as i64) > 0x14) {
					if ((g as i64) > 0x16) {
						if (g == 0x17) {
							st64(f + 1, ld64(b + 8))
							st8(f, 0x17)
							st64(s18 + 0x10, 9)
							st64(a + 0x10, 9)
							st64(a + 8, ld64(s18 + 8))
							st64(a, ld64(s18))
							return
						}
						st8(f, 0x18)
						let j = 1
						st64(s18 + 0x10, 1)
						const k = ld64(b + 8)
						const i = ld64(b + 0x10)
						if (i >= 0x50) {
							fn_133a38(s18, 1, i)
							f = ld64(s18 + 8)
							j = ld64(s18 + 0x10)
						}
						memcpy(f + j, k, i)
						const o = j + i
						st64(s18 + 0x10, o)
						st64(a + 0x10, o)
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return
					}
					if (g == 0x15) {
						st8(f, 0x15)
						st64(s18 + 0x10, 1)
						st64(a + 0x10, 1)
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return
					}
					st8(f, 0x16)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, 1)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				if (g != 0x12) {
					if (g == 0x13) {
						st8(f + 1, ld8(b + 8))
						st8(f, 0x13)
						st64(s18 + 0x10, 2)
						st64(a + 0x10, 2)
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return
					}
					st8(f + 1, ld8(b + 8))
					st8(f, 0x14)
					st64(f + 0x1a, ld64(b + 0x21))
					st64(f + 0x12, ld64(b + 0x19))
					st64(f + 0xa, ld64(b + 0x11))
					st64(f + 2, ld64(b + 9))
					if (ld32(b + 0x2c) != 0) {
						break B16
					}
					st8(f + 0x22, 0)
					st64(s18 + 0x10, 0x23)
					st64(a + 0x10, 0x23)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				st8(f, 0x12)
			} else {
				if (0xe >= (g as i64)) {
					if (g == 0xc) {
						const l = ld64(b + 8)
						st8(f + 9, ld8(b + 0x10))
						st64(f + 1, l)
						st8(f, 0xc)
						st64(s18 + 0x10, 0xa)
						st64(a + 0x10, 0xa)
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return
					}
					if (g == 0xd) {
						const n = ld64(b + 8)
						st8(f + 9, ld8(b + 0x10))
						st64(f + 1, n)
						st8(f, 0xd)
						st64(s18 + 0x10, 0xa)
						st64(a + 0x10, 0xa)
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return
					}
					const h = ld64(b + 8)
					st8(f + 9, ld8(b + 0x10))
					st64(f + 1, h)
					st8(f, 0xe)
					st64(s18 + 0x10, 0xa)
					st64(a + 0x10, 0xa)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				if (g == 0xf) {
					const m = ld64(b + 8)
					st8(f + 9, ld8(b + 0x10))
					st64(f + 1, m)
					st8(f, 0xf)
					st64(s18 + 0x10, 0xa)
					st64(a + 0x10, 0xa)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				if (g != 0x10) {
					st8(f, 0x11)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, 1)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				st8(f, 0x10)
			}
			copy(f + 1, b + 8, 0x20)
			st64(s18 + 0x10, 0x21)
			st64(a + 0x10, 0x21)
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return
		}
		if ((g as i64) > 5) {
			if ((g as i64) > 8) {
				if (g == 9) {
					st8(f, 9)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, 1)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				if (g == 0xa) {
					st8(f, 0xa)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, 1)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				st8(f, 0xb)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, 1)
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return
			}
			if (g == 6) {
				st8(f, 6)
				st8(f + 1, ld8(b + 8))
				if (ld32(b + 0xc) != 0) {
					st8(f + 2, 1)
					copy(f + 3, b + 0x10, 0x20)
					st64(s18 + 0x10, 0x23)
					st64(a + 0x10, 0x23)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				st8(f + 2, 0)
				st64(s18 + 0x10, 3)
				st64(a + 0x10, 3)
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return
			}
			if (g == 7) {
				st64(f + 1, ld64(b + 8))
				st8(f, 7)
				st64(s18 + 0x10, 9)
				st64(a + 0x10, 9)
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return
			}
			st64(f + 1, ld64(b + 8))
			st8(f, 8)
			st64(s18 + 0x10, 9)
			st64(a + 0x10, 9)
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return
		}
		if ((g as i64) > 2) {
			if (g == 3) {
				st64(f + 1, ld64(b + 8))
				st8(f, 3)
				st64(s18 + 0x10, 9)
				st64(a + 0x10, 9)
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return
			}
			if (g == 4) {
				st64(f + 1, ld64(b + 8))
				st8(f, 4)
				st64(s18 + 0x10, 9)
				st64(a + 0x10, 9)
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return
			}
			st8(f, 5)
			st64(s18 + 0x10, 1)
			st64(a + 0x10, 1)
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return
		}
		if (g != 0) {
			if (g == 1) {
				st8(f, 1)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, 1)
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return
			}
			st8(f + 1, ld8(b + 8))
			st8(f, 2)
			st64(s18 + 0x10, 2)
			st64(a + 0x10, 2)
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return
		}
		st8(f + 1, ld8(b + 8))
		st8(f, 0)
		st64(f + 0x1a, ld64(b + 0x21))
		st64(f + 0x12, ld64(b + 0x19))
		st64(f + 0xa, ld64(b + 0x11))
		st64(f + 2, ld64(b + 9))
		if (ld32(b + 0x2c) == 0) {
			st8(f + 0x22, 0)
			st64(s18 + 0x10, 0x23)
			st64(a + 0x10, 0x23)
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return
		}
	}
	st8(f + 0x22, 1)
	copy(f + 0x23, b + 0x30, 0x20)
	st64(s18 + 0x10, 0x43)
	st64(a + 0x10, 0x43)
	st64(a + 8, ld64(s18 + 8))
	st64(a, ld64(s18))
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: p8 (value)
export function fn_1343e0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s80 = fp - 0x80
	let i, j, r, s, t: u64
	if ((memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
	} else {
		const f = p7
		let k = p6
		const u = p5
		st64(s50 + 8, p8)
		st32(s50, 3)
		fn_133ce0(s80, s50)
		let g = f + 3
		if (g == 0) {
			st64(s68, 0, 1, 0)
			copyr(s50, c, 0x20)
			fn_133b80(s68)
			g = ld64(s68)
			i = ld64(s68 + 8)
		} else {
			const h = g
			if (g > 0x3c3c3c3c3c3c3c3) {
				raw_vec_handle_error(0, h * 0x22, r, s, t)
			}
			i = __rust_alloc(h * 0x22, 1)
			if (i == 0) {
				raw_vec_handle_error(1, h * 0x22, r, s, t)
			}
			st64(s68, g, i)
			copyr(s50, c, 0x20)
		}
		st64(i + 0x18, ld64(s38))
		st64(i + 0x10, ld64(s40))
		st64(i + 8, ld64(s50 + 8))
		st64(i, ld64(s50))
		st16(i + 0x20, 0x100)
		st64(s68 + 0x10, 1)
		if (g == 1) {
			fn_133b80(s68, j)
			g = ld64(s68)
			i = ld64(s68 + 8)
		}
		st64(i + 0x3a, ld64(d + 0x18))
		st64(i + 0x32, ld64(d + 0x10))
		st64(i + 0x2a, ld64(d + 8))
		st64(i + 0x22, ld64(d))
		st16(i + 0x42, 0x100)
		st64(s68 + 0x10, 2)
		if (g == 2) {
			fn_133b80(s68, d)
			i = ld64(s68 + 8)
		}
		st64(i + 0x5c, ld64(u + 0x18))
		st64(i + 0x54, ld64(u + 0x10))
		st64(i + 0x4c, ld64(u + 8))
		st64(i + 0x44, ld64(u))
		st8(i + 0x64, f == 0, 0)
		st64(s68 + 0x10, 3)
		if (f != 0) {
			let n = 3
			let l = 0
			let o = f << 3
			do {
				const p = ld64(k)
				copyr(s40, p + 0x10, 0x10)
				const q = ld64(p + 8)
				st64(s50 + 8, q)
				st64(s50, ld64(p))
				if (n == ld64(s68)) {
					fn_133b80(s68, q)
					i = ld64(s68 + 8)
				}
				k = k + 8
				const m = i + l
				st64(m + 0x7e, ld64(s38))
				st64(m + 0x76, ld64(s40))
				st64(m + 0x6e, ld64(s50 + 8))
				st64(m + 0x66, ld64(s50))
				st16(m + 0x86, 1)
				l = l + 0x22
				n = n + 1
				st64(s68 + 0x10, n)
				o = o - 8
			} while (o != 0)
		}
		copyr(s20, b, 0x20)
		copy(s50, s68, 0x18)
		copy(s38, s80, 0x18)
		memcpy(a, s50, 0x50)
	}
}

export function fn_134a08(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s80 = fp - 0x80, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sa0 = fp - 0xa0
	let k, l, t, u, v: u64
	let x = ld64(sa0)
	let y = ld64(s98)
	let z = ld64(s90)
	let aa = ld64(s88)
	if ((memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
	} else {
		const h = p8
		let m = p7
		const w = p6
		const g = p5
		let f = 0
		if (d != 0) {
			aa = ld64(d + 0x18)
			z = ld64(d + 0x10)
			y = ld64(d + 8)
			x = ld64(d)
			f = 1
		}
		st32(s50 + 0xc, f)
		st8(s50 + 8, g)
		st64(s40, x, y, z, aa)
		st32(s50, 6)
		fn_133ce0(s80, s50)
		let i = h + 3
		if (i == 0) {
			st64(s68, 0, 1, 0)
			copyr(s50, c, 0x20)
			fn_133b80(s68, c)
			l = undef
			i = ld64(s68)
			k = ld64(s68 + 8)
		} else {
			const j = i
			if (i > 0x3c3c3c3c3c3c3c3) {
				raw_vec_handle_error(0, j * 0x22, t, u, v)
			}
			k = __rust_alloc(j * 0x22, 1)
			if (k == 0) {
				raw_vec_handle_error(1, j * 0x22, t, u, v)
			}
			st64(s68, i, k)
			l = c
			copyr(s50, c, 0x20)
		}
		st64(k + 0x18, ld64(s38))
		st64(k + 0x10, ld64(s40))
		st64(k + 8, ld64(s50 + 8))
		st64(k, ld64(s50))
		st16(k + 0x20, 0x100)
		st64(s68 + 0x10, 1)
		if (i == 1) {
			fn_133b80(s68, l)
			k = ld64(s68 + 8)
		}
		st64(k + 0x3a, ld64(w + 0x18))
		st64(k + 0x32, ld64(w + 0x10))
		st64(k + 0x2a, ld64(w + 8))
		st64(k + 0x22, ld64(w))
		st8(k + 0x42, h == 0, 0)
		st64(s68 + 0x10, 2)
		if (h != 0) {
			let p = 2
			let n = 0
			let q = h << 3
			do {
				const r = ld64(m)
				copyr(s40, r + 0x10, 0x10)
				const s = ld64(r + 8)
				st64(s50 + 8, s)
				st64(s50, ld64(r))
				if (p == ld64(s68)) {
					fn_133b80(s68, s)
					k = ld64(s68 + 8)
				}
				m = m + 8
				const o = k + n
				st64(o + 0x5c, ld64(s38))
				st64(o + 0x54, ld64(s40))
				st64(o + 0x4c, ld64(s50 + 8))
				st64(o + 0x44, ld64(s50))
				st16(o + 0x64, 1)
				n = n + 0x22
				p = p + 1
				st64(s68 + 0x10, p)
				q = q - 8
			} while (q != 0)
		}
		copyr(s20, b, 0x20)
		copy(s50, s68, 0x18)
		copy(s38, s80, 0x18)
		memcpy(a, s50, 0x50)
	}
}

export function fn_135038(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s80 = fp - 0x80
	let i, j, r, s, t: u64
	if ((memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
	} else {
		const f = p7
		let k = p6
		const u = p5
		st64(s50 + 8, p8)
		st32(s50, 7)
		fn_133ce0(s80, s50)
		let g = f + 3
		if (g == 0) {
			st64(s68, 0, 1, 0)
			copyr(s50, c, 0x20)
			fn_133b80(s68)
			g = ld64(s68)
			i = ld64(s68 + 8)
		} else {
			const h = g
			if (g > 0x3c3c3c3c3c3c3c3) {
				raw_vec_handle_error(0, h * 0x22, r, s, t)
			}
			i = __rust_alloc(h * 0x22, 1)
			if (i == 0) {
				raw_vec_handle_error(1, h * 0x22, r, s, t)
			}
			st64(s68, g, i)
			copyr(s50, c, 0x20)
		}
		st64(i + 0x18, ld64(s38))
		st64(i + 0x10, ld64(s40))
		st64(i + 8, ld64(s50 + 8))
		st64(i, ld64(s50))
		st16(i + 0x20, 0x100)
		st64(s68 + 0x10, 1)
		if (g == 1) {
			fn_133b80(s68, j)
			g = ld64(s68)
			i = ld64(s68 + 8)
		}
		st64(i + 0x3a, ld64(d + 0x18))
		st64(i + 0x32, ld64(d + 0x10))
		st64(i + 0x2a, ld64(d + 8))
		st64(i + 0x22, ld64(d))
		st16(i + 0x42, 0x100)
		st64(s68 + 0x10, 2)
		if (g == 2) {
			fn_133b80(s68, d)
			i = ld64(s68 + 8)
		}
		st64(i + 0x5c, ld64(u + 0x18))
		st64(i + 0x54, ld64(u + 0x10))
		st64(i + 0x4c, ld64(u + 8))
		st64(i + 0x44, ld64(u))
		st8(i + 0x64, f == 0, 0)
		st64(s68 + 0x10, 3)
		if (f != 0) {
			let n = 3
			let l = 0
			let o = f << 3
			do {
				const p = ld64(k)
				copyr(s40, p + 0x10, 0x10)
				const q = ld64(p + 8)
				st64(s50 + 8, q)
				st64(s50, ld64(p))
				if (n == ld64(s68)) {
					fn_133b80(s68, q)
					i = ld64(s68 + 8)
				}
				k = k + 8
				const m = i + l
				st64(m + 0x7e, ld64(s38))
				st64(m + 0x76, ld64(s40))
				st64(m + 0x6e, ld64(s50 + 8))
				st64(m + 0x66, ld64(s50))
				st16(m + 0x86, 1)
				l = l + 0x22
				n = n + 1
				st64(s68 + 0x10, n)
				o = o - 8
			} while (o != 0)
		}
		copyr(s20, b, 0x20)
		copy(s50, s68, 0x18)
		copy(s38, s80, 0x18)
		memcpy(a, s50, 0x50)
	}
}

export function fn_135660(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s80 = fp - 0x80
	let h, i, q, r, s: u64
	if ((memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
	} else {
		const f = p7
		let j = p6
		const t = p5
		fn_133ce0(s80, 0x100156018)
		let g = f + 3
		if (g == 0) {
			st64(s68, 0, 1, 0)
			copyr(s50, c, 0x20)
			fn_133b80(s68)
			h = undef
			g = ld64(s68)
			i = ld64(s68 + 8)
		} else {
			h = g * 0x22
			if (g > 0x3c3c3c3c3c3c3c3) {
				raw_vec_handle_error(0, h, q, r, s)
			}
			i = __rust_alloc(h, 1)
			if (i == 0) {
				raw_vec_handle_error(1, h, q, r, s)
			}
			st64(s68, g, i)
			copyr(s50, c, 0x20)
		}
		st64(i + 0x18, ld64(s38))
		st64(i + 0x10, ld64(s40))
		st64(i + 8, ld64(s50 + 8))
		st64(i, ld64(s50))
		st16(i + 0x20, 0x100)
		st64(s68 + 0x10, 1)
		if (g == 1) {
			fn_133b80(s68, h)
			g = ld64(s68)
			i = ld64(s68 + 8)
		}
		st64(i + 0x3a, ld64(d + 0x18))
		st64(i + 0x32, ld64(d + 0x10))
		st64(i + 0x2a, ld64(d + 8))
		st64(i + 0x22, ld64(d))
		st16(i + 0x42, 0x100)
		st64(s68 + 0x10, 2)
		if (g == 2) {
			fn_133b80(s68, d)
			i = ld64(s68 + 8)
		}
		st64(i + 0x5c, ld64(t + 0x18))
		st64(i + 0x54, ld64(t + 0x10))
		st64(i + 0x4c, ld64(t + 8))
		st64(i + 0x44, ld64(t))
		st8(i + 0x64, f == 0, 0)
		st64(s68 + 0x10, 3)
		if (f != 0) {
			let m = 3
			let k = 0
			let n = f << 3
			do {
				const o = ld64(j)
				copyr(s40, o + 0x10, 0x10)
				const p = ld64(o + 8)
				st64(s50 + 8, p)
				st64(s50, ld64(o))
				if (m == ld64(s68)) {
					fn_133b80(s68, p)
					i = ld64(s68 + 8)
				}
				j = j + 8
				const l = i + k
				st64(l + 0x7e, ld64(s38))
				st64(l + 0x76, ld64(s40))
				st64(l + 0x6e, ld64(s50 + 8))
				st64(l + 0x66, ld64(s50))
				st16(l + 0x86, 1)
				k = k + 0x22
				m = m + 1
				st64(s68 + 0x10, m)
				n = n - 8
			} while (n != 0)
		}
		copyr(s20, b, 0x20)
		copy(s50, s68, 0x18)
		copy(s38, s80, 0x18)
		memcpy(a, s50, 0x50)
	}
}

export function fn_135c58(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s80 = fp - 0x80
	let j, k, s, t, u: u64
	if ((memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
	} else {
		const f = p8
		const g = p7
		let l = p6
		const v = p5
		st8(s40, p9)
		st64(s50 + 8, f)
		st32(s50, 0xf)
		fn_133ce0(s80, s50)
		let h = g + 3
		if (h == 0) {
			st64(s68, 0, 1, 0)
			copyr(s50, c, 0x20)
			fn_133b80(s68)
			h = ld64(s68)
			j = ld64(s68 + 8)
		} else {
			const i = h
			if (h > 0x3c3c3c3c3c3c3c3) {
				raw_vec_handle_error(0, i * 0x22, s, t, u)
			}
			j = __rust_alloc(i * 0x22, 1)
			if (j == 0) {
				raw_vec_handle_error(1, i * 0x22, s, t, u)
			}
			st64(s68, h, j)
			copyr(s50, c, 0x20)
		}
		st64(j + 0x18, ld64(s38))
		st64(j + 0x10, ld64(s40))
		st64(j + 8, ld64(s50 + 8))
		st64(j, ld64(s50))
		st16(j + 0x20, 0x100)
		st64(s68 + 0x10, 1)
		if (h == 1) {
			fn_133b80(s68, k)
			h = ld64(s68)
			j = ld64(s68 + 8)
		}
		st64(j + 0x3a, ld64(d + 0x18))
		st64(j + 0x32, ld64(d + 0x10))
		st64(j + 0x2a, ld64(d + 8))
		st64(j + 0x22, ld64(d))
		st16(j + 0x42, 0x100)
		st64(s68 + 0x10, 2)
		if (h == 2) {
			fn_133b80(s68, d)
			j = ld64(s68 + 8)
		}
		st64(j + 0x5c, ld64(v + 0x18))
		st64(j + 0x54, ld64(v + 0x10))
		st64(j + 0x4c, ld64(v + 8))
		st64(j + 0x44, ld64(v))
		st8(j + 0x64, g == 0, 0)
		st64(s68 + 0x10, 3)
		if (g != 0) {
			let o = 3
			let m = 0
			let p = g << 3
			do {
				const q = ld64(l)
				copyr(s40, q + 0x10, 0x10)
				const r = ld64(q + 8)
				st64(s50 + 8, r)
				st64(s50, ld64(q))
				if (o == ld64(s68)) {
					fn_133b80(s68, r)
					j = ld64(s68 + 8)
				}
				l = l + 8
				const n = j + m
				st64(n + 0x7e, ld64(s38))
				st64(n + 0x76, ld64(s40))
				st64(n + 0x6e, ld64(s50 + 8))
				st64(n + 0x66, ld64(s50))
				st16(n + 0x86, 1)
				m = m + 0x22
				o = o + 1
				st64(s68 + 0x10, o)
				p = p - 8
			} while (p != 0)
		}
		copyr(s20, b, 0x20)
		copy(s50, s68, 0x18)
		copy(s38, s80, 0x18)
		memcpy(a, s50, 0x50)
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value)
export function fn_136a70(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	let f = e
	let i = d
	const n = c
	let o = 1
	let s = 1
	if (e != 0) {
		const g = f * 0x22
		const r = f
		if (f > 0x3c3c3c3c3c3c3c3) {
			raw_vec_handle_error(0, g, c, d, e)
		}
		const h = __rust_alloc(g, 1)
		c = undef
		d = undef
		e = undef
		if (h == 0) {
			raw_vec_handle_error(1, g, c, d, e)
		}
		s = h
		let k = h + 0x21
		f = r
		let m = r
		while (true) {
			const j = ld64(i)
			d = ld64(j)
			e = ld64(j + 8)
			const l = ld64(j + 0x10)
			c = ld64(j + 0x18)
			st64(k - 9, c)
			st64(k - 0x11, l)
			st64(k - 0x19, e)
			st64(k - 0x21, d)
			i = i + 8
			st16(k - 1, 1)
			k = k + 0x22
			m = m - 1
			if (m == 0) {
				o = 1
				break
			}
		}
	}
	if (n != 0) {
		const p = f
		if (0 > (n as i64)) {
			raw_vec_handle_error(0, n, c, d, e)
		}
		o = __rust_alloc(n, 1)
		c = undef
		d = undef
		e = undef
		if (o == 0) {
			raw_vec_handle_error(1, n, c, d, e)
		}
		f = p
	}
	const q = memcpy(o, b, n)
	st64(a + 0x30, 0x62129995a534a05 /* MEMO_PROGRAM */, 0x7c38da6071e8244d /* MEMO_PROGRAM[1] */, 0x81bb92bcddb5357c /* MEMO_PROGRAM[2] */, 0x8d44054140a81fe4 /* MEMO_PROGRAM[3] */) // key MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
	st64(a + 0x20, o, n)
	st64(a + 0x18, n)
	st64(a + 8, s, f)
	st64(a, f)
	return q
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value)
export function fn_1388f0(a: u64, b: u64, c: u64, r0: u64): u64 {
	if (c != 8) {
		st64(a, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
		return r0
	}
	st64(a + 8, ld64(b))
	st64(a, 0x800000000000001a /* Ok */)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), c (points to it)
export function fn_1390b0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1000 = fp - 0x1000
	st64(s1000, 8, 0)
	return fn_1390d8(a, b, c, d, fp)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
export function fn_13ae08(a: u64, b: u64, c: u64): u64 {
	const g = ld64(a + 8)
	const f = ld64(a + 0x10)
	let h = 0
	if (g > f) {
		h = min(sat_sub(g, f), c)
		sol_memcpy(ld64(a) + f, b, h)
		st64(a + 0x10, h + f)
	}
	if (h == c) {
		return 0
	}
	return fn_1394f0()
}

// types [heur]: d: DataCell (every call passes one: fn_8a170, fn_8b758, fn_8d1d0, …)
export function fn_13aee8(a: u64, b: u64, c: u64, d: DataCell, e: u64): u64 {
	const s18 = fp - 0x18
	let k = a
	const f = fn_143100(c, b, c, d, e)
	const g = fn_143100(b)
	const h = f > f + g
	if ((h & 1) != 0) {
		fn_1490e8(0x10015acc8, h & 1)
	}
	const i = ld64(c + 8)
	const j = ld64(i + 0x10)
	if (j == 0) {
		const u = k
		st64(i + 0x10, -1)
		const l = ld64(i + 0x18)
		st64(l, f + g)
		st64(i + 0x10, ld64(i + 0x10) + 1)
		const m = ld64(b + 8)
		const n = ld64(m + 0x10)
		if (n == 0) {
			st64(m + 0x10, -1)
			st64(ld64(m + 0x18), 0)
			st64(m + 0x10, ld64(m + 0x10) + 1)
			let o = fn_1434c0(s18, b, 0, AccountInfo_assign(b, 0x100152180, g))
			let q = 2
			if (ld64(s18) != 0x800000000000001a /* Ok */) {
				o = __rust_alloc(0x80, 8)
				k = o
				if (o == 0) {
					alloc_handle_alloc_error(8, 0x80)
				}
				st64(k, 2)
				copy(k + 0x20, s18, 0x18)
				st8(k + 0x38, 2)
				q = 1
			}
			const r = ld64(c + 0x10)
			const p = ld64(c + 8)
			if (rc_release(p)) {
				if (rc_release(p + 8)) {
					o = fn_83078(o)
				}
			}
			if (rc_release(r)) {
				if (rc_release(r + 8)) {
					o = fn_83078(o)
				}
			}
			const t = ld64(b + 0x10)
			const s = ld64(b + 8)
			if (rc_release(s)) {
				if (rc_release(s + 8)) {
					o = fn_83078(o)
				}
			}
			if (!rc_release(t)) {
				st64(u + 8, k)
				st64(u, q)
				return o
			}
			if (!rc_release(t + 8)) {
				st64(u + 8, k)
				st64(u, q)
				return o
			}
			o = fn_83078(o)
			st64(u + 8, k)
			st64(u, q)
			return o
		}
		fn_148658(0x10015ac98, n, l)
	}
	fn_148658(0x10015acb0, i, j)
}

export function log_data(a: u64, b: u64): u64 {
	return sol_log_data(a, b)
}

export function fn_13ee80(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1000 = fp - 0x1000
	st64(s1000, 8, 0)
	return fn_13eea8(a, b, c, d, ld64(s1000), ld64(s1000 + 8))
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value)
export function fn_13eea8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s38 = fp - 0x38, s50 = fp - 0x50, s78 = fp - 0x78, sa0 = fp - 0xa0, sa8 = fp - 0xa8
	let h, i, n, o, p, q, r, s, ac, ad: u64
	B13: {
		st64(s78, c, d)
		st64(sa0 + 0x10, a)
		st64(sa0 + 0x18, ld64(b + 8))
		st64(sa8, b)
		const f = ld64(b + 0x10)
		st64(sa0, p5, p6)
		st64(sa0 + 0x20, f)
		if (f != 0) {
			let g = ld64(sa0 + 0x18)
			st64(s78 + 0x10, g + ld64(sa0 + 0x20) * 0x22)
			st64(s78 + 0x20, ld64(s78 + 8) * 0x30)
			st64(s78 + 0x18, ld64(s78) - 0x30)
			L4: while (true) {
				const l = g
				g = g + 0x22
				let j = ld64(s78 + 0x20)
				let k = ld64(s78 + 0x18)
				while (true) {
					if (j != 0) {
						const m = memcmp(l, ld64(k + 0x30), 0x20)
						j = j - 0x30
						k = k + 0x30
						if ((m as u32) != 0) {
							continue
						}
						if (ld8(l + 0x21) != 0) {
							p = fn_143340(s50, k, m as u32)
							o = ld64(s50 + 0x10)
							n = ld64(s50)
							if (n != 0x800000000000001a /* Ok */) {
								ad = ld64(s50 + 8)
								ac = ld64(sa0 + 0x10)
								st64(ac + 0x10, o)
								st64(ac + 8, ad)
								st64(ac, n)
								return p
							}
							st64(o, ld64(o) + 1)
							p = fn_143448(s50, k, p)
							i = 1
							h = ld64(s50 + 0x10)
							q = ld64(s50)
							if (q != 0x800000000000001a /* Ok */) {
								s = ld64(s50 + 8)
								r = ld64(sa0 + 0x10)
								st64(r + 0x10, h)
								st64(r + 8, s)
								st64(r, q)
								return p
							}
						} else {
							p = AccountInfo_try_borrow_lamports(s50, k, m as u32)
							o = ld64(s50 + 0x10)
							n = ld64(s50)
							if (n != 0x800000000000001a /* Ok */) {
								ad = ld64(s50 + 8)
								ac = ld64(sa0 + 0x10)
								st64(ac + 0x10, o)
								st64(ac + 8, ad)
								st64(ac, n)
								return p
							}
							st64(o, ld64(o) - 1)
							p = AccountInfo_try_borrow_data(s50, k, p)
							i = -1
							h = ld64(s50 + 0x10)
							q = ld64(s50)
							if (q != 0x800000000000001a /* Ok */) {
								s = ld64(s50 + 8)
								r = ld64(sa0 + 0x10)
								st64(r + 0x10, h)
								st64(r + 8, s)
								st64(r, q)
								return p
							}
						}
						st64(h, ld64(h) + i)
					}
					if (g == ld64(s78 + 0x10)) {
						break B13
					}
					continue L4
				}
			}
		}
	}
	const t = ld64(sa8)
	const ab = ld64(t + 0x30)
	const aa = ld64(t + 0x38)
	const z = ld64(t + 0x40)
	const y = ld64(t + 0x48)
	const x = ld64(t + 0x28)
	const w = ld64(t + 0x18)
	const v = ld64(t + 0x20)
	const u = ld64(t)
	st64(s50, ld64(sa0 + 0x18))
	st64(s50 + 8, u)
	st64(s50 + 0x10, ld64(sa0 + 0x20))
	st64(s38, v, w, x, ab, aa, z, y)
	// CPI: program ?, data v[..x]
	p = sol_invoke_signed_rust(s50, ld64(s78), ld64(s78 + 8), ld64(sa0), ld64(sa0 + 8))
	if (p != 0) {
		return fn_144198(ld64(sa0 + 0x10), p, p)
	}
	st64(ld64(sa0 + 0x10), 0x800000000000001a /* Ok */)
	return p
}

export function fn_13fd08(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s18 = fp - 0x18, s20 = fp - 0x20
	let g, y, z, aa, ab: u64
	const f = ld64(b)
	if (f != 0) {
		if (f > 0x2aaaaaaaaaaaaaa) {
			raw_vec_handle_error(0, f * 0x30, c, d, e)
		}
		let j = __rust_alloc(f * 0x30, 8)
		c = undef
		d = undef
		e = undef
		if (j == 0) {
			raw_vec_handle_error(8, f * 0x30, c, d, e)
		}
		st64(s18, j)
		let k = f
		st64(s20, f)
		g = 8
		let l = 0
		st64(s18 + 8, 0)
		let q = 0
		do {
			const r: AccountRecord = b + g
			const s = r.dup_marker
			const ad = q
			if (s == 0xff) {
				const ac = l
				z = r.executable
				aa = r.is_writable
				ab = r.is_signer
				const u = __rust_alloc(0x20, 8)
				if (u == 0) {
					alloc_handle_alloc_error(8, 0x20)
				}
				st64(u + 0x18, r + 0x48)
				st64(u + 0x10, 0)
				st64(u + 8, 1)
				y = u
				st64(u, 1)
				const v = r.data_len
				r.original_data_len = v
				const w = __rust_alloc(0x28, 8)
				if (w == 0) {
					alloc_handle_alloc_error(8, 0x28)
				}
				k = f
				l = ac
				e = ab != 0
				aa = aa != 0
				ab = z != 0
				st64(w + 0x18, r.data, v)
				st64(w + 0x10, 0)
				st64(w + 8, 1)
				st64(w, 1)
				g = g + v + 0x285f & -8
				z = ld64(b + g)
				if (ac == ld64(s20)) {
					fn_13fba0(s20, l)
					l = ac
					k = f
				}
				j = ld64(s18)
				const x = j + l * 0x30
				st8(x + 0x2a, ab)
				st8(x + 0x29, aa)
				st8(x + 0x28, e)
				st64(x + 0x20, z)
				st64(x + 0x18, r.owner)
				st64(x + 0x10, w)
				st64(x + 8, y)
				st64(x, r.key)
			} else {
				if (s >= l) {
					fn_1495b0(s, l, 0x10015b3b0, k, e)
				}
				const t: AccountInfo = j + s * 0x30
				const o: LamportsCell = t.lamports
				const p = t.key
				rc_inc(o)
				const n: DataCell = t.data
				rc_inc(n)
				y = t.executable
				z = t.is_writable
				aa = t.is_signer
				ab = t.rent_epoch
				e = t.owner
				if (l == ld64(s20)) {
					fn_13fba0(s20, l)
					k = f
					j = ld64(s18)
				}
				const m = j + l * 0x30
				st8(m + 0x2a, y)
				st8(m + 0x29, z)
				st8(m + 0x28, aa)
				st64(m + 0x20, ab)
				st64(m + 0x18, e)
				st64(m + 0x10, n)
				st64(m + 8, o)
				st64(m, p)
				st32(m + 0x2b, ld32(s18 + 0x13))
				st8(m + 0x2f, ld8(s18 + 0x17))
			}
			l = l + 1
			st64(s18 + 8, l)
			q = ad + 1
			g = g + 8
		} while (k > q)
	} else {
		st64(s20, f)
		g = 8
		st64(s18, 8, 0)
	}
	const h = b + g
	const i = ld64(h)
	st64(a + 0x10, ld64(s18 + 8))
	st64(a + 8, ld64(s18))
	st64(a, ld64(s20))
	st64(a + 0x28, i)
	st64(a + 0x20, h + 8)
	st64(a + 0x18, h + 8 + i)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
export function fn_143100(a: AccountInfo, b: u64, c: u64, d: u64, e: u64): u64 {
	const f: LamportsCell = a.lamports
	const g = f.borrow
	if (g > 0x7ffffffffffffffe) {
		fn_1486f0(0x10015b4e0, g, 0x7ffffffffffffffe, d, e)
	}
	f.borrow = g + 1
	const h = f.value.amount
	f.borrow = g
	return h
}

export function fn_143248(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const f = ld64(a + 0x10)
	const g = ld64(f + 0x10)
	if (g > 0x7ffffffffffffffe) {
		fn_1486f0(0x10015b510, g, 0x7ffffffffffffffe, d, e)
	}
	return ld64(f + 0x20) == 0
}

export function fn_1434c0(a: u64, b: AccountInfo, c: u64, r0: u64): u64 {
	const f: DataCell = b.data
	if (f.borrow != 0) {
		st64(a + 0x10, f + 0x10)
		st64(a, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		return r0
	}
	f.borrow = -1
	const g = f.len
	if (g == c) {
		st64(a, 0x800000000000001a /* Ok */)
		f.borrow = 0
		return 0x800000000000001a /* Ok */
	}
	if (sat_sub(c, ld32(b.key - 4)) > 0x2800) {
		st64(a, 0x8000000000000013 /* Err(ProgramError::InvalidRealloc) */)
		f.borrow = 0
		return 0x8000000000000013 /* Err(ProgramError::InvalidRealloc) */
	}
	const h = f.ptr
	st64(h - 8, c)
	f.len = c
	st64(f + 0x18, h)
	if (c > g) {
		r0 = sol_memset(h + g, 0, sat_sub(c, g))
		st64(a, 0x800000000000001a /* Ok */)
		f.borrow = f.borrow + 1
		return r0
	}
	st64(a, 0x800000000000001a /* Ok */)
	f.borrow = f.borrow + 1
	return 0x8000000000000013 /* Err(ProgramError::InvalidRealloc) */
}

export function fn_144d50(a: u64, b: u64, c: u64, d: u64, e: u64, r7: u64): u64 {
	const s1 = fp - 0x1, s18 = fp - 0x18, s38 = fp - 0x38, s40 = fp - 0x40, s70 = fp - 0x70
	let n: u64
	st32(s70 + 0x28, 0)
	st64(s70, 0, 0, 0, 0, 0)
	copyr(s38, b, 0x20)
	st64(s40, 0x100157ed1)
	let f = 8
	let g = 0
	while (true) {
		if (g >= 0x2d) {
			fn_14c5c0(g, 0x2c, 0x10015b590, d, e)
		}
		let h = ld8(s40 + f)
		if (g != 0) {
			d = s70
			e = g
			do {
				const i = (ld8(d) << 8) + h
				h = i / 0x3a
				r7 = h * 0x3a
				st8(d, i - r7)
				d = d + 1
				e = e - 1
			} while (e != 0)
		}
		if (h != 0) {
			do {
				d = h
				if (g == 0x2c) {
					fn_149678(0x100157fd1 /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s1, 0x10015b680, 0x10015b6a0)
				}
				h = d / 0x3a
				e = s70 + g
				st8(e, d - h * 0x3a)
				g = g + 1
			} while (d >= 0x3a)
		}
		f = f + 1
		if (f == 0x28) {
			const k = s70 + g
			let l = 0
			let m = s38
			while (true) {
				B18: {
					let j = g + l
					if (ld8(m + l) == 0) {
						if (j == 0x2c) {
							fn_149678(0x100157fd1 /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s1, 0x10015b680, 0x10015b6a0)
						}
						if (j > 0x2b) {
							fn_1495b0(g + l, 0x2c, 0x10015b578, k, m)
						}
						st8(k + l, 0)
						l = l + 1
						if (l != 0x20) {
							continue
						}
						j = g + l
					} else {
						if (j >= 0x2d) {
							fn_14c5c0(j, 0x2c, 0x10015b548, k, m)
						}
						n = 0
						if (j == 0) {
							break B18
						}
					}
					let o = 0
					while (true) {
						const p = s70 + o
						const q = ld8(p)
						if (q > 0x39) {
							fn_1495b0(q, 0x3a, 0x10015b560, p, m)
						}
						m = q + 0x100157ed1
						st8(p, ld8(m + 0x80))
						o = o + 1
						if (j == o) {
							n = 1
							if (j == 1) {
								break
							}
							let u = j >> 1
							let r = s70
							let s = j + r - 1
							while (true) {
								const t = ld8(r)
								st8(r, ld8(s))
								st8(s, t)
								s = s - 1
								r = r + 1
								u = u - 1
								if (u == 0) {
									n = j
									if (0x2d > j) {
										break B18
									}
									fn_14c5c0(j, 0x2c, 0x10015b630, s, t)
								}
							}
						}
					}
				}
				fn_14c760(s40, s70, n, r7)
				if (ld64(s40) == 0) {
					return Formatter_write_str(a, ld64(s38), ld64(s38 + 8))
				}
				copyr(s18, s38, 0x10)
				fn_149678(0x100157fd1 /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x10015b648, 0x10015b668)
			}
		}
	}
}

export function fn_145330(a: u64, b: u64, c: u64, d: u64, e: u64, r7: u64): u64 {
	return fn_144d50(b, a, a, d, e, r7)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
export function fn_147238(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	fn_1478b8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
export function fn_1478b8(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	custom_panic(a, b, c, d, e)
	abort()
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (points to it), d (value), e (value)
export function fn_147e78(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20
	let l, m: u64
	B11: {
		let f = ld64(b + 8)
		if (f != 0) {
			const g = ld64(b)
			d = 0
			let h = g + 8
			while (true) {
				let i = ld64(h) + d
				h = h + 0x10
				f = f - 1
				d = i
				if (f == 0) {
					if (ld64(b + 0x18) != 0) {
						h = ld64(g + 8)
						const k = h == 0
						const j = 0x10 > i
						if (0 > (i as i64)) {
							break
						}
						i = i << 1
						if ((j & k & 1) != 0) {
							break
						}
					}
					l = 1
					m = 0
					if (i == 0) {
						break B11
					}
					if (0 > (i as i64)) {
						raw_vec_handle_error(0, i, h, d, e)
					}
					l = __rust_alloc(i, 1)
					h = undef
					d = undef
					e = undef
					if (l == 0) {
						raw_vec_handle_error(1, i, h, d, e)
					}
					m = i
					break B11
				}
			}
		}
		l = 1
		m = 0
	}
	st64(s20, m, l, 0)
	const n = fn_14a698(s20, 0x10015b800, b, d, e)
	if (n != 0) {
		fn_149678("a formatting trait implementation returned an error", 0x33, s1, 0x10015b858, 0x10015b878)
	}
	st64(a + 0x10, ld64(s20 + 0x10))
	st64(a + 8, ld64(s20 + 8))
	st64(a, ld64(s20))
	return n
}

export function fn_148658(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s1 = fp - 0x1, s18 = fp - 0x18, s48 = fp - 0x48
	st64(s48, 0x10015b890)
	st64(s48 + 0x10, s18)
	st64(s18, s1, BorrowMutError_fmt)
	st64(s48 + 0x20, 0)
	st64(s48 + 8, 1)
	st64(s48 + 0x18, 1)
	// fmt "already borrowed: {}" {} = *s1 [BorrowMutError_fmt]
	fn_149478(s48, a, c, d, e)
}

export function fn_1486f0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s1 = fp - 0x1, s18 = fp - 0x18, s48 = fp - 0x48
	st64(s48, 0x10015b8a0)
	st64(s48 + 0x10, s18)
	st64(s18, s1, BorrowError_fmt)
	st64(s48 + 0x20, 0)
	st64(s48 + 8, 1)
	st64(s48 + 0x18, 1)
	// fmt "already mutably borrowed: {}" {} = *s1 [BorrowError_fmt]
	fn_149478(s48, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), e (value)
export function fn_1490e8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_1494c8("called `Option::unwrap()` on a `None` value", 0x2b, a, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
export function fn_149478(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	const s20 = fp - 0x20, s28 = fp - 0x28
	st64(s20, 0x10015b8e0, a, b)
	st16(s20 + 0x18, 1)
	st64(s28, 1)
	fn_147238(s28, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: e (value)
export function fn_1494c8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s10 = fp - 0x10, s38 = fp - 0x38, s40 = fp - 0x40
	st64(s40, s10)
	st64(s10, a, b)
	st64(s38, 1, 8, 0, 0)
	fn_149478(s40, c, c, s10, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), d (value), e (value)
export function fn_1495b0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	st64(s60, a, b, 0x10015b900)
	st64(s50 + 0x10, s20)
	st64(s20, s58, fn_14f060, s60, fn_14f060)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "index out of bounds: the len is {} but the index is {}" {} = b [fn_14f060], {} = a [fn_14f060]
	fn_149478(s50, c, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it)
export function fn_149678(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70
	st64(s70, a, b, c, d, 0x10015b920)
	st64(s50 + 0x10, s20)
	st64(s20, s70, T_fmt_14f0b8, s60, T_fmt_14f088)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "{}: {}" {} = a [T_fmt_14f0b8], {} = c [T_fmt_14f088]
	fn_149478(s50, e, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
export function fn_14c4f0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c4f8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
export function fn_14c4f8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	st64(s60, a, b, 0x10015b9b8)
	st64(s50 + 0x10, s20)
	st64(s20, s60, fn_14f060, s58, fn_14f060)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "range start index {} out of range for slice of length {}" {} = a [fn_14f060], {} = b [fn_14f060]
	fn_149478(s50, c, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (value), e (value)
export function fn_14c5c0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c5c8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (value), d (value), e (value)
export function fn_14c5c8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	st64(s60, a, b, 0x10015b9d8)
	st64(s50 + 0x10, s20)
	st64(s20, s60, fn_14f060, s58, fn_14f060)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "range end index {} out of range for slice of length {}" {} = a [fn_14f060], {} = b [fn_14f060]
	fn_149478(s50, c, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (value), e (value)
export function fn_14c690(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c698(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (value), d (value), e (value)
export function fn_14c698(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	st64(s60, a, b, 0x10015b9f8)
	st64(s50 + 0x10, s20)
	st64(s20, s60, fn_14f060, s58, fn_14f060)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "slice index starts at {} but ends at {}" {} = a [fn_14f060], {} = b [fn_14f060]
	fn_149478(s50, c, c, d, e)
}

export function fn_14d330(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14d338(a, b, c, d, e)
}

export function fn_14d338(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s50 = fp - 0x50, s80 = fp - 0x80, s90 = fp - 0x90, s94 = fp - 0x94, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sc8 = fp - 0xc8, sd0 = fp - 0xd0
	let f, q: u64
	st64(sd0, c, d)
	if (0x101 > b) {
		f = b
	} else {
		f = 0x100
		if (-0x41 >= (ld8(a + 0x100) as i8)) {
			f = 0xff
			if (-0x41 >= (ld8(a + 0xff) as i8)) {
				f = (ld8(a + 0xfe) as i8) > -0x41 ? 0xfe : 0xfd
			}
		}
		if (-0x41 >= (ld8(a + f) as i8)) {
			fn_14d330(a, b, 0, f, e)
		}
	}
	st64(sc0, a, f, b > f ? 0x1001588a1 : 1, b > f ? 5 : 0)
	if (b >= c && b >= d) {
		if (d >= c) {
			if (c == 0 || (c >= b || (ld8(a + c) as i8) >= -0x40)) {
				c = d
			}
			st64(sa0, c)
			let l = b
			let g = c
			if (b > c) {
				const h = g
				g = sat_sub(g, 3)
				if (g > h + 1) {
					fn_14c690(g, h + 1, 0x10015bad8, g, e)
				}
				let i = a + (h + 1) - (a + g)
				let j = a + h
				while (true) {
					if (i != 0) {
						i = i - 1
						const k = ld8(j)
						j = j - 1
						if (-0x40 > (k as i8)) {
							continue
						}
					}
					l = i + g
					break
				}
			}
			if (l != 0) {
				if (b > l) {
					g = ld8(a + l) as i8
					if (-0x41 >= (g as i64)) {
						fn_14d330(a, b, l, b, e)
					}
				} else if (l != b) {
					fn_14d330(a, b, l, b, e)
				}
			}
			if (l == b) {
				fn_1490e8(e, b, l, g, e)
			}
			const m = a + l
			const n = ld8(m)
			if ((n as i8) > -1) {
				q = n
			} else {
				const o = ld8(m + 1)
				g = n & 0x1f
				q = (g << 6) | o & 0x3f
				if (n > 0xdf) {
					const p = ((o & 0x3f) << 6) | ld8(m + 2) & 0x3f
					q = p | (g << 0xc)
					if (n >= 0xf0) {
						g = (g << 0x12) & 0x1c0000
						q = (p << 6) | ld8(m + 3) & 0x3f | g
					}
				}
			}
			st32(s94, q)
			st64(s90, l, (0x80 > q ? 1 : 0x800 > q ? 2 : 0x10000 > q ? 3 : 4) + l, 0x10015ba58)
			st64(s80 + 0x10, s50)
			st64(s50, sa0, fn_14f060, s94, fn_14c2b0, s90, Range_fmt, sc0, T_fmt_14f0b8, sb0, T_fmt_14f0b8)
			st64(s80 + 0x20, 0)
			st64(s80 + 8, 5)
			st64(s80 + 0x18, 5)
			// fmt "byte index {} is not a char boundary; it is inside {} (bytes {}) of `{}`{}" {} = *sa0 [fn_14f060], {} = q [fn_14c2b0], {} = l [Range_fmt], {} = *sc0 [T_fmt_14f0b8], {} = *sb0 [T_fmt_14f0b8]
			fn_149478(s80, e, l, g, e)
		}
		st64(s80, 0x10015ba18)
		st64(s80 + 0x10, s50)
		st64(s50, sd0, fn_14f060, sc8, fn_14f060, sc0, T_fmt_14f0b8, sb0, T_fmt_14f0b8)
		st64(s80 + 0x20, 0)
		st64(s80 + 8, 4)
		st64(s80 + 0x18, 4)
		// fmt "begin <= end ({} <= {}) when slicing `{}`{}" {} = *sd0 [fn_14f060], {} = *sc8 [fn_14f060], {} = a [T_fmt_14f0b8], {} = b > f ? 0x1001588a1 : 1 [T_fmt_14f0b8]
		fn_149478(s80, e, c, d, e)
	}
	c = c > b ? c : d
	st64(s90, c)
	st64(s80, 0x10015baa8)
	st64(s80 + 0x10, s50)
	st64(s50, s90, fn_14f060, sc0, T_fmt_14f0b8, sb0, T_fmt_14f0b8)
	st64(s80 + 0x20, 0)
	st64(s80 + 8, 3)
	st64(s80 + 0x18, 3)
	// fmt "byte index {} is out of bounds of `{}`{}" {} = c [fn_14f060], {} = a [T_fmt_14f0b8], {} = b > f ? 0x1001588a1 : 1 [T_fmt_14f0b8]
	fn_149478(s80, e, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it), d (value), e (value)
export function fn_14e168(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x10015bb80, 1, 8, 0, 0)
	// fmt "attempt to divide by zero"
	fn_149478(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), e (value)
export function fn_14e1c0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x10015bb90, 1, 8, 0, 0)
	// fmt "attempt to calculate the remainder with a divisor of zero"
	fn_149478(s30, a, c, d, e)
}

export function fn_14ef78(a: u64, b: u64): u64 {
	return fn_14ecd0(ld8(a), 1, b)
}

export function fn_14efa0(a: u64, b: u64): u64 {
	return fn_14ecd0(ld16(a), 1, b)
}

export function fn_14f060(a: u64, b: u64): u64 {
	return fn_14ecd0(ld64(a), 1, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
export function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
export function memmove(a: u64, b: u64, c: u64): u64 {
	sol_memmove(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
export function memset(a: u64, b: u64, c: u64) {
	sol_memset(a, b as u8, c)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
export function fn_14f7f8(a: u64, b: u64): u64 {
	return fn_14f808(a, b)
}
