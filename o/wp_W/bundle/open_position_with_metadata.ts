// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction open_position_with_metadata: handler + 52 reachable functions
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
interface OpenPositionWithMetadataAccounts { // Accounts struct of instruction open_position_with_metadata as accounts_open_position_with_metadata returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	funder: at<0x60, ref<AccountInfo>>
}
interface OpenPositionWithMetadataContext { // anchor_lang Context of instruction open_position_with_metadata (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<OpenPositionWithMetadataAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_log_data(slices: u64, len: u64): void // log base64 data: slices = &[&[u8]]
declare function sol_invoke_signed_rust(ix: u64, accountInfos: u64, accountInfosLen: u64, signerSeeds: u64, signerSeedsLen: u64): u64 // CPI (Rust ABI: &Instruction, &[AccountInfo], &[&[&[u8]]])
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function Account_try_from(a: u64, b: u64): void // lib anchor_lang::accounts::account::Account<T>::try_from
declare function Account_try_from_unchecked(a: u64, b: u64): void // lib anchor_lang::accounts::account::Account<T>::try_from_unchecked
declare function ptr_drop_in_place_c1b0(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 4]>
declare function fn_fa00(a: u64, b: u64): u64 // lib
declare function AccountInfo_clone(a: u64, b: u64): void // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11990(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11a48(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_122e8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp
declare function fn_12510(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from, memcmp
declare function fn_129a0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from, memcmp
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function ptr_drop_in_place_126088(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<alloc::vec::Vec<solana_account_info::AccountInfo>>
declare function fn_126340(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses raw_vec_handle_error
declare function fn_1264b0(a: u64, b: u64): void // lib uses raw_vec_handle_error
declare function associated_token_create(a: u64, b: u64): u64 // lib anchor_spl::associated_token::create
declare function fn_127828(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcpy, ptr_drop_in_place_126088
declare function fn_12adb8(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses raw_vec_handle_error
declare function fn_12af00(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses raw_vec_handle_error
declare function fn_12b068(a: u64, b: u64): void // lib uses raw_vec_handle_error
declare function CollectionDetails_serialize(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <mpl_token_metadata::generated::types::collection_details::CollectionDetails as borsh::ser…
declare function DataV2_serialize(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <mpl_token_metadata::generated::types::data_v2::DataV2 as borsh::ser::BorshSerialize>::ser…
declare function fn_133a38(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses raw_vec_handle_error
declare function fn_133b80(a: u64, b: u64): void // lib uses raw_vec_handle_error
declare function fn_1390d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcmp, AccountInfo_try_borrow_lamports, AccountInfo_try_borrow_data
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function fn_13ac38(a: u64, b: u64): void // lib uses __rust_alloc, alloc_handle_alloc_error, abort
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b3a8(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error, memcpy
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function fn_13c8b8(a: u64, b: u64, c: u64): u64 // lib uses memcpy, __rust_alloc, alloc_handle_alloc_error, ptr_drop_in_place_139960
declare function fn_13cc48(a: u64, b: u64, c: u64): u64 // lib uses memcpy, __rust_alloc, alloc_handle_alloc_error, ptr_drop_in_place_139960
declare function fn_13cfd8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcpy, __rust_alloc, alloc_handle_alloc_error, ptr_drop_in_place_1397a0, …
declare function fn_13d318(a: u64, b: u64, c: u64): u64 // lib uses memcpy, __rust_alloc, alloc_handle_alloc_error, ptr_drop_in_place_1397a0, …
declare function ErrorCode_name(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib anchor_lang::error::ErrorCode::name
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function ErrorCode_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::error::ErrorCode as core::fmt::Display>::fmt
declare function rent_get(a: u64): u64 // lib solana_sysvar::rent::<impl solana_sysvar::Sysvar for solana_rent::Rent>::get
declare function fn_142e70(a: u64, b: u64, c: u64, d: u64): void // lib uses __rust_alloc, alloc_handle_alloc_error
declare function AccountInfo_try_data_len(a: u64, b: u64): void // lib solana_account_info::AccountInfo::try_data_len
declare function AccountInfo_try_borrow_lamports(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_lamports
declare function fn_143340(a: u64, b: u64, r0: u64): u64 // lib
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_144198(a: u64, b: u64, r0: u64): u64 // lib uses __rust_alloc, raw_vec_handle_error
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function fn_1459d0(a: u64): u64 // lib uses repr_bitpacked_kind_from_prim_145358, callx
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fn_14a698(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses callx
declare function Formatter_write_str(a: u64, b: u64, c: u64): u64 // lib core::fmt::Formatter::write_str
declare function str_fmt(a: u64, b: u64, c: u64): u64 // lib <str as core::fmt::Display>::fmt
declare function fn_14c760(a: u64, b: u64, c: u64, r7: u64): void // lib
declare function fn_14ecd0(a: u64, b: u64, c: u64): u64 // lib "0001020304050607080910111213141516171819…", "0001020304050607080910111213141516171819…"
declare function fn_14f3e8(a: u64): u64 // lib
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function __floatundidf(a: u64): u64 // lib __floatundidf
declare function __lshrti3(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib __lshrti3
declare function fn_14f808(a: u64, b: u64): u64 // lib uses __multi3
declare function __multi3(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __multi3 [heur] u128 multiply: *out = a * b (mod 2^128), a = (a_lo, a_hi), b = (b_lo, b_hi) [exec: on 31 operand pairs]
declare function fn_151a40(a: u64, b: u64): u64 // lib
declare function fn_151bf8(a: u64, b: u64): u64 // lib
declare function fn_151cb0(a: u64, b: u64): u64 // lib
declare function __ashlti3(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib __ashlti3

// instruction handler: open_position_with_metadata (discriminator sha256("global:open_position_with_metadata")[..8] = 0x3c0e6e3a30861df2)
// accounts [str: the program's account-error strings, in order of first use]: funder, whirlpool, rent, metadata_update_auth, position, position_mint, position_token_account, token_program, position_metadata_account, metadata_program, associated_token_program, system_program, owner
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
function ix_open_position_with_metadata(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const sc0 = fp - 0xc0, sc8 = fp - 0xc8, sd8 = fp - 0xd8, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1c1 = fp - 0x1c1, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s1000 = fp - 0x1000
	let k, l: u64
	sol_log("Instruction: OpenPositionWithMetadata", 0x25)
	const f = ix_args_len
	if (f >= 6 && f - 6 >= 4) {
		const g = ix_args
		const m = ld32(g + 2)
		const q = ld32(g + 6)
		st8(s1c1, 0xff)
		st64(s1c0, accounts, accounts_len)
		st64(s1000 + 8, s1c1)
		l = accounts_open_position_with_metadata(sd8, program_id, s1c0, undef, fp)
		const h = ld32(sd8)
		if (h == 2) {
			k = ld64(sd8 + 8)
			st64(a + 8, ld64(sc8))
			st64(a, k)
			return l
		}
		const p = ld32(sd8 + 4)
		const o = ld64(sd8 + 8)
		const n = ld64(sc8)
		memcpy(s198, sc0, 0xc0)
		st64(s1a8, o, n)
		st32(s1b0, h, p)
		st8(sc0 + 8, ld8(s1c1))
		copyr(sc8, s1c0, 0x10)
		st64(sd8, program_id, s1b0)
		st64(s1000, m, q)
		l = fn_347f8(s1d8, sd8, undef, undef, m, q)
		k = ld64(s1d8)
		if (k == 2) {
			l = fn_c2790(s1e8, s1b0, program_id)
			k = ld64(s1e8)
			st64(a + 8, ld64(s1e8 + 8))
			st64(a, k)
			return l
		}
		st64(a + 8, ld64(s1d8 + 8))
		st64(a, k)
		return l
	}
	const i = fn_1459d0(0x100159468)
	if (2 > (i & 3) - 2) {
		l = anchor_error_from(s1f8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s1f8)
		st64(a + 8, ld64(s1f8 + 8))
		st64(a, k)
		return l
	}
	if ((i & 3) == 0) {
		l = anchor_error_from(s1f8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s1f8)
		st64(a + 8, ld64(s1f8 + 8))
		st64(a, k)
		return l
	}
	const j = ld64(ld64(i + 7))
	callx(j, ld64(i - 1), j)
	l = anchor_error_from(s1f8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	k = ld64(s1f8)
	st64(a + 8, ld64(s1f8 + 8))
	st64(a, k)
	return l
}

// Anchor Accounts::try_accounts of instruction open_position_with_metadata (called by ix_open_position_with_metadata; name [str]: from the handler's "Instruction: …" log; was fn_bcae8)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: funder (ConstraintMut), whirlpool, rent, metadata_update_auth (AccountNotEnoughKeys, ConstraintAddress), position (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), position_mint (ConstraintMut, ConstraintSigner, ConstraintRentExempt), position_token_account (ConstraintMut, ConstraintRentExempt), token_program (ConstraintAddress), position_metadata_account (AccountNotEnoughKeys, ConstraintMut), metadata_program, associated_token_program, system_program, owner (AccountNotEnoughKeys)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_metadata_account, position, position_mint, position_token_account, funder
function accounts_open_position_with_metadata(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s268 = fp - 0x268, s270 = fp - 0x270, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s2a8 = fp - 0x2a8, s2d8 = fp - 0x2d8, s320 = fp - 0x320, s338 = fp - 0x338, s350 = fp - 0x350, s368 = fp - 0x368, s369 = fp - 0x369, s390 = fp - 0x390, s3a8 = fp - 0x3a8, s3c0 = fp - 0x3c0, s3c8 = fp - 0x3c8, s3d0 = fp - 0x3d0, s3d8 = fp - 0x3d8, s3e0 = fp - 0x3e0, s3e8 = fp - 0x3e8, s3f0 = fp - 0x3f0, s3f8 = fp - 0x3f8, s400 = fp - 0x400, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s598 = fp - 0x598, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s5c8 = fp - 0x5c8, s5d8 = fp - 0x5d8, s5e8 = fp - 0x5e8, s5f8 = fp - 0x5f8, s608 = fp - 0x608, s618 = fp - 0x618, s628 = fp - 0x628, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s668 = fp - 0x668, s678 = fp - 0x678, s688 = fp - 0x688, s698 = fp - 0x698, s6a8 = fp - 0x6a8, s6b8 = fp - 0x6b8, s6c8 = fp - 0x6c8, s6d8 = fp - 0x6d8, s6e8 = fp - 0x6e8, s6f8 = fp - 0x6f8, s708 = fp - 0x708, s718 = fp - 0x718, s740 = fp - 0x740, s748 = fp - 0x748, s750 = fp - 0x750, s758 = fp - 0x758, s760 = fp - 0x760, s768 = fp - 0x768, s770 = fp - 0x770, s778 = fp - 0x778
	let i, j, m, p, q, t, ai, bs: u64
	st64(s408, b)
	try_accounts_11718(s290, c, c, d, e)
	const g = ld64(s288)
	const f = ld64(s290)
	if (f != 2) {
		q = Error_with_account_name(s418, f, g, "funder", 6)
		p = ld64(s418)
		st64(a + 0x10, ld64(s418 + 8))
		st64(a + 8, p)
		st32(a, 2)
		return q
	}
	const aq = ld64(e - 0xff8)
	st64(s400, g)
	const h = ld64(c + 8)
	if (h != 0) {
		const l: AccountInfo = ld64(c)
		st64(c, l + 0x30)
		m = h - 1
		st64(c + 8, m)
		st64(s3f8, l)
		if (m == 0) {
			q = anchor_error_from(s718, 0xbbd /* anchor::AccountNotEnoughKeys */, m, i, j)
			p = ld64(s718)
			st64(a + 0x10, ld64(s718 + 8))
			st64(a + 8, p)
			st32(a, 2)
			return q
		}
		const position_metadata_account: AccountInfo = ld64(c)
		st64(s3f0, position_metadata_account)
		st64(c + 8, h - 2)
		st64(c, position_metadata_account + 0x30)
		if (h != 2) {
			st64(s3e8, position_metadata_account + 0x30)
			st64(c + 8, h - 3)
			let r = position_metadata_account + 0x60
			st64(c, r)
			if (h != 3) {
				t = h - 4
				st64(c + 8, t)
				st64(c, position_metadata_account + 0x90)
				if (t == 0) {
					q = anchor_error_from(s6d8, 0xbbd /* anchor::AccountNotEnoughKeys */, t, r, j)
					p = ld64(s6d8)
					st64(a + 0x10, ld64(s6d8 + 8))
					st64(a + 8, p)
					st32(a, 2)
					return q
				}
				st64(s740 + 0x20, r)
				st64(s3e0, position_metadata_account + 0x90)
				st64(c + 8, h - 5)
				st64(c, position_metadata_account + 0xc0)
				try_accounts_11a48(s290, c, t, r, j)
				if (ld64(s290) == 0) {
					q = Error_with_account_name(s6a8, ld64(s288), ld64(s288 + 8), 0x100152b28 /* "whirlpool" */, 9)
					p = ld64(s6a8)
					st64(a + 0x10, ld64(s6a8 + 8))
					st64(a + 8, p)
					st32(a, 2)
					return q
				}
				const u = ld64(0x300000000 /* heap bump-allocator cursor */)
				const v = u != 0 ? sat_sub(u, 0x290) & -8 : 0x300007d70
				if (v > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, v)
					st64(s740 + 0x18, v)
					memcpy(v, s290, 0x290)
					fn_129a0(s290, c)
					const x = ld64(s288)
					const w = ld64(s290)
					if (w == 2) {
						st64(s3d8, x)
						fn_122e8(s290, c, x)
						const z = ld64(s288)
						const y = ld64(s290)
						if (y == 2) {
							st64(s3d0, z)
							try_accounts_11990(s290, c, z)
							const ac = ld64(s288 + 8)
							const ab = ld64(s288)
							const aa = ld64(s290)
							if (aa == 0) {
								q = Error_with_account_name(s698, ab, ac, 0x100152d60 /* "rent" */, 4)
								p = ld64(s698)
								st64(a + 0x10, ld64(s698 + 8))
								st64(a + 8, p)
								st32(a, 2)
								return q
							}
							st64(s740, aa, ab, ac)
							st64(s748, ld64(s278))
							fn_12510(s290, c, ac)
							const ae = ld64(s288)
							const ad = ld64(s290)
							if (ad == 2) {
								st64(s3c8, ae)
								fn_12e30(s290, c, ae)
								const ag = ld64(s288)
								const af = ld64(s290)
								if (af == 2) {
									st64(s750, ag)
									const ah = ld64(c + 8)
									if (ah == 0) {
										anchor_error_from(s468, 0xbbd /* anchor::AccountNotEnoughKeys */, ag)
										ai = ld64(s468 + 8)
										const aj = ld64(s468)
										if (aj != 2) {
											q = Error_with_account_name(s478, aj, ai, "metadata_update_auth", 0x14)
											p = ld64(s478)
											st64(a + 0x10, ld64(s478 + 8))
											st64(a + 8, p)
											st32(a, 2)
											return q
										}
									} else {
										st64(c + 8, ah - 1)
										ai = ld64(c)
										st64(c, ai + 0x30)
									}
									st64(s758, ai)
									rent_get(s290)
									copy(s3a8, s288, 0x18)
									if (ld64(s290) == 0) {
										copyr(s3c0, s3a8, 0x18)
										const ak = ld64(ld64(s3e8))
										const ao = ld64(ak + 0x18)
										const an = ld64(ak + 0x10)
										const am = ld64(ak + 8)
										const al = ld64(ak)
										st64(s2d8, 0x100151f20)
										st64(s2d8 + 0x10, s338)
										st64(s338, al, am, an, ao)
										st64(s2d8 + 8, 8)
										st64(s2d8 + 0x18, 0x20)
										// PDA find_program_address(["position", *s338], program *(ld64(s408)))
										Pubkey_find_program_address(s290, s2d8, 2, ld64(s408))
										copyr(s390, s290, 0x20)
										const ap = ld8(s270)
										st8(s369, ap)
										st8(aq, ap)
										const ar = ld64(ld64(s3f0))
										copy(s290, ar, 0x20)
										if ((memcmp(s290, s390, 0x20) as u32) == 0) {
											st64(s268, s369, s408)
											st64(s270, ld64(s3e8))
											st64(s290, s3f0, s3c0, s400, s3d0)
											q = fn_bf220(s338, s290)
											const o = ld64(s338 + 8)
											p = ld64(s338)
											if (p == 2) {
												st64(s760, o)
												const position: AccountInfo = ld64(o)
												if (position.is_writable == 0) {
													anchor_error_from(s678, 0x7d0 /* anchor::ConstraintMut */)
													q = Error_with_account_name(s688, ld64(s678), ld64(s678 + 8), "position", 8)
													p = ld64(s688)
													st64(a + 0x10, ld64(s688 + 8))
													st64(a + 8, p)
													st32(a, 2)
													return q
												}
												AccountInfo_clone(s338, position)
												st64(s768, fn_143100(s338))
												AccountInfo_clone(s290, ld64(ld64(s760)))
												AccountInfo_try_data_len(s2d8, s290)
												const bc = ld64(s2d8 + 8)
												const bb = ld64(s2d8)
												if (bb != 0x800000000000001a /* Ok */) {
													st64(s2d8 + 0x10, ld64(s2d8 + 0x10))
													st64(s2d8, bb, bc)
													q = fn_13b430(s4c8, s2d8)
													const bo = ld64(s4c8)
													st64(a + 0x10, ld64(s4c8 + 8))
													st64(a + 8, bo)
													st32(a, 2)
													const bq = ld64(s288 + 8)
													const bp = ld64(s288)
													rc_dec(bp)
													rc_dec(bq)
													bs = ld64(s338 + 0x10)
													const br = ld64(s338 + 8)
													rc_dec(br)
													if (!rc_release(bs)) {
														return q
													}
													st64(bs + 8, ld64(bs + 8) - 1)
													return q
												}
												const bd = __floatundidf(ld64(s3c0) * (bc + 0x80))
												const be = fn_14f7f8(ld64(s3c0 + 8), bd)
												st64(s770, fn_151cb0(be, 0))
												const bf = fn_14f3e8(be)
												const bg = 0 > (ld64(s770) as i64) ? 0 : bf
												const bn = (fn_151a40(be, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : bg
												const bi = ld64(s288 + 8)
												const bh = ld64(s288)
												rc_dec(bh)
												rc_dec(bi)
												const bl = ld64(s338 + 0x10)
												const bj = ld64(s338 + 8)
												let bk = ld64(bj) - 1
												st64(bj, bk)
												if (bk == 0) {
													bk = ld64(bj + 8) - 1
													st64(bj + 8, bk)
												}
												let bm = ld64(bl) - 1
												st64(bl, bm)
												if (bm == 0) {
													bm = ld64(bl + 8) - 1
													st64(bl + 8, bm)
												}
												if (bn > ld64(s768)) {
													anchor_error_from(s658, 0x7d5 /* anchor::ConstraintRentExempt */, bm, bk)
													q = Error_with_account_name(s668, ld64(s658), ld64(s658 + 8), "position", 8)
													p = ld64(s668)
													st64(a + 0x10, ld64(s668 + 8))
													st64(a + 8, p)
													st32(a, 2)
													return q
												}
												rent_get(s290)
												copy(s350, s288, 0x18)
												if (ld64(s290) != 0) {
													q = fn_13b430(s4d8, s350)
													p = ld64(s4d8)
													st64(a + 0x10, ld64(s4d8 + 8))
													st64(a + 8, p)
													st32(a, 2)
													return q
												}
												copyr(s368, s350, 0x18)
												st64(s2d8 + 0x28, ld64(s740 + 0x18))
												st64(s2d8, s3e8, s368, s400, s3d0, s3d8)
												q = fn_c0cc0(s290, s2d8)
												const bt = ld32(s290)
												if (bt == 2) {
													p = ld64(s288)
													st64(a + 0x10, ld64(s288 + 8))
													st64(a + 8, p)
													st32(a, 2)
													return q
												}
												st64(s768, ld32(s290 + 4))
												st64(s770, ld64(s288))
												const bu = ld64(s288 + 8)
												memcpy(s320, s278, 0x48)
												st64(s338 + 0x10, bu)
												st64(s338 + 8, ld64(s770))
												st32(s338 + 4, ld64(s768))
												st32(s338, bt)
												const position_mint: AccountInfo = ld64(s320 + 0x40)
												if (position_mint.is_writable == 0) {
													anchor_error_from(s638, 0x7d0 /* anchor::ConstraintMut */)
													q = Error_with_account_name(s648, ld64(s638), ld64(s638 + 8), "position_mint", 0xd)
													p = ld64(s648)
													st64(a + 0x10, ld64(s648 + 8))
													st64(a + 8, p)
													st32(a, 2)
													return q
												}
												if (position_mint.is_signer == 0) {
													anchor_error_from(s618, 0x7d2 /* anchor::ConstraintSigner */)
													q = Error_with_account_name(s628, ld64(s618), ld64(s618 + 8), "position_mint", 0xd)
													p = ld64(s628)
													st64(a + 0x10, ld64(s628 + 8))
													st64(a + 8, p)
													st32(a, 2)
													return q
												}
												AccountInfo_clone(s2d8, position_mint)
												st64(s768, fn_143100(s2d8))
												AccountInfo_clone(s290, ld64(s320 + 0x40))
												AccountInfo_try_data_len(s2a8, s290)
												const bx = ld64(s2a8 + 8)
												const bw = ld64(s2a8)
												if (bw != 0x800000000000001a /* Ok */) {
													st64(s2a8 + 0x10, ld64(s2a8 + 0x10))
													st64(s2a8, bw, bx)
													q = fn_13b430(s4e8, s2a8)
													const cj = ld64(s4e8)
													st64(a + 0x10, ld64(s4e8 + 8))
													st64(a + 8, cj)
													st32(a, 2)
													const cl = ld64(s288 + 8)
													const ck = ld64(s288)
													rc_dec(ck)
													rc_dec(cl)
													bs = ld64(s2d8 + 0x10)
													const cm = ld64(s2d8 + 8)
													rc_dec(cm)
													if (!rc_release(bs)) {
														return q
													}
													st64(bs + 8, ld64(bs + 8) - 1)
													return q
												}
												const by = __floatundidf(ld64(s368) * (bx + 0x80))
												const bz = fn_14f7f8(ld64(s368 + 8), by)
												st64(s770, fn_151cb0(bz, 0))
												const ca = fn_14f3e8(bz)
												const cb = 0 > (ld64(s770) as i64) ? 0 : ca
												const ci = (fn_151a40(bz, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : cb
												const cd = ld64(s288 + 8)
												const cc = ld64(s288)
												rc_dec(cc)
												rc_dec(cd)
												const cg = ld64(s2d8 + 0x10)
												const ce = ld64(s2d8 + 8)
												let cf = ld64(ce) - 1
												st64(ce, cf)
												if (cf == 0) {
													cf = ld64(ce + 8) - 1
													st64(ce + 8, cf)
												}
												let ch = ld64(cg) - 1
												st64(cg, ch)
												if (ch == 0) {
													ch = ld64(cg + 8) - 1
													st64(cg + 8, ch)
												}
												if (ci > ld64(s768)) {
													anchor_error_from(s5f8, 0x7d5 /* anchor::ConstraintRentExempt */, ch, cf)
													q = Error_with_account_name(s608, ld64(s5f8), ld64(s5f8 + 8), "position_mint", 0xd)
													p = ld64(s608)
													st64(a + 0x10, ld64(s608 + 8))
													st64(a + 8, p)
													st32(a, 2)
													return q
												}
												rent_get(s290)
												const cs = ld64(s288 + 8)
												const cr = ld64(s288)
												if (ld64(s290) != 0) {
													st32(s2d8, ld32(s278 + 1))
													st32(s2d8 + 3, ld32(s278 + 4))
													const dd = ld8(s278)
													st32(s288 + 0xc, ld32(s2d8 + 3))
													st32(s288 + 9, ld32(s2d8))
													st8(s288 + 8, dd)
													st64(s290, cr, cs)
													q = fn_13b430(s4f8, s290)
													p = ld64(s4f8)
													st64(a + 0x10, ld64(s4f8 + 8))
													st64(a + 8, p)
													st32(a, 2)
													return q
												}
												st64(s290, s3e0, s3c8, s400, s3f8, s338, s3d0, s3d8)
												q = fn_bba20(s2d8, s290)
												st64(s768, ld64(s2d8 + 8))
												p = ld64(s2d8)
												if (p == 2) {
													const position_token_account: AccountInfo = ld64(ld64(s768))
													if (position_token_account.is_writable == 0) {
														anchor_error_from(s5d8, 0x7d0 /* anchor::ConstraintMut */)
														q = Error_with_account_name(s5e8, ld64(s5d8), ld64(s5d8 + 8), "position_token_account", 0x16)
														p = ld64(s5e8)
														st64(a + 0x10, ld64(s5e8 + 8))
														st64(a + 8, p)
														st32(a, 2)
														return q
													}
													st64(s770, s2d8)
													AccountInfo_clone(s2d8, position_token_account)
													st64(s778, fn_143100(ld64(s770)))
													const co = ld64(ld64(s768))
													st64(s770, s290)
													AccountInfo_clone(s290, co)
													AccountInfo_try_data_len(s2a8, ld64(s770))
													const cq = ld64(s2a8 + 8)
													const cp = ld64(s2a8)
													if (cp != 0x800000000000001a /* Ok */) {
														st64(s2a8 + 0x10, ld64(s2a8 + 0x10))
														st64(s2a8, cp, cq)
														q = fn_13b430(s508, s2a8)
														const de = ld64(s508)
														st64(a + 0x10, ld64(s508 + 8))
														st64(a + 8, de)
														st32(a, 2)
														const dg = ld64(s288 + 8)
														const df = ld64(s288)
														rc_dec(df)
														rc_dec(dg)
														bs = ld64(s2d8 + 0x10)
														const dh = ld64(s2d8 + 8)
														rc_dec(dh)
														if (!rc_release(bs)) {
															return q
														}
														st64(bs + 8, ld64(bs + 8) - 1)
														return q
													}
													const ct = fn_14f7f8(cs, __floatundidf((cq + 0x80) * cr))
													st64(s770, fn_151cb0(ct, 0))
													const cu = fn_14f3e8(ct)
													const cv = 0 > (ld64(s770) as i64) ? 0 : cu
													const dc = (fn_151a40(ct, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : cv
													const cx = ld64(s288 + 8)
													const cw = ld64(s288)
													rc_dec(cw)
													rc_dec(cx)
													const da = ld64(s2d8 + 0x10)
													const cy = ld64(s2d8 + 8)
													let cz = ld64(cy) - 1
													st64(cy, cz)
													if (cz == 0) {
														cz = ld64(cy + 8) - 1
														st64(cy + 8, cz)
													}
													let db = ld64(da) - 1
													st64(da, db)
													if (db == 0) {
														db = ld64(da + 8) - 1
														st64(da + 8, db)
													}
													if (dc > ld64(s778)) {
														anchor_error_from(s5b8, 0x7d5 /* anchor::ConstraintRentExempt */, db, cz)
														q = Error_with_account_name(s5c8, ld64(s5b8), ld64(s5b8 + 8), "position_token_account", 0x16)
														p = ld64(s5c8)
														st64(a + 0x10, ld64(s5c8 + 8))
														st64(a + 8, p)
														st32(a, 2)
														return q
													}
													const funder: AccountInfo = ld64(s400)
													if (funder.is_writable != 0) {
														if (position_metadata_account[2].is_writable != 0) {
															const dj = ld64(s3d8)
															const dk = ld64(dj)
															copy(s2d8, dk, 0x20)
															if ((memcmp(s2d8, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
																anchor_error_from(s518, 0x7dc /* anchor::ConstraintAddress */)
																const ds = Error_with_account_name(s528, ld64(s518), ld64(s518 + 8), "token_program", 0xd)
																const dr = ld64(s528 + 8)
																const dq = ld64(s528)
																copyr(s290, s2d8, 0x20)
																st64(s270, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
																q = fn_13b5c0(s538, dq, dr, s290, ds)
																p = ld64(s538)
																st64(a + 0x10, ld64(s538 + 8))
																st64(a + 8, p)
																st32(a, 2)
																return q
															}
															const dl = ld64(ld64(s758))
															copyr(s2d8, dl, 0x20)
															if ((memcmp(s2d8, 0x100152dd0 /* key 3axbTs2z5GBy6usVbNVoqEgZMng3vZvMnAoX29BFfwhr */, 0x20) as u32) == 0) {
																const du: AccountInfo = ld64(s3f8)
																q = memcpy(a, s338, 0x60)
																const dt = ld64(s3c8)
																st64(a + 0x98, ld64(s3d0))
																st64(a + 0xd0, ld64(s758))
																st64(a + 0xc8, ld64(s750))
																st64(a + 0xc0, dt)
																st64(a + 0xb8, ld64(s748))
																st64(a + 0xb0, ld64(s740 + 0x10))
																st64(a + 0xa8, ld64(s740 + 8))
																st64(a + 0xa0, ld64(s740))
																st64(a + 0x90, dj)
																st64(a + 0x88, ld64(s740 + 0x18))
																st64(a + 0x80, ld64(s768))
																st64(a + 0x78, ld64(s740 + 0x20))
																st64(a + 0x70, ld64(s760))
																st64(a + 0x68, du)
																st64(a + 0x60, funder)
																return q
															}
															anchor_error_from(s548, 0x7dc /* anchor::ConstraintAddress */)
															const dp = Error_with_account_name(s558, ld64(s548), ld64(s548 + 8), "metadata_update_auth", 0x14)
															const dn = ld64(s558 + 8)
															const dm = ld64(s558)
															copyr(s290, s2d8, 0x20)
															st64(s270, 0xf0e597ddae666a26, 0x3999c6e408d67144, 0x93d0cdb3999d7ad7, 0x69d20a916bfe8911) // key 3axbTs2z5GBy6usVbNVoqEgZMng3vZvMnAoX29BFfwhr
															q = fn_13b5c0(s568, dm, dn, s290, dp)
															p = ld64(s568)
															st64(a + 0x10, ld64(s568 + 8))
															st64(a + 8, p)
															st32(a, 2)
															return q
														}
														anchor_error_from(s578, 0x7d0 /* anchor::ConstraintMut */, db, cz)
														q = Error_with_account_name(s588, ld64(s578), ld64(s578 + 8), "position_metadata_account", 0x19)
														p = ld64(s588)
														st64(a + 0x10, ld64(s588 + 8))
														st64(a + 8, p)
														st32(a, 2)
														return q
													}
													anchor_error_from(s598, 0x7d0 /* anchor::ConstraintMut */, db, cz)
													q = Error_with_account_name(s5a8, ld64(s598), ld64(s598 + 8), "funder", 6)
													p = ld64(s5a8)
													st64(a + 0x10, ld64(s5a8 + 8))
													st64(a + 8, p)
													st32(a, 2)
													return q
												}
												st64(a + 0x10, ld64(s768))
												st64(a + 8, p)
												st32(a, 2)
												return q
											}
											st64(a + 0x10, o)
											st64(a + 8, p)
											st32(a, 2)
											return q
										}
										anchor_error_from(s498, 0x7d6 /* anchor::ConstraintSeeds */)
										Error_with_account_name(s4a8, ld64(s498), ld64(s498 + 8), "position", 8)
										const az = ld64(s4a8 + 8)
										const ay = ld64(s4a8)
										const at = ld64(ld64(s3f0))
										const ax = ld64(at + 0x18)
										const aw = ld64(at + 0x10)
										const av = ld64(at + 8)
										const au = ld64(at)
										copy(s270, s390, 0x20)
										st64(s290, au, av, aw, ax)
										q = fn_13b5c0(s4b8, ay, az, s290, av)
										p = ld64(s4b8)
										st64(a + 0x10, ld64(s4b8 + 8))
										st64(a + 8, p)
										st32(a, 2)
										return q
									}
									q = fn_13b430(s488, s3a8)
									p = ld64(s488)
									st64(a + 0x10, ld64(s488 + 8))
									st64(a + 8, p)
									st32(a, 2)
									return q
								}
								q = Error_with_account_name(s458, af, ag, "metadata_program", 0x10)
								p = ld64(s458)
								st64(a + 0x10, ld64(s458 + 8))
								st64(a + 8, p)
								st32(a, 2)
								return q
							}
							q = Error_with_account_name(s448, ad, ae, "associated_token_program", 0x18)
							p = ld64(s448)
							st64(a + 0x10, ld64(s448 + 8))
							st64(a + 8, p)
							st32(a, 2)
							return q
						}
						q = Error_with_account_name(s438, y, z, "system_program", 0xe)
						p = ld64(s438)
						st64(a + 0x10, ld64(s438 + 8))
						st64(a + 8, p)
						st32(a, 2)
						return q
					}
					q = Error_with_account_name(s428, w, x, "token_program", 0xd)
					p = ld64(s428)
					st64(a + 0x10, ld64(s428 + 8))
					st64(a + 8, p)
					st32(a, 2)
					return q
				}
				alloc_handle_alloc_error(8, 0x290)
			}
			anchor_error_from(s6b8, 0xbbd /* anchor::AccountNotEnoughKeys */, h - 2, r, j)
			t = undef
			r = undef
			const s = ld64(s6b8)
			if (s == 2) {
				q = anchor_error_from(s6d8, 0xbbd /* anchor::AccountNotEnoughKeys */, t, r, j)
				p = ld64(s6d8)
				st64(a + 0x10, ld64(s6d8 + 8))
				st64(a + 8, p)
				st32(a, 2)
				return q
			}
			q = Error_with_account_name(s6c8, s, ld64(s6b8 + 8), "position_metadata_account", 0x19)
			p = ld64(s6c8)
			st64(a + 0x10, ld64(s6c8 + 8))
			st64(a + 8, p)
			st32(a, 2)
			return q
		}
		q = anchor_error_from(s6e8, 0xbbd /* anchor::AccountNotEnoughKeys */, h - 2, i, j)
		p = ld64(s6e8)
		st64(a + 0x10, ld64(s6e8 + 8))
		st64(a + 8, p)
		st32(a, 2)
		return q
	}
	anchor_error_from(s6f8, 0xbbd /* anchor::AccountNotEnoughKeys */, g, i, j)
	m = undef
	const k = ld64(s6f8)
	if (k == 2) {
		q = anchor_error_from(s718, 0xbbd /* anchor::AccountNotEnoughKeys */, m, i, j)
		p = ld64(s718)
		st64(a + 0x10, ld64(s718 + 8))
		st64(a + 8, p)
		st32(a, 2)
		return q
	}
	q = Error_with_account_name(s708, k, ld64(s6f8 + 8), 0x100154aba /* "owner" */, 5)
	p = ld64(s708)
	st64(a + 0x10, ld64(s708 + 8))
	st64(a + 8, p)
	st32(a, 2)
	return q
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: p5 (value), p6 (value)
// types [heur]: b: OpenPositionWithMetadataContext (the handler ix_open_position_with_metadata passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_347f8(a: u64, b: OpenPositionWithMetadataContext, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc0 = fp - 0xc0, s1000 = fp - 0x1000
	let j, t, z, aj, ak: u64
	st64(sb0 + 0x18, a)
	const accounts: OpenPositionWithMetadataAccounts = b.accounts
	const g = ld64(accounts + 0x88)
	const h = memcmp(g + 0x148, 0x100152180, 0x20)
	const n = p6
	const m = p5
	if ((h as u32) == 0 && (ld16(g + 0xc8) & 1) != 0) {
		ak = fn_87630(s90, 0x43)
		j = ld64(s90)
		aj = ld64(sb0 + 0x18)
		st64(aj + 8, ld64(s90 + 8))
		st64(aj, j)
		return ak
	}
	const i = ld64(accounts + 0x70)
	st64(sb0 + 0x10, accounts + 0x98)
	ak = fn_4c1a0(s60, accounts + 0x60, i, accounts + 0x98)
	j = ld64(s60)
	if (j == 2) {
		const k = ld64(accounts + 0x88)
		const o = ld16(k + 0x284)
		const l = ld64(k + 0x240)
		st64(s1000, ld64(k + 0x238))
		st64(s1000 + 8, l)
		ak = fn_60930(s40, m, n, o, ld64(s1000), l)
		j = ld64(s40)
		if (j == 2) {
			B18: {
				const r = ld32(s38)
				const q = ld32(s38 + 4)
				st64(sb8, ld64(accounts + 0x88))
				z = ld64(accounts + 0x70)
				const p = ld64(ld64(accounts + 0x58))
				copyr(s40, p, 0x20)
				t = 0xa
				st64(sb0, q as i32, r as i32)
				if ((((r as i32) - 0x6c4f5) as u32) >= 0xfff27617) {
					const s = ld16(ld64(sb8) + 0x284)
					if (s == 0) {
						fn_14e1c0(0x100159f48, s, r as i32, q as i32, 0xa)
					}
					const u = ld64(sb0 + 8)
					st64(sc0, s)
					const v = fn_151bf8(u, s)
					t = 0xa
					if (((ld64(sb0) - 0x6c4f5) as u32) >= 0xfff27617 && (v as u32) == 0) {
						const w = ld64(sb0)
						const x = fn_151bf8(w, ld64(sc0))
						t = 0xa
						if ((w as i64) > (ld64(sb0 + 8) as i64) && (x as u32) == 0) {
							if ((ld64(sc0) as i16) > -1) {
								break B18
							}
							t = 0x36
							const y = 0x6c4f4 % ld64(sc0)
							if (y - 0x6c4f4 == ld64(sb0 + 8) && 0x6c4f4 - y == ld64(sb0)) {
								break B18
							}
						}
					}
				}
				ak = fn_87630(s70, t)
				t = undef
				j = ld64(s70)
				if (j != 2) {
					aj = ld64(sb0 + 0x18)
					st64(aj + 8, ld64(s70 + 8))
					st64(aj, j)
					return ak
				}
			}
			const aa = ld64(ld64(ld64(sb8)))
			st64(z + 0x20, ld64(aa + 0x18))
			st64(z + 0x18, ld64(aa + 0x10))
			st64(z + 0x10, ld64(aa + 8))
			st64(z + 8, ld64(aa))
			copy(z + 0x30, s38, 0x18)
			const ab = ld64(s40)
			st32(z + 0xd0, ld64(sb0 + 8))
			st32(z + 0xd4, ld64(sb0))
			st64(z + 0x28, ab)
			const ac = ld64(ld64(ld64(accounts + 0x88)))
			copyr(s40, ac, 0x20)
			const ad = ld64(ld64(ld64(accounts + 0x70)))
			copyr(s20, ad, 0x20)
			const ae = ld64(0x300000000 /* heap bump-allocator cursor */)
			const af = ae != 0 ? sat_sub(ae, 0x100) : 0x300007f00
			if (af > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, af)
				st64(af, 0x79657593e6f3afed /* event:PositionOpened */)
				copy(af + 8, s40, 0x40)
				st32(af + 0x4c, ld64(sb0))
				st32(af + 0x48, ld64(sb0 + 8))
				st64(s50, af, 0x50)
				log_data(s50, 1)
				const ai = ld64(accounts + 0x70)
				const ah = ld64(accounts + 0x88)
				const ag = ld64(accounts + 0x80)
				st64(s1000 + 0x30, ld64(sb0 + 0x10))
				st64(s1000 + 0x38, accounts + 0xa0)
				st64(s1000, ag, accounts + 0x78, accounts + 0xd0, accounts + 0x60, accounts + 0xc8, accounts + 0x90)
				ak = fn_67020(s80, ah, ai, accounts, ag, accounts + 0x78, accounts + 0xd0, accounts + 0x60, accounts + 0xc8, accounts + 0x90, ld64(s1000 + 0x30), accounts + 0xa0)
				j = ld64(s80)
				aj = ld64(sb0 + 0x18)
				st64(aj + 8, ld64(s80 + 8))
				st64(aj, j)
				return ak
			}
			raw_vec_handle_error(1, 0x100, sat_sub(ae, 0x100), 0x100 > ae, t)
		}
		aj = ld64(sb0 + 0x18)
		st64(aj + 8, ld64(s38))
		st64(aj, j)
		return ak
	}
	aj = ld64(sb0 + 0x18)
	st64(aj + 8, ld64(s60 + 8))
	st64(aj, j)
	return ak
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position, position_mint, position_token_account
function fn_c2790(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78
	let n, p: u64
	fn_5a40(s28, ld64(b + 0x70), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const f = ld64(s28)
	if (f != 2) {
		n = Error_with_account_name(s38, f, ld64(s28 + 8), "position", 8)
		p = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, p)
		return n
	}
	const g = ld64(b + 0x58)
	if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
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
					n = Error_with_account_name(s58, l, ld64(s48 + 8), "position_mint", 0xd)
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
	const q = ld64(ld64(b + 0x80))
	const m = memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20)
	let o = undef
	n = m as u32
	if (n != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return n
	}
	n = common_is_closed(q)
	o = undef
	if (n != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return n
	}
	n = fn_143448(s18, q, n)
	o = ld64(s18 + 0x10)
	const r = ld64(s18)
	if (r != 0x800000000000001a /* Ok */) {
		const s = ld64(s18 + 8)
		st64(s18, r, s, o)
		n = fn_13b430(s68, s18)
		o = undef
		const t = ld64(s68)
		if (t == 2) {
			st64(a + 8, o)
			st64(a, 2)
			return n
		}
		n = Error_with_account_name(s78, t, ld64(s68 + 8), "position_token_account", 0x16)
		p = ld64(s78)
		st64(a + 8, ld64(s78 + 8))
		st64(a, p)
		return n
	}
	st64(o, ld64(o) + 1)
	st64(a + 8, o)
	st64(a, 2)
	return n
}

function fn_12e30(a: u64, b: u64, c: u64, d: u64, e: u64) {
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

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position
function fn_bf220(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s118 = fp - 0x118, s119 = fp - 0x119, s140 = fp - 0x140, s150 = fp - 0x150, s178 = fp - 0x178, s1b8 = fp - 0x1b8, s1d8 = fp - 0x1d8, s1f8 = fp - 0x1f8, s210 = fp - 0x210, s248 = fp - 0x248, s258 = fp - 0x258, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s2a8 = fp - 0x2a8, s2b0 = fp - 0x2b0, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s390 = fp - 0x390, s398 = fp - 0x398, s3c8 = fp - 0x3c8, s3d0 = fp - 0x3d0, s3d8 = fp - 0x3d8, s3e0 = fp - 0x3e0
	let aw, dc, dd, de: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s348, f, b)
	if (g != 0) {
		const p = ld64(ld64(b + 0x10))
		st64(s390 + 0x30, p)
		const q = ld64(p)
		copyr(s38, q + 8, 0x18)
		st64(s390 + 0x38, q)
		st64(s40, ld64(q))
		const r = ld64(f)
		copyr(s2c8, r, 0x20)
		if ((memcmp(s40, s2c8, 0x20) as u32) == 0) {
			ErrorCode_name(s210, 0x100152d40)
			st64(s140, 0, 1, 0)
			st64(s20, s140, 0x100159480)
			st8(s20 + 0x18, 3)
			st64(s20 + 0x10, 0x20)
			st64(s38 + 8, 0)
			st64(s40, 0)
			if (ErrorCode_fmt(0x100152d40, s40) == 0) {
				copyr(s290, s140, 0x18)
				copy(s2a8, s210, 0x18)
				st64(s2c8 + 8, 0x100154abf)
				st32(s248 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s278, 2)
				st32(s2b0, 0x13)
				st64(s2c8 + 0x10, 0x42)
				st64(s2c8, 0)
				const ba = fn_13b3a8(s308, s2c8)
				const az = ld64(s308 + 8)
				const ay = ld64(s308)
				const ax = ld64(s390 + 0x38)
				copyr(s2c8, ax, 0x20)
				copy(s2a8, r, 0x20)
				de = fn_13b5c0(s318, ay, az, s2c8, ba)
				const bb = ld64(s318)
				st64(a + 8, ld64(s318 + 8))
				st64(a, bb)
				return de
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s2c8, 0x1001594b0, 0x1001594d0)
		}
		st64(s390 + 0x28, r)
		st64(s390 + 0x40, a)
		const s = ld64(b + 8)
		const t = __floatundidf(ld64(s) * 0x158)
		const u = fn_14f7f8(ld64(s + 8), t)
		const v = fn_151cb0(u, 0)
		const w = fn_14f3e8(u)
		const x = max((fn_151a40(u, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (v as i64) ? 0 : w, 1)
		let bd: AccountInfo = ld64(s348)
		let bj = ld64(s348 + 8)
		if (x > g) {
			const y: AccountInfo = ld64(s390 + 0x30)
			const z: LamportsCell = y.lamports
			rc_inc(z)
			const bc: DataCell = y.data
			rc_inc(bc)
			const be: LamportsCell = bd.lamports
			const bf = be.strong
			st64(s390 + 8, bd.key)
			st64(s390 + 0x10, y.executable)
			st64(s390 + 0x18, y.is_writable)
			st64(s390 + 0x20, y.is_signer)
			st64(s390 + 0x28, y.rent_epoch)
			const bi = y.owner
			rc_inc(be, bf)
			const bg: DataCell = bd.data
			const bh = bg.strong
			st64(s390 + 0x30, bi)
			rc_inc(bg, bh)
			const bk: AccountInfo = ld64(ld64(bj + 0x18))
			const bl: LamportsCell = bk.lamports
			const bm = bl.strong
			st64(s390, sat_sub(x, g))
			st64(s3c8 + 0x10, bd.executable)
			st64(s3c8 + 0x18, bd.is_writable)
			st64(s3c8 + 0x20, bd.is_signer)
			st64(s3c8 + 0x28, bd.rent_epoch)
			st64(s398, bd.owner)
			const bp = bk.key
			rc_inc(bl, bm)
			const bn: DataCell = bk.data
			const bo = bn.strong
			st64(s3c8, z, bp)
			rc_inc(bn, bo)
			st64(s3d0, bk.owner)
			const bt = bk.rent_epoch
			const bs = bk.is_signer
			const br = bk.is_writable
			const bq = bk.executable
			st8(s178 + 0x22, ld64(s3c8 + 0x10))
			st8(s178 + 0x21, ld64(s3c8 + 0x18))
			st8(s178 + 0x20, ld64(s3c8 + 0x20))
			st64(s178 + 0x18, ld64(s3c8 + 0x28))
			st64(s178 + 0x10, ld64(s398))
			st64(s178, be, bg)
			st64(s1b8 + 0x38, ld64(s390 + 8))
			st8(s1b8 + 0x32, ld64(s390 + 0x10))
			st8(s1b8 + 0x31, ld64(s390 + 0x18))
			st8(s1b8 + 0x30, ld64(s390 + 0x20))
			st64(s1b8 + 0x28, ld64(s390 + 0x28))
			st64(s1b8 + 0x20, ld64(s390 + 0x30))
			st64(s1b8 + 0x18, bc)
			st64(s1b8 + 0x10, ld64(s3c8))
			st64(s1b8 + 8, ld64(s390 + 0x38))
			st8(s1b8, bs, br, bq)
			st64(s1d8 + 0x18, bt)
			st64(s1d8 + 0x10, ld64(s3d0))
			st64(s1d8, bl, bn)
			st64(s1f8 + 0x18, ld64(s3c8 + 8))
			st64(s150, 8, 0)
			st64(s1f8, 0, 8, 0)
			de = fn_13d318(s2d8, s1f8, ld64(s390))
			aw = ld64(s2d8)
			if (aw != 2) {
				dd = ld64(s2d8 + 8)
				dc = ld64(s390 + 0x40)
				st64(dc, aw, dd)
				return de
			}
			bd = ld64(s348)
			st64(s390 + 0x28, bd.key)
			bj = ld64(s348 + 8)
		}
		const bu: LamportsCell = bd.lamports
		rc_inc(bu)
		const bv: DataCell = bd.data
		rc_inc(bv)
		const bw: AccountInfo = ld64(ld64(bj + 0x18))
		const bx: LamportsCell = bw.lamports
		const by = bx.strong
		st64(s390 + 0x20, bd.executable)
		st64(s390 + 0x30, bd.is_writable)
		st64(s390 + 0x38, bd.is_signer)
		const cc = bd.rent_epoch
		const cd = bd.owner
		const cb = bw.key
		rc_inc(bx, by)
		const bz: DataCell = bw.data
		const ca = bz.strong
		st64(s398, cb, cc, cd, bv, bu)
		rc_inc(bz, ca)
		st64(s3c8 + 0x28, bw.owner)
		st64(s3c8 + 0x20, bw.rent_epoch)
		const ci = bw.is_signer
		const ch = bw.is_writable
		const cg = bw.executable
		const ce = ld64(s348 + 8)
		const cf = ld64(ld64(ce + 0x20))
		copyr(s140, cf, 0x20)
		const cj = ld8(ld64(ce + 0x28))
		st64(s20, s119)
		st64(s38 + 8, s140)
		st64(s40, 0x100151f20)
		st64(s210, s40)
		st64(s258 + 8, s210)
		st8(s258, ci, ch, cg)
		st64(s278 + 0x18, ld64(s3c8 + 0x20))
		st64(s278 + 0x10, ld64(s3c8 + 0x28))
		st64(s278, bx, bz)
		st64(s288 + 8, ld64(s398))
		st8(s288 + 2, ld64(s390 + 0x20))
		st8(s288 + 1, ld64(s390 + 0x30))
		st8(s288, ld64(s390 + 0x38))
		st64(s290, ld64(s390))
		st64(s2a8 + 0x10, ld64(s390 + 8))
		st64(s2a8 + 8, ld64(s390 + 0x10))
		st64(s2a8, ld64(s390 + 0x18))
		st64(s2b0, ld64(s390 + 0x28))
		st64(s390 + 0x38, cj)
		st8(s119, cj)
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 8)
		st64(s210 + 8, 3)
		st64(s248, 1)
		st64(s2c8, 0, 8, 0)
		de = fn_13c8b8(s2e8, s2c8, 0xd8)
		aw = ld64(s2e8)
		if (aw != 2) {
			dd = ld64(s2e8 + 8)
			dc = ld64(s390 + 0x40)
			st64(dc, aw, dd)
			return de
		}
		const ck: AccountInfo = ld64(s348)
		const cl: LamportsCell = ck.lamports
		const cs = ck.key
		rc_inc(cl)
		const cm: DataCell = ck.data
		rc_inc(cm)
		const cn: LamportsCell = bw.lamports
		const co = cn.strong
		st64(s390 + 0x10, bw.key)
		st64(s390 + 0x18, ck.executable)
		st64(s390 + 0x20, ck.is_writable)
		st64(s390 + 0x28, ck.is_signer)
		st64(s390 + 0x30, ck.rent_epoch)
		const cr = ck.owner
		rc_inc(cn, co)
		const cp: DataCell = bw.data
		const cq = cp.strong
		st64(s398, cr, cs, cl)
		rc_inc(cp, cq)
		const cx = bw.owner
		const cw = bw.rent_epoch
		const cv = bw.is_signer
		const cu = bw.is_writable
		const ct = bw.executable
		copyr(s140, cf, 0x20)
		st64(s20, s119)
		st64(s38 + 8, s140)
		st64(s40, 0x100151f20)
		st64(s210, s40)
		st64(s258 + 8, s210)
		st8(s258, cv, cu, ct)
		st64(s278, cn, cp, cx, cw)
		st64(s288 + 8, ld64(s390 + 0x10))
		st8(s288 + 2, ld64(s390 + 0x18))
		st8(s288 + 1, ld64(s390 + 0x20))
		st8(s288, ld64(s390 + 0x28))
		st64(s290, ld64(s390 + 0x30))
		st64(s2a8 + 0x10, ld64(s398))
		st64(s2a8 + 8, cm)
		copyr(s2b0, s390, 0x10)
		st8(s119, ld64(s390 + 0x38))
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 8)
		st64(s210 + 8, 3)
		st64(s248, 1)
		st64(s2c8, 0, 8, 0)
		de = fn_13cc48(s2f8, s2c8, ld64(ld64(ld64(s348 + 8) + 0x30)))
		aw = ld64(s2f8)
		if (aw != 2) {
			dd = ld64(s2f8 + 8)
			dc = ld64(s390 + 0x40)
			st64(dc, aw, dd)
			return de
		}
	} else {
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0x158)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const ad = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		const m = ld64(s348 + 8)
		const n: AccountInfo = ld64(ld64(m + 0x10))
		const o: LamportsCell = n.lamports
		const aa = n.key
		const ae = ld64(s348)
		rc_inc(o)
		st64(s390 + 0x38, aa)
		const ab: DataCell = n.data
		const ac = ab.strong
		st64(s390 + 0x30, ab)
		rc_inc(ab, ac)
		const af = ld64(ae + 8)
		const ag = ld64(af)
		st64(s390, ld64(ae))
		st64(s390 + 8, n.executable)
		st64(s390 + 0x10, n.is_writable)
		st64(s390 + 0x18, n.is_signer)
		st64(s390 + 0x20, n.rent_epoch)
		st64(s390 + 0x28, n.owner)
		rc_inc(af, ag)
		const ah = ld64(ae + 0x10)
		rc_inc(ah)
		const ai: AccountInfo = ld64(ld64(m + 0x18))
		const aj: LamportsCell = ai.lamports
		const ak = aj.strong
		st64(s398, o)
		const al: AccountInfo = ld64(s348)
		st64(s3c8 + 8, al.executable)
		st64(s3c8 + 0x10, al.is_writable)
		st64(s3c8 + 0x18, al.is_signer)
		st64(s3c8 + 0x20, al.rent_epoch)
		st64(s3c8 + 0x28, al.owner)
		const ao = ai.key
		rc_inc(aj, ak)
		const am: DataCell = ai.data
		const an = am.strong
		st64(s3d0, ao, ad)
		st64(s390 + 0x40, a)
		rc_inc(am, an)
		st64(s3d8, ai.owner)
		st64(s3e0, ai.rent_epoch)
		const av = ai.is_signer
		const au = ai.is_writable
		const at = ai.executable
		const ap = ld64(s348 + 8)
		const aq = ld64(ld64(ap + 0x20))
		copyr(s140, aq, 0x20)
		const ar = ld8(ld64(ap + 0x28))
		st64(s20, s119)
		st64(s38 + 8, s140)
		st64(s40, 0x100151f20)
		st8(s119, ar)
		st64(s210, s40)
		st64(s248 + 0x28, s210)
		st8(s248 + 0x22, ld64(s3c8 + 8))
		st8(s248 + 0x21, ld64(s3c8 + 0x10))
		st8(s248 + 0x20, ld64(s3c8 + 0x18))
		st64(s248 + 0x18, ld64(s3c8 + 0x20))
		st64(s248 + 0x10, ld64(s3c8 + 0x28))
		st64(s248, af, ah)
		st64(s258 + 8, ld64(s390))
		st8(s258 + 2, ld64(s390 + 8))
		st8(s258 + 1, ld64(s390 + 0x10))
		st8(s258, ld64(s390 + 0x18))
		st64(s278 + 0x18, ld64(s390 + 0x20))
		st64(s278 + 0x10, ld64(s390 + 0x28))
		st64(s278 + 8, ld64(s390 + 0x30))
		st64(s278, ld64(s398))
		st64(s288 + 8, ld64(s390 + 0x38))
		st8(s288, av, au, at)
		st64(s290, ld64(s3e0))
		st64(s2a8 + 0x10, ld64(s3d8))
		st64(s2a8, aj, am)
		st64(s2b0, ld64(s3d0))
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 8)
		st64(s210 + 8, 3)
		st64(s248 + 0x30, 1)
		st64(s2c8, 0, 8, 0)
		de = fn_13cfd8(s328, s2c8, ld64(s3c8), 0xd8, ld64(ld64(ap + 0x30)))
		aw = ld64(s328)
		if (aw != 2) {
			dd = ld64(s328 + 8)
			dc = ld64(s390 + 0x40)
			st64(dc, aw, dd)
			return de
		}
	}
	const da = ld64(s390 + 0x40)
	fn_4a30(s118, ld64(s348))
	if (ld64(s118) == 0) {
		de = Error_with_account_name(s338, ld64(s118 + 8), ld64(s118 + 0x10), "position", 8)
		const db = ld64(s338)
		st64(da + 8, ld64(s338 + 8))
		st64(da, db)
		return de
	}
	const cy = ld64(0x300000000 /* heap bump-allocator cursor */)
	const cz = cy != 0 ? sat_sub(cy, 0xd8) & -8 : 0x300007f28
	if (cz > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, cz)
		de = memcpy(cz, s118, 0xd8)
		st64(da + 8, cz)
		st64(da, 2)
		return de
	}
	alloc_handle_alloc_error(8, 0xd8)
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

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_mint
function fn_c0cc0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s58 = fp - 0x58, s68 = fp - 0x68, s80 = fp - 0x80, s98 = fp - 0x98, sa0 = fp - 0xa0, sc0 = fp - 0xc0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s118 = fp - 0x118, s158 = fp - 0x158, s178 = fp - 0x178, s198 = fp - 0x198, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d8 = fp - 0x1d8, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8, s218 = fp - 0x218, s220 = fp - 0x220, s228 = fp - 0x228, s230 = fp - 0x230, s248 = fp - 0x248, s260 = fp - 0x260, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s330 = fp - 0x330, s338 = fp - 0x338, s378 = fp - 0x378, s380 = fp - 0x380
	let av, ax, dt, du, dv: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s2f8, b, f)
	if (g != 0) {
		const p = ld64(ld64(b + 0x10))
		st64(s330 + 0x18, p)
		const q = ld64(p)
		copyr(s38, q + 8, 0x18)
		st64(s330 + 0x20, q)
		st64(s40, ld64(q))
		const r = ld64(f)
		copyr(s260, r + 8, 0x18)
		st64(s330 + 0x28, r)
		st64(s268, ld64(r))
		if ((memcmp(s40, s268, 0x20) as u32) == 0) {
			ErrorCode_name(s1b0, 0x100152d40)
			st64(s58, 0, 1, 0)
			st64(s20, s58, 0x100159480)
			st8(s20 + 0x18, 3)
			st64(s20 + 0x10, 0x20)
			st64(s38 + 8, 0)
			st64(s40, 0)
			if (ErrorCode_fmt(0x100152d40, s40) == 0) {
				copyr(s230, s58, 0x18)
				copy(s248, s1b0, 0x18)
				st64(s260, 0x100154abf)
				st32(s1d8 + 8, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s218, 2)
				st32(s260 + 0x10, 0x13)
				st64(s260 + 8, 0x42)
				st64(s268, 0)
				const bc = fn_13b3a8(s2a8, s268)
				const bb = ld64(s2a8 + 8)
				const ba = ld64(s2a8)
				const ay = ld64(s330 + 0x20)
				copyr(s268, ay, 0x20)
				const az = ld64(s330 + 0x28)
				copy(s248, az, 0x20)
				dv = fn_13b5c0(s2b8, ba, bb, s268, bc)
				const bd = ld64(s2b8)
				st64(a + 0x10, ld64(s2b8 + 8))
				st64(a + 8, bd)
				st32(a, 2)
				return dv
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s268, 0x1001594b0, 0x1001594d0)
		}
		st64(s330 + 0x30, a)
		const s = ld64(b + 8)
		const t = __floatundidf(ld64(s) * 0xd2)
		const u = fn_14f7f8(ld64(s + 8), t)
		const v = fn_151cb0(u, 0)
		const w = fn_14f3e8(u)
		const x = max((fn_151a40(u, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (v as i64) ? 0 : w, 1)
		if (x > g) {
			const bf: AccountInfo = ld64(s2f8 + 8)
			const bl = ld64(s2f8)
			const y: AccountInfo = ld64(s330 + 0x18)
			const z: LamportsCell = y.lamports
			rc_inc(z)
			const be: DataCell = y.data
			rc_inc(be)
			const bg: LamportsCell = bf.lamports
			const bh = bg.strong
			st64(s338, bf.key)
			st64(s330, y.executable)
			st64(s330 + 8, y.is_writable)
			st64(s330 + 0x10, y.is_signer)
			st64(s330 + 0x28, y.rent_epoch)
			const bk = y.owner
			rc_inc(bg, bh)
			const bi: DataCell = bf.data
			const bj = bi.strong
			st64(s330 + 0x18, bk)
			rc_inc(bi, bj)
			const bm: AccountInfo = ld64(ld64(bl + 0x18))
			const bn: LamportsCell = bm.lamports
			const bo = bn.strong
			st64(s378 + 0x38, sat_sub(x, g))
			st64(s378 + 0x10, bf.executable)
			st64(s378 + 0x18, bf.is_writable)
			st64(s378 + 0x20, bf.is_signer)
			st64(s378 + 0x28, bf.rent_epoch)
			st64(s378 + 0x30, bf.owner)
			const br = bm.key
			rc_inc(bn, bo)
			const bp: DataCell = bm.data
			const bq = bp.strong
			st64(s378, z, br)
			rc_inc(bp, bq)
			st64(s380, bm.owner)
			const bv = bm.rent_epoch
			const bu = bm.is_signer
			const bt = bm.is_writable
			const bs = bm.executable
			st8(s118 + 0x22, ld64(s378 + 0x10))
			st8(s118 + 0x21, ld64(s378 + 0x18))
			st8(s118 + 0x20, ld64(s378 + 0x20))
			st64(s118 + 0x18, ld64(s378 + 0x28))
			st64(s118 + 0x10, ld64(s378 + 0x30))
			st64(s118, bg, bi)
			st64(s158 + 0x38, ld64(s338))
			st8(s158 + 0x32, ld64(s330))
			st8(s158 + 0x31, ld64(s330 + 8))
			st8(s158 + 0x30, ld64(s330 + 0x10))
			st64(s158 + 0x28, ld64(s330 + 0x28))
			st64(s158 + 0x20, ld64(s330 + 0x18))
			st64(s158 + 0x18, be)
			st64(s158 + 0x10, ld64(s378))
			st64(s158 + 8, ld64(s330 + 0x20))
			st8(s158, bu, bt, bs)
			st64(s178 + 0x18, bv)
			st64(s178 + 0x10, ld64(s380))
			st64(s178, bn, bp)
			st64(s198 + 0x18, ld64(s378 + 8))
			st64(sf0, 8, 0)
			st64(s198, 0, 8, 0)
			dv = fn_13d318(s278, s198, ld64(s378 + 0x38))
			ax = ld64(s278)
			if (ax != 2) {
				du = ld64(s278 + 8)
				dt = ld64(s330 + 0x30)
				st64(dt + 8, ax, du)
				st32(dt, 2)
				return dv
			}
			st64(s330 + 0x28, ld64(ld64(s2f8 + 8)))
		}
		const bw = ld64(ld64(s2f8 + 8) + 8)
		rc_inc(bw)
		const bx = ld64(ld64(s2f8 + 8) + 0x10)
		rc_inc(bx)
		const by: AccountInfo = ld64(ld64(ld64(s2f8) + 0x18))
		const bz: LamportsCell = by.lamports
		const ca = bz.strong
		const cb: AccountInfo = ld64(s2f8 + 8)
		st64(s330 + 0x10, cb.executable)
		st64(s330 + 0x18, cb.is_writable)
		st64(s330 + 0x20, cb.is_signer)
		const cf = cb.rent_epoch
		const ck = cb.owner
		const ce = by.key
		rc_inc(bz, ca)
		st64(s330 + 8, bx)
		const cc: DataCell = by.data
		const cd = cc.strong
		st64(s338, cf, bw)
		rc_inc(cc, cd)
		const cj = by.owner
		const ci = by.rent_epoch
		const ch = by.is_signer
		const cg = by.is_writable
		st8(s1f8 + 2, by.executable)
		st8(s1f8, ch, cg)
		st64(s220, ce, bz, cc, cj, ci)
		st8(s228 + 2, ld64(s330 + 0x10))
		st8(s228 + 1, ld64(s330 + 0x18))
		st8(s228, ld64(s330 + 0x20))
		st64(s230, ld64(s338))
		st64(s248 + 0x10, ck)
		copyr(s248, s330, 0x10)
		st64(s260 + 0x10, ld64(s330 + 0x28))
		st64(s1f0, 8, 0)
		st64(s268, 0, 8, 0)
		dv = fn_13c8b8(s288, s268, 0x52)
		ax = ld64(s288)
		if (ax != 2) {
			du = ld64(s288 + 8)
			dt = ld64(s330 + 0x30)
			st64(dt + 8, ax, du)
			st32(dt, 2)
			return dv
		}
		const cl: AccountInfo = ld64(s2f8 + 8)
		const cm: LamportsCell = cl.lamports
		const ct = cl.key
		rc_inc(cm)
		const cn: DataCell = cl.data
		rc_inc(cn)
		const co: LamportsCell = by.lamports
		const cp = co.strong
		st64(s330 + 0x10, by.key)
		st64(s330 + 0x18, cl.executable)
		st64(s330 + 0x20, cl.is_writable)
		st64(s330 + 0x28, cl.is_signer)
		const cq = cl.rent_epoch
		const cy = cl.owner
		rc_inc(co, cp)
		st64(s330, cq)
		const cr: DataCell = by.data
		const cs = cr.strong
		st64(s330 + 8, ct)
		rc_inc(cr, cs)
		const cx = by.owner
		const cw = by.rent_epoch
		const cv = by.is_signer
		const cu = by.is_writable
		st8(s1f8 + 2, by.executable)
		st8(s1f8, cv, cu)
		st64(s218, co, cr, cx, cw)
		st64(s220, ld64(s330 + 0x10))
		st8(s228 + 2, ld64(s330 + 0x18))
		st8(s228 + 1, ld64(s330 + 0x20))
		st8(s228, ld64(s330 + 0x28))
		st64(s230, ld64(s330))
		st64(s248, cm, cn, cy)
		st64(s260 + 0x10, ld64(s330 + 8))
		st64(s1f0, 8, 0)
		st64(s268, 0, 8, 0)
		av = ld64(ld64(s2f8) + 0x20)
		const cz = ld64(ld64(av))
		copyr(s40, cz, 0x20)
		dv = fn_13cc48(s298, s268, s40)
		ax = ld64(s298)
		if (ax != 2) {
			du = ld64(s298 + 8)
			dt = ld64(s330 + 0x30)
			st64(dt + 8, ax, du)
			st32(dt, 2)
			return dv
		}
	} else {
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0xd2)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const af = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		st64(s330 + 0x30, a)
		const m = ld64(s2f8)
		const n: AccountInfo = ld64(ld64(m + 0x10))
		const o: LamportsCell = n.lamports
		const aj = n.key
		const ab: AccountInfo = ld64(s2f8 + 8)
		rc_inc(o)
		const aa: DataCell = n.data
		rc_inc(aa)
		const ac: LamportsCell = ab.lamports
		st64(s330 + 0x28, ac)
		const ad = ac.strong
		st64(s338, ab.key)
		st64(s330, n.executable)
		st64(s330 + 8, n.is_writable)
		st64(s330 + 0x10, n.is_signer)
		st64(s330 + 0x18, n.rent_epoch)
		st64(s330 + 0x20, n.owner)
		rc_inc(ld64(s330 + 0x28), ad)
		const ae: DataCell = ab.data
		rc_inc(ae)
		st64(s378 + 0x28, aa)
		st64(s378 + 0x38, af)
		const ag: AccountInfo = ld64(ld64(m + 0x18))
		const ah: LamportsCell = ag.lamports
		const ai = ah.strong
		st64(s378 + 0x30, aj)
		st64(s378 + 0x18, ab.executable)
		st64(s378 + 0x20, ab.is_writable)
		const ap = ab.is_signer
		const ak = ab.rent_epoch
		const al = ab.owner
		const ao = ag.key
		rc_inc(ah, ai)
		st64(s378, al, ak)
		const am: DataCell = ag.data
		const an = am.strong
		st64(s378 + 0x10, ao)
		rc_inc(am, an)
		st64(s380, ag.owner)
		const au = ag.rent_epoch
		const at = ag.is_signer
		const ar = ag.is_writable
		const aq = ag.executable
		st8(s1d8 + 0x12, ld64(s378 + 0x18))
		st8(s1d8 + 0x11, ld64(s378 + 0x20))
		st8(s1d8 + 0x10, ap)
		copyr(s1d8, s378, 0x10)
		st64(s1f0 + 0x10, ae)
		st64(s1f0 + 8, ld64(s330 + 0x28))
		st64(s1f0, ld64(s338))
		st8(s1f8 + 2, ld64(s330))
		st8(s1f8 + 1, ld64(s330 + 8))
		st8(s1f8, ld64(s330 + 0x10))
		st64(s218 + 0x18, ld64(s330 + 0x18))
		st64(s218 + 0x10, ld64(s330 + 0x20))
		st64(s218 + 8, ld64(s378 + 0x28))
		st64(s218, o)
		st64(s220, ld64(s378 + 0x30))
		st8(s228, at, ar, aq)
		st64(s230, au)
		st64(s248 + 0x10, ld64(s380))
		st64(s248, ah, am)
		st64(s260 + 0x10, ld64(s378 + 0x10))
		st64(s1c0, 8, 0)
		st64(s268, 0, 8, 0)
		av = ld64(ld64(s2f8) + 0x20)
		const aw = ld64(ld64(av))
		copyr(s40, aw, 0x20)
		dv = fn_13cfd8(s2c8, s268, ld64(s378 + 0x38), 0x52, s40)
		ax = ld64(s2c8)
		if (ax != 2) {
			du = ld64(s2c8 + 8)
			dt = ld64(s330 + 0x30)
			st64(dt + 8, ax, du)
			st32(dt, 2)
			return dv
		}
	}
	const da: AccountInfo = ld64(av)
	const db: LamportsCell = da.lamports
	const dd: AccountInfo = ld64(s2f8 + 8)
	const dj = da.key
	rc_inc(db)
	const dc: DataCell = da.data
	rc_inc(dc)
	const de: LamportsCell = dd.lamports
	const df = de.strong
	st64(s330 + 0x10, dd.key)
	st64(s330 + 0x18, da.executable)
	st64(s330 + 0x20, da.is_writable)
	st64(s330 + 0x28, da.is_signer)
	const dp = da.rent_epoch
	const di = da.owner
	rc_inc(de, df)
	st64(s330 + 8, db)
	const dg: DataCell = dd.data
	const dh = dg.strong
	st64(s338, dc, dj)
	rc_inc(dg, dh)
	const dn = dd.owner
	const dm = dd.rent_epoch
	const dl = dd.is_signer
	const dk = dd.is_writable
	st8(sa0 + 2, dd.executable)
	st8(sa0, dl, dk)
	st64(sc0, de, dg, dn, dm)
	st64(se0 + 0x18, ld64(s330 + 0x10))
	st8(s80 + 0x12, ld64(s330 + 0x18))
	st8(s80 + 0x11, ld64(s330 + 0x20))
	st8(s80 + 0x10, ld64(s330 + 0x28))
	st64(s80, di, dp)
	st64(s98 + 0x10, ld64(s338))
	copyr(s98, s330, 0x10)
	st64(s68, 8, 0)
	st64(se0, 0, 8, 0)
	const dq = ld64(ld64(ld64(ld64(s2f8) + 0x28)))
	copyr(s268, dq, 0x20)
	dv = fn_127828(s2d8, se0, 0, s268, 0)
	ax = ld64(s2d8)
	if (ax == 2) {
		Account_try_from(s268, dd)
		const dr = ld64(s330 + 0x30)
		if (ld32(s268) == 2) {
			dv = Error_with_account_name(s2e8, ld64(s260), ld64(s260 + 8), "position_mint", 0xd)
			const ds = ld64(s2e8)
			st64(dr + 0x10, ld64(s2e8 + 8))
			st64(dr + 8, ds)
			st32(dr, 2)
			return dv
		}
		return memcpy(dr, s268, 0x60)
	}
	du = ld64(s2d8 + 8)
	dt = ld64(s330 + 0x30)
	st64(dt + 8, ax, du)
	st32(dt, 2)
	return dv
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_token_account
function fn_bba20(a: u64, b: u64): u64 {
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

function fn_4c1a0(a: u64, b: u64, c: u64, d: u64): u64 {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), c (value)
function fn_60930(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64 {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), e (value)
function fn_14e1c0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x10015bb90, 1, 8, 0, 0)
	// fmt "attempt to calculate the remainder with a divisor of zero"
	fn_149478(s30, a, c, d, e)
}

function log_data(a: u64, b: u64): u64 {
	return sol_log_data(a, b)
}

// types [heur]: d: OpenPositionWithMetadataAccounts (every call passes one: fn_347f8)
function fn_67020(a: u64, b: u64, c: u64, d: OpenPositionWithMetadataAccounts, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s58 = fp - 0x58, s70 = fp - 0x70, se0 = fp - 0xe0, s100 = fp - 0x100, s110 = fp - 0x110, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s198 = fp - 0x198, s1c0 = fp - 0x1c0, s1c8 = fp - 0x1c8, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8, s220 = fp - 0x220, s228 = fp - 0x228, s250 = fp - 0x250, s258 = fp - 0x258, s280 = fp - 0x280, s288 = fp - 0x288, s2b0 = fp - 0x2b0, s2b8 = fp - 0x2b8, s2e0 = fp - 0x2e0, s2e8 = fp - 0x2e8, s310 = fp - 0x310, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358
	let aj = a
	const g = ld64(p10)
	const f: AccountInfo = ld64(d + 0x58)
	let bj = fn_68310(s338, b, f, ld64(p5), g)
	let bi = ld64(s338 + 8)
	let h = ld64(s338)
	if (h != 2) {
		st64(aj, h, bi)
		return bj
	}
	const i: AccountInfo = ld64(p9)
	const j: LamportsCell = i.lamports
	const t = p12
	let cq = p11
	let cs = p8
	let ct = p7
	const m = p6
	const k = i.key
	rc_inc(j)
	const l: DataCell = i.data
	rc_inc(l)
	const n: AccountInfo = ld64(m)
	const o: LamportsCell = n.lamports
	const co = i.executable
	const cp = i.is_writable
	const cu = i.is_signer
	const cn = i.rent_epoch
	const q = i.owner
	const cm = n.key
	rc_inc(o)
	const p: DataCell = n.data
	rc_inc(p)
	const r: LamportsCell = f.lamports
	const cg = f.key
	const ch = n.executable
	const ci = n.is_writable
	const cj = n.is_signer
	const ck = n.rent_epoch
	const cl = n.owner
	rc_inc(r)
	const s: DataCell = f.data
	rc_inc(s)
	let cr = t
	const u: AccountInfo = ld64(b)
	const v: LamportsCell = u.lamports
	const cb = f.executable
	const cc = f.is_writable
	const cd = f.is_signer
	const ce = f.rent_epoch
	const cf = f.owner
	const x = u.key
	rc_inc(v)
	const w: DataCell = u.data
	rc_inc(w)
	const y: AccountInfo = ld64(ct)
	const z: LamportsCell = y.lamports
	ct = z
	const bw = u.executable
	const bx = u.is_writable
	const by = u.is_signer
	const bz = u.rent_epoch
	const ca = u.owner
	const ae = y.key
	rc_inc(z)
	const aa: DataCell = y.data
	rc_inc(aa)
	const ab: AccountInfo = ld64(cs)
	const ac: LamportsCell = ab.lamports
	cs = ac
	const bq = y.executable
	const br = y.is_writable
	const bs = y.is_signer
	const bt = y.rent_epoch
	const bu = y.owner
	const bv = ab.key
	rc_inc(ac)
	const ad: DataCell = ab.data
	const af = cr
	rc_inc(ad)
	const ag: AccountInfo = ld64(af)
	const ah: LamportsCell = ag.lamports
	cr = ah
	const bn = ab.executable
	const bo = ab.is_writable
	const bp = ab.is_signer
	const ak = ab.rent_epoch
	const ar = ab.owner
	const bm = ag.key
	rc_inc(ah)
	const ai: DataCell = ag.data
	const bk = aj
	rc_inc(ai)
	const al: AccountInfo = ld64(cq)
	const am: LamportsCell = al.lamports
	const bl = ag.executable
	cq = ag.is_writable
	const an = ag.is_signer
	const aq = ag.rent_epoch
	const ao = ag.owner
	const ay = al.key
	rc_inc(am)
	const ap: DataCell = al.data
	rc_inc(ap)
	const ax = al.owner
	const aw = al.rent_epoch
	const av = al.is_signer
	const au = al.is_writable
	const at = al.executable
	st8(s198, an, cq, bl)
	st64(s1c0, bm, cr, ai, ao, aq)
	st8(s1c8, av, au, at)
	st64(s1f0, ay, am, ap, ax, aw)
	st8(s1f8, bs, br, bq)
	st64(s220, ae, ct, aa, bu, bt)
	st8(s228, bp, bo, bn)
	st64(s250, bv, cs, ad, ar, ak)
	st8(s258, by, bx, bw)
	st64(s280, x, v, w, ca, bz)
	st8(s288, cd, cc, cb)
	st64(s2b0, cg, r, s, cf, ce)
	st8(s2b8, cj, ci, ch)
	st64(s2e0, cm, o, p, cl, ck)
	st64(s180, s170, 6, 0x100152b28, 9, b + 0x188, 0x20, b + 0x1a8, 0x20, b + 0x1e8, 0x20, b + 0x286, 2, b + 0x28c, 1)
	st64(s310, k, j, l, q, cn)
	st8(s2e8, cu, cp, co)
	st8(s198 + 7, ld8(s110 + 4))
	st32(s198 + 3, ld32(s110))
	st32(s2e8 + 3, ld32(s70))
	st8(s2e8 + 7, ld8(s70 + 4))
	st64(s328, 0, 8, 0)
	st64(s190, s180, 1)
	const az = ld64(0x300000000 /* heap bump-allocator cursor */)
	const ba = az != 0 ? sat_sub(az, 0x17) : 0x300007fe9
	if (ba > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, ba)
		st64(ba + 0xf, 0x6e6f697469736f50)
		st64(ba + 8, 0x50206c6f6f706c72)
		st64(ba, 0x696857206163724f)
		const bb = ld64(0x300000000 /* heap bump-allocator cursor */)
		const bc = bb != 0 ? sat_sub(bb, 3) : 0x300007ffd
		if (bc > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, bc)
			st8(bc + 2, 0x50)
			st16(bc, 0x574f)
			const bd = ld64(ld64(c))
			const bh = ld64(bd)
			const bg = ld64(bd + 8)
			const bf = ld64(bd + 0x10)
			const be = ld64(bd + 0x18)
			st64(s40, 0x10015a1d0, fn_b980, s20, fn_145330)
			st64(s70, 0x10015a1b0)
			st64(s70 + 0x10, s40)
			st64(s20, bh, bg, bf, be)
			st64(s70 + 8, 2)
			st64(s58, 2, 0)
			fn_147e78(se0, s70, bg, bf, s40)
			st64(s100 + 0x10, bc)
			st64(s110 + 8, ba)
			st64(se0 + 0x18, 0x8000000000000000)
			st16(se0 + 0x48, 0)
			st64(s100 + 0x18, 3)
			st64(s100, 0x17, 3)
			st64(s110, 0x17)
			st8(se0 + 0x4a, 2)
			st8(se0 + 0x40, 3)
			st8(s70, 2)
			bj = fn_128fc0(s348, s328, s110, 1, 0, s70)
			bi = ld64(s348 + 8)
			h = ld64(s348)
			aj = bk
			if (h != 2) {
				st64(aj, h, bi)
				return bj
			}
			bj = fn_69330(s358, b, f, g)
			bi = ld64(s358 + 8)
			st64(aj, ld64(s358))
			st64(aj + 8, bi)
			return bj
		}
		raw_vec_handle_error(1, 3, bb - 3, 3 > bb, bm)
	}
	raw_vec_handle_error(1, 0x17, az - 0x17, 0x17 > az, bm)
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

function fn_4a30(a: u64, b: u64) {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), c (points to it)
function fn_1390b0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1000 = fp - 0x1000
	st64(s1000, 8, 0)
	return fn_1390d8(a, b, c, d, fp)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_149478(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	const s20 = fp - 0x20, s28 = fp - 0x28
	st64(s20, 0x10015b8e0, a, b)
	st16(s20 + 0x18, 1)
	st64(s28, 1)
	fn_147238(s28, b, c, d, e)
}

function fn_68310(a: u64, b: u64, c: AccountInfo, d: AccountInfo, e: AccountInfo): u64 {
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

function fn_b980(a: u64, b: u64): u64 {
	return str_fmt(ld64(a), ld64(a + 8), b)
}

function fn_145330(a: u64, b: u64, c: u64, d: u64, e: u64, r7: u64): u64 {
	return fn_144d50(b, a, a, d, e, r7)
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

function fn_128fc0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64 {
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

function fn_69330(a: u64, b: u64, c: AccountInfo, d: AccountInfo): u64 {
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

function fn_104598(a: u64, b: u64, c: u64, d: u64, e: u64) {
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

function fn_14f060(a: u64, b: u64): u64 {
	return fn_14ecd0(ld64(a), 1, b)
}

function fn_68db8(): u64 {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_147238(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	fn_1478b8(a, b, c, d, e)
}

function fn_135038(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64) {
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

function fn_144d50(a: u64, b: u64, c: u64, d: u64, e: u64, r7: u64): u64 {
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

function fn_12bb90(a: u64, b: u64, c: u64) {
	fn_12bbb0(a, b, c, 1, 0)
}

function fn_12a2b8(a: u64, b: u64) {
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

function fn_83078(r0: u64): u64 {
	return r0
}

function fn_134a08(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64) {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_14c4f0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c4f8(a, b, c, d, e)
}

function fn_10590(a: u64, b: u64) {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_1478b8(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	custom_panic(a, b, c, d, e)
	abort()
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_133ce0(a: u64, b: u64) {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (value), e (value)
function fn_14c5c0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c5c8(a, b, c, d, e)
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

function fn_12bbb0(a: u64, b: u64, c: u64, d: u64, e: u64) {
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

function fn_12b1c8(a: u64, b: u64) {
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
