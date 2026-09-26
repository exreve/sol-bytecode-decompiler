// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction set_fee_rate: handler + 4 reachable functions
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
declare function fn_f658(a: u64, b: u64): u64 // lib
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11a48(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11de0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_1459d0(a: u64): u64 // lib uses repr_bitpacked_kind_from_prim_145358, callx
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp

// instruction handler: set_fee_rate (discriminator sha256("global:set_fee_rate")[..8] = 0x69e8c084189f335)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, whirlpool, fee_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
function ix_set_fee_rate(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s2f0 = fp - 0x2f0, s308 = fp - 0x308, s318 = fp - 0x318, s5a0 = fp - 0x5a0, s5f8 = fp - 0x5f8, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660
	let h, k: u64
	sol_log("Instruction: SetFeeRate", 0x17)
	if (2 > ix_args_len) {
		const i = fn_1459d0(0x100159468)
		if (2 > (i & 3) - 2) {
			k = anchor_error_from(s660, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s660)
			st64(a + 8, ld64(s660 + 8))
			st64(a, h)
			return k
		}
		if ((i & 3) == 0) {
			k = anchor_error_from(s660, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s660)
			st64(a + 8, ld64(s660 + 8))
			st64(a, h)
			return k
		}
		const j = ld64(ld64(i + 7))
		callx(j, ld64(i - 1), j)
		k = anchor_error_from(s660, 0x66 /* anchor::InstructionDidNotDeserialize */)
		h = ld64(s660)
		st64(a + 8, ld64(s660 + 8))
		st64(a, h)
		return k
	}
	const m = ld16(ix_args)
	st64(s620, accounts, accounts_len)
	k = accounts_set_fee_rate(s308, undef, s620, undef, fp)
	let g = ld64(s308 + 0x10)
	h = ld64(s308 + 8)
	const f = ld64(s308)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return k
	}
	memcpy(s5f8, s2f0, 0x2f0)
	st64(s610, f, h, g)
	if (m > 0xea60) {
		k = fn_87630(s630, 0x1c)
		g = ld64(s630 + 8)
		h = ld64(s630)
		if (h != 2) {
			st64(a + 8, g)
			st64(a, h)
			return k
		}
	} else {
		st16(s318, m)
	}
	k = fn_6aa0(s640, s5a0, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
	const l = ld64(s640)
	if (l != 2) {
		k = Error_with_account_name(s650, l, ld64(s640 + 8), 0x100152b28 /* "whirlpool" */, 9)
		h = ld64(s650)
		st64(a + 8, ld64(s650 + 8))
		st64(a, h)
		return k
	}
	st64(a + 8, g)
	st64(a, 2)
	return k
}

// Anchor Accounts::try_accounts of instruction set_fee_rate (called by ix_set_fee_rate; name [str]: from the handler's "Instruction: …" log; was fn_c8268)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, whirlpool (ConstraintMut, ConstraintHasOne), fee_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpools_config, whirlpool, fee_authority
function accounts_set_fee_rate(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s40 = fp - 0x40, s148 = fp - 0x148, s2b8 = fp - 0x2b8, s528 = fp - 0x528, s530 = fp - 0x530, s548 = fp - 0x548, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s678 = fp - 0x678
	let w, x: u64
	try_accounts_11de0(s548, c, c, d, e)
	const h = ld64(s548 + 0x10)
	const g = ld64(s548 + 8)
	const whirlpools_config: AccountInfo = ld64(s548)
	if (whirlpools_config == 0) {
		x = Error_with_account_name(s650, g, h, "whirlpools_config", 0x11)
		w = ld64(s650)
		st64(a + 0x10, ld64(s650 + 8))
		st64(a + 8, w)
		st64(a, 0)
		return x
	}
	st64(s660, h, g)
	memcpy(s5a0, s530, 0x58)
	try_accounts_11a48(s548, c)
	const k = ld64(s548 + 0x10)
	const j = ld64(s548 + 8)
	const whirlpool: AccountInfo = ld64(s548)
	if (whirlpool == 0) {
		x = Error_with_account_name(s640, j, k, 0x100152b28 /* "whirlpool" */, 9)
		w = ld64(s640)
		st64(a + 0x10, ld64(s640 + 8))
		st64(a + 8, w)
		st64(a, 0)
		return x
	}
	st64(s670, j, k)
	memcpy(s2b8, s530, 0x278)
	try_accounts_11718(s548, c)
	const fee_authority: AccountInfo = ld64(s548 + 8)
	const l = ld64(s548)
	if (l == 2) {
		if (whirlpool.is_writable == 0) {
			anchor_error_from(s620, 0x7d0 /* anchor::ConstraintMut */)
			x = Error_with_account_name(s630, ld64(s620), ld64(s620 + 8), 0x100152b28 /* "whirlpool" */, 9)
			w = ld64(s630)
			st64(a + 0x10, ld64(s630 + 8))
			st64(a + 8, w)
			st64(a, 0)
			return x
		}
		copyr(s40, s148, 0x20)
		const m = whirlpools_config.key
		copyr(s20, m, 0x20)
		if ((memcmp(s40, s20, 0x20) as u32) != 0) {
			anchor_error_from(s5c0, 0x7d1 /* anchor::ConstraintHasOne */)
			const v = Error_with_account_name(s5d0, ld64(s5c0), ld64(s5c0 + 8), 0x100152b28 /* "whirlpool" */, 9)
			const u = ld64(s5d0 + 8)
			const t = ld64(s5d0)
			copyr(s548, s148, 0x20)
			copy(s528, s20, 0x20)
			x = fn_13b5c0(s5e0, t, u, s548, v)
			w = ld64(s5e0)
			st64(a + 0x10, ld64(s5e0 + 8))
			st64(a + 8, w)
			st64(a, 0)
			return x
		}
		const o = fee_authority.key
		copyr(s40, o, 0x20)
		st64(s678, fee_authority)
		const p = ld64(s660)
		st64(s20 + 8, p)
		st64(s20, ld64(s660 + 8))
		copy(s10, s5a0, 0x10)
		if ((memcmp(s40, s20, 0x20) as u32) == 0) {
			memcpy(a + 0x18, s5a0, 0x58)
			x = memcpy(a + 0x88, s2b8, 0x278)
			st64(a + 0x300, ld64(s678))
			st64(a + 0x80, ld64(s670 + 8))
			st64(a + 0x78, ld64(s670))
			st64(a + 0x70, whirlpool)
			st64(a + 0x10, p)
			st64(a + 8, ld64(s660 + 8))
			st64(a, whirlpools_config)
			return x
		}
		anchor_error_from(s5f0, 0x7dc /* anchor::ConstraintAddress */)
		const s = Error_with_account_name(s600, ld64(s5f0), ld64(s5f0 + 8), "fee_authority", 0xd)
		const r = ld64(s600 + 8)
		const q = ld64(s600)
		copy(s548, s40, 0x40)
		x = fn_13b5c0(s610, q, r, s548, s)
		w = ld64(s610)
		st64(a + 0x10, ld64(s610 + 8))
		st64(a + 8, w)
		st64(a, 0)
		return x
	}
	x = Error_with_account_name(s5b0, l, fee_authority, "fee_authority", 0xd)
	w = ld64(s5b0)
	st64(a + 0x10, ld64(s5b0 + 8))
	st64(a + 8, w)
	st64(a, 0)
	return x
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_6aa0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let u, v, w: u64
	const f = memcmp(c, d, 0x20)
	let r = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, r)
		st64(a, 2)
		return g
	}
	const h = ld64(b)
	g = common_is_closed(h)
	r = undef
	if (g != 0) {
		st64(a + 8, r)
		st64(a, 2)
		return g
	}
	fn_143448(s28, h, g)
	const m = ld64(s28 + 0x10)
	const j = ld64(s28 + 8)
	const i = ld64(s28)
	if (i != 0x800000000000001a /* Ok */) {
		st64(s28, i, j, m)
		g = fn_13b430(s38, s28)
		const y = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, y)
		return g
	}
	B30: {
		const k = ld64(j)
		st64(s28 + 8, ld64(j + 8))
		st64(s28, k)
		st64(s28 + 0x10, 0)
		g = fn_13ae08(s28, 0x100151ea0, 8)
		if (g == 0) {
			g = fn_13ae08(s28, b + 0x188, 0x20)
			if (g == 0) {
				g = fn_13ae08(s28, b + 0x28c, 1)
				if (g == 0) {
					st16(s10, ld16(b + 0x284))
					g = fn_13ae08(s28, s10, 2)
					if (g == 0) {
						g = fn_13ae08(s28, b + 0x286, 2)
						if (g == 0) {
							st16(s10, ld16(b + 0x288))
							g = fn_13ae08(s28, s10, 2)
							if (g == 0) {
								st16(s10, ld16(b + 0x28a))
								g = fn_13ae08(s28, s10, 2)
								if (g == 0) {
									const n = ld64(b + 0x228)
									st64(s10 + 8, ld64(b + 0x230))
									st64(s10, n)
									g = fn_13ae08(s28, s10, 0x10)
									if (g == 0) {
										const o = ld64(b + 0x238)
										st64(s10 + 8, ld64(b + 0x240))
										st64(s10, o)
										g = fn_13ae08(s28, s10, 0x10)
										if (g == 0) {
											st32(s10, ld32(b + 0x280))
											g = fn_13ae08(s28, s10, 4)
											if (g == 0) {
												st64(s10, ld64(b + 0x268))
												g = fn_13ae08(s28, s10, 8)
												if (g == 0) {
													st64(s10, ld64(b + 0x270))
													g = fn_13ae08(s28, s10, 8)
													if (g == 0) {
														g = fn_13ae08(s28, b + 0x1a8, 0x20)
														if (g == 0) {
															g = fn_13ae08(s28, b + 0x1c8, 0x20)
															if (g == 0) {
																const p = ld64(b + 0x248)
																st64(s10 + 8, ld64(b + 0x250))
																st64(s10, p)
																g = fn_13ae08(s28, s10, 0x10)
																if (g == 0) {
																	g = fn_13ae08(s28, b + 0x1e8, 0x20)
																	if (g == 0) {
																		g = fn_13ae08(s28, b + 0x208, 0x20)
																		if (g == 0) {
																			const q = ld64(b + 0x258)
																			st64(s10 + 8, ld64(b + 0x260))
																			st64(s10, q)
																			g = fn_13ae08(s28, s10, 0x10)
																			if (g == 0) {
																				st64(s10, ld64(b + 0x278))
																				g = fn_13ae08(s28, s10, 8)
																				if (g == 0) {
																					g = fn_f658(b + 8, s28)
																					if (g == 0) {
																						r = ld64(m) + 1
																						st64(m, r)
																						st64(a + 8, r)
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
								}
							}
						}
					}
				}
			}
			const s = g
			if (2 > (g & 3) - 2) {
				break B30
			}
			if ((s & 3) == 0) {
				break B30
			}
		} else {
			const l = g
			if (2 > (g & 3) - 2) {
				break B30
			}
			if ((l & 3) == 0) {
				break B30
			}
		}
		const t = ld64(ld64(g + 7))
		callx(t, ld64(g - 1), t)
	}
	g = anchor_error_from(s48, 0xbbc /* anchor::AccountDidNotSerialize */, u, v, w)
	r = ld64(s48 + 8)
	const x = ld64(s48)
	st64(m, ld64(m) + 1)
	st64(a + 8, r)
	st64(a, x != 2 ? x : 2)
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
