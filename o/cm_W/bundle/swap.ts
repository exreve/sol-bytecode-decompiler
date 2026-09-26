// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction swap: handler + 46 reachable functions
// typed views: x.field is exactly the load / store / address given by the field declaration
type at<Offset extends number, T> = T // view field: a T at byte offset Offset of the object (x.f: scalar = its load, ref<U> = the loaded pointer, other = its address)
type ref<T> = T                        // view field holding a pointer (8 bytes) to a T
interface sized<Size extends number> {} // a view of that many bytes: x[k] is the k-th such object from x (at x + k * Size)
interface Pubkey {} // 32-byte public key (a Pubkey value is its address)
interface bytes {} // byte array in place (a bytes value is its address)
interface Bytes64 {} // 64 bytes in place (value = their address)
interface u128 {} // 128-bit integer in place (value = its address)
interface Bytes4400 {} // 4400 bytes in place (value = their address)
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
interface ObservationStateAccount extends sized<0x1183> { // data of an account of type ObservationState (Anchor IDL: 8-byte discriminator, then the fields in serialized order)
	discriminator:     at<0x00, u64>
	initialized:       at<0x08, u8>
	recent_epoch:      at<0x09, u64>
	observation_index: at<0x11, u16>
	pool_id:           at<0x13, Pubkey>
	observations:      at<0x33, Bytes4400>
	padding:           at<0x1163, Pubkey>
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
interface SwapArgs extends sized<0x21> { // arguments of instruction swap (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	amount:                 at<0x00, u64>
	other_amount_threshold: at<0x08, u64>
	sqrt_price_limit_x64:   at<0x10, u128>
	is_base_input:          at<0x20, u8>
}
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_log_data(slices: u64, len: u64): void // log base64 data: slices = &[&[u8]]
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function sol_memmove(dst: u64, src: u64, n: u64): void // memmove
declare function fn_11e0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function fn_13d0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function fn_14c8(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from
declare function fn_1730(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_7600(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses try_accounts_182b0, alloc_handle_alloc_error, memcpy
declare function fn_bd88(a: u64, b: u64, r0: u64): u64 // lib uses AccountInfo_try_borrow_data, TokenAccount_try_deserialize_unchecked_126ff8, memcpy
declare function fn_f128(a: u64): u64 // lib uses alloc_handle_alloc_error, Error__new
declare function AccountInfo_clone_f338(a: u64, b: u64): u64 // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function fn_fc80(a: u64, b: u64, r0: u64): u64 // lib
declare function ptr_drop_in_place_fcd8(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<solana_account_info::AccountInfo>
declare function Rc_drop_slow_14df0(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function fn_15168(a: u64, b: u64): u64 // lib uses raw_vec_finish_grow_14e20, raw_vec_handle_error
declare function try_accounts_17a30(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_182b0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_184d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_19190(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function token_transfer(a: u64, b: u64, c: u64): u64 // lib anchor_spl::token::transfer
declare function token_2022_transfer_checked(a: u64, b: u64, c: u64, d: u64): u64 // lib anchor_spl::token_2022::transfer_checked
declare function Error_new_13c880(): u64 // lib std::io::error::Error::new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function Error_with_pubkeys(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib anchor_lang::error::Error::with_pubkeys
declare function ErrorCode_name(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib anchor_lang::error::ErrorCode::name
declare function ErrorCode_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::error::ErrorCode as core::fmt::Display>::fmt
declare function clock_get(a: u64): u64 // lib solana_sysvar::clock::<impl solana_sysvar::Sysvar for solana_clock::Clock>::get
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function Pubkey_create_program_address(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib solana_pubkey::Pubkey::create_program_address
declare function de_unexpected_eof_to_unexpected_length_of_input(a: u64): u64 // lib borsh::de::unexpected_eof_to_unexpected_length_of_input
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fn_14de10(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a formatting trait implementation return…"
declare function fn_150868(a: u64, b: u64): u64 // lib
declare function fmt_write(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::write
declare function imp__fmt_154cb0(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u8>::_fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp

// instruction handler: swap (discriminator sha256("global:swap")[..8] = 0xc88775e1919ec6f8)
// accounts [idl]: 0 payer [signer], 1 amm_config, 2 pool_state [mut], 3 input_token_account [mut], 4 output_token_account [mut], 5 input_vault [mut], 6 output_vault [mut], 7 observation_state [mut], 8 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 9 tick_array [mut]
// args [idl]: amount: u64, other_amount_threshold: u64, sqrt_price_limit_x64: u128, is_base_input: bool
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, amount, other_amount_threshold, is_base_input
function ix_swap(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s10 = fp - 0x10, s11 = fp - 0x11, s50 = fp - 0x50, s58 = fp - 0x58, s68 = fp - 0x68, sa0 = fp - 0xa0, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, s1000 = fp - 0x1000
	let l, o, p, q, r, s: u64
	const u = sol_log("Instruction: Swap", 0x11)
	const f = ix_args_len
	if (f >= 8 && ((f & -8) != 8 && ((f & -0x10) != 0x10 && f != 0x20))) {
		const args: SwapArgs = ix_args
		const amount = args.amount
		const other_amount_threshold = args.other_amount_threshold
		const k = ld64(args.sqrt_price_limit_x64 + 8)
		const j = ld64(args.sqrt_price_limit_x64)
		const is_base_input = args.is_base_input
		st8(s11, is_base_input)
		if (2 > is_base_input) {
			st64(s10, accounts, accounts_len)
			s = accounts_swap(s68, amount, s10, j, fp, u)
			const v = ld64(s68)
			if (v == 0) {
				r = ld64(s68 + 8)
				st64(a + 8, ld64(s58))
				st64(a, r)
				return s
			}
			const x = ld64(s68 + 8)
			const w = ld64(s58)
			memcpy(sa0, s50, 0x38)
			st64(sb8, v, x, w)
			copyr(s58, s10, 0x10)
			st64(s68, program_id, sb8)
			st64(s1000, j, k, is_base_input & 1)
			s = fn_3d6c0(sc8, s68, amount, other_amount_threshold, j, k, is_base_input & 1)
			r = ld64(sc8)
			if (r == 2) {
				s = fn_b7700(sd8, sb8, program_id)
				r = ld64(sd8)
				st64(a + 8, ld64(sd8 + 8))
				st64(a, r)
				return s
			}
			st64(a + 8, ld64(sc8 + 8))
			st64(a, r)
			return s
		}
		st64(s68, 0x10015f910)
		st64(s58, s10)
		st64(s10, s11, fn_154c88)
		st64(s50 + 8, 0)
		st64(s68 + 8, 1)
		st64(s50, 1)
		// fmt "Invalid bool representation: {}" {} = is_base_input [fn_154c88]
		fn_14de10(sb8, s68, other_amount_threshold, j, k)
		l = fn_f128(sb8)
	} else {
		l = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	}
	const m = l
	if (2 > (l & 3) - 2) {
		s = anchor_error_from(se8, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		r = ld64(se8)
		st64(a + 8, ld64(se8 + 8))
		st64(a, r)
		return s
	}
	if ((m & 3) == 0) {
		s = anchor_error_from(se8, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		r = ld64(se8)
		st64(a + 8, ld64(se8 + 8))
		st64(a, r)
		return s
	}
	const n = ld64(ld64(l + 7))
	if (n == 0) {
		s = anchor_error_from(se8, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		r = ld64(se8)
		st64(a + 8, ld64(se8 + 8))
		st64(a, r)
		return s
	}
	callx(n, ld64(l - 1), n)
	s = anchor_error_from(se8, 0x66 /* anchor::InstructionDidNotDeserialize */)
	r = ld64(se8)
	st64(a + 8, ld64(se8 + 8))
	st64(a, r)
	return s
}

function fn_154c88(a: u64, b: u64): u64 {
	return imp__fmt_154cb0(ld8(a), 1, b)
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

// Anchor Accounts::try_accounts of instruction swap (called by ix_swap; name [str]: from the handler's "Instruction: …" log; was fn_b5938)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: input_vault (ConstraintMut), output_vault (ConstraintMut), observation_state (ConstraintMut, ConstraintAddress), token_program, tick_array (ConstraintRaw, ConstraintMut), output_token_account (ConstraintMut), input_token_account (ConstraintMut), pool_state (ConstraintMut), amm_config (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: output_vault_box, output_vault_box_2, tick_array [idl]
function accounts_swap(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const sb8 = fp - 0xb8, sd8 = fp - 0xd8, sf8 = fp - 0xf8, s118 = fp - 0x118, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s320 = fp - 0x320, s328 = fp - 0x328, s330 = fp - 0x330, s338 = fp - 0x338, s340 = fp - 0x340, s348 = fp - 0x348, s350 = fp - 0x350, s358 = fp - 0x358
	let ad, ae, af, ah, ai, ak, al, an, ao, at: u64
	let output_vault_box: TokenAccount_2
	let l = try_accounts_17a30(sb8, c, c, d, e, r0)
	const i = ld64(sb8 + 8)
	let f = ld64(sb8)
	if (f == 2) {
		l = try_accounts_184d8(sb8, c)
		let t = undef
		if (ld64(sb8) == 0) {
			const o = ld64(0x300000000 /* heap bump-allocator cursor */)
			f = ld64(sb8 + 8)
			const p = o != 0 ? sat_sub(o, 0xa) : 0x300007ff6
			output_vault_box = ld64(sb8 + 0x10)
			if (f != 0) {
				if (0x300000008 > p) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, t)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, p)
				st64(p, 0x666e6f635f6d6d61)
				st16(p + 8, 0x6769)
				void output_vault_box.info
			} else {
				if (0x300000008 > p) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, t)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, p)
				st64(p, 0x666e6f635f6d6d61)
				st16(p + 8, 0x6769)
				void output_vault_box.info
			}
			st64(output_vault_box.mint + 8, p, 0xa)
			st64(output_vault_box.mint, 0xa)
			st64(output_vault_box, 1)
			st64(a + 0x10, output_vault_box)
			st64(a + 8, f)
			st64(a, 0)
			return l
		}
		const j = ld64(0x300000000 /* heap bump-allocator cursor */)
		const k = j != 0 ? sat_sub(j, 0x78) : 0x300007f88
		if (0x300000008 > k) {
			alloc_handle_alloc_error(8, 0x78)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, k & -8)
		if ((k & -8) != 0) {
			memcpy(k & -8, sb8, 0x78)
			fn_11e0(sb8, c)
			l = ld64(sb8 + 8)
			f = ld64(sb8)
			if (f == 2) {
				st64(s320, l)
				l = try_accounts_182b0(sb8, c)
				if (ld32(sb8 + 0x90) == 2) {
					const v = ld64(0x300000000 /* heap bump-allocator cursor */)
					f = ld64(sb8)
					const w = v != 0 ? sat_sub(v, 0x13) : 0x300007fed
					output_vault_box = ld64(sb8 + 8)
					if (f != 0) {
						if (0x300000008 > w) {
							raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, w)
						st64(w + 8, 0x6f6363615f6e656b)
						st64(w, 0x6f745f7475706e69)
						st32(w + 0xf, 0x746e756f)
						void output_vault_box.info
					} else {
						if (0x300000008 > w) {
							raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, w)
						st64(w + 8, 0x6f6363615f6e656b)
						st64(w, 0x6f745f7475706e69)
						st32(w + 0xf, 0x746e756f)
						void output_vault_box.info
					}
					st64(output_vault_box.mint + 8, w, 0x13)
					st64(output_vault_box.mint, 0x13)
					st64(output_vault_box, 1)
					st64(a + 0x10, output_vault_box)
					st64(a + 8, f)
					st64(a, 0)
					return l
				}
				const m = ld64(0x300000000 /* heap bump-allocator cursor */)
				const n = m != 0 ? sat_sub(m, 0xb8) : 0x300007f48
				if (0x300000008 > n) {
					alloc_handle_alloc_error(8, 0xb8)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n & -8)
				if ((n & -8) != 0) {
					st64(s328, n & -8)
					memcpy(n & -8, sb8, 0xb8)
					l = try_accounts_182b0(sb8, c)
					if (ld32(sb8 + 0x90) == 2) {
						const z = ld64(0x300000000 /* heap bump-allocator cursor */)
						f = ld64(sb8)
						const aa = z != 0 ? sat_sub(z, 0x14) : 0x300007fec
						output_vault_box = ld64(sb8 + 8)
						if (f != 0) {
							if (0x300000008 > aa) {
								raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, aa)
							st64(aa + 8, 0x6363615f6e656b6f)
							st64(aa, 0x745f74757074756f)
							st32(aa + 0x10, 0x746e756f)
							void output_vault_box.info
						} else {
							if (0x300000008 > aa) {
								raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, aa)
							st64(aa + 8, 0x6363615f6e656b6f)
							st64(aa, 0x745f74757074756f)
							st32(aa + 0x10, 0x746e756f)
							void output_vault_box.info
						}
						st64(output_vault_box.mint + 8, aa, 0x14)
						st64(output_vault_box.mint, 0x14)
						st64(output_vault_box, 1)
						st64(a + 0x10, output_vault_box)
						st64(a + 8, f)
						st64(a, 0)
						return l
					}
					const x = ld64(0x300000000 /* heap bump-allocator cursor */)
					const y = x != 0 ? sat_sub(x, 0xb8) : 0x300007f48
					if (0x300000008 > y) {
						alloc_handle_alloc_error(8, 0xb8)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, y & -8)
					if ((y & -8) != 0) {
						st64(s338, y & -8)
						memcpy(y & -8, sb8, 0xb8)
						try_accounts_182b0(sb8, c)
						if (ld32(sb8 + 0x90) == 2) {
							l = fn_4130(s148, ld64(sb8), ld64(sb8 + 8), 0x10015b11e /* "input_vault" */, 0xb)
							st64(s330, ld64(s148 + 8))
							f = ld64(s148)
							if (f != 2) {
								st64(a + 0x10, ld64(s330))
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
						} else {
							const ab = ld64(0x300000000 /* heap bump-allocator cursor */)
							const ac = ab != 0 ? sat_sub(ab, 0xb8) : 0x300007f48
							if (0x300000008 > ac) {
								alloc_handle_alloc_error(8, 0xb8)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, ac & -8)
							if ((ac & -8) == 0) {
								alloc_handle_alloc_error(8, 0xb8)
							}
							st64(s330, ac & -8)
							memcpy(ac & -8, sb8, 0xb8)
						}
						fn_7600(sb8, c, ad, ae, af)
						output_vault_box = ld64(sb8 + 8)
						const ag = ld64(sb8)
						if (ag != 2) {
							l = fn_4130(s158, ag, output_vault_box, "output_vault", 0xc)
							output_vault_box = ld64(s158 + 8)
							f = ld64(s158)
							if (f != 2) {
								st64(a + 0x10, output_vault_box)
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
						}
						st64(s340, output_vault_box)
						fn_14c8(sb8, c, output_vault_box, ah, ai)
						output_vault_box = ld64(sb8 + 8)
						const aj = ld64(sb8)
						if (aj != 2) {
							l = fn_4130(s168, aj, output_vault_box, "observation_state", 0x11)
							output_vault_box = ld64(s168 + 8)
							f = ld64(s168)
							if (f != 2) {
								st64(a + 0x10, output_vault_box)
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
						}
						st64(s348, output_vault_box)
						try_accounts_19190(sb8, c, output_vault_box, ak, al)
						output_vault_box = ld64(sb8 + 8)
						const am = ld64(sb8)
						if (am != 2) {
							l = fn_4130(s178, am, output_vault_box, 0x10015b020 /* "token_program" */, 0xd)
							output_vault_box = ld64(s178 + 8)
							f = ld64(s178)
							if (f != 2) {
								st64(a + 0x10, output_vault_box)
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
						}
						st64(s350, output_vault_box)
						l = fn_13d0(sb8, c, output_vault_box, an, ao)
						let tick_array: AccountInfo = ld64(sb8 + 8)
						const ap = ld64(sb8)
						if (ap != 2) {
							l = fn_4130(s188, ap, tick_array, 0x10015a23e /* "tick_array" */, 0xa)
							tick_array = ld64(s188 + 8)
							f = ld64(s188)
							at = ld64(s320)
							if (f != 2) {
								st64(a + 0x10, tick_array)
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
						} else {
							at = ld64(s320)
						}
						const ar = ld64(ld64(k & -8))
						copyr(s138, ar, 0x20)
						l = fn_4dc0(sb8, at, l)
						let au = ld64(sb8 + 0x10)
						let av = ld64(sb8 + 8)
						if (ld64(sb8) != 0) {
							st64(a + 0x10, au)
							st64(a + 8, av)
							st64(a, 0)
							return l
						}
						copyr(s118, av + 1, 0x20)
						st64(au, ld64(au) - 1)
						if ((memcmp(s138, s118, 0x20) as u32) == 0) {
							if (ld8(ld64(s320) + 0x29 /* is_writable */) != 0) {
								const az = ld64(s328)
								if (ld8(ld64(az) + 0x29) != 0) {
									const ba = ld64(i)
									copyr(sb8, ba, 0x20)
									if ((memcmp(az + 0x28, sb8, 0x20) as u32) != 0) {
										l = anchor_error_from(s208, 0x7df /* anchor::ConstraintTokenOwner */)
										f = ld64(s208)
										st64(a + 0x10, ld64(s208 + 8))
										st64(a + 8, f)
										st64(a, 0)
										return l
									}
									const bb = ld64(s330)
									copyr(sb8, bb + 8, 0x20)
									if ((memcmp(ld64(s328) + 8, sb8, 0x20) as u32) == 0) {
										if (ld8(ld64(ld64(s338)) + 0x29) != 0) {
											const output_vault_box_2: TokenAccount_2 = ld64(s340)
											copyr(sb8, output_vault_box_2.mint, 0x20)
											const bd = memcmp(ld64(s338) + 8, sb8, 0x20)
											if ((bd as u32) != 0) {
												l = anchor_error_from(s248, 0x7de /* anchor::ConstraintTokenMint */)
												f = ld64(s248)
												st64(a + 0x10, ld64(s248 + 8))
												st64(a + 8, f)
												st64(a, 0)
												return l
											}
											if (ld8(ld64(ld64(s330)) + 0x29) != 0) {
												if (ld8(ld64(ld64(s340)) + 0x29) != 0) {
													if (ld8(ld64(s348) + 0x29 /* is_writable */) != 0) {
														const be = ld64(ld64(s348) /* key */)
														copyr(sf8, be, 0x20)
														l = fn_4dc0(sb8, ld64(s320), bd as u32)
														au = ld64(sb8 + 0x10)
														av = ld64(sb8 + 8)
														if (ld64(sb8) != 0) {
															st64(a + 0x10, au)
															st64(a + 8, av)
															st64(a, 0)
															return l
														}
														copyr(sd8, av + 0xc1, 0x20)
														st64(au, ld64(au) - 1)
														const bf = memcmp(sf8, sd8, 0x20)
														if ((bf as u32) == 0) {
															if (tick_array.is_writable != 0) {
																l = fn_4bd8(sb8, tick_array, bf as u32)
																st64(s358, ld64(sb8 + 0x10))
																f = ld64(sb8 + 8)
																if (ld64(sb8) != 0) {
																	st64(a + 0x10, ld64(s358))
																	st64(a + 8, f)
																	st64(a, 0)
																	return l
																}
																const bj = ld64(ld64(s320) /* key */)
																copyr(sb8, bj, 0x20)
																const bl = memcmp(f, sb8, 0x20)
																const bk = ld64(s358)
																st64(bk, ld64(bk) - 1)
																l = bl as u32
																if (l == 0) {
																	st64(a + 0x48, tick_array)
																	st64(a + 0x40, ld64(s350))
																	st64(a + 0x38, ld64(s348))
																	st64(a + 0x30, ld64(s340))
																	st64(a + 0x28, ld64(s330))
																	st64(a + 0x20, ld64(s338))
																	st64(a + 0x18, ld64(s328))
																	st64(a + 0x10, ld64(s320))
																	st64(a + 8, k & -8)
																	st64(a, i)
																	return l
																}
																anchor_error_from(s308, 0x7d3 /* anchor::ConstraintRaw */)
																l = fn_4130(s318, ld64(s308), ld64(s308 + 8), 0x10015a23e /* "tick_array" */, 0xa)
																f = ld64(s318)
																st64(a + 0x10, ld64(s318 + 8))
																st64(a + 8, f)
																st64(a, 0)
																return l
															}
															anchor_error_from(s2e8, 0x7d0 /* anchor::ConstraintMut */)
															l = fn_4130(s2f8, ld64(s2e8), ld64(s2e8 + 8), 0x10015a23e /* "tick_array" */, 0xa)
															f = ld64(s2f8)
															st64(a + 0x10, ld64(s2f8 + 8))
															st64(a + 8, f)
															st64(a, 0)
															return l
														}
														anchor_error_from(s2b8, 0x7dc /* anchor::ConstraintAddress */)
														const bi = fn_4130(s2c8, ld64(s2b8), ld64(s2b8 + 8), "observation_state", 0x11)
														const bh = ld64(s2c8 + 8)
														const bg = ld64(s2c8)
														copy(sb8, sf8, 0x40)
														l = Error_with_pubkeys(s2d8, bg, bh, sb8, bi)
														f = ld64(s2d8)
														st64(a + 0x10, ld64(s2d8 + 8))
														st64(a + 8, f)
														st64(a, 0)
														return l
													}
													anchor_error_from(s298, 0x7d0 /* anchor::ConstraintMut */)
													l = fn_4130(s2a8, ld64(s298), ld64(s298 + 8), "observation_state", 0x11)
													f = ld64(s2a8)
													st64(a + 0x10, ld64(s2a8 + 8))
													st64(a + 8, f)
													st64(a, 0)
													return l
												}
												anchor_error_from(s278, 0x7d0 /* anchor::ConstraintMut */)
												l = fn_4130(s288, ld64(s278), ld64(s278 + 8), "output_vault", 0xc)
												f = ld64(s288)
												st64(a + 0x10, ld64(s288 + 8))
												st64(a + 8, f)
												st64(a, 0)
												return l
											}
											anchor_error_from(s258, 0x7d0 /* anchor::ConstraintMut */)
											l = fn_4130(s268, ld64(s258), ld64(s258 + 8), 0x10015b11e /* "input_vault" */, 0xb)
											f = ld64(s268)
											st64(a + 0x10, ld64(s268 + 8))
											st64(a + 8, f)
											st64(a, 0)
											return l
										}
										anchor_error_from(s228, 0x7d0 /* anchor::ConstraintMut */)
										l = fn_4130(s238, ld64(s228), ld64(s228 + 8), "output_token_account", 0x14)
										f = ld64(s238)
										st64(a + 0x10, ld64(s238 + 8))
										st64(a + 8, f)
										st64(a, 0)
										return l
									}
									l = anchor_error_from(s218, 0x7de /* anchor::ConstraintTokenMint */)
									f = ld64(s218)
									st64(a + 0x10, ld64(s218 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return l
								}
								anchor_error_from(s1e8, 0x7d0 /* anchor::ConstraintMut */, az)
								l = fn_4130(s1f8, ld64(s1e8), ld64(s1e8 + 8), "input_token_account", 0x13)
								f = ld64(s1f8)
								st64(a + 0x10, ld64(s1f8 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
							anchor_error_from(s1c8, 0x7d0 /* anchor::ConstraintMut */)
							l = fn_4130(s1d8, ld64(s1c8), ld64(s1c8 + 8), "pool_state", 0xa)
							f = ld64(s1d8)
							st64(a + 0x10, ld64(s1d8 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return l
						}
						anchor_error_from(s198, 0x7dc /* anchor::ConstraintAddress */)
						const ay = fn_4130(s1a8, ld64(s198), ld64(s198 + 8), 0x10015af4d /* "amm_config" */, 0xa)
						const ax = ld64(s1a8 + 8)
						const aw = ld64(s1a8)
						copy(sb8, s138, 0x40)
						l = Error_with_pubkeys(s1b8, aw, ax, sb8, ay)
						f = ld64(s1b8)
						st64(a + 0x10, ld64(s1b8 + 8))
						st64(a + 8, f)
						st64(a, 0)
						return l
					}
					alloc_handle_alloc_error(8, 0xb8)
				}
				alloc_handle_alloc_error(8, 0xb8)
			}
			const s = ld64(0x300000000 /* heap bump-allocator cursor */)
			t = 0xa > s
			const q = t != 0 ? 0 : s - 0xa
			const u = s != 0 ? q : 0x300007ff6
			if ((f & 1) != 0) {
				if (0x300000008 > u) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, q, t)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, u)
				st64(u, 0x6174735f6c6f6f70)
				st16(u + 8, 0x6574)
				void ld64(l)
			} else {
				if (0x300000008 > u) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, q, t)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, u)
				st64(u, 0x6174735f6c6f6f70)
				st16(u + 8, 0x6574)
				void ld64(l)
			}
			st64(l + 0x10, u, 0xa)
			st64(l + 8, 0xa)
			st64(l, 1)
			st64(a + 0x10, l)
			st64(a + 8, f)
			st64(a, 0)
			return l
		}
		alloc_handle_alloc_error(8, 0x78)
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 5) : 0x300007ffb
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(g, 5), 5 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 4, 0x72)
		st32(h, 0x65796170)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(g, 5), 5 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 4, 0x72)
		st32(h, 0x65796170)
		void ld64(i)
	}
	st64(i + 0x10, h, 5)
	st64(i + 8, 5)
	st64(i, 1)
	st64(a + 0x10, i)
	st64(a + 8, f)
	st64(a, 0)
	return l
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: AccountInfo, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value), p7 (value)
// types [heur]: b: SwapContext (the handler ix_swap passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_3d6c0(a: u64, b: SwapContext, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, se8 = fp - 0xe8, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0xb8) & -8 : 0x300007f48
	if (g > 0x300000007) {
		const y = p6
		const z = p5
		const aa = p7
		const accounts: SwapAccounts = b.accounts
		const x = ld64(accounts)
		const i = ld64(accounts + 0x18)
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		st64(g, ld64(i))
		memcpy(g + 8, i + 8, 0xb0)
		const j = ld64(0x300000000 /* heap bump-allocator cursor */)
		const k = j != 0 ? sat_sub(j, 0xb8) & -8 : 0x300007f48
		if (k > 0x300000007) {
			const l = ld64(accounts + 0x20)
			st64(0x300000000 /* heap bump-allocator cursor */, k)
			st64(k, ld64(l))
			memcpy(k + 8, l + 8, 0xb0)
			const m = ld64(0x300000000 /* heap bump-allocator cursor */)
			const n = m != 0 ? sat_sub(m, 0xb8) & -8 : 0x300007f48
			if (n > 0x300000007) {
				const o = ld64(accounts + 0x28)
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n, ld64(o))
				memcpy(n + 8, o + 8, 0xb0)
				const p = ld64(0x300000000 /* heap bump-allocator cursor */)
				const q = p != 0 ? sat_sub(p, 0xb8) & -8 : 0x300007f48
				if (q > 0x300000007) {
					const output_vault: TokenAccount_2 = accounts.output_vault
					st64(0x300000000 /* heap bump-allocator cursor */, q)
					st64(q, output_vault.info)
					memcpy(q + 8, output_vault.mint, 0xb0)
					st64(sf8 + 8, ld64(accounts + 0x40))
					st64(s118, x, g, k, n, q)
					st64(se8, accounts + 8, accounts + 0x10, accounts + 0x48, accounts + 0x38)
					const remaining_accounts: AccountInfo = b.remaining_accounts
					const t = b.remaining_accounts_len
					let w = fn_3aa80(s48, s118, remaining_accounts, t, c, z, y, aa)
					let u = ld64(s48)
					if (u != 2) {
						st64(a + 8, ld64(s48 + 8))
						st64(a, u)
						return w
					}
					const v = ld64(s48 + 8)
					if (aa != 0) {
						if (d > v) {
							fn_85138(s78, 0x100159894)
							st64(s60, 0, 1, 0)
							st64(s28, s60, 0x10015f818)
							st8(s28 + 0x18, 3)
							st64(s28 + 0x10, 0x20)
							st64(s48 + 0x10, 0)
							st64(s48, 0)
							if (fn_88558(0x100159894, s48) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
							}
							copy(sf8, s78, 0x30)
							st64(s118 + 8, 0x100159f83)
							st32(se8 + 0x68, 0x1782 /* error::TooLittleOutputReceived */)
							st8(se8 + 0x20, 2)
							st32(s118 + 0x18, 0x41e)
							st64(s118 + 0x10, 0x25)
							st64(s118, 0)
							w = fn_13e5a0(s138, s118)
							u = ld64(s138)
							st64(a + 8, ld64(s138 + 8))
							st64(a, u)
							return w
						}
						st64(a + 8, undef)
						st64(a, 2)
						return w
					}
					if (v > d) {
						fn_85138(s78, 0x10015988c)
						st64(s60, 0, 1, 0)
						st64(s28, s60, 0x10015f818)
						st8(s28 + 0x18, 3)
						st64(s28 + 0x10, 0x20)
						st64(s48 + 0x10, 0)
						st64(s48, 0)
						if (fn_88558(0x10015988c, s48) != 0) {
							fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
						}
						copy(sf8, s78, 0x30)
						st64(s118 + 8, 0x100159f83)
						st32(se8 + 0x68, 0x1783 /* error::TooMuchInputPaid */)
						st8(se8 + 0x20, 2)
						st32(s118 + 0x18, 0x423)
						st64(s118 + 0x10, 0x25)
						st64(s118, 0)
						w = fn_13e5a0(s128, s118)
						u = ld64(s128)
						st64(a + 8, ld64(s128 + 8))
						st64(a, u)
						return w
					}
					st64(a + 8, undef)
					st64(a, 2)
					return w
				}
				alloc_handle_alloc_error(8, 0xb8)
			}
			alloc_handle_alloc_error(8, 0xb8)
		}
		alloc_handle_alloc_error(8, 0xb8)
	}
	alloc_handle_alloc_error(8, 0xb8)
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: observation_state, tick_array
function fn_b7700(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8
	let i: u64
	let x = fn_a80(s28, ld64(b + 0x10), c)
	let f = ld64(s28)
	if (f == 2) {
		const j = ld64(ld64(b + 0x18))
		if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(j) == 0 && ld64(ld64(j + 0x10) + 0x10) != 0)) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			x = fn_13e628(s38, s18)
			f = ld64(s38)
			if (f != 2) {
				const k = ld64(0x300000000 /* heap bump-allocator cursor */)
				const l = k != 0 ? sat_sub(k, 0x13) : 0x300007fed
				i = ld64(s38 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > l) {
						raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008, 0x13 > k)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, l)
					st64(l + 8, 0x6f6363615f6e656b)
					st64(l, 0x6f745f7475706e69)
					st32(l + 0xf, 0x746e756f)
					void ld64(i)
				} else {
					if (0x300000008 > l) {
						raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008, 0x13 > k)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, l)
					st64(l + 8, 0x6f6363615f6e656b)
					st64(l, 0x6f745f7475706e69)
					st32(l + 0xf, 0x746e756f)
					void ld64(i)
				}
				st64(i + 0x10, l, 0x13)
				st64(i + 8, 0x13)
				st64(i, 1)
				st64(a + 8, i)
				st64(a, f)
				return x
			}
		}
		const m = ld64(ld64(b + 0x20))
		if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(m) == 0 && ld64(ld64(m + 0x10) + 0x10) != 0)) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			x = fn_13e628(s48, s18)
			f = ld64(s48)
			if (f != 2) {
				const n = ld64(0x300000000 /* heap bump-allocator cursor */)
				const o = n != 0 ? sat_sub(n, 0x14) : 0x300007fec
				i = ld64(s48 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > o) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > n)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, o)
					st64(o + 8, 0x6363615f6e656b6f)
					st64(o, 0x745f74757074756f)
					st32(o + 0x10, 0x746e756f)
					void ld64(i)
				} else {
					if (0x300000008 > o) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > n)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, o)
					st64(o + 8, 0x6363615f6e656b6f)
					st64(o, 0x745f74757074756f)
					st32(o + 0x10, 0x746e756f)
					void ld64(i)
				}
				st64(i + 0x10, o, 0x14)
				st64(i + 8, 0x14)
				st64(i, 1)
				st64(a + 8, i)
				st64(a, f)
				return x
			}
		}
		const p = ld64(ld64(b + 0x28))
		if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(p) == 0 && ld64(ld64(p + 0x10) + 0x10) != 0)) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			x = fn_13e628(s58, s18)
			f = ld64(s58)
			if (f != 2) {
				const q = ld64(0x300000000 /* heap bump-allocator cursor */)
				const r = q != 0 ? sat_sub(q, 0xb) : 0x300007ff5
				i = ld64(s58 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > r) {
						raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, 0xb > q)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, r)
					st64(r, 0x61765f7475706e69)
					st32(r + 7, 0x746c7561)
					void ld64(i)
				} else {
					if (0x300000008 > r) {
						raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, 0xb > q)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, r)
					st64(r, 0x61765f7475706e69)
					st32(r + 7, 0x746c7561)
					void ld64(i)
				}
				st64(i + 0x10, r, 0xb)
				st64(i + 8, 0xb)
				st64(i, 1)
				st64(a + 8, i)
				st64(a, f)
				return x
			}
		}
		const s = ld64(ld64(b + 0x30))
		if ((memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(s) == 0 && ld64(ld64(s + 0x10) + 0x10) != 0)) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			x = fn_13e628(s68, s18)
			f = ld64(s68)
			if (f != 2) {
				const t = ld64(0x300000000 /* heap bump-allocator cursor */)
				const u = t != 0 ? sat_sub(t, 0xc) : 0x300007ff4
				i = ld64(s68 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > u) {
						raw_vec_handle_error(1, 0xc, 0x10015f8f8, 0x300000008, 0xc > t)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, u)
					st64(u, 0x765f74757074756f)
					st32(u + 8, 0x746c7561)
					void ld64(i)
				} else {
					if (0x300000008 > u) {
						raw_vec_handle_error(1, 0xc, 0x10015f8f8, 0x300000008, 0xc > t)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, u)
					st64(u, 0x765f74757074756f)
					st32(u + 8, 0x746c7561)
					void ld64(i)
				}
				st64(i + 0x10, u, 0xc)
				st64(i + 8, 0xc)
				st64(i, 1)
				st64(a + 8, i)
				st64(a, f)
				return x
			}
		}
		fn_8a8(s78, ld64(b + 0x38), c)
		const v = ld64(s78)
		if (v != 2) {
			x = fn_4130(s88, v, ld64(s78 + 8), "observation_state", 0x11)
			i = ld64(s88 + 8)
			f = ld64(s88)
			if (f != 2) {
				st64(a + 8, i)
				st64(a, f)
				return x
			}
		}
		x = fn_1008(s98, ld64(b + 0x48), c)
		i = undef
		const w = ld64(s98)
		if (w == 2) {
			st64(a + 8, i)
			st64(a, 2)
			return x
		}
		x = fn_4130(sa8, w, ld64(s98 + 8), 0x10015a23e /* "tick_array" */, 0xa)
		f = ld64(sa8)
		st64(a + 8, ld64(sa8 + 8))
		st64(a, f)
		return x
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0xa) : 0x300007ff6
	i = ld64(s28 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x6174735f6c6f6f70)
		st16(h + 8, 0x6574)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > g)
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
	return x
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: p5 (value), p6 (value), p7 (value), p8 (value)
// types [heur]: c: AccountInfo (every call passes one: fn_3d6c0)
function fn_3aa80(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s67 = fp - 0x67, s68 = fp - 0x68, s98 = fp - 0x98, sc8 = fp - 0xc8, sf0 = fp - 0xf0, s140 = fp - 0x140, s160 = fp - 0x160, s168 = fp - 0x168, s180 = fp - 0x180, s1a0 = fp - 0x1a0, s1c0 = fp - 0x1c0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3d8 = fp - 0x3d8, s408 = fp - 0x408, s420 = fp - 0x420, s458 = fp - 0x458, s468 = fp - 0x468, s470 = fp - 0x470, sfe8 = fp - 0xfe8, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let p, q, r, ai, am, bk, bm, cw, cy, dr, ds, dt, du, ec: u64
	st64(s3d8 + 0x40, d)
	let ay = c
	let f = a
	const j = clock_get(s1a0)
	if (ld64(s1a0) != 0) {
		const o = ld64(s1a0 + 8)
		const n = ld64(s1a0 + 0x10)
		st64(s1a0 + 0x10, ld64(s1a0 + 0x18))
		st64(s1a0, o, n)
		r = fn_13e628(s390, s1a0)
		q = ld64(s390)
		st64(f + 8, ld64(s390 + 8))
		st64(f, q)
		return r
	}
	st64(s3d8 + 0x38, f)
	st64(s3d8, p5, p8, p7, p6)
	const aa = ld64(s180 + 8)
	const g = ld64(b + 0x20)
	st64(s3d8 + 0x28, g)
	st64(s408 + 0x28, ld64(g + 0x48))
	const h = ld64(b + 0x18)
	st64(s3d8 + 0x30, h)
	st64(s408 + 0x20, ld64(h + 0x48))
	st64(s3d8 + 0x20, b)
	const i = ld64(b + 0x38)
	r = fn_4dc0(s1a0, ld64(i), j)
	const l = ld64(s1a0 + 0x10)
	const m = ld64(s1a0 + 8)
	if (ld64(s1a0) != 0) {
		const k = ld64(s3d8 + 0x38)
		st64(k + 8, l)
		st64(k, m)
		return r
	}
	const s = ld64(m + 0xfd)
	st64(s408 + 8, s)
	st64(s408, ld64(m + 0xf5))
	st64(l, ld64(l) - 1)
	st64(s408 + 0x10, i)
	r = fn_53e8(s1a0, ld64(i), s, undef, undef, r)
	const u = ld64(s1a0 + 0x10)
	const v = ld64(s1a0 + 8)
	if (ld64(s1a0) != 0) {
		const t = ld64(s3d8 + 0x38)
		st64(t + 8, u)
		st64(t, v)
		return r
	}
	st64(s420 + 0x10, u)
	st64(s1f0, v, u)
	const w = ld64(s3d8 + 0x30)
	st64(s408 + 0x18, v)
	let x = v + 0x41
	const y = memcmp(w + 8, x, 0x20)
	const ab = (y as u32) == 0
	const z = ld64(s408 + 0x18)
	if (aa > ld64(z + 0x430)) {
		B15: {
			st64(s420, ab, y)
			if ((y as u32) == 0) {
				const ag = ld64(ld64(ld64(s3d8 + 0x30)))
				copyr(s1a0, ag, 0x20)
				if ((memcmp(s1a0, z + 0x81, 0x20) as u32) != 0) {
					break B15
				}
				const ah = ld64(ld64(ld64(s3d8 + 0x28)))
				copyr(s1a0, ah, 0x20)
				ai = z + 0xa1
			} else {
				const ac = ld64(ld64(ld64(s3d8 + 0x30)))
				copyr(s1a0, ac, 0x20)
				if ((memcmp(s1a0, z + 0xa1, 0x20) as u32) != 0) {
					break B15
				}
				const ad = ld64(ld64(ld64(s3d8 + 0x28)))
				copyr(s1a0, ad, 0x20)
				ai = z + 0x81
			}
			const aj = memcmp(s1a0, ai, 0x20)
			if ((aj as u32) == 0) {
				st64(s1e0, 0, 8, 0, 0)
				let aq = fn_51c8(s1a0, ld64(ld64(ld64(s3d8 + 0x20) + 0x40)), undef, undef, undef, aj as u32)
				const ao = ld64(s1a0 + 0x10)
				const ap = ld64(s1a0 + 8)
				if (ld64(s1a0) != 0) {
					const an = ld64(s3d8 + 0x38)
					st64(an + 8, ao)
					st64(an, ap)
					r = fn_f680(s1e0, aq)
					am = ld64(s420 + 0x10)
					st64(am, ld64(am) + 1)
					return r
				}
				aq = fn_14d20(s1e0, ap, ao, 0x10015fd88, aq)
				let bd = undef
				let bc = undef
				st64(s458 + 0x30, 0)
				const ar = ld64(s3d8 + 0x40)
				if (ar != 0) {
					st64(s458 + 0x30, 0)
					st64(s458 + 0x18, s67)
					let bh = ar * 0x30
					const at = ld64(s408 + 0x18)
					st64(s3d8 + 0x40, at + 1)
					let au = at + 0x61
					st64(s458 + 0x20, au)
					st64(s458 + 0x10, at + 0x17f)
					st64(s458 + 0x28, x)
					while (true) {
						if (fn_147a98(ay, au, bd, bc, bk) == 0x2800) {
							const bg = ay
							aq = fn_84be0(s1a0, ay)
							const be = ld64(s1a0 + 0x10)
							const bf = ld64(s1a0 + 8)
							if (ld64(s1a0) != 0) {
								const cz = ld64(s3d8 + 0x38)
								st64(cz + 8, be)
								st64(cz, bf)
								r = fn_f680(s1e0, aq)
								am = ld64(s420 + 0x10)
								st64(am, ld64(am) + 1)
								return r
							}
							let ba = ld64(s1e0)
							let az = ld64(s1e0 + 0x18)
							if (az == ba) {
								aq = fn_14b50(s1e0, 0x10015fda0)
								ba = ld64(s1e0)
								az = ld64(s1e0 + 0x18)
							}
							const bb = ld64(s1e0 + 0x10) + az
							bc = ba > bb ? 0 : ba
							bd = bb - bc << 4
							au = ld64(s1e0 + 8) + bd
							st64(au + 8, be)
							st64(au, bf)
							st64(s1e0 + 0x18, az + 1)
							x = ld64(s458 + 0x28)
							ay = bg + 0x30
							bh = bh - 0x30
							if (bh == 0) {
								break
							}
						} else {
							aq = fn_147a98(ay)
							bd = undef
							bc = undef
							if (aq != 0x728) {
								break
							}
							const av = ld64(s408 + 0x18)
							const aw = ld16(av + 0x17f)
							let ax = 1
							if (aw != 0) {
								ax = ld64(s458 + 0x10)
							}
							st64(s160 + 0x10, av)
							st64(s180 + 0x10, ld64(s458 + 0x20))
							st64(s180, x)
							st64(s1a0 + 0x10, ld64(s3d8 + 0x40))
							st64(s1a0, 0x10015984c)
							st64(s160, ax, (aw != 0) << 1)
							st64(s160 + 0x18, 1)
							st64(s168, 0x20)
							st64(s180 + 8, 0x20)
							st64(s1a0 + 0x18, 0x20)
							st64(s1a0 + 8, 4)
							st64(s28, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
							// PDA create_program_address(["pool", *(ld64(s3d8 + 0x40)), *x, *(ld64(s458 + 0x20)), ax[..(aw != 0) << 1], av[..1]], program *s28)
							Pubkey_create_program_address(s68, s1a0, 6, s28, aq)
							if (ld8(s68) == 1) {
								st8(s1c0, ld8(s67))
								fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s1c0, 0x100160228, 0x100160248)
							}
							const bi = ld64(s458 + 0x18)
							copyr(s1c0, bi, 0x20)
							aq = fn_76320(s230, ay, s1c0)
							au = undef
							bd = undef
							bc = undef
							const bj = ld64(s230)
							st64(s458 + 0x30, ay)
							if (bj != 2) {
								const db = ld64(s230 + 8)
								const da = ld64(s3d8 + 0x38)
								st64(da, bj, db)
								r = fn_f680(s1e0, aq)
								am = ld64(s420 + 0x10)
								st64(am, ld64(am) + 1)
								return r
							}
							ay = ay + 0x30
							bh = bh - 0x30
							if (bh == 0) {
								break
							}
						}
					}
				}
				const bl = ld64(s3d8 + 0x20)
				const bs = ld64(ld64(bl + 0x30))
				aq = fn_4fa8(s68, ld64(ld64(bl + 0x48)), bd, bc, bk, aq)
				const bn = ld64(s60 + 8)
				let bo = ld64(s60)
				if (ld64(s68) != 0) {
					bm = ld64(s3d8 + 0x38)
					st64(bm + 8, bn)
					st64(bm, bo)
					r = fn_f680(s1e0, aq)
					am = ld64(s420 + 0x10)
					st64(am, ld64(am) + 1)
					return r
				}
				const bp = ld64(s420 + 8)
				let bu = (bp as u32) != 0 ? 0x845c1aa94e69579a : 0x100013b51
				const bq = ld64(s3d8 + 0x18)
				const br = ld64(s3d8 + 0x10)
				if ((bq | br) != 0) {
					bu = ld64(s3d8 + 0x18)
				}
				let bt = (bp as u32) != 0 ? 0xfffec4b1 : 0
				st64(s3d8 + 0x40, bs)
				if ((bq | br) != 0) {
					bt = ld64(s3d8 + 0x10)
				}
				st64(s28, bo, bn)
				st64(sfe8 + 0x20, fn_69b78())
				st64(sfe8 + 0x18, ld64(s3d8 + 8))
				st64(sfe8, bu, bt, (bp as u32) == 0)
				st64(sff8 + 8, ld64(s3d8))
				st64(sff8, ld64(s458 + 0x30))
				st64(s1000, s28)
				aq = fn_374d0(s1a0, ld64(s3d8 + 0x40) + 8, s1f0, s1e0, s28, ld64(sff8), ld64(sff8 + 8), bu, bt, (bp as u32) == 0, ld64(sfe8 + 0x18), ld64(sfe8 + 0x20))
				const bw = ld64(s1a0 + 8)
				if (ld64(s1a0) != 0) {
					const bv = ld64(s3d8 + 0x38)
					st64(bv + 8, ld64(s1a0 + 0x10))
					st64(bv, bw)
					st64(bn, ld64(bn) + 1)
					r = fn_f680(s1e0, aq)
					am = ld64(s420 + 0x10)
					st64(am, ld64(am) + 1)
					return r
				}
				const cc = ld64(s180)
				const cb = ld64(s1a0 + 0x18)
				const ca = ld32(s160 + 8)
				st64(s458 + 0x30, ld64(s160))
				const bz = ld64(s168)
				const by = ld64(s180 + 0x10)
				const bx = ld64(s180 + 8)
				st64(s408 + 0x18, ld64(s1a0 + 0x10))
				st64(bn, ld64(bn) + 1)
				st64(s3d8 + 0x40, bx)
				if (bx != 0 && by != 0) {
					st64(s468, bz, ca, cb, cc, bw)
					st64(s458 + 0x28, by)
					fn_f680(s1e0, cb)
					const cd = ld64(s420 + 0x10)
					st64(cd, ld64(cd) + 1)
					const ce = ld64(s420 + 8)
					const cf = ld64(s3d8 + 0x20)
					st64(s420 + 0x10, fn_16480(ld64(cf + ((ce as u32) != 0 ? 0x10 : 8))))
					st64(s458 + 0x20, fn_16480(ld64(cf + ((ce as u32) != 0 ? 8 : 0x10))))
					let cg = ld64(s3d8 + 0x30)
					if ((ce as u32) != 0) {
						cg = ld64(s3d8 + 0x28)
					}
					st64(s470, fn_16480(cg))
					let ch = ld64(s3d8 + 0x28)
					const ci = ld64(s408 + 0x10)
					if ((ce as u32) != 0) {
						ch = ld64(s3d8 + 0x30)
					}
					st64(s458 + 0x18, fn_16480(ch))
					const cj = ld64(ld64(ci))
					copyr(s1a0, cj, 0x20)
					const ck = ld64(ld64(cf))
					copyr(s180, ck, 0x20)
					const cl = ld64(ld64(ld64(s420 + 0x10)))
					copyr(s160, cl, 0x20)
					const cm = ld64(s458 + 0x20)
					const cn = ld64(ld64(cm))
					const cs = ld64(cn)
					const cr = ld64(cn + 8)
					const cq = ld64(cn + 0x10)
					const cp = ld64(cn + 0x18)
					st64(sf0 + 0x18, ld64(s458 + 0x30))
					st64(sf0 + 0x10, ld64(s468))
					st32(sf0 + 0x20, ld64(s468 + 8))
					st8(sf0 + 0x24, ld64(s420))
					const co = ld64(s458 + 0x28)
					st64(s140 + 0x30, co)
					st64(s140 + 0x20, ld64(s3d8 + 0x40))
					st64(s140 + 0x40, ld64(s458 + 0x10))
					st64(s140 + 0x48, ld64(s408 + 0x18))
					copy(sf0, s458, 0x10)
					st64(s140, cs, cr, cq, cp)
					st64(s140 + 0x38, 0)
					st64(s140 + 0x28, 0)
					fn_10fd98(s68, s1a0)
					copyr(s28, s60, 0x10)
					log_data(s28, 1)
					if ((ce as u32) == 0) {
						AccountInfo_clone_f338(s68, ld64(ld64(s420 + 0x10)))
						const de = AccountInfo_clone_f338(s1a0, ld64(ld64(s470)))
						const dd = ld64(cf + 0x28)
						st8(sc8 + 0x2a, 2)
						st64(sfe8, ld64(s3d8 + 0x40))
						st64(s1000, 0, dd, sc8)
						cw = fn_79050(s260, cf, s68, s1a0, 0, dd, sc8, ld64(sfe8), de, s1a0)
						cy = ld64(s260)
						if (cy != 2) {
							ds = ld64(s260 + 8)
							dr = ld64(s3d8 + 0x38)
							st64(dr, cy, ds)
							return ptr_drop_in_place_fcd8(s68, ptr_drop_in_place_fcd8(s1a0, cw))
						}
						ptr_drop_in_place_fcd8(s68, ptr_drop_in_place_fcd8(s1a0, cw))
						AccountInfo_clone_f338(s68, ld64(ld64(s458 + 0x18)))
						const df = AccountInfo_clone_f338(s1a0, ld64(ld64(s458 + 0x20)))
						st64(sfe8, ld64(s458 + 0x28))
						st64(s1000, 0, dd, sc8)
						cw = fn_7a038(s270, ld64(s408 + 0x10), s68, s1a0, 0, dd, sc8, ld64(sfe8), df)
						cy = ld64(s270)
						if (cy != 2) {
							ds = ld64(s270 + 8)
							dr = ld64(s3d8 + 0x38)
							st64(dr, cy, ds)
							return ptr_drop_in_place_fcd8(s68, ptr_drop_in_place_fcd8(s1a0, cw))
						}
					} else {
						AccountInfo_clone_f338(s68, ld64(cm))
						const cu = AccountInfo_clone_f338(s1a0, ld64(ld64(s458 + 0x18)))
						const ct = ld64(cf + 0x28)
						st8(s98 + 0x2a, 2)
						st64(s1000, 0, ct, s98, co)
						cw = fn_79050(s240, cf, s68, s1a0, 0, ct, s98, co, cu, s1a0)
						const cv = ld64(s240)
						if (cv != 2) {
							const dq = ld64(s240 + 8)
							const dp = ld64(s3d8 + 0x38)
							st64(dp, cv, dq)
							return ptr_drop_in_place_fcd8(s68, ptr_drop_in_place_fcd8(s1a0, cw))
						}
						ptr_drop_in_place_fcd8(s68, ptr_drop_in_place_fcd8(s1a0, cw))
						AccountInfo_clone_f338(s68, ld64(ld64(s470)))
						const cx = AccountInfo_clone_f338(s1a0, ld64(ld64(s420 + 0x10)))
						st64(sfe8, ld64(s3d8 + 0x40))
						st64(s1000, 0, ct, s98)
						cw = fn_7a038(s250, ld64(s408 + 0x10), s68, s1a0, 0, ct, s98, ld64(sfe8), cx)
						cy = ld64(s250)
						if (cy != 2) {
							ds = ld64(s250 + 8)
							dr = ld64(s3d8 + 0x38)
							st64(dr, cy, ds)
							return ptr_drop_in_place_fcd8(s68, ptr_drop_in_place_fcd8(s1a0, cw))
						}
					}
					const dg = ptr_drop_in_place_fcd8(s68, ptr_drop_in_place_fcd8(s1a0, cw))
					r = fn_bd88(s280, ld64(s3d8 + 0x28), dg)
					let dh = ld64(s280)
					if (dh == 2) {
						r = fn_bd88(s290, ld64(s3d8 + 0x30), r)
						dh = ld64(s290)
						if (dh == 2) {
							B78: {
								B82: {
									if ((ld64(s420 + 8) as u32) == 0) {
										let dy = ld64(s458 + 0x10) > ld64(s408)
										const dx = ld64(s408 + 0x18) > ld64(s408 + 8)
										const dv = ld64(s408 + 8)
										const dw = ld64(s408 + 0x18)
										dy = dv != dw ? dx : dy
										if ((dy & 1) != 0) {
											ErrorCode_name(s1c0, 0x100159858, dv, dw)
											st64(s28, 0, 1, 0)
											st64(s48, s28, 0x10015f818)
											st8(s48 + 0x18, 3)
											st64(s48 + 0x10, 0x20)
											st64(s60 + 8, 0)
											st64(s68, 0)
											if (ErrorCode_fmt(0x100159858, s68) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copyr(s168, s28, 0x18)
											copy(s180, s1c0, 0x18)
											st64(s1a0 + 8, 0x100159f83)
											st32(s140 + 0x38, 0x9ca /* anchor::RequireGteViolated */)
											st8(s160 + 0x10, 2)
											st32(s1a0 + 0x18, 0x3e3)
											st64(s1a0 + 0x10, 0x25)
											st64(s1a0, 0)
											fn_13e5a0(s360, s1a0)
											const ea = ld64(s360 + 8)
											const dz = ld64(s360)
											st64(sff8 + 8, ld64(s408 + 0x18))
											st64(sff8, ld64(s458 + 0x10))
											st64(s1000, ld64(s408 + 8))
											r = fn_2be8(s370, dz, ea, ld64(s408), ld64(s1000), ld64(sff8), ld64(sff8 + 8))
											q = ld64(s370)
											f = ld64(s3d8 + 0x38)
											st64(f + 8, ld64(s370 + 8))
											st64(f, q)
											return r
										}
										if ((ld64(s3d8 + 0x18) | ld64(s3d8 + 0x10)) == 0) {
											if (ld64(s3d8 + 8) != 0) {
												if (ld64(s3d8 + 0x40) == ld64(s3d8)) {
													break B78
												}
												ErrorCode_name(s1c0, 0x1001598b8, dv, dw)
												st64(s28, 0, 1, 0)
												st64(s48, s28, 0x10015f818)
												st8(s48 + 0x18, 3)
												st64(s48 + 0x10, 0x20)
												st64(s60 + 8, 0)
												st64(s68, 0)
												if (ErrorCode_fmt(0x1001598b8, s68) != 0) {
													fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
												}
												copyr(s168, s28, 0x18)
												copy(s180, s1c0, 0x18)
												st64(s1a0 + 8, 0x100159f83)
												st32(s140 + 0x38, 0x9c5 /* anchor::RequireEqViolated */)
												st8(s160 + 0x10, 2)
												st32(s1a0 + 0x18, 0x3eb)
												st64(s1a0 + 0x10, 0x25)
												st64(s1a0, 0)
												fn_13e5a0(s330, s1a0)
												r = fn_1730(s340, ld64(s330), ld64(s330 + 8), ld64(s3d8), ld64(s3d8 + 0x40))
												q = ld64(s340)
												f = ld64(s3d8 + 0x38)
												st64(f + 8, ld64(s340 + 8))
												st64(f, q)
												return r
											}
											if (ld64(s458 + 0x28) == ld64(s3d8)) {
												break B82
											}
											ErrorCode_name(s1c0, 0x1001598b8, dv, dw)
											st64(s28, 0, 1, 0)
											st64(s48, s28, 0x10015f818)
											st8(s48 + 0x18, 3)
											st64(s48 + 0x10, 0x20)
											st64(s60 + 8, 0)
											st64(s68, 0)
											if (ErrorCode_fmt(0x1001598b8, s68) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copyr(s168, s28, 0x18)
											copy(s180, s1c0, 0x18)
											st64(s1a0 + 8, 0x100159f83)
											st32(s140 + 0x38, 0x9c5 /* anchor::RequireEqViolated */)
											st8(s160 + 0x10, 2)
											st32(s1a0 + 0x18, 0x3f1)
											st64(s1a0 + 0x10, 0x25)
											st64(s1a0, 0)
											fn_13e5a0(s300, s1a0)
											r = fn_1730(s310, ld64(s300), ld64(s300 + 8), ld64(s3d8), ld64(s458 + 0x28))
											q = ld64(s310)
											f = ld64(s3d8 + 0x38)
											st64(f + 8, ld64(s310 + 8))
											st64(f, q)
											return r
										}
									} else {
										let dl = ld64(s408) > ld64(s458 + 0x10)
										const dk = ld64(s408 + 8) > ld64(s408 + 0x18)
										const dj = ld64(s408 + 8)
										const di = ld64(s408 + 0x18)
										dl = di != dj ? dk : dl
										if ((dl & 1) != 0) {
											ErrorCode_name(s1c0, 0x100159858, dj, di)
											st64(s28, 0, 1, 0)
											st64(s48, s28, 0x10015f818)
											st8(s48 + 0x18, 3)
											st64(s48 + 0x10, 0x20)
											st64(s60 + 8, 0)
											st64(s68, 0)
											if (ErrorCode_fmt(0x100159858, s68) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copyr(s168, s28, 0x18)
											copy(s180, s1c0, 0x18)
											st64(s1a0 + 8, 0x100159f83)
											st32(s140 + 0x38, 0x9ca /* anchor::RequireGteViolated */)
											st8(s160 + 0x10, 2)
											st32(s1a0 + 0x18, 0x3e5)
											st64(s1a0 + 0x10, 0x25)
											st64(s1a0, 0)
											fn_13e5a0(s2e0, s1a0)
											const dn = ld64(s2e0 + 8)
											const dm = ld64(s2e0)
											copyr(sff8, s408, 0x10)
											st64(s1000, ld64(s408 + 0x18))
											r = fn_2be8(s2f0, dm, dn, ld64(s458 + 0x10), ld64(s1000), ld64(sff8), ld64(sff8 + 8))
											q = ld64(s2f0)
											f = ld64(s3d8 + 0x38)
											st64(f + 8, ld64(s2f0 + 8))
											st64(f, q)
											return r
										}
										if ((ld64(s3d8 + 0x18) | ld64(s3d8 + 0x10)) == 0) {
											if (ld64(s3d8 + 8) != 0) {
												if (ld64(s458 + 0x28) == ld64(s3d8)) {
													break B78
												}
												ErrorCode_name(s1c0, 0x1001598b8, dj, di)
												st64(s28, 0, 1, 0)
												st64(s48, s28, 0x10015f818)
												st8(s48 + 0x18, 3)
												st64(s48 + 0x10, 0x20)
												st64(s60 + 8, 0)
												st64(s68, 0)
												if (ErrorCode_fmt(0x1001598b8, s68) != 0) {
													fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
												}
												copyr(s168, s28, 0x18)
												copy(s180, s1c0, 0x18)
												st64(s1a0 + 8, 0x100159f83)
												st32(s140 + 0x38, 0x9c5 /* anchor::RequireEqViolated */)
												st8(s160 + 0x10, 2)
												st32(s1a0 + 0x18, 0x3ed)
												st64(s1a0 + 0x10, 0x25)
												st64(s1a0, 0)
												fn_13e5a0(s2c0, s1a0)
												r = fn_1730(s2d0, ld64(s2c0), ld64(s2c0 + 8), ld64(s3d8), ld64(s458 + 0x28))
												q = ld64(s2d0)
												f = ld64(s3d8 + 0x38)
												st64(f + 8, ld64(s2d0 + 8))
												st64(f, q)
												return r
											}
											if (ld64(s3d8 + 0x40) == ld64(s3d8)) {
												break B82
											}
											ErrorCode_name(s1c0, 0x1001598b8, dj, di)
											st64(s28, 0, 1, 0)
											st64(s48, s28, 0x10015f818)
											st8(s48 + 0x18, 3)
											st64(s48 + 0x10, 0x20)
											st64(s60 + 8, 0)
											st64(s68, 0)
											if (ErrorCode_fmt(0x1001598b8, s68) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copyr(s168, s28, 0x18)
											copy(s180, s1c0, 0x18)
											st64(s1a0 + 8, 0x100159f83)
											st32(s140 + 0x38, 0x9c5 /* anchor::RequireEqViolated */)
											st8(s160 + 0x10, 2)
											st32(s1a0 + 0x18, 0x3f3)
											st64(s1a0 + 0x10, 0x25)
											st64(s1a0, 0)
											fn_13e5a0(s2a0, s1a0)
											r = fn_1730(s2b0, ld64(s2a0), ld64(s2a0 + 8), ld64(s3d8), ld64(s3d8 + 0x40))
											q = ld64(s2b0)
											f = ld64(s3d8 + 0x38)
											st64(f + 8, ld64(s2b0 + 8))
											st64(f, q)
											return r
										}
									}
									if (ld64(s3d8 + 8) != 0) {
										break B78
									}
								}
								const ed = ld64(ld64(s3d8 + 0x30) + 0x48)
								r = fn_88360(s320, 0x26)
								p = ld64(s320 + 8)
								q = ld64(s320)
								if (ld64(s408 + 0x20) > ed) {
									f = ld64(s3d8 + 0x38)
									st64(f + 8, p)
									st64(f, q)
									return r
								}
								ec = ld64(s3d8 + 0x38)
								st64(ec + 8, ed - ld64(s408 + 0x20))
								st64(ec, 2)
								return fn_fc80(q, p, r)
							}
							const eb = ld64(ld64(s3d8 + 0x28) + 0x48)
							r = fn_88360(s350, 0x26)
							p = ld64(s350 + 8)
							q = ld64(s350)
							if (eb > ld64(s408 + 0x28)) {
								f = ld64(s3d8 + 0x38)
								st64(f + 8, p)
								st64(f, q)
								return r
							}
							ec = ld64(s3d8 + 0x38)
							st64(ec + 8, ld64(s408 + 0x28) - eb)
							st64(ec, 2)
							return fn_fc80(q, p, r)
						}
						du = ld64(s290 + 8)
						dt = ld64(s3d8 + 0x38)
						st64(dt, dh, du)
						return r
					}
					du = ld64(s280 + 8)
					dt = ld64(s3d8 + 0x38)
					st64(dt, dh, du)
					return r
				}
				fn_85138(s1c0, 0x100159824)
				st64(s28, 0, 1, 0)
				st64(s48, s28, 0x10015f818)
				st8(s48 + 0x18, 3)
				st64(s48 + 0x10, 0x20)
				st64(s60 + 8, 0)
				st64(s68, 0)
				const dc = fn_88558(0x100159824, s68)
				bm = ld64(s3d8 + 0x38)
				if (dc != 0) {
					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
				}
				copyr(s168, s28, 0x18)
				copy(s180, s1c0, 0x18)
				st64(s1a0 + 8, 0x100159f83)
				st32(s140 + 0x38, 0x1786 /* error::TooSmallInputOrOutputAmount */)
				st8(s160 + 0x10, 2)
				st32(s1a0 + 0x18, 0x390)
				st64(s1a0 + 0x10, 0x25)
				st64(s1a0, 0)
				aq = fn_13e5a0(s380, s1a0)
				bo = ld64(s380)
				st64(bm + 8, ld64(s380 + 8))
				st64(bm, bo)
				r = fn_f680(s1e0, aq)
				am = ld64(s420 + 0x10)
				st64(am, ld64(am) + 1)
				return r
			}
		}
		fn_85138(s1c0, 0x10015990c)
		st64(s28, 0, 1, 0)
		st64(s48, s28, 0x10015f818)
		st8(s48 + 0x18, 3)
		st64(s48 + 0x10, 0x20)
		st64(s60 + 8, 0)
		st64(s68, 0)
		if (fn_88558(0x10015990c, s68) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(s168, s28, 0x18)
		copy(s180, s1c0, 0x18)
		st64(s1a0 + 8, 0x100159f83)
		st32(s140 + 0x38, 0x1785 /* error::InvalidInputPoolVault */)
		st8(s160 + 0x10, 2)
		st32(s1a0 + 0x18, 0x35a)
		st64(s1a0 + 0x10, 0x25)
		st64(s1a0, 0)
		r = fn_13e5a0(s220, s1a0)
		const al = ld64(s220)
		const ak = ld64(s3d8 + 0x38)
		st64(ak + 8, ld64(s220 + 8))
		st64(ak, al)
		am = ld64(s420 + 0x10)
		st64(am, ld64(am) + 1)
		return r
	}
	ErrorCode_name(s1c0, 0x100159900, undef, z)
	st64(s28, 0, 1, 0)
	st64(s48, s28, 0x10015f818)
	st8(s48 + 0x18, 3)
	st64(s48 + 0x10, 0x20)
	st64(s60 + 8, 0)
	st64(s68, 0)
	if (ErrorCode_fmt(0x100159900, s68) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(s168, s28, 0x18)
	copy(s180, s1c0, 0x18)
	st64(s1a0 + 8, 0x100159f83)
	st32(s140 + 0x38, 0x9c9 /* anchor::RequireGtViolated */)
	st8(s160 + 0x10, 2)
	st32(s1a0 + 0x18, 0x358)
	st64(s1a0 + 0x10, 0x25)
	st64(s1a0, 0)
	fn_13e5a0(s200, s1a0)
	r = fn_1730(s210, ld64(s200), ld64(s200 + 8), aa, ld64(ld64(s408 + 0x18) + 0x430))
	const af = ld64(s210)
	const ae = ld64(s3d8 + 0x38)
	st64(ae + 8, ld64(s210 + 8))
	st64(ae, af)
	am = ld64(s1f0 + 8)
	st64(am, ld64(am) + 1)
	return r
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
function fn_8a8(a: u64, b: u64, c: u64): u64 {
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
	g = fn_13e070(s20, 0x100159320, 8)
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

// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: tick_array_state_data: TickArrayStateAccount
function fn_51c8(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
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
			const tick_array_state_data: TickArrayStateAccount = ld64(f + 0x18)
			const j = tick_array_state_data.discriminator
			if (j == 0x2a81f931cd559bc0 /* account:TickArrayState */) {
				if (h > 0x27ff) {
					st64(a + 0x10, f + 0x10)
					st64(a + 8, tick_array_state_data.pool_id)
					st64(a, 0)
					return r0
				}
				fn_153158(0x2800, h, 0x10015f718, 0x2a81f931cd559bc0 /* account:TickArrayState */, e)
			}
			r0 = anchor_error_from(s48, 0xbba /* anchor::AccountDiscriminatorMismatch */, j, 0x2a81f931cd559bc0 /* account:TickArrayState */, e)
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

function fn_f680(a: u64, r0: u64): u64 {
	const f = ld64(a + 0x18)
	if (f == 0) {
		return r0
	}
	let g = ld64(a)
	r0 = ld64(a + 0x10)
	const h = g > r0 ? 0 : g
	const j = r0 - h
	const i = g
	const k = f - (g - j)
	let q = k > f ? 0 : k
	g = f > g - j ? g : j + f
	const l = ld64(a + 8)
	if (g != j) {
		let n = g - j
		let m = l + ((r0 << 4) - (h << 4)) + 8
		do {
			r0 = ld64(m)
			st64(r0, ld64(r0) + 1)
			m = m + 0x10
			n = n - 1
		} while (n != 0)
	}
	if (i - j >= f) {
		return r0
	}
	let o = l + 8
	while (true) {
		const p = ld64(o)
		st64(p, ld64(p) + 1)
		o = o + 0x10
		q = q - 1
		if (q == 0) {
			return r0
		}
	}
}

function fn_14d20(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 {
	let h, i: u64
	let g = ld64(a)
	let f = ld64(a + 0x18)
	if (f == g) {
		r0 = fn_14b50(a, d)
		g = ld64(a)
		f = ld64(a + 0x18)
		h = ld64(a + 0x10) + f
		i = ld64(a + 8) + (h - (g > h ? 0 : g) << 4)
		st64(i + 8, c)
		st64(i, b)
		st64(a + 0x18, f + 1)
		return r0
	}
	h = ld64(a + 0x10) + f
	i = ld64(a + 8) + (h - (g > h ? 0 : g) << 4)
	st64(i + 8, c)
	st64(i, b)
	st64(a + 0x18, f + 1)
	return r0
}

// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: tick_array_state_data: TickArrayStateAccount
function fn_84be0(a: u64, b: AccountInfo): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90
	let o: u64
	const f = b.owner
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	let j = undef
	let k = undef
	let h = g as u32
	if (h != 0) {
		const n = anchor_error_from(s50, 0xbbf /* anchor::AccountOwnedByWrongProgram */, undef, j, k)
		const m = ld64(s50 + 8)
		const l = ld64(s50)
		copyr(s40, f, 0x20)
		st64(s20, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
		h = Error_with_pubkeys(s60, l, m, s40, n)
		o = ld64(s60)
		st64(a + 0x10, ld64(s60 + 8))
		st64(a + 8, o)
		st64(a, 1)
		return h
	}
	if (b.is_writable != 0) {
		const i: DataCell = b.data
		if (i.borrow == 0) {
			let q = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
			i.borrow = -1
			const p = i.len
			if (p >= 8) {
				q = 0xbba /* anchor::AccountDiscriminatorMismatch */
				const tick_array_state_data: TickArrayStateAccount = i.ptr
				j = tick_array_state_data.discriminator
				k = 0x2a81f931cd559bc0 /* account:TickArrayState */
				if (j == 0x2a81f931cd559bc0 /* account:TickArrayState */) {
					if (p > 0x27ff) {
						st64(a + 0x10, i + 0x10)
						st64(a + 8, tick_array_state_data.pool_id)
						st64(a, 0)
						return h
					}
					fn_153158(0x2800, p, 0x1001605d8, j, 0x2a81f931cd559bc0 /* account:TickArrayState */)
				}
			}
			h = anchor_error_from(s90, q, q, j, k)
			const r = ld64(s90)
			st64(a + 0x10, ld64(s90 + 8))
			st64(a + 8, r)
			st64(a, 1)
			i.borrow = i.borrow + 1
			return h
		}
		st64(s40, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		h = fn_13e628(s80, s40)
		o = ld64(s80)
		st64(a + 0x10, ld64(s80 + 8))
		st64(a + 8, o)
		st64(a, 1)
		return h
	}
	h = anchor_error_from(s70, 0xbbe /* anchor::AccountNotMutable */, undef, j, k)
	o = ld64(s70)
	st64(a + 0x10, ld64(s70 + 8))
	st64(a + 8, o)
	st64(a, 1)
	return h
}

function fn_14b50(a: u64, b: u64): u64 {
	let k, l: u64
	const f = ld64(a)
	let n = fn_15168(a, b)
	const g = ld64(a + 0x18)
	const h = ld64(a + 0x10)
	if (f - g >= h) {
		return n
	}
	const j = ld64(a)
	const i = g - (f - h)
	if (i >= f - h) {
		k = ld64(a + 8)
		l = j - (f - h)
		n = memmove(k + (l << 4), k + (h << 4), f - h << 4)
		st64(a + 0x10, l)
		return n
	}
	if (j - f >= i) {
		const m = ld64(a + 8)
		return memcpy(m + (f << 4), m, i << 4)
	}
	k = ld64(a + 8)
	l = j - (f - h)
	n = memmove(k + (l << 4), k + (h << 4), f - h << 4)
	st64(a + 0x10, l)
	return n
}

function fn_76320(a: u64, b: u64, c: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let h = fn_5ec0(s118, b)
	let g = ld64(s118 + 8)
	let f = ld64(s118)
	if (f != 2) {
		st64(a + 8, g)
		st64(a, f)
		return h
	}
	h = fn_49f0(s118, g, h)
	const i = ld64(s118 + 0x10)
	if (ld64(s118) != 0) {
		f = ld64(s118 + 8)
		st64(a + 8, i)
		st64(a, f)
		return h
	}
	const j = memcmp(ld64(s118 + 8), c, 0x20)
	st64(i, ld64(i) - 1)
	h = j as u32
	if (h == 0) {
		st64(a + 8, g)
		st64(a, 2)
		return h
	}
	fn_85138(s78, 0x10015987c)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x10015987c, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a7d4)
	st32(sf8 + 0x78, 0x17a3 /* error::InvalidTickArrayBitmapExtensionAccount */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0x3c)
	st64(s118 + 0x10, 0x35)
	st64(s118, 0)
	const k = fn_13e5a0(s128, s118)
	const o = ld64(s128 + 8)
	const l = ld64(s128)
	h = fn_49f0(s48, g, k)
	g = ld64(s48 + 0x10)
	if (ld64(s48) != 0) {
		f = ld64(s48 + 8)
		if (l != 0) {
			void ld64(o)
			void ld8(o + 0x38)
			st64(a + 8, g)
			st64(a, f)
			return h
		}
		void ld64(o)
		void ld8(o + 0x50)
		st64(a + 8, g)
		st64(a, f)
		return h
	}
	const m = ld64(s48 + 8)
	copy(s118, m, 0x20)
	copy(sf8, c, 0x20)
	h = Error_with_pubkeys(s138, l, o, s118, h)
	const n = ld64(s138 + 8)
	f = ld64(s138)
	st64(g, ld64(g) - 1)
	st64(a + 8, n)
	st64(a, f)
	return h
}

function fn_147a98(a: AccountInfo, b: u64, c: u64, d: u64, e: u64): u64 {
	const f: DataCell = a.data
	const g = f.borrow
	if (g > 0x7ffffffffffffffe) {
		fn_14e808(0x100161ef8, g, 0x7ffffffffffffffe, d, e)
	}
	return f.len
}

// types [heur]: b: AccountInfo (1 of 2 calls pass one, the others an untyped value: fn_3e038)
// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: observation_state_data: ObservationStateAccount
function fn_4fa8(a: u64, b: AccountInfo, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58
	let g, k: u64
	if (b.is_writable != 0) {
		const f: DataCell = b.data
		if (f.borrow == 0) {
			f.borrow = -1
			const h = f.len
			if (8 > h) {
				r0 = anchor_error_from(s58, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
				k = ld64(s58 + 8)
				st64(a + 8, ld64(s58))
				st64(a + 0x10, k)
				st64(a, 1)
				f.borrow = f.borrow + 1
				return r0
			}
			const observation_state_data: ObservationStateAccount = f.ptr
			const j = observation_state_data.discriminator
			if (j == 0x84a5098135c5ae7a /* account:ObservationState */) {
				if (h > 0x1182) {
					st64(a + 0x10, f + 0x10)
					st64(a + 8, observation_state_data + 8)
					st64(a, 0)
					return r0
				}
				fn_153158(0x1183, h, 0x10015f718, 0x84a5098135c5ae7a /* account:ObservationState */, e)
			}
			r0 = anchor_error_from(s48, 0xbba /* anchor::AccountDiscriminatorMismatch */, j, 0x84a5098135c5ae7a /* account:ObservationState */, e)
			k = ld64(s48 + 8)
			st64(a + 8, ld64(s48))
			st64(a + 0x10, k)
			st64(a, 1)
			f.borrow = f.borrow + 1
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

function fn_69b78(): u64 {
	const s18 = fp - 0x18, s40 = fp - 0x40, s48 = fp - 0x48
	clock_get(s48)
	if (ld64(s48) != 0) {
		copyr(s18, s40, 0x18)
		fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s18, 0x1001601f0, 0x100160210)
	}
	return ld64(s40 + 0x20)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: p7 (value), p8 (value), p9 (value), p11 (value)
function fn_374d0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s107 = fp - 0x107, s108 = fp - 0x108, s128 = fp - 0x128, s2ad = fp - 0x2ad, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s308 = fp - 0x308, s310 = fp - 0x310, s318 = fp - 0x318, s328 = fp - 0x328, s495 = fp - 0x495, s496 = fp - 0x496, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s50f = fp - 0x50f, s510 = fp - 0x510, s6f0 = fp - 0x6f0, s6f9 = fp - 0x6f9, s709 = fp - 0x709, s710 = fp - 0x710, s720 = fp - 0x720, s730 = fp - 0x730, s740 = fp - 0x740, s750 = fp - 0x750, s760 = fp - 0x760, s770 = fp - 0x770, s780 = fp - 0x780, s790 = fp - 0x790, s7a0 = fp - 0x7a0, s7b0 = fp - 0x7b0, s7c0 = fp - 0x7c0, s7d0 = fp - 0x7d0, s7e0 = fp - 0x7e0, s7f0 = fp - 0x7f0, s800 = fp - 0x800, s810 = fp - 0x810, s820 = fp - 0x820, s830 = fp - 0x830, s840 = fp - 0x840, s850 = fp - 0x850, s860 = fp - 0x860, s870 = fp - 0x870, s880 = fp - 0x880, s890 = fp - 0x890, s8a0 = fp - 0x8a0, s8b0 = fp - 0x8b0, s8c0 = fp - 0x8c0, s8d0 = fp - 0x8d0, s8e0 = fp - 0x8e0, s8f0 = fp - 0x8f0, s900 = fp - 0x900, s918 = fp - 0x918, s938 = fp - 0x938, s9a8 = fp - 0x9a8, s9c8 = fp - 0x9c8, s9e0 = fp - 0x9e0, s9f0 = fp - 0x9f0, sfe8 = fp - 0xfe8, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let p, q, ad, at, bf, bg, bh, bi, bn, bo, bq, br, by, cy, dc, dd, de, df, du, dv, en, eo, fe: u64
	const f = p7
	if (f != 0) {
		const g = ld64(c)
		if ((ld8(g + 0x17d) & 0x10) == 0) {
			B7: {
				st64(s9a8 + 0x68, b)
				st64(s938 + 0x18, d)
				st64(s918 + 0x10, p9)
				const i = p8
				st64(s918, p12, p11)
				let h = p10
				st64(s938, p6, p5)
				const k = ld64(g + 0xfd)
				const j = ld64(g + 0xf5)
				if (h != 0) {
					if ((ld64(s918 + 0x10) != 0 ? 0 : 0x100013b51 > i) != 0) {
						break B7
					}
					const l = k > ld64(s918 + 0x10)
					if (((k != ld64(s918 + 0x10) ? l : j > i) & 1) == 0) {
						break B7
					}
				} else {
					st64(s938 + 0x10, h)
					const m = ld64(s918 + 0x10) > 0xfffec4b1
					h = ld64(s938 + 0x10)
					if (((ld64(s918 + 0x10) != 0xfffec4b1 ? m : i > 0x845c1aa94e69579a) & 1) != 0) {
						break B7
					}
					const n = ld64(s918 + 0x10) > k
					if (((k != ld64(s918 + 0x10) ? n : i > j) & 1) == 0) {
						break B7
					}
				}
				st64(s9a8 + 0x48, i)
				st64(s9a8 + 0x50, f)
				const o = ld64(s918)
				q = fn_6c2a0(s328, g, o as u32)
				if (ld8(s328) != 0) {
					p = ld64(s328 + 8)
					st64(a + 0x10, ld64(s318))
					st64(a + 8, p)
					st64(a, 1)
					return q
				}
				st64(s938 + 0x10, h)
				st64(s9a8 + 0x58, a)
				st32(s710 + 3, ld32(s328 + 4))
				st32(s710, ld32(s328 + 1))
				const s = ld64(s328 + 8)
				const r = ld64(s318)
				st64(s9a8 + 0x60, g)
				memcpy(s510, s310, 0x1e4)
				const t = ld64(s9a8 + 0x60)
				const v = memcpy(s6f9, s510, 0x1e4)
				st64(s709, s, r)
				const u = ld16(t + 0x17f)
				st64(s9a8 + 0x38, t + 0x17f)
				st64(s938 + 8, ld64(ld64(s938 + 8)))
				st64(s328, 0x10015984c)
				st64(s2e8, u != 0 ? t + 0x17f : 1, (u != 0) << 1, t)
				st64(s308 + 0x10, t + 0x61)
				st64(s308, t + 0x41)
				st64(s9a8 + 0x40, t + 1)
				st64(s318, t + 1)
				st64(s2e8 + 0x18, 1)
				st64(s2f0, 0x20)
				st64(s308 + 8, 0x20)
				st64(s310, 0x20)
				st64(s328 + 8, 4)
				st64(s108, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
				// PDA create_program_address(["pool", *(t + 1), *(t + 0x41), *(t + 0x61), (u != 0 ? t + 0x17f : 1)[..(u != 0) << 1], t[..1]], program *s108)
				Pubkey_create_program_address(s510, s328, 6, s108, v)
				if (ld8(s510) != 1) {
					copyr(s48, s50f, 0x20)
					const w = ld64(s938 + 8)
					if ((memcmp(w + 0xb, s48, 0x20) as u32) == 0) {
						q = fn_6e930(s328, ld64(s9a8 + 0x60), ld64(s938), ld64(s938 + 0x10))
						ad = ld64(s328)
						if (ad == 2) {
							st64(s9a8 + 0x40, ld32(s328 + 0xc))
							const ag = ld8(s328 + 8)
							const ae = ld64(s938 + 0x18)
							let ar = fn_14c70(s760, ae, undef, undef, q)
							const af = ld64(s760)
							const bb = ld64(s9a8 + 0x58)
							if (af == 0) {
								q = fn_88360(s8f0, 0x17)
								const bc = ld64(s8f0)
								st64(bb + 0x10, ld64(s8f0 + 8))
								st64(bb + 8, bc)
								st64(bb, 1)
								return q
							}
							st64(s9a8 + 0x38, ag)
							let am = ld64(s760 + 8)
							const ah = ld64(ae + 0x18)
							let ao = af
							if (ah != 0) {
								let ai = 0
								while (ld32(ao + 0x20) != ld64(s9a8 + 0x40)) {
									const ap = ld64(s938 + 0x18)
									const aq = ld64(ap + 0x18)
									if (aq == 0) {
										q = fn_88360(s770, 0x17)
										bh = ld64(s770)
										bg = ld64(s9a8 + 0x58)
										st64(bg + 0x10, ld64(s770 + 8))
										st64(bg + 8, bh)
										st64(bg, 1)
										st64(am, ld64(am) + 1)
										return q
									}
									st64(ap + 0x18, aq - 1)
									ar = ld64(ap)
									const ak = ld64(ap + 0x10)
									ai = ai + 1
									const aj = ld64(s938 + 0x18)
									st64(aj + 0x10, ak + 1 - (ar > ak + 1 ? 0 : ar))
									const al = ld64(aj + 8) + (ak << 4)
									ao = ld64(al)
									const an = ld64(al + 8)
									st64(am, ld64(am) + 1)
									am = an
									if (ai >= ah) {
										break
									}
								}
							}
							fn_6a5a8(s328, ld64(s9a8 + 0x60), ar)
							if ((memcmp(ao, s328, 0x20) as u32) == 0) {
								if (ld32(ao + 0x20) == ld64(s9a8 + 0x40)) {
									const bd = ld64(s9a8 + 0x60)
									const be = ld8(bd + 0x17e)
									st64(s9c8 + 0x10, am)
									st64(s9a8 + 0x18, ao)
									if (be == 1) {
										bf = ld64(s938 + 0x10)
										bi = bf
									} else {
										bf = ld64(s938 + 0x10)
										bi = be != 2 ? 1 : bf ^ 1
									}
									st64(s9a8 + 0x10, bi)
									const bj = ld32(ld64(s9a8 + 0x68) + 0x5c)
									st64(s1000, bf, o as u32)
									q = fn_34bd0(s328, bd, ld64(s9a8 + 0x50), bj, bf, o as u32)
									const bl = ld64(s328 + 8)
									const bm = ld64(s328)
									const bk = ld8(s2e8 + 0x3a)
									if (bk == 2) {
										en = ld64(s9a8 + 0x58)
										st64(en + 0x10, bl)
										st64(en + 8, bm)
										st64(en, 1)
										am = ld64(s9c8 + 0x10)
										st64(am, ld64(am) + 1)
										return q
									}
									B121: {
										memcpy(s500, s318, 0x6a)
										memcpy(s495, s2ad, 0x55)
										st8(s496, bk)
										st64(s50f + 7, bl)
										bo = ld64(s500 + 8)
										bn = ld64(s500)
										st64(s510, bm)
										if (bm != 0 && (bn ^ ld64(s9a8 + 0x48) | bo ^ ld64(s918 + 0x10)) != 0) {
											const bp = ld64(s9a8 + 0x68)
											st64(s9e0 + 8, ld32(bp + 0x60))
											st64(s9e0, ld32(bp + 0x58))
											L47: while (true) {
												B144: {
													q = fn_723c8(s328, ld64(s9a8 + 0x18), ld32(s4f0 + 0x48), ld16(ld64(s9a8 + 0x60) + 0xe3), ld64(s938 + 0x10))
													br = ld64(s328 + 8)
													bq = ld64(s328)
													if (bq == 2) {
														B133: {
															if (br == 0) {
																if ((ld64(s9a8 + 0x38) & 1) != 0) {
																	q = fn_6f068(s328, ld64(s9a8 + 0x60), ld64(s938), ld64(s9a8 + 0x40), ld64(s938 + 0x10))
																	bq = ld64(s328)
																	if (bq != 2) {
																		break B133
																	}
																	const bt = ld32(s328 + 0xc)
																	st64(s9a8 + 0x40, 0x10)
																	const bs = ld32(s328 + 8)
																	if (bs != 0) {
																		st64(s9a8 + 0x40, bt)
																	}
																	if (bs == 0) {
																		q = fn_88360(s8e0, 0x10)
																		br = ld64(s8e0 + 8)
																		bq = ld64(s8e0)
																		break B144
																	}
																	let bu = ld64(s9a8 + 0x18)
																	let bv = ld32(bu + 0x20)
																	let bw = ld64(s9c8 + 0x10)
																	let bx = ld64(s938 + 0x18)
																	if (bv != bt) {
																		let bz = bw
																		do {
																			const ca = fn_14c70(s7c0, bx, bv, by, q)
																			bu = ld64(s7c0)
																			if (bu == 0) {
																				q = fn_88360(s7f0, 0x17)
																				br = ld64(s7f0 + 8)
																				bq = ld64(s7f0)
																				st64(s9c8 + 0x10, bz)
																				break B144
																			}
																			bw = ld64(s7c0 + 8)
																			st64(bz, ld64(bz) + 1)
																			fn_6a5a8(s328, ld64(s9a8 + 0x60), ca)
																			const cb = memcmp(bu, s328, 0x20)
																			q = cb as u32
																			if (q != 0) {
																				st64(s9c8 + 0x10, bw)
																				ErrorCode_name(s60, 0x100159874, undef, by)
																				st64(s128, 0, 1, 0)
																				st64(s28, s128, 0x10015f818)
																				st8(s28 + 0x18, 3)
																				st64(s28 + 0x10, 0x20)
																				st64(s48 + 0x10, 0)
																				st64(s48, 0)
																				if (ErrorCode_fmt(0x100159874, s48) != 0) {
																					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
																				}
																				copyr(s2f0, s128, 0x18)
																				copy(s308, s60, 0x18)
																				st64(s328 + 8, 0x100159f83)
																				st32(s2ad + 0x1d, 0x9c6 /* anchor::RequireKeysEqViolated */)
																				st8(s2e8 + 0x10, 2)
																				st32(s310, 0x25e)
																				st64(s318, 0x25)
																				st64(s328, 0)
																				const fh = fn_13e5a0(s7d0, s328)
																				const fj = ld64(s7d0 + 8)
																				const fi = ld64(s7d0)
																				copyr(s48, bu, 0x20)
																				const fk = fn_6a5a8(s308, ld64(s9a8 + 0x60), fh)
																				copyr(s328, s48, 0x20)
																				q = Error_with_pubkeys(s7e0, fi, fj, s328, fk)
																				br = ld64(s7e0 + 8)
																				bq = ld64(s7e0)
																				break B144
																			}
																			bv = ld64(s9a8 + 0x40) as u32
																			bz = bw
																			bx = ld64(s938 + 0x18)
																		} while (ld32(bu + 0x20) != bv)
																	}
																	st64(s9c8 + 0x10, bw)
																	st64(s9a8 + 0x18, bu)
																	q = fn_71ee0(s328, bu, ld64(s938 + 0x10), q)
																	st64(s9a8 + 0x38, 1)
																	br = ld64(s328 + 8)
																	bq = ld64(s328)
																	if (bq != 2) {
																		break B144
																	}
																} else {
																	q = fn_71ee0(s328, ld64(s9a8 + 0x18), ld64(s938 + 0x10), q)
																	st64(s9a8 + 0x38, 1)
																	br = ld64(s328 + 8)
																	bq = ld64(s328)
																	if (bq != 2) {
																		break B144
																	}
																}
															}
															const cf = memcpy(s108, br, 0xa8)
															let cd = ld64(s107 + 0x83)
															const cc = ld64(s107 + 0x7b)
															if ((ld64(s107 + 0x13) | ld64(s107 + 0x1b)) == 0 && (cc == 0 && cd == 0)) {
																ErrorCode_name(s60, 0x1001598b8)
																st64(s128, 0, 1, 0)
																st64(s28, s128, 0x10015f818)
																st8(s28 + 0x18, 3)
																st64(s28 + 0x10, 0x20)
																st64(s48 + 0x10, 0)
																st64(s48, 0)
																if (ErrorCode_fmt(0x1001598b8, s48) != 0) {
																	fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
																}
																copyr(s2f0, s128, 0x18)
																copy(s308, s60, 0x18)
																st64(s328 + 8, 0x100159f83)
																st32(s2ad + 0x1d, 0x9c5 /* anchor::RequireEqViolated */)
																st8(s2e8 + 0x10, 2)
																st32(s310, 0x26b)
																st64(s318, 0x25)
																st64(s328, 0)
																fn_13e5a0(s8c0, s328)
																q = fn_1c78(s8d0, ld64(s8c0), ld64(s8c0 + 8), 0)
																br = ld64(s8d0 + 8)
																bq = ld64(s8d0)
																break B144
															}
															st64(s9c8 + 0x18, cc)
															const ce = ld32(s108)
															st64(sff8, ld64(s918 + 0x10))
															st64(s1000, ld64(s9a8 + 0x48))
															q = fn_35ae8(s328, s510, ce, ld64(s938 + 0x10), ld64(s1000), ld64(sff8), cf)
															br = ld64(s318)
															bq = ld64(s328 + 8)
															const cg = ld64(s328)
															st64(s9a8 + 0x30, bq)
															st64(s9a8 + 0x68, br)
															if (cg != 0) {
																break B144
															}
															st64(s9f0, ld64(s4f0 + 0x30))
															st64(s9f0 + 8, ld64(s4f0 + 0x28))
															while (true) {
																if (ld8(s496) == 1) {
																	const dt = (ld32(s495 + 0xe) as i32) - (ld32(s4f0 + 0x54) as i32)
																	if ((dt as i32) != dt) {
																		fn_154788(0x100160290, dt as i32, bq, du, dv)
																	}
																	st32(s495 + 0x16, min((((dt as i32) ^ sar(dt as i32, 0x3f)) - sar(dt as i32, 0x3f)) * 0x2710 + ld32(s495 + 0x12), ld32(s495 + 0xa)))
																}
																q = fn_37228(s328, s510, bq, du, dv, q)
																br = ld64(s328 + 8)
																bq = ld64(s328)
																if (bq != 2) {
																	break B144
																}
																st64(s9a8 + 0x28, ld32(s328 + 8))
																q = fn_36ed8(s328, s510, ld64(s9a8 + 0x30), ld64(s9a8 + 0x68), ld64(s938 + 0x10))
																let dp = ld32(s318 + 4)
																if (dp == 2) {
																	bq = ld64(s328)
																	break
																}
																let cj = ld64(s328 + 8)
																const dw = ld64(s500 + 8)
																let cl = ld64(s328)
																const dx = ld64(s500)
																let dn = ld32(s310)
																st64(s9a8 + 0x20, ld8(s318))
																st64(s9a8, cl, cj)
																if ((dx ^ cl | dw ^ cj) != 0) {
																	st64(s9c8, dn, dp)
																	const eh = cd
																	const ec = ld64(s4f0 + 0x28)
																	const eb = ld64(s4f0 + 0x30)
																	const ea = ld64(s510)
																	const dy = ld64(s9a8 + 0x10)
																	st64(sfe8 + 0x20, dy)
																	st64(sfe8 + 0x18, ld64(s938 + 0x10))
																	const dz = ld64(s918 + 8)
																	st64(sfe8 + 0x10, dz)
																	st64(sfe8 + 8, ld64(s9a8 + 0x28))
																	st64(sff8, ec, eb, ea)
																	st64(s1000, ld64(s9a8 + 8))
																	q = fn_60198(s328, dx, dw, ld64(s9a8), ld64(s1000), ec, eb, ea, ld64(sfe8 + 8), dz, ld64(sfe8 + 0x18), dy)
																	const eg = ld64(s328 + 8)
																	if (ld64(s328) != 0) {
																		br = ld64(s318)
																		bq = eg
																		break B144
																	}
																	st64(s9e0 + 0x10, ld64(s318))
																	const ef = ld64(s308)
																	const ee = ld64(s310)
																	const ed = ld64(s308 + 8)
																	copyr(sfe8, s9e0, 0x10)
																	st64(s1000, ed, dz, dy)
																	q = fn_35270(s800, s510, ee, ef, ed, dz, dy, ld64(sfe8), ld64(sfe8 + 8))
																	bq = ld64(s800)
																	cl = eg
																	cj = ld64(s9e0 + 0x10)
																	cd = eh
																	dn = ld64(s9c8)
																	dp = ld64(s9c8 + 8)
																	if (bq != 2) {
																		br = ld64(s800 + 8)
																		break B144
																	}
																}
																const ch = ld64(s9c8 + 0x18)
																if (ch > ch + cd) {
																	st64(s9c8 + 8, dp)
																	q = fn_88360(s810, 0x26)
																	dp = ld64(s9c8 + 8)
																	br = ld64(s810 + 8)
																	bq = ld64(s810)
																	st64(s9c8, br)
																	if (bq != 2) {
																		break B144
																	}
																} else {
																	st64(s9c8, cd + ch)
																}
																B102: {
																	const ci = ld64(s4f0 + 0x40)
																	const ck = ld64(s4f0 + 0x38)
																	if ((ck ^ cl | ci ^ cj) == 0) {
																		const cw = cl
																		const co = ld64(s510)
																		st64(sfe8, ck, ci)
																		const cm = ld64(s9a8 + 0x10)
																		st64(sff0, cm)
																		st64(sff8, ld64(s9a8 + 0x28))
																		const cn = ld64(s918 + 8)
																		st64(s1000, cn)
																		q = fn_735f0(s328, s108, co, ld64(s938 + 0x10), cn, ld64(sff8), cm, ck, ci)
																		bq = ld64(s328 + 8)
																		if (ld64(s328) != 0) {
																			br = ld64(s318)
																			break B144
																		}
																		const cp = ld64(s318)
																		const cq = ld64(s310)
																		if ((cp | bq | cq) != 0) {
																			copyr(sfe8, s9e0, 0x10)
																			st64(s1000, cq, cn, cm)
																			q = fn_35270(s820, s510, bq, cp, cq, cn, cm, ld64(sfe8), ld64(sfe8 + 8))
																			bq = ld64(s820)
																			if (bq != 2) {
																				br = ld64(s820 + 8)
																				break B144
																			}
																		}
																		B91: {
																			const cs = ld64(s107 + 0x1b)
																			const cr = ld64(s107 + 0x13)
																			const cu = ld64(s107 + 0x83)
																			const ct = ld64(s107 + 0x7b)
																			if ((cr | cs) == 0 && (ct == 0 && cu == 0)) {
																				const cv = ld64(s9a8 + 0x18)
																				const cx = ld8(cv + 0x2784)
																				cl = cw
																				if (cx == 0) {
																					q = fn_88360(s830, 0x26)
																					br = ld64(s830 + 8)
																					bq = ld64(s830)
																					if (bq != 2) {
																						break B144
																					}
																					cy = ld8(ld64(s9a8 + 0x18) + 0x2784)
																				} else {
																					cy = cx - 1
																					st8(cv + 0x2784, cy)
																				}
																				if ((cy as u8) != 0) {
																					break B91
																				}
																				q = fn_6d670(s840, ld64(s9a8 + 0x60), ld64(s938), ld32(ld64(s9a8 + 0x18) + 0x20))
																				br = ld64(s840 + 8)
																				bq = ld64(s840)
																				if (bq == 2) {
																					break B91
																				}
																				break B144
																			}
																			cl = cw
																			if ((cr | cs) != 0 && (ct == 0 && cu == 0)) {
																				const cz = ld64(s9a8 + 0x60)
																				const da = ld8(cz + 0x17e)
																				const db = ld64(s938 + 0x10)
																				if (da != 1 && (da == 2 || db == 0)) {
																					dd = ld64(s4f0 + 8)
																					dc = ld64(s4f0)
																					df = ld64(cz + 0x115)
																					de = ld64(cz + 0x10d)
																				} else {
																					df = ld64(s4f0 + 8)
																					de = ld64(s4f0)
																					dd = ld64(cz + 0x125)
																					dc = ld64(cz + 0x11d)
																				}
																				st64(s1000, dc, dd, s710)
																				fn_72aa0(s850, s108, de, df, dc, dd, s710)
																				let dh = ld64(s850 + 8)
																				let dg = ld64(s850)
																				if (db != 0) {
																					const dq = dg | dh ^ 0x8000000000000000
																					if (dq == 0) {
																						fn_154838(0x10015fd58, dq, undef, dg, dh)
																					}
																					const dr = dg != 0
																					dg = -dg
																					dh = -(dh + dr)
																				}
																				q = fn_5b258(s328, ld64(s4f0 + 0x28), ld64(s4f0 + 0x30), dg, dh)
																				br = ld64(s318)
																				bq = ld64(s328 + 8)
																				const di = ld64(s328)
																				st64(s9f0, br, bq)
																				cl = cw
																				if (di != 0) {
																					break B144
																				}
																			}
																		}
																		st64(s9a8 + 0x28, ld16(ld64(s9a8 + 0x60) + 0xe3))
																		const dj = ld32(s108)
																		memcpy(s328, s108, 0xa8)
																		q = fn_71878(s860, ld64(s9a8 + 0x18), dj, ld64(s9a8 + 0x28), s328)
																		bq = ld64(s860)
																		if (bq != 2) {
																			br = ld64(s860 + 8)
																			break B144
																		}
																		cd = ld64(s107 + 0x83)
																		const dk = ld64(s107 + 0x7b)
																		st64(s9c8 + 0x18, dk)
																		const dl = dk | cd
																		const dm = ld64(s938 + 0x10)
																		dn = ld32(s4f0 + 0x4c)
																		if ((dl == 0) == dm) {
																			dn = (dn as i32) - 1
																			if ((dn as i32) != dn) {
																				fn_154788(0x10015fd70, dl, dm)
																			}
																		}
																	} else {
																		if ((ld64(s500) ^ cl | ld64(s500 + 8) ^ cj) == 0) {
																			break B102
																		}
																		if (dp != 1 || (cl ^ ld64(s9a8) | cj ^ ld64(s9a8 + 8)) != 0) {
																			q = fn_65410(s328, cl, cj)
																			br = ld64(s328 + 8)
																			dn = ld32(s328 + 8)
																			bq = ld64(s328)
																			if (bq != 2) {
																				break B144
																			}
																		}
																	}
																	st32(s4f0 + 0x48, dn)
																}
																st64(s500, cl, cj)
																q = fn_36b38(s870, s510, ld64(s938 + 0x10), ld64(s9a8 + 0x20) & 1, q)
																bo = ld64(s500 + 8)
																bn = ld64(s500)
																const ds = ld64(s510)
																if (ds != 0) {
																	bq = ld64(s9a8 + 0x68)
																	if ((bn ^ ld64(s9a8 + 0x30) | bo ^ bq) != 0) {
																		continue
																	}
																}
																let ei = ld64(s9c8 + 0x18)
																bq = cd
																if (ei > ei + cd) {
																	q = fn_88360(s880, 0x26)
																	ei = undef
																	br = ld64(s880 + 8)
																	bq = ld64(s880)
																	if (bq != 2) {
																		break B144
																	}
																} else {
																	br = bq + ld64(s9c8 + 0x18)
																}
																if (ds != 0 && (br != ld64(s9c8) && br != 0)) {
																	const fl = br
																	ErrorCode_name(s60, 0x1001598b8, bq, ei, dv)
																	st64(s128, 0, 1, 0)
																	st64(s28, s128, 0x10015f818)
																	st8(s28 + 0x18, 3)
																	st64(s28 + 0x10, 0x20)
																	st64(s48 + 0x10, 0)
																	st64(s48, 0)
																	if (ErrorCode_fmt(0x1001598b8, s48) != 0) {
																		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
																	}
																	copyr(s2f0, s128, 0x18)
																	copy(s308, s60, 0x18)
																	st64(s328 + 8, 0x100159f83)
																	st32(s2ad + 0x1d, 0x9c5 /* anchor::RequireEqViolated */)
																	st8(s2e8 + 0x10, 2)
																	st32(s310, 0x313)
																	st64(s318, 0x25)
																	st64(s328, 0)
																	fn_13e5a0(s890, s328)
																	q = fn_36a0(s8a0, ld64(s890), ld64(s890 + 8), fl)
																	br = ld64(s8a0 + 8)
																	bq = ld64(s8a0)
																	break B144
																}
																st64(s4f0 + 0x30, ld64(s9f0))
																st64(s4f0 + 0x28, ld64(s9f0 + 8))
																if (ds == 0) {
																	break B121
																}
																if ((bn ^ ld64(s9a8 + 0x48) | bo ^ ld64(s918 + 0x10)) != 0) {
																	continue L47
																}
																break B121
															}
														}
														br = ld64(s328 + 8)
													}
												}
												en = ld64(s9a8 + 0x58)
												st64(en + 0x10, br)
												st64(en + 8, bq)
												st64(en, 1)
												am = ld64(s9c8 + 0x10)
												st64(am, ld64(am) + 1)
												return q
											}
										}
									}
									const ek = ld32(ld64(s9a8 + 0x60) + 0x105)
									const ej = ld32(s4f0 + 0x48)
									const em = ld64(s938 + 0x10)
									st64(s918 + 0x10, ej)
									if (ej != ek) {
										fn_69990(ld64(s938 + 8), ld64(s918), ek)
									}
									const el = ld8(ld64(s9a8 + 0x60) + 0x17e)
									if (el == 2) {
										eo = 0
										fe = ld64(s9a8 + 0x58)
									} else {
										fe = ld64(s9a8 + 0x58)
										eo = el != 1 ? em : 1
									}
									st64(sff8, eo)
									st64(s1000, ld64(s918 + 8))
									q = fn_35900(s328, s510, ld64(s9a8 + 0x50), em, ld64(s1000), eo)
									const ep = ld64(s328 + 8)
									if (ld64(s328) != 0) {
										st64(fe + 0x10, ld64(s318))
										st64(fe + 8, ep)
										st64(fe, 1)
										am = ld64(s9c8 + 0x10)
										st64(am, ld64(am) + 1)
										return q
									}
									st64(s918, ep)
									st64(s938 + 0x18, ld64(s308))
									copyr(s938, s318, 0x10)
									st64(s918 + 8, ld64(s4f0 + 0x28))
									const ev = ld64(s4f0 + 0x30)
									const eu = ld64(s4f0 + 0x10)
									const et = ld64(s4f0 + 0x18)
									const es = ld64(s4f0 + 0x20)
									const er = ld64(s4f0)
									const eq = ld64(s4f0 + 8)
									st64(sff0, ev, eu, et, es, er, eq, em, s496)
									st64(sff8, ld64(s918 + 8))
									st64(s1000, bo)
									const ew = ld64(s9a8 + 0x60)
									q = fn_6f9d8(s8b0, ew, ld64(s918 + 0x10), bn, bo, ld64(sff8), ev, eu, et, es, er, eq, em, s496)
									const ex = ld64(s8b0)
									if (ex == 2) {
										const fc = ld64(ew + 0xfd)
										const fb = ld64(ew + 0xf5)
										const fa = ld64(ew + 0xed)
										const ez = ld64(ew + 0xe5)
										const ey = ld32(ew + 0x105)
										q = ld64(s9a8 + 0x58)
										copy(q + 0x30, s938, 0x10)
										st64(q + 0x40, ld64(s938 + 0x18))
										st32(q + 0x48, ey)
										st64(q + 0x18, ez, fa)
										st64(q + 8, fb, fc)
										st64(q + 0x28, ld64(s918))
										st64(q, 0)
										const fd = ld64(s9c8 + 0x10)
										st64(fd, ld64(fd) + 1)
										return q
									}
									const fg = ld64(s8b0 + 8)
									const ff = ld64(s9a8 + 0x58)
									st64(ff + 8, ex, fg)
									st64(ff, 1)
									am = ld64(s9c8 + 0x10)
									st64(am, ld64(am) + 1)
									return q
								}
								fn_85138(s48, 0x1001598d4)
								st64(s108, 0, 1, 0)
								st64(s4f0, s108, 0x10015f818)
								st8(s4f0 + 0x18, 3)
								st64(s4f0 + 0x10, 0x20)
								st64(s500, 0)
								st64(s510, 0)
								if (fn_88558(0x1001598d4, s510) != 0) {
									fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
								}
								copyr(s2f0, s108, 0x18)
								copy(s308, s48, 0x18)
								st64(s328 + 8, 0x100159f83)
								st32(s2ad + 0x1d, 0x1788 /* error::InvalidFirstTickArrayAccount */)
								st8(s2e8 + 0x10, 2)
								st32(s310, 0x22a)
								st64(s318, 0x25)
								st64(s328, 0)
								fn_13e5a0(s7a0, s328)
								q = fn_3158(s7b0, ld64(s7a0), ld64(s7a0 + 8), ld32(ao + 0x20), ld64(s9a8 + 0x40))
								bh = ld64(s7b0)
								bg = ld64(s9a8 + 0x58)
								st64(bg + 0x10, ld64(s7b0 + 8))
								st64(bg + 8, bh)
								st64(bg, 1)
								st64(am, ld64(am) + 1)
								return q
							}
							const ba = am
							ErrorCode_name(s48, 0x100159874)
							st64(s108, 0, 1, 0)
							st64(s4f0, s108, 0x10015f818)
							st8(s4f0 + 0x18, 3)
							st64(s4f0 + 0x10, 0x20)
							st64(s500, 0)
							st64(s510, 0)
							if (ErrorCode_fmt(0x100159874, s510) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
							}
							copyr(s2f0, s108, 0x18)
							copy(s308, s48, 0x18)
							st64(s328 + 8, 0x100159f83)
							st32(s2ad + 0x1d, 0x9c6 /* anchor::RequireKeysEqViolated */)
							st8(s2e8 + 0x10, 2)
							st32(s310, 0x228)
							st64(s318, 0x25)
							st64(s328, 0)
							const au = fn_13e5a0(s780, s328)
							const aw = ld64(s780 + 8)
							const av = ld64(s780)
							copyr(s510, ao, 0x20)
							const ax = fn_6a5a8(s308, ld64(s9a8 + 0x60), au)
							copyr(s328, s510, 0x20)
							q = Error_with_pubkeys(s790, av, aw, s328, ax)
							const az = ld64(s790)
							const ay = ld64(s9a8 + 0x58)
							st64(ay + 0x10, ld64(s790 + 8))
							st64(ay + 8, az)
							st64(ay, 1)
							st64(ba, ld64(ba) + 1)
							return q
						}
						at = ld64(s9a8 + 0x58)
						st64(at + 0x10, ld64(s328 + 8))
						st64(at + 8, ad)
						st64(at, 1)
						return q
					}
					ErrorCode_name(s48, 0x100159874)
					st64(s108, 0, 1, 0)
					st64(s4f0, s108, 0x10015f818)
					st8(s4f0 + 0x18, 3)
					st64(s4f0 + 0x10, 0x20)
					st64(s500, 0)
					st64(s510, 0)
					if (ErrorCode_fmt(0x100159874, s510) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
					}
					copyr(s2f0, s108, 0x18)
					copy(s308, s48, 0x18)
					st64(s328 + 8, 0x100159f83)
					st32(s2ad + 0x1d, 0x9c6 /* anchor::RequireKeysEqViolated */)
					st8(s2e8 + 0x10, 2)
					st32(s310, 0x212)
					st64(s318, 0x25)
					st64(s328, 0)
					const aa = fn_13e5a0(s740, s328)
					st64(s918 + 0x10, ld64(s740 + 8))
					const ab = ld64(s740)
					copyr(s128, w + 0xb, 0x20)
					let z = 1
					const x = ld64(s9a8 + 0x60)
					const y = ld16(x + 0x17f)
					if (y != 0) {
						z = ld64(s9a8 + 0x38)
					}
					st64(s2e8 + 0x10, x)
					st64(s308 + 0x10, t + 0x61)
					st64(s308, t + 0x41)
					st64(s318, ld64(s9a8 + 0x40))
					st64(s328, 0x10015984c)
					st64(s2e8, z, (y != 0) << 1)
					st64(s2e8 + 0x18, 1)
					st64(s2f0, 0x20)
					st64(s308 + 8, 0x20)
					st64(s310, 0x20)
					st64(s328 + 8, 4)
					st64(s48, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
					// PDA create_program_address(["pool", *(ld64(s9a8 + 0x40)), *(t + 0x41), *(t + 0x61), z[..(y != 0) << 1], x[..1]], program *s48)
					const ac = Pubkey_create_program_address(s108, s328, 6, s48, aa)
					if (ld8(s108) != 1) {
						copyr(s4f0, s107, 0x20)
						copy(s510, s128, 0x20)
						q = Error_with_pubkeys(s750, ab, ld64(s918 + 0x10), s510, ac)
						ad = ld64(s750)
						at = ld64(s9a8 + 0x58)
						st64(at + 0x10, ld64(s750 + 8))
						st64(at + 8, ad)
						st64(at, 1)
						return q
					}
					st8(s510, ld8(s107))
					fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s510, 0x100160228, 0x100160248)
				}
				st8(s48, ld8(s50f))
				fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s48, 0x100160228, 0x100160248)
			}
			fn_85138(s108, 0x1001598d8)
			st64(s510, 0, 1, 0)
			st64(s6f0, s510, 0x10015f818)
			st8(s6f0 + 0x18, 3)
			st64(s6f0 + 0x10, 0x20)
			st64(s709 + 9, 0)
			st64(s710, 0)
			if (fn_88558(0x1001598d8, s710) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(s2f0, s510, 0x18)
			copy(s308, s108, 0x18)
			st64(s328 + 8, 0x100159f83)
			st32(s2ad + 0x1d, 0x177b /* error::SqrtPriceLimitOverflow */)
			st8(s2e8 + 0x10, 2)
			st32(s310, 0x205)
			st64(s318, 0x25)
			st64(s328, 0)
			q = fn_13e5a0(s730, s328)
			p = ld64(s730)
			st64(a + 0x10, ld64(s730 + 8))
			st64(a + 8, p)
			st64(a, 1)
			return q
		}
		fn_85138(s108, 0x10015982c)
		st64(s510, 0, 1, 0)
		st64(s6f0, s510, 0x10015f818)
		st8(s6f0 + 0x18, 3)
		st64(s6f0 + 0x10, 0x20)
		st64(s709 + 9, 0)
		st64(s710, 0)
		if (fn_88558(0x10015982c, s710) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(s2f0, s510, 0x18)
		copy(s308, s108, 0x18)
		st64(s328 + 8, 0x100159f83)
		st32(s2ad + 0x1d, 0x1770 /* error::NotApproved */)
		st8(s2e8 + 0x10, 2)
		st32(s310, 0x203)
		st64(s318, 0x25)
		st64(s328, 0)
		q = fn_13e5a0(s720, s328)
		p = ld64(s720)
		st64(a + 0x10, ld64(s720 + 8))
		st64(a + 8, p)
		st64(a, 1)
		return q
	}
	fn_85138(s108, 0x100159888)
	st64(s510, 0, 1, 0)
	st64(s6f0, s510, 0x10015f818)
	st8(s6f0 + 0x18, 3)
	st64(s6f0 + 0x10, 0x20)
	st64(s709 + 9, 0)
	st64(s710, 0)
	if (fn_88558(0x100159888, s710) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(s2f0, s510, 0x18)
	copy(s308, s108, 0x18)
	st64(s328 + 8, 0x100159f83)
	st32(s2ad + 0x1d, 0x1784 /* error::ZeroAmountSpecified */)
	st8(s2e8 + 0x10, 2)
	st32(s310, 0x201)
	st64(s318, 0x25)
	st64(s328, 0)
	q = fn_13e5a0(s900, s328)
	p = ld64(s900)
	st64(a + 0x10, ld64(s900 + 8))
	st64(a + 8, p)
	st64(a, 1)
	return q
}

function fn_16480(a: u64): u64 {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0xb8) & -8 : 0x300007f48
	if (g > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		st64(g, ld64(a))
		memcpy(g + 8, a + 8, 0xb0)
		return g
	}
	alloc_handle_alloc_error(8, 0xb8)
}

function fn_10fd98(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000007 >= g) {
		raw_vec_handle_error(1, 0x100, 0x100160b68, 0x300000007, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0xe2710826e8cdc640 /* event:SwapEvent */)
	st64(g + 0x20, ld64(b + 0x18))
	st64(g + 0x18, ld64(b + 0x10))
	st64(g + 0x10, ld64(b + 8))
	st64(g + 8, ld64(b))
	st64(g + 0x40, ld64(b + 0x38))
	st64(g + 0x38, ld64(b + 0x30))
	st64(g + 0x30, ld64(b + 0x28))
	st64(g + 0x28, ld64(b + 0x20))
	st64(g + 0x60, ld64(b + 0x58))
	st64(g + 0x58, ld64(b + 0x50))
	st64(g + 0x50, ld64(b + 0x48))
	st64(g + 0x48, ld64(b + 0x40))
	st64(g + 0x80, ld64(b + 0x78))
	copy(g + 0x68, b + 0x60, 0x18)
	copy(g + 0x88, b + 0x80, 0x20)
	st8(g + 0xa8, ld8(b + 0xd4))
	const h = ld64(b + 0xa0)
	st64(g + 0xb1, ld64(b + 0xa8))
	st64(g + 0xa9, h)
	const i = ld64(b + 0xb0)
	st64(g + 0xc1, ld64(b + 0xb8))
	st64(g + 0xb9, i)
	st32(g + 0xc9, ld32(b + 0xd0))
	copy(g + 0xcd, b + 0xc0, 0x10)
	st64(a + 8, g, 0xdd)
	st64(a, 0x100)
}

function log_data(a: u64, b: u64): u64 {
	return sol_log_data(a, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (points to it), p7 (points to it), p8 (value)
function fn_79050(a: u64, b: u64, c: AccountInfo, d: AccountInfo, p5: u64, p6: u64, p7: u64, p8: u64, r0: u64, r7: u64): u64 {
	const s10 = fp - 0x10, s40 = fp - 0x40, s48 = fp - 0x48, s70 = fp - 0x70, s78 = fp - 0x78, s90 = fp - 0x90, s98 = fp - 0x98, s100 = fp - 0x100, s118 = fp - 0x118, s138 = fp - 0x138, s140 = fp - 0x140, s148 = fp - 0x148, s158 = fp - 0x158, s170 = fp - 0x170, s178 = fp - 0x178, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1e8 = fp - 0x1e8, s218 = fp - 0x218, s230 = fp - 0x230, s238 = fp - 0x238, s240 = fp - 0x240, s268 = fp - 0x268, s270 = fp - 0x270, s278 = fp - 0x278
	let bq, br: u64
	let n = a
	let f = p7
	const g = p8
	st64(s1e8 + 0x40, f)
	if (g != 0) {
		st64(s1e8 + 0x20, b)
		const j: AccountInfo = p6
		const k: LamportsCell = j.lamports
		const l = k.strong
		st64(s1e8 + 0x30, p5)
		const s = j.key
		rc_inc(k, l)
		st64(s1e8 + 0x18, g)
		const m: DataCell = j.data
		rc_inc(m)
		st64(s1e8 + 0x10, n)
		const r = j.owner
		const q = j.rent_epoch
		const p = j.is_signer
		const o = j.is_writable
		st8(s158 + 2, j.executable)
		st8(s158, p, o)
		st64(s180, s, k, m, r, q)
		const t: LamportsCell = c.lamports
		st64(s1e8 + 0x38, t)
		const u = t.strong
		const w = c.key
		const y = ld64(s1e8 + 0x40)
		rc_inc(ld64(s1e8 + 0x38), u)
		const v: DataCell = c.data
		rc_inc(v)
		st64(s1e8, v, w)
		st64(s218 + 0x10, c.executable)
		st64(s218 + 0x18, c.is_writable)
		st64(s218 + 0x20, c.is_signer)
		st64(s218 + 0x28, c.rent_epoch)
		st64(s1e8 + 0x28, c.owner)
		const x = ld64(s1e8 + 0x30)
		st64(s158 + 8, x)
		memcpy(s148, y, 0x30)
		const z = ld8(s138 + 0x1a)
		if (x != 0 && z != 2) {
			const aa = ld64(ld64(s1e8 + 0x40))
			if ((memcmp(ld64(s1e8 + 0x28), aa, 0x20) as u32) == 0) {
				const bs: AccountInfo = ld64(s1e8 + 0x40)
				let bt = bs.lamports
				rc_inc(bt)
				const bu: DataCell = bs.data
				rc_inc(bu)
				st64(s230 + 0x10, bs.executable)
				st64(s218, bs.is_writable)
				st64(s218 + 8, bs.is_signer)
				let bw = bs.rent_epoch
				let bv = bs.owner
				if (rc_release(k)) {
					st64(s238, bw, bv, bt)
					Rc_drop_slow_14df0(s178, bw)
					bw = ld64(s238)
					bv = ld64(s230)
					bt = ld64(s230 + 8)
				}
				if (rc_release(m)) {
					st64(s230, bv, bt)
					Rc_drop_slow_14df0(s170, bw)
					bv = ld64(s230)
					bt = ld64(s230 + 8)
				}
				st8(s158 + 2, ld64(s230 + 0x10))
				st8(s158 + 1, ld64(s218))
				st8(s158, ld64(s218 + 8))
				st64(s180, aa, bt, bu, bv, bw)
			}
			const ab: LamportsCell = d.lamports
			st64(s218 + 8, ab)
			const ac = ab.strong
			st64(s218, d.key)
			rc_inc(ld64(s218 + 8), ac)
			const af: DataCell = d.data
			rc_inc(af)
			const aj: AccountInfo = ld64(ld64(s1e8 + 0x20))
			const ak: LamportsCell = aj.lamports
			const al = ak.strong
			st64(s230 + 0x10, d.executable)
			st64(s1e8 + 0x20, d.is_writable)
			const ao = d.is_signer
			const ba = d.rent_epoch
			const bi = d.owner
			st64(s230 + 8, aj.key)
			rc_inc(ak, al)
			st64(s230, ao)
			const ap: DataCell = aj.data
			rc_inc(ap)
			st64(s240, ba, ak)
			const bb: AccountInfo = ld64(ld64(s1e8 + 0x30) + 0x58)
			const bc: LamportsCell = bb.lamports
			const bd = bc.strong
			st64(s268 + 0x10, aj.executable)
			st64(s268 + 0x18, aj.is_writable)
			st64(s268 + 0x20, aj.is_signer)
			const bh = aj.rent_epoch
			const be = aj.owner
			const bg = bb.key
			rc_inc(bc, bd)
			st64(s268, be, af)
			const bf: DataCell = bb.data
			rc_inc(bf)
			st64(s278, bb.owner)
			st64(s270, bg)
			const bm = bb.rent_epoch
			const bl = bb.is_signer
			const bk = bb.is_writable
			const bj = bb.executable
			st8(s40 + 0x2a, ld64(s268 + 0x10))
			st8(s40 + 0x29, ld64(s268 + 0x18))
			st8(s40 + 0x28, ld64(s268 + 0x20))
			st64(s40 + 0x20, bh)
			st64(s40 + 0x18, ld64(s268))
			st64(s40 + 0x10, ap)
			st64(s40 + 8, ld64(s238))
			st64(s40, ld64(s230 + 8))
			st8(s48 + 2, ld64(s230 + 0x10))
			st8(s48 + 1, ld64(s1e8 + 0x20))
			st8(s48, ld64(s230))
			st64(s70 + 0x20, ld64(s240))
			st64(s70 + 0x18, bi)
			st64(s70 + 0x10, ld64(s268 + 8))
			copyr(s70, s218, 0x10)
			st8(s78, bl, bk, bj)
			st64(s90 + 0x10, bm)
			st64(s90 + 8, ld64(s278))
			st64(s98, bc, bf)
			st64(s100 + 0x60, ld64(s270))
			st8(s100 + 0x5a, ld64(s218 + 0x10))
			st8(s100 + 0x59, ld64(s218 + 0x18))
			st8(s100 + 0x58, ld64(s218 + 0x20))
			st64(s100 + 0x50, ld64(s218 + 0x28))
			st64(s100 + 0x48, ld64(s1e8 + 0x28))
			st64(s100 + 0x40, ld64(s1e8))
			st64(s100 + 0x38, ld64(s1e8 + 0x38))
			st64(s100 + 0x30, ld64(s1e8 + 8))
			st64(s118, 0, 8, 0)
			memcpy(s100, s180, 0x30)
			st64(s10, 8, 0)
			r0 = token_2022_transfer_checked(s190, s118, ld64(s1e8 + 0x18), ld8(ld64(s1e8 + 0x30) + 0x30))
			r7 = ld64(s190 + 8)
			br = ld64(s190)
			let bn = ld64(s1e8 + 0x40)
			const bo = ld64(bn + 8)
			if (rc_release(bo)) {
				r0 = Rc_drop_slow_14df0(bn + 8, r0)
				bn = ld64(s1e8 + 0x40)
			}
			const bp = ld64(bn + 0x10)
			bq = bn + 0x10
			n = ld64(s1e8 + 0x10)
			if (rc_release(bp)) {
				r0 = Rc_drop_slow_14df0(bq, r0)
				st64(n + 8, r7)
				st64(n, br)
				return r0
			}
			st64(n + 8, r7)
			st64(n, br)
			return r0
		}
		const ad: LamportsCell = d.lamports
		const aq = d.key
		rc_inc(ad)
		const ae: DataCell = d.data
		rc_inc(ae)
		st64(s1e8 + 0x40, z)
		const ag: AccountInfo = ld64(ld64(s1e8 + 0x20))
		const ah: LamportsCell = ag.lamports
		const ai = ah.strong
		st64(s218 + 8, d.executable)
		st64(s1e8 + 0x20, d.is_writable)
		st64(s1e8 + 0x30, d.is_signer)
		const am = d.rent_epoch
		const ar = d.owner
		const ax = ag.key
		rc_inc(ah, ai)
		st64(s218, am)
		const an: DataCell = ag.data
		rc_inc(an)
		const aw = ag.owner
		const av = ag.rent_epoch
		st64(s230 + 0x10, aq)
		const au = ag.is_signer
		st64(s230 + 8, ad)
		const at = ag.is_writable
		st8(s48 + 2, ag.executable)
		st8(s48, au, at)
		st64(s70, ax, ah, an, aw, av)
		st8(s78 + 2, ld64(s218 + 8))
		st8(s78 + 1, ld64(s1e8 + 0x20))
		st8(s78, ld64(s1e8 + 0x30))
		st64(s90 + 0x10, ld64(s218))
		st64(s90, ae, ar)
		st64(s98, ld64(s230 + 8))
		st64(s100 + 0x60, ld64(s230 + 0x10))
		st8(s100 + 0x5a, ld64(s218 + 0x10))
		st8(s100 + 0x59, ld64(s218 + 0x18))
		st8(s100 + 0x58, ld64(s218 + 0x20))
		st64(s100 + 0x50, ld64(s218 + 0x28))
		st64(s100 + 0x48, ld64(s1e8 + 0x28))
		st64(s100 + 0x40, ld64(s1e8))
		st64(s100 + 0x38, ld64(s1e8 + 0x38))
		st64(s100 + 0x30, ld64(s1e8 + 8))
		st64(s118, 0, 8, 0)
		memcpy(s100, s180, 0x30)
		st64(s40, 8, 0)
		r0 = token_transfer(s1a0, s118, ld64(s1e8 + 0x18))
		r7 = ld64(s1a0 + 8)
		br = ld64(s1a0)
		n = ld64(s1e8 + 0x10)
		if (ld64(s1e8 + 0x40) == 2) {
			st64(n + 8, r7)
			st64(n, br)
			return r0
		}
		const ay = ld64(s140)
		if (rc_release(ay)) {
			r0 = Rc_drop_slow_14df0(s140, r0)
		}
		const az = ld64(s138)
		bq = s138
		if (rc_release(az)) {
			r0 = Rc_drop_slow_14df0(bq, r0)
			st64(n + 8, r7)
			st64(n, br)
			return r0
		}
		st64(n + 8, r7)
		st64(n, br)
		return r0
	}
	if (ld8(f + 0x2a) == 2) {
		st64(n + 8, r7)
		st64(n, 2)
		return r0
	}
	const h = ld64(f + 8)
	if (rc_release(h)) {
		r0 = Rc_drop_slow_14df0(f + 8, r0)
		f = ld64(s1e8 + 0x40)
	}
	const i = ld64(f + 0x10)
	if (!rc_release(i)) {
		st64(n + 8, r7)
		st64(n, 2)
		return r0
	}
	r0 = Rc_drop_slow_14df0(f + 0x10, r0)
	st64(n + 8, r7)
	st64(n, 2)
	return r0
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

function memmove(a: u64, b: u64, c: u64): u64 {
	sol_memmove(a, b, c)
	return a
}

function fn_5ec0(a: u64, b: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	let k, p, q: u64
	const f = ld64(b + 0x18)
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
		if (ld64(ld64(i)) != 0x998b8061db24963c /* account:TickArrayBitmapExtension */) {
			q = anchor_error_from(s80, 0xbba /* anchor::AccountDiscriminatorMismatch */, 0x998b8061db24963c /* account:TickArrayBitmapExtension */)
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

// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: tick_array_bitmap_extension_data: TickArrayBitmapExtensionAccount
function fn_49f0(a: u64, b: u64, r0: u64): u64 {
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
	const tick_array_bitmap_extension_data: TickArrayBitmapExtensionAccount = ld64(g)
	const j = tick_array_bitmap_extension_data.discriminator
	if (j == 0x998b8061db24963c /* account:TickArrayBitmapExtension */) {
		if (h > 0x727) {
			st64(a + 0x10, k)
			st64(a + 8, tick_array_bitmap_extension_data.pool_id)
			st64(a, 0)
			return n
		}
		fn_153158(0x728, h, 0x10015f700, 0x998b8061db24963c /* account:TickArrayBitmapExtension */)
	}
	n = anchor_error_from(s38, 0xbba /* anchor::AccountDiscriminatorMismatch */, j, 0x998b8061db24963c /* account:TickArrayBitmapExtension */)
	m = ld64(s38)
	st64(a + 0x10, ld64(s38 + 8))
	st64(a + 8, m)
	st64(a, 1)
	st64(k, ld64(k) - 1)
	return n
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

function fn_14c70(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 {
	const f = ld64(b + 0x18)
	if (f == 0) {
		st64(a + 8, d)
		st64(a, 0)
		return r0
	}
	st64(b + 0x18, f - 1)
	const h = ld64(b)
	const g = ld64(b + 0x10)
	r0 = h > g + 1 ? 0 : h
	st64(b + 0x10, g + 1 - r0)
	const i = ld64(b + 8) + (g << 4)
	const j = ld64(i)
	st64(a + 8, ld64(i + 8))
	st64(a, j)
	return r0
}

// not included (size budget), see shared.ts:
declare function fn_7a038(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, r0: u64): u64
declare function fn_6c2a0(a: u64, b: u64, c: u64): u64
declare function fn_6e930(a: u64, b: u64, c: u64, d: u64): u64
declare function fn_6a5a8(a: u64, b: u64, r0: u64): u64
declare function fn_3158(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_34bd0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64
declare function fn_723c8(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_6f068(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_71ee0(a: u64, b: u64, c: u64, r0: u64): u64
declare function fn_35ae8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, r0: u64): u64
declare function fn_735f0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64): u64
declare function fn_35270(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64): u64
declare function fn_6d670(a: u64, b: u64, c: u64, d: u64): u64
declare function fn_72aa0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64)
declare function fn_5b258(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_71878(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_65410(a: u64, b: u64, c: u64): u64
declare function fn_36b38(a: u64, b: u64, c: u64, d: u64, r0: u64): u64
declare function fn_154788(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_37228(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64
declare function fn_36ed8(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_60198(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64): u64
declare function fn_69990(a: u64, b: u64, c: u64)
declare function fn_35900(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64
declare function fn_6f9d8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64, p12: u64, p13: u64, p14: u64): u64
declare function fn_1c78(a: u64, b: u64, c: u64, d: u64): u64
declare function fn_36a0(a: u64, b: u64, c: u64, d: u64): u64
declare function fn_154838(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_154730(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_14d4b8(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_155738(a: u64, b: u64): u64
