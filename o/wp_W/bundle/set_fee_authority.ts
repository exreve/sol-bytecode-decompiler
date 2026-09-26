// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction set_fee_authority: handler + 4 reachable functions
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
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp

// instruction handler: set_fee_authority (discriminator sha256("global:set_fee_authority")[..8] = 0x846165ed5732011f)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, new_fee_authority, fee_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config
function ix_set_fee_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s68 = fp - 0x68, s80 = fp - 0x80, se8 = fp - 0xe8, sf0 = fp - 0xf0, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130
	let l: u64
	sol_log("Instruction: SetFeeAuthority", 0x1c)
	st64(s110, accounts, accounts_len)
	let m = accounts_set_fee_authority(s80, undef, s110, undef, fp)
	const f = ld64(s80)
	if (f == 0) {
		l = ld64(s80 + 8)
		st64(a + 8, ld64(s80 + 0x10))
		st64(a, l)
		return m
	}
	memcpy(se8, s68, 0x68)
	st64(s100, f)
	const g = ld64(ld64(se8 + 0x60))
	const j = ld64(g + 8)
	const i = ld64(g + 0x10)
	const h = ld64(g + 0x18)
	st64(s100 + 8, ld64(g))
	st64(sf0, j, i, h)
	m = fn_8228(s120, s100, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
	const k = ld64(s120)
	if (k != 2) {
		m = Error_with_account_name(s130, k, ld64(s120 + 8), "whirlpools_config", 0x11)
		l = ld64(s130)
		st64(a + 8, ld64(s130 + 8))
		st64(a, l)
		return m
	}
	st64(a + 8, k)
	st64(a, 2)
	return m
}

// Anchor Accounts::try_accounts of instruction set_fee_authority (called by ix_set_fee_authority; name [str]: from the handler's "Instruction: …" log; was fn_c7d08)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config (ConstraintMut), new_fee_authority (AccountNotEnoughKeys), fee_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpools_config, fee_authority
function accounts_set_fee_authority(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s40 = fp - 0x40, s98 = fp - 0x98, sf0 = fp - 0xf0, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, s1b0 = fp - 0x1b0
	let j, m, t, u: u64
	try_accounts_11de0(s108, c, c, d, e)
	const g = ld64(s108 + 0x10)
	const k = ld64(s108 + 8)
	const whirlpools_config: AccountInfo = ld64(s108)
	if (whirlpools_config == 0) {
		u = Error_with_account_name(s198, k, g, "whirlpools_config", 0x11)
		t = ld64(s198)
		st64(a + 0x10, ld64(s198 + 8))
		st64(a + 8, t)
		st64(a, 0)
		return u
	}
	st64(s1a0, g)
	memcpy(s98, sf0, 0x58)
	try_accounts_11718(s108, c)
	const fee_authority: AccountInfo = ld64(s108 + 8)
	const h = ld64(s108)
	if (h == 2) {
		const i = ld64(c + 8)
		if (i == 0) {
			anchor_error_from(s128, 0xbbd /* anchor::AccountNotEnoughKeys */, fee_authority, undef, m)
			j = ld64(s128 + 8)
			const n = ld64(s128)
			if (n != 2) {
				u = Error_with_account_name(s138, n, j, "new_fee_authority", 0x11)
				t = ld64(s138)
				st64(a + 0x10, ld64(s138 + 8))
				st64(a + 8, t)
				st64(a, 0)
				return u
			}
		} else {
			st64(c + 8, i - 1)
			j = ld64(c)
			st64(c, j + 0x30)
		}
		if (whirlpools_config.is_writable == 0) {
			anchor_error_from(s178, 0x7d0 /* anchor::ConstraintMut */, fee_authority, j, m)
			u = Error_with_account_name(s188, ld64(s178), ld64(s178 + 8), "whirlpools_config", 0x11)
			t = ld64(s188)
			st64(a + 0x10, ld64(s188 + 8))
			st64(a + 8, t)
			st64(a, 0)
			return u
		}
		st64(s1a8, j)
		const o = fee_authority.key
		copyr(s40, o, 0x20)
		const p = ld64(s1a0)
		st64(s20, k, p)
		copy(s10, s98, 0x10)
		st64(s1b0, fee_authority)
		if ((memcmp(s40, s20, 0x20) as u32) != 0) {
			anchor_error_from(s148, 0x7dc /* anchor::ConstraintAddress */)
			const s = Error_with_account_name(s158, ld64(s148), ld64(s148 + 8), "fee_authority", 0xd)
			const r = ld64(s158 + 8)
			const q = ld64(s158)
			copy(s108, s40, 0x40)
			u = fn_13b5c0(s168, q, r, s108, s)
			t = ld64(s168)
			st64(a + 0x10, ld64(s168 + 8))
			st64(a + 8, t)
			st64(a, 0)
			return u
		}
		u = memcpy(a + 0x18, s98, 0x58)
		st64(a + 0x78, ld64(s1a8))
		st64(a + 0x70, ld64(s1b0))
		st64(a + 0x10, p)
		st64(a + 8, k)
		st64(a, whirlpools_config)
		return u
	}
	u = Error_with_account_name(s118, h, fee_authority, "fee_authority", 0xd)
	t = ld64(s118)
	st64(a + 0x10, ld64(s118 + 8))
	st64(a + 8, t)
	st64(a, 0)
	return u
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
