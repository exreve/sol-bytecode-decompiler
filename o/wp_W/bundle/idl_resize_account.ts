// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction idl_resize_account: handler + 12 reachable functions
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
declare function sol_memset(dst: u64, byte: u64, n: u64): void // memset
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13d318(a: u64, b: u64, c: u64): u64 // lib uses memcpy, __rust_alloc, alloc_handle_alloc_error, ptr_drop_in_place_1397a0, …
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function rent_get(a: u64): u64 // lib solana_sysvar::rent::<impl solana_sysvar::Sysvar for solana_rent::Rent>::get
declare function fn_14f3e8(a: u64): u64 // lib
declare function __floatundidf(a: u64): u64 // lib __floatundidf
declare function fn_14f808(a: u64, b: u64): u64 // lib uses __multi3
declare function fn_151a40(a: u64, b: u64): u64 // lib
declare function fn_151cb0(a: u64, b: u64): u64 // lib

// instruction handler: idl_resize_account (discriminator sha256("global:idl_resize_account")[..8] = 0xcaf918924f1f0e45)
function ix_idl_resize_account(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s30 = fp - 0x30, s58 = fp - 0x58, s60 = fp - 0x60, s88 = fp - 0x88, s90 = fp - 0x90, sb8 = fp - 0xb8, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s100 = fp - 0x100, s110 = fp - 0x110
	let m, n, o, v: u64
	let f = a
	sol_log("Instruction: IdlResizeAccount", 0x1d)
	if (ld32(b + 0x28) != 0) {
		o = anchor_error_from(se0, 0x3ea /* anchor::IdlAccountNotEmpty */)
		v = ld64(se0)
		st64(f + 8, ld64(se0 + 8))
		st64(f, v)
		return o
	}
	const ba = f
	const g: AccountInfo = ld64(b)
	const h = fn_143178(g)
	const i = fn_143178(g)
	if (i > c) {
		fn_149110("data_len should always be >= the current account space", 0x36, 0x10015a8d0, m, n)
	}
	let k = h
	const j = min(c - i, 0x2710)
	f = ba
	let l = h > h + j
	if (l != 0) {
		fn_1490e8(0x10015a8d0, l, k, m, n)
	}
	o = fn_143178(g, l, k, m, n)
	if (h + j > o) {
		rent_get(sd0)
		const q = ld64(sd0 + 0x10)
		const p = ld64(sd0 + 8)
		if (ld64(sd0) != 0) {
			st32(s18, ld32(sb8 + 1))
			st32(s18 + 3, ld32(sb8 + 4))
			const w = ld8(sb8)
			st32(sd0 + 0x14, ld32(s18 + 3))
			st32(sd0 + 0x11, ld32(s18))
			st8(sd0 + 0x10, w)
			st64(sd0, p, q)
			o = fn_13b430(sf0, sd0)
			v = ld64(sf0)
			st64(f + 8, ld64(sf0 + 8))
			st64(f, v)
			return o
		}
		const r = fn_14f7f8(q, __floatundidf(p * (h + j + 0x80)))
		let az = fn_151cb0(r, 0)
		const s = fn_14f3e8(r)
		az = 0 > (az as i64) ? 0 : s
		const z = (fn_151a40(r, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : az
		const t: AccountInfo = ld64(b + 0x38)
		const u: LamportsCell = t.lamports
		const y = t.key
		rc_inc(u)
		const x: DataCell = t.data
		az = x
		rc_inc(x)
		const aa: AccountInfo = ld64(b + 0x30)
		const ab: LamportsCell = aa.lamports
		const au = t.executable
		const av = t.is_writable
		const aw = t.is_signer
		const ax = t.rent_epoch
		const ay = t.owner
		const at = aa.key
		rc_inc(ab)
		const ac: DataCell = aa.data
		rc_inc(ac)
		const ad: LamportsCell = g.lamports
		const an = g.key
		const ao = aa.executable
		const ap = aa.is_writable
		const aq = aa.is_signer
		const ar = aa.rent_epoch
		const af = aa.owner
		rc_inc(ad)
		const ae: DataCell = g.data
		rc_inc(ae)
		const ak = g.owner
		const aj = g.rent_epoch
		const ai = g.is_signer
		const ah = g.is_writable
		const ag = g.executable
		st8(s30, ai, ah, ag)
		st64(s58, an, ad, ae, ak, aj)
		st8(s60, aq, ap, ao)
		st64(s88, at, ab, ac, af, ar)
		st8(s90, aw, av, au)
		st64(sb8, y, u, az, ay, ax)
		st64(s28, 8, 0)
		st64(sd0, 0, 8, 0)
		const al = fn_143100(g, ak, aj, ah, ag)
		l = undef
		k = z
		if (al > z) {
			fn_1490e8(0x10015a8d0, l, k, m, n)
		}
		o = fn_13d318(s100, sd0, k - al)
		const am = ld64(s100)
		f = ba
		if (am != 2) {
			st64(f + 8, ld64(s100 + 8))
			st64(f, am)
			return o
		}
		o = fn_1434c0(s18, g, h + j, o)
		if (ld64(s18) == 0x800000000000001a /* Ok */) {
			st64(f + 8, 0x800000000000001a /* Ok */)
			st64(f, 2)
			return o
		}
		copyr(sd0, s18, 0x18)
		o = fn_13b430(s110, sd0)
		v = ld64(s110)
		st64(f + 8, ld64(s110 + 8))
		st64(f, v)
		return o
	}
	st64(f + 8, undef)
	st64(f, 2)
	return o
}

function fn_143178(a: AccountInfo, b: u64, c: u64, d: u64, e: u64): u64 {
	const f: DataCell = a.data
	const g = f.borrow
	if (g > 0x7ffffffffffffffe) {
		fn_1486f0(0x10015b4f8, g, 0x7ffffffffffffffe, d, e)
	}
	return f.len
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
function fn_14f7f8(a: u64, b: u64): u64 {
	return fn_14f808(a, b)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), e (value)
function fn_1490e8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_1494c8("called `Option::unwrap()` on a `None` value", 0x2b, a, d, e)
}

function fn_149110(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s10 = fp - 0x10
	st64(s10, a, b)
	fn_149530(s10, c, c, d, e)
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

function fn_149530(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s10 = fp - 0x10, s40 = fp - 0x40
	st64(s40, 0x100153110)
	st64(s40 + 0x10, s10)
	st64(s10, a, T_fmt_14f0b8)
	st64(s40 + 0x20, 0)
	st64(s40 + 8, 1)
	st64(s40 + 0x18, 1)
	fn_149478(s40, b, T_fmt_14f0b8, d, e)
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
