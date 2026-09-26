// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction initialize_dynamic_tick_array: handler + 19 reachable functions
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
interface InitializeDynamicTickArrayAccounts { // Accounts struct of instruction initialize_dynamic_tick_array as accounts_initialize_dynamic_tick_array returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	whirlpool:  at<0x00, ref<AccountInfo>>
	funder:     at<0x290, ref<AccountInfo>>
	tick_array: at<0x298, ref<AccountInfo>>
}
interface InitializeDynamicTickArrayContext { // anchor_lang Context of instruction initialize_dynamic_tick_array (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<InitializeDynamicTickArrayAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function fn_b580(a: u64): u64 // lib uses alloc_handle_alloc_error, Error__new
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11a48(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_122e8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_1390d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcmp, AccountInfo_try_borrow_lamports, AccountInfo_try_borrow_data
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function rent_get(a: u64): u64 // lib solana_sysvar::rent::<impl solana_sysvar::Sysvar for solana_rent::Rent>::get
declare function fn_142800(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_142e70(a: u64, b: u64, c: u64, d: u64): void // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function fn_1459d0(a: u64): u64 // lib uses repr_bitpacked_kind_from_prim_145358, callx
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function fn_14a698(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses callx
declare function fn_14ecd0(a: u64, b: u64, c: u64): u64 // lib "0001020304050607080910111213141516171819…", "0001020304050607080910111213141516171819…"
declare function imp_fmt(a: u64, b: u64): u64 // lib core::fmt::num::imp::<impl core::fmt::Display for i32>::fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function fn_151bf8(a: u64, b: u64): u64 // lib

// instruction handler: initialize_dynamic_tick_array (discriminator sha256("global:initialize_dynamic_tick_array")[..8] = 0x328ee778c8a52129)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, tick_array, funder, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
function ix_initialize_dynamic_tick_array(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s10 = fp - 0x10, s11 = fp - 0x11, s2a8 = fp - 0x2a8, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s550 = fp - 0x550, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s1000 = fp - 0x1000
	let i, l, m, n, o, p: u64
	sol_log("Instruction: InitializeDynamicTickArray", 0x27)
	const f = ix_args_len
	if (f >= 4 && f != 4) {
		const g = ix_args
		const q = ld32(g)
		const h = ld8(g + 4)
		st8(s11, h)
		if (2 > h) {
			st8(s11, 0xff)
			st64(s10, accounts, accounts_len)
			st64(s1000, f, s11)
			p = accounts_initialize_dynamic_tick_array(s2c0, program_id, s10, g, fp)
			const r = ld64(s2c0)
			if (r == 0) {
				o = ld64(s2c0 + 8)
				st64(a + 8, ld64(s2b0))
				st64(a, o)
				return p
			}
			const t = ld64(s2c0 + 8)
			const s = ld64(s2b0)
			memcpy(s550, s2a8, 0x290)
			st64(s568, r, t, s)
			st8(s2a8 + 8, ld8(s11))
			copyr(s2b0, s10, 0x10)
			st64(s2c0, program_id, s568)
			p = fn_313b8(s578, s2c0, q, h != 0)
			o = ld64(s578)
			if (o == 2) {
				st64(a + 8, undef)
				st64(a, 2)
				return p
			}
			st64(a + 8, ld64(s578 + 8))
			st64(a, o)
			return p
		}
		st64(s2c0, 0x100159620)
		st64(s2b0, s10)
		st64(s10, s11, fn_14ef78)
		st64(s2a8 + 8, 0)
		st64(s2c0 + 8, 1)
		st64(s2a8, 1)
		// fmt "Invalid bool representation: {}" {} = h [fn_14ef78]
		fn_147e78(s568, s2c0, undef, g)
		i = fn_b580(s568)
	} else {
		i = fn_1459d0(0x100159468)
	}
	const j = i
	if (2 > (i & 3) - 2) {
		p = anchor_error_from(s588, 0x66 /* anchor::InstructionDidNotDeserialize */, l, m, n)
		o = ld64(s588)
		st64(a + 8, ld64(s588 + 8))
		st64(a, o)
		return p
	}
	if ((j & 3) == 0) {
		p = anchor_error_from(s588, 0x66 /* anchor::InstructionDidNotDeserialize */, l, m, n)
		o = ld64(s588)
		st64(a + 8, ld64(s588 + 8))
		st64(a, o)
		return p
	}
	const k = ld64(ld64(i + 7))
	callx(k, ld64(i - 1), k)
	p = anchor_error_from(s588, 0x66 /* anchor::InstructionDidNotDeserialize */)
	o = ld64(s588)
	st64(a + 8, ld64(s588 + 8))
	st64(a, o)
	return p
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

// Anchor Accounts::try_accounts of instruction initialize_dynamic_tick_array (called by ix_initialize_dynamic_tick_array; name [str]: from the handler's "Instruction: …" log; was fn_97e78)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool, tick_array (AccountNotEnoughKeys, ConstraintSeeds, ConstraintMut), funder (ConstraintMut), system_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpool, tick_array
function accounts_initialize_dynamic_tick_array(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s30 = fp - 0x30, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s2e8 = fp - 0x2e8, s558 = fp - 0x558, s560 = fp - 0x560, s578 = fp - 0x578, s57c = fp - 0x57c, s590 = fp - 0x590, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s668 = fp - 0x668, s670 = fp - 0x670, s678 = fp - 0x678, s680 = fp - 0x680
	let o, p, z, aa, ab: u64
	if (4 > ld64(e - 0x1000)) {
		const m = fn_1459d0(0x100159468)
		if (2 > (m & 3) - 2) {
			ab = anchor_error_from(s650, 0x66 /* anchor::InstructionDidNotDeserialize */)
			aa = ld64(s650)
			st64(a + 0x10, ld64(s650 + 8))
			st64(a + 8, aa)
			st64(a, 0)
			return ab
		}
		if ((m & 3) == 0) {
			ab = anchor_error_from(s650, 0x66 /* anchor::InstructionDidNotDeserialize */)
			aa = ld64(s650)
			st64(a + 0x10, ld64(s650 + 8))
			st64(a + 8, aa)
			st64(a, 0)
			return ab
		}
		const n = ld64(ld64(m + 7))
		callx(n, ld64(m - 1), n)
		ab = anchor_error_from(s650, 0x66 /* anchor::InstructionDidNotDeserialize */)
		aa = ld64(s650)
		st64(a + 0x10, ld64(s650 + 8))
		st64(a + 8, aa)
		st64(a, 0)
		return ab
	}
	st64(s668 + 0x10, ld64(e - 0xff8))
	st32(s57c, ld32(d))
	try_accounts_11a48(s578, c, c, d, e)
	const h = ld64(s578 + 0x10)
	const g = ld64(s578 + 8)
	const whirlpool: AccountInfo = ld64(s578)
	if (whirlpool == 0) {
		ab = Error_with_account_name(s640, g, h, 0x100152b28 /* "whirlpool" */, 9)
		aa = ld64(s640)
		st64(a + 0x10, ld64(s640 + 8))
		st64(a + 8, aa)
		st64(a, 0)
		return ab
	}
	st64(s668, g, h)
	memcpy(s2e8, s560, 0x278)
	try_accounts_11718(s578, c)
	let j = ld64(s578 + 8)
	const i = ld64(s578)
	if (i == 2) {
		st64(s670, j)
		const k = ld64(c + 8)
		if (k == 0) {
			anchor_error_from(s5a0, 0xbbd /* anchor::AccountNotEnoughKeys */, j, o, p)
			j = undef
			st64(s678, ld64(s5a0 + 8))
			const q = ld64(s5a0)
			if (q != 2) {
				ab = Error_with_account_name(s5b0, q, ld64(s678), 0x100152e25 /* "tick_array" */, 0xa)
				aa = ld64(s5b0)
				st64(a + 0x10, ld64(s5b0 + 8))
				st64(a + 8, aa)
				st64(a, 0)
				return ab
			}
		} else {
			st64(c + 8, k - 1)
			const l: AccountInfo = ld64(c)
			st64(s678, l)
			st64(c, l + 0x30)
		}
		fn_122e8(s578, c, j, o, p)
		const s = ld64(s578 + 8)
		const r = ld64(s578)
		if (r == 2) {
			if (ld8(ld64(s670) + 0x29) == 0) {
				anchor_error_from(s620, 0x7d0 /* anchor::ConstraintMut */, s)
				ab = Error_with_account_name(s630, ld64(s620), ld64(s620 + 8), "funder", 6)
				aa = ld64(s630)
				st64(a + 0x10, ld64(s630 + 8))
				st64(a + 8, aa)
				st64(a, 0)
				return ab
			}
			st64(s680, s)
			const t = whirlpool.key
			copyr(s20, t, 0x20)
			st64(s70, 0, 1, 0)
			st64(s558, s70, 0x100159480)
			st8(s558 + 0x18, 3)
			st64(s558 + 0x10, 0x20)
			st64(s578 + 0x10, 0)
			st64(s578, 0)
			if (imp_fmt(s57c, s578) == 0) {
				copyr(s30, s68, 0x10)
				st64(s50, 0x100152e25, 0xa, s20, 0x20)
				// PDA find_program_address(["tick_array", *s20, ?], program *b)
				Pubkey_find_program_address(s578, s50, 3, b)
				copyr(s70, s578, 0x20)
				st8(ld64(s668 + 0x10), ld8(s558))
				const tick_array: AccountInfo = ld64(s678)
				const v = tick_array.key
				copyr(s578, v, 0x20)
				if ((memcmp(s578, s70, 0x20) as u32) != 0) {
					anchor_error_from(s5d0, 0x7d6 /* anchor::ConstraintSeeds */)
					const y = Error_with_account_name(s5e0, ld64(s5d0), ld64(s5d0 + 8), 0x100152e25 /* "tick_array" */, 0xa)
					const x = ld64(s5e0 + 8)
					const w = ld64(s5e0)
					copyr(s578, v, 0x20)
					copy(s558, s70, 0x20)
					ab = fn_13b5c0(s5f0, w, x, s578, y)
					z = ld64(s5f0 + 8)
					st64(a + 8, ld64(s5f0))
					st64(a + 0x10, z)
					st64(a, 0)
					return ab
				}
				if (tick_array.is_writable == 0) {
					anchor_error_from(s600, 0x7d0 /* anchor::ConstraintMut */)
					ab = Error_with_account_name(s610, ld64(s600), ld64(s600 + 8), 0x100152e25 /* "tick_array" */, 0xa)
					z = ld64(s610 + 8)
					st64(a + 8, ld64(s610))
					st64(a + 0x10, z)
					st64(a, 0)
					return ab
				}
				ab = memcpy(a + 0x18, s2e8, 0x278)
				st64(a + 0x2a0, ld64(s680))
				st64(a + 0x298, tick_array)
				st64(a + 0x290, ld64(s670))
				st64(a + 0x10, ld64(s668 + 8))
				st64(a + 8, ld64(s668))
				st64(a, whirlpool)
				return ab
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s50, 0x1001594b0, 0x1001594d0)
		}
		ab = Error_with_account_name(s5c0, r, s, "system_program", 0xe)
		aa = ld64(s5c0)
		st64(a + 0x10, ld64(s5c0 + 8))
		st64(a + 8, aa)
		st64(a, 0)
		return ab
	}
	ab = Error_with_account_name(s590, i, j, "funder", 6)
	aa = ld64(s590)
	st64(a + 0x10, ld64(s590 + 8))
	st64(a + 8, aa)
	st64(a, 0)
	return ab
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value)
// types [heur]: b: InitializeDynamicTickArrayContext (the handler ix_initialize_dynamic_tick_array passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_313b8(a: u64, b: InitializeDynamicTickArrayContext, c: u64, d: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s80 = fp - 0x80, sa0 = fp - 0xa0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, sd8 = fp - 0xd8, s100 = fp - 0x100, s108 = fp - 0x108, s130 = fp - 0x130, s138 = fp - 0x138, s160 = fp - 0x160, s164 = fp - 0x164, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8
	let j, au, az: u64
	st32(s164, c)
	const accounts: InitializeDynamicTickArrayAccounts = b.accounts
	let g = accounts.tick_array
	let h = ld64(g + 0x18)
	if ((memcmp(h, 0x100152180, 0x20) as u32) == 0) {
		az = fn_5fd40(s178)
		au = ld64(s178 + 8)
		j = ld64(s178)
		if (j != 2) {
			st64(a + 8, au)
			st64(a, j)
			return az
		}
		const k: AccountInfo = ld64(accounts + 0x2a0)
		const l: LamportsCell = k.lamports
		const w = k.key
		rc_inc(l)
		const r: DataCell = k.data
		rc_inc(r)
		const v = k.owner
		const u = k.rent_epoch
		const t = k.is_signer
		const s = k.is_writable
		st8(s138 + 2, k.executable)
		st8(s138, t, s)
		st64(s160, w, l, r, v, u)
		const funder: AccountInfo = accounts.funder
		const y: LamportsCell = funder.lamports
		const ae = funder.key
		rc_inc(y)
		const z: DataCell = funder.data
		rc_inc(z)
		const ad = funder.owner
		const ac = funder.rent_epoch
		const ab = funder.is_signer
		const aa = funder.is_writable
		st8(s108 + 2, funder.executable)
		st8(s108, ab, aa)
		st64(s130, ae, y, z, ad, ac)
		const tick_array: AccountInfo = accounts.tick_array
		const ag: LamportsCell = tick_array.lamports
		const am = tick_array.key
		rc_inc(ag)
		const ah: DataCell = tick_array.data
		rc_inc(ah)
		const al = tick_array.owner
		const ak = tick_array.rent_epoch
		const aj = tick_array.is_signer
		const ai = tick_array.is_writable
		st8(sd8 + 2, tick_array.executable)
		st8(sd8, aj, ai)
		st64(s100, am, ag, ah, al, ak)
		const an = accounts.whirlpool.key
		copyr(s80, an, 0x20)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x100159480)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (imp_fmt(s164, s48) != 0) {
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1, 0x1001594b0, 0x1001594d0)
		}
		const ap = ld64(s60 + 8)
		const ao = ld64(s60 + 0x10)
		const aq = ld8(b + 0x20)
		st64(sa0, ap, ao, s48)
		st64(sc0 + 0x10, s80)
		st64(sc0, 0x100152e25)
		st8(s48, aq)
		st64(sd0, sc0)
		st64(sa0 + 0x18, 1)
		st64(sc0 + 0x18, 0x20)
		st64(sc0 + 8, 0xa)
		st64(sd0 + 8, 4)
		az = fn_5ecd8(s188, s160, s130, s100, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x1d4fc0, 0x94, sd0, 1)
		j = ld64(s188)
		if (j != 2) {
			st64(a + 8, ld64(s188 + 8))
			st64(a, j)
			return az
		}
		g = accounts.tick_array
		h = ld64(g + 0x18)
	}
	const i = memcmp(h, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((i as u32) == 0) {
		az = fn_143448(s48, g, i as u32)
		let p = undef
		let q = undef
		const ar = ld64(s48 + 0x10)
		const n = ld64(s48 + 8)
		const m = ld64(s48)
		if (m == 0x800000000000001a /* Ok */) {
			const o = ld64(n + 8)
			if (o > 7) {
				let at = ld64(n)
				au = ld64(at)
				if (au != 0) {
					if (d != 0) {
						q = 0x38dac7e18ef6d811 /* account:DynamicTickArray */
						if (ld64(at) == 0x38dac7e18ef6d811 /* account:DynamicTickArray */) {
							st64(ar, ld64(ar) + 1)
							st64(a + 8, au)
							st64(a, 2)
							return az
						}
						at = ld64(at)
						p = 0xbb42076ebebd6145 /* account:TickArray */
						if (at == 0xbb42076ebebd6145 /* account:TickArray */) {
							st64(ar, ld64(ar) + 1)
							st64(a + 8, au)
							st64(a, 2)
							return az
						}
					}
					az = anchor_error_from(s1b8, 0xbb8 /* anchor::AccountDiscriminatorAlreadySet */, at, p, q)
					au = ld64(s1b8 + 8)
					j = ld64(s1b8)
					st64(ar, ld64(ar) + 1)
					st64(a + 8, au)
					st64(a, j)
					return az
				}
				st64(at, 0x38dac7e18ef6d811 /* account:DynamicTickArray */)
				const av = ld64(n + 8)
				if (av > 7) {
					B30: {
						const ba = ld64(n)
						const aw = ld16(accounts + 0x284)
						const ax = ld32(s164)
						const ay = ((ax as i32) - 0x6c4f5) as u32
						if (0xfff27617 > ay) {
							if ((ax as i32) > -0x6c4f4) {
								break B30
							}
							if (aw == 0) {
								fn_14e1c0(0x100159f30, aw * 0x58, ay, 0xfff27617, q)
							}
							if (0x6c4f4 % (aw * 0x58) - aw * 0x58 - 0x6c4f4 != (ax as i32)) {
								break B30
							}
						} else {
							if (aw == 0) {
								fn_14e1c0(0x100159f18, aw * 0x58, ay, 0xfff27617, q)
							}
							az = fn_151bf8(ax as i32, aw * 0x58)
							if (az != 0) {
								break B30
							}
						}
						st32(ba + 8, ax as i32)
						const bb = accounts.whirlpool.key
						st64(ba + 0x24, ld64(bb + 0x18))
						st64(ba + 0x1c, ld64(bb + 0x10))
						au = ld64(bb + 8)
						st64(ba + 0x14, au)
						st64(ba + 0xc, ld64(bb))
						st64(ar, ld64(ar) + 1)
						st64(a + 8, au)
						st64(a, 2)
						return az
					}
					az = fn_87630(s1c8, 1)
					au = ld64(s1c8 + 8)
					j = ld64(s1c8)
					st64(ar, ld64(ar) + 1)
					st64(a + 8, au)
					st64(a, j)
					return az
				}
				fn_14c4f0(8, av, 0x100159b40, p, q)
			}
			fn_14c5c0(8, o, 0x100159b28, p, q)
		}
		st64(s48, m, n, ar)
		az = fn_13b430(s1a8, s48)
		j = ld64(s1a8)
		st64(a + 8, ld64(s1a8 + 8))
		st64(a, j)
		return az
	}
	az = anchor_error_from(s198, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	j = ld64(s198)
	st64(a + 8, ld64(s198 + 8))
	st64(a, j)
	return az
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (value), e (value)
function fn_14c5c0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c5c8(a, b, c, d, e)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_14c4f0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c4f8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), e (value)
function fn_14e1c0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x10015bb90, 1, 8, 0, 0)
	// fmt "attempt to calculate the remainder with a divisor of zero"
	fn_149478(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_149478(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	const s20 = fp - 0x20, s28 = fp - 0x28
	st64(s20, 0x10015b8e0, a, b)
	st16(s20 + 0x18, 1)
	st64(s28, 1)
	fn_147238(s28, b, c, d, e)
}

function fn_14f060(a: u64, b: u64): u64 {
	return fn_14ecd0(ld64(a), 1, b)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_147238(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	fn_1478b8(a, b, c, d, e)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_1478b8(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	custom_panic(a, b, c, d, e)
	abort()
}
