// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction settle_limit_order: handler + 52 reachable functions
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
interface SettleLimitOrderAccounts { // Accounts struct of instruction settle_limit_order as accounts_settle_limit_order returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	output_vault_mint: at<0x28, ref<Mint>> // Box<Account<Mint>>
}
interface SettleLimitOrderContext { // anchor_lang Context of instruction settle_limit_order (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<SettleLimitOrderAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_log_data(slices: u64, len: u64): void // log base64 data: slices = &[&[u8]]
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function try_accounts_120(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function fn_11e0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function fn_13d0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function try_accounts_1678(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::interface_account::InterfaceAccount<T> as anchor_lang::Accounts<B>…
declare function fn_7768(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses try_accounts_15c0, alloc_handle_alloc_error, memcpy
declare function fn_f128(a: u64): u64 // lib uses alloc_handle_alloc_error, Error__new
declare function AccountInfo_clone_f338(a: u64, b: u64): u64 // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function ptr_drop_in_place_fcd8(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<solana_account_info::AccountInfo>
declare function ptr_drop_in_place_fd78(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_account_info::AccountInfo; 4]>
declare function fn_15cc8(a: u64, b: u64): u64 // lib
declare function try_accounts_17a30(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function fn_103fe8(a: u64, b: u64, c: u64): u64 // lib uses __multi3_159030
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
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
declare function fn_14de10(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a formatting trait implementation return…"
declare function fmt_write(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::write
declare function imp__fmt_154cb0(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u8>::_fmt
declare function imp_fmt(a: u64, b: u64): u64 // lib core::fmt::num::imp::<impl core::fmt::Display for i32>::fmt
declare function imp__fmt_155760(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u64>::_fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function fn_1561f0(a: u64, b: u64): u64 // lib
declare function __udivti3(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __udivti3
declare function __multi3_159030(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __multi3

// instruction handler: settle_limit_order (discriminator sha256("global:settle_limit_order")[..8] = 0x601a695c21744ecd)
// accounts [idl]: 0 signer [signer], 1 pool_state, 2 tick_array, 3 limit_order [mut], 4 output_token_account [mut], 5 output_vault [mut], 6 output_vault_mint, 7 output_token_program
// args [idl]: (none)
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
function ix_settle_limit_order(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const sd8 = fp - 0xd8, se8 = fp - 0xe8, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200
	const f = sol_log("Instruction: SettleLimitOrder", 0x1d)
	st64(s1e0, accounts, accounts_len)
	let k = accounts_settle_limit_order(se8, undef, s1e0, undef, fp, f)
	const h = ld64(se8 + 8)
	let i = ld64(se8)
	const g = ld8(sd8 + 0xd4)
	if (g == 2) {
		st64(a + 8, h)
		st64(a, i)
		return k
	}
	const j = memcpy(s1c0, sd8, 0xd4)
	st16(s1c0 + 0xd5, ld16(sd8 + 0xd5))
	st8(s1c0 + 0xd7, ld8(sd8 + 0xd7))
	st8(s1c0 + 0xd4, g)
	st64(s1d0, i, h)
	copyr(sd8, s1e0, 0x10)
	st64(se8, program_id, s1d0)
	k = fn_547d0(s1f0, se8, j)
	i = ld64(s1f0)
	if (i == 2) {
		k = fn_ed178(s200, s1d0, program_id)
		i = ld64(s200)
		st64(a + 8, ld64(s200 + 8))
		st64(a, i)
		return k
	}
	st64(a + 8, ld64(s1f0 + 8))
	st64(a, i)
	return k
}

// Anchor Accounts::try_accounts of instruction settle_limit_order (called by ix_settle_limit_order; name [str]: from the handler's "Instruction: …" log; was fn_eb400)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: output_vault (ConstraintMut, ConstraintRaw), output_vault_mint (ConstraintAddress), output_token_program (ConstraintAddress), signer (ConstraintRaw), output_token_account (ConstraintMut), limit_order (ConstraintMut, ConstraintRaw), tick_array (ConstraintRaw)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: output_vault_mint_box, output_vault [idl]
function accounts_settle_limit_order(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const sc8 = fp - 0xc8, sd8 = fp - 0xd8, sf8 = fp - 0xf8, s118 = fp - 0x118, s138 = fp - 0x138, s158 = fp - 0x158, s170 = fp - 0x170, s190 = fp - 0x190, s1b0 = fp - 0x1b0, s238 = fp - 0x238, s250 = fp - 0x250, s2e0 = fp - 0x2e0, s2f8 = fp - 0x2f8, s300 = fp - 0x300, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4c0 = fp - 0x4c0, s4c8 = fp - 0x4c8, s4d0 = fp - 0x4d0, s4d8 = fp - 0x4d8, s4e0 = fp - 0x4e0
	let l, m, af, ag, ah, ak, al, aw, ay, az, ba, bo, bp: u64
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
				st64(s4c0 + 0x20, p)
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
					st8(j + 0xe4, 2)
					return p
				}
				st64(s4c0, o, s250, q, j)
				memcpy(s250, sc8, 0x9c)
				st16(s2e0 + 0x8c, ld16(sc8 + 0x9d))
				st8(s2e0 + 0x8e, ld8(sc8 + 0x9f))
				st64(s4d0, p)
				st64(s300, p)
				st64(s4c8, s)
				st64(s318 + 0x10, s)
				memcpy(s2f8, ld64(s4c0 + 8), 0x9c)
				st8(s2e0 + 0x84, ld64(s4c0 + 0x10))
				st16(s2e0 + 0x85, ld16(s2e0 + 0x8c))
				st8(s2e0 + 0x87, ld8(s2e0 + 0x8e))
				p = try_accounts_1678(sd8, c)
				if (ld32(sc8 + 0xa0) == 2) {
					const y = ld64(0x300000000 /* heap bump-allocator cursor */)
					const ac = ld64(s4c0 + 0x18)
					const z = ld64(sd8)
					const aa = y != 0 ? sat_sub(y, 0x14) : 0x300007fec
					const ab = ld64(sd8 + 8)
					if (z != 0) {
						if (0x300000008 > aa) {
							raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, ac)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, aa)
						st64(aa + 8, 0x6363615f6e656b6f)
						st64(aa, 0x745f74757074756f)
						st32(aa + 0x10, 0x746e756f)
						void ld64(ab)
					} else {
						if (0x300000008 > aa) {
							raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, ac)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, aa)
						st64(aa + 8, 0x6363615f6e656b6f)
						st64(aa, 0x745f74757074756f)
						st32(aa + 0x10, 0x746e756f)
						void ld64(ab)
					}
					st64(ab + 0x10, aa, 0x14)
					st64(ab + 8, 0x14)
					st64(ab, 1)
					st64(ac + 8, ab)
					st64(ac, z)
					st8(ac + 0xe4, 2)
					return p
				}
				const w = ld64(0x300000000 /* heap bump-allocator cursor */)
				j = ld64(s4c0 + 0x18)
				const x = w != 0 ? sat_sub(w, 0xd8) : 0x300007f28
				if (0x300000008 > x) {
					alloc_handle_alloc_error(8, 0xd8)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, x & -8)
				if ((x & -8) != 0) {
					memcpy(x & -8, sd8, 0xd8)
					try_accounts_1678(sd8, c)
					if (ld32(sc8 + 0xa0) == 2) {
						p = fn_4130(s318, ld64(sd8), ld64(sd8 + 8), "output_vault", 0xc)
						st64(s4c0 + 8, ld64(s318 + 8))
						f = ld64(s318)
						if (f != 2) {
							st64(j + 8, ld64(s4c0 + 8))
							st64(j, f)
							st8(j + 0xe4, 2)
							return p
						}
					} else {
						const ad = ld64(0x300000000 /* heap bump-allocator cursor */)
						const ae = ad != 0 ? sat_sub(ad, 0xd8) : 0x300007f28
						if (0x300000008 > ae) {
							alloc_handle_alloc_error(8, 0xd8)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ae & -8)
						if ((ae & -8) == 0) {
							alloc_handle_alloc_error(8, 0xd8)
						}
						st64(s4c0 + 8, ae & -8)
						memcpy(ae & -8, sd8, 0xd8)
					}
					fn_7768(sd8, c, af, ag, ah)
					let output_vault_mint_box: Mint = ld64(sd8 + 8)
					const ai = ld64(sd8)
					if (ai != 2) {
						p = fn_4130(s328, ai, output_vault_mint_box, "output_vault_mint", 0x11)
						output_vault_mint_box = ld64(s328 + 8)
						f = ld64(s328)
						if (f != 2) {
							st64(j + 8, output_vault_mint_box)
							st64(j, f)
							st8(j + 0xe4, 2)
							return p
						}
					}
					st64(s4d8, output_vault_mint_box)
					try_accounts_120(sd8, c, output_vault_mint_box, ak, al)
					output_vault_mint_box = ld64(sd8 + 8)
					const am = ld64(sd8)
					if (am != 2) {
						p = fn_4130(s338, am, output_vault_mint_box, "output_token_program", 0x14)
						output_vault_mint_box = ld64(s338 + 8)
						f = ld64(s338)
						if (f != 2) {
							st64(j + 8, output_vault_mint_box)
							st64(j, f)
							st8(j + 0xe4, 2)
							return p
						}
					}
					st64(s4e0, output_vault_mint_box)
					const an = ld64(i)
					copyr(s1b0, an, 0x20)
					let ao = memcmp(s1b0, s2e0, 0x20) as u32
					if (ao != 0) {
						copyr(sd8, an, 0x20)
						ao = memcmp(sd8, 0x1001595a0 /* key Ray8HHtixhL9zvnokMyELCVGp622PDPJj96zcVC9RWp */, 0x20) as u32
						if (ao != 0) {
							anchor_error_from(s348, 0x7d3 /* anchor::ConstraintRaw */)
							p = fn_4130(s358, ld64(s348), ld64(s348 + 8), 0x10015b341 /* "signer" */, 6)
							f = ld64(s358)
							st64(j + 8, ld64(s358 + 8))
							st64(j, f)
							st8(j + 0xe4, 2)
							return p
						}
					}
					p = fn_4bd8(sd8, ld64(s4c0 + 0x20), ao)
					o = ld64(sc8)
					f = ld64(sd8 + 8)
					if (ld64(sd8) != 0) {
						st64(j + 8, o)
						st64(j, f)
						st8(j + 0xe4, 2)
						return p
					}
					const ap = ld64(ld64(s4c0))
					copyr(s190, ap, 0x20)
					const aq = memcmp(f, s190, 0x20)
					st64(o, ld64(o) - 1)
					if ((aq as u32) == 0) {
						if (ld8(ld64(s4c8) + 0x29) != 0) {
							copyr(sd8, s190, 0x20)
							if ((memcmp(s300, sd8, 0x20) as u32) == 0) {
								if (ld8(ld64((x & -8) + 0x20) + 0x29) != 0) {
									copyr(sd8, s238, 0x20)
									if ((memcmp((x & -8) + 0x48, sd8, 0x20) as u32) != 0) {
										p = anchor_error_from(s3e8, 0x7df /* anchor::ConstraintTokenOwner */)
										f = ld64(s3e8)
										st64(j + 8, ld64(s3e8 + 8))
										st64(j, f)
										st8(j + 0xe4, 2)
										return p
									}
									const ar = ld64(s4c0 + 8)
									copyr(sd8, ar + 0x28, 0x20)
									const at = memcmp((x & -8) + 0x28, sd8, 0x20)
									if ((at as u32) == 0) {
										const output_vault: AccountInfo = ld64(ld64(s4c0 + 8) + 0x20)
										if (output_vault.is_writable != 0) {
											if ((ld64(s4c0 + 0x10) & 1) != 0) {
												const ax = output_vault.key
												copyr(sd8, ax, 0x20)
												p = fn_4dc0(s170, ld64(s4c0), at as u32)
												az = ld64(s170 + 0x10)
												aw = ld64(s170 + 8)
												if (ld64(s170) != 0) {
													ay = ld64(s4c0 + 0x18)
													st64(ay + 8, az)
													st64(ay, aw)
													st8(ay + 0xe4, 2)
													return p
												}
												ba = aw + 0xa1
											} else {
												const av = output_vault.key
												copyr(sd8, av, 0x20)
												p = fn_4dc0(s170, ld64(s4c0), at as u32)
												az = ld64(s170 + 0x10)
												aw = ld64(s170 + 8)
												if (ld64(s170) != 0) {
													ay = ld64(s4c0 + 0x18)
													st64(ay + 8, az)
													st64(ay, aw)
													st8(ay + 0xe4, 2)
													return p
												}
												ba = aw + 0x81
											}
											const bb = memcmp(sd8, ba, 0x20)
											st64(az, ld64(az) - 1)
											if ((bb as u32) == 0) {
												const bc = ld64(s4c0 + 8)
												const bd = ld64(ld64(s4d8) + 0x58)
												const be = ld64(bd)
												copyr(s158, be, 0x20)
												copy(s138, bc + 0x28, 0x20)
												if ((memcmp(s158, s138, 0x20) as u32) != 0) {
													anchor_error_from(s448, 0x7dc /* anchor::ConstraintAddress */)
													const bn = fn_4130(s458, ld64(s448), ld64(s448 + 8), "output_vault_mint", 0x11)
													const bm = ld64(s458 + 8)
													const bl = ld64(s458)
													copy(sd8, s158, 0x40)
													p = Error_with_pubkeys(s468, bl, bm, sd8, bn)
													bp = ld64(s468)
													bo = ld64(s4c0 + 0x18)
													st64(bo + 8, ld64(s468 + 8))
													st64(bo, bp)
													st8(bo + 0xe4, 2)
													return p
												}
												const bf = ld64(ld64(s4e0))
												copyr(s118, bf, 0x20)
												const bh = AccountInfo_clone_f338(sd8, bd)
												const bg = ld64(sc8 + 8)
												copy(sf8, bg, 0x20)
												ptr_drop_in_place_fcd8(sd8, bh)
												if ((memcmp(s118, sf8, 0x20) as u32) == 0) {
													const bq = ld64(s4c0 + 0x18)
													p = memcpy(bq + 0x48, s250, 0x9c)
													const bs = ld8(s2e0 + 0x8e)
													const br = ld16(s2e0 + 0x8c)
													st8(bq + 0xe4, ld64(s4c0 + 0x10))
													st64(bq + 0x40, ld64(s4d0))
													st64(bq + 0x38, ld64(s4c8))
													st64(bq + 0x30, ld64(s4e0))
													st64(bq + 0x28, ld64(s4d8))
													st64(bq + 0x20, ld64(s4c0 + 8))
													st64(bq + 0x18, x & -8)
													st64(bq + 0x10, ld64(s4c0 + 0x20))
													st64(bq + 8, ld64(s4c0))
													st64(bq, i)
													st16(bq + 0xe5, br)
													st8(bq + 0xe7, bs)
													return p
												}
												anchor_error_from(s478, 0x7dc /* anchor::ConstraintAddress */)
												const bk = fn_4130(s488, ld64(s478), ld64(s478 + 8), "output_token_program", 0x14)
												const bj = ld64(s488 + 8)
												const bi = ld64(s488)
												copy(sd8, s118, 0x40)
												p = Error_with_pubkeys(s498, bi, bj, sd8, bk)
												bp = ld64(s498)
												bo = ld64(s4c0 + 0x18)
												st64(bo + 8, ld64(s498 + 8))
												st64(bo, bp)
												st8(bo + 0xe4, 2)
												return p
											}
											anchor_error_from(s428, 0x7d3 /* anchor::ConstraintRaw */)
											p = fn_4130(s438, ld64(s428), ld64(s428 + 8), "output_vault", 0xc)
											bp = ld64(s438)
											bo = ld64(s4c0 + 0x18)
											st64(bo + 8, ld64(s438 + 8))
											st64(bo, bp)
											st8(bo + 0xe4, 2)
											return p
										}
										anchor_error_from(s408, 0x7d0 /* anchor::ConstraintMut */)
										p = fn_4130(s418, ld64(s408), ld64(s408 + 8), "output_vault", 0xc)
										bp = ld64(s418)
										bo = ld64(s4c0 + 0x18)
										st64(bo + 8, ld64(s418 + 8))
										st64(bo, bp)
										st8(bo + 0xe4, 2)
										return p
									}
									p = anchor_error_from(s3f8, 0x7de /* anchor::ConstraintTokenMint */)
									bp = ld64(s3f8)
									bo = ld64(s4c0 + 0x18)
									st64(bo + 8, ld64(s3f8 + 8))
									st64(bo, bp)
									st8(bo + 0xe4, 2)
									return p
								}
								anchor_error_from(s3c8, 0x7d0 /* anchor::ConstraintMut */)
								p = fn_4130(s3d8, ld64(s3c8), ld64(s3c8 + 8), "output_token_account", 0x14)
								f = ld64(s3d8)
								st64(j + 8, ld64(s3d8 + 8))
								st64(j, f)
								st8(j + 0xe4, 2)
								return p
							}
							anchor_error_from(s3a8, 0x7d3 /* anchor::ConstraintRaw */)
							p = fn_4130(s3b8, ld64(s3a8), ld64(s3a8 + 8), 0x10015b336 /* "limit_order" */, 0xb)
							f = ld64(s3b8)
							st64(j + 8, ld64(s3b8 + 8))
							st64(j, f)
							st8(j + 0xe4, 2)
							return p
						}
						anchor_error_from(s388, 0x7d0 /* anchor::ConstraintMut */)
						p = fn_4130(s398, ld64(s388), ld64(s388 + 8), 0x10015b336 /* "limit_order" */, 0xb)
						f = ld64(s398)
						st64(j + 8, ld64(s398 + 8))
						st64(j, f)
						st8(j + 0xe4, 2)
						return p
					}
					anchor_error_from(s368, 0x7d3 /* anchor::ConstraintRaw */)
					p = fn_4130(s378, ld64(s368), ld64(s368 + 8), 0x10015a23e /* "tick_array" */, 0xa)
					f = ld64(s378)
					st64(j + 8, ld64(s378 + 8))
					st64(j, f)
					st8(j + 0xe4, 2)
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
			st8(j + 0xe4, 2)
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
		st8(j + 0xe4, 2)
		return p
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 6) : 0x300007ffa
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 6, 0x10015f8f8, sat_sub(g, 6), 6 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st16(h + 4, 0x7265)
		st32(h, 0x6e676973)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 6, 0x10015f8f8, sat_sub(g, 6), 6 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st16(h + 4, 0x7265)
		st32(h, 0x6e676973)
		void ld64(i)
	}
	st64(i + 0x10, h, 6)
	st64(i + 8, 6)
	st64(i, 1)
	st64(j + 8, i)
	st64(j, f)
	st8(j + 0xe4, 2)
	return p
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: AccountInfo, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// types [heur]: b: SettleLimitOrderContext (the handler ix_settle_limit_order passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_547d0(a: u64, b: SettleLimitOrderContext, r0: u64): u64 {
	const s1 = fp - 0x1, s68 = fp - 0x68, s78 = fp - 0x78, sa8 = fp - 0xa8, sd8 = fp - 0xd8, s108 = fp - 0x108, s138 = fp - 0x138, s148 = fp - 0x148, s160 = fp - 0x160, s168 = fp - 0x168, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s268 = fp - 0x268, s270 = fp - 0x270, s278 = fp - 0x278, s290 = fp - 0x290, s298 = fp - 0x298, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0
	let m: u64
	let g = a
	const accounts: SettleLimitOrderAccounts = b.accounts
	let i = fn_4dc0(s2b0, ld64(accounts + 8), r0)
	let h = ld64(s2b0 + 0x10)
	if (ld64(s2b0) != 0) {
		m = ld64(s2b0 + 8)
		st64(g + 8, h)
		st64(g, m)
		return i
	}
	const aa = g
	const l = ld16(ld64(s2b0 + 8) + 0xe3)
	st64(h, ld64(h) - 1)
	const k = ld32(accounts + 0xe0)
	i = fn_4bd8(s2b0, ld64(accounts + 0x10), i)
	h = ld64(s2b0 + 0x10)
	if (ld64(s2b0) != 0) {
		m = ld64(s2b0 + 8)
		st64(aa + 8, h)
		st64(aa, m)
		return i
	}
	const z = h
	const j = ld64(s2b0 + 8)
	i = fn_71a20(s2b0, ld32(j + 0x20), k, l)
	m = ld64(s2b0)
	if (m != 2) {
		h = ld64(s2b0 + 8)
		st64(z, ld64(z) - 1)
		st64(aa + 8, h)
		st64(aa, m)
		return i
	}
	const n = ld64(s2b0 + 8)
	if (0x3c > n) {
		i = fn_668d8(s2b0, accounts + 0x40, j + n * 0xa8 + 0x24, i)
		h = ld64(s2b0 + 8)
		m = ld64(s2b0)
		if (m != 2) {
			st64(z, ld64(z) - 1)
			st64(aa + 8, h)
			st64(aa, m)
			return i
		}
		i = fn_667d0(s2b0, accounts + 0x40)
		const o = ld64(s2b0 + 8)
		m = ld64(s2b0)
		if (m == 2) {
			if (o != 0 && h == 0) {
				ErrorCode_name(sa8, 0x100159900)
				st64(s68, 0, 1, 0)
				st64(s148, s68, 0x10015f818)
				st8(s138 + 8, 3)
				st64(s138, 0x20)
				st64(s160 + 8, 0)
				st64(s168, 0)
				const p = ErrorCode_fmt(0x100159900, s168)
				g = aa
				if (p != 0) {
					fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
				}
				copyr(s278, s68, 0x18)
				copy(s290, sa8, 0x18)
				st64(s2b0 + 8, 0x10015a2ca)
				st32(s268 + 0x50, 0x9c9 /* anchor::RequireGtViolated */)
				st8(s268 + 8, 2)
				st32(s298, 0x43)
				st64(s2b0 + 0x10, 0x3f)
				st64(s2b0, 0)
				fn_13e5a0(s2d0, s2b0)
				i = fn_36a0(s2e0, ld64(s2d0), ld64(s2d0 + 8), 0)
				h = ld64(s2e0 + 8)
				m = ld64(s2e0)
				st64(z, ld64(z) - 1)
				st64(g + 8, h)
				st64(g, m)
				return i
			}
			const q = ld64(ld64(accounts + 8))
			copyr(s2b0, q, 0x20)
			const r = ld64(ld64(accounts + 0x38))
			copyr(s290, r, 0x20)
			const u = ld64(accounts + 0x88)
			const t = ld64(accounts + 0x90)
			const s = ld8(accounts + 0xe4)
			st32(s268 + 0x10, ld32(accounts + 0xe0))
			st8(s268 + 0x14, s)
			st64(s270, u, t, h)
			fn_10d5f8(s168, s2b0)
			copyr(s68, s160, 0x10)
			log_data(s68, 1)
			AccountInfo_clone_f338(s198, ld64(accounts + 0x30))
			AccountInfo_clone_f338(s168, ld64(ld64(accounts + 0x20) + 0x20))
			AccountInfo_clone_f338(sa8, ld64(ld64(accounts + 0x18) + 0x20))
			AccountInfo_clone_f338(s68, ld64(accounts + 8))
			AccountInfo_clone_f338(s138, accounts.output_vault_mint.info)
			memcpy(s108, sa8, 0x30)
			const v = memcpy(sd8, s68, 0x30)
			const w = fn_4dc0(sa8, ld64(accounts + 8), v)
			const x = ld64(sa8 + 0x10)
			m = ld64(sa8 + 8)
			if (ld64(sa8) != 0) {
				i = ptr_drop_in_place_fcd8(s198, ptr_drop_in_place_fd78(s168, w))
				st64(z, ld64(z) - 1)
				st64(aa + 8, x)
				st64(aa, m)
				return i
			}
			const y = ld16(m + 0x17f)
			st64(s78, s68, 6, 0x10015984c, 4, m + 1, 0x20, m + 0x41, 0x20, m + 0x61, 0x20, y != 0 ? m + 0x17f : 1, (y != 0) << 1, m, 1)
			memcpy(s268, s168, 0xc0)
			st64(s2b0, 0, 8, 0)
			memcpy(s298, s198, 0x30)
			st64(s1a8, s78, 1)
			i = token_2022_transfer_checked(s2c0, s2b0, h, accounts.output_vault_mint.decimals)
			h = ld64(s2c0 + 8)
			m = ld64(s2c0)
			st64(x, ld64(x) - 1)
			if (m == 2) {
				st64(z, ld64(z) - 1)
				st64(aa + 8, h)
				st64(aa, 2)
				return i
			}
			st64(z, ld64(z) - 1)
			st64(aa + 8, h)
			st64(aa, m)
			return i
		}
		st64(z, ld64(z) - 1)
		st64(aa + 8, o)
		st64(aa, m)
		return i
	}
	fn_14ec98(n, 0x3c, 0x1001602f0)
}

function fn_ed178(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let n, o: u64
	let k = fn_af28(s28, b + 0x38, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
	let f = ld64(s28)
	if (f != 2) {
		const p = ld64(0x300000000 /* heap bump-allocator cursor */)
		n = p != 0 ? sat_sub(p, 0xb) : 0x300007ff5
		o = ld64(s28 + 8)
		if ((f & 1) != 0) {
			if (0x300000008 > n) {
				raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, 0xb > p)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, n)
			st64(n, 0x726f5f74696d696c)
			st32(n + 7, 0x72656472)
			void ld64(o)
		} else {
			if (0x300000008 > n) {
				raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, 0xb > p)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, n)
			st64(n, 0x726f5f74696d696c)
			st32(n + 7, 0x72656472)
			void ld64(o)
		}
		st64(o + 8, 0xb)
		st64(o, 1)
		st64(o + 0x18, 0xb)
		st64(o + 0x10, n)
		st64(a + 8, o)
		st64(a, f)
		return k
	}
	const g = ld64(b + 0x18)
	const h = ld64(g + 0x20)
	if ((memcmp(g, c, 0x20) as u32) == 0 && (common_is_closed(h) == 0 && ld64(ld64(h + 0x10) + 0x10) != 0)) {
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		k = fn_13e628(s38, s18)
		f = ld64(s38)
		if (f != 2) {
			const q = ld64(0x300000000 /* heap bump-allocator cursor */)
			n = q != 0 ? sat_sub(q, 0x14) : 0x300007fec
			o = ld64(s38 + 8)
			if ((f & 1) != 0) {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > q)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6363615f6e656b6f)
				st64(n, 0x745f74757074756f)
				st32(n + 0x10, 0x746e756f)
				void ld64(o)
			} else {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > q)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6363615f6e656b6f)
				st64(n, 0x745f74757074756f)
				st32(n + 0x10, 0x746e756f)
				void ld64(o)
			}
			st64(o + 8, 0x14)
			st64(o, 1)
			st64(o + 0x18, 0x14)
			st64(o + 0x10, n)
			st64(a + 8, o)
			st64(a, f)
			return k
		}
	}
	const i = ld64(b + 0x20)
	const l = ld64(i + 0x20)
	const j = memcmp(i, c, 0x20)
	o = undef
	k = j as u32
	if (k != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return k
	}
	k = common_is_closed(l)
	o = undef
	if (k != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return k
	}
	if (ld64(ld64(l + 0x10) + 0x10) == 0) {
		st64(a + 8, o)
		st64(a, 2)
		return k
	}
	st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
	k = fn_13e628(s48, s18)
	o = undef
	f = ld64(s48)
	if (f == 2) {
		st64(a + 8, o)
		st64(a, 2)
		return k
	}
	const m = ld64(0x300000000 /* heap bump-allocator cursor */)
	n = m != 0 ? sat_sub(m, 0xc) : 0x300007ff4
	o = ld64(s48 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > n) {
			raw_vec_handle_error(1, 0xc, 0x10015f8f8, 0x300000008, 0xc > m)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, n)
		st64(n, 0x765f74757074756f)
		st32(n + 8, 0x746c7561)
		void ld64(o)
	} else {
		if (0x300000008 > n) {
			raw_vec_handle_error(1, 0xc, 0x10015f8f8, 0x300000008, 0xc > m)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, n)
		st64(n, 0x765f74757074756f)
		st32(n + 8, 0x746c7561)
		void ld64(o)
	}
	st64(o + 8, 0xc)
	st64(o, 1)
	st64(o + 0x18, 0xc)
	st64(o + 0x10, n)
	st64(a + 8, o)
	st64(a, f)
	return k
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

function fn_36a0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sa8 = fp - 0xa8, sd8 = fp - 0xd8, sdf = fp - 0xdf, s10f = fp - 0x10f, s116 = fp - 0x116, s120 = fp - 0x120, s128 = fp - 0x128
	let f, g: u64
	st64(s128, d)
	st32(s120, 0)
	if ((b & 1) != 0) {
		st64(sa8, 0, 1, 0)
		st64(s28, sa8, 0x10015f818)
		st8(s28 + 0x18, 3)
		st64(s28 + 0x10, 0x20)
		st64(s48 + 0x10, 0)
		st64(s48, 0)
		if (fn_155738(s128, s48) == 0) {
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
	if (fn_155738(s128, s48) == 0) {
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

function fn_10d5f8(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000007 >= g) {
		raw_vec_handle_error(1, 0x100, 0x100160a48, 0x300000007, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0xc20a7c7da44d7758 /* event:SettleLimitOrderEvent */)
	st64(g + 0x20, ld64(b + 0x18))
	st64(g + 0x18, ld64(b + 0x10))
	st64(g + 0x10, ld64(b + 8))
	st64(g + 8, ld64(b))
	copy(g + 0x28, b + 0x20, 0x20)
	st8(g + 0x48, ld8(b + 0x5c))
	st32(g + 0x49, ld32(b + 0x58))
	copy(g + 0x4d, b + 0x40, 0x18)
	st64(a + 8, g, 0x65 /* anchor::InstructionFallbackNotFound */)
	st64(a, 0x100)
}

function log_data(a: u64, b: u64): u64 {
	return sol_log_data(a, b)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_1548e8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x100162588, 1, 8, 0, 0)
	// fmt "attempt to divide by zero"
	fn_14ec00(s30, a, c, d, e)
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

function fn_72df0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148
	let h: u64
	let i = fn_644c8(s118, c, r0)
	let g = ld64(s118 + 8)
	if (ld64(s118) != 1) {
		i = fn_660f8(s48, g, ld64(s118 + 0x10), d ^ 1)
		const f = ld64(s48 + 0x10)
		g = ld64(s48 + 8)
		if ((ld64(s48) & 1) != 0) {
			st64(a + 8, f)
			st64(a, g)
			return i
		}
		st64(s128, g, f)
		if (d != 0) {
			st64(s60, b, 0)
			st64(s48, 0, 1)
			i = fn_584f8(s118, s60, s128, s48)
			if (ld64(s118) == 0) {
				i = fn_88360(s138, 0x26)
				h = ld64(s138)
				st64(a + 8, ld64(s138 + 8))
				st64(a, h)
				return i
			}
		} else {
			st64(s60, b, 0)
			st64(s48, 0, 1)
			i = fn_584f8(s118, s60, s48, s128)
			if (ld64(s118) == 0) {
				i = fn_88360(s138, 0x26)
				h = ld64(s138)
				st64(a + 8, ld64(s138 + 8))
				st64(a, h)
				return i
			}
		}
		if (ld64(s118 + 0x10) == 0) {
			st64(a + 8, ld64(s118 + 8))
			st64(a, 2)
			return i
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
		st64(s118 + 8, 0x10015a7af)
		st32(sf8 + 0x78, 0x1796 /* error::CalculateOverflow */)
		st8(sf8 + 0x30, 2)
		st32(s118 + 0x18, 0x1a1)
		st64(s118 + 0x10, 0x25)
		st64(s118, 0)
		i = fn_13e5a0(s148, s118)
		h = ld64(s148)
		st64(a + 8, ld64(s148 + 8))
		st64(a, h)
		return i
	}
	st64(a + 8, ld64(s118 + 0x10))
	st64(a, g)
	return i
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

function fn_f5d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14ce00(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14d4b8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), e (value)
function fn_153150(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155a68(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_154730(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622d0, 1, 8, 0, 0)
	// fmt "attempt to add with overflow"
	fn_14ec00(s30, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_154890(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x100162310, 1, 8, 0, 0)
	// fmt "attempt to shift left with overflow"
	fn_14ec00(s30, a, c, d, e)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (points to it)
function fn_10caa8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s31 = fp - 0x31, s40 = fp - 0x40, s58 = fp - 0x58, s59 = fp - 0x59, s78 = fp - 0x78, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8
	let g, o, x, y, z: u64
	const f = ld64(b + 8)
	if (8 > f) {
		fn_153150(8, f, 0x100160a00, d, e)
	}
	B21: {
		B20: {
			g = ld64(b)
			if (f - 8 >= 0x20) {
				const h = ld64(g + 0xe)
				st8(s40 + 8, ld8(g + 0x16))
				st32(s98 + 0x18, ld32(g + 8))
				st16(s98 + 0x1c, ld16(g + 0xc))
				st64(s40, h)
				const k = ld64(s40 + 1)
				copy(s98, g + 0x17, 0x10)
				st8(s98 + 0x10, ld8(g + 0x27))
				if ((f - 8 & -0x20) != 0x20) {
					const i = ld64(g + 0x2e)
					st8(s40 + 8, ld8(g + 0x36))
					st32(s78 + 0x18, ld32(g + 0x28))
					st16(s78 + 0x1c, ld16(g + 0x2c))
					st64(s40, i)
					const p = ld64(s40 + 1)
					copy(s78, g + 0x37, 0x10)
					st8(s78 + 0x10, ld8(g + 0x47))
					if ((f - 8 & -4) != 0x40) {
						const j = ld32(g + 0x48)
						st64(sa8 + 8, f - 0x4c)
						if (f == 0x4c) {
							const n = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
							o = n
							st64(sa8, g + 0x4c)
						} else {
							let ae = 0
							const l = ld8(g + 0x4c)
							st64(sa8, g + 0x4d, f - 0x4d)
							st8(s59, l)
							if (l != 0) {
								if (l != 1) {
									st64(s40, 0x10015f910)
									st64(s31 + 1, s10)
									st64(s10, s59, fn_154c88)
									st64(s31 + 0x11, 0)
									st64(s40 + 8, 1)
									st64(s31 + 9, 1)
									// fmt "Invalid bool representation: {}" {} = l [fn_154c88]
									fn_14de10(s58, s40, f - 0x4d, l, i)
									const m = fn_f128(s58)
									o = m
									st64(s58, o)
									break B21
								}
								ae = 1
							}
							if (8 > f - 0x4d) {
								break B20
							}
							if (8 > f - 0x55) {
								break B20
							}
							if (8 > f - 0x5d) {
								break B20
							}
							if (8 > f - 0x65) {
								break B20
							}
							if (8 > f - 0x6d) {
								break B20
							}
							if (8 > f - 0x75) {
								break B20
							}
							if (0x10 > f - 0x7d) {
								break B20
							}
							const am = ld64(g + 0x4d)
							const al = ld64(g + 0x55)
							const ak = ld64(g + 0x5d)
							const aj = ld64(g + 0x65)
							const ai = ld64(g + 0x6d)
							const ah = ld64(g + 0x75)
							const af = ld64(g + 0x85)
							const ag = ld64(g + 0x7d)
							st64(sa8, g + 0x8d, f - 0x8d)
							fn_166b8(s40, sa8)
							o = ld64(s40 + 8)
							if (ld64(s40) == 0) {
								st64(a + 0x98, ld64(s31 + 0x11))
								st64(a + 0x90, ld64(s31 + 9))
								st64(a + 0x88, ld64(s31 + 1))
								st32(s58, ld32(s98 + 0x18))
								st16(s58 + 4, ld16(s98 + 0x1c))
								st8(s31 + 0x10, ld8(s98 + 0x10))
								copyr(s31, s98, 0x10)
								st32(s31 + 0x11, ld32(s78 + 0x18))
								st16(s31 + 0x15, ld16(s78 + 0x1c))
								st8(a + 0x3f, ld8(s78 + 0x10))
								st64(a + 0x37, ld64(s78 + 8))
								st64(a + 0x2f, ld64(s78))
								st8(s58 + 6, h)
								st64(s58 + 7, k)
								st64(s40 + 7, k)
								st64(s40, ld64(s58))
								const v = ld64(s40)
								const u = ld64(s40 + 8)
								const t = ld64(s31 + 1)
								const s = ld64(s31 + 9)
								const r = ld64(s31 + 0xf)
								st64(a + 0x78, af)
								st64(a + 0x70, ag)
								st64(a + 0x1e, r)
								st64(a + 0x18, s)
								st64(a + 0x10, t)
								st64(a + 8, u)
								st64(a, v)
								st32(a + 0xa0, j)
								st64(a + 0x80, o)
								st64(a + 0x68, ah)
								st64(a + 0x60, ai)
								st64(a + 0x58, aj)
								st64(a + 0x50, ak)
								st64(a + 0x48, al)
								st64(a + 0x40, am)
								st64(a + 0x27, p)
								st8(a + 0x26, i)
								st8(a + 0xa4, ae)
								return ag
							}
						}
						st64(s58, o)
						break B21
					}
				}
			}
		}
		const w = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		o = w
		st64(sa8, g + f)
		st64(s58, w)
		st64(sa8 + 8, 0)
	}
	let q = anchor_error_from(sb8, 0xbbb /* anchor::AccountDidNotDeserialize */, x, y, z)
	const ac = ld64(sb8 + 8)
	const ad = ld64(sb8)
	const aa = o
	if (2 > (o & 3) - 2) {
		st64(a + 8, ac)
		st64(a, ad)
		st8(a + 0xa4, 2)
		return q
	}
	if ((aa & 3) == 0) {
		st64(a + 8, ac)
		st64(a, ad)
		st8(a + 0xa4, 2)
		return q
	}
	const ab = ld64(ld64(o + 7))
	if (ab == 0) {
		st64(a + 8, ac)
		st64(a, ad)
		st8(a + 0xa4, 2)
		return q
	}
	q = callx(ab, ld64(o - 1), ab)
	st64(a + 8, ac)
	st64(a, ad)
	st8(a + 0xa4, 2)
	return q
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14d4b8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	custom_panic(a, b, c, d, e)
	abort()
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

function fn_154c88(a: u64, b: u64): u64 {
	return imp__fmt_154cb0(ld8(a), 1, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (points to it)
function fn_166b8(a: u64, b: u64) {
	let n: u64
	const g = ld64(b)
	const f = ld64(b + 8)
	let h = f
	let m = g
	if (8 > f) {
		n = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		st64(b, m + h, 0)
		st64(a + 8, n)
		st64(a, 1)
	} else {
		m = g + 8
		h = f - 8
		if (8 > h) {
			n = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
			st64(b, m + h, 0)
			st64(a + 8, n)
			st64(a, 1)
		} else {
			m = g + 0x10
			h = f - 0x10
			if (8 > h) {
				n = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
				st64(b, m + h, 0)
				st64(a + 8, n)
				st64(a, 1)
			} else {
				m = g + 0x18
				h = f - 0x18
				if (8 > h) {
					n = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
					st64(b, m + h, 0)
					st64(a + 8, n)
					st64(a, 1)
				} else {
					const l = ld64(g)
					const k = ld64(g + 8)
					const j = ld64(g + 0x10)
					const i = ld64(g + 0x18)
					st64(b + 8, f - 0x20)
					st64(b, g + 0x20)
					st64(a + 0x20, i)
					st64(a + 0x18, j)
					st64(a + 0x10, k)
					st64(a + 8, l)
					st64(a, 0)
				}
			}
		}
	}
}
