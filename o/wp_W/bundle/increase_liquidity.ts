// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction increase_liquidity: handler + 7 reachable functions
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
interface TokenAccount extends sized<0xb8> { // Account<TokenAccount> (anchor_spl, SPL Token Account) as unpacked in memory (fields [known: spl_token::state layout] at the offsets a run of try_accounts_11f50 put them [offsets from exec]; info = the &AccountInfo)
	info:             at<0x00, ref<AccountInfo>> // &AccountInfo
	mint:             at<0x08, Pubkey>
	owner:            at<0x28, Pubkey>
	amount:           at<0x48, u64>
	delegate:         at<0x54, Pubkey> // COption<Pubkey>
	is_native:        at<0x80, u64> // COption<u64>
	delegated_amount: at<0x88, u64>
	close_authority:  at<0x94, Pubkey> // COption<Pubkey>
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
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function try_accounts_558(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::interface_account::InterfaceAccount<T> as anchor_lang::Accounts<B>…
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11a48(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11b00(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11f50(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_129a0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from, memcmp
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function fn_1459d0(a: u64): u64 // lib uses repr_bitpacked_kind_from_prim_145358, callx
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp

// instruction handler: increase_liquidity (discriminator sha256("global:increase_liquidity")[..8] = 0xb2fbcd0d76f39c2e)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, position, position_token_account, token_owner_account_a, token_owner_account_b, tick_array_lower, tick_array_upper, token_program, token_vault_b, token_vault_a, position_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: accounts, accounts_len, ix_args_len
function ix_increase_liquidity(a: u64, b: u64, accounts: u64, accounts_len: u64, p5: u64, ix_args_len: u64): u64 {
	const s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0
	let i, j: u64
	sol_log(0x100155645 /* "Instruction: IncreaseLiquidity" */, 0x1e)
	const f = ix_args_len
	if (f >= 0x10 && ((f | 8) & -8) != 0x18) {
		st64(s3c0, accounts, accounts_len)
		j = accounts_increase_liquidity(s3b0, undef, s3c0, undef, fp)
		if (ld64(s3b0) == 0) {
			i = ld64(s3b0 + 8)
			st64(a + 8, ld64(s3b0 + 0x10))
			st64(a, i)
			return j
		}
		fn_1494c8("internal error: entered unreachable code", 0x28, 0x10015a928)
	}
	const g = fn_1459d0(0x100159468)
	if (2 > (g & 3) - 2) {
		j = anchor_error_from(s3d0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s3d0)
		st64(a + 8, ld64(s3d0 + 8))
		st64(a, i)
		return j
	}
	if ((g & 3) == 0) {
		j = anchor_error_from(s3d0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s3d0)
		st64(a + 8, ld64(s3d0 + 8))
		st64(a, i)
		return j
	}
	const h = ld64(ld64(g + 7))
	callx(h, ld64(g - 1), h)
	j = anchor_error_from(s3d0, 0x66 /* anchor::InstructionDidNotDeserialize */)
	i = ld64(s3d0)
	st64(a + 8, ld64(s3d0 + 8))
	st64(a, i)
	return j
}

// Anchor Accounts::try_accounts of instruction increase_liquidity (called by ix_increase_liquidity; name [str]: from the handler's "Instruction: …" log; was fn_94430)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool (ConstraintMut), position (ConstraintMut, ConstraintHasOne), position_token_account (ConstraintRaw), token_owner_account_a (ConstraintMut, ConstraintRaw), token_owner_account_b (ConstraintMut, ConstraintRaw), tick_array_lower (AccountNotEnoughKeys, ConstraintMut), tick_array_upper (ConstraintMut), token_program (ConstraintAddress), token_vault_b (ConstraintMut, ConstraintRaw), token_vault_a (ConstraintMut, ConstraintRaw), position_authority
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_token_account_box, token_owner_account_a_box, token_owner_account_b_box, token_vault_a_box, token_vault_b_box, token_vault_a, token_vault_b, tick_array_upper
function accounts_increase_liquidity(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, sf0 = fp - 0xf0, s100 = fp - 0x100, s110 = fp - 0x110, s118 = fp - 0x118, s388 = fp - 0x388, s390 = fp - 0x390, s3a8 = fp - 0x3a8, s430 = fp - 0x430, s450 = fp - 0x450, s470 = fp - 0x470, s490 = fp - 0x490, s620 = fp - 0x620, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s668 = fp - 0x668, s678 = fp - 0x678, s688 = fp - 0x688, s698 = fp - 0x698, s6a8 = fp - 0x6a8, s6b8 = fp - 0x6b8, s6c8 = fp - 0x6c8, s6d8 = fp - 0x6d8, s6e8 = fp - 0x6e8, s6f8 = fp - 0x6f8, s708 = fp - 0x708, s718 = fp - 0x718, s728 = fp - 0x728, s738 = fp - 0x738, s748 = fp - 0x748, s758 = fp - 0x758, s768 = fp - 0x768, s778 = fp - 0x778, s788 = fp - 0x788, s798 = fp - 0x798, s7a8 = fp - 0x7a8, s7b8 = fp - 0x7b8, s7c8 = fp - 0x7c8, s7d8 = fp - 0x7d8, s7e8 = fp - 0x7e8, s7f8 = fp - 0x7f8, s808 = fp - 0x808, s818 = fp - 0x818, s828 = fp - 0x828, s838 = fp - 0x838, s848 = fp - 0x848, s858 = fp - 0x858, s868 = fp - 0x868, s878 = fp - 0x878, s888 = fp - 0x888, s898 = fp - 0x898, s8a8 = fp - 0x8a8, s8b8 = fp - 0x8b8, s8c8 = fp - 0x8c8, s8d8 = fp - 0x8d8, s8e8 = fp - 0x8e8, s8f8 = fp - 0x8f8, s908 = fp - 0x908, s918 = fp - 0x918, s928 = fp - 0x928, s948 = fp - 0x948, s950 = fp - 0x950, s958 = fp - 0x958, s960 = fp - 0x960, s968 = fp - 0x968, s970 = fp - 0x970
	let ab, ac, ae, ag, ai, aj, aq: u64
	let g = a
	try_accounts_11a48(s3a8, c, c, d, e)
	const h = ld64(s3a8 + 0x10)
	const i = ld64(s3a8 + 8)
	const f = ld64(s3a8)
	if (f == 0) {
		aj = Error_with_account_name(s928, i, h, 0x100152b28 /* "whirlpool" */, 9)
		ai = ld64(s928)
		st64(g + 0x10, ld64(s928 + 8))
		st64(g + 8, ai)
		st64(g, 0)
		return aj
	}
	st64(s948 + 0x18, g)
	memcpy(s620, s390, 0x278)
	st64(s638, f, i, h)
	fn_129a0(s3a8, c)
	const m = ld64(s3a8 + 8)
	const j = ld64(s3a8)
	if (j == 2) {
		try_accounts_11718(s3a8, c)
		const l = ld64(s3a8 + 8)
		const k = ld64(s3a8)
		if (k == 2) {
			st64(s948, l, m, f)
			try_accounts_11b00(s3a8, c, l)
			const o = ld64(s3a8 + 0x10)
			const p = ld64(s3a8 + 8)
			const n = ld64(s3a8)
			if (n == 0) {
				aj = Error_with_account_name(s918, p, o, "position", 8)
				ai = ld64(s918)
				g = ld64(s948 + 0x18)
				st64(g + 0x10, ld64(s918 + 8))
				st64(g + 8, ai)
				st64(g, 0)
				return aj
			}
			memcpy(s100, s390, 0xc0)
			st64(s118, n, p, o)
			try_accounts_558(s3a8, c)
			if (ld32(s388 + 0x90) == 2) {
				aj = Error_with_account_name(s908, ld64(s3a8), ld64(s3a8 + 8), "position_token_account", 0x16)
				ai = ld64(s908)
				g = ld64(s948 + 0x18)
				st64(g + 0x10, ld64(s908 + 8))
				st64(g + 8, ai)
				st64(g, 0)
				return aj
			}
			const q = ld64(0x300000000 /* heap bump-allocator cursor */)
			st64(s950, c)
			const position_token_account_box: TokenAccount_2 = q != 0 ? sat_sub(q, 0xd8) & -8 : 0x300007f28
			if (position_token_account_box > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, position_token_account_box)
				memcpy(position_token_account_box, s3a8, 0xd8)
				try_accounts_11f50(s3a8, ld64(s950))
				if (ld32(s388 + 0x70) == 2) {
					aj = Error_with_account_name(s8f8, ld64(s3a8), ld64(s3a8 + 8), "token_owner_account_a", 0x15)
					ai = ld64(s8f8)
					g = ld64(s948 + 0x18)
					st64(g + 0x10, ld64(s8f8 + 8))
					st64(g + 8, ai)
					st64(g, 0)
					return aj
				}
				const s = ld64(0x300000000 /* heap bump-allocator cursor */)
				const token_owner_account_a_box: TokenAccount = s != 0 ? sat_sub(s, 0xb8) & -8 : 0x300007f48
				if (token_owner_account_a_box > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, token_owner_account_a_box)
					st64(s958, token_owner_account_a_box)
					memcpy(token_owner_account_a_box, s3a8, 0xb8)
					try_accounts_11f50(s3a8, ld64(s950))
					if (ld32(s388 + 0x70) == 2) {
						aj = Error_with_account_name(s8e8, ld64(s3a8), ld64(s3a8 + 8), "token_owner_account_b", 0x15)
						ai = ld64(s8e8)
						g = ld64(s948 + 0x18)
						st64(g + 0x10, ld64(s8e8 + 8))
						st64(g + 8, ai)
						st64(g, 0)
						return aj
					}
					const u = ld64(0x300000000 /* heap bump-allocator cursor */)
					const token_owner_account_b_box: TokenAccount = u != 0 ? sat_sub(u, 0xb8) & -8 : 0x300007f48
					st64(s960, n)
					if (token_owner_account_b_box > 0x300000007) {
						st64(0x300000000 /* heap bump-allocator cursor */, token_owner_account_b_box)
						memcpy(token_owner_account_b_box, s3a8, 0xb8)
						const w = ld64(s950)
						fn_20f8(s3a8, w)
						const token_vault_a_box: TokenAccount = ld64(s3a8 + 8)
						const x = ld64(s3a8)
						if (x == 2) {
							fn_20f8(s3a8, w)
							const token_vault_b_box: TokenAccount = ld64(s3a8 + 8)
							const y = ld64(s3a8)
							if (y == 2) {
								B29: {
									st64(s968, token_vault_b_box)
									const aa = ld64(w + 8)
									if (aa != 0) {
										ae = ld64(w)
										st64(w, ae + 0x30, aa - 1)
										if (aa != 1) {
											st64(s970, ae)
											st64(w + 8, aa - 2)
											ag = ld64(w)
											st64(w, ag + 0x30)
											break B29
										}
									} else {
										anchor_error_from(s688, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_b_box, ab, ac)
										ae = ld64(s688 + 8)
										const ad = ld64(s688)
										if (ad != 2) {
											aj = Error_with_account_name(s698, ad, ae, "tick_array_lower", 0x10)
											ai = ld64(s698)
											g = ld64(s948 + 0x18)
											st64(g + 0x10, ld64(s698 + 8))
											st64(g + 8, ai)
											st64(g, 0)
											return aj
										}
									}
									st64(s970, ae)
									anchor_error_from(s6a8, 0xbbd /* anchor::AccountNotEnoughKeys */, ae, ab, ac)
									ag = ld64(s6a8 + 8)
									const af = ld64(s6a8)
									if (af != 2) {
										aj = Error_with_account_name(s6b8, af, ag, "tick_array_upper", 0x10)
										ai = ld64(s6b8)
										g = ld64(s948 + 0x18)
										st64(g + 0x10, ld64(s6b8 + 8))
										st64(g + 8, ai)
										st64(g, 0)
										return aj
									}
								}
								st64(s950, token_vault_a_box)
								const ap = ld64(s948 + 0x18)
								if (ld8(ld64(s948 + 0x10) + 0x29 /* is_writable */) == 0) {
									anchor_error_from(s8c8, 0x7d0 /* anchor::ConstraintMut */, ag, ab, ac)
									aj = Error_with_account_name(s8d8, ld64(s8c8), ld64(s8c8 + 8), 0x100152b28 /* "whirlpool" */, 9)
									aq = ld64(s8d8)
									st64(ap + 0x10, ld64(s8d8 + 8))
									st64(ap + 8, aq)
									st64(ap, 0)
									return aj
								}
								const tick_array_upper: AccountInfo = ag
								const ak = ld64(ld64(s948 + 8))
								copyr(s20, ak, 0x20)
								if ((memcmp(s20, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
									anchor_error_from(s6c8, 0x7dc /* anchor::ConstraintAddress */)
									const ao = Error_with_account_name(s6d8, ld64(s6c8), ld64(s6c8 + 8), "token_program", 0xd)
									const an = ld64(s6d8 + 8)
									const am = ld64(s6d8)
									copyr(s3a8, s20, 0x20)
									st64(s388, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
									aj = fn_13b5c0(s6e8, am, an, s3a8, ao)
									aq = ld64(s6e8)
									st64(ap + 0x10, ld64(s6e8 + 8))
									st64(ap + 8, aq)
									st64(ap, 0)
									return aj
								}
								if (ld8(ld64(s960) + 0x29) == 0) {
									anchor_error_from(s8a8, 0x7d0 /* anchor::ConstraintMut */)
									aj = Error_with_account_name(s8b8, ld64(s8a8), ld64(s8a8 + 8), "position", 8)
									aq = ld64(s8b8)
									st64(ap + 0x10, ld64(s8b8 + 8))
									st64(ap + 8, aq)
									st64(ap, 0)
									return aj
								}
								st64(s960, token_owner_account_b_box)
								copyr(s40, s110, 0x20)
								const al = ld64(ld64(s948 + 0x10) /* key */)
								copyr(s20, al, 0x20)
								if ((memcmp(s40, s20, 0x20) as u32) != 0) {
									anchor_error_from(s6f8, 0x7d1 /* anchor::ConstraintHasOne */)
									const au = Error_with_account_name(s708, ld64(s6f8), ld64(s6f8 + 8), "position", 8)
									const at = ld64(s708 + 8)
									const ar = ld64(s708)
									copyr(s3a8, s110, 0x20)
									copy(s388, s20, 0x20)
									aj = fn_13b5c0(s718, ar, at, s3a8, au)
									aq = ld64(s718)
									st64(ap + 0x10, ld64(s718 + 8))
									st64(ap + 8, aq)
									st64(ap, 0)
									return aj
								}
								if ((memcmp(position_token_account_box.mint, sf0, 0x20) as u32) == 0) {
									if (position_token_account_box.amount != 1) {
										anchor_error_from(s748, 0x7d3 /* anchor::ConstraintRaw */)
										aj = Error_with_account_name(s758, ld64(s748), ld64(s748 + 8), "position_token_account", 0x16)
										ai = ld64(s758)
										g = ld64(s948 + 0x18)
										st64(g + 0x10, ld64(s758 + 8))
										st64(g + 8, ai)
										st64(g, 0)
										return aj
									}
									if (ld8(ld64(ld64(s958)) + 0x29) == 0) {
										anchor_error_from(s888, 0x7d0 /* anchor::ConstraintMut */)
										aj = Error_with_account_name(s898, ld64(s888), ld64(s888 + 8), "token_owner_account_a", 0x15)
										ai = ld64(s898)
										g = ld64(s948 + 0x18)
										st64(g + 0x10, ld64(s898 + 8))
										st64(g + 8, ai)
										st64(g, 0)
										return aj
									}
									if ((memcmp(ld64(s958) + 8, s490, 0x20) as u32) == 0) {
										if (ld8(ld64(ld64(s960)) + 0x29) != 0) {
											if ((memcmp(ld64(s960) + 8, s450, 0x20) as u32) == 0) {
												const token_vault_a: AccountInfo = ld64(ld64(s950))
												if (token_vault_a.is_writable != 0) {
													const aw = token_vault_a.key
													copyr(s3a8, aw, 0x20)
													if ((memcmp(s3a8, s470, 0x20) as u32) == 0) {
														const token_vault_b: AccountInfo = ld64(ld64(s968))
														if (token_vault_b.is_writable != 0) {
															const ay = token_vault_b.key
															copyr(s3a8, ay, 0x20)
															if ((memcmp(s3a8, s430, 0x20) as u32) == 0) {
																if (ld8(ld64(s970) + 0x29) != 0) {
																	if (tick_array_upper.is_writable != 0) {
																		const ba = ld64(s948 + 0x18)
																		memcpy(ba, s638, 0x290)
																		aj = memcpy(ba + 0x2a0, s118, 0xd8)
																		st64(ba + 0x3a8, tick_array_upper)
																		st64(ba + 0x3a0, ld64(s970))
																		st64(ba + 0x398, ld64(s968))
																		st64(ba + 0x390, ld64(s950))
																		st64(ba + 0x388, ld64(s960))
																		st64(ba + 0x380, ld64(s958))
																		st64(ba + 0x378, position_token_account_box)
																		st64(ba + 0x298, ld64(s948))
																		st64(ba + 0x290, ld64(s948 + 8))
																		return aj
																	}
																	anchor_error_from(s7e8, 0x7d0 /* anchor::ConstraintMut */)
																	aj = Error_with_account_name(s7f8, ld64(s7e8), ld64(s7e8 + 8), "tick_array_upper", 0x10)
																	ai = ld64(s7f8)
																	g = ld64(s948 + 0x18)
																	st64(g + 0x10, ld64(s7f8 + 8))
																	st64(g + 8, ai)
																	st64(g, 0)
																	return aj
																}
																anchor_error_from(s808, 0x7d0 /* anchor::ConstraintMut */)
																aj = Error_with_account_name(s818, ld64(s808), ld64(s808 + 8), "tick_array_lower", 0x10)
																ai = ld64(s818)
																g = ld64(s948 + 0x18)
																st64(g + 0x10, ld64(s818 + 8))
																st64(g + 8, ai)
																st64(g, 0)
																return aj
															}
															anchor_error_from(s7c8, 0x7d3 /* anchor::ConstraintRaw */)
															aj = Error_with_account_name(s7d8, ld64(s7c8), ld64(s7c8 + 8), "token_vault_b", 0xd)
															ai = ld64(s7d8)
															g = ld64(s948 + 0x18)
															st64(g + 0x10, ld64(s7d8 + 8))
															st64(g + 8, ai)
															st64(g, 0)
															return aj
														}
														anchor_error_from(s828, 0x7d0 /* anchor::ConstraintMut */)
														aj = Error_with_account_name(s838, ld64(s828), ld64(s828 + 8), "token_vault_b", 0xd)
														ai = ld64(s838)
														g = ld64(s948 + 0x18)
														st64(g + 0x10, ld64(s838 + 8))
														st64(g + 8, ai)
														st64(g, 0)
														return aj
													}
													anchor_error_from(s7a8, 0x7d3 /* anchor::ConstraintRaw */)
													aj = Error_with_account_name(s7b8, ld64(s7a8), ld64(s7a8 + 8), "token_vault_a", 0xd)
													ai = ld64(s7b8)
													g = ld64(s948 + 0x18)
													st64(g + 0x10, ld64(s7b8 + 8))
													st64(g + 8, ai)
													st64(g, 0)
													return aj
												}
												anchor_error_from(s848, 0x7d0 /* anchor::ConstraintMut */)
												aj = Error_with_account_name(s858, ld64(s848), ld64(s848 + 8), "token_vault_a", 0xd)
												ai = ld64(s858)
												g = ld64(s948 + 0x18)
												st64(g + 0x10, ld64(s858 + 8))
												st64(g + 8, ai)
												st64(g, 0)
												return aj
											}
											anchor_error_from(s788, 0x7d3 /* anchor::ConstraintRaw */)
											aj = Error_with_account_name(s798, ld64(s788), ld64(s788 + 8), "token_owner_account_b", 0x15)
											ai = ld64(s798)
											g = ld64(s948 + 0x18)
											st64(g + 0x10, ld64(s798 + 8))
											st64(g + 8, ai)
											st64(g, 0)
											return aj
										}
										anchor_error_from(s868, 0x7d0 /* anchor::ConstraintMut */)
										aj = Error_with_account_name(s878, ld64(s868), ld64(s868 + 8), "token_owner_account_b", 0x15)
										ai = ld64(s878)
										g = ld64(s948 + 0x18)
										st64(g + 0x10, ld64(s878 + 8))
										st64(g + 8, ai)
										st64(g, 0)
										return aj
									}
									anchor_error_from(s768, 0x7d3 /* anchor::ConstraintRaw */)
									aj = Error_with_account_name(s778, ld64(s768), ld64(s768 + 8), "token_owner_account_a", 0x15)
									ai = ld64(s778)
									g = ld64(s948 + 0x18)
									st64(g + 0x10, ld64(s778 + 8))
									st64(g + 8, ai)
									st64(g, 0)
									return aj
								}
								anchor_error_from(s728, 0x7d3 /* anchor::ConstraintRaw */)
								aj = Error_with_account_name(s738, ld64(s728), ld64(s728 + 8), "position_token_account", 0x16)
								aq = ld64(s738)
								st64(ap + 0x10, ld64(s738 + 8))
								st64(ap + 8, aq)
								st64(ap, 0)
								return aj
							}
							aj = Error_with_account_name(s678, y, token_vault_b_box, "token_vault_b", 0xd)
							ai = ld64(s678)
							g = ld64(s948 + 0x18)
							st64(g + 0x10, ld64(s678 + 8))
							st64(g + 8, ai)
							st64(g, 0)
							return aj
						}
						aj = Error_with_account_name(s668, x, token_vault_a_box, "token_vault_a", 0xd)
						ai = ld64(s668)
						g = ld64(s948 + 0x18)
						st64(g + 0x10, ld64(s668 + 8))
						st64(g + 8, ai)
						st64(g, 0)
						return aj
					}
					alloc_handle_alloc_error(8, 0xb8)
				}
				alloc_handle_alloc_error(8, 0xb8)
			}
			alloc_handle_alloc_error(8, 0xd8)
		}
		aj = Error_with_account_name(s658, k, l, "position_authority", 0x12)
		ai = ld64(s658)
		g = ld64(s948 + 0x18)
		st64(g + 0x10, ld64(s658 + 8))
		st64(g + 8, ai)
		st64(g, 0)
		return aj
	}
	aj = Error_with_account_name(s648, j, m, "token_program", 0xd)
	ai = ld64(s648)
	g = ld64(s948 + 0x18)
	st64(g + 0x10, ld64(s648 + 8))
	st64(g + 8, ai)
	st64(g, 0)
	return aj
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: e (value)
function fn_1494c8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s10 = fp - 0x10, s38 = fp - 0x38, s40 = fp - 0x40
	st64(s40, s10)
	st64(s10, a, b)
	st64(s38, 1, 8, 0, 0)
	fn_149478(s40, c, c, s10, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
// types [heur]: c: TokenAccount (6 of 12 calls pass one, the others an untyped value: accounts_collect_fees, accounts_two_hop_swap)
function fn_20f8(a: u64, b: u64, c: TokenAccount, d: u64, e: u64) {
	const sb8 = fp - 0xb8
	try_accounts_11f50(sb8, b, c, d, e)
	if (ld32(sb8 + 0x90) == 2) {
		const h = ld64(sb8)
		st64(a + 8, ld64(sb8 + 8))
		st64(a, h)
	} else {
		const f = ld64(0x300000000 /* heap bump-allocator cursor */)
		const g = f != 0 ? sat_sub(f, 0xb8) & -8 : 0x300007f48
		if (0x300000007 >= g) {
			alloc_handle_alloc_error(8, 0xb8)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, sb8, 0xb8)
		st64(a + 8, g)
		st64(a, 2)
	}
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
