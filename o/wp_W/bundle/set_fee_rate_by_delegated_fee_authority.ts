// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction set_fee_rate_by_delegated_fee_authority: handler + 4 reachable functions
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
declare function try_accounts_11d28(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_1459d0(a: u64): u64 // lib uses repr_bitpacked_kind_from_prim_145358, callx
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp

// instruction handler: set_fee_rate_by_delegated_fee_authority (discriminator sha256("global:set_fee_rate_by_delegated_fee_authority")[..8] = 0x68a2e68372367979)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, adaptive_fee_tier, delegated_fee_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
function ix_set_fee_rate_by_delegated_fee_authority(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s300 = fp - 0x300, s318 = fp - 0x318, s3a8 = fp - 0x3a8, s618 = fp - 0x618, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680
	let h, k: u64
	sol_log("Instruction: SetFeeRateByDelegatedFeeAuthority", 0x2e)
	if (2 > ix_args_len) {
		const i = fn_1459d0(0x100159468)
		if (2 > (i & 3) - 2) {
			k = anchor_error_from(s680, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s680)
			st64(a + 8, ld64(s680 + 8))
			st64(a, h)
			return k
		}
		if ((i & 3) == 0) {
			k = anchor_error_from(s680, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s680)
			st64(a + 8, ld64(s680 + 8))
			st64(a, h)
			return k
		}
		const j = ld64(ld64(i + 7))
		callx(j, ld64(i - 1), j)
		k = anchor_error_from(s680, 0x66 /* anchor::InstructionDidNotDeserialize */)
		h = ld64(s680)
		st64(a + 8, ld64(s680 + 8))
		st64(a, h)
		return k
	}
	const m = ld16(ix_args)
	st64(s640, accounts, accounts_len)
	k = accounts_set_fee_rate_by_delegated_fee_authority(s318, undef, s640, undef, fp)
	let g = ld64(s318 + 0x10)
	h = ld64(s318 + 8)
	const f = ld64(s318)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return k
	}
	memcpy(s618, s300, 0x300)
	st64(s630, f, h, g)
	if (m > 0xea60) {
		k = fn_87630(s650, 0x1c)
		g = ld64(s650 + 8)
		h = ld64(s650)
		if (h != 2) {
			st64(a + 8, g)
			st64(a, h)
			return k
		}
	} else {
		st16(s3a8, m)
	}
	k = fn_6aa0(s660, s630, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
	const l = ld64(s660)
	if (l != 2) {
		k = Error_with_account_name(s670, l, ld64(s660 + 8), 0x100152b28 /* "whirlpool" */, 9)
		h = ld64(s670)
		st64(a + 8, ld64(s670 + 8))
		st64(a, h)
		return k
	}
	st64(a + 8, g)
	st64(a, 2)
	return k
}

// Anchor Accounts::try_accounts of instruction set_fee_rate_by_delegated_fee_authority (called by ix_set_fee_rate_by_delegated_fee_authority; name [str]: from the handler's "Instruction: …" log; was fn_100938)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool (ConstraintMut, ConstraintRaw), adaptive_fee_tier (ConstraintRaw), delegated_fee_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: delegated_fee_authority
function accounts_set_fee_rate_by_delegated_fee_authority(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s80 = fp - 0x80, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, s310 = fp - 0x310, s330 = fp - 0x330, s350 = fp - 0x350, s388 = fp - 0x388, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d0 = fp - 0x3d0, s4d8 = fp - 0x4d8, s648 = fp - 0x648, s658 = fp - 0x658, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s700 = fp - 0x700, s710 = fp - 0x710, s720 = fp - 0x720, s730 = fp - 0x730, s740 = fp - 0x740, s748 = fp - 0x748, s750 = fp - 0x750
	let p, q, w: u64
	let g = a
	try_accounts_11a48(s310, c, c, d, e)
	const h = ld64(s310 + 0x10)
	const i = ld64(s310 + 8)
	const f = ld64(s310)
	if (f == 0) {
		q = Error_with_account_name(s740, i, h, 0x100152b28 /* "whirlpool" */, 9)
		p = ld64(s740)
		st64(g + 0x10, ld64(s740 + 8))
		st64(g + 8, p)
		st64(g, 0)
		return q
	}
	st64(s748, g)
	memcpy(s648, s2f8, 0x278)
	st64(s658, i, h)
	st64(s750, f)
	st64(s660, f)
	try_accounts_11d28(s310, c)
	const k = ld64(s310 + 0x10)
	const l = ld64(s310 + 8)
	const j = ld64(s310)
	if (j == 0) {
		q = Error_with_account_name(s730, l, k, 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
		p = ld64(s730)
		g = ld64(s748)
		st64(g + 0x10, ld64(s730 + 8))
		st64(g + 8, p)
		st64(g, 0)
		return q
	}
	memcpy(s3b8, s2f8, 0x68)
	st64(s3d0, j, l, k)
	try_accounts_11718(s310, c)
	const delegated_fee_authority: AccountInfo = ld64(s310 + 8)
	const m = ld64(s310)
	if (m == 2) {
		const s = ld64(s748)
		if (ld8(ld64(s750) + 0x29) == 0) {
			anchor_error_from(s710, 0x7d0 /* anchor::ConstraintMut */, delegated_fee_authority)
			q = Error_with_account_name(s720, ld64(s710), ld64(s710 + 8), 0x100152b28 /* "whirlpool" */, 9)
			w = ld64(s720)
			st64(s + 0x10, ld64(s720 + 8))
			st64(s + 8, w)
			st64(s, 0)
			return q
		}
		const n = ld16(s4d8 + 0xfe)
		if (n != ld16(s4d8 + 0xfc)) {
			if ((memcmp(s3c8, s4d8, 0x20) as u32) == 0) {
				if (ld16(s388 + 0x28) == n) {
					const r = delegated_fee_authority.key
					copyr(s350, r, 0x20)
					copyr(s330, s388, 0x20)
					if ((memcmp(s350, s330, 0x20) as u32) != 0) {
						anchor_error_from(s6c0, 0x7dc /* anchor::ConstraintAddress */)
						const v = Error_with_account_name(s6d0, ld64(s6c0), ld64(s6c0 + 8), 0x10015517b /* "delegated_fee_authority" */, 0x17)
						const u = ld64(s6d0 + 8)
						const t = ld64(s6d0)
						copyr(s310, s350, 0x20)
						copy(s2f0, s388, 0x20)
						q = fn_13b5c0(s6e0, t, u, s310, v)
						w = ld64(s6e0)
						st64(s + 0x10, ld64(s6e0 + 8))
						st64(s + 8, w)
						st64(s, 0)
						return q
					}
					memcpy(s310, s660, 0x290)
					memcpy(s80, s3d0, 0x80)
					q = memcpy(s, s310, 0x310)
					st64(s + 0x310, delegated_fee_authority)
					return q
				}
				anchor_error_from(s6a0, 0x7d3 /* anchor::ConstraintRaw */)
				q = Error_with_account_name(s6b0, ld64(s6a0), ld64(s6a0 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
				w = ld64(s6b0)
				st64(s + 0x10, ld64(s6b0 + 8))
				st64(s + 8, w)
				st64(s, 0)
				return q
			}
			anchor_error_from(s680, 0x7d3 /* anchor::ConstraintRaw */)
			q = Error_with_account_name(s690, ld64(s680), ld64(s680 + 8), 0x1001550e1 /* "adaptive_fee_tier" */, 0x11)
			w = ld64(s690)
			st64(s + 0x10, ld64(s690 + 8))
			st64(s + 8, w)
			st64(s, 0)
			return q
		}
		anchor_error_from(s6f0, 0x7d3 /* anchor::ConstraintRaw */, delegated_fee_authority)
		q = Error_with_account_name(s700, ld64(s6f0), ld64(s6f0 + 8), 0x100152b28 /* "whirlpool" */, 9)
		w = ld64(s700)
		st64(s + 0x10, ld64(s700 + 8))
		st64(s + 8, w)
		st64(s, 0)
		return q
	}
	q = Error_with_account_name(s670, m, delegated_fee_authority, 0x10015517b /* "delegated_fee_authority" */, 0x17)
	p = ld64(s670)
	g = ld64(s748)
	st64(g + 0x10, ld64(s670 + 8))
	st64(g + 8, p)
	st64(g, 0)
	return q
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
