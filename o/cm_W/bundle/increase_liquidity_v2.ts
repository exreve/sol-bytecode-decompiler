// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction increase_liquidity_v2: handler + 51 reachable functions
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
interface IncreaseLiquidityV2Args { // arguments of instruction increase_liquidity_v2 (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	liquidity:    at<0x00, u128>
	amount_0_max: at<0x10, u64>
	amount_1_max: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_log_data(slices: u64, len: u64): void // log base64 data: slices = &[&[u8]]
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function fn_11e0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function fn_13d0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function try_accounts_1678(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::interface_account::InterfaceAccount<T> as anchor_lang::Accounts<B>…
declare function fn_1730(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_7498(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses try_accounts_1678, alloc_handle_alloc_error, memcpy
declare function fn_7768(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses try_accounts_15c0, alloc_handle_alloc_error, memcpy
declare function fn_a1d8(a: u64, b: u64, c: u64, d: u64): u64 // lib uses memcmp, common_is_closed
declare function fn_e948(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib uses Mint_unpack_from_slice_137968, raw_vec_handle_error, memset2, memcmp
declare function fn_f128(a: u64): u64 // lib uses alloc_handle_alloc_error, Error__new
declare function AccountInfo_clone_f338(a: u64, b: u64): u64 // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function fn_fc80(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_ff88(a: u64, r0: u64): u64 // lib uses Rc_drop_slow_14df0
declare function Rc_drop_slow_14df0(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function fn_16008(a: u64, b: u64): u64 // lib
declare function try_accounts_17a30(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_18368(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_18cf0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp, Error_with_pubkeys
declare function try_accounts_19190(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
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
declare function imp__fmt_154cb0(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u8>::_fmt
declare function imp_fmt(a: u64, b: u64): u64 // lib core::fmt::num::imp::<impl core::fmt::Display for i32>::fmt
declare function imp__fmt_155760(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u64>::_fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function fn_1561f0(a: u64, b: u64): u64 // lib
declare function __multi3_159030(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __multi3

// instruction handler: increase_liquidity_v2 (discriminator sha256("global:increase_liquidity_v2")[..8] = 0xab0ee45df591d85)
// accounts [idl]: 0 nft_owner [signer], 1 nft_account, 2 pool_state [mut], 3 protocol_position, 4 personal_position [mut], 5 tick_array_lower [mut], 6 tick_array_upper [mut], 7 token_account_0 [mut], 8 token_account_1 [mut], 9 token_vault_0 [mut], 10 token_vault_1 [mut], 11 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 12 token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb], 13 vault_0_mint, 14 vault_1_mint
// args [idl]: liquidity: u128, amount_0_max: u64, amount_1_max: u64, base_flag: Option<bool>
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, amount_0_max, amount_1_max
function ix_increase_liquidity_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s60 = fp - 0x60, s68 = fp - 0x68, s78 = fp - 0x78, sd8 = fp - 0xd8, sf0 = fp - 0xf0, s100 = fp - 0x100, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s1000 = fp - 0x1000
	let j, m, n, o, p, q: u64
	B6: {
		const i = sol_log("Instruction: IncreaseLiquidityV2", 0x20)
		const f = ix_args_len
		if (f >= 0x10 && ((f & -8) != 0x10 && (f & -8) != 0x18)) {
			const args: IncreaseLiquidityV2Args = ix_args
			const t = ld64(args.liquidity + 8)
			const y = ld64(args.liquidity)
			const amount_0_max = args.amount_0_max
			const amount_1_max = args.amount_1_max
			st64(sf0, args + 0x20, f - 0x20)
			const r = fn_17748(s78, sf0, amount_1_max, undef, undef, i)
			if (ld8(s78) != 0) {
				j = ld64(s78 + 8)
				break B6
			}
			const w = ld8(s78 + 1)
			st64(s100, accounts, accounts_len)
			q = accounts_increase_liquidity_v2(s78, undef, s100, n, fp, r)
			const s = ld64(s78)
			if (s == 0) {
				p = ld64(s78 + 8)
				st64(a + 8, ld64(s68))
				st64(a, p)
				return q
			}
			const v = ld64(s78 + 8)
			const u = ld64(s68)
			memcpy(sd8, s60, 0x60)
			st64(sf0, s, v, u)
			copyr(s68, s100, 0x10)
			st64(s78, program_id, sf0)
			st64(s1000, amount_0_max, amount_1_max, w)
			q = fn_11df50(s110, s78, y, t, amount_0_max, amount_1_max, w)
			p = ld64(s110)
			if (p == 2) {
				q = fn_ae830(s120, sf0, program_id)
				p = ld64(s120)
				st64(a + 8, ld64(s120 + 8))
				st64(a, p)
				return q
			}
			st64(a + 8, ld64(s110 + 8))
			st64(a, p)
			return q
		}
		j = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	}
	const k = j
	if (2 > (j & 3) - 2) {
		q = anchor_error_from(s130, 0x66 /* anchor::InstructionDidNotDeserialize */, m, n, o)
		p = ld64(s130)
		st64(a + 8, ld64(s130 + 8))
		st64(a, p)
		return q
	}
	if ((k & 3) == 0) {
		q = anchor_error_from(s130, 0x66 /* anchor::InstructionDidNotDeserialize */, m, n, o)
		p = ld64(s130)
		st64(a + 8, ld64(s130 + 8))
		st64(a, p)
		return q
	}
	const l = ld64(ld64(j + 7))
	if (l == 0) {
		q = anchor_error_from(s130, 0x66 /* anchor::InstructionDidNotDeserialize */, m, n, o)
		p = ld64(s130)
		st64(a + 8, ld64(s130 + 8))
		st64(a, p)
		return q
	}
	callx(l, ld64(j - 1), l)
	q = anchor_error_from(s130, 0x66 /* anchor::InstructionDidNotDeserialize */)
	p = ld64(s130)
	st64(a + 8, ld64(s130 + 8))
	st64(a, p)
	return q
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

// Anchor Accounts::try_accounts of instruction increase_liquidity_v2 (called by ix_increase_liquidity_v2; name [str]: from the handler's "Instruction: …" log; was fn_ac250)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: tick_array_lower (ConstraintMut, ConstraintRaw), tick_array_upper (ConstraintMut, ConstraintRaw), token_account_0 (ConstraintMut), token_account_1 (ConstraintMut), token_vault_0 (ConstraintMut, ConstraintRaw), token_vault_1 (ConstraintMut, ConstraintRaw), token_program, token_program_2022, vault_0_mint (ConstraintAddress), vault_1_mint (ConstraintAddress), nft_account (ConstraintRaw), personal_position (ConstraintMut, ConstraintRaw), pool_state (ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: vault_0_mint_box, vault_1_mint_box, token_vault_0_box, token_vault_1_box, token_vault_0_box_2, token_vault_1_box_2, pool_state [idl], token_vault_0, token_vault_1
function accounts_increase_liquidity_v2(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s120 = fp - 0x120, s140 = fp - 0x140, s160 = fp - 0x160, s180 = fp - 0x180, s1a0 = fp - 0x1a0, s1b8 = fp - 0x1b8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s500 = fp - 0x500, s508 = fp - 0x508, s510 = fp - 0x510, s518 = fp - 0x518, s520 = fp - 0x520, s528 = fp - 0x528, s530 = fp - 0x530, s538 = fp - 0x538, s540 = fp - 0x540, s548 = fp - 0x548, s550 = fp - 0x550, s558 = fp - 0x558, s560 = fp - 0x560
	let s, t, u, z, ae, af, ah, ai, ak, al, an, ao, aq, ar, au, av, ax, ay, ba, bb, bd, be, bh: u64
	let vault_0_mint_box: Mint
	let q = try_accounts_17a30(s120, c, c, d, e, r0)
	const i = ld64(s120 + 8)
	let f = ld64(s120)
	if (f == 2) {
		q = try_accounts_1678(s120, c)
		if (ld32(s120 + 0xb0) == 2) {
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
			fn_11e0(s120, c)
			q = ld64(s120 + 8)
			f = ld64(s120)
			if (f == 2) {
				st64(s500, q)
				const r = ld64(c + 8)
				if (r == 0) {
					anchor_error_from(s1e8, 0xbbd /* anchor::AccountNotEnoughKeys */, s, t, u)
					q = ld64(s1e8 + 8)
					f = ld64(s1e8)
					if (f != 2) {
						const y = ld64(0x300000000 /* heap bump-allocator cursor */)
						z = 0x11 > y
						const aa = z != 0 ? 0 : y - 0x11
						const ab = y != 0 ? aa : 0x300007fef
						if ((f & 1) != 0) {
							if (0x300000008 > ab) {
								raw_vec_handle_error(1, 0x11, 0x10015f8f8, aa, z)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, ab)
							st64(ab + 8, 0x6f697469736f705f)
							st64(ab, 0x6c6f636f746f7270)
							st8(ab + 0x10, 0x6e)
							void ld64(q)
						} else {
							if (0x300000008 > ab) {
								raw_vec_handle_error(1, 0x11, 0x10015f8f8, aa, z)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, ab)
							st64(ab + 8, 0x6f697469736f705f)
							st64(ab, 0x6c6f636f746f7270)
							st8(ab + 0x10, 0x6e)
							void ld64(q)
						}
						st64(q + 0x10, ab, 0x11)
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
				st64(s508, q)
				q = try_accounts_18368(s120, c, s, t, u)
				z = undef
				if (ld64(s120) == 0) {
					const ac = ld64(0x300000000 /* heap bump-allocator cursor */)
					f = ld64(s120 + 8)
					const ad = ac != 0 ? sat_sub(ac, 0x11) : 0x300007fef
					vault_0_mint_box = ld64(s120 + 0x10)
					if (f != 0) {
						if (0x300000008 > ad) {
							raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, z)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ad)
						st64(ad + 8, 0x6f697469736f705f)
						st64(ad, 0x6c616e6f73726570)
						st8(ad + 0x10, 0x6e)
						void ld64(vault_0_mint_box)
					} else {
						if (0x300000008 > ad) {
							raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, z)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ad)
						st64(ad + 8, 0x6f697469736f705f)
						st64(ad, 0x6c616e6f73726570)
						st8(ad + 0x10, 0x6e)
						void ld64(vault_0_mint_box)
					}
					st64(vault_0_mint_box.mint_authority + 0xc, ad, 0x11)
					st64(vault_0_mint_box.mint_authority + 4, 0x11)
					st64(vault_0_mint_box, 1)
					st64(a + 0x10, vault_0_mint_box)
					st64(a + 8, f)
					st64(a, 0)
					return q
				}
				const v = ld64(0x300000000 /* heap bump-allocator cursor */)
				const w = v != 0 ? sat_sub(v, 0x120) : 0x300007ee0
				if (0x300000008 > w) {
					alloc_handle_alloc_error(8, 0x120)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, w & -8)
				if ((w & -8) != 0) {
					st64(s510, w & -8)
					memcpy(w & -8, s120, 0x120)
					fn_13d0(s120, c)
					vault_0_mint_box = ld64(s120 + 8)
					const x = ld64(s120)
					if (x != 2) {
						q = fn_4130(s1f8, x, vault_0_mint_box, "tick_array_lower", 0x10)
						vault_0_mint_box = ld64(s1f8 + 8)
						f = ld64(s1f8)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s518, vault_0_mint_box)
					fn_13d0(s120, c, vault_0_mint_box, ae, af)
					vault_0_mint_box = ld64(s120 + 8)
					const ag = ld64(s120)
					if (ag != 2) {
						q = fn_4130(s208, ag, vault_0_mint_box, "tick_array_upper", 0x10)
						vault_0_mint_box = ld64(s208 + 8)
						f = ld64(s208)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s520, vault_0_mint_box)
					fn_7498(s120, c, vault_0_mint_box, ah, ai)
					vault_0_mint_box = ld64(s120 + 8)
					const aj = ld64(s120)
					if (aj != 2) {
						q = fn_4130(s218, aj, vault_0_mint_box, "token_account_0", 0xf)
						vault_0_mint_box = ld64(s218 + 8)
						f = ld64(s218)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s528, vault_0_mint_box)
					fn_7498(s120, c, vault_0_mint_box, ak, al)
					vault_0_mint_box = ld64(s120 + 8)
					const am = ld64(s120)
					if (am != 2) {
						q = fn_4130(s228, am, vault_0_mint_box, "token_account_1", 0xf)
						vault_0_mint_box = ld64(s228 + 8)
						f = ld64(s228)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s530, vault_0_mint_box)
					fn_7498(s120, c, vault_0_mint_box, an, ao)
					vault_0_mint_box = ld64(s120 + 8)
					const ap = ld64(s120)
					if (ap != 2) {
						q = fn_4130(s238, ap, vault_0_mint_box, "token_vault_0", 0xd)
						vault_0_mint_box = ld64(s238 + 8)
						f = ld64(s238)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s538, vault_0_mint_box)
					fn_7498(s120, c, vault_0_mint_box, aq, ar)
					vault_0_mint_box = ld64(s120 + 8)
					const at = ld64(s120)
					if (at != 2) {
						q = fn_4130(s248, at, vault_0_mint_box, "token_vault_1", 0xd)
						vault_0_mint_box = ld64(s248 + 8)
						f = ld64(s248)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s540, vault_0_mint_box)
					try_accounts_19190(s120, c, vault_0_mint_box, au, av)
					vault_0_mint_box = ld64(s120 + 8)
					const aw = ld64(s120)
					if (aw != 2) {
						q = fn_4130(s258, aw, vault_0_mint_box, 0x10015b020 /* "token_program" */, 0xd)
						vault_0_mint_box = ld64(s258 + 8)
						f = ld64(s258)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s548, vault_0_mint_box)
					fn_18cf0(s120, c, vault_0_mint_box, ax, ay)
					vault_0_mint_box = ld64(s120 + 8)
					const az = ld64(s120)
					if (az != 2) {
						q = fn_4130(s268, az, vault_0_mint_box, "token_program_2022", 0x12)
						vault_0_mint_box = ld64(s268 + 8)
						f = ld64(s268)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s550, vault_0_mint_box)
					fn_7768(s120, c, vault_0_mint_box, ba, bb)
					vault_0_mint_box = ld64(s120 + 8)
					const bc = ld64(s120)
					if (bc != 2) {
						q = fn_4130(s278, bc, vault_0_mint_box, "vault_0_mint", 0xc)
						vault_0_mint_box = ld64(s278 + 8)
						f = ld64(s278)
						if (f != 2) {
							st64(a + 0x10, vault_0_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					}
					st64(s558, vault_0_mint_box)
					fn_7768(s120, c, vault_0_mint_box, bd, be)
					let vault_1_mint_box: Mint = ld64(s120 + 8)
					const bf = ld64(s120)
					if (bf != 2) {
						q = fn_4130(s288, bf, vault_1_mint_box, "vault_1_mint", 0xc)
						vault_1_mint_box = ld64(s288 + 8)
						f = ld64(s288)
						bh = ld64(s510)
						if (f != 2) {
							st64(a + 0x10, vault_1_mint_box)
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
					} else {
						bh = ld64(s510)
					}
					if ((memcmp((k & -8) + 0x28, bh + 8, 0x20) as u32) == 0) {
						if (ld64((k & -8) + 0x68) != 1) {
							anchor_error_from(s2b8, 0x7d3 /* anchor::ConstraintRaw */)
							q = fn_4130(s2c8, ld64(s2b8), ld64(s2b8 + 8), 0x10015b0ae /* "nft_account" */, 0xb)
							f = ld64(s2c8)
							st64(a + 0x10, ld64(s2c8 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
						const bi = ld64(i)
						copyr(s120, bi, 0x20)
						if ((memcmp((k & -8) + 0x48, s120, 0x20) as u32) == 0) {
							const pool_state: AccountInfo = ld64(s500)
							if (pool_state.is_writable != 0) {
								const bk = ld64(s510)
								if (ld8(ld64(bk) + 0x29) != 0) {
									const bl = pool_state.key
									copyr(s1d8, bl, 0x20)
									const bm = memcmp(bk + 0x28, s1d8, 0x20)
									if ((bm as u32) == 0) {
										if (ld8(ld64(s518) + 0x29) != 0) {
											q = fn_4bd8(s120, ld64(s518), bm as u32)
											st64(s560, ld64(s120 + 0x10))
											f = ld64(s120 + 8)
											if (ld64(s120) != 0) {
												st64(a + 0x10, ld64(s560))
												st64(a + 8, f)
												st64(a, 0)
												return q
											}
											copyr(s120, s1d8, 0x20)
											const bo = memcmp(f, s120, 0x20)
											const bn = ld64(s560)
											st64(bn, ld64(bn) - 1)
											if ((bo as u32) == 0) {
												if (ld8(ld64(s520) + 0x29) != 0) {
													q = fn_4bd8(s120, ld64(s520), bo as u32)
													st64(s560, ld64(s120 + 0x10))
													f = ld64(s120 + 8)
													if (ld64(s120) != 0) {
														st64(a + 0x10, ld64(s560))
														st64(a + 8, f)
														st64(a, 0)
														return q
													}
													copyr(s120, s1d8, 0x20)
													const bq = memcmp(f, s120, 0x20)
													const bp = ld64(s560)
													st64(bp, ld64(bp) - 1)
													if ((bq as u32) == 0) {
														if (ld8(ld64(ld64(s528) + 0x20) + 0x29) != 0) {
															const token_vault_0_box: TokenAccount = ld64(s538)
															copyr(s120, token_vault_0_box.mint, 0x20)
															if ((memcmp(ld64(s528) + 0x28, s120, 0x20) as u32) != 0) {
																q = anchor_error_from(s3e8, 0x7de /* anchor::ConstraintTokenMint */)
																f = ld64(s3e8)
																st64(a + 0x10, ld64(s3e8 + 8))
																st64(a + 8, f)
																st64(a, 0)
																return q
															}
															if (ld8(ld64(ld64(s530) + 0x20) + 0x29) != 0) {
																const token_vault_1_box: TokenAccount = ld64(s540)
																copyr(s120, token_vault_1_box.mint, 0x20)
																const bt = memcmp(ld64(s530) + 0x28, s120, 0x20)
																if ((bt as u32) != 0) {
																	q = anchor_error_from(s418, 0x7de /* anchor::ConstraintTokenMint */)
																	f = ld64(s418)
																	st64(a + 0x10, ld64(s418 + 8))
																	st64(a + 8, f)
																	st64(a, 0)
																	return q
																}
																const token_vault_0: AccountInfo = ld64(ld64(s538) + 0x20)
																if (token_vault_0.is_writable != 0) {
																	const bv = token_vault_0.key
																	copyr(s120, bv, 0x20)
																	q = fn_4dc0(s1b8, ld64(s500), bt as u32)
																	st64(s560, ld64(s1b8 + 0x10))
																	let bw = ld64(s1b8 + 8)
																	if (ld64(s1b8) != 0) {
																		st64(a + 0x10, ld64(s560))
																		st64(a + 8, bw)
																		st64(a, 0)
																		return q
																	}
																	const by = memcmp(s120, bw + 0x81, 0x20)
																	const bx = ld64(s560)
																	st64(bx, ld64(bx) - 1)
																	if ((by as u32) == 0) {
																		const token_vault_1: AccountInfo = ld64(ld64(s540) + 0x20)
																		if (token_vault_1.is_writable != 0) {
																			const ca = token_vault_1.key
																			copyr(s120, ca, 0x20)
																			q = fn_4dc0(s1b8, ld64(s500), by as u32)
																			st64(s560, ld64(s1b8 + 0x10))
																			bw = ld64(s1b8 + 8)
																			if (ld64(s1b8) != 0) {
																				st64(a + 0x10, ld64(s560))
																				st64(a + 8, bw)
																				st64(a, 0)
																				return q
																			}
																			const cc = memcmp(s120, bw + 0xa1, 0x20)
																			const cb = ld64(s560)
																			st64(cb, ld64(cb) - 1)
																			if ((cc as u32) == 0) {
																				const token_vault_0_box_2: TokenAccount = ld64(s538)
																				const ce = ld64(ld64(ld64(s558) + 0x58))
																				copyr(s1a0, ce, 0x20)
																				copy(s180, token_vault_0_box_2.mint, 0x20)
																				if ((memcmp(s1a0, s180, 0x20) as u32) != 0) {
																					anchor_error_from(s4a8, 0x7dc /* anchor::ConstraintAddress */)
																					const cm = fn_4130(s4b8, ld64(s4a8), ld64(s4a8 + 8), "vault_0_mint", 0xc)
																					const cl = ld64(s4b8 + 8)
																					const ck = ld64(s4b8)
																					copy(s120, s1a0, 0x40)
																					q = Error_with_pubkeys(s4c8, ck, cl, s120, cm)
																					f = ld64(s4c8)
																					st64(a + 0x10, ld64(s4c8 + 8))
																					st64(a + 8, f)
																					st64(a, 0)
																					return q
																				}
																				const token_vault_1_box_2: TokenAccount = ld64(s540)
																				const cg = vault_1_mint_box.info.key
																				copyr(s160, cg, 0x20)
																				copy(s140, token_vault_1_box_2.mint, 0x20)
																				q = memcmp(s160, s140, 0x20) as u32
																				if (q == 0) {
																					st64(a + 0x70, vault_1_mint_box)
																					st64(a + 0x68, ld64(s558))
																					st64(a + 0x60, ld64(s550))
																					st64(a + 0x58, ld64(s548))
																					st64(a + 0x50, ld64(s540))
																					st64(a + 0x48, ld64(s538))
																					st64(a + 0x40, ld64(s530))
																					st64(a + 0x38, ld64(s528))
																					st64(a + 0x30, ld64(s520))
																					st64(a + 0x28, ld64(s518))
																					st64(a + 0x20, ld64(s510))
																					st64(a + 0x18, ld64(s508))
																					st64(a + 0x10, ld64(s500))
																					st64(a + 8, k & -8)
																					st64(a, i)
																					return q
																				}
																				anchor_error_from(s4d8, 0x7dc /* anchor::ConstraintAddress */)
																				const cj = fn_4130(s4e8, ld64(s4d8), ld64(s4d8 + 8), "vault_1_mint", 0xc)
																				const ci = ld64(s4e8 + 8)
																				const ch = ld64(s4e8)
																				copy(s120, s160, 0x40)
																				q = Error_with_pubkeys(s4f8, ch, ci, s120, cj)
																				f = ld64(s4f8)
																				st64(a + 0x10, ld64(s4f8 + 8))
																				st64(a + 8, f)
																				st64(a, 0)
																				return q
																			}
																			anchor_error_from(s488, 0x7d3 /* anchor::ConstraintRaw */)
																			q = fn_4130(s498, ld64(s488), ld64(s488 + 8), "token_vault_1", 0xd)
																			f = ld64(s498)
																			st64(a + 0x10, ld64(s498 + 8))
																			st64(a + 8, f)
																			st64(a, 0)
																			return q
																		}
																		anchor_error_from(s468, 0x7d0 /* anchor::ConstraintMut */)
																		q = fn_4130(s478, ld64(s468), ld64(s468 + 8), "token_vault_1", 0xd)
																		f = ld64(s478)
																		st64(a + 0x10, ld64(s478 + 8))
																		st64(a + 8, f)
																		st64(a, 0)
																		return q
																	}
																	anchor_error_from(s448, 0x7d3 /* anchor::ConstraintRaw */)
																	q = fn_4130(s458, ld64(s448), ld64(s448 + 8), "token_vault_0", 0xd)
																	f = ld64(s458)
																	st64(a + 0x10, ld64(s458 + 8))
																	st64(a + 8, f)
																	st64(a, 0)
																	return q
																}
																anchor_error_from(s428, 0x7d0 /* anchor::ConstraintMut */)
																q = fn_4130(s438, ld64(s428), ld64(s428 + 8), "token_vault_0", 0xd)
																f = ld64(s438)
																st64(a + 0x10, ld64(s438 + 8))
																st64(a + 8, f)
																st64(a, 0)
																return q
															}
															anchor_error_from(s3f8, 0x7d0 /* anchor::ConstraintMut */)
															q = fn_4130(s408, ld64(s3f8), ld64(s3f8 + 8), "token_account_1", 0xf)
															f = ld64(s408)
															st64(a + 0x10, ld64(s408 + 8))
															st64(a + 8, f)
															st64(a, 0)
															return q
														}
														anchor_error_from(s3c8, 0x7d0 /* anchor::ConstraintMut */)
														q = fn_4130(s3d8, ld64(s3c8), ld64(s3c8 + 8), "token_account_0", 0xf)
														f = ld64(s3d8)
														st64(a + 0x10, ld64(s3d8 + 8))
														st64(a + 8, f)
														st64(a, 0)
														return q
													}
													anchor_error_from(s3a8, 0x7d3 /* anchor::ConstraintRaw */)
													q = fn_4130(s3b8, ld64(s3a8), ld64(s3a8 + 8), "tick_array_upper", 0x10)
													f = ld64(s3b8)
													st64(a + 0x10, ld64(s3b8 + 8))
													st64(a + 8, f)
													st64(a, 0)
													return q
												}
												anchor_error_from(s388, 0x7d0 /* anchor::ConstraintMut */)
												q = fn_4130(s398, ld64(s388), ld64(s388 + 8), "tick_array_upper", 0x10)
												f = ld64(s398)
												st64(a + 0x10, ld64(s398 + 8))
												st64(a + 8, f)
												st64(a, 0)
												return q
											}
											anchor_error_from(s368, 0x7d3 /* anchor::ConstraintRaw */)
											q = fn_4130(s378, ld64(s368), ld64(s368 + 8), "tick_array_lower", 0x10)
											f = ld64(s378)
											st64(a + 0x10, ld64(s378 + 8))
											st64(a + 8, f)
											st64(a, 0)
											return q
										}
										anchor_error_from(s348, 0x7d0 /* anchor::ConstraintMut */)
										q = fn_4130(s358, ld64(s348), ld64(s348 + 8), "tick_array_lower", 0x10)
										f = ld64(s358)
										st64(a + 0x10, ld64(s358 + 8))
										st64(a + 8, f)
										st64(a, 0)
										return q
									}
									anchor_error_from(s328, 0x7d3 /* anchor::ConstraintRaw */)
									q = fn_4130(s338, ld64(s328), ld64(s328 + 8), 0x10015b06a /* "personal_position" */, 0x11)
									f = ld64(s338)
									st64(a + 0x10, ld64(s338 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return q
								}
								anchor_error_from(s308, 0x7d0 /* anchor::ConstraintMut */, bk)
								q = fn_4130(s318, ld64(s308), ld64(s308 + 8), 0x10015b06a /* "personal_position" */, 0x11)
								f = ld64(s318)
								st64(a + 0x10, ld64(s318 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return q
							}
							anchor_error_from(s2e8, 0x7d0 /* anchor::ConstraintMut */)
							q = fn_4130(s2f8, ld64(s2e8), ld64(s2e8 + 8), "pool_state", 0xa)
							f = ld64(s2f8)
							st64(a + 0x10, ld64(s2f8 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
						q = anchor_error_from(s2d8, 0x7df /* anchor::ConstraintTokenOwner */)
						f = ld64(s2d8)
						st64(a + 0x10, ld64(s2d8 + 8))
						st64(a + 8, f)
						st64(a, 0)
						return q
					}
					anchor_error_from(s298, 0x7d3 /* anchor::ConstraintRaw */)
					q = fn_4130(s2a8, ld64(s298), ld64(s298 + 8), 0x10015b0ae /* "nft_account" */, 0xb)
					f = ld64(s2a8)
					st64(a + 0x10, ld64(s2a8 + 8))
					st64(a + 8, f)
					st64(a, 0)
					return q
				}
				alloc_handle_alloc_error(8, 0x120)
			}
			const o = ld64(0x300000000 /* heap bump-allocator cursor */)
			const p = o != 0 ? sat_sub(o, 0xa) : 0x300007ff6
			if ((f & 1) != 0) {
				if (0x300000008 > p) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, sat_sub(o, 0xa), 0xa > o)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, p)
				st64(p, 0x6174735f6c6f6f70)
				st16(p + 8, 0x6574)
				void ld64(q)
			} else {
				if (0x300000008 > p) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, sat_sub(o, 0xa), 0xa > o)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, p)
				st64(p, 0x6174735f6c6f6f70)
				st16(p + 8, 0x6574)
				void ld64(q)
			}
			st64(q + 0x10, p, 0xa)
			st64(q + 8, 0xa)
			st64(q, 1)
			st64(a + 0x10, q)
			st64(a + 8, f)
			st64(a, 0)
			return q
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), p5 (value), p6 (value)
// types [heur]: b: IncreaseLiquidityV2Context (the handler ix_increase_liquidity_v2 passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_11df50(a: u64, b: IncreaseLiquidityV2Context, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let i, j: u64
	const f = p7
	const g = p6
	const h = p5
	if ((c | d) == 0 && (f as u8) == 2) {
		fn_85138(s78, 0x1001598fc)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_88558(0x1001598fc, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(sf8, s78, 0x30)
		st64(s118 + 8, 0x10015b659)
		st32(sf8 + 0x78, 0x17a0 /* error::MissingBaseFlag */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x22e)
		st64(s118 + 0x10, 0x17)
		st64(s118, 0)
		j = fn_13e5a0(s138, s118)
		i = ld64(s138 + 8)
		st64(a, ld64(s138))
		st64(a + 8, i)
		return j
	}
	j = fn_2c3e0(s128, b, c, d, h, g, f)
	i = ld64(s128 + 8)
	st64(a, ld64(s128))
	st64(a + 8, i)
	return j
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_account_1, token_vault_0, token_vault_1
function fn_ae830(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8
	let i, m, n, ac: u64
	let ab = fn_a80(s28, ld64(b + 0x10), c)
	let f = ld64(s28)
	if (f == 2) {
		ab = fn_b4e0(s38, ld64(b + 0x20), 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
		f = ld64(s38)
		if (f == 2) {
			ab = fn_1008(s48, ld64(b + 0x28), c)
			f = ld64(s48)
			if (f == 2) {
				ab = fn_1008(s58, ld64(b + 0x30), c)
				f = ld64(s58)
				if (f == 2) {
					const p = ld64(b + 0x38)
					const q = ld64(p + 0x20)
					if ((memcmp(p, c, 0x20) as u32) == 0 && (common_is_closed(q) == 0 && ld64(ld64(q + 0x10) + 0x10) != 0)) {
						st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
						ab = fn_13e628(s68, s18)
						f = ld64(s68)
						if (f != 2) {
							const r = ld64(0x300000000 /* heap bump-allocator cursor */)
							const s = r != 0 ? sat_sub(r, 0xf) : 0x300007ff1
							i = ld64(s68 + 8)
							if ((f & 1) != 0) {
								if (0x300000008 > s) {
									raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0xf > r)
								}
								st64(0x300000000 /* heap bump-allocator cursor */, s)
								st64(s + 7, 0x305f746e756f6363)
								st64(s, 0x63615f6e656b6f74)
								void ld64(i)
							} else {
								if (0x300000008 > s) {
									raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0xf > r)
								}
								st64(0x300000000 /* heap bump-allocator cursor */, s)
								st64(s + 7, 0x305f746e756f6363)
								st64(s, 0x63615f6e656b6f74)
								void ld64(i)
							}
							st64(i + 0x10, s, 0xf)
							st64(i + 8, 0xf)
							st64(i, 1)
							st64(a + 8, i)
							st64(a, f)
							return ab
						}
					}
					const t = ld64(b + 0x40)
					const u = ld64(t + 0x20)
					if ((memcmp(t, c, 0x20) as u32) == 0 && (common_is_closed(u) == 0 && ld64(ld64(u + 0x10) + 0x10) != 0)) {
						st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
						fn_13e628(s78, s18)
						const v = ld64(s78)
						if (v != 2) {
							ab = fn_4130(s88, v, ld64(s78 + 8), "token_account_1", 0xf)
							i = ld64(s88 + 8)
							f = ld64(s88)
							if (f != 2) {
								st64(a + 8, i)
								st64(a, f)
								return ab
							}
						}
					}
					const w = ld64(b + 0x48)
					fn_a1d8(s98, ld64(w + 0x20), w, c)
					const x = ld64(s98)
					if (x != 2) {
						ab = fn_4130(sa8, x, ld64(s98 + 8), "token_vault_0", 0xd)
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
					ab = fn_4130(sc8, z, ld64(sb8 + 8), "token_vault_1", 0xd)
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
				const o = ld64(0x300000000 /* heap bump-allocator cursor */)
				m = 0x10 > o
				n = o != 0 ? m != 0 ? 0 : o - 0x10 : 0x300007ff0
				i = ld64(s58 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > n) {
						raw_vec_handle_error(1, 0x10, 0x10015f8f8, m, ac)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, n)
					st64(n + 8, 0x72657070755f7961)
					st64(n, 0x7272615f6b636974)
					void ld64(i)
				} else {
					if (0x300000008 > n) {
						raw_vec_handle_error(1, 0x10, 0x10015f8f8, m, ac)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, n)
					st64(n + 8, 0x72657070755f7961)
					st64(n, 0x7272615f6b636974)
					void ld64(i)
				}
			} else {
				const l = ld64(0x300000000 /* heap bump-allocator cursor */)
				m = 0x10 > l
				n = l != 0 ? m != 0 ? 0 : l - 0x10 : 0x300007ff0
				i = ld64(s48 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > n) {
						raw_vec_handle_error(1, 0x10, 0x10015f8f8, m, ac)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, n)
					st64(n + 8, 0x7265776f6c5f7961)
					st64(n, 0x7272615f6b636974)
					void ld64(i)
				} else {
					if (0x300000008 > n) {
						raw_vec_handle_error(1, 0x10, 0x10015f8f8, m, ac)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, n)
					st64(n + 8, 0x7265776f6c5f7961)
					st64(n, 0x7272615f6b636974)
					void ld64(i)
				}
			}
			st64(i + 0x10, n, 0x10)
			st64(i + 8, 0x10)
			st64(i, 1)
			st64(a + 8, i)
			st64(a, f)
			return ab
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
		return ab
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
	return ab
}

function fn_154c88(a: u64, b: u64): u64 {
	return imp__fmt_154cb0(ld8(a), 1, b)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value)
// types [heur]: b: IncreaseLiquidityV2Context (every call passes one: fn_11df50)
function fn_2c3e0(a: u64, b: IncreaseLiquidityV2Context, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s28 = fp - 0x28, s30 = fp - 0x30, s38 = fp - 0x38, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60, s68 = fp - 0x68, s80 = fp - 0x80, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sd0 = fp - 0xd0, s1000 = fp - 0x1000
	const accounts: IncreaseLiquidityV2Accounts = b.accounts
	const g: AccountInfo = accounts.token_account_0.info
	const h: LamportsCell = g.lamports
	const o = g.key
	rc_inc(h)
	const i: DataCell = g.data
	const bc = p7
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
	const p: AccountInfo = accounts.token_account_1.info
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
	const x: AccountInfo = accounts.token_vault_0.info
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
	const af: AccountInfo = accounts.token_vault_1.info
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
		const vault_0_mint: Mint = accounts.vault_0_mint
		st64(0x300000000 /* heap bump-allocator cursor */, ao)
		const aq: AccountInfo = vault_0_mint.info
		memcpy(ao, vault_0_mint, 0x58)
		st64(ao + 0x58, aq)
		st64(ao + 0x78, ld64(vault_0_mint[1].mint_authority + 0x14))
		st64(ao + 0x70, ld64(vault_0_mint[1].mint_authority + 0xc))
		st64(ao + 0x68, ld64(vault_0_mint[1].mint_authority + 4))
		st64(ao + 0x60, ld64(vault_0_mint + 0x60))
		const ar = ld64(0x300000000 /* heap bump-allocator cursor */)
		const at = ar != 0 ? sat_sub(ar, 0x80) & -8 : 0x300007f80
		if (at > 0x300000007) {
			const vault_1_mint: Mint = accounts.vault_1_mint
			st64(0x300000000 /* heap bump-allocator cursor */, at)
			const bb: AccountInfo = vault_1_mint.info
			const ax = memcpy(at, vault_1_mint, 0x58)
			st64(at + 0x58, bb)
			copy(at + 0x60, vault_1_mint + 0x60, 0x20)
			const remaining_accounts: AccountInfo = b.remaining_accounts
			const av = b.remaining_accounts_len
			st64(s1000, accounts + 0x28, accounts + 0x30, sc0, s90, s60, s30, accounts + 0x58, accounts + 0x60, ao, at, remaining_accounts, av, c, d, j, bd, bc)
			let ay = fn_2aa40(sd0, accounts, accounts + 0x10, accounts + 0x20, fp, ax)
			const az = ld64(sd0 + 8)
			const ba = ld64(sd0)
			if (rc_release(ag)) {
				ay = Rc_drop_slow_14df0(s28, ay)
			}
			if (rc_release(ah)) {
				ay = Rc_drop_slow_14df0(s20, ay)
			}
			if (rc_release(y)) {
				ay = Rc_drop_slow_14df0(s58, ay)
			}
			if (rc_release(z)) {
				ay = Rc_drop_slow_14df0(s50, ay)
			}
			if (rc_release(q)) {
				ay = Rc_drop_slow_14df0(s88, ay)
			}
			if (rc_release(r)) {
				ay = Rc_drop_slow_14df0(s80, ay)
			}
			if (rc_release(h)) {
				ay = Rc_drop_slow_14df0(sb8, ay)
			}
			if (!rc_release(i)) {
				st64(a + 8, az)
				st64(a, ba)
				return ay
			}
			ay = Rc_drop_slow_14df0(sb0, ay)
			st64(a + 8, az)
			st64(a, ba)
			return ay
		}
		alloc_handle_alloc_error(8, 0x80)
	}
	alloc_handle_alloc_error(8, 0x80)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14ec00(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s18 = fp - 0x18
	st64(s18, a, b)
	st16(s18 + 0x10, 1)
	fn_14ce00(s18, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (points to it), e (value)
function fn_153158(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155b30(a, b, c, d, e)
}

function fn_2aa40(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s78 = fp - 0x78, s98 = fp - 0x98, sb8 = fp - 0xb8, s120 = fp - 0x120, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s178 = fp - 0x178, s198 = fp - 0x198, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8, s208 = fp - 0x208, s210 = fp - 0x210, s218 = fp - 0x218, s220 = fp - 0x220, s238 = fp - 0x238, s240 = fp - 0x240, s248 = fp - 0x248, s268 = fp - 0x268, s270 = fp - 0x270, s278 = fp - 0x278, s2d0 = fp - 0x2d0, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360
	let ac, ad, av, aw: u64
	copyr(s310, e - 0xfa0, 0x10)
	const f = ld64(c)
	let ao = fn_53e8(s158, f, c, d, e, r0)
	const g = ld64(s148)
	if (ld64(s158) != 0) {
		ad = ld64(s158 + 8)
		st64(a + 8, g)
		st64(a, ad)
		return ao
	}
	let ch = b
	const ca = ld64(e - 0xf80)
	let cb = ld64(e - 0xf88)
	let cc = ld64(e - 0xf90)
	const by = ld64(e - 0xfa8)
	const bz = ld64(e - 0xfb0)
	let ce = ld64(e - 0xfb8)
	let cf = ld64(e - 0xfc0)
	let cg = ld64(e - 0xfc8)
	let cd = ld64(e - 0xfd0)
	const m = ld64(e - 0xfd8)
	const i = ld64(e - 0xfe0)
	const k = ld64(e - 0xfe8)
	const j = ld64(e - 0xff0)
	let ci = ld64(e - 0xff8)
	const r = ld64(e - 0x1000)
	st64(s300 + 8, g)
	const h = ld64(s158 + 8)
	st64(s300, h)
	if ((ld8(h + 0x17d) & 1) == 0) {
		const l = ld64(0x300000000 /* heap bump-allocator cursor */)
		const n = l != 0 ? sat_sub(l, 8) & -4 : 0x300007ff8
		if (0x300000008 > n) {
			alloc_handle_alloc_error(4, 8)
		}
		const o = ld64(d)
		const p = ld32(o + 0x114)
		const q = ld32(o + 0x110)
		st64(0x300000000 /* heap bump-allocator cursor */, n)
		st32(n + 4, p)
		st32(n, q)
		st64(s158, 2, n, 2)
		const u = fn_6f618(h, s158)
		const s: AccountInfo = ld64(r)
		const t: LamportsCell = s.lamports
		const aa = s.key
		rc_inc(t)
		const v: DataCell = s.data
		rc_inc(v)
		const z = s.owner
		const y = s.rent_epoch
		const x = s.is_signer
		const w = s.is_writable
		st8(s220 + 2, s.executable)
		st8(s220, x, w)
		st64(s248, aa, t, v, z, y)
		ao = fn_84360(s158, s248)
		ac = ld64(s158 + 8)
		ad = ld64(s158)
		const ab = ld8(s138 + 0xa)
		if (ab == 2) {
			aw = a
		} else {
			st16(s268 + 0x18, ld16(s138 + 8))
			copyr(s268, s148, 0x18)
			st32(s268 + 0x1b, ld32(s138 + 0xb))
			st8(s268 + 0x1f, ld8(s138 + 0xf))
			st8(s268 + 0x1a, ab)
			st64(s278, ad, ac)
			const ae: AccountInfo = ld64(ci)
			const af: LamportsCell = ae.lamports
			const al = ae.key
			rc_inc(af)
			const ag: DataCell = ae.data
			rc_inc(ag)
			ci = s268
			const ak = ae.owner
			const aj = ae.rent_epoch
			const ai = ae.is_signer
			const ah = ae.is_writable
			st8(s1c0 + 2, ae.executable)
			st8(s1c0, ai, ah)
			st64(s1e8, al, af, ag, ak, aj)
			ao = fn_84360(s158, s1e8)
			ac = ld64(s158 + 8)
			ad = ld64(s158)
			const am = ld8(s138 + 0xa)
			if (am == 2) {
				aw = a
			} else {
				B35: {
					st16(s208 + 0x18, ld16(s138 + 8))
					copyr(s208, s148, 0x18)
					st32(s208 + 0x1b, ld32(s138 + 0xb))
					st8(s208 + 0x1f, ld8(s138 + 0xf))
					st8(s208 + 0x1a, am)
					st64(s218, ad, ac)
					let bd = 0
					const be = ch
					if (u != 0) {
						if (by == 0) {
							fn_14ec98(0, 0, 0x10015fb98)
						}
						const ax = ld64(bz)
						copyr(s1b8, ax, 0x20)
						const ay = ld64(f)
						copyr(s178, ay, 0x20)
						copyr(s48, s178, 0x20)
						st64(s28, 0x1001595c0, 0x20, s48, 0x20)
						st64(sb8, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
						// PDA find_program_address(["pool_tick_array_bitmap_extension", *ay], program *sb8)
						Pubkey_find_program_address(s158, s28, 2, sb8)
						copyr(s198, s158, 0x20)
						const az = memcmp(s1b8, s198, 0x20)
						bd = bz
						if ((az as u32) != 0) {
							ErrorCode_name(s48, 0x100159874)
							st64(s28, 0, 1, 0)
							st64(s98, s28, 0x10015f818)
							st8(s98 + 0x18, 3)
							st64(s98 + 0x10, 0x20)
							st64(sb8 + 0x10, 0)
							st64(sb8, 0)
							if (ErrorCode_fmt(0x100159874, sb8) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
							}
							copyr(s120, s28, 0x18)
							copy(s138, s48, 0x18)
							st64(s158 + 8, 0x100159ede)
							st32(s120 + 0x60, 0x9c6 /* anchor::RequireKeysEqViolated */)
							st8(s120 + 0x18, 2)
							st32(s148 + 8, 0xa6)
							st64(s148, 0x33)
							st64(s158, 0)
							fn_13e5a0(s330, s158)
							const bb = ld64(s330 + 8)
							const ba = ld64(s330)
							const bc = fn_76200(s138, s178)
							copyr(s158, s1b8, 0x20)
							ao = Error_with_pubkeys(s340, ba, bb, s158, bc)
							ac = ld64(s340 + 8)
							ad = ld64(s340)
							break B35
						}
					}
					ao = fn_1e428(s2f0, be, j, k, i, m, s278, s218, cg, cd, cf, ce, bd, s300, s310, cc, cb, q, p, ca)
					const bf = ld64(s2f0)
					if (ld8(s2d0 + 0x51) != 2) {
						ch = ld64(s2e8 + 0x10)
						cf = ld64(s2e8 + 8)
						cg = ld64(s2e8)
						let bj = memcpy(s78, s2d0, 0x30)
						ce = ld64(s2d0 + 0x30)
						cd = ld64(s2d0 + 0x38)
						cc = ld64(s2d0 + 0x40)
						cb = ld64(s2d0 + 0x48)
						const bi = ld64(s210)
						if (rc_release(bi)) {
							bj = Rc_drop_slow_14df0(s210, bj)
						}
						const bk = ld64(s208)
						if (rc_release(bk)) {
							bj = Rc_drop_slow_14df0(s208, bj)
						}
						const bl: LamportsCell = ld64(s1e0)
						if (rc_release(bl)) {
							bj = Rc_drop_slow_14df0(s1e0, bj)
						}
						const bm: DataCell = ld64(s1d8)
						if (rc_release(bm)) {
							bj = Rc_drop_slow_14df0(s1d8, bj)
						}
						const bn = ld64(s270)
						if (rc_release(bn)) {
							bj = Rc_drop_slow_14df0(s270, bj)
						}
						const bo = ld64(s268)
						if (rc_release(bo)) {
							bj = Rc_drop_slow_14df0(ci, bj)
						}
						const bp: LamportsCell = ld64(s240)
						if (rc_release(bp)) {
							bj = Rc_drop_slow_14df0(s240, bj)
						}
						const bq: DataCell = ld64(s238)
						if (rc_release(bq)) {
							Rc_drop_slow_14df0(s238, bj)
						}
						ci = ld64(s310 + 8)
						const bt = ld64(s310)
						clock_get(s158)
						if (ld64(s158) != 0) {
							const bs = ld64(s158 + 8)
							const br = ld64(s148)
							st64(s148, ld64(s148 + 8))
							st64(s158, bs, br)
							ao = fn_13e628(s350, s158)
							ac = ld64(s350 + 8)
							ad = ld64(s350)
							if (ad != 2) {
								st64(g, ld64(g) + 1)
								st64(a + 8, ac)
								st64(a, ad)
								return ao
							}
						} else {
							ac = ld64(s148 + 8)
						}
						ao = fn_69c30(s360, o + 8, bt, ci, bf, cg, cf, ch, s78, ac)
						ac = ld64(s360 + 8)
						ad = ld64(s360)
						if (ad != 2) {
							st64(g, ld64(g) + 1)
							st64(a + 8, ac)
							st64(a, ad)
							return ao
						}
						const bx = ld64(o + 8)
						const bw = ld64(o + 0x10)
						const bv = ld64(o + 0x18)
						const bu = ld64(o + 0x20)
						st64(s158, bx, bw, bv, bu, bt, ci, ce, cd, cc, cb)
						fn_10f5b8(s2f0, s158)
						copyr(sb8, s2e8, 0x10)
						ao = log_data(sb8, 1)
						st64(g, ld64(g) + 1)
						st64(a + 8, ac)
						st64(a, 2)
						return ao
					}
					ac = ld64(s2e8)
					ad = bf
				}
				aw = a
				const bg = ld64(s210)
				if (rc_release(bg)) {
					ao = Rc_drop_slow_14df0(s210, ao)
				}
				const bh = ld64(s208)
				if (rc_release(bh)) {
					ao = Rc_drop_slow_14df0(s208, ao)
				}
			}
			const an: LamportsCell = ld64(s1e0)
			if (rc_release(an)) {
				ao = Rc_drop_slow_14df0(s1e0, ao)
			}
			const ap: DataCell = ld64(s1d8)
			if (rc_release(ap)) {
				ao = Rc_drop_slow_14df0(s1d8, ao)
			}
			const aq = ld64(s270)
			if (rc_release(aq)) {
				ao = Rc_drop_slow_14df0(s270, ao)
			}
			const ar = ld64(s268)
			if (rc_release(ar)) {
				ao = Rc_drop_slow_14df0(ci, ao)
			}
		}
		const at: LamportsCell = ld64(s240)
		if (rc_release(at)) {
			ao = Rc_drop_slow_14df0(s240, ao)
		}
		const au: DataCell = ld64(s238)
		if (!rc_release(au)) {
			av = ld64(s300 + 8)
			st64(av, ld64(av) + 1)
			st64(aw + 8, ac)
			st64(aw, ad)
			return ao
		}
		ao = Rc_drop_slow_14df0(s238, ao)
		av = ld64(s300 + 8)
		st64(av, ld64(av) + 1)
		st64(aw + 8, ac)
		st64(aw, ad)
		return ao
	}
	fn_85138(s1e8, 0x10015982c)
	st64(sb8, 0, 1, 0)
	st64(s2d0, sb8, 0x10015f818)
	st8(s2d0 + 0x18, 3)
	st64(s2d0 + 0x10, 0x20)
	st64(s2e8 + 8, 0)
	st64(s2f0, 0)
	if (fn_88558(0x10015982c, s2f0) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(s120, sb8, 0x18)
	copy(s138, s1e8, 0x18)
	st64(s158 + 8, 0x100159ede)
	st32(s120 + 0x60, 0x1770 /* error::NotApproved */)
	st8(s120 + 0x18, 2)
	st32(s148 + 8, 0x88)
	st64(s148, 0x33)
	st64(s158, 0)
	ao = fn_13e5a0(s320, s158)
	ac = ld64(s320 + 8)
	ad = ld64(s320)
	st64(g, ld64(g) + 1)
	st64(a + 8, ac)
	st64(a, ad)
	return ao
}

function fn_f5d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, b, c, d, e)
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
function fn_14ce00(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14d4b8(a, b, c, d, e)
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

// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: tick_array_state_data: TickArrayStateAccount, tick_array_state_data_2: TickArrayStateAccount, tick_array_state_data_3: TickArrayStateAccount, tick_array_state_data_4: TickArrayStateAccount
function fn_1e428(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64, p13: u64, p14: u64, p15: u64, p16: u64, p17: u64, p18: u64, p19: u64, p20: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s67 = fp - 0x67, s68 = fp - 0x68, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd0 = fp - 0xd0, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s147 = fp - 0x147, s148 = fp - 0x148, s150 = fp - 0x150, s1f8 = fp - 0x1f8, s2a0 = fp - 0x2a0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s500 = fp - 0x500, s510 = fp - 0x510, s558 = fp - 0x558, s590 = fp - 0x590, s5a8 = fp - 0x5a8, s5b0 = fp - 0x5b0, s5b8 = fp - 0x5b8, s5c0 = fp - 0x5c0, sff0 = fp - 0xff0, s1000 = fp - 0x1000
	let l, w, x, y, an, aq, ar, at, au, av, aw, bb, bf, bj, bk, cg, ck, cm, cp, dc, dl, dm, dp, dq, dv, ef, ej, er, es, eu, ff: u64
	st64(s558 + 0x18, c)
	st64(s558 + 0x28, b)
	const k = p19
	let j = p18
	st64(s510, p17, p16)
	const i = p14
	st64(s558 + 0x30, p13)
	st64(s500, p12, p11)
	st64(s558, p9, p10)
	st64(s558 + 0x38, p8)
	st64(s500 + 0x18, p7)
	st64(s558 + 0x20, p6)
	st64(s558 + 0x10, p5)
	const f = p15
	let h = ld64(f + 8)
	let g = ld64(f)
	st64(s558 + 0x40, i)
	if ((g | h) == 0) {
		const t = p20
		if ((t as u8) == 2) {
			st64(a + 0x48, 0)
			st64(a + 0x40, 0)
			st64(a + 0x38, 0)
			st64(a + 0x30, 0)
			st64(a + 0x28, 0)
			st64(a + 0x20, 0)
			st64(a, 0, 0, 0, 0)
			st64(a + 0x50, 0, 0, 0, 0)
			st16(a + 0x70, 0)
			return j
		}
		if ((t & 1) != 0) {
			if (ld64(s500 + 8) == 0) {
				j = fn_88360(s4e0, 0x31)
				bb = ld64(s4e0)
				st64(a + 8, ld64(s4e0 + 8))
				st64(a, bb)
				st8(a + 0x71, 2)
				return j
			}
			st64(s590 + 0x30, j)
			st64(s590 + 0x20, k)
			const ab = ld64(0x300000000 /* heap bump-allocator cursor */)
			const ac = ab != 0 ? sat_sub(ab, 0x80) & -8 : 0x300007f80
			st64(s590 + 0x18, d)
			st64(s500 + 0x10, a)
			if (0x300000007 >= ac) {
				alloc_handle_alloc_error(8, 0x80)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, ac)
			const ax = ld64(s500 + 8)
			const ay = ld64(ax + 0x58)
			memcpy(ac, ax, 0x58)
			st64(ac + 0x58, ay)
			copy(ac + 0x60, ax + 0x60, 0x20)
			j = fn_7da68(s108, ac, ld64(s510 + 8))
			aq = ld64(s108 + 8)
			an = ld64(s108)
			if (an != 2) {
				dv = ld64(s500 + 0x10)
				st64(dv + 8, aq)
				st64(dv, an)
				st8(dv + 0x71, 2)
				return j
			}
			const az = ld64(ld64(s558 + 0x40))
			st64(s590 + 0x10, ld64(az + 0xfd))
			st64(s590 + 0x28, az)
			st64(s590 + 8, ld64(az + 0xf5))
			j = fn_644c8(s108, ld64(s590 + 0x30), j)
			au = ld64(sf8)
			av = ld64(s108 + 8)
			if (ld64(s108) != 0) {
				bf = ld64(s500 + 0x10)
				st64(bf + 8, au)
				st64(bf, av)
				st8(bf + 0x71, 2)
				return j
			}
			j = fn_644c8(s108, ld64(s590 + 0x20), j)
			ar = ld64(sf8)
			at = ld64(s108 + 8)
			if (ld64(s108) != 0) {
				w = ld64(s500 + 0x10)
				st64(w + 8, ar)
				st64(w, at)
				st8(w + 0x71, 2)
				return j
			}
			const ba = ld64(s510 + 8)
			if (aq > ba) {
				j = fn_88360(s4d0, 0x26)
				at = ld64(s4d0)
				w = ld64(s500 + 0x10)
				st64(w + 8, ld64(s4d0 + 8))
				st64(w, at)
				st8(w + 0x71, 2)
				return j
			}
			st64(s1000, au, at, ar, ba - aq)
			j = fn_5ba48(s68, ld64(s590 + 8), ld64(s590 + 0x10), av, au, at, ar, ba - aq)
			h = ld64(s60 + 8)
			g = ld64(s60)
			if (ld64(s68) != 0) {
				aw = ld64(s500 + 0x10)
				st64(aw + 8, h)
				st64(aw, g)
				st8(aw + 0x71, 2)
				return j
			}
		} else {
			if (ld64(s500) == 0) {
				j = fn_88360(s2e0, 0x31)
				bb = ld64(s2e0)
				st64(a + 8, ld64(s2e0 + 8))
				st64(a, bb)
				st8(a + 0x71, 2)
				return j
			}
			st64(s590 + 0x30, j)
			st64(s590 + 0x20, k)
			const z = ld64(0x300000000 /* heap bump-allocator cursor */)
			const aa = z != 0 ? sat_sub(z, 0x80) & -8 : 0x300007f80
			st64(s590 + 0x18, d)
			st64(s500 + 0x10, a)
			if (0x300000007 >= aa) {
				alloc_handle_alloc_error(8, 0x80)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, aa)
			const al = ld64(s500)
			const am = ld64(al + 0x58)
			memcpy(aa, al, 0x58)
			st64(aa + 0x58, am)
			copy(aa + 0x60, al + 0x60, 0x20)
			j = fn_7da68(s108, aa, ld64(s510))
			aq = ld64(s108 + 8)
			an = ld64(s108)
			if (an != 2) {
				dv = ld64(s500 + 0x10)
				st64(dv + 8, aq)
				st64(dv, an)
				st8(dv + 0x71, 2)
				return j
			}
			const ao = ld64(ld64(s558 + 0x40))
			st64(s590 + 0x10, ld64(ao + 0xfd))
			st64(s590 + 0x28, ao)
			st64(s590 + 8, ld64(ao + 0xf5))
			j = fn_644c8(s108, ld64(s590 + 0x30), j)
			au = ld64(sf8)
			av = ld64(s108 + 8)
			if (ld64(s108) != 0) {
				bf = ld64(s500 + 0x10)
				st64(bf + 8, au)
				st64(bf, av)
				st8(bf + 0x71, 2)
				return j
			}
			j = fn_644c8(s108, ld64(s590 + 0x20), j)
			ar = ld64(sf8)
			at = ld64(s108 + 8)
			if (ld64(s108) != 0) {
				w = ld64(s500 + 0x10)
				st64(w + 8, ar)
				st64(w, at)
				st8(w + 0x71, 2)
				return j
			}
			const ap = ld64(s510)
			if (aq > ap) {
				j = fn_88360(s2d0, 0x26)
				at = ld64(s2d0)
				w = ld64(s500 + 0x10)
				st64(w + 8, ld64(s2d0 + 8))
				st64(w, at)
				st8(w + 0x71, 2)
				return j
			}
			st64(s1000, au, at, ar, ap - aq)
			j = fn_5bca0(s68, ld64(s590 + 8), ld64(s590 + 0x10), av, au, at, ar, ap - aq)
			h = ld64(s60 + 8)
			g = ld64(s60)
			if (ld64(s68) != 0) {
				aw = ld64(s500 + 0x10)
				st64(aw + 8, h)
				st64(aw, g)
				st8(aw + 0x71, 2)
				return j
			}
		}
		st64(f + 8, h)
		st64(f, g)
		l = ld64(s590 + 0x28)
		if ((g | h) == 0) {
			fn_85138(s28, 0x100159878)
			st64(s148, 0, 1, 0)
			st64(s48, s148, 0x10015f818)
			st8(s48 + 0x18, 3)
			st64(s48 + 0x10, 0x20)
			st64(s60 + 8, 0)
			st64(s68, 0)
			if (fn_88558(0x100159878, s68) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(sd0, s148, 0x18)
			copy(se8, s28, 0x18)
			st64(s108 + 8, 0x100159d93)
			st32(sb8 + 0x48, 0x179f /* error::ZeroLiquidity */)
			st8(sb8, 2)
			st32(sf8 + 8, 0x1cc)
			st64(sf8, 0x2e)
			st64(s108, 0)
			fn_13e5a0(s4b0, s108)
			j = fn_2150(s4c0, ld64(s4b0), ld64(s4b0 + 8), 0, 0)
			at = ld64(s4c0)
			w = ld64(s500 + 0x10)
			st64(w + 8, ld64(s4c0 + 8))
			st64(w, at)
			st8(w + 0x71, 2)
			return j
		}
	} else {
		st64(s590 + 0x18, d)
		st64(s590 + 0x30, j)
		st64(s590 + 0x20, k)
		st64(s500 + 0x10, a)
		l = ld64(i)
	}
	const n = ld64(l + 0xed)
	st64(s590 + 0x28, l)
	st64(s590 + 0x10, ld64(l + 0xe5))
	const af = AccountInfo_try_borrow_data(s108, ld64(s500 + 0x18), j)
	let r = undef
	let s = undef
	let u = ld64(sf8)
	const o = ld64(s108 + 8)
	const m = ld64(s108)
	if (m != 0x800000000000001a /* Ok */) {
		st64(s108, m, o, u)
		j = fn_13e628(s2f0, s108)
		y = ld64(s2f0 + 8)
		w = ld64(s500 + 0x10)
		st64(w, ld64(s2f0))
		st64(w + 8, y)
		st8(w + 0x71, 2)
		return j
	}
	st64(s590, n, h)
	let v = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
	let p = ld64(o + 8)
	if (p >= 8) {
		v = 0xbba /* anchor::AccountDiscriminatorMismatch */
		const tick_array_state_data: TickArrayStateAccount = ld64(o)
		r = 0x2a81f931cd559bc0 /* account:TickArrayState */
		if (tick_array_state_data.discriminator == 0x2a81f931cd559bc0 /* account:TickArrayState */) {
			if (p > 0x27ff) {
				const ad = ld64(s590 + 0x28)
				const ae = ld16(ad + 0x17f)
				st64(s5a8 + 0x10, ad + 0x17f)
				st64(s108, 0x10015984c)
				st64(sc8, ae != 0 ? ad + 0x17f : 1, (ae != 0) << 1, ad)
				st64(s5a8 + 8, ad + 0x61)
				st64(sd8, ad + 0x61)
				st64(s5a8, ad + 0x41)
				st64(se8, ad + 0x41)
				st64(s5b0, ad + 1)
				st64(sf8, ad + 1)
				st64(sb8 + 8, 1)
				st64(sd0, 0x20)
				st64(se8 + 8, 0x20)
				st64(sf8 + 8, 0x20)
				st64(s108 + 8, 4)
				st64(s148, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
				// PDA create_program_address(["pool", *(ad + 1), *(ad + 0x41), *(ad + 0x61), (ae != 0 ? ad + 0x17f : 1)[..(ae != 0) << 1], ad[..1]], program *s148)
				Pubkey_create_program_address(s68, s108, 6, s148, af)
				if (ld8(s68) != 1) {
					copyr(s28, s67, 0x20)
					const ag = memcmp(tick_array_state_data.pool_id, s28, 0x20)
					st64(u, ld64(u) - 1)
					if ((ag as u32) == 0) {
						const bx = AccountInfo_try_borrow_data(s108, ld64(s558 + 0x38), ag as u32)
						r = undef
						s = undef
						u = ld64(sf8)
						const bd = ld64(s108 + 8)
						const bc = ld64(s108)
						if (bc != 0x800000000000001a /* Ok */) {
							st64(s108, bc, bd, u)
							j = fn_13e628(s340, s108)
							y = ld64(s340 + 8)
							w = ld64(s500 + 0x10)
							st64(w, ld64(s340))
							st64(w + 8, y)
							st8(w + 0x71, 2)
							return j
						}
						let bn = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
						p = ld64(bd + 8)
						if (p >= 8) {
							bn = 0xbba /* anchor::AccountDiscriminatorMismatch */
							const tick_array_state_data_3: TickArrayStateAccount = ld64(bd)
							r = 0x2a81f931cd559bc0 /* account:TickArrayState */
							if (tick_array_state_data_3.discriminator == 0x2a81f931cd559bc0 /* account:TickArrayState */) {
								if (p > 0x27ff) {
									const bu = ld64(s590 + 0x28)
									const bv = ld16(bu + 0x17f)
									const bw = ld64(s5a8 + 0x10)
									st64(sb8, bu)
									st64(sd8, ld64(s5a8 + 8))
									st64(se8, ld64(s5a8))
									st64(sf8, ld64(s5b0))
									st64(s108, 0x10015984c)
									st64(sc8, bv != 0 ? bw : 1, (bv != 0) << 1)
									st64(sb8 + 8, 1)
									st64(sd0, 0x20)
									st64(se8 + 8, 0x20)
									st64(sf8 + 8, 0x20)
									st64(s108 + 8, 4)
									st64(s148, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
									// PDA create_program_address(["pool", *(ld64(s5b0)), *(ld64(s5a8)), *(ld64(s5a8 + 8)), (bv != 0 ? bw : 1)[..(bv != 0) << 1], bu[..1]], program *s148)
									Pubkey_create_program_address(s68, s108, 6, s148, bx)
									if (ld8(s68) != 1) {
										copyr(s28, s67, 0x20)
										const by = memcmp(tick_array_state_data_3.pool_id, s28, 0x20)
										st64(u, ld64(u) - 1)
										if ((by as u32) == 0) {
											const cd = ld64(s500 + 0x18)
											const cf = ld8(cd + 0x29)
											const ce = ld64(cd + 0x10)
											st64(s500 + 0x18, cf)
											j = fn_84f40(s108, ce, cf, undef, undef, by as u32)
											aq = ld64(sf8)
											let ch = ld64(s108 + 8)
											if (ld64(s108) != 0) {
												cg = ld64(s500 + 0x10)
												st64(cg + 8, aq)
												st64(cg, ch)
												st8(cg + 0x71, 2)
												return j
											}
											j = fn_717b0(s68, ch, ld64(s590 + 0x30), ld16(ld64(s590 + 0x28) + 0xe3))
											let cr = ld64(s60)
											let cq = ld64(s68)
											if (cq == 2) {
												const cv = memcpy(s2a0, cr, 0xa8)
												st64(aq, ld64(aq) + 1)
												const cs = ld64(s558 + 0x38)
												const cu = ld8(cs + 0x29)
												const ct = ld64(cs + 0x10)
												st64(s5a8 + 0x10, ct)
												st64(s558 + 0x38, cu)
												j = fn_84f40(s108, ct, cu, undef, undef, cv)
												aq = ld64(sf8)
												ch = ld64(s108 + 8)
												if (ld64(s108) != 0) {
													cg = ld64(s500 + 0x10)
													st64(cg + 8, aq)
													st64(cg, ch)
													st8(cg + 0x71, 2)
													return j
												}
												let cw = ld64(s590 + 0x20)
												j = fn_717b0(s68, ch, cw, ld16(ld64(s590 + 0x28) + 0xe3))
												cr = ld64(s60)
												cq = ld64(s68)
												if (cq == 2) {
													memcpy(s1f8, cr, 0xa8)
													st64(aq, ld64(aq) + 1)
													const cx = ld32(s1f8)
													st64(s590 + 0x20, cw)
													cw = cx != 0 ? cx : cw
													st32(s1f8, cw)
													const cy = ld32(s2a0)
													let cz = ld64(s590 + 0x30)
													cz = cy != 0 ? cy : cz
													st32(s2a0, cz)
													clock_get(s108)
													if (ld64(s108) != 0) {
														const di = ld64(s108 + 8)
														const dh = ld64(sf8)
														st64(sf8, ld64(sf8 + 8))
														st64(s108, di, dh)
														j = fn_13e628(s480, s108)
														at = ld64(s480)
														w = ld64(s500 + 0x10)
														st64(w + 8, ld64(s480 + 8))
														st64(w, at)
														st8(w + 0x71, 2)
														return j
													}
													if ((ld64(s590 + 8) as i64) > -1) {
														st64(sff0, ld64(se8 + 8))
														st64(s1000, s2a0, s1f8)
														j = fn_21b58(s108, g, ld64(s590 + 8), ld64(s558 + 0x40), s2a0, s1f8, ld64(sff0))
														const db = ld64(s108 + 8)
														st64(s558 + 0x40, ld64(s108))
														const da = ld8(sb8 + 0x21)
														if (da == 2) {
															cg = ld64(s500 + 0x10)
															st64(cg + 8, db)
															st64(cg, ld64(s558 + 0x40))
															st8(cg + 0x71, 2)
															return j
														}
														const dj = memcpy(s148, sf8, 0x40)
														st32(s150, ld32(sb8 + 0x22))
														st16(s150 + 4, ld16(sb8 + 0x26))
														copy(s5a8, sb8, 0x10)
														st64(s5b0, ld64(sb8 + 0x10))
														st64(s5b8, ld64(sb8 + 0x18))
														st64(s590 + 8, ld8(sb8 + 0x20))
														j = fn_84f40(s108, ce, ld64(s500 + 0x18), undef, undef, dj)
														aq = ld64(sf8)
														ch = ld64(s108 + 8)
														if (ld64(s108) != 0) {
															cg = ld64(s500 + 0x10)
															st64(cg + 8, aq)
															st64(cg, ch)
															st8(cg + 0x71, 2)
															return j
														}
														j = fn_71878(s3a0, ch, ld64(s590 + 0x30), ld16(ld64(s590 + 0x28) + 0xe3), s2a0)
														let dk = ld64(s3a0)
														if (dk == 2) {
															st64(aq, ld64(aq) + 1)
															j = fn_84f40(s108, ld64(s5a8 + 0x10), ld64(s558 + 0x38), undef, undef, j)
															aq = ld64(sf8)
															ch = ld64(s108 + 8)
															if (ld64(s108) != 0) {
																cg = ld64(s500 + 0x10)
																st64(cg + 8, aq)
																st64(cg, ch)
																st8(cg + 0x71, 2)
																return j
															}
															j = fn_71878(s3b0, ch, ld64(s590 + 0x20), ld16(ld64(s590 + 0x28) + 0xe3), s1f8)
															dk = ld64(s3b0)
															if (dk == 2) {
																st64(aq, ld64(aq) + 1)
																if ((ld64(s590 + 8) & 1) != 0) {
																	j = fn_84f40(s108, ce, ld64(s500 + 0x18), dl, dm, j)
																	aq = ld64(sf8)
																	an = ld64(s108 + 8)
																	if (ld64(s108) != 0) {
																		dv = ld64(s500 + 0x10)
																		st64(dv + 8, aq)
																		st64(dv, an)
																		st8(dv + 0x71, 2)
																		return j
																	}
																	const dn = ld8(an + 0x2784)
																	if (dn != 0xff) {
																		st8(an + 0x2784, dn + 1)
																		if (dn == 0) {
																			j = fn_6d670(s3c0, ld64(s590 + 0x28), ld64(s558 + 0x30), ld32(an + 0x20))
																			ff = ld64(s3c0 + 8)
																			dp = ld64(s3c0)
																			if (dp != 2) {
																				dc = ld64(s500 + 0x10)
																				st64(dc, dp, ff)
																				st8(dc + 0x71, 2)
																				st64(aq, ld64(aq) + 1)
																				return j
																			}
																		}
																	} else {
																		j = fn_88360(s3d0, 0x26)
																		ff = ld64(s3d0 + 8)
																		dp = ld64(s3d0)
																		if (dp != 2) {
																			dc = ld64(s500 + 0x10)
																			st64(dc, dp, ff)
																			st8(dc + 0x71, 2)
																			st64(aq, ld64(aq) + 1)
																			return j
																		}
																	}
																	st64(aq, ld64(aq) + 1)
																}
																if ((da & 1) != 0) {
																	j = fn_84f40(s108, ld64(s5a8 + 0x10), ld64(s558 + 0x38), dl, dm, j)
																	aq = ld64(sf8)
																	an = ld64(s108 + 8)
																	if (ld64(s108) != 0) {
																		dv = ld64(s500 + 0x10)
																		st64(dv + 8, aq)
																		st64(dv, an)
																		st8(dv + 0x71, 2)
																		return j
																	}
																	const fe = ld8(an + 0x2784)
																	if (fe != 0xff) {
																		st8(an + 0x2784, fe + 1)
																		if (fe == 0) {
																			j = fn_6d670(s3e0, ld64(s590 + 0x28), ld64(s558 + 0x30), ld32(an + 0x20))
																			ff = ld64(s3e0 + 8)
																			dp = ld64(s3e0)
																			if (dp != 2) {
																				dc = ld64(s500 + 0x10)
																				st64(dc, dp, ff)
																				st8(dc + 0x71, 2)
																				st64(aq, ld64(aq) + 1)
																				return j
																			}
																		}
																	} else {
																		j = fn_88360(s3f0, 0x26)
																		ff = ld64(s3f0 + 8)
																		dp = ld64(s3f0)
																		if (dp != 2) {
																			dc = ld64(s500 + 0x10)
																			st64(dc, dp, ff)
																			st8(dc + 0x71, 2)
																			st64(aq, ld64(aq) + 1)
																			return j
																		}
																	}
																	st64(aq, ld64(aq) + 1)
																}
																if ((ld64(s5a8 + 8) | ld64(s5a8)) == 0) {
																	fn_85138(s2c0, 0x100159860)
																	st64(s28, 0, 1, 0)
																	st64(s48, s28, 0x10015f818)
																	st8(s48 + 0x18, 3)
																	st64(s48 + 0x10, 0x20)
																	st64(s60 + 8, 0)
																	st64(s68, 0)
																	if (fn_88558(0x100159860, s68) != 0) {
																		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
																	}
																	copyr(sd0, s28, 0x18)
																	copy(se8, s2c0, 0x18)
																	st64(s108 + 8, 0x100159d93)
																	st32(sb8 + 0x48, 0x177f /* error::ForbidBothZeroForSupplyLiquidity */)
																	st8(sb8, 2)
																	st32(sf8 + 8, 0x20f)
																	st64(sf8, 0x2e)
																	st64(s108, 0)
																	j = fn_13e5a0(s470, s108)
																	at = ld64(s470)
																	w = ld64(s500 + 0x10)
																	st64(w + 8, ld64(s470 + 8))
																	st64(w, at)
																	st8(w + 0x71, 2)
																	return j
																}
																st64(s500 + 0x18, 0)
																let ea = 0
																if (ld64(s500 + 8) != 0) {
																	const dr = fn_16330(ld64(s500 + 8))
																	j = fn_7d178(s108, dr, ld64(s5a8))
																	const ds = ld64(s108 + 8)
																	an = ld64(s108)
																	st64(s5b0, ds)
																	ea = ds
																	if (an != 2) {
																		dv = ld64(s500 + 0x10)
																		st64(dv + 8, ld64(s5b0))
																		st64(dv, an)
																		st8(dv + 0x71, 2)
																		return j
																	}
																}
																if (ld64(s500) != 0) {
																	const dt = fn_16330(ld64(s500))
																	j = fn_7d178(s108, dt, ld64(s5a8 + 8))
																	const du = ld64(s108 + 8)
																	an = ld64(s108)
																	st64(s5b8, du)
																	st64(s500 + 0x18, du)
																	if (an != 2) {
																		dv = ld64(s500 + 0x10)
																		st64(dv + 8, ld64(s5b8))
																		st64(dv, an)
																		st8(dv + 0x71, 2)
																		return j
																	}
																}
																const dw = ld64(s590 + 0x28)
																const dz = ld64(dw + 0xfd)
																const dy = ld64(dw + 0xf5)
																const dx = ld32(dw + 0x105)
																st64(se8 + 8, ld64(s5a8 + 8))
																st64(sc8 + 8, ld64(s500 + 0x18))
																st32(sb8, dx)
																st64(sf8, dy, dz)
																st64(s108, ld64(s590 + 0x10))
																st64(s108 + 8, ld64(s590))
																st64(s558 + 0x38, ea)
																st64(sc8, ea)
																const eb = ld64(s5a8)
																st64(se8, eb)
																st64(sd8, 0, 0)
																fn_10f958(s68, s108)
																copyr(s28, s60, 0x10)
																let ei = log_data(s28, 1)
																const ec = ld64(s558 + 0x38)
																st64(s558 + 0x38, eb + ec)
																if (eb > eb + ec) {
																	fn_154730(0x10015fb08, ec)
																}
																if (ld64(s558 + 0x38) > ld64(s510 + 8)) {
																	fn_85138(s2c0, 0x100159904)
																	st64(s28, 0, 1, 0)
																	st64(s48, s28, 0x10015f818)
																	st8(s48 + 0x18, 3)
																	st64(s48 + 0x10, 0x20)
																	st64(s60 + 8, 0)
																	st64(s68, 0)
																	if (fn_88558(0x100159904, s68) != 0) {
																		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
																	}
																	copyr(sd0, s28, 0x18)
																	copy(se8, s2c0, 0x18)
																	st64(s108 + 8, 0x100159d93)
																	st32(sb8 + 0x48, 0x1781 /* error::PriceSlippageCheck */)
																	st8(sb8, 2)
																	st32(sf8 + 8, 0x231)
																	st64(sf8, 0x2e)
																	st64(s108, 0)
																	fn_13e5a0(s450, s108)
																	j = fn_1730(s460, ld64(s450), ld64(s450 + 8), ld64(s510 + 8), ld64(s558 + 0x38))
																	at = ld64(s460)
																	w = ld64(s500 + 0x10)
																	st64(w + 8, ld64(s460 + 8))
																	st64(w, at)
																	st8(w + 0x71, 2)
																	return j
																}
																const ed = ld64(s5a8 + 8)
																const ee = ld64(s500 + 0x18)
																if (ed > ed + ee) {
																	fn_154730(0x10015fb20, ed, ed + ee)
																}
																if (ed + ee > ld64(s510)) {
																	fn_85138(s2c0, 0x100159904)
																	st64(s28, 0, 1, 0)
																	st64(s48, s28, 0x10015f818)
																	st8(s48 + 0x18, 3)
																	st64(s48 + 0x10, 0x20)
																	st64(s60 + 8, 0)
																	st64(s68, 0)
																	if (fn_88558(0x100159904, s68) != 0) {
																		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
																	}
																	copyr(sd0, s28, 0x18)
																	copy(se8, s2c0, 0x18)
																	st64(s108 + 8, 0x100159d93)
																	st32(sb8 + 0x48, 0x1781 /* error::PriceSlippageCheck */)
																	st8(sb8, 2)
																	st32(sf8 + 8, 0x236)
																	st64(sf8, 0x2e)
																	st64(s108, 0)
																	fn_13e5a0(s430, s108)
																	j = fn_1730(s440, ld64(s430), ld64(s430 + 8), ld64(s510), ed + ee)
																	at = ld64(s440)
																	w = ld64(s500 + 0x10)
																	st64(w + 8, ld64(s440 + 8))
																	st64(w, at)
																	st8(w + 0x71, 2)
																	return j
																}
																B126: {
																	if (ld64(s558) == 0) {
																		st8(s48 + 0xa, 2)
																		st64(s500 + 0x18, ld64(ld64(s558 + 8)))
																	} else {
																		ei = AccountInfo_clone_f338(s68, ld64(ld64(s558)))
																		st64(s500 + 0x18, ld64(ld64(s558 + 8)))
																		ef = ld8(s48 + 0xa)
																		if (ef != 2) {
																			const eg = ld64(s60)
																			st64(s510 + 8, eg)
																			const eh = ld64(eg)
																			st64(s558 + 0x30, ld64(s68))
																			rc_inc(ld64(s510 + 8), eh)
																			const ek = ld64(s60 + 8)
																			st64(s510, ek)
																			const el = ld64(ek)
																			rc_inc(ld64(s510), el)
																			st8(se8 + 0xa, ef)
																			st64(sf8, ld64(s510))
																			st64(s108 + 8, ld64(s510 + 8))
																			st64(s108, ld64(s558 + 0x30))
																			const em = ld8(s48 + 9)
																			st64(s558 + 8, em)
																			st8(se8 + 9, em)
																			const en = ld8(s48 + 8)
																			st64(s558, en)
																			st8(se8 + 8, en)
																			const eo = ld64(s48)
																			st64(s5a8 + 0x10, eo)
																			st64(se8, eo)
																			const ep = ld64(s60 + 0x10)
																			st64(s5c0, ep)
																			st64(sf8 + 8, ep)
																			st64(sff0 + 8, ld64(s558 + 0x38))
																			st64(sff0, s108)
																			st64(s1000 + 8, ld64(s500 + 0x18))
																			st64(s1000, ld64(s500 + 8))
																			eu = fn_79050(s400, ld64(s558 + 0x28), ld64(s558 + 0x18), ld64(s558 + 0x10), ld64(s1000), ld64(s1000 + 8), s108, ld64(sff0 + 8), ei, da)
																			es = ld64(s400 + 8)
																			ej = ld64(s400)
																			if (ej == 2) {
																				const eq = ld64(s510 + 8)
																				rc_inc(eq)
																				const et = ld64(s510)
																				rc_inc(et)
																				st8(se8 + 9, ld64(s558 + 8))
																				st8(se8 + 8, ld64(s558))
																				st64(se8, ld64(s5a8 + 0x10))
																				st64(sf8 + 8, ld64(s5c0))
																				st64(sf8, ld64(s510))
																				st64(s108 + 8, ld64(s510 + 8))
																				st64(s108, ld64(s558 + 0x30))
																				break B126
																			}
																			er = ld64(s500 + 0x10)
																			st64(er, ej, es)
																			st8(er + 0x71, 2)
																			return fn_ff88(s68, eu)
																		}
																	}
																	st8(se8 + 0xa, 2)
																	st64(sff0 + 8, ld64(s558 + 0x38))
																	st64(sff0, s108)
																	st64(s1000 + 8, ld64(s500 + 0x18))
																	st64(s1000, ld64(s500 + 8))
																	eu = fn_79050(s410, ld64(s558 + 0x28), ld64(s558 + 0x18), ld64(s558 + 0x10), ld64(s1000), ld64(s1000 + 8), s108, ld64(sff0 + 8), ei, da)
																	es = ld64(s410 + 8)
																	ej = ld64(s410)
																	if (ej != 2) {
																		er = ld64(s500 + 0x10)
																		st64(er, ej, es)
																		st8(er + 0x71, 2)
																		return fn_ff88(s68, eu)
																	}
																	ef = 2
																}
																st8(se8 + 0xa, ef)
																st64(sff0, s108, ed + ee)
																st64(s1000 + 8, ld64(s500 + 0x18))
																st64(s1000, ld64(s500))
																eu = fn_79050(s420, ld64(s558 + 0x28), ld64(s590 + 0x18), ld64(s558 + 0x20), ld64(s1000), ld64(s1000 + 8), s108, ed + ee, eu, da)
																const ev = ld64(s420)
																if (ev != 2) {
																	const fd = ld64(s420 + 8)
																	er = ld64(s500 + 0x10)
																	st64(er, ev, fd)
																	st8(er + 0x71, 2)
																	return fn_ff88(s68, eu)
																}
																const ew = ld64(s590 + 0x28)
																fn_6a5a8(s108, ew, eu)
																const ez = ld64(ew + 0xed)
																const ey = ld64(ew + 0xe5)
																const ex = ld32(ew + 0x105)
																st32(sc8 + 4, ld64(s590 + 0x30))
																st32(sc8, ex)
																st64(sd8, ey, ez)
																st64(se8, ld64(s590 + 0x10))
																st64(se8 + 8, ld64(s590))
																st32(sc8 + 8, ld64(s590 + 0x20))
																fn_110060(s28, s108)
																copyr(s2c0, s20, 0x10)
																log_data(s2c0, 1)
																const fa = ld64(s500 + 0x10)
																eu = memcpy(fa + 0x10, s148, 0x40)
																const fc = ld16(s150 + 4)
																const fb = ld32(s150)
																st8(fa + 0x70, ld64(s590 + 8))
																st8(fa + 0x71, da)
																st64(fa + 0x68, ld64(s5b8))
																st64(fa + 0x60, ld64(s5b0))
																st64(fa + 0x58, ld64(s5a8 + 8))
																st64(fa + 0x50, ld64(s5a8))
																st64(fa + 8, db)
																st64(fa, ld64(s558 + 0x40))
																st32(fa + 0x72, fb)
																st16(fa + 0x76, fc)
																return fn_ff88(s68, eu)
															}
															dq = ld64(s3b0 + 8)
															dc = ld64(s500 + 0x10)
															st64(dc, dk, dq)
															st8(dc + 0x71, 2)
															st64(aq, ld64(aq) + 1)
															return j
														}
														dq = ld64(s3a0 + 8)
														dc = ld64(s500 + 0x10)
														st64(dc, dk, dq)
														st8(dc + 0x71, 2)
														st64(aq, ld64(aq) + 1)
														return j
													}
													j = fn_88360(s390, 0x26)
													at = ld64(s390)
													w = ld64(s500 + 0x10)
													st64(w + 8, ld64(s390 + 8))
													st64(w, at)
													st8(w + 0x71, 2)
													return j
												}
												dc = ld64(s500 + 0x10)
												st64(dc + 8, cr)
												st64(dc, cq)
												st8(dc + 0x71, 2)
												st64(aq, ld64(aq) + 1)
												return j
											}
											dc = ld64(s500 + 0x10)
											st64(dc + 8, cr)
											st64(dc, cq)
											st8(dc + 0x71, 2)
											st64(aq, ld64(aq) + 1)
											return j
										}
										ErrorCode_name(s28, 0x100159874)
										st64(s148, 0, 1, 0)
										st64(s48, s148, 0x10015f818)
										st8(s48 + 0x18, 3)
										st64(s48 + 0x10, 0x20)
										st64(s60 + 8, 0)
										st64(s68, 0)
										if (ErrorCode_fmt(0x100159874, s68) != 0) {
											fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
										}
										copyr(sd0, s148, 0x18)
										copy(se8, s28, 0x18)
										st64(s108 + 8, 0x100159d93)
										st32(sb8 + 0x48, 0x9c6 /* anchor::RequireKeysEqViolated */)
										st8(sb8, 2)
										st32(sf8 + 8, 0x1cf)
										st64(sf8, 0x2e)
										st64(s108, 0)
										const bz = fn_13e5a0(s350, s108)
										const co = ld64(s350 + 8)
										const cn = ld64(s350)
										const dd = AccountInfo_try_borrow_data(s148, ld64(s558 + 0x38), bz)
										r = undef
										s = undef
										const ci = ld64(s147 + 0xf)
										const cb = ld64(s147 + 7)
										const ca = ld64(s148)
										if (ca != 0x800000000000001a /* Ok */) {
											st64(s148, ca, cb, ci)
											cp = fn_13e628(s360, s148)
											cm = ld64(s360 + 8)
											ck = ld64(s500 + 0x10)
											st64(ck, ld64(s360))
											st64(ck + 8, cm)
											st8(ck + 0x71, 2)
											return fn_fc80(cn, co, cp)
										}
										let cj = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
										p = ld64(cb + 8)
										if (p >= 8) {
											cj = 0xbba /* anchor::AccountDiscriminatorMismatch */
											const tick_array_state_data_4: TickArrayStateAccount = ld64(cb)
											r = tick_array_state_data_4.discriminator
											s = 0x2a81f931cd559bc0 /* account:TickArrayState */
											if (r == 0x2a81f931cd559bc0 /* account:TickArrayState */) {
												if (p > 0x27ff) {
													copyr(s68, tick_array_state_data_4.pool_id, 0x20)
													const de = fn_6a5a8(se8, ld64(s590 + 0x28), dd)
													copyr(s108, s68, 0x20)
													j = Error_with_pubkeys(s370, cn, co, s108, de)
													const dg = ld64(s370)
													const df = ld64(s500 + 0x10)
													st64(df + 8, ld64(s370 + 8))
													st64(df, dg)
													st8(df + 0x71, 2)
													st64(ci, ld64(ci) - 1)
													return j
												}
												fn_153158(0x2800, p, 0x1001605f0, r, 0x2a81f931cd559bc0 /* account:TickArrayState */)
											}
										}
										cp = anchor_error_from(s380, cj, cj, r, s)
										cm = ld64(s380 + 8)
										const cl = ld64(s380)
										st64(ci, ld64(ci) - 1)
										ck = ld64(s500 + 0x10)
										st64(ck, cl, cm)
										st8(ck + 0x71, 2)
										return fn_fc80(cn, co, cp)
									}
									st8(s28, ld8(s67))
									fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s28, 0x100160228, 0x100160248)
								}
								fn_153158(0x2800, p, 0x1001605f0, 0x2a81f931cd559bc0 /* account:TickArrayState */, s)
							}
						}
						j = anchor_error_from(s490, bn, bn, r, s)
						y = ld64(s490 + 8)
						x = ld64(s490)
						st64(u, ld64(u) - 1)
						w = ld64(s500 + 0x10)
						st64(w, x, y)
						st8(w + 0x71, 2)
						return j
					}
					ErrorCode_name(s28, 0x100159874)
					st64(s148, 0, 1, 0)
					st64(s48, s148, 0x10015f818)
					st8(s48 + 0x18, 3)
					st64(s48 + 0x10, 0x20)
					st64(s60 + 8, 0)
					st64(s68, 0)
					if (ErrorCode_fmt(0x100159874, s68) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
					}
					copyr(sd0, s148, 0x18)
					copy(se8, s28, 0x18)
					st64(s108 + 8, 0x100159d93)
					st32(sb8 + 0x48, 0x9c6 /* anchor::RequireKeysEqViolated */)
					st8(sb8, 2)
					st32(sf8 + 8, 0x1ce)
					st64(sf8, 0x2e)
					st64(s108, 0)
					const ah = fn_13e5a0(s300, s108)
					const bm = ld64(s300 + 8)
					const bl = ld64(s300)
					const br = AccountInfo_try_borrow_data(s108, ld64(s500 + 0x18), ah)
					r = undef
					s = undef
					const bg = ld64(sf8)
					const aj = ld64(s108 + 8)
					const ai = ld64(s108)
					const bi = ld64(s500 + 0x10)
					if (ai != 0x800000000000001a /* Ok */) {
						st64(s108, ai, aj, bg)
						j = fn_13e628(s310, s108)
						bk = ld64(s310 + 8)
						bj = ld64(s310)
					} else {
						let bh = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
						p = ld64(aj + 8)
						if (p >= 8) {
							bh = 0xbba /* anchor::AccountDiscriminatorMismatch */
							const tick_array_state_data_2: TickArrayStateAccount = ld64(aj)
							r = tick_array_state_data_2.discriminator
							s = 0x2a81f931cd559bc0 /* account:TickArrayState */
							if (r == 0x2a81f931cd559bc0 /* account:TickArrayState */) {
								if (p > 0x27ff) {
									copyr(s2c0, tick_array_state_data_2.pool_id, 0x20)
									const bo = ld64(s590 + 0x28)
									const bp = ld16(bo + 0x17f)
									const bq = ld64(s5a8 + 0x10)
									st64(sb8, bo)
									st64(sd8, ld64(s5a8 + 8))
									st64(se8, ld64(s5a8))
									st64(sf8, ld64(s5b0))
									st64(s108, 0x10015984c)
									st64(sc8, bp != 0 ? bq : 1, (bp != 0) << 1)
									st64(sb8 + 8, 1)
									st64(sd0, 0x20)
									st64(se8 + 8, 0x20)
									st64(sf8 + 8, 0x20)
									st64(s108 + 8, 4)
									st64(s28, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
									// PDA create_program_address(["pool", *(ld64(s5b0)), *(ld64(s5a8)), *(ld64(s5a8 + 8)), (bp != 0 ? bq : 1)[..(bp != 0) << 1], bo[..1]], program *s28)
									const bs = Pubkey_create_program_address(s148, s108, 6, s28, br)
									if (ld8(s148) != 1) {
										copyr(s48, s147, 0x20)
										copy(s68, s2c0, 0x20)
										j = Error_with_pubkeys(s320, bl, bm, s68, bs)
										const bt = ld64(s320)
										st64(bi + 8, ld64(s320 + 8))
										st64(bi, bt)
										st8(bi + 0x71, 2)
										st64(bg, ld64(bg) - 1)
										return j
									}
									st8(s150, ld8(s147))
									fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s150, 0x100160228, 0x100160248)
								}
								fn_153158(0x2800, p, 0x1001605f0, r, 0x2a81f931cd559bc0 /* account:TickArrayState */)
							}
						}
						j = anchor_error_from(s330, bh, bh, r, s)
						bk = ld64(s330 + 8)
						bj = ld64(s330)
						st64(bg, ld64(bg) - 1)
					}
					st64(bi, bj, bk)
					st8(bi + 0x71, 2)
					if (bl != 0) {
						void ld64(bm)
						void ld8(bm + 0x38)
						return j
					}
					void ld64(bm)
					void ld8(bm + 0x50)
					return j
				}
				st8(s28, ld8(s67))
				fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s28, 0x100160228, 0x100160248)
			}
			fn_153158(0x2800, p, 0x1001605f0, 0x2a81f931cd559bc0 /* account:TickArrayState */, s)
		}
	}
	j = anchor_error_from(s4a0, v, v, r, s)
	y = ld64(s4a0 + 8)
	x = ld64(s4a0)
	st64(u, ld64(u) - 1)
	w = ld64(s500 + 0x10)
	st64(w, x, y)
	st8(w + 0x71, 2)
	return j
}

function fn_69c30(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	let l = fn_69e08(s10, b, p5, p6, p7, p8, p9, p10)
	let f = ld64(s10)
	if (f != 2) {
		st64(a + 8, ld64(s10 + 8))
		st64(a, f)
		return l
	}
	const g = ld64(b + 0x40)
	let i = g > g + c
	const h = ld64(b + 0x48)
	const j = h + d + i
	i = j != h ? h > j : i
	if ((i & 1) != 0) {
		l = fn_88360(s20, 0x26)
		f = ld64(s20)
		st64(a + 8, ld64(s20 + 8))
		st64(a, f)
		return l
	}
	st64(b + 0x40, g + c)
	const k = h + d + (g > g + c)
	st64(b + 0x48, k)
	st64(a + 8, k)
	st64(a, 2)
	return l
}

function fn_10f5b8(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000007 >= g) {
		raw_vec_handle_error(1, 0x100, 0x100160ad8, 0x300000007, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0x541e2220d4694f31 /* event:IncreaseLiquidityEvent */)
	copy(g + 8, b, 0x20)
	const h = ld64(b + 0x20)
	st64(g + 0x30, ld64(b + 0x28))
	st64(g + 0x28, h)
	copy(g + 0x38, b + 0x30, 0x20)
	st64(a + 8, g, 0x58)
	st64(a, 0x100)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_154730(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622d0, 1, 8, 0, 0)
	// fmt "attempt to add with overflow"
	fn_14ec00(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14d4b8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	custom_panic(a, b, c, d, e)
	abort()
}

function fn_155738(a: u64, b: u64): u64 {
	return imp__fmt_155760(ld64(a), 1, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_1548e8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x100162588, 1, 8, 0, 0)
	// fmt "attempt to divide by zero"
	fn_14ec00(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_154788(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622e0, 1, 8, 0, 0)
	// fmt "attempt to subtract with overflow"
	fn_14ec00(s30, a, c, d, e)
}

function fn_1547e0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622f0, 1, 8, 0, 0)
	// fmt "attempt to multiply with overflow"
	fn_14ec00(s30, a, c, d, e)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_644c8(a: u64, b: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s70 = fp - 0x70, s88 = fp - 0x88, sf0 = fp - 0xf0, s108 = fp - 0x108, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258
	let l, m, n: u64
	if (0xd89e9 > ((b + 0x6c4f4) as u32)) {
		B5: {
			const g = sar(b << 0x20, 0x3f)
			const h = (b ^ g) - g
			let i = -(h & 1) & 0xfffcb933bd6fb800
			let j = h & 1 ^ 1
			if ((h & 2) != 0) {
				r0 = __multi3_159030(s148, i, 0, 0xfff97272373d4000, 0)
				const k = j * 0xfff97272373d4000
				i = k + ld64(s148 + 8)
				if (k > i) {
					break B5
				}
				j = 0
			}
			if ((h & 4) != 0) {
				r0 = __multi3_159030(s158, i, 0, 0xfff2e50f5f657000, 0)
				const o = j * 0xfff2e50f5f657000
				i = o + ld64(s158 + 8)
				if (o > i) {
					break B5
				}
				j = 0
			}
			if ((h & 8) != 0) {
				r0 = __multi3_159030(s168, i, 0, 0xffe5caca7e10f000, 0)
				const p = j * 0xffe5caca7e10f000
				i = p + ld64(s168 + 8)
				if (p > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x10) != 0) {
				r0 = __multi3_159030(s178, i, 0, 0xffcb9843d60f7000, 0)
				const q = j * 0xffcb9843d60f7000
				i = q + ld64(s178 + 8)
				if (q > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x20) != 0) {
				r0 = __multi3_159030(s188, i, 0, 0xff973b41fa98e800, 0)
				const r = j * 0xff973b41fa98e800
				i = r + ld64(s188 + 8)
				if (r > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x40) != 0) {
				r0 = __multi3_159030(s198, i, 0, 0xff2ea16466c9b000, 0)
				const s = j * 0xff2ea16466c9b000
				i = s + ld64(s198 + 8)
				if (s > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x80) != 0) {
				r0 = __multi3_159030(s1a8, i, 0, 0xfe5dee046a9a3800, 0)
				const t = j * 0xfe5dee046a9a3800
				i = t + ld64(s1a8 + 8)
				if (t > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x100) != 0) {
				r0 = __multi3_159030(s1b8, i, 0, 0xfcbe86c7900bb000, 0)
				const u = j * 0xfcbe86c7900bb000
				i = u + ld64(s1b8 + 8)
				if (u > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x200) != 0) {
				r0 = __multi3_159030(s1c8, i, 0, 0xf987a7253ac65800, 0)
				const v = j * 0xf987a7253ac65800
				i = v + ld64(s1c8 + 8)
				if (v > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x400) != 0) {
				r0 = __multi3_159030(s1d8, i, 0, 0xf3392b0822bb6000, 0)
				const w = j * 0xf3392b0822bb6000
				i = w + ld64(s1d8 + 8)
				if (w > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x800) != 0) {
				r0 = __multi3_159030(s1e8, i, 0, 0xe7159475a2caf000, 0)
				const x = j * 0xe7159475a2caf000
				i = x + ld64(s1e8 + 8)
				if (x > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x1000) != 0) {
				r0 = __multi3_159030(s1f8, i, 0, 0xd097f3bdfd2f2000, 0)
				const y = j * 0xd097f3bdfd2f2000
				i = y + ld64(s1f8 + 8)
				if (y > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x2000) != 0) {
				r0 = __multi3_159030(s208, i, 0, 0xa9f746462d9f8000, 0)
				const z = j * 0xa9f746462d9f8000
				i = z + ld64(s208 + 8)
				if (z > i) {
					break B5
				}
				j = 0
			}
			if ((h & 0x4000) != 0) {
				r0 = __multi3_159030(s218, i, 0, 0x70d869a156f31c00, 0)
				i = j * 0x70d869a156f31c00 + ld64(s218 + 8)
				j = 0
			}
			if ((h & 0x8000) != 0) {
				r0 = __multi3_159030(s228, i, 0, 0x31be135f97ed3200, 0)
				i = j * 0x31be135f97ed3200 + ld64(s228 + 8)
				j = 0
			}
			if ((h & 0x10000) != 0) {
				r0 = __multi3_159030(s238, i, 0, 0x9aa508b5b85a500, 0)
				i = j * 0x9aa508b5b85a500 + ld64(s238 + 8)
				j = 0
			}
			if ((h & 0x20000) != 0) {
				r0 = __multi3_159030(s248, i, 0, 0x5d6af8dedc582c, 0)
				i = j * 0x5d6af8dedc582c + ld64(s248 + 8)
				j = 0
			}
			if ((h & 0x40000) != 0) {
				r0 = __multi3_159030(s258, i, 0, 0x2216e584f5fa, 0)
				i = j * 0x2216e584f5fa + ld64(s258 + 8)
				j = 0
			}
			if ((b as i32) > 0) {
				st64(s70, i, j)
				r0 = fn_100918(s128, 0x10015a490, s70)
				i = ld64(s128)
				st64(a + 0x10, ld64(s128 + 8))
				st64(a + 8, i)
				st64(a, 0)
				return r0
			}
			st64(a + 0x10, j)
			st64(a + 8, i)
			st64(a, 0)
			return r0
		}
		st64(s128, 0x100160990, 1, 8, 0, 0)
		// fmt "arithmetic operation overflow"
		fn_14ec00(s128, 0x10015fe28, l, m, n)
	}
	fn_85138(s88, 0x10015983c)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x10015983c, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(sf0, s60, 0x18)
	copy(s108, s88, 0x18)
	st64(s128 + 8, 0x10015a469)
	st32(sf0 + 0x60, 0x1777 /* error::TickUpperOverflow */)
	st8(sf0 + 0x18, 2)
	st32(s128 + 0x18, 0x26)
	st64(s128 + 0x10, 0x27)
	st64(s128, 0)
	r0 = fn_13e5a0(s138, s128)
	const f = ld64(s138)
	st64(a + 0x10, ld64(s138 + 8))
	st64(a + 8, f)
	st64(a, 1)
	return r0
}

function fn_5bca0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68
	let n, o, p: u64
	const g = p7
	let f = p5
	const h = p6
	const j = f != g ? f > g : d > h
	const i = f != g ? g > f : h > d
	const k = i != 0 ? f : g
	f = j != 0 ? f : g
	const l = i != 0 ? d : h
	d = j != 0 ? d : h
	if ((c != k ? k >= c : l >= b) != 0) {
		st64(a + 0x10, 0)
		st64(a + 8, 0)
		st64(a, 0)
		return f
	}
	const m = p8
	if ((f != c ? f > c : d > b) != 0) {
		if (m != 0) {
			n = a
			st64(s30, m, 0, 0, 1, b - l, c - k - (l > b))
			f = fn_584f8(s48, s30, s20, s10)
			if (ld64(s48) != 0) {
				p = ld64(s48 + 8)
				st64(n + 0x10, ld64(s48 + 0x10))
				st64(n + 8, p)
				st64(n, 0)
				return f
			}
			f = fn_88360(s68, 0x26)
			o = ld64(s68)
			st64(n + 0x10, ld64(s68 + 8))
			st64(n + 8, o)
			st64(n, 1)
			return f
		}
		st64(a + 0x10, 0)
		st64(a + 8, 0)
		st64(a, 0)
		return f
	}
	if (m != 0) {
		n = a
		st64(s30, m, 0, 0, 1, d - l, f - k - (l > d))
		f = fn_584f8(s48, s30, s20, s10)
		if (ld64(s48) != 0) {
			p = ld64(s48 + 8)
			st64(n + 0x10, ld64(s48 + 0x10))
			st64(n + 8, p)
			st64(n, 0)
			return f
		}
		f = fn_88360(s58, 0x26)
		o = ld64(s58)
		st64(n + 0x10, ld64(s58 + 8))
		st64(n + 8, o)
		st64(n, 1)
		return f
	}
	st64(a + 0x10, 0)
	st64(a + 8, 0)
	st64(a, 0)
	return f
}

function fn_5ba48(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s1000 = fp - 0x1000
	const g = p7
	let f = p5
	const h = p6
	const j = f != g ? f > g : d > h
	const i = f != g ? g > f : h > d
	const k = i != 0 ? f : g
	f = j != 0 ? f : g
	const l = i != 0 ? d : h
	d = j != 0 ? d : h
	const m = p8
	if ((k != c ? k >= c : l >= b) != 0) {
		st64(s1000, f, m)
		return fn_5b700(a, l, k, d, ld64(s1000), ld64(s1000 + 8), k)
	}
	if ((f != c ? f > c : d > b) != 0) {
		st64(s1000, f, m)
		return fn_5b700(a, b, c, d, ld64(s1000), ld64(s1000 + 8), k)
	}
	st64(a + 0x10, 0)
	st64(a + 8, 0)
	st64(a, 0)
	return k
}

function fn_2150(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sa8 = fp - 0xa8, sd8 = fp - 0xd8, sdf = fp - 0xdf, s10f = fp - 0x10f, s116 = fp - 0x116, s120 = fp - 0x120, s130 = fp - 0x130
	let f, g: u64
	st64(s130, d, e)
	st32(s120, 0)
	if ((b & 1) != 0) {
		st64(sa8, 0, 1, 0)
		st64(s28, sa8, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_150868(s130, s48) == 0) {
			copyr(s78, sa8, 0x18)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (imp_fmt(s120, s48) == 0) {
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
	if (fn_150868(s130, s48) == 0) {
		copyr(s78, sa8, 0x18)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (imp_fmt(s120, s48) == 0) {
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

// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: tick_array_state_data: TickArrayStateAccount
function fn_84f40(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let f: u64
	if ((c & 1) != 0) {
		if (ld64(b + 0x10) == 0) {
			let h = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
			st64(b + 0x10, -1)
			const g = ld64(b + 0x20)
			if (g >= 8) {
				h = 0xbba /* anchor::AccountDiscriminatorMismatch */
				const tick_array_state_data: TickArrayStateAccount = ld64(b + 0x18)
				e = 0x2a81f931cd559bc0 /* account:TickArrayState */
				if (tick_array_state_data.discriminator == 0x2a81f931cd559bc0 /* account:TickArrayState */) {
					if (g > 0x27ff) {
						st64(a + 0x10, b + 0x10)
						st64(a + 8, tick_array_state_data.pool_id)
						st64(a, 0)
						return r0
					}
					fn_153158(0x2800, g, 0x100160608, 0xbba /* anchor::AccountDiscriminatorMismatch */, 0x2a81f931cd559bc0 /* account:TickArrayState */)
				}
			}
			r0 = anchor_error_from(s48, h, g, h, e)
			const i = ld64(s48)
			st64(a + 0x10, ld64(s48 + 8))
			st64(a + 8, i)
			st64(a, 1)
			st64(b + 0x10, ld64(b + 0x10) + 1)
			return r0
		}
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		r0 = fn_13e628(s38, s18)
		f = ld64(s38)
		st64(a + 0x10, ld64(s38 + 8))
		st64(a + 8, f)
		st64(a, 1)
		return r0
	}
	r0 = anchor_error_from(s28, 0xbbe /* anchor::AccountNotMutable */, c & 1, d, e)
	f = ld64(s28)
	st64(a + 0x10, ld64(s28 + 8))
	st64(a + 8, f)
	st64(a, 1)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
function fn_717b0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10
	const h = fn_71a20(s10, ld32(b + 0x20), c, d, e)
	const f = ld64(s10)
	if (f != 2) {
		st64(a + 8, ld64(s10 + 8))
		st64(a, f)
		return h
	}
	const g = ld64(s10 + 8)
	if (0x3c > g) {
		st64(a + 8, b + 0x24 + g * 0xa8)
		st64(a, 2)
		return h
	}
	fn_14ec98(g, 0x3c, 0x1001602d8)
}

function fn_6a5a8(a: u64, b: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s88 = fp - 0x88, sa9 = fp - 0xa9
	const f = ld16(b + 0x17f)
	st64(s88, 0x10015984c, 4, b + 1, 0x20, b + 0x41, 0x20, b + 0x61, 0x20, f != 0 ? b + 0x17f : 1, (f != 0) << 1, b, 1, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */)
	// PDA create_program_address(["pool", *(b + 1), *(b + 0x41), *(b + 0x61), (f != 0 ? b + 0x17f : 1)[..(f != 0) << 1], b[..1]], program *s28)
	const g = Pubkey_create_program_address(sa9, s88, 6, s28, r0)
	if (ld8(sa9) != 0) {
		st8(s1, ld8(sa9 + 1))
		fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s1, 0x100160228, 0x100160248)
	}
	st64(a + 0x18, ld64(sa9 + 0x19))
	st64(a + 0x10, ld64(sa9 + 0x11))
	st64(a + 8, ld64(sa9 + 9))
	st64(a, ld64(sa9 + 1))
	return g
}

// not included (size budget), see shared.ts:
declare function fn_21b58(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64
declare function fn_71878(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_6d670(a: u64, b: u64, c: u64, d: u64): u64
declare function fn_16330(a: u64): u64
declare function fn_7d178(a: u64, b: u64, c: u64): u64
declare function fn_10f958(a: u64, b: u64)
declare function fn_79050(a: u64, b: u64, c: AccountInfo, d: AccountInfo, p5: u64, p6: u64, p7: u64, p8: u64, r0: u64, r7: u64): u64
declare function fn_110060(a: u64, b: u64)
declare function fn_69e08(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64
declare function fn_e480(a: u64, b: u64, c: u64, d: u64, r0: u64, r7: u64): u64
declare function fn_100918(a: u64, b: u64, c: u64): u64
declare function fn_584f8(a: u64, b: u64, c: u64, d: u64): u64
declare function fn_5b700(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, r0: u64): u64
declare function fn_71a20(a: u64, b: u64, c: u64, d: u64, e: u64): u64
