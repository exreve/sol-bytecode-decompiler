// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction set_default_fee_rate: handler + 4 reachable functions
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
declare function try_accounts_12008(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_1459d0(a: u64): u64 // lib uses repr_bitpacked_kind_from_prim_145358, callx
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp

// instruction handler: set_default_fee_rate (discriminator sha256("global:set_default_fee_rate")[..8] = 0xe4d0e5b69dd6d776)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, fee_tier, fee_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: fee_tier
function ix_set_default_fee_rate(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s90 = fp - 0x90, sa8 = fp - 0xa8, se0 = fp - 0xe0, s138 = fp - 0x138, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0
	let h, k: u64
	sol_log("Instruction: SetDefaultFeeRate", 0x1e)
	if (2 > ix_args_len) {
		const i = fn_1459d0(0x100159468)
		if (2 > (i & 3) - 2) {
			k = anchor_error_from(s1a0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s1a0)
			st64(a + 8, ld64(s1a0 + 8))
			st64(a, h)
			return k
		}
		if ((i & 3) == 0) {
			k = anchor_error_from(s1a0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s1a0)
			st64(a + 8, ld64(s1a0 + 8))
			st64(a, h)
			return k
		}
		const j = ld64(ld64(i + 7))
		callx(j, ld64(i - 1), j)
		k = anchor_error_from(s1a0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		h = ld64(s1a0)
		st64(a + 8, ld64(s1a0 + 8))
		st64(a, h)
		return k
	}
	const m = ld16(ix_args)
	st64(s160, accounts, accounts_len)
	k = accounts_set_default_fee_rate(sa8, undef, s160, undef, fp)
	let g = ld64(sa8 + 0x10)
	h = ld64(sa8 + 8)
	const f = ld64(sa8)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return k
	}
	memcpy(s138, s90, 0x90)
	st64(s150, f, h, g)
	if (m > 0xea60) {
		k = fn_87630(s170, 0x1c)
		g = ld64(s170 + 8)
		h = ld64(s170)
		if (h != 2) {
			st64(a + 8, g)
			st64(a, h)
			return k
		}
	} else {
		st16(se0 + 0x2a, m)
	}
	k = fn_7240(s180, se0, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
	const l = ld64(s180)
	if (l != 2) {
		k = Error_with_account_name(s190, l, ld64(s180 + 8), "fee_tier", 8)
		h = ld64(s190)
		st64(a + 8, ld64(s190 + 8))
		st64(a, h)
		return k
	}
	st64(a + 8, g)
	st64(a, 2)
	return k
}

// Anchor Accounts::try_accounts of instruction set_default_fee_rate (called by ix_set_default_fee_rate; name [str]: from the handler's "Instruction: …" log; was fn_c7110)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, fee_tier (ConstraintMut, ConstraintHasOne), fee_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpools_config, fee_tier, fee_authority
function accounts_set_default_fee_rate(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s58 = fp - 0x58, sb0 = fp - 0xb0, s108 = fp - 0x108, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8
	let w, x: u64
	try_accounts_11de0(s120, c, c, d, e)
	const h = ld64(s120 + 0x10)
	const g = ld64(s120 + 8)
	const whirlpools_config: AccountInfo = ld64(s120)
	if (whirlpools_config == 0) {
		x = Error_with_account_name(s1d0, g, h, "whirlpools_config", 0x11)
		w = ld64(s1d0)
		st64(a + 0x10, ld64(s1d0 + 8))
		st64(a + 8, w)
		st64(a, 0)
		return x
	}
	st64(s1e0, h, g)
	memcpy(sb0, s108, 0x58)
	try_accounts_12008(s120, c)
	const k = ld64(s120 + 0x10)
	const j = ld64(s120 + 8)
	const fee_tier: AccountInfo = ld64(s120)
	if (fee_tier == 0) {
		x = Error_with_account_name(s1c0, j, k, "fee_tier", 8)
		w = ld64(s1c0)
		st64(a + 0x10, ld64(s1c0 + 8))
		st64(a + 8, w)
		st64(a, 0)
		return x
	}
	st64(s1f0, j, k)
	copyr(s58, s108, 0x18)
	try_accounts_11718(s120, c, k)
	const fee_authority: AccountInfo = ld64(s120 + 8)
	const l = ld64(s120)
	if (l == 2) {
		if (fee_tier.is_writable == 0) {
			anchor_error_from(s1a0, 0x7d0 /* anchor::ConstraintMut */)
			x = Error_with_account_name(s1b0, ld64(s1a0), ld64(s1a0 + 8), "fee_tier", 8)
			w = ld64(s1b0)
			st64(a + 0x10, ld64(s1b0 + 8))
			st64(a + 8, w)
			st64(a, 0)
			return x
		}
		copyr(s40, s1f0, 0x10)
		copy(s30, s58, 0x10)
		const m = whirlpools_config.key
		copyr(s20, m, 0x20)
		if ((memcmp(s40, s20, 0x20) as u32) != 0) {
			anchor_error_from(s140, 0x7d1 /* anchor::ConstraintHasOne */)
			const v = Error_with_account_name(s150, ld64(s140), ld64(s140 + 8), "fee_tier", 8)
			const u = ld64(s150 + 8)
			const t = ld64(s150)
			copy(s120, s40, 0x40)
			x = fn_13b5c0(s160, t, u, s120, v)
			w = ld64(s160)
			st64(a + 0x10, ld64(s160 + 8))
			st64(a + 8, w)
			st64(a, 0)
			return x
		}
		const o = fee_authority.key
		copyr(s40, o, 0x20)
		st64(s1f8, fee_authority)
		const p = ld64(s1e0)
		st64(s20 + 8, p)
		st64(s20, ld64(s1e0 + 8))
		copy(s10, sb0, 0x10)
		if ((memcmp(s40, s20, 0x20) as u32) == 0) {
			x = memcpy(a + 0x18, sb0, 0x58)
			const aa = ld64(s58 + 0x10)
			const z = ld64(s58 + 8)
			const y = ld64(s58)
			st64(a + 0xa0, ld64(s1f8))
			st64(a + 0x80, ld64(s1f0 + 8))
			st64(a + 0x78, ld64(s1f0))
			st64(a + 0x70, fee_tier)
			st64(a + 0x10, p)
			st64(a + 8, ld64(s1e0 + 8))
			st64(a, whirlpools_config)
			st64(a + 0x88, y, z, aa)
			return x
		}
		anchor_error_from(s170, 0x7dc /* anchor::ConstraintAddress */)
		const s = Error_with_account_name(s180, ld64(s170), ld64(s170 + 8), "fee_authority", 0xd)
		const r = ld64(s180 + 8)
		const q = ld64(s180)
		copy(s120, s40, 0x40)
		x = fn_13b5c0(s190, q, r, s120, s)
		w = ld64(s190)
		st64(a + 0x10, ld64(s190 + 8))
		st64(a + 8, w)
		st64(a, 0)
		return x
	}
	x = Error_with_account_name(s130, l, fee_authority, "fee_authority", 0xd)
	w = ld64(s130)
	st64(a + 0x10, ld64(s130 + 8))
	st64(a + 8, w)
	st64(a, 0)
	return x
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_7240(a: u64, b: u64, c: u64, d: u64): u64 {
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
	B14: {
		const k = ld64(j)
		st64(s20 + 8, ld64(j + 8))
		st64(s20, k)
		st64(s20 + 0x10, 0)
		g = fn_13ae08(s20, 0x100151e90, 8)
		if (g == 0) {
			g = fn_13ae08(s20, b + 8, 0x20)
			if (g == 0) {
				st16(s2, ld16(b + 0x28))
				g = fn_13ae08(s20, s2, 2)
				if (g == 0) {
					st16(s2, ld16(b + 0x2a))
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
