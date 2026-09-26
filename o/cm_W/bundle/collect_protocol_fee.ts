// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction collect_protocol_fee: handler + 26 reachable functions
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
interface Mint extends sized<0x60> { // Account<Mint> (anchor_spl, SPL Token Mint) as unpacked in memory (fields [known: spl_token::state layout] at the offsets a run of try_accounts_15c0 put them [offsets from exec]; info = the &AccountInfo)
	mint_authority:   at<0x04, Pubkey> // COption<Pubkey>
	supply:           at<0x28, u64>
	decimals:         at<0x30, u8>
	freeze_authority: at<0x38, Pubkey> // COption<Pubkey>
	info:             at<0x58, ref<AccountInfo>> // &AccountInfo
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
interface CollectProtocolFeeArgs extends sized<0x10> { // arguments of instruction collect_protocol_fee (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	amount_0_requested: at<0x00, u64>
	amount_1_requested: at<0x08, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_log_data(slices: u64, len: u64): void // log base64 data: slices = &[&[u8]]
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function fn_11e0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function try_accounts_15c0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_1678(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::interface_account::InterfaceAccount<T> as anchor_lang::Accounts<B>…
declare function fn_7498(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses try_accounts_1678, alloc_handle_alloc_error, memcpy
declare function fn_7768(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses try_accounts_15c0, alloc_handle_alloc_error, memcpy
declare function ptr_drop_in_place_fd78(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_account_info::AccountInfo; 4]>
declare function Rc_drop_slow_14df0(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function try_accounts_17a30(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_184d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_18cf0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp, Error_with_pubkeys
declare function try_accounts_19190(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function token_transfer(a: u64, b: u64, c: u64): u64 // lib anchor_spl::token::transfer
declare function token_2022_transfer_checked(a: u64, b: u64, c: u64, d: u64): u64 // lib anchor_spl::token_2022::transfer_checked
declare function Error_new_13c880(): u64 // lib std::io::error::Error::new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function Error_with_pubkeys(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib anchor_lang::error::Error::with_pubkeys
declare function ErrorCode_name(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib anchor_lang::error::ErrorCode::name
declare function ErrorCode_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::error::ErrorCode as core::fmt::Display>::fmt
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function de_unexpected_eof_to_unexpected_length_of_input(a: u64): u64 // lib borsh::de::unexpected_eof_to_unexpected_length_of_input
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fmt_write(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::write
declare function imp__fmt_155760(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u64>::_fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp

// instruction handler: collect_protocol_fee (discriminator sha256("global:collect_protocol_fee")[..8] = 0x597e42c2ddfc8888)
// accounts [idl]: 0 owner [signer], 1 pool_state [mut], 2 amm_config, 3 token_vault_0 [mut], 4 token_vault_1 [mut], 5 vault_0_mint, 6 vault_1_mint, 7 recipient_token_account_0 [mut], 8 recipient_token_account_1 [mut], 9 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 10 token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb]
// args [idl]: amount_0_requested: u64, amount_1_requested: u64
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, amount_0_requested, amount_1_requested
function ix_collect_protocol_fee(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc8 = fp - 0xc8, s178 = fp - 0x178, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0
	let l, p: u64
	const i = sol_log("Instruction: CollectProtocolFee", 0x1f)
	const f = ix_args_len
	if (f >= 8 && (f & -8) != 8) {
		const args: CollectProtocolFeeArgs = ix_args
		const amount_0_requested = args.amount_0_requested
		const amount_1_requested = args.amount_1_requested
		st64(s1a0, accounts, accounts_len)
		p = accounts_collect_protocol_fee(sc8, amount_0_requested, s1a0, undef, fp, i)
		const k = ld64(sb8)
		l = ld64(sc8 + 8)
		const j = ld64(sc8)
		if (j == 0) {
			st64(a + 8, k)
			st64(a, l)
			return p
		}
		const m = memcpy(s178, sb0, 0xb0)
		st64(s190, j, l, k)
		copyr(sb8, s1a0, 0x10)
		st64(sc8, program_id, s190)
		p = fn_4d0a8(s1b0, sc8, amount_0_requested, amount_1_requested, undef, m)
		l = ld64(s1b0)
		if (l == 2) {
			p = fn_c9aa0(s1c0, s190, program_id)
			l = ld64(s1c0)
			st64(a + 8, ld64(s1c0 + 8))
			st64(a, l)
			return p
		}
		st64(a + 8, ld64(s1b0 + 8))
		st64(a, l)
		return p
	}
	const n = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
	if (2 > (n & 3) - 2) {
		p = anchor_error_from(s1d0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s1d0)
		st64(a + 8, ld64(s1d0 + 8))
		st64(a, l)
		return p
	}
	if ((n & 3) == 0) {
		p = anchor_error_from(s1d0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s1d0)
		st64(a + 8, ld64(s1d0 + 8))
		st64(a, l)
		return p
	}
	const o = ld64(ld64(n + 7))
	if (o == 0) {
		p = anchor_error_from(s1d0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		l = ld64(s1d0)
		st64(a + 8, ld64(s1d0 + 8))
		st64(a, l)
		return p
	}
	callx(o, ld64(n - 1), o)
	p = anchor_error_from(s1d0, 0x66 /* anchor::InstructionDidNotDeserialize */)
	l = ld64(s1d0)
	st64(a + 8, ld64(s1d0 + 8))
	st64(a, l)
	return p
}

// Anchor Accounts::try_accounts of instruction collect_protocol_fee (called by ix_collect_protocol_fee; name [str]: from the handler's "Instruction: …" log; was fn_c5a90)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: vault_0_mint (ConstraintAddress), vault_1_mint (ConstraintAddress), recipient_token_account_0 (ConstraintMut), recipient_token_account_1 (ConstraintMut), token_program, token_program_2022, owner, token_vault_1 (ConstraintMut, ConstraintRaw), token_vault_0 (ConstraintMut, ConstraintRaw), amm_config (ConstraintAddress), pool_state (ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: recipient_token_account_1_box, pool_state [idl], token_vault_0, token_vault_1
function accounts_collect_protocol_fee(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const sc0 = fp - 0xc0, sd8 = fp - 0xd8, sf8 = fp - 0xf8, s118 = fp - 0x118, s138 = fp - 0x138, s158 = fp - 0x158, s170 = fp - 0x170, s190 = fp - 0x190, s1b0 = fp - 0x1b0, s1d0 = fp - 0x1d0, s230 = fp - 0x230, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4b8 = fp - 0x4b8, s4c0 = fp - 0x4c0, s4c8 = fp - 0x4c8, s4d0 = fp - 0x4d0, s4d8 = fp - 0x4d8, s4e0 = fp - 0x4e0, s4e8 = fp - 0x4e8, s4f0 = fp - 0x4f0, s4f8 = fp - 0x4f8, s500 = fp - 0x500
	let l, m, aa, ai, aj, ak, am, an, ap, aq, at, au, aw, ax, bm, bn, bo, ci, cj: u64
	let recipient_token_account_1_box: TokenAccount
	let j = a
	let q = try_accounts_17a30(sd8, c, c, d, e, r0)
	const i = ld64(sd8 + 8)
	let f = ld64(sd8)
	if (f == 2) {
		q = fn_11e0(sd8, c)
		const o = ld64(sd8 + 8)
		f = ld64(sd8)
		if (f == 2) {
			try_accounts_184d8(sd8, c)
			q = ld64(sd8 + 0x10)
			l = ld64(sd8 + 8)
			const p = ld64(sd8)
			if (p == 0) {
				const u = ld64(0x300000000 /* heap bump-allocator cursor */)
				m = 0xa > u
				const v = u != 0 ? m != 0 ? 0 : u - 0xa : 0x300007ff6
				if ((l & 1) != 0) {
					if (0x300000008 > v) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, m, l)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, v)
					st64(v, 0x666e6f635f6d6d61)
					st16(v + 8, 0x6769)
					void ld64(q)
				} else {
					if (0x300000008 > v) {
						raw_vec_handle_error(1, 0xa, 0x10015f8f8, m, l)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, v)
					st64(v, 0x666e6f635f6d6d61)
					st16(v + 8, 0x6769)
					void ld64(q)
				}
				st64(q + 0x10, v, 0xa)
				st64(q + 8, 0xa)
				st64(q, 1)
				st64(j + 0x10, q)
				st64(j + 8, l)
				st64(j, 0)
				return q
			}
			st64(s4b8, o, i, j, c)
			memcpy(s230, sc0, 0x60)
			st64(s4d0, q)
			st64(s2a0 + 8, q)
			st64(s4c8, l)
			st64(s2a0, l)
			st64(s4c0, p)
			st64(s2b8 + 0x10, p)
			const r = ld64(s4b8 + 0x18)
			memcpy(s290, s230, 0x60)
			q = try_accounts_1678(sd8, r)
			if (ld32(sc0 + 0x98) == 2) {
				const w = ld64(0x300000000 /* heap bump-allocator cursor */)
				aa = ld64(s4b8 + 0x10)
				const x = ld64(sd8)
				const y = w != 0 ? sat_sub(w, 0xd) : 0x300007ff3
				const z = ld64(sd8 + 8)
				if (x != 0) {
					if (0x300000008 > y) {
						raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0x300000008, aa)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, y)
					st64(y + 5, 0x305f746c7561765f)
					st64(y, 0x61765f6e656b6f74)
					void ld64(z)
				} else {
					if (0x300000008 > y) {
						raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0x300000008, aa)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, y)
					st64(y + 5, 0x305f746c7561765f)
					st64(y, 0x61765f6e656b6f74)
					void ld64(z)
				}
				st64(z + 0x10, y, 0xd)
				st64(z + 8, 0xd)
				st64(z, 1)
				st64(aa + 0x10, z)
				st64(aa + 8, x)
				st64(aa, 0)
				return q
			}
			const s = ld64(0x300000000 /* heap bump-allocator cursor */)
			j = ld64(s4b8 + 0x10)
			const az = ld64(s4b8 + 8)
			const t = s != 0 ? sat_sub(s, 0xd8) : 0x300007f28
			if (0x300000008 > t) {
				alloc_handle_alloc_error(8, 0xd8)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, t & -8)
			if ((t & -8) != 0) {
				memcpy(t & -8, sd8, 0xd8)
				q = try_accounts_1678(sd8, r)
				aa = undef
				if (ld32(sc0 + 0x98) == 2) {
					const ad = ld64(0x300000000 /* heap bump-allocator cursor */)
					f = ld64(sd8)
					const ae = ad != 0 ? sat_sub(ad, 0xd) : 0x300007ff3
					recipient_token_account_1_box = ld64(sd8 + 8)
					if (f != 0) {
						if (0x300000008 > ae) {
							raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0x300000008, aa)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ae)
						st64(ae + 5, 0x315f746c7561765f)
						st64(ae, 0x61765f6e656b6f74)
						void ld64(recipient_token_account_1_box)
					} else {
						if (0x300000008 > ae) {
							raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0x300000008, aa)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ae)
						st64(ae + 5, 0x315f746c7561765f)
						st64(ae, 0x61765f6e656b6f74)
						void ld64(recipient_token_account_1_box)
					}
					st64(recipient_token_account_1_box + 0x10, ae, 0xd)
					st64(recipient_token_account_1_box + 8, 0xd)
					st64(recipient_token_account_1_box, 1)
					st64(j + 0x10, recipient_token_account_1_box)
					st64(j + 8, f)
					st64(j, 0)
					return q
				}
				const ab = ld64(0x300000000 /* heap bump-allocator cursor */)
				const ac = ab != 0 ? sat_sub(ab, 0xd8) : 0x300007f28
				if (0x300000008 > ac) {
					alloc_handle_alloc_error(8, 0xd8)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ac & -8)
				if ((ac & -8) != 0) {
					memcpy(ac & -8, sd8, 0xd8)
					try_accounts_15c0(sd8, ld64(s4b8 + 0x18))
					if (ld32(sd8) == 2) {
						q = fn_4130(s2b8, ld64(sd8 + 8), ld64(sd8 + 0x10), "vault_0_mint", 0xc)
						st64(s4d8, ld64(s2b8 + 8))
						f = ld64(s2b8)
						if (f != 2) {
							st64(j + 0x10, ld64(s4d8))
							st64(j + 8, f)
							st64(j, 0)
							return q
						}
					} else {
						const ag = ld64(0x300000000 /* heap bump-allocator cursor */)
						const ah = ag != 0 ? sat_sub(ag, 0x80) : 0x300007f80
						if (0x300000008 > ah) {
							alloc_handle_alloc_error(8, 0x80)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ah & -8)
						if ((ah & -8) == 0) {
							alloc_handle_alloc_error(8, 0x80)
						}
						st64(s4d8, ah & -8)
						memcpy(ah & -8, sd8, 0x80)
					}
					fn_7768(sd8, ld64(s4b8 + 0x18), ai, aj, ak)
					recipient_token_account_1_box = ld64(sd8 + 8)
					const al = ld64(sd8)
					if (al != 2) {
						q = fn_4130(s2c8, al, recipient_token_account_1_box, "vault_1_mint", 0xc)
						recipient_token_account_1_box = ld64(s2c8 + 8)
						f = ld64(s2c8)
						if (f != 2) {
							st64(j + 0x10, recipient_token_account_1_box)
							st64(j + 8, f)
							st64(j, 0)
							return q
						}
					}
					st64(s4e0, recipient_token_account_1_box)
					fn_7498(sd8, ld64(s4b8 + 0x18), recipient_token_account_1_box, am, an)
					recipient_token_account_1_box = ld64(sd8 + 8)
					const ao = ld64(sd8)
					if (ao != 2) {
						q = fn_4130(s2d8, ao, recipient_token_account_1_box, "recipient_token_account_0", 0x19)
						recipient_token_account_1_box = ld64(s2d8 + 8)
						f = ld64(s2d8)
						if (f != 2) {
							st64(j + 0x10, recipient_token_account_1_box)
							st64(j + 8, f)
							st64(j, 0)
							return q
						}
					}
					st64(s4e8, recipient_token_account_1_box)
					fn_7498(sd8, ld64(s4b8 + 0x18), recipient_token_account_1_box, ap, aq)
					recipient_token_account_1_box = ld64(sd8 + 8)
					const ar = ld64(sd8)
					if (ar != 2) {
						q = fn_4130(s2e8, ar, recipient_token_account_1_box, "recipient_token_account_1", 0x19)
						recipient_token_account_1_box = ld64(s2e8 + 8)
						f = ld64(s2e8)
						if (f != 2) {
							st64(j + 0x10, recipient_token_account_1_box)
							st64(j + 8, f)
							st64(j, 0)
							return q
						}
					}
					st64(s4f0, recipient_token_account_1_box)
					try_accounts_19190(sd8, ld64(s4b8 + 0x18), recipient_token_account_1_box, at, au)
					recipient_token_account_1_box = ld64(sd8 + 8)
					const av = ld64(sd8)
					if (av != 2) {
						q = fn_4130(s2f8, av, recipient_token_account_1_box, 0x10015b020 /* "token_program" */, 0xd)
						recipient_token_account_1_box = ld64(s2f8 + 8)
						f = ld64(s2f8)
						if (f != 2) {
							st64(j + 0x10, recipient_token_account_1_box)
							st64(j + 8, f)
							st64(j, 0)
							return q
						}
					}
					st64(s4f8, recipient_token_account_1_box)
					fn_18cf0(sd8, ld64(s4b8 + 0x18), recipient_token_account_1_box, aw, ax)
					recipient_token_account_1_box = ld64(sd8 + 8)
					const ay = ld64(sd8)
					if (ay != 2) {
						q = fn_4130(s308, ay, recipient_token_account_1_box, "token_program_2022", 0x12)
						recipient_token_account_1_box = ld64(s308 + 8)
						f = ld64(s308)
						if (f != 2) {
							st64(j + 0x10, recipient_token_account_1_box)
							st64(j + 8, f)
							st64(j, 0)
							return q
						}
					}
					st64(s500, recipient_token_account_1_box)
					st64(s4b8 + 0x18, ac & -8)
					const ba = ld64(az)
					copyr(s1d0, ba, 0x20)
					const bb = memcmp(s1d0, s2a0, 0x20)
					let bc = bb as u32
					if (bc != 0) {
						copyr(sd8, ba, 0x20)
						const bd = memcmp(sd8, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20)
						bc = bd as u32
						if (bc != 0) {
							fn_88360(s318, 0)
							q = fn_4130(s328, ld64(s318), ld64(s318 + 8), 0x10015b1d0 /* "owner" */, 5)
							f = ld64(s328)
							st64(j + 0x10, ld64(s328 + 8))
							st64(j + 8, f)
							st64(j, 0)
							return q
						}
					}
					const pool_state: AccountInfo = ld64(s4b8)
					if (pool_state.is_writable != 0) {
						const bf = ld64(ld64(s4c0))
						copyr(s1b0, bf, 0x20)
						q = fn_4dc0(sd8, pool_state, bc)
						const bh = ld64(sd8 + 0x10)
						let bg = ld64(sd8 + 8)
						if (ld64(sd8) != 0) {
							st64(j + 0x10, bh)
							st64(j + 8, bg)
							st64(j, 0)
							return q
						}
						copyr(s190, bg + 1, 0x20)
						st64(bh, ld64(bh) - 1)
						const bi = memcmp(s1b0, s190, 0x20)
						if ((bi as u32) == 0) {
							const token_vault_0: AccountInfo = ld64((t & -8) + 0x20)
							if (token_vault_0.is_writable != 0) {
								const bq = token_vault_0.key
								copyr(sd8, bq, 0x20)
								q = fn_4dc0(s170, ld64(s4b8), bi as u32)
								const br = ld64(s170 + 0x10)
								bg = ld64(s170 + 8)
								if (ld64(s170) != 0) {
									st64(j + 0x10, br)
									st64(j + 8, bg)
									st64(j, 0)
									return q
								}
								const bs = memcmp(sd8, bg + 0x81, 0x20)
								st64(br, ld64(br) - 1)
								if ((bs as u32) == 0) {
									const token_vault_1: AccountInfo = ld64(ld64(s4b8 + 0x18) + 0x20)
									if (token_vault_1.is_writable != 0) {
										const bu = token_vault_1.key
										copyr(sd8, bu, 0x20)
										q = fn_4dc0(s170, ld64(s4b8), bs as u32)
										const bw = ld64(s170 + 0x10)
										const bv = ld64(s170 + 8)
										if (ld64(s170) != 0) {
											const by = ld64(s4b8 + 0x10)
											st64(by + 0x10, bw)
											st64(by + 8, bv)
											st64(by, 0)
											return q
										}
										const bx = memcmp(sd8, bv + 0xa1, 0x20)
										st64(bw, ld64(bw) - 1)
										if ((bx as u32) == 0) {
											const bz = ld64(ld64(ld64(s4d8) + 0x58))
											copyr(s158, bz, 0x20)
											copy(s138, (t & -8) + 0x28, 0x20)
											if ((memcmp(s158, s138, 0x20) as u32) != 0) {
												anchor_error_from(s408, 0x7dc /* anchor::ConstraintAddress */)
												const ch = fn_4130(s418, ld64(s408), ld64(s408 + 8), "vault_0_mint", 0xc)
												const cg = ld64(s418 + 8)
												const cf = ld64(s418)
												copy(sd8, s158, 0x40)
												q = Error_with_pubkeys(s428, cf, cg, sd8, ch)
												cj = ld64(s428)
												ci = ld64(s4b8 + 0x10)
												st64(ci + 0x10, ld64(s428 + 8))
												st64(ci + 8, cj)
												st64(ci, 0)
												return q
											}
											const ca = ld64(ld64(ld64(s4e0) + 0x58))
											copyr(s118, ca, 0x20)
											const cb = ld64(s4b8 + 0x18)
											copy(sf8, cb + 0x28, 0x20)
											if ((memcmp(s118, sf8, 0x20) as u32) == 0) {
												if (ld8(ld64(ld64(s4e8) + 0x20) + 0x29) != 0) {
													if (ld8(ld64(ld64(s4f0) + 0x20) + 0x29) != 0) {
														const ck = ld64(s4b8 + 0x10)
														q = memcpy(ck + 0x28, s230, 0x60)
														st64(ck + 0xc0, ld64(s500))
														st64(ck + 0xb8, ld64(s4f8))
														st64(ck + 0xb0, ld64(s4f0))
														st64(ck + 0xa8, ld64(s4e8))
														st64(ck + 0xa0, ld64(s4e0))
														st64(ck + 0x98, ld64(s4d8))
														st64(ck + 0x90, ld64(s4b8 + 0x18))
														st64(ck + 0x88, t & -8)
														st64(ck + 0x20, ld64(s4d0))
														st64(ck + 0x18, ld64(s4c8))
														st64(ck + 0x10, ld64(s4c0))
														st64(ck + 8, ld64(s4b8))
														st64(ck, ld64(s4b8 + 8))
														return q
													}
													anchor_error_from(s488, 0x7d0 /* anchor::ConstraintMut */)
													q = fn_4130(s498, ld64(s488), ld64(s488 + 8), "recipient_token_account_1", 0x19)
													cj = ld64(s498)
													ci = ld64(s4b8 + 0x10)
													st64(ci + 0x10, ld64(s498 + 8))
													st64(ci + 8, cj)
													st64(ci, 0)
													return q
												}
												anchor_error_from(s468, 0x7d0 /* anchor::ConstraintMut */)
												q = fn_4130(s478, ld64(s468), ld64(s468 + 8), "recipient_token_account_0", 0x19)
												cj = ld64(s478)
												ci = ld64(s4b8 + 0x10)
												st64(ci + 0x10, ld64(s478 + 8))
												st64(ci + 8, cj)
												st64(ci, 0)
												return q
											}
											anchor_error_from(s438, 0x7dc /* anchor::ConstraintAddress */)
											const ce = fn_4130(s448, ld64(s438), ld64(s438 + 8), "vault_1_mint", 0xc)
											const cd = ld64(s448 + 8)
											const cc = ld64(s448)
											copy(sd8, s118, 0x40)
											q = Error_with_pubkeys(s458, cc, cd, sd8, ce)
											cj = ld64(s458)
											ci = ld64(s4b8 + 0x10)
											st64(ci + 0x10, ld64(s458 + 8))
											st64(ci + 8, cj)
											st64(ci, 0)
											return q
										}
										anchor_error_from(s3e8, 0x7d3 /* anchor::ConstraintRaw */)
										q = fn_4130(s3f8, ld64(s3e8), ld64(s3e8 + 8), "token_vault_1", 0xd)
										cj = ld64(s3f8)
										ci = ld64(s4b8 + 0x10)
										st64(ci + 0x10, ld64(s3f8 + 8))
										st64(ci + 8, cj)
										st64(ci, 0)
										return q
									}
									anchor_error_from(s3c8, 0x7d0 /* anchor::ConstraintMut */)
									q = fn_4130(s3d8, ld64(s3c8), ld64(s3c8 + 8), "token_vault_1", 0xd)
									cj = ld64(s3d8)
									ci = ld64(s4b8 + 0x10)
									st64(ci + 0x10, ld64(s3d8 + 8))
									st64(ci + 8, cj)
									st64(ci, 0)
									return q
								}
								anchor_error_from(s3a8, 0x7d3 /* anchor::ConstraintRaw */)
								q = fn_4130(s3b8, ld64(s3a8), ld64(s3a8 + 8), "token_vault_0", 0xd)
								f = ld64(s3b8)
								st64(j + 0x10, ld64(s3b8 + 8))
								st64(j + 8, f)
								st64(j, 0)
								return q
							}
							anchor_error_from(s388, 0x7d0 /* anchor::ConstraintMut */)
							q = fn_4130(s398, ld64(s388), ld64(s388 + 8), "token_vault_0", 0xd)
							f = ld64(s398)
							st64(j + 0x10, ld64(s398 + 8))
							st64(j + 8, f)
							st64(j, 0)
							return q
						}
						anchor_error_from(s358, 0x7dc /* anchor::ConstraintAddress */)
						const bl = fn_4130(s368, ld64(s358), ld64(s358 + 8), 0x10015af4d /* "amm_config" */, 0xa)
						const bk = ld64(s368 + 8)
						const bj = ld64(s368)
						copy(sd8, s1b0, 0x40)
						q = Error_with_pubkeys(s378, bj, bk, sd8, bl)
						f = ld64(s378)
						st64(j + 0x10, ld64(s378 + 8))
						st64(j + 8, f)
						st64(j, 0)
						return q
					}
					anchor_error_from(s338, 0x7d0 /* anchor::ConstraintMut */, bm, bn, bo)
					q = fn_4130(s348, ld64(s338), ld64(s338 + 8), "pool_state", 0xa)
					f = ld64(s348)
					st64(j + 0x10, ld64(s348 + 8))
					st64(j + 8, f)
					st64(j, 0)
					return q
				}
				alloc_handle_alloc_error(8, 0xd8)
			}
			alloc_handle_alloc_error(8, 0xd8)
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
		st64(j + 0x10, o)
		st64(j + 8, f)
		st64(j, 0)
		return q
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
	st64(j + 0x10, i)
	st64(j + 8, f)
	st64(j, 0)
	return q
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: AccountInfo, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value)
// types [heur]: b: CollectProtocolFeeContext (the handler ix_collect_protocol_fee passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_4d0a8(a: u64, b: CollectProtocolFeeContext, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s60 = fp - 0x60, s68 = fp - 0x68, s80 = fp - 0x80, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0
	let bz: u64
	const accounts: CollectProtocolFeeAccounts = b.accounts
	let an = fn_53e8(s60, ld64(accounts + 8), c, d, e, r0)
	let j = ld64(s60 + 0x10)
	let g = ld64(s60 + 8)
	if (ld64(s60) != 0) {
		st64(a + 8, j)
		st64(a, g)
		return an
	}
	const h = ld64(g + 0x135)
	st64(g + 0x135, h - min(h, d))
	const i = ld64(g + 0x12d)
	st64(g + 0x12d, i - min(i, c))
	st64(j, ld64(j) + 1)
	const k: AccountInfo = ld64(ld64(accounts + 0x88) + 0x20)
	const l: LamportsCell = k.lamports
	const r = k.key
	rc_inc(l)
	const m: DataCell = k.data
	rc_inc(m)
	const q = k.owner
	const p = k.rent_epoch
	const o = k.is_signer
	const n = k.is_writable
	st8(s98 + 2, k.executable)
	st8(s98, o, n)
	st64(sc0, r, l, m, q, p)
	const s: AccountInfo = accounts.recipient_token_account_0.info
	const t: LamportsCell = s.lamports
	const z = s.key
	rc_inc(t)
	const u: DataCell = s.data
	rc_inc(u)
	const y = s.owner
	const x = s.rent_epoch
	let ce = u
	const w = s.is_signer
	const v = s.is_writable
	st8(s68 + 2, s.executable)
	st8(s68, w, v)
	st64(s90, z, t, u, y, x)
	const aa = ld64(0x300000000 /* heap bump-allocator cursor */)
	let cb = t
	const ab = aa != 0 ? sat_sub(aa, 0x80) & -8 : 0x300007f80
	let cc = m
	let cd = l
	if (ab > 0x300000007) {
		const ac = ld64(accounts + 0x98)
		st64(0x300000000 /* heap bump-allocator cursor */, ab)
		const ad = ld64(ac + 0x58)
		memcpy(ab, ac, 0x58)
		st64(ab + 0x58, ad)
		copy(ab + 0x60, ac + 0x60, 0x20)
		const ae: AccountInfo = ld64(accounts + 0xc0)
		const af: LamportsCell = ae.lamports
		const ah = ld64(accounts + 0xb8)
		const am = ae.key
		rc_inc(af)
		const ag: DataCell = ae.data
		rc_inc(ag)
		const al = ae.owner
		const ak = ae.rent_epoch
		const aj = ae.is_signer
		const ai = ae.is_writable
		st8(s38 + 2, ae.executable)
		st8(s38, aj, ai)
		st64(s60, am, af, ag, al, ak)
		an = fn_7a038(sd0, accounts + 8, sc0, s90, ab, ah, s60, min(i, c), al)
		j = ld64(sd0 + 8)
		g = ld64(sd0)
		if (rc_release(cb)) {
			an = Rc_drop_slow_14df0(s88, an)
		}
		const ao = cc
		if (rc_release(ce)) {
			an = Rc_drop_slow_14df0(s80, an)
		}
		if (rc_release(cd)) {
			an = Rc_drop_slow_14df0(sb8, an)
		}
		if (rc_release(ao)) {
			an = Rc_drop_slow_14df0(sb0, an)
		}
		if (g != 2) {
			st64(a + 8, j)
			st64(a, g)
			return an
		}
		const ap: AccountInfo = ld64(ld64(accounts + 0x90) + 0x20)
		const aq: LamportsCell = ap.lamports
		const ax = ap.key
		rc_inc(aq)
		const ar: DataCell = ap.data
		rc_inc(ar)
		const aw = ap.owner
		const av = ap.rent_epoch
		const au = ap.is_signer
		const at = ap.is_writable
		st8(s98 + 2, ap.executable)
		st8(s98, au, at)
		st64(sc0, ax, aq, ar, aw, av)
		const ay: AccountInfo = accounts.recipient_token_account_1.info
		const az: LamportsCell = ay.lamports
		const bf = ay.key
		rc_inc(az)
		const ba: DataCell = ay.data
		rc_inc(ba)
		const be = ay.owner
		const bd = ay.rent_epoch
		const bc = ay.is_signer
		const bb = ay.is_writable
		st8(s68 + 2, ay.executable)
		st8(s68, bc, bb)
		st64(s90, bf, az, ba, be, bd)
		const bg = ld64(0x300000000 /* heap bump-allocator cursor */)
		ce = aq
		const bh = bg != 0 ? sat_sub(bg, 0x80) & -8 : 0x300007f80
		cc = az
		cd = ar
		if (bh > 0x300000007) {
			const vault_1_mint: Mint = accounts.vault_1_mint
			st64(0x300000000 /* heap bump-allocator cursor */, bh)
			const bj: AccountInfo = vault_1_mint.info
			memcpy(bh, vault_1_mint, 0x58)
			st64(bh + 0x58, bj)
			copy(bh + 0x60, vault_1_mint + 0x60, 0x20)
			const bk: AccountInfo = ld64(accounts + 0xc0)
			const bl: LamportsCell = bk.lamports
			const bn = ld64(accounts + 0xb8)
			const bs = bk.key
			rc_inc(bl)
			const bm: DataCell = bk.data
			rc_inc(bm)
			cb = ba
			const br = bk.owner
			const bq = bk.rent_epoch
			const bp = bk.is_signer
			const bo = bk.is_writable
			st8(s38 + 2, bk.executable)
			st8(s38, bp, bo)
			st64(s60, bs, bl, bm, br, bq)
			an = fn_7a038(se0, accounts + 8, sc0, s90, bh, bn, s60, min(h, d), br)
			j = ld64(se0 + 8)
			g = ld64(se0)
			if (rc_release(cc)) {
				an = Rc_drop_slow_14df0(s88, an)
			}
			const bt = ce
			if (rc_release(cb)) {
				an = Rc_drop_slow_14df0(s80, an)
			}
			if (rc_release(bt)) {
				an = Rc_drop_slow_14df0(sb8, an)
			}
			if (rc_release(cd)) {
				an = Rc_drop_slow_14df0(sb0, an)
			}
			if (g != 2) {
				st64(a + 8, j)
				st64(a, g)
				return an
			}
			const bu = ld64(ld64(accounts + 8))
			copyr(s60, bu, 0x20)
			const bv = accounts.recipient_token_account_0.info.key
			copyr(s40, bv, 0x20)
			const bw = accounts.recipient_token_account_1.info.key
			copyr(s20, bw, 0x20)
			const bx = ld64(0x300000000 /* heap bump-allocator cursor */)
			const by = bx != 0 ? sat_sub(bx, 0x100) : 0x300007f00
			if (by > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, by)
				st64(by, 0x3dd5292d4f1157ce /* event:CollectProtocolFeeEvent */)
				st64(by + 0x20, ld64(s60 + 0x18))
				st64(by + 0x18, ld64(s60 + 0x10))
				st64(by + 0x10, ld64(s60 + 8))
				st64(by + 8, ld64(s60))
				copy(by + 0x28, s40, 0x20)
				copy(by + 0x50, s18, 0x18)
				const ca = ld64(s20)
				st64(by + 0x70, min(h, d))
				st64(by + 0x68, min(i, c))
				st64(by + 0x48, ca)
				st64(s90, by, 0x78)
				an = log_data(s90, 1)
				st64(a + 8, j)
				st64(a, 2)
				return an
			}
			raw_vec_handle_error(1, 0x100, 0x100160b50, 0x100 > bx, bz)
		}
		alloc_handle_alloc_error(8, 0x80)
	}
	alloc_handle_alloc_error(8, 0x80)
}

function fn_c9aa0(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68
	let s, t, u, x, aa: u64
	let o = fn_a80(s28, ld64(b + 8), c)
	let f = ld64(s28)
	if (f != 2) {
		const v = ld64(0x300000000 /* heap bump-allocator cursor */)
		t = v != 0 ? sat_sub(v, 0xa) : 0x300007ff6
		u = ld64(s28 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > t) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > v)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, t)
			st64(t, 0x6174735f6c6f6f70)
			st16(t + 8, 0x6574)
			void ld64(u)
		} else {
			if (0x300000008 > t) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0xa > v)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, t)
			st64(t, 0x6174735f6c6f6f70)
			st16(t + 8, 0x6574)
			void ld64(u)
		}
		st64(u + 8, 0xa)
		st64(u, 1)
		st64(u + 0x18, 0xa)
		st64(u + 0x10, t)
		st64(a + 8, u)
		st64(a, f)
		return o
	}
	B41: {
		const g = ld64(b + 0x88)
		const h = ld64(g + 0x20)
		if ((memcmp(g, c, 0x20) as u32) == 0 && (common_is_closed(h) == 0 && ld64(ld64(h + 0x10) + 0x10) != 0)) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			o = fn_13e628(s38, s18)
			f = ld64(s38)
			if (f != 2) {
				const w = ld64(0x300000000 /* heap bump-allocator cursor */)
				x = 0xd > w
				t = w != 0 ? x != 0 ? 0 : w - 0xd : 0x300007ff3
				u = ld64(s38 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > t) {
						raw_vec_handle_error(1, 0xd, 0x10015f8f8, x, aa)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, t)
					st64(t + 5, 0x305f746c7561765f)
					st64(t, 0x61765f6e656b6f74)
					void ld64(u)
					break B41
				}
				if (0x300000008 > t) {
					raw_vec_handle_error(1, 0xd, 0x10015f8f8, x, aa)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, t)
				st64(t + 5, 0x305f746c7561765f)
				st64(t, 0x61765f6e656b6f74)
				void ld64(u)
				break B41
			}
		}
		const i = ld64(b + 0x90)
		const j = ld64(i + 0x20)
		if ((memcmp(i, c, 0x20) as u32) == 0 && (common_is_closed(j) == 0 && ld64(ld64(j + 0x10) + 0x10) != 0)) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			o = fn_13e628(s48, s18)
			f = ld64(s48)
			if (f != 2) {
				const y = ld64(0x300000000 /* heap bump-allocator cursor */)
				x = 0xd > y
				t = y != 0 ? x != 0 ? 0 : y - 0xd : 0x300007ff3
				u = ld64(s48 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > t) {
						raw_vec_handle_error(1, 0xd, 0x10015f8f8, x, aa)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, t)
					st64(t + 5, 0x315f746c7561765f)
					st64(t, 0x61765f6e656b6f74)
					void ld64(u)
					break B41
				}
				if (0x300000008 > t) {
					raw_vec_handle_error(1, 0xd, 0x10015f8f8, x, aa)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, t)
				st64(t + 5, 0x315f746c7561765f)
				st64(t, 0x61765f6e656b6f74)
				void ld64(u)
				break B41
			}
		}
		const k = ld64(b + 0xa8)
		const l = ld64(k + 0x20)
		if ((memcmp(k, c, 0x20) as u32) == 0 && (common_is_closed(l) == 0 && ld64(ld64(l + 0x10) + 0x10) != 0)) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			o = fn_13e628(s58, s18)
			s = undef
			f = ld64(s58)
			if (f != 2) {
				const z = ld64(0x300000000 /* heap bump-allocator cursor */)
				t = z != 0 ? sat_sub(z, 0x19) : 0x300007fe7
				u = ld64(s58 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > t) {
						raw_vec_handle_error(1, 0x19, 0x10015f8f8, 0x19 > z, s)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, t)
					st64(t + 0x10, 0x5f746e756f636361)
					st64(t + 8, 0x5f6e656b6f745f74)
					st64(t, 0x6e65697069636572)
					st8(t + 0x18, 0x30)
					void ld64(u)
				} else {
					if (0x300000008 > t) {
						raw_vec_handle_error(1, 0x19, 0x10015f8f8, 0x19 > z, s)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, t)
					st64(t + 0x10, 0x5f746e756f636361)
					st64(t + 8, 0x5f6e656b6f745f74)
					st64(t, 0x6e65697069636572)
					st8(t + 0x18, 0x30)
					void ld64(u)
				}
				st64(u + 8, 0x19)
				st64(u, 1)
				st64(u + 0x18, 0x19)
				st64(u + 0x10, t)
				st64(a + 8, u)
				st64(a, f)
				return o
			}
		}
		const m = ld64(b + 0xb0)
		const p = ld64(m + 0x20)
		const n = memcmp(m, c, 0x20)
		u = undef
		o = n as u32
		if (o != 0) {
			st64(a + 8, u)
			st64(a, 2)
			return o
		}
		o = common_is_closed(p)
		u = undef
		if (o != 0) {
			st64(a + 8, u)
			st64(a, 2)
			return o
		}
		if (ld64(ld64(p + 0x10) + 0x10) == 0) {
			st64(a + 8, u)
			st64(a, 2)
			return o
		}
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		o = fn_13e628(s68, s18)
		u = undef
		const q = ld64(s68)
		if (q == 2) {
			st64(a + 8, u)
			st64(a, 2)
			return o
		}
		const r = ld64(0x300000000 /* heap bump-allocator cursor */)
		s = 0x19 > r
		t = r != 0 ? s != 0 ? 0 : r - 0x19 : 0x300007fe7
		u = ld64(s68 + 8)
		if ((q & 1) != 0) {
			if (0x300000008 > t) {
				raw_vec_handle_error(1, 0x19, 0x10015f8f8, 0x300000008, s)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, t)
			st64(t + 0x10, 0x5f746e756f636361)
			st64(t + 8, 0x5f6e656b6f745f74)
			st64(t, 0x6e65697069636572)
			st8(t + 0x18, 0x31)
			void ld64(u)
		} else {
			if (0x300000008 > t) {
				raw_vec_handle_error(1, 0x19, 0x10015f8f8, 0x300000008, s)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, t)
			st64(t + 0x10, 0x5f746e756f636361)
			st64(t + 8, 0x5f6e656b6f745f74)
			st64(t, 0x6e65697069636572)
			st8(t + 0x18, 0x31)
			void ld64(u)
		}
		st64(u + 8, 0x19)
		st64(u, 1)
		st64(u + 0x18, 0x19)
		st64(u + 0x10, t)
		st64(a + 8, u)
		st64(a, q)
		return o
	}
	st64(u + 8, 0xd)
	st64(u, 1)
	st64(u + 0x18, 0xd)
	st64(u + 0x10, t)
	st64(a + 8, u)
	st64(a, f)
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

function log_data(a: u64, b: u64): u64 {
	return sol_log_data(a, b)
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

function fn_f5d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_154730(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622d0, 1, 8, 0, 0)
	// fmt "attempt to add with overflow"
	fn_14ec00(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14ce00(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14d4b8(a, b, c, d, e)
}

function fn_155738(a: u64, b: u64): u64 {
	return imp__fmt_155760(ld64(a), 1, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14d4b8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	custom_panic(a, b, c, d, e)
	abort()
}
