// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction set_config_feature_flag: handler + 10 reachable functions
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
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function fn_b580(a: u64): u64 // lib uses alloc_handle_alloc_error, Error__new
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11de0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_1459d0(a: u64): u64 // lib uses repr_bitpacked_kind_from_prim_145358, callx
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function fn_14a698(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses callx
declare function fn_14ecd0(a: u64, b: u64, c: u64): u64 // lib "0001020304050607080910111213141516171819…", "0001020304050607080910111213141516171819…"
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp

// instruction handler: set_config_feature_flag (discriminator sha256("global:set_config_feature_flag")[..8] = 0x39d2f74312e4ad47)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config
function ix_set_config_feature_flag(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s10 = fp - 0x10, s11 = fp - 0x11, s30 = fp - 0x30, s31 = fp - 0x31, s98 = fp - 0x98, sb0 = fp - 0xb0, s110 = fp - 0x110, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158
	let j, k, n, o, p, r, s: u64
	B8: {
		B5: {
			sol_log("Instruction: SetConfigFeatureFlag", 0x21)
			const f = ix_args_len
			if (f != 0) {
				const g = ix_args
				const h = ld8(g)
				st8(s31, h)
				if (h != 0) {
					st64(sb0, 0x100159668)
					st64(sb0 + 0x10, s128)
					st64(s128, s31, num_fmt_bae8)
					st64(s98 + 8, 0)
					st64(sb0 + 8, 1)
					st64(s98, 1)
					j = s30
				} else {
					if (f == 1) {
						break B5
					}
					const i = ld8(g + 1)
					st8(s11, i)
					if (2 > i) {
						st64(s30, accounts, accounts_len)
						s = accounts_set_config_feature_flag(sb0, g, s30, undef, fp)
						const q = ld64(sb0 + 0x10)
						r = ld64(sb0 + 8)
						const t = ld64(sb0)
						if (t == 0) {
							st64(a + 8, q)
							st64(a, r)
							return s
						}
						memcpy(s110, s98, 0x60)
						st16(s110 + 0x52, i)
						st64(s128, t, r, q)
						s = fn_8228(s138, s128, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
						const u = ld64(s138)
						if (u != 2) {
							s = Error_with_account_name(s148, u, ld64(s138 + 8), "whirlpools_config", 0x11)
							r = ld64(s148)
							st64(a + 8, ld64(s148 + 8))
							st64(a, r)
							return s
						}
						st64(a + 8, q)
						st64(a, 2)
						return s
					}
					st64(sb0, 0x100159620)
					st64(sb0 + 0x10, s10)
					st64(s10, s11, fn_14ef78)
					st64(s98 + 8, 0)
					st64(sb0 + 8, 1)
					st64(s98, 1)
					j = s128
				}
				fn_147e78(j, sb0, h)
				k = fn_b580(j)
				break B8
			}
		}
		k = fn_1459d0(0x100159468)
	}
	const l = k
	if (2 > (k & 3) - 2) {
		s = anchor_error_from(s158, 0x66 /* anchor::InstructionDidNotDeserialize */, n, o, p)
		r = ld64(s158)
		st64(a + 8, ld64(s158 + 8))
		st64(a, r)
		return s
	}
	if ((l & 3) == 0) {
		s = anchor_error_from(s158, 0x66 /* anchor::InstructionDidNotDeserialize */, n, o, p)
		r = ld64(s158)
		st64(a + 8, ld64(s158 + 8))
		st64(a, r)
		return s
	}
	const m = ld64(ld64(k + 7))
	callx(m, ld64(k - 1), m)
	s = anchor_error_from(s158, 0x66 /* anchor::InstructionDidNotDeserialize */)
	r = ld64(s158)
	st64(a + 8, ld64(s158 + 8))
	st64(a, r)
	return s
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

// Anchor Accounts::try_accounts of instruction set_config_feature_flag (called by ix_set_config_feature_flag; name [str]: from the handler's "Instruction: …" log; was fn_c6da0)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config (ConstraintMut), authority (ConstraintRaw)
function accounts_set_config_feature_flag(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s58 = fp - 0x58, sb0 = fp - 0xb0, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s130 = fp - 0x130, s138 = fp - 0x138
	let l, m: u64
	try_accounts_11de0(sc8, c, c, d, e)
	const g = ld64(sc8 + 0x10)
	const k = ld64(sc8 + 8)
	const f = ld64(sc8)
	if (f == 0) {
		m = Error_with_account_name(s128, k, g, "whirlpools_config", 0x11)
		l = ld64(s128)
		st64(a + 0x10, ld64(s128 + 8))
		st64(a + 8, l)
		st64(a, 0)
		return m
	}
	st64(s130, g)
	memcpy(s58, sb0, 0x58)
	try_accounts_11718(sc8, c)
	const i = ld64(sc8 + 8)
	const h = ld64(sc8)
	if (h == 2) {
		if (ld8(f + 0x29) == 0) {
			anchor_error_from(s108, 0x7d0 /* anchor::ConstraintMut */)
			m = Error_with_account_name(s118, ld64(s108), ld64(s108 + 8), "whirlpools_config", 0x11)
			l = ld64(s118)
			st64(a + 0x10, ld64(s118 + 8))
			st64(a + 8, l)
			st64(a, 0)
			return m
		}
		const j = ld64(i)
		st64(s138, j)
		if ((memcmp(j, 0x100152d90 /* key GwH3Hiv5mACLX3ufTw1pFsrhSPon5tdw252DBs4Rx4PV */, 0x20) as u32) == 0) {
			m = memcpy(a + 0x18, s58, 0x58)
			st64(a + 0x70, i)
			st64(a + 0x10, ld64(s130))
			st64(a + 8, k)
			st64(a, f)
			return m
		}
		if ((memcmp(ld64(s138), 0x100152db0 /* key AqiJTdr9jLPDAk5prGhWFHtSM1qJszAsdZVV7oeinxhh */, 0x20) as u32) == 0) {
			m = memcpy(a + 0x18, s58, 0x58)
			st64(a + 0x70, i)
			st64(a + 0x10, ld64(s130))
			st64(a + 8, k)
			st64(a, f)
			return m
		}
		anchor_error_from(se8, 0x7d3 /* anchor::ConstraintRaw */)
		m = Error_with_account_name(sf8, ld64(se8), ld64(se8 + 8), 0x100154b87 /* "authority" */, 9)
		l = ld64(sf8)
		st64(a + 0x10, ld64(sf8 + 8))
		st64(a + 8, l)
		st64(a, 0)
		return m
	}
	m = Error_with_account_name(sd8, h, i, 0x100154b87 /* "authority" */, 9)
	l = ld64(sd8)
	st64(a + 0x10, ld64(sd8 + 8))
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
