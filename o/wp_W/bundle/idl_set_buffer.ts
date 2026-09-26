// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction idl_set_buffer: handler + 10 reachable functions
// typed views: x.field is exactly the load / store / address given by the field declaration
type at<Offset extends number, T> = T // view field: a T at byte offset Offset of the object (x.f: scalar = its load, ref<U> = the loaded pointer, other = its address)
type ref<T> = T                        // view field holding a pointer (8 bytes) to a T
interface sized<Size extends number> {} // a view of that many bytes: x[k] is the k-th such object from x (at x + k * Size)
interface Pubkey {} // 32-byte public key (a Pubkey value is its address)
interface bytes {} // byte array in place (a bytes value is its address)
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
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function fn_6c8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a Display implementation returned an err…"
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_13b3a8(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error, memcpy
declare function ErrorCode_name(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib anchor_lang::error::ErrorCode::name
declare function ErrorCode_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::error::ErrorCode as core::fmt::Display>::fmt
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_14ecd0(a: u64, b: u64, c: u64): u64 // lib "0001020304050607080910111213141516171819…", "0001020304050607080910111213141516171819…"

// instruction handler: idl_set_buffer (discriminator sha256("global:idl_set_buffer")[..8] = 0xaef61cb501b51b1)
function ix_idl_set_buffer(a: u64, b: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s58 = fp - 0x58, s70 = fp - 0x70, sf0 = fp - 0xf0, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130
	let q: u64
	const g = sol_log("Instruction: IdlSetBuffer", 0x19)
	const f = ld32(b + 0x28)
	st32(b + 0x58, f)
	const j = fn_143448(s40, ld64(b + 0x30), g)
	if (ld64(s40) != 0x800000000000001a /* Ok */) {
		copyr(s110, s40, 0x18)
		fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s110, 0x10015a8e8, 0x10015a8d0)
	}
	const h = ld64(s40 + 8)
	const i = ld64(h + 8)
	if (i > 0x2b) {
		const r = ld64(s40 + 0x10)
		const m = ld64(h)
		AccountInfo_try_borrow_data(s40, ld64(b), j)
		if (ld64(s40) != 0x800000000000001a /* Ok */) {
			copyr(s110, s40, 0x18)
			fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s110, 0x10015a8e8, 0x10015a8d0)
		}
		const k = ld64(s40 + 8)
		const l = ld64(k + 8)
		if (l > 0x2b) {
			if (l - 0x2c >= f) {
				const n = ld64(s40 + 0x10)
				if (f > i - 0x2c) {
					ErrorCode_name(s70, 0x100152d30)
					st64(s58, 0, 1, 0)
					st64(s20, s58, 0x100159480)
					st8(s20 + 0x18, 3)
					st64(s20 + 0x10, 0x20)
					st64(s40 + 0x10, 0)
					st64(s40, 0)
					if (ErrorCode_fmt(0x100152d30, s40) == 0) {
						copy(sf0, s70, 0x30)
						st64(s110 + 8, 0x100155435)
						st32(sf0 + 0x78, 0x9ca /* anchor::RequireGteViolated */)
						st8(sf0 + 0x30, 2)
						st32(s110 + 0x18, 0x27)
						st64(s110 + 0x10, 0x1d)
						st64(s110, 0)
						fn_13b3a8(s120, s110)
						q = fn_6c8(s130, ld64(s120), ld64(s120 + 8), i - 0x2c, f)
						const o = ld64(s130 + 8)
						const p = ld64(s130)
						st64(n, ld64(n) - 1)
						st64(r, ld64(r) + 1)
						st64(a + 8, o)
						st64(a, p)
						return q
					}
					fn_149678("a Display implementation returned an error unexpectedly", 0x37, s110, 0x1001594b0, 0x1001594d0)
				}
				q = memcpy(m + 0x2c, ld64(k) + 0x2c, f)
				st64(n, ld64(n) - 1)
				st64(r, ld64(r) + 1)
				st64(a + 8, undef)
				st64(a, 2)
				return q
			}
			fn_14c5c0(f, l - 0x2c, 0x10015a8d0)
		}
		fn_14c4f0(0x2c, l, 0x10015a8d0)
	}
	fn_14c4f0(0x2c, i, 0x10015a8d0)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_14c4f0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c4f8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (value), e (value)
function fn_14c5c0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c5c8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_147238(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	fn_1478b8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_1478b8(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	custom_panic(a, b, c, d, e)
	abort()
}
