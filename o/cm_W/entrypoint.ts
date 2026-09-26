/// <reference path="./lib.d.ts" />
// entrypoint, dispatcher and code outside instruction handlers
import { anchor_error_from, fn_10ebf8, fn_110d30, fn_11e480, fn_13e190, fn_13e5a0, fn_13e628, fn_147a20, fn_14e808, fn_14e940, fn_14ec00, fn_14ec98, fn_14ed60, fn_153150, fn_153158, fn_153160, fn_154730, fn_16828, fn_4130, memcpy, memset2 } from './shared.ts'
import { fn_10e370, ix_create_permission_pda } from './ix/create_permission_pda.ts'
import { ix_create_amm_config } from './ix/create_amm_config.ts'
import { ix_create_support_mint_associated } from './ix/create_support_mint_associated.ts'
import { ix_update_amm_config } from './ix/update_amm_config.ts'
import { ix_create_dynamic_fee_config } from './ix/create_dynamic_fee_config.ts'
import { ix_update_dynamic_fee_config } from './ix/update_dynamic_fee_config.ts'
import { ix_close_permission_pda } from './ix/close_permission_pda.ts'
import { ix_close_support_mint_associated } from './ix/close_support_mint_associated.ts'
import { ix_create_pool } from './ix/create_pool.ts'
import { ix_create_customizable_pool } from './ix/create_customizable_pool.ts'
import { ix_create_permissioned_pool } from './ix/create_permissioned_pool.ts'
import { ix_update_pool_status } from './ix/update_pool_status.ts'
import { ix_create_operation_account } from './ix/create_operation_account.ts'
import { ix_update_operation_account } from './ix/update_operation_account.ts'
import { ix_transfer_reward_owner } from './ix/transfer_reward_owner.ts'
import { ix_initialize_reward } from './ix/initialize_reward.ts'
import { ix_collect_remaining_rewards } from './ix/collect_remaining_rewards.ts'
import { ix_update_reward_infos } from './ix/update_reward_infos.ts'
import { ix_set_reward_params } from './ix/set_reward_params.ts'
import { ix_collect_protocol_fee } from './ix/collect_protocol_fee.ts'
import { ix_collect_fund_fee } from './ix/collect_fund_fee.ts'
import { ix_open_position } from './ix/open_position.ts'
import { ix_open_position_v2 } from './ix/open_position_v2.ts'
import { ix_open_position_with_token22_nft } from './ix/open_position_with_token22_nft.ts'
import { ix_close_position } from './ix/close_position.ts'
import { ix_increase_liquidity } from './ix/increase_liquidity.ts'
import { ix_increase_liquidity_v2 } from './ix/increase_liquidity_v2.ts'
import { ix_decrease_liquidity } from './ix/decrease_liquidity.ts'
import { ix_decrease_liquidity_v2 } from './ix/decrease_liquidity_v2.ts'
import { ix_swap } from './ix/swap.ts'
import { ix_swap_v2 } from './ix/swap_v2.ts'
import { ix_swap_router_base_in } from './ix/swap_router_base_in.ts'
import { ix_close_protocol_position } from './ix/close_protocol_position.ts'
import { ix_open_limit_order } from './ix/open_limit_order.ts'
import { ix_increase_limit_order } from './ix/increase_limit_order.ts'
import { ix_decrease_limit_order } from './ix/decrease_limit_order.ts'
import { ix_settle_limit_order } from './ix/settle_limit_order.ts'
import { ix_close_limit_order } from './ix/close_limit_order.ts'
import { ix_idl_close_account } from './ix/idl_close_account.ts'
import { ix_idl_set_buffer } from './ix/idl_set_buffer.ts'
import { fn_1442d0, ix_idl_create_account } from './ix/idl_create_account.ts'

export function entrypoint(input: Input): u64 {
	const s18 = fp - 0x18, s48 = fp - 0x48, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	fn_143038(s48, input)
	let h = ld64(s48 + 0x10)
	const g = ld64(s48 + 8)
	const i = ld64(s48 + 0x18)
	const f = ld64(s48 + 0x20)
	st64(sff8, ld64(s48 + 0x28))
	st64(s1000, f)
	let j = anchor_dispatch(s48, i, g, h, f, ld64(sff8))
	let l = 0
	if (ld64(s48) != 0x800000000000001a /* Ok */) {
		copyr(s18, s48, 0x18)
		j = solana_program_error_from(s18, j)
		l = j
	}
	if (h == 0) {
		return l
	}
	let k = g + 0x10
	while (true) {
		const m = ld64(k - 8)
		if (rc_release(m)) {
			j = Rc_drop_slow_14df0(k - 8, j)
		}
		const n = ld64(k)
		if (rc_release(n)) {
			j = Rc_drop_slow_14df0(k, j)
		}
		k = k + 0x30
		h = h - 1
		if (h == 0) {
			return l
		}
	}
}

export function fn_5bd8(a: u64, b: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	let k, p, q: u64
	const f = ld64(b + 0x18)
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) != 0) {
		const o = anchor_error_from(s50, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const n = ld64(s50 + 8)
		const m = ld64(s50)
		copyr(s40, f, 0x20)
		st64(s20, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
		q = Error_with_pubkeys(s60, m, n, s40, o)
		p = ld64(s60)
		st64(a + 8, ld64(s60 + 8))
		st64(a, p)
		return q
	}
	q = AccountInfo_try_borrow_data(s40, b, g as u32)
	const l = ld64(s40 + 0x10)
	const i = ld64(s40 + 8)
	const h = ld64(s40)
	if (h == 0x800000000000001a /* Ok */) {
		const j = ld64(i + 8)
		if (8 > j) {
			q = anchor_error_from(s80, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, j)
			k = ld64(s80)
			st64(a + 8, ld64(s80 + 8))
			st64(a, k)
			st64(l, ld64(l) - 1)
			return q
		}
		if (ld64(ld64(i)) != 0x2a81f931cd559bc0 /* account:TickArrayState */) {
			q = anchor_error_from(s80, 0xbba /* anchor::AccountDiscriminatorMismatch */, 0x2a81f931cd559bc0 /* account:TickArrayState */)
			k = ld64(s80)
			st64(a + 8, ld64(s80 + 8))
			st64(a, k)
			st64(l, ld64(l) - 1)
			return q
		}
		st64(a + 8, b)
		st64(a, 2)
		st64(l, ld64(l) - 1)
		return q
	}
	st64(s40, h, i, l)
	q = fn_13e628(s70, s40)
	p = ld64(s70)
	st64(a + 8, ld64(s70 + 8))
	st64(a, p)
	return q
}

export function fn_61a8(a: u64, b: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	let k, p, q: u64
	const f = ld64(b + 0x18)
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) != 0) {
		const o = anchor_error_from(s50, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const n = ld64(s50 + 8)
		const m = ld64(s50)
		copyr(s40, f, 0x20)
		st64(s20, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
		q = Error_with_pubkeys(s60, m, n, s40, o)
		p = ld64(s60)
		st64(a + 8, ld64(s60 + 8))
		st64(a, p)
		return q
	}
	q = AccountInfo_try_borrow_data(s40, b, g as u32)
	const l = ld64(s40 + 0x10)
	const i = ld64(s40 + 8)
	const h = ld64(s40)
	if (h == 0x800000000000001a /* Ok */) {
		const j = ld64(i + 8)
		if (8 > j) {
			q = anchor_error_from(s80, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, j)
			k = ld64(s80)
			st64(a + 8, ld64(s80 + 8))
			st64(a, k)
			st64(l, ld64(l) - 1)
			return q
		}
		if (ld64(ld64(i)) != 0xfcb7de51ed3aec13 /* account:OperationState */) {
			q = anchor_error_from(s80, 0xbba /* anchor::AccountDiscriminatorMismatch */, 0xfcb7de51ed3aec13 /* account:OperationState */)
			k = ld64(s80)
			st64(a + 8, ld64(s80 + 8))
			st64(a, k)
			st64(l, ld64(l) - 1)
			return q
		}
		st64(a + 8, b)
		st64(a, 2)
		st64(l, ld64(l) - 1)
		return q
	}
	st64(s40, h, i, l)
	q = fn_13e628(s70, s40)
	p = ld64(s70)
	st64(a + 8, ld64(s70 + 8))
	st64(a, p)
	return q
}

export function fn_78d0(a: u64, b: u64) {
	const s10 = fp - 0x10
	let q, r, s: u64
	const g = ld64(b + 0x10)
	const f = fn_147a10(ld64(b))
	let p = undef
	if (f == 0) {
		anchor_error_from(s10, 0xbc7 /* anchor::AccountSysvarMismatch */, p, q, r)
		s = ld64(s10)
		st64(a + 0x10, ld64(s10 + 8))
		st64(a + 8, s)
		st64(a, 0)
	} else {
		const h = ld64(g + 0x10)
		if (h > 0x7ffffffffffffffe) {
			fn_14e808(0x10015f760, 0x7ffffffffffffffe, p, q, r)
		}
		st64(g + 0x10, h + 1)
		const i = ld64(g + 0x20)
		if (i >= 8 && (i != 0x10 && (i & -8) != 8)) {
			const j = ld64(g + 0x18)
			const m = ld64(j)
			const l = ld64(j + 8)
			const k = ld8(j + 0x10)
			st64(g + 0x10, h)
			st8(a + 0x18, k)
			st64(a + 0x10, l)
			st64(a + 8, m)
			st64(a, b)
			return
		}
		const n = fn_149018(0x2500000003)
		p = undef
		const o = min(ld64(n) ^ 0x8000000000000000, 8)
		if (o - 1 >= 7 && o == 0) {
			const t = ld64(n + 8)
			p = (t & 3) - 2
			if (p >= 2 && (t & 3) != 0) {
				const u = ld64(ld64(t + 7))
				if (u != 0) {
					callx(u, ld64(t - 1), u, p)
					p = undef
				}
			}
		}
		st64(g + 0x10, ld64(g + 0x10) - 1)
		anchor_error_from(s10, 0xbc7 /* anchor::AccountSysvarMismatch */, p, q, r)
		s = ld64(s10)
		st64(a + 0x10, ld64(s10 + 8))
		st64(a + 8, s)
		st64(a, 0)
	}
}

export function fn_9660(a: u64, b: AccountInfo) {
	const s10 = fp - 0x10, s20 = fp - 0x20, s40 = fp - 0x40, s48 = fp - 0x48, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0
	let p: u64
	const f = b.owner
	if ((memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0) {
		anchor_error_from(sa0, 0xbc4 /* anchor::AccountNotInitialized */)
		p = ld64(sa0)
		st64(a + 0x10, ld64(sa0 + 8))
		st64(a + 8, p)
		st64(a, 0)
		return
	}
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s60, b, g as u32)
		const o = ld64(s60 + 0x10)
		const l = ld64(s60 + 8)
		const k = ld64(s60)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s20 + 8, ld64(l + 8))
			st64(s20, m)
			fn_125528(s60, s20, 0x800000000000001a /* Ok */)
			if (ld32(s60) != 0) {
				const n = ld64(s60 + 8)
				st64(a + 0x10, ld64(s60 + 0x10))
				st64(a + 8, n)
				st64(a, 0)
				st64(o, ld64(o) - 1)
			} else {
				copy(s10, s48, 0x10)
				const r = ld32(s60 + 4)
				const q = ld64(s60 + 8)
				st64(a + 0x14, ld64(s60 + 0x10))
				st64(a + 0xc, q)
				st32(a + 8, r)
				st64(a, b)
				copy(a + 0x1c, s10, 0x10)
				st64(o, ld64(o) - 1)
			}
		} else {
			st64(s60, k, l, o)
			fn_13e628(s90, s60)
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
		st64(s40, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
		Error_with_pubkeys(s80, h, i, s60, j)
		p = ld64(s80)
		st64(a + 0x10, ld64(s80 + 8))
		st64(a + 8, p)
		st64(a, 0)
	}
}

export function fn_c038(a: u64, b: u64): u64 {
	const sf8 = fp - 0xf8, s100 = fp - 0x100, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168
	let q, r: u64
	const f = ld64(b + 0x18)
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
			r = fn_10df30(s118, s128, 0x800000000000001a /* Ok */)
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

export function fn_c400(a: u64, b: u64): u64 {
	const sc8 = fp - 0xc8, sd0 = fp - 0xd0, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let q, r: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0) {
		r = anchor_error_from(s138, 0xbc4 /* anchor::AccountNotInitialized */)
		q = ld64(s138)
		st64(a + 0x10, ld64(s138 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(se8, b, g as u32)
		const p = ld64(se8 + 0x10)
		const l = ld64(se8 + 8)
		const k = ld64(se8)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(sf8 + 8, ld64(l + 8))
			st64(sf8, m)
			r = fn_110218(se8, sf8, 0x800000000000001a /* Ok */)
			const n = ld64(se8 + 0x10)
			const o = ld64(se8 + 8)
			if (ld64(se8) != 0) {
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, 0)
				st64(p, ld64(p) - 1)
				return r
			}
			r = memcpy(a + 0x18, sd0, 0xd0)
			st64(a + 0x10, n)
			st64(a + 8, o)
			st64(a, b)
			st64(p, ld64(p) - 1)
			return r
		}
		st64(se8, k, l, p)
		r = fn_13e628(s128, se8)
		q = ld64(s128)
		st64(a + 0x10, ld64(s128 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const j = anchor_error_from(s108, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	const i = ld64(s108 + 8)
	const h = ld64(s108)
	copyr(se8, f, 0x20)
	st64(sc8, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
	r = Error_with_pubkeys(s118, h, i, se8, j)
	q = ld64(s118)
	st64(a + 0x10, ld64(s118 + 8))
	st64(a + 8, q)
	st64(a, 0)
	return r
}

export function fn_cbc8(a: u64, b: u64): u64 {
	const s50 = fp - 0x50, s58 = fp - 0x58, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0
	let q, r: u64
	const f = ld64(b + 0x18)
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
			r = fn_110d30(s70, s80, 0x800000000000001a /* Ok */)
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

export function fn_d358(a: u64, b: u64): u64 {
	const s100 = fp - 0x100, s108 = fp - 0x108, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170
	let q, r: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0) {
		r = anchor_error_from(s170, 0xbc4 /* anchor::AccountNotInitialized */)
		q = ld64(s170)
		st64(a + 0x10, ld64(s170 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s120, b, g as u32)
		const p = ld64(s120 + 0x10)
		const l = ld64(s120 + 8)
		const k = ld64(s120)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s130 + 8, ld64(l + 8))
			st64(s130, m)
			r = fn_10e768(s120, s130, 0x800000000000001a /* Ok */)
			const n = ld64(s120 + 0x10)
			const o = ld64(s120 + 8)
			if (ld64(s120) != 0) {
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, 0)
				st64(p, ld64(p) - 1)
				return r
			}
			r = memcpy(a + 0x18, s108, 0x108)
			st64(a + 0x10, n)
			st64(a + 8, o)
			st64(a, b)
			st64(p, ld64(p) - 1)
			return r
		}
		st64(s120, k, l, p)
		r = fn_13e628(s160, s120)
		q = ld64(s160)
		st64(a + 0x10, ld64(s160 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const j = anchor_error_from(s140, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	const i = ld64(s140 + 8)
	const h = ld64(s140)
	copyr(s120, f, 0x20)
	st64(s100, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
	r = Error_with_pubkeys(s150, h, i, s120, j)
	q = ld64(s150)
	st64(a + 0x10, ld64(s150 + 8))
	st64(a + 8, q)
	st64(a, 0)
	return r
}

export function fn_d720(a: u64, b: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s40 = fp - 0x40, s48 = fp - 0x48, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0
	let p, q: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0) {
		q = anchor_error_from(sa0, 0xbc4 /* anchor::AccountNotInitialized */)
		p = ld64(sa0)
		st64(a + 0x10, ld64(sa0 + 8))
		st64(a + 8, p)
		st64(a, 0)
		return q
	}
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s60, b, g as u32)
		const o = ld64(s60 + 0x10)
		const l = ld64(s60 + 8)
		const k = ld64(s60)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s20 + 8, ld64(l + 8))
			st64(s20, m)
			q = fn_1250e8(s60, s20, 0x800000000000001a /* Ok */)
			if (ld32(s60) != 0) {
				const n = ld64(s60 + 8)
				st64(a + 0x10, ld64(s60 + 0x10))
				st64(a + 8, n)
				st64(a, 0)
				st64(o, ld64(o) - 1)
				return q
			}
			copy(s10, s48, 0x10)
			const s = ld32(s60 + 4)
			const r = ld64(s60 + 8)
			st64(a + 0x14, ld64(s60 + 0x10))
			st64(a + 0xc, r)
			st32(a + 8, s)
			st64(a, b)
			copy(a + 0x1c, s10, 0x10)
			st64(o, ld64(o) - 1)
			return q
		}
		st64(s60, k, l, o)
		q = fn_13e628(s90, s60)
		p = ld64(s90)
		st64(a + 0x10, ld64(s90 + 8))
		st64(a + 8, p)
		st64(a, 0)
		return q
	}
	const j = anchor_error_from(s70, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	const i = ld64(s70 + 8)
	const h = ld64(s70)
	copyr(s60, f, 0x20)
	st64(s40, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
	q = Error_with_pubkeys(s80, h, i, s60, j)
	p = ld64(s80)
	st64(a + 0x10, ld64(s80 + 8))
	st64(a + 8, p)
	st64(a, 0)
	return q
}

export function fn_f320(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return PanicInfo_fmt(ld64(a), b, c, d, e)
}

export function fn_f5b0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, 0x10015f818, b, d, e)
}

export function fn_fc08() {
}

export function fn_fc10() {
}

export function fn_fd70() {
}

export function fn_10cc8(a: u64) {
	st64(a, 0)
}

export function fn_10cd8() {
}

export function fn_16a50(a: u64, b: u64) {
	let p: u64
	const g: AccountInfo = ld64(b)
	const f = ld64(b + 8)
	let h = f
	let o = g
	if (0x10 > f) {
		p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		st64(b, o + h, 0)
		st64(a + 8, p)
		st64(a, 1)
	} else {
		o = g + 0x10
		h = f - 0x10
		if (0x10 > h) {
			p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
			st64(b, o + h, 0)
			st64(a + 8, p)
			st64(a, 1)
		} else {
			o = g + 0x20
			h = f - 0x20
			if (0x10 > h) {
				p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
				st64(b, o + h, 0)
				st64(a + 8, p)
				st64(a, 1)
			} else {
				const m: LamportsCell = g.lamports
				const n = g.key
				const l: DataCell = g.data
				const k = g.owner
				const j = g.rent_epoch
				const i = ld64(g + 0x28)
				st64(b + 8, f - 0x30)
				st64(b, g + 0x30)
				st64(a + 0x30, i)
				st64(a + 0x28, j)
				st64(a + 0x20, k)
				st64(a + 0x18, l)
				st64(a + 0x10, m)
				st64(a + 8, n)
				st64(a, 0)
			}
		}
	}
}

export function fn_10df30(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let g, j: u64
	if (8 > ld64(b + 8)) {
		j = anchor_error_from(s138, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		g = ld64(s138)
		st64(a + 0x10, ld64(s138 + 8))
		st64(a + 8, g)
		st64(a, 1)
		return j
	}
	if (ld64(ld64(b)) == 0x1ca1fd0a4f1c53e0 /* account:Permission */) {
		return fn_10e370(a, b, 0x1ca1fd0a4f1c53e0 /* account:Permission */, d, e)
	}
	ErrorCode_name(s78, 0x1001598e8, 0x1ca1fd0a4f1c53e0 /* account:Permission */, d, e)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (ErrorCode_fmt(0x1001598e8, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015b42b)
	st32(sf8 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 8)
	st64(s118 + 0x10, 0x25)
	st64(s118, 0)
	j = fn_13e5a0(s128, s118)
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	g = ld64(s128)
	const h = f != 0 ? sat_sub(f, 0xa) : 0x300007ff6
	const i = ld64(s128 + 8)
	if ((g & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x697373696d726550)
		st16(h + 8, 0x6e6f)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x697373696d726550)
		st16(h + 8, 0x6e6f)
		void ld64(i)
	}
	st64(i + 0x10, h, 0xa)
	st64(i + 8, 0xa)
	st64(i, 1)
	st64(a + 0x10, i)
	st64(a + 8, g)
	st64(a, 1)
	return j
}

export function fn_10e768(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let g, j: u64
	if (8 > ld64(b + 8)) {
		j = anchor_error_from(s138, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		g = ld64(s138)
		st64(a + 0x10, ld64(s138 + 8))
		st64(a + 8, g)
		st64(a, 1)
		return j
	}
	if (ld64(ld64(b)) == 0x75190fe67e966f46 /* account:PersonalPositionState */) {
		return fn_10ebf8(a, b, 0x75190fe67e966f46 /* account:PersonalPositionState */, d, e)
	}
	ErrorCode_name(s78, 0x1001598e8, 0x75190fe67e966f46 /* account:PersonalPositionState */, d, e)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (ErrorCode_fmt(0x1001598e8, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a715)
	st32(sf8 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 8)
	st64(s118 + 0x10, 0x2c)
	st64(s118, 0)
	j = fn_13e5a0(s128, s118)
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	g = ld64(s128)
	const h = f != 0 ? sat_sub(f, 0x15) : 0x300007feb
	const i = ld64(s128 + 8)
	if ((g & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x15, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 0xd, 0x65746174536e6f69)
		st64(h + 8, 0x6e6f697469736f50)
		st64(h, 0x6c616e6f73726550)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x15, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 0xd, 0x65746174536e6f69)
		st64(h + 8, 0x6e6f697469736f50)
		st64(h, 0x6c616e6f73726550)
		void ld64(i)
	}
	st64(i + 0x10, h, 0x15)
	st64(i + 8, 0x15)
	st64(i, 1)
	st64(a + 0x10, i)
	st64(a + 8, g)
	st64(a, 1)
	return j
}

export function fn_110218(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let g, j: u64
	if (8 > ld64(b + 8)) {
		j = anchor_error_from(s138, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		g = ld64(s138)
		st64(a + 0x10, ld64(s138 + 8))
		st64(a + 8, g)
		st64(a, 1)
		return j
	}
	if (ld64(ld64(b)) == 0x6aa0da926391e264 /* account:ProtocolPositionState */) {
		return fn_1106a8(a, b, 0x6aa0da926391e264 /* account:ProtocolPositionState */, d, e)
	}
	ErrorCode_name(s78, 0x1001598e8, 0x6aa0da926391e264 /* account:ProtocolPositionState */, d, e)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (ErrorCode_fmt(0x1001598e8, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a783)
	st32(sf8 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0xf)
	st64(s118 + 0x10, 0x2c)
	st64(s118, 0)
	j = fn_13e5a0(s128, s118)
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	g = ld64(s128)
	const h = f != 0 ? sat_sub(f, 0x15) : 0x300007feb
	const i = ld64(s128 + 8)
	if ((g & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x15, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 0xd, 0x65746174536e6f69)
		st64(h + 8, 0x6e6f697469736f50)
		st64(h, 0x6c6f636f746f7250)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x15, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 0xd, 0x65746174536e6f69)
		st64(h + 8, 0x6e6f697469736f50)
		st64(h, 0x6c6f636f746f7250)
		void ld64(i)
	}
	st64(i + 0x10, h, 0x15)
	st64(i + 8, 0x15)
	st64(i, 1)
	st64(a + 0x10, i)
	st64(a + 8, g)
	st64(a, 1)
	return j
}

export function fn_1106a8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s30 = fp - 0x30, s40 = fp - 0x40, s68 = fp - 0x68, s88 = fp - 0x88, sa8 = fp - 0xa8, sb8 = fp - 0xb8
	let n, o, p, q, v: u64
	const f = ld64(b + 8)
	if (8 > f) {
		fn_153150(8, f, 0x100160b98, d, e)
	}
	B15: {
		if (f != 8 && f - 8 >= 0x21) {
			const g = ld64(b)
			const i = ld8(g + 8)
			const h = ld64(g + 0xf)
			st8(s40 + 8, ld8(g + 0x17))
			st32(s88 + 0x18, ld32(g + 9))
			st16(s88 + 0x1c, ld16(g + 0xd))
			st64(s40, h)
			const y = ld64(s40 + 1)
			copy(s88, g + 0x18, 0x10)
			st8(s88 + 0x10, ld8(g + 0x28))
			if (f - 0x29 >= 4 && (f - 0x2d >= 4 && (f - 0x31 >= 0x10 && (f - 0x41 >= 0x10 && (f - 0x51 >= 0x10 && (f - 0x61 >= 8 && f - 0x69 >= 8)))))) {
				const am = ld32(g + 0x29)
				const al = ld32(g + 0x2d)
				const ah = ld64(g + 0x39)
				const ai = ld64(g + 0x31)
				const af = ld64(g + 0x49)
				const ag = ld64(g + 0x41)
				const ad = ld64(g + 0x59)
				const ae = ld64(g + 0x51)
				const ak = ld64(g + 0x61)
				const aj = ld64(g + 0x69)
				st64(sa8, g + 0x71, f - 0x71)
				fn_16a50(s40, sa8)
				q = ld64(s40 + 8)
				if (ld64(s40) != 0) {
					break B15
				}
				copyr(s68, s30, 0x28)
				const j = ld64(sa8 + 8)
				if (j >= 8) {
					const k = ld64(sa8)
					const ac = ld64(k)
					st64(sa8, k + 8, j - 8)
					fn_16828(s40, sa8)
					const l = ld64(s40 + 8)
					if (ld64(s40) != 0) {
						q = l
						break B15
					}
					v = memcpy(a + 0xa8, s30, 0x30)
					st32(sa8 + 0x10, ld32(s88 + 0x18))
					st16(sa8 + 0x14, ld16(s88 + 0x1c))
					st8(s30, ld8(s88 + 0x10))
					copyr(s40, s88, 0x10)
					st64(a + 0x80, ld64(s68 + 0x20))
					st64(a + 0x78, ld64(s68 + 0x18))
					st64(a + 0x70, ld64(s68 + 0x10))
					st64(a + 0x68, ld64(s68 + 8))
					st64(a + 0x60, ld64(s68))
					const w = ld32(sa8 + 0x10)
					st32(sa8 + 0x18, w)
					const x = ld16(sa8 + 0x14)
					st16(sa8 + 0x1c, x)
					st64(a + 0xf, y)
					st8(a + 0xe, h)
					st16(a + 0xc, x)
					st32(a + 8, w)
					const ab = ld64(s40)
					const aa = ld64(s40 + 8)
					const z = ld8(s30)
					st64(a + 0x50, ad)
					st64(a + 0x48, ae)
					st64(a + 0x40, af)
					st64(a + 0x38, ag)
					st64(a + 0x30, ah)
					st64(a + 0x28, ai)
					st8(a + 0x27, z)
					st64(a + 0x1f, aa)
					st64(a + 0x17, ab)
					st8(a + 0xe0, i)
					st32(a + 0xdc, al)
					st32(a + 0xd8, am)
					st64(a + 0xa0, l)
					st64(a + 0x98, ac)
					st64(a + 0x90, aj)
					st64(a + 0x88, ak)
					st64(a + 0x58, q)
					st64(a, 0)
					return v
				}
			}
		}
		const m = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		q = m
	}
	v = anchor_error_from(sb8, 0xbbb /* anchor::AccountDidNotDeserialize */, n, o, p)
	const t = ld64(sb8 + 8)
	const u = ld64(sb8)
	const r = q
	if (2 > (q & 3) - 2) {
		st64(a + 0x10, t)
		st64(a + 8, u)
		st64(a, 1)
		return v
	}
	if ((r & 3) == 0) {
		st64(a + 0x10, t)
		st64(a + 8, u)
		st64(a, 1)
		return v
	}
	const s = ld64(ld64(q + 7))
	if (s == 0) {
		st64(a + 0x10, t)
		st64(a + 8, u)
		st64(a, 1)
		return v
	}
	v = callx(s, ld64(q - 1), s)
	st64(a + 0x10, t)
	st64(a + 8, u)
	st64(a, 1)
	return v
}

// name [heur]: compares the instruction data's first 8 bytes with 38 handlers' discriminators and calls the matching handler (was fn_1114e8)
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: ix_data, program_id, accounts, accounts_len, ix_data_len
export function anchor_dispatch(a: u64, program_id: u64, accounts: u64, accounts_len: u64, p5: u64, p6: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s1000 = fp - 0x1000
	let k, l, m, n, o, p, q: u64
	B44: {
		const f = memcmp(program_id, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
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
				if (ld64(ix_data) == 0x686c75d7d4ed3489 /* ix:create_amm_config */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_create_amm_config(s2a0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s2a0 + 8)
					k = ld64(s2a0)
					break B44
				}
				if (ld64(ix_data) == 0xa90ef2885c41fb11 /* ix:create_support_mint_associated */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_create_support_mint_associated(s290, program_id, accounts, accounts_len)
					l = ld64(s290 + 8)
					k = ld64(s290)
					break B44
				}
				if (ld64(ix_data) == 0xc8741c9a88ae3c31 /* ix:update_amm_config */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_update_amm_config(s280, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s280 + 8)
					k = ld64(s280)
					break B44
				}
				if (ld64(ix_data) == 0x3ee3765578b50ebd /* ix:create_dynamic_fee_config */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_create_dynamic_fee_config(s270, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s270 + 8)
					k = ld64(s270)
					break B44
				}
				if (ld64(ix_data) == 0xf084c70208500707 /* ix:update_dynamic_fee_config */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_update_dynamic_fee_config(s260, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s260 + 8)
					k = ld64(s260)
					break B44
				}
				if (ld64(ix_data) == 0xcab5a989d8028887 /* ix:create_permission_pda */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_create_permission_pda(s250, program_id, accounts, accounts_len)
					l = ld64(s250 + 8)
					k = ld64(s250)
					break B44
				}
				if (ld64(ix_data) == 0x7b4687457620549c /* ix:close_permission_pda */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_close_permission_pda(s240, program_id, accounts, accounts_len)
					l = ld64(s240 + 8)
					k = ld64(s240)
					break B44
				}
				if (ld64(ix_data) == 0x8336984863b78860 /* ix:close_support_mint_associated */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_close_support_mint_associated(s230, program_id, accounts, accounts_len)
					l = ld64(s230 + 8)
					k = ld64(s230)
					break B44
				}
				if (ld64(ix_data) == 0xbc4068cf8ed192e9 /* ix:create_pool */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_create_pool(s220, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s220 + 8)
					k = ld64(s220)
					break B44
				}
				if (ld64(ix_data) == 0x1a42f59a7d4442b /* ix:create_customizable_pool */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_create_customizable_pool(s210, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s210 + 8)
					k = ld64(s210)
					break B44
				}
				if (ld64(ix_data) == 0xe535ef2a23b3f324 /* ix:create_permissioned_pool */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_create_permissioned_pool(s200, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s200 + 8)
					k = ld64(s200)
					break B44
				}
				if (ld64(ix_data) == 0x7b75e02e066c5782 /* ix:update_pool_status */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_update_pool_status(s1f0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s1f0 + 8)
					k = ld64(s1f0)
					break B44
				}
				if (ld64(ix_data) == 0x6808236d2194573f /* ix:create_operation_account */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_create_operation_account(s1e0, program_id, accounts, accounts_len)
					l = ld64(s1e0 + 8)
					k = ld64(s1e0)
					break B44
				}
				if (ld64(ix_data) == 0x73de3bc2877467f /* ix:update_operation_account */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_update_operation_account(s1d0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s1d0 + 8)
					k = ld64(s1d0)
					break B44
				}
				if (ld64(ix_data) == 0x79302bf2530c1607 /* ix:transfer_reward_owner */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_transfer_reward_owner(s1c0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s1c0 + 8)
					k = ld64(s1c0)
					break B44
				}
				if (ld64(ix_data) == 0x44e681f2c4c0875f /* ix:initialize_reward */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_initialize_reward(s1b0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s1b0 + 8)
					k = ld64(s1b0)
					break B44
				}
				if (ld64(ix_data) == 0x90d51022c5a6ed12 /* ix:collect_remaining_rewards */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_collect_remaining_rewards(s1a0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s1a0 + 8)
					k = ld64(s1a0)
					break B44
				}
				if (ld64(ix_data) == 0xdf6a9a0b34e0aca3 /* ix:update_reward_infos */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_update_reward_infos(s190, program_id, accounts, accounts_len)
					l = ld64(s190 + 8)
					k = ld64(s190)
					break B44
				}
				if (ld64(ix_data) == 0x89d3c9204ba73470 /* ix:set_reward_params */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_set_reward_params(s180, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s180 + 8)
					k = ld64(s180)
					break B44
				}
				if (ld64(ix_data) == 0x597e42c2ddfc8888 /* ix:collect_protocol_fee */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_collect_protocol_fee(s170, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s170 + 8)
					k = ld64(s170)
					break B44
				}
				if (ld64(ix_data) == 0x7e06c2df954e8aa7 /* ix:collect_fund_fee */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_collect_fund_fee(s160, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s160 + 8)
					k = ld64(s160)
					break B44
				}
				if (ld64(ix_data) == 0x31f0980f4d2f8087 /* ix:open_position */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_open_position(s150, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s150 + 8)
					k = ld64(s150)
					break B44
				}
				if (ld64(ix_data) == 0xc7f15670d64ab84d /* ix:open_position_v2 */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_open_position_v2(s140, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s140 + 8)
					k = ld64(s140)
					break B44
				}
				if (ld64(ix_data) == 0x2ec91d7d52aeff4d /* ix:open_position_with_token22_nft */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_open_position_with_token22_nft(s130, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s130 + 8)
					k = ld64(s130)
					break B44
				}
				if (ld64(ix_data) == 0x626244310051867b /* ix:close_position */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_close_position(s120, program_id, accounts, accounts_len)
					l = ld64(s120 + 8)
					k = ld64(s120)
					break B44
				}
				if (ld64(ix_data) == 0xb2fbcd0d76f39c2e /* ix:increase_liquidity */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_increase_liquidity(s110, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s110 + 8)
					k = ld64(s110)
					break B44
				}
				if (ld64(ix_data) == 0xab0ee45df591d85 /* ix:increase_liquidity_v2 */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_increase_liquidity_v2(s100, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s100 + 8)
					k = ld64(s100)
					break B44
				}
				if (ld64(ix_data) == 0x12c5b686fd026a0 /* ix:decrease_liquidity */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_decrease_liquidity(sf0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(sf0 + 8)
					k = ld64(sf0)
					break B44
				}
				if (ld64(ix_data) == 0x60c4524f3ebc7f3a /* ix:decrease_liquidity_v2 */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_decrease_liquidity_v2(se0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(se0 + 8)
					k = ld64(se0)
					break B44
				}
				if (ld64(ix_data) == 0xc88775e1919ec6f8 /* ix:swap */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_swap(sd0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(sd0 + 8)
					k = ld64(sd0)
					break B44
				}
				if (ld64(ix_data) == 0x621ec91a0bed042b /* ix:swap_v2 */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_swap_v2(sc0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(sc0 + 8)
					k = ld64(sc0)
					break B44
				}
				if (ld64(ix_data) == 0xc4f2baf5da737d45 /* ix:swap_router_base_in */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_swap_router_base_in(sb0, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(sb0 + 8)
					k = ld64(sb0)
					break B44
				}
				if (ld64(ix_data) == 0xb26c5555909875c9 /* ix:close_protocol_position */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_close_protocol_position(sa0, program_id, accounts, accounts_len)
					l = ld64(sa0 + 8)
					k = ld64(sa0)
					break B44
				}
				if (ld64(ix_data) == 0x93121d47b7da209d /* ix:open_limit_order */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_open_limit_order(s90, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s90 + 8)
					k = ld64(s90)
					break B44
				}
				if (ld64(ix_data) == 0x637dbafaec5990b1 /* ix:increase_limit_order */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_increase_limit_order(s80, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s80 + 8)
					k = ld64(s80)
					break B44
				}
				if (ld64(ix_data) == 0xa33142673c9d75 /* ix:decrease_limit_order */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_decrease_limit_order(s70, program_id, accounts, accounts_len, ix_data + 8, ix_data_len - 8)
					l = ld64(s70 + 8)
					k = ld64(s70)
					break B44
				}
				if (ld64(ix_data) == 0x601a695c21744ecd /* ix:settle_limit_order */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_settle_limit_order(s60, program_id, accounts, accounts_len)
					l = ld64(s60 + 8)
					k = ld64(s60)
					break B44
				}
				if (ld64(ix_data) == 0xfa2557d50f807c4c /* ix:close_limit_order */) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = ix_close_limit_order(s50, program_id, accounts, accounts_len)
					l = ld64(s50 + 8)
					k = ld64(s50)
					break B44
				}
				i = ld64(ix_data)
				j = 0xa69e9a778bcf440
				if (i == 0xa69e9a778bcf440) {
					st64(s1000, ix_data + 8, ix_data_len - 8)
					q = fn_112cb0(s40, program_id, accounts, accounts_len, fp, accounts, accounts_len, accounts_len)
					l = ld64(s40 + 8)
					k = ld64(s40)
					break B44
				}
				if (ld64(ix_data) == 0x1d9acb512ea545e4) {
					q = anchor_error_from(s30, 0x5dc /* anchor::EventInstructionStub */, i, 0xa69e9a778bcf440)
					l = ld64(s30 + 8)
					k = ld64(s30)
					break B44
				}
			}
			q = anchor_error_from(s2b0, 0x65 /* anchor::InstructionFallbackNotFound */, i, j)
			l = ld64(s2b0 + 8)
			k = ld64(s2b0)
		}
	}
	if (k != 2) {
		st64(s10, k, l)
		const r = Error_log(s10, m, n, o, p, q)
		return error_from(a, k, l, r)
	}
	st64(a, 0x800000000000001a /* Ok */)
	return q
}

export function fn_112cb0(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64, r6: u64, r8: u64): u64 {
	const s4 = fp - 0x4, s5 = fp - 0x5, s20 = fp - 0x20, s39 = fp - 0x39, s40 = fp - 0x40, sf0 = fp - 0xf0, sf8 = fp - 0xf8, s100 = fp - 0x100, s108 = fp - 0x108, s128 = fp - 0x128, s130 = fp - 0x130, s158 = fp - 0x158, s160 = fp - 0x160, s188 = fp - 0x188, s190 = fp - 0x190, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2c0 = fp - 0x2c0, s2c8 = fp - 0x2c8, sff8 = fp - 0xff8
	let g, i, p, s, t, u, v, w, x: u64
	B21: {
		g = a
		st64(s1e8, c, d)
		const f = ld64(e - 0xff8)
		if (f != 0) {
			B29: {
				B28: {
					B19: {
						st64(s2a8, g)
						const h = ld64(e - 0x1000)
						p = 0
						let j = h + 1
						i = ld8(h)
						st8(s5, i)
						st64(s2a8 + 8, i)
						st64(s2c0 + 0x10, b)
						if ((i as i64) > 2) {
							b = ld64(s2a8 + 8)
							if ((b as i64) > 4) {
								r0 = ld64(s2a8 + 8)
								if (r0 == 5) {
									break B28
								}
								b = ld64(s2a8 + 8)
								if (b == 6) {
									if (9 > f) {
										break B19
									}
									r6 = ld64(j)
									break B28
								}
							} else {
								r0 = ld64(s2a8 + 8)
								if (r0 == 3) {
									break B28
								}
								if (ld64(s2a8 + 8) == 4) {
									if (0x21 > f) {
										break B19
									}
									p = ld64(h + 7)
									st8(s100, ld8(h + 0xf))
									st16(s4, ld16(j))
									st8(s4 + 2, ld8(j + 2))
									i = ld16(h + 4) | (ld8(h + 6) << 0x10)
									st64(s108, p)
									r6 = ld64(s108 + 1)
									b = ld8(h + 0x20)
									e = ld64(h + 0x18)
									r8 = ld64(h + 0x10)
									break B28
								}
							}
						} else {
							i = ld64(s2a8 + 8)
							if (i == 0) {
								if (9 > f) {
									break B19
								}
								r6 = ld64(j)
								break B28
							}
							j = ld64(s2a8 + 8)
							if (j == 1) {
								break B28
							}
							if (ld64(s2a8 + 8) == 2) {
								if (5 > f) {
									break B19
								}
								r8 = 1
								p = 0
								const k = ld32(h + 1)
								e = 0
								r6 = 0
								if (k == 0) {
									break B28
								}
								st64(s2c8, k)
								const l = ld64(0x300000000 /* heap bump-allocator cursor */)
								const m = l != 0 ? l : 0x300008000
								const n = m - min(k, 0x100000)
								const o = n > m ? 0 : n
								if (o > 0x300000007) {
									let aw = f - 5
									let ay = h + 5
									st64(0x300000000 /* heap bump-allocator cursor */, o)
									st64(s2c0, min(k, 0x100000))
									memset2(o, 0, min(k, 0x100000))
									s = undef
									e = ld64(s2c0)
									st64(s108, e, o, e)
									t = ld64(s2c8)
									r0 = o
									while (true) {
										if (r6 == e) {
											let at = min(((e as i64) > -1 ? e << 1 : 0xffffffffffffffff), t)
											if (at > e) {
												const au = at - e
												if (au > ld64(s108) - e) {
													reserve_do_reserve_and_handle_156f8(s108, e, au, 1, 1)
													s = undef
													t = ld64(s2c8)
													r0 = ld64(s100)
													e = ld64(sf8)
												}
												let av = r0 + e
												if (au >= 2) {
													st64(s2c0, e, r0)
													memset2(av, 0, au - 1)
													s = undef
													t = ld64(s2c8)
													e = ld64(s2c0) + (au - 1)
													av = ld64(s2c0 + 8) + e
												}
												st8(av, 0)
												at = e + 1
											}
											st64(sf8, at)
											e = at
										}
										if (r6 > e) {
											fn_153150(r6, e, 0x10015f8e0, t, e)
										}
										const ax = min(aw, e - r6)
										r0 = ld64(s100)
										const az = r0 + r6
										if (ax != 1) {
											st64(s2c0, aw, r0)
											memcpy(az, ay, ax)
											s = undef
											r0 = ld64(s2c0 + 8)
											t = ld64(s2c8)
											const be = ld64(s2a8 + 8)
											ay = ay + ax
											aw = ld64(s2c0) - ax
											if (ax == 0) {
												r0 = fn_ef08(be, undef, s, t, e)
												s = undef
												t = undef
												e = undef
												g = ld64(s2a8)
												break B21
											}
										} else {
											st8(az, ld8(ay))
											ay = ay + 1
											aw = aw - 1
										}
										const ar = r6 + ax
										b = r6 > ar
										if (b != 0) {
											fn_154730(0x10015f8c8, b, s, t, e)
										}
										r6 = ar
										if (ar >= t) {
											r6 = ld64(s108)
											if (r6 == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
												g = ld64(s2a8)
												break B21
											}
											r8 = r0
											if (r6 == 0x8000000000000000) {
												const ba = ld64(0x300000000 /* heap bump-allocator cursor */)
												const bc = ba != 0 ? ba : 0x300008000
												const bb = max(min(t, 0x1000), 1)
												t = bb > bc
												let bd = t != 0 ? 0 : bc - bb
												if (0x300000007 >= bd) {
													raw_vec_handle_error(1, bb, 0x10015fa80, t, bc - bb)
												}
												st64(0x300000000 /* heap bump-allocator cursor */, bd)
												st64(s108, bb)
												e = 0
												st64(s100, bd, 0)
												s = ld64(s2c8)
												while (true) {
													if (aw == e) {
														break B19
													}
													const bf = ld8(ay + e)
													if (e == ld64(s108)) {
														RawVec_grow_one_155c0(s108, 0x10015fa98, s, t, e)
														t = undef
														s = ld64(s2c8)
														bd = ld64(s100)
													}
													b = bd + e
													e = e + 1
													st8(b, bf)
													st64(sf8, e)
													if (e >= s) {
														r0 = ld64(s100)
														r6 = ld64(s108)
														r8 = r0
														if (r6 == 0x8000000000000000) {
															g = ld64(s2a8)
															break B21
														}
														break
													}
												}
											}
											st8(s1e8 + 0x12, ld8(s4 + 2))
											st16(s1e8 + 0x10, ld16(s4))
											x = 0
											r0 = r6
											g = ld64(s2a8)
											s = ld64(s2a8 + 8)
											if (s == 7) {
												break B21
											}
											break B29
										}
									}
								}
								raw_vec_handle_error(1, min(k, 0x100000), 0x10015f8b0, n > m, 0)
							}
						}
						st64(s108, 0x10015fa30)
						st64(sf8, s20)
						st64(s20, s5, num_fmt_f548)
						st64(sf0 + 8, 0)
						st64(s100, 1)
						st64(sf0, 1)
						// fmt "Unexpected variant index: {}" {} = *s5 [num_fmt_f548]
						fn_14de10(s1d0, s108, i, j, e)
						r0 = fn_f128(s1d0)
						s = undef
						t = undef
						e = undef
						g = ld64(s2a8)
						break B21
					}
					r0 = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
					s = undef
					t = undef
					e = undef
					g = ld64(s2a8)
					break B21
				}
				st8(s1e8 + 0x12, ld8(s4 + 2))
				t = ld16(s4)
				st16(s1e8 + 0x10, t)
				x = (p << 0x18) | i & 0xffffff
				g = ld64(s2a8)
			}
			st8(s1e8 + 0x16, ld8(s1e8 + 0x12))
			st16(s1e8 + 0x14, ld16(s1e8 + 0x10))
			if ((ld64(s2a8 + 8) as i64) > 2) {
				if ((ld64(s2a8 + 8) as i64) > 4) {
					if (ld64(s2a8 + 8) == 5) {
						st64(s20 + 0x10, 0)
						st64(s20, 0)
						w = fn_11e748(s108, b, s1e8, t, fp)
						u = ld64(s100)
						v = ld64(s108)
						const ag = ld8(sf0 + 0x4a)
						if (ag == 2) {
							st64(g + 8, u)
							st64(g, v)
							return w
						}
						memcpy(s1c0, sf8, 0x52)
						st32(s188 + 0x1b, ld32(sf0 + 0x4b))
						st8(s188 + 0x1f, ld8(sf0 + 0x4f))
						st8(s188 + 0x1a, ag)
						st64(s1d0, v, u)
						ix_idl_close_account()
						w = fn_11f790(s218, s1d0)
						const ah = ld64(s190)
						u = ld64(s218 + 8)
						v = ld64(s218)
						if (rc_release(ah)) {
							w = Rc_drop_slow_14df0(s190, w)
						}
						const ai = ld64(s188)
						if (rc_release(ai)) {
							w = Rc_drop_slow_14df0(s188, w)
						}
						if (v == 2) {
							w = fn_10038(s20, w)
							st64(g + 8, u)
							st64(g, 2)
							return w
						}
						st64(g + 8, u)
						st64(g, v)
						return w
					}
					st64(s20 + 0x10, 0)
					st64(s20, 0)
					w = fn_121af0(s108, b, s1e8, t, fp)
					u = ld64(sf8)
					v = ld64(s100)
					const ab = ld64(s108)
					if (ab == 0) {
						st64(g + 8, u)
						st64(g, v)
						return w
					}
					copyr(s1b8, sf0, 0x28)
					st64(s1d0, ab, v, u)
					w = log_115210(s1f8, s1d0, r6)
					u = ld64(s1f8 + 8)
					v = ld64(s1f8)
					if (v == 2) {
						w = fn_122828(s208, s1d0, ld64(s2c0 + 0x10))
						u = ld64(s208 + 8)
						v = ld64(s208)
						if (v != 2) {
							st64(g + 8, u)
							st64(g, v)
							return w
						}
						w = fn_10038(s20, w)
						st64(g + 8, u)
						st64(g, 2)
						return w
					}
					st64(g + 8, u)
					st64(g, v)
					return w
				}
				if (ld64(s2a8 + 8) == 3) {
					st64(s20 + 0x10, 0)
					st64(s20, 0)
					w = fn_11fb88(s108, b, s1e8, t, fp)
					u = ld64(sf8)
					v = ld64(s100)
					const af = ld64(s108)
					if (af == 0) {
						st64(g + 8, u)
						st64(g, v)
						return w
					}
					memcpy(s1b8, sf0, 0x50)
					st64(s1d0, af, v, u)
					w = ix_idl_set_buffer(s238, s1d0)
					u = ld64(s238 + 8)
					v = ld64(s238)
					if (v == 2) {
						w = fn_120990(s248, s1d0, ld64(s2c0 + 0x10))
						u = ld64(s248 + 8)
						v = ld64(s248)
						if (v != 2) {
							st64(g + 8, u)
							st64(g, v)
							return w
						}
						w = fn_10038(s20, w)
						st64(g + 8, u)
						st64(g, 2)
						return w
					}
					st64(g + 8, u)
					st64(g, v)
					return w
				}
				st8(s40 + 2, ld8(s1e8 + 0x16))
				st16(s40, ld16(s1e8 + 0x14))
				st8(s39 + 0x18, b)
				st64(s39, r6, r8, e)
				st32(s40 + 3, x)
				w = fn_122a10(s108, b, s1e8, t, fp)
				u = ld64(sf8)
				v = ld64(s100)
				const y = ld64(s108)
				if (y == 0) {
					st64(g + 8, u)
					st64(g, v)
					return w
				}
				copyr(s1b8, sf0, 0x20)
				st64(s1d0, y, v, u)
				log_115d68(s1d0, s40)
				w = fn_123598(s228, s1d0, ld64(s2c0 + 0x10))
				u = ld64(s228 + 8)
				v = ld64(s228)
				if (v == 2) {
					st64(g + 8, u)
					st64(g, 2)
					return w
				}
				st64(g + 8, u)
				st64(g, v)
				return w
			}
			if (ld64(s2a8 + 8) == 0) {
				st64(s2a8 + 8, r6)
				st64(s20 + 0x10, 0)
				st64(s20, 0)
				st64(sff8, s4)
				const ac = ld64(s2c0 + 0x10)
				w = fn_123780(s108, ac, s1e8, t, fp)
				u = ld64(s100)
				v = ld64(s108)
				const ad = ld8(sf0 + 0xaa)
				if (ad == 2) {
					g = ld64(s2a8)
					st64(g + 8, u)
					st64(g, v)
					return w
				}
				st64(s2c0 + 8, s1c0)
				memcpy(s1c0, sf8, 0xb2)
				st32(s128 + 0x1b, ld32(sf0 + 0xab))
				st8(s128 + 0x1f, ld8(sf0 + 0xaf))
				st8(s128 + 0x1a, ad)
				st64(s1d0, v, u)
				w = ix_idl_create_account(s288, ac, s1d0, ld64(s2a8 + 8))
				const aj = ld64(s1c0)
				u = ld64(s288 + 8)
				v = ld64(s288)
				if (rc_release(aj)) {
					w = Rc_drop_slow_14df0(ld64(s2c0 + 8), w)
				}
				const ak = ld64(s1b8)
				if (rc_release(ak)) {
					w = Rc_drop_slow_14df0(s1b8, w)
				}
				const al = ld64(s190)
				g = ld64(s2a8)
				if (rc_release(al)) {
					w = Rc_drop_slow_14df0(s190, w)
				}
				const am = ld64(s188)
				if (rc_release(am)) {
					w = Rc_drop_slow_14df0(s188, w)
				}
				const an = ld64(s160)
				if (rc_release(an)) {
					w = Rc_drop_slow_14df0(s160, w)
				}
				const ao = ld64(s158)
				if (rc_release(ao)) {
					w = Rc_drop_slow_14df0(s158, w)
				}
				const ap = ld64(s130)
				if (rc_release(ap)) {
					w = Rc_drop_slow_14df0(s130, w)
				}
				const aq = ld64(s128)
				if (rc_release(aq)) {
					w = Rc_drop_slow_14df0(s128, w)
				}
				if (v == 2) {
					w = fn_10038(s20, w)
					st64(g + 8, u)
					st64(g, 2)
					return w
				}
				st64(g + 8, u)
				st64(g, v)
				return w
			}
			if (ld64(s2a8 + 8) == 1) {
				w = fn_120d78(s108, b, s1e8, t, fp, r0)
				u = ld64(sf8)
				v = ld64(s100)
				const ae = ld64(s108)
				if (ae == 0) {
					st64(g + 8, u)
					st64(g, v)
					return w
				}
				copyr(s1b8, sf0, 0x20)
				st64(s1d0, ae, v, u)
				log_115a40(s1d0)
				w = fn_121908(s278, s1d0, ld64(s2c0 + 0x10))
				u = ld64(s278 + 8)
				v = ld64(s278)
				if (v == 2) {
					st64(g + 8, u)
					st64(g, 2)
					return w
				}
				st64(g + 8, u)
				st64(g, v)
				return w
			}
			st64(s2a8, r8, r6)
			const aa = e
			st64(s20 + 0x10, 0)
			st64(s20, 0)
			w = fn_122a10(s108, b, s1e8, t, fp)
			u = ld64(sf8)
			v = ld64(s100)
			const z = ld64(s108)
			if (z == 0) {
				st64(g + 8, u)
				st64(g, v)
				return w
			}
			copyr(s1b8, sf0, 0x20)
			st64(s1d0, z, v, u)
			st64(sf8, aa)
			st64(s100, ld64(s2a8))
			st64(s108, ld64(s2a8 + 8))
			w = panic_unwrap_err(s258, s1d0, s108)
			u = ld64(s258 + 8)
			v = ld64(s258)
			if (v != 2) {
				st64(g + 8, u)
				st64(g, v)
				return w
			}
			w = fn_123598(s268, s1d0, ld64(s2c0 + 0x10))
			u = ld64(s268 + 8)
			v = ld64(s268)
			if (v != 2) {
				st64(g + 8, u)
				st64(g, v)
				return w
			}
			w = fn_10038(s20, w)
			st64(g + 8, u)
			st64(g, 2)
			return w
		}
		r0 = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		s = undef
		t = undef
		e = undef
	}
	const q = r0
	if (2 > (r0 & 3) - 2) {
		w = anchor_error_from(s298, 0x66 /* anchor::InstructionDidNotDeserialize */, s, t, e)
		v = ld64(s298)
		st64(g + 8, ld64(s298 + 8))
		st64(g, v)
		return w
	}
	if ((q & 3) == 0) {
		w = anchor_error_from(s298, 0x66 /* anchor::InstructionDidNotDeserialize */, s, t, e)
		v = ld64(s298)
		st64(g + 8, ld64(s298 + 8))
		st64(g, v)
		return w
	}
	const r = ld64(ld64(r0 + 7))
	if (r == 0) {
		w = anchor_error_from(s298, 0x66 /* anchor::InstructionDidNotDeserialize */, s, t, e)
		v = ld64(s298)
		st64(g + 8, ld64(s298 + 8))
		st64(g, v)
		return w
	}
	callx(r, ld64(r0 - 1), r, s, t, e)
	w = anchor_error_from(s298, 0x66 /* anchor::InstructionDidNotDeserialize */)
	v = ld64(s298)
	st64(g + 8, ld64(s298 + 8))
	st64(g, v)
	return w
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: account (ConstraintClose), authority (ConstraintRaw), sol_destination (ConstraintMut)
export function fn_11e748(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s48 = fp - 0x48, s60 = fp - 0x60, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sc0 = fp - 0xc0, sc8 = fp - 0xc8, sd0 = fp - 0xd0, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8
	let aa, ac, ao: u64
	let h = try_accounts_18420(s60, c, c, d, e)
	const p = ld64(s60 + 0x10)
	let g = ld64(s60 + 8)
	const f: AccountInfo = ld64(s60)
	if (f == 0) {
		const n = ld64(0x300000000 /* heap bump-allocator cursor */)
		const o = n != 0 ? sat_sub(n, 7) : 0x300007ff9
		if ((g & 1) != 0) {
			if (0x300000008 > o) {
				raw_vec_handle_error(1, 7, 0x10015f8f8, 7 > n, g)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, o)
			st32(o + 3, 0x746e756f)
			st32(o, 0x6f636361)
			void ld64(p)
		} else {
			if (0x300000008 > o) {
				raw_vec_handle_error(1, 7, 0x10015f8f8, 7 > n, g)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, o)
			st32(o + 3, 0x746e756f)
			st32(o, 0x6f636361)
			void ld64(p)
		}
		st64(p + 0x10, o, 7)
		st64(p + 8, 7)
		st64(p, 1)
		st64(a + 8, p)
		st64(a, g)
		st8(a + 0x62, 2)
		return h
	}
	st64(s198, g, a)
	copyr(se8, s48, 0x18)
	h = try_accounts_17a30(s60, c, undef, undef, g, h)
	const s = ld64(s60 + 8)
	const i = ld64(s60)
	if (i == 2) {
		const j = ld64(c + 8)
		if (j == 0) {
			h = anchor_error_from(s188, 0xbbd /* anchor::AccountNotEnoughKeys */)
			const ad = ld64(0x300000000 /* heap bump-allocator cursor */)
			const ah = ld64(s198 + 8)
			const af = ad != 0 ? sat_sub(ad, 0xf) : 0x300007ff1
			const ag = ld64(s188 + 8)
			const ae = ld64(s188)
			if ((ae & 1) != 0) {
				if (0x300000008 > af) {
					raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0x300000008, ah)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, af)
				st64(af + 7, 0x6e6f6974616e6974)
				st64(af, 0x747365645f6c6f73)
				void ld64(ag)
			} else {
				if (0x300000008 > af) {
					raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0x300000008, ah)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, af)
				st64(af + 7, 0x6e6f6974616e6974)
				st64(af, 0x747365645f6c6f73)
				void ld64(ag)
			}
			st64(ag + 0x10, af, 0xf)
			st64(ag + 8, 0xf)
			st64(ag, 1)
			st64(ah + 8, ag)
			st64(ah, ae)
			st8(ah + 0x62, 2)
			return h
		}
		st64(c + 8, j - 1)
		const k: AccountInfo = ld64(c)
		st64(c, k + 0x30)
		const l: LamportsCell = k.lamports
		const m = l.strong
		st64(s1a0, k.key)
		rc_inc(l, m)
		const u: DataCell = k.data
		rc_inc(u)
		const y = k.is_writable
		const x = k.owner
		const w = k.rent_epoch
		const v = k.is_signer
		st8(sc0 + 0x1a, k.executable)
		st8(sc0 + 0x18, v)
		st64(sc8, l, u, x, w)
		st64(sd0, ld64(s1a0))
		st8(sc0 + 0x19, y)
		if (f.is_writable != 0) {
			st64(s1a8, y)
			st64(sa0 + 8, p)
			st64(sa0, ld64(s198))
			copy(s90, se8, 0x10)
			const ai = ld64(s)
			copy(s80, ai, 0x20)
			if ((memcmp(sa0, s80, 0x20) as u32) == 0) {
				const ar = f.key
				copyr(s20, ar, 0x20)
				const at = ld64(s1a0)
				copyr(s60, at, 0x20)
				if ((memcmp(s20, s60, 0x20) as u32) == 0) {
					anchor_error_from(s168, 0x7db /* anchor::ConstraintClose */)
					h = fn_4130(s178, ld64(s168), ld64(s168 + 8), 0x10015bb82 /* "account" */, 7)
					ac = ld64(s178 + 8)
					aa = ld64(s178)
					ao = ld64(s198 + 8)
				} else if ((memcmp(ai, 0x100159560, 0x20) as u32) == 0) {
					anchor_error_from(s148, 0x7d3 /* anchor::ConstraintRaw */)
					h = fn_4130(s158, ld64(s148), ld64(s148 + 8), "authority", 9)
					ac = ld64(s158 + 8)
					aa = ld64(s158)
					ao = ld64(s198 + 8)
				} else {
					if ((ld64(s1a8) & 1) != 0) {
						const au = ld64(s198 + 8)
						h = memcpy(au + 0x38, sd0, 0x30)
						const ax = ld64(se8 + 0x10)
						const aw = ld64(se8 + 8)
						const av = ld64(se8)
						st64(au + 0x30, s)
						st64(au + 0x10, p)
						st64(au + 8, ld64(s198))
						st64(au, f)
						st64(au + 0x18, av, aw, ax)
						return h
					}
					anchor_error_from(s128, 0x7d0 /* anchor::ConstraintMut */)
					h = fn_4130(s138, ld64(s128), ld64(s128 + 8), "sol_destination", 0xf)
					ac = ld64(s138 + 8)
					aa = ld64(s138)
					ao = ld64(s198 + 8)
				}
			} else {
				const an = anchor_error_from(s108, 0x7d1 /* anchor::ConstraintHasOne */)
				g = undef
				const aj = ld64(0x300000000 /* heap bump-allocator cursor */)
				ao = ld64(s198 + 8)
				const al = aj != 0 ? sat_sub(aj, 7) : 0x300007ff9
				const am = ld64(s108 + 8)
				const ak = ld64(s108)
				if ((ak & 1) != 0) {
					if (0x300000008 > al) {
						raw_vec_handle_error(1, 7, 0x10015f8f8, 0x300000008, g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, al)
					st32(al + 3, 0x746e756f)
					st32(al, 0x6f636361)
					void ld64(am)
				} else {
					if (0x300000008 > al) {
						raw_vec_handle_error(1, 7, 0x10015f8f8, 0x300000008, g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, al)
					st32(al + 3, 0x746e756f)
					st32(al, 0x6f636361)
					void ld64(am)
				}
				st64(am + 0x10, al, 7)
				st64(am + 8, 7)
				st64(am, 1)
				copy(s60, sa0, 0x40)
				h = Error_with_pubkeys(s118, ak, am, s60, an)
				ac = ld64(s118 + 8)
				aa = ld64(s118)
			}
		} else {
			h = anchor_error_from(sf8, 0x7d0 /* anchor::ConstraintMut */, u, x, w)
			g = undef
			const z = ld64(0x300000000 /* heap bump-allocator cursor */)
			ao = ld64(s198 + 8)
			const ab = z != 0 ? sat_sub(z, 7) : 0x300007ff9
			ac = ld64(sf8 + 8)
			aa = ld64(sf8)
			if ((aa & 1) != 0) {
				if (0x300000008 > ab) {
					raw_vec_handle_error(1, 7, 0x10015f8f8, 0x300000008, g)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ab)
				st32(ab + 3, 0x746e756f)
				st32(ab, 0x6f636361)
				void ld64(ac)
			} else {
				if (0x300000008 > ab) {
					raw_vec_handle_error(1, 7, 0x10015f8f8, 0x300000008, g)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ab)
				st32(ab + 3, 0x746e756f)
				st32(ab, 0x6f636361)
				void ld64(ac)
			}
			st64(ac + 0x10, ab, 7)
			st64(ac + 8, 7)
			st64(ac, 1)
		}
		st64(ao + 8, ac)
		st64(ao, aa)
		st8(ao + 0x62, 2)
		const ap: LamportsCell = ld64(sc8)
		if (rc_release(ap)) {
			h = Rc_drop_slow_14df0(sc8, h)
		}
		const aq: DataCell = ld64(sc0)
		if (!rc_release(aq)) {
			return h
		}
		return Rc_drop_slow_14df0(sc0, h)
	}
	const q = ld64(0x300000000 /* heap bump-allocator cursor */)
	const r = q != 0 ? sat_sub(q, 9) : 0x300007ff7
	if ((i & 1) != 0) {
		if (0x300000008 > r) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(q, 9), 9 > q)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, r)
		st64(r, 0x7469726f68747561)
		st8(r + 8, 0x79)
		void ld64(s)
	} else {
		if (0x300000008 > r) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(q, 9), 9 > q)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, r)
		st64(r, 0x7469726f68747561)
		st8(r + 8, 0x79)
		void ld64(s)
	}
	st64(s + 0x10, r, 9)
	st64(s + 8, 9)
	st64(s, 1)
	const t = ld64(s198 + 8)
	st64(t + 8, s)
	st64(t, i)
	st8(t + 0x62, 2)
	return h
}

export function fn_11f790(a: u64, b: u64): u64 {
	const s8 = fp - 0x8, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s70 = fp - 0x70
	const f = ld64(b + 0x40)
	const l = ld64(b + 0x38)
	rc_inc(f)
	const g = ld64(b + 0x48)
	rc_inc(g)
	const k = ld64(b + 0x50)
	const j = ld64(b + 0x58)
	const i = ld8(b + 0x60)
	const h = ld8(b + 0x61)
	st8(s38 + 2, ld8(b + 0x62))
	st8(s38, i, h)
	st64(s60, l, f, g, k, j)
	const m: AccountInfo = ld64(b)
	const n: LamportsCell = m.lamports
	const t = m.key
	rc_inc(n)
	const o: DataCell = m.data
	rc_inc(o)
	const s = m.owner
	const r = m.rent_epoch
	const q = m.is_signer
	const p = m.is_writable
	st8(s8 + 2, m.executable)
	st8(s8, q, p)
	st64(s30, t, n, o, s, r)
	const y = fn_13e190(s70, s30, s60, o, s)
	let x = undef
	const u = ld64(s70)
	if (u == 2) {
		st64(a + 8, x)
		st64(a, u)
		return y
	}
	const v = ld64(0x300000000 /* heap bump-allocator cursor */)
	const w = v != 0 ? sat_sub(v, 7) : 0x300007ff9
	x = ld64(s70 + 8)
	if ((u & 1) != 0) {
		if (0x300000008 > w) {
			raw_vec_handle_error(1, 7, 0x10015f8f8, 0x300000008, 7 > v)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, w)
		st32(w + 3, 0x746e756f)
		st32(w, 0x6f636361)
		void ld64(x)
	} else {
		if (0x300000008 > w) {
			raw_vec_handle_error(1, 7, 0x10015f8f8, 0x300000008, 7 > v)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, w)
		st32(w + 3, 0x746e756f)
		st32(w, 0x6f636361)
		void ld64(x)
	}
	st64(x + 0x10, w, 7)
	st64(x + 8, 7)
	st64(x, 1)
	st64(a + 8, x)
	st64(a, u)
	return y
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: idl (ConstraintMut, ConstraintHasOne), authority (ConstraintRaw)
export function fn_11fb88(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s40 = fp - 0x40, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s98 = fp - 0x98, sc0 = fp - 0xc0, s108 = fp - 0x108, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, s1b0 = fp - 0x1b0, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1c8 = fp - 0x1c8
	let t, u, ad: u64
	let q = try_accounts_18420(s40, c, c, d, e)
	const g = ld64(s40 + 0x10)
	let h = ld64(s40 + 8)
	const f = ld64(s40)
	if (f == 0) {
		const v = ld64(0x300000000 /* heap bump-allocator cursor */)
		t = 6 > v
		const w = v != 0 ? t != 0 ? 0 : v - 6 : 0x300007ffa
		if ((h & 1) != 0) {
			if (0x300000008 > w) {
				raw_vec_handle_error(1, 6, 0x10015f8f8, t, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, w)
			st16(w + 4, 0x7265)
			st32(w, 0x66667562)
			void ld64(g)
		} else {
			if (0x300000008 > w) {
				raw_vec_handle_error(1, 6, 0x10015f8f8, t, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, w)
			st16(w + 4, 0x7265)
			st32(w, 0x66667562)
			void ld64(g)
		}
		st64(g + 0x10, w, 6)
		st64(g + 8, 6)
		st64(g, 1)
		st64(a + 0x10, g)
		st64(a + 8, h)
		st64(a, 0)
		return q
	}
	st64(s1a8, a)
	st64(s108 + 8, g)
	st64(s1b0, h)
	st64(s110, f, h)
	const i = ld64(s40 + 0x18)
	st64(s108 + 0x28, i)
	st64(s108 + 0x10, i)
	const j = ld64(s40 + 0x20)
	st64(s108 + 0x30, j)
	st64(s108 + 0x18, j)
	const k = ld64(s40 + 0x28)
	st64(s108 + 0x38, k)
	st64(s108 + 0x20, k)
	q = try_accounts_18420(s40, c, undef, undef, h)
	let m = ld64(s40 + 0x10)
	h = ld64(s40 + 8)
	const l = ld64(s40)
	if (l == 0) {
		const x = ld64(0x300000000 /* heap bump-allocator cursor */)
		const y = x != 0 ? sat_sub(x, 3) : 0x300007ffd
		if ((h & 1) != 0) {
			if (0x300000008 > y) {
				raw_vec_handle_error(1, 3, 0x10015f8f8, 3 > x, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, y)
			st8(y + 2, 0x6c)
			st16(y, 0x6469)
			void ld64(m)
		} else {
			if (0x300000008 > y) {
				raw_vec_handle_error(1, 3, 0x10015f8f8, 3 > x, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, y)
			st8(y + 2, 0x6c)
			st16(y, 0x6469)
			void ld64(m)
		}
		st64(m + 0x10, y, 3)
		st64(m + 8, 3)
		st64(m, 1)
		ad = ld64(s1a8)
		st64(ad + 0x10, m)
		st64(ad + 8, h)
		st64(ad, 0)
		return q
	}
	st64(sc0 + 8, m)
	st64(s1c0, h)
	st64(sc0, h)
	st64(s1b8, l)
	st64(s108 + 0x40, l)
	const n = ld64(s40 + 0x18)
	st64(s98, n)
	st64(sc0 + 0x10, n)
	const o = ld64(s40 + 0x20)
	st64(s98 + 8, o)
	st64(sc0 + 0x18, o)
	const p = ld64(s40 + 0x28)
	st64(s98 + 0x10, p)
	st64(sc0 + 0x20, p)
	q = try_accounts_17a30(s40, c, undef, undef, h, q)
	const ab = ld64(s40 + 8)
	const r = ld64(s40)
	if (r == 2) {
		if (ld8(f + 0x29) != 0) {
			if ((memcmp(s108, sc0, 0x20) as u32) == 0) {
				if (ld8(ld64(s1b8) + 0x29) != 0) {
					st64(s80 + 8, m)
					st64(s80, ld64(s1c0))
					copy(s70, s98, 0x10)
					const ae = ld64(ab)
					copy(s60, ae, 0x18)
					st64(s1c8, ae)
					st64(s60 + 0x18, ld64(ae + 0x18))
					if ((memcmp(s80, s60, 0x20) as u32) != 0) {
						anchor_error_from(s160, 0x7d1 /* anchor::ConstraintHasOne */)
						const ai = fn_4130(s170, ld64(s160), ld64(s160 + 8), 0x10015bb8f /* "idl" */, 3)
						const ah = ld64(s170 + 8)
						const ag = ld64(s170)
						copy(s40, s80, 0x40)
						q = Error_with_pubkeys(s180, ag, ah, s40, ai)
						h = ld64(s180)
						ad = ld64(s1a8)
						st64(ad + 0x10, ld64(s180 + 8))
						st64(ad + 8, h)
						st64(ad, 0)
						return q
					}
					q = memcmp(ld64(s1c8), 0x100159560, 0x20) as u32
					if (q == 0) {
						anchor_error_from(s190, 0x7d3 /* anchor::ConstraintRaw */)
						q = fn_4130(s1a0, ld64(s190), ld64(s190 + 8), "authority", 9)
						h = ld64(s1a0)
						ad = ld64(s1a8)
						st64(ad + 0x10, ld64(s1a0 + 8))
						st64(ad + 8, h)
						st64(ad, 0)
						return q
					}
					const af = ld64(s1a8)
					st64(af + 0x28, ld64(s108 + 0x38))
					st64(af + 0x20, ld64(s108 + 0x30))
					st64(af + 0x18, ld64(s108 + 0x28))
					copy(af + 0x48, s98, 0x18)
					st64(af + 0x60, ab)
					st64(af + 0x40, m)
					st64(af + 0x38, ld64(s1c0))
					st64(af + 0x30, ld64(s1b8))
					st64(af + 0x10, g)
					st64(af + 8, ld64(s1b0))
					st64(af, f)
					return q
				}
				anchor_error_from(s140, 0x7d0 /* anchor::ConstraintMut */)
				q = fn_4130(s150, ld64(s140), ld64(s140 + 8), 0x10015bb8f /* "idl" */, 3)
				h = ld64(s150)
				ad = ld64(s1a8)
				st64(ad + 0x10, ld64(s150 + 8))
				st64(ad + 8, h)
				st64(ad, 0)
				return q
			}
			q = anchor_error_from(s130, 0x7d3 /* anchor::ConstraintRaw */)
			const ac = ld64(0x300000000 /* heap bump-allocator cursor */)
			t = 6 > ac
			u = ac != 0 ? t != 0 ? 0 : ac - 6 : 0x300007ffa
			m = ld64(s130 + 8)
			h = ld64(s130)
			if ((h & 1) != 0) {
				if (0x300000008 > u) {
					raw_vec_handle_error(1, 6, 0x10015f8f8, t, h)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, u)
				st16(u + 4, 0x7265)
				st32(u, 0x66667562)
				void ld64(m)
			} else {
				if (0x300000008 > u) {
					raw_vec_handle_error(1, 6, 0x10015f8f8, t, h)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, u)
				st16(u + 4, 0x7265)
				st32(u, 0x66667562)
				void ld64(m)
			}
		} else {
			q = anchor_error_from(s120, 0x7d0 /* anchor::ConstraintMut */)
			const s = ld64(0x300000000 /* heap bump-allocator cursor */)
			t = 6 > s
			u = s != 0 ? t != 0 ? 0 : s - 6 : 0x300007ffa
			m = ld64(s120 + 8)
			h = ld64(s120)
			if ((h & 1) != 0) {
				if (0x300000008 > u) {
					raw_vec_handle_error(1, 6, 0x10015f8f8, t, h)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, u)
				st16(u + 4, 0x7265)
				st32(u, 0x66667562)
				void ld64(m)
			} else {
				if (0x300000008 > u) {
					raw_vec_handle_error(1, 6, 0x10015f8f8, t, h)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, u)
				st16(u + 4, 0x7265)
				st32(u, 0x66667562)
				void ld64(m)
			}
		}
		st64(m + 0x10, u, 6)
		st64(m + 8, 6)
		st64(m, 1)
		ad = ld64(s1a8)
		st64(ad + 0x10, m)
		st64(ad + 8, h)
		st64(ad, 0)
		return q
	}
	const z = ld64(0x300000000 /* heap bump-allocator cursor */)
	const aa = z != 0 ? sat_sub(z, 9) : 0x300007ff7
	if ((r & 1) != 0) {
		if (0x300000008 > aa) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(z, 9), 9 > z)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, aa)
		st64(aa, 0x7469726f68747561)
		st8(aa + 8, 0x79)
		void ld64(ab)
	} else {
		if (0x300000008 > aa) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(z, 9), 9 > z)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, aa)
		st64(aa, 0x7469726f68747561)
		st8(aa + 8, 0x79)
		void ld64(ab)
	}
	st64(ab + 0x10, aa, 9)
	st64(ab + 8, 9)
	st64(ab, 1)
	ad = ld64(s1a8)
	st64(ad + 0x10, ab)
	st64(ad + 8, r)
	st64(ad, 0)
	return q
}

export function fn_120990(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	let h, i: u64
	let k = Account_exit_with_expected_owner(s10, b, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
	let f = ld64(s10)
	if (f != 2) {
		const j = ld64(0x300000000 /* heap bump-allocator cursor */)
		h = j != 0 ? sat_sub(j, 6) : 0x300007ffa
		i = ld64(s10 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > h) {
				raw_vec_handle_error(1, 6, 0x10015f8f8, 0x300000008, 6 > j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, h)
			st16(h + 4, 0x7265)
			st32(h, 0x66667562)
			void ld64(i)
		} else {
			if (0x300000008 > h) {
				raw_vec_handle_error(1, 6, 0x10015f8f8, 0x300000008, 6 > j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, h)
			st16(h + 4, 0x7265)
			st32(h, 0x66667562)
			void ld64(i)
		}
		st64(i + 8, 6)
		st64(i, 1)
		st64(i + 0x18, 6)
		st64(i + 0x10, h)
		st64(a + 8, i)
		st64(a, f)
		return k
	}
	k = Account_exit_with_expected_owner(s20, b + 0x30, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
	i = undef
	f = ld64(s20)
	if (f == 2) {
		st64(a + 8, i)
		st64(a, 2)
		return k
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	h = g != 0 ? sat_sub(g, 3) : 0x300007ffd
	i = ld64(s20 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 3, 0x10015f8f8, 0x300000008, 3 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 2, 0x6c)
		st16(h, 0x6469)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 3, 0x10015f8f8, 0x300000008, 3 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 2, 0x6c)
		st16(h, 0x6469)
		void ld64(i)
	}
	st64(i + 8, 3)
	st64(i, 1)
	st64(i + 0x18, 3)
	st64(i + 0x10, h)
	st64(a + 8, i)
	st64(a, f)
	return k
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: buffer (ConstraintMut, ConstraintRentExempt), authority (ConstraintRaw)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: buffer
export function fn_120d78(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s40 = fp - 0x40, s48 = fp - 0x48, s78 = fp - 0x78, sa0 = fp - 0xa0, sb8 = fp - 0xb8, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190
	let h, q: u64
	const f = ld64(c + 8)
	if (f != 0) {
		st64(c + 8, f - 1)
		const g: AccountInfo = ld64(c)
		st64(c, g + 0x30)
		q = try_accounts_17a30(s48, c, c, d, e, r0)
		const k = ld64(s40)
		h = ld64(s48)
		if (h == 2) {
			const l = rent_get(s48)
			copy(sb8, s40, 0x18)
			if (ld64(s48) != 0) {
				q = fn_13e628(s180, sb8)
				h = ld64(s180)
				st64(a + 0x10, ld64(s180 + 8))
				st64(a + 8, h)
				st64(a, 0)
				return q
			}
			copyr(sd0, sb8, 0x18)
			AccountInfo_try_borrow_data(s48, g, l)
			const p = ld64(s40 + 8)
			const n = ld64(s40)
			const m = ld64(s48)
			if (m == 0x800000000000001a /* Ok */) {
				const o = ld64(n + 8)
				if (o > 7) {
					const r = ld64(n)
					if (ld8(r) == 0 && (ld8(r + 1) == 0 && (ld8(r + 2) == 0 && (ld8(r + 3) == 0 && (ld8(r + 4) == 0 && (ld8(r + 5) == 0 && (ld8(r + 6) == 0 && ld8(r + 7) == 0))))))) {
						fn_9660(s48, g)
						const buffer: AccountInfo = ld64(s48)
						if (buffer == 0) {
							q = fn_4130(s170, ld64(s40), ld64(s40 + 8), 0x10015bb89 /* "buffer" */, 6)
							const aa = ld64(s170)
							st64(a + 0x10, ld64(s170 + 8))
							st64(a + 8, aa)
							st64(a, 0)
							st64(p, ld64(p) - 1)
							return q
						}
						copyr(sa0, s40, 0x28)
						st64(p, ld64(p) - 1)
						if (buffer.is_writable != 0) {
							AccountInfo_clone_f338(s78, buffer)
							const ad = fn_147a20(s78)
							AccountInfo_clone_f338(s48, buffer)
							AccountInfo_try_data_len(s18, s48)
							const y = ld64(s18 + 8)
							const x = ld64(s18)
							if (x != 0x800000000000001a /* Ok */) {
								st64(s18 + 0x10, ld64(s18 + 0x10))
								st64(s18, x, y)
								const ac = fn_13e628(s120, s18)
								const ab = ld64(s120)
								st64(a + 0x10, ld64(s120 + 8))
								st64(a + 8, ab)
								st64(a, 0)
								return ptr_drop_in_place_fcd8(s78, ptr_drop_in_place_fcd8(s48, ac))
							}
							const z = Rent_is_exempt(sd0, ad, y)
							ptr_drop_in_place_fcd8(s78, ptr_drop_in_place_fcd8(s48, z))
							if (z != 0) {
								q = memcmp(ld64(k), 0x100159560, 0x20) as u32
								if (q != 0) {
									st64(a + 0x28, ld64(sa0 + 0x20))
									st64(a + 0x20, ld64(sa0 + 0x18))
									st64(a + 0x18, ld64(sa0 + 0x10))
									st64(a + 0x10, ld64(sa0 + 8))
									st64(a + 8, ld64(sa0))
									st64(a + 0x30, k)
									st64(a, buffer)
									return q
								}
								anchor_error_from(s150, 0x7d3 /* anchor::ConstraintRaw */)
								q = fn_4130(s160, ld64(s150), ld64(s150 + 8), "authority", 9)
								h = ld64(s160)
								st64(a + 0x10, ld64(s160 + 8))
								st64(a + 8, h)
								st64(a, 0)
								return q
							}
							anchor_error_from(s130, 0x7d5 /* anchor::ConstraintRentExempt */)
							q = fn_4130(s140, ld64(s130), ld64(s130 + 8), 0x10015bb89 /* "buffer" */, 6)
							h = ld64(s140)
							st64(a + 0x10, ld64(s140 + 8))
							st64(a + 8, h)
							st64(a, 0)
							return q
						}
						anchor_error_from(s100, 0x7d0 /* anchor::ConstraintMut */)
						q = fn_4130(s110, ld64(s100), ld64(s100 + 8), 0x10015bb89 /* "buffer" */, 6)
						h = ld64(s110)
						st64(a + 0x10, ld64(s110 + 8))
						st64(a + 8, h)
						st64(a, 0)
						return q
					}
					q = anchor_error_from(sf0, 0x7dd /* anchor::ConstraintZero */, 0x800000000000001a /* Ok */)
					const s = ld64(0x300000000 /* heap bump-allocator cursor */)
					const u = s != 0 ? sat_sub(s, 6) : 0x300007ffa
					const v = ld64(sf0 + 8)
					const t = ld64(sf0)
					if ((t & 1) != 0) {
						if (0x300000008 > u) {
							raw_vec_handle_error(1, 6, 0x10015f8f8, 0x300000008)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, u)
						st16(u + 4, 0x7265)
						st32(u, 0x66667562)
						void ld64(v)
					} else {
						if (0x300000008 > u) {
							raw_vec_handle_error(1, 6, 0x10015f8f8, 0x300000008)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, u)
						st16(u + 4, 0x7265)
						st32(u, 0x66667562)
						void ld64(v)
					}
					st64(v + 0x10, u, 6)
					st64(v + 8, 6)
					st64(v, 1)
					st64(a + 0x10, v)
					st64(a + 8, t)
					st64(a, 0)
					st64(p, ld64(p) - 1)
					return q
				}
				fn_153158(8, o, 0x100160bd8)
			}
			st64(s48, m, n, p)
			q = fn_13e628(se0, s48)
			h = ld64(se0)
			st64(a + 0x10, ld64(se0 + 8))
			st64(a + 8, h)
			st64(a, 0)
			return q
		}
		const i = ld64(0x300000000 /* heap bump-allocator cursor */)
		const j = i != 0 ? sat_sub(i, 9) : 0x300007ff7
		if ((h & 1) != 0) {
			if (0x300000008 > j) {
				raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(i, 9), 9 > i)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j, 0x7469726f68747561)
			st8(j + 8, 0x79)
			void ld64(k)
		} else {
			if (0x300000008 > j) {
				raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(i, 9), 9 > i)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j, 0x7469726f68747561)
			st8(j + 8, 0x79)
			void ld64(k)
		}
		st64(k + 0x10, j, 9)
		st64(k + 8, 9)
		st64(k, 1)
		st64(a + 0x10, k)
		st64(a + 8, h)
		st64(a, 0)
		return q
	}
	q = anchor_error_from(s190, 0xbbd /* anchor::AccountNotEnoughKeys */, c, d, e)
	h = ld64(s190)
	st64(a + 0x10, ld64(s190 + 8))
	st64(a + 8, h)
	st64(a, 0)
	return q
}

export function fn_121908(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10
	const j = Account_exit_with_expected_owner(s10, b, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
	let i = undef
	const f = ld64(s10)
	if (f == 2) {
		st64(a + 8, i)
		st64(a, f)
		return j
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 6) : 0x300007ffa
	i = ld64(s10 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 6, 0x10015f8f8, 0x300000008, 6 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st16(h + 4, 0x7265)
		st32(h, 0x66667562)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 6, 0x10015f8f8, 0x300000008, 6 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st16(h + 4, 0x7265)
		st32(h, 0x66667562)
		void ld64(i)
	}
	st64(i + 0x10, h, 6)
	st64(i + 8, 6)
	st64(i, 1)
	st64(a + 8, i)
	st64(a, f)
	return j
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: authority (ConstraintHasOne, ConstraintRaw, ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: authority [idl], authority_2 [idl]
export function fn_121af0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s28 = fp - 0x28, s40 = fp - 0x40, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s120 = fp - 0x120
	let ag, ah: u64
	let h = try_accounts_18420(s40, c, c, d, e)
	const q = ld64(s40 + 0x10)
	let g = ld64(s40 + 8)
	const authority: AccountInfo = ld64(s40)
	if (authority == 0) {
		const o = ld64(0x300000000 /* heap bump-allocator cursor */)
		const p = o != 0 ? sat_sub(o, 3) : 0x300007ffd
		if ((g & 1) != 0) {
			if (0x300000008 > p) {
				raw_vec_handle_error(1, 3, 0x10015f8f8, 3 > o, g)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, p)
			st8(p + 2, 0x6c)
			st16(p, 0x6469)
			void ld64(q)
		} else {
			if (0x300000008 > p) {
				raw_vec_handle_error(1, 3, 0x10015f8f8, 3 > o, g)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, p)
			st8(p + 2, 0x6c)
			st16(p, 0x6469)
			void ld64(q)
		}
		st64(q + 0x10, p, 3)
		st64(q + 8, 3)
		st64(q, 1)
		st64(a + 0x10, q)
		st64(a + 8, g)
		st64(a, 0)
		return h
	}
	st64(s118, g, a)
	copyr(s98, s28, 0x18)
	h = try_accounts_17a30(s40, c, undef, undef, g, h)
	const authority_2: AccountInfo = ld64(s40 + 8)
	const i = ld64(s40)
	if (i == 2) {
		try_accounts_18870(s40, c)
		const x = ld64(s40 + 8)
		const j = ld64(s40)
		if (j == 2) {
			if (authority.is_writable != 0) {
				st64(s120, x)
				st64(s80 + 8, q)
				st64(s80, ld64(s118))
				copy(s70, s98, 0x10)
				const y = authority_2.key
				copy(s60, y, 0x20)
				if ((memcmp(s80, s60, 0x20) as u32) != 0) {
					const ad = anchor_error_from(sb8, 0x7d1 /* anchor::ConstraintHasOne */)
					g = undef
					const z = ld64(0x300000000 /* heap bump-allocator cursor */)
					const ae = ld64(s118 + 8)
					const ab = z != 0 ? sat_sub(z, 3) : 0x300007ffd
					const ac = ld64(sb8 + 8)
					const aa = ld64(sb8)
					if ((aa & 1) != 0) {
						if (0x300000008 > ab) {
							raw_vec_handle_error(1, 3, 0x10015f8f8, 0x300000008, g)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ab)
						st8(ab + 2, 0x6c)
						st16(ab, 0x6469)
						void ld64(ac)
					} else {
						if (0x300000008 > ab) {
							raw_vec_handle_error(1, 3, 0x10015f8f8, 0x300000008, g)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ab)
						st8(ab + 2, 0x6c)
						st16(ab, 0x6469)
						void ld64(ac)
					}
					st64(ac + 0x10, ab, 3)
					st64(ac + 8, 3)
					st64(ac, 1)
					copy(s40, s80, 0x40)
					h = Error_with_pubkeys(sc8, aa, ac, s40, ad)
					const af = ld64(sc8)
					st64(ae + 0x10, ld64(sc8 + 8))
					st64(ae + 8, af)
					st64(ae, 0)
					return h
				}
				if (authority_2.is_writable != 0) {
					h = memcmp(y, 0x100159560, 0x20) as u32
					if (h != 0) {
						const ai = ld64(s118 + 8)
						st64(ai + 0x28, ld64(s98 + 0x10))
						st64(ai + 0x20, ld64(s98 + 8))
						st64(ai + 0x18, ld64(s98))
						st64(ai + 0x38, ld64(s120))
						st64(ai + 0x30, authority_2)
						st64(ai + 0x10, q)
						st64(ai + 8, ld64(s118))
						st64(ai, authority)
						return h
					}
					anchor_error_from(sf8, 0x7d3 /* anchor::ConstraintRaw */)
					h = fn_4130(s108, ld64(sf8), ld64(sf8 + 8), "authority", 9)
					ah = ld64(s108)
					ag = ld64(s118 + 8)
					st64(ag + 0x10, ld64(s108 + 8))
					st64(ag + 8, ah)
					st64(ag, 0)
					return h
				}
				anchor_error_from(sd8, 0x7d0 /* anchor::ConstraintMut */)
				h = fn_4130(se8, ld64(sd8), ld64(sd8 + 8), "authority", 9)
				ah = ld64(se8)
				ag = ld64(s118 + 8)
				st64(ag + 0x10, ld64(se8 + 8))
				st64(ag + 8, ah)
				st64(ag, 0)
				return h
			}
			h = anchor_error_from(sa8, 0x7d0 /* anchor::ConstraintMut */)
			const k = ld64(0x300000000 /* heap bump-allocator cursor */)
			g = ld64(s118 + 8)
			const m = k != 0 ? sat_sub(k, 3) : 0x300007ffd
			const n = ld64(sa8 + 8)
			const l = ld64(sa8)
			if ((l & 1) != 0) {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 3, 0x10015f8f8, 0x300000008, g)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st8(m + 2, 0x6c)
				st16(m, 0x6469)
				void ld64(n)
			} else {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 3, 0x10015f8f8, 0x300000008, g)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st8(m + 2, 0x6c)
				st16(m, 0x6469)
				void ld64(n)
			}
			st64(n + 0x10, m, 3)
			st64(n + 8, 3)
			st64(n, 1)
			st64(g + 0x10, n)
			st64(g + 8, l)
			st64(g, 0)
			return h
		}
		const v = ld64(0x300000000 /* heap bump-allocator cursor */)
		h = ld64(s118 + 8)
		const w = v != 0 ? sat_sub(v, 0xe) : 0x300007ff2
		if ((j & 1) != 0) {
			if (0x300000008 > w) {
				raw_vec_handle_error(1, 0xe, 0x10015f8f8, sat_sub(v, 0xe), 0xe > v)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, w)
			st64(w + 6, 0x6d6172676f72705f)
			st64(w, 0x705f6d6574737973)
			void ld64(x)
		} else {
			if (0x300000008 > w) {
				raw_vec_handle_error(1, 0xe, 0x10015f8f8, sat_sub(v, 0xe), 0xe > v)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, w)
			st64(w + 6, 0x6d6172676f72705f)
			st64(w, 0x705f6d6574737973)
			void ld64(x)
		}
		st64(x + 0x10, w, 0xe)
		st64(x + 8, 0xe)
		st64(x, 1)
		st64(h + 0x10, x)
		st64(h + 8, j)
		st64(h, 0)
		return h
	}
	const r = ld64(0x300000000 /* heap bump-allocator cursor */)
	const s = r != 0 ? sat_sub(r, 9) : 0x300007ff7
	if ((i & 1) != 0) {
		if (0x300000008 > s) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(r, 9), 9 > r)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, s)
		st64(s, 0x7469726f68747561)
		st8(s + 8, 0x79)
		void authority_2.key
	} else {
		if (0x300000008 > s) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(r, 9), 9 > r)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, s)
		st64(s, 0x7469726f68747561)
		st8(s + 8, 0x79)
		void authority_2.key
	}
	st64(authority_2 + 0x10, s, 9)
	st64(authority_2 + 8 /* lamports */, 9)
	st64(authority_2 /* key */, 1)
	const u = ld64(s118 + 8)
	st64(u + 0x10, authority_2)
	st64(u + 8, i)
	st64(u, 0)
	return h
}

export function fn_122828(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10
	const j = Account_exit_with_expected_owner(s10, b, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
	let i = undef
	const f = ld64(s10)
	if (f == 2) {
		st64(a + 8, i)
		st64(a, f)
		return j
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 3) : 0x300007ffd
	i = ld64(s10 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 3, 0x10015f8f8, 0x300000008, 3 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 2, 0x6c)
		st16(h, 0x6469)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 3, 0x10015f8f8, 0x300000008, 3 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 2, 0x6c)
		st16(h, 0x6469)
		void ld64(i)
	}
	st64(i + 0x10, h, 3)
	st64(i + 8, 3)
	st64(i, 1)
	st64(a + 8, i)
	st64(a, f)
	return j
}

export function fn_122a10(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s28 = fp - 0x28, s40 = fp - 0x40, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8
	let t, v: u64
	let h = try_accounts_18420(s40, c, c, d, e)
	const j = ld64(s40 + 0x10)
	let g = ld64(s40 + 8)
	const f = ld64(s40)
	if (f == 0) {
		const n = ld64(0x300000000 /* heap bump-allocator cursor */)
		const o = n != 0 ? sat_sub(n, 3) : 0x300007ffd
		if ((g & 1) != 0) {
			if (0x300000008 > o) {
				raw_vec_handle_error(1, 3, 0x10015f8f8, 3 > n, g)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, o)
			st8(o + 2, 0x6c)
			st16(o, 0x6469)
			void ld64(j)
		} else {
			if (0x300000008 > o) {
				raw_vec_handle_error(1, 3, 0x10015f8f8, 3 > n, g)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, o)
			st8(o + 2, 0x6c)
			st16(o, 0x6469)
			void ld64(j)
		}
		st64(j + 0x10, o, 3)
		st64(j + 8, 3)
		st64(j, 1)
		st64(a + 0x10, j)
		st64(a + 8, g)
		st64(a, 0)
		return h
	}
	st64(se8, g, a)
	copyr(s98, s28, 0x18)
	h = try_accounts_17a30(s40, c, undef, undef, g, h)
	const k = ld64(s40 + 8)
	const i = ld64(s40)
	if (i == 2) {
		if (ld8(f + 0x29) != 0) {
			st64(s80 + 8, j)
			st64(s80, ld64(se8))
			copy(s70, s98, 0x10)
			const l = ld64(k)
			copy(s60, l, 0x20)
			if ((memcmp(s80, s60, 0x20) as u32) != 0) {
				const ab = anchor_error_from(sb8, 0x7d1 /* anchor::ConstraintHasOne */)
				g = undef
				const x = ld64(0x300000000 /* heap bump-allocator cursor */)
				const ac = ld64(se8 + 8)
				const z = x != 0 ? sat_sub(x, 3) : 0x300007ffd
				const aa = ld64(sb8 + 8)
				const y = ld64(sb8)
				if ((y & 1) != 0) {
					if (0x300000008 > z) {
						raw_vec_handle_error(1, 3, 0x10015f8f8, 0x300000008, g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, z)
					st8(z + 2, 0x6c)
					st16(z, 0x6469)
					void ld64(aa)
				} else {
					if (0x300000008 > z) {
						raw_vec_handle_error(1, 3, 0x10015f8f8, 0x300000008, g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, z)
					st8(z + 2, 0x6c)
					st16(z, 0x6469)
					void ld64(aa)
				}
				st64(aa + 0x10, z, 3)
				st64(aa + 8, 3)
				st64(aa, 1)
				copy(s40, s80, 0x40)
				h = Error_with_pubkeys(sc8, y, aa, s40, ab)
				const ad = ld64(sc8)
				st64(ac + 0x10, ld64(sc8 + 8))
				st64(ac + 8, ad)
				st64(ac, 0)
				return h
			}
			h = memcmp(l, 0x100159560, 0x20) as u32
			if (h == 0) {
				h = anchor_error_from(sd8, 0x7d3 /* anchor::ConstraintRaw */)
				const ae = ld64(0x300000000 /* heap bump-allocator cursor */)
				g = ld64(se8 + 8)
				const af = ae != 0 ? sat_sub(ae, 9) : 0x300007ff7
				v = ld64(sd8 + 8)
				t = ld64(sd8)
				if ((t & 1) != 0) {
					if (0x300000008 > af) {
						raw_vec_handle_error(1, 9, 0x10015f8f8, 0x300000008, g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, af)
					st64(af, 0x7469726f68747561)
					st8(af + 8, 0x79)
					void ld64(v)
				} else {
					if (0x300000008 > af) {
						raw_vec_handle_error(1, 9, 0x10015f8f8, 0x300000008, g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, af)
					st64(af, 0x7469726f68747561)
					st8(af + 8, 0x79)
					void ld64(v)
				}
				st64(v + 0x10, af, 9)
				st64(v + 8, 9)
				st64(v, 1)
				st64(g + 0x10, v)
				st64(g + 8, t)
				st64(g, 0)
				return h
			}
			const m = ld64(se8 + 8)
			st64(m + 0x28, ld64(s98 + 0x10))
			st64(m + 0x20, ld64(s98 + 8))
			st64(m + 0x18, ld64(s98))
			st64(m + 0x30, k)
			st64(m + 0x10, j)
			st64(m + 8, ld64(se8))
			st64(m, f)
			return h
		}
		h = anchor_error_from(sa8, 0x7d0 /* anchor::ConstraintMut */)
		const s = ld64(0x300000000 /* heap bump-allocator cursor */)
		g = ld64(se8 + 8)
		const u = s != 0 ? sat_sub(s, 3) : 0x300007ffd
		v = ld64(sa8 + 8)
		t = ld64(sa8)
		if ((t & 1) != 0) {
			if (0x300000008 > u) {
				raw_vec_handle_error(1, 3, 0x10015f8f8, 0x300000008, g)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, u)
			st8(u + 2, 0x6c)
			st16(u, 0x6469)
			void ld64(v)
		} else {
			if (0x300000008 > u) {
				raw_vec_handle_error(1, 3, 0x10015f8f8, 0x300000008, g)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, u)
			st8(u + 2, 0x6c)
			st16(u, 0x6469)
			void ld64(v)
		}
		st64(v + 0x10, u, 3)
		st64(v + 8, 3)
		st64(v, 1)
		st64(g + 0x10, v)
		st64(g + 8, t)
		st64(g, 0)
		return h
	}
	const p = ld64(0x300000000 /* heap bump-allocator cursor */)
	g = 9 > p
	const q = g != 0 ? 0 : p - 9
	const r = p != 0 ? q : 0x300007ff7
	if ((i & 1) != 0) {
		if (0x300000008 > r) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, q, g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, r)
		st64(r, 0x7469726f68747561)
		st8(r + 8, 0x79)
		void ld64(k)
	} else {
		if (0x300000008 > r) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, q, g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, r)
		st64(r, 0x7469726f68747561)
		st8(r + 8, 0x79)
		void ld64(k)
	}
	st64(k + 0x10, r, 9)
	st64(k + 8, 9)
	st64(k, 1)
	const w = ld64(se8 + 8)
	st64(w + 0x10, k)
	st64(w + 8, i)
	st64(w, 0)
	return h
}

export function fn_123598(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10
	const j = Account_exit_with_expected_owner(s10, b, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
	let i = undef
	const f = ld64(s10)
	if (f == 2) {
		st64(a + 8, i)
		st64(a, f)
		return j
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 3) : 0x300007ffd
	i = ld64(s10 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 3, 0x10015f8f8, 0x300000008, 3 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 2, 0x6c)
		st16(h, 0x6469)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 3, 0x10015f8f8, 0x300000008, 3 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 2, 0x6c)
		st16(h, 0x6469)
		void ld64(i)
	}
	st64(i + 0x10, h, 3)
	st64(i + 8, 3)
	st64(i, 1)
	st64(a + 8, i)
	st64(a, f)
	return j
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: base (ConstraintSeeds), program (ConstraintExecutable), to (ConstraintMut), from (ConstraintSigner)
export function fn_123780(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s80 = fp - 0x80, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc0 = fp - 0xc0, se0 = fp - 0xe0, se8 = fp - 0xe8, sf0 = fp - 0xf0, s110 = fp - 0x110, s118 = fp - 0x118, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8, s200 = fp - 0x200, s208 = fp - 0x208, s210 = fp - 0x210, s218 = fp - 0x218, s220 = fp - 0x220
	let al, aw, br, bs: u64
	const f = ld64(c + 8)
	if (f == 0) {
		al = anchor_error_from(s1f0, 0xbbd /* anchor::AccountNotEnoughKeys */, c, d, e)
		aw = undef
		const x = ld64(0x300000000 /* heap bump-allocator cursor */)
		const z = x != 0 ? sat_sub(x, 4) : 0x300007ffc
		const aa = ld64(s1f0 + 8)
		const y = ld64(s1f0)
		if ((y & 1) != 0) {
			if (0x300000008 > z) {
				raw_vec_handle_error(1, 4, 0x10015f8f8, 0x300000008, aw)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, z)
			st32(z, 0x6d6f7266)
			void ld64(aa)
		} else {
			if (0x300000008 > z) {
				raw_vec_handle_error(1, 4, 0x10015f8f8, 0x300000008, aw)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, z)
			st32(z, 0x6d6f7266)
			void ld64(aa)
		}
		st64(aa + 0x10, z, 4)
		st64(aa + 8, 4)
		st64(aa, 1)
		st64(a + 8, aa)
		st64(a, y)
		st8(a + 0xc2, 2)
		return al
	}
	st64(s200, ld64(e - 0xff8))
	const g: AccountInfo = ld64(c)
	st64(c, g + 0x30, f - 1)
	const h: LamportsCell = g.lamports
	const i = h.strong
	st64(s210, g.key)
	rc_inc(h, i)
	st64(s208, f)
	st64(s1f8, a)
	const j: DataCell = g.data
	rc_inc(j)
	st64(s218, b)
	const n = g.is_signer
	const m = g.owner
	const l = g.rent_epoch
	const k = g.is_writable
	st8(s110 + 0x1a, g.executable)
	st8(s110 + 0x19, k)
	st64(s118, h, j, m, l)
	st64(s120, ld64(s210))
	st64(s220, n)
	st8(s110 + 0x18, n)
	if (f == 1) {
		al = anchor_error_from(s1e0, 0xbbd /* anchor::AccountNotEnoughKeys */, c, n, f - 1)
		const am = ld64(0x300000000 /* heap bump-allocator cursor */)
		const aq = ld64(s1f8)
		const ao = am != 0 ? sat_sub(am, 2) : 0x300007ffe
		const ap = ld64(s1e0 + 8)
		const an = ld64(s1e0)
		if ((an & 1) != 0) {
			if (0x300000008 > ao) {
				raw_vec_handle_error(1, 2, 0x10015f8f8, 0x300000008, aq)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, ao)
			st16(ao, 0x6f74)
			void ld64(ap)
		} else {
			if (0x300000008 > ao) {
				raw_vec_handle_error(1, 2, 0x10015f8f8, 0x300000008, aq)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, ao)
			st16(ao, 0x6f74)
			void ld64(ap)
		}
		st64(ap + 0x10, ao, 2)
		st64(ap + 8, 2)
		st64(ap, 1)
		st64(aq + 8, ap)
		st64(aq, an)
		st8(aq + 0xc2, 2)
	} else {
		st64(c, g + 0x60)
		const o = ld64(s208)
		st64(c + 8, o - 2)
		const p: LamportsCell = g[1].lamports
		const r = g[1].key
		rc_inc(p)
		const q: DataCell = g[1].data
		rc_inc(q)
		const v = g[1].is_writable
		st64(s210, r)
		const u = g[1].owner
		const t = g[1].rent_epoch
		const s = g[1].is_signer
		st8(se0 + 0x1a, g[1].executable)
		st8(se0 + 0x18, s)
		st64(se8, p, q, u, t)
		st64(sf0, ld64(s210))
		st8(se0 + 0x19, v)
		if (o == 2) {
			al = anchor_error_from(s1d0, 0xbbd /* anchor::AccountNotEnoughKeys */, c, v, o - 2)
			const ar = ld64(0x300000000 /* heap bump-allocator cursor */)
			aw = ld64(s1f8)
			const au = ar != 0 ? sat_sub(ar, 4) : 0x300007ffc
			const av = ld64(s1d0 + 8)
			const at = ld64(s1d0)
			if ((at & 1) != 0) {
				if (0x300000008 > au) {
					raw_vec_handle_error(1, 4, 0x10015f8f8, 0x300000008, aw)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, au)
				st32(au, 0x65736162)
				void ld64(av)
			} else {
				if (0x300000008 > au) {
					raw_vec_handle_error(1, 4, 0x10015f8f8, 0x300000008, aw)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, au)
				st32(au, 0x65736162)
				void ld64(av)
			}
			st64(av + 0x10, au, 4)
			st64(av + 8, 4)
			st64(av, 1)
			st64(aw + 8, av)
			st64(aw, at)
			st8(aw + 0xc2, 2)
		} else {
			st64(s210, v)
			st64(c + 8, ld64(s208) - 3)
			st64(c, g + 0x90)
			let w = g[2].lamports
			const ag = g[2].key
			rc_inc(w)
			const ab: DataCell = g[2].data
			rc_inc(ab)
			const af = g[2].owner
			const ae = g[2].rent_epoch
			const ad = g[2].is_signer
			const ac = g[2].is_writable
			st8(s98 + 2, g[2].executable)
			st8(s98, ad, ac)
			st64(sc0, ag, w, ab, af, ae)
			try_accounts_18870(s40, c, c, ab, ae)
			const ak = ld64(s40 + 8)
			const ah = ld64(s40)
			if (ah == 2) {
				const ax = ld64(c + 8)
				if (ax == 0) {
					al = anchor_error_from(s1c0, 0xbbd /* anchor::AccountNotEnoughKeys */)
					const bl = ld64(0x300000000 /* heap bump-allocator cursor */)
					const bp = ld64(s1f8)
					const bn = bl != 0 ? sat_sub(bl, 7) : 0x300007ff9
					const bo = ld64(s1c0 + 8)
					const bm = ld64(s1c0)
					if ((bm & 1) != 0) {
						if (0x300000008 > bn) {
							raw_vec_handle_error(1, 7, 0x10015f8f8, 0x300000008, bp)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, bn)
						st32(bn + 3, 0x6d617267)
						st32(bn, 0x676f7270)
						void ld64(bo)
					} else {
						if (0x300000008 > bn) {
							raw_vec_handle_error(1, 7, 0x10015f8f8, 0x300000008, bp)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, bn)
						st32(bn + 3, 0x6d617267)
						st32(bn, 0x676f7270)
						void ld64(bo)
					}
					st64(bo + 0x10, bn, 7)
					st64(bo + 8, 7)
					st64(bo, 1)
					st64(bp + 8, bo)
					st64(bp, bm)
					st8(bp + 0xc2, 2)
				} else {
					st64(c + 8, ax - 1)
					const ay: AccountInfo = ld64(c)
					st64(c, ay + 0x30)
					let az = ay.lamports
					const be = ay.key
					rc_inc(az)
					const ba: DataCell = ay.data
					rc_inc(ba)
					B51: {
						const bf = ay.executable
						const bd = ay.owner
						const bc = ay.rent_epoch
						const bb = ay.is_signer
						st8(s80 + 0x19, ay.is_writable)
						st8(s80 + 0x18, bb)
						st64(s90, be, az, ba, bd, bc)
						st8(s80 + 0x1a, bf)
						if ((ld64(s220) & 1) != 0) {
							if ((ld64(s210) & 1) != 0) {
								Pubkey_find_program_address(s40, 8, 0, ld64(s218))
								copyr(s60, s40, 0x20)
								st8(ld64(s200), ld8(s20))
								copyr(s40, ag, 0x20)
								if ((memcmp(s40, s60, 0x20) as u32) != 0) {
									anchor_error_from(s170, 0x7d6 /* anchor::ConstraintSeeds */)
									const bi = fn_4130(s180, ld64(s170), ld64(s170 + 8), 0x100159898 /* "base" */, 4)
									const bh = ld64(s180 + 8)
									const bg = ld64(s180)
									copyr(s40, ag, 0x20)
									copy(s20, s60, 0x20)
									al = Error_with_pubkeys(s190, bg, bh, s40, bi)
									const bk = ld64(s190)
									const bj = ld64(s1f8)
									st64(bj + 8, ld64(s190 + 8))
									st64(bj, bk)
									st8(bj + 0xc2, 2)
									az = ld64(s88)
									break B51
								}
								if ((bf & 1) != 0) {
									const bz = ld64(s1f8)
									memcpy(bz + 8, s120, 0x30)
									memcpy(bz + 0x38, sf0, 0x30)
									memcpy(bz + 0x68, sc0, 0x30)
									al = memcpy(bz + 0x98, s90, 0x30)
									st64(bz, ak)
									return al
								}
								anchor_error_from(s1a0, 0x7d7 /* anchor::ConstraintExecutable */)
								al = fn_4130(s1b0, ld64(s1a0), ld64(s1a0 + 8), 0x10015bb94 /* "program" */, 7)
								bs = ld64(s1b0)
								br = ld64(s1b0 + 8)
							} else {
								anchor_error_from(s150, 0x7d0 /* anchor::ConstraintMut */, ba, bd, bc)
								al = fn_4130(s160, ld64(s150), ld64(s150 + 8), 0x10015bb92 /* "to" */, 2)
								bs = ld64(s160)
								br = ld64(s160 + 8)
							}
						} else {
							anchor_error_from(s130, 0x7d2 /* anchor::ConstraintSigner */, ba, bd, bc)
							al = fn_4130(s140, ld64(s130), ld64(s130 + 8), 0x100159880 /* "from" */, 4)
							bs = ld64(s140)
							br = ld64(s140 + 8)
						}
						const bq = ld64(s1f8)
						st64(bq + 8, br)
						st64(bq, bs)
						st8(bq + 0xc2, 2)
					}
					if (rc_release(az)) {
						al = Rc_drop_slow_14df0(s88, al)
					}
					const bt: DataCell = ld64(s80)
					if (rc_release(bt)) {
						al = Rc_drop_slow_14df0(s80, al)
					}
				}
				w = ld64(sb8)
			} else {
				const ai = ld64(0x300000000 /* heap bump-allocator cursor */)
				al = ld64(s1f8)
				const aj = ai != 0 ? sat_sub(ai, 0xe) : 0x300007ff2
				if ((ah & 1) != 0) {
					if (0x300000008 > aj) {
						raw_vec_handle_error(1, 0xe, 0x10015f8f8, sat_sub(ai, 0xe), 0xe > ai)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, aj)
					st64(aj + 6, 0x6d6172676f72705f)
					st64(aj, 0x705f6d6574737973)
					void ld64(ak)
				} else {
					if (0x300000008 > aj) {
						raw_vec_handle_error(1, 0xe, 0x10015f8f8, sat_sub(ai, 0xe), 0xe > ai)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, aj)
					st64(aj + 6, 0x6d6172676f72705f)
					st64(aj, 0x705f6d6574737973)
					void ld64(ak)
				}
				st64(ak + 0x10, aj, 0xe)
				st64(ak + 8, 0xe)
				st64(ak, 1)
				st64(al + 8, ak)
				st64(al, ah)
				st8(al + 0xc2, 2)
			}
			if (rc_release(w)) {
				al = Rc_drop_slow_14df0(sb8, al)
			}
			const bu: DataCell = ld64(sb0)
			if (rc_release(bu)) {
				al = Rc_drop_slow_14df0(sb0, al)
			}
		}
		const bv: LamportsCell = ld64(se8)
		if (rc_release(bv)) {
			al = Rc_drop_slow_14df0(se8, al)
		}
		const bw: DataCell = ld64(se0)
		if (rc_release(bw)) {
			al = Rc_drop_slow_14df0(se0, al)
		}
	}
	const bx: LamportsCell = ld64(s118)
	if (rc_release(bx)) {
		al = Rc_drop_slow_14df0(s118, al)
	}
	const by: DataCell = ld64(s110)
	if (!rc_release(by)) {
		return al
	}
	return Rc_drop_slow_14df0(s110, al)
}

export function fn_1250e8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let g, j: u64
	if (8 > ld64(b + 8)) {
		j = anchor_error_from(s138, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		g = ld64(s138)
		st64(a + 0x10, ld64(s138 + 8))
		st64(a + 8, g)
		st32(a, 1)
		return j
	}
	if (ld64(ld64(b)) == 0x9e7b903abf624618) {
		return fn_125528(a, b, 0x9e7b903abf624618, d, e)
	}
	ErrorCode_name(s78, 0x1001598e8, 0x9e7b903abf624618, d, e)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (ErrorCode_fmt(0x1001598e8, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015b659)
	st32(sf8 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0x2f)
	st64(s118 + 0x10, 0x17)
	st64(s118, 0)
	j = fn_13e5a0(s128, s118)
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	g = ld64(s128)
	const h = f != 0 ? sat_sub(f, 0xa) : 0x300007ff6
	const i = ld64(s128 + 8)
	if ((g & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x756f6363416c6449)
		st16(h + 8, 0x746e)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x756f6363416c6449)
		st16(h + 8, 0x746e)
		void ld64(i)
	}
	st64(i + 0x10, h, 0xa)
	st64(i + 8, 0xa)
	st64(i, 1)
	st64(a + 0x10, i)
	st64(a + 8, g)
	st32(a, 1)
	return j
}

export function fn_125710(): never {
	fn_14d4f8()
}

export function fn_1302e8(a: u64, b: u64, c: u64) {
	fn_130308(a, b, c, 1, 0)
}

export function fn_130308(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s8 = fp - 0x8, s20 = fp - 0x20, s38 = fp - 0x38, s50 = fp - 0x50, s60 = fp - 0x60
	let j, k, m: u64
	let f = e
	const g = e > e + 7
	if ((g & 1) != 0) {
		fn_154730(0x100160c88, g & 1, c, d, e)
	}
	__multi3_159030(s60, e + 7, 0, 0x22, 0)
	const h = ld64(s60)
	if (ld64(s60 + 8) != 0) {
		raw_vec_handle_error(0, h, 0x100160ca0, j, k)
	}
	if (0 > (h as i64)) {
		raw_vec_handle_error(0, h, 0x100160ca0, j, k)
	}
	let i = 1
	let l = 0
	if (h != 0) {
		i = __rust_alloc(h, 1)
		l = e + 7
		if (i == 0) {
			raw_vec_handle_error(1, h, 0x100160ca0, j, k)
		}
	}
	st64(s50, l, i, 0)
	if (l == 0) {
		RawVec_grow_one_12f3a0(s50, 0x100160cb8, m, j, k)
		l = ld64(s50)
		i = ld64(s50 + 8)
	}
	st64(i + 0x18, ld64(b + 0x5a))
	st64(i + 0x10, ld64(b + 0x52))
	st64(i + 8, ld64(b + 0x4a))
	st64(i, ld64(b + 0x42))
	st16(i + 0x20, 0x100)
	st64(s50 + 0x10, 1)
	if (l == 1) {
		RawVec_grow_one_12f3a0(s50, 0x100160cd0, m, j, k)
		l = ld64(s50)
		i = ld64(s50 + 8)
	}
	st64(i + 0x3a, ld64(b + 0x7a))
	st64(i + 0x32, ld64(b + 0x72))
	st64(i + 0x2a, ld64(b + 0x6a))
	st64(i + 0x22, ld64(b + 0x62))
	st16(i + 0x42, 0)
	st64(s50 + 0x10, 2)
	if (l == 2) {
		RawVec_grow_one_12f3a0(s50, 0x100160ce8, m, j, k)
		l = ld64(s50)
		i = ld64(s50 + 8)
	}
	st64(i + 0x5c, ld64(b + 0x9a))
	st64(i + 0x54, ld64(b + 0x92))
	st64(i + 0x4c, ld64(b + 0x8a))
	st64(i + 0x44, ld64(b + 0x82))
	st16(i + 0x64, 1)
	st64(s50 + 0x10, 3)
	if (l == 3) {
		RawVec_grow_one_12f3a0(s50, 0x100160d00, m, j, k)
		l = ld64(s50)
		i = ld64(s50 + 8)
	}
	st64(i + 0x7e, ld64(b + 0xba))
	st64(i + 0x76, ld64(b + 0xb2))
	st64(i + 0x6e, ld64(b + 0xaa))
	st64(i + 0x66, ld64(b + 0xa2))
	st16(i + 0x86, 0x101)
	st64(s50 + 0x10, 4)
	const n = ld8(b + 0x41)
	if (l == 4) {
		RawVec_grow_one_12f3a0(s50, 0x100160d18, m, j, k)
		l = ld64(s50)
		i = ld64(s50 + 8)
	}
	st64(i + 0xa0, ld64(b + 0x39))
	st64(i + 0x98, ld64(b + 0x31))
	st64(i + 0x90, ld64(b + 0x29))
	st64(i + 0x88, ld64(b + 0x21))
	st8(i + 0xa8, n, 0)
	st64(s50 + 0x10, 5)
	if (l == 5) {
		RawVec_grow_one_12f3a0(s50, 0x100160d30, m, j, k)
		l = ld64(s50)
		i = ld64(s50 + 8)
	}
	st64(i + 0xc2, ld64(b + 0xda))
	st64(i + 0xba, ld64(b + 0xd2))
	st64(i + 0xb2, ld64(b + 0xca))
	st64(i + 0xaa, ld64(b + 0xc2))
	st16(i + 0xca, 0)
	let p = 6
	st64(s50 + 0x10, 6)
	const o = ld8(b)
	if (o == 1) {
		if (l == 6) {
			RawVec_grow_one_12f3a0(s50, 0x100160d48, o, j, k)
			l = ld64(s50)
			i = ld64(s50 + 8)
		}
		st64(i + 0xe4, ld64(b + 0x19))
		st64(i + 0xdc, ld64(b + 0x11))
		st64(i + 0xd4, ld64(b + 9))
		st64(i + 0xcc, ld64(b + 1))
		st16(i + 0xec, 0)
		p = 7
		st64(s50 + 0x10, 7)
	}
	if (f > l - p) {
		reserve_do_reserve_and_handle_12f548(s50, p, f, 1, 0x22)
		i = ld64(s50 + 8)
		p = ld64(s50 + 0x10)
	}
	if (f != 0) {
		let q = d + 0x21
		let r = p * 0x22 + i + 0x20
		do {
			const w = ld64(q - 0x21)
			const v = ld64(q - 0x19)
			const u = ld64(q - 0x11)
			const t = ld64(q - 9)
			const s = ld8(q)
			st8(r, ld8(q - 1))
			st8(r + 1, s)
			st64(r - 8, t)
			st64(r - 0x10, u)
			st64(r - 0x18, v)
			st64(r - 0x20, w)
			r = r + 0x22
			q = q + 0x22
			p = p + 1
			f = f - 1
		} while (f != 0)
	}
	st64(s50 + 0x10, p)
	const x = __rust_alloc(0x400, 1)
	let y = x
	if (x == 0) {
		raw_vec_handle_error(1, 0x400, 0x100160c50)
	}
	st8(y, 0x21)
	st64(s38, 0x400, y, 1)
	BorshSerialize_try_to_vec(s20, c)
	const z = ld64(s20)
	if (z == 0x8000000000000000) {
		st64(s8, ld64(s20 + 8))
		fn_14ed60(0x10015bcb5 /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s8, 0x100160c68, 0x100160d60)
	}
	let ac = 1
	const ab = ld64(s20 + 8)
	const aa = ld64(s20 + 0x10)
	if (aa >= 0x400) {
		reserve_do_reserve_and_handle_12f548(s38, 1, aa, 1, 1)
		y = ld64(s38 + 8)
		ac = ld64(s38 + 0x10)
	}
	let ad = memcpy(y + ac, ab, aa)
	st64(s38 + 0x10, ac + aa)
	st64(a + 0x10, ld64(s50 + 0x10))
	st64(a + 8, ld64(s50 + 8))
	st64(a, ld64(s50))
	copy(a + 0x18, s38, 0x18)
	st64(a + 0x48, 0x4629f803bcd1b649 /* TOKEN_METADATA_PROGRAM[3] */)
	st64(a + 0x40, 0xb5fda01a736cb858 /* TOKEN_METADATA_PROGRAM[2] */)
	st64(a + 0x38, 0xcdc3046b7f529d38 /* TOKEN_METADATA_PROGRAM[1] */)
	st64(a + 0x30, 0x457cd1e3b165700b /* TOKEN_METADATA_PROGRAM */)
	if (z != 0) {
		ad = fn_11e480(ad)
	}
	if (ld64(c) != 0) {
		void ld64(c + 8)
		ad = fn_11e480(ad)
	}
	if (ld64(c + 0x18) != 0) {
		void ld64(c + 0x20)
		ad = fn_11e480(ad)
	}
	if (ld64(c + 0x30) != 0) {
		void ld64(c + 0x38)
		ad = fn_11e480(ad)
	}
	if ((ld64(c + 0x48) | 0x8000000000000000) != 0x8000000000000000) {
		void ld64(c + 0x50)
		fn_11e480(ad)
	}
}

export function fn_134048(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64) {
	const s20 = fp - 0x20, s47 = fp - 0x47, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s80 = fp - 0x80, s88 = fp - 0x88
	let k = ld64(s88)
	let l = ld64(s80)
	let m = ld64(s78)
	let n = ld64(s70)
	const f = memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20)
	const g = p6
	const h = p5
	if ((f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	let i = 0
	if (h != 0) {
		n = ld64(h + 0x18)
		m = ld64(h + 0x10)
		l = ld64(h + 8)
		k = ld64(h)
		i = 1
	}
	st8(s50 + 8, g)
	copy(s47, d, 0x20)
	st32(s47 + 0x23, i)
	st64(s20, k, l, m, n)
	st32(s50, 0x14)
	fn_1334b0(s68, s50)
	const j = __rust_alloc(0x22, 1)
	if (j == 0) {
		alloc_handle_alloc_error(1, 0x22)
	}
	st64(j + 0x18, ld64(c + 0x18))
	st64(j + 0x10, ld64(c + 0x10))
	st64(j + 8, ld64(c + 8))
	st64(j, ld64(c))
	st16(j + 0x20, 0x100)
	st64(a + 0x48, ld64(b + 0x18))
	st64(a + 0x40, ld64(b + 0x10))
	st64(a + 0x38, ld64(b + 8))
	st64(a + 0x30, ld64(b))
	copy(a + 0x18, s68, 0x18)
	st64(a + 8, j, 1)
	st64(a, 1)
}

export function fn_134398(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s48 = fp - 0x48, s50 = fp - 0x50, s68 = fp - 0x68
	if ((memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	copyr(s48, e, 0x20)
	st32(s50, 0x12)
	fn_1334b0(s68, s50)
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

export function fn_134cb8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s50 = fp - 0x50, s70 = fp - 0x70, s88 = fp - 0x88, sa0 = fp - 0xa0, sb0 = fp - 0xb0
	let l, m: u64
	const f = memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20)
	const g = p8
	const i = p7
	let n = p6
	const h = p5
	if ((f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	st64(s50 + 8, g)
	st32(s50, 7)
	fn_1334b0(sa0, s50)
	if (i > i + 3) {
		fn_154730(0x100160e80)
	}
	__multi3_159030(sb0, i + 3, 0, 0x22, 0)
	const j = ld64(sb0)
	if (ld64(sb0 + 8) != 0) {
		raw_vec_handle_error(0, j, 0x100160e98, l, m)
	}
	if (0 > (j as i64)) {
		raw_vec_handle_error(0, j, 0x100160e98, l, m)
	}
	let k = __rust_alloc(j, 1)
	if (k == 0) {
		raw_vec_handle_error(1, j, 0x100160e98, l, m)
	}
	st64(s88, i + 3, k)
	st64(k + 0x18, ld64(c + 0x18))
	st64(k + 0x10, ld64(c + 0x10))
	st64(k + 8, ld64(c + 8))
	st64(k, ld64(c))
	st16(k + 0x20, 0x100)
	copy(k + 0x22, d, 0x20)
	st16(k + 0x42, 0x100)
	st64(s88 + 0x10, 2)
	if (i == -1) {
		RawVec_grow_one_131c60(s88, 0x100160eb0, undef, l, m)
		k = ld64(s88 + 8)
	}
	st64(k + 0x5c, ld64(h + 0x18))
	st64(k + 0x54, ld64(h + 0x10))
	st64(k + 0x4c, ld64(h + 8))
	st64(k + 0x44, ld64(h))
	st8(k + 0x64, i == 0, 0)
	st64(s88 + 0x10, 3)
	let t = b
	if (i != 0) {
		let q = 3
		let o = 0
		let r = i << 3
		do {
			const s = ld64(n)
			copyr(s70, s, 0x20)
			if (q == ld64(s88)) {
				RawVec_grow_one_131c60(s88, 0x100160ec8, t, l, m)
				t = b
				k = ld64(s88 + 8)
			}
			n = n + 8
			const p = k + o
			st64(p + 0x7e, ld64(s70 + 0x18))
			st64(p + 0x76, ld64(s70 + 0x10))
			st64(p + 0x6e, ld64(s70 + 8))
			st64(p + 0x66, ld64(s70))
			st16(p + 0x86, 1)
			o = o + 0x22
			q = q + 1
			st64(s88 + 0x10, q)
			r = r - 8
		} while (r != 0)
	}
	copyr(s20, t, 0x20)
	copy(s50, s88, 0x18)
	copy(s38, sa0, 0x18)
	memcpy(a, s50, 0x50)
}

export function fn_1352e0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s50 = fp - 0x50, s70 = fp - 0x70, s88 = fp - 0x88, sa0 = fp - 0xa0, sb0 = fp - 0xb0
	let l, m: u64
	const f = memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20)
	const g = p8
	const i = p7
	let n = p6
	const h = p5
	if ((f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	st64(s50 + 8, g)
	st32(s50, 8)
	fn_1334b0(sa0, s50)
	if (i > i + 3) {
		fn_154730(0x100160ee0)
	}
	__multi3_159030(sb0, i + 3, 0, 0x22, 0)
	const j = ld64(sb0)
	if (ld64(sb0 + 8) != 0) {
		raw_vec_handle_error(0, j, 0x100160ef8, l, m)
	}
	if (0 > (j as i64)) {
		raw_vec_handle_error(0, j, 0x100160ef8, l, m)
	}
	let k = __rust_alloc(j, 1)
	if (k == 0) {
		raw_vec_handle_error(1, j, 0x100160ef8, l, m)
	}
	st64(s88, i + 3, k)
	st64(k + 0x18, ld64(c + 0x18))
	st64(k + 0x10, ld64(c + 0x10))
	st64(k + 8, ld64(c + 8))
	st64(k, ld64(c))
	st16(k + 0x20, 0x100)
	copy(k + 0x22, d, 0x20)
	st16(k + 0x42, 0x100)
	st64(s88 + 0x10, 2)
	if (i == -1) {
		RawVec_grow_one_131c60(s88, 0x100160f10, undef, l, m)
		k = ld64(s88 + 8)
	}
	st64(k + 0x5c, ld64(h + 0x18))
	st64(k + 0x54, ld64(h + 0x10))
	st64(k + 0x4c, ld64(h + 8))
	st64(k + 0x44, ld64(h))
	st8(k + 0x64, i == 0, 0)
	st64(s88 + 0x10, 3)
	let t = b
	if (i != 0) {
		let q = 3
		let o = 0
		let r = i << 3
		do {
			const s = ld64(n)
			copyr(s70, s, 0x20)
			if (q == ld64(s88)) {
				RawVec_grow_one_131c60(s88, 0x100160f28, t, l, m)
				t = b
				k = ld64(s88 + 8)
			}
			n = n + 8
			const p = k + o
			st64(p + 0x7e, ld64(s70 + 0x18))
			st64(p + 0x76, ld64(s70 + 0x10))
			st64(p + 0x6e, ld64(s70 + 8))
			st64(p + 0x66, ld64(s70))
			st16(p + 0x86, 1)
			o = o + 0x22
			q = q + 1
			st64(s88 + 0x10, q)
			r = r - 8
		} while (r != 0)
	}
	copyr(s20, t, 0x20)
	copy(s50, s88, 0x18)
	copy(s38, sa0, 0x18)
	memcpy(a, s50, 0x50)
}

export function fn_135908(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s50 = fp - 0x50, s70 = fp - 0x70, s88 = fp - 0x88, sa0 = fp - 0xa0, sb0 = fp - 0xb0
	let k, l: u64
	const f = memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20)
	const h = p7
	let m = p6
	const g = p5
	if ((f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	fn_1334b0(sa0, 0x10015be48)
	if (h > h + 3) {
		fn_154730(0x100160f40)
	}
	__multi3_159030(sb0, h + 3, 0, 0x22, 0)
	const i = ld64(sb0)
	if (ld64(sb0 + 8) != 0) {
		raw_vec_handle_error(0, i, 0x100160f58, k, l)
	}
	if (0 > (i as i64)) {
		raw_vec_handle_error(0, i, 0x100160f58, k, l)
	}
	let j = __rust_alloc(i, 1)
	if (j == 0) {
		raw_vec_handle_error(1, i, 0x100160f58, k, l)
	}
	st64(s88, h + 3, j)
	st64(j + 0x18, ld64(c + 0x18))
	st64(j + 0x10, ld64(c + 0x10))
	st64(j + 8, ld64(c + 8))
	st64(j, ld64(c))
	st16(j + 0x20, 0x100)
	copy(j + 0x22, d, 0x20)
	st16(j + 0x42, 0x100)
	st64(s88 + 0x10, 2)
	if (h == -1) {
		RawVec_grow_one_131c60(s88, 0x100160f70, undef, k, l)
		j = ld64(s88 + 8)
	}
	st64(j + 0x5c, ld64(g + 0x18))
	st64(j + 0x54, ld64(g + 0x10))
	st64(j + 0x4c, ld64(g + 8))
	st64(j + 0x44, ld64(g))
	st8(j + 0x64, h == 0, 0)
	st64(s88 + 0x10, 3)
	let s = b
	if (h != 0) {
		let p = 3
		let n = 0
		let q = h << 3
		do {
			const r = ld64(m)
			copyr(s70, r, 0x20)
			if (p == ld64(s88)) {
				RawVec_grow_one_131c60(s88, 0x100160f88, s, k, l)
				s = b
				j = ld64(s88 + 8)
			}
			m = m + 8
			const o = j + n
			st64(o + 0x7e, ld64(s70 + 0x18))
			st64(o + 0x76, ld64(s70 + 0x10))
			st64(o + 0x6e, ld64(s70 + 8))
			st64(o + 0x66, ld64(s70))
			st16(o + 0x86, 1)
			n = n + 0x22
			p = p + 1
			st64(s88 + 0x10, p)
			q = q - 8
		} while (q != 0)
	}
	copyr(s20, s, 0x20)
	copy(s50, s88, 0x18)
	copy(s38, sa0, 0x18)
	memcpy(a, s50, 0x50)
}

export function fn_135f10(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s50 = fp - 0x50, s70 = fp - 0x70, s88 = fp - 0x88, sa0 = fp - 0xa0, sb0 = fp - 0xb0
	let k, l: u64
	const f = memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20)
	const h = p7
	let m = p6
	const g = p5
	if ((f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	fn_1334b0(sa0, 0x10015be98)
	if (h > h + 3) {
		fn_154730(0x100160fa0)
	}
	__multi3_159030(sb0, h + 3, 0, 0x22, 0)
	const i = ld64(sb0)
	if (ld64(sb0 + 8) != 0) {
		raw_vec_handle_error(0, i, 0x100160fb8, k, l)
	}
	if (0 > (i as i64)) {
		raw_vec_handle_error(0, i, 0x100160fb8, k, l)
	}
	let j = __rust_alloc(i, 1)
	if (j == 0) {
		raw_vec_handle_error(1, i, 0x100160fb8, k, l)
	}
	st64(s88, h + 3, j)
	st64(j + 0x18, ld64(c + 0x18))
	st64(j + 0x10, ld64(c + 0x10))
	st64(j + 8, ld64(c + 8))
	st64(j, ld64(c))
	st16(j + 0x20, 0x100)
	copy(j + 0x22, d, 0x20)
	st16(j + 0x42, 0)
	st64(s88 + 0x10, 2)
	if (h == -1) {
		RawVec_grow_one_131c60(s88, 0x100160fd0, undef, k, l)
		j = ld64(s88 + 8)
	}
	st64(j + 0x5c, ld64(g + 0x18))
	st64(j + 0x54, ld64(g + 0x10))
	st64(j + 0x4c, ld64(g + 8))
	st64(j + 0x44, ld64(g))
	st8(j + 0x64, h == 0, 0)
	st64(s88 + 0x10, 3)
	let s = b
	if (h != 0) {
		let p = 3
		let n = 0
		let q = h << 3
		do {
			const r = ld64(m)
			copyr(s70, r, 0x20)
			if (p == ld64(s88)) {
				RawVec_grow_one_131c60(s88, 0x100160fe8, s, k, l)
				s = b
				j = ld64(s88 + 8)
			}
			m = m + 8
			const o = j + n
			st64(o + 0x7e, ld64(s70 + 0x18))
			st64(o + 0x76, ld64(s70 + 0x10))
			st64(o + 0x6e, ld64(s70 + 8))
			st64(o + 0x66, ld64(s70))
			st16(o + 0x86, 1)
			n = n + 0x22
			p = p + 1
			st64(s88 + 0x10, p)
			q = q - 8
		} while (q != 0)
	}
	copyr(s20, s, 0x20)
	copy(s50, s88, 0x18)
	copy(s38, sa0, 0x18)
	memcpy(a, s50, 0x50)
}

export function fn_136518(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s50 = fp - 0x50, s70 = fp - 0x70, s88 = fp - 0x88, sa0 = fp - 0xa0, sb0 = fp - 0xb0
	let k, l: u64
	const f = memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20)
	const h = p7
	let m = p6
	const g = p5
	if ((f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	fn_1334b0(sa0, 0x10015bee8)
	if (h > h + 3) {
		fn_154730(0x100161000)
	}
	__multi3_159030(sb0, h + 3, 0, 0x22, 0)
	const i = ld64(sb0)
	if (ld64(sb0 + 8) != 0) {
		raw_vec_handle_error(0, i, 0x100161018, k, l)
	}
	if (0 > (i as i64)) {
		raw_vec_handle_error(0, i, 0x100161018, k, l)
	}
	let j = __rust_alloc(i, 1)
	if (j == 0) {
		raw_vec_handle_error(1, i, 0x100161018, k, l)
	}
	st64(s88, h + 3, j)
	st64(j + 0x18, ld64(c + 0x18))
	st64(j + 0x10, ld64(c + 0x10))
	st64(j + 8, ld64(c + 8))
	st64(j, ld64(c))
	st16(j + 0x20, 0x100)
	copy(j + 0x22, d, 0x20)
	st16(j + 0x42, 0)
	st64(s88 + 0x10, 2)
	if (h == -1) {
		RawVec_grow_one_131c60(s88, 0x100161030, undef, k, l)
		j = ld64(s88 + 8)
	}
	st64(j + 0x5c, ld64(g + 0x18))
	st64(j + 0x54, ld64(g + 0x10))
	st64(j + 0x4c, ld64(g + 8))
	st64(j + 0x44, ld64(g))
	st8(j + 0x64, h == 0, 0)
	st64(s88 + 0x10, 3)
	let s = b
	if (h != 0) {
		let p = 3
		let n = 0
		let q = h << 3
		do {
			const r = ld64(m)
			copyr(s70, r, 0x20)
			if (p == ld64(s88)) {
				RawVec_grow_one_131c60(s88, 0x100161048, s, k, l)
				s = b
				j = ld64(s88 + 8)
			}
			m = m + 8
			const o = j + n
			st64(o + 0x7e, ld64(s70 + 0x18))
			st64(o + 0x76, ld64(s70 + 0x10))
			st64(o + 0x6e, ld64(s70 + 8))
			st64(o + 0x66, ld64(s70))
			st16(o + 0x86, 1)
			n = n + 0x22
			p = p + 1
			st64(s88 + 0x10, p)
			q = q - 8
		} while (q != 0)
	}
	copyr(s20, s, 0x20)
	copy(s50, s88, 0x18)
	copy(s38, sa0, 0x18)
	memcpy(a, s50, 0x50)
}

export function fn_136b20(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s50 = fp - 0x50, s70 = fp - 0x70, s88 = fp - 0x88, sa0 = fp - 0xa0, sb0 = fp - 0xb0
	let l, m: u64
	const f = memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20)
	const h = p10
	const g = p9
	const i = p8
	let n = p7
	const u = p6
	const v = p5
	if ((f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	st8(s50 + 0x10, h)
	st64(s50 + 8, g)
	st32(s50, 0xc)
	fn_1334b0(sa0, s50)
	if (i > i + 4) {
		fn_154730(0x100161060)
	}
	__multi3_159030(sb0, i + 4, 0, 0x22, 0)
	const j = ld64(sb0)
	if (ld64(sb0 + 8) != 0) {
		raw_vec_handle_error(0, j, 0x100161078, l, m)
	}
	if (0 > (j as i64)) {
		raw_vec_handle_error(0, j, 0x100161078, l, m)
	}
	let k = __rust_alloc(j, 1)
	if (k == 0) {
		raw_vec_handle_error(1, j, 0x100161078, l, m)
	}
	st64(s88, i + 4, k)
	st64(k + 0x18, ld64(c + 0x18))
	st64(k + 0x10, ld64(c + 0x10))
	st64(k + 8, ld64(c + 8))
	st64(k, ld64(c))
	st16(k + 0x20, 0x100)
	copy(k + 0x22, d, 0x20)
	st16(k + 0x42, 0)
	copy(k + 0x44, v, 0x20)
	st16(k + 0x64, 0x100)
	st64(s88 + 0x10, 3)
	if (i == -1) {
		RawVec_grow_one_131c60(s88, 0x100161090, undef, l, m)
		k = ld64(s88 + 8)
	}
	st64(k + 0x7e, ld64(u + 0x18))
	st64(k + 0x76, ld64(u + 0x10))
	st64(k + 0x6e, ld64(u + 8))
	st64(k + 0x66, ld64(u))
	st8(k + 0x86, i == 0, 0)
	st64(s88 + 0x10, 4)
	let t = b
	if (i != 0) {
		let q = 4
		let o = 0
		let r = i << 3
		do {
			const s = ld64(n)
			copyr(s70, s, 0x20)
			if (q == ld64(s88)) {
				RawVec_grow_one_131c60(s88, 0x1001610a8, t, l, m)
				t = b
				k = ld64(s88 + 8)
			}
			n = n + 8
			const p = k + o
			st64(p + 0xa0, ld64(s70 + 0x18))
			st64(p + 0x98, ld64(s70 + 0x10))
			st64(p + 0x90, ld64(s70 + 8))
			st64(p + 0x88, ld64(s70))
			st16(p + 0xa8, 1)
			o = o + 0x22
			q = q + 1
			st64(s88 + 0x10, q)
			r = r - 8
		} while (r != 0)
	}
	copyr(s20, t, 0x20)
	copy(s50, s88, 0x18)
	copy(s38, sa0, 0x18)
	memcpy(a, s50, 0x50)
}

export function fn_137788(a: u64, b: u64, c: u64) {
	if ((memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
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
	fn_1334b0(a + 0x18, 0x10015bf38)
	st64(a + 0x48, ld64(b + 0x18))
	st64(a + 0x40, ld64(b + 0x10))
	st64(a + 0x38, ld64(b + 8))
	st64(a + 0x30, ld64(b))
	st64(a + 8, f, 1)
	st64(a, 1)
}

export function fn_138c80(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s50 = fp - 0x50, s70 = fp - 0x70, s88 = fp - 0x88, sa0 = fp - 0xa0, sb0 = fp - 0xb0
	let i, j, k: u64
	if ((memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
	} else {
		const f = p7
		let l = p6
		const r = p5
		st64(s50 + 8, p8)
		st32(s50, 3)
		TokenInstruction_pack(sa0, s50)
		if (f > f + 3) {
			fn_154730(0x100161138)
		}
		__multi3_159030(sb0, f + 3, 0, 0x22, 0)
		const g = ld64(sb0)
		if (ld64(sb0 + 8) != 0) {
			raw_vec_handle_error(0, g, 0x100161150, i, j)
		}
		if (0 > (g as i64)) {
			raw_vec_handle_error(0, g, 0x100161150, i, j)
		}
		let h = __rust_alloc(g, 1)
		if (h == 0) {
			raw_vec_handle_error(1, g, 0x100161150, i, j)
		}
		st64(s88, f + 3, h)
		st64(h + 0x18, ld64(c + 0x18))
		st64(h + 0x10, ld64(c + 0x10))
		st64(h + 8, ld64(c + 8))
		st64(h, ld64(c))
		st16(h + 0x20, 0x100)
		copy(h + 0x22, d, 0x20)
		st16(h + 0x42, 0x100)
		st64(s88 + 0x10, 2)
		if (f == -1) {
			RawVec_grow_one_138250(s88, 0x100161168, k, i, j)
			h = ld64(s88 + 8)
		}
		st64(h + 0x5c, ld64(r + 0x18))
		st64(h + 0x54, ld64(r + 0x10))
		st64(h + 0x4c, ld64(r + 8))
		st64(h + 0x44, ld64(r))
		st8(h + 0x64, f == 0, 0)
		st64(s88 + 0x10, 3)
		if (f != 0) {
			let o = 3
			let m = 0
			let p = f << 3
			do {
				const q = ld64(l)
				copyr(s70, q, 0x20)
				if (o == ld64(s88)) {
					RawVec_grow_one_138250(s88, 0x100161180, k, i, j)
					h = ld64(s88 + 8)
				}
				l = l + 8
				const n = h + m
				st64(n + 0x7e, ld64(s70 + 0x18))
				st64(n + 0x76, ld64(s70 + 0x10))
				st64(n + 0x6e, ld64(s70 + 8))
				st64(n + 0x66, ld64(s70))
				st16(n + 0x86, 1)
				m = m + 0x22
				o = o + 1
				st64(s88 + 0x10, o)
				p = p - 8
			} while (p != 0)
		}
		copyr(s20, b, 0x20)
		copy(s50, s88, 0x18)
		copy(s38, sa0, 0x18)
		memcpy(a, s50, 0x50)
	}
}

export function fn_13c7e0(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s1000 = fp - 0x1000
	st64(s1000, e, 0)
	instruction_build_associated_token_account_instruction(a, b, c, d, fp)
}

export function fn_13c808(a: u64, b: u64, c: u64, d: u64) {
	const f = ld64(b)
	const g = f > f + d
	if ((g & 1) != 0) {
		fn_154730(0x100161290, b, f + d, d, g & 1)
	}
	st64(b, f + d)
	st64(a + 8, d)
	st64(a, 0)
}

export function fn_13ca70(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return str_fmt_152a30(ld64(a), ld64(a + 8), b, d, e)
}

export function fn_13ca98(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, 0x1001613a8, b, d, e)
}

export function fn_13cac0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, b, c, d, e)
}

export function fn_13cb30(a: u64) {
	st64(a, 0)
}

export function fn_13cb40() {
}

export function fn_13d588(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return str_fmt_152a30(ld64(a + 8), ld64(a + 0x10), b, d, e)
}

export function fn_13dea0(a: u64, b: AccountInfo) {
	const f = __rust_alloc(0x30, 8)
	if (f == 0) {
		alloc_handle_alloc_error(8, 0x30)
	}
	const g: LamportsCell = b.lamports
	const m = b.key
	rc_inc(g)
	const h: DataCell = b.data
	rc_inc(h)
	const l = b.owner
	const k = b.rent_epoch
	const j = b.is_signer
	const i = b.is_writable
	st8(f + 0x2a, b.executable)
	st8(f + 0x29, i)
	st8(f + 0x28, j)
	st64(f + 0x20, k)
	st64(f + 0x18, l)
	st64(f + 0x10, h)
	st64(f + 8, g)
	st64(f, m)
	st64(a + 8, f, 1)
	st64(a, 1)
}

export function fn_143038(a: u64, b: u64) {
	const s18 = fp - 0x18, s28 = fp - 0x28
	let p, q, r, am, aw, ax, ay, az: u64
	let f = b
	const g = ld64(b)
	__multi3_159030(s28, g, 0, 0x30, 0)
	let o = undef
	let m = undef
	const h = ld64(s28)
	if (ld64(s28 + 8) != 0) {
		raw_vec_handle_error(0, h, 0x100161ca8, am, m)
	}
	if (h > 0x7ffffffffffffff8) {
		raw_vec_handle_error(0, h, 0x100161ca8, am, m)
	}
	let s = 8
	let j = 0
	let i = 8
	if (h != 0) {
		i = __rust_alloc(h, 8)
		o = undef
		m = undef
		if (i == 0) {
			raw_vec_handle_error(8, h, 0x100161ca8, am, m)
		}
		j = g
		s = 8
	}
	st64(s18, j, i, 0)
	if (g != 0) {
		m = 0
		let l = 0
		const at = f
		do {
			const t = s
			if (s == -1) {
				fn_154730(0x100161cc0, t + 1, o, s, m)
			}
			B9: {
				const u = ld8(f + s)
				if (u == 0xff) {
					if (t == -2) {
						fn_154730(0x100161b88, t + 1, t == -2, s, m)
					}
					const au = l
					if (t == -3) {
						fn_154730(0x100161ba0, t + 1, t + 3, t == -3, m)
					}
					if (t == -4) {
						fn_154730(0x100161bb8, t + 1, t + 3, t == -4, m)
					}
					const y = t + 4 > t + 8
					if (y != 0) {
						fn_154730(0x100161bd0, t + 1, t + 3, y, m)
					}
					const z = t + 8 > t + 0x28
					if (z != 0) {
						fn_154730(0x100161be8, t + 1, t + 3, z, m)
					}
					const av = m
					const aa = t + 0x28 > t + 0x48
					if (aa != 0) {
						fn_154730(0x100161c00, t + 1, t + 3, aa, m)
					}
					aw = ld8(f + (t + 1))
					az = ld8(f + (t + 2))
					ax = ld8(f + (t + 3))
					const ab = __rust_alloc(0x20, 8)
					if (ab == 0) {
						alloc_handle_alloc_error(8, 0x20)
					}
					const ac = f + (t + 0x48)
					st64(ab + 0x18, ac)
					st64(ab + 0x10, 0)
					st64(ab + 8, 1)
					st64(ab, 1)
					const ad = t + 0x48 > t + 0x50
					if (ad != 0) {
						fn_154730(0x100161c18, ad, ac)
					}
					ay = ab
					const ae = t + 0x50 > t + 0x58
					if (ae != 0) {
						fn_154730(0x100161c30, ae, ac)
					}
					const af = ld64(f + (t + 0x50))
					st32(f + (t + 4), af)
					const ag = __rust_alloc(0x28, 8)
					q = ag
					if (ag == 0) {
						alloc_handle_alloc_error(8, 0x28)
					}
					m = av
					const ai = af > af + 0x2800
					const ah = f + (t + 0x58)
					st64(q + 0x20, af)
					st64(q + 0x18, ah)
					st64(q + 0x10, 0)
					st64(q + 8, 1)
					st64(q, 1)
					if ((ai & 1) != 0) {
						fn_154730(0x100161c48, ai & 1, ah, undef, m)
					}
					const aj = t + 0x58 + (af + 0x2800)
					l = au
					if (t + 0x58 > aj) {
						fn_154730(0x100161c60, aj, ah, undef, m)
					}
					const ak = aj + 7 & -8
					if (aj > ak) {
						fn_154730(0x100161c78, aj, aj > ak, undef, m)
					}
					s = ak + 8
					const al = ak > s
					if ((al & 1) != 0) {
						fn_154730(0x100161c90, al & 1, aj > ak, s, m)
					}
					az = az != 0
					ax = ax != 0
					let k = t + 0x28
					o = aw != 0
					aw = ld64(f + ak)
					if (l == ld64(s18)) {
						RawVec_grow_one_142e88(s18, 0x100161d20, o, s, m)
						k = t + 0x28
						m = av
					}
					r = f + (t + 8)
					p = f + k
				} else {
					s = t + 8
					const v = t + 1 > s
					if ((v & 1) != 0) {
						fn_154730(0x100161cd8, t + 1, v & 1, s, m)
					}
					if (u >= l) {
						fn_14ec98(u, l, 0x100161cf0, s, m)
					}
					const w: AccountInfo = i + u * 0x30
					const x: LamportsCell = w.lamports
					r = w.key
					rc_inc(x)
					ay = x
					q = w.data
					rc_inc(q)
					ax = w.executable
					az = w.is_writable
					o = w.is_signer
					aw = w.rent_epoch
					p = w.owner
					if (l != ld64(s18)) {
						break B9
					}
					RawVec_grow_one_142e88(s18, 0x100161d08, o, s, m)
				}
				i = ld64(s18 + 8)
			}
			l = l + 1
			const n = i + m
			st8(n + 0x2a, ax)
			st8(n + 0x29, az)
			st8(n + 0x28, o)
			st64(n + 0x20, aw)
			st64(n + 0x18, p)
			st64(n + 0x10, q)
			st64(n + 8, ay)
			st64(n, r)
			st64(s18 + 0x10, l)
			m = m + 0x30
			f = at
		} while (g > l)
	}
	const an = s
	const ao = s > s + 8
	if ((ao & 1) != 0) {
		fn_154730(0x100161b58, ao & 1, o, s, m)
	}
	const ap = ld64(f + s)
	const aq = an + 8 + ap
	const ar = an + 8 > aq
	if ((ar & 1) != 0) {
		fn_154730(0x100161b70, aq, ap, ar & 1, m)
	}
	st64(a + 0x10, ld64(s18 + 0x10))
	st64(a + 8, ld64(s18 + 8))
	st64(a, ld64(s18))
	st64(a + 0x28, ap)
	st64(a + 0x20, f + (an + 8))
	st64(a + 0x18, f + aq)
}

export function fn_146260(a: u64, b: u64): u64 {
	return fn_14c068(ld64(a), b)
}

export function fn_146da0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64) {
	const s40 = fp - 0x40, s60 = fp - 0x60, s68 = fp - 0x68, s80 = fp - 0x80
	const f = __rust_alloc(0x44, 1)
	if (f == 0) {
		alloc_handle_alloc_error(1, 0x44)
	}
	const h = p6
	const g = p5
	st64(f + 0x18, ld64(b + 0x18))
	st64(f + 0x10, ld64(b + 0x10))
	st64(f + 8, ld64(b + 8))
	st64(f, ld64(b))
	st16(f + 0x20, 0x101)
	copy(f + 0x22, c, 0x20)
	st16(f + 0x42, 0x101)
	st64(s80, 2, f, 2)
	st64(s40, d, g)
	copy(s60, h, 0x20)
	st64(s68, 0x8000000000000000)
	fn_1442d0(a, 0x100159560, s68, s80)
}

export function fn_147308(a: u64, b: u64, c: u64) {
	const s60 = fp - 0x60, s68 = fp - 0x68, s80 = fp - 0x80
	const f = __rust_alloc(0x22, 1)
	if (f == 0) {
		alloc_handle_alloc_error(1, 0x22)
	}
	st64(f + 0x18, ld64(b + 0x18))
	st64(f + 0x10, ld64(b + 0x10))
	st64(f + 8, ld64(b + 8))
	st64(f, ld64(b))
	st16(f + 0x20, 0x101)
	st64(s80, 1, f, 1)
	copyr(s60, c, 0x20)
	st64(s68, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
	fn_1442d0(a, 0x100159560, s68, s80)
}

export function fn_147458(a: u64, b: u64, c: u64, d: u64) {
	const s68 = fp - 0x68, s80 = fp - 0x80
	const f = __rust_alloc(0x44, 1)
	if (f == 0) {
		alloc_handle_alloc_error(1, 0x44)
	}
	st64(f + 0x18, ld64(b + 0x18))
	st64(f + 0x10, ld64(b + 0x10))
	st64(f + 8, ld64(b + 8))
	st64(f, ld64(b))
	st16(f + 0x20, 0x101)
	copy(f + 0x22, c, 0x20)
	st16(f + 0x42, 0x100)
	st64(s80, 2, f, 2, 0x8000000000000002 /* Err(ProgramError::InvalidInstructionData) */, d)
	fn_1442d0(a, 0x100159560, s68, s80)
}

export function fn_1475c0(a: u64, b: u64, c: u64) {
	const s68 = fp - 0x68, s80 = fp - 0x80
	const f = __rust_alloc(0x22, 1)
	if (f == 0) {
		alloc_handle_alloc_error(1, 0x22)
	}
	st64(f + 0x18, ld64(b + 0x18))
	st64(f + 0x10, ld64(b + 0x10))
	st64(f + 8, ld64(b + 8))
	st64(f, ld64(b))
	st16(f + 0x20, 0x101)
	st64(s80, 1, f, 1, 0x8000000000000008 /* Err(ProgramError::AccountAlreadyInitialized) */, c)
	fn_1442d0(a, 0x100159560, s68, s80)
}

export function fn_147a10(a: u64): u64 {
	return rent_check_id(a)
}

export function fn_147b68(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const f = ld64(a + 0x10)
	const g = ld64(f + 0x10)
	if (g > 0x7ffffffffffffffe) {
		fn_14e808(0x100161f10, g, 0x7ffffffffffffffe, d, e)
	}
	return ld64(f + 0x20) == 0
}

export function fn_147f30(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fn_154c08(ld64(a), b, c, d, e)
}

export function fn_149018(a: u64): u64 {
	const f = __rust_alloc(0x18, 8)
	if (f == 0) {
		alloc_handle_alloc_error(8, 0x18)
	}
	st64(f + 8, a)
	st64(f, 0x8000000000000000)
	return f
}

export function fn_1494a8(a: u64): u64 {
	return sol_log_pubkey(a)
}

export function fn_14b810(a: u64) {
	st64(a, 0)
}

export function fn_14b820() {
}

export function fn_14baf0(a: u64, r0: u64): u64 {
	const f = fn_14e4b8(r0)
	return ptr_drop_in_place_14d748(a, f)
}

export function fn_14bb18(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return str_fmt_1520d8(ld64(a + 8), ld64(a + 0x10), b, d, e)
}

export function fn_14bb40(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return str_fmt_152a30(ld64(a + 8), ld64(a + 0x10), b, d, e)
}

export function fn_14c068(a: u64, b: u64): u64 {
	return error_fmt(a, b)
}

export function fn_14cdf8(): never {
	abort_()
}

export function log(a: u64, b: u64) {
	sol_log(a, b)
}

export function abort_(): never {
	abort()
}

export function fn_14d4d0(): never {
	log("Error: memory allocation failed, out of memory", 0x2e)
	fn_14cdf8()
}

export function fn_14d4f8(): never {
	fn_14d4d0()
}

export function fn_14d5b0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return str_fmt_1520d8(ld64(a), ld64(a + 8), b, d, e)
}

export function fn_14d5d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, 0x1001621f8, b, d, e)
}

export function fn_14d660(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x100162228, 1, 8, 0, 0)
	// fmt "capacity overflow"
	fn_14ec00(s30, a, c, d, e)
}

export function fn_14dd98(a: u64, b: u64) {
	st64(a + 8, ld64(b + 0x10))
	st64(a, ld64(b + 8))
}

export function fn_14ddc0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return str_fmt_152a30(ld64(a + 8), ld64(a + 0x10), b, d, e)
}

export function fn_14dde8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return str_fmt_1520d8(ld64(a + 8), ld64(a + 0x10), b, d, e)
}

export function fn_14e060(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return Vec_clone(a, b, c, d, e)
}

export function fn_14e4b8(r0: u64): u64 {
	return r0
}

export function fn_14e968(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s10 = fp - 0x10, s40 = fp - 0x40, s50 = fp - 0x50
	st64(s50, a, b, 0x10015a580)
	st64(s40 + 0x10, s10)
	st64(s10, s50, T_fmt_155a38)
	st64(s40 + 0x20, 0)
	st64(s40 + 8, 1)
	st64(s40 + 0x18, 1)
	fn_14ec00(s40, c, c, d, e)
}

export function fn_14f298(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	DebugStruct_field_with(a, b, c, d, e)
	return a
}

export function fn_14f750(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	DebugTuple_field_with(a, b, c, d, e)
	return a
}

export function fn_150da0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, 0x1001623b0, b, d, e)
}

export function fn_153680(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	str_slice_error_fail_rt(a, b, c, d, e)
}

export function fn_153e20(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	let m, u: u64
	B11: {
		u = ld64(e - 0xff0)
		m = ld64(e - 0xff8)
		if (c != 0) {
			const v = b + (c << 1)
			let f = ld64(e - 0x1000)
			const j = (a & 0xff00) >> 8
			let g = 0
			const t = d
			const s = f
			L2: while (true) {
				let h = ld8(b + 1)
				e = g + h
				const i = ld8(b)
				b = b + 2
				if (i == j) {
					if (g > e) {
						fn_153160(g, e, 0x100162540, d, e)
					}
					if (e > f) {
						fn_153158(e, f, 0x100162540, d, e)
					}
					let k = d + g
					while (true) {
						if (h == 0) {
							g = e
							d = t
							f = s
							if (b == v) {
								break B11
							}
							continue L2
						}
						h = h - 1
						const l = ld8(k)
						k = k + 1
						if (l == (a as u8)) {
							return 0
						}
					}
				}
				if (i > j) {
					break
				}
				g = e
				if (b == v) {
					break
				}
			}
		}
	}
	let r = 1
	if (u == 0) {
		return 1
	}
	const n = m
	let q = a as u16
	while (true) {
		const o = m
		let p = ld8(m) as i8
		if (0 > (p as i64)) {
			if (o + 1 == n + u) {
				fn_14e940(0x100162528, n + u, p, o + 1, e)
			}
			p = ((p & 0x7f) << 8) | ld8(m + 1)
			m = m + 2
		} else {
			m = o + 1
		}
		q = (q - p) as i32
		if (0 > (q as i64)) {
			return r & 1
		}
		r = r ^ 1
		if (m == n + u) {
			return r & 1
		}
	}
}

export function fn_154998(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s50 = fp - 0x50, s51 = fp - 0x51
	if (0xa > (a as u8)) {
		return a | 0x30
	}
	if (0x10 > (a as u8)) {
		return a + 0x57
	}
	st8(s51, a)
	st64(s50, 0x1001625a8)
	st64(s50 + 0x10, s20)
	st64(s20, 0x10015f2f6, fn_154c88, s51, fn_154c88)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "number not in the range 0..={}: {}" {} = *0x10015f2f6 [fn_154c88], {} = a [fn_154c88]
	fn_14ec00(s50, 0x1001625c8, c, d, e)
}

export function fn_154bc8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return GenericRadix_fmt_int_14fe60(a, ld8(a), b, d, e)
}

export function fn_154be8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return GenericRadix_fmt_int_14ff60(a, ld8(a), b, d, e)
}

export function fn_154c08(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return GenericRadix_fmt_int_14fc50(a, ld32(a), b, d, e)
}

export function fn_154c28(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return GenericRadix_fmt_int_14fd58(a, ld32(a), b, d, e)
}

export function fn_154c48(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return GenericRadix_fmt_int_14fb60(a, ld64(a), b, d, e)
}

export function fn_154c68(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return GenericRadix_fmt_int_150060(a, ld64(a), b, d, e)
}
