// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction collect_fees: handler + 13 reachable functions
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
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_invoke_signed_rust(ix: u64, accountInfos: u64, accountInfosLen: u64, signerSeeds: u64, signerSeedsLen: u64): u64 // CPI (Rust ABI: &Instruction, &[AccountInfo], &[&[&[u8]]])
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function try_accounts_558(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::interface_account::InterfaceAccount<T> as anchor_lang::Accounts<B>…
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function fn_fa00(a: u64, b: u64): u64 // lib
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11a48(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11b00(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11f50(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_129a0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from, memcmp
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function ptr_drop_in_place_125960(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 3]>
declare function ptr_drop_in_place_126088(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<alloc::vec::Vec<solana_account_info::AccountInfo>>
declare function fn_133a38(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses raw_vec_handle_error
declare function fn_133b80(a: u64, b: u64): void // lib uses raw_vec_handle_error
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function AccountInfo_try_borrow_lamports(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_lamports
declare function fn_143340(a: u64, b: u64, r0: u64): u64 // lib
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_144198(a: u64, b: u64, r0: u64): u64 // lib uses __rust_alloc, raw_vec_handle_error
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp

// instruction handler: collect_fees (discriminator sha256("global:collect_fees")[..8] = 0xb613ba1e63cf98a4)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, position, position_token_account, token_owner_account_a, token_vault_a, token_owner_account_b, token_vault_b, token_program, position_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
function ix_collect_fees(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s30 = fp - 0x30, s48 = fp - 0x48, s50 = fp - 0x50, s78 = fp - 0x78, s88 = fp - 0x88, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, s1000 = fp - 0x1000
	sol_log("Instruction: CollectFees", 0x18)
	st64(sa0, accounts, accounts_len)
	let n = accounts_collect_fees(s48, undef, sa0, undef, fp)
	const g = ld64(s48 + 0x10)
	let h = ld64(s48 + 8)
	const f = ld64(s48)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return n
	}
	memcpy(s78, s30, 0x30)
	st64(s90, f, h, g)
	n = fn_60480(sb0, ld64(s78), s88)
	h = ld64(sb0)
	if (h != 2) {
		st64(a + 8, ld64(sb0 + 8))
		st64(a, h)
		return n
	}
	const i = ld64(g + 0x78)
	st64(g + 0x78, 0)
	const o = ld64(g + 0x80)
	st64(g + 0x80, 0)
	const k = ld64(s78 + 8)
	const j = ld64(s78 + 0x10)
	st64(s1000, s50, i)
	n = fn_652d0(sc0, f, j, k, s50, i)
	h = ld64(sc0)
	if (h == 2) {
		const m = ld64(s78 + 0x18)
		const l = ld64(s78 + 0x20)
		st64(s1000, s50, o)
		n = fn_652d0(sd0, f, l, m, s50, o)
		h = ld64(sd0)
		if (h == 2) {
			n = fn_8ef60(se0, s90, program_id)
			h = ld64(se0)
			st64(a + 8, ld64(se0 + 8))
			st64(a, h)
			return n
		}
		st64(a + 8, ld64(sd0 + 8))
		st64(a, h)
		return n
	}
	st64(a + 8, ld64(sc0 + 8))
	st64(a, h)
	return n
}

// Anchor Accounts::try_accounts of instruction collect_fees (called by ix_collect_fees; name [str]: from the handler's "Instruction: …" log; was fn_8d7b0)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool, position (ConstraintMut, ConstraintHasOne), position_token_account (ConstraintRaw), token_owner_account_a (ConstraintMut, ConstraintRaw), token_vault_a (ConstraintMut, ConstraintAddress), token_owner_account_b (ConstraintMut, ConstraintRaw), token_vault_b (ConstraintMut, ConstraintAddress), token_program (ConstraintAddress), position_authority
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_token_account_box, token_owner_account_a_box, token_vault_a_box, token_owner_account_b_box, token_vault_b_box, token_vault_a, token_vault_b
function accounts_collect_fees(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s270 = fp - 0x270, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s510 = fp - 0x510, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s580 = fp - 0x580
	let ad, ae: u64
	try_accounts_11a48(s290, c, c, d, e)
	if (ld64(s290) == 0) {
		ae = Error_with_account_name(s540, ld64(s290 + 8), ld64(s290 + 0x10), 0x100152b28 /* "whirlpool" */, 9)
		ad = ld64(s540)
		st64(a + 0x10, ld64(s540 + 8))
		st64(a + 8, ad)
		st64(a, 0)
		return ae
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x290) & -8 : 0x300007d70
	if (g > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, s290, 0x290)
		try_accounts_11718(s290, c)
		const j = ld64(s290 + 8)
		const h = ld64(s290)
		if (h == 2) {
			try_accounts_11b00(s290, c)
			if (ld64(s290) == 0) {
				ae = Error_with_account_name(s530, ld64(s290 + 8), ld64(s290 + 0x10), "position", 8)
				ad = ld64(s530)
				st64(a + 0x10, ld64(s530 + 8))
				st64(a + 8, ad)
				st64(a, 0)
				return ae
			}
			const i = ld64(0x300000000 /* heap bump-allocator cursor */)
			const k = i != 0 ? sat_sub(i, 0xd8) & -8 : 0x300007f28
			st64(s580 + 0x30, j)
			if (k > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, k)
				st64(s580 + 0x38, k)
				memcpy(k, s290, 0xd8)
				try_accounts_558(s290, c)
				if (ld32(s270 + 0x90) == 2) {
					ae = Error_with_account_name(s520, ld64(s290), ld64(s290 + 8), "position_token_account", 0x16)
					ad = ld64(s520)
					st64(a + 0x10, ld64(s520 + 8))
					st64(a + 8, ad)
					st64(a, 0)
					return ae
				}
				const l = ld64(0x300000000 /* heap bump-allocator cursor */)
				const position_token_account_box: TokenAccount_2 = l != 0 ? sat_sub(l, 0xd8) & -8 : 0x300007f28
				if (position_token_account_box > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, position_token_account_box)
					st64(s580 + 0x28, position_token_account_box)
					memcpy(position_token_account_box, s290, 0xd8)
					try_accounts_11f50(s290, c)
					if (ld32(s270 + 0x70) == 2) {
						ae = Error_with_account_name(s510, ld64(s290), ld64(s290 + 8), "token_owner_account_a", 0x15)
						ad = ld64(s510)
						st64(a + 0x10, ld64(s510 + 8))
						st64(a + 8, ad)
						st64(a, 0)
						return ae
					}
					const n = ld64(0x300000000 /* heap bump-allocator cursor */)
					const token_owner_account_a_box: TokenAccount = n != 0 ? sat_sub(n, 0xb8) & -8 : 0x300007f48
					if (token_owner_account_a_box > 0x300000007) {
						st64(0x300000000 /* heap bump-allocator cursor */, token_owner_account_a_box)
						st64(s580 + 0x20, token_owner_account_a_box)
						memcpy(token_owner_account_a_box, s290, 0xb8)
						try_accounts_11f50(s290, c)
						if (ld32(s270 + 0x70) == 2) {
							ae = Error_with_account_name(s500, ld64(s290), ld64(s290 + 8), "token_vault_a", 0xd)
							ad = ld64(s500)
							st64(a + 0x10, ld64(s500 + 8))
							st64(a + 8, ad)
							st64(a, 0)
							return ae
						}
						const p = ld64(0x300000000 /* heap bump-allocator cursor */)
						const token_vault_a_box: TokenAccount = p != 0 ? sat_sub(p, 0xb8) & -8 : 0x300007f48
						if (token_vault_a_box > 0x300000007) {
							st64(0x300000000 /* heap bump-allocator cursor */, token_vault_a_box)
							memcpy(token_vault_a_box, s290, 0xb8)
							fn_20f8(s290, c)
							const token_owner_account_b_box: TokenAccount = ld64(s290 + 8)
							const r = ld64(s290)
							if (r == 2) {
								st64(s580 + 0x18, token_owner_account_b_box)
								fn_20f8(s290, c, token_owner_account_b_box)
								const token_vault_b_box: TokenAccount = ld64(s290 + 8)
								const t = ld64(s290)
								if (t == 2) {
									st64(s580 + 0x10, token_vault_b_box)
									fn_129a0(s290, c, token_vault_b_box)
									const x = ld64(s290 + 8)
									const v = ld64(s290)
									if (v == 2) {
										const w = ld64(s580 + 0x38)
										if (ld8(ld64(w) + 0x29) == 0) {
											anchor_error_from(s4e0, 0x7d0 /* anchor::ConstraintMut */, x, w)
											ae = Error_with_account_name(s4f0, ld64(s4e0), ld64(s4e0 + 8), "position", 8)
											ad = ld64(s4f0)
											st64(a + 0x10, ld64(s4f0 + 8))
											st64(a + 8, ad)
											st64(a, 0)
											return ae
										}
										st64(s580, x, token_vault_a_box)
										copyr(s2d0, w + 8, 0x20)
										const y = ld64(ld64(g))
										copyr(s2b0, y, 0x20)
										if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
											anchor_error_from(s320, 0x7d1 /* anchor::ConstraintHasOne */)
											const ac = Error_with_account_name(s330, ld64(s320), ld64(s320 + 8), "position", 8)
											const ab = ld64(s330 + 8)
											const aa = ld64(s330)
											copy(s290, s2d0, 0x40)
											ae = fn_13b5c0(s340, aa, ab, s290, ac)
											ad = ld64(s340)
											st64(a + 0x10, ld64(s340 + 8))
											st64(a + 8, ad)
											st64(a, 0)
											return ae
										}
										const z: TokenAccount_2 = ld64(s580 + 0x28)
										if ((memcmp(z.mint, w + 0x28, 0x20) as u32) == 0) {
											if (z.amount != 1) {
												anchor_error_from(s370, 0x7d3 /* anchor::ConstraintRaw */)
												ae = Error_with_account_name(s380, ld64(s370), ld64(s370 + 8), "position_token_account", 0x16)
												ad = ld64(s380)
												st64(a + 0x10, ld64(s380 + 8))
												st64(a + 8, ad)
												st64(a, 0)
												return ae
											}
											const af: TokenAccount = ld64(s580 + 0x20)
											if (af.info.is_writable == 0) {
												anchor_error_from(s4c0, 0x7d0 /* anchor::ConstraintMut */)
												ae = Error_with_account_name(s4d0, ld64(s4c0), ld64(s4c0 + 8), "token_owner_account_a", 0x15)
												ad = ld64(s4d0)
												st64(a + 0x10, ld64(s4d0 + 8))
												st64(a + 8, ad)
												st64(a, 0)
												return ae
											}
											if ((memcmp(af.mint, g + 0x1a8, 0x20) as u32) == 0) {
												const token_vault_a: AccountInfo = ld64(ld64(s580 + 8))
												if (token_vault_a.is_writable != 0) {
													const ah = token_vault_a.key
													copyr(s2d0, ah, 0x20)
													copyr(s2b0, g + 0x1c8, 0x20)
													if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
														anchor_error_from(s3b0, 0x7dc /* anchor::ConstraintAddress */)
														const ak = Error_with_account_name(s3c0, ld64(s3b0), ld64(s3b0 + 8), "token_vault_a", 0xd)
														const aj = ld64(s3c0 + 8)
														const ai = ld64(s3c0)
														copy(s290, s2d0, 0x40)
														ae = fn_13b5c0(s3d0, ai, aj, s290, ak)
														ad = ld64(s3d0)
														st64(a + 0x10, ld64(s3d0 + 8))
														st64(a + 8, ad)
														st64(a, 0)
														return ae
													}
													if (ld8(ld64(ld64(s580 + 0x18)) + 0x29) == 0) {
														anchor_error_from(s480, 0x7d0 /* anchor::ConstraintMut */)
														ae = Error_with_account_name(s490, ld64(s480), ld64(s480 + 8), "token_owner_account_b", 0x15)
														ad = ld64(s490)
														st64(a + 0x10, ld64(s490 + 8))
														st64(a + 8, ad)
														st64(a, 0)
														return ae
													}
													if ((memcmp(ld64(s580 + 0x18) + 8, g + 0x1e8, 0x20) as u32) == 0) {
														const token_vault_b: AccountInfo = ld64(ld64(s580 + 0x10))
														if (token_vault_b.is_writable != 0) {
															const am = token_vault_b.key
															copyr(s2d0, am, 0x20)
															copyr(s2b0, g + 0x208, 0x20)
															if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
																anchor_error_from(s400, 0x7dc /* anchor::ConstraintAddress */)
																const au = Error_with_account_name(s410, ld64(s400), ld64(s400 + 8), "token_vault_b", 0xd)
																const at = ld64(s410 + 8)
																const ar = ld64(s410)
																copy(s290, s2d0, 0x40)
																ae = fn_13b5c0(s420, ar, at, s290, au)
																ad = ld64(s420)
																st64(a + 0x10, ld64(s420 + 8))
																st64(a + 8, ad)
																st64(a, 0)
																return ae
															}
															const an = ld64(ld64(s580))
															copyr(s2b0, an, 0x20)
															ae = memcmp(s2b0, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32
															if (ae == 0) {
																st64(a + 0x40, ld64(s580))
																st64(a + 0x38, ld64(s580 + 0x10))
																st64(a + 0x30, ld64(s580 + 0x18))
																st64(a + 0x28, ld64(s580 + 8))
																st64(a + 0x20, ld64(s580 + 0x20))
																st64(a + 0x18, ld64(s580 + 0x28))
																st64(a + 0x10, ld64(s580 + 0x38))
																st64(a + 8, ld64(s580 + 0x30))
																st64(a, g)
																return ae
															}
															anchor_error_from(s430, 0x7dc /* anchor::ConstraintAddress */)
															const aq = Error_with_account_name(s440, ld64(s430), ld64(s430 + 8), "token_program", 0xd)
															const ap = ld64(s440 + 8)
															const ao = ld64(s440)
															copyr(s290, s2b0, 0x20)
															st64(s270, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
															ae = fn_13b5c0(s450, ao, ap, s290, aq)
															ad = ld64(s450)
															st64(a + 0x10, ld64(s450 + 8))
															st64(a + 8, ad)
															st64(a, 0)
															return ae
														}
														anchor_error_from(s460, 0x7d0 /* anchor::ConstraintMut */)
														ae = Error_with_account_name(s470, ld64(s460), ld64(s460 + 8), "token_vault_b", 0xd)
														ad = ld64(s470)
														st64(a + 0x10, ld64(s470 + 8))
														st64(a + 8, ad)
														st64(a, 0)
														return ae
													}
													anchor_error_from(s3e0, 0x7d3 /* anchor::ConstraintRaw */)
													ae = Error_with_account_name(s3f0, ld64(s3e0), ld64(s3e0 + 8), "token_owner_account_b", 0x15)
													ad = ld64(s3f0)
													st64(a + 0x10, ld64(s3f0 + 8))
													st64(a + 8, ad)
													st64(a, 0)
													return ae
												}
												anchor_error_from(s4a0, 0x7d0 /* anchor::ConstraintMut */)
												ae = Error_with_account_name(s4b0, ld64(s4a0), ld64(s4a0 + 8), "token_vault_a", 0xd)
												ad = ld64(s4b0)
												st64(a + 0x10, ld64(s4b0 + 8))
												st64(a + 8, ad)
												st64(a, 0)
												return ae
											}
											anchor_error_from(s390, 0x7d3 /* anchor::ConstraintRaw */)
											ae = Error_with_account_name(s3a0, ld64(s390), ld64(s390 + 8), "token_owner_account_a", 0x15)
											ad = ld64(s3a0)
											st64(a + 0x10, ld64(s3a0 + 8))
											st64(a + 8, ad)
											st64(a, 0)
											return ae
										}
										anchor_error_from(s350, 0x7d3 /* anchor::ConstraintRaw */)
										ae = Error_with_account_name(s360, ld64(s350), ld64(s350 + 8), "position_token_account", 0x16)
										ad = ld64(s360)
										st64(a + 0x10, ld64(s360 + 8))
										st64(a + 8, ad)
										st64(a, 0)
										return ae
									}
									ae = Error_with_account_name(s310, v, x, "token_program", 0xd)
									ad = ld64(s310)
									st64(a + 0x10, ld64(s310 + 8))
									st64(a + 8, ad)
									st64(a, 0)
									return ae
								}
								ae = Error_with_account_name(s300, t, token_vault_b_box, "token_vault_b", 0xd)
								ad = ld64(s300)
								st64(a + 0x10, ld64(s300 + 8))
								st64(a + 8, ad)
								st64(a, 0)
								return ae
							}
							ae = Error_with_account_name(s2f0, r, token_owner_account_b_box, "token_owner_account_b", 0x15)
							ad = ld64(s2f0)
							st64(a + 0x10, ld64(s2f0 + 8))
							st64(a + 8, ad)
							st64(a, 0)
							return ae
						}
						alloc_handle_alloc_error(8, 0xb8)
					}
					alloc_handle_alloc_error(8, 0xb8)
				}
				alloc_handle_alloc_error(8, 0xd8)
			}
			alloc_handle_alloc_error(8, 0xd8)
		}
		ae = Error_with_account_name(s2e0, h, j, "position_authority", 0x12)
		ad = ld64(s2e0)
		st64(a + 0x10, ld64(s2e0 + 8))
		st64(a + 8, ad)
		st64(a, 0)
		return ae
	}
	alloc_handle_alloc_error(8, 0x290)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), p6 (value)
function fn_652d0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s60 = fp - 0x60, s70 = fp - 0x70, s88 = fp - 0x88, sb0 = fp - 0xb0, sb8 = fp - 0xb8, se0 = fp - 0xe0, se8 = fp - 0xe8, s110 = fp - 0x110, s118 = fp - 0x118, s140 = fp - 0x140, s158 = fp - 0x158, s168 = fp - 0x168
	const f: AccountInfo = ld64(p5)
	const g: LamportsCell = f.lamports
	const s = f.key
	rc_inc(g)
	const h: DataCell = f.data
	const aq = p6
	rc_inc(h)
	const i: AccountInfo = ld64(c)
	const j: LamportsCell = i.lamports
	const am = f.executable
	const an = f.is_writable
	const ao = f.is_signer
	const ap = f.rent_epoch
	const r = f.owner
	const l = i.key
	rc_inc(j)
	const k: DataCell = i.data
	rc_inc(k)
	const m: AccountInfo = ld64(d)
	const n: LamportsCell = m.lamports
	const ai = i.executable
	const aj = i.is_writable
	const ak = i.is_signer
	const al = i.rent_epoch
	const q = i.owner
	const p = m.key
	rc_inc(n)
	const o: DataCell = m.data
	rc_inc(o)
	const t: AccountInfo = ld64(b)
	const u: LamportsCell = t.lamports
	const af = m.executable
	const ag = m.is_writable
	const ah = m.is_signer
	const v = m.rent_epoch
	const ab = m.owner
	const ae = t.key
	rc_inc(u)
	const w: DataCell = t.data
	rc_inc(w)
	const aa = t.owner
	const z = t.rent_epoch
	const y = t.is_signer
	const x = t.is_writable
	st8(s88 + 2, t.executable)
	st8(s88, y, x)
	st64(sb0, ae, u, w, aa, z)
	st8(sb8, ah, ag, af)
	st64(se0, p, n, o, ab, v)
	st8(se8, ak, aj, ai)
	st64(s110, l, j, k, q, al)
	st64(s70, s60, 6, 0x100152b28, 9, b + 0x188, 0x20, b + 0x1a8, 0x20, b + 0x1e8, 0x20, b + 0x286, 2, b + 0x28c, 1)
	st64(s88 + 8, s70)
	st8(s118, ao, an, am)
	st64(s140, s, g, h, r, ap)
	st64(s88 + 0x10, 1)
	st64(s158, 0, 8, 0)
	const ad = fn_1269b8(s168, s158, aq)
	const ac = ld64(s168)
	st64(a + 8, ld64(s168 + 8))
	st64(a, ac)
	return ad
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position, token_owner_account_a, token_vault_a, token_owner_account_b, token_vault_b
function fn_8ef60(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8
	let n, p: u64
	fn_5a40(s28, ld64(b + 0x10), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const f = ld64(s28)
	if (f != 2) {
		n = Error_with_account_name(s38, f, ld64(s28 + 8), "position", 8)
		p = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, p)
		return n
	}
	const g = ld64(ld64(b + 0x20))
	if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
		const h = common_is_closed(g)
		if (h == 0) {
			fn_143448(s18, g, h)
			const j = ld64(s18 + 0x10)
			const i = ld64(s18)
			if (i != 0x800000000000001a /* Ok */) {
				const k = ld64(s18 + 8)
				st64(s18, i, k, j)
				fn_13b430(s48, s18)
				const l = ld64(s48)
				if (l != 2) {
					n = Error_with_account_name(s58, l, ld64(s48 + 8), "token_owner_account_a", 0x15)
					p = ld64(s58)
					st64(a + 8, ld64(s58 + 8))
					st64(a, p)
					return n
				}
			} else {
				st64(j, ld64(j) + 1)
			}
		}
	}
	const q = ld64(ld64(b + 0x28))
	if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
		const r = common_is_closed(q)
		if (r == 0) {
			fn_143448(s18, q, r)
			const t = ld64(s18 + 0x10)
			const s = ld64(s18)
			if (s != 0x800000000000001a /* Ok */) {
				const aa = ld64(s18 + 8)
				st64(s18, s, aa, t)
				fn_13b430(s68, s18)
				const ab = ld64(s68)
				if (ab != 2) {
					n = Error_with_account_name(s78, ab, ld64(s68 + 8), "token_vault_a", 0xd)
					p = ld64(s78)
					st64(a + 8, ld64(s78 + 8))
					st64(a, p)
					return n
				}
			} else {
				st64(t, ld64(t) + 1)
			}
		}
	}
	const u = ld64(ld64(b + 0x30))
	if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
		const v = common_is_closed(u)
		if (v == 0) {
			fn_143448(s18, u, v)
			const x = ld64(s18 + 0x10)
			const w = ld64(s18)
			if (w != 0x800000000000001a /* Ok */) {
				const ac = ld64(s18 + 8)
				st64(s18, w, ac, x)
				fn_13b430(s88, s18)
				const ad = ld64(s88)
				if (ad != 2) {
					n = Error_with_account_name(s98, ad, ld64(s88 + 8), "token_owner_account_b", 0x15)
					p = ld64(s98)
					st64(a + 8, ld64(s98 + 8))
					st64(a, p)
					return n
				}
			} else {
				st64(x, ld64(x) + 1)
			}
		}
	}
	const y = ld64(ld64(b + 0x38))
	const m = memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20)
	let o = undef
	n = m as u32
	if (n != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return n
	}
	n = common_is_closed(y)
	o = undef
	if (n != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return n
	}
	n = fn_143448(s18, y, n)
	o = ld64(s18 + 0x10)
	const z = ld64(s18)
	if (z != 0x800000000000001a /* Ok */) {
		const ae = ld64(s18 + 8)
		st64(s18, z, ae, o)
		n = fn_13b430(sa8, s18)
		o = undef
		const af = ld64(sa8)
		if (af == 2) {
			st64(a + 8, o)
			st64(a, 2)
			return n
		}
		n = Error_with_account_name(sb8, af, ld64(sa8 + 8), "token_vault_b", 0xd)
		p = ld64(sb8)
		st64(a + 8, ld64(sb8 + 8))
		st64(a, p)
		return n
	}
	st64(o, ld64(o) + 1)
	st64(a + 8, o)
	st64(a, 2)
	return n
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
function fn_1269b8(a: u64, b: u64, c: u64): u64 {
	const s30 = fp - 0x30, s60 = fp - 0x60, s70 = fp - 0x70, s88 = fp - 0x88, s90 = fp - 0x90, sa8 = fp - 0xa8, sc0 = fp - 0xc0, sf0 = fp - 0xf0, s108 = fp - 0x108, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s1000 = fp - 0x1000
	let j, n, o, p: u64
	const h = ld64(b + 0x78)
	const g = ld64(b + 0x48)
	const f = ld64(b + 0xa8)
	st64(s1000, f, 8, 0, c)
	fn_1343e0(s90, 0x1001520e0 /* &TOKEN_PROGRAM */, g, h, f, 8, 0, c)
	copy(sc0, s88, 0x18)
	let i = ld64(s90)
	if (i == 0x8000000000000000) {
		let r = fn_13b430(s130, sc0)
		j = ld64(s130 + 8)
		p = ld64(s130)
		const s = ld64(b + 0x58)
		const q = ld64(b + 0x50)
		if (rc_release(q)) {
			if (rc_release(q + 8)) {
				r = fn_83078(r)
			}
		}
		if (rc_release(s)) {
			if (rc_release(s + 8)) {
				r = fn_83078(r)
			}
		}
		const u = ld64(b + 0x88)
		const t = ld64(b + 0x80)
		if (rc_release(t)) {
			if (rc_release(t + 8)) {
				r = fn_83078(r)
			}
		}
		if (rc_release(u)) {
			if (rc_release(u + 8)) {
				r = fn_83078(r)
			}
		}
		const w = ld64(b + 0xb8)
		const v = ld64(b + 0xb0)
		if (rc_release(v)) {
			if (rc_release(v + 8)) {
				r = fn_83078(r)
			}
		}
		if (rc_release(w)) {
			if (rc_release(w + 8)) {
				r = fn_83078(r)
			}
		}
		n = ptr_drop_in_place_126088(b, r)
		o = ld64(b + 0x28)
		const x = ld64(b + 0x20)
		if (rc_release(x)) {
			if (rc_release(x + 8)) {
				n = fn_83078(n)
			}
		}
		if (!rc_release(o)) {
			st64(a + 8, j)
			st64(a, p)
			return n
		}
		if (!rc_release(o + 8)) {
			st64(a + 8, j)
			st64(a, p)
			return n
		}
		n = fn_83078(n)
		st64(a + 8, j)
		st64(a, p)
		return n
	}
	j = b + 0x78
	memcpy(sf0, s70, 0x30)
	st64(s110, i)
	copy(s108, sc0, 0x18)
	memcpy(s90, b + 0x48, 0x30)
	memcpy(s60, j, 0x30)
	memcpy(s30, b + 0xa8, 0x30)
	const k = ld64(b + 0xe0)
	st64(s1000, ld64(b + 0xd8))
	st64(s1000 + 8, k)
	let l = fn_13eea8(sa8, s110, s90, 3, ld64(s1000), k)
	p = 2
	if (ld64(sa8) != 0x800000000000001a /* Ok */) {
		l = fn_13b430(s120, sa8)
		i = ld64(s110)
		j = ld64(s120 + 8)
		p = ld64(s120)
	}
	if (i != 0) {
		l = fn_83078(l)
	}
	if (ld64(s108 + 0x10) != 0) {
		l = fn_83078(l)
	}
	n = ptr_drop_in_place_126088(b, ptr_drop_in_place_125960(s90, l))
	o = ld64(b + 0x28)
	const m = ld64(b + 0x20)
	if (rc_release(m)) {
		if (rc_release(m + 8)) {
			n = fn_83078(n)
		}
	}
	if (!rc_release(o)) {
		st64(a + 8, j)
		st64(a, p)
		return n
	}
	if (!rc_release(o + 8)) {
		st64(a + 8, j)
		st64(a, p)
		return n
	}
	n = fn_83078(n)
	st64(a + 8, j)
	st64(a, p)
	return n
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: p8 (value)
function fn_1343e0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s80 = fp - 0x80
	let i, j, r, s, t: u64
	if ((memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
	} else {
		const f = p7
		let k = p6
		const u = p5
		st64(s50 + 8, p8)
		st32(s50, 3)
		fn_133ce0(s80, s50)
		let g = f + 3
		if (g == 0) {
			st64(s68, 0, 1, 0)
			copyr(s50, c, 0x20)
			fn_133b80(s68)
			g = ld64(s68)
			i = ld64(s68 + 8)
		} else {
			const h = g
			if (g > 0x3c3c3c3c3c3c3c3) {
				raw_vec_handle_error(0, h * 0x22, r, s, t)
			}
			i = __rust_alloc(h * 0x22, 1)
			if (i == 0) {
				raw_vec_handle_error(1, h * 0x22, r, s, t)
			}
			st64(s68, g, i)
			copyr(s50, c, 0x20)
		}
		st64(i + 0x18, ld64(s38))
		st64(i + 0x10, ld64(s40))
		st64(i + 8, ld64(s50 + 8))
		st64(i, ld64(s50))
		st16(i + 0x20, 0x100)
		st64(s68 + 0x10, 1)
		if (g == 1) {
			fn_133b80(s68, j)
			g = ld64(s68)
			i = ld64(s68 + 8)
		}
		st64(i + 0x3a, ld64(d + 0x18))
		st64(i + 0x32, ld64(d + 0x10))
		st64(i + 0x2a, ld64(d + 8))
		st64(i + 0x22, ld64(d))
		st16(i + 0x42, 0x100)
		st64(s68 + 0x10, 2)
		if (g == 2) {
			fn_133b80(s68, d)
			i = ld64(s68 + 8)
		}
		st64(i + 0x5c, ld64(u + 0x18))
		st64(i + 0x54, ld64(u + 0x10))
		st64(i + 0x4c, ld64(u + 8))
		st64(i + 0x44, ld64(u))
		st8(i + 0x64, f == 0, 0)
		st64(s68 + 0x10, 3)
		if (f != 0) {
			let n = 3
			let l = 0
			let o = f << 3
			do {
				const p = ld64(k)
				copyr(s40, p + 0x10, 0x10)
				const q = ld64(p + 8)
				st64(s50 + 8, q)
				st64(s50, ld64(p))
				if (n == ld64(s68)) {
					fn_133b80(s68, q)
					i = ld64(s68 + 8)
				}
				k = k + 8
				const m = i + l
				st64(m + 0x7e, ld64(s38))
				st64(m + 0x76, ld64(s40))
				st64(m + 0x6e, ld64(s50 + 8))
				st64(m + 0x66, ld64(s50))
				st16(m + 0x86, 1)
				l = l + 0x22
				n = n + 1
				st64(s68 + 0x10, n)
				o = o - 8
			} while (o != 0)
		}
		copyr(s20, b, 0x20)
		copy(s50, s68, 0x18)
		copy(s38, s80, 0x18)
		memcpy(a, s50, 0x50)
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value)
function fn_13eea8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s38 = fp - 0x38, s50 = fp - 0x50, s78 = fp - 0x78, sa0 = fp - 0xa0, sa8 = fp - 0xa8
	let h, i, n, o, p, q, r, s, ac, ad: u64
	B13: {
		st64(s78, c, d)
		st64(sa0 + 0x10, a)
		st64(sa0 + 0x18, ld64(b + 8))
		st64(sa8, b)
		const f = ld64(b + 0x10)
		st64(sa0, p5, p6)
		st64(sa0 + 0x20, f)
		if (f != 0) {
			let g = ld64(sa0 + 0x18)
			st64(s78 + 0x10, g + ld64(sa0 + 0x20) * 0x22)
			st64(s78 + 0x20, ld64(s78 + 8) * 0x30)
			st64(s78 + 0x18, ld64(s78) - 0x30)
			L4: while (true) {
				const l = g
				g = g + 0x22
				let j = ld64(s78 + 0x20)
				let k = ld64(s78 + 0x18)
				while (true) {
					if (j != 0) {
						const m = memcmp(l, ld64(k + 0x30), 0x20)
						j = j - 0x30
						k = k + 0x30
						if ((m as u32) != 0) {
							continue
						}
						if (ld8(l + 0x21) != 0) {
							p = fn_143340(s50, k, m as u32)
							o = ld64(s50 + 0x10)
							n = ld64(s50)
							if (n != 0x800000000000001a /* Ok */) {
								ad = ld64(s50 + 8)
								ac = ld64(sa0 + 0x10)
								st64(ac + 0x10, o)
								st64(ac + 8, ad)
								st64(ac, n)
								return p
							}
							st64(o, ld64(o) + 1)
							p = fn_143448(s50, k, p)
							i = 1
							h = ld64(s50 + 0x10)
							q = ld64(s50)
							if (q != 0x800000000000001a /* Ok */) {
								s = ld64(s50 + 8)
								r = ld64(sa0 + 0x10)
								st64(r + 0x10, h)
								st64(r + 8, s)
								st64(r, q)
								return p
							}
						} else {
							p = AccountInfo_try_borrow_lamports(s50, k, m as u32)
							o = ld64(s50 + 0x10)
							n = ld64(s50)
							if (n != 0x800000000000001a /* Ok */) {
								ad = ld64(s50 + 8)
								ac = ld64(sa0 + 0x10)
								st64(ac + 0x10, o)
								st64(ac + 8, ad)
								st64(ac, n)
								return p
							}
							st64(o, ld64(o) - 1)
							p = AccountInfo_try_borrow_data(s50, k, p)
							i = -1
							h = ld64(s50 + 0x10)
							q = ld64(s50)
							if (q != 0x800000000000001a /* Ok */) {
								s = ld64(s50 + 8)
								r = ld64(sa0 + 0x10)
								st64(r + 0x10, h)
								st64(r + 8, s)
								st64(r, q)
								return p
							}
						}
						st64(h, ld64(h) + i)
					}
					if (g == ld64(s78 + 0x10)) {
						break B13
					}
					continue L4
				}
			}
		}
	}
	const t = ld64(sa8)
	const ab = ld64(t + 0x30)
	const aa = ld64(t + 0x38)
	const z = ld64(t + 0x40)
	const y = ld64(t + 0x48)
	const x = ld64(t + 0x28)
	const w = ld64(t + 0x18)
	const v = ld64(t + 0x20)
	const u = ld64(t)
	st64(s50, ld64(sa0 + 0x18))
	st64(s50 + 8, u)
	st64(s50 + 0x10, ld64(sa0 + 0x20))
	st64(s38, v, w, x, ab, aa, z, y)
	// CPI: program ?, data v[..x]
	p = sol_invoke_signed_rust(s50, ld64(s78), ld64(s78 + 8), ld64(sa0), ld64(sa0 + 8))
	if (p != 0) {
		return fn_144198(ld64(sa0 + 0x10), p, p)
	}
	st64(ld64(sa0 + 0x10), 0x800000000000001a /* Ok */)
	return p
}

function fn_83078(r0: u64): u64 {
	return r0
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_133ce0(a: u64, b: u64) {
	const s18 = fp - 0x18
	let f = __rust_alloc(0x50, 1)
	if (f == 0) {
		raw_vec_handle_error(1, 0x50)
	}
	B16: {
		st64(s18, 0x50, f)
		const g = ld32(b)
		if ((g as i64) > 0xb) {
			if ((g as i64) > 0x11) {
				if ((g as i64) > 0x14) {
					if ((g as i64) > 0x16) {
						if (g == 0x17) {
							st64(f + 1, ld64(b + 8))
							st8(f, 0x17)
							st64(s18 + 0x10, 9)
							st64(a + 0x10, 9)
							st64(a + 8, ld64(s18 + 8))
							st64(a, ld64(s18))
							return
						}
						st8(f, 0x18)
						let j = 1
						st64(s18 + 0x10, 1)
						const k = ld64(b + 8)
						const i = ld64(b + 0x10)
						if (i >= 0x50) {
							fn_133a38(s18, 1, i)
							f = ld64(s18 + 8)
							j = ld64(s18 + 0x10)
						}
						memcpy(f + j, k, i)
						const o = j + i
						st64(s18 + 0x10, o)
						st64(a + 0x10, o)
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return
					}
					if (g == 0x15) {
						st8(f, 0x15)
						st64(s18 + 0x10, 1)
						st64(a + 0x10, 1)
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return
					}
					st8(f, 0x16)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, 1)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				if (g != 0x12) {
					if (g == 0x13) {
						st8(f + 1, ld8(b + 8))
						st8(f, 0x13)
						st64(s18 + 0x10, 2)
						st64(a + 0x10, 2)
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return
					}
					st8(f + 1, ld8(b + 8))
					st8(f, 0x14)
					st64(f + 0x1a, ld64(b + 0x21))
					st64(f + 0x12, ld64(b + 0x19))
					st64(f + 0xa, ld64(b + 0x11))
					st64(f + 2, ld64(b + 9))
					if (ld32(b + 0x2c) != 0) {
						break B16
					}
					st8(f + 0x22, 0)
					st64(s18 + 0x10, 0x23)
					st64(a + 0x10, 0x23)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				st8(f, 0x12)
			} else {
				if (0xe >= (g as i64)) {
					if (g == 0xc) {
						const l = ld64(b + 8)
						st8(f + 9, ld8(b + 0x10))
						st64(f + 1, l)
						st8(f, 0xc)
						st64(s18 + 0x10, 0xa)
						st64(a + 0x10, 0xa)
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return
					}
					if (g == 0xd) {
						const n = ld64(b + 8)
						st8(f + 9, ld8(b + 0x10))
						st64(f + 1, n)
						st8(f, 0xd)
						st64(s18 + 0x10, 0xa)
						st64(a + 0x10, 0xa)
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return
					}
					const h = ld64(b + 8)
					st8(f + 9, ld8(b + 0x10))
					st64(f + 1, h)
					st8(f, 0xe)
					st64(s18 + 0x10, 0xa)
					st64(a + 0x10, 0xa)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				if (g == 0xf) {
					const m = ld64(b + 8)
					st8(f + 9, ld8(b + 0x10))
					st64(f + 1, m)
					st8(f, 0xf)
					st64(s18 + 0x10, 0xa)
					st64(a + 0x10, 0xa)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				if (g != 0x10) {
					st8(f, 0x11)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, 1)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				st8(f, 0x10)
			}
			copy(f + 1, b + 8, 0x20)
			st64(s18 + 0x10, 0x21)
			st64(a + 0x10, 0x21)
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return
		}
		if ((g as i64) > 5) {
			if ((g as i64) > 8) {
				if (g == 9) {
					st8(f, 9)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, 1)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				if (g == 0xa) {
					st8(f, 0xa)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, 1)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				st8(f, 0xb)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, 1)
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return
			}
			if (g == 6) {
				st8(f, 6)
				st8(f + 1, ld8(b + 8))
				if (ld32(b + 0xc) != 0) {
					st8(f + 2, 1)
					copy(f + 3, b + 0x10, 0x20)
					st64(s18 + 0x10, 0x23)
					st64(a + 0x10, 0x23)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				st8(f + 2, 0)
				st64(s18 + 0x10, 3)
				st64(a + 0x10, 3)
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return
			}
			if (g == 7) {
				st64(f + 1, ld64(b + 8))
				st8(f, 7)
				st64(s18 + 0x10, 9)
				st64(a + 0x10, 9)
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return
			}
			st64(f + 1, ld64(b + 8))
			st8(f, 8)
			st64(s18 + 0x10, 9)
			st64(a + 0x10, 9)
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return
		}
		if ((g as i64) > 2) {
			if (g == 3) {
				st64(f + 1, ld64(b + 8))
				st8(f, 3)
				st64(s18 + 0x10, 9)
				st64(a + 0x10, 9)
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return
			}
			if (g == 4) {
				st64(f + 1, ld64(b + 8))
				st8(f, 4)
				st64(s18 + 0x10, 9)
				st64(a + 0x10, 9)
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return
			}
			st8(f, 5)
			st64(s18 + 0x10, 1)
			st64(a + 0x10, 1)
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return
		}
		if (g != 0) {
			if (g == 1) {
				st8(f, 1)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, 1)
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return
			}
			st8(f + 1, ld8(b + 8))
			st8(f, 2)
			st64(s18 + 0x10, 2)
			st64(a + 0x10, 2)
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return
		}
		st8(f + 1, ld8(b + 8))
		st8(f, 0)
		st64(f + 0x1a, ld64(b + 0x21))
		st64(f + 0x12, ld64(b + 0x19))
		st64(f + 0xa, ld64(b + 0x11))
		st64(f + 2, ld64(b + 9))
		if (ld32(b + 0x2c) == 0) {
			st8(f + 0x22, 0)
			st64(s18 + 0x10, 0x23)
			st64(a + 0x10, 0x23)
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return
		}
	}
	st8(f + 0x22, 1)
	copy(f + 0x23, b + 0x30, 0x20)
	st64(s18 + 0x10, 0x43)
	st64(a + 0x10, 0x43)
	st64(a + 8, ld64(s18 + 8))
	st64(a, ld64(s18))
}
