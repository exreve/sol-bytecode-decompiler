// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction collect_remaining_rewards: handler + 36 reachable functions
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
interface CollectRemainingRewardsArgs extends sized<0x01> { // arguments of instruction collect_remaining_rewards (Anchor IDL, Borsh layout; after the 8-byte discriminator)
	reward_index: at<0x00, u8>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function fn_11e0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from
declare function try_accounts_15c0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_1678(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::interface_account::InterfaceAccount<T> as anchor_lang::Accounts<B>…
declare function fn_1730(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a Display implementation returned an err…"
declare function ptr_drop_in_place_fd78(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_account_info::AccountInfo; 4]>
declare function Rc_drop_slow_14df0(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function try_accounts_17a30(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function fn_18cf0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp, Error_with_pubkeys
declare function try_accounts_19190(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_193e0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from, memcmp, Error_with_pubkeys
declare function fn_103fe8(a: u64, b: u64, c: u64): u64 // lib uses __multi3_159030
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function token_transfer(a: u64, b: u64, c: u64): u64 // lib anchor_spl::token::transfer
declare function token_2022_transfer_checked(a: u64, b: u64, c: u64, d: u64): u64 // lib anchor_spl::token_2022::transfer_checked
declare function Error_new_13c880(): u64 // lib std::io::error::Error::new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function Error_with_pubkeys(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib anchor_lang::error::Error::with_pubkeys
declare function ErrorCode_name(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib anchor_lang::error::ErrorCode::name
declare function ErrorCode_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::error::ErrorCode as core::fmt::Display>::fmt
declare function clock_get(a: u64): u64 // lib solana_sysvar::clock::<impl solana_sysvar::Sysvar for solana_clock::Clock>::get
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function de_unexpected_eof_to_unexpected_length_of_input(a: u64): u64 // lib borsh::de::unexpected_eof_to_unexpected_length_of_input
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fmt_write(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::write
declare function imp__fmt_155760(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u64>::_fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function __udivti3(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __udivti3
declare function __multi3_159030(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __multi3

// instruction handler: collect_remaining_rewards (discriminator sha256("global:collect_remaining_rewards")[..8] = 0x90d51022c5a6ed12)
// accounts [idl]: 0 reward_funder [signer], 1 funder_token_account [mut], 2 pool_state [mut], 3 reward_token_vault [mut], 4 reward_vault_mint, 5 token_program [= TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA], 6 token_program_2022 [= TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb], 7 memo_program [= MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr]
// args [idl]: reward_index: u8
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args_len
// names [idl: argument names and layout; which variable holds the instruction data is inferred]: args, reward_index
function ix_collect_remaining_rewards(a: u64, program_id: u64, accounts: u64, accounts_len: u64, args: CollectRemainingRewardsArgs, ix_args_len: u64): u64 {
	const s28 = fp - 0x28, s30 = fp - 0x30, s40 = fp - 0x40, s68 = fp - 0x68, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0, sb0 = fp - 0xb0, sc0 = fp - 0xc0
	let i, m: u64
	const f = sol_log("Instruction: CollectRemainingRewards", 0x24)
	if (ix_args_len == 0) {
		const k = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		if (2 > (k & 3) - 2) {
			m = anchor_error_from(sc0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			i = ld64(sc0)
			st64(a + 8, ld64(sc0 + 8))
			st64(a, i)
			return m
		}
		if ((k & 3) == 0) {
			m = anchor_error_from(sc0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			i = ld64(sc0)
			st64(a + 8, ld64(sc0 + 8))
			st64(a, i)
			return m
		}
		const l = ld64(ld64(k + 7))
		if (l == 0) {
			m = anchor_error_from(sc0, 0x66 /* anchor::InstructionDidNotDeserialize */)
			i = ld64(sc0)
			st64(a + 8, ld64(sc0 + 8))
			st64(a, i)
			return m
		}
		callx(l, ld64(k - 1), l)
		m = anchor_error_from(sc0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		i = ld64(sc0)
		st64(a + 8, ld64(sc0 + 8))
		st64(a, i)
		return m
	}
	const reward_index = args.reward_index
	st64(s90, accounts, accounts_len)
	m = accounts_collect_remaining_rewards(s40, undef, s90, undef, fp, f)
	const h = ld64(s30)
	i = ld64(s40 + 8)
	const g = ld64(s40)
	if (g == 0) {
		st64(a + 8, h)
		st64(a, i)
		return m
	}
	copyr(s68, s28, 0x28)
	st64(s80, g, i, h)
	copyr(s30, s90, 0x10)
	st64(s40, program_id, s80)
	m = fn_49b88(sa0, s40, reward_index)
	i = ld64(sa0)
	if (i == 2) {
		m = fn_c1ac0(sb0, s80, program_id)
		i = ld64(sb0)
		st64(a + 8, ld64(sb0 + 8))
		st64(a, i)
		return m
	}
	st64(a + 8, ld64(sa0 + 8))
	st64(a, i)
	return m
}

// Anchor Accounts::try_accounts of instruction collect_remaining_rewards (called by ix_collect_remaining_rewards; name [str]: from the handler's "Instruction: …" log; was fn_c05e0)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_program (ConstraintAddress), token_program_2022, memo_program, reward_vault_mint (ConstraintAddress), reward_token_vault (ConstraintMut), pool_state (ConstraintMut), funder_token_account (ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: pool_state [idl]
function accounts_collect_remaining_rewards(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const sb8 = fp - 0xb8, sd8 = fp - 0xd8, sf8 = fp - 0xf8, s118 = fp - 0x118, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s230 = fp - 0x230, s238 = fp - 0x238, s240 = fp - 0x240, s248 = fp - 0x248, s250 = fp - 0x250, s258 = fp - 0x258
	let n, aa, ab, ad, ae, ag, ah: u64
	let pool_state: AccountInfo
	let q = try_accounts_17a30(sd8, c, c, d, e, r0)
	const i = ld64(sd8 + 8)
	let f = ld64(sd8)
	if (f == 2) {
		q = try_accounts_1678(sd8, c)
		if (ld32(sb8 + 0x90) == 2) {
			const l = ld64(0x300000000 /* heap bump-allocator cursor */)
			f = ld64(sd8)
			const m = l != 0 ? sat_sub(l, 0x14) : 0x300007fec
			n = ld64(sd8 + 8)
			if (f != 0) {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m + 8, 0x6363615f6e656b6f)
				st64(m, 0x745f7265646e7566)
				st32(m + 0x10, 0x746e756f)
				void ld64(n)
			} else {
				if (0x300000008 > m) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(m + 8, 0x6363615f6e656b6f)
				st64(m, 0x745f7265646e7566)
				st32(m + 0x10, 0x746e756f)
				void ld64(n)
			}
			st64(n + 0x10, m, 0x14)
			st64(n + 8, 0x14)
			st64(n, 1)
			st64(a + 0x10, n)
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
			memcpy(k & -8, sd8, 0xd8)
			fn_11e0(sd8, c)
			q = ld64(sd8 + 8)
			f = ld64(sd8)
			if (f == 2) {
				st64(s230, q)
				q = try_accounts_1678(sd8, c)
				if (ld32(sb8 + 0x90) == 2) {
					const t = ld64(0x300000000 /* heap bump-allocator cursor */)
					f = ld64(sd8)
					const u = t != 0 ? sat_sub(t, 0x12) : 0x300007fee
					n = ld64(sd8 + 8)
					if (f != 0) {
						if (0x300000008 > u) {
							raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, u)
						st64(u + 8, 0x7561765f6e656b6f)
						st64(u, 0x745f647261776572)
						st16(u + 0x10, 0x746c)
						void ld64(n)
					} else {
						if (0x300000008 > u) {
							raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, u)
						st64(u + 8, 0x7561765f6e656b6f)
						st64(u, 0x745f647261776572)
						st16(u + 0x10, 0x746c)
						void ld64(n)
					}
					st64(n + 0x10, u, 0x12)
					st64(n + 8, 0x12)
					st64(n, 1)
					st64(a + 0x10, n)
					st64(a + 8, f)
					st64(a, 0)
					return q
				}
				const r = ld64(0x300000000 /* heap bump-allocator cursor */)
				const s = r != 0 ? sat_sub(r, 0xd8) : 0x300007f28
				if (0x300000008 > s) {
					alloc_handle_alloc_error(8, 0xd8)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, s & -8)
				if ((s & -8) != 0) {
					st64(s238, s & -8)
					memcpy(s & -8, sd8, 0xd8)
					q = try_accounts_15c0(sd8, c)
					if (ld32(sd8) == 2) {
						const x = ld64(0x300000000 /* heap bump-allocator cursor */)
						f = ld64(sd8 + 8)
						const y = x != 0 ? sat_sub(x, 0x11) : 0x300007fef
						n = ld64(sd8 + 0x10)
						if (f != 0) {
							if (0x300000008 > y) {
								raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, y)
							st64(y + 8, 0x6e696d5f746c7561)
							st64(y, 0x765f647261776572)
							st8(y + 0x10, 0x74)
							void ld64(n)
						} else {
							if (0x300000008 > y) {
								raw_vec_handle_error(1, 0x11, 0x10015f8f8, 0x300000008)
							}
							st64(0x300000000 /* heap bump-allocator cursor */, y)
							st64(y + 8, 0x6e696d5f746c7561)
							st64(y, 0x765f647261776572)
							st8(y + 0x10, 0x74)
							void ld64(n)
						}
						st64(n + 0x10, y, 0x11)
						st64(n + 8, 0x11)
						st64(n, 1)
						st64(a + 0x10, n)
						st64(a + 8, f)
						st64(a, 0)
						return q
					}
					const v = ld64(0x300000000 /* heap bump-allocator cursor */)
					const w = v != 0 ? sat_sub(v, 0x80) : 0x300007f80
					if (0x300000008 > w) {
						alloc_handle_alloc_error(8, 0x80)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, w & -8)
					if ((w & -8) != 0) {
						st64(s240, w & -8)
						memcpy(w & -8, sd8, 0x80)
						try_accounts_19190(sd8, c)
						n = ld64(sd8 + 8)
						const z = ld64(sd8)
						if (z != 2) {
							q = fn_4130(s148, z, n, 0x10015b020 /* "token_program" */, 0xd)
							n = ld64(s148 + 8)
							f = ld64(s148)
							if (f != 2) {
								st64(a + 0x10, n)
								st64(a + 8, f)
								st64(a, 0)
								return q
							}
						}
						st64(s248, n)
						fn_18cf0(sd8, c, n, aa, ab)
						n = ld64(sd8 + 8)
						const ac = ld64(sd8)
						if (ac != 2) {
							q = fn_4130(s158, ac, n, "token_program_2022", 0x12)
							n = ld64(s158 + 8)
							f = ld64(s158)
							if (f != 2) {
								st64(a + 0x10, n)
								st64(a + 8, f)
								st64(a, 0)
								return q
							}
						}
						st64(s250, n)
						fn_193e0(sd8, c, n, ad, ae)
						n = ld64(sd8 + 8)
						const af = ld64(sd8)
						if (af != 2) {
							q = fn_4130(s168, af, n, "memo_program", 0xc)
							n = ld64(s168 + 8)
							f = ld64(s168)
							pool_state = ld64(s230)
							if (f != 2) {
								st64(a + 0x10, n)
								st64(a + 8, f)
								st64(a, 0)
								return q
							}
						} else {
							pool_state = ld64(s230)
						}
						if (ld8(ld64((k & -8) + 0x20) + 0x29) != 0) {
							if (pool_state.is_writable != 0) {
								const aj = ld64(s238)
								if (ld8(ld64(aj + 0x20) + 0x29) != 0) {
									st64(s258, n)
									const ak = ld64(ld64(ld64(s240) + 0x58))
									copyr(s138, ak, 0x20)
									copy(s118, aj + 0x28, 0x20)
									if ((memcmp(s138, s118, 0x20) as u32) != 0) {
										anchor_error_from(s1d8, 0x7dc /* anchor::ConstraintAddress */)
										const at = fn_4130(s1e8, ld64(s1d8), ld64(s1d8 + 8), "reward_vault_mint", 0x11)
										const ar = ld64(s1e8 + 8)
										const aq = ld64(s1e8)
										copy(sd8, s138, 0x40)
										q = Error_with_pubkeys(s1f8, aq, ar, sd8, at)
										f = ld64(s1f8)
										st64(a + 0x10, ld64(s1f8 + 8))
										st64(a + 8, f)
										st64(a, 0)
										return q
									}
									const al = ld64(s248)
									const am = ld64(al)
									copyr(sf8, am, 0x20)
									q = memcmp(sf8, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32
									if (q == 0) {
										st64(a + 0x38, ld64(s258))
										st64(a + 0x30, ld64(s250))
										st64(a + 0x28, al)
										st64(a + 0x20, ld64(s240))
										st64(a + 0x18, ld64(s238))
										st64(a + 0x10, ld64(s230))
										st64(a + 8, k & -8)
										st64(a, i)
										return q
									}
									anchor_error_from(s208, 0x7dc /* anchor::ConstraintAddress */)
									const ap = fn_4130(s218, ld64(s208), ld64(s208 + 8), 0x10015b020 /* "token_program" */, 0xd)
									const ao = ld64(s218 + 8)
									const an = ld64(s218)
									copyr(sd8, sf8, 0x20)
									st64(sb8, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
									q = Error_with_pubkeys(s228, an, ao, sd8, ap)
									f = ld64(s228)
									st64(a + 0x10, ld64(s228 + 8))
									st64(a + 8, f)
									st64(a, 0)
									return q
								}
								anchor_error_from(s1b8, 0x7d0 /* anchor::ConstraintMut */, n, aj, ah)
								q = fn_4130(s1c8, ld64(s1b8), ld64(s1b8 + 8), "reward_token_vault", 0x12)
								f = ld64(s1c8)
								st64(a + 0x10, ld64(s1c8 + 8))
								st64(a + 8, f)
								st64(a, 0)
								return q
							}
							anchor_error_from(s198, 0x7d0 /* anchor::ConstraintMut */, n, ag, ah)
							q = fn_4130(s1a8, ld64(s198), ld64(s198 + 8), "pool_state", 0xa)
							f = ld64(s1a8)
							st64(a + 0x10, ld64(s1a8 + 8))
							st64(a + 8, f)
							st64(a, 0)
							return q
						}
						anchor_error_from(s178, 0x7d0 /* anchor::ConstraintMut */, n, ag, ah)
						q = fn_4130(s188, ld64(s178), ld64(s178 + 8), "funder_token_account", 0x14)
						f = ld64(s188)
						st64(a + 0x10, ld64(s188 + 8))
						st64(a + 8, f)
						st64(a, 0)
						return q
					}
					alloc_handle_alloc_error(8, 0x80)
				}
				alloc_handle_alloc_error(8, 0xd8)
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
	const h = g != 0 ? sat_sub(g, 0xd) : 0x300007ff3
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xd, 0x10015f8f8, sat_sub(g, 0xd), 0xd > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 5, 0x7265646e75665f64)
		st64(h, 0x665f647261776572)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xd, 0x10015f8f8, sat_sub(g, 0xd), 0xd > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 5, 0x7265646e75665f64)
		st64(h, 0x665f647261776572)
		void ld64(i)
	}
	st64(i + 0x10, h, 0xd)
	st64(i + 8, 0xd)
	st64(i, 1)
	st64(a + 0x10, i)
	st64(a + 8, f)
	st64(a, 0)
	return q
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
function fn_49b88(a: u64, b: u64, c: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf0 = fp - 0xf0, sf8 = fp - 0xf8, s108 = fp - 0x108, s110 = fp - 0x110, s118 = fp - 0x118, s138 = fp - 0x138, s2bf = fp - 0x2bf, s2df = fp - 0x2df, s2ff = fp - 0x2ff, s310 = fp - 0x310, s338 = fp - 0x338, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s448 = fp - 0x448, s470 = fp - 0x470, sfe8 = fp - 0xfe8, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let m, n, bf, bo: u64
	B18: {
		st64(s448 + 0x20, a)
		const f = ld64(b + 8)
		const h = ld64(f + 0x18)
		const g = ld64(ld64(f))
		copyr(s358, g, 0x20)
		const bp = ld64(h + 0x20)
		const i = ld64(h + 0x68)
		st64(s448 + 0x28, f)
		const k = ld64(f + 0x10)
		const l = clock_get(s338)
		if (ld64(s338) != 0) {
			const u = ld64(s338 + 8)
			const t = ld64(s338 + 0x10)
			st64(s338 + 0x10, ld64(s338 + 0x18))
			st64(s338, u, t)
			bf = fn_13e628(s408, s338)
			m = ld64(s408 + 8)
			n = ld64(s408)
		} else {
			st64(s448 + 0x18, i)
			const j = ld64(s310)
			if ((j as i64) > -1) {
				bf = fn_53e8(s338, k, undef, undef, undef, l)
				m = ld64(s338 + 0x10)
				n = ld64(s338 + 8)
				if (ld64(s338) == 0) {
					st64(s448 + 0x10, m)
					bf = fn_6c2a0(s338, n, j)
					let w = ld64(s338 + 0x10)
					let x = ld64(s338 + 8)
					if (ld8(s338) == 0) {
						if ((c as u8) > 2) {
							fn_14ec98(c as u8, 3, 0x10015fe40)
						}
						memcpy(s338, n + (c as u8) * 0xa9 + 0x185, 0xa9)
						st64(s118, 0, 0, 0, 0)
						if ((memcmp(s2ff, s118, 0x20) as u32) == 0) {
							fn_85138(s78, 0x100159910)
							st64(s60, 0, 1, 0)
							st64(s28, s60, 0x10015f818)
							st8(s20 + 0x10, 3)
							st64(s20 + 8, 0x20)
							st64(s38, 0)
							st64(s48, 0)
							if (fn_88558(0x100159910, s48) != 0) {
								fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
							}
							copy(sf8, s78, 0x30)
							st64(s110, 0x10015a118)
							st32(sf0 + 0x70, 0x1791 /* error::UnInitializedRewardInfo */)
							st8(sf0 + 0x28, 2)
							st32(s108 + 8, 0x52)
							st64(s108, 0x3a)
							st64(s118, 0)
							bf = fn_13e5a0(s3f8, s118)
							w = ld64(s3f8 + 8)
							x = ld64(s3f8)
						} else {
							const p = ld64(s338 + 9)
							const o = ld64(s338 + 0x11)
							if (o == p) {
								if ((memcmp(s358, s2bf, 0x20) as u32) == 0) {
									const bq = ld64(bp)
									copyr(s138, bq, 0x20)
									if ((memcmp(s138, s2df, 0x20) as u32) == 0) {
										const bv = ld64(s310 + 9)
										const bu = ld64(s310 + 1)
										if (bv > bu) {
											bf = fn_88360(s3e8, 0x26)
											w = ld64(s3e8 + 8)
											x = ld64(s3e8)
										} else {
											const bw = ld64(s448 + 0x18)
											if (bw >= bu - bv) {
												const bx = ld64(s448 + 0x10)
												st64(bx, ld64(bx) + 1)
												m = bw - (bu - bv)
												break B18
											}
											bf = fn_88360(s3d8, 0x26)
											w = ld64(s3d8 + 8)
											x = ld64(s3d8)
										}
									} else {
										ErrorCode_name(s78, 0x100159874)
										st64(s60, 0, 1, 0)
										st64(s28, s60, 0x10015f818)
										st8(s20 + 0x10, 3)
										st64(s20 + 8, 0x20)
										st64(s38, 0)
										st64(s48, 0)
										if (ErrorCode_fmt(0x100159874, s48) != 0) {
											fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
										}
										copy(sf8, s78, 0x30)
										st64(s110, 0x10015a118)
										st32(sf0 + 0x70, 0x9c6 /* anchor::RequireKeysEqViolated */)
										st8(sf0 + 0x28, 2)
										st32(s108 + 8, 0x5a)
										st64(s108, 0x3a)
										st64(s118, 0)
										const bt = fn_13e5a0(s3b8, s118)
										const bs = ld64(s3b8 + 8)
										const br = ld64(s3b8)
										copyr(sf8, s2df, 0x20)
										copy(s118, s138, 0x20)
										bf = Error_with_pubkeys(s3c8, br, bs, s118, bt)
										w = ld64(s3c8 + 8)
										x = ld64(s3c8)
									}
								} else {
									ErrorCode_name(s78, 0x100159874)
									st64(s60, 0, 1, 0)
									st64(s28, s60, 0x10015f818)
									st8(s20 + 0x10, 3)
									st64(s20 + 8, 0x20)
									st64(s38, 0)
									st64(s48, 0)
									if (ErrorCode_fmt(0x100159874, s48) != 0) {
										fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
									}
									copy(sf8, s78, 0x30)
									st64(s110, 0x10015a118)
									st32(sf0 + 0x70, 0x9c6 /* anchor::RequireKeysEqViolated */)
									st8(sf0 + 0x28, 2)
									st32(s108 + 8, 0x59)
									st64(s108, 0x3a)
									st64(s118, 0)
									const s = fn_13e5a0(s398, s118)
									const r = ld64(s398 + 8)
									const q = ld64(s398)
									copyr(sf8, s2bf, 0x20)
									copy(s118, s358, 0x20)
									bf = Error_with_pubkeys(s3a8, q, r, s118, s)
									w = ld64(s3a8 + 8)
									x = ld64(s3a8)
								}
							} else {
								fn_85138(s78, 0x10015982c)
								st64(s60, 0, 1, 0)
								st64(s28, s60, 0x10015f818)
								st8(s20 + 0x10, 3)
								st64(s20 + 8, 0x20)
								st64(s38, 0)
								st64(s48, 0)
								if (fn_88558(0x10015982c, s48) != 0) {
									fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
								}
								copy(sf8, s78, 0x30)
								st64(s110, 0x10015a118)
								st32(sf0 + 0x70, 0x1770 /* error::NotApproved */)
								st8(sf0 + 0x28, 2)
								st32(s108 + 8, 0x54)
								st64(s108, 0x3a)
								st64(s118, 0)
								fn_13e5a0(s378, s118)
								bf = fn_1730(s388, ld64(s378), ld64(s378 + 8), o, p)
								w = ld64(s388 + 8)
								x = ld64(s388)
							}
						}
					}
					const v = ld64(s448 + 0x10)
					st64(v, ld64(v) + 1)
					m = w
					n = x
				}
			} else {
				bf = fn_88360(s368, 0x26)
				m = ld64(s368 + 8)
				n = ld64(s368)
			}
		}
		if (n != 2) {
			bo = ld64(s448 + 0x20)
			st64(bo + 8, m)
			st64(bo, n)
			return bf
		}
	}
	const y = ld64(s448 + 0x28)
	const z: AccountInfo = ld64(ld64(y + 0x18) + 0x20)
	const aa: LamportsCell = z.lamports
	const ag = z.key
	rc_inc(aa)
	const ab: DataCell = z.data
	rc_inc(ab)
	st64(s448 + 0x10, m)
	const af = z.owner
	const ae = z.rent_epoch
	const ad = z.is_signer
	const ac = z.is_writable
	st8(s20 + 2, z.executable)
	st8(s20, ad, ac)
	st64(s48, ag, aa, ab, af, ae)
	const ah: AccountInfo = ld64(ld64(y + 8) + 0x20)
	const ai: LamportsCell = ah.lamports
	const ao = ah.key
	rc_inc(ai)
	const aj: DataCell = ah.data
	rc_inc(aj)
	const an = ah.owner
	const am = ah.rent_epoch
	st64(s448 + 0x18, ai)
	const al = ah.is_signer
	const ak = ah.is_writable
	st8(sf0 + 2, ah.executable)
	st8(sf0, al, ak)
	st64(s108, aj, an, am)
	st64(s110, ld64(s448 + 0x18))
	st64(s118, ao)
	const ap = ld64(0x300000000 /* heap bump-allocator cursor */)
	st64(s470 + 0x20, aj)
	const aq = ap != 0 ? sat_sub(ap, 0x80) & -8 : 0x300007f80
	st64(s448, aa, ab)
	if (aq > 0x300000007) {
		const ar = ld64(y + 0x20)
		st64(0x300000000 /* heap bump-allocator cursor */, aq)
		const at = ld64(ar + 0x58)
		memcpy(aq, ar, 0x58)
		st64(aq + 0x58, at)
		const au = ld64(s448 + 0x28)
		copy(aq + 0x60, ar + 0x60, 0x20)
		const av: AccountInfo = ld64(au + 0x30)
		const aw: LamportsCell = av.lamports
		const ay = ld64(au + 0x28)
		const bd = av.key
		rc_inc(aw)
		const ax: DataCell = av.data
		rc_inc(ax)
		st64(s448 + 0x28, ay)
		st64(s470, s110, s108, s40, s38)
		const bc = av.owner
		const bb = av.rent_epoch
		const ba = av.is_signer
		const az = av.is_writable
		st8(s310 + 2, av.executable)
		st8(s310, ba, az)
		st64(s338, bd, aw, ax, bc, bb)
		st64(sfe8, ld64(s448 + 0x10))
		st64(sff0, s338)
		st64(sff8, ld64(s448 + 0x28))
		st64(s1000, aq)
		bf = fn_7a038(s418, au + 0x10, s48, s118, aq, ld64(sff8), s338, ld64(sfe8), bc)
		m = undef
		n = ld64(s418)
		if (n == 2) {
			const be = ld64(s448 + 0x18)
			const bi: DataCell = ld64(s448 + 8)
			const bh: LamportsCell = ld64(s448)
			if (rc_release(be)) {
				bf = Rc_drop_slow_14df0(ld64(s470), bf)
				m = undef
			}
			const bg: DataCell = ld64(s470 + 0x20)
			if (rc_release(bg)) {
				bf = Rc_drop_slow_14df0(ld64(s470 + 8), bf)
				m = undef
			}
			if (rc_release(bh)) {
				bf = Rc_drop_slow_14df0(ld64(s470 + 0x10), bf)
				m = undef
			}
			if (!rc_release(bi)) {
				bo = ld64(s448 + 0x20)
				st64(bo + 8, m)
				st64(bo, 2)
				return bf
			}
			bf = Rc_drop_slow_14df0(ld64(s470 + 0x18), bf)
			bo = ld64(s448 + 0x20)
			st64(bo + 8, undef)
			st64(bo, 2)
			return bf
		}
		m = ld64(s418 + 8)
		const bj = ld64(s448 + 0x18)
		const bk = m
		const bn: DataCell = ld64(s448 + 8)
		const bm: LamportsCell = ld64(s448)
		if (rc_release(bj)) {
			bf = Rc_drop_slow_14df0(ld64(s470), bf)
			m = bk
		}
		const bl: DataCell = ld64(s470 + 0x20)
		if (rc_release(bl)) {
			bf = Rc_drop_slow_14df0(ld64(s470 + 8), bf)
			m = bk
		}
		if (rc_release(bm)) {
			bf = Rc_drop_slow_14df0(ld64(s470 + 0x10), bf)
			m = bk
		}
		if (!rc_release(bn)) {
			bo = ld64(s448 + 0x20)
			st64(bo + 8, m)
			st64(bo, n)
			return bf
		}
		bf = Rc_drop_slow_14df0(ld64(s470 + 0x18), bf)
		bo = ld64(s448 + 0x20)
		st64(bo + 8, bk)
		st64(bo, n)
		return bf
	}
	alloc_handle_alloc_error(8, 0x80)
}

function fn_c1ac0(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let h, k, n, o: u64
	const f = ld64(b + 8)
	const g = ld64(f + 0x20)
	if ((memcmp(f, c, 0x20) as u32) == 0 && (common_is_closed(g) == 0 && ld64(ld64(g + 0x10) + 0x10) != 0)) {
		st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		k = fn_13e628(s28, s18)
		h = ld64(s28)
		if (h != 2) {
			const q = ld64(0x300000000 /* heap bump-allocator cursor */)
			n = q != 0 ? sat_sub(q, 0x14) : 0x300007fec
			o = ld64(s28 + 8)
			if ((h & 1) != 0) {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > q)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6363615f6e656b6f)
				st64(n, 0x745f7265646e7566)
				st32(n + 0x10, 0x746e756f)
				void ld64(o)
			} else {
				if (0x300000008 > n) {
					raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > q)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, n)
				st64(n + 8, 0x6363615f6e656b6f)
				st64(n, 0x745f7265646e7566)
				st32(n + 0x10, 0x746e756f)
				void ld64(o)
			}
			st64(o + 8, 0x14)
			st64(o, 1)
			st64(o + 0x18, 0x14)
			st64(o + 0x10, n)
			st64(a + 8, o)
			st64(a, h)
			return k
		}
	}
	k = fn_a80(s38, ld64(b + 0x10), c)
	h = ld64(s38)
	if (h == 2) {
		const i = ld64(b + 0x18)
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
		h = ld64(s48)
		if (h == 2) {
			st64(a + 8, o)
			st64(a, 2)
			return k
		}
		const m = ld64(0x300000000 /* heap bump-allocator cursor */)
		n = m != 0 ? sat_sub(m, 0x12) : 0x300007fee
		o = ld64(s48 + 8)
		if ((h & 1) != 0) {
			if (0x300000008 > n) {
				raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008, 0x12 > m)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, n)
			st64(n + 8, 0x7561765f6e656b6f)
			st64(n, 0x745f647261776572)
			st16(n + 0x10, 0x746c)
			void ld64(o)
		} else {
			if (0x300000008 > n) {
				raw_vec_handle_error(1, 0x12, 0x10015f8f8, 0x300000008, 0x12 > m)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, n)
			st64(n + 8, 0x7561765f6e656b6f)
			st64(n, 0x745f647261776572)
			st16(n + 0x10, 0x746c)
			void ld64(o)
		}
		st64(o + 8, 0x12)
		st64(o, 1)
		st64(o + 0x18, 0x12)
		st64(o + 0x10, n)
		st64(a + 8, o)
		st64(a, h)
		return k
	}
	const p = ld64(0x300000000 /* heap bump-allocator cursor */)
	n = p != 0 ? sat_sub(p, 0xa) : 0x300007ff6
	o = ld64(s38 + 8)
	if ((h & 1) != 0) {
		if (0x300000008 > n) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > p)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, n)
		st64(n, 0x6174735f6c6f6f70)
		st16(n + 8, 0x6574)
		void ld64(o)
	} else {
		if (0x300000008 > n) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008, 0xa > p)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, n)
		st64(n, 0x6174735f6c6f6f70)
		st16(n + 8, 0x6574)
		void ld64(o)
	}
	st64(o + 8, 0xa)
	st64(o, 1)
	st64(o + 0x18, 0xa)
	st64(o + 0x10, n)
	st64(a + 8, o)
	st64(a, h)
	return k
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (points to it), e (value)
function fn_153158(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155b30(a, b, c, d, e)
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

function fn_f5d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, b, c, d, e)
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
