// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction set_reward_params: handler + 45 reachable functions
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
interface SetRewardParamsArgs extends sized<0x21> { // arguments of instruction set_reward_params (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	reward_index:             at<0x00, u8>
	emissions_per_second_x64: at<0x01, u128>
	open_time:                at<0x11, u64>
	end_time:                 at<0x19, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function fn_11e0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function fn_12d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function fn_1730(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a Display implementation returned an err…"
declare function InterfaceAccount_try_from_unchecked(a: u64, b: u64): u64 // lib anchor_lang::accounts::interface_account::InterfaceAccount<T>::try_from_unchecked
declare function InterfaceAccount_try_from(a: u64, b: u64): u64 // lib anchor_lang::accounts::interface_account::InterfaceAccount<T>::try_from
declare function fn_e948(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib uses Mint_unpack_from_slice_137968, raw_vec_handle_error, memset2, memcmp
declare function AccountInfo_clone_f338(a: u64, b: u64): u64 // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function ptr_drop_in_place_fcd8(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<solana_account_info::AccountInfo>
declare function Rc_drop_slow_14df0(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function try_accounts_17a30(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_184d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_18cf0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp, Error_with_pubkeys
declare function try_accounts_19190(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_103fe8(a: u64, b: u64, c: u64): u64 // lib uses __multi3_159030
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function token_transfer(a: u64, b: u64, c: u64): u64 // lib anchor_spl::token::transfer
declare function token_2022_transfer_checked(a: u64, b: u64, c: u64, d: u64): u64 // lib anchor_spl::token_2022::transfer_checked
declare function fn_132590(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses __multi3_159030, __udivti3
declare function fn_132718(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses __multi3_159030, __udivti3
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
declare function solana_pubkey_write_as_base58(a: u64, b: u64): u64 // lib solana_pubkey::write_as_base58
declare function de_unexpected_eof_to_unexpected_length_of_input(a: u64): u64 // lib borsh::de::unexpected_eof_to_unexpected_length_of_input
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fn_150868(a: u64, b: u64): u64 // lib
declare function fmt_write(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::write
declare function imp_fmt(a: u64, b: u64): u64 // lib core::fmt::num::imp::<impl core::fmt::Display for i32>::fmt
declare function imp__fmt_155760(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u64>::_fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function __udivti3(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __udivti3
declare function __multi3_159030(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __multi3

// instruction handler: set_reward_params (discriminator sha256("global:set_reward_params")[..8] = 0x89d3c9204ba73470)
// accounts [idl]: 0 authority [signer], 1 amm_config, 2 pool_state [mut], 3 operation_state [pda], 4 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 5 token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb]
// args [idl]: reward_index: u8, emissions_per_second_x64: u128, open_time: u64, end_time: u64
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, reward_index, open_time, end_time
function ix_set_reward_params(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s88 = fp - 0x88, s90 = fp - 0x90, sa0 = fp - 0xa0, s128 = fp - 0x128, s140 = fp - 0x140, s150 = fp - 0x150, s151 = fp - 0x151, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s1000 = fp - 0x1000
	let k, o: u64
	const h = sol_log("Instruction: SetRewardParams", 0x1c)
	const f = ix_args_len
	if (f != 0 && (f >= 0x11 && (f - 0x11 >= 8 && f - 0x19 >= 8))) {
		const args: SetRewardParamsArgs = ix_args
		const reward_index = args.reward_index
		const r = ld64(args.emissions_per_second_x64 + 8)
		const s = ld64(args.emissions_per_second_x64)
		const open_time = args.open_time
		const end_time = args.end_time
		st8(s151, 0xff)
		st64(s150, accounts, accounts_len)
		st64(s1000 + 8, s151)
		o = accounts_set_reward_params(sa0, program_id, s150, undef, fp, h)
		const j = ld64(s90)
		k = ld64(sa0 + 8)
		const i = ld64(sa0)
		if (i == 0) {
			st64(a + 8, j)
			st64(a, k)
			return o
		}
		const l = memcpy(s128, s88, 0x88)
		st64(s140, i, k, j)
		st8(s88 + 8, ld8(s151))
		copyr(s90, s150, 0x10)
		st64(sa0, program_id, s140)
		st64(s1000, r, open_time, end_time)
		o = fn_45880(s168, sa0, reward_index, s, fp, l)
		k = ld64(s168)
		if (k == 2) {
			o = fn_c03e8(s178, s140, program_id)
			k = ld64(s178)
			st64(a + 8, ld64(s178 + 8))
			st64(a, k)
			return o
		}
		st64(a + 8, ld64(s168 + 8))
		st64(a, k)
		return o
	}
	const m = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (m & 3) - 2) {
		o = anchor_error_from(s188, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s188)
		st64(a + 8, ld64(s188 + 8))
		st64(a, k)
		return o
	}
	if ((m & 3) == 0) {
		o = anchor_error_from(s188, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s188)
		st64(a + 8, ld64(s188 + 8))
		st64(a, k)
		return o
	}
	const n = ld64(ld64(m + 7))
	if (n == 0) {
		o = anchor_error_from(s188, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s188)
		st64(a + 8, ld64(s188 + 8))
		st64(a, k)
		return o
	}
	callx(n, ld64(m - 1), n)
	o = anchor_error_from(s188, 0x66 /* anchor::InstructionDidNotDeserialize */)
	k = ld64(s188)
	st64(a + 8, ld64(s188 + 8))
	st64(a, k)
	return o
}

// Anchor Accounts::try_accounts of instruction set_reward_params (called by ix_set_reward_params; name [str]: from the handler's "Instruction: …" log; was fn_bf170)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_program_2022, operation_state (ConstraintSeeds), pool_state (ConstraintMut, ConstraintRaw), amm_config (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: pool_state [idl]
function accounts_set_reward_params(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s30 = fp - 0x30, s50 = fp - 0x50, s70 = fp - 0x70, s90 = fp - 0x90, sf0 = fp - 0xf0, s148 = fp - 0x148, s150 = fp - 0x150, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s238 = fp - 0x238, s240 = fp - 0x240, s248 = fp - 0x248, s250 = fp - 0x250, s258 = fp - 0x258
	let p, z: u64
	st64(s238 + 0x18, b)
	let l = try_accounts_17a30(s168, c, c, d, e, r0)
	const i = ld64(s168 + 8)
	let f = ld64(s168)
	if (f == 2) {
		st64(s238 + 0x10, ld64(e - 0xff8))
		l = try_accounts_184d8(s168, c)
		const r = ld64(s168 + 0x10)
		let k = ld64(s168 + 8)
		const j = ld64(s168)
		if (j == 0) {
			const o = ld64(0x300000000 /* heap bump-allocator cursor */)
			p = 0xa > o
			const q = o != 0 ? p != 0 ? 0 : o - 0xa : 0x300007ff6
			if ((k & 1) != 0) {
				if (0x300000008 > q) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, p, k)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, q)
				st64(q, 0x666e6f635f6d6d61)
				st16(q + 8, 0x6769)
				void ld64(r)
			} else {
				if (0x300000008 > q) {
					raw_vec_handle_error(1, 0xa, 0x10015f8f8, p, k)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, q)
				st64(q, 0x666e6f635f6d6d61)
				st16(q + 8, 0x6769)
				void ld64(r)
			}
			st64(r + 0x10, q, 0xa)
			st64(r + 8, 0xa)
			st64(r, 1)
			st64(a + 0x10, r)
			st64(a + 8, k)
			st64(a, 0)
			return l
		}
		st64(s238, k, j)
		memcpy(sf0, s150, 0x60)
		fn_11e0(s168, c)
		l = ld64(s168 + 8)
		f = ld64(s168)
		if (f == 2) {
			st64(s240, l)
			fn_12d8(s168, c)
			l = ld64(s168 + 8)
			f = ld64(s168)
			if (f == 2) {
				st64(s248, l)
				try_accounts_19190(s168, c)
				l = ld64(s168 + 8)
				f = ld64(s168)
				if (f == 2) {
					st64(s250, l)
					l = fn_18cf0(s168, c)
					let x = ld64(s168 + 8)
					const w = ld64(s168)
					if (w != 2) {
						l = fn_4130(s178, w, x, "token_program_2022", 0x12)
						x = ld64(s178 + 8)
						f = ld64(s178)
						z = ld64(s240)
						if (f != 2) {
							st64(a + 0x10, x)
							st64(a + 8, f)
							st64(a, 0)
							return l
						}
					} else {
						z = ld64(s240)
					}
					const y = ld64(ld64(s238 + 8))
					copyr(s90, y, 0x20)
					l = fn_4dc0(s168, z, l)
					const aa = ld64(s168 + 0x10)
					const ab = ld64(s168 + 8)
					if (ld64(s168) != 0) {
						st64(a + 0x10, aa)
						st64(a + 8, ab)
						st64(a, 0)
						return l
					}
					copyr(s70, ab + 1, 0x20)
					st64(aa, ld64(aa) - 1)
					const ac = memcmp(s90, s70, 0x20)
					if ((ac as u32) == 0) {
						const pool_state: AccountInfo = ld64(s240)
						if (pool_state.is_writable != 0) {
							l = fn_4dc0(s168, pool_state, ac as u32)
							const ah = ld64(s168 + 0x10)
							f = ld64(s168 + 8)
							if (ld64(s168) != 0) {
								st64(a + 0x10, ah)
								st64(a + 8, f)
								st64(a, 0)
								return l
							}
							copyr(s168, s90, 0x20)
							st64(s258, ah)
							const aj = memcmp(f + 1, s168, 0x20)
							const ai = ld64(s258)
							st64(ai, ld64(ai) - 1)
							if ((aj as u32) == 0) {
								st64(s30, 0x10015b1ad, 9)
								// PDA find_program_address(["operation"], program *(ld64(s238 + 0x18)))
								Pubkey_find_program_address(s168, s30, 1, ld64(s238 + 0x18))
								copyr(s50, s168, 0x20)
								st8(ld64(s238 + 0x10), ld8(s148))
								const ak = ld64(ld64(s248))
								copyr(s20, ak, 0x20)
								if ((memcmp(s20, s50, 0x20) as u32) != 0) {
									anchor_error_from(s1f8, 0x7d6 /* anchor::ConstraintSeeds */)
									const an = fn_4130(s208, ld64(s1f8), ld64(s1f8 + 8), "operation_state", 0xf)
									const am = ld64(s208 + 8)
									const al = ld64(s208)
									copyr(s168, s20, 0x20)
									copy(s148, s50, 0x20)
									l = Error_with_pubkeys(s218, al, am, s168, an)
									f = ld64(s218)
									st64(a + 0x10, ld64(s218 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return l
								}
								l = memcpy(a + 0x20, sf0, 0x60)
								st64(a + 0x98, x)
								st64(a + 0x90, ld64(s250))
								st64(a + 0x88, ld64(s248))
								st64(a + 0x80, ld64(s240))
								st64(a + 0x18, r)
								st64(a + 0x10, ld64(s238))
								st64(a + 8, ld64(s238 + 8))
								st64(a, i)
								return l
							}
							anchor_error_from(s1d8, 0x7d3 /* anchor::ConstraintRaw */)
							l = fn_4130(s1e8, ld64(s1d8), ld64(s1d8 + 8), "pool_state", 0xa)
							f = ld64(s1e8)
							st64(a + 0x10, ld64(s1e8 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return l
						}
						anchor_error_from(s1b8, 0x7d0 /* anchor::ConstraintMut */)
						l = fn_4130(s1c8, ld64(s1b8), ld64(s1b8 + 8), "pool_state", 0xa)
						f = ld64(s1c8)
						st64(a + 0x10, ld64(s1c8 + 8))
						st64(a + 8, f)
						st64(a, 0)
						return l
					}
					anchor_error_from(s188, 0x7dc /* anchor::ConstraintAddress */)
					const af = fn_4130(s198, ld64(s188), ld64(s188 + 8), 0x10015af4d /* "amm_config" */, 0xa)
					const ae = ld64(s198 + 8)
					const ad = ld64(s198)
					copy(s168, s90, 0x40)
					l = Error_with_pubkeys(s1a8, ad, ae, s168, af)
					f = ld64(s1a8)
					st64(a + 0x10, ld64(s1a8 + 8))
					st64(a + 8, f)
					st64(a, 0)
					return l
				}
				const u = ld64(0x300000000 /* heap bump-allocator cursor */)
				const v = u != 0 ? sat_sub(u, 0xd) : 0x300007ff3
				if ((f & 1) != 0) {
					if (0x300000008 > v) {
						raw_vec_handle_error(1, 0xd, 0x10015f8f8, sat_sub(u, 0xd), 0xd > u)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, v)
					st64(v + 5, 0x6d6172676f72705f)
					st64(v, 0x72705f6e656b6f74)
					void ld64(l)
				} else {
					if (0x300000008 > v) {
						raw_vec_handle_error(1, 0xd, 0x10015f8f8, sat_sub(u, 0xd), 0xd > u)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, v)
					st64(v + 5, 0x6d6172676f72705f)
					st64(v, 0x72705f6e656b6f74)
					void ld64(l)
				}
				st64(l + 0x10, v, 0xd)
				st64(l + 8, 0xd)
				st64(l, 1)
				st64(a + 0x10, l)
				st64(a + 8, f)
				st64(a, 0)
				return l
			}
			const m = ld64(0x300000000 /* heap bump-allocator cursor */)
			const n = m != 0 ? sat_sub(m, 0xf) : 0x300007ff1
			if ((f & 1) != 0) {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0xf, 0x10015f8f8, sat_sub(m, 0xf), 0xf > m)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 7, 0x65746174735f6e6f)
				st64(n, 0x6f6974617265706f)
				void ld64(l)
			} else {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0xf, 0x10015f8f8, sat_sub(m, 0xf), 0xf > m)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 7, 0x65746174735f6e6f)
				st64(n, 0x6f6974617265706f)
				void ld64(l)
			}
			st64(l + 0x10, n, 0xf)
			st64(l + 8, 0xf)
			st64(l, 1)
			st64(a + 0x10, l)
			st64(a + 8, f)
			st64(a, 0)
			return l
		}
		const s = ld64(0x300000000 /* heap bump-allocator cursor */)
		k = 0xa > s
		p = k != 0 ? 0 : s - 0xa
		const t = s != 0 ? p : 0x300007ff6
		if ((f & 1) != 0) {
			if (0x300000008 > t) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, p, k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, t)
			st64(t, 0x6174735f6c6f6f70)
			st16(t + 8, 0x6574)
			void ld64(l)
		} else {
			if (0x300000008 > t) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, p, k)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, t)
			st64(t, 0x6174735f6c6f6f70)
			st16(t + 8, 0x6574)
			void ld64(l)
		}
		st64(l + 0x10, t, 0xa)
		st64(l + 8, 0xa)
		st64(l, 1)
		st64(a + 0x10, l)
		st64(a + 8, f)
		st64(a, 0)
		return l
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 9) : 0x300007ff7
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(g, 9), 9 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x7469726f68747561)
		st8(h + 8, 0x79)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 9, 0x10015f8f8, sat_sub(g, 9), 9 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x7469726f68747561)
		st8(h + 8, 0x79)
		void ld64(i)
	}
	st64(i + 0x10, h, 9)
	st64(i + 8, 9)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value)
function fn_45880(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s70 = fp - 0x70, s88 = fp - 0x88, sa8 = fp - 0xa8, se8 = fp - 0xe8, s108 = fp - 0x108, s190 = fp - 0x190, s1a8 = fp - 0x1a8, s1cc = fp - 0x1cc, s258 = fp - 0x258, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s2a0 = fp - 0x2a0, s2c4 = fp - 0x2c4, s330 = fp - 0x330, s350 = fp - 0x350, s360 = fp - 0x360, s368 = fp - 0x368, s378 = fp - 0x378, s3c8 = fp - 0x3c8, s3e8 = fp - 0x3e8, s421 = fp - 0x421, s574 = fp - 0x574, s5c8 = fp - 0x5c8, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s608 = fp - 0x608, s610 = fp - 0x610, s618 = fp - 0x618, s621 = fp - 0x621, s628 = fp - 0x628, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s668 = fp - 0x668, s678 = fp - 0x678, s688 = fp - 0x688, s698 = fp - 0x698, s6a8 = fp - 0x6a8, s6b8 = fp - 0x6b8, s6c8 = fp - 0x6c8, s6d8 = fp - 0x6d8, s6e8 = fp - 0x6e8, s6f8 = fp - 0x6f8, s708 = fp - 0x708, s718 = fp - 0x718, s728 = fp - 0x728, s738 = fp - 0x738, s748 = fp - 0x748, s758 = fp - 0x758, s768 = fp - 0x768, s778 = fp - 0x778, s788 = fp - 0x788, s798 = fp - 0x798, s7a8 = fp - 0x7a8, s7b8 = fp - 0x7b8, s7c8 = fp - 0x7c8, s7f8 = fp - 0x7f8, s800 = fp - 0x800, s808 = fp - 0x808, s810 = fp - 0x810, s818 = fp - 0x818, s820 = fp - 0x820, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let m, o, am, an, ao, bf, bg, bh, bi, bj, bk: u64
	st64(s7f8 + 0x28, a)
	if (3 > (c as u8)) {
		const f = ld64(e - 0xff0)
		const g = ld64(e - 0xff8)
		if (f > g) {
			const h = ld64(e - 0x1000)
			if ((d | h) == 0) {
				ErrorCode_name(s40, 0x100159900, h, d, e)
				st64(s378, 0, 1, 0)
				st64(s260, s378, 0x10015f818)
				st8(s258 + 0x10, 3)
				st64(s258 + 8, 0x20)
				st64(s270, 0)
				st64(s280, 0)
				if (ErrorCode_fmt(0x100159900, s280) != 0) {
					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
				}
				copyr(s5f0, s378, 0x18)
				copy(s608, s40, 0x18)
				st64(s621 + 1, 0x10015a0e6)
				st32(s5c8 + 0x38, 0x9c9 /* anchor::RequireGtViolated */)
				st8(s5e0 + 8, 2)
				st32(s610, 0x35)
				st64(s618, 0x32)
				st64(s628, 0)
				fn_13e5a0(s7b8, s628)
				bk = fn_2150(s7c8, ld64(s7b8), ld64(s7b8 + 8), 0, 0)
				m = ld64(s7c8)
				bj = ld64(s7f8 + 0x28)
				st64(bj + 8, ld64(s7c8 + 8))
				st64(bj, m)
				return bk
			}
			st64(s7f8, h, f)
			st64(s7f8 + 0x18, g)
			st64(s800, b)
			const i = ld64(b + 8)
			st64(s7f8 + 0x20, i)
			bk = fn_4808(s628, ld64(i + 0x88), r0)
			const j = ld64(s618)
			m = ld64(s621 + 1)
			let ad = j
			if (ld64(s628) != 0) {
				bj = ld64(s7f8 + 0x28)
				st64(bj + 8, ad)
				st64(bj, m)
				return bk
			}
			st64(s7f8 + 0x10, j)
			const k = ld64(0x300000000 /* heap bump-allocator cursor */)
			const l = k != 0 ? sat_sub(k, 0x140) : 0x300007ec0
			if (l > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, l)
				memcpy(l, m + 1, 0x140)
				const n = ld64(ld64(ld64(s7f8 + 0x20)))
				copyr(s280, n, 0x20)
				st64(s628, 0, 0, 0, 0)
				if ((memcmp(s280, s628, 0x20) as u32) == 0) {
					ErrorCode_name(s40, 0x100159830)
					st64(s378, 0, 1, 0)
					st64(s260, s378, 0x10015f818)
					st8(s258 + 0x10, 3)
					st64(s258 + 8, 0x20)
					st64(s270, 0)
					st64(s280, 0)
					if (ErrorCode_fmt(0x100159830, s280) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
					}
					B82: {
						copyr(s5f0, s378, 0x18)
						copy(s608, s40, 0x18)
						st64(s621 + 1, 0x10015a0e6)
						st32(s5c8 + 0x38, 0x9c7 /* anchor::RequireNeqViolated */)
						st8(s5e0 + 8, 2)
						st32(s610, 0x38)
						st64(s618, 0x32)
						st64(s628, 0)
						fn_13e5a0(s7a8, s628)
						ad = ld64(s7a8 + 8)
						m = ld64(s7a8)
						const x = ld64(ld64(ld64(s7f8 + 0x20)))
						const aa = ld64(x)
						const z = ld64(x + 8)
						const y = ld64(x + 0x10)
						st64(s270 + 8, ld64(x + 0x18))
						st64(s280, aa, z, y)
						st64(s260, 0, 0, 0, 0)
						if ((m & 1) != 0) {
							st64(s378, 0, 1, 0)
							st64(s608, s378, 0x10015f818)
							st8(s5f0, 3)
							st64(s600 + 8, 0x20)
							st64(s618, 0)
							st64(s628, 0)
							if (fn_14b198(s280, s628) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
							}
							copyr(s70, s378, 0x18)
							st64(s40, 0, 1, 0)
							st64(s608, s40, 0x10015f818)
							st8(s5f0, 3)
							st64(s600 + 8, 0x20)
							st64(s618, 0)
							st64(s628, 0)
							if (fn_14b198(s260, s628) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
							}
							copyr(s360, s40, 0x18)
							copy(s378, s70, 0x18)
							memcpy(s621, s378, 0x30)
							bh = s628
							bg = 0x39
							bf = ad + 0x38
							if (ld8(ad + 0x38) != 0) {
								break B82
							}
						} else {
							st64(s378, 0, 1, 0)
							st64(s608, s378, 0x10015f818)
							st8(s5f0, 3)
							st64(s600 + 8, 0x20)
							st64(s618, 0)
							st64(s628, 0)
							if (fn_14b198(s280, s628) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
							}
							copyr(s70, s378, 0x18)
							st64(s40, 0, 1, 0)
							st64(s608, s40, 0x10015f818)
							st8(s5f0, 3)
							st64(s600 + 8, 0x20)
							st64(s618, 0)
							st64(s628, 0)
							if (fn_14b198(s260, s628) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
							}
							copyr(s360, s40, 0x18)
							copy(s378, s70, 0x18)
							memcpy(s621, s378, 0x30)
							bh = s628
							bg = 0x51
							bf = ad + 0x50
							if (ld8(ad + 0x50) != 0) {
								break B82
							}
						}
						bh = s628
					}
					st8(bf, 0)
					bk = memcpy(ad + bg, bh, 0x37)
					bi = ld64(s7f8 + 0x10)
					st64(bi, ld64(bi) - 1)
					bj = ld64(s7f8 + 0x28)
					st64(bj + 8, ad)
					st64(bj, m)
					return bk
				}
				copyr(s628, n, 0x20)
				if ((memcmp(l, s628, 0x20) as u32) != 0 && ((memcmp(l + 0x20, s628, 0x20) as u32) != 0 && ((memcmp(l + 0x40, s628, 0x20) as u32) != 0 && ((memcmp(l + 0x60, s628, 0x20) as u32) != 0 && ((memcmp(l + 0x80, s628, 0x20) as u32) != 0 && ((memcmp(l + 0xa0, s628, 0x20) as u32) != 0 && ((memcmp(l + 0xc0, s628, 0x20) as u32) != 0 && ((memcmp(l + 0xe0, s628, 0x20) as u32) != 0 && ((memcmp(l + 0x100, s628, 0x20) as u32) != 0 && (memcmp(l + 0x120, s628, 0x20) as u32) != 0))))))))) {
					copyr(s628, n, 0x20)
					o = (memcmp(s628, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) == 0
				} else {
					o = 1
				}
				const q = ld64(s7f8 + 0x18)
				const r = clock_get(s628)
				if (ld64(s628) != 0) {
					const ac = ld64(s621 + 1)
					const ab = ld64(s618)
					st64(s618, ld64(s610))
					st64(s628, ac, ab)
					bk = fn_13e628(s798, s628)
					ad = ld64(s798 + 8)
					m = ld64(s798)
					bi = ld64(s7f8 + 0x10)
					st64(bi, ld64(bi) - 1)
					bj = ld64(s7f8 + 0x28)
					st64(bj + 8, ad)
					st64(bj, m)
					return bk
				}
				st64(s808, o)
				const p = ld64(s600)
				if ((p as i64) > -1) {
					if (q > p) {
						st64(s810, p)
						bk = fn_53e8(s628, ld64(ld64(s7f8 + 0x20) + 0x80), undef, undef, undef, r)
						const s = ld64(s618)
						const t = ld64(s621 + 1)
						ad = s
						m = t
						bi = ld64(s7f8 + 0x10)
						if (ld64(s628) != 0) {
							st64(bi, ld64(bi) - 1)
							bj = ld64(s7f8 + 0x28)
							st64(bj + 8, ad)
							st64(bj, m)
							return bk
						}
						B46: {
							st64(s818, s)
							if ((ld64(s808) & 1) == 0) {
								const u = ld64(ld64(ld64(s7f8 + 0x20)))
								copyr(s628, u, 0x20)
								const v = t + (c as u8) * 0xa9 + 0x1fe
								if ((memcmp(s628, v, 0x20) as u32) != 0) {
									ErrorCode_name(s40, 0x100159874, undef, t)
									st64(s378, 0, 1, 0)
									st64(s260, s378, 0x10015f818)
									st8(s258 + 0x10, 3)
									st64(s258 + 8, 0x20)
									st64(s270, 0)
									st64(s280, 0)
									if (ErrorCode_fmt(0x100159874, s280) != 0) {
										fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
									}
									copyr(s5f0, s378, 0x18)
									copy(s608, s40, 0x18)
									st64(s621 + 1, 0x10015a0e6)
									st32(s5c8 + 0x38, 0x9c6 /* anchor::RequireKeysEqViolated */)
									st8(s5e0 + 8, 2)
									st32(s610, 0x43)
									st64(s618, 0x32)
									st64(s628, 0)
									const ah = fn_13e5a0(s698, s628)
									const ag = ld64(s698 + 8)
									const af = ld64(s698)
									const ae = ld64(ld64(ld64(s7f8 + 0x20)))
									copyr(s628, ae, 0x20)
									copy(s608, v, 0x20)
									bk = Error_with_pubkeys(s6a8, af, ag, s628, ah)
									ad = ld64(s6a8 + 8)
									m = ld64(s6a8)
									break B46
								}
							}
							st64(s820, t)
							bk = fn_6c2a0(s628, t, ld64(s810))
							ad = ld64(s618)
							m = ld64(s621 + 1)
							if (ld8(s628) == 0) {
								const w = ld64(s820) + (c as u8) * 0xa9 + 0x185
								memcpy(s421, w, 0xa9)
								st64(s628, 0, 0, 0, 0)
								if ((memcmp(s3e8, s628, 0x20) as u32) != 0) {
									if ((ld64(s808) & 1) != 0) {
										st64(sff8 + 8, ld64(s7f8 + 8))
										st64(sff8, ld64(s7f8 + 0x18))
										st64(s1000, ld64(s7f8))
										bk = fn_494d0(s628, s421, ld64(s810), d, ld64(s1000), ld64(sff8), ld64(sff8 + 8))
										ad = ld64(s621 + 1)
										m = ld64(s628)
										if (m != 2) {
											break B46
										}
									} else {
										const al = ld64(s7f8 + 0x18)
										const ak = ld64(s7f8 + 8)
										const aj = ld64(s810)
										if (ld64(s421 + 1) >= aj) {
											fn_85138(s40, 0x10015982c)
											st64(s378, 0, 1, 0)
											st64(s260, s378, 0x10015f818)
											st8(s258 + 0x10, 3)
											st64(s258 + 8, 0x20)
											st64(s270, 0)
											st64(s280, 0)
											if (fn_88558(0x10015982c, s280) != 0) {
												fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
											}
											copyr(s5f0, s378, 0x18)
											copy(s608, s40, 0x18)
											st64(s621 + 1, 0x10015a0e6)
											st32(s5c8 + 0x38, 0x1770 /* error::NotApproved */)
											st8(s5e0 + 8, 2)
											st32(s610, 0x5a)
											st64(s618, 0x32)
											st64(s628, 0)
											bk = fn_13e5a0(s6b8, s628)
											ad = ld64(s6b8 + 8)
											m = ld64(s6b8)
											break B46
										}
										st64(sff8, al, ak)
										st64(s1000, ld64(s7f8))
										bk = fn_48a08(s628, s421, aj, d, ld64(s1000), al, ak)
										ad = ld64(s621 + 1)
										m = ld64(s628)
										if (m != 2) {
											break B46
										}
									}
									if (ad > 0x5555555555555554) {
										ErrorCode_name(s40, 0x100159900, am, an, ao)
										st64(s378, 0, 1, 0)
										st64(s260, s378, 0x10015f818)
										st8(s258 + 0x10, 3)
										st64(s258 + 8, 0x20)
										st64(s270, 0)
										st64(s280, 0)
										if (ErrorCode_fmt(0x100159900, s280) != 0) {
											fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
										}
										copyr(s5f0, s378, 0x18)
										copy(s608, s40, 0x18)
										st64(s621 + 1, 0x10015a0e6)
										st32(s5c8 + 0x38, 0x9c9 /* anchor::RequireGtViolated */)
										st8(s5e0 + 8, 2)
										st32(s610, 0x66 /* anchor::InstructionDidNotDeserialize */)
										st64(s618, 0x32)
										st64(s628, 0)
										fn_13e5a0(s768, s628)
										bk = fn_1730(s778, ld64(s768), ld64(s768 + 8), 0x5555555555555555, ad)
										ad = ld64(s778 + 8)
										m = ld64(s778)
									} else {
										const ap = ld64(s421 + 0x29)
										if (ap + ad >= ap) {
											bk = memcpy(w, s421, 0xa9)
											if (ad != 0) {
												const aq = ld64(ld64(s800) + 0x18)
												st64(s7f8 + 0x18, aq)
												if (aq == 0) {
													bk = fn_88360(s748, 2)
													ad = ld64(s748 + 8)
													m = ld64(s748)
													break B46
												}
												const ar = ld64(ld64(s800) + 0x10)
												st64(s7f8 + 8, ar)
												bk = InterfaceAccount_try_from_unchecked(s628, ar)
												const au = ld64(s621 + 1)
												m = ld64(s628)
												const at = ld32(s5c8 + 0x50)
												if (at == 2) {
													ad = au
													break B46
												}
												copyr(s368, s618, 0x10)
												copy(s2a0, s600, 0x20)
												st64(s7f8, ld64(s608))
												memcpy(s330, s5e0, 0x68)
												copy(s2c4, s574, 0x20)
												st32(s2c4 + 0x20, ld32(s574 + 0x20))
												st64(s378, m, au)
												copy(s350, s2a0, 0x20)
												st64(s360 + 8, ld64(s7f8))
												st32(s330 + 0x68, at)
												if (ld64(s7f8 + 0x18) == 1) {
													bk = fn_88360(s738, 2)
													ad = ld64(s738 + 8)
													m = ld64(s738)
													break B46
												}
												bk = InterfaceAccount_try_from_unchecked(s628, ld64(s7f8 + 8) + 0x30)
												const aw = ld64(s621 + 1)
												m = ld64(s628)
												const av = ld32(s5c8 + 0x50)
												if (av == 2) {
													ad = aw
													break B46
												}
												st64(s800, s1a8)
												memcpy(s1a8, s618, 0xa0)
												copy(s1cc, s574, 0x20)
												st32(s1cc + 0x20, ld32(s574 + 0x20))
												st64(s280, m, aw)
												memcpy(s270, ld64(s800), 0xa0)
												st32(s258 + 0x88, av)
												if (ld64(s7f8 + 0x18) == 2) {
													bk = fn_88360(s728, 2)
													ad = ld64(s728 + 8)
													m = ld64(s728)
													break B46
												}
												bk = InterfaceAccount_try_from(s628, ld64(s7f8 + 8) + 0x60)
												const ax = ld32(s628)
												if (ax == 2) {
													ad = ld64(s618)
													m = ld64(s621 + 1)
													break B46
												}
												st64(s800, ld64(s618))
												st64(s7f8 + 8, ld64(s621 + 1))
												st64(s7f8 + 0x18, ld32(s628 + 4))
												memcpy(se8, s610, 0x40)
												copy(s108, s5c8, 0x20)
												const bn = ld64(s5e0 + 0x10)
												if ((memcmp(s350, s258, 0x20) as u32) != 0) {
													ErrorCode_name(s88, 0x100159874)
													st64(s70, 0, 1, 0)
													st64(s20, s70, 0x10015f818)
													st8(s20 + 0x18, 3)
													st64(s20 + 0x10, 0x20)
													st64(s40 + 0x10, 0)
													st64(s40, 0)
													if (ErrorCode_fmt(0x100159874, s40) != 0) {
														fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
													}
													copy(s608, s88, 0x30)
													st64(s621 + 1, 0x10015a0e6)
													st32(s5c8 + 0x38, 0x9c6 /* anchor::RequireKeysEqViolated */)
													st8(s5e0 + 8, 2)
													st32(s610, 0x7b)
													st64(s618, 0x32)
													st64(s628, 0)
													const be = fn_13e5a0(s6c8, s628)
													const bd = ld64(s6c8 + 8)
													const bc = ld64(s6c8)
													copyr(s628, s2a0, 0x20)
													copy(s608, s190, 0x20)
													bk = Error_with_pubkeys(s6d8, bc, bd, s628, be)
													ad = ld64(s6d8 + 8)
													m = ld64(s6d8)
													break B46
												}
												const ay = ld64(ld64(s7f8))
												copyr(sa8, ay, 0x20)
												if ((memcmp(sa8, s3c8, 0x20) as u32) != 0) {
													ErrorCode_name(s88, 0x100159874)
													st64(s70, 0, 1, 0)
													st64(s20, s70, 0x10015f818)
													st8(s20 + 0x18, 3)
													st64(s20 + 0x10, 0x20)
													st64(s40 + 0x10, 0)
													st64(s40, 0)
													if (ErrorCode_fmt(0x100159874, s40) != 0) {
														fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
													}
													copy(s608, s88, 0x30)
													st64(s621 + 1, 0x10015a0e6)
													st32(s5c8 + 0x38, 0x9c6 /* anchor::RequireKeysEqViolated */)
													st8(s5e0 + 8, 2)
													st32(s610, 0x7c)
													st64(s618, 0x32)
													st64(s628, 0)
													const bb = fn_13e5a0(s6e8, s628)
													const ba = ld64(s6e8 + 8)
													const az = ld64(s6e8)
													copyr(s608, s3c8, 0x20)
													copy(s628, sa8, 0x20)
													bk = Error_with_pubkeys(s6f8, az, ba, s628, bb)
													ad = ld64(s6f8 + 8)
													m = ld64(s6f8)
													break B46
												}
												const bl = ld64(0x300000000 /* heap bump-allocator cursor */)
												const bm = bl != 0 ? sat_sub(bl, 0x80) & -8 : 0x300007f80
												if (0x300000008 > bm) {
													alloc_handle_alloc_error(8, 0x80)
												}
												st64(0x300000000 /* heap bump-allocator cursor */, bm)
												st64(bm + 0x10, ld64(s800))
												st64(bm + 8, ld64(s7f8 + 8))
												st32(bm + 4, ld64(s7f8 + 0x18))
												st32(bm, ax)
												memcpy(bm + 0x18, se8, 0x40)
												st64(bm + 0x58, bn)
												copy(bm + 0x60, s108, 0x20)
												bk = fn_7d178(s628, bm, ad)
												const bo = ld64(s621 + 1)
												m = ld64(s628)
												if (m != 2) {
													ad = bo
													break B46
												}
												const bp = bo + ad
												st64(s808, bp)
												if (ad > bp) {
													bk = fn_88360(s718, 0x26)
													ad = ld64(s718 + 8)
													m = ld64(s718)
													break B46
												}
												AccountInfo_clone_f338(s70, ld64(s260))
												AccountInfo_clone_f338(s40, ld64(s7f8))
												const bq = ld64(0x300000000 /* heap bump-allocator cursor */)
												const br = bq != 0 ? sat_sub(bq, 0x80) & -8 : 0x300007f80
												if (0x300000008 > br) {
													alloc_handle_alloc_error(8, 0x80)
												}
												st64(0x300000000 /* heap bump-allocator cursor */, br)
												st64(br + 0x10, ld64(s800))
												st64(br + 8, ld64(s7f8 + 8))
												st32(br + 4, ld64(s7f8 + 0x18))
												st32(br, ax)
												memcpy(br + 0x18, se8, 0x40)
												st64(br + 0x58, bn)
												copy(br + 0x60, s108, 0x20)
												const bs = ld64(s7f8 + 0x20)
												const bt = ld64(bs + 0x90)
												const bu = AccountInfo_clone_f338(s628, ld64(bs + 0x98))
												st64(sff8 + 0x10, ld64(s808))
												st64(s1000, br, bt, s628)
												const bv = fn_79050(s708, bs, s70, s40, br, bt, s628, ld64(sff8 + 0x10), bu, br)
												ad = ld64(s708 + 8)
												m = ld64(s708)
												bk = ptr_drop_in_place_fcd8(s70, ptr_drop_in_place_fcd8(s40, bv))
												if (m != 2) {
													break B46
												}
											}
											const bw = ld64(s818)
											st64(bw, ld64(bw) + 1)
											const bx = ld64(s7f8 + 0x10)
											st64(bx, ld64(bx) - 1)
											bj = ld64(s7f8 + 0x28)
											st64(bj + 8, ad)
											st64(bj, 2)
											return bk
										}
										bk = fn_88360(s758, 0x25)
										ad = ld64(s758 + 8)
										m = ld64(s758)
									}
								} else {
									fn_85138(s40, 0x100159910)
									st64(s378, 0, 1, 0)
									st64(s260, s378, 0x10015f818)
									st8(s258 + 0x10, 3)
									st64(s258 + 8, 0x20)
									st64(s270, 0)
									st64(s280, 0)
									if (fn_88558(0x100159910, s280) != 0) {
										fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
									}
									copyr(s5f0, s378, 0x18)
									copy(s608, s40, 0x18)
									st64(s621 + 1, 0x10015a0e6)
									st32(s5c8 + 0x38, 0x1791 /* error::UnInitializedRewardInfo */)
									st8(s5e0 + 8, 2)
									st32(s610, 0x4d)
									st64(s618, 0x32)
									st64(s628, 0)
									bk = fn_13e5a0(s788, s628)
									ad = ld64(s788 + 8)
									m = ld64(s788)
								}
							}
						}
						const ai = ld64(s818)
						st64(ai, ld64(ai) + 1)
						bi = ld64(s7f8 + 0x10)
						st64(bi, ld64(bi) - 1)
						bj = ld64(s7f8 + 0x28)
						st64(bj + 8, ad)
						st64(bj, m)
						return bk
					}
					ErrorCode_name(s40, 0x100159900)
					st64(s378, 0, 1, 0)
					st64(s260, s378, 0x10015f818)
					st8(s258 + 0x10, 3)
					st64(s258 + 8, 0x20)
					st64(s270, 0)
					st64(s280, 0)
					if (ErrorCode_fmt(0x100159900, s280) != 0) {
						fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
					}
					copyr(s5f0, s378, 0x18)
					copy(s608, s40, 0x18)
					st64(s621 + 1, 0x10015a0e6)
					st32(s5c8 + 0x38, 0x9c9 /* anchor::RequireGtViolated */)
					st8(s5e0 + 8, 2)
					st32(s610, 0x3e)
					st64(s618, 0x32)
					st64(s628, 0)
					fn_13e5a0(s678, s628)
					bk = fn_1730(s688, ld64(s678), ld64(s678 + 8), q, p)
					ad = ld64(s688 + 8)
					m = ld64(s688)
					bi = ld64(s7f8 + 0x10)
					st64(bi, ld64(bi) - 1)
					bj = ld64(s7f8 + 0x28)
					st64(bj + 8, ad)
					st64(bj, m)
					return bk
				}
				bk = fn_88360(s668, 0x26)
				ad = ld64(s668 + 8)
				m = ld64(s668)
				bi = ld64(s7f8 + 0x10)
				st64(bi, ld64(bi) - 1)
				bj = ld64(s7f8 + 0x28)
				st64(bj + 8, ad)
				st64(bj, m)
				return bk
			}
			raw_vec_handle_error(1, 0x140, 0x10015f8f8, 0x140 > k)
		}
		ErrorCode_name(s40, 0x100159900, c, d, e)
		st64(s378, 0, 1, 0)
		st64(s260, s378, 0x10015f818)
		st8(s258 + 0x10, 3)
		st64(s258 + 8, 0x20)
		st64(s270, 0)
		st64(s280, 0)
		if (ErrorCode_fmt(0x100159900, s280) != 0) {
			fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
		}
		copyr(s5f0, s378, 0x18)
		copy(s608, s40, 0x18)
		st64(s621 + 1, 0x10015a0e6)
		st32(s5c8 + 0x38, 0x9c9 /* anchor::RequireGtViolated */)
		st8(s5e0 + 8, 2)
		st32(s610, 0x34)
		st64(s618, 0x32)
		st64(s628, 0)
		fn_13e5a0(s648, s628)
		bk = fn_1730(s658, ld64(s648), ld64(s648 + 8), f, g)
		m = ld64(s658)
		bj = ld64(s7f8 + 0x28)
		st64(bj + 8, ld64(s658 + 8))
		st64(bj, m)
		return bk
	}
	fn_85138(s40, 0x1001598cc)
	st64(s378, 0, 1, 0)
	st64(s260, s378, 0x10015f818)
	st8(s258 + 0x10, 3)
	st64(s258 + 8, 0x20)
	st64(s270, 0)
	st64(s280, 0)
	if (fn_88558(0x1001598cc, s280) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s88, 0x10015f848, 0x10015f868)
	}
	copyr(s5f0, s378, 0x18)
	copy(s608, s40, 0x18)
	st64(s621 + 1, 0x10015a0e6)
	st32(s5c8 + 0x38, 0x1789 /* error::InvalidRewardIndex */)
	st8(s5e0 + 8, 2)
	st32(s610, 0x30)
	st64(s618, 0x32)
	st64(s628, 0)
	bk = fn_13e5a0(s638, s628)
	m = ld64(s638)
	bj = ld64(s7f8 + 0x28)
	st64(bj + 8, ld64(s638 + 8))
	st64(bj, m)
	return bk
}

function fn_c03e8(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10
	const j = fn_a80(s10, ld64(b + 0x80), c)
	let i = undef
	const f = ld64(s10)
	if (f == 2) {
		st64(a + 8, i)
		st64(a, f)
		return j
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0xa) : 0x300007ff6
	i = ld64(s10 + 8)
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
	return j
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), a (points to it), b (value)
function fn_6c2a0(a: u64, b: u64, c: u64): u64 {
	const s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s25b = fp - 0x25b, s270 = fp - 0x270, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2e0 = fp - 0x2e0
	let k, ad, ag, ah, al, an: u64
	st64(s290, b + 0x185, a, b, c)
	memcpy(s25b, b + 0x185, 0x1fb)
	let i = 0
	while (true) {
		B18: {
			B29: {
				B28: {
					B27: {
						const f = ld64(s290 + 0x10)
						const h = ld64(f + 0xed)
						const g = ld64(f + 0xe5)
						const j = i
						if ((g | h) == 0) {
							k = s25b + j * 0xa9
							let ae = i - 1
							while (true) {
								st64(s30, 0, 0, 0, 0)
								if ((memcmp(k + 0x39, s30, 0x20) as u32) != 0 && ld64(k + 0x29) != -1) {
									const af = ld64(k + 1)
									if (ld64(s290 + 0x18) > af) {
										ag = ld64(k + 9)
										ad = ag
										if (ag >= ld64(s290 + 0x18)) {
											ad = ld64(s290 + 0x18)
										}
										i = ae + 2
										st64(k + 0x11, ad)
										if (af > ad) {
											break B27
										}
										break
									}
								}
								k = k + 0xa9
								ae = ae + 1
								if (ae >= 2) {
									break B18
								}
							}
						} else {
							st64(s2a0, h, g)
							k = s25b + j * 0xa9
							let n = i - 1
							while (true) {
								st64(s30, 0, 0, 0, 0)
								if ((memcmp(k + 0x39, s30, 0x20) as u32) != 0) {
									const o = ld64(k + 0x29)
									if (o != -1) {
										const p = ld64(k + 1)
										if (ld64(s290 + 0x18) > p) {
											const q = ld64(k + 9)
											let l = q
											if (q >= ld64(s290 + 0x18)) {
												l = ld64(s290 + 0x18)
											}
											const m = ld64(k + 0x11)
											if (l > m) {
												st64(s2e0, l, q)
												const r = sat_sub(l, m)
												st64(s2e0 + 0x10, r)
												st64(s60, r, 0)
												const s = ld64(k + 0x19)
												st64(s2e0 + 0x28, s)
												const t = ld64(k + 0x21)
												st64(s2e0 + 0x20, t)
												st64(s50, s, t, 0, 1)
												fn_58930(s30, s60, s50, s40)
												copy(s2b0, s30, 0x10)
												st64(s2e0 + 0x18, ld64(s30 + 0x10))
												st64(s60, ld64(s2e0 + 0x10))
												st64(s60 + 8, 0)
												st64(s50 + 8, ld64(s2e0 + 0x20))
												st64(s50, ld64(s2e0 + 0x28))
												st64(s40 + 8, ld64(s2a0))
												st64(s40, ld64(s2a0 + 8))
												fn_584f8(s30, s60, s50, s40)
												let ac = ld64(s30 + 0x10)
												const u = ld64(s30)
												ac = u != 0 ? ac : 0
												let aa = ld64(s30 + 8)
												let w = ld64(s2b0 + 8)
												const v = ld64(s2b0)
												aa = u != 0 ? aa : 0
												w = v != 0 ? w : 0
												if ((v & ld64(s2e0 + 0x18) != 0) == 0 && ~o >= w) {
													const x = o + w
													if (o > x) {
														fn_154730(0x100160260, aa, x, o > x, w)
													}
													st64(k + 0x29, x)
												} else {
													st64(k + 0x29, -1)
													st64(s60, ~o, 0, 0, 1)
													st64(s40 + 8, ld64(s2a0))
													st64(s40, ld64(s2a0 + 8))
													fn_584f8(s30, s60, s50, s40)
													ac = ld64(s30 + 0x10)
													const y = ld64(s30)
													ac = y != 0 ? ac : 0
													aa = ld64(s30 + 8)
													aa = y != 0 ? aa : 0
												}
												const z = ld64(k + 0x99)
												const ab = z + aa
												i = n + 2
												st64(k + 0x99, ab)
												st64(k + 0xa1, ld64(k + 0xa1) + (z > ab) + ac)
												ag = ld64(s2e0 + 8)
												ad = ld64(s2e0)
												st64(k + 0x11, ad)
												if (p > ad) {
													break B27
												}
												break
											}
										}
									}
								}
								k = k + 0xa9
								n = n + 1
								if (n >= 2) {
									break B18
								}
							}
						}
						ah = 2
						if (ag > ad) {
							break B28
						}
					}
					ah = 3
					if (ad != ag) {
						break B29
					}
				}
				st8(k, ah)
			}
			if (3 > i) {
				continue
			}
		}
		memcpy(ld64(s290), s25b, 0x1fb)
		clock_get(s30)
		if (ld64(s30) != 0) {
			const aj = ld64(s30 + 8)
			const ai = ld64(s30 + 0x10)
			st64(s30 + 0x10, ld64(s30 + 0x18))
			st64(s30, aj, ai)
			an = fn_13e628(s270, s30)
			const am = ld64(s270 + 8)
			const ak = ld64(s270)
			al = ld64(s290 + 8)
			if (ak == 2) {
				st64(ld64(s290 + 0x10) + 0x438, am)
				an = memcpy(al + 1, s25b, 0x1fb)
				st8(al, 0)
				return an
			}
			st64(al + 0x10, am)
			st64(al + 8, ak)
			st8(al, 1)
			return an
		}
		al = ld64(s290 + 8)
		st64(ld64(s290 + 0x10) + 0x438, ld64(s30 + 0x18))
		an = memcpy(al + 1, s25b, 0x1fb)
		st8(al, 0)
		return an
	}
}

function fn_14b198(a: u64, b: u64): u64 {
	return solana_pubkey_write_as_base58(b, a)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), d (value), c (value), p5 (value), p6 (value), p7 (value)
function fn_494d0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, sd8 = fp - 0xd8, se0 = fp - 0xe0, se8 = fp - 0xe8
	let m, r, s, u, v, w, x, y: u64
	st64(sd8, d)
	const g = p5
	const l = p7
	const q = p6
	const f = ld64(b + 9)
	if (ld64(b + 0x11) != f && c >= ld64(b + 1)) {
		st64(se0, a)
		if (c > f) {
			w = fn_88360(sa0, 0x26)
			v = ld64(sa0)
			u = ld64(se0)
			st64(u + 8, ld64(sa0 + 8))
			st64(u, v)
			return w
		}
		const h = ld64(b + 0x21)
		const i = ld64(b + 0x19)
		st64(se8, 0)
		const j = g - h - (i > ld64(sd8))
		let k = d - i > ld64(sd8)
		k = j != g ? j > g : k
		st64(s60, f - c, 0, k != 0 ? 0 : d - i, k != 0 ? 0 : j, 0, 1)
		fn_58930(s30, s60, s50, s40)
		m = f > l
		if (m == 0) {
			st64(se8, l - f)
		}
		if (ld64(s30) != 0) {
			if (ld64(s30 + 0x10) == 0) {
				const o = ld64(s30 + 8)
				const n = ld64(sd8)
				st64(b + 0x19, n, g)
				st64(s60, ld64(se8))
				st64(s58, 0, n, g, 0, 1)
				w = fn_58930(s30, s60, s50, s40)
				m = undef
				if (ld64(s30) != 1) {
					w = fn_88360(s80, 0x26)
					v = ld64(s80)
					u = ld64(se0)
					st64(u + 8, ld64(s80 + 8))
					st64(u, v)
					return w
				}
				if (ld64(s30 + 0x10) == 0) {
					const p = ld64(s30 + 8)
					if (o > o + p) {
						w = fn_88360(s90, 0x26)
						v = ld64(s90)
						u = ld64(se0)
						st64(u + 8, ld64(s90 + 8))
						st64(u, v)
						return w
					}
					st64(b + 9, l)
					r = ld64(se0)
					st64(r + 8, p + o)
					st64(r, 2)
					return w
				}
				st64(s30, 0x10015fe18, 1, 8, 0, 0)
				// fmt "Integer overflow when casting to u64"
				fn_14ec00(s30, 0x10015fe28, m, x, y)
			}
			st64(s30, 0x10015fe18, 1, 8, 0, 0)
			// fmt "Integer overflow when casting to u64"
			fn_14ec00(s30, 0x10015fe28, m, x, y)
		}
		w = fn_88360(s70, 0x26)
		v = ld64(s70)
		u = ld64(se0)
		st64(u + 8, ld64(s70 + 8))
		st64(u, v)
		return w
	}
	if (q > l) {
		w = fn_88360(sd0, 0x26)
		s = ld64(sd0)
		st64(a + 8, ld64(sd0 + 8))
		st64(a, s)
		return w
	}
	r = a
	if (l == q) {
		w = fn_88360(sc0, 0x1f)
		s = ld64(sc0)
		st64(r + 8, ld64(sc0 + 8))
		st64(r, s)
		return w
	}
	st64(se0, l)
	st64(s60, l - q, 0)
	st64(s50 + 8, g)
	st64(s50, ld64(sd8))
	st64(s40, 0, 1)
	w = fn_58930(s30, s60, s50, s40)
	m = undef
	if (ld64(s30) != 1) {
		w = fn_88360(sb0, 0x26)
		s = ld64(sb0)
		st64(r + 8, ld64(sb0 + 8))
		st64(r, s)
		return w
	}
	if (ld64(s30 + 0x10) == 0) {
		const t = ld64(s30 + 8)
		st64(b + 0x19, ld64(sd8))
		st64(b + 0x11, q)
		st64(b + 1, q)
		st64(b + 9, ld64(se0))
		st64(b + 0x21, g)
		st64(r + 8, t)
		st64(r, 2)
		return w
	}
	st64(s30, 0x10015fe18, 1, 8, 0, 0)
	// fmt "Integer overflow when casting to u64"
	fn_14ec00(s30, 0x10015fe28, m, x, y)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), d (value), c (value), p5 (value), p6 (value), p7 (value)
function fn_48a08(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8
	let s, t, u, v, w, x: u64
	const i = p5
	const g = p7
	const f = ld64(b + 9)
	if (ld64(b + 0x11) == f) {
		const h = p6
		if (h > g) {
			t = fn_88360(s1c8, 0x26)
			s = ld64(s1c8)
			st64(a + 8, ld64(s1c8 + 8))
			st64(a, s)
			return t
		}
		if (0xffffffffff92937f > g - h - 0x76a701) {
			t = fn_88360(s1b8, 0x1f)
			s = ld64(s1b8)
			st64(a + 8, ld64(s1b8 + 8))
			st64(a, s)
			return t
		}
		x = b
		st64(s78, g - h, 0)
		st64(s60, d, i)
		st64(s48, 0, 1)
		t = fn_58930(s118, s78, s60, s48)
		if (ld64(s118) != 1) {
			t = fn_88360(s1a8, 0x26)
			s = ld64(s1a8)
			st64(a + 8, ld64(s1a8 + 8))
			st64(a, s)
			return t
		}
		if (ld64(s118 + 0x10) == 0) {
			const j = ld64(s118 + 8)
			st64(x + 0x19, d)
			st64(x + 0x11, h)
			st64(x + 1, h, g)
			st64(x + 0x21, i)
			st64(a + 8, j)
			st64(a, 2)
			return t
		}
	} else {
		if (c > f) {
			t = fn_88360(s198, 0x26)
			s = ld64(s198)
			st64(a + 8, ld64(s198 + 8))
			st64(a, s)
			return t
		}
		if (f > g) {
			t = fn_88360(s188, 0x26)
			s = ld64(s188)
			st64(a + 8, ld64(s188 + 8))
			st64(a, s)
			return t
		}
		if (0xffffffffff92937f > g - f - 0x76a701) {
			fn_85138(s78, 0x1001598c4)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (fn_88558(0x1001598c4, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copy(sf8, s78, 0x30)
			st64(s118 + 8, 0x10015a0e6)
			st32(sf8 + 0x78, 0x1790 /* error::NotApproveUpdateRewardEmissions */)
			st8(sf8 + 0x30, 2)
			st32(s118 + 0x18, 0xbc)
			st64(s118 + 0x10, 0x32)
			st64(s118, 0)
			t = fn_13e5a0(s178, s118)
			s = ld64(s178)
			st64(a + 8, ld64(s178 + 8))
			st64(a, s)
			return t
		}
		const l = ld64(b + 0x21)
		const k = ld64(b + 0x19)
		if (f - c >= 0x3f480) {
			const m = l != i ? l > i : k > d
			if ((m & 1) != 0) {
				ErrorCode_name(s78, 0x100159900, k, d, m & 1)
				st64(s60, 0, 1, 0)
				st64(s28, s60, 0x10015f818)
				st8(s28 + 0x18, 3)
				st64(s28 + 0x10, 0x20)
				st64(s48 + 0x10, 0)
				st64(s48, 0)
				if (ErrorCode_fmt(0x100159900, s48) != 0) {
					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
				}
				copy(sf8, s78, 0x30)
				st64(s118 + 8, 0x10015a0e6)
				st32(sf8 + 0x78, 0x9c9 /* anchor::RequireGtViolated */)
				st8(sf8 + 0x30, 2)
				st32(s118 + 0x18, 0xc1)
				st64(s118 + 0x10, 0x32)
				st64(s118, 0)
				fn_13e5a0(s158, s118)
				t = fn_1730(s168, ld64(s158), ld64(s158 + 8), 0x3f480, f - c)
				s = ld64(s168)
				st64(a + 8, ld64(s168 + 8))
				st64(a, s)
				return t
			}
		}
		const n = i - l - (k > d)
		const o = n != i ? n > i : k > d
		x = b
		st64(s78, f - c, 0)
		st64(s60, o != 0 ? 0 : d - k, o != 0 ? 0 : n)
		st64(s48, 0, 1)
		fn_58930(s118, s78, s60, s48)
		if (ld64(s118) == 0) {
			t = fn_88360(s128, 0x26)
			s = ld64(s128)
			st64(a + 8, ld64(s128 + 8))
			st64(a, s)
			return t
		}
		if (ld64(s118 + 0x10) == 0) {
			const p = ld64(s118 + 8)
			st64(x + 0x19, d, i)
			st64(s78, g - f, 0)
			st64(s60, d, i)
			st64(s48, 0, 1)
			t = fn_58930(s118, s78, s60, s48)
			if (ld64(s118) != 1) {
				t = fn_88360(s138, 0x26)
				s = ld64(s138)
				st64(a + 8, ld64(s138 + 8))
				st64(a, s)
				return t
			}
			if (ld64(s118 + 0x10) == 0) {
				const q = ld64(s118 + 8)
				const r = x
				if (p > p + q) {
					t = fn_88360(s148, 0x26)
					s = ld64(s148)
					st64(a + 8, ld64(s148 + 8))
					st64(a, s)
					return t
				}
				st64(r + 9, g)
				st64(a + 8, q + p)
				st64(a, 2)
				return t
			}
		}
	}
	st64(s118, 0x10015fe18, 1, 8, 0, 0)
	// fmt "Integer overflow when casting to u64"
	fn_14ec00(s118, 0x10015fe28, u, v, w)
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

function fn_f5d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, b, c, d, e)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it), b (points to it), c (points to it)
function fn_584f8(a: u64, b: u64, c: u64, d: u64): u64 {
	const s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s80 = fp - 0x80, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s108 = fp - 0x108, s110 = fp - 0x110, s118 = fp - 0x118
	let f = ld64(d)
	const g = ld64(d + 8)
	if ((f | g) == 0) {
		st64(a, 0)
		return f
	}
	st64(s118, d)
	st64(s108, g, f, a)
	const h = ld64(b)
	const i = ld64(c)
	__multi3_159030(sf0, h, 0, i, 0)
	const j = ld64(b + 8)
	st64(s110, i)
	__multi3_159030(sd0, j, 0, i, 0)
	const k = ld64(c + 8)
	__multi3_159030(se0, k, 0, h, 0)
	__multi3_159030(sc0, k, 0, j, 0)
	const m = ld64(sf0 + 8)
	const l = ld64(sd0)
	const q = (l > l + m) + ld64(sd0 + 8)
	const n = ld64(se0)
	const o = n + (l + m)
	const p = (n > o) + ld64(se0 + 8)
	const t = p > p + q
	const r = ld64(sc0)
	const s = r + (p + q)
	st64(sb0, ld64(sf0))
	st64(sb0 + 8, o)
	if (s == 0 && (r > s) + ld64(sc0 + 8) == -(t & 1)) {
		f = fn_100918(s40, sb0, ld64(s118))
		a = ld64(s108 + 0x10)
		st64(a + 0x10, ld64(s40 + 8))
		st64(a + 8, ld64(s40))
		st64(a, 1)
		return f
	}
	st64(s80, h, j, 0, 0)
	st64(s40 + 8, k)
	st64(s40, ld64(s110))
	st64(s30, 0, 0)
	fn_103fe8(sa0, s80, s40)
	st64(s60 + 8, ld64(s108))
	st64(s60, ld64(s108 + 8))
	st64(s50, 0, 0)
	f = fn_1019b8(s40, sa0, s60)
	a = ld64(s108 + 0x10)
	if ((ld64(s30 + 8) | ld64(s30)) != 0) {
		st64(a, 0)
		return f
	}
	const u = ld64(s40)
	st64(a + 0x10, ld64(s40 + 8))
	st64(a + 8, u)
	st64(a, 1)
	return f
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_154730(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622d0, 1, 8, 0, 0)
	// fmt "attempt to add with overflow"
	fn_14ec00(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14ec00(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s18 = fp - 0x18
	st64(s18, a, b)
	st16(s18 + 0x10, 1)
	fn_14ce00(s18, b, c, d, e)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14ce00(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14d4b8(a, b, c, d, e)
}

function fn_153160(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155bf8(a, b, c, d, e)
}

function fn_155738(a: u64, b: u64): u64 {
	return imp__fmt_155760(ld64(a), 1, b)
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
function fn_154788(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622e0, 1, 8, 0, 0)
	// fmt "attempt to subtract with overflow"
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14d4b8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	custom_panic(a, b, c, d, e)
	abort()
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
