// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction close_position_with_token_extensions: handler + 22 reachable functions
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
interface ClosePositionWithTokenExtensionsAccounts { // Accounts struct of instruction close_position_with_token_extensions as accounts_close_position_with_token_extensions returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	position_mint:          at<0x00, Mint> // Account<Mint> in place
	position_token_account: at<0x80, TokenAccount_2> // Account<TokenAccount> in place
	position_authority:     at<0x158, ref<AccountInfo>>
}
interface ClosePositionWithTokenExtensionsContext { // anchor_lang Context of instruction close_position_with_token_extensions (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<ClosePositionWithTokenExtensionsAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function sol_memset(dst: u64, byte: u64, n: u64): void // memset
declare function try_accounts_558(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::interface_account::InterfaceAccount<T> as anchor_lang::Accounts<B>…
declare function try_accounts_610(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function ptr_drop_in_place_c1b0(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 4]>
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11b00(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_12cf58(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib uses raw_vec_handle_error
declare function fn_12d0a0(a: u64, b: u64, r0: u64): void // lib uses raw_vec_handle_error
declare function fn_1390d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcmp, AccountInfo_try_borrow_lamports, AccountInfo_try_borrow_data
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function AccountInfo_assign(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::assign
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp

// instruction handler: close_position_with_token_extensions (discriminator sha256("global:close_position_with_token_extensions")[..8] = 0xdf63199b3b87b601)
// accounts [str: the program's account-error strings, in order of first use]: position_authority, receiver, position, position_mint, position_token_account, token_2022_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
function ix_close_position_with_token_extensions(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s230 = fp - 0x230, s238 = fp - 0x238, s248 = fp - 0x248, s478 = fp - 0x478, s488 = fp - 0x488, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4a1 = fp - 0x4a1, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, sff8 = fp - 0xff8
	let i: u64
	sol_log("Instruction: ClosePositionWithTokenExtensions", 0x2d)
	st8(s4a1, 0xff)
	st64(s4a0, accounts, accounts_len)
	st64(sff8, s4a1)
	let j = accounts_close_position_with_token_extensions(s248, program_id, s4a0, undef, fp)
	const f = ld32(s248)
	if (f == 2) {
		i = ld64(s248 + 8)
		st64(a + 8, ld64(s238))
		st64(a, i)
		return j
	}
	const k = ld32(s248 + 4)
	const h = ld64(s248 + 8)
	const g = ld64(s238)
	memcpy(s478, s230, 0x230)
	st64(s488, h, g)
	st32(s490, f, k)
	st8(s230 + 8, ld8(s4a1))
	copyr(s238, s4a0, 0x10)
	st64(s248, program_id, s490)
	j = fn_310a0(s4b8, s248)
	i = ld64(s4b8)
	if (i == 2) {
		j = fn_8d1d0(s4c8, s490, program_id)
		i = ld64(s4c8)
		st64(a + 8, ld64(s4c8 + 8))
		st64(a, i)
		return j
	}
	st64(a + 8, ld64(s4b8 + 8))
	st64(a, i)
	return j
}

// Anchor Accounts::try_accounts of instruction close_position_with_token_extensions (called by ix_close_position_with_token_extensions; name [str]: from the handler's "Instruction: …" log; was fn_8bd50)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_authority, receiver (AccountNotEnoughKeys, ConstraintMut), position (ConstraintSeeds, ConstraintMut, ConstraintClose), position_mint (ConstraintMut, ConstraintOwner, ConstraintAddress), position_token_account (ConstraintMut, ConstraintRaw), token_2022_program (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position, receiver, position_mint
function accounts_close_position_with_token_extensions(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s84 = fp - 0x84, sd8 = fp - 0xd8, s118 = fp - 0x118, s120 = fp - 0x120, s128 = fp - 0x128, s130 = fp - 0x130, s138 = fp - 0x138, s15c = fp - 0x15c, s1e8 = fp - 0x1e8, s200 = fp - 0x200, s210 = fp - 0x210, s250 = fp - 0x250, s270 = fp - 0x270, s320 = fp - 0x320, s330 = fp - 0x330, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s580 = fp - 0x580, s5a8 = fp - 0x5a8, s5b0 = fp - 0x5b0
	let h, j, k, l, ao, ap, aq: u64
	st64(s580 + 0x20, b)
	try_accounts_11718(s138, c, c, d, e)
	const i = ld64(s130)
	const f = ld64(s138)
	if (f != 2) {
		aq = Error_with_account_name(s358, f, i, "position_authority", 0x12)
		j = ld64(s358)
		st64(a + 0x10, ld64(s358 + 8))
		st64(a + 8, j)
		st32(a, 2)
		return aq
	}
	const n = ld64(e - 0xff8)
	const g = ld64(c + 8)
	if (g == 0) {
		anchor_error_from(s368, 0xbbd /* anchor::AccountNotEnoughKeys */, undef, k, l)
		h = ld64(s368 + 8)
		const m = ld64(s368)
		if (m != 2) {
			aq = Error_with_account_name(s378, m, h, "receiver", 8)
			j = ld64(s378)
			st64(a + 0x10, ld64(s378 + 8))
			st64(a + 8, j)
			st32(a, 2)
			return aq
		}
	} else {
		st64(c + 8, g - 1)
		h = ld64(c)
		st64(c, h + 0x30)
	}
	st64(s580, i, n, h, a)
	try_accounts_11b00(s138, c, h, k, l)
	const p = ld64(s128)
	const q = ld64(s130)
	const position: AccountInfo = ld64(s138)
	if (position == 0) {
		aq = Error_with_account_name(s558, q, p, "position", 8)
		ap = ld64(s558)
		ao = ld64(s580 + 0x18)
		st64(ao + 0x10, ld64(s558 + 8))
		st64(ao + 8, ap)
		st32(ao, 2)
		return aq
	}
	memcpy(s330, s120, 0xc0)
	st64(s348, position, q, p)
	try_accounts_610(s138, c)
	const r = ld32(s138)
	if (r == 2) {
		aq = Error_with_account_name(s548, ld64(s130), ld64(s128), "position_mint", 0xd)
		ap = ld64(s548)
		ao = ld64(s580 + 0x18)
		st64(ao + 0x10, ld64(s548 + 8))
		st64(ao + 8, ap)
		st32(ao, 2)
		return aq
	}
	st64(s5a8 + 0x18, r)
	copyr(s5a8, s130, 0x10)
	st64(s5a8 + 0x10, ld32(s138 + 4))
	memcpy(s250, s120, 0x40)
	copy(s270, sd8, 0x20)
	st64(s5a8 + 0x20, ld64(s118 + 0x38))
	try_accounts_558(s138, c)
	const u = ld64(s130)
	const t = ld64(s138)
	const s = ld32(sd8 + 0x50)
	if (s == 2) {
		aq = Error_with_account_name(s538, t, u, "position_token_account", 0x16)
		ap = ld64(s538)
		ao = ld64(s580 + 0x18)
		st64(ao + 0x10, ld64(s538 + 8))
		st64(ao + 8, ap)
		st32(ao, 2)
		return aq
	}
	st64(s5b0, u)
	memcpy(s200, s128, 0xa0)
	copy(s15c, s84, 0x20)
	st32(s15c + 0x20, ld32(s84 + 0x20))
	st32(s1e8 + 0x88, s)
	st64(s210 + 8, ld64(s5b0))
	st64(s210, t)
	fn_12be8(s138, c)
	const x = ld64(s130)
	const v = ld64(s138)
	if (v == 2) {
		const receiver: AccountInfo = ld64(s580 + 0x10)
		if (receiver.is_writable == 0) {
			anchor_error_from(s518, 0x7d0 /* anchor::ConstraintMut */, x)
			aq = Error_with_account_name(s528, ld64(s518), ld64(s518 + 8), "receiver", 8)
			ap = ld64(s528)
			ao = ld64(s580 + 0x18)
			st64(ao + 0x10, ld64(s528 + 8))
			st64(ao + 8, ap)
			st32(ao, 2)
			return aq
		}
		st64(s5b0, x)
		const y = ld64(ld64(s5a8 + 0x20))
		copyr(s20, y, 0x20)
		st64(s40, 0x100151f20, 8, s20, 0x20)
		// PDA find_program_address(["position", *y], program *(ld64(s580 + 0x20)))
		Pubkey_find_program_address(s138, s40, 2, ld64(s580 + 0x20))
		copyr(s60, s138, 0x20)
		st8(ld64(s580 + 8), ld8(s118))
		const z = position.key
		copyr(s138, z, 0x20)
		if ((memcmp(s138, s60, 0x20) as u32) != 0) {
			anchor_error_from(s398, 0x7d6 /* anchor::ConstraintSeeds */)
			Error_with_account_name(s3a8, ld64(s398), ld64(s398 + 8), "position", 8)
			const an = ld64(s3a8 + 8)
			const am = ld64(s3a8)
			const ah = ld64(ld64(s348))
			const al = ld64(ah + 0x18)
			const ak = ld64(ah + 0x10)
			const aj = ld64(ah + 8)
			const ai = ld64(ah)
			copy(s118, s60, 0x20)
			st64(s138, ai, aj, ak, al)
			aq = fn_13b5c0(s3b8, am, an, s138, aj)
			ap = ld64(s3b8)
			ao = ld64(s580 + 0x18)
			st64(ao + 0x10, ld64(s3b8 + 8))
			st64(ao + 8, ap)
			st32(ao, 2)
			return aq
		}
		if (position.is_writable == 0) {
			anchor_error_from(s4f8, 0x7d0 /* anchor::ConstraintMut */)
			aq = Error_with_account_name(s508, ld64(s4f8), ld64(s4f8 + 8), "position", 8)
			ap = ld64(s508)
			ao = ld64(s580 + 0x18)
			st64(ao + 0x10, ld64(s508 + 8))
			st64(ao + 8, ap)
			st32(ao, 2)
			return aq
		}
		copyr(s20, z, 0x20)
		const aa = receiver.key
		copyr(s138, aa, 0x20)
		if ((memcmp(s20, s138, 0x20) as u32) == 0) {
			anchor_error_from(s4d8, 0x7db /* anchor::ConstraintClose */)
			aq = Error_with_account_name(s4e8, ld64(s4d8), ld64(s4d8 + 8), "position", 8)
			ap = ld64(s4e8)
			ao = ld64(s580 + 0x18)
			st64(ao + 0x10, ld64(s4e8 + 8))
			st64(ao + 8, ap)
			st32(ao, 2)
			return aq
		}
		const position_mint: AccountInfo = ld64(s5a8 + 0x20)
		if (position_mint.is_writable == 0) {
			anchor_error_from(s4b8, 0x7d0 /* anchor::ConstraintMut */)
			aq = Error_with_account_name(s4c8, ld64(s4b8), ld64(s4b8 + 8), "position_mint", 0xd)
			ap = ld64(s4c8)
			ao = ld64(s580 + 0x18)
			st64(ao + 0x10, ld64(s4c8 + 8))
			st64(ao + 8, ap)
			st32(ao, 2)
			return aq
		}
		const ad = position_mint.owner
		const ac = ld64(ld64(s5b0))
		copyr(s20, ac, 0x20)
		if ((memcmp(ad, s20, 0x20) as u32) != 0) {
			anchor_error_from(s3c8, 0x7d4 /* anchor::ConstraintOwner */)
			const au = Error_with_account_name(s3d8, ld64(s3c8), ld64(s3c8 + 8), "position_mint", 0xd)
			const at = ld64(s3d8 + 8)
			const ar = ld64(s3d8)
			copyr(s138, ad, 0x20)
			copy(s118, s20, 0x20)
			aq = fn_13b5c0(s3e8, ar, at, s138, au)
			ap = ld64(s3e8)
			ao = ld64(s580 + 0x18)
			st64(ao + 0x10, ld64(s3e8 + 8))
			st64(ao + 8, ap)
			st32(ao, 2)
			return aq
		}
		copyr(s40, y, 0x20)
		copyr(s20, s320, 0x20)
		if ((memcmp(s40, s20, 0x20) as u32) == 0) {
			if (ld8(ld64(s200 + 0x10) + 0x29) == 0) {
				anchor_error_from(s498, 0x7d0 /* anchor::ConstraintMut */)
				aq = Error_with_account_name(s4a8, ld64(s498), ld64(s498 + 8), "position_token_account", 0x16)
				ap = ld64(s4a8)
				ao = ld64(s580 + 0x18)
				st64(ao + 0x10, ld64(s4a8 + 8))
				st64(ao + 8, ap)
				st32(ao, 2)
				return aq
			}
			if (ld64(s1e8 + 0x40) != 1) {
				anchor_error_from(s428, 0x7d3 /* anchor::ConstraintRaw */)
				aq = Error_with_account_name(s438, ld64(s428), ld64(s428 + 8), "position_token_account", 0x16)
				ap = ld64(s438)
				ao = ld64(s580 + 0x18)
				st64(ao + 0x10, ld64(s438 + 8))
				st64(ao + 8, ap)
				st32(ao, 2)
				return aq
			}
			if ((memcmp(s1e8, s320, 0x20) as u32) == 0) {
				copyr(s20, ac, 0x20)
				if ((memcmp(s20, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0) {
					anchor_error_from(s468, 0x7dc /* anchor::ConstraintAddress */)
					const bc = Error_with_account_name(s478, ld64(s468), ld64(s468 + 8), "token_2022_program", 0x12)
					const bb = ld64(s478 + 8)
					const ba = ld64(s478)
					copyr(s138, s20, 0x20)
					st64(s118, 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */, 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */, 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */, 0xfc8ba1d828f9bdfe /* TOKEN_2022_PROGRAM[3] */) // key TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
					aq = fn_13b5c0(s488, ba, bb, s138, bc)
					ap = ld64(s488)
					ao = ld64(s580 + 0x18)
					st64(ao + 0x10, ld64(s488 + 8))
					st64(ao + 8, ap)
					st32(ao, 2)
					return aq
				}
				const av = ld64(s580 + 0x18)
				memcpy(av + 0x168, s348, 0xd8)
				memcpy(av + 0x80, s210, 0xd8)
				aq = memcpy(av + 0x18, s250, 0x40)
				const az = ld64(s270 + 0x18)
				const ay = ld64(s270 + 0x10)
				const ax = ld64(s270 + 8)
				const aw = ld64(s270)
				copy(av + 8, s5a8, 0x10)
				st64(av + 0x58, ld64(s5a8 + 0x20))
				st64(av + 0x158, ld64(s580))
				st64(av + 0x160, ld64(s580 + 0x10))
				st64(av + 0x240, ld64(s5b0))
				st32(av + 4, ld64(s5a8 + 0x10))
				st32(av, ld64(s5a8 + 0x18))
				st64(av + 0x60, aw, ax, ay, az)
				return aq
			}
			anchor_error_from(s448, 0x7d3 /* anchor::ConstraintRaw */)
			aq = Error_with_account_name(s458, ld64(s448), ld64(s448 + 8), "position_token_account", 0x16)
			ap = ld64(s458)
			ao = ld64(s580 + 0x18)
			st64(ao + 0x10, ld64(s458 + 8))
			st64(ao + 8, ap)
			st32(ao, 2)
			return aq
		}
		anchor_error_from(s3f8, 0x7dc /* anchor::ConstraintAddress */)
		const ag = Error_with_account_name(s408, ld64(s3f8), ld64(s3f8 + 8), "position_mint", 0xd)
		const af = ld64(s408 + 8)
		const ae = ld64(s408)
		copy(s138, s40, 0x40)
		aq = fn_13b5c0(s418, ae, af, s138, ag)
		ap = ld64(s418)
		ao = ld64(s580 + 0x18)
		st64(ao + 0x10, ld64(s418 + 8))
		st64(ao + 8, ap)
		st32(ao, 2)
		return aq
	}
	aq = Error_with_account_name(s388, v, x, "token_2022_program", 0x12)
	ap = ld64(s388)
	ao = ld64(s580 + 0x18)
	st64(ao + 0x10, ld64(s388 + 8))
	st64(ao + 8, ap)
	st32(ao, 2)
	return aq
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// types [heur]: b: ClosePositionWithTokenExtensionsContext (the handler ix_close_position_with_token_extensions passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_310a0(a: u64, b: ClosePositionWithTokenExtensionsContext): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98
	const accounts: ClosePositionWithTokenExtensionsAccounts = b.accounts
	let j = fn_60480(s68, accounts.position_token_account, accounts + 0x158)
	let g = ld64(s68)
	if (g != 2) {
		st64(a + 8, ld64(s68 + 8))
		st64(a, g)
		return j
	}
	if (ld8(accounts.position_token_account + 0x94) == 2) {
		j = fn_87630(s98, 0x3b)
		g = ld64(s98)
		st64(a + 8, ld64(s98 + 8))
		st64(a, g)
		return j
	}
	if ((ld64(accounts + 0x200) | ld64(accounts + 0x218)) != 0) {
		j = fn_87630(s88, 5)
		g = ld64(s88)
		st64(a + 8, ld64(s88 + 8))
		st64(a, g)
		return j
	}
	if (ld64(accounts + 0x1e0) != 0) {
		j = fn_87630(s88, 5)
		g = ld64(s88)
		st64(a + 8, ld64(s88 + 8))
		st64(a, g)
		return j
	}
	if ((ld64(accounts + 0x1b0) | ld64(accounts + 0x1b8)) != 0) {
		j = fn_87630(s88, 5)
		g = ld64(s88)
		st64(a + 8, ld64(s88 + 8))
		st64(a, g)
		return j
	}
	if ((ld64(accounts + 0x230) | ld64(accounts + 0x1e8)) != 0) {
		j = fn_87630(s88, 5)
		g = ld64(s88)
		st64(a + 8, ld64(s88 + 8))
		st64(a, g)
		return j
	}
	const h = accounts.position_mint.info.key
	copyr(s28, h, 0x20)
	const i = ld8(b + 0x20)
	st64(s58 + 0x20, s1)
	st64(s58 + 0x10, s28)
	st64(s58, 0x100151f20)
	st8(s1, i)
	st64(s58 + 0x28, 1)
	st64(s58 + 0x18, 0x20)
	st64(s58 + 8, 8)
	j = fn_737c0(s78, accounts + 0x158, accounts + 0x160, accounts, accounts.position_token_account, accounts + 0x240, accounts + 0x168, s58, 3)
	g = ld64(s78)
	if (g != 2) {
		st64(a + 8, ld64(s78 + 8))
		st64(a, g)
		return j
	}
	st64(a + 8, undef)
	st64(a, 2)
	return j
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position, position_mint, position_token_account
function fn_8d1d0(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0
	let ad, af: u64
	const f: AccountInfo = ld64(b + 0x160)
	const g: LamportsCell = f.lamports
	const m = f.key
	rc_inc(g)
	const h: DataCell = f.data
	rc_inc(h)
	const l = f.owner
	const k = f.rent_epoch
	const j = f.is_signer
	const i = f.is_writable
	st8(s38 + 2, f.executable)
	st8(s38, j, i)
	st64(s60, m, g, h, l, k)
	const n: AccountInfo = ld64(b + 0x168)
	const o: LamportsCell = n.lamports
	const u = n.key
	rc_inc(o)
	const p: DataCell = n.data
	rc_inc(p)
	const t = n.owner
	const s = n.rent_epoch
	const r = n.is_signer
	const q = n.is_writable
	st8(s8 + 2, n.executable)
	st8(s8, r, q)
	st64(s30, u, o, p, t, s)
	fn_13aee8(s70, s30, s60, p, t)
	const v = ld64(s70)
	if (v != 2) {
		ad = Error_with_account_name(s80, v, ld64(s70 + 8), "position", 8)
		af = ld64(s80)
		st64(a + 8, ld64(s80 + 8))
		st64(a, af)
		return ad
	}
	const w = ld64(b + 0x58)
	if ((memcmp(b + 0x60, c, 0x20) as u32) == 0) {
		const x = common_is_closed(w)
		if (x == 0) {
			fn_143448(s30, w, x)
			const z = ld64(s30 + 0x10)
			const y = ld64(s30)
			if (y != 0x800000000000001a /* Ok */) {
				const aa = ld64(s30 + 8)
				st64(s30, y, aa, z)
				fn_13b430(s90, s30)
				const ab = ld64(s90)
				if (ab != 2) {
					ad = Error_with_account_name(sa0, ab, ld64(s90 + 8), "position_mint", 0xd)
					af = ld64(sa0)
					st64(a + 8, ld64(sa0 + 8))
					st64(a, af)
					return ad
				}
			} else {
				st64(z, ld64(z) + 1)
			}
		}
	}
	const ag = ld64(b + 0xa0)
	const ac = memcmp(b + 0x80, c, 0x20)
	let ae = undef
	ad = ac as u32
	if (ad != 0) {
		st64(a + 8, ae)
		st64(a, 2)
		return ad
	}
	ad = common_is_closed(ag)
	ae = undef
	if (ad != 0) {
		st64(a + 8, ae)
		st64(a, 2)
		return ad
	}
	ad = fn_143448(s30, ag, ad)
	ae = ld64(s30 + 0x10)
	const ah = ld64(s30)
	if (ah != 0x800000000000001a /* Ok */) {
		const ai = ld64(s30 + 8)
		st64(s30, ah, ai, ae)
		ad = fn_13b430(sb0, s30)
		ae = undef
		const aj = ld64(sb0)
		if (aj == 2) {
			st64(a + 8, ae)
			st64(a, 2)
			return ad
		}
		ad = Error_with_account_name(sc0, aj, ld64(sb0 + 8), "position_token_account", 0x16)
		af = ld64(sc0)
		st64(a + 8, ld64(sc0 + 8))
		st64(a, af)
		return ad
	}
	st64(ae, ld64(ae) + 1)
	st64(a + 8, ae)
	st64(a, 2)
	return ad
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

// types [heur]: d: ClosePositionWithTokenExtensionsAccounts (every call passes one: fn_310a0); p5: TokenAccount_2 (every call passes one: fn_310a0)
function fn_737c0(a: u64, b: u64, c: u64, d: ClosePositionWithTokenExtensionsAccounts, p5: TokenAccount_2, p6: u64, p7: u64, p8: u64, p9: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s30 = fp - 0x30, s58 = fp - 0x58, s60 = fp - 0x60, s88 = fp - 0x88, s90 = fp - 0x90, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sc8 = fp - 0xc8, se0 = fp - 0xe0, se8 = fp - 0xe8, s108 = fp - 0x108, s120 = fp - 0x120, s150 = fp - 0x150, s168 = fp - 0x168, s170 = fp - 0x170, s188 = fp - 0x188, s1a0 = fp - 0x1a0, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s1000 = fp - 0x1000
	let bb, dd, dp, dq: u64
	let el = c
	const f: AccountInfo = p5.info
	const g: LamportsCell = f.lamports
	let ev = g
	const h = ld64(p6)
	const q = f.key
	let es = ld64(h)
	rc_inc(g)
	let ep = f
	const i: DataCell = f.data
	let eu = i
	const n = p9
	const j = p8
	let ej = p7
	rc_inc(i)
	let eo = h
	const info: AccountInfo = d.position_mint.info
	const l: LamportsCell = info.lamports
	let et = l
	const r = info.key
	rc_inc(l)
	let er: AccountInfo = info
	const m: DataCell = info.data
	let v = a
	let eq = m
	rc_inc(m)
	const o: AccountInfo = ld64(b)
	const p = o.key
	st64(s1000 + 0x20, d.position_mint.decimals)
	st64(s1000, p, 8, 0, 1)
	fn_132170(se8, es, q, r, p, 8, 0, 1, ld64(s1000 + 0x20))
	copy(s1b8, se0, 0x18)
	const s = ld64(se8)
	if (s == 0x8000000000000000) {
		dq = fn_13b430(s218, s1b8)
		dd = ld64(s218 + 8)
		dp = ld64(s218)
	} else {
		let ek = p
		memcpy(s150, sc8, 0x30)
		st64(s170, s)
		copy(s168, s1b8, 0x18)
		const t: AccountInfo = eo
		const u = ld64(eo + 8)
		const ab = ld64(eo)
		let em = u
		const ac: AccountInfo = er
		const x: AccountInfo = ep
		rc_inc(u)
		const aa = v
		const w: DataCell = t.data
		let en = w
		rc_inc(w)
		const y: LamportsCell = x.lamports
		let ed = x.key
		let ee = t.executable
		let ef = t.is_writable
		let eg = t.is_signer
		let eh = t.rent_epoch
		const af = t.owner
		let ei = y
		rc_inc(y)
		const z: DataCell = x.data
		let ec = ab
		rc_inc(z)
		const ad: LamportsCell = ac.lamports
		let dw = ac.key
		let dx = x.executable
		let dy = x.is_writable
		let dz = x.is_signer
		let ea = x.rent_epoch
		let eb = x.owner
		rc_inc(ad)
		const ae: DataCell = ac.data
		rc_inc(ae)
		let du = ad
		let dv = af
		const ag: LamportsCell = o.lamports
		const dr = o.key
		let ds = er.executable
		let dt = er.is_writable
		const am = er.is_signer
		const an = er.rent_epoch
		const ao = er.owner
		rc_inc(ag)
		const ah: DataCell = o.data
		rc_inc(ah)
		const al = o.owner
		const ak = o.rent_epoch
		const aj = o.is_signer
		const ai = o.is_writable
		st8(s30 + 2, o.executable)
		st8(s30, aj, ai)
		st64(s58, dr, ag, ah, al, ak)
		st8(s60, am, dt, ds)
		st64(s88, dw, du, ae, ao, an)
		st8(s90, dz, dy, dx)
		st64(sb8, ed, ei, z, eb, ea)
		st8(sc0, eg, ef, ee)
		st64(se8, ec, em, en, dv, eh)
		const ap = fn_1390b0(s18, s170, se8, 4)
		if (ld64(s18) == 0x800000000000001a /* Ok */) {
			ptr_drop_in_place_c1b0(se8, ap)
			const aq = et
			v = aa
			const au = eu
			const at = ev
			if (rc_release(et)) {
				st64(aq + 8, ld64(aq + 8) - 1)
			}
			const ar = eq
			const av = ep
			const be = ek
			if (rc_release(eq)) {
				st64(ar + 8, ld64(ar + 8) - 1)
			}
			rc_dec(at)
			rc_dec(au)
			const aw = ld64(av + 8)
			const bg = ld64(av)
			rc_inc(aw)
			const bc = ld64(av + 0x10)
			eu = aw
			ev = bc
			rc_inc(bc)
			const bd = ld64(el)
			et = bd
			const bf = ld64(bd)
			st64(s1000, be, 8, 0)
			en = bf
			fn_130750(se8, es, bg, bf, be, 8, 0)
			copy(s1a0, se0, 0x18)
			const bh = ld64(se8)
			if (bh == 0x8000000000000000) {
				dq = fn_13b430(s208, s1a0)
				dd = ld64(s208 + 8)
				dp = ld64(s208)
			} else {
				memcpy(s150, sc8, 0x30)
				st64(s170, bh)
				copy(s168, s1a0, 0x18)
				const bi: AccountInfo = eo
				const bj = ld64(eo + 8)
				const br = ld64(eo)
				const bo: AccountInfo = et
				const bl: AccountInfo = ep
				rc_inc(bj)
				const bk: DataCell = bi.data
				rc_inc(bk)
				eq = bj
				const bm: LamportsCell = bl.lamports
				eh = bl.key
				ei = bi.executable
				ek = bi.is_writable
				el = bi.is_signer
				em = bi.rent_epoch
				const bs = bi.owner
				rc_inc(bm)
				const bn: DataCell = bl.data
				eg = bm
				rc_inc(bn)
				const bp: LamportsCell = bo.lamports
				eb = bo.key
				ec = bl.executable
				ed = bl.is_writable
				ee = bl.is_signer
				ef = bl.rent_epoch
				ep = bl.owner
				rc_inc(bp)
				const bq: DataCell = bo.data
				dy = bn
				dz = bk
				ea = br
				rc_inc(bq)
				dw = bq
				dx = bp
				const bt: LamportsCell = o.lamports
				du = o.key
				dv = bo.executable
				const bv = bo.is_writable
				const ca = bo.is_signer
				const cb = bo.rent_epoch
				const cc = bo.owner
				rc_inc(bt)
				const bu: DataCell = o.data
				ds = bv
				dt = bs
				rc_inc(bu)
				const bz = o.owner
				const by = o.rent_epoch
				const bx = o.is_signer
				const bw = o.is_writable
				st8(s30 + 2, o.executable)
				st8(s30, bx, bw)
				st64(s58, du, bt, bu, bz, by)
				st8(s60, ca, ds, dv)
				st64(s88, eb, dx, dw, cc, cb)
				st8(s90, ee, ed, ec)
				st64(sb8, eh, eg, dy, ep, ef)
				st8(sc0, el, ek, ei)
				st64(se8, ea, eq, dz, dt, em)
				const cd = fn_1390b0(s18, s170, se8, 4)
				if (ld64(s18) == 0x800000000000001a /* Ok */) {
					ptr_drop_in_place_c1b0(se8, cd)
					const ce = eu
					v = aa
					if (rc_release(eu)) {
						st64(ce + 8, ld64(ce + 8) - 1)
					}
					const cf = ev
					const cg: AccountInfo = er
					if (rc_release(ev)) {
						st64(cf + 8, ld64(cf + 8) - 1)
					}
					const ch: LamportsCell = cg.lamports
					const cn = cg.key
					rc_inc(ch)
					const ck: DataCell = cg.data
					eu = ch
					ev = ck
					rc_inc(ck)
					const cl: AccountInfo = ld64(ej)
					const cm = cl.key
					copyr(s108, cm, 0x20)
					st64(s1000, s108, 8, 0)
					fn_130750(se8, es, cn, en, s108, 8, 0)
					copy(s120, se0, 0x18)
					const co = ld64(se8)
					if (co == 0x8000000000000000) {
						dq = fn_13b430(s1f8, s120)
						dd = ld64(s1f8 + 8)
						dp = ld64(s1f8)
					} else {
						memcpy(s150, sc8, 0x30)
						st64(s170, co)
						copy(s168, s120, 0x18)
						const cp: AccountInfo = eo
						const cq = ld64(eo + 8)
						const cz = ld64(eo)
						const cs: AccountInfo = er
						rc_inc(cq)
						const cr: DataCell = cp.data
						rc_inc(cr)
						const ct: LamportsCell = cs.lamports
						el = cs.key
						em = cp.executable
						en = cp.is_writable
						ep = cp.is_signer
						eq = cp.rent_epoch
						const cv = cp.owner
						rc_inc(ct)
						const cu: DataCell = cs.data
						es = cu
						const cw: AccountInfo = et
						eo = cv
						rc_inc(cu)
						const cx: LamportsCell = cw.lamports
						ek = ct
						ef = cw.key
						eg = cs.executable
						eh = cs.is_writable
						ei = cs.is_signer
						ej = cs.rent_epoch
						const db = cs.owner
						rc_inc(cx)
						const cy: DataCell = cw.data
						rc_inc(cy)
						ee = cr
						er = cz
						const da: LamportsCell = cl.lamports
						ed = db
						dy = cl.key
						dz = cw.executable
						ea = cw.is_writable
						eb = cw.is_signer
						ec = cw.rent_epoch
						const di = cw.owner
						rc_inc(da)
						const dc: DataCell = cl.data
						et = cq
						rc_inc(dc)
						const dh = cl.owner
						const dg = cl.rent_epoch
						const df = cl.is_signer
						const de = cl.is_writable
						dd = cl.executable
						st8(s30, df, de, dd)
						st64(s58, dy, da, dc, dh, dg)
						st8(s60, eb, ea, dz)
						st64(s88, ef, cx, cy, di, ec)
						st8(s90, ei, eh, eg)
						st64(sb8, el, ek, es, ed, ej)
						st8(sc0, ep, en, em)
						st64(se8, er, et, ee, eo, eq)
						st64(s28, j, n)
						st64(s1000, s28, 1)
						const dj = fn_1390d8(s188, s170, se8, 4, fp)
						if (ld64(s188) == 0x800000000000001a /* Ok */) {
							dq = ptr_drop_in_place_c1b0(se8, dj)
							const dk = eu
							v = aa
							if (rc_release(eu)) {
								st64(dk + 8, ld64(dk + 8) - 1)
							}
							const dl = ev
							if (!rc_release(ev)) {
								st64(v + 8, dd)
								st64(v, 2)
								return dq
							}
							st64(dl + 8, ld64(dl + 8) - 1)
							st64(v + 8, dd)
							st64(v, 2)
							return dq
						}
						copyr(s18, s188, 0x18)
						const dm = fn_13b430(s1e8, s18)
						dd = ld64(s1e8 + 8)
						dp = ld64(s1e8)
						dq = ptr_drop_in_place_c1b0(se8, dm)
						v = aa
					}
					const dn = eu
					bb = ev
					if (rc_release(eu)) {
						st64(dn + 8, ld64(dn + 8) - 1)
					}
					if (!rc_release(bb)) {
						st64(v + 8, dd)
						st64(v, dp)
						return dq
					}
					st64(bb + 8, ld64(bb + 8) - 1)
					st64(v + 8, dd)
					st64(v, dp)
					return dq
				}
				copyr(s108, s18, 0x18)
				const ci = fn_13b430(s1d8, s108)
				dd = ld64(s1d8 + 8)
				dp = ld64(s1d8)
				dq = ptr_drop_in_place_c1b0(se8, ci)
				v = aa
			}
			const cj = eu
			bb = ev
			if (rc_release(eu)) {
				st64(cj + 8, ld64(cj + 8) - 1)
			}
			if (!rc_release(bb)) {
				st64(v + 8, dd)
				st64(v, dp)
				return dq
			}
			st64(bb + 8, ld64(bb + 8) - 1)
			st64(v + 8, dd)
			st64(v, dp)
			return dq
		}
		copyr(s108, s18, 0x18)
		const ax = fn_13b430(s1c8, s108)
		dd = ld64(s1c8 + 8)
		dp = ld64(s1c8)
		dq = ptr_drop_in_place_c1b0(se8, ax)
		v = aa
	}
	bb = eu
	const ba = ev
	const ay = et
	const az = eq
	if (rc_release(et)) {
		st64(ay + 8, ld64(ay + 8) - 1)
	}
	rc_dec(az)
	rc_dec(ba)
	if (!rc_release(bb)) {
		st64(v + 8, dd)
		st64(v, dp)
		return dq
	}
	st64(bb + 8, ld64(bb + 8) - 1)
	st64(v + 8, dd)
	st64(v, dp)
	return dq
}

// types [heur]: d: DataCell (every call passes one: fn_8a170, fn_8b758, fn_8d1d0, …)
function fn_13aee8(a: u64, b: u64, c: u64, d: DataCell, e: u64): u64 {
	const s18 = fp - 0x18
	let k = a
	const f = fn_143100(c, b, c, d, e)
	const g = fn_143100(b)
	const h = f > f + g
	if ((h & 1) != 0) {
		fn_1490e8(0x10015acc8, h & 1)
	}
	const i = ld64(c + 8)
	const j = ld64(i + 0x10)
	if (j == 0) {
		const u = k
		st64(i + 0x10, -1)
		const l = ld64(i + 0x18)
		st64(l, f + g)
		st64(i + 0x10, ld64(i + 0x10) + 1)
		const m = ld64(b + 8)
		const n = ld64(m + 0x10)
		if (n == 0) {
			st64(m + 0x10, -1)
			st64(ld64(m + 0x18), 0)
			st64(m + 0x10, ld64(m + 0x10) + 1)
			let o = fn_1434c0(s18, b, 0, AccountInfo_assign(b, 0x100152180, g))
			let q = 2
			if (ld64(s18) != 0x800000000000001a /* Ok */) {
				o = __rust_alloc(0x80, 8)
				k = o
				if (o == 0) {
					alloc_handle_alloc_error(8, 0x80)
				}
				st64(k, 2)
				copy(k + 0x20, s18, 0x18)
				st8(k + 0x38, 2)
				q = 1
			}
			const r = ld64(c + 0x10)
			const p = ld64(c + 8)
			if (rc_release(p)) {
				if (rc_release(p + 8)) {
					o = fn_83078(o)
				}
			}
			if (rc_release(r)) {
				if (rc_release(r + 8)) {
					o = fn_83078(o)
				}
			}
			const t = ld64(b + 0x10)
			const s = ld64(b + 8)
			if (rc_release(s)) {
				if (rc_release(s + 8)) {
					o = fn_83078(o)
				}
			}
			if (!rc_release(t)) {
				st64(u + 8, k)
				st64(u, q)
				return o
			}
			if (!rc_release(t + 8)) {
				st64(u + 8, k)
				st64(u, q)
				return o
			}
			o = fn_83078(o)
			st64(u + 8, k)
			st64(u, q)
			return o
		}
		fn_148658(0x10015ac98, n, l)
	}
	fn_148658(0x10015acb0, i, j)
}

function fn_132170(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s80 = fp - 0x80
	let m, n, x, y, z: u64
	const f = memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20)
	const h = p9
	const g = p8
	const j = p7
	let p = p6
	const i = p5
	if ((f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	st8(s40, h)
	st64(s50 + 8, g)
	st32(s50, 0xf)
	const o = fn_12e9c0(s80, s50)
	let k = j + 3
	if (k == 0) {
		st64(s68, 0, 1, 0)
		copyr(s50, c, 0x20)
		fn_12d0a0(s68, c, o)
		n = undef
		k = ld64(s68)
		m = ld64(s68 + 8)
	} else {
		const l = k
		if (k > 0x3c3c3c3c3c3c3c3) {
			raw_vec_handle_error(0, l * 0x22, x, y, z)
		}
		m = __rust_alloc(l * 0x22, 1)
		if (m == 0) {
			raw_vec_handle_error(1, l * 0x22, x, y, z)
		}
		st64(s68, k, m)
		n = c
		copyr(s50, c, 0x20)
	}
	st64(m + 0x18, ld64(s38))
	st64(m + 0x10, ld64(s40))
	st64(m + 8, ld64(s50 + 8))
	st64(m, ld64(s50))
	st16(m + 0x20, 0x100)
	st64(s68 + 0x10, 1)
	if (k == 1) {
		fn_12d0a0(s68, n, m)
		k = ld64(s68)
		m = ld64(s68 + 8)
	}
	let w = b
	st64(m + 0x3a, ld64(d + 0x18))
	st64(m + 0x32, ld64(d + 0x10))
	st64(m + 0x2a, ld64(d + 8))
	st64(m + 0x22, ld64(d))
	st16(m + 0x42, 0x100)
	st64(s68 + 0x10, 2)
	if (k == 2) {
		fn_12d0a0(s68, d, m)
		w = b
		m = ld64(s68 + 8)
	}
	st64(m + 0x5c, ld64(i + 0x18))
	st64(m + 0x54, ld64(i + 0x10))
	st64(m + 0x4c, ld64(i + 8))
	st64(m + 0x44, ld64(i))
	st8(m + 0x64, j == 0, 0)
	st64(s68 + 0x10, 3)
	if (j != 0) {
		let s = 3
		let q = 0
		let t = j << 3
		do {
			const u = ld64(p)
			copyr(s40, u + 0x10, 0x10)
			const v = ld64(u + 8)
			st64(s50 + 8, v)
			st64(s50, ld64(u))
			if (s == ld64(s68)) {
				fn_12d0a0(s68, v, m)
				w = b
				m = ld64(s68 + 8)
			}
			p = p + 8
			const r = m + q
			st64(r + 0x7e, ld64(s38))
			st64(r + 0x76, ld64(s40))
			st64(r + 0x6e, ld64(s50 + 8))
			st64(r + 0x66, ld64(s50))
			st16(r + 0x86, 1)
			q = q + 0x22
			s = s + 1
			st64(s68 + 0x10, s)
			t = t - 8
		} while (t != 0)
	}
	copyr(s20, w, 0x20)
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

function fn_1434c0(a: u64, b: AccountInfo, c: u64, r0: u64): u64 {
	const f: DataCell = b.data
	if (f.borrow != 0) {
		st64(a + 0x10, f + 0x10)
		st64(a, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		return r0
	}
	f.borrow = -1
	const g = f.len
	if (g == c) {
		st64(a, 0x800000000000001a /* Ok */)
		f.borrow = 0
		return 0x800000000000001a /* Ok */
	}
	if (sat_sub(c, ld32(b.key - 4)) > 0x2800) {
		st64(a, 0x8000000000000013 /* Err(ProgramError::InvalidRealloc) */)
		f.borrow = 0
		return 0x8000000000000013 /* Err(ProgramError::InvalidRealloc) */
	}
	const h = f.ptr
	st64(h - 8, c)
	f.len = c
	st64(f + 0x18, h)
	if (c > g) {
		r0 = sol_memset(h + g, 0, sat_sub(c, g))
		st64(a, 0x800000000000001a /* Ok */)
		f.borrow = f.borrow + 1
		return r0
	}
	st64(a, 0x800000000000001a /* Ok */)
	f.borrow = f.borrow + 1
	return 0x8000000000000013 /* Err(ProgramError::InvalidRealloc) */
}

function fn_83078(r0: u64): u64 {
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), e (value)
function fn_1490e8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_1494c8("called `Option::unwrap()` on a `None` value", 0x2b, a, d, e)
}

function fn_148658(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s1 = fp - 0x1, s18 = fp - 0x18, s48 = fp - 0x48
	st64(s48, 0x10015b890)
	st64(s48 + 0x10, s18)
	st64(s18, s1, BorrowMutError_fmt)
	st64(s48 + 0x20, 0)
	st64(s48 + 8, 1)
	st64(s48 + 0x18, 1)
	// fmt "already borrowed: {}" {} = *s1 [BorrowMutError_fmt]
	fn_149478(s48, a, c, d, e)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: e (value)
function fn_1494c8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s10 = fp - 0x10, s38 = fp - 0x38, s40 = fp - 0x40
	st64(s40, s10)
	st64(s10, a, b)
	st64(s38, 1, 8, 0, 0)
	fn_149478(s40, c, c, s10, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_149478(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	const s20 = fp - 0x20, s28 = fp - 0x28
	st64(s20, 0x10015b8e0, a, b)
	st16(s20 + 0x18, 1)
	st64(s28, 1)
	fn_147238(s28, b, c, d, e)
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
