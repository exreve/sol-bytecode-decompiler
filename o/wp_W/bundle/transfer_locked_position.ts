// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction transfer_locked_position: handler + 21 reachable functions
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
interface TransferLockedPositionAccounts { // Accounts struct of instruction transfer_locked_position as accounts_transfer_locked_position returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	position_mint:             at<0x00, Mint> // Account<Mint> in place
	position_token_account:    at<0x80, TokenAccount_2> // Account<TokenAccount> in place
	destination_token_account: at<0x158, TokenAccount_2> // Account<TokenAccount> in place
	position_authority:        at<0x230, ref<AccountInfo>>
}
interface TransferLockedPositionContext { // anchor_lang Context of instruction transfer_locked_position (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<TransferLockedPositionAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function try_accounts_558(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::interface_account::InterfaceAccount<T> as anchor_lang::Accounts<B>…
declare function try_accounts_610(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function ptr_drop_in_place_c1b0(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 4]>
declare function fn_c3b8(a: u64): void // lib
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11b00(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_12230(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_12cf58(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib uses raw_vec_handle_error
declare function fn_12d0a0(a: u64, b: u64, r0: u64): void // lib uses raw_vec_handle_error
declare function fn_1390d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcmp, AccountInfo_try_borrow_lamports, AccountInfo_try_borrow_data
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp

// instruction handler: transfer_locked_position (discriminator sha256("global:transfer_locked_position")[..8] = 0x8ac28a432ee579b3)
// accounts [str: the program's account-error strings, in order of first use]: position_authority, receiver, position, position_mint, position_token_account, destination_token_account, lock_config, token_2022_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
function ix_transfer_locked_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s310 = fp - 0x310, s318 = fp - 0x318, s328 = fp - 0x328, s638 = fp - 0x638, s648 = fp - 0x648, s650 = fp - 0x650, s660 = fp - 0x660, s661 = fp - 0x661, s678 = fp - 0x678, s688 = fp - 0x688, sff8 = fp - 0xff8
	let i: u64
	sol_log("Instruction: TransferLockedPosition", 0x23)
	st8(s661, 0xff)
	st64(s660, accounts, accounts_len)
	st64(sff8, s661)
	let j = accounts_transfer_locked_position(s328, program_id, s660, undef, fp)
	const f = ld32(s328)
	if (f == 2) {
		i = ld64(s328 + 8)
		st64(a + 8, ld64(s318))
		st64(a, i)
		return j
	}
	const k = ld32(s328 + 4)
	const h = ld64(s328 + 8)
	const g = ld64(s318)
	memcpy(s638, s310, 0x310)
	st64(s648, h, g)
	st32(s650, f, k)
	st8(s310 + 8, ld8(s661))
	copyr(s318, s660, 0x10)
	st64(s328, program_id, s650)
	j = fn_37fd8(s678, s328)
	i = ld64(s678)
	if (i == 2) {
		j = fn_ce0e0(s688, s650, program_id)
		i = ld64(s688)
		st64(a + 8, ld64(s688 + 8))
		st64(a, i)
		return j
	}
	st64(a + 8, ld64(s678 + 8))
	st64(a, i)
	return j
}

// Anchor Accounts::try_accounts of instruction transfer_locked_position (called by ix_transfer_locked_position; name [str]: from the handler's "Instruction: …" log; was fn_cc8f8)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_authority, receiver (AccountNotEnoughKeys, ConstraintMut), position (ConstraintSeeds), position_mint (ConstraintAddress), position_token_account (ConstraintMut, ConstraintRaw), destination_token_account (ConstraintMut, ConstraintRaw), lock_config (ConstraintMut, ConstraintHasOne), token_2022_program (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position, position_token_account, destination_token_account
function accounts_transfer_locked_position(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s84 = fp - 0x84, sd8 = fp - 0xd8, s118 = fp - 0x118, s120 = fp - 0x120, s128 = fp - 0x128, s130 = fp - 0x130, s138 = fp - 0x138, s15c = fp - 0x15c, s1e8 = fp - 0x1e8, s200 = fp - 0x200, s210 = fp - 0x210, s234 = fp - 0x234, s2c0 = fp - 0x2c0, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s328 = fp - 0x328, s348 = fp - 0x348, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s510 = fp - 0x510, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s560 = fp - 0x560, s570 = fp - 0x570, s580 = fp - 0x580, s590 = fp - 0x590, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s698 = fp - 0x698, s6c0 = fp - 0x6c0, s6c8 = fp - 0x6c8
	let h, j, k, l, aj, ar, at, au: u64
	st64(s698 + 0x20, b)
	try_accounts_11718(s138, c, c, d, e)
	const i = ld64(s130)
	const f = ld64(s138)
	if (f != 2) {
		au = Error_with_account_name(s430, f, i, "position_authority", 0x12)
		j = ld64(s430)
		st64(a + 0x10, ld64(s430 + 8))
		st64(a + 8, j)
		st32(a, 2)
		return au
	}
	const n = ld64(e - 0xff8)
	const g = ld64(c + 8)
	if (g == 0) {
		anchor_error_from(s440, 0xbbd /* anchor::AccountNotEnoughKeys */, undef, k, l)
		h = ld64(s440 + 8)
		const m = ld64(s440)
		if (m != 2) {
			au = Error_with_account_name(s450, m, h, "receiver", 8)
			j = ld64(s450)
			st64(a + 0x10, ld64(s450 + 8))
			st64(a + 8, j)
			st32(a, 2)
			return au
		}
	} else {
		st64(c + 8, g - 1)
		h = ld64(c)
		st64(c, h + 0x30)
	}
	st64(s698, i, n, h, a)
	try_accounts_11b00(s138, c, h, k, l)
	const p = ld64(s128)
	const q = ld64(s130)
	const position: AccountInfo = ld64(s138)
	if (position == 0) {
		au = Error_with_account_name(s670, q, p, "position", 8)
		at = ld64(s670)
		ar = ld64(s698 + 0x18)
		st64(ar + 0x10, ld64(s670 + 8))
		st64(ar + 8, at)
		st32(ar, 2)
		return au
	}
	memcpy(s408, s120, 0xc0)
	st64(s420, position, q, p)
	try_accounts_610(s138, c)
	const r = ld32(s138)
	if (r == 2) {
		au = Error_with_account_name(s660, ld64(s130), ld64(s128), "position_mint", 0xd)
		at = ld64(s660)
		ar = ld64(s698 + 0x18)
		st64(ar + 0x10, ld64(s660 + 8))
		st64(ar + 8, at)
		st32(ar, 2)
		return au
	}
	st64(s6c0 + 0x18, r)
	copyr(s6c0, s130, 0x10)
	st64(s6c0 + 0x10, ld32(s138 + 4))
	memcpy(s328, s120, 0x40)
	copy(s348, sd8, 0x20)
	st64(s6c0 + 0x20, ld64(s118 + 0x38))
	try_accounts_558(s138, c)
	const u = ld64(s130)
	const t = ld64(s138)
	const s = ld32(sd8 + 0x50)
	if (s == 2) {
		au = Error_with_account_name(s650, t, u, "position_token_account", 0x16)
		at = ld64(s650)
		ar = ld64(s698 + 0x18)
		st64(ar + 0x10, ld64(s650 + 8))
		st64(ar + 8, at)
		st32(ar, 2)
		return au
	}
	st64(s6c8, u)
	memcpy(s2d8, s128, 0xa0)
	copy(s234, s84, 0x20)
	st32(s234 + 0x20, ld32(s84 + 0x20))
	st32(s2c0 + 0x88, s)
	st64(s2e8 + 8, ld64(s6c8))
	st64(s2e8, t)
	try_accounts_558(s138, c)
	const x = ld64(s130)
	const w = ld64(s138)
	const v = ld32(sd8 + 0x50)
	if (v == 2) {
		au = Error_with_account_name(s640, w, x, "destination_token_account", 0x19)
		at = ld64(s640)
		ar = ld64(s698 + 0x18)
		st64(ar + 0x10, ld64(s640 + 8))
		st64(ar + 8, at)
		st32(ar, 2)
		return au
	}
	st64(s6c8, x)
	memcpy(s200, s128, 0xa0)
	copy(s15c, s84, 0x20)
	st32(s15c + 0x20, ld32(s84 + 0x20))
	st32(s1e8 + 0x88, v)
	st64(s210 + 8, ld64(s6c8))
	st64(s210, w)
	fn_2678(s138, c)
	const ab = ld64(s130)
	const y = ld64(s138)
	if (y == 2) {
		fn_12be8(s138, c)
		const aa = ld64(s130)
		const z = ld64(s138)
		if (z == 2) {
			if (ld8(ld64(s698 + 0x10) + 0x29) == 0) {
				anchor_error_from(s620, 0x7d0 /* anchor::ConstraintMut */, aa)
				au = Error_with_account_name(s630, ld64(s620), ld64(s620 + 8), "receiver", 8)
				at = ld64(s630)
				ar = ld64(s698 + 0x18)
				st64(ar + 0x10, ld64(s630 + 8))
				st64(ar + 8, at)
				st32(ar, 2)
				return au
			}
			st64(s6c8, ab)
			const ac = ld64(ld64(s6c0 + 0x20))
			copyr(s20, ac, 0x20)
			st64(s40, 0x100151f20, 8, s20, 0x20)
			// PDA find_program_address(["position", *ac], program *(ld64(s698 + 0x20)))
			Pubkey_find_program_address(s138, s40, 2, ld64(s698 + 0x20))
			copyr(s60, s138, 0x20)
			st8(ld64(s698 + 8), ld8(s118))
			const ad = position.key
			copyr(s138, ad, 0x20)
			if ((memcmp(s138, s60, 0x20) as u32) != 0) {
				anchor_error_from(s480, 0x7d6 /* anchor::ConstraintSeeds */)
				Error_with_account_name(s490, ld64(s480), ld64(s480 + 8), "position", 8)
				const aq = ld64(s490 + 8)
				const ap = ld64(s490)
				const ak = ld64(ld64(s420))
				const ao = ld64(ak + 0x18)
				const an = ld64(ak + 0x10)
				const am = ld64(ak + 8)
				const al = ld64(ak)
				copy(s118, s60, 0x20)
				st64(s138, al, am, an, ao)
				au = fn_13b5c0(s4a0, ap, aq, s138, am)
				at = ld64(s4a0)
				ar = ld64(s698 + 0x18)
				st64(ar + 0x10, ld64(s4a0 + 8))
				st64(ar + 8, at)
				st32(ar, 2)
				return au
			}
			copyr(s40, ac, 0x20)
			copyr(s20, s3f8, 0x20)
			const ae = memcmp(s40, s20, 0x20)
			const ai = ld64(s698 + 0x18)
			if ((ae as u32) == 0) {
				st64(s698 + 0x20, aa)
				const position_token_account: AccountInfo = ld64(s2d8 + 0x10)
				if (position_token_account.is_writable == 0) {
					anchor_error_from(s600, 0x7d0 /* anchor::ConstraintMut */)
					au = Error_with_account_name(s610, ld64(s600), ld64(s600 + 8), "position_token_account", 0x16)
					aj = ld64(s610)
					st64(ai + 0x10, ld64(s610 + 8))
					st64(ai + 8, aj)
					st32(ai, 2)
					return au
				}
				if (ld64(s2c0 + 0x40) == 1) {
					if ((memcmp(s2c0, s3f8, 0x20) as u32) == 0) {
						const destination_token_account: AccountInfo = ld64(s200 + 0x10)
						if (destination_token_account.is_writable != 0) {
							if ((memcmp(s1e8, s3f8, 0x20) as u32) == 0) {
								const ax = destination_token_account.key
								copyr(s20, ax, 0x20)
								const ay = position_token_account.key
								copyr(s138, ay, 0x20)
								if ((memcmp(s20, s138, 0x20) as u32) != 0) {
									if (ld8(ld64(ld64(s6c8)) + 0x29) != 0) {
										const az = ld64(s6c8)
										copyr(s40, az + 8, 0x20)
										copyr(s20, ad, 0x20)
										if ((memcmp(s40, s20, 0x20) as u32) != 0) {
											anchor_error_from(s540, 0x7d1 /* anchor::ConstraintHasOne */)
											const bg = Error_with_account_name(s550, ld64(s540), ld64(s540 + 8), "lock_config", 0xb)
											const bf = ld64(s550 + 8)
											const be = ld64(s550)
											copy(s138, s40, 0x40)
											au = fn_13b5c0(s560, be, bf, s138, bg)
											at = ld64(s560)
											ar = ld64(s698 + 0x18)
											st64(ar + 0x10, ld64(s560 + 8))
											st64(ar + 8, at)
											st32(ar, 2)
											return au
										}
										const ba = ld64(ld64(s698 + 0x20))
										copyr(s20, ba, 0x20)
										if ((memcmp(s20, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) == 0) {
											const bh = ld64(s698 + 0x18)
											memcpy(bh + 0x240, s420, 0xd8)
											memcpy(bh + 0x80, s2e8, 0xd8)
											memcpy(bh + 0x158, s210, 0xd8)
											au = memcpy(bh + 0x18, s328, 0x40)
											const bl = ld64(s348 + 0x18)
											const bk = ld64(s348 + 0x10)
											const bj = ld64(s348 + 8)
											const bi = ld64(s348)
											copy(bh + 8, s6c0, 0x10)
											st64(bh + 0x58, ld64(s6c0 + 0x20))
											st64(bh + 0x230, ld64(s698))
											st64(bh + 0x238, ld64(s698 + 0x10))
											st64(bh + 0x318, ld64(s6c8))
											st64(bh + 0x320, ld64(s698 + 0x20))
											st32(bh + 4, ld64(s6c0 + 0x10))
											st32(bh, ld64(s6c0 + 0x18))
											st64(bh + 0x60, bi, bj, bk, bl)
											return au
										}
										anchor_error_from(s570, 0x7dc /* anchor::ConstraintAddress */)
										const bd = Error_with_account_name(s580, ld64(s570), ld64(s570 + 8), "token_2022_program", 0x12)
										const bc = ld64(s580 + 8)
										const bb = ld64(s580)
										copyr(s138, s20, 0x20)
										st64(s118, 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */, 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */, 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */, 0xfc8ba1d828f9bdfe /* TOKEN_2022_PROGRAM[3] */) // key TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
										au = fn_13b5c0(s590, bb, bc, s138, bd)
										at = ld64(s590)
										ar = ld64(s698 + 0x18)
										st64(ar + 0x10, ld64(s590 + 8))
										st64(ar + 8, at)
										st32(ar, 2)
										return au
									}
									anchor_error_from(s5a0, 0x7d0 /* anchor::ConstraintMut */)
									au = Error_with_account_name(s5b0, ld64(s5a0), ld64(s5a0 + 8), "lock_config", 0xb)
									at = ld64(s5b0)
									ar = ld64(s698 + 0x18)
									st64(ar + 0x10, ld64(s5b0 + 8))
									st64(ar + 8, at)
									st32(ar, 2)
									return au
								}
								anchor_error_from(s5c0, 0x7d3 /* anchor::ConstraintRaw */)
								au = Error_with_account_name(s5d0, ld64(s5c0), ld64(s5c0 + 8), "destination_token_account", 0x19)
								at = ld64(s5d0)
								ar = ld64(s698 + 0x18)
								st64(ar + 0x10, ld64(s5d0 + 8))
								st64(ar + 8, at)
								st32(ar, 2)
								return au
							}
							anchor_error_from(s520, 0x7d3 /* anchor::ConstraintRaw */)
							au = Error_with_account_name(s530, ld64(s520), ld64(s520 + 8), "destination_token_account", 0x19)
							at = ld64(s530)
							ar = ld64(s698 + 0x18)
							st64(ar + 0x10, ld64(s530 + 8))
							st64(ar + 8, at)
							st32(ar, 2)
							return au
						}
						anchor_error_from(s5e0, 0x7d0 /* anchor::ConstraintMut */)
						au = Error_with_account_name(s5f0, ld64(s5e0), ld64(s5e0 + 8), "destination_token_account", 0x19)
						at = ld64(s5f0)
						ar = ld64(s698 + 0x18)
						st64(ar + 0x10, ld64(s5f0 + 8))
						st64(ar + 8, at)
						st32(ar, 2)
						return au
					}
					anchor_error_from(s500, 0x7d3 /* anchor::ConstraintRaw */)
					au = Error_with_account_name(s510, ld64(s500), ld64(s500 + 8), "position_token_account", 0x16)
					aj = ld64(s510)
					st64(ai + 0x10, ld64(s510 + 8))
					st64(ai + 8, aj)
					st32(ai, 2)
					return au
				}
				anchor_error_from(s4e0, 0x7d3 /* anchor::ConstraintRaw */)
				au = Error_with_account_name(s4f0, ld64(s4e0), ld64(s4e0 + 8), "position_token_account", 0x16)
				aj = ld64(s4f0)
				st64(ai + 0x10, ld64(s4f0 + 8))
				st64(ai + 8, aj)
				st32(ai, 2)
				return au
			}
			anchor_error_from(s4b0, 0x7dc /* anchor::ConstraintAddress */)
			const ah = Error_with_account_name(s4c0, ld64(s4b0), ld64(s4b0 + 8), "position_mint", 0xd)
			const ag = ld64(s4c0 + 8)
			const af = ld64(s4c0)
			copy(s138, s40, 0x40)
			au = fn_13b5c0(s4d0, af, ag, s138, ah)
			aj = ld64(s4d0)
			st64(ai + 0x10, ld64(s4d0 + 8))
			st64(ai + 8, aj)
			st32(ai, 2)
			return au
		}
		au = Error_with_account_name(s470, z, aa, "token_2022_program", 0x12)
		at = ld64(s470)
		ar = ld64(s698 + 0x18)
		st64(ar + 0x10, ld64(s470 + 8))
		st64(ar + 8, at)
		st32(ar, 2)
		return au
	}
	au = Error_with_account_name(s460, y, ab, "lock_config", 0xb)
	at = ld64(s460)
	ar = ld64(s698 + 0x18)
	st64(ar + 0x10, ld64(s460 + 8))
	st64(ar + 8, at)
	st32(ar, 2)
	return au
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// types [heur]: b: TransferLockedPositionContext (the handler ix_transfer_locked_position passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_37fd8(a: u64, b: TransferLockedPositionContext): u64 {
	const s8 = fp - 0x8, s9 = fp - 0x9, s30 = fp - 0x30, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0
	let m, t, v, w, x: u64
	const accounts: TransferLockedPositionAccounts = b.accounts
	const position_authority: AccountInfo = accounts.position_authority
	const h: LamportsCell = position_authority.lamports
	const j = position_authority.key
	rc_inc(h)
	const i: DataCell = position_authority.data
	let y = b
	rc_inc(i)
	const k = position_authority.is_signer
	const l = memcmp(accounts.position_token_account.owner, j, 0x20)
	if (k == 0 || (l as u32) != 0) {
		v = fn_87630(s70, 0x13)
		m = ld64(s70)
		if (m != 2) {
			t = ld64(s70 + 8)
			rc_dec(h)
			if (!rc_release(i)) {
				st64(a + 8, t)
				st64(a, m)
				return v
			}
			i.weak = i.weak - 1
			st64(a + 8, t)
			st64(a, m)
			return v
		}
	}
	rc_dec(h)
	const o = y
	rc_dec(i)
	if (ld8(accounts.position_token_account + 0x94) == 2) {
		const n = accounts.position_mint.info.key
		copyr(s30, n, 0x20)
		const p = ld8(o + 0x20)
		st64(s60 + 0x20, s9)
		st64(s60 + 0x10, s30)
		st64(s60, 0x100151f20)
		y = p
		st8(s9, p)
		st64(s60 + 0x28, 1)
		st64(s60 + 0x18, 0x20)
		st64(s60 + 8, 8)
		v = fn_76a10(s80, accounts, accounts.position_token_account, accounts + 0x320, accounts + 0x240, s60, 3)
		m = ld64(s80)
		if (m == 2) {
			v = fn_77670(s90, accounts + 0x230, accounts, accounts.position_token_account, accounts.destination_token_account, accounts + 0x320)
			m = ld64(s90)
			if (m == 2) {
				const q = accounts.position_mint.info.key
				copyr(s30, q, 0x20)
				st64(s60, 0x100151f20)
				st64(s60 + 0x10, s30)
				st64(s60 + 0x20, s9)
				st8(s9, y)
				st64(s60 + 8, 8)
				st64(s60 + 0x18, 0x20)
				st64(s60 + 0x28, 1)
				v = fn_75db0(sa0, accounts, accounts.destination_token_account, accounts + 0x320, accounts + 0x240, s60, 3)
				m = ld64(sa0)
				if (m == 2) {
					v = fn_785b0(sb0, accounts + 0x230, accounts.position_token_account, accounts + 0x320, ld64(accounts + 0x238))
					m = ld64(sb0)
					if (m == 2) {
						const u = ld64(accounts.destination_token_account.owner)
						t = ld64(accounts.destination_token_account.owner + 8)
						const s = ld64(accounts.destination_token_account.owner + 0x10)
						const r = ld64(accounts + 0x318)
						st64(r + 0x40, ld64(accounts.destination_token_account.owner + 0x18))
						st64(r + 0x38, s)
						st64(r + 0x30, t)
						st64(r + 0x28, u)
						st64(a + 8, t)
						st64(a, 2)
						return v
					}
					st64(a + 8, ld64(sb0 + 8))
					st64(a, m)
					return v
				}
				st64(a + 8, ld64(sa0 + 8))
				st64(a, m)
				return v
			}
			st64(a + 8, ld64(s90 + 8))
			st64(a, m)
			return v
		}
		st64(a + 8, ld64(s80 + 8))
		st64(a, m)
		return v
	}
	st64(s60, 0x100159b98, 1, s8, 0, 0)
	// fmt "internal error: entered unreachable code: Position has to be locked for this instruction"
	fn_149478(s60, 0x100159ba8, o, w, x)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_token_account, destination_token_account, lock_config
function fn_ce0e0(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78
	let s, t: u64
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
					t = Error_with_account_name(s38, k, ld64(s28 + 8), "position_token_account", 0x16)
					s = ld64(s38)
					st64(a + 8, ld64(s38 + 8))
					st64(a, s)
					return t
				}
			} else {
				st64(i, ld64(i) + 1)
			}
		}
	}
	const l = ld64(b + 0x178)
	if ((memcmp(b + 0x158, c, 0x20) as u32) == 0) {
		const m = common_is_closed(l)
		if (m == 0) {
			fn_143448(s18, l, m)
			const o = ld64(s18 + 0x10)
			const n = ld64(s18)
			if (n != 0x800000000000001a /* Ok */) {
				const p = ld64(s18 + 8)
				st64(s18, n, p, o)
				fn_13b430(s48, s18)
				const q = ld64(s48)
				if (q != 2) {
					t = Error_with_account_name(s58, q, ld64(s48 + 8), "destination_token_account", 0x19)
					s = ld64(s58)
					st64(a + 8, ld64(s58 + 8))
					st64(a, s)
					return t
				}
			} else {
				st64(o, ld64(o) + 1)
			}
		}
	}
	t = fn_65a0(s68, ld64(b + 0x318), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const r = ld64(s68)
	if (r == 2) {
		st64(a + 8, undef)
		st64(a, 2)
		return t
	}
	t = Error_with_account_name(s78, r, ld64(s68 + 8), "lock_config", 0xb)
	s = ld64(s78)
	st64(a + 8, ld64(s78 + 8))
	st64(a, s)
	return t
}

function fn_2678(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s70 = fp - 0x70
	try_accounts_12230(s70, b, c, d, e)
	if (ld64(s70) == 0) {
		const h = ld64(s70 + 8)
		st64(a + 8, ld64(s70 + 0x10))
		st64(a, h)
	} else {
		const f = ld64(0x300000000 /* heap bump-allocator cursor */)
		const g = f != 0 ? sat_sub(f, 0x70) & -8 : 0x300007f90
		if (0x300000007 >= g) {
			alloc_handle_alloc_error(8, 0x70)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, s70, 0x70)
		st64(a + 8, g)
		st64(a, 2)
	}
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

// types [heur]: b: TransferLockedPositionAccounts (every call passes one: fn_37fd8); c: TokenAccount_2 (every call passes one: fn_37fd8)
function fn_76a10(a: u64, b: TransferLockedPositionAccounts, c: TokenAccount_2, d: u64, p5: u64, p6: u64, p7: u64): u64 {
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
	const info: AccountInfo = b.position_mint.info
	const m: LamportsCell = info.lamports
	const s = info.key
	rc_inc(m)
	const n: DataCell = info.data
	rc_inc(n)
	const p: AccountInfo = ld64(o)
	const q = p.key
	copyr(s108, q, 0x20)
	st64(s1000, s108, 8, 0)
	fn_1313f0(se8, r, bg, s, s108, 8, 0)
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
		const z: LamportsCell = info.lamports
		const av = info.key
		const aw = f.executable
		const ax = f.is_writable
		const ay = f.is_signer
		const az = f.rent_epoch
		const ba = f.owner
		rc_inc(z)
		const aa: DataCell = info.data
		rc_inc(aa)
		const ac: LamportsCell = p.lamports
		const ap = p.key
		const aq = info.executable
		const ar = info.is_writable
		const at = info.is_signer
		const au = info.rent_epoch
		const aj = info.owner
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

// types [heur]: c: TransferLockedPositionAccounts (every call passes one: fn_37fd8); d: TokenAccount_2 (every call passes one: fn_37fd8); p5: TokenAccount_2 (every call passes one: fn_37fd8)
function fn_77670(a: u64, b: u64, c: TransferLockedPositionAccounts, d: TokenAccount_2, p5: TokenAccount_2, p6: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s48 = fp - 0x48, s50 = fp - 0x50, s78 = fp - 0x78, s80 = fp - 0x80, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sd8 = fp - 0xd8, se0 = fp - 0xe0, se8 = fp - 0xe8, s100 = fp - 0x100, s108 = fp - 0x108, s120 = fp - 0x120, s150 = fp - 0x150, s168 = fp - 0x168, s170 = fp - 0x170, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1000 = fp - 0x1000
	let aq, ar, at, au: u64
	let br = b
	const f: AccountInfo = d.info
	const g: LamportsCell = f.lamports
	const h = ld64(p6)
	const i = f.key
	let bs = ld64(h)
	rc_inc(g)
	let bq = i
	const j: DataCell = f.data
	const n: TokenAccount_2 = p5
	rc_inc(j)
	let bp = h
	const info: AccountInfo = c.position_mint.info
	const l: LamportsCell = info.lamports
	const u = info.key
	rc_inc(l)
	const m: DataCell = info.data
	rc_inc(m)
	const o: AccountInfo = n.info
	const p: LamportsCell = o.lamports
	const t = o.key
	rc_inc(p)
	const q: DataCell = o.data
	rc_inc(q)
	const r = ld64(br)
	br = r
	const s = ld64(r)
	st64(s1000 + 0x28, c.position_mint.decimals)
	st64(s1000, t, s, 8, 0, 1)
	fn_131a40(s108, bs, bq, u, t, s, 8, 0, 1, ld64(s1000 + 0x28))
	copy(s120, s100, 0x18)
	const v = ld64(s108)
	if (v == 0x8000000000000000) {
		fn_13b430(s1a8, s120)
		aq = ld64(s1a8 + 8)
		au = ld64(s1a8)
	} else {
		memcpy(s150, se8, 0x30)
		st64(s170, v)
		copy(s168, s120, 0x18)
		const w: AccountInfo = bp
		const x = ld64(bp + 8)
		const z = ld64(bp)
		rc_inc(x)
		const y: DataCell = w.data
		bq = x
		rc_inc(y)
		const aa: LamportsCell = f.lamports
		const bk = f.key
		const bl = w.executable
		const bm = w.is_writable
		const bn = w.is_signer
		const bo = w.rent_epoch
		const af = w.owner
		rc_inc(aa)
		const ab: DataCell = f.data
		rc_inc(ab)
		const ac: LamportsCell = info.lamports
		bs = ac
		const bf = info.key
		const bg = f.executable
		const bh = f.is_writable
		const bi = f.is_signer
		const bj = f.rent_epoch
		bp = f.owner
		rc_inc(ac)
		const ad: DataCell = info.data
		rc_inc(ad)
		const ae: LamportsCell = o.lamports
		const ba = o.key
		const bb = info.executable
		const bc = info.is_writable
		const bd = info.is_signer
		const be = info.rent_epoch
		const ah = info.owner
		rc_inc(ae)
		const ag: DataCell = o.data
		const ai: AccountInfo = br
		rc_inc(ag)
		const aj: LamportsCell = ai.lamports
		const av = ai.key
		const aw = o.executable
		const ax = o.is_writable
		const ay = o.is_signer
		const az = o.rent_epoch
		const ap = o.owner
		rc_inc(aj)
		const ak: DataCell = ai.data
		rc_inc(ak)
		const ao = ai.owner
		const an = ai.rent_epoch
		const am = ai.is_signer
		const al = ai.is_writable
		st8(s20 + 2, ai.executable)
		st8(s20, am, al)
		st64(s48, av, aj, ak, ao, an)
		st8(s50, ay, ax, aw)
		st64(s78, ba, ae, ag, ap, az)
		st8(s80, bd, bc, bb)
		st64(sa8, bf, bs, ad, ah, be)
		st8(sb0, bi, bh, bg)
		st64(sd8, bk, aa, ab, bp, bj)
		st8(se0, bn, bm, bl)
		st64(s108, z, bq, y, af, bo)
		fn_1390b0(s188, s170, s108, 5)
		if (ld64(s188) == 0x800000000000001a /* Ok */) {
			fn_c3b8(s108)
			at = a
			ar = l
			rc_dec(p)
			aq = q
			if (rc_release(q)) {
				st64(aq + 8, ld64(aq + 8) - 1)
			}
			rc_dec(ar)
			rc_dec(m)
			rc_dec(g)
			if (!rc_release(j)) {
				st64(at + 8, aq)
				st64(at, 2)
				return ar
			}
			j.weak = j.weak - 1
			st64(at + 8, aq)
			st64(at, 2)
			return ar
		}
		copyr(s18, s188, 0x18)
		fn_13b430(s198, s18)
		aq = ld64(s198 + 8)
		au = ld64(s198)
		fn_c3b8(s108)
	}
	at = a
	ar = q
	rc_dec(p)
	rc_dec(ar)
	rc_dec(l)
	rc_dec(m)
	rc_dec(g)
	if (!rc_release(j)) {
		st64(at + 8, aq)
		st64(at, au)
		return ar
	}
	j.weak = j.weak - 1
	st64(at + 8, aq)
	st64(at, au)
	return ar
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

// types [heur]: c: TokenAccount_2 (every call passes one: fn_37fd8)
function fn_785b0(a: u64, b: u64, c: TokenAccount_2, d: u64, e: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s48 = fp - 0x48, s50 = fp - 0x50, s78 = fp - 0x78, s80 = fp - 0x80, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sd0 = fp - 0xd0, sd8 = fp - 0xd8, sf0 = fp - 0xf0, s120 = fp - 0x120, s138 = fp - 0x138, s140 = fp - 0x140, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let s, ag, ah, ai: u64
	let ay: AccountInfo = e
	let ax = b
	const f: AccountInfo = c.info
	const g: LamportsCell = f.lamports
	const h: AccountInfo = ld64(d)
	const m = f.key
	const l = h.key
	rc_inc(g)
	const i: DataCell = f.data
	rc_inc(i)
	const k = ay.key
	const j: AccountInfo = ld64(ax)
	st64(s1000, j.key)
	st64(sff8, 8, 0)
	ax = k
	fn_130750(sd8, l, m, k, ld64(s1000), 8, 0)
	copy(sf0, sd0, 0x18)
	const n = ld64(sd8)
	if (n == 0x8000000000000000) {
		ai = fn_13b430(s178, sf0)
		s = ld64(s178 + 8)
		ah = ld64(s178)
	} else {
		memcpy(s120, sb8, 0x30)
		st64(s140, n)
		copy(s138, sf0, 0x18)
		const o: LamportsCell = h.lamports
		const y = h.key
		rc_inc(o)
		const p: DataCell = h.data
		rc_inc(p)
		const q: LamportsCell = f.lamports
		const ar = f.key
		const at = h.executable
		const au = h.is_writable
		const av = h.is_signer
		const aw = h.rent_epoch
		const t = h.owner
		rc_inc(q)
		const r: DataCell = f.data
		rc_inc(r)
		s = ay.lamports
		const an = f.executable
		const ao = f.is_writable
		const ap = f.is_signer
		const aq = f.rent_epoch
		const v = f.owner
		rc_inc(s)
		const u: DataCell = ay.data
		rc_inc(u)
		const w: LamportsCell = j.lamports
		const aj = j.key
		const ak = ay.executable
		const al = ay.is_writable
		const am = ay.is_signer
		const ad = ay.rent_epoch
		ay = ay.owner
		rc_inc(w)
		const x: DataCell = j.data
		rc_inc(x)
		const ac = j.owner
		const ab = j.rent_epoch
		const aa = j.is_signer
		const z = j.is_writable
		st8(s20 + 2, j.executable)
		st8(s20, aa, z)
		st64(s48, aj, w, x, ac, ab)
		st8(s50, am, al, ak)
		st64(s78, ax, s, u, ay, ad)
		st8(s80, ap, ao, an)
		st64(sa8, ar, q, r, v, aq)
		st8(sb0, av, au, at)
		st64(sd8, y, o, p, t, aw)
		const ae = fn_1390b0(s158, s140, sd8, 4)
		if (ld64(s158) == 0x800000000000001a /* Ok */) {
			ai = ptr_drop_in_place_c1b0(sd8, ae)
			rc_dec(g)
			ag = a
			if (!rc_release(i)) {
				st64(ag + 8, s)
				st64(ag, 2)
				return ai
			}
			i.weak = i.weak - 1
			st64(ag + 8, s)
			st64(ag, 2)
			return ai
		}
		copyr(s18, s158, 0x18)
		const af = fn_13b430(s168, s18)
		s = ld64(s168 + 8)
		ah = ld64(s168)
		ai = ptr_drop_in_place_c1b0(sd8, af)
	}
	ag = a
	rc_dec(g)
	if (!rc_release(i)) {
		st64(ag + 8, s)
		st64(ag, ah)
		return ai
	}
	i.weak = i.weak - 1
	st64(ag + 8, s)
	st64(ag, ah)
	return ai
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

function fn_1313f0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64) {
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
	const m = fn_12e9c0(s80, 0x100155f18)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it), c (points to it), b (value), a (points to it), p5 (points to it), p6 (points to it), p9 (value), p10 (value)
function fn_131a40(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s80 = fp - 0x80
	let l, m, w, x, y: u64
	const f = memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20)
	const h = p10
	const g = p9
	const i = p8
	let o = p7
	const z = p6
	const aa = p5
	if ((f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	st8(s40, h)
	st64(s50 + 8, g)
	st32(s50, 0xc)
	const n = fn_12e9c0(s80, s50)
	let j = i + 4
	if (j == 0) {
		st64(s68, 0, 1, 0)
		copyr(s50, c, 0x20)
		fn_12d0a0(s68, c, n)
		m = undef
		j = ld64(s68)
		l = ld64(s68 + 8)
	} else {
		const k = j
		if (j > 0x3c3c3c3c3c3c3c3) {
			raw_vec_handle_error(0, k * 0x22, w, x, y)
		}
		l = __rust_alloc(k * 0x22, 1)
		if (l == 0) {
			raw_vec_handle_error(1, k * 0x22, w, x, y)
		}
		st64(s68, j, l)
		m = c
		copyr(s50, c, 0x20)
	}
	st64(l + 0x18, ld64(s38))
	st64(l + 0x10, ld64(s40))
	st64(l + 8, ld64(s50 + 8))
	st64(l, ld64(s50))
	st16(l + 0x20, 0x100)
	st64(s68 + 0x10, 1)
	if (j == 1) {
		fn_12d0a0(s68, m, l)
		j = ld64(s68)
		l = ld64(s68 + 8)
	}
	st64(l + 0x3a, ld64(d + 0x18))
	st64(l + 0x32, ld64(d + 0x10))
	st64(l + 0x2a, ld64(d + 8))
	st64(l + 0x22, ld64(d))
	st16(l + 0x42, 0)
	st64(s68 + 0x10, 2)
	if (j == 2) {
		fn_12d0a0(s68, d, l)
		j = ld64(s68)
		l = ld64(s68 + 8)
	}
	let v = b
	st64(l + 0x5c, ld64(aa + 0x18))
	st64(l + 0x54, ld64(aa + 0x10))
	st64(l + 0x4c, ld64(aa + 8))
	st64(l + 0x44, ld64(aa))
	st16(l + 0x64, 0x100)
	st64(s68 + 0x10, 3)
	if (j == 3) {
		fn_12d0a0(s68, aa, l)
		v = b
		l = ld64(s68 + 8)
	}
	st64(l + 0x7e, ld64(z + 0x18))
	st64(l + 0x76, ld64(z + 0x10))
	st64(l + 0x6e, ld64(z + 8))
	st64(l + 0x66, ld64(z))
	st8(l + 0x86, i == 0, 0)
	st64(s68 + 0x10, 4)
	if (i != 0) {
		let r = 4
		let p = 0
		let s = i << 3
		do {
			const t = ld64(o)
			copyr(s40, t + 0x10, 0x10)
			const u = ld64(t + 8)
			st64(s50 + 8, u)
			st64(s50, ld64(t))
			if (r == ld64(s68)) {
				fn_12d0a0(s68, u, l)
				v = b
				l = ld64(s68 + 8)
			}
			o = o + 8
			const q = l + p
			st64(q + 0xa0, ld64(s38))
			st64(q + 0x98, ld64(s40))
			st64(q + 0x90, ld64(s50 + 8))
			st64(q + 0x88, ld64(s50))
			st16(q + 0xa8, 1)
			p = p + 0x22
			r = r + 1
			st64(s68 + 0x10, r)
			s = s - 8
		} while (s != 0)
	}
	copyr(s20, v, 0x20)
	copy(s50, s68, 0x18)
	copy(s38, s80, 0x18)
	memcpy(a, s50, 0x50)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), c (points to it)
function fn_1390b0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1000 = fp - 0x1000
	st64(s1000, 8, 0)
	return fn_1390d8(a, b, c, d, fp)
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

function fn_130750(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64) {
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
	const m = fn_12e9c0(s80, 0x100155e78)
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
	st16(k + 0x42, 0x100)
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
