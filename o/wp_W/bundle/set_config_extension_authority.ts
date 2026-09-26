// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction set_config_extension_authority: handler + 4 reachable functions
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
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11de0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_120c0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp

// instruction handler: set_config_extension_authority (discriminator sha256("global:set_config_extension_authority")[..8] = 0x8f3cbc1874f15e2c)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, whirlpools_config_extension, new_config_extension_authority, config_extension_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config_extension
function ix_set_config_extension_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s68 = fp - 0x68, s80 = fp - 0x80, sc8 = fp - 0xc8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130
	sol_log("Instruction: SetConfigExtensionAuthority", 0x28)
	st64(s110, accounts, accounts_len)
	let n = accounts_set_config_extension_authority(s80, undef, s110, undef, fp)
	const g = ld64(s80 + 0x10)
	let h = ld64(s80 + 8)
	const f = ld64(s80)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return n
	}
	memcpy(se8, s68, 0x68)
	st64(s100, f, h, g)
	const i = ld64(ld64(sc8 + 0x40))
	const l = ld64(i + 8)
	const k = ld64(i + 0x10)
	const j = ld64(i + 0x18)
	st64(se8 + 0x18, ld64(i))
	st64(sc8, l, k, j)
	n = fn_7598(s120, sf8, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
	const m = ld64(s120)
	if (m != 2) {
		n = Error_with_account_name(s130, m, ld64(s120 + 8), "whirlpools_config_extension", 0x1b)
		h = ld64(s130)
		st64(a + 8, ld64(s130 + 8))
		st64(a, h)
		return n
	}
	st64(a + 8, g)
	st64(a, 2)
	return n
}

// Anchor Accounts::try_accounts of instruction set_config_extension_authority (called by ix_set_config_extension_authority; name [str]: from the handler's "Instruction: …" log; was fn_f3338)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, whirlpools_config_extension (ConstraintMut, ConstraintHasOne), new_config_extension_authority (AccountNotEnoughKeys), config_extension_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpools_config_extension, config_extension_authority
function accounts_set_config_extension_authority(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s50 = fp - 0x50, s58 = fp - 0x58, s70 = fp - 0x70, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sf0 = fp - 0xf0, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8
	let m, o, y, z: u64
	try_accounts_11de0(s70, c, c, d, e)
	if (ld64(s70) == 0) {
		z = Error_with_account_name(s1d0, ld64(s70 + 8), ld64(s70 + 0x10), "whirlpools_config", 0x11)
		y = ld64(s1d0)
		st64(a + 0x10, ld64(s1d0 + 8))
		st64(a + 8, y)
		st64(a, 0)
		return z
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x70) & -8 : 0x300007f90
	if (g > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, s70, 0x70)
		try_accounts_120c0(s70, c)
		const j = ld64(s70 + 0x10)
		const i = ld64(s70 + 8)
		const whirlpools_config_extension: AccountInfo = ld64(s70)
		if (whirlpools_config_extension == 0) {
			z = Error_with_account_name(s1c0, i, j, "whirlpools_config_extension", 0x1b)
			y = ld64(s1c0)
			st64(a + 0x10, ld64(s1c0 + 8))
			st64(a + 8, y)
			st64(a, 0)
			return z
		}
		st64(s1e0, i, j)
		memcpy(s100, s58, 0x50)
		try_accounts_11718(s70, c)
		const config_extension_authority: AccountInfo = ld64(s70 + 8)
		const k = ld64(s70)
		if (k == 2) {
			const l = ld64(c + 8)
			if (l == 0) {
				anchor_error_from(s120, 0xbbd /* anchor::AccountNotEnoughKeys */, config_extension_authority, undef, o)
				m = ld64(s120 + 8)
				const p = ld64(s120)
				if (p != 2) {
					z = Error_with_account_name(s130, p, m, "new_config_extension_authority", 0x1e)
					y = ld64(s130)
					st64(a + 0x10, ld64(s130 + 8))
					st64(a + 8, y)
					st64(a, 0)
					return z
				}
			} else {
				st64(c + 8, l - 1)
				m = ld64(c)
				st64(c, m + 0x30)
			}
			if (whirlpools_config_extension.is_writable == 0) {
				anchor_error_from(s1a0, 0x7d0 /* anchor::ConstraintMut */, config_extension_authority, m, o)
				z = Error_with_account_name(s1b0, ld64(s1a0), ld64(s1a0 + 8), "whirlpools_config_extension", 0x1b)
				y = ld64(s1b0)
				st64(a + 0x10, ld64(s1b0 + 8))
				st64(a + 8, y)
				st64(a, 0)
				return z
			}
			st64(s1e8, m)
			copyr(sb0, s1e0, 0x10)
			copy(sa0, s100, 0x10)
			const q = ld64(ld64(g))
			copyr(s90, q, 0x20)
			if ((memcmp(sb0, s90, 0x20) as u32) != 0) {
				anchor_error_from(s140, 0x7d1 /* anchor::ConstraintHasOne */)
				const x = Error_with_account_name(s150, ld64(s140), ld64(s140 + 8), "whirlpools_config_extension", 0x1b)
				const w = ld64(s150 + 8)
				const v = ld64(s150)
				copy(s70, sb0, 0x40)
				z = fn_13b5c0(s160, v, w, s70, x)
				y = ld64(s160)
				st64(a + 0x10, ld64(s160 + 8))
				st64(a + 8, y)
				st64(a, 0)
				return z
			}
			const r = config_extension_authority.key
			copyr(sb0, r, 0x20)
			copyr(s90, sf0, 0x20)
			if ((memcmp(sb0, s90, 0x20) as u32) == 0) {
				z = memcpy(a + 0x20, s100, 0x50)
				st64(a + 0x78, ld64(s1e8))
				st64(a + 0x70, config_extension_authority)
				st64(a + 0x18, ld64(s1e0 + 8))
				st64(a + 0x10, ld64(s1e0))
				st64(a + 8, whirlpools_config_extension)
				st64(a, g)
				return z
			}
			anchor_error_from(s170, 0x7dc /* anchor::ConstraintAddress */)
			const u = Error_with_account_name(s180, ld64(s170), ld64(s170 + 8), "config_extension_authority", 0x1a)
			const t = ld64(s180 + 8)
			const s = ld64(s180)
			copyr(s70, sb0, 0x20)
			copy(s50, sf0, 0x20)
			z = fn_13b5c0(s190, s, t, s70, u)
			y = ld64(s190)
			st64(a + 0x10, ld64(s190 + 8))
			st64(a + 8, y)
			st64(a, 0)
			return z
		}
		z = Error_with_account_name(s110, k, config_extension_authority, "config_extension_authority", 0x1a)
		y = ld64(s110)
		st64(a + 0x10, ld64(s110 + 8))
		st64(a + 8, y)
		st64(a, 0)
		return z
	}
	alloc_handle_alloc_error(8, 0x70)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

function fn_7598(a: u64, b: u64, c: u64, d: u64): u64 {
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
	B14: {
		const k = ld64(j)
		st64(s18 + 8, ld64(j + 8))
		st64(s18, k)
		st64(s18 + 0x10, 0)
		g = fn_13ae08(s18, 0x100151e80, 8)
		if (g == 0) {
			g = fn_13ae08(s18, b + 8, 0x20)
			if (g == 0) {
				g = fn_13ae08(s18, b + 0x28, 0x20)
				if (g == 0) {
					g = fn_13ae08(s18, b + 0x48, 0x20)
					if (g == 0) {
						n = ld64(m) + 1
						st64(m, n)
						st64(a + 8, n)
						st64(a, 2)
						return g
					}
				}
			}
			const o = g
			if (2 > (g & 3) - 2) {
				break B14
			}
			if ((o & 3) == 0) {
				break B14
			}
		} else {
			const l = g
			if (2 > (g & 3) - 2) {
				break B14
			}
			if ((l & 3) == 0) {
				break B14
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
