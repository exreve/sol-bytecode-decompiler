// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction decrease_liquidity_v2: handler + 41 reachable functions
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
interface Bytes10080 {} // 10080 bytes in place (value = their address)
interface Bytes107 {} // 107 bytes in place (value = their address)
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
interface TickArrayStateAccount extends sized<0x2800> { // data of an account of type TickArrayState (Anchor IDL: 8-byte discriminator, then the fields in serialized order)
	discriminator:          at<0x00, u64>
	pool_id:                at<0x08, Pubkey>
	start_tick_index:       at<0x28, u32>
	ticks:                  at<0x2c, Bytes10080>
	initialized_tick_count: at<0x278c, u8>
	recent_epoch:           at<0x278d, u64>
	padding:                at<0x2795, Bytes107>
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
interface DecreaseLiquidityV2Accounts { // Accounts struct of instruction decrease_liquidity_v2 as accounts_decrease_liquidity_v2 returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	token_vault_1:             at<0x30, ref<TokenAccount>> // Box<Account<TokenAccount>>
	tick_array_lower:          at<0x38, ref<AccountInfo>> // the &AccountInfo of an account of type TickArrayState (e.g. AccountLoader<TickArrayState>: data not deserialized)
	tick_array_upper:          at<0x40, ref<AccountInfo>> // the &AccountInfo of an account of type TickArrayState (e.g. AccountLoader<TickArrayState>: data not deserialized)
	recipient_token_account_0: at<0x48, ref<TokenAccount>> // Box<Account<TokenAccount>>
	recipient_token_account_1: at<0x50, ref<TokenAccount>> // Box<Account<TokenAccount>>
	vault_0_mint:              at<0x70, ref<Mint>> // Box<Account<Mint>>
	vault_1_mint:              at<0x78, ref<Mint>> // Box<Account<Mint>>
}
interface DecreaseLiquidityV2Context { // anchor_lang Context of instruction decrease_liquidity_v2 (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<DecreaseLiquidityV2Accounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface DecreaseLiquidityV2Args extends sized<0x20> { // arguments of instruction decrease_liquidity_v2 (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	liquidity:    at<0x00, u128>
	amount_0_min: at<0x10, u64>
	amount_1_min: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_log_data(slices: u64, len: u64): void // log base64 data: slices = &[&[u8]]
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function fn_11e0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function fn_13d0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function try_accounts_1678(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::interface_account::InterfaceAccount<T> as anchor_lang::Accounts<B>…
declare function fn_1730(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a Display implementation returned an err…"
declare function InterfaceAccount_try_from_unchecked(a: u64, b: u64): u64 // lib anchor_lang::accounts::interface_account::InterfaceAccount<T>::try_from_unchecked
declare function InterfaceAccount_try_from(a: u64, b: u64): u64 // lib anchor_lang::accounts::interface_account::InterfaceAccount<T>::try_from
declare function fn_7498(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses try_accounts_1678, alloc_handle_alloc_error, memcpy
declare function fn_7768(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses try_accounts_15c0, alloc_handle_alloc_error, memcpy
declare function fn_a1d8(a: u64, b: u64, c: u64, d: u64): u64 // lib uses memcmp, common_is_closed
declare function fn_e948(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib uses Mint_unpack_from_slice_137968, raw_vec_handle_error, memset2, memcmp
declare function AccountInfo_clone_f338(a: u64, b: u64): u64 // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function AccountInfo_clone_f440(a: u64, b: u64): void // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function fn_fc80(a: u64, b: u64, r0: u64): u64 // lib
declare function ptr_drop_in_place_fcd8(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<solana_account_info::AccountInfo>
declare function ptr_drop_in_place_fd78(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_account_info::AccountInfo; 4]>
declare function fn_ff88(a: u64, r0: u64): u64 // lib uses Rc_drop_slow_14df0
declare function Rc_drop_slow_14df0(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function fn_152e0(a: u64, b: u64): void // lib uses raw_vec_finish_grow_14e20, raw_vec_handle_error
declare function fn_16008(a: u64, b: u64): u64 // lib
declare function try_accounts_17a30(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_18368(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_18cf0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp, Error_with_pubkeys
declare function try_accounts_19190(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function token_transfer(a: u64, b: u64, c: u64): u64 // lib anchor_spl::token::transfer
declare function token_2022_transfer_checked(a: u64, b: u64, c: u64, d: u64): u64 // lib anchor_spl::token_2022::transfer_checked
declare function fn_132590(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses __multi3_159030, __udivti3
declare function Error_new_13c880(): u64 // lib std::io::error::Error::new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function Error_with_pubkeys(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib anchor_lang::error::Error::with_pubkeys
declare function ErrorCode_name(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib anchor_lang::error::ErrorCode::name
declare function ErrorCode_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::error::ErrorCode as core::fmt::Display>::fmt
declare function clock_get(a: u64): u64 // lib solana_sysvar::clock::<impl solana_sysvar::Sysvar for solana_clock::Clock>::get
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function Pubkey_create_program_address(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib solana_pubkey::Pubkey::create_program_address
declare function de_unexpected_eof_to_unexpected_length_of_input(a: u64): u64 // lib borsh::de::unexpected_eof_to_unexpected_length_of_input
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fn_14de10(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a formatting trait implementation return…"
declare function fn_150868(a: u64, b: u64): u64 // lib
declare function fmt_write(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::write
declare function imp__fmt_155760(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u64>::_fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function fn_1561f0(a: u64, b: u64): u64 // lib

// instruction handler: decrease_liquidity_v2 (discriminator sha256("global:decrease_liquidity_v2")[..8] = 0x60c4524f3ebc7f3a)
// accounts [idl]: 0 nft_owner [signer], 1 nft_account, 2 personal_position [mut], 3 pool_state [mut], 4 protocol_position, 5 token_vault_0 [mut], 6 token_vault_1 [mut], 7 tick_array_lower [mut], 8 tick_array_upper [mut], 9 recipient_token_account_0 [mut], 10 recipient_token_account_1 [mut], 11 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 12 token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb], 13 memo_program [= MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr], 14 vault_0_mint, 15 vault_1_mint
// args [idl]: liquidity: u128, amount_0_min: u64, amount_1_min: u64
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, amount_0_min, amount_1_min
function ix_decrease_liquidity_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s68 = fp - 0x68, s70 = fp - 0x70, s80 = fp - 0x80, se8 = fp - 0xe8, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s1000 = fp - 0x1000
	let l, o: u64
	const i = sol_log("Instruction: DecreaseLiquidityV2", 0x20)
	const f = ix_args_len
	if (f >= 0x10 && ((f & -8) != 0x10 && (f & -8) != 0x18)) {
		const args: DecreaseLiquidityV2Args = ix_args
		const r = ld64(args.liquidity + 8)
		const q = ld64(args.liquidity)
		const amount_0_min = args.amount_0_min
		const amount_1_min = args.amount_1_min
		st64(s110, accounts, accounts_len)
		o = accounts_decrease_liquidity_v2(s80, amount_0_min, s110, undef, fp, i)
		const k = ld64(s70)
		l = ld64(s80 + 8)
		const j = ld64(s80)
		if (j == 0) {
			st64(a + 8, k)
			st64(a, l)
			return o
		}
		memcpy(se8, s68, 0x68)
		st64(s100, j, l, k)
		copyr(s70, s110, 0x10)
		st64(s80, program_id, s100)
		st64(s1000, amount_0_min, amount_1_min)
		o = fn_34050(s120, s80, q, r, amount_0_min, amount_1_min)
		l = ld64(s120)
		if (l == 2) {
			o = fn_b4c78(s130, s100, program_id)
			l = ld64(s130)
			st64(a + 8, ld64(s130 + 8))
			st64(a, l)
			return o
		}
		st64(a + 8, ld64(s120 + 8))
		st64(a, l)
		return o
	}
	const m = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (m & 3) - 2) {
		o = anchor_error_from(s140, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s140)
		st64(a + 8, ld64(s140 + 8))
		st64(a, l)
		return o
	}
	if ((m & 3) == 0) {
		o = anchor_error_from(s140, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s140)
		st64(a + 8, ld64(s140 + 8))
		st64(a, l)
		return o
	}
	const n = ld64(ld64(m + 7))
	if (n == 0) {
		o = anchor_error_from(s140, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s140)
		st64(a + 8, ld64(s140 + 8))
		st64(a, l)
		return o
	}
	callx(n, ld64(m - 1), n)
	o = anchor_error_from(s140, 0x66 /* anchor::InstructionDidNotDeserialize */)
	l = ld64(s140)
	st64(a + 8, ld64(s140 + 8))
	st64(a, l)
	return o
}

// Anchor Accounts::try_accounts of instruction decrease_liquidity_v2 (called by ix_decrease_liquidity_v2; name [str]: from the handler's "Instruction: …" log; was fn_b22c0)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_vault_0 (ConstraintMut, ConstraintRaw), token_vault_1 (ConstraintMut, ConstraintRaw), tick_array_lower (ConstraintMut, ConstraintRaw), tick_array_upper (ConstraintMut, ConstraintRaw), recipient_token_account_0 (ConstraintMut), recipient_token_account_1 (ConstraintMut), token_program, token_program_2022, memo_program (AccountNotEnoughKeys, ConstraintAddress), vault_0_mint (ConstraintAddress), vault_1_mint (ConstraintAddress), nft_account (ConstraintRaw), pool_state (ConstraintMut), personal_position (ConstraintMut, ConstraintRaw)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: vault_0_mint_box, vault_1_mint_box, token_vault_1_box, token_vault_1_box_2, token_vault_0, token_vault_1
function accounts_decrease_liquidity_v2(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s100 = fp - 0x100, s120 = fp - 0x120, s140 = fp - 0x140, s160 = fp - 0x160, s180 = fp - 0x180, s1a0 = fp - 0x1a0, s1c0 = fp - 0x1c0, s1d8 = fp - 0x1d8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s570 = fp - 0x570, s578 = fp - 0x578, s580 = fp - 0x580, s588 = fp - 0x588, s590 = fp - 0x590, s598 = fp - 0x598, s5a0 = fp - 0x5a0, s5a8 = fp - 0x5a8, s5b0 = fp - 0x5b0, s5b8 = fp - 0x5b8, s5c0 = fp - 0x5c0, s5c8 = fp - 0x5c8, s5d0 = fp - 0x5d0, s5d8 = fp - 0x5d8
	let s, t, u, v, w, x, aj, ak, am, an, ap, aq, at, au, aw, ax, az, ba, bd, be, bh, bi, bl: u64
	let vault_0_mint_box: Mint
	let q = try_accounts_17a30(s120, c, c, d, e, r0)
	const i = ld64(s120 + 8)
	let f = ld64(s120)
	if (f == 2) {
		q = try_accounts_1678(s120, c)
		if (ld32(s100 + 0x90) == 2) {
			const l = ld64(0x300000000 /* heap bump-allocator cursor */)
			f = ld64(s120)
			const m = l != 0 ? sat_sub(l, 0xb) : 0x300007ff5
			vault_0_mint_box = ld64(s120 + 8)
			if (f != 0) {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m, 0x6f6363615f74666e)
				st32(m + 7, 0x746e756f)
				void ld64(vault_0_mint_box)
			} else {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m, 0x6f6363615f74666e)
				st32(m + 7, 0x746e756f)
				void ld64(vault_0_mint_box)
			}
			st64(vault_0_mint_box.mint_authority + 0xc, m, 0xb)
			st64(vault_0_mint_box.mint_authority + 4, 0xb)
			st64(vault_0_mint_box, 1)
			st64(a + 0x10, vault_0_mint_box)
			st64(a + 8, f)
			st64(a, 0)
			return q
		}
		const j = ld64(0x300000000 /* heap bump-allocator cursor */)
		const k = j != 0 ? sat_sub(j, 0xd8) : 0x300007f28
		if (0x300000008 > k) {
			alloc_handle_alloc_error(8, 0xd8)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, k & -8)
		if ((k & -8) != 0) {
			memcpy(k & -8, s120, 0xd8)
			q = try_accounts_18368(s120, c)
			let ah = undef
			if (ld64(s120) == 0) {
				const z = ld64(0x300000000 /* heap bump-allocator cursor */)
				f = ld64(s120 + 8)
				const aa = z != 0 ? sat_sub(z, 0x11) : 0x300007fef
				vault_0_mint_box = ld64(s120 + 0x10)
				if (f != 0) {
					if (0x300000008 > aa) {
						raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, ah)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, aa)
					st64(aa + 8, 0x6f697469736f705f)
					st64(aa, 0x6c616e6f73726570)
					st8(aa + 0x10, 0x6e)
					void ld64(vault_0_mint_box)
				} else {
					if (0x300000008 > aa) {
						raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, ah)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, aa)
					st64(aa + 8, 0x6f697469736f705f)
					st64(aa, 0x6c616e6f73726570)
					st8(aa + 0x10, 0x6e)
					void ld64(vault_0_mint_box)
				}
				st64(vault_0_mint_box.mint_authority + 0xc, aa, 0x11)
				st64(vault_0_mint_box.mint_authority + 4, 0x11)
				st64(vault_0_mint_box, 1)
				st64(a + 0x10, vault_0_mint_box)
				st64(a + 8, f)
				st64(a, 0)
				return q
			}
			const o = ld64(0x300000000 /* heap bump-allocator cursor */)
			const p = o != 0 ? sat_sub(o, 0x120) : 0x300007ee0
			if (0x300000008 > p) {
				alloc_handle_alloc_error(8, 0x120)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, p & -8)
			if ((p & -8) != 0) {
				st64(s570, p & -8)
				memcpy(p & -8, s120, 0x120)
				fn_11e0(s120, c)
				q = ld64(s120 + 8)
				f = ld64(s120)
				if (f == 2) {
					st64(s580, q)
					const r = ld64(c + 8)
					if (r == 0) {
						anchor_error_from(s208, 0xbbd /* anchor::AccountNotEnoughKeys */, s, t, u)
						q = ld64(s208 + 8)
						f = ld64(s208)
						if (f != 2) {
							const ag = ld64(0x300000000 /* heap bump-allocator cursor */)
							ah = 0x11 > ag
							const ab = ah != 0 ? 0 : ag - 0x11
							const ai = ag != 0 ? ab : 0x300007fef
							if ((f & 1) != 0) {
								if (0x300000008 > ai) {
									raw_vec_handle_error(1, 0x11, 0x10015f8f8, ab, ah)
								}
								st64(0x300000000 /* heap bump-allocator cursor */, ai)
								st64(ai + 8, 0x6f697469736f705f)
								st64(ai, 0x6c6f636f746f7270)
								st8(ai + 0x10, 0x6e)
								void ld64(q)
							} else {
								if (0x300000008 > ai) {
									raw_vec_handle_error(1, 0x11, 0x10015f8f8, ab, ah)
								}
								st64(0x300000000 /* heap bump-allocator cursor */, ai)
								st64(ai + 8, 0x6f697469736f705f)
								st64(ai, 0x6c6f636f746f7270)
								st8(ai + 0x10, 0x6e)
								void ld64(q)
							}
							st64(q + 0x10, ai, 0x11)
							st64(q + 8, 0x11)
							st64(q, 1)
							st64(a + 0x10, q)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					} else {
						st64(c + 8, r - 1)
						q = ld64(c)
						st64(c, q + 0x30)
					}
					st64(s588, q)
					try_accounts_1678(s120, c, s, t, u)
					if (ld32(s100 + 0x90) == 2) {
						q = fn_4130(s218, ld64(s120), ld64(s120 + 8), "token_vault_0", 0xd)
						st64(s578, ld64(s218 + 8))
						f = ld64(s218)
						if (f != 2) {
							st64(a + 0x10, ld64(s578))
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					} else {
						const ae = ld64(0x300000000 /* heap bump-allocator cursor */)
						const af = ae != 0 ? sat_sub(ae, 0xd8) : 0x300007f28
						if (0x300000008 > af) {
							alloc_handle_alloc_error(8, 0xd8)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, af & -8)
						if ((af & -8) == 0) {
							alloc_handle_alloc_error(8, 0xd8)
						}
						st64(s578, af & -8)
						memcpy(af & -8, s120, 0xd8)
					}
					fn_7498(s120, c, v, w, x)
					vault_0_mint_box = ld64(s120 + 8)
					const y = ld64(s120)
					if (y != 2) {
						q = fn_4130(s228, y, vault_0_mint_box, "token_vault_1", 0xd)
						vault_0_mint_box = ld64(s228 + 8)
						f = ld64(s228)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s590, vault_0_mint_box)
					fn_13d0(s120, c, vault_0_mint_box, aj, ak)
					vault_0_mint_box = ld64(s120 + 8)
					const al = ld64(s120)
					if (al != 2) {
						q = fn_4130(s238, al, vault_0_mint_box, "tick_array_lower", 0x10)
						vault_0_mint_box = ld64(s238 + 8)
						f = ld64(s238)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s598, vault_0_mint_box)
					fn_13d0(s120, c, vault_0_mint_box, am, an)
					vault_0_mint_box = ld64(s120 + 8)
					const ao = ld64(s120)
					if (ao != 2) {
						q = fn_4130(s248, ao, vault_0_mint_box, "tick_array_upper", 0x10)
						vault_0_mint_box = ld64(s248 + 8)
						f = ld64(s248)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s5a0, vault_0_mint_box)
					fn_7498(s120, c, vault_0_mint_box, ap, aq)
					vault_0_mint_box = ld64(s120 + 8)
					const ar = ld64(s120)
					if (ar != 2) {
						q = fn_4130(s258, ar, vault_0_mint_box, "recipient_token_account_0", 0x19)
						vault_0_mint_box = ld64(s258 + 8)
						f = ld64(s258)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s5a8, vault_0_mint_box)
					fn_7498(s120, c, vault_0_mint_box, at, au)
					vault_0_mint_box = ld64(s120 + 8)
					const av = ld64(s120)
					if (av != 2) {
						q = fn_4130(s268, av, vault_0_mint_box, "recipient_token_account_1", 0x19)
						vault_0_mint_box = ld64(s268 + 8)
						f = ld64(s268)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s5b0, vault_0_mint_box)
					try_accounts_19190(s120, c, vault_0_mint_box, aw, ax)
					vault_0_mint_box = ld64(s120 + 8)
					const ay = ld64(s120)
					if (ay != 2) {
						q = fn_4130(s278, ay, vault_0_mint_box, 0x10015b020 /* "token_program" */, 0xd)
						vault_0_mint_box = ld64(s278 + 8)
						f = ld64(s278)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s5b8, vault_0_mint_box)
					fn_18cf0(s120, c, vault_0_mint_box, az, ba)
					vault_0_mint_box = ld64(s120 + 8)
					const bb = ld64(s120)
					if (bb != 2) {
						q = fn_4130(s288, bb, vault_0_mint_box, "token_program_2022", 0x12)
						vault_0_mint_box = ld64(s288 + 8)
						f = ld64(s288)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s5c0, vault_0_mint_box)
					const bc = ld64(c + 8)
					if (bc == 0) {
						anchor_error_from(s298, 0xbbd /* anchor::AccountNotEnoughKeys */, vault_0_mint_box, bd, be)
						vault_0_mint_box = ld64(s298 + 8)
						const bf = ld64(s298)
						if (bf != 2) {
							q = fn_4130(s2a8, bf, vault_0_mint_box, "memo_program", 0xc)
							vault_0_mint_box = ld64(s2a8 + 8)
							f = ld64(s2a8)
							if (f != 2) {
								st64(a + 0x10, vault_0_mint_box)
								st64(a + 8, f)
								st64(a, 0)
								return q
							}
						}
					} else {
						st64(c + 8, bc - 1)
						vault_0_mint_box = ld64(c)
						st64(c, vault_0_mint_box + 0x30)
					}
					st64(s5c8, vault_0_mint_box)
					fn_7768(s120, c, vault_0_mint_box, bd, be)
					vault_0_mint_box = ld64(s120 + 8)
					const bg = ld64(s120)
					if (bg != 2) {
						q = fn_4130(s2b8, bg, vault_0_mint_box, "vault_0_mint", 0xc)
						vault_0_mint_box = ld64(s2b8 + 8)
						f = ld64(s2b8)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s5d0, vault_0_mint_box)
					fn_7768(s120, c, vault_0_mint_box, bh, bi)
					let vault_1_mint_box: Mint = ld64(s120 + 8)
					const bj = ld64(s120)
					if (bj != 2) {
						q = fn_4130(s2c8, bj, vault_1_mint_box, "vault_1_mint", 0xc)
						vault_1_mint_box = ld64(s2c8 + 8)
						f = ld64(s2c8)
						bl = ld64(s570)
						if (f != 2) {
							st64(a + 0x10, vault_1_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					} else {
						bl = ld64(s570)
					}
					if ((memcmp((k & -8) + 0x28, bl + 8, 0x20) as u32) == 0) {
						if (ld64((k & -8) + 0x68) != 1) {
							anchor_error_from(s2f8, 0x7d3 /* anchor::ConstraintRaw */)
							q = fn_4130(s308, ld64(s2f8), ld64(s2f8 + 8), 0x10015b0ae /* "nft_account" */, 0xb)
							f = ld64(s308)
							st64(a + 0x10, ld64(s308 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
						const bm = ld64(i)
						copyr(s120, bm, 0x20)
						if ((memcmp((k & -8) + 0x48, s120, 0x20) as u32) == 0) {
							const bn = ld64(s570)
							if (ld8(ld64(bn) + 0x29) != 0) {
								const bo = ld64(ld64(s580) /* key */)
								copyr(s1f8, bo, 0x20)
								const bp = memcmp(bn + 0x28, s1f8, 0x20)
								if ((bp as u32) == 0) {
									if (ld8(ld64(s580) + 0x29 /* is_writable */) != 0) {
										const token_vault_0: AccountInfo = ld64(ld64(s578) + 0x20)
										if (token_vault_0.is_writable != 0) {
											const br = token_vault_0.key
											copyr(s120, br, 0x20)
											q = fn_4dc0(s1d8, ld64(s580), bp as u32)
											st64(s5d8, ld64(s1d8 + 0x10))
											let bs = ld64(s1d8 + 8)
											if (ld64(s1d8) != 0) {
												st64(a + 0x10, ld64(s5d8))
												st64(a + 8, bs)
												st64(a, 0)
												return q
											}
											const bu = memcmp(s120, bs + 0x81, 0x20)
											const bt = ld64(s5d8)
											st64(bt, ld64(bt) - 1)
											if ((bu as u32) == 0) {
												const token_vault_1: AccountInfo = ld64(ld64(s590) + 0x20)
												if (token_vault_1.is_writable != 0) {
													const bw = token_vault_1.key
													copyr(s120, bw, 0x20)
													q = fn_4dc0(s1d8, ld64(s580), bu as u32)
													st64(s5d8, ld64(s1d8 + 0x10))
													bs = ld64(s1d8 + 8)
													if (ld64(s1d8) != 0) {
														st64(a + 0x10, ld64(s5d8))
														st64(a + 8, bs)
														st64(a, 0)
														return q
													}
													const by = memcmp(s120, bs + 0xa1, 0x20)
													const bx = ld64(s5d8)
													st64(bx, ld64(bx) - 1)
													if ((by as u32) == 0) {
														if (ld8(ld64(s598) + 0x29) != 0) {
															q = fn_4bd8(s120, ld64(s598), by as u32)
															st64(s5d8, ld64(s120 + 0x10))
															f = ld64(s120 + 8)
															if (ld64(s120) != 0) {
																st64(a + 0x10, ld64(s5d8))
																st64(a + 8, f)
																st64(a, 0)
																return q
															}
															copyr(s120, s1f8, 0x20)
															const ca = memcmp(f, s120, 0x20)
															const bz = ld64(s5d8)
															st64(bz, ld64(bz) - 1)
															if ((ca as u32) == 0) {
																if (ld8(ld64(s5a0) + 0x29) != 0) {
																	q = fn_4bd8(s120, ld64(s5a0), ca as u32)
																	st64(s5d8, ld64(s120 + 0x10))
																	f = ld64(s120 + 8)
																	if (ld64(s120) != 0) {
																		st64(a + 0x10, ld64(s5d8))
																		st64(a + 8, f)
																		st64(a, 0)
																		return q
																	}
																	copyr(s120, s1f8, 0x20)
																	const cc = memcmp(f, s120, 0x20)
																	const cb = ld64(s5d8)
																	st64(cb, ld64(cb) - 1)
																	if ((cc as u32) == 0) {
																		if (ld8(ld64(ld64(s5a8) + 0x20) + 0x29) != 0) {
																			const cd = ld64(s578)
																			copyr(s120, cd + 0x28, 0x20)
																			if ((memcmp(ld64(s5a8) + 0x28, s120, 0x20) as u32) != 0) {
																				q = anchor_error_from(s4a8, 0x7de /* anchor::ConstraintTokenMint */)
																				f = ld64(s4a8)
																				st64(a + 0x10, ld64(s4a8 + 8))
																				st64(a + 8, f)
																				st64(a, 0)
																				return q
																			}
																			if (ld8(ld64(ld64(s5b0) + 0x20) + 0x29) != 0) {
																				const token_vault_1_box: TokenAccount = ld64(s590)
																				copyr(s120, token_vault_1_box.mint, 0x20)
																				if ((memcmp(ld64(s5b0) + 0x28, s120, 0x20) as u32) != 0) {
																					q = anchor_error_from(s4d8, 0x7de /* anchor::ConstraintTokenMint */)
																					f = ld64(s4d8)
																					st64(a + 0x10, ld64(s4d8 + 8))
																					st64(a + 8, f)
																					st64(a, 0)
																					return q
																				}
																				const cf = ld64(ld64(s5c8))
																				copyr(s1c0, cf, 0x20)
																				if ((memcmp(s1c0, 0x1001594c0 /* &MEMO_PROGRAM */, 0x20) as u32) == 0) {
																					const cj = ld64(s578)
																					const ck = ld64(ld64(ld64(s5d0) + 0x58))
																					copyr(s1a0, ck, 0x20)
																					copy(s180, cj + 0x28, 0x20)
																					if ((memcmp(s1a0, s180, 0x20) as u32) == 0) {
																						const token_vault_1_box_2: TokenAccount = ld64(s590)
																						const cp = vault_1_mint_box.info.key
																						copyr(s160, cp, 0x20)
																						copy(s140, token_vault_1_box_2.mint, 0x20)
																						q = memcmp(s160, s140, 0x20) as u32
																						if (q == 0) {
																							st64(a + 0x78, vault_1_mint_box)
																							st64(a + 0x70, ld64(s5d0))
																							st64(a + 0x68, ld64(s5c8))
																							st64(a + 0x60, ld64(s5c0))
																							st64(a + 0x58, ld64(s5b8))
																							st64(a + 0x50, ld64(s5b0))
																							st64(a + 0x48, ld64(s5a8))
																							st64(a + 0x40, ld64(s5a0))
																							st64(a + 0x38, ld64(s598))
																							st64(a + 0x30, ld64(s590))
																							st64(a + 0x28, ld64(s578))
																							st64(a + 0x20, ld64(s588))
																							st64(a + 0x18, ld64(s580))
																							st64(a + 0x10, ld64(s570))
																							st64(a + 8, k & -8)
																							st64(a, i)
																							return q
																						}
																						anchor_error_from(s548, 0x7dc /* anchor::ConstraintAddress */)
																						const cs = fn_4130(s558, ld64(s548), ld64(s548 + 8), "vault_1_mint", 0xc)
																						const cr = ld64(s558 + 8)
																						const cq = ld64(s558)
																						copy(s120, s160, 0x40)
																						q = Error_with_pubkeys(s568, cq, cr, s120, cs)
																						f = ld64(s568)
																						st64(a + 0x10, ld64(s568 + 8))
																						st64(a + 8, f)
																						st64(a, 0)
																						return q
																					}
																					anchor_error_from(s518, 0x7dc /* anchor::ConstraintAddress */)
																					const cn = fn_4130(s528, ld64(s518), ld64(s518 + 8), "vault_0_mint", 0xc)
																					const cm = ld64(s528 + 8)
																					const cl = ld64(s528)
																					copy(s120, s1a0, 0x40)
																					q = Error_with_pubkeys(s538, cl, cm, s120, cn)
																					f = ld64(s538)
																					st64(a + 0x10, ld64(s538 + 8))
																					st64(a + 8, f)
																					st64(a, 0)
																					return q
																				}
																				anchor_error_from(s4e8, 0x7dc /* anchor::ConstraintAddress */)
																				const ci = fn_4130(s4f8, ld64(s4e8), ld64(s4e8 + 8), "memo_program", 0xc)
																				const ch = ld64(s4f8 + 8)
																				const cg = ld64(s4f8)
																				copyr(s120, s1c0, 0x20)
																				st64(s100, 0x62129995a534a05 /* MEMO_PROGRAM */, 0x7c38da6071e8244d /* MEMO_PROGRAM[1] */, 0x81bb92bcddb5357c /* MEMO_PROGRAM[2] */, 0x8d44054140a81fe4 /* MEMO_PROGRAM[3] */) // key MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
																				q = Error_with_pubkeys(s508, cg, ch, s120, ci)
																				f = ld64(s508)
																				st64(a + 0x10, ld64(s508 + 8))
																				st64(a + 8, f)
																				st64(a, 0)
																				return q
																			}
																			anchor_error_from(s4b8, 0x7d0 /* anchor::ConstraintMut */)
																			q = fn_4130(s4c8, ld64(s4b8), ld64(s4b8 + 8), "recipient_token_account_1", 0x19)
																			f = ld64(s4c8)
																			st64(a + 0x10, ld64(s4c8 + 8))
																			st64(a + 8, f)
																			st64(a, 0)
																			return q
																		}
																		anchor_error_from(s488, 0x7d0 /* anchor::ConstraintMut */)
																		q = fn_4130(s498, ld64(s488), ld64(s488 + 8), "recipient_token_account_0", 0x19)
																		f = ld64(s498)
																		st64(a + 0x10, ld64(s498 + 8))
																		st64(a + 8, f)
																		st64(a, 0)
																		return q
																	}
																	anchor_error_from(s468, 0x7d3 /* anchor::ConstraintRaw */)
																	q = fn_4130(s478, ld64(s468), ld64(s468 + 8), "tick_array_upper", 0x10)
																	f = ld64(s478)
																	st64(a + 0x10, ld64(s478 + 8))
																	st64(a + 8, f)
																	st64(a, 0)
																	return q
																}
																anchor_error_from(s448, 0x7d0 /* anchor::ConstraintMut */)
																q = fn_4130(s458, ld64(s448), ld64(s448 + 8), "tick_array_upper", 0x10)
																f = ld64(s458)
																st64(a + 0x10, ld64(s458 + 8))
																st64(a + 8, f)
																st64(a, 0)
																return q
															}
															anchor_error_from(s428, 0x7d3 /* anchor::ConstraintRaw */)
															q = fn_4130(s438, ld64(s428), ld64(s428 + 8), "tick_array_lower", 0x10)
															f = ld64(s438)
															st64(a + 0x10, ld64(s438 + 8))
															st64(a + 8, f)
															st64(a, 0)
															return q
														}
														anchor_error_from(s408, 0x7d0 /* anchor::ConstraintMut */)
														q = fn_4130(s418, ld64(s408), ld64(s408 + 8), "tick_array_lower", 0x10)
														f = ld64(s418)
														st64(a + 0x10, ld64(s418 + 8))
														st64(a + 8, f)
														st64(a, 0)
														return q
													}
													anchor_error_from(s3e8, 0x7d3 /* anchor::ConstraintRaw */)
													q = fn_4130(s3f8, ld64(s3e8), ld64(s3e8 + 8), "token_vault_1", 0xd)
													f = ld64(s3f8)
													st64(a + 0x10, ld64(s3f8 + 8))
													st64(a + 8, f)
													st64(a, 0)
													return q
												}
												anchor_error_from(s3c8, 0x7d0 /* anchor::ConstraintMut */)
												q = fn_4130(s3d8, ld64(s3c8), ld64(s3c8 + 8), "token_vault_1", 0xd)
												f = ld64(s3d8)
												st64(a + 0x10, ld64(s3d8 + 8))
												st64(a + 8, f)
												st64(a, 0)
												return q
											}
											anchor_error_from(s3a8, 0x7d3 /* anchor::ConstraintRaw */)
											q = fn_4130(s3b8, ld64(s3a8), ld64(s3a8 + 8), "token_vault_0", 0xd)
											f = ld64(s3b8)
											st64(a + 0x10, ld64(s3b8 + 8))
											st64(a + 8, f)
											st64(a, 0)
											return q
										}
										anchor_error_from(s388, 0x7d0 /* anchor::ConstraintMut */)
										q = fn_4130(s398, ld64(s388), ld64(s388 + 8), "token_vault_0", 0xd)
										f = ld64(s398)
										st64(a + 0x10, ld64(s398 + 8))
										st64(a + 8, f)
										st64(a, 0)
										return q
									}
									anchor_error_from(s368, 0x7d0 /* anchor::ConstraintMut */)
									q = fn_4130(s378, ld64(s368), ld64(s368 + 8), "pool_state", 0xa)
									f = ld64(s378)
									st64(a + 0x10, ld64(s378 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return q
								}
								anchor_error_from(s348, 0x7d3 /* anchor::ConstraintRaw */)
								q = fn_4130(s358, ld64(s348), ld64(s348 + 8), 0x10015b06a /* "personal_position" */, 0x11)
								f = ld64(s358)
								st64(a + 0x10, ld64(s358 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return q
							}
							anchor_error_from(s328, 0x7d0 /* anchor::ConstraintMut */, bn)
							q = fn_4130(s338, ld64(s328), ld64(s328 + 8), 0x10015b06a /* "personal_position" */, 0x11)
							f = ld64(s338)
							st64(a + 0x10, ld64(s338 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
						q = anchor_error_from(s318, 0x7df /* anchor::ConstraintTokenOwner */)
						f = ld64(s318)
						st64(a + 0x10, ld64(s318 + 8))
						st64(a + 8, f)
						st64(a, 0)
						return q
					}
					anchor_error_from(s2d8, 0x7d3 /* anchor::ConstraintRaw */)
					q = fn_4130(s2e8, ld64(s2d8), ld64(s2d8 + 8), 0x10015b0ae /* "nft_account" */, 0xb)
					f = ld64(s2e8)
					st64(a + 0x10, ld64(s2e8 + 8))
					st64(a + 8, f)
					st64(a, 0)
					return q
				}
				const ac = ld64(0x300000000 /* heap bump-allocator cursor */)
				const ad = ac != 0 ? sat_sub(ac, 0xa) : 0x300007ff6
				if ((f & 1) != 0) {
					if (0x300000008 > ad) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, sat_sub(ac, 0xa), 0xa > ac)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, ad)
					st64(ad, 0x6174735f6c6f6f70)
					st16(ad + 8, 0x6574)
					void ld64(q)
				} else {
					if (0x300000008 > ad) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, sat_sub(ac, 0xa), 0xa > ac)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, ad)
					st64(ad, 0x6174735f6c6f6f70)
					st16(ad + 8, 0x6574)
					void ld64(q)
				}
				st64(q + 0x10, ad, 0xa)
				st64(q + 8, 0xa)
				st64(q, 1)
				st64(a + 0x10, q)
				st64(a + 8, f)
				st64(a, 0)
				return q
			}
			alloc_handle_alloc_error(8, 0x120)
		}
		alloc_handle_alloc_error(8, 0xd8)
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
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(g, 9), 9 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x656e776f5f74666e)
		st8(h + 8, 0x72)
		void ld64(i)
	}
	st64(i + 0x10, h, 9)
	st64(i + 8, 9)
	st64(i, 1)
	st64(a + 0x10, i)
	st64(a + 8, f)
	st64(a, 0)
	return q
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: AccountInfo, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value)
// types [heur]: b: DecreaseLiquidityV2Context (the handler ix_decrease_liquidity_v2 passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_34050(a: u64, b: DecreaseLiquidityV2Context, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s28 = fp - 0x28, s30 = fp - 0x30, s38 = fp - 0x38, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60, s68 = fp - 0x68, s80 = fp - 0x80, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sd0 = fp - 0xd0, sfc0 = fp - 0xfc0, s1000 = fp - 0x1000
	const accounts: DecreaseLiquidityV2Accounts = b.accounts
	let be = accounts
	const g: AccountInfo = ld64(ld64(accounts + 0x28) + 0x20)
	const h: LamportsCell = g.lamports
	const o = g.key
	rc_inc(h)
	const i: DataCell = g.data
	const bd = p6
	const j = p5
	rc_inc(i)
	const n = g.owner
	const m = g.rent_epoch
	const l = g.is_signer
	const k = g.is_writable
	st8(s98 + 2, g.executable)
	st8(s98, l, k)
	st64(sc0, o, h, i, n, m)
	const p: AccountInfo = ld64(ld64(be + 0x30) + 0x20)
	const q: LamportsCell = p.lamports
	const w = p.key
	rc_inc(q)
	const r: DataCell = p.data
	rc_inc(r)
	const v = p.owner
	const u = p.rent_epoch
	const t = p.is_signer
	const s = p.is_writable
	st8(s68 + 2, p.executable)
	st8(s68, t, s)
	st64(s90, w, q, r, v, u)
	const x: AccountInfo = ld64(ld64(be + 0x48) + 0x20)
	const y: LamportsCell = x.lamports
	const ae = x.key
	rc_inc(y)
	const z: DataCell = x.data
	rc_inc(z)
	const ad = x.owner
	const ac = x.rent_epoch
	const ab = x.is_signer
	const aa = x.is_writable
	st8(s38 + 2, x.executable)
	st8(s38, ab, aa)
	st64(s60, ae, y, z, ad, ac)
	const af: AccountInfo = ld64(ld64(be + 0x50) + 0x20)
	const ag: LamportsCell = af.lamports
	const am = af.key
	rc_inc(ag)
	const ah: DataCell = af.data
	rc_inc(ah)
	const al = af.owner
	const ak = af.rent_epoch
	const aj = af.is_signer
	const ai = af.is_writable
	st8(s8 + 2, af.executable)
	st8(s8, aj, ai)
	st64(s30, am, ag, ah, al, ak)
	const an = ld64(0x300000000 /* heap bump-allocator cursor */)
	const ao = an != 0 ? sat_sub(an, 0x80) & -8 : 0x300007f80
	if (ao > 0x300000007) {
		const bc = ld64(be + 0x60)
		const ap = ld64(be + 0x70)
		st64(0x300000000 /* heap bump-allocator cursor */, ao)
		const aq = ld64(ap + 0x58)
		memcpy(ao, ap, 0x58)
		st64(ao + 0x58, aq)
		st64(ao + 0x78, ld64(ap + 0x78))
		st64(ao + 0x70, ld64(ap + 0x70))
		st64(ao + 0x68, ld64(ap + 0x68))
		st64(ao + 0x60, ld64(ap + 0x60))
		const ar = ld64(0x300000000 /* heap bump-allocator cursor */)
		const at = ar != 0 ? sat_sub(ar, 0x80) & -8 : 0x300007f80
		if (at > 0x300000007) {
			const au = be
			const av = ld64(be + 0x78)
			st64(0x300000000 /* heap bump-allocator cursor */, at)
			be = ld64(av + 0x58)
			const ay = memcpy(at, av, 0x58)
			st64(at + 0x58, be)
			copy(at + 0x60, av + 0x60, 0x20)
			const remaining_accounts: AccountInfo = b.remaining_accounts
			const aw = b.remaining_accounts_len
			st64(sfc0, ao, at, remaining_accounts, aw, c, d, j, bd)
			st64(s1000, s90, au + 0x38, au + 0x40, s60, s30, au + 0x58, bc)
			let az = fn_2d880(sd0, au + 0x18, au + 0x10, sc0, fp, ay)
			const ba = ld64(sd0 + 8)
			const bb = ld64(sd0)
			if (rc_release(ag)) {
				az = Rc_drop_slow_14df0(s28, az)
			}
			if (rc_release(ah)) {
				az = Rc_drop_slow_14df0(s20, az)
			}
			if (rc_release(y)) {
				az = Rc_drop_slow_14df0(s58, az)
			}
			if (rc_release(z)) {
				az = Rc_drop_slow_14df0(s50, az)
			}
			if (rc_release(q)) {
				az = Rc_drop_slow_14df0(s88, az)
			}
			if (rc_release(r)) {
				az = Rc_drop_slow_14df0(s80, az)
			}
			if (rc_release(h)) {
				az = Rc_drop_slow_14df0(sb8, az)
			}
			if (!rc_release(i)) {
				st64(a + 8, ba)
				st64(a, bb)
				return az
			}
			az = Rc_drop_slow_14df0(sb0, az)
			st64(a + 8, ba)
			st64(a, bb)
			return az
		}
		alloc_handle_alloc_error(8, 0x80)
	}
	alloc_handle_alloc_error(8, 0x80)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: tick_array_upper, recipient_token_account_0, recipient_token_account_1
function fn_b4c78(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8
	let i, o, p, ac: u64
	let ab = fn_b4e0(s28, ld64(b + 0x10), 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
	let f = ld64(s28)
	if (f == 2) {
		ab = fn_a80(s38, ld64(b + 0x18), c)
		f = ld64(s38)
		if (f == 2) {
			B46: {
				const l = ld64(b + 0x28)
				const m = ld64(l + 0x20)
				if ((memcmp(l, c, 0x20) as u32) == 0 && (common_is_closed(m) == 0 && ld64(ld64(m + 0x10) + 0x10) != 0)) {
					st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
					ab = fn_13e628(s48, s18)
					f = ld64(s48)
					if (f != 2) {
						const n = ld64(0x300000000 /* heap bump-allocator cursor */)
						o = 0xd > n
						p = n != 0 ? o != 0 ? 0 : n - 0xd : 0x300007ff3
						i = ld64(s48 + 8)
						if ((f & 1) != 0) {
							if (0x300000008 > p) {
								raw_vec_handle_error(1, 0xd, 0x10015f8f8, o, ac)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, p)
							st64(p + 5, 0x305f746c7561765f)
							st64(p, 0x61765f6e656b6f74)
							void ld64(i)
							break B46
						}
						if (0x300000008 > p) {
							raw_vec_handle_error(1, 0xd, 0x10015f8f8, o, ac)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, p)
						st64(p + 5, 0x305f746c7561765f)
						st64(p, 0x61765f6e656b6f74)
						void ld64(i)
						break B46
					}
				}
				const q = ld64(b + 0x30)
				const r = ld64(q + 0x20)
				if ((memcmp(q, c, 0x20) as u32) == 0 && (common_is_closed(r) == 0 && ld64(ld64(r + 0x10) + 0x10) != 0)) {
					st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
					ab = fn_13e628(s58, s18)
					f = ld64(s58)
					if (f != 2) {
						const s = ld64(0x300000000 /* heap bump-allocator cursor */)
						o = 0xd > s
						p = s != 0 ? o != 0 ? 0 : s - 0xd : 0x300007ff3
						i = ld64(s58 + 8)
						if ((f & 1) != 0) {
							if (0x300000008 > p) {
								raw_vec_handle_error(1, 0xd, 0x10015f8f8, o, ac)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, p)
							st64(p + 5, 0x315f746c7561765f)
							st64(p, 0x61765f6e656b6f74)
							void ld64(i)
							break B46
						}
						if (0x300000008 > p) {
							raw_vec_handle_error(1, 0xd, 0x10015f8f8, o, ac)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, p)
						st64(p + 5, 0x315f746c7561765f)
						st64(p, 0x61765f6e656b6f74)
						void ld64(i)
						break B46
					}
				}
				ab = fn_1008(s68, ld64(b + 0x38), c)
				f = ld64(s68)
				if (f == 2) {
					fn_1008(s78, ld64(b + 0x40), c)
					const v = ld64(s78)
					if (v != 2) {
						ab = fn_4130(s88, v, ld64(s78 + 8), "tick_array_upper", 0x10)
						i = ld64(s88 + 8)
						f = ld64(s88)
						if (f != 2) {
							st64(a + 8, i)
							st64(a, f)
							return ab
						}
					}
					const w = ld64(b + 0x48)
					fn_a1d8(s98, ld64(w + 0x20), w, c)
					const x = ld64(s98)
					if (x != 2) {
						ab = fn_4130(sa8, x, ld64(s98 + 8), "recipient_token_account_0", 0x19)
						i = ld64(sa8 + 8)
						f = ld64(sa8)
						if (f != 2) {
							st64(a + 8, i)
							st64(a, f)
							return ab
						}
					}
					const y = ld64(b + 0x50)
					ab = fn_a1d8(sb8, ld64(y + 0x20), y, c)
					i = undef
					const z = ld64(sb8)
					if (z == 2) {
						st64(a + 8, i)
						st64(a, 2)
						return ab
					}
					ab = fn_4130(sc8, z, ld64(sb8 + 8), "recipient_token_account_1", 0x19)
					i = undef
					const aa = ld64(sc8)
					if (aa == 2) {
						st64(a + 8, i)
						st64(a, 2)
						return ab
					}
					st64(a + 8, ld64(sc8 + 8))
					st64(a, aa)
					return ab
				}
				const t = ld64(0x300000000 /* heap bump-allocator cursor */)
				const u = t != 0 ? sat_sub(t, 0x10) : 0x300007ff0
				i = ld64(s68 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > u) {
						raw_vec_handle_error(1, 0x10, 0x10015f8f8, 0x10 > t)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, u)
					st64(u + 8, 0x7265776f6c5f7961)
					st64(u, 0x7272615f6b636974)
					void ld64(i)
				} else {
					if (0x300000008 > u) {
						raw_vec_handle_error(1, 0x10, 0x10015f8f8, 0x10 > t)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, u)
					st64(u + 8, 0x7265776f6c5f7961)
					st64(u, 0x7272615f6b636974)
					void ld64(i)
				}
				st64(i + 0x10, u, 0x10)
				st64(i + 8, 0x10)
				st64(i, 1)
				st64(a + 8, i)
				st64(a, f)
				return ab
			}
			st64(i + 0x10, p, 0xd)
			st64(i + 8, 0xd)
			st64(i, 1)
			st64(a + 8, i)
			st64(a, f)
			return ab
		}
		const j = ld64(0x300000000 /* heap bump-allocator cursor */)
		const k = j != 0 ? sat_sub(j, 0xa) : 0x300007ff6
		i = ld64(s38 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > k) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, k)
			st64(k, 0x6174735f6c6f6f70)
			st16(k + 8, 0x6574)
			void ld64(i)
		} else {
			if (0x300000008 > k) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, k)
			st64(k, 0x6174735f6c6f6f70)
			st16(k + 8, 0x6574)
			void ld64(i)
		}
		st64(i + 0x10, k, 0xa)
		st64(i + 8, 0xa)
		st64(i, 1)
		st64(a + 8, i)
		st64(a, f)
		return ab
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0x11) : 0x300007fef
	i = ld64(s28 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x11 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 8, 0x6f697469736f705f)
		st64(h, 0x6c616e6f73726570)
		st8(h + 0x10, 0x6e)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x11 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 8, 0x6f697469736f705f)
		st64(h, 0x6c616e6f73726570)
		st8(h + 0x10, 0x6e)
		void ld64(i)
	}
	st64(i + 0x10, h, 0x11)
	st64(i + 8, 0x11)
	st64(i, 1)
	st64(a + 8, i)
	st64(a, f)
	return ab
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

// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: tick_array_state_data: TickArrayStateAccount
function fn_4bd8(a: u64, b: u64, r0: u64): u64 {
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
	const tick_array_state_data: TickArrayStateAccount = ld64(g)
	const j = tick_array_state_data.discriminator
	if (j == 0x2a81f931cd559bc0 /* account:TickArrayState */) {
		if (h > 0x27ff) {
			st64(a + 0x10, k)
			st64(a + 8, tick_array_state_data.pool_id)
			st64(a, 0)
			return n
		}
		fn_153158(0x2800, h, 0x10015f700, 0x2a81f931cd559bc0 /* account:TickArrayState */)
	}
	n = anchor_error_from(s38, 0xbba /* anchor::AccountDiscriminatorMismatch */, j, 0x2a81f931cd559bc0 /* account:TickArrayState */)
	m = ld64(s38)
	st64(a + 0x10, ld64(s38 + 8))
	st64(a + 8, m)
	st64(a, 1)
	st64(k, ld64(k) - 1)
	return n
}

function fn_2d880(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s40 = fp - 0x40, s47 = fp - 0x47, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se0 = fp - 0xe0, sf8 = fp - 0xf8, s100 = fp - 0x100, s118 = fp - 0x118, s138 = fp - 0x138, s158 = fp - 0x158, s178 = fp - 0x178, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s280 = fp - 0x280, s2a8 = fp - 0x2a8, s2c0 = fp - 0x2c0, s2c8 = fp - 0x2c8, s2d0 = fp - 0x2d0, s2d8 = fp - 0x2d8, s2e0 = fp - 0x2e0, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, s300 = fp - 0x300, s308 = fp - 0x308, s310 = fp - 0x310, s318 = fp - 0x318, s320 = fp - 0x320, s328 = fp - 0x328, s330 = fp - 0x330, s338 = fp - 0x338, s340 = fp - 0x340, s348 = fp - 0x348, s350 = fp - 0x350, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let l, p, u, ad, ae, af: u64
	st64(s280 + 0x40, b)
	let n = a
	st64(s280 + 0x30, c)
	const f = ld64(c)
	const g = ld64(e - 0xfa0)
	let j = g > ld64(f + 0x48)
	const i = ld64(e - 0xf98)
	const h = ld64(f + 0x50)
	j = h != i ? i > h : j
	if ((j & 1) != 0) {
		ErrorCode_name(s138, 0x100159858, h, d, e)
		st64(s78, 0, 1, 0)
		st64(s28, s78, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s40 + 8, 0)
		st64(s48, 0)
		if (ErrorCode_fmt(0x100159858, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(se0, s78, 0x18)
		copy(sf8, s138, 0x18)
		st64(s118 + 8, 0x100159f11)
		st32(sc8 + 0x48, 0x9ca /* anchor::RequireGteViolated */)
		st8(sc8, 2)
		st32(s100, 0x88)
		st64(s118 + 0x10, 0x33)
		st64(s118, 0)
		fn_13e5a0(s220, s118)
		const ab = ld64(s220 + 8)
		const aa = ld64(s220)
		const ac = ld64(f + 0x48)
		const z = ld64(f + 0x50)
		st64(s1000, z, g, i)
		p = fn_2be8(s230, aa, ab, ac, z, g, i)
		l = ld64(s230)
		st64(n + 8, ld64(s230 + 8))
		st64(n, l)
		return p
	}
	st64(s2d0, d)
	st64(s2a8 + 8, i)
	st64(s2f8, f)
	st64(s2a8, g)
	st64(s2e0, ld64(e - 0xf88))
	st64(s2c8, ld64(e - 0xf90))
	const w = ld64(e - 0xfa8)
	st64(s280 + 0x48, ld64(e - 0xfb0))
	const r = ld64(e - 0xfb8)
	st64(s2c0 + 0x10, ld64(e - 0xfc0))
	copyr(s2c0, e - 0xfd8, 0x10)
	st64(s2f0, ld64(e - 0xfe0))
	st64(s2d8, ld64(e - 0xfe8))
	st64(s2a8 + 0x10, ld64(e - 0xff0))
	st64(s2a8 + 0x18, ld64(e - 0xff8))
	st64(s2e8, ld64(e - 0x1000))
	st64(s190, 0, 8, 0)
	p = fn_4dc0(s118, ld64(ld64(s280 + 0x40)), r0)
	const k = ld64(s118 + 0x10)
	l = ld64(s118 + 8)
	let v = k
	if (ld64(s118) != 0) {
		st64(n + 8, v)
		st64(n, l)
		return p
	}
	st64(s300, k)
	if ((ld8(l + 0x17d) & 0xe) == 0xe) {
		fn_85138(s138, 0x10015982c)
		st64(s78, 0, 1, 0)
		st64(s28, s78, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s40 + 8, 0)
		st64(s48, 0)
		if (fn_88558(0x10015982c, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(se0, s78, 0x18)
		copy(sf8, s138, 0x18)
		st64(s118 + 8, 0x100159f11)
		st32(sc8 + 0x48, 0x1770 /* error::NotApproved */)
		st8(sc8, 2)
		st32(s100, 0x95)
		st64(s118 + 0x10, 0x33)
		st64(s118, 0)
		p = fn_13e5a0(s210, s118)
		v = ld64(s210 + 8)
		l = ld64(s210)
		ad = ld64(s300)
		st64(ad, ld64(ad) - 1)
		st64(n + 8, v)
		st64(n, l)
		return p
	}
	const m = ld64(0x300000000 /* heap bump-allocator cursor */)
	st64(s310, n)
	const o = m != 0 ? sat_sub(m, 8) & -4 : 0x300007ff8
	if (0x300000008 > o) {
		alloc_handle_alloc_error(4, 8)
	}
	st64(s330, ld64(l + 0xfd))
	st64(s328, ld64(l + 0xf5))
	st64(s320, ld64(l + 0xed))
	st64(s318, ld64(l + 0xe5))
	st64(s280 + 0x20, l)
	st64(s338, ld32(l + 0x105))
	st64(0x300000000 /* heap bump-allocator cursor */, o)
	p = fn_4bd8(s118, ld64(ld64(s2a8 + 0x18)), p)
	v = ld64(s118 + 0x10)
	let q = ld64(s118 + 8)
	if (ld64(s118) != 0) {
		n = ld64(s310)
		ad = ld64(s300)
		st64(ad, ld64(ad) - 1)
		st64(n + 8, v)
		st64(n, q)
		return p
	}
	st64(s280 + 0x38, ld32(q + 0x20))
	p = fn_4bd8(s118, ld64(ld64(s2a8 + 0x10)), p)
	const t = ld64(s118 + 0x10)
	q = ld64(s118 + 8)
	if (ld64(s118) != 0) {
		st64(v, ld64(v) - 1)
		n = ld64(s310)
		ad = ld64(s300)
		st64(ad, ld64(ad) - 1)
		st64(n + 8, t)
		st64(n, q)
		return p
	}
	B28: {
		B25: {
			st64(s350, r)
			st32(o + 4, ld32(q + 0x20))
			st32(o, ld64(s280 + 0x38))
			st64(s48, 2, o, 2)
			const s = ld64(s280 + 0x20)
			u = fn_6f618(s, s48)
			let y = s
			st64(s348, u)
			st64(t, ld64(t) - 1)
			st64(v, ld64(v) - 1)
			af = 0
			st64(s340, 0)
			if (w != 0) {
				let x = ld64(s280 + 0x48)
				st64(s2a8 + 0x20, x + w * 0x30)
				st64(s280 + 0x28, 8)
				st64(s280, s47, y + 0x61, y + 0x41, y + 1)
				st64(s308, y + 0x17f)
				ae = 0
				L16: while (true) {
					st64(s340, ae)
					let ai = af << 3
					ae = x
					while (true) {
						st64(s280 + 0x38, ai)
						const aj = ld64(ae)
						copyr(s178, aj, 0x20)
						let al = 1
						const ak = ld16(y + 0x17f)
						st64(s280 + 0x48, af)
						if (ak != 0) {
							al = ld64(s308)
						}
						st64(sc8, y)
						st64(sf8 + 0x10, ld64(s280 + 8))
						st64(sf8, ld64(s280 + 0x10))
						st64(s118 + 0x10, ld64(s280 + 0x18))
						st64(s118, 0x10015984c)
						st64(sd8, al, (ak != 0) << 1)
						st64(sc8 + 8, 1)
						st64(se0, 0x20)
						st64(sf8 + 8, 0x20)
						st64(s100, 0x20)
						st64(s118 + 8, 4)
						st64(s78, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
						// PDA create_program_address(["pool", *(ld64(s280 + 0x18)), *(ld64(s280 + 0x10)), *(ld64(s280 + 8)), al[..(ak != 0) << 1], y[..1]], program *s78)
						Pubkey_create_program_address(s48, s118, 6, s78, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */)
						if (ld8(s48) == 1) {
							st8(s138, ld8(s47))
							fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s138, 0x100160228, 0x100160248)
						}
						const am = ld64(s280)
						copyr(s138, am, 0x20)
						st64(s78, 0x1001595c0, 0x20, s138, 0x20)
						st64(s48, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
						// PDA find_program_address(["pool_tick_array_bitmap_extension", *am], program *s48)
						Pubkey_find_program_address(s118, s78, 2, s48)
						copyr(s158, s118, 0x20)
						if ((memcmp(s178, s158, 0x20) as u32) == 0) {
							x = ae + 0x30
							af = ld64(s280 + 0x48)
							y = ld64(s280 + 0x20)
							u = 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */
							if (x == ld64(s2a8 + 0x20)) {
								break B28
							}
							continue L16
						}
						let ah = ld64(s280 + 0x48)
						const ag = ld64(s280 + 0x38)
						if (ah == ld64(s190)) {
							fn_152e0(s190)
							ah = ld64(s280 + 0x48)
							st64(s280 + 0x28, ld64(s190 + 8))
						}
						st64(ld64(s280 + 0x28) + ag, ae)
						ae = ae + 0x30
						ai = ag + 8
						af = ah + 1
						st64(s190 + 0x10, af)
						y = ld64(s280 + 0x20)
						u = 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */
						if (ae == ld64(s2a8 + 0x20)) {
							break B25
						}
					}
				}
			}
		}
		ae = ld64(s340)
		if ((ld64(s348) & ae == 0) != 0) {
			fn_85138(s138, 0x1001598ec)
			st64(s78, 0, 1, 0)
			st64(s28, s78, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s40 + 8, 0)
			st64(s48, 0)
			if (fn_88558(0x1001598ec, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(se0, s78, 0x18)
			copy(sf8, s138, 0x18)
			st64(s118 + 8, 0x100159f11)
			st32(sc8 + 0x48, 0x1793 /* error::MissingTickArrayBitmapExtensionAccount */)
			st8(sc8, 2)
			st32(s100, 0xab)
			st64(s118 + 0x10, 0x33)
			st64(s118, 0)
			p = fn_13e5a0(s200, s118)
			v = ld64(s200 + 8)
			l = ld64(s200)
			n = ld64(s310)
			ad = ld64(s300)
			st64(ad, ld64(ad) - 1)
			st64(n + 8, v)
			st64(n, l)
			return p
		}
	}
	st64(s280 + 0x48, af)
	const an = ld64(s300)
	st64(an, ld64(an) - 1)
	st64(sff0 + 8, ld64(s2a8 + 8))
	const ao = ld64(s2a8)
	st64(sff8, ae, ao)
	st64(s1000, ld64(s2a8 + 0x10))
	p = fn_2f968(s118, ld64(s280 + 0x40), ld64(s280 + 0x30), ld64(s2a8 + 0x18), fp, u)
	const ap = ld64(s118 + 8)
	if (ld64(s118) != 0) {
		n = ld64(s310)
		st64(n + 8, ld64(s118 + 0x10))
		st64(n, ap)
		return p
	}
	let av = 0
	st64(s280 + 0x30, ld64(sf8))
	const au = ld64(s100)
	st64(s280 + 0x38, ld64(s118 + 0x10))
	let ar = 0
	n = ld64(s310)
	const aq = ld64(s2c0 + 0x10)
	if (aq != 0) {
		p = fn_7da68(s118, fn_16330(aq), ap)
		av = 0
		ar = ld64(s118 + 8)
		l = ld64(s118)
		if (l != 2) {
			st64(n + 8, ar)
			st64(n, l)
			return p
		}
	}
	const at = ld64(s350)
	st64(s280 + 0x28, ar)
	if (at != 0) {
		p = fn_7da68(s118, fn_16330(at), au)
		ar = ld64(s280 + 0x28)
		av = ld64(s118 + 8)
		l = ld64(s118)
		if (l != 2) {
			st64(n + 8, av)
			st64(n, l)
			return p
		}
	}
	st64(s100, ld64(s330))
	st64(s118 + 0x10, ld64(s328))
	st64(s118 + 8, ld64(s320))
	st64(s118, ld64(s318))
	st32(sc8, ld64(s338))
	st64(s280 + 0x18, av)
	st64(sd8, ar, av)
	st64(se0, ld64(s280 + 0x30))
	st64(sf8 + 0x10, ld64(s280 + 0x38))
	st64(s280 + 0x20, au)
	st64(sf8, ap, au)
	fn_10f958(s48, s118)
	copyr(s78, s40, 0x10)
	log_data(s78, 1)
	const bb = ld64(s2c0 + 8)
	let aw = ap
	if ((ao | ld64(s2a8 + 8)) != 0) {
		const bc = aw
		const bd = ld64(s280 + 0x28)
		if (bd > aw) {
			fn_154788(0x10015fbb0, bb, aw)
		}
		aw = bc
		const be = ld64(s2c8)
		const bg = ld64(s280 + 0x18)
		if (be > bc - bd) {
			fn_85138(s138, 0x100159904)
			st64(s78, 0, 1, 0)
			st64(s28, s78, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s40 + 8, 0)
			st64(s48, 0)
			if (fn_88558(0x100159904, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(se0, s78, 0x18)
			copy(sf8, s138, 0x18)
			st64(s118 + 8, 0x100159f11)
			st32(sc8 + 0x48, 0x1781 /* error::PriceSlippageCheck */)
			st8(sc8, 2)
			st32(s100, 0xda)
			st64(s118 + 0x10, 0x33)
			st64(s118, 0)
			fn_13e5a0(s1c0, s118)
			p = fn_1730(s1d0, ld64(s1c0), ld64(s1c0 + 8), bc - bd, be)
			l = ld64(s1d0)
			st64(n + 8, ld64(s1d0 + 8))
			st64(n, l)
			return p
		}
		const bf = ld64(s280 + 0x20)
		if (bg > bf) {
			fn_154788(0x10015fbc8, bb, aw)
		}
		if (ld64(s2e0) > bf - bg) {
			fn_85138(s138, 0x100159904)
			st64(s78, 0, 1, 0)
			st64(s28, s78, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s40 + 8, 0)
			st64(s48, 0)
			if (fn_88558(0x100159904, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(se0, s78, 0x18)
			copy(sf8, s138, 0x18)
			st64(s118 + 8, 0x100159f11)
			st32(sc8 + 0x48, 0x1781 /* error::PriceSlippageCheck */)
			st8(sc8, 2)
			st32(s100, 0xdf)
			st64(s118 + 0x10, 0x33)
			st64(s118, 0)
			fn_13e5a0(s1a0, s118)
			p = fn_1730(s1b0, ld64(s1a0), ld64(s1a0 + 8), bf - bg, ld64(s2e0))
			l = ld64(s1b0)
			st64(n + 8, ld64(s1b0 + 8))
			st64(n, l)
			return p
		}
	}
	const ax = aw
	const ay = ld64(s280 + 0x38)
	st64(s2a8 + 0x20, aw)
	if (aw > aw + ay) {
		fn_154730(0x10015fbe0, bb, aw)
	}
	const az = ld64(s280 + 0x20)
	const ba = ld64(s280 + 0x30)
	const bh = ld64(s2c0 + 0x10)
	const cq = ld64(s350)
	if (az > az + ba) {
		fn_154730(0x10015fbf8, bb, cq, az + ba)
	}
	st64(s280 + 8, az + ba)
	if (bb == 0) {
		st8(s60 + 0x12, 2)
	} else {
		AccountInfo_clone_f338(s78, bb)
	}
	AccountInfo_clone_f440(s48, ld64(s2d0))
	let bo = 0
	if (bh != 0) {
		bo = fn_16330(bh)
	}
	let bm = 2
	const bn = ld64(ld64(s2c0))
	const bi = ld8(s60 + 0x12)
	if (bi != 2) {
		const bj = ld64(s78 + 8)
		const bl = ld64(s78)
		rc_inc(bj)
		const bk = ld64(s78 + 0x10)
		rc_inc(bk)
		st8(sf8 + 9, ld8(s60 + 0x11))
		st8(sf8 + 8, ld8(s60 + 0x10))
		copyr(s100, s60, 0x10)
		st64(s118, bl, bj, bk)
		bm = bi
	}
	st64(s280 + 0x10, bi)
	st8(sf8 + 0xa, bm)
	st64(sff0, s118, ax + ay)
	st64(s280, bn)
	st64(s1000, bo, bn)
	const bp = fn_7a038(s1e0, ld64(s280 + 0x40), s48, ld64(s2d8), bo, bn, s118, ax + ay, bo)
	v = ld64(s1e0 + 8)
	const bq = ld64(s1e0)
	let cg = ptr_drop_in_place_fcd8(s48, bp)
	let br = bq
	if (bq != 2) {
		p = fn_ff88(s78, cg)
		st64(n + 8, v)
		st64(n, br)
		return p
	}
	AccountInfo_clone_f440(s48, ld64(s2e8))
	let bz = 0
	const bs = ld64(s350)
	if (bs != 0) {
		bz = fn_16330(bs)
	}
	let bx = 2
	const bt = ld64(s280 + 0x10)
	const by = ld64(s280)
	if (bt != 2) {
		const bu = ld64(s78 + 8)
		const bw = ld64(s78)
		rc_inc(bu)
		const bv = ld64(s78 + 0x10)
		rc_inc(bv)
		st8(sf8 + 9, ld8(s60 + 0x11))
		st8(sf8 + 8, ld8(s60 + 0x10))
		copyr(s100, s60, 0x10)
		st64(s118, bw, bu, bv)
		bx = bt
	}
	st8(sf8 + 0xa, bx)
	st64(sff0 + 8, ld64(s280 + 8))
	st64(s1000, bz, by, s118)
	const ca = fn_7a038(s1f0, ld64(s280 + 0x40), s48, ld64(s2f0), bz, by, s118, ld64(sff0 + 8), bz)
	v = ld64(s1f0 + 8)
	const cb = ld64(s1f0)
	cg = ptr_drop_in_place_fcd8(s48, ca)
	br = cb
	if (cb != 2) {
		p = fn_ff88(s78, cg)
		st64(n + 8, v)
		st64(n, br)
		return p
	}
	let ci = 2
	const ck = ld64(s190 + 8)
	const cj = ld64(s2f8)
	const cc = ld64(s280 + 0x10)
	if (cc != 2) {
		const cd = ld64(s78 + 8)
		const ch = ld64(s78)
		rc_inc(cd)
		const ce = ld64(s78 + 0x10)
		const cf = ld64(ce)
		cg = cf == -1
		st64(ce, cf + 1)
		if (cg == 1) {
			abort()
		}
		st8(sf8 + 9, ld8(s60 + 0x11))
		st8(sf8 + 8, ld8(s60 + 0x10))
		copyr(s100, s60, 0x10)
		st64(s118, ch, cd, ce)
		ci = cc
	}
	st8(sf8 + 0xa, ci)
	st64(sff0 + 8, cc != 2)
	st64(sff8, s118)
	st64(s1000, ld64(s2c0))
	st64(sff0, cj + 8)
	cg = fn_31a40(s48, ld64(s280 + 0x40), ck, ld64(s280 + 0x48), ld64(s1000), s118, cj + 8, cc != 2, cg)
	v = ld64(s40 + 8)
	br = ld64(s40)
	if (ld64(s48) != 1) {
		const cp = ld64(s40 + 0x10)
		const co = ld64(cj + 8)
		const cn = ld64(cj + 0x10)
		const cm = ld64(cj + 0x18)
		const cl = ld64(cj + 0x20)
		copyr(sf8, s2a8, 0x10)
		st64(s118, co, cn, cm, cl)
		st64(sc8 + 0x20, ld64(s280 + 0x18))
		st64(sc8 + 0x18, ld64(s280 + 0x28))
		st64(sc8, br, v, cp)
		st64(sd8 + 8, ld64(s280 + 0x30))
		st64(sd8, ld64(s280 + 0x38))
		st64(se0, ld64(s280 + 0x20))
		st64(sf8 + 0x10, ld64(s2a8 + 0x20))
		fn_10f760(s48, s118)
		copyr(s138, s40, 0x10)
		p = fn_ff88(s78, log_data(s138, 1))
		st64(n + 8, v)
		st64(n, 2)
		return p
	}
	p = fn_ff88(s78, cg)
	st64(n + 8, v)
	st64(n, br)
	return p
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_1008(a: u64, b: u64, c: u64): u64 {
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
	g = fn_13e070(s20, 0x1001592e8, 8)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (points to it), e (value)
function fn_153158(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155b30(a, b, c, d, e)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), p5 (value), p6 (value), p7 (value)
function fn_2be8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sa8 = fp - 0xa8, sd8 = fp - 0xd8, sdf = fp - 0xdf, s10f = fp - 0x10f, s116 = fp - 0x116, s128 = fp - 0x128, s138 = fp - 0x138
	let f, g: u64
	st64(s138, d, p5, p6, p7)
	if ((b & 1) != 0) {
		st64(sa8, 0, 1, 0)
		st64(s28, sa8, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_150868(s138, s48) == 0) {
			copyr(s78, sa8, 0x18)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (fn_150868(s128, s48) == 0) {
				copy(sa8, s78, 0x30)
				memcpy(sd8, sa8, 0x30)
				f = ld8(c + 0x38) != 0 ? sdf : sdf
				st8(c + 0x38, 0)
				g = memcpy(c + 0x39, f, 0x37)
				st64(a, b, c)
				return g
			}
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	st64(sa8, 0, 1, 0)
	st64(s28, sa8, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_150868(s138, s48) == 0) {
		copyr(s78, sa8, 0x18)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_150868(s128, s48) == 0) {
			copy(sa8, s78, 0x30)
			memcpy(s10f, sa8, 0x30)
			f = ld8(c + 0x50) != 0 ? s116 : s116
			st8(c + 0x50, 0)
			g = memcpy(c + 0x51, f, 0x37)
			st64(a, b, c)
			return g
		}
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
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

function fn_2f968(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s30 = fp - 0x30, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, s128 = fp - 0x128, s130 = fp - 0x130, sff0 = fp - 0xff0, s1000 = fp - 0x1000
	let x, y: u64
	st64(s128 + 0x38, c)
	let o = fn_53e8(sa8, ld64(b), c, d, e, r0)
	const f = ld64(s98)
	if (ld64(sa8) != 0) {
		const m = ld64(sa8 + 8)
		st64(a + 0x10, f)
		st64(a + 8, m)
		st64(a, 1)
		return o
	}
	o = ld64(e - 0xfe8)
	const p = ld64(e - 0xff0)
	const s = ld64(e - 0xff8)
	const t = ld64(e - 0x1000)
	st64(sb8 + 8, f)
	let l = 0
	const g = ld64(sa8 + 8)
	st64(sb8, g)
	st64(s128 + 0x28, g)
	const h = ld8(g + 0x17d)
	let i = 0
	st64(s128 + 0x30, 0)
	if ((h & 2) == 0) {
		const n = ld64(ld64(s128 + 0x38))
		const r = ld32(n + 0x110)
		const q = ld32(n + 0x114)
		st64(s128 + 0x20, o)
		st64(sff0 + 0x10, o)
		st64(s128 + 0x18, p)
		st64(s1000, s, r, q, p)
		o = fn_2fec8(sa8, sb8, d, t, s, r, q, p, o, o)
		const u = ld64(sa8)
		if (ld8(s88 + 0x51) == 2) {
			st64(a + 0x10, ld64(sa8 + 8))
			st64(a + 8, u)
			st64(a, 1)
			st64(f, ld64(f) + 1)
			return o
		}
		copyr(s128, s98, 0x10)
		st64(s128 + 0x10, ld64(sa8 + 8))
		memcpy(s30, s88, 0x30)
		st64(s130, ld64(s88 + 0x30))
		st64(s128 + 0x30, ld64(s88 + 0x38))
		clock_get(sa8)
		if (ld64(sa8) != 0) {
			const w = ld64(sa8 + 8)
			const v = ld64(s98)
			st64(s98, ld64(s98 + 8))
			st64(sa8, w, v)
			o = fn_13e628(sc8, sa8)
			y = ld64(sc8 + 8)
			x = ld64(sc8)
			if (x != 2) {
				st64(a + 0x10, y)
				st64(a + 8, x)
				st64(a, 1)
				st64(f, ld64(f) + 1)
				return o
			}
		} else {
			y = ld64(s98 + 8)
		}
		st64(sff0, s30, y)
		copy(s1000, s128, 0x10)
		fn_69e08(sd8, n + 8, u, ld64(s128 + 0x10), ld64(s1000), ld64(s1000 + 8), s30, y)
		y = ld64(sd8 + 8)
		x = ld64(sd8)
		l = 0
		o = ld64(s128 + 0x20)
		const aa = ld64(s128 + 0x18)
		if (x != 2) {
			st64(a + 0x10, y)
			st64(a + 8, x)
			st64(a, 1)
			st64(f, ld64(f) + 1)
			return o
		}
		const z = ld64(n + 0x48)
		const ab = ld64(n + 0x50)
		if ((ab != o ? o > ab : aa > z) != 0) {
			o = fn_88360(se8, 0x26)
			y = ld64(se8 + 8)
			x = ld64(se8)
			i = ld64(s130)
			if (x != 2) {
				st64(a + 0x10, y)
				st64(a + 8, x)
				st64(a, 1)
				st64(f, ld64(f) + 1)
				return o
			}
		} else {
			st64(n + 0x48, z - aa, ab - o - (aa > z))
			i = ld64(s130)
		}
	}
	let k = 0
	if ((ld8(ld64(s128 + 0x28) + 0x17d) & 4) == 0) {
		const j = ld64(ld64(s128 + 0x38))
		l = ld64(j + 0x78)
		st64(j + 0x78, 0)
		k = ld64(j + 0x80)
		st64(j + 0x80, 0)
	}
	st64(a + 0x20, k)
	st64(a + 0x18, ld64(s128 + 0x30))
	st64(a + 0x10, l)
	st64(a + 8, i)
	st64(a, 0)
	st64(f, ld64(f) + 1)
	return o
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
function fn_7da68(a: u64, b: u64, c: u64): u64 {
	const s68 = fp - 0x68, s88 = fp - 0x88, s90 = fp - 0x90, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108
	let ab, ac, af: u64
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
	const n = memcmp(m, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20)
	let p = sa8
	let o = n as u32
	if (o == 0) {
		st64(a, 2, 0)
	} else {
		const aj = p
		const s = AccountInfo_try_borrow_data(s68, sb8, o)
		const w = ld64(s68 + 0x10)
		const r = ld64(s68 + 8)
		const q = ld64(s68)
		if (q == 0x800000000000001a /* Ok */) {
			B17: {
				const y = fn_e948(s68, ld64(r), ld64(r + 8), undef, undef, s)
				if (ld32(s68) != 2) {
					B25: {
						o = fn_e480(s88, ld64(s68 + 0x58), ld64(s68 + 0x60), undef, y, a)
						if (ld64(s88) == 0x800000000000001a /* Ok */) {
							const ai = ld64(s88 + 8)
							o = clock_get(s68)
							if (ld64(s68) != 0) {
								const aa = ld64(s68 + 8)
								const z = ld64(s68 + 0x10)
								st64(s68 + 0x10, ld64(s68 + 0x18))
								st64(s68, aa, z)
								o = fn_13e628(sd8, s68)
								ac = ld64(sd8 + 8)
								ab = ld64(sd8)
								if (ab != 2) {
									st64(a + 8, ac)
									break B17
								}
							} else {
								ac = ld64(s68 + 0x18)
							}
							o = fn_132590(se8, ai, ac, c, o)
							if (ld64(se8) != 0) {
								af = ld64(se8 + 8)
								break B25
							}
							o = fn_88360(sf8, 0x26)
							ac = ld64(sf8 + 8)
							ab = ld64(sf8)
							st64(a + 8, ac)
							break B17
						}
						af = 0
					}
					st64(a + 8, af)
					st64(a, 2)
					st64(w, ld64(w) - 1)
					const ag: LamportsCell = ld64(sb0)
					if (rc_release(ag)) {
						o = Rc_drop_slow_14df0(sb0, o)
					}
					const ah: DataCell = ld64(sa8)
					if (!rc_release(ah)) {
						return o
					}
					return Rc_drop_slow_14df0(aj, o)
				}
				const t = ld64(s68 + 0x18)
				st64(s88 + 0x14, t)
				const u = ld64(s68 + 0x10)
				st64(s88 + 0xc, u)
				const v = ld64(s68 + 8)
				st64(s88 + 4, v)
				st64(s68, v, u, t)
				o = fn_13e628(s108, s68)
				ab = ld64(s108)
				st64(a + 8, ld64(s108 + 8))
			}
			st64(a, ab)
			st64(w, ld64(w) - 1)
		} else {
			st64(s68, q, r, w)
			o = fn_13e628(sc8, s68)
			const x = ld64(sc8)
			st64(a + 8, ld64(sc8 + 8))
			st64(a, x)
		}
		p = aj
	}
	const ad: LamportsCell = ld64(sb0)
	if (rc_release(ad)) {
		o = Rc_drop_slow_14df0(sb0, o)
	}
	const ae: DataCell = ld64(sa8)
	if (!rc_release(ae)) {
		return o
	}
	return Rc_drop_slow_14df0(p, o)
}

function fn_16330(a: u64): u64 {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x80) & -8 : 0x300007f80
	if (g > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		const h = ld64(a + 0x58)
		memcpy(g, a, 0x58)
		st64(g + 0x58, h)
		copy(g + 0x60, a + 0x60, 0x20)
		return g
	}
	alloc_handle_alloc_error(8, 0x80)
}

function fn_10f958(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000007 >= g) {
		raw_vec_handle_error(1, 0x100, 0x100160b08, 0x300000007, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0xa2b45439e69470ed /* event:LiquidityCalculateEvent */)
	const h = ld64(b)
	st64(g + 0x10, ld64(b + 8))
	st64(g + 8, h)
	const i = ld64(b + 0x10)
	st64(g + 0x20, ld64(b + 0x18))
	st64(g + 0x18, i)
	st32(g + 0x28, ld32(b + 0x50))
	copy(g + 0x2c, b + 0x20, 0x30)
	st64(a + 8, g, 0x5c)
	st64(a, 0x100)
}

function log_data(a: u64, b: u64): u64 {
	return sol_log_data(a, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), p8 (value)
function fn_7a038(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s78 = fp - 0x78, s88 = fp - 0x88, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sf0 = fp - 0xf0, s108 = fp - 0x108, s110 = fp - 0x110, s120 = fp - 0x120, s138 = fp - 0x138, s140 = fp - 0x140, s168 = fp - 0x168, s170 = fp - 0x170, s178 = fp - 0x178, s188 = fp - 0x188, s1b8 = fp - 0x1b8, s248 = fp - 0x248, s278 = fp - 0x278, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s338 = fp - 0x338, s358 = fp - 0x358, s3a8 = fp - 0x3a8, s3b0 = fp - 0x3b0, s3e8 = fp - 0x3e8, s3f0 = fp - 0x3f0, s3f8 = fp - 0x3f8
	let cj: u64
	let z: AccountInfo = d
	let n = a
	let f = p7
	const g = p8
	st64(s338 + 0x18, f)
	if (g != 0) {
		st64(s358 + 0x18, b)
		const j: AccountInfo = p6
		const k: LamportsCell = j.lamports
		const l = k.strong
		st64(s338 + 0x10, p5)
		const s = j.key
		rc_inc(k, l)
		st64(s3a8 + 0x28, g)
		const m: DataCell = j.data
		rc_inc(m)
		st64(s358 + 0x10, n)
		const r = j.owner
		const q = j.rent_epoch
		const p = j.is_signer
		const o = j.is_writable
		st8(s2d0 + 2, j.executable)
		st8(s2d0, p, o)
		st64(s2f8, s, k, m, r, q)
		const t: LamportsCell = c.lamports
		const v = c.key
		const x = ld64(s338 + 0x18)
		rc_inc(t)
		const u: DataCell = c.data
		rc_inc(u)
		st64(s358, v)
		st64(s338, u)
		st64(s358 + 8, t)
		st64(s3a8 + 0x30, c.executable)
		st64(s3a8 + 0x38, c.is_writable)
		st64(s3a8 + 0x40, c.is_signer)
		st64(s3a8 + 0x48, c.rent_epoch)
		st64(s338 + 8, c.owner)
		const w = ld64(s338 + 0x10)
		st64(s2d0 + 8, w)
		memcpy(s2c0, x, 0x30)
		const y = ld8(s2b0 + 0x1a)
		if (w != 0 && y != 2) {
			const bd = ld64(ld64(s338 + 0x18))
			if ((memcmp(ld64(s338 + 8), bd, 0x20) as u32) == 0) {
				const ck: AccountInfo = ld64(s338 + 0x18)
				let cl = ck.lamports
				rc_inc(cl)
				const cm: DataCell = ck.data
				const cn = cm.strong
				st64(s3a8 + 0x20, bd)
				rc_inc(cm, cn)
				st64(s3a8 + 0x10, ck.executable)
				st64(s3a8 + 0x18, ck.is_writable)
				let cp = ck.is_signer
				let co = ck.rent_epoch
				const cq = ck.owner
				if (rc_release(k)) {
					st64(s3b0, cp, co, cl)
					Rc_drop_slow_14df0(s2f0, cp)
					cp = ld64(s3b0)
					co = ld64(s3a8)
					cl = ld64(s3a8 + 8)
				}
				if (rc_release(m)) {
					st64(s3a8, co, cl)
					Rc_drop_slow_14df0(s2e8, cp)
					co = ld64(s3a8)
					cl = ld64(s3a8 + 8)
				}
				st8(s2d0 + 2, ld64(s3a8 + 0x10))
				st8(s2d0 + 1, ld64(s3a8 + 0x18))
				st8(s2d0, cp)
				st64(s2f0, cl, cm, cq, co)
				st64(s2f8, ld64(s3a8 + 0x20))
			}
			memcpy(sb8, s2f8, 0x30)
			const be: LamportsCell = z.lamports
			const bf = be.strong
			st64(s3a8 + 0x20, z.key)
			rc_inc(be, bf)
			const bg: DataCell = z.data
			rc_inc(bg)
			const bh: AccountInfo = ld64(ld64(s358 + 0x18))
			const bi: LamportsCell = bh.lamports
			const bj = bi.strong
			st64(s3a8 + 0x18, z.executable)
			st64(s358 + 0x18, z.is_writable)
			const bk = z.is_signer
			const bm = z.rent_epoch
			const br = z.owner
			st64(s3a8 + 0x10, bh.key)
			rc_inc(bi, bj)
			st64(s3a8 + 8, bk)
			const bl: DataCell = bh.data
			rc_inc(bl)
			st64(s3b0, bm, bi)
			const bn: AccountInfo = ld64(ld64(s338 + 0x10) + 0x58)
			const bo: LamportsCell = bn.lamports
			const bp = bo.strong
			st64(s3e8 + 0x10, bh.executable)
			st64(s3e8 + 0x18, bh.is_writable)
			st64(s3e8 + 0x20, bh.is_signer)
			st64(s3e8 + 0x28, bh.rent_epoch)
			st64(s3e8 + 0x30, bh.owner)
			const bq = bn.key
			rc_inc(bo, bp)
			st64(s3e8, bq, br)
			const bs: DataCell = bn.data
			rc_inc(bs)
			st64(s3f0, bn.owner)
			st64(s3f8, bn.rent_epoch)
			const bv = bn.is_signer
			const bu = bn.is_writable
			const bt = bn.executable
			st8(sf0 + 0x32, ld64(s3e8 + 0x10))
			st8(sf0 + 0x31, ld64(s3e8 + 0x18))
			st8(sf0 + 0x30, ld64(s3e8 + 0x20))
			st64(sf0 + 0x28, ld64(s3e8 + 0x28))
			st64(sf0 + 0x20, ld64(s3e8 + 0x30))
			st64(sf0 + 0x18, bl)
			st64(sf0 + 0x10, ld64(s3a8))
			st64(sf0 + 8, ld64(s3a8 + 0x10))
			st8(sf0 + 2, ld64(s3a8 + 0x18))
			st8(sf0 + 1, ld64(s358 + 0x18))
			st8(sf0, ld64(s3a8 + 8))
			st64(s108 + 0x10, ld64(s3b0))
			st64(s108 + 8, ld64(s3e8 + 8))
			st64(s110, be, bg)
			st64(s120 + 8, ld64(s3a8 + 0x20))
			st8(s120, bv, bu, bt)
			st64(s138 + 0x10, ld64(s3f8))
			st64(s138 + 8, ld64(s3f0))
			st64(s140, bo, bs)
			st64(s168 + 0x20, ld64(s3e8))
			st8(s168 + 0x1a, ld64(s3a8 + 0x30))
			st8(s168 + 0x19, ld64(s3a8 + 0x38))
			st8(s168 + 0x18, ld64(s3a8 + 0x40))
			st64(s168 + 0x10, ld64(s3a8 + 0x48))
			copyr(s168, s338, 0x10)
			copyr(s178, s358, 0x10)
			const bw = fn_4dc0(s18, bh, bo)
			const cc = ld64(s18 + 0x10)
			if (ld64(s18) != 0) {
				cj = ld64(s18 + 8)
				r0 = ptr_drop_in_place_fd78(s178, bw)
				const bx = ld64(sb0)
				n = ld64(s358 + 0x10)
				if (rc_release(bx)) {
					r0 = Rc_drop_slow_14df0(sb0, r0)
				}
				const by = ld64(sa8)
				if (rc_release(by)) {
					r0 = Rc_drop_slow_14df0(sa8, r0)
				}
				let bz = ld64(s338 + 0x18)
				const ca = ld64(bz + 8)
				if (rc_release(ca)) {
					r0 = Rc_drop_slow_14df0(bz + 8, r0)
					bz = ld64(s338 + 0x18)
				}
				const cb = ld64(bz + 0x10)
				if (!rc_release(cb)) {
					st64(n + 8, cc)
					st64(n, cj)
					return r0
				}
				r0 = Rc_drop_slow_14df0(bz + 0x10, r0)
				st64(n + 8, cc)
				st64(n, cj)
				return r0
			}
			const cd = ld64(s18 + 8)
			const ce = ld16(cd + 0x17f)
			n = ld64(s358 + 0x10)
			const cf = ld64(s3a8 + 0x28)
			st64(s88, s78, 6, 0x10015984c, 4, cd + 1, 0x20, cd + 0x41, 0x20, cd + 0x61, 0x20, ce != 0 ? cd + 0x17f : 1, (ce != 0) << 1, cd, 1)
			memcpy(s248, s178, 0xc0)
			st64(s290, 0, 8, 0)
			memcpy(s278, s2f8, 0x30)
			st64(s188, s88, 1)
			r0 = token_2022_transfer_checked(s308, s290, cf, ld8(ld64(s338 + 0x10) + 0x30))
			z = ld64(s308 + 8)
			cj = ld64(s308)
			st64(cc, ld64(cc) - 1)
			let cg = ld64(s338 + 0x18)
			const ch = ld64(cg + 8)
			if (rc_release(ch)) {
				r0 = Rc_drop_slow_14df0(cg + 8, r0)
				cg = ld64(s338 + 0x18)
			}
			const ci = ld64(cg + 0x10)
			if (!rc_release(ci)) {
				st64(n + 8, z)
				st64(n, cj)
				return r0
			}
			r0 = Rc_drop_slow_14df0(cg + 0x10, r0)
			st64(n + 8, z)
			st64(n, cj)
			return r0
		}
		st64(s338 + 0x18, y)
		memcpy(sb8, s2f8, 0x30)
		const aa: LamportsCell = z.lamports
		const ah = z.key
		rc_inc(aa)
		const ab: DataCell = z.data
		rc_inc(ab)
		const ac: AccountInfo = ld64(ld64(s358 + 0x18))
		const ad: LamportsCell = ac.lamports
		const ae = ad.strong
		st64(s3a8 + 0x20, z.executable)
		st64(s358 + 0x18, z.is_writable)
		st64(s338 + 0x10, z.is_signer)
		const aj = z.rent_epoch
		const ai = z.owner
		const af = ac.key
		rc_inc(ad, ae)
		st64(s3a8 + 0x18, af)
		const ag: DataCell = ac.data
		rc_inc(ag)
		const an = ac.owner
		const am = ac.rent_epoch
		st64(s3a8 + 0x10, ah)
		const al = ac.is_signer
		st64(s3a8, aj, ai)
		const ak = ac.is_writable
		st8(sf0 + 2, ac.executable)
		st8(sf0, al, ak)
		st64(s110, ad, ag, an, am)
		st64(s120 + 8, ld64(s3a8 + 0x18))
		st8(s120 + 2, ld64(s3a8 + 0x20))
		st8(s120 + 1, ld64(s358 + 0x18))
		st8(s120, ld64(s338 + 0x10))
		st64(s138 + 0x10, ld64(s3a8))
		st64(s138 + 8, ld64(s3a8 + 8))
		st64(s358 + 0x18, ab)
		st64(s138, ab)
		st64(s338 + 0x10, aa)
		st64(s140, aa)
		st64(s168 + 0x20, ld64(s3a8 + 0x10))
		st8(s168 + 0x1a, ld64(s3a8 + 0x30))
		st8(s168 + 0x19, ld64(s3a8 + 0x38))
		st8(s168 + 0x18, ld64(s3a8 + 0x40))
		st64(s168 + 0x10, ld64(s3a8 + 0x48))
		copyr(s168, s338, 0x10)
		const ao: LamportsCell = ld64(s358 + 8)
		st64(s170, ao)
		st64(s178, ld64(s358))
		r0 = fn_4dc0(s18, ac, al)
		const aq = ld64(s18 + 0x10)
		if (ld64(s18) != 0) {
			st64(s338 + 8, ld64(s18 + 8))
			if (rc_release(ao)) {
				r0 = Rc_drop_slow_14df0(s170, r0)
			}
			const ap: DataCell = ld64(s338)
			if (rc_release(ap)) {
				r0 = Rc_drop_slow_14df0(s168, r0)
			}
			const ar = ld64(s338 + 0x10)
			cj = ld64(s338 + 8)
			if (rc_release(ar)) {
				r0 = Rc_drop_slow_14df0(s140, r0)
			}
			const at = ld64(s358 + 0x18)
			if (rc_release(at)) {
				r0 = Rc_drop_slow_14df0(s138, r0)
			}
			if (rc_release(ad)) {
				r0 = Rc_drop_slow_14df0(s110, r0)
			}
			n = ld64(s358 + 0x10)
			if (rc_release(ag)) {
				r0 = Rc_drop_slow_14df0(s108, r0)
			}
			const au = ld64(sb0)
			if (rc_release(au)) {
				r0 = Rc_drop_slow_14df0(sb0, r0)
			}
			const av = ld64(sa8)
			if (rc_release(av)) {
				r0 = Rc_drop_slow_14df0(sa8, r0)
			}
			z = aq
			if (ld64(s338 + 0x18) == 2) {
				st64(n + 8, z)
				st64(n, cj)
				return r0
			}
			const aw = ld64(s2b8)
			if (rc_release(aw)) {
				r0 = Rc_drop_slow_14df0(s2b8, r0)
			}
			const ax = ld64(s2b0)
			z = aq
			if (!rc_release(ax)) {
				st64(n + 8, z)
				st64(n, cj)
				return r0
			}
			r0 = Rc_drop_slow_14df0(s2b0, r0)
			st64(n + 8, aq)
			st64(n, cj)
			return r0
		}
		const ay = ld64(s18 + 8)
		const az = ld16(ay + 0x17f)
		n = ld64(s358 + 0x10)
		const ba = ld64(s3a8 + 0x28)
		st64(s88, s78, 6, 0x10015984c, 4, ay + 1, 0x20, ay + 0x41, 0x20, ay + 0x61, 0x20, az != 0 ? ay + 0x17f : 1, (az != 0) << 1, ay, 1)
		memcpy(s248, s178, 0x90)
		st64(s290, 0, 8, 0)
		memcpy(s278, s2f8, 0x30)
		st64(s1b8, s88, 1)
		r0 = token_transfer(s318, s290, ba)
		z = ld64(s318 + 8)
		cj = ld64(s318)
		st64(aq, ld64(aq) - 1)
		if (ld64(s338 + 0x18) == 2) {
			st64(n + 8, z)
			st64(n, cj)
			return r0
		}
		const bb = ld64(s2b8)
		if (rc_release(bb)) {
			r0 = Rc_drop_slow_14df0(s2b8, r0)
		}
		const bc = ld64(s2b0)
		if (!rc_release(bc)) {
			st64(n + 8, z)
			st64(n, cj)
			return r0
		}
		r0 = Rc_drop_slow_14df0(s2b0, r0)
		st64(n + 8, z)
		st64(n, cj)
		return r0
	}
	if (ld8(f + 0x2a) == 2) {
		st64(n + 8, z)
		st64(n, 2)
		return r0
	}
	const h = ld64(f + 8)
	if (rc_release(h)) {
		r0 = Rc_drop_slow_14df0(f + 8, r0)
		f = ld64(s338 + 0x18)
	}
	const i = ld64(f + 0x10)
	if (!rc_release(i)) {
		st64(n + 8, z)
		st64(n, 2)
		return r0
	}
	r0 = Rc_drop_slow_14df0(f + 0x10, r0)
	st64(n + 8, z)
	st64(n, 2)
	return r0
}

function fn_31a40(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s90 = fp - 0x90, s98 = fp - 0x98, sb0 = fp - 0xb0, sd0 = fp - 0xd0, s138 = fp - 0x138, s1c0 = fp - 0x1c0, s1d8 = fp - 0x1d8, s1fc = fp - 0x1fc, s240 = fp - 0x240, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2d4 = fp - 0x2d4, s360 = fp - 0x360, s378 = fp - 0x378, s388 = fp - 0x388, s3a8 = fp - 0x3a8, s3cc = fp - 0x3cc, s410 = fp - 0x410, s438 = fp - 0x438, s458 = fp - 0x458, s470 = fp - 0x470, s480 = fp - 0x480, s488 = fp - 0x488, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s510 = fp - 0x510, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s560 = fp - 0x560, s1000 = fp - 0x1000
	let ab, ay, ce, cg, cu, cv, cw, cx, dc, dd, dp: u64
	let dv = c
	st64(s4a0, 0, 0, 0)
	const f = ld64(b)
	let m = fn_4dc0(s2b0, f, r0)
	let g = p6
	const i = ld64(s2a0)
	const h = ld64(s2b0 + 8)
	if (ld64(s2b0) != 0) {
		st64(a + 0x10, i)
		st64(a + 8, h)
		st64(a, 1)
	} else {
		let p: AccountInfo = g
		const k = p8
		let du = p7
		const q = p5
		const j = ld8(h + 0x17d)
		st64(i, ld64(i) - 1)
		if ((j & 8) == 0) {
			const l = k != 0 ? 3 : 2
			m = fn_33a88(s4b0, f, d, l, m)
			const n = ld64(s4b0)
			if (n != 2) {
				const cf = ld64(s4b0 + 8)
				st64(a + 8, n, cf)
				st64(a, 1)
				g = p
			} else {
				if (l > d) {
					st64(a + 0x18, ld64(s4a0 + 0x10))
					st64(a + 0x10, ld64(s4a0 + 8))
					st64(a + 8, ld64(s4a0))
					st64(a, 0)
					return fn_ff88(p, m)
				}
				let o = dv
				const ds = dv + (d << 3)
				const dn = d / l
				let r = 0
				const di = p.is_writable
				const dh = p.is_signer
				const dg = p.rent_epoch
				const df = p.owner
				const dj: DataCell = p.data
				const dl: LamportsCell = p.lamports
				const de = p.key
				const dm = p.executable
				const dk = ld64(q)
				du = du + 0x80
				const dt: AccountInfo = p
				while (true) {
					st64(s488, r)
					if (o == ds) {
						m = fn_88360(s560, 2)
						g = p
						const ch = ld64(s560)
						st64(a + 0x10, ld64(s560 + 8))
						st64(a + 8, ch)
						st64(a, 1)
						break
					}
					B80: {
						const t = r
						const u = o
						m = InterfaceAccount_try_from_unchecked(s2b0, ld64(o))
						const w = ld64(s2b0 + 8)
						const v = ld64(s2b0)
						const s = ld32(s240 + 0x40)
						if (s == 2) {
							st64(a + 0x10, w)
							st64(a + 8, v)
							st64(a, 1)
						} else {
							dv = u + 8
							copyr(s470, s2a0, 0x10)
							copyr(s3a8, s288, 0x20)
							const x = ld64(s290)
							copy(s438, s268, 0x20)
							let dr = ld64(s268 + 0x20)
							memcpy(s410, s240, 0x40)
							st32(s3cc + 0x20, ld32(s1fc + 0x20))
							copyr(s3cc, s1fc, 0x20)
							st64(s480, v, w)
							let dq = x
							st64(s470 + 0x10, x)
							copyr(s458, s3a8, 0x20)
							st32(s410 + 0x40, s)
							st64(s438 + 0x20, dr)
							if (dv == ds) {
								m = fn_88360(s550, 2)
								const ci = ld64(s550)
								st64(a + 0x10, ld64(s550 + 8))
								st64(a + 8, ci)
								st64(a, 1)
							} else {
								m = InterfaceAccount_try_from_unchecked(s2b0, ld64(u + 8))
								const z = ld64(s2b0 + 8)
								const aa = ld64(s2b0)
								const y = ld32(s240 + 0x40)
								if (y == 2) {
									st64(a + 0x10, z)
									st64(a + 8, aa)
									st64(a, 1)
								} else {
									B14: {
										dv = u
										ab = u + 0x10
										memcpy(s1d8, s2a0, 0xa0)
										copy(s2d4, s1fc, 0x20)
										st32(s2d4 + 0x20, ld32(s1fc + 0x20))
										st64(s388, aa, z)
										memcpy(s378, s1d8, 0xa0)
										st32(s360 + 0x88, y)
										dp = 0
										if (k != 0) {
											if (ab == ds) {
												m = fn_88360(s540, 2)
												cv = ld64(s540)
												cu = ld64(s540 + 8)
											} else {
												m = InterfaceAccount_try_from(s2b0, ld64(dv + 0x10))
												const ac = ld32(s2b0)
												if (ac != 2) {
													const af = ld64(s2a0)
													dp = ld64(s2b0 + 8)
													const ag = ld32(s2b0 + 4)
													memcpy(s138, s298, 0x68)
													const ad = ld64(0x300000000 /* heap bump-allocator cursor */)
													const ae = ad != 0 ? sat_sub(ad, 0x80) & -8 : 0x300007f80
													if (0x300000008 > ae) {
														alloc_handle_alloc_error(8, 0x80)
													}
													ab = dv + 0x18
													st64(0x300000000 /* heap bump-allocator cursor */, ae)
													st64(ae + 0x10, af)
													st64(ae + 8, dp)
													st32(ae + 4, ag)
													st32(ae, ac)
													dp = ae
													memcpy(ae + 0x18, s138, 0x68)
													break B14
												}
												cv = ld64(s2b0 + 8)
												cu = ld64(s2a0)
											}
											st64(a + 0x10, cu)
											st64(a + 8, cv)
											st64(a, 1)
											g = dt
											break
										}
									}
									B76: {
										dv = ab
										const ah = memcmp(s458, s360, 0x20)
										cg = a
										if ((ah as u32) == 0) {
											const ai = ld64(dq)
											copyr(sd0, ai, 0x20)
											m = fn_53e8(s2b0, f, undef, undef, undef, ah as u32)
											let al = ld64(s2a0)
											let ak = ld64(s2b0 + 8)
											if (ld64(s2b0) == 0) {
												let aj = ld64(s488)
												if (3 > aj) {
													const am = memcmp(sd0, ak + aj * 0xa9 + 0x1de, 0x20)
													st64(al, ld64(al) + 1)
													m = am as u32
													let ao = t
													const aw = dr
													if (m == 0) {
														const an = ld64(s488)
														if (3 > an) {
															const ap = ao
															const aq = ld64(du + an * 0x18 + 0x10)
															st64(s98, aq)
															if (aq == 0) {
																p = dt
																ce = dv
																if (ap + 1 >= dn) {
																	st64(a + 0x18, ld64(s4a0 + 0x10))
																	st64(a + 0x10, ld64(s4a0 + 8))
																	st64(a + 8, ld64(s4a0))
																	st64(a, 0)
																	return fn_ff88(p, m)
																}
															} else {
																const ax = ao
																m = fn_4dc0(s2b0, f, m)
																const au = ld64(s2a0)
																const ar = ld64(s2b0 + 8)
																if (ld64(s2b0) != 0) {
																	st64(a + 0x10, au)
																	st64(a + 8, ar)
																	st64(a, 1)
																	break B80
																}
																m = fn_6cb08(s500, ar, ld64(s488), ld64(s98), undef, m)
																const at = ld64(s500)
																if (at != 2) {
																	const ct = ld64(s500 + 8)
																	st64(a + 8, at, ct)
																	st64(a, 1)
																	st64(au, ld64(au) - 1)
																	break B80
																}
																st64(au, ld64(au) - 1)
																p = dt
																const av = min(ld64(s98), aw)
																st64(sb0, av)
																let cd = dn
																ao = ax
																cg = a
																if (av != 0) {
																	st64(s48, 0x10015fc58)
																	st64(s38, s2b0)
																	st64(s2b0, s488, fn_155738, sb0, fn_155738, s98, fn_155738)
																	st64(s28, 0)
																	st64(s40, 4)
																	st64(s38 + 8, 3)
																	// fmt "collect reward index: {}, transfer_amount: {}, reward_amount_owed:{} " {} = *s488 [fn_155738], {} = av [fn_155738], {} = *s98 [fn_155738]
																	fn_14de10(s90, s48, undef, ao, ay)
																	const bd = sol_log(ld64(s90 + 8), ld64(s90 + 0x10))
																	const ba = ld64(sb0)
																	const az = ld64(s98)
																	if (ba > az) {
																		m = fn_88360(s530, 0x26)
																		cx = ld64(s530)
																		cw = ld64(s530 + 8)
																		break B76
																	}
																	const bb = ld64(s488)
																	if (bb >= 3) {
																		fn_14ec98(bb, 3, 0x10015fc98)
																	}
																	const bc = du + bb * 0x18
																	st64(bc + 0x10, az - ba)
																	m = fn_53e8(s2b0, f, bc, undef, undef, bd)
																	al = ld64(s2a0)
																	ak = ld64(s2b0 + 8)
																	const bf: AccountInfo = dq
																	if (ld64(s2b0) != 0) {
																		st64(cg + 0x10, al)
																		st64(cg + 8, ak)
																		st64(cg, 1)
																		break B80
																	}
																	m = fn_6cf80(s510, ak, ld64(s488), ld64(sb0), m)
																	const be = ld64(s510)
																	if (be != 2) {
																		const cy = ld64(s510 + 8)
																		st64(cg + 8, be, cy)
																		st64(cg, 1)
																		st64(al, ld64(al) + 1)
																		break B80
																	}
																	st64(al, ld64(al) + 1)
																	const bg: LamportsCell = bf.lamports
																	const bm = bf.key
																	cd = dn
																	rc_inc(bg)
																	const bh: DataCell = bf.data
																	rc_inc(bh)
																	const bl = bf.owner
																	const bk = bf.rent_epoch
																	const bj = bf.is_signer
																	const bi = bf.is_writable
																	st8(s50 + 2, bf.executable)
																	st8(s50, bj, bi)
																	st64(s78, bm, bg, bh, bl, bk)
																	const bn: AccountInfo = ld64(s378 + 0x10)
																	const bo: LamportsCell = bn.lamports
																	const bu = bn.key
																	rc_inc(bo)
																	const bp: DataCell = bn.data
																	dr = bo
																	dq = bg
																	rc_inc(bp)
																	const bt = bn.owner
																	const bs = bn.rent_epoch
																	const br = bn.is_signer
																	let bq = bn.is_writable
																	st8(s20 + 2, bn.executable)
																	st8(s20, br, bq)
																	st64(s48, bu, dr, bp, bt, bs)
																	let bx = 0
																	const bv = dp
																	if (dp != 0) {
																		const bw = ld64(0x300000000 /* heap bump-allocator cursor */)
																		bx = bw != 0 ? sat_sub(bw, 0x80) & -8 : 0x300007f80
																		if (0x300000007 >= bx) {
																			alloc_handle_alloc_error(8, 0x80)
																		}
																		st64(0x300000000 /* heap bump-allocator cursor */, bx)
																		const by = ld64(bv + 0x58)
																		bq = memcpy(bx, bv, 0x58)
																		st64(bx + 0x58, by)
																		copy(bx + 0x60, bv + 0x60, 0x20)
																		cd = dn
																	}
																	let bz = 2
																	if (dm != 2) {
																		rc_inc(dl)
																		rc_inc(dj)
																		st8(s288, dh, di)
																		st64(s2b0, de, dl, dj, df, dg)
																		bz = dm
																	}
																	st8(s288 + 2, bz)
																	st64(s1000 + 0x18, ld64(sb0))
																	st64(s1000, bx, dk, s2b0)
																	m = fn_7a038(s520, b, s78, s48, bx, dk, s2b0, ld64(s1000 + 0x18), bq)
																	const ca = ld64(s520)
																	if (ca != 2) {
																		const cz = ld64(s520 + 8)
																		st64(a + 8, ca, cz)
																		st64(a, 1)
																		m = ptr_drop_in_place_fcd8(s78, ptr_drop_in_place_fcd8(s48, m))
																		break B80
																	}
																	if (rc_release(dr)) {
																		m = Rc_drop_slow_14df0(s40, m)
																	}
																	const cb = dq
																	if (rc_release(bp)) {
																		m = Rc_drop_slow_14df0(s38, m)
																	}
																	ao = t
																	if (rc_release(cb)) {
																		m = Rc_drop_slow_14df0(s70, m)
																	}
																	if (rc_release(bh)) {
																		m = Rc_drop_slow_14df0(s68, m)
																	}
																	p = dt
																}
																const cc = ld64(s488)
																if (cc >= 3) {
																	fn_14ec98(cc, 3, 0x10015fcb0, ao, ay)
																}
																st64(s4a0 + (cc << 3), ld64(sb0))
																ce = dv
																if (ap + 1 >= cd) {
																	st64(a + 0x18, ld64(s4a0 + 0x10))
																	st64(a + 0x10, ld64(s4a0 + 8))
																	st64(a + 8, ld64(s4a0))
																	st64(a, 0)
																	return fn_ff88(p, m)
																}
															}
															r = ao + 1
															o = ce
															continue
														}
														fn_14ec98(an, 3, 0x10015fc40, ao)
													}
													ErrorCode_name(sb0, 0x100159874, undef, ao)
													st64(s78, 0, 1, 0)
													st64(s28, s78, 0x10015f818)
													st8(s20 + 0x10, 3)
													st64(s20 + 8, 0x20)
													st64(s38, 0)
													st64(s48, 0)
													if (ErrorCode_fmt(0x100159874, s48) != 0) {
														fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
													}
													copyr(s278, s78, 0x18)
													copy(s290, sb0, 0x18)
													st64(s2b0 + 8, 0x100159f11)
													st32(s240 + 0x28, 0x9c6 /* anchor::RequireKeysEqViolated */)
													st8(s268 + 8, 2)
													st32(s298, 0x1c6)
													st64(s2a0, 0x33)
													st64(s2b0, 0)
													const cm = fn_13e5a0(s4e0, s2b0)
													const cq = ld64(s4e0 + 8)
													const cp = ld64(s4e0)
													const cr = fn_53e8(s48, f, undef, undef, undef, cm)
													al = ld64(s38)
													const cn = ld64(s40)
													if (ld64(s48) != 0) {
														st64(a + 0x10, al)
														st64(a + 8, cn)
														st64(a, 1)
														m = fn_fc80(cp, cq, cr)
														break B80
													}
													aj = ld64(s488)
													if (aj >= 3) {
														fn_14ec98(aj, 3, 0x10015fc28, dc, dd)
													}
													const co = aj * 0xa9
													copyr(s290, cn + co + 0x1de, 0x20)
													copy(s2b0, sd0, 0x20)
													m = Error_with_pubkeys(s4f0, cp, cq, s2b0, cr)
													const cs = ld64(s4f0)
													st64(a + 0x10, ld64(s4f0 + 8))
													st64(a + 8, cs)
													st64(a, 1)
													st64(al, ld64(al) + 1)
													break B80
												}
												fn_14ec98(aj, 3, 0x10015fc28, dc, dd)
											}
											st64(cg + 0x10, al)
											st64(cg + 8, ak)
											st64(cg, 1)
											break B80
										}
										ErrorCode_name(sb0, 0x100159874)
										st64(s78, 0, 1, 0)
										st64(s28, s78, 0x10015f818)
										st8(s20 + 0x10, 3)
										st64(s20 + 8, 0x20)
										st64(s38, 0)
										st64(s48, 0)
										if (ErrorCode_fmt(0x100159874, s48) != 0) {
											fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
										}
										copyr(s278, s78, 0x18)
										copy(s290, sb0, 0x18)
										st64(s2b0 + 8, 0x100159f11)
										st32(s240 + 0x28, 0x9c6 /* anchor::RequireKeysEqViolated */)
										st8(s268 + 8, 2)
										st32(s298, 0x1c5)
										st64(s2a0, 0x33)
										st64(s2b0, 0)
										const cl = fn_13e5a0(s4c0, s2b0)
										const ck = ld64(s4c0 + 8)
										const cj = ld64(s4c0)
										copyr(s2b0, s3a8, 0x20)
										copy(s290, s1c0, 0x20)
										m = Error_with_pubkeys(s4d0, cj, ck, s2b0, cl)
										cx = ld64(s4d0)
										cw = ld64(s4d0 + 8)
									}
									st64(cg + 0x10, cw)
									st64(cg + 8, cx)
									st64(cg, 1)
								}
							}
						}
					}
					g = dt
					break
				}
			}
		} else {
			st64(a + 0x18, 0)
			st64(a + 0x10, 0)
			st64(a + 8, 0)
			st64(a, 0)
			g = p
		}
	}
	if (ld8(g + 0x2a) == 2) {
		return m
	}
	const da = ld64(g + 8)
	if (rc_release(da)) {
		m = Rc_drop_slow_14df0(g + 8, m)
	}
	const db = ld64(g + 0x10)
	if (!rc_release(db)) {
		return m
	}
	return Rc_drop_slow_14df0(g + 0x10, m)
}

function fn_10f760(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000007 >= g) {
		raw_vec_handle_error(1, 0x100, 0x100160af0, 0x300000007, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0x385532443a56de3a /* event:DecreaseLiquidityEvent */)
	copy(g + 8, b, 0x20)
	const h = ld64(b + 0x20)
	st64(g + 0x30, ld64(b + 0x28))
	st64(g + 0x28, h)
	copy(g + 0x38, b + 0x30, 0x48)
	st64(a + 8, g, 0x80)
	st64(a, 0x100)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_154788(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622e0, 1, 8, 0, 0)
	// fmt "attempt to subtract with overflow"
	fn_14ec00(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_154730(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622d0, 1, 8, 0, 0)
	// fmt "attempt to add with overflow"
	fn_14ec00(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (value)
function fn_13e070(a: u64, b: u64, c: u64): u64 {
	const g = ld64(a + 8)
	const f = ld64(a + 0x10)
	let h = 0
	if (g > f) {
		h = min(sat_sub(g, f), c)
		const j = c
		sol_memcpy(ld64(a) + f, b, h)
		const i = f + h
		if (f > i) {
			fn_154730(0x1001613d8)
		}
		st64(a + 0x10, i)
		c = j
	}
	if (h == c) {
		return 0
	}
	return Error_new_13c880()
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (value)
function fn_15a08(a: u64, b: u64): u64 {
	const s8 = fp - 0x8
	st64(s8, ld64(a))
	let f = fn_13e070(b, s8, 8)
	if (f != 0) {
		return f
	}
	st64(s8, ld64(a + 8))
	f = fn_13e070(b, s8, 8)
	if (f != 0) {
		return f
	}
	st64(s8, ld64(a + 0x10))
	f = fn_13e070(b, s8, 8)
	if (f != 0) {
		return f
	}
	st64(s8, ld64(a + 0x18))
	f = fn_13e070(b, s8, 8)
	if (f != 0) {
		return f
	}
	st64(s8, ld64(a + 0x20))
	f = fn_13e070(b, s8, 8)
	if (f != 0) {
		return f
	}
	st64(s8, ld64(a + 0x28))
	f = fn_13e070(b, s8, 8)
	if (f != 0) {
		return f
	}
	st64(s8, ld64(a + 0x30))
	f = fn_13e070(b, s8, 8)
	return f != 0 ? f : 0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14ec00(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s18 = fp - 0x18
	st64(s18, a, b)
	st16(s18 + 0x10, 1)
	fn_14ce00(s18, b, c, d, e)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_1548e8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x100162588, 1, 8, 0, 0)
	// fmt "attempt to divide by zero"
	fn_14ec00(s30, a, c, d, e)
}

function fn_1547e0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622f0, 1, 8, 0, 0)
	// fmt "attempt to multiply with overflow"
	fn_14ec00(s30, a, c, d, e)
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

function fn_2fec8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s2 = fp - 0x2, s28 = fp - 0x28, s4f = fp - 0x4f, s50 = fp - 0x50, s70 = fp - 0x70, s88 = fp - 0x88, s8f = fp - 0x8f, s90 = fp - 0x90, sf0 = fp - 0xf0, s1a0 = fp - 0x1a0, s248 = fp - 0x248, s268 = fp - 0x268, s2c8 = fp - 0x2c8, s2d0 = fp - 0x2d0, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s408 = fp - 0x408, s418 = fp - 0x418, s420 = fp - 0x420, s428 = fp - 0x428, s430 = fp - 0x430, s1000 = fp - 0x1000
	let o, ab, be, bf, bh, bi, bj, bk, bm, bn, bo, bp, bx, by, bz: u64
	st64(s408 + 0x30, d)
	let j = a
	const f = ld64(c)
	st64(s408 + 0x38, f)
	let k = fn_4bd8(s308, f, r0)
	let l = ld64(s2f8)
	let g = ld64(s308 + 8)
	if (ld64(s308) != 0) {
		st64(j + 8, l)
		st64(j, g)
		st8(j + 0x71, 2)
		return k
	}
	st64(s408 + 0x20, g)
	const h = ld64(b)
	const i = ld16(h + 0x17f)
	st64(s420, b)
	st64(s408, h + 0x17f)
	st64(s408 + 0x28, j)
	const s = p9
	st64(s428, p8)
	st64(s418, p7, p6)
	st64(s430, p5)
	st64(s308, 0x10015984c)
	st64(s2c8, i != 0 ? h + 0x17f : 1, (i != 0) << 1, h)
	st64(s408 + 0x10, h + 0x61)
	st64(s2d8, h + 0x61)
	st64(s408 + 8, h + 0x41)
	st64(s2e8, h + 0x41)
	st64(s408 + 0x18, h)
	st64(s2f8, h + 1)
	st64(s2c8 + 0x18, 1)
	st64(s2d0, 0x20)
	st64(s2e8 + 8, 0x20)
	st64(s2f8 + 8, 0x20)
	st64(s308 + 8, 4)
	st64(s50, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
	// PDA create_program_address(["pool", *(h + 1), *(h + 0x41), *(h + 0x61), (i != 0 ? h + 0x17f : 1)[..(i != 0) << 1], h[..1]], program *s50)
	Pubkey_create_program_address(s90, s308, 6, s50, k)
	if (ld8(s90) != 1) {
		copyr(s28, s8f, 0x20)
		const m = memcmp(ld64(s408 + 0x20), s28, 0x20)
		st64(l, ld64(l) - 1)
		if ((m as u32) == 0) {
			st64(s408 + 0x20, s)
			const t = ld64(ld64(s408 + 0x30))
			st64(s408 + 0x30, t)
			k = fn_4bd8(s308, t, m as u32)
			const v = ld64(s2f8)
			const w = ld64(s308 + 8)
			if (ld64(s308) != 0) {
				const u = ld64(s408 + 0x28)
				st64(u + 8, v)
				st64(u, w)
				st8(u + 0x71, 2)
				return k
			}
			const ad = ld64(s408 + 0x18)
			const ae = ld16(ad + 0x17f)
			let af = 1
			if (ae != 0) {
				af = ld64(s408)
			}
			st64(s2c8 + 0x10, ad)
			st64(s2d8, ld64(s408 + 0x10))
			st64(s2e8, ld64(s408 + 8))
			st64(s2f8, h + 1)
			st64(s308, 0x10015984c)
			st64(s2c8, af, (ae != 0) << 1)
			st64(s2c8 + 0x18, 1)
			st64(s2d0, 0x20)
			st64(s2e8 + 8, 0x20)
			st64(s2f8 + 8, 0x20)
			st64(s308 + 8, 4)
			st64(s50, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
			// PDA create_program_address(["pool", *(h + 1), *(ld64(s408 + 8)), *(ld64(s408 + 0x10)), af[..(ae != 0) << 1], ad[..1]], program *s50)
			Pubkey_create_program_address(s90, s308, 6, s50, k)
			if (ld8(s90) != 1) {
				copyr(s28, s8f, 0x20)
				const ag = memcmp(w, s28, 0x20)
				st64(v, ld64(v) - 1)
				if ((ag as u32) == 0) {
					const ao = ld64(s408 + 0x18)
					st64(s408 + 0x10, ld64(ao + 0xed))
					const bu = ld64(ao + 0xe5)
					k = fn_51c8(s308, ld64(s408 + 0x38), undef, undef, undef, ag as u32)
					l = ld64(s2f8)
					g = ld64(s308 + 8)
					j = ld64(s408 + 0x28)
					if (ld64(s308) != 0) {
						st64(j + 8, l)
						st64(j, g)
						st8(j + 0x71, 2)
						return k
					}
					const at = ld64(s418 + 8)
					k = fn_717b0(s90, g, at, ld16(ao + 0xe3))
					let av = ld64(s88)
					let au = ld64(s90)
					if (au == 2) {
						const aw = memcpy(s248, av, 0xa8)
						st64(l, ld64(l) + 1)
						k = fn_51c8(s308, ld64(s408 + 0x30), undef, undef, undef, aw)
						l = ld64(s2f8)
						g = ld64(s308 + 8)
						if (ld64(s308) != 0) {
							st64(j + 8, l)
							st64(j, g)
							st8(j + 0x71, 2)
							return k
						}
						k = fn_717b0(s90, g, ld64(s418), ld16(ld64(s408 + 0x18) + 0xe3))
						av = ld64(s88)
						au = ld64(s90)
						if (au == 2) {
							memcpy(s1a0, av, 0xa8)
							st64(l, ld64(l) + 1)
							clock_get(s308)
							if (ld64(s308) != 0) {
								const ay = ld64(s308 + 8)
								const ax = ld64(s2f8)
								st64(s2f8, ld64(s2f8 + 8))
								st64(s308, ay, ax)
								k = fn_13e628(s3c8, s308)
								bf = ld64(s3c8)
								st64(j + 8, ld64(s3c8 + 8))
								st64(j, bf)
								st8(j + 0x71, 2)
								return k
							}
							if ((ld64(s408 + 0x20) as i64) > -1) {
								st64(s1000 + 0x10, ld64(s2e8 + 8))
								st64(s1000, s248, s1a0)
								const az = ld64(s428)
								k = fn_21b58(s308, -az, -(ld64(s408 + 0x20) + (az != 0)), ld64(s420), s248, s1a0, ld64(s1000 + 0x10))
								const bb = ld64(s308 + 8)
								let bc = ld64(s308)
								const ba = ld8(s2c8 + 0x31)
								if (ba == 2) {
									be = ld64(s408 + 0x28)
									st64(be + 8, bb)
									st64(be, bc)
									st8(be + 0x71, 2)
									return k
								}
								st64(s408, bb, bc)
								const bd = memcpy(sf0, s2f8, 0x60)
								st32(s1a0 + 0xa8, ld32(s2c8 + 0x32))
								st16(s1a0 + 0xac, ld16(s2c8 + 0x36))
								st64(s408 + 0x20, ld8(s2c8 + 0x30))
								k = fn_51c8(s308, ld64(s408 + 0x38), undef, undef, undef, bd)
								l = ld64(s2f8)
								bc = ld64(s308 + 8)
								if (ld64(s308) != 0) {
									be = ld64(s408 + 0x28)
									st64(be + 8, l)
									st64(be, bc)
									st8(be + 0x71, 2)
									return k
								}
								k = fn_71878(s368, bc, at, ld16(ld64(s408 + 0x18) + 0xe3), s248)
								let bg = ld64(s368)
								if (bg == 2) {
									st64(l, ld64(l) + 1)
									k = fn_51c8(s308, ld64(s408 + 0x30), undef, undef, undef, k)
									l = ld64(s2f8)
									bc = ld64(s308 + 8)
									if (ld64(s308) != 0) {
										be = ld64(s408 + 0x28)
										st64(be + 8, l)
										st64(be, bc)
										st8(be + 0x71, 2)
										return k
									}
									k = fn_71878(s378, bc, ld64(s418), ld16(ld64(s408 + 0x18) + 0xe3), s1a0)
									bg = ld64(s378)
									if (bg == 2) {
										st64(l, ld64(l) + 1)
										if ((ld64(s408 + 0x20) & 1) != 0) {
											k = fn_51c8(s308, ld64(s408 + 0x38), bh, bi, bj, k)
											l = ld64(s2f8)
											bk = ld64(s308 + 8)
											if (ld64(s308) != 0) {
												by = ld64(s408 + 0x28)
												st64(by + 8, l)
												st64(by, bk)
												st8(by + 0x71, 2)
												return k
											}
											const bl = ld8(bk + 0x2784)
											if (bl == 0) {
												k = fn_88360(s388, 0x26)
												bz = ld64(s388 + 8)
												bp = ld64(s388)
												if (bp != 2) {
													bn = ld64(s408 + 0x28)
													st64(bn, bp, bz)
													st8(bn + 0x71, 2)
													st64(l, ld64(l) + 1)
													return k
												}
												bm = ld8(bk + 0x2784)
											} else {
												bm = bl - 1
												st8(bk + 0x2784, bm)
											}
											if ((bm as u8) == 0) {
												k = fn_6d670(s398, ld64(s408 + 0x18), ld64(s430), ld32(bk + 0x20))
												bz = ld64(s398 + 8)
												bp = ld64(s398)
												if (bp != 2) {
													bn = ld64(s408 + 0x28)
													st64(bn, bp, bz)
													st8(bn + 0x71, 2)
													st64(l, ld64(l) + 1)
													return k
												}
											}
											st64(l, ld64(l) + 1)
										}
										if ((ba & 1) != 0) {
											k = fn_51c8(s308, ld64(s408 + 0x30), bh, bi, bj, k)
											l = ld64(s2f8)
											bk = ld64(s308 + 8)
											if (ld64(s308) != 0) {
												by = ld64(s408 + 0x28)
												st64(by + 8, l)
												st64(by, bk)
												st8(by + 0x71, 2)
												return k
											}
											const bw = ld8(bk + 0x2784)
											if (bw == 0) {
												k = fn_88360(s3a8, 0x26)
												bz = ld64(s3a8 + 8)
												bp = ld64(s3a8)
												if (bp != 2) {
													bn = ld64(s408 + 0x28)
													st64(bn, bp, bz)
													st8(bn + 0x71, 2)
													st64(l, ld64(l) + 1)
													return k
												}
												bx = ld8(bk + 0x2784)
											} else {
												bx = bw - 1
												st8(bk + 0x2784, bx)
											}
											if ((bx as u8) == 0) {
												k = fn_6d670(s3b8, ld64(s408 + 0x18), ld64(s430), ld32(bk + 0x20))
												bz = ld64(s3b8 + 8)
												bp = ld64(s3b8)
												if (bp != 2) {
													bn = ld64(s408 + 0x28)
													st64(bn, bp, bz)
													st8(bn + 0x71, 2)
													st64(l, ld64(l) + 1)
													return k
												}
											}
											st64(l, ld64(l) + 1)
										}
										const bq = ld64(s408 + 0x18)
										fn_6a5a8(s308, bq, k)
										const bt = ld64(bq + 0xed)
										const bs = ld64(bq + 0xe5)
										const br = ld32(bq + 0x105)
										st32(s2c8 + 4, ld64(s418 + 8))
										st32(s2c8, br)
										st64(s2d8, bs, bt)
										st64(s2e8, bu)
										st64(s2e8 + 8, ld64(s408 + 0x10))
										st32(s2c8 + 8, ld64(s418))
										fn_110060(s90, s308)
										copyr(s50, s88, 0x10)
										log_data(s50, 1)
										const bv = ld64(s408 + 0x28)
										st64(bv + 8, ld64(s408))
										st64(bv, ld64(s408 + 8))
										k = memcpy(bv + 0x10, sf0, 0x60)
										st8(bv + 0x71, ba)
										st8(bv + 0x70, ld64(s408 + 0x20))
										st32(bv + 0x72, ld32(s1a0 + 0xa8))
										st16(bv + 0x76, ld16(s1a0 + 0xac))
										return k
									}
									bo = ld64(s378 + 8)
									bn = ld64(s408 + 0x28)
									st64(bn, bg, bo)
									st8(bn + 0x71, 2)
									st64(l, ld64(l) + 1)
									return k
								}
								bo = ld64(s368 + 8)
								bn = ld64(s408 + 0x28)
								st64(bn, bg, bo)
								st8(bn + 0x71, 2)
								st64(l, ld64(l) + 1)
								return k
							}
							k = fn_88360(s358, 0x26)
							bf = ld64(s358)
							st64(j + 8, ld64(s358 + 8))
							st64(j, bf)
							st8(j + 0x71, 2)
							return k
						}
						st64(j + 8, av)
						st64(j, au)
						st8(j + 0x71, 2)
						st64(l, ld64(l) + 1)
						return k
					}
					st64(j + 8, av)
					st64(j, au)
					st8(j + 0x71, 2)
					st64(l, ld64(l) + 1)
					return k
				}
				ErrorCode_name(s28, 0x100159874)
				st64(s50, 0, 1, 0)
				st64(s70, s50, 0x10015f818)
				st8(s70 + 0x18, 3)
				st64(s70 + 0x10, 0x20)
				st64(s88 + 8, 0)
				st64(s90, 0)
				const ah = ErrorCode_fmt(0x100159874, s90)
				o = ld64(s408 + 0x28)
				if (ah != 0) {
					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
				}
				copyr(s2d0, s50, 0x18)
				copy(s2e8, s28, 0x18)
				st64(s308 + 8, 0x100159f11)
				st32(s2c8 + 0x58, 0x9c6 /* anchor::RequireKeysEqViolated */)
				st8(s2c8 + 0x10, 2)
				st32(s2f8 + 8, 0x15d)
				st64(s2f8, 0x33)
				st64(s308, 0)
				const ai = fn_13e5a0(s338, s308)
				st64(s408 + 0x38, ld64(s338 + 8))
				const aj = ld64(s338)
				k = fn_4bd8(s308, ld64(s408 + 0x30), ai)
				l = ld64(s2f8)
				const ak = ld64(s308 + 8)
				if (ld64(s308) != 0) {
					st64(o + 8, l)
					st64(o, ak)
					st8(o + 0x71, 2)
					if (aj != 0) {
						const ar = ld64(s408 + 0x38)
						void ld64(ar)
						void ld8(ar + 0x38)
						return k
					}
					const ap = ld64(s408 + 0x38)
					void ld64(ap)
					void ld8(ap + 0x50)
					return k
				}
				st64(s408 + 0x30, aj)
				copyr(s268, ak, 0x20)
				const al = ld64(s408 + 0x18)
				const am = ld16(al + 0x17f)
				const an = ld64(s408)
				st64(s2c8 + 0x10, al)
				st64(s2d8, ld64(s408 + 0x10))
				st64(s2e8, ld64(s408 + 8))
				st64(s2f8, h + 1)
				st64(s308, 0x10015984c)
				st64(s2c8, am != 0 ? an : 1, (am != 0) << 1)
				st64(s2c8 + 0x18, 1)
				st64(s2d0, 0x20)
				st64(s2e8 + 8, 0x20)
				st64(s2f8 + 8, 0x20)
				st64(s308 + 8, 4)
				st64(s28, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
				// PDA create_program_address(["pool", *(h + 1), *(ld64(s408 + 8)), *(ld64(s408 + 0x10)), (am != 0 ? an : 1)[..(am != 0) << 1], al[..1]], program *s28)
				const aq = Pubkey_create_program_address(s50, s308, 6, s28, k)
				if (ld8(s50) != 1) {
					copyr(s70, s4f, 0x20)
					copy(s90, s268, 0x20)
					k = Error_with_pubkeys(s348, ld64(s408 + 0x30), ld64(s408 + 0x38), s90, aq)
					ab = ld64(s348)
					st64(o + 8, ld64(s348 + 8))
					st64(o, ab)
					st8(o + 0x71, 2)
					st64(l, ld64(l) - 1)
					return k
				}
				st8(s2, ld8(s4f))
				fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s2, 0x100160228, 0x100160248)
			}
			st8(s28, ld8(s8f))
			fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s28, 0x100160228, 0x100160248)
		}
		ErrorCode_name(s28, 0x100159874)
		st64(s50, 0, 1, 0)
		st64(s70, s50, 0x10015f818)
		st8(s70 + 0x18, 3)
		st64(s70 + 0x10, 0x20)
		st64(s88 + 8, 0)
		st64(s90, 0)
		if (ErrorCode_fmt(0x100159874, s90) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(s2d0, s50, 0x18)
		copy(s2e8, s28, 0x18)
		st64(s308 + 8, 0x100159f11)
		st32(s2c8 + 0x58, 0x9c6 /* anchor::RequireKeysEqViolated */)
		st8(s2c8 + 0x10, 2)
		st32(s2f8 + 8, 0x15c)
		st64(s2f8, 0x33)
		st64(s308, 0)
		const n = fn_13e5a0(s318, s308)
		st64(s408 + 0x30, ld64(s318 + 8))
		const q = ld64(s318)
		k = fn_4bd8(s308, ld64(s408 + 0x38), n)
		l = ld64(s2f8)
		const p = ld64(s308 + 8)
		o = ld64(s408 + 0x28)
		if (ld64(s308) != 0) {
			st64(o + 8, l)
			st64(o, p)
			st8(o + 0x71, 2)
			if (q != 0) {
				const ac = ld64(s408 + 0x30)
				void ld64(ac)
				void ld8(ac + 0x38)
				return k
			}
			const r = ld64(s408 + 0x30)
			void ld64(r)
			void ld8(r + 0x50)
			return k
		}
		st64(s408 + 0x38, q)
		copyr(s268, p, 0x20)
		const x = ld64(s408 + 0x18)
		const y = ld16(x + 0x17f)
		const z = ld64(s408)
		st64(s2c8 + 0x10, x)
		st64(s2d8, ld64(s408 + 0x10))
		st64(s2e8, ld64(s408 + 8))
		st64(s2f8, h + 1)
		st64(s308, 0x10015984c)
		st64(s2c8, y != 0 ? z : 1, (y != 0) << 1)
		st64(s2c8 + 0x18, 1)
		st64(s2d0, 0x20)
		st64(s2e8 + 8, 0x20)
		st64(s2f8 + 8, 0x20)
		st64(s308 + 8, 4)
		st64(s28, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
		// PDA create_program_address(["pool", *(h + 1), *(ld64(s408 + 8)), *(ld64(s408 + 0x10)), (y != 0 ? z : 1)[..(y != 0) << 1], x[..1]], program *s28)
		const aa = Pubkey_create_program_address(s50, s308, 6, s28, k)
		if (ld8(s50) != 1) {
			copyr(s70, s4f, 0x20)
			copy(s90, s268, 0x20)
			k = Error_with_pubkeys(s328, ld64(s408 + 0x38), ld64(s408 + 0x30), s90, aa)
			ab = ld64(s328)
			st64(o + 8, ld64(s328 + 8))
			st64(o, ab)
			st8(o + 0x71, 2)
			st64(l, ld64(l) - 1)
			return k
		}
		st8(s2, ld8(s4f))
		fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s2, 0x100160228, 0x100160248)
	}
	st8(s28, ld8(s8f))
	fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s28, 0x100160228, 0x100160248)
}

function fn_69e08(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s48 = fp - 0x48, s58 = fp - 0x58
	const j = ld64(b + 0x58)
	const i = ld64(b + 0x50)
	const h = ld64(b + 0x70)
	const g = ld64(b + 0x40)
	const f = ld64(b + 0x48)
	let au = d
	let av = c
	let aq = fn_2c160(s48, h, i, j, c, d, g, f)
	let k = ld64(s48)
	if (k != 2) {
		st64(a + 8, ld64(s48 + 8))
		st64(a, k)
		return aq
	}
	const l = p6
	const m = p5
	const at = p8
	const r = p7
	st64(b + 0x70, ld64(s48 + 8))
	const p = ld64(b + 0x68)
	const o = ld64(b + 0x60)
	const n = ld64(b + 0x78)
	aq = fn_2c160(s48, n, o, p, m, l, g, f)
	k = ld64(s48)
	if (k == 2) {
		const q = ld64(s48 + 8)
		st64(b + 0x68, l)
		st64(b + 0x60, m)
		st64(b + 0x58, au)
		st64(b + 0x50, av)
		st64(b + 0x78, q)
		const s = ld64(r + 8)
		au = s
		av = r
		const t = ld64(r)
		const u = ld64(b + 0x80)
		const y = ld64(b + 0x90)
		st64(s30 + 8, s - ld64(b + 0x88) - (u > t))
		st64(s30, t - u)
		st64(s20, g, f, 0, 1)
		fn_584f8(s48, s30, s20, s10)
		let w = ld64(s48 + 8)
		const v = ld64(s48)
		w = v != 0 ? w : 0
		const x = w != -1 ? w : 0
		let z = ld64(s48 + 0x10) != 0 ? 0 : x
		z = v != 0 ? z : x
		if (y + z >= y) {
			st64(b + 0x80, t, au, z + y)
			const aa = ld64(av + 0x18)
			au = aa
			const ab = ld64(av + 0x10)
			const ac = ld64(b + 0x98)
			const ag = ld64(b + 0xa8)
			st64(s30 + 8, aa - ld64(b + 0xa0) - (ac > ab))
			st64(s30, ab - ac)
			st64(s20, g, f, 0, 1)
			fn_584f8(s48, s30, s20, s10)
			let ae = ld64(s48 + 8)
			const ad = ld64(s48)
			ae = ad != 0 ? ae : 0
			const af = ae != -1 ? ae : 0
			let ah = ld64(s48 + 0x10) != 0 ? 0 : af
			ah = ad != 0 ? ah : af
			if (ag + ah >= ag) {
				st64(b + 0x98, ab, au, ah + ag)
				const ai = ld64(av + 0x28)
				au = ai
				const aj = ld64(av + 0x20)
				const ak = ld64(b + 0xb0)
				const ao = ld64(b + 0xc0)
				st64(s30 + 8, ai - ld64(b + 0xb8) - (ak > aj))
				st64(s30, aj - ak)
				st64(s20, g, f, 0, 1)
				aq = fn_584f8(s48, s30, s20, s10)
				let am = ld64(s48 + 8)
				const al = ld64(s48)
				am = al != 0 ? am : 0
				const an = am != -1 ? am : 0
				let ap = ld64(s48 + 0x10) != 0 ? 0 : an
				ap = al != 0 ? ap : an
				if (ao + ap >= ao) {
					st64(b + 0xb0, aj)
					st64(b + 0xc8, at)
					st64(b + 0xb8, au, ap + ao)
					st64(a + 8, au)
					st64(a, 2)
					return aq
				}
			}
		}
		aq = fn_88360(s58, 0x26)
		const ar = ld64(s58)
		if (ar == 2) {
			st64(a + 8, undef)
			st64(a, 2)
			return aq
		}
		st64(a + 8, ld64(s58 + 8))
		st64(a, ar)
		return aq
	}
	st64(a + 8, ld64(s48 + 8))
	st64(a, k)
	return aq
}

function fn_155738(a: u64, b: u64): u64 {
	return imp__fmt_155760(ld64(a), 1, b)
}

// not included (size budget), see shared.ts:
declare function fn_88360(a: u64, b: u64): u64
declare function fn_e480(a: u64, b: u64, c: u64, d: u64, r0: u64, r7: u64): u64
declare function fn_33a88(a: u64, b: u64, c: u64, d: u64, r0: u64): u64
declare function fn_6cb08(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64
declare function fn_6cf80(a: u64, b: u64, c: u64, d: u64, r0: u64): u64
declare function fn_14ec98(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_14ce00(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_51c8(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64
declare function fn_717b0(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_21b58(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64
declare function fn_71878(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_6d670(a: u64, b: u64, c: u64, d: u64): u64
declare function fn_6a5a8(a: u64, b: u64, r0: u64): u64
declare function fn_110060(a: u64, b: u64)
declare function fn_2c160(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64
declare function fn_584f8(a: u64, b: u64, c: u64, d: u64): u64
