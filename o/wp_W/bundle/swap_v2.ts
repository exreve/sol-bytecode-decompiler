// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction swap_v2: handler + 41 reachable functions
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
interface Mint extends sized<0x60> { // Account<Mint> (anchor_spl, SPL Token Mint) as unpacked in memory (fields [known: spl_token::state layout] at the offsets a run of try_accounts_11e98 put them [offsets from exec]; info = the &AccountInfo)
	mint_authority:   at<0x04, Pubkey> // COption<Pubkey>
	supply:           at<0x28, u64>
	decimals:         at<0x30, u8>
	freeze_authority: at<0x38, Pubkey> // COption<Pubkey>
	info:             at<0x58, ref<AccountInfo>> // &AccountInfo
}
interface TokenAccount_2 extends sized<0xd8> { // Account<TokenAccount> (anchor_spl, SPL Token Account) as unpacked in memory (fields [known: spl_token::state layout] at the offsets a run of try_accounts_558 put them [offsets from exec]; info = the &AccountInfo)
	info:             at<0x20, ref<AccountInfo>> // &AccountInfo
	mint:             at<0x28, Pubkey>
	owner:            at<0x48, Pubkey>
	amount:           at<0x68, u64>
	delegate:         at<0x74, Pubkey> // COption<Pubkey>
	is_native:        at<0xa0, u64> // COption<u64>
	delegated_amount: at<0xa8, u64>
	close_authority:  at<0xb4, Pubkey> // COption<Pubkey>
}
interface SwapV2Accounts { // Accounts struct of instruction swap_v2 as accounts_swap_v2 returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	token_mint_a:          at<0x00, Mint> // Account<Mint> in place
	token_mint_b:          at<0x80, Mint> // Account<Mint> in place
	token_program_a:       at<0x100, ref<AccountInfo>>
	token_authority:       at<0x118, ref<AccountInfo>>
	token_owner_account_a: at<0x128, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	token_vault_a:         at<0x130, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	token_owner_account_b: at<0x138, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	token_vault_b:         at<0x140, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	oracle:                at<0x160, ref<AccountInfo>>
}
interface SwapV2Context { // anchor_lang Context of instruction swap_v2 (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<SwapV2Accounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_log_data(slices: u64, len: u64): void // log base64 data: slices = &[&[u8]]
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function sol_memmove(dst: u64, src: u64, n: u64): void // memmove
declare function sol_memset(dst: u64, byte: u64, n: u64): void // memset
declare function try_accounts_120(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_558(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::interface_account::InterfaceAccount<T> as anchor_lang::Accounts<B>…
declare function try_accounts_610(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function fn_b580(a: u64): u64 // lib uses alloc_handle_alloc_error, Error__new
declare function fn_c710(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_e248(a: u64, b: u64, r0: u64): void // lib uses memmove, memcpy
declare function fn_e368(a: u64, b: u64): u64 // lib uses alloc_handle_alloc_error
declare function fn_e478(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function fn_e968(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): void // lib uses raw_vec_handle_error
declare function fn_f060(a: u64, b: u64, r0: u64): void // lib uses raw_vec_handle_error
declare function fn_f658(a: u64, b: u64): u64 // lib
declare function AccountInfo_clone(a: u64, b: u64): void // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11a48(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_12e0b0(a: u64, b: u64): u64 // lib
declare function fn_12e558(a: u64, b: u64, c: u64, r0: u64): u64 // lib
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function clock_get_13f308(a: u64): u64 // lib solana_sysvar::clock::<impl solana_sysvar::Sysvar for solana_clock::Clock>::get
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function fn_1459d0(a: u64): u64 // lib uses repr_bitpacked_kind_from_prim_145358, callx
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fn_14a698(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses callx
declare function fn_14ecd0(a: u64, b: u64, c: u64): u64 // lib "0001020304050607080910111213141516171819…", "0001020304050607080910111213141516171819…"
declare function imp_fmt(a: u64, b: u64): u64 // lib core::fmt::num::imp::<impl core::fmt::Display for i32>::fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function __udivti3(a: u64, b: u64, c: u64, d: u64, e: u64, r8: u64): u64 // lib __udivti3
declare function __multi3(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __multi3 [heur] u128 multiply: *out = a * b (mod 2^128), a = (a_lo, a_hi), b = (b_lo, b_hi) [exec: on 31 operand pairs]
declare function fn_151b50(a: u64, b: u64): u64 // lib
declare function fn_151bf8(a: u64, b: u64): u64 // lib

// instruction handler: swap_v2 (discriminator sha256("global:swap_v2")[..8] = 0x621ec91a0bed042b)
// accounts [str: the program's account-error strings, in order of first use]: token_program_a, whirlpool, token_mint_a, token_mint_b, tick_array_0, tick_array_1, tick_array_2, oracle, token_owner_account_a, token_vault_a, token_owner_account_b, token_vault_b, token_program_b, token_authority, memo_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
function ix_swap_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s170 = fp - 0x170, s178 = fp - 0x178, s188 = fp - 0x188, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s1000 = fp - 0x1000
	let l, o, p, q, r, s: u64
	B9: {
		B8: {
			sol_log("Instruction: SwapV2", 0x13)
			const f = ix_args
			st64(s300, f)
			const g = ix_args_len
			if (g >= 8 && ((g & -8) != 8 && ((g & -0x10) != 0x10 && g != 0x20))) {
				let i = ld64(f)
				const j = ld64(f + 8)
				const t = ld64(f + 0x18)
				const k = ld64(f + 0x10)
				const h = ld8(f + 0x20)
				st8(s1, h)
				if (2 > h) {
					if (g == 0x21) {
						break B8
					}
					const ac = i
					i = ld8(f + 0x21)
					st64(s300, f + 0x22, g - 0x22)
					st8(s1, i)
					const ab = i
					if (2 > i) {
						fn_11150(s188, s300)
						l = ld64(s188 + 8)
						const u = ld64(s188)
						if (u != 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
							const aa = l
							const z = ld64(s178)
							st8(s1, 0xff)
							st64(s300, accounts, accounts_len)
							st64(s1000 + 8, s1)
							s = accounts_swap_v2(s188, program_id, s300, p, fp)
							const v = ld32(s188)
							if (v == 2) {
								r = ld64(s188 + 8)
								st64(a + 8, ld64(s178))
								st64(a, r)
								return s
							}
							const y = ld32(s188 + 4)
							const x = ld64(s188 + 8)
							const w = ld64(s178)
							memcpy(s2d8, s170, 0x150)
							st64(s2e8, x, w)
							st32(s2f0, v, y)
							st8(s170 + 8, ld8(s1))
							copyr(s178, s300, 0x10)
							st64(s188, program_id, s2f0)
							st64(s20, u, aa, z)
							st64(s1000, k, t, h != 0, ab != 0, s20)
							s = fn_3d688(s310, s188, ac, j, k, t, h != 0, ab != 0, s20)
							r = ld64(s310)
							if (r != 2) {
								st64(a + 8, ld64(s310 + 8))
								st64(a, r)
								return s
							}
							s = fn_e42f8(s320, s2f0, program_id)
							r = ld64(s320)
							st64(a + 8, ld64(s320 + 8))
							st64(a, r)
							return s
						}
						break B9
					}
				}
				st64(s188, 0x100159620)
				st64(s178, s20)
				st64(s20, s1, fn_14ef78)
				st64(s170 + 8, 0)
				st64(s188 + 8, 1)
				st64(s170, 1)
				// fmt "Invalid bool representation: {}" {} = *s1 [fn_14ef78]
				fn_147e78(s2f0, s188, i, j, k)
				l = fn_b580(s2f0)
				break B9
			}
		}
		l = fn_1459d0(0x100159468)
	}
	const m = l
	if (2 > (l & 3) - 2) {
		s = anchor_error_from(s330, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		r = ld64(s330)
		st64(a + 8, ld64(s330 + 8))
		st64(a, r)
		return s
	}
	if ((m & 3) == 0) {
		s = anchor_error_from(s330, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		r = ld64(s330)
		st64(a + 8, ld64(s330 + 8))
		st64(a, r)
		return s
	}
	const n = ld64(ld64(l + 7))
	callx(n, ld64(l - 1), n)
	s = anchor_error_from(s330, 0x66 /* anchor::InstructionDidNotDeserialize */)
	r = ld64(s330)
	st64(a + 8, ld64(s330 + 8))
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_11150(a: u64, b: u64) {
	const s10 = fp - 0x10, s40 = fp - 0x40, s58 = fp - 0x58, s59 = fp - 0x59, s70 = fp - 0x70, s78 = fp - 0x78, s90 = fp - 0x90, s91 = fp - 0x91
	let z: u64
	let k = a
	const f = ld64(b + 8)
	if (f == 0) {
		z = fn_1459d0(0x100159468)
		st64(k, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, z)
	} else {
		const g = ld64(b)
		const h = ld8(g)
		st64(b + 8, f - 1)
		st64(b, g + 1)
		st8(s91, h)
		if (h == 0) {
			st64(k, 0x8000000000000000)
		} else if (h == 1) {
			if (5 > f) {
				z = fn_1459d0(0x100159468)
				st64(k, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, z)
			} else {
				const i = ld32(g + 1)
				st64(b + 8, f - 5)
				st64(b, g + 5)
				let p = 0
				if (i != 0) {
					const j = ld64(0x300000000 /* heap bump-allocator cursor */)
					const l = j != 0 ? j : 0x300008000
					const aa = k
					const m = l - (min(i, 0x800) << 1)
					let n = m > l ? 0 : m
					if (0x300000008 > n) {
						raw_vec_handle_error(1, min(i, 0x800) << 1, min(i, 0x800) << 1, min(i, 0x800), 0x300000008)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, n)
					st64(s78, min(i, 0x800))
					let q = 0
					st64(s70, n, 0)
					let o = f - 5
					let w = o
					let v = g + 5
					const ab = b
					while (true) {
						if (o == q) {
							z = fn_1459d0(0x100159468)
							st64(aa, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, z)
							return
						}
						const y = v + q
						const x = w
						const t = ld8(y)
						st64(b + 8, w - 1)
						st64(b, y + 1)
						st8(s59, t)
						if (t >= 0xd) {
							st64(s40, 0x100159668)
							st64(s40 + 0x10, s10)
							st64(s10, s59, num_fmt_bae8)
							st64(s40 + 0x20, 0)
							st64(s40 + 8, 1)
							st64(s40 + 0x18, 1)
							// fmt "Unexpected variant index: {}" {} = t [num_fmt_bae8]
							fn_147e78(s58, s40, y + 1, x - 1, o)
							z = fn_b580(s58)
							st64(aa, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, z)
							return
						}
						if (x == 1) {
							z = fn_1459d0(0x100159468)
							st64(aa, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, z)
							return
						}
						const s = ld8(y + 1)
						st64(b, y + 2)
						w = w - 2
						st64(b + 8, w)
						if (p == ld64(s78)) {
							fn_eef8(s78, b, v)
							v = g + 5
							o = f - 5
							b = ab
							n = ld64(s70)
						}
						p = p + 1
						const r = n + q
						st8(r + 1, s)
						st8(r, t)
						st64(s70 + 8, p)
						q = q + 2
						if (p >= i) {
							z = ld64(s70)
							const u = ld64(s78)
							k = aa
							if (u == 0x8000000000000000) {
								st64(k, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, z)
								return
							}
							st64(k + 0x10, p)
							st64(k + 8, z)
							st64(k, u)
							return
						}
					}
				}
				st64(k + 0x10, 0)
				st64(k + 8, 1)
				st64(k, 0)
			}
		} else {
			st64(s40, 0x1001596d8)
			st64(s40 + 0x10, s58)
			st64(s58, s91, fn_14ef78)
			st64(s40 + 0x20, 0)
			st64(s40 + 8, 2)
			st64(s40 + 0x18, 1)
			// fmt "Invalid Option representation: {}. The first byte must be 0 or 1" {} = h [fn_14ef78]
			fn_147e78(s90, s40, g + 1, f, g)
			st64(k + 8, fn_b580(s90))
			st64(k, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
		}
	}
}

// Anchor Accounts::try_accounts of instruction swap_v2 (called by ix_swap_v2; name [str]: from the handler's "Instruction: …" log; was fn_e1d88)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_program_a (ConstraintAddress), whirlpool (ConstraintMut), token_mint_a (ConstraintAddress), token_mint_b (ConstraintAddress), tick_array_0 (AccountNotEnoughKeys, ConstraintMut), tick_array_1 (ConstraintMut), tick_array_2 (ConstraintMut), oracle (ConstraintSeeds, ConstraintMut), token_owner_account_a (ConstraintMut, ConstraintRaw), token_vault_a (ConstraintMut, ConstraintAddress), token_owner_account_b (ConstraintMut, ConstraintRaw), token_vault_b (ConstraintMut, ConstraintAddress), token_program_b (ConstraintAddress), token_authority, memo_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: token_owner_account_a_box, token_vault_a_box, token_owner_account_b_box, token_vault_b_box, token_program_a, whirlpool, token_vault_a, token_vault_b, oracle
function accounts_swap_v2(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s230 = fp - 0x230, s270 = fp - 0x270, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2d0 = fp - 0x2d0, s2f0 = fp - 0x2f0, s330 = fp - 0x330, s350 = fp - 0x350, s390 = fp - 0x390, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s510 = fp - 0x510, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s560 = fp - 0x560, s570 = fp - 0x570, s580 = fp - 0x580, s590 = fp - 0x590, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s700 = fp - 0x700, s710 = fp - 0x710, s720 = fp - 0x720, s730 = fp - 0x730, s740 = fp - 0x740, s750 = fp - 0x750, s760 = fp - 0x760, s770 = fp - 0x770, s780 = fp - 0x780, s790 = fp - 0x790, s7e0 = fp - 0x7e0, s808 = fp - 0x808, s810 = fp - 0x810, s818 = fp - 0x818, s820 = fp - 0x820, s828 = fp - 0x828, s830 = fp - 0x830, s838 = fp - 0x838, s840 = fp - 0x840, s848 = fp - 0x848
	let aa, ab, ad, ae, af, ah, aj, al, cj: u64
	st64(s7e0 + 0x48, b)
	try_accounts_120(s290, c, c, d, e)
	const token_program_a: AccountInfo = ld64(s288)
	const f = ld64(s290)
	if (f != 2) {
		af = Error_with_account_name(s3c0, f, token_program_a, "token_program_a", 0xf)
		ae = ld64(s3c0)
		st64(a + 0x10, ld64(s3c0 + 8))
		st64(a + 8, ae)
		st32(a, 2)
		return af
	}
	const bz = ld64(e - 0xff8)
	try_accounts_120(s290, c)
	const h = ld64(s288)
	const g = ld64(s290)
	if (g == 2) {
		st64(s7e0 + 0x40, h)
		fn_12758(s290, c, h)
		const j = ld64(s288)
		const i = ld64(s290)
		if (i == 2) {
			st64(s7e0 + 0x38, j)
			try_accounts_11718(s290, c, j)
			const l = ld64(s288)
			const k = ld64(s290)
			if (k == 2) {
				st64(s7e0 + 0x30, l)
				try_accounts_11a48(s290, c, l)
				if (ld64(s290) == 0) {
					af = Error_with_account_name(s790, ld64(s288), ld64(s288 + 8), 0x100152b28 /* "whirlpool" */, 9)
					ae = ld64(s790)
					st64(a + 0x10, ld64(s790 + 8))
					st64(a + 8, ae)
					st32(a, 2)
					return af
				}
				const m = ld64(0x300000000 /* heap bump-allocator cursor */)
				const n = m != 0 ? sat_sub(m, 0x290) & -8 : 0x300007d70
				if (n > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, n)
					st64(s7e0 + 0x28, n)
					memcpy(n, s290, 0x290)
					try_accounts_610(s290, c)
					const p = ld32(s290)
					if (p == 2) {
						af = Error_with_account_name(s780, ld64(s288), ld64(s288 + 8), "token_mint_a", 0xc)
						ae = ld64(s780)
						st64(a + 0x10, ld64(s780 + 8))
						st64(a + 8, ae)
						st32(a, 2)
						return af
					}
					st64(s7e0 + 0x18, p)
					copyr(s7e0, s288, 0x10)
					st64(s7e0 + 0x10, ld32(s290 + 4))
					memcpy(s390, s278, 0x40)
					copy(s3b0, s230, 0x20)
					st64(s7e0 + 0x20, ld64(s270 + 0x38))
					try_accounts_610(s290, c)
					const q = ld32(s290)
					if (q == 2) {
						af = Error_with_account_name(s770, ld64(s288), ld64(s288 + 8), "token_mint_b", 0xc)
						ae = ld64(s770)
						st64(a + 0x10, ld64(s770 + 8))
						st64(a + 8, ae)
						st32(a, 2)
						return af
					}
					st64(s808 + 0x18, q)
					copyr(s808, s288, 0x10)
					st64(s808 + 0x10, ld32(s290 + 4))
					memcpy(s330, s278, 0x40)
					copy(s350, s230, 0x20)
					st64(s808 + 0x20, ld64(s270 + 0x38))
					fn_2258(s290, c)
					const token_owner_account_a_box: TokenAccount_2 = ld64(s288)
					const r = ld64(s290)
					if (r == 2) {
						st64(s810, token_owner_account_a_box)
						fn_2258(s290, c, token_owner_account_a_box)
						const token_vault_a_box: TokenAccount_2 = ld64(s288)
						const t = ld64(s290)
						if (t == 2) {
							st64(s818, token_vault_a_box)
							fn_2258(s290, c, token_vault_a_box)
							const token_owner_account_b_box: TokenAccount_2 = ld64(s288)
							const v = ld64(s290)
							if (v == 2) {
								st64(s820, token_owner_account_b_box)
								fn_2258(s290, c, token_owner_account_b_box)
								const token_vault_b_box: TokenAccount_2 = ld64(s288)
								const x = ld64(s290)
								if (x == 2) {
									B36: {
										B32: {
											B31: {
												const z = ld64(c + 8)
												st64(s828, token_vault_b_box)
												if (z != 0) {
													ad = ld64(c)
													st64(c, ad + 0x30, z - 1)
													if (z != 1) {
														st64(s830, ad)
														ah = ld64(c)
														st64(c, ah + 0x30, z - 2)
														if (z != 2) {
															st64(s838, ah)
															aj = ld64(c)
															st64(c, aj + 0x30, z - 3)
															if (z == 3) {
																break B32
															}
															st64(s840, aj)
															st64(c + 8, z - 4)
															al = ld64(c)
															st64(c, al + 0x30)
															break B36
														}
														break B31
													}
												} else {
													anchor_error_from(s440, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_b_box, aa, ab)
													ad = ld64(s440 + 8)
													const ac = ld64(s440)
													if (ac != 2) {
														af = Error_with_account_name(s450, ac, ad, "tick_array_0", 0xc)
														ae = ld64(s450)
														st64(a + 0x10, ld64(s450 + 8))
														st64(a + 8, ae)
														st32(a, 2)
														return af
													}
												}
												st64(s830, ad)
												anchor_error_from(s460, 0xbbd /* anchor::AccountNotEnoughKeys */, ad, aa, ab)
												ah = ld64(s460 + 8)
												const ag = ld64(s460)
												if (ag != 2) {
													af = Error_with_account_name(s470, ag, ah, "tick_array_1", 0xc)
													ae = ld64(s470)
													st64(a + 0x10, ld64(s470 + 8))
													st64(a + 8, ae)
													st32(a, 2)
													return af
												}
											}
											st64(s838, ah)
											anchor_error_from(s480, 0xbbd /* anchor::AccountNotEnoughKeys */, ah, aa, ab)
											aj = ld64(s480 + 8)
											const ai = ld64(s480)
											if (ai != 2) {
												af = Error_with_account_name(s490, ai, aj, "tick_array_2", 0xc)
												ae = ld64(s490)
												st64(a + 0x10, ld64(s490 + 8))
												st64(a + 8, ae)
												st32(a, 2)
												return af
											}
										}
										st64(s840, aj)
										anchor_error_from(s4a0, 0xbbd /* anchor::AccountNotEnoughKeys */, aj, aa, ab)
										al = ld64(s4a0 + 8)
										const ak = ld64(s4a0)
										if (ak != 2) {
											af = Error_with_account_name(s4b0, ak, al, 0x100154c38 /* "oracle" */, 6)
											ae = ld64(s4b0)
											st64(a + 0x10, ld64(s4b0 + 8))
											st64(a + 8, ae)
											st32(a, 2)
											return af
										}
									}
									const oracle: AccountInfo = al
									const am = token_program_a.key
									copyr(s2d0, am, 0x20)
									AccountInfo_clone(s290, ld64(s7e0 + 0x20))
									const an = ld64(s278)
									copy(s2b0, an, 0x20)
									const ap = ld64(s288 + 8)
									const ao = ld64(s288)
									rc_dec(ao)
									rc_dec(ap)
									if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
										const au = ld64(ld64(s7e0 + 0x40))
										copyr(s2d0, au, 0x20)
										AccountInfo_clone(s290, ld64(s808 + 0x20))
										const av = ld64(s278)
										copy(s2b0, av, 0x20)
										const ax = ld64(s288 + 8)
										const aw = ld64(s288)
										rc_dec(aw)
										rc_dec(ax)
										if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
											const whirlpool: AccountInfo = ld64(ld64(s7e0 + 0x28))
											st64(s848, whirlpool)
											if (whirlpool.is_writable == 0) {
												anchor_error_from(s750, 0x7d0 /* anchor::ConstraintMut */)
												af = Error_with_account_name(s760, ld64(s750), ld64(s750 + 8), 0x100152b28 /* "whirlpool" */, 9)
												ae = ld64(s760)
												st64(a + 0x10, ld64(s760 + 8))
												st64(a + 8, ae)
												st32(a, 2)
												return af
											}
											const bc = ld64(ld64(s7e0 + 0x20))
											copyr(s2d0, bc, 0x20)
											const bd = ld64(s7e0 + 0x28)
											copyr(s2b0, bd + 0x1a8, 0x20)
											if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
												anchor_error_from(s520, 0x7dc /* anchor::ConstraintAddress */)
												const bl = Error_with_account_name(s530, ld64(s520), ld64(s520 + 8), "token_mint_a", 0xc)
												const bk = ld64(s530 + 8)
												const bj = ld64(s530)
												copy(s290, s2d0, 0x40)
												af = fn_13b5c0(s540, bj, bk, s290, bl)
												ae = ld64(s540)
												st64(a + 0x10, ld64(s540 + 8))
												st64(a + 8, ae)
												st32(a, 2)
												return af
											}
											const be = ld64(ld64(s808 + 0x20))
											copyr(s2d0, be, 0x20)
											const bf = ld64(s7e0 + 0x28)
											copyr(s2b0, bf + 0x1e8, 0x20)
											if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
												if (ld8(ld64(ld64(s810) + 0x20) + 0x29) == 0) {
													anchor_error_from(s730, 0x7d0 /* anchor::ConstraintMut */)
													af = Error_with_account_name(s740, ld64(s730), ld64(s730 + 8), "token_owner_account_a", 0x15)
													ae = ld64(s740)
													st64(a + 0x10, ld64(s740 + 8))
													st64(a + 8, ae)
													st32(a, 2)
													return af
												}
												if ((memcmp(ld64(s810) + 0x28, ld64(s7e0 + 0x28) + 0x1a8, 0x20) as u32) == 0) {
													const token_vault_a: AccountInfo = ld64(ld64(s818) + 0x20)
													if (token_vault_a.is_writable != 0) {
														const bn = token_vault_a.key
														copyr(s2d0, bn, 0x20)
														const bo = ld64(s7e0 + 0x28)
														copyr(s2b0, bo + 0x1c8, 0x20)
														if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
															anchor_error_from(s5a0, 0x7dc /* anchor::ConstraintAddress */)
															const br = Error_with_account_name(s5b0, ld64(s5a0), ld64(s5a0 + 8), "token_vault_a", 0xd)
															const bq = ld64(s5b0 + 8)
															const bp = ld64(s5b0)
															copy(s290, s2d0, 0x40)
															af = fn_13b5c0(s5c0, bp, bq, s290, br)
															ae = ld64(s5c0)
															st64(a + 0x10, ld64(s5c0 + 8))
															st64(a + 8, ae)
															st32(a, 2)
															return af
														}
														if (ld8(ld64(ld64(s820) + 0x20) + 0x29) == 0) {
															anchor_error_from(s6f0, 0x7d0 /* anchor::ConstraintMut */)
															af = Error_with_account_name(s700, ld64(s6f0), ld64(s6f0 + 8), "token_owner_account_b", 0x15)
															ae = ld64(s700)
															st64(a + 0x10, ld64(s700 + 8))
															st64(a + 8, ae)
															st32(a, 2)
															return af
														}
														if ((memcmp(ld64(s820) + 0x28, ld64(s7e0 + 0x28) + 0x1e8, 0x20) as u32) == 0) {
															const token_vault_b: AccountInfo = ld64(ld64(s828) + 0x20)
															if (token_vault_b.is_writable != 0) {
																const bt = token_vault_b.key
																copyr(s2d0, bt, 0x20)
																const bu = ld64(s7e0 + 0x28)
																copyr(s2b0, bu + 0x208, 0x20)
																if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
																	anchor_error_from(s5f0, 0x7dc /* anchor::ConstraintAddress */)
																	const bx = Error_with_account_name(s600, ld64(s5f0), ld64(s5f0 + 8), "token_vault_b", 0xd)
																	const bw = ld64(s600 + 8)
																	const bv = ld64(s600)
																	copy(s290, s2d0, 0x40)
																	af = fn_13b5c0(s610, bv, bw, s290, bx)
																	ae = ld64(s610)
																	st64(a + 0x10, ld64(s610 + 8))
																	st64(a + 8, ae)
																	st32(a, 2)
																	return af
																}
																if (ld8(ld64(s830) + 0x29) == 0) {
																	anchor_error_from(s6b0, 0x7d0 /* anchor::ConstraintMut */)
																	af = Error_with_account_name(s6c0, ld64(s6b0), ld64(s6b0 + 8), "tick_array_0", 0xc)
																	ae = ld64(s6c0)
																	st64(a + 0x10, ld64(s6c0 + 8))
																	st64(a + 8, ae)
																	st32(a, 2)
																	return af
																}
																if (ld8(ld64(s838) + 0x29) != 0) {
																	if (ld8(ld64(s840) + 0x29) != 0) {
																		const by = ld64(ld64(s848))
																		copyr(s2b0, by, 0x20)
																		st64(s2d0, 0x100154c38, 6, s2b0, 0x20)
																		// PDA find_program_address(["oracle", *by], program *(ld64(s7e0 + 0x48)))
																		Pubkey_find_program_address(s290, s2d0, 2, ld64(s7e0 + 0x48))
																		copyr(s2f0, s290, 0x20)
																		st8(bz, ld8(s270))
																		const cb = oracle.key
																		copyr(s290, cb, 0x20)
																		if ((memcmp(s290, s2f0, 0x20) as u32) != 0) {
																			anchor_error_from(s620, 0x7d6 /* anchor::ConstraintSeeds */)
																			const ci = Error_with_account_name(s630, ld64(s620), ld64(s620 + 8), 0x100154c38 /* "oracle" */, 6)
																			const ch = ld64(s630 + 8)
																			const cg = ld64(s630)
																			copyr(s290, cb, 0x20)
																			copy(s270, s2f0, 0x20)
																			af = fn_13b5c0(s640, cg, ch, s290, ci)
																			cj = ld64(s640 + 8)
																			st64(a + 8, ld64(s640))
																			st64(a + 0x10, cj)
																			st32(a, 2)
																			return af
																		}
																		if (oracle.is_writable == 0) {
																			anchor_error_from(s650, 0x7d0 /* anchor::ConstraintMut */)
																			af = Error_with_account_name(s660, ld64(s650), ld64(s650 + 8), 0x100154c38 /* "oracle" */, 6)
																			cj = ld64(s660 + 8)
																			st64(a + 8, ld64(s660))
																			st64(a + 0x10, cj)
																			st32(a, 2)
																			return af
																		}
																		memcpy(a + 0x18, s390, 0x40)
																		copy(a + 0x60, s3b0, 0x20)
																		af = memcpy(a + 0x98, s330, 0x40)
																		const cf = ld64(s350 + 0x18)
																		const ce = ld64(s350 + 0x10)
																		const cd = ld64(s350 + 8)
																		const cc = ld64(s350)
																		copy(a + 8, s7e0, 0x10)
																		st64(a + 0x58, ld64(s7e0 + 0x20))
																		copy(a + 0x88, s808, 0x10)
																		st64(a + 0xd8, ld64(s808 + 0x20))
																		st64(a + 0x100, token_program_a)
																		st64(a + 0x108, ld64(s7e0 + 0x40))
																		st64(a + 0x110, ld64(s7e0 + 0x38))
																		st64(a + 0x118, ld64(s7e0 + 0x30))
																		st64(a + 0x120, ld64(s7e0 + 0x28))
																		st64(a + 0x128, ld64(s810))
																		st64(a + 0x130, ld64(s818))
																		st64(a + 0x138, ld64(s820))
																		st64(a + 0x140, ld64(s828))
																		st64(a + 0x148, ld64(s830))
																		st64(a + 0x150, ld64(s838))
																		st64(a + 0x158, ld64(s840))
																		st64(a + 0x160, oracle)
																		st32(a + 0x84, ld64(s808 + 0x10))
																		st32(a + 0x80, ld64(s808 + 0x18))
																		st32(a + 4, ld64(s7e0 + 0x10))
																		st32(a, ld64(s7e0 + 0x18))
																		st64(a + 0xe0, cc, cd, ce, cf)
																		return af
																	}
																	anchor_error_from(s670, 0x7d0 /* anchor::ConstraintMut */)
																	af = Error_with_account_name(s680, ld64(s670), ld64(s670 + 8), "tick_array_2", 0xc)
																	ae = ld64(s680)
																	st64(a + 0x10, ld64(s680 + 8))
																	st64(a + 8, ae)
																	st32(a, 2)
																	return af
																}
																anchor_error_from(s690, 0x7d0 /* anchor::ConstraintMut */)
																af = Error_with_account_name(s6a0, ld64(s690), ld64(s690 + 8), "tick_array_1", 0xc)
																ae = ld64(s6a0)
																st64(a + 0x10, ld64(s6a0 + 8))
																st64(a + 8, ae)
																st32(a, 2)
																return af
															}
															anchor_error_from(s6d0, 0x7d0 /* anchor::ConstraintMut */)
															af = Error_with_account_name(s6e0, ld64(s6d0), ld64(s6d0 + 8), "token_vault_b", 0xd)
															ae = ld64(s6e0)
															st64(a + 0x10, ld64(s6e0 + 8))
															st64(a + 8, ae)
															st32(a, 2)
															return af
														}
														anchor_error_from(s5d0, 0x7d3 /* anchor::ConstraintRaw */)
														af = Error_with_account_name(s5e0, ld64(s5d0), ld64(s5d0 + 8), "token_owner_account_b", 0x15)
														ae = ld64(s5e0)
														st64(a + 0x10, ld64(s5e0 + 8))
														st64(a + 8, ae)
														st32(a, 2)
														return af
													}
													anchor_error_from(s710, 0x7d0 /* anchor::ConstraintMut */)
													af = Error_with_account_name(s720, ld64(s710), ld64(s710 + 8), "token_vault_a", 0xd)
													ae = ld64(s720)
													st64(a + 0x10, ld64(s720 + 8))
													st64(a + 8, ae)
													st32(a, 2)
													return af
												}
												anchor_error_from(s580, 0x7d3 /* anchor::ConstraintRaw */)
												af = Error_with_account_name(s590, ld64(s580), ld64(s580 + 8), "token_owner_account_a", 0x15)
												ae = ld64(s590)
												st64(a + 0x10, ld64(s590 + 8))
												st64(a + 8, ae)
												st32(a, 2)
												return af
											}
											anchor_error_from(s550, 0x7dc /* anchor::ConstraintAddress */)
											const bi = Error_with_account_name(s560, ld64(s550), ld64(s550 + 8), "token_mint_b", 0xc)
											const bh = ld64(s560 + 8)
											const bg = ld64(s560)
											copy(s290, s2d0, 0x40)
											af = fn_13b5c0(s570, bg, bh, s290, bi)
											ae = ld64(s570)
											st64(a + 0x10, ld64(s570 + 8))
											st64(a + 8, ae)
											st32(a, 2)
											return af
										}
										anchor_error_from(s4f0, 0x7dc /* anchor::ConstraintAddress */)
										const ba = Error_with_account_name(s500, ld64(s4f0), ld64(s4f0 + 8), "token_program_b", 0xf)
										const az = ld64(s500 + 8)
										const ay = ld64(s500)
										copy(s290, s2d0, 0x40)
										af = fn_13b5c0(s510, ay, az, s290, ba)
										ae = ld64(s510)
										st64(a + 0x10, ld64(s510 + 8))
										st64(a + 8, ae)
										st32(a, 2)
										return af
									}
									anchor_error_from(s4c0, 0x7dc /* anchor::ConstraintAddress */)
									const at = Error_with_account_name(s4d0, ld64(s4c0), ld64(s4c0 + 8), "token_program_a", 0xf)
									const ar = ld64(s4d0 + 8)
									const aq = ld64(s4d0)
									copy(s290, s2d0, 0x40)
									af = fn_13b5c0(s4e0, aq, ar, s290, at)
									ae = ld64(s4e0)
									st64(a + 0x10, ld64(s4e0 + 8))
									st64(a + 8, ae)
									st32(a, 2)
									return af
								}
								af = Error_with_account_name(s430, x, token_vault_b_box, "token_vault_b", 0xd)
								ae = ld64(s430)
								st64(a + 0x10, ld64(s430 + 8))
								st64(a + 8, ae)
								st32(a, 2)
								return af
							}
							af = Error_with_account_name(s420, v, token_owner_account_b_box, "token_owner_account_b", 0x15)
							ae = ld64(s420)
							st64(a + 0x10, ld64(s420 + 8))
							st64(a + 8, ae)
							st32(a, 2)
							return af
						}
						af = Error_with_account_name(s410, t, token_vault_a_box, "token_vault_a", 0xd)
						ae = ld64(s410)
						st64(a + 0x10, ld64(s410 + 8))
						st64(a + 8, ae)
						st32(a, 2)
						return af
					}
					af = Error_with_account_name(s400, r, token_owner_account_a_box, "token_owner_account_a", 0x15)
					ae = ld64(s400)
					st64(a + 0x10, ld64(s400 + 8))
					st64(a + 8, ae)
					st32(a, 2)
					return af
				}
				alloc_handle_alloc_error(8, 0x290)
			}
			af = Error_with_account_name(s3f0, k, l, "token_authority", 0xf)
			ae = ld64(s3f0)
			st64(a + 0x10, ld64(s3f0 + 8))
			st64(a + 8, ae)
			st32(a, 2)
			return af
		}
		af = Error_with_account_name(s3e0, i, j, "memo_program", 0xc)
		ae = ld64(s3e0)
		st64(a + 0x10, ld64(s3e0 + 8))
		st64(a + 8, ae)
		st32(a, 2)
		return af
	}
	af = Error_with_account_name(s3d0, g, h, "token_program_b", 0xf)
	ae = ld64(s3d0)
	st64(a + 0x10, ld64(s3d0 + 8))
	st64(a + 8, ae)
	st32(a, 2)
	return af
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value), p7 (value), p8 (value), p9 (points to it)
// types [heur]: b: SwapV2Context (the handler ix_swap_v2 passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_3d688(a: u64, b: SwapV2Context, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64): u64 {
	const s10 = fp - 0x10, s40 = fp - 0x40, s48 = fp - 0x48, s70 = fp - 0x70, s81 = fp - 0x81, s91 = fp - 0x91, s98 = fp - 0x98, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se8 = fp - 0xe8, s100 = fp - 0x100, s218 = fp - 0x218, s220 = fp - 0x220, s228 = fp - 0x228, s238 = fp - 0x238, s250 = fp - 0x250, s268 = fp - 0x268, s280 = fp - 0x280, s298 = fp - 0x298, s2b0 = fp - 0x2b0, s2c8 = fp - 0x2c8, s2e0 = fp - 0x2e0, s2f8 = fp - 0x2f8, s310 = fp - 0x310, s328 = fp - 0x328, s340 = fp - 0x340, s358 = fp - 0x358, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0
	let m, r, bf, bj, bk, bz: u64
	let ev = d
	let f = c
	const accounts: SwapV2Accounts = b.accounts
	clock_get_13f308(s238)
	if (ld64(s238) != 0) {
		const q = ld64(s238 + 8)
		const p = ld64(s228)
		st64(s228, ld64(s220))
		st64(s238, q, p)
		r = fn_13b430(s380, s238)
		f = ld64(s380)
		st64(a + 8, ld64(s380 + 8))
		st64(a, f)
		return r
	}
	let er = f
	let ep = p6
	let eq = p5
	const i = p9
	const eu = p8
	let es = p7
	let h = ld64(s218 + 8)
	if (-1 >= (h as i64)) {
		r = fn_87630(s390, 0x15)
		h = ld64(s390 + 8)
		f = ld64(s390)
		m = h
		if (f != 2) {
			st64(a + 8, m)
			st64(a, f)
			return r
		}
	}
	const eo = h
	const k = b.remaining_accounts_len
	const remaining_accounts: AccountInfo = b.remaining_accounts
	r = fn_7a5e0(s238, remaining_accounts, k, i, 0x100153282, 3, b, f)
	m = ld64(s228)
	f = ld64(s238 + 8)
	const l = ld64(s238)
	if (l == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
		st64(a + 8, m)
		st64(a, f)
		return r
	}
	memcpy(s358, s220, 0x120)
	st64(s370, l, f, m)
	const n = ld64(0x300000000 /* heap bump-allocator cursor */)
	const o = n != 0 ? sat_sub(n, 0x90) & -8 : 0x300007f70
	if (o > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, o)
		const s: AccountInfo = ld64(accounts + 0x148)
		const t: LamportsCell = s.lamports
		const z = s.key
		rc_inc(t)
		const u: DataCell = s.data
		rc_inc(u)
		let et = t
		const v: AccountInfo = ld64(accounts + 0x150)
		const w: LamportsCell = v.lamports
		const ei = s.executable
		const ej = s.is_writable
		let ek = s.is_signer
		let el = s.rent_epoch
		let em = s.owner
		const y = v.key
		let en = w
		rc_inc(w)
		const x: DataCell = v.data
		rc_inc(x)
		const aa: AccountInfo = ld64(accounts + 0x158)
		const ab: LamportsCell = aa.lamports
		const eh = v.executable
		const af = v.is_writable
		const al = v.is_signer
		const ag = v.rent_epoch
		const ac = v.owner
		const eg = aa.key
		rc_inc(ab)
		const ad: DataCell = aa.data
		const ae = ad.strong
		ad.strong = ae + 1
		if (ae != -1) {
			const ak = aa.owner
			const aj = aa.rent_epoch
			const ai = aa.is_signer
			const ah = aa.is_writable
			st8(o + 0x8a, aa.executable)
			st8(o + 0x89, ah)
			st8(o + 0x88, ai)
			st64(o + 0x80, aj)
			st64(o + 0x78, ak)
			st64(o + 0x70, ad)
			st64(o + 0x68, ab)
			st64(o + 0x60, eg)
			st8(o + 0x5a, eh)
			st8(o + 0x59, af)
			st8(o + 0x58, al)
			st64(o + 0x50, ag)
			st64(o + 0x48, ac)
			st64(o + 0x40, x)
			st64(o + 0x38, en)
			st64(o + 0x30, y)
			st8(o + 0x2a, ei)
			st8(o + 0x29, ej)
			st8(o + 0x28, ek)
			st64(o + 0x20, el)
			st64(o + 0x18, em)
			st64(o + 0x10, u)
			st64(o + 8, et)
			st64(o, z)
			st64(s98, 3, o, 3)
			copyr(s238, s2e0, 0x18)
			fn_60de8(s100, s98, s238, ak, ah, al)
			r = fn_62750(s238, s100, ld64(accounts + 0x120), eu)
			let am = ld64(s228)
			m = ld64(s238 + 8)
			const an = ld64(s238)
			let az = am
			let ba = m
			if (an != 0x8000000000000000) {
				st64(se8, an, m, am)
				const oracle: AccountInfo = accounts.oracle
				const ap: LamportsCell = oracle.lamports
				const ax = ld64(accounts + 0x120)
				const ar = oracle.key
				rc_inc(ap)
				const aq: DataCell = oracle.data
				et = ar
				rc_inc(aq)
				const aw = oracle.owner
				const av = oracle.rent_epoch
				const au = oracle.is_signer
				const at = oracle.is_writable
				st8(s70 + 2, oracle.executable)
				st8(s70, au, at)
				st64(s98, et, ap, aq, aw, av)
				r = fn_5bad0(s238, ax, s98)
				az = ld64(s238 + 8)
				ba = ld64(s238)
				const ay = ld8(s218 + 0x10)
				if (ay != 2) {
					B54: {
						copyr(sc0, s228, 0x20)
						st32(sc0 + 0x21, ld32(s218 + 0x11))
						st32(sc0 + 0x24, ld32(s218 + 0x14))
						st64(sd0, ba, az)
						az = 1
						st8(sc0 + 0x20, ay)
						if (ay != 0) {
							r = AccountInfo_try_borrow_data(s238, sd0, r)
							const be = ld64(s228)
							const bc = ld64(s238 + 8)
							const bb = ld64(s238)
							if (bb != 0x800000000000001a /* Ok */) {
								st64(s238, bb, bc, be)
								r = fn_13b430(s3a0, s238)
								az = ld64(s3a0 + 8)
								bf = ld64(s3a0)
								if (bf != 2) {
									break B54
								}
							} else {
								const bd = ld64(bc + 8)
								if (0xfd >= bd) {
									fn_14c5c0(0xfe, bd, 0x100159ee8, 0x800000000000001a /* Ok */)
								}
								az = eo >= ld64(ld64(bc) + 0x28)
								st64(be, ld64(be) - 1)
							}
						}
						if ((az as u8) != 0) {
							r = fn_5c138(s238, sd0, r)
							if (ld8(s238) == 0) {
								st32(s98 + 3, ld32(s238 + 4))
								st32(s98, ld32(s238 + 1))
								et = ld64(s238 + 8)
								const bg = ld64(s228)
								memcpy(s48, s220, 0x38)
								st64(s91, et, bg)
								memcpy(s81, s48, 0x38)
								const bi = ld64(accounts + 0x120)
								const bh = es
								et = accounts.token_mint_b
								r = fn_3f9a0(s238, bi + 8, accounts, accounts.token_mint_b, se8, er, eq, ep, es, eu, eo, s98)
								az = ld64(s238 + 8)
								bf = ld64(s238)
								if (bf != 2) {
									break B54
								}
								B39: {
									if (bh != 0) {
										if (eu != 0) {
											bj = az
											r = fn_82238(s238, et, ld64(az + 8))
											bf = ld64(s238 + 8)
											if (ld64(s238) == 0) {
												if (ev > bf) {
													r = fn_87630(s3e0, 0x24)
													az = ld64(s3e0 + 8)
													bf = ld64(s3e0)
													break B54
												}
												break B39
											}
										} else {
											bj = az
											r = fn_82238(s238, accounts, ld64(az))
											bf = ld64(s238 + 8)
											if (ld64(s238) == 0) {
												if (ev > bf) {
													r = fn_87630(s3e0, 0x24)
													az = ld64(s3e0 + 8)
													bf = ld64(s3e0)
													break B54
												}
												break B39
											}
										}
										az = ld64(s228)
										break B54
									}
									bj = az
									if (ld64(az + (eu != 0 ? 0 : 8)) > ev) {
										r = fn_87630(s3b0, 0x25)
										az = ld64(s3b0 + 8)
										bf = ld64(s3b0)
										break B54
									}
								}
								r = fn_5c328(s3c0, sd0, bj + 0x1d4, bk, bf, r)
								bf = ld64(s3c0)
								if (bf != 2) {
									az = ld64(s3c0 + 8)
									break B54
								}
								ev = ld64(az + (eu != 0 ? 8 : 0))
								const bm = ld64(az + (eu != 0 ? 0 : 8))
								const bl = ld64(accounts + 0x120)
								es = ld64(bl + 0x240)
								er = ld64(bl + 0x238)
								r = fn_82238(s238, eu != 0 ? accounts : et, bm)
								if (ld64(s238) == 0) {
									eq = bm
									const bn = ld64(s228)
									r = fn_82238(s238, eu != 0 ? et : accounts, ev)
									if (ld64(s238) == 0) {
										en = bn
										em = ld64(s228)
										ek = ld64(az + 0x1c8)
										el = ld64(az + 0x10)
										ep = ld64(accounts + 0x120)
										const token_owner_account_a: TokenAccount_2 = accounts.token_owner_account_a
										const token_owner_account_b: TokenAccount_2 = accounts.token_owner_account_b
										const token_vault_a: TokenAccount_2 = accounts.token_vault_a
										const token_vault_b: TokenAccount_2 = accounts.token_vault_b
										r = fn_7c2f0(s3d0, ep, accounts + 0x118, accounts, et, token_owner_account_a, token_owner_account_b, token_vault_a, token_vault_b, s370, s358, accounts + 0x100, accounts + 0x108, accounts + 0x110, az, eu, eo, "Orca Trade", 0xa)
										bf = ld64(s3d0)
										if (bf == 2) {
											const bs = ld64(accounts + 0x120)
											const bt = ld64(ld64(bs))
											copyr(s238, bt, 0x20)
											const bv = ld64(bs + 0x240)
											const bu = ld64(bs + 0x238)
											st64(s218, er, es, bu, bv, eq, ev, en, em, el, ek)
											st8(s218 + 0x50, eu)
											fn_89078(s48, s238)
											copyr(s10, s40, 0x10)
											const by = log_data(s10, 1)
											const bx = ld64(sc0)
											const bw = ld64(sd0 + 8)
											rc_dec(bw)
											rc_dec(bx)
											if (am == 0) {
												bz = fn_bb88(s370, fn_c710(ld64(s100 + 8), ld64(s100 + 0x10), by))
												r = fn_bb88(s250, fn_bb88(s268, fn_bb88(s280, fn_bb88(s298, fn_bb88(s2b0, fn_bb88(s2c8, fn_bb88(s2f8, fn_bb88(s310, fn_bb88(s328, fn_bb88(s340, fn_bb88(s358, bz)))))))))))
												st64(a + 8, m)
												st64(a, 2)
												return r
											}
											m = m + 0x18
											while (true) {
												if (ld8(m - 0x14) == 2) {
													const ca = ld64(m)
													st64(ca, ld64(ca) + 1)
												}
												m = m + 0x78
												am = am - 1
												if (am == 0) {
													bz = fn_bb88(s370, fn_c710(ld64(s100 + 8), ld64(s100 + 0x10), by))
													r = fn_bb88(s250, fn_bb88(s268, fn_bb88(s280, fn_bb88(s298, fn_bb88(s2b0, fn_bb88(s2c8, fn_bb88(s2f8, fn_bb88(s310, fn_bb88(s328, fn_bb88(s340, fn_bb88(s358, bz)))))))))))
													st64(a + 8, m)
													st64(a, 2)
													return r
												}
											}
										}
										az = ld64(s3d0 + 8)
										break B54
									}
								}
							}
							az = ld64(s228)
							bf = ld64(s238 + 8)
						} else {
							r = fn_87630(s3f0, 0x40)
							az = ld64(s3f0 + 8)
							bf = ld64(s3f0)
						}
					}
					const cc = ld64(sc0)
					const cb = ld64(sd0 + 8)
					rc_dec(cb)
					ba = bf
					rc_dec(cc)
				}
				if (am != 0) {
					let cd = m + 0x18
					do {
						if (ld8(cd - 0x14) == 2) {
							const cf = ld64(cd)
							st64(cf, ld64(cf) + 1)
						}
						cd = cd + 0x78
						am = am - 1
					} while (am != 0)
				}
			}
			let ce = ld64(s100 + 0x10)
			m = az
			f = ba
			if (ce != 0) {
				let cg = ld64(s100 + 8) + 0x10
				do {
					const cj = ld64(cg)
					const ci = ld64(cg - 8)
					rc_dec(ci)
					rc_dec(cj)
					cg = cg + 0x30
					ce = ce - 1
				} while (ce != 0)
			}
			if (ld64(s370) != 0x8000000000000000) {
				let ch = ld64(s370 + 0x10)
				if (ch != 0) {
					let ck = ld64(s370 + 8) + 0x10
					do {
						const cn = ld64(ck)
						const cm = ld64(ck - 8)
						r = ld64(cm) - 1
						st64(cm, r)
						if (r == 0) {
							r = ld64(cm + 8) - 1
							st64(cm + 8, r)
						}
						rc_dec(cn)
						ck = ck + 0x30
						ch = ch - 1
					} while (ch != 0)
				}
			}
			if (ld64(s358) != 0x8000000000000000) {
				let cl = ld64(s358 + 0x10)
				if (cl != 0) {
					let co = ld64(s358 + 8) + 0x10
					do {
						const cr = ld64(co)
						const cq = ld64(co - 8)
						rc_dec(cq)
						rc_dec(cr)
						co = co + 0x30
						cl = cl - 1
					} while (cl != 0)
				}
			}
			if (ld64(s340) != 0x8000000000000000) {
				let cp = ld64(s340 + 0x10)
				if (cp != 0) {
					let cs = ld64(s340 + 8) + 0x10
					do {
						const cv = ld64(cs)
						const cu = ld64(cs - 8)
						r = ld64(cu) - 1
						st64(cu, r)
						if (r == 0) {
							r = ld64(cu + 8) - 1
							st64(cu + 8, r)
						}
						rc_dec(cv)
						cs = cs + 0x30
						cp = cp - 1
					} while (cp != 0)
				}
			}
			if (ld64(s328) != 0x8000000000000000) {
				let ct = ld64(s328 + 0x10)
				if (ct != 0) {
					let cw = ld64(s328 + 8) + 0x10
					do {
						const cz = ld64(cw)
						const cy = ld64(cw - 8)
						rc_dec(cy)
						rc_dec(cz)
						cw = cw + 0x30
						ct = ct - 1
					} while (ct != 0)
				}
			}
			if (ld64(s310) != 0x8000000000000000) {
				let cx = ld64(s310 + 0x10)
				if (cx != 0) {
					let da = ld64(s310 + 8) + 0x10
					do {
						const dd = ld64(da)
						const dc = ld64(da - 8)
						r = ld64(dc) - 1
						st64(dc, r)
						if (r == 0) {
							r = ld64(dc + 8) - 1
							st64(dc + 8, r)
						}
						rc_dec(dd)
						da = da + 0x30
						cx = cx - 1
					} while (cx != 0)
				}
			}
			if (ld64(s2f8) != 0x8000000000000000) {
				let db = ld64(s2f8 + 0x10)
				if (db != 0) {
					let de = ld64(s2f8 + 8) + 0x10
					do {
						const dh = ld64(de)
						const dg = ld64(de - 8)
						rc_dec(dg)
						rc_dec(dh)
						de = de + 0x30
						db = db - 1
					} while (db != 0)
				}
			}
			if (ld64(s2c8) != 0x8000000000000000) {
				let df = ld64(s2c8 + 0x10)
				if (df != 0) {
					let di = ld64(s2c8 + 8) + 0x10
					do {
						const dl = ld64(di)
						const dk = ld64(di - 8)
						r = ld64(dk) - 1
						st64(dk, r)
						if (r == 0) {
							r = ld64(dk + 8) - 1
							st64(dk + 8, r)
						}
						rc_dec(dl)
						di = di + 0x30
						df = df - 1
					} while (df != 0)
				}
			}
			if (ld64(s2b0) != 0x8000000000000000) {
				let dj = ld64(s2b0 + 0x10)
				if (dj != 0) {
					let dm = ld64(s2b0 + 8) + 0x10
					do {
						const dq = ld64(dm)
						const dp = ld64(dm - 8)
						rc_dec(dp)
						rc_dec(dq)
						dm = dm + 0x30
						dj = dj - 1
					} while (dj != 0)
				}
			}
			if (ld64(s298) != 0x8000000000000000) {
				let dn = ld64(s298 + 0x10)
				if (dn != 0) {
					let dr = ld64(s298 + 8) + 0x10
					do {
						const du = ld64(dr)
						const dt = ld64(dr - 8)
						r = ld64(dt) - 1
						st64(dt, r)
						if (r == 0) {
							r = ld64(dt + 8) - 1
							st64(dt + 8, r)
						}
						rc_dec(du)
						dr = dr + 0x30
						dn = dn - 1
					} while (dn != 0)
				}
			}
			if (ld64(s280) != 0x8000000000000000) {
				let ds = ld64(s280 + 0x10)
				if (ds != 0) {
					let dv = ld64(s280 + 8) + 0x10
					do {
						const dy = ld64(dv)
						const dx = ld64(dv - 8)
						rc_dec(dx)
						rc_dec(dy)
						dv = dv + 0x30
						ds = ds - 1
					} while (ds != 0)
				}
			}
			if (ld64(s268) != 0x8000000000000000) {
				let dw = ld64(s268 + 0x10)
				if (dw != 0) {
					let dz = ld64(s268 + 8) + 0x10
					do {
						const ec = ld64(dz)
						const eb = ld64(dz - 8)
						r = ld64(eb) - 1
						st64(eb, r)
						if (r == 0) {
							r = ld64(eb + 8) - 1
							st64(eb + 8, r)
						}
						rc_dec(ec)
						dz = dz + 0x30
						dw = dw - 1
					} while (dw != 0)
				}
			}
			if (ld64(s250) == 0x8000000000000000) {
				st64(a + 8, m)
				st64(a, f)
				return r
			}
			let ea = ld64(s250 + 0x10)
			if (ea == 0) {
				st64(a + 8, m)
				st64(a, f)
				return r
			}
			let ed = ld64(s250 + 8) + 0x10
			while (true) {
				const ef = ld64(ed)
				const ee = ld64(ed - 8)
				rc_dec(ee)
				rc_dec(ef)
				ed = ed + 0x30
				ea = ea - 1
				if (ea == 0) {
					st64(a + 8, m)
					st64(a, f)
					return r
				}
			}
		}
		abort()
	}
	alloc_handle_alloc_error(8, 0x90)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool, token_owner_account_a, token_vault_a, token_owner_account_b, token_vault_b
function fn_e42f8(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8
	let r, t: u64
	fn_6aa0(s28, ld64(b + 0x120), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const f = ld64(s28)
	if (f != 2) {
		r = Error_with_account_name(s38, f, ld64(s28 + 8), 0x100152b28 /* "whirlpool" */, 9)
		t = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, t)
		return r
	}
	const g = ld64(b + 0x128)
	const h = ld64(g + 0x20)
	if ((memcmp(g, c, 0x20) as u32) == 0) {
		const i = common_is_closed(h)
		if (i == 0) {
			fn_143448(s18, h, i)
			const k = ld64(s18 + 0x10)
			const j = ld64(s18)
			if (j != 0x800000000000001a /* Ok */) {
				const l = ld64(s18 + 8)
				st64(s18, j, l, k)
				fn_13b430(s48, s18)
				const m = ld64(s48)
				if (m != 2) {
					r = Error_with_account_name(s58, m, ld64(s48 + 8), "token_owner_account_a", 0x15)
					t = ld64(s58)
					st64(a + 8, ld64(s58 + 8))
					st64(a, t)
					return r
				}
			} else {
				st64(k, ld64(k) + 1)
			}
		}
	}
	const n = ld64(b + 0x130)
	const u = ld64(n + 0x20)
	if ((memcmp(n, c, 0x20) as u32) == 0) {
		const v = common_is_closed(u)
		if (v == 0) {
			fn_143448(s18, u, v)
			const x = ld64(s18 + 0x10)
			const w = ld64(s18)
			if (w != 0x800000000000001a /* Ok */) {
				const ae = ld64(s18 + 8)
				st64(s18, w, ae, x)
				fn_13b430(s68, s18)
				const af = ld64(s68)
				if (af != 2) {
					r = Error_with_account_name(s78, af, ld64(s68 + 8), "token_vault_a", 0xd)
					t = ld64(s78)
					st64(a + 8, ld64(s78 + 8))
					st64(a, t)
					return r
				}
			} else {
				st64(x, ld64(x) + 1)
			}
		}
	}
	const o = ld64(b + 0x138)
	const y = ld64(o + 0x20)
	if ((memcmp(o, c, 0x20) as u32) == 0) {
		const z = common_is_closed(y)
		if (z == 0) {
			fn_143448(s18, y, z)
			const ab = ld64(s18 + 0x10)
			const aa = ld64(s18)
			if (aa != 0x800000000000001a /* Ok */) {
				const ag = ld64(s18 + 8)
				st64(s18, aa, ag, ab)
				fn_13b430(s88, s18)
				const ah = ld64(s88)
				if (ah != 2) {
					r = Error_with_account_name(s98, ah, ld64(s88 + 8), "token_owner_account_b", 0x15)
					t = ld64(s98)
					st64(a + 8, ld64(s98 + 8))
					st64(a, t)
					return r
				}
			} else {
				st64(ab, ld64(ab) + 1)
			}
		}
	}
	const p = ld64(b + 0x140)
	const ac = ld64(p + 0x20)
	const q = memcmp(p, c, 0x20)
	let s = undef
	r = q as u32
	if (r != 0) {
		st64(a + 8, s)
		st64(a, 2)
		return r
	}
	r = common_is_closed(ac)
	s = undef
	if (r != 0) {
		st64(a + 8, s)
		st64(a, 2)
		return r
	}
	r = fn_143448(s18, ac, r)
	s = ld64(s18 + 0x10)
	const ad = ld64(s18)
	if (ad != 0x800000000000001a /* Ok */) {
		const ai = ld64(s18 + 8)
		st64(s18, ad, ai, s)
		r = fn_13b430(sa8, s18)
		s = undef
		const aj = ld64(sa8)
		if (aj == 2) {
			st64(a + 8, s)
			st64(a, 2)
			return r
		}
		r = Error_with_account_name(sb8, aj, ld64(sa8 + 8), "token_vault_b", 0xd)
		t = ld64(sb8)
		st64(a + 8, ld64(sb8 + 8))
		st64(a, t)
		return r
	}
	st64(s, ld64(s) + 1)
	st64(a + 8, s)
	st64(a, 2)
	return r
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (points to it)
function fn_eef8(a: u64, b: u64, r0: u64) {
	const s18 = fp - 0x18, s30 = fp - 0x30
	let f = ld64(a)
	let g = f + 1
	let h = g == 0
	if (h != 0) {
		raw_vec_handle_error(0, b, g, f, h)
	}
	const i = f
	let j = max(f << 1, g)
	let m = 0
	const n = 0x4000000000000000 > j
	j = max(j, 4)
	const k = j
	if (f != 0) {
		const l = ld64(a + 8)
		st64(s18 + 0x10, i << 1)
		st64(s18, l)
		m = 1
	}
	st64(s18 + 8, m)
	fn_e478(s30, n, k << 1, s18, r0)
	g = undef
	f = undef
	h = undef
	if (ld64(s30) != 0) {
		raw_vec_handle_error(ld64(s30 + 8), ld64(s30 + 0x10), g, f, h)
	}
	const o = ld64(s30 + 8)
	st64(a, j, o)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (points to it), c (value)
function fn_12758(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	let l: u64
	const f = ld64(b + 8)
	if (f != 0) {
		st64(b + 8, f - 1)
		const g: AccountInfo = ld64(b)
		st64(b, g + 0x30)
		const h = g.key
		if ((memcmp(h, 0x100152100 /* &MEMO_PROGRAM */, 0x20) as u32) != 0) {
			const k = anchor_error_from(s50, 0xbc0 /* anchor::InvalidProgramId */)
			const j = ld64(s50 + 8)
			const i = ld64(s50)
			copyr(s40, h, 0x20)
			st64(s20, 0x62129995a534a05 /* MEMO_PROGRAM */, 0x7c38da6071e8244d /* MEMO_PROGRAM[1] */, 0x81bb92bcddb5357c /* MEMO_PROGRAM[2] */, 0x8d44054140a81fe4 /* MEMO_PROGRAM[3] */) // key MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
			fn_13b5c0(s60, i, j, s40, k)
			l = ld64(s60)
			st64(a + 8, ld64(s60 + 8))
			st64(a, l)
		} else if (g.executable == 0) {
			anchor_error_from(s70, 0xbc1 /* anchor::InvalidProgramExecutable */)
			l = ld64(s70)
			st64(a + 8, ld64(s70 + 8))
			st64(a, l)
		} else {
			st64(a + 8, g)
			st64(a, 2)
		}
	} else {
		anchor_error_from(s80, 0xbbd /* anchor::AccountNotEnoughKeys */, c, d, e)
		l = ld64(s80)
		st64(a + 8, ld64(s80 + 8))
		st64(a, l)
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (points to it), c (value)
function fn_2258(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const sd8 = fp - 0xd8
	try_accounts_558(sd8, b, c, d, e)
	if (ld32(sd8 + 0xb0) == 2) {
		const h = ld64(sd8)
		st64(a + 8, ld64(sd8 + 8))
		st64(a, h)
	} else {
		const f = ld64(0x300000000 /* heap bump-allocator cursor */)
		const g = f != 0 ? sat_sub(f, 0xd8) & -8 : 0x300007f28
		if (0x300000007 >= g) {
			alloc_handle_alloc_error(8, 0xd8)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, sd8, 0xd8)
		st64(a + 8, g)
		st64(a, 2)
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), d (value), r9 (value), r6 (value)
// types [heur]: b: AccountInfo (every call passes one: fn_3b360, fn_3b6d8, fn_3ba00, …)
function fn_7a5e0(a: u64, b: AccountInfo, c: u64, d: u64, p5: u64, p6: u64, r6: u64, r9: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s48 = fp - 0x48, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s80 = fp - 0x80, s140 = fp - 0x140, s148 = fp - 0x148, s150 = fp - 0x150, s158 = fp - 0x158, s160 = fp - 0x160, s168 = fp - 0x168, s170 = fp - 0x170, s178 = fp - 0x178, s180 = fp - 0x180, s188 = fp - 0x188, s190 = fp - 0x190, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8
	let ag, an, ax, bc, bh, bm, br, bw, cb: u64
	let de = ld64(s1a8)
	let df = ld64(s1a0)
	let dg = ld64(s198)
	let dh = ld64(s190)
	let di = ld64(s188)
	let dj = ld64(s180)
	let dk = ld64(s178)
	let dl = ld64(s170)
	let dm = ld64(s168)
	let dn = ld64(s160)
	let dp = ld64(s158)
	let dq = ld64(s150)
	let dr = ld64(s148)
	let ds = ld64(s140)
	let eo = ld64(s80)
	let ep = ld64(s78)
	let eq = ld64(s70)
	let er = ld64(s68)
	let es = ld64(s60)
	let et = ld64(s58)
	let eu = ld64(s50)
	let ev = ld64(s48)
	let en = b
	if (ld64(d) == 0x8000000000000000) {
		st64(a + 0x108, 0x8000000000000000)
		st64(a + 0xf0, 0x8000000000000000)
		st64(a + 0xd8, 0x8000000000000000)
		st64(a + 0xc0, 0x8000000000000000)
		st64(a + 0xa8, 0x8000000000000000)
		st64(a + 0x90, 0x8000000000000000)
		st64(a + 0x78, 0x8000000000000000)
		st64(a + 0x60, 0x8000000000000000)
		st64(a + 0x48, 0x8000000000000000)
		st64(a + 0x30, 0x8000000000000000)
		st64(a + 0x18, 0x8000000000000000)
		st64(a, 0x8000000000000000)
		st64(a + 0x120, 0x8000000000000000)
		return 0x8000000000000000
	}
	let g = c * 0x30
	const du = en + g
	const ek = p6
	let i = p5
	let h = ld64(d + 8)
	let j = h + (ld64(d + 0x10) << 1)
	let ea = 0x8000000000000000
	let eb = 0x8000000000000000
	let ec = 0x8000000000000000
	let ed = 0x8000000000000000
	let ee = 0x8000000000000000
	let ef = 0x8000000000000000
	let dx = 0x8000000000000000
	let dy = 0x8000000000000000
	let dz = 0x8000000000000000
	let eg = 0x8000000000000000
	let eh = 0x8000000000000000
	let ei = 0x8000000000000000
	let ej = 0x8000000000000000
	const dw = i
	const dv = j
	L2: while (true) {
		const k = h
		if (h != j) {
			const el = d
			const em = g
			const o = ld8(k)
			h = k + 2
			let l = ek
			let m = i
			while (true) {
				B66: {
					if (l == 0) {
						fn_87630(s40, 0x30)
						const af = ld64(s40)
						st64(a + 0x10, ld64(s40 + 8))
						st64(a + 8, af)
						st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
					} else {
						l = l - 1
						const n = ld8(m)
						m = m + 1
						if (n != o) {
							continue
						}
						const p = ld8(k + 1)
						g = em
						d = el
						i = dw
						j = dv
						if (p == 0) {
							continue L2
						}
						const cx = h
						const q = ld64(0x300000000 /* heap bump-allocator cursor */)
						const r = q != 0 ? q : 0x300008000
						const s = r - p * 0x30
						const t = s > r ? 0 : s
						if (0x300000008 > (t & -8)) {
							raw_vec_handle_error(8, p * 0x30, p * 0x30, 0x300000008, r)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, t & -8)
						st64(s20, p)
						let aa = 0
						let ab = 0x2b
						let dd = t & -8
						st64(s18, t & -8, 0)
						while (true) {
							B63: {
								const ad = en + ab
								ag = 0x31
								if (ad - 0x2b != du) {
									const dc = ab
									const dt = aa
									const ae = ld64(ad - 0x23)
									const db = ld64(ad - 0x2b)
									let v = dd
									rc_inc(ae)
									const z = ld64(ad - 0x1b)
									rc_inc(z)
									const cy = ld8(ad - 1)
									const cz = ld8(ad - 2)
									const x = ld8(ad - 3)
									const da = ld64(ad - 0xb)
									const y = ld64(ad - 0x13)
									let u = dt
									if (dt == ld64(s20)) {
										fn_f060(s20, en, z)
										u = dt
										v = ld64(s18)
									}
									const w = u + 1
									dd = v
									st8(v + dc - 1, cy)
									st8(v + dc - 2, cz)
									aa = w
									st8(v + dc - 3, x)
									st64(v + dc - 0xb, da)
									st64(v + dc - 0x13, y)
									st64(v + dc - 0x1b, z)
									st64(v + dc - 0x23, ae)
									st64(v + dc - 0x2b, db)
									st32(v + dc, ld32(s18 + 0x13))
									st8(v + dc + 4, ld8(s18 + 0x17))
									ab = dc + 0x30
									st64(s18 + 8, w)
									if (p > (w as u8)) {
										continue
									}
									B59: {
										en = en + ab - 0x2b
										const ac = ld8(k)
										if ((ac as i64) > 5) {
											if ((ac as i64) > 8) {
												if ((ac as i64) > 0xa) {
													if (ac == 0xb) {
														ag = 0x35
														if (ei != 0x8000000000000000) {
															break B63
														}
														dq = ld64(s18)
														ei = ld64(s20)
														dn = aa
													} else {
														ag = 0x35
														if (ej != 0x8000000000000000) {
															break B63
														}
														ds = ld64(s18)
														ej = ld64(s20)
														dr = aa
													}
												} else if (ac == 9) {
													ag = 0x35
													if (eg != 0x8000000000000000) {
														break B63
													}
													dm = ld64(s18)
													eg = ld64(s20)
													dk = aa
												} else {
													ag = 0x35
													if (eh != 0x8000000000000000) {
														break B63
													}
													dp = ld64(s18)
													eh = ld64(s20)
													dl = aa
												}
											} else if (ac == 6) {
												ag = 0x37
												if (aa > 3) {
													break B63
												}
												ag = 0x35
												if (dx != 0x8000000000000000) {
													break B63
												}
												de = ld64(s18)
												dx = ld64(s20)
												eo = aa
											} else {
												if (ac == 7) {
													ag = 0x37
													if (aa > 3) {
														break B63
													}
													ag = 0x35
													if (dy != 0x8000000000000000) {
														break B63
													}
													g = ld64(s18)
													dy = ld64(s20)
													ep = aa
													break B59
												}
												ag = 0x37
												if (aa > 3) {
													break B63
												}
												ag = 0x35
												if (dz != 0x8000000000000000) {
													break B63
												}
												df = ld64(s18)
												dz = ld64(s20)
												eq = aa
											}
										} else if ((ac as i64) > 2) {
											if (ac == 3) {
												ag = 0x35
												if (ed != 0x8000000000000000) {
													break B63
												}
												di = ld64(s18)
												ed = ld64(s20)
												et = aa
											} else {
												if (ac != 4) {
													ag = 0x35
													if (ef == 0x8000000000000000) {
														d = ld64(s18)
														ef = ld64(s20)
														ev = aa
														g = em
														i = dw
														j = dv
														h = cx
														continue L2
													}
													break B63
												}
												ag = 0x35
												if (ee != 0x8000000000000000) {
													break B63
												}
												dj = ld64(s18)
												ee = ld64(s20)
												eu = aa
											}
										} else if (ac == 0) {
											ag = 0x35
											if (ea != 0x8000000000000000) {
												break B63
											}
											r6 = ld64(s18)
											ea = ld64(s20)
											er = aa
										} else if (ac == 1) {
											ag = 0x35
											if (eb != 0x8000000000000000) {
												break B63
											}
											r9 = ld64(s18)
											eb = ld64(s20)
											dh = aa
										} else {
											ag = 0x35
											if (ec != 0x8000000000000000) {
												break B63
											}
											dg = ld64(s18)
											ec = ld64(s20)
											es = aa
										}
										g = em
									}
									d = el
									i = dw
									j = dv
									h = cx
									continue L2
								}
							}
							fn_87630(s30, ag)
							let ai = aa
							const ah = ld64(s30)
							st64(a + 0x10, ld64(s30 + 8))
							st64(a + 8, ah)
							st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
							if (aa == 0) {
								break
							}
							let aj = ld64(s18) + 0x10
							while (true) {
								const al = ld64(aj)
								const ak = ld64(aj - 8)
								rc_dec(ak)
								rc_dec(al)
								aj = aj + 0x30
								ai = ai - 1
								if (ai == 0) {
									break B66
								}
							}
						}
					}
				}
				const cr = ds
				let f = dr
				const cn = dq
				const at = dg
				if (ea != 0x8000000000000000 && er != 0) {
					let am = r6 + 0x10
					do {
						const aq = ld64(am)
						const ap = ld64(am - 8)
						rc_dec(ap)
						rc_dec(aq)
						am = am + 0x30
						an = er
						er = er - 1
					} while (an != 1)
				}
				const ci = dp
				let ao = dh
				if (eb != 0x8000000000000000 && ao != 0) {
					let ar = r9 + 0x10
					do {
						const av = ld64(ar)
						const au = ld64(ar - 8)
						rc_dec(au)
						rc_dec(av)
						ar = ar + 0x30
						ao = ao - 1
					} while (ao != 0)
				}
				const bx = df
				if (ec != 0x8000000000000000 && es != 0) {
					let aw = at + 0x10
					do {
						const ba = ld64(aw)
						const az = ld64(aw - 8)
						rc_dec(az)
						rc_dec(ba)
						aw = aw + 0x30
						ax = es
						es = es - 1
					} while (ax != 1)
				}
				const cd = dm
				const ay = di
				if (ed != 0x8000000000000000 && et != 0) {
					let bb = ay + 0x10
					do {
						const bf = ld64(bb)
						const be = ld64(bb - 8)
						rc_dec(be)
						rc_dec(bf)
						bb = bb + 0x30
						bc = et
						et = et - 1
					} while (bc != 1)
				}
				const bd = dj
				if (ee != 0x8000000000000000 && eu != 0) {
					let bi = bd + 0x10
					do {
						const bk = ld64(bi)
						const bg = bi
						const bj = ld64(bi - 8)
						rc_dec(bj)
						rc_dec(bk)
						bi = bg + 0x30
						bh = eu
						eu = eu - 1
					} while (bh != 1)
				}
				if (ef != 0x8000000000000000 && ev != 0) {
					let bl = el + 0x10
					do {
						const bp = ld64(bl)
						const bo = ld64(bl - 8)
						rc_dec(bo)
						rc_dec(bp)
						bl = bl + 0x30
						bm = ev
						ev = ev - 1
					} while (bm != 1)
				}
				const bn = de
				if (dx != 0x8000000000000000 && eo != 0) {
					let bs = bn + 0x10
					do {
						const bu = ld64(bs)
						const bq = bs
						const bt = ld64(bs - 8)
						rc_dec(bt)
						rc_dec(bu)
						bs = bq + 0x30
						br = eo
						eo = eo - 1
					} while (br != 1)
				}
				if (dy != 0x8000000000000000 && ep != 0) {
					let bv = em + 0x10
					do {
						const bz = ld64(bv)
						const by = ld64(bv - 8)
						rc_dec(by)
						rc_dec(bz)
						bv = bv + 0x30
						bw = ep
						ep = ep - 1
					} while (bw != 1)
				}
				if (dz != 0x8000000000000000 && eq != 0) {
					let ca = bx + 0x10
					do {
						const cf = ld64(ca)
						const ce = ld64(ca - 8)
						rc_dec(ce)
						rc_dec(cf)
						ca = ca + 0x30
						cb = eq
						eq = eq - 1
					} while (cb != 1)
				}
				let cc = dk
				if (eg != 0x8000000000000000 && cc != 0) {
					let cg = cd + 0x10
					do {
						const ck = ld64(cg)
						const cj = ld64(cg - 8)
						rc_dec(cj)
						rc_dec(ck)
						cg = cg + 0x30
						cc = cc - 1
					} while (cc != 0)
				}
				let ch = dl
				if (eh != 0x8000000000000000 && ch != 0) {
					let cl = ci + 0x10
					do {
						const cp = ld64(cl)
						const co = ld64(cl - 8)
						rc_dec(co)
						rc_dec(cp)
						cl = cl + 0x30
						ch = ch - 1
					} while (ch != 0)
				}
				let cm = dn
				if (ei != 0x8000000000000000 && cm != 0) {
					let cq = cn + 0x10
					do {
						const ct = ld64(cq)
						const cs = ld64(cq - 8)
						rc_dec(cs)
						rc_dec(ct)
						cq = cq + 0x30
						cm = cm - 1
					} while (cm != 0)
				}
				if (ej == 0x8000000000000000) {
					return f
				}
				if (f == 0) {
					return f
				}
				let cu = cr + 0x10
				while (true) {
					const cw = ld64(cu)
					const cv = ld64(cu - 8)
					rc_dec(cv)
					rc_dec(cw)
					cu = cu + 0x30
					f = f - 1
					if (f == 0) {
						return f
					}
				}
			}
		}
		st64(a + 0x128, ds)
		st64(a + 0x120, ej)
		st64(a + 0x118, dn)
		st64(a + 0x110, dq)
		st64(a + 0x108, ei)
		st64(a + 0x100, dl)
		st64(a + 0xf8, dp)
		st64(a + 0xf0, eh)
		st64(a + 0xe8, dk)
		st64(a + 0xe0, dm)
		st64(a + 0xd8, eg)
		st64(a + 0xd0, eq)
		st64(a + 0xc8, df)
		st64(a + 0xc0, dz)
		st64(a + 0xb8, ep)
		st64(a + 0xb0, g)
		st64(a + 0xa8, dy)
		st64(a + 0xa0, eo)
		st64(a + 0x98, de)
		st64(a + 0x90, dx)
		st64(a + 0x88, ev)
		st64(a + 0x80, d)
		st64(a + 0x78, ef)
		st64(a + 0x70, eu)
		st64(a + 0x68, dj)
		st64(a + 0x60, ee)
		st64(a + 0x58, et)
		st64(a + 0x50, di)
		st64(a + 0x48, ed)
		st64(a + 0x40, es)
		st64(a + 0x38, dg)
		st64(a + 0x30, ec)
		st64(a + 0x28, dh)
		st64(a + 0x20, r9)
		st64(a + 0x18, eb)
		st64(a + 0x10, er)
		st64(a + 8, r6)
		st64(a, ea)
		st64(a + 0x130, dr)
		return dr
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), c (points to it)
function fn_60de8(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64) {
	const s20 = fp - 0x20, s50 = fp - 0x50, s68 = fp - 0x68, sb0 = fp - 0xb0, sc8 = fp - 0xc8, s118 = fp - 0x118, s120 = fp - 0x120
	let g, n, ak, al, ao, aq, ax, bi, bl, bm, bn, cb, cp, di: u64
	B4: {
		B2: {
			copyr(s68, b, 0x18)
			const f = ld64(c)
			st64(s120, a)
			if (f != 0x8000000000000000) {
				let o = ld64(s68 + 0x10)
				const q = ld64(c + 8)
				const p = ld64(c + 0x10)
				if (p > ld64(s68) - o) {
					fn_e968(s68, o, p, d, e, r0)
					o = ld64(s68 + 0x10)
				}
				const r = ld64(s68 + 8)
				st64(s118 + 0x48, r)
				memcpy(r + o * 0x30, q, p * 0x30)
				d = undef
				e = undef
				g = o + p
				st64(s68 + 0x10, g)
				if (0x15 > g) {
					break B2
				}
			} else {
				g = ld64(s68 + 0x10)
				st64(s118 + 0x48, ld64(s68 + 8))
				if (0x15 > g) {
					break B2
				}
			}
			const s = ld64(0x300000000 /* heap bump-allocator cursor */)
			const t = s != 0 ? s : 0x300008000
			const u = t - (g >> 1) * 0x30
			const v = u > t ? 0 : u
			if ((v & -8) > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, v & -8)
				st64(sb0 + 0x30, v & -8)
				let w = (v & -8) - 0x100
				if (w > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, w)
					st64(s118 + 0x18, 0x10)
					let y = 0
					const x = ld64(s118 + 0x48)
					st64(s118 + 0x20, x - 0x30)
					st64(s118, x - 0x18, x + 0x18, x + 0x60)
					let z = 0
					st64(s118 + 0x38, g)
					while (true) {
						B25: {
							st64(sb0 + 0x28, z)
							st64(s118 + 0x40, w)
							const aa = y
							st64(sb0 + 0x20, ld64(s118 + 0x48) + y * 0x30)
							st64(sb0 + 0x38, y)
							const ab = g - y
							al = ab
							st64(sb0 + 0x40, ab)
							if (ab >= 2) {
								const ac = ld64(sb0 + 0x20)
								const ae = ld64(ac)
								let ad = ld64(ac + 0x30)
								copyr(s20, ad, 0x20)
								copyr(s50, ae, 0x20)
								const af = memcmp(s20, s50, 0x20)
								z = undef
								if (0 > (af as i32)) {
									st64(sb0 + 0x18, aa * 0x30)
									let cq = 2
									if (ld64(sb0 + 0x40) != 2) {
										let cl = ld64(s118 + 0x10) + ld64(sb0 + 0x18)
										let co = 2
										do {
											const cm = ld64(cl)
											copyr(s20, cm, 0x20)
											copyr(s50, ad, 0x20)
											const cn = memcmp(s20, s50, 0x20)
											cq = co
											if ((cn as i32) > -1) {
												break
											}
											cl = cl + 0x30
											co = co + 1
											ad = cm
											cp = ld64(sb0 + 0x40)
											cq = cp
										} while (cp > co)
									}
									const cr = cq
									const cs = ld64(sb0 + 0x38)
									g = ld64(s118 + 0x38)
									const ct = cq
									z = ld64(sb0 + 0x18)
									if (cq > cq + cs) {
										fn_14c690(cs, cr + cs, 0x100159518, cq, z)
									}
									st64(s118 + 0x28, cr + cs)
									if (cr + cs > g) {
										fn_14c5c0(ld64(s118 + 0x28), g, 0x100159518, cq, z)
									}
									al = 1
									if (2 > ct) {
										break B25
									}
									let db = ct >> 1
									let cu = ld64(s118 + 8) + z
									z = ld64(s118) + (ld64(sb0 + 0x38) + ct) * 0x30
									while (true) {
										const cv = ld64(cu - 0x18)
										st64(cu - 0x18, ld64(z - 0x18))
										st64(z - 0x18, cv)
										const cw = ld64(cu - 0x10)
										st64(cu - 0x10, ld64(z - 0x10))
										st64(z - 0x10, cw)
										const cx = ld64(cu - 8)
										st64(cu - 8, ld64(z - 8))
										st64(z - 8, cx)
										const cy = ld64(cu)
										st64(cu, ld64(z))
										st64(z, cy)
										const cz = ld64(cu + 8)
										st64(cu + 8, ld64(z + 8))
										st64(z + 8, cz)
										const da = ld64(cu + 0x10)
										st64(cu + 0x10, ld64(z + 0x10))
										st64(z + 0x10, da)
										cu = cu + 0x30
										z = z - 0x30
										db = db - 1
										al = ct
										if (db == 0) {
											break B25
										}
									}
								}
								al = 2
								if (ld64(sb0 + 0x40) != 2) {
									let ag = ld64(s118 + 0x10) + aa * 0x30
									let aj = 2
									do {
										const ah = ld64(ag)
										copyr(s20, ah, 0x20)
										copyr(s50, ad, 0x20)
										const ai = memcmp(s20, s50, 0x20)
										z = undef
										al = aj
										if (0 > (ai as i32)) {
											break
										}
										ag = ag + 0x30
										aj = aj + 1
										ad = ah
										ak = ld64(sb0 + 0x40)
										al = ak
									} while (ak > aj)
								}
							}
							st64(s118 + 0x28, al + ld64(sb0 + 0x38))
							g = ld64(s118 + 0x38)
						}
						const am = ld64(s118 + 0x28)
						let an = ld64(sb0 + 0x38)
						if (an > am) {
							fn_1494c8(("assertion failed: end >= start && end <= len"), 0x2c, 0x1001595c0, an, z)
						}
						if (am > g) {
							fn_1494c8(("assertion failed: end >= start && end <= len"), 0x2c, 0x1001595c0, an, z)
						}
						B36: {
							B34: {
								w = ld64(s118 + 0x40)
								ao = ld64(sb0 + 0x28)
								if (g > am && 0xa > al) {
									const ap = min(an + 0xa, g)
									if (0xfffffffffffffff6 > an) {
										aq = ap - an
										fn_d648(ld64(sb0 + 0x20), aq, am != an ? al : 1, an, ao)
										an = ld64(sb0 + 0x38)
										st64(s118 + 0x28, ap)
										ao = ld64(sb0 + 0x28)
										if (ao != ld64(s118 + 0x18)) {
											break B36
										}
										break B34
									}
									fn_14c690(an, ap, 0x1001595d8, an, ao)
								}
								aq = am - an
								if (ao != ld64(s118 + 0x18)) {
									break B36
								}
							}
							const ar = ld64(0x300000000 /* heap bump-allocator cursor */)
							const at = ar != 0 ? ar : 0x300008000
							const au = at - (ao << 5)
							const av = au > at ? 0 : au
							if (0x300000008 > (av & -8)) {
								fn_1490e8(0x1001595a8, at, au > at, 0x300000000 /* heap bump-allocator cursor */, ao)
							}
							st64(s118 + 0x18, ao << 1)
							st64(0x300000000 /* heap bump-allocator cursor */, av & -8)
							memcpy(av & -8, w, ao << 4)
							ao = ld64(sb0 + 0x28)
							w = av & -8
							an = ld64(sb0 + 0x38)
						}
						const aw = w + (ao << 4)
						st64(aw + 8, an)
						st64(aw, aq)
						z = ao + 1
						if (z >= 2) {
							let bd = z
							st64(s118 + 0x40, w)
							do {
								B47: {
									B46: {
										bm = bd
										bi = bd - 1
										const bj = w + (bi << 4)
										bl = ld64(bj + 8)
										const bk = ld64(bj)
										if (bk + bl != g) {
											bl = ld64((bm << 4) + w - 0x20)
											if (bl > bk) {
												z = 2
												if (bm == 2) {
													break
												}
												an = bl + bk
												bn = bm - 3
												z = w + (bn << 4)
												const ci = ld64(z)
												if (ci > an) {
													z = 3
													if (3 >= bm) {
														break
													}
													an = ci + bl
													bl = ld64((bm << 4) + w - 0x40)
													z = bm
													if (bl > an) {
														break
													}
												}
												if (bk > ci) {
													break B47
												}
												break B46
											}
										}
										if (bm != 2) {
											bn = bm - 3
											bl = w + (bn << 4)
											if (bk > ld64(bl)) {
												break B47
											}
										}
									}
									bn = bm - 2
								}
								if (bn >= bm) {
									st64(s50, 0x100159350, 1, 8, 0, 0)
									// fmt "Index out of bounds"
									fn_149478(s50, 0x100159530, bl, an, z)
								}
								const bo = bn
								if (bn + 1 >= bm) {
									st64(s50, 0x100159350, 1, 8, 0, 0)
									// fmt "Index out of bounds"
									fn_149478(s50, 0x100159548, bl, bo + 1, z)
								}
								const bp = w + (bn << 4)
								const bt = ld64(bp + 8)
								const bq = w + (bo + 1 << 4)
								const bs = ld64(bq)
								const br = ld64(bq + 8)
								if (bt > br + bs) {
									fn_14c690(bt, br + bs, 0x100159560, bs, z)
								}
								if (br + bs > g) {
									fn_14c5c0(br + bs, g, 0x100159560, bs, z)
								}
								st64(sc8, bs, bq)
								st64(sb0, bp, bn, bm, bi)
								const bu = ld64(bp)
								st64(sb0 + 0x28, (br + bs) * 0x30)
								const bw = br + bs - bt
								st64(sc8 + 0x10, bt)
								const bv = ld64(s118 + 0x48) + bt * 0x30
								let ay = bv + bu * 0x30
								st64(sb0 + 0x38, bv)
								st64(sb0 + 0x20, bu)
								if (bw - bu >= bu) {
									memcpy(ld64(sb0 + 0x30), bv, bu * 0x30)
									const ck = ld64(sb0 + 0x38)
									let ba = ay
									const cj = ld64(sb0 + 0x30)
									st64(sb0 + 0x40, cj + bu * 0x30)
									ay = ck
									ax = cj
									if ((bu as i64) >= 1) {
										ay = ck
										ax = ld64(sb0 + 0x30)
										if ((bw as i64) > (ld64(sb0 + 0x20) as i64)) {
											st64(sb0 + 0x28, ld64(s118 + 0x48) + ld64(sb0 + 0x28))
											ax = ld64(sb0 + 0x30)
											ay = ck
											do {
												const bf = ld64(ax)
												st64(sb0 + 0x38, ba)
												const be = ld64(ba)
												copyr(s20, be, 0x20)
												copyr(s50, bf, 0x20)
												const bg = memcmp(s20, s50, 0x20)
												let bh = ax
												if (-1 >= (bg as i32)) {
													bh = ld64(sb0 + 0x38)
												}
												memcpy(ay, bh, 0x30)
												ax = ax + ((bg as i32) > -1) * 0x30
												ay = ay + 0x30
												const az = ld64(sb0 + 0x38)
												if (ax >= ld64(sb0 + 0x40)) {
													break
												}
												ba = az + ((bg & 0x80000000) >> 0x1f) * 0x30
											} while (ld64(sb0 + 0x28) > ba)
										}
									}
								} else {
									st64(s118 + 0x30, bw - bu)
									const by = (bw - bu) * 0x30
									const bx = ld64(sb0 + 0x30)
									memcpy(bx, ay, by)
									const bz = ay
									st64(sb0 + 0x40, bx + by)
									ax = bx
									if ((bu as i64) >= 1) {
										ay = bz
										ax = ld64(sb0 + 0x30)
										if ((ld64(s118 + 0x30) as i64) >= 1) {
											let ca = ld64(s118 + 0x20) + ld64(sb0 + 0x28)
											ay = bz
											do {
												const ce = ld64(ay - 0x30)
												const cc = ld64(sb0 + 0x40)
												const cd = ld64(cc - 0x30)
												copyr(s20, cd, 0x20)
												copyr(s50, ce, 0x20)
												const cf = memcmp(s20, s50, 0x20)
												const cg = sar(cf << 0x20, 0x3f)
												ay = ay + cg * 0x30
												const ch = cc + ~cg * 0x30
												st64(sb0 + 0x40, ch)
												memcpy(ca, (cf as i32) > -1 ? ch : ay, 0x30)
												ax = ld64(sb0 + 0x30)
												if (ld64(sb0 + 0x38) >= ay) {
													break
												}
												ca = ca - 0x30
												cb = ld64(sb0 + 0x30)
												ax = cb
											} while (ld64(sb0 + 0x40) > cb)
										}
									}
								}
								memcpy(ay, ax, ld64(sb0 + 0x40) - ax)
								const bb = ld64(sc8 + 8)
								st64(bb + 8, ld64(sc8 + 0x10))
								st64(bb, ld64(sc8) + ld64(sb0 + 0x20))
								const bc = ld64(sb0)
								memmove(bc, bc + 0x10, ld64(sb0 + 0x10) + ~ld64(sb0 + 8) << 4)
								an = undef
								z = 1
								g = ld64(s118 + 0x38)
								w = ld64(s118 + 0x40)
								bd = ld64(sb0 + 0x18)
							} while (bd > 1)
						}
						y = ld64(s118 + 0x28)
						if (y >= g) {
							break B4
						}
					}
				}
				fn_1490e8(0x100159590, 0x300000000 /* heap bump-allocator cursor */, u > t, v & -8, e)
			}
			fn_1490e8(0x100159578, u, u > t, v & -8, e)
		}
		if (1 >= g) {
			n = ld64(s120)
			st64(n + 0x10, ld64(s68 + 0x10))
			st64(n + 8, ld64(s68 + 8))
			st64(n, ld64(s68))
			return
		}
		fn_d648(ld64(s118 + 0x48), g, 1, d, e)
	}
	const h = ld64(s68 + 0x10)
	if (h >= 2) {
		let m = 1
		const i = ld64(s68 + 8)
		st64(sb0 + 0x40, i)
		let j = i + 0x60
		while (true) {
			const l = ld64(j - 0x60)
			const k = ld64(j - 0x30)
			copyr(s20, k, 0x20)
			copyr(s50, l, 0x20)
			if ((memcmp(s20, s50, 0x20) as u32) == 0) {
				const dd = ld64(j - 0x20)
				const dc = ld64(j - 0x28)
				rc_dec(dc)
				rc_dec(dd)
				let de = m + 1
				if (de >= h) {
					st64(s68 + 0x10, m)
					n = ld64(s120)
					st64(n + 0x10, ld64(s68 + 0x10))
					st64(n + 8, ld64(s68 + 8))
					st64(n, ld64(s68))
					return
				}
				st64(sb0 + 0x38, h)
				while (true) {
					const df = ld64(sb0 + 0x40) + m * 0x30
					const dg = ld64(j)
					const dh = ld64(df - 0x30)
					copyr(s20, dg, 0x20)
					copyr(s50, dh, 0x20)
					if ((memcmp(s20, s50, 0x20) as u32) == 0) {
						const dk = ld64(j + 0x10)
						const dj = ld64(j + 8)
						rc_dec(dj)
						di = ld64(sb0 + 0x38)
						rc_dec(dk)
					} else {
						memcpy(df, j, 0x30)
						m = m + 1
						di = ld64(sb0 + 0x38)
					}
					j = j + 0x30
					de = de + 1
					if (de >= di) {
						st64(s68 + 0x10, m)
						n = ld64(s120)
						st64(n + 0x10, ld64(s68 + 0x10))
						st64(n + 8, ld64(s68 + 8))
						st64(n, ld64(s68))
						return
					}
				}
			}
			j = j + 0x30
			m = m + 1
			if (h == m) {
				n = ld64(s120)
				st64(n + 0x10, ld64(s68 + 0x10))
				st64(n + 8, ld64(s68 + 8))
				st64(n, ld64(s68))
				return
			}
		}
	}
	n = ld64(s120)
	st64(n + 0x10, ld64(s68 + 0x10))
	st64(n + 8, ld64(s68 + 8))
	st64(n, ld64(s68))
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), a (points to it)
function fn_62750(a: u64, b: u64, c: u64, d: u64): u64 {
	const s20 = fp - 0x20, s24 = fp - 0x24, s78 = fp - 0x78, s98 = fp - 0x98, sf0 = fp - 0xf0, s10d = fp - 0x10d, s110 = fp - 0x110, s180 = fp - 0x180, s188 = fp - 0x188, s1a8 = fp - 0x1a8, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s228 = fp - 0x228, s230 = fp - 0x230, s238 = fp - 0x238, s240 = fp - 0x240, s248 = fp - 0x248, s250 = fp - 0x250, s258 = fp - 0x258, s260 = fp - 0x260, s268 = fp - 0x268, s270 = fp - 0x270, s278 = fp - 0x278
	let v, ad, af, ah, am, au, av, bl, bm, bo, bp, du: u64
	st64(s250, d)
	st64(s238, c)
	st64(s248, a)
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	let g = 0x48 > f
	let h = g != 0 ? 0 : f - 0x48
	let i = 0x300007fb8
	if (f != 0) {
		h = h & -8
		i = h
	}
	if (0x300000008 > i) {
		raw_vec_handle_error(8, 0x48, h, i, g)
	}
	B93: {
		st64(0x300000000 /* heap bump-allocator cursor */, i)
		st64(s228 + 0x10, i)
		st64(s1f8, 3, i, 0)
		st64(s240, ld64(b + 8))
		const j = ld64(b + 0x10)
		st64(s230, j)
		if (j != 0) {
			let r = ld64(s230) * 0x30
			st64(s228 + 0x18, 0)
			st64(s228, ld64(ld64(s238)))
			let q = ld64(s240)
			do {
				B6: {
					const s = memcmp(ld64(q + 0x18), 0x100152180, 0x20)
					i = undef
					g = undef
					if ((s as u32) == 0) {
						const t = fn_143248(q, undef, undef, i, g)
						h = undef
						i = undef
						g = undef
						if (t != 0) {
							break B6
						}
					}
					st64(s228 + 8, r)
					const u = ld64(ld64(s228))
					copyr(s98, u, 0x20)
					v = fn_5d748(s110, q, s98, i, g)
					i = undef
					g = undef
					const n = ld64(s10d + 0xd)
					const o = ld64(s10d + 5)
					const p = ld64(s110)
					if (p == 0) {
						const ac = ld64(s248)
						st64(ac + 0x10, n)
						st64(ac + 8, o)
						st64(ac, 0x8000000000000000)
						du = ld64(s228 + 0x18)
						break B93
					}
					let k = ld64(s228 + 0x18)
					let l = ld64(s228 + 0x10)
					if (k == ld64(s1f8)) {
						fn_ed90(s1f8, l, v)
						i = undef
						g = undef
						k = ld64(s228 + 0x18)
						l = ld64(s1f8 + 8)
					}
					st64(s228 + 0x10, l)
					const m = l + k * 0x18
					st64(m + 0x10, n)
					st64(m + 8, o)
					st64(m, p)
					h = k + 1
					st64(s228 + 0x18, h)
					st64(s1f8 + 0x10, h)
					r = ld64(s228 + 8)
				}
				q = q + 0x30
				r = r - 0x30
			} while (r != 0)
		}
		const w = ld64(s238)
		const x = ld16(w + 0x284)
		if (x == 0) {
			st64(s98, 0x100159c98, 1, 8, 0, 0)
			// fmt "Divisor must be positive."
			fn_149478(s98, 0x100159ca8, h, i, g)
		}
		const y = ld32(w + 0x280)
		const z = fn_151b50(y as i32, (x * 0x58) as i32)
		const aa = 1 > (y as i32)
		const ab = (((y as i32) - z * (x * 0x58)) as u32) != 0
		if (ld64(s250) != 0) {
			st64(s110, 0xffffffff00000000)
			ad = 0
			ah = 0xffffffff
			am = 0xfffffffe
			st32(s10d + 5, -2)
		} else if ((((z - (aa & ab) + 1) * (x * 0x58)) as i32) > (((y as i32) + x) as i32)) {
			st64(s110, 0x100000000)
			ad = 0
			ah = 1
			am = 2
			st32(s10d + 5, 2)
		} else {
			st64(s110, 0x200000001)
			ad = 1
			ah = 2
			am = 3
			st32(s10d + 5, 3)
		}
		B48: {
			B30: {
				st64(s228 + 0x18, z - (aa & ab))
				const ae = (ad + (z - (aa & ab))) * (x * 0x58)
				af = ae as i32
				if (0xfff27617 > ((ae - 0x6c4f5) as u32)) {
					if (-0x6c4f4 >= (af as i64)) {
						av = 4
						au = 0
						if (((0x6c4f4 % (x * 0x58) - x * 0x58 - 0x6c4f4) as u32) == (af as u32)) {
							break B30
						}
					}
				} else {
					const ag = fn_151bf8(af, x * 0x58)
					av = 4
					au = 0
					if (ag == 0) {
						break B30
					}
				}
				const ai = (ah + ld64(s228 + 0x18)) * (x * 0x58)
				af = ai as i32
				if (0xfff27617 > ((ai - 0x6c4f5) as u32)) {
					if (-0x6c4f4 >= (af as i64)) {
						av = 8
						au = 0
						const ak = 0x6c4f4 % (x * 0x58) - x * 0x58 - 0x6c4f4
						const al = af << 0x20
						af = ak
						if ((ak as u32) == (al >> 0x20)) {
							break B30
						}
					}
				} else {
					const aj = fn_151bf8(af, x * 0x58)
					av = 8
					au = 0
					if (aj == 0) {
						break B30
					}
				}
				const an = (am + ld64(s228 + 0x18)) * (x * 0x58)
				af = an as i32
				if (0xfff27617 > ((an - 0x6c4f5) as u32)) {
					if (-0x6c4f4 >= (af as i64)) {
						av = 0xc
						au = 1
						const bf = 0x6c4f4 % (x * 0x58) - x * 0x58 - 0x6c4f4
						const bg = af << 0x20
						af = bf
						if ((bf as u32) == (bg >> 0x20)) {
							break B30
						}
					}
				} else {
					const ao = fn_151bf8(af, x * 0x58)
					av = 0xc
					au = 1
					if (ao == 0) {
						break B30
					}
				}
				bm = 4
				bl = 0
				break B48
			}
			const ap = ld64(0x300000000 /* heap bump-allocator cursor */)
			let aq = 0x10 > ap
			let ar = aq != 0 ? 0 : ap - 0x10
			let at = 0x300007ff0
			if (ap != 0) {
				ar = ar & -4
				at = ar
			}
			if (0x300000008 > at) {
				raw_vec_handle_error(4, 0x10, 0x300000008, ar, at)
			}
			B44: {
				st64(0x300000000 /* heap bump-allocator cursor */, at)
				st32(at, af)
				st64(s228, at)
				st64(s98 + 8, at)
				st64(s228 + 8, 1)
				st64(s98 + 0x10, 1)
				st64(s98, 4)
				let ba = ld64(s228 + 0x18)
				if (au == 0) {
					st64(s228 + 8, 1)
					st64(s228 + 0x10, 0x6c4f4 % (x * 0x58) - x * 0x58)
					L35: while (true) {
						let az = av
						while (true) {
							B38: {
								const bb = (ld32(s110 + az) + ba) * (x * 0x58)
								let aw = bb as i32
								if (0xfff27617 > ((bb - 0x6c4f5) as u32)) {
									if ((aw as i64) > -0x6c4f4) {
										break B38
									}
									const ax = ld64(s228 + 0x10)
									const ay = aw << 0x20
									aw = ax - 0x6c4f4
									if (((ax - 0x6c4f4) as u32) != (ay >> 0x20)) {
										break B38
									}
								} else {
									aq = fn_151bf8(aw, x * 0x58)
									at = undef
									ba = ld64(s228 + 0x18)
									if (aq != 0) {
										break B38
									}
								}
								let bc = ld64(s228 + 8)
								let bd = ld64(s228)
								if (bc == ld64(s98)) {
									aq = fn_e7f8(s98, bc, 1, ba, at, aq)
									bc = ld64(s228 + 8)
									ba = ld64(s228 + 0x18)
									bd = ld64(s98 + 8)
								}
								av = az + 4
								at = bc << 2
								st64(s228, bd)
								st32(bd + at, aw)
								const be = bc + 1
								st64(s228 + 8, be)
								st64(s98 + 0x10, be)
								if (az != 8) {
									continue L35
								}
								break B44
							}
							az = az + 4
							if (az == 0xc) {
								break B44
							}
						}
					}
				}
			}
			bm = ld64(s98 + 8)
			bl = ld64(s228 + 8)
		}
		const bh = ld64(0x300000000 /* heap bump-allocator cursor */)
		let bi = bh - 0x168
		let bj = bi > bh
		let bk = bh != 0 ? (bj != 0 ? 0 : bi) & -8 : 0x300007e98
		if (0x300000007 >= bk) {
			raw_vec_handle_error(8, 0x168, bi, bj, bl)
		}
		B68: {
			st64(0x300000000 /* heap bump-allocator cursor */, bk)
			st64(s1e0 + 8, bk)
			bo = 0
			bp = ld64(s1f8 + 0x10)
			st64(s1d0, 0, 0)
			st64(s1e0, 3)
			if (bl != 0) {
				bl = bl << 2
				st64(s268, bm + bl)
				let bn = 3
				st64(s258, 0)
				st64(s278, s10d)
				st64(s270, ld64(s1f8 + 8))
				st64(s230, ld64(s230) * 0x30)
				st64(s260, ld64(ld64(s238)))
				L52: while (true) {
					st64(s250, bn)
					st64(s238, bk)
					st64(s228, bm + 4, bm, bo, bp)
					if (bp != 0) {
						const bq = ld64(s228 + 0x18)
						let br = ld64(s270)
						const bw = br + bq * 0x18
						const bs = ld32(ld64(s228 + 8))
						let bv = bq * 0x18 - 0x18
						do {
							const bt = ld64(ld64(br + 8) + 0x20)
							const bu = callx(bt, ld64(br), bt, bi, bj, bl)
							bi = undef
							bj = undef
							bl = undef
							if ((bu as u32) == bs) {
								copyr(s1c0, br, 0x18)
								const ci = memmove(br, br + 0x18, bv)
								const cg = ld64(s278)
								st64(cg + 0x10, ld64(s1c0 + 0x10))
								st64(cg + 8, ld64(s1c0 + 8))
								st64(cg, ld64(s1c0))
								let ch = ld64(s228 + 0x10)
								bk = ld64(s238)
								bn = ld64(s250)
								if (ch == bn) {
									fn_e248(s1e0, cg, ci)
									bk = ld64(s1e0 + 8)
									st64(s258, ld64(s1d0))
									bn = ld64(s1e0)
									ch = ld64(s1d0 + 8)
								}
								const cj = ld64(s258) + ch
								const ck = ld64(s228 + 0x18)
								const cl = bk + (cj - (bn > cj ? 0 : bn)) * 0x78
								st8(cl + 4, 2)
								copy(cl + 5, s110, 0x18)
								st32(cl + 0x1c, ld32(s10d + 0x14))
								memcpy(cl + 0x20, s98, 0x58)
								bj = undef
								bl = undef
								bp = ck - 1
								bo = ch + 1
								st64(s1d0 + 8, bo)
								bi = ld64(s228)
								bm = bi
								if (bi == ld64(s268)) {
									break B68
								}
								continue L52
							}
							bv = bv - 0x18
							br = br + 0x18
						} while (br != bw)
					}
					const bx = ld32(ld64(s228 + 8))
					st32(s24, bx)
					const by = ld64(ld64(s260))
					copyr(s20, by, 0x20)
					st64(s188, 0, 1, 0)
					st64(s78, s188, 0x100159480)
					st8(s78 + 0x18, 3)
					st64(s78 + 0x10, 0x20)
					st64(s98 + 0x10, 0)
					st64(s98, 0)
					if (imp_fmt(s24, s98) == 0) {
						copyr(sf0, s180, 0x10)
						st64(s110, 0x100152e25, 0xa, s20, 0x20)
						st64(s188, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
						// PDA find_program_address(["tick_array", *s20, ?], program *s188)
						Pubkey_find_program_address(s98, s110, 3, s188)
						bj = undef
						bl = undef
						copyr(s1a8, s98, 0x20)
						let bz = ld64(s230)
						let ca = ld64(s240)
						bo = ld64(s228 + 0x10)
						while (true) {
							if (bz == 0) {
								bp = ld64(s228 + 0x18)
								break B68
							}
							const cb = ld64(ca)
							copyr(s98, cb, 0x20)
							const cc = memcmp(s98, s1a8, 0x20)
							bj = undef
							bl = undef
							bz = bz - 0x30
							ca = ca + 0x30
							if ((cc as u32) == 0) {
								bn = ld64(s1e0)
								if (bo == bn) {
									fn_e248(s1e0, undef, cc as u32)
									bn = ld64(s1e0)
									bo = ld64(s1d0 + 8)
								}
								const cd = ld64(s1d0)
								st64(s258, cd)
								const ce = cd + bo
								bk = ld64(s1e0 + 8)
								const cf = bk + (ce - (bn > ce ? 0 : bn)) * 0x78
								st32(cf, bx)
								memset(cf + 4, 0, 0x71)
								bj = undef
								bl = undef
								bo = bo + 1
								st64(s1d0 + 8, bo)
								bi = ld64(s228)
								bm = bi
								bp = ld64(s228 + 0x18)
								if (bi == ld64(s268)) {
									break B68
								}
								continue L52
							}
						}
					}
					fn_149678("a Display implementation returned an error unexpectedly", 0x37, s110, 0x1001594b0, 0x1001594d0)
				}
			}
		}
		st64(s228 + 0x18, bp)
		if (bo != 0) {
			const cm = ld64(s1d0)
			let cn = ld64(s1e0)
			const cr = cn > cm + 1 ? 0 : cn
			const co = ld64(s1e0 + 8)
			const cp = co + cm * 0x78
			const cq = ld8(cp + 4)
			st64(s228, cq)
			if (cq == 3) {
				fn_1490e8(0x10015a198, cp, cq, bj, bl)
			}
			let cs = cm + 1 - cr
			st64(s228 + 0x10, bo)
			st64(s230, ld32(cp))
			memcpy(s188, cp + 5, 0x73)
			if (bo != 1) {
				const ct = co + cs * 0x78
				st64(s238, ld8(ct + 4))
				st64(s250, ld32(ct))
				memcpy(s110, ct + 5, 0x73)
				const cu = cs + 1
				bl = 0
				cs = cu - (cn > cu ? 0 : cn)
				st64(s228 + 8, 3)
				const cv = ld64(s228 + 0x10)
				if (cv != 2) {
					const cw = co + cs * 0x78
					st64(s228 + 8, ld8(cw + 4))
					st64(s258, ld32(cw))
					memcpy(s98, cw + 5, 0x73)
					const cx = cs + 1
					cs = cx - (cn > cx ? 0 : cn)
					bl = cv - 3
				}
			} else {
				st64(s238, 3)
				bl = 0
				st64(s228 + 8, 3)
			}
			const cy = ld64(0x300000000 /* heap bump-allocator cursor */)
			bj = 0x168 > cy
			bi = cy != 0 ? (bj != 0 ? 0 : cy - 0x168) & -8 : 0x300007e98
			st64(s240, bl)
			if (0x300000008 > bi) {
				raw_vec_handle_error(8, 0x168, bi, bj, bl)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, bi)
			st8(bi + 4, ld64(s228))
			st32(bi, ld64(s230))
			st64(s228 + 0x10, bi)
			v = memcpy(bi + 5, s188, 0x73)
			let dc = 1
			const cz = ld64(s238)
			if ((cz as u8) != 3) {
				const da = ld64(s228 + 0x10)
				st8(da + 0x7c, cz)
				st32(da + 0x78, ld64(s250))
				v = memcpy(da + 0x7d, s110, 0x73)
				dc = 2
			}
			const db = ld64(s228 + 8)
			if ((db as u8) != 3) {
				const dd = ld64(s228 + 0x10) + dc * 0x78
				st8(dd + 4, db)
				st32(dd, ld64(s258))
				v = memcpy(dd + 5, s98, 0x73)
				dc = dc + 1
			}
			const de = ld64(s248)
			st64(de + 0x10, dc)
			st64(de + 8, ld64(s228 + 0x10))
			st64(de, 3)
			let dq = ld64(s228 + 0x18)
			const df = ld64(s240)
			if (df != 0) {
				const dg = cn > cs ? 0 : cn
				const di = cs - dg
				const dh = cn
				const dj = df - (cn - di)
				v = dj > df
				let dp = v != 0 ? 0 : dj
				cn = df > cn - di ? cn : di + df
				if (cn != di) {
					let dl = cn - di
					let dk = cs * 0x78 - dg * 0x78 + co + 0x18
					do {
						if (ld8(dk - 0x14) == 2) {
							const dm = ld64(dk)
							st64(dm, ld64(dm) + 1)
						}
						dk = dk + 0x78
						dl = dl - 1
					} while (dl != 0)
				}
				dq = ld64(s228 + 0x18)
				if (df > dh - di) {
					let dn = co + 0x18
					do {
						if (ld8(dn - 0x14) == 2) {
							const dr = ld64(dn)
							st64(dr, ld64(dr) + 1)
						}
						dn = dn + 0x78
						dp = dp - 1
					} while (dp != 0)
				}
			}
			if (dq == 0) {
				return v
			}
			let dx = ld64(s1f8 + 8) + 0x10
			while (true) {
				const dy = ld64(dx)
				st64(dy, ld64(dy) + 1)
				dx = dx + 0x18
				dq = dq - 1
				if (dq == 0) {
					return v
				}
			}
		}
		v = fn_87630(s208, 0x17)
		du = ld64(s228 + 0x18)
		const dt = ld64(s208)
		const ds = ld64(s248)
		st64(ds + 0x10, ld64(s208 + 8))
		st64(ds + 8, dt)
		st64(ds, 0x8000000000000000)
	}
	if (du == 0) {
		return v
	}
	let dv = ld64(s1f8 + 8) + 0x10
	while (true) {
		const dw = ld64(dv)
		st64(dw, ld64(dw) + 1)
		dv = dv + 0x18
		du = du - 1
		if (du == 0) {
			return v
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), a (points to it), b (value)
function fn_5bad0(a: u64, b: u64, c: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0
	let s, t, u: u64
	const f = ld64(ld64(b))
	copyr(s60, f, 0x20)
	const g = ld64(c + 0x18)
	if ((memcmp(g, 0x100152180, 0x20) as u32) == 0 && fn_143248(c) != 0) {
		u = memcpy(a, c, 0x30)
		st8(a + 0x30, 0)
		return u
	}
	const h = memcmp(g, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((h as u32) != 0) {
		const r = anchor_error_from(s70, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const q = ld64(s70 + 8)
		const p = ld64(s70)
		copyr(s40, g, 0x20)
		st64(s20, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		u = fn_13b5c0(s80, p, q, s40, r)
		t = ld64(s80 + 8)
		s = ld64(s80)
	} else {
		AccountInfo_try_borrow_data(s40, c, h as u32)
		let m = undef
		let n = undef
		const o = ld64(s40 + 0x10)
		const j = ld64(s40 + 8)
		const i = ld64(s40)
		if (i == 0x800000000000001a /* Ok */) {
			let l = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
			const k = ld64(j + 8)
			if (k >= 8) {
				l = 0xbba /* anchor::AccountDiscriminatorMismatch */
				const x = ld64(j)
				m = ld64(x)
				n = 0xf4e5b38cb383c28b /* account:Oracle */
				if (m == 0xf4e5b38cb383c28b /* account:Oracle */) {
					if (k > 0xfd) {
						if ((memcmp(x + 8, s60, 0x20) as u32) != 0) {
							fn_1494c8("internal error: entered unreachable code", 0x28, 0x100159eb8)
						}
						st64(o, ld64(o) - 1)
						u = memcpy(a, c, 0x30)
						st8(a + 0x30, 1)
						return u
					}
					fn_14c5c0(0xfe, k, 0x100159ed0, m, 0xf4e5b38cb383c28b /* account:Oracle */)
				}
			}
			u = anchor_error_from(sa0, l, l, m, n)
			t = ld64(sa0 + 8)
			s = ld64(sa0)
			st64(o, ld64(o) - 1)
		} else {
			st64(s40, i, j, o)
			u = fn_13b430(s90, s40)
			t = ld64(s90 + 8)
			s = ld64(s90)
		}
	}
	if (s != 2) {
		st64(a + 8, t)
		st64(a, s)
		st8(a + 0x30, 2)
		const w = ld64(c + 0x10)
		const v = ld64(c + 8)
		rc_dec(v)
		if (!rc_release(w)) {
			return u
		}
		st64(w + 8, ld64(w + 8) - 1)
		return u
	}
	u = memcpy(a, c, 0x30)
	st8(a + 0x30, t)
	return u
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (value), e (value)
function fn_14c5c0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c5c8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (points to it)
function fn_5c138(a: u64, b: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s3a = fp - 0x3a, s66 = fp - 0x66, s78 = fp - 0x78
	if (ld8(b + 0x30) != 0) {
		AccountInfo_try_borrow_data(s18, b, r0)
		const i = ld64(s18 + 0x10)
		const g = ld64(s18 + 8)
		const f = ld64(s18)
		if (f != 0x800000000000001a /* Ok */) {
			st64(s18, f, g, i)
			r0 = fn_13b430(s78, s18)
			const j = ld64(s78)
			st64(a + 0x10, ld64(s78 + 8))
			st64(a + 8, j)
			st8(a, 1)
			return r0
		}
		const h = ld64(g + 8)
		if (h > 0xfd) {
			const k = ld64(g)
			st16(s3a + 0x20, ld16(k + 0x50))
			copyr(s3a, k + 0x30, 0x20)
			memcpy(s66, k + 0x52, 0x2c)
			st8(a + 1, 1)
			r0 = memcpy(a + 2, s66, 0x4e)
			st8(a, 0)
			st64(i, ld64(i) - 1)
			return r0
		}
		fn_14c5c0(0xfe, h, 0x100159ee8)
	}
	st16(a, 0)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (points to it), c (value), d (value), p5 (points to it), p6 (value), p7 (value), p8 (value), p9 (value), p10 (value), p11 (value)
function fn_3f9a0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64): u64 {
	const s180 = fp - 0x180, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8, s200 = fp - 0x200, s208 = fp - 0x208, s210 = fp - 0x210, s218 = fp - 0x218, s220 = fp - 0x220, s228 = fp - 0x228, s230 = fp - 0x230
	let n, v, w, x, y, ad, ae, ag, ah, aj, aq: u64
	st64(s200, b)
	st64(s1e8, a)
	const f = p10
	st64(s1f0, f != 0 ? c : d)
	const t = p8
	const u = p7
	const r = p12
	const q = p11
	const h = p6
	st64(s208, p5)
	const g = p9
	st64(s1f8, f)
	if (g != 0) {
		st64(s210, h)
		n = fn_82718(s180, ld64(s1f0))
		if (ld8(s180) != 0) {
			const p = ld64(s180 + 8)
			const o = ld64(s1e8)
			st64(o + 8, ld64(s180 + 0x10))
			st64(o, p)
			return n
		}
		st32(s1d0, ld32(s180 + 2))
		st16(s1d0 + 4, ld16(s180 + 6))
		const k = ld64(s210)
		let ac = k
		if ((ld8(s180 + 1) & 1) != 0) {
			const l = ld32(s180 + 0x10)
			const m = ld64(s180 + 8)
			st16(s180 + 4, ld16(s1d0 + 4))
			st32(s180, ld32(s1d0))
			st32(s180 + 0xe, l)
			st64(s180 + 6, m)
			fn_12db08(s1e0, s180, k, n)
			if (ld64(s1e0) == 0) {
				fn_1490e8(0x10015a2b0)
			}
			const aa = ld64(s1e0 + 8)
			const z = ld64(s210)
			if (aa > z) {
				fn_1490e8(0x10015a2c8, z)
			}
			ac = z - aa
		}
		const ab = ld64(s1f8)
		const af = ac
		n = fn_49708(s180, ld64(s200), ld64(s208), ac, u, t, 1, ab, q, r)
		w = ld64(s180 + 8)
		v = ld64(s180)
		if (v == 2) {
			B22: {
				if (ab != 0) {
					ad = ld64(w + 8)
					ae = ld64(w)
					ah = ld64(s210)
					y = ad
					if (ae == af) {
						break B22
					}
				} else {
					ad = ld64(w)
					ae = ld64(w + 8)
					ah = ad
					y = ld64(s210)
					if (ae == af) {
						break B22
					}
				}
				n = fn_823e0(s180, ld64(s1f0), ae, n)
				y = ld64(s180 + 8)
				if (ld64(s180) != 0) {
					x = ld64(s1e8)
					st64(x + 8, ld64(s180 + 0x10))
					st64(x, y)
					return n
				}
				ah = ad
				if (ld64(s1f8) != 0) {
					ah = y
					y = ad
				}
			}
			const al = ah
			st64(s228, ld64(w + 0x40))
			st64(s220, ld64(w + 0x38))
			st64(s218, ld64(w + 0x30))
			st64(s210, ld64(w + 0x28))
			st64(s208, ld64(w + 0x20))
			st64(s200, ld64(w + 0x18))
			st64(s1f0, ld32(w + 0x1d0))
			const ak = ld64(w + 0x10)
			memcpy(s180, w + 0x48, 0x180)
			st64(s1f8, ld64(w + 0x1c8))
			memcpy(s1d0, w + 0x1d4, 0x4f)
			const ai = ld64(0x300000000 /* heap bump-allocator cursor */)
			aj = ai != 0 ? sat_sub(ai, 0x228) & -8 : 0x300007dd8
			if (aj > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, aj)
				st64(aj + 0x40, ld64(s228))
				st64(aj + 0x38, ld64(s220))
				st64(aj + 0x30, ld64(s218))
				st64(aj + 0x28, ld64(s210))
				st64(aj + 0x20, ld64(s208))
				st64(aj + 0x18, ld64(s200))
				st64(aj + 0x10, ak)
				st64(aj + 8, y)
				st64(aj, al)
				memcpy(aj + 0x48, s180, 0x180)
				st32(aj + 0x1d0, ld64(s1f0))
				st64(aj + 0x1c8, ld64(s1f8))
				n = memcpy(aj + 0x1d4, s1d0, 0x4f)
				aq = ld64(s1e8)
				st64(aq + 8, aj)
				st64(aq, 2)
				return n
			}
			alloc_handle_alloc_error(8, 0x228)
		}
		ag = ld64(s1e8)
		st64(ag + 8, w)
		st64(ag, v)
		return n
	}
	d = f != 0 ? d : c
	n = fn_823e0(s180, d, h, h)
	const j = ld64(s180 + 8)
	if (ld64(s180) == 0) {
		const s = ld64(s1f8)
		n = fn_49708(s180, ld64(s200), ld64(s208), j, u, t, 0, s, q, r)
		w = ld64(s180 + 8)
		v = ld64(s180)
		if (v == 2) {
			const ao = ld64(w + (s != 0 ? 8 : 0))
			n = fn_823e0(s180, ld64(s1f0), ld64(w + (s != 0 ? 0 : 8)), n)
			y = ld64(s180 + 8)
			if (ld64(s180) == 0) {
				st64(s230, ld64(w + 0x40))
				st64(s228, ld64(w + 0x38))
				st64(s220, ld64(w + 0x30))
				st64(s218, ld64(w + 0x28))
				st64(s210, ld64(w + 0x20))
				st64(s208, ld64(w + 0x18))
				st64(s1f0, ld32(w + 0x1d0))
				const ap = ld64(w + 0x10)
				memcpy(s180, w + 0x48, 0x180)
				st64(s200, ld64(w + 0x1c8))
				memcpy(s1d0, w + 0x1d4, 0x4f)
				const am = ld64(0x300000000 /* heap bump-allocator cursor */)
				const an = ld64(s1f8)
				aj = am != 0 ? sat_sub(am, 0x228) & -8 : 0x300007dd8
				if (aj > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, aj)
					st64(aj + 0x40, ld64(s230))
					st64(aj + 0x38, ld64(s228))
					st64(aj + 0x30, ld64(s220))
					st64(aj + 0x28, ld64(s218))
					st64(aj + 0x20, ld64(s210))
					st64(aj + 0x18, ld64(s208))
					st64(aj + 0x10, ap)
					st64(aj + 8, an != 0 ? ao : y)
					st64(aj, an != 0 ? y : ao)
					memcpy(aj + 0x48, s180, 0x180)
					st32(aj + 0x1d0, ld64(s1f0))
					st64(aj + 0x1c8, ld64(s200))
					n = memcpy(aj + 0x1d4, s1d0, 0x4f)
					aq = ld64(s1e8)
					st64(aq + 8, aj)
					st64(aq, 2)
					return n
				}
				alloc_handle_alloc_error(8, 0x228)
			}
			x = ld64(s1e8)
			st64(x + 8, ld64(s180 + 0x10))
			st64(x, y)
			return n
		}
		ag = ld64(s1e8)
		st64(ag + 8, w)
		st64(ag, v)
		return n
	}
	const i = ld64(s1e8)
	st64(i + 8, ld64(s180 + 0x10))
	st64(i, j)
	return n
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), a (points to it), b (value)
function fn_82238(a: u64, b: u64, c: u64): u64 {
	const s20 = fp - 0x20, s30 = fp - 0x30
	let i = fn_82718(s20, b)
	if (ld8(s20) != 0) {
		const f = ld64(s20 + 8)
		st64(a + 0x10, ld64(s20 + 0x10))
		st64(a + 8, f)
		st64(a, 1)
		return i
	}
	st32(s20 + 0x18, ld32(s20 + 2))
	st16(s20 + 0x1c, ld16(s20 + 6))
	if ((ld8(s20 + 1) & 1) == 0) {
		st64(a + 8, c, 0)
		st64(a, 0)
		return i
	}
	const g = ld32(s20 + 0x10)
	const h = ld64(s20 + 8)
	st16(s20 + 4, ld16(s20 + 0x1c))
	st32(s20, ld32(s20 + 0x18))
	st32(s20 + 0xe, g)
	st64(s20 + 6, h)
	i = fn_12db08(s30, s20, c, i)
	if (ld64(s30) == 0) {
		fn_1490e8(0x10015a2b0)
	}
	const j = ld64(s30 + 8)
	if (c >= j) {
		st64(a + 0x10, j)
		st64(a + 8, c - j)
		st64(a, 0)
		return i
	}
	fn_1490e8(0x10015a2c8)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (points to it)
function fn_5c328(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38
	let k: u64
	const f = ld8(c)
	if (ld8(b + 0x30) != 0) {
		if (f != 0) {
			if (ld8(b + 0x29) != 0) {
				fn_143448(s18, b, r0)
				const j = ld64(s18 + 0x10)
				const h = ld64(s18 + 8)
				const g = ld64(s18)
				if (g != 0x800000000000001a /* Ok */) {
					st64(s18, g, h, j)
					r0 = fn_13b430(s28, s18)
					k = ld64(s28)
					st64(a + 8, ld64(s28 + 8))
					st64(a, k)
					return r0
				}
				const i = ld64(h + 8)
				if (i > 0xfd) {
					r0 = memcpy(ld64(h) + 0x52, c + 1, 0x2c)
					st64(j, ld64(j) + 1)
					st64(a + 8, undef)
					st64(a, 2)
					return r0
				}
				fn_14c5c0(0xfe, i, 0x100159f00)
			}
			r0 = anchor_error_from(s38, 0xbbe /* anchor::AccountNotMutable */, c, f, e)
			k = ld64(s38)
			st64(a + 8, ld64(s38 + 8))
			st64(a, k)
			return r0
		}
		fn_1494c8("internal error: entered unreachable code", 0x28, 0x100159ea0, f, e)
	}
	if (f == 0) {
		st64(a + 8, b)
		st64(a, 2)
		return r0
	}
	fn_1494c8("internal error: entered unreachable code", 0x28, 0x100159ea0, f, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), p10 (points to it), p15 (value), p16 (value), p17 (value)
// types [heur]: d: SwapV2Accounts (every call passes one: fn_3d688); p6: TokenAccount_2 (every call passes one: fn_3d688); p7: TokenAccount_2 (every call passes one: fn_3d688); p8: TokenAccount_2 (every call passes one: fn_3d688); p9: TokenAccount_2 (every call passes one: fn_3d688)
function fn_7c2f0(a: u64, b: u64, c: u64, d: SwapV2Accounts, p5: u64, p6: TokenAccount_2, p7: TokenAccount_2, p8: TokenAccount_2, p9: TokenAccount_2, p10: u64, p11: u64, p12: u64, p13: u64, p14: u64, p15: u64, p16: u64, p17: u64, p18: u64, p19: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	const f = p15
	let ai = ld64(f + 0x1c8)
	let ah = ld64(f + 0x40)
	let ag = ld64(f + 0x38)
	const j = ld64(f + 0x20)
	const i = ld64(f + 0x18)
	const h = ld32(f + 0x1d0)
	const g = ld64(f + 0x30)
	st64(b + 0x238, ld64(f + 0x28))
	st64(b + 0x240, g)
	st32(b + 0x280, h)
	st64(b + 0x228, i, j)
	memcpy(b + 8, f + 0x48, 0x180)
	st64(b + 0x278, p17)
	const k = p16
	const l = k != 0 ? 0x248 : 0x258
	st64(b + l, ag, ah)
	const m = k != 0 ? 0x268 : 0x270
	st64(b + m, ld64(b + m) + ai)
	const o = p11
	let n = p10
	const af = n
	n = k != 0 ? n : o
	const q = ld64(f + 8)
	const p = ld64(f)
	const s = p13
	let r = p12
	const ae = r
	r = k != 0 ? r : s
	ag = o
	const u: TokenAccount_2 = p9
	let t = p8
	const ad = t
	t = k != 0 ? t : u
	const v = p5
	ai = v
	const w = p14
	const y: TokenAccount_2 = p7
	const x: TokenAccount_2 = p6
	ah = y
	let ac = fn_7cf50(s10, c, k != 0 ? d : v, k != 0 ? x : y, t, r, w, n, k != 0 ? p : q)
	let ab = ld64(s10 + 8)
	let z = ld64(s10)
	if (z != 2) {
		st64(a + 8, ab)
		st64(a, z)
		return ac
	}
	ai = k != 0 ? ai : d
	ah = k != 0 ? ah : x
	const aa = p19
	ac = fn_7e5e0(s20, b, ai, k != 0 ? u : ad, ah, k != 0 ? s : ae, w, k != 0 ? ag : af, k != 0 ? q : p, p18, aa)
	ab = ld64(s20 + 8)
	z = ld64(s20)
	if (z == 2) {
		st64(a + 8, ab)
		st64(a, 2)
		return ac
	}
	st64(a + 8, ab)
	st64(a, z)
	return ac
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_89078(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000008 > g) {
		raw_vec_handle_error(1, 0x100, g, 0x300000008, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0x96a02b93af49cae1 /* event:Traded */)
	copy(g + 8, b, 0x20)
	st8(g + 0x28, ld8(b + 0x70))
	const h = ld64(b + 0x20)
	st64(g + 0x31, ld64(b + 0x28))
	st64(g + 0x29, h)
	const i = ld64(b + 0x30)
	st64(g + 0x41, ld64(b + 0x38))
	st64(g + 0x39, i)
	copy(g + 0x49, b + 0x40, 0x30)
	st64(a + 8, g, 0x79)
	st64(a, 0x100)
}

function log_data(a: u64, b: u64): u64 {
	return sol_log_data(a, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
function fn_bb88(a: u64, r0: u64): u64 {
	if (ld64(a) != 0x8000000000000000) {
		let f = ld64(a + 0x10)
		if (f == 0) {
			return r0
		}
		let g = ld64(a + 8) + 0x10
		while (true) {
			const i = ld64(g)
			const h = ld64(g - 8)
			rc_dec(h)
			rc_dec(i)
			g = g + 0x30
			f = f - 1
			if (f == 0) {
				return r0
			}
		}
	}
	return r0
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_149478(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	const s20 = fp - 0x20, s28 = fp - 0x28
	st64(s20, 0x10015b8e0, a, b)
	st16(s20 + 0x18, 1)
	st64(s28, 1)
	fn_147238(s28, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value), a (value), d (value), e (value)
function fn_d648(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s18 = fp - 0x18, s20 = fp - 0x20, s40 = fp - 0x40, s68 = fp - 0x68, s70 = fp - 0x70, s98 = fp - 0x98
	let f = c
	let g = b
	st64(s98 + 0x20, a)
	if (c - 1 >= b) {
		fn_1494c8("assertion failed: offset != 0 && offset <= len", 0x2e, 0x1001595f0, d, e)
	}
	if (g > f) {
		const h = ld64(s98 + 0x20)
		st64(s98, g, h - 0x60, f * 0x30 + h - 0x30)
		while (true) {
			const k = ld64(s98 + 0x20) + f * 0x30
			const j = f * 0x30 + ld64(s98 + 8)
			const m = ld64(j + 0x30)
			const l = ld64(k)
			copyr(s18, l + 8, 0x18)
			st64(s70, l)
			st64(s20, ld64(l))
			copyr(s68, m, 0x20)
			if ((memcmp(s20, s68, 0x20) as i32) <= -1) {
				let i = j + 0x30
				copyr(s68, k + 8, 0x28)
				memcpy(k, i, 0x30)
				st64(s98 + 0x18, f)
				if (f != 1) {
					let r = 1
					let n = ld64(s98 + 0x10)
					do {
						const p = ld64(n - 0x30)
						const o = ld64(s70)
						copyr(s40, o, 0x20)
						copyr(s20, p, 0x20)
						const q = memcmp(s40, s20, 0x20)
						i = n
						if ((q as i32) > -1) {
							break
						}
						memcpy(n, n - 0x30, 0x30)
						r = r + 1
						i = ld64(s98 + 0x20)
						n = n - 0x30
					} while (ld64(s98 + 0x18) != r)
				}
				copy(i, s70, 0x30)
				f = ld64(s98 + 0x18)
				g = ld64(s98)
			}
			f = f + 1
			st64(s98 + 0x10, ld64(s98 + 0x10) + 0x30)
			if (f >= g) {
				return
			}
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), e (value)
function fn_1490e8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_1494c8("called `Option::unwrap()` on a `None` value", 0x2b, a, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: e (value)
function fn_1494c8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s10 = fp - 0x10, s38 = fp - 0x38, s40 = fp - 0x40
	st64(s40, s10)
	st64(s10, a, b)
	st64(s38, 1, 8, 0, 0)
	fn_149478(s40, c, c, s10, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (value), e (value)
function fn_14c690(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c698(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memmove(a: u64, b: u64, c: u64): u64 {
	sol_memmove(a, b, c)
	return a
}

function fn_143248(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const f = ld64(a + 0x10)
	const g = ld64(f + 0x10)
	if (g > 0x7ffffffffffffffe) {
		fn_1486f0(0x10015b510, g, 0x7ffffffffffffffe, d, e)
	}
	return ld64(f + 0x20) == 0
}

function fn_5d748(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	let j, m, n, q, r, t: u64
	if (ld8(b + 0x29) != 0) {
		const f = memcmp(ld64(b + 0x18), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
		if ((f as u32) == 0) {
			fn_143448(s20, b, f as u32)
			let k = undef
			const l = ld64(s20 + 0x10)
			const h = ld64(s20 + 8)
			const g = ld64(s20)
			if (g == 0x800000000000001a /* Ok */) {
				B6: {
					j = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
					const i = ld64(h + 8)
					if (i >= 8) {
						const o = ld64(h)
						const p = ld64(o)
						if (p == 0x38dac7e18ef6d811 /* account:DynamicTickArray */) {
							r = 0x100159f60
							q = o + 8
						} else {
							j = 0xbba /* anchor::AccountDiscriminatorMismatch */
							k = 0xbb42076ebebd6145 /* account:TickArray */
							if (p != 0xbb42076ebebd6145 /* account:TickArray */) {
								break B6
							}
							q = fn_5dad8(o, i, 0xbba /* anchor::AccountDiscriminatorMismatch */, 0xbb42076ebebd6145 /* account:TickArray */)
							r = 0x100159fd0
						}
						st64(s80, q, r)
						const s = ld64(r + 0x28)
						callx(s, s20, q, s)
						n = memcmp(s20, c, 0x20) as u32
						if (n != 0) {
							n = fn_87630(s50, 0x38)
							t = ld64(s50)
							st64(a + 0x10, ld64(s50 + 8))
							st64(a + 8, t)
							st64(a, 0)
							st64(l, ld64(l) + 1)
							return n
						}
						st64(a + 0x10, l)
						st64(a + 8, ld64(s80 + 8))
						st64(a, ld64(s80))
						return n
					}
				}
				n = anchor_error_from(s60, j, j, k)
				t = ld64(s60)
				st64(a + 0x10, ld64(s60 + 8))
				st64(a + 8, t)
				st64(a, 0)
				st64(l, ld64(l) + 1)
				return n
			}
			st64(s20, g, h, l)
			n = fn_13b430(s40, s20)
			m = ld64(s40)
			st64(a + 0x10, ld64(s40 + 8))
			st64(a + 8, m)
			st64(a, 0)
			return n
		}
		n = anchor_error_from(s30, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		m = ld64(s30)
		st64(a + 0x10, ld64(s30 + 8))
		st64(a + 8, m)
		st64(a, 0)
		return n
	}
	n = anchor_error_from(s70, 0xbbe /* anchor::AccountNotMutable */, c, d, e)
	m = ld64(s70)
	st64(a + 0x10, ld64(s70 + 8))
	st64(a + 8, m)
	st64(a, 0)
	return n
}

function fn_ed90(a: u64, b: u64, r0: u64) {
	const s18 = fp - 0x18, s30 = fp - 0x30
	let f = ld64(a)
	let g = f + 1
	let m = 0
	let h = g == 0
	if (h != 0) {
		raw_vec_handle_error(0, b, g, f, h)
	}
	let i = max(f << 1, g)
	const j = 0x555555555555556 > i
	i = max(i, 4)
	const k = i
	if (f != 0) {
		const l = ld64(a + 8)
		st64(s18 + 0x10, f * 0x18)
		st64(s18, l)
		m = 8
	}
	st64(s18 + 8, m)
	fn_e478(s30, j << 3, k * 0x18, s18, r0)
	g = undef
	f = undef
	h = undef
	if (ld64(s30) != 0) {
		raw_vec_handle_error(ld64(s30 + 8), ld64(s30 + 0x10), g, f, h)
	}
	const n = ld64(s30 + 8)
	st64(a, i, n)
}

function fn_e7f8(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s30 = fp - 0x30
	let f = b + c
	let g = b > f
	if (g != 0) {
		raw_vec_handle_error(0, b, g, f, e)
	}
	const h = ld64(a)
	let i = max(h << 1, f)
	let m = 0
	const j = 0x2000000000000000 > i
	i = max(i, 4)
	const k = i
	if (h != 0) {
		const l = ld64(a + 8)
		st64(s18 + 0x10, h << 2)
		st64(s18, l)
		m = 4
	}
	st64(s18 + 8, m)
	const o = fn_e478(s30, j << 2, k << 2, s18, r0)
	g = undef
	f = undef
	e = undef
	if (ld64(s30) == 0) {
		const n = ld64(s30 + 8)
		st64(a, i, n)
		return o
	}
	raw_vec_handle_error(ld64(s30 + 8), ld64(s30 + 0x10), g, f, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
function memset(a: u64, b: u64, c: u64) {
	sol_memset(a, b as u8, c)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (value), d (value), e (value)
function fn_14c5c8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	st64(s60, a, b, 0x10015b9d8)
	st64(s50 + 0x10, s20)
	st64(s20, s60, fn_14f060, s58, fn_14f060)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "range end index {} out of range for slice of length {}" {} = a [fn_14f060], {} = b [fn_14f060]
	fn_149478(s50, c, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value)
function fn_823e0(a: u64, b: u64, c: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70
	let i, k: u64
	if (c != 0) {
		r0 = fn_82718(s20, b)
		if (ld8(s20) == 0) {
			st32(s20 + 0x18, ld32(s20 + 2))
			st16(s20 + 0x1c, ld16(s20 + 6))
			if ((ld8(s20 + 1) & 1) == 0) {
				st64(a + 8, c, 0)
				st64(a, 0)
				return r0
			}
			const h = ld32(s20 + 0x10)
			const g = ld64(s20 + 8)
			st16(s20 + 4, ld16(s20 + 0x1c))
			st32(s20, ld32(s20 + 0x18))
			st64(s20 + 6, g)
			st32(s20 + 0xe, h)
			if ((h & 0xffff0000) == 0x27100000) {
				i = ld64(s20 + 8)
			} else {
				r0 = fn_12dc70(s30, s20, c, r0)
				if (ld64(s30) == 0) {
					r0 = fn_87630(s40, 0x34)
					k = ld64(s40)
					st64(a + 0x10, ld64(s40 + 8))
					st64(a + 8, k)
					st64(a, 1)
					return r0
				}
				i = ld64(s30 + 8)
			}
			const j = c + i
			if (c > j) {
				r0 = fn_87630(s70, 0x34)
				k = ld64(s70)
				st64(a + 0x10, ld64(s70 + 8))
				st64(a + 8, k)
				st64(a, 1)
				return r0
			}
			r0 = fn_12db08(s50, s20, j, r0)
			if (ld64(s50) == 0) {
				fn_1490e8(0x10015a2e0)
			}
			if (i != ld64(s50 + 8)) {
				r0 = fn_87630(s60, 0x34)
				k = ld64(s60)
				st64(a + 0x10, ld64(s60 + 8))
				st64(a + 8, k)
				st64(a, 1)
				return r0
			}
			st64(a + 0x10, i)
			st64(a + 8, j)
			st64(a, 0)
			return r0
		}
		const f = ld64(s20 + 8)
		st64(a + 0x10, ld64(s20 + 0x10))
		st64(a + 8, f)
		st64(a, 1)
		return r0
	}
	st64(a + 0x10, 0)
	st64(a + 8, 0)
	st64(a, 0)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (value)
function fn_82718(a: u64, b: u64): u64 {
	const s68 = fp - 0x68, s88 = fp - 0x88, s90 = fp - 0x90, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8
	let y: u64
	const f: AccountInfo = ld64(b + 0x58)
	const g: LamportsCell = f.lamports
	const l = f.key
	rc_inc(g)
	const h: DataCell = f.data
	rc_inc(h)
	const m = f.owner
	const k = f.rent_epoch
	const j = f.is_signer
	const i = f.is_writable
	st8(s90 + 2, f.executable)
	st8(s90, j, i)
	st64(sb8, l, g, h, m, k)
	let n = memcmp(m, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32
	if (n == 0) {
		st16(a, 0)
	} else {
		const q = AccountInfo_try_borrow_data(s68, sb8, n)
		let v = ld64(s68 + 0x10)
		const p = ld64(s68 + 8)
		const o = ld64(s68)
		if (o == 0x800000000000001a /* Ok */) {
			B7: {
				n = fn_afd0(s68, ld64(p), ld64(p + 8), undef, undef, q)
				if (ld32(s68) != 2) {
					const ao = v
					const z = ld64(s68 + 0x60)
					if (z != 0) {
						const ae = ld64(s68 + 0x58)
						let aa = 0
						do {
							n = fn_12e0b0(s88, aa)
							const ab = ld64(s88 + 0x10)
							if (ab > z) {
								break
							}
							const ac = ld64(s88 + 8)
							const ad = ld64(s88)
							if (ad > ac) {
								fn_14c690(ad, ac, 0x100159390)
							}
							if (ac > z) {
								fn_14c5c0(ac, z, 0x100159390)
							}
							n = fn_12e558(s68, ae + ad, ac - ad, n)
							if (ld64(s68) != 0x800000000000001a /* Ok */) {
								break
							}
							const af = ld16(s68 + 8)
							if (af > 0x1b) {
								break
							}
							if (((1 << (af & 0x3f)) & 0x7fd5658) == 0) {
								if (((1 << (af & 0x3f)) & 0x802a9a4) != 0) {
									break
								}
								if (af == 1) {
									if (ab >= ac) {
										if (ab - ac == 2) {
											const ah = ld16(ae + ac)
											const ai = ab > ab + ah ? 0xffffffffffffffff : ab + ah
											if (ai > z) {
												break
											}
											if (ai - ab == 0x6c) {
												n = clock_get_13f308(s68)
												if (ld64(s68) == 0) {
													const an = ld64(ae + ab + 0x5a) > ld64(s68 + 0x18) ? ae + ab + 0x48 : ae + ab + 0x5a
													st16(a + 0x12, ld16(an + 0x10))
													st64(a + 0xa, ld64(an + 8))
													st64(a + 2, ld64(an))
													st16(a, 0x100)
												} else {
													const ak = ld64(s68 + 8)
													const aj = ld64(s68 + 0x10)
													st64(s68 + 0x10, ld64(s68 + 0x18))
													st64(s68, ak, aj)
													n = fn_13b430(sd8, s68)
													const al = ld64(sd8)
													st64(a + 0x10, ld64(sd8 + 8))
													st64(a + 8, al)
													st8(a, 1)
												}
												v = ao
												break B7
											}
											break
										}
										break
									}
									fn_14c690(ac, ab, 0x100159378)
								}
								break
							}
							if (ac > ab) {
								fn_14c690(ac, ab, 0x1001593a8)
							}
							if (ab - ac != 2) {
								break
							}
							const ag = ld16(ae + ac)
							aa = ab > ab + ag ? 0xffffffffffffffff : ab + ag
						} while (z > aa)
					}
					st16(a, 0)
					st64(ao, ld64(ao) - 1)
					y = ld64(sb8 + 0x10)
					const am: LamportsCell = ld64(sb8 + 8)
					rc_dec(am)
					if (!rc_release(y)) {
						return n
					}
					st64(y + 8, ld64(y + 8) - 1)
					return n
				}
				const r = ld64(s68 + 0x18)
				st64(s88 + 0x14, r)
				const s = ld64(s68 + 0x10)
				st64(s88 + 0xc, s)
				const t = ld64(s68 + 8)
				st64(s88 + 4, t)
				st64(s68, t, s, r)
				n = fn_13b430(se8, s68)
				const u = ld64(se8)
				st64(a + 0x10, ld64(se8 + 8))
				st64(a + 8, u)
				st8(a, 1)
			}
			st64(v, ld64(v) - 1)
		} else {
			st64(s68, o, p, v)
			n = fn_13b430(sc8, s68)
			const w = ld64(sc8)
			st64(a + 0x10, ld64(sc8 + 8))
			st64(a + 8, w)
			st8(a, 1)
		}
	}
	y = ld64(sb8 + 0x10)
	const x: LamportsCell = ld64(sb8 + 8)
	rc_dec(x)
	if (!rc_release(y)) {
		return n
	}
	st64(y + 8, ld64(y + 8) - 1)
	return n
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
function fn_12db08(a: u64, b: u64, c: u64, r0: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	if (c == 0) {
		st64(a + 8, 0)
		st64(a, 1)
		return r0
	}
	const f = ld16(b + 0x10)
	if (f == 0) {
		st64(a + 8, 0)
		st64(a, 1)
		return r0
	}
	r0 = __multi3(s10, f, 0, c, 0)
	const g = ld64(s10 + 8)
	const h = ld64(s10)
	if ((g != 0x270f ? g > 0x270f : h > 0xffffffffffffd8f0) != 0) {
		st64(a + 8, g > 0x270f)
		st64(a, 0)
		return r0
	}
	r0 = __udivti3(s20, h + 0x270f, g + (h > h + 0x270f), 0x2710, 0, 1)
	st64(a + 8, min(ld64(s20), ld64(b + 8)))
	st64(a, 1)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it), b (value), d (value), p5 (value), p6 (value), p7 (value), p8 (value), p9 (value), p10 (points to it)
function fn_49708(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64): u64 {
	const s22 = fp - 0x22, s4e = fp - 0x4e, s88 = fp - 0x88, sae = fp - 0xae, sdc = fp - 0xdc, sf8 = fp - 0xf8, s110 = fp - 0x110, s120 = fp - 0x120, s280 = fp - 0x280, s288 = fp - 0x288, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8, s328 = fp - 0x328, s3a8 = fp - 0x3a8, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s598 = fp - 0x598, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s5c8 = fp - 0x5c8, s5d8 = fp - 0x5d8, s5e8 = fp - 0x5e8, s628 = fp - 0x628, s640 = fp - 0x640, s668 = fp - 0x668, s720 = fp - 0x720, s778 = fp - 0x778, s780 = fp - 0x780, s788 = fp - 0x788, s790 = fp - 0x790, s798 = fp - 0x798, s7a0 = fp - 0x7a0, s7a8 = fp - 0x7a8, s7b0 = fp - 0x7b0, s7b8 = fp - 0x7b8, s7c0 = fp - 0x7c0, s7c8 = fp - 0x7c8, s7d0 = fp - 0x7d0, s7d8 = fp - 0x7d8, s7e0 = fp - 0x7e0, s7e8 = fp - 0x7e8, s7f0 = fp - 0x7f0, s7f8 = fp - 0x7f8, s800 = fp - 0x800, sfe8 = fp - 0xfe8, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let f, i, k, l, n, q, r, ab, ac, ah, aj, am, ba, bb, bc, bf, bg, bn, br, bt, cb, cd, ce, cr, el, ep, eq, fb, fi, fs, ft, fv, fw: u64
	B7: {
		B3: {
			st64(s628 + 0x18, c)
			const g = p6
			f = p5
			st64(s628 + 0x38, g)
			l = p10
			st64(s628 + 0x20, p9)
			const h = p8
			r = p7
			st64(s628 + 0x28, h)
			if ((f | g) == 0) {
				k = 0xfffec4b1
				q = 0x35bb7f32a81b33af
				st64(s628 + 0x30, 0)
				i = fn_13b50
				if (h != 0) {
					break B3
				}
			} else {
				i = f
				const j = ld64(s628 + 0x38) + (f >= fn_13b50)
				if ((j != 0xfffec4b2 ? 0xfffec4b1 > j - 1 : 0x35bb7f31a819f860 > f + 0xfffffffefffec4b0) == 0) {
					ac = fn_87630(s438, 0xb)
					ab = ld64(s438)
					st64(a + 8, ld64(s438 + 8))
					st64(a, ab)
					return ac
				}
				f = i
				k = ld64(s628 + 0x38)
				st64(s628 + 0x30, k)
				q = i
				if (ld64(s628 + 0x28) != 0) {
					break B3
				}
			}
			st64(s628 + 0x10, l)
			const p = ld64(b + 0x230)
			st64(s628 + 8, p)
			n = ld64(b + 0x238)
			st64(s628, q)
			st64(s628 + 0x30, k)
			if ((k != n ? n >= k : p >= q) != 0) {
				ac = fn_87630(s448, 0x22)
				ab = ld64(s448)
				st64(a + 8, ld64(s448 + 8))
				st64(a, ab)
				return ac
			}
			break B7
		}
		st64(s628 + 0x10, l)
		const m = ld64(b + 0x230)
		st64(s628, i, m)
		n = ld64(b + 0x238)
		const o = n > ld64(s628 + 0x30)
		if (((ld64(s628 + 0x30) != n ? o : m > i) & 1) == 0) {
			ac = fn_87630(s448, 0x22)
			ab = ld64(s448)
			st64(a + 8, ld64(s448 + 8))
			st64(a, ab)
			return ac
		}
	}
	if (d == 0) {
		ac = fn_87630(s5e8, 0x23)
		ab = ld64(s5e8)
		st64(a + 8, ld64(s5e8 + 8))
		st64(a, ab)
		return ac
	}
	st64(s720 + 0xb0, n)
	st64(s720 + 0x98, f)
	st64(s640 + 0x10, r)
	st64(s720 + 0xa8, d)
	const u = ld16(b + 0x282)
	st64(s668 + 0x18, ld16(b + 0x280))
	const t = ld16(b + 0x27c)
	st64(s668 + 0x20, b)
	const s = ld64(s628 + 0x20)
	fn_4e100(s2a8, b, s)
	if (ld32(s2a8) != 0) {
		ac = fn_87630(s458, ld32(s2a8 + 4))
		ab = ld64(s458)
		st64(a + 8, ld64(s458 + 8))
		st64(a, ab)
		return ac
	}
	st64(s720 + 0x30, t)
	st64(s720 + 0x58, u)
	st64(s720 + 0x80, s2a0)
	const y = memcpy(s428, s2a0, 0x180)
	const v = ld64(s668 + 0x20)
	copyr(s720, v + 0x250, 0x10)
	st64(s720 + 0x18, ld64(v + 0x248))
	st64(s720 + 0x20, ld64(v + 0x240))
	copyr(s640, v + 0x220, 0x10)
	const x = ld32(v + 0x278)
	st64(s1000, ld64(s668 + 0x18))
	st64(sff8, ld64(s628 + 0x10))
	const w = ld64(s628 + 0x28)
	st64(s720 + 0x60, x)
	ac = fn_45408(s2a8, w, x, s, fp, y)
	const aa = ld64(s2a0)
	ab = ld64(s2a8)
	const z = ld64(s288)
	if (z == 3) {
		st64(a + 8, aa)
		st64(a, ab)
		return ac
	}
	st64(s628 + 0x10, ab)
	copyr(s110, s298, 0x10)
	memcpy(sf8, s280, 0x70)
	let ad = ld64(s720 + 0x20)
	if (w == 0) {
		ad = ld64(s720)
	}
	st64(s720 + 0x40, ad)
	st64(s720 + 0x68, a)
	let ae = ld64(s720 + 0x18)
	const ak = ld64(s720 + 0xa8)
	let al = ld64(s628 + 0x18)
	if (ld64(s628 + 0x28) == 0) {
		ae = ld64(s720 + 8)
	}
	B132: {
		st64(s720 + 0x50, ae)
		const af = ld64(s628)
		const ag = ld64(s628 + 8)
		ah = ld64(s720 + 0xb0)
		const ai = ld64(s628 + 0x30) ^ ah
		st64(s110 + 0x10, z)
		st64(s120 + 8, aa)
		st64(s120, ld64(s628 + 0x10))
		ba = 0
		aj = 0
		st64(s720 + 0x88, 0)
		st64(s668 + 0x18, ag)
		am = ah
		st64(s668 + 0x10, 0)
		st64(s628 + 0x10, ak)
		fi = ld64(s640 + 0x10)
		fb = ld64(s628 + 0x20)
		if ((af ^ ag | ai) != 0) {
			st64(s780, ld64(s328 + 0x78))
			st64(s778 + 0x20, ld64(s328 + 0x70))
			st64(s788, ld64(s3a8 + 0x78))
			st64(s778 + 0x18, ld64(s3a8 + 0x70))
			st64(s790, ld64(s428 + 0x78))
			st64(s778 + 0x10, ld64(s428 + 0x70))
			st64(s668 + 0x10, 0)
			st64(s778, s3a8, s328)
			st64(s778 + 0x28, ld64(al + 8))
			st64(s720 + 0x10, ld64(al + 0x10))
			st64(s628 + 0x10, ak)
			st64(s668 + 0x18, ld64(s628 + 8))
			am = ld64(s720 + 0xb0)
			st64(s720 + 0x88, 0)
			let ao = 0
			L20: while (true) {
				const at = am
				const an = ld64(s628 + 0x28)
				st64(s1000, an)
				st64(s778 + 0x48, ao)
				st64(sff8, ao)
				ac = fn_643d0(s2a8, al, ld64(s720 + 0x60), ld64(s720 + 0x30), an, ao)
				st64(s720 + 0x28, ld64(s2a0))
				if (ld64(s2a8) == 0) {
					const ap = ld32(s298)
					st64(s720 + 0x48, ap)
					fn_501e0(s468, ap, ac)
					st64(s720 + 0xa0, ld64(s468 + 8))
					const aq = ld64(s468)
					st64(s720 + 0x38, aq)
					if (an != 0) {
						const aw = ld64(s628)
						bb = at
						const ax = ld64(s720 + 0xa0) > ld64(s628 + 0x30)
						const ay = ld64(s720 + 0xa0) != ld64(s628 + 0x30) ? ax : aq > aw
						bc = ld64(s720 + 0xa0)
						if (ay == 0) {
							bc = ld64(s628 + 0x30)
						}
						st64(s668 + 0x20, aq)
						if (ay == 0) {
							st64(s668 + 0x20, aw)
						}
					} else {
						const ar = ld64(s628)
						bb = at
						const au = ld64(s720 + 0xa0) > ld64(s628 + 0x30)
						const av = ld64(s628 + 0x30) != ld64(s720 + 0xa0) ? au : aq > ar
						bc = ld64(s628 + 0x30)
						if (av == 0) {
							bc = ld64(s720 + 0xa0)
						}
						st64(s668 + 0x20, ar)
						if (av == 0) {
							st64(s668 + 0x20, aq)
						}
					}
					const az = ld64(s720 + 0x28)
					st64(s778 + 0x50, ld64(s778 + 0x28) + az * 0x78)
					st64(s778 + 0x30, ld64(s720 + 0x48) - 1)
					st64(s778 + 0x40, az + 1)
					st64(s720 + 0x90, ba)
					st64(s668 + 8, ld64(s668 + 0x18))
					st64(s668, bb)
					st64(s720 + 0x78, bc)
					while (true) {
						B118: {
							const en = ld64(s110 + 0x10)
							st64(s720 + 0x70, en)
							if (en != 2) {
								const eu = ld32(sf8 + 0x18)
								const ev = (ld32(sdc + 0x14) - (eu as i32)) as i32
								const ew = min(((ev ^ sar(ev, 0x3f)) - sar(ev, 0x3f)) * 0x2710 + ld32(sdc + 0x10), ld32(sae + 0xa))
								st32(sdc + 0x18, ew)
								const ex = ld16(sae + 0xe)
								st64(s778 + 0x38, ex)
								const ey = ld32(sae + 6)
								st64(s668 + 0x18, ey)
								__multi3(s478, ((ew * ex) as u32) * ((ew * ex) as u32), 0, ey, 0)
								const ez = ld64(s478)
								const fa = ld64(s478 + 8)
								__udivti3(s488, ez, fa, 0x9184e72a000, 0, fb)
								const fc = ld64(s488)
								const cg = __multi3(s498, fc, ld64(s488 + 8), 0x9184e72a000, 0)
								bn = 1
								ep = ld64(s628 + 0x28)
								const cc = ld64(s720 + 0x78)
								eq = min(min(fc + ((ld64(s498) ^ ez | ld64(s498 + 8) ^ fa) != 0), 0x186a0) + ld16(sdc + 0x2c), 0x186a0)
								cd = ld64(s668 + 0x20)
								ce = cc
								if ((ld64(s640) | ld64(s640 + 8)) != 0) {
									cd = ld64(s668 + 0x20)
									ce = cc
									if (ld64(s668 + 0x18) != 0) {
										if (ld64(s120) != 0) {
											cb = ld8(sae + 0x22)
											if ((ld32(s120 + 8) as i32) > (eu as i32)) {
												cd = ld64(s668 + 0x20)
												ce = cc
												if (cb != 0) {
													break B118
												}
												const cj = ld64(s110)
												let cl = cj > ld64(s668 + 0x20)
												const ck = ld64(s110 + 8)
												cl = cc != ck ? ck > cc : cl
												ce = cl != 0 ? cc : ck
												cd = ld64(s668 + 0x20)
												cd = cl != 0 ? cd : cj
												break B118
											}
										} else {
											cb = ld8(sae + 0x22)
										}
										if (ld64(s720 + 0x70) != 0 && (eu as i32) > (ld32(sf8) as i32)) {
											cd = ld64(s668 + 0x20)
											ce = cc
											if (cb == 0) {
												break B118
											}
											cd = ld64(sf8 + 8)
											let cf = cd > ld64(s668 + 0x20)
											ce = ld64(sf8 + 0x10)
											cf = ce != cc ? ce > cc : cf
											ce = cf != 0 ? ce : cc
											if (cf != 0) {
												break B118
											}
										} else {
											if (cb == 0) {
												fn_501e0(s4b8, smax(smin((((eu as i32) + 1) * ld64(s778 + 0x38)) as i32, 0x6c4f4), 0xfffffffffff93b0c), cg)
												bn = 0
												const cn = ld64(s4b8 + 8)
												const cm = ld64(s720 + 0x78)
												const co = ld64(s4b8)
												let cp = co > ld64(s668 + 0x20)
												cp = cm != cn ? cn > cm : cp
												ce = cp != 0 ? cm : cn
												cd = ld64(s668 + 0x20)
												cd = cp != 0 ? cd : co
												break B118
											}
											fn_501e0(s4a8, smax(smin(((eu as i32) * ld64(s778 + 0x38)) as i32, 0x6c4f4), 0xfffffffffff93b0c), cg)
											bn = 0
											ce = ld64(s4a8 + 8)
											const ch = ld64(s720 + 0x78)
											cd = ld64(s4a8)
											let ci = cd > ld64(s668 + 0x20)
											ci = ce != ch ? ce > ch : ci
											ce = ci != 0 ? ce : ch
											if (ci != 0) {
												break B118
											}
										}
										cd = ld64(s668 + 0x20)
									}
								}
							} else {
								bn = 0
								eq = ld16(s120)
								cd = ld64(s668 + 0x20)
								ce = bc
								ep = ld64(s628 + 0x28)
							}
						}
						const eo = ld64(s640 + 0x10)
						st64(sfe8, cd, ce, eo, ep)
						st64(sff0, ld64(s668))
						st64(sff8, ld64(s668 + 8))
						st64(s1000, ld64(s640 + 8))
						fn_4e7c8(s2a8, ld64(s628 + 0x10), eq, ld64(s640), ld64(s1000), ld64(sff8), ld64(sff0), cd, ce, eo, ep)
						if (ld32(s2a8) != 0) {
							ac = fn_87630(s4c8, ld32(s2a8 + 4))
							bt = ld64(s4c8)
							fw = ld64(s720 + 0x68)
							st64(fw + 8, ld64(s4c8 + 8))
							st64(fw, bt)
							return ac
						}
						const er = ld64(s720 + 0x80)
						copyr(s88, er, 0x28)
						const fu = ld64(s720 + 0x68)
						if (eo != 0) {
							const et = ld64(s88 + 0x10)
							const es = ld64(s628 + 0x10)
							if (et > es) {
								ac = fn_87630(s5b8, 0x28)
								fv = ld64(s5b8)
								st64(fu + 8, ld64(s5b8 + 8))
								st64(fu, fv)
								return ac
							}
							bf = ld64(s88 + 0x20)
							if (bf > es - et) {
								ac = fn_87630(s5a8, 0x28)
								fv = ld64(s5a8)
								st64(fu + 8, ld64(s5a8 + 8))
								st64(fu, fv)
								return ac
							}
							const be = ld64(s88 + 0x18)
							const bd = ld64(s668 + 0x10)
							if (bd > bd + be) {
								ac = fn_87630(s598, 0x27)
								fv = ld64(s598)
								st64(fu + 8, ld64(s598 + 8))
								st64(fu, fv)
								return ac
							}
							bg = es - et - bf
							st64(s668 + 0x10, bd + be)
						} else {
							const fe = ld64(s88 + 0x18)
							const fd = ld64(s628 + 0x10)
							if (fe > fd) {
								ac = fn_87630(s4f8, 0x28)
								fv = ld64(s4f8)
								st64(fu + 8, ld64(s4f8 + 8))
								st64(fu, fv)
								return ac
							}
							const fg = ld64(s88 + 0x10)
							const ff = ld64(s668 + 0x10)
							if (ff > ff + fg) {
								ac = fn_87630(s4e8, 0x27)
								fv = ld64(s4e8)
								st64(fu + 8, ld64(s4e8 + 8))
								st64(fu, fv)
								return ac
							}
							bf = ld64(s88 + 0x20)
							const fh = ff + fg + bf
							st64(s668 + 0x10, fh)
							bg = fd - fe
							if (ff + fg > fh) {
								ac = fn_87630(s4d8, 0x27)
								fv = ld64(s4d8)
								st64(fu + 8, ld64(s4d8 + 8))
								st64(fu, fv)
								return ac
							}
						}
						st64(s628 + 0x10, bg)
						const bh = ld64(s720 + 0x90)
						ba = bh + bf
						if (bh > ba) {
							ac = fn_87630(s588, 0x27)
							bt = ld64(s588)
							fw = ld64(s720 + 0x68)
							st64(fw + 8, ld64(s588 + 8))
							st64(fw, bt)
							return ac
						}
						const bi = ld64(s720 + 0x58)
						if (bi != 0) {
							__multi3(s508, bf, 0, bi, 0)
							const bu = ld64(s508 + 8)
							if (bu >= 0x2710) {
								fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s2a8, 0x100159c60, 0x100159c80)
							}
							__udivti3(s518, ld64(s508), bu, 0x2710, 0, bf)
							const bv = ld64(s518)
							st64(s720 + 0x88, ld64(s720 + 0x88) + bv)
							bf = bf - bv
						}
						if ((ld64(s640) | ld64(s640 + 8)) != 0) {
							__udivti3(s528, 0, bf, ld64(s640), ld64(s640 + 8), bf)
							const bj = ld64(s528)
							const bk = ld64(s720 + 0x40)
							const bl = ld64(s528 + 8)
							const bm = ld64(s720 + 0x50)
							st64(s720 + 0x40, bj + bk)
							st64(s720 + 0x50, bl + bm + (bj > bj + bk))
						}
						B76: {
							B70: {
								B74: {
									st64(s720 + 0x90, bn)
									ah = ld64(s88)
									const bo = ld64(s720 + 0x38)
									const bp = ld64(s88 + 8)
									const bq = ld64(s720 + 0xa0)
									st64(s668 + 0x18, ah)
									if ((ah ^ bo | bp ^ bq) == 0) {
										B65: {
											B64: {
												B41: {
													B40: {
														am = bp
														fi = ld64(s640 + 0x10)
														fb = ld64(s628 + 0x20)
														if (ld64(s720 + 0x10) > ld64(s720 + 0x28)) {
															const bw = ld64(s778 + 0x50)
															let bz = ld64(bw + 8)
															const bx = ld8(bw + 4)
															bz = bx != 2 ? bw : bz
															let by = ld64(bw + 0x10)
															by = bx != 2 ? 0x10015a128 : by
															const ca = ld64(by + 0x38)
															callx(ca, s2a8, bz, ld64(s720 + 0x48), ld64(s720 + 0x30), ca)
															if (ld8(s2a8) == 0) {
																const cq = ld8(s2a8 + 1)
																if (cq != 0) {
																	if (cq == 2) {
																		fn_1490e8(0x100159c48)
																	}
																	st64(s7d0, cq)
																	const cx = ld64(s280 + 0x1a)
																	st64(s7c0, 1)
																	const cy = ld64(s778 + 0x10)
																	st64(s720 + 0x60, cx)
																	st64(s798, ld64(s280 + 0x42))
																	st64(s668, ld64(s280 + 0x3a))
																	st64(s778 + 0x38, ld64(s280 + 0x32))
																	st64(s668 + 8, ld64(s280 + 0x2a))
																	st64(s778 + 0x48, ld64(s280 + 0x22))
																	st64(s7f0, ld64(s280 + 0x12))
																	st64(s7a8, ld64(s280 + 0xa))
																	st64(s7e8, ld64(s280 + 2))
																	st64(s7b0, ld64(s288 + 2))
																	st64(s7e0, ld64(s298 + 0xa))
																	st64(s7d8, ld64(s298 + 2))
																	st64(s7b8, ld64(s2a0 + 2))
																	st64(s7a0, ld64(s2a8 + 2))
																	st64(s2a8, 0, 0, 0, 0)
																	const cz = memcmp(s428, s2a8, 0x20)
																	if ((cz as u32) != 0) {
																		st64(s778 + 0x48, ld64(s790) - ld64(s778 + 0x48) - (cx > cy))
																	}
																	if ((cz as u32) != 0) {
																		st64(s720 + 0x60, ld64(s778 + 0x10) - ld64(s720 + 0x60))
																	}
																	const db = ld64(s668 + 8) > ld64(s778 + 0x18)
																	st64(s2a8, 0, 0, 0, 0)
																	const da = memcmp(ld64(s778), s2a8, 0x20)
																	if ((da as u32) != 0) {
																		st64(s778 + 0x38, ld64(s788) - ld64(s778 + 0x38) - db)
																	}
																	if ((da as u32) != 0) {
																		st64(s668 + 8, ld64(s778 + 0x18) - ld64(s668 + 8))
																	}
																	const dd = ld64(s668) > ld64(s778 + 0x20)
																	st64(s2a8, 0, 0, 0, 0)
																	const dc = memcmp(ld64(s778 + 8), s2a8, 0x20)
																	if ((dc as u32) != 0) {
																		st64(s798, ld64(s780) - ld64(s798) - dd)
																	}
																	const de = ld64(s720 + 0x40)
																	const dg = ld64(s720 + 0x20)
																	const dh = ld64(s7a0)
																	if ((dc as u32) != 0) {
																		st64(s668, ld64(s778 + 0x20) - ld64(s668))
																	}
																	const df = ld64(s628 + 0x28)
																	const dj = df != 0 ? de : dg
																	let di = ld64(s720)
																	let dk = ld64(s7b8)
																	di = df != 0 ? di : de
																	let dw = ld64(s720 + 8)
																	if (df == 0) {
																		dw = ld64(s720 + 0x50)
																	}
																	st64(s7c8, 1)
																	if (di >= ld64(s7a8)) {
																		st64(s7c8, 0)
																	}
																	if (dj >= ld64(s7b0)) {
																		st64(s7c0, 0)
																	}
																	st64(s7f8, dj)
																	let dx = ld64(s720 + 0x50)
																	if (df == 0) {
																		dx = ld64(s720 + 0x18)
																	}
																	const dl = ld64(s628 + 0x28) != 0 ? -dh : dh
																	const dm = ld64(s628 + 0x28) != 0 ? -(dk + (dh != 0)) : dk
																	if ((dl | dm) != 0) {
																		if ((dm != 0 ? 0 > (dm as i64) : dl == 0) != 0) {
																			st64(s800, 1)
																			let dt = -dl > ld64(s640)
																			const ds = dm + (dl != 0)
																			if (ld64(s640 + 8) >= -ds) {
																				st64(s800, 0)
																			}
																			if (ld64(s640 + 8) != -ds) {
																				dt = ld64(s800)
																			}
																			if ((dt & 1) != 0) {
																				ac = fn_87630(s558, 0xf)
																				bt = ld64(s558)
																				fw = ld64(s720 + 0x68)
																				st64(fw + 8, ld64(s558 + 8))
																				st64(fw, bt)
																				return ac
																			}
																			const du = ld64(s640)
																			const dv = dm + ld64(s640 + 8) + (dl > dl + du)
																			st64(s640, dl + du, dv)
																		} else {
																			const dn = ld64(s640)
																			st64(s800, 1)
																			let dp = dn > dn + dl
																			const dq = ld64(s640 + 8)
																			const dr = dq + dm + dp
																			if (dr >= dq) {
																				st64(s800, 0)
																			}
																			if (dr != ld64(s640 + 8)) {
																				dp = ld64(s800)
																			}
																			if ((dp & 1) != 0) {
																				ac = fn_87630(s558, 0xe)
																				bt = ld64(s558)
																				fw = ld64(s720 + 0x68)
																				st64(fw + 8, ld64(s558 + 8))
																				st64(fw, bt)
																				return ac
																			}
																			st64(s640, dn + dl, dr)
																		}
																		dk = ld64(s7b8)
																	}
																	const ea = dw - ld64(s7f0)
																	const dy = dx - ld64(s7e8)
																	const dz = ld64(s7c0)
																	const eb = ld64(s7c8)
																	const ed = ld64(s7b0)
																	const ec = ld64(s7f8)
																	const ef = di - ld64(s7a8)
																	const ee = ld64(s7a0)
																	st64(s88 + 0x2c, (ee >> 0x20 | (dk << 0x20)))
																	st32(s88 + 0x28, ee)
																	const eg = ld64(s88 + 0x28)
																	st64(s280 + 0x40, ld64(s798))
																	st64(s280 + 0x38, ld64(s668))
																	st64(s280 + 0x30, ld64(s778 + 0x38))
																	st64(s280 + 0x28, ld64(s668 + 8))
																	st64(s280 + 0x20, ld64(s778 + 0x48))
																	st64(s280 + 0x18, ld64(s720 + 0x60))
																	st64(s288, ec - ed, dy - dz, ef, ea - eb)
																	st64(s298 + 8, ld64(s7e0))
																	st64(s298, ld64(s7d8))
																	st8(s280 + 0x48, ld64(s7d0))
																	st64(s2a8, eg, dk)
																	const eh = ld64(s778 + 0x50)
																	let ek = ld64(eh + 8)
																	const ei = ld8(eh + 4)
																	ek = ei != 2 ? eh : ek
																	let ej = ld64(eh + 0x10)
																	fi = ld64(s640 + 0x10)
																	fb = ld64(s628 + 0x20)
																	ej = ei != 2 ? 0x10015a128 : ej
																	ac = callx(ld64(ej + 0x40), s568, ek, ld64(s720 + 0x48), ld64(s720 + 0x30), s2a8)
																	el = ld64(s568)
																	if (el != 2) {
																		ft = ld64(s568 + 8)
																		fs = ld64(s720 + 0x68)
																		st64(fs, el, ft)
																		return ac
																	}
																}
																cr = ld64(s778 + 0x50)
																break B64
															}
															br = ld64(s298)
															if (ld64(s2a0) != 0) {
																break B40
															}
														} else {
															fn_87630(s538, 3)
															br = ld64(s538 + 8)
															st64(s298, br)
															const bs = ld64(s538)
															st64(s2a0, bs)
															st8(s2a8, 1)
															if (bs != 0) {
																break B40
															}
														}
														void ld64(br)
														cr = ld64(s778 + 0x50)
														void ld8(br + 0x50)
														break B41
													}
													void ld64(br)
													cr = ld64(s778 + 0x50)
													void ld8(br + 0x38)
												}
												if (ld64(s720 + 0x28) >= ld64(s720 + 0x10)) {
													ac = fn_87630(s548, 3)
													st64(s2a0, ld64(s548 + 8))
													bt = ld64(s548)
													st64(s2a8, bt)
													if (bt == 2) {
														break B65
													}
													fw = ld64(s720 + 0x68)
													st64(fw + 8, ld64(s2a0))
													st64(fw, bt)
													return ac
												}
											}
											let cu = ld64(cr + 8)
											const cs = ld8(cr + 4)
											cu = cs != 2 ? cr : cu
											let ct = ld64(cr + 0x10)
											ct = cs != 2 ? 0x10015a128 : ct
											const cv = ld64(ct + 0x68)
											ac = callx(cv, s2a8, cu, ld64(s720 + 0x48), ld64(s720 + 0x30), cv)
											bt = ld64(s2a8)
											if (bt != 2) {
												fw = ld64(s720 + 0x68)
												st64(fw + 8, ld64(s2a0))
												st64(fw, bt)
												return ac
											}
										}
										const cw = ld64(s2a0)
										if (ld64(s628 + 0x28) == 0) {
											st64(s778 + 0x48, ld64(s778 + 0x40))
											ah = ld64(s668 + 0x18)
											if (cw != 0x57) {
												st64(s778 + 0x48, ld64(s720 + 0x28))
											}
											st64(s720 + 0x60, ld64(s720 + 0x48))
											if (ld64(s720 + 0x90) != 0) {
												break B70
											}
											break B74
										}
										st64(s778 + 0x48, ld64(s778 + 0x40))
										ah = ld64(s668 + 0x18)
										if (cw != 0) {
											st64(s778 + 0x48, ld64(s720 + 0x28))
										}
										st64(s720 + 0x60, ld64(s778 + 0x30))
									} else {
										am = bp
										fi = ld64(s640 + 0x10)
										fb = ld64(s628 + 0x20)
										if ((ah ^ ld64(s668 + 8) | bp ^ ld64(s668)) != 0) {
											st64(s720 + 0x60, fn_53940(s88))
											ah = ld64(s668 + 0x18)
											if (ld64(s720 + 0x90) != 0) {
												break B70
											}
											break B74
										}
									}
									if (ld64(s720 + 0x90) != 0) {
										break B70
									}
								}
								al = ld64(s628 + 0x18)
								bc = ld64(s720 + 0x78)
								if (ld64(s720 + 0x70) == 2) {
									break B76
								}
								st32(sf8 + 0x18, (ld8(sae + 0x22) != 0 ? 0xffffffffffffffff : 1) + ld32(sf8 + 0x18))
								break B76
							}
							st64(sff0, ld64(s720 + 0x48))
							st64(s1000, ld64(s720 + 0x38))
							st64(sff8, ld64(s720 + 0xa0))
							fn_45de8(s578, s120, ah, am, fp)
							ah = ld64(s668 + 0x18)
							al = ld64(s628 + 0x18)
							bc = ld64(s720 + 0x78)
						}
						aj = ld64(s628 + 0x10) == 0
						if (ld64(s628 + 0x10) != 0) {
							const em = ld64(s668 + 0x20)
							st64(s720 + 0x90, ba)
							st64(s668, am, ah)
							if ((ah ^ em | am ^ bc) != 0) {
								continue
							}
						}
						ao = ld64(s778 + 0x48)
						if ((ld64(s628) ^ ah | ld64(s628 + 0x30) ^ am) == 0) {
							break B132
						}
						if (ld64(s628 + 0x10) != 0) {
							continue L20
						}
						break B132
					}
				}
				const fx = ld64(s720 + 0x68)
				st64(fx + 8, ld64(s298))
				st64(fx, ld64(s720 + 0x28))
				return ac
			}
		}
	}
	if ((ld64(s720 + 0x98) | ld64(s628 + 0x38)) == 0 && ((aj & 1) == 0 && fi == 0)) {
		ac = fn_87630(s5c8, 0x39)
		bt = ld64(s5c8)
		fw = ld64(s720 + 0x68)
		st64(fw + 8, ld64(s5c8 + 8))
		st64(fw, bt)
		return ac
	}
	st64(sff8, ld64(s668 + 0x18))
	st64(s628 + 0x38, am)
	st64(sff0, am)
	st64(s1000, ld64(s720 + 0xb0))
	ac = fn_45af0(s5d8, s120, fb, ld64(s628 + 8), ld64(s1000), ld64(sff8), am, ah)
	const fj = ld64(s720 + 0xa8)
	const fk = ld64(s628 + 0x10)
	const fl = fi ^ ld64(s628 + 0x28)
	let fo = fj - fk
	if (fl == 0) {
		fo = ld64(s668 + 0x10)
	}
	if (fl == 0) {
		st64(s668 + 0x10, fj - fk)
	}
	el = ld64(s5d8)
	if (el == 2) {
		const fn = ba - ld64(s720 + 0x88)
		let fq = 0
		if (ld64(s110 + 0x10) != 2) {
			st16(s22 + 0x20, ld16(sae + 0x20))
			copyr(s22, sae, 0x20)
			memcpy(s4e, sdc, 0x2c)
			fq = 1
		}
		const fm = fn_e368(0x228, 8)
		st64(fm + 0x40, ld64(s720 + 0x50))
		st64(fm + 0x38, ld64(s720 + 0x40))
		st64(fm + 0x30, ld64(s628 + 0x38))
		st64(fm + 0x28, ld64(s668 + 0x18))
		st64(fm + 0x20, ld64(s640 + 8))
		st64(fm + 0x18, ld64(s640))
		st64(fm + 0x10, fn)
		st64(fm + 8, fo)
		st64(fm, ld64(s668 + 0x10))
		memcpy(fm + 0x48, s428, 0x180)
		st8(fm + 0x1d4, fq)
		st32(fm + 0x1d0, ld64(s720 + 0x60))
		st64(fm + 0x1c8, ld64(s720 + 0x88))
		ac = memcpy(fm + 0x1d5, s4e, 0x4e)
		const fr = ld64(s720 + 0x68)
		st64(fr + 8, fm)
		st64(fr, 2)
		return ac
	}
	ft = ld64(s5d8 + 8)
	fs = ld64(s720 + 0x68)
	st64(fs, el, ft)
	return ac
}

// not included (size budget), see shared.ts:
declare function fn_7cf50(a: u64, b: u64, c: TwoHopSwapV2Accounts, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64): u64
declare function fn_7e5e0(a: u64, b: u64, c: u64, d: TokenAccount_2, p5: TokenAccount_2, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64): u64
declare function fn_13ae08(a: u64, b: u64, c: u64): u64
declare function fn_147238(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never
declare function fn_14c698(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_1486f0(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_5dad8(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_14f060(a: u64, b: u64): u64
declare function fn_12dc70(a: u64, b: u64, c: u64, r0: u64): u64
declare function fn_afd0(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64
declare function fn_13b50(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64, r7: u64): u64
declare function fn_4e100(a: u64, b: u64, c: u64)
declare function fn_45408(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64
declare function fn_643d0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64
declare function fn_501e0(a: u64, b: u64, r0: u64): u64
declare function fn_53940(a: u64): u64
declare function fn_45de8(a: u64, b: u64, c: u64, d: u64, e: u64)
declare function fn_4e7c8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64)
declare function fn_45af0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, r0: u64): u64
