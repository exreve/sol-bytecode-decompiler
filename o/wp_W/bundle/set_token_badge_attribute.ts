// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction set_token_badge_attribute: handler + 10 reachable functions
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
declare function try_accounts_610(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function fn_b580(a: u64): u64 // lib uses alloc_handle_alloc_error, Error__new
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11de0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_120c0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_12178(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_1459d0(a: u64): u64 // lib uses repr_bitpacked_kind_from_prim_145358, callx
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fn_14a698(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses callx
declare function fn_14ecd0(a: u64, b: u64, c: u64): u64 // lib "0001020304050607080910111213141516171819…", "0001020304050607080910111213141516171819…"
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp

// instruction handler: set_token_badge_attribute (discriminator sha256("global:set_token_badge_attribute")[..8] = 0x89f6938a214158e0)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, whirlpools_config_extension, token_mint, token_badge, token_badge_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_badge
function ix_set_token_badge_attribute(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s10 = fp - 0x10, s11 = fp - 0x11, s30 = fp - 0x30, s31 = fp - 0x31, s108 = fp - 0x108, s120 = fp - 0x120, s188 = fp - 0x188, s1f0 = fp - 0x1f0, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s250 = fp - 0x250, s258 = fp - 0x258, s260 = fp - 0x260
	let j, k, n, o, p, r, s: u64
	B8: {
		B5: {
			st64(s250, program_id)
			sol_log("Instruction: SetTokenBadgeAttribute", 0x23)
			const f = ix_args_len
			if (f != 0) {
				const g = ix_args
				const h = ld8(g)
				st8(s31, h)
				if (h != 0) {
					st64(s120, 0x100159668)
					st64(s120 + 0x10, s208)
					st64(s208, s31, num_fmt_bae8)
					st64(s108 + 8, 0)
					st64(s120 + 8, 1)
					st64(s108, 1)
					j = s30
				} else {
					if (f == 1) {
						break B5
					}
					const i = ld8(g + 1)
					st8(s11, i)
					if (2 > i) {
						st64(s30, accounts, accounts_len)
						s = accounts_set_token_badge_attribute(s120, g, s30, undef, fp)
						const t = ld32(s120)
						if (t == 2) {
							r = ld64(s120 + 8)
							st64(a + 8, ld64(s120 + 0x10))
							st64(a, r)
							return s
						}
						st64(s258, ld32(s120 + 4))
						st64(s260, ld64(s120 + 8))
						const u = ld64(s120 + 0x10)
						memcpy(s1f0, s108, 0xd0)
						st64(s208 + 0x10, u)
						st64(s208 + 8, ld64(s260))
						st32(s208 + 4, ld64(s258))
						st32(s208, t)
						if ((ld16(ld64(s188 + 0x50) + 0x6a) & 1) == 0) {
							s = fn_87630(s218, 0x42)
							r = ld64(s218)
							if (r != 2) {
								st64(a + 8, ld64(s218 + 8))
								st64(a, r)
								return s
							}
						}
						st8(s188 + 8, i)
						s = fn_7be0(s228, s188, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, ld64(s250))
						const q = ld64(s228)
						if (q != 2) {
							s = Error_with_account_name(s238, q, ld64(s228 + 8), "token_badge", 0xb)
							r = ld64(s238)
							st64(a + 8, ld64(s238 + 8))
							st64(a, r)
							return s
						}
						st64(a + 8, q)
						st64(a, 2)
						return s
					}
					st64(s120, 0x100159620)
					st64(s120 + 0x10, s10)
					st64(s10, s11, fn_14ef78)
					st64(s108 + 8, 0)
					st64(s120 + 8, 1)
					st64(s108, 1)
					j = s208
				}
				fn_147e78(j, s120, h)
				k = fn_b580(j)
				break B8
			}
		}
		k = fn_1459d0(0x100159468)
	}
	const l = k
	if (2 > (k & 3) - 2) {
		s = anchor_error_from(s248, 0x66 /* anchor::InstructionDidNotDeserialize */, n, o, p)
		r = ld64(s248)
		st64(a + 8, ld64(s248 + 8))
		st64(a, r)
		return s
	}
	if ((l & 3) == 0) {
		s = anchor_error_from(s248, 0x66 /* anchor::InstructionDidNotDeserialize */, n, o, p)
		r = ld64(s248)
		st64(a + 8, ld64(s248 + 8))
		st64(a, r)
		return s
	}
	const m = ld64(ld64(k + 7))
	callx(m, ld64(k - 1), m)
	s = anchor_error_from(s248, 0x66 /* anchor::InstructionDidNotDeserialize */)
	r = ld64(s248)
	st64(a + 8, ld64(s248 + 8))
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

// Anchor Accounts::try_accounts of instruction set_token_badge_attribute (called by ix_set_token_badge_attribute; name [str]: from the handler's "Instruction: …" log; was fn_f3c40)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, whirlpools_config_extension (ConstraintHasOne), token_mint, token_badge (ConstraintMut, ConstraintHasOne), token_badge_authority (ConstraintAddress)
function accounts_set_token_badge_attribute(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s6f = fp - 0x6f, s78 = fp - 0x78, sb8 = fp - 0xb8, sd8 = fp - 0xd8, sf8 = fp - 0xf8, s138 = fp - 0x138, s140 = fp - 0x140, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8, s2b0 = fp - 0x2b0, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2c8 = fp - 0x2c8, s2d0 = fp - 0x2d0, s2d8 = fp - 0x2d8
	let m, n: u64
	try_accounts_11de0(s158, c, c, d, e)
	if (ld64(s158) == 0) {
		n = Error_with_account_name(s288, ld64(s158 + 8), ld64(s158 + 0x10), "whirlpools_config", 0x11)
		m = ld64(s288)
		st64(a + 0x10, ld64(s288 + 8))
		st64(a + 8, m)
		st32(a, 2)
		return n
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x70) & -8 : 0x300007f90
	if (g > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, s158, 0x70)
		try_accounts_120c0(s158, c)
		if (ld64(s158) == 0) {
			n = Error_with_account_name(s278, ld64(s158 + 8), ld64(s158 + 0x10), "whirlpools_config_extension", 0x1b)
			m = ld64(s278)
			st64(a + 0x10, ld64(s278 + 8))
			st64(a + 8, m)
			st32(a, 2)
			return n
		}
		const h = ld64(0x300000000 /* heap bump-allocator cursor */)
		const i = h != 0 ? sat_sub(h, 0x68) & -8 : 0x300007f98
		if (i > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			memcpy(i, s158, 0x68)
			try_accounts_11718(s158, c)
			const k = ld64(s158 + 8)
			const j = ld64(s158)
			if (j == 2) {
				st64(s290, k)
				try_accounts_610(s158, c, k)
				const l = ld32(s158)
				if (l == 2) {
					n = Error_with_account_name(s268, ld64(s158 + 8), ld64(s158 + 0x10), 0x100154f57 /* "token_mint" */, 0xa)
					m = ld64(s268)
					st64(a + 0x10, ld64(s268 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				st64(s2a0, l)
				st64(s2b8, ld64(s158 + 0x10))
				st64(s2b0, ld64(s158 + 8))
				st64(s2a8, ld32(s158 + 4))
				memcpy(sb8, s140, 0x40)
				copy(sd8, sf8, 0x20)
				st64(s298, ld64(s138 + 0x38))
				fn_12178(s158, c)
				const o = ld8(s158 + 8)
				if (o == 2) {
					n = Error_with_account_name(s258, ld64(s158 + 0x10), ld64(s140), "token_badge", 0xb)
					m = ld64(s258)
					st64(a + 0x10, ld64(s258 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				st64(s2d8, o)
				st32(s6f + 0x27, ld32(s158 + 9))
				st32(s6f + 0x2a, ld32(s158 + 0xc))
				st64(s2c0, ld64(s158))
				st64(s2c8, ld64(s158 + 0x10))
				st64(s2d0, ld64(s140))
				memcpy(s78, s138, 0x30)
				copyr(s40, i + 8, 0x20)
				const p = ld64(ld64(g))
				copyr(s20, p, 0x20)
				if ((memcmp(s40, s20, 0x20) as u32) == 0) {
					const t = ld64(ld64(s290))
					copyr(s40, t, 0x20)
					copyr(s20, i + 0x48, 0x20)
					if ((memcmp(s40, s20, 0x20) as u32) == 0) {
						if (ld8(ld64(s2c0) + 0x29) == 0) {
							anchor_error_from(s238, 0x7d0 /* anchor::ConstraintMut */)
							n = Error_with_account_name(s248, ld64(s238), ld64(s238 + 8), "token_badge", 0xb)
							m = ld64(s248)
							st64(a + 0x10, ld64(s248 + 8))
							st64(a + 8, m)
							st32(a, 2)
							return n
						}
						st32(s40 + 3, ld32(s6f + 0x2a))
						st32(s40, ld32(s6f + 0x27))
						st64(s40 + 0xf, ld64(s2d0))
						st64(s40 + 7, ld64(s2c8))
						st64(s40 + 0x17, ld64(s78))
						st8(s40 + 0x1f, ld8(s78 + 8))
						copyr(s20, p, 0x20)
						if ((memcmp(s40, s20, 0x20) as u32) != 0) {
							anchor_error_from(s1d8, 0x7d1 /* anchor::ConstraintHasOne */)
							const ae = Error_with_account_name(s1e8, ld64(s1d8), ld64(s1d8 + 8), "token_badge", 0xb)
							const ad = ld64(s1e8 + 8)
							const ac = ld64(s1e8)
							copy(s158, s40, 0x40)
							n = fn_13b5c0(s1f8, ac, ad, s158, ae)
							m = ld64(s1f8)
							st64(a + 0x10, ld64(s1f8 + 8))
							st64(a + 8, m)
							st32(a, 2)
							return n
						}
						copyr(s40, s6f, 0x20)
						const x = ld64(s298)
						const y = ld64(x)
						copyr(s20, y, 0x20)
						if ((memcmp(s40, s20, 0x20) as u32) == 0) {
							memcpy(a + 0x18, sb8, 0x40)
							copy(a + 0x60, sd8, 0x20)
							st32(a + 0x8c, ld32(s6f + 0x2a))
							st32(a + 0x89, ld32(s6f + 0x27))
							n = memcpy(a + 0xa0, s78, 0x30)
							st64(a + 0xe0, ld64(s290))
							st64(a + 0xd8, i)
							st64(a + 0xd0, g)
							st64(a + 0x98, ld64(s2d0))
							st64(a + 0x90, ld64(s2c8))
							st8(a + 0x88, ld64(s2d8))
							st64(a + 0x80, ld64(s2c0))
							st64(a + 0x58, x)
							st64(a + 0x10, ld64(s2b8))
							st64(a + 8, ld64(s2b0))
							st32(a + 4, ld64(s2a8))
							st32(a, ld64(s2a0))
							return n
						}
						anchor_error_from(s208, 0x7d1 /* anchor::ConstraintHasOne */)
						const ab = Error_with_account_name(s218, ld64(s208), ld64(s208 + 8), "token_badge", 0xb)
						const aa = ld64(s218 + 8)
						const z = ld64(s218)
						copyr(s158, s6f, 0x20)
						copy(s138, s20, 0x20)
						n = fn_13b5c0(s228, z, aa, s158, ab)
						m = ld64(s228)
						st64(a + 0x10, ld64(s228 + 8))
						st64(a + 8, m)
						st32(a, 2)
						return n
					}
					anchor_error_from(s1a8, 0x7dc /* anchor::ConstraintAddress */)
					const w = Error_with_account_name(s1b8, ld64(s1a8), ld64(s1a8 + 8), "token_badge_authority", 0x15)
					const v = ld64(s1b8 + 8)
					const u = ld64(s1b8)
					copy(s158, s40, 0x40)
					n = fn_13b5c0(s1c8, u, v, s158, w)
					m = ld64(s1c8)
					st64(a + 0x10, ld64(s1c8 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				anchor_error_from(s178, 0x7d1 /* anchor::ConstraintHasOne */)
				const s = Error_with_account_name(s188, ld64(s178), ld64(s178 + 8), "whirlpools_config_extension", 0x1b)
				const r = ld64(s188 + 8)
				const q = ld64(s188)
				copy(s158, s40, 0x40)
				n = fn_13b5c0(s198, q, r, s158, s)
				m = ld64(s198)
				st64(a + 0x10, ld64(s198 + 8))
				st64(a + 8, m)
				st32(a, 2)
				return n
			}
			n = Error_with_account_name(s168, j, k, "token_badge_authority", 0x15)
			m = ld64(s168)
			st64(a + 0x10, ld64(s168 + 8))
			st64(a + 8, m)
			st32(a, 2)
			return n
		}
		alloc_handle_alloc_error(8, 0x68)
	}
	alloc_handle_alloc_error(8, 0x70)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_7be0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40
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
		g = fn_13ae08(s20, 0x100151f28, 8)
		if (g == 0) {
			g = fn_13ae08(s20, b + 9, 0x20)
			if (g == 0) {
				g = fn_13ae08(s20, b + 0x29, 0x20)
				if (g == 0) {
					st8(s1, ld8(b + 8))
					g = fn_13ae08(s20, s1, 1)
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
