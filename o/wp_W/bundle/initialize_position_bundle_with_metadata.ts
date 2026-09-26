// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction initialize_position_bundle_with_metadata: handler + 45 reachable functions
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
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_invoke_signed_rust(ix: u64, accountInfos: u64, accountInfosLen: u64, signerSeeds: u64, signerSeedsLen: u64): u64 // CPI (Rust ABI: &Instruction, &[AccountInfo], &[&[&[u8]]])
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function Account_try_from(a: u64, b: u64): void // lib anchor_lang::accounts::account::Account<T>::try_from
declare function Account_try_from_unchecked(a: u64, b: u64): void // lib anchor_lang::accounts::account::Account<T>::try_from_unchecked
declare function ptr_drop_in_place_c1b0(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 4]>
declare function fn_ead8(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): void // lib uses raw_vec_handle_error
declare function AccountInfo_clone(a: u64, b: u64): void // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11990(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_122e8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp
declare function fn_12510(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from, memcmp
declare function fn_129a0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from, memcmp
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
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
declare function Formatter_write_str(a: u64, b: u64, c: u64): u64 // lib core::fmt::Formatter::write_str
declare function fn_14c760(a: u64, b: u64, c: u64, r7: u64): void // lib
declare function fn_14ecd0(a: u64, b: u64, c: u64): u64 // lib "0001020304050607080910111213141516171819…", "0001020304050607080910111213141516171819…"
declare function fn_14f3e8(a: u64): u64 // lib
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function __floatundidf(a: u64): u64 // lib __floatundidf
declare function fn_14f808(a: u64, b: u64): u64 // lib uses __multi3
declare function fn_151a40(a: u64, b: u64): u64 // lib
declare function fn_151cb0(a: u64, b: u64): u64 // lib

// instruction handler: initialize_position_bundle_with_metadata (discriminator sha256("global:initialize_position_bundle_with_metadata")[..8] = 0xf57383f9b3107c5d)
// accounts [str: the program's account-error strings, in order of first use]: position_bundle_owner, metadata_update_auth, rent, position_bundle, position_bundle_mint, position_bundle_token_account, token_program, funder, position_bundle_metadata, metadata_program, associated_token_program, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
function ix_initialize_position_bundle_with_metadata(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, se0 = fp - 0xe0, sf8 = fp - 0xf8, s100 = fp - 0x100, s128 = fp - 0x128, s130 = fp - 0x130, s138 = fp - 0x138, s140 = fp - 0x140, s148 = fp - 0x148, s160 = fp - 0x160, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1d9 = fp - 0x1d9, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s1000 = fp - 0x1000
	let s: u64
	sol_log("Instruction: InitializePositionBundleWithMetadata", 0x31)
	st8(s1d9, 0xff)
	st64(s1d8, accounts, accounts_len)
	st64(s1000 + 8, s1d9)
	let t = accounts_initialize_position_bundle_with_metadata(sf8, program_id, s1d8, undef, fp)
	const f = ld32(sf8)
	if (f == 2) {
		s = ld64(sf8 + 8)
		st64(a + 8, ld64(sf8 + 0x10))
		st64(a, s)
		return t
	}
	const i = ld32(sf8 + 4)
	const h = ld64(sf8 + 8)
	const g = ld64(sf8 + 0x10)
	memcpy(s1b0, se0, 0xb8)
	st64(s1c0, h, g)
	st32(s1c8, f, i)
	const j = ld64(s1b0 + 0x40)
	const k = ld64(j)
	const o = ld64(k)
	const n = ld64(k + 8)
	const m = ld64(k + 0x10)
	const q = ld8(s1d9)
	const l = ld64(s1b0 + 0x48)
	st64(l + 0x20, ld64(k + 0x18))
	st64(l + 0x18, m)
	st64(l + 0x10, n)
	st64(l + 8, o)
	const r = ld64(s160 + 8)
	const p = ld64(j)
	copyr(s28, p, 0x20)
	st64(sf8, 0x100152e73)
	st64(sf8 + 0x10, s28)
	st64(se0 + 8, s1)
	st8(s1, q)
	st64(sf8 + 8, 0xf)
	st64(se0, 0x20)
	st64(se0 + 0x10, 1)
	st64(s1000, r, s160, s140, s100, s138, s130, s128, sf8, 3)
	t = fn_6a310(s1f0, s148, l, s1c8, r, s160, s140, s100, s138, s130, s128, sf8, 3)
	s = ld64(s1f0)
	if (s == 2) {
		t = fn_ab200(s200, s1c8, program_id)
		s = ld64(s200)
		st64(a + 8, ld64(s200 + 8))
		st64(a, s)
		return t
	}
	st64(a + 8, ld64(s1f0 + 8))
	st64(a, s)
	return t
}

// Anchor Accounts::try_accounts of instruction initialize_position_bundle_with_metadata (called by ix_initialize_position_bundle_with_metadata; name [str]: from the handler's "Instruction: …" log; was fn_a56d0)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_bundle_owner (AccountNotEnoughKeys), metadata_update_auth (AccountNotEnoughKeys, ConstraintAddress), rent, position_bundle (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), position_bundle_mint (ConstraintMut, ConstraintSigner, ConstraintRentExempt), position_bundle_token_account (ConstraintMut, ConstraintRentExempt), token_program (ConstraintAddress), funder (ConstraintMut), position_bundle_metadata (AccountNotEnoughKeys, ConstraintMut), metadata_program, associated_token_program, system_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_bundle_metadata, position_bundle, position_bundle_mint, position_bundle_token_account, funder
function accounts_initialize_position_bundle_with_metadata(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s18 = fp - 0x18, s48 = fp - 0x48, s80 = fp - 0x80, s88 = fp - 0x88, s90 = fp - 0x90, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sf0 = fp - 0xf0, s108 = fp - 0x108, s120 = fp - 0x120, s138 = fp - 0x138, s139 = fp - 0x139, s160 = fp - 0x160, s178 = fp - 0x178, s190 = fp - 0x190, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, s1b0 = fp - 0x1b0, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1c8 = fp - 0x1c8, s1d0 = fp - 0x1d0, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s500 = fp - 0x500, s508 = fp - 0x508, s510 = fp - 0x510, s518 = fp - 0x518, s520 = fp - 0x520, s528 = fp - 0x528, s530 = fp - 0x530
	let j, p, q, r, ae, af, bp: u64
	st64(s1d8, b)
	const f = ld64(c + 8)
	if (f != 0) {
		const am = ld64(e - 0xff8)
		const position_bundle_metadata: AccountInfo = ld64(c)
		st64(s1d0, position_bundle_metadata)
		st64(c + 8, f - 1)
		st64(c, position_bundle_metadata + 0x30)
		if (f != 1) {
			st64(s1c8, position_bundle_metadata + 0x30)
			st64(c + 8, f - 2)
			let h = position_bundle_metadata + 0x60
			st64(c, h)
			if (f != 2) {
				j = f - 3
				st64(c + 8, j)
				st64(c, position_bundle_metadata + 0x90)
				if (j == 0) {
					af = anchor_error_from(s4b8, 0xbbd /* anchor::AccountNotEnoughKeys */, j, h, e)
					ae = ld64(s4b8)
					st64(a + 0x10, ld64(s4b8 + 8))
					st64(a + 8, ae)
					st32(a, 2)
					return af
				}
				st64(s500 + 0x20, h)
				st64(s1c0, position_bundle_metadata + 0x90)
				st64(c + 8, f - 4)
				let k = position_bundle_metadata + 0xc0
				st64(c, k)
				if (f == 4) {
					anchor_error_from(s1e8, 0xbbd /* anchor::AccountNotEnoughKeys */, k, h, e)
					h = undef
					e = undef
					k = ld64(s1e8 + 8)
					const l = ld64(s1e8)
					if (l != 2) {
						af = Error_with_account_name(s1f8, l, k, "position_bundle_owner", 0x15)
						ae = ld64(s1f8)
						st64(a + 0x10, ld64(s1f8 + 8))
						st64(a + 8, ae)
						st32(a, 2)
						return af
					}
				} else {
					st64(c + 8, f - 5)
					st64(c, position_bundle_metadata + 0xf0)
				}
				st64(s1b8, k)
				try_accounts_11718(sa8, c, k, h, e)
				const n = ld64(sa0)
				const m = ld64(sa8)
				if (m == 2) {
					st64(s1b0, n)
					const o = ld64(c + 8)
					if (o == 0) {
						anchor_error_from(s218, 0xbbd /* anchor::AccountNotEnoughKeys */, n, q, r)
						p = ld64(s218 + 8)
						const s = ld64(s218)
						if (s != 2) {
							af = Error_with_account_name(s228, s, p, "metadata_update_auth", 0x14)
							ae = ld64(s228)
							st64(a + 0x10, ld64(s228 + 8))
							st64(a + 8, ae)
							st32(a, 2)
							return af
						}
					} else {
						st64(c + 8, o - 1)
						p = ld64(c)
						st64(c, p + 0x30)
					}
					st64(s500 + 0x18, p)
					fn_129a0(sa8, c, p, q, r)
					const u = ld64(sa0)
					const t = ld64(sa8)
					if (t == 2) {
						st64(s1a8, u)
						fn_122e8(sa8, c, u)
						const w = ld64(sa0)
						const v = ld64(sa8)
						if (v == 2) {
							st64(s1a0, w)
							try_accounts_11990(sa8, c, w)
							const z = ld64(sa0 + 8)
							const y = ld64(sa0)
							const x = ld64(sa8)
							if (x == 0) {
								af = Error_with_account_name(s488, y, z, 0x100152d60 /* "rent" */, 4)
								ae = ld64(s488)
								st64(a + 0x10, ld64(s488 + 8))
								st64(a + 8, ae)
								st32(a, 2)
								return af
							}
							st64(s500, x, y, z)
							st64(s508, ld64(s90))
							fn_12510(sa8, c, z)
							const ab = ld64(sa0)
							const aa = ld64(sa8)
							if (aa == 2) {
								st64(s198, ab)
								fn_12e30(sa8, c, ab)
								const ad = ld64(sa0)
								const ac = ld64(sa8)
								if (ac == 2) {
									rent_get(sa8)
									copy(s178, sa0, 0x18)
									if (ld64(sa8) == 0) {
										copyr(s190, s178, 0x18)
										const ag = ld64(ld64(s1c8))
										const ak = ld64(ag + 0x18)
										const aj = ld64(ag + 0x10)
										const ai = ld64(ag + 8)
										const ah = ld64(ag)
										st64(s48, 0x100152e73)
										st64(s48 + 0x10, s108)
										st64(s108, ah, ai, aj, ak)
										st64(s48 + 8, 0xf)
										st64(s48 + 0x18, 0x20)
										// PDA find_program_address(["position_bundle", *s108], program *(ld64(s1d8)))
										Pubkey_find_program_address(sa8, s48, 2, ld64(s1d8))
										copyr(s160, sa8, 0x20)
										const al = ld8(s88)
										st8(s139, al)
										st8(am, al)
										const an = ld64(ld64(s1d0))
										copy(sa8, an, 0x20)
										if ((memcmp(sa8, s160, 0x20) as u32) == 0) {
											st64(s80, s139, s1d8)
											st64(s88, ld64(s1c8))
											st64(sa8, s1d0, s190, s1b0, s1a0)
											af = fn_a7c90(s108, sa8)
											const aw = ld64(s108 + 8)
											ae = ld64(s108)
											if (ae == 2) {
												st64(s510, ad)
												const position_bundle: AccountInfo = ld64(aw)
												if (position_bundle.is_writable == 0) {
													anchor_error_from(s468, 0x7d0 /* anchor::ConstraintMut */)
													af = Error_with_account_name(s478, ld64(s468), ld64(s468 + 8), "position_bundle", 0xf)
													ae = ld64(s478)
													st64(a + 0x10, ld64(s478 + 8))
													st64(a + 8, ae)
													st32(a, 2)
													return af
												}
												AccountInfo_clone(s108, position_bundle)
												st64(s518, fn_143100(s108))
												st64(s520, aw)
												AccountInfo_clone(sa8, ld64(aw))
												AccountInfo_try_data_len(s48, sa8)
												const az = ld64(s48 + 8)
												const ay = ld64(s48)
												if (ay != 0x800000000000001a /* Ok */) {
													st64(s48 + 0x10, ld64(s48 + 0x10))
													st64(s48, ay, az)
													af = fn_13b430(s2b8, s48)
													const bl = ld64(s2b8)
													st64(a + 0x10, ld64(s2b8 + 8))
													st64(a + 8, bl)
													st32(a, 2)
													const bn = ld64(sa0 + 8)
													const bm = ld64(sa0)
													rc_dec(bm)
													rc_dec(bn)
													bp = ld64(s108 + 0x10)
													const bo = ld64(s108 + 8)
													rc_dec(bo)
													if (!rc_release(bp)) {
														return af
													}
													st64(bp + 8, ld64(bp + 8) - 1)
													return af
												}
												const ba = __floatundidf(ld64(s190) * (az + 0x80))
												const bb = fn_14f7f8(ld64(s190 + 8), ba)
												st64(s528, fn_151cb0(bb, 0))
												const bc = fn_14f3e8(bb)
												const bd = 0 > (ld64(s528) as i64) ? 0 : bc
												const bk = (fn_151a40(bb, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : bd
												const bf = ld64(sa0 + 8)
												const be = ld64(sa0)
												rc_dec(be)
												rc_dec(bf)
												const bi = ld64(s108 + 0x10)
												const bg = ld64(s108 + 8)
												let bh = ld64(bg) - 1
												st64(bg, bh)
												if (bh == 0) {
													bh = ld64(bg + 8) - 1
													st64(bg + 8, bh)
												}
												let bj = ld64(bi) - 1
												st64(bi, bj)
												if (bj == 0) {
													bj = ld64(bi + 8) - 1
													st64(bi + 8, bj)
												}
												if (bk > ld64(s518)) {
													anchor_error_from(s448, 0x7d5 /* anchor::ConstraintRentExempt */, bj, bh)
													af = Error_with_account_name(s458, ld64(s448), ld64(s448 + 8), "position_bundle", 0xf)
													ae = ld64(s458)
													st64(a + 0x10, ld64(s458 + 8))
													st64(a + 8, ae)
													st32(a, 2)
													return af
												}
												rent_get(sa8)
												copy(s120, sa0, 0x18)
												if (ld64(sa8) != 0) {
													af = fn_13b430(s2c8, s120)
													ae = ld64(s2c8)
													st64(a + 0x10, ld64(s2c8 + 8))
													st64(a + 8, ae)
													st32(a, 2)
													return af
												}
												copyr(s138, s120, 0x18)
												st64(s48 + 0x28, ld64(s520))
												st64(s48, s1c8, s138, s1b0, s1a0, s1a8)
												af = fn_a9730(sa8, s48)
												const bq = ld32(sa8)
												if (bq == 2) {
													ae = ld64(sa0)
													st64(a + 0x10, ld64(sa0 + 8))
													st64(a + 8, ae)
													st32(a, 2)
													return af
												}
												st64(s518, ld32(sa8 + 4))
												st64(s528, ld64(sa0))
												const br = ld64(sa0 + 8)
												memcpy(sf0, s90, 0x48)
												st64(s108 + 0x10, br)
												st64(s108 + 8, ld64(s528))
												st32(s108 + 4, ld64(s518))
												st32(s108, bq)
												const position_bundle_mint: AccountInfo = ld64(sf0 + 0x40)
												if (position_bundle_mint.is_writable == 0) {
													anchor_error_from(s428, 0x7d0 /* anchor::ConstraintMut */)
													af = Error_with_account_name(s438, ld64(s428), ld64(s428 + 8), "position_bundle_mint", 0x14)
													ae = ld64(s438)
													st64(a + 0x10, ld64(s438 + 8))
													st64(a + 8, ae)
													st32(a, 2)
													return af
												}
												if (position_bundle_mint.is_signer == 0) {
													anchor_error_from(s408, 0x7d2 /* anchor::ConstraintSigner */)
													af = Error_with_account_name(s418, ld64(s408), ld64(s408 + 8), "position_bundle_mint", 0x14)
													ae = ld64(s418)
													st64(a + 0x10, ld64(s418 + 8))
													st64(a + 8, ae)
													st32(a, 2)
													return af
												}
												AccountInfo_clone(s48, position_bundle_mint)
												st64(s518, fn_143100(s48))
												AccountInfo_clone(sa8, ld64(sf0 + 0x40))
												AccountInfo_try_data_len(s18, sa8)
												const bu = ld64(s18 + 8)
												const bt = ld64(s18)
												if (bt != 0x800000000000001a /* Ok */) {
													st64(s18 + 0x10, ld64(s18 + 0x10))
													st64(s18, bt, bu)
													af = fn_13b430(s2d8, s18)
													const cg = ld64(s2d8)
													st64(a + 0x10, ld64(s2d8 + 8))
													st64(a + 8, cg)
													st32(a, 2)
													const ci = ld64(sa0 + 8)
													const ch = ld64(sa0)
													rc_dec(ch)
													rc_dec(ci)
													bp = ld64(s48 + 0x10)
													const cj = ld64(s48 + 8)
													rc_dec(cj)
													if (!rc_release(bp)) {
														return af
													}
													st64(bp + 8, ld64(bp + 8) - 1)
													return af
												}
												const bv = __floatundidf(ld64(s138) * (bu + 0x80))
												const bw = fn_14f7f8(ld64(s138 + 8), bv)
												st64(s528, fn_151cb0(bw, 0))
												const bx = fn_14f3e8(bw)
												const by = 0 > (ld64(s528) as i64) ? 0 : bx
												const cf = (fn_151a40(bw, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : by
												const ca = ld64(sa0 + 8)
												const bz = ld64(sa0)
												rc_dec(bz)
												rc_dec(ca)
												const cd = ld64(s48 + 0x10)
												const cb = ld64(s48 + 8)
												let cc = ld64(cb) - 1
												st64(cb, cc)
												if (cc == 0) {
													cc = ld64(cb + 8) - 1
													st64(cb + 8, cc)
												}
												let ce = ld64(cd) - 1
												st64(cd, ce)
												if (ce == 0) {
													ce = ld64(cd + 8) - 1
													st64(cd + 8, ce)
												}
												if (cf > ld64(s518)) {
													anchor_error_from(s3e8, 0x7d5 /* anchor::ConstraintRentExempt */, ce, cc)
													af = Error_with_account_name(s3f8, ld64(s3e8), ld64(s3e8 + 8), "position_bundle_mint", 0x14)
													ae = ld64(s3f8)
													st64(a + 0x10, ld64(s3f8 + 8))
													st64(a + 8, ae)
													st32(a, 2)
													return af
												}
												rent_get(sa8)
												const cp = ld64(sa0 + 8)
												const co = ld64(sa0)
												if (ld64(sa8) != 0) {
													st32(s48, ld32(s90 + 1))
													st32(s48 + 3, ld32(s90 + 4))
													const da = ld8(s90)
													st32(sa0 + 0xc, ld32(s48 + 3))
													st32(sa0 + 9, ld32(s48))
													st8(sa0 + 8, da)
													st64(sa8, co, cp)
													af = fn_13b430(s2e8, sa8)
													ae = ld64(s2e8)
													st64(a + 0x10, ld64(s2e8 + 8))
													st64(a + 8, ae)
													st32(a, 2)
													return af
												}
												st64(sa8, s1c0, s198, s1b0, s1b8, s108, s1a0, s1a8)
												af = fn_a4608(s48, sa8)
												st64(s518, ld64(s48 + 8))
												ae = ld64(s48)
												if (ae == 2) {
													const position_bundle_token_account: AccountInfo = ld64(ld64(s518))
													if (position_bundle_token_account.is_writable == 0) {
														anchor_error_from(s3c8, 0x7d0 /* anchor::ConstraintMut */)
														af = Error_with_account_name(s3d8, ld64(s3c8), ld64(s3c8 + 8), "position_bundle_token_account", 0x1d)
														ae = ld64(s3d8)
														st64(a + 0x10, ld64(s3d8 + 8))
														st64(a + 8, ae)
														st32(a, 2)
														return af
													}
													st64(s528, s48)
													AccountInfo_clone(s48, position_bundle_token_account)
													st64(s530, fn_143100(ld64(s528)))
													const cl = ld64(ld64(s518))
													st64(s528, sa8)
													AccountInfo_clone(sa8, cl)
													AccountInfo_try_data_len(s18, ld64(s528))
													const cn = ld64(s18 + 8)
													const cm = ld64(s18)
													if (cm != 0x800000000000001a /* Ok */) {
														st64(s18 + 0x10, ld64(s18 + 0x10))
														st64(s18, cm, cn)
														af = fn_13b430(s2f8, s18)
														const db = ld64(s2f8)
														st64(a + 0x10, ld64(s2f8 + 8))
														st64(a + 8, db)
														st32(a, 2)
														const dd = ld64(sa0 + 8)
														const dc = ld64(sa0)
														rc_dec(dc)
														rc_dec(dd)
														bp = ld64(s48 + 0x10)
														const de = ld64(s48 + 8)
														rc_dec(de)
														if (!rc_release(bp)) {
															return af
														}
														st64(bp + 8, ld64(bp + 8) - 1)
														return af
													}
													const cq = fn_14f7f8(cp, __floatundidf((cn + 0x80) * co))
													st64(s528, fn_151cb0(cq, 0))
													const cr = fn_14f3e8(cq)
													const cs = 0 > (ld64(s528) as i64) ? 0 : cr
													const cz = (fn_151a40(cq, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : cs
													const cu = ld64(sa0 + 8)
													const ct = ld64(sa0)
													rc_dec(ct)
													rc_dec(cu)
													const cx = ld64(s48 + 0x10)
													const cv = ld64(s48 + 8)
													let cw = ld64(cv) - 1
													st64(cv, cw)
													if (cw == 0) {
														cw = ld64(cv + 8) - 1
														st64(cv + 8, cw)
													}
													let cy = ld64(cx) - 1
													st64(cx, cy)
													if (cy == 0) {
														cy = ld64(cx + 8) - 1
														st64(cx + 8, cy)
													}
													if (cz > ld64(s530)) {
														anchor_error_from(s3a8, 0x7d5 /* anchor::ConstraintRentExempt */, cy, cw)
														af = Error_with_account_name(s3b8, ld64(s3a8), ld64(s3a8 + 8), "position_bundle_token_account", 0x1d)
														ae = ld64(s3b8)
														st64(a + 0x10, ld64(s3b8 + 8))
														st64(a + 8, ae)
														st32(a, 2)
														return af
													}
													if (position_bundle_metadata[2].is_writable != 0) {
														const funder: AccountInfo = ld64(s1b0)
														if (funder.is_writable != 0) {
															const dg = ld64(ld64(s500 + 0x18))
															copyr(s48, dg, 0x20)
															if ((memcmp(s48, 0x100152dd0 /* key 3axbTs2z5GBy6usVbNVoqEgZMng3vZvMnAoX29BFfwhr */, 0x20) as u32) != 0) {
																anchor_error_from(s308, 0x7dc /* anchor::ConstraintAddress */)
																const dp = Error_with_account_name(s318, ld64(s308), ld64(s308 + 8), "metadata_update_auth", 0x14)
																const dn = ld64(s318 + 8)
																const dm = ld64(s318)
																copyr(sa8, s48, 0x20)
																st64(s88, 0xf0e597ddae666a26, 0x3999c6e408d67144, 0x93d0cdb3999d7ad7, 0x69d20a916bfe8911) // key 3axbTs2z5GBy6usVbNVoqEgZMng3vZvMnAoX29BFfwhr
																af = fn_13b5c0(s328, dm, dn, sa8, dp)
																ae = ld64(s328)
																st64(a + 0x10, ld64(s328 + 8))
																st64(a + 8, ae)
																st32(a, 2)
																return af
															}
															const dh = ld64(s1a8)
															const di = ld64(dh)
															copy(s48, di, 0x20)
															if ((memcmp(s48, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) == 0) {
																af = memcpy(a, s108, 0x60)
																const dr = ld64(s198)
																const dq = ld64(s1a0)
																st64(a + 0x78, ld64(s1b8))
																st64(a + 0x60, ld64(s520))
																st64(a + 0x68, ld64(s500 + 0x20))
																st64(a + 0x70, ld64(s518))
																st64(a + 0x80, funder)
																st64(a + 0x88, ld64(s500 + 0x18))
																st64(a + 0x90, dh, dq)
																copy(a + 0xa0, s500, 0x18)
																st64(a + 0xb8, ld64(s508))
																st64(a + 0xc0, dr)
																st64(a + 0xc8, ld64(s510))
																return af
															}
															anchor_error_from(s338, 0x7dc /* anchor::ConstraintAddress */)
															const dl = Error_with_account_name(s348, ld64(s338), ld64(s338 + 8), "token_program", 0xd)
															const dk = ld64(s348 + 8)
															const dj = ld64(s348)
															copyr(sa8, s48, 0x20)
															st64(s88, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
															af = fn_13b5c0(s358, dj, dk, sa8, dl)
															ae = ld64(s358)
															st64(a + 0x10, ld64(s358 + 8))
															st64(a + 8, ae)
															st32(a, 2)
															return af
														}
														anchor_error_from(s368, 0x7d0 /* anchor::ConstraintMut */, cy, cw)
														af = Error_with_account_name(s378, ld64(s368), ld64(s368 + 8), "funder", 6)
														ae = ld64(s378)
														st64(a + 0x10, ld64(s378 + 8))
														st64(a + 8, ae)
														st32(a, 2)
														return af
													}
													anchor_error_from(s388, 0x7d0 /* anchor::ConstraintMut */, cy, cw)
													af = Error_with_account_name(s398, ld64(s388), ld64(s388 + 8), "position_bundle_metadata", 0x18)
													ae = ld64(s398)
													st64(a + 0x10, ld64(s398 + 8))
													st64(a + 8, ae)
													st32(a, 2)
													return af
												}
												st64(a + 0x10, ld64(s518))
												st64(a + 8, ae)
												st32(a, 2)
												return af
											}
											st64(a + 0x10, aw)
											st64(a + 8, ae)
											st32(a, 2)
											return af
										}
										anchor_error_from(s288, 0x7d6 /* anchor::ConstraintSeeds */)
										Error_with_account_name(s298, ld64(s288), ld64(s288 + 8), "position_bundle", 0xf)
										const av = ld64(s298 + 8)
										const au = ld64(s298)
										const ao = ld64(ld64(s1d0))
										const at = ld64(ao + 0x18)
										const ar = ld64(ao + 0x10)
										const aq = ld64(ao + 8)
										const ap = ld64(ao)
										copy(s88, s160, 0x20)
										st64(sa8, ap, aq, ar, at)
										af = fn_13b5c0(s2a8, au, av, sa8, aq)
										ae = ld64(s2a8)
										st64(a + 0x10, ld64(s2a8 + 8))
										st64(a + 8, ae)
										st32(a, 2)
										return af
									}
									af = fn_13b430(s278, s178)
									ae = ld64(s278)
									st64(a + 0x10, ld64(s278 + 8))
									st64(a + 8, ae)
									st32(a, 2)
									return af
								}
								af = Error_with_account_name(s268, ac, ad, "metadata_program", 0x10)
								ae = ld64(s268)
								st64(a + 0x10, ld64(s268 + 8))
								st64(a + 8, ae)
								st32(a, 2)
								return af
							}
							af = Error_with_account_name(s258, aa, ab, "associated_token_program", 0x18)
							ae = ld64(s258)
							st64(a + 0x10, ld64(s258 + 8))
							st64(a + 8, ae)
							st32(a, 2)
							return af
						}
						af = Error_with_account_name(s248, v, w, "system_program", 0xe)
						ae = ld64(s248)
						st64(a + 0x10, ld64(s248 + 8))
						st64(a + 8, ae)
						st32(a, 2)
						return af
					}
					af = Error_with_account_name(s238, t, u, "token_program", 0xd)
					ae = ld64(s238)
					st64(a + 0x10, ld64(s238 + 8))
					st64(a + 8, ae)
					st32(a, 2)
					return af
				}
				af = Error_with_account_name(s208, m, n, "funder", 6)
				ae = ld64(s208)
				st64(a + 0x10, ld64(s208 + 8))
				st64(a + 8, ae)
				st32(a, 2)
				return af
			}
			anchor_error_from(s498, 0xbbd /* anchor::AccountNotEnoughKeys */, f - 1, h, e)
			j = undef
			h = undef
			e = undef
			const i = ld64(s498)
			if (i == 2) {
				af = anchor_error_from(s4b8, 0xbbd /* anchor::AccountNotEnoughKeys */, j, h, e)
				ae = ld64(s4b8)
				st64(a + 0x10, ld64(s4b8 + 8))
				st64(a + 8, ae)
				st32(a, 2)
				return af
			}
			af = Error_with_account_name(s4a8, i, ld64(s498 + 8), "position_bundle_metadata", 0x18)
			ae = ld64(s4a8)
			st64(a + 0x10, ld64(s4a8 + 8))
			st64(a + 8, ae)
			st32(a, 2)
			return af
		}
		af = anchor_error_from(s4c8, 0xbbd /* anchor::AccountNotEnoughKeys */, f - 1, d, e)
		ae = ld64(s4c8)
		st64(a + 0x10, ld64(s4c8 + 8))
		st64(a + 8, ae)
		st32(a, 2)
		return af
	}
	af = anchor_error_from(s4d8, 0xbbd /* anchor::AccountNotEnoughKeys */, c, d, e)
	ae = ld64(s4d8)
	st64(a + 0x10, ld64(s4d8 + 8))
	st64(a + 8, ae)
	st32(a, 2)
	return af
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

function fn_6a310(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64, p13: u64): u64 {
	const s18 = fp - 0x18, s90 = fp - 0x90, sb8 = fp - 0xb8, sc8 = fp - 0xc8, s110 = fp - 0x110, s138 = fp - 0x138, s250 = fp - 0x250, s270 = fp - 0x270, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2f0 = fp - 0x2f0, s328 = fp - 0x328, s330 = fp - 0x330, s338 = fp - 0x338, s340 = fp - 0x340, s348 = fp - 0x348, s350 = fp - 0x350, s358 = fp - 0x358, s360 = fp - 0x360, s368 = fp - 0x368, s370 = fp - 0x370, s378 = fp - 0x378, s380 = fp - 0x380, s388 = fp - 0x388, s390 = fp - 0x390, s398 = fp - 0x398, s3a0 = fp - 0x3a0, s3a8 = fp - 0x3a8, s3b0 = fp - 0x3b0, s3b8 = fp - 0x3b8, s3c0 = fp - 0x3c0, s3c8 = fp - 0x3c8, s3d0 = fp - 0x3d0, s3d8 = fp - 0x3d8, s3e0 = fp - 0x3e0, s3e8 = fp - 0x3e8, s3f0 = fp - 0x3f0, s3f8 = fp - 0x3f8, s400 = fp - 0x400, s408 = fp - 0x408, s410 = fp - 0x410, s418 = fp - 0x418, s420 = fp - 0x420, s428 = fp - 0x428, s430 = fp - 0x430, s438 = fp - 0x438, s440 = fp - 0x440, s448 = fp - 0x448, s450 = fp - 0x450, s458 = fp - 0x458, s460 = fp - 0x460, s468 = fp - 0x468, s470 = fp - 0x470, s478 = fp - 0x478, s480 = fp - 0x480, s488 = fp - 0x488, s490 = fp - 0x490, s498 = fp - 0x498, s4a0 = fp - 0x4a0
	let y, ck: u64
	st64(s2f0 + 0x20, b)
	st64(s2f0 + 0x30, a)
	const k = ld64(p5)
	const j = ld64(d + 0x58)
	const i = ld64(c)
	const h = ld64(p9)
	const f = p12
	const g = p13
	st64(s2f0 + 0x28, i)
	st64(s2f0 + 0x18, j)
	let cg = fn_6b9a8(s298, i, j, k, h, f, g)
	let cl = ld64(s298 + 8)
	let l = ld64(s298)
	if (l != 2) {
		ck = ld64(s2f0 + 0x30)
		st64(ck, l, cl)
		return cg
	}
	st64(s2f0, g, f)
	st64(s328, h, p11)
	st64(s2f0 + 0x10, p10)
	st64(s328 + 0x30, p8)
	st64(s328 + 0x10, p7)
	st64(s328 + 0x20, p6)
	const m: AccountInfo = ld64(s2f0 + 0x18)
	const n = m.key
	copyr(sb8, n, 0x20)
	st64(s18, 0, 1, 0)
	st64(s250, s18, 0x100159480)
	st8(s250 + 0x18, 3)
	st64(s250 + 0x10, 0x20)
	st64(s270 + 0x10, 0)
	st64(s270, 0)
	const o = fn_145330(sb8, s270, undef, undef, l, h)
	if (o == 0) {
		const p = ld64(0x300000000 /* heap bump-allocator cursor */)
		const av: AccountInfo = ld64(s2f0 + 0x28)
		const q = p != 0 ? sat_sub(p, 0x14) : 0x300007fec
		if (q > 0x300000007) {
			const u = ld64(s18 + 0x10)
			const v = ld64(s18 + 8)
			st64(0x300000000 /* heap bump-allocator cursor */, q)
			st64(q + 8, 0x7542206e6f697469)
			st64(q, 0x736f50206163724f)
			st32(q + 0x10, 0x656c646e)
			st64(s288, 0x14, q, 0x14)
			fn_ead8(s288, 0x14, 1, 0x14 > p, undef, o)
			const s = ld64(s288 + 0x10)
			let r = ld64(s288 + 8)
			st8(r + s, 0x20)
			let t = s + 1
			st64(s288 + 0x10, t)
			if (u > 4) {
				y = v
				if (-0x41 >= (ld8(v + 4) as i8)) {
					fn_14d330(y, u, 0, 4, 0x10015a1e0)
				}
			} else {
				y = v
				if (u != 4) {
					fn_14d330(y, u, 0, 4, 0x10015a1e0)
				}
			}
			let w = ld64(s288)
			const x = w - t
			if (3 >= x) {
				fn_ead8(s288, t, 4, x, undef, y)
				w = ld64(s288)
				r = ld64(s288 + 8)
				t = ld64(s288 + 0x10)
			}
			let z = r + t
			let aa = ld32(y)
			st32(z, aa)
			let ab = t + 4
			st64(s288 + 0x10, ab)
			if (2 >= w - ab) {
				fn_ead8(s288, ab, 3, z, aa, y)
				z = undef
				aa = undef
				r = ld64(s288 + 8)
				ab = ld64(s288 + 0x10)
			}
			const ac = r + ab
			st8(ac + 2, 0x2e2e)
			st16(ac, 0x2e2e)
			let ad = ab + 3
			st64(s288 + 0x10, ad)
			if (u != 4 && -0x41 >= (ld8(y + (u - 4)) as i8)) {
				fn_14d330(y, u, u - 4, u, 0x10015a1f8)
			}
			const ae = y + (u - 4)
			if (3 >= ld64(s288) - ad) {
				fn_ead8(s288, ad, 4, z, aa, ae)
				ad = ld64(s288 + 0x10)
			}
			st32(ld64(s288 + 8) + ad, ld32(ae))
			st64(s288 + 0x10, ad + 4)
			const af: AccountInfo = ld64(ld64(s328 + 0x30))
			const ag: LamportsCell = af.lamports
			const ah = ag.strong
			st64(s328 + 0x30, af.key)
			rc_inc(ag, ah)
			const ai: DataCell = af.data
			const aj = ai.strong
			st64(s328 + 0x28, ag)
			st64(s330, ai)
			rc_inc(ai, aj)
			const ak: AccountInfo = ld64(ld64(s328 + 0x20))
			const al: LamportsCell = ak.lamports
			const am = al.strong
			st64(s358, af.executable)
			st64(s350, af.is_writable)
			st64(s348, af.is_signer)
			st64(s340, af.rent_epoch)
			st64(s338, af.owner)
			const an = ak.key
			rc_inc(al, am)
			st64(s360, an)
			const ao: DataCell = ak.data
			const ap = ao.strong
			st64(s368, ao)
			const aq = ld64(s2f0 + 0x20)
			rc_inc(ao, ap)
			const ar: LamportsCell = m.lamports
			const at = ar.strong
			st64(s398, m.key)
			st64(s390, ak.executable)
			st64(s388, ak.is_writable)
			st64(s380, ak.is_signer)
			st64(s378, ak.rent_epoch)
			st64(s370, ak.owner)
			rc_inc(ar, at)
			const au: DataCell = m.data
			rc_inc(au)
			const aw: LamportsCell = av.lamports
			const ax = aw.strong
			st64(s3c8, av.key)
			st64(s3c0, m.executable)
			st64(s3b8, m.is_writable)
			st64(s3b0, m.is_signer)
			st64(s3a8, m.rent_epoch)
			st64(s3a0, m.owner)
			rc_inc(aw, ax)
			const ay: DataCell = av.data
			const az = ay.strong
			st64(s3d0, aw)
			rc_inc(ay, az)
			st64(s328 + 0x18, ar)
			const ba: AccountInfo = ld64(ld64(s328 + 0x10))
			const bb: LamportsCell = ba.lamports
			st64(s328 + 0x20, bb)
			const bc = bb.strong
			st64(s3f8, av.executable)
			st64(s3f0, av.is_writable)
			st64(s3e8, av.is_signer)
			st64(s3e0, av.rent_epoch)
			st64(s3d8, av.owner)
			st64(s400, ba.key)
			rc_inc(ld64(s328 + 0x20), bc)
			const bd: DataCell = ba.data
			const be = bd.strong
			st64(s408, bd)
			rc_inc(bd, be)
			const bf: AccountInfo = ld64(aq)
			const bg: LamportsCell = bf.lamports
			st64(s2f0 + 0x20, bg)
			const bh = bg.strong
			st64(s438, ba.executable)
			st64(s430, ba.is_writable)
			st64(s428, ba.is_signer)
			st64(s420, ba.rent_epoch)
			st64(s418, ba.owner)
			st64(s410, bf.key)
			rc_inc(ld64(s2f0 + 0x20), bh)
			const bi: DataCell = bf.data
			const bj = bi.strong
			st64(s440, bi)
			rc_inc(bi, bj)
			const bk: AccountInfo = ld64(ld64(s328 + 8))
			const bl: LamportsCell = bk.lamports
			st64(s328 + 0x10, bl)
			const bm = bl.strong
			st64(s328 + 8, al)
			st64(s460, bf.executable)
			st64(s458, bf.is_writable)
			st64(s450, bf.is_signer)
			st64(s448, bf.rent_epoch)
			const bs = bf.owner
			st64(s468, bk.key)
			rc_inc(ld64(s328 + 0x10), bm)
			const bn: DataCell = bk.data
			const bo = bn.strong
			st64(s470, au)
			rc_inc(bn, bo)
			const bp: AccountInfo = ld64(ld64(s2f0 + 0x10))
			const bq: LamportsCell = bp.lamports
			const br = bq.strong
			st64(s490, bk.executable)
			st64(s488, bk.is_writable)
			st64(s480, bk.is_signer)
			st64(s478, bk.rent_epoch)
			st64(s2f0 + 0x10, bk.owner)
			const ca = bp.key
			rc_inc(bq, br)
			st64(s498, bs)
			const bt: DataCell = bp.data
			const bu = bt.strong
			st64(s4a0, ay)
			rc_inc(bt, bu)
			const bz = bp.owner
			const by = bp.rent_epoch
			const bx = bp.is_signer
			const bw = bp.is_writable
			const bv = bp.executable
			st8(s110 + 0x32, ld64(s490))
			st8(s110 + 0x31, ld64(s488))
			st8(s110 + 0x30, ld64(s480))
			st64(s110 + 0x28, ld64(s478))
			st64(s110 + 0x20, ld64(s2f0 + 0x10))
			st64(s110 + 0x18, bn)
			st64(s110 + 0x10, ld64(s328 + 0x10))
			st64(s110 + 8, ld64(s468))
			st8(s110, bx, bw, bv)
			st64(s138, ca, bq, bt, bz, by)
			st8(s250 + 0x112, ld64(s438))
			st8(s250 + 0x111, ld64(s430))
			st8(s250 + 0x110, ld64(s428))
			st64(s250 + 0x108, ld64(s420))
			st64(s250 + 0x100, ld64(s418))
			st64(s250 + 0xf8, ld64(s408))
			st64(s250 + 0xf0, ld64(s328 + 0x20))
			st64(s250 + 0xe8, ld64(s400))
			st8(s250 + 0xe2, ld64(s460))
			st8(s250 + 0xe1, ld64(s458))
			st8(s250 + 0xe0, ld64(s450))
			st64(s250 + 0xd8, ld64(s448))
			st64(s250 + 0xd0, ld64(s498))
			st64(s250 + 0xc8, ld64(s440))
			st64(s250 + 0xc0, ld64(s2f0 + 0x20))
			st64(s250 + 0xb8, ld64(s410))
			st8(s250 + 0xb2, ld64(s3f8))
			st8(s250 + 0xb1, ld64(s3f0))
			st8(s250 + 0xb0, ld64(s3e8))
			st64(s250 + 0xa8, ld64(s3e0))
			st64(s250 + 0xa0, ld64(s3d8))
			st64(s250 + 0x98, ld64(s4a0))
			st64(s250 + 0x90, ld64(s3d0))
			st64(s250 + 0x88, ld64(s3c8))
			st8(s250 + 0x82, ld64(s3c0))
			st8(s250 + 0x81, ld64(s3b8))
			st8(s250 + 0x80, ld64(s3b0))
			st64(s250 + 0x78, ld64(s3a8))
			st64(s250 + 0x70, ld64(s3a0))
			st64(s250 + 0x68, ld64(s470))
			st64(s250 + 0x60, ld64(s328 + 0x18))
			st64(s250 + 0x58, ld64(s398))
			st8(s250 + 0x52, ld64(s390))
			st8(s250 + 0x51, ld64(s388))
			st8(s250 + 0x50, ld64(s380))
			st64(s250 + 0x48, ld64(s378))
			st64(s250 + 0x40, ld64(s370))
			st64(s250 + 0x38, ld64(s368))
			st64(s250 + 0x30, ld64(s328 + 8))
			st64(s250 + 0x28, ld64(s360))
			st64(sc8 + 8, ld64(s2f0))
			st64(sc8, ld64(s2f0 + 8))
			st8(s250 + 0x22, ld64(s358))
			st8(s250 + 0x21, ld64(s350))
			st8(s250 + 0x20, ld64(s348))
			st64(s250 + 0x18, ld64(s340))
			st64(s250 + 0x10, ld64(s338))
			st64(s250 + 8, ld64(s330))
			st64(s250, ld64(s328 + 0x28))
			st64(s270 + 0x18, ld64(s328 + 0x30))
			st64(s110 + 0x38, sc8)
			st32(s250 + 0x23, ld32(sb8))
			st8(s250 + 0x27, ld8(sb8 + 4))
			st64(s270, 0, 8, 0)
			st64(s110 + 0x40, 1)
			const cb = ld64(0x300000000 /* heap bump-allocator cursor */)
			const cf = ld64(s2f0 + 0x18)
			const cc = cb != 0 ? sat_sub(cb, 3) : 0x300007ffd
			if (cc > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, cc)
				st8(cc + 2, 0x42)
				st16(cc, 0x504f)
				const cd = ld64(0x300000000 /* heap bump-allocator cursor */)
				const ce = cd != 0 ? sat_sub(cd, 0x3f) : 0x300007fc1
				if (ce > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, ce)
					memcpy(ce, "https://arweave.net/A_Wo8dx2_3lSUwMIi7bdT_sqxi8soghRNAWXXiqXpgE", 0x3f)
					st64(s90 + 0x10, ce)
					st64(sb8 + 0x20, cc)
					st64(s90 + 0x20, 0x8000000000000000)
					copy(sb8, s288, 0x18)
					st16(s90 + 0x50, 0)
					st64(s90 + 0x18, 0x3f)
					st64(s90, 3, 0x3f)
					st64(sb8 + 0x18, 3)
					st8(s90 + 0x52, 2)
					st8(s90 + 0x48, 3)
					st8(s18, 2)
					fn_128fc0(s2a8, s270, sb8, 1, 0, s18)
					cl = ld64(s2a8 + 8)
					l = ld64(s2a8)
					const ci = ld64(s2f0 + 0x28)
					const cj = ld64(s328)
					cg = ld64(s2f0 + 8)
					const ch = ld64(s2f0)
					if (l != 2) {
						ck = ld64(s2f0 + 0x30)
						st64(ck, l, cl)
						return cg
					}
					cg = fn_6c748(s2b8, ci, cf, cj, cg, ch)
					cl = ld64(s2b8 + 8)
					ck = ld64(s2f0 + 0x30)
					st64(ck, ld64(s2b8))
					st64(ck + 8, cl)
					return cg
				}
				raw_vec_handle_error(1, 0x3f, cd - 0x3f, 0x3f > cd, bx)
			}
			raw_vec_handle_error(1, 3, cb - 3, 3 > cb, bx)
		}
		raw_vec_handle_error(1, 0x14, sat_sub(p, 0x14), 0x14 > p)
	}
	fn_149678("a Display implementation returned an error unexpectedly", 0x37, sc8, 0x1001594b0, 0x1001594d0)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_bundle, position_bundle_mint, position_bundle_token_account
function fn_ab200(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78
	let n, p: u64
	fn_7f28(s28, ld64(b + 0x60), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const f = ld64(s28)
	if (f != 2) {
		n = Error_with_account_name(s38, f, ld64(s28 + 8), "position_bundle", 0xf)
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
					n = Error_with_account_name(s58, l, ld64(s48 + 8), "position_bundle_mint", 0x14)
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
	const q = ld64(ld64(b + 0x70))
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
		n = Error_with_account_name(s78, t, ld64(s68 + 8), "position_bundle_token_account", 0x1d)
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

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_bundle
function fn_a7c90(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s88 = fp - 0x88, s89 = fp - 0x89, sb0 = fp - 0xb0, sc0 = fp - 0xc0, se8 = fp - 0xe8, s128 = fp - 0x128, s148 = fp - 0x148, s168 = fp - 0x168, s180 = fp - 0x180, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s200 = fp - 0x200, s218 = fp - 0x218, s220 = fp - 0x220, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s300 = fp - 0x300, s308 = fp - 0x308, s338 = fp - 0x338, s340 = fp - 0x340, s348 = fp - 0x348, s350 = fp - 0x350
	let aw, dc, dd, de: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s2b8, f, b)
	if (g != 0) {
		const p = ld64(ld64(b + 0x10))
		st64(s300 + 0x30, p)
		const q = ld64(p)
		copyr(s38, q + 8, 0x18)
		st64(s300 + 0x38, q)
		st64(s40, ld64(q))
		const r = ld64(f)
		copyr(s238, r, 0x20)
		if ((memcmp(s40, s238, 0x20) as u32) == 0) {
			ErrorCode_name(s180, 0x100152d40)
			st64(sb0, 0, 1, 0)
			st64(s20, sb0, 0x100159480)
			st8(s20 + 0x18, 3)
			st64(s20 + 0x10, 0x20)
			st64(s38 + 8, 0)
			st64(s40, 0)
			if (ErrorCode_fmt(0x100152d40, s40) == 0) {
				copyr(s200, sb0, 0x18)
				copy(s218, s180, 0x18)
				st64(s238 + 8, 0x10015497d)
				st32(s1b8 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s1e8, 2)
				st32(s220, 9)
				st64(s238 + 0x10, 0x4f)
				st64(s238, 0)
				const ba = fn_13b3a8(s278, s238)
				const az = ld64(s278 + 8)
				const ay = ld64(s278)
				const ax = ld64(s300 + 0x38)
				copyr(s238, ax, 0x20)
				copy(s218, r, 0x20)
				de = fn_13b5c0(s288, ay, az, s238, ba)
				const bb = ld64(s288)
				st64(a + 8, ld64(s288 + 8))
				st64(a, bb)
				return de
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s238, 0x1001594b0, 0x1001594d0)
		}
		st64(s300 + 0x28, r)
		st64(s300 + 0x40, a)
		const s = ld64(b + 8)
		const t = __floatundidf(ld64(s) * 0x108)
		const u = fn_14f7f8(ld64(s + 8), t)
		const v = fn_151cb0(u, 0)
		const w = fn_14f3e8(u)
		const x = max((fn_151a40(u, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (v as i64) ? 0 : w, 1)
		let bd: AccountInfo = ld64(s2b8)
		let bj = ld64(s2b8 + 8)
		if (x > g) {
			const y: AccountInfo = ld64(s300 + 0x30)
			const z: LamportsCell = y.lamports
			rc_inc(z)
			const bc: DataCell = y.data
			rc_inc(bc)
			const be: LamportsCell = bd.lamports
			const bf = be.strong
			st64(s300 + 8, bd.key)
			st64(s300 + 0x10, y.executable)
			st64(s300 + 0x18, y.is_writable)
			st64(s300 + 0x20, y.is_signer)
			st64(s300 + 0x28, y.rent_epoch)
			const bi = y.owner
			rc_inc(be, bf)
			const bg: DataCell = bd.data
			const bh = bg.strong
			st64(s300 + 0x30, bi)
			rc_inc(bg, bh)
			const bk: AccountInfo = ld64(ld64(bj + 0x18))
			const bl: LamportsCell = bk.lamports
			const bm = bl.strong
			st64(s300, sat_sub(x, g))
			st64(s338 + 0x10, bd.executable)
			st64(s338 + 0x18, bd.is_writable)
			st64(s338 + 0x20, bd.is_signer)
			st64(s338 + 0x28, bd.rent_epoch)
			st64(s308, bd.owner)
			const bp = bk.key
			rc_inc(bl, bm)
			const bn: DataCell = bk.data
			const bo = bn.strong
			st64(s338, z, bp)
			rc_inc(bn, bo)
			st64(s340, bk.owner)
			const bt = bk.rent_epoch
			const bs = bk.is_signer
			const br = bk.is_writable
			const bq = bk.executable
			st8(se8 + 0x22, ld64(s338 + 0x10))
			st8(se8 + 0x21, ld64(s338 + 0x18))
			st8(se8 + 0x20, ld64(s338 + 0x20))
			st64(se8 + 0x18, ld64(s338 + 0x28))
			st64(se8 + 0x10, ld64(s308))
			st64(se8, be, bg)
			st64(s128 + 0x38, ld64(s300 + 8))
			st8(s128 + 0x32, ld64(s300 + 0x10))
			st8(s128 + 0x31, ld64(s300 + 0x18))
			st8(s128 + 0x30, ld64(s300 + 0x20))
			st64(s128 + 0x28, ld64(s300 + 0x28))
			st64(s128 + 0x20, ld64(s300 + 0x30))
			st64(s128 + 0x18, bc)
			st64(s128 + 0x10, ld64(s338))
			st64(s128 + 8, ld64(s300 + 0x38))
			st8(s128, bs, br, bq)
			st64(s148 + 0x18, bt)
			st64(s148 + 0x10, ld64(s340))
			st64(s148, bl, bn)
			st64(s168 + 0x18, ld64(s338 + 8))
			st64(sc0, 8, 0)
			st64(s168, 0, 8, 0)
			de = fn_13d318(s248, s168, ld64(s300))
			aw = ld64(s248)
			if (aw != 2) {
				dd = ld64(s248 + 8)
				dc = ld64(s300 + 0x40)
				st64(dc, aw, dd)
				return de
			}
			bd = ld64(s2b8)
			st64(s300 + 0x28, bd.key)
			bj = ld64(s2b8 + 8)
		}
		const bu: LamportsCell = bd.lamports
		rc_inc(bu)
		const bv: DataCell = bd.data
		rc_inc(bv)
		const bw: AccountInfo = ld64(ld64(bj + 0x18))
		const bx: LamportsCell = bw.lamports
		const by = bx.strong
		st64(s300 + 0x20, bd.executable)
		st64(s300 + 0x30, bd.is_writable)
		st64(s300 + 0x38, bd.is_signer)
		const cc = bd.rent_epoch
		const cd = bd.owner
		const cb = bw.key
		rc_inc(bx, by)
		const bz: DataCell = bw.data
		const ca = bz.strong
		st64(s308, cb, cc, cd, bv, bu)
		rc_inc(bz, ca)
		st64(s338 + 0x28, bw.owner)
		st64(s338 + 0x20, bw.rent_epoch)
		const ci = bw.is_signer
		const ch = bw.is_writable
		const cg = bw.executable
		const ce = ld64(s2b8 + 8)
		const cf = ld64(ld64(ce + 0x20))
		copyr(sb0, cf, 0x20)
		const cj = ld8(ld64(ce + 0x28))
		st64(s20, s89)
		st64(s38 + 8, sb0)
		st64(s40, 0x100152e73)
		st64(s180, s40)
		st64(s1c8 + 8, s180)
		st8(s1c8, ci, ch, cg)
		st64(s1e8 + 0x18, ld64(s338 + 0x20))
		st64(s1e8 + 0x10, ld64(s338 + 0x28))
		st64(s1e8, bx, bz)
		st64(s1f8 + 8, ld64(s308))
		st8(s1f8 + 2, ld64(s300 + 0x20))
		st8(s1f8 + 1, ld64(s300 + 0x30))
		st8(s1f8, ld64(s300 + 0x38))
		st64(s200, ld64(s300))
		st64(s218 + 0x10, ld64(s300 + 8))
		st64(s218 + 8, ld64(s300 + 0x10))
		st64(s218, ld64(s300 + 0x18))
		st64(s220, ld64(s300 + 0x28))
		st64(s300 + 0x38, cj)
		st8(s89, cj)
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 0xf)
		st64(s180 + 8, 3)
		st64(s1b8, 1)
		st64(s238, 0, 8, 0)
		de = fn_13c8b8(s258, s238, 0x88)
		aw = ld64(s258)
		if (aw != 2) {
			dd = ld64(s258 + 8)
			dc = ld64(s300 + 0x40)
			st64(dc, aw, dd)
			return de
		}
		const ck: AccountInfo = ld64(s2b8)
		const cl: LamportsCell = ck.lamports
		const cs = ck.key
		rc_inc(cl)
		const cm: DataCell = ck.data
		rc_inc(cm)
		const cn: LamportsCell = bw.lamports
		const co = cn.strong
		st64(s300 + 0x10, bw.key)
		st64(s300 + 0x18, ck.executable)
		st64(s300 + 0x20, ck.is_writable)
		st64(s300 + 0x28, ck.is_signer)
		st64(s300 + 0x30, ck.rent_epoch)
		const cr = ck.owner
		rc_inc(cn, co)
		const cp: DataCell = bw.data
		const cq = cp.strong
		st64(s308, cr, cs, cl)
		rc_inc(cp, cq)
		const cx = bw.owner
		const cw = bw.rent_epoch
		const cv = bw.is_signer
		const cu = bw.is_writable
		const ct = bw.executable
		copyr(sb0, cf, 0x20)
		st64(s20, s89)
		st64(s38 + 8, sb0)
		st64(s40, 0x100152e73)
		st64(s180, s40)
		st64(s1c8 + 8, s180)
		st8(s1c8, cv, cu, ct)
		st64(s1e8, cn, cp, cx, cw)
		st64(s1f8 + 8, ld64(s300 + 0x10))
		st8(s1f8 + 2, ld64(s300 + 0x18))
		st8(s1f8 + 1, ld64(s300 + 0x20))
		st8(s1f8, ld64(s300 + 0x28))
		st64(s200, ld64(s300 + 0x30))
		st64(s218 + 0x10, ld64(s308))
		st64(s218 + 8, cm)
		copyr(s220, s300, 0x10)
		st8(s89, ld64(s300 + 0x38))
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 0xf)
		st64(s180 + 8, 3)
		st64(s1b8, 1)
		st64(s238, 0, 8, 0)
		de = fn_13cc48(s268, s238, ld64(ld64(ld64(s2b8 + 8) + 0x30)))
		aw = ld64(s268)
		if (aw != 2) {
			dd = ld64(s268 + 8)
			dc = ld64(s300 + 0x40)
			st64(dc, aw, dd)
			return de
		}
	} else {
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0x108)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const ad = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		const m = ld64(s2b8 + 8)
		const n: AccountInfo = ld64(ld64(m + 0x10))
		const o: LamportsCell = n.lamports
		const aa = n.key
		const ae = ld64(s2b8)
		rc_inc(o)
		st64(s300 + 0x38, aa)
		const ab: DataCell = n.data
		const ac = ab.strong
		st64(s300 + 0x30, ab)
		rc_inc(ab, ac)
		const af = ld64(ae + 8)
		const ag = ld64(af)
		st64(s300, ld64(ae))
		st64(s300 + 8, n.executable)
		st64(s300 + 0x10, n.is_writable)
		st64(s300 + 0x18, n.is_signer)
		st64(s300 + 0x20, n.rent_epoch)
		st64(s300 + 0x28, n.owner)
		rc_inc(af, ag)
		const ah = ld64(ae + 0x10)
		rc_inc(ah)
		const ai: AccountInfo = ld64(ld64(m + 0x18))
		const aj: LamportsCell = ai.lamports
		const ak = aj.strong
		st64(s308, o)
		const al: AccountInfo = ld64(s2b8)
		st64(s338 + 8, al.executable)
		st64(s338 + 0x10, al.is_writable)
		st64(s338 + 0x18, al.is_signer)
		st64(s338 + 0x20, al.rent_epoch)
		st64(s338 + 0x28, al.owner)
		const ao = ai.key
		rc_inc(aj, ak)
		const am: DataCell = ai.data
		const an = am.strong
		st64(s340, ao, ad)
		st64(s300 + 0x40, a)
		rc_inc(am, an)
		st64(s348, ai.owner)
		st64(s350, ai.rent_epoch)
		const av = ai.is_signer
		const au = ai.is_writable
		const at = ai.executable
		const ap = ld64(s2b8 + 8)
		const aq = ld64(ld64(ap + 0x20))
		copyr(sb0, aq, 0x20)
		const ar = ld8(ld64(ap + 0x28))
		st64(s20, s89)
		st64(s38 + 8, sb0)
		st64(s40, 0x100152e73)
		st8(s89, ar)
		st64(s180, s40)
		st64(s1b8 + 0x28, s180)
		st8(s1b8 + 0x22, ld64(s338 + 8))
		st8(s1b8 + 0x21, ld64(s338 + 0x10))
		st8(s1b8 + 0x20, ld64(s338 + 0x18))
		st64(s1b8 + 0x18, ld64(s338 + 0x20))
		st64(s1b8 + 0x10, ld64(s338 + 0x28))
		st64(s1b8, af, ah)
		st64(s1c8 + 8, ld64(s300))
		st8(s1c8 + 2, ld64(s300 + 8))
		st8(s1c8 + 1, ld64(s300 + 0x10))
		st8(s1c8, ld64(s300 + 0x18))
		st64(s1e8 + 0x18, ld64(s300 + 0x20))
		st64(s1e8 + 0x10, ld64(s300 + 0x28))
		st64(s1e8 + 8, ld64(s300 + 0x30))
		st64(s1e8, ld64(s308))
		st64(s1f8 + 8, ld64(s300 + 0x38))
		st8(s1f8, av, au, at)
		st64(s200, ld64(s350))
		st64(s218 + 0x10, ld64(s348))
		st64(s218, aj, am)
		st64(s220, ld64(s340))
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 0xf)
		st64(s180 + 8, 3)
		st64(s1b8 + 0x30, 1)
		st64(s238, 0, 8, 0)
		de = fn_13cfd8(s298, s238, ld64(s338), 0x88, ld64(ld64(ap + 0x30)))
		aw = ld64(s298)
		if (aw != 2) {
			dd = ld64(s298 + 8)
			dc = ld64(s300 + 0x40)
			st64(dc, aw, dd)
			return de
		}
	}
	const da = ld64(s300 + 0x40)
	fn_3240(s88, ld64(s2b8))
	if (ld64(s88) == 0) {
		de = Error_with_account_name(s2a8, ld64(s88 + 8), ld64(s88 + 0x10), "position_bundle", 0xf)
		const db = ld64(s2a8)
		st64(da + 8, ld64(s2a8 + 8))
		st64(da, db)
		return de
	}
	const cy = ld64(0x300000000 /* heap bump-allocator cursor */)
	const cz = cy != 0 ? sat_sub(cy, 0x48) & -8 : 0x300007fb8
	if (cz > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, cz)
		de = memcpy(cz, s88, 0x48)
		st64(da + 8, cz)
		st64(da, 2)
		return de
	}
	alloc_handle_alloc_error(8, 0x48)
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

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_bundle_mint
function fn_a9730(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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
				st64(s260, 0x10015497d)
				st32(s1d8 + 8, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s218, 2)
				st32(s260 + 0x10, 9)
				st64(s260 + 8, 0x4f)
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
			dv = Error_with_account_name(s2e8, ld64(s260), ld64(s260 + 8), "position_bundle_mint", 0x14)
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

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_bundle_token_account
function fn_a4608(a: u64, b: u64): u64 {
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

function fn_6b9a8(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64): u64 {
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

function fn_145330(a: u64, b: u64, c: u64, d: u64, e: u64, r7: u64): u64 {
	return fn_144d50(b, a, a, d, e, r7)
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

function fn_14d330(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14d338(a, b, c, d, e)
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

function fn_6c748(a: u64, b: u64, c: AccountInfo, d: AccountInfo, p5: u64, p6: u64): u64 {
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

function fn_7f28(a: u64, b: u64, c: u64, d: u64): u64 {
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

function fn_3240(a: u64, b: u64) {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_149478(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	const s20 = fp - 0x20, s28 = fp - 0x28
	st64(s20, 0x10015b8e0, a, b)
	st16(s20 + 0x18, 1)
	st64(s28, 1)
	fn_147238(s28, b, c, d, e)
}

function fn_14d338(a: u64, b: u64, c: u64, d: u64, e: u64): never {
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

function fn_104ee8(a: u64, b: u64, c: u64, d: u64, e: u64) {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_147238(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	fn_1478b8(a, b, c, d, e)
}

function fn_14f060(a: u64, b: u64): u64 {
	return fn_14ecd0(ld64(a), 1, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (value), e (value)
function fn_14c690(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c698(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), e (value)
function fn_1490e8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_1494c8("called `Option::unwrap()` on a `None` value", 0x2b, a, d, e)
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
function fn_14c4f0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c4f8(a, b, c, d, e)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_1478b8(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	custom_panic(a, b, c, d, e)
	abort()
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: e (value)
function fn_1494c8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s10 = fp - 0x10, s38 = fp - 0x38, s40 = fp - 0x40
	st64(s40, s10)
	st64(s10, a, b)
	st64(s38, 1, 8, 0, 0)
	fn_149478(s40, c, c, s10, e)
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
