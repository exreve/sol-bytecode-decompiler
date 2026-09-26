// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction initialize_config: handler + 18 reachable functions
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
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function AccountInfo_clone(a: u64, b: u64): void // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function fn_122e8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
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
declare function AccountInfo_try_data_len(a: u64, b: u64): void // lib solana_account_info::AccountInfo::try_data_len
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_1459d0(a: u64): u64 // lib uses repr_bitpacked_kind_from_prim_145358, callx
declare function fn_14ecd0(a: u64, b: u64, c: u64): u64 // lib "0001020304050607080910111213141516171819…", "0001020304050607080910111213141516171819…"
declare function fn_14f3e8(a: u64): u64 // lib
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function __floatundidf(a: u64): u64 // lib __floatundidf
declare function fn_14f808(a: u64, b: u64): u64 // lib uses __multi3
declare function fn_151a40(a: u64, b: u64): u64 // lib
declare function fn_151cb0(a: u64, b: u64): u64 // lib

// instruction handler: initialize_config (discriminator sha256("global:initialize_config")[..8] = 0x46c4bec201157fd0)
// accounts [str: the program's account-error strings, in order of first use]: funder, config, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: config
function ix_initialize_config(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s18 = fp - 0x18, s88 = fp - 0x88, sa0 = fp - 0xa0, sc9 = fp - 0xc9, se9 = fp - 0xe9, s108 = fp - 0x108, s109 = fp - 0x109, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170
	let l, o, p, q, s, t: u64
	let g = a
	sol_log("Instruction: InitializeConfig", 0x1d)
	const f = ix_args_len
	if (0x20 > f) {
		l = fn_1459d0(0x100159468)
	} else {
		const ab = g
		const h = ix_args
		const i = ld64(h + 6)
		st8(sa0 + 8, ld8(h + 0xe))
		st64(sa0, i)
		if ((f & -0x20) != 0x20) {
			const v = ld64(sa0 + 1)
			const j = ld64(h + 0x26)
			st8(sa0 + 8, ld8(h + 0x2e))
			st64(sa0, j)
			if ((f & -0x20) != 0x40) {
				const u = ld64(sa0 + 1)
				const k = ld64(h + 0x46)
				st8(sa0 + 8, ld8(h + 0x4e))
				st64(sa0, k)
				if ((f & -2) != 0x60) {
					const z = ld64(sa0 + 1)
					const x = ld32(h + 2)
					const y = ld16(h)
					const aa = ld16(h + 0x60)
					st8(s18 + 0x10, ld8(h + 0x1f))
					copyr(s18, h + 0xf, 0x10)
					st16(s88 + 0x6c, ld16(h + 0x24))
					st32(s88 + 0x68, ld32(h + 0x20))
					st64(s130, accounts, accounts_len)
					t = accounts_initialize_config(sa0, program_id, s130, j, fp)
					const w = ld64(sa0)
					if (w == 0) {
						s = ld64(sa0 + 8)
						st64(ab + 8, ld64(sa0 + 0x10))
						st64(ab, s)
						return t
					}
					memcpy(s108, s88, 0x68)
					st64(s120 + 0xf, v)
					st8(s120 + 0xe, i)
					st32(s120 + 0xa, x)
					st16(s120 + 8, y)
					st64(s120, w)
					st64(s108 + 0x17, u)
					st8(s108 + 0x16, j)
					st16(s108 + 0x14, ld16(s88 + 0x6c))
					st8(s108 + 0xf, ld8(s18 + 0x10))
					copyr(s109, s18, 0x10)
					st32(s108 + 0x10, ld32(s88 + 0x68))
					st8(se9 + 0x10, ld8(h + 0x3f))
					copyr(se9, h + 0x2f, 0x10)
					st32(se9 + 0x11, ld32(h + 0x40))
					st16(se9 + 0x15, ld16(h + 0x44))
					st64(se9 + 0x18, z)
					st8(se9 + 0x17, k)
					copy(sc9, h + 0x4f, 0x10)
					st8(sc9 + 0x10, ld8(h + 0x5f))
					if (aa > 0x9c4 /* anchor::RequireViolated */) {
						t = fn_87630(s140, 0x1d)
						s = ld64(s140)
						g = ab
						if (s != 2) {
							st64(g + 8, ld64(s140 + 8))
							st64(g, s)
							return t
						}
					} else {
						st16(sc9 + 0x11, aa)
						g = ab
					}
					st16(sc9 + 0x13, 0)
					t = fn_8228(s150, s120, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
					const r = ld64(s150)
					if (r != 2) {
						t = Error_with_account_name(s160, r, ld64(s150 + 8), 0x100154883 /* "config" */, 6)
						s = ld64(s160)
						st64(g + 8, ld64(s160 + 8))
						st64(g, s)
						return t
					}
					st64(g + 8, r)
					st64(g, 2)
					return t
				}
			}
		}
		l = fn_1459d0(0x100159468)
		g = ab
	}
	const m = l
	if (2 > (l & 3) - 2) {
		t = anchor_error_from(s170, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		s = ld64(s170)
		st64(g + 8, ld64(s170 + 8))
		st64(g, s)
		return t
	}
	if ((m & 3) == 0) {
		t = anchor_error_from(s170, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		s = ld64(s170)
		st64(g + 8, ld64(s170 + 8))
		st64(g, s)
		return t
	}
	const n = ld64(ld64(l + 7))
	callx(n, ld64(l - 1), n)
	t = anchor_error_from(s170, 0x66 /* anchor::InstructionDidNotDeserialize */)
	s = ld64(s170)
	st64(g + 8, ld64(s170 + 8))
	st64(g, s)
	return t
}

// Anchor Accounts::try_accounts of instruction initialize_config (called by ix_initialize_config; name [str]: from the handler's "Instruction: …" log; was fn_95cf8)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), d (value)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: funder (ConstraintRaw, ConstraintMut), config (ConstraintMut, ConstraintSigner, ConstraintRentExempt), system_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: config, funder
function accounts_initialize_config(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s18 = fp - 0x18, s48 = fp - 0x48, sa0 = fp - 0xa0, sf8 = fp - 0xf8, s108 = fp - 0x108, s110 = fp - 0x110, s128 = fp - 0x128, s140 = fp - 0x140, s148 = fp - 0x148, s150 = fp - 0x150, s158 = fp - 0x158, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s268 = fp - 0x268, s270 = fp - 0x270
	let l, m: u64
	st64(s160, b)
	const f = ld64(c + 8)
	if (f != 0) {
		const g: AccountInfo = ld64(c)
		st64(s158, g)
		st64(c + 8, f - 1)
		st64(c, g + 0x30)
		try_accounts_11718(s110, c, c, d, e)
		const i = ld64(s108)
		const h = ld64(s110)
		if (h != 2) {
			m = Error_with_account_name(s170, h, i, "funder", 6)
			l = ld64(s170)
			st64(a + 0x10, ld64(s170 + 8))
			st64(a + 8, l)
			st64(a, 0)
			return m
		}
		st64(s150, i)
		fn_122e8(s110, c, i)
		const k = ld64(s108)
		const j = ld64(s110)
		if (j == 2) {
			st64(s148, k)
			rent_get(s110)
			copy(s128, s108, 0x18)
			if (ld64(s110) == 0) {
				copyr(s140, s128, 0x18)
				st64(s48, s158, s140, s150, s148, s160)
				m = fn_967c8(s110, s48)
				const o = ld64(s108 + 8)
				const p = ld64(s108)
				const config: AccountInfo = ld64(s110)
				if (config == 0) {
					st64(a + 0x10, o)
					st64(a + 8, p)
					st64(a, 0)
					return m
				}
				memcpy(sa0, sf8, 0x58)
				if (config.is_writable == 0) {
					anchor_error_from(s230, 0x7d0 /* anchor::ConstraintMut */)
					m = Error_with_account_name(s240, ld64(s230), ld64(s230 + 8), 0x100154883 /* "config" */, 6)
					l = ld64(s240)
					st64(a + 0x10, ld64(s240 + 8))
					st64(a + 8, l)
					st64(a, 0)
					return m
				}
				if (config.is_signer != 0) {
					st64(s260, o, p)
					AccountInfo_clone(s48, config)
					const q = fn_143100(s48)
					AccountInfo_clone(s110, config)
					AccountInfo_try_data_len(s18, s110)
					const s = ld64(s18 + 8)
					const r = ld64(s18)
					if (r != 0x800000000000001a /* Ok */) {
						st64(s18 + 0x10, ld64(s18 + 0x10))
						st64(s18, r, s)
						m = fn_13b430(s1a0, s18)
						const ag = ld64(s1a0)
						st64(a + 0x10, ld64(s1a0 + 8))
						st64(a + 8, ag)
						st64(a, 0)
						const ai = ld64(s108 + 8)
						const ah = ld64(s108)
						rc_dec(ah)
						rc_dec(ai)
						const ak = ld64(s48 + 0x10)
						const aj = ld64(s48 + 8)
						rc_dec(aj)
						if (!rc_release(ak)) {
							return m
						}
						st64(ak + 8, ld64(ak + 8) - 1)
						return m
					}
					st64(s268, q)
					const t = __floatundidf(ld64(s140) * (s + 0x80))
					const u = fn_14f7f8(ld64(s140 + 8), t)
					st64(s270, 0)
					const v = fn_151cb0(u, 0)
					const w = fn_14f3e8(u)
					if ((v as i64) >= 0) {
						st64(s270, w)
					}
					const x = fn_151a40(u, 0x43efffffffffffff)
					let af = -1
					if (0 >= (x as i64)) {
						af = ld64(s270)
					}
					const z = ld64(s108 + 8)
					const y = ld64(s108)
					const ae = ld64(s268)
					rc_dec(y)
					rc_dec(z)
					const ac = ld64(s48 + 0x10)
					const aa = ld64(s48 + 8)
					let ab = ld64(aa) - 1
					st64(aa, ab)
					if (ab == 0) {
						ab = ld64(aa + 8) - 1
						st64(aa + 8, ab)
					}
					let ad = ld64(ac) - 1
					st64(ac, ad)
					if (ad == 0) {
						ad = ld64(ac + 8) - 1
						st64(ac + 8, ad)
					}
					if (af > ae) {
						anchor_error_from(s1f0, 0x7d5 /* anchor::ConstraintRentExempt */, ad, ab, ae)
						m = Error_with_account_name(s200, ld64(s1f0), ld64(s1f0 + 8), 0x100154883 /* "config" */, 6)
						l = ld64(s200)
						st64(a + 0x10, ld64(s200 + 8))
						st64(a + 8, l)
						st64(a, 0)
						return m
					}
					const funder: AccountInfo = ld64(s150)
					if (funder.is_writable != 0) {
						if (fn_30dd0(funder.key) != 0) {
							const am = ld64(s148)
							m = memcpy(a + 0x18, sa0, 0x58)
							st64(a + 0x78, am)
							st64(a + 0x70, funder)
							st64(a + 0x10, ld64(s260))
							st64(a + 8, ld64(s260 + 8))
							st64(a, config)
							return m
						}
						anchor_error_from(s1b0, 0x7d3 /* anchor::ConstraintRaw */)
						m = Error_with_account_name(s1c0, ld64(s1b0), ld64(s1b0 + 8), "funder", 6)
						l = ld64(s1c0)
						st64(a + 0x10, ld64(s1c0 + 8))
						st64(a + 8, l)
						st64(a, 0)
						return m
					}
					anchor_error_from(s1d0, 0x7d0 /* anchor::ConstraintMut */, ad, ab, ae)
					m = Error_with_account_name(s1e0, ld64(s1d0), ld64(s1d0 + 8), "funder", 6)
					l = ld64(s1e0)
					st64(a + 0x10, ld64(s1e0 + 8))
					st64(a + 8, l)
					st64(a, 0)
					return m
				}
				anchor_error_from(s210, 0x7d2 /* anchor::ConstraintSigner */)
				m = Error_with_account_name(s220, ld64(s210), ld64(s210 + 8), 0x100154883 /* "config" */, 6)
				l = ld64(s220)
				st64(a + 0x10, ld64(s220 + 8))
				st64(a + 8, l)
				st64(a, 0)
				return m
			}
			m = fn_13b430(s190, s128)
			l = ld64(s190)
			st64(a + 0x10, ld64(s190 + 8))
			st64(a + 8, l)
			st64(a, 0)
			return m
		}
		m = Error_with_account_name(s180, j, k, "system_program", 0xe)
		l = ld64(s180)
		st64(a + 0x10, ld64(s180 + 8))
		st64(a + 8, l)
		st64(a, 0)
		return m
	}
	m = anchor_error_from(s250, 0xbbd /* anchor::AccountNotEnoughKeys */, c, d, e)
	l = ld64(s250)
	st64(a + 0x10, ld64(s250 + 8))
	st64(a + 8, l)
	st64(a, 0)
	return m
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_8228(a: u64, b: u64, c: u64, d: u64): u64 {
	const s2 = fp - 0x2, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40
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
		g = fn_13ae08(s20, 0x100151e98, 8)
		if (g == 0) {
			g = fn_13ae08(s20, b + 8, 0x20)
			if (g == 0) {
				g = fn_13ae08(s20, b + 0x28, 0x20)
				if (g == 0) {
					g = fn_13ae08(s20, b + 0x48, 0x20)
					if (g == 0) {
						st16(s2, ld16(b + 0x68))
						g = fn_13ae08(s20, s2, 2)
						if (g == 0) {
							st16(s2, ld16(b + 0x6a))
							g = fn_13ae08(s20, s2, 2)
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

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: config
function fn_967c8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s58 = fp - 0x58, s68 = fp - 0x68, s90 = fp - 0x90, sd0 = fp - 0xd0, sf0 = fp - 0xf0, s110 = fp - 0x110, s128 = fp - 0x128, s138 = fp - 0x138, s150 = fp - 0x150, s168 = fp - 0x168, s170 = fp - 0x170, s190 = fp - 0x190, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, s1c0 = fp - 0x1c0, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s268 = fp - 0x268, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2e0 = fp - 0x2e0, s2e8 = fp - 0x2e8
	let av, cz, dc, dd: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s268 + 0x10, f)
	if (g != 0) {
		const p = ld64(ld64(b + 0x10))
		st64(s298 + 0x18, p)
		const q = ld64(p)
		copyr(s38, q + 8, 0x18)
		st64(s298 + 0x20, q)
		st64(s40, ld64(q))
		const r = ld64(f)
		copyr(s1d8, r + 8, 0x18)
		st64(s298 + 0x28, r)
		st64(s1e0, ld64(r))
		if ((memcmp(s40, s1e0, 0x20) as u32) == 0) {
			ErrorCode_name(s128, 0x100152d40)
			st64(s58, 0, 1, 0)
			st64(s20, s58, 0x100159480)
			st8(s20 + 0x18, 3)
			st64(s20 + 0x10, 0x20)
			st64(s38 + 8, 0)
			st64(s40, 0)
			if (ErrorCode_fmt(0x100152d40, s40) == 0) {
				copyr(s1a8, s58, 0x18)
				copy(s1c0, s128, 0x18)
				st64(s1d8, 0x10015484b)
				st32(s150 + 8, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s190, 2)
				st32(s1d8 + 0x10, 6)
				st64(s1d8 + 8, 0x38)
				st64(s1e0, 0)
				const ba = fn_13b3a8(s220, s1e0)
				const az = ld64(s220 + 8)
				const ay = ld64(s220)
				const aw = ld64(s298 + 0x20)
				copyr(s1e0, aw, 0x20)
				const ax = ld64(s298 + 0x28)
				copy(s1c0, ax, 0x20)
				dd = fn_13b5c0(s230, ay, az, s1e0, ba)
				const bb = ld64(s230)
				st64(a + 0x10, ld64(s230 + 8))
				st64(a + 8, bb)
				st64(a, 0)
				return dd
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s1e0, 0x1001594b0, 0x1001594d0)
		}
		st64(s268, a, b)
		const s = ld64(b + 8)
		const t = __floatundidf(ld64(s) * 0xec)
		const u = fn_14f7f8(ld64(s + 8), t)
		const v = fn_151cb0(u, 0)
		const w = fn_14f3e8(u)
		const x = max((fn_151a40(u, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (v as i64) ? 0 : w, 1)
		if (x > g) {
			const bd: AccountInfo = ld64(s268 + 0x10)
			const bj = ld64(s268 + 8)
			const y: AccountInfo = ld64(s298 + 0x18)
			const z: LamportsCell = y.lamports
			rc_inc(z)
			const bc: DataCell = y.data
			rc_inc(bc)
			const be: LamportsCell = bd.lamports
			const bf = be.strong
			st64(s2a0, bd.key)
			st64(s298, y.executable)
			st64(s298 + 8, y.is_writable)
			st64(s298 + 0x10, y.is_signer)
			st64(s298 + 0x28, y.rent_epoch)
			const bi = y.owner
			rc_inc(be, bf)
			const bg: DataCell = bd.data
			const bh = bg.strong
			st64(s298 + 0x18, bi)
			rc_inc(bg, bh)
			const bk: AccountInfo = ld64(ld64(bj + 0x18))
			const bl: LamportsCell = bk.lamports
			const bm = bl.strong
			st64(s2e0 + 0x38, sat_sub(x, g))
			st64(s2e0 + 0x10, bd.executable)
			st64(s2e0 + 0x18, bd.is_writable)
			st64(s2e0 + 0x20, bd.is_signer)
			st64(s2e0 + 0x28, bd.rent_epoch)
			st64(s2e0 + 0x30, bd.owner)
			const bp = bk.key
			rc_inc(bl, bm)
			const bn: DataCell = bk.data
			const bo = bn.strong
			st64(s2e0, z, bp)
			rc_inc(bn, bo)
			st64(s2e8, bk.owner)
			const bt = bk.rent_epoch
			const bs = bk.is_signer
			const br = bk.is_writable
			const bq = bk.executable
			st8(s90 + 0x22, ld64(s2e0 + 0x10))
			st8(s90 + 0x21, ld64(s2e0 + 0x18))
			st8(s90 + 0x20, ld64(s2e0 + 0x20))
			st64(s90 + 0x18, ld64(s2e0 + 0x28))
			st64(s90 + 0x10, ld64(s2e0 + 0x30))
			st64(s90, be, bg)
			st64(sd0 + 0x38, ld64(s2a0))
			st8(sd0 + 0x32, ld64(s298))
			st8(sd0 + 0x31, ld64(s298 + 8))
			st8(sd0 + 0x30, ld64(s298 + 0x10))
			st64(sd0 + 0x28, ld64(s298 + 0x28))
			st64(sd0 + 0x20, ld64(s298 + 0x18))
			st64(sd0 + 0x18, bc)
			st64(sd0 + 0x10, ld64(s2e0))
			st64(sd0 + 8, ld64(s298 + 0x20))
			st8(sd0, bs, br, bq)
			st64(sf0 + 0x18, bt)
			st64(sf0 + 0x10, ld64(s2e8))
			st64(sf0, bl, bn)
			st64(s110 + 0x18, ld64(s2e0 + 8))
			st64(s68, 8, 0)
			st64(s110, 0, 8, 0)
			dd = fn_13d318(s1f0, s110, ld64(s2e0 + 0x38))
			av = ld64(s1f0)
			if (av != 2) {
				dc = ld64(s1f0 + 8)
				cz = ld64(s268)
				st64(cz + 8, av, dc)
				st64(cz, 0)
				return dd
			}
			st64(s298 + 0x28, ld64(ld64(s268 + 0x10)))
		}
		const bu = ld64(ld64(s268 + 0x10) + 8)
		rc_inc(bu)
		const bv = ld64(ld64(s268 + 0x10) + 0x10)
		rc_inc(bv)
		const bw: AccountInfo = ld64(ld64(ld64(s268 + 8) + 0x18))
		const bx: LamportsCell = bw.lamports
		const by = bx.strong
		const bz: AccountInfo = ld64(s268 + 0x10)
		st64(s298 + 0x10, bz.executable)
		st64(s298 + 0x18, bz.is_writable)
		st64(s298 + 0x20, bz.is_signer)
		const cd = bz.rent_epoch
		const ci = bz.owner
		const cc = bw.key
		rc_inc(bx, by)
		st64(s298 + 8, bv)
		const ca: DataCell = bw.data
		const cb = ca.strong
		st64(s2a0, cd, bu)
		rc_inc(ca, cb)
		const ch = bw.owner
		const cg = bw.rent_epoch
		const cf = bw.is_signer
		const ce = bw.is_writable
		st8(s170 + 2, bw.executable)
		st8(s170, cf, ce)
		st64(s198, cc, bx, ca, ch, cg)
		st8(s1a0 + 2, ld64(s298 + 0x10))
		st8(s1a0 + 1, ld64(s298 + 0x18))
		st8(s1a0, ld64(s298 + 0x20))
		st64(s1a8, ld64(s2a0))
		st64(s1c0 + 0x10, ci)
		copyr(s1c0, s298, 0x10)
		st64(s1d8 + 0x10, ld64(s298 + 0x28))
		st64(s168, 8, 0)
		st64(s1e0, 0, 8, 0)
		dd = fn_13c8b8(s200, s1e0, 0x6c)
		let da = ld64(s200 + 8)
		let cj = ld64(s200)
		if (cj != 2) {
			cz = ld64(s268)
			st64(cz + 8, cj, da)
			st64(cz, 0)
			return dd
		}
		const ck: AccountInfo = ld64(s268 + 0x10)
		const cl: LamportsCell = ck.lamports
		const cs = ck.key
		rc_inc(cl)
		const cm: DataCell = ck.data
		rc_inc(cm)
		const cn: LamportsCell = bw.lamports
		const co = cn.strong
		st64(s298 + 0x10, bw.key)
		st64(s298 + 0x18, ck.executable)
		st64(s298 + 0x20, ck.is_writable)
		st64(s298 + 0x28, ck.is_signer)
		const cp = ck.rent_epoch
		const cx = ck.owner
		rc_inc(cn, co)
		st64(s298, cp)
		const cq: DataCell = bw.data
		const cr = cq.strong
		st64(s298 + 8, cs)
		rc_inc(cq, cr)
		const cw = bw.owner
		const cv = bw.rent_epoch
		const cu = bw.is_signer
		const ct = bw.is_writable
		st8(s170 + 2, bw.executable)
		st8(s170, cu, ct)
		st64(s190, cn, cq, cw, cv)
		st64(s198, ld64(s298 + 0x10))
		st8(s1a0 + 2, ld64(s298 + 0x18))
		st8(s1a0 + 1, ld64(s298 + 0x20))
		st8(s1a0, ld64(s298 + 0x28))
		st64(s1a8, ld64(s298))
		st64(s1c0, cl, cm, cx)
		st64(s1d8 + 0x10, ld64(s298 + 8))
		st64(s168, 8, 0)
		st64(s1e0, 0, 8, 0)
		dd = fn_13cc48(s210, s1e0, ld64(ld64(ld64(s268 + 8) + 0x20)))
		da = ld64(s210 + 8)
		cj = ld64(s210)
		if (cj != 2) {
			cz = ld64(s268)
			st64(cz + 8, cj, da)
			st64(cz, 0)
			return dd
		}
	} else {
		st64(s268 + 8, b)
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0xec)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const af = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		st64(s268, a)
		const m = ld64(s268 + 8)
		const n: AccountInfo = ld64(ld64(m + 0x10))
		const o: LamportsCell = n.lamports
		const aj = n.key
		const ab: AccountInfo = ld64(s268 + 0x10)
		rc_inc(o)
		const aa: DataCell = n.data
		rc_inc(aa)
		const ac: LamportsCell = ab.lamports
		st64(s298 + 0x28, ac)
		const ad = ac.strong
		st64(s2a0, ab.key)
		st64(s298, n.executable)
		st64(s298 + 8, n.is_writable)
		st64(s298 + 0x10, n.is_signer)
		st64(s298 + 0x18, n.rent_epoch)
		st64(s298 + 0x20, n.owner)
		rc_inc(ld64(s298 + 0x28), ad)
		const ae: DataCell = ab.data
		rc_inc(ae)
		st64(s2e0 + 0x28, aa)
		st64(s2e0 + 0x38, af)
		const ag: AccountInfo = ld64(ld64(m + 0x18))
		const ah: LamportsCell = ag.lamports
		const ai = ah.strong
		st64(s2e0 + 0x30, aj)
		st64(s2e0 + 0x18, ab.executable)
		st64(s2e0 + 0x20, ab.is_writable)
		const ap = ab.is_signer
		const ak = ab.rent_epoch
		const al = ab.owner
		const ao = ag.key
		rc_inc(ah, ai)
		st64(s2e0, al, ak)
		const am: DataCell = ag.data
		const an = am.strong
		st64(s2e0 + 0x10, ao)
		rc_inc(am, an)
		st64(s2e8, ag.owner)
		const au = ag.rent_epoch
		const at = ag.is_signer
		const ar = ag.is_writable
		const aq = ag.executable
		st8(s150 + 0x12, ld64(s2e0 + 0x18))
		st8(s150 + 0x11, ld64(s2e0 + 0x20))
		st8(s150 + 0x10, ap)
		copyr(s150, s2e0, 0x10)
		st64(s168 + 0x10, ae)
		st64(s168 + 8, ld64(s298 + 0x28))
		st64(s168, ld64(s2a0))
		st8(s170 + 2, ld64(s298))
		st8(s170 + 1, ld64(s298 + 8))
		st8(s170, ld64(s298 + 0x10))
		st64(s190 + 0x18, ld64(s298 + 0x18))
		st64(s190 + 0x10, ld64(s298 + 0x20))
		st64(s190 + 8, ld64(s2e0 + 0x28))
		st64(s190, o)
		st64(s198, ld64(s2e0 + 0x30))
		st8(s1a0, at, ar, aq)
		st64(s1a8, au)
		st64(s1c0 + 0x10, ld64(s2e8))
		st64(s1c0, ah, am)
		st64(s1d8 + 0x10, ld64(s2e0 + 0x10))
		st64(s138, 8, 0)
		st64(s1e0, 0, 8, 0)
		dd = fn_13cfd8(s240, s1e0, ld64(s2e0 + 0x38), 0x6c, ld64(ld64(ld64(s268 + 8) + 0x20)))
		av = ld64(s240)
		if (av != 2) {
			dc = ld64(s240 + 8)
			cz = ld64(s268)
			st64(cz + 8, av, dc)
			st64(cz, 0)
			return dd
		}
	}
	fn_4600(s1e0, ld64(s268 + 0x10))
	const cy = ld64(s268)
	if (ld64(s1e0) == 0) {
		dd = Error_with_account_name(s250, ld64(s1d8), ld64(s1d8 + 8), 0x100154883 /* "config" */, 6)
		const db = ld64(s250)
		st64(cy + 0x10, ld64(s250 + 8))
		st64(cy + 8, db)
		st64(cy, 0)
		return dd
	}
	return memcpy(cy, s1e0, 0x70)
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

function fn_30dd0(a: u64): u64 {
	if ((memcmp(a, 0x100152d90 /* key GwH3Hiv5mACLX3ufTw1pFsrhSPon5tdw252DBs4Rx4PV */, 0x20) as u32) == 0) {
		return 1
	}
	return (memcmp(a, 0x100152db0 /* key AqiJTdr9jLPDAk5prGhWFHtSM1qJszAsdZVV7oeinxhh */, 0x20) as u32) == 0
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

function fn_4600(a: u64, b: u64) {
	const s48 = fp - 0x48, s50 = fp - 0x50, s68 = fp - 0x68, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108
	let p: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0) {
		anchor_error_from(s108, 0xbc4 /* anchor::AccountNotInitialized */)
		p = ld64(s108)
		st64(a + 0x10, ld64(s108 + 8))
		st64(a + 8, p)
		st64(a, 0)
		return
	}
	const g = memcmp(f, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s68, b, g as u32)
		const o = ld64(s68 + 0x10)
		const l = ld64(s68 + 8)
		const k = ld64(s68)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(sc8 + 8, ld64(l + 8))
			st64(sc8, m)
			fn_102650(s68, sc8, 0x800000000000001a /* Ok */)
			if (ld16(s68) == 0) {
				st16(a + 0xc, ld16(s68 + 6))
				st32(a + 8, ld32(s68 + 2))
				const r = ld64(s68 + 8)
				const q = ld64(s68 + 0x10)
				memcpy(sb8, s50, 0x4e)
				memcpy(a + 0x1e, sb8, 0x4e)
				st64(a + 0x16, q)
				st64(a + 0xe, r)
				st64(a, b)
				st64(o, ld64(o) - 1)
			} else {
				const n = ld64(s68 + 8)
				st64(a + 0x10, ld64(s68 + 0x10))
				st64(a + 8, n)
				st64(a, 0)
				st64(o, ld64(o) - 1)
			}
		} else {
			st64(s68, k, l, o)
			fn_13b430(sf8, s68)
			p = ld64(sf8)
			st64(a + 0x10, ld64(sf8 + 8))
			st64(a + 8, p)
			st64(a, 0)
		}
	} else {
		const j = anchor_error_from(sd8, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const i = ld64(sd8 + 8)
		const h = ld64(sd8)
		copyr(s68, f, 0x20)
		st64(s48, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		fn_13b5c0(se8, h, i, s68, j)
		p = ld64(se8)
		st64(a + 0x10, ld64(se8 + 8))
		st64(a + 8, p)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_149478(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	const s20 = fp - 0x20, s28 = fp - 0x28
	st64(s20, 0x10015b8e0, a, b)
	st16(s20 + 0x18, 1)
	st64(s28, 1)
	fn_147238(s28, b, c, d, e)
}

function fn_102650(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38
	const f = ld64(b + 8)
	if (7 >= f) {
		fn_14c4f0(8, f, 0x10015a810, d, e)
	}
	if (f - 8 >= 0x20) {
		const g = ld64(b)
		const h = ld64(g + 0xe)
		st8(s20 + 8, ld8(g + 0x16))
		st64(s20, h)
		if (f - 0x28 >= 0x20) {
			const k = ld64(s20 + 1)
			const i = ld64(g + 0x2e)
			st8(s20 + 8, ld8(g + 0x36))
			st64(s20, i)
			if (f - 0x48 >= 0x20) {
				const s = ld64(s20 + 1)
				const j = ld64(g + 0x4e)
				st8(s20 + 8, ld8(g + 0x56))
				st64(s20, j)
				if ((f & -2) != 0x68 && (f & -2) != 0x6a) {
					const p = ld64(s20 + 1)
					const r = ld16(g + 0x6a)
					const q = ld16(g + 0x68)
					st16(s20 + 0x1c, ld16(g + 0xc))
					st32(s20 + 0x18, ld32(g + 8))
					st8(s20 + 0x10, ld8(g + 0x27))
					copyr(s20, g + 0x17, 0x10)
					st16(s38 + 0x14, ld16(g + 0x2c))
					st32(s38 + 0x10, ld32(g + 0x28))
					st8(a + 0x41, ld8(g + 0x47))
					st64(a + 0x39, ld64(g + 0x3f))
					st64(a + 0x31, ld64(g + 0x37))
					st16(a + 0x46, ld16(g + 0x4c))
					st32(a + 0x42, ld32(g + 0x48))
					copy(a + 0x51, g + 0x57, 0x10)
					st8(a + 0x61, ld8(g + 0x67))
					st32(a + 2, ld32(s20 + 0x18))
					st16(a + 6, ld16(s20 + 0x1c))
					st64(a + 9, k)
					st8(a + 8, h)
					st8(a + 0x21, ld8(s20 + 0x10))
					st64(a + 0x19, ld64(s20 + 8))
					st64(a + 0x11, ld64(s20))
					st32(a + 0x22, ld32(s38 + 0x10))
					st16(a + 0x26, ld16(s38 + 0x14))
					st64(a + 0x29, s)
					st64(a + 0x49, p)
					st8(a + 0x48, j)
					st8(a + 0x28, i)
					st16(a + 0x62, q, r)
					st16(a, 0)
					return
				}
			}
		}
	}
	const l = fn_1459d0(0x100159468)
	anchor_error_from(s38, 0xbbb /* anchor::AccountDidNotDeserialize */)
	const n = ld64(s38 + 8)
	const o = ld64(s38)
	if (2 > (l & 3) - 2) {
		st64(a + 0x10, n)
		st64(a + 8, o)
		st16(a, 1)
	} else if ((l & 3) == 0) {
		st64(a + 0x10, n)
		st64(a + 8, o)
		st16(a, 1)
	} else {
		const m = ld64(ld64(l + 7))
		callx(m, ld64(l - 1), m)
		st64(a + 0x10, n)
		st64(a + 8, o)
		st16(a, 1)
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_147238(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	fn_1478b8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_14c4f0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c4f8(a, b, c, d, e)
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

function fn_14f060(a: u64, b: u64): u64 {
	return fn_14ecd0(ld64(a), 1, b)
}
