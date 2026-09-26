// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction update_fees_and_rewards: handler + 17 reachable functions
// typed views: x.field is exactly the load / store / address given by the field declaration
type at<Offset extends number, T> = T // view field: a T at byte offset Offset of the object (x.f: scalar = its load, ref<U> = the loaded pointer, other = its address)
type ref<T> = T                        // view field holding a pointer (8 bytes) to a T
interface sized<Size extends number> {} // a view of that many bytes: x[k] is the k-th such object from x (at x + k * Size)
interface Pubkey {} // 32-byte public key (a Pubkey value is its address)
interface bytes {} // byte array in place (a bytes value is its address)
interface AccountInfo extends sized<0x30> { // solana_program::account_info::AccountInfo (Rust struct, 0x30 bytes; `&[AccountInfo]` has stride 0x30)
	key:         at<0x00, ref<Pubkey>> // &Pubkey
	lamports:    at<0x08, ref<LamportsCell>> // Rc<RefCell<&mut u64>>
	data:        at<0x10, ref<DataCell>> // Rc<RefCell<&mut [u8]>>
	owner:       at<0x18, ref<Pubkey>> // &Pubkey
	rent_epoch:  at<0x20, u64>
	is_signer:   at<0x28, u8>
	is_writable: at<0x29, u8>
	executable:  at<0x2a, u8>
}
interface LamportsCell extends sized<0x20> { // Rc<RefCell<&mut u64>> box of an AccountInfo: reference counts, RefCell borrow flag, the lamports pointer
	strong: at<0x00, u64>
	weak:   at<0x08, u64>
	borrow: at<0x10, u64> // RefCell flag: 0 free, > 0 shared borrows, -1 mutably borrowed
	value:  at<0x18, ref<Lamports>> // &mut u64
}
interface Lamports extends sized<0x08> { // the lamports of an account (in the input buffer)
	amount: at<0x00, u64>
}
interface DataCell extends sized<0x28> { // Rc<RefCell<&mut [u8]>> box of an AccountInfo: reference counts, RefCell borrow flag, the data slice
	strong: at<0x00, u64>
	weak:   at<0x08, u64>
	borrow: at<0x10, u64> // RefCell flag: 0 free, > 0 shared borrows, -1 mutably borrowed
	ptr:    at<0x18, ref<bytes>> // data pointer
	len:    at<0x20, u64> // data length
}
interface AccountRecord { // serialized account in the program input (what a pinocchio AccountInfo points to)
	dup_marker:        at<0x00, u8> // 0xff: not a duplicate of an earlier account (pinocchio reuses this byte as borrow state)
	is_signer:         at<0x01, u8>
	is_writable:       at<0x02, u8>
	executable:        at<0x03, u8>
	original_data_len: at<0x04, u32> // pinocchio: resize delta
	key:               at<0x08, Pubkey>
	owner:             at<0x28, Pubkey>
	lamports:          at<0x48, u64>
	data_len:          at<0x50, u64>
	data:              at<0x58, bytes>
}
interface UpdateFeesAndRewardsAccounts { // Accounts struct of instruction update_fees_and_rewards as accounts_update_fees_and_rewards returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	position: at<0x290, ref<AccountInfo>>
}
interface UpdateFeesAndRewardsContext { // anchor_lang Context of instruction update_fees_and_rewards (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<UpdateFeesAndRewardsAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function fn_f658(a: u64, b: u64): u64 // lib
declare function fn_fa00(a: u64, b: u64): u64 // lib
declare function try_accounts_11a48(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11b00(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function clock_get_13f308(a: u64): u64 // lib solana_sysvar::clock::<impl solana_sysvar::Sysvar for solana_clock::Clock>::get
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function str_fmt(a: u64, b: u64, c: u64): u64 // lib <str as core::fmt::Display>::fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function __udivti3(a: u64, b: u64, c: u64, d: u64, e: u64, r8: u64): u64 // lib __udivti3
declare function __multi3(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __multi3 [heur] u128 multiply: *out = a * b (mod 2^128), a = (a_lo, a_hi), b = (b_lo, b_hi) [exec: on 31 operand pairs]

// instruction handler: update_fees_and_rewards (discriminator sha256("global:update_fees_and_rewards")[..8] = 0xdf4bd1ec0dfae69a)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, position, tick_array_lower, tick_array_upper
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool, position
function ix_update_fees_and_rewards(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s360 = fp - 0x360, s368 = fp - 0x368, s378 = fp - 0x378, s460 = fp - 0x460, s6d8 = fp - 0x6d8, s6f0 = fp - 0x6f0, s700 = fp - 0x700, s710 = fp - 0x710, s720 = fp - 0x720, s730 = fp - 0x730, s740 = fp - 0x740, s750 = fp - 0x750
	sol_log("Instruction: UpdateFeesAndRewards", 0x21)
	st64(s700, accounts, accounts_len)
	let k = accounts_update_fees_and_rewards(s378, undef, s700, undef, fp)
	const g = ld64(s368)
	let h = ld64(s378 + 8)
	const f = ld64(s378)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return k
	}
	memcpy(s6d8, s360, 0x360)
	st64(s6f0, f, h, g)
	copyr(s368, s700, 0x10)
	st64(s378, program_id, s6f0)
	k = fn_3adf0(s710, s378)
	h = ld64(s710)
	if (h == 2) {
		fn_6aa0(s720, s6f0, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
		const i = ld64(s720)
		if (i != 2) {
			k = Error_with_account_name(s730, i, ld64(s720 + 8), 0x100152b28 /* "whirlpool" */, 9)
			h = ld64(s730)
			st64(a + 8, ld64(s730 + 8))
			st64(a, h)
			return k
		}
		k = fn_5a40(s740, s460, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
		const j = ld64(s740)
		if (j == 2) {
			st64(a + 8, g)
			st64(a, 2)
			return k
		}
		k = Error_with_account_name(s750, j, ld64(s740 + 8), "position", 8)
		h = ld64(s750)
		st64(a + 8, ld64(s750 + 8))
		st64(a, h)
		return k
	}
	st64(a + 8, ld64(s710 + 8))
	st64(a, h)
	return k
}

// Anchor Accounts::try_accounts of instruction update_fees_and_rewards (called by ix_update_fees_and_rewards; name [str]: from the handler's "Instruction: …" log; was fn_d1ca0)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool (ConstraintMut), position (ConstraintHasOne, ConstraintMut), tick_array_lower (AccountNotEnoughKeys), tick_array_upper
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position
function accounts_update_fees_and_rewards(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s100 = fp - 0x100, s378 = fp - 0x378, s5f0 = fp - 0x5f0, s608 = fp - 0x608, s618 = fp - 0x618, s628 = fp - 0x628, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s668 = fp - 0x668, s678 = fp - 0x678, s688 = fp - 0x688, s698 = fp - 0x698, s6a8 = fp - 0x6a8, s6b8 = fp - 0x6b8, s6c8 = fp - 0x6c8, s6d8 = fp - 0x6d8, s6f0 = fp - 0x6f0, s6f8 = fp - 0x6f8, s700 = fp - 0x700, s708 = fp - 0x708
	let m, n, p, r, s, y, z: u64
	try_accounts_11a48(s608, c, c, d, e)
	const h = ld64(s608 + 0x10)
	const g = ld64(s608 + 8)
	const f: AccountInfo = ld64(s608)
	if (f == 0) {
		z = Error_with_account_name(s6d8, g, h, 0x100152b28 /* "whirlpool" */, 9)
		y = ld64(s6d8)
		st64(a + 0x10, ld64(s6d8 + 8))
		st64(a + 8, y)
		st64(a, 0)
		return z
	}
	st64(s6f0, g, h)
	memcpy(s378, s5f0, 0x278)
	try_accounts_11b00(s608, c)
	const k = ld64(s608 + 0x10)
	const j = ld64(s608 + 8)
	const position: AccountInfo = ld64(s608)
	if (position == 0) {
		z = Error_with_account_name(s6c8, j, k, "position", 8)
		y = ld64(s6c8)
		st64(a + 0x10, ld64(s6c8 + 8))
		st64(a + 8, y)
		st64(a, 0)
		return z
	}
	B9: {
		st64(s6f8, j)
		st64(s6f0 + 0x10, k)
		memcpy(s100, s5f0, 0xc0)
		const l = ld64(c + 8)
		if (l != 0) {
			p = ld64(c)
			st64(c, p + 0x30, l - 1)
			if (l != 1) {
				st64(s700, p)
				st64(c + 8, l - 2)
				r = ld64(c)
				st64(c, r + 0x30)
				s = ld64(s6f0 + 0x10)
				break B9
			}
		} else {
			anchor_error_from(s618, 0xbbd /* anchor::AccountNotEnoughKeys */, undef, m, n)
			p = ld64(s618 + 8)
			const o = ld64(s618)
			if (o != 2) {
				z = Error_with_account_name(s628, o, p, "tick_array_lower", 0x10)
				y = ld64(s628)
				st64(a + 0x10, ld64(s628 + 8))
				st64(a + 8, y)
				st64(a, 0)
				return z
			}
		}
		st64(s700, p)
		anchor_error_from(s638, 0xbbd /* anchor::AccountNotEnoughKeys */, p, m, n)
		r = ld64(s638 + 8)
		const q = ld64(s638)
		s = ld64(s6f0 + 0x10)
		if (q != 2) {
			z = Error_with_account_name(s648, q, r, "tick_array_upper", 0x10)
			y = ld64(s648)
			st64(a + 0x10, ld64(s648 + 8))
			st64(a + 8, y)
			st64(a, 0)
			return z
		}
	}
	if (f.is_writable == 0) {
		anchor_error_from(s6a8, 0x7d0 /* anchor::ConstraintMut */, r, s, n)
		z = Error_with_account_name(s6b8, ld64(s6a8), ld64(s6a8 + 8), 0x100152b28 /* "whirlpool" */, 9)
		y = ld64(s6b8)
		st64(a + 0x10, ld64(s6b8 + 8))
		st64(a + 8, y)
		st64(a, 0)
		return z
	}
	if (position.is_writable != 0) {
		st64(s708, r)
		st64(s40 + 8, s)
		const t = ld64(s6f8)
		st64(s40, t)
		copy(s30, s100, 0x10)
		const u = f.key
		copyr(s20, u, 0x20)
		if ((memcmp(s40, s20, 0x20) as u32) != 0) {
			anchor_error_from(s658, 0x7d1 /* anchor::ConstraintHasOne */)
			const x = Error_with_account_name(s668, ld64(s658), ld64(s658 + 8), "position", 8)
			const w = ld64(s668 + 8)
			const v = ld64(s668)
			copy(s608, s40, 0x40)
			z = fn_13b5c0(s678, v, w, s608, x)
			y = ld64(s678)
			st64(a + 0x10, ld64(s678 + 8))
			st64(a + 8, y)
			st64(a, 0)
			return z
		}
		memcpy(a + 0x18, s378, 0x278)
		z = memcpy(a + 0x2a8, s100, 0xc0)
		st64(a + 0x370, ld64(s708))
		st64(a + 0x368, ld64(s700))
		st64(a + 0x2a0, ld64(s6f0 + 0x10))
		st64(a + 0x298, t)
		st64(a + 0x290, position)
		st64(a + 0x10, ld64(s6f0 + 8))
		st64(a + 8, ld64(s6f0))
		st64(a, f)
		return z
	}
	anchor_error_from(s688, 0x7d0 /* anchor::ConstraintMut */, r, s, n)
	z = Error_with_account_name(s698, ld64(s688), ld64(s688 + 8), "position", 8)
	y = ld64(s698)
	st64(a + 0x10, ld64(s698 + 8))
	st64(a + 8, y)
	st64(a, 0)
	return z
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// types [heur]: b: UpdateFeesAndRewardsContext (the handler ix_update_fees_and_rewards passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_3adf0(a: u64, b: UpdateFeesAndRewardsContext): u64 {
	const s48 = fp - 0x48, s1c8 = fp - 0x1c8, s348 = fp - 0x348, s390 = fp - 0x390, s3d8 = fp - 0x3d8, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410
	let g, h, t: u64
	const accounts: UpdateFeesAndRewardsAccounts = b.accounts
	clock_get_13f308(s3d8)
	if (ld64(s3d8) != 0) {
		const s = ld64(s3d8 + 8)
		const r = ld64(s3d8 + 0x10)
		st64(s3d8 + 0x10, ld64(s3d8 + 0x18))
		st64(s3d8, s, r)
		t = fn_13b430(s400, s3d8)
		h = ld64(s400)
		st64(a + 8, ld64(s400 + 8))
		st64(a, h)
		return t
	}
	const f = ld64(s3d8 + 0x28)
	let ac = f
	if (-1 >= (f as i64)) {
		t = fn_87630(s410, 0x15)
		g = ld64(s410 + 8)
		h = ld64(s410)
		ac = g
		if (h != 2) {
			st64(a + 8, g)
			st64(a, h)
			return t
		}
	}
	const k = ld64(accounts + 0x368)
	const j = ld64(ld64(accounts))
	copyr(s3d8, j, 0x20)
	t = fn_5d3f0(s3f0, k, s3d8)
	g = ld64(s3f0 + 0x10)
	h = ld64(s3f0 + 8)
	const l = ld64(s3f0)
	if (l == 0) {
		st64(a + 8, g)
		st64(a, h)
		return t
	}
	let ab = l
	const n = ld64(accounts + 0x370)
	const m = ld64(ld64(accounts))
	copyr(s3d8, m, 0x20)
	t = fn_5d3f0(s3f0, n, s3d8)
	const p = ld64(s3f0 + 0x10)
	let q = ld64(s3f0 + 8)
	const o = ld64(s3f0)
	if (o == 0) {
		st64(g, ld64(g) - 1)
		st64(a + 8, p)
		st64(a, q)
		return t
	}
	t = fn_462a0(s3d8, accounts + 8, accounts + 0x298, ab, h, o, q, ac)
	q = ld64(s3d8 + 8)
	if (ld64(s3d8) != 0) {
		const u = ld64(s3d8 + 0x10)
		st64(p, ld64(p) - 1)
		st64(g, ld64(g) - 1)
		st64(a + 8, u)
		st64(a, q)
		return t
	}
	ab = ld64(s3d8 + 0x10)
	const aa = ld64(s3d8 + 0x38)
	const z = ld64(s3d8 + 0x40)
	const y = ld64(s3d8 + 0x18)
	const x = ld64(s3d8 + 0x20)
	const w = ld64(s3d8 + 0x28)
	const v = ld64(s3d8 + 0x30)
	memcpy(s48, s390, 0x48)
	memcpy(s1c8, s348, 0x180)
	st64(accounts + 0x278, ac)
	memcpy(accounts + 8, s1c8, 0x180)
	st64(accounts + 0x300, v)
	st64(accounts + 0x2f8, w)
	st64(accounts + 0x2f0, x)
	st64(accounts + 0x2e8, y)
	st64(accounts + 0x310, z)
	st64(accounts + 0x308, aa)
	st64(accounts + 0x2e0, ab)
	st64(accounts + 0x2d8, q)
	t = memcpy(accounts + 0x318, s48, 0x48)
	st64(p, ld64(p) - 1)
	st64(g, ld64(g) - 1)
	st64(a + 8, g)
	st64(a, 2)
	return t
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_6aa0(a: u64, b: u64, c: u64, d: u64): u64 {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_5a40(a: u64, b: u64, c: u64, d: u64): u64 {
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

function fn_5d3f0(a: u64, b: u64, c: u64): u64 {
	const s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70
	let j, n, o, q, s: u64
	const f = memcmp(ld64(b + 0x18), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((f as u32) != 0) {
		o = anchor_error_from(s30, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		n = ld64(s30)
		st64(a + 0x10, ld64(s30 + 8))
		st64(a + 8, n)
		st64(a, 0)
		return o
	}
	AccountInfo_try_borrow_data(s20, b, f as u32)
	let k = undef
	let l = undef
	const m = ld64(s20 + 0x10)
	let h = ld64(s20 + 8)
	const g = ld64(s20)
	if (g == 0x800000000000001a /* Ok */) {
		B3: {
			j = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
			const i = ld64(h + 8)
			if (i >= 8) {
				l = ld64(h)
				h = ld64(l)
				if (h == 0x38dac7e18ef6d811 /* account:DynamicTickArray */) {
					q = 0x100159f60
				} else {
					j = 0xbba /* anchor::AccountDiscriminatorMismatch */
					k = 0xbb42076ebebd6145 /* account:TickArray */
					if (h != 0xbb42076ebebd6145 /* account:TickArray */) {
						break B3
					}
					q = 0x100159fd0
					if (i != 0x2704) {
						fn_117c8("from_bytes", 0xa, 2, 0xbb42076ebebd6145 /* account:TickArray */, l)
					}
				}
				const p = l + 8
				st64(s70, p, q)
				const r = ld64(q + 0x28)
				callx(r, s20, p, r, k, p)
				o = memcmp(s20, c, 0x20) as u32
				if (o != 0) {
					o = fn_87630(s50, 0x38)
					s = ld64(s50)
					st64(a + 0x10, ld64(s50 + 8))
					st64(a + 8, s)
					st64(a, 0)
					st64(m, ld64(m) - 1)
					return o
				}
				st64(a + 0x10, m)
				st64(a + 8, ld64(s70 + 8))
				st64(a, ld64(s70))
				return o
			}
		}
		o = anchor_error_from(s60, j, h, k, l)
		s = ld64(s60)
		st64(a + 0x10, ld64(s60 + 8))
		st64(a + 8, s)
		st64(a, 0)
		st64(m, ld64(m) - 1)
		return o
	}
	st64(s20, g, h, m)
	o = fn_13b430(s40, s20)
	n = ld64(s40)
	st64(a + 0x10, ld64(s40 + 8))
	st64(a + 8, n)
	st64(a, 0)
	return o
}

function fn_462a0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s180 = fp - 0x180, s2f8 = fp - 0x2f8, s300 = fp - 0x300, s310 = fp - 0x310, s370 = fp - 0x370, s3d1 = fp - 0x3d1, s3e1 = fp - 0x3e1, s3e8 = fp - 0x3e8, s445 = fp - 0x445, s455 = fp - 0x455, s45c = fp - 0x45c
	const h = ld16(b + 0x27c)
	const g = ld32(c + 0xc8)
	const f = p5
	const i = ld64(f + 0x38)
	let p = callx(i, s310, d, g, h, i)
	if (ld8(s310) != 0) {
		const o = ld64(s310 + 8)
		st64(a + 0x10, ld64(s300))
		st64(a + 8, o)
		st64(a, 1)
		return p
	}
	const q = p8
	const j = p7
	const k = p6
	st32(s45c + 3, ld32(s310 + 4))
	st32(s45c, ld32(s310 + 1))
	const z = ld64(s310 + 8)
	let y = ld64(s300)
	memcpy(s3e8, s2f8, 0x5a)
	memcpy(s445, s3e8, 0x5a)
	st64(s455, z, y)
	const m = ld64(j + 0x38)
	const l = ld32(c + 0xcc)
	p = callx(m, s310, k, l, h, m)
	if (ld8(s310) == 0) {
		st32(s3e8 + 3, ld32(s310 + 4))
		st32(s3e8, ld32(s310 + 1))
		y = ld64(s310 + 8)
		const r = ld64(s300)
		memcpy(s370, s2f8, 0x5a)
		memcpy(s3d1, s370, 0x5a)
		st64(s3e1, y, r)
		const s = ld64(f + 0x18)
		const t = callx(s, d, s)
		const u = ld64(j + 0x18)
		const v = callx(u, k, u)
		p = fn_46778(s310, b, c, s45c, s3e8, g, l, t, v, 0, 0, q)
		const w = ld64(s310 + 8)
		const x = ld64(s310)
		if (ld8(s180 + 0x170) == 2) {
			st64(a + 0x10, w)
			st64(a + 8, x)
			st64(a, 1)
			return p
		}
		memcpy(a + 0xa0, s300, 0x170)
		p = memcpy(a + 8, s180, 0x88)
		st64(a + 0x98, w)
		st64(a + 0x90, x)
		st64(a, 0)
		return p
	}
	const n = ld64(s310 + 8)
	st64(a + 0x10, ld64(s300))
	st64(a + 8, n)
	st64(a, 1)
	return p
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_13ae08(a: u64, b: u64, c: u64): u64 {
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

function fn_117c8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
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

function fn_46778(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64): u64 {
	const s78 = fp - 0x78, sa8 = fp - 0xa8, s218 = fp - 0x218, s228 = fp - 0x228, s230 = fp - 0x230, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s430 = fp - 0x430, s450 = fp - 0x450, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4e8 = fp - 0x4e8, s500 = fp - 0x500, s518 = fp - 0x518, s538 = fp - 0x538, s550 = fp - 0x550, s570 = fp - 0x570, s580 = fp - 0x580, s5a0 = fp - 0x5a0, s5c8 = fp - 0x5c8, s5d0 = fp - 0x5d0, s5d8 = fp - 0x5d8, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let l, m, n, o, q, s, t, u, ad, ag, ah, ak, am, ar, av, ba, bb, bc, bh, cn, cq: u64
	let j = a
	const i = ld64(c + 0x40)
	const g = ld64(c + 0x48)
	const f = p11
	const h = p10
	st64(s430 + 0x18, h)
	if ((h | i | (f | g)) == 0) {
		o = fn_87630(s410, 0xc)
		n = ld64(s410)
		st64(j + 8, ld64(s410 + 8))
		st64(j, n)
		st8(j + 0x300, 2)
		return o
	}
	st64(s450 + 0x18, d)
	st64(s450, f, c)
	st64(s430 + 0x10, j)
	const k = p12
	st64(s4a0 + 0x40, p9)
	st64(s450 + 0x10, p8)
	st64(s430, p7, p6)
	const p = p5
	fn_4e100(s230, b, k)
	if (ld32(s230) == 0) {
		B10: {
			B23: {
				st64(s4a0 + 0x28, p)
				st64(s4b0, g, i)
				memcpy(s3b0, s228, 0x180)
				st64(s4a0 + 0x48, ld64(b + 0x228))
				u = ld64(b + 0x220)
				q = ld32(b + 0x278)
				const r = ld64(s450 + 8)
				if ((ld32(r + 0xcc) as i32) > (q as i32) && (q as i32) >= (ld32(r + 0xc8) as i32)) {
					s = ld64(s430 + 0x18)
					t = ld64(s450)
					if ((s | t) != 0) {
						j = ld64(s430 + 0x10)
						if ((t != 0 ? 0 > (t as i64) : s == 0) != 0) {
							const an = t + (s != 0)
							const ao = -an > ld64(s4a0 + 0x48)
							if (((ld64(s4a0 + 0x48) != -an ? ao : -s > u) & 1) != 0) {
								o = fn_87630(s3e0, 0xf)
								n = ld64(s3e0)
								st64(j + 8, ld64(s3e0 + 8))
								st64(j, n)
								st8(j + 0x300, 2)
								return o
							}
							ah = u + s
							ak = ld64(s4a0 + 0x48) + t + (u > ah)
						} else {
							ah = u + s
							let aj = u > ah
							const ai = ld64(s4a0 + 0x48)
							ak = ai + t + aj
							aj = ak != ld64(s4a0 + 0x48) ? ai > ak : aj
							if ((aj & 1) != 0) {
								o = fn_87630(s3e0, 0xe)
								n = ld64(s3e0)
								st64(j + 8, ld64(s3e0 + 8))
								st64(j, n)
								st8(j + 0x300, 2)
								return o
							}
						}
						st64(s4a0 + 0x48, ak)
						st64(s4a0 + 0x20, ld64(b + 0x258))
						st64(s4a0 + 0x38, ld64(b + 0x250))
						st64(s4a0 + 0x18, ld64(b + 0x248))
						st64(s4a0 + 0x30, ld64(b + 0x240))
						u = ah
						break B23
					}
					st64(s4a0 + 0x20, ld64(b + 0x258))
					st64(s4a0 + 0x38, ld64(b + 0x250))
					st64(s4a0 + 0x18, ld64(b + 0x248))
					st64(s4a0 + 0x30, ld64(b + 0x240))
					j = ld64(s430 + 0x10)
				} else {
					s = ld64(s430 + 0x18)
					t = ld64(s450)
					st64(s4a0 + 0x20, ld64(b + 0x258))
					st64(s4a0 + 0x38, ld64(b + 0x250))
					st64(s4a0 + 0x18, ld64(b + 0x248))
					st64(s4a0 + 0x30, ld64(b + 0x240))
					j = ld64(s430 + 0x10)
					if ((s | t) != 0) {
						break B23
					}
				}
				st64(s4e8 + 0x30, u)
				const v = ld64(s450 + 0x18)
				const w = ld64(v + 9)
				const x = ld64(v + 1)
				st64(s4e8 + 0x28, x)
				st64(s538 + 0x10, (x >> 0x20 | (w << 0x20)))
				st64(s4a0, ld64(v + 0x69))
				st64(s4e8 + 0x18, ld64(v + 0x61))
				st64(s4a0 + 8, ld64(v + 0x59))
				st64(s4e8 + 0x20, ld64(v + 0x51))
				st64(s4a0 + 0x10, ld64(v + 0x49))
				st64(s500 + 8, ld64(v + 0x41))
				st64(s4e8, ld64(v + 0x39))
				st64(s4e8 + 8, ld64(v + 0x31))
				st64(s500, ld64(v + 0x29))
				st64(s4e8 + 0x10, ld64(v + 0x21))
				st64(s538, ld64(v + 0x19))
				st64(s538 + 8, ld64(v + 0x11))
				st64(s500 + 0x10, ld8(v))
				st64(s538 + 0x18, w >> 0x20)
				break B10
			}
			st64(s4e8 + 0x30, u)
			const ap = ld64(s450 + 0x18)
			const at = ld64(ap + 0x19)
			const aq = ld64(ap + 0x11)
			if ((t != 0 ? 0 > (t as i64) : s == 0) != 0) {
				const aw = t + (ld64(s430 + 0x18) != 0)
				if ((at != -aw ? -aw > at : -s > aq) != 0) {
					o = fn_87630(s3d0, 0xf)
					n = ld64(s3d0)
					st64(j + 8, ld64(s3d0 + 8))
					st64(j, n)
					st8(j + 0x300, 2)
					return o
				}
				s = ld64(s430 + 0x18)
				ar = aq + s
				st64(s4a0 + 0x48, ld64(s4a0 + 0x48))
				av = at + t + (aq > ar)
			} else {
				ar = aq + s
				let au = aq > ar
				av = at + t + au
				au = av != at ? at > av : au
				if ((au & 1) != 0) {
					o = fn_87630(s3d0, 0xe)
					n = ld64(s3d0)
					st64(j + 8, ld64(s3d0 + 8))
					st64(j, n)
					st8(j + 0x300, 2)
					return o
				}
				st64(s4a0 + 0x48, ld64(s4a0 + 0x48))
				s = ld64(s430 + 0x18)
			}
			st64(s4e8 + 0x28, 0)
			st64(s538, 0, 0, 0, 0)
			st64(s4e8 + 0x10, 0)
			st64(s500, 0)
			st64(s4e8, 0, 0)
			st64(s500 + 8, 0)
			st64(s4a0 + 0x10, 0)
			st64(s4e8 + 0x20, 0)
			st64(s4a0 + 8, 0)
			st64(s500 + 0x10, 0)
			st64(s4e8 + 0x18, 0)
			st64(s4a0, 0)
			st64(s4a0 + 0x48, ld64(s4a0 + 0x48))
			if ((ar | av) != 0) {
				if ((aq | at) != 0) {
					ba = ld64(s450 + 0x18)
					st64(s4a0, ld64(ba + 0x69))
					st64(s4e8 + 0x18, ld64(ba + 0x61))
					st64(s4a0 + 8, ld64(ba + 0x59))
					st64(s4e8 + 0x20, ld64(ba + 0x51))
					st64(s4a0 + 0x10, ld64(ba + 0x49))
					bc = ld64(ba + 0x41)
					st64(s4e8, ld64(ba + 0x39))
					st64(s4e8 + 8, ld64(ba + 0x31))
					bb = ld64(ba + 0x29)
					st64(s4e8 + 0x10, ld64(ba + 0x21))
				} else {
					bc = 0
					const ax = ld64(s430 + 8)
					st64(s4a0 + 0x10, 0)
					st64(s4e8 + 0x20, 0)
					st64(s4a0 + 8, 0)
					st64(s4e8 + 0x18, 0)
					st64(s4a0, 0)
					st64(s4e8 + 0x10, 0)
					bb = 0
					st64(s4e8, 0, 0)
					ba = ld64(s450 + 0x18)
					if ((q as i32) >= (ax as i32)) {
						st64(s4a0, ld64(s3b0 + 0x178))
						st64(s4e8 + 0x18, ld64(s3b0 + 0x170))
						st64(s4a0 + 8, ld64(s3b0 + 0xf8))
						st64(s4e8 + 0x20, ld64(s3b0 + 0xf0))
						st64(s4a0 + 0x10, ld64(s3b0 + 0x78))
						bc = ld64(s3b0 + 0x70)
						st64(s4e8 + 0x10, ld64(s4a0 + 0x30))
						bb = ld64(s4a0 + 0x18)
						st64(s4e8 + 8, ld64(s4a0 + 0x38))
						st64(s4e8, ld64(s4a0 + 0x20))
					}
				}
				st64(s500, bb, bc)
				const bd = ld64(ba + 1)
				const be = bd + s
				st64(s4e8 + 0x28, be)
				const bf = ld64(ba + 9)
				const bg = bf + t + (bd > be)
				if (0 > ((~(bf ^ t) & (bf ^ bg)) as i64)) {
					o = fn_87630(s3d0, 0x10)
					n = ld64(s3d0)
					st64(j + 8, ld64(s3d0 + 8))
					st64(j, n)
					st8(j + 0x300, 2)
					return o
				}
				st64(s538 + 0x10, ld64(s4e8 + 0x28) >> 0x20 | (bg << 0x20))
				st64(s500 + 0x10, 1)
				st64(s538 + 0x18, bg >> 0x20)
				st64(s538, av, ar)
				s = ld64(s430 + 0x18)
			}
		}
		if ((s | t) != 0) {
			const ab = ld64(s4a0 + 0x28)
			const ae = ld64(ab + 0x19)
			const ac = ld64(ab + 0x11)
			if ((t != 0 ? 0 > (t as i64) : s == 0) != 0) {
				const al = t + (ld64(s430 + 0x18) != 0)
				if ((ae != -al ? -al > ae : -s > ac) != 0) {
					o = fn_87630(s3f0, 0xf)
					n = ld64(s3f0)
					st64(j + 8, ld64(s3f0 + 8))
					st64(j, n)
					st8(j + 0x300, 2)
					return o
				}
				am = ld64(s430 + 0x18)
				ad = ac + am
				ag = ae + t + (ac > ad)
			} else {
				ad = ac + s
				let af = ac > ad
				ag = ae + t + af
				af = ag != ae ? ae > ag : af
				if ((af & 1) != 0) {
					o = fn_87630(s3f0, 0xe)
					n = ld64(s3f0)
					st64(j + 8, ld64(s3f0 + 8))
					st64(j, n)
					st8(j + 0x300, 2)
					return o
				}
				am = ld64(s430 + 0x18)
			}
			st64(s5a0, 0, 0, 0, 0)
			st64(s570, 0, 0, 0, 0)
			st64(s550 + 0x10, 0)
			st64(s580, 0, 0)
			st64(s5c8, 0, 0, 0, 0, 0)
			if ((ad | ag) != 0) {
				if ((ac | ae) != 0) {
					bh = ld64(s4a0 + 0x28)
					st64(s580, ld64(bh + 0x69))
					st64(s580 + 8, ld64(bh + 0x61))
					st64(s570, ld64(bh + 0x59))
					st64(s570 + 8, ld64(bh + 0x51))
					st64(s570 + 0x10, ld64(bh + 0x49))
					st64(s570 + 0x18, ld64(bh + 0x41))
					st64(s5a0, ld64(bh + 0x39))
					st64(s5a0 + 8, ld64(bh + 0x31))
					st64(s5a0 + 0x10, ld64(bh + 0x29))
					st64(s5a0 + 0x18, ld64(bh + 0x21))
				} else {
					st64(s570 + 0x18, 0)
					const ay = ld64(s430)
					st64(s5a0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
					bh = ld64(s4a0 + 0x28)
					const az = ld64(s4a0 + 0x20)
					if ((q as i32) >= (ay as i32)) {
						st64(s580, ld64(s3b0 + 0x178))
						st64(s580 + 8, ld64(s3b0 + 0x170))
						st64(s570, ld64(s3b0 + 0xf8))
						st64(s570 + 8, ld64(s3b0 + 0xf0))
						st64(s570 + 0x10, ld64(s3b0 + 0x78))
						st64(s570 + 0x18, ld64(s3b0 + 0x70))
						st64(s5a0 + 0x18, ld64(s4a0 + 0x30))
						st64(s5a0 + 0x10, ld64(s4a0 + 0x18))
						st64(s5a0 + 8, ld64(s4a0 + 0x38))
						st64(s5a0, az)
					}
				}
				const bj = ld64(bh + 9)
				const bi = ld64(bh + 1)
				const bk = bj - t - (am > bi)
				if (0 > (((bj ^ t) & (bj ^ bk)) as i64)) {
					o = fn_87630(s3f0, 0x10)
					n = ld64(s3f0)
					st64(j + 8, ld64(s3f0 + 8))
					st64(j, n)
					st8(j + 0x300, 2)
					return o
				}
				const bl = ld64(s430 + 0x18)
				st64(s5c8 + 0x20, bi - bl)
				st64(s5c8 + 0x10, (bi - bl >> 0x20 | (bk << 0x20)))
				st64(s550 + 0x10, 1)
				st64(s5c8 + 0x18, bk >> 0x20)
				st64(s5c8, ag, ad)
			}
		} else {
			const y = ld64(s4a0 + 0x28)
			const z = ld64(y + 9)
			const aa = ld64(y + 1)
			st64(s5c8 + 0x20, aa)
			st64(s5c8 + 0x10, (aa >> 0x20 | (z << 0x20)))
			st64(s580, ld64(y + 0x69))
			st64(s580 + 8, ld64(y + 0x61))
			st64(s570, ld64(y + 0x59))
			st64(s570 + 8, ld64(y + 0x51))
			st64(s570 + 0x10, ld64(y + 0x49))
			st64(s570 + 0x18, ld64(y + 0x41))
			st64(s5a0, ld64(y + 0x39))
			st64(s5a0 + 8, ld64(y + 0x31))
			st64(s5a0 + 0x10, ld64(y + 0x29))
			st64(s5a0 + 0x18, ld64(y + 0x21))
			st64(s5c8, ld64(y + 0x19))
			st64(s5c8 + 8, ld64(y + 0x11))
			st64(s550 + 0x10, ld8(y))
			st64(s5c8 + 0x18, z >> 0x20)
		}
		copy(s4a0, s4a0, 0x18)
		st64(s4a0 + 0x48, ld64(s4a0 + 0x48))
		let bm = ld64(s450 + 0x18)
		const bn = ld8(bm)
		let bs = ld64(s4a0 + 0x38)
		let bt = ld64(s4a0 + 0x20)
		st64(s518 + 0x10, ld64(s4a0 + 0x30))
		let ce = ld64(s4a0 + 0x18)
		let bo = ld64(s430 + 8)
		let bu = ld64(s4a0 + 0x28)
		st64(s5d0, bn)
		if (bn != 0) {
			const bq = ld64(bm + 0x29)
			const bp = ld64(bm + 0x21)
			if ((bo as i32) > (q as i32)) {
				const br = ld64(bm + 0x31)
				bt = ld64(s4a0 + 0x20) - ld64(bm + 0x39) - (br > ld64(s4a0 + 0x38))
				ce = ld64(s4a0 + 0x18) - bq - (bp > ld64(s4a0 + 0x30))
				st64(s518 + 0x10, ld64(s4a0 + 0x30) - bp)
				bs = ld64(s4a0 + 0x38) - br
				bm = ld64(s450 + 0x18)
				bo = ld64(s430 + 8)
				bu = ld64(s4a0 + 0x28)
			} else {
				bt = ld64(bm + 0x39)
				bs = ld64(bm + 0x31)
				st64(s518 + 0x10, bp)
				ce = bq
			}
		}
		st64(s550, bs, bt)
		const bv = ld8(bu)
		st64(s518, 0, 0)
		let cc = 0
		let ca = 0
		st64(s5d8, bv)
		if (bv != 0) {
			const bw = ld64(bu + 0x29)
			const bz = ld64(bu + 0x21)
			const bx = bu
			if ((ld64(s430) as i32) > (q as i32)) {
				ca = ld64(bx + 0x39)
				cc = ld64(bx + 0x31)
				st64(s518, bw, bz)
				bu = bx
			} else {
				st64(s518 + 8, bw)
				const by = ld64(bx + 0x31)
				ca = ld64(s4a0 + 0x20) - ld64(bx + 0x39) - (by > ld64(s4a0 + 0x38))
				st64(s518, ld64(s4a0 + 0x18) - ld64(s518 + 8) - (bz > ld64(s4a0 + 0x30)))
				st64(s518 + 8, ld64(s4a0 + 0x30) - bz)
				cc = ld64(s4a0 + 0x38) - by
				bm = ld64(s450 + 0x18)
				bo = ld64(s430 + 8)
				bu = ld64(s4a0 + 0x28)
			}
		}
		st64(sff8, ld64(s430))
		st64(sff8 + 8, s3b0)
		st64(s1000, bu)
		fn_4cc08(sa8, q as i32, bm, bo, bu, ld64(sff8), s3b0)
		const cb = ld64(s550)
		const cd = cb + cc
		const cf = ld64(s518 + 0x10)
		const cg = ld64(s518 + 8)
		const cl = ld64(s430 + 0x18)
		const ci = ce + ld64(s518) + (cf > cf + cg)
		const ch = ld64(s4a0 + 0x18)
		const ck = cf + cg > ld64(s4a0 + 0x30)
		const cj = ld64(s4a0 + 0x38)
		st64(sff8 + 0x10, ld64(s4a0 + 0x20) - (ld64(s550 + 8) + ca + (cb > cd)) - (cd > ld64(s4a0 + 0x38)))
		st64(sff8 + 0x18, sa8)
		st64(sff8, ch - ci - ck, cj - cd)
		st64(s1000, ld64(s4a0 + 0x30) - (cf + cg))
		fn_485d0(s230, ld64(s450 + 8), cl, ld64(s450), ld64(s1000), ch - ci - ck, cj - cd, ld64(sff8 + 0x10), sa8)
		const cm = ld64(s4b0 + 8)
		if (ld32(s230) == 0) {
			st64(s430 + 8, ld64(s228 + 8))
			st64(s430 + 0x18, ld64(s228))
			memcpy(s78, s218, 0x78)
			let co = 0
			let cu = 0
			const cp = ld64(s4a0 + 0x40)
			const cr = ld64(s430 + 0x10)
			if (ld64(s450 + 0x10) != 0) {
				if ((cm | ld64(s4b0)) != 0) {
					cn = ld64(s5d0)
					co = (ld64(s430 + 0x18) | ld64(s430 + 8)) != 0 ? 0 : 2
				} else {
					cn = ld64(s5d0)
					co = (ld64(s430 + 0x18) | ld64(s430 + 8)) != 0
				}
				cu = ld64(s500 + 0x10)
				if (cn != 0) {
					cu = (ld64(s500 + 0x10) as u8) != 0 ? 0 : 2
				}
			}
			st64(s430, co)
			let ct = 0
			let cs = 0
			if (cp != 0) {
				if ((ld64(s4b0 + 8) | ld64(s4b0)) != 0) {
					cq = ld64(s5d8)
					ct = (ld64(s430 + 0x18) | ld64(s430 + 8)) != 0 ? 0 : 2
				} else {
					cq = ld64(s5d8)
					ct = (ld64(s430 + 0x18) | ld64(s430 + 8)) != 0
				}
				cs = ld64(s550 + 0x10)
				if (cq != 0) {
					cs = (ld64(s550 + 0x10) as u8) != 0 ? 0 : 2
				}
			}
			memcpy(cr, s3b0, 0x180)
			st64(cr + 0x198, ld64(s430 + 8))
			st64(cr + 0x190, ld64(s430 + 0x18))
			st64(cr + 0x188, ld64(s4a0 + 0x48))
			st64(cr + 0x180, ld64(s4e8 + 0x30))
			o = memcpy(cr + 0x1a0, s78, 0x78)
			st64(cr + 0x2f8, ld64(s580))
			st64(cr + 0x2f0, ld64(s580 + 8))
			st64(cr + 0x2e8, ld64(s570))
			st64(cr + 0x2e0, ld64(s570 + 8))
			st64(cr + 0x2d8, ld64(s570 + 0x10))
			st64(cr + 0x2d0, ld64(s570 + 0x18))
			st64(cr + 0x2c8, ld64(s5a0))
			st64(cr + 0x2c0, ld64(s5a0 + 8))
			st64(cr + 0x2b8, ld64(s5a0 + 0x10))
			st64(cr + 0x2b0, ld64(s5a0 + 0x18))
			st64(cr + 0x2a8, ld64(s5c8))
			st64(cr + 0x2a0, ld64(s5c8 + 8))
			st32(cr + 0x29c, ld64(s5c8 + 0x18))
			st64(cr + 0x294, ld64(s5c8 + 0x10))
			st64(cr + 0x280, ld64(s4a0))
			st64(cr + 0x278, ld64(s4e8 + 0x18))
			st64(cr + 0x270, ld64(s4a0 + 8))
			st64(cr + 0x268, ld64(s4e8 + 0x20))
			st64(cr + 0x260, ld64(s4a0 + 0x10))
			st64(cr + 0x258, ld64(s500 + 8))
			st64(cr + 0x250, ld64(s4e8))
			st64(cr + 0x248, ld64(s4e8 + 8))
			st64(cr + 0x240, ld64(s500))
			st64(cr + 0x238, ld64(s4e8 + 0x10))
			st64(cr + 0x230, ld64(s538))
			st64(cr + 0x228, ld64(s538 + 8))
			st32(cr + 0x224, ld64(s538 + 0x18))
			st64(cr + 0x21c, ld64(s538 + 0x10))
			st8(cr + 0x30b, cs)
			st8(cr + 0x30a, ct)
			st8(cr + 0x309, cu)
			st8(cr + 0x308, ld64(s430))
			st8(cr + 0x300, ld64(s550 + 0x10))
			st32(cr + 0x290, ld64(s5c8 + 0x20))
			st8(cr + 0x288, ld64(s500 + 0x10))
			st32(cr + 0x218, ld64(s4e8 + 0x28))
			return o
		}
		o = fn_87630(s400, ld32(s230 + 4))
		m = ld64(s400)
		l = ld64(s430 + 0x10)
		st64(l + 8, ld64(s400 + 8))
		st64(l, m)
		st8(l + 0x300, 2)
		return o
	}
	o = fn_87630(s3c0, ld32(s230 + 4))
	m = ld64(s3c0)
	l = ld64(s430 + 0x10)
	st64(l + 8, ld64(s3c0 + 8))
	st64(l, m)
	st8(l + 0x300, 2)
	return o
}

function fn_b980(a: u64, b: u64): u64 {
	return str_fmt(ld64(a), ld64(a + 8), b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_149478(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	const s20 = fp - 0x20, s28 = fp - 0x28
	st64(s20, 0x10015b8e0, a, b)
	st16(s20 + 0x18, 1)
	st64(s28, 1)
	fn_147238(s28, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), a (points to it), b (value)
function fn_4e100(a: u64, b: u64, c: u64) {
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

function fn_4cc08(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64) {
	const s20 = fp - 0x20, s28 = fp - 0x28, s30 = fp - 0x30, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	let j, aa, ac, an, ba, bl, bs, bt, by, bz, ce, cf, ch, cj, co, cq, cs, cu, cy, da, dd, df, di: u64
	st64(s38, b)
	st64(s58, a)
	st64(s30, c)
	const h = ld8(c)
	const f = p5
	st64(s28, f)
	const i = ld8(f)
	st64(s20, 0, 0, 0, 0)
	const g = p7
	st64(s40, g)
	const k = memcmp(g, s20, 0x20)
	st64(s50, p6)
	if (h != 0) {
		if (i != 0) {
			if ((d as i32) > (ld64(s38) as i32)) {
				ba = 0
				an = 0
				let ao = 0
				const ad = ld64(s40)
				if ((k as u32) != 0) {
					let af = ld64(ld64(s28) + 0x41)
					const ae = ld64(ad + 0x70)
					const ak = af > ae
					const ag = ld64(s50)
					const ah = ld64(s38)
					if ((ah as i32) >= (ag as i32)) {
						af = ae - af
					}
					let aj = ld64(ld64(s28) + 0x49)
					const ai = ld64(ad + 0x78)
					if ((ah as i32) >= (ag as i32)) {
						aj = ai - aj - ak
					}
					const am = ae + af
					const al = ld64(ld64(s30) + 0x41)
					an = al - am + ae
					ao = ld64(ld64(s30) + 0x49) - (ai + aj + (ae > am)) - (am > al) + ai + (al - am > an)
					ba = 0
				}
				st64(s48, ao)
				st64(s20, 0, 0, 0, 0)
				const ap = memcmp(ad + 0x80, s20, 0x20)
				di = 0
				if ((ap as u32) != 0) {
					let ar = ld64(ld64(s28) + 0x51)
					const aq = ld64(ad + 0xf0)
					const ax = ar > aq
					const at = ld64(s50)
					const au = ld64(s38)
					if ((au as i32) >= (at as i32)) {
						ar = aq - ar
					}
					let aw = ld64(ld64(s28) + 0x59)
					const av = ld64(ad + 0xf8)
					if ((au as i32) >= (at as i32)) {
						aw = av - aw - ax
					}
					const az = aq + ar
					const ay = ld64(ld64(s30) + 0x51)
					ba = ay - az + aq
					di = ld64(ld64(s30) + 0x59) - (av + aw + (aq > az)) - (az > ay) + av + (ay - az > ba)
				}
				st64(s20, 0, 0, 0, 0)
				const bb = memcmp(ad + 0x100, s20, 0x20)
				bl = 0
				j = 0
				if ((bb as u32) != 0) {
					let be = ld64(ld64(s28) + 0x61)
					const bc = ld64(s40)
					const bd = ld64(bc + 0x170)
					st64(s60, be > bd)
					const bf = ld64(s50)
					const bg = ld64(s38)
					if ((bg as i32) >= (bf as i32)) {
						be = bd - be
					}
					st64(s38, ba)
					let bi = ld64(ld64(s28) + 0x69)
					const bh = ld64(bc + 0x178)
					if ((bg as i32) >= (bf as i32)) {
						bi = bh - bi - ld64(s60)
					}
					const bk = bd + be
					const bj = ld64(ld64(s30) + 0x61)
					bl = bj - bk + bd
					j = ld64(ld64(s30) + 0x69) - (bh + bi + (bd > bk)) - (bk > bj) + bh + (bj - bk > bl)
					ba = ld64(s38)
				}
			} else {
				ba = 0
				an = 0
				let cl = 0
				const z = ld64(s40)
				if ((k as u32) != 0) {
					const y = ld64(s30)
					const ci = ld64(y + 0x49)
					const ck = ld64(y + 0x41)
					if ((ld64(s50) as i32) > (ld64(s38) as i32)) {
						ac = ld64(z + 0x78)
						aa = ld64(z + 0x70)
						const cg = ld64(s28)
						ch = ld64(cg + 0x49)
						cj = ld64(cg + 0x41)
					} else {
						const ab = ld64(ld64(s28) + 0x41)
						aa = ld64(z + 0x70)
						ac = ld64(z + 0x78)
						ch = ac - ld64(ld64(s28) + 0x49) - (ab > aa)
						cj = aa - ab
					}
					cl = ac - (ch + ci + (cj > cj + ck)) - (cj + ck > aa)
					an = aa - (cj + ck)
				}
				st64(s48, cl)
				st64(s20, 0, 0, 0, 0)
				const cm = memcmp(z + 0x80, s20, 0x20)
				di = 0
				if ((cm as u32) != 0) {
					const cn = ld64(s30)
					const ct = ld64(cn + 0x59)
					const cv = ld64(cn + 0x51)
					if ((ld64(s50) as i32) > (ld64(s38) as i32)) {
						cq = ld64(z + 0xf8)
						co = ld64(z + 0xf0)
						const cr = ld64(s28)
						cs = ld64(cr + 0x59)
						cu = ld64(cr + 0x51)
					} else {
						const cp = ld64(ld64(s28) + 0x51)
						co = ld64(z + 0xf0)
						cq = ld64(z + 0xf8)
						cs = cq - ld64(ld64(s28) + 0x59) - (cp > co)
						cu = co - cp
					}
					di = cq - (cs + ct + (cu > cu + cv)) - (cu + cv > co)
					ba = co - (cu + cv)
				}
				st64(s20, 0, 0, 0, 0)
				const cw = memcmp(z + 0x100, s20, 0x20)
				bl = 0
				j = 0
				if ((cw as u32) != 0) {
					const cx = ld64(s30)
					const de = ld64(cx + 0x69)
					const dg = ld64(cx + 0x61)
					if ((ld64(s50) as i32) > (ld64(s38) as i32)) {
						const db = ld64(s40)
						da = ld64(db + 0x178)
						cy = ld64(db + 0x170)
						const dc = ld64(s28)
						dd = ld64(dc + 0x69)
						df = ld64(dc + 0x61)
					} else {
						st64(s38, ba)
						const cz = ld64(ld64(s28) + 0x61)
						cy = ld64(ld64(s40) + 0x170)
						da = ld64(ld64(s40) + 0x178)
						dd = da - ld64(ld64(s28) + 0x69) - (cz > cy)
						df = cy - cz
						ba = ld64(s38)
					}
					j = da - (dd + de + (df > df + dg)) - (df + dg > cy)
					bl = cy - (df + dg)
				}
			}
		} else if ((d as i32) > (ld64(s38) as i32)) {
			bl = 0
			let bm = 0
			if ((k as u32) != 0) {
				bm = ld64(ld64(s30) + 0x49)
			}
			st64(s48, bm)
			let bn = 0
			if ((k as u32) != 0) {
				bn = ld64(ld64(s30) + 0x41)
			}
			st64(s28, bn, 0, 0, 0, 0)
			const bo = memcmp(ld64(s40) + 0x80, s20, 0x20)
			di = 0
			if ((bo as u32) != 0) {
				di = ld64(ld64(s30) + 0x59)
			}
			ba = 0
			if ((bo as u32) != 0) {
				ba = ld64(ld64(s30) + 0x51)
			}
			const bp = ld64(s40)
			st64(s20, 0, 0, 0, 0)
			const bq = memcmp(bp + 0x100, s20, 0x20)
			j = 0
			if ((bq as u32) != 0) {
				j = ld64(ld64(s30) + 0x69)
			}
			an = ld64(s28)
			if ((bq as u32) != 0) {
				bl = ld64(ld64(s30) + 0x61)
			}
		} else {
			ba = 0
			an = 0
			let r = 0
			const o = ld64(s40)
			if ((k as u32) != 0) {
				const q = ld64(ld64(s30) + 0x41)
				const p = ld64(o + 0x70)
				r = ld64(o + 0x78) - ld64(ld64(s30) + 0x49) - (q > p)
				an = p - q
			}
			st64(s48, r)
			st64(s20, 0, 0, 0, 0)
			const s = memcmp(o + 0x80, s20, 0x20)
			di = 0
			if ((s as u32) != 0) {
				const u = ld64(ld64(s30) + 0x51)
				const t = ld64(o + 0xf0)
				di = ld64(o + 0xf8) - ld64(ld64(s30) + 0x59) - (u > t)
				ba = t - u
			}
			st64(s20, 0, 0, 0, 0)
			const v = memcmp(o + 0x100, s20, 0x20)
			bl = 0
			j = 0
			if ((v as u32) != 0) {
				const x = ld64(ld64(s30) + 0x61)
				const w = ld64(ld64(s40) + 0x170)
				j = ld64(ld64(s40) + 0x178) - ld64(ld64(s30) + 0x69) - (x > w)
				bl = w - x
			}
		}
	} else {
		an = 0
		j = 0
		st64(s48, 0)
		ba = 0
		di = 0
		bl = 0
		if (i != 0) {
			let bu = 0
			const l = ld64(s40)
			if ((k as u32) != 0) {
				if ((ld64(s50) as i32) > (ld64(s38) as i32)) {
					const br = ld64(s28)
					bt = ld64(br + 0x49)
					bs = ld64(br + 0x41)
				} else {
					const n = ld64(ld64(s28) + 0x41)
					const m = ld64(l + 0x70)
					bt = ld64(l + 0x78) - ld64(ld64(s28) + 0x49) - (n > m)
					bs = m - n
				}
				an = -bs
				bu = -(bt + (bs != 0))
			}
			st64(s48, bu)
			st64(s20, 0, 0, 0, 0)
			if ((memcmp(l + 0x80, s20, 0x20) as u32) != 0) {
				if ((ld64(s50) as i32) > (ld64(s38) as i32)) {
					const bx = ld64(s28)
					bz = ld64(bx + 0x59)
					by = ld64(bx + 0x51)
				} else {
					const bw = ld64(ld64(s28) + 0x51)
					const bv = ld64(l + 0xf0)
					bz = ld64(l + 0xf8) - ld64(ld64(s28) + 0x59) - (bw > bv)
					by = bv - bw
				}
				ba = -by
				di = -(bz + (by != 0))
			}
			st64(s20, 0, 0, 0, 0)
			const ca = memcmp(l + 0x100, s20, 0x20)
			bl = 0
			j = 0
			if ((ca as u32) != 0) {
				if ((ld64(s50) as i32) > (ld64(s38) as i32)) {
					const cd = ld64(s28)
					cf = ld64(cd + 0x69)
					ce = ld64(cd + 0x61)
				} else {
					const cc = ld64(ld64(s28) + 0x61)
					const cb = ld64(ld64(s40) + 0x170)
					cf = ld64(ld64(s40) + 0x178) - ld64(ld64(s28) + 0x69) - (cc > cb)
					ce = cb - cc
				}
				bl = -ce
				j = -(cf + (ce != 0))
			}
		}
	}
	const dh = ld64(s58)
	st64(dh + 0x20, bl)
	st64(dh + 0x10, ba)
	st64(dh, an)
	st64(dh + 0x28, j)
	st64(dh + 0x18, di)
	st64(dh + 8, ld64(s48))
}

function fn_485d0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64) {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s118 = fp - 0x118, s128 = fp - 0x128, s150 = fp - 0x150, s160 = fp - 0x160, s178 = fp - 0x178, s188 = fp - 0x188, s190 = fp - 0x190, s198 = fp - 0x198, s1a0 = fp - 0x1a0
	let z, aa, bg, bh, bm, bp: u64
	st64(s178, c, d)
	let f = b
	st64(s178 + 0x10, a)
	const h = ld64(b + 0x58)
	const g = p6
	st64(s150 + 0x18, g)
	const j = ld64(b + 0x50)
	const i = p5
	st64(s150 + 0x10, i)
	let u = 0
	let m = ld64(b + 0x48)
	let k = ld64(b + 0x40)
	st64(s118, p7, p8)
	let l = p9
	st64(s118 + 0x18, k)
	st64(s128, l, b)
	st64(s118 + 0x20, m)
	if ((i ^ j | g ^ h) != 0 && (k | m) != 0) {
		const n = ld64(s150 + 0x10)
		__multi3(s30, m, 0, n - j, 0)
		const o = ld64(s150 + 0x18) - h - (j > n)
		k = ld64(s118 + 0x18)
		__multi3(s20, o, 0, k, 0)
		__multi3(s10, k, 0, n - j, 0)
		m = ld64(s118 + 0x20)
		l = ld64(s128)
		const p = ld64(s10 + 8)
		const q = p + (ld64(s30) + ld64(s20))
		f = ld64(s128 + 8)
		u = (m != 0 & o != 0 | ld64(s30 + 8) != 0 | ld64(s20 + 8) != 0 | p > q) != 0 ? 0 : q
	}
	B15: {
		B7: {
			const r = k | m
			if (r != 0) {
				const t = ld64(f + 0x68)
				const s = ld64(f + 0x60)
				if ((ld64(s118) ^ s | ld64(s118 + 8) ^ t) != 0) {
					st64(s118 + 0x10, u)
					const v = ld64(s118)
					__multi3(s60, m, 0, v - s, 0)
					const w = ld64(s118 + 8) - t - (s > v)
					k = ld64(s118 + 0x18)
					__multi3(s50, w, 0, k, 0)
					__multi3(s40, k, 0, v - s, 0)
					m = ld64(s118 + 0x20)
					l = ld64(s128)
					const x = ld64(s40 + 8)
					const y = x + (ld64(s60) + ld64(s50))
					f = ld64(s128 + 8)
					aa = ld64(f + 0x70) + ld64(s118 + 0x10)
					z = ld64(f + 0x78) + ((m != 0 & w != 0 | ld64(s60 + 8) != 0 | ld64(s50 + 8) != 0 | x > y) != 0 ? 0 : y)
					break B7
				}
			}
			aa = ld64(f + 0x70) + u
			z = ld64(f + 0x78)
			if (r == 0) {
				copyr(s128, l + 0x20, 0x10)
				copyr(s150, l, 0x10)
				copyr(s160, l + 0x10, 0x10)
				bp = ld64(f + 0xc0)
				bg = ld64(f + 0x90)
				bh = ld64(f + 0xa8)
				break B15
			}
		}
		st64(s188, z, aa)
		const ad = ld64(l)
		const ab = ld64(l + 8)
		const ac = ld64(f + 0x88)
		st64(s150 + 8, ab)
		const ae = ld64(f + 0x80)
		st64(s150, ad)
		st64(s118 + 0x10, 0)
		st64(s190, ld64(f + 0x90))
		let ag = 0
		if ((ad ^ ae | ab ^ ac) != 0) {
			const af = ld64(s150)
			__multi3(s90, m, 0, af - ae, 0)
			const ah = ld64(s150 + 8) - ac - (ae > af)
			k = ld64(s118 + 0x18)
			__multi3(s80, ah, 0, k, 0)
			__multi3(s70, k, 0, af - ae, 0)
			m = ld64(s118 + 0x20)
			l = ld64(s128)
			const ai = ld64(s70 + 8)
			const aj = ai + (ld64(s90) + ld64(s80))
			f = ld64(s128 + 8)
			ag = (m != 0 & ah != 0 | ld64(s90 + 8) != 0 | ld64(s80 + 8) != 0 | ai > aj) != 0 ? 0 : aj
		}
		const am = ld64(l + 0x10)
		const ak = ld64(l + 0x18)
		const al = ld64(f + 0xa0)
		st64(s160 + 8, ak)
		const an = ld64(f + 0x98)
		st64(s160, am)
		st64(s198, ld64(f + 0xa8))
		st64(s150 + 0x20, ag)
		if ((am ^ an | ak ^ al) != 0) {
			const ao = ld64(s160)
			st64(s118 + 0x10, 0)
			__multi3(sc0, m, 0, ao - an, 0)
			const ap = ld64(s160 + 8) - al - (an > ao)
			k = ld64(s118 + 0x18)
			__multi3(sb0, ap, 0, k, 0)
			__multi3(sa0, k, 0, ao - an, 0)
			m = ld64(s118 + 0x20)
			l = ld64(s128)
			const aq = ld64(sa0 + 8)
			const ar = aq + (ld64(sc0) + ld64(sb0))
			f = ld64(s128 + 8)
			ag = ld64(s150 + 0x20)
			if ((m != 0 & ap != 0 | ld64(sc0 + 8) != 0 | ld64(sb0 + 8) != 0 | aq > ar) == 0) {
				st64(s118 + 0x10, ar)
			}
		}
		const av = ld64(l + 0x20)
		const at = ld64(l + 0x28)
		const au = ld64(f + 0xb8)
		st64(s128 + 8, at)
		const aw = ld64(f + 0xb0)
		st64(s128, av)
		let bd = 0
		let ax = ld64(f + 0xc0)
		if ((av ^ aw | at ^ au) != 0) {
			st64(s1a0, ax)
			const ay = ld64(s128)
			__multi3(sf0, m, 0, ay - aw, 0)
			const az = ld64(s128 + 8) - au - (aw > ay)
			const ba = ld64(s118 + 0x18)
			__multi3(se0, az, 0, ba, 0)
			__multi3(sd0, ba, 0, ay - aw, 0)
			ax = ld64(s1a0)
			k = ld64(s118 + 0x18)
			const bb = ld64(sd0 + 8)
			const bc = bb + (ld64(sf0) + ld64(se0))
			ag = ld64(s150 + 0x20)
			bd = (ld64(s118 + 0x20) != 0 & az != 0 | ld64(sf0 + 8) != 0 | ld64(se0 + 8) != 0 | bb > bc) != 0 ? 0 : bc
		}
		bg = ag + ld64(s190)
		bh = ld64(s118 + 0x10) + ld64(s198)
		bp = bd + ax
		aa = ld64(s188 + 8)
		z = ld64(s188)
	}
	const be = ld64(s178)
	const bf = ld64(s178 + 8)
	if ((be | bf) != 0) {
		st64(s150 + 0x20, bg)
		st64(s118 + 0x10, bh)
		if ((bf != 0 ? 0 > (bf as i64) : be == 0) != 0) {
			const bn = bf + (be != 0)
			const bo = -bn > ld64(s118 + 0x20)
			if (((ld64(s118 + 0x20) != -bn ? bo : -be > k) & 1) != 0) {
				bm = ld64(s178 + 0x10)
				st32(bm + 4, 0xf)
				st32(bm, 1)
				return
			}
			st64(s118 + 0x20, ld64(s118 + 0x20) + bf + (k > k + be))
			k = k + be
		} else {
			const bi = k
			let bk = k > k + be
			const bj = ld64(s118 + 0x20)
			const bl = bj + bf + bk
			bk = bl != bj ? bj > bl : bk
			if ((bk & 1) != 0) {
				bm = ld64(s178 + 0x10)
				st32(bm + 4, 0xe)
				st32(bm, 1)
				return
			}
			k = bi + be
			st64(s118 + 0x20, bl)
		}
		bg = ld64(s150 + 0x20)
		bh = ld64(s118 + 0x10)
	}
	bm = ld64(s178 + 0x10)
	st64(bm + 0x78, ld64(s128))
	st64(bm + 0x60, ld64(s160))
	st64(bm + 0x48, ld64(s150))
	st64(bm + 0x28, ld64(s118))
	st64(bm + 0x18, ld64(s150 + 0x10))
	st64(bm + 8, k)
	st64(bm + 0x88, bp)
	st64(bm + 0x70, bh)
	st64(bm + 0x58, bg)
	st64(bm + 0x40, z)
	st64(bm + 0x38, aa)
	st64(bm + 0x80, ld64(s128 + 8))
	st64(bm + 0x68, ld64(s160 + 8))
	st64(bm + 0x50, ld64(s150 + 8))
	st64(bm + 0x30, ld64(s118 + 8))
	st64(bm + 0x20, ld64(s150 + 0x18))
	st64(bm + 0x10, ld64(s118 + 0x20))
	st32(bm, 0)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_147238(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	fn_1478b8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_1478b8(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	custom_panic(a, b, c, d, e)
	abort()
}
