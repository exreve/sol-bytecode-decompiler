// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction initialize_pool_v2: handler + 53 reachable functions
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
interface InitializePoolV2Accounts { // Accounts struct of instruction initialize_pool_v2 as accounts_initialize_pool_v2 returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	token_badge_a: at<0x108, ref<AccountInfo>>
	funder:        at<0x118, ref<AccountInfo>>
	token_vault_a: at<0x128, ref<AccountInfo>>
	token_vault_b: at<0x130, ref<AccountInfo>>
}
interface InitializePoolV2Context { // anchor_lang Context of instruction initialize_pool_v2 (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<InitializePoolV2Accounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_log_data(slices: u64, len: u64): void // log base64 data: slices = &[&[u8]]
declare function sol_invoke_signed_rust(ix: u64, accountInfos: u64, accountInfosLen: u64, signerSeeds: u64, signerSeedsLen: u64): u64 // CPI (Rust ABI: &Instruction, &[AccountInfo], &[&[&[u8]]])
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function sol_memset(dst: u64, byte: u64, n: u64): void // memset
declare function try_accounts_120(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_610(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function fn_b580(a: u64): u64 // lib uses alloc_handle_alloc_error, Error__new
declare function ptr_drop_in_place_bf20(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 2]>
declare function ptr_drop_in_place_c1b0(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 4]>
declare function fn_e478(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function fn_f658(a: u64, b: u64): u64 // lib
declare function fn_fe08(a: u64, b: u64): void // lib
declare function AccountInfo_clone(a: u64, b: u64): void // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11990(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11de0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_12008(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_122e8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function ptr_drop_in_place_126088(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<alloc::vec::Vec<solana_account_info::AccountInfo>>
declare function fn_12cf58(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib uses raw_vec_handle_error
declare function fn_12e0b0(a: u64, b: u64): u64 // lib
declare function fn_12e558(a: u64, b: u64, c: u64, r0: u64): u64 // lib
declare function Mint_unpack_from_slice_133108(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <spl_token::state::Mint as solana_program_pack::Pack>::unpack_from_slice
declare function rent_check_id_133890(a: u64): u64 // lib solana_sdk_ids::sysvar::rent::check_id
declare function rent_check_id_136a18(a: u64): u64 // lib solana_sdk_ids::sysvar::rent::check_id
declare function fn_1390d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcmp, AccountInfo_try_borrow_lamports, AccountInfo_try_borrow_data
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b3a8(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error, memcpy
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
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
declare function fn_14a698(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses callx
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

// instruction handler: initialize_pool_v2 (discriminator sha256("global:initialize_pool_v2")[..8] = 0x43cc3f1bf2572dcf)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, token_mint_a, token_mint_b, token_badge_a, token_badge_b, token_vault_a, fee_tier, rent, whirlpool, funder, token_program_a, token_program_b, token_vault_b, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
function ix_initialize_pool_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s188 = fp - 0x188, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s328 = fp - 0x328, s338 = fp - 0x338, s340 = fp - 0x340, s350 = fp - 0x350, s353 = fp - 0x353, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s1000 = fp - 0x1000
	let l, m: u64
	sol_log("Instruction: InitializePoolV2", 0x1d)
	const f = ix_args_len
	if (f >= 2 && f - 2 >= 0x10) {
		const g = ix_args
		const r = ld16(g)
		const s = ld64(g + 0xa)
		const q = ld64(g + 2)
		st8(s353 + 2, 0xff)
		st16(s353, 0xffff)
		st64(s350, accounts, accounts_len)
		st64(s1000, f, s353)
		m = accounts_initialize_pool_v2(s1a0, program_id, s350, g, fp)
		const h = ld32(s1a0)
		if (h == 2) {
			l = ld64(s1a0 + 8)
			st64(a + 8, ld64(s190))
			st64(a, l)
			return m
		}
		const p = ld32(s1a0 + 4)
		const o = ld64(s1a0 + 8)
		const n = ld64(s190)
		memcpy(s328, s188, 0x188)
		st64(s338, o, n)
		st32(s340, h, p)
		st16(s188 + 8, ld16(s353))
		st8(s188 + 0xa, ld8(s353 + 2))
		copyr(s190, s350, 0x10)
		st64(s1a0, program_id, s340)
		m = fn_3bd20(s368, s1a0, r, q, s)
		l = ld64(s368)
		if (l == 2) {
			m = fn_6aa0(s378, ld64(s328 + 0x108), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
			const k = ld64(s378)
			if (k != 2) {
				m = Error_with_account_name(s388, k, ld64(s378 + 8), 0x100152b28 /* "whirlpool" */, 9)
				l = ld64(s388)
				st64(a + 8, ld64(s388 + 8))
				st64(a, l)
				return m
			}
			st64(a + 8, k)
			st64(a, 2)
			return m
		}
		st64(a + 8, ld64(s368 + 8))
		st64(a, l)
		return m
	}
	const i = fn_1459d0(0x100159468)
	if (2 > (i & 3) - 2) {
		m = anchor_error_from(s398, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s398)
		st64(a + 8, ld64(s398 + 8))
		st64(a, l)
		return m
	}
	if ((i & 3) == 0) {
		m = anchor_error_from(s398, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s398)
		st64(a + 8, ld64(s398 + 8))
		st64(a, l)
		return m
	}
	const j = ld64(ld64(i + 7))
	callx(j, ld64(i - 1), j)
	m = anchor_error_from(s398, 0x66 /* anchor::InstructionDidNotDeserialize */)
	l = ld64(s398)
	st64(a + 8, ld64(s398 + 8))
	st64(a, l)
	return m
}

// Anchor Accounts::try_accounts of instruction initialize_pool_v2 (called by ix_initialize_pool_v2; name [str]: from the handler's "Instruction: …" log; was fn_db9d0)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, token_mint_a, token_mint_b, token_badge_a (AccountNotEnoughKeys, ConstraintSeeds), token_badge_b (ConstraintSeeds), token_vault_a (ConstraintMut), fee_tier (ConstraintHasOne, ConstraintRaw), rent, whirlpool (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), funder (ConstraintMut), token_program_a (ConstraintAddress), token_program_b (ConstraintAddress), token_vault_b (ConstraintMut), system_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: token_badge_a, whirlpool
function accounts_initialize_pool_v2(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s80 = fp - 0x80, sd8 = fp - 0xd8, se0 = fp - 0xe0, se8 = fp - 0xe8, sf8 = fp - 0xf8, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s140 = fp - 0x140, s160 = fp - 0x160, s180 = fp - 0x180, s1b0 = fp - 0x1b0, s1b1 = fp - 0x1b1, s1d8 = fp - 0x1d8, s1f0 = fp - 0x1f0, s208 = fp - 0x208, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s238 = fp - 0x238, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2b8 = fp - 0x2b8, s320 = fp - 0x320, s330 = fp - 0x330, s338 = fp - 0x338, s33a = fp - 0x33a, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s598 = fp - 0x598, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s5c8 = fp - 0x5c8, s5d8 = fp - 0x5d8, s5e8 = fp - 0x5e8, s5f8 = fp - 0x5f8, s608 = fp - 0x608, s618 = fp - 0x618, s628 = fp - 0x628, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s690 = fp - 0x690, s6c0 = fp - 0x6c0, s6c8 = fp - 0x6c8, s6d0 = fp - 0x6d0, s6d8 = fp - 0x6d8, s6e0 = fp - 0x6e0, s6e8 = fp - 0x6e8, s6f0 = fp - 0x6f0
	let m, n, r, s, w, x, y, ab: u64
	let token_badge_a: AccountInfo
	let l = a
	st64(s348, b)
	if (2 > ld64(e - 0x1000)) {
		const i = fn_1459d0(0x100159468)
		if (2 > (i & 3) - 2) {
			n = anchor_error_from(s658, 0x66 /* anchor::InstructionDidNotDeserialize */)
			m = ld64(s658)
			st64(l + 0x10, ld64(s658 + 8))
			st64(l + 8, m)
			st32(l, 2)
			return n
		}
		if ((i & 3) == 0) {
			n = anchor_error_from(s658, 0x66 /* anchor::InstructionDidNotDeserialize */)
			m = ld64(s658)
			st64(l + 0x10, ld64(s658 + 8))
			st64(l + 8, m)
			st32(l, 2)
			return n
		}
		const j = ld64(ld64(i + 7))
		callx(j, ld64(i - 1), j)
		n = anchor_error_from(s658, 0x66 /* anchor::InstructionDidNotDeserialize */)
		m = ld64(s658)
		st64(l + 0x10, ld64(s658 + 8))
		st64(l + 8, m)
		st32(l, 2)
		return n
	}
	const g = ld64(e - 0xff8)
	st16(s33a, ld16(d))
	try_accounts_11de0(s100, c, c, d, e)
	if (ld64(s100) == 0) {
		n = Error_with_account_name(s648, ld64(sf8), ld64(sf8 + 8), "whirlpools_config", 0x11)
		m = ld64(s648)
		st64(l + 0x10, ld64(s648 + 8))
		st64(l + 8, m)
		st32(l, 2)
		return n
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	st64(s690 + 0x30, g)
	const h = f != 0 ? sat_sub(f, 0x70) & -8 : 0x300007f90
	if (h > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		memcpy(h, s100, 0x70)
		try_accounts_610(s100, c)
		const k = ld32(s100)
		if (k == 2) {
			n = Error_with_account_name(s638, ld64(sf8), ld64(sf8 + 8), "token_mint_a", 0xc)
			m = ld64(s638)
			st64(l + 0x10, ld64(s638 + 8))
			st64(l + 8, m)
			st32(l, 2)
			return n
		}
		st64(s690 + 0x18, h)
		st64(s690 + 0x28, l)
		st64(s690 + 0x20, ld32(s100 + 4))
		const p = ld64(sf8)
		const o = ld64(sf8 + 8)
		memcpy(s320, se8, 0x68)
		st64(s330, p, o)
		st32(s338 + 4, ld64(s690 + 0x20))
		st32(s338, k)
		try_accounts_610(s100, c)
		const q = ld32(s100)
		if (q == 2) {
			n = Error_with_account_name(s628, ld64(sf8), ld64(sf8 + 8), "token_mint_b", 0xc)
			s = ld64(s628)
			r = ld64(s690 + 0x28)
			st64(r + 0x10, ld64(s628 + 8))
			st64(r + 8, s)
			st32(r, 2)
			return n
		}
		B19: {
			st64(s690 + 0x20, ld32(s100 + 4))
			const u = ld64(sf8)
			const t = ld64(sf8 + 8)
			memcpy(s2a0, se8, 0x68)
			st64(s2b0, u, t)
			st32(s2b8 + 4, ld64(s690 + 0x20))
			st32(s2b8, q)
			const v = ld64(c + 8)
			if (v != 0) {
				token_badge_a = ld64(c)
				st64(c, token_badge_a + 0x30, v - 1)
				l = ld64(s690 + 0x28)
				if (v != 1) {
					st64(c + 8, v - 2)
					ab = ld64(c)
					st64(c, ab + 0x30)
					break B19
				}
			} else {
				anchor_error_from(s358, 0xbbd /* anchor::AccountNotEnoughKeys */, w, x, y)
				token_badge_a = ld64(s358 + 8)
				const z = ld64(s358)
				l = ld64(s690 + 0x28)
				if (z != 2) {
					n = Error_with_account_name(s368, z, token_badge_a, "token_badge_a", 0xd)
					m = ld64(s368)
					st64(l + 0x10, ld64(s368 + 8))
					st64(l + 8, m)
					st32(l, 2)
					return n
				}
			}
			anchor_error_from(s378, 0xbbd /* anchor::AccountNotEnoughKeys */, w, x, y)
			ab = ld64(s378 + 8)
			const aa = ld64(s378)
			if (aa != 2) {
				n = Error_with_account_name(s388, aa, ab, "token_badge_b", 0xd)
				m = ld64(s388)
				st64(l + 0x10, ld64(s388 + 8))
				st64(l + 8, m)
				st32(l, 2)
				return n
			}
		}
		try_accounts_11718(s100, c, w, x, y)
		const ae = ld64(sf8)
		const ad = ld64(s100)
		if (ad == 2) {
			st64(s238, ae)
			const af = ld64(c + 8)
			if (af == 0) {
				n = anchor_error_from(s618, 0xbbd /* anchor::AccountNotEnoughKeys */, ae)
				m = ld64(s618)
				st64(l + 0x10, ld64(s618 + 8))
				st64(l + 8, m)
				st32(l, 2)
				return n
			}
			const ag: AccountInfo = ld64(c)
			st64(s230, ag)
			st64(c + 8, af - 1)
			st64(c, ag + 0x30)
			try_accounts_11718(s100, c, ae)
			const ai = ld64(sf8)
			const ah = ld64(s100)
			if (ah != 2) {
				n = Error_with_account_name(s3a8, ah, ai, "token_vault_a", 0xd)
				m = ld64(s3a8)
				st64(l + 0x10, ld64(s3a8 + 8))
				st64(l + 8, m)
				st32(l, 2)
				return n
			}
			st64(s690 + 0x20, ai)
			try_accounts_11718(s100, c, ai)
			const ak = ld64(sf8)
			const aj = ld64(s100)
			if (aj == 2) {
				st64(s690 + 0x10, ak)
				try_accounts_12008(s100, c, ak)
				const an = ld64(sf8 + 8)
				const am = ld64(sf8)
				const al = ld64(s100)
				if (al == 0) {
					n = Error_with_account_name(s608, am, an, "fee_tier", 8)
					m = ld64(s608)
					st64(l + 0x10, ld64(s608 + 8))
					st64(l + 8, m)
					st32(l, 2)
					return n
				}
				st64(s6c0 + 0x20, al)
				st64(s690, am, an)
				copyr(s220, se8, 0x10)
				st32(s230 + 8, ld32(sd8 + 2))
				st16(s230 + 0xc, ld16(sd8 + 6))
				st64(s6c0 + 0x28, ld16(sd8))
				try_accounts_120(s100, c, an)
				const ap = ld64(sf8)
				const ao = ld64(s100)
				if (ao == 2) {
					st64(s6c0 + 0x18, ap)
					try_accounts_120(s100, c, ap)
					const ar = ld64(sf8)
					const aq = ld64(s100)
					if (aq == 2) {
						st64(s6c0 + 0x10, ar)
						fn_122e8(s100, c, ar)
						const au = ld64(sf8)
						const at = ld64(s100)
						if (at == 2) {
							st64(s210, au)
							try_accounts_11990(s100, c, au)
							const ax = ld64(sf8 + 8)
							const aw = ld64(sf8)
							const av = ld64(s100)
							if (av == 0) {
								n = Error_with_account_name(s5f8, aw, ax, 0x100152d60 /* "rent" */, 4)
								m = ld64(s5f8)
								st64(l + 0x10, ld64(s5f8 + 8))
								st64(l + 8, m)
								st32(l, 2)
								return n
							}
							st64(s6c0, aw, ax)
							st64(s6c8, ld64(se8))
							rent_get(s100)
							copy(s1f0, sf8, 0x18)
							if (ld64(s100) == 0) {
								st64(s6d0, ab)
								copyr(s208, s1f0, 0x18)
								const ay = ld64(ld64(ld64(s690 + 0x18)))
								copyr(s160, ay, 0x20)
								const az = ld64(ld64(s320 + 0x40))
								copy(s140, az, 0x20)
								const ba = ld64(ld64(s2a0 + 0x40))
								copy(s120, ba, 0x20)
								st16(s180, ld16(s33a))
								st64(s100, 0x100152b28, 9, s160, 0x20, s140, 0x20, s120, 0x20, s180, 2)
								// PDA find_program_address(["whirlpool", *ay, *az, *ba, u16 ld16(s33a) [ix data?]], program *(ld64(s348)))
								Pubkey_find_program_address(s1b0, s100, 5, ld64(s348))
								copyr(s1d8, s1b0, 0x20)
								const bb = ld8(s1b0 + 0x20)
								st8(s1b1, bb)
								st8(ld64(s690 + 0x30) + 2, bb)
								const bc = ld64(ld64(s230))
								copy(s100, bc, 0x20)
								if ((memcmp(s100, s1d8, 0x20) as u32) == 0) {
									st64(sd8, s338, s2b8, s33a, s1b1, s348)
									st64(se0, ld64(s690 + 0x18))
									st64(s100, s230, s208, s238, s210)
									n = fn_de388(s1b0, s100)
									st64(s6d8, ld64(s1b0 + 8))
									const bk = ld64(s1b0)
									if (bk == 2) {
										const whirlpool: AccountInfo = ld64(ld64(s6d8))
										if (whirlpool.is_writable == 0) {
											anchor_error_from(s5d8, 0x7d0 /* anchor::ConstraintMut */)
											n = Error_with_account_name(s5e8, ld64(s5d8), ld64(s5d8 + 8), 0x100152b28 /* "whirlpool" */, 9)
											s = ld64(s5e8)
											r = ld64(s690 + 0x28)
											st64(r + 0x10, ld64(s5e8 + 8))
											st64(r + 8, s)
											st32(r, 2)
											return n
										}
										AccountInfo_clone(s1b0, whirlpool)
										st64(s6e0, fn_143100(s1b0))
										AccountInfo_clone(s100, ld64(ld64(s6d8)))
										AccountInfo_try_data_len(s120, s100)
										const bn = ld64(s120 + 8)
										const bm = ld64(s120)
										if (bm != 0x800000000000001a /* Ok */) {
											st64(s110, ld64(s110))
											st64(s120, bm, bn)
											n = fn_13b430(s438, s120)
											const cb = ld64(s438)
											const ca = ld64(s690 + 0x28)
											st64(ca + 0x10, ld64(s438 + 8))
											st64(ca + 8, cb)
											st32(ca, 2)
											const cd = ld64(sf8 + 8)
											const cc = ld64(sf8)
											rc_dec(cc)
											rc_dec(cd)
											const cf = ld64(s1b0 + 0x10)
											const ce = ld64(s1b0 + 8)
											rc_dec(ce)
											if (!rc_release(cf)) {
												return n
											}
											st64(cf + 8, ld64(cf + 8) - 1)
											return n
										}
										const bo = __floatundidf(ld64(s208) * (bn + 0x80))
										const bp = fn_14f7f8(ld64(s208 + 8), bo)
										st64(s6e8, 0)
										st64(s6f0, fn_151cb0(bp, 0))
										const bq = fn_14f3e8(bp)
										if ((ld64(s6f0) as i64) >= 0) {
											st64(s6e8, bq)
										}
										const br = fn_151a40(bp, 0x43efffffffffffff)
										let by = -1
										if (0 >= (br as i64)) {
											by = ld64(s6e8)
										}
										const bt = ld64(sf8 + 8)
										const bs = ld64(sf8)
										rc_dec(bs)
										rc_dec(bt)
										const bw = ld64(s1b0 + 0x10)
										const bu = ld64(s1b0 + 8)
										let bv = ld64(bu) - 1
										st64(bu, bv)
										if (bv == 0) {
											bv = ld64(bu + 8) - 1
											st64(bu + 8, bv)
										}
										let bx = ld64(bw) - 1
										st64(bw, bx)
										if (bx == 0) {
											bx = ld64(bw + 8) - 1
											st64(bw + 8, bx)
										}
										if (by > ld64(s6e0)) {
											anchor_error_from(s5b8, 0x7d5 /* anchor::ConstraintRentExempt */, bx, bv)
											n = Error_with_account_name(s5c8, ld64(s5b8), ld64(s5b8 + 8), 0x100152b28 /* "whirlpool" */, 9)
											s = ld64(s5c8)
											r = ld64(s690 + 0x28)
											st64(r + 0x10, ld64(s5c8 + 8))
											st64(r + 8, s)
											st32(r, 2)
											return n
										}
										const cg = ld64(ld64(ld64(s690 + 0x18)))
										copyr(s140, cg, 0x20)
										const ch = ld64(ld64(s320 + 0x40))
										const cl = ld64(ch + 0x18)
										const ck = ld64(ch + 0x10)
										const cj = ld64(ch + 8)
										const ci = ld64(ch)
										st64(s120, ci, cj, ck, cl, 0x100154db3, 0xb, s140, 0x20, s120, 0x20)
										// PDA find_program_address(["token_badge", *cg, *s120], program *(ld64(s348)))
										Pubkey_find_program_address(s1b0, s100, 3, ld64(s348))
										copyr(s180, s1b0, 0x20)
										st8(ld64(s690 + 0x30), ld8(s1b0 + 0x20))
										const cm = token_badge_a.key
										copyr(s100, cm, 0x20)
										if ((memcmp(s100, s180, 0x20) as u32) != 0) {
											anchor_error_from(s448, 0x7d6 /* anchor::ConstraintSeeds */)
											const cz = Error_with_account_name(s458, ld64(s448), ld64(s448 + 8), "token_badge_a", 0xd)
											const cy = ld64(s458 + 8)
											const cx = ld64(s458)
											copyr(s100, cm, 0x20)
											copy(se0, s180, 0x20)
											n = fn_13b5c0(s468, cx, cy, s100, cz)
											s = ld64(s468)
											r = ld64(s690 + 0x28)
											st64(r + 0x10, ld64(s468 + 8))
											st64(r + 8, s)
											st32(r, 2)
											return n
										}
										const cn = ld64(ld64(ld64(s690 + 0x18)))
										copyr(s140, cn, 0x20)
										const co = ld64(ld64(s2a0 + 0x40))
										const cs = ld64(co + 0x18)
										const cr = ld64(co + 0x10)
										const cq = ld64(co + 8)
										const cp = ld64(co)
										st64(s120, cp, cq, cr, cs, 0x100154db3, 0xb, s140, 0x20, s120, 0x20)
										// PDA find_program_address(["token_badge", *cn, *s120], program *(ld64(s348)))
										Pubkey_find_program_address(s1b0, s100, 3, ld64(s348))
										copyr(s160, s1b0, 0x20)
										st8(ld64(s690 + 0x30) + 1, ld8(s1b0 + 0x20))
										const ct = ld64(ld64(s6d0))
										copyr(s100, ct, 0x20)
										if ((memcmp(s100, s160, 0x20) as u32) == 0) {
											if (ld8(ld64(s238) + 0x29) == 0) {
												anchor_error_from(s598, 0x7d0 /* anchor::ConstraintMut */)
												n = Error_with_account_name(s5a8, ld64(s598), ld64(s598 + 8), "funder", 6)
												s = ld64(s5a8)
												r = ld64(s690 + 0x28)
												st64(r + 0x10, ld64(s5a8 + 8))
												st64(r + 8, s)
												st32(r, 2)
												return n
											}
											if (ld8(ld64(s690 + 0x20) + 0x29) == 0) {
												anchor_error_from(s578, 0x7d0 /* anchor::ConstraintMut */)
												n = Error_with_account_name(s588, ld64(s578), ld64(s578 + 8), "token_vault_a", 0xd)
												s = ld64(s588)
												r = ld64(s690 + 0x28)
												st64(r + 0x10, ld64(s588 + 8))
												st64(r + 8, s)
												st32(r, 2)
												return n
											}
											if (ld8(ld64(s690 + 0x10) + 0x29) != 0) {
												copyr(s120, s690, 0x10)
												copy(s110, s220, 0x10)
												const da = ld64(ld64(ld64(s690 + 0x18)))
												copyr(s1b0, da, 0x20)
												if ((memcmp(s120, s1b0, 0x20) as u32) != 0) {
													anchor_error_from(s4a8, 0x7d1 /* anchor::ConstraintHasOne */)
													const dp = Error_with_account_name(s4b8, ld64(s4a8), ld64(s4a8 + 8), "fee_tier", 8)
													const dn = ld64(s4b8 + 8)
													const dm = ld64(s4b8)
													copyr(s100, s120, 0x20)
													copy(se0, s1b0, 0x20)
													n = fn_13b5c0(s4c8, dm, dn, s100, dp)
													s = ld64(s4c8)
													r = ld64(s690 + 0x28)
													st64(r + 0x10, ld64(s4c8 + 8))
													st64(r + 8, s)
													st32(r, 2)
													return n
												}
												if (ld64(s6c0 + 0x28) == ld16(s33a)) {
													const db = ld64(ld64(s6c0 + 0x18))
													copyr(s120, db, 0x20)
													AccountInfo_clone(s100, ld64(s320 + 0x40))
													const dc = ld64(se8)
													copy(s1b0, dc, 0x20)
													const de = ld64(sf8 + 8)
													const dd = ld64(sf8)
													rc_dec(dd)
													rc_dec(de)
													if ((memcmp(s120, s1b0, 0x20) as u32) != 0) {
														anchor_error_from(s4f8, 0x7dc /* anchor::ConstraintAddress */)
														const ds = Error_with_account_name(s508, ld64(s4f8), ld64(s4f8 + 8), "token_program_a", 0xf)
														const dr = ld64(s508 + 8)
														const dq = ld64(s508)
														copyr(s100, s120, 0x20)
														copy(se0, s1b0, 0x20)
														n = fn_13b5c0(s518, dq, dr, s100, ds)
														s = ld64(s518)
														r = ld64(s690 + 0x28)
														st64(r + 0x10, ld64(s518 + 8))
														st64(r + 8, s)
														st32(r, 2)
														return n
													}
													const df = ld64(ld64(s6c0 + 0x10))
													copyr(s120, df, 0x20)
													AccountInfo_clone(s100, ld64(s2a0 + 0x40))
													const dg = ld64(se8)
													copy(s1b0, dg, 0x20)
													const di = ld64(sf8 + 8)
													const dh = ld64(sf8)
													rc_dec(dh)
													rc_dec(di)
													if ((memcmp(s120, s1b0, 0x20) as u32) == 0) {
														st64(s6e0, s100)
														memcpy(s100, s338, 0x80)
														memcpy(s80, s2b8, 0x80)
														st64(s690 + 0x30, ld64(s238))
														const du = ld64(s210)
														const dt = ld64(s690 + 0x28)
														st64(dt + 0x158, ld64(s220 + 8))
														st64(dt + 0x150, ld64(s220))
														st32(dt + 0x162, ld32(s230 + 8))
														st16(dt + 0x166, ld16(s230 + 0xc))
														n = memcpy(dt, ld64(s6e0), 0x100)
														st64(dt + 0x198, ld64(s6c8))
														st64(dt + 0x190, ld64(s6c0 + 8))
														st64(dt + 0x188, ld64(s6c0))
														st64(dt + 0x180, av)
														st64(dt + 0x178, du)
														st64(dt + 0x170, ld64(s6c0 + 0x10))
														st64(dt + 0x168, ld64(s6c0 + 0x18))
														st16(dt + 0x160, ld64(s6c0 + 0x28))
														st64(dt + 0x148, ld64(s690 + 8))
														st64(dt + 0x140, ld64(s690))
														st64(dt + 0x138, ld64(s6c0 + 0x20))
														st64(dt + 0x130, ld64(s690 + 0x10))
														st64(dt + 0x128, ld64(s690 + 0x20))
														st64(dt + 0x120, ld64(s6d8))
														st64(dt + 0x118, ld64(s690 + 0x30))
														st64(dt + 0x110, ld64(s6d0))
														st64(dt + 0x108, token_badge_a)
														st64(dt + 0x100, ld64(s690 + 0x18))
														return n
													}
													anchor_error_from(s528, 0x7dc /* anchor::ConstraintAddress */)
													const dl = Error_with_account_name(s538, ld64(s528), ld64(s528 + 8), "token_program_b", 0xf)
													const dk = ld64(s538 + 8)
													const dj = ld64(s538)
													copyr(s100, s120, 0x20)
													copy(se0, s1b0, 0x20)
													n = fn_13b5c0(s548, dj, dk, s100, dl)
													s = ld64(s548)
													r = ld64(s690 + 0x28)
													st64(r + 0x10, ld64(s548 + 8))
													st64(r + 8, s)
													st32(r, 2)
													return n
												}
												anchor_error_from(s4d8, 0x7d3 /* anchor::ConstraintRaw */)
												n = Error_with_account_name(s4e8, ld64(s4d8), ld64(s4d8 + 8), "fee_tier", 8)
												s = ld64(s4e8)
												r = ld64(s690 + 0x28)
												st64(r + 0x10, ld64(s4e8 + 8))
												st64(r + 8, s)
												st32(r, 2)
												return n
											}
											anchor_error_from(s558, 0x7d0 /* anchor::ConstraintMut */)
											n = Error_with_account_name(s568, ld64(s558), ld64(s558 + 8), "token_vault_b", 0xd)
											s = ld64(s568)
											r = ld64(s690 + 0x28)
											st64(r + 0x10, ld64(s568 + 8))
											st64(r + 8, s)
											st32(r, 2)
											return n
										}
										anchor_error_from(s478, 0x7d6 /* anchor::ConstraintSeeds */)
										const cw = Error_with_account_name(s488, ld64(s478), ld64(s478 + 8), "token_badge_b", 0xd)
										const cv = ld64(s488 + 8)
										const cu = ld64(s488)
										copyr(s100, ct, 0x20)
										copy(se0, s160, 0x20)
										n = fn_13b5c0(s498, cu, cv, s100, cw)
										s = ld64(s498)
										r = ld64(s690 + 0x28)
										st64(r + 0x10, ld64(s498 + 8))
										st64(r + 8, s)
										st32(r, 2)
										return n
									}
									const bz = ld64(s690 + 0x28)
									st64(bz + 0x10, ld64(s6d8))
									st64(bz + 8, bk)
									st32(bz, 2)
									return n
								}
								anchor_error_from(s408, 0x7d6 /* anchor::ConstraintSeeds */)
								Error_with_account_name(s418, ld64(s408), ld64(s408 + 8), 0x100152b28 /* "whirlpool" */, 9)
								const bj = ld64(s418 + 8)
								const bi = ld64(s418)
								const bd = ld64(ld64(s230))
								const bh = ld64(bd + 0x18)
								const bg = ld64(bd + 0x10)
								const bf = ld64(bd + 8)
								const be = ld64(bd)
								copy(se0, s1d8, 0x20)
								st64(s100, be, bf, bg, bh)
								n = fn_13b5c0(s428, bi, bj, s100, bf)
								s = ld64(s428)
								r = ld64(s690 + 0x28)
								st64(r + 0x10, ld64(s428 + 8))
								st64(r + 8, s)
								st32(r, 2)
								return n
							}
							n = fn_13b430(s3f8, s1f0)
							m = ld64(s3f8)
							st64(l + 0x10, ld64(s3f8 + 8))
							st64(l + 8, m)
							st32(l, 2)
							return n
						}
						n = Error_with_account_name(s3e8, at, au, "system_program", 0xe)
						m = ld64(s3e8)
						st64(l + 0x10, ld64(s3e8 + 8))
						st64(l + 8, m)
						st32(l, 2)
						return n
					}
					n = Error_with_account_name(s3d8, aq, ar, "token_program_b", 0xf)
					m = ld64(s3d8)
					st64(l + 0x10, ld64(s3d8 + 8))
					st64(l + 8, m)
					st32(l, 2)
					return n
				}
				n = Error_with_account_name(s3c8, ao, ap, "token_program_a", 0xf)
				m = ld64(s3c8)
				st64(l + 0x10, ld64(s3c8 + 8))
				st64(l + 8, m)
				st32(l, 2)
				return n
			}
			n = Error_with_account_name(s3b8, aj, ak, "token_vault_b", 0xd)
			m = ld64(s3b8)
			st64(l + 0x10, ld64(s3b8 + 8))
			st64(l + 8, m)
			st32(l, 2)
			return n
		}
		n = Error_with_account_name(s398, ad, ae, "funder", 6)
		m = ld64(s398)
		st64(l + 0x10, ld64(s398 + 8))
		st64(l + 8, m)
		st32(l, 2)
		return n
	}
	alloc_handle_alloc_error(8, 0x70)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: e (value), d (value), c (value)
// types [heur]: b: InitializePoolV2Context (the handler ix_initialize_pool_v2 passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_3bd20(a: u64, b: InitializePoolV2Context, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s16 = fp - 0x16, s28 = fp - 0x28, s48 = fp - 0x48, s68 = fp - 0x68, s88 = fp - 0x88, sa8 = fp - 0xa8, sc0 = fp - 0xc0, sc8 = fp - 0xc8, sd0 = fp - 0xd0, se8 = fp - 0xe8, s100 = fp - 0x100, s108 = fp - 0x108, s128 = fp - 0x128, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1000 = fp - 0x1000
	let m, y: u64
	const accounts: InitializePoolV2Accounts = b.accounts
	const g = ld64(ld64(accounts + 0x58))
	copyr(s148, g, 0x20)
	const h = ld64(ld64(accounts + 0xd8))
	copyr(s128, h, 0x20)
	const bb = ld8(b + 0x22)
	const ba = ld16(accounts + 0x162)
	const i = ld64(ld64(ld64(accounts + 0x100)))
	copyr(s108, i, 0x20)
	copyr(se8, g, 0x20)
	let n = fn_81d00(s10, s108, se8, accounts + 0x108)
	let j = ld64(s10)
	if (j != 2) {
		st64(a + 8, ld64(s10 + 8))
		st64(a, j)
		return n
	}
	n = fn_80ca8(se8, accounts, ld8(s10 + 8))
	j = ld64(se8)
	if (j == 2) {
		if (ld8(se8 + 8) == 0) {
			n = fn_87630(s158, 0x2f)
			m = ld64(s158 + 8)
			j = ld64(s158)
			if (j != 2) {
				st64(a + 8, m)
				st64(a, j)
				return n
			}
		}
		const k = ld64(ld64(ld64(accounts + 0x100)))
		copyr(s108, k, 0x20)
		const l = ld64(ld64(accounts + 0xd8))
		copyr(se8, l, 0x20)
		n = fn_81d00(s10, s108, se8, accounts + 0x110)
		j = ld64(s10)
		if (j != 2) {
			st64(a + 8, ld64(s10 + 8))
			st64(a, j)
			return n
		}
		n = fn_80ca8(se8, accounts + 0x80, ld8(s10 + 8))
		j = ld64(se8)
		if (j == 2) {
			if (ld8(se8 + 8) == 0) {
				n = fn_87630(s168, 0x2f)
				m = ld64(s168 + 8)
				j = ld64(s168)
				if (j != 2) {
					st64(a + 8, m)
					st64(a, j)
					return n
				}
			}
			const o: AccountInfo = ld64(accounts + 0x58)
			const p: LamportsCell = o.lamports
			const r = ld64(accounts + 0x120)
			let az = o.key
			rc_inc(p)
			const q: DataCell = o.data
			let ay = r
			rc_inc(q)
			let ax = o.owner
			const u = o.rent_epoch
			const t = o.is_signer
			const s = o.is_writable
			st8(sc0 + 2, o.executable)
			st8(sc0, t, s)
			st64(sd0, ax, u)
			ax = q
			st64(se8, az, p, q)
			st64(s1000 + 8, ld64(accounts + 0x168))
			az = accounts + 0x178
			st64(s1000 + 0x10, accounts + 0x178)
			st64(s1000, accounts + 0x118)
			n = fn_78f88(s178, ay, accounts + 0x128, se8, accounts + 0x118, ld64(s1000 + 8), accounts + 0x178)
			j = ld64(s178)
			if (j != 2) {
				m = ld64(s178 + 8)
				rc_dec(p)
				y = ax
				if (!rc_release(ax)) {
					st64(a + 8, m)
					st64(a, j)
					return n
				}
				st64(y + 8, ld64(y + 8) - 1)
				st64(a + 8, m)
				st64(a, j)
				return n
			}
			rc_dec(p)
			const v = ax
			if (rc_release(ax)) {
				st64(v + 8, ld64(v + 8) - 1)
			}
			const w: AccountInfo = ld64(accounts + 0xd8)
			const x: LamportsCell = w.lamports
			const aa = ld64(accounts + 0x120)
			const z = w.key
			rc_inc(x)
			ax = z
			ay = aa
			const ab: DataCell = w.data
			rc_inc(ab)
			let aw = w.owner
			const ae = w.rent_epoch
			const ad = w.is_signer
			const ac = w.is_writable
			st8(sc0 + 2, w.executable)
			st8(sc0, ad, ac)
			st64(sd0, aw, ae)
			aw = ab
			st64(se8, ax, x, ab)
			st64(s1000 + 8, ld64(accounts + 0x170))
			st64(s1000 + 0x10, az)
			st64(s1000, accounts + 0x118)
			n = fn_78f88(s188, ay, accounts + 0x130, se8, accounts + 0x118, ld64(s1000 + 8), az)
			j = ld64(s188)
			if (j == 2) {
				rc_dec(x)
				const af = aw
				if (rc_release(aw)) {
					st64(af + 8, ld64(af + 8) - 1)
				}
				const ag = ld64(ld64(ld64(accounts + 0x100)))
				copyr(se8, ag, 0x20)
				n = fn_82008(s108, accounts + 0x108, se8, accounts)
				j = ld64(s108)
				if (j == 2) {
					let ak = ld8(s100)
					const ah = ld64(ld64(ld64(accounts + 0x100)))
					copyr(se8, ah, 0x20)
					n = fn_82008(s108, accounts + 0x110, se8, accounts + 0x80)
					j = ld64(s108)
					if (j == 2) {
						ak = ld8(s100) != 0 ? 1 : ak
						const am = ld64(accounts + 0x100)
						const al = ld64(accounts + 0x120)
						const ai = accounts.token_vault_a.key
						copyr(s108, ai, 0x20)
						const aj = accounts.token_vault_b.key
						copyr(se8, aj, 0x20)
						st64(s1000, bb, c, d, e, ba, s148, s108, s128, se8, ak as u8)
						n = fn_5db48(s198, al + 8, am, c, bb, c, d, e, ba, s148, s108, s128, se8, ak as u8)
						j = ld64(s198)
						if (j == 2) {
							const an = ld64(ld64(ld64(accounts + 0x120)))
							copyr(se8, an, 0x20)
							const ao = ld64(ld64(ld64(accounts + 0x100)))
							copyr(sc8, ao, 0x20)
							const ap = ld64(ld64(accounts + 0x58))
							copyr(sa8, ap, 0x20)
							const aq = ld64(ld64(accounts + 0xd8))
							copyr(s88, aq, 0x20)
							const ar = ld64(ld64(accounts + 0x168))
							copyr(s68, ar, 0x20)
							const at = ld64(ld64(accounts + 0x170))
							copyr(s48, at, 0x20)
							const av = ld8(accounts + 0x30)
							const au = ld8(accounts + 0xb0)
							st64(s28, d, e)
							st8(s16, av, au)
							st16(s28 + 0x10, c)
							fn_88db0(s108, se8)
							copyr(s10, s100, 0x10)
							n = log_data(s10, 1)
							st64(a + 8, undef)
							st64(a, 2)
							return n
						}
						st64(a + 8, ld64(s198 + 8))
						st64(a, j)
						return n
					}
					st64(a + 8, ld64(s100))
					st64(a, j)
					return n
				}
				st64(a + 8, ld64(s100))
				st64(a, j)
				return n
			}
			m = ld64(s188 + 8)
			rc_dec(x)
			y = aw
			if (!rc_release(aw)) {
				st64(a + 8, m)
				st64(a, j)
				return n
			}
			st64(y + 8, ld64(y + 8) - 1)
			st64(a + 8, m)
			st64(a, j)
			return n
		}
		st64(a + 8, ld64(se8 + 8))
		st64(a, j)
		return n
	}
	st64(a + 8, ld64(se8 + 8))
	st64(a, j)
	return n
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
function fn_de388(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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
				st64(s4d0, 0x100154d7a)
				st32(s458 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s488, 2)
				st32(s4d0 + 0x10, 0xd)
				st64(s4d0 + 8, 0x39)
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

function fn_81d00(a: u64, b: u64, c: u64, d: u64): u64 {
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

function fn_80ca8(a: u64, b: u64, c: u64): u64 {
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

function fn_82008(a: u64, b: u64, c: u64, d: u64): u64 {
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

function fn_88db0(a: u64, b: u64) {
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

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: TokenBadge
function fn_105168(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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

function fn_afd0(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (value), e (value)
function fn_14c690(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c698(a, b, c, d, e)
}

function fn_ec20(a: u64, b: u64, r0: u64): u64 {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (value), e (value)
function fn_14c5c0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c5c8(a, b, c, d, e)
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

function fn_105440(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
function memset(a: u64, b: u64, c: u64) {
	sol_memset(a, b as u8, c)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (value), d (value), e (value)
function fn_14c698(a: u64, b: u64, c: u64, d: u64, e: u64): never {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (value), d (value), e (value)
function fn_14c5c8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
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

function fn_14ef78(a: u64, b: u64): u64 {
	return fn_14ecd0(ld8(a), 1, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (points to it), d (value), e (value)
function fn_147e78(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_1478b8(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	custom_panic(a, b, c, d, e)
	abort()
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_14c4f8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
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

// not included (size budget), see shared.ts:
declare function anchor_dispatch(a: u64, program_id: u64, accounts: u64, accounts_len: u64, p5: u64, p6: u64)
declare function fn_501e0(a: u64, b: u64, r0: u64): u64
