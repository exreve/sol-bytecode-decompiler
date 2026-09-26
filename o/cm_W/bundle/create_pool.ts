// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction create_pool: handler + 56 reachable functions
// typed views: x.field is exactly the load / store / address given by the field declaration
type at<Offset extends number, T> = T // view field: a T at byte offset Offset of the object (x.f: scalar = its load, ref<U> = the loaded pointer, other = its address)
type ref<T> = T                        // view field holding a pointer (8 bytes) to a T
interface sized<Size extends number> {} // a view of that many bytes: x[k] is the k-th such object from x (at x + k * Size)
interface Pubkey {} // 32-byte public key (a Pubkey value is its address)
interface bytes {} // byte array in place (a bytes value is its address)
interface u128 {} // 128-bit integer in place (value = its address)
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
interface CreatePoolAccounts { // Accounts struct of instruction create_pool as accounts_create_pool returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	pool_creator: at<0x00, ref<AccountInfo>>
	pool_state:   at<0x10, ref<AccountInfo>>
}
interface CreatePoolContext { // anchor_lang Context of instruction create_pool (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<CreatePoolAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface CreatePoolArgs extends sized<0x18> { // arguments of instruction create_pool (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	sqrt_price_x64: at<0x00, u128>
	open_time:      at<0x10, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_log_data(slices: u64, len: u64): void // log base64 data: slices = &[&[u8]]
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function sol_memset(dst: u64, byte: u64, n: u64): void // memset
declare function try_accounts_120(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_15c0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_1730(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_e948(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib uses Mint_unpack_from_slice_137968, raw_vec_handle_error, memset2, memcmp
declare function AccountInfo_clone_f338(a: u64, b: u64): u64 // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function ptr_drop_in_place_fcd8(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<solana_account_info::AccountInfo>
declare function Rc_drop_slow_14df0(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function try_accounts_17a30(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_17ae0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_184d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_18870(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function Rc_drop_slow_125dd0(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function Rc_drop_slow_125e20(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function fn_128fe0(a: u64, b: u64): u64 // lib uses memcpy, Rc_drop_slow_125dd0, Rc_drop_slow_125e20
declare function fn_12c9e0(a: u64, b: u64): u64 // lib uses memcpy, Rc_drop_slow_125dd0, Rc_drop_slow_125e20
declare function fn_132c40(a: u64, b: u64, c: u64, r0: u64): u64 // lib
declare function fn_1334b0(a: u64, b: u64): u64 // lib uses __rust_alloc, raw_vec_handle_error, reserve_do_reserve_and_handle_131e08, memcpy
declare function Error_new_13c880(): u64 // lib std::io::error::Error::new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function Error_with_pubkeys(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib anchor_lang::error::Error::with_pubkeys
declare function system_program_assign_13fb30(a: u64, b: u64, c: u64): u64 // lib anchor_lang::system_program::assign
declare function system_program_assign_13ff40(a: u64, b: u64, c: u64): u64 // lib anchor_lang::system_program::assign
declare function system_program_create_account(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib anchor_lang::system_program::create_account
declare function system_program_transfer(a: u64, b: u64, c: u64): u64 // lib anchor_lang::system_program::transfer
declare function ErrorCode_name(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib anchor_lang::error::ErrorCode::name
declare function ErrorCode_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::error::ErrorCode as core::fmt::Display>::fmt
declare function invoke_signed(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcmp, AccountInfo_try_borrow_lamports, AccountInfo_try_borrow_data, sol_invoke_signed_rust, …
declare function clock_get(a: u64): u64 // lib solana_sysvar::clock::<impl solana_sysvar::Sysvar for solana_clock::Clock>::get
declare function rent_get(a: u64): u64 // lib solana_sysvar::rent::<impl solana_sysvar::Sysvar for solana_rent::Rent>::get
declare function fn_142b40(a: u64): void // lib uses memset2, sol_get_return_data, __rust_alloc, raw_vec_handle_error, …
declare function Rent_is_exempt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib solana_rent::Rent::is_exempt
declare function AccountInfo_try_data_len(a: u64, b: u64): void // lib solana_account_info::AccountInfo::try_data_len
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function de_unexpected_eof_to_unexpected_length_of_input(a: u64): u64 // lib borsh::de::unexpected_eof_to_unexpected_length_of_input
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fmt_write(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::write
declare function imp__fmt_155760(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u64>::_fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function cmp___gedf2(a: u64, b: u64): u64 // lib compiler_builtins::float::cmp::__gedf2
declare function mul_mul(a: u64, b: u64): u64 // lib compiler_builtins::float::mul::mul
declare function fn_158408(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib
declare function __floatundidf(a: u64): u64 // lib __floatundidf
declare function __fixunsdfdi(a: u64): u64 // lib __fixunsdfdi
declare function __multi3_158e18(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib __multi3
declare function __multi3_158fe8(a: u64, b: u64, c: u64, d: u64): void // lib __multi3
declare function __multi3_159030(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __multi3

// instruction handler: create_pool (discriminator sha256("global:create_pool")[..8] = 0xbc4068cf8ed192e9)
// accounts [idl]: 0 pool_creator [signer, mut], 1 amm_config, 2 pool_state [mut, pda], 3 token_mint_0, 4 token_mint_1, 5 token_vault_0 [mut, pda], 6 token_vault_1 [mut, pda], 7 observation_state [mut, pda], 8 tick_array_bitmap [mut, pda], 9 token_program_0, 10 token_program_1, 11 system_program [= 11111111111111111111111111111111], 12 rent [= SysvarRent111111111111111111111111111111111]
// args [idl]: sqrt_price_x64: u128, open_time: u64
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, open_time
function ix_create_pool(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s68 = fp - 0x68, s70 = fp - 0x70, s80 = fp - 0x80, se8 = fp - 0xe8, s100 = fp - 0x100, s110 = fp - 0x110, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, sff8 = fp - 0xff8
	let k, o: u64
	const h = sol_log("Instruction: CreatePool", 0x17)
	const f = ix_args_len
	if (f >= 0x10 && (f & -8) != 0x10) {
		const args: CreatePoolArgs = ix_args
		const open_time = args.open_time
		const p = ld64(args.sqrt_price_x64)
		const q = ld64(args.sqrt_price_x64 + 8)
		st8(s118 + 4, -1)
		st32(s118, -1)
		st64(s110, accounts, accounts_len)
		st64(sff8, s118)
		o = accounts_create_pool(s80, program_id, s110, undef, fp, h)
		const j = ld64(s70)
		k = ld64(s80 + 8)
		const i = ld64(s80)
		if (i == 0) {
			st64(a + 8, j)
			st64(a, k)
			return o
		}
		const l = memcpy(se8, s68, 0x68)
		st64(s100, i, k, j)
		st32(s68 + 8, ld32(s118))
		st8(s68 + 0xc, ld8(s118 + 4))
		copyr(s70, s110, 0x10)
		st64(s80, program_id, s100)
		o = fn_1a610(s128, s80, p, q, open_time, l)
		k = ld64(s128)
		if (k == 2) {
			o = fn_f6fe8(s138, s100, program_id)
			k = ld64(s138)
			st64(a + 8, ld64(s138 + 8))
			st64(a, k)
			return o
		}
		st64(a + 8, ld64(s128 + 8))
		st64(a, k)
		return o
	}
	const m = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (m & 3) - 2) {
		o = anchor_error_from(s148, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s148)
		st64(a + 8, ld64(s148 + 8))
		st64(a, k)
		return o
	}
	if ((m & 3) == 0) {
		o = anchor_error_from(s148, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s148)
		st64(a + 8, ld64(s148 + 8))
		st64(a, k)
		return o
	}
	const n = ld64(ld64(m + 7))
	if (n == 0) {
		o = anchor_error_from(s148, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s148)
		st64(a + 8, ld64(s148 + 8))
		st64(a, k)
		return o
	}
	callx(n, ld64(m - 1), n)
	o = anchor_error_from(s148, 0x66 /* anchor::InstructionDidNotDeserialize */)
	k = ld64(s148)
	st64(a + 8, ld64(s148 + 8))
	st64(a, k)
	return o
}

// Anchor Accounts::try_accounts of instruction create_pool (called by ix_create_pool; name [str]: from the handler's "Instruction: …" log; was fn_88c30)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_vault_0 (AccountNotEnoughKeys, ConstraintSeeds, ConstraintMut), token_vault_1 (AccountNotEnoughKeys, ConstraintSeeds, ConstraintMut), token_program_0, token_program_1, system_program, rent, token_mint_0 (ConstraintRaw), pool_creator (ConstraintMut), tick_array_bitmap (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), observation_state (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), pool_state (ConstraintSeeds, ConstraintMut, ConstraintRentExempt)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: pool_creator [idl], pool_state [idl]
function accounts_create_pool(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s50 = fp - 0x50, s60 = fp - 0x60, s78 = fp - 0x78, s80 = fp - 0x80, sa0 = fp - 0xa0, sc0 = fp - 0xc0, se0 = fp - 0xe0, s100 = fp - 0x100, s120 = fp - 0x120, s140 = fp - 0x140, s170 = fp - 0x170, s190 = fp - 0x190, s191 = fp - 0x191, s1b8 = fp - 0x1b8, s1d0 = fp - 0x1d0, s1f0 = fp - 0x1f0, s210 = fp - 0x210, s211 = fp - 0x211, s238 = fp - 0x238, s250 = fp - 0x250, s268 = fp - 0x268, s270 = fp - 0x270, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2b1 = fp - 0x2b1, s2d8 = fp - 0x2d8, s2f0 = fp - 0x2f0, s308 = fp - 0x308, s310 = fp - 0x310, s318 = fp - 0x318, s320 = fp - 0x320, s328 = fp - 0x328, s330 = fp - 0x330, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s598 = fp - 0x598, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s5c8 = fp - 0x5c8, s5d8 = fp - 0x5d8, s5e8 = fp - 0x5e8, s5f8 = fp - 0x5f8, s608 = fp - 0x608, s618 = fp - 0x618, s628 = fp - 0x628, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s668 = fp - 0x668, s678 = fp - 0x678, s688 = fp - 0x688, s698 = fp - 0x698, s6d8 = fp - 0x6d8, s700 = fp - 0x700, s708 = fp - 0x708, s710 = fp - 0x710, s718 = fp - 0x718, s720 = fp - 0x720
	let h, u, x, ad, ae, af, ah, al, am, ao, ap, ar, at, bt, bu: u64
	st64(s338, b)
	let y = try_accounts_17a30(s80, c, c, d, e, r0)
	const pool_creator: AccountInfo = ld64(s78)
	let f = ld64(s80)
	if (f == 2) {
		const m = ld64(e - 0xff8)
		st64(s330, pool_creator)
		y = try_accounts_184d8(s80, c)
		if (ld64(s80) == 0) {
			const s = ld64(0x300000000 /* heap bump-allocator cursor */)
			f = ld64(s78)
			const t = s != 0 ? sat_sub(s, 0xa) : 0x300007ff6
			u = ld64(s78 + 8)
			if (f != 0) {
				if (0x300000008 > t) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, t)
				st64(t, 0x666e6f635f6d6d61)
				st16(t + 8, 0x6769)
				void ld64(u)
			} else {
				if (0x300000008 > t) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, t)
				st64(t, 0x666e6f635f6d6d61)
				st16(t + 8, 0x6769)
				void ld64(u)
			}
			st64(u + 0x10, t, 0xa)
			st64(u + 8, 0xa)
			st64(u, 1)
			st64(a + 0x10, u)
			st64(a + 8, f)
			st64(a, 0)
			return y
		}
		const l = ld64(0x300000000 /* heap bump-allocator cursor */)
		st64(s6d8 + 0x38, m)
		const n = l != 0 ? sat_sub(l, 0x78) : 0x300007f88
		if (0x300000008 > n) {
			alloc_handle_alloc_error(8, 0x78)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, n & -8)
		if ((n & -8) != 0) {
			memcpy(n & -8, s80, 0x78)
			const o = ld64(c + 8)
			if (o == 0) {
				y = anchor_error_from(s698, 0xbbd /* anchor::AccountNotEnoughKeys */)
				f = ld64(s698)
				st64(a + 0x10, ld64(s698 + 8))
				st64(a + 8, f)
				st64(a, 0)
				return y
			}
			const p: AccountInfo = ld64(c)
			st64(s328, p)
			st64(c + 8, o - 1)
			st64(s6d8 + 0x30, p)
			st64(c, p + 0x30)
			y = try_accounts_15c0(s80, c)
			h = undef
			if (ld32(s80) == 2) {
				const w = ld64(0x300000000 /* heap bump-allocator cursor */)
				f = ld64(s78)
				x = w != 0 ? sat_sub(w, 0xc) : 0x300007ff4
				u = ld64(s78 + 8)
				if (f != 0) {
					if (0x300000008 > x) {
						raw_vec_handle_error(1, 0xc, 0x10015f8f8, 0x300000008, h)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, x)
					st64(x, 0x696d5f6e656b6f74)
					st32(x + 8, 0x305f746e)
					void ld64(u)
				} else {
					if (0x300000008 > x) {
						raw_vec_handle_error(1, 0xc, 0x10015f8f8, 0x300000008, h)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, x)
					st64(x, 0x696d5f6e656b6f74)
					st32(x + 8, 0x305f746e)
					void ld64(u)
				}
			} else {
				const q = ld64(0x300000000 /* heap bump-allocator cursor */)
				const r = q != 0 ? sat_sub(q, 0x80) : 0x300007f80
				if (0x300000008 > r) {
					alloc_handle_alloc_error(8, 0x80)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, r & -8)
				if ((r & -8) == 0) {
					alloc_handle_alloc_error(8, 0x80)
				}
				st64(s6d8 + 0x28, r & -8)
				memcpy(r & -8, s80, 0x80)
				y = try_accounts_15c0(s80, c)
				h = undef
				if (ld32(s80) != 2) {
					const z = ld64(0x300000000 /* heap bump-allocator cursor */)
					const aa = z != 0 ? sat_sub(z, 0x80) : 0x300007f80
					if (0x300000008 > aa) {
						alloc_handle_alloc_error(8, 0x80)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, aa & -8)
					if ((aa & -8) != 0) {
						B47: {
							B37: {
								st64(s6d8 + 0x20, aa & -8)
								memcpy(aa & -8, s80, 0x80)
								const ac = ld64(c + 8)
								if (ac == 0) {
									anchor_error_from(s348, 0xbbd /* anchor::AccountNotEnoughKeys */, undef, ae, af)
									u = ld64(s348 + 8)
									const ai = ld64(s348)
									if (ai == 2) {
										break B37
									}
									y = fn_4130(s358, ai, u, "token_vault_0", 0xd)
									u = ld64(s358 + 8)
									f = ld64(s358)
									if (f != 2) {
										st64(a + 0x10, u)
										st64(a + 8, f)
										st64(a, 0)
										return y
									}
									ad = ld64(c + 8)
									if (ad == 0) {
										break B37
									}
								} else {
									u = ld64(c)
									st64(c, u + 0x30)
									ad = ac - 1
									st64(c + 8, ad)
									if (ad == 0) {
										break B37
									}
								}
								st64(s6d8 + 0x18, u)
								u = ld64(c)
								st64(c, u + 0x30)
								ah = ad - 1
								st64(c + 8, ah)
								if (ah == 0) {
									y = anchor_error_from(s688, 0xbbd /* anchor::AccountNotEnoughKeys */, u, ae, af)
									f = ld64(s688)
									st64(a + 0x10, ld64(s688 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return y
								}
								break B47
							}
							st64(s6d8 + 0x18, u)
							anchor_error_from(s368, 0xbbd /* anchor::AccountNotEnoughKeys */, u, ae, af)
							u = undef
							const ag = ld64(s368)
							if (ag == 2) {
								y = anchor_error_from(s688, 0xbbd /* anchor::AccountNotEnoughKeys */, u, ae, af)
								f = ld64(s688)
								st64(a + 0x10, ld64(s688 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return y
							}
							y = fn_4130(s378, ag, ld64(s368 + 8), "token_vault_1", 0xd)
							u = ld64(s378 + 8)
							f = ld64(s378)
							if (f != 2) {
								st64(a + 0x10, u)
								st64(a + 8, f)
								st64(a, 0)
								return y
							}
							ah = ld64(c + 8)
							if (ah == 0) {
								y = anchor_error_from(s688, 0xbbd /* anchor::AccountNotEnoughKeys */, u, ae, af)
								f = ld64(s688)
								st64(a + 0x10, ld64(s688 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return y
							}
						}
						const aj: AccountInfo = ld64(c)
						st64(s320, aj)
						st64(c + 8, ah - 1)
						st64(c, aj + 0x30)
						if (ah != 1) {
							st64(s6d8, u, aj + 0x30)
							st64(s318, aj + 0x30)
							st64(c + 8, ah - 2)
							st64(s6d8 + 0x10, aj)
							st64(c, aj + 0x60)
							try_accounts_120(s80, c, u, aj + 0x30, aj)
							u = ld64(s78)
							const ak = ld64(s80)
							if (ak != 2) {
								y = fn_4130(s388, ak, u, "token_program_0", 0xf)
								u = ld64(s388 + 8)
								f = ld64(s388)
								if (f != 2) {
									st64(a + 0x10, u)
									st64(a + 8, f)
									st64(a, 0)
									return y
								}
							}
							st64(s700 + 0x20, u)
							try_accounts_120(s80, c, u, al, am)
							u = ld64(s78)
							const an = ld64(s80)
							if (an != 2) {
								y = fn_4130(s398, an, u, "token_program_1", 0xf)
								u = ld64(s398 + 8)
								f = ld64(s398)
								if (f != 2) {
									st64(a + 0x10, u)
									st64(a + 8, f)
									st64(a, 0)
									return y
								}
							}
							st64(s700 + 0x18, u)
							try_accounts_18870(s80, c, u, ao, ap)
							u = ld64(s78)
							const aq = ld64(s80)
							if (aq != 2) {
								y = fn_4130(s3a8, aq, u, "system_program", 0xe)
								u = ld64(s3a8 + 8)
								f = ld64(s3a8)
								if (f != 2) {
									st64(a + 0x10, u)
									st64(a + 8, f)
									st64(a, 0)
									return y
								}
							}
							st64(s700 + 0x10, u)
							st64(s310, u)
							try_accounts_17ae0(s80, c, u, ar, at)
							const aw = ld64(s78 + 8)
							const av = ld64(s78)
							const au = ld64(s80)
							if (au == 0) {
								y = fn_4130(s668, av, aw, 0x1001598f8 /* "rent" */, 4)
								f = ld64(s668)
								st64(a + 0x10, ld64(s668 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return y
							}
							st64(s700, au, av)
							st64(s708, ld64(s78 + 0x10))
							rent_get(s80)
							copy(s2f0, s78, 0x18)
							if (ld64(s80) != 0) {
								y = fn_13e628(s658, s2f0)
								f = ld64(s658)
								st64(a + 0x10, ld64(s658 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return y
							}
							st64(s710, aw)
							copyr(s308, s2f0, 0x18)
							const ax = ld64(ld64(n & -8))
							copyr(s2b0, ax, 0x20)
							const ay = ld64(ld64(ld64(s6d8 + 0x28) + 0x58))
							copyr(se0, ay, 0x20)
							const az = ld64(s6d8 + 0x20)
							const ba = ld64(ld64(az + 0x58))
							const be = ld64(ba)
							const bd = ld64(ba + 8)
							const bc = ld64(ba + 0x10)
							const bb = ld64(ba + 0x18)
							st64(s80, 0x10015984c)
							st64(s78 + 8, s2b0)
							st64(s60, se0)
							st64(s50, sc0)
							st64(sc0, be, bd, bc, bb)
							st64(s78, 4)
							st64(s78 + 0x10, 0x20)
							st64(s60 + 8, 0x20)
							st64(s50 + 8, 0x20)
							// PDA find_program_address(["pool", *ax, *ay, *sc0], program *(ld64(s338)))
							Pubkey_find_program_address(s170, s80, 4, ld64(s338))
							copyr(s2d8, s170, 0x20)
							const bf = ld8(s170 + 0x20)
							st8(s2b1, bf)
							st8(ld64(s6d8 + 0x38), bf)
							const bg = ld64(ld64(s6d8 + 0x30) /* key */)
							copyr(s290, bg, 0x20)
							if ((memcmp(s290, s2d8, 0x20) as u32) == 0) {
								st64(s50, az, s2b1, s338)
								st64(s60 + 8, ld64(s6d8 + 0x28))
								st64(s80, s328, s308, s330, s310, n & -8)
								y = fn_8c030(s170, s80)
								const pool_state: AccountInfo = ld64(s170 + 8)
								f = ld64(s170)
								if (f == 2) {
									st64(s270, pool_state)
									if (pool_state.is_writable != 0) {
										st64(s718, pool_state)
										AccountInfo_clone_f338(s170, pool_state)
										st64(s6d8 + 0x30, fn_147a20(s170))
										AccountInfo_clone_f338(s80, ld64(s270))
										AccountInfo_try_data_len(sc0, s80)
										const bl = ld64(sc0 + 8)
										const bk = ld64(sc0)
										if (bk == 0x800000000000001a /* Ok */) {
											const bm = Rent_is_exempt(s308, ld64(s6d8 + 0x30), bl)
											ptr_drop_in_place_fcd8(s170, ptr_drop_in_place_fcd8(s80, bm))
											if (bm != 0) {
												rent_get(s80)
												copy(s250, s78, 0x18)
												if (ld64(s80) != 0) {
													y = fn_13e628(s648, s250)
													f = ld64(s648)
													st64(a + 0x10, ld64(s648 + 8))
													st64(a + 8, f)
													st64(a, 0)
													return y
												}
												copyr(s268, s250, 0x18)
												const bn = ld64(ld64(s718))
												copyr(s210, bn, 0x20)
												st64(s170, 0x10015afbf, 0xb, s210, 0x20)
												// PDA find_program_address(["observation", *bn], program *(ld64(s338)))
												Pubkey_find_program_address(s80, s170, 2, ld64(s338))
												copyr(s238, s80, 0x20)
												const bo = ld8(s60)
												st8(s211, bo)
												st8(ld64(s6d8 + 0x38) + 3, bo)
												const bp = ld64(ld64(s6d8 + 0x10) /* key */)
												copyr(s1f0, bp, 0x20)
												if ((memcmp(s1f0, s238, 0x20) as u32) == 0) {
													st64(s80, s320, s268, s330, s310, s270, s211, s338)
													y = fn_8dc68(s170, s80)
													st64(s6d8 + 0x30, ld64(s170 + 8))
													f = ld64(s170)
													if (f == 2) {
														if (ld8(ld64(s6d8 + 0x30) + 0x29 /* is_writable */) != 0) {
															AccountInfo_clone_f338(s170, ld64(s6d8 + 0x30))
															st64(s6d8 + 0x10, fn_147a20(s170))
															AccountInfo_clone_f338(s80, ld64(s6d8 + 0x30))
															AccountInfo_try_data_len(sc0, s80)
															const bw = ld64(sc0 + 8)
															const bv = ld64(sc0)
															if (bv != 0x800000000000001a /* Ok */) {
																st64(sc0 + 0x10, ld64(sc0 + 0x10))
																st64(sc0, bv, bw)
																bu = fn_13e628(s488, sc0)
																bt = ld64(s488)
																st64(a + 0x10, ld64(s488 + 8))
																st64(a + 8, bt)
																st64(a, 0)
																return ptr_drop_in_place_fcd8(s170, ptr_drop_in_place_fcd8(s80, bu))
															}
															const bx = Rent_is_exempt(s268, ld64(s6d8 + 0x10), bw)
															ptr_drop_in_place_fcd8(s170, ptr_drop_in_place_fcd8(s80, bx))
															if (bx != 0) {
																rent_get(s80)
																copy(s1d0, s78, 0x18)
																if (ld64(s80) != 0) {
																	y = fn_13e628(s638, s1d0)
																	f = ld64(s638)
																	st64(a + 0x10, ld64(s638 + 8))
																	st64(a + 8, f)
																	st64(a, 0)
																	return y
																}
																copyr(s2b0, s1d0, 0x18)
																st64(sc0 + 0x10, s170)
																st64(sc0, 0x1001595c0)
																copyr(s170, s210, 0x20)
																st64(sc0 + 0x18, 0x20)
																st64(sc0 + 8, 0x20)
																// PDA find_program_address(["pool_tick_array_bitmap_extension", *s170], program *(ld64(s338)))
																Pubkey_find_program_address(s80, sc0, 2, ld64(s338))
																copyr(s1b8, s80, 0x20)
																const by = ld8(s60)
																st8(s191, by)
																st8(ld64(s6d8 + 0x38) + 4, by)
																const bz = ld64(ld64(s6d8 + 8))
																copyr(s190, bz, 0x20)
																if ((memcmp(s190, s1b8, 0x20) as u32) == 0) {
																	st64(s80, s318, s2b0, s330, s310, s270, s191, s338)
																	y = fn_8f680(s170, s80)
																	st64(s6d8 + 0x10, ld64(s170 + 8))
																	f = ld64(s170)
																	if (f == 2) {
																		if (ld8(ld64(s6d8 + 0x10) + 0x29 /* is_writable */) != 0) {
																			AccountInfo_clone_f338(s170, ld64(s6d8 + 0x10))
																			st64(s6d8 + 8, fn_147a20(s170))
																			AccountInfo_clone_f338(s80, ld64(s6d8 + 0x10))
																			AccountInfo_try_data_len(sc0, s80)
																			const ce = ld64(sc0 + 8)
																			const cd = ld64(sc0)
																			if (cd != 0x800000000000001a /* Ok */) {
																				st64(sc0 + 0x10, ld64(sc0 + 0x10))
																				st64(sc0, cd, ce)
																				bu = fn_13e628(s508, sc0)
																				bt = ld64(s508)
																				st64(a + 0x10, ld64(s508 + 8))
																				st64(a + 8, bt)
																				st64(a, 0)
																				return ptr_drop_in_place_fcd8(s170, ptr_drop_in_place_fcd8(s80, bu))
																			}
																			const cf = Rent_is_exempt(s2b0, ld64(s6d8 + 8), ce)
																			ptr_drop_in_place_fcd8(s170, ptr_drop_in_place_fcd8(s80, cf))
																			if (cf != 0) {
																				if (pool_creator.is_writable != 0) {
																					const cg = ld64(ld64(s6d8 + 0x28) + 0x58)
																					st64(s6d8 + 8, cg)
																					const ch = ld64(cg)
																					copyr(s170, ch, 0x20)
																					const ci = ld64(ld64(s6d8 + 0x20) + 0x58)
																					st64(s720, ci)
																					const cj = ld64(ci)
																					copyr(s80, cj, 0x20)
																					if ((memcmp(s170, s80, 0x20) as i32) < 0) {
																						const ck = ld64(ld64(s700 + 0x20))
																						copyr(s80, ck, 0x20)
																						if ((memcmp(ld64(ld64(s6d8 + 8) + 0x18), s80, 0x20) as u32) != 0) {
																							y = anchor_error_from(s578, 0x7e6 /* anchor::ConstraintMintTokenProgram */)
																							f = ld64(s578)
																							st64(a + 0x10, ld64(s578 + 8))
																							st64(a + 8, f)
																							st64(a, 0)
																							return y
																						}
																						const cl = ld64(ld64(s700 + 0x18))
																						copyr(s80, cl, 0x20)
																						if ((memcmp(ld64(ld64(s720) + 0x18), s80, 0x20) as u32) == 0) {
																							copyr(se0, s210, 0x20)
																							copyr(sc0, ch, 0x20)
																							st64(s80, 0x100159d89, 0xa, se0, 0x20, sc0, 0x20)
																							// PDA find_program_address(["pool_vault", *se0, *ch], program *(ld64(s338)))
																							Pubkey_find_program_address(s170, s80, 3, ld64(s338))
																							copyr(s140, s170, 0x20)
																							st8(ld64(s6d8 + 0x38) + 1, ld8(s170 + 0x20))
																							const cm = ld64(ld64(s6d8 + 0x18) /* key */)
																							copyr(s120, cm, 0x20)
																							if ((memcmp(s120, s140, 0x20) as u32) == 0) {
																								if (ld8(ld64(s6d8 + 0x18) + 0x29 /* is_writable */) != 0) {
																									copyr(se0, s210, 0x20)
																									const cq = ld64(ld64(ld64(s6d8 + 0x20) + 0x58))
																									const cu = ld64(cq)
																									const ct = ld64(cq + 8)
																									const cs = ld64(cq + 0x10)
																									const cr = ld64(cq + 0x18)
																									st64(s80, 0x100159d89)
																									st64(s78 + 8, se0)
																									st64(s60, sc0)
																									st64(sc0, cu, ct, cs, cr)
																									st64(s78, 0xa)
																									st64(s78 + 0x10, 0x20)
																									st64(s60 + 8, 0x20)
																									// PDA find_program_address(["pool_vault", *se0, *sc0], program *(ld64(s338)))
																									Pubkey_find_program_address(s170, s80, 3, ld64(s338))
																									copyr(s100, s170, 0x20)
																									st8(ld64(s6d8 + 0x38) + 2, ld8(s170 + 0x20))
																									const cv = ld64(ld64(s6d8) /* key */)
																									copyr(sa0, cv, 0x20)
																									y = memcmp(sa0, s100, 0x20) as u32
																									if (y != 0) {
																										anchor_error_from(s5e8, 0x7d6 /* anchor::ConstraintSeeds */)
																										const cy = fn_4130(s5f8, ld64(s5e8), ld64(s5e8 + 8), "token_vault_1", 0xd)
																										const cx = ld64(s5f8 + 8)
																										const cw = ld64(s5f8)
																										copyr(s80, sa0, 0x20)
																										copy(s60, s100, 0x20)
																										y = Error_with_pubkeys(s608, cw, cx, s80, cy)
																										f = ld64(s608)
																										st64(a + 0x10, ld64(s608 + 8))
																										st64(a + 8, f)
																										st64(a, 0)
																										return y
																									}
																									if (ld8(ld64(s6d8) + 0x29 /* is_writable */) != 0) {
																										st64(a + 0x78, ld64(s708))
																										st64(a + 0x70, ld64(s710))
																										st64(a + 0x68, ld64(s700 + 8))
																										st64(a + 0x60, ld64(s700))
																										st64(a + 0x58, ld64(s700 + 0x10))
																										st64(a + 0x50, ld64(s700 + 0x18))
																										st64(a + 0x48, ld64(s700 + 0x20))
																										st64(a + 0x40, ld64(s6d8 + 0x10))
																										st64(a + 0x38, ld64(s6d8 + 0x30))
																										st64(a + 0x30, ld64(s6d8))
																										st64(a + 0x28, ld64(s6d8 + 0x18))
																										st64(a + 0x20, ld64(s6d8 + 0x20))
																										st64(a + 0x18, ld64(s6d8 + 0x28))
																										st64(a + 0x10, ld64(s718))
																										st64(a + 8, n & -8)
																										st64(a, pool_creator)
																										return y
																									}
																									anchor_error_from(s618, 0x7d0 /* anchor::ConstraintMut */)
																									y = fn_4130(s628, ld64(s618), ld64(s618 + 8), "token_vault_1", 0xd)
																									f = ld64(s628)
																									st64(a + 0x10, ld64(s628 + 8))
																									st64(a + 8, f)
																									st64(a, 0)
																									return y
																								}
																								anchor_error_from(s5c8, 0x7d0 /* anchor::ConstraintMut */)
																								y = fn_4130(s5d8, ld64(s5c8), ld64(s5c8 + 8), "token_vault_0", 0xd)
																								f = ld64(s5d8)
																								st64(a + 0x10, ld64(s5d8 + 8))
																								st64(a + 8, f)
																								st64(a, 0)
																								return y
																							}
																							anchor_error_from(s598, 0x7d6 /* anchor::ConstraintSeeds */)
																							const cp = fn_4130(s5a8, ld64(s598), ld64(s598 + 8), "token_vault_0", 0xd)
																							const co = ld64(s5a8 + 8)
																							const cn = ld64(s5a8)
																							copyr(s80, s120, 0x20)
																							copy(s60, s140, 0x20)
																							y = Error_with_pubkeys(s5b8, cn, co, s80, cp)
																							f = ld64(s5b8)
																							st64(a + 0x10, ld64(s5b8 + 8))
																							st64(a + 8, f)
																							st64(a, 0)
																							return y
																						}
																						y = anchor_error_from(s588, 0x7e6 /* anchor::ConstraintMintTokenProgram */)
																						f = ld64(s588)
																						st64(a + 0x10, ld64(s588 + 8))
																						st64(a + 8, f)
																						st64(a, 0)
																						return y
																					}
																					anchor_error_from(s558, 0x7d3 /* anchor::ConstraintRaw */)
																					y = fn_4130(s568, ld64(s558), ld64(s558 + 8), "token_mint_0", 0xc)
																					f = ld64(s568)
																					st64(a + 0x10, ld64(s568 + 8))
																					st64(a + 8, f)
																					st64(a, 0)
																					return y
																				}
																				anchor_error_from(s538, 0x7d0 /* anchor::ConstraintMut */)
																				y = fn_4130(s548, ld64(s538), ld64(s538 + 8), "pool_creator", 0xc)
																				f = ld64(s548)
																				st64(a + 0x10, ld64(s548 + 8))
																				st64(a + 8, f)
																				st64(a, 0)
																				return y
																			}
																			anchor_error_from(s518, 0x7d5 /* anchor::ConstraintRentExempt */)
																			y = fn_4130(s528, ld64(s518), ld64(s518 + 8), 0x10015afdb /* "tick_array_bitmap" */, 0x11)
																			f = ld64(s528)
																			st64(a + 0x10, ld64(s528 + 8))
																			st64(a + 8, f)
																			st64(a, 0)
																			return y
																		}
																		anchor_error_from(s4e8, 0x7d0 /* anchor::ConstraintMut */)
																		y = fn_4130(s4f8, ld64(s4e8), ld64(s4e8 + 8), 0x10015afdb /* "tick_array_bitmap" */, 0x11)
																		f = ld64(s4f8)
																		st64(a + 0x10, ld64(s4f8 + 8))
																		st64(a + 8, f)
																		st64(a, 0)
																		return y
																	}
																	st64(a + 0x10, ld64(s6d8 + 0x10))
																	st64(a + 8, f)
																	st64(a, 0)
																	return y
																}
																anchor_error_from(s4b8, 0x7d6 /* anchor::ConstraintSeeds */)
																const cc = fn_4130(s4c8, ld64(s4b8), ld64(s4b8 + 8), 0x10015afdb /* "tick_array_bitmap" */, 0x11)
																const cb = ld64(s4c8 + 8)
																const ca = ld64(s4c8)
																copyr(s80, s190, 0x20)
																copy(s60, s1b8, 0x20)
																y = Error_with_pubkeys(s4d8, ca, cb, s80, cc)
																f = ld64(s4d8)
																st64(a + 0x10, ld64(s4d8 + 8))
																st64(a + 8, f)
																st64(a, 0)
																return y
															}
															anchor_error_from(s498, 0x7d5 /* anchor::ConstraintRentExempt */)
															y = fn_4130(s4a8, ld64(s498), ld64(s498 + 8), "observation_state", 0x11)
															f = ld64(s4a8)
															st64(a + 0x10, ld64(s4a8 + 8))
															st64(a + 8, f)
															st64(a, 0)
															return y
														}
														anchor_error_from(s468, 0x7d0 /* anchor::ConstraintMut */)
														y = fn_4130(s478, ld64(s468), ld64(s468 + 8), "observation_state", 0x11)
														f = ld64(s478)
														st64(a + 0x10, ld64(s478 + 8))
														st64(a + 8, f)
														st64(a, 0)
														return y
													}
													st64(a + 0x10, ld64(s6d8 + 0x30))
													st64(a + 8, f)
													st64(a, 0)
													return y
												}
												anchor_error_from(s438, 0x7d6 /* anchor::ConstraintSeeds */)
												const bs = fn_4130(s448, ld64(s438), ld64(s438 + 8), "observation_state", 0x11)
												const br = ld64(s448 + 8)
												const bq = ld64(s448)
												copyr(s80, s1f0, 0x20)
												copy(s60, s238, 0x20)
												y = Error_with_pubkeys(s458, bq, br, s80, bs)
												f = ld64(s458)
												st64(a + 0x10, ld64(s458 + 8))
												st64(a + 8, f)
												st64(a, 0)
												return y
											}
											anchor_error_from(s418, 0x7d5 /* anchor::ConstraintRentExempt */)
											y = fn_4130(s428, ld64(s418), ld64(s418 + 8), "pool_state", 0xa)
											f = ld64(s428)
											st64(a + 0x10, ld64(s428 + 8))
											st64(a + 8, f)
											st64(a, 0)
											return y
										}
										st64(sc0 + 0x10, ld64(sc0 + 0x10))
										st64(sc0, bk, bl)
										bu = fn_13e628(s408, sc0)
										bt = ld64(s408)
										st64(a + 0x10, ld64(s408 + 8))
										st64(a + 8, bt)
										st64(a, 0)
										return ptr_drop_in_place_fcd8(s170, ptr_drop_in_place_fcd8(s80, bu))
									}
									anchor_error_from(s3e8, 0x7d0 /* anchor::ConstraintMut */)
									y = fn_4130(s3f8, ld64(s3e8), ld64(s3e8 + 8), "pool_state", 0xa)
									f = ld64(s3f8)
									st64(a + 0x10, ld64(s3f8 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return y
								}
								st64(a + 0x10, pool_state)
								st64(a + 8, f)
								st64(a, 0)
								return y
							}
							anchor_error_from(s3b8, 0x7d6 /* anchor::ConstraintSeeds */)
							const bj = fn_4130(s3c8, ld64(s3b8), ld64(s3b8 + 8), "pool_state", 0xa)
							const bi = ld64(s3c8 + 8)
							const bh = ld64(s3c8)
							copyr(s80, s290, 0x20)
							copy(s60, s2d8, 0x20)
							y = Error_with_pubkeys(s3d8, bh, bi, s80, bj)
							f = ld64(s3d8)
							st64(a + 0x10, ld64(s3d8 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return y
						}
						y = anchor_error_from(s678, 0xbbd /* anchor::AccountNotEnoughKeys */, u, aj + 0x30, aj)
						f = ld64(s678)
						st64(a + 0x10, ld64(s678 + 8))
						st64(a + 8, f)
						st64(a, 0)
						return y
					}
					alloc_handle_alloc_error(8, 0x80)
				}
				const ab = ld64(0x300000000 /* heap bump-allocator cursor */)
				f = ld64(s78)
				x = ab != 0 ? sat_sub(ab, 0xc) : 0x300007ff4
				u = ld64(s78 + 8)
				if (f != 0) {
					if (0x300000008 > x) {
						raw_vec_handle_error(1, 0xc, 0x10015f8f8, 0x300000008, h)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, x)
					st64(x, 0x696d5f6e656b6f74)
					st32(x + 8, 0x315f746e)
					void ld64(u)
				} else {
					if (0x300000008 > x) {
						raw_vec_handle_error(1, 0xc, 0x10015f8f8, 0x300000008, h)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, x)
					st64(x, 0x696d5f6e656b6f74)
					st32(x + 8, 0x315f746e)
					void ld64(u)
				}
			}
			st64(u + 0x10, x, 0xc)
			st64(u + 8, 0xc)
			st64(u, 1)
			st64(a + 0x10, u)
			st64(a + 8, f)
			st64(a, 0)
			return y
		}
		alloc_handle_alloc_error(8, 0x78)
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	h = 0xc > g
	const i = h != 0 ? 0 : g - 0xc
	const j = g != 0 ? i : 0x300007ff4
	if ((f & 1) != 0) {
		if (0x300000008 > j) {
			raw_vec_handle_error(1, 0xc, 0x10015f8f8, i, h)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st64(j, 0x6572635f6c6f6f70)
		st32(j + 8, 0x726f7461)
		void pool_creator.key
	} else {
		if (0x300000008 > j) {
			raw_vec_handle_error(1, 0xc, 0x10015f8f8, i, h)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st64(j, 0x6572635f6c6f6f70)
		st32(j + 8, 0x726f7461)
		void pool_creator.key
	}
	st64(pool_creator + 0x10, j, 0xc)
	st64(pool_creator + 8, 0xc)
	st64(pool_creator, 1)
	st64(a + 0x10, pool_creator)
	st64(a + 8, f)
	st64(a, 0)
	return y
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: AccountInfo, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: e (value), d (value), c (value)
// types [heur]: b: CreatePoolContext (the handler ix_create_pool passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_1a610(a: u64, b: CreatePoolContext, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s40 = fp - 0x40, s48 = fp - 0x48, s60 = fp - 0x60, s80 = fp - 0x80, sa0 = fp - 0xa0, sc0 = fp - 0xc0, sc8 = fp - 0xc8, se0 = fp - 0xe0, s100 = fp - 0x100, s120 = fp - 0x120, s140 = fp - 0x140, s141 = fp - 0x141, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s208 = fp - 0x208, s210 = fp - 0x210, s218 = fp - 0x218, s220 = fp - 0x220, s228 = fp - 0x228, sfe8 = fp - 0xfe8, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let n: u64
	st64(s208, c, d, e, a)
	const h = b.remaining_accounts_len
	const remaining_accounts: AccountInfo = b.remaining_accounts
	st64(s210, b)
	const accounts: CreatePoolAccounts = b.accounts
	let j = fn_7e058(s100, remaining_accounts, h, ld64(accounts + 0x18), r0)
	let o = ld64(s100 + 8)
	let i = ld64(s100)
	if (i != 2) {
		n = ld64(s208 + 0x18)
		st64(n + 8, o)
		st64(n, i)
		return j
	}
	st64(s218, ld8(s100 + 8))
	j = fn_7e058(s100, remaining_accounts, h, ld64(accounts + 0x20), j)
	o = ld64(s100 + 8)
	i = ld64(s100)
	if (i != 2) {
		n = ld64(s208 + 0x18)
		st64(n + 8, o)
		st64(n, i)
		return j
	}
	const k = ld8(s100 + 8)
	j = fn_7e560(s100, ld64(accounts + 0x18), ld64(s218) & 1)
	o = ld64(s100 + 8)
	i = ld64(s100)
	if (i != 2) {
		n = ld64(s208 + 0x18)
		st64(n + 8, o)
		st64(n, i)
		return j
	}
	if ((ld8(s100 + 8) & 1) != 0) {
		j = fn_7e560(s100, ld64(accounts + 0x20), k & 1)
		o = ld64(s100 + 8)
		i = ld64(s100)
		if (i != 2) {
			n = ld64(s208 + 0x18)
			st64(n + 8, o)
			st64(n, i)
			return j
		}
		if ((ld8(s100 + 8) & 1) != 0) {
			const u = clock_get(s100)
			if (ld64(s100) != 0) {
				const m = ld64(s100 + 8)
				const l = ld64(s100 + 0x10)
				st64(s100 + 0x10, ld64(s100 + 0x18))
				st64(s100, m, l)
				j = fn_13e628(s1e8, s100)
				i = ld64(s1e8)
				n = ld64(s208 + 0x18)
				st64(n + 8, ld64(s1e8 + 8))
				st64(n, i)
				return j
			}
			const p = ld64(se0 + 8)
			const q = ld64(s208 + 0x10)
			if (p > q) {
				const pool_state: AccountInfo = accounts.pool_state
				const s = pool_state.key
				copyr(s158, s + 0x10, 0x10)
				const t = ld64(s + 8)
				st64(s168 + 8, t)
				st64(s168, ld64(s))
				j = fn_6490(s100, pool_state, t, undef, undef, u)
				let v = ld64(s100 + 0x10)
				const w = ld64(s100 + 8)
				o = v
				i = w
				if (ld64(s100) != 0) {
					n = ld64(s208 + 0x18)
					st64(n + 8, o)
					st64(n, i)
					return j
				}
				st64(s218, w)
				j = fn_65410(s100, ld64(s208), ld64(s208 + 8))
				o = ld64(s100 + 8)
				i = ld64(s100)
				if (i != 2) {
					st64(v, ld64(v) + 1)
					n = ld64(s208 + 0x18)
					st64(n + 8, o)
					st64(n, i)
					return j
				}
				st64(s228, ld32(s100 + 8))
				const pool_state_2: AccountInfo = accounts.pool_state
				st64(s208 + 0x10, v)
				AccountInfo_clone_f338(s48, pool_state_2)
				const ac = ld64(accounts + 0x28)
				const z = ld64(accounts + 0x18)
				const y = accounts.pool_state.key
				copyr(s140, y, 0x20)
				const aa = ld64(ld64(z + 0x58))
				copyr(s120, aa, 0x20)
				const ab = ld8(ld64(s210) + 0x21)
				st64(se0 + 0x10, s141)
				st64(se0, s120)
				st64(s100 + 0x10, s140)
				st64(s100, 0x100159d89)
				st8(s141, ab)
				st64(sc8, 1)
				st64(se0 + 8, 0x20)
				st64(s100 + 0x18, 0x20)
				st64(s100 + 8, 0xa)
				st64(sff0, accounts + 0x48, s100)
				st64(s1000, z)
				st64(s220, accounts + 0x58)
				st64(sff8, accounts + 0x58)
				st64(sfe8 + 8, 4)
				const ad = fn_81db0(s1a8, accounts, s48, ac, z, accounts + 0x58, accounts + 0x48, s100, 4)
				const ae = ld64(s1a8 + 8)
				i = ld64(s1a8)
				v = ld64(s208 + 0x10)
				j = ptr_drop_in_place_fcd8(s48, ad)
				o = ae
				if (i != 2) {
					st64(v, ld64(v) + 1)
					n = ld64(s208 + 0x18)
					st64(n + 8, o)
					st64(n, i)
					return j
				}
				AccountInfo_clone_f338(s48, accounts.pool_state)
				const aj = ld64(accounts + 0x30)
				const ag = ld64(accounts + 0x20)
				const af = accounts.pool_state.key
				copyr(s140, af, 0x20)
				const ah = ld64(ld64(ag + 0x58))
				copyr(s120, ah, 0x20)
				const ai = ld8(ld64(s210) + 0x22)
				st64(se0 + 0x10, s141)
				st64(se0, s120)
				st64(s100 + 0x10, s140)
				st64(s100, 0x100159d89)
				st8(s141, ai)
				st64(sc8, 1)
				st64(se0 + 8, 0x20)
				st64(s100 + 0x18, 0x20)
				st64(s100 + 8, 0xa)
				st64(sff0, accounts + 0x50, s100)
				st64(sff8, ld64(s220))
				st64(s1000, ag)
				st64(sfe8 + 8, 4)
				const ak = fn_81db0(s1b8, accounts, s48, aj, ag, ld64(sff8), accounts + 0x50, s100, 4)
				const al = ld64(s1b8 + 8)
				i = ld64(s1b8)
				v = ld64(s208 + 0x10)
				j = ptr_drop_in_place_fcd8(s48, ak)
				o = al
				if (i != 2) {
					st64(v, ld64(v) + 1)
					n = ld64(s208 + 0x18)
					st64(n + 8, o)
					st64(n, i)
					return j
				}
				j = fn_66e8(s100, ld64(accounts + 0x38), o, undef, undef, j)
				o = ld64(s100 + 0x10)
				i = ld64(s100 + 8)
				if (ld64(s100) != 0) {
					st64(v, ld64(v) + 1)
					n = ld64(s208 + 0x18)
					st64(n + 8, o)
					st64(n, i)
					return j
				}
				j = fn_697e0(s1c8, i, s168)
				const am = ld64(s1c8 + 8)
				i = ld64(s1c8)
				st64(o, ld64(o) + 1)
				o = am
				if (i != 2) {
					st64(v, ld64(v) + 1)
					n = ld64(s208 + 0x18)
					st64(n + 8, o)
					st64(n, i)
					return j
				}
				const av = ld8(ld64(s210) + 0x20)
				const an = accounts.pool_creator.key
				copyr(s140, an, 0x20)
				const ao = ld64(ld64(accounts + 0x28))
				copyr(s120, ao, 0x20)
				const ap = ld64(ld64(accounts + 0x30))
				copyr(s48, ap, 0x20)
				const au = ld64(accounts + 8)
				const at = ld64(accounts + 0x18)
				const ar = ld64(accounts + 0x20)
				const aq = ld64(ld64(accounts + 0x38))
				copyr(s100, aq, 0x20)
				st64(sfe8, s140, s120, s48, au, at, ar, s100)
				st64(sff0, ld64(s228))
				st64(s1000, ld64(s208 + 8))
				st64(sfe8 + 0x38, 0)
				st64(sff8, 0)
				j = fn_6a7e8(s1d8, ld64(s218), av, ld64(s208), ld64(s1000), 0, ld64(sff0), s140, s120, s48, au, at, ar, s100, 0)
				o = ld64(s1d8 + 8)
				i = ld64(s1d8)
				if (i != 2) {
					st64(v, ld64(v) + 1)
					n = ld64(s208 + 0x18)
					st64(n + 8, o)
					st64(n, i)
					return j
				}
				j = fn_6940(s100, ld64(accounts + 0x40), o, undef, undef, j)
				o = ld64(s100 + 0x10)
				i = ld64(s100 + 8)
				if (ld64(s100) != 0) {
					st64(v, ld64(v) + 1)
					n = ld64(s208 + 0x18)
					st64(n + 8, o)
					st64(n, i)
					return j
				}
				st64(i + 0x18, ld64(s158 + 8))
				st64(i + 0x10, ld64(s158))
				st64(i + 8, ld64(s168 + 8))
				st64(i, ld64(s168))
				memset2(i + 0x20, 0, 0x700)
				st64(o, ld64(o) + 1)
				const aw = ld64(ld64(ld64(accounts + 0x18) + 0x58))
				copyr(s100, aw, 0x20)
				const ax = ld64(ld64(ld64(accounts + 0x20) + 0x58))
				copyr(se0, ax, 0x20)
				const bb = ld16(ld64(accounts + 8) + 0x72)
				const ay = accounts.pool_state.key
				copyr(sc0, ay, 0x20)
				const az = ld64(ld64(accounts + 0x28))
				copyr(sa0, az, 0x20)
				const ba = ld64(ld64(accounts + 0x30))
				const bf = ld64(ba)
				const be = ld64(ba + 8)
				const bd = ld64(ba + 0x10)
				const bc = ld64(ba + 0x18)
				st32(s60 + 0x10, ld64(s228))
				st16(s60 + 0x14, bb)
				copy(s60, s208, 0x10)
				st64(s80, bf, be, bd, bc)
				fn_10fb10(s48, s100)
				copyr(s120, s40, 0x10)
				j = log_data(s120, 1)
				st64(v, ld64(v) + 1)
				n = ld64(s208 + 0x18)
				st64(n + 8, undef)
				st64(n, 2)
				return j
			}
			ErrorCode_name(s140, 0x100159900)
			st64(s120, 0, 1, 0)
			st64(s28, s120, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s40 + 8, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100159900, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(sc8, s120, 0x18)
			copy(se0, s140, 0x18)
			st64(s100 + 8, 0x100159d5d)
			st32(s80 + 0x18, 0x9c9 /* anchor::RequireGtViolated */)
			st8(sc0 + 0x10, 2)
			st32(s100 + 0x18, 0x8a)
			st64(s100 + 0x10, 0x2c)
			st64(s100, 0)
			fn_13e5a0(s188, s100)
			j = fn_1730(s198, ld64(s188), ld64(s188 + 8), p, q)
			i = ld64(s198)
			n = ld64(s208 + 0x18)
			st64(n + 8, ld64(s198 + 8))
			st64(n, i)
			return j
		}
	}
	fn_85138(s140, 0x100159868)
	st64(s120, 0, 1, 0)
	st64(s28, s120, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s40 + 8, 0)
	st64(s48, 0)
	if (fn_88558(0x100159868, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(sc8, s120, 0x18)
	copy(se0, s140, 0x18)
	st64(s100 + 8, 0x100159d5d)
	st32(s80 + 0x18, 0x1792 /* error::NotSupportMint */)
	st8(sc0 + 0x10, 2)
	st32(s100 + 0x18, 0x87)
	st64(s100 + 0x10, 0x2c)
	st64(s100, 0)
	j = fn_13e5a0(s178, s100)
	i = ld64(s178)
	n = ld64(s208 + 0x18)
	st64(n + 8, ld64(s178 + 8))
	st64(n, i)
	return j
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_f6fe8(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30
	let h, i, j: u64
	let l = fn_a80(s10, ld64(b + 0x10), c)
	let f = ld64(s10)
	if (f != 2) {
		const k = ld64(0x300000000 /* heap bump-allocator cursor */)
		i = k != 0 ? sat_sub(k, 0xa) : 0x300007ff6
		j = ld64(s10 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i, 0x6174735f6c6f6f70)
			st16(i + 8, 0x6574)
			void ld64(j)
		} else {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i, 0x6174735f6c6f6f70)
			st16(i + 8, 0x6574)
			void ld64(j)
		}
		st64(j + 8, 0xa)
		st64(j, 1)
		st64(j + 0x18, 0xa)
		st64(j + 0x10, i)
		st64(a + 8, j)
		st64(a, f)
		return l
	}
	l = fn_8a8(s20, ld64(b + 0x38), c)
	f = ld64(s20)
	if (f == 2) {
		l = fn_c58(s30, ld64(b + 0x40), c)
		j = undef
		f = ld64(s30)
		if (f == 2) {
			st64(a + 8, j)
			st64(a, 2)
			return l
		}
		const g = ld64(0x300000000 /* heap bump-allocator cursor */)
		h = 0x11 > g
		i = g != 0 ? h != 0 ? 0 : g - 0x11 : 0x300007fef
		j = ld64(s30 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i + 8, 0x616d7469625f7961)
			st64(i, 0x7272615f6b636974)
			st8(i + 0x10, 0x70)
			void ld64(j)
		} else {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i + 8, 0x616d7469625f7961)
			st64(i, 0x7272615f6b636974)
			st8(i + 0x10, 0x70)
			void ld64(j)
		}
	} else {
		const m = ld64(0x300000000 /* heap bump-allocator cursor */)
		h = 0x11 > m
		i = m != 0 ? h != 0 ? 0 : m - 0x11 : 0x300007fef
		j = ld64(s20 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i + 8, 0x746174735f6e6f69)
			st64(i, 0x746176726573626f)
			st8(i + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
			void ld64(j)
		} else {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i + 8, 0x746174735f6e6f69)
			st64(i, 0x746176726573626f)
			st8(i + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
			void ld64(j)
		}
	}
	st64(j + 8, 0x11)
	st64(j, 1)
	st64(j + 0x18, 0x11)
	st64(j + 0x10, i)
	st64(a + 8, j)
	st64(a, f)
	return l
}

// name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_141920)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: AccountInfo): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, s90 = fp - 0x90, sa8 = fp - 0xa8, sac = fp - 0xac
	st32(sac, b)
	ErrorCode_name(s78, sac, c, d, e)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x1001613a8)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (ErrorCode_fmt(sac, s48) != 0) {
		fn_14ed60(0x10015cc70 /* "a Display implementation returned an error unexpectedly" */, 0x37, s1, 0x100161638, 0x100161658)
	}
	copyr(sa8, s60, 0x18)
	copy(s90, s78, 0x18)
	const f = __rust_alloc(0xa0, 8)
	if (f != 0) {
		st64(f, 2)
		copy(f + 0x20, s90, 0x18)
		copy(f + 0x38, sa8, 0x18)
		st32(f + 0x98, b)
		st8(f + 0x50, 2)
		st64(a + 8, f)
		st64(a, 0)
		return f
	}
	alloc_handle_alloc_error(8, 0xa0)
}

function fn_4130(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	let g, h, j, k, l, m: u64
	if ((b & 1) != 0) {
		if (0 > (e as i64)) {
			raw_vec_handle_error(0, e, 0x10015f8f8, d, e)
		}
		g = 1
		if (e != 0) {
			const i = ld64(0x300000000 /* heap bump-allocator cursor */)
			g = sat_sub(i != 0 ? i : 0x300008000, e)
			if (0x300000008 > g) {
				raw_vec_handle_error(1, e, 0x10015f8f8, d, e)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, g)
		}
		k = a
		m = b
		j = e
		h = c
		l = memcpy(g, d, e)
		void ld64(c)
	} else {
		if (0 > (e as i64)) {
			raw_vec_handle_error(0, e, 0x10015f8f8, d, e)
		}
		g = 1
		if (e != 0) {
			const f = ld64(0x300000000 /* heap bump-allocator cursor */)
			g = sat_sub(f != 0 ? f : 0x300008000, e)
			if (0x300000008 > g) {
				raw_vec_handle_error(1, e, 0x10015f8f8, d, e)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, g)
		}
		k = a
		m = b
		j = e
		h = c
		l = memcpy(g, d, e)
		void ld64(c)
	}
	st64(h + 0x10, g, j)
	st64(h + 8, j)
	st64(h, 1)
	st64(k + 8, h)
	st64(k, m)
	return l
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_13e628(a: u64, b: u64): u64 {
	const f = __rust_alloc(0x80, 8)
	if (f == 0) {
		alloc_handle_alloc_error(8, 0x80)
	}
	st64(f, 2)
	copy(f + 0x20, b, 0x18)
	st8(f + 0x38, 2)
	st64(a + 8, f)
	st64(a, 1)
	return f
}

function fn_8c030(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s2 = fp - 0x2, s28 = fp - 0x28, s48 = fp - 0x48, s68 = fp - 0x68, s98 = fp - 0x98, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sc9 = fp - 0xc9, sf0 = fp - 0xf0, s110 = fp - 0x110, s130 = fp - 0x130, s140 = fp - 0x140, s1a8 = fp - 0x1a8, s1c8 = fp - 0x1c8, s1e8 = fp - 0x1e8, s200 = fp - 0x200, s208 = fp - 0x208, s228 = fp - 0x228, s270 = fp - 0x270, s290 = fp - 0x290, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2c8 = fp - 0x2c8, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s358 = fp - 0x358, s388 = fp - 0x388, s390 = fp - 0x390, s3d0 = fp - 0x3d0, s3d8 = fp - 0x3d8, s3e0 = fp - 0x3e0
	let ag, ck, cn, co: u64
	const f: AccountInfo = ld64(ld64(b))
	const g = fn_147a20(f, b, c, d, e)
	st64(s358 + 0x10, a)
	if (g != 0) {
		const j = ld64(b + 0x10)
		const k = ld64(ld64(j))
		copyr(s228, k, 0x20)
		const l = f.key
		copy(s200, l + 8, 0x18)
		st64(s208, ld64(l))
		if ((memcmp(s228, s208, 0x20) as u32) == 0) {
			ErrorCode_name(s48, 0x100159890)
			st64(s28, 0, 1, 0)
			st64(s98, s28, 0x10015f818)
			st8(s98 + 0x18, 3)
			st64(s98 + 0x10, 0x20)
			st64(sb8 + 0x10, 0)
			st64(sb8, 0)
			if (ErrorCode_fmt(0x100159890, sb8) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(s2a8, s28, 0x18)
			copy(s2c0, s48, 0x18)
			st64(s2e0 + 8, 0x100159d5d)
			st32(s270 + 0x28, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s290, 2)
			st32(s2c8, 8)
			st64(s2e0 + 0x10, 0x2c)
			st64(s2e0, 0)
			const aj = fn_13e5a0(s320, s2e0)
			const ai = ld64(s320 + 8)
			const ah = ld64(s320)
			copy(s2e0, s228, 0x40)
			ck = Error_with_pubkeys(s330, ah, ai, s2e0, aj)
			const al = ld64(s330)
			const ak = ld64(s358 + 0x10)
			st64(ak + 8, ld64(s330 + 8))
			st64(ak, al)
			return ck
		}
		const m = max(fn_1476d8(ld64(b + 8), 0x608), 1)
		if (m > g) {
			const n: AccountInfo = ld64(j)
			const o: LamportsCell = n.lamports
			const ao = n.key
			rc_inc(o)
			const am: DataCell = n.data
			const an = am.strong
			st64(s358 + 8, ao)
			rc_inc(am, an)
			const ap: LamportsCell = f.lamports
			const aq = ap.strong
			st64(s388 + 8, f.key)
			st64(s388 + 0x10, n.executable)
			st64(s388 + 0x18, n.is_writable)
			st64(s388 + 0x20, n.is_signer)
			st64(s388 + 0x28, n.rent_epoch)
			st64(s358, n.owner)
			rc_inc(ap, aq)
			const ar: DataCell = f.data
			const at = ar.strong
			st64(s390, ap, am)
			rc_inc(ar, at)
			const au: AccountInfo = ld64(ld64(b + 0x18))
			const av: LamportsCell = au.lamports
			const aw = av.strong
			st64(s3d0 + 0x10, f.executable)
			st64(s3d0 + 0x18, f.is_writable)
			st64(s3d0 + 0x20, f.is_signer)
			st64(s3d0 + 0x28, f.rent_epoch)
			st64(s3d0 + 0x30, f.owner)
			st64(s3d0 + 0x38, au.key)
			rc_inc(av, aw)
			const ax: DataCell = au.data
			const ay = ax.strong
			st64(s3d0, o, sat_sub(m, g))
			rc_inc(ax, ay)
			st64(s3d8, au.owner)
			const bc = au.rent_epoch
			const bb = au.is_signer
			const ba = au.is_writable
			const az = au.executable
			st8(s1a8 + 0x62, ld64(s3d0 + 0x10))
			st8(s1a8 + 0x61, ld64(s3d0 + 0x18))
			st8(s1a8 + 0x60, ld64(s3d0 + 0x20))
			st64(s1a8 + 0x58, ld64(s3d0 + 0x28))
			st64(s1a8 + 0x50, ld64(s3d0 + 0x30))
			st64(s1a8 + 0x48, ar)
			st64(s1a8 + 0x40, ld64(s390))
			st64(s1a8 + 0x38, ld64(s388 + 8))
			st8(s1a8 + 0x32, ld64(s388 + 0x10))
			st8(s1a8 + 0x31, ld64(s388 + 0x18))
			st8(s1a8 + 0x30, ld64(s388 + 0x20))
			st64(s1a8 + 0x28, ld64(s388 + 0x28))
			st64(s1a8 + 0x20, ld64(s358))
			st64(s1a8 + 0x18, ld64(s388))
			st64(s1a8 + 0x10, ld64(s3d0))
			st64(s1a8 + 8, ld64(s358 + 8))
			st8(s1a8, bb, ba, az)
			st64(s1c8 + 0x18, bc)
			st64(s1c8 + 0x10, ld64(s3d8))
			st64(s1c8, av, ax)
			st64(s1e8 + 0x18, ld64(s3d0 + 0x38))
			st64(s140, 8, 0)
			st64(s1e8, 0, 8, 0)
			ck = system_program_transfer(s2f0, s1e8, ld64(s3d0 + 8))
			ag = ld64(s2f0)
			if (ag != 2) {
				co = ld64(s2f0 + 8)
				cn = ld64(s358 + 0x10)
				st64(cn, ag, co)
				return ck
			}
		}
		const bd: LamportsCell = f.lamports
		const bj = f.key
		rc_inc(bd)
		const be: DataCell = f.data
		rc_inc(be)
		st64(s358, be)
		const bf = ld64(b + 0x18)
		const bg: AccountInfo = ld64(bf)
		const bh: LamportsCell = bg.lamports
		const bi = bh.strong
		st64(s388 + 0x10, f.executable)
		st64(s388 + 0x18, f.is_writable)
		st64(s388 + 0x20, f.is_signer)
		st64(s388 + 0x28, f.rent_epoch)
		st64(s358 + 8, f.owner)
		const bs = bg.key
		rc_inc(bh, bi)
		st64(s388 + 8, bj)
		const bk: DataCell = bg.data
		rc_inc(bk)
		st64(s3d0 + 0x30, bf)
		st64(s390, bg.owner)
		st64(s3d0 + 0x38, bg.rent_epoch)
		st64(s388, bd)
		const br = bg.is_signer
		const bq = bg.is_writable
		const bp = bg.executable
		const bl = ld64(ld64(ld64(b + 0x20)))
		copyr(s130, bl, 0x20)
		const bm = ld64(ld64(ld64(b + 0x28) + 0x58))
		copyr(s110, bm, 0x20)
		const bn = ld64(ld64(ld64(b + 0x30) + 0x58))
		copyr(sf0, bn, 0x20)
		const bo = ld8(ld64(b + 0x38))
		st64(s98 + 0x20, sc9)
		st64(s98 + 0x10, sf0)
		st64(s98, s110)
		st64(sb8 + 0x10, s130)
		st64(sb8, 0x10015984c)
		st8(sc9, bo)
		st64(s28, sb8)
		st64(s270 + 8, s28)
		st8(s270, br, bq, bp)
		st64(s290 + 0x18, ld64(s3d0 + 0x38))
		st64(s290 + 0x10, ld64(s390))
		st64(s298, bs, bh, bk)
		st8(s2a8 + 0xa, ld64(s388 + 0x10))
		st8(s2a8 + 9, ld64(s388 + 0x18))
		st8(s2a8 + 8, ld64(s388 + 0x20))
		st64(s2a8, ld64(s388 + 0x28))
		copyr(s2b8, s358, 0x10)
		st64(s2c0, ld64(s388))
		st64(s2c8, ld64(s388 + 8))
		st64(s98 + 0x28, 1)
		st64(s98 + 0x18, 0x20)
		st64(s98 + 8, 0x20)
		st64(sb8 + 0x18, 0x20)
		st64(sb8 + 8, 4)
		st64(s28 + 8, 5)
		st64(s270 + 0x10, 1)
		st64(s2e0, 0, 8, 0)
		ck = system_program_assign_13fb30(s300, s2e0, 0x608)
		ag = ld64(s300)
		if (ag != 2) {
			co = ld64(s300 + 8)
			cn = ld64(s358 + 0x10)
			st64(cn, ag, co)
			return ck
		}
		const bt: LamportsCell = f.lamports
		const bv = ld64(s3d0 + 0x30)
		const cb = f.key
		rc_inc(bt)
		const bu: DataCell = f.data
		rc_inc(bu)
		const bw: AccountInfo = ld64(bv)
		const bx: LamportsCell = bw.lamports
		const by = bx.strong
		st64(s388 + 0x18, f.executable)
		st64(s388 + 0x20, f.is_writable)
		st64(s388 + 0x28, f.is_signer)
		st64(s358, f.rent_epoch)
		st64(s358 + 8, f.owner)
		st64(s388 + 0x10, bw.key)
		rc_inc(bx, by)
		const bz: DataCell = bw.data
		const ca = bz.strong
		st64(s388, cb, bt)
		rc_inc(bz, ca)
		st64(s390, bw.owner)
		const cf = bw.rent_epoch
		const ce = bw.is_signer
		const cd = bw.is_writable
		const cc = bw.executable
		copy(s68, s130, 0x60)
		st8(s2, ld8(sc9))
		st64(sc8, sb8, 5, 0x10015984c, 4, s68, 0x20, s48, 0x20, s28, 0x20, s2, 1)
		st64(s270 + 8, sc8)
		st8(s270, ce, cd, cc)
		st64(s290 + 0x18, cf)
		st64(s290 + 0x10, ld64(s390))
		st64(s290, bx, bz)
		st64(s298, ld64(s388 + 0x10))
		st8(s2a8 + 0xa, ld64(s388 + 0x18))
		st8(s2a8 + 9, ld64(s388 + 0x20))
		st8(s2a8 + 8, ld64(s388 + 0x28))
		st64(s2a8, ld64(s358))
		st64(s2b8 + 8, ld64(s358 + 8))
		st64(s2b8, bu)
		copyr(s2c8, s388, 0x10)
		st64(s270 + 0x10, 1)
		st64(s2e0, 0, 8, 0)
		ck = system_program_assign_13ff40(s310, s2e0, ld64(ld64(b + 0x40)))
		ag = ld64(s310)
		if (ag != 2) {
			co = ld64(s310 + 8)
			cn = ld64(s358 + 0x10)
			st64(cn, ag, co)
			return ck
		}
	} else {
		const y = fn_1476d8(ld64(b + 8), 0x608)
		const h: AccountInfo = ld64(ld64(b + 0x10))
		const i: LamportsCell = h.lamports
		const q = h.key
		rc_inc(i)
		const p: DataCell = h.data
		rc_inc(p)
		st64(s358, q)
		const r: LamportsCell = f.lamports
		st64(s358 + 8, r)
		const s = r.strong
		st64(s388 + 8, f.key)
		st64(s388 + 0x10, h.executable)
		st64(s388 + 0x18, h.is_writable)
		st64(s388 + 0x20, h.is_signer)
		st64(s388 + 0x28, h.rent_epoch)
		const t = h.owner
		rc_inc(ld64(s358 + 8), s)
		st64(s388, t)
		const u: DataCell = f.data
		rc_inc(u)
		st64(s390, i)
		const v: AccountInfo = ld64(ld64(b + 0x18))
		const w: LamportsCell = v.lamports
		const x = w.strong
		st64(s3d0 + 0x18, f.executable)
		st64(s3d0 + 0x20, f.is_writable)
		st64(s3d0 + 0x28, f.is_signer)
		st64(s3d0 + 0x30, f.rent_epoch)
		st64(s3d0 + 0x38, f.owner)
		const af = v.key
		rc_inc(w, x)
		st64(s3d0 + 0x10, y)
		const z: DataCell = v.data
		rc_inc(z)
		st64(s3d0 + 8, v.owner)
		st64(s3d0, v.rent_epoch)
		st64(s3d8, v.is_signer)
		st64(s3e0, v.is_writable)
		const ae = v.executable
		const aa = ld64(ld64(ld64(b + 0x20)))
		copyr(s68, aa, 0x20)
		const ab = ld64(ld64(ld64(b + 0x28) + 0x58))
		copyr(s48, ab, 0x20)
		const ac = ld64(ld64(ld64(b + 0x30) + 0x58))
		copyr(s28, ac, 0x20)
		const ad = ld8(ld64(b + 0x38))
		st64(s98 + 0x20, s2)
		st64(s98 + 0x10, s28)
		st64(s98, s48)
		st64(sb8 + 0x10, s68)
		st64(sb8, 0x10015984c)
		st8(s2, ad)
		st64(sc8, sb8)
		st64(s270 + 0x38, sc8)
		st8(s270 + 0x32, ld64(s3d0 + 0x18))
		st8(s270 + 0x31, ld64(s3d0 + 0x20))
		st8(s270 + 0x30, ld64(s3d0 + 0x28))
		st64(s270 + 0x28, ld64(s3d0 + 0x30))
		st64(s270 + 0x20, ld64(s3d0 + 0x38))
		st64(s270 + 0x18, u)
		st64(s270 + 0x10, ld64(s358 + 8))
		st64(s270 + 8, ld64(s388 + 8))
		st8(s270 + 2, ld64(s388 + 0x10))
		st8(s270 + 1, ld64(s388 + 0x18))
		st8(s270, ld64(s388 + 0x20))
		st64(s290 + 0x18, ld64(s388 + 0x28))
		st64(s290 + 0x10, ld64(s388))
		st64(s290 + 8, p)
		st64(s290, ld64(s390))
		st64(s298, ld64(s358))
		st8(s2a8 + 0xa, ae)
		st8(s2a8 + 9, ld64(s3e0))
		st8(s2a8 + 8, ld64(s3d8))
		st64(s2a8, ld64(s3d0))
		st64(s2b8 + 8, ld64(s3d0 + 8))
		st64(s2c8, af, w, z)
		st64(s98 + 0x28, 1)
		st64(s98 + 0x18, 0x20)
		st64(s98 + 8, 0x20)
		st64(sb8 + 0x18, 0x20)
		st64(sb8 + 8, 4)
		st64(sc8 + 8, 5)
		st64(s270 + 0x40, 1)
		st64(s2e0, 0, 8, 0)
		ck = system_program_create_account(s340, s2e0, ld64(s3d0 + 0x10), 0x608, ld64(ld64(b + 0x40)))
		ag = ld64(s340)
		if (ag != 2) {
			co = ld64(s340 + 8)
			cn = ld64(s358 + 0x10)
			st64(cn, ag, co)
			return ck
		}
	}
	const ch = ld64(s358 + 0x10)
	ck = fn_4688(s2e0, f)
	const ci = ld64(s2e0 + 8)
	const cg = ld64(s2e0)
	if (cg == 2) {
		st64(ch + 8, ci)
		st64(ch, 2)
		return ck
	}
	const cj = ld64(0x300000000 /* heap bump-allocator cursor */)
	ck = 0xa > cj
	const cl = ck != 0 ? 0 : cj - 0xa
	const cm = cj != 0 ? cl : 0x300007ff6
	if ((cg & 1) != 0) {
		if (0x300000008 > cm) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, cl)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, cm)
		st64(cm, 0x6174735f6c6f6f70)
		st16(cm + 8, 0x6574)
		void ld64(ci)
	} else {
		if (0x300000008 > cm) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, cl)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, cm)
		st64(cm, 0x6174735f6c6f6f70)
		st16(cm + 8, 0x6574)
		void ld64(ci)
	}
	st64(ci + 0x10, cm, 0xa)
	st64(ci + 8, 0xa)
	st64(ci, 1)
	st64(ch + 8, ci)
	st64(ch, cg)
	return ck
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), d (value), e (value)
function fn_147a20(a: AccountInfo, b: u64, c: u64, d: u64, e: u64): u64 {
	const f: LamportsCell = a.lamports
	const g = f.borrow
	if (g > 0x7ffffffffffffffe) {
		fn_14e808(0x100161ee0, g, 0x7ffffffffffffffe, d, e)
	}
	f.borrow = g + 1
	const h = f.value.amount
	f.borrow = g
	return h
}

function fn_8dc68(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s49 = fp - 0x49, s70 = fp - 0x70, s71 = fp - 0x71, s98 = fp - 0x98, sa8 = fp - 0xa8, s108 = fp - 0x108, s110 = fp - 0x110, s130 = fp - 0x130, s150 = fp - 0x150, s168 = fp - 0x168, s180 = fp - 0x180, s188 = fp - 0x188, s1a8 = fp - 0x1a8, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s210 = fp - 0x210, s218 = fp - 0x218, s21f = fp - 0x21f, s228 = fp - 0x228, s240 = fp - 0x240, s248 = fp - 0x248, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s308 = fp - 0x308, s310 = fp - 0x310, s318 = fp - 0x318, s320 = fp - 0x320, s328 = fp - 0x328, s330 = fp - 0x330, s338 = fp - 0x338, s340 = fp - 0x340, s348 = fp - 0x348, s350 = fp - 0x350, s358 = fp - 0x358, s360 = fp - 0x360, s368 = fp - 0x368
	let af, cn, cq, cr: u64
	const f: AccountInfo = ld64(ld64(b))
	const g = fn_147a20(f, b, c, d, e)
	st64(s308 + 0x40, a)
	if (g != 0) {
		const j = ld64(b + 0x10)
		const k = ld64(ld64(j))
		copyr(s1a8, k, 0x20)
		const l = f.key
		copy(s180, l + 8, 0x18)
		st64(s188, ld64(l))
		if ((memcmp(s1a8, s188, 0x20) as u32) == 0) {
			ErrorCode_name(s168, 0x100159890)
			st64(s70, 0, 1, 0)
			st64(s28, s70, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100159890, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(s228, s70, 0x18)
			copy(s240, s168, 0x18)
			st64(s260 + 8, 0x100159d5d)
			st32(s1e0 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s210, 2)
			st32(s248, 8)
			st64(s260 + 0x10, 0x2c)
			st64(s260, 0)
			const ai = fn_13e5a0(s2a0, s260)
			const ah = ld64(s2a0 + 8)
			const ag = ld64(s2a0)
			copy(s260, s1a8, 0x40)
			cn = Error_with_pubkeys(s2b0, ag, ah, s260, ai)
			const ak = ld64(s2b0)
			const aj = ld64(s308 + 0x40)
			st64(aj + 8, ld64(s2b0 + 8))
			st64(aj, ak)
			return cn
		}
		st64(s308 + 0x38, b)
		const m = max(fn_1476d8(ld64(b + 8), 0x1183), 1)
		if (m > g) {
			const n: AccountInfo = ld64(j)
			const o: LamportsCell = n.lamports
			const ap = n.key
			rc_inc(o)
			const al: DataCell = n.data
			rc_inc(al)
			const am: LamportsCell = f.lamports
			st64(s308 + 0x30, am)
			const an = am.strong
			st64(s308, f.key)
			st64(s308 + 8, n.executable)
			st64(s308 + 0x10, n.is_writable)
			st64(s308 + 0x18, n.is_signer)
			st64(s308 + 0x20, n.rent_epoch)
			st64(s308 + 0x28, n.owner)
			rc_inc(ld64(s308 + 0x30), an)
			const ao: DataCell = f.data
			const aq = ld64(s308 + 0x38)
			rc_inc(ao)
			st64(s320, al, ap)
			const ar: AccountInfo = ld64(ld64(aq + 0x18))
			const at: LamportsCell = ar.lamports
			const au = at.strong
			st64(s310, o)
			st64(s348, f.executable)
			st64(s340, f.is_writable)
			st64(s338, f.is_signer)
			st64(s330, f.rent_epoch)
			const ax = f.owner
			st64(s328, ar.key)
			rc_inc(at, au)
			st64(s358, ao)
			const av: DataCell = ar.data
			const aw = av.strong
			st64(s350, sat_sub(m, g))
			rc_inc(av, aw)
			st64(s360, ar.owner)
			const bb = ar.rent_epoch
			const ba = ar.is_signer
			const az = ar.is_writable
			const ay = ar.executable
			st8(s108 + 0x5a, ld64(s348))
			st8(s108 + 0x59, ld64(s340))
			st8(s108 + 0x58, ld64(s338))
			st64(s108 + 0x50, ld64(s330))
			st64(s108 + 0x48, ax)
			st64(s108 + 0x40, ld64(s358))
			st64(s108 + 0x38, ld64(s308 + 0x30))
			st64(s108 + 0x30, ld64(s308))
			st8(s108 + 0x2a, ld64(s308 + 8))
			st8(s108 + 0x29, ld64(s308 + 0x10))
			st8(s108 + 0x28, ld64(s308 + 0x18))
			st64(s108 + 0x20, ld64(s308 + 0x20))
			st64(s108 + 0x18, ld64(s308 + 0x28))
			st64(s108 + 0x10, ld64(s320))
			copyr(s108, s318, 0x10)
			st8(s110, ba, az, ay)
			st64(s130 + 0x18, bb)
			st64(s130 + 0x10, ld64(s360))
			st64(s130, at, av)
			st64(s150 + 0x18, ld64(s328))
			st64(sa8, 8, 0)
			st64(s150, 0, 8, 0)
			cn = system_program_transfer(s270, s150, ld64(s350))
			const bc = ld64(s270)
			const bd = ld64(s308 + 0x40)
			if (bc != 2) {
				const be = ld64(s270 + 8)
				st64(bd, bc, be)
				return cn
			}
		}
		const bf: LamportsCell = f.lamports
		const bg = bf.strong
		st64(s308 + 0x30, f.key)
		const bi = ld64(s308 + 0x38)
		rc_inc(bf, bg)
		const bh: DataCell = f.data
		rc_inc(bh)
		st64(s308 + 0x28, bh)
		const bj = ld64(bi + 0x18)
		const bk: AccountInfo = ld64(bj)
		const bl: LamportsCell = bk.lamports
		const bm = bl.strong
		st64(s308, f.executable)
		st64(s308 + 8, f.is_writable)
		st64(s308 + 0x10, f.is_signer)
		st64(s308 + 0x18, f.rent_epoch)
		st64(s308 + 0x20, f.owner)
		const bn = bk.key
		rc_inc(bl, bm)
		st64(s310, bn)
		const bo: DataCell = bk.data
		rc_inc(bo)
		st64(s328, bj)
		st64(s320, bk.owner)
		st64(s318, bf)
		const bu = bk.rent_epoch
		const bt = bk.is_signer
		const bs = bk.is_writable
		const br = bk.executable
		const bp = ld64(ld64(ld64(bi + 0x20)))
		copyr(s98, bp, 0x20)
		const bq = ld8(ld64(bi + 0x28))
		st64(s28, s71)
		st64(s48 + 0x10, s98)
		st64(s48, 0x10015afbf)
		st8(s71, bq)
		st64(s70, s48)
		st64(s1f0 + 8, s70)
		st8(s1f0, bt, bs, br)
		st64(s210 + 0x18, bu)
		st64(s210 + 0x10, ld64(s320))
		st64(s210, bl, bo)
		st64(s218, ld64(s310))
		st8(s21f + 1, ld64(s308))
		st8(s21f, ld64(s308 + 8))
		st8(s228 + 8, ld64(s308 + 0x10))
		st64(s228, ld64(s308 + 0x18))
		st64(s240 + 0x10, ld64(s308 + 0x20))
		st64(s240 + 8, ld64(s308 + 0x28))
		st64(s240, ld64(s318))
		st64(s248, ld64(s308 + 0x30))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0xb)
		st64(s70 + 8, 3)
		st64(s1e0, 1)
		st64(s260, 0, 8, 0)
		cn = system_program_assign_13fb30(s280, s260, 0x1183)
		af = ld64(s280)
		if (af != 2) {
			cr = ld64(s280 + 8)
			cq = ld64(s308 + 0x40)
			st64(cq, af, cr)
			return cn
		}
		const bv: LamportsCell = f.lamports
		const cd = f.key
		rc_inc(bv)
		const bw: DataCell = f.data
		rc_inc(bw)
		const bx: AccountInfo = ld64(ld64(s328))
		const by: LamportsCell = bx.lamports
		const bz = by.strong
		st64(s308 + 0x18, f.executable)
		st64(s308 + 0x20, f.is_writable)
		st64(s308 + 0x28, f.is_signer)
		st64(s308 + 0x30, f.rent_epoch)
		const cc = f.owner
		st64(s308 + 0x10, bx.key)
		rc_inc(by, bz)
		const ca: DataCell = bx.data
		const cb = ca.strong
		st64(s310, cc, cd, bv)
		rc_inc(ca, cb)
		const ci = bx.owner
		const ch = bx.rent_epoch
		const cg = bx.is_signer
		const cf = bx.is_writable
		const ce = bx.executable
		copyr(s70, s98, 0x20)
		st64(s28, s49)
		st64(s48 + 0x10, s70)
		st64(s48, 0x10015afbf)
		st8(s49, ld8(s71))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0xb)
		st64(s168, s48, 3)
		st64(s1f0 + 8, s168)
		st8(s1f0, cg, cf, ce)
		st64(s210, by, ca, ci, ch)
		st64(s218, ld64(s308 + 0x10))
		st8(s21f + 1, ld64(s308 + 0x18))
		st8(s21f, ld64(s308 + 0x20))
		st8(s228 + 8, ld64(s308 + 0x28))
		st64(s228, ld64(s308 + 0x30))
		st64(s240 + 0x10, ld64(s310))
		st64(s240 + 8, bw)
		copyr(s248, s308, 0x10)
		st64(s1e0, 1)
		st64(s260, 0, 8, 0)
		cn = system_program_assign_13ff40(s290, s260, ld64(ld64(ld64(s308 + 0x38) + 0x30)))
		af = ld64(s290)
		if (af != 2) {
			cr = ld64(s290 + 8)
			cq = ld64(s308 + 0x40)
			st64(cq, af, cr)
			return cn
		}
	} else {
		const p = fn_1476d8(ld64(b + 8), 0x1183)
		const h: AccountInfo = ld64(ld64(b + 0x10))
		const i: LamportsCell = h.lamports
		const v = h.key
		rc_inc(i)
		st64(s308 + 0x30, p)
		const q: DataCell = h.data
		rc_inc(q)
		st64(s308 + 0x28, q)
		const r: LamportsCell = f.lamports
		const s = r.strong
		st64(s308, f.key)
		st64(s308 + 8, h.executable)
		st64(s308 + 0x10, h.is_writable)
		st64(s308 + 0x18, h.is_signer)
		st64(s308 + 0x20, h.rent_epoch)
		const t = h.owner
		rc_inc(r, s)
		st64(s310, t)
		const u: DataCell = f.data
		rc_inc(u)
		st64(s320, v, i)
		const w: AccountInfo = ld64(ld64(b + 0x18))
		const x: LamportsCell = w.lamports
		const y = x.strong
		st64(s348, f.executable)
		st64(s340, f.is_writable)
		st64(s338, f.is_signer)
		st64(s330, f.rent_epoch)
		st64(s328, f.owner)
		const z = w.key
		rc_inc(x, y)
		st64(s350, z)
		const aa: DataCell = w.data
		rc_inc(aa)
		st64(s358, w.owner)
		st64(s360, w.rent_epoch)
		st64(s368, w.is_signer)
		const ae = w.is_writable
		const ad = w.executable
		const ab = ld64(ld64(ld64(b + 0x20)))
		copyr(s70, ab, 0x20)
		const ac = ld8(ld64(b + 0x28))
		st64(s28, s49)
		st64(s48 + 0x10, s70)
		st64(s48, 0x10015afbf)
		st8(s49, ac)
		st64(s168, s48)
		st64(s1e0 + 0x28, s168)
		st8(s1e0 + 0x22, ld64(s348))
		st8(s1e0 + 0x21, ld64(s340))
		st8(s1e0 + 0x20, ld64(s338))
		st64(s1e0 + 0x18, ld64(s330))
		st64(s1e0 + 0x10, ld64(s328))
		st64(s1e0, r, u)
		st64(s1f0 + 8, ld64(s308))
		st8(s1f0 + 2, ld64(s308 + 8))
		st8(s1f0 + 1, ld64(s308 + 0x10))
		st8(s1f0, ld64(s308 + 0x18))
		st64(s210 + 0x18, ld64(s308 + 0x20))
		st64(s210 + 0x10, ld64(s310))
		st64(s210 + 8, ld64(s308 + 0x28))
		copyr(s218, s320, 0x10)
		st8(s21f, ae, ad)
		st8(s228 + 8, ld64(s368))
		st64(s228, ld64(s360))
		st64(s240 + 0x10, ld64(s358))
		st64(s240, x, aa)
		st64(s248, ld64(s350))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0xb)
		st64(s168 + 8, 3)
		st64(s1e0 + 0x30, 1)
		st64(s260, 0, 8, 0)
		cn = system_program_create_account(s2c0, s260, ld64(s308 + 0x30), 0x1183, ld64(ld64(b + 0x30)))
		af = ld64(s2c0)
		if (af != 2) {
			cr = ld64(s2c0 + 8)
			cq = ld64(s308 + 0x40)
			st64(cq, af, cr)
			return cn
		}
	}
	const ck = ld64(s308 + 0x40)
	cn = fn_4688(s260, f)
	const cl = ld64(s260 + 8)
	const cj = ld64(s260)
	if (cj == 2) {
		st64(ck + 8, cl)
		st64(ck, 2)
		return cn
	}
	const cm = ld64(0x300000000 /* heap bump-allocator cursor */)
	cn = 0x11 > cm
	const co = cn != 0 ? 0 : cm - 0x11
	const cp = cm != 0 ? co : 0x300007fef
	if ((cj & 1) != 0) {
		if (0x300000008 > cp) {
			raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, co)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, cp)
		st64(cp + 8, 0x746174735f6e6f69)
		st64(cp, 0x746176726573626f)
		st8(cp + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
		void ld64(cl)
	} else {
		if (0x300000008 > cp) {
			raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, co)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, cp)
		st64(cp + 8, 0x746174735f6e6f69)
		st64(cp, 0x746176726573626f)
		st8(cp + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
		void ld64(cl)
	}
	st64(cl + 0x10, cp, 0x11)
	st64(cl + 8, 0x11)
	st64(cl, 1)
	st64(ck + 8, cl)
	st64(ck, cj)
	return cn
}

function fn_8f680(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s49 = fp - 0x49, s70 = fp - 0x70, s71 = fp - 0x71, s98 = fp - 0x98, sa8 = fp - 0xa8, s108 = fp - 0x108, s110 = fp - 0x110, s130 = fp - 0x130, s150 = fp - 0x150, s168 = fp - 0x168, s180 = fp - 0x180, s188 = fp - 0x188, s1a8 = fp - 0x1a8, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s210 = fp - 0x210, s218 = fp - 0x218, s21f = fp - 0x21f, s228 = fp - 0x228, s240 = fp - 0x240, s248 = fp - 0x248, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s308 = fp - 0x308, s310 = fp - 0x310, s318 = fp - 0x318, s320 = fp - 0x320, s328 = fp - 0x328, s330 = fp - 0x330, s338 = fp - 0x338, s340 = fp - 0x340, s348 = fp - 0x348, s350 = fp - 0x350, s358 = fp - 0x358, s360 = fp - 0x360, s368 = fp - 0x368
	let af, cn, cq, cr: u64
	const f: AccountInfo = ld64(ld64(b))
	const g = fn_147a20(f, b, c, d, e)
	st64(s308 + 0x40, a)
	if (g != 0) {
		const j = ld64(b + 0x10)
		const k = ld64(ld64(j))
		copyr(s1a8, k, 0x20)
		const l = f.key
		copy(s180, l + 8, 0x18)
		st64(s188, ld64(l))
		if ((memcmp(s1a8, s188, 0x20) as u32) == 0) {
			ErrorCode_name(s168, 0x100159890)
			st64(s70, 0, 1, 0)
			st64(s28, s70, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100159890, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(s228, s70, 0x18)
			copy(s240, s168, 0x18)
			st64(s260 + 8, 0x100159d5d)
			st32(s1e0 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s210, 2)
			st32(s248, 8)
			st64(s260 + 0x10, 0x2c)
			st64(s260, 0)
			const ai = fn_13e5a0(s2a0, s260)
			const ah = ld64(s2a0 + 8)
			const ag = ld64(s2a0)
			copy(s260, s1a8, 0x40)
			cn = Error_with_pubkeys(s2b0, ag, ah, s260, ai)
			const ak = ld64(s2b0)
			const aj = ld64(s308 + 0x40)
			st64(aj + 8, ld64(s2b0 + 8))
			st64(aj, ak)
			return cn
		}
		st64(s308 + 0x38, b)
		const m = max(fn_1476d8(ld64(b + 8), 0x728), 1)
		if (m > g) {
			const n: AccountInfo = ld64(j)
			const o: LamportsCell = n.lamports
			const ap = n.key
			rc_inc(o)
			const al: DataCell = n.data
			rc_inc(al)
			const am: LamportsCell = f.lamports
			st64(s308 + 0x30, am)
			const an = am.strong
			st64(s308, f.key)
			st64(s308 + 8, n.executable)
			st64(s308 + 0x10, n.is_writable)
			st64(s308 + 0x18, n.is_signer)
			st64(s308 + 0x20, n.rent_epoch)
			st64(s308 + 0x28, n.owner)
			rc_inc(ld64(s308 + 0x30), an)
			const ao: DataCell = f.data
			const aq = ld64(s308 + 0x38)
			rc_inc(ao)
			st64(s320, al, ap)
			const ar: AccountInfo = ld64(ld64(aq + 0x18))
			const at: LamportsCell = ar.lamports
			const au = at.strong
			st64(s310, o)
			st64(s348, f.executable)
			st64(s340, f.is_writable)
			st64(s338, f.is_signer)
			st64(s330, f.rent_epoch)
			const ax = f.owner
			st64(s328, ar.key)
			rc_inc(at, au)
			st64(s358, ao)
			const av: DataCell = ar.data
			const aw = av.strong
			st64(s350, sat_sub(m, g))
			rc_inc(av, aw)
			st64(s360, ar.owner)
			const bb = ar.rent_epoch
			const ba = ar.is_signer
			const az = ar.is_writable
			const ay = ar.executable
			st8(s108 + 0x5a, ld64(s348))
			st8(s108 + 0x59, ld64(s340))
			st8(s108 + 0x58, ld64(s338))
			st64(s108 + 0x50, ld64(s330))
			st64(s108 + 0x48, ax)
			st64(s108 + 0x40, ld64(s358))
			st64(s108 + 0x38, ld64(s308 + 0x30))
			st64(s108 + 0x30, ld64(s308))
			st8(s108 + 0x2a, ld64(s308 + 8))
			st8(s108 + 0x29, ld64(s308 + 0x10))
			st8(s108 + 0x28, ld64(s308 + 0x18))
			st64(s108 + 0x20, ld64(s308 + 0x20))
			st64(s108 + 0x18, ld64(s308 + 0x28))
			st64(s108 + 0x10, ld64(s320))
			copyr(s108, s318, 0x10)
			st8(s110, ba, az, ay)
			st64(s130 + 0x18, bb)
			st64(s130 + 0x10, ld64(s360))
			st64(s130, at, av)
			st64(s150 + 0x18, ld64(s328))
			st64(sa8, 8, 0)
			st64(s150, 0, 8, 0)
			cn = system_program_transfer(s270, s150, ld64(s350))
			const bc = ld64(s270)
			const bd = ld64(s308 + 0x40)
			if (bc != 2) {
				const be = ld64(s270 + 8)
				st64(bd, bc, be)
				return cn
			}
		}
		const bf: LamportsCell = f.lamports
		const bg = bf.strong
		st64(s308 + 0x30, f.key)
		const bi = ld64(s308 + 0x38)
		rc_inc(bf, bg)
		const bh: DataCell = f.data
		rc_inc(bh)
		st64(s308 + 0x28, bh)
		const bj = ld64(bi + 0x18)
		const bk: AccountInfo = ld64(bj)
		const bl: LamportsCell = bk.lamports
		const bm = bl.strong
		st64(s308, f.executable)
		st64(s308 + 8, f.is_writable)
		st64(s308 + 0x10, f.is_signer)
		st64(s308 + 0x18, f.rent_epoch)
		st64(s308 + 0x20, f.owner)
		const bn = bk.key
		rc_inc(bl, bm)
		st64(s310, bn)
		const bo: DataCell = bk.data
		rc_inc(bo)
		st64(s328, bj)
		st64(s320, bk.owner)
		st64(s318, bf)
		const bu = bk.rent_epoch
		const bt = bk.is_signer
		const bs = bk.is_writable
		const br = bk.executable
		const bp = ld64(ld64(ld64(bi + 0x20)))
		copyr(s98, bp, 0x20)
		const bq = ld8(ld64(bi + 0x28))
		st64(s28, s71)
		st64(s48 + 0x10, s98)
		st64(s48, 0x1001595c0)
		st8(s71, bq)
		st64(s70, s48)
		st64(s1f0 + 8, s70)
		st8(s1f0, bt, bs, br)
		st64(s210 + 0x18, bu)
		st64(s210 + 0x10, ld64(s320))
		st64(s210, bl, bo)
		st64(s218, ld64(s310))
		st8(s21f + 1, ld64(s308))
		st8(s21f, ld64(s308 + 8))
		st8(s228 + 8, ld64(s308 + 0x10))
		st64(s228, ld64(s308 + 0x18))
		st64(s240 + 0x10, ld64(s308 + 0x20))
		st64(s240 + 8, ld64(s308 + 0x28))
		st64(s240, ld64(s318))
		st64(s248, ld64(s308 + 0x30))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0x20)
		st64(s70 + 8, 3)
		st64(s1e0, 1)
		st64(s260, 0, 8, 0)
		cn = system_program_assign_13fb30(s280, s260, 0x728)
		af = ld64(s280)
		if (af != 2) {
			cr = ld64(s280 + 8)
			cq = ld64(s308 + 0x40)
			st64(cq, af, cr)
			return cn
		}
		const bv: LamportsCell = f.lamports
		const cd = f.key
		rc_inc(bv)
		const bw: DataCell = f.data
		rc_inc(bw)
		const bx: AccountInfo = ld64(ld64(s328))
		const by: LamportsCell = bx.lamports
		const bz = by.strong
		st64(s308 + 0x18, f.executable)
		st64(s308 + 0x20, f.is_writable)
		st64(s308 + 0x28, f.is_signer)
		st64(s308 + 0x30, f.rent_epoch)
		const cc = f.owner
		st64(s308 + 0x10, bx.key)
		rc_inc(by, bz)
		const ca: DataCell = bx.data
		const cb = ca.strong
		st64(s310, cc, cd, bv)
		rc_inc(ca, cb)
		const ci = bx.owner
		const ch = bx.rent_epoch
		const cg = bx.is_signer
		const cf = bx.is_writable
		const ce = bx.executable
		copyr(s70, s98, 0x20)
		st64(s28, s49)
		st64(s48 + 0x10, s70)
		st64(s48, 0x1001595c0)
		st8(s49, ld8(s71))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0x20)
		st64(s168, s48, 3)
		st64(s1f0 + 8, s168)
		st8(s1f0, cg, cf, ce)
		st64(s210, by, ca, ci, ch)
		st64(s218, ld64(s308 + 0x10))
		st8(s21f + 1, ld64(s308 + 0x18))
		st8(s21f, ld64(s308 + 0x20))
		st8(s228 + 8, ld64(s308 + 0x28))
		st64(s228, ld64(s308 + 0x30))
		st64(s240 + 0x10, ld64(s310))
		st64(s240 + 8, bw)
		copyr(s248, s308, 0x10)
		st64(s1e0, 1)
		st64(s260, 0, 8, 0)
		cn = system_program_assign_13ff40(s290, s260, ld64(ld64(ld64(s308 + 0x38) + 0x30)))
		af = ld64(s290)
		if (af != 2) {
			cr = ld64(s290 + 8)
			cq = ld64(s308 + 0x40)
			st64(cq, af, cr)
			return cn
		}
	} else {
		const p = fn_1476d8(ld64(b + 8), 0x728)
		const h: AccountInfo = ld64(ld64(b + 0x10))
		const i: LamportsCell = h.lamports
		const v = h.key
		rc_inc(i)
		st64(s308 + 0x30, p)
		const q: DataCell = h.data
		rc_inc(q)
		st64(s308 + 0x28, q)
		const r: LamportsCell = f.lamports
		const s = r.strong
		st64(s308, f.key)
		st64(s308 + 8, h.executable)
		st64(s308 + 0x10, h.is_writable)
		st64(s308 + 0x18, h.is_signer)
		st64(s308 + 0x20, h.rent_epoch)
		const t = h.owner
		rc_inc(r, s)
		st64(s310, t)
		const u: DataCell = f.data
		rc_inc(u)
		st64(s320, v, i)
		const w: AccountInfo = ld64(ld64(b + 0x18))
		const x: LamportsCell = w.lamports
		const y = x.strong
		st64(s348, f.executable)
		st64(s340, f.is_writable)
		st64(s338, f.is_signer)
		st64(s330, f.rent_epoch)
		st64(s328, f.owner)
		const z = w.key
		rc_inc(x, y)
		st64(s350, z)
		const aa: DataCell = w.data
		rc_inc(aa)
		st64(s358, w.owner)
		st64(s360, w.rent_epoch)
		st64(s368, w.is_signer)
		const ae = w.is_writable
		const ad = w.executable
		const ab = ld64(ld64(ld64(b + 0x20)))
		copyr(s70, ab, 0x20)
		const ac = ld8(ld64(b + 0x28))
		st64(s28, s49)
		st64(s48 + 0x10, s70)
		st64(s48, 0x1001595c0)
		st8(s49, ac)
		st64(s168, s48)
		st64(s1e0 + 0x28, s168)
		st8(s1e0 + 0x22, ld64(s348))
		st8(s1e0 + 0x21, ld64(s340))
		st8(s1e0 + 0x20, ld64(s338))
		st64(s1e0 + 0x18, ld64(s330))
		st64(s1e0 + 0x10, ld64(s328))
		st64(s1e0, r, u)
		st64(s1f0 + 8, ld64(s308))
		st8(s1f0 + 2, ld64(s308 + 8))
		st8(s1f0 + 1, ld64(s308 + 0x10))
		st8(s1f0, ld64(s308 + 0x18))
		st64(s210 + 0x18, ld64(s308 + 0x20))
		st64(s210 + 0x10, ld64(s310))
		st64(s210 + 8, ld64(s308 + 0x28))
		copyr(s218, s320, 0x10)
		st8(s21f, ae, ad)
		st8(s228 + 8, ld64(s368))
		st64(s228, ld64(s360))
		st64(s240 + 0x10, ld64(s358))
		st64(s240, x, aa)
		st64(s248, ld64(s350))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0x20)
		st64(s168 + 8, 3)
		st64(s1e0 + 0x30, 1)
		st64(s260, 0, 8, 0)
		cn = system_program_create_account(s2c0, s260, ld64(s308 + 0x30), 0x728, ld64(ld64(b + 0x30)))
		af = ld64(s2c0)
		if (af != 2) {
			cr = ld64(s2c0 + 8)
			cq = ld64(s308 + 0x40)
			st64(cq, af, cr)
			return cn
		}
	}
	const ck = ld64(s308 + 0x40)
	cn = fn_4688(s260, f)
	const cl = ld64(s260 + 8)
	const cj = ld64(s260)
	if (cj == 2) {
		st64(ck + 8, cl)
		st64(ck, 2)
		return cn
	}
	const cm = ld64(0x300000000 /* heap bump-allocator cursor */)
	cn = 0x11 > cm
	const co = cn != 0 ? 0 : cm - 0x11
	const cp = cm != 0 ? co : 0x300007fef
	if ((cj & 1) != 0) {
		if (0x300000008 > cp) {
			raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, co)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, cp)
		st64(cp + 8, 0x616d7469625f7961)
		st64(cp, 0x7272615f6b636974)
		st8(cp + 0x10, 0x70)
		void ld64(cl)
	} else {
		if (0x300000008 > cp) {
			raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, co)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, cp)
		st64(cp + 8, 0x616d7469625f7961)
		st64(cp, 0x7272615f6b636974)
		st8(cp + 0x10, 0x70)
		void ld64(cl)
	}
	st64(cl + 0x10, cp, 0x11)
	st64(cl + 8, 0x11)
	st64(cl, 1)
	st64(ck + 8, cl)
	st64(ck, cj)
	return cn
}

// types [heur]: b: AccountInfo (every call passes one: fn_1a610, fn_44080, fn_55688, …)
function fn_7e058(a: u64, b: AccountInfo, c: u64, d: u64, r0: u64): u64 {
	const s10 = fp - 0x10, s68 = fp - 0x68, s80 = fp - 0x80, sa8 = fp - 0xa8, sd8 = fp - 0xd8, se8 = fp - 0xe8, s108 = fp - 0x108, s128 = fp - 0x128, s148 = fp - 0x148, s158 = fp - 0x158, s160 = fp - 0x160
	let r: u64
	if (c != 0) {
		st64(s160, a)
		const f = ld64(ld64(d + 0x58))
		const j = ld64(f)
		const i = ld64(f + 8)
		const h = ld64(f + 0x10)
		const g = ld64(f + 0x18)
		st64(s128, j, i, h, g, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */, 0x10015a827, 0xc, s128, 0x20)
		// PDA find_program_address(["support_mint", *s128], program *s108)
		Pubkey_find_program_address(s80, se8, 2, s108)
		copyr(s148, s80, 0x20)
		st64(s158, sd8, sa8)
		let k = b + 0x10
		let l = c * 0x30
		while (true) {
			const m = ld64(k + 8)
			copyr(s80, s108, 0x20)
			r0 = memcmp(m, s80, 0x20) as u32
			if (r0 == 0) {
				const n = ld64(k - 0x10)
				copyr(s80, n, 0x20)
				r0 = memcmp(s80, s148, 0x20) as u32
				if (r0 == 0) {
					const o = ld64(k)
					const p = ld64(o + 0x10)
					if (p > 0x7ffffffffffffffe) {
						fn_14e808(0x100160590, 0x7ffffffffffffffe)
					}
					st64(o + 0x10, p + 1)
					const q = ld64(o + 0x18)
					st64(s10 + 8, ld64(o + 0x20))
					st64(s10, q)
					r0 = fn_110d30(s80, s10)
					if (ld64(s80) != 0) {
						const t = ld64(s80 + 8)
						const s = ld64(s160)
						st64(s + 8, ld64(s80 + 0x10))
						st64(s, t)
						st64(o + 0x10, ld64(o + 0x10) - 1)
						return r0
					}
					memcpy(ld64(s158), s68, 0x58)
					st64(o + 0x10, ld64(o + 0x10) - 1)
					copyr(s80, s128, 0x20)
					r0 = memcmp(ld64(s158 + 8), s80, 0x20) as u32
					if (r0 == 0) {
						r = ld64(s160)
						st8(r + 8, 1)
						st64(r, 2)
						return r0
					}
				}
			}
			k = k + 0x30
			l = l - 0x30
			if (l == 0) {
				r = ld64(s160)
				st8(r + 8, 0)
				st64(r, 2)
				return r0
			}
		}
	}
	st64(a, 2)
	st8(a + 8, 0)
	return r0
}

function fn_7e560(a: u64, b: u64, c: u64): u64 {
	const s68 = fp - 0x68, s90 = fp - 0x90, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8
	let n, ab, ac: u64
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
		n = memcmp(m, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32
		if (n != 0 && c == 0) {
			const q = AccountInfo_try_borrow_data(s68, sb8, n)
			const w = ld64(s68 + 0x10)
			const p = ld64(s68 + 8)
			const o = ld64(s68)
			if (o == 0x800000000000001a /* Ok */) {
				const y = fn_e948(s68, ld64(p), ld64(p + 8), undef, undef, q)
				if (ld32(s68) == 2) {
					const r = ld64(s68 + 0x18)
					st64(s90 + 0x20, r)
					const s = ld64(s68 + 0x10)
					st64(s90 + 0x18, s)
					const t = ld64(s68 + 8)
					st64(s90 + 0x10, t)
					st64(s68, t, s, r)
					n = fn_13e628(se8, s68)
					ac = ld64(se8)
					ab = ld64(se8 + 8)
				} else {
					n = fn_132c40(s68, ld64(s68 + 0x58), ld64(s68 + 0x60), y)
					const z = ld64(s68 + 0x10)
					let aa = ld64(s68 + 8)
					if (ld64(s68) != 0x8000000000000000) {
						if (z == 0) {
							st64(a, 2)
							st8(a + 8, 1)
							st64(w, ld64(w) - 1)
							return ptr_drop_in_place_fcd8(sb8, n)
						}
						let ae = z << 1
						while (true) {
							const ad = ld16(aa)
							if (0x19 >= ad && ((1 << (ad & 0x3f)) & 0x20c0402) != 0) {
								aa = aa + 2
								ae = ae - 2
								if (ae == 0) {
									st64(a, 2)
									st8(a + 8, 1)
									st64(w, ld64(w) - 1)
									return ptr_drop_in_place_fcd8(sb8, n)
								}
								continue
							}
							st64(a, 2)
							st8(a + 8, 0)
							st64(w, ld64(w) - 1)
							break B9
						}
					}
					st64(s68 + 0x10, ld64(s68 + 0x18))
					st64(s68, aa, z)
					n = fn_13e628(sd8, s68)
					ac = ld64(sd8)
					ab = ld64(sd8 + 8)
				}
				st64(a + 8, ab)
				st64(a, ac)
				st64(w, ld64(w) - 1)
			} else {
				st64(s68, o, p, w)
				n = fn_13e628(sc8, s68)
				const x = ld64(sc8)
				st64(a + 8, ld64(sc8 + 8))
				st64(a, x)
			}
		} else {
			st64(a, 2)
			st8(a + 8, 1)
		}
	}
	const u: LamportsCell = ld64(sb0)
	if (rc_release(u)) {
		n = Rc_drop_slow_14df0(sb0, n)
	}
	const v: DataCell = ld64(sa8)
	if (!rc_release(v)) {
		return n
	}
	return Rc_drop_slow_14df0(sa8, n)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
function fn_85138(a: u64, b: u64) {
	let h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, aa, ab, ac, ad, ae, af, ag, ah, ai, aj, ak, al, am: u64
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const f = ld32(b)
	if ((f as i64) > 0x19) {
		if ((f as i64) > 0x26) {
			if ((f as i64) > 0x2c) {
				if ((f as i64) > 0x2f) {
					if ((f as i64) > 0x31) {
						if (f == 0x32) {
							aa = 0x17 > g
							ab = aa != 0 ? 0 : g - 0x17
							j = g != 0 ? ab : 0x300007fe9
							if (0x300000007 >= j) {
								raw_vec_handle_error(1, 0x17, 0x10015f8f8, ab, aa)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, j)
							st64(j + 0xf, 0x323230326d617267)
							st64(j + 8, 0x676f72506e656b6f)
							st64(j, 0x54676e697373694d)
							st64(a + 8, j, 0x17)
							st64(a, 0x17)
						} else {
							ae = 0x26 > g
							af = ae != 0 ? 0 : g - 0x26
							j = g != 0 ? af : 0x300007fda
							if (0x300000007 >= j) {
								raw_vec_handle_error(1, 0x26, 0x10015f8f8, af, ae)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, j)
							st64(j + 0x1e, 0x746e756f6363416e)
							st64(j + 0x18, 0x416e6f69736e6574)
							st64(j + 0x10, 0x784570616d746942)
							st64(j + 8, 0x79617272416b6369)
							st64(j, 0x5464696c61766e49)
							st64(a + 8, j, 0x26)
							st64(a, 0x26)
						}
					} else if (f == 0x30) {
						j = g != 0 ? sat_sub(g, 0xf) : 0x300007ff1
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0xf, 0x10015f8f8, sat_sub(g, 0xf), 0xf > g)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 7, 0x67616c4665736142)
						st64(j, 0x42676e697373694d)
						st64(a + 8, j, 0xf)
						st64(a, 0xf)
					} else {
						w = 0x12 > g
						x = w != 0 ? 0 : g - 0x12
						j = g != 0 ? x : 0x300007fee
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x12, 0x10015f8f8, x, w)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 8, 0x756f636341746e69)
						st64(j, 0x4d676e697373694d)
						st16(j + 0x10, 0x746e)
						st64(a + 8, j, 0x12)
						st64(a, 0x12)
					}
				} else if (f == 0x2d) {
					ac = 0xc > g
					ad = ac != 0 ? 0 : g - 0xc
					j = g != 0 ? ad : 0x300007ff4
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0xc, 0x10015f8f8, ad, ac)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j, 0x4664696c61766e49)
					st32(j + 8, 0x6e4f6565)
					st64(a + 8, j, 0xc)
					st64(a, 0xc)
				} else if (f == 0x2e) {
					u = 0xd > g
					v = u != 0 ? 0 : g - 0xd
					j = g != 0 ? v : 0x300007ff3
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0xd, 0x10015f8f8, v, u)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 5, 0x6563697250747271)
					st64(j, 0x747271536f72655a)
					st64(a + 8, j, 0xd)
					st64(a, 0xd)
				} else {
					u = 0xd > g
					v = u != 0 ? 0 : g - 0xd
					j = g != 0 ? v : 0x300007ff3
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0xd, 0x10015f8f8, v, u)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 5, 0x7974696469757169)
					st64(j, 0x7571694c6f72655a)
					st64(a + 8, j, 0xd)
					st64(a, 0xd)
				}
			} else if ((f as i64) > 0x29) {
				if (f == 0x2a) {
					aa = 0x17 > g
					ab = aa != 0 ? 0 : g - 0x17
					j = g != 0 ? ab : 0x300007fe9
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x17, 0x10015f8f8, ab, aa)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0xf, 0x746e756f6d417265)
					st64(j + 8, 0x6564724f74696d69)
					st64(j, 0x4c64696c61766e49)
					st64(a + 8, j, 0x17)
					st64(a, 0x17)
				} else if (f == 0x2b) {
					y = 0x13 > g
					z = y != 0 ? 0 : g - 0x13
					j = g != 0 ? z : 0x300007fed
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x13, 0x10015f8f8, z, y)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 8, 0x6172757461536573)
					st64(j, 0x616850726564724f)
					st32(j + 0xf, 0x64657461)
					st64(a + 8, j, 0x13)
					st64(a, 0x13)
				} else {
					j = g != 0 ? sat_sub(g, 0x1d) : 0x300007fe3
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x1d, 0x10015f8f8, sat_sub(g, 0x1d), 0x1d > g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x15, 0x736d617261506769)
					st64(j + 0x10, 0x506769666e6f4365)
					st64(j + 8, 0x654663696d616e79)
					st64(j, 0x4464696c61766e49)
					st64(a + 8, j, 0x1d)
					st64(a, 0x1d)
				}
			} else if (f == 0x27) {
				ak = 0x1c > g
				al = ak != 0 ? 0 : g - 0x1c
				j = g != 0 ? al : 0x300007fe4
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x1c, 0x10015f8f8, al, ak)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x10, 0x4d746f4e6574616c)
				st64(j + 8, 0x75636c6143656546)
				st64(j, 0x726566736e617254)
				st32(j + 0x18, 0x68637461)
				st64(a + 8, j, 0x1c)
				st64(a, 0x1c)
			} else if (f == 0x28) {
				w = 0x12 > g
				x = w != 0 ? 0 : g - 0x12
				j = g != 0 ? x : 0x300007fee
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x12, 0x10015f8f8, x, w)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x6c6c694679646165)
				st64(j, 0x726c41726564724f)
				st16(j + 0x10, 0x6465)
				st64(a + 8, j, 0x12)
				st64(a, 0x12)
			} else {
				m = 0x11 > g
				n = m != 0 ? 0 : g - 0x11
				j = g != 0 ? n : 0x300007fef
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, n, m)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x7361685072656472)
				st64(j, 0x4f64696c61766e49)
				st8(j + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
				st64(a + 8, j, 0x11)
				st64(a, 0x11)
			}
		} else if ((f as i64) > 0x1f) {
			if ((f as i64) > 0x22) {
				if ((f as i64) > 0x24) {
					if (f == 0x25) {
						k = 0x10 > g
						l = k != 0 ? 0 : g - 0x10
						j = g != 0 ? l : 0x300007ff0
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 8, 0x776f6c667265764f)
						st64(j, 0x6e656b6f5478614d)
						st64(a + 8, j, 0x10)
						st64(a, 0x10)
					} else {
						m = 0x11 > g
						n = m != 0 ? 0 : g - 0x11
						j = g != 0 ? n : 0x300007fef
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x11, 0x10015f8f8, n, m)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 8, 0x6f6c667265764f65)
						st64(j, 0x74616c75636c6143)
						st8(j + 0x10, 0x77)
						st64(a + 8, j, 0x11)
						st64(a, 0x11)
					}
				} else if (f == 0x23) {
					ae = 0x26 > g
					af = ae != 0 ? 0 : g - 0x26
					j = g != 0 ? af : 0x300007fda
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x26, 0x10015f8f8, af, ae)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x1e, 0x746e756f6363416e)
					st64(j + 0x18, 0x416e6f69736e6574)
					st64(j + 0x10, 0x784570616d746942)
					st64(j + 8, 0x79617272416b6369)
					st64(j, 0x54676e697373694d)
					st64(a + 8, j, 0x26)
					st64(a, 0x26)
				} else {
					j = g != 0 ? sat_sub(g, 0x21) : 0x300007fdf
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x21, 0x10015f8f8, sat_sub(g, 0x21), 0x21 > g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x18, 0x6f69746365726944)
					st64(j + 0x10, 0x726f467974696469)
					st64(j + 8, 0x7571694c746e6569)
					st64(j, 0x6369666675736e49)
					st8(j + 0x20, 0x6e)
					st64(a + 8, j, 0x21)
					st64(a, 0x21)
				}
			} else if (f == 0x20) {
				ag = 0x1f > g
				ah = ag != 0 ? 0 : g - 0x1f
				j = g != 0 ? ah : 0x300007fe1
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x1f, 0x10015f8f8, ah, ag)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x17, 0x736e6f697373696d)
				st64(j + 0x10, 0x6d45647261776552)
				st64(j + 8, 0x6574616470556576)
				st64(j, 0x6f72707041746f4e)
				st64(a + 8, j, 0x1f)
				st64(a, 0x1f)
			} else if (f == 0x21) {
				aa = 0x17 > g
				ab = aa != 0 ? 0 : g - 0x17
				j = g != 0 ? ab : 0x300007fe9
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x17, 0x10015f8f8, ab, aa)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0xf, 0x6f666e4964726177)
				st64(j + 8, 0x77655264657a696c)
				st64(j, 0x616974696e496e55)
				st64(a + 8, j, 0x17)
				st64(a, 0x17)
			} else {
				q = 0xe > g
				r = q != 0 ? 0 : g - 0xe
				j = g != 0 ? r : 0x300007ff2
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0xe, 0x10015f8f8, r, q)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 6, 0x746e694d74726f70)
				st64(j, 0x6f70707553746f4e)
				st64(a + 8, j, 0xe)
				st64(a, 0xe)
			}
		} else if ((f as i64) > 0x1c) {
			if (f == 0x1d) {
				o = 0x16 > g
				p = o != 0 ? 0 : g - 0x16
				j = g != 0 ? p : 0x300007fea
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x16, 0x10015f8f8, p, o)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0xe, 0x6d6172615074696e)
				st64(j + 8, 0x696e496472617765)
				st64(j, 0x5264696c61766e49)
				st64(a + 8, j, 0x16)
				st64(a, 0x16)
			} else if (f == 0x1e) {
				ag = 0x1f > g
				ah = ag != 0 ? 0 : g - 0x1f
				j = g != 0 ? ah : 0x300007fe1
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x1f, 0x10015f8f8, ah, ag)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x17, 0x7265626d754e746e)
				st64(j + 0x10, 0x6e756f6363417475)
				st64(j + 8, 0x706e496472617765)
				st64(j, 0x5264696c61766e49)
				st64(a + 8, j, 0x1f)
				st64(a, 0x1f)
			} else {
				y = 0x13 > g
				z = y != 0 ? 0 : g - 0x13
				j = g != 0 ? z : 0x300007fed
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x13, 0x10015f8f8, z, y)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x7265506472617765)
				st64(j, 0x5264696c61766e49)
				st32(j + 0xf, 0x646f6972)
				st64(a + 8, j, 0x13)
				st64(a, 0x13)
			}
		} else if (f == 0x1a) {
			q = 0xe > g
			r = q != 0 ? 0 : g - 0xe
			j = g != 0 ? r : 0x300007ff2
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0xe, 0x10015f8f8, r, q)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 6, 0x6f666e4964726177)
			st64(j, 0x617765526c6c7546)
			st64(a + 8, j, 0xe)
			st64(a, 0xe)
		} else if (f == 0x1b) {
			aa = 0x17 > g
			ab = aa != 0 ? 0 : g - 0x17
			j = g != 0 ? ab : 0x300007fe9
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x17, 0x10015f8f8, ab, aa)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 0xf, 0x6573556e49796461)
			st64(j + 8, 0x6165726c416e656b)
			st64(j, 0x6f54647261776552)
			st64(a + 8, j, 0x17)
			st64(a, 0x17)
		} else {
			k = 0x10 > g
			l = k != 0 ? 0 : g - 0x10
			j = g != 0 ? l : 0x300007ff0
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x746e694d64726177)
			st64(j, 0x6552747065637845)
			st64(a + 8, j, 0x10)
			st64(a, 0x10)
		}
	} else if ((f as i64) > 0xc) {
		if ((f as i64) > 0x12) {
			if ((f as i64) > 0x15) {
				if ((f as i64) > 0x17) {
					if (f == 0x18) {
						ak = 0x1c > g
						al = ak != 0 ? 0 : g - 0x1c
						j = g != 0 ? al : 0x300007fe4
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x1c, 0x10015f8f8, al, ak)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 0x10, 0x6363417961727241)
						st64(j + 8, 0x6b63695474737269)
						st64(j, 0x4664696c61766e49)
						st32(j + 0x18, 0x746e756f)
						st64(a + 8, j, 0x1c)
						st64(a, 0x1c)
					} else {
						w = 0x12 > g
						x = w != 0 ? 0 : g - 0x12
						j = g != 0 ? x : 0x300007fee
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x12, 0x10015f8f8, x, w)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 8, 0x646e496472617765)
						st64(j, 0x5264696c61766e49)
						st16(j + 0x10, 0x7865)
						st64(a + 8, j, 0x12)
						st64(a, 0x12)
					}
				} else if (f == 0x16) {
					j = g != 0 ? sat_sub(g, 0x1b) : 0x300007fe5
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x1b, 0x10015f8f8, sat_sub(g, 0x1b), 0x1b > g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x10, 0x6f6d417475707475)
					st64(j + 8, 0x4f724f7475706e49)
					st64(j, 0x6c6c616d536f6f54)
					st32(j + 0x17, 0x746e756f)
					st64(a + 8, j, 0x1b)
					st64(a, 0x1b)
				} else {
					j = g != 0 ? sat_sub(g, 0x19) : 0x300007fe7
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x19, 0x10015f8f8, sat_sub(g, 0x19), 0x19 > g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x10, 0x6e756f6363417961)
					st64(j + 8, 0x7272416b63695468)
					st64(j, 0x67756f6e45746f4e)
					st8(j + 0x18, 0x74)
					st64(a + 8, j, 0x19)
					st64(a, 0x19)
				}
			} else if (f == 0x13) {
				k = 0x10 > g
				l = k != 0 ? 0 : g - 0x10
				j = g != 0 ? l : 0x300007ff0
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x646961507475706e)
				st64(j, 0x496863754d6f6f54)
				st64(a + 8, j, 0x10)
				st64(a, 0x10)
			} else if (f == 0x14) {
				y = 0x13 > g
				z = y != 0 ? 0 : g - 0x13
				j = g != 0 ? z : 0x300007fed
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x13, 0x10015f8f8, z, y)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x666963657053746e)
				st64(j, 0x756f6d416f72655a)
				st32(j + 0xf, 0x64656966)
				st64(a + 8, j, 0x13)
				st64(a, 0x13)
			} else {
				s = 0x15 > g
				t = s != 0 ? 0 : g - 0x15
				j = g != 0 ? t : 0x300007feb
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x15, 0x10015f8f8, t, s)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0xd, 0x746c7561566c6f6f)
				st64(j + 8, 0x6c6f6f507475706e)
				st64(j, 0x4964696c61766e49)
				st64(a + 8, j, 0x15)
				st64(a, 0x15)
			}
		} else if ((f as i64) > 0xf) {
			if (f == 0x10) {
				s = 0x15 > g
				t = s != 0 ? 0 : g - 0x15
				j = g != 0 ? t : 0x300007feb
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x15, 0x10015f8f8, t, s)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0xd, 0x746e656963696666)
				st64(j + 8, 0x69666675736e4979)
				st64(j, 0x746964697571694c)
				st64(a + 8, j, 0x15)
				st64(a, 0x15)
			} else if (f == 0x11) {
				w = 0x12 > g
				x = w != 0 ? 0 : g - 0x12
				j = g != 0 ? x : 0x300007fee
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x12, 0x10015f8f8, x, w)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x6568436567617070)
				st64(j, 0x696c536563697250)
				st16(j + 0x10, 0x6b63)
				st64(a + 8, j, 0x12)
				st64(a, 0x12)
			} else {
				aa = 0x17 > g
				ab = aa != 0 ? 0 : g - 0x17
				j = g != 0 ? ab : 0x300007fe9
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x17, 0x10015f8f8, ab, aa)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0xf, 0x6465766965636552)
				st64(j + 8, 0x5274757074754f65)
				st64(j, 0x6c7474694c6f6f54)
				st64(a + 8, j, 0x17)
				st64(a, 0x17)
			}
		} else {
			if (f == 0xd) {
				ai = 0x14 > g
				aj = ai != 0 ? 0 : g - 0x14
				j = g != 0 ? aj : 0x300007fec
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, aj, ai)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				am = 0x756c615662755379
			} else {
				if (f != 0xe) {
					j = g != 0 ? sat_sub(g, 0x20) : 0x300007fe0
					if (j > 0x300000007) {
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 0x18, 0x7974696469757169)
						st64(j + 0x10, 0x4c796c7070755372)
						st64(j + 8, 0x6f466f72655a6874)
						st64(j, 0x6f42646962726f46)
						st64(a + 8, j, 0x20)
						st64(a, 0x20)
						return
					}
					raw_vec_handle_error(1, 0x20, 0x10015f8f8, sat_sub(g, 0x20), 0x20 > g)
				}
				ai = 0x14 > g
				aj = ai != 0 ? 0 : g - 0x14
				j = g != 0 ? aj : 0x300007fec
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, aj, ai)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				am = 0x756c615664644179
			}
			st64(j + 8, am)
			st64(j, 0x746964697571694c)
			st32(j + 0x10, 0x72724565)
			st64(a + 8, j, 0x14)
			st64(a, 0x14)
		}
	} else if ((f as i64) > 5) {
		if ((f as i64) > 8) {
			if ((f as i64) > 0xa) {
				if (f == 0xb) {
					o = 0x16 > g
					p = o != 0 ? 0 : g - 0x16
					j = g != 0 ? p : 0x300007fea
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x16, 0x10015f8f8, p, o)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0xe, 0x776f6c667265764f)
					st64(j + 8, 0x764f74696d694c65)
					st64(j, 0x6369725074727153)
					st64(a + 8, j, 0x16)
					st64(a, 0x16)
				} else {
					ac = 0xc > g
					ad = ac != 0 ? 0 : g - 0xc
					j = g != 0 ? ad : 0x300007ff4
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0xc, 0x10015f8f8, ad, ac)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j, 0x6369725074727153)
					st32(j + 8, 0x34365865)
					st64(a + 8, j, 0xc)
					st64(a, 0xc)
				}
			} else if (f == 9) {
				k = 0x10 > g
				l = k != 0 ? 0 : g - 0x10
				j = g != 0 ? l : 0x300007ff0
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x79617272416b6369)
				st64(j, 0x5464696c61766e49)
				st64(a + 8, j, 0x10)
				st64(a, 0x10)
			} else {
				j = g != 0 ? sat_sub(g, 0x18) : 0x300007fe8
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x18, 0x10015f8f8, sat_sub(g, 0x18), 0x18 > g)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x10, 0x797261646e756f42)
				st64(j + 8, 0x79617272416b6369)
				st64(j, 0x5464696c61766e49)
				st64(a + 8, j, 0x18)
				st64(a, 0x18)
			}
		} else if (f == 6) {
			m = 0x11 > g
			n = m != 0 ? 0 : g - 0x11
			j = g != 0 ? n : 0x300007fef
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, n, m)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x6f6c667265764f72)
			st64(j, 0x65776f4c6b636954)
			st8(j + 0x10, 0x77)
			st64(a + 8, j, 0x11)
			st64(a, 0x11)
		} else if (f == 7) {
			m = 0x11 > g
			n = m != 0 ? 0 : g - 0x11
			j = g != 0 ? n : 0x300007fef
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, n, m)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x6f6c667265764f72)
			st64(j, 0x657070556b636954)
			st8(j + 0x10, 0x77)
			st64(a + 8, j, 0x11)
			st64(a, 0x11)
		} else {
			o = 0x16 > g
			p = o != 0 ? 0 : g - 0x16
			j = g != 0 ? p : 0x300007fea
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x16, 0x10015f8f8, p, o)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 0xe, 0x686374614d746f4e)
			st64(j + 8, 0x6f4e676e69636170)
			st64(j, 0x53646e416b636954)
			st64(a + 8, j, 0x16)
			st64(a, 0x16)
		}
	} else if ((f as i64) > 2) {
		if (f == 3) {
			k = 0x10 > g
			l = k != 0 ? 0 : g - 0x10
			j = g != 0 ? l : 0x300007ff0
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x7272456e6f697469)
			st64(j, 0x736f5065736f6c43)
			st64(a + 8, j, 0x10)
			st64(a, 0x10)
		} else if (f == 4) {
			k = 0x10 > g
			l = k != 0 ? 0 : g - 0x10
			j = g != 0 ? l : 0x300007ff0
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x7865646e496b6369)
			st64(j, 0x5464696c61766e49)
			st64(a + 8, j, 0x10)
			st64(a, 0x10)
		} else {
			k = 0x10 > g
			l = k != 0 ? 0 : g - 0x10
			j = g != 0 ? l : 0x300007ff0
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x726564724f64696c)
			st64(j, 0x61766e496b636954)
			st64(a + 8, j, 0x10)
			st64(a, 0x10)
		}
	} else if (f == 0) {
		h = 0xb > g
		i = h != 0 ? 0 : g - 0xb
		j = g != 0 ? i : 0x300007ff5
		if (0x300000007 >= j) {
			raw_vec_handle_error(1, 0xb, 0x10015f8f8, i, h)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st64(j, 0x6f72707041746f4e)
		st32(j + 7, 0x6465766f)
		st64(a + 8, j, 0xb)
		st64(a, 0xb)
	} else if (f == 1) {
		aa = 0x17 > g
		ab = aa != 0 ? 0 : g - 0x17
		j = g != 0 ? ab : 0x300007fe9
		if (0x300000007 >= j) {
			raw_vec_handle_error(1, 0x17, 0x10015f8f8, ab, aa)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st64(j + 0xf, 0x67616c466769666e)
		st64(j + 8, 0x6e6f436574616470)
		st64(j, 0x5564696c61766e49)
		st64(a + 8, j, 0x17)
		st64(a, 0x17)
	} else {
		h = 0xb > g
		i = h != 0 ? 0 : g - 0xb
		j = g != 0 ? i : 0x300007ff5
		if (0x300000007 >= j) {
			raw_vec_handle_error(1, 0xb, 0x10015f8f8, i, h)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st64(j, 0x4c746e756f636341)
		st32(j + 7, 0x6b63614c)
		st64(a + 8, j, 0xb)
		st64(a, 0xb)
	}
}

function fn_88558(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s30 = fp - 0x30
	const f = ld32(a)
	st64(s30, (f as i64) > 0x19 ? (f as i64) > 0x26 ? (f as i64) > 0x2c ? (f as i64) > 0x2f ? (f as i64) > 0x31 ? f != 0x32 ? 0x100160950 : 0x100160940 : f != 0x30 ? 0x100160930 : 0x100160920 : f != 0x2d ? f != 0x2e ? 0x100160910 : 0x100160900 : 0x1001608f0 : (f as i64) > 0x29 ? f != 0x2a ? f != 0x2b ? 0x1001608e0 : 0x1001608d0 : 0x1001608c0 : f != 0x27 ? f != 0x28 ? 0x1001608b0 : 0x1001608a0 : 0x100160890 : (f as i64) > 0x1f ? (f as i64) > 0x22 ? (f as i64) > 0x24 ? f != 0x25 ? 0x100160880 : 0x100160870 : f != 0x23 ? 0x100160860 : 0x100160850 : f != 0x20 ? f != 0x21 ? 0x100160840 : 0x100160830 : 0x100160820 : (f as i64) > 0x1c ? f != 0x1d ? f != 0x1e ? 0x100160810 : 0x100160800 : 0x1001607f0 : f != 0x1a ? f != 0x1b ? 0x1001607e0 : 0x1001607d0 : 0x1001607c0 : (f as i64) > 0xc ? (f as i64) > 0x12 ? (f as i64) > 0x15 ? (f as i64) > 0x17 ? f != 0x18 ? 0x1001607b0 : 0x1001607a0 : f != 0x16 ? 0x100160790 : 0x100160780 : f != 0x13 ? f != 0x14 ? 0x100160770 : 0x100160760 : 0x100160750 : (f as i64) > 0xf ? f != 0x10 ? f != 0x11 ? 0x100160740 : 0x100160730 : 0x100160720 : f != 0xd ? f != 0xe ? 0x100160710 : 0x100160700 : 0x1001606f0 : (f as i64) > 5 ? (f as i64) > 8 ? (f as i64) > 0xa ? f != 0xb ? 0x1001606e0 : 0x1001606d0 : f != 9 ? 0x1001606c0 : 0x1001606b0 : f != 6 ? f != 7 ? 0x1001606a0 : 0x100160690 : 0x100160680 : (f as i64) > 2 ? f != 3 ? f != 4 ? 0x100160670 : 0x100160660 : 0x100160650 : f != 0 ? f != 1 ? 0x100160640 : 0x100160630 : 0x100160620, 1, 8, 0, 0)
	const g = ld64(b + 0x28)
	return fn_f5d8(ld64(b + 0x20), g, s30, g, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_13e5a0(a: u64, b: u64): u64 {
	const f = __rust_alloc(0xa0, 8)
	if (f == 0) {
		alloc_handle_alloc_error(8, 0xa0)
	}
	const g = memcpy(f, b, 0xa0)
	st64(a + 8, f)
	st64(a, 0)
	return g
}

// types [heur]: b: AccountInfo (every call passes one: fn_1a610, fn_55688, fn_569a8)
function fn_6490(a: u64, b: AccountInfo, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let g: u64
	if (b.is_writable != 0) {
		const f: DataCell = b.data
		if (f.borrow == 0) {
			f.borrow = -1
			const h = f.len
			if (h > 7) {
				const i = f.ptr
				let j = ld8(i)
				if (j == 0) {
					j = ld8(i + 1)
					if (j == 0) {
						j = ld8(i + 2)
						if (j == 0) {
							j = ld8(i + 3)
							if (j == 0) {
								j = ld8(i + 4)
								if (j == 0) {
									j = ld8(i + 5)
									if (j == 0) {
										j = ld8(i + 6)
										if (j == 0) {
											j = ld8(i + 7)
											if (j == 0) {
												if (h > 0x607) {
													st64(a + 0x10, f + 0x10)
													st64(a + 8, i + 8)
													st64(a, 0)
													return r0
												}
												fn_153158(0x608, h, 0x10015f748, d, e)
											}
										}
									}
								}
							}
						}
					}
				}
				r0 = anchor_error_from(s48, 0xbb8 /* anchor::AccountDiscriminatorAlreadySet */, j, d, e)
				const k = ld64(s48)
				st64(a + 0x10, ld64(s48 + 8))
				st64(a + 8, k)
				st64(a, 1)
				f.borrow = f.borrow + 1
				return r0
			}
			fn_153158(8, h, 0x10015f730, d, e)
		}
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		r0 = fn_13e628(s38, s18)
		g = ld64(s38)
		st64(a + 0x10, ld64(s38 + 8))
		st64(a + 8, g)
		st64(a, 1)
		return r0
	}
	r0 = anchor_error_from(s28, 0xbbe /* anchor::AccountNotMutable */, c, d, e)
	g = ld64(s28)
	st64(a + 0x10, ld64(s28 + 8))
	st64(a + 8, g)
	st64(a, 1)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), c (value)
function fn_65410(a: u64, b: u64, c: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s180 = fp - 0x180, s190 = fp - 0x190, s1000 = fp - 0x1000
	let m, n, ai: u64
	const f = c + (b >= 0x100013b50)
	if ((f != 0xfffec4b2 ? 0xfffec4b1 > f - 1 : 0x845c1aa84e681c4b > b + 0xfffffffefffec4b0) != 0) {
		const h = c != 0 ? clz(c) : clz(b) + 0x40
		const i = (0x7f - h << 0x20) + 0xffffffc000000000
		const j = (0x7f - h << 0x20) > i
		if (0x40 > h) {
			__multi3_158e18(s148, b, c, (0x40 - h) as i32, i)
			m = ld64(s148 + 8)
			n = ld64(s148)
		} else {
			__multi3_158fe8(s138, b, c, (h ^ 0x40) as i32)
			m = ld64(s138 + 8)
			n = ld64(s138)
		}
		let s = 0x8000000000000000
		let k = 0
		let l = 0x10
		let w = 0
		let an = 0
		while (true) {
			let al = k
			const am = l
			__multi3_159030(s168, m, 0, n, 0)
			__multi3_159030(s158, n, 0, n, 0)
			const v = an
			const r = ld64(s168 + 8) != 0
			const o = ld64(s168)
			const p = ld64(s158 + 8)
			const q = p + (o + o)
			if (((m != 0 | r | p > q) & 1) != 0) {
				fn_1547e0(0x100160118, p > q, q, r, o + o)
			}
			const u = sar(q, 0x3f) & s
			const t = al
			const x = sar(q, 0x3f) & v
			const y = w + x + (al > al + u)
			const z = ~(w ^ x) & (w ^ y)
			al = y
			if (0 > (z as i64)) {
				fn_154730(0x100160130, z, q, y, t + u)
			}
			const ac = __multi3_158e18(s178, ld64(s158), q, (q >> 0x3f) + 0x3f, p)
			s = s >> 1 | (v << 0x3f)
			an = v >> 1
			m = ld64(s178 + 8)
			n = ld64(s178)
			l = am - 1
			k = t + u
			const aa = al
			w = al
			if ((l as u32) == 0) {
				const ab = i + (t + u >> 0x20 | (aa << 0x20))
				st64(s180, 0)
				st64(s1000, 0, s180)
				ai = fn_158408(s190, ab, j - 1 + sar(aa, 0x20) + (i > ab), 0x3627a301d710, fp, ac)
				if (ld64(s180) != 0) {
					fn_1547e0(0x1001600d0)
				}
				const ae = ld64(s190 + 8)
				const ad = ld64(s190)
				const af = ae + (ad >= 0x28f5c28f5c28f5c)
				const ag = ae ^ af - 1
				if (0 > ((ae & ag) as i64)) {
					fn_154788(0x1001600e8, ad, ae & ag, ag)
				}
				const ah = ae + (ad >= 0x24d217cfadfc1ac7)
				if (0 > ((~ae & (ae ^ ah)) as i64)) {
					fn_154730(0x100160100, ae ^ ah, ad >= 0x24d217cfadfc1ac7, ad + 0xdb2de8305203e539)
				}
				if (((af - 1) as u32) == (ah as u32)) {
					st32(a + 8, af - 1)
					st64(a, 2)
					return ai
				}
				ai = fn_644c8(s118, ah, ai)
				const aj = ld64(s118 + 8)
				if (ld64(s118) != 0) {
					st64(a + 8, ld64(s118 + 0x10))
					st64(a, aj)
					return ai
				}
				const ak = ld64(s118 + 0x10)
				if ((ak != c ? ak > c : aj > b) != 0) {
					st32(a + 8, af - 1)
					st64(a, 2)
					return ai
				}
				st32(a + 8, ah)
				st64(a, 2)
				return ai
			}
		}
	}
	fn_85138(s78, 0x10015985c)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x10015985c, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a469)
	st32(sf8 + 0x78, 0x177c /* error::SqrtPriceX64 */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0x8a)
	st64(s118 + 0x10, 0x27)
	st64(s118, 0)
	ai = fn_13e5a0(s128, s118)
	const g = ld64(s128)
	st64(a + 8, ld64(s128 + 8))
	st64(a, g)
	return ai
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it), c (points to it)
function fn_81db0(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64): u64 {
	const s10 = fp - 0x10, s18 = fp - 0x18, s40 = fp - 0x40, s48 = fp - 0x48, s70 = fp - 0x70, s78 = fp - 0x78, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se8 = fp - 0xe8, sf0 = fp - 0xf0, s118 = fp - 0x118, s120 = fp - 0x120, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178
	let cm = d
	const f: AccountInfo = ld64(p7)
	const g: LamportsCell = f.lamports
	const h = f.key
	rc_inc(g)
	let cs = h
	let cr = g
	let cl = b
	const i: DataCell = f.data
	const k = p9
	const l = p8
	const j = p6
	const m = p5
	rc_inc(i)
	let ck = j
	let ci = k
	let cj = l
	const n: AccountInfo = ld64(m + 0x58)
	const o: LamportsCell = n.lamports
	let cp = f.executable
	let cq = f.is_writable
	const p = f.is_signer
	const v = f.rent_epoch
	const w = f.owner
	let co = n.key
	rc_inc(o)
	let cn = p
	const q: DataCell = n.data
	rc_inc(q)
	let ct: AccountInfo = f
	const u = n.owner
	const t = n.rent_epoch
	const s = n.is_signer
	const r = n.is_writable
	let ch: AccountInfo = n
	st8(sa8 + 2, n.executable)
	st8(sa8, s, r)
	st64(sd0, co, o, q, u, t)
	st8(s78, cn, cq, cp)
	st64(sa0, cs, cr, i, w, v)
	st64(s70, 8, 0)
	st64(se8, 0, 8, 0)
	let ca = fn_12c020(s118, se8, 0x10015a834, 1)
	let x = ld64(s118)
	if (x != 2) {
		st64(a + 8, ld64(s118 + 8))
		st64(a, x)
		return ca
	}
	const y: AccountInfo = ld64(cl)
	const z: LamportsCell = y.lamports
	const ac: LamportsCell = ld64(s118 + 8)
	const ab = ct.key
	const ah = y.key
	const aq: AccountInfo = cm
	rc_inc(z)
	const aa: DataCell = y.data
	rc_inc(aa)
	cs = ab
	const ag = y.owner
	const af = y.rent_epoch
	const ae = y.is_signer
	const ad = y.is_writable
	st8(s120 + 2, y.executable)
	st8(s120, ae, ad)
	st64(s148, ah, z, aa, ag, af)
	const ai: AccountInfo = ld64(ck)
	const aj: LamportsCell = ai.lamports
	const ap = ai.key
	rc_inc(aj)
	const ak: DataCell = ai.data
	rc_inc(ak)
	const ao = ai.owner
	const an = ai.rent_epoch
	const am = ai.is_signer
	const al = ai.is_writable
	st8(sf0 + 2, ai.executable)
	st8(sf0, am, al)
	st64(s118, ap, aj, ak, ao, an)
	const ar: LamportsCell = aq.lamports
	const au = aq.key
	const ba: AccountInfo = ct
	rc_inc(ar)
	const at: DataCell = aq.data
	rc_inc(at)
	const az = aq.owner
	const ay = aq.rent_epoch
	const ax = aq.is_signer
	const aw = aq.is_writable
	const av = aq.executable
	st64(se8, au, ar, at)
	cn = av
	st8(sc0 + 2, av)
	co = aw
	st8(sc0 + 1, aw)
	cp = ax
	st8(sc0, ax)
	cq = ay
	st64(sd0 + 8, ay)
	cr = az
	st64(sd0, az)
	ca = fn_82dd0(s158, cs, s148, s118, se8, cj, ci, ac)
	x = ld64(s158)
	if (x == 2) {
		const bb: LamportsCell = ba.lamports
		const bd = ba.key
		rc_inc(bb)
		const bc: DataCell = ba.data
		rc_inc(bc)
		cl = bd
		cm = au
		const bf = ba.executable
		const bg = ba.is_writable
		const bh = ba.is_signer
		const bi = ba.rent_epoch
		const bj = ba.owner
		cs = ar
		rc_inc(ar)
		rc_inc(at)
		st8(sa8, cp, co, cn)
		st64(sc0, at, cr, cq)
		const be = cs
		st64(sd0, cm, cs)
		st8(s78, bh, bg, bf)
		st64(sa0, cl, bb, bc, bj, bi)
		st64(s70, 8, 0)
		st64(se8, 0, 8, 0)
		ca = fn_12c9e0(s168, se8)
		x = ld64(s168)
		if (x == 2) {
			const bk: AccountInfo = ct
			const bl: LamportsCell = ct.lamports
			const bs = ct.key
			rc_inc(bl)
			const bm: DataCell = bk.data
			rc_inc(bm)
			ci = ct.executable
			cj = ct.is_writable
			ck = ct.is_signer
			const bp = ct.rent_epoch
			const bn = ct.owner
			rc_inc(be)
			rc_inc(at)
			ct = bn
			const bo: LamportsCell = ch.lamports
			const bq: AccountInfo = ch
			const cg = ch.key
			rc_inc(bo)
			const br: DataCell = bq.data
			cl = bl
			rc_inc(br)
			const bt: LamportsCell = c.lamports
			const cb = c.key
			const cc = ch.executable
			const cd = ch.is_writable
			const ce = ch.is_signer
			const cf = ch.rent_epoch
			ch = ch.owner
			rc_inc(bt)
			const bu: DataCell = c.data
			rc_inc(bu)
			const by = c.owner
			const bx = c.rent_epoch
			const bw = c.is_signer
			const bv = c.is_writable
			st8(s18 + 2, c.executable)
			st8(s18, bw, bv)
			st64(s40, cb, bt, bu, by, bx)
			st8(s48, ce, cd, cc)
			st64(s70, cg, bo, br, ch, cf)
			st8(s78, cp, co, cn)
			st64(sa0, cm, cs, at, cr, cq)
			st8(sa8, ck, cj, ci)
			st64(sd0, bs, cl, bm, ct, bp)
			st64(s10, 8, 0)
			st64(se8, 0, 8, 0)
			ca = fn_128fe0(s178, se8)
			const bz = ld64(s178)
			if (bz == 2) {
				st64(a + 8, undef)
				st64(a, 2)
				return ca
			}
			st64(a + 8, ld64(s178 + 8))
			st64(a, bz)
			return ca
		}
		st64(a + 8, ld64(s168 + 8))
		st64(a, x)
		return ca
	}
	st64(a + 8, ld64(s158 + 8))
	st64(a, x)
	return ca
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
function fn_66e8(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let g: u64
	if (ld8(b + 0x29) != 0) {
		const f = ld64(b + 0x10)
		if (ld64(f + 0x10) == 0) {
			st64(f + 0x10, -1)
			const h = ld64(f + 0x20)
			if (h > 7) {
				const i = ld64(f + 0x18)
				let j = ld8(i)
				if (j == 0) {
					j = ld8(i + 1)
					if (j == 0) {
						j = ld8(i + 2)
						if (j == 0) {
							j = ld8(i + 3)
							if (j == 0) {
								j = ld8(i + 4)
								if (j == 0) {
									j = ld8(i + 5)
									if (j == 0) {
										j = ld8(i + 6)
										if (j == 0) {
											j = ld8(i + 7)
											if (j == 0) {
												if (h > 0x1182) {
													st64(a + 0x10, f + 0x10)
													st64(a + 8, i + 8)
													st64(a, 0)
													return r0
												}
												fn_153158(0x1183, h, 0x10015f748, d, e)
											}
										}
									}
								}
							}
						}
					}
				}
				r0 = anchor_error_from(s48, 0xbb8 /* anchor::AccountDiscriminatorAlreadySet */, j, d, e)
				const k = ld64(s48)
				st64(a + 0x10, ld64(s48 + 8))
				st64(a + 8, k)
				st64(a, 1)
				st64(f + 0x10, ld64(f + 0x10) + 1)
				return r0
			}
			fn_153158(8, h, 0x10015f730, d, e)
		}
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		r0 = fn_13e628(s38, s18)
		g = ld64(s38)
		st64(a + 0x10, ld64(s38 + 8))
		st64(a + 8, g)
		st64(a, 1)
		return r0
	}
	r0 = anchor_error_from(s28, 0xbbe /* anchor::AccountNotMutable */, c, d, e)
	g = ld64(s28)
	st64(a + 0x10, ld64(s28 + 8))
	st64(a + 8, g)
	st64(a, 1)
	return r0
}

function fn_697e0(a: u64, b: u64, c: u64): u64 {
	const s30 = fp - 0x30, s40 = fp - 0x40
	let i: u64
	st8(b, 0)
	let k = clock_get(s30)
	if (ld64(s30) != 0) {
		const g = ld64(s30 + 8)
		const f = ld64(s30 + 0x10)
		st64(s30 + 0x10, ld64(s30 + 0x18))
		st64(s30, g, f)
		k = fn_13e628(s40, s30)
		i = ld64(s40 + 8)
		const h = ld64(s40)
		if (h != 2) {
			st64(a + 8, i)
			st64(a, h)
			return k
		}
	} else {
		i = ld64(s30 + 0x18)
	}
	st64(b + 1, i)
	st16(b + 9, 0)
	copy(b + 0xb, c, 0x20)
	i = 0x2b
	while (true) {
		const j = b + i
		st32(j + 0x28, 0)
		st64(j + 0x20, 0)
		st64(j + 0x18, 0)
		st64(j + 0x10, 0)
		st64(j + 8, 0)
		st64(j, 0)
		i = i + 0x2c
		if (i == 0x115b) {
			st64(b + 0x1173, 0)
			st64(b + 0x116b, 0)
			st64(b + 0x1163, 0)
			st64(b + 0x115b, 0)
			st64(a + 8, i)
			st64(a, 2)
			return k
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), p5 (value)
function fn_6a7e8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64, p13: u64, p14: u64, p15: u64): u64 {
	const s27 = fp - 0x27, sa0 = fp - 0xa0, sb0 = fp - 0xb0
	let r, t: u64
	st8(b, c)
	const f = p11
	const g = ld64(ld64(f))
	st64(b + 0x19, ld64(g + 0x18))
	st64(b + 0x11, ld64(g + 0x10))
	st64(b + 9, ld64(g + 8))
	st64(b + 1, ld64(g))
	const h = p8
	copy(b + 0x21, h, 0x20)
	const i = p12
	const j = ld64(ld64(i + 0x58))
	st64(b + 0x59, ld64(j + 0x18))
	st64(b + 0x51, ld64(j + 0x10))
	st64(b + 0x49, ld64(j + 8))
	st64(b + 0x41, ld64(j))
	const k = p13
	const l = ld64(ld64(k + 0x58))
	st64(b + 0x79, ld64(l + 0x18))
	st64(b + 0x71, ld64(l + 0x10))
	st64(b + 0x69, ld64(l + 8))
	st64(b + 0x61, ld64(l))
	st8(b + 0xe1, ld8(i + 0x30))
	st8(b + 0xe2, ld8(k + 0x30))
	const m = p9
	st64(b + 0x99, ld64(m + 0x18))
	st64(b + 0x91, ld64(m + 0x10))
	st64(b + 0x89, ld64(m + 8))
	st64(b + 0x81, ld64(m))
	const n = p10
	copy(b + 0xa1, n, 0x20)
	st16(b + 0xe3, ld16(f + 0x72))
	st64(b + 0xf5, d, p5)
	st32(b + 0x105, p7)
	st64(b + 0xe5, 0, 0)
	st32(b + 0x109, 0)
	memset2(sa0, 0, 0x79)
	copy(s27, h, 0x20)
	memcpy(b + 0x185, sa0, 0x99)
	st64(b + 0x226, 0)
	st64(b + 0x21e, 0)
	memcpy(b + 0x22e, sa0, 0x99)
	st64(b + 0x2cf, 0)
	st64(b + 0x2c7, 0)
	memcpy(b + 0x2d7, sa0, 0x99)
	st64(b + 0x378, 0)
	st64(b + 0x370, 0)
	memset2(b + 0x10d, 0, 0x71)
	st8(b + 0x17e, p15)
	st32(b + 0x181, 0)
	st16(b + 0x17f, 0)
	memset2(b + 0x380, 0, 0xb0)
	st64(b + 0x430, p6)
	clock_get(sa0)
	const s = p14
	if (ld64(sa0) != 0) {
		const p = ld64(sa0 + 8)
		const o = ld64(sa0 + 0x10)
		st64(sa0 + 0x10, ld64(sa0 + 0x18))
		st64(sa0, p, o)
		t = fn_13e628(sb0, sa0)
		r = ld64(sb0 + 8)
		const q = ld64(sb0)
		if (q != 2) {
			st64(a + 8, r)
			st64(a, q)
			return t
		}
	} else {
		r = ld64(sa0 + 0x18)
	}
	st64(b + 0x438, r, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
	t = memset2(b + 0x490, 0, 0x170)
	copy(b + 0xc1, s, 0x18)
	r = ld64(s + 0x18)
	st64(b + 0xd9, r)
	st64(a + 8, r)
	st64(a, 2)
	return t
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
function fn_6940(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let g: u64
	if (ld8(b + 0x29) != 0) {
		const f = ld64(b + 0x10)
		if (ld64(f + 0x10) == 0) {
			st64(f + 0x10, -1)
			const h = ld64(f + 0x20)
			if (h > 7) {
				const i = ld64(f + 0x18)
				let j = ld8(i)
				if (j == 0) {
					j = ld8(i + 1)
					if (j == 0) {
						j = ld8(i + 2)
						if (j == 0) {
							j = ld8(i + 3)
							if (j == 0) {
								j = ld8(i + 4)
								if (j == 0) {
									j = ld8(i + 5)
									if (j == 0) {
										j = ld8(i + 6)
										if (j == 0) {
											j = ld8(i + 7)
											if (j == 0) {
												if (h > 0x727) {
													st64(a + 0x10, f + 0x10)
													st64(a + 8, i + 8)
													st64(a, 0)
													return r0
												}
												fn_153158(0x728, h, 0x10015f748, d, e)
											}
										}
									}
								}
							}
						}
					}
				}
				r0 = anchor_error_from(s48, 0xbb8 /* anchor::AccountDiscriminatorAlreadySet */, j, d, e)
				const k = ld64(s48)
				st64(a + 0x10, ld64(s48 + 8))
				st64(a + 8, k)
				st64(a, 1)
				st64(f + 0x10, ld64(f + 0x10) + 1)
				return r0
			}
			fn_153158(8, h, 0x10015f730, d, e)
		}
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		r0 = fn_13e628(s38, s18)
		g = ld64(s38)
		st64(a + 0x10, ld64(s38 + 8))
		st64(a + 8, g)
		st64(a, 1)
		return r0
	}
	r0 = anchor_error_from(s28, 0xbbe /* anchor::AccountNotMutable */, c, d, e)
	g = ld64(s28)
	st64(a + 0x10, ld64(s28 + 8))
	st64(a + 8, g)
	st64(a, 1)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), c (value)
function memset2(a: u64, b: u64, c: u64): u64 {
	sol_memset(a, b as u8, c)
	return a
}

function fn_10fb10(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000007 >= g) {
		raw_vec_handle_error(1, 0x100, 0x100160b38, 0x300000007, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0x3f3563702f4b5e19 /* event:PoolCreatedEvent */)
	st64(g + 0x20, ld64(b + 0x18))
	st64(g + 0x18, ld64(b + 0x10))
	st64(g + 0x10, ld64(b + 8))
	st64(g + 8, ld64(b))
	copy(g + 0x28, b + 0x20, 0x20)
	st16(g + 0x48, ld16(b + 0xb4))
	copy(g + 0x52, b + 0x48, 0x18)
	st64(g + 0x4a, ld64(b + 0x40))
	const h = ld64(b + 0xa0)
	st64(g + 0x72, ld64(b + 0xa8))
	st64(g + 0x6a, h)
	st32(g + 0x7a, ld32(b + 0xb0))
	copy(g + 0x7e, b + 0x60, 0x40)
	st64(a + 8, g, 0xbe)
	st64(a, 0x100)
}

function log_data(a: u64, b: u64): u64 {
	return sol_log_data(a, b)
}

function fn_14ed60(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70
	st64(s70, a, b, c, d, 0x100162390)
	st64(s50 + 0x10, s20)
	st64(s20, s70, T_fmt_155a38, s60, T_fmt_155a08)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "{}: {}" {} = a [T_fmt_155a38], {} = c [T_fmt_155a08]
	fn_14ec00(s50, e, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_a80(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s30 = fp - 0x30
	const f = memcmp(0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c, 0x20)
	let j = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	g = common_is_closed(b)
	j = undef
	if (g != 0) {
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	const h = ld64(b + 0x10)
	if (ld64(h + 0x10) != 0) {
		st64(s20, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		g = fn_13e628(s30, s20)
		const k = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, k)
		return g
	}
	st64(h + 0x10, -1)
	const i = ld64(h + 0x18)
	st64(s20 + 8, ld64(h + 0x20))
	st64(s20, i)
	st64(s20 + 0x10, 0)
	g = fn_13e070(s20, 0x1001592c8, 8)
	if (g == 0) {
		j = ld64(h + 0x10) + 1
		st64(h + 0x10, j)
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	st64(s8, g)
	fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s8, 0x10015f6c8, 0x10015f6e8)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_8a8(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s30 = fp - 0x30
	const f = memcmp(0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c, 0x20)
	let j = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	g = common_is_closed(b)
	j = undef
	if (g != 0) {
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	const h = ld64(b + 0x10)
	if (ld64(h + 0x10) != 0) {
		st64(s20, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		g = fn_13e628(s30, s20)
		const k = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, k)
		return g
	}
	st64(h + 0x10, -1)
	const i = ld64(h + 0x18)
	st64(s20 + 8, ld64(h + 0x20))
	st64(s20, i)
	st64(s20 + 0x10, 0)
	g = fn_13e070(s20, 0x100159320, 8)
	if (g == 0) {
		j = ld64(h + 0x10) + 1
		st64(h + 0x10, j)
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	st64(s8, g)
	fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s8, 0x10015f6c8, 0x10015f6e8)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_c58(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s30 = fp - 0x30
	const f = memcmp(0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c, 0x20)
	let j = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	g = common_is_closed(b)
	j = undef
	if (g != 0) {
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	const h = ld64(b + 0x10)
	if (ld64(h + 0x10) != 0) {
		st64(s20, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		g = fn_13e628(s30, s20)
		const k = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, k)
		return g
	}
	st64(h + 0x10, -1)
	const i = ld64(h + 0x18)
	st64(s20 + 8, ld64(h + 0x20))
	st64(s20, i)
	st64(s20 + 0x10, 0)
	g = fn_13e070(s20, 0x1001592e0, 8)
	if (g == 0) {
		j = ld64(h + 0x10) + 1
		st64(h + 0x10, j)
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	st64(s8, g)
	fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s8, 0x10015f6c8, 0x10015f6e8)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
function fn_1476d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10
	if (b > b + 0x80) {
		fn_154730(0x100161eb0, b + 0x80, b, d, e)
	}
	__multi3_159030(s10, b + 0x80, 0, ld64(a), 0)
	const f = ld64(s10 + 8)
	if (f != 0) {
		fn_1547e0(0x100161ec8, f)
	}
	const g = __floatundidf(ld64(s10))
	const h = fn_158340(ld64(a + 8), g)
	const i = fn_159078(h, 0)
	const j = __fixunsdfdi(h)
	return (fn_156088(h, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (i as i64) ? 0 : j
}

function fn_4688(a: u64, b: AccountInfo): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60
	let f = b
	const g = b.owner
	let h = memcmp(g, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20) as u32
	if (h == 0) {
		st64(a, 2, f)
		return h
	}
	const k = anchor_error_from(s50, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	const j = ld64(s50 + 8)
	const i = ld64(s50)
	copyr(s40, g, 0x20)
	st64(s20, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
	h = Error_with_pubkeys(s60, i, j, s40, k)
	f = ld64(s60 + 8)
	st64(a, ld64(s60))
	st64(a + 8, f)
	return h
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), e (value)
function fn_14e808(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s1 = fp - 0x1, s18 = fp - 0x18, s48 = fp - 0x48
	st64(s48, 0x100162330)
	st64(s48 + 0x10, s18)
	st64(s18, s1, BorrowError_fmt)
	st64(s48 + 0x20, 0)
	st64(s48 + 8, 1)
	st64(s48 + 0x18, 1)
	// fmt "already mutably borrowed: {}" {} = *s1 [BorrowError_fmt]
	fn_14ec00(s48, a, c, d, e)
}

function fn_110d30(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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
	if (ld64(ld64(b)) == 0x35a2700c4fb72886 /* account:SupportMintAssociated */) {
		return fn_1111c0(a, b, 0x35a2700c4fb72886 /* account:SupportMintAssociated */, d, e)
	}
	ErrorCode_name(s78, 0x1001598e8, 0x35a2700c4fb72886 /* account:SupportMintAssociated */, d, e)
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
	st64(s118 + 8, 0x10015b450)
	st32(sf8 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 6)
	st64(s118 + 0x10, 0x32)
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
		st64(h + 0xd, 0x6465746169636f73)
		st64(h + 8, 0x636f737341746e69)
		st64(h, 0x4d74726f70707553)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x15, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 0xd, 0x6465746169636f73)
		st64(h + 8, 0x636f737341746e69)
		st64(h, 0x4d74726f70707553)
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

function fn_f5d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (points to it), e (value)
function fn_153158(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155b30(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_644c8(a: u64, b: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s70 = fp - 0x70, s88 = fp - 0x88, sf0 = fp - 0xf0, s108 = fp - 0x108, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258
	let l, m, n: u64
	if (0xd89e9 > ((b + 0x6c4f4) as u32)) {
		B5: {
			const g = sar(b << 0x20, 0x3f)
			const h = (b ^ g) - g
			let i = -(h & 1) & 0xfffcb933bd6fb800
			let j = h & 1 ^ 1
			if ((h & 2) != 0) {
				r0 = __multi3_159030(s148, i, 0, 0xfff97272373d4000, 0)
				const k = j * 0xfff97272373d4000
				i = k + ld64(s148 + 8)
				if (k > i) {
					break B5
				}
				j = 0
			}
			if ((h & 4) != 0) {
				r0 = __multi3_159030(s158, i, 0, 0xfff2e50f5f657000, 0)
				const o = j * 0xfff2e50f5f657000
				i = o + ld64(s158 + 8)
				if (o > i) {
					break B5
				}
				j = 0
			}
			if ((h & 8) != 0) {
				r0 = __multi3_159030(s168, i, 0, 0xffe5caca7e10f000, 0)
				const p = j * 0xffe5caca7e10f000
				i = p + ld64(s168 + 8)
				if (p > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x10) != 0) {
				r0 = __multi3_159030(s178, i, 0, 0xffcb9843d60f7000, 0)
				const q = j * 0xffcb9843d60f7000
				i = q + ld64(s178 + 8)
				if (q > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x20) != 0) {
				r0 = __multi3_159030(s188, i, 0, 0xff973b41fa98e800, 0)
				const r = j * 0xff973b41fa98e800
				i = r + ld64(s188 + 8)
				if (r > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x40) != 0) {
				r0 = __multi3_159030(s198, i, 0, 0xff2ea16466c9b000, 0)
				const s = j * 0xff2ea16466c9b000
				i = s + ld64(s198 + 8)
				if (s > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x80) != 0) {
				r0 = __multi3_159030(s1a8, i, 0, 0xfe5dee046a9a3800, 0)
				const t = j * 0xfe5dee046a9a3800
				i = t + ld64(s1a8 + 8)
				if (t > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x100) != 0) {
				r0 = __multi3_159030(s1b8, i, 0, 0xfcbe86c7900bb000, 0)
				const u = j * 0xfcbe86c7900bb000
				i = u + ld64(s1b8 + 8)
				if (u > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x200) != 0) {
				r0 = __multi3_159030(s1c8, i, 0, 0xf987a7253ac65800, 0)
				const v = j * 0xf987a7253ac65800
				i = v + ld64(s1c8 + 8)
				if (v > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x400) != 0) {
				r0 = __multi3_159030(s1d8, i, 0, 0xf3392b0822bb6000, 0)
				const w = j * 0xf3392b0822bb6000
				i = w + ld64(s1d8 + 8)
				if (w > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x800) != 0) {
				r0 = __multi3_159030(s1e8, i, 0, 0xe7159475a2caf000, 0)
				const x = j * 0xe7159475a2caf000
				i = x + ld64(s1e8 + 8)
				if (x > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x1000) != 0) {
				r0 = __multi3_159030(s1f8, i, 0, 0xd097f3bdfd2f2000, 0)
				const y = j * 0xd097f3bdfd2f2000
				i = y + ld64(s1f8 + 8)
				if (y > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x2000) != 0) {
				r0 = __multi3_159030(s208, i, 0, 0xa9f746462d9f8000, 0)
				const z = j * 0xa9f746462d9f8000
				i = z + ld64(s208 + 8)
				if (z > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x4000) != 0) {
				r0 = __multi3_159030(s218, i, 0, 0x70d869a156f31c00, 0)
				i = j * 0x70d869a156f31c00 + ld64(s218 + 8)
				j = 0
			}
			if ((h & 0x8000) != 0) {
				r0 = __multi3_159030(s228, i, 0, 0x31be135f97ed3200, 0)
				i = j * 0x31be135f97ed3200 + ld64(s228 + 8)
				j = 0
			}
			if ((h & 0x10000) != 0) {
				r0 = __multi3_159030(s238, i, 0, 0x9aa508b5b85a500, 0)
				i = j * 0x9aa508b5b85a500 + ld64(s238 + 8)
				j = 0
			}
			if ((h & 0x20000) != 0) {
				r0 = __multi3_159030(s248, i, 0, 0x5d6af8dedc582c, 0)
				i = j * 0x5d6af8dedc582c + ld64(s248 + 8)
				j = 0
			}
			if ((h & 0x40000) != 0) {
				r0 = __multi3_159030(s258, i, 0, 0x2216e584f5fa, 0)
				i = j * 0x2216e584f5fa + ld64(s258 + 8)
				j = 0
			}
			if ((b as i32) > 0) {
				st64(s70, i, j)
				r0 = fn_100918(s128, 0x10015a490, s70)
				i = ld64(s128)
				st64(a + 0x10, ld64(s128 + 8))
				st64(a + 8, i)
				st64(a, 0)
				return r0
			}
			st64(a + 0x10, j)
			st64(a + 8, i)
			st64(a, 0)
			return r0
		}
		st64(s128, 0x100160990, 1, 8, 0, 0)
		// fmt "arithmetic operation overflow"
		fn_14ec00(s128, 0x10015fe28, l, m, n)
	}
	fn_85138(s88, 0x10015983c)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x10015983c, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(sf0, s60, 0x18)
	copy(s108, s88, 0x18)
	st64(s128 + 8, 0x10015a469)
	st32(sf0 + 0x60, 0x1777 /* error::TickUpperOverflow */)
	st8(sf0 + 0x18, 2)
	st32(s128 + 0x18, 0x26)
	st64(s128 + 0x10, 0x27)
	st64(s128, 0)
	r0 = fn_13e5a0(s138, s128)
	const f = ld64(s138)
	st64(a + 0x10, ld64(s138 + 8))
	st64(a + 8, f)
	st64(a, 1)
	return r0
}

function fn_1547e0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622f0, 1, 8, 0, 0)
	// fmt "attempt to multiply with overflow"
	fn_14ec00(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_154730(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622d0, 1, 8, 0, 0)
	// fmt "attempt to add with overflow"
	fn_14ec00(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_154788(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622e0, 1, 8, 0, 0)
	// fmt "attempt to subtract with overflow"
	fn_14ec00(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_12c020(a: u64, b: u64, c: u64, d: u64): u64 {
	const s38 = fp - 0x38, s50 = fp - 0x50, s80 = fp - 0x80, s90 = fp - 0x90, s98 = fp - 0x98, sa0 = fp - 0xa0, sb8 = fp - 0xb8, se8 = fp - 0xe8, s100 = fp - 0x100, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s140 = fp - 0x140
	let n, ah, ar: u64
	const f = ld64(b + 0x48)
	fn_1371d0(sa0, f, ld64(b + 0x18), c, d)
	copy(sb8, s98, 0x18)
	const g = ld64(sa0)
	if (g == 0x8000000000000000) {
		n = fn_13e628(s138, sb8)
		const l = ld64(s138)
		st64(a + 8, ld64(s138 + 8))
		st64(a, l)
		const m = ld64(b + 0x20)
		if (rc_release(m)) {
			n = Rc_drop_slow_125dd0(b + 0x20, n)
		}
		const o = ld64(b + 0x28)
		if (rc_release(o)) {
			n = Rc_drop_slow_125e20(b + 0x28, n)
		}
	} else {
		st64(s140, a)
		memcpy(se8, s80, 0x30)
		st64(s108, g)
		copy(s100, sb8, 0x18)
		memcpy(sa0, b + 0x18, 0x30)
		let i = fn_142568(s50, s108, sa0, 1)
		if (ld64(s50) == 0x800000000000001a /* Ok */) {
			const h = ld64(s98)
			if (rc_release(h)) {
				i = Rc_drop_slow_125dd0(s98, i)
			}
			const j = ld64(s90)
			if (rc_release(j)) {
				Rc_drop_slow_125e20(s90, i)
			}
			B41: {
				B40: {
					fn_142b40(s38)
					const k = ld64(s38 + 0x20)
					if (k == 0x8000000000000000) {
						ah = 0x8000000000000002 /* Err(ProgramError::InvalidInstructionData) */
					} else {
						const ad = ld64(s38)
						const ac = ld64(s38 + 8)
						const ab = ld64(s38 + 0x10)
						const aa = ld64(s38 + 0x18)
						st64(s80 + 0x10, ld64(s38 + 0x30))
						st64(sa0, ad, ac, ab, aa)
						const ae = ld64(s38 + 0x28)
						st64(s80 + 8, ae)
						n = memcmp(sa0, f, 0x20) as u32
						if (n != 0) {
							ah = 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */
							if (k == 0) {
								break B40
							}
						} else {
							if (ld64(s80 + 0x10) == 8) {
								const ag = ld64(ae)
								if (k != 0) {
									n = fn_11e480(n)
								}
								const af = ld64(s140)
								st64(af + 8, ag)
								st64(af, 2)
								break B41
							}
							ah = 0x8000000000000002 /* Err(ProgramError::InvalidInstructionData) */
							if (k == 0) {
								break B40
							}
						}
						fn_11e480(n)
					}
				}
				st64(sa0, ah)
				n = fn_13e628(s128, sa0)
				const aj = ld64(s128)
				const ai = ld64(s140)
				st64(ai + 8, ld64(s128 + 8))
				st64(ai, aj)
			}
			if (ld64(s108) != 0) {
				n = fn_11e480(n)
			}
			if (ld64(s100 + 0x10) != 0) {
				n = fn_11e480(n)
			}
			const al = ld64(b + 8)
			let ak = ld64(b + 0x10)
			if (ak != 0) {
				let am = al + 0x10
				do {
					const an = ld64(am - 8)
					if (rc_release(an)) {
						n = Rc_drop_slow_125dd0(am - 8, n)
					}
					const ao = ld64(am)
					if (rc_release(ao)) {
						n = Rc_drop_slow_125e20(am, n)
					}
					am = am + 0x30
					ak = ak - 1
				} while (ak != 0)
			}
			if (ld64(b) != 0) {
				n = fn_11e480(n)
			}
			const ap = ld64(b + 0x50)
			if (rc_release(ap)) {
				n = Rc_drop_slow_125dd0(b + 0x50, n)
			}
			const aq = ld64(b + 0x58)
			ar = b + 0x58
			if (!rc_release(aq)) {
				return n
			}
			return Rc_drop_slow_125e20(ar, n)
		}
		copyr(s38, s50, 0x18)
		n = fn_13e628(s118, s38)
		const q = ld64(s118)
		const p = ld64(s140)
		st64(p + 8, ld64(s118 + 8))
		st64(p, q)
		const r = ld64(s98)
		if (rc_release(r)) {
			n = Rc_drop_slow_125dd0(s98, n)
		}
		const s = ld64(s90)
		if (rc_release(s)) {
			n = Rc_drop_slow_125e20(s90, n)
		}
		if (ld64(s108) != 0) {
			n = fn_11e480(n)
		}
		if (ld64(s100 + 0x10) != 0) {
			n = fn_11e480(n)
		}
	}
	const u = ld64(b + 8)
	let t = ld64(b + 0x10)
	if (t != 0) {
		let v = u + 0x10
		do {
			const w = ld64(v - 8)
			if (rc_release(w)) {
				n = Rc_drop_slow_125dd0(v - 8, n)
			}
			const x = ld64(v)
			if (rc_release(x)) {
				n = Rc_drop_slow_125e20(v, n)
			}
			v = v + 0x30
			t = t - 1
		} while (t != 0)
	}
	if (ld64(b) != 0) {
		n = fn_11e480(n)
	}
	const y = ld64(b + 0x50)
	if (rc_release(y)) {
		n = Rc_drop_slow_125dd0(b + 0x50, n)
	}
	const z = ld64(b + 0x58)
	ar = b + 0x58
	if (rc_release(z)) {
		return Rc_drop_slow_125e20(ar, n)
	}
	return n
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14ec00(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s18 = fp - 0x18
	st64(s18, a, b)
	st16(s18 + 0x10, 1)
	fn_14ce00(s18, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (value)
function fn_13e070(a: u64, b: u64, c: u64): u64 {
	const g = ld64(a + 8)
	const f = ld64(a + 0x10)
	let h = 0
	if (g > f) {
		h = min(sat_sub(g, f), c)
		const j = c
		sol_memcpy(ld64(a) + f, b, h)
		const i = f + h
		if (f > i) {
			fn_154730(0x1001613d8)
		}
		st64(a + 0x10, i)
		c = j
	}
	if (h == c) {
		return 0
	}
	return Error_new_13c880()
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
function fn_158340(a: u64, b: u64): u64 {
	return mul_mul(a, b)
}

function fn_159078(a: u64, b: u64): u64 {
	return cmp___gedf2(a, b)
}

function fn_156088(a: u64, b: u64): u64 {
	return cmp___gedf2(a, b)
}

function fn_1111c0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20
	const f = ld64(b + 8)
	if (8 > f) {
		fn_153150(8, f, 0x100160bb0, d, e)
	}
	if (f != 8 && f - 8 >= 0x21) {
		const g = ld64(b)
		const n = ld8(g + 8)
		const h = ld64(g + 0xf)
		st8(s20 + 0x18, ld8(g + 0x17))
		st64(s20 + 0x10, h)
		if (f - 0x29 >= 8 && (f - 0x31 >= 8 && (f - 0x39 >= 8 && f - 0x41 >= 0x28))) {
			const w = ld64(s20 + 0x11)
			const i = ld64(g + 0x29)
			const s = ld64(g + 0x31)
			const v = ld64(g + 0x61)
			const u = ld64(g + 0x59)
			const t = ld64(g + 0x51)
			const m = ld64(g + 0x49)
			const l = ld64(g + 0x41)
			const k = ld64(g + 0x39)
			st16(a + 0x4c, ld16(g + 0xd))
			st32(a + 0x48, ld32(g + 9))
			copy(a + 0x57, g + 0x18, 0x10)
			st8(a + 0x67, ld8(g + 0x28))
			st64(a + 8, i, s, k, l, m, t, u, v)
			st64(a + 0x4f, w)
			st8(a + 0x68, n)
			st8(a + 0x4e, h)
			st64(a, 0)
			return s
		}
	}
	const o = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	let j = anchor_error_from(s20, 0xbbb /* anchor::AccountDidNotDeserialize */)
	const q = ld64(s20 + 8)
	const r = ld64(s20)
	if (2 > (o & 3) - 2) {
		st64(a + 0x10, q)
		st64(a + 8, r)
		st64(a, 1)
		return j
	}
	if ((o & 3) == 0) {
		st64(a + 0x10, q)
		st64(a + 8, r)
		st64(a, 1)
		return j
	}
	const p = ld64(ld64(o + 7))
	if (p == 0) {
		st64(a + 0x10, q)
		st64(a + 8, r)
		st64(a, 1)
		return j
	}
	j = callx(p, ld64(o - 1), p)
	st64(a + 0x10, q)
	st64(a + 8, r)
	st64(a, 1)
	return j
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (value), d (points to it), e (value)
function fn_155b30(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	st64(s60, a, b, 0x100162618)
	st64(s50 + 0x10, s20)
	st64(s20, s60, fn_155738, s58, fn_155738)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "range end index {} out of range for slice of length {}" {} = a [fn_155738], {} = b [fn_155738]
	fn_14ec00(s50, c, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value)
function fn_1371d0(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s48 = fp - 0x48, s50 = fp - 0x50
	let h, i: u64
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
	st16(f + 0x20, 0)
	if (0 > (e as i64)) {
		raw_vec_handle_error(0, e << 1, 0x100160d78, h, i)
	}
	if ((e << 1) > 0x7ffffffffffffffe) {
		raw_vec_handle_error(0, e << 1, 0x100160d78, h, i)
	}
	let g = 2
	let j = 0
	if ((e << 1) != 0) {
		g = __rust_alloc(e << 1, 2)
		j = e
		if (g == 0) {
			raw_vec_handle_error(2, e << 1, 0x100160d78, h, i)
		}
	}
	memcpy(g, d, e << 1)
	st64(s48, j, g, e)
	st32(s50, 0x15)
	const k = fn_1334b0(a + 0x18, s50)
	st64(a + 0x48, ld64(b + 0x18))
	st64(a + 0x40, ld64(b + 0x10))
	st64(a + 0x38, ld64(b + 8))
	st64(a + 0x30, ld64(b))
	st64(a + 8, f, 1)
	st64(a, 1)
	if (j != 0) {
		fn_11e480(k)
	}
}

function fn_142568(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1000 = fp - 0x1000
	st64(s1000, 8, 0)
	return invoke_signed(a, b, c, d, fp)
}

function fn_11e480(r0: u64): u64 {
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14ce00(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14d4b8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), e (value)
function fn_153150(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155a68(a, b, c, d, e)
}

function fn_155738(a: u64, b: u64): u64 {
	return imp__fmt_155760(ld64(a), 1, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14d4b8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	custom_panic(a, b, c, d, e)
	abort()
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (value), e (value)
function fn_155a68(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	st64(s60, a, b, 0x1001625f8)
	st64(s50 + 0x10, s20)
	st64(s20, s60, fn_155738, s58, fn_155738)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "range start index {} out of range for slice of length {}" {} = a [fn_155738], {} = b [fn_155738]
	fn_14ec00(s50, c, c, d, e)
}

// not included (size budget), see shared.ts:
declare function fn_82dd0(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: LamportsCell): u64
declare function fn_100918(a: u64, b: u64, c: u64): u64
