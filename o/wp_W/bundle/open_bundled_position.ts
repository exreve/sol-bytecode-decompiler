// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction open_bundled_position: handler + 33 reachable functions
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
interface TokenAccount extends sized<0xb8> { // Account<TokenAccount> (anchor_spl, SPL Token Account) as unpacked in memory (fields [known: spl_token::state layout] at the offsets a run of try_accounts_11f50 put them [offsets from exec]; info = the &AccountInfo)
	info:             at<0x00, ref<AccountInfo>> // &AccountInfo
	mint:             at<0x08, Pubkey>
	owner:            at<0x28, Pubkey>
	amount:           at<0x48, u64>
	delegate:         at<0x54, Pubkey> // COption<Pubkey>
	is_native:        at<0x80, u64> // COption<u64>
	delegated_amount: at<0x88, u64>
	close_authority:  at<0x94, Pubkey> // COption<Pubkey>
}
interface OpenBundledPositionAccounts { // Accounts struct of instruction open_bundled_position as accounts_open_bundled_position returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	position_bundle_token_account: at<0x10, ref<TokenAccount>> // Box<Account<TokenAccount>>
	position_bundle_authority:     at<0x18, ref<AccountInfo>>
	funder:                        at<0x28, ref<AccountInfo>>
}
interface OpenBundledPositionContext { // anchor_lang Context of instruction open_bundled_position (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<OpenBundledPositionAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_log_data(slices: u64, len: u64): void // log base64 data: slices = &[&[u8]]
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function ptr_drop_in_place_c1b0(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 4]>
declare function fn_fa00(a: u64, b: u64): u64 // lib
declare function AccountInfo_clone(a: u64, b: u64): void // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11990(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11a48(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11bb8(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11f50(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_122e8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_1390d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcmp, AccountInfo_try_borrow_lamports, AccountInfo_try_borrow_data
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
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
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
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
declare function fn_151bf8(a: u64, b: u64): u64 // lib
declare function fn_151cb0(a: u64, b: u64): u64 // lib
declare function __ashlti3(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib __ashlti3

// instruction handler: open_bundled_position (discriminator sha256("global:open_bundled_position")[..8] = 0x31d4acd5ab7e71a9)
// accounts [str: the program's account-error strings, in order of first use]: position_bundle, position_bundle_token_account, whirlpool, rent, bundled_position, funder, system_program, position_bundle_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: bundled_position, position_bundle
function ix_open_bundled_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s40 = fp - 0x40, s48 = fp - 0x48, s58 = fp - 0x58, s98 = fp - 0x98, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sc1 = fp - 0xc1, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s1000 = fp - 0x1000
	let j, o: u64
	sol_log("Instruction: OpenBundledPosition", 0x20)
	const f = ix_args_len
	if (f >= 2 && (f - 2 >= 4 && f - 6 >= 4)) {
		const g = ix_args
		const r = ld16(g)
		const q = ld32(g + 2)
		const p = ld32(g + 6)
		st8(sc1, 0xff)
		st64(sc0, accounts, accounts_len)
		st64(s1000, f, sc1)
		o = accounts_open_bundled_position(s58, program_id, sc0, g, fp)
		const i = ld64(s48)
		j = ld64(s58 + 8)
		const h = ld64(s58)
		if (h == 0) {
			st64(a + 8, i)
			st64(a, j)
			return o
		}
		memcpy(s98, s40, 0x40)
		st64(sb0, h, j, i)
		st8(s40 + 8, ld8(sc1))
		copyr(s48, sc0, 0x10)
		st64(s58, program_id, sb0)
		o = fn_338a0(sd8, s58, r, q, p)
		j = ld64(sd8)
		if (j == 2) {
			fn_5a40(se8, ld64(sb0), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
			const k = ld64(se8)
			if (k != 2) {
				o = Error_with_account_name(sf8, k, ld64(se8 + 8), "bundled_position", 0x10)
				j = ld64(sf8)
				st64(a + 8, ld64(sf8 + 8))
				st64(a, j)
				return o
			}
			o = fn_7f28(s108, ld64(sb0 + 8), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
			const l = ld64(s108)
			if (l == 2) {
				st64(a + 8, i)
				st64(a, 2)
				return o
			}
			o = Error_with_account_name(s118, l, ld64(s108 + 8), "position_bundle", 0xf)
			j = ld64(s118)
			st64(a + 8, ld64(s118 + 8))
			st64(a, j)
			return o
		}
		st64(a + 8, ld64(sd8 + 8))
		st64(a, j)
		return o
	}
	const m = fn_1459d0(0x100159468)
	if (2 > (m & 3) - 2) {
		o = anchor_error_from(s128, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s128)
		st64(a + 8, ld64(s128 + 8))
		st64(a, j)
		return o
	}
	if ((m & 3) == 0) {
		o = anchor_error_from(s128, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s128)
		st64(a + 8, ld64(s128 + 8))
		st64(a, j)
		return o
	}
	const n = ld64(ld64(m + 7))
	callx(n, ld64(m - 1), n)
	o = anchor_error_from(s128, 0x66 /* anchor::InstructionDidNotDeserialize */)
	j = ld64(s128)
	st64(a + 8, ld64(s128 + 8))
	st64(a, j)
	return o
}

// Anchor Accounts::try_accounts of instruction open_bundled_position (called by ix_open_bundled_position; name [str]: from the handler's "Instruction: …" log; was fn_b2f30)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_bundle (ConstraintMut), position_bundle_token_account (ConstraintRaw), whirlpool, rent, bundled_position (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), funder (ConstraintMut), system_program, position_bundle_authority
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_bundle_token_account_box, bundled_position, funder
function accounts_open_bundled_position(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s270 = fp - 0x270, s288 = fp - 0x288, s290 = fp - 0x290, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2d8 = fp - 0x2d8, s2f8 = fp - 0x2f8, s2f9 = fp - 0x2f9, s320 = fp - 0x320, s338 = fp - 0x338, s350 = fp - 0x350, s358 = fp - 0x358, s360 = fp - 0x360, s368 = fp - 0x368, s36a = fp - 0x36a, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s548 = fp - 0x548, s550 = fp - 0x550, s558 = fp - 0x558, s560 = fp - 0x560, s568 = fp - 0x568, s570 = fp - 0x570
	let aj, ak: u64
	st64(s378, b)
	if (2 > ld64(e - 0x1000)) {
		const k = fn_1459d0(0x100159468)
		if (2 > (k & 3) - 2) {
			ak = anchor_error_from(s518, 0x66 /* anchor::InstructionDidNotDeserialize */)
			aj = ld64(s518)
			st64(a + 0x10, ld64(s518 + 8))
			st64(a + 8, aj)
			st64(a, 0)
			return ak
		}
		if ((k & 3) == 0) {
			ak = anchor_error_from(s518, 0x66 /* anchor::InstructionDidNotDeserialize */)
			aj = ld64(s518)
			st64(a + 0x10, ld64(s518 + 8))
			st64(a + 8, aj)
			st64(a, 0)
			return ak
		}
		const l = ld64(ld64(k + 7))
		callx(l, ld64(k - 1), l)
		ak = anchor_error_from(s518, 0x66 /* anchor::InstructionDidNotDeserialize */)
		aj = ld64(s518)
		st64(a + 0x10, ld64(s518 + 8))
		st64(a + 8, aj)
		st64(a, 0)
		return ak
	}
	const i = ld64(e - 0xff8)
	st16(s36a, ld16(d))
	const f = ld64(c + 8)
	if (f == 0) {
		ak = anchor_error_from(s508, 0xbbd /* anchor::AccountNotEnoughKeys */, c, d, e)
		aj = ld64(s508)
		st64(a + 0x10, ld64(s508 + 8))
		st64(a + 8, aj)
		st64(a, 0)
		return ak
	}
	const g: AccountInfo = ld64(c)
	st64(s368, g)
	st64(c + 8, f - 1)
	st64(c, g + 0x30)
	try_accounts_11bb8(s290, c, c, d, e)
	if (ld64(s290) == 0) {
		ak = Error_with_account_name(s4f8, ld64(s288), ld64(s288 + 8), "position_bundle", 0xf)
		aj = ld64(s4f8)
		st64(a + 0x10, ld64(s4f8 + 8))
		st64(a + 8, aj)
		st64(a, 0)
		return ak
	}
	const h = ld64(0x300000000 /* heap bump-allocator cursor */)
	st64(s548 + 0x28, i)
	const j = h != 0 ? sat_sub(h, 0x48) & -8 : 0x300007fb8
	if (j > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		memcpy(j, s290, 0x48)
		try_accounts_11f50(s290, c)
		if (ld32(s270 + 0x70) == 2) {
			ak = Error_with_account_name(s4e8, ld64(s290), ld64(s288), "position_bundle_token_account", 0x1d)
			aj = ld64(s4e8)
			st64(a + 0x10, ld64(s4e8 + 8))
			st64(a + 8, aj)
			st64(a, 0)
			return ak
		}
		const m = ld64(0x300000000 /* heap bump-allocator cursor */)
		const position_bundle_token_account_box: TokenAccount = m != 0 ? sat_sub(m, 0xb8) & -8 : 0x300007f48
		if (position_bundle_token_account_box > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, position_bundle_token_account_box)
			memcpy(position_bundle_token_account_box, s290, 0xb8)
			try_accounts_11718(s290, c)
			const p = ld64(s288)
			const o = ld64(s290)
			if (o == 2) {
				st64(s548 + 0x20, p)
				try_accounts_11a48(s290, c, p)
				if (ld64(s290) == 0) {
					ak = Error_with_account_name(s4d8, ld64(s288), ld64(s288 + 8), 0x100152b28 /* "whirlpool" */, 9)
					aj = ld64(s4d8)
					st64(a + 0x10, ld64(s4d8 + 8))
					st64(a + 8, aj)
					st64(a, 0)
					return ak
				}
				const q = ld64(0x300000000 /* heap bump-allocator cursor */)
				const r = q != 0 ? sat_sub(q, 0x290) & -8 : 0x300007d70
				if (r > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, r)
					st64(s548 + 0x18, r)
					memcpy(r, s290, 0x290)
					try_accounts_11718(s290, c)
					const t = ld64(s288)
					const s = ld64(s290)
					if (s == 2) {
						st64(s360, t)
						fn_122e8(s290, c, t)
						const v = ld64(s288)
						const u = ld64(s290)
						if (u == 2) {
							st64(s358, v)
							try_accounts_11990(s290, c, v)
							const y = ld64(s288 + 8)
							const x = ld64(s288)
							const w = ld64(s290)
							if (w == 0) {
								ak = Error_with_account_name(s4c8, x, y, 0x100152d60 /* "rent" */, 4)
								aj = ld64(s4c8)
								st64(a + 0x10, ld64(s4c8 + 8))
								st64(a + 8, aj)
								st64(a, 0)
								return ak
							}
							st64(s548, w, x, y)
							const z = ld64(s288 + 0x10)
							rent_get(s290)
							copy(s338, s288, 0x18)
							if (ld64(s290) == 0) {
								st64(s550, z)
								copyr(s350, s338, 0x18)
								copyr(s2f8, j + 8, 0x20)
								fn_b9c0(s2d8, s36a)
								st64(s288 + 8, s2f8)
								st64(s290, 0x100153000)
								copyr(s270, s2d0, 0x10)
								st64(s288 + 0x10, 0x20)
								st64(s288, 0x10)
								// PDA find_program_address(["bundled_position", *s2f8, ?], program *(ld64(s378)))
								Pubkey_find_program_address(s2c0, s290, 3, ld64(s378))
								copyr(s320, s2c0, 0x20)
								const aa = ld8(s2c0 + 0x20)
								st8(s2f9, aa)
								st8(ld64(s548 + 0x28), aa)
								const ab = ld64(ld64(s368))
								copy(s290, ab, 0x20)
								if ((memcmp(s290, s320, 0x20) as u32) == 0) {
									st64(s548 + 0x28, position_bundle_token_account_box)
									st64(s290, s368, s350, s360, s358, j, s36a, s2f9, s378)
									ak = fn_b4498(s2c0, s290)
									const al = ld64(s2c0 + 8)
									aj = ld64(s2c0)
									if (aj == 2) {
										const bundled_position: AccountInfo = ld64(al)
										if (bundled_position.is_writable == 0) {
											anchor_error_from(s4a8, 0x7d0 /* anchor::ConstraintMut */)
											ak = Error_with_account_name(s4b8, ld64(s4a8), ld64(s4a8 + 8), "bundled_position", 0x10)
											aj = ld64(s4b8)
											st64(a + 0x10, ld64(s4b8 + 8))
											st64(a + 8, aj)
											st64(a, 0)
											return ak
										}
										AccountInfo_clone(s2c0, bundled_position)
										st64(s558, fn_143100(s2c0))
										AccountInfo_clone(s290, ld64(al))
										AccountInfo_try_data_len(s2f8, s290)
										const ao = ld64(s2f8 + 8)
										const an = ld64(s2f8)
										if (an != 0x800000000000001a /* Ok */) {
											st64(s2f8 + 0x10, ld64(s2f8 + 0x10))
											st64(s2f8, an, ao)
											ak = fn_13b430(s3f8, s2f8)
											const bb = ld64(s3f8)
											st64(a + 0x10, ld64(s3f8 + 8))
											st64(a + 8, bb)
											st64(a, 0)
											const bd = ld64(s288 + 8)
											const bc = ld64(s288)
											rc_dec(bc)
											rc_dec(bd)
											const bf = ld64(s2c0 + 0x10)
											const be = ld64(s2c0 + 8)
											rc_dec(be)
											if (!rc_release(bf)) {
												return ak
											}
											st64(bf + 8, ld64(bf + 8) - 1)
											return ak
										}
										const ap = __floatundidf(ld64(s350) * (ao + 0x80))
										const aq = fn_14f7f8(ld64(s350 + 8), ap)
										st64(s560, 0)
										st64(s570, fn_151cb0(aq, 0))
										st64(s568, aq)
										const ar = fn_14f3e8(aq)
										if ((ld64(s570) as i64) >= 0) {
											st64(s560, ar)
										}
										const at = fn_151a40(ld64(s568), 0x43efffffffffffff)
										let ba = -1
										if (0 >= (at as i64)) {
											ba = ld64(s560)
										}
										const av = ld64(s288 + 8)
										const au = ld64(s288)
										rc_dec(au)
										rc_dec(av)
										const ay = ld64(s2c0 + 0x10)
										const aw = ld64(s2c0 + 8)
										let ax = ld64(aw) - 1
										st64(aw, ax)
										if (ax == 0) {
											ax = ld64(aw + 8) - 1
											st64(aw + 8, ax)
										}
										let az = ld64(ay) - 1
										st64(ay, az)
										if (az == 0) {
											az = ld64(ay + 8) - 1
											st64(ay + 8, az)
										}
										if (ba > ld64(s558)) {
											anchor_error_from(s488, 0x7d5 /* anchor::ConstraintRentExempt */, az, ax)
											ak = Error_with_account_name(s498, ld64(s488), ld64(s488 + 8), "bundled_position", 0x10)
											aj = ld64(s498)
											st64(a + 0x10, ld64(s498 + 8))
											st64(a + 8, aj)
											st64(a, 0)
											return ak
										}
										if (ld8(ld64(j) + 0x29) != 0) {
											ak = memcmp(ld64(s548 + 0x28) + 8, j + 8, 0x20) as u32
											if (ak == 0) {
												if (ld64(ld64(s548 + 0x28) + 0x48) != 1) {
													anchor_error_from(s428, 0x7d3 /* anchor::ConstraintRaw */)
													ak = Error_with_account_name(s438, ld64(s428), ld64(s428 + 8), "position_bundle_token_account", 0x1d)
													aj = ld64(s438)
													st64(a + 0x10, ld64(s438 + 8))
													st64(a + 8, aj)
													st64(a, 0)
													return ak
												}
												const funder: AccountInfo = ld64(s360)
												if (funder.is_writable == 0) {
													anchor_error_from(s448, 0x7d0 /* anchor::ConstraintMut */)
													ak = Error_with_account_name(s458, ld64(s448), ld64(s448 + 8), "funder", 6)
													aj = ld64(s458)
													st64(a + 0x10, ld64(s458 + 8))
													st64(a + 8, aj)
													st64(a, 0)
													return ak
												}
												const bh = ld64(s358)
												st64(a + 0x50, ld64(s550))
												st64(a + 0x48, ld64(s548 + 0x10))
												st64(a + 0x40, ld64(s548 + 8))
												st64(a + 0x38, ld64(s548))
												st64(a + 0x30, bh)
												st64(a + 0x28, funder)
												st64(a + 0x20, ld64(s548 + 0x18))
												st64(a + 0x18, ld64(s548 + 0x20))
												st64(a + 0x10, ld64(s548 + 0x28))
												st64(a + 8, j)
												st64(a, al)
												return ak
											}
											anchor_error_from(s408, 0x7d3 /* anchor::ConstraintRaw */)
											ak = Error_with_account_name(s418, ld64(s408), ld64(s408 + 8), "position_bundle_token_account", 0x1d)
											aj = ld64(s418)
											st64(a + 0x10, ld64(s418 + 8))
											st64(a + 8, aj)
											st64(a, 0)
											return ak
										}
										anchor_error_from(s468, 0x7d0 /* anchor::ConstraintMut */, az, ax)
										ak = Error_with_account_name(s478, ld64(s468), ld64(s468 + 8), "position_bundle", 0xf)
										aj = ld64(s478)
										st64(a + 0x10, ld64(s478 + 8))
										st64(a + 8, aj)
										st64(a, 0)
										return ak
									}
									st64(a + 0x10, al)
									st64(a + 8, aj)
									st64(a, 0)
									return ak
								}
								anchor_error_from(s3c8, 0x7d6 /* anchor::ConstraintSeeds */)
								Error_with_account_name(s3d8, ld64(s3c8), ld64(s3c8 + 8), "bundled_position", 0x10)
								const ai = ld64(s3d8 + 8)
								const ah = ld64(s3d8)
								const ac = ld64(ld64(s368))
								const ag = ld64(ac + 0x18)
								const af = ld64(ac + 0x10)
								const ae = ld64(ac + 8)
								const ad = ld64(ac)
								copy(s270, s320, 0x20)
								st64(s290, ad, ae, af, ag)
								ak = fn_13b5c0(s3e8, ah, ai, s290, ae)
								aj = ld64(s3e8)
								st64(a + 0x10, ld64(s3e8 + 8))
								st64(a + 8, aj)
								st64(a, 0)
								return ak
							}
							ak = fn_13b430(s3b8, s338)
							aj = ld64(s3b8)
							st64(a + 0x10, ld64(s3b8 + 8))
							st64(a + 8, aj)
							st64(a, 0)
							return ak
						}
						ak = Error_with_account_name(s3a8, u, v, "system_program", 0xe)
						aj = ld64(s3a8)
						st64(a + 0x10, ld64(s3a8 + 8))
						st64(a + 8, aj)
						st64(a, 0)
						return ak
					}
					ak = Error_with_account_name(s398, s, t, "funder", 6)
					aj = ld64(s398)
					st64(a + 0x10, ld64(s398 + 8))
					st64(a + 8, aj)
					st64(a, 0)
					return ak
				}
				alloc_handle_alloc_error(8, 0x290)
			}
			ak = Error_with_account_name(s388, o, p, "position_bundle_authority", 0x19)
			aj = ld64(s388)
			st64(a + 0x10, ld64(s388 + 8))
			st64(a + 8, aj)
			st64(a, 0)
			return ak
		}
		alloc_handle_alloc_error(8, 0xb8)
	}
	alloc_handle_alloc_error(8, 0x48)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: e (value), d (value), c (value)
// types [heur]: b: OpenBundledPositionContext (the handler ix_open_bundled_position passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_338a0(a: u64, b: OpenBundledPositionContext, c: u64, d: u64, e: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s40 = fp - 0x40, s48 = fp - 0x48, s58 = fp - 0x58, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, sd8 = fp - 0xd8, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let h, q, r, ad: u64
	st64(sd0, d, e)
	const accounts: OpenBundledPositionAccounts = b.accounts
	const g = ld64(accounts + 0x20)
	if ((memcmp(g + 0x148, 0x100152180, 0x20) as u32) == 0 && (ld16(g + 0xc8) & 1) != 0) {
		ad = fn_87630(sc0, 0x43)
		h = ld64(sc0)
		st64(a + 8, ld64(sc0 + 8))
		st64(a, h)
		return ad
	}
	ad = fn_5ffd0(s80, accounts.position_bundle_token_account.mint, accounts + 0x18)
	h = ld64(s80)
	if (h == 2) {
		ad = fn_4c1a0(s90, accounts + 0x28, ld64(accounts), accounts + 0x30)
		h = ld64(s90)
		if (h == 2) {
			B11: {
				let l = 0x2b
				if (0xff >= (c as u16)) {
					const k = 1 << (c & 7)
					const i = ld64(accounts + 8) + ((c & 0xfff8) >> 3)
					l = 0x2c
					const j = ld8(i + 0x28)
					if ((j & k) == 0) {
						st8(i + 0x28, j ^ k)
						break B11
					}
				}
				ad = fn_87630(sa0, l)
				const ac = ld64(sa0 + 8)
				h = ld64(sa0)
				if (h != 2) {
					st64(a + 8, ac)
					st64(a, h)
					return ad
				}
			}
			const m = ld64(accounts + 0x20)
			const o = ld16(m + 0x284)
			const n = ld64(m + 0x240)
			st64(s1000, ld64(m + 0x238))
			st64(sff8, n)
			ad = fn_60930(s48, ld64(sd0), ld64(sd0 + 8), o, ld64(s1000), n)
			h = ld64(s48)
			if (h != 2) {
				st64(a + 8, ld64(s40))
				st64(a, h)
				return ad
			}
			B24: {
				r = ld32(s40)
				q = ld32(s40 + 4)
				st64(sd0 + 8, ld64(accounts + 0x20))
				st64(sd0, ld64(accounts))
				const p = ld64(accounts + 8)
				copyr(s48, p + 8, 0x20)
				let w = 0xa
				if ((((r as i32) - 0x6c4f5) as u32) >= 0xfff27617) {
					const s = ld16(ld64(sd0 + 8) + 0x284)
					if (s == 0) {
						fn_14e1c0(0x100159f48, s, 0xfff27617)
					}
					st64(sd8, s)
					const t = fn_151bf8(r as i32, s)
					w = 0xa
					if ((((q as i32) - 0x6c4f5) as u32) >= 0xfff27617 && (t as u32) == 0) {
						const u = fn_151bf8(q as i32, ld64(sd8))
						w = 0xa
						if ((q as i32) > (r as i32) && (u as u32) == 0) {
							if ((ld64(sd8) as i16) > -1) {
								break B24
							}
							w = 0x36
							const v = 0x6c4f4 % ld64(sd8)
							if (v - 0x6c4f4 == (r as i32) && 0x6c4f4 - v == (q as i32)) {
								break B24
							}
						}
					}
				}
				ad = fn_87630(sb0, w)
				h = ld64(sb0)
				if (h != 2) {
					st64(a + 8, ld64(sb0 + 8))
					st64(a, h)
					return ad
				}
			}
			const x = ld64(sd0)
			const y = ld64(ld64(ld64(sd0 + 8)))
			st64(x + 0x20, ld64(y + 0x18))
			st64(x + 0x18, ld64(y + 0x10))
			st64(x + 0x10, ld64(y + 8))
			st64(x + 8, ld64(y))
			copy(x + 0x30, s40, 0x18)
			st64(x + 0x28, ld64(s48))
			st32(x + 0xd0, r as i32, q as i32)
			const z = ld64(ld64(ld64(accounts + 0x20)))
			copyr(s48, z, 0x20)
			const aa = ld64(ld64(ld64(accounts)))
			copy(s20, aa + 8, 0x18)
			const ab = ld64(aa)
			st32(s8, r as i32, q as i32)
			st64(s40 + 0x18, ab)
			fn_88c18(s60, s48)
			copyr(s70, s58, 0x10)
			ad = log_data(s70, 1)
			st64(a + 8, undef)
			st64(a, 2)
			return ad
		}
		st64(a + 8, ld64(s90 + 8))
		st64(a, h)
		return ad
	}
	st64(a + 8, ld64(s80 + 8))
	st64(a, h)
	return ad
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_b9c0(a: u64, b: u64) {
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

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: bundled_position
function fn_b4498(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s40 = fp - 0x40, s48 = fp - 0x48, s58 = fp - 0x58, s60 = fp - 0x60, s138 = fp - 0x138, s158 = fp - 0x158, s178 = fp - 0x178, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1e0 = fp - 0x1e0, s220 = fp - 0x220, s240 = fp - 0x240, s260 = fp - 0x260, s2c8 = fp - 0x2c8, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f8 = fp - 0x2f8, s300 = fp - 0x300, s310 = fp - 0x310, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s418 = fp - 0x418, s428 = fp - 0x428, s430 = fp - 0x430, s438 = fp - 0x438, s440 = fp - 0x440, s448 = fp - 0x448, s450 = fp - 0x450
	let bp, db, dd, de, df: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s398, f, b)
	if (g != 0) {
		const o = ld64(ld64(b + 0x10))
		st64(s3e0 + 0x28, o)
		const p = ld64(o)
		copyr(s40, p + 8, 0x18)
		st64(s3e0 + 0x30, p)
		st64(s48, ld64(p))
		const q = ld64(f)
		copyr(s310, q + 8, 0x18)
		st64(s3e0 + 0x38, q)
		st64(s318, ld64(q))
		if ((memcmp(s48, s318, 0x20) as u32) == 0) {
			ErrorCode_name(s158, 0x100152d40)
			st64(s198, 0, 1, 0)
			st64(s28, s198, 0x100159480)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s40 + 8, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100152d40, s48) == 0) {
				copyr(s2e0, s198, 0x18)
				copy(s2f8, s158, 0x18)
				st64(s310, 0x100154a4a)
				st32(s2c8 + 0x48, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s2c8, 2)
				st32(s300, 0xc)
				st64(s310 + 8, 0x3c)
				st64(s318, 0)
				const av = fn_13b3a8(s358, s318)
				const au = ld64(s358 + 8)
				const at = ld64(s358)
				const aq = ld64(s3e0 + 0x30)
				copyr(s318, aq, 0x20)
				const ar = ld64(s3e0 + 0x38)
				copy(s2f8, ar, 0x20)
				df = fn_13b5c0(s368, at, au, s318, av)
				const aw = ld64(s368)
				st64(a + 8, ld64(s368 + 8))
				st64(a, aw)
				return df
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1, 0x1001594b0, 0x1001594d0)
		}
		st64(s3e0 + 0x40, a)
		const r = ld64(b + 8)
		const s = __floatundidf(ld64(r) * 0x158)
		const t = fn_14f7f8(ld64(r + 8), s)
		const u = fn_151cb0(t, 0)
		const v = fn_14f3e8(t)
		const w = fn_151a40(t, 0x43efffffffffffff)
		let ay: AccountInfo = ld64(s398)
		const x = max((w as i64) > 0 ? 0xffffffffffffffff : 0 > (u as i64) ? 0 : v, 1)
		let bs = ld64(s398 + 8)
		if (x > g) {
			const y: AccountInfo = ld64(s3e0 + 0x28)
			const z: LamportsCell = y.lamports
			rc_inc(z)
			const ax: DataCell = y.data
			rc_inc(ax)
			const az: LamportsCell = ay.lamports
			const ba = az.strong
			st64(s3e0 + 0x10, ay.key)
			st64(s3e0 + 0x18, y.executable)
			st64(s3e0 + 0x20, y.is_writable)
			st64(s3e0 + 0x38, y.is_signer)
			const bd = y.rent_epoch
			const be = y.owner
			rc_inc(az, ba)
			const bb: DataCell = ay.data
			const bc = bb.strong
			st64(s3e0 + 8, bd)
			st64(s3e0 + 0x28, be)
			rc_inc(bb, bc)
			const bf: AccountInfo = ld64(ld64(ld64(s398 + 8) + 0x18))
			const bg: LamportsCell = bf.lamports
			const bh = bg.strong
			st64(s3e0, sat_sub(x, g))
			st64(s418 + 0x10, ay.executable)
			st64(s418 + 0x18, ay.is_writable)
			st64(s418 + 0x20, ay.is_signer)
			st64(s3f0, ay.rent_epoch)
			st64(s3f0 + 8, ay.owner)
			const bk = bf.key
			rc_inc(bg, bh)
			const bi: DataCell = bf.data
			const bj = bi.strong
			st64(s418, z, bk)
			rc_inc(bi, bj)
			st64(s428 + 8, bf.owner)
			const bo = bf.rent_epoch
			const bn = bf.is_signer
			const bm = bf.is_writable
			const bl = bf.executable
			st8(s1e0 + 0x22, ld64(s418 + 0x10))
			st8(s1e0 + 0x21, ld64(s418 + 0x18))
			st8(s1e0 + 0x20, ld64(s418 + 0x20))
			st64(s1e0 + 0x18, ld64(s3f0))
			st64(s1e0 + 0x10, ld64(s3f0 + 8))
			st64(s1e0, az, bb)
			st64(s220 + 0x38, ld64(s3e0 + 0x10))
			st8(s220 + 0x32, ld64(s3e0 + 0x18))
			st8(s220 + 0x31, ld64(s3e0 + 0x20))
			st8(s220 + 0x30, ld64(s3e0 + 0x38))
			st64(s220 + 0x28, ld64(s3e0 + 8))
			st64(s220 + 0x20, ld64(s3e0 + 0x28))
			st64(s220 + 0x18, ax)
			st64(s220 + 0x10, ld64(s418))
			st64(s220 + 8, ld64(s3e0 + 0x30))
			st8(s220, bn, bm, bl)
			st64(s240 + 0x18, bo)
			st64(s240 + 0x10, ld64(s428 + 8))
			st64(s240, bg, bi)
			st64(s260 + 0x18, ld64(s418 + 8))
			st64(s1b8, 8, 0)
			st64(s260, 0, 8, 0)
			df = fn_13d318(s328, s260, ld64(s3e0))
			bp = ld64(s328)
			if (bp != 2) {
				de = ld64(s328 + 8)
				dd = ld64(s3e0 + 0x40)
				st64(dd, bp, de)
				return df
			}
			ay = ld64(s398)
			st64(s3e0 + 0x38, ay.key)
			bs = ld64(s398 + 8)
		}
		const bq: LamportsCell = ay.lamports
		rc_inc(bq)
		const br: DataCell = ay.data
		rc_inc(br)
		const bt: AccountInfo = ld64(ld64(bs + 0x18))
		const bu: LamportsCell = bt.lamports
		const bv = bu.strong
		st64(s3e0 + 0x28, ay.executable)
		st64(s3e0 + 0x30, ay.is_writable)
		const by = ay.is_signer
		const bz = ay.rent_epoch
		const ca = ay.owner
		st64(s3e0 + 0x20, bt.key)
		rc_inc(bu, bv)
		const bw: DataCell = bt.data
		const bx = bw.strong
		st64(s3f0, by, bz, ca, bu, br, bq)
		rc_inc(bw, bx)
		st64(s418, bt.executable)
		st64(s418 + 8, bt.is_writable)
		st64(s418 + 0x10, bt.is_signer)
		st64(s418 + 0x18, bt.rent_epoch)
		st64(s418 + 0x20, bt.owner)
		const cb = ld64(s398 + 8)
		const cc = ld64(cb + 0x20)
		copyr(s198, cc + 8, 0x20)
		const cd = ld64(cb + 0x28)
		st64(s158, 0, 1, 0)
		st64(s2f8, s158, 0x100159480)
		st8(s2e0, 3)
		st64(s2f8 + 0x10, 0x20)
		st64(s310 + 8, 0)
		st64(s318, 0)
		st64(s428 + 8, cd)
		if (fn_14efa0(cd, s318) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1, 0x1001594b0, 0x1001594d0)
		}
		const cf = ld64(s158 + 8)
		const ce = ld64(s158 + 0x10)
		const cg = ld8(ld64(cb + 0x30))
		st64(s28, cf, ce, s158)
		st64(s40 + 8, s198)
		st64(s48, 0x100153000)
		st64(s60, s48)
		st64(s2c8 + 0x28, s60)
		st8(s2c8 + 0x22, ld64(s418))
		st8(s2c8 + 0x21, ld64(s418 + 8))
		st8(s2c8 + 0x20, ld64(s418 + 0x10))
		st64(s2c8 + 0x18, ld64(s418 + 0x18))
		st64(s2c8 + 0x10, ld64(s418 + 0x20))
		st64(s2c8 + 8, bw)
		st64(s2c8, ld64(s3e0 + 8))
		st64(s2d0, ld64(s3e0 + 0x20))
		st8(s2e0 + 0xa, ld64(s3e0 + 0x28))
		st8(s2e0 + 9, ld64(s3e0 + 0x30))
		st8(s2e0 + 8, ld64(s3f0))
		st64(s2e0, ld64(s3f0 + 8))
		st64(s2f8 + 0x10, ld64(s3e0))
		st64(s2f8 + 8, ld64(s3e0 + 0x10))
		st64(s2f8, ld64(s3e0 + 0x18))
		st64(s300, ld64(s3e0 + 0x38))
		st8(s158, cg)
		st64(s28 + 0x18, 1)
		st64(s40 + 0x10, 0x20)
		st64(s40, 0x10)
		st64(s58, 4)
		st64(s2c8 + 0x30, 1)
		st64(s318, 0, 8, 0)
		df = fn_13c8b8(s338, s318, 0xd8)
		bp = ld64(s338)
		if (bp != 2) {
			de = ld64(s338 + 8)
			dd = ld64(s3e0 + 0x40)
			st64(dd, bp, de)
			return df
		}
		const ch: AccountInfo = ld64(s398)
		const ci: LamportsCell = ch.lamports
		const cq = ch.key
		rc_inc(ci)
		const cj: DataCell = ch.data
		const ck = cj.strong
		st64(s3e0 + 0x38, cg)
		rc_inc(cj, ck)
		const cl: LamportsCell = bt.lamports
		const cm = cl.strong
		st64(s3e0 + 0x10, bt.key)
		st64(s3e0 + 0x18, ch.executable)
		st64(s3e0 + 0x20, ch.is_writable)
		st64(s3e0 + 0x28, ch.is_signer)
		st64(s3e0 + 0x30, ch.rent_epoch)
		const cp = ch.owner
		rc_inc(cl, cm)
		const cn: DataCell = bt.data
		const co = cn.strong
		st64(s3f0, cp, cj, cq, ci)
		rc_inc(cn, co)
		st64(s418 + 8, bt.executable)
		st64(s418 + 0x10, bt.is_writable)
		st64(s418 + 0x18, bt.is_signer)
		st64(s418 + 0x20, bt.rent_epoch)
		const cx = bt.owner
		copyr(s158, cc + 8, 0x20)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x100159480)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s40 + 8, 0)
		st64(s48, 0)
		if (fn_14efa0(ld64(s428 + 8), s48) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1, 0x1001594b0, 0x1001594d0)
		}
		st64(s178 + 0x10, s48)
		copyr(s178, s58, 0x10)
		st64(s198 + 0x10, s158)
		st64(s198, 0x100153000)
		st64(s1a8, s198)
		st64(s2c8 + 0x28, s1a8)
		st8(s2c8 + 0x22, ld64(s418 + 8))
		st8(s2c8 + 0x21, ld64(s418 + 0x10))
		st8(s2c8 + 0x20, ld64(s418 + 0x18))
		st64(s2c8 + 0x18, ld64(s418 + 0x20))
		st64(s2c8, cl, cn, cx)
		st64(s2d0, ld64(s3e0 + 0x10))
		st8(s2e0 + 0xa, ld64(s3e0 + 0x18))
		st8(s2e0 + 9, ld64(s3e0 + 0x20))
		st8(s2e0 + 8, ld64(s3e0 + 0x28))
		st64(s2e0, ld64(s3e0 + 0x30))
		st64(s2f8 + 0x10, ld64(s3f0))
		st64(s2f8 + 8, ld64(s3f0 + 8))
		copyr(s300, s3e0, 0x10)
		st8(s48, ld64(s3e0 + 0x38))
		st64(s178 + 0x18, 1)
		st64(s198 + 0x18, 0x20)
		st64(s198 + 8, 0x10)
		st64(s1a8 + 8, 4)
		st64(s2c8 + 0x30, 1)
		st64(s318, 0, 8, 0)
		df = fn_13cc48(s348, s318, ld64(ld64(ld64(s398 + 8) + 0x38)))
		const cy = ld64(s348)
		db = ld64(s3e0 + 0x40)
		if (cy != 2) {
			const dg = ld64(s348 + 8)
			st64(db, cy, dg)
			return df
		}
	} else {
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0x158)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const ac = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		const m: AccountInfo = ld64(ld64(ld64(s398 + 8) + 0x10))
		const n: LamportsCell = m.lamports
		const ad: AccountInfo = ld64(s398)
		const ap = m.key
		rc_inc(n)
		const aa: DataCell = m.data
		const ab = aa.strong
		st64(s3e0 + 0x38, ac)
		rc_inc(aa, ab)
		const ae: LamportsCell = ad.lamports
		const af = ae.strong
		st64(s3e0, ad.key)
		st64(s3e0 + 8, m.executable)
		st64(s3e0 + 0x10, m.is_writable)
		st64(s3e0 + 0x18, m.is_signer)
		st64(s3e0 + 0x20, m.rent_epoch)
		st64(s3e0 + 0x28, m.owner)
		st64(s3e0 + 0x30, ae)
		rc_inc(ae, af)
		const ag: DataCell = ad.data
		const ah = ag.strong
		st64(s3f0 + 8, aa)
		rc_inc(ag, ah)
		const ai: AccountInfo = ld64(ld64(ld64(s398 + 8) + 0x18))
		const aj: LamportsCell = ai.lamports
		const ak = aj.strong
		st64(s3e0 + 0x40, a)
		st64(s418 + 0x10, ad.executable)
		st64(s418 + 0x18, ad.is_writable)
		st64(s418 + 0x20, ad.is_signer)
		st64(s3f0, ad.rent_epoch)
		const an = ad.owner
		const ao = ai.key
		rc_inc(aj, ak)
		const al: DataCell = ai.data
		const am = al.strong
		st64(s428, an, ao, ap, n)
		rc_inc(al, am)
		st64(s450, ai.executable)
		st64(s448, ai.is_writable)
		st64(s440, ai.is_signer)
		st64(s438, ai.rent_epoch)
		st64(s430, ai.owner)
		const cr = ld64(s398 + 8)
		const cs = ld64(cr + 0x20)
		copyr(s198, cs + 8, 0x20)
		const ct = ld64(cr + 0x28)
		st64(s158, 0, 1, 0)
		st64(s2f8, s158, 0x100159480)
		st8(s2e0, 3)
		st64(s2f8 + 0x10, 0x20)
		st64(s310 + 8, 0)
		st64(s318, 0)
		if (fn_14efa0(ct, s318) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1, 0x1001594b0, 0x1001594d0)
		}
		const cv = ld64(s158 + 8)
		const cu = ld64(s158 + 0x10)
		const cw = ld8(ld64(cr + 0x30))
		st64(s28, cv, cu, s158)
		st64(s40 + 8, s198)
		st64(s48, 0x100153000)
		st8(s158, cw)
		st64(s60, s48)
		st64(s2c8 + 0x58, s60)
		st8(s2c8 + 0x52, ld64(s418 + 0x10))
		st8(s2c8 + 0x51, ld64(s418 + 0x18))
		st8(s2c8 + 0x50, ld64(s418 + 0x20))
		st64(s2c8 + 0x48, ld64(s3f0))
		st64(s2c8 + 0x40, ld64(s428))
		st64(s2c8 + 0x38, ag)
		st64(s2c8 + 0x30, ld64(s3e0 + 0x30))
		st64(s2c8 + 0x28, ld64(s3e0))
		st8(s2c8 + 0x22, ld64(s3e0 + 8))
		st8(s2c8 + 0x21, ld64(s3e0 + 0x10))
		st8(s2c8 + 0x20, ld64(s3e0 + 0x18))
		st64(s2c8 + 0x18, ld64(s3e0 + 0x20))
		st64(s2c8 + 0x10, ld64(s3e0 + 0x28))
		st64(s2c8 + 8, ld64(s3f0 + 8))
		copyr(s2d0, s418, 0x10)
		st8(s2e0 + 0xa, ld64(s450))
		st8(s2e0 + 9, ld64(s448))
		st8(s2e0 + 8, ld64(s440))
		st64(s2e0, ld64(s438))
		st64(s2f8 + 0x10, ld64(s430))
		st64(s2f8, aj, al)
		st64(s300, ld64(s428 + 8))
		st64(s28 + 0x18, 1)
		st64(s40 + 0x10, 0x20)
		st64(s40, 0x10)
		st64(s58, 4)
		st64(s2c8 + 0x60, 1)
		st64(s318, 0, 8, 0)
		df = fn_13cfd8(s378, s318, ld64(s3e0 + 0x38), 0xd8, ld64(ld64(cr + 0x38)))
		bp = ld64(s378)
		if (bp != 2) {
			de = ld64(s378 + 8)
			dd = ld64(s3e0 + 0x40)
			st64(dd, bp, de)
			return df
		}
		db = ld64(s3e0 + 0x40)
	}
	fn_4a30(s138, ld64(s398))
	if (ld64(s138) == 0) {
		df = Error_with_account_name(s388, ld64(s138 + 8), ld64(s138 + 0x10), "bundled_position", 0x10)
		const dc = ld64(s388)
		st64(db + 8, ld64(s388 + 8))
		st64(db, dc)
		return df
	}
	const cz = ld64(0x300000000 /* heap bump-allocator cursor */)
	const da = cz != 0 ? sat_sub(cz, 0xd8) & -8 : 0x300007f28
	if (da > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, da)
		df = memcpy(da, s138, 0xd8)
		st64(db + 8, da)
		st64(db, 2)
		return df
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

function fn_5ffd0(a: u64, b: u64, c: u64): u64 {
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

function fn_88c18(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000008 > g) {
		raw_vec_handle_error(1, 0x100, g, 0x300000008, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0x79657593e6f3afed /* event:PositionOpened */)
	st64(g + 0x20, ld64(b + 0x18))
	st64(g + 0x18, ld64(b + 0x10))
	st64(g + 0x10, ld64(b + 8))
	st64(g + 8, ld64(b))
	copy(g + 0x28, b + 0x20, 0x20)
	st32(g + 0x48, ld32(b + 0x40))
	st32(g + 0x4c, ld32(b + 0x44))
	st64(a + 8, g, 0x50)
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

function fn_14efa0(a: u64, b: u64): u64 {
	return fn_14ecd0(ld16(a), 1, b)
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
