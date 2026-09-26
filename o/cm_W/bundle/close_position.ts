// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction close_position: handler + 30 reachable functions
// typed views: x.field is exactly the load / store / address given by the field declaration
type at<Offset extends number, T> = T // view field: a T at byte offset Offset of the object (x.f: scalar = its load, ref<U> = the loaded pointer, other = its address)
type ref<T> = T                        // view field holding a pointer (8 bytes) to a T
interface sized<Size extends number> {} // a view of that many bytes: x[k] is the k-th such object from x (at x + k * Size)
interface Pubkey {} // 32-byte public key (a Pubkey value is its address)
interface bytes {} // byte array in place (a bytes value is its address)
interface Bytes64 {} // 64 bytes in place (value = their address)
interface u128 {} // 128-bit integer in place (value = its address)
interface Bytes1 {} // 1 bytes in place (value = their address)
interface Bytes2 {} // 2 bytes in place (value = their address)
interface Bytes4 {} // 4 bytes in place (value = their address)
interface Bytes507 {} // 507 bytes in place (value = their address)
interface Bytes128 {} // 128 bytes in place (value = their address)
interface Bytes46 {} // 46 bytes in place (value = their address)
interface Bytes112 {} // 112 bytes in place (value = their address)
interface Bytes256 {} // 256 bytes in place (value = their address)
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
interface DynamicFeeInfo extends sized<0x50> { // IDL type DynamicFeeInfo (Borsh layout)
	filter_period:                at<0x00, u16>
	decay_period:                 at<0x02, u16>
	reduction_factor:             at<0x04, u16>
	dynamic_fee_control:          at<0x06, u32>
	max_volatility_accumulator:   at<0x0a, u32>
	tick_spacing_index_reference: at<0x0e, u32>
	volatility_reference:         at<0x12, u32>
	volatility_accumulator:       at<0x16, u32>
	last_update_timestamp:        at<0x1a, u64>
	padding:                      at<0x22, Bytes46>
}
interface PoolStateAccount extends sized<0x608> { // data of an account of type PoolState (Anchor IDL: 8-byte discriminator, then the fields in serialized order)
	discriminator:           at<0x00, u64>
	bump:                    at<0x08, Bytes1>
	amm_config:              at<0x09, Pubkey>
	owner:                   at<0x29, Pubkey>
	token_mint_0:            at<0x49, Pubkey>
	token_mint_1:            at<0x69, Pubkey>
	token_vault_0:           at<0x89, Pubkey>
	token_vault_1:           at<0xa9, Pubkey>
	observation_key:         at<0xc9, Pubkey>
	mint_decimals_0:         at<0xe9, u8>
	mint_decimals_1:         at<0xea, u8>
	tick_spacing:            at<0xeb, u16>
	liquidity:               at<0xed, u128>
	sqrt_price_x64:          at<0xfd, u128>
	tick_current:            at<0x10d, u32>
	padding3:                at<0x111, u16>
	padding4:                at<0x113, u16>
	fee_growth_global_0_x64: at<0x115, u128>
	fee_growth_global_1_x64: at<0x125, u128>
	protocol_fees_token_0:   at<0x135, u64>
	protocol_fees_token_1:   at<0x13d, u64>
	padding5:                at<0x145, Bytes64>
	status:                  at<0x185, u8>
	fee_on:                  at<0x186, u8>
	seed_index:              at<0x187, Bytes2>
	padding:                 at<0x189, Bytes4>
	reward_infos:            at<0x18d, Bytes507>
	tick_array_bitmap:       at<0x388, Bytes128>
	padding6:                at<0x408, Pubkey>
	fund_fees_token_0:       at<0x428, u64>
	fund_fees_token_1:       at<0x430, u64>
	open_time:               at<0x438, u64>
	recent_epoch:            at<0x440, u64>
	dynamic_fee_info:        at<0x448, DynamicFeeInfo>
	padding1:                at<0x498, Bytes112>
	padding2:                at<0x508, Bytes256>
}
interface ClosePositionAccounts { // Accounts struct of instruction close_position as accounts_close_position returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	nft_owner: at<0x00, ref<AccountInfo>>
}
interface ClosePositionContext { // anchor_lang Context of instruction close_position (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<ClosePositionAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function try_accounts_120(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_15c0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_1678(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::interface_account::InterfaceAccount<T> as anchor_lang::Accounts<B>…
declare function AccountInfo_clone_f338(a: u64, b: u64): u64 // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function ptr_drop_in_place_fcd8(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<solana_account_info::AccountInfo>
declare function Rc_drop_slow_14df0(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function try_accounts_17a30(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_18368(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_18870(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function token_2022_burn(a: u64, b: u64, c: u64): u64 // lib anchor_spl::token_2022::burn
declare function token_2022_close_account_1298c8(a: u64, b: u64): u64 // lib anchor_spl::token_2022::close_account
declare function token_2022_close_account_12a8e8(a: u64, b: u64): u64 // lib anchor_spl::token_2022::close_account
declare function Rc_drop_slow_13cfe8(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function Rc_drop_slow_13d038(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function Error_with_pubkeys(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib anchor_lang::error::Error::with_pubkeys
declare function ErrorCode_name(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib anchor_lang::error::ErrorCode::name
declare function ErrorCode_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::error::ErrorCode as core::fmt::Display>::fmt
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function memset(a: u64, b: u64, c: u64, r0: u64): u64 // lib uses sol_memset
declare function AccountInfo_assign(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::assign
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fn_14de10(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a formatting trait implementation return…"
declare function fmt_write(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::write
declare function imp__fmt_155760(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u64>::_fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp

// instruction handler: close_position (discriminator sha256("global:close_position")[..8] = 0x626244310051867b)
// accounts [idl]: 0 nft_owner [signer, mut], 1 position_nft_mint [mut], 2 position_nft_account [mut], 3 personal_position [mut, pda], 4 system_program [= 11111111111111111111111111111111], 5 token_program
// args [idl]: (none)
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
function ix_close_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s60 = fp - 0x60, s70 = fp - 0x70, s71 = fp - 0x71, s88 = fp - 0x88, s98 = fp - 0x98, sff8 = fp - 0xff8
	const f = sol_log("Instruction: ClosePosition", 0x1a)
	st8(s71, 0xff)
	st64(s70, accounts, accounts_len)
	st64(sff8, s71)
	let k = accounts_close_position(s30, program_id, s70, undef, fp, f)
	const i = ld64(s20)
	let j = ld64(s30 + 8)
	const g = ld64(s30)
	if (g == 0) {
		st64(a + 8, i)
		st64(a, j)
		return k
	}
	copyr(s40, s10, 0x10)
	const h = ld64(s20 + 8)
	st64(s60, g, j, i, h)
	st8(s10, ld8(s71))
	copyr(s20, s70, 0x10)
	st64(s30, program_id, s60)
	k = fn_28d58(s88, s30, g, h)
	j = ld64(s88)
	if (j == 2) {
		k = fn_a8b80(s98, s60, program_id)
		j = ld64(s98)
		st64(a + 8, ld64(s98 + 8))
		st64(a, j)
		return k
	}
	st64(a + 8, ld64(s88 + 8))
	st64(a, j)
	return k
}

// Anchor Accounts::try_accounts of instruction close_position (called by ix_close_position; name [str]: from the handler's "Instruction: …" log; was fn_a7120)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_program, position_nft_mint (ConstraintMut, ConstraintAddress), position_nft_account (ConstraintMut, ConstraintRaw), personal_position (ConstraintClose, ConstraintMut, ConstraintSeeds, ConstraintTokenTokenProgram, ConstraintTokenMint), nft_owner (ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: nft_owner [idl], position_nft_mint [idl], position_nft_account [idl]
function accounts_close_position(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s100 = fp - 0x100, s120 = fp - 0x120, s140 = fp - 0x140, s160 = fp - 0x160, s180 = fp - 0x180, s1a0 = fp - 0x1a0, s1c0 = fp - 0x1c0, s1e0 = fp - 0x1e0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s3a8 = fp - 0x3a8, s3b0 = fp - 0x3b0, s3b8 = fp - 0x3b8
	let n, o, aa, ab, ae, az: u64
	st64(s3a8 + 0x30, b)
	let t = try_accounts_17a30(s120, c, c, d, e, r0)
	const nft_owner: AccountInfo = ld64(s120 + 8)
	let f = ld64(s120)
	if (f == 2) {
		const k = ld64(e - 0xff8)
		t = try_accounts_15c0(s120, c)
		if (ld32(s120) == 2) {
			const m = ld64(0x300000000 /* heap bump-allocator cursor */)
			f = ld64(s120 + 8)
			n = m != 0 ? sat_sub(m, 0x11) : 0x300007fef
			o = ld64(s120 + 0x10)
			if (f != 0) {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, az)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6e696d5f74666e5f)
				st64(n, 0x6e6f697469736f70)
				st8(n + 0x10, 0x74)
				void ld64(o)
			} else {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, az)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6e696d5f74666e5f)
				st64(n, 0x6e6f697469736f70)
				st8(n + 0x10, 0x74)
				void ld64(o)
			}
		} else {
			const j = ld64(0x300000000 /* heap bump-allocator cursor */)
			st64(s3a8 + 0x28, k)
			const l = j != 0 ? sat_sub(j, 0x80) : 0x300007f80
			if (0x300000008 > l) {
				alloc_handle_alloc_error(8, 0x80)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, l & -8)
			if ((l & -8) == 0) {
				alloc_handle_alloc_error(8, 0x80)
			}
			memcpy(l & -8, s120, 0x80)
			t = try_accounts_1678(s120, c)
			if (ld32(s100 + 0x90) == 2) {
				const r = ld64(0x300000000 /* heap bump-allocator cursor */)
				f = ld64(s120)
				const s = r != 0 ? sat_sub(r, 0x14) : 0x300007fec
				o = ld64(s120 + 8)
				if (f != 0) {
					if (0x300000008 > s) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, s)
					st64(s + 8, 0x6363615f74666e5f)
					st64(s, 0x6e6f697469736f70)
					st32(s + 0x10, 0x746e756f)
					void ld64(o)
				} else {
					if (0x300000008 > s) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, s)
					st64(s + 8, 0x6363615f74666e5f)
					st64(s, 0x6e6f697469736f70)
					st32(s + 0x10, 0x746e756f)
					void ld64(o)
				}
				st64(o + 0x10, s, 0x14)
				st64(o + 8, 0x14)
				st64(o, 1)
				st64(a + 0x10, o)
				st64(a + 8, f)
				st64(a, 0)
				return t
			}
			const p = ld64(0x300000000 /* heap bump-allocator cursor */)
			const q = p != 0 ? sat_sub(p, 0xd8) : 0x300007f28
			if (0x300000008 > q) {
				alloc_handle_alloc_error(8, 0xd8)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, q & -8)
			if ((q & -8) == 0) {
				alloc_handle_alloc_error(8, 0xd8)
			}
			st64(s3a8 + 0x20, q & -8)
			memcpy(q & -8, s120, 0xd8)
			t = try_accounts_18368(s120, c)
			if (ld64(s120) != 0) {
				const u = ld64(0x300000000 /* heap bump-allocator cursor */)
				const v = u != 0 ? sat_sub(u, 0x120) : 0x300007ee0
				if (0x300000008 > v) {
					alloc_handle_alloc_error(8, 0x120)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, v & -8)
				if ((v & -8) != 0) {
					st64(s3a8 + 0x18, v & -8)
					memcpy(v & -8, s120, 0x120)
					try_accounts_18870(s120, c)
					t = ld64(s120 + 8)
					f = ld64(s120)
					if (f == 2) {
						st64(s3a8 + 0x10, t)
						try_accounts_120(s120, c)
						o = ld64(s120 + 8)
						const z = ld64(s120)
						if (z != 2) {
							t = fn_4130(s210, z, o, 0x10015b020 /* "token_program" */, 0xd)
							o = ld64(s210 + 8)
							f = ld64(s210)
							ae = ld64(s3a8 + 0x18)
							if (f != 2) {
								st64(a + 0x10, o)
								st64(a + 8, f)
								st64(a, 0)
								return t
							}
						} else {
							ae = ld64(s3a8 + 0x18)
						}
						if (nft_owner.is_writable != 0) {
							const position_nft_mint: AccountInfo = ld64((l & -8) + 0x58)
							if (position_nft_mint.is_writable != 0) {
								st64(s3a8, position_nft_mint, o)
								const ad = position_nft_mint.key
								copyr(s200, ad, 0x20)
								copy(s1e0, ae + 8, 0x20)
								if ((memcmp(s200, s1e0, 0x20) as u32) != 0) {
									anchor_error_from(s260, 0x7dc /* anchor::ConstraintAddress */)
									const ai = fn_4130(s270, ld64(s260), ld64(s260 + 8), "position_nft_mint", 0x11)
									const ah = ld64(s270 + 8)
									const ag = ld64(s270)
									copy(s120, s200, 0x40)
									t = Error_with_pubkeys(s280, ag, ah, s120, ai)
									f = ld64(s280)
									st64(a + 0x10, ld64(s280 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return t
								}
								st64(s3b0, ad)
								const af = ld64(ld64(s3a8 + 8))
								copyr(s1c0, af, 0x20)
								if ((memcmp(ld64(ld64(s3a8) + 0x18), s1c0, 0x20) as u32) == 0) {
									const aj = ld64(s3a8 + 0x20)
									const position_nft_account: AccountInfo = ld64(aj + 0x20)
									if (position_nft_account.is_writable != 0) {
										if (ld64(aj + 0x68) != 1) {
											anchor_error_from(s2c0, 0x7d3 /* anchor::ConstraintRaw */, aj)
											t = fn_4130(s2d0, ld64(s2c0), ld64(s2c0 + 8), "position_nft_account", 0x14)
											f = ld64(s2d0)
											st64(a + 0x10, ld64(s2d0 + 8))
											st64(a + 8, f)
											st64(a, 0)
											return t
										}
										st64(s3b8, position_nft_account)
										st64(s3a8, af)
										const al = nft_owner.key
										copyr(s1a0, al, 0x20)
										if ((memcmp(aj + 0x48, s1a0, 0x20) as u32) == 0) {
											const am = ld64(s3b0)
											copyr(s120, am, 0x20)
											if ((memcmp(aj + 0x28, s120, 0x20) as u32) == 0) {
												const an = ld64(s3a8)
												copyr(s120, an, 0x20)
												if ((memcmp(ld64(ld64(s3b8) + 0x18), s120, 0x20) as u32) == 0) {
													const ao = ld64(s3b0)
													copyr(s140, ao, 0x20)
													st64(s160, 0x100159360, 8, s140, 0x20)
													// PDA find_program_address(["position", *ao], program *(ld64(s3a8 + 0x30)))
													Pubkey_find_program_address(s120, s160, 2, ld64(s3a8 + 0x30))
													copyr(s180, s120, 0x20)
													st8(ld64(s3a8 + 0x28), ld8(s100))
													const ap = ld64(ld64(s3a8 + 0x18))
													st64(s3a8 + 0x30, ap)
													const aq = ld64(ap)
													copyr(s120, aq, 0x20)
													if ((memcmp(s120, s180, 0x20) as u32) == 0) {
														if (ld8(ld64(s3a8 + 0x30) + 0x29) != 0) {
															copyr(s140, aq, 0x20)
															copyr(s120, s1a0, 0x20)
															t = memcmp(s140, s120, 0x20) as u32
															if (t == 0) {
																anchor_error_from(s360, 0x7db /* anchor::ConstraintClose */)
																t = fn_4130(s370, ld64(s360), ld64(s360 + 8), 0x10015b06a /* "personal_position" */, 0x11)
																f = ld64(s370)
																st64(a + 0x10, ld64(s370 + 8))
																st64(a + 8, f)
																st64(a, 0)
																return t
															}
															st64(a + 0x28, ld64(s3a8 + 8))
															st64(a + 0x20, ld64(s3a8 + 0x10))
															st64(a + 0x18, ld64(s3a8 + 0x18))
															st64(a + 0x10, ld64(s3a8 + 0x20))
															st64(a + 8, l & -8)
															st64(a, nft_owner)
															return t
														}
														anchor_error_from(s340, 0x7d0 /* anchor::ConstraintMut */)
														t = fn_4130(s350, ld64(s340), ld64(s340 + 8), 0x10015b06a /* "personal_position" */, 0x11)
														f = ld64(s350)
														st64(a + 0x10, ld64(s350 + 8))
														st64(a + 8, f)
														st64(a, 0)
														return t
													}
													anchor_error_from(s310, 0x7d6 /* anchor::ConstraintSeeds */)
													fn_4130(s320, ld64(s310), ld64(s310 + 8), 0x10015b06a /* "personal_position" */, 0x11)
													const ay = ld64(s320 + 8)
													const ax = ld64(s320)
													const ar = ld64(ld64(ld64(s3a8 + 0x18)))
													const aw = ld64(ar)
													const av = ld64(ar + 8)
													const au = ld64(ar + 0x10)
													const at = ld64(ar + 0x18)
													copy(s100, s180, 0x20)
													st64(s120, aw, av, au, at)
													t = Error_with_pubkeys(s330, ax, ay, s120, au)
													f = ld64(s330)
													st64(a + 0x10, ld64(s330 + 8))
													st64(a + 8, f)
													st64(a, 0)
													return t
												}
												t = anchor_error_from(s300, 0x7e5 /* anchor::ConstraintTokenTokenProgram */)
												f = ld64(s300)
												st64(a + 0x10, ld64(s300 + 8))
												st64(a + 8, f)
												st64(a, 0)
												return t
											}
											t = anchor_error_from(s2f0, 0x7de /* anchor::ConstraintTokenMint */)
											f = ld64(s2f0)
											st64(a + 0x10, ld64(s2f0 + 8))
											st64(a + 8, f)
											st64(a, 0)
											return t
										}
										t = anchor_error_from(s2e0, 0x7df /* anchor::ConstraintTokenOwner */)
										f = ld64(s2e0)
										st64(a + 0x10, ld64(s2e0 + 8))
										st64(a + 8, f)
										st64(a, 0)
										return t
									}
									anchor_error_from(s2a0, 0x7d0 /* anchor::ConstraintMut */, aj)
									t = fn_4130(s2b0, ld64(s2a0), ld64(s2a0 + 8), "position_nft_account", 0x14)
									f = ld64(s2b0)
									st64(a + 0x10, ld64(s2b0 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return t
								}
								t = anchor_error_from(s290, 0x7e6 /* anchor::ConstraintMintTokenProgram */)
								f = ld64(s290)
								st64(a + 0x10, ld64(s290 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return t
							}
							anchor_error_from(s240, 0x7d0 /* anchor::ConstraintMut */, o, position_nft_mint, ab)
							t = fn_4130(s250, ld64(s240), ld64(s240 + 8), "position_nft_mint", 0x11)
							f = ld64(s250)
							st64(a + 0x10, ld64(s250 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return t
						}
						anchor_error_from(s220, 0x7d0 /* anchor::ConstraintMut */, o, aa, ab)
						t = fn_4130(s230, ld64(s220), ld64(s220 + 8), "nft_owner", 9)
						f = ld64(s230)
						st64(a + 0x10, ld64(s230 + 8))
						st64(a + 8, f)
						st64(a, 0)
						return t
					}
					const w = ld64(0x300000000 /* heap bump-allocator cursor */)
					const x = w != 0 ? sat_sub(w, 0xe) : 0x300007ff2
					if ((f & 1) != 0) {
						if (0x300000008 > x) {
							raw_vec_handle_error(1, 0xe, 0x10015f8f8, sat_sub(w, 0xe), 0xe > w)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, x)
						st64(x + 6, 0x6d6172676f72705f)
						st64(x, 0x705f6d6574737973)
						void ld64(t)
					} else {
						if (0x300000008 > x) {
							raw_vec_handle_error(1, 0xe, 0x10015f8f8, sat_sub(w, 0xe), 0xe > w)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, x)
						st64(x + 6, 0x6d6172676f72705f)
						st64(x, 0x705f6d6574737973)
						void ld64(t)
					}
					st64(t + 0x10, x, 0xe)
					st64(t + 8, 0xe)
					st64(t, 1)
					st64(a + 0x10, t)
					st64(a + 8, f)
					st64(a, 0)
					return t
				}
				alloc_handle_alloc_error(8, 0x120)
			}
			const y = ld64(0x300000000 /* heap bump-allocator cursor */)
			f = ld64(s120 + 8)
			n = y != 0 ? sat_sub(y, 0x11) : 0x300007fef
			o = ld64(s120 + 0x10)
			if (f != 0) {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, az)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6f697469736f705f)
				st64(n, 0x6c616e6f73726570)
				st8(n + 0x10, 0x6e)
				void ld64(o)
			} else {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, az)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6f697469736f705f)
				st64(n, 0x6c616e6f73726570)
				st8(n + 0x10, 0x6e)
				void ld64(o)
			}
		}
		st64(o + 0x10, n, 0x11)
		st64(o + 8, 0x11)
		st64(o, 1)
		st64(a + 0x10, o)
		st64(a + 8, f)
		st64(a, 0)
		return t
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 9) : 0x300007ff7
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(g, 9), 9 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x656e776f5f74666e)
		st8(h + 8, 0x72)
		void nft_owner.key
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(g, 9), 9 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x656e776f5f74666e)
		st8(h + 8, 0x72)
		void nft_owner.key
	}
	st64(nft_owner + 0x10, h, 9)
	st64(nft_owner + 8 /* lamports */, 9)
	st64(nft_owner /* key */, 1)
	st64(a + 0x10, nft_owner)
	st64(a + 8, f)
	st64(a, 0)
	return t
}

// types [heur]: b: ClosePositionContext (the handler ix_close_position passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_28d58(a: u64, b: ClosePositionContext, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sd8 = fp - 0xd8, se0 = fp - 0xe0, sf8 = fp - 0xf8, s110 = fp - 0x110, s118 = fp - 0x118, s138 = fp - 0x138, s140 = fp - 0x140, s158 = fp - 0x158, s160 = fp - 0x160, s168 = fp - 0x168, s170 = fp - 0x170, s188 = fp - 0x188, s190 = fp - 0x190, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1c8 = fp - 0x1c8, s1e0 = fp - 0x1e0, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8
	let m, n, o: u64
	const accounts: ClosePositionAccounts = b.accounts
	const g = ld64(accounts + 0x18)
	const i = ld64(g + 0x50)
	const h = ld64(g + 0x48)
	if ((h | i) == 0 && (ld64(g + 0x78) == 0 && ld64(g + 0x80) == 0)) {
		let k = 0
		st64(s1c8, 0)
		let j = ld64(g + 0x98)
		if (j == 0) {
			k = 1
			st64(s1c8, 1)
			j = ld64(g + 0xb0)
			if (j == 0) {
				k = 2
				st64(s1c8, 2)
				j = ld64(g + 0xc8)
				if (j == 0) {
					const p: AccountInfo = ld64(accounts + 0x28)
					const q: LamportsCell = p.lamports
					const t = p.key
					rc_inc(q)
					const r: DataCell = p.data
					const s = r.strong
					st64(s290, t)
					rc_inc(r, s)
					const x = p.owner
					const w = p.rent_epoch
					const v = p.is_signer
					const u = p.is_writable
					st8(s1a0 + 2, p.executable)
					st8(s1a0, v, u)
					st64(s1c0, q, r, x, w)
					st64(s1c8, ld64(s290))
					const y: AccountInfo = ld64(ld64(accounts + 8) + 0x58)
					const z: LamportsCell = y.lamports
					const ac = y.key
					rc_inc(z)
					const aa: DataCell = y.data
					const ab = aa.strong
					st64(s290, ac)
					rc_inc(aa, ab)
					const ag = y.owner
					const af = y.rent_epoch
					const ae = y.is_signer
					const ad = y.is_writable
					st8(s170 + 2, y.executable)
					st8(s170, ae, ad)
					st64(s188 + 0x10, af)
					st64(s190, z, aa)
					st64(s198, ld64(s290))
					st64(s298, ag)
					st64(s188 + 8, ag)
					const ah: AccountInfo = ld64(ld64(accounts + 0x10) + 0x20)
					const ai: LamportsCell = ah.lamports
					const ap = ah.key
					rc_inc(ai)
					const aj: DataCell = ah.data
					const ak = aj.strong
					st64(s290, ai)
					rc_inc(aj, ak)
					B31: {
						const ao = ah.owner
						const an = ah.rent_epoch
						const am = ah.is_signer
						const al = ah.is_writable
						st8(s140 + 2, ah.executable)
						st8(s140, am, al)
						st64(s158, aj, ao, an)
						st64(s160, ld64(s290))
						st64(s168, ap)
						if (ld8(ld64(accounts + 0x10) + 0x94) == 2) {
							if (b.remaining_accounts_len == 0) {
								o = fn_88360(s288, 2)
								m = ld64(s288 + 8)
								n = ld64(s288)
								break B31
							}
							const remaining_accounts: AccountInfo = b.remaining_accounts
							const ar = remaining_accounts.key
							copyr(s138, ar, 0x20)
							if ((memcmp(s138, ld64(accounts + 0x18) + 0x28, 0x20) as u32) != 0) {
								fn_85138(s78, 0x10015982c)
								st64(s60, 0, 1, 0)
								st64(s28, s60, 0x10015f818)
								st8(s28 + 0x18, 3)
								st64(s28 + 0x10, 0x20)
								st64(s48 + 0x10, 0)
								st64(s48, 0)
								if (fn_88558(0x10015982c, s48) != 0) {
									fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
								}
								copy(sf8, s78, 0x30)
								st64(s110, 0x100159e62)
								st32(sd8 + 0x58, 0x1770 /* error::NotApproved */)
								st8(sd8 + 0x10, 2)
								st32(s110 + 0x10, 0x5b)
								st64(s110 + 8, 0x2f)
								st64(s118, 0)
								const aw = fn_13e5a0(s228, s118)
								const av = ld64(s228 + 8)
								const au = ld64(s228)
								const at = ld64(accounts + 0x18)
								copyr(sf8, at + 0x28, 0x20)
								copy(s118, s138, 0x20)
								o = Error_with_pubkeys(s238, au, av, s118, aw)
								st64(s290, ld64(s160))
								m = ld64(s238 + 8)
								n = ld64(s238)
								break B31
							}
							st64(s2a0, remaining_accounts)
							o = fn_5608(s118, remaining_accounts)
							m = ld64(s110)
							n = ld64(s118)
							if (n != 2) {
								break B31
							}
							o = fn_4dc0(s118, m, o)
							const ax = ld64(s110 + 8)
							n = ld64(s110)
							m = ax
							if (ld64(s118) != 0) {
								break B31
							}
							st64(s2a8, ax)
							const ay = ld16(n + 0x17f)
							st64(sf8 + 0x10, n + 0x61)
							st64(sf8, n + 0x41)
							st64(sd8 + 0x10, n)
							st64(s110 + 8, n + 1)
							st64(s118, 0x10015984c)
							st64(s48, s118)
							st64(sd8, ay != 0 ? n + 0x17f : 1, (ay != 0) << 1)
							st64(sd8 + 0x18, 1)
							st64(se0, 0x20)
							st64(sf8 + 8, 0x20)
							st64(s110 + 0x10, 0x20)
							st64(s110, 4)
							st64(s48 + 8, 6)
							o = fn_7cb20(s248, ld64(s2a0), s168, s198, s1c8, s48, 1)
							m = ld64(s248 + 8)
							n = ld64(s248)
							const az = ld64(s2a8)
							st64(az, ld64(az) - 1)
							if (n != 2) {
								break B31
							}
						}
						o = fn_7be40(s258, accounts, s198, s168, s1c8, 8, 0, 1)
						m = ld64(s258 + 8)
						n = ld64(s258)
						if (n == 2) {
							const nft_owner: AccountInfo = accounts.nft_owner
							o = fn_7b7e8(s268, nft_owner, nft_owner, s168, s1c8, 8, 0)
							m = ld64(s268 + 8)
							n = ld64(s268)
							if (n == 2) {
								o = memcmp(ld64(s298), 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32
								if (o != 0) {
									o = ptr_drop_in_place_fcd8(s1c8, ptr_drop_in_place_fcd8(s198, ptr_drop_in_place_fcd8(s168, o)))
									st64(a + 8, m)
									st64(a, 2)
									return o
								}
								AccountInfo_clone_f338(s48, ld64(ld64(accounts + 0x18)))
								const nft_owner_2: AccountInfo = accounts.nft_owner
								const bb = ld64(accounts + 0x18)
								st64(s118, 0x100159360)
								st64(s60, s118)
								st64(s110, 8, bb + 8, 0x20, bb + 0x118, 1)
								st64(s60 + 8, 3)
								const bd = fn_7b7e8(s278, s48, nft_owner_2, s198, s1c8, s60, 1)
								m = ld64(s278 + 8)
								n = ld64(s278)
								o = ptr_drop_in_place_fcd8(s48, bd)
								if (n == 2) {
									o = ptr_drop_in_place_fcd8(s1c8, ptr_drop_in_place_fcd8(s198, ptr_drop_in_place_fcd8(s168, o)))
									st64(a + 8, m)
									st64(a, 2)
									return o
								}
							}
						}
					}
					const be = ld64(s290)
					if (rc_release(be)) {
						o = Rc_drop_slow_14df0(s160, o)
					}
					const bf = ld64(s158)
					if (rc_release(bf)) {
						o = Rc_drop_slow_14df0(s158, o)
					}
					const bg: LamportsCell = ld64(s190)
					if (rc_release(bg)) {
						o = Rc_drop_slow_14df0(s190, o)
					}
					const bh: DataCell = ld64(s188)
					if (rc_release(bh)) {
						o = Rc_drop_slow_14df0(s188, o)
					}
					const bi: LamportsCell = ld64(s1c0)
					if (rc_release(bi)) {
						o = Rc_drop_slow_14df0(s1c0, o)
					}
					const bj: DataCell = ld64(s1b8)
					if (!rc_release(bj)) {
						st64(a + 8, m)
						st64(a, n)
						return o
					}
					o = Rc_drop_slow_14df0(s1b8, o)
					st64(a + 8, m)
					st64(a, n)
					return o
				}
			}
		}
		st64(s118, 0x10015fb48)
		st64(s110 + 8, s48)
		st64(s48 + 0x18, fn_155738)
		st64(s48, s1c8, fn_155738)
		const l = k * 0x18
		st64(s48 + 0x10, g + 0x88 + l + 0x10)
		st64(sf8, 0)
		st64(s110, 2)
		st64(s110 + 0x10, 2)
		// fmt "remaing reward index:{},amount:{}" {} = *s1c8 [fn_155738], {} = *(g + 0x88 + l + 0x10) [fn_155738]
		fn_14de10(s1e0, s118, l, j, e)
		sol_log(ld64(s1e0 + 8), ld64(s1e0 + 0x10))
		fn_85138(s198, 0x10015989c)
		st64(s168, 0, 1, 0)
		st64(s28, s168, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_88558(0x10015989c, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(se0, s168, 0x18)
		copy(sf8, s198, 0x18)
		st64(s110, 0x100159e62)
		st32(sd8 + 0x58, 0x1773 /* error::ClosePositionErr */)
		st8(sd8 + 0x10, 2)
		st32(s110 + 0x10, 0x4d)
		st64(s110 + 8, 0x2f)
		st64(s118, 0)
		o = fn_13e5a0(s218, s118)
		n = ld64(s218)
		st64(a + 8, ld64(s218 + 8))
		st64(a, n)
		return o
	}
	st64(s48, 0x10015fb68)
	st64(s48 + 0x10, s118)
	st64(s118, g + 0x48, fn_150868, g + 0x78, fn_155738, g + 0x80, fn_155738)
	st64(s28, 0)
	st64(s48 + 8, 3)
	st64(s48 + 0x18, 3)
	// fmt "remaing liquidity:{},token_fees_owed_0:{},token_fees_owed_1:{}" {} = *(g + 0x48) [fn_150868], {} = *(g + 0x78) [fn_155738], {} = *(g + 0x80) [fn_155738]
	fn_14de10(s1f8, s48, fn_155738, h | i, e)
	sol_log(ld64(s1f8 + 8), ld64(s1f8 + 0x10))
	fn_85138(s198, 0x10015989c)
	st64(s168, 0, 1, 0)
	st64(s28, s168, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x10015989c, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(se0, s168, 0x18)
	copy(sf8, s198, 0x18)
	st64(s110, 0x100159e62)
	st32(sd8 + 0x58, 0x1773 /* error::ClosePositionErr */)
	st8(sd8 + 0x10, 2)
	st32(s110 + 0x10, 0x43)
	st64(s110 + 8, 0x2f)
	st64(s118, 0)
	o = fn_13e5a0(s208, s118)
	n = ld64(s208)
	st64(a + 8, ld64(s208 + 8))
	st64(a, n)
	return o
}

function fn_a8b80(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90
	let h, ab, ac, ad, ae: u64
	B17: {
		const f = ld64(b + 8)
		const g = ld64(f + 0x58)
		if ((memcmp(f + 0x60, c, 0x20) as u32) == 0 && (common_is_closed(g) == 0 && ld64(ld64(g + 0x10) + 0x10) != 0)) {
			st64(s30, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			ae = fn_13e628(s70, s30)
			h = ld64(s70)
			if (h != 2) {
				const af = ld64(0x300000000 /* heap bump-allocator cursor */)
				ab = 0x11 > af
				ac = af != 0 ? ab != 0 ? 0 : af - 0x11 : 0x300007fef
				ad = ld64(s70 + 8)
				if ((h & 1) != 0) {
					if (0x300000008 > ac) {
						raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, ab)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, ac)
					st64(ac + 8, 0x6e696d5f74666e5f)
					st64(ac, 0x6e6f697469736f70)
					st8(ac + 0x10, 0x74)
					void ld64(ad)
					break B17
				}
				if (0x300000008 > ac) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, ab)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ac)
				st64(ac + 8, 0x6e696d5f74666e5f)
				st64(ac, 0x6e6f697469736f70)
				st8(ac + 0x10, 0x74)
				void ld64(ad)
				break B17
			}
		}
		const i = ld64(b + 0x10)
		const j = ld64(i + 0x20)
		if ((memcmp(i, c, 0x20) as u32) == 0 && (common_is_closed(j) == 0 && ld64(ld64(j + 0x10) + 0x10) != 0)) {
			st64(s30, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			ae = fn_13e628(s80, s30)
			h = ld64(s80)
			if (h != 2) {
				const ag = ld64(0x300000000 /* heap bump-allocator cursor */)
				ac = ag != 0 ? sat_sub(ag, 0x14) : 0x300007fec
				ad = ld64(s80 + 8)
				if ((h & 1) != 0) {
					if (0x300000008 > ac) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > ag)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, ac)
					st64(ac + 8, 0x6363615f74666e5f)
					st64(ac, 0x6e6f697469736f70)
					st32(ac + 0x10, 0x746e756f)
					void ld64(ad)
				} else {
					if (0x300000008 > ac) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > ag)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, ac)
					st64(ac + 8, 0x6363615f74666e5f)
					st64(ac, 0x6e6f697469736f70)
					st32(ac + 0x10, 0x746e756f)
					void ld64(ad)
				}
				st64(ad + 8, 0x14)
				st64(ad, 1)
				st64(ad + 0x18, 0x14)
				st64(ad + 0x10, ac)
				st64(a + 8, ad)
				st64(a, h)
				return ae
			}
		}
		const k: AccountInfo = ld64(b)
		const l: LamportsCell = k.lamports
		const r = k.key
		rc_inc(l)
		const m: DataCell = k.data
		rc_inc(m)
		const q = k.owner
		const p = k.rent_epoch
		const o = k.is_signer
		const n = k.is_writable
		st8(s38 + 2, k.executable)
		st8(s38, o, n)
		st64(s60, r, l, m, q, p)
		const s: AccountInfo = ld64(ld64(b + 0x18))
		const t: LamportsCell = s.lamports
		const z = s.key
		rc_inc(t)
		const u: DataCell = s.data
		rc_inc(u)
		const y = s.owner
		const x = s.rent_epoch
		const w = s.is_signer
		const v = s.is_writable
		st8(s8 + 2, s.executable)
		st8(s8, w, v)
		st64(s30, z, t, u, y, x)
		ae = fn_13e190(s90, s30, s60, u, y)
		ad = undef
		h = ld64(s90)
		if (h == 2) {
			st64(a + 8, ad)
			st64(a, 2)
			return ae
		}
		const aa = ld64(0x300000000 /* heap bump-allocator cursor */)
		ab = 0x11 > aa
		ac = aa != 0 ? ab != 0 ? 0 : aa - 0x11 : 0x300007fef
		ad = ld64(s90 + 8)
		if ((h & 1) != 0) {
			if (0x300000008 > ac) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, ab)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, ac)
			st64(ac + 8, 0x6f697469736f705f)
			st64(ac, 0x6c616e6f73726570)
			st8(ac + 0x10, 0x6e)
			void ld64(ad)
		} else {
			if (0x300000008 > ac) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, ab)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, ac)
			st64(ac + 8, 0x6f697469736f705f)
			st64(ac, 0x6c616e6f73726570)
			st8(ac + 0x10, 0x6e)
			void ld64(ad)
		}
	}
	st64(ad + 8, 0x11)
	st64(ad, 1)
	st64(ad + 0x18, 0x11)
	st64(ad + 0x10, ac)
	st64(a + 8, ad)
	st64(a, h)
	return ae
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: AccountInfo, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

function fn_4130(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	let g, h, j, k, l, m: u64
	if ((b & 1) != 0) {
		if (0 > (e as i64)) {
			raw_vec_handle_error(0, e, 0x10015f8f8, d, e)
		}
		g = 1
		if (e != 0) {
			const i = ld64(0x300000000 /* heap bump-allocator cursor */)
			g = sat_sub(i != 0 ? i : 0x300008000, e)
			if (0x300000008 > g) {
				raw_vec_handle_error(1, e, 0x10015f8f8, d, e)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, g)
		}
		k = a
		m = b
		j = e
		h = c
		l = memcpy(g, d, e)
		void ld64(c)
	} else {
		if (0 > (e as i64)) {
			raw_vec_handle_error(0, e, 0x10015f8f8, d, e)
		}
		g = 1
		if (e != 0) {
			const f = ld64(0x300000000 /* heap bump-allocator cursor */)
			g = sat_sub(f != 0 ? f : 0x300008000, e)
			if (0x300000008 > g) {
				raw_vec_handle_error(1, e, 0x10015f8f8, d, e)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, g)
		}
		k = a
		m = b
		j = e
		h = c
		l = memcpy(g, d, e)
		void ld64(c)
	}
	st64(h + 0x10, g, j)
	st64(h + 8, j)
	st64(h, 1)
	st64(k + 8, h)
	st64(k, m)
	return l
}

// name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_141920)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: AccountInfo): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, s90 = fp - 0x90, sa8 = fp - 0xa8, sac = fp - 0xac
	st32(sac, b)
	ErrorCode_name(s78, sac, c, d, e)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x1001613a8)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (ErrorCode_fmt(sac, s48) != 0) {
		fn_14ed60(0x10015cc70 /* "a Display implementation returned an error unexpectedly" */, 0x37, s1, 0x100161638, 0x100161658)
	}
	copyr(sa8, s60, 0x18)
	copy(s90, s78, 0x18)
	const f = __rust_alloc(0xa0, 8)
	if (f != 0) {
		st64(f, 2)
		copy(f + 0x20, s90, 0x18)
		copy(f + 0x38, sa8, 0x18)
		st32(f + 0x98, b)
		st8(f + 0x50, 2)
		st64(a + 8, f)
		st64(a, 0)
		return f
	}
	alloc_handle_alloc_error(8, 0xa0)
}

function fn_155738(a: u64, b: u64): u64 {
	return imp__fmt_155760(ld64(a), 1, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
function fn_85138(a: u64, b: u64) {
	let h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, aa, ab, ac, ad, ae, af, ag, ah, ai, aj, ak, al, am: u64
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const f = ld32(b)
	if ((f as i64) > 0x19) {
		if ((f as i64) > 0x26) {
			if ((f as i64) > 0x2c) {
				if ((f as i64) > 0x2f) {
					if ((f as i64) > 0x31) {
						if (f == 0x32) {
							aa = 0x17 > g
							ab = aa != 0 ? 0 : g - 0x17
							j = g != 0 ? ab : 0x300007fe9
							if (0x300000007 >= j) {
								raw_vec_handle_error(1, 0x17, 0x10015f8f8, ab, aa)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, j)
							st64(j + 0xf, 0x323230326d617267)
							st64(j + 8, 0x676f72506e656b6f)
							st64(j, 0x54676e697373694d)
							st64(a + 8, j, 0x17)
							st64(a, 0x17)
						} else {
							ae = 0x26 > g
							af = ae != 0 ? 0 : g - 0x26
							j = g != 0 ? af : 0x300007fda
							if (0x300000007 >= j) {
								raw_vec_handle_error(1, 0x26, 0x10015f8f8, af, ae)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, j)
							st64(j + 0x1e, 0x746e756f6363416e)
							st64(j + 0x18, 0x416e6f69736e6574)
							st64(j + 0x10, 0x784570616d746942)
							st64(j + 8, 0x79617272416b6369)
							st64(j, 0x5464696c61766e49)
							st64(a + 8, j, 0x26)
							st64(a, 0x26)
						}
					} else if (f == 0x30) {
						j = g != 0 ? sat_sub(g, 0xf) : 0x300007ff1
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0xf, 0x10015f8f8, sat_sub(g, 0xf), 0xf > g)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 7, 0x67616c4665736142)
						st64(j, 0x42676e697373694d)
						st64(a + 8, j, 0xf)
						st64(a, 0xf)
					} else {
						w = 0x12 > g
						x = w != 0 ? 0 : g - 0x12
						j = g != 0 ? x : 0x300007fee
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x12, 0x10015f8f8, x, w)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 8, 0x756f636341746e69)
						st64(j, 0x4d676e697373694d)
						st16(j + 0x10, 0x746e)
						st64(a + 8, j, 0x12)
						st64(a, 0x12)
					}
				} else if (f == 0x2d) {
					ac = 0xc > g
					ad = ac != 0 ? 0 : g - 0xc
					j = g != 0 ? ad : 0x300007ff4
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0xc, 0x10015f8f8, ad, ac)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j, 0x4664696c61766e49)
					st32(j + 8, 0x6e4f6565)
					st64(a + 8, j, 0xc)
					st64(a, 0xc)
				} else if (f == 0x2e) {
					u = 0xd > g
					v = u != 0 ? 0 : g - 0xd
					j = g != 0 ? v : 0x300007ff3
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0xd, 0x10015f8f8, v, u)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 5, 0x6563697250747271)
					st64(j, 0x747271536f72655a)
					st64(a + 8, j, 0xd)
					st64(a, 0xd)
				} else {
					u = 0xd > g
					v = u != 0 ? 0 : g - 0xd
					j = g != 0 ? v : 0x300007ff3
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0xd, 0x10015f8f8, v, u)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 5, 0x7974696469757169)
					st64(j, 0x7571694c6f72655a)
					st64(a + 8, j, 0xd)
					st64(a, 0xd)
				}
			} else if ((f as i64) > 0x29) {
				if (f == 0x2a) {
					aa = 0x17 > g
					ab = aa != 0 ? 0 : g - 0x17
					j = g != 0 ? ab : 0x300007fe9
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x17, 0x10015f8f8, ab, aa)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0xf, 0x746e756f6d417265)
					st64(j + 8, 0x6564724f74696d69)
					st64(j, 0x4c64696c61766e49)
					st64(a + 8, j, 0x17)
					st64(a, 0x17)
				} else if (f == 0x2b) {
					y = 0x13 > g
					z = y != 0 ? 0 : g - 0x13
					j = g != 0 ? z : 0x300007fed
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x13, 0x10015f8f8, z, y)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 8, 0x6172757461536573)
					st64(j, 0x616850726564724f)
					st32(j + 0xf, 0x64657461)
					st64(a + 8, j, 0x13)
					st64(a, 0x13)
				} else {
					j = g != 0 ? sat_sub(g, 0x1d) : 0x300007fe3
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x1d, 0x10015f8f8, sat_sub(g, 0x1d), 0x1d > g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x15, 0x736d617261506769)
					st64(j + 0x10, 0x506769666e6f4365)
					st64(j + 8, 0x654663696d616e79)
					st64(j, 0x4464696c61766e49)
					st64(a + 8, j, 0x1d)
					st64(a, 0x1d)
				}
			} else if (f == 0x27) {
				ak = 0x1c > g
				al = ak != 0 ? 0 : g - 0x1c
				j = g != 0 ? al : 0x300007fe4
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x1c, 0x10015f8f8, al, ak)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x10, 0x4d746f4e6574616c)
				st64(j + 8, 0x75636c6143656546)
				st64(j, 0x726566736e617254)
				st32(j + 0x18, 0x68637461)
				st64(a + 8, j, 0x1c)
				st64(a, 0x1c)
			} else if (f == 0x28) {
				w = 0x12 > g
				x = w != 0 ? 0 : g - 0x12
				j = g != 0 ? x : 0x300007fee
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x12, 0x10015f8f8, x, w)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x6c6c694679646165)
				st64(j, 0x726c41726564724f)
				st16(j + 0x10, 0x6465)
				st64(a + 8, j, 0x12)
				st64(a, 0x12)
			} else {
				m = 0x11 > g
				n = m != 0 ? 0 : g - 0x11
				j = g != 0 ? n : 0x300007fef
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, n, m)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x7361685072656472)
				st64(j, 0x4f64696c61766e49)
				st8(j + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
				st64(a + 8, j, 0x11)
				st64(a, 0x11)
			}
		} else if ((f as i64) > 0x1f) {
			if ((f as i64) > 0x22) {
				if ((f as i64) > 0x24) {
					if (f == 0x25) {
						k = 0x10 > g
						l = k != 0 ? 0 : g - 0x10
						j = g != 0 ? l : 0x300007ff0
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 8, 0x776f6c667265764f)
						st64(j, 0x6e656b6f5478614d)
						st64(a + 8, j, 0x10)
						st64(a, 0x10)
					} else {
						m = 0x11 > g
						n = m != 0 ? 0 : g - 0x11
						j = g != 0 ? n : 0x300007fef
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x11, 0x10015f8f8, n, m)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 8, 0x6f6c667265764f65)
						st64(j, 0x74616c75636c6143)
						st8(j + 0x10, 0x77)
						st64(a + 8, j, 0x11)
						st64(a, 0x11)
					}
				} else if (f == 0x23) {
					ae = 0x26 > g
					af = ae != 0 ? 0 : g - 0x26
					j = g != 0 ? af : 0x300007fda
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x26, 0x10015f8f8, af, ae)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x1e, 0x746e756f6363416e)
					st64(j + 0x18, 0x416e6f69736e6574)
					st64(j + 0x10, 0x784570616d746942)
					st64(j + 8, 0x79617272416b6369)
					st64(j, 0x54676e697373694d)
					st64(a + 8, j, 0x26)
					st64(a, 0x26)
				} else {
					j = g != 0 ? sat_sub(g, 0x21) : 0x300007fdf
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x21, 0x10015f8f8, sat_sub(g, 0x21), 0x21 > g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x18, 0x6f69746365726944)
					st64(j + 0x10, 0x726f467974696469)
					st64(j + 8, 0x7571694c746e6569)
					st64(j, 0x6369666675736e49)
					st8(j + 0x20, 0x6e)
					st64(a + 8, j, 0x21)
					st64(a, 0x21)
				}
			} else if (f == 0x20) {
				ag = 0x1f > g
				ah = ag != 0 ? 0 : g - 0x1f
				j = g != 0 ? ah : 0x300007fe1
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x1f, 0x10015f8f8, ah, ag)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x17, 0x736e6f697373696d)
				st64(j + 0x10, 0x6d45647261776552)
				st64(j + 8, 0x6574616470556576)
				st64(j, 0x6f72707041746f4e)
				st64(a + 8, j, 0x1f)
				st64(a, 0x1f)
			} else if (f == 0x21) {
				aa = 0x17 > g
				ab = aa != 0 ? 0 : g - 0x17
				j = g != 0 ? ab : 0x300007fe9
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x17, 0x10015f8f8, ab, aa)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0xf, 0x6f666e4964726177)
				st64(j + 8, 0x77655264657a696c)
				st64(j, 0x616974696e496e55)
				st64(a + 8, j, 0x17)
				st64(a, 0x17)
			} else {
				q = 0xe > g
				r = q != 0 ? 0 : g - 0xe
				j = g != 0 ? r : 0x300007ff2
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0xe, 0x10015f8f8, r, q)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 6, 0x746e694d74726f70)
				st64(j, 0x6f70707553746f4e)
				st64(a + 8, j, 0xe)
				st64(a, 0xe)
			}
		} else if ((f as i64) > 0x1c) {
			if (f == 0x1d) {
				o = 0x16 > g
				p = o != 0 ? 0 : g - 0x16
				j = g != 0 ? p : 0x300007fea
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x16, 0x10015f8f8, p, o)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0xe, 0x6d6172615074696e)
				st64(j + 8, 0x696e496472617765)
				st64(j, 0x5264696c61766e49)
				st64(a + 8, j, 0x16)
				st64(a, 0x16)
			} else if (f == 0x1e) {
				ag = 0x1f > g
				ah = ag != 0 ? 0 : g - 0x1f
				j = g != 0 ? ah : 0x300007fe1
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x1f, 0x10015f8f8, ah, ag)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x17, 0x7265626d754e746e)
				st64(j + 0x10, 0x6e756f6363417475)
				st64(j + 8, 0x706e496472617765)
				st64(j, 0x5264696c61766e49)
				st64(a + 8, j, 0x1f)
				st64(a, 0x1f)
			} else {
				y = 0x13 > g
				z = y != 0 ? 0 : g - 0x13
				j = g != 0 ? z : 0x300007fed
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x13, 0x10015f8f8, z, y)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x7265506472617765)
				st64(j, 0x5264696c61766e49)
				st32(j + 0xf, 0x646f6972)
				st64(a + 8, j, 0x13)
				st64(a, 0x13)
			}
		} else if (f == 0x1a) {
			q = 0xe > g
			r = q != 0 ? 0 : g - 0xe
			j = g != 0 ? r : 0x300007ff2
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0xe, 0x10015f8f8, r, q)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 6, 0x6f666e4964726177)
			st64(j, 0x617765526c6c7546)
			st64(a + 8, j, 0xe)
			st64(a, 0xe)
		} else if (f == 0x1b) {
			aa = 0x17 > g
			ab = aa != 0 ? 0 : g - 0x17
			j = g != 0 ? ab : 0x300007fe9
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x17, 0x10015f8f8, ab, aa)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 0xf, 0x6573556e49796461)
			st64(j + 8, 0x6165726c416e656b)
			st64(j, 0x6f54647261776552)
			st64(a + 8, j, 0x17)
			st64(a, 0x17)
		} else {
			k = 0x10 > g
			l = k != 0 ? 0 : g - 0x10
			j = g != 0 ? l : 0x300007ff0
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x746e694d64726177)
			st64(j, 0x6552747065637845)
			st64(a + 8, j, 0x10)
			st64(a, 0x10)
		}
	} else if ((f as i64) > 0xc) {
		if ((f as i64) > 0x12) {
			if ((f as i64) > 0x15) {
				if ((f as i64) > 0x17) {
					if (f == 0x18) {
						ak = 0x1c > g
						al = ak != 0 ? 0 : g - 0x1c
						j = g != 0 ? al : 0x300007fe4
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x1c, 0x10015f8f8, al, ak)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 0x10, 0x6363417961727241)
						st64(j + 8, 0x6b63695474737269)
						st64(j, 0x4664696c61766e49)
						st32(j + 0x18, 0x746e756f)
						st64(a + 8, j, 0x1c)
						st64(a, 0x1c)
					} else {
						w = 0x12 > g
						x = w != 0 ? 0 : g - 0x12
						j = g != 0 ? x : 0x300007fee
						if (0x300000007 >= j) {
							raw_vec_handle_error(1, 0x12, 0x10015f8f8, x, w)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 8, 0x646e496472617765)
						st64(j, 0x5264696c61766e49)
						st16(j + 0x10, 0x7865)
						st64(a + 8, j, 0x12)
						st64(a, 0x12)
					}
				} else if (f == 0x16) {
					j = g != 0 ? sat_sub(g, 0x1b) : 0x300007fe5
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x1b, 0x10015f8f8, sat_sub(g, 0x1b), 0x1b > g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x10, 0x6f6d417475707475)
					st64(j + 8, 0x4f724f7475706e49)
					st64(j, 0x6c6c616d536f6f54)
					st32(j + 0x17, 0x746e756f)
					st64(a + 8, j, 0x1b)
					st64(a, 0x1b)
				} else {
					j = g != 0 ? sat_sub(g, 0x19) : 0x300007fe7
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x19, 0x10015f8f8, sat_sub(g, 0x19), 0x19 > g)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0x10, 0x6e756f6363417961)
					st64(j + 8, 0x7272416b63695468)
					st64(j, 0x67756f6e45746f4e)
					st8(j + 0x18, 0x74)
					st64(a + 8, j, 0x19)
					st64(a, 0x19)
				}
			} else if (f == 0x13) {
				k = 0x10 > g
				l = k != 0 ? 0 : g - 0x10
				j = g != 0 ? l : 0x300007ff0
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x646961507475706e)
				st64(j, 0x496863754d6f6f54)
				st64(a + 8, j, 0x10)
				st64(a, 0x10)
			} else if (f == 0x14) {
				y = 0x13 > g
				z = y != 0 ? 0 : g - 0x13
				j = g != 0 ? z : 0x300007fed
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x13, 0x10015f8f8, z, y)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x666963657053746e)
				st64(j, 0x756f6d416f72655a)
				st32(j + 0xf, 0x64656966)
				st64(a + 8, j, 0x13)
				st64(a, 0x13)
			} else {
				s = 0x15 > g
				t = s != 0 ? 0 : g - 0x15
				j = g != 0 ? t : 0x300007feb
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x15, 0x10015f8f8, t, s)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0xd, 0x746c7561566c6f6f)
				st64(j + 8, 0x6c6f6f507475706e)
				st64(j, 0x4964696c61766e49)
				st64(a + 8, j, 0x15)
				st64(a, 0x15)
			}
		} else if ((f as i64) > 0xf) {
			if (f == 0x10) {
				s = 0x15 > g
				t = s != 0 ? 0 : g - 0x15
				j = g != 0 ? t : 0x300007feb
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x15, 0x10015f8f8, t, s)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0xd, 0x746e656963696666)
				st64(j + 8, 0x69666675736e4979)
				st64(j, 0x746964697571694c)
				st64(a + 8, j, 0x15)
				st64(a, 0x15)
			} else if (f == 0x11) {
				w = 0x12 > g
				x = w != 0 ? 0 : g - 0x12
				j = g != 0 ? x : 0x300007fee
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x12, 0x10015f8f8, x, w)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x6568436567617070)
				st64(j, 0x696c536563697250)
				st16(j + 0x10, 0x6b63)
				st64(a + 8, j, 0x12)
				st64(a, 0x12)
			} else {
				aa = 0x17 > g
				ab = aa != 0 ? 0 : g - 0x17
				j = g != 0 ? ab : 0x300007fe9
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x17, 0x10015f8f8, ab, aa)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0xf, 0x6465766965636552)
				st64(j + 8, 0x5274757074754f65)
				st64(j, 0x6c7474694c6f6f54)
				st64(a + 8, j, 0x17)
				st64(a, 0x17)
			}
		} else {
			if (f == 0xd) {
				ai = 0x14 > g
				aj = ai != 0 ? 0 : g - 0x14
				j = g != 0 ? aj : 0x300007fec
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, aj, ai)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				am = 0x756c615662755379
			} else {
				if (f != 0xe) {
					j = g != 0 ? sat_sub(g, 0x20) : 0x300007fe0
					if (j > 0x300000007) {
						st64(0x300000000 /* heap bump-allocator cursor */, j)
						st64(j + 0x18, 0x7974696469757169)
						st64(j + 0x10, 0x4c796c7070755372)
						st64(j + 8, 0x6f466f72655a6874)
						st64(j, 0x6f42646962726f46)
						st64(a + 8, j, 0x20)
						st64(a, 0x20)
						return
					}
					raw_vec_handle_error(1, 0x20, 0x10015f8f8, sat_sub(g, 0x20), 0x20 > g)
				}
				ai = 0x14 > g
				aj = ai != 0 ? 0 : g - 0x14
				j = g != 0 ? aj : 0x300007fec
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, aj, ai)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				am = 0x756c615664644179
			}
			st64(j + 8, am)
			st64(j, 0x746964697571694c)
			st32(j + 0x10, 0x72724565)
			st64(a + 8, j, 0x14)
			st64(a, 0x14)
		}
	} else if ((f as i64) > 5) {
		if ((f as i64) > 8) {
			if ((f as i64) > 0xa) {
				if (f == 0xb) {
					o = 0x16 > g
					p = o != 0 ? 0 : g - 0x16
					j = g != 0 ? p : 0x300007fea
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0x16, 0x10015f8f8, p, o)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 0xe, 0x776f6c667265764f)
					st64(j + 8, 0x764f74696d694c65)
					st64(j, 0x6369725074727153)
					st64(a + 8, j, 0x16)
					st64(a, 0x16)
				} else {
					ac = 0xc > g
					ad = ac != 0 ? 0 : g - 0xc
					j = g != 0 ? ad : 0x300007ff4
					if (0x300000007 >= j) {
						raw_vec_handle_error(1, 0xc, 0x10015f8f8, ad, ac)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j, 0x6369725074727153)
					st32(j + 8, 0x34365865)
					st64(a + 8, j, 0xc)
					st64(a, 0xc)
				}
			} else if (f == 9) {
				k = 0x10 > g
				l = k != 0 ? 0 : g - 0x10
				j = g != 0 ? l : 0x300007ff0
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x79617272416b6369)
				st64(j, 0x5464696c61766e49)
				st64(a + 8, j, 0x10)
				st64(a, 0x10)
			} else {
				j = g != 0 ? sat_sub(g, 0x18) : 0x300007fe8
				if (0x300000007 >= j) {
					raw_vec_handle_error(1, 0x18, 0x10015f8f8, sat_sub(g, 0x18), 0x18 > g)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 0x10, 0x797261646e756f42)
				st64(j + 8, 0x79617272416b6369)
				st64(j, 0x5464696c61766e49)
				st64(a + 8, j, 0x18)
				st64(a, 0x18)
			}
		} else if (f == 6) {
			m = 0x11 > g
			n = m != 0 ? 0 : g - 0x11
			j = g != 0 ? n : 0x300007fef
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, n, m)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x6f6c667265764f72)
			st64(j, 0x65776f4c6b636954)
			st8(j + 0x10, 0x77)
			st64(a + 8, j, 0x11)
			st64(a, 0x11)
		} else if (f == 7) {
			m = 0x11 > g
			n = m != 0 ? 0 : g - 0x11
			j = g != 0 ? n : 0x300007fef
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, n, m)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x6f6c667265764f72)
			st64(j, 0x657070556b636954)
			st8(j + 0x10, 0x77)
			st64(a + 8, j, 0x11)
			st64(a, 0x11)
		} else {
			o = 0x16 > g
			p = o != 0 ? 0 : g - 0x16
			j = g != 0 ? p : 0x300007fea
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x16, 0x10015f8f8, p, o)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 0xe, 0x686374614d746f4e)
			st64(j + 8, 0x6f4e676e69636170)
			st64(j, 0x53646e416b636954)
			st64(a + 8, j, 0x16)
			st64(a, 0x16)
		}
	} else if ((f as i64) > 2) {
		if (f == 3) {
			k = 0x10 > g
			l = k != 0 ? 0 : g - 0x10
			j = g != 0 ? l : 0x300007ff0
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x7272456e6f697469)
			st64(j, 0x736f5065736f6c43)
			st64(a + 8, j, 0x10)
			st64(a, 0x10)
		} else if (f == 4) {
			k = 0x10 > g
			l = k != 0 ? 0 : g - 0x10
			j = g != 0 ? l : 0x300007ff0
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x7865646e496b6369)
			st64(j, 0x5464696c61766e49)
			st64(a + 8, j, 0x10)
			st64(a, 0x10)
		} else {
			k = 0x10 > g
			l = k != 0 ? 0 : g - 0x10
			j = g != 0 ? l : 0x300007ff0
			if (0x300000007 >= j) {
				raw_vec_handle_error(1, 0x10, 0x10015f8f8, l, k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x726564724f64696c)
			st64(j, 0x61766e496b636954)
			st64(a + 8, j, 0x10)
			st64(a, 0x10)
		}
	} else if (f == 0) {
		h = 0xb > g
		i = h != 0 ? 0 : g - 0xb
		j = g != 0 ? i : 0x300007ff5
		if (0x300000007 >= j) {
			raw_vec_handle_error(1, 0xb, 0x10015f8f8, i, h)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st64(j, 0x6f72707041746f4e)
		st32(j + 7, 0x6465766f)
		st64(a + 8, j, 0xb)
		st64(a, 0xb)
	} else if (f == 1) {
		aa = 0x17 > g
		ab = aa != 0 ? 0 : g - 0x17
		j = g != 0 ? ab : 0x300007fe9
		if (0x300000007 >= j) {
			raw_vec_handle_error(1, 0x17, 0x10015f8f8, ab, aa)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st64(j + 0xf, 0x67616c466769666e)
		st64(j + 8, 0x6e6f436574616470)
		st64(j, 0x5564696c61766e49)
		st64(a + 8, j, 0x17)
		st64(a, 0x17)
	} else {
		h = 0xb > g
		i = h != 0 ? 0 : g - 0xb
		j = g != 0 ? i : 0x300007ff5
		if (0x300000007 >= j) {
			raw_vec_handle_error(1, 0xb, 0x10015f8f8, i, h)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st64(j, 0x4c746e756f636341)
		st32(j + 7, 0x6b63614c)
		st64(a + 8, j, 0xb)
		st64(a, 0xb)
	}
}

function fn_88558(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s30 = fp - 0x30
	const f = ld32(a)
	st64(s30, (f as i64) > 0x19 ? (f as i64) > 0x26 ? (f as i64) > 0x2c ? (f as i64) > 0x2f ? (f as i64) > 0x31 ? f != 0x32 ? 0x100160950 : 0x100160940 : f != 0x30 ? 0x100160930 : 0x100160920 : f != 0x2d ? f != 0x2e ? 0x100160910 : 0x100160900 : 0x1001608f0 : (f as i64) > 0x29 ? f != 0x2a ? f != 0x2b ? 0x1001608e0 : 0x1001608d0 : 0x1001608c0 : f != 0x27 ? f != 0x28 ? 0x1001608b0 : 0x1001608a0 : 0x100160890 : (f as i64) > 0x1f ? (f as i64) > 0x22 ? (f as i64) > 0x24 ? f != 0x25 ? 0x100160880 : 0x100160870 : f != 0x23 ? 0x100160860 : 0x100160850 : f != 0x20 ? f != 0x21 ? 0x100160840 : 0x100160830 : 0x100160820 : (f as i64) > 0x1c ? f != 0x1d ? f != 0x1e ? 0x100160810 : 0x100160800 : 0x1001607f0 : f != 0x1a ? f != 0x1b ? 0x1001607e0 : 0x1001607d0 : 0x1001607c0 : (f as i64) > 0xc ? (f as i64) > 0x12 ? (f as i64) > 0x15 ? (f as i64) > 0x17 ? f != 0x18 ? 0x1001607b0 : 0x1001607a0 : f != 0x16 ? 0x100160790 : 0x100160780 : f != 0x13 ? f != 0x14 ? 0x100160770 : 0x100160760 : 0x100160750 : (f as i64) > 0xf ? f != 0x10 ? f != 0x11 ? 0x100160740 : 0x100160730 : 0x100160720 : f != 0xd ? f != 0xe ? 0x100160710 : 0x100160700 : 0x1001606f0 : (f as i64) > 5 ? (f as i64) > 8 ? (f as i64) > 0xa ? f != 0xb ? 0x1001606e0 : 0x1001606d0 : f != 9 ? 0x1001606c0 : 0x1001606b0 : f != 6 ? f != 7 ? 0x1001606a0 : 0x100160690 : 0x100160680 : (f as i64) > 2 ? f != 3 ? f != 4 ? 0x100160670 : 0x100160660 : 0x100160650 : f != 0 ? f != 1 ? 0x100160640 : 0x100160630 : 0x100160620, 1, 8, 0, 0)
	const g = ld64(b + 0x28)
	return fn_f5d8(ld64(b + 0x20), g, s30, g, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_13e5a0(a: u64, b: u64): u64 {
	const f = __rust_alloc(0xa0, 8)
	if (f == 0) {
		alloc_handle_alloc_error(8, 0xa0)
	}
	const g = memcpy(f, b, 0xa0)
	st64(a + 8, f)
	st64(a, 0)
	return g
}

function fn_88360(a: u64, b: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s11c = fp - 0x11c, s130 = fp - 0x130
	st32(s11c, b)
	fn_85138(s78, s11c)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(s11c, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st32(sf8 + 0x78, b + 0x1770 /* error::NotApproved */)
	st8(sf8 + 0x30, 2)
	st64(s118, 2)
	const g = fn_13e5a0(s130, s118)
	const f = ld64(s130)
	st64(a + 8, ld64(s130 + 8))
	st64(a, f)
	return g
}

// types [heur]: b: AccountInfo (1 of 2 calls pass one, the others an untyped value: fn_28d58)
function fn_5608(a: u64, b: AccountInfo): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	let k, p, q: u64
	const f = b.owner
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) != 0) {
		const o = anchor_error_from(s50, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const n = ld64(s50 + 8)
		const m = ld64(s50)
		copyr(s40, f, 0x20)
		st64(s20, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
		q = Error_with_pubkeys(s60, m, n, s40, o)
		p = ld64(s60)
		st64(a + 8, ld64(s60 + 8))
		st64(a, p)
		return q
	}
	q = AccountInfo_try_borrow_data(s40, b, g as u32)
	const l = ld64(s40 + 0x10)
	const i = ld64(s40 + 8)
	const h = ld64(s40)
	if (h == 0x800000000000001a /* Ok */) {
		const j = ld64(i + 8)
		if (8 > j) {
			q = anchor_error_from(s80, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, j)
			k = ld64(s80)
			st64(a + 8, ld64(s80 + 8))
			st64(a, k)
			st64(l, ld64(l) - 1)
			return q
		}
		if (ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */) {
			q = anchor_error_from(s80, 0xbba /* anchor::AccountDiscriminatorMismatch */, 0x46dec3d7f5e3edf7 /* account:PoolState */)
			k = ld64(s80)
			st64(a + 8, ld64(s80 + 8))
			st64(a, k)
			st64(l, ld64(l) - 1)
			return q
		}
		st64(a + 8, b)
		st64(a, 2)
		st64(l, ld64(l) - 1)
		return q
	}
	st64(s40, h, i, l)
	q = fn_13e628(s70, s40)
	p = ld64(s70)
	st64(a + 8, ld64(s70 + 8))
	st64(a, p)
	return q
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: pool_state_data: PoolStateAccount
function fn_4dc0(a: u64, b: AccountInfo, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let m: u64
	let n = AccountInfo_try_borrow_data(s18, b, r0)
	const k = ld64(s18 + 0x10)
	const g = ld64(s18 + 8)
	const f = ld64(s18)
	if (f != 0x800000000000001a /* Ok */) {
		st64(s18, f, g, k)
		n = fn_13e628(s28, s18)
		const l = ld64(s28)
		st64(a + 0x10, ld64(s28 + 8))
		st64(a + 8, l)
		st64(a, 1)
		return n
	}
	const h = ld64(g + 8)
	if (8 > h) {
		n = anchor_error_from(s48, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, 0x800000000000001a /* Ok */)
		m = ld64(s48)
		st64(a + 0x10, ld64(s48 + 8))
		st64(a + 8, m)
		st64(a, 1)
		st64(k, ld64(k) - 1)
		return n
	}
	const pool_state_data: PoolStateAccount = ld64(g)
	const j = pool_state_data.discriminator
	if (j == 0x46dec3d7f5e3edf7 /* account:PoolState */) {
		if (h > 0x607) {
			st64(a + 0x10, k)
			st64(a + 8, pool_state_data.bump)
			st64(a, 0)
			return n
		}
		fn_153158(0x608, h, 0x10015f700, 0x46dec3d7f5e3edf7 /* account:PoolState */)
	}
	n = anchor_error_from(s38, 0xbba /* anchor::AccountDiscriminatorMismatch */, j, 0x46dec3d7f5e3edf7 /* account:PoolState */)
	m = ld64(s38)
	st64(a + 0x10, ld64(s38 + 8))
	st64(a + 8, m)
	st64(a, 1)
	st64(k, ld64(k) - 1)
	return n
}

function fn_7cb20(a: u64, b: AccountInfo, c: AccountInfo, d: AccountInfo, p5: u64, p6: u64, p7: u64): u64 {
	const s10 = fp - 0x10, s18 = fp - 0x18, s40 = fp - 0x40, s48 = fp - 0x48, s70 = fp - 0x70, s78 = fp - 0x78, sa0 = fp - 0xa0, sa8 = fp - 0xa8, se8 = fp - 0xe8, sf8 = fp - 0xf8
	const f: AccountInfo = p5
	const g: LamportsCell = f.lamports
	const h = f.key
	rc_inc(g)
	const i: DataCell = f.data
	const an = p7
	const ao = p6
	rc_inc(i)
	const j: LamportsCell = c.lamports
	const aj = c.key
	const ak = f.executable
	const al = f.is_writable
	const am = f.is_signer
	const o = f.rent_epoch
	const p = f.owner
	rc_inc(j)
	const k: DataCell = c.data
	rc_inc(k)
	const l: LamportsCell = d.lamports
	const ae = d.key
	const af = c.executable
	const ag = c.is_writable
	const ah = c.is_signer
	const ai = c.rent_epoch
	const m = c.owner
	rc_inc(l)
	const n: DataCell = d.data
	rc_inc(n)
	const q: LamportsCell = b.lamports
	const aa = b.key
	const ab = d.executable
	const ac = d.is_writable
	const ad = d.is_signer
	const r = d.rent_epoch
	const t = d.owner
	rc_inc(q)
	const s: DataCell = b.data
	rc_inc(s)
	const x = b.owner
	const w = b.rent_epoch
	const v = b.is_signer
	const u = b.is_writable
	st8(s18 + 2, b.executable)
	st8(s18, v, u)
	st64(s40, aa, q, s, x, w)
	st8(s48, ad, ac, ab)
	st64(s70, ae, l, n, t, r)
	st8(s78, ah, ag, af)
	st64(sa0, aj, j, k, m, ai)
	st64(s10, ao, an)
	st8(sa8, am, al, ak)
	st64(se8, 0, 8, 0, h, g, i, p, o)
	const z = token_2022_close_account_12a8e8(sf8, se8)
	const y = ld64(sf8)
	st64(a + 8, ld64(sf8 + 8))
	st64(a, y)
	return z
}

// types [heur]: b: ClosePositionAccounts (every call passes one: fn_28d58)
function fn_7be40(a: u64, b: ClosePositionAccounts, c: AccountInfo, d: AccountInfo, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s10 = fp - 0x10, s18 = fp - 0x18, s40 = fp - 0x40, s48 = fp - 0x48, s70 = fp - 0x70, s78 = fp - 0x78, sa0 = fp - 0xa0, sa8 = fp - 0xa8, se8 = fp - 0xe8, sf8 = fp - 0xf8
	const f: LamportsCell = c.lamports
	const p = c.key
	rc_inc(f)
	const g: DataCell = c.data
	const h = p8
	const ao = p7
	const ap = p6
	const i: AccountInfo = p5
	rc_inc(g)
	let aq = b
	const j: LamportsCell = i.lamports
	const an = i.key
	const aj = c.executable
	const ak = c.is_writable
	const al = c.is_signer
	const am = c.rent_epoch
	const o = c.owner
	rc_inc(j)
	const k: DataCell = i.data
	rc_inc(k)
	const l: LamportsCell = d.lamports
	const af = i.executable
	const ag = i.is_writable
	const ah = i.is_signer
	const ai = i.rent_epoch
	const m = i.owner
	const ae = d.key
	rc_inc(l)
	const n: DataCell = d.data
	rc_inc(n)
	const q: AccountInfo = ld64(aq)
	const r: LamportsCell = q.lamports
	const ad = d.executable
	aq = d.is_writable
	const aa = d.is_signer
	const u = d.rent_epoch
	const v = d.owner
	const s = q.key
	rc_inc(r)
	const t: DataCell = q.data
	rc_inc(t)
	const z = q.owner
	const y = q.rent_epoch
	const x = q.is_signer
	const w = q.is_writable
	st8(s18 + 2, q.executable)
	st8(s18, x, w)
	st64(s40, s, r, t, z, y)
	st8(s48, aa, aq, ad)
	st64(s70, ae, l, n, v, u)
	st8(s78, al, ak, aj)
	st64(sa0, p, f, g, o, am)
	st64(s10, ap, ao)
	st8(sa8, ah, ag, af)
	st64(se8, 0, 8, 0, an, j, k, m, ai)
	const ac = token_2022_burn(sf8, se8, h)
	const ab = ld64(sf8)
	st64(a + 8, ld64(sf8 + 8))
	st64(a, ab)
	return ac
}

function fn_7b7e8(a: u64, b: AccountInfo, c: AccountInfo, d: AccountInfo, p5: u64, p6: u64, p7: u64): u64 {
	const s10 = fp - 0x10, s18 = fp - 0x18, s40 = fp - 0x40, s48 = fp - 0x48, s70 = fp - 0x70, s78 = fp - 0x78, sa0 = fp - 0xa0, sa8 = fp - 0xa8, se8 = fp - 0xe8, sf8 = fp - 0xf8
	const f: AccountInfo = p5
	const g: LamportsCell = f.lamports
	const h = f.key
	rc_inc(g)
	const i: DataCell = f.data
	const an = p7
	const ao = p6
	rc_inc(i)
	const j: LamportsCell = d.lamports
	const aj = d.key
	const ak = f.executable
	const al = f.is_writable
	const am = f.is_signer
	const o = f.rent_epoch
	const p = f.owner
	rc_inc(j)
	const k: DataCell = d.data
	rc_inc(k)
	const l: LamportsCell = c.lamports
	const ae = c.key
	const af = d.executable
	const ag = d.is_writable
	const ah = d.is_signer
	const ai = d.rent_epoch
	const m = d.owner
	rc_inc(l)
	const n: DataCell = c.data
	rc_inc(n)
	const q: LamportsCell = b.lamports
	const aa = b.key
	const ab = c.executable
	const ac = c.is_writable
	const ad = c.is_signer
	const r = c.rent_epoch
	const t = c.owner
	rc_inc(q)
	const s: DataCell = b.data
	rc_inc(s)
	const x = b.owner
	const w = b.rent_epoch
	const v = b.is_signer
	const u = b.is_writable
	st8(s18 + 2, b.executable)
	st8(s18, v, u)
	st64(s40, aa, q, s, x, w)
	st8(s48, ad, ac, ab)
	st64(s70, ae, l, n, t, r)
	st8(s78, ah, ag, af)
	st64(sa0, aj, j, k, m, ai)
	st64(s10, ao, an)
	st8(sa8, am, al, ak)
	st64(se8, 0, 8, 0, h, g, i, p, o)
	const z = token_2022_close_account_1298c8(sf8, se8)
	const y = ld64(sf8)
	st64(a + 8, ld64(sf8 + 8))
	st64(a, y)
	return z
}

function fn_14ed60(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70
	st64(s70, a, b, c, d, 0x100162390)
	st64(s50 + 0x10, s20)
	st64(s20, s70, T_fmt_155a38, s60, T_fmt_155a08)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "{}: {}" {} = a [T_fmt_155a38], {} = c [T_fmt_155a08]
	fn_14ec00(s50, e, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_13e628(a: u64, b: u64): u64 {
	const f = __rust_alloc(0x80, 8)
	if (f == 0) {
		alloc_handle_alloc_error(8, 0x80)
	}
	st64(f, 2)
	copy(f + 0x20, b, 0x18)
	st8(f + 0x38, 2)
	st64(a + 8, f)
	st64(a, 1)
	return f
}

// types [heur]: d: DataCell (every call passes one: fn_551a8, fn_a8b80, fn_d36e0, …)
function fn_13e190(a: u64, b: u64, c: u64, d: DataCell, e: u64): u64 {
	const s18 = fp - 0x18
	const f = fn_147a20(c, b, c, d, e)
	let g = f
	const h = fn_147a20(b)
	if (f > f + h) {
		fn_14e940(0x100161420, f + h)
	}
	const i = ld64(c + 8)
	const j = ld64(i + 0x10)
	if (j == 0) {
		const k = h + g
		st64(i + 0x10, -1)
		st64(ld64(i + 0x18), k)
		st64(i + 0x10, ld64(i + 0x10) + 1)
		const l = ld64(b + 8)
		const m = ld64(l + 0x10)
		if (m == 0) {
			st64(l + 0x10, -1)
			st64(ld64(l + 0x18), 0)
			st64(l + 0x10, ld64(l + 0x10) + 1)
			let n = memset(s18, b, 0, AccountInfo_assign(b, 0x100159560, k))
			let o = 2
			if (ld64(s18) != 0x800000000000001a /* Ok */) {
				n = __rust_alloc(0x80, 8)
				g = n
				if (n == 0) {
					alloc_handle_alloc_error(8, 0x80)
				}
				st64(g, 2)
				copy(g + 0x20, s18, 0x18)
				st8(g + 0x38, 2)
				o = 1
			}
			const t = o
			const p = ld64(c + 8)
			if (rc_release(p)) {
				n = Rc_drop_slow_13cfe8(c + 8, n)
			}
			const q = ld64(c + 0x10)
			if (rc_release(q)) {
				n = Rc_drop_slow_13d038(c + 0x10, n)
			}
			const r = ld64(b + 8)
			if (rc_release(r)) {
				n = Rc_drop_slow_13cfe8(b + 8, n)
			}
			const s = ld64(b + 0x10)
			if (!rc_release(s)) {
				st64(a + 8, g)
				st64(a, t)
				return n
			}
			n = Rc_drop_slow_13d038(b + 0x10, n)
			st64(a + 8, g)
			st64(a, t)
			return n
		}
		fn_14e770(0x1001613f0, m)
	}
	fn_14e770(0x100161408, j)
}

function fn_f5d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (points to it), e (value)
function fn_153158(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155b30(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14ec00(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s18 = fp - 0x18
	st64(s18, a, b)
	st16(s18 + 0x10, 1)
	fn_14ce00(s18, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), d (value), e (value)
function fn_147a20(a: AccountInfo, b: u64, c: u64, d: u64, e: u64): u64 {
	const f: LamportsCell = a.lamports
	const g = f.borrow
	if (g > 0x7ffffffffffffffe) {
		fn_14e808(0x100161ee0, g, 0x7ffffffffffffffe, d, e)
	}
	f.borrow = g + 1
	const h = f.value.amount
	f.borrow = g
	return h
}

function fn_14e940(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14ec30("called `Option::unwrap()` on a `None` value", 0x2b, a, d, e)
}

function fn_14e770(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s1 = fp - 0x1, s18 = fp - 0x18, s48 = fp - 0x48
	st64(s48, 0x100162320)
	st64(s48 + 0x10, s18)
	st64(s18, s1, BorrowMutError_fmt)
	st64(s48 + 0x20, 0)
	st64(s48 + 8, 1)
	st64(s48 + 0x18, 1)
	// fmt "already borrowed: {}" {} = *s1 [BorrowMutError_fmt]
	fn_14ec00(s48, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (value), d (points to it), e (value)
function fn_155b30(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	st64(s60, a, b, 0x100162618)
	st64(s50 + 0x10, s20)
	st64(s20, s60, fn_155738, s58, fn_155738)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "range end index {} out of range for slice of length {}" {} = a [fn_155738], {} = b [fn_155738]
	fn_14ec00(s50, c, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14ce00(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14d4b8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), e (value)
function fn_14e808(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s1 = fp - 0x1, s18 = fp - 0x18, s48 = fp - 0x48
	st64(s48, 0x100162330)
	st64(s48 + 0x10, s18)
	st64(s18, s1, BorrowError_fmt)
	st64(s48 + 0x20, 0)
	st64(s48 + 8, 1)
	st64(s48 + 0x18, 1)
	// fmt "already mutably borrowed: {}" {} = *s1 [BorrowError_fmt]
	fn_14ec00(s48, a, c, d, e)
}

function fn_14ec30(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s10 = fp - 0x10, s38 = fp - 0x38, s40 = fp - 0x40
	st64(s40, s10)
	st64(s10, a, b)
	st64(s38, 1, 8, 0, 0)
	fn_14ec00(s40, c, c, s10, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14d4b8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	custom_panic(a, b, c, d, e)
	abort()
}
