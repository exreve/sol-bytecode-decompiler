// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction close_bundled_position: handler + 21 reachable functions
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
interface CloseBundledPositionAccounts { // Accounts struct of instruction close_bundled_position as accounts_close_bundled_position returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	position_bundle_token_account: at<0xe0, ref<TokenAccount>> // Box<Account<TokenAccount>>
	position_bundle_authority:     at<0xe8, ref<AccountInfo>>
	receiver:                      at<0xf0, ref<AccountInfo>>
}
interface CloseBundledPositionContext { // anchor_lang Context of instruction close_bundled_position (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<CloseBundledPositionAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function sol_memset(dst: u64, byte: u64, n: u64): void // memset
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11b00(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11bb8(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11f50(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function AccountInfo_assign(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::assign
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function fn_1459d0(a: u64): u64 // lib uses repr_bitpacked_kind_from_prim_145358, callx
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fn_14ecd0(a: u64, b: u64, c: u64): u64 // lib "0001020304050607080910111213141516171819…", "0001020304050607080910111213141516171819…"
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp

// instruction handler: close_bundled_position (discriminator sha256("global:close_bundled_position")[..8] = 0x4367551bf5d82429)
// accounts [str: the program's account-error strings, in order of first use]: bundled_position, position_bundle, position_bundle_token_account, receiver, position_bundle_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
function ix_close_bundled_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const se0 = fp - 0xe0, se8 = fp - 0xe8, sf8 = fp - 0xf8, s1d8 = fp - 0x1d8, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s201 = fp - 0x201, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s1000 = fp - 0x1000
	let j, m: u64
	sol_log("Instruction: CloseBundledPosition", 0x21)
	const f = ix_args_len
	if (2 > f) {
		const k = fn_1459d0(0x100159468)
		if (2 > (k & 3) - 2) {
			m = anchor_error_from(s238, 0x66 /* anchor::InstructionDidNotDeserialize */)
			j = ld64(s238)
			st64(a + 8, ld64(s238 + 8))
			st64(a, j)
			return m
		}
		if ((k & 3) == 0) {
			m = anchor_error_from(s238, 0x66 /* anchor::InstructionDidNotDeserialize */)
			j = ld64(s238)
			st64(a + 8, ld64(s238 + 8))
			st64(a, j)
			return m
		}
		const l = ld64(ld64(k + 7))
		callx(l, ld64(k - 1), l)
		m = anchor_error_from(s238, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s238)
		st64(a + 8, ld64(s238 + 8))
		st64(a, j)
		return m
	}
	const g = ix_args
	const n = ld16(g)
	st8(s201, 0xff)
	st64(s200, accounts, accounts_len)
	st64(s1000, f, s201)
	m = accounts_close_bundled_position(sf8, program_id, s200, g, fp)
	const i = ld64(se8)
	j = ld64(sf8 + 8)
	const h = ld64(sf8)
	if (h == 0) {
		st64(a + 8, i)
		st64(a, j)
		return m
	}
	memcpy(s1d8, se0, 0xe0)
	st64(s1f0, h, j, i)
	st8(se0 + 8, ld8(s201))
	copyr(se8, s200, 0x10)
	st64(sf8, program_id, s1f0)
	m = fn_30e80(s218, sf8, n)
	j = ld64(s218)
	if (j == 2) {
		m = fn_8a170(s228, s1f0, program_id)
		j = ld64(s228)
		st64(a + 8, ld64(s228 + 8))
		st64(a, j)
		return m
	}
	st64(a + 8, ld64(s218 + 8))
	st64(a, j)
	return m
}

// Anchor Accounts::try_accounts of instruction close_bundled_position (called by ix_close_bundled_position; name [str]: from the handler's "Instruction: …" log; was fn_89260)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: bundled_position (ConstraintSeeds, ConstraintMut, ConstraintClose), position_bundle (ConstraintMut), position_bundle_token_account (ConstraintRaw), receiver (AccountNotEnoughKeys, ConstraintMut), position_bundle_authority
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_bundle_token_account_box, position_bundle_token_account_box_2, bundled_position, receiver
function accounts_close_bundled_position(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s18 = fp - 0x18, s38 = fp - 0x38, s60 = fp - 0x60, s80 = fp - 0x80, s138 = fp - 0x138, s140 = fp - 0x140, s158 = fp - 0x158, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s230 = fp - 0x230, s232 = fp - 0x232, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c0 = fp - 0x3c0, s3c8 = fp - 0x3c8, s3d0 = fp - 0x3d0, s3d8 = fp - 0x3d8, s3e0 = fp - 0x3e0, s3e8 = fp - 0x3e8, s3f0 = fp - 0x3f0
	let u, v, w, ah: u64
	let g = a
	if (2 > ld64(e - 0x1000)) {
		const l = fn_1459d0(0x100159468)
		if (2 > (l & 3) - 2) {
			w = anchor_error_from(s3b8, 0x66 /* anchor::InstructionDidNotDeserialize */)
			v = ld64(s3b8)
			st64(g + 0x10, ld64(s3b8 + 8))
			st64(g + 8, v)
			st64(g, 0)
			return w
		}
		if ((l & 3) == 0) {
			w = anchor_error_from(s3b8, 0x66 /* anchor::InstructionDidNotDeserialize */)
			v = ld64(s3b8)
			st64(g + 0x10, ld64(s3b8 + 8))
			st64(g + 8, v)
			st64(g, 0)
			return w
		}
		const m = ld64(ld64(l + 7))
		callx(m, ld64(l - 1), m)
		w = anchor_error_from(s3b8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		v = ld64(s3b8)
		st64(g + 0x10, ld64(s3b8 + 8))
		st64(g + 8, v)
		st64(g, 0)
		return w
	}
	st64(s3d0, b)
	st64(s3c8, ld64(e - 0xff8))
	st16(s232, ld16(d))
	try_accounts_11b00(s158, c, c, d, e)
	const h = ld64(s158 + 0x10)
	const i = ld64(s158 + 8)
	const f = ld64(s158)
	if (f == 0) {
		w = Error_with_account_name(s3a8, i, h, "bundled_position", 0x10)
		v = ld64(s3a8)
		st64(g + 0x10, ld64(s3a8 + 8))
		st64(g + 8, v)
		st64(g, 0)
		return w
	}
	st64(s3c0, g)
	memcpy(s218, s140, 0xc0)
	st64(s228, i, h)
	st64(s3d8, f)
	st64(s230, f)
	try_accounts_11bb8(s158, c)
	if (ld64(s158) == 0) {
		w = Error_with_account_name(s398, ld64(s158 + 8), ld64(s158 + 0x10), "position_bundle", 0xf)
		const q = ld64(s398)
		const p = ld64(s3c0)
		st64(p + 0x10, ld64(s398 + 8))
		st64(p + 8, q)
		st64(p, 0)
		return w
	}
	const j = ld64(0x300000000 /* heap bump-allocator cursor */)
	g = ld64(s3c0)
	const k = j != 0 ? sat_sub(j, 0x48) & -8 : 0x300007fb8
	if (k > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, k)
		memcpy(k, s158, 0x48)
		try_accounts_11f50(s158, c)
		if (ld32(s138 + 0x70) == 2) {
			w = Error_with_account_name(s388, ld64(s158), ld64(s158 + 8), "position_bundle_token_account", 0x1d)
			v = ld64(s388)
			st64(g + 0x10, ld64(s388 + 8))
			st64(g + 8, v)
			st64(g, 0)
			return w
		}
		const n = ld64(0x300000000 /* heap bump-allocator cursor */)
		const position_bundle_token_account_box: TokenAccount = n != 0 ? sat_sub(n, 0xb8) & -8 : 0x300007f48
		if (position_bundle_token_account_box > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, position_bundle_token_account_box)
			memcpy(position_bundle_token_account_box, s158, 0xb8)
			try_accounts_11718(s158, c)
			const s = ld64(s158 + 8)
			const r = ld64(s158)
			if (r == 2) {
				st64(s3e8, s)
				const t = ld64(c + 8)
				if (t == 0) {
					anchor_error_from(s258, 0xbbd /* anchor::AccountNotEnoughKeys */, s)
					u = ld64(s258 + 8)
					const x = ld64(s258)
					if (x != 2) {
						w = Error_with_account_name(s268, x, u, "receiver", 8)
						v = ld64(s268)
						st64(g + 0x10, ld64(s268 + 8))
						st64(g + 8, v)
						st64(g, 0)
						return w
					}
				} else {
					st64(c + 8, t - 1)
					u = ld64(c)
					st64(c, u + 0x30)
				}
				st64(s3e0, u)
				st64(s3f0, position_bundle_token_account_box)
				copyr(s38, k + 8, 0x20)
				fn_b9c0(s18, s232)
				st64(s158 + 0x10, s38)
				st64(s158, 0x100153000)
				copyr(s138, s10, 0x10)
				st64(s140, 0x20)
				st64(s158 + 8, 0x10)
				// PDA find_program_address(["bundled_position", *s38, ?], program *(ld64(s3d0)))
				Pubkey_find_program_address(s60, s158, 3, ld64(s3d0))
				copyr(s80, s60, 0x20)
				st8(ld64(s3c8), ld8(s60 + 0x20))
				const bundled_position: AccountInfo = ld64(s3d8)
				const z = bundled_position.key
				copyr(s158, z, 0x20)
				if ((memcmp(s158, s80, 0x20) as u32) == 0) {
					if (bundled_position.is_writable == 0) {
						anchor_error_from(s368, 0x7d0 /* anchor::ConstraintMut */)
						w = Error_with_account_name(s378, ld64(s368), ld64(s368 + 8), "bundled_position", 0x10)
						ah = ld64(s378 + 8)
						st64(g + 8, ld64(s378))
						st64(g + 0x10, ah)
						st64(g, 0)
						return w
					}
					copyr(s60, z, 0x20)
					const ai = ld64(ld64(s3e0))
					copyr(s158, ai, 0x20)
					if ((memcmp(s60, s158, 0x20) as u32) == 0) {
						anchor_error_from(s348, 0x7db /* anchor::ConstraintClose */)
						w = Error_with_account_name(s358, ld64(s348), ld64(s348 + 8), "bundled_position", 0x10)
						ah = ld64(s358 + 8)
						st64(g + 8, ld64(s358))
						st64(g + 0x10, ah)
						st64(g, 0)
						return w
					}
					if (ld8(ld64(k) + 0x29) == 0) {
						anchor_error_from(s328, 0x7d0 /* anchor::ConstraintMut */)
						w = Error_with_account_name(s338, ld64(s328), ld64(s328 + 8), "position_bundle", 0xf)
						ah = ld64(s338 + 8)
						st64(g + 8, ld64(s338))
						st64(g + 0x10, ah)
						st64(g, 0)
						return w
					}
					const position_bundle_token_account_box_2: TokenAccount = ld64(s3f0)
					if ((memcmp(position_bundle_token_account_box_2.mint, s208, 0x20) as u32) == 0) {
						if ((memcmp(position_bundle_token_account_box_2.mint, k + 8, 0x20) as u32) == 0) {
							if (position_bundle_token_account_box_2.amount != 1) {
								anchor_error_from(s2e8, 0x7d3 /* anchor::ConstraintRaw */)
								w = Error_with_account_name(s2f8, ld64(s2e8), ld64(s2e8 + 8), "position_bundle_token_account", 0x1d)
								ah = ld64(s2f8 + 8)
								st64(g + 8, ld64(s2f8))
								st64(g + 0x10, ah)
								st64(g, 0)
								return w
							}
							const receiver: AccountInfo = ld64(s3e0)
							if (receiver.is_writable == 0) {
								anchor_error_from(s308, 0x7d0 /* anchor::ConstraintMut */)
								w = Error_with_account_name(s318, ld64(s308), ld64(s308 + 8), "receiver", 8)
								ah = ld64(s318 + 8)
								st64(g + 8, ld64(s318))
								st64(g + 0x10, ah)
								st64(g, 0)
								return w
							}
							w = memcpy(g, s230, 0xd8)
							st64(g + 0xf0, receiver)
							st64(g + 0xe8, ld64(s3e8))
							st64(g + 0xe0, position_bundle_token_account_box_2)
							st64(g + 0xd8, k)
							return w
						}
						anchor_error_from(s2c8, 0x7d3 /* anchor::ConstraintRaw */)
						w = Error_with_account_name(s2d8, ld64(s2c8), ld64(s2c8 + 8), "position_bundle_token_account", 0x1d)
						ah = ld64(s2d8 + 8)
						st64(g + 8, ld64(s2d8))
						st64(g + 0x10, ah)
						st64(g, 0)
						return w
					}
					anchor_error_from(s2a8, 0x7d3 /* anchor::ConstraintRaw */)
					w = Error_with_account_name(s2b8, ld64(s2a8), ld64(s2a8 + 8), "position_bundle_token_account", 0x1d)
					ah = ld64(s2b8 + 8)
					st64(g + 8, ld64(s2b8))
					st64(g + 0x10, ah)
					st64(g, 0)
					return w
				}
				anchor_error_from(s278, 0x7d6 /* anchor::ConstraintSeeds */)
				Error_with_account_name(s288, ld64(s278), ld64(s278 + 8), "bundled_position", 0x10)
				const ag = ld64(s288 + 8)
				const af = ld64(s288)
				const aa = ld64(ld64(s230))
				const ae = ld64(aa + 0x18)
				const ad = ld64(aa + 0x10)
				const ac = ld64(aa + 8)
				const ab = ld64(aa)
				copy(s138, s80, 0x20)
				st64(s158, ab, ac, ad, ae)
				w = fn_13b5c0(s298, af, ag, s158, ac)
				ah = ld64(s298 + 8)
				st64(g + 8, ld64(s298))
				st64(g + 0x10, ah)
				st64(g, 0)
				return w
			}
			w = Error_with_account_name(s248, r, s, "position_bundle_authority", 0x19)
			v = ld64(s248)
			st64(g + 0x10, ld64(s248 + 8))
			st64(g + 8, v)
			st64(g, 0)
			return w
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
// types [heur]: b: CloseBundledPositionContext (the handler ix_close_bundled_position passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_30e80(a: u64, b: CloseBundledPositionContext, c: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30
	const accounts: CloseBundledPositionAccounts = b.accounts
	let l = fn_5ffd0(s10, accounts.position_bundle_token_account.mint, accounts + 0xe8)
	let g = ld64(s10)
	if (g != 2) {
		st64(a + 8, ld64(s10 + 8))
		st64(a, g)
		return l
	}
	if ((ld64(accounts + 0x98) | ld64(accounts + 0xb0)) != 0) {
		l = fn_87630(s30, 5)
		g = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, g)
		return l
	}
	if (ld64(accounts + 0x78) != 0) {
		l = fn_87630(s30, 5)
		g = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, g)
		return l
	}
	if ((ld64(accounts + 0x48) | ld64(accounts + 0x50)) != 0) {
		l = fn_87630(s30, 5)
		g = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, g)
		return l
	}
	if ((ld64(accounts + 0xc8) | ld64(accounts + 0x80)) != 0) {
		l = fn_87630(s30, 5)
		g = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, g)
		return l
	}
	let k = 0x2b
	if (0xff >= (c as u16)) {
		const j = 1 << (c & 7)
		const h = ld64(accounts + 0xd8) + ((c & 0xfff8) >> 3)
		k = 0x2d
		const i = ld8(h + 0x28)
		if ((i & j) != 0) {
			st8(h + 0x28, i ^ j)
			st64(a + 8, 0x2d)
			st64(a, 2)
			return l
		}
	}
	l = fn_87630(s20, k)
	k = undef
	const m = ld64(s20)
	if (m == 2) {
		st64(a + 8, k)
		st64(a, 2)
		return l
	}
	st64(a + 8, ld64(s20 + 8))
	st64(a, m)
	return l
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: bundled_position, position_bundle
function fn_8a170(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0
	let x, y: u64
	const f: AccountInfo = ld64(b + 0xf0)
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
	const n: AccountInfo = ld64(b)
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
		y = Error_with_account_name(s80, v, ld64(s70 + 8), "bundled_position", 0x10)
		x = ld64(s80)
		st64(a + 8, ld64(s80 + 8))
		st64(a, x)
		return y
	}
	y = fn_7f28(s90, ld64(b + 0xd8), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const w = ld64(s90)
	if (w == 2) {
		st64(a + 8, undef)
		st64(a, 2)
		return y
	}
	y = Error_with_account_name(sa0, w, ld64(s90 + 8), "position_bundle", 0xf)
	x = ld64(sa0)
	st64(a + 8, ld64(sa0 + 8))
	st64(a, x)
	return y
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_149478(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	const s20 = fp - 0x20, s28 = fp - 0x28
	st64(s20, 0x10015b8e0, a, b)
	st16(s20 + 0x18, 1)
	st64(s28, 1)
	fn_147238(s28, b, c, d, e)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_147238(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	fn_1478b8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_1478b8(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	custom_panic(a, b, c, d, e)
	abort()
}
