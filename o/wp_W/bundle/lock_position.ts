// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction lock_position: handler + 25 reachable functions
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
interface Mint extends sized<0x60> { // Account<Mint> (anchor_spl, SPL Token Mint) as unpacked in memory (fields [known: spl_token::state layout] at the offsets a run of try_accounts_11e98 put them [offsets from exec]; info = the &AccountInfo)
	mint_authority:   at<0x04, Pubkey> // COption<Pubkey>
	supply:           at<0x28, u64>
	decimals:         at<0x30, u8>
	freeze_authority: at<0x38, Pubkey> // COption<Pubkey>
	info:             at<0x58, ref<AccountInfo>> // &AccountInfo
}
interface TokenAccount_2 extends sized<0xd8> { // Account<TokenAccount> (anchor_spl, SPL Token Account) as unpacked in memory (fields [known: spl_token::state layout] at the offsets a run of try_accounts_558 put them [offsets from exec]; info = the &AccountInfo)
	info:             at<0x20, ref<AccountInfo>> // &AccountInfo
	mint:             at<0x28, Pubkey>
	owner:            at<0x48, Pubkey>
	amount:           at<0x68, u64>
	delegate:         at<0x74, Pubkey> // COption<Pubkey>
	is_native:        at<0xa0, u64> // COption<u64>
	delegated_amount: at<0xa8, u64>
	close_authority:  at<0xb4, Pubkey> // COption<Pubkey>
}
interface LockPositionAccounts { // Accounts struct of instruction lock_position as accounts_lock_position returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	position_mint:          at<0x00, Mint> // Account<Mint> in place
	position_token_account: at<0x80, TokenAccount_2> // Account<TokenAccount> in place
	funder:                 at<0x158, ref<AccountInfo>>
	position_authority:     at<0x160, ref<AccountInfo>>
	whirlpool:              at<0x248, ref<AccountInfo>>
}
interface LockPositionContext { // anchor_lang Context of instruction lock_position (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<LockPositionAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function try_accounts_558(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::interface_account::InterfaceAccount<T> as anchor_lang::Accounts<B>…
declare function try_accounts_610(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function fn_b580(a: u64): u64 // lib uses alloc_handle_alloc_error, Error__new
declare function ptr_drop_in_place_c1b0(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 4]>
declare function AccountInfo_clone(a: u64, b: u64): void // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11a48(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11b00(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_122e8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_12cf58(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib uses raw_vec_handle_error
declare function fn_12d0a0(a: u64, b: u64, r0: u64): void // lib uses raw_vec_handle_error
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
declare function clock_get_13f308(a: u64): u64 // lib solana_sysvar::clock::<impl solana_sysvar::Sysvar for solana_clock::Clock>::get
declare function rent_get(a: u64): u64 // lib solana_sysvar::rent::<impl solana_sysvar::Sysvar for solana_rent::Rent>::get
declare function AccountInfo_try_data_len(a: u64, b: u64): void // lib solana_account_info::AccountInfo::try_data_len
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function fn_1459d0(a: u64): u64 // lib uses repr_bitpacked_kind_from_prim_145358, callx
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fn_14a698(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses callx
declare function fn_14ecd0(a: u64, b: u64, c: u64): u64 // lib "0001020304050607080910111213141516171819…", "0001020304050607080910111213141516171819…"
declare function fn_14f3e8(a: u64): u64 // lib
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function __floatundidf(a: u64): u64 // lib __floatundidf
declare function fn_14f808(a: u64, b: u64): u64 // lib uses __multi3
declare function fn_151a40(a: u64, b: u64): u64 // lib
declare function fn_151cb0(a: u64, b: u64): u64 // lib

// instruction handler: lock_position (discriminator sha256("global:lock_position")[..8] = 0xb9ab0af7fc023ee3)
// accounts [str: the program's account-error strings, in order of first use]: funder, position, position_mint, position_token_account, whirlpool, lock_config, token_2022_program, system_program, position_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
function ix_lock_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s10 = fp - 0x10, s4e0 = fp - 0x4e0, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s9c8 = fp - 0x9c8, s9d8 = fp - 0x9d8, s9e0 = fp - 0x9e0, s9e2 = fp - 0x9e2, s9f8 = fp - 0x9f8, sa08 = fp - 0xa08, sa18 = fp - 0xa18, sff8 = fp - 0xff8
	let g, j, k, l, m, n: u64
	sol_log("Instruction: LockPosition", 0x19)
	if (ix_args_len == 0) {
		g = fn_1459d0(0x100159468)
	} else {
		const f = ld8(ix_args)
		st8(s9e2, f)
		if (f == 0) {
			st16(s9e2, 0xffff)
			st64(s10, accounts, accounts_len)
			st64(sff8, s9e2)
			n = accounts_lock_position(s4f8, program_id, s10, undef, fp)
			const o = ld32(s4f8)
			if (o == 2) {
				m = ld64(s4f8 + 8)
				st64(a + 8, ld64(s4e8))
				st64(a, m)
				return n
			}
			const r = ld32(s4f8 + 4)
			const q = ld64(s4f8 + 8)
			const p = ld64(s4e8)
			memcpy(s9c8, s4e0, 0x4d0)
			st64(s9d8, q, p)
			st32(s9e0, o, r)
			st8(s4e0 + 9, ld8(s9e2 + 1))
			st8(s4e0 + 8, ld8(s9e2))
			copyr(s4e8, s10, 0x10)
			st64(s4f8, program_id, s9e0)
			n = fn_33380(s9f8, s4f8)
			m = ld64(s9f8)
			if (m == 2) {
				n = fn_b2cf8(sa08, s9e0, program_id)
				m = ld64(sa08)
				st64(a + 8, ld64(sa08 + 8))
				st64(a, m)
				return n
			}
			st64(a + 8, ld64(s9f8 + 8))
			st64(a, m)
			return n
		}
		st64(s4f8, 0x100159668)
		st64(s4e8, s10)
		st64(s10, s9e2, num_fmt_bae8)
		st64(s4e0 + 8, 0)
		st64(s4f8 + 8, 1)
		st64(s4e0, 1)
		// fmt "Unexpected variant index: {}" {} = f [num_fmt_bae8]
		fn_147e78(s9e0, s4f8)
		g = fn_b580(s9e0)
	}
	const h = g
	if (2 > (g & 3) - 2) {
		n = anchor_error_from(sa18, 0x66 /* anchor::InstructionDidNotDeserialize */, j, k, l)
		m = ld64(sa18)
		st64(a + 8, ld64(sa18 + 8))
		st64(a, m)
		return n
	}
	if ((h & 3) == 0) {
		n = anchor_error_from(sa18, 0x66 /* anchor::InstructionDidNotDeserialize */, j, k, l)
		m = ld64(sa18)
		st64(a + 8, ld64(sa18 + 8))
		st64(a, m)
		return n
	}
	const i = ld64(ld64(g + 7))
	callx(i, ld64(g - 1), i)
	n = anchor_error_from(sa18, 0x66 /* anchor::InstructionDidNotDeserialize */)
	m = ld64(sa18)
	st64(a + 8, ld64(sa18 + 8))
	st64(a, m)
	return n
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

// Anchor Accounts::try_accounts of instruction lock_position (called by ix_lock_position; name [str]: from the handler's "Instruction: …" log; was fn_af148)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: funder (ConstraintMut), position (ConstraintSeeds, ConstraintHasOne), position_mint (ConstraintOwner, ConstraintAddress), position_token_account (ConstraintMut, ConstraintRaw), whirlpool, lock_config (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), token_2022_program (ConstraintAddress), system_program, position_authority
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpool, lock_config
function accounts_lock_position(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s68 = fp - 0x68, s70 = fp - 0x70, s71 = fp - 0x71, s98 = fp - 0x98, sb0 = fp - 0xb0, sc8 = fp - 0xc8, sd0 = fp - 0xd0, s348 = fp - 0x348, s524 = fp - 0x524, s578 = fp - 0x578, s5b8 = fp - 0x5b8, s5c0 = fp - 0x5c0, s5c8 = fp - 0x5c8, s5d0 = fp - 0x5d0, s5d8 = fp - 0x5d8, s5e0 = fp - 0x5e0, s604 = fp - 0x604, s690 = fp - 0x690, s6a8 = fp - 0x6a8, s6b8 = fp - 0x6b8, s6f8 = fp - 0x6f8, s718 = fp - 0x718, s7c8 = fp - 0x7c8, s7d8 = fp - 0x7d8, s7e8 = fp - 0x7e8, s7f0 = fp - 0x7f0, s7f8 = fp - 0x7f8, s800 = fp - 0x800, s810 = fp - 0x810, s820 = fp - 0x820, s830 = fp - 0x830, s840 = fp - 0x840, s850 = fp - 0x850, s860 = fp - 0x860, s870 = fp - 0x870, s880 = fp - 0x880, s890 = fp - 0x890, s8a0 = fp - 0x8a0, s8b0 = fp - 0x8b0, s8c0 = fp - 0x8c0, s8d0 = fp - 0x8d0, s8e0 = fp - 0x8e0, s8f0 = fp - 0x8f0, s900 = fp - 0x900, s910 = fp - 0x910, s920 = fp - 0x920, s930 = fp - 0x930, s940 = fp - 0x940, s950 = fp - 0x950, s960 = fp - 0x960, s970 = fp - 0x970, s980 = fp - 0x980, s990 = fp - 0x990, s9a0 = fp - 0x9a0, s9b0 = fp - 0x9b0, s9c0 = fp - 0x9c0, s9d0 = fp - 0x9d0, s9e0 = fp - 0x9e0, s9f0 = fp - 0x9f0, sa00 = fp - 0xa00, sa10 = fp - 0xa10, sa20 = fp - 0xa20, sa30 = fp - 0xa30, sa40 = fp - 0xa40, sa50 = fp - 0xa50, sa60 = fp - 0xa60, sa70 = fp - 0xa70, sa80 = fp - 0xa80, sa90 = fp - 0xa90, saa0 = fp - 0xaa0, sab0 = fp - 0xab0, sac8 = fp - 0xac8, sad0 = fp - 0xad0, sad8 = fp - 0xad8, sae0 = fp - 0xae0, sae8 = fp - 0xae8, saf0 = fp - 0xaf0, saf8 = fp - 0xaf8, sb00 = fp - 0xb00, sb08 = fp - 0xb08, sb10 = fp - 0xb10, sb18 = fp - 0xb18, sb20 = fp - 0xb20
	let o, ab, ac, ad: u64
	st64(s800, b)
	try_accounts_11718(s5d8, c, c, d, e)
	const g = ld64(s5d0)
	const f = ld64(s5d8)
	if (f != 2) {
		ad = Error_with_account_name(s810, f, g, "funder", 6)
		o = ld64(s810)
		st64(a + 0x10, ld64(s810 + 8))
		st64(a + 8, o)
		st32(a, 2)
		return ad
	}
	const i = ld64(e - 0xff8)
	st64(s7f8, g)
	try_accounts_11718(s5d8, c, g)
	const j = ld64(s5d0)
	const h = ld64(s5d8)
	if (h == 2) {
		st64(sac8, j, i, a)
		try_accounts_11b00(s5d8, c, j)
		const l = ld64(s5c8)
		const m = ld64(s5d0)
		const k = ld64(s5d8)
		if (k == 0) {
			ad = Error_with_account_name(sab0, m, l, "position", 8)
			ac = ld64(sab0)
			ab = ld64(sac8 + 0x10)
			st64(ab + 0x10, ld64(sab0 + 8))
			st64(ab + 8, ac)
			st32(ab, 2)
			return ad
		}
		memcpy(s7d8, s5c0, 0xc0)
		st64(s7f0, k, m, l)
		try_accounts_610(s5d8, c)
		const n = ld32(s5d8)
		if (n == 2) {
			ad = Error_with_account_name(saa0, ld64(s5d0), ld64(s5c8), "position_mint", 0xd)
			ac = ld64(saa0)
			ab = ld64(sac8 + 0x10)
			st64(ab + 0x10, ld64(saa0 + 8))
			st64(ab + 8, ac)
			st32(ab, 2)
			return ad
		}
		st64(sae8, ld64(s5c8))
		st64(sae0, ld64(s5d0))
		st64(sad8, ld32(s5d8 + 4))
		memcpy(s6f8, s5c0, 0x40)
		copy(s718, s578, 0x20)
		st64(sad0, ld64(s5b8 + 0x38))
		try_accounts_558(s5d8, c)
		const r = ld64(s5d0)
		const q = ld64(s5d8)
		const p = ld32(s578 + 0x50)
		if (p == 2) {
			ad = Error_with_account_name(sa90, q, r, "position_token_account", 0x16)
			ac = ld64(sa90)
			ab = ld64(sac8 + 0x10)
			st64(ab + 0x10, ld64(sa90 + 8))
			st64(ab + 8, ac)
			st32(ab, 2)
			return ad
		}
		st64(saf0, n)
		memcpy(s6a8, s5c8, 0xa0)
		copy(s604, s524, 0x20)
		st32(s604 + 0x20, ld32(s524 + 0x20))
		st32(s690 + 0x88, p)
		st64(s6b8, q, r)
		const s = ld64(c + 8)
		if (s == 0) {
			ad = anchor_error_from(sa80, 0xbbd /* anchor::AccountNotEnoughKeys */)
			ac = ld64(sa80)
			ab = ld64(sac8 + 0x10)
			st64(ab + 0x10, ld64(sa80 + 8))
			st64(ab + 8, ac)
			st32(ab, 2)
			return ad
		}
		const t: AccountInfo = ld64(c)
		st64(s5e0, t)
		st64(c + 8, s - 1)
		st64(c, t + 0x30)
		try_accounts_11a48(s5d8, c)
		const v = ld64(s5c8)
		const aa = ld64(s5d0)
		const whirlpool: AccountInfo = ld64(s5d8)
		if (whirlpool == 0) {
			ad = Error_with_account_name(sa70, aa, v, 0x100152b28 /* "whirlpool" */, 9)
			ac = ld64(sa70)
			ab = ld64(sac8 + 0x10)
			st64(ab + 0x10, ld64(sa70 + 8))
			st64(ab + 8, ac)
			st32(ab, 2)
			return ad
		}
		st64(saf8, v)
		memcpy(s348, s5c0, 0x278)
		fn_12be8(s5d8, c)
		const x = ld64(s5d0)
		const w = ld64(s5d8)
		if (w == 2) {
			st64(sb00, x)
			fn_122e8(s5d8, c, x)
			const z = ld64(s5d0)
			const y = ld64(s5d8)
			if (y == 2) {
				st64(sd0, z)
				rent_get(s5d8)
				copy(sb0, s5d0, 0x18)
				if (ld64(s5d8) == 0) {
					copyr(sc8, sb0, 0x18)
					const ae = ld64(ld64(s7f0))
					const ai = ld64(ae + 0x18)
					const ah = ld64(ae + 0x10)
					const ag = ld64(ae + 8)
					const af = ld64(ae)
					st64(s20, 0x100154a3f)
					st64(s20 + 0x10, s70)
					st64(s70, af, ag, ah, ai)
					st64(s20 + 8, 0xb)
					st64(s20 + 0x18, 0x20)
					// PDA find_program_address(["lock_config", *s70], program *(ld64(s800)))
					Pubkey_find_program_address(s5d8, s20, 2, ld64(s800))
					copyr(s98, s5d8, 0x20)
					const aj = ld8(s5b8)
					st8(s71, aj)
					st8(ld64(sac8 + 8) + 1, aj)
					const ak = ld64(ld64(s5e0))
					copy(s5d8, ak, 0x20)
					if ((memcmp(s5d8, s98, 0x20) as u32) == 0) {
						st64(s5d8, s5e0, sc8, s7f8, sd0, s7f0, s71, s800)
						ad = fn_b1248(s70, s5d8)
						const au = ld64(s68)
						const at = ld64(s70)
						if (at == 2) {
							const lock_config: AccountInfo = ld64(au)
							if (lock_config.is_writable == 0) {
								anchor_error_from(sa50, 0x7d0 /* anchor::ConstraintMut */, au)
								ad = Error_with_account_name(sa60, ld64(sa50), ld64(sa50 + 8), "lock_config", 0xb)
								ac = ld64(sa60)
								ab = ld64(sac8 + 0x10)
								st64(ab + 0x10, ld64(sa60 + 8))
								st64(ab + 8, ac)
								st32(ab, 2)
								return ad
							}
							AccountInfo_clone(s70, lock_config)
							st64(sb08, fn_143100(s70))
							st64(sb10, au)
							AccountInfo_clone(s5d8, ld64(au))
							AccountInfo_try_data_len(s20, s5d8)
							const ax = ld64(s20 + 8)
							const aw = ld64(s20)
							if (aw != 0x800000000000001a /* Ok */) {
								st64(s20 + 0x10, ld64(s20 + 0x10))
								st64(s20, aw, ax)
								ad = fn_13b430(s890, s20)
								const bl = ld64(s890)
								const bk = ld64(sac8 + 0x10)
								st64(bk + 0x10, ld64(s890 + 8))
								st64(bk + 8, bl)
								st32(bk, 2)
								const bn = ld64(s5c8)
								const bm = ld64(s5d0)
								rc_dec(bm)
								rc_dec(bn)
								const bp = ld64(s68 + 8)
								const bo = ld64(s68)
								rc_dec(bo)
								if (!rc_release(bp)) {
									return ad
								}
								st64(bp + 8, ld64(bp + 8) - 1)
								return ad
							}
							const co = ld64(saf0)
							const ay = __floatundidf(ld64(sc8) * (ax + 0x80))
							const az = fn_14f7f8(ld64(sc8 + 8), ay)
							st64(sb18, 0)
							st64(sb20, fn_151cb0(az, 0))
							const ba = fn_14f3e8(az)
							if ((ld64(sb20) as i64) >= 0) {
								st64(sb18, ba)
							}
							const bb = fn_151a40(az, 0x43efffffffffffff)
							let bi = -1
							if (0 >= (bb as i64)) {
								bi = ld64(sb18)
							}
							const bd = ld64(s5c8)
							const bc = ld64(s5d0)
							rc_dec(bc)
							rc_dec(bd)
							const bg = ld64(s68 + 8)
							const be = ld64(s68)
							let bf = ld64(be) - 1
							st64(be, bf)
							if (bf == 0) {
								bf = ld64(be + 8) - 1
								st64(be + 8, bf)
							}
							let bh = ld64(bg) - 1
							st64(bg, bh)
							if (bh == 0) {
								bh = ld64(bg + 8) - 1
								st64(bg + 8, bh)
							}
							if (bi > ld64(sb08)) {
								anchor_error_from(sa30, 0x7d5 /* anchor::ConstraintRentExempt */, bh, bf)
								ad = Error_with_account_name(sa40, ld64(sa30), ld64(sa30 + 8), "lock_config", 0xb)
								ac = ld64(sa40)
								ab = ld64(sac8 + 0x10)
								st64(ab + 0x10, ld64(sa40 + 8))
								st64(ab + 8, ac)
								st32(ab, 2)
								return ad
							}
							if (ld8(ld64(s7f8) + 0x29) != 0) {
								const bq = ld64(ld64(sad0))
								copyr(s70, bq, 0x20)
								st64(s20, 0x100151f20, 8, s70, 0x20)
								// PDA find_program_address(["position", *bq], program *(ld64(s800)))
								Pubkey_find_program_address(s5d8, s20, 2, ld64(s800))
								copyr(s40, s5d8, 0x20)
								st8(ld64(sac8 + 8), ld8(s5b8))
								const br = ld64(ld64(s7f0))
								copy(s5d8, br, 0x20)
								if ((memcmp(s5d8, s40, 0x20) as u32) != 0) {
									anchor_error_from(s8a0, 0x7d6 /* anchor::ConstraintSeeds */)
									Error_with_account_name(s8b0, ld64(s8a0), ld64(s8a0 + 8), "position", 8)
									const cc = ld64(s8b0 + 8)
									const cb = ld64(s8b0)
									const bw = ld64(ld64(s7f0))
									const ca = ld64(bw + 0x18)
									const bz = ld64(bw + 0x10)
									const by = ld64(bw + 8)
									const bx = ld64(bw)
									copy(s5b8, s40, 0x20)
									st64(s5d8, bx, by, bz, ca)
									ad = fn_13b5c0(s8c0, cb, cc, s5d8, by)
									ac = ld64(s8c0)
									ab = ld64(sac8 + 0x10)
									st64(ab + 0x10, ld64(s8c0 + 8))
									st64(ab + 8, ac)
									st32(ab, 2)
									return ad
								}
								copyr(s20, s7e8, 0x20)
								const bs = whirlpool.key
								copyr(s70, bs, 0x20)
								if ((memcmp(s20, s70, 0x20) as u32) == 0) {
									const ce = ld64(ld64(sad0) + 0x18)
									const cd = ld64(ld64(sb00))
									copyr(s68, cd + 8, 0x18)
									st64(sb08, cd)
									st64(s70, ld64(cd))
									st64(sac8 + 8, ce)
									if ((memcmp(ce, s70, 0x20) as u32) == 0) {
										copyr(s20, bq, 0x20)
										copyr(s70, s7c8, 0x20)
										if ((memcmp(s20, s70, 0x20) as u32) == 0) {
											if (ld8(ld64(s6a8 + 0x10) + 0x29) == 0) {
												anchor_error_from(s9f0, 0x7d0 /* anchor::ConstraintMut */)
												ad = Error_with_account_name(sa00, ld64(s9f0), ld64(s9f0 + 8), "position_token_account", 0x16)
												ac = ld64(sa00)
												ab = ld64(sac8 + 0x10)
												st64(ab + 0x10, ld64(sa00 + 8))
												st64(ab + 8, ac)
												st32(ab, 2)
												return ad
											}
											if (ld64(s690 + 0x40) == 1) {
												if ((memcmp(s690, s7c8, 0x20) as u32) == 0) {
													if (ld8(s690 + 0x6c) != 2) {
														const cm = ld64(sb08)
														copyr(s70, cm, 0x20)
														if ((memcmp(s70, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0) {
															anchor_error_from(s9a0, 0x7dc /* anchor::ConstraintAddress */)
															const cr = Error_with_account_name(s9b0, ld64(s9a0), ld64(s9a0 + 8), "token_2022_program", 0x12)
															const cq = ld64(s9b0 + 8)
															const cp = ld64(s9b0)
															copyr(s5d8, s70, 0x20)
															st64(s5b8, 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */, 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */, 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */, 0xfc8ba1d828f9bdfe /* TOKEN_2022_PROGRAM[3] */) // key TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
															ad = fn_13b5c0(s9c0, cp, cq, s5d8, cr)
															ac = ld64(s9c0)
															ab = ld64(sac8 + 0x10)
															st64(ab + 0x10, ld64(s9c0 + 8))
															st64(ab + 8, ac)
															st32(ab, 2)
															return ad
														}
														st64(sac8 + 8, ld64(s7f8))
														const cn = ld64(sac8 + 0x10)
														memcpy(cn + 0x168, s7f0, 0xd8)
														memcpy(cn + 0x80, s6b8, 0xd8)
														st64(sb08, ld64(sd0))
														memcpy(cn + 0x18, s6f8, 0x40)
														copy(cn + 0x60, s718, 0x20)
														ad = memcpy(cn + 0x260, s348, 0x278)
														st64(cn + 0x4e0, ld64(sb08))
														st64(cn + 0x4d8, ld64(sb00))
														st64(cn + 0x258, ld64(saf8))
														st64(cn + 0x250, aa)
														st64(cn + 0x248, whirlpool)
														st64(cn + 0x240, ld64(sb10))
														st64(cn + 0x160, ld64(sac8))
														st64(cn + 0x158, ld64(sac8 + 8))
														st64(cn + 0x58, ld64(sad0))
														st64(cn + 0x10, ld64(sae8))
														st64(cn + 8, ld64(sae0))
														st32(cn + 4, ld64(sad8))
														st32(cn, co)
														return ad
													}
													anchor_error_from(s9d0, 0x7d3 /* anchor::ConstraintRaw */)
													ad = Error_with_account_name(s9e0, ld64(s9d0), ld64(s9d0 + 8), "position_token_account", 0x16)
													ac = ld64(s9e0)
													ab = ld64(sac8 + 0x10)
													st64(ab + 0x10, ld64(s9e0 + 8))
													st64(ab + 8, ac)
													st32(ab, 2)
													return ad
												}
												anchor_error_from(s980, 0x7d3 /* anchor::ConstraintRaw */)
												ad = Error_with_account_name(s990, ld64(s980), ld64(s980 + 8), "position_token_account", 0x16)
												ac = ld64(s990)
												ab = ld64(sac8 + 0x10)
												st64(ab + 0x10, ld64(s990 + 8))
												st64(ab + 8, ac)
												st32(ab, 2)
												return ad
											}
											anchor_error_from(s960, 0x7d3 /* anchor::ConstraintRaw */)
											ad = Error_with_account_name(s970, ld64(s960), ld64(s960 + 8), "position_token_account", 0x16)
											ac = ld64(s970)
											ab = ld64(sac8 + 0x10)
											st64(ab + 0x10, ld64(s970 + 8))
											st64(ab + 8, ac)
											st32(ab, 2)
											return ad
										}
										anchor_error_from(s930, 0x7dc /* anchor::ConstraintAddress */)
										const cl = Error_with_account_name(s940, ld64(s930), ld64(s930 + 8), "position_mint", 0xd)
										const ck = ld64(s940 + 8)
										const cj = ld64(s940)
										copyr(s5d8, s20, 0x20)
										copy(s5b8, s70, 0x20)
										ad = fn_13b5c0(s950, cj, ck, s5d8, cl)
										ac = ld64(s950)
										ab = ld64(sac8 + 0x10)
										st64(ab + 0x10, ld64(s950 + 8))
										st64(ab + 8, ac)
										st32(ab, 2)
										return ad
									}
									anchor_error_from(s900, 0x7d4 /* anchor::ConstraintOwner */)
									const ci = Error_with_account_name(s910, ld64(s900), ld64(s900 + 8), "position_mint", 0xd)
									const ch = ld64(s910 + 8)
									const cg = ld64(s910)
									const cf = ld64(sac8 + 8)
									copyr(s5d8, cf, 0x20)
									copy(s5b8, s70, 0x20)
									ad = fn_13b5c0(s920, cg, ch, s5d8, ci)
									ac = ld64(s920)
									ab = ld64(sac8 + 0x10)
									st64(ab + 0x10, ld64(s920 + 8))
									st64(ab + 8, ac)
									st32(ab, 2)
									return ad
								}
								anchor_error_from(s8d0, 0x7d1 /* anchor::ConstraintHasOne */)
								const bv = Error_with_account_name(s8e0, ld64(s8d0), ld64(s8d0 + 8), "position", 8)
								const bu = ld64(s8e0 + 8)
								const bt = ld64(s8e0)
								copyr(s5d8, s20, 0x20)
								copy(s5b8, s70, 0x20)
								ad = fn_13b5c0(s8f0, bt, bu, s5d8, bv)
								ac = ld64(s8f0)
								ab = ld64(sac8 + 0x10)
								st64(ab + 0x10, ld64(s8f0 + 8))
								st64(ab + 8, ac)
								st32(ab, 2)
								return ad
							}
							anchor_error_from(sa10, 0x7d0 /* anchor::ConstraintMut */, bh, bf)
							ad = Error_with_account_name(sa20, ld64(sa10), ld64(sa10 + 8), "funder", 6)
							ac = ld64(sa20)
							ab = ld64(sac8 + 0x10)
							st64(ab + 0x10, ld64(sa20 + 8))
							st64(ab + 8, ac)
							st32(ab, 2)
							return ad
						}
						const bj = ld64(sac8 + 0x10)
						st64(bj + 0x10, au)
						st64(bj + 8, at)
						st32(bj, 2)
						return ad
					}
					anchor_error_from(s860, 0x7d6 /* anchor::ConstraintSeeds */)
					Error_with_account_name(s870, ld64(s860), ld64(s860 + 8), "lock_config", 0xb)
					const ar = ld64(s870 + 8)
					const aq = ld64(s870)
					const al = ld64(ld64(s5e0))
					const ap = ld64(al + 0x18)
					const ao = ld64(al + 0x10)
					const an = ld64(al + 8)
					const am = ld64(al)
					copy(s5b8, s98, 0x20)
					st64(s5d8, am, an, ao, ap)
					ad = fn_13b5c0(s880, aq, ar, s5d8, an)
					ac = ld64(s880)
					ab = ld64(sac8 + 0x10)
					st64(ab + 0x10, ld64(s880 + 8))
					st64(ab + 8, ac)
					st32(ab, 2)
					return ad
				}
				ad = fn_13b430(s850, sb0)
				ac = ld64(s850)
				ab = ld64(sac8 + 0x10)
				st64(ab + 0x10, ld64(s850 + 8))
				st64(ab + 8, ac)
				st32(ab, 2)
				return ad
			}
			ad = Error_with_account_name(s840, y, z, "system_program", 0xe)
			ac = ld64(s840)
			ab = ld64(sac8 + 0x10)
			st64(ab + 0x10, ld64(s840 + 8))
			st64(ab + 8, ac)
			st32(ab, 2)
			return ad
		}
		ad = Error_with_account_name(s830, w, x, "token_2022_program", 0x12)
		ac = ld64(s830)
		ab = ld64(sac8 + 0x10)
		st64(ab + 0x10, ld64(s830 + 8))
		st64(ab + 8, ac)
		st32(ab, 2)
		return ad
	}
	ad = Error_with_account_name(s820, h, j, "position_authority", 0x12)
	o = ld64(s820)
	st64(a + 0x10, ld64(s820 + 8))
	st64(a + 8, o)
	st32(a, 2)
	return ad
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
// types [heur]: b: LockPositionContext (the handler ix_lock_position passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_33380(a: u64, b: LockPositionContext): u64 {
	const s8 = fp - 0x8, s38 = fp - 0x38, s58 = fp - 0x58, s70 = fp - 0x70, s78 = fp - 0x78, s98 = fp - 0x98, s99 = fp - 0x99, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s100 = fp - 0x100
	const accounts: LockPositionAccounts = b.accounts
	let p = fn_60480(sd0, accounts.position_token_account, accounts + 0x160)
	let g = ld64(sd0)
	if (g != 2) {
		st64(a + 8, ld64(sd0 + 8))
		st64(a, g)
		return p
	}
	if (ld8(accounts.position_token_account + 0x94) == 2) {
		st64(s38, 0x100159b58, 1, s8, 0, 0)
		// fmt "internal error: entered unreachable code: Position is already locked"
		fn_149478(s38, 0x100159b68)
	}
	if ((ld64(accounts + 0x1b0) | ld64(accounts + 0x1b8)) != 0) {
		const h = accounts.position_mint.info.key
		copyr(sc0, h, 0x20)
		const i = ld8(b + 0x20)
		st64(s38 + 0x20, s99)
		st64(s38 + 0x10, sc0)
		st64(s38, 0x100151f20)
		st8(s99, i)
		st64(s38 + 0x28, 1)
		st64(s38 + 0x18, 0x20)
		st64(s38 + 8, 8)
		p = fn_75db0(se0, accounts, accounts.position_token_account, accounts + 0x4d8, accounts + 0x168, s38, 3)
		g = ld64(se0)
		if (g == 2) {
			const j = ld64(ld64(accounts + 0x168))
			const m = ld64(accounts + 0x240)
			copyr(s98, j, 0x20)
			copy(s78, accounts.position_token_account.owner, 0x20)
			copy(s58, accounts + 0x170, 0x20)
			p = clock_get_13f308(s38)
			if (ld64(s38) == 0) {
				const o = ld64(s38 + 0x28)
				st64(m + 0x20, ld64(s98 + 0x18))
				st64(m + 0x18, ld64(s98 + 0x10))
				st64(m + 0x10, ld64(s98 + 8))
				st64(m + 8, ld64(s98))
				copy(m + 0x30, s70, 0x18)
				st64(m + 0x28, ld64(s78))
				copy(m + 0x48, s58, 0x18)
				const n = ld64(s58 + 0x18)
				st64(m + 0x60, n, o)
				st64(a + 8, n)
				st64(a, 2)
				return p
			}
			const l = ld64(s38 + 8)
			const k = ld64(s38 + 0x10)
			st64(s38 + 0x10, ld64(s38 + 0x18))
			st64(s38, l, k)
			p = fn_13b430(sf0, s38)
			g = ld64(sf0)
			st64(a + 8, ld64(sf0 + 8))
			st64(a, g)
			return p
		}
		st64(a + 8, ld64(se0 + 8))
		st64(a, g)
		return p
	}
	p = fn_87630(s100, 0x3a)
	g = ld64(s100)
	st64(a + 8, ld64(s100 + 8))
	st64(a, g)
	return p
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_token_account, lock_config
function fn_b2cf8(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58
	let m, n: u64
	const f = ld64(b + 0xa0)
	if ((memcmp(b + 0x80, c, 0x20) as u32) == 0) {
		const g = common_is_closed(f)
		if (g == 0) {
			fn_143448(s18, f, g)
			const i = ld64(s18 + 0x10)
			const h = ld64(s18)
			if (h != 0x800000000000001a /* Ok */) {
				const j = ld64(s18 + 8)
				st64(s18, h, j, i)
				fn_13b430(s28, s18)
				const k = ld64(s28)
				if (k != 2) {
					n = Error_with_account_name(s38, k, ld64(s28 + 8), "position_token_account", 0x16)
					m = ld64(s38)
					st64(a + 8, ld64(s38 + 8))
					st64(a, m)
					return n
				}
			} else {
				st64(i, ld64(i) + 1)
			}
		}
	}
	n = fn_65a0(s48, ld64(b + 0x240), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const l = ld64(s48)
	if (l == 2) {
		st64(a + 8, undef)
		st64(a, 2)
		return n
	}
	n = Error_with_account_name(s58, l, ld64(s48 + 8), "lock_config", 0xb)
	m = ld64(s58)
	st64(a + 8, ld64(s58 + 8))
	st64(a, m)
	return n
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

function fn_12be8(a: u64, b: u64, c: u64, d: u64, e: u64) {
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

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: lock_config
function fn_b1248(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, sb0 = fp - 0xb0, sb1 = fp - 0xb1, sd8 = fp - 0xd8, se8 = fp - 0xe8, s110 = fp - 0x110, s150 = fp - 0x150, s170 = fp - 0x170, s190 = fp - 0x190, s1a8 = fp - 0x1a8, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s210 = fp - 0x210, s220 = fp - 0x220, s228 = fp - 0x228, s240 = fp - 0x240, s248 = fp - 0x248, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s328 = fp - 0x328, s330 = fp - 0x330, s360 = fp - 0x360, s368 = fp - 0x368, s370 = fp - 0x370, s378 = fp - 0x378
	let aw, dc, dd, de: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s2e0, f, b)
	if (g != 0) {
		const p = ld64(ld64(b + 0x10))
		st64(s328 + 0x30, p)
		const q = ld64(p)
		copyr(s38, q + 8, 0x18)
		st64(s328 + 0x38, q)
		st64(s40, ld64(q))
		const r = ld64(f)
		copyr(s260, r, 0x20)
		if ((memcmp(s40, s260, 0x20) as u32) == 0) {
			ErrorCode_name(s1a8, 0x100152d40)
			st64(sd8, 0, 1, 0)
			st64(s20, sd8, 0x100159480)
			st8(s20 + 0x18, 3)
			st64(s20 + 0x10, 0x20)
			st64(s38 + 8, 0)
			st64(s40, 0)
			if (ErrorCode_fmt(0x100152d40, s40) == 0) {
				copyr(s228, sd8, 0x18)
				copy(s240, s1a8, 0x18)
				st64(s260 + 8, 0x100152ec6)
				st32(s1e0 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s210, 2)
				st32(s248, 0xb)
				st64(s260 + 0x10, 0x34)
				st64(s260, 0)
				const ba = fn_13b3a8(s2a0, s260)
				const az = ld64(s2a0 + 8)
				const ay = ld64(s2a0)
				const ax = ld64(s328 + 0x38)
				copyr(s260, ax, 0x20)
				copy(s240, r, 0x20)
				de = fn_13b5c0(s2b0, ay, az, s260, ba)
				const bb = ld64(s2b0)
				st64(a + 8, ld64(s2b0 + 8))
				st64(a, bb)
				return de
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s260, 0x1001594b0, 0x1001594d0)
		}
		st64(s328 + 0x28, r)
		st64(s328 + 0x40, a)
		const s = ld64(b + 8)
		const t = __floatundidf(ld64(s) * 0x171)
		const u = fn_14f7f8(ld64(s + 8), t)
		const v = fn_151cb0(u, 0)
		const w = fn_14f3e8(u)
		const x = max((fn_151a40(u, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (v as i64) ? 0 : w, 1)
		let bd: AccountInfo = ld64(s2e0)
		let bj = ld64(s2e0 + 8)
		if (x > g) {
			const y: AccountInfo = ld64(s328 + 0x30)
			const z: LamportsCell = y.lamports
			rc_inc(z)
			const bc: DataCell = y.data
			rc_inc(bc)
			const be: LamportsCell = bd.lamports
			const bf = be.strong
			st64(s328 + 8, bd.key)
			st64(s328 + 0x10, y.executable)
			st64(s328 + 0x18, y.is_writable)
			st64(s328 + 0x20, y.is_signer)
			st64(s328 + 0x28, y.rent_epoch)
			const bi = y.owner
			rc_inc(be, bf)
			const bg: DataCell = bd.data
			const bh = bg.strong
			st64(s328 + 0x30, bi)
			rc_inc(bg, bh)
			const bk: AccountInfo = ld64(ld64(bj + 0x18))
			const bl: LamportsCell = bk.lamports
			const bm = bl.strong
			st64(s328, sat_sub(x, g))
			st64(s360 + 0x10, bd.executable)
			st64(s360 + 0x18, bd.is_writable)
			st64(s360 + 0x20, bd.is_signer)
			st64(s360 + 0x28, bd.rent_epoch)
			st64(s330, bd.owner)
			const bp = bk.key
			rc_inc(bl, bm)
			const bn: DataCell = bk.data
			const bo = bn.strong
			st64(s360, z, bp)
			rc_inc(bn, bo)
			st64(s368, bk.owner)
			const bt = bk.rent_epoch
			const bs = bk.is_signer
			const br = bk.is_writable
			const bq = bk.executable
			st8(s110 + 0x22, ld64(s360 + 0x10))
			st8(s110 + 0x21, ld64(s360 + 0x18))
			st8(s110 + 0x20, ld64(s360 + 0x20))
			st64(s110 + 0x18, ld64(s360 + 0x28))
			st64(s110 + 0x10, ld64(s330))
			st64(s110, be, bg)
			st64(s150 + 0x38, ld64(s328 + 8))
			st8(s150 + 0x32, ld64(s328 + 0x10))
			st8(s150 + 0x31, ld64(s328 + 0x18))
			st8(s150 + 0x30, ld64(s328 + 0x20))
			st64(s150 + 0x28, ld64(s328 + 0x28))
			st64(s150 + 0x20, ld64(s328 + 0x30))
			st64(s150 + 0x18, bc)
			st64(s150 + 0x10, ld64(s360))
			st64(s150 + 8, ld64(s328 + 0x38))
			st8(s150, bs, br, bq)
			st64(s170 + 0x18, bt)
			st64(s170 + 0x10, ld64(s368))
			st64(s170, bl, bn)
			st64(s190 + 0x18, ld64(s360 + 8))
			st64(se8, 8, 0)
			st64(s190, 0, 8, 0)
			de = fn_13d318(s270, s190, ld64(s328))
			aw = ld64(s270)
			if (aw != 2) {
				dd = ld64(s270 + 8)
				dc = ld64(s328 + 0x40)
				st64(dc, aw, dd)
				return de
			}
			bd = ld64(s2e0)
			st64(s328 + 0x28, bd.key)
			bj = ld64(s2e0 + 8)
		}
		const bu: LamportsCell = bd.lamports
		rc_inc(bu)
		const bv: DataCell = bd.data
		rc_inc(bv)
		const bw: AccountInfo = ld64(ld64(bj + 0x18))
		const bx: LamportsCell = bw.lamports
		const by = bx.strong
		st64(s328 + 0x20, bd.executable)
		st64(s328 + 0x30, bd.is_writable)
		st64(s328 + 0x38, bd.is_signer)
		const cc = bd.rent_epoch
		const cd = bd.owner
		const cb = bw.key
		rc_inc(bx, by)
		const bz: DataCell = bw.data
		const ca = bz.strong
		st64(s330, cb, cc, cd, bv, bu)
		rc_inc(bz, ca)
		st64(s360 + 0x28, bw.owner)
		st64(s360 + 0x20, bw.rent_epoch)
		const ci = bw.is_signer
		const ch = bw.is_writable
		const cg = bw.executable
		const ce = ld64(s2e0 + 8)
		const cf = ld64(ld64(ld64(ce + 0x20)))
		copyr(sd8, cf, 0x20)
		const cj = ld8(ld64(ce + 0x28))
		st64(s20, sb1)
		st64(s38 + 8, sd8)
		st64(s40, 0x100154a3f)
		st64(s1a8, s40)
		st64(s1f0 + 8, s1a8)
		st8(s1f0, ci, ch, cg)
		st64(s210 + 0x18, ld64(s360 + 0x20))
		st64(s210 + 0x10, ld64(s360 + 0x28))
		st64(s210, bx, bz)
		st64(s220 + 8, ld64(s330))
		st8(s220 + 2, ld64(s328 + 0x20))
		st8(s220 + 1, ld64(s328 + 0x30))
		st8(s220, ld64(s328 + 0x38))
		st64(s228, ld64(s328))
		st64(s240 + 0x10, ld64(s328 + 8))
		st64(s240 + 8, ld64(s328 + 0x10))
		st64(s240, ld64(s328 + 0x18))
		st64(s248, ld64(s328 + 0x28))
		st64(s328 + 0x38, cj)
		st8(sb1, cj)
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 0xb)
		st64(s1a8 + 8, 3)
		st64(s1e0, 1)
		st64(s260, 0, 8, 0)
		de = fn_13c8b8(s280, s260, 0xf1)
		aw = ld64(s280)
		if (aw != 2) {
			dd = ld64(s280 + 8)
			dc = ld64(s328 + 0x40)
			st64(dc, aw, dd)
			return de
		}
		const ck: AccountInfo = ld64(s2e0)
		const cl: LamportsCell = ck.lamports
		const cs = ck.key
		rc_inc(cl)
		const cm: DataCell = ck.data
		rc_inc(cm)
		const cn: LamportsCell = bw.lamports
		const co = cn.strong
		st64(s328 + 0x10, bw.key)
		st64(s328 + 0x18, ck.executable)
		st64(s328 + 0x20, ck.is_writable)
		st64(s328 + 0x28, ck.is_signer)
		st64(s328 + 0x30, ck.rent_epoch)
		const cr = ck.owner
		rc_inc(cn, co)
		const cp: DataCell = bw.data
		const cq = cp.strong
		st64(s330, cr, cs, cl)
		rc_inc(cp, cq)
		const cx = bw.owner
		const cw = bw.rent_epoch
		const cv = bw.is_signer
		const cu = bw.is_writable
		const ct = bw.executable
		copyr(sd8, cf, 0x20)
		st64(s20, sb1)
		st64(s38 + 8, sd8)
		st64(s40, 0x100154a3f)
		st64(s1a8, s40)
		st64(s1f0 + 8, s1a8)
		st8(s1f0, cv, cu, ct)
		st64(s210, cn, cp, cx, cw)
		st64(s220 + 8, ld64(s328 + 0x10))
		st8(s220 + 2, ld64(s328 + 0x18))
		st8(s220 + 1, ld64(s328 + 0x20))
		st8(s220, ld64(s328 + 0x28))
		st64(s228, ld64(s328 + 0x30))
		st64(s240 + 0x10, ld64(s330))
		st64(s240 + 8, cm)
		copyr(s248, s328, 0x10)
		st8(sb1, ld64(s328 + 0x38))
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 0xb)
		st64(s1a8 + 8, 3)
		st64(s1e0, 1)
		st64(s260, 0, 8, 0)
		de = fn_13cc48(s290, s260, ld64(ld64(ld64(s2e0 + 8) + 0x30)))
		aw = ld64(s290)
		if (aw != 2) {
			dd = ld64(s290 + 8)
			dc = ld64(s328 + 0x40)
			st64(dc, aw, dd)
			return de
		}
	} else {
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0x171)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const ad = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		const m = ld64(s2e0 + 8)
		const n: AccountInfo = ld64(ld64(m + 0x10))
		const o: LamportsCell = n.lamports
		const aa = n.key
		const ae = ld64(s2e0)
		rc_inc(o)
		st64(s328 + 0x38, aa)
		const ab: DataCell = n.data
		const ac = ab.strong
		st64(s328 + 0x30, ab)
		rc_inc(ab, ac)
		const af = ld64(ae + 8)
		const ag = ld64(af)
		st64(s328, ld64(ae))
		st64(s328 + 8, n.executable)
		st64(s328 + 0x10, n.is_writable)
		st64(s328 + 0x18, n.is_signer)
		st64(s328 + 0x20, n.rent_epoch)
		st64(s328 + 0x28, n.owner)
		rc_inc(af, ag)
		const ah = ld64(ae + 0x10)
		rc_inc(ah)
		const ai: AccountInfo = ld64(ld64(m + 0x18))
		const aj: LamportsCell = ai.lamports
		const ak = aj.strong
		st64(s330, o)
		const al: AccountInfo = ld64(s2e0)
		st64(s360 + 8, al.executable)
		st64(s360 + 0x10, al.is_writable)
		st64(s360 + 0x18, al.is_signer)
		st64(s360 + 0x20, al.rent_epoch)
		st64(s360 + 0x28, al.owner)
		const ao = ai.key
		rc_inc(aj, ak)
		const am: DataCell = ai.data
		const an = am.strong
		st64(s368, ao, ad)
		st64(s328 + 0x40, a)
		rc_inc(am, an)
		st64(s370, ai.owner)
		st64(s378, ai.rent_epoch)
		const av = ai.is_signer
		const au = ai.is_writable
		const at = ai.executable
		const ap = ld64(s2e0 + 8)
		const aq = ld64(ld64(ld64(ap + 0x20)))
		copyr(sd8, aq, 0x20)
		const ar = ld8(ld64(ap + 0x28))
		st64(s20, sb1)
		st64(s38 + 8, sd8)
		st64(s40, 0x100154a3f)
		st8(sb1, ar)
		st64(s1a8, s40)
		st64(s1e0 + 0x28, s1a8)
		st8(s1e0 + 0x22, ld64(s360 + 8))
		st8(s1e0 + 0x21, ld64(s360 + 0x10))
		st8(s1e0 + 0x20, ld64(s360 + 0x18))
		st64(s1e0 + 0x18, ld64(s360 + 0x20))
		st64(s1e0 + 0x10, ld64(s360 + 0x28))
		st64(s1e0, af, ah)
		st64(s1f0 + 8, ld64(s328))
		st8(s1f0 + 2, ld64(s328 + 8))
		st8(s1f0 + 1, ld64(s328 + 0x10))
		st8(s1f0, ld64(s328 + 0x18))
		st64(s210 + 0x18, ld64(s328 + 0x20))
		st64(s210 + 0x10, ld64(s328 + 0x28))
		st64(s210 + 8, ld64(s328 + 0x30))
		st64(s210, ld64(s330))
		st64(s220 + 8, ld64(s328 + 0x38))
		st8(s220, av, au, at)
		st64(s228, ld64(s378))
		st64(s240 + 0x10, ld64(s370))
		st64(s240, aj, am)
		st64(s248, ld64(s368))
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 0xb)
		st64(s1a8 + 8, 3)
		st64(s1e0 + 0x30, 1)
		st64(s260, 0, 8, 0)
		de = fn_13cfd8(s2c0, s260, ld64(s360), 0xf1, ld64(ld64(ap + 0x30)))
		aw = ld64(s2c0)
		if (aw != 2) {
			dd = ld64(s2c0 + 8)
			dc = ld64(s328 + 0x40)
			st64(dc, aw, dd)
			return de
		}
	}
	const da = ld64(s328 + 0x40)
	fn_4240(sb0, ld64(s2e0))
	if (ld64(sb0) == 0) {
		de = Error_with_account_name(s2d0, ld64(sb0 + 8), ld64(sb0 + 0x10), "lock_config", 0xb)
		const db = ld64(s2d0)
		st64(da + 8, ld64(s2d0 + 8))
		st64(da, db)
		return de
	}
	const cy = ld64(0x300000000 /* heap bump-allocator cursor */)
	const cz = cy != 0 ? sat_sub(cy, 0x70) & -8 : 0x300007f90
	if (cz > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, cz)
		de = memcpy(cz, sb0, 0x70)
		st64(da + 8, cz)
		st64(da, 2)
		return de
	}
	alloc_handle_alloc_error(8, 0x70)
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

// types [heur]: b: TokenAccount_2 (5 of 7 calls pass one, the others an untyped value: fn_310a0, fn_33380, fn_35bf0, …)
function fn_60480(a: u64, b: TokenAccount_2, c: u64): u64 {
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

// types [heur]: c: TokenAccount_2 (every call passes one: fn_33380, fn_37fd8)
function fn_75db0(a: u64, b: u64, c: TokenAccount_2, d: u64, p5: u64, p6: u64, p7: u64): u64 {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_149478(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	const s20 = fp - 0x20, s28 = fp - 0x28
	st64(s20, 0x10015b8e0, a, b)
	st16(s20 + 0x18, 1)
	st64(s28, 1)
	fn_147238(s28, b, c, d, e)
}

function fn_65a0(a: u64, b: u64, c: u64, d: u64): u64 {
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

function fn_4240(a: u64, b: u64) {
	const s50 = fp - 0x50, s58 = fp - 0x58, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0
	let q: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0) {
		anchor_error_from(sc0, 0xbc4 /* anchor::AccountNotInitialized */)
		q = ld64(sc0)
		st64(a + 0x10, ld64(sc0 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return
	}
	const g = memcmp(f, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s70, b, g as u32)
		const p = ld64(s70 + 0x10)
		const l = ld64(s70 + 8)
		const k = ld64(s70)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s80 + 8, ld64(l + 8))
			st64(s80, m)
			fn_103d98(s70, s80, 0x800000000000001a /* Ok */)
			const n = ld64(s70 + 0x10)
			const o = ld64(s70 + 8)
			if (ld64(s70) == 0) {
				memcpy(a + 0x18, s58, 0x58)
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
			st64(s70, k, l, p)
			fn_13b430(sb0, s70)
			q = ld64(sb0)
			st64(a + 0x10, ld64(sb0 + 8))
			st64(a + 8, q)
			st64(a, 0)
		}
	} else {
		const j = anchor_error_from(s90, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const i = ld64(s90 + 8)
		const h = ld64(s90)
		copyr(s70, f, 0x20)
		st64(s50, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		fn_13b5c0(sa0, h, i, s70, j)
		q = ld64(sa0)
		st64(a + 0x10, ld64(sa0 + 8))
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

function fn_130da0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64) {
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_147238(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	fn_1478b8(a, b, c, d, e)
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

function fn_103d98(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s10 = fp - 0x10, s31 = fp - 0x31, s40 = fp - 0x40, s58 = fp - 0x58, s59 = fp - 0x59, s70 = fp - 0x70
	let i, k, l, m: u64
	const f = ld64(b + 8)
	if (7 >= f) {
		fn_14c4f0(8, f, 0x10015a858, d, e)
	}
	B5: {
		if (f - 8 >= 0x20) {
			const g = ld64(b)
			const h = ld64(g + 0xe)
			st8(s40 + 8, ld8(g + 0x16))
			st64(s40, h)
			if (f - 0x28 >= 0x20) {
				const w = ld64(s40 + 1)
				const q = ld64(g + 0x2e)
				st8(s40 + 8, ld8(g + 0x36))
				st64(s40, q)
				if (f - 0x48 >= 0x20) {
					const t = ld64(s40 + 1)
					const r = ld64(g + 0x4e)
					st8(s40 + 8, ld8(g + 0x56))
					st64(s40, r)
					if ((f & -8) != 0x68 && f != 0x70) {
						const u = ld64(s40 + 1)
						const v = ld64(g + 0x68)
						const s = ld8(g + 0x70)
						st8(s59, s)
						if (s == 0) {
							st32(s58, ld32(g + 8))
							st16(s58 + 4, ld16(g + 0xc))
							st8(s31 + 0x10, ld8(g + 0x27))
							copyr(s31, g + 0x17, 0x10)
							st16(s31 + 0x15, ld16(g + 0x2c))
							st32(s31 + 0x11, ld32(g + 0x28))
							st8(a + 0x47, ld8(g + 0x47))
							st64(a + 0x3f, ld64(g + 0x3f))
							st64(a + 0x37, ld64(g + 0x37))
							st32(a + 0x48, ld32(g + 0x48))
							st16(a + 0x4c, ld16(g + 0x4c))
							copy(a + 0x57, g + 0x57, 0x10)
							st8(a + 0x67, ld8(g + 0x67))
							st8(s58 + 6, h)
							st64(s58 + 7, w)
							st64(s40 + 7, w)
							st64(s40, ld64(s58))
							st64(a + 0x26, ld64(s31 + 0xf))
							st64(a + 0x20, ld64(s31 + 9))
							st64(a + 0x18, ld64(s31 + 1))
							st64(a + 0x10, ld64(s40 + 8))
							st64(a + 8, ld64(s40))
							st64(a + 0x68, v)
							st64(a + 0x4f, u)
							st8(a + 0x4e, r)
							st64(a + 0x2f, t)
							st8(a + 0x2e, q)
							st64(a, 0)
							return
						}
						st64(s40, 0x100159668)
						st64(s31 + 1, s10)
						st64(s10, s59, num_fmt_bae8)
						st64(s31 + 0x11, 0)
						st64(s40 + 8, 1)
						st64(s31 + 9, 1)
						// fmt "Unexpected variant index: {}" {} = s [num_fmt_bae8]
						fn_147e78(s58, s40, h, r, t)
						i = fn_b580(s58)
						break B5
					}
				}
			}
		}
		i = fn_1459d0(0x100159468)
	}
	const j = i
	st64(s58, i)
	anchor_error_from(s70, 0xbbb /* anchor::AccountDidNotDeserialize */, k, l, m)
	const o = ld64(s70 + 8)
	const p = ld64(s70)
	if (2 > (i & 3) - 2) {
		st64(a + 0x10, o)
		st64(a + 8, p)
		st64(a, 1)
	} else if ((j & 3) == 0) {
		st64(a + 0x10, o)
		st64(a + 8, p)
		st64(a, 1)
	} else {
		const n = ld64(ld64(j + 7))
		callx(n, ld64(j - 1), n)
		st64(a + 0x10, o)
		st64(a + 8, p)
		st64(a, 1)
	}
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_1478b8(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	custom_panic(a, b, c, d, e)
	abort()
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_14c4f0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c4f8(a, b, c, d, e)
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

function fn_14f060(a: u64, b: u64): u64 {
	return fn_14ecd0(ld64(a), 1, b)
}
