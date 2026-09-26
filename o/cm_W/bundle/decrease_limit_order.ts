// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction decrease_limit_order: handler + 55 reachable functions
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
interface DecreaseLimitOrderArgs extends sized<0x10> { // arguments of instruction decrease_limit_order (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	amount:     at<0x00, u64>
	amount_min: at<0x08, u64>
}
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_log_data(slices: u64, len: u64): void // log base64 data: slices = &[&[u8]]
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function sol_memset(dst: u64, byte: u64, n: u64): void // memset
declare function fn_11e0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function fn_13d0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function try_accounts_1678(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::interface_account::InterfaceAccount<T> as anchor_lang::Accounts<B>…
declare function fn_1730(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_7498(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses try_accounts_1678, alloc_handle_alloc_error, memcpy
declare function fn_7768(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses try_accounts_15c0, alloc_handle_alloc_error, memcpy
declare function fn_a1d8(a: u64, b: u64, c: u64, d: u64): u64 // lib uses memcmp, common_is_closed
declare function fn_e948(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib uses Mint_unpack_from_slice_137968, raw_vec_handle_error, memset2, memcmp
declare function AccountInfo_clone_f338(a: u64, b: u64): u64 // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function ptr_drop_in_place_fcd8(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<solana_account_info::AccountInfo>
declare function ptr_drop_in_place_fd78(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_account_info::AccountInfo; 4]>
declare function Rc_drop_slow_14df0(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function fn_15cc8(a: u64, b: u64): u64 // lib
declare function try_accounts_17a30(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function fn_18cf0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp, Error_with_pubkeys
declare function try_accounts_19190(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_103fe8(a: u64, b: u64, c: u64): u64 // lib uses __multi3_159030
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function token_transfer(a: u64, b: u64, c: u64): u64 // lib anchor_spl::token::transfer
declare function token_2022_transfer_checked(a: u64, b: u64, c: u64, d: u64): u64 // lib anchor_spl::token_2022::transfer_checked
declare function fn_132590(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses __multi3_159030, __udivti3
declare function fn_132b38(a: u64, b: u64): void // lib
declare function fn_132ff0(a: u64, b: u64, c: u64): void // lib
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
declare function fmt_write(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::write
declare function imp_fmt(a: u64, b: u64): u64 // lib core::fmt::num::imp::<impl core::fmt::Display for i32>::fmt
declare function imp__fmt_155760(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u64>::_fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function fn_1561f0(a: u64, b: u64): u64 // lib
declare function __udivti3(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __udivti3
declare function __multi3_159030(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __multi3

// instruction handler: decrease_limit_order (discriminator sha256("global:decrease_limit_order")[..8] = 0xa33142673c9d75)
// accounts [idl]: 0 owner [signer], 1 pool_state [mut], 2 tick_array [mut], 3 limit_order [mut], 4 input_token_account [mut], 5 output_token_account [mut], 6 input_vault [mut], 7 output_vault [mut], 8 input_vault_mint, 9 output_vault_mint, 10 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 11 token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb]
// args [idl]: amount: u64, amount_min: u64
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, amount, amount_min
function ix_decrease_limit_order(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const sf8 = fp - 0xf8, s108 = fp - 0x108, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250
	let l, p: u64
	const i = sol_log("Instruction: DecreaseLimitOrder", 0x1f)
	const f = ix_args_len
	if (f >= 8 && (f & -8) != 8) {
		const args: DecreaseLimitOrderArgs = ix_args
		const amount = args.amount
		const amount_min = args.amount_min
		st64(s220, accounts, accounts_len)
		p = accounts_decrease_limit_order(s108, amount, s220, undef, fp, i)
		const k = ld64(s108 + 8)
		l = ld64(s108)
		const j = ld8(sf8 + 0xf4)
		if (j == 2) {
			st64(a + 8, k)
			st64(a, l)
			return p
		}
		const m = memcpy(s200, sf8, 0xf4)
		st16(s200 + 0xf5, ld16(sf8 + 0xf5))
		st8(s200 + 0xf7, ld8(sf8 + 0xf7))
		st8(s200 + 0xf4, j)
		st64(s210, l, k)
		copyr(sf8, s220, 0x10)
		st64(s108, program_id, s210)
		p = fn_530f0(s230, s108, amount, amount_min, m)
		l = ld64(s230)
		if (l == 2) {
			p = fn_ea788(s240, s210, program_id)
			l = ld64(s240)
			st64(a + 8, ld64(s240 + 8))
			st64(a, l)
			return p
		}
		st64(a + 8, ld64(s230 + 8))
		st64(a, l)
		return p
	}
	const n = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (n & 3) - 2) {
		p = anchor_error_from(s250, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s250)
		st64(a + 8, ld64(s250 + 8))
		st64(a, l)
		return p
	}
	if ((n & 3) == 0) {
		p = anchor_error_from(s250, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s250)
		st64(a + 8, ld64(s250 + 8))
		st64(a, l)
		return p
	}
	const o = ld64(ld64(n + 7))
	if (o == 0) {
		p = anchor_error_from(s250, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s250)
		st64(a + 8, ld64(s250 + 8))
		st64(a, l)
		return p
	}
	callx(o, ld64(n - 1), o)
	p = anchor_error_from(s250, 0x66 /* anchor::InstructionDidNotDeserialize */)
	l = ld64(s250)
	st64(a + 8, ld64(s250 + 8))
	st64(a, l)
	return p
}

// Anchor Accounts::try_accounts of instruction decrease_limit_order (called by ix_decrease_limit_order; name [str]: from the handler's "Instruction: …" log; was fn_e82b8)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: output_token_account (ConstraintMut), input_vault (ConstraintMut, ConstraintRaw), output_vault (ConstraintMut, ConstraintRaw), input_vault_mint (ConstraintAddress), output_vault_mint (ConstraintAddress), token_program, token_program_2022, input_token_account (ConstraintMut), limit_order (ConstraintMut), tick_array (ConstraintMut, ConstraintRaw), pool_state (ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: output_vault_mint_box, input_vault_box, output_vault_box, input_vault_box_2, output_vault_box_2, pool_state [idl], tick_array [idl], input_vault [idl], output_vault [idl]
function accounts_decrease_limit_order(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const sc8 = fp - 0xc8, sd8 = fp - 0xd8, sf8 = fp - 0xf8, s118 = fp - 0x118, s138 = fp - 0x138, s158 = fp - 0x158, s170 = fp - 0x170, s190 = fp - 0x190, s1b0 = fp - 0x1b0, s250 = fp - 0x250, s2e0 = fp - 0x2e0, s2f8 = fp - 0x2f8, s300 = fp - 0x300, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s598 = fp - 0x598, s5a0 = fp - 0x5a0, s5a8 = fp - 0x5a8, s5b0 = fp - 0x5b0, s5b8 = fp - 0x5b8, s5c0 = fp - 0x5c0, s5c8 = fp - 0x5c8, s5d0 = fp - 0x5d0, s5d8 = fp - 0x5d8, s5e0 = fp - 0x5e0, s5e8 = fp - 0x5e8
	let l, m, ag, ah, ai, al, am, ao, ap, ar, at, av, aw, ay, az, bd, be, bk, bl, bm, bo, bp, bu, bw, bx, by, cd: u64
	let tick_array: AccountInfo
	let j = a
	let p = try_accounts_17a30(sd8, c, c, d, e, r0)
	const i = ld64(sd8 + 8)
	let f = ld64(sd8)
	if (f == 2) {
		p = fn_11e0(sd8, c)
		let o = ld64(sd8 + 8)
		f = ld64(sd8)
		if (f == 2) {
			fn_13d0(sd8, c)
			p = ld64(sd8 + 8)
			f = ld64(sd8)
			if (f == 2) {
				st64(s598 + 0x18, p)
				fn_181f8(sd8, c)
				p = ld64(sd8 + 8)
				const s = ld64(sd8)
				const q = ld8(sc8 + 0x9c)
				if (q == 2) {
					const r = ld64(0x300000000 /* heap bump-allocator cursor */)
					const t = r != 0 ? sat_sub(r, 0xb) : 0x300007ff5
					if ((s & 1) != 0) {
						if (0x300000008 > t) {
							raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0xb > r, s)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, t)
						st64(t, 0x726f5f74696d696c)
						st32(t + 7, 0x72656472)
						void ld64(p)
					} else {
						if (0x300000008 > t) {
							raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0xb > r, s)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, t)
						st64(t, 0x726f5f74696d696c)
						st32(t + 7, 0x72656472)
						void ld64(p)
					}
					st64(p + 0x10, t, 0xb)
					st64(p + 8, 0xb)
					st64(p, 1)
					st64(j + 8, p)
					st64(j, s)
					st8(j + 0x104, 2)
					return p
				}
				st64(s5a8, i)
				st64(s598, o, q, j)
				memcpy(s250, sc8, 0x9c)
				st16(s2e0 + 0x8c, ld16(sc8 + 0x9d))
				st8(s2e0 + 0x8e, ld8(sc8 + 0x9f))
				st64(s5b0, p)
				st64(s300, p)
				st64(s5a0, s)
				st64(s318 + 0x10, s)
				memcpy(s2f8, s250, 0x9c)
				const w = ld64(s598 + 8)
				st8(s2e0 + 0x84, w)
				st16(s2e0 + 0x85, ld16(s2e0 + 0x8c))
				st8(s2e0 + 0x87, ld8(s2e0 + 0x8e))
				p = try_accounts_1678(sd8, c)
				if (ld32(sc8 + 0xa0) == 2) {
					const z = ld64(0x300000000 /* heap bump-allocator cursor */)
					const ad = ld64(s598 + 0x10)
					const aa = ld64(sd8)
					const ab = z != 0 ? sat_sub(z, 0x13) : 0x300007fed
					const ac = ld64(sd8 + 8)
					if (aa != 0) {
						if (0x300000008 > ab) {
							raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008, ad)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ab)
						st64(ab + 8, 0x6f6363615f6e656b)
						st64(ab, 0x6f745f7475706e69)
						st32(ab + 0xf, 0x746e756f)
						void ld64(ac)
					} else {
						if (0x300000008 > ab) {
							raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008, ad)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ab)
						st64(ab + 8, 0x6f6363615f6e656b)
						st64(ab, 0x6f745f7475706e69)
						st32(ab + 0xf, 0x746e756f)
						void ld64(ac)
					}
					st64(ac + 0x10, ab, 0x13)
					st64(ac + 8, 0x13)
					st64(ac, 1)
					st64(ad + 8, ac)
					st64(ad, aa)
					st8(ad + 0x104, 2)
					return p
				}
				const x = ld64(0x300000000 /* heap bump-allocator cursor */)
				const pool_state: AccountInfo = ld64(s598)
				j = ld64(s598 + 0x10)
				const y = x != 0 ? sat_sub(x, 0xd8) : 0x300007f28
				if (0x300000008 > y) {
					alloc_handle_alloc_error(8, 0xd8)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, y & -8)
				if ((y & -8) != 0) {
					st64(s5c0, y & -8)
					memcpy(y & -8, sd8, 0xd8)
					try_accounts_1678(sd8, c)
					if (ld32(sc8 + 0xa0) == 2) {
						p = fn_4130(s318, ld64(sd8), ld64(sd8 + 8), "output_token_account", 0x14)
						st64(s5b8, ld64(s318 + 8))
						f = ld64(s318)
						if (f != 2) {
							st64(j + 8, ld64(s5b8))
							st64(j, f)
							st8(j + 0x104, 2)
							return p
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
						st64(s5b8, af & -8)
						memcpy(af & -8, sd8, 0xd8)
					}
					fn_7498(sd8, c, ag, ah, ai)
					let output_vault_mint_box: Mint = ld64(sd8 + 8)
					const aj = ld64(sd8)
					if (aj != 2) {
						p = fn_4130(s328, aj, output_vault_mint_box, 0x10015b11e /* "input_vault" */, 0xb)
						output_vault_mint_box = ld64(s328 + 8)
						f = ld64(s328)
						if (f != 2) {
							st64(j + 8, output_vault_mint_box)
							st64(j, f)
							st8(j + 0x104, 2)
							return p
						}
					}
					st64(s5c8, output_vault_mint_box)
					fn_7498(sd8, c, output_vault_mint_box, al, am)
					output_vault_mint_box = ld64(sd8 + 8)
					const an = ld64(sd8)
					if (an != 2) {
						p = fn_4130(s338, an, output_vault_mint_box, "output_vault", 0xc)
						output_vault_mint_box = ld64(s338 + 8)
						f = ld64(s338)
						if (f != 2) {
							st64(j + 8, output_vault_mint_box)
							st64(j, f)
							st8(j + 0x104, 2)
							return p
						}
					}
					st64(s5d0, output_vault_mint_box)
					fn_7768(sd8, c, output_vault_mint_box, ao, ap)
					output_vault_mint_box = ld64(sd8 + 8)
					const aq = ld64(sd8)
					if (aq != 2) {
						p = fn_4130(s348, aq, output_vault_mint_box, "input_vault_mint", 0x10)
						output_vault_mint_box = ld64(s348 + 8)
						f = ld64(s348)
						if (f != 2) {
							st64(j + 8, output_vault_mint_box)
							st64(j, f)
							st8(j + 0x104, 2)
							return p
						}
					}
					st64(s5d8, output_vault_mint_box)
					fn_7768(sd8, c, output_vault_mint_box, ar, at)
					output_vault_mint_box = ld64(sd8 + 8)
					const au = ld64(sd8)
					if (au != 2) {
						p = fn_4130(s358, au, output_vault_mint_box, "output_vault_mint", 0x11)
						output_vault_mint_box = ld64(s358 + 8)
						f = ld64(s358)
						if (f != 2) {
							st64(j + 8, output_vault_mint_box)
							st64(j, f)
							st8(j + 0x104, 2)
							return p
						}
					}
					st64(s5e0, output_vault_mint_box)
					try_accounts_19190(sd8, c, output_vault_mint_box, av, aw)
					output_vault_mint_box = ld64(sd8 + 8)
					const ax = ld64(sd8)
					if (ax != 2) {
						p = fn_4130(s368, ax, output_vault_mint_box, 0x10015b020 /* "token_program" */, 0xd)
						output_vault_mint_box = ld64(s368 + 8)
						f = ld64(s368)
						if (f != 2) {
							st64(j + 8, output_vault_mint_box)
							st64(j, f)
							st8(j + 0x104, 2)
							return p
						}
					}
					st64(s5e8, output_vault_mint_box)
					p = fn_18cf0(sd8, c, output_vault_mint_box, ay, az)
					output_vault_mint_box = ld64(sd8 + 8)
					const ba = ld64(sd8)
					if (ba != 2) {
						p = fn_4130(s378, ba, output_vault_mint_box, "token_program_2022", 0x12)
						output_vault_mint_box = ld64(s378 + 8)
						f = ld64(s378)
						tick_array = ld64(s598 + 0x18)
						if (f != 2) {
							st64(j + 8, output_vault_mint_box)
							st64(j, f)
							st8(j + 0x104, 2)
							return p
						}
					} else {
						tick_array = ld64(s598 + 0x18)
					}
					if (pool_state.is_writable != 0) {
						if (tick_array.is_writable != 0) {
							const cq: Mint = output_vault_mint_box
							p = fn_4bd8(sd8, tick_array, p)
							o = ld64(sc8)
							f = ld64(sd8 + 8)
							if (ld64(sd8) != 0) {
								st64(j + 8, o)
								st64(j, f)
								st8(j + 0x104, 2)
								return p
							}
							const bf = ld64(ld64(s598))
							copyr(s1b0, bf, 0x20)
							const bg = memcmp(f, s1b0, 0x20)
							st64(o, ld64(o) - 1)
							if ((bg as u32) == 0) {
								if (ld8(ld64(s5a0) + 0x29) != 0) {
									copyr(sd8, s1b0, 0x20)
									const bh = memcmp(s300, sd8, 0x20)
									if ((bh as u32) == 0) {
										const bi = ld64(ld64(s5a8))
										copyr(s190, bi, 0x20)
										const bj = memcmp(s2e0, s190, 0x20)
										if ((bj as u32) == 0) {
											if (ld8(ld64(ld64(s5c0) + 0x20) + 0x29) != 0) {
												copyr(sd8, bi, 0x20)
												if ((memcmp(ld64(s5c0) + 0x48, sd8, 0x20) as u32) != 0) {
													p = anchor_error_from(s448, 0x7df /* anchor::ConstraintTokenOwner */)
													bp = ld64(s448)
													bo = ld64(s598 + 0x10)
													st64(bo + 8, ld64(s448 + 8))
													st64(bo, bp)
													st8(bo + 0x104, 2)
													return p
												}
												const input_vault_box: TokenAccount = ld64(s5c8)
												copyr(sd8, input_vault_box.mint, 0x20)
												if ((memcmp(ld64(s5c0) + 0x28, sd8, 0x20) as u32) == 0) {
													if (ld8(ld64(ld64(s5b8) + 0x20) + 0x29) != 0) {
														copyr(sd8, bi, 0x20)
														if ((memcmp(ld64(s5b8) + 0x48, sd8, 0x20) as u32) != 0) {
															p = anchor_error_from(s488, 0x7df /* anchor::ConstraintTokenOwner */)
															bp = ld64(s488)
															bo = ld64(s598 + 0x10)
															st64(bo + 8, ld64(s488 + 8))
															st64(bo, bp)
															st8(bo + 0x104, 2)
															return p
														}
														const output_vault_box: TokenAccount = ld64(s5d0)
														copyr(sd8, output_vault_box.mint, 0x20)
														const br = memcmp(ld64(s5b8) + 0x28, sd8, 0x20)
														if ((br as u32) == 0) {
															const input_vault: AccountInfo = ld64(ld64(s5c8) + 0x20)
															if (input_vault.is_writable != 0) {
																if ((w & 1) != 0) {
																	const bv = input_vault.key
																	copyr(sd8, bv, 0x20)
																	p = fn_4dc0(s170, ld64(s598), br as u32)
																	bx = ld64(s170 + 0x10)
																	bu = ld64(s170 + 8)
																	if (ld64(s170) != 0) {
																		bw = ld64(s598 + 0x10)
																		st64(bw + 8, bx)
																		st64(bw, bu)
																		st8(bw + 0x104, 2)
																		return p
																	}
																	by = bu + 0x81
																} else {
																	const bt = input_vault.key
																	copyr(sd8, bt, 0x20)
																	p = fn_4dc0(s170, ld64(s598), br as u32)
																	bx = ld64(s170 + 0x10)
																	bu = ld64(s170 + 8)
																	if (ld64(s170) != 0) {
																		bw = ld64(s598 + 0x10)
																		st64(bw + 8, bx)
																		st64(bw, bu)
																		st8(bw + 0x104, 2)
																		return p
																	}
																	by = bu + 0xa1
																}
																const bz = memcmp(sd8, by, 0x20)
																st64(bx, ld64(bx) - 1)
																if ((bz as u32) == 0) {
																	const output_vault: AccountInfo = ld64(ld64(s5d0) + 0x20)
																	if (output_vault.is_writable != 0) {
																		if ((w & 1) != 0) {
																			const cc = output_vault.key
																			copyr(sd8, cc, 0x20)
																			p = fn_4dc0(s170, ld64(s598), bz as u32)
																			bx = ld64(s170 + 0x10)
																			bu = ld64(s170 + 8)
																			if (ld64(s170) != 0) {
																				bw = ld64(s598 + 0x10)
																				st64(bw + 8, bx)
																				st64(bw, bu)
																				st8(bw + 0x104, 2)
																				return p
																			}
																			cd = bu + 0xa1
																		} else {
																			const cb = output_vault.key
																			copyr(sd8, cb, 0x20)
																			p = fn_4dc0(s170, ld64(s598), bz as u32)
																			bx = ld64(s170 + 0x10)
																			bu = ld64(s170 + 8)
																			if (ld64(s170) != 0) {
																				bw = ld64(s598 + 0x10)
																				st64(bw + 8, bx)
																				st64(bw, bu)
																				st8(bw + 0x104, 2)
																				return p
																			}
																			cd = bu + 0x81
																		}
																		const ce = memcmp(sd8, cd, 0x20)
																		st64(bx, ld64(bx) - 1)
																		if ((ce as u32) == 0) {
																			const input_vault_box_2: TokenAccount = ld64(s5c8)
																			const cg = ld64(ld64(ld64(s5d8) + 0x58))
																			copyr(s158, cg, 0x20)
																			copy(s138, input_vault_box_2.mint, 0x20)
																			if ((memcmp(s158, s138, 0x20) as u32) != 0) {
																				anchor_error_from(s528, 0x7dc /* anchor::ConstraintAddress */)
																				const co = fn_4130(s538, ld64(s528), ld64(s528 + 8), "input_vault_mint", 0x10)
																				const cn = ld64(s538 + 8)
																				const cm = ld64(s538)
																				copy(sd8, s158, 0x40)
																				p = Error_with_pubkeys(s548, cm, cn, sd8, co)
																				bp = ld64(s548)
																				bo = ld64(s598 + 0x10)
																				st64(bo + 8, ld64(s548 + 8))
																				st64(bo, bp)
																				st8(bo + 0x104, 2)
																				return p
																			}
																			const output_vault_box_2: TokenAccount = ld64(s5d0)
																			const ci = ld64(ld64(ld64(s5e0) + 0x58))
																			copyr(s118, ci, 0x20)
																			copy(sf8, output_vault_box_2.mint, 0x20)
																			if ((memcmp(s118, sf8, 0x20) as u32) == 0) {
																				const cp = ld64(s598 + 0x10)
																				p = memcpy(cp + 0x68, s250, 0x9c)
																				const cs = ld8(s2e0 + 0x8e)
																				const cr = ld16(s2e0 + 0x8c)
																				st8(cp + 0x104, w)
																				st64(cp + 0x60, ld64(s5b0))
																				st64(cp + 0x58, ld64(s5a0))
																				st64(cp + 0x50, cq)
																				st64(cp + 0x48, ld64(s5e8))
																				st64(cp + 0x40, ld64(s5e0))
																				st64(cp + 0x38, ld64(s5d8))
																				st64(cp + 0x30, ld64(s5d0))
																				st64(cp + 0x28, ld64(s5c8))
																				st64(cp + 0x20, ld64(s5b8))
																				st64(cp + 0x18, ld64(s5c0))
																				st64(cp + 0x10, ld64(s598 + 0x18))
																				st64(cp + 8, ld64(s598))
																				st64(cp, ld64(s5a8))
																				st16(cp + 0x105, cr)
																				st8(cp + 0x107, cs)
																				return p
																			}
																			anchor_error_from(s558, 0x7dc /* anchor::ConstraintAddress */)
																			const cl = fn_4130(s568, ld64(s558), ld64(s558 + 8), "output_vault_mint", 0x11)
																			const ck = ld64(s568 + 8)
																			const cj = ld64(s568)
																			copy(sd8, s118, 0x40)
																			p = Error_with_pubkeys(s578, cj, ck, sd8, cl)
																			bp = ld64(s578)
																			bo = ld64(s598 + 0x10)
																			st64(bo + 8, ld64(s578 + 8))
																			st64(bo, bp)
																			st8(bo + 0x104, 2)
																			return p
																		}
																		anchor_error_from(s508, 0x7d3 /* anchor::ConstraintRaw */)
																		p = fn_4130(s518, ld64(s508), ld64(s508 + 8), "output_vault", 0xc)
																		bp = ld64(s518)
																		bo = ld64(s598 + 0x10)
																		st64(bo + 8, ld64(s518 + 8))
																		st64(bo, bp)
																		st8(bo + 0x104, 2)
																		return p
																	}
																	anchor_error_from(s4e8, 0x7d0 /* anchor::ConstraintMut */)
																	p = fn_4130(s4f8, ld64(s4e8), ld64(s4e8 + 8), "output_vault", 0xc)
																	bp = ld64(s4f8)
																	bo = ld64(s598 + 0x10)
																	st64(bo + 8, ld64(s4f8 + 8))
																	st64(bo, bp)
																	st8(bo + 0x104, 2)
																	return p
																}
																anchor_error_from(s4c8, 0x7d3 /* anchor::ConstraintRaw */)
																p = fn_4130(s4d8, ld64(s4c8), ld64(s4c8 + 8), 0x10015b11e /* "input_vault" */, 0xb)
																bp = ld64(s4d8)
																bo = ld64(s598 + 0x10)
																st64(bo + 8, ld64(s4d8 + 8))
																st64(bo, bp)
																st8(bo + 0x104, 2)
																return p
															}
															anchor_error_from(s4a8, 0x7d0 /* anchor::ConstraintMut */)
															p = fn_4130(s4b8, ld64(s4a8), ld64(s4a8 + 8), 0x10015b11e /* "input_vault" */, 0xb)
															bp = ld64(s4b8)
															bo = ld64(s598 + 0x10)
															st64(bo + 8, ld64(s4b8 + 8))
															st64(bo, bp)
															st8(bo + 0x104, 2)
															return p
														}
														p = anchor_error_from(s498, 0x7de /* anchor::ConstraintTokenMint */)
														bp = ld64(s498)
														bo = ld64(s598 + 0x10)
														st64(bo + 8, ld64(s498 + 8))
														st64(bo, bp)
														st8(bo + 0x104, 2)
														return p
													}
													anchor_error_from(s468, 0x7d0 /* anchor::ConstraintMut */)
													p = fn_4130(s478, ld64(s468), ld64(s468 + 8), "output_token_account", 0x14)
													bp = ld64(s478)
													bo = ld64(s598 + 0x10)
													st64(bo + 8, ld64(s478 + 8))
													st64(bo, bp)
													st8(bo + 0x104, 2)
													return p
												}
												p = anchor_error_from(s458, 0x7de /* anchor::ConstraintTokenMint */)
												bp = ld64(s458)
												bo = ld64(s598 + 0x10)
												st64(bo + 8, ld64(s458 + 8))
												st64(bo, bp)
												st8(bo + 0x104, 2)
												return p
											}
											anchor_error_from(s428, 0x7d0 /* anchor::ConstraintMut */, bk, bl, bm)
											p = fn_4130(s438, ld64(s428), ld64(s428 + 8), "input_token_account", 0x13)
											bp = ld64(s438)
											bo = ld64(s598 + 0x10)
											st64(bo + 8, ld64(s438 + 8))
											st64(bo, bp)
											st8(bo + 0x104, 2)
											return p
										}
									}
									anchor_error_from(s408, 0x7d3 /* anchor::ConstraintRaw */, bk, bl, bm)
									p = fn_4130(s418, ld64(s408), ld64(s408 + 8), 0x10015b336 /* "limit_order" */, 0xb)
									f = ld64(s418)
									st64(j + 8, ld64(s418 + 8))
									st64(j, f)
									st8(j + 0x104, 2)
									return p
								}
								anchor_error_from(s3e8, 0x7d0 /* anchor::ConstraintMut */)
								p = fn_4130(s3f8, ld64(s3e8), ld64(s3e8 + 8), 0x10015b336 /* "limit_order" */, 0xb)
								f = ld64(s3f8)
								st64(j + 8, ld64(s3f8 + 8))
								st64(j, f)
								st8(j + 0x104, 2)
								return p
							}
							anchor_error_from(s3c8, 0x7d3 /* anchor::ConstraintRaw */)
							p = fn_4130(s3d8, ld64(s3c8), ld64(s3c8 + 8), 0x10015a23e /* "tick_array" */, 0xa)
							f = ld64(s3d8)
							st64(j + 8, ld64(s3d8 + 8))
							st64(j, f)
							st8(j + 0x104, 2)
							return p
						}
						anchor_error_from(s3a8, 0x7d0 /* anchor::ConstraintMut */, output_vault_mint_box, bd, be)
						p = fn_4130(s3b8, ld64(s3a8), ld64(s3a8 + 8), 0x10015a23e /* "tick_array" */, 0xa)
						f = ld64(s3b8)
						st64(j + 8, ld64(s3b8 + 8))
						st64(j, f)
						st8(j + 0x104, 2)
						return p
					}
					anchor_error_from(s388, 0x7d0 /* anchor::ConstraintMut */, output_vault_mint_box, bd, be)
					p = fn_4130(s398, ld64(s388), ld64(s388 + 8), "pool_state", 0xa)
					f = ld64(s398)
					st64(j + 8, ld64(s398 + 8))
					st64(j, f)
					st8(j + 0x104, 2)
					return p
				}
				alloc_handle_alloc_error(8, 0xd8)
			}
			const u = ld64(0x300000000 /* heap bump-allocator cursor */)
			l = 0xa > u
			m = l != 0 ? 0 : u - 0xa
			const v = u != 0 ? m : 0x300007ff6
			if ((f & 1) != 0) {
				if (0x300000008 > v) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, m, l)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, v)
				st64(v, 0x7272615f6b636974)
				st16(v + 8, 0x7961)
				void ld64(p)
			} else {
				if (0x300000008 > v) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, m, l)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, v)
				st64(v, 0x7272615f6b636974)
				st16(v + 8, 0x7961)
				void ld64(p)
			}
			st64(p + 0x10, v, 0xa)
			st64(p + 8, 0xa)
			st64(p, 1)
			st64(j + 8, p)
			st64(j, f)
			st8(j + 0x104, 2)
			return p
		}
		const k = ld64(0x300000000 /* heap bump-allocator cursor */)
		l = 0xa > k
		m = l != 0 ? 0 : k - 0xa
		const n = k != 0 ? m : 0x300007ff6
		if ((f & 1) != 0) {
			if (0x300000008 > n) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, m, l)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, n)
			st64(n, 0x6174735f6c6f6f70)
			st16(n + 8, 0x6574)
			void ld64(o)
		} else {
			if (0x300000008 > n) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, m, l)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, n)
			st64(n, 0x6174735f6c6f6f70)
			st16(n + 8, 0x6574)
			void ld64(o)
		}
		st64(o + 0x10, n, 0xa)
		st64(o + 8, 0xa)
		st64(o, 1)
		st64(j + 8, o)
		st64(j, f)
		st8(j + 0x104, 2)
		return p
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 5) : 0x300007ffb
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(g, 5), 5 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 4, 0x72)
		st32(h, 0x656e776f)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(g, 5), 5 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 4, 0x72)
		st32(h, 0x656e776f)
		void ld64(i)
	}
	st64(i + 0x10, h, 5)
	st64(i + 8, 5)
	st64(i, 1)
	st64(j + 8, i)
	st64(j, f)
	st8(j + 0x104, 2)
	return p
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: AccountInfo, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value)
// types [heur]: b: DecreaseLimitOrderContext (the handler ix_decrease_limit_order passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_530f0(a: u64, b: DecreaseLimitOrderContext, c: u64, d: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s90 = fp - 0x90, s108 = fp - 0x108, s110 = fp - 0x110, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8, s200 = fp - 0x200, s208 = fp - 0x208, s210 = fp - 0x210, s218 = fp - 0x218, s1000 = fp - 0x1000
	let g, i, o, p, bu, cd, ce, cf, cn: u64
	st64(s1d8 + 0x10, a)
	if (c != 0) {
		st64(s1d8, b, d)
		const accounts: DecreaseLimitOrderAccounts = b.accounts
		i = fn_4dc0(s130, ld64(accounts + 8), r0)
		let h = ld64(s130 + 0x10)
		g = ld64(s130 + 8)
		if (ld64(s130) != 0) {
			p = ld64(s1d8 + 0x10)
			st64(p + 8, h)
			st64(p, g)
			return i
		}
		const l = ld16(g + 0xe3)
		st64(h, ld64(h) - 1)
		i = fn_51c8(s130, ld64(accounts + 0x10), h, undef, undef, i)
		const j = ld64(s130 + 0x10)
		const k = ld64(s130 + 8)
		h = j
		g = k
		if (ld64(s130) != 0) {
			p = ld64(s1d8 + 0x10)
			st64(p + 8, h)
			st64(p, g)
			return i
		}
		st64(s1e0, j)
		const m = ld32(accounts + 0x100)
		st64(s1e8, k)
		i = fn_71a20(s130, ld32(k + 0x20), m, l)
		g = ld64(s130)
		if (g != 2) {
			h = ld64(s130 + 8)
			o = ld64(s1e0)
			st64(o, ld64(o) + 1)
			p = ld64(s1d8 + 0x10)
			st64(p + 8, h)
			st64(p, g)
			return i
		}
		const n = ld64(s130 + 8)
		if (0x3c > n) {
			const q = ld64(s1e8) + 0x24 + n * 0xa8
			let r = 1
			if ((ld64(q + 0x14) | ld64(q + 0x1c)) == 0 && ld64(q + 0x7c) == 0) {
				r = ld64(q + 0x84) != 0
			}
			st64(s1f8, r)
			st64(s208, l)
			st64(s1f0, accounts)
			i = fn_67490(s130, accounts + 0x60, q, c, i)
			let s = ld64(s130 + 0x10)
			const t = ld64(s130 + 8)
			h = s
			g = t
			if (ld64(s130) != 0) {
				o = ld64(s1e0)
				st64(o, ld64(o) + 1)
				p = ld64(s1d8 + 0x10)
				st64(p + 8, h)
				st64(p, g)
				return i
			}
			const u: DecreaseLimitOrderAccounts = ld64(s1f0)
			const v = ld64(ld64(u + 8))
			copyr(s130, v, 0x20)
			const w = ld64(ld64(u + 0x58))
			copyr(s110, w, 0x20)
			const x = ld64(0x300000000 /* heap bump-allocator cursor */)
			const y = x != 0 ? sat_sub(x, 0x100) : 0x300007f00
			st64(s200, t)
			if (y > 0x300000007) {
				B35: {
					B17: {
						st64(s210, u + 8)
						const ad = ld8(u + 0x104)
						const ac = ld32(u + 0x100)
						const ab = ld64(u + 0xa8)
						const aa = ld64(u + 0xb0)
						st64(0x300000000 /* heap bump-allocator cursor */, y)
						st64(y, 0xa3d4eddbdd283046 /* event:DecreaseLimitOrderEvent */)
						copy(y + 8, s130, 0x40)
						st64(y + 0x65, s)
						const z = ld64(s200)
						st64(y + 0x5d, z)
						st64(y + 0x55, aa)
						st64(y + 0x4d, ab)
						st32(y + 0x49, ac)
						st8(y + 0x48, ad)
						st64(s48, y, 0x6d)
						i = log_data(s48, 1)
						h = undef
						if ((ld64(s1f8) & 1) != 0 && ((ld64(q + 0x14) | ld64(q + 0x1c)) == 0 && (ld64(q + 0x7c) == 0 && ld64(q + 0x84) == 0))) {
							const bs = ld64(s1e8)
							const bt = ld8(bs + 0x2784)
							if (bt == 0) {
								i = fn_88360(s140, 0x26)
								h = ld64(s140 + 8)
								g = ld64(s140)
								if (g != 2) {
									o = ld64(s1e0)
									st64(o, ld64(o) + 1)
									p = ld64(s1d8 + 0x10)
									st64(p + 8, h)
									st64(p, g)
									return i
								}
								bu = ld8(ld64(s1e8) + 0x2784)
							} else {
								bu = bt - 1
								st8(bs + 0x2784, bu)
							}
							if ((bu as u8) == 0) {
								i = fn_53e8(s130, ld64(ld64(s210)), h, ce, cf, i)
								h = ld64(s130 + 0x10)
								g = ld64(s130 + 8)
								if (ld64(s130) != 0) {
									o = ld64(s1e0)
									st64(o, ld64(o) + 1)
									p = ld64(s1d8 + 0x10)
									st64(p + 8, h)
									st64(p, g)
									return i
								}
								const cm = h
								const cg = fn_72940(ld32(ld64(s1f0) + 0x100), ld64(s208), h)
								const ch = ld64(0x300000000 /* heap bump-allocator cursor */)
								const ci = ch != 0 ? sat_sub(ch, 4) & -4 : 0x300007ffc
								if (0x300000008 > ci) {
									alloc_handle_alloc_error(4, 4)
								}
								B61: {
									st64(0x300000000 /* heap bump-allocator cursor */, ci)
									st32(ci, cg)
									st64(s130, 1, ci, 1)
									const cj = fn_6f618(g, s130)
									let cl = 0
									if (cj != 0) {
										const ck = ld64(s1d8)
										if (ld64(ck + 0x18) == 0) {
											fn_85138(s90, 0x1001598a0)
											st64(s78, 0, 1, 0)
											st64(s28, s78, 0x10015f818)
											st8(s20 + 0x10, 3)
											st64(s20 + 8, 0x20)
											st64(s38, 0)
											st64(s48, 0)
											if (fn_88558(0x1001598a0, s48) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copy(s110, s90, 0x30)
											st64(s130 + 8, 0x10015a289)
											st32(s108 + 0x70, 0x1772 /* error::AccountLack */)
											st8(s108 + 0x28, 2)
											st32(s130 + 0x18, 0x89)
											st64(s130 + 0x10, 0x41)
											st64(s130, 0)
											i = fn_13e5a0(s1b0, s130)
											cn = ld64(s1b0 + 8)
											g = ld64(s1b0)
											break B61
										}
										cl = ld64(ck + 0x10)
									}
									i = fn_6d670(s150, g, cl, cg)
									h = undef
									cn = ld64(s150 + 8)
									g = ld64(s150)
									if (g == 2) {
										st64(cm, ld64(cm) + 1)
										if (ld64(s200) == 0) {
											break B35
										}
										break B17
									}
								}
								st64(cm, ld64(cm) + 1)
								o = ld64(s1e0)
								st64(o, ld64(o) + 1)
								p = ld64(s1d8 + 0x10)
								st64(p + 8, cn)
								st64(p, g)
								return i
							}
						}
						if (z == 0) {
							break B35
						}
					}
					const ae: DecreaseLimitOrderAccounts = ld64(s1f0)
					const af: AccountInfo = ae.output_vault.info
					const ag: LamportsCell = af.lamports
					const am = af.key
					rc_inc(ag)
					const ah: DataCell = af.data
					rc_inc(ah)
					const al = af.owner
					const ak = af.rent_epoch
					const aj = af.is_signer
					const ai = af.is_writable
					st8(s50 + 2, af.executable)
					st8(s50, aj, ai)
					st64(s78, am, ag, ah, al, ak)
					const an: AccountInfo = ld64(ld64(ae + 0x20) + 0x20)
					const ao: LamportsCell = an.lamports
					const ap = ao.strong
					st64(s1e8, s)
					const ax = an.key
					rc_inc(ao, ap)
					const aq: DataCell = an.data
					const ar = aq.strong
					st64(s1d8, ao)
					rc_inc(aq, ar)
					const aw = an.owner
					const av = an.rent_epoch
					const au = an.is_signer
					const at = an.is_writable
					st8(s20 + 2, an.executable)
					st8(s20, au, at)
					st64(s38, aq, aw, av)
					st64(s40, ld64(s1d8))
					st64(s48, ax)
					const ay = ld64(0x300000000 /* heap bump-allocator cursor */)
					st64(s1f8, ag)
					const az = ay != 0 ? sat_sub(ay, 0x80) & -8 : 0x300007f80
					st64(s208, ah)
					if (0x300000007 >= az) {
						alloc_handle_alloc_error(8, 0x80)
					}
					st64(s218, aq)
					const output_vault_mint: Mint = ae.output_vault_mint
					st64(0x300000000 /* heap bump-allocator cursor */, az)
					const bb: AccountInfo = output_vault_mint.info
					memcpy(az, output_vault_mint, 0x58)
					st64(az + 0x58, bb)
					const bc: DecreaseLimitOrderAccounts = ld64(s1f0)
					copy(az + 0x60, output_vault_mint + 0x60, 0x20)
					const bd: AccountInfo = ld64(bc + 0x50)
					const be: LamportsCell = bd.lamports
					const bl = ld64(bc + 0x48)
					const bk = bd.key
					rc_inc(be)
					const bf: DataCell = bd.data
					rc_inc(bf)
					const bj = bd.owner
					const bi = bd.rent_epoch
					const bh = bd.is_signer
					const bg = bd.is_writable
					st8(s108 + 2, bd.executable)
					st8(s108, bh, bg)
					st64(s130, bk, be, bf, bj, bi)
					st64(s1000 + 0x18, ld64(s200))
					st64(s1000, az, bl, s130)
					i = fn_7a038(s160, ld64(s210), s78, s48, az, bl, s130, ld64(s1000 + 0x18), bj)
					h = ld64(s160 + 8)
					g = ld64(s160)
					const bm = ld64(s1d8)
					const bn = h
					if (rc_release(bm)) {
						i = Rc_drop_slow_14df0(s40, i)
						h = bn
					}
					const bo: DataCell = ld64(s218)
					const bq = ld64(s208)
					if (rc_release(bo)) {
						i = Rc_drop_slow_14df0(s38, i)
						h = bn
					}
					const bp = ld64(s1f8)
					s = ld64(s1e8)
					if (rc_release(bp)) {
						i = Rc_drop_slow_14df0(s70, i)
						h = bn
					}
					if (rc_release(bq)) {
						i = Rc_drop_slow_14df0(s68, i)
						h = bn
					}
					if (g != 2) {
						o = ld64(s1e0)
						st64(o, ld64(o) + 1)
						p = ld64(s1d8 + 0x10)
						st64(p + 8, h)
						st64(p, g)
						return i
					}
				}
				if (s == 0) {
					cd = ld64(s1e0)
					st64(cd, ld64(cd) + 1)
					p = ld64(s1d8 + 0x10)
					st64(p + 8, h)
					st64(p, 2)
					return i
				}
				i = fn_7da68(s130, fn_16330(ld64(ld64(s1f0) + 0x38)), s)
				h = ld64(s130 + 8)
				g = ld64(s130)
				if (g != 2) {
					o = ld64(s1e0)
					st64(o, ld64(o) + 1)
					p = ld64(s1d8 + 0x10)
					st64(p + 8, h)
					st64(p, g)
					return i
				}
				if (h > s) {
					i = fn_88360(s1a0, 0x26)
					h = ld64(s1a0 + 8)
					g = ld64(s1a0)
					o = ld64(s1e0)
					st64(o, ld64(o) + 1)
					p = ld64(s1d8 + 0x10)
					st64(p + 8, h)
					st64(p, g)
					return i
				}
				const br = s - h
				if (ld64(s1d8 + 8) > br) {
					fn_85138(s90, 0x100159904)
					st64(s78, 0, 1, 0)
					st64(s28, s78, 0x10015f818)
					st8(s20 + 0x10, 3)
					st64(s20 + 8, 0x20)
					st64(s38, 0)
					st64(s48, 0)
					if (fn_88558(0x100159904, s48) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
					}
					copy(s110, s90, 0x30)
					st64(s130 + 8, 0x10015a289)
					st32(s108 + 0x70, 0x1781 /* error::PriceSlippageCheck */)
					st8(s108 + 0x28, 2)
					st32(s130 + 0x18, 0xa5)
					st64(s130 + 0x10, 0x41)
					st64(s130, 0)
					fn_13e5a0(s180, s130)
					i = fn_1730(s190, ld64(s180), ld64(s180 + 8), br, ld64(s1d8 + 8))
					h = ld64(s190 + 8)
					g = ld64(s190)
					o = ld64(s1e0)
					st64(o, ld64(o) + 1)
					p = ld64(s1d8 + 0x10)
					st64(p + 8, h)
					st64(p, g)
					return i
				}
				st64(s1e8, s)
				const bv: DecreaseLimitOrderAccounts = ld64(s1f0)
				const bw: AccountInfo = bv.input_vault.info
				st64(s1d8 + 8, s78)
				AccountInfo_clone_f338(s78, bw)
				AccountInfo_clone_f338(s48, ld64(ld64(bv + 0x18) + 0x20))
				const bx = fn_16330(bv.input_vault_mint)
				const by = ld64(bv + 0x48)
				const ca = AccountInfo_clone_f338(s130, ld64(bv + 0x50))
				st64(s1000 + 0x18, ld64(s1e8))
				st64(s1000, bx, by, s130)
				const bz = ld64(s1d8 + 8)
				const cb = fn_7a038(s170, ld64(s210), bz, s48, bx, by, s130, ld64(s1000 + 0x18), ca)
				const cc = ld64(s170 + 8)
				g = ld64(s170)
				i = ptr_drop_in_place_fcd8(bz, ptr_drop_in_place_fcd8(s48, cb))
				h = cc
				if (g == 2) {
					cd = ld64(s1e0)
					st64(cd, ld64(cd) + 1)
					p = ld64(s1d8 + 0x10)
					st64(p + 8, h)
					st64(p, 2)
					return i
				}
				o = ld64(s1e0)
				st64(o, ld64(o) + 1)
				p = ld64(s1d8 + 0x10)
				st64(p + 8, h)
				st64(p, g)
				return i
			}
			raw_vec_handle_error(1, 0x100, 0x100160a60, 0x100 > x, t)
		}
		fn_14ec98(n, 0x3c, 0x1001602d8)
	}
	fn_85138(s90, 0x100159888)
	st64(s78, 0, 1, 0)
	st64(s28, s78, 0x10015f818)
	st8(s20 + 0x10, 3)
	st64(s20 + 8, 0x20)
	st64(s38, 0)
	st64(s48, 0)
	if (fn_88558(0x100159888, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(s110, s90, 0x30)
	st64(s130 + 8, 0x10015a289)
	st32(s108 + 0x70, 0x1784 /* error::ZeroAmountSpecified */)
	st8(s108 + 0x28, 2)
	st32(s130 + 0x18, 0x61)
	st64(s130 + 0x10, 0x41)
	st64(s130, 0)
	i = fn_13e5a0(s1c0, s130)
	g = ld64(s1c0)
	p = ld64(s1d8 + 0x10)
	st64(p + 8, ld64(s1c0 + 8))
	st64(p, g)
	return i
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: input_vault, output_vault
function fn_ea788(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8
	let h, i, j: u64
	let n = fn_a80(s28, ld64(b + 8), c)
	let f = ld64(s28)
	if (f == 2) {
		n = fn_1008(s38, ld64(b + 0x10), c)
		f = ld64(s38)
		if (f == 2) {
			n = fn_af28(s48, b + 0x58, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
			f = ld64(s48)
			if (f == 2) {
				const o = ld64(b + 0x18)
				const p = ld64(o + 0x20)
				if ((memcmp(o, c, 0x20) as u32) == 0 && (common_is_closed(p) == 0 && ld64(ld64(p + 0x10) + 0x10) != 0)) {
					st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
					n = fn_13e628(s58, s18)
					f = ld64(s58)
					if (f != 2) {
						const q = ld64(0x300000000 /* heap bump-allocator cursor */)
						const r = q != 0 ? sat_sub(q, 0x13) : 0x300007fed
						j = ld64(s58 + 8)
						if ((f & 1) != 0) {
							if (0x300000008 > r) {
								raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008, 0x13 > q)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, r)
							st64(r + 8, 0x6f6363615f6e656b)
							st64(r, 0x6f745f7475706e69)
							st32(r + 0xf, 0x746e756f)
							void ld64(j)
						} else {
							if (0x300000008 > r) {
								raw_vec_handle_error(1, 0x13, 0x10015f8f8, 0x300000008, 0x13 > q)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, r)
							st64(r + 8, 0x6f6363615f6e656b)
							st64(r, 0x6f745f7475706e69)
							st32(r + 0xf, 0x746e756f)
							void ld64(j)
						}
						st64(j + 0x10, r, 0x13)
						st64(j + 8, 0x13)
						st64(j, 1)
						st64(a + 8, j)
						st64(a, f)
						return n
					}
				}
				const s = ld64(b + 0x20)
				const t = ld64(s + 0x20)
				if ((memcmp(s, c, 0x20) as u32) == 0 && (common_is_closed(t) == 0 && ld64(ld64(t + 0x10) + 0x10) != 0)) {
					st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
					n = fn_13e628(s68, s18)
					f = ld64(s68)
					if (f != 2) {
						const u = ld64(0x300000000 /* heap bump-allocator cursor */)
						const v = u != 0 ? sat_sub(u, 0x14) : 0x300007fec
						j = ld64(s68 + 8)
						if ((f & 1) != 0) {
							if (0x300000008 > v) {
								raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > u)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, v)
							st64(v + 8, 0x6363615f6e656b6f)
							st64(v, 0x745f74757074756f)
							st32(v + 0x10, 0x746e756f)
							void ld64(j)
						} else {
							if (0x300000008 > v) {
								raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > u)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, v)
							st64(v + 8, 0x6363615f6e656b6f)
							st64(v, 0x745f74757074756f)
							st32(v + 0x10, 0x746e756f)
							void ld64(j)
						}
						st64(j + 0x10, v, 0x14)
						st64(j + 8, 0x14)
						st64(j, 1)
						st64(a + 8, j)
						st64(a, f)
						return n
					}
				}
				const w = ld64(b + 0x28)
				const x = ld64(w + 0x20)
				if ((memcmp(w, c, 0x20) as u32) == 0 && (common_is_closed(x) == 0 && ld64(ld64(x + 0x10) + 0x10) != 0)) {
					st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
					fn_13e628(s78, s18)
					const y = ld64(s78)
					if (y != 2) {
						n = fn_4130(s88, y, ld64(s78 + 8), 0x10015b11e /* "input_vault" */, 0xb)
						j = ld64(s88 + 8)
						f = ld64(s88)
						if (f != 2) {
							st64(a + 8, j)
							st64(a, f)
							return n
						}
					}
				}
				const z = ld64(b + 0x30)
				n = fn_a1d8(s98, ld64(z + 0x20), z, c)
				j = undef
				const aa = ld64(s98)
				if (aa == 2) {
					st64(a + 8, j)
					st64(a, 2)
					return n
				}
				n = fn_4130(sa8, aa, ld64(s98 + 8), "output_vault", 0xc)
				f = ld64(sa8)
				st64(a + 8, ld64(sa8 + 8))
				st64(a, f)
				return n
			}
			const l = ld64(0x300000000 /* heap bump-allocator cursor */)
			const m = l != 0 ? sat_sub(l, 0xb) : 0x300007ff5
			j = ld64(s48 + 8)
			if ((f & 1) != 0) {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, 0xb > l)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m, 0x726f5f74696d696c)
				st32(m + 7, 0x72656472)
				void ld64(j)
			} else {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, 0xb > l)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m, 0x726f5f74696d696c)
				st32(m + 7, 0x72656472)
				void ld64(j)
			}
			st64(j + 0x10, m, 0xb)
			st64(j + 8, 0xb)
			st64(j, 1)
			st64(a + 8, j)
			st64(a, f)
			return n
		}
		const k = ld64(0x300000000 /* heap bump-allocator cursor */)
		h = 0xa > k
		i = k != 0 ? h != 0 ? 0 : k - 0xa : 0x300007ff6
		j = ld64(s38 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i, 0x7272615f6b636974)
			st16(i + 8, 0x7961)
			void ld64(j)
		} else {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i, 0x7272615f6b636974)
			st16(i + 8, 0x7961)
			void ld64(j)
		}
	} else {
		const g = ld64(0x300000000 /* heap bump-allocator cursor */)
		h = 0xa > g
		i = g != 0 ? h != 0 ? 0 : g - 0xa : 0x300007ff6
		j = ld64(s28 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i, 0x6174735f6c6f6f70)
			st16(i + 8, 0x6574)
			void ld64(j)
		} else {
			if (0x300000008 > i) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, h)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			st64(i, 0x6174735f6c6f6f70)
			st16(i + 8, 0x6574)
			void ld64(j)
		}
	}
	st64(j + 0x10, i, 0xa)
	st64(j + 8, 0xa)
	st64(j, 1)
	st64(a + 8, j)
	st64(a, f)
	return n
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

function fn_181f8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10
	const f = ld64(b + 8)
	if (f != 0) {
		st64(b + 8, f - 1)
		const h: AccountInfo = ld64(b)
		st64(b, h + 0x30)
		return fn_c7c8(a, h)
	}
	const i = anchor_error_from(s10, 0xbbd /* anchor::AccountNotEnoughKeys */, f, d, e)
	const g = ld64(s10)
	st64(a + 8, ld64(s10 + 8))
	st64(a, g)
	st8(a + 0xac, 2)
	return i
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
function fn_71a20(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let i: u64
	if ((d as u16) != 0) {
		let f = fn_1561f0(c as i32, (d as u16) * 0x3c)
		if (0 > (c as i32) && (-c as u32) % ((d as u16) * 0x3c) != 0) {
			f = (f as i32) - 1
			if ((f as i32) != f) {
				fn_154788(0x1001603c8)
			}
		}
		const g = (f as i32) * ((d as u16) * 0x3c)
		if ((g as i32) != g) {
			fn_1547e0(0x1001603e0)
		}
		if ((g as u32) != (b as u32)) {
			fn_85138(s78, 0x100159828)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (fn_88558(0x100159828, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copy(sf8, s78, 0x30)
			st64(s118 + 8, 0x10015a7af)
			st32(sf8 + 0x78, 0x1779 /* error::InvalidTickArray */)
			st8(sf8 + 0x30, 2)
			st32(s118 + 0x18, 0xaa)
			st64(s118 + 0x10, 0x25)
			st64(s118, 0)
			fn_13e5a0(s128, s118)
			i = fn_3158(s138, ld64(s128), ld64(s128 + 8), g, b)
			const j = ld64(s138)
			st64(a + 8, ld64(s138 + 8))
			st64(a, j)
			return i
		}
		const h = (c as i32) - (b as i32)
		if ((h as i32) != h) {
			fn_154788(0x100160320, d as u16, g as u32)
		}
		i = fn_1561f0(h as i32, d as u16) as i32
		st64(a + 8, i)
		st64(a, 2)
		return i
	}
	fn_1548e8(0x1001603b0, b, c, d as u16, e)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value)
function fn_67490(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158
	let h = fn_668d8(s118, b, c, r0)
	let g = ld64(s118 + 8)
	let f = ld64(s118)
	if (f != 2) {
		st64(a + 0x10, g)
		st64(a + 8, f)
		st64(a, 1)
		return h
	}
	const v = g
	fn_667d0(s118, b)
	h = ld64(s118 + 8)
	f = ld64(s118)
	if (f == 2) {
		if (h == 0) {
			st64(a + 8, v, 0)
			st64(a, 0)
			return h
		}
		const j = ld64(c + 0x74)
		const i = ld64(b + 0x40)
		if (i == j) {
			h = min(h, d)
			const l = ld64(c + 0x7c)
			if (h > l) {
				h = fn_88360(s158, 0x26)
				f = ld64(s158)
				st64(a + 0x10, ld64(s158 + 8))
				st64(a + 8, f)
				st64(a, 1)
				return h
			}
			st64(c + 0x7c, l - h)
			if (h == 0) {
				st64(a + 8, v, 0)
				st64(a, 0)
				return h
			}
		} else {
			if ((i != -1 ? i + 1 : 0xffffffffffffffff) != j) {
				fn_85138(s78, 0x100159840)
				st64(s60, 0, 1, 0)
				st64(s28, s60, 0x10015f818)
				st8(s28 + 0x18, 3)
				st64(s28 + 0x10, 0x20)
				st64(s48 + 0x10, 0)
				st64(s48, 0)
				if (fn_88558(0x100159840, s48) != 0) {
					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
				}
				copy(sf8, s78, 0x30)
				st64(s118 + 8, 0x10015a641)
				st32(sf8 + 0x78, 0x1798 /* error::OrderAlreadyFilled */)
				st8(sf8 + 0x30, 2)
				st32(s118 + 0x18, 0xd9)
				st64(s118 + 0x10, 0x26)
				st64(s118, 0)
				h = fn_13e5a0(s128, s118)
				f = ld64(s128)
				st64(a + 0x10, ld64(s128 + 8))
				st64(a + 8, f)
				st64(a, 1)
				return h
			}
			const k = ld64(c + 0x84)
			h = min(min(h, d), k)
			st64(c + 0x84, k - h)
			if (h == 0) {
				st64(a + 8, v, 0)
				st64(a, 0)
				return h
			}
		}
		const m = ld64(b + 0x48)
		if (h > m) {
			h = fn_88360(s148, 0x26)
			f = ld64(s148)
			st64(a + 0x10, ld64(s148 + 8))
			st64(a + 8, f)
			st64(a, 1)
			return h
		}
		const u = h
		let n = m - h
		st64(b + 0x48, n)
		let r = 0x58
		if ((i != -1 ? i + 1 : 0xffffffffffffffff) == j) {
			h = fn_667d0(s118, b)
			const p = ld64(s118 + 8)
			const o = ld64(s118)
			if (o != 2) {
				st64(a + 0x10, p)
				st64(a + 8, o)
				st64(a, 1)
				return h
			}
			st64(b + 0x58, p)
			const q = ld64(c + 0x8c)
			st64(b + 0x78, ld64(c + 0x94))
			st64(b + 0x70, q)
			n = 0
			r = 0x60
		}
		st64(b + r, n)
		h = fn_667d0(s118, b)
		g = ld64(s118 + 8)
		f = ld64(s118)
		if (f == 2) {
			if (g == 0) {
				st64(a + 0x10, u)
				st64(a + 8, v)
				st64(a, 0)
				return h
			}
			h = fn_514e0(s138, g, ld32(b + 0xa0), ld8(b + 0xa4), h)
			const s = ld64(s138)
			if (s == 2) {
				st64(a + 0x10, u)
				st64(a + 8, v)
				st64(a, 0)
				return h
			}
			const t = ld64(s138 + 8)
			st64(a + 8, s, t)
			st64(a, 1)
			return h
		}
		st64(a + 0x10, g)
		st64(a + 8, f)
		st64(a, 1)
		return h
	}
	st64(a + 0x10, h)
	st64(a + 8, f)
	st64(a, 1)
	return h
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

function fn_6d670(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, sa8 = fp - 0xa8, sc0 = fp - 0xc0, sc7 = fp - 0xc7, sc8 = fp - 0xc8, se8 = fp - 0xe8, s148 = fp - 0x148, s150 = fp - 0x150, s168 = fp - 0x168, s188 = fp - 0x188, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s268 = fp - 0x268, s270 = fp - 0x270, s278 = fp - 0x278, s280 = fp - 0x280, s288 = fp - 0x288, s290 = fp - 0x290, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8
	let i, v, y, z, am: u64
	let j = a
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 4) & -4 : 0x300007ffc
	if (0x300000008 > g) {
		alloc_handle_alloc_error(4, 4)
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st32(g, d)
	st64(s188, 1, g, 1)
	const h = fn_6f618(b, s188)
	if (h != 0) {
		if (c != 0) {
			const t = ld64(c)
			copyr(s1a8, t, 0x20)
			const u = ld16(b + 0x17f)
			st64(s228, b + 0x17f, j)
			st64(s188, 0x10015984c)
			st64(s148, u != 0 ? b + 0x17f : 1, (u != 0) << 1, b)
			st64(s268 + 0x28, b + 0x61)
			st64(s168 + 0x10, b + 0x61)
			st64(s268 + 0x30, b + 0x41)
			st64(s168, b + 0x41)
			st64(s268 + 0x38, b + 1)
			st64(s188 + 0x10, b + 1)
			st64(s148 + 0x18, 1)
			st64(s150, 0x20)
			st64(s168 + 8, 0x20)
			st64(s188 + 0x18, 0x20)
			st64(s188 + 8, 4)
			st64(s28, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
			// PDA create_program_address(["pool", *(b + 1), *(b + 0x41), *(b + 0x61), (u != 0 ? b + 0x17f : 1)[..(u != 0) << 1], b[..1]], program *s28)
			Pubkey_create_program_address(sc8, s188, 6, s28, h)
			if (ld8(sc8) != 1) {
				copyr(s48, sc7, 0x20)
				st64(s28, 0x1001595c0, 0x20, s48, 0x20)
				st64(sc8, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
				// PDA find_program_address(["pool_tick_array_bitmap_extension", *s48], program *sc8)
				Pubkey_find_program_address(s188, s28, 2, sc8)
				copyr(se8, s188, 0x20)
				if ((memcmp(s1a8, se8, 0x20) as u32) != 0) {
					ErrorCode_name(s48, 0x100159874)
					st64(s28, 0, 1, 0)
					st64(sa8, s28, 0x10015f818)
					st8(sa8 + 0x18, 3)
					st64(sa8 + 0x10, 0x20)
					st64(sc0 + 8, 0)
					st64(sc8, 0)
					if (ErrorCode_fmt(0x100159874, sc8) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
					}
					copyr(s150, s28, 0x18)
					copy(s168, s48, 0x18)
					st64(s188 + 8, 0x10015a741)
					st32(s148 + 0x58, 0x9c6 /* anchor::RequireKeysEqViolated */)
					st8(s148 + 0x10, 2)
					st32(s188 + 0x18, 0x1db)
					st64(s188 + 0x10, 0x1f)
					st64(s188, 0)
					const aq = fn_13e5a0(s1b8, s188)
					const ao = ld16(b + 0x17f)
					const ap = ld64(s228)
					st64(s228, ld64(s1b8 + 8))
					st64(s268 + 0x20, ld64(s1b8))
					st64(s148 + 0x10, b)
					st64(s168 + 0x10, ld64(s268 + 0x28))
					st64(s168, ld64(s268 + 0x30))
					st64(s188 + 0x10, ld64(s268 + 0x38))
					st64(s188, 0x10015984c)
					st64(s148, ao != 0 ? ap : 1, (ao != 0) << 1)
					st64(s148 + 0x18, 1)
					st64(s150, 0x20)
					st64(s168 + 8, 0x20)
					st64(s188 + 0x18, 0x20)
					st64(s188 + 8, 4)
					st64(s28, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
					// PDA create_program_address(["pool", *(ld64(s268 + 0x38)), *(ld64(s268 + 0x30)), *(ld64(s268 + 0x28)), (ao != 0 ? ap : 1)[..(ao != 0) << 1], b[..1]], program *s28)
					Pubkey_create_program_address(sc8, s188, 6, s28, aq)
					if (ld8(sc8) != 1) {
						copyr(se8, sc7, 0x20)
						st64(s48, 0x1001595c0, 0x20, se8, 0x20, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */)
						// PDA find_program_address(["pool_tick_array_bitmap_extension", *se8], program *s28)
						const ar = Pubkey_find_program_address(sc8, s48, 2, s28)
						copyr(s168, sc8, 0x20)
						copy(s188, s1a8, 0x20)
						am = Error_with_pubkeys(s1c8, ld64(s268 + 0x20), ld64(s228), s188, ar)
						i = ld64(s1c8)
						j = ld64(s228 + 8)
						st64(j + 8, ld64(s1c8 + 8))
						st64(j, i)
						return am
					}
					st8(s48, ld8(sc7))
					fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s48, 0x100160228, 0x100160248)
				}
				am = fn_5ec0(s188, c)
				let w = undef
				let x = undef
				v = ld64(s188 + 8)
				i = ld64(s188)
				j = ld64(s228 + 8)
				if (i == 2) {
					if (ld8(v + 0x29) != 0) {
						const at = ld64(v + 0x10)
						if (ld64(at + 0x10) != 0) {
							st64(s188, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
							am = fn_13e628(s1e8, s188)
							i = ld64(s1e8)
							j = ld64(s228 + 8)
							st64(j + 8, ld64(s1e8 + 8))
							st64(j, i)
							return am
						}
						let av = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
						st64(at + 0x10, -1)
						const au = ld64(at + 0x20)
						if (au >= 8) {
							av = 0xbba /* anchor::AccountDiscriminatorMismatch */
							x = ld64(at + 0x18)
							w = 0x998b8061db24963c /* account:TickArrayBitmapExtension */
							if (ld64(x) == 0x998b8061db24963c /* account:TickArrayBitmapExtension */) {
								if (au > 0x727) {
									const aw = x + 8
									am = fn_77538(s1f8, aw, d, ld16(b + 0xe3), aw, am)
									v = ld64(s1f8 + 8)
									i = ld64(s1f8)
									st64(at + 0x10, ld64(at + 0x10) + 1)
									j = ld64(s228 + 8)
									st64(j + 8, v)
									st64(j, i)
									return am
								}
								fn_153158(0x728, au, 0x10015f718, 0x998b8061db24963c /* account:TickArrayBitmapExtension */, x)
							}
						}
						am = anchor_error_from(s208, av, av, w, x)
						v = ld64(s208 + 8)
						i = ld64(s208)
						st64(at + 0x10, ld64(at + 0x10) + 1)
						j = ld64(s228 + 8)
						st64(j + 8, v)
						st64(j, i)
						return am
					}
					am = anchor_error_from(s1d8, 0xbbe /* anchor::AccountNotMutable */, undef, w, x)
					i = ld64(s1d8)
					st64(j + 8, ld64(s1d8 + 8))
					st64(j, i)
					return am
				}
				st64(j + 8, v)
				st64(j, i)
				return am
			}
			st8(s48, ld8(sc7))
			fn_14ed60("called `Result::unwrap()` on an `Err` value", 0x2b, s48, 0x100160228, 0x100160248)
		}
		am = fn_88360(s218, 0x23)
		i = ld64(s218)
		st64(j + 8, ld64(s218 + 8))
		st64(j, i)
		return am
	}
	am = fn_6d240(s188, b, d)
	i = ld64(s188)
	if (i != 2) {
		st64(j + 8, ld64(s188 + 8))
		st64(j, i)
		return am
	}
	B20: {
		st64(s228 + 8, j)
		const k = ld64(s188 + 8)
		st64(s268 + 0x38, ld64(b + 0x3f8))
		st64(s270, ld64(b + 0x3f0))
		st64(s280, ld64(b + 0x3e8))
		st64(s290, ld64(b + 0x3e0))
		y = ld64(b + 0x3d8)
		copyr(s268, b + 0x3a0, 0x38)
		st64(s278, ld64(b + 0x398))
		st64(s288, ld64(b + 0x390))
		z = ld64(b + 0x388)
		st64(s228, ld64(b + 0x380))
		memset2(sc0, 0, 0x78)
		st64(sc8, 1)
		memset2(s188, 0, 0x80)
		if (0x3ff >= k) {
			let m = s188 + (k >> 6 << 3)
			let l = sc8
			let n = (k >> 6) - 1
			while (true) {
				st64(m, ld64(l) << (k & 0x3f))
				l = l + 8
				m = m + 8
				n = n + 1
				if (n >= 0xf) {
					if (k > 0x3bf) {
						break
					}
					if ((k & 0x3f) == 0) {
						break
					}
					let q = sc8
					let r = (k >> 6) - 1
					let o = (k >> 6 << 3) + s188 + 8
					while (true) {
						const s = ld64(o)
						const p = s + (ld64(q) >> (-k & 0x3f))
						if (s > p) {
							fn_154730(0x1001609a0, o, q, p, s > p)
						}
						st64(o, p)
						o = o + 8
						q = q + 8
						r = r + 1
						if (r >= 0xe) {
							break B20
						}
					}
				}
			}
		}
	}
	st64(s298, ld64(s148 + 0x18) ^ y)
	st64(s290, ld64(s148 + 0x20) ^ ld64(s290))
	st64(s2a0, ld64(s148 + 0x28) ^ ld64(s280))
	st64(s2a8, ld64(s148 + 0x30) ^ ld64(s270))
	st64(s270, ld64(s188 + 8) ^ z)
	st64(s280, ld64(s188 + 0x10) ^ ld64(s288))
	st64(s278, ld64(s188 + 0x18) ^ ld64(s278))
	const aa = ld64(s168)
	const ab = ld64(s268)
	const ac = ld64(s168 + 8)
	const ad = ld64(s268 + 8)
	am = ld64(s168 + 0x10) ^ ld64(s268 + 0x10)
	const ae = ld64(s150)
	const af = ld64(s268 + 0x18)
	const ag = ld64(s148)
	const ah = ld64(s268 + 0x20)
	const ai = ld64(s148 + 8)
	const aj = ld64(s268 + 0x28)
	const ak = ld64(s148 + 0x10)
	const al = ld64(s268 + 0x30)
	const an = ld64(s188)
	st64(b + 0x3f8, ld64(s148 + 0x38) ^ ld64(s268 + 0x38))
	st64(b + 0x3f0, ld64(s2a8))
	st64(b + 0x3e8, ld64(s2a0))
	st64(b + 0x3e0, ld64(s290))
	st64(b + 0x3d8, ld64(s298))
	st64(b + 0x3d0, ak ^ al)
	st64(b + 0x3c8, ai ^ aj)
	st64(b + 0x3c0, ag ^ ah)
	st64(b + 0x3b8, ae ^ af)
	st64(b + 0x3b0, am)
	st64(b + 0x3a8, ac ^ ad)
	st64(b + 0x3a0, aa ^ ab)
	st64(b + 0x398, ld64(s278))
	st64(b + 0x390, ld64(s280))
	st64(b + 0x388, ld64(s270))
	v = ld64(s228)
	st64(b + 0x380, an ^ v)
	j = ld64(s228 + 8)
	st64(j + 8, v)
	st64(j, 2)
	return am
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

function fn_c7c8(a: u64, b: u64): u64 {
	const s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8
	let r, s: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0) {
		s = anchor_error_from(sf8, 0xbc4 /* anchor::AccountNotInitialized */)
		r = ld64(sf8)
		st64(a + 8, ld64(sf8 + 8))
		st64(a, r)
		st8(a + 0xac, 2)
		return s
	}
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(sa8, b, g as u32)
		const q = ld64(s98)
		const l = ld64(sa8 + 8)
		const k = ld64(sa8)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(sb8 + 8, ld64(l + 8))
			st64(sb8, m)
			s = fn_10c648(sa8, sb8, 0x800000000000001a /* Ok */)
			const o = ld64(sa8 + 8)
			const p = ld64(sa8)
			const n = ld8(s88 + 0x84)
			if (n == 2) {
				st64(a + 8, o)
				st64(a, p)
				st8(a + 0xac, 2)
				st64(q, ld64(q) - 1)
				return s
			}
			s = memcpy(a + 0x18, s98, 0x94)
			st16(a + 0xad, ld16(s88 + 0x85))
			st8(a + 0xaf, ld8(s88 + 0x87))
			st8(a + 0xac, n)
			st64(a + 0x10, o)
			st64(a + 8, p)
			st64(a, b)
			st64(q, ld64(q) - 1)
			return s
		}
		st64(sa8, k, l, q)
		s = fn_13e628(se8, sa8)
		r = ld64(se8)
		st64(a + 8, ld64(se8 + 8))
		st64(a, r)
		st8(a + 0xac, 2)
		return s
	}
	const j = anchor_error_from(sc8, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	const i = ld64(sc8 + 8)
	const h = ld64(sc8)
	copyr(sa8, f, 0x20)
	st64(s88, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
	s = Error_with_pubkeys(sd8, h, i, sa8, j)
	r = ld64(sd8)
	st64(a + 8, ld64(sd8 + 8))
	st64(a, r)
	st8(a + 0xac, 2)
	return s
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (points to it), e (value)
function fn_153158(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155b30(a, b, c, d, e)
}

function fn_f5d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_1548e8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x100162588, 1, 8, 0, 0)
	// fmt "attempt to divide by zero"
	fn_14ec00(s30, a, c, d, e)
}

function fn_3158(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sa8 = fp - 0xa8, sd8 = fp - 0xd8, sdf = fp - 0xdf, s10f = fp - 0x10f, s116 = fp - 0x116, s11c = fp - 0x11c, s120 = fp - 0x120
	let f, g: u64
	st32(s120, d, e)
	if ((b & 1) != 0) {
		st64(sa8, 0, 1, 0)
		st64(s28, sa8, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (imp_fmt(s120, s48) == 0) {
			copyr(s78, sa8, 0x18)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (imp_fmt(s11c, s48) == 0) {
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
	if (imp_fmt(s120, s48) == 0) {
		copyr(s78, sa8, 0x18)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (imp_fmt(s11c, s48) == 0) {
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

function fn_1547e0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622f0, 1, 8, 0, 0)
	// fmt "attempt to multiply with overflow"
	fn_14ec00(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_154788(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622e0, 1, 8, 0, 0)
	// fmt "attempt to subtract with overflow"
	fn_14ec00(s30, a, c, d, e)
}

function fn_155738(a: u64, b: u64): u64 {
	return imp__fmt_155760(ld64(a), 1, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14ec00(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s18 = fp - 0x18
	st64(s18, a, b)
	st16(s18 + 0x10, 1)
	fn_14ce00(s18, b, c, d, e)
}

function fn_668d8(a: u64, b: u64, c: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s180 = fp - 0x180
	let w: u64
	const f = ld64(b + 0x58)
	if (f != 0) {
		const h = ld64(c + 0x74)
		const g = ld64(b + 0x40)
		if (g == h) {
			st64(a, 2, 0)
			return r0
		}
		if ((g != -1 ? g + 1 : 0xffffffffffffffff) == h) {
			st64(s180, a)
			st64(s48, f, 0, 0, 0)
			const l = ld64(c + 0x8c)
			st64(s118 + 8, ld64(c + 0x94))
			st64(s118, l)
			st64(s108, 0, 0)
			fn_103fe8(s158, s48, s118)
			const m = ld64(b + 0x70)
			st64(s138 + 8, ld64(b + 0x78))
			st64(s138, m)
			st64(s128, 0, 0)
			fn_1019b8(s118, s158, s138)
			if (ld64(s118 + 8) == 0 && (ld64(s108) == 0 && ld64(s108 + 8) == 0)) {
				const n = ld64(s118)
				r0 = fn_1019b8(s118, s158, s138)
				if (f > n) {
					let r = sat_sub(f, n)
					const s = r != 0 ? r - 1 : 0
					const t = ld64(sf8 + 8)
					r = ld64(sf8 + 0x18) != 0 ? s : r
					r = ld64(sf8 + 0x10) != 0 ? s : r
					r = (ld64(sf8) | t) != 0 ? s : r
					r0 = fn_72df0(s118, r, ld32(c), ld8(b + 0xa4), t)
					let u = ld64(s118)
					if (u != 2) {
						w = ld64(s180)
						st64(w + 8, ld64(s118 + 8))
						st64(w, u)
						return r0
					}
					const v = ld64(b + 0x48)
					if (n > v) {
						r0 = fn_88360(s178, 0x26)
						u = ld64(s178)
						w = ld64(s180)
						st64(w + 8, ld64(s178 + 8))
						st64(w, u)
						return r0
					}
					const x = ld64(s118 + 8)
					st64(b + 0x50, v - n)
					const y = ld64(b + 0x60)
					st64(b + 0x60, x)
					const z = ld64(s180)
					st64(z + 8, sat_sub(x, y))
					st64(z, 2)
					return r0
				}
				a = ld64(s180)
				st64(a, 2, 0)
				return r0
			}
			st64(s118, 0x10015fe18, 1, 8, 0, 0)
			// fmt "Integer overflow when casting to u64"
			fn_14ec00(s118, 0x10015feb8)
		}
		const i = g > g + 2
		const j = a
		if ((i != 0 ? 0xffffffffffffffff : g + 2) > h) {
			fn_85138(s78, 0x1001598c0)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (fn_88558(0x1001598c0, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copy(sf8, s78, 0x30)
			st64(s118 + 8, 0x10015a641)
			st32(sf8 + 0x78, 0x1799 /* error::InvalidOrderPhase */)
			st8(sf8 + 0x30, 2)
			st32(s108 + 8, 0x9d)
			st64(s108, 0x26)
			st64(s118, 0)
			r0 = fn_13e5a0(s168, s118)
			const k = ld64(s168)
			st64(j + 8, ld64(s168 + 8))
			st64(j, k)
			return r0
		}
		r0 = fn_72df0(s118, f, ld32(c), ld8(b + 0xa4), i)
		const p = ld64(s118 + 8)
		const o = ld64(s118)
		if (o == 2) {
			st64(b + 0x50, ld64(b + 0x48))
			const q = ld64(b + 0x60)
			st64(b + 0x60, 0)
			st64(b + 0x58, 0)
			st64(j + 8, sat_sub(p, q))
			st64(j, 2)
			return r0
		}
		st64(j + 8, p)
		st64(j, o)
		return r0
	}
	st64(a, 2, 0)
	return r0
}

function fn_667d0(a: u64, b: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	let k: u64
	const g = ld64(b + 0x50)
	const f = ld64(b + 0x48)
	if (g > f) {
		k = fn_88360(s20, 0x26)
		const j = ld64(s20)
		st64(a + 8, ld64(s20 + 8))
		st64(a, j)
		return k
	}
	k = fn_88360(s10, 0x26)
	const i = ld64(s10 + 8)
	const h = ld64(s10)
	st64(a + 8, f - g)
	st64(a, 2)
	if (h != 0) {
		void ld64(i)
		void ld8(i + 0x38)
		return k
	}
	void ld64(i)
	void ld8(i + 0x50)
	return k
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

function fn_e480(a: u64, b: u64, c: u64, d: u64, r0: u64, r7: u64): u64 {
	const s18 = fp - 0x18, s30 = fp - 0x30, s48 = fp - 0x48, s50 = fp - 0x50
	let n: u64
	st64(s48 + 0x10, b)
	st64(s50, a)
	let f = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
	st64(s48, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
	if (c != 0) {
		let g = 0
		while (true) {
			fn_132b38(s30, g)
			d = undef
			f = 0x14
			st64(s48 + 8, 0x14)
			const h = ld64(s30 + 0x10)
			r0 = 0
			if (h > c) {
				break
			}
			const i = ld64(s30 + 8)
			const j = ld64(s30)
			if (j > i) {
				fn_153160(j, i, 0x10015f7a8, d)
			}
			if (i > c) {
				fn_153158(i, c, 0x10015f7a8, d)
			}
			fn_132ff0(s18, ld64(s48 + 0x10) + j, i - j)
			d = undef
			const l = ld16(s18 + 8)
			const k = ld64(s18)
			if (k != 0x800000000000001a /* Ok */) {
				d = ld64(s18 + 0x10)
				f = ld32(s18 + 0xc)
				r0 = ld16(s18 + 0xa)
				st64(s48, k, l)
				break
			}
			if (0x1b >= l) {
				f = (1 << (l & 0x3f)) & 0x7fd5658
				if (f != 0) {
					if (h >= i) {
						if (h - i != 2) {
							st64(s48, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
							f = r7 >> 0x20
							r0 = r7 >> 0x10
							st64(s48 + 8, r7)
							break
						}
						r7 = ld64(s48 + 0x10) + i
						f = h + ld16(r7)
						r0 = 0
						d = h > f
						g = d != 0 ? 0xffffffffffffffff : f
						if (c > g) {
							continue
						}
						break
					}
					fn_153160(i, h, 0x10015f7c0, d, k)
				}
				const m = (1 << (l & 0x3f)) & 0x802a9a4
				r0 = 0
				st64(s48, 0x8000000000000000)
				if (m != 0) {
					break
				}
				if (l == 1) {
					if (h >= i) {
						let o = ld64(s48 + 0x10) + i
						if (h - i == 2) {
							o = h + ld16(o)
							d = h > o
							const q = d != 0 ? 0xffffffffffffffff : o
							if (q > c) {
								n = ld64(s50)
								st64(n + 0x10, d)
								st64(n + 8, o)
								st64(n, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
								return 0
							}
							const r = ld64(s50)
							if (q - h != 0x6c) {
								st64(r, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
								return 0
							}
							st64(r + 8, ld64(s48 + 0x10) + h)
							st64(r, 0x800000000000001a /* Ok */)
							return 0
						}
						n = ld64(s50)
						st64(n + 0x10, d)
						st64(n + 8, o)
						st64(n, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
						return 0
					}
					fn_153160(i, h, 0x10015f778, d, m)
				}
			}
			f = 0x30
			st64(s48 + 8, 0x30)
			r0 = l
			st64(s48, 0x8000000000000000)
			break
		}
	}
	r0 = ((r0 as u16) << 0x10) | (ld64(s48 + 8) as u16)
	const p = ld64(s48)
	n = ld64(s50)
	st64(n + 0x10, d)
	st64(n + 8, (f << 0x20) | r0)
	st64(n, p)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_154730(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622d0, 1, 8, 0, 0)
	// fmt "attempt to add with overflow"
	fn_14ec00(s30, a, c, d, e)
}

function fn_6d240(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128
	let g, l: u64
	const f = ld16(b + 0xe3)
	if (0xfff27617 > ((c - 0x6c4f5) as u32)) {
		if (0x6c4f4 >= (c as i32)) {
			if (f == 0) {
				fn_1548e8(0x1001603b0, 0xfff27617, c, d, e)
			}
			g = f * 0x3c
			const i = 0x6c4f4 / g
			const j = i * g
			const k = ((j as u32) != 0x6c4f4 ? ~i : -i) * g
			if ((k as i32) != k) {
				fn_1547e0(0x1001603e0, k as i32, j as u32, d, e)
			}
			if ((k as u32) == (c as u32)) {
				l = sar((fn_1561f0(c as i32, g) << 0x20) + 0x20000000000, 0x20)
				st64(a + 8, l)
				st64(a, 2)
				return l
			}
		}
	} else {
		if (f == 0) {
			fn_154940(0x1001603f8, 0xfff27617, c, d, e)
		}
		g = f * 0x3c
		if (fn_158b50(c as i32, g) == 0) {
			l = sar((fn_1561f0(c as i32, g) << 0x20) + 0x20000000000, 0x20)
			st64(a + 8, l)
			st64(a, 2)
			return l
		}
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
	st64(s118 + 8, 0x10015a741)
	st32(sf8 + 0x78, 0x1774 /* error::InvalidTickIndex */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0x1c0)
	st64(s118 + 0x10, 0x1f)
	st64(s118, 0)
	l = fn_13e5a0(s128, s118)
	const h = ld64(s128)
	st64(a + 8, ld64(s128 + 8))
	st64(a, h)
	return l
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), c (value)
function memset2(a: u64, b: u64, c: u64): u64 {
	sol_memset(a, b as u8, c)
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

function fn_77538(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s40 = fp - 0x40, s78 = fp - 0x78, s90 = fp - 0x90, s98 = fp - 0x98, sc8 = fp - 0xc8, se0 = fp - 0xe0, se8 = fp - 0xe8
	let o = a
	let an = fn_767a8(s90, b, c, d, e, r0)
	let m = ld64(s90 + 0x10)
	const n = ld64(s90 + 8)
	if (ld64(s90) != 0) {
		st64(o + 8, m)
		st64(o, n)
		return an
	}
	const k = ld64(s78 + 0x30)
	copyr(sc8, s78, 0x30)
	let f = c << 0x20
	const g = f
	let h = c
	if (-1 >= (sar(f, 0x20) as i64)) {
		f = f >> 0x20
		if (f == 0x80000000) {
			fn_154838(0x10015ff90, f, sar(g, 0x20), m, n)
		}
		h = -c
	}
	if ((d as u16) == 0) {
		fn_154940(0x100160578, f, sar(g, 0x20), m, n)
	}
	const i = (h as u32) % ((d as u16) * 0x7800)
	let j = i / ((d as u16) * 0x3c)
	st64(se0 + 0x10, k)
	j = (c as i32) > -1 ? j : i != 0 ? 0x200 - j : j
	st64(s40, 1, 0, 0, 0, 0, 0, 0, 0)
	const l = j
	if ((j as i32) > -1) {
		B15: {
			st64(se0, m, n)
			st64(s98, o, 0, 0, 0, 0, 0, 0, 0, 0)
			if (0x1ff >= (l as u32)) {
				const p = j
				let r = s90 + ((l as u32) >> 6 << 3)
				let q = s40
				let s = ((l as u32) >> 6) - 1
				while (true) {
					st64(r, ld64(q) << (p & 0x3f))
					q = q + 8
					r = r + 8
					s = s + 1
					if (s >= 7) {
						if ((j as u32) > 0x1bf) {
							break
						}
						if ((p & 0x3f) == 0) {
							break
						}
						let v = s40
						let w = ((l as u32) >> 6) - 1
						const x = -(l as u32) & 0x3f
						let t = ((l as u32) >> 6 << 3) + s90 + 8
						while (true) {
							const y = ld64(t)
							const u = y + (ld64(v) >> (x & 0x3f))
							if (y > u) {
								fn_154730(0x1001604b8, v, u, y > u, y)
							}
							st64(t, u)
							t = t + 8
							v = v + 8
							w = w + 1
							if (w >= 6) {
								break B15
							}
						}
					}
				}
			}
		}
		const al = ld64(s78 + 0x20)
		const aj = ld64(s78 + 0x18)
		const ah = ld64(s78 + 0x10)
		const af = ld64(s78 + 8)
		const ad = ld64(s78)
		const ab = ld64(s90 + 0x10)
		const aa = ld64(s90 + 8)
		st64(se8, ld64(s90))
		if (0 > (c as i32)) {
			const ao = ld64(se0 + 8)
			if (0xe > ao) {
				an = aa ^ ld64(sc8)
				const ap = ld64(sc8 + 8)
				const aq = ld64(sc8 + 0x10)
				const ar = ld64(sc8 + 0x18)
				const at = ld64(sc8 + 0x20)
				const au = ld64(sc8 + 0x28)
				const av = b + (ao << 6)
				st64(av + 0x3d8, al ^ ld64(se0 + 0x10))
				st64(av + 0x3d0, aj ^ au)
				st64(av + 0x3c8, ah ^ at)
				st64(av + 0x3c0, af ^ ar)
				st64(av + 0x3b8, ad ^ aq)
				st64(av + 0x3b0, ab ^ ap)
				st64(av + 0x3a8, an)
				m = ld64(se0)
				st64(av + 0x3a0, ld64(se8) ^ m)
				o = ld64(s98)
				st64(o + 8, m)
				st64(o, 2)
				return an
			}
			fn_14ec98(ao, 0xe, 0x1001604e8, ad, af)
		}
		const z = ld64(se0 + 8)
		if (0xe > z) {
			an = aa ^ ld64(sc8)
			const ac = ld64(sc8 + 8)
			const ae = ld64(sc8 + 0x10)
			const ag = ld64(sc8 + 0x18)
			const ai = ld64(sc8 + 0x20)
			const ak = ld64(sc8 + 0x28)
			const am = b + (z << 6)
			st64(am + 0x58, al ^ ld64(se0 + 0x10))
			st64(am + 0x50, aj ^ ak)
			st64(am + 0x48, ah ^ ai)
			st64(am + 0x40, af ^ ag)
			st64(am + 0x38, ad ^ ae)
			st64(am + 0x30, ab ^ ac)
			st64(am + 0x28, an)
			m = ld64(se0)
			st64(am + 0x20, ld64(se8) ^ m)
			o = ld64(s98)
			st64(o + 8, m)
			st64(o, 2)
			return an
		}
		fn_14ec98(z, 0xe, 0x1001604d0, ad, af)
	}
	st64(s90, 0x100160960, 1, 8, 0, 0)
	// fmt "Unsigned integer can't be created from negative value"
	fn_14ec00(s90, 0x1001604b8, j, m, n)
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

function fn_10c648(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let g, j: u64
	if (8 > ld64(b + 8)) {
		j = anchor_error_from(s138, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		g = ld64(s138)
		st64(a + 8, ld64(s138 + 8))
		st64(a, g)
		st8(a + 0xa4, 2)
		return j
	}
	if (ld64(ld64(b)) == 0xe42c3ecf8e05ee01 /* account:LimitOrderState */) {
		return fn_10caa8(a, b, 0xe42c3ecf8e05ee01 /* account:LimitOrderState */, d, e)
	}
	ErrorCode_name(s78, 0x1001598e8, 0xe42c3ecf8e05ee01 /* account:LimitOrderState */, d, e)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (ErrorCode_fmt(0x1001598e8, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a641)
	st32(sf8 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 8)
	st64(s118 + 0x10, 0x26)
	st64(s118, 0)
	j = fn_13e5a0(s128, s118)
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	g = ld64(s128)
	const h = f != 0 ? sat_sub(f, 0xf) : 0x300007ff1
	const i = ld64(s128 + 8)
	if ((g & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 7, 0x6574617453726564)
		st64(h, 0x64724f74696d694c)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 7, 0x6574617453726564)
		st64(h, 0x64724f74696d694c)
		void ld64(i)
	}
	st64(i + 0x10, h, 0xf)
	st64(i + 8, 0xf)
	st64(i, 1)
	st64(a + 8, i)
	st64(a, g)
	st8(a + 0xa4, 2)
	return j
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (value), c (value)
function fn_1019b8(a: u64, b: u64, c: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s48 = fp - 0x48, s68 = fp - 0x68, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s1c8 = fp - 0x1c8, s1d0 = fp - 0x1d0, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8
	let f, h, k, m, n, be: u64
	B5: {
		st64(s1e0, a)
		let i = -0x40
		f = ld64(b + 0x18)
		let g = f
		if (f == 0) {
			i = -0x80
			g = ld64(b + 0x10)
			if (g == 0) {
				i = -0xc0
				g = ld64(b + 8)
				if (g == 0) {
					h = clz(ld64(b))
					m = 0x40 - h
					break B5
				}
			}
		}
		h = clz(g)
		m = i - h + 0x140
	}
	B9: {
		let l = -0x40
		let j = ld64(c + 0x18)
		if (j == 0) {
			l = -0x80
			j = ld64(c + 0x10)
			if (j == 0) {
				l = -0xc0
				j = ld64(c + 8)
				if (j == 0) {
					k = ld64(c)
					h = k != 0 ? 0x101010101010101 : h
					n = 0x40 - clz(k)
					if (k != 0) {
						break B9
					}
					st64(s98, 0x100160980, 1, 8, 0, 0)
					// fmt "division by zero"
					fn_14ec00(s98, 0x10015feb8, c, f, k)
				}
			}
		}
		k = 0x101010101010101
		h = clz(j)
		n = l - h + 0x140
	}
	if (n > m) {
		const o = ld64(s1e0)
		st64(o + 0x18, 0)
		st64(o + 0x10, 0)
		st64(o + 8, 0)
		st64(o, 0)
		copy(o + 0x20, b, 0x20)
		return h
	}
	if (0x41 > n) {
		const an = ld64(c)
		if (an != 0) {
			const ap = ld64(b + 0x10)
			const ar = ld64(b + 8)
			st64(s1c8 + 0x58, ld64(b))
			const ao = f / an
			__udivti3(s118, ap, f - ao * an, an, 0)
			const aq = ld64(s118)
			st64(s1c8 + 0x50, aq)
			__multi3_159030(s128, aq, ld64(s118 + 8), an, 0)
			__udivti3(s138, ar, ap - ld64(s128), an, 0)
			const at = ld64(s138)
			st64(s1c8 + 0x48, at)
			__multi3_159030(s148, at, ld64(s138 + 8), an, 0)
			const au = ld64(s1c8 + 0x58)
			__udivti3(s158, au, ar - ld64(s148), an, 0)
			const av = ld64(s158)
			h = __multi3_159030(s168, av, ld64(s158 + 8), an, 0)
			const aw = ld64(s1e0)
			st64(aw + 0x18, ao)
			st64(aw + 0x10, ld64(s1c8 + 0x50))
			st64(aw + 8, ld64(s1c8 + 0x48))
			st64(aw, av)
			st64(aw + 0x20, au - ld64(s168))
			st64(aw + 0x28, 0, 0, 0)
			return h
		}
		fn_1548e8(0x10015feb8, b, c, f, k)
	}
	const p = n - 1
	const q = m - 1
	if ((p >> 6) > (q >> 6)) {
		fn_154788(0x10015feb8, b, c, f, k)
	}
	copyr(s68, c, 0x20)
	const r = s68 + (p >> 6 << 3)
	st64(s1c8 + 0x50, r)
	const s = ld64(r)
	st64(s1d0, p)
	st64(s1c8 + 0x58, s)
	st64(s1c8 + 0x40, p >> 6)
	st64(s1c8 + 0x28, (p >> 6) + 1)
	let u = s98 + ((s == 0) << 3)
	st64(s1e8, clz(s))
	k = clz(s) & 0x3f
	let v = (s == 0) - 1
	st64(s98, 0, 0, 0, 0)
	let t = c
	while (true) {
		f = ld64(t) << (k & 0x3f)
		st64(u, f)
		t = t + 8
		u = u + 8
		v = v + 1
		if (v >= 3) {
			if (k != 0) {
				let z = (s == 0) - 1
				const w = ld64(s1e8)
				let x = ((s == 0) << 3) + s98 + 8
				do {
					const ad = ld64(x)
					const y = ad + (ld64(c) >> (-w & 0x3f))
					f = ad > y
					if (f != 0) {
						fn_154730(0x10015feb8, b, c, f, k)
					}
					st64(x, y)
					x = x + 8
					c = c + 8
					z = z + 1
				} while (2 > z)
			}
			copyr(s68, s98, 0x20)
			const aa = ld64(s1c8 + 0x58)
			if (aa == 0) {
				fn_154890(0x10015feb8, b, aa, f, k)
			}
			st64(s1c8 + 0x38, (q >> 6) - ld64(s1c8 + 0x40))
			const ab = ld64(s1e8)
			let af = 0
			const ac = 0x40 - ab >> 6
			const ae = b + (ac << 3)
			st64(s1c8 + 0x58, ld64(b))
			const ag = 0x40 - ab & 0x3f
			let ah = ac - 1
			st64(s98, 0, 0, 0, 0)
			while (true) {
				f = ld64(ae + af) >> (ag & 0x3f)
				st64(s98 + af, f)
				af = af + 8
				ah = ah + 1
				if (ah >= 3) {
					const ax = ld64(s1c8 + 0x40)
					if (ag != 0) {
						const ai = (ac << 3) + b
						b = s98
						let al = ac - 1
						let ak = ai + 8
						do {
							c = ld64(ak) << (k & 0x3f)
							const am = ld64(b)
							const aj = am + c
							f = am > aj
							if (f != 0) {
								fn_154730(0x10015feb8, b, c, f, k)
							}
							st64(b, aj)
							ak = ak + 8
							b = b + 8
							al = al + 1
						} while (2 > al)
					}
					copyr(s40, s98, 0x20)
					st64(s48, ld64(s1c8 + 0x58) << (ld64(s1e8) & 0x3f))
					st64(s20, 0, 0, 0, 0)
					if (ax - 1 > 3) {
						fn_14ec98(-1, 4, 0x10015feb8, f, k)
					}
					st64(s1c8 + 0x50, ld64(ld64(s1c8 + 0x50)))
					c = s48 + ((q >> 6 << 3) - (ax << 3))
					st64(s1c8 + 0x58, c)
					copyr(s1c8, s68, 0x20)
					st64(s1d8, ld64(s68 + (ax - 1 << 3)))
					b = ld64(s1c8 + 0x38)
					st64(s1c8 + 0x40, ax + 2)
					L31: while (true) {
						const ay = b
						const az = ld64(s1c8 + 0x28)
						if (b > b + az) {
							fn_154730(0x10015feb8, b, c, f, k)
						}
						st64(s1c8 + 0x48, b)
						if (5 > ay + az) {
							b = s48 + (ay + az << 3)
							let bd = -1
							st64(s1c8 + 0x20, b)
							c = ld64(b)
							if (ld64(s1c8 + 0x50) > c) {
								if (ay + az == 1) {
									fn_154788(0x10015feb8, b, c, f, k)
								}
								if (ay + az == 0) {
									fn_154788(0x10015feb8, b, c, f, k)
								}
								const ba = (ay + az << 3) + s48
								const bb = ld64(ba - 8)
								const bc = ld64(s1c8 + 0x50)
								__udivti3(sa8, bb, c, bc, 0)
								bd = ld64(sa8)
								__multi3_159030(sb8, bd, ld64(sa8 + 8), bc, 0)
								let bh = bb - ld64(sb8)
								const bg = ld64(ba - 0x10)
								const bf = ld64(s1d8)
								do {
									__multi3_159030(sc8, bd, 0, bf, 0)
									f = undef
									k = undef
									let bi = bg >= ld64(sc8)
									c = ld64(sc8 + 8)
									b = bh > c
									bi = bh != c ? b : bi
									if ((bi & 1) != 0) {
										break
									}
									if (bd == 0) {
										fn_154788(0x10015feb8, b, c, f, k)
									}
									const bj = ld64(s1c8 + 0x50)
									be = bh > bh + bj
									bd = bd - 1
									bh = bh + bj
								} while ((be & 1) == 0)
							}
							__multi3_159030(sd8, bd, 0, ld64(s1c8), 0)
							__multi3_159030(se8, bd, 0, ld64(s1c8 + 8), 0)
							__multi3_159030(sf8, bd, 0, ld64(s1c8 + 0x10), 0)
							__multi3_159030(s108, bd, 0, ld64(s1c8 + 0x18), 0)
							const bl = ld64(se8)
							const bk = ld64(sd8 + 8)
							const bm = ld64(se8 + 8) + (bk > bk + bl)
							const bn = ld64(sf8)
							const br = ld64(s1c8 + 0x48)
							const bq = ld64(s1c8 + 0x40)
							const bo = ld64(sf8 + 8) + (bm > bm + bn)
							const bp = ld64(s108)
							k = ld64(sd8)
							st64(s98, k, bk + bl, bm + bn, bo + bp)
							st64(s98 + 0x20, ld64(s108 + 8) + (bo > bo + bp))
							if (ld64(s1c8 + 0x38) > 5) {
								fn_153150(ld64(s1c8 + 0x38), 5, 0x10015feb8, bo + bp, k)
							}
							if (0x100 > ld64(s1d0)) {
								c = 5 - br
								f = min(c, bq)
								if (br == 5) {
									fn_14ec98(5, 4, 0x10015feb8, f, k)
								}
								st64(s1c8 + 0x30, br - 1)
								let bv = 0
								k = 0
								let bw = 0
								while (true) {
									const bx = ld64(s98 + bv)
									const bt = bx + bw
									const bu = ld64(s1c8 + 0x58) + bv
									const bs = ld64(bu)
									b = bs - bt
									st64(bu, b)
									bw = bx > bt | bt > bs
									bv = bv + 8
									k = k + 1
									if (k >= f) {
										if ((bw & 1) != 0) {
											if (bd == 0) {
												fn_154788(0x10015feb8, b, c, f, k)
											}
											if (c >= ld64(s1c8 + 0x28)) {
												c = ld64(s1c8 + 0x28)
											}
											bd = bd - 1
											let bz = 0
											f = 0
											k = 0
											while (true) {
												const cb = ld64(s68 + bz)
												const cc = cb + k
												const by = ld64(s1c8 + 0x58) + bz
												const cd = ld64(by)
												st64(by, cd + cc)
												k = cb > cc | cd > cd + cc
												bz = bz + 8
												f = f + 1
												if (f >= c) {
													const ca = ld64(s1c8 + 0x20)
													st64(ca, ld64(ca) + k)
													break
												}
											}
										}
										const ce = ld64(s1c8 + 0x38)
										c = ld64(s1c8 + 0x48)
										if (4 > ce) {
											st64(s20 + (c << 3), bd)
											st64(s1c8 + 0x58, ld64(s1c8 + 0x58) - 8)
											b = ld64(s1c8 + 0x30)
											if (c == 0) {
												const cf = ld64(s40 + 0x10)
												const cg = ld64(s1e8)
												let cj = cf >> (cg & 0x3f)
												const ch = ld64(s40 + 8)
												let ck = ch >> (cg & 0x3f)
												const ci = ld64(s40)
												let cl = ci >> (cg & 0x3f)
												let cm = ld64(s48) >> (cg & 0x3f)
												if (cg != 0) {
													cj = (ld64(s40 + 0x18) << (-cg & 0x3f)) | cj
													ck = (cf << (-cg & 0x3f)) | ck
													cl = (ch << (-cg & 0x3f)) | cl
													cm = (ci << (-cg & 0x3f)) | cm
												}
												h = ld64(s1e0)
												st64(h + 0x18, ld64(s20 + 0x18))
												st64(h + 0x10, ld64(s20 + 0x10))
												st64(h + 8, ld64(s20 + 8))
												st64(h, ld64(s20))
												st64(h + 0x38, cj)
												st64(h + 0x30, ck)
												st64(h + 0x28, cl)
												st64(h + 0x20, cm)
												return h
											}
											continue L31
										}
										fn_14ec98(ce, 4, 0x10015feb8, f, k)
									}
								}
							}
							fn_153158(bq, 5, 0x10015feb8, bo + bp, k)
						}
						fn_14ec98(ay + az, 5, 0x10015feb8, f, k)
					}
				}
			}
		}
	}
}

function fn_660f8(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s130 = fp - 0x130, s138 = fp - 0x138, s158 = fp - 0x158, s168 = fp - 0x168
	let f: u64
	st64(s158, b, c, 0, 0)
	let n = fn_103fe8(s138, s158, s158)
	if (d != 0) {
		const g = ld64(s138)
		const h = ld64(s130)
		let i = h + 1
		const k = g != 0 & i == 0
		const j = ld64(s130 + 8)
		let l = j + k
		const m = j > l
		n = ld64(s130 + 0x10)
		if (k == 1 && (m & 1) != 0) {
			n = n + 1
			if (n == 0) {
				st64(s118, 0x100160990, 1, 8, 0, 0)
				// fmt "arithmetic operation overflow"
				fn_14ec00(s118, 0x10015feb8, h, k, l)
			}
		}
		l = (k & 1) != 0 ? l : j
		i = g != 0 ? i : h
		st64(s130, i, l)
		if (n == 0) {
			f = ld64(s130)
			st64(a + 0x10, ld64(s130 + 8))
			st64(a + 8, f)
			st64(a, 0)
			return n
		}
	} else if (ld64(s130 + 0x10) == 0) {
		f = ld64(s130)
		st64(a + 0x10, ld64(s130 + 8))
		st64(a + 8, f)
		st64(a, 0)
		return n
	}
	fn_85138(s78, 0x100159848)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s28 + 0x18, 3)
	st64(s28 + 0x10, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x100159848, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a469)
	st32(sf8 + 0x78, 0x1796 /* error::CalculateOverflow */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 0xd0)
	st64(s118 + 0x10, 0x27)
	st64(s118, 0)
	n = fn_13e5a0(s168, s118)
	const o = ld64(s168)
	st64(a + 0x10, ld64(s168 + 8))
	st64(a + 8, o)
	st64(a, 1)
	return n
}

// not included (size budget), see shared.ts:
declare function fn_72df0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64
declare function fn_644c8(a: u64, b: u64, r0: u64): u64
declare function fn_584f8(a: u64, b: u64, c: u64, d: u64): u64
declare function fn_153160(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_158b50(a: u64, b: u64): u64
declare function fn_154940(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_767a8(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64
declare function fn_154838(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_14e808(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_10caa8(a: u64, b: u64, c: u64, d: u64, e: u64): u64
declare function fn_14d4b8(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_153150(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_154890(a: u64, b: u64, c: u64, d: u64, e: u64): never
