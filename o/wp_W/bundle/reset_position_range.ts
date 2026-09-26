// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction reset_position_range: handler + 16 reachable functions
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
interface ResetPositionRangeAccounts { // Accounts struct of instruction reset_position_range as accounts_reset_position_range returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	funder:                 at<0x00, ref<AccountInfo>>
	position_authority:     at<0x08, ref<AccountInfo>>
	position_token_account: at<0x20, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
}
interface ResetPositionRangeContext { // anchor_lang Context of instruction reset_position_range (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<ResetPositionRangeAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function try_accounts_558(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::interface_account::InterfaceAccount<T> as anchor_lang::Accounts<B>…
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function fn_fa00(a: u64, b: u64): u64 // lib
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11a48(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11b00(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_122e8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_1390d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcmp, AccountInfo_try_borrow_lamports, AccountInfo_try_borrow_data
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function rent_get(a: u64): u64 // lib solana_sysvar::rent::<impl solana_sysvar::Sysvar for solana_rent::Rent>::get
declare function fn_142e70(a: u64, b: u64, c: u64, d: u64): void // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_1459d0(a: u64): u64 // lib uses repr_bitpacked_kind_from_prim_145358, callx
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fn_14ecd0(a: u64, b: u64, c: u64): u64 // lib "0001020304050607080910111213141516171819…", "0001020304050607080910111213141516171819…"
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function fn_151bf8(a: u64, b: u64): u64 // lib

// instruction handler: reset_position_range (discriminator sha256("global:reset_position_range")[..8] = 0xafa064c28db47ba4)
// accounts [str: the program's account-error strings, in order of first use]: funder, whirlpool, position, position_token_account, system_program, position_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position
function ix_reset_position_range(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s30 = fp - 0x30, s48 = fp - 0x48, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0
	let j, n: u64
	sol_log("Instruction: ResetPositionRange", 0x1f)
	const f = ix_args_len
	if (f >= 4 && (f & -4) != 4) {
		const g = ix_args
		const k = ld32(g)
		const o = ld32(g + 4)
		st64(s70, accounts, accounts_len)
		n = accounts_reset_position_range(s30, undef, s70, undef, fp)
		let i = ld64(s20)
		j = ld64(s30 + 8)
		const h = ld64(s30)
		if (h == 0) {
			st64(a + 8, i)
			st64(a, j)
			return n
		}
		copyr(s48, s18, 0x18)
		st64(s60, h, j, i)
		copyr(s20, s70, 0x10)
		st64(s30, program_id, s60)
		n = fn_35bf0(s80, s30, k, o)
		j = ld64(s80)
		if (j == 2) {
			n = fn_5a40(s90, ld64(s48), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
			i = ld64(s90)
			if (i != 2) {
				n = Error_with_account_name(sa0, i, ld64(s90 + 8), "position", 8)
				j = ld64(sa0)
				st64(a + 8, ld64(sa0 + 8))
				st64(a, j)
				return n
			}
			st64(a + 8, i)
			st64(a, 2)
			return n
		}
		st64(a + 8, ld64(s80 + 8))
		st64(a, j)
		return n
	}
	const l = fn_1459d0(0x100159468)
	if (2 > (l & 3) - 2) {
		n = anchor_error_from(sb0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(sb0)
		st64(a + 8, ld64(sb0 + 8))
		st64(a, j)
		return n
	}
	if ((l & 3) == 0) {
		n = anchor_error_from(sb0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(sb0)
		st64(a + 8, ld64(sb0 + 8))
		st64(a, j)
		return n
	}
	const m = ld64(ld64(l + 7))
	callx(m, ld64(l - 1), m)
	n = anchor_error_from(sb0, 0x66 /* anchor::InstructionDidNotDeserialize */)
	j = ld64(sb0)
	st64(a + 8, ld64(sb0 + 8))
	st64(a, j)
	return n
}

// Anchor Accounts::try_accounts of instruction reset_position_range (called by ix_reset_position_range; name [str]: from the handler's "Instruction: …" log; was fn_c5d50)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: funder (ConstraintMut), whirlpool, position (ConstraintMut, ConstraintHasOne), position_token_account (ConstraintRaw), system_program, position_authority
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_token_account_box, funder
function accounts_reset_position_range(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3e8 = fp - 0x3e8, s3f0 = fp - 0x3f0, s3f8 = fp - 0x3f8
	let t, x: u64
	try_accounts_11718(s290, c, c, d, e)
	const funder: AccountInfo = ld64(s290 + 8)
	const f = ld64(s290)
	if (f != 2) {
		t = Error_with_account_name(s2e0, f, funder, "funder", 6)
		x = ld64(s2e0)
		st64(a + 0x10, ld64(s2e0 + 8))
		st64(a + 8, x)
		st64(a, 0)
		return t
	}
	try_accounts_11718(s290, c)
	const i = ld64(s290 + 8)
	const g = ld64(s290)
	if (g == 2) {
		try_accounts_11a48(s290, c)
		if (ld64(s290) == 0) {
			t = Error_with_account_name(s3e0, ld64(s290 + 8), ld64(s290 + 0x10), 0x100152b28 /* "whirlpool" */, 9)
			x = ld64(s3e0)
			st64(a + 0x10, ld64(s3e0 + 8))
			st64(a + 8, x)
			st64(a, 0)
			return t
		}
		const h = ld64(0x300000000 /* heap bump-allocator cursor */)
		const j = h != 0 ? sat_sub(h, 0x290) & -8 : 0x300007d70
		st64(s3e8, i)
		if (j > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(s3f0, j)
			memcpy(j, s290, 0x290)
			try_accounts_11b00(s290, c)
			if (ld64(s290) == 0) {
				t = Error_with_account_name(s3d0, ld64(s290 + 8), ld64(s290 + 0x10), "position", 8)
				x = ld64(s3d0)
				st64(a + 0x10, ld64(s3d0 + 8))
				st64(a + 8, x)
				st64(a, 0)
				return t
			}
			const l = ld64(0x300000000 /* heap bump-allocator cursor */)
			const m = l != 0 ? sat_sub(l, 0xd8) & -8 : 0x300007f28
			if (m > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(s3f8, m)
				memcpy(m, s290, 0xd8)
				try_accounts_558(s290, c)
				if (ld32(s290 + 0xb0) == 2) {
					t = Error_with_account_name(s3c0, ld64(s290), ld64(s290 + 8), "position_token_account", 0x16)
					x = ld64(s3c0)
					st64(a + 0x10, ld64(s3c0 + 8))
					st64(a + 8, x)
					st64(a, 0)
					return t
				}
				const n = ld64(0x300000000 /* heap bump-allocator cursor */)
				const position_token_account_box: TokenAccount_2 = n != 0 ? sat_sub(n, 0xd8) & -8 : 0x300007f28
				if (position_token_account_box > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, position_token_account_box)
					memcpy(position_token_account_box, s290, 0xd8)
					fn_122e8(s290, c)
					const r = ld64(s290 + 8)
					const p = ld64(s290)
					if (p == 2) {
						if (funder.is_writable == 0) {
							anchor_error_from(s3a0, 0x7d0 /* anchor::ConstraintMut */, r)
							t = Error_with_account_name(s3b0, ld64(s3a0), ld64(s3a0 + 8), "funder", 6)
							x = ld64(s3b0)
							st64(a + 0x10, ld64(s3b0 + 8))
							st64(a + 8, x)
							st64(a, 0)
							return t
						}
						const q = ld64(s3f8)
						if (ld8(ld64(q) + 0x29) != 0) {
							copyr(s2d0, q + 8, 0x20)
							const s = ld64(ld64(ld64(s3f0)))
							copyr(s2b0, s, 0x20)
							if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
								anchor_error_from(s310, 0x7d1 /* anchor::ConstraintHasOne */)
								const w = Error_with_account_name(s320, ld64(s310), ld64(s310 + 8), "position", 8)
								const v = ld64(s320 + 8)
								const u = ld64(s320)
								copy(s290, s2d0, 0x40)
								t = fn_13b5c0(s330, u, v, s290, w)
								x = ld64(s330)
								st64(a + 0x10, ld64(s330 + 8))
								st64(a + 8, x)
								st64(a, 0)
								return t
							}
							if (position_token_account_box.amount == 1) {
								t = memcmp(position_token_account_box.mint, ld64(s3f8) + 0x28, 0x20) as u32
								if (t == 0) {
									st64(a + 0x28, r)
									st64(a + 0x20, position_token_account_box)
									st64(a + 0x18, ld64(s3f8))
									st64(a + 0x10, ld64(s3f0))
									st64(a + 8, ld64(s3e8))
									st64(a, funder)
									return t
								}
								anchor_error_from(s360, 0x7d3 /* anchor::ConstraintRaw */)
								t = Error_with_account_name(s370, ld64(s360), ld64(s360 + 8), "position_token_account", 0x16)
								x = ld64(s370)
								st64(a + 0x10, ld64(s370 + 8))
								st64(a + 8, x)
								st64(a, 0)
								return t
							}
							anchor_error_from(s340, 0x7d3 /* anchor::ConstraintRaw */)
							t = Error_with_account_name(s350, ld64(s340), ld64(s340 + 8), "position_token_account", 0x16)
							x = ld64(s350)
							st64(a + 0x10, ld64(s350 + 8))
							st64(a + 8, x)
							st64(a, 0)
							return t
						}
						anchor_error_from(s380, 0x7d0 /* anchor::ConstraintMut */, r)
						t = Error_with_account_name(s390, ld64(s380), ld64(s380 + 8), "position", 8)
						x = ld64(s390)
						st64(a + 0x10, ld64(s390 + 8))
						st64(a + 8, x)
						st64(a, 0)
						return t
					}
					t = Error_with_account_name(s300, p, r, "system_program", 0xe)
					x = ld64(s300)
					st64(a + 0x10, ld64(s300 + 8))
					st64(a + 8, x)
					st64(a, 0)
					return t
				}
				alloc_handle_alloc_error(8, 0xd8)
			}
			alloc_handle_alloc_error(8, 0xd8)
		}
		alloc_handle_alloc_error(8, 0x290)
	}
	t = Error_with_account_name(s2f0, g, i, "position_authority", 0x12)
	x = ld64(s2f0)
	st64(a + 0x10, ld64(s2f0 + 8))
	st64(a + 8, x)
	st64(a, 0)
	return t
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value)
// types [heur]: b: ResetPositionRangeContext (the handler ix_reset_position_range passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_35bf0(a: u64, b: ResetPositionRangeContext, c: u64, d: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s68 = fp - 0x68, s70 = fp - 0x70, s98 = fp - 0x98, sa0 = fp - 0xa0, sc8 = fp - 0xc8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168
	let h = a
	const accounts: ResetPositionRangeAccounts = b.accounts
	let aw = fn_60480(s128, accounts.position_token_account, accounts + 8)
	let ax = ld64(s128 + 8)
	let g = ld64(s128)
	if (g != 2) {
		st64(h, g, ax)
		return aw
	}
	const bk: AccountInfo = ld64(accounts + 0x28)
	let bj = accounts.funder
	const i: AccountInfo = ld64(ld64(accounts + 0x18))
	aw = fn_5fd40(s138)
	ax = ld64(s138 + 8)
	g = ld64(s138)
	if (g != 2) {
		st64(h, g, ax)
		return aw
	}
	aw = fn_5fd40(s148)
	ax = ld64(s148 + 8)
	g = ld64(s148)
	if (g != 2) {
		st64(h, g, ax)
		return aw
	}
	const bi = h
	const j: LamportsCell = i.lamports
	const p = i.key
	rc_inc(j)
	const k: DataCell = i.data
	rc_inc(k)
	const o = i.owner
	const n = i.rent_epoch
	const m = i.is_signer
	const l = i.is_writable
	st8(sa0 + 2, i.executable)
	st8(sa0, m, l)
	st64(sc8, p, j, k, o, n)
	const t = fn_143100(sc8, l, k, o, n)
	const s = ld64(sc8 + 0x10)
	const q = ld64(sc8 + 8)
	let r = ld64(q) - 1
	st64(q, r)
	if (r == 0) {
		r = ld64(q + 8) - 1
		st64(q + 8, r)
	}
	let ao = d
	h = bi
	rc_dec(s)
	if (t > 0x3c527f) {
		aw = fn_5c530(s168, ld64(accounts + 0x18) + 8, ld64(accounts + 0x10), c, ao)
		ax = ld64(s168 + 8)
		st64(h, ld64(s168))
		st64(h + 8, ax)
		return aw
	}
	if (0x248880 > t) {
		st64(sc8, 0x100159830, 1, s8, 0, 0)
		// fmt "internal error: entered unreachable code: The position account must hold sufficient rent-exempt balance for itself"
		fn_149478(sc8, 0x100159b80, r, undef, ao)
	}
	const u: LamportsCell = i.lamports
	const x = i.key
	rc_inc(u)
	const v: DataCell = i.data
	rc_inc(v)
	const bd = i.executable
	const be = i.is_writable
	const bf = i.is_signer
	const bg = i.rent_epoch
	const bh = i.owner
	const w: AccountInfo = bj
	fn_142e70(s118, ld64(bj), x, 0x3c5280 - t)
	const y = ld64(bj + 8)
	const aa = ld64(bj)
	rc_inc(y)
	const z: DataCell = w.data
	rc_inc(z)
	const ab: LamportsCell = bk.lamports
	const ay = bk.key
	const az = w.executable
	const ba = w.is_writable
	const bb = w.is_signer
	const bc = w.rent_epoch
	const ad = w.owner
	rc_inc(ab)
	const ac: DataCell = bk.data
	bj = ad
	rc_inc(ac)
	const ah = bk.owner
	const ag = bk.rent_epoch
	const af = bk.is_signer
	const ae = bk.is_writable
	st8(s40 + 2, bk.executable)
	st8(s40, af, ae)
	st64(s68, ay, ab, ac, ah, ag)
	st8(s70, bf, be, bd)
	st64(s98, x, u, v, bh, bg)
	st8(sa0, bb, ba, az)
	st64(sc8, aa, y, z, bj, bc)
	fn_1390b0(s38, s118, sc8, 3)
	if (ld64(s38) == 0x800000000000001a /* Ok */) {
		const aj = ld64(sc8 + 0x10)
		const ai = ld64(sc8 + 8)
		ao = d
		rc_dec(ai)
		rc_dec(aj)
		const al: DataCell = ld64(s98 + 0x10)
		const ak: LamportsCell = ld64(s98 + 8)
		rc_dec(ak)
		rc_dec(al)
		const an: DataCell = ld64(s68 + 0x10)
		const am: LamportsCell = ld64(s68 + 8)
		rc_dec(am)
		if (!rc_release(an)) {
			aw = fn_5c530(s168, ld64(accounts + 0x18) + 8, ld64(accounts + 0x10), c, ao)
			ax = ld64(s168 + 8)
			st64(h, ld64(s168))
			st64(h + 8, ax)
			return aw
		}
		an.weak = an.weak - 1
		aw = fn_5c530(s168, ld64(accounts + 0x18) + 8, ld64(accounts + 0x10), c, ao)
		ax = ld64(s168 + 8)
		st64(h, ld64(s168))
		st64(h + 8, ax)
		return aw
	}
	copyr(s20, s38, 0x18)
	fn_13b430(s158, s20)
	ax = ld64(s158 + 8)
	const aq = ld64(sc8 + 0x10)
	g = ld64(s158)
	const ap = ld64(sc8 + 8)
	ao = d
	rc_dec(ap)
	rc_dec(aq)
	const at: DataCell = ld64(s98 + 0x10)
	const ar: LamportsCell = ld64(s98 + 8)
	rc_dec(ar)
	rc_dec(at)
	const av: DataCell = ld64(s68 + 0x10)
	const au: LamportsCell = ld64(s68 + 8)
	rc_dec(au)
	aw = av.strong - 1
	av.strong = aw
	if (aw == 0) {
		aw = av.weak - 1
		av.weak = aw
	}
	if (g == 2) {
		aw = fn_5c530(s168, ld64(accounts + 0x18) + 8, ld64(accounts + 0x10), c, ao)
		ax = ld64(s168 + 8)
		st64(h, ld64(s168))
		st64(h + 8, ax)
		return aw
	}
	st64(h, g, ax)
	return aw
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_5a40(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let t, u, v: u64
	const f = memcmp(c, d, 0x20)
	let q = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, q)
		st64(a, 2)
		return g
	}
	const h = ld64(b)
	g = common_is_closed(h)
	q = undef
	if (g != 0) {
		st64(a + 8, q)
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
		const x = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, x)
		return g
	}
	B21: {
		const k = ld64(j)
		st64(s28 + 8, ld64(j + 8))
		st64(s28, k)
		st64(s28 + 0x10, 0)
		g = fn_13ae08(s28, 0x100151f30, 8)
		if (g == 0) {
			g = fn_13ae08(s28, b + 8, 0x20)
			if (g == 0) {
				g = fn_13ae08(s28, b + 0x28, 0x20)
				if (g == 0) {
					const n = ld64(b + 0x48)
					st64(s10 + 8, ld64(b + 0x50))
					st64(s10, n)
					g = fn_13ae08(s28, s10, 0x10)
					if (g == 0) {
						st32(s10, ld32(b + 0xd0))
						g = fn_13ae08(s28, s10, 4)
						if (g == 0) {
							st32(s10, ld32(b + 0xd4))
							g = fn_13ae08(s28, s10, 4)
							if (g == 0) {
								const o = ld64(b + 0x58)
								st64(s10 + 8, ld64(b + 0x60))
								st64(s10, o)
								g = fn_13ae08(s28, s10, 0x10)
								if (g == 0) {
									st64(s10, ld64(b + 0x78))
									g = fn_13ae08(s28, s10, 8)
									if (g == 0) {
										const p = ld64(b + 0x68)
										st64(s10 + 8, ld64(b + 0x70))
										st64(s10, p)
										g = fn_13ae08(s28, s10, 0x10)
										if (g == 0) {
											st64(s10, ld64(b + 0x80))
											g = fn_13ae08(s28, s10, 8)
											if (g == 0) {
												g = fn_fa00(b + 0x88, s28)
												if (g == 0) {
													q = ld64(m) + 1
													st64(m, q)
													st64(a + 8, q)
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
			const r = g
			if (2 > (g & 3) - 2) {
				break B21
			}
			if ((r & 3) == 0) {
				break B21
			}
		} else {
			const l = g
			if (2 > (g & 3) - 2) {
				break B21
			}
			if ((l & 3) == 0) {
				break B21
			}
		}
		const s = ld64(ld64(g + 7))
		callx(s, ld64(g - 1), s)
	}
	g = anchor_error_from(s48, 0xbbc /* anchor::AccountDidNotSerialize */, t, u, v)
	q = ld64(s48 + 8)
	const w = ld64(s48)
	st64(m, ld64(m) + 1)
	st64(a + 8, q)
	st64(a, w != 2 ? w : 2)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// types [heur]: b: TokenAccount_2 (5 of 7 calls pass one, the others an untyped value: fn_310a0, fn_33380, fn_35bf0, …)
function fn_60480(a: u64, b: TokenAccount_2, c: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30
	let l, m, n, s: u64
	const f: AccountInfo = ld64(c)
	const g = f.key
	if (ld32(b + 0x70) != 0 && (memcmp(g, b.delegate, 0x20) as u32) == 0) {
		const o: LamportsCell = f.lamports
		rc_inc(o)
		const p: DataCell = f.data
		rc_inc(p)
		B17: {
			const q = f.is_signer
			const r = memcmp(b.delegate, g, 0x20)
			n = undef
			if (q != 0) {
				m = 2
				l = r as u32
				if (l == 0) {
					break B17
				}
			}
			l = fn_87630(s10, 0x13)
			n = ld64(s10 + 8)
			m = ld64(s10)
		}
		rc_dec(o)
		s = a
		rc_dec(p)
		if (m != 2) {
			st64(s + 8, n)
			st64(s, m)
			return l
		}
		if (b.delegated_amount == 1) {
			st64(s + 8, n)
			st64(s, 2)
			return l
		}
		l = fn_87630(s20, 0x14)
		m = ld64(s20)
		st64(s + 8, ld64(s20 + 8))
		st64(s, m)
		return l
	}
	const h: LamportsCell = f.lamports
	rc_inc(h)
	const i: DataCell = f.data
	rc_inc(i)
	B8: {
		const j = f.is_signer
		const k = memcmp(b.owner, g, 0x20)
		n = undef
		if (j != 0) {
			l = k as u32
			if (l == 0) {
				break B8
			}
		}
		l = fn_87630(s30, 0x13)
		n = undef
		m = ld64(s30)
		if (m != 2) {
			n = ld64(s30 + 8)
			rc_dec(h)
			s = a
			if (!rc_release(i)) {
				st64(s + 8, n)
				st64(s, m)
				return l
			}
			i.weak = i.weak - 1
			st64(s + 8, n)
			st64(s, m)
			return l
		}
	}
	rc_dec(h)
	s = a
	if (!rc_release(i)) {
		st64(s + 8, n)
		st64(s, 2)
		return l
	}
	n = i.weak - 1
	i.weak = n
	st64(s + 8, n)
	st64(s, 2)
	return l
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
function fn_5fd40(a: u64): u64 {
	const s28 = fp - 0x28, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s98 = fp - 0x98, sc8 = fp - 0xc8, se0 = fp - 0xe0, sf8 = fp - 0xf8, s108 = fp - 0x108
	let j = rent_get(s70)
	copy(se0, s68, 0x18)
	if (ld64(s70) != 0) {
		j = fn_13b430(s108, se0)
		const i = ld64(s108)
		st64(a + 8, ld64(s108 + 8))
		st64(a, i)
		return j
	}
	st64(sf8 + 0x10, ld64(se0 + 0x10))
	const f = ld64(se0)
	st64(sf8, f)
	const g = ld64(se0 + 8)
	st64(sf8 + 8, g)
	let h = 0x3ff0000000000000
	if (g == 0x3ff0000000000000) {
		if (0x1b31 > f) {
			st64(a + 8, f)
			st64(a, 2)
			return j
		}
	} else {
		h = 0x4000000000000000
		if (g == 0x4000000000000000 && f == 0xd98) {
			st64(a + 8, f)
			st64(a, 2)
			return j
		}
	}
	st64(s98, sf8, fn_14f060, s78, fn_14e7a8, g)
	st64(s28 + 0x18, 0xc00000020)
	st8(s28 + 0x20, 3)
	st64(s28, 0, 0x12, 1)
	st64(s50 + 0x18, 2)
	st8(s50 + 0x10, 3)
	st64(s50, 0, 0x20)
	st64(s68 + 8, 2)
	st64(s70, 2)
	st64(sc8, 0x10015a0c0, 2, s98, 2, s70, 2)
	// fmt pieces ["internal error: entered unreachable code: unexpected Rent configuration on the Solana network: lamports_per_byte_year=",", exemption_threshold_bits="] (with placeholder specs), arguments: *sf8 [fn_14f060], g [fn_14e7a8]
	fn_149478(sc8, 0x10015a0e0, h)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), c (points to it)
function fn_1390b0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1000 = fp - 0x1000
	st64(s1000, 8, 0)
	return fn_1390d8(a, b, c, d, fp)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), e (value)
function fn_5c530(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40
	let f, g, h: u64
	if ((ld64(b + 0x90) | ld64(b + 0xa8)) != 0) {
		h = fn_87630(s30, 5)
		g = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, g)
		return h
	}
	if (ld64(b + 0x70) != 0) {
		h = fn_87630(s30, 5)
		g = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, g)
		return h
	}
	if ((ld64(b + 0x40) | ld64(b + 0x48)) != 0) {
		h = fn_87630(s30, 5)
		g = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, g)
		return h
	}
	if ((ld64(b + 0xc0) | ld64(b + 0x78)) == 0) {
		if (ld32(b + 0xc8) == (d as u32) && ld32(b + 0xcc) == (e as u32)) {
			h = fn_87630(s20, 0x3c)
			g = ld64(s20)
			st64(a + 8, ld64(s20 + 8))
			st64(a, g)
			return h
		}
		B19: {
			st64(s40, b, e)
			let j = 0xa
			if (((d - 0x6c4f5) as u32) >= 0xfff27617) {
				const i = ld16(c + 0x284)
				if (i == 0) {
					fn_14e1c0(0x100159f48, 0xa, c, 0xfff27617, e)
				}
				const k = fn_151bf8(d as i32, i)
				j = 0xa
				if (((ld64(s40 + 8) - 0x6c4f5) as u32) >= 0xfff27617 && (k as u32) == 0) {
					const l = ld64(s40 + 8)
					const m = fn_151bf8(l as i32, i)
					j = 0xa
					if ((l as i32) > (d as i32)) {
						h = m as u32
						if (h == 0) {
							if ((i as i16) > -1) {
								break B19
							}
							j = 0x36
							const n = 0x6c4f4 % i
							if (((n - 0x6c4f4) as u32) == (d as u32) && 0x6c4f4 - n == (ld64(s40 + 8) as u32)) {
								break B19
							}
						}
					}
				}
			}
			h = fn_87630(s10, j)
			f = ld64(s10 + 8)
			g = ld64(s10)
			if (g != 2) {
				st64(a + 8, f)
				st64(a, g)
				return h
			}
		}
		const o = ld64(s40)
		f = ld64(s40 + 8)
		st32(o + 0xcc, f)
		st32(o + 0xc8, d)
		st64(o + 0xb8, 0)
		st64(o + 0xb0, 0)
		st64(o + 0xa0, 0)
		st64(o + 0x98, 0)
		st64(o + 0x88, 0)
		st64(o + 0x80, 0)
		st64(o + 0x50, 0, 0, 0, 0)
		st64(a + 8, f)
		st64(a, 2)
		return h
	}
	h = fn_87630(s30, 5)
	g = ld64(s30)
	st64(a + 8, ld64(s30 + 8))
	st64(a, g)
	return h
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_149478(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	const s20 = fp - 0x20, s28 = fp - 0x28
	st64(s20, 0x10015b8e0, a, b)
	st16(s20 + 0x18, 1)
	st64(s28, 1)
	fn_147238(s28, b, c, d, e)
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

function fn_14f060(a: u64, b: u64): u64 {
	return fn_14ecd0(ld64(a), 1, b)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), e (value)
function fn_14e1c0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x10015bb90, 1, 8, 0, 0)
	// fmt "attempt to calculate the remainder with a divisor of zero"
	fn_149478(s30, a, c, d, e)
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
