// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction initialize_pool: handler + 41 reachable functions
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
interface InitializePoolAccounts { // Accounts struct of instruction initialize_pool as accounts_initialize_pool returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	funder:        at<0xc8, ref<AccountInfo>>
	token_vault_a: at<0xd8, ref<AccountInfo>>
	token_vault_b: at<0xe0, ref<AccountInfo>>
}
interface InitializePoolContext { // anchor_lang Context of instruction initialize_pool (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<InitializePoolAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_log_data(slices: u64, len: u64): void // log base64 data: slices = &[&[u8]]
declare function sol_invoke_signed_rust(ix: u64, accountInfos: u64, accountInfosLen: u64, signerSeeds: u64, signerSeedsLen: u64): u64 // CPI (Rust ABI: &Instruction, &[AccountInfo], &[&[&[u8]]])
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function ptr_drop_in_place_bf20(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 2]>
declare function ptr_drop_in_place_c1b0(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 4]>
declare function fn_f658(a: u64, b: u64): u64 // lib
declare function fn_fe08(a: u64, b: u64): void // lib
declare function AccountInfo_clone(a: u64, b: u64): void // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11990(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11de0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11e98(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_12008(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_122e8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp
declare function fn_129a0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from, memcmp
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function ptr_drop_in_place_126088(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<alloc::vec::Vec<solana_account_info::AccountInfo>>
declare function fn_12cf58(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib uses raw_vec_handle_error
declare function rent_check_id_136a18(a: u64): u64 // lib solana_sdk_ids::sysvar::rent::check_id
declare function fn_1390d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcmp, AccountInfo_try_borrow_lamports, AccountInfo_try_borrow_data
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b3a8(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error, memcpy
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function Error_log(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib anchor_lang::error::Error::log
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function error_from_13c648(a: u64, b: u64, c: u64, r0: u64): u64 // lib anchor_lang::error::<impl core::convert::From<anchor_lang::error::Error> for solana_progra…
declare function fn_13c8b8(a: u64, b: u64, c: u64): u64 // lib uses memcpy, __rust_alloc, alloc_handle_alloc_error, ptr_drop_in_place_139960
declare function fn_13cc48(a: u64, b: u64, c: u64): u64 // lib uses memcpy, __rust_alloc, alloc_handle_alloc_error, ptr_drop_in_place_139960
declare function fn_13cfd8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcpy, __rust_alloc, alloc_handle_alloc_error, ptr_drop_in_place_1397a0, …
declare function fn_13d318(a: u64, b: u64, c: u64): u64 // lib uses memcpy, __rust_alloc, alloc_handle_alloc_error, ptr_drop_in_place_1397a0, …
declare function ErrorCode_name(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib anchor_lang::error::ErrorCode::name
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function ErrorCode_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::error::ErrorCode as core::fmt::Display>::fmt
declare function rent_get(a: u64): u64 // lib solana_sysvar::rent::<impl solana_sysvar::Sysvar for solana_rent::Rent>::get
declare function fn_13f890(a: u64): void // lib uses memset, sol_get_return_data, __rust_alloc, raw_vec_handle_error, …
declare function fn_13fba0(a: u64, b: u64): void // lib uses raw_vec_handle_error
declare function fn_142800(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_142e70(a: u64, b: u64, c: u64, d: u64): void // lib uses __rust_alloc, alloc_handle_alloc_error
declare function AccountInfo_try_data_len(a: u64, b: u64): void // lib solana_account_info::AccountInfo::try_data_len
declare function AccountInfo_try_borrow_lamports(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_lamports
declare function fn_143340(a: u64, b: u64, r0: u64): u64 // lib
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_143da0(a: u64, r0: u64): u64 // lib
declare function fn_144198(a: u64, b: u64, r0: u64): u64 // lib uses __rust_alloc, raw_vec_handle_error
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function fn_1459d0(a: u64): u64 // lib uses repr_bitpacked_kind_from_prim_145358, callx
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fn_14ecd0(a: u64, b: u64, c: u64): u64 // lib "0001020304050607080910111213141516171819…", "0001020304050607080910111213141516171819…"
declare function fn_14f3e8(a: u64): u64 // lib
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function __floatundidf(a: u64): u64 // lib __floatundidf
declare function __lshrti3(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib __lshrti3
declare function fn_14f808(a: u64, b: u64): u64 // lib uses __multi3
declare function __multi3(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __multi3 [heur] u128 multiply: *out = a * b (mod 2^128), a = (a_lo, a_hi), b = (b_lo, b_hi) [exec: on 31 operand pairs]
declare function fn_151a40(a: u64, b: u64): u64 // lib
declare function fn_151cb0(a: u64, b: u64): u64 // lib
declare function __ashlti3(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib __ashlti3

// instruction handler: initialize_pool (discriminator sha256("global:initialize_pool")[..8] = 0x28e8ae54ac0ab45f)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, token_mint_a, token_mint_b, token_vault_a, fee_tier, rent, whirlpool, token_program, token_vault_b, funder, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
function ix_initialize_pool(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s130 = fp - 0x130, s138 = fp - 0x138, s148 = fp - 0x148, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2a1 = fp - 0x2a1, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s1000 = fp - 0x1000
	let l, m: u64
	sol_log("Instruction: InitializePool", 0x1b)
	const f = ix_args_len
	if (f >= 3 && f - 3 >= 0x10) {
		const g = ix_args
		const n = ld16(g + 1)
		const s = ld64(g + 0xb)
		const r = ld64(g + 3)
		st8(s2a1, 0xff)
		st64(s2a0, accounts, accounts_len)
		st64(s1000, f, s2a1)
		m = accounts_initialize_pool(s148, program_id, s2a0, g, fp)
		const h = ld32(s148)
		if (h == 2) {
			l = ld64(s148 + 8)
			st64(a + 8, ld64(s138))
			st64(a, l)
			return m
		}
		const q = ld32(s148 + 4)
		const p = ld64(s148 + 8)
		const o = ld64(s138)
		memcpy(s278, s130, 0x130)
		st64(s288, p, o)
		st32(s290, h, q)
		st8(s130 + 8, ld8(s2a1))
		copyr(s138, s2a0, 0x10)
		st64(s148, program_id, s290)
		st64(s1000, r, s)
		m = fn_31e50(s2b8, s148, undef, n, r, s)
		l = ld64(s2b8)
		if (l == 2) {
			m = fn_6aa0(s2c8, ld64(s278 + 0xb8), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
			const k = ld64(s2c8)
			if (k != 2) {
				m = Error_with_account_name(s2d8, k, ld64(s2c8 + 8), 0x100152b28 /* "whirlpool" */, 9)
				l = ld64(s2d8)
				st64(a + 8, ld64(s2d8 + 8))
				st64(a, l)
				return m
			}
			st64(a + 8, k)
			st64(a, 2)
			return m
		}
		st64(a + 8, ld64(s2b8 + 8))
		st64(a, l)
		return m
	}
	const i = fn_1459d0(0x100159468)
	if (2 > (i & 3) - 2) {
		m = anchor_error_from(s2e8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s2e8)
		st64(a + 8, ld64(s2e8 + 8))
		st64(a, l)
		return m
	}
	if ((i & 3) == 0) {
		m = anchor_error_from(s2e8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s2e8)
		st64(a + 8, ld64(s2e8 + 8))
		st64(a, l)
		return m
	}
	const j = ld64(ld64(i + 7))
	callx(j, ld64(i - 1), j)
	m = anchor_error_from(s2e8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	l = ld64(s2e8)
	st64(a + 8, ld64(s2e8 + 8))
	st64(a, l)
	return m
}

// Anchor Accounts::try_accounts of instruction initialize_pool (called by ix_initialize_pool; name [str]: from the handler's "Instruction: …" log; was fn_9b480)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, token_mint_a, token_mint_b, token_vault_a (ConstraintMut), fee_tier (ConstraintHasOne, ConstraintRaw), rent, whirlpool (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), token_program (ConstraintAddress), token_vault_b (ConstraintMut), funder (ConstraintMut), system_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpool, funder
function accounts_initialize_pool(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s60 = fp - 0x60, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, s110 = fp - 0x110, s112 = fp - 0x112, s138 = fp - 0x138, s158 = fp - 0x158, s159 = fp - 0x159, s180 = fp - 0x180, s198 = fp - 0x198, s1b0 = fp - 0x1b0, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s228 = fp - 0x228, s238 = fp - 0x238, s240 = fp - 0x240, s288 = fp - 0x288, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2a2 = fp - 0x2a2, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s538 = fp - 0x538, s548 = fp - 0x548, s550 = fp - 0x550
	let l, m, ai, aj, bc: u64
	st64(s2b0, b)
	if (3 > ld64(e - 0x1000)) {
		const i = fn_1459d0(0x100159468)
		if (2 > (i & 3) - 2) {
			m = anchor_error_from(s4e0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			l = ld64(s4e0)
			st64(a + 0x10, ld64(s4e0 + 8))
			st64(a + 8, l)
			st32(a, 2)
			return m
		}
		if ((i & 3) == 0) {
			m = anchor_error_from(s4e0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			l = ld64(s4e0)
			st64(a + 0x10, ld64(s4e0 + 8))
			st64(a + 8, l)
			st32(a, 2)
			return m
		}
		const j = ld64(ld64(i + 7))
		callx(j, ld64(i - 1), j)
		m = anchor_error_from(s4e0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s4e0)
		st64(a + 0x10, ld64(s4e0 + 8))
		st64(a + 8, l)
		st32(a, 2)
		return m
	}
	const g = ld64(e - 0xff8)
	st16(s2a2, ld16(d + 1))
	try_accounts_11de0(sc0, c, c, d, e)
	if (ld64(sc0) == 0) {
		m = Error_with_account_name(s4d0, ld64(sb8), ld64(sb8 + 8), "whirlpools_config", 0x11)
		l = ld64(s4d0)
		st64(a + 0x10, ld64(s4d0 + 8))
		st64(a + 8, l)
		st32(a, 2)
		return m
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	st64(s538 + 0x50, g)
	const h = f != 0 ? sat_sub(f, 0x70) & -8 : 0x300007f90
	if (h > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		memcpy(h, sc0, 0x70)
		try_accounts_11e98(sc0, c)
		const k = ld32(sc0)
		if (k == 2) {
			m = Error_with_account_name(s4c0, ld64(sb8), ld64(sb8 + 8), "token_mint_a", 0xc)
			l = ld64(s4c0)
			st64(a + 0x10, ld64(s4c0 + 8))
			st64(a + 8, l)
			st32(a, 2)
			return m
		}
		st64(s538 + 0x38, h)
		st64(s538 + 0x48, a)
		st64(s538 + 0x40, ld32(sc0 + 4))
		const o = ld64(sb8)
		const n = ld64(sb8 + 8)
		memcpy(s288, sa8, 0x48)
		st64(s298, o, n)
		st32(s2a0 + 4, ld64(s538 + 0x40))
		st32(s2a0, k)
		try_accounts_11e98(sc0, c)
		const p = ld32(sc0)
		if (p == 2) {
			m = Error_with_account_name(s4b0, ld64(sb8), ld64(sb8 + 8), "token_mint_b", 0xc)
			aj = ld64(s4b0)
			ai = ld64(s538 + 0x48)
			st64(ai + 0x10, ld64(s4b0 + 8))
			st64(ai + 8, aj)
			st32(ai, 2)
			return m
		}
		st64(s538 + 0x40, ld32(sc0 + 4))
		const r = ld64(sb8)
		const q = ld64(sb8 + 8)
		memcpy(s228, sa8, 0x48)
		st64(s238, r, q)
		st32(s240 + 4, ld64(s538 + 0x40))
		st32(s240, p)
		try_accounts_11718(sc0, c)
		const t = ld64(sb8)
		const s = ld64(sc0)
		if (s == 2) {
			st64(s1e0, t)
			const u = ld64(c + 8)
			const bb = ld64(s538 + 0x48)
			if (u == 0) {
				m = anchor_error_from(s4a0, 0xbbd /* anchor::AccountNotEnoughKeys */, t)
				bc = ld64(s4a0)
				st64(bb + 0x10, ld64(s4a0 + 8))
				st64(bb + 8, bc)
				st32(bb, 2)
				return m
			}
			const v: AccountInfo = ld64(c)
			st64(s1d8, v)
			st64(c + 8, u - 1)
			st64(c, v + 0x30)
			try_accounts_11718(sc0, c, t)
			const ak = ld64(sb8)
			const w = ld64(sc0)
			if (w != 2) {
				m = Error_with_account_name(s2d0, w, ak, "token_vault_a", 0xd)
				bc = ld64(s2d0)
				st64(bb + 0x10, ld64(s2d0 + 8))
				st64(bb + 8, bc)
				st32(bb, 2)
				return m
			}
			try_accounts_11718(sc0, c)
			const al = ld64(sb8)
			const x = ld64(sc0)
			if (x == 2) {
				try_accounts_12008(sc0, c)
				const aa = ld64(sb8 + 8)
				const z = ld64(sb8)
				const y = ld64(sc0)
				if (y == 0) {
					m = Error_with_account_name(s490, z, aa, "fee_tier", 8)
					bc = ld64(s490)
					st64(bb + 0x10, ld64(s490 + 8))
					st64(bb + 8, bc)
					st32(bb, 2)
					return m
				}
				st64(s538 + 0x20, y)
				st64(s538 + 0x30, z)
				st64(s538 + 0x40, aa)
				copyr(s1c8, sa8, 0x10)
				st32(s1d8 + 8, ld32(sa0 + 0xa))
				st16(s1d8 + 0xc, ld16(sa0 + 0xe))
				st64(s538 + 0x28, ld16(sa0 + 8))
				fn_129a0(sc0, c, aa)
				const ac = ld64(sb8)
				const ab = ld64(sc0)
				if (ab == 2) {
					st64(s538 + 0x18, ac)
					fn_122e8(sc0, c, ac)
					const ae = ld64(sb8)
					const ad = ld64(sc0)
					if (ad == 2) {
						st64(s1b8, ae)
						try_accounts_11990(sc0, c, ae)
						const ah = ld64(sb8 + 8)
						const ag = ld64(sb8)
						const af = ld64(sc0)
						if (af == 0) {
							m = Error_with_account_name(s480, ag, ah, 0x100152d60 /* "rent" */, 4)
							bc = ld64(s480)
							st64(bb + 0x10, ld64(s480 + 8))
							st64(bb + 8, bc)
							st32(bb, 2)
							return m
						}
						st64(s538, af, ag, ah)
						const am = ld64(sa8)
						rent_get(sc0)
						copy(s198, sb8, 0x18)
						if (ld64(sc0) == 0) {
							st64(s548, am, al)
							copyr(s1b0, s198, 0x18)
							const an = ld64(s538 + 0x38)
							const ao = ld64(ld64(an))
							copyr(s158, ao, 0x20)
							const ap = ld64(ld64(s288 + 0x40))
							copy(s138, ap, 0x20)
							const aq = ld64(ld64(s228 + 0x40))
							copy(se0, aq, 0x20)
							st16(s112, ld16(s2a2))
							st64(sc0, 0x100152b28, 9, s158, 0x20, s138, 0x20, se0, 0x20, s112, 2)
							// PDA find_program_address(["whirlpool", *ao, *ap, *aq, u16 ld16(s2a2) [ix data?]], program *(ld64(s2b0)))
							Pubkey_find_program_address(s110, sc0, 5, ld64(s2b0))
							copyr(s180, s110, 0x20)
							const ar = ld8(s110 + 0x20)
							st8(s159, ar)
							st8(ld64(s538 + 0x50), ar)
							const at = ld64(ld64(s1d8))
							copy(sc0, at, 0x20)
							if ((memcmp(sc0, s180, 0x20) as u32) == 0) {
								st64(s538 + 0x50, ak)
								st64(sc0, s1d8, s1b0, s1e0, s1b8, an, s2a0, s240, s2a2, s159, s2b0)
								m = fn_9d160(s110, sc0)
								const bd = ld64(s110 + 8)
								bc = ld64(s110)
								if (bc == 2) {
									const whirlpool: AccountInfo = ld64(bd)
									if (whirlpool.is_writable == 0) {
										anchor_error_from(s460, 0x7d0 /* anchor::ConstraintMut */)
										m = Error_with_account_name(s470, ld64(s460), ld64(s460 + 8), 0x100152b28 /* "whirlpool" */, 9)
										aj = ld64(s470)
										ai = ld64(s538 + 0x48)
										st64(ai + 0x10, ld64(s470 + 8))
										st64(ai + 8, aj)
										st32(ai, 2)
										return m
									}
									AccountInfo_clone(s110, whirlpool)
									const bf = fn_143100(s110)
									AccountInfo_clone(sc0, ld64(bd))
									AccountInfo_try_data_len(se0, sc0)
									const bh = ld64(se0 + 8)
									const bg = ld64(se0)
									if (bg != 0x800000000000001a /* Ok */) {
										st64(sd0, ld64(sd0))
										st64(se0, bg, bh)
										m = fn_13b430(s350, se0)
										const bu = ld64(s350)
										const bt = ld64(s538 + 0x48)
										st64(bt + 0x10, ld64(s350 + 8))
										st64(bt + 8, bu)
										st32(bt, 2)
										const bw = ld64(sb8 + 8)
										const bv = ld64(sb8)
										rc_dec(bv)
										rc_dec(bw)
										const by = ld64(s110 + 0x10)
										const bx = ld64(s110 + 8)
										rc_dec(bx)
										if (!rc_release(by)) {
											return m
										}
										st64(by + 8, ld64(by + 8) - 1)
										return m
									}
									const bi = __floatundidf(ld64(s1b0) * (bh + 0x80))
									const bj = fn_14f7f8(ld64(s1b0 + 8), bi)
									st64(s550, fn_151cb0(bj, 0))
									const bk = fn_14f3e8(bj)
									const bl = 0 > (ld64(s550) as i64) ? 0 : bk
									const bs = (fn_151a40(bj, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : bl
									const bn = ld64(sb8 + 8)
									const bm = ld64(sb8)
									rc_dec(bm)
									rc_dec(bn)
									const bq = ld64(s110 + 0x10)
									const bo = ld64(s110 + 8)
									let bp = ld64(bo) - 1
									st64(bo, bp)
									if (bp == 0) {
										bp = ld64(bo + 8) - 1
										st64(bo + 8, bp)
									}
									let br = ld64(bq) - 1
									st64(bq, br)
									if (br == 0) {
										br = ld64(bq + 8) - 1
										st64(bq + 8, br)
									}
									if (bs > bf) {
										anchor_error_from(s440, 0x7d5 /* anchor::ConstraintRentExempt */, br, bp)
										m = Error_with_account_name(s450, ld64(s440), ld64(s440 + 8), 0x100152b28 /* "whirlpool" */, 9)
										aj = ld64(s450)
										ai = ld64(s538 + 0x48)
										st64(ai + 0x10, ld64(s450 + 8))
										st64(ai + 8, aj)
										st32(ai, 2)
										return m
									}
									const funder: AccountInfo = ld64(s1e0)
									if (funder.is_writable != 0) {
										if (ld8(ld64(s538 + 0x50) + 0x29) != 0) {
											if (ld8(ld64(s548 + 8) + 0x29) != 0) {
												st64(se0 + 8, ld64(s538 + 0x40))
												st64(se0, ld64(s538 + 0x30))
												copy(sd0, s1c8, 0x10)
												const ca = ld64(ld64(ld64(s538 + 0x38)))
												copyr(s110, ca, 0x20)
												if ((memcmp(se0, s110, 0x20) as u32) != 0) {
													anchor_error_from(s360, 0x7d1 /* anchor::ConstraintHasOne */)
													const cg = Error_with_account_name(s370, ld64(s360), ld64(s360 + 8), "fee_tier", 8)
													const cf = ld64(s370 + 8)
													const ce = ld64(s370)
													copyr(sc0, se0, 0x20)
													copy(sa0, s110, 0x20)
													m = fn_13b5c0(s380, ce, cf, sc0, cg)
													aj = ld64(s380)
													ai = ld64(s538 + 0x48)
													st64(ai + 0x10, ld64(s380 + 8))
													st64(ai + 8, aj)
													st32(ai, 2)
													return m
												}
												if (ld64(s538 + 0x28) == ld16(s2a2)) {
													const cb = ld64(ld64(s538 + 0x18))
													copyr(s110, cb, 0x20)
													if ((memcmp(s110, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
														anchor_error_from(s3b0, 0x7dc /* anchor::ConstraintAddress */)
														const cj = Error_with_account_name(s3c0, ld64(s3b0), ld64(s3b0 + 8), "token_program", 0xd)
														const ci = ld64(s3c0 + 8)
														const ch = ld64(s3c0)
														copyr(sc0, s110, 0x20)
														st64(sa0, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
														m = fn_13b5c0(s3d0, ch, ci, sc0, cj)
														aj = ld64(s3d0)
														ai = ld64(s538 + 0x48)
														st64(ai + 0x10, ld64(s3d0 + 8))
														st64(ai + 8, aj)
														st32(ai, 2)
														return m
													}
													st64(s550, sc0)
													memcpy(sc0, s2a0, 0x60)
													memcpy(s60, s240, 0x60)
													const cd = ld64(s1b8)
													const cc = ld64(s538 + 0x48)
													copy(cc + 0x100, s1c8, 0x10)
													st16(cc + 0x116, ld16(s1d8 + 0xc))
													st32(cc + 0x112, ld32(s1d8 + 8))
													m = memcpy(cc, ld64(s550), 0xc0)
													st64(cc + 0x140, ld64(s548))
													st64(cc + 0x138, ld64(s538 + 0x10))
													st64(cc + 0x130, ld64(s538 + 8))
													st64(cc + 0x128, ld64(s538))
													st64(cc + 0x120, cd)
													st64(cc + 0x118, ld64(s538 + 0x18))
													st16(cc + 0x110, ld64(s538 + 0x28))
													st64(cc + 0xf8, ld64(s538 + 0x40))
													st64(cc + 0xf0, ld64(s538 + 0x30))
													st64(cc + 0xe8, ld64(s538 + 0x20))
													st64(cc + 0xe0, ld64(s548 + 8))
													st64(cc + 0xd8, ld64(s538 + 0x50))
													st64(cc + 0xd0, bd)
													st64(cc + 0xc8, funder)
													st64(cc + 0xc0, ld64(s538 + 0x38))
													return m
												}
												anchor_error_from(s390, 0x7d3 /* anchor::ConstraintRaw */)
												m = Error_with_account_name(s3a0, ld64(s390), ld64(s390 + 8), "fee_tier", 8)
												aj = ld64(s3a0)
												ai = ld64(s538 + 0x48)
												st64(ai + 0x10, ld64(s3a0 + 8))
												st64(ai + 8, aj)
												st32(ai, 2)
												return m
											}
											anchor_error_from(s3e0, 0x7d0 /* anchor::ConstraintMut */, br, bp)
											m = Error_with_account_name(s3f0, ld64(s3e0), ld64(s3e0 + 8), "token_vault_b", 0xd)
											aj = ld64(s3f0)
											ai = ld64(s538 + 0x48)
											st64(ai + 0x10, ld64(s3f0 + 8))
											st64(ai + 8, aj)
											st32(ai, 2)
											return m
										}
										anchor_error_from(s400, 0x7d0 /* anchor::ConstraintMut */, br, bp)
										m = Error_with_account_name(s410, ld64(s400), ld64(s400 + 8), "token_vault_a", 0xd)
										aj = ld64(s410)
										ai = ld64(s538 + 0x48)
										st64(ai + 0x10, ld64(s410 + 8))
										st64(ai + 8, aj)
										st32(ai, 2)
										return m
									}
									anchor_error_from(s420, 0x7d0 /* anchor::ConstraintMut */, br, bp)
									m = Error_with_account_name(s430, ld64(s420), ld64(s420 + 8), "funder", 6)
									aj = ld64(s430)
									ai = ld64(s538 + 0x48)
									st64(ai + 0x10, ld64(s430 + 8))
									st64(ai + 8, aj)
									st32(ai, 2)
									return m
								}
								st64(bb + 0x10, bd)
								st64(bb + 8, bc)
								st32(bb, 2)
								return m
							}
							anchor_error_from(s320, 0x7d6 /* anchor::ConstraintSeeds */)
							Error_with_account_name(s330, ld64(s320), ld64(s320 + 8), 0x100152b28 /* "whirlpool" */, 9)
							const ba = ld64(s330 + 8)
							const az = ld64(s330)
							const au = ld64(ld64(s1d8))
							const ay = ld64(au + 0x18)
							const ax = ld64(au + 0x10)
							const aw = ld64(au + 8)
							const av = ld64(au)
							copy(sa0, s180, 0x20)
							st64(sc0, av, aw, ax, ay)
							m = fn_13b5c0(s340, az, ba, sc0, aw)
							bc = ld64(s340)
							st64(bb + 0x10, ld64(s340 + 8))
							st64(bb + 8, bc)
							st32(bb, 2)
							return m
						}
						m = fn_13b430(s310, s198)
						bc = ld64(s310)
						st64(bb + 0x10, ld64(s310 + 8))
						st64(bb + 8, bc)
						st32(bb, 2)
						return m
					}
					m = Error_with_account_name(s300, ad, ae, "system_program", 0xe)
					bc = ld64(s300)
					st64(bb + 0x10, ld64(s300 + 8))
					st64(bb + 8, bc)
					st32(bb, 2)
					return m
				}
				m = Error_with_account_name(s2f0, ab, ac, "token_program", 0xd)
				bc = ld64(s2f0)
				st64(bb + 0x10, ld64(s2f0 + 8))
				st64(bb + 8, bc)
				st32(bb, 2)
				return m
			}
			m = Error_with_account_name(s2e0, x, al, "token_vault_b", 0xd)
			bc = ld64(s2e0)
			st64(bb + 0x10, ld64(s2e0 + 8))
			st64(bb + 8, bc)
			st32(bb, 2)
			return m
		}
		m = Error_with_account_name(s2c0, s, t, "funder", 6)
		aj = ld64(s2c0)
		ai = ld64(s538 + 0x48)
		st64(ai + 0x10, ld64(s2c0 + 8))
		st64(ai + 8, aj)
		st32(ai, 2)
		return m
	}
	alloc_handle_alloc_error(8, 0x70)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), p5 (value), p6 (value)
// types [heur]: b: InitializePoolContext (the handler ix_initialize_pool passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_31e50(a: u64, b: InitializePoolContext, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s80 = fp - 0x80, s98 = fp - 0x98, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, se0 = fp - 0xe0, s100 = fp - 0x100, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s1000 = fp - 0x1000
	let at, au: u64
	const accounts: InitializePoolAccounts = b.accounts
	const g: AccountInfo = ld64(accounts + 0x58)
	const h = g.key
	copyr(s120, h, 0x20)
	const i = ld64(ld64(accounts + 0xb8))
	copyr(s100, i, 0x20)
	const j: LamportsCell = g.lamports
	const k = ld8(b + 0x20)
	const m = ld16(accounts + 0x112)
	let az = ld64(accounts + 0xd0)
	let ay = j
	rc_inc(j)
	const l: DataCell = g.data
	const aw = p6
	const ax = p5
	rc_inc(l)
	const q = g.owner
	const p = g.rent_epoch
	const o = g.is_signer
	const n = g.is_writable
	st8(s98 + 2, g.executable)
	st8(s98, o, n)
	st64(sb0, l, q, p)
	const r = ay
	st64(sc0, h, ay)
	st64(s1000 + 8, ld64(accounts + 0x118))
	st64(s1000 + 0x10, accounts + 0x120)
	st64(s1000, accounts + 0xc8)
	let av = fn_78f88(s130, az, accounts + 0xd8, sc0, accounts + 0xc8, ld64(s1000 + 8), accounts + 0x120)
	let s = ld64(s130)
	let t = l
	if (s != 2) {
		au = ld64(s130 + 8)
		at = a
		rc_dec(r)
		if (!rc_release(t)) {
			st64(at + 8, au)
			st64(at, s)
			return av
		}
		st64(t + 8, ld64(t + 8) - 1)
		st64(at + 8, au)
		st64(at, s)
		return av
	}
	rc_dec(r)
	rc_dec(t)
	const u: AccountInfo = ld64(accounts + 0xb8)
	const v: LamportsCell = u.lamports
	const y = ld64(accounts + 0xd0)
	const x = u.key
	az = v
	rc_inc(v)
	const w: DataCell = u.data
	ay = y
	rc_inc(w)
	const ac = u.owner
	const ab = u.rent_epoch
	const aa = u.is_signer
	const z = u.is_writable
	st8(s98 + 2, u.executable)
	st8(s98, aa, z)
	st64(sb0, w, ac, ab)
	const ad = az
	st64(sc0, x, az)
	st64(s1000 + 8, ld64(accounts + 0x118))
	st64(s1000 + 0x10, accounts + 0x120)
	st64(s1000, accounts + 0xc8)
	av = fn_78f88(s140, ay, accounts + 0xe0, sc0, accounts + 0xc8, ld64(s1000 + 8), accounts + 0x120)
	s = ld64(s140)
	if (s == 2) {
		rc_dec(ad)
		rc_dec(w)
		const ah = ld64(accounts + 0xc0)
		const ag = ld64(accounts + 0xd0)
		const ae = accounts.token_vault_a.key
		copyr(se0, ae, 0x20)
		const af = accounts.token_vault_b.key
		copyr(sc0, af, 0x20)
		st64(s1000, k, d, ax, aw, m, s120, se0, s100, sc0, 0)
		av = fn_5db48(s150, ag + 8, ah, d, k, d, ax, aw, m, s120, se0, s100, sc0, 0)
		s = ld64(s150)
		if (s == 2) {
			const ai = ld64(ld64(ld64(accounts + 0xd0)))
			copyr(sc0, ai, 0x20)
			const aj = ld64(ld64(ld64(accounts + 0xc0)))
			copyr(sa0, aj, 0x20)
			const ak = ld64(ld64(accounts + 0x58))
			copyr(s80, ak, 0x20)
			const al = ld64(ld64(accounts + 0xb8))
			copyr(s60, al, 0x20)
			const am = ld64(ld64(accounts + 0x118))
			copyr(s40, am, 0x20)
			copyr(s20, am, 0x20)
			const an = ld64(0x300000000 /* heap bump-allocator cursor */)
			const ao = an != 0 ? sat_sub(an, 0x100) : 0x300007f00
			if (ao > 0x300000007) {
				const ar = ld8(accounts + 0x30)
				const aq = ld8(accounts + 0x90)
				st64(0x300000000 /* heap bump-allocator cursor */, ao)
				st64(ao, 0xe5fec60c57ad7664 /* event:PoolInitialized */)
				st64(ao + 0x20, ld64(sb0 + 8))
				st64(ao + 0x18, ld64(sb0))
				st64(ao + 0x10, ld64(sc0 + 8))
				st64(ao + 8, ld64(sc0))
				st64(ao + 0x40, ld64(s98 + 0x10))
				st64(ao + 0x38, ld64(s98 + 8))
				st64(ao + 0x30, ld64(s98))
				st64(ao + 0x28, ld64(sa0))
				st64(ao + 0x60, ld64(s80 + 0x18))
				st64(ao + 0x58, ld64(s80 + 0x10))
				st64(ao + 0x50, ld64(s80 + 8))
				st64(ao + 0x48, ld64(s80))
				copy(ao + 0x68, s60, 0x18)
				const ap = ld64(s60 + 0x18)
				st16(ao + 0x88, d)
				st64(ao + 0x80, ap)
				st64(ao + 0xa2, ld64(s40 + 0x18))
				st64(ao + 0x9a, ld64(s40 + 0x10))
				st64(ao + 0x92, ld64(s40 + 8))
				st64(ao + 0x8a, ld64(s40))
				st64(ao + 0xc2, ld64(s20 + 0x18))
				st64(ao + 0xba, ld64(s20 + 0x10))
				st64(ao + 0xb2, ld64(s20 + 8))
				st64(ao + 0xaa, ld64(s20))
				st64(ao + 0xd4, aw)
				st64(ao + 0xcc, ax)
				st8(ao + 0xcb, aq)
				st8(ao + 0xca, ar)
				st64(se0, ao, 0xdc)
				av = log_data(se0, 1)
				st64(a + 8, undef)
				st64(a, 2)
				return av
			}
			raw_vec_handle_error(1, 0x100, sat_sub(an, 0x100), 0x100 > an)
		}
		st64(a + 8, ld64(s150 + 8))
		st64(a, s)
		return av
	}
	au = ld64(s140 + 8)
	at = a
	rc_dec(ad)
	t = w
	if (!rc_release(w)) {
		st64(at + 8, au)
		st64(at, s)
		return av
	}
	st64(t + 8, ld64(t + 8) - 1)
	st64(at + 8, au)
	st64(at, s)
	return av
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

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
function fn_9d160(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s290 = fp - 0x290, s291 = fp - 0x291, s294 = fp - 0x294, s2b8 = fp - 0x2b8, s2d8 = fp - 0x2d8, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, s338 = fp - 0x338, s350 = fp - 0x350, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s398 = fp - 0x398, s3e0 = fp - 0x3e0, s400 = fp - 0x400, s420 = fp - 0x420, s458 = fp - 0x458, s468 = fp - 0x468, s488 = fp - 0x488, s497 = fp - 0x497, s4a0 = fp - 0x4a0, s4b8 = fp - 0x4b8, s4d0 = fp - 0x4d0, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s5a0 = fp - 0x5a0, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s5d8 = fp - 0x5d8, s5e0 = fp - 0x5e0, s5e8 = fp - 0x5e8, s5f0 = fp - 0x5f0
	let az, dh, di, dj: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s558, b, f)
	if (g != 0) {
		const p = ld64(ld64(b + 0x10))
		st64(s5a0 + 0x28, p)
		const q = ld64(p)
		copyr(s350, q + 8, 0x18)
		st64(s5a0 + 0x30, q)
		st64(s358, ld64(q))
		const r = ld64(f)
		copyr(s4d0, r + 8, 0x18)
		st64(s5a0 + 0x38, r)
		st64(s4d8, ld64(r))
		if ((memcmp(s358, s4d8, 0x20) as u32) == 0) {
			ErrorCode_name(s2d8, 0x100152d40)
			st64(s2b8, 0, 1, 0)
			st64(s338, s2b8, 0x100159480)
			st8(s338 + 0x18, 3)
			st64(s338 + 0x10, 0x20)
			st64(s350 + 8, 0)
			st64(s358, 0)
			if (ErrorCode_fmt(0x100152d40, s358) == 0) {
				copyr(s4a0, s2b8, 0x18)
				copy(s4b8, s2d8, 0x18)
				st64(s4d0, 0x1001548d6)
				st32(s458 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s488, 2)
				st32(s4d0 + 0x10, 5)
				st64(s4d0 + 8, 0x36)
				st64(s4d8, 0)
				const be = fn_13b3a8(s518, s4d8)
				const bd = ld64(s518 + 8)
				const bc = ld64(s518)
				const ba = ld64(s5a0 + 0x30)
				copyr(s4d8, ba, 0x20)
				const bb = ld64(s5a0 + 0x38)
				copy(s4b8, bb, 0x20)
				dj = fn_13b5c0(s528, bc, bd, s4d8, be)
				const bf = ld64(s528)
				st64(a + 8, ld64(s528 + 8))
				st64(a, bf)
				return dj
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s4d8, 0x1001594b0, 0x1001594d0)
		}
		st64(s5a0 + 0x40, a)
		const s = ld64(b + 8)
		const t = __floatundidf(ld64(s) * 0x30d)
		const u = fn_14f7f8(ld64(s + 8), t)
		const v = fn_151cb0(u, 0)
		const w = fn_14f3e8(u)
		const x = max((fn_151a40(u, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (v as i64) ? 0 : w, 1)
		let bh: AccountInfo = ld64(s558 + 8)
		let cc = ld64(s558)
		if (x > g) {
			const y: AccountInfo = ld64(s5a0 + 0x28)
			const z: LamportsCell = y.lamports
			rc_inc(z)
			const bg: DataCell = y.data
			rc_inc(bg)
			const bi: LamportsCell = bh.lamports
			const bj = bi.strong
			st64(s5a0 + 0x10, bh.key)
			st64(s5a0 + 0x18, y.executable)
			st64(s5a0 + 0x20, y.is_writable)
			st64(s5a0 + 0x38, y.is_signer)
			const bl = y.rent_epoch
			const bm = y.owner
			rc_inc(bi, bj)
			const bk: DataCell = bh.data
			rc_inc(bk)
			st64(s5b8, bl, bm, bi, bg, z)
			const bn: AccountInfo = ld64(ld64(ld64(s558) + 0x18))
			const bo: LamportsCell = bn.lamports
			const bp = bo.strong
			st64(s5a0 + 0x28, sat_sub(x, g))
			const bq: AccountInfo = ld64(s558 + 8)
			st64(s5d8 + 0x10, bq.executable)
			st64(s5d8 + 0x18, bq.is_writable)
			const bu = bq.is_signer
			const bv = bq.rent_epoch
			const bw = bq.owner
			const bt = bn.key
			rc_inc(bo, bp)
			const br: DataCell = bn.data
			const bs = br.strong
			st64(s5d8 + 8, bt)
			rc_inc(br, bs)
			st64(s5d8, bn.owner)
			st64(s5e0, bn.rent_epoch)
			const bz = bn.is_signer
			const by = bn.is_writable
			const bx = bn.executable
			st8(s398 + 0x1a, ld64(s5d8 + 0x10))
			st8(s398 + 0x19, ld64(s5d8 + 0x18))
			st8(s398 + 0x18, bu)
			st64(s398, bk, bw, bv)
			st64(s3e0 + 0x40, ld64(s5a8))
			st64(s3e0 + 0x38, ld64(s5a0 + 0x10))
			st8(s3e0 + 0x32, ld64(s5a0 + 0x18))
			st8(s3e0 + 0x31, ld64(s5a0 + 0x20))
			st8(s3e0 + 0x30, ld64(s5a0 + 0x38))
			st64(s3e0 + 0x28, ld64(s5b8))
			st64(s3e0 + 0x20, ld64(s5b8 + 8))
			st64(s3e0 + 0x18, ld64(s5a0))
			st64(s3e0 + 0x10, ld64(s5a0 + 8))
			st64(s3e0 + 8, ld64(s5a0 + 0x30))
			st8(s3e0, bz, by, bx)
			st64(s400 + 0x18, ld64(s5e0))
			st64(s400 + 0x10, ld64(s5d8))
			st64(s400, bo, br)
			st64(s420 + 0x18, ld64(s5d8 + 8))
			st64(s378, 8, 0)
			st64(s420, 0, 8, 0)
			dj = fn_13d318(s4e8, s420, ld64(s5a0 + 0x28))
			az = ld64(s4e8)
			if (az != 2) {
				di = ld64(s4e8 + 8)
				dh = ld64(s5a0 + 0x40)
				st64(dh, az, di)
				return dj
			}
			bh = ld64(s558 + 8)
			st64(s5a0 + 0x38, bh.key)
			cc = ld64(s558)
		}
		const ca: LamportsCell = bh.lamports
		rc_inc(ca)
		const cb: DataCell = bh.data
		rc_inc(cb)
		const cd: AccountInfo = ld64(ld64(cc + 0x18))
		const ce: LamportsCell = cd.lamports
		const cf = ce.strong
		st64(s5a0 + 0x20, bh.executable)
		st64(s5a0 + 0x28, bh.is_writable)
		st64(s5a0 + 0x30, bh.is_signer)
		const ci = bh.rent_epoch
		const cj = bh.owner
		st64(s5a0 + 0x18, cd.key)
		rc_inc(ce, cf)
		const cg: DataCell = cd.data
		const ch = cg.strong
		st64(s5a0, ci, cj, ca)
		rc_inc(cg, ch)
		st64(s5a8, cd.owner)
		st64(s5b8 + 8, cd.rent_epoch)
		st64(s5b8, cd.is_signer)
		st64(s5d8 + 0x18, cd.is_writable)
		const co = cd.executable
		const ck = ld64(ld64(ld64(cc + 0x20)))
		copyr(s2f0, ck + 8, 0x18)
		st64(s5d8 + 0x10, ck)
		st64(s2f8, ld64(ck))
		const cl = ld64(ld64(ld64(cc + 0x28) + 0x58))
		copyr(s2d8, cl, 0x20)
		const cm = ld64(ld64(ld64(cc + 0x30) + 0x58))
		copyr(s2b8, cm, 0x20)
		const cn = ld16(ld64(cc + 0x38))
		st64(s5d8 + 8, cn)
		st16(s294, cn)
		const cp = ld8(ld64(cc + 0x40))
		st64(s338 + 0x30, s291)
		st64(s338 + 0x20, s294)
		st64(s338 + 0x10, s2b8)
		st64(s338, s2d8)
		st64(s350 + 8, s2f8)
		st64(s358, 0x100152b28)
		st64(s368, s358)
		st64(s468 + 8, s368)
		st8(s468 + 2, co)
		st8(s468 + 1, ld64(s5d8 + 0x18))
		st8(s468, ld64(s5b8))
		st64(s488 + 0x18, ld64(s5b8 + 8))
		st64(s488 + 0x10, ld64(s5a8))
		st64(s488, ce, cg)
		st64(s497 + 7, ld64(s5a0 + 0x18))
		st8(s497 + 1, ld64(s5a0 + 0x20))
		st8(s497, ld64(s5a0 + 0x28))
		st8(s4a0 + 8, ld64(s5a0 + 0x30))
		st64(s4a0, ld64(s5a0))
		st64(s4b8 + 0x10, ld64(s5a0 + 8))
		st64(s4b8 + 8, cb)
		st64(s4b8, ld64(s5a0 + 0x10))
		st64(s4d0 + 0x10, ld64(s5a0 + 0x38))
		st64(s5a0 + 0x38, cp)
		st8(s291, cp)
		st64(s338 + 0x38, 1)
		st64(s338 + 0x28, 2)
		st64(s338 + 0x18, 0x20)
		st64(s338 + 8, 0x20)
		st64(s350 + 0x10, 0x20)
		st64(s350, 9)
		st64(s368 + 8, 6)
		st64(s458, 1)
		st64(s4d8, 0, 8, 0)
		dj = fn_13c8b8(s4f8, s4d8, 0x28d)
		az = ld64(s4f8)
		if (az != 2) {
			di = ld64(s4f8 + 8)
			dh = ld64(s5a0 + 0x40)
			st64(dh, az, di)
			return dj
		}
		const cq: AccountInfo = ld64(s558 + 8)
		const cr: LamportsCell = cq.lamports
		const cv = cq.key
		rc_inc(cr)
		const cs: DataCell = cq.data
		rc_inc(cs)
		const ct: LamportsCell = cd.lamports
		const cu = ct.strong
		st64(s5a0 + 0x30, cv)
		st64(s5a0 + 8, cd.key)
		st64(s5a0 + 0x10, cq.executable)
		st64(s5a0 + 0x18, cq.is_writable)
		st64(s5a0 + 0x20, cq.is_signer)
		st64(s5a0 + 0x28, cq.rent_epoch)
		const cy = cq.owner
		rc_inc(ct, cu)
		const cw: DataCell = cd.data
		const cx = cw.strong
		st64(s5a8, cy, cr)
		rc_inc(cw, cx)
		st64(s5b8 + 8, cd.owner)
		st64(s5b8, cd.rent_epoch)
		const dc = cd.is_signer
		const db = cd.is_writable
		const da = cd.executable
		const cz = ld64(s5d8 + 0x10)
		copyr(s2f8, cz, 0x20)
		copyr(s2d8, cl, 0x20)
		copyr(s2b8, cm, 0x20)
		st16(s294, ld64(s5d8 + 8))
		st8(s291, ld64(s5a0 + 0x38))
		st64(s368, s358, 6, 0x100152b28, 9, s2f8, 0x20, s2d8, 0x20, s2b8, 0x20, s294, 2, s291, 1)
		st64(s468 + 8, s368)
		st8(s468, dc, db, da)
		st64(s488 + 0x18, ld64(s5b8))
		st64(s488 + 0x10, ld64(s5b8 + 8))
		st64(s488, ct, cw)
		st64(s497 + 7, ld64(s5a0 + 8))
		st8(s497 + 1, ld64(s5a0 + 0x10))
		st8(s497, ld64(s5a0 + 0x18))
		st8(s4a0 + 8, ld64(s5a0 + 0x20))
		st64(s4a0, ld64(s5a0 + 0x28))
		st64(s4b8 + 0x10, ld64(s5a8))
		st64(s4b8 + 8, cs)
		st64(s4b8, ld64(s5a0))
		st64(s4d0 + 0x10, ld64(s5a0 + 0x30))
		st64(s458, 1)
		st64(s4d8, 0, 8, 0)
		dj = fn_13cc48(s508, s4d8, ld64(ld64(ld64(s558) + 0x48)))
		az = ld64(s508)
		if (az != 2) {
			di = ld64(s508 + 8)
			dh = ld64(s5a0 + 0x40)
			st64(dh, az, di)
			return dj
		}
	} else {
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0x30d)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const ad = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		const m = ld64(s558)
		const n: AccountInfo = ld64(ld64(m + 0x10))
		const o: LamportsCell = n.lamports
		const ac = n.key
		const ae = ld64(s558 + 8)
		rc_inc(o)
		const aa: DataCell = n.data
		st64(s5a0 + 0x38, aa)
		const ab = aa.strong
		st64(s5a0 + 0x30, ac)
		rc_inc(ld64(s5a0 + 0x38), ab)
		const af = ld64(ae + 8)
		const ag = ld64(af)
		st64(s5a0, ld64(ae))
		st64(s5a0 + 8, n.executable)
		st64(s5a0 + 0x10, n.is_writable)
		st64(s5a0 + 0x18, n.is_signer)
		st64(s5a0 + 0x20, n.rent_epoch)
		st64(s5a0 + 0x28, n.owner)
		rc_inc(af, ag)
		const ah = ld64(ae + 0x10)
		const ai = ld64(ah)
		st64(s5a8, o)
		rc_inc(ah, ai)
		const aj: AccountInfo = ld64(ld64(m + 0x18))
		const ak: LamportsCell = aj.lamports
		const al = ak.strong
		st64(s5a0 + 0x40, a)
		const am: AccountInfo = ld64(s558 + 8)
		st64(s5d8 + 0x10, am.executable)
		st64(s5d8 + 0x18, am.is_writable)
		st64(s5b8, am.is_signer)
		st64(s5b8 + 8, am.rent_epoch)
		const aw = am.owner
		const ap = aj.key
		rc_inc(ak, al)
		const an: DataCell = aj.data
		const ao = an.strong
		st64(s5d8, ap, ad)
		rc_inc(an, ao)
		st64(s5e0, aj.owner)
		st64(s5e8, aj.rent_epoch)
		st64(s5f0, aj.is_signer)
		const ay = aj.is_writable
		const ax = aj.executable
		const aq = ld64(s558)
		const ar = ld64(ld64(ld64(aq + 0x20)))
		copyr(s2f8, ar, 0x20)
		const at = ld64(ld64(ld64(aq + 0x28) + 0x58))
		copyr(s2d8, at, 0x20)
		const au = ld64(ld64(ld64(aq + 0x30) + 0x58))
		copyr(s2b8, au, 0x20)
		st16(s294, ld16(ld64(aq + 0x38)))
		const av = ld8(ld64(aq + 0x40))
		st64(s338 + 0x30, s291)
		st64(s338 + 0x20, s294)
		st64(s338 + 0x10, s2b8)
		st64(s338, s2d8)
		st64(s350 + 8, s2f8)
		st64(s358, 0x100152b28)
		st8(s291, av)
		st64(s368, s358)
		st64(s458 + 0x28, s368)
		st8(s458 + 0x22, ld64(s5d8 + 0x10))
		st8(s458 + 0x21, ld64(s5d8 + 0x18))
		st8(s458 + 0x20, ld64(s5b8))
		st64(s458 + 0x18, ld64(s5b8 + 8))
		st64(s458, af, ah, aw)
		st64(s468 + 8, ld64(s5a0))
		st8(s468 + 2, ld64(s5a0 + 8))
		st8(s468 + 1, ld64(s5a0 + 0x10))
		st8(s468, ld64(s5a0 + 0x18))
		st64(s488 + 0x18, ld64(s5a0 + 0x20))
		st64(s488 + 0x10, ld64(s5a0 + 0x28))
		st64(s488 + 8, ld64(s5a0 + 0x38))
		st64(s488, ld64(s5a8))
		st64(s497 + 7, ld64(s5a0 + 0x30))
		st8(s497, ay, ax)
		st8(s4a0 + 8, ld64(s5f0))
		st64(s4a0, ld64(s5e8))
		st64(s4b8 + 0x10, ld64(s5e0))
		st64(s4b8, ak, an)
		st64(s4d0 + 0x10, ld64(s5d8))
		st64(s338 + 0x38, 1)
		st64(s338 + 0x28, 2)
		st64(s338 + 0x18, 0x20)
		st64(s338 + 8, 0x20)
		st64(s350 + 0x10, 0x20)
		st64(s350, 9)
		st64(s368 + 8, 6)
		st64(s458 + 0x30, 1)
		st64(s4d8, 0, 8, 0)
		dj = fn_13cfd8(s538, s4d8, ld64(s5d8 + 8), 0x28d, ld64(ld64(aq + 0x48)))
		az = ld64(s538)
		if (az != 2) {
			di = ld64(s538 + 8)
			dh = ld64(s5a0 + 0x40)
			st64(dh, az, di)
			return dj
		}
	}
	const df = ld64(s5a0 + 0x40)
	fn_3aa0(s290, ld64(s558 + 8))
	if (ld64(s290) == 0) {
		dj = Error_with_account_name(s548, ld64(s290 + 8), ld64(s290 + 0x10), 0x100152b28 /* "whirlpool" */, 9)
		const dg = ld64(s548)
		st64(df + 8, ld64(s548 + 8))
		st64(df, dg)
		return dj
	}
	const dd = ld64(0x300000000 /* heap bump-allocator cursor */)
	const de = dd != 0 ? sat_sub(dd, 0x290) & -8 : 0x300007d70
	if (de > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, de)
		dj = memcpy(de, s290, 0x290)
		st64(df + 8, de)
		st64(df, 2)
		return dj
	}
	alloc_handle_alloc_error(8, 0x290)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
function fn_143100(a: AccountInfo, b: u64, c: u64, d: u64, e: u64): u64 {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
function fn_14f7f8(a: u64, b: u64): u64 {
	return fn_14f808(a, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: p6 (value)
function fn_78f88(a: u64, b: u64, c: u64, d: AccountInfo, p5: u64, p6: u64, p7: u64): u64 {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), p6 (value), p7 (value), p8 (value)
function fn_5db48(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64, p13: u64, p14: u64): u64 {
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

function log_data(a: u64, b: u64): u64 {
	return sol_log_data(a, b)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it)
function fn_149678(a: u64, b: u64, c: u64, d: u64, e: u64): never {
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
function fn_3aa0(a: u64, b: u64) {
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

function fn_1486f0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (points to it)
function fn_127df0(a: u64, b: u64, c: u64, d: u64): u64 {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
function fn_5fd40(a: u64): u64 {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it), c (points to it), p5 (value), p7 (value)
function fn_5ecd8(a: u64, b: u64, c: u64, d: AccountInfo, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64): u64 {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (points to it)
function fn_12f7b0(a: u64, b: u64, c: u64, d: u64, e: u64) {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (points to it)
function fn_132d88(a: u64, b: u64, c: u64) {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), c (points to it)
function fn_1390b0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1000 = fp - 0x1000
	st64(s1000, 8, 0)
	return fn_1390d8(a, b, c, d, fp)
}

function fn_13b50(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64, r7: u64): u64 {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_149478(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	const s20 = fp - 0x20, s28 = fp - 0x28
	st64(s20, 0x10015b8e0, a, b)
	st16(s20 + 0x18, 1)
	st64(s28, 1)
	fn_147238(s28, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
function fn_53940(a: u64): u64 {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (points to it)
function fn_105ad8(a: u64, b: u64, c: u64, d: u64, e: u64) {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value)
function fn_132800(a: u64, b: u64, c: u64, d: u64, e: u64) {
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

function fn_13ee80(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1000 = fp - 0x1000
	st64(s1000, 8, 0)
	return fn_13eea8(a, b, c, d, ld64(s1000), ld64(s1000 + 8))
}

function fn_83078(r0: u64): u64 {
	return r0
}

function fn_14f060(a: u64, b: u64): u64 {
	return fn_14ecd0(ld64(a), 1, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (points to it)
function fn_12e9c0(a: u64, b: u64): u64 {
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

function fn_13fd08(a: u64, b: u64, c: u64, d: u64, e: u64) {
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

// name [heur]: compares the instruction data's first 8 bytes with 66 handlers' discriminators and calls the matching handler (was fn_1066b0)
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: ix_data, program_id, accounts, accounts_len, ix_data_len
function anchor_dispatch(a: u64, program_id: u64, accounts: u64, accounts_len: u64, p5: u64, p6: u64) {
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

function fn_150f0(a: u64, r0: u64): u64 {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_147238(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	fn_1478b8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_501e0(a: u64, b: u64, r0: u64): u64 {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_14c4f0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c4f8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (points to it)
function fn_ff18(a: u64, b: u64) {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value)
function fn_13eea8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64 {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), d (value), e (value)
function fn_1495b0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
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

// instruction handler: initialize_config (discriminator sha256("global:initialize_config")[..8] = 0x46c4bec201157fd0)
// accounts [str: the program's account-error strings, in order of first use]: funder, config, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: config
function ix_initialize_config(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s18 = fp - 0x18, s88 = fp - 0x88, sa0 = fp - 0xa0, sc9 = fp - 0xc9, se9 = fp - 0xe9, s108 = fp - 0x108, s109 = fp - 0x109, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170
	let l, o, p, q, s, t: u64
	let g = a
	sol_log("Instruction: InitializeConfig", 0x1d)
	const f = ix_args_len
	if (0x20 > f) {
		l = fn_1459d0(0x100159468)
	} else {
		const ab = g
		const h = ix_args
		const i = ld64(h + 6)
		st8(sa0 + 8, ld8(h + 0xe))
		st64(sa0, i)
		if ((f & -0x20) != 0x20) {
			const v = ld64(sa0 + 1)
			const j = ld64(h + 0x26)
			st8(sa0 + 8, ld8(h + 0x2e))
			st64(sa0, j)
			if ((f & -0x20) != 0x40) {
				const u = ld64(sa0 + 1)
				const k = ld64(h + 0x46)
				st8(sa0 + 8, ld8(h + 0x4e))
				st64(sa0, k)
				if ((f & -2) != 0x60) {
					const z = ld64(sa0 + 1)
					const x = ld32(h + 2)
					const y = ld16(h)
					const aa = ld16(h + 0x60)
					st8(s18 + 0x10, ld8(h + 0x1f))
					copyr(s18, h + 0xf, 0x10)
					st16(s88 + 0x6c, ld16(h + 0x24))
					st32(s88 + 0x68, ld32(h + 0x20))
					st64(s130, accounts, accounts_len)
					t = accounts_initialize_config(sa0, program_id, s130, j, fp)
					const w = ld64(sa0)
					if (w == 0) {
						s = ld64(sa0 + 8)
						st64(ab + 8, ld64(sa0 + 0x10))
						st64(ab, s)
						return t
					}
					memcpy(s108, s88, 0x68)
					st64(s120 + 0xf, v)
					st8(s120 + 0xe, i)
					st32(s120 + 0xa, x)
					st16(s120 + 8, y)
					st64(s120, w)
					st64(s108 + 0x17, u)
					st8(s108 + 0x16, j)
					st16(s108 + 0x14, ld16(s88 + 0x6c))
					st8(s108 + 0xf, ld8(s18 + 0x10))
					copyr(s109, s18, 0x10)
					st32(s108 + 0x10, ld32(s88 + 0x68))
					st8(se9 + 0x10, ld8(h + 0x3f))
					copyr(se9, h + 0x2f, 0x10)
					st32(se9 + 0x11, ld32(h + 0x40))
					st16(se9 + 0x15, ld16(h + 0x44))
					st64(se9 + 0x18, z)
					st8(se9 + 0x17, k)
					copy(sc9, h + 0x4f, 0x10)
					st8(sc9 + 0x10, ld8(h + 0x5f))
					if (aa > 0x9c4 /* anchor::RequireViolated */) {
						t = fn_87630(s140, 0x1d)
						s = ld64(s140)
						g = ab
						if (s != 2) {
							st64(g + 8, ld64(s140 + 8))
							st64(g, s)
							return t
						}
					} else {
						st16(sc9 + 0x11, aa)
						g = ab
					}
					st16(sc9 + 0x13, 0)
					t = fn_8228(s150, s120, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
					const r = ld64(s150)
					if (r != 2) {
						t = Error_with_account_name(s160, r, ld64(s150 + 8), 0x100154883 /* "config" */, 6)
						s = ld64(s160)
						st64(g + 8, ld64(s160 + 8))
						st64(g, s)
						return t
					}
					st64(g + 8, r)
					st64(g, 2)
					return t
				}
			}
		}
		l = fn_1459d0(0x100159468)
		g = ab
	}
	const m = l
	if (2 > (l & 3) - 2) {
		t = anchor_error_from(s170, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		s = ld64(s170)
		st64(g + 8, ld64(s170 + 8))
		st64(g, s)
		return t
	}
	if ((m & 3) == 0) {
		t = anchor_error_from(s170, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		s = ld64(s170)
		st64(g + 8, ld64(s170 + 8))
		st64(g, s)
		return t
	}
	const n = ld64(ld64(l + 7))
	callx(n, ld64(l - 1), n)
	t = anchor_error_from(s170, 0x66 /* anchor::InstructionDidNotDeserialize */)
	s = ld64(s170)
	st64(g + 8, ld64(s170 + 8))
	st64(g, s)
	return t
}

// instruction handler: increase_liquidity (discriminator sha256("global:increase_liquidity")[..8] = 0xb2fbcd0d76f39c2e)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, position, position_token_account, token_owner_account_a, token_owner_account_b, tick_array_lower, tick_array_upper, token_program, token_vault_b, token_vault_a, position_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: accounts, accounts_len, ix_args_len
function ix_increase_liquidity(a: u64, b: u64, accounts: u64, accounts_len: u64, p5: u64, ix_args_len: u64): u64 {
	const s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0
	let i, j: u64
	sol_log(0x100155645 /* "Instruction: IncreaseLiquidity" */, 0x1e)
	const f = ix_args_len
	if (f >= 0x10 && ((f | 8) & -8) != 0x18) {
		st64(s3c0, accounts, accounts_len)
		j = accounts_increase_liquidity(s3b0, undef, s3c0, undef, fp)
		if (ld64(s3b0) == 0) {
			i = ld64(s3b0 + 8)
			st64(a + 8, ld64(s3b0 + 0x10))
			st64(a, i)
			return j
		}
		fn_1494c8("internal error: entered unreachable code", 0x28, 0x10015a928)
	}
	const g = fn_1459d0(0x100159468)
	if (2 > (g & 3) - 2) {
		j = anchor_error_from(s3d0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s3d0)
		st64(a + 8, ld64(s3d0 + 8))
		st64(a, i)
		return j
	}
	if ((g & 3) == 0) {
		j = anchor_error_from(s3d0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s3d0)
		st64(a + 8, ld64(s3d0 + 8))
		st64(a, i)
		return j
	}
	const h = ld64(ld64(g + 7))
	callx(h, ld64(g - 1), h)
	j = anchor_error_from(s3d0, 0x66 /* anchor::InstructionDidNotDeserialize */)
	i = ld64(s3d0)
	st64(a + 8, ld64(s3d0 + 8))
	st64(a, i)
	return j
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_1478b8(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	custom_panic(a, b, c, d, e)
	abort()
}

// not included (size budget), see ix/initialize_tick_array.ts, ix/initialize_dynamic_tick_array.ts, ix/initialize_fee_tier.ts, ix/initialize_reward.ts, ix/set_reward_emissions.ts, ix/open_position.ts, ix/open_position_with_metadata.ts, ix/decrease_liquidity.ts, ix/update_fees_and_rewards.ts, ix/collect_fees.ts, ix/collect_reward.ts, ix/collect_protocol_fees.ts, ix/swap.ts, ix/close_position.ts, ix/set_default_fee_rate.ts, ix/set_default_protocol_fee_rate.ts, ix/set_fee_rate.ts, ix/set_protocol_fee_rate.ts, ix/set_fee_authority.ts, ix/set_collect_protocol_fees_authority.ts, ix/set_reward_authority.ts, ix/set_reward_authority_by_super_authority.ts, ix/set_reward_emissions_super_authority.ts, ix/two_hop_swap.ts, ix/initialize_position_bundle.ts, ix/initialize_position_bundle_with_metadata.ts, ix/delete_position_bundle.ts, ix/open_bundled_position.ts, ix/close_bundled_position.ts, ix/open_position_with_token_extensions.ts, ix/close_position_with_token_extensions.ts, ix/lock_position.ts, ix/reset_position_range.ts, ix/transfer_locked_position.ts, ix/initialize_adaptive_fee_tier.ts, ix/set_default_base_fee_rate.ts, ix/set_delegated_fee_authority.ts, ix/set_initialize_pool_authority.ts, ix/set_preset_adaptive_fee_constants.ts, ix/initialize_pool_with_adaptive_fee.ts, ix/set_fee_rate_by_delegated_fee_authority.ts, ix/set_adaptive_fee_constants.ts, ix/set_config_feature_flag.ts, ix/migrate_repurpose_reward_authority_space.ts, ix/collect_fees_v2.ts, ix/collect_protocol_fees_v2.ts, ix/collect_reward_v2.ts, ix/decrease_liquidity_v2.ts, ix/increase_liquidity_v2.ts, ix/increase_liquidity_by_token_amounts_v2.ts, ix/initialize_pool_v2.ts, ix/initialize_reward_v2.ts, ix/set_reward_emissions_v2.ts, ix/swap_v2.ts, ix/two_hop_swap_v2.ts, ix/reposition_liquidity_v2.ts, ix/initialize_config_extension.ts, ix/set_config_extension_authority.ts, ix/set_token_badge_authority.ts, ix/initialize_token_badge.ts, ix/delete_token_badge.ts, ix/set_token_badge_attribute.ts, ix/idl_include.ts, shared.ts, ix/initialize_config.ts:
declare function ix_initialize_tick_array(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_initialize_dynamic_tick_array(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_initialize_fee_tier(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_initialize_reward(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_set_reward_emissions(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_open_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_open_position_with_metadata(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_decrease_liquidity(a: u64, b: u64, accounts: u64, accounts_len: u64, p5: u64, ix_args_len: u64): u64
declare function ix_update_fees_and_rewards(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_collect_fees(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_collect_reward(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_collect_protocol_fees(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_swap(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_close_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_set_default_fee_rate(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_set_default_protocol_fee_rate(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_set_fee_rate(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_set_protocol_fee_rate(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_set_fee_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_set_collect_protocol_fees_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_set_reward_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64, p5: u64, ix_args_len: u64): u64
declare function ix_set_reward_authority_by_super_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64, p5: u64, ix_args_len: u64): u64
declare function ix_set_reward_emissions_super_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_two_hop_swap(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_initialize_position_bundle(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_initialize_position_bundle_with_metadata(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_delete_position_bundle(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_open_bundled_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_close_bundled_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_open_position_with_token_extensions(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_close_position_with_token_extensions(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_lock_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_reset_position_range(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_transfer_locked_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_initialize_adaptive_fee_tier(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_set_default_base_fee_rate(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_set_delegated_fee_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_set_initialize_pool_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_set_preset_adaptive_fee_constants(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_initialize_pool_with_adaptive_fee(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_set_fee_rate_by_delegated_fee_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_set_adaptive_fee_constants(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_set_config_feature_flag(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_migrate_repurpose_reward_authority_space(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_collect_fees_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_collect_protocol_fees_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_collect_reward_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_decrease_liquidity_v2(a: u64, b: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_increase_liquidity_v2(a: u64, b: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_increase_liquidity_by_token_amounts_v2(a: u64, b: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_initialize_pool_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_initialize_reward_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_set_reward_emissions_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_swap_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_two_hop_swap_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_reposition_liquidity_v2(a: u64, b: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_initialize_config_extension(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_set_config_extension_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_set_token_badge_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_initialize_token_badge(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_delete_token_badge(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64
declare function ix_set_token_badge_attribute(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64
declare function ix_idl_include(a: u64, b: u64, accounts: u64, accounts_len: u64): u64
declare function fn_108e38(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, r8: u64): u64
declare function fn_68db8(): u64
declare function fn_14c4f8(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_14c5c0(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function accounts_initialize_config(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_8228(a: u64, b: u64, c: u64, d: u64): u64
declare function accounts_increase_liquidity(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_1494c8(a: u64, b: u64, c: u64, d: u64, e: u64): never
