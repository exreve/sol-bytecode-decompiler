// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction close_position: handler + 19 reachable functions
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
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function sol_memset(dst: u64, byte: u64, n: u64): void // memset
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function ptr_drop_in_place_c1b0(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 4]>
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11b00(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11e98(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11f50(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_129a0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from, memcmp
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_133a38(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses raw_vec_handle_error
declare function fn_133b80(a: u64, b: u64): void // lib uses raw_vec_handle_error
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

// instruction handler: close_position (discriminator sha256("global:close_position")[..8] = 0x626244310051867b)
// accounts [str: the program's account-error strings, in order of first use]: position_authority, receiver, position, position_mint, position_token_account, token_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
function ix_close_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s140 = fp - 0x140, s158 = fp - 0x158, s160 = fp - 0x160, s248 = fp - 0x248, s250 = fp - 0x250, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2c1 = fp - 0x2c1, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s1000 = fp - 0x1000
	let l, m, o: u64
	let g = a
	sol_log("Instruction: ClosePosition", 0x1a)
	st64(s2c0, accounts, accounts_len)
	st64(s1000 + 8, s2c1)
	let n = accounts_close_position(s158, program_id, s2c0, undef, fp)
	const f = ld32(s158)
	if (f == 2) {
		l = ld64(s158 + 8)
		st64(g + 8, ld64(s158 + 0x10))
		st64(g, l)
		return n
	}
	st64(s318, program_id, g)
	const j = ld32(s158 + 4)
	const i = ld64(s158 + 8)
	const h = ld64(s158 + 0x10)
	memcpy(s298, s140, 0x140)
	st64(s2a8, i, h)
	st32(s2b0, f, j)
	const k = ld64(s248 + 0xe0)
	n = fn_5ffd0(s2d8, k + 8, s250)
	l = ld64(s2d8)
	if (l == 2) {
		if ((ld64(s248 + 0xa0) | ld64(s248 + 0xb8)) == 0 && (ld64(s248 + 0x80) == 0 && ((ld64(s248 + 0x50) | ld64(s248 + 0x58)) == 0 && (ld64(s248 + 0xd0) | ld64(s248 + 0x88)) == 0))) {
			st64(s1000, k, s160)
			n = fn_65a18(s2e8, s250, s248, s2b0, k, s160)
			m = ld64(s2e8 + 8)
			l = ld64(s2e8)
			g = ld64(s318 + 8)
			o = ld64(s318)
			if (l == 2) {
				n = fn_8b758(s308, s2b0, o)
				l = ld64(s308)
				st64(g + 8, ld64(s308 + 8))
				st64(g, l)
				return n
			}
			st64(g + 8, m)
			st64(g, l)
			return n
		}
		n = fn_87630(s2f8, 5)
		m = ld64(s2f8 + 8)
		l = ld64(s2f8)
		g = ld64(s318 + 8)
		o = ld64(s318)
		if (l == 2) {
			n = fn_8b758(s308, s2b0, o)
			l = ld64(s308)
			st64(g + 8, ld64(s308 + 8))
			st64(g, l)
			return n
		}
		st64(g + 8, m)
		st64(g, l)
		return n
	}
	g = ld64(s318 + 8)
	st64(g + 8, ld64(s2d8 + 8))
	st64(g, l)
	return n
}

// Anchor Accounts::try_accounts of instruction close_position (called by ix_close_position; name [str]: from the handler's "Instruction: …" log; was fn_8a4f8)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_authority, receiver (AccountNotEnoughKeys, ConstraintMut), position (ConstraintSeeds, ConstraintMut, ConstraintClose), position_mint (ConstraintMut, ConstraintAddress), position_token_account (ConstraintMut, ConstraintRaw), token_program (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_token_account_box, position
function accounts_close_position(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, sa0 = fp - 0xa0, s158 = fp - 0x158, s160 = fp - 0x160, s178 = fp - 0x178, s228 = fp - 0x228, s238 = fp - 0x238, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s458 = fp - 0x458, s488 = fp - 0x488
	let h, k, l, m, ak, al, am: u64
	st64(s458 + 0x20, b)
	let j = a
	try_accounts_11718(s178, c, c, d, e)
	const i = ld64(s178 + 8)
	const f = ld64(s178)
	if (f != 2) {
		am = Error_with_account_name(s260, f, i, "position_authority", 0x12)
		k = ld64(s260)
		st64(j + 0x10, ld64(s260 + 8))
		st64(j + 8, k)
		st32(j, 2)
		return am
	}
	const o = ld64(e - 0xff8)
	const g = ld64(c + 8)
	if (g == 0) {
		anchor_error_from(s270, 0xbbd /* anchor::AccountNotEnoughKeys */, undef, l, m)
		h = ld64(s270 + 8)
		const n = ld64(s270)
		if (n != 2) {
			am = Error_with_account_name(s280, n, h, "receiver", 8)
			k = ld64(s280)
			st64(j + 0x10, ld64(s280 + 8))
			st64(j + 8, k)
			st32(j, 2)
			return am
		}
	} else {
		st64(c + 8, g - 1)
		h = ld64(c)
		st64(c, h + 0x30)
	}
	st64(s458, i, o, h, j)
	try_accounts_11b00(s178, c, h, l, m)
	const q = ld64(s178 + 0x10)
	const r = ld64(s178 + 8)
	const position: AccountInfo = ld64(s178)
	if (position == 0) {
		am = Error_with_account_name(s430, r, q, "position", 8)
		al = ld64(s430)
		ak = ld64(s458 + 0x18)
		st64(ak + 0x10, ld64(s430 + 8))
		st64(ak + 8, al)
		st32(ak, 2)
		return am
	}
	memcpy(s238, s160, 0xc0)
	st64(s250, position, r, q)
	try_accounts_11e98(s178, c)
	const s = ld32(s178)
	if (s == 2) {
		am = Error_with_account_name(s420, ld64(s178 + 8), ld64(s178 + 0x10), "position_mint", 0xd)
		al = ld64(s420)
		ak = ld64(s458 + 0x18)
		st64(ak + 0x10, ld64(s420 + 8))
		st64(ak + 8, al)
		st32(ak, 2)
		return am
	}
	st64(s488 + 0x18, ld64(s178 + 0x10))
	st64(s488 + 0x20, ld64(s178 + 8))
	const x = ld32(s178 + 4)
	memcpy(sa0, s160, 0x40)
	st64(s488 + 0x28, ld64(s158 + 0x38))
	try_accounts_11f50(s178, c)
	if (ld32(s158 + 0x70) == 2) {
		am = Error_with_account_name(s410, ld64(s178), ld64(s178 + 8), "position_token_account", 0x16)
		al = ld64(s410)
		ak = ld64(s458 + 0x18)
		st64(ak + 0x10, ld64(s410 + 8))
		st64(ak + 8, al)
		st32(ak, 2)
		return am
	}
	const t = ld64(0x300000000 /* heap bump-allocator cursor */)
	const position_token_account_box: TokenAccount = t != 0 ? sat_sub(t, 0xb8) & -8 : 0x300007f48
	if (position_token_account_box > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, position_token_account_box)
		st64(s488 + 0x10, position_token_account_box)
		memcpy(position_token_account_box, s178, 0xb8)
		fn_129a0(s178, c)
		const w = ld64(s178 + 8)
		const v = ld64(s178)
		if (v == 2) {
			if (ld8(ld64(s458 + 0x10) + 0x29 /* is_writable */) == 0) {
				anchor_error_from(s3f0, 0x7d0 /* anchor::ConstraintMut */, w)
				am = Error_with_account_name(s400, ld64(s3f0), ld64(s3f0 + 8), "receiver", 8)
				al = ld64(s400)
				ak = ld64(s458 + 0x18)
				st64(ak + 0x10, ld64(s400 + 8))
				st64(ak + 8, al)
				st32(ak, 2)
				return am
			}
			st64(s488, x, w)
			const y = ld64(ld64(s488 + 0x28) /* key */)
			copyr(s20, y, 0x20)
			st64(s40, 0x100151f20, 8, s20, 0x20)
			// PDA find_program_address(["position", *y], program *(ld64(s458 + 0x20)))
			Pubkey_find_program_address(s178, s40, 2, ld64(s458 + 0x20))
			copyr(s60, s178, 0x20)
			st8(ld64(s458 + 8), ld8(s158))
			const z = position.key
			copyr(s178, z, 0x20)
			if ((memcmp(s178, s60, 0x20) as u32) != 0) {
				anchor_error_from(s2a0, 0x7d6 /* anchor::ConstraintSeeds */)
				Error_with_account_name(s2b0, ld64(s2a0), ld64(s2a0 + 8), "position", 8)
				const aj = ld64(s2b0 + 8)
				const ai = ld64(s2b0)
				const ad = ld64(ld64(s250))
				const ah = ld64(ad + 0x18)
				const ag = ld64(ad + 0x10)
				const af = ld64(ad + 8)
				const ae = ld64(ad)
				copy(s158, s60, 0x20)
				st64(s178, ae, af, ag, ah)
				am = fn_13b5c0(s2c0, ai, aj, s178, af)
				al = ld64(s2c0)
				ak = ld64(s458 + 0x18)
				st64(ak + 0x10, ld64(s2c0 + 8))
				st64(ak + 8, al)
				st32(ak, 2)
				return am
			}
			if (position.is_writable == 0) {
				anchor_error_from(s3d0, 0x7d0 /* anchor::ConstraintMut */)
				am = Error_with_account_name(s3e0, ld64(s3d0), ld64(s3d0 + 8), "position", 8)
				al = ld64(s3e0)
				ak = ld64(s458 + 0x18)
				st64(ak + 0x10, ld64(s3e0 + 8))
				st64(ak + 8, al)
				st32(ak, 2)
				return am
			}
			copyr(s20, z, 0x20)
			const aa = ld64(ld64(s458 + 0x10) /* key */)
			copyr(s178, aa, 0x20)
			const ab = memcmp(s20, s178, 0x20)
			j = ld64(s458 + 0x18)
			if ((ab as u32) == 0) {
				anchor_error_from(s3b0, 0x7db /* anchor::ConstraintClose */)
				am = Error_with_account_name(s3c0, ld64(s3b0), ld64(s3b0 + 8), "position", 8)
				k = ld64(s3c0)
				st64(j + 0x10, ld64(s3c0 + 8))
				st64(j + 8, k)
				st32(j, 2)
				return am
			}
			if (ld8(ld64(s488 + 0x28) + 0x29 /* is_writable */) == 0) {
				anchor_error_from(s390, 0x7d0 /* anchor::ConstraintMut */)
				am = Error_with_account_name(s3a0, ld64(s390), ld64(s390 + 8), "position_mint", 0xd)
				k = ld64(s3a0)
				st64(j + 0x10, ld64(s3a0 + 8))
				st64(j + 8, k)
				st32(j, 2)
				return am
			}
			copyr(s40, y, 0x20)
			copyr(s20, s228, 0x20)
			if ((memcmp(s40, s20, 0x20) as u32) != 0) {
				anchor_error_from(s2d0, 0x7dc /* anchor::ConstraintAddress */)
				const ap = Error_with_account_name(s2e0, ld64(s2d0), ld64(s2d0 + 8), "position_mint", 0xd)
				const ao = ld64(s2e0 + 8)
				const an = ld64(s2e0)
				copy(s178, s40, 0x40)
				am = fn_13b5c0(s2f0, an, ao, s178, ap)
				k = ld64(s2f0)
				st64(j + 0x10, ld64(s2f0 + 8))
				st64(j + 8, k)
				st32(j, 2)
				return am
			}
			const ac: TokenAccount = ld64(s488 + 0x10)
			if (ac.info.is_writable == 0) {
				anchor_error_from(s370, 0x7d0 /* anchor::ConstraintMut */, ac)
				am = Error_with_account_name(s380, ld64(s370), ld64(s370 + 8), "position_token_account", 0x16)
				k = ld64(s380)
				st64(j + 0x10, ld64(s380 + 8))
				st64(j + 8, k)
				st32(j, 2)
				return am
			}
			if (ac.amount != 1) {
				anchor_error_from(s300, 0x7d3 /* anchor::ConstraintRaw */, ac)
				am = Error_with_account_name(s310, ld64(s300), ld64(s300 + 8), "position_token_account", 0x16)
				k = ld64(s310)
				st64(j + 0x10, ld64(s310 + 8))
				st64(j + 8, k)
				st32(j, 2)
				return am
			}
			if ((memcmp(ac.mint, s228, 0x20) as u32) == 0) {
				const aq = ld64(ld64(s488 + 8))
				copyr(s20, aq, 0x20)
				if ((memcmp(s20, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
					anchor_error_from(s340, 0x7dc /* anchor::ConstraintAddress */)
					const au = Error_with_account_name(s350, ld64(s340), ld64(s340 + 8), "token_program", 0xd)
					const at = ld64(s350 + 8)
					const ar = ld64(s350)
					copyr(s178, s20, 0x20)
					st64(s158, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
					am = fn_13b5c0(s360, ar, at, s178, au)
					k = ld64(s360)
					st64(j + 0x10, ld64(s360 + 8))
					st64(j + 8, k)
					st32(j, 2)
					return am
				}
				memcpy(j + 0x70, s250, 0xd8)
				am = memcpy(j + 0x18, sa0, 0x40)
				st64(j + 0x150, ld64(s488 + 8))
				st64(j + 0x148, ld64(s488 + 0x10))
				st64(j + 0x68, ld64(s458 + 0x10))
				st64(j + 0x60, ld64(s458))
				st64(j + 0x58, ld64(s488 + 0x28))
				st64(j + 0x10, ld64(s488 + 0x18))
				st64(j + 8, ld64(s488 + 0x20))
				st32(j + 4, ld64(s488))
				st32(j, s)
				return am
			}
			anchor_error_from(s320, 0x7d3 /* anchor::ConstraintRaw */)
			am = Error_with_account_name(s330, ld64(s320), ld64(s320 + 8), "position_token_account", 0x16)
			k = ld64(s330)
			st64(j + 0x10, ld64(s330 + 8))
			st64(j + 8, k)
			st32(j, 2)
			return am
		}
		am = Error_with_account_name(s290, v, w, "token_program", 0xd)
		al = ld64(s290)
		ak = ld64(s458 + 0x18)
		st64(ak + 0x10, ld64(s290 + 8))
		st64(ak + 8, al)
		st32(ak, 2)
		return am
	}
	alloc_handle_alloc_error(8, 0xb8)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
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

function fn_65a18(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s48 = fp - 0x48, s50 = fp - 0x50, s78 = fp - 0x78, s80 = fp - 0x80, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sd0 = fp - 0xd0, sd8 = fp - 0xd8, sf0 = fp - 0xf0, s120 = fp - 0x120, s138 = fp - 0x138, s140 = fp - 0x140, s158 = fp - 0x158, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1000 = fp - 0x1000
	let at, bm, bw, bx: u64
	let cs = c
	const f: AccountInfo = ld64(p5)
	const g: LamportsCell = f.lamports
	const h = ld64(p6)
	const j = f.key
	let cu = h
	let cy = ld64(h)
	let cw = g
	rc_inc(g)
	const i: DataCell = f.data
	let cx = j
	rc_inc(i)
	const k: AccountInfo = ld64(d + 0x58)
	const l: LamportsCell = k.lamports
	let da = l
	const p = k.key
	rc_inc(l)
	const m: DataCell = k.data
	let cz = m
	let v = a
	let cv = i
	rc_inc(m)
	const n: AccountInfo = ld64(b)
	const o = n.key
	st64(s1000 + 0x20, ld8(d + 0x30))
	let cr = o
	st64(s1000, o, 8, 0, 1)
	fn_135c58(sd8, cy, cx, p, o, 8, 0, 1, ld64(s1000 + 0x20))
	copy(s170, sd0, 0x18)
	const q = ld64(sd8)
	if (q == 0x8000000000000000) {
		bx = fn_13b430(s1b0, s170)
		bm = ld64(s1b0 + 8)
		bw = ld64(s1b0)
	} else {
		memcpy(s120, sb8, 0x30)
		st64(s140, q)
		copy(s138, s170, 0x18)
		const r: AccountInfo = cu
		const s = ld64(cu + 8)
		const u = ld64(cu)
		rc_inc(s)
		const t: DataCell = r.data
		let ct = u
		rc_inc(t)
		const y = v
		const w: LamportsCell = f.lamports
		cx = w
		let cl = f.key
		let cm = r.executable
		let cn = r.is_writable
		let co = r.is_signer
		let cp = r.rent_epoch
		let cq = r.owner
		rc_inc(w)
		const x: DataCell = f.data
		let ck = t
		rc_inc(x)
		const z: LamportsCell = k.lamports
		let ce = k.key
		let cf = f.executable
		let cg = f.is_writable
		let ch = f.is_signer
		let ci = f.rent_epoch
		let cj = f.owner
		rc_inc(z)
		const aa: DataCell = k.data
		let cd = x
		rc_inc(aa)
		const ab: LamportsCell = n.lamports
		const by = n.key
		const bz = k.executable
		const ca = k.is_writable
		const cb = k.is_signer
		const cc = k.rent_epoch
		const ah = k.owner
		rc_inc(ab)
		const ac: DataCell = n.data
		rc_inc(ac)
		const ag = n.owner
		const af = n.rent_epoch
		const ae = n.is_signer
		const ad = n.is_writable
		st8(s20 + 2, n.executable)
		st8(s20, ae, ad)
		st64(s48, by, ab, ac, ag, af)
		st8(s50, cb, ca, bz)
		st64(s78, ce, z, aa, ah, cc)
		st8(s80, ch, cg, cf)
		st64(sa8, cl, cx, cd, cj, ci)
		st8(sb0, co, cn, cm)
		st64(sd8, ct, s, ck, cq, cp)
		st64(s1000, 8, 0)
		const ai = fn_1390d8(s158, s140, sd8, 4, fp)
		if (ld64(s158) == 0x800000000000001a /* Ok */) {
			ptr_drop_in_place_c1b0(sd8, ai)
			const aj = da
			v = y
			const am = cv
			const al = cw
			const ak = cz
			if (rc_release(da)) {
				st64(aj + 8, ld64(aj + 8) - 1)
			}
			rc_dec(ak)
			rc_dec(al)
			rc_dec(am)
			const an: LamportsCell = f.lamports
			const aw = f.key
			rc_inc(an)
			const au: DataCell = f.data
			cz = an
			da = au
			rc_inc(au)
			const av: AccountInfo = ld64(cs)
			const ax = av.key
			st64(s1000, cr, 8, 0)
			fn_135660(sd8, cy, aw, ax, cr, 8, 0)
			copy(sf0, sd0, 0x18)
			const ay = ld64(sd8)
			if (ay == 0x8000000000000000) {
				bx = fn_13b430(s1a0, sf0)
				bm = ld64(s1a0 + 8)
				bw = ld64(s1a0)
			} else {
				memcpy(s120, sb8, 0x30)
				st64(s140, ay)
				copy(s138, sf0, 0x18)
				const az: AccountInfo = cu
				const ba = ld64(cu + 8)
				const bh = ld64(cu)
				rc_inc(ba)
				const bb: DataCell = az.data
				rc_inc(bb)
				const bc: LamportsCell = f.lamports
				ct = f.key
				cv = az.executable
				cw = az.is_writable
				cx = az.is_signer
				cy = az.rent_epoch
				const bl = az.owner
				rc_inc(bc)
				const bd: DataCell = f.data
				cu = bc
				rc_inc(bd)
				const be: LamportsCell = av.lamports
				cs = bb
				cn = av.key
				co = f.executable
				cp = f.is_writable
				cq = f.is_signer
				cr = f.rent_epoch
				const bg = f.owner
				rc_inc(be)
				const bf: DataCell = av.data
				cm = bg
				rc_inc(bf)
				ck = bh
				cl = ba
				const bi: LamportsCell = n.lamports
				cf = n.key
				cg = av.executable
				ch = av.is_writable
				ci = av.is_signer
				cj = av.rent_epoch
				const bk = av.owner
				rc_inc(bi)
				ce = bd
				const bj: DataCell = n.data
				cd = bl
				rc_inc(bj)
				const bq = n.owner
				const bp = n.rent_epoch
				const bo = n.is_signer
				const bn = n.is_writable
				bm = n.executable
				st8(s20, bo, bn, bm)
				st64(s48, cf, bi, bj, bq, bp)
				st8(s50, ci, ch, cg)
				st64(s78, cn, be, bf, bk, cj)
				st8(s80, cq, cp, co)
				st64(sa8, ct, cu, ce, cm, cr)
				st8(sb0, cx, cw, cv)
				st64(sd8, ck, cl, cs, cd, cy)
				st64(s1000, 8, 0)
				const br = fn_1390d8(s158, s140, sd8, 4, fp)
				if (ld64(s158) == 0x800000000000001a /* Ok */) {
					bx = ptr_drop_in_place_c1b0(sd8, br)
					const bs = cz
					v = y
					if (rc_release(cz)) {
						st64(bs + 8, ld64(bs + 8) - 1)
					}
					const bt = da
					if (!rc_release(da)) {
						st64(v + 8, bm)
						st64(v, 2)
						return bx
					}
					st64(bt + 8, ld64(bt + 8) - 1)
					st64(v + 8, bm)
					st64(v, 2)
					return bx
				}
				copyr(s18, s158, 0x18)
				const bu = fn_13b430(s190, s18)
				bm = ld64(s190 + 8)
				bw = ld64(s190)
				bx = ptr_drop_in_place_c1b0(sd8, bu)
				v = y
			}
			const bv = cz
			at = da
			if (rc_release(cz)) {
				st64(bv + 8, ld64(bv + 8) - 1)
			}
			if (!rc_release(at)) {
				st64(v + 8, bm)
				st64(v, bw)
				return bx
			}
			st64(at + 8, ld64(at + 8) - 1)
			st64(v + 8, bm)
			st64(v, bw)
			return bx
		}
		copyr(s18, s158, 0x18)
		const ao = fn_13b430(s180, s18)
		bm = ld64(s180 + 8)
		bw = ld64(s180)
		bx = ptr_drop_in_place_c1b0(sd8, ao)
		v = y
	}
	at = cv
	const ar = cw
	const aq = cz
	const ap = da
	if (rc_release(da)) {
		st64(ap + 8, ld64(ap + 8) - 1)
	}
	rc_dec(aq)
	rc_dec(ar)
	if (!rc_release(at)) {
		st64(v + 8, bm)
		st64(v, bw)
		return bx
	}
	st64(at + 8, ld64(at + 8) - 1)
	st64(v + 8, bm)
	st64(v, bw)
	return bx
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position, position_mint, position_token_account
function fn_8b758(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0
	let ad, af: u64
	const f: AccountInfo = ld64(b + 0x68)
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
	const n: AccountInfo = ld64(b + 0x70)
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
	if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
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
	const ag = ld64(ld64(b + 0x148))
	const ac = memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20)
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

function fn_135c58(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s80 = fp - 0x80
	let j, k, s, t, u: u64
	if ((memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
	} else {
		const f = p8
		const g = p7
		let l = p6
		const v = p5
		st8(s40, p9)
		st64(s50 + 8, f)
		st32(s50, 0xf)
		fn_133ce0(s80, s50)
		let h = g + 3
		if (h == 0) {
			st64(s68, 0, 1, 0)
			copyr(s50, c, 0x20)
			fn_133b80(s68)
			h = ld64(s68)
			j = ld64(s68 + 8)
		} else {
			const i = h
			if (h > 0x3c3c3c3c3c3c3c3) {
				raw_vec_handle_error(0, i * 0x22, s, t, u)
			}
			j = __rust_alloc(i * 0x22, 1)
			if (j == 0) {
				raw_vec_handle_error(1, i * 0x22, s, t, u)
			}
			st64(s68, h, j)
			copyr(s50, c, 0x20)
		}
		st64(j + 0x18, ld64(s38))
		st64(j + 0x10, ld64(s40))
		st64(j + 8, ld64(s50 + 8))
		st64(j, ld64(s50))
		st16(j + 0x20, 0x100)
		st64(s68 + 0x10, 1)
		if (h == 1) {
			fn_133b80(s68, k)
			h = ld64(s68)
			j = ld64(s68 + 8)
		}
		st64(j + 0x3a, ld64(d + 0x18))
		st64(j + 0x32, ld64(d + 0x10))
		st64(j + 0x2a, ld64(d + 8))
		st64(j + 0x22, ld64(d))
		st16(j + 0x42, 0x100)
		st64(s68 + 0x10, 2)
		if (h == 2) {
			fn_133b80(s68, d)
			j = ld64(s68 + 8)
		}
		st64(j + 0x5c, ld64(v + 0x18))
		st64(j + 0x54, ld64(v + 0x10))
		st64(j + 0x4c, ld64(v + 8))
		st64(j + 0x44, ld64(v))
		st8(j + 0x64, g == 0, 0)
		st64(s68 + 0x10, 3)
		if (g != 0) {
			let o = 3
			let m = 0
			let p = g << 3
			do {
				const q = ld64(l)
				copyr(s40, q + 0x10, 0x10)
				const r = ld64(q + 8)
				st64(s50 + 8, r)
				st64(s50, ld64(q))
				if (o == ld64(s68)) {
					fn_133b80(s68, r)
					j = ld64(s68 + 8)
				}
				l = l + 8
				const n = j + m
				st64(n + 0x7e, ld64(s38))
				st64(n + 0x76, ld64(s40))
				st64(n + 0x6e, ld64(s50 + 8))
				st64(n + 0x66, ld64(s50))
				st16(n + 0x86, 1)
				m = m + 0x22
				o = o + 1
				st64(s68 + 0x10, o)
				p = p - 8
			} while (p != 0)
		}
		copyr(s20, b, 0x20)
		copy(s50, s68, 0x18)
		copy(s38, s80, 0x18)
		memcpy(a, s50, 0x50)
	}
}

function fn_135660(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s80 = fp - 0x80
	let h, i, q, r, s: u64
	if ((memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
	} else {
		const f = p7
		let j = p6
		const t = p5
		fn_133ce0(s80, 0x100156018)
		let g = f + 3
		if (g == 0) {
			st64(s68, 0, 1, 0)
			copyr(s50, c, 0x20)
			fn_133b80(s68)
			h = undef
			g = ld64(s68)
			i = ld64(s68 + 8)
		} else {
			h = g * 0x22
			if (g > 0x3c3c3c3c3c3c3c3) {
				raw_vec_handle_error(0, h, q, r, s)
			}
			i = __rust_alloc(h, 1)
			if (i == 0) {
				raw_vec_handle_error(1, h, q, r, s)
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
			fn_133b80(s68, h)
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
		st64(i + 0x5c, ld64(t + 0x18))
		st64(i + 0x54, ld64(t + 0x10))
		st64(i + 0x4c, ld64(t + 8))
		st64(i + 0x44, ld64(t))
		st8(i + 0x64, f == 0, 0)
		st64(s68 + 0x10, 3)
		if (f != 0) {
			let m = 3
			let k = 0
			let n = f << 3
			do {
				const o = ld64(j)
				copyr(s40, o + 0x10, 0x10)
				const p = ld64(o + 8)
				st64(s50 + 8, p)
				st64(s50, ld64(o))
				if (m == ld64(s68)) {
					fn_133b80(s68, p)
					i = ld64(s68 + 8)
				}
				j = j + 8
				const l = i + k
				st64(l + 0x7e, ld64(s38))
				st64(l + 0x76, ld64(s40))
				st64(l + 0x6e, ld64(s50 + 8))
				st64(l + 0x66, ld64(s50))
				st16(l + 0x86, 1)
				k = k + 0x22
				m = m + 1
				st64(s68 + 0x10, m)
				n = n - 8
			} while (n != 0)
		}
		copyr(s20, b, 0x20)
		copy(s50, s68, 0x18)
		copy(s38, s80, 0x18)
		memcpy(a, s50, 0x50)
	}
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
