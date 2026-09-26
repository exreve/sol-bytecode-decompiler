// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction initialize_reward: handler + 60 reachable functions
// typed views: x.field is exactly the load / store / address given by the field declaration
type at<Offset extends number, T> = T // view field: a T at byte offset Offset of the object (x.f: scalar = its load, ref<U> = the loaded pointer, other = its address)
type ref<T> = T                        // view field holding a pointer (8 bytes) to a T
interface sized<Size extends number> {} // a view of that many bytes: x[k] is the k-th such object from x (at x + k * Size)
interface Pubkey {} // 32-byte public key (a Pubkey value is its address)
interface bytes {} // byte array in place (a bytes value is its address)
interface Bytes64 {} // 64 bytes in place (value = their address)
interface u128 {} // 128-bit integer in place (value = its address)
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
interface InitializeRewardAccounts { // Accounts struct of instruction initialize_reward as accounts_initialize_reward returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	reward_funder: at<0x00, ref<AccountInfo>>
}
interface InitializeRewardContext { // anchor_lang Context of instruction initialize_reward (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<InitializeRewardAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
interface InitializeRewardParam extends sized<0x20> { // IDL type InitializeRewardParam (Borsh layout)
	open_time:                at<0x00, u64>
	end_time:                 at<0x08, u64>
	emissions_per_second_x64: at<0x10, u128>
}
interface InitializeRewardArgs extends sized<0x20> { // arguments of instruction initialize_reward (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	param: at<0x00, InitializeRewardParam>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function try_accounts_120(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function fn_11e0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function fn_12d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function try_accounts_15c0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_1678(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::interface_account::InterfaceAccount<T> as anchor_lang::Accounts<B>…
declare function fn_1730(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_e948(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib uses Mint_unpack_from_slice_137968, raw_vec_handle_error, memset2, memcmp
declare function AccountInfo_clone_f338(a: u64, b: u64): u64 // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function ptr_drop_in_place_fcd8(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<solana_account_info::AccountInfo>
declare function Rc_drop_slow_14df0(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function try_accounts_17a30(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_17ae0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_184d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_18870(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_103fe8(a: u64, b: u64, c: u64): u64 // lib uses __multi3_159030
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function Rc_drop_slow_125dd0(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function Rc_drop_slow_125e20(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function token_transfer(a: u64, b: u64, c: u64): u64 // lib anchor_spl::token::transfer
declare function token_2022_transfer_checked(a: u64, b: u64, c: u64, d: u64): u64 // lib anchor_spl::token_2022::transfer_checked
declare function fn_128fe0(a: u64, b: u64): u64 // lib uses memcpy, Rc_drop_slow_125dd0, Rc_drop_slow_125e20
declare function fn_12c9e0(a: u64, b: u64): u64 // lib uses memcpy, Rc_drop_slow_125dd0, Rc_drop_slow_125e20
declare function fn_132590(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses __multi3_159030, __udivti3
declare function fn_132718(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses __multi3_159030, __udivti3
declare function fn_132b38(a: u64, b: u64): void // lib
declare function fn_132c40(a: u64, b: u64, c: u64, r0: u64): u64 // lib
declare function fn_132ff0(a: u64, b: u64, c: u64): void // lib
declare function fn_1334b0(a: u64, b: u64): u64 // lib uses __rust_alloc, raw_vec_handle_error, reserve_do_reserve_and_handle_131e08, memcpy
declare function Error_new_13c880(): u64 // lib std::io::error::Error::new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function Error_with_pubkeys(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib anchor_lang::error::Error::with_pubkeys
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
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function de_unexpected_eof_to_unexpected_length_of_input(a: u64): u64 // lib borsh::de::unexpected_eof_to_unexpected_length_of_input
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fmt_write(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::write
declare function imp__fmt_155760(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u64>::_fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function cmp___gedf2(a: u64, b: u64): u64 // lib compiler_builtins::float::cmp::__gedf2
declare function __udivti3(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __udivti3
declare function mul_mul(a: u64, b: u64): u64 // lib compiler_builtins::float::mul::mul
declare function __floatundidf(a: u64): u64 // lib __floatundidf
declare function __fixunsdfdi(a: u64): u64 // lib __fixunsdfdi
declare function __multi3_159030(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __multi3

// instruction handler: initialize_reward (discriminator sha256("global:initialize_reward")[..8] = 0x44e681f2c4c0875f)
// accounts [idl]: 0 reward_funder [signer, mut], 1 funder_token_account [mut], 2 amm_config, 3 pool_state [mut], 4 operation_state [pda], 5 reward_token_mint, 6 reward_token_vault [mut, pda], 7 reward_token_program, 8 system_program [= 11111111111111111111111111111111], 9 rent [= SysvarRent111111111111111111111111111111111]
// args [idl]: param: InitializeRewardParam
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args
function ix_initialize_reward(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s20 = fp - 0x20, s70 = fp - 0x70, s78 = fp - 0x78, s88 = fp - 0x88, sd8 = fp - 0xd8, sf0 = fp - 0xf0, s100 = fp - 0x100, s102 = fp - 0x102, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, sff8 = fp - 0xff8
	let n, r: u64
	const k = sol_log("Instruction: InitializeReward", 0x1d)
	const f = ix_args_len
	if (f >= 8 && ((f & -8) != 8 && (f & -0x10) != 0x10)) {
		const args: InitializeRewardArgs = ix_args
		const j = ld64(args.param.emissions_per_second_x64)
		const i = ld64(args.param.emissions_per_second_x64 + 8)
		const h = ld64(args.param)
		st64(s20 + 0x18, args.param.end_time)
		st64(s20, j, i, h)
		st16(s102, 0xffff)
		st64(s100, accounts, accounts_len)
		st64(sff8, s102)
		r = accounts_initialize_reward(s88, program_id, s100, h, fp, k)
		const m = ld64(s78)
		n = ld64(s88 + 8)
		const l = ld64(s88)
		if (l == 0) {
			st64(a + 8, m)
			st64(a, n)
			return r
		}
		const o = memcpy(sd8, s70, 0x50)
		st64(sf0, l, n, m)
		st8(s70 + 9, ld8(s102 + 1))
		st8(s70 + 8, ld8(s102))
		copyr(s78, s100, 0x10)
		st64(s88, program_id, sf0)
		r = fn_44080(s118, s88, s20, o)
		n = ld64(s118)
		if (n == 2) {
			r = fn_becb0(s128, sf0, program_id)
			n = ld64(s128)
			st64(a + 8, ld64(s128 + 8))
			st64(a, n)
			return r
		}
		st64(a + 8, ld64(s118 + 8))
		st64(a, n)
		return r
	}
	const p = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (p & 3) - 2) {
		r = anchor_error_from(s138, 0x66 /* anchor::InstructionDidNotDeserialize */)
		n = ld64(s138)
		st64(a + 8, ld64(s138 + 8))
		st64(a, n)
		return r
	}
	if ((p & 3) == 0) {
		r = anchor_error_from(s138, 0x66 /* anchor::InstructionDidNotDeserialize */)
		n = ld64(s138)
		st64(a + 8, ld64(s138 + 8))
		st64(a, n)
		return r
	}
	const q = ld64(ld64(p + 7))
	if (q == 0) {
		r = anchor_error_from(s138, 0x66 /* anchor::InstructionDidNotDeserialize */)
		n = ld64(s138)
		st64(a + 8, ld64(s138 + 8))
		st64(a, n)
		return r
	}
	callx(q, ld64(p - 1), q)
	r = anchor_error_from(s138, 0x66 /* anchor::InstructionDidNotDeserialize */)
	n = ld64(s138)
	st64(a + 8, ld64(s138 + 8))
	st64(a, n)
	return r
}

// Anchor Accounts::try_accounts of instruction initialize_reward (called by ix_initialize_reward; name [str]: from the handler's "Instruction: …" log; was fn_bd048)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: reward_token_mint, reward_token_vault (AccountNotEnoughKeys, ConstraintMut, ConstraintSeeds), reward_token_program, system_program, rent, operation_state (ConstraintSeeds), pool_state (ConstraintMut), amm_config (ConstraintAddress), funder_token_account (ConstraintMut), reward_funder (ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: reward_funder [idl]
function accounts_initialize_reward(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const sb8 = fp - 0xb8, sd8 = fp - 0xd8, sf8 = fp - 0xf8, s118 = fp - 0x118, s138 = fp - 0x138, s160 = fp - 0x160, s180 = fp - 0x180, s1a0 = fp - 0x1a0, s1c0 = fp - 0x1c0, s1e0 = fp - 0x1e0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s3e0 = fp - 0x3e0
	let o, ac, ae, af, ag, aj, ak, am, an: u64
	st64(s3e0 + 0x58, b)
	let r = try_accounts_17a30(sd8, c, c, d, e, r0)
	const reward_funder: AccountInfo = ld64(sd8 + 8)
	let f = ld64(sd8)
	if (f == 2) {
		const k = ld64(e - 0xff8)
		r = try_accounts_1678(sd8, c)
		if (ld32(sb8 + 0x90) == 2) {
			const m = ld64(0x300000000 /* heap bump-allocator cursor */)
			f = ld64(sd8)
			const n = m != 0 ? sat_sub(m, 0x14) : 0x300007fec
			o = ld64(sd8 + 8)
			if (f != 0) {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6363615f6e656b6f)
				st64(n, 0x745f7265646e7566)
				st32(n + 0x10, 0x746e756f)
				void ld64(o)
			} else {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6363615f6e656b6f)
				st64(n, 0x745f7265646e7566)
				st32(n + 0x10, 0x746e756f)
				void ld64(o)
			}
			st64(o + 0x10, n, 0x14)
			st64(o + 8, 0x14)
			st64(o, 1)
			st64(a + 0x10, o)
			st64(a + 8, f)
			st64(a, 0)
			return r
		}
		const j = ld64(0x300000000 /* heap bump-allocator cursor */)
		st64(s3e0 + 0x50, k)
		const l = j != 0 ? sat_sub(j, 0xd8) : 0x300007f28
		if (0x300000008 > l) {
			alloc_handle_alloc_error(8, 0xd8)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, l & -8)
		if ((l & -8) != 0) {
			memcpy(l & -8, sd8, 0xd8)
			r = try_accounts_184d8(sd8, c)
			let y = undef
			if (ld64(sd8) == 0) {
				const u = ld64(0x300000000 /* heap bump-allocator cursor */)
				f = ld64(sd8 + 8)
				const v = u != 0 ? sat_sub(u, 0xa) : 0x300007ff6
				o = ld64(sd8 + 0x10)
				if (f != 0) {
					if (0x300000008 > v) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, y)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, v)
					st64(v, 0x666e6f635f6d6d61)
					st16(v + 8, 0x6769)
					void ld64(o)
				} else {
					if (0x300000008 > v) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, y)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, v)
					st64(v, 0x666e6f635f6d6d61)
					st16(v + 8, 0x6769)
					void ld64(o)
				}
				st64(o + 0x10, v, 0xa)
				st64(o + 8, 0xa)
				st64(o, 1)
				st64(a + 0x10, o)
				st64(a + 8, f)
				st64(a, 0)
				return r
			}
			const p = ld64(0x300000000 /* heap bump-allocator cursor */)
			const q = p != 0 ? sat_sub(p, 0x78) : 0x300007f88
			if (0x300000008 > q) {
				alloc_handle_alloc_error(8, 0x78)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, q & -8)
			if ((q & -8) != 0) {
				st64(s3e0 + 0x48, q & -8)
				memcpy(q & -8, sd8, 0x78)
				fn_11e0(sd8, c)
				r = ld64(sd8 + 8)
				f = ld64(sd8)
				if (f == 2) {
					st64(s3e0 + 0x40, r)
					fn_12d8(sd8, c)
					r = ld64(sd8 + 8)
					f = ld64(sd8)
					if (f == 2) {
						st64(s3e0 + 0x30, r)
						try_accounts_15c0(sd8, c)
						if (ld32(sd8) == 2) {
							r = fn_4130(s210, ld64(sd8 + 8), ld64(sd8 + 0x10), "reward_token_mint", 0x11)
							ac = ld64(s210 + 8)
							f = ld64(s210)
							if (f != 2) {
								st64(a + 0x10, ac)
								st64(a + 8, f)
								st64(a, 0)
								return r
							}
						} else {
							const aa = ld64(0x300000000 /* heap bump-allocator cursor */)
							const ab = aa != 0 ? sat_sub(aa, 0x80) : 0x300007f80
							if (0x300000008 > ab) {
								alloc_handle_alloc_error(8, 0x80)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, ab & -8)
							if ((ab & -8) == 0) {
								alloc_handle_alloc_error(8, 0x80)
							}
							st64(s3e0 + 0x38, ab & -8)
							memcpy(ab & -8, sd8, 0x80)
							ac = ld64(s3e0 + 0x38)
						}
						st64(s3e0 + 0x38, ac)
						const ad = ld64(c + 8)
						if (ad == 0) {
							anchor_error_from(s220, 0xbbd /* anchor::AccountNotEnoughKeys */, ae, af, ag)
							o = ld64(s220 + 8)
							const ah = ld64(s220)
							if (ah != 2) {
								r = fn_4130(s230, ah, o, "reward_token_vault", 0x12)
								o = ld64(s230 + 8)
								f = ld64(s230)
								if (f != 2) {
									st64(a + 0x10, o)
									st64(a + 8, f)
									st64(a, 0)
									return r
								}
							}
						} else {
							st64(c + 8, ad - 1)
							o = ld64(c)
							st64(c, o + 0x30)
						}
						st64(s3e0 + 0x28, o)
						try_accounts_120(sd8, c, o, af, ag)
						o = ld64(sd8 + 8)
						const ai = ld64(sd8)
						if (ai != 2) {
							r = fn_4130(s240, ai, o, "reward_token_program", 0x14)
							o = ld64(s240 + 8)
							f = ld64(s240)
							if (f != 2) {
								st64(a + 0x10, o)
								st64(a + 8, f)
								st64(a, 0)
								return r
							}
						}
						st64(s3e0 + 0x20, o)
						try_accounts_18870(sd8, c, o, aj, ak)
						o = ld64(sd8 + 8)
						const al = ld64(sd8)
						if (al != 2) {
							r = fn_4130(s250, al, o, "system_program", 0xe)
							o = ld64(s250 + 8)
							f = ld64(s250)
							if (f != 2) {
								st64(a + 0x10, o)
								st64(a + 8, f)
								st64(a, 0)
								return r
							}
						}
						st64(s3e0 + 0x18, o)
						try_accounts_17ae0(sd8, c, o, am, an)
						const ap = ld64(sd8 + 0x10)
						const aq = ld64(sd8 + 8)
						const ao = ld64(sd8)
						if (ao == 0) {
							r = fn_4130(s380, aq, ap, 0x1001598f8 /* "rent" */, 4)
							f = ld64(s380)
							st64(a + 0x10, ld64(s380 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return r
						}
						if (reward_funder.is_writable != 0) {
							if (ld8(ld64((l & -8) + 0x20) + 0x29) != 0) {
								st64(s3e0, ap, aq)
								st64(s3e0 + 0x10, ld64(sd8 + 0x18))
								const ar = ld64(ld64(ld64(s3e0 + 0x38) + 0x58))
								copyr(sd8, ar, 0x20)
								const at = memcmp((l & -8) + 0x28, sd8, 0x20)
								if ((at as u32) != 0) {
									r = anchor_error_from(s2a0, 0x7de /* anchor::ConstraintTokenMint */)
									f = ld64(s2a0)
									st64(a + 0x10, ld64(s2a0 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return r
								}
								const au = ld64(ld64(ld64(s3e0 + 0x48)))
								copyr(s200, au, 0x20)
								r = fn_4dc0(sd8, ld64(s3e0 + 0x40), at as u32)
								const av = ld64(sd8 + 0x10)
								const aw = ld64(sd8 + 8)
								if (ld64(sd8) != 0) {
									st64(a + 0x10, av)
									st64(a + 8, aw)
									st64(a, 0)
									return r
								}
								copyr(s1e0, aw + 1, 0x20)
								st64(av, ld64(av) - 1)
								if ((memcmp(s200, s1e0, 0x20) as u32) == 0) {
									if (ld8(ld64(s3e0 + 0x40) + 0x29 /* is_writable */) != 0) {
										st64(s160, 0x10015b1ad, 9)
										// PDA find_program_address(["operation"], program *(ld64(s3e0 + 0x58)))
										Pubkey_find_program_address(sd8, s160, 1, ld64(s3e0 + 0x58))
										copyr(s1c0, sd8, 0x20)
										st8(ld64(s3e0 + 0x50), ld8(sb8))
										const ba = ld64(ld64(s3e0 + 0x30))
										copyr(s1a0, ba, 0x20)
										if ((memcmp(s1a0, s1c0, 0x20) as u32) != 0) {
											anchor_error_from(s300, 0x7d6 /* anchor::ConstraintSeeds */)
											const bn = fn_4130(s310, ld64(s300), ld64(s300 + 8), "operation_state", 0xf)
											const bm = ld64(s310 + 8)
											const bl = ld64(s310)
											copyr(sd8, s1a0, 0x20)
											copy(sb8, s1c0, 0x20)
											r = Error_with_pubkeys(s320, bl, bm, sd8, bn)
											f = ld64(s320)
											st64(a + 0x10, ld64(s320 + 8))
											st64(a + 8, f)
											st64(a, 0)
											return r
										}
										const bb = ld64(ld64(s3e0 + 0x40) /* key */)
										copyr(s138, bb, 0x20)
										const bc = ld64(ld64(ld64(s3e0 + 0x38) + 0x58))
										const bg = ld64(bc)
										const bf = ld64(bc + 8)
										const be = ld64(bc + 0x10)
										const bd = ld64(bc + 0x18)
										st64(sd8, 0x10015a08c)
										st64(sd8 + 0x10, s138)
										st64(sb8, s118)
										st64(s118, bg, bf, be, bd)
										st64(sd8 + 8, 0x11)
										st64(sd8 + 0x18, 0x20)
										st64(sb8 + 8, 0x20)
										// PDA find_program_address(["pool_reward_vault", *bb, *s118], program *(ld64(s3e0 + 0x58)))
										Pubkey_find_program_address(s160, sd8, 3, ld64(s3e0 + 0x58))
										copyr(s180, s160, 0x20)
										st8(ld64(s3e0 + 0x50) + 1, ld8(s160 + 0x20))
										const bh = ld64(ld64(s3e0 + 0x28) /* key */)
										copyr(sf8, bh, 0x20)
										r = memcmp(sf8, s180, 0x20) as u32
										if (r == 0) {
											if (ld8(ld64(s3e0 + 0x28) + 0x29 /* is_writable */) != 0) {
												st64(a + 0x60, ld64(s3e0 + 0x10))
												st64(a + 0x58, ld64(s3e0))
												st64(a + 0x50, ld64(s3e0 + 8))
												st64(a + 0x48, ao)
												st64(a + 0x40, ld64(s3e0 + 0x18))
												st64(a + 0x38, ld64(s3e0 + 0x20))
												st64(a + 0x30, ld64(s3e0 + 0x28))
												st64(a + 0x28, ld64(s3e0 + 0x38))
												st64(a + 0x20, ld64(s3e0 + 0x30))
												st64(a + 0x18, ld64(s3e0 + 0x40))
												st64(a + 0x10, ld64(s3e0 + 0x48))
												st64(a + 8, l & -8)
												st64(a, reward_funder)
												return r
											}
											anchor_error_from(s360, 0x7d0 /* anchor::ConstraintMut */)
											r = fn_4130(s370, ld64(s360), ld64(s360 + 8), "reward_token_vault", 0x12)
											f = ld64(s370)
											st64(a + 0x10, ld64(s370 + 8))
											st64(a + 8, f)
											st64(a, 0)
											return r
										}
										anchor_error_from(s330, 0x7d6 /* anchor::ConstraintSeeds */)
										const bk = fn_4130(s340, ld64(s330), ld64(s330 + 8), "reward_token_vault", 0x12)
										const bj = ld64(s340 + 8)
										const bi = ld64(s340)
										copyr(sd8, sf8, 0x20)
										copy(sb8, s180, 0x20)
										r = Error_with_pubkeys(s350, bi, bj, sd8, bk)
										f = ld64(s350)
										st64(a + 0x10, ld64(s350 + 8))
										st64(a + 8, f)
										st64(a, 0)
										return r
									}
									anchor_error_from(s2e0, 0x7d0 /* anchor::ConstraintMut */)
									r = fn_4130(s2f0, ld64(s2e0), ld64(s2e0 + 8), "pool_state", 0xa)
									f = ld64(s2f0)
									st64(a + 0x10, ld64(s2f0 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return r
								}
								anchor_error_from(s2b0, 0x7dc /* anchor::ConstraintAddress */)
								const az = fn_4130(s2c0, ld64(s2b0), ld64(s2b0 + 8), 0x10015af4d /* "amm_config" */, 0xa)
								const ay = ld64(s2c0 + 8)
								const ax = ld64(s2c0)
								copy(sd8, s200, 0x40)
								r = Error_with_pubkeys(s2d0, ax, ay, sd8, az)
								f = ld64(s2d0)
								st64(a + 0x10, ld64(s2d0 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return r
							}
							anchor_error_from(s280, 0x7d0 /* anchor::ConstraintMut */, ap)
							r = fn_4130(s290, ld64(s280), ld64(s280 + 8), "funder_token_account", 0x14)
							f = ld64(s290)
							st64(a + 0x10, ld64(s290 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return r
						}
						anchor_error_from(s260, 0x7d0 /* anchor::ConstraintMut */, ap)
						r = fn_4130(s270, ld64(s260), ld64(s260 + 8), "reward_funder", 0xd)
						f = ld64(s270)
						st64(a + 0x10, ld64(s270 + 8))
						st64(a + 8, f)
						st64(a, 0)
						return r
					}
					const s = ld64(0x300000000 /* heap bump-allocator cursor */)
					const t = s != 0 ? sat_sub(s, 0xf) : 0x300007ff1
					if ((f & 1) != 0) {
						if (0x300000008 > t) {
							raw_vec_handle_error(1, 0xf, 0x10015f8f8, sat_sub(s, 0xf), 0xf > s)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, t)
						st64(t + 7, 0x65746174735f6e6f)
						st64(t, 0x6f6974617265706f)
						void ld64(r)
					} else {
						if (0x300000008 > t) {
							raw_vec_handle_error(1, 0xf, 0x10015f8f8, sat_sub(s, 0xf), 0xf > s)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, t)
						st64(t + 7, 0x65746174735f6e6f)
						st64(t, 0x6f6974617265706f)
						void ld64(r)
					}
					st64(r + 0x10, t, 0xf)
					st64(r + 8, 0xf)
					st64(r, 1)
					st64(a + 0x10, r)
					st64(a + 8, f)
					st64(a, 0)
					return r
				}
				const x = ld64(0x300000000 /* heap bump-allocator cursor */)
				y = 0xa > x
				const w = y != 0 ? 0 : x - 0xa
				const z = x != 0 ? w : 0x300007ff6
				if ((f & 1) != 0) {
					if (0x300000008 > z) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, w, y)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, z)
					st64(z, 0x6174735f6c6f6f70)
					st16(z + 8, 0x6574)
					void ld64(r)
				} else {
					if (0x300000008 > z) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, w, y)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, z)
					st64(z, 0x6174735f6c6f6f70)
					st16(z + 8, 0x6574)
					void ld64(r)
				}
				st64(r + 0x10, z, 0xa)
				st64(r + 8, 0xa)
				st64(r, 1)
				st64(a + 0x10, r)
				st64(a + 8, f)
				st64(a, 0)
				return r
			}
			alloc_handle_alloc_error(8, 0x78)
		}
		alloc_handle_alloc_error(8, 0xd8)
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0xd) : 0x300007ff3
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xd, 0x10015f8f8, sat_sub(g, 0xd), 0xd > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 5, 0x7265646e75665f64)
		st64(h, 0x665f647261776572)
		void reward_funder.key
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xd, 0x10015f8f8, sat_sub(g, 0xd), 0xd > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 5, 0x7265646e75665f64)
		st64(h, 0x665f647261776572)
		void reward_funder.key
	}
	st64(reward_funder + 0x10, h, 0xd)
	st64(reward_funder + 8, 0xd)
	st64(reward_funder, 1)
	st64(a + 0x10, reward_funder)
	st64(a + 8, f)
	st64(a, 0)
	return r
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: AccountInfo, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it)
// types [heur]: b: InitializeRewardContext (the handler ix_initialize_reward passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_44080(a: u64, b: InitializeRewardContext, c: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, sa8 = fp - 0xa8, s110 = fp - 0x110, s128 = fp - 0x128, s148 = fp - 0x148, s149 = fp - 0x149, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s270 = fp - 0x270, s278 = fp - 0x278, s280 = fp - 0x280, s288 = fp - 0x288, sff0 = fp - 0xff0, s1000 = fp - 0x1000
	let bc: u64
	st64(s250, c, a)
	const accounts: InitializeRewardAccounts = b.accounts
	let af = fn_7e058(s148, b.remaining_accounts, b.remaining_accounts_len, ld64(accounts + 0x28), r0)
	let an = ld64(s148 + 8)
	let g = ld64(s148)
	if (g != 2) {
		bc = ld64(s250 + 8)
		st64(bc + 8, an)
		st64(bc, g)
		return af
	}
	af = fn_7e560(s148, ld64(accounts + 0x28), ld8(s148 + 8) & 1)
	an = ld64(s148 + 8)
	g = ld64(s148)
	if (g != 2) {
		bc = ld64(s250 + 8)
		st64(bc + 8, an)
		st64(bc, g)
		return af
	}
	st64(s270 + 0x18, accounts)
	if ((ld8(s148 + 8) & 1) != 0) {
		const h: InitializeRewardAccounts = ld64(s270 + 0x18)
		const i: AccountInfo = ld64(h + 0x18)
		const j: LamportsCell = i.lamports
		const p = i.key
		rc_inc(j)
		const k: DataCell = i.data
		rc_inc(k)
		const o = i.owner
		const n = i.rent_epoch
		const m = i.is_signer
		const l = i.is_writable
		st8(s50 + 2, i.executable)
		st8(s50, m, l)
		st64(s78, p, j, k, o, n)
		const q: AccountInfo = ld64(h + 0x30)
		const r: LamportsCell = q.lamports
		const s = r.strong
		st64(s270 + 0x10, k)
		const t = q.key
		rc_inc(r, s)
		st64(s270, t)
		const u: DataCell = q.data
		const v = u.strong
		st64(s270 + 8, j)
		rc_inc(u, v)
		const z = q.owner
		const y = q.rent_epoch
		const x = q.is_signer
		const w = q.is_writable
		st8(s20 + 2, q.executable)
		st8(s20, x, w)
		st64(s38, u, z, y)
		st64(s48, ld64(s270))
		st64(s278, r)
		st64(s40, r)
		const ab = ld64(h + 0x28)
		const aa = ld64(ld64(h + 0x18))
		copyr(s170, aa, 0x20)
		const ac = ld64(ld64(ab + 0x58))
		copyr(sa8, ac, 0x20)
		const ad = ld8(b + 0x21)
		st64(s128 + 0x10, s149)
		st64(s128, sa8)
		st64(s148 + 0x10, s170)
		st64(s148, 0x10015a08c)
		st8(s149, ad)
		st64(s110, 1)
		st64(s128 + 8, 0x20)
		st64(s148 + 0x18, 0x20)
		st64(s148 + 8, 0x11)
		st64(s1000, ab, h + 0x40, h + 0x38, s148, 4)
		af = fn_81db0(s190, h, s78, s48, ab, h + 0x40, h + 0x38, s148, 4)
		an = ld64(s190 + 8)
		g = ld64(s190)
		const ae = ld64(s278)
		if (rc_release(ae)) {
			af = Rc_drop_slow_14df0(s40, af)
		}
		if (rc_release(u)) {
			af = Rc_drop_slow_14df0(s38, af)
		}
		const ag = ld64(s270 + 8)
		const ah = ld64(s270 + 0x10)
		if (rc_release(ag)) {
			af = Rc_drop_slow_14df0(s70, af)
		}
		if (rc_release(ah)) {
			af = Rc_drop_slow_14df0(s68, af)
		}
		const ai: InitializeRewardAccounts = ld64(s270 + 0x18)
		if (g == 2) {
			af = fn_4808(s148, ld64(ai + 0x20), af)
			let aj = ld64(s148 + 0x10)
			const ak = ld64(s148 + 8)
			an = aj
			g = ak
			if (ld64(s148) != 0) {
				bc = ld64(s250 + 8)
				st64(bc + 8, an)
				st64(bc, g)
				return af
			}
			st64(s270 + 0x10, ak)
			const al = ai.reward_funder.key
			copyr(s148, al, 0x20)
			const am = memcmp(s148, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20)
			if ((am as u32) != 0) {
				copyr(s148, al, 0x20)
				af = fn_4dc0(s48, ld64(ai + 0x18), am as u32)
				an = ld64(s38)
				g = ld64(s40)
				if (ld64(s48) != 0) {
					st64(aj, ld64(aj) - 1)
					bc = ld64(s250 + 8)
					st64(bc + 8, an)
					st64(bc, g)
					return af
				}
				const ao = memcmp(s148, g + 0x21, 0x20)
				st64(an, ld64(an) - 1)
				const ap: InitializeRewardAccounts = ld64(s270 + 0x18)
				if ((ao as u32) != 0 && fn_67ac0(ld64(s270 + 0x10), ap.reward_funder.key) == 0) {
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
					copyr(s110, s78, 0x18)
					copy(s128, sa8, 0x18)
					st64(s148 + 8, 0x10015a05a)
					st32(s110 + 0x60, 0x1770 /* error::NotApproved */)
					st8(s110 + 0x18, 2)
					st32(s148 + 0x18, 0x83)
					st64(s148 + 0x10, 0x32)
					st64(s148, 0)
					af = fn_13e5a0(s1a0, s148)
					an = ld64(s1a0 + 8)
					g = ld64(s1a0)
					st64(aj, ld64(aj) - 1)
					bc = ld64(s250 + 8)
					st64(bc + 8, an)
					st64(bc, g)
					return af
				}
			}
			const au = clock_get(s148)
			if (ld64(s148) != 0) {
				const ar = ld64(s148 + 8)
				const aq = ld64(s148 + 0x10)
				st64(s148 + 0x10, ld64(s148 + 0x18))
				st64(s148, ar, aq)
				af = fn_13e628(s240, s148)
				an = ld64(s240 + 8)
				g = ld64(s240)
				st64(aj, ld64(aj) - 1)
				bc = ld64(s250 + 8)
				st64(bc + 8, an)
				st64(bc, g)
				return af
			}
			const at = ld64(s250)
			af = fn_43fb8(s1b0, at, ld64(s128 + 8), au)
			an = ld64(s1b0 + 8)
			g = ld64(s1b0)
			if (g == 2) {
				const aw = ld64(at + 0x10)
				const av = ld64(at + 0x18)
				if (aw > av) {
					fn_154788(0x10015fe00)
				}
				st64(sa8, av - aw, 0)
				const ay = ld64(at)
				const ax = ld64(at + 8)
				st64(s70, ax)
				st64(s250, ay)
				st64(s78, ay)
				st64(s48, 0, 1)
				fn_58930(s148, sa8, s78, s48)
				const az: InitializeRewardAccounts = ld64(s270 + 0x18)
				if (ld64(s148) != 0) {
					st64(s270, ax, aw)
					if (ld64(s148 + 0x10) == 0) {
						const ba = ld64(s148 + 8)
						af = fn_7d178(s148, fn_16330(ld64(az + 0x28)), ba)
						const bb = ld64(s148 + 8)
						g = ld64(s148)
						if (g != 2) {
							st64(aj, ld64(aj) - 1)
							bc = ld64(s250 + 8)
							st64(bc + 8, bb)
							st64(bc, g)
							return af
						}
						st64(s278, av)
						const bd: InitializeRewardAccounts = ld64(s270 + 0x18)
						if (ba > bb + ba) {
							af = fn_88360(s230, 0x26)
							an = ld64(s230 + 8)
							g = ld64(s230)
							st64(aj, ld64(aj) - 1)
							bc = ld64(s250 + 8)
							st64(bc + 8, an)
							st64(bc, g)
							return af
						}
						if (bb + ba > ld64(ld64(bd + 8) + 0x68)) {
							ErrorCode_name(sa8, 0x100159858)
							st64(s78, 0, 1, 0)
							st64(s28, s78, 0x10015f818)
							st8(s20 + 0x10, 3)
							st64(s20 + 8, 0x20)
							st64(s38, 0)
							st64(s48, 0)
							if (ErrorCode_fmt(0x100159858, s48) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
							}
							copyr(s110, s78, 0x18)
							copy(s128, sa8, 0x18)
							st64(s148 + 8, 0x10015a05a)
							st32(s110 + 0x60, 0x9ca /* anchor::RequireGteViolated */)
							st8(s110 + 0x18, 2)
							st32(s148 + 0x18, 0x9c)
							st64(s148 + 0x10, 0x32)
							st64(s148, 0)
							fn_13e5a0(s210, s148)
							af = fn_1730(s220, ld64(s210), ld64(s210 + 8), ld64(ld64(bd + 8) + 0x68), bb + ba)
							an = ld64(s220 + 8)
							g = ld64(s220)
							st64(aj, ld64(aj) - 1)
							bc = ld64(s250 + 8)
							st64(bc + 8, an)
							st64(bc, g)
							return af
						}
						if (ba > 0x5555555555555554) {
							ErrorCode_name(sa8, 0x100159900)
							st64(s78, 0, 1, 0)
							st64(s28, s78, 0x10015f818)
							st8(s20 + 0x10, 3)
							st64(s20 + 8, 0x20)
							st64(s38, 0)
							st64(s48, 0)
							if (ErrorCode_fmt(0x100159900, s48) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
							}
							copyr(s110, s78, 0x18)
							copy(s128, sa8, 0x18)
							st64(s148 + 8, 0x10015a05a)
							st32(s110 + 0x60, 0x9c9 /* anchor::RequireGtViolated */)
							st8(s110 + 0x18, 2)
							st32(s148 + 0x18, 0xa1)
							st64(s148 + 0x10, 0x32)
							st64(s148, 0)
							fn_13e5a0(s1f0, s148)
							af = fn_1730(s200, ld64(s1f0), ld64(s1f0 + 8), 0x5555555555555555, ba)
							an = ld64(s200 + 8)
							g = ld64(s200)
							st64(aj, ld64(aj) - 1)
							bc = ld64(s250 + 8)
							st64(bc + 8, an)
							st64(bc, g)
							return af
						}
						st64(s280, bb + ba)
						af = fn_53e8(s148, ld64(bd + 0x18), undef, undef, undef, af)
						an = ld64(s148 + 0x10)
						g = ld64(s148 + 8)
						if (ld64(s148) != 0) {
							st64(aj, ld64(aj) - 1)
							bc = ld64(s250 + 8)
							st64(bc + 8, an)
							st64(bc, g)
							return af
						}
						st64(s288, aj)
						const be: InitializeRewardAccounts = ld64(s270 + 0x18)
						const bf = ld64(be + 0x28)
						const bg = ld64(ld64(bf + 0x58))
						copyr(sa8, bg, 0x20)
						st32(s128, ld32(bf + 0x54))
						copyr(s148, bf + 0x34, 0x20)
						const bh = ld64(ld64(be + 0x30))
						copyr(s78, bh, 0x20)
						const bi = be.reward_funder.key
						copyr(s48, bi, 0x20)
						st64(sff0 + 0x20, ld64(s270 + 0x10))
						st64(sff0, sa8, s148, s78, s48)
						st64(s1000 + 8, ld64(s270))
						st64(s1000, ld64(s250))
						af = fn_6ad88(s1d0, g, ld64(s270 + 8), ld64(s278), ld64(s1000), ld64(s1000 + 8), sa8, s148, s78, s48, ld64(sff0 + 0x20))
						let bs = ld64(s1d0 + 8)
						g = ld64(s1d0)
						if (g == 2) {
							const bj: InitializeRewardAccounts = ld64(s270 + 0x18)
							const bk = ld64(ld64(bj + 8) + 0x20)
							st64(s250, sa8)
							AccountInfo_clone_f338(sa8, bk)
							const bl = ld64(bj + 0x30)
							st64(s270 + 0x10, s78)
							AccountInfo_clone_f338(s78, bl)
							st64(s270 + 8, fn_16330(ld64(bj + 0x28)))
							const bm = ld64(bj + 0x38)
							st64(s270, s48)
							AccountInfo_clone_f338(s48, bm)
							const bo = AccountInfo_clone_f338(s148, ld64(bj + 0x38))
							st64(sff0 + 8, ld64(s280))
							st64(sff0, s148)
							st64(s1000, ld64(s270 + 8))
							st64(s1000 + 8, s48)
							const bn = ld64(s270 + 0x10)
							const bp = fn_79050(s1e0, bj, ld64(s250), bn, ld64(s1000), s48, s148, ld64(sff0 + 8), bo, bj)
							bs = ld64(s1e0 + 8)
							g = ld64(s1e0)
							const bq = ptr_drop_in_place_fcd8(bn, ptr_drop_in_place_fcd8(ld64(s270), bp))
							af = ptr_drop_in_place_fcd8(ld64(s250), bq)
							if (g == 2) {
								st64(an, ld64(an) + 1)
								const br = ld64(s288)
								st64(br, ld64(br) - 1)
								bc = ld64(s250 + 8)
								st64(bc + 8, an)
								st64(bc, 2)
								return af
							}
						}
						st64(an, ld64(an) + 1)
						aj = ld64(s288)
						st64(aj, ld64(aj) - 1)
						bc = ld64(s250 + 8)
						st64(bc + 8, bs)
						st64(bc, g)
						return af
					}
					st64(s148, 0x10015fe18, 1, 8, 0, 0)
					// fmt "Integer overflow when casting to u64"
					fn_14ec00(s148, 0x10015fe28)
				}
				af = fn_88360(s1c0, 0x26)
				an = ld64(s1c0 + 8)
				g = ld64(s1c0)
				st64(aj, ld64(aj) - 1)
				bc = ld64(s250 + 8)
				st64(bc + 8, an)
				st64(bc, g)
				return af
			}
			st64(aj, ld64(aj) - 1)
			bc = ld64(s250 + 8)
			st64(bc + 8, an)
			st64(bc, g)
			return af
		}
		bc = ld64(s250 + 8)
		st64(bc + 8, an)
		st64(bc, g)
		return af
	}
	fn_85138(sa8, 0x100159868)
	st64(s78, 0, 1, 0)
	st64(s28, s78, 0x10015f818)
	st8(s20 + 0x10, 3)
	st64(s20 + 8, 0x20)
	st64(s38, 0)
	st64(s48, 0)
	if (fn_88558(0x100159868, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copyr(s110, s78, 0x18)
	copy(s128, sa8, 0x18)
	st64(s148 + 8, 0x10015a05a)
	st32(s110 + 0x60, 0x1792 /* error::NotSupportMint */)
	st8(s110 + 0x18, 2)
	st32(s148 + 0x18, 0x6f)
	st64(s148 + 0x10, 0x32)
	st64(s148, 0)
	af = fn_13e5a0(s180, s148)
	g = ld64(s180)
	bc = ld64(s250 + 8)
	st64(bc + 8, ld64(s180 + 8))
	st64(bc, g)
	return af
}

function fn_becb0(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38
	let h, j, k, l: u64
	const f = ld64(b + 8)
	const g = ld64(f + 0x20)
	if ((memcmp(f, c, 0x20) as u32) == 0 && (common_is_closed(g) == 0 && ld64(ld64(g + 0x10) + 0x10) != 0)) {
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		l = fn_13e628(s28, s18)
		h = ld64(s28)
		if (h != 2) {
			const m = ld64(0x300000000 /* heap bump-allocator cursor */)
			j = m != 0 ? sat_sub(m, 0x14) : 0x300007fec
			k = ld64(s28 + 8)
			if ((h & 1) != 0) {
				if (0x300000008 > j) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > m)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x6363615f6e656b6f)
				st64(j, 0x745f7265646e7566)
				st32(j + 0x10, 0x746e756f)
				void ld64(k)
			} else {
				if (0x300000008 > j) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > m)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, j)
				st64(j + 8, 0x6363615f6e656b6f)
				st64(j, 0x745f7265646e7566)
				st32(j + 0x10, 0x746e756f)
				void ld64(k)
			}
			st64(k + 8, 0x14)
			st64(k, 1)
			st64(k + 0x18, 0x14)
			st64(k + 0x10, j)
			st64(a + 8, k)
			st64(a, h)
			return l
		}
	}
	l = fn_a80(s38, ld64(b + 0x18), c)
	k = undef
	h = ld64(s38)
	if (h == 2) {
		st64(a + 8, k)
		st64(a, 2)
		return l
	}
	const i = ld64(0x300000000 /* heap bump-allocator cursor */)
	j = i != 0 ? sat_sub(i, 0xa) : 0x300007ff6
	k = ld64(s38 + 8)
	if ((h & 1) != 0) {
		if (0x300000008 > j) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > i)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st64(j, 0x6174735f6c6f6f70)
		st16(j + 8, 0x6574)
		void ld64(k)
	} else {
		if (0x300000008 > j) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > i)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, j)
		st64(j, 0x6174735f6c6f6f70)
		st16(j + 8, 0x6574)
		void ld64(k)
	}
	st64(k + 8, 0xa)
	st64(k, 1)
	st64(k + 0x18, 0xa)
	st64(k + 0x10, j)
	st64(a + 8, k)
	st64(a, h)
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

// types [heur]: b: AccountInfo (every call passes one: fn_1a610, fn_44080, fn_55688, …)
function fn_7e058(a: u64, b: AccountInfo, c: u64, d: u64, r0: u64): u64 {
	const s10 = fp - 0x10, s68 = fp - 0x68, s80 = fp - 0x80, sa8 = fp - 0xa8, sd8 = fp - 0xd8, se8 = fp - 0xe8, s108 = fp - 0x108, s128 = fp - 0x128, s148 = fp - 0x148, s158 = fp - 0x158, s160 = fp - 0x160
	let r: u64
	if (c != 0) {
		st64(s160, a)
		const f = ld64(ld64(d + 0x58))
		const j = ld64(f)
		const i = ld64(f + 8)
		const h = ld64(f + 0x10)
		const g = ld64(f + 0x18)
		st64(s128, j, i, h, g, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */, 0x10015a827, 0xc, s128, 0x20)
		// PDA find_program_address(["support_mint", *s128], program *s108)
		Pubkey_find_program_address(s80, se8, 2, s108)
		copyr(s148, s80, 0x20)
		st64(s158, sd8, sa8)
		let k = b + 0x10
		let l = c * 0x30
		while (true) {
			const m = ld64(k + 8)
			copyr(s80, s108, 0x20)
			r0 = memcmp(m, s80, 0x20) as u32
			if (r0 == 0) {
				const n = ld64(k - 0x10)
				copyr(s80, n, 0x20)
				r0 = memcmp(s80, s148, 0x20) as u32
				if (r0 == 0) {
					const o = ld64(k)
					const p = ld64(o + 0x10)
					if (p > 0x7ffffffffffffffe) {
						fn_14e808(0x100160590, 0x7ffffffffffffffe)
					}
					st64(o + 0x10, p + 1)
					const q = ld64(o + 0x18)
					st64(s10 + 8, ld64(o + 0x20))
					st64(s10, q)
					r0 = fn_110d30(s80, s10)
					if (ld64(s80) != 0) {
						const t = ld64(s80 + 8)
						const s = ld64(s160)
						st64(s + 8, ld64(s80 + 0x10))
						st64(s, t)
						st64(o + 0x10, ld64(o + 0x10) - 1)
						return r0
					}
					memcpy(ld64(s158), s68, 0x58)
					st64(o + 0x10, ld64(o + 0x10) - 1)
					copyr(s80, s128, 0x20)
					r0 = memcmp(ld64(s158 + 8), s80, 0x20) as u32
					if (r0 == 0) {
						r = ld64(s160)
						st8(r + 8, 1)
						st64(r, 2)
						return r0
					}
				}
			}
			k = k + 0x30
			l = l - 0x30
			if (l == 0) {
				r = ld64(s160)
				st8(r + 8, 0)
				st64(r, 2)
				return r0
			}
		}
	}
	st64(a, 2)
	st8(a + 8, 0)
	return r0
}

function fn_7e560(a: u64, b: u64, c: u64): u64 {
	const s68 = fp - 0x68, s90 = fp - 0x90, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8
	let n, ab, ac: u64
	const f: AccountInfo = ld64(b + 0x58)
	const g: LamportsCell = f.lamports
	const l = f.key
	rc_inc(g)
	const h: DataCell = f.data
	rc_inc(h)
	B9: {
		const m = f.owner
		const k = f.rent_epoch
		const j = f.is_signer
		const i = f.is_writable
		st8(s90 + 2, f.executable)
		st8(s90, j, i)
		st64(sb8, l, g, h, m, k)
		n = memcmp(m, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32
		if (n != 0 && c == 0) {
			const q = AccountInfo_try_borrow_data(s68, sb8, n)
			const w = ld64(s68 + 0x10)
			const p = ld64(s68 + 8)
			const o = ld64(s68)
			if (o == 0x800000000000001a /* Ok */) {
				const y = fn_e948(s68, ld64(p), ld64(p + 8), undef, undef, q)
				if (ld32(s68) == 2) {
					const r = ld64(s68 + 0x18)
					st64(s90 + 0x20, r)
					const s = ld64(s68 + 0x10)
					st64(s90 + 0x18, s)
					const t = ld64(s68 + 8)
					st64(s90 + 0x10, t)
					st64(s68, t, s, r)
					n = fn_13e628(se8, s68)
					ac = ld64(se8)
					ab = ld64(se8 + 8)
				} else {
					n = fn_132c40(s68, ld64(s68 + 0x58), ld64(s68 + 0x60), y)
					const z = ld64(s68 + 0x10)
					let aa = ld64(s68 + 8)
					if (ld64(s68) != 0x8000000000000000) {
						if (z == 0) {
							st64(a, 2)
							st8(a + 8, 1)
							st64(w, ld64(w) - 1)
							return ptr_drop_in_place_fcd8(sb8, n)
						}
						let ae = z << 1
						while (true) {
							const ad = ld16(aa)
							if (0x19 >= ad && ((1 << (ad & 0x3f)) & 0x20c0402) != 0) {
								aa = aa + 2
								ae = ae - 2
								if (ae == 0) {
									st64(a, 2)
									st8(a + 8, 1)
									st64(w, ld64(w) - 1)
									return ptr_drop_in_place_fcd8(sb8, n)
								}
								continue
							}
							st64(a, 2)
							st8(a + 8, 0)
							st64(w, ld64(w) - 1)
							break B9
						}
					}
					st64(s68 + 0x10, ld64(s68 + 0x18))
					st64(s68, aa, z)
					n = fn_13e628(sd8, s68)
					ac = ld64(sd8)
					ab = ld64(sd8 + 8)
				}
				st64(a + 8, ab)
				st64(a, ac)
				st64(w, ld64(w) - 1)
			} else {
				st64(s68, o, p, w)
				n = fn_13e628(sc8, s68)
				const x = ld64(sc8)
				st64(a + 8, ld64(sc8 + 8))
				st64(a, x)
			}
		} else {
			st64(a, 2)
			st8(a + 8, 1)
		}
	}
	const u: LamportsCell = ld64(sb0)
	if (rc_release(u)) {
		n = Rc_drop_slow_14df0(sb0, n)
	}
	const v: DataCell = ld64(sa8)
	if (!rc_release(v)) {
		return n
	}
	return Rc_drop_slow_14df0(sa8, n)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it), c (points to it)
function fn_81db0(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64): u64 {
	const s10 = fp - 0x10, s18 = fp - 0x18, s40 = fp - 0x40, s48 = fp - 0x48, s70 = fp - 0x70, s78 = fp - 0x78, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se8 = fp - 0xe8, sf0 = fp - 0xf0, s118 = fp - 0x118, s120 = fp - 0x120, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178
	let cm = d
	const f: AccountInfo = ld64(p7)
	const g: LamportsCell = f.lamports
	const h = f.key
	rc_inc(g)
	let cs = h
	let cr = g
	let cl = b
	const i: DataCell = f.data
	const k = p9
	const l = p8
	const j = p6
	const m = p5
	rc_inc(i)
	let ck = j
	let ci = k
	let cj = l
	const n: AccountInfo = ld64(m + 0x58)
	const o: LamportsCell = n.lamports
	let cp = f.executable
	let cq = f.is_writable
	const p = f.is_signer
	const v = f.rent_epoch
	const w = f.owner
	let co = n.key
	rc_inc(o)
	let cn = p
	const q: DataCell = n.data
	rc_inc(q)
	let ct: AccountInfo = f
	const u = n.owner
	const t = n.rent_epoch
	const s = n.is_signer
	const r = n.is_writable
	let ch: AccountInfo = n
	st8(sa8 + 2, n.executable)
	st8(sa8, s, r)
	st64(sd0, co, o, q, u, t)
	st8(s78, cn, cq, cp)
	st64(sa0, cs, cr, i, w, v)
	st64(s70, 8, 0)
	st64(se8, 0, 8, 0)
	let ca = fn_12c020(s118, se8, 0x10015a834, 1)
	let x = ld64(s118)
	if (x != 2) {
		st64(a + 8, ld64(s118 + 8))
		st64(a, x)
		return ca
	}
	const y: AccountInfo = ld64(cl)
	const z: LamportsCell = y.lamports
	const ac: LamportsCell = ld64(s118 + 8)
	const ab = ct.key
	const ah = y.key
	const aq: AccountInfo = cm
	rc_inc(z)
	const aa: DataCell = y.data
	rc_inc(aa)
	cs = ab
	const ag = y.owner
	const af = y.rent_epoch
	const ae = y.is_signer
	const ad = y.is_writable
	st8(s120 + 2, y.executable)
	st8(s120, ae, ad)
	st64(s148, ah, z, aa, ag, af)
	const ai: AccountInfo = ld64(ck)
	const aj: LamportsCell = ai.lamports
	const ap = ai.key
	rc_inc(aj)
	const ak: DataCell = ai.data
	rc_inc(ak)
	const ao = ai.owner
	const an = ai.rent_epoch
	const am = ai.is_signer
	const al = ai.is_writable
	st8(sf0 + 2, ai.executable)
	st8(sf0, am, al)
	st64(s118, ap, aj, ak, ao, an)
	const ar: LamportsCell = aq.lamports
	const au = aq.key
	const ba: AccountInfo = ct
	rc_inc(ar)
	const at: DataCell = aq.data
	rc_inc(at)
	const az = aq.owner
	const ay = aq.rent_epoch
	const ax = aq.is_signer
	const aw = aq.is_writable
	const av = aq.executable
	st64(se8, au, ar, at)
	cn = av
	st8(sc0 + 2, av)
	co = aw
	st8(sc0 + 1, aw)
	cp = ax
	st8(sc0, ax)
	cq = ay
	st64(sd0 + 8, ay)
	cr = az
	st64(sd0, az)
	ca = fn_82dd0(s158, cs, s148, s118, se8, cj, ci, ac)
	x = ld64(s158)
	if (x == 2) {
		const bb: LamportsCell = ba.lamports
		const bd = ba.key
		rc_inc(bb)
		const bc: DataCell = ba.data
		rc_inc(bc)
		cl = bd
		cm = au
		const bf = ba.executable
		const bg = ba.is_writable
		const bh = ba.is_signer
		const bi = ba.rent_epoch
		const bj = ba.owner
		cs = ar
		rc_inc(ar)
		rc_inc(at)
		st8(sa8, cp, co, cn)
		st64(sc0, at, cr, cq)
		const be = cs
		st64(sd0, cm, cs)
		st8(s78, bh, bg, bf)
		st64(sa0, cl, bb, bc, bj, bi)
		st64(s70, 8, 0)
		st64(se8, 0, 8, 0)
		ca = fn_12c9e0(s168, se8)
		x = ld64(s168)
		if (x == 2) {
			const bk: AccountInfo = ct
			const bl: LamportsCell = ct.lamports
			const bs = ct.key
			rc_inc(bl)
			const bm: DataCell = bk.data
			rc_inc(bm)
			ci = ct.executable
			cj = ct.is_writable
			ck = ct.is_signer
			const bp = ct.rent_epoch
			const bn = ct.owner
			rc_inc(be)
			rc_inc(at)
			ct = bn
			const bo: LamportsCell = ch.lamports
			const bq: AccountInfo = ch
			const cg = ch.key
			rc_inc(bo)
			const br: DataCell = bq.data
			cl = bl
			rc_inc(br)
			const bt: LamportsCell = c.lamports
			const cb = c.key
			const cc = ch.executable
			const cd = ch.is_writable
			const ce = ch.is_signer
			const cf = ch.rent_epoch
			ch = ch.owner
			rc_inc(bt)
			const bu: DataCell = c.data
			rc_inc(bu)
			const by = c.owner
			const bx = c.rent_epoch
			const bw = c.is_signer
			const bv = c.is_writable
			st8(s18 + 2, c.executable)
			st8(s18, bw, bv)
			st64(s40, cb, bt, bu, by, bx)
			st8(s48, ce, cd, cc)
			st64(s70, cg, bo, br, ch, cf)
			st8(s78, cp, co, cn)
			st64(sa0, cm, cs, at, cr, cq)
			st8(sa8, ck, cj, ci)
			st64(sd0, bs, cl, bm, ct, bp)
			st64(s10, 8, 0)
			st64(se8, 0, 8, 0)
			ca = fn_128fe0(s178, se8)
			const bz = ld64(s178)
			if (bz == 2) {
				st64(a + 8, undef)
				st64(a, 2)
				return ca
			}
			st64(a + 8, ld64(s178 + 8))
			st64(a, bz)
			return ca
		}
		st64(a + 8, ld64(s168 + 8))
		st64(a, x)
		return ca
	}
	st64(a + 8, ld64(s158 + 8))
	st64(a, x)
	return ca
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
// account data [idl: layout; the pointer is inferred from a comparison of its first 8 bytes with the account discriminator]: operation_state_data: OperationStateAccount
function fn_4808(a: u64, b: u64, r0: u64): u64 {
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
	const operation_state_data: OperationStateAccount = ld64(g)
	const j = operation_state_data.discriminator
	if (j == 0xfcb7de51ed3aec13 /* account:OperationState */) {
		if (h > 0xdc8) {
			st64(a + 0x10, k)
			st64(a + 8, operation_state_data + 8)
			st64(a, 0)
			return n
		}
		fn_153158(0xdc9, h, 0x10015f700, 0xfcb7de51ed3aec13 /* account:OperationState */)
	}
	n = anchor_error_from(s38, 0xbba /* anchor::AccountDiscriminatorMismatch */, j, 0xfcb7de51ed3aec13 /* account:OperationState */)
	m = ld64(s38)
	st64(a + 0x10, ld64(s38 + 8))
	st64(a + 8, m)
	st64(a, 1)
	st64(k, ld64(k) - 1)
	return n
}

function fn_67ac0(a: u64, b: u64): u64 {
	const s20 = fp - 0x20
	st64(s20, 0, 0, 0, 0)
	if ((memcmp(b, s20, 0x20) as u32) == 0) {
		return 0
	}
	if ((memcmp(a + 1, b, 0x20) as u32) == 0) {
		return 1
	}
	if ((memcmp(a + 0x21, b, 0x20) as u32) == 0) {
		return 1
	}
	if ((memcmp(a + 0x41, b, 0x20) as u32) == 0) {
		return 1
	}
	if ((memcmp(a + 0x61, b, 0x20) as u32) == 0) {
		return 1
	}
	if ((memcmp(a + 0x81, b, 0x20) as u32) == 0) {
		return 1
	}
	if ((memcmp(a + 0xa1, b, 0x20) as u32) == 0) {
		return 1
	}
	if ((memcmp(a + 0xc1, b, 0x20) as u32) == 0) {
		return 1
	}
	if ((memcmp(a + 0xe1, b, 0x20) as u32) == 0) {
		return 1
	}
	if ((memcmp(a + 0x101, b, 0x20) as u32) == 0) {
		return 1
	}
	return (memcmp(a + 0x121, b, 0x20) as u32) == 0
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
function fn_43fb8(a: u64, b: u64, c: u64, r0: u64): u64 {
	const s10 = fp - 0x10
	let i: u64
	const f = ld64(b + 0x18)
	if (c > f) {
		r0 = fn_88360(s10, 0x1d)
		i = ld64(s10)
		st64(a + 8, ld64(s10 + 8))
		st64(a, i)
		return r0
	}
	const g = ld64(b + 0x10)
	if (c > g) {
		r0 = fn_88360(s10, 0x1d)
		i = ld64(s10)
		st64(a + 8, ld64(s10 + 8))
		st64(a, i)
		return r0
	}
	if (g >= f) {
		r0 = fn_88360(s10, 0x1d)
		i = ld64(s10)
		st64(a + 8, ld64(s10 + 8))
		st64(a, i)
		return r0
	}
	const h = ld64(b) | ld64(b + 8)
	if (h == 0) {
		r0 = fn_88360(s10, 0x1d)
		i = ld64(s10)
		st64(a + 8, ld64(s10 + 8))
		st64(a, i)
		return r0
	}
	if (f - g - 0x76a701 > 0xffffffffff92937e) {
		st64(a + 8, h)
		st64(a, 2)
		return r0
	}
	r0 = fn_88360(s10, 0x1f)
	i = ld64(s10)
	st64(a + 8, ld64(s10 + 8))
	st64(a, i)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it), b (points to it), c (points to it)
function fn_58930(a: u64, b: u64, c: u64, d: u64): u64 {
	const s30 = fp - 0x30, s40 = fp - 0x40, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s108 = fp - 0x108, s110 = fp - 0x110, s118 = fp - 0x118, s120 = fp - 0x120
	let j, k, u, v, x, y, ab, ad: u64
	const f = ld64(d)
	let g = ld64(d + 8)
	if ((f | g) == 0) {
		st64(a, 0)
		return g
	}
	B9: {
		st64(s120, d)
		st64(s108, a, f, g)
		const h = ld64(b)
		const i = ld64(c)
		__multi3_159030(sf0, h, 0, i, 0)
		j = ld64(b + 8)
		st64(s110, i)
		__multi3_159030(sd0, j, 0, i, 0)
		k = ld64(c + 8)
		st64(s118, h)
		__multi3_159030(se0, k, 0, h, 0)
		__multi3_159030(sc0, k, 0, j, 0)
		const m = ld64(sf0 + 8)
		const l = ld64(sd0)
		const q = (l > l + m) + ld64(sd0 + 8)
		const n = ld64(se0)
		const o = n + (l + m)
		const p = (n > o) + ld64(se0 + 8)
		u = ld64(s108 + 8)
		const t = p > p + q
		const r = ld64(sc0)
		const s = r + (p + q)
		if (s == 0 && (r > s) + ld64(sc0 + 8) == -(t & 1)) {
			x = ld64(sf0)
			if (u == 0) {
				y = -1
				const ao = ld64(s108 + 0x10)
				v = ao - 1
				if (ao == 0) {
					st64(s40, 0x100160990, 1, 8, 0, 0)
					// fmt "arithmetic operation overflow"
					fn_14ec00(s40, 0x10015fe28, v, x, y)
				}
			} else {
				y = u - 1
				v = ld64(s108 + 0x10)
			}
			let w = o + v
			const aa = o > w
			const z = x + y
			if (z >= x) {
				if ((aa & 1) != 0) {
					break B9
				}
			} else {
				w = w + 1
				if (((aa | w == 0) & 1) != 0) {
					break B9
				}
			}
			st64(sb0, z, w)
			g = fn_100918(s40, sb0, ld64(s120))
			a = ld64(s108)
			st64(a + 0x10, ld64(s40 + 8))
			st64(a + 8, ld64(s40))
			st64(a, 1)
			return g
		}
	}
	st64(s80 + 8, j)
	st64(s80, ld64(s118))
	st64(s70, 0, 0)
	st64(s40 + 8, k)
	st64(s40, ld64(s110))
	st64(s30, 0, 0)
	fn_103fe8(sa0, s80, s40)
	x = undef
	y = undef
	if (u == 0) {
		v = -1
		ab = ld64(s108 + 0x10)
		ad = ab - 1
		if (ab == 0) {
			st64(s40, 0x100160990, 1, 8, 0, 0)
			// fmt "arithmetic operation overflow"
			fn_14ec00(s40, 0x10015fe28, v, x, y)
		}
	} else {
		v = u - 1
		ab = ld64(s108 + 0x10)
		ad = ab
	}
	const ac = ld64(sa0 + 8)
	const ae = ac + ad
	const af = ld64(sa0)
	const ag = af + v
	const al = af > ag ? ae + 1 : ae
	const ah = af > ag & ae == -1
	const ai = ld64(sa0 + 0x10)
	let aj = ai + (ah + (ac > ae))
	const ak = ai > aj
	aj = (ac > ae | ah) != 0 ? aj : ai
	const am = ld64(sa0 + 0x18)
	if ((ac > ae | ah) == 1 && (ak & 1) != 0) {
		st64(s80, ag, al, aj, am + 1)
		if (am == -1) {
			st64(s40, 0x100160990, 1, 8, 0, 0)
			// fmt "arithmetic operation overflow"
			fn_14ec00(s40, 0x10015feb8, al, aj, am + 1)
		}
	} else {
		st64(s80, ag, al, aj, am)
	}
	st64(s60, u, ab, 0, 0)
	g = fn_1019b8(s40, s80, s60)
	a = ld64(s108)
	if ((ld64(s30 + 8) | ld64(s30)) != 0) {
		st64(a, 0)
		return g
	}
	const an = ld64(s40)
	st64(a + 0x10, ld64(s40 + 8))
	st64(a + 8, an)
	st64(a, 1)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), a (points to it)
function fn_7d178(a: u64, b: u64, c: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s130 = fp - 0x130, s138 = fp - 0x138, s150 = fp - 0x150, s158 = fp - 0x158, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0
	let aa, af, ag, an: u64
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
	st8(s138 + 2, f.executable)
	st8(s138, j, i)
	st64(s160, l, g, h, m, k)
	const n = memcmp(m, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20)
	let z = s150
	let p = s158
	let o = n as u32
	if (o == 0) {
		st64(a, 2, 0)
	} else {
		const ao = p
		const s = AccountInfo_try_borrow_data(s118, s160, o)
		const w = ld64(s118 + 0x10)
		const r = ld64(s118 + 8)
		const q = ld64(s118)
		if (q == 0x800000000000001a /* Ok */) {
			B28: {
				const y = fn_e948(s118, ld64(r), ld64(r + 8), undef, undef, s)
				if (ld32(s118) != 2) {
					B13: {
						o = fn_e480(s130, ld64(sf8 + 0x38), ld64(sf8 + 0x40), undef, y, a)
						if (ld64(s130) == 0x800000000000001a /* Ok */) {
							const am = ld64(s130 + 8)
							o = clock_get(s118)
							if (ld64(s118) != 0) {
								const ae = ld64(s118 + 8)
								const ad = ld64(s118 + 0x10)
								st64(s118 + 0x10, ld64(s118 + 0x18))
								st64(s118, ae, ad)
								o = fn_13e628(s180, s118)
								ag = ld64(s180 + 8)
								af = ld64(s180)
								if (af != 2) {
									st64(a + 8, ag)
									break B28
								}
							} else {
								ag = ld64(s118 + 0x18)
							}
							const al = ag
							const ah = fn_132718(s190, am, ag, c, o)
							if (ld64(s190) == 0) {
								o = fn_88360(s1e0, 0x26)
								ag = ld64(s1e0 + 8)
								af = ld64(s1e0)
							} else {
								an = z
								aa = ld64(s190 + 8)
								if (c > c + aa) {
									o = fn_88360(s1d0, 0x26)
									ag = ld64(s1d0 + 8)
									af = ld64(s1d0)
								} else {
									o = fn_132590(s1a0, am, al, aa + c, ah)
									if (ld64(s1a0) == 0) {
										o = fn_88360(s1c0, 0x26)
										ag = ld64(s1c0 + 8)
										af = ld64(s1c0)
									} else {
										if (aa == ld64(s1a0 + 8)) {
											break B13
										}
										fn_85138(s78, 0x100159850)
										st64(s60, 0, 1, 0)
										st64(s28, s60, 0x10015f818)
										st8(s28 + 0x18, 3)
										st64(s28 + 0x10, 0x20)
										st64(s48 + 0x10, 0)
										st64(s48, 0)
										if (fn_88558(0x100159850, s48) != 0) {
											fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
										}
										copy(sf8, s78, 0x30)
										st64(s118 + 8, 0x10015a809)
										st32(sf8 + 0x78, 0x1797 /* error::TransferFeeCalculateNotMatch */)
										st8(sf8 + 0x30, 2)
										st32(s118 + 0x18, 0xf6)
										st64(s118 + 0x10, 0x1e)
										st64(s118, 0)
										o = fn_13e5a0(s1b0, s118)
										ag = ld64(s1b0 + 8)
										af = ld64(s1b0)
									}
								}
								z = an
							}
							st64(a + 8, ag)
							break B28
						}
						an = z
						aa = 0
					}
					st64(a + 8, aa)
					st64(a, 2)
					st64(w, ld64(w) - 1)
					const ab: LamportsCell = ld64(s158)
					if (rc_release(ab)) {
						o = Rc_drop_slow_14df0(ao, o)
					}
					const ac: DataCell = ld64(s150)
					const ak = an
					if (!rc_release(ac)) {
						return o
					}
					return Rc_drop_slow_14df0(ak, o)
				}
				const t = ld64(s118 + 0x18)
				st64(s48 + 0x14, t)
				const u = ld64(s118 + 0x10)
				st64(s48 + 0xc, u)
				const v = ld64(s118 + 8)
				st64(s48 + 4, v)
				st64(s118, v, u, t)
				o = fn_13e628(s1f0, s118)
				af = ld64(s1f0)
				st64(a + 8, ld64(s1f0 + 8))
			}
			st64(a, af)
			st64(w, ld64(w) - 1)
		} else {
			st64(s118, q, r, w)
			o = fn_13e628(s170, s118)
			const x = ld64(s170)
			st64(a + 8, ld64(s170 + 8))
			st64(a, x)
		}
		p = ao
	}
	const ai: LamportsCell = ld64(s158)
	if (rc_release(ai)) {
		o = Rc_drop_slow_14df0(p, o)
	}
	const aj: DataCell = ld64(s150)
	if (!rc_release(aj)) {
		return o
	}
	return Rc_drop_slow_14df0(z, o)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value), p7 (points to it), p9 (points to it), p10 (points to it)
function fn_6ad88(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s188 = fp - 0x188, s231 = fp - 0x231, s2da = fp - 0x2da, s313 = fp - 0x313, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3d0 = fp - 0x3d0, s3d8 = fp - 0x3d8, s3e0 = fp - 0x3e0, s3e8 = fp - 0x3e8, s3f0 = fp - 0x3f0
	let m, n, r, s, t, u, y, ab: u64
	st64(s3b8, d, c)
	st64(s3a8 + 0x10, a)
	memcpy(s313, b + 0x185, 0x1fb)
	st64(s118, 0, 0, 0, 0)
	const f = memcmp(s2da, s118, 0x20)
	st64(s3d0, p6, p5)
	st64(s3a8, p11, p10)
	st64(s3d0 + 0x10, p9)
	st64(s3e0, p8)
	const k = p7
	let i = 0
	if ((f as u32) != 0) {
		st64(s118, 0, 0, 0, 0)
		const g = memcmp(s231, s118, 0x20)
		i = 1
		if ((g as u32) != 0) {
			st64(s118, 0, 0, 0, 0)
			const h = memcmp(s188, s118, 0x20)
			i = 2
			if ((h as u32) != 0) {
				u = fn_88360(s328, 0x1a)
				t = ld64(s328)
				r = ld64(s3a8 + 0x10)
				st64(r + 8, ld64(s328 + 8))
				st64(r, t)
				return u
			}
		}
	}
	st64(s3d8, i)
	const j = ld64(0x300000000 /* heap bump-allocator cursor */)
	st64(s3a8 + 0x18, k)
	const l = j != 0 ? sat_sub(j, 0x60) : 0x300007fa0
	if (l > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, l)
		st64(l + 0x18, ld64(b + 0x1d6))
		st64(l + 0x10, ld64(b + 0x1ce))
		st64(l + 8, ld64(b + 0x1c6))
		st64(l, ld64(b + 0x1be))
		copy(l + 0x20, b + 0x267, 0x20)
		copy(l + 0x40, b + 0x310, 0x20)
		const o = ld64(s3a8 + 0x18)
		if ((memcmp(l, o, 0x20) as u32) != 0) {
			st64(s3e8, l + 0x20)
			if ((memcmp(l + 0x20, o, 0x20) as u32) != 0) {
				st64(s3f0, l + 0x40)
				if ((memcmp(l + 0x40, o, 0x20) as u32) != 0) {
					const p = ld64(0x300000000 /* heap bump-allocator cursor */)
					const q = p != 0 ? sat_sub(p, 0xc80) : 0x300007380
					if (q > 0x300000007) {
						B35: {
							st64(0x300000000 /* heap bump-allocator cursor */, q)
							memcpy(q, ld64(s3a8) + 0x141, 0xc80)
							const v = ld64(s3d8)
							if (v == 0) {
								const z = memcmp(ld64(s3a8 + 0x18), b + 0x41, 0x20)
								if ((z as u32) != 0 && (memcmp(ld64(s3a8 + 0x18), b + 0x61, 0x20) as u32) != 0) {
									let aa = 0
									do {
										if (aa == 0xc80) {
											if ((ld32(ld64(s3e0)) & 1) == 0) {
												break
											}
											fn_85138(s78, 0x100159864)
											st64(s60, 0, 1, 0)
											st64(s28, s60, 0x10015f818)
											st8(s28 + 0x18, 3)
											st64(s28 + 0x10, 0x20)
											st64(s48 + 0x10, 0)
											st64(s48, 0)
											if (fn_88558(0x100159864, s48) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copy(sf8, s78, 0x30)
											st64(s118 + 8, 0x10015a741)
											st32(sf8 + 0x78, 0x178c /* error::ExceptRewardMint */)
											st8(sf8 + 0x30, 2)
											st32(s118 + 0x18, 0x11e)
											st64(s118 + 0x10, 0x1f)
											st64(s118, 0)
											u = fn_13e5a0(s368, s118)
											t = ld64(s368)
											r = ld64(s3a8 + 0x10)
											st64(r + 8, ld64(s368 + 8))
											st64(r, t)
											return u
										}
										ab = memcmp(q + aa, ld64(s3a8 + 0x18), 0x20)
										aa = aa + 0x20
									} while ((ab as u32) != 0)
								}
							} else if (v == 1) {
								st64(s3a8, q)
								if ((memcmp(l, b + 0x41, 0x20) as u32) != 0 && ((memcmp(ld64(s3e8), b + 0x41, 0x20) as u32) != 0 && ((memcmp(ld64(s3f0), b + 0x41, 0x20) as u32) != 0 && ((memcmp(l, b + 0x61, 0x20) as u32) != 0 && ((memcmp(ld64(s3e8), b + 0x61, 0x20) as u32) != 0 && (memcmp(ld64(s3f0), b + 0x61, 0x20) as u32) != 0))))) {
									const aj = memcmp(ld64(s3a8 + 0x18), b + 0x41, 0x20)
									if ((aj as u32) == 0) {
										break B35
									}
									if ((memcmp(ld64(s3a8 + 0x18), b + 0x61, 0x20) as u32) == 0) {
										break B35
									}
									let ak = 0
									while (true) {
										if (ak == 0xc80) {
											fn_85138(s78, 0x100159864)
											st64(s60, 0, 1, 0)
											st64(s28, s60, 0x10015f818)
											st8(s28 + 0x18, 3)
											st64(s28 + 0x10, 0x20)
											st64(s48 + 0x10, 0)
											st64(s48, 0)
											if (fn_88558(0x100159864, s48) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copy(sf8, s78, 0x30)
											st64(s118 + 8, 0x10015a741)
											st32(sf8 + 0x78, 0x178c /* error::ExceptRewardMint */)
											st8(sf8 + 0x30, 2)
											st32(s118 + 0x18, 0x12a)
											st64(s118 + 0x10, 0x1f)
											st64(s118, 0)
											u = fn_13e5a0(s348, s118)
											t = ld64(s348)
											r = ld64(s3a8 + 0x10)
											st64(r + 8, ld64(s348 + 8))
											st64(r, t)
											return u
										}
										const al = memcmp(ld64(s3a8) + ak, ld64(s3a8 + 0x18), 0x20)
										ak = ak + 0x20
										if ((al as u32) == 0) {
											break B35
										}
									}
								}
								const w = memcmp(ld64(s3a8 + 0x18), b + 0x41, 0x20)
								if ((w as u32) != 0 && (memcmp(ld64(s3a8 + 0x18), b + 0x61, 0x20) as u32) != 0) {
									let x = 0
									do {
										if (x == 0xc80) {
											if (ld32(ld64(s3e0)) != 1) {
												break
											}
											fn_85138(s78, 0x100159864)
											st64(s60, 0, 1, 0)
											st64(s28, s60, 0x10015f818)
											st8(s28 + 0x18, 3)
											st64(s28 + 0x10, 0x20)
											st64(s48 + 0x10, 0)
											st64(s48, 0)
											if (fn_88558(0x100159864, s48) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
											}
											copy(sf8, s78, 0x30)
											st64(s118 + 8, 0x10015a741)
											st32(sf8 + 0x78, 0x178c /* error::ExceptRewardMint */)
											st8(sf8 + 0x30, 2)
											st32(s118 + 0x18, 0x137)
											st64(s118 + 0x10, 0x1f)
											st64(s118, 0)
											u = fn_13e5a0(s358, s118)
											t = ld64(s358)
											r = ld64(s3a8 + 0x10)
											st64(r + 8, ld64(s358 + 8))
											st64(r, t)
											return u
										}
										y = memcmp(ld64(s3a8) + x, ld64(s3a8 + 0x18), 0x20)
										x = x + 0x20
									} while ((y as u32) != 0)
								}
							} else if ((memcmp(ld64(s3a8 + 8), 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) != 0 && fn_67ac0(ld64(s3a8), ld64(s3a8 + 8)) == 0) {
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
								st64(s118 + 8, 0x10015a741)
								st32(sf8 + 0x78, 0x1770 /* error::NotApproved */)
								st8(sf8 + 0x30, 2)
								st32(s118 + 0x18, 0x13f)
								st64(s118 + 0x10, 0x1f)
								st64(s118, 0)
								u = fn_13e5a0(s338, s118)
								t = ld64(s338)
								r = ld64(s3a8 + 0x10)
								st64(r + 8, ld64(s338 + 8))
								st64(r, t)
								return u
							}
						}
						const ac = b + 0x185 + ld64(s3d8) * 0xa9
						st64(ac + 0x21, ld64(s3d0))
						st64(ac + 0x19, ld64(s3d0 + 8))
						st64(ac + 9, ld64(s3b8))
						const ad = ld64(s3b8 + 8)
						st64(ac + 1, ad)
						st64(ac + 0x11, ad)
						const ae = ld64(s3a8 + 0x18)
						st64(ac + 0x51, ld64(ae + 0x18))
						st64(ac + 0x49, ld64(ae + 0x10))
						st64(ac + 0x41, ld64(ae + 8))
						st64(ac + 0x39, ld64(ae))
						const af = ld64(s3d0 + 0x10)
						copy(ac + 0x59, af, 0x20)
						const ag = ld64(s3a8 + 8)
						copy(ac + 0x79, ag, 0x20)
						u = clock_get(s118)
						if (ld64(s118) != 0) {
							const ai = ld64(s118 + 8)
							const ah = ld64(s118 + 0x10)
							st64(s118 + 0x10, ld64(s118 + 0x18))
							st64(s118, ai, ah)
							u = fn_13e628(s378, s118)
							s = ld64(s378 + 8)
							t = ld64(s378)
							r = ld64(s3a8 + 0x10)
							if (t == 2) {
								st64(b + 0x438, s)
								st64(r + 8, s)
								st64(r, 2)
								return u
							}
							st64(r + 8, s)
							st64(r, t)
							return u
						}
						s = ld64(s118 + 0x18)
						r = ld64(s3a8 + 0x10)
						st64(b + 0x438, s)
						st64(r + 8, s)
						st64(r, 2)
						return u
					}
					raw_vec_handle_error(1, 0xc80, 0x10015f8f8, 0xc80 > p)
				}
			}
		}
		fn_85138(s78, 0x1001598f4)
		st64(s60, 0, 1, 0)
		st64(s28, s60, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_88558(0x1001598f4, s48) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
		}
		copy(sf8, s78, 0x30)
		st64(s118 + 8, 0x10015a741)
		st32(sf8 + 0x78, 0x178b /* error::RewardTokenAlreadyInUse */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x111)
		st64(s118 + 0x10, 0x1f)
		st64(s118, 0)
		u = fn_13e5a0(s388, s118)
		t = ld64(s388)
		r = ld64(s3a8 + 0x10)
		st64(r + 8, ld64(s388 + 8))
		st64(r, t)
		return u
	}
	raw_vec_handle_error(1, 0x60, 0x100160148, m, n)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14ec00(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s18 = fp - 0x18
	st64(s18, a, b)
	st16(s18 + 0x10, 1)
	fn_14ce00(s18, b, c, d, e)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_154788(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622e0, 1, 8, 0, 0)
	// fmt "attempt to subtract with overflow"
	fn_14ec00(s30, a, c, d, e)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (points to it), e (value)
function fn_153158(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155b30(a, b, c, d, e)
}

function fn_110d30(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	let g, j: u64
	if (8 > ld64(b + 8)) {
		j = anchor_error_from(s138, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		g = ld64(s138)
		st64(a + 0x10, ld64(s138 + 8))
		st64(a + 8, g)
		st64(a, 1)
		return j
	}
	if (ld64(ld64(b)) == 0x35a2700c4fb72886 /* account:SupportMintAssociated */) {
		return fn_1111c0(a, b, 0x35a2700c4fb72886 /* account:SupportMintAssociated */, d, e)
	}
	ErrorCode_name(s78, 0x1001598e8, 0x35a2700c4fb72886 /* account:SupportMintAssociated */, d, e)
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
	st64(s118 + 8, 0x10015b450)
	st32(sf8 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
	st8(sf8 + 0x30, 2)
	st32(s118 + 0x18, 6)
	st64(s118 + 0x10, 0x32)
	st64(s118, 0)
	j = fn_13e5a0(s128, s118)
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	g = ld64(s128)
	const h = f != 0 ? sat_sub(f, 0x15) : 0x300007feb
	const i = ld64(s128 + 8)
	if ((g & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x15, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 0xd, 0x6465746169636f73)
		st64(h + 8, 0x636f737341746e69)
		st64(h, 0x4d74726f70707553)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0x15, 0x10015f8f8, 0x300000008)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 0xd, 0x6465746169636f73)
		st64(h + 8, 0x636f737341746e69)
		st64(h, 0x4d74726f70707553)
		void ld64(i)
	}
	st64(i + 0x10, h, 0x15)
	st64(i + 8, 0x15)
	st64(i, 1)
	st64(a + 0x10, i)
	st64(a + 8, g)
	st64(a, 1)
	return j
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_12c020(a: u64, b: u64, c: u64, d: u64): u64 {
	const s38 = fp - 0x38, s50 = fp - 0x50, s80 = fp - 0x80, s90 = fp - 0x90, s98 = fp - 0x98, sa0 = fp - 0xa0, sb8 = fp - 0xb8, se8 = fp - 0xe8, s100 = fp - 0x100, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s140 = fp - 0x140
	let n, ah, ar: u64
	const f = ld64(b + 0x48)
	fn_1371d0(sa0, f, ld64(b + 0x18), c, d)
	copy(sb8, s98, 0x18)
	const g = ld64(sa0)
	if (g == 0x8000000000000000) {
		n = fn_13e628(s138, sb8)
		const l = ld64(s138)
		st64(a + 8, ld64(s138 + 8))
		st64(a, l)
		const m = ld64(b + 0x20)
		if (rc_release(m)) {
			n = Rc_drop_slow_125dd0(b + 0x20, n)
		}
		const o = ld64(b + 0x28)
		if (rc_release(o)) {
			n = Rc_drop_slow_125e20(b + 0x28, n)
		}
	} else {
		st64(s140, a)
		memcpy(se8, s80, 0x30)
		st64(s108, g)
		copy(s100, sb8, 0x18)
		memcpy(sa0, b + 0x18, 0x30)
		let i = fn_142568(s50, s108, sa0, 1)
		if (ld64(s50) == 0x800000000000001a /* Ok */) {
			const h = ld64(s98)
			if (rc_release(h)) {
				i = Rc_drop_slow_125dd0(s98, i)
			}
			const j = ld64(s90)
			if (rc_release(j)) {
				Rc_drop_slow_125e20(s90, i)
			}
			B41: {
				B40: {
					fn_142b40(s38)
					const k = ld64(s38 + 0x20)
					if (k == 0x8000000000000000) {
						ah = 0x8000000000000002 /* Err(ProgramError::InvalidInstructionData) */
					} else {
						const ad = ld64(s38)
						const ac = ld64(s38 + 8)
						const ab = ld64(s38 + 0x10)
						const aa = ld64(s38 + 0x18)
						st64(s80 + 0x10, ld64(s38 + 0x30))
						st64(sa0, ad, ac, ab, aa)
						const ae = ld64(s38 + 0x28)
						st64(s80 + 8, ae)
						n = memcmp(sa0, f, 0x20) as u32
						if (n != 0) {
							ah = 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */
							if (k == 0) {
								break B40
							}
						} else {
							if (ld64(s80 + 0x10) == 8) {
								const ag = ld64(ae)
								if (k != 0) {
									n = fn_11e480(n)
								}
								const af = ld64(s140)
								st64(af + 8, ag)
								st64(af, 2)
								break B41
							}
							ah = 0x8000000000000002 /* Err(ProgramError::InvalidInstructionData) */
							if (k == 0) {
								break B40
							}
						}
						fn_11e480(n)
					}
				}
				st64(sa0, ah)
				n = fn_13e628(s128, sa0)
				const aj = ld64(s128)
				const ai = ld64(s140)
				st64(ai + 8, ld64(s128 + 8))
				st64(ai, aj)
			}
			if (ld64(s108) != 0) {
				n = fn_11e480(n)
			}
			if (ld64(s100 + 0x10) != 0) {
				n = fn_11e480(n)
			}
			const al = ld64(b + 8)
			let ak = ld64(b + 0x10)
			if (ak != 0) {
				let am = al + 0x10
				do {
					const an = ld64(am - 8)
					if (rc_release(an)) {
						n = Rc_drop_slow_125dd0(am - 8, n)
					}
					const ao = ld64(am)
					if (rc_release(ao)) {
						n = Rc_drop_slow_125e20(am, n)
					}
					am = am + 0x30
					ak = ak - 1
				} while (ak != 0)
			}
			if (ld64(b) != 0) {
				n = fn_11e480(n)
			}
			const ap = ld64(b + 0x50)
			if (rc_release(ap)) {
				n = Rc_drop_slow_125dd0(b + 0x50, n)
			}
			const aq = ld64(b + 0x58)
			ar = b + 0x58
			if (!rc_release(aq)) {
				return n
			}
			return Rc_drop_slow_125e20(ar, n)
		}
		copyr(s38, s50, 0x18)
		n = fn_13e628(s118, s38)
		const q = ld64(s118)
		const p = ld64(s140)
		st64(p + 8, ld64(s118 + 8))
		st64(p, q)
		const r = ld64(s98)
		if (rc_release(r)) {
			n = Rc_drop_slow_125dd0(s98, n)
		}
		const s = ld64(s90)
		if (rc_release(s)) {
			n = Rc_drop_slow_125e20(s90, n)
		}
		if (ld64(s108) != 0) {
			n = fn_11e480(n)
		}
		if (ld64(s100 + 0x10) != 0) {
			n = fn_11e480(n)
		}
	}
	const u = ld64(b + 8)
	let t = ld64(b + 0x10)
	if (t != 0) {
		let v = u + 0x10
		do {
			const w = ld64(v - 8)
			if (rc_release(w)) {
				n = Rc_drop_slow_125dd0(v - 8, n)
			}
			const x = ld64(v)
			if (rc_release(x)) {
				n = Rc_drop_slow_125e20(v, n)
			}
			v = v + 0x30
			t = t - 1
		} while (t != 0)
	}
	if (ld64(b) != 0) {
		n = fn_11e480(n)
	}
	const y = ld64(b + 0x50)
	if (rc_release(y)) {
		n = Rc_drop_slow_125dd0(b + 0x50, n)
	}
	const z = ld64(b + 0x58)
	ar = b + 0x58
	if (rc_release(z)) {
		return Rc_drop_slow_125e20(ar, n)
	}
	return n
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), p5 (points to it)
// types [heur]: p8: LamportsCell (every call passes one: fn_81db0)
function fn_82dd0(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64, p8: LamportsCell): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s68 = fp - 0x68, s90 = fp - 0x90, s98 = fp - 0x98, sc0 = fp - 0xc0, sd8 = fp - 0xd8, sf0 = fp - 0xf0, s118 = fp - 0x118, s120 = fp - 0x120, s148 = fp - 0x148, s150 = fp - 0x150, s160 = fp - 0x160, s178 = fp - 0x178, s188 = fp - 0x188, s190 = fp - 0x190, s1a8 = fp - 0x1a8, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210
	let l, n, r, ad, bq, br, bx, by, bz, ca, cb, cc, cd, ce, cf, cj, ck: u64
	let f: AccountInfo
	let g: AccountInfo
	B5: {
		f = d
		rent_get(s190)
		copy(s1a8, s188, 0x18)
		g = p5
		if (ld64(s190) != 0) {
			n = fn_13e628(s210, s1a8)
			r = 1
			l = ld64(s210 + 8)
			ad = ld64(s210)
		} else {
			ck = f
			const i: LamportsCell = p8
			let cg = p7
			let ch = p6
			copyr(s1c0, s1a8, 0x18)
			const h = fn_147a20(g)
			let ci = i
			const j = fn_1476d8(s1c0, i)
			if (h == 0) {
				const u: LamportsCell = g.lamports
				const y = g.key
				f = ck
				rc_inc(u)
				const v: DataCell = g.data
				rc_inc(v)
				const w: LamportsCell = f.lamports
				cb = g.executable
				cc = g.is_writable
				cd = g.is_signer
				ce = g.rent_epoch
				cf = g.owner
				ca = f.key
				rc_inc(w)
				const x: DataCell = f.data
				by = y
				bz = u
				cj = w
				rc_inc(x)
				const ac = f.owner
				const ab = f.rent_epoch
				const aa = f.is_signer
				const z = f.is_writable
				st8(s150 + 2, f.executable)
				st8(s150, aa, z)
				st64(s160, ac, ab)
				bx = x
				st64(s178, ca, cj, x)
				st64(s10, ch, cg)
				st64(s190, 0, 8, 0)
				memcpy(s148, c, 0x30)
				st64(sf0 + 8, s10)
				st8(sf0, cd, cc, cb)
				st64(s118, by, bz, v, cf, ce)
				st64(sf0 + 0x10, 1)
				n = system_program_create_account(s200, s190, j, ci, b)
				r = 0
				l = ld64(s200 + 8)
				ad = ld64(s200)
				if (ad == 2) {
					const ae: LamportsCell = g.lamports
					if (rc_release(ae)) {
						n = Rc_drop_slow_14df0(g + 8, n)
					}
					const af: DataCell = g.data
					if (rc_release(af)) {
						n = Rc_drop_slow_14df0(g + 0x10, n)
					}
					if (rc_release(cj)) {
						n = Rc_drop_slow_14df0(f + 8, n)
					}
					bq = f + 0x10
					br = a
					if (rc_release(bx)) {
						n = Rc_drop_slow_14df0(bq, n)
						st64(br + 8, ck)
						st64(br, 2)
						return n
					}
					st64(br + 8, ck)
					st64(br, 2)
					return n
				}
			} else {
				f = ck
				if (j > h) {
					const k: LamportsCell = c.lamports
					const am = c.key
					rc_inc(k)
					const ag: DataCell = c.data
					cj = sat_sub(j, h)
					rc_inc(ag)
					const ah: LamportsCell = g.lamports
					ca = g.key
					cb = c.executable
					cc = c.is_writable
					cd = c.is_signer
					ce = c.rent_epoch
					cf = c.owner
					rc_inc(ah)
					const ai: DataCell = g.data
					bz = ah
					rc_inc(ai)
					const aj: LamportsCell = f.lamports
					by = ag
					const al = f.key
					const bt = g.executable
					const bu = g.is_writable
					const bv = g.is_signer
					const bw = g.rent_epoch
					bx = g.owner
					rc_inc(aj)
					const ak: DataCell = f.data
					rc_inc(ak)
					const bs = f.owner
					const aq = f.rent_epoch
					const ap = f.is_signer
					const ao = f.is_writable
					const an = f.executable
					st8(s38, bv, bu, bt)
					st64(s60, ca, bz, ai, bx, bw)
					st8(s68, cd, cc, cb)
					st64(s90, am, k, by, cf, ce)
					st8(s98, ap, ao, an)
					st64(sc0, al, aj, ak, bs, aq)
					st64(s30, 8, 0)
					st64(sd8, 0, 8, 0)
					n = system_program_transfer(s1d0, sd8, cj)
					r = 1
					l = ld64(s1d0 + 8)
					ad = ld64(s1d0)
					if (ad != 2) {
						break B5
					}
				}
				const ar: LamportsCell = g.lamports
				const ax = g.key
				rc_inc(ar)
				const at: DataCell = g.data
				rc_inc(at)
				const au: LamportsCell = f.lamports
				cj = au
				cc = g.executable
				cd = g.is_writable
				ce = g.is_signer
				const aw = g.rent_epoch
				const ay = g.owner
				cf = f.key
				rc_inc(au)
				const av: DataCell = f.data
				by = aw
				bz = at
				ca = ax
				cb = ar
				rc_inc(av)
				const bd = f.owner
				const bc = f.rent_epoch
				const bb = f.is_signer
				const ba = f.is_writable
				const az = f.executable
				st64(s20, ch, cg)
				st64(s118, s20)
				ch = av
				st64(s148, cf, cj, av)
				st8(s150, ce, cd, cc)
				st64(s178, ca, cb, bz, ay, by)
				cb = az
				st8(s120 + 2, az)
				cc = ba
				st8(s120 + 1, ba)
				cd = bb
				st8(s120, bb)
				ce = bc
				st64(s148 + 0x20, bc)
				cg = bd
				st64(s148 + 0x18, bd)
				st64(s118 + 8, 1)
				st64(s190, 0, 8, 0)
				n = system_program_assign_13fb30(s1e0, s190, ci)
				r = 1
				l = ld64(s1e0 + 8)
				ad = ld64(s1e0)
				if (ad == 2) {
					const be: LamportsCell = g.lamports
					const bg = g.key
					rc_inc(be)
					bz = g + 0x10
					const bf: DataCell = g.data
					ci = bg
					rc_inc(bf)
					const bh = g.executable
					const bi = g.is_writable
					const bj = g.is_signer
					const bk = g.rent_epoch
					ca = g.owner
					rc_inc(cj)
					rc_inc(ch)
					st64(s118, s10)
					st8(s120, cd, cc, cb)
					st64(s148, cf, cj, ch, cg, ce)
					st8(s150, bj, bi, bh)
					st64(s178, ci, be, bf, ca, bk)
					copyr(s10, s20, 0x10)
					st64(s118 + 8, 1)
					st64(s190, 0, 8, 0)
					n = system_program_assign_13ff40(s1f0, s190, b)
					r = 1
					l = ld64(s1f0 + 8)
					ad = ld64(s1f0)
					if (ad == 2) {
						const bl: LamportsCell = g.lamports
						if (rc_release(bl)) {
							n = Rc_drop_slow_14df0(g + 8, n)
						}
						const bm = bz
						const bn = ld64(bz)
						if (rc_release(bn)) {
							n = Rc_drop_slow_14df0(bm, n)
						}
						br = a
						if (rc_release(cj)) {
							n = Rc_drop_slow_14df0(f + 8, n)
						}
						if (rc_release(ch)) {
							n = Rc_drop_slow_14df0(f + 0x10, n)
						}
						const bo: LamportsCell = c.lamports
						if (rc_release(bo)) {
							n = Rc_drop_slow_14df0(c + 8, n)
						}
						const bp: DataCell = c.data
						bq = c + 0x10
						if (!rc_release(bp)) {
							st64(br + 8, ck)
							st64(br, 2)
							return n
						}
						n = Rc_drop_slow_14df0(bq, n)
						st64(br + 8, ck)
						st64(br, 2)
						return n
					}
				}
			}
		}
	}
	ck = l
	const m: LamportsCell = g.lamports
	if (rc_release(m)) {
		n = Rc_drop_slow_14df0(g + 8, n)
	}
	const o: DataCell = g.data
	if (rc_release(o)) {
		n = Rc_drop_slow_14df0(g + 0x10, n)
	}
	const p: LamportsCell = f.lamports
	if (rc_release(p)) {
		n = Rc_drop_slow_14df0(f + 8, n)
	}
	const q: DataCell = f.data
	br = a
	if (rc_release(q)) {
		n = Rc_drop_slow_14df0(f + 0x10, n)
	}
	if (r == 0) {
		st64(br + 8, ck)
		st64(br, ad)
		return n
	}
	const s: LamportsCell = c.lamports
	if (rc_release(s)) {
		n = Rc_drop_slow_14df0(c + 8, n)
	}
	const t: DataCell = c.data
	bq = c + 0x10
	if (rc_release(t)) {
		n = Rc_drop_slow_14df0(bq, n)
		st64(br + 8, ck)
		st64(br, ad)
		return n
	}
	st64(br + 8, ck)
	st64(br, ad)
	return n
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), c (value), a (points to it)
function fn_100918(a: u64, b: u64, c: u64): u64 {
	const s20 = fp - 0x20, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sc8 = fp - 0xc8, sd0 = fp - 0xd0, sd8 = fp - 0xd8, se0 = fp - 0xe0, se8 = fp - 0xe8, sf0 = fp - 0xf0
	let o, r, s, ah, aq, bf: u64
	const p = ld64(b)
	const f = ld64(b + 8)
	st64(sc8, f)
	if (f == 0) {
		o = clz(p)
		r = 0x40 - o
	} else {
		const g = f | f >> 1
		const h = g | g >> 2
		const i = h | h >> 4
		const j = i | i >> 8
		const k = j | j >> 0x10
		const l = ~(k | k >> 0x20)
		const m = l - (l >> 1 & 0x5555555555555555)
		const n = (m & 0x3333333333333333) + (m >> 2 & 0x3333333333333333)
		o = n >> 4
		r = 0x80 - ((n + o & 0xf0f0f0f0f0f0f0f) * 0x101010101010101 >> 0x38)
	}
	const aa = ld64(c)
	const q = ld64(c + 8)
	if (q == 0) {
		o = aa != 0 ? 0x101010101010101 : o
		s = 0x40 - clz(aa)
		if (aa == 0) {
			st64(s50, 0x100160980, 1, 8, 0, 0)
			// fmt "division by zero"
			fn_14ec00(s50, 0x10015fe28, c, r, s)
		}
	} else {
		o = clz(q)
		s = 0x80 - o
	}
	if (s > r) {
		st64(a + 8, 0)
		st64(a, 0)
		copy(a + 0x10, b, 0x10)
		return o
	}
	st64(sd0, a)
	if (0x41 > s) {
		if (aa != 0) {
			const ab = ld64(sc8)
			const ac = ab / aa
			__udivti3(sb0, p, ab - ac * aa, aa, 0)
			const ad = ld64(sb0)
			o = __multi3_159030(sc0, ad, ld64(sb0 + 8), aa, 0)
			const ae = ld64(sd0)
			st64(ae + 8, ac)
			st64(ae, ad)
			st64(ae + 0x10, p - ld64(sc0))
			st64(ae + 0x18, 0)
			return o
		}
		fn_1548e8(0x10015fe28, b, c, r, s)
	}
	let u = s - 1 >> 6
	let t = r - 1 >> 6
	if (u > t) {
		fn_154788(0x10015fe28, b, c, t, u)
	}
	copyr(s20, c, 0x10)
	const v = s20 + (u << 3)
	const w = ld64(v)
	let x = clz(w)
	const af = ld64(s20 + 8)
	const y = ld64(s20)
	st64(s50, 0, 0)
	let z = x & 0x3f
	st64(s50 + ((w == 0) << 3), y << (z & 0x3f))
	if (w != 0) {
		const ag = af << (z & 0x3f)
		st64(s50 + 8, ag)
		if (z != 0) {
			ah = ag + (y >> (-x & 0x3f))
			if (ag > ah) {
				fn_154730(0x10015fe28, b, x, ah, z)
			}
			st64(s50 + 8, ah)
		}
		copy(s20, s50, 0x10)
		const ai = 0x40 - x
		const aj = ai >> 6 << 3
		let am = 0
		st64(sd8, ld64(b + aj) >> (ai & 0x3f))
		if (x != 0) {
			am = ld64(aj + b + 8) >> (ai & 0x3f)
			if ((ai & 0x3f) != 0) {
				ah = x
				const ak = ld64(sc8) << (z & 0x3f)
				z = ld64(sd8)
				b = z + ak
				x = z > b
				if (x != 0) {
					fn_154730(0x10015fe28, b, x, ah, z)
				}
				st64(sd8, b)
				x = ah
			}
		}
		st64(sf0, x)
		const al = p << (x & 0x3f)
		let ap = -1
		st64(se8, ld64(s20 + 8))
		st64(sc8, ld64(s20))
		const an = ld64(v)
		st64(se0, am)
		if (an > am) {
			const ao = ld64(sd8)
			__udivti3(s60, ao, ld64(se0), an, 0)
			ap = ld64(s60)
			__multi3_159030(s70, ap, ld64(s60 + 8), an, 0)
			let ar = ao - ld64(s70)
			do {
				__multi3_159030(s80, ap, 0, ld64(sc8), 0)
				t = undef
				u = undef
				let at = al >= ld64(s80)
				c = ld64(s80 + 8)
				b = ar > c
				at = ar != c ? b : at
				if ((at & 1) != 0) {
					break
				}
				if (ap == 0) {
					fn_154788(0x10015fe28, b, c, t, u)
				}
				aq = ar > ar + an
				ap = ap - 1
				ar = ar + an
			} while ((aq & 1) == 0)
		}
		__multi3_159030(s90, ap, 0, ld64(sc8), 0)
		const au = ld64(se8)
		__multi3_159030(sa0, ap, 0, au, 0)
		const av = ld64(s90 + 8)
		u = av + ld64(sa0)
		const aw = ld64(s90)
		const ax = u + (aw > al)
		const ay = ld64(sd8)
		t = av > u
		o = u > ax | ax > ay
		c = ld64(sa0 + 8) + t + o
		let bb = ay - ax
		let az = al - aw
		b = ld64(se0)
		let bd = b - c
		if (c > b) {
			if (ap == 0) {
				fn_154788(0x10015fe28, b, c, t, u)
			}
			const ba = ld64(sc8)
			o = au + (az > az + ba)
			const bc = bb + o
			bd = bd + (au > o | bb > bc)
			ap = ap - 1
			bb = bc
			az = az + ba
		}
		const be = ld64(sf0)
		const bg = bb >> (be & 0x3f)
		const bh = az >> (be & 0x3f)
		if (be != 0) {
			bf = ld64(sd0)
			st64(bf + 0x18, (bd << (-be & 0x3f)) | bg)
			st64(bf + 0x10, (bb << (-be & 0x3f)) | bh)
			st64(bf, ap, 0)
			return o
		}
		bf = ld64(sd0)
		st64(bf + 0x18, bg)
		st64(bf + 0x10, bh)
		st64(bf, ap, 0)
		return o
	}
	fn_154890(0x10015fe28, b, x, w, z)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14ce00(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14d4b8(a, b, c, d, e)
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

function fn_1111c0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20
	const f = ld64(b + 8)
	if (8 > f) {
		fn_153150(8, f, 0x100160bb0, d, e)
	}
	if (f != 8 && f - 8 >= 0x21) {
		const g = ld64(b)
		const n = ld8(g + 8)
		const h = ld64(g + 0xf)
		st8(s20 + 0x18, ld8(g + 0x17))
		st64(s20 + 0x10, h)
		if (f - 0x29 >= 8 && (f - 0x31 >= 8 && (f - 0x39 >= 8 && f - 0x41 >= 0x28))) {
			const w = ld64(s20 + 0x11)
			const i = ld64(g + 0x29)
			const s = ld64(g + 0x31)
			const v = ld64(g + 0x61)
			const u = ld64(g + 0x59)
			const t = ld64(g + 0x51)
			const m = ld64(g + 0x49)
			const l = ld64(g + 0x41)
			const k = ld64(g + 0x39)
			st16(a + 0x4c, ld16(g + 0xd))
			st32(a + 0x48, ld32(g + 9))
			copy(a + 0x57, g + 0x18, 0x10)
			st8(a + 0x67, ld8(g + 0x28))
			st64(a + 8, i, s, k, l, m, t, u, v)
			st64(a + 0x4f, w)
			st8(a + 0x68, n)
			st8(a + 0x4e, h)
			st64(a, 0)
			return s
		}
	}
	const o = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	let j = anchor_error_from(s20, 0xbbb /* anchor::AccountDidNotDeserialize */)
	const q = ld64(s20 + 8)
	const r = ld64(s20)
	if (2 > (o & 3) - 2) {
		st64(a + 0x10, q)
		st64(a + 8, r)
		st64(a, 1)
		return j
	}
	if ((o & 3) == 0) {
		st64(a + 0x10, q)
		st64(a + 8, r)
		st64(a, 1)
		return j
	}
	const p = ld64(ld64(o + 7))
	if (p == 0) {
		st64(a + 0x10, q)
		st64(a + 8, r)
		st64(a, 1)
		return j
	}
	j = callx(p, ld64(o - 1), p)
	st64(a + 0x10, q)
	st64(a + 8, r)
	st64(a, 1)
	return j
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value)
function fn_1371d0(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s48 = fp - 0x48, s50 = fp - 0x50
	let h, i: u64
	if ((memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	const f = __rust_alloc(0x22, 1)
	if (f == 0) {
		alloc_handle_alloc_error(1, 0x22)
	}
	st64(f + 0x18, ld64(c + 0x18))
	st64(f + 0x10, ld64(c + 0x10))
	st64(f + 8, ld64(c + 8))
	st64(f, ld64(c))
	st16(f + 0x20, 0)
	if (0 > (e as i64)) {
		raw_vec_handle_error(0, e << 1, 0x100160d78, h, i)
	}
	if ((e << 1) > 0x7ffffffffffffffe) {
		raw_vec_handle_error(0, e << 1, 0x100160d78, h, i)
	}
	let g = 2
	let j = 0
	if ((e << 1) != 0) {
		g = __rust_alloc(e << 1, 2)
		j = e
		if (g == 0) {
			raw_vec_handle_error(2, e << 1, 0x100160d78, h, i)
		}
	}
	memcpy(g, d, e << 1)
	st64(s48, j, g, e)
	st32(s50, 0x15)
	const k = fn_1334b0(a + 0x18, s50)
	st64(a + 0x48, ld64(b + 0x18))
	st64(a + 0x40, ld64(b + 0x10))
	st64(a + 0x38, ld64(b + 8))
	st64(a + 0x30, ld64(b))
	st64(a + 8, f, 1)
	st64(a, 1)
	if (j != 0) {
		fn_11e480(k)
	}
}

function fn_142568(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1000 = fp - 0x1000
	st64(s1000, 8, 0)
	return invoke_signed(a, b, c, d, fp)
}

function fn_11e480(r0: u64): u64 {
	return r0
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_154890(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x100162310, 1, 8, 0, 0)
	// fmt "attempt to shift left with overflow"
	fn_14ec00(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_1548e8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x100162588, 1, 8, 0, 0)
	// fmt "attempt to divide by zero"
	fn_14ec00(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_154730(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622d0, 1, 8, 0, 0)
	// fmt "attempt to add with overflow"
	fn_14ec00(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), e (value)
function fn_153150(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155a68(a, b, c, d, e)
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

function fn_153160(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155bf8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14d4b8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	custom_panic(a, b, c, d, e)
	abort()
}

function fn_155738(a: u64, b: u64): u64 {
	return imp__fmt_155760(ld64(a), 1, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
function fn_158340(a: u64, b: u64): u64 {
	return mul_mul(a, b)
}

function fn_159078(a: u64, b: u64): u64 {
	return cmp___gedf2(a, b)
}

function fn_156088(a: u64, b: u64): u64 {
	return cmp___gedf2(a, b)
}

function fn_1547e0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622f0, 1, 8, 0, 0)
	// fmt "attempt to multiply with overflow"
	fn_14ec00(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (value), e (value)
function fn_155a68(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	st64(s60, a, b, 0x1001625f8)
	st64(s50 + 0x10, s20)
	st64(s20, s60, fn_155738, s58, fn_155738)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "range start index {} out of range for slice of length {}" {} = a [fn_155738], {} = b [fn_155738]
	fn_14ec00(s50, c, c, d, e)
}

function fn_155bf8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	st64(s60, a, b, 0x100162638)
	st64(s50 + 0x10, s20)
	st64(s20, s60, fn_155738, s58, fn_155738)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "slice index starts at {} but ends at {}" {} = a [fn_155738], {} = b [fn_155738]
	fn_14ec00(s50, c, c, d, e)
}
