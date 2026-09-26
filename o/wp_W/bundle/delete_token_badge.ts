// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction delete_token_badge: handler + 14 reachable functions
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
declare function sol_memset(dst: u64, byte: u64, n: u64): void // memset
declare function try_accounts_610(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11de0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_120c0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_12178(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function AccountInfo_assign(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::assign
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp

// instruction handler: delete_token_badge (discriminator sha256("global:delete_token_badge")[..8] = 0xb911751208449235)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, whirlpools_config_extension, token_mint, token_badge, receiver, token_badge_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
function ix_delete_token_badge(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const sd8 = fp - 0xd8, sf0 = fp - 0xf0, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s1f1 = fp - 0x1f1, s208 = fp - 0x208, s218 = fp - 0x218, s220 = fp - 0x220, sff8 = fp - 0xff8
	let i: u64
	sol_log("Instruction: DeleteTokenBadge", 0x1d)
	st64(s1f0, accounts, accounts_len)
	st64(sff8, s1f1)
	let k = accounts_delete_token_badge(sf0, program_id, s1f0, undef, fp)
	const f = ld32(sf0)
	if (f == 2) {
		i = ld64(sf0 + 8)
		st64(a + 8, ld64(sf0 + 0x10))
		st64(a, i)
		return k
	}
	st64(s220, ld32(sf0 + 4))
	const h = ld64(sf0 + 8)
	const g = ld64(sf0 + 0x10)
	memcpy(s1c8, sd8, 0xd8)
	st64(s1d8, h, g)
	st32(s1e0 + 4, ld64(s220))
	st32(s1e0, f)
	if ((ld16(ld64(s1c8 + 0xb8) + 0x6a) & 1) != 0) {
		k = fn_eaae8(s218, s1e0)
		i = ld64(s218)
		st64(a + 8, ld64(s218 + 8))
		st64(a, i)
		return k
	}
	k = fn_87630(s208, 0x42)
	const j = ld64(s208 + 8)
	i = ld64(s208)
	if (i == 2) {
		k = fn_eaae8(s218, s1e0)
		i = ld64(s218)
		st64(a + 8, ld64(s218 + 8))
		st64(a, i)
		return k
	}
	st64(a + 8, j)
	st64(a, i)
	return k
}

// Anchor Accounts::try_accounts of instruction delete_token_badge (called by ix_delete_token_badge; name [str]: from the handler's "Instruction: …" log; was fn_e9688)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, whirlpools_config_extension (ConstraintHasOne), token_mint, token_badge (ConstraintSeeds, ConstraintMut, ConstraintHasOne, ConstraintClose), receiver (AccountNotEnoughKeys, ConstraintMut), token_badge_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: receiver
function accounts_delete_token_badge(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s68 = fp - 0x68, s88 = fp - 0x88, sc0 = fp - 0xc0, s100 = fp - 0x100, s120 = fp - 0x120, s140 = fp - 0x140, s180 = fp - 0x180, s188 = fp - 0x188, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s338 = fp - 0x338, s340 = fp - 0x340, s348 = fp - 0x348, s350 = fp - 0x350, s358 = fp - 0x358, s360 = fp - 0x360, s368 = fp - 0x368, s370 = fp - 0x370, s378 = fp - 0x378, s380 = fp - 0x380, s388 = fp - 0x388, s390 = fp - 0x390, s398 = fp - 0x398
	let m, n, q: u64
	try_accounts_11de0(s1a0, c, c, d, e)
	if (ld64(s1a0) == 0) {
		n = Error_with_account_name(s330, ld64(s1a0 + 8), ld64(s1a0 + 0x10), "whirlpools_config", 0x11)
		m = ld64(s330)
		st64(a + 0x10, ld64(s330 + 8))
		st64(a + 8, m)
		st32(a, 2)
		return n
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	st64(s338, b)
	const g = f != 0 ? sat_sub(f, 0x70) & -8 : 0x300007f90
	if (g > 0x300000007) {
		st64(s340, ld64(e - 0xff8))
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, s1a0, 0x70)
		try_accounts_120c0(s1a0, c)
		if (ld64(s1a0) == 0) {
			n = Error_with_account_name(s320, ld64(s1a0 + 8), ld64(s1a0 + 0x10), "whirlpools_config_extension", 0x1b)
			m = ld64(s320)
			st64(a + 0x10, ld64(s320 + 8))
			st64(a + 8, m)
			st32(a, 2)
			return n
		}
		const h = ld64(0x300000000 /* heap bump-allocator cursor */)
		const i = h != 0 ? sat_sub(h, 0x68) & -8 : 0x300007f98
		if (i > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			memcpy(i, s1a0, 0x68)
			try_accounts_11718(s1a0, c)
			const k = ld64(s1a0 + 8)
			const j = ld64(s1a0)
			if (j == 2) {
				st64(s348, k)
				try_accounts_610(s1a0, c, k)
				const l = ld32(s1a0)
				if (l == 2) {
					n = Error_with_account_name(s310, ld64(s1a0 + 8), ld64(s1a0 + 0x10), 0x100154f57 /* "token_mint" */, 0xa)
					m = ld64(s310)
					st64(a + 0x10, ld64(s310 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				st64(s358, l)
				st64(s370, ld64(s1a0 + 0x10))
				st64(s368, ld64(s1a0 + 8))
				st64(s360, ld32(s1a0 + 4))
				memcpy(s100, s188, 0x40)
				copy(s120, s140, 0x20)
				st64(s350, ld64(s180 + 0x38))
				fn_12178(s1a0, c)
				const o = ld8(s1a0 + 8)
				if (o == 2) {
					n = Error_with_account_name(s300, ld64(s1a0 + 0x10), ld64(s188), "token_badge", 0xb)
					m = ld64(s300)
					st64(a + 0x10, ld64(s300 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				st64(s390, o)
				st32(sc0 + 0x30, ld32(s1a0 + 9))
				st32(sc0 + 0x33, ld32(s1a0 + 0xc))
				st64(s378, ld64(s1a0))
				st64(s380, ld64(s1a0 + 0x10))
				st64(s388, ld64(s188))
				memcpy(sc0, s180, 0x30)
				const p = ld64(c + 8)
				if (p == 0) {
					anchor_error_from(s1c0, 0xbbd /* anchor::AccountNotEnoughKeys */)
					q = ld64(s1c0 + 8)
					const r = ld64(s1c0)
					if (r != 2) {
						n = Error_with_account_name(s1d0, r, q, "receiver", 8)
						m = ld64(s1d0)
						st64(a + 0x10, ld64(s1d0 + 8))
						st64(a + 8, m)
						st32(a, 2)
						return n
					}
				} else {
					st64(c + 8, p - 1)
					q = ld64(c)
					st64(c, q + 0x30)
				}
				st64(s398, q)
				copyr(s20, i + 8, 0x20)
				const s = ld64(ld64(g))
				copyr(s68, s, 0x20)
				if ((memcmp(s20, s68, 0x20) as u32) == 0) {
					const w = ld64(ld64(s348))
					copyr(s20, w, 0x20)
					copyr(s68, i + 0x48, 0x20)
					if ((memcmp(s20, s68, 0x20) as u32) == 0) {
						copyr(s40, s, 0x20)
						const aa = ld64(ld64(s350))
						copyr(s20, aa, 0x20)
						st64(s1a0, 0x100154db3, 0xb, s40, 0x20, s20, 0x20)
						// PDA find_program_address(["token_badge", *s, *aa], program *(ld64(s338)))
						Pubkey_find_program_address(s68, s1a0, 3, ld64(s338))
						copyr(s88, s68, 0x20)
						st8(ld64(s340), ld8(s68 + 0x20))
						const ab = ld64(ld64(s378) /* key */)
						copyr(s1a0, ab, 0x20)
						if ((memcmp(s1a0, s88, 0x20) as u32) == 0) {
							if (ld8(ld64(s378) + 0x29 /* is_writable */) == 0) {
								anchor_error_from(s2e0, 0x7d0 /* anchor::ConstraintMut */)
								n = Error_with_account_name(s2f0, ld64(s2e0), ld64(s2e0 + 8), "token_badge", 0xb)
								m = ld64(s2f0)
								st64(a + 0x10, ld64(s2f0 + 8))
								st64(a + 8, m)
								st32(a, 2)
								return n
							}
							st32(s20 + 3, ld32(sc0 + 0x33))
							st32(s20, ld32(sc0 + 0x30))
							st64(s20 + 0xf, ld64(s388))
							st64(s20 + 7, ld64(s380))
							st64(s20 + 0x17, ld64(sc0))
							st8(s20 + 0x1f, ld8(sc0 + 8))
							const af = ld64(ld64(g))
							copyr(s68, af, 0x20)
							if ((memcmp(s20, s68, 0x20) as u32) == 0) {
								copyr(s68, ab, 0x20)
								const receiver: AccountInfo = ld64(s398)
								const ak = receiver.key
								copyr(s1a0, ak, 0x20)
								if ((memcmp(s68, s1a0, 0x20) as u32) == 0) {
									anchor_error_from(s2c0, 0x7db /* anchor::ConstraintClose */)
									n = Error_with_account_name(s2d0, ld64(s2c0), ld64(s2c0 + 8), "token_badge", 0xb)
									m = ld64(s2d0)
									st64(a + 0x10, ld64(s2d0 + 8))
									st64(a + 8, m)
									st32(a, 2)
									return n
								}
								if (receiver.is_writable == 0) {
									anchor_error_from(s2a0, 0x7d0 /* anchor::ConstraintMut */)
									n = Error_with_account_name(s2b0, ld64(s2a0), ld64(s2a0 + 8), "receiver", 8)
									m = ld64(s2b0)
									st64(a + 0x10, ld64(s2b0 + 8))
									st64(a + 8, m)
									st32(a, 2)
									return n
								}
								memcpy(a + 0x18, s100, 0x40)
								copy(a + 0x60, s120, 0x20)
								st32(a + 0x8c, ld32(sc0 + 0x33))
								st32(a + 0x89, ld32(sc0 + 0x30))
								n = memcpy(a + 0xa0, sc0, 0x30)
								st64(a + 0xe8, receiver)
								st64(a + 0xe0, ld64(s348))
								st64(a + 0xd8, i)
								st64(a + 0xd0, g)
								st64(a + 0x98, ld64(s388))
								st64(a + 0x90, ld64(s380))
								st8(a + 0x88, ld64(s390))
								st64(a + 0x80, ld64(s378))
								st64(a + 0x58, ld64(s350))
								st64(a + 0x10, ld64(s370))
								st64(a + 8, ld64(s368))
								st32(a + 4, ld64(s360))
								st32(a, ld64(s358))
								return n
							}
							anchor_error_from(s270, 0x7d1 /* anchor::ConstraintHasOne */)
							const ai = Error_with_account_name(s280, ld64(s270), ld64(s270 + 8), "token_badge", 0xb)
							const ah = ld64(s280 + 8)
							const ag = ld64(s280)
							copyr(s1a0, s20, 0x20)
							copy(s180, s68, 0x20)
							n = fn_13b5c0(s290, ag, ah, s1a0, ai)
							m = ld64(s290)
							st64(a + 0x10, ld64(s290 + 8))
							st64(a + 8, m)
							st32(a, 2)
							return n
						}
						anchor_error_from(s240, 0x7d6 /* anchor::ConstraintSeeds */)
						const ae = Error_with_account_name(s250, ld64(s240), ld64(s240 + 8), "token_badge", 0xb)
						const ad = ld64(s250 + 8)
						const ac = ld64(s250)
						copyr(s1a0, ab, 0x20)
						copy(s180, s88, 0x20)
						n = fn_13b5c0(s260, ac, ad, s1a0, ae)
						m = ld64(s260)
						st64(a + 0x10, ld64(s260 + 8))
						st64(a + 8, m)
						st32(a, 2)
						return n
					}
					anchor_error_from(s210, 0x7dc /* anchor::ConstraintAddress */)
					const z = Error_with_account_name(s220, ld64(s210), ld64(s210 + 8), "token_badge_authority", 0x15)
					const y = ld64(s220 + 8)
					const x = ld64(s220)
					copyr(s1a0, s20, 0x20)
					copy(s180, s68, 0x20)
					n = fn_13b5c0(s230, x, y, s1a0, z)
					m = ld64(s230)
					st64(a + 0x10, ld64(s230 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				anchor_error_from(s1e0, 0x7d1 /* anchor::ConstraintHasOne */)
				const v = Error_with_account_name(s1f0, ld64(s1e0), ld64(s1e0 + 8), "whirlpools_config_extension", 0x1b)
				const u = ld64(s1f0 + 8)
				const t = ld64(s1f0)
				copyr(s1a0, s20, 0x20)
				copy(s180, s68, 0x20)
				n = fn_13b5c0(s200, t, u, s1a0, v)
				m = ld64(s200)
				st64(a + 0x10, ld64(s200 + 8))
				st64(a + 8, m)
				st32(a, 2)
				return n
			}
			n = Error_with_account_name(s1b0, j, k, "token_badge_authority", 0x15)
			m = ld64(s1b0)
			st64(a + 0x10, ld64(s1b0 + 8))
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

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_badge
function fn_eaae8(a: u64, b: u64): u64 {
	const s8 = fp - 0x8, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	const f: AccountInfo = ld64(b + 0xe8)
	const g: LamportsCell = f.lamports
	const m = f.key
	rc_inc(g)
	const h: DataCell = f.data
	rc_inc(h)
	const l = f.owner
	const k = f.rent_epoch
	const j = f.is_signer
	const i = f.is_writable
	st8(s38 + 2, f.executable)
	st8(s38, j, i)
	st64(s60, m, g, h, l, k)
	const n: AccountInfo = ld64(b + 0x80)
	const o: LamportsCell = n.lamports
	const u = n.key
	rc_inc(o)
	const p: DataCell = n.data
	rc_inc(p)
	const t = n.owner
	const s = n.rent_epoch
	const r = n.is_signer
	const q = n.is_writable
	st8(s8 + 2, n.executable)
	st8(s8, r, q)
	st64(s30, u, o, p, t, s)
	let x = fn_13aee8(s70, s30, s60, p, t)
	const v = ld64(s70)
	if (v == 2) {
		st64(a + 8, undef)
		st64(a, 2)
		return x
	}
	x = Error_with_account_name(s80, v, ld64(s70 + 8), "token_badge", 0xb)
	const w = ld64(s80)
	st64(a + 8, ld64(s80 + 8))
	st64(a, w)
	return x
}

// types [heur]: d: DataCell (every call passes one: fn_8a170, fn_8b758, fn_8d1d0, …)
function fn_13aee8(a: u64, b: u64, c: u64, d: DataCell, e: u64): u64 {
	const s18 = fp - 0x18
	let k = a
	const f = fn_143100(c, b, c, d, e)
	const g = fn_143100(b)
	const h = f > f + g
	if ((h & 1) != 0) {
		fn_1490e8(0x10015acc8, h & 1)
	}
	const i = ld64(c + 8)
	const j = ld64(i + 0x10)
	if (j == 0) {
		const u = k
		st64(i + 0x10, -1)
		const l = ld64(i + 0x18)
		st64(l, f + g)
		st64(i + 0x10, ld64(i + 0x10) + 1)
		const m = ld64(b + 8)
		const n = ld64(m + 0x10)
		if (n == 0) {
			st64(m + 0x10, -1)
			st64(ld64(m + 0x18), 0)
			st64(m + 0x10, ld64(m + 0x10) + 1)
			let o = fn_1434c0(s18, b, 0, AccountInfo_assign(b, 0x100152180, g))
			let q = 2
			if (ld64(s18) != 0x800000000000001a /* Ok */) {
				o = __rust_alloc(0x80, 8)
				k = o
				if (o == 0) {
					alloc_handle_alloc_error(8, 0x80)
				}
				st64(k, 2)
				copy(k + 0x20, s18, 0x18)
				st8(k + 0x38, 2)
				q = 1
			}
			const r = ld64(c + 0x10)
			const p = ld64(c + 8)
			if (rc_release(p)) {
				if (rc_release(p + 8)) {
					o = fn_83078(o)
				}
			}
			if (rc_release(r)) {
				if (rc_release(r + 8)) {
					o = fn_83078(o)
				}
			}
			const t = ld64(b + 0x10)
			const s = ld64(b + 8)
			if (rc_release(s)) {
				if (rc_release(s + 8)) {
					o = fn_83078(o)
				}
			}
			if (!rc_release(t)) {
				st64(u + 8, k)
				st64(u, q)
				return o
			}
			if (!rc_release(t + 8)) {
				st64(u + 8, k)
				st64(u, q)
				return o
			}
			o = fn_83078(o)
			st64(u + 8, k)
			st64(u, q)
			return o
		}
		fn_148658(0x10015ac98, n, l)
	}
	fn_148658(0x10015acb0, i, j)
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

function fn_1434c0(a: u64, b: AccountInfo, c: u64, r0: u64): u64 {
	const f: DataCell = b.data
	if (f.borrow != 0) {
		st64(a + 0x10, f + 0x10)
		st64(a, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		return r0
	}
	f.borrow = -1
	const g = f.len
	if (g == c) {
		st64(a, 0x800000000000001a /* Ok */)
		f.borrow = 0
		return 0x800000000000001a /* Ok */
	}
	if (sat_sub(c, ld32(b.key - 4)) > 0x2800) {
		st64(a, 0x8000000000000013 /* Err(ProgramError::InvalidRealloc) */)
		f.borrow = 0
		return 0x8000000000000013 /* Err(ProgramError::InvalidRealloc) */
	}
	const h = f.ptr
	st64(h - 8, c)
	f.len = c
	st64(f + 0x18, h)
	if (c > g) {
		r0 = sol_memset(h + g, 0, sat_sub(c, g))
		st64(a, 0x800000000000001a /* Ok */)
		f.borrow = f.borrow + 1
		return r0
	}
	st64(a, 0x800000000000001a /* Ok */)
	f.borrow = f.borrow + 1
	return 0x8000000000000013 /* Err(ProgramError::InvalidRealloc) */
}

function fn_83078(r0: u64): u64 {
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), e (value)
function fn_1490e8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_1494c8("called `Option::unwrap()` on a `None` value", 0x2b, a, d, e)
}

function fn_148658(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s1 = fp - 0x1, s18 = fp - 0x18, s48 = fp - 0x48
	st64(s48, 0x10015b890)
	st64(s48 + 0x10, s18)
	st64(s18, s1, BorrowMutError_fmt)
	st64(s48 + 0x20, 0)
	st64(s48 + 8, 1)
	st64(s48 + 0x18, 1)
	// fmt "already borrowed: {}" {} = *s1 [BorrowMutError_fmt]
	fn_149478(s48, a, c, d, e)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: e (value)
function fn_1494c8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s10 = fp - 0x10, s38 = fp - 0x38, s40 = fp - 0x40
	st64(s40, s10)
	st64(s10, a, b)
	st64(s38, 1, 8, 0, 0)
	fn_149478(s40, c, c, s10, e)
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
