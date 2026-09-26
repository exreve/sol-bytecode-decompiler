// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction open_position_with_token22_nft: handler + 34 reachable functions
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
interface Mint extends sized<0x60> { // Account<Mint> (anchor_spl, SPL Token Mint) as unpacked in memory (fields [known: spl_token::state layout] at the offsets a run of try_accounts_15c0 put them [offsets from exec]; info = the &AccountInfo)
	mint_authority:   at<0x04, Pubkey> // COption<Pubkey>
	supply:           at<0x28, u64>
	decimals:         at<0x30, u8>
	freeze_authority: at<0x38, Pubkey> // COption<Pubkey>
	info:             at<0x58, ref<AccountInfo>> // &AccountInfo
}
interface TokenAccount extends sized<0xd8> { // Account<TokenAccount> (anchor_spl, SPL Token Account) as unpacked in memory (fields [known: spl_token::state layout] at the offsets a run of try_accounts_1678 put them [offsets from exec]; info = the &AccountInfo)
	info:             at<0x20, ref<AccountInfo>> // &AccountInfo
	mint:             at<0x28, Pubkey>
	owner:            at<0x48, Pubkey>
	amount:           at<0x68, u64>
	delegate:         at<0x74, Pubkey> // COption<Pubkey>
	is_native:        at<0xa0, u64> // COption<u64>
	delegated_amount: at<0xa8, u64>
	close_authority:  at<0xb4, Pubkey> // COption<Pubkey>
}
interface OpenPositionWithToken22NftAccounts { // Accounts struct of instruction open_position_with_token22_nft as accounts_open_position_with_token22_nft returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	payer:           at<0x00, ref<AccountInfo>>
	pool_state:      at<0x20, ref<AccountInfo>> // the &AccountInfo of an account of type PoolState (e.g. AccountLoader<PoolState>: data not deserialized)
	token_account_0: at<0x48, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_account_1: at<0x50, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_vault_0:   at<0x58, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_vault_1:   at<0x60, ref<TokenAccount>> // Box<Account<TokenAccount>>
	vault_0_mint:    at<0xa8, ref<Mint>> // Box<Account<Mint>>
	vault_1_mint:    at<0xb0, ref<Mint>> // Box<Account<Mint>>
}
interface OpenPositionWithToken22NftContext { // anchor_lang Context of instruction open_position_with_token22_nft (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<OpenPositionWithToken22NftAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface OpenPositionWithToken22NftArgs { // arguments of instruction open_position_with_token22_nft (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	tick_lower_index:             at<0x00, u32>
	tick_upper_index:             at<0x04, u32>
	tick_array_lower_start_index: at<0x08, u32>
	tick_array_upper_start_index: at<0x0c, u32>
	liquidity:                    at<0x10, u128>
	amount_0_max:                 at<0x20, u64>
	amount_1_max:                 at<0x28, u64>
	with_metadata:                at<0x30, u8>
}
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function fn_11e0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function fn_7498(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses try_accounts_1678, alloc_handle_alloc_error, memcpy
declare function fn_7768(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses try_accounts_15c0, alloc_handle_alloc_error, memcpy
declare function fn_f128(a: u64): u64 // lib uses alloc_handle_alloc_error, Error__new
declare function AccountInfo_clone_f338(a: u64, b: u64): u64 // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function ptr_drop_in_place_f5e8(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<solana_account_info::AccountInfo>
declare function ptr_drop_in_place_fcd8(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<solana_account_info::AccountInfo>
declare function fn_145f8(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses de_unexpected_eof_to_unexpected_length_of_input
declare function Rc_drop_slow_14df0(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function fn_16008(a: u64, b: u64): u64 // lib
declare function try_accounts_17a30(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_17ae0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_18870(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_18cf0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp, Error_with_pubkeys
declare function try_accounts_18f40(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_19190(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function associated_token_create(a: u64, b: u64): u64 // lib anchor_spl::associated_token::create
declare function fn_12b0f8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcpy, Rc_drop_slow_125dd0, Rc_drop_slow_125e20
declare function RawVec_grow_one_131b28(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib alloc::raw_vec::RawVec<T,A>::grow_one
declare function reserve_do_reserve_and_handle_131e08(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib alloc::raw_vec::RawVecInner<A>::reserve::do_reserve_and_handle
declare function fn_133040(a: u64, b: u64, c: u64): void // lib
declare function fn_1334b0(a: u64, b: u64): u64 // lib uses __rust_alloc, raw_vec_handle_error, reserve_do_reserve_and_handle_131e08, memcpy
declare function fn_13c168(a: u64, b: u64, r0: u64): u64 // lib uses memcmp
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function Error_with_pubkeys(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib anchor_lang::error::Error::with_pubkeys
declare function system_program_assign_13fb30(a: u64, b: u64, c: u64): u64 // lib anchor_lang::system_program::assign
declare function system_program_assign_13ff40(a: u64, b: u64, c: u64): u64 // lib anchor_lang::system_program::assign
declare function system_program_create_account(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib anchor_lang::system_program::create_account
declare function system_program_transfer(a: u64, b: u64, c: u64): u64 // lib anchor_lang::system_program::transfer
declare function ErrorCode_name(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib anchor_lang::error::ErrorCode::name
declare function ErrorCode_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::error::ErrorCode as core::fmt::Display>::fmt
declare function invoke_signed(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcmp, AccountInfo_try_borrow_lamports, AccountInfo_try_borrow_data, sol_invoke_signed_rust, …
declare function rent_get(a: u64): u64 // lib solana_sysvar::rent::<impl solana_sysvar::Sysvar for solana_rent::Rent>::get
declare function Rent_is_exempt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib solana_rent::Rent::is_exempt
declare function AccountInfo_try_data_len(a: u64, b: u64): void // lib solana_account_info::AccountInfo::try_data_len
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function de_unexpected_eof_to_unexpected_length_of_input(a: u64): u64 // lib borsh::de::unexpected_eof_to_unexpected_length_of_input
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fn_14de10(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a formatting trait implementation return…"
declare function fmt_write(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::write
declare function imp__fmt_154cb0(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u8>::_fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function fn_1561f0(a: u64, b: u64): u64 // lib
declare function __floatundidf(a: u64): u64 // lib __floatundidf
declare function __fixunsdfdi(a: u64): u64 // lib __fixunsdfdi
declare function __multi3_159030(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __multi3

// instruction handler: open_position_with_token22_nft (discriminator sha256("global:open_position_with_token22_nft")[..8] = 0x2ec91d7d52aeff4d)
// accounts [idl]: 0 payer [signer, mut], 1 position_nft_owner, 2 position_nft_mint [signer, mut], 3 position_nft_account [mut], 4 pool_state [mut], 5 protocol_position, 6 tick_array_lower [mut, pda], 7 tick_array_upper [mut, pda], 8 personal_position [mut, pda], 9 token_account_0 [mut], 10 token_account_1 [mut], 11 token_vault_0 [mut], 12 token_vault_1 [mut], 13 rent [= SysvarRent111111111111111111111111111111111], 14 system_program [= 11111111111111111111111111111111], 15 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 16 associated_token_program [= ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL], 17 token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb], 18 vault_0_mint, 19 vault_1_mint
// args [idl]: tick_lower_index: i32, tick_upper_index: i32, tick_array_lower_start_index: i32, tick_array_upper_start_index: i32, liquidity: u128, amount_0_max: u64, amount_1_max: u64, with_metadata: bool, base_flag: Option<bool>
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args
function ix_open_position_with_token22_nft(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const sa0 = fp - 0xa0, sa8 = fp - 0xa8, sb8 = fp - 0xb8, s158 = fp - 0x158, s170 = fp - 0x170, s180 = fp - 0x180, s183 = fp - 0x183, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8, s200 = fp - 0x200, s208 = fp - 0x208, s210 = fp - 0x210, s218 = fp - 0x218, s1000 = fp - 0x1000
	let h, i, j, k, p, s: u64
	B13: {
		st64(s1c8, accounts, program_id)
		sol_log("Instruction: OpenPositionWithToken22Nft", 0x27)
		const f = ix_args_len
		if (f >= 4 && ((f & -4) != 4 && ((f & -4) != 8 && ((f & -4) != 0xc && ((f & -0x10) != 0x10 && ((f & -8) != 0x20 && (f & -8) != 0x28)))))) {
			const args: OpenPositionWithToken22NftArgs = ix_args
			st64(s1e0, args.tick_lower_index)
			st64(s1e8, args.tick_upper_index)
			st64(s1f0, args.tick_array_lower_start_index)
			st64(s200, args.tick_array_upper_start_index)
			copyr(s1d8, args.liquidity, 0x10)
			st64(s1f8, args.amount_0_max)
			st64(s208, args.amount_1_max)
			st64(s170, args + 0x30, f - 0x30)
			fn_145f8(sb8, s170, args)
			k = ld64(sb8 + 8)
			if (ld8(sb8) != 0) {
				break B13
			}
			st64(s210, ld8(sb8 + 1))
			fn_17748(sb8, s170, h, i, j, k)
			k = ld64(sb8 + 8)
			if (ld8(sb8) != 0) {
				break B13
			}
			st64(s218, ld8(sb8 + 1))
			st8(s183 + 2, 0xff)
			st16(s183, 0xffff)
			st64(s180 + 8, accounts_len)
			st64(s180, ld64(s1c8))
			st64(s1000, f, s183)
			s = accounts_open_position_with_token22_nft(sb8, ld64(s1c8 + 8), s180, args, fp, k)
			const l = ld64(sb8)
			if (l == 0) {
				p = ld64(sb8 + 8)
				st64(a + 8, ld64(sa8))
				st64(a, p)
				return s
			}
			const n = ld64(sb8 + 8)
			const m = ld64(sa8)
			memcpy(s158, sa0, 0xa0)
			st64(s170 + 0x10, m)
			const o = ld64(s1c8 + 8)
			st64(s170, l, n)
			st16(sa0 + 8, ld16(s183))
			st8(sa0 + 0xa, ld8(s183 + 2))
			copyr(sa8, s180, 0x10)
			st64(sb8, o, s170)
			st64(s1000 + 0x38, ld64(s218))
			st64(s1000 + 0x30, ld64(s210) & 1)
			st64(s1000 + 0x28, ld64(s200))
			st64(s1000 + 0x20, ld64(s1f0))
			st64(s1000 + 0x18, ld64(s1e8))
			st64(s1000 + 0x10, ld64(s1e0))
			st64(s1000 + 8, ld64(s208))
			st64(s1000, ld64(s1f8))
			s = fn_26d98(s198, sb8, ld64(s1d8), ld64(s1d8 + 8), ld64(s1000), ld64(s1000 + 8), ld64(s1000 + 0x10), ld64(s1000 + 0x18), ld64(s1000 + 0x20), ld64(s1000 + 0x28), ld64(s1000 + 0x30), ld64(s1000 + 0x38))
			p = ld64(s198)
			if (p == 2) {
				s = fn_a6478(s1a8, s170, o)
				p = ld64(s1a8)
				st64(a + 8, ld64(s1a8 + 8))
				st64(a, p)
				return s
			}
			st64(a + 8, ld64(s198 + 8))
			st64(a, p)
			return s
		}
		k = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	}
	const q = k
	if (2 > (k & 3) - 2) {
		s = anchor_error_from(s1b8, 0x66 /* anchor::InstructionDidNotDeserialize */, h, i, j)
		p = ld64(s1b8)
		st64(a + 8, ld64(s1b8 + 8))
		st64(a, p)
		return s
	}
	if ((q & 3) == 0) {
		s = anchor_error_from(s1b8, 0x66 /* anchor::InstructionDidNotDeserialize */, h, i, j)
		p = ld64(s1b8)
		st64(a + 8, ld64(s1b8 + 8))
		st64(a, p)
		return s
	}
	const r = ld64(ld64(k + 7))
	if (r == 0) {
		s = anchor_error_from(s1b8, 0x66 /* anchor::InstructionDidNotDeserialize */, h, i, j)
		p = ld64(s1b8)
		st64(a + 8, ld64(s1b8 + 8))
		st64(a, p)
		return s
	}
	callx(r, ld64(k - 1), r)
	s = anchor_error_from(s1b8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	p = ld64(s1b8)
	st64(a + 8, ld64(s1b8 + 8))
	st64(a, p)
	return s
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_17748(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s10 = fp - 0x10, s40 = fp - 0x40, s58 = fp - 0x58, s59 = fp - 0x59, s78 = fp - 0x78, s79 = fp - 0x79
	const g = ld64(b)
	const f = ld64(b + 8)
	if (f == 0) {
		r0 = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		st64(b, g)
		st64(a + 8, r0)
		st8(a, 1)
		return r0
	}
	const h = ld8(g)
	st64(b + 8, f - 1)
	st64(b, g + 1)
	st8(s79, h)
	if (h == 0) {
		st8(a + 1, 2)
		st8(a, 0)
		return r0
	}
	if (h == 1) {
		if (f == 1) {
			r0 = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
			st64(b, g + 1)
			st64(a + 8, r0)
			st8(a, 1)
			return r0
		}
		const i = ld8(g + 1)
		st64(b + 8, f - 2)
		st64(b, g + 2)
		st8(s59, i)
		if (2 > i) {
			st8(a + 1, i)
			st8(a, 0)
			return r0
		}
		st64(s40, 0x10015f910)
		st64(s40 + 0x10, s10)
		st64(s10, s59, fn_154c88)
		st64(s40 + 0x20, 0)
		st64(s40 + 8, 1)
		st64(s40 + 0x18, 1)
		// fmt "Invalid bool representation: {}" {} = i [fn_154c88]
		fn_14de10(s58, s40, h, d, e)
		r0 = fn_f128(s58)
		st64(a + 8, r0)
		st8(a, 1)
		return r0
	}
	st64(s40, 0x10015fab0)
	st64(s40 + 0x10, s58)
	st64(s58, s79, fn_154c88)
	st64(s40 + 0x20, 0)
	st64(s40 + 8, 2)
	st64(s40 + 0x18, 1)
	// fmt "Invalid Option representation: {}. The first byte must be 0 or 1" {} = h [fn_154c88]
	fn_14de10(s78, s40, h, d, e)
	r0 = fn_f128(s78)
	st64(a + 8, r0)
	st8(a, 1)
	return r0
}

// Anchor Accounts::try_accounts of instruction open_position_with_token22_nft (called by ix_open_position_with_token22_nft; name [str]: from the handler's "Instruction: …" log; was fn_a17d8)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: pool_state (ConstraintMut), protocol_position (AccountNotEnoughKeys), tick_array_lower (ConstraintSeeds, ConstraintMut), tick_array_upper (AccountNotEnoughKeys, ConstraintSeeds, ConstraintMut), token_account_0 (ConstraintMut), token_account_1 (ConstraintMut), token_vault_0 (ConstraintMut, ConstraintRaw), token_vault_1 (ConstraintMut, ConstraintRaw), rent, system_program, token_program, associated_token_program, token_program_2022, vault_0_mint (ConstraintAddress), vault_1_mint (ConstraintAddress), position_nft_account (ConstraintMut), position_nft_mint (ConstraintMut), payer (ConstraintMut), personal_position (ConstraintSeeds, ConstraintMut, ConstraintRentExempt)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: vault_0_mint_box, vault_1_mint_box, token_vault_0_box, token_vault_1_box, token_vault_0_box_2, token_vault_1_box_2, payer [idl], personal_position [idl], token_vault_0, token_vault_1
function accounts_open_position_with_token22_nft(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s60 = fp - 0x60, s80 = fp - 0x80, sa0 = fp - 0xa0, sc0 = fp - 0xc0, se0 = fp - 0xe0, se4 = fp - 0xe4, s108 = fp - 0x108, s128 = fp - 0x128, s148 = fp - 0x148, s168 = fp - 0x168, s188 = fp - 0x188, s1b8 = fp - 0x1b8, s1d8 = fp - 0x1d8, s1d9 = fp - 0x1d9, s200 = fp - 0x200, s218 = fp - 0x218, s230 = fp - 0x230, s238 = fp - 0x238, s240 = fp - 0x240, s248 = fp - 0x248, s250 = fp - 0x250, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s598 = fp - 0x598, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s5c8 = fp - 0x5c8, s5d8 = fp - 0x5d8, s5e8 = fp - 0x5e8, s5f8 = fp - 0x5f8, s608 = fp - 0x608, s618 = fp - 0x618, s628 = fp - 0x628, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s668 = fp - 0x668, s678 = fp - 0x678, s688 = fp - 0x688, s698 = fp - 0x698, s6a8 = fp - 0x6a8, s730 = fp - 0x730, s738 = fp - 0x738, s740 = fp - 0x740, s748 = fp - 0x748, s750 = fp - 0x750, s758 = fp - 0x758, s760 = fp - 0x760, s768 = fp - 0x768, s770 = fp - 0x770
	let i, j, m, n, o, q, r, s, w, x, y, aa, ab, ao, ap, ar, at, av, aw, ay, az, be, bf, bh, bi, bk, bl, bn, bo, bq, br: u64
	st64(s258, b)
	const f = ld64(e - 0x1000)
	if (f >= 4) {
		const bw = ld64(e - 0xff8)
		if ((f & -4) > 0xc || ((1 << (f & -4 & 0x3f)) & 0x1110) == 0) {
			st64(s730 + 0x78, ld32(d + 0xc))
			st64(s730 + 0x80, ld32(d + 8))
			j = try_accounts_17a30(s40, c, c, d, e, r0)
			const payer: AccountInfo = ld64(s38)
			i = ld64(s40)
			if (i == 2) {
				st64(s250, payer)
				const l = ld64(c + 8)
				if (l == 0) {
					anchor_error_from(s268, 0xbbd /* anchor::AccountNotEnoughKeys */, m, n, o)
					j = ld64(s268 + 8)
					i = ld64(s268)
					if (i != 2) {
						const ag = ld64(0x300000000 /* heap bump-allocator cursor */)
						const ah = ag != 0 ? sat_sub(ag, 0x12) : 0x300007fee
						if ((i & 1) != 0) {
							if (0x300000008 > ah) {
								raw_vec_handle_error(1, 0x12, 0x10015f8f8, sat_sub(ag, 0x12), 0x12 > ag)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, ah)
							st64(ah + 8, 0x6e776f5f74666e5f)
							st64(ah, 0x6e6f697469736f70)
							st16(ah + 0x10, 0x7265)
							void ld64(j)
						} else {
							if (0x300000008 > ah) {
								raw_vec_handle_error(1, 0x12, 0x10015f8f8, sat_sub(ag, 0x12), 0x12 > ag)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, ah)
							st64(ah + 8, 0x6e776f5f74666e5f)
							st64(ah, 0x6e6f697469736f70)
							st16(ah + 0x10, 0x7265)
							void ld64(j)
						}
						st64(j + 0x10, ah, 0x12)
						st64(j + 8, 0x12)
						st64(j, 1)
						st64(a + 0x10, j)
						st64(a + 8, i)
						st64(a, 0)
						return j
					}
				} else {
					st64(c + 8, l - 1)
					j = ld64(c)
					st64(c, j + 0x30)
				}
				st64(s730 + 0x70, j)
				try_accounts_17a30(s40, c, m, n, o, j)
				j = ld64(s38)
				i = ld64(s40)
				if (i == 2) {
					st64(s730 + 0x68, j)
					st64(s248, j)
					const p = ld64(c + 8)
					if (p == 0) {
						anchor_error_from(s278, 0xbbd /* anchor::AccountNotEnoughKeys */, q, r, s)
						j = ld64(s278 + 8)
						i = ld64(s278)
						if (i != 2) {
							const ai = ld64(0x300000000 /* heap bump-allocator cursor */)
							const aj = ai != 0 ? sat_sub(ai, 0x14) : 0x300007fec
							if ((i & 1) != 0) {
								if (0x300000008 > aj) {
									raw_vec_handle_error(1, 0x14, 0x10015f8f8, sat_sub(ai, 0x14), 0x14 > ai)
								}
								st64(0x300000000 /* heap bump-allocator cursor */, aj)
								st64(aj + 8, 0x6363615f74666e5f)
								st64(aj, 0x6e6f697469736f70)
								st32(aj + 0x10, 0x746e756f)
								void ld64(j)
							} else {
								if (0x300000008 > aj) {
									raw_vec_handle_error(1, 0x14, 0x10015f8f8, sat_sub(ai, 0x14), 0x14 > ai)
								}
								st64(0x300000000 /* heap bump-allocator cursor */, aj)
								st64(aj + 8, 0x6363615f74666e5f)
								st64(aj, 0x6e6f697469736f70)
								st32(aj + 0x10, 0x746e756f)
								void ld64(j)
							}
							st64(j + 0x10, aj, 0x14)
							st64(j + 8, 0x14)
							st64(j, 1)
							st64(a + 0x10, j)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					} else {
						st64(c + 8, p - 1)
						j = ld64(c)
						st64(c, j + 0x30)
					}
					st64(s730 + 0x60, j)
					fn_11e0(s40, c, q, r, s)
					let vault_0_mint_box: Mint = ld64(s38)
					const t = ld64(s40)
					if (t != 2) {
						j = fn_4130(s288, t, vault_0_mint_box, "pool_state", 0xa)
						vault_0_mint_box = ld64(s288 + 8)
						i = ld64(s288)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					B53: {
						B50: {
							B21: {
								B18: {
									st64(s730 + 0x58, vault_0_mint_box)
									const v = ld64(c + 8)
									if (v == 0) {
										anchor_error_from(s298, 0xbbd /* anchor::AccountNotEnoughKeys */, vault_0_mint_box, x, y)
										vault_0_mint_box = ld64(s298 + 8)
										const ak = ld64(s298)
										if (ak == 2) {
											break B18
										}
										j = fn_4130(s2a8, ak, vault_0_mint_box, 0x10015aff1 /* "protocol_position" */, 0x11)
										vault_0_mint_box = ld64(s2a8 + 8)
										i = ld64(s2a8)
										if (i != 2) {
											st64(a + 0x10, vault_0_mint_box)
											st64(a + 8, i)
											st64(a, 0)
											return j
										}
										w = ld64(c + 8)
										if (w == 0) {
											break B18
										}
									} else {
										vault_0_mint_box = ld64(c)
										st64(c, vault_0_mint_box + 0x30)
										w = v - 1
										st64(c + 8, w)
										if (w == 0) {
											break B18
										}
									}
									st64(s730 + 0x50, vault_0_mint_box)
									vault_0_mint_box = ld64(c)
									st64(c, vault_0_mint_box + 0x30)
									aa = w - 1
									st64(c + 8, aa)
									if (aa == 0) {
										break B50
									}
									break B21
								}
								st64(s730 + 0x50, vault_0_mint_box)
								anchor_error_from(s2b8, 0xbbd /* anchor::AccountNotEnoughKeys */, vault_0_mint_box, x, y)
								vault_0_mint_box = ld64(s2b8 + 8)
								const z = ld64(s2b8)
								if (z == 2) {
									break B50
								}
								j = fn_4130(s2c8, z, vault_0_mint_box, "tick_array_lower", 0x10)
								vault_0_mint_box = ld64(s2c8 + 8)
								i = ld64(s2c8)
								if (i != 2) {
									st64(a + 0x10, vault_0_mint_box)
									st64(a + 8, i)
									st64(a, 0)
									return j
								}
								aa = ld64(c + 8)
								if (aa == 0) {
									break B50
								}
							}
							st64(s730 + 0x48, vault_0_mint_box)
							vault_0_mint_box = ld64(c)
							st64(c, vault_0_mint_box + 0x30)
							ab = aa - 1
							st64(c + 8, ab)
							if (ab == 0) {
								j = anchor_error_from(s698, 0xbbd /* anchor::AccountNotEnoughKeys */, vault_0_mint_box, x, y)
								i = ld64(s698)
								st64(a + 0x10, ld64(s698 + 8))
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
							break B53
						}
						st64(s730 + 0x48, vault_0_mint_box)
						anchor_error_from(s2d8, 0xbbd /* anchor::AccountNotEnoughKeys */, vault_0_mint_box, x, y)
						vault_0_mint_box = undef
						const al = ld64(s2d8)
						if (al == 2) {
							j = anchor_error_from(s698, 0xbbd /* anchor::AccountNotEnoughKeys */, vault_0_mint_box, x, y)
							i = ld64(s698)
							st64(a + 0x10, ld64(s698 + 8))
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
						j = fn_4130(s2e8, al, ld64(s2d8 + 8), "tick_array_upper", 0x10)
						vault_0_mint_box = ld64(s2e8 + 8)
						i = ld64(s2e8)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
						ab = ld64(c + 8)
						if (ab == 0) {
							j = anchor_error_from(s698, 0xbbd /* anchor::AccountNotEnoughKeys */, vault_0_mint_box, x, y)
							i = ld64(s698)
							st64(a + 0x10, ld64(s698 + 8))
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s730 + 0x38, vault_0_mint_box)
					const am: AccountInfo = ld64(c)
					st64(s240, am)
					st64(c + 8, ab - 1)
					st64(s730 + 0x40, am)
					st64(c, am + 0x30)
					fn_7498(s40, c, vault_0_mint_box, x, y)
					vault_0_mint_box = ld64(s38)
					const an = ld64(s40)
					if (an != 2) {
						j = fn_4130(s2f8, an, vault_0_mint_box, "token_account_0", 0xf)
						vault_0_mint_box = ld64(s2f8 + 8)
						i = ld64(s2f8)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s730 + 0x30, vault_0_mint_box)
					fn_7498(s40, c, vault_0_mint_box, ao, ap)
					vault_0_mint_box = ld64(s38)
					const aq = ld64(s40)
					if (aq != 2) {
						j = fn_4130(s308, aq, vault_0_mint_box, "token_account_1", 0xf)
						vault_0_mint_box = ld64(s308 + 8)
						i = ld64(s308)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s730 + 0x28, vault_0_mint_box)
					fn_7498(s40, c, vault_0_mint_box, ar, at)
					vault_0_mint_box = ld64(s38)
					const au = ld64(s40)
					if (au != 2) {
						j = fn_4130(s318, au, vault_0_mint_box, "token_vault_0", 0xd)
						vault_0_mint_box = ld64(s318 + 8)
						i = ld64(s318)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s730 + 0x20, vault_0_mint_box)
					fn_7498(s40, c, vault_0_mint_box, av, aw)
					vault_0_mint_box = ld64(s38)
					const ax = ld64(s40)
					if (ax != 2) {
						j = fn_4130(s328, ax, vault_0_mint_box, "token_vault_1", 0xd)
						vault_0_mint_box = ld64(s328 + 8)
						i = ld64(s328)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s730 + 0x18, vault_0_mint_box)
					try_accounts_17ae0(s40, c, vault_0_mint_box, ay, az)
					const bc = ld64(s38 + 8)
					const bb = ld64(s38)
					const ba = ld64(s40)
					if (ba == 0) {
						j = fn_4130(s688, bb, bc, 0x1001598f8 /* "rent" */, 4)
						i = ld64(s688)
						st64(a + 0x10, ld64(s688 + 8))
						st64(a + 8, i)
						st64(a, 0)
						return j
					}
					st64(s730, ba, bb, bc)
					st64(s738, ld64(s38 + 0x10))
					try_accounts_18870(s40, c, bc)
					vault_0_mint_box = ld64(s38)
					const bd = ld64(s40)
					if (bd != 2) {
						j = fn_4130(s338, bd, vault_0_mint_box, "system_program", 0xe)
						vault_0_mint_box = ld64(s338 + 8)
						i = ld64(s338)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s740, vault_0_mint_box)
					st64(s238, vault_0_mint_box)
					try_accounts_19190(s40, c, vault_0_mint_box, be, bf)
					vault_0_mint_box = ld64(s38)
					const bg = ld64(s40)
					if (bg != 2) {
						j = fn_4130(s348, bg, vault_0_mint_box, 0x10015b020 /* "token_program" */, 0xd)
						vault_0_mint_box = ld64(s348 + 8)
						i = ld64(s348)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s748, vault_0_mint_box)
					try_accounts_18f40(s40, c, vault_0_mint_box, bh, bi)
					vault_0_mint_box = ld64(s38)
					const bj = ld64(s40)
					if (bj != 2) {
						j = fn_4130(s358, bj, vault_0_mint_box, "associated_token_program", 0x18)
						vault_0_mint_box = ld64(s358 + 8)
						i = ld64(s358)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s750, vault_0_mint_box)
					fn_18cf0(s40, c, vault_0_mint_box, bk, bl)
					vault_0_mint_box = ld64(s38)
					const bm = ld64(s40)
					if (bm != 2) {
						j = fn_4130(s368, bm, vault_0_mint_box, "token_program_2022", 0x12)
						vault_0_mint_box = ld64(s368 + 8)
						i = ld64(s368)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s758, vault_0_mint_box)
					fn_7768(s40, c, vault_0_mint_box, bn, bo)
					vault_0_mint_box = ld64(s38)
					const bp = ld64(s40)
					if (bp != 2) {
						j = fn_4130(s378, bp, vault_0_mint_box, "vault_0_mint", 0xc)
						vault_0_mint_box = ld64(s378 + 8)
						i = ld64(s378)
						if (i != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					st64(s760, vault_0_mint_box)
					fn_7768(s40, c, vault_0_mint_box, bq, br)
					let vault_1_mint_box: Mint = ld64(s38)
					const bs = ld64(s40)
					if (bs != 2) {
						j = fn_4130(s388, bs, vault_1_mint_box, "vault_1_mint", 0xc)
						vault_1_mint_box = ld64(s388 + 8)
						i = ld64(s388)
						if (i != 2) {
							st64(a + 0x10, vault_1_mint_box)
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
					}
					rent_get(s40)
					copy(s218, s38, 0x18)
					if (ld64(s40) != 0) {
						j = fn_13e628(s678, s218)
						i = ld64(s678)
						st64(a + 0x10, ld64(s678 + 8))
						st64(a + 8, i)
						st64(a, 0)
						return j
					}
					copyr(s230, s218, 0x18)
					const bu = ld64(ld64(s730 + 0x68) /* key */)
					copyr(s1b8, bu, 0x20)
					st64(s108, 0x100159360, 8, s1b8, 0x20)
					// PDA find_program_address(["position", *bu], program *(ld64(s258)))
					Pubkey_find_program_address(s40, s108, 2, ld64(s258))
					copyr(s200, s40, 0x20)
					const bv = ld8(s20)
					st8(s1d9, bv)
					st8(bw + 2, bv)
					const bx = ld64(ld64(s730 + 0x40))
					copyr(s1d8, bx, 0x20)
					if ((memcmp(s1d8, s200, 0x20) as u32) == 0) {
						st64(s40, s240, s230, s250, s238, s248, s1d9, s258)
						j = fn_a4980(s1b8, s40)
						st64(s730 + 0x40, ld64(s1b8 + 8))
						i = ld64(s1b8)
						if (i == 2) {
							const personal_position: AccountInfo = ld64(ld64(s730 + 0x40))
							if (personal_position.is_writable != 0) {
								st64(s768, s1b8)
								AccountInfo_clone_f338(s1b8, personal_position)
								st64(s770, fn_147a20(ld64(s768)))
								const cc = ld64(ld64(s730 + 0x40))
								st64(s768, s40)
								AccountInfo_clone_f338(s40, cc)
								AccountInfo_try_data_len(s108, ld64(s768))
								const ce = ld64(s108 + 8)
								const cd = ld64(s108)
								if (cd != 0x800000000000001a /* Ok */) {
									st64(s108 + 0x10, ld64(s108 + 0x10))
									st64(s108, cd, ce)
									const ch = fn_13e628(s3e8, s108)
									const cg = ld64(s3e8)
									st64(a + 0x10, ld64(s3e8 + 8))
									st64(a + 8, cg)
									st64(a, 0)
									return ptr_drop_in_place_fcd8(s1b8, ptr_drop_in_place_fcd8(s40, ch))
								}
								const cf = Rent_is_exempt(s230, ld64(s770), ce)
								st64(s768, cf)
								ptr_drop_in_place_fcd8(s1b8, ptr_drop_in_place_fcd8(s40, cf))
								if (ld64(s768) != 0) {
									if (payer.is_writable != 0) {
										if (ld8(ld64(s730 + 0x68) + 0x29 /* is_writable */) != 0) {
											if (ld8(ld64(s730 + 0x60) + 0x29) != 0) {
												if (ld8(ld64(s730 + 0x58) + 0x29 /* is_writable */) != 0) {
													const ci = ld64(ld64(s730 + 0x58) /* key */)
													copyr(s168, ci, 0x20)
													st64(s40, 0x10015a23e)
													st64(s38 + 8, s168)
													st64(s20, s108)
													st32(s108, bswap32(ld64(s730 + 0x80)))
													st64(s38, 0xa)
													st64(s38 + 0x10, 0x20)
													st64(s20 + 8, 4)
													// PDA find_program_address(["tick_array", *ci, u32 bswap32(ld64(s730 + 0x80)) [ix data?]], program *(ld64(s258)))
													Pubkey_find_program_address(s1b8, s40, 3, ld64(s258))
													copyr(s188, s1b8, 0x20)
													st8(bw, ld8(s1b8 + 0x20))
													const cj = ld64(ld64(s730 + 0x48) /* key */)
													copyr(s148, cj, 0x20)
													if ((memcmp(s148, s188, 0x20) as u32) != 0) {
														anchor_error_from(s498, 0x7d6 /* anchor::ConstraintSeeds */)
														const cn = fn_4130(s4a8, ld64(s498), ld64(s498 + 8), "tick_array_lower", 0x10)
														const cm = ld64(s4a8 + 8)
														const cl = ld64(s4a8)
														copyr(s40, s148, 0x20)
														copy(s20, s188, 0x20)
														j = Error_with_pubkeys(s4b8, cl, cm, s40, cn)
														i = ld64(s4b8)
														st64(a + 0x10, ld64(s4b8 + 8))
														st64(a + 8, i)
														st64(a, 0)
														return j
													}
													if (ld8(ld64(s730 + 0x48) + 0x29 /* is_writable */) != 0) {
														copyr(s108, s168, 0x20)
														st64(s20, se4)
														st64(s38 + 8, s108)
														st64(s40, 0x10015a23e)
														st32(se4, bswap32(ld64(s730 + 0x78)))
														st64(s20 + 8, 4)
														st64(s38 + 0x10, 0x20)
														st64(s38, 0xa)
														// PDA find_program_address(["tick_array", *s108, u32 bswap32(ld64(s730 + 0x78)) [ix data?]], program *(ld64(s258)))
														Pubkey_find_program_address(s1b8, s40, 3, ld64(s258))
														copyr(s128, s1b8, 0x20)
														st8(bw + 1, ld8(s1b8 + 0x20))
														const ck = ld64(ld64(s730 + 0x38) /* key */)
														copyr(se0, ck, 0x20)
														if ((memcmp(se0, s128, 0x20) as u32) != 0) {
															anchor_error_from(s4e8, 0x7d6 /* anchor::ConstraintSeeds */)
															const cq = fn_4130(s4f8, ld64(s4e8), ld64(s4e8 + 8), "tick_array_upper", 0x10)
															const cp = ld64(s4f8 + 8)
															const co = ld64(s4f8)
															copyr(s40, se0, 0x20)
															copy(s20, s128, 0x20)
															j = Error_with_pubkeys(s508, co, cp, s40, cq)
															i = ld64(s508)
															st64(a + 0x10, ld64(s508 + 8))
															st64(a + 8, i)
															st64(a, 0)
															return j
														}
														if (ld8(ld64(s730 + 0x38) + 0x29 /* is_writable */) != 0) {
															if (ld8(ld64(ld64(s730 + 0x30) + 0x20) + 0x29) != 0) {
																const token_vault_0_box: TokenAccount = ld64(s730 + 0x20)
																copyr(s40, token_vault_0_box.mint, 0x20)
																if ((memcmp(ld64(s730 + 0x30) + 0x28, s40, 0x20) as u32) != 0) {
																	j = anchor_error_from(s558, 0x7de /* anchor::ConstraintTokenMint */)
																	i = ld64(s558)
																	st64(a + 0x10, ld64(s558 + 8))
																	st64(a + 8, i)
																	st64(a, 0)
																	return j
																}
																if (ld8(ld64(ld64(s730 + 0x28) + 0x20) + 0x29) != 0) {
																	const token_vault_1_box: TokenAccount = ld64(s730 + 0x18)
																	copyr(s40, token_vault_1_box.mint, 0x20)
																	const ct = memcmp(ld64(s730 + 0x28) + 0x28, s40, 0x20)
																	if ((ct as u32) != 0) {
																		j = anchor_error_from(s588, 0x7de /* anchor::ConstraintTokenMint */)
																		i = ld64(s588)
																		st64(a + 0x10, ld64(s588 + 8))
																		st64(a + 8, i)
																		st64(a, 0)
																		return j
																	}
																	const token_vault_0: AccountInfo = ld64(ld64(s730 + 0x20) + 0x20)
																	if (token_vault_0.is_writable != 0) {
																		const cv = token_vault_0.key
																		copyr(s40, cv, 0x20)
																		j = fn_4dc0(s1b8, ld64(s730 + 0x58), ct as u32)
																		let cx = ld64(s1b8 + 0x10)
																		let cw = ld64(s1b8 + 8)
																		if (ld64(s1b8) != 0) {
																			st64(a + 0x10, cx)
																			st64(a + 8, cw)
																			st64(a, 0)
																			return j
																		}
																		const cy = memcmp(s40, cw + 0x81, 0x20)
																		st64(cx, ld64(cx) - 1)
																		if ((cy as u32) == 0) {
																			const token_vault_1: AccountInfo = ld64(ld64(s730 + 0x18) + 0x20)
																			if (token_vault_1.is_writable != 0) {
																				const da = token_vault_1.key
																				copyr(s40, da, 0x20)
																				j = fn_4dc0(s1b8, ld64(s730 + 0x58), cy as u32)
																				cx = ld64(s1b8 + 0x10)
																				cw = ld64(s1b8 + 8)
																				if (ld64(s1b8) != 0) {
																					st64(a + 0x10, cx)
																					st64(a + 8, cw)
																					st64(a, 0)
																					return j
																				}
																				const db = memcmp(s40, cw + 0xa1, 0x20)
																				st64(cx, ld64(cx) - 1)
																				if ((db as u32) == 0) {
																					const token_vault_0_box_2: TokenAccount = ld64(s730 + 0x20)
																					const dd = ld64(ld64(ld64(s760) + 0x58))
																					copyr(sc0, dd, 0x20)
																					copy(sa0, token_vault_0_box_2.mint, 0x20)
																					if ((memcmp(sc0, sa0, 0x20) as u32) != 0) {
																						anchor_error_from(s618, 0x7dc /* anchor::ConstraintAddress */)
																						const dl = fn_4130(s628, ld64(s618), ld64(s618 + 8), "vault_0_mint", 0xc)
																						const dk = ld64(s628 + 8)
																						const dj = ld64(s628)
																						copy(s40, sc0, 0x40)
																						j = Error_with_pubkeys(s638, dj, dk, s40, dl)
																						i = ld64(s638)
																						st64(a + 0x10, ld64(s638 + 8))
																						st64(a + 8, i)
																						st64(a, 0)
																						return j
																					}
																					const token_vault_1_box_2: TokenAccount = ld64(s730 + 0x18)
																					const df = vault_1_mint_box.info.key
																					copyr(s80, df, 0x20)
																					copy(s60, token_vault_1_box_2.mint, 0x20)
																					j = memcmp(s80, s60, 0x20) as u32
																					if (j == 0) {
																						st64(a + 0xb0, vault_1_mint_box)
																						st64(a + 0xa8, ld64(s760))
																						st64(a + 0xa0, ld64(s758))
																						st64(a + 0x98, ld64(s750))
																						st64(a + 0x90, ld64(s748))
																						st64(a + 0x88, ld64(s740))
																						st64(a + 0x80, ld64(s738))
																						st64(a + 0x78, ld64(s730 + 0x10))
																						st64(a + 0x70, ld64(s730 + 8))
																						st64(a + 0x68, ld64(s730))
																						st64(a + 0x60, ld64(s730 + 0x18))
																						st64(a + 0x58, ld64(s730 + 0x20))
																						st64(a + 0x50, ld64(s730 + 0x28))
																						st64(a + 0x48, ld64(s730 + 0x30))
																						st64(a + 0x40, ld64(s730 + 0x40))
																						st64(a + 0x38, ld64(s730 + 0x38))
																						st64(a + 0x30, ld64(s730 + 0x48))
																						st64(a + 0x28, ld64(s730 + 0x50))
																						st64(a + 0x20, ld64(s730 + 0x58))
																						st64(a + 0x18, ld64(s730 + 0x60))
																						st64(a + 0x10, ld64(s730 + 0x68))
																						st64(a + 8, ld64(s730 + 0x70))
																						st64(a, payer)
																						return j
																					}
																					anchor_error_from(s648, 0x7dc /* anchor::ConstraintAddress */)
																					const di = fn_4130(s658, ld64(s648), ld64(s648 + 8), "vault_1_mint", 0xc)
																					const dh = ld64(s658 + 8)
																					const dg = ld64(s658)
																					copy(s40, s80, 0x40)
																					j = Error_with_pubkeys(s668, dg, dh, s40, di)
																					i = ld64(s668)
																					st64(a + 0x10, ld64(s668 + 8))
																					st64(a + 8, i)
																					st64(a, 0)
																					return j
																				}
																				anchor_error_from(s5f8, 0x7d3 /* anchor::ConstraintRaw */)
																				j = fn_4130(s608, ld64(s5f8), ld64(s5f8 + 8), "token_vault_1", 0xd)
																				i = ld64(s608)
																				st64(a + 0x10, ld64(s608 + 8))
																				st64(a + 8, i)
																				st64(a, 0)
																				return j
																			}
																			anchor_error_from(s5d8, 0x7d0 /* anchor::ConstraintMut */)
																			j = fn_4130(s5e8, ld64(s5d8), ld64(s5d8 + 8), "token_vault_1", 0xd)
																			i = ld64(s5e8)
																			st64(a + 0x10, ld64(s5e8 + 8))
																			st64(a + 8, i)
																			st64(a, 0)
																			return j
																		}
																		anchor_error_from(s5b8, 0x7d3 /* anchor::ConstraintRaw */)
																		j = fn_4130(s5c8, ld64(s5b8), ld64(s5b8 + 8), "token_vault_0", 0xd)
																		i = ld64(s5c8)
																		st64(a + 0x10, ld64(s5c8 + 8))
																		st64(a + 8, i)
																		st64(a, 0)
																		return j
																	}
																	anchor_error_from(s598, 0x7d0 /* anchor::ConstraintMut */)
																	j = fn_4130(s5a8, ld64(s598), ld64(s598 + 8), "token_vault_0", 0xd)
																	i = ld64(s5a8)
																	st64(a + 0x10, ld64(s5a8 + 8))
																	st64(a + 8, i)
																	st64(a, 0)
																	return j
																}
																anchor_error_from(s568, 0x7d0 /* anchor::ConstraintMut */)
																j = fn_4130(s578, ld64(s568), ld64(s568 + 8), "token_account_1", 0xf)
																i = ld64(s578)
																st64(a + 0x10, ld64(s578 + 8))
																st64(a + 8, i)
																st64(a, 0)
																return j
															}
															anchor_error_from(s538, 0x7d0 /* anchor::ConstraintMut */)
															j = fn_4130(s548, ld64(s538), ld64(s538 + 8), "token_account_0", 0xf)
															i = ld64(s548)
															st64(a + 0x10, ld64(s548 + 8))
															st64(a + 8, i)
															st64(a, 0)
															return j
														}
														anchor_error_from(s518, 0x7d0 /* anchor::ConstraintMut */)
														j = fn_4130(s528, ld64(s518), ld64(s518 + 8), "tick_array_upper", 0x10)
														i = ld64(s528)
														st64(a + 0x10, ld64(s528 + 8))
														st64(a + 8, i)
														st64(a, 0)
														return j
													}
													anchor_error_from(s4c8, 0x7d0 /* anchor::ConstraintMut */)
													j = fn_4130(s4d8, ld64(s4c8), ld64(s4c8 + 8), "tick_array_lower", 0x10)
													i = ld64(s4d8)
													st64(a + 0x10, ld64(s4d8 + 8))
													st64(a + 8, i)
													st64(a, 0)
													return j
												}
												anchor_error_from(s478, 0x7d0 /* anchor::ConstraintMut */)
												j = fn_4130(s488, ld64(s478), ld64(s478 + 8), "pool_state", 0xa)
												i = ld64(s488)
												st64(a + 0x10, ld64(s488 + 8))
												st64(a + 8, i)
												st64(a, 0)
												return j
											}
											anchor_error_from(s458, 0x7d0 /* anchor::ConstraintMut */)
											j = fn_4130(s468, ld64(s458), ld64(s458 + 8), "position_nft_account", 0x14)
											i = ld64(s468)
											st64(a + 0x10, ld64(s468 + 8))
											st64(a + 8, i)
											st64(a, 0)
											return j
										}
										anchor_error_from(s438, 0x7d0 /* anchor::ConstraintMut */)
										j = fn_4130(s448, ld64(s438), ld64(s438 + 8), "position_nft_mint", 0x11)
										i = ld64(s448)
										st64(a + 0x10, ld64(s448 + 8))
										st64(a + 8, i)
										st64(a, 0)
										return j
									}
									anchor_error_from(s418, 0x7d0 /* anchor::ConstraintMut */)
									j = fn_4130(s428, ld64(s418), ld64(s418 + 8), "payer", 5)
									i = ld64(s428)
									st64(a + 0x10, ld64(s428 + 8))
									st64(a + 8, i)
									st64(a, 0)
									return j
								}
								anchor_error_from(s3f8, 0x7d5 /* anchor::ConstraintRentExempt */)
								j = fn_4130(s408, ld64(s3f8), ld64(s3f8 + 8), 0x10015b06a /* "personal_position" */, 0x11)
								i = ld64(s408)
								st64(a + 0x10, ld64(s408 + 8))
								st64(a + 8, i)
								st64(a, 0)
								return j
							}
							anchor_error_from(s3c8, 0x7d0 /* anchor::ConstraintMut */)
							j = fn_4130(s3d8, ld64(s3c8), ld64(s3c8 + 8), 0x10015b06a /* "personal_position" */, 0x11)
							i = ld64(s3d8)
							st64(a + 0x10, ld64(s3d8 + 8))
							st64(a + 8, i)
							st64(a, 0)
							return j
						}
						st64(a + 0x10, ld64(s730 + 0x40))
						st64(a + 8, i)
						st64(a, 0)
						return j
					}
					anchor_error_from(s398, 0x7d6 /* anchor::ConstraintSeeds */)
					const ca = fn_4130(s3a8, ld64(s398), ld64(s398 + 8), 0x10015b06a /* "personal_position" */, 0x11)
					const bz = ld64(s3a8 + 8)
					const by = ld64(s3a8)
					copyr(s40, s1d8, 0x20)
					copy(s20, s200, 0x20)
					j = Error_with_pubkeys(s3b8, by, bz, s40, ca)
					i = ld64(s3b8)
					st64(a + 0x10, ld64(s3b8 + 8))
					st64(a + 8, i)
					st64(a, 0)
					return j
				}
				const ae = ld64(0x300000000 /* heap bump-allocator cursor */)
				const af = ae != 0 ? sat_sub(ae, 0x11) : 0x300007fef
				if ((i & 1) != 0) {
					if (0x300000008 > af) {
						raw_vec_handle_error(1, 0x11, 0x10015f8f8, sat_sub(ae, 0x11), 0x11 > ae)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, af)
					st64(af + 8, 0x6e696d5f74666e5f)
					st64(af, 0x6e6f697469736f70)
					st8(af + 0x10, 0x74)
					void ld64(j)
				} else {
					if (0x300000008 > af) {
						raw_vec_handle_error(1, 0x11, 0x10015f8f8, sat_sub(ae, 0x11), 0x11 > ae)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, af)
					st64(af + 8, 0x6e696d5f74666e5f)
					st64(af, 0x6e6f697469736f70)
					st8(af + 0x10, 0x74)
					void ld64(j)
				}
				st64(j + 0x10, af, 0x11)
				st64(j + 8, 0x11)
				st64(j, 1)
				st64(a + 0x10, j)
				st64(a + 8, i)
				st64(a, 0)
				return j
			}
			const ac = ld64(0x300000000 /* heap bump-allocator cursor */)
			const ad = ac != 0 ? sat_sub(ac, 5) : 0x300007ffb
			if ((i & 1) != 0) {
				if (0x300000008 > ad) {
					raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(ac, 5), 5 > ac)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ad)
				st8(ad + 4, 0x72)
				st32(ad, 0x65796170)
				void payer.key
			} else {
				if (0x300000008 > ad) {
					raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(ac, 5), 5 > ac)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ad)
				st8(ad + 4, 0x72)
				st32(ad, 0x65796170)
				void payer.key
			}
			st64(payer + 0x10, ad, 5)
			st64(payer + 8, 5)
			st64(payer, 1)
			st64(a + 0x10, payer)
			st64(a + 8, i)
			st64(a, 0)
			return j
		}
	}
	const g = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (g & 3) - 2) {
		j = anchor_error_from(s6a8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s6a8)
		st64(a + 0x10, ld64(s6a8 + 8))
		st64(a + 8, i)
		st64(a, 0)
		return j
	}
	if ((g & 3) == 0) {
		j = anchor_error_from(s6a8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s6a8)
		st64(a + 0x10, ld64(s6a8 + 8))
		st64(a + 8, i)
		st64(a, 0)
		return j
	}
	const h = ld64(ld64(g + 7))
	if (h == 0) {
		j = anchor_error_from(s6a8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(s6a8)
		st64(a + 0x10, ld64(s6a8 + 8))
		st64(a + 8, i)
		st64(a, 0)
		return j
	}
	callx(h, ld64(g - 1), h)
	j = anchor_error_from(s6a8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	i = ld64(s6a8)
	st64(a + 0x10, ld64(s6a8 + 8))
	st64(a + 8, i)
	st64(a, 0)
	return j
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: AccountInfo, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value), p7 (value), p8 (value), p9 (value), p10 (value)
// types [heur]: b: OpenPositionWithToken22NftContext (the handler ix_open_position_with_token22_nft passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_26d98(a: u64, b: OpenPositionWithToken22NftContext, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s80 = fp - 0x80, s98 = fp - 0x98, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc0 = fp - 0xc0, se8 = fp - 0xe8, sf0 = fp - 0xf0, s118 = fp - 0x118, s120 = fp - 0x120, s148 = fp - 0x148, s150 = fp - 0x150, s178 = fp - 0x178, s180 = fp - 0x180, s1a8 = fp - 0x1a8, s1b0 = fp - 0x1b0, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s200 = fp - 0x200, s208 = fp - 0x208, s210 = fp - 0x210, s218 = fp - 0x218, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, sf88 = fp - 0xf88, sff0 = fp - 0xff0, s1000 = fp - 0x1000
	let i, j: u64
	let g = a
	const accounts: OpenPositionWithToken22NftAccounts = b.accounts
	if (ld8(accounts.token_account_0 + 0x94) != 2 && ld8(accounts.token_account_1 + 0x94) != 2) {
		const pool_state: AccountInfo = accounts.pool_state
		const l: LamportsCell = pool_state.lamports
		let fe = l
		const er = p12
		const fa = p11
		const es = p10
		const et = p9
		const eu = p8
		const ev = p7
		const ew = p6
		const ex = p5
		const m = ld64(accounts + 0x10)
		const s = pool_state.key
		rc_inc(l)
		let ez = m
		const n: DataCell = pool_state.data
		let fd = n
		rc_inc(n)
		const fb = g
		const r = pool_state.owner
		const q = pool_state.rent_epoch
		const p = pool_state.is_signer
		const o = pool_state.is_writable
		st8(s50 + 2, pool_state.executable)
		st8(s50, p, o)
		st64(s78, s, l, n, r, q)
		const t: AccountInfo = ld64(ld64(accounts + 0x40))
		const u: LamportsCell = t.lamports
		const aa = t.key
		rc_inc(u)
		const v: DataCell = t.data
		rc_inc(v)
		const z = t.owner
		const y = t.rent_epoch
		const x = t.is_signer
		let fc = v
		const w = t.is_writable
		st8(s20 + 2, t.executable)
		st8(s20, x, w)
		st64(s48, aa, u, v, z, y)
		const pool_state_2: AccountInfo = accounts.pool_state
		const ac: LamportsCell = pool_state_2.lamports
		const ai = pool_state_2.key
		rc_inc(ac)
		const ad: DataCell = pool_state_2.data
		rc_inc(ad)
		let ey = u
		const ah = pool_state_2.owner
		const ag = pool_state_2.rent_epoch
		const af = pool_state_2.is_signer
		const ae = pool_state_2.is_writable
		st8(s1f8 + 2, pool_state_2.executable)
		st8(s1f8, af, ae)
		st64(s220, ai, ac, ad, ah, ag)
		st64(s1000, s48, s220, accounts + 0x88, accounts + 0xa0, fa)
		j = fn_7ea90(s230, accounts, ez, s78, s48, s220, accounts + 0x88, accounts + 0xa0, fa)
		i = ld64(s230 + 8)
		let h = ld64(s230)
		if (rc_release(ac)) {
			j = Rc_drop_slow_14df0(s218, j)
		}
		if (rc_release(ad)) {
			j = Rc_drop_slow_14df0(s210, j)
		}
		g = fb
		if (rc_release(ey)) {
			j = Rc_drop_slow_14df0(s40, j)
		}
		if (rc_release(fc)) {
			j = Rc_drop_slow_14df0(s38, j)
		}
		if (rc_release(fe)) {
			j = Rc_drop_slow_14df0(s70, j)
		}
		if (rc_release(fd)) {
			j = Rc_drop_slow_14df0(s68, j)
		}
		if (h == 2) {
			const aj: AccountInfo = ld64(accounts + 0x98)
			const ak: LamportsCell = aj.lamports
			const am = aj.key
			rc_inc(ak)
			const al: DataCell = aj.data
			rc_inc(al)
			fc = am
			const payer: AccountInfo = accounts.payer
			const ao: LamportsCell = payer.lamports
			let en = aj.executable
			let eo = aj.is_writable
			let ep = aj.is_signer
			let eq = aj.rent_epoch
			const av = aj.owner
			let em = payer.key
			rc_inc(ao)
			const ap: DataCell = payer.data
			let el = ap
			rc_inc(ap)
			const aq: AccountInfo = ld64(accounts + 0x18)
			const ar: LamportsCell = aq.lamports
			fe = ar
			let eg = payer.executable
			let eh = payer.is_writable
			let ei = payer.is_signer
			let ej = payer.rent_epoch
			let ek = payer.owner
			const au = aq.key
			rc_inc(ar)
			const at: DataCell = aq.data
			ez = au
			let ef = at
			rc_inc(at)
			ey = av
			const aw: AccountInfo = ld64(accounts + 8)
			const ax: LamportsCell = aw.lamports
			fd = ax
			const ea = aq.executable
			const eb = aq.is_writable
			const ec = aq.is_signer
			const ed = aq.rent_epoch
			const ee = aq.owner
			const bg = aw.key
			rc_inc(ax)
			const ay: DataCell = aw.data
			rc_inc(ay)
			const az: AccountInfo = ld64(accounts + 0x10)
			const ba: LamportsCell = az.lamports
			const dv = aw.executable
			const dw = aw.is_writable
			const dx = aw.is_signer
			const dy = aw.rent_epoch
			const dz = aw.owner
			const du = az.key
			rc_inc(ba)
			const bb: DataCell = az.data
			rc_inc(bb)
			const bc: AccountInfo = ld64(accounts + 0x88)
			const bd: LamportsCell = bc.lamports
			const dq = az.executable
			const dr = az.is_writable
			const ds = az.is_signer
			const dt = az.rent_epoch
			const bf = az.owner
			const dp = bc.key
			rc_inc(bd)
			const be: DataCell = bc.data
			rc_inc(be)
			const bh: AccountInfo = ld64(accounts + 0xa0)
			const bi: LamportsCell = bh.lamports
			const dj = bc.executable
			const dk = bc.is_writable
			const dl = bc.is_signer
			const dm = bc.rent_epoch
			const dn = bc.owner
			const bo = bh.key
			rc_inc(bi)
			const bj: DataCell = bh.data
			rc_inc(bj)
			const bn = bh.owner
			const bm = bh.rent_epoch
			const bl = bh.is_signer
			const bk = bh.is_writable
			st8(sc0 + 2, bh.executable)
			st8(sc0, bl, bk)
			st64(se8, bo, bi, bj, bn, bm)
			st8(sf0, dl, dk, dj)
			st64(s118, dp, bd, be, dn, dm)
			st8(s120, ds, dr, dq)
			st64(s148, du, ba, bb, bf, dt)
			st8(s150, dx, dw, dv)
			st64(s178, bg, fd, ay, dz, dy)
			st8(s180, ec, eb, ea)
			st64(s1a8, ez, fe, ef, ee, ed)
			st8(s1b0, ei, eh, eg)
			st64(s1d8, em, ao, el, ek, ej)
			st8(s1e0, ep, eo, en)
			st64(s208, fc, ak, al, ey, eq)
			st64(sb8, 8, 0)
			st64(s220, 0, 8, 0)
			j = associated_token_create(s240, s220)
			i = ld64(s240 + 8)
			h = ld64(s240)
			g = fb
			if (h != 2) {
				st64(g, h, i)
				return j
			}
			const bp: AccountInfo = accounts.token_account_0.info
			const bq: LamportsCell = bp.lamports
			const bs = ld64(accounts + 0x18)
			const ca = ld64(accounts + 0x10)
			const bx = bp.key
			rc_inc(bq)
			const br: DataCell = bp.data
			fc = bs
			rc_inc(br)
			const bw = bp.owner
			const bv = bp.rent_epoch
			const bu = bp.is_signer
			const bt = bp.is_writable
			st8(s80 + 2, bp.executable)
			st8(s80, bu, bt)
			st64(s98, br, bw, bv)
			fe = bq
			st64(sa8, bx, bq)
			const by: AccountInfo = accounts.token_account_1.info
			const bz: LamportsCell = by.lamports
			ez = ca
			const cg = by.key
			rc_inc(bz)
			const cb: DataCell = by.data
			rc_inc(cb)
			const cf = by.owner
			const ce = by.rent_epoch
			const cd = by.is_signer
			const cc = by.is_writable
			st8(s50 + 2, by.executable)
			st8(s50, cd, cc)
			st64(s78, cg, bz, cb, cf, ce)
			const ch: AccountInfo = accounts.token_vault_0.info
			const ci: LamportsCell = ch.lamports
			const co = ch.key
			rc_inc(ci)
			const cj: DataCell = ch.data
			fd = ci
			ey = cb
			rc_inc(cj)
			const cn = ch.owner
			const cm = ch.rent_epoch
			const cl = ch.is_signer
			const ck = ch.is_writable
			st8(s20 + 2, ch.executable)
			st8(s20, cl, ck)
			st64(s48, co, fd, cj, cn, cm)
			const cp: AccountInfo = accounts.token_vault_1.info
			const cq: LamportsCell = cp.lamports
			const cw = cp.key
			rc_inc(cq)
			const cr: DataCell = cp.data
			eq = cj
			rc_inc(cr)
			const cv = cp.owner
			const cu = cp.rent_epoch
			const ct = cp.is_signer
			const cs = cp.is_writable
			st8(s1f8 + 2, cp.executable)
			st8(s1f8, ct, cs)
			st64(s220, cw, cq, cr, cv, cu)
			const cx = ld64(0x300000000 /* heap bump-allocator cursor */)
			eo = bz
			const cy = cx != 0 ? sat_sub(cx, 0x80) & -8 : 0x300007f80
			em = cr
			en = cq
			ep = br
			if (cy > 0x300000007) {
				const vault_0_mint: Mint = accounts.vault_0_mint
				st64(0x300000000 /* heap bump-allocator cursor */, cy)
				const da: AccountInfo = vault_0_mint.info
				memcpy(cy, vault_0_mint, 0x58)
				st64(cy + 0x58, da)
				st64(cy + 0x78, ld64(vault_0_mint[1].mint_authority + 0x14))
				st64(cy + 0x70, ld64(vault_0_mint[1].mint_authority + 0xc))
				st64(cy + 0x68, ld64(vault_0_mint[1].mint_authority + 4))
				st64(cy + 0x60, ld64(vault_0_mint + 0x60))
				const db = ld64(0x300000000 /* heap bump-allocator cursor */)
				const dc = db != 0 ? sat_sub(db, 0x80) & -8 : 0x300007f80
				if (dc > 0x300000007) {
					ek = accounts + 0x40
					el = accounts + 8
					ej = accounts + 0x38
					ei = accounts + 0x30
					eg = accounts + 0x90
					eh = accounts + 0x68
					const vault_1_mint: Mint = accounts.vault_1_mint
					st64(0x300000000 /* heap bump-allocator cursor */, dc)
					ef = vault_1_mint.info
					const dh = memcpy(dc, vault_1_mint, 0x58)
					st64(dc + 0x58, ef)
					copy(dc + 0x60, vault_1_mint + 0x60, 0x20)
					const remaining_accounts: AccountInfo = b.remaining_accounts
					const df = b.remaining_accounts_len
					const de = ld8(b + 0x22)
					st64(sf88, accounts + 0xa0, cy, dc, remaining_accounts, df, de, c, d, ex, ew, ev, eu, et, es, fa, er)
					st64(sff0, accounts + 0x20, ei, ej, ek, sa8, s78, s48, s220, eh, accounts + 0x88, eg)
					st64(s1000, fc)
					st64(sf88 + 0x80, 1)
					st64(sff0 + 0x60, 0)
					st64(s1000 + 8, 0)
					j = fn_1c850(s250, accounts, el, ez, fp, dh)
					i = ld64(s250 + 8)
					h = ld64(s250)
					if (rc_release(en)) {
						j = Rc_drop_slow_14df0(s218, j)
					}
					g = fb
					const di = fe
					if (rc_release(em)) {
						j = Rc_drop_slow_14df0(s210, j)
					}
					if (rc_release(fd)) {
						j = Rc_drop_slow_14df0(s40, j)
					}
					if (rc_release(eq)) {
						j = Rc_drop_slow_14df0(s38, j)
					}
					if (rc_release(eo)) {
						j = Rc_drop_slow_14df0(s70, j)
					}
					if (rc_release(ey)) {
						j = Rc_drop_slow_14df0(s68, j)
					}
					if (rc_release(di)) {
						j = Rc_drop_slow_14df0(sa0, j)
					}
					if (!rc_release(ep)) {
						st64(g, h, i)
						return j
					}
					j = Rc_drop_slow_14df0(s98, j)
					st64(g, h, i)
					return j
				}
				alloc_handle_alloc_error(8, 0x80)
			}
			alloc_handle_alloc_error(8, 0x80)
		}
		st64(g, h, i)
		return j
	}
	fn_85138(sa8, 0x10015982c)
	st64(s78, 0, 1, 0)
	st64(s28, s78, 0x10015f818)
	st8(s20 + 0x10, 3)
	st64(s20 + 8, 0x20)
	st64(s38, 0)
	st64(s48, 0)
	if (fn_88558(0x10015982c, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(s1e8, s78, 0x18)
	copy(s200, sa8, 0x18)
	st64(s218, 0x100159e23)
	st32(s1a8 + 0x20, 0x1770 /* error::NotApproved */)
	st8(s1d8 + 8, 2)
	st32(s208, 0x92)
	st64(s210, 0x3f)
	st64(s220, 0)
	j = fn_13e5a0(s260, s220)
	i = ld64(s260 + 8)
	st64(g, ld64(s260))
	st64(g + 8, i)
	return j
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_vault_1
function fn_a6478(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88
	let i, p, q, ad: u64
	let l = fn_a80(s28, ld64(b + 0x20), c)
	let f = ld64(s28)
	if (f == 2) {
		l = fn_b4e0(s38, ld64(b + 0x40), 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
		f = ld64(s38)
		if (f == 2) {
			B46: {
				const m = ld64(b + 0x48)
				const n = ld64(m + 0x20)
				if ((memcmp(m, c, 0x20) as u32) == 0 && (common_is_closed(n) == 0 && ld64(ld64(n + 0x10) + 0x10) != 0)) {
					st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
					l = fn_13e628(s48, s18)
					f = ld64(s48)
					if (f != 2) {
						const o = ld64(0x300000000 /* heap bump-allocator cursor */)
						p = 0xf > o
						q = o != 0 ? p != 0 ? 0 : o - 0xf : 0x300007ff1
						i = ld64(s48 + 8)
						if ((f & 1) != 0) {
							if (0x300000008 > q) {
								raw_vec_handle_error(1, 0xf, 0x10015f8f8, p, ad)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, q)
							st64(q + 7, 0x305f746e756f6363)
							st64(q, 0x63615f6e656b6f74)
							void ld64(i)
							break B46
						}
						if (0x300000008 > q) {
							raw_vec_handle_error(1, 0xf, 0x10015f8f8, p, ad)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, q)
						st64(q + 7, 0x305f746e756f6363)
						st64(q, 0x63615f6e656b6f74)
						void ld64(i)
						break B46
					}
				}
				const r = ld64(b + 0x50)
				const s = ld64(r + 0x20)
				if ((memcmp(r, c, 0x20) as u32) == 0 && (common_is_closed(s) == 0 && ld64(ld64(s + 0x10) + 0x10) != 0)) {
					st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
					l = fn_13e628(s58, s18)
					f = ld64(s58)
					if (f != 2) {
						const t = ld64(0x300000000 /* heap bump-allocator cursor */)
						p = 0xf > t
						q = t != 0 ? p != 0 ? 0 : t - 0xf : 0x300007ff1
						i = ld64(s58 + 8)
						if ((f & 1) != 0) {
							if (0x300000008 > q) {
								raw_vec_handle_error(1, 0xf, 0x10015f8f8, p, ad)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, q)
							st64(q + 7, 0x315f746e756f6363)
							st64(q, 0x63615f6e656b6f74)
							void ld64(i)
							break B46
						}
						if (0x300000008 > q) {
							raw_vec_handle_error(1, 0xf, 0x10015f8f8, p, ad)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, q)
						st64(q + 7, 0x315f746e756f6363)
						st64(q, 0x63615f6e656b6f74)
						void ld64(i)
						break B46
					}
				}
				const u = ld64(b + 0x58)
				const v = ld64(u + 0x20)
				if ((memcmp(u, c, 0x20) as u32) == 0 && (common_is_closed(v) == 0 && ld64(ld64(v + 0x10) + 0x10) != 0)) {
					st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
					l = fn_13e628(s68, s18)
					f = ld64(s68)
					if (f != 2) {
						const w = ld64(0x300000000 /* heap bump-allocator cursor */)
						const x = w != 0 ? sat_sub(w, 0xd) : 0x300007ff3
						i = ld64(s68 + 8)
						if ((f & 1) != 0) {
							if (0x300000008 > x) {
								raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0xd > w)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, x)
							st64(x + 5, 0x305f746c7561765f)
							st64(x, 0x61765f6e656b6f74)
							void ld64(i)
						} else {
							if (0x300000008 > x) {
								raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0xd > w)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, x)
							st64(x + 5, 0x305f746c7561765f)
							st64(x, 0x61765f6e656b6f74)
							void ld64(i)
						}
						st64(i + 0x10, x, 0xd)
						st64(i + 8, 0xd)
						st64(i, 1)
						st64(a + 8, i)
						st64(a, f)
						return l
					}
				}
				const y = ld64(b + 0x60)
				const aa = ld64(y + 0x20)
				const z = memcmp(y, c, 0x20)
				i = undef
				l = z as u32
				if (l != 0) {
					st64(a + 8, i)
					st64(a, 2)
					return l
				}
				l = common_is_closed(aa)
				i = undef
				if (l != 0) {
					st64(a + 8, i)
					st64(a, 2)
					return l
				}
				i = ld64(aa + 0x10)
				if (ld64(i + 0x10) == 0) {
					st64(a + 8, i)
					st64(a, 2)
					return l
				}
				st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
				l = fn_13e628(s78, s18)
				i = undef
				const ab = ld64(s78)
				if (ab == 2) {
					st64(a + 8, i)
					st64(a, 2)
					return l
				}
				l = fn_4130(s88, ab, ld64(s78 + 8), "token_vault_1", 0xd)
				i = undef
				const ac = ld64(s88)
				if (ac == 2) {
					st64(a + 8, i)
					st64(a, 2)
					return l
				}
				st64(a + 8, ld64(s88 + 8))
				st64(a, ac)
				return l
			}
			st64(i + 0x10, q, 0xf)
			st64(i + 8, 0xf)
			st64(i, 1)
			st64(a + 8, i)
			st64(a, f)
			return l
		}
		const j = ld64(0x300000000 /* heap bump-allocator cursor */)
		const k = j != 0 ? sat_sub(j, 0x11) : 0x300007fef
		i = ld64(s38 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > k) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x11 > j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, k)
			st64(k + 8, 0x6f697469736f705f)
			st64(k, 0x6c616e6f73726570)
			st8(k + 0x10, 0x6e)
			void ld64(i)
		} else {
			if (0x300000008 > k) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x11 > j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, k)
			st64(k + 8, 0x6f697469736f705f)
			st64(k, 0x6c616e6f73726570)
			st8(k + 0x10, 0x6e)
			void ld64(i)
		}
		st64(i + 0x10, k, 0x11)
		st64(i + 8, 0x11)
		st64(i, 1)
		st64(a + 8, i)
		st64(a, f)
		return l
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0xa) : 0x300007ff6
	i = ld64(s28 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x6174735f6c6f6f70)
		st16(h + 8, 0x6574)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x6174735f6c6f6f70)
		st16(h + 8, 0x6574)
		void ld64(i)
	}
	st64(i + 0x10, h, 0xa)
	st64(i + 8, 0xa)
	st64(i, 1)
	st64(a + 8, i)
	st64(a, f)
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

function fn_154c88(a: u64, b: u64): u64 {
	return imp__fmt_154cb0(ld8(a), 1, b)
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

function fn_a4980(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s168 = fp - 0x168, s169 = fp - 0x169, s190 = fp - 0x190, s191 = fp - 0x191, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s228 = fp - 0x228, s230 = fp - 0x230, s250 = fp - 0x250, s270 = fp - 0x270, s288 = fp - 0x288, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8, s2c8 = fp - 0x2c8, s300 = fp - 0x300, s310 = fp - 0x310, s330 = fp - 0x330, s338 = fp - 0x338, s33f = fp - 0x33f, s348 = fp - 0x348, s360 = fp - 0x360, s368 = fp - 0x368, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s428 = fp - 0x428, s430 = fp - 0x430, s438 = fp - 0x438, s440 = fp - 0x440, s448 = fp - 0x448, s450 = fp - 0x450, s458 = fp - 0x458, s460 = fp - 0x460, s468 = fp - 0x468, s470 = fp - 0x470, s478 = fp - 0x478, s480 = fp - 0x480, s488 = fp - 0x488
	let af, cq, cr, cs: u64
	const f: AccountInfo = ld64(ld64(b))
	const g = fn_147a20(f, b, c, d, e)
	st64(s428 + 0x40, a)
	if (g != 0) {
		const j = ld64(b + 0x10)
		const k = ld64(ld64(j))
		copyr(s2c8, k, 0x20)
		const l = f.key
		copy(s2a0, l + 8, 0x18)
		st64(s2a8, ld64(l))
		if ((memcmp(s2c8, s2a8, 0x20) as u32) == 0) {
			ErrorCode_name(s288, 0x100159890)
			st64(s190, 0, 1, 0)
			st64(s28, s190, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100159890, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(s348, s190, 0x18)
			copy(s360, s288, 0x18)
			st64(s380 + 8, 0x100159e23)
			st32(s300 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s330, 2)
			st32(s368, 0xa)
			st64(s380 + 0x10, 0x3f)
			st64(s380, 0)
			const ai = fn_13e5a0(s3c0, s380)
			const ah = ld64(s3c0 + 8)
			const ag = ld64(s3c0)
			copy(s380, s2c8, 0x40)
			cs = Error_with_pubkeys(s3d0, ag, ah, s380, ai)
			const ak = ld64(s3d0)
			const aj = ld64(s428 + 0x40)
			st64(aj + 8, ld64(s3d0 + 8))
			st64(aj, ak)
			return cs
		}
		st64(s428 + 0x38, b)
		const m = max(fn_1476d8(ld64(b + 8), 0x119), 1)
		if (m > g) {
			const n: AccountInfo = ld64(j)
			const o: LamportsCell = n.lamports
			const ap = n.key
			rc_inc(o)
			const al: DataCell = n.data
			rc_inc(al)
			const am: LamportsCell = f.lamports
			st64(s428 + 0x30, am)
			const an = am.strong
			st64(s428, f.key)
			st64(s428 + 8, n.executable)
			st64(s428 + 0x10, n.is_writable)
			st64(s428 + 0x18, n.is_signer)
			st64(s428 + 0x20, n.rent_epoch)
			st64(s428 + 0x28, n.owner)
			rc_inc(ld64(s428 + 0x30), an)
			const ao: DataCell = f.data
			const aq = ld64(s428 + 0x38)
			rc_inc(ao)
			st64(s440, al, ap)
			const ar: AccountInfo = ld64(ld64(aq + 0x18))
			const at: LamportsCell = ar.lamports
			const au = at.strong
			st64(s430, o)
			st64(s468, f.executable)
			st64(s460, f.is_writable)
			st64(s458, f.is_signer)
			st64(s450, f.rent_epoch)
			const ax = f.owner
			st64(s448, ar.key)
			rc_inc(at, au)
			st64(s478, ao)
			const av: DataCell = ar.data
			const aw = av.strong
			st64(s470, sat_sub(m, g))
			rc_inc(av, aw)
			st64(s480, ar.owner)
			const bb = ar.rent_epoch
			const ba = ar.is_signer
			const az = ar.is_writable
			const ay = ar.executable
			st8(s228 + 0x5a, ld64(s468))
			st8(s228 + 0x59, ld64(s460))
			st8(s228 + 0x58, ld64(s458))
			st64(s228 + 0x50, ld64(s450))
			st64(s228 + 0x48, ax)
			st64(s228 + 0x40, ld64(s478))
			st64(s228 + 0x38, ld64(s428 + 0x30))
			st64(s228 + 0x30, ld64(s428))
			st8(s228 + 0x2a, ld64(s428 + 8))
			st8(s228 + 0x29, ld64(s428 + 0x10))
			st8(s228 + 0x28, ld64(s428 + 0x18))
			st64(s228 + 0x20, ld64(s428 + 0x20))
			st64(s228 + 0x18, ld64(s428 + 0x28))
			st64(s228 + 0x10, ld64(s440))
			copyr(s228, s438, 0x10)
			st8(s230, ba, az, ay)
			st64(s250 + 0x18, bb)
			st64(s250 + 0x10, ld64(s480))
			st64(s250, at, av)
			st64(s270 + 0x18, ld64(s448))
			st64(s1c8, 8, 0)
			st64(s270, 0, 8, 0)
			cs = system_program_transfer(s390, s270, ld64(s470))
			const bc = ld64(s390)
			const bd = ld64(s428 + 0x40)
			if (bc != 2) {
				const be = ld64(s390 + 8)
				st64(bd, bc, be)
				return cs
			}
		}
		const bf: LamportsCell = f.lamports
		const bg = bf.strong
		st64(s428 + 0x30, f.key)
		const bi = ld64(s428 + 0x38)
		rc_inc(bf, bg)
		const bh: DataCell = f.data
		rc_inc(bh)
		st64(s428 + 0x28, bh)
		const bj = ld64(bi + 0x18)
		const bk: AccountInfo = ld64(bj)
		const bl: LamportsCell = bk.lamports
		const bm = bl.strong
		st64(s428, f.executable)
		st64(s428 + 8, f.is_writable)
		st64(s428 + 0x10, f.is_signer)
		st64(s428 + 0x18, f.rent_epoch)
		st64(s428 + 0x20, f.owner)
		const bn = bk.key
		rc_inc(bl, bm)
		st64(s430, bn)
		const bo: DataCell = bk.data
		rc_inc(bo)
		st64(s448, bj)
		st64(s440, bk.owner)
		st64(s438, bf)
		const bu = bk.rent_epoch
		const bt = bk.is_signer
		const bs = bk.is_writable
		const br = bk.executable
		const bp = ld64(ld64(ld64(bi + 0x20)))
		copyr(s1b8, bp, 0x20)
		const bq = ld8(ld64(bi + 0x28))
		st64(s28, s191)
		st64(s48 + 0x10, s1b8)
		st64(s48, 0x100159360)
		st8(s191, bq)
		st64(s190, s48)
		st64(s310 + 8, s190)
		st8(s310, bt, bs, br)
		st64(s330 + 0x18, bu)
		st64(s330 + 0x10, ld64(s440))
		st64(s330, bl, bo)
		st64(s338, ld64(s430))
		st8(s33f + 1, ld64(s428))
		st8(s33f, ld64(s428 + 8))
		st8(s348 + 8, ld64(s428 + 0x10))
		st64(s348, ld64(s428 + 0x18))
		st64(s360 + 0x10, ld64(s428 + 0x20))
		st64(s360 + 8, ld64(s428 + 0x28))
		st64(s360, ld64(s438))
		st64(s368, ld64(s428 + 0x30))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 8)
		st64(s190 + 8, 3)
		st64(s300, 1)
		st64(s380, 0, 8, 0)
		cs = system_program_assign_13fb30(s3a0, s380, 0x119)
		af = ld64(s3a0)
		if (af != 2) {
			cr = ld64(s3a0 + 8)
			cq = ld64(s428 + 0x40)
			st64(cq, af, cr)
			return cs
		}
		const bv: LamportsCell = f.lamports
		const cd = f.key
		rc_inc(bv)
		const bw: DataCell = f.data
		rc_inc(bw)
		const bx: AccountInfo = ld64(ld64(s448))
		const by: LamportsCell = bx.lamports
		const bz = by.strong
		st64(s428 + 0x18, f.executable)
		st64(s428 + 0x20, f.is_writable)
		st64(s428 + 0x28, f.is_signer)
		st64(s428 + 0x30, f.rent_epoch)
		const cc = f.owner
		st64(s428 + 0x10, bx.key)
		rc_inc(by, bz)
		const ca: DataCell = bx.data
		const cb = ca.strong
		st64(s430, cc, cd, bv)
		rc_inc(ca, cb)
		const ci = bx.owner
		const ch = bx.rent_epoch
		const cg = bx.is_signer
		const cf = bx.is_writable
		const ce = bx.executable
		copyr(s190, s1b8, 0x20)
		st64(s28, s169)
		st64(s48 + 0x10, s190)
		st64(s48, 0x100159360)
		st8(s169, ld8(s191))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 8)
		st64(s288, s48, 3)
		st64(s310 + 8, s288)
		st8(s310, cg, cf, ce)
		st64(s330, by, ca, ci, ch)
		st64(s338, ld64(s428 + 0x10))
		st8(s33f + 1, ld64(s428 + 0x18))
		st8(s33f, ld64(s428 + 0x20))
		st8(s348 + 8, ld64(s428 + 0x28))
		st64(s348, ld64(s428 + 0x30))
		st64(s360 + 0x10, ld64(s430))
		st64(s360 + 8, bw)
		copyr(s368, s428, 0x10)
		st64(s300, 1)
		st64(s380, 0, 8, 0)
		cs = system_program_assign_13ff40(s3b0, s380, ld64(ld64(ld64(s428 + 0x38) + 0x30)))
		af = ld64(s3b0)
		if (af != 2) {
			cr = ld64(s3b0 + 8)
			cq = ld64(s428 + 0x40)
			st64(cq, af, cr)
			return cs
		}
	} else {
		const p = fn_1476d8(ld64(b + 8), 0x119)
		const h: AccountInfo = ld64(ld64(b + 0x10))
		const i: LamportsCell = h.lamports
		const v = h.key
		rc_inc(i)
		st64(s428 + 0x30, p)
		const q: DataCell = h.data
		rc_inc(q)
		st64(s428 + 0x28, q)
		const r: LamportsCell = f.lamports
		const s = r.strong
		st64(s428, f.key)
		st64(s428 + 8, h.executable)
		st64(s428 + 0x10, h.is_writable)
		st64(s428 + 0x18, h.is_signer)
		st64(s428 + 0x20, h.rent_epoch)
		const t = h.owner
		rc_inc(r, s)
		st64(s430, t)
		const u: DataCell = f.data
		rc_inc(u)
		st64(s440, v, i)
		const w: AccountInfo = ld64(ld64(b + 0x18))
		const x: LamportsCell = w.lamports
		const y = x.strong
		st64(s468, f.executable)
		st64(s460, f.is_writable)
		st64(s458, f.is_signer)
		st64(s450, f.rent_epoch)
		st64(s448, f.owner)
		const z = w.key
		rc_inc(x, y)
		st64(s470, z)
		const aa: DataCell = w.data
		rc_inc(aa)
		st64(s478, w.owner)
		st64(s480, w.rent_epoch)
		st64(s488, w.is_signer)
		const ae = w.is_writable
		const ad = w.executable
		const ab = ld64(ld64(ld64(b + 0x20)))
		copyr(s190, ab, 0x20)
		const ac = ld8(ld64(b + 0x28))
		st64(s28, s169)
		st64(s48 + 0x10, s190)
		st64(s48, 0x100159360)
		st8(s169, ac)
		st64(s288, s48)
		st64(s300 + 0x28, s288)
		st8(s300 + 0x22, ld64(s468))
		st8(s300 + 0x21, ld64(s460))
		st8(s300 + 0x20, ld64(s458))
		st64(s300 + 0x18, ld64(s450))
		st64(s300 + 0x10, ld64(s448))
		st64(s300, r, u)
		st64(s310 + 8, ld64(s428))
		st8(s310 + 2, ld64(s428 + 8))
		st8(s310 + 1, ld64(s428 + 0x10))
		st8(s310, ld64(s428 + 0x18))
		st64(s330 + 0x18, ld64(s428 + 0x20))
		st64(s330 + 0x10, ld64(s430))
		st64(s330 + 8, ld64(s428 + 0x28))
		copyr(s338, s440, 0x10)
		st8(s33f, ae, ad)
		st8(s348 + 8, ld64(s488))
		st64(s348, ld64(s480))
		st64(s360 + 0x10, ld64(s478))
		st64(s360, x, aa)
		st64(s368, ld64(s470))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 8)
		st64(s288 + 8, 3)
		st64(s300 + 0x30, 1)
		st64(s380, 0, 8, 0)
		cs = system_program_create_account(s3e0, s380, ld64(s428 + 0x30), 0x119, ld64(ld64(b + 0x30)))
		af = ld64(s3e0)
		if (af != 2) {
			cr = ld64(s3e0 + 8)
			cq = ld64(s428 + 0x40)
			st64(cq, af, cr)
			return cs
		}
	}
	const cl = ld64(s428 + 0x40)
	cs = fn_8ed0(s168, f)
	if (ld64(s168) == 0) {
		const cm = ld64(0x300000000 /* heap bump-allocator cursor */)
		const co = cm != 0 ? sat_sub(cm, 0x11) : 0x300007fef
		const cp = ld64(s168 + 0x10)
		const cn = ld64(s168 + 8)
		if (cn != 0) {
			if (0x300000008 > co) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, co)
			st64(co + 8, 0x6f697469736f705f)
			st64(co, 0x6c616e6f73726570)
			st8(co + 0x10, 0x6e)
			void ld64(cp)
		} else {
			if (0x300000008 > co) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, co)
			st64(co + 8, 0x6f697469736f705f)
			st64(co, 0x6c616e6f73726570)
			st8(co + 0x10, 0x6e)
			void ld64(cp)
		}
		st64(cp + 0x10, co, 0x11)
		st64(cp + 8, 0x11)
		st64(cp, 1)
		st64(cl + 8, cp)
		st64(cl, cn)
		return cs
	}
	const cj = ld64(0x300000000 /* heap bump-allocator cursor */)
	const ck = cj != 0 ? sat_sub(cj, 0x120) & -8 : 0x300007ee0
	if (0x300000008 > ck) {
		alloc_handle_alloc_error(8, 0x120)
	}
	st64(0x300000000 /* heap bump-allocator cursor */, ck)
	cs = memcpy(ck, s168, 0x120)
	st64(cl + 8, ck)
	st64(cl, 2)
	return cs
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

// types [heur]: b: OpenPositionWithToken22NftAccounts (every call passes one: fn_26d98)
function fn_7ea90(a: u64, b: OpenPositionWithToken22NftAccounts, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s90 = fp - 0x90, s97 = fp - 0x97, s98 = fp - 0x98, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sd8 = fp - 0xd8, se8 = fp - 0xe8, s118 = fp - 0x118, s120 = fp - 0x120, s148 = fp - 0x148, s150 = fp - 0x150, s158 = fp - 0x158, s160 = fp - 0x160, s168 = fp - 0x168, s170 = fp - 0x170, s178 = fp - 0x178, s180 = fp - 0x180, s188 = fp - 0x188, s190 = fp - 0x190, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s250 = fp - 0x250, s2f8 = fp - 0x2f8, s300 = fp - 0x300, s308 = fp - 0x308, s310 = fp - 0x310, s318 = fp - 0x318, s320 = fp - 0x320, s328 = fp - 0x328
	let k, l, q, s, t, au, av: u64
	st64(s250 + 8, b)
	st64(s2f8 + 0x90, p8)
	const u = p7
	const o = p6
	const f = p5
	const h = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = p9
	st64(s2f8 + 0x98, a)
	st64(s2f8 + 0x48, d)
	st64(s2f8 + 0x58, f)
	if (g != 0) {
		const j = h != 0 ? sat_sub(h, 4) : 0x300007ffc
		if (0x300000007 >= j) {
			raw_vec_handle_error(2, 4, 0x10015f8f8, d, 4 > h)
		}
		k = j & -2
		st64(0x300000000 /* heap bump-allocator cursor */, k)
		l = 2
		st32(k, 0x120003)
	} else {
		const i = h != 0 ? sat_sub(h, 2) : 0x300007ffe
		if (0x300000007 >= i) {
			raw_vec_handle_error(2, 2, 0x10015f8f8, d, 2 > h)
		}
		k = i & -2
		st64(0x300000000 /* heap bump-allocator cursor */, k)
		l = 1
		st16(k, 3)
	}
	st64(s250 + 0x10, l)
	fn_133040(s190, k, l)
	const n = ld64(s188)
	const m = ld64(s190)
	if (m != 0x800000000000001a /* Ok */) {
		st64(s180, ld64(s180))
		st64(s190, m, n)
		t = fn_13e628(s1b8, s190)
		s = ld64(s1b8 + 8)
		q = ld64(s2f8 + 0x98)
		st64(q, ld64(s1b8))
		st64(q + 8, s)
		return t
	}
	st64(s2f8 + 0x30, o)
	const p = fn_132bd8(n > n + 0xa6 ? 0xffffffffffffffff : n + 0xa6)
	rent_get(s190)
	copy(s1a8, s188, 0x18)
	if (ld64(s190) != 0) {
		t = fn_13e628(s238, s1a8)
		s = ld64(s238 + 8)
		q = ld64(s2f8 + 0x98)
		st64(q, ld64(s238))
		st64(q + 8, s)
		return t
	}
	copyr(s70, s1a8, 0x18)
	st64(s2f8 + 0x60, p)
	st64(s2f8 + 0x50, fn_1476d8(s70, p))
	const v: AccountInfo = ld64(u)
	const w: LamportsCell = v.lamports
	st64(s2f8 + 0x88, w)
	const x = w.strong
	st64(s2f8 + 0x78, v.key)
	rc_inc(ld64(s2f8 + 0x88), x)
	const y: DataCell = v.data
	rc_inc(y)
	const z: AccountInfo = ld64(ld64(s250 + 8))
	const aa: LamportsCell = z.lamports
	st64(s2f8 + 0x80, aa)
	const ab = aa.strong
	st64(s2f8 + 0x28, v.executable)
	st64(s2f8 + 0x38, v.is_writable)
	st64(s2f8 + 0x40, v.is_signer)
	st64(s2f8 + 0x68, v.rent_epoch)
	st64(s2f8 + 0x70, v.owner)
	st64(s2f8 + 0x20, z.key)
	rc_inc(ld64(s2f8 + 0x80), ab)
	st64(s2f8 + 0x18, y)
	const ac: DataCell = z.data
	rc_inc(ac)
	const ad: LamportsCell = c.lamports
	st64(s250 + 8, ad)
	const ae = ad.strong
	st64(s250, c.key)
	st64(s2f8 + 8, z.executable)
	st64(s2f8 + 0x10, z.is_writable)
	const ai = z.is_signer
	const ag = z.rent_epoch
	const ah = z.owner
	rc_inc(ld64(s250 + 8), ae)
	const af: DataCell = c.data
	rc_inc(af)
	st64(s300, ag)
	const an = c.owner
	st64(s2f8, ac)
	const am = c.rent_epoch
	const al = c.is_signer
	const ak = c.is_writable
	const aj = c.executable
	st64(s2f8 + 0xa0, af)
	st64(s118 + 0x10, af)
	copyr(s118, s250, 0x10)
	st8(s120 + 2, ld64(s2f8 + 8))
	st8(s120 + 1, ld64(s2f8 + 0x10))
	st8(s120, ai)
	st64(s148 + 0x20, ld64(s300))
	st64(s148 + 0x18, ah)
	st64(s148 + 0x10, ld64(s2f8))
	st64(s148 + 8, ld64(s2f8 + 0x80))
	st64(s148, ld64(s2f8 + 0x20))
	st8(s150 + 2, ld64(s2f8 + 0x28))
	st8(s150 + 1, ld64(s2f8 + 0x38))
	st8(s150, ld64(s2f8 + 0x40))
	st64(s158, ld64(s2f8 + 0x68))
	st64(s160, ld64(s2f8 + 0x70))
	st64(s168, ld64(s2f8 + 0x18))
	st64(s170, ld64(s2f8 + 0x88))
	st64(s178, ld64(s2f8 + 0x78))
	st64(s2f8 + 0x68, aj)
	st8(s118 + 0x2a, aj)
	st64(s2f8 + 0x70, ak)
	st8(s118 + 0x29, ak)
	st64(s2f8 + 0x78, al)
	st8(s118 + 0x28, al)
	st64(s2f8 + 0x80, am)
	st64(s118 + 0x20, am)
	st64(s2f8 + 0x88, an)
	st64(s118 + 0x18, an)
	st64(se8, 8, 0)
	st64(s190, 0, 8, 0)
	const ao: AccountInfo = ld64(ld64(s2f8 + 0x90))
	const ap = ao.key
	const aq = ld64(s2f8 + 0x50)
	const ar = ld64(s2f8 + 0x60)
	st64(s2f8 + 0x90, ap)
	t = system_program_create_account(s1c8, s190, aq, ar, ap)
	s = ld64(s1c8 + 8)
	let r = ld64(s1c8)
	if (r == 2) {
		st64(s300, s150)
		st64(s310, s158)
		st64(s320, s180)
		st64(s2f8 + 0x40, s188)
		st64(s2f8 + 0x18, s50)
		st64(s2f8 + 0x60, s68)
		st64(s2f8 + 0x10, s170)
		st64(s2f8 + 0x28, s97)
		st64(s308, s150)
		st64(s318, s158)
		st64(s328, s180)
		st64(s2f8 + 0x38, s188)
		st64(s2f8, s170, s50)
		let aw = ld64(s250 + 0x10) << 1
		st64(s2f8 + 0x20, ld64(ld64(s2f8 + 0x58)))
		while (true) {
			B23: {
				const ax = ld16(k)
				st64(s250 + 0x10, aw)
				if (ax == 3) {
					fn_137528(s190, ld64(s2f8 + 0x90), ld64(s250), ld64(s2f8 + 0x20))
					const be = ld64(s2f8 + 0x38)
					copy(s20, be, 0x18)
					const bf = ld64(s190)
					if (bf == 0x8000000000000000) {
						t = fn_13e628(s1e8, s20)
						s = ld64(s1e8 + 8)
						q = ld64(s2f8 + 0x98)
						st64(q, ld64(s1e8))
						st64(q + 8, s)
						return t
					}
					memcpy(ld64(s2f8 + 8), ld64(s2f8), 0x30)
					const bg = ld64(s2f8 + 0x60)
					st64(bg + 0x10, ld64(s20 + 0x10))
					st64(bg + 8, ld64(s20 + 8))
					st64(bg, ld64(s20))
					st64(s70, bf)
					const bh: LamportsCell = ao.lamports
					const br = ao.key
					rc_inc(bh)
					const bi: DataCell = ao.data
					rc_inc(bi)
					const bo = ao.executable
					const bp = ao.is_writable
					const bq = ao.is_signer
					st64(s2f8 + 0x50, ao.rent_epoch)
					st64(s2f8 + 0x58, ao.owner)
					const bk = ld64(s250 + 8)
					rc_inc(bk)
					const bm: DataCell = ld64(s2f8 + 0xa0)
					rc_inc(bm)
					st8(s148 + 0x12, ld64(s2f8 + 0x68))
					st8(s148 + 0x11, ld64(s2f8 + 0x70))
					st8(s148 + 0x10, ld64(s2f8 + 0x78))
					st64(s148 + 8, ld64(s2f8 + 0x80))
					st64(s148, ld64(s2f8 + 0x88))
					st64(s150, ld64(s2f8 + 0xa0))
					copyr(s160, s250, 0x10)
					st8(s168, bq, bp, bo)
					st64(s170, ld64(s2f8 + 0x50))
					st64(s178, ld64(s2f8 + 0x58))
					st64(s190, br, bh, bi)
					av = fn_142568(sc0, s70, s190, 2)
					const bs = ld64(sc0)
					if (bs != 0x800000000000001a /* Ok */) {
						copyr(s90, sb8, 0x10)
						st64(s98, bs)
						t = fn_13e628(s1d8, s98)
						s = ld64(s1d8 + 8)
						r = ld64(s1d8)
						const cv = ld64(s188)
						if (rc_release(cv)) {
							t = Rc_drop_slow_14df0(ld64(s2f8 + 0x38), t)
						}
						const cw = ld64(s180)
						if (rc_release(cw)) {
							t = Rc_drop_slow_14df0(ld64(s328), t)
						}
						const cx = ld64(s158)
						if (rc_release(cx)) {
							t = Rc_drop_slow_14df0(ld64(s318), t)
						}
						const cy = ld64(s150)
						if (!rc_release(cy)) {
							q = ld64(s2f8 + 0x98)
							st64(q, r, s)
							return t
						}
						t = Rc_drop_slow_14df0(ld64(s308), t)
						q = ld64(s2f8 + 0x98)
						st64(q, r, s)
						return t
					}
					const bt = ld64(s188)
					if (rc_release(bt)) {
						av = Rc_drop_slow_14df0(ld64(s2f8 + 0x38), av)
					}
					const bu = ld64(s180)
					if (rc_release(bu)) {
						av = Rc_drop_slow_14df0(ld64(s328), av)
					}
					const bv = ld64(s158)
					if (rc_release(bv)) {
						av = Rc_drop_slow_14df0(ld64(s318), av)
					}
					const at = ld64(s150)
					if (!rc_release(at)) {
						break B23
					}
					au = ld64(s308)
				} else {
					if (ax != 0x12) {
						fn_85138(sc0, 0x100159868)
						st64(s98, 0, 1, 0)
						st64(s50, s98, 0x10015f818)
						st8(s50 + 0x18, 3)
						st64(s50 + 0x10, 0x20)
						st64(s68 + 8, 0)
						st64(s70, 0)
						if (fn_88558(0x100159868, s70) != 0) {
							fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
						}
						copyr(s158, s98, 0x18)
						copy(s170, sc0, 0x18)
						st64(s188, 0x10015a809)
						st32(s118 + 0x20, 0x1792 /* error::NotSupportMint */)
						st8(s148 + 8, 2)
						st32(s178, 0x194)
						st64(s180, 0x1e)
						st64(s190, 0)
						t = fn_13e5a0(s228, s190)
						s = ld64(s228 + 8)
						q = ld64(s2f8 + 0x98)
						st64(q, ld64(s228))
						st64(q + 8, s)
						return t
					}
					st8(sc0, 0)
					const ay = ld64(s250)
					const az = ld64(s2f8 + 0x28)
					st64(az + 0x18, ld64(ay + 0x18))
					st64(az + 0x10, ld64(ay + 0x10))
					st64(az + 8, ld64(ay + 8))
					st64(az, ld64(ay))
					st8(s98, 1)
					fn_132070(s190, ld64(s2f8 + 0x90), ay, sc0, s98)
					const ba = ld64(s2f8 + 0x40)
					copy(sd8, ba, 0x18)
					const bb = ld64(s190)
					if (bb == 0x8000000000000000) {
						t = fn_13e628(s218, sd8)
						s = ld64(s218 + 8)
						q = ld64(s2f8 + 0x98)
						st64(q, ld64(s218))
						st64(q + 8, s)
						return t
					}
					memcpy(ld64(s2f8 + 0x18), ld64(s2f8 + 0x10), 0x30)
					const bc = ld64(s2f8 + 0x60)
					st64(bc + 0x10, ld64(sd8 + 0x10))
					st64(bc + 8, ld64(sd8 + 8))
					st64(bc, ld64(sd8))
					st64(s70, bb)
					const bd: LamportsCell = ao.lamports
					const bz = ao.key
					rc_inc(bd)
					const bj: DataCell = ao.data
					rc_inc(bj)
					const bw = ao.executable
					const bx = ao.is_writable
					const by = ao.is_signer
					st64(s2f8 + 0x50, ao.rent_epoch)
					st64(s2f8 + 0x58, ao.owner)
					const bl = ld64(s250 + 8)
					rc_inc(bl)
					const bn: DataCell = ld64(s2f8 + 0xa0)
					rc_inc(bn)
					st8(s148 + 0x12, ld64(s2f8 + 0x68))
					st8(s148 + 0x11, ld64(s2f8 + 0x70))
					st8(s148 + 0x10, ld64(s2f8 + 0x78))
					st64(s148 + 8, ld64(s2f8 + 0x80))
					st64(s148, ld64(s2f8 + 0x88))
					st64(s150, ld64(s2f8 + 0xa0))
					copyr(s160, s250, 0x10)
					st8(s168, by, bx, bw)
					st64(s170, ld64(s2f8 + 0x50))
					st64(s178, ld64(s2f8 + 0x58))
					st64(s190, bz, bd, bj)
					av = fn_142568(sc0, s70, s190, 2)
					const ca = ld64(sc0)
					if (ca != 0x800000000000001a /* Ok */) {
						copyr(s90, sb8, 0x10)
						st64(s98, ca)
						t = fn_13e628(s1f8, s98)
						s = ld64(s1f8 + 8)
						r = ld64(s1f8)
						const cr = ld64(s188)
						if (rc_release(cr)) {
							t = Rc_drop_slow_14df0(ld64(s2f8 + 0x40), t)
						}
						const cs = ld64(s180)
						if (rc_release(cs)) {
							t = Rc_drop_slow_14df0(ld64(s320), t)
						}
						const ct = ld64(s158)
						if (rc_release(ct)) {
							t = Rc_drop_slow_14df0(ld64(s310), t)
						}
						const cu = ld64(s150)
						if (!rc_release(cu)) {
							q = ld64(s2f8 + 0x98)
							st64(q, r, s)
							return t
						}
						t = Rc_drop_slow_14df0(ld64(s300), t)
						q = ld64(s2f8 + 0x98)
						st64(q, r, s)
						return t
					}
					const cb = ld64(s188)
					if (rc_release(cb)) {
						av = Rc_drop_slow_14df0(ld64(s2f8 + 0x40), av)
					}
					const cc = ld64(s180)
					if (rc_release(cc)) {
						av = Rc_drop_slow_14df0(ld64(s320), av)
					}
					const cd = ld64(s158)
					if (rc_release(cd)) {
						av = Rc_drop_slow_14df0(ld64(s310), av)
					}
					const ce = ld64(s150)
					if (!rc_release(ce)) {
						break B23
					}
					au = ld64(s300)
				}
				Rc_drop_slow_14df0(au, av)
			}
			k = k + 2
			aw = ld64(s250 + 0x10) - 2
			if (aw == 0) {
				const cf: LamportsCell = ao.lamports
				const co = ao.key
				rc_inc(cf)
				const cg: DataCell = ao.data
				rc_inc(cg)
				const cj = ao.executable
				const ck = ao.is_writable
				const cl = ao.is_signer
				const cm = ao.rent_epoch
				const cn = ao.owner
				const ch = ld64(s250 + 8)
				rc_inc(ch)
				const ci: DataCell = ld64(s2f8 + 0xa0)
				rc_inc(ci)
				st8(s150 + 2, ld64(s2f8 + 0x68))
				st8(s150 + 1, ld64(s2f8 + 0x70))
				st8(s150, ld64(s2f8 + 0x78))
				st64(s158, ld64(s2f8 + 0x80))
				st64(s160, ld64(s2f8 + 0x88))
				st64(s168, ld64(s2f8 + 0xa0))
				copyr(s178, s250, 0x10)
				st8(s120, cl, ck, cj)
				st64(s148, co, cf, cg, cn, cm)
				st64(s118, 8, 0)
				st64(s190, 0, 8, 0)
				const cp = ld64(ld64(s2f8 + 0x48))
				copyr(s98, cp, 0x20)
				const cq = ld64(ld64(s2f8 + 0x30))
				copyr(s70, cq, 0x20)
				t = fn_12b0f8(s208, s190, 0, s98, s70)
				s = ld64(s208 + 8)
				q = ld64(s2f8 + 0x98)
				st64(q, ld64(s208))
				st64(q + 8, s)
				return t
			}
		}
	}
	q = ld64(s2f8 + 0x98)
	st64(q, r, s)
	return t
}

function fn_1c850(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s70 = fp - 0x70, s88 = fp - 0x88, sa0 = fp - 0xa0, sc0 = fp - 0xc0, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se0 = fp - 0xe0, s100 = fp - 0x100, s120 = fp - 0x120, s140 = fp - 0x140, s170 = fp - 0x170, s178 = fp - 0x178, s188 = fp - 0x188, s190 = fp - 0x190, s198 = fp - 0x198, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s218 = fp - 0x218, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s308 = fp - 0x308, s350 = fp - 0x350, s3a8 = fp - 0x3a8, s3f0 = fp - 0x3f0, s3f8 = fp - 0x3f8, sfc0 = fp - 0xfc0, sff0 = fp - 0xff0, s1000 = fp - 0x1000
	let f, g, i, j, k, l, bq, br, bs, bt: u64
	B7: {
		st64(s350 + 0x20, d)
		st64(s3f0 + 0x20, c)
		st64(s350 + 0x40, b)
		st64(s308 + 0x28, a)
		k = ld64(e - 0xf50)
		j = ld64(e - 0xf58)
		st64(s3a8 + 8, ld64(e - 0xf08))
		st64(s3a8 + 0x40, ld64(e - 0xf10))
		st64(s3a8, ld64(e - 0xf18))
		st64(s308, ld64(e - 0xf20))
		st64(s308 + 8, ld64(e - 0xf28))
		st64(s308 + 0x20, ld64(e - 0xf30))
		st64(s308 + 0x10, ld64(e - 0xf38))
		st64(s3a8 + 0x30, ld64(e - 0xf40))
		st64(s3a8 + 0x38, ld64(e - 0xf48))
		st64(s3f0 + 0x10, ld64(e - 0xf60))
		st64(s3a8 + 0x20, ld64(e - 0xf68))
		st64(s3a8 + 0x28, ld64(e - 0xf70))
		f = ld64(e - 0xf78)
		st64(s350 + 0x18, ld64(e - 0xf88))
		st64(s3f0 + 0x40, ld64(e - 0xf90))
		st64(s350 + 0x10, ld64(e - 0xfa0))
		st64(s350 + 0x30, ld64(e - 0xfa8))
		st64(s3f0 + 0x28, ld64(e - 0xfb0))
		st64(s3a8 + 0x48, ld64(e - 0xfb8))
		st64(s3a8 + 0x50, ld64(e - 0xfc0))
		copyr(s350, e - 0xfd0, 0x10)
		st64(s3a8 + 0x18, ld64(e - 0xfd8))
		st64(s350 + 0x28, ld64(e - 0xfe0))
		st64(s350 + 0x38, ld64(e - 0xfe8))
		l = ld64(e - 0xff0)
		st64(s3f0 + 0x30, ld64(e - 0xff8))
		st64(s3f0 + 0x38, ld64(e - 0x1000))
		g = ld64(e - 0xf80)
		st64(s308 + 0x18, f)
		if (g != 0 && ld32(g + 0x34) == 1) {
			copyr(s100, g + 0x38, 0x20)
			r0 = memcmp(0x100159400 /* key 2Yq4T3mPNfjtEyTxSbRjRKqLf1pwbTasuCQrWe6QpM7x */, s100, 0x20)
			d = undef
			e = undef
			i = (r0 as u32) == 0
			f = ld64(s308 + 0x18)
			if (f == 0) {
				break B7
			}
			r0 = r0 as u32
			if (r0 == 0) {
				break B7
			}
		} else {
			i = 0
			if (f == 0) {
				break B7
			}
		}
		i = 0
		if (ld32(f + 0x34) == 1) {
			copyr(s100, f + 0x38, 0x20)
			const h = memcmp(0x100159400 /* key 2Yq4T3mPNfjtEyTxSbRjRKqLf1pwbTasuCQrWe6QpM7x */, s100, 0x20)
			f = undef
			d = undef
			e = undef
			r0 = h as u32
			i = r0 == 0
		}
	}
	st64(s3f0 + 0x18, i)
	st64(s268, j, k)
	const m = ld64(l)
	let r = fn_53e8(s100, m, f, d, e, r0)
	let n = ld64(s100 + 0x10)
	let o = ld64(s100 + 8)
	if (ld64(s100) != 1) {
		st64(s258, o, n)
		const p = ld8(o + 0x17d)
		st64(s3a8 + 0x10, n)
		if ((p & 1) == 0) {
			st64(s3f0, m, o)
			const q = ld64(s308 + 0x10)
			r = fn_75fc8(s288, q, ld64(s308 + 0x20), undef, r)
			n = ld64(s288 + 8)
			o = ld64(s288)
			if (o == 2) {
				r = fn_756a8(s298, ld64(s308 + 8), q, ld16(ld64(s3f0 + 8) + 0xe3))
				n = ld64(s298 + 8)
				o = ld64(s298)
				if (o != 2) {
					bs = ld64(s3a8 + 0x10)
					st64(bs, ld64(bs) + 1)
					bt = ld64(s308 + 0x28)
					st64(bt + 8, n)
					st64(bt, o)
					return r
				}
				r = fn_756a8(s2a8, ld64(s308), ld64(s308 + 0x20), ld16(ld64(s3f0 + 8) + 0xe3))
				n = ld64(s2a8 + 8)
				o = ld64(s2a8)
				if (o != 2) {
					bs = ld64(s3a8 + 0x10)
					st64(bs, ld64(bs) + 1)
					bt = ld64(s308 + 0x28)
					st64(bt + 8, n)
					st64(bt, o)
					return r
				}
				const s: AccountInfo = ld64(ld64(s350 + 0x40))
				const t: LamportsCell = s.lamports
				const z = s.key
				const aq = ld64(s3f0)
				rc_inc(t)
				const u: DataCell = s.data
				rc_inc(u)
				const y = s.owner
				const x = s.rent_epoch
				const w = s.is_signer
				const v = s.is_writable
				st64(s3f8, s)
				st8(s20 + 2, s.executable)
				st8(s20, w, v)
				st64(s48, z, t, u, y, x)
				const aa: AccountInfo = ld64(ld64(s350 + 0x38))
				const ab: LamportsCell = aa.lamports
				const ah = aa.key
				rc_inc(ab)
				const ac: DataCell = aa.data
				rc_inc(ac)
				const ag = aa.owner
				const af = aa.rent_epoch
				const ae = aa.is_signer
				const ad = aa.is_writable
				st8(s170 + 2, aa.executable)
				st8(s170, ae, ad)
				st64(s198, ah, ab, ac, ag, af)
				const ai: AccountInfo = ld64(ld64(s350 + 0x30))
				const aj: LamportsCell = ai.lamports
				const ap = ai.key
				rc_inc(aj)
				const ak: DataCell = ai.data
				rc_inc(ak)
				const ao = ai.owner
				const an = ai.rent_epoch
				const am = ai.is_signer
				const al = ai.is_writable
				st64(s350 + 0x38, ai)
				st8(sd8 + 2, ai.executable)
				st8(sd8, am, al)
				st64(s100, ap, aj, ak, ao, an)
				const ar = ld64(aq)
				copyr(s218, ar, 0x20)
				const at = ld16(ld64(s3f0 + 8) + 0xe3)
				copyr(s1f8, ar, 0x20)
				st64(sff0, at)
				const au = ld64(s308 + 8)
				st64(s1000, s1f8, au)
				r = fn_70108(s1c8, s48, s198, s100, fp)
				n = ld64(s1c8 + 8)
				o = ld64(s1c8)
				const av = ld8(s1b8 + 0x1a)
				if (av == 2) {
					bs = ld64(s3a8 + 0x10)
					st64(bs, ld64(bs) + 1)
					bt = ld64(s308 + 0x28)
					st64(bt + 8, n)
					st64(bt, o)
					return r
				}
				B39: {
					st16(s238 + 0x18, ld16(s1b8 + 0x18))
					copyr(s238, s1b8, 0x18)
					st32(s238 + 0x1b, ld32(s1b8 + 0x1b))
					st8(s238 + 0x1f, ld8(s1b8 + 0x1f))
					st8(s238 + 0x1a, av)
					st64(s248, o, n)
					const aw = ld64(s308)
					if ((au as u32) == (aw as u32)) {
						AccountInfo_clone_f338(s100, ld64(ld64(s350 + 0x28)))
						const ba = fn_84360(s198, s100)
						n = ld64(s190)
						o = ld64(s198)
						const az = ld8(s170 + 2)
						if (az == 2) {
							br = ptr_drop_in_place_fcd8(s100, ba)
							break B39
						}
						st16(s1e8 + 0x18, ld16(s170))
						copyr(s1e8, s188, 0x18)
						st32(s1e8 + 0x1b, ld32(s170 + 3))
						st8(s1e8 + 0x1f, ld8(s170 + 7))
						st8(s1e8 + 0x1a, az)
						st64(s1f8, o, n)
						ptr_drop_in_place_fcd8(s100, ba)
					} else {
						AccountInfo_clone_f338(s48, ld64(s3f8))
						const ax = ld64(ld64(s350 + 0x28))
						st64(s350 + 0x30, s198)
						AccountInfo_clone_f338(s198, ax)
						st64(s350 + 0x28, s100)
						AccountInfo_clone_f338(s100, ld64(s350 + 0x38))
						st64(sff0, ld16(ld64(s3f0 + 8) + 0xe3))
						st64(s1000, s218, aw)
						br = fn_70108(s1c8, s48, ld64(s350 + 0x30), ld64(s350 + 0x28), fp)
						n = ld64(s1c8 + 8)
						o = ld64(s1c8)
						const ay = ld8(s1b8 + 0x1a)
						if (ay == 2) {
							break B39
						}
						st16(s1e8 + 0x18, ld16(s1b8 + 0x18))
						copyr(s1e8, s1b8, 0x18)
						st32(s1e8 + 0x1b, ld32(s1b8 + 0x1b))
						st8(s1e8 + 0x1f, ld8(s1b8 + 0x1f))
						st8(s1e8 + 0x1a, ay)
						st64(s1f8, o, n)
					}
					const bb = ld64(0x300000000 /* heap bump-allocator cursor */)
					let bn = ld64(s350 + 0x20)
					const bd = ld64(s308)
					const bc = bb != 0 ? sat_sub(bb, 8) & -4 : 0x300007ff8
					if (0x300000008 > bc) {
						alloc_handle_alloc_error(4, 8)
					}
					B38: {
						st64(0x300000000 /* heap bump-allocator cursor */, bc)
						st32(bc + 4, bd)
						st32(bc, au)
						st64(s100, 2, bc, 2)
						const be = fn_6f618(ld64(s3f0 + 8), s100)
						let bm = 0
						const bl = ld64(s308 + 0x10)
						if (be != 0) {
							if (ld64(s3a8 + 0x20) == 0) {
								fn_14ec98(0, 0, 0x10015faf0)
							}
							const bf = ld64(s3a8 + 0x28)
							const bg = ld64(bf)
							copyr(s120, bg, 0x20)
							fn_76200(s100, s218)
							const bh = memcmp(s120, s100, 0x20)
							bm = bf
							bn = ld64(s350 + 0x20)
							if ((bh as u32) != 0) {
								ErrorCode_name(s60, 0x100159874)
								st64(s1c8, 0, 1, 0)
								st64(s28, s1c8, 0x10015f818)
								st8(s20 + 0x10, 3)
								st64(s20 + 8, 0x20)
								st64(s48 + 0x10, 0)
								st64(s48, 0)
								if (ErrorCode_fmt(0x100159874, s48) != 0) {
									fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
								}
								copyr(sc8, s1c8, 0x18)
								copy(se0, s60, 0x18)
								st64(s100 + 8, 0x100159d93)
								st32(s70 + 8, 0x9c6 /* anchor::RequireKeysEqViolated */)
								st8(sc0 + 0x10, 2)
								st32(s100 + 0x18, 0x13b)
								st64(s100 + 0x10, 0x2e)
								st64(s100, 0)
								fn_13e5a0(s2b8, s100)
								const bj = ld64(s2b8 + 8)
								const bi = ld64(s2b8)
								const bk = fn_76200(se0, s218)
								copyr(s100, s120, 0x20)
								bq = Error_with_pubkeys(s2c8, bi, bj, s100, bk)
								st64(s3a8 + 0x10, ld64(s258 + 8))
								n = ld64(s2c8 + 8)
								o = ld64(s2c8)
								break B38
							}
						}
						st64(sfc0 + 0x38, ld64(s3a8 + 0x40))
						st64(sfc0 + 0x30, ld64(s308 + 0x20))
						st64(sfc0 + 0x28, bl)
						st64(sfc0 + 0x20, ld64(s3a8 + 0x30))
						st64(sfc0 + 0x18, ld64(s3a8 + 0x38))
						st64(sfc0, bm, s258, s268)
						st64(sff0 + 0x28, ld64(s308 + 0x18))
						st64(sff0 + 0x20, g)
						st64(sff0 + 0x18, ld64(s350 + 0x10))
						st64(sff0 + 0x10, ld64(s350 + 0x18))
						st64(sff0, s248, s1f8)
						st64(s1000 + 8, ld64(s3a8 + 0x48))
						st64(s1000, ld64(s3a8 + 0x50))
						bq = fn_1e428(s198, ld64(s350 + 0x40), ld64(s350), ld64(s350 + 8), ld64(s1000), ld64(s1000 + 8), s248, s1f8, ld64(sff0 + 0x10), ld64(sff0 + 0x18), g, ld64(sff0 + 0x28), bm, s258, s268, ld64(sfc0 + 0x18), ld64(sfc0 + 0x20), bl, ld64(sfc0 + 0x30), ld64(sfc0 + 0x38))
						o = ld64(s198)
						if (ld8(s140 + 0x19) == 2) {
							n = ld64(s190)
						} else {
							st64(s3a8 + 0x30, ld64(s170 + 0x20))
							st64(s3a8 + 0x38, ld64(s170 + 0x18))
							st64(s3a8 + 0x40, ld64(s170 + 0x10))
							st64(s3a8 + 0x48, ld64(s170 + 8))
							st64(s3a8 + 0x50, ld64(s170))
							st64(s350, ld64(s178))
							st64(s3a8 + 0x20, ld64(s188 + 8))
							st64(s3a8 + 0x28, ld64(s188))
							st64(s308 + 0x18, ld64(s140 + 0x10))
							copyr(s308, s140, 0x10)
							st64(s350 + 0x30, ld64(s170 + 0x28))
							const bv: LamportsCell = ld64(s190)
							const bu = ld64(ld64(s3a8 + 0x18))
							const bo = ld64(bn)
							copyr(s100, bo, 0x20)
							st64(s350 + 0x28, ld64(s268 + 8))
							st64(s350 + 8, ld64(s268))
							bq = fn_84298(s198)
							n = ld64(s190)
							const bp = ld64(s198)
							if (bp == 2) {
								st8(bu + 0x118, ld64(s3f0 + 0x10))
								copy(bu + 8, s100, 0x20)
								const bz = ld64(s218 + 0x18)
								const by = ld64(s218 + 0x10)
								const bx = ld64(s218 + 8)
								const bw = ld64(s218)
								st64(bu + 0x70, ld64(s3a8 + 0x20))
								st64(bu + 0x68, ld64(s3a8 + 0x28))
								st64(bu + 0x60, bv)
								st64(bu + 0x58, o)
								st64(bu + 0xc0, ld64(s3a8 + 0x30))
								st64(bu + 0xb8, ld64(s3a8 + 0x38))
								st64(bu + 0xa8, ld64(s3a8 + 0x40))
								st64(bu + 0xa0, ld64(s3a8 + 0x48))
								st64(bu + 0x90, ld64(s3a8 + 0x50))
								st64(bu + 0x88, ld64(s350))
								st64(bu + 0x28, bw, bx, by, bz)
								st64(bu + 0xd0, n)
								const ca = ld64(s350 + 0x28)
								st64(bu + 0x50, ca)
								const cb = ld64(s350 + 8)
								st64(bu + 0x48, cb)
								const cc = ld64(s308 + 0x20)
								st32(bu + 0x114, cc)
								const cd = ld64(s308 + 0x10)
								st32(bu + 0x110, cd)
								st64(bu + 0x78, 0, 0)
								st64(bu + 0x108, 0)
								st64(bu + 0x100, 0)
								st64(bu + 0xf8, 0)
								st64(bu + 0xf0, 0)
								st64(bu + 0xe8, 0)
								st64(bu + 0xe0, 0)
								st64(bu + 0xd8, 0)
								const ce = ld64(ld64(s3f8))
								copyr(se0, ce, 0x20)
								const cf = ld64(ld64(ld64(s3f0 + 0x20)))
								copyr(sc0, cf, 0x20)
								st64(sa0 + 0x10, ld64(s350 + 0x30))
								copy(s88, s308, 0x10)
								st64(s88 + 0x10, ld64(s308 + 0x18))
								st32(s70, cd, cc)
								st64(sa0, cb, ca)
								copyr(s100, s218, 0x20)
								fn_10f370(s198, s100)
								copyr(s48, s190, 0x10)
								ptr_drop_in_place_f5e8(s248, ptr_drop_in_place_f5e8(s1f8, log_data(s48, 1)))
								const cg = ld64(s3a8 + 0x10)
								st64(cg, ld64(cg) + 1)
								const cj = ld64(bu)
								const ci = ld64(ld64(s350 + 0x10))
								const ch = ld64(ld64(s3f0 + 0x28))
								st64(sfc0 + 0x10, ld64(s3f0 + 0x18) & 1)
								copyr(sfc0, s3a8, 0x10)
								st64(sff0 + 0x28, ch)
								st64(sff0 + 0x20, ld64(s350 + 0x38))
								st64(sff0 + 0x18, ld64(s350 + 0x18))
								st64(sff0 + 0x10, ci)
								st64(sff0 + 8, ld64(s3f0 + 0x40))
								st64(sff0, ld64(s3f0 + 0x30))
								st64(s1000 + 8, ld64(s3f0 + 0x38))
								st64(s1000, ld64(s350 + 0x20))
								r = fn_22e28(s2d8, ld64(s350 + 0x40), ld64(s3f0), cj, ld64(s1000), ld64(s1000 + 8), ld64(sff0), ld64(sff0 + 8), ci, ld64(sff0 + 0x18), ld64(sff0 + 0x20), ch, ld64(sfc0), ld64(sfc0 + 8), ld64(sfc0 + 0x10))
								o = ld64(s2d8)
								bt = ld64(s308 + 0x28)
								st64(bt + 8, ld64(s2d8 + 8))
								st64(bt, o)
								return r
							}
							o = bp
						}
					}
					br = ptr_drop_in_place_f5e8(s1f8, bq)
				}
				r = ptr_drop_in_place_f5e8(s248, br)
				bs = ld64(s3a8 + 0x10)
				st64(bs, ld64(bs) + 1)
				bt = ld64(s308 + 0x28)
				st64(bt + 8, n)
				st64(bt, o)
				return r
			}
			bs = ld64(s3a8 + 0x10)
			st64(bs, ld64(bs) + 1)
			bt = ld64(s308 + 0x28)
			st64(bt + 8, n)
			st64(bt, o)
			return r
		}
		fn_85138(s1c8, 0x10015982c)
		st64(s48, 0, 1, 0)
		st64(s178, s48, 0x10015f818)
		st8(s170 + 0x10, 3)
		st64(s170 + 8, 0x20)
		st64(s188, 0)
		st64(s198, 0)
		if (fn_88558(0x10015982c, s198) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(sc8, s48, 0x18)
		copy(se0, s1c8, 0x18)
		st64(s100 + 8, 0x100159d93)
		st32(s70 + 8, 0x1770 /* error::NotApproved */)
		st8(sc0 + 0x10, 2)
		st32(s100 + 0x18, 0xf8)
		st64(s100 + 0x10, 0x2e)
		st64(s100, 0)
		r = fn_13e5a0(s278, s100)
		n = ld64(s278 + 8)
		o = ld64(s278)
		bs = ld64(s3a8 + 0x10)
		st64(bs, ld64(bs) + 1)
		bt = ld64(s308 + 0x28)
		st64(bt + 8, n)
		st64(bt, o)
		return r
	}
	bt = ld64(s308 + 0x28)
	st64(bt + 8, n)
	st64(bt, o)
	return r
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_a80(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s30 = fp - 0x30
	const f = memcmp(0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c, 0x20)
	let j = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	g = common_is_closed(b)
	j = undef
	if (g != 0) {
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	const h = ld64(b + 0x10)
	if (ld64(h + 0x10) != 0) {
		st64(s20, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		g = fn_13e628(s30, s20)
		const k = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, k)
		return g
	}
	st64(h + 0x10, -1)
	const i = ld64(h + 0x18)
	st64(s20 + 8, ld64(h + 0x20))
	st64(s20, i)
	st64(s20 + 0x10, 0)
	g = fn_13e070(s20, 0x1001592c8, 8)
	if (g == 0) {
		j = ld64(h + 0x10) + 1
		st64(h + 0x10, j)
		st64(a + 8, j)
		st64(a, 2)
		return g
	}
	st64(s8, g)
	fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s8, 0x10015f6c8, 0x10015f6e8)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_b4e0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let l, r, s, t: u64
	const f = memcmp(c, d, 0x20)
	let p = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, p)
		st64(a, 2)
		return g
	}
	const h = ld64(b)
	g = common_is_closed(h)
	p = undef
	if (g != 0) {
		st64(a + 8, p)
		st64(a, 2)
		return g
	}
	const i = ld64(h + 0x10)
	if (ld64(i + 0x10) != 0) {
		st64(s28, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		g = fn_13e628(s38, s28)
		const v = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, v)
		return g
	}
	B26: {
		st64(i + 0x10, -1)
		const j = ld64(i + 0x18)
		st64(s28 + 8, ld64(i + 0x20))
		st64(s28, j)
		st64(s28 + 0x10, 0)
		g = fn_13e070(s28, 0x100159318, 8)
		if (g == 0) {
			g = fn_13e070(s28, b + 0x118, 1)
			if (g == 0) {
				g = fn_13e070(s28, b + 8, 0x20)
				if (g == 0) {
					g = fn_13e070(s28, b + 0x28, 0x20)
					if (g == 0) {
						st32(s10, ld32(b + 0x110))
						g = fn_13e070(s28, s10, 4)
						if (g == 0) {
							st32(s10, ld32(b + 0x114))
							g = fn_13e070(s28, s10, 4)
							if (g == 0) {
								const m = ld64(b + 0x48)
								st64(s10 + 8, ld64(b + 0x50))
								st64(s10, m)
								g = fn_13e070(s28, s10, 0x10)
								if (g == 0) {
									const n = ld64(b + 0x58)
									st64(s10 + 8, ld64(b + 0x60))
									st64(s10, n)
									g = fn_13e070(s28, s10, 0x10)
									if (g == 0) {
										const o = ld64(b + 0x68)
										st64(s10 + 8, ld64(b + 0x70))
										st64(s10, o)
										g = fn_13e070(s28, s10, 0x10)
										if (g == 0) {
											st64(s10, ld64(b + 0x78))
											g = fn_13e070(s28, s10, 8)
											if (g == 0) {
												st64(s10, ld64(b + 0x80))
												g = fn_13e070(s28, s10, 8)
												if (g == 0) {
													g = fn_16008(b + 0x88, s28)
													if (g == 0) {
														st64(s10, ld64(b + 0xd0))
														g = fn_13e070(s28, s10, 8)
														if (g == 0) {
															g = fn_15a08(b + 0xd8, s28)
															if (g == 0) {
																p = ld64(i + 0x10) + 1
																st64(i + 0x10, p)
																st64(a + 8, p)
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
			const q = g
			if (2 > (g & 3) - 2) {
				break B26
			}
			if ((q & 3) == 0) {
				break B26
			}
			l = ld64(ld64(g + 7))
			if (l == 0) {
				break B26
			}
		} else {
			const k = g
			if (2 > (g & 3) - 2) {
				break B26
			}
			if ((k & 3) == 0) {
				break B26
			}
			l = ld64(ld64(g + 7))
			if (l == 0) {
				break B26
			}
		}
		callx(l, ld64(g - 1), l)
	}
	g = anchor_error_from(s48, 0xbbc /* anchor::AccountDidNotSerialize */, r, s, t)
	p = ld64(s48 + 8)
	const u = ld64(s48)
	st64(i + 0x10, ld64(i + 0x10) + 1)
	if (u == 2) {
		st64(a + 8, p)
		st64(a, 2)
		return g
	}
	st64(a + 8, p)
	st64(a, u)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
function fn_1476d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10
	if (b > b + 0x80) {
		fn_154730(0x100161eb0, b + 0x80, b, d, e)
	}
	__multi3_159030(s10, b + 0x80, 0, ld64(a), 0)
	const f = ld64(s10 + 8)
	if (f != 0) {
		fn_1547e0(0x100161ec8, f)
	}
	const g = __floatundidf(ld64(s10))
	const h = fn_158340(ld64(a + 8), g)
	const i = fn_159078(h, 0)
	const j = __fixunsdfdi(h)
	return (fn_156088(h, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (i as i64) ? 0 : j
}

function fn_8ed0(a: u64, b: AccountInfo): u64 {
	const s100 = fp - 0x100, s108 = fp - 0x108, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170
	let q, r: u64
	const f = b.owner
	if ((memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0) {
		r = anchor_error_from(s170, 0xbc4 /* anchor::AccountNotInitialized */)
		q = ld64(s170)
		st64(a + 0x10, ld64(s170 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s120, b, g as u32)
		const p = ld64(s120 + 0x10)
		const l = ld64(s120 + 8)
		const k = ld64(s120)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s130 + 8, ld64(l + 8))
			st64(s130, m)
			r = fn_10ebf8(s120, s130, 0x800000000000001a /* Ok */)
			const n = ld64(s120 + 0x10)
			const o = ld64(s120 + 8)
			if (ld64(s120) != 0) {
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, 0)
				st64(p, ld64(p) - 1)
				return r
			}
			r = memcpy(a + 0x18, s108, 0x108)
			st64(a + 0x10, n)
			st64(a + 8, o)
			st64(a, b)
			st64(p, ld64(p) - 1)
			return r
		}
		st64(s120, k, l, p)
		r = fn_13e628(s160, s120)
		q = ld64(s160)
		st64(a + 0x10, ld64(s160 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const j = anchor_error_from(s140, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	const i = ld64(s140 + 8)
	const h = ld64(s140)
	copyr(s120, f, 0x20)
	st64(s100, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
	r = Error_with_pubkeys(s150, h, i, s120, j)
	q = ld64(s150)
	st64(a + 0x10, ld64(s150 + 8))
	st64(a + 8, q)
	st64(a, 0)
	return r
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (points to it), e (value)
function fn_153158(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155b30(a, b, c, d, e)
}

function fn_f5d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, b, c, d, e)
}

function fn_132bd8(a: u64): u64 {
	return a != 0x163 ? a : 0x165
}

function fn_132070(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s18 = fp - 0x18, s3f = fp - 0x3f, s40 = fp - 0x40, s80 = fp - 0x80, sc0 = fp - 0xc0, s110 = fp - 0x110
	let g, h, i: u64
	if ((memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
	} else {
		const f = __rust_alloc(0x22, 1)
		if (f == 0) {
			alloc_handle_alloc_error(1, 0x22)
		}
		st64(f + 0x18, ld64(c + 0x18))
		st64(f + 0x10, ld64(c + 0x10))
		st64(f + 8, ld64(c + 8))
		st64(f, ld64(c))
		st16(f + 0x20, 0x100)
		st32(s110, 0x27)
		let j = fn_13c168(s40, d, f)
		if (ld8(s40) != 0) {
			g = ld64(s3f + 0x17)
			st64(s80 + 0x17, g)
			h = ld64(s3f + 0xf)
			st64(s80 + 0xf, h)
			i = ld64(s3f + 7)
			st64(s80 + 7, i)
			st64(a + 0x18, g)
			st64(a + 0x10, h)
			st64(a + 8, i)
			st64(a, 0x8000000000000000)
			fn_11e480(j)
		} else {
			copyr(s80, s3f, 0x20)
			j = fn_13c168(s40, e, j)
			if (ld8(s40) != 0) {
				g = ld64(s3f + 0x17)
				st64(s80 + 0x37, g)
				h = ld64(s3f + 0xf)
				st64(s80 + 0x2f, h)
				i = ld64(s3f + 7)
				st64(s80 + 0x27, i)
				st64(a + 0x18, g)
				st64(a + 0x10, h)
				st64(a + 8, i)
				st64(a, 0x8000000000000000)
				fn_11e480(j)
			} else {
				const k = ld64(s3f)
				st64(s80 + 0x20, k)
				st64(sc0 + 0x20, k)
				const l = ld64(s3f + 8)
				st64(s80 + 0x28, l)
				st64(sc0 + 0x28, l)
				const m = ld64(s3f + 0x10)
				st64(s80 + 0x30, m)
				st64(sc0 + 0x30, m)
				const n = ld64(s3f + 0x18)
				st64(s80 + 0x38, n)
				st64(sc0 + 0x38, n)
				copy(sc0, s80, 0x20)
				fn_1334b0(s18, s110)
				let p = ld64(s18)
				const o = ld64(s18 + 0x10)
				if (o == p) {
					RawVec_grow_one_131b28(s18, 0x1001610c0)
					p = ld64(s18)
				}
				let q = ld64(s18 + 8)
				st8(q + o, 0)
				let r = o + 1
				st64(s18 + 0x10, r)
				if (0x3f >= p - r) {
					reserve_do_reserve_and_handle_131e08(s18, r, 0x40, 1, 1)
					q = ld64(s18 + 8)
					r = ld64(s18 + 0x10)
				}
				memcpy(q + r, sc0, 0x40)
				st64(s18 + 0x10, r + 0x40)
				copy(a + 0x30, b, 0x20)
				st64(a + 8, f, 1)
				st64(a, 1)
				copy(a + 0x18, s18, 0x18)
			}
		}
	}
}

function fn_137528(a: u64, b: u64, c: u64, d: u64) {
	const s44 = fp - 0x44, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60, s68 = fp - 0x68, s70 = fp - 0x70
	let i = ld64(s70)
	let j = ld64(s68)
	let k = ld64(s60)
	let l = ld64(s58)
	if ((memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
	} else {
		let f = 0
		if (d != 0) {
			l = ld64(d + 0x18)
			k = ld64(d + 0x10)
			j = ld64(d + 8)
			i = ld64(d)
			f = 1
		}
		const h = f
		const g = __rust_alloc(0x22, 1)
		if (g == 0) {
			alloc_handle_alloc_error(1, 0x22)
		}
		st64(g + 0x18, ld64(c + 0x18))
		st64(g + 0x10, ld64(c + 0x10))
		st64(g + 8, ld64(c + 8))
		st64(g, ld64(c))
		st16(g + 0x20, 0x100)
		st64(s44, i, j, k, l)
		st32(s50 + 8, h)
		st32(s50, 0x19)
		fn_1334b0(a + 0x18, s50)
		st64(a + 0x48, ld64(b + 0x18))
		st64(a + 0x40, ld64(b + 0x10))
		st64(a + 0x38, ld64(b + 8))
		st64(a + 0x30, ld64(b))
		st64(a + 8, g, 1)
		st64(a, 1)
	}
}

function fn_142568(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1000 = fp - 0x1000
	st64(s1000, 8, 0)
	return invoke_signed(a, b, c, d, fp)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value)
// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: pool_state_data: PoolStateAccount
function fn_53e8(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58
	let g, k: u64
	if (ld8(b + 0x29) != 0) {
		const f = ld64(b + 0x10)
		if (ld64(f + 0x10) == 0) {
			st64(f + 0x10, -1)
			const h = ld64(f + 0x20)
			if (8 > h) {
				r0 = anchor_error_from(s58, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
				k = ld64(s58 + 8)
				st64(a + 8, ld64(s58))
				st64(a + 0x10, k)
				st64(a, 1)
				st64(f + 0x10, ld64(f + 0x10) + 1)
				return r0
			}
			const pool_state_data: PoolStateAccount = ld64(f + 0x18)
			const j = pool_state_data.discriminator
			if (j == 0x46dec3d7f5e3edf7 /* account:PoolState */) {
				if (h > 0x607) {
					st64(a + 0x10, f + 0x10)
					st64(a + 8, pool_state_data.bump)
					st64(a, 0)
					return r0
				}
				fn_153158(0x608, h, 0x10015f718, 0x46dec3d7f5e3edf7 /* account:PoolState */, e)
			}
			r0 = anchor_error_from(s48, 0xbba /* anchor::AccountDiscriminatorMismatch */, j, 0x46dec3d7f5e3edf7 /* account:PoolState */, e)
			k = ld64(s48 + 8)
			st64(a + 8, ld64(s48))
			st64(a + 0x10, k)
			st64(a, 1)
			st64(f + 0x10, ld64(f + 0x10) + 1)
			return r0
		}
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		r0 = fn_13e628(s38, s18)
		g = ld64(s38)
		st64(a + 0x10, ld64(s38 + 8))
		st64(a + 8, g)
		st64(a, 1)
		return r0
	}
	r0 = anchor_error_from(s28, 0xbbe /* anchor::AccountNotMutable */, c, d, e)
	g = ld64(s28)
	st64(a + 0x10, ld64(s28 + 8))
	st64(a + 8, g)
	st64(a, 1)
	return r0
}

function fn_75fc8(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128
	if ((c as i32) > (b as i32)) {
		st64(a + 8, d)
		st64(a, 2)
		return r0
	}
	fn_85138(s78, 0x100159844)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x100159844, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a7af)
	st32(sf8 + 0x78, 0x1775 /* error::TickInvalidOrder */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0x30b)
	st64(s118 + 0x10, 0x25)
	st64(s118, 0)
	r0 = fn_13e5a0(s128, s118)
	const f = ld64(s128)
	st64(a + 8, ld64(s128 + 8))
	st64(a, f)
	return r0
}

function fn_756a8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s180 = fp - 0x180, s188 = fp - 0x188
	let g, k: u64
	if ((c as i32) > -0x6c4f5) {
		if (0x6c4f5 > (c as i32)) {
			st64(s180, b)
			if ((d as u16) == 0) {
				fn_154940(0x100160470, b, c, d as u16, e)
			}
			st64(s188, c)
			const f = fn_158b50(c as i32, d as u16)
			if (f != 0) {
				ErrorCode_name(s78, 0x1001598b8)
				st64(s60, 0, 1, 0)
				st64(s28, s60, 0x10015f818)
				st8(s28 + 0x18, 3)
				st64(s28 + 0x10, 0x20)
				st64(s48 + 0x10, 0)
				st64(s48, 0)
				if (ErrorCode_fmt(0x1001598b8, s48) != 0) {
					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
				}
				copy(sf8, s78, 0x30)
				st64(s118 + 8, 0x10015a7af)
				st32(sf8 + 0x78, 0x9c5 /* anchor::RequireEqViolated */)
				st8(sf8 + 0x30, 2)
				st32(s118 + 0x18, 0x302)
				st64(s118 + 0x10, 0x25)
				st64(s118, 0)
				fn_13e5a0(s148, s118)
				g = fn_3158(s158, ld64(s148), ld64(s148 + 8), 0, f)
				k = ld64(s158)
				st64(a + 8, ld64(s158 + 8))
				st64(a, k)
				return g
			}
			g = fn_1561f0(c as i32, (d as u16) * 0x3c)
			let h = g
			if (0 > (c as i32) && (-ld64(s188) as u32) % ((d as u16) * 0x3c) != 0) {
				h = h - 1
			}
			const i = (h as i32) * ((d as u16) * 0x3c)
			const j = ld64(s180)
			if ((i as i32) != i) {
				fn_1547e0(0x1001603e0, j)
			}
			if ((i as u32) == (j as u32)) {
				st64(a + 8, j)
				st64(a, 2)
				return g
			}
			ErrorCode_name(s78, 0x1001598b8, j as u32, i as u32)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x1001598b8, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copy(sf8, s78, 0x30)
			st64(s118 + 8, 0x10015a7af)
			st32(sf8 + 0x78, 0x9c5 /* anchor::RequireEqViolated */)
			st8(sf8 + 0x30, 2)
			st32(s118 + 0x18, 0x304)
			st64(s118 + 0x10, 0x25)
			st64(s118, 0)
			fn_13e5a0(s168, s118)
			g = fn_3158(s178, ld64(s168), ld64(s168 + 8), ld64(s180), i)
			k = ld64(s178)
			st64(a + 8, ld64(s178 + 8))
			st64(a, k)
			return g
		}
		fn_85138(s78, 0x10015983c)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_88558(0x10015983c, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(sf8, s78, 0x30)
		st64(s118 + 8, 0x10015a7af)
		st32(sf8 + 0x78, 0x1777 /* error::TickUpperOverflow */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x2fe)
		st64(s118 + 0x10, 0x25)
		st64(s118, 0)
		g = fn_13e5a0(s138, s118)
		k = ld64(s138)
		st64(a + 8, ld64(s138 + 8))
		st64(a, k)
		return g
	}
	fn_85138(s78, 0x1001598b4)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x1001598b4, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a7af)
	st32(sf8 + 0x78, 0x1776 /* error::TickLowerOverflow */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0x2fa)
	st64(s118 + 0x10, 0x25)
	st64(s118, 0)
	g = fn_13e5a0(s128, s118)
	k = ld64(s128)
	st64(a + 8, ld64(s128 + 8))
	st64(a, k)
	return g
}

function fn_70108(a: u64, b: u64, c: AccountInfo, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s30 = fp - 0x30, s38 = fp - 0x38, s48 = fp - 0x48, s49 = fp - 0x49, s50 = fp - 0x50, s70 = fp - 0x70, s90 = fp - 0x90, sf8 = fp - 0xf8, s110 = fp - 0x110, s118 = fp - 0x118, s120 = fp - 0x120, s130 = fp - 0x130, s150 = fp - 0x150, s170 = fp - 0x170, s190 = fp - 0x190, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s208 = fp - 0x208, s210 = fp - 0x210, s218 = fp - 0x218, s220 = fp - 0x220, s228 = fp - 0x228
	let i, j, m, z, be: u64
	B5: {
		B3: {
			st64(s208 + 0x18, a)
			const g = ld64(e - 0xff0)
			st64(s210, ld64(e - 0x1000))
			const f = ld64(e - 0xff8)
			st64(s208, g, d, b)
			if (0xfff27617 > ((f - 0x6c4f5) as u32)) {
				if ((f as i32) > 0x6c4f4) {
					break B3
				}
				const t = ld64(s208)
				if ((t as u16) == 0) {
					fn_1548e8(0x1001603b0, t as u16, g, d, e)
				}
				let u = 0x6c4f4 / ((t as u16) * 0x3c)
				let w = -u
				const v = (u * ((t as u16) * 0x3c)) as u32
				if (v != 0x6c4f4) {
					u = ~u
					w = u
				}
				const x = w * ((t as u16) * 0x3c)
				if ((x as i32) != x) {
					fn_1547e0(0x1001603e0, x as i32, u, v, e)
				}
				if ((x as u32) != (f as u32)) {
					break B3
				}
			} else {
				if ((g as u16) == 0) {
					fn_154940(0x1001603f8, g as u16, g, d, e)
				}
				if (fn_158b50(f as i32, (g as u16) * 0x3c) != 0) {
					break B3
				}
			}
			B27: {
				const y = memcmp(c.owner, 0x100159560, 0x20)
				st64(s218, y)
				if ((y as u32) == 0) {
					const aj = ld64(s210)
					copyr(s70, aj, 0x20)
					st64(s110, s90)
					st64(s120, s70)
					st64(s150, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */, 0x10015a23e)
					st32(s90, bswap32(f))
					st64(s110 + 8, 4)
					st64(s118, 0x20)
					st64(s130 + 8, 0xa)
					// PDA find_program_address(["tick_array", *aj, u32 bswap32(f)], program *s150)
					Pubkey_find_program_address(s48, s130, 3, s150)
					copyr(s170, s48, 0x20)
					st64(s220, ld8(s28))
					const ak = c.key
					copyr(s130, ak, 0x20)
					if ((memcmp(s170, s130, 0x20) as u32) == 0) {
						copyr(s90, s150, 0x20)
						const ap: LamportsCell = c.lamports
						rc_inc(ap)
						const aq: DataCell = c.data
						rc_inc(aq)
						st64(s228, c.owner)
						const au = c.rent_epoch
						const at = c.is_signer
						const ar = c.is_writable
						st8(s20 + 2, c.executable)
						st8(s20, at, ar)
						st64(s28, au)
						st64(s30, ld64(s228))
						st64(s48, ak, ap, aq)
						const av = ld64(s210)
						copyr(s70, av, 0x20)
						st32(s50, bswap32(f))
						st64(s110 + 0x10, s49)
						st64(s110, s50)
						st64(s120, s70)
						st64(s130, 0x10015a23e)
						st8(s49, ld64(s220))
						st64(sf8, 1)
						st64(s110 + 8, 4)
						st64(s118, 0x20)
						st64(s130 + 8, 0xa)
						m = fn_82dd0(s1c8, s90, ld64(s208 + 0x10), ld64(s208 + 8), s48, s130, 4, 0x2800)
						const aw = ld64(s1c8)
						if (aw == 2) {
							m = fn_84740(s130, c)
							i = ld64(s130 + 8)
							j = ld64(s130)
							const ax = ld8(s110 + 0xa)
							if (ax == 2) {
								const bh = ld64(s208 + 0x18)
								st64(bh + 8, i)
								st64(bh, j)
								st8(bh + 0x2a, 2)
							} else {
								st16(s20, ld16(s110 + 8))
								copyr(s30, s118, 0x10)
								st32(s20 + 3, ld32(s110 + 0xb))
								st8(s20 + 7, ld8(s110 + 0xf))
								st64(s220, ax)
								st8(s20 + 2, ax)
								st64(s48, j, i)
								const ay = ld64(s120)
								st64(s38, ay)
								m = fn_849c0(s130, ay, ld8(s20 + 1), undef, undef, m)
								const ba = ld64(s120)
								const bb = ld64(s130 + 8)
								if (ld64(s130) != 0) {
									const az = ld64(s208 + 0x18)
									st64(az + 8, ba)
									st64(az, bb)
									st8(az + 0x2a, 2)
								} else {
									st64(s228, ba)
									m = fn_71530(s1d8, bb, f, ld64(s208), ld64(s210))
									const bi = ld64(s1d8)
									if (bi == 2) {
										const bj = ld64(s228)
										st64(bj, ld64(bj) + 1)
										st16(s190 + 0x18, ld16(s20))
										copyr(s190, s38, 0x18)
										st32(s1a8 + 0x10, ld32(s20 + 3))
										st8(s1a8 + 0x14, ld8(s20 + 7))
										z = ld64(s220)
										break B27
									}
									const bl = ld64(s1d8 + 8)
									const bk = ld64(s208 + 0x18)
									st64(bk, bi, bl)
									st8(bk + 0x2a, 2)
									const bm = ld64(s228)
									st64(bm, ld64(bm) + 1)
								}
								m = ptr_drop_in_place_f5e8(s48, m)
							}
						} else {
							const bg = ld64(s1c8 + 8)
							const bf = ld64(s208 + 0x18)
							st64(bf, aw, bg)
							st8(bf + 0x2a, 2)
						}
						be = c + 0x10
						const bn: LamportsCell = c.lamports
						if (rc_release(bn)) {
							m = Rc_drop_slow_14df0(c + 8, m)
						}
						const bo = ld64(be)
						if (rc_release(bo)) {
							return Rc_drop_slow_14df0(be, m)
						}
						return m
					}
					ErrorCode_name(s90, 0x100159874)
					st64(s70, 0, 1, 0)
					st64(s28, s70, 0x10015f818)
					st8(s20 + 0x10, 3)
					st64(s20 + 8, 0x20)
					st64(s38, 0)
					st64(s48, 0)
					if (ErrorCode_fmt(0x100159874, s48) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
					}
					copyr(sf8, s70, 0x18)
					copy(s110, s90, 0x18)
					st64(s130 + 8, 0x10015a7af)
					st32(sf8 + 0x60, 0x9c6 /* anchor::RequireKeysEqViolated */)
					st8(sf8 + 0x18, 2)
					st32(s118, 0x4d)
					st64(s120, 0x25)
					st64(s130, 0)
					const ao = fn_13e5a0(s1a8, s130)
					const an = ld64(s1a8 + 8)
					const am = ld64(s1a8)
					const al = c.key
					copyr(s110, al, 0x20)
					copy(s130, s170, 0x20)
					m = Error_with_pubkeys(s1b8, am, an, s130, ao)
					i = ld64(s1b8 + 8)
					j = ld64(s1b8)
					break B5
				}
				m = fn_84360(s130, c)
				i = ld64(s130 + 8)
				j = ld64(s130)
				z = ld8(s110 + 0xa)
				if (z == 2) {
					break B5
				}
				st16(s190 + 0x18, ld16(s110 + 8))
				copyr(s190, s120, 0x18)
				st32(s1a8 + 0x10, ld32(s110 + 0xb))
				st8(s1a8 + 0x14, ld8(s110 + 0xf))
			}
			const aa = ld64(s208 + 0x18)
			st64(aa + 8, i)
			st64(aa, j)
			copy(aa + 0x10, s190, 0x18)
			st16(aa + 0x28, ld16(s190 + 0x18))
			st8(aa + 0x2a, z)
			st32(aa + 0x2b, ld32(s1a8 + 0x10))
			st8(aa + 0x2f, ld8(s1a8 + 0x14))
			if ((ld64(s218) as u32) == 0) {
				const bc: LamportsCell = c.lamports
				if (rc_release(bc)) {
					m = Rc_drop_slow_14df0(c + 8, m)
				}
				const bd: DataCell = c.data
				be = c + 0x10
				if (!rc_release(bd)) {
					return m
				}
				return Rc_drop_slow_14df0(be, m)
			}
			const ab = ld64(s208 + 8)
			const ac = ld64(ab + 8)
			if (rc_release(ac)) {
				m = Rc_drop_slow_14df0(ab + 8, m)
			}
			const ad = ld64(ab + 0x10)
			const ag = ld64(s208 + 0x10)
			if (rc_release(ad)) {
				m = Rc_drop_slow_14df0(ab + 0x10, m)
			}
			const ae: LamportsCell = c.lamports
			if (rc_release(ae)) {
				m = Rc_drop_slow_14df0(c + 8, m)
			}
			const af: DataCell = c.data
			if (rc_release(af)) {
				m = Rc_drop_slow_14df0(c + 0x10, m)
			}
			const ah = ld64(ag + 8)
			if (rc_release(ah)) {
				m = Rc_drop_slow_14df0(ag + 8, m)
			}
			const ai = ld64(ag + 0x10)
			be = ag + 0x10
			if (rc_release(ai)) {
				return Rc_drop_slow_14df0(be, m)
			}
			return m
		}
		fn_85138(s90, 0x100159838)
		st64(s70, 0, 1, 0)
		st64(s28, s70, 0x10015f818)
		st8(s20 + 0x10, 3)
		st64(s20 + 8, 0x20)
		st64(s38, 0)
		st64(s48, 0)
		if (fn_88558(0x100159838, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(sf8, s70, 0x18)
		copy(s110, s90, 0x18)
		st64(s130 + 8, 0x10015a7af)
		st32(sf8 + 0x60, 0x1774 /* error::InvalidTickIndex */)
		st8(sf8 + 0x18, 2)
		st32(s118, 0x3f)
		st64(s120, 0x25)
		st64(s130, 0)
		m = fn_13e5a0(s1e8, s130)
		i = ld64(s1e8 + 8)
		j = ld64(s1e8)
	}
	const h = ld64(s208 + 0x18)
	st64(h + 8, i)
	st64(h, j)
	st8(h + 0x2a, 2)
	const k = ld64(s208 + 8)
	const l = ld64(k + 8)
	if (rc_release(l)) {
		m = Rc_drop_slow_14df0(k + 8, m)
	}
	const n = ld64(k + 0x10)
	const q = ld64(s208 + 0x10)
	if (rc_release(n)) {
		m = Rc_drop_slow_14df0(k + 0x10, m)
	}
	const o: LamportsCell = c.lamports
	if (rc_release(o)) {
		m = Rc_drop_slow_14df0(c + 8, m)
	}
	const p: DataCell = c.data
	if (rc_release(p)) {
		m = Rc_drop_slow_14df0(c + 0x10, m)
	}
	const r = ld64(q + 8)
	if (rc_release(r)) {
		m = Rc_drop_slow_14df0(q + 8, m)
	}
	const s = ld64(q + 0x10)
	be = q + 0x10
	if (rc_release(s)) {
		return Rc_drop_slow_14df0(be, m)
	}
	return m
}

function fn_6f618(a: u64, b: u64): u64 {
	const s18 = fp - 0x18
	let g, i, j, k: u64
	const f = ld16(a + 0xe3)
	if (f > 0xe) {
		g = 0x6c4f4 / (f * 0x3c)
		k = g * (f * 0x3c)
		j = k as i32
		if (j != k) {
			fn_1547e0(0x1001603e0, b, g, k, j)
		}
		const q = (k as i32) + f * 0x3c
		i = q
		if ((q as i32) != q) {
			fn_154730(0x100160278, b, g, k, q as i32)
		}
		const r = (k as u32) != 0x6c4f4 ? ~g : -g
		k = f * 0x3c
		j = r * k
		g = j as i32
		if (g != j) {
			fn_1547e0(0x1001603e0, b, g, k, j)
		}
	} else {
		k = f * 0x3c
		g = f * 0x7800
		i = g
		j = -g
	}
	const h = ld64(b + 0x10)
	if (f == 0) {
		st64(s18 + 0x10, 0)
		if (h == 0) {
			return ld64(s18 + 0x10) & 1
		}
		fn_1548e8(0x1001603b0, b, g, k, j)
	}
	let m = ld64(b + 8)
	let n = h << 2
	st64(s18, i as i32, j as i32)
	while (true) {
		st64(s18 + 0x10, n != 0)
		if (n == 0) {
			return ld64(s18 + 0x10) & 1
		}
		const o = ld32(m)
		let p = fn_1561f0(o as i32, k)
		b = undef
		g = undef
		if (0 > (o as i32) && (-(o as i32) as u32) % k != 0) {
			p = (p as i32) - 1
			if ((p as i32) != p) {
				fn_154788(0x1001603c8, b, g, k)
			}
		}
		const l = (p as i32) * k
		j = ld64(s18 + 8)
		if ((l as i32) != l) {
			fn_1547e0(0x1001603e0, b, g, k, j)
		}
		if ((l as i32) >= (ld64(s18) as i64)) {
			return ld64(s18 + 0x10) & 1
		}
		m = m + 4
		n = n - 4
		if ((j as i64) > (l as i32)) {
			return ld64(s18 + 0x10) & 1
		}
	}
}

// not included (size budget), see shared.ts:
declare function fn_84360(a: u64, b: AccountInfo): u64
declare function fn_76200(a: u64, b: u64): u64
declare function fn_1e428(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64, p13: u64, p14: u64, p15: u64, p16: u64, p17: u64, p18: u64, p19: u64, p20: u64): u64
declare function fn_84298(a: u64): u64
declare function fn_10f370(a: u64, b: u64)
declare function log_data(a: u64, b: u64): u64
declare function fn_22e28(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64, p13: u64, p14: u64, p15: u64): u64
declare function fn_14ec98(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_14ec00(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_13e070(a: u64, b: u64, c: u64): u64
declare function fn_15a08(a: u64, b: u64): u64
declare function fn_158340(a: u64, b: u64): u64
declare function fn_159078(a: u64, b: u64): u64
declare function fn_156088(a: u64, b: u64): u64
declare function fn_154730(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_1547e0(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_10ebf8(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_155b30(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_11e480(r0: u64): u64
declare function fn_158b50(a: u64, b: u64): u64
declare function fn_3158(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_154940(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_1548e8(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_82dd0(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: LamportsCell): u64
declare function fn_84740(a: u64, b: AccountInfo): u64
declare function fn_849c0(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64
declare function fn_71530(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_154788(a: u64, b: u64, c: u64, d: u64, e: u64): never
