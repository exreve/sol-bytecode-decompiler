// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction open_position: handler + 36 reachable functions
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
interface OpenPositionAccounts { // Accounts struct of instruction open_position as accounts_open_position returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	funder: at<0x60, ref<AccountInfo>>
}
interface OpenPositionContext { // anchor_lang Context of instruction open_position (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<OpenPositionAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_log_data(slices: u64, len: u64): void // log base64 data: slices = &[&[u8]]
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
declare function associated_token_create(a: u64, b: u64): u64 // lib anchor_spl::associated_token::create
declare function fn_127828(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcpy, ptr_drop_in_place_126088
declare function fn_133a38(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses raw_vec_handle_error
declare function fn_133b80(a: u64, b: u64): void // lib uses raw_vec_handle_error
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

// instruction handler: open_position (discriminator sha256("global:open_position")[..8] = 0x31f0980f4d2f8087)
// accounts [str: the program's account-error strings, in order of first use]: funder, whirlpool, rent, position, position_mint, position_token_account, token_program, associated_token_program, system_program, owner
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
function ix_open_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const sa8 = fp - 0xa8, sb0 = fp - 0xb0, sc0 = fp - 0xc0, s168 = fp - 0x168, s178 = fp - 0x178, s180 = fp - 0x180, s190 = fp - 0x190, s191 = fp - 0x191, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, sff8 = fp - 0xff8
	let k, l: u64
	sol_log("Instruction: OpenPosition", 0x19)
	const f = ix_args_len
	if (f >= 5 && f - 5 >= 4) {
		const g = ix_args
		const q = ld32(g + 1)
		const p = ld32(g + 5)
		st8(s191, 0xff)
		st64(s190, accounts, accounts_len)
		st64(sff8, s191)
		l = accounts_open_position(sc0, program_id, s190, undef, fp)
		const h = ld32(sc0)
		if (h == 2) {
			k = ld64(sc0 + 8)
			st64(a + 8, ld64(sb0))
			st64(a, k)
			return l
		}
		const o = ld32(sc0 + 4)
		const n = ld64(sc0 + 8)
		const m = ld64(sb0)
		memcpy(s168, sa8, 0xa8)
		st64(s178, n, m)
		st32(s180, h, o)
		st8(sa8 + 8, ld8(s191))
		copyr(sb0, s190, 0x10)
		st64(sc0, program_id, s180)
		l = fn_34000(s1a8, sc0, undef, q, p)
		k = ld64(s1a8)
		if (k == 2) {
			l = fn_bc720(s1b8, s180, program_id)
			k = ld64(s1b8)
			st64(a + 8, ld64(s1b8 + 8))
			st64(a, k)
			return l
		}
		st64(a + 8, ld64(s1a8 + 8))
		st64(a, k)
		return l
	}
	const i = fn_1459d0(0x100159468)
	if (2 > (i & 3) - 2) {
		l = anchor_error_from(s1c8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s1c8)
		st64(a + 8, ld64(s1c8 + 8))
		st64(a, k)
		return l
	}
	if ((i & 3) == 0) {
		l = anchor_error_from(s1c8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s1c8)
		st64(a + 8, ld64(s1c8 + 8))
		st64(a, k)
		return l
	}
	const j = ld64(ld64(i + 7))
	callx(j, ld64(i - 1), j)
	l = anchor_error_from(s1c8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	k = ld64(s1c8)
	st64(a + 8, ld64(s1c8 + 8))
	st64(a, k)
	return l
}

// Anchor Accounts::try_accounts of instruction open_position (called by ix_open_position; name [str]: from the handler's "Instruction: …" log; was fn_b6240)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: funder (ConstraintMut), whirlpool, rent, position (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), position_mint (ConstraintMut, ConstraintSigner, ConstraintRentExempt), position_token_account (ConstraintMut, ConstraintRentExempt), token_program (ConstraintAddress), associated_token_program, system_program, owner (AccountNotEnoughKeys)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position, position_mint, position_token_account, funder
function accounts_open_position(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s268 = fp - 0x268, s270 = fp - 0x270, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s2a8 = fp - 0x2a8, s2d8 = fp - 0x2d8, s320 = fp - 0x320, s338 = fp - 0x338, s350 = fp - 0x350, s368 = fp - 0x368, s369 = fp - 0x369, s390 = fp - 0x390, s3a8 = fp - 0x3a8, s3c0 = fp - 0x3c0, s3c8 = fp - 0x3c8, s3d0 = fp - 0x3d0, s3d8 = fp - 0x3d8, s3e0 = fp - 0x3e0, s3e8 = fp - 0x3e8, s3f0 = fp - 0x3f0, s3f8 = fp - 0x3f8, s400 = fp - 0x400, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s598 = fp - 0x598, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s5c8 = fp - 0x5c8, s5d8 = fp - 0x5d8, s5e8 = fp - 0x5e8, s5f8 = fp - 0x5f8, s608 = fp - 0x608, s618 = fp - 0x618, s628 = fp - 0x628, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s668 = fp - 0x668, s678 = fp - 0x678, s690 = fp - 0x690, s698 = fp - 0x698, s6a0 = fp - 0x6a0, s6a8 = fp - 0x6a8, s6b0 = fp - 0x6b0, s6b8 = fp - 0x6b8
	let i, j, m, o, p, bk: u64
	st64(s408, b)
	try_accounts_11718(s290, c, c, d, e)
	const g = ld64(s288)
	const f = ld64(s290)
	if (f != 2) {
		p = Error_with_account_name(s418, f, g, "funder", 6)
		o = ld64(s418)
		st64(a + 0x10, ld64(s418 + 8))
		st64(a + 8, o)
		st32(a, 2)
		return p
	}
	const ah = ld64(e - 0xff8)
	st64(s400, g)
	const h = ld64(c + 8)
	if (h != 0) {
		const l: AccountInfo = ld64(c)
		st64(c, l + 0x30)
		m = h - 1
		st64(c + 8, m)
		st64(s3f8, l)
		if (m == 0) {
			p = anchor_error_from(s678, 0xbbd /* anchor::AccountNotEnoughKeys */, m, i, j)
			o = ld64(s678)
			st64(a + 0x10, ld64(s678 + 8))
			st64(a + 8, o)
			st32(a, 2)
			return p
		}
		const n: AccountInfo = ld64(c)
		st64(s3f0, n)
		st64(c + 8, h - 2)
		st64(c, n + 0x30)
		if (h != 2) {
			st64(s3e8, n + 0x30)
			st64(c + 8, h - 3)
			st64(c, n + 0x60)
			if (h != 3) {
				st64(s3e0, n + 0x60)
				st64(c + 8, h - 4)
				st64(c, n + 0x90)
				try_accounts_11a48(s290, c, n + 0x60, h - 3, j)
				if (ld64(s290) == 0) {
					p = Error_with_account_name(s628, ld64(s288), ld64(s288 + 8), 0x100152b28 /* "whirlpool" */, 9)
					o = ld64(s628)
					st64(a + 0x10, ld64(s628 + 8))
					st64(a + 8, o)
					st32(a, 2)
					return p
				}
				const q = ld64(0x300000000 /* heap bump-allocator cursor */)
				const r = q != 0 ? sat_sub(q, 0x290) & -8 : 0x300007d70
				if (r > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, r)
					memcpy(r, s290, 0x290)
					fn_129a0(s290, c)
					const t = ld64(s288)
					const s = ld64(s290)
					if (s == 2) {
						st64(s3d8, t)
						fn_122e8(s290, c, t)
						const v = ld64(s288)
						const u = ld64(s290)
						if (u == 2) {
							st64(s3d0, v)
							try_accounts_11990(s290, c, v)
							const y = ld64(s288 + 8)
							const x = ld64(s288)
							const w = ld64(s290)
							if (w == 0) {
								p = Error_with_account_name(s618, x, y, 0x100152d60 /* "rent" */, 4)
								o = ld64(s618)
								st64(a + 0x10, ld64(s618 + 8))
								st64(a + 8, o)
								st32(a, 2)
								return p
							}
							st64(s690, w, x, y)
							st64(s698, ld64(s278))
							fn_12510(s290, c, y)
							const aa = ld64(s288)
							const z = ld64(s290)
							if (z == 2) {
								st64(s3c8, aa)
								rent_get(s290)
								copy(s3a8, s288, 0x18)
								if (ld64(s290) == 0) {
									copyr(s3c0, s3a8, 0x18)
									const ab = ld64(ld64(s3e8))
									const af = ld64(ab + 0x18)
									const ae = ld64(ab + 0x10)
									const ad = ld64(ab + 8)
									const ac = ld64(ab)
									st64(s2d8, 0x100151f20)
									st64(s2d8 + 0x10, s338)
									st64(s338, ac, ad, ae, af)
									st64(s2d8 + 8, 8)
									st64(s2d8 + 0x18, 0x20)
									// PDA find_program_address(["position", *s338], program *(ld64(s408)))
									Pubkey_find_program_address(s290, s2d8, 2, ld64(s408))
									copyr(s390, s290, 0x20)
									const ag = ld8(s270)
									st8(s369, ag)
									st8(ah, ag)
									const ai = ld64(ld64(s3f0))
									copy(s290, ai, 0x20)
									if ((memcmp(s290, s390, 0x20) as u32) == 0) {
										st64(s268, s369, s408)
										st64(s270, ld64(s3e8))
										st64(s290, s3f0, s3c0, s400, s3d0)
										p = fn_b84b0(s338, s290)
										const aq = ld64(s338 + 8)
										o = ld64(s338)
										if (o == 2) {
											const position: AccountInfo = ld64(aq)
											if (position.is_writable == 0) {
												anchor_error_from(s5f8, 0x7d0 /* anchor::ConstraintMut */)
												p = Error_with_account_name(s608, ld64(s5f8), ld64(s5f8 + 8), "position", 8)
												o = ld64(s608)
												st64(a + 0x10, ld64(s608 + 8))
												st64(a + 8, o)
												st32(a, 2)
												return p
											}
											AccountInfo_clone(s338, position)
											st64(s6a0, fn_143100(s338))
											st64(s6a8, aq)
											AccountInfo_clone(s290, ld64(aq))
											AccountInfo_try_data_len(s2d8, s290)
											const au = ld64(s2d8 + 8)
											const at = ld64(s2d8)
											if (at != 0x800000000000001a /* Ok */) {
												st64(s2d8 + 0x10, ld64(s2d8 + 0x10))
												st64(s2d8, at, au)
												p = fn_13b430(s498, s2d8)
												const bg = ld64(s498)
												st64(a + 0x10, ld64(s498 + 8))
												st64(a + 8, bg)
												st32(a, 2)
												const bi = ld64(s288 + 8)
												const bh = ld64(s288)
												rc_dec(bh)
												rc_dec(bi)
												bk = ld64(s338 + 0x10)
												const bj = ld64(s338 + 8)
												rc_dec(bj)
												if (!rc_release(bk)) {
													return p
												}
												st64(bk + 8, ld64(bk + 8) - 1)
												return p
											}
											const av = __floatundidf(ld64(s3c0) * (au + 0x80))
											const aw = fn_14f7f8(ld64(s3c0 + 8), av)
											st64(s6b0, fn_151cb0(aw, 0))
											const ax = fn_14f3e8(aw)
											const ay = 0 > (ld64(s6b0) as i64) ? 0 : ax
											const bf = (fn_151a40(aw, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : ay
											const ba = ld64(s288 + 8)
											const az = ld64(s288)
											rc_dec(az)
											rc_dec(ba)
											const bd = ld64(s338 + 0x10)
											const bb = ld64(s338 + 8)
											let bc = ld64(bb) - 1
											st64(bb, bc)
											if (bc == 0) {
												bc = ld64(bb + 8) - 1
												st64(bb + 8, bc)
											}
											let be = ld64(bd) - 1
											st64(bd, be)
											if (be == 0) {
												be = ld64(bd + 8) - 1
												st64(bd + 8, be)
											}
											if (bf > ld64(s6a0)) {
												anchor_error_from(s5d8, 0x7d5 /* anchor::ConstraintRentExempt */, be, bc)
												p = Error_with_account_name(s5e8, ld64(s5d8), ld64(s5d8 + 8), "position", 8)
												o = ld64(s5e8)
												st64(a + 0x10, ld64(s5e8 + 8))
												st64(a + 8, o)
												st32(a, 2)
												return p
											}
											rent_get(s290)
											copy(s350, s288, 0x18)
											if (ld64(s290) != 0) {
												p = fn_13b430(s4a8, s350)
												o = ld64(s4a8)
												st64(a + 0x10, ld64(s4a8 + 8))
												st64(a + 8, o)
												st32(a, 2)
												return p
											}
											copyr(s368, s350, 0x18)
											st64(s2d8, s3e8, s368, s400, s3d0, s3d8, r)
											p = fn_b9f50(s290, s2d8)
											const bl = ld32(s290)
											if (bl == 2) {
												o = ld64(s288)
												st64(a + 0x10, ld64(s288 + 8))
												st64(a + 8, o)
												st32(a, 2)
												return p
											}
											st64(s6a0, ld32(s290 + 4))
											st64(s6b0, ld64(s288))
											const bm = ld64(s288 + 8)
											memcpy(s320, s278, 0x48)
											st64(s338 + 0x10, bm)
											st64(s338 + 8, ld64(s6b0))
											st32(s338 + 4, ld64(s6a0))
											st32(s338, bl)
											const position_mint: AccountInfo = ld64(s320 + 0x40)
											if (position_mint.is_writable == 0) {
												anchor_error_from(s5b8, 0x7d0 /* anchor::ConstraintMut */)
												p = Error_with_account_name(s5c8, ld64(s5b8), ld64(s5b8 + 8), "position_mint", 0xd)
												o = ld64(s5c8)
												st64(a + 0x10, ld64(s5c8 + 8))
												st64(a + 8, o)
												st32(a, 2)
												return p
											}
											if (position_mint.is_signer == 0) {
												anchor_error_from(s598, 0x7d2 /* anchor::ConstraintSigner */)
												p = Error_with_account_name(s5a8, ld64(s598), ld64(s598 + 8), "position_mint", 0xd)
												o = ld64(s5a8)
												st64(a + 0x10, ld64(s5a8 + 8))
												st64(a + 8, o)
												st32(a, 2)
												return p
											}
											AccountInfo_clone(s2d8, position_mint)
											st64(s6a0, fn_143100(s2d8))
											AccountInfo_clone(s290, ld64(s320 + 0x40))
											AccountInfo_try_data_len(s2a8, s290)
											const bp = ld64(s2a8 + 8)
											const bo = ld64(s2a8)
											if (bo != 0x800000000000001a /* Ok */) {
												st64(s2a8 + 0x10, ld64(s2a8 + 0x10))
												st64(s2a8, bo, bp)
												p = fn_13b430(s4b8, s2a8)
												const cb = ld64(s4b8)
												st64(a + 0x10, ld64(s4b8 + 8))
												st64(a + 8, cb)
												st32(a, 2)
												const cd = ld64(s288 + 8)
												const cc = ld64(s288)
												rc_dec(cc)
												rc_dec(cd)
												bk = ld64(s2d8 + 0x10)
												const ce = ld64(s2d8 + 8)
												rc_dec(ce)
												if (!rc_release(bk)) {
													return p
												}
												st64(bk + 8, ld64(bk + 8) - 1)
												return p
											}
											const bq = __floatundidf(ld64(s368) * (bp + 0x80))
											const br = fn_14f7f8(ld64(s368 + 8), bq)
											st64(s6b0, fn_151cb0(br, 0))
											const bs = fn_14f3e8(br)
											const bt = 0 > (ld64(s6b0) as i64) ? 0 : bs
											const ca = (fn_151a40(br, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : bt
											const bv = ld64(s288 + 8)
											const bu = ld64(s288)
											rc_dec(bu)
											rc_dec(bv)
											const by = ld64(s2d8 + 0x10)
											const bw = ld64(s2d8 + 8)
											let bx = ld64(bw) - 1
											st64(bw, bx)
											if (bx == 0) {
												bx = ld64(bw + 8) - 1
												st64(bw + 8, bx)
											}
											let bz = ld64(by) - 1
											st64(by, bz)
											if (bz == 0) {
												bz = ld64(by + 8) - 1
												st64(by + 8, bz)
											}
											if (ca > ld64(s6a0)) {
												anchor_error_from(s578, 0x7d5 /* anchor::ConstraintRentExempt */, bz, bx)
												p = Error_with_account_name(s588, ld64(s578), ld64(s578 + 8), "position_mint", 0xd)
												o = ld64(s588)
												st64(a + 0x10, ld64(s588 + 8))
												st64(a + 8, o)
												st32(a, 2)
												return p
											}
											rent_get(s290)
											const ck = ld64(s288 + 8)
											const cj = ld64(s288)
											if (ld64(s290) != 0) {
												st32(s2d8, ld32(s278 + 1))
												st32(s2d8 + 3, ld32(s278 + 4))
												const cv = ld8(s278)
												st32(s288 + 0xc, ld32(s2d8 + 3))
												st32(s288 + 9, ld32(s2d8))
												st8(s288 + 8, cv)
												st64(s290, cj, ck)
												p = fn_13b430(s4c8, s290)
												o = ld64(s4c8)
												st64(a + 0x10, ld64(s4c8 + 8))
												st64(a + 8, o)
												st32(a, 2)
												return p
											}
											st64(s290, s3e0, s3c8, s400, s3f8, s338, s3d0, s3d8)
											p = fn_bba20(s2d8, s290)
											st64(s6a0, ld64(s2d8 + 8))
											o = ld64(s2d8)
											if (o == 2) {
												const position_token_account: AccountInfo = ld64(ld64(s6a0))
												if (position_token_account.is_writable == 0) {
													anchor_error_from(s558, 0x7d0 /* anchor::ConstraintMut */)
													p = Error_with_account_name(s568, ld64(s558), ld64(s558 + 8), "position_token_account", 0x16)
													o = ld64(s568)
													st64(a + 0x10, ld64(s568 + 8))
													st64(a + 8, o)
													st32(a, 2)
													return p
												}
												st64(s6b0, s2d8)
												AccountInfo_clone(s2d8, position_token_account)
												st64(s6b8, fn_143100(ld64(s6b0)))
												const cg = ld64(ld64(s6a0))
												st64(s6b0, s290)
												AccountInfo_clone(s290, cg)
												AccountInfo_try_data_len(s2a8, ld64(s6b0))
												const ci = ld64(s2a8 + 8)
												const ch = ld64(s2a8)
												if (ch != 0x800000000000001a /* Ok */) {
													st64(s2a8 + 0x10, ld64(s2a8 + 0x10))
													st64(s2a8, ch, ci)
													p = fn_13b430(s4d8, s2a8)
													const cw = ld64(s4d8)
													st64(a + 0x10, ld64(s4d8 + 8))
													st64(a + 8, cw)
													st32(a, 2)
													const cy = ld64(s288 + 8)
													const cx = ld64(s288)
													rc_dec(cx)
													rc_dec(cy)
													bk = ld64(s2d8 + 0x10)
													const cz = ld64(s2d8 + 8)
													rc_dec(cz)
													if (!rc_release(bk)) {
														return p
													}
													st64(bk + 8, ld64(bk + 8) - 1)
													return p
												}
												const cl = fn_14f7f8(ck, __floatundidf((ci + 0x80) * cj))
												st64(s6b0, fn_151cb0(cl, 0))
												const cm = fn_14f3e8(cl)
												const cn = 0 > (ld64(s6b0) as i64) ? 0 : cm
												const cu = (fn_151a40(cl, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : cn
												const cp = ld64(s288 + 8)
												const co = ld64(s288)
												rc_dec(co)
												rc_dec(cp)
												const cs = ld64(s2d8 + 0x10)
												const cq = ld64(s2d8 + 8)
												let cr = ld64(cq) - 1
												st64(cq, cr)
												if (cr == 0) {
													cr = ld64(cq + 8) - 1
													st64(cq + 8, cr)
												}
												let ct = ld64(cs) - 1
												st64(cs, ct)
												if (ct == 0) {
													ct = ld64(cs + 8) - 1
													st64(cs + 8, ct)
												}
												if (cu > ld64(s6b8)) {
													anchor_error_from(s538, 0x7d5 /* anchor::ConstraintRentExempt */, ct, cr)
													p = Error_with_account_name(s548, ld64(s538), ld64(s538 + 8), "position_token_account", 0x16)
													o = ld64(s548)
													st64(a + 0x10, ld64(s548 + 8))
													st64(a + 8, o)
													st32(a, 2)
													return p
												}
												const funder: AccountInfo = ld64(s400)
												if (funder.is_writable != 0) {
													const db = ld64(s3d8)
													const dc = ld64(db)
													copy(s2d8, dc, 0x20)
													if ((memcmp(s2d8, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
														anchor_error_from(s4e8, 0x7dc /* anchor::ConstraintAddress */)
														const dg = Error_with_account_name(s4f8, ld64(s4e8), ld64(s4e8 + 8), "token_program", 0xd)
														const df = ld64(s4f8 + 8)
														const de = ld64(s4f8)
														copyr(s290, s2d8, 0x20)
														st64(s270, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
														p = fn_13b5c0(s508, de, df, s290, dg)
														o = ld64(s508)
														st64(a + 0x10, ld64(s508 + 8))
														st64(a + 8, o)
														st32(a, 2)
														return p
													}
													st64(s6b0, ld64(s3f8))
													p = memcpy(a, s338, 0x60)
													const dd = ld64(s3c8)
													st64(a + 0x90, ld64(s3d0))
													st64(a + 0xb8, dd)
													st64(a + 0xb0, ld64(s698))
													st64(a + 0xa8, ld64(s690 + 0x10))
													st64(a + 0xa0, ld64(s690 + 8))
													st64(a + 0x98, ld64(s690))
													st64(a + 0x88, db)
													st64(a + 0x80, r)
													st64(a + 0x78, ld64(s6a0))
													st64(a + 0x70, ld64(s6a8))
													st64(a + 0x68, ld64(s6b0))
													st64(a + 0x60, funder)
													return p
												}
												anchor_error_from(s518, 0x7d0 /* anchor::ConstraintMut */, ct, cr)
												p = Error_with_account_name(s528, ld64(s518), ld64(s518 + 8), "funder", 6)
												o = ld64(s528)
												st64(a + 0x10, ld64(s528 + 8))
												st64(a + 8, o)
												st32(a, 2)
												return p
											}
											st64(a + 0x10, ld64(s6a0))
											st64(a + 8, o)
											st32(a, 2)
											return p
										}
										st64(a + 0x10, aq)
										st64(a + 8, o)
										st32(a, 2)
										return p
									}
									anchor_error_from(s468, 0x7d6 /* anchor::ConstraintSeeds */)
									Error_with_account_name(s478, ld64(s468), ld64(s468 + 8), "position", 8)
									const ap = ld64(s478 + 8)
									const ao = ld64(s478)
									const aj = ld64(ld64(s3f0))
									const an = ld64(aj + 0x18)
									const am = ld64(aj + 0x10)
									const al = ld64(aj + 8)
									const ak = ld64(aj)
									copy(s270, s390, 0x20)
									st64(s290, ak, al, am, an)
									p = fn_13b5c0(s488, ao, ap, s290, al)
									o = ld64(s488)
									st64(a + 0x10, ld64(s488 + 8))
									st64(a + 8, o)
									st32(a, 2)
									return p
								}
								p = fn_13b430(s458, s3a8)
								o = ld64(s458)
								st64(a + 0x10, ld64(s458 + 8))
								st64(a + 8, o)
								st32(a, 2)
								return p
							}
							p = Error_with_account_name(s448, z, aa, "associated_token_program", 0x18)
							o = ld64(s448)
							st64(a + 0x10, ld64(s448 + 8))
							st64(a + 8, o)
							st32(a, 2)
							return p
						}
						p = Error_with_account_name(s438, u, v, "system_program", 0xe)
						o = ld64(s438)
						st64(a + 0x10, ld64(s438 + 8))
						st64(a + 8, o)
						st32(a, 2)
						return p
					}
					p = Error_with_account_name(s428, s, t, "token_program", 0xd)
					o = ld64(s428)
					st64(a + 0x10, ld64(s428 + 8))
					st64(a + 8, o)
					st32(a, 2)
					return p
				}
				alloc_handle_alloc_error(8, 0x290)
			}
			p = anchor_error_from(s638, 0xbbd /* anchor::AccountNotEnoughKeys */, n + 0x60, h - 3, j)
			o = ld64(s638)
			st64(a + 0x10, ld64(s638 + 8))
			st64(a + 8, o)
			st32(a, 2)
			return p
		}
		p = anchor_error_from(s648, 0xbbd /* anchor::AccountNotEnoughKeys */, n + 0x30, h - 2, j)
		o = ld64(s648)
		st64(a + 0x10, ld64(s648 + 8))
		st64(a + 8, o)
		st32(a, 2)
		return p
	}
	anchor_error_from(s658, 0xbbd /* anchor::AccountNotEnoughKeys */, g, i, j)
	m = undef
	const k = ld64(s658)
	if (k == 2) {
		p = anchor_error_from(s678, 0xbbd /* anchor::AccountNotEnoughKeys */, m, i, j)
		o = ld64(s678)
		st64(a + 0x10, ld64(s678 + 8))
		st64(a + 8, o)
		st32(a, 2)
		return p
	}
	p = Error_with_account_name(s668, k, ld64(s658 + 8), 0x100154aba /* "owner" */, 5)
	o = ld64(s668)
	st64(a + 0x10, ld64(s668 + 8))
	st64(a + 8, o)
	st32(a, 2)
	return p
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: e (value), d (value)
// types [heur]: b: OpenPositionContext (the handler ix_open_position passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_34000(a: u64, b: OpenPositionContext, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let h, m, n, t, aa, ae, ag: u64
	st64(sa8, a)
	const accounts: OpenPositionAccounts = b.accounts
	const g = ld64(accounts + 0x80)
	if ((memcmp(g + 0x148, 0x100152180, 0x20) as u32) == 0 && (ld16(g + 0xc8) & 1) != 0) {
		ag = fn_87630(sa0, 0x43)
		h = ld64(sa0)
		ae = ld64(sa8)
		st64(ae + 8, ld64(sa0 + 8))
		st64(ae, h)
		return ag
	}
	ag = fn_4c1a0(s60, accounts + 0x60, ld64(accounts + 0x70), accounts + 0x90)
	h = ld64(s60)
	if (h == 2) {
		const i = ld64(accounts + 0x80)
		const k = ld16(i + 0x284)
		const j = ld64(i + 0x240)
		st64(s1000, ld64(i + 0x238))
		st64(sff8, j)
		ag = fn_60930(s40, d, e, k, ld64(s1000), j)
		h = ld64(s40)
		if (h == 2) {
			B18: {
				n = ld32(s38)
				m = ld32(s38 + 4)
				st64(sb0, ld64(accounts + 0x80))
				t = ld64(accounts + 0x70)
				const l = ld64(ld64(accounts + 0x58))
				copyr(s40, l, 0x20)
				let s = 0xa
				if ((((n as i32) - 0x6c4f5) as u32) >= 0xfff27617) {
					const o = ld16(ld64(sb0) + 0x284)
					if (o == 0) {
						fn_14e1c0(0x100159f48, o, 0xfff27617)
					}
					st64(sb8, o)
					const p = fn_151bf8(n as i32, o)
					s = 0xa
					if ((((m as i32) - 0x6c4f5) as u32) >= 0xfff27617 && (p as u32) == 0) {
						const q = fn_151bf8(m as i32, ld64(sb8))
						s = 0xa
						if ((m as i32) > (n as i32) && (q as u32) == 0) {
							if ((ld64(sb8) as i16) > -1) {
								break B18
							}
							s = 0x36
							const r = 0x6c4f4 % ld64(sb8)
							if (r - 0x6c4f4 == (n as i32) && 0x6c4f4 - r == (m as i32)) {
								break B18
							}
						}
					}
				}
				ag = fn_87630(s70, s)
				h = ld64(s70)
				if (h != 2) {
					ae = ld64(sa8)
					st64(ae + 8, ld64(s70 + 8))
					st64(ae, h)
					return ag
				}
			}
			const u = ld64(ld64(ld64(sb0)))
			st64(t + 0x20, ld64(u + 0x18))
			st64(t + 0x18, ld64(u + 0x10))
			st64(t + 0x10, ld64(u + 8))
			st64(t + 8, ld64(u))
			copy(t + 0x30, s38, 0x18)
			const v = ld64(s40)
			st32(t + 0xd0, n as i32, m as i32)
			st64(t + 0x28, v)
			const w = ld64(ld64(ld64(accounts + 0x80)))
			copyr(s40, w, 0x20)
			const x = ld64(ld64(ld64(accounts + 0x70)))
			copyr(s20, x, 0x20)
			const y = ld64(0x300000000 /* heap bump-allocator cursor */)
			const z = y != 0 ? sat_sub(y, 0x100) : 0x300007f00
			if (z > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, z)
				st64(z, 0x79657593e6f3afed /* event:PositionOpened */)
				copy(z + 8, s40, 0x40)
				st32(z + 0x4c, m as i32)
				st32(z + 0x48, n as i32)
				st64(s50, z, 0x50)
				log_data(s50, 1)
				const ad = ld64(accounts + 0x88)
				const ac = ld64(accounts + 0x58)
				const ab = ld64(accounts + 0x80)
				ag = fn_68310(s80, ab, ac, ld64(ld64(accounts + 0x78)), ad)
				const af = ld64(s80 + 8)
				h = ld64(s80)
				if (h != 2) {
					ae = ld64(sa8)
					st64(ae + 8, af)
					st64(ae, h)
					return ag
				}
				ag = fn_69330(s90, ab, ac, ad)
				h = ld64(s90)
				ae = ld64(sa8)
				st64(ae + 8, ld64(s90 + 8))
				st64(ae, h)
				return ag
			}
			raw_vec_handle_error(1, 0x100, sat_sub(y, 0x100), 0x100 > y, aa)
		}
		ae = ld64(sa8)
		st64(ae + 8, ld64(s38))
		st64(ae, h)
		return ag
	}
	ae = ld64(sa8)
	st64(ae + 8, ld64(s60 + 8))
	st64(ae, h)
	return ag
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position, position_mint, position_token_account
function fn_bc720(a: u64, b: u64, c: u64): u64 {
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
	const q = ld64(ld64(b + 0x78))
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

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position
function fn_b84b0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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
				st64(s2c8 + 8, 0x100154a86)
				st32(s248 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s278, 2)
				st32(s2b0, 0xe)
				st64(s2c8 + 0x10, 0x34)
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
function fn_b9f50(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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
				st64(s260, 0x100154a86)
				st32(s1d8 + 8, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s218, 2)
				st32(s260 + 0x10, 0xe)
				st64(s260 + 8, 0x34)
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
