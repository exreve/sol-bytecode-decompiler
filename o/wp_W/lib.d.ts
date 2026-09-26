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
interface Mint extends sized<0x60> { // Account<Mint> (anchor_spl, SPL Token Mint) as unpacked in memory (fields [known: spl_token::state layout] at the offsets a run of try_accounts_11e98 put them [offsets from exec]; info = the &AccountInfo)
	mint_authority:   at<0x04, Pubkey> // COption<Pubkey>
	supply:           at<0x28, u64>
	decimals:         at<0x30, u8>
	freeze_authority: at<0x38, Pubkey> // COption<Pubkey>
	info:             at<0x58, ref<AccountInfo>> // &AccountInfo
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
interface InitializePoolAccounts { // Accounts struct of instruction initialize_pool as accounts_initialize_pool returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	funder:        at<0xc8, ref<AccountInfo>>
	token_vault_a: at<0xd8, ref<AccountInfo>>
	token_vault_b: at<0xe0, ref<AccountInfo>>
}
interface InitializePoolContext { // anchor_lang Context of instruction initialize_pool (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<InitializePoolAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface InitializeTickArrayAccounts { // Accounts struct of instruction initialize_tick_array as accounts_initialize_tick_array returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	funder:     at<0x290, ref<AccountInfo>>
	tick_array: at<0x298, ref<AccountInfo>>
}
interface InitializeTickArrayContext { // anchor_lang Context of instruction initialize_tick_array (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<InitializeTickArrayAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface InitializeDynamicTickArrayAccounts { // Accounts struct of instruction initialize_dynamic_tick_array as accounts_initialize_dynamic_tick_array returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	whirlpool:  at<0x00, ref<AccountInfo>>
	funder:     at<0x290, ref<AccountInfo>>
	tick_array: at<0x298, ref<AccountInfo>>
}
interface InitializeDynamicTickArrayContext { // anchor_lang Context of instruction initialize_dynamic_tick_array (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<InitializeDynamicTickArrayAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface InitializeRewardAccounts { // Accounts struct of instruction initialize_reward as accounts_initialize_reward returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	reward_authority: at<0x00, ref<AccountInfo>>
	funder:           at<0x08, ref<AccountInfo>>
	reward_mint:      at<0x18, ref<Mint>> // Box<Account<Mint>>
	reward_vault:     at<0x20, ref<AccountInfo>>
}
interface InitializeRewardContext { // anchor_lang Context of instruction initialize_reward (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<InitializeRewardAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface OpenPositionAccounts { // Accounts struct of instruction open_position as accounts_open_position returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	funder: at<0x60, ref<AccountInfo>>
}
interface OpenPositionContext { // anchor_lang Context of instruction open_position (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<OpenPositionAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface OpenPositionWithMetadataAccounts { // Accounts struct of instruction open_position_with_metadata as accounts_open_position_with_metadata returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	funder: at<0x60, ref<AccountInfo>>
}
interface OpenPositionWithMetadataContext { // anchor_lang Context of instruction open_position_with_metadata (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<OpenPositionWithMetadataAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface UpdateFeesAndRewardsAccounts { // Accounts struct of instruction update_fees_and_rewards as accounts_update_fees_and_rewards returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	position: at<0x290, ref<AccountInfo>>
}
interface UpdateFeesAndRewardsContext { // anchor_lang Context of instruction update_fees_and_rewards (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<UpdateFeesAndRewardsAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface SwapAccounts { // Accounts struct of instruction swap as accounts_swap returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	token_program:         at<0x00, ref<AccountInfo>>
	token_authority:       at<0x08, ref<AccountInfo>>
	token_owner_account_a: at<0x18, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_vault_a:         at<0x20, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_owner_account_b: at<0x28, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_vault_b:         at<0x30, ref<TokenAccount>> // Box<Account<TokenAccount>>
}
interface SwapContext { // anchor_lang Context of instruction swap (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<SwapAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface TwoHopSwapAccounts { // Accounts struct of instruction two_hop_swap as accounts_two_hop_swap returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	token_program:             at<0x00, ref<AccountInfo>>
	token_authority:           at<0x08, ref<AccountInfo>>
	token_owner_account_one_a: at<0x20, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_vault_one_a:         at<0x28, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_owner_account_one_b: at<0x30, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_vault_one_b:         at<0x38, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_owner_account_two_a: at<0x40, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_vault_two_a:         at<0x48, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_owner_account_two_b: at<0x50, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_vault_two_b:         at<0x58, ref<TokenAccount>> // Box<Account<TokenAccount>>
}
interface TwoHopSwapContext { // anchor_lang Context of instruction two_hop_swap (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<TwoHopSwapAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface OpenBundledPositionAccounts { // Accounts struct of instruction open_bundled_position as accounts_open_bundled_position returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	position_bundle_token_account: at<0x10, ref<TokenAccount>> // Box<Account<TokenAccount>>
	position_bundle_authority:     at<0x18, ref<AccountInfo>>
	funder:                        at<0x28, ref<AccountInfo>>
}
interface OpenBundledPositionContext { // anchor_lang Context of instruction open_bundled_position (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<OpenBundledPositionAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface CloseBundledPositionAccounts { // Accounts struct of instruction close_bundled_position as accounts_close_bundled_position returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	position_bundle_token_account: at<0xe0, ref<TokenAccount>> // Box<Account<TokenAccount>>
	position_bundle_authority:     at<0xe8, ref<AccountInfo>>
	receiver:                      at<0xf0, ref<AccountInfo>>
}
interface CloseBundledPositionContext { // anchor_lang Context of instruction close_bundled_position (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<CloseBundledPositionAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface OpenPositionWithTokenExtensionsAccounts { // Accounts struct of instruction open_position_with_token_extensions as accounts_open_position_with_token_extensions returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	funder:        at<0x00, ref<AccountInfo>>
	position_mint: at<0x18, ref<AccountInfo>>
}
interface OpenPositionWithTokenExtensionsContext { // anchor_lang Context of instruction open_position_with_token_extensions (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<OpenPositionWithTokenExtensionsAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface ClosePositionWithTokenExtensionsAccounts { // Accounts struct of instruction close_position_with_token_extensions as accounts_close_position_with_token_extensions returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	position_mint:          at<0x00, Mint> // Account<Mint> in place
	position_token_account: at<0x80, TokenAccount_2> // Account<TokenAccount> in place
	position_authority:     at<0x158, ref<AccountInfo>>
}
interface ClosePositionWithTokenExtensionsContext { // anchor_lang Context of instruction close_position_with_token_extensions (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<ClosePositionWithTokenExtensionsAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface LockPositionAccounts { // Accounts struct of instruction lock_position as accounts_lock_position returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	position_mint:          at<0x00, Mint> // Account<Mint> in place
	position_token_account: at<0x80, TokenAccount_2> // Account<TokenAccount> in place
	funder:                 at<0x158, ref<AccountInfo>>
	position_authority:     at<0x160, ref<AccountInfo>>
	whirlpool:              at<0x248, ref<AccountInfo>>
}
interface LockPositionContext { // anchor_lang Context of instruction lock_position (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<LockPositionAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
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
interface TransferLockedPositionAccounts { // Accounts struct of instruction transfer_locked_position as accounts_transfer_locked_position returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	position_mint:             at<0x00, Mint> // Account<Mint> in place
	position_token_account:    at<0x80, TokenAccount_2> // Account<TokenAccount> in place
	destination_token_account: at<0x158, TokenAccount_2> // Account<TokenAccount> in place
	position_authority:        at<0x230, ref<AccountInfo>>
}
interface TransferLockedPositionContext { // anchor_lang Context of instruction transfer_locked_position (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<TransferLockedPositionAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface InitializePoolWithAdaptiveFeeAccounts { // Accounts struct of instruction initialize_pool_with_adaptive_fee as accounts_initialize_pool_with_adaptive_fee returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	token_mint_a:              at<0x08, ref<Mint>> // Box<Account<Mint>>
	token_mint_b:              at<0x10, ref<Mint>> // Box<Account<Mint>>
	funder:                    at<0x28, ref<AccountInfo>>
	initialize_pool_authority: at<0x30, ref<AccountInfo>>
	token_vault_a:             at<0x48, ref<AccountInfo>>
	token_vault_b:             at<0x50, ref<AccountInfo>>
}
interface InitializePoolWithAdaptiveFeeContext { // anchor_lang Context of instruction initialize_pool_with_adaptive_fee (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<InitializePoolWithAdaptiveFeeAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface SetAdaptiveFeeConstantsAccounts { // Accounts struct of instruction set_adaptive_fee_constants as accounts_set_adaptive_fee_constants returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	whirlpool:         at<0x00, ref<AccountInfo>>
	whirlpools_config: at<0x290, ref<AccountInfo>>
	fee_authority:     at<0x308, ref<AccountInfo>>
}
interface SetAdaptiveFeeConstantsContext { // anchor_lang Context of instruction set_adaptive_fee_constants (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<SetAdaptiveFeeConstantsAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface CollectFeesV2Accounts { // Accounts struct of instruction collect_fees_v2 as accounts_collect_fees_v2 returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	token_mint_a:           at<0x00, Mint> // Account<Mint> in place
	token_mint_b:           at<0x80, Mint> // Account<Mint> in place
	position_authority:     at<0x108, ref<AccountInfo>>
	position_token_account: at<0x118, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	token_owner_account_a:  at<0x120, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	token_vault_a:          at<0x128, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	token_owner_account_b:  at<0x130, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	token_vault_b:          at<0x138, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
}
interface CollectFeesV2Context { // anchor_lang Context of instruction collect_fees_v2 (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<CollectFeesV2Accounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface CollectProtocolFeesV2Accounts { // Accounts struct of instruction collect_protocol_fees_v2 as accounts_collect_protocol_fees_v2 returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	token_mint_a:                    at<0x00, Mint> // Account<Mint> in place
	token_mint_b:                    at<0x80, Mint> // Account<Mint> in place
	token_vault_a:                   at<0x100, TokenAccount_2> // Account<TokenAccount> in place
	token_vault_b:                   at<0x1d8, TokenAccount_2> // Account<TokenAccount> in place
	token_destination_a:             at<0x2b0, TokenAccount_2> // Account<TokenAccount> in place
	token_destination_b:             at<0x388, TokenAccount_2> // Account<TokenAccount> in place
	collect_protocol_fees_authority: at<0x470, ref<AccountInfo>>
}
interface CollectProtocolFeesV2Context { // anchor_lang Context of instruction collect_protocol_fees_v2 (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<CollectProtocolFeesV2Accounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface CollectRewardV2Accounts { // Accounts struct of instruction collect_reward_v2 as accounts_collect_reward_v2 returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	position_authority:     at<0x08, ref<AccountInfo>>
	position_token_account: at<0x18, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	reward_owner_account:   at<0x20, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	reward_mint:            at<0x28, ref<Mint>> // Box<Account<Mint>>
	reward_vault:           at<0x30, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
}
interface CollectRewardV2Context { // anchor_lang Context of instruction collect_reward_v2 (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<CollectRewardV2Accounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface InitializePoolV2Accounts { // Accounts struct of instruction initialize_pool_v2 as accounts_initialize_pool_v2 returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	token_badge_a: at<0x108, ref<AccountInfo>>
	funder:        at<0x118, ref<AccountInfo>>
	token_vault_a: at<0x128, ref<AccountInfo>>
	token_vault_b: at<0x130, ref<AccountInfo>>
}
interface InitializePoolV2Context { // anchor_lang Context of instruction initialize_pool_v2 (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<InitializePoolV2Accounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface InitializeRewardV2Accounts { // Accounts struct of instruction initialize_reward_v2 as accounts_initialize_reward_v2 returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	reward_authority: at<0x00, ref<AccountInfo>>
	funder:           at<0x08, ref<AccountInfo>>
	reward_mint:      at<0x18, ref<Mint>> // Box<Account<Mint>>
	reward_vault:     at<0x28, ref<AccountInfo>>
}
interface InitializeRewardV2Context { // anchor_lang Context of instruction initialize_reward_v2 (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<InitializeRewardV2Accounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
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
interface TwoHopSwapV2Accounts { // Accounts struct of instruction two_hop_swap_v2 as accounts_two_hop_swap_v2 returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	token_mint_input:             at<0x00, Mint> // Account<Mint> in place
	token_mint_intermediate:      at<0x80, Mint> // Account<Mint> in place
	token_mint_output:            at<0x100, Mint> // Account<Mint> in place
	token_owner_account_input:    at<0x1a8, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	token_vault_one_input:        at<0x1b0, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	token_vault_one_intermediate: at<0x1b8, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	token_vault_two_intermediate: at<0x1c0, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	token_vault_two_output:       at<0x1c8, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	token_owner_account_output:   at<0x1d0, ref<TokenAccount_2>> // Box<Account<TokenAccount>>
	token_authority:              at<0x1d8, ref<AccountInfo>>
}
interface TwoHopSwapV2Context { // anchor_lang Context of instruction two_hop_swap_v2 (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<TwoHopSwapV2Accounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}

// syscalls
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_log_pubkey(pubkey: u64): void // log base58 pubkey (32 bytes)
declare function sol_log_data(slices: u64, len: u64): void // log base64 data: slices = &[&[u8]]
declare function sol_invoke_signed_c(ix: u64, accountInfos: u64, accountInfosLen: u64, signerSeeds: u64, signerSeedsLen: u64): u64 // CPI (C ABI structs)
declare function sol_invoke_signed_rust(ix: u64, accountInfos: u64, accountInfosLen: u64, signerSeeds: u64, signerSeedsLen: u64): u64 // CPI (Rust ABI: &Instruction, &[AccountInfo], &[&[&[u8]]])
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function sol_memmove(dst: u64, src: u64, n: u64): void // memmove
declare function sol_memset(dst: u64, byte: u64, n: u64): void // memset

// library functions (recognized in many programs; not decompiled)
declare function try_accounts_120(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function fn_460(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from
declare function try_accounts_558(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::interface_account::InterfaceAccount<T> as anchor_lang::Accounts<B>…
declare function try_accounts_610(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_6c8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a Display implementation returned an err…"
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function fn_2518(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses try_accounts_610, alloc_handle_alloc_error, memcpy
declare function Account_try_from(a: u64, b: u64): void // lib anchor_lang::accounts::account::Account<T>::try_from
declare function Account_try_from_unchecked(a: u64, b: u64): void // lib anchor_lang::accounts::account::Account<T>::try_from_unchecked
declare function fn_78d0(a: u64, b: u64, c: u64, d: u64): u64 // lib uses memcmp, common_is_closed, callx, anchor_error_from
declare function fn_b580(a: u64): u64 // lib uses alloc_handle_alloc_error, Error__new
declare function num_fmt_bae8(a: u64, b: u64): u64 // lib core::fmt::num::<impl core::fmt::Debug for usize>::fmt
declare function fn_bd18(a: u64, r0: u64): u64 // lib
declare function ptr_drop_in_place_bf20(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 2]>
declare function ptr_drop_in_place_c028(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 3]>
declare function ptr_drop_in_place_c1b0(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 4]>
declare function fn_c3b8(a: u64): void // lib
declare function fn_c640(a: u64, r0: u64): u64 // lib
declare function fn_c710(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_d560(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib "assertion failed: mid <= self.len()/home…"
declare function fn_d5d0(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib "assertion failed: k <= self.len()/home/r…"
declare function fn_da98(a: u64, b: u64, c: u64, r0: u64): u64 // lib uses memcpy, memmove
declare function fn_e248(a: u64, b: u64, r0: u64): void // lib uses memmove, memcpy
declare function fn_e368(a: u64, b: u64): u64 // lib uses alloc_handle_alloc_error
declare function fn_e478(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function fn_e968(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): void // lib uses raw_vec_handle_error
declare function fn_ead8(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): void // lib uses raw_vec_handle_error
declare function fn_f060(a: u64, b: u64, r0: u64): void // lib uses raw_vec_handle_error
declare function RawVec_grow_one_f330(a: u64, b: u64, r0: u64): u64 // lib alloc::raw_vec::RawVec<T,A>::grow_one
declare function fn_f658(a: u64, b: u64): u64 // lib
declare function fn_fa00(a: u64, b: u64): u64 // lib
declare function fn_fe08(a: u64, b: u64): void // lib
declare function AccountInfo_clone(a: u64, b: u64): void // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11990(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11a48(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11b00(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11bb8(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11d28(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11de0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11e98(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11f50(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_12008(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_120c0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_12178(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from
declare function try_accounts_12230(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_122e8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp
declare function fn_12510(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from, memcmp
declare function fn_129a0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from, memcmp
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function log_10c220(a: u64): void // lib "Instruction: IdlCreateBufferInstruction:…"
declare function log_10c800(a: u64, b: u64): void // lib "Instruction: IdlSetAuthorityInstruction:…"
declare function fn_11b560(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "accountsol_destinationbufferidlprogramto…", "authoritynew_fee_authoritynew_reward_aut…"
declare function fn_11bf68(a: u64, b: u64): u64 // lib "accountsol_destinationbufferidlprogramto…"
declare function fn_11c228(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "bufferidlprogramtoIdlAccountsrc/state.rs…", "bufferidlprogramtoIdlAccountsrc/state.rs…"
declare function fn_11d508(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "authoritynew_fee_authoritynew_reward_aut…", "idlprogramtoIdlAccountsrc/state.rssrc/sl…"
declare function fn_11db60(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "idlprogramtoIdlAccountsrc/state.rssrc/sl…", "authoritynew_fee_authoritynew_reward_aut…"
declare function fn_11e088(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "fromkind", "toIdlAccountsrc/state.rssrc/slice.rssrc/…"
declare function fn_11f118(a: u64, b: u64, c: u64): u64 // lib uses memcpy, anchor_error_from
declare function fn_11f7a0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, callx
declare function ptr_drop_in_place_121690(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<alloc::vec::Vec<solana_account_info::AccountInfo>>
declare function fn_121930(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses raw_vec_handle_error
declare function fn_121aa0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses raw_vec_handle_error
declare function fn_121c08(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses raw_vec_handle_error
declare function fn_121d50(a: u64, b: u64): void // lib uses raw_vec_handle_error
declare function fn_121eb0(a: u64, b: u64): void // lib uses raw_vec_handle_error
declare function fn_122018(a: u64, b: u64): void // lib uses raw_vec_handle_error
declare function fn_124030(a: u64, b: u64, c: u64, d: u64): void // lib uses __rust_alloc, __rust_realloc
declare function fn_124ce8(a: u64, b: u64, c: u64, d: u64): void // lib uses __rust_alloc, __rust_realloc
declare function ptr_drop_in_place_125960(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 3]>
declare function ptr_drop_in_place_126088(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<alloc::vec::Vec<solana_account_info::AccountInfo>>
declare function fn_126340(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses raw_vec_handle_error
declare function fn_1264b0(a: u64, b: u64): void // lib uses raw_vec_handle_error
declare function associated_token_create(a: u64, b: u64): u64 // lib anchor_spl::associated_token::create
declare function fn_127828(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcpy, ptr_drop_in_place_126088
declare function fn_12adb8(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses raw_vec_handle_error
declare function fn_12af00(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses raw_vec_handle_error
declare function fn_12b068(a: u64, b: u64): void // lib uses raw_vec_handle_error
declare function CollectionDetails_serialize(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <mpl_token_metadata::generated::types::collection_details::CollectionDetails as borsh::ser…
declare function DataV2_serialize(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <mpl_token_metadata::generated::types::data_v2::DataV2 as borsh::ser::BorshSerialize>::ser…
declare function Uses_serialize(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <mpl_token_metadata::generated::types::uses::Uses as borsh::ser::BorshSerialize>::serializ…
declare function fn_12ce08(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses __rust_realloc, __rust_alloc
declare function fn_12cf58(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib uses raw_vec_handle_error
declare function fn_12d0a0(a: u64, b: u64, r0: u64): void // lib uses raw_vec_handle_error
declare function RawVec_grow_one_12d200(a: u64, b: u64, r0: u64): u64 // lib alloc::raw_vec::RawVec<T,A>::grow_one
declare function fn_12e0b0(a: u64, b: u64): u64 // lib
declare function fn_12e170(a: u64): u64 // lib
declare function fn_12e558(a: u64, b: u64, c: u64, r0: u64): u64 // lib
declare function fn_132f68(a: u64, b: u64, c: u64): void // lib uses memcmp, __rust_alloc, alloc_handle_alloc_error
declare function Mint_unpack_from_slice_133108(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <spl_token::state::Mint as solana_program_pack::Pack>::unpack_from_slice
declare function Account_unpack_from_slice_1333d0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <spl_token::state::Account as solana_program_pack::Pack>::unpack_from_slice
declare function rent_check_id_133890(a: u64): u64 // lib solana_sdk_ids::sysvar::rent::check_id
declare function fn_133a38(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses raw_vec_handle_error
declare function fn_133b80(a: u64, b: u64): void // lib uses raw_vec_handle_error
declare function Mint_unpack_from_slice_136290(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <spl_token::state::Mint as solana_program_pack::Pack>::unpack_from_slice
declare function rent_check_id_136a18(a: u64): u64 // lib solana_sdk_ids::sysvar::rent::check_id
declare function fn_136dd0(a: u64, r0: u64): void // lib
declare function fn_1370d8(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses raw_vec_handle_error
declare function fn_138ab8(a: u64, b: u64): u64 // lib uses memcmp
declare function fn_138b88(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses Pubkey_find_program_address, __rust_alloc, alloc_handle_alloc_error
declare function fn_1390d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcmp, AccountInfo_try_borrow_lamports, AccountInfo_try_borrow_data
declare function clock_get_139448(a: u64): u64 // lib uses sol_get_clock_sysvar
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function fn_13ac38(a: u64, b: u64): void // lib uses __rust_alloc, alloc_handle_alloc_error, abort
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b3a8(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error, memcpy
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b4d0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function Error_log(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib anchor_lang::error::Error::log
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function error_from_13c648(a: u64, b: u64, c: u64, r0: u64): u64 // lib anchor_lang::error::<impl core::convert::From<anchor_lang::error::Error> for solana_progra…
declare function fn_13c8b8(a: u64, b: u64, c: u64): u64 // lib uses memcpy, __rust_alloc, alloc_handle_alloc_error, ptr_drop_in_place_139960
declare function fn_13cc48(a: u64, b: u64, c: u64): u64 // lib uses memcpy, __rust_alloc, alloc_handle_alloc_error, ptr_drop_in_place_139960
declare function fn_13cfd8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcpy, __rust_alloc, alloc_handle_alloc_error, ptr_drop_in_place_1397a0, …
declare function fn_13d318(a: u64, b: u64, c: u64): u64 // lib uses memcpy, __rust_alloc, alloc_handle_alloc_error, ptr_drop_in_place_1397a0, …
declare function ErrorCode_name(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib anchor_lang::error::ErrorCode::name
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function ErrorCode_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::error::ErrorCode as core::fmt::Display>::fmt
declare function clock_get_13f308(a: u64): u64 // lib solana_sysvar::clock::<impl solana_sysvar::Sysvar for solana_clock::Clock>::get
declare function rent_get(a: u64): u64 // lib solana_sysvar::rent::<impl solana_sysvar::Sysvar for solana_rent::Rent>::get
declare function fn_13f890(a: u64): void // lib uses memset, sol_get_return_data, __rust_alloc, raw_vec_handle_error, …
declare function fn_13fba0(a: u64, b: u64): void // lib uses raw_vec_handle_error
declare function fn_1423c0(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib uses raw_vec_handle_error
declare function fn_142800(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_142e70(a: u64, b: u64, c: u64, d: u64): void // lib uses __rust_alloc, alloc_handle_alloc_error
declare function AccountInfo_try_data_len(a: u64, b: u64): void // lib solana_account_info::AccountInfo::try_data_len
declare function AccountInfo_try_borrow_lamports(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_lamports
declare function fn_143340(a: u64, b: u64, r0: u64): u64 // lib
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function AccountInfo_assign(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::assign
declare function fn_143da0(a: u64, r0: u64): u64 // lib
declare function fn_144198(a: u64, b: u64, r0: u64): u64 // lib uses __rust_alloc, raw_vec_handle_error
declare function fn_144640(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses callx
declare function rent_check_id_144790(a: u64): u64 // lib solana_sdk_ids::sysvar::rent::check_id
declare function error_from_1447e8(a: u64): u64 // lib bincode::error::<impl core::convert::From<std::io::error::Error> for alloc::boxed::Box<bin…
declare function fn_144ae8(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib "ProgramDerivedAddressUnable to find a vi…"
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function fn_1459d0(a: u64): u64 // lib uses repr_bitpacked_kind_from_prim_145358, callx
declare function fn_145c70(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib
declare function Error__new(a: u64, b: u64, c: u64): u64 // lib std::io::error::Error::_new
declare function fn_146a58(a: u64, b: u64): u64 // lib "error (os error )ConnectionRefusedConnec…", "Customerror (os error )ConnectionRefused…"
declare function __rg_oom(): never // lib __rg_oom
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fn_1480b8(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses RawVec_grow_one_147b38, memcpy
declare function Range_fmt(a: u64, b: u64): u64 // lib <core::ops::range::Range<Idx> as core::fmt::Debug>::fmt
declare function BorrowError_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <core::cell::BorrowError as core::fmt::Debug>::fmt
declare function BorrowMutError_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <core::cell::BorrowMutError as core::fmt::Debug>::fmt
declare function fn_149140(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "panicked at ", ":called `Option::unwrap()` on a `None` v…"
declare function fn_14a698(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses callx
declare function Formatter_write_str(a: u64, b: u64, c: u64): u64 // lib core::fmt::Formatter::write_str
declare function fn_14bb30(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses callx
declare function str_fmt(a: u64, b: u64, c: u64): u64 // lib <str as core::fmt::Display>::fmt
declare function fn_14c2b0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses callx
declare function fn_14c760(a: u64, b: u64, c: u64, r7: u64): void // lib
declare function fn_14e4d8(a: u64, b: u64): u64 // lib "0x00010203040506070809101112131415161718…"
declare function fn_14e7a8(a: u64, b: u64): u64 // lib "0x00010203040506070809101112131415161718…"
declare function fn_14ecd0(a: u64, b: u64, c: u64): u64 // lib "0001020304050607080910111213141516171819…", "0001020304050607080910111213141516171819…"
declare function imp_fmt(a: u64, b: u64): u64 // lib core::fmt::num::imp::<impl core::fmt::Display for i32>::fmt
declare function T_fmt_14f088(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <&T as core::fmt::Debug>::fmt
declare function T_fmt_14f0b8(a: u64, b: u64): u64 // lib <&T as core::fmt::Display>::fmt
declare function fn_14f3e8(a: u64): u64 // lib
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function __floatundidf(a: u64): u64 // lib __floatundidf
declare function __lshrti3(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib __lshrti3
declare function fn_14f808(a: u64, b: u64): u64 // lib uses __multi3
declare function __udivti3(a: u64, b: u64, c: u64, d: u64, e: u64, r8: u64): u64 // lib __udivti3
declare function __multi3(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __multi3 [heur] u128 multiply: *out = a * b (mod 2^128), a = (a_lo, a_hi), b = (b_lo, b_hi) [exec: on 31 operand pairs]
declare function fn_151a40(a: u64, b: u64): u64 // lib
declare function fn_151b50(a: u64, b: u64): u64 // lib
declare function fn_151bf8(a: u64, b: u64): u64 // lib
declare function fn_151cb0(a: u64, b: u64): u64 // lib
declare function __ashlti3(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib __ashlti3
