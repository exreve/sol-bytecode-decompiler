// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction open_position: handler + 35 reachable functions
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
interface TokenAccount_2 extends sized<0xb8> { // Account<TokenAccount> (anchor_spl, SPL Token Account) as unpacked in memory (fields [known: spl_token::state layout] at the offsets a run of fn_7600 put them [offsets from exec]; info = the &AccountInfo)
	info:             at<0x00, ref<AccountInfo>> // &AccountInfo
	mint:             at<0x08, Pubkey>
	owner:            at<0x28, Pubkey>
	amount:           at<0x48, u64>
	delegate:         at<0x54, Pubkey> // COption<Pubkey>
	is_native:        at<0x80, u64> // COption<u64>
	delegated_amount: at<0x88, u64>
	close_authority:  at<0x94, Pubkey> // COption<Pubkey>
}
interface OpenPositionAccounts { // Accounts struct of instruction open_position as accounts_open_position returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	payer:           at<0x00, ref<AccountInfo>>
	pool_state:      at<0x28, ref<AccountInfo>> // the &AccountInfo of an account of type PoolState (e.g. AccountLoader<PoolState>: data not deserialized)
	token_account_0: at<0x50, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	token_account_1: at<0x58, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	token_vault_0:   at<0x60, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	token_vault_1:   at<0x68, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
}
interface OpenPositionContext { // anchor_lang Context of instruction open_position (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<OpenPositionAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface OpenPositionArgs extends sized<0x30> { // arguments of instruction open_position (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	tick_lower_index:             at<0x00, u32>
	tick_upper_index:             at<0x04, u32>
	tick_array_lower_start_index: at<0x08, u32>
	tick_array_upper_start_index: at<0x0c, u32>
	liquidity:                    at<0x10, u128>
	amount_0_max:                 at<0x20, u64>
	amount_1_max:                 at<0x28, u64>
}
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_log_data(slices: u64, len: u64): void // log base64 data: slices = &[&[u8]]
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function fn_11e0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function fn_7600(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses try_accounts_182b0, alloc_handle_alloc_error, memcpy
declare function Account_try_from_unchecked(a: u64, b: u64): u64 // lib anchor_lang::accounts::account::Account<T>::try_from_unchecked
declare function Account_try_from(a: u64, b: u64): u64 // lib anchor_lang::accounts::account::Account<T>::try_from
declare function fn_a1d8(a: u64, b: u64, c: u64, d: u64): u64 // lib uses memcmp, common_is_closed
declare function AccountInfo_clone_f338(a: u64, b: u64): u64 // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function ptr_drop_in_place_f5e8(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<solana_account_info::AccountInfo>
declare function ptr_drop_in_place_fcd8(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<solana_account_info::AccountInfo>
declare function Rc_drop_slow_14df0(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function fn_16008(a: u64, b: u64): u64 // lib
declare function try_accounts_17a30(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_17ae0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_18870(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_18aa0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_18f40(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_19190(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function associated_token_create(a: u64, b: u64): u64 // lib anchor_spl::associated_token::create
declare function fn_12b0f8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcpy, Rc_drop_slow_125dd0, Rc_drop_slow_125e20
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function Error_with_pubkeys(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib anchor_lang::error::Error::with_pubkeys
declare function system_program_assign_13fb30(a: u64, b: u64, c: u64): u64 // lib anchor_lang::system_program::assign
declare function system_program_assign_13ff40(a: u64, b: u64, c: u64): u64 // lib anchor_lang::system_program::assign
declare function system_program_create_account(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib anchor_lang::system_program::create_account
declare function system_program_transfer(a: u64, b: u64, c: u64): u64 // lib anchor_lang::system_program::transfer
declare function ErrorCode_name(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib anchor_lang::error::ErrorCode::name
declare function ErrorCode_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::error::ErrorCode as core::fmt::Display>::fmt
declare function clock_get(a: u64): u64 // lib solana_sysvar::clock::<impl solana_sysvar::Sysvar for solana_clock::Clock>::get
declare function rent_get(a: u64): u64 // lib solana_sysvar::rent::<impl solana_sysvar::Sysvar for solana_rent::Rent>::get
declare function Rent_is_exempt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib solana_rent::Rent::is_exempt
declare function AccountInfo_try_data_len(a: u64, b: u64): void // lib solana_account_info::AccountInfo::try_data_len
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function de_unexpected_eof_to_unexpected_length_of_input(a: u64): u64 // lib borsh::de::unexpected_eof_to_unexpected_length_of_input
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fmt_write(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::write
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function fn_1561f0(a: u64, b: u64): u64 // lib
declare function mul_mul(a: u64, b: u64): u64 // lib compiler_builtins::float::mul::mul
declare function __floatundidf(a: u64): u64 // lib __floatundidf
declare function __fixunsdfdi(a: u64): u64 // lib __fixunsdfdi
declare function __multi3_159030(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __multi3

// instruction handler: open_position (discriminator sha256("global:open_position")[..8] = 0x31f0980f4d2f8087)
// accounts [idl]: 0 payer [signer, mut], 1 position_nft_owner, 2 position_nft_mint [signer, mut], 3 position_nft_account [mut, pda], 4 metadata_account [mut], 5 pool_state [mut], 6 protocol_position, 7 tick_array_lower [mut, pda], 8 tick_array_upper [mut, pda], 9 personal_position [mut, pda], 10 token_account_0 [mut], 11 token_account_1 [mut], 12 token_vault_0 [mut], 13 token_vault_1 [mut], 14 rent [= SysvarRent111111111111111111111111111111111], 15 system_program [= 11111111111111111111111111111111], 16 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 17 associated_token_program [= ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL], 18 metadata_program [= metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s]
// args [idl]: tick_lower_index: i32, tick_upper_index: i32, tick_array_lower_start_index: i32, tick_array_upper_start_index: i32, liquidity: u128, amount_0_max: u64, amount_1_max: u64
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, tick_lower_index, tick_upper_index, tick_array_lower_start_index, tick_array_upper_start_index, amount_0_max, amount_1_max
function ix_open_position(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s98 = fp - 0x98, sa0 = fp - 0xa0, sb0 = fp - 0xb0, s148 = fp - 0x148, s160 = fp - 0x160, s170 = fp - 0x170, s173 = fp - 0x173, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1000 = fp - 0x1000
	let k, n: u64
	const h = sol_log("Instruction: OpenPosition", 0x19)
	const f = ix_args_len
	if (f >= 4 && ((f & -4) != 4 && ((f & -4) != 8 && ((f & -4) != 0xc && ((f & -0x10) != 0x10 && ((f & -8) != 0x20 && (f & -8) != 0x28)))))) {
		const args: OpenPositionArgs = ix_args
		const tick_lower_index = args.tick_lower_index
		const tick_upper_index = args.tick_upper_index
		const tick_array_lower_start_index = args.tick_array_lower_start_index
		const tick_array_upper_start_index = args.tick_array_upper_start_index
		const v = ld64(args.liquidity + 8)
		const u = ld64(args.liquidity)
		const amount_0_max = args.amount_0_max
		const amount_1_max = args.amount_1_max
		st8(s173 + 2, 0xff)
		st16(s173, 0xffff)
		st64(s170, accounts, accounts_len)
		st64(s1000, f, s173)
		n = accounts_open_position(sb0, program_id, s170, args, fp, h)
		const j = ld64(sa0)
		k = ld64(sb0 + 8)
		const i = ld64(sb0)
		if (i == 0) {
			st64(a + 8, j)
			st64(a, k)
			return n
		}
		memcpy(s148, s98, 0x98)
		st64(s160, i, k, j)
		st16(s98 + 8, ld16(s173))
		st8(s98 + 0xa, ld8(s173 + 2))
		copyr(sa0, s170, 0x10)
		st64(sb0, program_id, s160)
		st64(s1000, amount_0_max, amount_1_max, tick_lower_index, tick_upper_index, tick_array_lower_start_index, tick_array_upper_start_index, 1, 2)
		n = fn_1b850(s188, sb0, u, v, amount_0_max, amount_1_max, tick_lower_index, tick_upper_index, tick_array_lower_start_index, tick_array_upper_start_index, 1, 2)
		k = ld64(s188)
		if (k == 2) {
			n = fn_989f8(s198, s160, program_id)
			k = ld64(s198)
			st64(a + 8, ld64(s198 + 8))
			st64(a, k)
			return n
		}
		st64(a + 8, ld64(s188 + 8))
		st64(a, k)
		return n
	}
	const l = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (l & 3) - 2) {
		n = anchor_error_from(s1a8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s1a8)
		st64(a + 8, ld64(s1a8 + 8))
		st64(a, k)
		return n
	}
	if ((l & 3) == 0) {
		n = anchor_error_from(s1a8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s1a8)
		st64(a + 8, ld64(s1a8 + 8))
		st64(a, k)
		return n
	}
	const m = ld64(ld64(l + 7))
	if (m == 0) {
		n = anchor_error_from(s1a8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s1a8)
		st64(a + 8, ld64(s1a8 + 8))
		st64(a, k)
		return n
	}
	callx(m, ld64(l - 1), m)
	n = anchor_error_from(s1a8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	k = ld64(s1a8)
	st64(a + 8, ld64(s1a8 + 8))
	st64(a, k)
	return n
}

// Anchor Accounts::try_accounts of instruction open_position (called by ix_open_position; name [str]: from the handler's "Instruction: …" log; was fn_91098)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: pool_state (ConstraintMut), protocol_position (AccountNotEnoughKeys), tick_array_lower (ConstraintSeeds, ConstraintMut), tick_array_upper (AccountNotEnoughKeys, ConstraintSeeds, ConstraintMut), token_account_0 (ConstraintMut), token_account_1 (ConstraintMut), token_vault_0 (ConstraintMut, ConstraintRaw), token_vault_1 (ConstraintRaw, ConstraintMut), rent, system_program, token_program, associated_token_program, metadata_program, metadata_account (ConstraintMut), payer (ConstraintMut), personal_position (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), position_nft_account (ConstraintMut, ConstraintRentExempt), position_nft_mint (ConstraintMut, ConstraintSigner, ConstraintRentExempt)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: token_vault_1_box, token_vault_0_box, token_vault_1_box_2, payer [idl], position_nft_mint [idl], position_nft_account [idl], personal_position [idl], token_vault_0, token_vault_1
function accounts_open_position(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s60 = fp - 0x60, s64 = fp - 0x64, s88 = fp - 0x88, sa8 = fp - 0xa8, sc8 = fp - 0xc8, se8 = fp - 0xe8, s108 = fp - 0x108, s138 = fp - 0x138, s158 = fp - 0x158, s159 = fp - 0x159, s180 = fp - 0x180, s198 = fp - 0x198, s1b0 = fp - 0x1b0, s1c8 = fp - 0x1c8, s1e0 = fp - 0x1e0, s1f8 = fp - 0x1f8, s210 = fp - 0x210, s218 = fp - 0x218, s220 = fp - 0x220, s228 = fp - 0x228, s230 = fp - 0x230, s238 = fp - 0x238, s240 = fp - 0x240, s248 = fp - 0x248, s250 = fp - 0x250, s258 = fp - 0x258, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s510 = fp - 0x510, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s560 = fp - 0x560, s570 = fp - 0x570, s580 = fp - 0x580, s590 = fp - 0x590, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s700 = fp - 0x700, s710 = fp - 0x710, s790 = fp - 0x790, s798 = fp - 0x798, s7a0 = fp - 0x7a0, s7a8 = fp - 0x7a8, s7b0 = fp - 0x7b0, s7b8 = fp - 0x7b8, s7c0 = fp - 0x7c0, s7c8 = fp - 0x7c8, s7d0 = fp - 0x7d0
	let j, k, n, o, u, aa, ab, ac, ae, af, am, an, ap, aq, at, au, aw, ax, bc, bd, bf, bg, bi, bj, cf, cg: u64
	let token_vault_1_box: TokenAccount_2
	st64(s260, b)
	const f = ld64(e - 0x1000)
	if (f >= 4) {
		const ca = ld64(e - 0xff8)
		if ((f & -4) > 0xc || ((1 << (f & -4 & 0x3f)) & 0x1110) == 0) {
			st64(s790 + 0x78, ld32(d + 0xc))
			st64(s790 + 0x70, ld32(d + 8))
			k = try_accounts_17a30(s40, c, c, d, e, r0)
			const payer: AccountInfo = ld64(s38)
			j = ld64(s40)
			if (j == 2) {
				st64(s258, payer)
				const m = ld64(c + 8)
				if (m != 0) {
					u = ld64(c)
					st64(c, u + 0x30, m - 1)
					st64(s250, u)
					if (m == 1) {
						k = anchor_error_from(s700, 0xbbd /* anchor::AccountNotEnoughKeys */, n, o, u)
						j = ld64(s700)
						st64(a + 0x10, ld64(s700 + 8))
						st64(a + 8, j)
						st64(a, 0)
						return k
					}
					const v: AccountInfo = ld64(c)
					st64(s248, v)
					let w = m - 2
					st64(c + 8, w)
					st64(c, v + 0x30)
					if (w != 0) {
						st64(s790 + 0x68, u)
						st64(s240, v + 0x30)
						let x = m - 3
						st64(c + 8, x)
						k = v + 0x60
						st64(c, k)
						if (x == 0) {
							anchor_error_from(s270, 0xbbd /* anchor::AccountNotEnoughKeys */, x, w, u)
							x = undef
							w = undef
							u = undef
							k = ld64(s270 + 8)
							j = ld64(s270)
							if (j != 2) {
								const ag = ld64(0x300000000 /* heap bump-allocator cursor */)
								const ah = ag != 0 ? sat_sub(ag, 0x10) : 0x300007ff0
								if ((j & 1) != 0) {
									if (0x300000008 > ah) {
										raw_vec_handle_error(1, 0x10, 0x10015f8f8, sat_sub(ag, 0x10), 0x10 > ag)
									}
									st64(0x300000000 /* heap bump-allocator cursor */, ah)
									st64(ah + 8, 0x746e756f6363615f)
									st64(ah, 0x617461646174656d)
									void ld64(k)
								} else {
									if (0x300000008 > ah) {
										raw_vec_handle_error(1, 0x10, 0x10015f8f8, sat_sub(ag, 0x10), 0x10 > ag)
									}
									st64(0x300000000 /* heap bump-allocator cursor */, ah)
									st64(ah + 8, 0x746e756f6363615f)
									st64(ah, 0x617461646174656d)
									void ld64(k)
								}
								st64(k + 0x10, ah, 0x10)
								st64(k + 8, 0x10)
								st64(k, 1)
								st64(a + 0x10, k)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						} else {
							st64(c + 8, m - 4)
							st64(c, v + 0x90)
						}
						st64(s790 + 0x60, k)
						fn_11e0(s40, c, x, w, u)
						token_vault_1_box = ld64(s38)
						const y = ld64(s40)
						if (y != 2) {
							k = fn_4130(s280, y, token_vault_1_box, "pool_state", 0xa)
							token_vault_1_box = ld64(s280 + 8)
							j = ld64(s280)
							if (j != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						B50: {
							B47: {
								B34: {
									B31: {
										st64(s790 + 0x58, token_vault_1_box)
										st64(s238, token_vault_1_box)
										const z = ld64(c + 8)
										if (z == 0) {
											anchor_error_from(s290, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_1_box, ab, ac)
											token_vault_1_box = ld64(s290 + 8)
											const ai = ld64(s290)
											if (ai == 2) {
												break B31
											}
											k = fn_4130(s2a0, ai, token_vault_1_box, 0x10015aff1 /* "protocol_position" */, 0x11)
											token_vault_1_box = ld64(s2a0 + 8)
											j = ld64(s2a0)
											if (j != 2) {
												st64(a + 0x10, token_vault_1_box)
												st64(a + 8, j)
												st64(a, 0)
												return k
											}
											aa = ld64(c + 8)
											if (aa == 0) {
												break B31
											}
										} else {
											token_vault_1_box = ld64(c)
											st64(c, token_vault_1_box.owner + 8)
											aa = z - 1
											st64(c + 8, aa)
											if (aa == 0) {
												break B31
											}
										}
										st64(s790 + 0x50, token_vault_1_box)
										token_vault_1_box = ld64(c)
										st64(c, token_vault_1_box.owner + 8)
										ae = aa - 1
										st64(c + 8, ae)
										if (ae == 0) {
											break B47
										}
										break B34
									}
									st64(s790 + 0x50, token_vault_1_box)
									anchor_error_from(s2b0, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_1_box, ab, ac)
									token_vault_1_box = ld64(s2b0 + 8)
									const ad = ld64(s2b0)
									if (ad == 2) {
										break B47
									}
									k = fn_4130(s2c0, ad, token_vault_1_box, "tick_array_lower", 0x10)
									token_vault_1_box = ld64(s2c0 + 8)
									j = ld64(s2c0)
									if (j != 2) {
										st64(a + 0x10, token_vault_1_box)
										st64(a + 8, j)
										st64(a, 0)
										return k
									}
									ae = ld64(c + 8)
									if (ae == 0) {
										break B47
									}
								}
								st64(s790 + 0x48, token_vault_1_box)
								token_vault_1_box = ld64(c)
								st64(c, token_vault_1_box.owner + 8)
								af = ae - 1
								st64(c + 8, af)
								if (af == 0) {
									k = anchor_error_from(s6d0, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_1_box, ab, ac)
									j = ld64(s6d0)
									st64(a + 0x10, ld64(s6d0 + 8))
									st64(a + 8, j)
									st64(a, 0)
									return k
								}
								break B50
							}
							st64(s790 + 0x48, token_vault_1_box)
							anchor_error_from(s2d0, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_1_box, ab, ac)
							token_vault_1_box = undef
							const aj = ld64(s2d0)
							if (aj == 2) {
								k = anchor_error_from(s6d0, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_1_box, ab, ac)
								j = ld64(s6d0)
								st64(a + 0x10, ld64(s6d0 + 8))
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
							k = fn_4130(s2e0, aj, ld64(s2d0 + 8), "tick_array_upper", 0x10)
							token_vault_1_box = ld64(s2e0 + 8)
							j = ld64(s2e0)
							if (j != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
							af = ld64(c + 8)
							if (af == 0) {
								k = anchor_error_from(s6d0, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_1_box, ab, ac)
								j = ld64(s6d0)
								st64(a + 0x10, ld64(s6d0 + 8))
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						st64(s790 + 0x38, token_vault_1_box)
						const ak: AccountInfo = ld64(c)
						st64(s230, ak)
						st64(c + 8, af - 1)
						st64(s790 + 0x40, ak)
						st64(c, ak + 0x30)
						fn_7600(s40, c, token_vault_1_box, ab, ac)
						token_vault_1_box = ld64(s38)
						const al = ld64(s40)
						if (al != 2) {
							k = fn_4130(s2f0, al, token_vault_1_box, "token_account_0", 0xf)
							token_vault_1_box = ld64(s2f0 + 8)
							j = ld64(s2f0)
							if (j != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						st64(s790 + 0x30, token_vault_1_box)
						fn_7600(s40, c, token_vault_1_box, am, an)
						token_vault_1_box = ld64(s38)
						const ao = ld64(s40)
						if (ao != 2) {
							k = fn_4130(s300, ao, token_vault_1_box, "token_account_1", 0xf)
							token_vault_1_box = ld64(s300 + 8)
							j = ld64(s300)
							if (j != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						st64(s790 + 0x28, token_vault_1_box)
						fn_7600(s40, c, token_vault_1_box, ap, aq)
						token_vault_1_box = ld64(s38)
						const ar = ld64(s40)
						if (ar != 2) {
							k = fn_4130(s310, ar, token_vault_1_box, "token_vault_0", 0xd)
							token_vault_1_box = ld64(s310 + 8)
							j = ld64(s310)
							if (j != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						st64(s790 + 0x20, token_vault_1_box)
						fn_7600(s40, c, token_vault_1_box, at, au)
						token_vault_1_box = ld64(s38)
						const av = ld64(s40)
						if (av != 2) {
							k = fn_4130(s320, av, token_vault_1_box, "token_vault_1", 0xd)
							token_vault_1_box = ld64(s320 + 8)
							j = ld64(s320)
							if (j != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						st64(s790 + 0x18, token_vault_1_box)
						try_accounts_17ae0(s40, c, token_vault_1_box, aw, ax)
						const ba = ld64(s38 + 8)
						const az = ld64(s38)
						const ay = ld64(s40)
						if (ay == 0) {
							k = fn_4130(s6c0, az, ba, 0x1001598f8 /* "rent" */, 4)
							j = ld64(s6c0)
							st64(a + 0x10, ld64(s6c0 + 8))
							st64(a + 8, j)
							st64(a, 0)
							return k
						}
						st64(s790, ay, az, ba)
						st64(s798, ld64(s38 + 0x10))
						try_accounts_18870(s40, c, ba)
						token_vault_1_box = ld64(s38)
						const bb = ld64(s40)
						if (bb != 2) {
							k = fn_4130(s330, bb, token_vault_1_box, "system_program", 0xe)
							token_vault_1_box = ld64(s330 + 8)
							j = ld64(s330)
							if (j != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						st64(s7a0, token_vault_1_box)
						st64(s228, token_vault_1_box)
						try_accounts_19190(s40, c, token_vault_1_box, bc, bd)
						token_vault_1_box = ld64(s38)
						const be = ld64(s40)
						if (be != 2) {
							k = fn_4130(s340, be, token_vault_1_box, 0x10015b020 /* "token_program" */, 0xd)
							token_vault_1_box = ld64(s340 + 8)
							j = ld64(s340)
							if (j != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						st64(s7a8, token_vault_1_box)
						st64(s220, token_vault_1_box)
						try_accounts_18f40(s40, c, token_vault_1_box, bf, bg)
						token_vault_1_box = ld64(s38)
						const bh = ld64(s40)
						if (bh != 2) {
							k = fn_4130(s350, bh, token_vault_1_box, "associated_token_program", 0x18)
							token_vault_1_box = ld64(s350 + 8)
							j = ld64(s350)
							if (j != 2) {
								st64(a + 0x10, token_vault_1_box)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						st64(s7b0, token_vault_1_box)
						st64(s218, token_vault_1_box)
						try_accounts_18aa0(s40, c, token_vault_1_box, bi, bj)
						let bl = ld64(s38)
						const bk = ld64(s40)
						if (bk != 2) {
							k = fn_4130(s360, bk, bl, "metadata_program", 0x10)
							bl = ld64(s360 + 8)
							j = ld64(s360)
							if (j != 2) {
								st64(a + 0x10, bl)
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
						}
						rent_get(s40)
						copy(s1f8, s38, 0x18)
						if (ld64(s40) != 0) {
							k = fn_13e628(s6b0, s1f8)
							j = ld64(s6b0)
							st64(a + 0x10, ld64(s6b0 + 8))
							st64(a + 8, j)
							st64(a, 0)
							return k
						}
						st64(s7b8, bl)
						copyr(s210, s1f8, 0x18)
						st64(s40, s248, s210, s258, s228, s220, s238)
						k = fn_94438(s138, s40)
						const i = ld64(s138 + 8)
						j = ld64(s138)
						if (j == 2) {
							st64(s7c0, i)
							const position_nft_mint: AccountInfo = ld64(i + 0x58)
							if (position_nft_mint.is_writable != 0) {
								if (position_nft_mint.is_signer != 0) {
									AccountInfo_clone_f338(s138, position_nft_mint)
									st64(s7c8, fn_147a20(s138))
									AccountInfo_clone_f338(s40, ld64(ld64(s7c0) + 0x58))
									AccountInfo_try_data_len(s88, s40)
									const bo = ld64(s88 + 8)
									const bn = ld64(s88)
									if (bn != 0x800000000000001a /* Ok */) {
										st64(s88 + 0x10, ld64(s88 + 0x10))
										st64(s88, bn, bo)
										cg = fn_13e628(s3b0, s88)
										cf = ld64(s3b0)
										st64(a + 0x10, ld64(s3b0 + 8))
										st64(a + 8, cf)
										st64(a, 0)
										return ptr_drop_in_place_fcd8(s138, ptr_drop_in_place_fcd8(s40, cg))
									}
									const bp = Rent_is_exempt(s210, ld64(s7c8), bo)
									ptr_drop_in_place_fcd8(s138, ptr_drop_in_place_fcd8(s40, bp))
									if (bp != 0) {
										rent_get(s40)
										copy(s1c8, s38, 0x18)
										if (ld64(s40) != 0) {
											k = fn_13e628(s6a0, s1c8)
											j = ld64(s6a0)
											st64(a + 0x10, ld64(s6a0 + 8))
											st64(a + 8, j)
											st64(a, 0)
											return k
										}
										copyr(s1e0, s1c8, 0x18)
										st64(s18, s228, s220)
										st64(s20, ld64(s7c0))
										st64(s40, s240, s218, s258, s250)
										k = fn_960a0(s138, s40)
										st64(s7c8, ld64(s138 + 8))
										j = ld64(s138)
										if (j == 2) {
											const position_nft_account: AccountInfo = ld64(ld64(s7c8))
											if (position_nft_account.is_writable != 0) {
												AccountInfo_clone_f338(s138, position_nft_account)
												st64(s7d0, fn_147a20(s138))
												AccountInfo_clone_f338(s40, ld64(ld64(s7c8)))
												AccountInfo_try_data_len(s88, s40)
												const bs = ld64(s88 + 8)
												const br = ld64(s88)
												if (br != 0x800000000000001a /* Ok */) {
													st64(s88 + 0x10, ld64(s88 + 0x10))
													st64(s88, br, bs)
													cg = fn_13e628(s400, s88)
													cf = ld64(s400)
													st64(a + 0x10, ld64(s400 + 8))
													st64(a + 8, cf)
													st64(a, 0)
													return ptr_drop_in_place_fcd8(s138, ptr_drop_in_place_fcd8(s40, cg))
												}
												const bt = Rent_is_exempt(s1e0, ld64(s7d0), bs)
												ptr_drop_in_place_fcd8(s138, ptr_drop_in_place_fcd8(s40, bt))
												if (bt != 0) {
													rent_get(s40)
													copy(s198, s38, 0x18)
													if (ld64(s40) != 0) {
														k = fn_13e628(s690, s198)
														j = ld64(s690)
														st64(a + 0x10, ld64(s690 + 8))
														st64(a + 8, j)
														st64(a, 0)
														return k
													}
													copyr(s1b0, s198, 0x18)
													const bu = ld64(ld64(ld64(s7c0) + 0x58))
													const by = ld64(bu)
													const bx = ld64(bu + 8)
													const bw = ld64(bu + 0x10)
													const bv = ld64(bu + 0x18)
													st64(s88, 0x100159360)
													st64(s88 + 0x10, s138)
													st64(s138, by, bx, bw, bv)
													st64(s88 + 8, 8)
													st64(s88 + 0x18, 0x20)
													// PDA find_program_address(["position", *s138], program *(ld64(s260)))
													Pubkey_find_program_address(s40, s88, 2, ld64(s260))
													copyr(s180, s40, 0x20)
													const bz = ld8(s20)
													st8(s159, bz)
													st8(ca + 2, bz)
													const cb = ld64(ld64(s790 + 0x40))
													copyr(s158, cb, 0x20)
													if ((memcmp(s158, s180, 0x20) as u32) == 0) {
														st64(s18, s159, s260)
														st64(s20, ld64(s7c0))
														st64(s40, s230, s1b0, s258, s228)
														k = fn_96f00(s138, s40)
														st64(s790 + 0x40, ld64(s138 + 8))
														j = ld64(s138)
														if (j == 2) {
															const personal_position: AccountInfo = ld64(ld64(s790 + 0x40))
															if (personal_position.is_writable != 0) {
																AccountInfo_clone_f338(s138, personal_position)
																st64(s7d0, fn_147a20(s138))
																AccountInfo_clone_f338(s40, ld64(ld64(s790 + 0x40)))
																AccountInfo_try_data_len(s88, s40)
																const cj = ld64(s88 + 8)
																const ci = ld64(s88)
																if (ci != 0x800000000000001a /* Ok */) {
																	st64(s88 + 0x10, ld64(s88 + 0x10))
																	st64(s88, ci, cj)
																	cg = fn_13e628(s480, s88)
																	cf = ld64(s480)
																	st64(a + 0x10, ld64(s480 + 8))
																	st64(a + 8, cf)
																	st64(a, 0)
																	return ptr_drop_in_place_fcd8(s138, ptr_drop_in_place_fcd8(s40, cg))
																}
																const ck = Rent_is_exempt(s1b0, ld64(s7d0), cj)
																ptr_drop_in_place_fcd8(s138, ptr_drop_in_place_fcd8(s40, ck))
																if (ck != 0) {
																	if (payer.is_writable != 0) {
																		if (ld8(ld64(s790 + 0x60) + 0x29) != 0) {
																			if (ld8(ld64(s790 + 0x58) + 0x29 /* is_writable */) != 0) {
																				const cl = ld64(ld64(s790 + 0x58) /* key */)
																				copyr(se8, cl, 0x20)
																				st64(s40, 0x10015a23e)
																				st64(s38 + 8, se8)
																				st64(s20, s88)
																				st32(s88, bswap32(ld64(s790 + 0x70)))
																				st64(s38, 0xa)
																				st64(s38 + 0x10, 0x20)
																				st64(s18, 4)
																				// PDA find_program_address(["tick_array", *cl, u32 bswap32(ld64(s790 + 0x70)) [ix data?]], program *(ld64(s260)))
																				Pubkey_find_program_address(s138, s40, 3, ld64(s260))
																				copyr(s108, s138, 0x20)
																				st8(ca, ld8(s138 + 0x20))
																				const cm = ld64(ld64(s790 + 0x48) /* key */)
																				copyr(sc8, cm, 0x20)
																				if ((memcmp(sc8, s108, 0x20) as u32) != 0) {
																					anchor_error_from(s510, 0x7d6 /* anchor::ConstraintSeeds */)
																					const cq = fn_4130(s520, ld64(s510), ld64(s510 + 8), "tick_array_lower", 0x10)
																					const cp = ld64(s520 + 8)
																					const co = ld64(s520)
																					copyr(s40, sc8, 0x20)
																					copy(s20, s108, 0x20)
																					k = Error_with_pubkeys(s530, co, cp, s40, cq)
																					j = ld64(s530)
																					st64(a + 0x10, ld64(s530 + 8))
																					st64(a + 8, j)
																					st64(a, 0)
																					return k
																				}
																				if (ld8(ld64(s790 + 0x48) + 0x29 /* is_writable */) != 0) {
																					copyr(s88, se8, 0x20)
																					st64(s20, s64)
																					st64(s38 + 8, s88)
																					st64(s40, 0x10015a23e)
																					st32(s64, bswap32(ld64(s790 + 0x78)))
																					st64(s18, 4)
																					st64(s38 + 0x10, 0x20)
																					st64(s38, 0xa)
																					// PDA find_program_address(["tick_array", *s88, u32 bswap32(ld64(s790 + 0x78)) [ix data?]], program *(ld64(s260)))
																					Pubkey_find_program_address(s138, s40, 3, ld64(s260))
																					copyr(sa8, s138, 0x20)
																					st8(ca + 1, ld8(s138 + 0x20))
																					const cn = ld64(ld64(s790 + 0x38) /* key */)
																					copyr(s60, cn, 0x20)
																					if ((memcmp(s60, sa8, 0x20) as u32) != 0) {
																						anchor_error_from(s560, 0x7d6 /* anchor::ConstraintSeeds */)
																						const ct = fn_4130(s570, ld64(s560), ld64(s560 + 8), "tick_array_upper", 0x10)
																						const cs = ld64(s570 + 8)
																						const cr = ld64(s570)
																						copyr(s40, s60, 0x20)
																						copy(s20, sa8, 0x20)
																						k = Error_with_pubkeys(s580, cr, cs, s40, ct)
																						j = ld64(s580)
																						st64(a + 0x10, ld64(s580 + 8))
																						st64(a + 8, j)
																						st64(a, 0)
																						return k
																					}
																					if (ld8(ld64(s790 + 0x38) + 0x29 /* is_writable */) != 0) {
																						if (ld8(ld64(ld64(s790 + 0x30)) + 0x29) != 0) {
																							const token_vault_0_box: TokenAccount_2 = ld64(s790 + 0x20)
																							copyr(s40, token_vault_0_box.mint, 0x20)
																							if ((memcmp(ld64(s790 + 0x30) + 8, s40, 0x20) as u32) != 0) {
																								k = anchor_error_from(s5d0, 0x7de /* anchor::ConstraintTokenMint */)
																								j = ld64(s5d0)
																								st64(a + 0x10, ld64(s5d0 + 8))
																								st64(a + 8, j)
																								st64(a, 0)
																								return k
																							}
																							if (ld8(ld64(ld64(s790 + 0x28)) + 0x29) != 0) {
																								const token_vault_1_box_2: TokenAccount_2 = ld64(s790 + 0x18)
																								copyr(s40, token_vault_1_box_2.mint, 0x20)
																								const cw = memcmp(ld64(s790 + 0x28) + 8, s40, 0x20)
																								if ((cw as u32) != 0) {
																									k = anchor_error_from(s600, 0x7de /* anchor::ConstraintTokenMint */)
																									j = ld64(s600)
																									st64(a + 0x10, ld64(s600 + 8))
																									st64(a + 8, j)
																									st64(a, 0)
																									return k
																								}
																								const token_vault_0: AccountInfo = ld64(ld64(s790 + 0x20))
																								if (token_vault_0.is_writable != 0) {
																									const cy = token_vault_0.key
																									copyr(s40, cy, 0x20)
																									k = fn_4dc0(s138, ld64(s238), cw as u32)
																									let da = ld64(s138 + 0x10)
																									let cz = ld64(s138 + 8)
																									if (ld64(s138) != 0) {
																										st64(a + 0x10, da)
																										st64(a + 8, cz)
																										st64(a, 0)
																										return k
																									}
																									const db = memcmp(s40, cz + 0x81, 0x20)
																									st64(da, ld64(da) - 1)
																									if ((db as u32) == 0) {
																										const token_vault_1: AccountInfo = ld64(ld64(s790 + 0x18))
																										if (token_vault_1.is_writable != 0) {
																											const dd = token_vault_1.key
																											copyr(s40, dd, 0x20)
																											k = fn_4dc0(s138, ld64(s238), db as u32)
																											da = ld64(s138 + 0x10)
																											cz = ld64(s138 + 8)
																											if (ld64(s138) != 0) {
																												st64(a + 0x10, da)
																												st64(a + 8, cz)
																												st64(a, 0)
																												return k
																											}
																											const de = memcmp(s40, cz + 0xa1, 0x20)
																											st64(da, ld64(da) - 1)
																											k = de as u32
																											if (k == 0) {
																												st64(a + 0xa8, ld64(s7b8))
																												st64(a + 0xa0, ld64(s7b0))
																												st64(a + 0x98, ld64(s7a8))
																												st64(a + 0x90, ld64(s7a0))
																												st64(a + 0x88, ld64(s798))
																												st64(a + 0x80, ld64(s790 + 0x10))
																												st64(a + 0x78, ld64(s790 + 8))
																												st64(a + 0x70, ld64(s790))
																												st64(a + 0x68, ld64(s790 + 0x18))
																												st64(a + 0x60, ld64(s790 + 0x20))
																												st64(a + 0x58, ld64(s790 + 0x28))
																												st64(a + 0x50, ld64(s790 + 0x30))
																												st64(a + 0x48, ld64(s790 + 0x40))
																												st64(a + 0x40, ld64(s790 + 0x38))
																												st64(a + 0x38, ld64(s790 + 0x48))
																												st64(a + 0x30, ld64(s790 + 0x50))
																												st64(a + 0x28, ld64(s790 + 0x58))
																												st64(a + 0x20, ld64(s790 + 0x60))
																												st64(a + 0x18, ld64(s7c8))
																												st64(a + 0x10, ld64(s7c0))
																												st64(a + 8, ld64(s790 + 0x68))
																												st64(a, payer)
																												return k
																											}
																											anchor_error_from(s670, 0x7d3 /* anchor::ConstraintRaw */)
																											k = fn_4130(s680, ld64(s670), ld64(s670 + 8), "token_vault_1", 0xd)
																											j = ld64(s680)
																											st64(a + 0x10, ld64(s680 + 8))
																											st64(a + 8, j)
																											st64(a, 0)
																											return k
																										}
																										anchor_error_from(s650, 0x7d0 /* anchor::ConstraintMut */)
																										k = fn_4130(s660, ld64(s650), ld64(s650 + 8), "token_vault_1", 0xd)
																										j = ld64(s660)
																										st64(a + 0x10, ld64(s660 + 8))
																										st64(a + 8, j)
																										st64(a, 0)
																										return k
																									}
																									anchor_error_from(s630, 0x7d3 /* anchor::ConstraintRaw */)
																									k = fn_4130(s640, ld64(s630), ld64(s630 + 8), "token_vault_0", 0xd)
																									j = ld64(s640)
																									st64(a + 0x10, ld64(s640 + 8))
																									st64(a + 8, j)
																									st64(a, 0)
																									return k
																								}
																								anchor_error_from(s610, 0x7d0 /* anchor::ConstraintMut */)
																								k = fn_4130(s620, ld64(s610), ld64(s610 + 8), "token_vault_0", 0xd)
																								j = ld64(s620)
																								st64(a + 0x10, ld64(s620 + 8))
																								st64(a + 8, j)
																								st64(a, 0)
																								return k
																							}
																							anchor_error_from(s5e0, 0x7d0 /* anchor::ConstraintMut */)
																							k = fn_4130(s5f0, ld64(s5e0), ld64(s5e0 + 8), "token_account_1", 0xf)
																							j = ld64(s5f0)
																							st64(a + 0x10, ld64(s5f0 + 8))
																							st64(a + 8, j)
																							st64(a, 0)
																							return k
																						}
																						anchor_error_from(s5b0, 0x7d0 /* anchor::ConstraintMut */)
																						k = fn_4130(s5c0, ld64(s5b0), ld64(s5b0 + 8), "token_account_0", 0xf)
																						j = ld64(s5c0)
																						st64(a + 0x10, ld64(s5c0 + 8))
																						st64(a + 8, j)
																						st64(a, 0)
																						return k
																					}
																					anchor_error_from(s590, 0x7d0 /* anchor::ConstraintMut */)
																					k = fn_4130(s5a0, ld64(s590), ld64(s590 + 8), "tick_array_upper", 0x10)
																					j = ld64(s5a0)
																					st64(a + 0x10, ld64(s5a0 + 8))
																					st64(a + 8, j)
																					st64(a, 0)
																					return k
																				}
																				anchor_error_from(s540, 0x7d0 /* anchor::ConstraintMut */)
																				k = fn_4130(s550, ld64(s540), ld64(s540 + 8), "tick_array_lower", 0x10)
																				j = ld64(s550)
																				st64(a + 0x10, ld64(s550 + 8))
																				st64(a + 8, j)
																				st64(a, 0)
																				return k
																			}
																			anchor_error_from(s4f0, 0x7d0 /* anchor::ConstraintMut */)
																			k = fn_4130(s500, ld64(s4f0), ld64(s4f0 + 8), "pool_state", 0xa)
																			j = ld64(s500)
																			st64(a + 0x10, ld64(s500 + 8))
																			st64(a + 8, j)
																			st64(a, 0)
																			return k
																		}
																		anchor_error_from(s4d0, 0x7d0 /* anchor::ConstraintMut */)
																		k = fn_4130(s4e0, ld64(s4d0), ld64(s4d0 + 8), "metadata_account", 0x10)
																		j = ld64(s4e0)
																		st64(a + 0x10, ld64(s4e0 + 8))
																		st64(a + 8, j)
																		st64(a, 0)
																		return k
																	}
																	anchor_error_from(s4b0, 0x7d0 /* anchor::ConstraintMut */)
																	k = fn_4130(s4c0, ld64(s4b0), ld64(s4b0 + 8), "payer", 5)
																	j = ld64(s4c0)
																	st64(a + 0x10, ld64(s4c0 + 8))
																	st64(a + 8, j)
																	st64(a, 0)
																	return k
																}
																anchor_error_from(s490, 0x7d5 /* anchor::ConstraintRentExempt */)
																k = fn_4130(s4a0, ld64(s490), ld64(s490 + 8), 0x10015b06a /* "personal_position" */, 0x11)
																j = ld64(s4a0)
																st64(a + 0x10, ld64(s4a0 + 8))
																st64(a + 8, j)
																st64(a, 0)
																return k
															}
															anchor_error_from(s460, 0x7d0 /* anchor::ConstraintMut */)
															k = fn_4130(s470, ld64(s460), ld64(s460 + 8), 0x10015b06a /* "personal_position" */, 0x11)
															j = ld64(s470)
															st64(a + 0x10, ld64(s470 + 8))
															st64(a + 8, j)
															st64(a, 0)
															return k
														}
														st64(a + 0x10, ld64(s790 + 0x40))
														st64(a + 8, j)
														st64(a, 0)
														return k
													}
													anchor_error_from(s430, 0x7d6 /* anchor::ConstraintSeeds */)
													const ce = fn_4130(s440, ld64(s430), ld64(s430 + 8), 0x10015b06a /* "personal_position" */, 0x11)
													const cd = ld64(s440 + 8)
													const cc = ld64(s440)
													copyr(s40, s158, 0x20)
													copy(s20, s180, 0x20)
													k = Error_with_pubkeys(s450, cc, cd, s40, ce)
													j = ld64(s450)
													st64(a + 0x10, ld64(s450 + 8))
													st64(a + 8, j)
													st64(a, 0)
													return k
												}
												anchor_error_from(s410, 0x7d5 /* anchor::ConstraintRentExempt */)
												k = fn_4130(s420, ld64(s410), ld64(s410 + 8), "position_nft_account", 0x14)
												j = ld64(s420)
												st64(a + 0x10, ld64(s420 + 8))
												st64(a + 8, j)
												st64(a, 0)
												return k
											}
											anchor_error_from(s3e0, 0x7d0 /* anchor::ConstraintMut */)
											k = fn_4130(s3f0, ld64(s3e0), ld64(s3e0 + 8), "position_nft_account", 0x14)
											j = ld64(s3f0)
											st64(a + 0x10, ld64(s3f0 + 8))
											st64(a + 8, j)
											st64(a, 0)
											return k
										}
										st64(a + 0x10, ld64(s7c8))
										st64(a + 8, j)
										st64(a, 0)
										return k
									}
									anchor_error_from(s3c0, 0x7d5 /* anchor::ConstraintRentExempt */)
									k = fn_4130(s3d0, ld64(s3c0), ld64(s3c0 + 8), "position_nft_mint", 0x11)
									j = ld64(s3d0)
									st64(a + 0x10, ld64(s3d0 + 8))
									st64(a + 8, j)
									st64(a, 0)
									return k
								}
								anchor_error_from(s390, 0x7d2 /* anchor::ConstraintSigner */)
								k = fn_4130(s3a0, ld64(s390), ld64(s390 + 8), "position_nft_mint", 0x11)
								j = ld64(s3a0)
								st64(a + 0x10, ld64(s3a0 + 8))
								st64(a + 8, j)
								st64(a, 0)
								return k
							}
							anchor_error_from(s370, 0x7d0 /* anchor::ConstraintMut */)
							k = fn_4130(s380, ld64(s370), ld64(s370 + 8), "position_nft_mint", 0x11)
							j = ld64(s380)
							st64(a + 0x10, ld64(s380 + 8))
							st64(a + 8, j)
							st64(a, 0)
							return k
						}
						st64(a + 0x10, i)
						st64(a + 8, j)
						st64(a, 0)
						return k
					}
					k = anchor_error_from(s6e0, 0xbbd /* anchor::AccountNotEnoughKeys */, v + 0x30, w, u)
					j = ld64(s6e0)
					st64(a + 0x10, ld64(s6e0 + 8))
					st64(a + 8, j)
					st64(a, 0)
					return k
				}
				k = anchor_error_from(s6f0, 0xbbd /* anchor::AccountNotEnoughKeys */, n, o)
				u = undef
				j = ld64(s6f0)
				if (j == 2) {
					k = anchor_error_from(s700, 0xbbd /* anchor::AccountNotEnoughKeys */, n, o, u)
					j = ld64(s700)
					st64(a + 0x10, ld64(s700 + 8))
					st64(a + 8, j)
					st64(a, 0)
					return k
				}
				const p = ld64(0x300000000 /* heap bump-allocator cursor */)
				const q = p != 0 ? sat_sub(p, 0x12) : 0x300007fee
				token_vault_1_box = ld64(s6f0 + 8)
				if ((j & 1) != 0) {
					if (0x300000008 > q) {
						raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008, 0x12 > p)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, q)
					st64(q + 8, 0x6e776f5f74666e5f)
					st64(q, 0x6e6f697469736f70)
					st16(q + 0x10, 0x7265)
					void token_vault_1_box.info
				} else {
					if (0x300000008 > q) {
						raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008, 0x12 > p)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, q)
					st64(q + 8, 0x6e776f5f74666e5f)
					st64(q, 0x6e6f697469736f70)
					st16(q + 0x10, 0x7265)
					void token_vault_1_box.info
				}
				st64(token_vault_1_box.mint + 8, q, 0x12)
				st64(token_vault_1_box.mint, 0x12)
				st64(token_vault_1_box, 1)
				st64(a + 0x10, token_vault_1_box)
				st64(a + 8, j)
				st64(a, 0)
				return k
			}
			const s = ld64(0x300000000 /* heap bump-allocator cursor */)
			const t = s != 0 ? sat_sub(s, 5) : 0x300007ffb
			if ((j & 1) != 0) {
				if (0x300000008 > t) {
					raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(s, 5), 5 > s)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, t)
				st8(t + 4, 0x72)
				st32(t, 0x65796170)
				void payer.key
			} else {
				if (0x300000008 > t) {
					raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(s, 5), 5 > s)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, t)
				st8(t + 4, 0x72)
				st32(t, 0x65796170)
				void payer.key
			}
			st64(payer + 0x10, t, 5)
			st64(payer + 8, 5)
			st64(payer, 1)
			st64(a + 0x10, payer)
			st64(a + 8, j)
			st64(a, 0)
			return k
		}
	}
	const g = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (g & 3) - 2) {
		k = anchor_error_from(s710, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s710)
		st64(a + 0x10, ld64(s710 + 8))
		st64(a + 8, j)
		st64(a, 0)
		return k
	}
	if ((g & 3) == 0) {
		k = anchor_error_from(s710, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s710)
		st64(a + 0x10, ld64(s710 + 8))
		st64(a + 8, j)
		st64(a, 0)
		return k
	}
	const h = ld64(ld64(g + 7))
	if (h == 0) {
		k = anchor_error_from(s710, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s710)
		st64(a + 0x10, ld64(s710 + 8))
		st64(a + 8, j)
		st64(a, 0)
		return k
	}
	callx(h, ld64(g - 1), h)
	k = anchor_error_from(s710, 0x66 /* anchor::InstructionDidNotDeserialize */)
	j = ld64(s710)
	st64(a + 0x10, ld64(s710 + 8))
	st64(a + 8, j)
	st64(a, 0)
	return k
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: AccountInfo, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value), p7 (value), p8 (value), p9 (value), p10 (value)
// types [heur]: b: OpenPositionContext (the handler ix_open_position passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_1b850(a: u64, b: OpenPositionContext, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s80 = fp - 0x80, s98 = fp - 0x98, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sc8 = fp - 0xc8, sd0 = fp - 0xd0, sd8 = fp - 0xd8, se0 = fp - 0xe0, sf8 = fp - 0xf8, s100 = fp - 0x100, s108 = fp - 0x108, s170 = fp - 0x170, s180 = fp - 0x180, s188 = fp - 0x188, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, sf70 = fp - 0xf70, sf88 = fp - 0xf88, s1000 = fp - 0x1000
	let i, j: u64
	let g = a
	const accounts: OpenPositionAccounts = b.accounts
	if (ld8(accounts.token_account_0 + 0x74) != 2 && ld8(accounts.token_account_1 + 0x74) != 2) {
		const bs = g
		const k: AccountInfo = ld64(ld64(accounts + 0x10) + 0x58)
		const l: LamportsCell = k.lamports
		const bl = p12
		const bm = p11
		const bn = p10
		const bo = p9
		const bp = p8
		const bq = p7
		const br = p6
		const m = p5
		const s = k.key
		rc_inc(l)
		const n: DataCell = k.data
		rc_inc(n)
		const r = k.owner
		const q = k.rent_epoch
		const p = k.is_signer
		const o = k.is_writable
		st8(se0 + 2, k.executable)
		st8(se0, p, o)
		st64(s108, s, l, n, r, q)
		const t: AccountInfo = ld64(ld64(accounts + 0x18))
		const u: LamportsCell = t.lamports
		const aa = t.key
		rc_inc(u)
		const v: DataCell = t.data
		rc_inc(v)
		const z = t.owner
		const y = t.rent_epoch
		const x = t.is_signer
		const w = t.is_writable
		st8(sb0 + 2, t.executable)
		st8(sb0, x, w)
		st64(sd8, aa, u, v, z, y)
		const ab: AccountInfo = accounts.token_account_0.info
		const ac: LamportsCell = ab.lamports
		const ai = ab.key
		rc_inc(ac)
		const ad: DataCell = ab.data
		rc_inc(ad)
		const ah = ab.owner
		const ag = ab.rent_epoch
		const af = ab.is_signer
		const ae = ab.is_writable
		st8(s80 + 2, ab.executable)
		st8(s80, af, ae)
		st64(sa8, ai, ac, ad, ah, ag)
		const aj: AccountInfo = accounts.token_account_1.info
		const ak: LamportsCell = aj.lamports
		const aq = aj.key
		rc_inc(ak)
		const al: DataCell = aj.data
		rc_inc(al)
		const ap = aj.owner
		const ao = aj.rent_epoch
		const an = aj.is_signer
		const am = aj.is_writable
		st8(s50 + 2, aj.executable)
		st8(s50, an, am)
		st64(s78, aq, ak, al, ap, ao)
		const ar: AccountInfo = accounts.token_vault_0.info
		const at: LamportsCell = ar.lamports
		const az = ar.key
		rc_inc(at)
		const au: DataCell = ar.data
		rc_inc(au)
		const ay = ar.owner
		const ax = ar.rent_epoch
		const aw = ar.is_signer
		const av = ar.is_writable
		st8(s20 + 2, ar.executable)
		st8(s20, aw, av)
		st64(s48, az, at, au, ay, ax)
		const ba: AccountInfo = accounts.token_vault_1.info
		const bb: LamportsCell = ba.lamports
		const bd = ba.key
		rc_inc(bb)
		const bc: DataCell = ba.data
		rc_inc(bc)
		const bh = ba.owner
		const bg = ba.rent_epoch
		const bf = ba.is_signer
		const be = ba.is_writable
		st8(s180 + 2, ba.executable)
		st8(s180, bf, be)
		st64(s1a8, bd, bb, bc, bh, bg)
		const remaining_accounts: AccountInfo = b.remaining_accounts
		const bj = b.remaining_accounts_len
		const bi = ld8(b + 0x22)
		st64(sf70, remaining_accounts, bj, bi, c, d, m, br, bq, bp, bo, bn, bm, bl)
		st64(s1000 + 0x70, accounts + 0xa8)
		st64(s1000, sd8, accounts + 0x20, accounts + 0x28, accounts + 0x38, accounts + 0x40, accounts + 0x48, sa8, s78, s48, s1a8, accounts + 0x70, accounts + 0x90, accounts + 0x98)
		st64(sf70 + 0x68, 0)
		st64(sf88, 0, 0, 0)
		j = fn_1c850(s1b8, accounts, accounts + 8, s108, fp, bd)
		i = ld64(s1b8 + 8)
		const h = ld64(s1b8)
		if (rc_release(bb)) {
			j = Rc_drop_slow_14df0(s1a0, j)
		}
		g = bs
		if (rc_release(bc)) {
			j = Rc_drop_slow_14df0(s198, j)
		}
		if (rc_release(at)) {
			j = Rc_drop_slow_14df0(s40, j)
		}
		if (rc_release(au)) {
			j = Rc_drop_slow_14df0(s38, j)
		}
		if (rc_release(ak)) {
			j = Rc_drop_slow_14df0(s70, j)
		}
		if (rc_release(al)) {
			j = Rc_drop_slow_14df0(s68, j)
		}
		if (rc_release(ac)) {
			j = Rc_drop_slow_14df0(sa0, j)
		}
		if (rc_release(ad)) {
			j = Rc_drop_slow_14df0(s98, j)
		}
		if (rc_release(u)) {
			j = Rc_drop_slow_14df0(sd0, j)
		}
		if (rc_release(v)) {
			j = Rc_drop_slow_14df0(sc8, j)
		}
		if (rc_release(l)) {
			j = Rc_drop_slow_14df0(s100, j)
		}
		if (!rc_release(n)) {
			st64(g, h, i)
			return j
		}
		j = Rc_drop_slow_14df0(sf8, j)
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
	copyr(s170, s78, 0x18)
	copy(s188, sa8, 0x18)
	st64(s1a0, 0x100159d93)
	st32(s170 + 0x60, 0x1770 /* error::NotApproved */)
	st8(s170 + 0x18, 2)
	st32(s198 + 8, 0xa4)
	st64(s198, 0x2e)
	st64(s1a8, 0)
	j = fn_13e5a0(s1c8, s1a8)
	i = ld64(s1c8 + 8)
	st64(g, ld64(s1c8))
	st64(g + 8, i)
	return j
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_account_1, token_vault_0, token_vault_1
function fn_989f8(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8
	let g, i, j, k, z, aa: u64
	B48: {
		const f = ld64(ld64(b + 0x10) + 0x58)
		if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(f) == 0 && ld64(ld64(f + 0x10) + 0x10) != 0)) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			z = fn_13e628(s28, s18)
			g = ld64(s28)
			if (g != 2) {
				const h = ld64(0x300000000 /* heap bump-allocator cursor */)
				i = 0x11 > h
				j = h != 0 ? i != 0 ? 0 : h - 0x11 : 0x300007fef
				k = ld64(s28 + 8)
				if ((g & 1) != 0) {
					if (0x300000008 > j) {
						raw_vec_handle_error(1, 0x11, 0x10015f8f8, i, aa)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, j)
					st64(j + 8, 0x6e696d5f74666e5f)
					st64(j, 0x6e6f697469736f70)
					st8(j + 0x10, 0x74)
					void ld64(k)
					break B48
				}
				if (0x300000008 > j) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, i, aa)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x6e696d5f74666e5f)
				st64(j, 0x6e6f697469736f70)
				st8(j + 0x10, 0x74)
				void ld64(k)
				break B48
			}
		}
		const l = ld64(ld64(b + 0x18))
		if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(l) == 0 && ld64(ld64(l + 0x10) + 0x10) != 0)) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			z = fn_13e628(s38, s18)
			g = ld64(s38)
			if (g != 2) {
				const m = ld64(0x300000000 /* heap bump-allocator cursor */)
				const n = m != 0 ? sat_sub(m, 0x14) : 0x300007fec
				k = ld64(s38 + 8)
				if ((g & 1) != 0) {
					if (0x300000008 > n) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x14 > m)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, n)
					st64(n + 8, 0x6363615f74666e5f)
					st64(n, 0x6e6f697469736f70)
					st32(n + 0x10, 0x746e756f)
					void ld64(k)
				} else {
					if (0x300000008 > n) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x14 > m)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, n)
					st64(n + 8, 0x6363615f74666e5f)
					st64(n, 0x6e6f697469736f70)
					st32(n + 0x10, 0x746e756f)
					void ld64(k)
				}
				st64(k + 0x10, n, 0x14)
				st64(k + 8, 0x14)
				st64(k, 1)
				st64(a + 8, k)
				st64(a, g)
				return z
			}
		}
		z = fn_a80(s48, ld64(b + 0x28), c)
		g = ld64(s48)
		if (g != 2) {
			const o = ld64(0x300000000 /* heap bump-allocator cursor */)
			const p = o != 0 ? sat_sub(o, 0xa) : 0x300007ff6
			k = ld64(s48 + 8)
			if ((g & 1) != 0) {
				if (0x300000008 > p) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > o)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, p)
				st64(p, 0x6174735f6c6f6f70)
				st16(p + 8, 0x6574)
				void ld64(k)
			} else {
				if (0x300000008 > p) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > o)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, p)
				st64(p, 0x6174735f6c6f6f70)
				st16(p + 8, 0x6574)
				void ld64(k)
			}
			st64(k + 0x10, p, 0xa)
			st64(k + 8, 0xa)
			st64(k, 1)
			st64(a + 8, k)
			st64(a, g)
			return z
		}
		z = fn_b4e0(s58, ld64(b + 0x48), 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
		g = ld64(s58)
		if (g == 2) {
			const r = ld64(ld64(b + 0x50))
			if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(r) == 0 && ld64(ld64(r + 0x10) + 0x10) != 0)) {
				st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
				z = fn_13e628(s68, s18)
				g = ld64(s68)
				if (g != 2) {
					const s = ld64(0x300000000 /* heap bump-allocator cursor */)
					const t = s != 0 ? sat_sub(s, 0xf) : 0x300007ff1
					k = ld64(s68 + 8)
					if ((g & 1) != 0) {
						if (0x300000008 > t) {
							raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0xf > s)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, t)
						st64(t + 7, 0x305f746e756f6363)
						st64(t, 0x63615f6e656b6f74)
						void ld64(k)
					} else {
						if (0x300000008 > t) {
							raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0xf > s)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, t)
						st64(t + 7, 0x305f746e756f6363)
						st64(t, 0x63615f6e656b6f74)
						void ld64(k)
					}
					st64(k + 0x10, t, 0xf)
					st64(k + 8, 0xf)
					st64(k, 1)
					st64(a + 8, k)
					st64(a, g)
					return z
				}
			}
			const u = ld64(ld64(b + 0x58))
			if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(u) == 0 && ld64(ld64(u + 0x10) + 0x10) != 0)) {
				st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
				fn_13e628(s78, s18)
				const v = ld64(s78)
				if (v != 2) {
					z = fn_4130(s88, v, ld64(s78 + 8), "token_account_1", 0xf)
					k = ld64(s88 + 8)
					g = ld64(s88)
					if (g != 2) {
						st64(a + 8, k)
						st64(a, g)
						return z
					}
				}
			}
			fn_a1d8(s98, ld64(ld64(b + 0x60)), 0x1001594a0 /* &TOKEN_PROGRAM */, c)
			const w = ld64(s98)
			if (w != 2) {
				z = fn_4130(sa8, w, ld64(s98 + 8), "token_vault_0", 0xd)
				k = ld64(sa8 + 8)
				g = ld64(sa8)
				if (g != 2) {
					st64(a + 8, k)
					st64(a, g)
					return z
				}
			}
			z = fn_a1d8(sb8, ld64(ld64(b + 0x68)), 0x1001594a0 /* &TOKEN_PROGRAM */, c)
			k = undef
			const x = ld64(sb8)
			if (x == 2) {
				st64(a + 8, k)
				st64(a, 2)
				return z
			}
			z = fn_4130(sc8, x, ld64(sb8 + 8), "token_vault_1", 0xd)
			k = undef
			const y = ld64(sc8)
			if (y == 2) {
				st64(a + 8, k)
				st64(a, 2)
				return z
			}
			st64(a + 8, ld64(sc8 + 8))
			st64(a, y)
			return z
		}
		const q = ld64(0x300000000 /* heap bump-allocator cursor */)
		i = 0x11 > q
		j = q != 0 ? i != 0 ? 0 : q - 0x11 : 0x300007fef
		k = ld64(s58 + 8)
		if ((g & 1) != 0) {
			if (0x300000008 > j) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, i, aa)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x6f697469736f705f)
			st64(j, 0x6c616e6f73726570)
			st8(j + 0x10, 0x6e)
			void ld64(k)
		} else {
			if (0x300000008 > j) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, i, aa)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(j + 8, 0x6f697469736f705f)
			st64(j, 0x6c616e6f73726570)
			st8(j + 0x10, 0x6e)
			void ld64(k)
		}
	}
	st64(k + 0x10, j, 0x11)
	st64(k + 8, 0x11)
	st64(k, 1)
	st64(a + 8, k)
	st64(a, g)
	return z
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

function fn_94438(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, sc0 = fp - 0xc0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s108 = fp - 0x108, s128 = fp - 0x128, s148 = fp - 0x148, s168 = fp - 0x168, s178 = fp - 0x178, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s200 = fp - 0x200, s220 = fp - 0x220, s238 = fp - 0x238, s250 = fp - 0x250, s258 = fp - 0x258, s278 = fp - 0x278, s288 = fp - 0x288, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2e0 = fp - 0x2e0, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s310 = fp - 0x310, s318 = fp - 0x318, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3c0 = fp - 0x3c0, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s400 = fp - 0x400, s430 = fp - 0x430, s438 = fp - 0x438
	let ac, ae, db, dc, dd: u64
	const f: AccountInfo = ld64(ld64(b))
	const g = fn_147a20(f, b, c, d, e)
	st64(s3c0 + 0x18, a)
	if (g != 0) {
		const j = ld64(b + 0x10)
		const k = ld64(ld64(j))
		copyr(s278, k, 0x20)
		const l = f.key
		copy(s250, l + 8, 0x18)
		st64(s258, ld64(l))
		if ((memcmp(s278, s258, 0x20) as u32) == 0) {
			ErrorCode_name(s238, 0x100159890)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100159890, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(s2f8, s60, 0x18)
			copy(s310, s238, 0x18)
			st64(s330 + 8, 0x100159d93)
			st32(s2b8 + 0x20, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s2e0, 2)
			st32(s318, 0x17)
			st64(s330 + 0x10, 0x2e)
			st64(s330, 0)
			const ah = fn_13e5a0(s370, s330)
			const ag = ld64(s370 + 8)
			const af = ld64(s370)
			copy(s330, s278, 0x40)
			dd = Error_with_pubkeys(s380, af, ag, s330, ah)
			const aj = ld64(s380)
			const ai = ld64(s3c0 + 0x18)
			st64(ai + 8, ld64(s380 + 8))
			st64(ai, aj)
			return dd
		}
		st64(s3c0 + 0x10, b)
		const m = max(fn_1476d8(ld64(b + 8), 0x52), 1)
		if (m > g) {
			const n: AccountInfo = ld64(j)
			const o: LamportsCell = n.lamports
			const ao = n.key
			rc_inc(o)
			const ak: DataCell = n.data
			rc_inc(ak)
			const al: LamportsCell = f.lamports
			st64(s3c0 + 8, al)
			const am = al.strong
			st64(s3e8, f.key)
			st64(s3e8 + 8, n.executable)
			st64(s3e8 + 0x10, n.is_writable)
			st64(s3e8 + 0x18, n.is_signer)
			st64(s3e8 + 0x20, n.rent_epoch)
			st64(s3c0, n.owner)
			rc_inc(ld64(s3c0 + 8), am)
			const an: DataCell = f.data
			rc_inc(an)
			st64(s400, ak, ao)
			const ap: AccountInfo = ld64(ld64(ld64(s3c0 + 0x10) + 0x18))
			const aq: LamportsCell = ap.lamports
			const ar = aq.strong
			st64(s3f8 + 8, o)
			st64(s430 + 0x10, f.executable)
			st64(s430 + 0x18, f.is_writable)
			st64(s430 + 0x20, f.is_signer)
			st64(s430 + 0x28, f.rent_epoch)
			const av = f.owner
			const aw = ap.key
			rc_inc(aq, ar)
			st64(s438, an)
			const at: DataCell = ap.data
			const au = at.strong
			st64(s430, aw, sat_sub(m, g))
			rc_inc(at, au)
			const bb = ap.owner
			const ba = ap.rent_epoch
			const az = ap.is_signer
			const ay = ap.is_writable
			const ax = ap.executable
			st8(s1d8 + 0x5a, ld64(s430 + 0x10))
			st8(s1d8 + 0x59, ld64(s430 + 0x18))
			st8(s1d8 + 0x58, ld64(s430 + 0x20))
			st64(s1d8 + 0x50, ld64(s430 + 0x28))
			st64(s1d8 + 0x48, av)
			st64(s1d8 + 0x40, ld64(s438))
			st64(s1d8 + 0x38, ld64(s3c0 + 8))
			st64(s1d8 + 0x30, ld64(s3e8))
			st8(s1d8 + 0x2a, ld64(s3e8 + 8))
			st8(s1d8 + 0x29, ld64(s3e8 + 0x10))
			st8(s1d8 + 0x28, ld64(s3e8 + 0x18))
			st64(s1d8 + 0x20, ld64(s3e8 + 0x20))
			st64(s1d8 + 0x18, ld64(s3c0))
			st64(s1d8 + 0x10, ld64(s400))
			copyr(s1d8, s3f8, 0x10)
			st8(s1e0, az, ay, ax)
			st64(s200, aq, at, bb, ba)
			st64(s220 + 0x18, ld64(s430))
			st64(s178, 8, 0)
			st64(s220, 0, 8, 0)
			dd = system_program_transfer(s340, s220, ld64(s430 + 8))
			ae = ld64(s340)
			if (ae != 2) {
				dc = ld64(s340 + 8)
				db = ld64(s3c0 + 0x18)
				st64(db, ae, dc)
				return dd
			}
		}
		const bc: LamportsCell = f.lamports
		st64(s3c0 + 8, bc)
		const bd = bc.strong
		const bf = f.key
		const bg = ld64(s3c0 + 0x10)
		rc_inc(ld64(s3c0 + 8), bd)
		const be: DataCell = f.data
		rc_inc(be)
		st64(s3c0, bf)
		const bh = ld64(bg + 0x18)
		const bi: AccountInfo = ld64(bh)
		const bj: LamportsCell = bi.lamports
		const bk = bj.strong
		st64(s3e8 + 8, f.executable)
		st64(s3e8 + 0x10, f.is_writable)
		st64(s3e8 + 0x18, f.is_signer)
		st64(s3e8 + 0x20, f.rent_epoch)
		const bq = f.owner
		st64(s3e8, bi.key)
		rc_inc(bj, bk)
		const bl: DataCell = bi.data
		rc_inc(bl)
		st64(s3f8 + 8, bh)
		const bp = bi.owner
		const bo = bi.rent_epoch
		const bn = bi.is_signer
		const bm = bi.is_writable
		st8(s2c0 + 2, bi.executable)
		st8(s2c0, bn, bm)
		st64(s2e0, bj, bl, bp, bo)
		st64(s2e8, ld64(s3e8))
		st8(s2f0 + 2, ld64(s3e8 + 8))
		st8(s2f0 + 1, ld64(s3e8 + 0x10))
		st8(s2f0, ld64(s3e8 + 0x18))
		st64(s2f8, ld64(s3e8 + 0x20))
		st64(s308, be, bq)
		copyr(s318, s3c0, 0x10)
		st64(s2b8, 8, 0)
		st64(s330, 0, 8, 0)
		dd = system_program_assign_13fb30(s350, s330, 0x52)
		ae = ld64(s350)
		if (ae != 2) {
			dc = ld64(s350 + 8)
			db = ld64(s3c0 + 0x18)
			st64(db, ae, dc)
			return dd
		}
		const br: LamportsCell = f.lamports
		const bz = f.key
		rc_inc(br)
		const bs: DataCell = f.data
		rc_inc(bs)
		const bt: AccountInfo = ld64(ld64(s3f8 + 8))
		const bu: LamportsCell = bt.lamports
		const bv = bu.strong
		st64(s3e8 + 0x18, f.executable)
		st64(s3e8 + 0x20, f.is_writable)
		st64(s3c0, f.is_signer)
		st64(s3c0 + 8, f.rent_epoch)
		const by = f.owner
		st64(s3e8 + 0x10, bt.key)
		rc_inc(bu, bv)
		st64(s3e8 + 8, br)
		const bw: DataCell = bt.data
		const bx = bw.strong
		st64(s3e8, bz)
		rc_inc(bw, bx)
		const cd = bt.owner
		const cc = bt.rent_epoch
		const cb = bt.is_signer
		const ca = bt.is_writable
		st8(s2c0 + 2, bt.executable)
		st8(s2c0, cb, ca)
		st64(s2e0, bu, bw, cd, cc)
		st64(s2e8, ld64(s3e8 + 0x10))
		st8(s2f0 + 2, ld64(s3e8 + 0x18))
		st8(s2f0 + 1, ld64(s3e8 + 0x20))
		st8(s2f0, ld64(s3c0))
		st64(s2f8, ld64(s3c0 + 8))
		st64(s308, bs, by)
		copyr(s318, s3e8, 0x10)
		st64(s2b8, 8, 0)
		st64(s330, 0, 8, 0)
		ac = ld64(ld64(s3c0 + 0x10) + 0x20)
		const ce = ld64(ld64(ac))
		copyr(s48, ce, 0x20)
		dd = system_program_assign_13ff40(s360, s330, s48)
		ae = ld64(s360)
		if (ae != 2) {
			dc = ld64(s360 + 8)
			db = ld64(s3c0 + 0x18)
			st64(db, ae, dc)
			return dd
		}
	} else {
		st64(s3c0, fn_1476d8(ld64(b + 8), 0x52))
		const h: AccountInfo = ld64(ld64(b + 0x10))
		const i: LamportsCell = h.lamports
		const y = h.key
		rc_inc(i)
		const p: DataCell = h.data
		rc_inc(p)
		const q: LamportsCell = f.lamports
		st64(s3c0 + 8, q)
		const r = q.strong
		st64(s3f8 + 8, f.key)
		st64(s3e8, h.executable)
		st64(s3e8 + 8, h.is_writable)
		st64(s3e8 + 0x10, h.is_signer)
		st64(s3e8 + 0x18, h.rent_epoch)
		st64(s3e8 + 0x20, h.owner)
		rc_inc(ld64(s3c0 + 8), r)
		const s: DataCell = f.data
		rc_inc(s)
		st64(s3f8, p)
		st64(s3c0 + 0x10, b)
		const t: AccountInfo = ld64(ld64(b + 0x18))
		const u: LamportsCell = t.lamports
		const v = u.strong
		st64(s430 + 0x10, f.executable)
		st64(s430 + 0x18, f.is_writable)
		st64(s430 + 0x20, f.is_signer)
		st64(s430 + 0x28, f.rent_epoch)
		st64(s400, f.owner)
		const w = t.key
		rc_inc(u, v)
		st64(s430 + 8, w)
		const x: DataCell = t.data
		rc_inc(x)
		st64(s430, t.owner)
		st64(s438, t.rent_epoch)
		const ab = t.is_signer
		const aa = t.is_writable
		const z = t.executable
		st8(s2b8 + 0x2a, ld64(s430 + 0x10))
		st8(s2b8 + 0x29, ld64(s430 + 0x18))
		st8(s2b8 + 0x28, ld64(s430 + 0x20))
		st64(s2b8 + 0x20, ld64(s430 + 0x28))
		st64(s2b8 + 0x18, ld64(s400))
		st64(s2b8 + 0x10, s)
		st64(s2b8 + 8, ld64(s3c0 + 8))
		st64(s2b8, ld64(s3f8 + 8))
		st8(s2c0 + 2, ld64(s3e8))
		st8(s2c0 + 1, ld64(s3e8 + 8))
		st8(s2c0, ld64(s3e8 + 0x10))
		st64(s2e0 + 0x18, ld64(s3e8 + 0x18))
		st64(s2e0 + 0x10, ld64(s3e8 + 0x20))
		st64(s2e0 + 8, ld64(s3f8))
		st64(s2e8, y, i)
		st8(s2f0, ab, aa, z)
		st64(s2f8, ld64(s438))
		st64(s308 + 8, ld64(s430))
		st64(s310, u, x)
		st64(s318, ld64(s430 + 8))
		st64(s288, 8, 0)
		st64(s330, 0, 8, 0)
		ac = ld64(ld64(s3c0 + 0x10) + 0x20)
		const ad = ld64(ld64(ac))
		copyr(s48, ad, 0x20)
		dd = system_program_create_account(s390, s330, ld64(s3c0), 0x52, s48)
		ae = ld64(s390)
		if (ae != 2) {
			dc = ld64(s390 + 8)
			db = ld64(s3c0 + 0x18)
			st64(db, ae, dc)
			return dd
		}
	}
	const cf: AccountInfo = ld64(ac)
	const cg: LamportsCell = cf.lamports
	const cl = cf.key
	rc_inc(cg)
	const ch: DataCell = cf.data
	rc_inc(ch)
	const ci: LamportsCell = f.lamports
	const cj = ci.strong
	st64(s3e8 + 0x18, f.key)
	st64(s3e8 + 0x20, cf.executable)
	st64(s3c0, cf.is_writable)
	st64(s3c0 + 8, cf.is_signer)
	const cn = cf.rent_epoch
	const cm = cf.owner
	rc_inc(ci, cj)
	const ck: DataCell = f.data
	rc_inc(ck)
	const cr = f.owner
	const cq = f.rent_epoch
	st64(s3e8, ch, cg, cl)
	const cp = f.is_signer
	const co = f.is_writable
	st8(s128 + 2, f.executable)
	st8(s128, cp, co)
	st64(s148, ci, ck, cr, cq)
	st64(s168 + 0x18, ld64(s3e8 + 0x18))
	st8(s108 + 0x12, ld64(s3e8 + 0x20))
	st8(s108 + 0x11, ld64(s3c0))
	st8(s108 + 0x10, ld64(s3c0 + 8))
	st64(s108, cm, cn)
	st64(s128 + 0x18, ld64(s3e8))
	st64(s128 + 0x10, ld64(s3e8 + 8))
	st64(s128 + 8, ld64(s3e8 + 0x10))
	st64(sf0, 8, 0)
	st64(s168, 0, 8, 0)
	const cs = ld64(ld64(ld64(ld64(s3c0 + 0x10) + 0x28)))
	copyr(se0, cs, 0x20)
	const cv = ld64(cs)
	const cu = ld64(cs + 8)
	const ct = ld64(cs + 0x10)
	st64(s48 + 0x18, ld64(cs + 0x18))
	st64(s48, cv, cu, ct)
	copyr(s330, se0, 0x20)
	dd = fn_12b0f8(s3a0, s168, 0, s48, s330)
	ae = ld64(s3a0)
	if (ae == 2) {
		dd = Account_try_from(sc0, f)
		const da = ld64(s3c0 + 0x18)
		if (ld32(sc0) == 2) {
			const cw = ld64(0x300000000 /* heap bump-allocator cursor */)
			const cy = cw != 0 ? sat_sub(cw, 0x11) : 0x300007fef
			const cz = ld64(sc0 + 0x10)
			const cx = ld64(sc0 + 8)
			if (cx != 0) {
				if (0x300000008 > cy) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, cy)
				st64(cy + 8, 0x6e696d5f74666e5f)
				st64(cy, 0x6e6f697469736f70)
				st8(cy + 0x10, 0x74)
				void ld64(cz)
			} else {
				if (0x300000008 > cy) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, cy)
				st64(cy + 8, 0x6e696d5f74666e5f)
				st64(cy, 0x6e6f697469736f70)
				st8(cy + 0x10, 0x74)
				void ld64(cz)
			}
			st64(cz + 0x10, cy, 0x11)
			st64(cz + 8, 0x11)
			st64(cz, 1)
			st64(da + 8, cz)
			st64(da, cx)
			return dd
		}
		const de = ld64(0x300000000 /* heap bump-allocator cursor */)
		const df = de != 0 ? sat_sub(de, 0x60) & -8 : 0x300007fa0
		if (0x300000008 > df) {
			alloc_handle_alloc_error(8, 0x60)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, df)
		dd = memcpy(df, sc0, 0x60)
		st64(da + 8, df)
		st64(da, 2)
		return dd
	}
	dc = ld64(s3a0 + 8)
	db = ld64(s3c0 + 0x18)
	st64(db, ae, dc)
	return dd
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

function fn_960a0(a: u64, b: u64): u64 {
	const sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd0 = fp - 0xd0, sf8 = fp - 0xf8, s100 = fp - 0x100, s128 = fp - 0x128, s130 = fp - 0x130, s158 = fp - 0x158, s160 = fp - 0x160, s188 = fp - 0x188, s190 = fp - 0x190, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s218 = fp - 0x218, s230 = fp - 0x230, s240 = fp - 0x240
	const f: AccountInfo = ld64(ld64(b + 8))
	const g: LamportsCell = f.lamports
	const l: AccountInfo = ld64(ld64(b))
	const o = f.key
	rc_inc(g)
	const h: DataCell = f.data
	rc_inc(h)
	const i: AccountInfo = ld64(ld64(b + 0x10))
	const j: LamportsCell = i.lamports
	const bu = f.executable
	const bv = f.is_writable
	const bw = f.is_signer
	const bx = f.rent_epoch
	const by = f.owner
	const bt = i.key
	rc_inc(j)
	const k: DataCell = i.data
	rc_inc(k)
	const m: LamportsCell = l.lamports
	const bn = l.key
	const bo = i.executable
	const bp = i.is_writable
	const bq = i.is_signer
	const br = i.rent_epoch
	const bs = i.owner
	rc_inc(m)
	const n: DataCell = l.data
	rc_inc(n)
	const p: AccountInfo = ld64(ld64(b + 0x18))
	const q: LamportsCell = p.lamports
	const bi = l.executable
	const bj = l.is_writable
	const bk = l.is_signer
	const bl = l.rent_epoch
	const bm = l.owner
	const bh = p.key
	rc_inc(q)
	const r: DataCell = p.data
	rc_inc(r)
	const s: AccountInfo = ld64(ld64(b + 0x20) + 0x58)
	const t: LamportsCell = s.lamports
	const bd = p.executable
	const be = p.is_writable
	const bf = p.is_signer
	const bg = p.rent_epoch
	const v = p.owner
	const u = s.key
	rc_inc(t)
	const w: DataCell = s.data
	rc_inc(w)
	const x: AccountInfo = ld64(ld64(b + 0x28))
	const y: LamportsCell = x.lamports
	const az = s.executable
	const ba = s.is_writable
	const bb = s.is_signer
	const bc = s.rent_epoch
	const af = s.owner
	const z = x.key
	rc_inc(y)
	const aa: DataCell = x.data
	rc_inc(aa)
	const ab: AccountInfo = ld64(ld64(b + 0x30))
	const ac: LamportsCell = ab.lamports
	const av = x.executable
	const aw = x.is_writable
	const ax = x.is_signer
	const ay = x.rent_epoch
	const ak = x.owner
	const ad = ab.key
	rc_inc(ac)
	const ae: DataCell = ab.data
	rc_inc(ae)
	const aj = ab.owner
	const ai = ab.rent_epoch
	const ah = ab.is_signer
	const ag = ab.is_writable
	st8(sd0 + 2, ab.executable)
	st8(sd0, ah, ag)
	st64(sf8, ad, ac, ae, aj, ai)
	st8(s100, ax, aw, av)
	st64(s128, z, y, aa, ak, ay)
	st8(s130, bb, ba, az)
	st64(s158, u, t, w, af, bc)
	st8(s160, bf, be, bd)
	st64(s188, bh, q, r, v, bg)
	st8(s190, bk, bj, bi)
	st64(s1b8, bn, m, n, bm, bl)
	st8(s1c0, bq, bp, bo)
	st64(s1e8, bt, j, k, bs, br)
	st8(s1f0, bw, bv, bu)
	st64(s218, o, g, h, by, bx)
	st64(sc8, 8, 0)
	st64(s230, 0, 8, 0)
	let au = associated_token_create(s240, s230)
	const al = ld64(s240)
	if (al != 2) {
		const ao = ld64(s240 + 8)
		st64(a, al, ao)
		return au
	}
	au = Account_try_from_unchecked(sb8, l)
	if (ld32(sb8 + 0x90) == 2) {
		const ap = ld64(0x300000000 /* heap bump-allocator cursor */)
		const ar = ap != 0 ? sat_sub(ap, 0x14) : 0x300007fec
		const at = ld64(sb8 + 8)
		const aq = ld64(sb8)
		if (aq != 0) {
			if (0x300000008 > ar) {
				raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, ar)
			st64(ar + 8, 0x6363615f74666e5f)
			st64(ar, 0x6e6f697469736f70)
			st32(ar + 0x10, 0x746e756f)
			void ld64(at)
		} else {
			if (0x300000008 > ar) {
				raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, ar)
			st64(ar + 8, 0x6363615f74666e5f)
			st64(ar, 0x6e6f697469736f70)
			st32(ar + 0x10, 0x746e756f)
			void ld64(at)
		}
		st64(at + 0x10, ar, 0x14)
		st64(at + 8, 0x14)
		st64(at, 1)
		st64(a + 8, at)
		st64(a, aq)
		return au
	}
	const am = ld64(0x300000000 /* heap bump-allocator cursor */)
	const an = am != 0 ? sat_sub(am, 0xb8) & -8 : 0x300007f48
	if (0x300000008 > an) {
		alloc_handle_alloc_error(8, 0xb8)
	}
	st64(0x300000000 /* heap bump-allocator cursor */, an)
	au = memcpy(an, sb8, 0xb8)
	st64(a + 8, an)
	st64(a, 2)
	return au
}

function fn_96f00(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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
			st64(s380 + 8, 0x100159d93)
			st32(s300 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s330, 2)
			st32(s368, 0x17)
			st64(s380 + 0x10, 0x2e)
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
		const bp = ld64(ld64(ld64(bi + 0x20) + 0x58))
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
		const ab = ld64(ld64(ld64(b + 0x20) + 0x58))
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (points to it), e (value)
function fn_153158(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155b30(a, b, c, d, e)
}

function fn_f5d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, b, c, d, e)
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

function fn_84360(a: u64, b: AccountInfo): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	let q, r: u64
	const f = b.owner
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) != 0) {
		const o = anchor_error_from(s50, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const n = ld64(s50 + 8)
		const m = ld64(s50)
		copyr(s40, f, 0x20)
		st64(s20, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
		r = Error_with_pubkeys(s60, m, n, s40, o)
		q = ld64(s60)
		st64(a + 8, ld64(s60 + 8))
		st64(a, q)
		st8(a + 0x2a, 2)
		return r
	}
	AccountInfo_try_borrow_data(s40, b, g as u32)
	const p = ld64(s40 + 0x10)
	const i = ld64(s40 + 8)
	const h = ld64(s40)
	if (h == 0x800000000000001a /* Ok */) {
		let k = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
		let j = ld64(i + 8)
		if (j >= 8) {
			k = 0xbba /* anchor::AccountDiscriminatorMismatch */
			j = 0x2a81f931cd559bc0 /* account:TickArrayState */
			if (ld64(ld64(i)) == 0x2a81f931cd559bc0 /* account:TickArrayState */) {
				const s: LamportsCell = b.lamports
				const w = b.key
				rc_inc(s)
				const t: DataCell = b.data
				rc_inc(t)
				const v = b.rent_epoch
				const u = b.is_signer
				r = b.is_writable
				st8(a + 0x2a, b.executable)
				st8(a + 0x29, r)
				st8(a + 0x28, u)
				st64(a + 0x20, v)
				st64(a + 0x18, f)
				st64(a + 0x10, t)
				st64(a + 8, s)
				st64(a, w)
				st64(p, ld64(p) - 1)
				return r
			}
		}
		r = anchor_error_from(s80, k, j)
		const l = ld64(s80)
		st64(a + 8, ld64(s80 + 8))
		st64(a, l)
		st8(a + 0x2a, 2)
		st64(p, ld64(p) - 1)
		return r
	}
	st64(s40, h, i, p)
	r = fn_13e628(s70, s40)
	q = ld64(s70)
	st64(a + 8, ld64(s70 + 8))
	st64(a, q)
	st8(a + 0x2a, 2)
	return r
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

function fn_76200(a: u64, b: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s61 = fp - 0x61
	st64(s40, 0x1001595c0, 0x20, b, 0x20, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */)
	// PDA find_program_address(["pool_tick_array_bitmap_extension", *b], program *s20)
	const f = Pubkey_find_program_address(s61, s40, 2, s20)
	st64(a + 0x18, ld64(s61 + 0x18))
	st64(a + 0x10, ld64(s61 + 0x10))
	st64(a + 8, ld64(s61 + 8))
	st64(a, ld64(s61))
	return f
}

function fn_84298(a: u64): u64 {
	const s30 = fp - 0x30, s40 = fp - 0x40
	let i = clock_get(s30)
	if (ld64(s30) != 0) {
		const g = ld64(s30 + 8)
		const f = ld64(s30 + 0x10)
		st64(s30 + 0x10, ld64(s30 + 0x18))
		st64(s30, g, f)
		i = fn_13e628(s40, s30)
		const h = ld64(s40)
		st64(a + 8, ld64(s40 + 8))
		st64(a, h)
		return i
	}
	st64(a + 8, ld64(s30 + 0x18))
	st64(a, 2)
	return i
}

function log_data(a: u64, b: u64): u64 {
	return sol_log_data(a, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), d (value), e (value)
function fn_14ec98(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	st64(s60, a, b, 0x100162370)
	st64(s50 + 0x10, s20)
	st64(s20, s58, fn_155738, s60, fn_155738)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "index out of bounds: the len is {} but the index is {}" {} = b [fn_155738], {} = a [fn_155738]
	fn_14ec00(s50, c, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
function fn_158340(a: u64, b: u64): u64 {
	return mul_mul(a, b)
}

// not included (size budget), see shared.ts:
declare function fn_1e428(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64, p13: u64, p14: u64, p15: u64, p16: u64, p17: u64, p18: u64, p19: u64, p20: u64): u64
declare function fn_10f370(a: u64, b: u64)
declare function fn_22e28(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64, p13: u64, p14: u64, p15: u64): u64
declare function fn_14ec00(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_13e070(a: u64, b: u64, c: u64): u64
declare function fn_15a08(a: u64, b: u64): u64
declare function fn_159078(a: u64, b: u64): u64
declare function fn_156088(a: u64, b: u64): u64
declare function fn_154730(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_1547e0(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_10ebf8(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_155b30(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_158b50(a: u64, b: u64): u64
declare function fn_3158(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_154940(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_1548e8(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_82dd0(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: LamportsCell): u64
declare function fn_84740(a: u64, b: AccountInfo): u64
declare function fn_849c0(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64
declare function fn_71530(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_154788(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_155738(a: u64, b: u64): u64
