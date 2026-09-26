// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
type u64 = number
type u8 = u64
type u16 = u64
type u32 = u64
type i8 = u64
type i16 = u64
type i32 = u64
type i64 = u64
declare const fp: u64
declare const undef: u64
declare function ld8(a: u64): u64
declare function ld16(a: u64): u64
declare function ld32(a: u64): u64
declare function ld64(a: u64): u64
declare function st8(a: u64, ...v: u64[]): void
declare function st16(a: u64, ...v: u64[]): void
declare function st32(a: u64, ...v: u64[]): void
declare function st64(a: u64, ...v: u64[]): void
declare function copy(dst: u64, src: u64, n: u64): void
declare function copyr(dst: u64, src: u64, n: u64): void
declare function sar(x: u64, n: u64): u64 // arithmetic (sign-filling) shift right
declare function shl(x: u64, n: u64): u64 // x << n (function form, used where the << operator would parse ambiguously)
declare function popcount(x: u64): u64 // number of 1 bits
declare function clz(x: u64): u64 // leading zero bits of the 64-bit value (64 for 0)
declare function ctz(x: u64): u64 // trailing zero bits (64 for 0)
declare function rotl(x: u64, n: u64): u64 // 64-bit rotate left by n % 64
declare function min(a: u64, b: u64): u64 // unsigned
declare function max(a: u64, b: u64): u64 // unsigned
declare function smin(a: u64, b: u64): u64 // signed (i64) minimum
declare function smax(a: u64, b: u64): u64 // signed (i64) maximum
declare function sat_sub(a: u64, b: u64): u64 // a >= b ? a - b : 0
declare function memeq(p: u64, q: u64, n: u64): boolean // n bytes at p == n bytes at q (ascending 8-byte words, stops at first difference)
declare function keyeq(p: u64, key: string): boolean // 32 bytes at p == the base58 public key (same word-wise comparison)
declare function rc_inc(p: u64, x?: u64): void // Rc count increment: x = ld64(p) (unless given); st64(p, x + 1); if (x == -1) abort()
declare function rc_dec(p: u64, x?: u64): void // Rc drop: x = ld64(p) (unless given); st64(p, x - 1); if (x == 1) st64(p + 8, ld64(p + 8) - 1)
declare function rc_release(p: u64, x?: u64): boolean // Rc strong-count release: x = ld64(p) (unless given); st64(p, x - 1); result x == 1 (the last reference: the caller then drops the value)
declare function sdiv(a: u64, b: u64): u64 // signed (i64) division (traps on 0 and MIN / -1)
declare function sdiv32(a: u64, b: u64): u64 // signed division of the low 32 bits, zero-extended result
declare function srem32(a: u64, b: u64): u64 // signed remainder of the low 32 bits, zero-extended result
declare function mulhu(a: u64, b: u64): u64 // high 64 bits of the unsigned 128-bit product
declare function mulhs(a: u64, b: u64): u64 // high 64 bits of the signed 128-bit product
declare function bswap16(x: u64): u64 // byte swap of the low 16 bits
declare function bswap32(x: u64): u64 // byte swap of the low 32 bits
declare function bswap64(x: u64): u64 // byte swap
declare function srem(a: u64, b: u64): u64 // signed (i64) remainder
declare function trap(msg: string): never
declare function callx(fn: u64, ...args: u64[]): u64

// typed views: x.field is exactly the load / store / address given by the field declaration
type at<Offset extends number, T> = T // view field: a T at byte offset Offset of the object (x.f: scalar = its load, ref<U> = the loaded pointer, other = its address)
type ref<T> = T                        // view field holding a pointer (8 bytes) to a T
interface sized<Size extends number> {} // a view of that many bytes: x[k] is the k-th such object from x (at x + k * Size)
interface Pubkey {} // 32-byte public key (a Pubkey value is its address)
interface bytes {} // byte array in place (a bytes value is its address)
interface Bytes64 {} // 64 bytes in place (value = their address)
interface u128 {} // 128-bit integer in place (value = its address)
interface Bytes4400 {} // 4400 bytes in place (value = their address)
interface Bytes320 {} // 320 bytes in place (value = their address)
interface Bytes3200 {} // 3200 bytes in place (value = their address)
interface Bytes1 {} // 1 bytes in place (value = their address)
interface Bytes2 {} // 2 bytes in place (value = their address)
interface Bytes4 {} // 4 bytes in place (value = their address)
interface Bytes507 {} // 507 bytes in place (value = their address)
interface Bytes128 {} // 128 bytes in place (value = their address)
interface Bytes46 {} // 46 bytes in place (value = their address)
interface Bytes112 {} // 112 bytes in place (value = their address)
interface Bytes256 {} // 256 bytes in place (value = their address)
interface Bytes896 {} // 896 bytes in place (value = their address)
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
interface Input { // program input (entrypoint parameter): account count, then the first serialized account
	num_accounts: at<0x00, u64>
	acc0:         at<0x08, AccountRecord>
}
interface ObservationStateAccount extends sized<0x1183> { // data of an account of type ObservationState (Anchor IDL: 8-byte discriminator, then the fields in serialized order)
	discriminator:     at<0x00, u64>
	initialized:       at<0x08, u8>
	recent_epoch:      at<0x09, u64>
	observation_index: at<0x11, u16>
	pool_id:           at<0x13, Pubkey>
	observations:      at<0x33, Bytes4400>
	padding:           at<0x1163, Pubkey>
}
interface OperationStateAccount extends sized<0xdc9> { // data of an account of type OperationState (Anchor IDL: 8-byte discriminator, then the fields in serialized order)
	discriminator:    at<0x00, u64>
	bump:             at<0x08, u8>
	operation_owners: at<0x09, Bytes320>
	whitelist_mints:  at<0x149, Bytes3200>
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
interface TickArrayBitmapExtensionAccount extends sized<0x728> { // data of an account of type TickArrayBitmapExtension (Anchor IDL: 8-byte discriminator, then the fields in serialized order)
	discriminator:              at<0x00, u64>
	pool_id:                    at<0x08, Pubkey>
	positive_tick_array_bitmap: at<0x28, Bytes896>
	negative_tick_array_bitmap: at<0x3a8, Bytes896>
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
interface Permission extends sized<0x118> { // Account<Permission> as deserialized in memory (the IDL fields at the offsets a run of try_accounts_18700 put them [idl names; offsets from exec]; info = the &AccountInfo)
	info:       at<0x00, ref<AccountInfo>> // &AccountInfo
	authority:  at<0x08, Pubkey>
	padding_0:  at<0x28, u64>
	padding_1:  at<0x30, u64>
	padding_2:  at<0x38, u64>
	padding_3:  at<0x40, u64>
	padding_4:  at<0x48, u64>
	padding_5:  at<0x50, u64>
	padding_6:  at<0x58, u64>
	padding_7:  at<0x60, u64>
	padding_8:  at<0x68, u64>
	padding_9:  at<0x70, u64>
	padding_10: at<0x78, u64>
	padding_11: at<0x80, u64>
	padding_12: at<0x88, u64>
	padding_13: at<0x90, u64>
	padding_14: at<0x98, u64>
	padding_15: at<0xa0, u64>
	padding_16: at<0xa8, u64>
	padding_17: at<0xb0, u64>
	padding_18: at<0xb8, u64>
	padding_19: at<0xc0, u64>
	padding_20: at<0xc8, u64>
	padding_21: at<0xd0, u64>
	padding_22: at<0xd8, u64>
	padding_23: at<0xe0, u64>
	padding_24: at<0xe8, u64>
	padding_25: at<0xf0, u64>
	padding_26: at<0xf8, u64>
	padding_27: at<0x100, u64>
	padding_28: at<0x108, u64>
	padding_29: at<0x110, u64>
}
interface AmmConfig extends sized<0x78> { // Account<AmmConfig> as deserialized in memory (the IDL fields at the offsets a run of try_accounts_184d8 put them [idl names; offsets from exec]; info = the &AccountInfo)
	info:              at<0x00, ref<AccountInfo>> // &AccountInfo
	owner:             at<0x08, Pubkey>
	fund_owner:        at<0x28, Pubkey>
	padding_0:         at<0x48, u64>
	padding_1:         at<0x50, u64>
	padding_2:         at<0x58, u64>
	protocol_fee_rate: at<0x60, u32>
	trade_fee_rate:    at<0x64, u32>
	fund_fee_rate:     at<0x68, u32>
	padding_u32:       at<0x6c, u32>
	index:             at<0x70, u16>
	tick_spacing:      at<0x72, u16>
	bump:              at<0x74, u8>
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
interface CreateAmmConfigAccounts { // Accounts struct of instruction create_amm_config as accounts_create_amm_config returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	owner: at<0x00, ref<AccountInfo>>
}
interface CreateAmmConfigContext { // anchor_lang Context of instruction create_amm_config (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<CreateAmmConfigAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface CreatePoolAccounts { // Accounts struct of instruction create_pool as accounts_create_pool returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	pool_creator: at<0x00, ref<AccountInfo>>
	pool_state:   at<0x10, ref<AccountInfo>>
}
interface CreatePoolContext { // anchor_lang Context of instruction create_pool (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<CreatePoolAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface CreateCustomizablePoolAccounts { // Accounts struct of instruction create_customizable_pool as accounts_create_customizable_pool returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	pool_creator: at<0x00, ref<AccountInfo>>
	pool_state:   at<0x10, ref<AccountInfo>>
}
interface CreateCustomizablePoolContext { // anchor_lang Context of instruction create_customizable_pool (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<CreateCustomizablePoolAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface CreatePermissionedPoolAccounts { // Accounts struct of instruction create_permissioned_pool as accounts_create_permissioned_pool returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	payer:        at<0x00, ref<AccountInfo>>
	permission:   at<0x10, Permission> // Account<Permission> in place
	pool_state:   at<0x130, ref<AccountInfo>>
	token_mint_1: at<0x140, ref<Mint>> // Box<Account<Mint>>
}
interface CreatePermissionedPoolContext { // anchor_lang Context of instruction create_permissioned_pool (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<CreatePermissionedPoolAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface CreateOperationAccountAccounts { // Accounts struct of instruction create_operation_account as accounts_create_operation_account returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	owner:           at<0x00, ref<AccountInfo>>
	operation_state: at<0x08, ref<AccountInfo>>
}
interface CreateOperationAccountContext { // anchor_lang Context of instruction create_operation_account (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<CreateOperationAccountAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface InitializeRewardAccounts { // Accounts struct of instruction initialize_reward as accounts_initialize_reward returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	reward_funder: at<0x00, ref<AccountInfo>>
}
interface InitializeRewardContext { // anchor_lang Context of instruction initialize_reward (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<InitializeRewardAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface CollectProtocolFeeAccounts { // Accounts struct of instruction collect_protocol_fee as accounts_collect_protocol_fee returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	amm_config:                at<0x10, AmmConfig> // Account<AmmConfig> in place
	vault_1_mint:              at<0xa0, ref<Mint>> // Box<Account<Mint>>
	recipient_token_account_0: at<0xa8, ref<TokenAccount>> // Box<Account<TokenAccount>>
	recipient_token_account_1: at<0xb0, ref<TokenAccount>> // Box<Account<TokenAccount>>
}
interface CollectProtocolFeeContext { // anchor_lang Context of instruction collect_protocol_fee (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<CollectProtocolFeeAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface CollectFundFeeAccounts { // Accounts struct of instruction collect_fund_fee as accounts_collect_fund_fee returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	amm_config:                at<0x10, AmmConfig> // Account<AmmConfig> in place
	vault_1_mint:              at<0xa0, ref<Mint>> // Box<Account<Mint>>
	recipient_token_account_0: at<0xa8, ref<TokenAccount>> // Box<Account<TokenAccount>>
	recipient_token_account_1: at<0xb0, ref<TokenAccount>> // Box<Account<TokenAccount>>
}
interface CollectFundFeeContext { // anchor_lang Context of instruction collect_fund_fee (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<CollectFundFeeAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
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
interface OpenPositionV2Accounts { // Accounts struct of instruction open_position_v2 as accounts_open_position_v2 returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	payer:           at<0x00, ref<AccountInfo>>
	pool_state:      at<0x28, ref<AccountInfo>> // the &AccountInfo of an account of type PoolState (e.g. AccountLoader<PoolState>: data not deserialized)
	token_account_0: at<0x50, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_account_1: at<0x58, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_vault_0:   at<0x60, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_vault_1:   at<0x68, ref<TokenAccount>> // Box<Account<TokenAccount>>
	vault_0_mint:    at<0xb8, ref<Mint>> // Box<Account<Mint>>
	vault_1_mint:    at<0xc0, ref<Mint>> // Box<Account<Mint>>
}
interface OpenPositionV2Context { // anchor_lang Context of instruction open_position_v2 (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<OpenPositionV2Accounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
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
interface ClosePositionAccounts { // Accounts struct of instruction close_position as accounts_close_position returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	nft_owner: at<0x00, ref<AccountInfo>>
}
interface ClosePositionContext { // anchor_lang Context of instruction close_position (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<ClosePositionAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface IncreaseLiquidityAccounts { // Accounts struct of instruction increase_liquidity as accounts_increase_liquidity returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	tick_array_lower: at<0x28, ref<AccountInfo>> // the &AccountInfo of an account of type TickArrayState (e.g. AccountLoader<TickArrayState>: data not deserialized)
	tick_array_upper: at<0x30, ref<AccountInfo>> // the &AccountInfo of an account of type TickArrayState (e.g. AccountLoader<TickArrayState>: data not deserialized)
	token_account_0:  at<0x38, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	token_account_1:  at<0x40, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	token_vault_0:    at<0x48, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	token_vault_1:    at<0x50, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
}
interface IncreaseLiquidityContext { // anchor_lang Context of instruction increase_liquidity (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<IncreaseLiquidityAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface IncreaseLiquidityV2Accounts { // Accounts struct of instruction increase_liquidity_v2 as accounts_increase_liquidity_v2 returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	tick_array_lower: at<0x28, ref<AccountInfo>> // the &AccountInfo of an account of type TickArrayState (e.g. AccountLoader<TickArrayState>: data not deserialized)
	tick_array_upper: at<0x30, ref<AccountInfo>> // the &AccountInfo of an account of type TickArrayState (e.g. AccountLoader<TickArrayState>: data not deserialized)
	token_account_0:  at<0x38, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_account_1:  at<0x40, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_vault_0:    at<0x48, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_vault_1:    at<0x50, ref<TokenAccount>> // Box<Account<TokenAccount>>
	vault_0_mint:     at<0x68, ref<Mint>> // Box<Account<Mint>>
	vault_1_mint:     at<0x70, ref<Mint>> // Box<Account<Mint>>
}
interface IncreaseLiquidityV2Context { // anchor_lang Context of instruction increase_liquidity_v2 (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<IncreaseLiquidityV2Accounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface DecreaseLiquidityAccounts { // Accounts struct of instruction decrease_liquidity as accounts_decrease_liquidity returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	token_vault_1:             at<0x30, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	tick_array_lower:          at<0x38, ref<AccountInfo>> // the &AccountInfo of an account of type TickArrayState (e.g. AccountLoader<TickArrayState>: data not deserialized)
	tick_array_upper:          at<0x40, ref<AccountInfo>> // the &AccountInfo of an account of type TickArrayState (e.g. AccountLoader<TickArrayState>: data not deserialized)
	recipient_token_account_0: at<0x48, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	recipient_token_account_1: at<0x50, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
}
interface DecreaseLiquidityContext { // anchor_lang Context of instruction decrease_liquidity (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<DecreaseLiquidityAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
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
interface SwapAccounts { // Accounts struct of instruction swap as accounts_swap returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	output_vault:      at<0x30, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	observation_state: at<0x38, ref<AccountInfo>> // the &AccountInfo of an account of type ObservationState (e.g. AccountLoader<ObservationState>: data not deserialized)
	tick_array:        at<0x48, ref<AccountInfo>>
}
interface SwapContext { // anchor_lang Context of instruction swap (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<SwapAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface SwapV2Accounts { // Accounts struct of instruction swap_v2 as accounts_swap_v2 returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	output_vault:      at<0x30, ref<TokenAccount>> // Box<Account<TokenAccount>>
	observation_state: at<0x38, ref<AccountInfo>> // the &AccountInfo of an account of type ObservationState (e.g. AccountLoader<ObservationState>: data not deserialized)
	input_vault_mint:  at<0x58, ref<Mint>> // Box<Account<Mint>>
	output_vault_mint: at<0x60, ref<Mint>> // Box<Account<Mint>>
}
interface SwapV2Context { // anchor_lang Context of instruction swap_v2 (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<SwapV2Accounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface OpenLimitOrderAccounts { // Accounts struct of instruction open_limit_order as accounts_open_limit_order returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	input_token_account: at<0x00, TokenAccount> // Account<TokenAccount> in place
}
interface OpenLimitOrderContext { // anchor_lang Context of instruction open_limit_order (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<OpenLimitOrderAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface IncreaseLimitOrderAccounts { // Accounts struct of instruction increase_limit_order as accounts_increase_limit_order returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	input_vault_mint: at<0x28, ref<Mint>> // Box<Account<Mint>>
}
interface IncreaseLimitOrderContext { // anchor_lang Context of instruction increase_limit_order (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<IncreaseLimitOrderAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface DecreaseLimitOrderAccounts { // Accounts struct of instruction decrease_limit_order as accounts_decrease_limit_order returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	input_vault:       at<0x28, ref<TokenAccount>> // Box<Account<TokenAccount>>
	output_vault:      at<0x30, ref<TokenAccount>> // Box<Account<TokenAccount>>
	input_vault_mint:  at<0x38, ref<Mint>> // Box<Account<Mint>>
	output_vault_mint: at<0x40, ref<Mint>> // Box<Account<Mint>>
}
interface DecreaseLimitOrderContext { // anchor_lang Context of instruction decrease_limit_order (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<DecreaseLimitOrderAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface SettleLimitOrderAccounts { // Accounts struct of instruction settle_limit_order as accounts_settle_limit_order returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	output_vault_mint: at<0x28, ref<Mint>> // Box<Account<Mint>>
}
interface SettleLimitOrderContext { // anchor_lang Context of instruction settle_limit_order (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<SettleLimitOrderAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface CloseLimitOrderAccounts { // Accounts struct of instruction close_limit_order as accounts_close_limit_order returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	signer:      at<0x00, ref<AccountInfo>>
	limit_order: at<0x10, ref<AccountInfo>>
}
interface CloseLimitOrderContext { // anchor_lang Context of instruction close_limit_order (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<CloseLimitOrderAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface ObservationStateData extends sized<0x117b> { // the data of an account of type ObservationState after its 8-byte discriminator, in place in the account (zero-copy: what AccountLoader::load / load_mut returns) [idl layout; the loader from a run]
	initialized:       at<0x00, u8>
	recent_epoch:      at<0x01, u64>
	observation_index: at<0x09, u16>
	pool_id:           at<0x0b, Pubkey>
	observations:      at<0x2b, Bytes4400>
	padding:           at<0x115b, Pubkey>
}
interface CreateAmmConfigArgs extends sized<0x10> { // arguments of instruction create_amm_config (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	index:             at<0x00, u16>
	tick_spacing:      at<0x02, u16>
	trade_fee_rate:    at<0x04, u32>
	protocol_fee_rate: at<0x08, u32>
	fund_fee_rate:     at<0x0c, u32>
}
interface UpdateAmmConfigArgs extends sized<0x05> { // arguments of instruction update_amm_config (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	param: at<0x00, u8>
	value: at<0x01, u32>
}
interface CreateDynamicFeeConfigArgs extends sized<0x10> { // arguments of instruction create_dynamic_fee_config (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	index:                      at<0x00, u16>
	filter_period:              at<0x02, u16>
	decay_period:               at<0x04, u16>
	reduction_factor:           at<0x06, u16>
	dynamic_fee_control:        at<0x08, u32>
	max_volatility_accumulator: at<0x0c, u32>
}
interface UpdateDynamicFeeConfigArgs extends sized<0x0e> { // arguments of instruction update_dynamic_fee_config (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	filter_period:              at<0x00, u16>
	decay_period:               at<0x02, u16>
	reduction_factor:           at<0x04, u16>
	dynamic_fee_control:        at<0x06, u32>
	max_volatility_accumulator: at<0x0a, u32>
}
interface CreatePoolArgs extends sized<0x18> { // arguments of instruction create_pool (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	sqrt_price_x64: at<0x00, u128>
	open_time:      at<0x10, u64>
}
interface CreateCustomizableParams extends sized<0x12> { // IDL type CreateCustomizableParams (Borsh layout)
	sqrt_price_x64:     at<0x00, u128>
	collect_fee_on:     at<0x10, u8>
	enable_dynamic_fee: at<0x11, u8>
}
interface UpdatePoolStatusArgs extends sized<0x01> { // arguments of instruction update_pool_status (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	status: at<0x00, u8>
}
interface TransferRewardOwnerArgs extends sized<0x20> { // arguments of instruction transfer_reward_owner (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	new_owner: at<0x00, Pubkey>
}
interface InitializeRewardParam extends sized<0x20> { // IDL type InitializeRewardParam (Borsh layout)
	open_time:                at<0x00, u64>
	end_time:                 at<0x08, u64>
	emissions_per_second_x64: at<0x10, u128>
}
interface InitializeRewardArgs extends sized<0x20> { // arguments of instruction initialize_reward (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	param: at<0x00, InitializeRewardParam>
}
interface CollectRemainingRewardsArgs extends sized<0x01> { // arguments of instruction collect_remaining_rewards (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	reward_index: at<0x00, u8>
}
interface SetRewardParamsArgs extends sized<0x21> { // arguments of instruction set_reward_params (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	reward_index:             at<0x00, u8>
	emissions_per_second_x64: at<0x01, u128>
	open_time:                at<0x11, u64>
	end_time:                 at<0x19, u64>
}
interface CollectProtocolFeeArgs extends sized<0x10> { // arguments of instruction collect_protocol_fee (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	amount_0_requested: at<0x00, u64>
	amount_1_requested: at<0x08, u64>
}
interface CollectFundFeeArgs extends sized<0x10> { // arguments of instruction collect_fund_fee (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	amount_0_requested: at<0x00, u64>
	amount_1_requested: at<0x08, u64>
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
interface OpenPositionV2Args { // arguments of instruction open_position_v2 (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	tick_lower_index:             at<0x00, u32>
	tick_upper_index:             at<0x04, u32>
	tick_array_lower_start_index: at<0x08, u32>
	tick_array_upper_start_index: at<0x0c, u32>
	liquidity:                    at<0x10, u128>
	amount_0_max:                 at<0x20, u64>
	amount_1_max:                 at<0x28, u64>
	with_metadata:                at<0x30, u8>
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
interface IncreaseLiquidityArgs extends sized<0x20> { // arguments of instruction increase_liquidity (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	liquidity:    at<0x00, u128>
	amount_0_max: at<0x10, u64>
	amount_1_max: at<0x18, u64>
}
interface IncreaseLiquidityV2Args { // arguments of instruction increase_liquidity_v2 (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	liquidity:    at<0x00, u128>
	amount_0_max: at<0x10, u64>
	amount_1_max: at<0x18, u64>
}
interface DecreaseLiquidityArgs extends sized<0x20> { // arguments of instruction decrease_liquidity (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	liquidity:    at<0x00, u128>
	amount_0_min: at<0x10, u64>
	amount_1_min: at<0x18, u64>
}
interface DecreaseLiquidityV2Args extends sized<0x20> { // arguments of instruction decrease_liquidity_v2 (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	liquidity:    at<0x00, u128>
	amount_0_min: at<0x10, u64>
	amount_1_min: at<0x18, u64>
}
interface SwapArgs extends sized<0x21> { // arguments of instruction swap (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	amount:                 at<0x00, u64>
	other_amount_threshold: at<0x08, u64>
	sqrt_price_limit_x64:   at<0x10, u128>
	is_base_input:          at<0x20, u8>
}
interface SwapV2Args extends sized<0x21> { // arguments of instruction swap_v2 (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	amount:                 at<0x00, u64>
	other_amount_threshold: at<0x08, u64>
	sqrt_price_limit_x64:   at<0x10, u128>
	is_base_input:          at<0x20, u8>
}
interface SwapRouterBaseInArgs extends sized<0x10> { // arguments of instruction swap_router_base_in (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	amount_in:          at<0x00, u64>
	amount_out_minimum: at<0x08, u64>
}
interface OpenLimitOrderArgs extends sized<0x0e> { // arguments of instruction open_limit_order (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	nonce_index:  at<0x00, u8>
	zero_for_one: at<0x01, u8>
	tick_index:   at<0x02, u32>
	amount:       at<0x06, u64>
}
interface IncreaseLimitOrderArgs extends sized<0x08> { // arguments of instruction increase_limit_order (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	amount: at<0x00, u64>
}
interface DecreaseLimitOrderArgs extends sized<0x10> { // arguments of instruction decrease_limit_order (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	amount:     at<0x00, u64>
	amount_min: at<0x08, u64>
}

// syscalls
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_log_pubkey(pubkey: u64): void // log base58 pubkey (32 bytes)
declare function sol_log_data(slices: u64, len: u64): void // log base64 data: slices = &[&[u8]]
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function sol_memmove(dst: u64, src: u64, n: u64): void // memmove
declare function sol_memset(dst: u64, byte: u64, n: u64): void // memset

// library functions (recognized in many programs; not decompiled)
declare function try_accounts_120(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function fn_11e0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function fn_12d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function fn_13d0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function fn_14c8(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from
declare function try_accounts_15c0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_1678(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::interface_account::InterfaceAccount<T> as anchor_lang::Accounts<B>…
declare function fn_1730(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_3be8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a Display implementation returned an err…"
declare function InterfaceAccount_try_from_unchecked(a: u64, b: u64): u64 // lib anchor_lang::accounts::interface_account::InterfaceAccount<T>::try_from_unchecked
declare function InterfaceAccount_try_from(a: u64, b: u64): u64 // lib anchor_lang::accounts::interface_account::InterfaceAccount<T>::try_from
declare function fn_7498(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses try_accounts_1678, alloc_handle_alloc_error, memcpy
declare function fn_7600(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses try_accounts_182b0, alloc_handle_alloc_error, memcpy
declare function fn_7768(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses try_accounts_15c0, alloc_handle_alloc_error, memcpy
declare function Account_try_from_unchecked(a: u64, b: u64): u64 // lib anchor_lang::accounts::account::Account<T>::try_from_unchecked
declare function Account_try_from(a: u64, b: u64): u64 // lib anchor_lang::accounts::account::Account<T>::try_from
declare function fn_a1d8(a: u64, b: u64, c: u64, d: u64): u64 // lib uses memcmp, common_is_closed
declare function Account_exit_with_expected_owner(a: u64, b: u64, c: u64, d: u64): u64 // lib anchor_lang::accounts::account::Account<T>::exit_with_expected_owner
declare function fn_bad8(a: u64, b: u64, r0: u64): u64 // lib uses AccountInfo_try_borrow_data, TokenAccount_try_deserialize_unchecked_12d088, memcpy
declare function fn_bd88(a: u64, b: u64, r0: u64): u64 // lib uses AccountInfo_try_borrow_data, TokenAccount_try_deserialize_unchecked_126ff8, memcpy
declare function fn_e948(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib uses Mint_unpack_from_slice_137968, raw_vec_handle_error, memset2, memcmp
declare function fn_ef08(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function fn_f128(a: u64): u64 // lib uses alloc_handle_alloc_error, Error__new
declare function AccountInfo_clone_f338(a: u64, b: u64): u64 // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function AccountInfo_clone_f440(a: u64, b: u64): void // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function num_fmt_f548(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::num::<impl core::fmt::Debug for usize>::fmt
declare function ptr_drop_in_place_f5e8(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<solana_account_info::AccountInfo>
declare function fn_fc80(a: u64, b: u64, r0: u64): u64 // lib
declare function ptr_drop_in_place_fcd8(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<solana_account_info::AccountInfo>
declare function ptr_drop_in_place_fd78(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_account_info::AccountInfo; 4]>
declare function fn_ff88(a: u64, r0: u64): u64 // lib uses Rc_drop_slow_14df0
declare function fn_10038(a: u64, r0: u64): u64 // lib
declare function fn_10220(a: u64, b: u64, c: u64): u64 // lib
declare function fn_145f8(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses de_unexpected_eof_to_unexpected_length_of_input
declare function Rc_drop_slow_14df0(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function fn_15168(a: u64, b: u64): u64 // lib uses raw_vec_finish_grow_14e20, raw_vec_handle_error
declare function fn_152e0(a: u64, b: u64): void // lib uses raw_vec_finish_grow_14e20, raw_vec_handle_error
declare function fn_15458(a: u64, b: u64): void // lib uses raw_vec_finish_grow_14e20, raw_vec_handle_error
declare function RawVec_grow_one_155c0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib alloc::raw_vec::RawVec<T,A>::grow_one
declare function reserve_do_reserve_and_handle_156f8(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib alloc::raw_vec::RawVecInner<A>::reserve::do_reserve_and_handle
declare function fn_15cc8(a: u64, b: u64): u64 // lib
declare function fn_15de8(a: u64, b: u64): u64 // lib
declare function fn_16008(a: u64, b: u64): u64 // lib
declare function fn_16598(a: u64, b: u64): u64 // lib uses de_unexpected_eof_to_unexpected_length_of_input
declare function try_accounts_17a30(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_17ae0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_182b0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_18368(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_18420(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_184d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_18590(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_18648(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_18700(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_187b8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_18870(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_18aa0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_18cf0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp, Error_with_pubkeys
declare function try_accounts_18f40(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_19190(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_193e0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from, memcmp, Error_with_pubkeys
declare function fn_1034c8(a: u64, b: u64, c: u64): void // lib uses __multi3_159030
declare function fn_103fe8(a: u64, b: u64, c: u64): u64 // lib uses __multi3_159030
declare function log_115210(a: u64, b: u64, c: u64): u64 // lib "Instruction: IdlResizeAccountdata_len sh…", "data_len should always be >= the current…"
declare function log_115a40(a: u64): void // lib "Instruction: IdlCreateBufferInstruction:…"
declare function panic_unwrap_err(a: u64, b: u64, c: u64): u64 // lib "Instruction: IdlWriteInstruction: IdlSet…", "called `Result::unwrap()` on an `Err` va…"
declare function log_115d68(a: u64, b: u64): void // lib "Instruction: IdlSetAuthorityInstruction:…"
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_124d38(a: u64, b: u64, c: u64): u64 // lib uses memcpy, anchor_error_from
declare function fn_125528(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses de_unexpected_eof_to_unexpected_length_of_input, anchor_error_from, callx
declare function Rc_drop_slow_125dd0(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function Rc_drop_slow_125e20(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function associated_token_create(a: u64, b: u64): u64 // lib anchor_spl::associated_token::create
declare function token_transfer(a: u64, b: u64, c: u64): u64 // lib anchor_spl::token::transfer
declare function token_2022_transfer_checked(a: u64, b: u64, c: u64, d: u64): u64 // lib anchor_spl::token_2022::transfer_checked
declare function token_2022_mint_to(a: u64, b: u64, c: u64): u64 // lib anchor_spl::token_2022::mint_to
declare function token_2022_burn(a: u64, b: u64, c: u64): u64 // lib anchor_spl::token_2022::burn
declare function fn_128fe0(a: u64, b: u64): u64 // lib uses memcpy, Rc_drop_slow_125dd0, Rc_drop_slow_125e20
declare function token_2022_close_account_1298c8(a: u64, b: u64): u64 // lib anchor_spl::token_2022::close_account
declare function token_2022_close_account_12a0d8(a: u64, b: u64): u64 // lib anchor_spl::token_2022::close_account
declare function token_2022_close_account_12a8e8(a: u64, b: u64): u64 // lib anchor_spl::token_2022::close_account
declare function fn_12b0f8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcpy, Rc_drop_slow_125dd0, Rc_drop_slow_125e20
declare function fn_12c9e0(a: u64, b: u64): u64 // lib uses memcpy, Rc_drop_slow_125dd0, Rc_drop_slow_125e20
declare function metadata_create_metadata_accounts_v3(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib anchor_spl::metadata::create_metadata_accounts_v3
declare function RawVec_grow_one_12f3a0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib alloc::raw_vec::RawVec<T,A>::grow_one
declare function reserve_do_reserve_and_handle_12f548(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib alloc::raw_vec::RawVecInner<A>::reserve::do_reserve_and_handle
declare function BorshSerialize_try_to_vec(a: u64, b: u64): void // lib borsh::ser::BorshSerialize::try_to_vec
declare function RawVec_grow_one_131b28(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib alloc::raw_vec::RawVec<T,A>::grow_one
declare function RawVec_grow_one_131c60(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib alloc::raw_vec::RawVec<T,A>::grow_one
declare function reserve_do_reserve_and_handle_131e08(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib alloc::raw_vec::RawVecInner<A>::reserve::do_reserve_and_handle
declare function fn_132590(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses __multi3_159030, __udivti3
declare function fn_132718(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses __multi3_159030, __udivti3
declare function fn_132b38(a: u64, b: u64): void // lib
declare function fn_132bf8(a: u64): u64 // lib
declare function fn_132c40(a: u64, b: u64, c: u64, r0: u64): u64 // lib
declare function fn_132ff0(a: u64, b: u64, c: u64): void // lib
declare function fn_133040(a: u64, b: u64, c: u64): void // lib
declare function fn_1334b0(a: u64, b: u64): u64 // lib uses __rust_alloc, raw_vec_handle_error, reserve_do_reserve_and_handle_131e08, memcpy
declare function RawVec_grow_one_138250(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib alloc::raw_vec::RawVec<T,A>::grow_one
declare function TokenInstruction_pack(a: u64, b: u64): void // lib spl_token::instruction::TokenInstruction::pack
declare function fn_13a4a8(a: u64, r0: u64): void // lib
declare function reserve_do_reserve_and_handle_13a808(a: u64, b: u64, c: u64): void // lib alloc::raw_vec::RawVecInner<A>::reserve::do_reserve_and_handle
declare function fn_13c0f0(a: u64, b: u64): void // lib
declare function fn_13c168(a: u64, b: u64, r0: u64): u64 // lib uses memcmp
declare function instruction_build_associated_token_account_instruction(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib spl_associated_token_account_client::instruction::build_associated_token_account_instructi…
declare function Error_new_13c880(): u64 // lib std::io::error::Error::new
declare function Rc_drop_slow_13cfe8(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function Rc_drop_slow_13d038(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function Error_log(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib anchor_lang::error::Error::log
declare function Error_with_pubkeys(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib anchor_lang::error::Error::with_pubkeys
declare function error_from(a: u64, b: u64, c: u64, r0: u64): u64 // lib anchor_lang::error::<impl core::convert::From<anchor_lang::error::Error> for solana_progra…
declare function system_program_assign_13fb30(a: u64, b: u64, c: u64): u64 // lib anchor_lang::system_program::assign
declare function system_program_assign_13ff40(a: u64, b: u64, c: u64): u64 // lib anchor_lang::system_program::assign
declare function system_program_create_account(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib anchor_lang::system_program::create_account
declare function system_program_transfer(a: u64, b: u64, c: u64): u64 // lib anchor_lang::system_program::transfer
declare function ErrorCode_name(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib anchor_lang::error::ErrorCode::name
declare function ErrorCode_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::error::ErrorCode as core::fmt::Display>::fmt
declare function invoke_signed(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcmp, AccountInfo_try_borrow_lamports, AccountInfo_try_borrow_data, sol_invoke_signed_rust, …
declare function clock_get(a: u64): u64 // lib solana_sysvar::clock::<impl solana_sysvar::Sysvar for solana_clock::Clock>::get
declare function rent_get(a: u64): u64 // lib solana_sysvar::rent::<impl solana_sysvar::Sysvar for solana_rent::Rent>::get
declare function fn_142b40(a: u64): void // lib uses memset2, sol_get_return_data, __rust_alloc, raw_vec_handle_error, …
declare function RawVec_grow_one_142e88(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib alloc::raw_vec::RawVec<T,A>::grow_one
declare function __serialize(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib solana_pubkey::_::<impl serde_core::ser::Serialize for solana_pubkey::Pubkey>::serialize
declare function reserve_do_reserve_and_handle_146840(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib alloc::raw_vec::RawVecInner<A>::reserve::do_reserve_and_handle
declare function Rent_is_exempt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib solana_rent::Rent::is_exempt
declare function AccountInfo_try_data_len(a: u64, b: u64): void // lib solana_account_info::AccountInfo::try_data_len
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function memset(a: u64, b: u64, c: u64, r0: u64): u64 // lib uses sol_memset
declare function AccountInfo_assign(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::assign
declare function solana_program_error_from(a: u64, r0: u64): u64 // lib solana_program_error::<impl core::convert::From<solana_program_error::ProgramError> for u6…
declare function rent_check_id(a: u64): u64 // lib solana_sdk_ids::sysvar::rent::check_id
declare function Pubkey_create_with_seed(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib solana_pubkey::Pubkey::create_with_seed
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function Pubkey_create_program_address(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib solana_pubkey::Pubkey::create_program_address
declare function solana_pubkey_write_as_base58(a: u64, b: u64): u64 // lib solana_pubkey::write_as_base58
declare function de_unexpected_eof_to_unexpected_length_of_input(a: u64): u64 // lib borsh::de::unexpected_eof_to_unexpected_length_of_input
declare function error_fmt(a: u64, b: u64): u64 // lib std::io::error::<impl core::fmt::Debug for std::io::error::repr_bitpacked::Repr>::fmt
declare function fn_14d578(a: u64, b: u64, c: u64, d: u64): void // lib uses alloc_handle_alloc_error
declare function ptr_drop_in_place_14d748(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<alloc::string::String>
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fn_14de10(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a formatting trait implementation return…"
declare function Vec_clone(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <alloc::vec::Vec<T,A> as core::clone::Clone>::clone
declare function BorrowError_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <core::cell::BorrowError as core::fmt::Debug>::fmt
declare function BorrowMutError_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <core::cell::BorrowMutError as core::fmt::Debug>::fmt
declare function PanicInfo_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <core::panic::panic_info::PanicInfo as core::fmt::Display>::fmt
declare function DebugStruct_field_with(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib core::fmt::builders::DebugStruct::field_with
declare function DebugTuple_field_with(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib core::fmt::builders::DebugTuple::field_with
declare function GenericRadix_fmt_int_14fb60(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::num::GenericRadix::fmt_int
declare function GenericRadix_fmt_int_14fc50(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::num::GenericRadix::fmt_int
declare function GenericRadix_fmt_int_14fd58(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::num::GenericRadix::fmt_int
declare function GenericRadix_fmt_int_14fe60(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::num::GenericRadix::fmt_int
declare function GenericRadix_fmt_int_14ff60(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::num::GenericRadix::fmt_int
declare function GenericRadix_fmt_int_150060(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::num::GenericRadix::fmt_int
declare function fn_150868(a: u64, b: u64): u64 // lib
declare function fmt_write(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::write
declare function str_fmt_1520d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <str as core::fmt::Debug>::fmt
declare function str_fmt_152a30(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <str as core::fmt::Display>::fmt
declare function fn_152f48(a: u64): u64 // lib
declare function str_slice_error_fail_rt(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib core::str::slice_error_fail_rt
declare function imp__fmt_154cb0(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u8>::_fmt
declare function fn_154e40(a: u64, b: u64, c: u64): u64 // lib "0001020304050607080910111213141516171819…", "0001020304050607080910111213141516171819…"
declare function imp_fmt(a: u64, b: u64): u64 // lib core::fmt::num::imp::<impl core::fmt::Display for i32>::fmt
declare function imp__fmt_155448(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u32>::_fmt
declare function imp__fmt_155760(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u64>::_fmt
declare function T_fmt_155a08(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <&T as core::fmt::Debug>::fmt
declare function T_fmt_155a38(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <&T as core::fmt::Display>::fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function cmp___gedf2(a: u64, b: u64): u64 // lib compiler_builtins::float::cmp::__gedf2
declare function fn_1561f0(a: u64, b: u64): u64 // lib
declare function __udivti3(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __udivti3
declare function mul_mul(a: u64, b: u64): u64 // lib compiler_builtins::float::mul::mul
declare function fn_158350(a: u64, b: u64): u64 // lib
declare function fn_158408(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib
declare function __floatundidf(a: u64): u64 // lib __floatundidf
declare function __fixunsdfdi(a: u64): u64 // lib __fixunsdfdi
declare function __multi3_158e18(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib __multi3
declare function __multi3_158fe8(a: u64, b: u64, c: u64, d: u64): void // lib __multi3
declare function __multi3_159030(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __multi3
