// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction set_delegated_fee_authority: handler + 4 reachable functions
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
declare function try_accounts_11d28(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11de0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp

// instruction handler: set_delegated_fee_authority (discriminator sha256("global:set_delegated_fee_authority")[..8] = 0x7a03398a93e7eac1)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, adaptive_fee_tier, new_delegated_fee_authority, fee_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: adaptive_fee_tier
function ix_set_delegated_fee_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const se8 = fp - 0xe8, s100 = fp - 0x100, s140 = fp - 0x140, s190 = fp - 0x190, s1e8 = fp - 0x1e8, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230
	sol_log("Instruction: SetDelegatedFeeAuthority", 0x25)
	st64(s210, accounts, accounts_len)
	let n = accounts_set_delegated_fee_authority(s100, undef, s210, undef, fp)
	const g = ld64(s100 + 0x10)
	let h = ld64(s100 + 8)
	const f = ld64(s100)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return n
	}
	memcpy(s1e8, se8, 0xe8)
	st64(s200, f, h, g)
	const i = ld64(ld64(s140 + 0x38))
	const l = ld64(i + 8)
	const k = ld64(i + 0x10)
	const j = ld64(i + 0x18)
	st64(s190 + 0x48, ld64(i))
	st64(s140, l, k, j)
	n = fn_5f98(s220, s190, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
	const m = ld64(s220)
	if (m != 2) {
		n = Error_with_account_name(s230, m, ld64(s220 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
		h = ld64(s230)
		st64(a + 8, ld64(s230 + 8))
		st64(a, h)
		return n
	}
	st64(a + 8, g)
	st64(a, 2)
	return n
}

// Anchor Accounts::try_accounts of instruction set_delegated_fee_authority (called by ix_set_delegated_fee_authority; name [str]: from the handler's "Instruction: …" log; was fn_1000a0)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, adaptive_fee_tier (ConstraintMut, ConstraintHasOne), new_delegated_fee_authority (AccountNotEnoughKeys), fee_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpools_config, adaptive_fee_tier, fee_authority
function accounts_set_delegated_fee_authority(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, sa8 = fp - 0xa8, s110 = fp - 0x110, s128 = fp - 0x128, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s278 = fp - 0x278, s280 = fp - 0x280
	let n, p, aa, ab: u64
	try_accounts_11de0(s128, c, c, d, e)
	const h = ld64(s128 + 0x10)
	const g = ld64(s128 + 8)
	const whirlpools_config: AccountInfo = ld64(s128)
	if (whirlpools_config == 0) {
		ab = Error_with_account_name(s250, g, h, "whirlpools_config", 0x11)
		aa = ld64(s250)
		st64(a + 0x10, ld64(s250 + 8))
		st64(a + 8, aa)
		st64(a, 0)
		return ab
	}
	st64(s260, h, g)
	memcpy(s180, s110, 0x58)
	try_accounts_11d28(s128, c)
	const k = ld64(s128 + 0x10)
	const j = ld64(s128 + 8)
	const adaptive_fee_tier: AccountInfo = ld64(s128)
	if (adaptive_fee_tier == 0) {
		ab = Error_with_account_name(s240, j, k, 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
		aa = ld64(s240)
		st64(a + 0x10, ld64(s240 + 8))
		st64(a + 8, aa)
		st64(a, 0)
		return ab
	}
	st64(s270, j, k)
	memcpy(sa8, s110, 0x68)
	try_accounts_11718(s128, c)
	const fee_authority: AccountInfo = ld64(s128 + 8)
	const l = ld64(s128)
	if (l == 2) {
		const m = ld64(c + 8)
		if (m == 0) {
			anchor_error_from(s1a0, 0xbbd /* anchor::AccountNotEnoughKeys */, fee_authority, undef, p)
			n = ld64(s1a0 + 8)
			const q = ld64(s1a0)
			if (q != 2) {
				ab = Error_with_account_name(s1b0, q, n, "new_delegated_fee_authority", 0x1b)
				aa = ld64(s1b0)
				st64(a + 0x10, ld64(s1b0 + 8))
				st64(a + 8, aa)
				st64(a, 0)
				return ab
			}
		} else {
			st64(c + 8, m - 1)
			n = ld64(c)
			st64(c, n + 0x30)
		}
		if (adaptive_fee_tier.is_writable == 0) {
			anchor_error_from(s220, 0x7d0 /* anchor::ConstraintMut */, fee_authority, n, p)
			ab = Error_with_account_name(s230, ld64(s220), ld64(s220 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
			aa = ld64(s230)
			st64(a + 0x10, ld64(s230 + 8))
			st64(a + 8, aa)
			st64(a, 0)
			return ab
		}
		st64(s278, n)
		copyr(s40, s270, 0x10)
		copy(s30, sa8, 0x10)
		const r = whirlpools_config.key
		copyr(s20, r, 0x20)
		if ((memcmp(s40, s20, 0x20) as u32) != 0) {
			anchor_error_from(s1c0, 0x7d1 /* anchor::ConstraintHasOne */)
			const z = Error_with_account_name(s1d0, ld64(s1c0), ld64(s1c0 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
			const y = ld64(s1d0 + 8)
			const x = ld64(s1d0)
			copy(s128, s40, 0x40)
			ab = fn_13b5c0(s1e0, x, y, s128, z)
			aa = ld64(s1e0)
			st64(a + 0x10, ld64(s1e0 + 8))
			st64(a + 8, aa)
			st64(a, 0)
			return ab
		}
		st64(s280, fee_authority)
		const s = fee_authority.key
		copyr(s40, s, 0x20)
		const t = ld64(s260)
		st64(s20 + 8, t)
		st64(s20, ld64(s260 + 8))
		copy(s10, s180, 0x10)
		if ((memcmp(s40, s20, 0x20) as u32) == 0) {
			memcpy(a + 0x18, s180, 0x58)
			ab = memcpy(a + 0x88, sa8, 0x68)
			st64(a + 0xf8, ld64(s278))
			st64(a + 0xf0, ld64(s280))
			st64(a + 0x80, ld64(s270 + 8))
			st64(a + 0x78, ld64(s270))
			st64(a + 0x70, adaptive_fee_tier)
			st64(a + 0x10, t)
			st64(a + 8, ld64(s260 + 8))
			st64(a, whirlpools_config)
			return ab
		}
		anchor_error_from(s1f0, 0x7dc /* anchor::ConstraintAddress */)
		const w = Error_with_account_name(s200, ld64(s1f0), ld64(s1f0 + 8), "fee_authority", 0xd)
		const v = ld64(s200 + 8)
		const u = ld64(s200)
		copy(s128, s40, 0x40)
		ab = fn_13b5c0(s210, u, v, s128, w)
		aa = ld64(s210)
		st64(a + 0x10, ld64(s210 + 8))
		st64(a + 8, aa)
		st64(a, 0)
		return ab
	}
	ab = Error_with_account_name(s190, l, fee_authority, "fee_authority", 0xd)
	aa = ld64(s190)
	st64(a + 0x10, ld64(s190 + 8))
	st64(a + 8, aa)
	st64(a, 0)
	return ab
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_5f98(a: u64, b: u64, c: u64, d: u64): u64 {
	const s4 = fp - 0x4, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40
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
	B24: {
		const k = ld64(j)
		st64(s20 + 8, ld64(j + 8))
		st64(s20, k)
		st64(s20 + 0x10, 0)
		g = fn_13ae08(s20, 0x100151f08, 8)
		if (g == 0) {
			g = fn_13ae08(s20, b + 8, 0x20)
			if (g == 0) {
				st16(s4, ld16(b + 0x70))
				g = fn_13ae08(s20, s4, 2)
				if (g == 0) {
					st16(s4, ld16(b + 0x72))
					g = fn_13ae08(s20, s4, 2)
					if (g == 0) {
						g = fn_13ae08(s20, b + 0x28, 0x20)
						if (g == 0) {
							g = fn_13ae08(s20, b + 0x48, 0x20)
							if (g == 0) {
								st16(s4, ld16(b + 0x74))
								g = fn_13ae08(s20, s4, 2)
								if (g == 0) {
									st16(s4, ld16(b + 0x76))
									g = fn_13ae08(s20, s4, 2)
									if (g == 0) {
										st16(s4, ld16(b + 0x78))
										g = fn_13ae08(s20, s4, 2)
										if (g == 0) {
											st16(s4, ld16(b + 0x7a))
											g = fn_13ae08(s20, s4, 2)
											if (g == 0) {
												st32(s4, ld32(b + 0x68))
												g = fn_13ae08(s20, s4, 4)
												if (g == 0) {
													st32(s4, ld32(b + 0x6c))
													g = fn_13ae08(s20, s4, 4)
													if (g == 0) {
														st16(s4, ld16(b + 0x7c))
														g = fn_13ae08(s20, s4, 2)
														if (g == 0) {
															st16(s4, ld16(b + 0x7e))
															g = fn_13ae08(s20, s4, 2)
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
										}
									}
								}
							}
						}
					}
				}
			}
			const o = g
			if (2 > (g & 3) - 2) {
				break B24
			}
			if ((o & 3) == 0) {
				break B24
			}
		} else {
			const l = g
			if (2 > (g & 3) - 2) {
				break B24
			}
			if ((l & 3) == 0) {
				break B24
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
