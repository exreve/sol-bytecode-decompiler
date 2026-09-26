// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction open_limit_order: handler + 36 reachable functions
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
interface OpenLimitOrderAccounts { // Accounts struct of instruction open_limit_order as accounts_open_limit_order returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	input_token_account: at<0x00, TokenAccount> // Account<TokenAccount> in place
}
interface OpenLimitOrderContext { // anchor_lang Context of instruction open_limit_order (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<OpenLimitOrderAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface OpenLimitOrderArgs extends sized<0x0e> { // arguments of instruction open_limit_order (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	nonce_index:  at<0x00, u8>
	zero_for_one: at<0x01, u8>
	tick_index:   at<0x02, u32>
	amount:       at<0x06, u64>
}
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_log_data(slices: u64, len: u64): void // log base64 data: slices = &[&[u8]]
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function try_accounts_120(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function fn_11e0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function try_accounts_1678(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::interface_account::InterfaceAccount<T> as anchor_lang::Accounts<B>…
declare function fn_3be8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_7498(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses try_accounts_1678, alloc_handle_alloc_error, memcpy
declare function fn_7768(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses try_accounts_15c0, alloc_handle_alloc_error, memcpy
declare function fn_a1d8(a: u64, b: u64, c: u64, d: u64): u64 // lib uses memcmp, common_is_closed
declare function fn_e948(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib uses Mint_unpack_from_slice_137968, raw_vec_handle_error, memset2, memcmp
declare function fn_f128(a: u64): u64 // lib uses alloc_handle_alloc_error, Error__new
declare function AccountInfo_clone_f338(a: u64, b: u64): u64 // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function ptr_drop_in_place_f5e8(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<solana_account_info::AccountInfo>
declare function ptr_drop_in_place_fcd8(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<solana_account_info::AccountInfo>
declare function Rc_drop_slow_14df0(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function fn_15cc8(a: u64, b: u64): u64 // lib
declare function try_accounts_17a30(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_18870(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function token_2022_transfer_checked(a: u64, b: u64, c: u64, d: u64): u64 // lib anchor_spl::token_2022::transfer_checked
declare function fn_132590(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses __multi3_159030, __udivti3
declare function Error_new_13c880(): u64 // lib std::io::error::Error::new
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
declare function fn_14de10(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a formatting trait implementation return…"
declare function fmt_write(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::write
declare function imp__fmt_154cb0(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u8>::_fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function fn_1561f0(a: u64, b: u64): u64 // lib

// instruction handler: open_limit_order (discriminator sha256("global:open_limit_order")[..8] = 0x93121d47b7da209d)
// accounts [idl]: 0 payer [signer, mut], 1 pool_state [mut], 2 tick_array [mut], 3 limit_order_nonce [mut], 4 limit_order [mut, pda], 5 input_token_account [mut], 6 output_token_account [mut], 7 input_vault [mut], 8 output_vault [mut], 9 input_vault_mint, 10 output_vault_mint, 11 input_token_program, 12 system_program [= 11111111111111111111111111111111]
// args [idl]: nonce_index: u8, zero_for_one: bool, tick_index: i32, amount: u64
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, nonce_index, zero_for_one, tick_index, amount
function ix_open_limit_order(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s10 = fp - 0x10, s160 = fp - 0x160, s170 = fp - 0x170, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2d2 = fp - 0x2d2, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s1000 = fp - 0x1000
	let l, o, p, q, r, s: u64
	B9: {
		const j = sol_log("Instruction: OpenLimitOrder", 0x1b)
		const f = ix_args_len
		if (f != 0 && f != 1) {
			const args: OpenLimitOrderArgs = ix_args
			const nonce_index = args.nonce_index
			const zero_for_one = args.zero_for_one
			st8(s2d2, zero_for_one)
			if (zero_for_one >= 2) {
				st64(s170, 0x10015f910)
				st64(s160, s10)
				st64(s10, s2d2, fn_154c88)
				st64(s160 + 0x10, 0)
				st64(s170 + 8, 1)
				st64(s160 + 8, 1)
				// fmt "Invalid bool representation: {}" {} = zero_for_one [fn_154c88]
				fn_14de10(s2d0, s170, nonce_index, args)
				l = fn_f128(s2d0)
				break B9
			}
			if (f - 2 >= 4 && f - 6 >= 8) {
				const tick_index = args.tick_index
				const amount = args.amount
				st16(s2d2, 0xffff)
				st64(s10, accounts, accounts_len)
				st64(s1000, f, s2d2)
				s = accounts_open_limit_order(s170, program_id, s10, args, fp, j)
				const k = ld8(s160 + 0x14c)
				if (k == 2) {
					r = ld64(s170)
					st64(a + 8, ld64(s170 + 8))
					st64(a, r)
					return s
				}
				const v = ld64(s170)
				const t = ld64(s170 + 8)
				const u = memcpy(s2c0, s160, 0x14c)
				st16(s2c0 + 0x14d, ld16(s160 + 0x14d))
				st8(s2c0 + 0x14f, ld8(s160 + 0x14f))
				st8(s2c0 + 0x14c, k)
				st64(s2d0, v, t)
				st8(s160 + 0x11, ld8(s2d2 + 1))
				st8(s160 + 0x10, ld8(s2d2))
				copyr(s160, s10, 0x10)
				st64(s170, program_id, s2d0)
				st64(s1000, tick_index, amount)
				s = fn_4f930(s2e8, s170, nonce_index, zero_for_one & 1, tick_index, amount, u)
				r = ld64(s2e8)
				if (r == 2) {
					s = fn_e4980(s2f8, s2d0, program_id)
					r = ld64(s2f8)
					st64(a + 8, ld64(s2f8 + 8))
					st64(a, r)
					return s
				}
				st64(a + 8, ld64(s2e8 + 8))
				st64(a, r)
				return s
			}
		}
		l = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	}
	const m = l
	if (2 > (l & 3) - 2) {
		s = anchor_error_from(s308, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		r = ld64(s308)
		st64(a + 8, ld64(s308 + 8))
		st64(a, r)
		return s
	}
	if ((m & 3) == 0) {
		s = anchor_error_from(s308, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		r = ld64(s308)
		st64(a + 8, ld64(s308 + 8))
		st64(a, r)
		return s
	}
	const n = ld64(ld64(l + 7))
	if (n == 0) {
		s = anchor_error_from(s308, 0x66 /* anchor::InstructionDidNotDeserialize */, o, p, q)
		r = ld64(s308)
		st64(a + 8, ld64(s308 + 8))
		st64(a, r)
		return s
	}
	callx(n, ld64(l - 1), n)
	s = anchor_error_from(s308, 0x66 /* anchor::InstructionDidNotDeserialize */)
	r = ld64(s308)
	st64(a + 8, ld64(s308 + 8))
	st64(a, r)
	return s
}

function fn_154c88(a: u64, b: u64): u64 {
	return imp__fmt_154cb0(ld8(a), 1, b)
}

// Anchor Accounts::try_accounts of instruction open_limit_order (called by ix_open_limit_order; name [str]: from the handler's "Instruction: …" log; was fn_dd5a0)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: input_token_account (ConstraintMut), output_token_account (ConstraintMut), input_vault (ConstraintMut, ConstraintRaw), output_vault (ConstraintMut, ConstraintRaw), input_vault_mint (ConstraintAddress), output_vault_mint (ConstraintAddress), input_token_program (ConstraintAddress), system_program, tick_array (ConstraintMut), pool_state (ConstraintMut), payer (ConstraintMut), limit_order (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), limit_order_nonce (ConstraintSeeds, ConstraintMut, ConstraintRentExempt)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: output_vault_mint_box, input_vault_box, output_vault_box, input_vault_box_2, output_vault_box_2, limit_order_nonce [idl], limit_order [idl], input_vault [idl], output_vault [idl]
function accounts_open_limit_order(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const sb8 = fp - 0xb8, sc0 = fp - 0xc0, sc8 = fp - 0xc8, sd0 = fp - 0xd0, sd8 = fp - 0xd8, sf8 = fp - 0xf8, s118 = fp - 0x118, s138 = fp - 0x138, s158 = fp - 0x158, s178 = fp - 0x178, s198 = fp - 0x198, s238 = fp - 0x238, s278 = fp - 0x278, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2c0 = fp - 0x2c0, s2e0 = fp - 0x2e0, s2e1 = fp - 0x2e1, s308 = fp - 0x308, s320 = fp - 0x320, s338 = fp - 0x338, s368 = fp - 0x368, s3a8 = fp - 0x3a8, s3c0 = fp - 0x3c0, s3e0 = fp - 0x3e0, s400 = fp - 0x400, s401 = fp - 0x401, s428 = fp - 0x428, s440 = fp - 0x440, s458 = fp - 0x458, s460 = fp - 0x460, s468 = fp - 0x468, s470 = fp - 0x470, s478 = fp - 0x478, s479 = fp - 0x479, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s598 = fp - 0x598, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s5c8 = fp - 0x5c8, s5d8 = fp - 0x5d8, s5e8 = fp - 0x5e8, s5f8 = fp - 0x5f8, s608 = fp - 0x608, s618 = fp - 0x618, s628 = fp - 0x628, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s668 = fp - 0x668, s678 = fp - 0x678, s688 = fp - 0x688, s698 = fp - 0x698, s6a8 = fp - 0x6a8, s6b8 = fp - 0x6b8, s6c8 = fp - 0x6c8, s6d8 = fp - 0x6d8, s6e8 = fp - 0x6e8, s6f8 = fp - 0x6f8, s708 = fp - 0x708, s718 = fp - 0x718, s728 = fp - 0x728, s738 = fp - 0x738, s748 = fp - 0x748, s758 = fp - 0x758, s768 = fp - 0x768, s778 = fp - 0x778, s788 = fp - 0x788, s798 = fp - 0x798, s7a8 = fp - 0x7a8, s7b8 = fp - 0x7b8, s7c8 = fp - 0x7c8, s7d8 = fp - 0x7d8, s7e8 = fp - 0x7e8, s7f8 = fp - 0x7f8, s808 = fp - 0x808, s818 = fp - 0x818, s828 = fp - 0x828, s838 = fp - 0x838, s848 = fp - 0x848, s858 = fp - 0x858, s890 = fp - 0x890, s898 = fp - 0x898, s8a0 = fp - 0x8a0, s8a8 = fp - 0x8a8, s8b0 = fp - 0x8b0, s8b8 = fp - 0x8b8, s8c0 = fp - 0x8c0, s8c8 = fp - 0x8c8, s8d0 = fp - 0x8d0, s8d8 = fp - 0x8d8, s8e0 = fp - 0x8e0, s8e8 = fp - 0x8e8, s8f0 = fp - 0x8f0
	let h, k, l, m, n, o, s, y, z, ad, ah, ai, aj, al, am, ao, ap, ar, at, av, aw, ay, az, bb, bc, by, bz, ck, cm, cn, cr, ct, cu: u64
	let output_vault_mint_box: Mint
	B6: {
		st64(s488, b)
		const f = ld64(e - 0x1000)
		if (f != 0 && f != 1) {
			const p = ld64(e - 0xff8)
			const q = ld8(d)
			const g = ld8(d + 1)
			st8(s2c0, g)
			if (g >= 2) {
				st64(sd8, 0x10015f910)
				st64(sc8, s278)
				st64(s278, s2c0, fn_154c88)
				st64(sb8, 0)
				st64(sd0, 1)
				st64(sc0, 1)
				// fmt "Invalid bool representation: {}" {} = g [fn_154c88]
				fn_14de10(s3c0, sd8, c, d, e)
				h = fn_f128(s3c0)
				break B6
			}
			if (f - 2 > 3) {
				st64(s890 + 0x30, p)
				st8(s479, q)
				try_accounts_17a30(sd8, c, c, d, e, r0)
				o = ld64(sd0)
				n = ld64(sd8)
				if (n == 2) {
					st64(s890 + 0x28, o)
					st64(s478, o)
					fn_11e0(sd8, c)
					o = ld64(sd0)
					n = ld64(sd8)
					if (n == 2) {
						const x = ld64(c + 8)
						if (x != 0) {
							ad = ld64(c)
							st64(c, ad + 0x30, x - 1)
							if (x == 1) {
								o = anchor_error_from(s848, 0xbbd /* anchor::AccountNotEnoughKeys */, ad, y, z)
								n = ld64(s848)
								st64(a + 8, ld64(s848 + 8))
								st64(a, n)
								st8(a + 0x15c, 2)
								return o
							}
							const ae: AccountInfo = ld64(c)
							st64(s470, ae)
							st64(c + 8, x - 2)
							st64(c, ae + 0x30)
							if (x != 2) {
								st64(s890, ad, o, ae + 0x30)
								st64(s468, ae + 0x30)
								st64(c + 8, x - 3)
								st64(s890 + 0x18, ae)
								st64(c, ae + 0x60)
								try_accounts_1678(sd8, c, ad, ae + 0x30, ae)
								if (ld32(sb8 + 0x90) == 2) {
									o = fn_4130(s498, ld64(sd8), ld64(sd0), "input_token_account", 0x13)
									st64(s890 + 0x20, ld64(s498 + 8))
									n = ld64(s498)
									if (n != 2) {
										st64(a + 8, ld64(s890 + 0x20))
										st64(a, n)
										st8(a + 0x15c, 2)
										return o
									}
								} else {
									const af = ld64(0x300000000 /* heap bump-allocator cursor */)
									const ag = af != 0 ? sat_sub(af, 0xd8) : 0x300007f28
									if (0x300000008 > ag) {
										alloc_handle_alloc_error(8, 0xd8)
									}
									st64(0x300000000 /* heap bump-allocator cursor */, ag & -8)
									if ((ag & -8) == 0) {
										alloc_handle_alloc_error(8, 0xd8)
									}
									st64(s890 + 0x20, ag & -8)
									memcpy(ag & -8, sd8, 0xd8)
								}
								fn_7498(sd8, c, ah, ai, aj)
								output_vault_mint_box = ld64(sd0)
								const ak = ld64(sd8)
								if (ak != 2) {
									o = fn_4130(s4a8, ak, output_vault_mint_box, "output_token_account", 0x14)
									output_vault_mint_box = ld64(s4a8 + 8)
									n = ld64(s4a8)
									if (n != 2) {
										st64(a + 8, output_vault_mint_box)
										st64(a, n)
										st8(a + 0x15c, 2)
										return o
									}
								}
								st64(s898, output_vault_mint_box)
								fn_7498(sd8, c, output_vault_mint_box, al, am)
								output_vault_mint_box = ld64(sd0)
								const an = ld64(sd8)
								if (an != 2) {
									o = fn_4130(s4b8, an, output_vault_mint_box, 0x10015b11e /* "input_vault" */, 0xb)
									output_vault_mint_box = ld64(s4b8 + 8)
									n = ld64(s4b8)
									if (n != 2) {
										st64(a + 8, output_vault_mint_box)
										st64(a, n)
										st8(a + 0x15c, 2)
										return o
									}
								}
								st64(s8a0, output_vault_mint_box)
								fn_7498(sd8, c, output_vault_mint_box, ao, ap)
								output_vault_mint_box = ld64(sd0)
								const aq = ld64(sd8)
								if (aq != 2) {
									o = fn_4130(s4c8, aq, output_vault_mint_box, "output_vault", 0xc)
									output_vault_mint_box = ld64(s4c8 + 8)
									n = ld64(s4c8)
									if (n != 2) {
										st64(a + 8, output_vault_mint_box)
										st64(a, n)
										st8(a + 0x15c, 2)
										return o
									}
								}
								st64(s8a8, output_vault_mint_box)
								fn_7768(sd8, c, output_vault_mint_box, ar, at)
								output_vault_mint_box = ld64(sd0)
								const au = ld64(sd8)
								if (au != 2) {
									o = fn_4130(s4d8, au, output_vault_mint_box, "input_vault_mint", 0x10)
									output_vault_mint_box = ld64(s4d8 + 8)
									n = ld64(s4d8)
									if (n != 2) {
										st64(a + 8, output_vault_mint_box)
										st64(a, n)
										st8(a + 0x15c, 2)
										return o
									}
								}
								st64(s8b0, output_vault_mint_box)
								fn_7768(sd8, c, output_vault_mint_box, av, aw)
								output_vault_mint_box = ld64(sd0)
								const ax = ld64(sd8)
								if (ax != 2) {
									o = fn_4130(s4e8, ax, output_vault_mint_box, "output_vault_mint", 0x11)
									output_vault_mint_box = ld64(s4e8 + 8)
									n = ld64(s4e8)
									if (n != 2) {
										st64(a + 8, output_vault_mint_box)
										st64(a, n)
										st8(a + 0x15c, 2)
										return o
									}
								}
								st64(s8b8, output_vault_mint_box)
								try_accounts_120(sd8, c, output_vault_mint_box, ay, az)
								output_vault_mint_box = ld64(sd0)
								const ba = ld64(sd8)
								if (ba != 2) {
									o = fn_4130(s4f8, ba, output_vault_mint_box, "input_token_program", 0x13)
									output_vault_mint_box = ld64(s4f8 + 8)
									n = ld64(s4f8)
									if (n != 2) {
										st64(a + 8, output_vault_mint_box)
										st64(a, n)
										st8(a + 0x15c, 2)
										return o
									}
								}
								st64(s8c0, output_vault_mint_box)
								try_accounts_18870(sd8, c, output_vault_mint_box, bb, bc)
								let be = ld64(sd0)
								const bd = ld64(sd8)
								if (bd != 2) {
									o = fn_4130(s508, bd, be, "system_program", 0xe)
									be = ld64(s508 + 8)
									n = ld64(s508)
									if (n != 2) {
										st64(a + 8, be)
										st64(a, n)
										st8(a + 0x15c, 2)
										return o
									}
								}
								st64(s460, be)
								rent_get(sd8)
								copy(s440, sd0, 0x18)
								if (ld64(sd8) != 0) {
									o = fn_13e628(s818, s440)
									n = ld64(s818)
									st64(a + 8, ld64(s818 + 8))
									st64(a, n)
									st8(a + 0x15c, 2)
									return o
								}
								copyr(s458, s440, 0x18)
								const bf = ld64(ld64(s890 + 0x28) /* key */)
								copyr(s400, bf, 0x20)
								st64(s3c0, s400)
								st64(s3c0 + 0x10, s278)
								st8(s278, q)
								st64(s3c0 + 8, 0x20)
								st64(s3a8, 1)
								// PDA find_program_address([*bf, u8 q [ix data?]], program *(ld64(s488)))
								Pubkey_find_program_address(sd8, s3c0, 2, ld64(s488))
								copyr(s428, sd8, 0x20)
								const bg = ld8(sb8)
								st8(s401, bg)
								st8(ld64(s890 + 0x30), bg)
								const bh = ld64(ld64(s890 + 0x18))
								copyr(s3e0, bh, 0x20)
								if ((memcmp(s3e0, s428, 0x20) as u32) == 0) {
									st64(s8d8, be)
									st64(s278, s470, s458, s478, s460, s479, s401, s488)
									o = fn_e0860(sd8, s278)
									const bm = ld64(sc8)
									st64(s890 + 0x18, ld64(sd0))
									const limit_order_nonce: AccountInfo = ld64(sd8)
									if (limit_order_nonce == 0) {
										st64(a + 8, bm)
										st64(a, ld64(s890 + 0x18))
										st8(a + 0x15c, 2)
										return o
									}
									st64(s8d0, s368)
									memcpy(s368, sc0, 0x30)
									st64(s8e0, bm)
									st64(s3c0 + 0x10, bm)
									st64(s3c0 + 8, ld64(s890 + 0x18))
									st64(s3c0, limit_order_nonce)
									st64(s8c8, ld64(sb8 + 0x28))
									const bn = ld64(sb8 + 0x30)
									memcpy(s3a8, ld64(s8d0), 0x30)
									st64(s8e8, bn)
									st64(s3a8 + 0x38, bn)
									st64(s3a8 + 0x30, ld64(s8c8))
									st64(s8d0, limit_order_nonce)
									if (limit_order_nonce.is_writable != 0) {
										AccountInfo_clone_f338(s278, ld64(s8d0))
										const bo = fn_147a20(s278)
										AccountInfo_clone_f338(sd8, ld64(s3c0))
										AccountInfo_try_data_len(s2c0, sd8)
										const bq = ld64(s2c0 + 8)
										const bp = ld64(s2c0)
										if (bp == 0x800000000000001a /* Ok */) {
											const br = Rent_is_exempt(s458, bo, bq)
											ptr_drop_in_place_fcd8(s278, ptr_drop_in_place_fcd8(sd8, br))
											if (br != 0) {
												rent_get(sd8)
												copy(s320, sd0, 0x18)
												if (ld64(sd8) != 0) {
													o = fn_13e628(s808, s320)
													n = ld64(s808)
													st64(a + 8, ld64(s808 + 8))
													st64(a, n)
													st8(a + 0x15c, 2)
													return o
												}
												copyr(s338, s320, 0x18)
												copyr(s2e0, s400, 0x20)
												const bs = ld64(ld64(s8d0))
												copyr(s2c0, bs, 0x20)
												st64(sd8, s2e0)
												st64(sc8, s2c0)
												st64(sb8, s2a0)
												st64(s2a0, bswap64(ld64(s8c8)))
												st64(sd0, 0x20)
												st64(sc0, 0x20)
												st64(sb8 + 8, 8)
												// PDA find_program_address([*s2e0, *bs, u64 bswap64(ld64(s8c8))], program *(ld64(s488)))
												Pubkey_find_program_address(s278, sd8, 3, ld64(s488))
												copyr(s308, s278, 0x20)
												const bt = ld8(s278 + 0x20)
												st8(s2e1, bt)
												st8(ld64(s890 + 0x30) + 1, bt)
												const bu = ld64(ld64(s890 + 0x10))
												copyr(s298, bu, 0x20)
												if ((memcmp(s298, s308, 0x20) as u32) == 0) {
													st64(s278, s468, s338, s478, s460, s3c0, s2e1, s488)
													o = fn_e2de0(sd8, s278)
													st64(s890 + 0x30, ld64(sd0))
													const limit_order: AccountInfo = ld64(sd8)
													const ca = ld8(sb8 + 0x8c)
													st64(s890 + 0x10, ca)
													if (ca == 2) {
														st64(a + 8, ld64(s890 + 0x30))
														st64(a, limit_order)
														st8(a + 0x15c, 2)
														return o
													}
													memcpy(s238, sc8, 0x9c)
													st16(s278 + 0x3c, ld16(sb8 + 0x8d))
													st8(s278 + 0x3e, ld8(sb8 + 0x8f))
													if (limit_order.is_writable != 0) {
														AccountInfo_clone_f338(s278, limit_order)
														st64(s8f0, fn_147a20(s278))
														AccountInfo_clone_f338(sd8, limit_order)
														AccountInfo_try_data_len(s2c0, sd8)
														const cd = ld64(s2c0 + 8)
														const cc = ld64(s2c0)
														if (cc != 0x800000000000001a /* Ok */) {
															st64(s2c0 + 0x10, ld64(s2c0 + 0x10))
															st64(s2c0, cc, cd)
															bz = fn_13e628(s5e8, s2c0)
															by = ld64(s5e8)
															st64(a + 8, ld64(s5e8 + 8))
															st64(a, by)
															st8(a + 0x15c, 2)
															return ptr_drop_in_place_fcd8(s278, ptr_drop_in_place_fcd8(sd8, bz))
														}
														const ce = Rent_is_exempt(s338, ld64(s8f0), cd)
														ptr_drop_in_place_fcd8(s278, ptr_drop_in_place_fcd8(sd8, ce))
														if (ce != 0) {
															if (ld8(ld64(s890 + 0x28) + 0x29 /* is_writable */) != 0) {
																if (ld8(ld64(s890 + 8) + 0x29) != 0) {
																	if (ld8(ld64(s890) + 0x29) != 0) {
																		if (ld8(ld64(ld64(s890 + 0x20) + 0x20) + 0x29) != 0) {
																			copyr(sd8, s400, 0x20)
																			if ((memcmp(ld64(s890 + 0x20) + 0x48, sd8, 0x20) as u32) != 0) {
																				o = anchor_error_from(s698, 0x7df /* anchor::ConstraintTokenOwner */)
																				n = ld64(s698)
																				st64(a + 8, ld64(s698 + 8))
																				st64(a, n)
																				st8(a + 0x15c, 2)
																				return o
																			}
																			const input_vault_box: TokenAccount = ld64(s8a0)
																			copyr(sd8, input_vault_box.mint, 0x20)
																			if ((memcmp(ld64(s890 + 0x20) + 0x28, sd8, 0x20) as u32) == 0) {
																				if (ld8(ld64(ld64(s898) + 0x20) + 0x29) != 0) {
																					copyr(sd8, s400, 0x20)
																					if ((memcmp(ld64(s898) + 0x48, sd8, 0x20) as u32) != 0) {
																						o = anchor_error_from(s6d8, 0x7df /* anchor::ConstraintTokenOwner */)
																						n = ld64(s6d8)
																						st64(a + 8, ld64(s6d8 + 8))
																						st64(a, n)
																						st8(a + 0x15c, 2)
																						return o
																					}
																					const output_vault_box: TokenAccount = ld64(s8a8)
																					copyr(sd8, output_vault_box.mint, 0x20)
																					const ch = memcmp(ld64(s898) + 0x28, sd8, 0x20)
																					if ((ch as u32) == 0) {
																						const input_vault: AccountInfo = ld64(ld64(s8a0) + 0x20)
																						if (input_vault.is_writable != 0) {
																							if ((g & 1) != 0) {
																								const cl = input_vault.key
																								copyr(sd8, cl, 0x20)
																								o = fn_4dc0(s278, ld64(s890 + 8), ch as u32)
																								cm = ld64(s278 + 0x10)
																								ck = ld64(s278 + 8)
																								if (ld64(s278) != 0) {
																									st64(a + 8, cm)
																									st64(a, ck)
																									st8(a + 0x15c, 2)
																									return o
																								}
																								cn = ck + 0x81
																							} else {
																								const cj = input_vault.key
																								copyr(sd8, cj, 0x20)
																								o = fn_4dc0(s278, ld64(s890 + 8), ch as u32)
																								cm = ld64(s278 + 0x10)
																								ck = ld64(s278 + 8)
																								if (ld64(s278) != 0) {
																									st64(a + 8, cm)
																									st64(a, ck)
																									st8(a + 0x15c, 2)
																									return o
																								}
																								cn = ck + 0xa1
																							}
																							const co = memcmp(sd8, cn, 0x20)
																							st64(cm, ld64(cm) - 1)
																							if ((co as u32) == 0) {
																								const output_vault: AccountInfo = ld64(ld64(s8a8) + 0x20)
																								if (output_vault.is_writable != 0) {
																									if ((g & 1) != 0) {
																										const cs = output_vault.key
																										copyr(sd8, cs, 0x20)
																										o = fn_4dc0(s278, ld64(s890 + 8), co as u32)
																										ct = ld64(s278 + 0x10)
																										cr = ld64(s278 + 8)
																										if (ld64(s278) != 0) {
																											st64(a + 8, ct)
																											st64(a, cr)
																											st8(a + 0x15c, 2)
																											return o
																										}
																										cu = cr + 0xa1
																									} else {
																										const cq = output_vault.key
																										copyr(sd8, cq, 0x20)
																										o = fn_4dc0(s278, ld64(s890 + 8), co as u32)
																										ct = ld64(s278 + 0x10)
																										cr = ld64(s278 + 8)
																										if (ld64(s278) != 0) {
																											st64(a + 8, ct)
																											st64(a, cr)
																											st8(a + 0x15c, 2)
																											return o
																										}
																										cu = cr + 0x81
																									}
																									const cv = memcmp(sd8, cu, 0x20)
																									st64(ct, ld64(ct) - 1)
																									if ((cv as u32) == 0) {
																										const input_vault_box_2: TokenAccount = ld64(s8a0)
																										const cx = ld64(ld64(s8b0) + 0x58)
																										const cy = ld64(cx)
																										copyr(s198, cy, 0x20)
																										copy(s178, input_vault_box_2.mint, 0x20)
																										if ((memcmp(s198, s178, 0x20) as u32) != 0) {
																											anchor_error_from(s778, 0x7dc /* anchor::ConstraintAddress */)
																											const dg = fn_4130(s788, ld64(s778), ld64(s778 + 8), "input_vault_mint", 0x10)
																											const df = ld64(s788 + 8)
																											const de = ld64(s788)
																											copy(sd8, s198, 0x40)
																											o = Error_with_pubkeys(s798, de, df, sd8, dg)
																											n = ld64(s798)
																											st64(a + 8, ld64(s798 + 8))
																											st64(a, n)
																											st8(a + 0x15c, 2)
																											return o
																										}
																										const output_vault_box_2: TokenAccount = ld64(s8a8)
																										const da = ld64(ld64(ld64(s8b8) + 0x58))
																										copyr(s158, da, 0x20)
																										copy(s138, output_vault_box_2.mint, 0x20)
																										if ((memcmp(s158, s138, 0x20) as u32) == 0) {
																											const dh = ld64(ld64(s8c0))
																											copyr(s118, dh, 0x20)
																											const dj = AccountInfo_clone_f338(sd8, cx)
																											const di = ld64(sc0)
																											copy(sf8, di, 0x20)
																											ptr_drop_in_place_fcd8(sd8, dj)
																											if ((memcmp(s118, sf8, 0x20) as u32) == 0) {
																												memcpy(a + 0x18, s368, 0x30)
																												o = memcpy(a + 0xc0, s238, 0x9c)
																												const dp = ld8(s278 + 0x3e)
																												const dn = ld16(s278 + 0x3c)
																												st8(a + 0x15c, ld64(s890 + 0x10))
																												st64(a + 0xb8, ld64(s890 + 0x30))
																												st64(a + 0xb0, limit_order)
																												st64(a + 0xa8, ld64(s8d8))
																												st64(a + 0xa0, ld64(s8c0))
																												st64(a + 0x98, ld64(s8b8))
																												st64(a + 0x90, ld64(s8b0))
																												st64(a + 0x88, ld64(s8a8))
																												st64(a + 0x80, ld64(s8a0))
																												st64(a + 0x78, ld64(s898))
																												st64(a + 0x70, ld64(s890 + 0x20))
																												st64(a + 0x68, ld64(s890))
																												st64(a + 0x60, ld64(s890 + 8))
																												st64(a + 0x58, ld64(s890 + 0x28))
																												st64(a + 0x50, ld64(s8e8))
																												st64(a + 0x48, ld64(s8c8))
																												st64(a + 0x10, ld64(s8e0))
																												st64(a + 8, ld64(s890 + 0x18))
																												st64(a, ld64(s8d0))
																												st16(a + 0x15d, dn)
																												st8(a + 0x15f, dp)
																												return o
																											}
																											anchor_error_from(s7d8, 0x7dc /* anchor::ConstraintAddress */)
																											const dm = fn_4130(s7e8, ld64(s7d8), ld64(s7d8 + 8), "input_token_program", 0x13)
																											const dl = ld64(s7e8 + 8)
																											const dk = ld64(s7e8)
																											copy(sd8, s118, 0x40)
																											o = Error_with_pubkeys(s7f8, dk, dl, sd8, dm)
																											n = ld64(s7f8)
																											st64(a + 8, ld64(s7f8 + 8))
																											st64(a, n)
																											st8(a + 0x15c, 2)
																											return o
																										}
																										anchor_error_from(s7a8, 0x7dc /* anchor::ConstraintAddress */)
																										const dd = fn_4130(s7b8, ld64(s7a8), ld64(s7a8 + 8), "output_vault_mint", 0x11)
																										const dc = ld64(s7b8 + 8)
																										const db = ld64(s7b8)
																										copy(sd8, s158, 0x40)
																										o = Error_with_pubkeys(s7c8, db, dc, sd8, dd)
																										n = ld64(s7c8)
																										st64(a + 8, ld64(s7c8 + 8))
																										st64(a, n)
																										st8(a + 0x15c, 2)
																										return o
																									}
																									anchor_error_from(s758, 0x7d3 /* anchor::ConstraintRaw */)
																									o = fn_4130(s768, ld64(s758), ld64(s758 + 8), "output_vault", 0xc)
																									n = ld64(s768)
																									st64(a + 8, ld64(s768 + 8))
																									st64(a, n)
																									st8(a + 0x15c, 2)
																									return o
																								}
																								anchor_error_from(s738, 0x7d0 /* anchor::ConstraintMut */)
																								o = fn_4130(s748, ld64(s738), ld64(s738 + 8), "output_vault", 0xc)
																								n = ld64(s748)
																								st64(a + 8, ld64(s748 + 8))
																								st64(a, n)
																								st8(a + 0x15c, 2)
																								return o
																							}
																							anchor_error_from(s718, 0x7d3 /* anchor::ConstraintRaw */)
																							o = fn_4130(s728, ld64(s718), ld64(s718 + 8), 0x10015b11e /* "input_vault" */, 0xb)
																							n = ld64(s728)
																							st64(a + 8, ld64(s728 + 8))
																							st64(a, n)
																							st8(a + 0x15c, 2)
																							return o
																						}
																						anchor_error_from(s6f8, 0x7d0 /* anchor::ConstraintMut */)
																						o = fn_4130(s708, ld64(s6f8), ld64(s6f8 + 8), 0x10015b11e /* "input_vault" */, 0xb)
																						n = ld64(s708)
																						st64(a + 8, ld64(s708 + 8))
																						st64(a, n)
																						st8(a + 0x15c, 2)
																						return o
																					}
																					o = anchor_error_from(s6e8, 0x7de /* anchor::ConstraintTokenMint */)
																					n = ld64(s6e8)
																					st64(a + 8, ld64(s6e8 + 8))
																					st64(a, n)
																					st8(a + 0x15c, 2)
																					return o
																				}
																				anchor_error_from(s6b8, 0x7d0 /* anchor::ConstraintMut */)
																				o = fn_4130(s6c8, ld64(s6b8), ld64(s6b8 + 8), "output_token_account", 0x14)
																				n = ld64(s6c8)
																				st64(a + 8, ld64(s6c8 + 8))
																				st64(a, n)
																				st8(a + 0x15c, 2)
																				return o
																			}
																			o = anchor_error_from(s6a8, 0x7de /* anchor::ConstraintTokenMint */)
																			n = ld64(s6a8)
																			st64(a + 8, ld64(s6a8 + 8))
																			st64(a, n)
																			st8(a + 0x15c, 2)
																			return o
																		}
																		anchor_error_from(s678, 0x7d0 /* anchor::ConstraintMut */)
																		o = fn_4130(s688, ld64(s678), ld64(s678 + 8), "input_token_account", 0x13)
																		n = ld64(s688)
																		st64(a + 8, ld64(s688 + 8))
																		st64(a, n)
																		st8(a + 0x15c, 2)
																		return o
																	}
																	anchor_error_from(s658, 0x7d0 /* anchor::ConstraintMut */)
																	o = fn_4130(s668, ld64(s658), ld64(s658 + 8), 0x10015a23e /* "tick_array" */, 0xa)
																	n = ld64(s668)
																	st64(a + 8, ld64(s668 + 8))
																	st64(a, n)
																	st8(a + 0x15c, 2)
																	return o
																}
																anchor_error_from(s638, 0x7d0 /* anchor::ConstraintMut */)
																o = fn_4130(s648, ld64(s638), ld64(s638 + 8), "pool_state", 0xa)
																n = ld64(s648)
																st64(a + 8, ld64(s648 + 8))
																st64(a, n)
																st8(a + 0x15c, 2)
																return o
															}
															anchor_error_from(s618, 0x7d0 /* anchor::ConstraintMut */)
															o = fn_4130(s628, ld64(s618), ld64(s618 + 8), "payer", 5)
															n = ld64(s628)
															st64(a + 8, ld64(s628 + 8))
															st64(a, n)
															st8(a + 0x15c, 2)
															return o
														}
														anchor_error_from(s5f8, 0x7d5 /* anchor::ConstraintRentExempt */)
														o = fn_4130(s608, ld64(s5f8), ld64(s5f8 + 8), 0x10015b336 /* "limit_order" */, 0xb)
														n = ld64(s608)
														st64(a + 8, ld64(s608 + 8))
														st64(a, n)
														st8(a + 0x15c, 2)
														return o
													}
													anchor_error_from(s5c8, 0x7d0 /* anchor::ConstraintMut */)
													o = fn_4130(s5d8, ld64(s5c8), ld64(s5c8 + 8), 0x10015b336 /* "limit_order" */, 0xb)
													n = ld64(s5d8)
													st64(a + 8, ld64(s5d8 + 8))
													st64(a, n)
													st8(a + 0x15c, 2)
													return o
												}
												anchor_error_from(s598, 0x7d6 /* anchor::ConstraintSeeds */)
												const bx = fn_4130(s5a8, ld64(s598), ld64(s598 + 8), 0x10015b336 /* "limit_order" */, 0xb)
												const bw = ld64(s5a8 + 8)
												const bv = ld64(s5a8)
												copyr(sd8, s298, 0x20)
												copy(sb8, s308, 0x20)
												o = Error_with_pubkeys(s5b8, bv, bw, sd8, bx)
												n = ld64(s5b8)
												st64(a + 8, ld64(s5b8 + 8))
												st64(a, n)
												st8(a + 0x15c, 2)
												return o
											}
											anchor_error_from(s578, 0x7d5 /* anchor::ConstraintRentExempt */)
											o = fn_4130(s588, ld64(s578), ld64(s578 + 8), "limit_order_nonce", 0x11)
											n = ld64(s588)
											st64(a + 8, ld64(s588 + 8))
											st64(a, n)
											st8(a + 0x15c, 2)
											return o
										}
										st64(s2c0 + 0x10, ld64(s2c0 + 0x10))
										st64(s2c0, bp, bq)
										bz = fn_13e628(s568, s2c0)
										by = ld64(s568)
										st64(a + 8, ld64(s568 + 8))
										st64(a, by)
										st8(a + 0x15c, 2)
										return ptr_drop_in_place_fcd8(s278, ptr_drop_in_place_fcd8(sd8, bz))
									}
									anchor_error_from(s548, 0x7d0 /* anchor::ConstraintMut */)
									o = fn_4130(s558, ld64(s548), ld64(s548 + 8), "limit_order_nonce", 0x11)
									n = ld64(s558)
									st64(a + 8, ld64(s558 + 8))
									st64(a, n)
									st8(a + 0x15c, 2)
									return o
								}
								anchor_error_from(s518, 0x7d6 /* anchor::ConstraintSeeds */)
								const bk = fn_4130(s528, ld64(s518), ld64(s518 + 8), "limit_order_nonce", 0x11)
								const bj = ld64(s528 + 8)
								const bi = ld64(s528)
								copyr(sd8, s3e0, 0x20)
								copy(sb8, s428, 0x20)
								o = Error_with_pubkeys(s538, bi, bj, sd8, bk)
								n = ld64(s538)
								st64(a + 8, ld64(s538 + 8))
								st64(a, n)
								st8(a + 0x15c, 2)
								return o
							}
							o = anchor_error_from(s828, 0xbbd /* anchor::AccountNotEnoughKeys */, ad, ae + 0x30, ae)
							n = ld64(s828)
							st64(a + 8, ld64(s828 + 8))
							st64(a, n)
							st8(a + 0x15c, 2)
							return o
						}
						o = anchor_error_from(s838, 0xbbd /* anchor::AccountNotEnoughKeys */, undef, y, z)
						ad = undef
						n = ld64(s838)
						if (n == 2) {
							o = anchor_error_from(s848, 0xbbd /* anchor::AccountNotEnoughKeys */, ad, y, z)
							n = ld64(s848)
							st64(a + 8, ld64(s848 + 8))
							st64(a, n)
							st8(a + 0x15c, 2)
							return o
						}
						const aa = ld64(0x300000000 /* heap bump-allocator cursor */)
						s = 0xa > aa
						const ab = aa != 0 ? s != 0 ? 0 : aa - 0xa : 0x300007ff6
						output_vault_mint_box = ld64(s838 + 8)
						if ((n & 1) != 0) {
							if (0x300000008 > ab) {
								raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, s)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, ab)
							st64(ab, 0x7272615f6b636974)
							st16(ab + 8, 0x7961)
							void ld64(output_vault_mint_box)
						} else {
							if (0x300000008 > ab) {
								raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, s)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, ab)
							st64(ab, 0x7272615f6b636974)
							st16(ab + 8, 0x7961)
							void ld64(output_vault_mint_box)
						}
						st64(output_vault_mint_box.mint_authority + 0xc, ab, 0xa)
						st64(output_vault_mint_box.mint_authority + 4, 0xa)
						st64(output_vault_mint_box, 1)
						st64(a + 8, output_vault_mint_box)
						st64(a, n)
						st8(a + 0x15c, 2)
						return o
					}
					const r = ld64(0x300000000 /* heap bump-allocator cursor */)
					s = 0xa > r
					const t = s != 0 ? 0 : r - 0xa
					const u = r != 0 ? t : 0x300007ff6
					if ((n & 1) != 0) {
						if (0x300000008 > u) {
							raw_vec_handle_error(1, 0xa, 0x10015f8f8, t, s)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, u)
						st64(u, 0x6174735f6c6f6f70)
						st16(u + 8, 0x6574)
						void ld64(o)
					} else {
						if (0x300000008 > u) {
							raw_vec_handle_error(1, 0xa, 0x10015f8f8, t, s)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, u)
						st64(u, 0x6174735f6c6f6f70)
						st16(u + 8, 0x6574)
						void ld64(o)
					}
					st64(o + 0x10, u, 0xa)
					st64(o + 8, 0xa)
					st64(o, 1)
					st64(a + 8, o)
					st64(a, n)
					st8(a + 0x15c, 2)
					return o
				}
				const v = ld64(0x300000000 /* heap bump-allocator cursor */)
				const w = v != 0 ? sat_sub(v, 5) : 0x300007ffb
				if ((n & 1) != 0) {
					if (0x300000008 > w) {
						raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(v, 5), 5 > v)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, w)
					st8(w + 4, 0x72)
					st32(w, 0x65796170)
					void ld64(o)
				} else {
					if (0x300000008 > w) {
						raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(v, 5), 5 > v)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, w)
					st8(w + 4, 0x72)
					st32(w, 0x65796170)
					void ld64(o)
				}
				st64(o + 0x10, w, 5)
				st64(o + 8, 5)
				st64(o, 1)
				st64(a + 8, o)
				st64(a, n)
				st8(a + 0x15c, 2)
				return o
			}
		}
		h = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	}
	const i = h
	if (2 > (h & 3) - 2) {
		o = anchor_error_from(s858, 0x66 /* anchor::InstructionDidNotDeserialize */, k, l, m)
		n = ld64(s858)
		st64(a + 8, ld64(s858 + 8))
		st64(a, n)
		st8(a + 0x15c, 2)
		return o
	}
	if ((i & 3) == 0) {
		o = anchor_error_from(s858, 0x66 /* anchor::InstructionDidNotDeserialize */, k, l, m)
		n = ld64(s858)
		st64(a + 8, ld64(s858 + 8))
		st64(a, n)
		st8(a + 0x15c, 2)
		return o
	}
	const j = ld64(ld64(h + 7))
	if (j == 0) {
		o = anchor_error_from(s858, 0x66 /* anchor::InstructionDidNotDeserialize */, k, l, m)
		n = ld64(s858)
		st64(a + 8, ld64(s858 + 8))
		st64(a, n)
		st8(a + 0x15c, 2)
		return o
	}
	callx(j, ld64(h - 1), j)
	o = anchor_error_from(s858, 0x66 /* anchor::InstructionDidNotDeserialize */)
	n = ld64(s858)
	st64(a + 8, ld64(s858 + 8))
	st64(a, n)
	st8(a + 0x15c, 2)
	return o
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: AccountInfo, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), d (value), c (value), p5 (value), p6 (value)
// types [heur]: b: OpenLimitOrderContext (the handler ix_open_limit_order passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_4f930(a: u64, b: OpenLimitOrderContext, c: u64, d: u64, p5: u64, p6: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s38 = fp - 0x38, s50 = fp - 0x50, s68 = fp - 0x68, s98 = fp - 0x98, sc8 = fp - 0xc8, sf8 = fp - 0xf8, s108 = fp - 0x108, s120 = fp - 0x120, s128 = fp - 0x128, s138 = fp - 0x138, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s220 = fp - 0x220, s228 = fp - 0x228, s240 = fp - 0x240, s260 = fp - 0x260, s280 = fp - 0x280, s2a0 = fp - 0x2a0, s2b8 = fp - 0x2b8, s2d0 = fp - 0x2d0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3f8 = fp - 0x3f8, s418 = fp - 0x418, s420 = fp - 0x420, s428 = fp - 0x428, s430 = fp - 0x430, s438 = fp - 0x438, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let g, i, j, bp, bq, bv: u64
	st64(s3f8 + 0x20, a)
	const accounts: OpenLimitOrderAccounts = b.accounts
	if (ld8(ld64(accounts.input_token_account + 0x70) + 0x94) != 2 && ld8(ld64(accounts.input_token_account.delegate + 4) + 0x94) != 2) {
		st64(s3f8, b, c, p6, d)
		const k = p5
		j = fn_4dc0(s240, ld64(accounts.input_token_account.owner + 0x18), r0)
		let h = ld64(s240 + 0x10)
		i = ld64(s240 + 8)
		if (ld64(s240) != 0) {
			g = ld64(s3f8 + 0x20)
			st64(g + 8, h)
			st64(g, i)
			return j
		}
		st64(s418 + 0x18, k)
		if ((ld8(i + 0x17d) & 0x30) == 0) {
			const p = ld32(i + 0x105)
			const m = ld16(i + 0xe3)
			st64(h, ld64(h) - 1)
			const n = ld64(s418 + 0x18)
			const o = ld64(s3f8 + 0x18)
			st64(s418 + 0x10, m)
			j = fn_51b90(s310, n, o, p, m)
			h = ld64(s310 + 8)
			i = ld64(s310)
			if (i == 2) {
				const q = fn_16330(ld64(accounts.input_token_account.delegate + 0x1c))
				const r = ld64(s3f8 + 0x10)
				j = fn_7da68(s240, q, r)
				const s = ld64(s240 + 8)
				i = ld64(s240)
				if (i != 2) {
					g = ld64(s3f8 + 0x20)
					st64(g + 8, s)
					st64(g, i)
					return j
				}
				if (s > r) {
					j = fn_88360(s3c0, 0x26)
					i = ld64(s3c0)
					g = ld64(s3f8 + 0x20)
					st64(g + 8, ld64(s3c0 + 8))
					st64(g, i)
					return j
				}
				st64(s418, s, r - s)
				const t = ld64(s418 + 0x18)
				j = fn_514e0(s320, r - s, t, ld64(s3f8 + 0x18), j)
				h = ld64(s320 + 8)
				i = ld64(s320)
				if (i == 2) {
					const u = ld64(s418 + 0x10)
					const v = fn_72940(t, u)
					const w = ld64(ld64(accounts.input_token_account.owner + 0x18))
					copyr(s68, w, 0x20)
					st64(s240, 0x10015a23e)
					st64(s240 + 0x10, s68)
					st64(s220, s2d0)
					st32(s2d0, bswap32(v))
					st64(s240 + 8, 0xa)
					st64(s228, 0x20)
					st64(s220 + 8, 4)
					st64(s38, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
					// PDA find_program_address(["tick_array", *w, u32 bswap32(v)], program *s38)
					Pubkey_find_program_address(s128, s240, 3, s38)
					copyr(s2f0, s128, 0x20)
					const x = ld64(accounts.input_token_account.amount)
					copyr(s240, x, 0x20)
					if ((memcmp(s2f0, s240, 0x20) as u32) != 0) {
						ErrorCode_name(s68, 0x100159874)
						st64(s38, 0, 1, 0)
						st64(s108, s38, 0x10015f818)
						st8(sf8 + 8, 3)
						st64(sf8, 0x20)
						st64(s120 + 8, 0)
						st64(s128, 0)
						if (ErrorCode_fmt(0x100159874, s128) != 0) {
							fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
						}
						copyr(s208, s38, 0x18)
						copy(s220, s68, 0x18)
						st64(s240 + 8, 0x10015a201)
						st32(s1f8 + 0x50, 0x9c6 /* anchor::RequireKeysEqViolated */)
						st8(s1f8 + 8, 2)
						st32(s228, 0x9e)
						st64(s240 + 0x10, 0x3d)
						st64(s240, 0)
						fn_13e5a0(s330, s240)
						const an = ld64(s330 + 8)
						const am = ld64(s330)
						const ah = ld64(accounts.input_token_account.amount)
						const al = ld64(ah)
						const ak = ld64(ah + 8)
						const aj = ld64(ah + 0x10)
						const ai = ld64(ah + 0x18)
						copy(s240, s2f0, 0x20)
						st64(s220, al, ak, aj, ai)
						j = Error_with_pubkeys(s340, am, an, s240, aj)
						i = ld64(s340)
						g = ld64(s3f8 + 0x20)
						st64(g + 8, ld64(s340 + 8))
						st64(g, i)
						return j
					}
					const y = ld64(accounts.input_token_account.owner + 0x10)
					st64(s420, s38)
					AccountInfo_clone_f338(s38, y)
					const z = accounts.input_token_account.amount
					st64(s428, s128)
					AccountInfo_clone_f338(s128, z)
					const aa = accounts.input_token_account.delegated_amount
					st64(s430, v)
					AccountInfo_clone_f338(s240, aa)
					const ab = ld64(ld64(accounts.input_token_account.owner + 0x18))
					copyr(s2a0, ab, 0x20)
					st64(sff0, u)
					st64(sff8, ld64(s430))
					st64(s1000, s2a0)
					j = fn_70108(s68, ld64(s420), ld64(s428), s240, fp)
					h = ld64(s68 + 8)
					i = ld64(s68)
					const ac = ld8(s50 + 0x12)
					if (ac == 2) {
						g = ld64(s3f8 + 0x20)
						st64(g + 8, h)
						st64(g, i)
						return j
					}
					st16(s2b8 + 0x10, ld16(s50 + 0x10))
					copyr(s2b8, s50, 0x10)
					st32(s2b8 + 0x13, ld32(s50 + 0x13))
					st8(s2b8 + 0x17, ld8(s50 + 0x17))
					st8(s2b8 + 0x12, ac)
					st64(s2d0, i, h)
					const ad = ld64(s68 + 0x10)
					st64(s2d0 + 0x10, ad)
					let bb = fn_84f40(s240, ad, ld8(s2b8 + 0x11), undef, undef, j)
					const ae = ld64(s240 + 0x10)
					const af = ld64(s240 + 8)
					h = ae
					i = af
					if (ld64(s240) != 0) {
						j = ptr_drop_in_place_f5e8(s2d0, bb)
						g = ld64(s3f8 + 0x20)
						st64(g + 8, h)
						st64(g, i)
						return j
					}
					B28: {
						st64(s420, ae)
						st64(s430, ld8(af + 0x2784))
						st64(s438, ld32(af + 0x20))
						st64(s428, af)
						bb = fn_717b0(s240, af, ld64(s418 + 0x18), ld64(s418 + 0x10))
						h = ld64(s240 + 8)
						i = ld64(s240)
						if (i == 2) {
							const ag = ld64(h + 0x74)
							if (ag != -1) {
								const ap = ld64(h + 0x1c)
								const ao = ld64(h + 0x14)
								st64(s418 + 0x10, 1)
								if ((ao | ap) == 0 && ld64(h + 0x7c) == 0) {
									const bc = ld64(h + 0x84)
									st64(s418 + 0x10, 1)
									if (bc == 0) {
										st64(s418 + 0x10, 0)
									}
								}
								const aq = ld64(s418 + 0x18)
								st32(h, aq)
								const ar = ld64(ld64(accounts.input_token_account.owner + 0x18))
								copyr(s280, ar, 0x20)
								const at = ld64(ld64(accounts.input_token_account.owner + 0x10))
								copyr(s260, at, 0x20)
								bb = clock_get(s240)
								if (ld64(s240) != 0) {
									const az = ld64(s240 + 8)
									const ay = ld64(s240 + 0x10)
									st64(s240 + 0x10, ld64(s228))
									st64(s240, az, ay)
									bb = fn_13e628(s3a0, s240)
									h = ld64(s3a0 + 8)
									i = ld64(s3a0)
								} else {
									const au = ld64(s220 + 8)
									st64(accounts.input_token_account.close_authority + 0x1c, ld64(s280 + 0x18))
									st64(accounts.input_token_account.close_authority + 0x14, ld64(s280 + 0x10))
									st64(accounts.input_token_account.close_authority + 0xc, ld64(s280 + 8))
									st64(accounts.input_token_account.close_authority + 4, ld64(s280))
									st64(accounts + 0xf0, ld64(s260 + 0x18))
									st64(accounts + 0xe8, ld64(s260 + 0x10))
									st64(accounts + 0xe0, ld64(s260 + 8))
									st64(accounts + 0xd8, ld64(s260))
									st8(accounts + 0x15c, ld64(s3f8 + 0x18))
									st32(accounts + 0x158, aq)
									st64(accounts + 0x120, au)
									st64(accounts + 0xf8, ag)
									const av = ld64(s418 + 8)
									st64(accounts + 0x100, av)
									st64(accounts + 0x110, av)
									st64(accounts + 0x128, 0, 1)
									st64(accounts + 0x108, 0)
									st64(accounts + 0x138, 0)
									st64(accounts + 0x118, 0)
									st64(accounts + 0x140, 0, 0, 0)
									const aw = ld64(h + 0x7c)
									let ax = aw + av
									if (aw > ax) {
										bb = fn_88360(s390, 0x26)
										h = ld64(s390 + 8)
										i = ld64(s390)
									} else {
										st64(h + 0x7c, aw + ld64(s418 + 8))
										if ((ld64(s418 + 0x10) & 1) == 0) {
											const bd = ld8(ld64(s428) + 0x2784)
											if (bd == 0xff) {
												bb = fn_88360(s350, 0x26)
												ax = undef
												h = ld64(s350 + 8)
												i = ld64(s350)
												if (i != 2) {
													break B28
												}
											} else {
												st8(ld64(s428) + 0x2784, bd + 1)
											}
											if (ld64(s430) == 0) {
												bb = fn_53e8(s240, ld64(accounts.input_token_account.owner + 0x18), ax, bp, bq, bb)
												h = ld64(s240 + 0x10)
												i = ld64(s240 + 8)
												if (ld64(s240) != 0) {
													break B28
												}
												const br = ld64(0x300000000 /* heap bump-allocator cursor */)
												const bs = br != 0 ? sat_sub(br, 4) & -4 : 0x300007ffc
												if (0x300000008 > bs) {
													alloc_handle_alloc_error(4, 4)
												}
												st64(0x300000000 /* heap bump-allocator cursor */, bs)
												st32(bs, ld64(s438))
												st64(s240, 1, bs, 1)
												const bt = fn_6f618(i, s240)
												let bu = 0
												if (bt != 0) {
													if (ld64(ld64(s3f8) + 0x18) == 0) {
														fn_85138(s68, 0x1001598a0)
														st64(s38, 0, 1, 0)
														st64(s108, s38, 0x10015f818)
														st8(sf8 + 8, 3)
														st64(sf8, 0x20)
														st64(s120 + 8, 0)
														st64(s128, 0)
														if (fn_88558(0x1001598a0, s128) != 0) {
															fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
														}
														copyr(s208, s38, 0x18)
														copy(s220, s68, 0x18)
														st64(s240 + 8, 0x10015a201)
														st32(s1f8 + 0x50, 0x1772 /* error::AccountLack */)
														st8(s1f8 + 8, 2)
														st32(s228, 0xcc)
														st64(s240 + 0x10, 0x3d)
														st64(s240, 0)
														bb = fn_13e5a0(s370, s240)
														bv = ld64(s370 + 8)
														i = ld64(s370)
														st64(h, ld64(h) + 1)
														h = bv
														break B28
													}
													bu = ld64(ld64(s3f8) + 0x10)
												}
												bb = fn_6d670(s360, i, bu, ld64(s438))
												bv = ld64(s360 + 8)
												i = ld64(s360)
												if (i != 2) {
													st64(h, ld64(h) + 1)
													h = bv
													break B28
												}
												st64(h, ld64(h) + 1)
											}
										}
										st64(s240, 0, 0, 0, 0)
										if ((memcmp(accounts.input_token_account + 8, s240, 0x20) as u32) == 0) {
											const be = ld64(ld64(accounts.input_token_account.owner + 0x10))
											const bh = ld64(be)
											const bg = ld64(be + 8)
											const bf = ld64(be + 0x10)
											st64(accounts + 0x20, ld64(be + 0x18))
											st64(accounts.input_token_account + 0x18, bf)
											st64(accounts.input_token_account + 0x10, bg)
											st64(accounts.input_token_account + 8, bh)
											st8(accounts.input_token_account.owner + 8, ld64(s3f8 + 8))
										}
										const bi = ld64(accounts.input_token_account.owner)
										st64(accounts.input_token_account.owner, bi != -1 ? bi + 1 : 0xffffffffffffffff)
										AccountInfo_clone_f338(s228, accounts.input_token_account.is_native)
										AccountInfo_clone_f338(s128, ld64(ld64(accounts.input_token_account + 0x70) + 0x20))
										AccountInfo_clone_f338(s68, ld64(ld64(accounts.input_token_account.delegate + 0xc) + 0x20))
										AccountInfo_clone_f338(s38, ld64(accounts.input_token_account.owner + 0x10))
										AccountInfo_clone_f338(sf8, ld64(ld64(accounts.input_token_account.delegate + 0x1c) + 0x58))
										memcpy(sc8, s68, 0x30)
										memcpy(s98, s38, 0x30)
										memcpy(s1f8, s128, 0xc0)
										st64(s138, 8, 0)
										st64(s240, 0, 8, 0)
										bb = token_2022_transfer_checked(s380, s240, ld64(s3f8 + 0x10), ld8(ld64(accounts.input_token_account.delegate + 0x1c) + 0x30))
										h = ld64(s380 + 8)
										i = ld64(s380)
										if (i == 2) {
											const bj = ld64(ld64(accounts.input_token_account.owner + 0x18))
											copyr(s240, bj, 0x20)
											const bk = ld64(ld64(accounts.input_token_account + 0xb0))
											copyr(s220, bk, 0x20)
											const bm = ld64(accounts + 0x100)
											const bl = ld8(accounts + 0x15c)
											st32(s1f8 + 8, ld32(accounts + 0x158))
											st8(s1f8 + 0xc, bl)
											st64(s1f8, ld64(s418))
											st64(s208 + 8, bm)
											fn_10d258(s128, s240)
											copyr(s38, s120, 0x10)
											const bo = log_data(s38, 1)
											const bn = ld64(s420)
											st64(bn, ld64(bn) + 1)
											j = ptr_drop_in_place_f5e8(s2d0, bo)
											g = ld64(s3f8 + 0x20)
											st64(g + 8, h)
											st64(g, 2)
											return j
										}
									}
								}
							} else {
								fn_85138(s68, 0x1001598d0)
								st64(s38, 0, 1, 0)
								st64(s108, s38, 0x10015f818)
								st8(sf8 + 8, 3)
								st64(sf8, 0x20)
								st64(s120 + 8, 0)
								st64(s128, 0)
								if (fn_88558(0x1001598d0, s128) != 0) {
									fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
								}
								copyr(s208, s38, 0x18)
								copy(s220, s68, 0x18)
								st64(s240 + 8, 0x10015a201)
								st32(s1f8 + 0x50, 0x179b /* error::OrderPhaseSaturated */)
								st8(s1f8 + 8, 2)
								st32(s228, 0xac)
								st64(s240 + 0x10, 0x3d)
								st64(s240, 0)
								bb = fn_13e5a0(s3b0, s240)
								h = ld64(s3b0 + 8)
								i = ld64(s3b0)
							}
						}
					}
					const ba = ld64(s420)
					st64(ba, ld64(ba) + 1)
					j = ptr_drop_in_place_f5e8(s2d0, bb)
					g = ld64(s3f8 + 0x20)
					st64(g + 8, h)
					st64(g, i)
					return j
				}
				g = ld64(s3f8 + 0x20)
				st64(g + 8, h)
				st64(g, i)
				return j
			}
			g = ld64(s3f8 + 0x20)
			st64(g + 8, h)
			st64(g, i)
			return j
		}
		fn_85138(s68, 0x10015982c)
		st64(s38, 0, 1, 0)
		st64(s108, s38, 0x10015f818)
		st8(sf8 + 8, 3)
		st64(sf8, 0x20)
		st64(s120 + 8, 0)
		st64(s128, 0)
		if (fn_88558(0x10015982c, s128) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copyr(s208, s38, 0x18)
		copy(s220, s68, 0x18)
		st64(s240 + 8, 0x10015a201)
		st32(s1f8 + 0x50, 0x1770 /* error::NotApproved */)
		st8(s1f8 + 8, 2)
		st32(s228, 0x88)
		st64(s240 + 0x10, 0x3d)
		st64(s240, 0)
		j = fn_13e5a0(s300, s240)
		const l = ld64(s300 + 8)
		i = ld64(s300)
		st64(h, ld64(h) - 1)
		g = ld64(s3f8 + 0x20)
		st64(g + 8, l)
		st64(g, i)
		return j
	}
	fn_85138(s68, 0x10015982c)
	st64(s38, 0, 1, 0)
	st64(s108, s38, 0x10015f818)
	st8(sf8 + 8, 3)
	st64(sf8, 0x20)
	st64(s120 + 8, 0)
	st64(s128, 0)
	if (fn_88558(0x10015982c, s128) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(s208, s38, 0x18)
	copy(s220, s68, 0x18)
	st64(s240 + 8, 0x10015a201)
	st32(s1f8 + 0x50, 0x1770 /* error::NotApproved */)
	st8(s1f8 + 8, 2)
	st32(s228, 0x7d)
	st64(s240 + 0x10, 0x3d)
	st64(s240, 0)
	j = fn_13e5a0(s3d0, s240)
	i = ld64(s3d0)
	g = ld64(s3f8 + 0x20)
	st64(g + 8, ld64(s3d0 + 8))
	st64(g, i)
	return j
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: input_vault, output_vault
function fn_e4980(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0
	let i, o, q, r, s: u64
	let z = fn_a80(s30, ld64(b + 0x60), c)
	let f = ld64(s30)
	if (f == 2) {
		B27: {
			if ((memcmp(0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c, 0x20) as u32) == 0) {
				const j = ld64(b)
				if (common_is_closed(j) == 0) {
					const k = ld64(j + 0x10)
					if (ld64(k + 0x10) != 0) {
						st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
						z = fn_13e628(s40, s18)
						i = ld64(s40 + 8)
						f = ld64(s40)
						if (f == 2) {
							break B27
						}
					} else {
						B26: {
							st64(k + 0x10, -1)
							const l = ld64(k + 0x18)
							st64(s18 + 8, ld64(k + 0x20))
							st64(s18, l)
							st64(s18 + 0x10, 0)
							let m = fn_13e070(s18, 0x100159348, 8)
							if (m == 0) {
								m = fn_13e070(s18, b + 8, 0x20)
								if (m == 0) {
									m = fn_13e070(s18, b + 0x50, 1)
									if (m == 0) {
										st64(s20, ld64(b + 0x48))
										m = fn_13e070(s18, s20, 8)
										if (m == 0) {
											st64(s20, ld64(b + 0x28))
											m = fn_13e070(s18, s20, 8)
											if (m == 0) {
												st64(s20, ld64(b + 0x30))
												m = fn_13e070(s18, s20, 8)
												if (m == 0) {
													st64(s20, ld64(b + 0x38))
													m = fn_13e070(s18, s20, 8)
													if (m == 0) {
														st64(s20, ld64(b + 0x40))
														m = fn_13e070(s18, s20, 8)
														if (m == 0) {
															st64(k + 0x10, ld64(k + 0x10) + 1)
															break B27
														}
													}
												}
											}
										}
									}
								}
								const p = m
								if (2 > (m & 3) - 2) {
									break B26
								}
								if ((p & 3) == 0) {
									break B26
								}
								o = ld64(ld64(m + 7))
								if (o == 0) {
									break B26
								}
							} else {
								const n = m
								if (2 > (m & 3) - 2) {
									break B26
								}
								if ((n & 3) == 0) {
									break B26
								}
								o = ld64(ld64(m + 7))
								if (o == 0) {
									break B26
								}
							}
							callx(o, ld64(m - 1), o)
						}
						z = anchor_error_from(s50, 0xbbc /* anchor::AccountDidNotSerialize */, q, r, s)
						i = ld64(s50 + 8)
						f = ld64(s50)
						st64(k + 0x10, ld64(k + 0x10) + 1)
						if (f == 2) {
							break B27
						}
					}
					const ak = ld64(0x300000000 /* heap bump-allocator cursor */)
					const al = ak != 0 ? sat_sub(ak, 0x11) : 0x300007fef
					if ((f & 1) != 0) {
						if (0x300000008 > al) {
							raw_vec_handle_error(1, 0x11, 0x10015f8f8, sat_sub(ak, 0x11), 0x11 > ak)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, al)
						st64(al + 8, 0x636e6f6e5f726564)
						st64(al, 0x726f5f74696d696c)
						st8(al + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
						void ld64(i)
					} else {
						if (0x300000008 > al) {
							raw_vec_handle_error(1, 0x11, 0x10015f8f8, sat_sub(ak, 0x11), 0x11 > ak)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, al)
						st64(al + 8, 0x636e6f6e5f726564)
						st64(al, 0x726f5f74696d696c)
						st8(al + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
						void ld64(i)
					}
					st64(i + 0x10, al, 0x11)
					st64(i + 8, 0x11)
					st64(i, 1)
					st64(a + 8, i)
					st64(a, f)
					return z
				}
			}
		}
		z = fn_af28(s60, b + 0xb0, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
		f = ld64(s60)
		if (f == 2) {
			const t = ld64(b + 0x70)
			const u = ld64(t + 0x20)
			if ((memcmp(t, c, 0x20) as u32) == 0 && (common_is_closed(u) == 0 && ld64(ld64(u + 0x10) + 0x10) != 0)) {
				st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
				z = fn_13e628(s70, s18)
				f = ld64(s70)
				if (f != 2) {
					const v = ld64(0x300000000 /* heap bump-allocator cursor */)
					const w = v != 0 ? sat_sub(v, 0x13) : 0x300007fed
					i = ld64(s70 + 8)
					if ((f & 1) != 0) {
						if (0x300000008 > w) {
							raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x13 > v)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, w)
						st64(w + 8, 0x6f6363615f6e656b)
						st64(w, 0x6f745f7475706e69)
						st32(w + 0xf, 0x746e756f)
						void ld64(i)
					} else {
						if (0x300000008 > w) {
							raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x13 > v)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, w)
						st64(w + 8, 0x6f6363615f6e656b)
						st64(w, 0x6f745f7475706e69)
						st32(w + 0xf, 0x746e756f)
						void ld64(i)
					}
					st64(i + 0x10, w, 0x13)
					st64(i + 8, 0x13)
					st64(i, 1)
					st64(a + 8, i)
					st64(a, f)
					return z
				}
			}
			const aa = ld64(b + 0x78)
			const ab = ld64(aa + 0x20)
			if ((memcmp(aa, c, 0x20) as u32) == 0 && (common_is_closed(ab) == 0 && ld64(ld64(ab + 0x10) + 0x10) != 0)) {
				st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
				z = fn_13e628(s80, s18)
				f = ld64(s80)
				if (f != 2) {
					const ac = ld64(0x300000000 /* heap bump-allocator cursor */)
					const ad = ac != 0 ? sat_sub(ac, 0x14) : 0x300007fec
					i = ld64(s80 + 8)
					if ((f & 1) != 0) {
						if (0x300000008 > ad) {
							raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x14 > ac)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ad)
						st64(ad + 8, 0x6363615f6e656b6f)
						st64(ad, 0x745f74757074756f)
						st32(ad + 0x10, 0x746e756f)
						void ld64(i)
					} else {
						if (0x300000008 > ad) {
							raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x14 > ac)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ad)
						st64(ad + 8, 0x6363615f6e656b6f)
						st64(ad, 0x745f74757074756f)
						st32(ad + 0x10, 0x746e756f)
						void ld64(i)
					}
					st64(i + 0x10, ad, 0x14)
					st64(i + 8, 0x14)
					st64(i, 1)
					st64(a + 8, i)
					st64(a, f)
					return z
				}
			}
			const ae = ld64(b + 0x80)
			const af = ld64(ae + 0x20)
			if ((memcmp(ae, c, 0x20) as u32) == 0 && (common_is_closed(af) == 0 && ld64(ld64(af + 0x10) + 0x10) != 0)) {
				st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
				fn_13e628(s90, s18)
				const ag = ld64(s90)
				if (ag != 2) {
					z = fn_4130(sa0, ag, ld64(s90 + 8), 0x10015b11e /* "input_vault" */, 0xb)
					i = ld64(sa0 + 8)
					f = ld64(sa0)
					if (f != 2) {
						st64(a + 8, i)
						st64(a, f)
						return z
					}
				}
			}
			const ah = ld64(b + 0x88)
			z = fn_a1d8(sb0, ld64(ah + 0x20), ah, c)
			i = undef
			const ai = ld64(sb0)
			if (ai == 2) {
				st64(a + 8, i)
				st64(a, 2)
				return z
			}
			z = fn_4130(sc0, ai, ld64(sb0 + 8), "output_vault", 0xc)
			i = undef
			const aj = ld64(sc0)
			if (aj == 2) {
				st64(a + 8, i)
				st64(a, 2)
				return z
			}
			st64(a + 8, ld64(sc0 + 8))
			st64(a, aj)
			return z
		}
		const x = ld64(0x300000000 /* heap bump-allocator cursor */)
		const y = x != 0 ? sat_sub(x, 0xb) : 0x300007ff5
		i = ld64(s60 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > y) {
				raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0xb > x)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, y)
			st64(y, 0x726f5f74696d696c)
			st32(y + 7, 0x72656472)
			void ld64(i)
		} else {
			if (0x300000008 > y) {
				raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0xb > x)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, y)
			st64(y, 0x726f5f74696d696c)
			st32(y + 7, 0x72656472)
			void ld64(i)
		}
		st64(i + 0x10, y, 0xb)
		st64(i + 8, 0xb)
		st64(i, 1)
		st64(a + 8, i)
		st64(a, f)
		return z
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0xa) : 0x300007ff6
	i = ld64(s30 + 8)
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
	return z
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_e0860(a: u64, b: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s49 = fp - 0x49, s4a = fp - 0x4a, s70 = fp - 0x70, s71 = fp - 0x71, s72 = fp - 0x72, s88 = fp - 0x88, sf0 = fp - 0xf0, s110 = fp - 0x110, s130 = fp - 0x130, s148 = fp - 0x148, s160 = fp - 0x160, s168 = fp - 0x168, s188 = fp - 0x188, s1d0 = fp - 0x1d0, s1f0 = fp - 0x1f0, s1ff = fp - 0x1ff, s208 = fp - 0x208, s218 = fp - 0x218, s220 = fp - 0x220, s228 = fp - 0x228, s230 = fp - 0x230, s238 = fp - 0x238, s240 = fp - 0x240, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s390 = fp - 0x390, s398 = fp - 0x398, s3a0 = fp - 0x3a0, s3d8 = fp - 0x3d8, s3e0 = fp - 0x3e0, s3e8 = fp - 0x3e8, s3f0 = fp - 0x3f0, s3f8 = fp - 0x3f8
	let o, w, x, y, ad, ba, bb, bh, bv, bw, bx, dx, dy: u64
	let h: AccountInfo
	B43: {
		o = a
		const f: AccountInfo = ld64(ld64(b))
		const g = f.owner
		st64(s390 + 0x48, g)
		if ((memcmp(g, 0x100159560, 0x20) as u32) == 0) {
			const n = fn_147a20(f)
			st64(s390 + 0x40, o)
			if (n == 0) {
				const aj = fn_1476d8(ld64(b + 8), 0x51)
				const ae = ld64(b + 0x10)
				st64(s390 + 0x28, ae)
				const af: AccountInfo = ld64(ae)
				const ag: LamportsCell = af.lamports
				const ak = af.key
				rc_inc(ag)
				const ah: DataCell = af.data
				const ai = ah.strong
				st64(s390 + 0x38, aj)
				rc_inc(ah, ai)
				st64(s390 + 0x30, ak)
				const al: LamportsCell = f.lamports
				const am = al.strong
				st64(s398, f.key)
				st64(s390, af.executable)
				st64(s390 + 8, af.is_writable)
				st64(s390 + 0x10, af.is_signer)
				st64(s390 + 0x18, af.rent_epoch)
				st64(s390 + 0x20, af.owner)
				rc_inc(al, am)
				st64(s3d8 + 0x30, al)
				const an: DataCell = f.data
				const ao = an.strong
				const av = ld64(s390 + 0x28)
				st64(s3a0, ah)
				rc_inc(an, ao)
				const ap: AccountInfo = ld64(ld64(b + 0x18))
				const aq: LamportsCell = ap.lamports
				const ar = aq.strong
				st64(s3d8, f.executable)
				st64(s3d8 + 8, f.is_writable)
				st64(s3d8 + 0x10, f.is_signer)
				st64(s3d8 + 0x18, f.rent_epoch)
				st64(s3d8 + 0x20, f.owner)
				st64(s3d8 + 0x28, ap.key)
				rc_inc(aq, ar)
				const at: DataCell = ap.data
				const au = at.strong
				st64(s3e0, ag)
				rc_inc(at, au)
				st64(s3e8, ap.owner)
				st64(s3f0, ap.rent_epoch)
				st64(s3f8, ap.is_signer)
				const az = ap.is_writable
				const ay = ap.executable
				const aw = ld64(ld64(av))
				copyr(s70, aw, 0x20)
				st8(s4a, ld8(ld64(b + 0x20)))
				const ax = ld8(ld64(b + 0x28))
				st64(s28, s49)
				st64(s48 + 0x10, s4a)
				st64(s48, s70)
				st8(s49, ax)
				st64(s148, s48)
				st64(s1d0 + 0x38, s148)
				st8(s1d0 + 0x32, ld64(s3d8))
				st8(s1d0 + 0x31, ld64(s3d8 + 8))
				st8(s1d0 + 0x30, ld64(s3d8 + 0x10))
				st64(s1d0 + 0x28, ld64(s3d8 + 0x18))
				st64(s1d0 + 0x20, ld64(s3d8 + 0x20))
				st64(s1d0 + 0x18, an)
				st64(s1d0 + 0x10, ld64(s3d8 + 0x30))
				st64(s1d0 + 8, ld64(s398))
				st8(s1d0 + 2, ld64(s390))
				st8(s1d0 + 1, ld64(s390 + 8))
				st8(s1d0, ld64(s390 + 0x10))
				st64(s1f0 + 0x18, ld64(s390 + 0x18))
				st64(s1f0 + 0x10, ld64(s390 + 0x20))
				st64(s1f0 + 8, ld64(s3a0))
				st64(s1f0, ld64(s3e0))
				st64(s1ff + 7, ld64(s390 + 0x30))
				st8(s1ff, az, ay)
				st8(s208 + 8, ld64(s3f8))
				st64(s208, ld64(s3f0))
				st64(s218 + 8, ld64(s3e8))
				st64(s220, aq, at)
				st64(s228, ld64(s3d8 + 0x28))
				st64(s28 + 8, 1)
				st64(s48 + 0x18, 1)
				st64(s48 + 8, 0x20)
				st64(s148 + 8, 3)
				st64(s1d0 + 0x40, 1)
				st64(s240, 0, 8, 0)
				dy = system_program_create_account(s2f0, s240, ld64(s390 + 0x38), 0x51, ld64(ld64(b + 0x30)))
				ba = ld64(s2f0)
				if (ba != 2) {
					dx = ld64(s2f0 + 8)
					bh = ld64(s390 + 0x40)
					st64(bh + 8, ba, dx)
					st64(bh, 0)
					return dy
				}
			} else {
				const p = ld64(b + 0x10)
				const q = ld64(ld64(p))
				copyr(s188, q, 0x20)
				const r = f.key
				copy(s160, r + 8, 0x18)
				st64(s168, ld64(r))
				if ((memcmp(s188, s168, 0x20) as u32) == 0) {
					ErrorCode_name(s148, 0x100159890)
					st64(s70, 0, 1, 0)
					st64(s28, s70, 0x10015f818)
					st8(s28 + 0x18, 3)
					st64(s28 + 0x10, 0x20)
					st64(s48 + 0x10, 0)
					st64(s48, 0)
					if (ErrorCode_fmt(0x100159890, s48) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
					}
					copyr(s208, s70, 0x18)
					copy(s220, s148, 0x18)
					st64(s238, 0x10015a201)
					st32(s1d0 + 0x28, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
					st8(s1f0, 2)
					st32(s228, 8)
					st64(s230, 0x3d)
					st64(s240, 0)
					const bg = fn_13e5a0(s2d0, s240)
					const bf = ld64(s2d0 + 8)
					const be = ld64(s2d0)
					copy(s240, s188, 0x40)
					dy = Error_with_pubkeys(s2e0, be, bf, s240, bg)
					const bi = ld64(s2e0)
					bh = ld64(s390 + 0x40)
					st64(bh + 0x10, ld64(s2e0 + 8))
					st64(bh + 8, bi)
					st64(bh, 0)
					return dy
				}
				const s = max(fn_1476d8(ld64(b + 8), 0x51), 1)
				if (s > n) {
					const t: AccountInfo = ld64(p)
					const u: LamportsCell = t.lamports
					const cb = t.key
					rc_inc(u)
					const bz: DataCell = t.data
					const ca = bz.strong
					st64(s390 + 0x38, cb)
					rc_inc(bz, ca)
					const cc: LamportsCell = f.lamports
					const cd = cc.strong
					st64(s390, f.key)
					st64(s390 + 8, t.executable)
					st64(s390 + 0x10, t.is_writable)
					st64(s390 + 0x18, t.is_signer)
					st64(s390 + 0x20, t.rent_epoch)
					st64(s390 + 0x28, t.owner)
					st64(s390 + 0x30, cc)
					rc_inc(cc, cd)
					const ce: DataCell = f.data
					const cf = ce.strong
					st64(s398, bz)
					rc_inc(ce, cf)
					const cg: AccountInfo = ld64(ld64(b + 0x18))
					const ch: LamportsCell = cg.lamports
					const ci = ch.strong
					st64(s3d8 + 0x10, f.executable)
					st64(s3d8 + 0x18, f.is_writable)
					st64(s3d8 + 0x20, f.is_signer)
					st64(s3d8 + 0x28, f.rent_epoch)
					st64(s3d8 + 0x30, f.owner)
					st64(s3a0, cg.key)
					rc_inc(ch, ci)
					const cj: DataCell = cg.data
					const ck = cj.strong
					st64(s3d8, u, sat_sub(s, n))
					rc_inc(cj, ck)
					st64(s3e0, cg.owner)
					const co = cg.rent_epoch
					const cn = cg.is_signer
					const cm = cg.is_writable
					const cl = cg.executable
					st8(sf0 + 0x62, ld64(s3d8 + 0x10))
					st8(sf0 + 0x61, ld64(s3d8 + 0x18))
					st8(sf0 + 0x60, ld64(s3d8 + 0x20))
					st64(sf0 + 0x58, ld64(s3d8 + 0x28))
					st64(sf0 + 0x50, ld64(s3d8 + 0x30))
					st64(sf0 + 0x48, ce)
					st64(sf0 + 0x40, ld64(s390 + 0x30))
					st64(sf0 + 0x38, ld64(s390))
					st8(sf0 + 0x32, ld64(s390 + 8))
					st8(sf0 + 0x31, ld64(s390 + 0x10))
					st8(sf0 + 0x30, ld64(s390 + 0x18))
					st64(sf0 + 0x28, ld64(s390 + 0x20))
					st64(sf0 + 0x20, ld64(s390 + 0x28))
					st64(sf0 + 0x18, ld64(s398))
					st64(sf0 + 0x10, ld64(s3d8))
					st64(sf0 + 8, ld64(s390 + 0x38))
					st8(sf0, cn, cm, cl)
					st64(s110 + 0x18, co)
					st64(s110 + 0x10, ld64(s3e0))
					st64(s110, ch, cj)
					st64(s130 + 0x18, ld64(s3a0))
					st64(s88, 8, 0)
					st64(s130, 0, 8, 0)
					dy = system_program_transfer(s2a0, s130, ld64(s3d8 + 8))
					ba = ld64(s2a0)
					if (ba != 2) {
						dx = ld64(s2a0 + 8)
						bh = ld64(s390 + 0x40)
						st64(bh + 8, ba, dx)
						st64(bh, 0)
						return dy
					}
				}
				const cp: LamportsCell = f.lamports
				const cx = f.key
				rc_inc(cp)
				const cq: DataCell = f.data
				rc_inc(cq)
				const cr = ld64(b + 0x18)
				const cs: AccountInfo = ld64(cr)
				const ct: LamportsCell = cs.lamports
				const cu = ct.strong
				st64(s390 + 0x38, cq)
				st64(s390 + 0x18, f.executable)
				st64(s390 + 0x10, f.is_writable)
				st64(s390 + 8, f.is_signer)
				st64(s390 + 0x28, f.rent_epoch)
				st64(s390 + 0x30, f.owner)
				st64(s390 + 0x20, cs.key)
				rc_inc(ct, cu)
				const cv: DataCell = cs.data
				const cw = cv.strong
				st64(s3a0, cr, cx, cp)
				rc_inc(cv, cw)
				const dc = cs.owner
				const db = cs.rent_epoch
				const da = cs.is_signer
				const cz = cs.is_writable
				const cy = cs.executable
				copyr(s70, s188, 0x20)
				st8(s72, ld8(ld64(b + 0x20)))
				st8(s71, ld8(ld64(b + 0x28)))
				st64(s28, s71)
				st64(s48 + 0x10, s72)
				st64(s48, s70)
				st64(s148, s48)
				st8(s208 + 8, ld64(s390 + 8))
				st8(s1ff, ld64(s390 + 0x10))
				st8(s1ff + 1, ld64(s390 + 0x18))
				st64(s1d0 + 8, s148)
				st8(s1d0, da, cz, cy)
				st64(s1f0, ct, cv, dc, db)
				st64(s1ff + 7, ld64(s390 + 0x20))
				st64(s208, ld64(s390 + 0x28))
				st64(s218 + 8, ld64(s390 + 0x30))
				st64(s218, ld64(s390 + 0x38))
				copyr(s228, s398, 0x10)
				st64(s28 + 8, 1)
				st64(s48 + 0x18, 1)
				st64(s48 + 8, 0x20)
				st64(s148 + 8, 3)
				st64(s1d0 + 0x10, 1)
				st64(s240, 0, 8, 0)
				dy = system_program_assign_13fb30(s2b0, s240, 0x51)
				ba = ld64(s2b0)
				if (ba != 2) {
					dx = ld64(s2b0 + 8)
					bh = ld64(s390 + 0x40)
					st64(bh + 8, ba, dx)
					st64(bh, 0)
					return dy
				}
				const dd: LamportsCell = f.lamports
				const di = ld64(s3a0)
				const dq = f.key
				rc_inc(dd)
				const dh: DataCell = f.data
				rc_inc(dh)
				const dj: AccountInfo = ld64(di)
				const dk: LamportsCell = dj.lamports
				const dl = dk.strong
				st64(s390 + 0x38, dh)
				st64(s390 + 0x18, f.executable)
				st64(s390 + 0x20, f.is_writable)
				st64(s390 + 0x28, f.is_signer)
				st64(s390 + 0x30, f.rent_epoch)
				const dp = f.owner
				st64(s390 + 0x10, dj.key)
				rc_inc(dk, dl)
				const dm: DataCell = dj.data
				const dn = dm.strong
				st64(s398, dp, dq, dd)
				rc_inc(dm, dn)
				const dv = dj.owner
				const du = dj.rent_epoch
				const dt = dj.is_signer
				const ds = dj.is_writable
				const dr = dj.executable
				copyr(s70, s188, 0x20)
				st8(s4a, ld8(s72))
				st64(s28, s49)
				st64(s48 + 0x10, s4a)
				st64(s48, s70)
				st8(s49, ld8(s71))
				st64(s28 + 8, 1)
				st64(s48 + 0x18, 1)
				st64(s48 + 8, 0x20)
				st64(s148, s48, 3)
				st64(s1d0 + 8, s148)
				st8(s1d0, dt, ds, dr)
				st64(s1f0, dk, dm, dv, du)
				st64(s1ff + 7, ld64(s390 + 0x10))
				st8(s1ff + 1, ld64(s390 + 0x18))
				st8(s1ff, ld64(s390 + 0x20))
				st8(s208 + 8, ld64(s390 + 0x28))
				st64(s208, ld64(s390 + 0x30))
				st64(s218 + 8, ld64(s398))
				st64(s218, ld64(s390 + 0x38))
				copyr(s228, s390, 0x10)
				st64(s1d0 + 0x10, 1)
				st64(s240, 0, 8, 0)
				dy = system_program_assign_13ff40(s2c0, s240, ld64(ld64(b + 0x30)))
				ba = ld64(s2c0)
				if (ba != 2) {
					dx = ld64(s2c0 + 8)
					bh = ld64(s390 + 0x40)
					st64(bh + 8, ba, dx)
					st64(bh, 0)
					return dy
				}
			}
			o = ld64(s390 + 0x40)
			dy = fn_9298(s240, f)
			h = ld64(s240)
			if (h == 0) {
				const dw = ld64(0x300000000 /* heap bump-allocator cursor */)
				x = dw != 0 ? sat_sub(dw, 0x11) : 0x300007fef
				y = ld64(s230)
				w = ld64(s238)
				if (w != 0) {
					if (0x300000008 > x) {
						raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, bb)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, x)
					st64(x + 8, 0x636e6f6e5f726564)
					st64(x, 0x726f5f74696d696c)
					st8(x + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
					void ld64(y)
					break B43
				}
				if (0x300000008 > x) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, bb)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, x)
				st64(x + 8, 0x636e6f6e5f726564)
				st64(x, 0x726f5f74696d696c)
				st8(x + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
				void ld64(y)
				break B43
			}
		} else {
			dy = fn_db08(s240, f)
			h = ld64(s240)
			if (h == 0) {
				const v = ld64(0x300000000 /* heap bump-allocator cursor */)
				x = v != 0 ? sat_sub(v, 0x11) : 0x300007fef
				y = ld64(s230)
				w = ld64(s238)
				if (w != 0) {
					if (0x300000008 > x) {
						raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, bb)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, x)
					st64(x + 8, 0x636e6f6e5f726564)
					st64(x, 0x726f5f74696d696c)
					st8(x + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
					void ld64(y)
					break B43
				}
				if (0x300000008 > x) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, bb)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, x)
				st64(x + 8, 0x636e6f6e5f726564)
				st64(x, 0x726f5f74696d696c)
				st8(x + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
				void ld64(y)
				break B43
			}
		}
		memcpy(s290, s238, 0x50)
		if (fn_147a98(f) != 0x51) {
			anchor_error_from(s300, 0x7e3 /* anchor::ConstraintSpace */)
			const z = ld64(0x300000000 /* heap bump-allocator cursor */)
			const bc = o
			const ab = z != 0 ? sat_sub(z, 0x11) : 0x300007fef
			const ac = ld64(s300 + 8)
			const aa = ld64(s300)
			if ((aa & 1) != 0) {
				if (0x300000008 > ab) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x11 > z, bb)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ab)
				st64(ab + 8, 0x636e6f6e5f726564)
				st64(ab, 0x726f5f74696d696c)
				st8(ab + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
				ad = ld64(ac)
			} else {
				if (0x300000008 > ab) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x11 > z, bb)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ab)
				st64(ab + 8, 0x636e6f6e5f726564)
				st64(ab, 0x726f5f74696d696c)
				st8(ab + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
				ad = ld64(ac)
			}
			st64(ac + 0x10, ab, 0x11)
			st64(ac + 8, 0x11)
			st64(ac, 1)
			dy = fn_3be8(s310, aa, ac, 0x51, fn_147a98(f, ad, sat_sub(z, 0x11), 0x11 > z, bb))
			const bd = ld64(s310)
			st64(bc + 0x10, ld64(s310 + 8))
			st64(bc + 8, bd)
			st64(bc, 0)
			return dy
		}
		const i = ld64(ld64(b + 0x30))
		if ((memcmp(ld64(s390 + 0x48), i, 0x20) as u32) != 0) {
			const df = anchor_error_from(s320, 0x7d4 /* anchor::ConstraintOwner */)
			const j = ld64(0x300000000 /* heap bump-allocator cursor */)
			const l = j != 0 ? sat_sub(j, 0x11) : 0x300007fef
			const m = ld64(s320 + 8)
			const k = ld64(s320)
			if ((k & 1) != 0) {
				if (0x300000008 > l) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, bb)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, l)
				st64(l + 8, 0x636e6f6e5f726564)
				st64(l, 0x726f5f74696d696c)
				st8(l + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
				void ld64(m)
			} else {
				if (0x300000008 > l) {
					raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, bb)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, l)
				st64(l + 8, 0x636e6f6e5f726564)
				st64(l, 0x726f5f74696d696c)
				st8(l + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
				void ld64(m)
			}
			st64(m + 0x10, l, 0x11)
			st64(m + 8, 0x11)
			st64(m, 1)
			const de = ld64(s390 + 0x48)
			copyr(s240, de, 0x20)
			copy(s220, i, 0x20)
			dy = Error_with_pubkeys(s330, k, m, s240, df)
			const dg = ld64(s330)
			st64(o + 0x10, ld64(s330 + 8))
			st64(o + 8, dg)
			st64(o, 0)
			return dy
		}
		const bn = fn_1476d8(ld64(b + 8), 0x51)
		const bj: LamportsCell = h.lamports
		const bk = bj.strong
		st64(s390 + 0x40, o)
		const bs = h.key
		rc_inc(bj, bk)
		let bl = h.data
		const bm = ld64(bl)
		st64(s390 + 0x48, bn)
		rc_inc(bl, bm)
		const br = h.owner
		const bq = h.rent_epoch
		const bp = h.is_signer
		const bo = h.is_writable
		st8(s218 + 2, h.executable)
		st8(s218, bp, bo)
		st64(s240, bs, bj, bl, br, bq)
		let bt = fn_147a20(s240, br, bq, bp, bo)
		const bu = bt
		if (rc_release(bj)) {
			bt = Rc_drop_slow_14df0(s238, bt)
			bl = ld64(s230)
		}
		if (rc_release(bl)) {
			Rc_drop_slow_14df0(s230, bt)
		}
		o = ld64(s390 + 0x40)
		if (bu >= ld64(s390 + 0x48)) {
			dy = memcpy(o + 8, s290, 0x50)
			st64(o, h)
			return dy
		}
		dy = anchor_error_from(s340, 0x7d5 /* anchor::ConstraintRentExempt */, bv, bw, bx)
		const by = ld64(0x300000000 /* heap bump-allocator cursor */)
		x = by != 0 ? sat_sub(by, 0x11) : 0x300007fef
		y = ld64(s340 + 8)
		w = ld64(s340)
		if ((w & 1) != 0) {
			if (0x300000008 > x) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, bb)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, x)
			st64(x + 8, 0x636e6f6e5f726564)
			st64(x, 0x726f5f74696d696c)
			st8(x + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
			void ld64(y)
		} else {
			if (0x300000008 > x) {
				raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008, bb)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, x)
			st64(x + 8, 0x636e6f6e5f726564)
			st64(x, 0x726f5f74696d696c)
			st8(x + 0x10, 0x65 /* anchor::InstructionFallbackNotFound */)
			void ld64(y)
		}
	}
	st64(y + 0x10, x, 0x11)
	st64(y + 8, 0x11)
	st64(y, 1)
	st64(o + 0x10, y)
	st64(o + 8, w)
	st64(o, 0)
	return dy
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_e2de0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s49 = fp - 0x49, s58 = fp - 0x58, s78 = fp - 0x78, s98 = fp - 0x98, sa8 = fp - 0xa8, sa9 = fp - 0xa9, sd0 = fp - 0xd0, se0 = fp - 0xe0, s148 = fp - 0x148, s168 = fp - 0x168, s188 = fp - 0x188, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, s1c8 = fp - 0x1c8, s20f = fp - 0x20f, s210 = fp - 0x210, s228 = fp - 0x228, s230 = fp - 0x230, s238 = fp - 0x238, s248 = fp - 0x248, s260 = fp - 0x260, s268 = fp - 0x268, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s300 = fp - 0x300, s330 = fp - 0x330, s338 = fp - 0x338, s340 = fp - 0x340, s348 = fp - 0x348, s350 = fp - 0x350, s358 = fp - 0x358, s360 = fp - 0x360, s368 = fp - 0x368, s370 = fp - 0x370, s378 = fp - 0x378, s380 = fp - 0x380, s388 = fp - 0x388, s390 = fp - 0x390
	let ah, al, ct, cu: u64
	const f: AccountInfo = ld64(ld64(b))
	const g = fn_147a20(f, b, c, d, e)
	st64(s300 + 0x18, a)
	if (g != 0) {
		const k = ld64(b + 0x10)
		const l = ld64(ld64(k))
		copyr(s1c8, l, 0x20)
		const m = f.key
		copy(s1a0, m + 8, 0x18)
		st64(s1a8, ld64(m))
		if ((memcmp(s1c8, s1a8, 0x20) as u32) == 0) {
			ErrorCode_name(s98, 0x100159890)
			st64(s78, 0, 1, 0)
			st64(s28, s78, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100159890, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(s248, s78, 0x18)
			copy(s260, s98, 0x18)
			st64(s280 + 8, 0x10015a201)
			st32(s20f + 0x27, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s230, 2)
			st32(s268, 8)
			st64(s280 + 0x10, 0x3d)
			st64(s280, 0)
			const ak = fn_13e5a0(s2c0, s280)
			const aj = ld64(s2c0 + 8)
			const ai = ld64(s2c0)
			copy(s280, s1c8, 0x40)
			cu = Error_with_pubkeys(s2d0, ai, aj, s280, ak)
			const am = ld64(s2d0)
			al = ld64(s300 + 0x18)
			st64(al + 8, ld64(s2d0 + 8))
			st64(al, am)
			st8(al + 0xac, 2)
			return cu
		}
		st64(s300 + 0x10, b)
		const n = max(fn_1476d8(ld64(b + 8), 0xad), 1)
		if (n > g) {
			const o: AccountInfo = ld64(k)
			const p: LamportsCell = o.lamports
			const ay = o.key
			const au = ld64(s300 + 0x10)
			rc_inc(p)
			const an: DataCell = o.data
			const ao = an.strong
			st64(s300, p)
			rc_inc(an, ao)
			const ap: LamportsCell = f.lamports
			st64(s300 + 8, ap)
			const aq = ap.strong
			st64(s330, f.key)
			st64(s330 + 8, o.executable)
			st64(s330 + 0x10, o.is_writable)
			st64(s330 + 0x18, o.is_signer)
			st64(s330 + 0x20, o.rent_epoch)
			st64(s330 + 0x28, o.owner)
			rc_inc(ld64(s300 + 8), aq)
			const ar: DataCell = f.data
			const at = ar.strong
			st64(s338, an)
			rc_inc(ar, at)
			st64(s340, sat_sub(n, g))
			const av: AccountInfo = ld64(ld64(au + 0x18))
			const aw: LamportsCell = av.lamports
			const ax = aw.strong
			st64(s348, ay)
			st64(s370, f.executable)
			st64(s368, f.is_writable)
			st64(s360, f.is_signer)
			st64(s358, f.rent_epoch)
			st64(s350, f.owner)
			const bb = av.key
			const bc = ld64(s300)
			rc_inc(aw, ax)
			const az: DataCell = av.data
			const ba = az.strong
			st64(s378, bb)
			rc_inc(az, ba)
			st64(s380, av.owner)
			const bg = av.rent_epoch
			const bf = av.is_signer
			const be = av.is_writable
			const bd = av.executable
			st8(s148 + 0x62, ld64(s370))
			st8(s148 + 0x61, ld64(s368))
			st8(s148 + 0x60, ld64(s360))
			st64(s148 + 0x58, ld64(s358))
			st64(s148 + 0x50, ld64(s350))
			st64(s148 + 0x48, ar)
			st64(s148 + 0x40, ld64(s300 + 8))
			st64(s148 + 0x38, ld64(s330))
			st8(s148 + 0x32, ld64(s330 + 8))
			st8(s148 + 0x31, ld64(s330 + 0x10))
			st8(s148 + 0x30, ld64(s330 + 0x18))
			st64(s148 + 0x28, ld64(s330 + 0x20))
			st64(s148 + 0x20, ld64(s330 + 0x28))
			st64(s148 + 0x18, ld64(s338))
			st64(s148 + 0x10, bc)
			st64(s148 + 8, ld64(s348))
			st8(s148, bf, be, bd)
			st64(s168 + 0x18, bg)
			st64(s168 + 0x10, ld64(s380))
			st64(s168, aw, az)
			st64(s188 + 0x18, ld64(s378))
			st64(se0, 8, 0)
			st64(s188, 0, 8, 0)
			cu = system_program_transfer(s290, s188, ld64(s340))
			ah = ld64(s290)
			if (ah != 2) {
				ct = ld64(s290 + 8)
				al = ld64(s300 + 0x18)
				st64(al, ah, ct)
				st8(al + 0xac, 2)
				return cu
			}
		}
		const bh: LamportsCell = f.lamports
		const bi = bh.strong
		st64(s300 + 8, f.key)
		const bk = ld64(s300 + 0x10)
		rc_inc(bh, bi)
		const bj: DataCell = f.data
		rc_inc(bj)
		const bl = ld64(bk + 0x18)
		const bm: AccountInfo = ld64(bl)
		const bn: LamportsCell = bm.lamports
		const bo = bn.strong
		st64(s330 + 0x10, f.executable)
		st64(s330 + 0x18, f.is_writable)
		st64(s330 + 0x20, f.is_signer)
		st64(s330 + 0x28, f.rent_epoch)
		st64(s300, f.owner)
		const bs = bm.key
		rc_inc(bn, bo)
		st64(s330 + 8, bj)
		const bp: DataCell = bm.data
		rc_inc(bp)
		st64(s350, bl)
		st64(s338, bm.owner)
		st64(s340, bm.rent_epoch)
		st64(s348, bm.is_signer)
		const bx = bm.is_writable
		const bw = bm.executable
		st64(s330, bh)
		copyr(s78, s1c8, 0x20)
		const bq = ld64(s300 + 0x10)
		const br = ld64(bq + 0x20)
		const bt = ld64(ld64(br))
		copy(sd0, bt, 0x20)
		const bu = ld64(br + 0x48)
		st64(sa8, bswap64(bu))
		const bv = ld8(ld64(bq + 0x28))
		st64(s28 + 0x10, sa9)
		st64(s28, sa8)
		st64(s48 + 0x10, sd0)
		st64(s48, s78)
		st8(sa9, bv)
		st64(s98, s48)
		st64(s20f + 7, s98)
		st8(s20f, bx, bw)
		st8(s210, ld64(s348))
		st64(s228 + 0x10, ld64(s340))
		st64(s228 + 8, ld64(s338))
		st64(s238, bs, bn, bp)
		st8(s248 + 0xa, ld64(s330 + 0x10))
		st8(s248 + 9, ld64(s330 + 0x18))
		st8(s248 + 8, ld64(s330 + 0x20))
		st64(s248, ld64(s330 + 0x28))
		st64(s260 + 0x10, ld64(s300))
		copyr(s260, s330, 0x10)
		st64(s268, ld64(s300 + 8))
		st64(s28 + 0x18, 1)
		st64(s28 + 8, 8)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0x20)
		st64(s98 + 8, 4)
		st64(s20f + 0xf, 1)
		st64(s280, 0, 8, 0)
		cu = system_program_assign_13fb30(s2a0, s280, 0xad)
		ah = ld64(s2a0)
		if (ah != 2) {
			ct = ld64(s2a0 + 8)
			al = ld64(s300 + 0x18)
			st64(al, ah, ct)
			st8(al + 0xac, 2)
			return cu
		}
		const by: LamportsCell = f.lamports
		const cb = ld64(s350)
		const ci = f.key
		rc_inc(by)
		const bz: DataCell = f.data
		const ca = bz.strong
		st64(s300 + 8, bswap64(bu))
		rc_inc(bz, ca)
		const cc: AccountInfo = ld64(cb)
		const cd: LamportsCell = cc.lamports
		const ce = cd.strong
		st64(s330 + 0x18, f.executable)
		st64(s330 + 0x20, f.is_writable)
		st64(s330 + 0x28, f.is_signer)
		st64(s300, f.rent_epoch)
		const ch = f.owner
		st64(s330 + 0x10, cc.key)
		rc_inc(cd, ce)
		const cf: DataCell = cc.data
		const cg = cf.strong
		st64(s338, ch, ci, by)
		rc_inc(cf, cg)
		const cn = cc.owner
		const cm = cc.rent_epoch
		const cl = cc.is_signer
		const ck = cc.is_writable
		const cj = cc.executable
		copyr(s98, s1c8, 0x20)
		copyr(s78, sd0, 0x20)
		st64(s58, ld64(s300 + 8))
		st8(s49, ld8(sa9))
		st64(s48, s98, 0x20, s78, 0x20, s58, 8, s49, 1)
		st64(sa8, s48, 4)
		st64(s20f + 7, sa8)
		st8(s210, cl, ck, cj)
		st64(s230, cd, cf, cn, cm)
		st64(s238, ld64(s330 + 0x10))
		st8(s248 + 0xa, ld64(s330 + 0x18))
		st8(s248 + 9, ld64(s330 + 0x20))
		st8(s248 + 8, ld64(s330 + 0x28))
		st64(s248, ld64(s300))
		st64(s260 + 0x10, ld64(s338))
		st64(s260 + 8, bz)
		copyr(s268, s330, 0x10)
		st64(s20f + 0xf, 1)
		st64(s280, 0, 8, 0)
		cu = system_program_assign_13ff40(s2b0, s280, ld64(ld64(ld64(s300 + 0x10) + 0x30)))
		ah = ld64(s2b0)
		if (ah != 2) {
			ct = ld64(s2b0 + 8)
			al = ld64(s300 + 0x18)
			st64(al, ah, ct)
			st8(al + 0xac, 2)
			return cu
		}
	} else {
		const s = fn_1476d8(ld64(b + 8), 0xad)
		const h = ld64(b + 0x10)
		const i: AccountInfo = ld64(h)
		const j: LamportsCell = i.lamports
		const q = i.key
		rc_inc(j)
		st64(s300 + 0x10, q)
		const r: DataCell = i.data
		rc_inc(r)
		st64(s300, h, s)
		const t: LamportsCell = f.lamports
		const u = t.strong
		st64(s330 + 8, f.key)
		st64(s330 + 0x10, i.executable)
		st64(s330 + 0x18, i.is_writable)
		st64(s330 + 0x20, i.is_signer)
		st64(s330 + 0x28, i.rent_epoch)
		const v = i.owner
		rc_inc(t, u)
		st64(s330, v)
		const w: DataCell = f.data
		rc_inc(w)
		st64(s340, t, r)
		const x: AccountInfo = ld64(ld64(b + 0x18))
		const y: LamportsCell = x.lamports
		const z = y.strong
		st64(s368, f.executable)
		st64(s360, f.is_writable)
		st64(s358, f.is_signer)
		st64(s350, f.rent_epoch)
		st64(s348, f.owner)
		const aa = x.key
		rc_inc(y, z)
		st64(s370, aa)
		const ab: DataCell = x.data
		rc_inc(ab)
		st64(s378, x.owner)
		st64(s380, x.rent_epoch)
		st64(s388, x.is_signer)
		st64(s390, x.is_writable)
		const ag = x.executable
		const ac = ld64(ld64(ld64(s300)))
		copyr(s98, ac, 0x20)
		const ad = ld64(b + 0x20)
		const ae = ld64(ld64(ad))
		copyr(s78, ae, 0x20)
		st64(s58, bswap64(ld64(ad + 0x48)))
		const af = ld8(ld64(b + 0x28))
		st64(s28 + 0x10, s49)
		st64(s28, s58)
		st64(s48 + 0x10, s78)
		st64(s48, s98)
		st8(s49, af)
		st64(sa8, s48)
		st64(s20f + 0x37, sa8)
		st8(s20f + 0x31, ld64(s368))
		st8(s20f + 0x30, ld64(s360))
		st8(s20f + 0x2f, ld64(s358))
		st64(s20f + 0x27, ld64(s350))
		st64(s20f + 0x1f, ld64(s348))
		st64(s20f + 0x17, w)
		st64(s20f + 0xf, ld64(s340))
		st64(s20f + 7, ld64(s330 + 8))
		st8(s20f + 1, ld64(s330 + 0x10))
		st8(s20f, ld64(s330 + 0x18))
		st8(s210, ld64(s330 + 0x20))
		st64(s228 + 0x10, ld64(s330 + 0x28))
		copyr(s228, s338, 0x10)
		st64(s230, j)
		st64(s238, ld64(s300 + 0x10))
		st8(s248 + 0xa, ag)
		st8(s248 + 9, ld64(s390))
		st8(s248 + 8, ld64(s388))
		st64(s248, ld64(s380))
		st64(s260 + 0x10, ld64(s378))
		st64(s260, y, ab)
		st64(s268, ld64(s370))
		st64(s28 + 0x18, 1)
		st64(s28 + 8, 8)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0x20)
		st64(sa8 + 8, 4)
		st64(s20f + 0x3f, 1)
		st64(s280, 0, 8, 0)
		cu = system_program_create_account(s2e0, s280, ld64(s300 + 8), 0xad, ld64(ld64(b + 0x30)))
		ah = ld64(s2e0)
		if (ah != 2) {
			ct = ld64(s2e0 + 8)
			al = ld64(s300 + 0x18)
			st64(al, ah, ct)
			st8(al + 0xac, 2)
			return cu
		}
	}
	const cs = ld64(s300 + 0x18)
	cu = fn_7b00(s280, f)
	if (ld8(s20f + 0x3b) == 2) {
		const co = ld64(0x300000000 /* heap bump-allocator cursor */)
		const cq = co != 0 ? sat_sub(co, 0xb) : 0x300007ff5
		const cr = ld64(s280 + 8)
		const cp = ld64(s280)
		if (cp != 0) {
			if (0x300000008 > cq) {
				raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, cq)
			st64(cq, 0x726f5f74696d696c)
			st32(cq + 7, 0x72656472)
			void ld64(cr)
		} else {
			if (0x300000008 > cq) {
				raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, cq)
			st64(cq, 0x726f5f74696d696c)
			st32(cq + 7, 0x72656472)
			void ld64(cr)
		}
		st64(cr + 0x10, cq, 0xb)
		st64(cr + 8, 0xb)
		st64(cr, 1)
		st64(cs + 8, cr)
		st64(cs, cp)
		st8(cs + 0xac, 2)
		return cu
	}
	return memcpy(cs, s280, 0xb0)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), c (value)
function fn_51b90(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148
	let f, g: u64
	if (0xd89e7 > ((b + 0x6c4f3) as u32)) {
		if ((e as u16) == 0) {
			fn_154940(0x10015fea0, b, c, d, e as u16)
		}
		f = fn_158b50(b as i32, e as u16)
		if (f != 0) {
			fn_85138(s78, 0x1001598dc)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (fn_88558(0x1001598dc, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copy(sf8, s78, 0x30)
			st64(s118 + 8, 0x10015a201)
			st32(sf8 + 0x78, 0x1778 /* error::TickAndSpacingNotMatch */)
			st8(sf8 + 0x30, 2)
			st32(s118 + 0x18, 0x11b)
			st64(s118 + 0x10, 0x3d)
			st64(s118, 0)
			f = fn_13e5a0(s138, s118)
			g = ld64(s138)
			st64(a + 8, ld64(s138 + 8))
			st64(a, g)
			return f
		}
		if (c != 0) {
			if ((b as i32) > (d as i32)) {
				st64(a + 8, undef)
				st64(a, 2)
				return f
			}
		} else if ((d as i32) > (b as i32)) {
			st64(a + 8, undef)
			st64(a, 2)
			return f
		}
		fn_85138(s78, 0x100159838)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_88558(0x100159838, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(sf8, s78, 0x30)
		st64(s118 + 8, 0x10015a201)
		st32(sf8 + 0x78, 0x1774 /* error::InvalidTickIndex */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x120)
		st64(s118 + 0x10, 0x3d)
		st64(s118, 0)
		f = fn_13e5a0(s148, s118)
		g = ld64(s148)
		st64(a + 8, ld64(s148 + 8))
		st64(a, g)
		return f
	}
	fn_85138(s78, 0x100159838)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x100159838, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a201)
	st32(sf8 + 0x78, 0x1774 /* error::InvalidTickIndex */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0x115)
	st64(s118 + 0x10, 0x3d)
	st64(s118, 0)
	f = fn_13e5a0(s128, s118)
	g = ld64(s128)
	st64(a + 8, ld64(s128 + 8))
	st64(a, g)
	return f
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), d (value), c (value)
function fn_514e0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178
	let f, g, h: u64
	if (b != 0) {
		if (d != 0) {
			h = fn_644c8(s118, c, r0)
			g = ld64(s118 + 8)
			if (ld64(s118) == 1) {
				st64(a + 8, ld64(s118 + 0x10))
				st64(a, g)
				return h
			}
			h = fn_660f8(s48, g, ld64(s118 + 0x10), 0)
			f = ld64(s48 + 0x10)
			g = ld64(s48 + 8)
			if ((ld64(s48) & 1) != 0) {
				st64(a + 8, f)
				st64(a, g)
				return h
			}
			st64(s138, g, f)
			st64(s60, b, 0)
			st64(s48, 0, 1)
			h = fn_584f8(s118, s60, s138, s48)
			if (ld64(s118) != 1) {
				h = fn_88360(s158, 0x26)
				g = ld64(s158)
				st64(a + 8, ld64(s158 + 8))
				st64(a, g)
				return h
			}
		} else {
			h = fn_644c8(s118, c, r0)
			g = ld64(s118 + 8)
			if (ld64(s118) == 1) {
				st64(a + 8, ld64(s118 + 0x10))
				st64(a, g)
				return h
			}
			h = fn_660f8(s48, g, ld64(s118 + 0x10), 1)
			f = ld64(s48 + 0x10)
			g = ld64(s48 + 8)
			if ((ld64(s48) & 1) != 0) {
				st64(a + 8, f)
				st64(a, g)
				return h
			}
			st64(s128, g, f)
			st64(s60, b, 0)
			st64(s48, 0, 1)
			h = fn_584f8(s118, s60, s48, s128)
			if (ld64(s118) != 1) {
				h = fn_88360(s148, 0x26)
				g = ld64(s148)
				st64(a + 8, ld64(s148 + 8))
				st64(a, g)
				return h
			}
		}
		f = ld64(s118 + 0x10)
		const i = ld64(s118 + 8)
		if (f == 0 && i + 3 >= 4) {
			st64(a + 8, f)
			st64(a, 2)
			return h
		}
		fn_85138(s78, 0x100159834)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_88558(0x100159834, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(sf8, s78, 0x30)
		st64(s118 + 8, 0x10015a201)
		st32(sf8 + 0x78, 0x179a /* error::InvalidLimitOrderAmount */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x10a)
		st64(s118 + 0x10, 0x3d)
		st64(s118, 0)
		h = fn_13e5a0(s168, s118)
		g = ld64(s168)
		st64(a + 8, ld64(s168 + 8))
		st64(a, g)
		return h
	}
	fn_85138(s78, 0x100159888)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x100159888, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a201)
	st32(sf8 + 0x78, 0x1784 /* error::ZeroAmountSpecified */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0xfa)
	st64(s118 + 0x10, 0x3d)
	st64(s118, 0)
	h = fn_13e5a0(s178, s118)
	g = ld64(s178)
	st64(a + 8, ld64(s178 + 8))
	st64(a, g)
	return h
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
function fn_72940(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	if ((b as u16) != 0) {
		let f = fn_1561f0(a as i32, (b as u16) * 0x3c)
		if (0 > (a as i32) && (-a as u32) % ((b as u16) * 0x3c) != 0) {
			f = (f as i32) - 1
			const h = f as i32
			if (h != f) {
				fn_154788(0x1001603c8)
			}
		}
		const g = (f as i32) * ((b as u16) * 0x3c)
		if ((g as i32) != g) {
			fn_1547e0(0x1001603e0)
		}
		return g
	}
	fn_1548e8(0x1001603b0, b, c, d, e)
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

function fn_10d258(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000007 >= g) {
		raw_vec_handle_error(1, 0x100, 0x100160a18, 0x300000007, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0xd89ea9395547186a /* event:OpenLimitOrderEvent */)
	st64(g + 0x20, ld64(b + 0x18))
	st64(g + 0x18, ld64(b + 0x10))
	st64(g + 0x10, ld64(b + 8))
	st64(g + 8, ld64(b))
	copy(g + 0x28, b + 0x20, 0x20)
	st8(g + 0x48, ld8(b + 0x54))
	st32(g + 0x49, ld32(b + 0x50))
	copy(g + 0x4d, b + 0x40, 0x10)
	st64(a + 8, g, 0x5d)
	st64(a, 0x100)
}

function log_data(a: u64, b: u64): u64 {
	return sol_log_data(a, b)
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

function fn_af28(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let l, p, q, r: u64
	const f = memcmp(c, d, 0x20)
	let n = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	const h = ld64(b)
	g = common_is_closed(h)
	n = undef
	if (g != 0) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	const i = ld64(h + 0x10)
	if (ld64(i + 0x10) != 0) {
		st64(s28, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		g = fn_13e628(s38, s28)
		const t = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, t)
		return g
	}
	B25: {
		st64(i + 0x10, -1)
		const j = ld64(i + 0x18)
		st64(s28 + 8, ld64(i + 0x20))
		st64(s28, j)
		st64(s28 + 0x10, 0)
		g = fn_13e070(s28, 0x100159340, 8)
		if (g == 0) {
			g = fn_13e070(s28, b + 8, 0x20)
			if (g == 0) {
				g = fn_13e070(s28, b + 0x28, 0x20)
				if (g == 0) {
					st32(s10, ld32(b + 0xa8))
					g = fn_13e070(s28, s10, 4)
					if (g == 0) {
						st8(s10, ld8(b + 0xac))
						g = fn_13e070(s28, s10, 1)
						if (g == 0) {
							st64(s10, ld64(b + 0x48))
							g = fn_13e070(s28, s10, 8)
							if (g == 0) {
								st64(s10, ld64(b + 0x50))
								g = fn_13e070(s28, s10, 8)
								if (g == 0) {
									st64(s10, ld64(b + 0x58))
									g = fn_13e070(s28, s10, 8)
									if (g == 0) {
										st64(s10, ld64(b + 0x60))
										g = fn_13e070(s28, s10, 8)
										if (g == 0) {
											st64(s10, ld64(b + 0x68))
											g = fn_13e070(s28, s10, 8)
											if (g == 0) {
												st64(s10, ld64(b + 0x70))
												g = fn_13e070(s28, s10, 8)
												if (g == 0) {
													const m = ld64(b + 0x78)
													st64(s10 + 8, ld64(b + 0x80))
													st64(s10, m)
													g = fn_13e070(s28, s10, 0x10)
													if (g == 0) {
														g = fn_15cc8(b + 0x88, s28)
														if (g == 0) {
															n = ld64(i + 0x10) + 1
															st64(i + 0x10, n)
															st64(a + 8, n)
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
			const o = g
			if (2 > (g & 3) - 2) {
				break B25
			}
			if ((o & 3) == 0) {
				break B25
			}
			l = ld64(ld64(g + 7))
			if (l == 0) {
				break B25
			}
		} else {
			const k = g
			if (2 > (g & 3) - 2) {
				break B25
			}
			if ((k & 3) == 0) {
				break B25
			}
			l = ld64(ld64(g + 7))
			if (l == 0) {
				break B25
			}
		}
		callx(l, ld64(g - 1), l)
	}
	g = anchor_error_from(s48, 0xbbc /* anchor::AccountDidNotSerialize */, p, q, r)
	n = ld64(s48 + 8)
	const s = ld64(s48)
	st64(i + 0x10, ld64(i + 0x10) + 1)
	if (s == 2) {
		st64(a + 8, n)
		st64(a, 2)
		return g
	}
	st64(a + 8, n)
	st64(a, s)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (points to it)
function fn_db08(a: u64, b: AccountInfo): u64 {
	const s38 = fp - 0x38, s40 = fp - 0x40, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8
	let q, r: u64
	const f = b.owner
	if ((memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0) {
		r = anchor_error_from(sa8, 0xbc4 /* anchor::AccountNotInitialized */)
		q = ld64(sa8)
		st64(a + 0x10, ld64(sa8 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s58, b, g as u32)
		const p = ld64(s58 + 0x10)
		const l = ld64(s58 + 8)
		const k = ld64(s58)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s68 + 8, ld64(l + 8))
			st64(s68, m)
			r = fn_10d7d0(s58, s68, 0x800000000000001a /* Ok */)
			const n = ld64(s58 + 0x10)
			const o = ld64(s58 + 8)
			if (ld64(s58) != 0) {
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, 0)
				st64(p, ld64(p) - 1)
				return r
			}
			r = memcpy(a + 0x18, s40, 0x40)
			st64(a + 0x10, n)
			st64(a + 8, o)
			st64(a, b)
			st64(p, ld64(p) - 1)
			return r
		}
		st64(s58, k, l, p)
		r = fn_13e628(s98, s58)
		q = ld64(s98)
		st64(a + 0x10, ld64(s98 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const j = anchor_error_from(s78, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	const i = ld64(s78 + 8)
	const h = ld64(s78)
	copyr(s58, f, 0x20)
	st64(s38, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
	r = Error_with_pubkeys(s88, h, i, s58, j)
	q = ld64(s88)
	st64(a + 0x10, ld64(s88 + 8))
	st64(a + 8, q)
	st64(a, 0)
	return r
}

function fn_147a98(a: AccountInfo, b: u64, c: u64, d: u64, e: u64): u64 {
	const f: DataCell = a.data
	const g = f.borrow
	if (g > 0x7ffffffffffffffe) {
		fn_14e808(0x100161ef8, g, 0x7ffffffffffffffe, d, e)
	}
	return f.len
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

function fn_f5d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, b, c, d, e)
}

// not included (size budget), see shared.ts, ix/open_limit_order.ts:
declare function fn_6d670(a: u64, b: u64, c: u64, d: u64): u64
declare function fn_1476d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_9298(a: u64, b: AccountInfo): u64
declare function fn_7b00(a: u64, b: AccountInfo): u64
declare function fn_153158(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_14ec00(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_158b50(a: u64, b: u64): u64
declare function fn_154940(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_e480(a: u64, b: u64, c: u64, d: u64, r0: u64, r7: u64): u64
declare function fn_644c8(a: u64, b: u64, r0: u64): u64
declare function fn_660f8(a: u64, b: u64, c: u64, d: u64): u64
declare function fn_584f8(a: u64, b: u64, c: u64, d: u64): u64
declare function fn_1548e8(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_1547e0(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_154788(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_84360(a: u64, b: AccountInfo): u64
declare function fn_82dd0(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: LamportsCell): u64
declare function fn_84740(a: u64, b: AccountInfo): u64
declare function fn_849c0(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64
declare function fn_71530(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_71a20(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_14ec98(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_154730(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_10d7d0(a: u64, b: u64, c: u64, d: u64, e: u64): u64
