// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction collect_fees_v2: handler + 48 reachable functions
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
interface Mint extends sized<0x60> { // Account<Mint> (anchor_spl, SPL Token Mint) as unpacked in memory (fields [known: spl_token::state layout] at the offsets a run of try_accounts_11e98 put them [offsets from exec]; info = the &AccountInfo)
	mint_authority:   at<0x04, Pubkey> // COption<Pubkey>
	supply:           at<0x28, u64>
	decimals:         at<0x30, u8>
	freeze_authority: at<0x38, Pubkey> // COption<Pubkey>
	info:             at<0x58, ref<AccountInfo>> // &AccountInfo
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
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_invoke_signed_rust(ix: u64, accountInfos: u64, accountInfosLen: u64, signerSeeds: u64, signerSeedsLen: u64): u64 // CPI (Rust ABI: &Instruction, &[AccountInfo], &[&[&[u8]]])
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function sol_memset(dst: u64, byte: u64, n: u64): void // memset
declare function try_accounts_120(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_558(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::interface_account::InterfaceAccount<T> as anchor_lang::Accounts<B>…
declare function try_accounts_610(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function fn_b580(a: u64): u64 // lib uses alloc_handle_alloc_error, Error__new
declare function fn_c640(a: u64, r0: u64): u64 // lib
declare function fn_e478(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function fn_f060(a: u64, b: u64, r0: u64): void // lib uses raw_vec_handle_error
declare function fn_fa00(a: u64, b: u64): u64 // lib
declare function AccountInfo_clone(a: u64, b: u64): void // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11a48(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11b00(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function ptr_drop_in_place_121690(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<alloc::vec::Vec<solana_account_info::AccountInfo>>
declare function fn_121930(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses raw_vec_handle_error
declare function fn_121aa0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses raw_vec_handle_error
declare function fn_121c08(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses raw_vec_handle_error
declare function fn_121d50(a: u64, b: u64): void // lib uses raw_vec_handle_error
declare function fn_121eb0(a: u64, b: u64): void // lib uses raw_vec_handle_error
declare function fn_122018(a: u64, b: u64): void // lib uses raw_vec_handle_error
declare function fn_124030(a: u64, b: u64, c: u64, d: u64): void // lib uses __rust_alloc, __rust_realloc
declare function ptr_drop_in_place_126088(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<alloc::vec::Vec<solana_account_info::AccountInfo>>
declare function fn_12cf58(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib uses raw_vec_handle_error
declare function fn_12d0a0(a: u64, b: u64, r0: u64): void // lib uses raw_vec_handle_error
declare function fn_12e0b0(a: u64, b: u64): u64 // lib
declare function fn_12e558(a: u64, b: u64, c: u64, r0: u64): u64 // lib
declare function Mint_unpack_from_slice_133108(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <spl_token::state::Mint as solana_program_pack::Pack>::unpack_from_slice
declare function Account_unpack_from_slice_1333d0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <spl_token::state::Account as solana_program_pack::Pack>::unpack_from_slice
declare function fn_138ab8(a: u64, b: u64): u64 // lib uses memcmp
declare function fn_1390d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcmp, AccountInfo_try_borrow_lamports, AccountInfo_try_borrow_data
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function clock_get_13f308(a: u64): u64 // lib solana_sysvar::clock::<impl solana_sysvar::Sysvar for solana_clock::Clock>::get
declare function AccountInfo_try_borrow_lamports(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_lamports
declare function fn_143340(a: u64, b: u64, r0: u64): u64 // lib
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_144198(a: u64, b: u64, r0: u64): u64 // lib uses __rust_alloc, raw_vec_handle_error
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function fn_1459d0(a: u64): u64 // lib uses repr_bitpacked_kind_from_prim_145358, callx
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fn_14a698(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses callx
declare function fn_14ecd0(a: u64, b: u64, c: u64): u64 // lib "0001020304050607080910111213141516171819…", "0001020304050607080910111213141516171819…"
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp

// instruction handler: collect_fees_v2 (discriminator sha256("global:collect_fees_v2")[..8] = 0xfe2b4e5bf5f75cf)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, position, position_token_account, token_mint_a, token_mint_b, token_owner_account_a, token_vault_a, token_owner_account_b, token_vault_b, token_program_b, token_program_a, memo_program, position_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
function ix_collect_fees_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s18 = fp - 0x18, s158 = fp - 0x158, s160 = fp - 0x160, s170 = fp - 0x170, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308
	let j, k: u64
	sol_log("Instruction: CollectFeesV2", 0x1a)
	st64(s2c8, ix_args, ix_args_len)
	fn_11150(s170, s2c8)
	const h = ld64(s170 + 8)
	const f = ld64(s170)
	if (f == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
		if (2 > (h & 3) - 2) {
			k = anchor_error_from(s308, 0x66 /* anchor::InstructionDidNotDeserialize */)
			j = ld64(s308)
			st64(a + 8, ld64(s308 + 8))
			st64(a, j)
			return k
		}
		if ((h & 3) == 0) {
			k = anchor_error_from(s308, 0x66 /* anchor::InstructionDidNotDeserialize */)
			j = ld64(s308)
			st64(a + 8, ld64(s308 + 8))
			st64(a, j)
			return k
		}
		const i = ld64(ld64(h + 7))
		callx(i, ld64(h - 1), i)
		k = anchor_error_from(s308, 0x66 /* anchor::InstructionDidNotDeserialize */)
		j = ld64(s308)
		st64(a + 8, ld64(s308 + 8))
		st64(a, j)
		return k
	}
	const o = ld64(s160)
	st64(s2d8, accounts, accounts_len)
	k = accounts_collect_fees_v2(s170, undef, s2d8, undef, fp)
	const g = ld32(s170)
	if (g == 2) {
		j = ld64(s170 + 8)
		st64(a + 8, ld64(s160))
		st64(a, j)
		return k
	}
	const n = ld32(s170 + 4)
	const m = ld64(s170 + 8)
	const l = ld64(s160)
	memcpy(s2b0, s158, 0x140)
	st64(s2c0, m, l)
	st32(s2c8, g, n)
	copyr(s160, s2d8, 0x10)
	st64(s170, program_id, s2c8)
	st64(s18, f, h, o)
	k = fn_3b360(s2e8, s170, s18)
	j = ld64(s2e8)
	if (j != 2) {
		st64(a + 8, ld64(s2e8 + 8))
		st64(a, j)
		return k
	}
	k = fn_d46d8(s2f8, s2c8, program_id)
	j = ld64(s2f8)
	st64(a + 8, ld64(s2f8 + 8))
	st64(a, j)
	return k
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_11150(a: u64, b: u64) {
	const s10 = fp - 0x10, s40 = fp - 0x40, s58 = fp - 0x58, s59 = fp - 0x59, s70 = fp - 0x70, s78 = fp - 0x78, s90 = fp - 0x90, s91 = fp - 0x91
	let z: u64
	let k = a
	const f = ld64(b + 8)
	if (f == 0) {
		z = fn_1459d0(0x100159468)
		st64(k, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, z)
	} else {
		const g = ld64(b)
		const h = ld8(g)
		st64(b + 8, f - 1)
		st64(b, g + 1)
		st8(s91, h)
		if (h == 0) {
			st64(k, 0x8000000000000000)
		} else if (h == 1) {
			if (5 > f) {
				z = fn_1459d0(0x100159468)
				st64(k, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, z)
			} else {
				const i = ld32(g + 1)
				st64(b + 8, f - 5)
				st64(b, g + 5)
				let p = 0
				if (i != 0) {
					const j = ld64(0x300000000 /* heap bump-allocator cursor */)
					const l = j != 0 ? j : 0x300008000
					const aa = k
					const m = l - (min(i, 0x800) << 1)
					let n = m > l ? 0 : m
					if (0x300000008 > n) {
						raw_vec_handle_error(1, min(i, 0x800) << 1, min(i, 0x800) << 1, min(i, 0x800), 0x300000008)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, n)
					st64(s78, min(i, 0x800))
					let q = 0
					st64(s70, n, 0)
					let o = f - 5
					let w = o
					let v = g + 5
					const ab = b
					while (true) {
						if (o == q) {
							z = fn_1459d0(0x100159468)
							st64(aa, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, z)
							return
						}
						const y = v + q
						const x = w
						const t = ld8(y)
						st64(b + 8, w - 1)
						st64(b, y + 1)
						st8(s59, t)
						if (t >= 0xd) {
							st64(s40, 0x100159668)
							st64(s40 + 0x10, s10)
							st64(s10, s59, num_fmt_bae8)
							st64(s40 + 0x20, 0)
							st64(s40 + 8, 1)
							st64(s40 + 0x18, 1)
							// fmt "Unexpected variant index: {}" {} = t [num_fmt_bae8]
							fn_147e78(s58, s40, y + 1, x - 1, o)
							z = fn_b580(s58)
							st64(aa, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, z)
							return
						}
						if (x == 1) {
							z = fn_1459d0(0x100159468)
							st64(aa, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, z)
							return
						}
						const s = ld8(y + 1)
						st64(b, y + 2)
						w = w - 2
						st64(b + 8, w)
						if (p == ld64(s78)) {
							fn_eef8(s78, b, v)
							v = g + 5
							o = f - 5
							b = ab
							n = ld64(s70)
						}
						p = p + 1
						const r = n + q
						st8(r + 1, s)
						st8(r, t)
						st64(s70 + 8, p)
						q = q + 2
						if (p >= i) {
							z = ld64(s70)
							const u = ld64(s78)
							k = aa
							if (u == 0x8000000000000000) {
								st64(k, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */, z)
								return
							}
							st64(k + 0x10, p)
							st64(k + 8, z)
							st64(k, u)
							return
						}
					}
				}
				st64(k + 0x10, 0)
				st64(k + 8, 1)
				st64(k, 0)
			}
		} else {
			st64(s40, 0x1001596d8)
			st64(s40 + 0x10, s58)
			st64(s58, s91, fn_14ef78)
			st64(s40 + 0x20, 0)
			st64(s40 + 8, 2)
			st64(s40 + 0x18, 1)
			// fmt "Invalid Option representation: {}. The first byte must be 0 or 1" {} = h [fn_14ef78]
			fn_147e78(s90, s40, g + 1, f, g)
			st64(k + 8, fn_b580(s90))
			st64(k, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
		}
	}
}

// Anchor Accounts::try_accounts of instruction collect_fees_v2 (called by ix_collect_fees_v2; name [str]: from the handler's "Instruction: …" log; was fn_d23e0)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool, position (ConstraintMut, ConstraintHasOne), position_token_account (ConstraintRaw), token_mint_a (ConstraintAddress), token_mint_b (ConstraintAddress), token_owner_account_a (ConstraintMut, ConstraintRaw), token_vault_a (ConstraintMut, ConstraintAddress), token_owner_account_b (ConstraintMut, ConstraintRaw), token_vault_b (ConstraintMut, ConstraintAddress), token_program_b (ConstraintAddress), token_program_a (ConstraintAddress), memo_program, position_authority
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_token_account_box, token_owner_account_a_box, token_vault_a_box, token_owner_account_b_box, token_vault_b_box, token_vault_a, token_vault_b
function accounts_collect_fees_v2(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s230 = fp - 0x230, s278 = fp - 0x278, s288 = fp - 0x288, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2d0 = fp - 0x2d0, s310 = fp - 0x310, s330 = fp - 0x330, s370 = fp - 0x370, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s510 = fp - 0x510, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s560 = fp - 0x560, s570 = fp - 0x570, s580 = fp - 0x580, s590 = fp - 0x590, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s708 = fp - 0x708, s730 = fp - 0x730, s738 = fp - 0x738, s740 = fp - 0x740, s748 = fp - 0x748, s750 = fp - 0x750, s758 = fp - 0x758, s760 = fp - 0x760, s768 = fp - 0x768
	let ai, aj: u64
	try_accounts_11a48(s290, c, c, d, e)
	if (ld64(s290) == 0) {
		aj = Error_with_account_name(s6d0, ld64(s288), ld64(s288 + 8), 0x100152b28 /* "whirlpool" */, 9)
		ai = ld64(s6d0)
		st64(a + 0x10, ld64(s6d0 + 8))
		st64(a + 8, ai)
		st32(a, 2)
		return aj
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x290) & -8 : 0x300007d70
	if (g > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, s290, 0x290)
		try_accounts_11718(s290, c)
		const j = ld64(s288)
		const h = ld64(s290)
		if (h == 2) {
			try_accounts_11b00(s290, c)
			if (ld64(s290) == 0) {
				aj = Error_with_account_name(s6c0, ld64(s288), ld64(s288 + 8), "position", 8)
				ai = ld64(s6c0)
				st64(a + 0x10, ld64(s6c0 + 8))
				st64(a + 8, ai)
				st32(a, 2)
				return aj
			}
			const i = ld64(0x300000000 /* heap bump-allocator cursor */)
			const k = i != 0 ? sat_sub(i, 0xd8) & -8 : 0x300007f28
			st64(s6e0, j)
			if (k > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, k)
				st64(s6e0 + 8, k)
				memcpy(k, s290, 0xd8)
				try_accounts_558(s290, c)
				if (ld32(s230 + 0x50) == 2) {
					aj = Error_with_account_name(s6b0, ld64(s290), ld64(s288), "position_token_account", 0x16)
					ai = ld64(s6b0)
					st64(a + 0x10, ld64(s6b0 + 8))
					st64(a + 8, ai)
					st32(a, 2)
					return aj
				}
				const l = ld64(0x300000000 /* heap bump-allocator cursor */)
				const position_token_account_box: TokenAccount_2 = l != 0 ? sat_sub(l, 0xd8) & -8 : 0x300007f28
				if (position_token_account_box > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, position_token_account_box)
					memcpy(position_token_account_box, s290, 0xd8)
					try_accounts_610(s290, c)
					const n = ld32(s290)
					if (n == 2) {
						aj = Error_with_account_name(s6a0, ld64(s288), ld64(s288 + 8), "token_mint_a", 0xc)
						ai = ld64(s6a0)
						st64(a + 0x10, ld64(s6a0 + 8))
						st64(a + 8, ai)
						st32(a, 2)
						return aj
					}
					st64(s708 + 0x18, n)
					copyr(s708, s288, 0x10)
					st64(s708 + 0x10, ld32(s290 + 4))
					memcpy(s370, s278, 0x40)
					copy(s390, s230, 0x20)
					st64(s708 + 0x20, ld64(s278 + 0x40))
					try_accounts_610(s290, c)
					const o = ld32(s290)
					if (o == 2) {
						aj = Error_with_account_name(s690, ld64(s288), ld64(s288 + 8), "token_mint_b", 0xc)
						ai = ld64(s690)
						st64(a + 0x10, ld64(s690 + 8))
						st64(a + 8, ai)
						st32(a, 2)
						return aj
					}
					st64(s730 + 0x18, o)
					copyr(s730, s288, 0x10)
					st64(s730 + 0x10, ld32(s290 + 4))
					memcpy(s310, s278, 0x40)
					copy(s330, s230, 0x20)
					st64(s730 + 0x20, ld64(s278 + 0x40))
					fn_2258(s290, c)
					const token_owner_account_a_box: TokenAccount_2 = ld64(s288)
					const p = ld64(s290)
					if (p == 2) {
						st64(s738, token_owner_account_a_box)
						fn_2258(s290, c, token_owner_account_a_box)
						const token_vault_a_box: TokenAccount_2 = ld64(s288)
						const r = ld64(s290)
						if (r == 2) {
							st64(s740, token_vault_a_box)
							fn_2258(s290, c, token_vault_a_box)
							const token_owner_account_b_box: TokenAccount_2 = ld64(s288)
							const t = ld64(s290)
							if (t == 2) {
								st64(s748, token_owner_account_b_box)
								fn_2258(s290, c, token_owner_account_b_box)
								const token_vault_b_box: TokenAccount_2 = ld64(s288)
								const v = ld64(s290)
								if (v == 2) {
									st64(s750, token_vault_b_box)
									try_accounts_120(s290, c, token_vault_b_box)
									const y = ld64(s288)
									const x = ld64(s290)
									if (x == 2) {
										st64(s758, y)
										try_accounts_120(s290, c, y)
										const aa = ld64(s288)
										const z = ld64(s290)
										if (z == 2) {
											st64(s760, aa)
											fn_12758(s290, c, aa)
											const ac = ld64(s288)
											const ab = ld64(s290)
											if (ab == 2) {
												st64(s768, ac)
												const ad = ld64(s6e0 + 8)
												if (ld8(ld64(ad) + 0x29) == 0) {
													anchor_error_from(s670, 0x7d0 /* anchor::ConstraintMut */, ad)
													aj = Error_with_account_name(s680, ld64(s670), ld64(s670 + 8), "position", 8)
													ai = ld64(s680)
													st64(a + 0x10, ld64(s680 + 8))
													st64(a + 8, ai)
													st32(a, 2)
													return aj
												}
												copyr(s2d0, ad + 8, 0x20)
												const ae = ld64(ld64(g))
												copyr(s2b0, ae, 0x20)
												if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
													anchor_error_from(s420, 0x7d1 /* anchor::ConstraintHasOne */)
													const ah = Error_with_account_name(s430, ld64(s420), ld64(s420 + 8), "position", 8)
													const ag = ld64(s430 + 8)
													const af = ld64(s430)
													copy(s290, s2d0, 0x40)
													aj = fn_13b5c0(s440, af, ag, s290, ah)
													ai = ld64(s440)
													st64(a + 0x10, ld64(s440 + 8))
													st64(a + 8, ai)
													st32(a, 2)
													return aj
												}
												if ((memcmp(position_token_account_box.mint, ad + 0x28, 0x20) as u32) == 0) {
													if (position_token_account_box.amount != 1) {
														anchor_error_from(s470, 0x7d3 /* anchor::ConstraintRaw */)
														aj = Error_with_account_name(s480, ld64(s470), ld64(s470 + 8), "position_token_account", 0x16)
														ai = ld64(s480)
														st64(a + 0x10, ld64(s480 + 8))
														st64(a + 8, ai)
														st32(a, 2)
														return aj
													}
													const ak = ld64(ld64(s708 + 0x20))
													copyr(s2d0, ak, 0x20)
													copyr(s2b0, g + 0x1a8, 0x20)
													if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
														const ao = ld64(ld64(s730 + 0x20))
														copyr(s2d0, ao, 0x20)
														copyr(s2b0, g + 0x1e8, 0x20)
														if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
															if (ld8(ld64(ld64(s738) + 0x20) + 0x29) == 0) {
																anchor_error_from(s650, 0x7d0 /* anchor::ConstraintMut */)
																aj = Error_with_account_name(s660, ld64(s650), ld64(s650 + 8), "token_owner_account_a", 0x15)
																ai = ld64(s660)
																st64(a + 0x10, ld64(s660 + 8))
																st64(a + 8, ai)
																st32(a, 2)
																return aj
															}
															if ((memcmp(ld64(s738) + 0x28, g + 0x1a8, 0x20) as u32) == 0) {
																const token_vault_a: AccountInfo = ld64(ld64(s740) + 0x20)
																if (token_vault_a.is_writable != 0) {
																	const au = token_vault_a.key
																	copyr(s2d0, au, 0x20)
																	copyr(s2b0, g + 0x1c8, 0x20)
																	if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
																		anchor_error_from(s510, 0x7dc /* anchor::ConstraintAddress */)
																		const ax = Error_with_account_name(s520, ld64(s510), ld64(s510 + 8), "token_vault_a", 0xd)
																		const aw = ld64(s520 + 8)
																		const av = ld64(s520)
																		copy(s290, s2d0, 0x40)
																		aj = fn_13b5c0(s530, av, aw, s290, ax)
																		ai = ld64(s530)
																		st64(a + 0x10, ld64(s530 + 8))
																		st64(a + 8, ai)
																		st32(a, 2)
																		return aj
																	}
																	if (ld8(ld64(ld64(s748) + 0x20) + 0x29) == 0) {
																		anchor_error_from(s610, 0x7d0 /* anchor::ConstraintMut */)
																		aj = Error_with_account_name(s620, ld64(s610), ld64(s610 + 8), "token_owner_account_b", 0x15)
																		ai = ld64(s620)
																		st64(a + 0x10, ld64(s620 + 8))
																		st64(a + 8, ai)
																		st32(a, 2)
																		return aj
																	}
																	if ((memcmp(ld64(s748) + 0x28, g + 0x1e8, 0x20) as u32) == 0) {
																		const token_vault_b: AccountInfo = ld64(ld64(s750) + 0x20)
																		if (token_vault_b.is_writable != 0) {
																			const az = token_vault_b.key
																			copyr(s2d0, az, 0x20)
																			copyr(s2b0, g + 0x208, 0x20)
																			if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
																				anchor_error_from(s560, 0x7dc /* anchor::ConstraintAddress */)
																				const bj = Error_with_account_name(s570, ld64(s560), ld64(s560 + 8), "token_vault_b", 0xd)
																				const bi = ld64(s570 + 8)
																				const bh = ld64(s570)
																				copy(s290, s2d0, 0x40)
																				aj = fn_13b5c0(s580, bh, bi, s290, bj)
																				ai = ld64(s580)
																				st64(a + 0x10, ld64(s580 + 8))
																				st64(a + 8, ai)
																				st32(a, 2)
																				return aj
																			}
																			const ba = ld64(ld64(s758))
																			copyr(s2d0, ba, 0x20)
																			AccountInfo_clone(s290, ld64(s708 + 0x20))
																			const bb = ld64(s278)
																			copy(s2b0, bb, 0x20)
																			const bd = ld64(s288 + 8)
																			const bc = ld64(s288)
																			rc_dec(bc)
																			rc_dec(bd)
																			if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
																				const bk = ld64(ld64(s760))
																				copyr(s2d0, bk, 0x20)
																				AccountInfo_clone(s290, ld64(s730 + 0x20))
																				const bl = ld64(s278)
																				copy(s2b0, bl, 0x20)
																				const bn = ld64(s288 + 8)
																				const bm = ld64(s288)
																				rc_dec(bm)
																				rc_dec(bn)
																				if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
																					memcpy(a + 0x18, s370, 0x40)
																					copy(a + 0x60, s390, 0x20)
																					aj = memcpy(a + 0x98, s310, 0x40)
																					const bu = ld64(s330 + 0x18)
																					const bt = ld64(s330 + 0x10)
																					const bs = ld64(s330 + 8)
																					const br = ld64(s330)
																					copy(a + 8, s708, 0x10)
																					st64(a + 0x58, ld64(s708 + 0x20))
																					copy(a + 0x88, s730, 0x10)
																					st64(a + 0xd8, ld64(s730 + 0x20))
																					st64(a + 0x100, g)
																					copy(a + 0x108, s6e0, 0x10)
																					st64(a + 0x118, position_token_account_box)
																					st64(a + 0x120, ld64(s738))
																					st64(a + 0x128, ld64(s740))
																					st64(a + 0x130, ld64(s748))
																					st64(a + 0x138, ld64(s750))
																					st64(a + 0x140, ld64(s758))
																					st64(a + 0x148, ld64(s760))
																					st64(a + 0x150, ld64(s768))
																					st32(a + 0x84, ld64(s730 + 0x10))
																					st32(a + 0x80, ld64(s730 + 0x18))
																					st32(a + 4, ld64(s708 + 0x10))
																					st32(a, ld64(s708 + 0x18))
																					st64(a + 0xe0, br, bs, bt, bu)
																					return aj
																				}
																				anchor_error_from(s5c0, 0x7dc /* anchor::ConstraintAddress */)
																				const bq = Error_with_account_name(s5d0, ld64(s5c0), ld64(s5c0 + 8), "token_program_b", 0xf)
																				const bp = ld64(s5d0 + 8)
																				const bo = ld64(s5d0)
																				copy(s290, s2d0, 0x40)
																				aj = fn_13b5c0(s5e0, bo, bp, s290, bq)
																				ai = ld64(s5e0)
																				st64(a + 0x10, ld64(s5e0 + 8))
																				st64(a + 8, ai)
																				st32(a, 2)
																				return aj
																			}
																			anchor_error_from(s590, 0x7dc /* anchor::ConstraintAddress */)
																			const bg = Error_with_account_name(s5a0, ld64(s590), ld64(s590 + 8), "token_program_a", 0xf)
																			const bf = ld64(s5a0 + 8)
																			const be = ld64(s5a0)
																			copy(s290, s2d0, 0x40)
																			aj = fn_13b5c0(s5b0, be, bf, s290, bg)
																			ai = ld64(s5b0)
																			st64(a + 0x10, ld64(s5b0 + 8))
																			st64(a + 8, ai)
																			st32(a, 2)
																			return aj
																		}
																		anchor_error_from(s5f0, 0x7d0 /* anchor::ConstraintMut */)
																		aj = Error_with_account_name(s600, ld64(s5f0), ld64(s5f0 + 8), "token_vault_b", 0xd)
																		ai = ld64(s600)
																		st64(a + 0x10, ld64(s600 + 8))
																		st64(a + 8, ai)
																		st32(a, 2)
																		return aj
																	}
																	anchor_error_from(s540, 0x7d3 /* anchor::ConstraintRaw */)
																	aj = Error_with_account_name(s550, ld64(s540), ld64(s540 + 8), "token_owner_account_b", 0x15)
																	ai = ld64(s550)
																	st64(a + 0x10, ld64(s550 + 8))
																	st64(a + 8, ai)
																	st32(a, 2)
																	return aj
																}
																anchor_error_from(s630, 0x7d0 /* anchor::ConstraintMut */)
																aj = Error_with_account_name(s640, ld64(s630), ld64(s630 + 8), "token_vault_a", 0xd)
																ai = ld64(s640)
																st64(a + 0x10, ld64(s640 + 8))
																st64(a + 8, ai)
																st32(a, 2)
																return aj
															}
															anchor_error_from(s4f0, 0x7d3 /* anchor::ConstraintRaw */)
															aj = Error_with_account_name(s500, ld64(s4f0), ld64(s4f0 + 8), "token_owner_account_a", 0x15)
															ai = ld64(s500)
															st64(a + 0x10, ld64(s500 + 8))
															st64(a + 8, ai)
															st32(a, 2)
															return aj
														}
														anchor_error_from(s4c0, 0x7dc /* anchor::ConstraintAddress */)
														const ar = Error_with_account_name(s4d0, ld64(s4c0), ld64(s4c0 + 8), "token_mint_b", 0xc)
														const aq = ld64(s4d0 + 8)
														const ap = ld64(s4d0)
														copy(s290, s2d0, 0x40)
														aj = fn_13b5c0(s4e0, ap, aq, s290, ar)
														ai = ld64(s4e0)
														st64(a + 0x10, ld64(s4e0 + 8))
														st64(a + 8, ai)
														st32(a, 2)
														return aj
													}
													anchor_error_from(s490, 0x7dc /* anchor::ConstraintAddress */)
													const an = Error_with_account_name(s4a0, ld64(s490), ld64(s490 + 8), "token_mint_a", 0xc)
													const am = ld64(s4a0 + 8)
													const al = ld64(s4a0)
													copy(s290, s2d0, 0x40)
													aj = fn_13b5c0(s4b0, al, am, s290, an)
													ai = ld64(s4b0)
													st64(a + 0x10, ld64(s4b0 + 8))
													st64(a + 8, ai)
													st32(a, 2)
													return aj
												}
												anchor_error_from(s450, 0x7d3 /* anchor::ConstraintRaw */)
												aj = Error_with_account_name(s460, ld64(s450), ld64(s450 + 8), "position_token_account", 0x16)
												ai = ld64(s460)
												st64(a + 0x10, ld64(s460 + 8))
												st64(a + 8, ai)
												st32(a, 2)
												return aj
											}
											aj = Error_with_account_name(s410, ab, ac, "memo_program", 0xc)
											ai = ld64(s410)
											st64(a + 0x10, ld64(s410 + 8))
											st64(a + 8, ai)
											st32(a, 2)
											return aj
										}
										aj = Error_with_account_name(s400, z, aa, "token_program_b", 0xf)
										ai = ld64(s400)
										st64(a + 0x10, ld64(s400 + 8))
										st64(a + 8, ai)
										st32(a, 2)
										return aj
									}
									aj = Error_with_account_name(s3f0, x, y, "token_program_a", 0xf)
									ai = ld64(s3f0)
									st64(a + 0x10, ld64(s3f0 + 8))
									st64(a + 8, ai)
									st32(a, 2)
									return aj
								}
								aj = Error_with_account_name(s3e0, v, token_vault_b_box, "token_vault_b", 0xd)
								ai = ld64(s3e0)
								st64(a + 0x10, ld64(s3e0 + 8))
								st64(a + 8, ai)
								st32(a, 2)
								return aj
							}
							aj = Error_with_account_name(s3d0, t, token_owner_account_b_box, "token_owner_account_b", 0x15)
							ai = ld64(s3d0)
							st64(a + 0x10, ld64(s3d0 + 8))
							st64(a + 8, ai)
							st32(a, 2)
							return aj
						}
						aj = Error_with_account_name(s3c0, r, token_vault_a_box, "token_vault_a", 0xd)
						ai = ld64(s3c0)
						st64(a + 0x10, ld64(s3c0 + 8))
						st64(a + 8, ai)
						st32(a, 2)
						return aj
					}
					aj = Error_with_account_name(s3b0, p, token_owner_account_a_box, "token_owner_account_a", 0x15)
					ai = ld64(s3b0)
					st64(a + 0x10, ld64(s3b0 + 8))
					st64(a + 8, ai)
					st32(a, 2)
					return aj
				}
				alloc_handle_alloc_error(8, 0xd8)
			}
			alloc_handle_alloc_error(8, 0xd8)
		}
		aj = Error_with_account_name(s3a0, h, j, "position_authority", 0x12)
		ai = ld64(s3a0)
		st64(a + 0x10, ld64(s3a0 + 8))
		st64(a + 8, ai)
		st32(a, 2)
		return aj
	}
	alloc_handle_alloc_error(8, 0x290)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// types [heur]: b: CollectFeesV2Context (the handler ix_collect_fees_v2 passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_3b360(a: u64, b: CollectFeesV2Context, c: u64): u64 {
	const s120 = fp - 0x120, s138 = fp - 0x138, s258 = fp - 0x258, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0
	const accounts: CollectFeesV2Accounts = b.accounts
	let u = fn_60480(s280, accounts.position_token_account, accounts + 0x108)
	let g = ld64(s280)
	if (g != 2) {
		st64(a + 8, ld64(s280 + 8))
		st64(a, g)
		return u
	}
	const i = b.remaining_accounts_len
	const remaining_accounts: AccountInfo = b.remaining_accounts
	u = fn_7a5e0(s138, remaining_accounts, i, c, 0x100152bf5, 2, g, b)
	let k = ld64(s138 + 0x10)
	g = ld64(s138 + 8)
	const j = ld64(s138)
	if (j == 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) {
		st64(a + 8, k)
		st64(a, g)
		return u
	}
	memcpy(s258, s120, 0x120)
	st64(s270, j, g, k)
	const l = ld64(accounts + 0x110)
	const m = ld64(l + 0x78)
	st64(l + 0x78, 0)
	const v = ld64(l + 0x80)
	st64(l + 0x80, 0)
	const token_vault_a: TokenAccount_2 = accounts.token_vault_a
	const o = ld64(accounts + 0x100)
	const token_owner_account_a: TokenAccount_2 = accounts.token_owner_account_a
	let t = fn_7e5e0(s290, o, accounts, token_vault_a, token_owner_account_a, accounts + 0x140, accounts + 0x150, s270, m, "Orca CollectFees", 0x10)
	k = ld64(s290 + 8)
	g = ld64(s290)
	if (g == 2) {
		const token_vault_b: TokenAccount_2 = accounts.token_vault_b
		const r = ld64(accounts + 0x100)
		const token_owner_account_b: TokenAccount_2 = accounts.token_owner_account_b
		t = fn_7e5e0(s2a0, r, accounts.token_mint_b, token_vault_b, token_owner_account_b, accounts + 0x148, accounts + 0x150, s258, v, "Orca CollectFees", 0x10)
		k = ld64(s2a0 + 8)
		g = ld64(s2a0)
		if (g != 2) {
			u = fn_c9a0(s270, t)
			st64(a + 8, k)
			st64(a, g)
			return u
		}
		u = fn_c9a0(s270, t)
		st64(a + 8, k)
		st64(a, 2)
		return u
	}
	u = fn_c9a0(s270, t)
	st64(a + 8, k)
	st64(a, g)
	return u
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position, token_owner_account_a, token_vault_a, token_owner_account_b, token_vault_b
function fn_d46d8(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8
	let r, t: u64
	fn_5a40(s28, ld64(b + 0x110), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const f = ld64(s28)
	if (f != 2) {
		r = Error_with_account_name(s38, f, ld64(s28 + 8), "position", 8)
		t = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, t)
		return r
	}
	const g = ld64(b + 0x120)
	const h = ld64(g + 0x20)
	if ((memcmp(g, c, 0x20) as u32) == 0) {
		const i = common_is_closed(h)
		if (i == 0) {
			fn_143448(s18, h, i)
			const k = ld64(s18 + 0x10)
			const j = ld64(s18)
			if (j != 0x800000000000001a /* Ok */) {
				const l = ld64(s18 + 8)
				st64(s18, j, l, k)
				fn_13b430(s48, s18)
				const m = ld64(s48)
				if (m != 2) {
					r = Error_with_account_name(s58, m, ld64(s48 + 8), "token_owner_account_a", 0x15)
					t = ld64(s58)
					st64(a + 8, ld64(s58 + 8))
					st64(a, t)
					return r
				}
			} else {
				st64(k, ld64(k) + 1)
			}
		}
	}
	const n = ld64(b + 0x128)
	const u = ld64(n + 0x20)
	if ((memcmp(n, c, 0x20) as u32) == 0) {
		const v = common_is_closed(u)
		if (v == 0) {
			fn_143448(s18, u, v)
			const x = ld64(s18 + 0x10)
			const w = ld64(s18)
			if (w != 0x800000000000001a /* Ok */) {
				const ae = ld64(s18 + 8)
				st64(s18, w, ae, x)
				fn_13b430(s68, s18)
				const af = ld64(s68)
				if (af != 2) {
					r = Error_with_account_name(s78, af, ld64(s68 + 8), "token_vault_a", 0xd)
					t = ld64(s78)
					st64(a + 8, ld64(s78 + 8))
					st64(a, t)
					return r
				}
			} else {
				st64(x, ld64(x) + 1)
			}
		}
	}
	const o = ld64(b + 0x130)
	const y = ld64(o + 0x20)
	if ((memcmp(o, c, 0x20) as u32) == 0) {
		const z = common_is_closed(y)
		if (z == 0) {
			fn_143448(s18, y, z)
			const ab = ld64(s18 + 0x10)
			const aa = ld64(s18)
			if (aa != 0x800000000000001a /* Ok */) {
				const ag = ld64(s18 + 8)
				st64(s18, aa, ag, ab)
				fn_13b430(s88, s18)
				const ah = ld64(s88)
				if (ah != 2) {
					r = Error_with_account_name(s98, ah, ld64(s88 + 8), "token_owner_account_b", 0x15)
					t = ld64(s98)
					st64(a + 8, ld64(s98 + 8))
					st64(a, t)
					return r
				}
			} else {
				st64(ab, ld64(ab) + 1)
			}
		}
	}
	const p = ld64(b + 0x138)
	const ac = ld64(p + 0x20)
	const q = memcmp(p, c, 0x20)
	let s = undef
	r = q as u32
	if (r != 0) {
		st64(a + 8, s)
		st64(a, 2)
		return r
	}
	r = common_is_closed(ac)
	s = undef
	if (r != 0) {
		st64(a + 8, s)
		st64(a, 2)
		return r
	}
	r = fn_143448(s18, ac, r)
	s = ld64(s18 + 0x10)
	const ad = ld64(s18)
	if (ad != 0x800000000000001a /* Ok */) {
		const ai = ld64(s18 + 8)
		st64(s18, ad, ai, s)
		r = fn_13b430(sa8, s18)
		s = undef
		const aj = ld64(sa8)
		if (aj == 2) {
			st64(a + 8, s)
			st64(a, 2)
			return r
		}
		r = Error_with_account_name(sb8, aj, ld64(sa8 + 8), "token_vault_b", 0xd)
		t = ld64(sb8)
		st64(a + 8, ld64(sb8 + 8))
		st64(a, t)
		return r
	}
	st64(s, ld64(s) + 1)
	st64(a + 8, s)
	st64(a, 2)
	return r
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (points to it), d (value), e (value)
function fn_147e78(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20
	let l, m: u64
	B11: {
		let f = ld64(b + 8)
		if (f != 0) {
			const g = ld64(b)
			d = 0
			let h = g + 8
			while (true) {
				let i = ld64(h) + d
				h = h + 0x10
				f = f - 1
				d = i
				if (f == 0) {
					if (ld64(b + 0x18) != 0) {
						h = ld64(g + 8)
						const k = h == 0
						const j = 0x10 > i
						if (0 > (i as i64)) {
							break
						}
						i = i << 1
						if ((j & k & 1) != 0) {
							break
						}
					}
					l = 1
					m = 0
					if (i == 0) {
						break B11
					}
					if (0 > (i as i64)) {
						raw_vec_handle_error(0, i, h, d, e)
					}
					l = __rust_alloc(i, 1)
					h = undef
					d = undef
					e = undef
					if (l == 0) {
						raw_vec_handle_error(1, i, h, d, e)
					}
					m = i
					break B11
				}
			}
		}
		l = 1
		m = 0
	}
	st64(s20, m, l, 0)
	const n = fn_14a698(s20, 0x10015b800, b, d, e)
	if (n != 0) {
		fn_149678("a formatting trait implementation returned an error", 0x33, s1, 0x10015b858, 0x10015b878)
	}
	st64(a + 0x10, ld64(s20 + 0x10))
	st64(a + 8, ld64(s20 + 8))
	st64(a, ld64(s20))
	return n
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (points to it)
function fn_eef8(a: u64, b: u64, r0: u64) {
	const s18 = fp - 0x18, s30 = fp - 0x30
	let f = ld64(a)
	let g = f + 1
	let h = g == 0
	if (h != 0) {
		raw_vec_handle_error(0, b, g, f, h)
	}
	const i = f
	let j = max(f << 1, g)
	let m = 0
	const n = 0x4000000000000000 > j
	j = max(j, 4)
	const k = j
	if (f != 0) {
		const l = ld64(a + 8)
		st64(s18 + 0x10, i << 1)
		st64(s18, l)
		m = 1
	}
	st64(s18 + 8, m)
	fn_e478(s30, n, k << 1, s18, r0)
	g = undef
	f = undef
	h = undef
	if (ld64(s30) != 0) {
		raw_vec_handle_error(ld64(s30 + 8), ld64(s30 + 0x10), g, f, h)
	}
	const o = ld64(s30 + 8)
	st64(a, j, o)
}

function fn_14ef78(a: u64, b: u64): u64 {
	return fn_14ecd0(ld8(a), 1, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (points to it), c (value)
function fn_2258(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const sd8 = fp - 0xd8
	try_accounts_558(sd8, b, c, d, e)
	if (ld32(sd8 + 0xb0) == 2) {
		const h = ld64(sd8)
		st64(a + 8, ld64(sd8 + 8))
		st64(a, h)
	} else {
		const f = ld64(0x300000000 /* heap bump-allocator cursor */)
		const g = f != 0 ? sat_sub(f, 0xd8) & -8 : 0x300007f28
		if (0x300000007 >= g) {
			alloc_handle_alloc_error(8, 0xd8)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, sd8, 0xd8)
		st64(a + 8, g)
		st64(a, 2)
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (points to it), c (value)
function fn_12758(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	let l: u64
	const f = ld64(b + 8)
	if (f != 0) {
		st64(b + 8, f - 1)
		const g: AccountInfo = ld64(b)
		st64(b, g + 0x30)
		const h = g.key
		if ((memcmp(h, 0x100152100 /* &MEMO_PROGRAM */, 0x20) as u32) != 0) {
			const k = anchor_error_from(s50, 0xbc0 /* anchor::InvalidProgramId */)
			const j = ld64(s50 + 8)
			const i = ld64(s50)
			copyr(s40, h, 0x20)
			st64(s20, 0x62129995a534a05 /* MEMO_PROGRAM */, 0x7c38da6071e8244d /* MEMO_PROGRAM[1] */, 0x81bb92bcddb5357c /* MEMO_PROGRAM[2] */, 0x8d44054140a81fe4 /* MEMO_PROGRAM[3] */) // key MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
			fn_13b5c0(s60, i, j, s40, k)
			l = ld64(s60)
			st64(a + 8, ld64(s60 + 8))
			st64(a, l)
		} else if (g.executable == 0) {
			anchor_error_from(s70, 0xbc1 /* anchor::InvalidProgramExecutable */)
			l = ld64(s70)
			st64(a + 8, ld64(s70 + 8))
			st64(a, l)
		} else {
			st64(a + 8, g)
			st64(a, 2)
		}
	} else {
		anchor_error_from(s80, 0xbbd /* anchor::AccountNotEnoughKeys */, c, d, e)
		l = ld64(s80)
		st64(a + 8, ld64(s80 + 8))
		st64(a, l)
	}
}

// types [heur]: b: TokenAccount_2 (5 of 7 calls pass one, the others an untyped value: fn_310a0, fn_33380, fn_35bf0, …)
function fn_60480(a: u64, b: TokenAccount_2, c: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20, s30 = fp - 0x30
	let l, m, n, s: u64
	const f: AccountInfo = ld64(c)
	const g = f.key
	if (ld32(b + 0x70) != 0 && (memcmp(g, b.delegate, 0x20) as u32) == 0) {
		const o: LamportsCell = f.lamports
		rc_inc(o)
		const p: DataCell = f.data
		rc_inc(p)
		B17: {
			const q = f.is_signer
			const r = memcmp(b.delegate, g, 0x20)
			n = undef
			if (q != 0) {
				m = 2
				l = r as u32
				if (l == 0) {
					break B17
				}
			}
			l = fn_87630(s10, 0x13)
			n = ld64(s10 + 8)
			m = ld64(s10)
		}
		rc_dec(o)
		s = a
		rc_dec(p)
		if (m != 2) {
			st64(s + 8, n)
			st64(s, m)
			return l
		}
		if (b.delegated_amount == 1) {
			st64(s + 8, n)
			st64(s, 2)
			return l
		}
		l = fn_87630(s20, 0x14)
		m = ld64(s20)
		st64(s + 8, ld64(s20 + 8))
		st64(s, m)
		return l
	}
	const h: LamportsCell = f.lamports
	rc_inc(h)
	const i: DataCell = f.data
	rc_inc(i)
	B8: {
		const j = f.is_signer
		const k = memcmp(b.owner, g, 0x20)
		n = undef
		if (j != 0) {
			l = k as u32
			if (l == 0) {
				break B8
			}
		}
		l = fn_87630(s30, 0x13)
		n = undef
		m = ld64(s30)
		if (m != 2) {
			n = ld64(s30 + 8)
			rc_dec(h)
			s = a
			if (!rc_release(i)) {
				st64(s + 8, n)
				st64(s, m)
				return l
			}
			i.weak = i.weak - 1
			st64(s + 8, n)
			st64(s, m)
			return l
		}
	}
	rc_dec(h)
	s = a
	if (!rc_release(i)) {
		st64(s + 8, n)
		st64(s, 2)
		return l
	}
	n = i.weak - 1
	i.weak = n
	st64(s + 8, n)
	st64(s, 2)
	return l
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), d (value), r9 (value), r6 (value)
// types [heur]: b: AccountInfo (every call passes one: fn_3b360, fn_3b6d8, fn_3ba00, …)
function fn_7a5e0(a: u64, b: AccountInfo, c: u64, d: u64, p5: u64, p6: u64, r6: u64, r9: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s48 = fp - 0x48, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s80 = fp - 0x80, s140 = fp - 0x140, s148 = fp - 0x148, s150 = fp - 0x150, s158 = fp - 0x158, s160 = fp - 0x160, s168 = fp - 0x168, s170 = fp - 0x170, s178 = fp - 0x178, s180 = fp - 0x180, s188 = fp - 0x188, s190 = fp - 0x190, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8
	let ag, an, ax, bc, bh, bm, br, bw, cb: u64
	let de = ld64(s1a8)
	let df = ld64(s1a0)
	let dg = ld64(s198)
	let dh = ld64(s190)
	let di = ld64(s188)
	let dj = ld64(s180)
	let dk = ld64(s178)
	let dl = ld64(s170)
	let dm = ld64(s168)
	let dn = ld64(s160)
	let dp = ld64(s158)
	let dq = ld64(s150)
	let dr = ld64(s148)
	let ds = ld64(s140)
	let eo = ld64(s80)
	let ep = ld64(s78)
	let eq = ld64(s70)
	let er = ld64(s68)
	let es = ld64(s60)
	let et = ld64(s58)
	let eu = ld64(s50)
	let ev = ld64(s48)
	let en = b
	if (ld64(d) == 0x8000000000000000) {
		st64(a + 0x108, 0x8000000000000000)
		st64(a + 0xf0, 0x8000000000000000)
		st64(a + 0xd8, 0x8000000000000000)
		st64(a + 0xc0, 0x8000000000000000)
		st64(a + 0xa8, 0x8000000000000000)
		st64(a + 0x90, 0x8000000000000000)
		st64(a + 0x78, 0x8000000000000000)
		st64(a + 0x60, 0x8000000000000000)
		st64(a + 0x48, 0x8000000000000000)
		st64(a + 0x30, 0x8000000000000000)
		st64(a + 0x18, 0x8000000000000000)
		st64(a, 0x8000000000000000)
		st64(a + 0x120, 0x8000000000000000)
		return 0x8000000000000000
	}
	let g = c * 0x30
	const du = en + g
	const ek = p6
	let i = p5
	let h = ld64(d + 8)
	let j = h + (ld64(d + 0x10) << 1)
	let ea = 0x8000000000000000
	let eb = 0x8000000000000000
	let ec = 0x8000000000000000
	let ed = 0x8000000000000000
	let ee = 0x8000000000000000
	let ef = 0x8000000000000000
	let dx = 0x8000000000000000
	let dy = 0x8000000000000000
	let dz = 0x8000000000000000
	let eg = 0x8000000000000000
	let eh = 0x8000000000000000
	let ei = 0x8000000000000000
	let ej = 0x8000000000000000
	const dw = i
	const dv = j
	L2: while (true) {
		const k = h
		if (h != j) {
			const el = d
			const em = g
			const o = ld8(k)
			h = k + 2
			let l = ek
			let m = i
			while (true) {
				B66: {
					if (l == 0) {
						fn_87630(s40, 0x30)
						const af = ld64(s40)
						st64(a + 0x10, ld64(s40 + 8))
						st64(a + 8, af)
						st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
					} else {
						l = l - 1
						const n = ld8(m)
						m = m + 1
						if (n != o) {
							continue
						}
						const p = ld8(k + 1)
						g = em
						d = el
						i = dw
						j = dv
						if (p == 0) {
							continue L2
						}
						const cx = h
						const q = ld64(0x300000000 /* heap bump-allocator cursor */)
						const r = q != 0 ? q : 0x300008000
						const s = r - p * 0x30
						const t = s > r ? 0 : s
						if (0x300000008 > (t & -8)) {
							raw_vec_handle_error(8, p * 0x30, p * 0x30, 0x300000008, r)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, t & -8)
						st64(s20, p)
						let aa = 0
						let ab = 0x2b
						let dd = t & -8
						st64(s18, t & -8, 0)
						while (true) {
							B63: {
								const ad = en + ab
								ag = 0x31
								if (ad - 0x2b != du) {
									const dc = ab
									const dt = aa
									const ae = ld64(ad - 0x23)
									const db = ld64(ad - 0x2b)
									let v = dd
									rc_inc(ae)
									const z = ld64(ad - 0x1b)
									rc_inc(z)
									const cy = ld8(ad - 1)
									const cz = ld8(ad - 2)
									const x = ld8(ad - 3)
									const da = ld64(ad - 0xb)
									const y = ld64(ad - 0x13)
									let u = dt
									if (dt == ld64(s20)) {
										fn_f060(s20, en, z)
										u = dt
										v = ld64(s18)
									}
									const w = u + 1
									dd = v
									st8(v + dc - 1, cy)
									st8(v + dc - 2, cz)
									aa = w
									st8(v + dc - 3, x)
									st64(v + dc - 0xb, da)
									st64(v + dc - 0x13, y)
									st64(v + dc - 0x1b, z)
									st64(v + dc - 0x23, ae)
									st64(v + dc - 0x2b, db)
									st32(v + dc, ld32(s18 + 0x13))
									st8(v + dc + 4, ld8(s18 + 0x17))
									ab = dc + 0x30
									st64(s18 + 8, w)
									if (p > (w as u8)) {
										continue
									}
									B59: {
										en = en + ab - 0x2b
										const ac = ld8(k)
										if ((ac as i64) > 5) {
											if ((ac as i64) > 8) {
												if ((ac as i64) > 0xa) {
													if (ac == 0xb) {
														ag = 0x35
														if (ei != 0x8000000000000000) {
															break B63
														}
														dq = ld64(s18)
														ei = ld64(s20)
														dn = aa
													} else {
														ag = 0x35
														if (ej != 0x8000000000000000) {
															break B63
														}
														ds = ld64(s18)
														ej = ld64(s20)
														dr = aa
													}
												} else if (ac == 9) {
													ag = 0x35
													if (eg != 0x8000000000000000) {
														break B63
													}
													dm = ld64(s18)
													eg = ld64(s20)
													dk = aa
												} else {
													ag = 0x35
													if (eh != 0x8000000000000000) {
														break B63
													}
													dp = ld64(s18)
													eh = ld64(s20)
													dl = aa
												}
											} else if (ac == 6) {
												ag = 0x37
												if (aa > 3) {
													break B63
												}
												ag = 0x35
												if (dx != 0x8000000000000000) {
													break B63
												}
												de = ld64(s18)
												dx = ld64(s20)
												eo = aa
											} else {
												if (ac == 7) {
													ag = 0x37
													if (aa > 3) {
														break B63
													}
													ag = 0x35
													if (dy != 0x8000000000000000) {
														break B63
													}
													g = ld64(s18)
													dy = ld64(s20)
													ep = aa
													break B59
												}
												ag = 0x37
												if (aa > 3) {
													break B63
												}
												ag = 0x35
												if (dz != 0x8000000000000000) {
													break B63
												}
												df = ld64(s18)
												dz = ld64(s20)
												eq = aa
											}
										} else if ((ac as i64) > 2) {
											if (ac == 3) {
												ag = 0x35
												if (ed != 0x8000000000000000) {
													break B63
												}
												di = ld64(s18)
												ed = ld64(s20)
												et = aa
											} else {
												if (ac != 4) {
													ag = 0x35
													if (ef == 0x8000000000000000) {
														d = ld64(s18)
														ef = ld64(s20)
														ev = aa
														g = em
														i = dw
														j = dv
														h = cx
														continue L2
													}
													break B63
												}
												ag = 0x35
												if (ee != 0x8000000000000000) {
													break B63
												}
												dj = ld64(s18)
												ee = ld64(s20)
												eu = aa
											}
										} else if (ac == 0) {
											ag = 0x35
											if (ea != 0x8000000000000000) {
												break B63
											}
											r6 = ld64(s18)
											ea = ld64(s20)
											er = aa
										} else if (ac == 1) {
											ag = 0x35
											if (eb != 0x8000000000000000) {
												break B63
											}
											r9 = ld64(s18)
											eb = ld64(s20)
											dh = aa
										} else {
											ag = 0x35
											if (ec != 0x8000000000000000) {
												break B63
											}
											dg = ld64(s18)
											ec = ld64(s20)
											es = aa
										}
										g = em
									}
									d = el
									i = dw
									j = dv
									h = cx
									continue L2
								}
							}
							fn_87630(s30, ag)
							let ai = aa
							const ah = ld64(s30)
							st64(a + 0x10, ld64(s30 + 8))
							st64(a + 8, ah)
							st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
							if (aa == 0) {
								break
							}
							let aj = ld64(s18) + 0x10
							while (true) {
								const al = ld64(aj)
								const ak = ld64(aj - 8)
								rc_dec(ak)
								rc_dec(al)
								aj = aj + 0x30
								ai = ai - 1
								if (ai == 0) {
									break B66
								}
							}
						}
					}
				}
				const cr = ds
				let f = dr
				const cn = dq
				const at = dg
				if (ea != 0x8000000000000000 && er != 0) {
					let am = r6 + 0x10
					do {
						const aq = ld64(am)
						const ap = ld64(am - 8)
						rc_dec(ap)
						rc_dec(aq)
						am = am + 0x30
						an = er
						er = er - 1
					} while (an != 1)
				}
				const ci = dp
				let ao = dh
				if (eb != 0x8000000000000000 && ao != 0) {
					let ar = r9 + 0x10
					do {
						const av = ld64(ar)
						const au = ld64(ar - 8)
						rc_dec(au)
						rc_dec(av)
						ar = ar + 0x30
						ao = ao - 1
					} while (ao != 0)
				}
				const bx = df
				if (ec != 0x8000000000000000 && es != 0) {
					let aw = at + 0x10
					do {
						const ba = ld64(aw)
						const az = ld64(aw - 8)
						rc_dec(az)
						rc_dec(ba)
						aw = aw + 0x30
						ax = es
						es = es - 1
					} while (ax != 1)
				}
				const cd = dm
				const ay = di
				if (ed != 0x8000000000000000 && et != 0) {
					let bb = ay + 0x10
					do {
						const bf = ld64(bb)
						const be = ld64(bb - 8)
						rc_dec(be)
						rc_dec(bf)
						bb = bb + 0x30
						bc = et
						et = et - 1
					} while (bc != 1)
				}
				const bd = dj
				if (ee != 0x8000000000000000 && eu != 0) {
					let bi = bd + 0x10
					do {
						const bk = ld64(bi)
						const bg = bi
						const bj = ld64(bi - 8)
						rc_dec(bj)
						rc_dec(bk)
						bi = bg + 0x30
						bh = eu
						eu = eu - 1
					} while (bh != 1)
				}
				if (ef != 0x8000000000000000 && ev != 0) {
					let bl = el + 0x10
					do {
						const bp = ld64(bl)
						const bo = ld64(bl - 8)
						rc_dec(bo)
						rc_dec(bp)
						bl = bl + 0x30
						bm = ev
						ev = ev - 1
					} while (bm != 1)
				}
				const bn = de
				if (dx != 0x8000000000000000 && eo != 0) {
					let bs = bn + 0x10
					do {
						const bu = ld64(bs)
						const bq = bs
						const bt = ld64(bs - 8)
						rc_dec(bt)
						rc_dec(bu)
						bs = bq + 0x30
						br = eo
						eo = eo - 1
					} while (br != 1)
				}
				if (dy != 0x8000000000000000 && ep != 0) {
					let bv = em + 0x10
					do {
						const bz = ld64(bv)
						const by = ld64(bv - 8)
						rc_dec(by)
						rc_dec(bz)
						bv = bv + 0x30
						bw = ep
						ep = ep - 1
					} while (bw != 1)
				}
				if (dz != 0x8000000000000000 && eq != 0) {
					let ca = bx + 0x10
					do {
						const cf = ld64(ca)
						const ce = ld64(ca - 8)
						rc_dec(ce)
						rc_dec(cf)
						ca = ca + 0x30
						cb = eq
						eq = eq - 1
					} while (cb != 1)
				}
				let cc = dk
				if (eg != 0x8000000000000000 && cc != 0) {
					let cg = cd + 0x10
					do {
						const ck = ld64(cg)
						const cj = ld64(cg - 8)
						rc_dec(cj)
						rc_dec(ck)
						cg = cg + 0x30
						cc = cc - 1
					} while (cc != 0)
				}
				let ch = dl
				if (eh != 0x8000000000000000 && ch != 0) {
					let cl = ci + 0x10
					do {
						const cp = ld64(cl)
						const co = ld64(cl - 8)
						rc_dec(co)
						rc_dec(cp)
						cl = cl + 0x30
						ch = ch - 1
					} while (ch != 0)
				}
				let cm = dn
				if (ei != 0x8000000000000000 && cm != 0) {
					let cq = cn + 0x10
					do {
						const ct = ld64(cq)
						const cs = ld64(cq - 8)
						rc_dec(cs)
						rc_dec(ct)
						cq = cq + 0x30
						cm = cm - 1
					} while (cm != 0)
				}
				if (ej == 0x8000000000000000) {
					return f
				}
				if (f == 0) {
					return f
				}
				let cu = cr + 0x10
				while (true) {
					const cw = ld64(cu)
					const cv = ld64(cu - 8)
					rc_dec(cv)
					rc_dec(cw)
					cu = cu + 0x30
					f = f - 1
					if (f == 0) {
						return f
					}
				}
			}
		}
		st64(a + 0x128, ds)
		st64(a + 0x120, ej)
		st64(a + 0x118, dn)
		st64(a + 0x110, dq)
		st64(a + 0x108, ei)
		st64(a + 0x100, dl)
		st64(a + 0xf8, dp)
		st64(a + 0xf0, eh)
		st64(a + 0xe8, dk)
		st64(a + 0xe0, dm)
		st64(a + 0xd8, eg)
		st64(a + 0xd0, eq)
		st64(a + 0xc8, df)
		st64(a + 0xc0, dz)
		st64(a + 0xb8, ep)
		st64(a + 0xb0, g)
		st64(a + 0xa8, dy)
		st64(a + 0xa0, eo)
		st64(a + 0x98, de)
		st64(a + 0x90, dx)
		st64(a + 0x88, ev)
		st64(a + 0x80, d)
		st64(a + 0x78, ef)
		st64(a + 0x70, eu)
		st64(a + 0x68, dj)
		st64(a + 0x60, ee)
		st64(a + 0x58, et)
		st64(a + 0x50, di)
		st64(a + 0x48, ed)
		st64(a + 0x40, es)
		st64(a + 0x38, dg)
		st64(a + 0x30, ec)
		st64(a + 0x28, dh)
		st64(a + 0x20, r9)
		st64(a + 0x18, eb)
		st64(a + 0x10, er)
		st64(a + 8, r6)
		st64(a, ea)
		st64(a + 0x130, dr)
		return dr
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), b (value), p5 (value), p6 (value), p8 (value), p9 (value)
// types [heur]: d: TokenAccount_2 (5 of 8 calls pass one, the others an untyped value: fn_3b360, fn_3b6d8, fn_3ba00); p5: TokenAccount_2 (5 of 8 calls pass one, the others an untyped value: fn_3b360, fn_3b6d8, fn_3ba00)
function fn_7e5e0(a: u64, b: u64, c: u64, d: TokenAccount_2, p5: TokenAccount_2, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64): u64 {
	const s68 = fp - 0x68, s70 = fp - 0x70, s90 = fp - 0x90, s98 = fp - 0x98, sa8 = fp - 0xa8, sb0 = fp - 0xb0, se0 = fp - 0xe0, s110 = fp - 0x110, s140 = fp - 0x140, s158 = fp - 0x158, s172 = fp - 0x172, s178 = fp - 0x178, s1a8 = fp - 0x1a8, s1c0 = fp - 0x1c0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s208 = fp - 0x208, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2d8 = fp - 0x2d8, s2e0 = fp - 0x2e0, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, s300 = fp - 0x300, s308 = fp - 0x308, s310 = fp - 0x310, s318 = fp - 0x318, s320 = fp - 0x320, s328 = fp - 0x328, s330 = fp - 0x330, s338 = fp - 0x338, s340 = fp - 0x340, s348 = fp - 0x348, s350 = fp - 0x350, s358 = fp - 0x358, s360 = fp - 0x360, s368 = fp - 0x368, s370 = fp - 0x370, s378 = fp - 0x378, s380 = fp - 0x380, s388 = fp - 0x388, sfd8 = fp - 0xfd8, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let l, m, aq, bd, bg, bk: u64
	st64(s2d8 + 0x40, b)
	let n = fn_82718(sb0, c)
	if (ld8(sb0) != 0) {
		m = ld64(sa8)
		st64(a + 8, ld64(sa8 + 8))
		st64(a, m)
		return n
	}
	st64(s2d8 + 0x30, d)
	st64(s2d8, p10, p11)
	st64(s2d8 + 0x18, p9)
	st64(s2e0, p8)
	st64(s2d8 + 0x28, p7)
	st64(s2d8 + 0x10, p6)
	let q = p5
	const f = ld8(sb0 + 1)
	let k = a
	st64(s2d8 + 0x38, c)
	if ((f & 1) != 0) {
		const g = ld32(sa8 + 8)
		const h = ld64(sa8)
		st16(s140, g >> 0x10)
		st64(sb0, 0x1001598a0)
		st64(sa8 + 8, s210)
		st64(s210, s140, fn_14efa0, s110, fn_14f060)
		st64(s110, ((g << 0x30) | h >> 0x10))
		st64(s90, 0)
		st64(sa8, 2)
		st64(s98, 2)
		// fmt "TFe: {}, {}" {} = g >> 0x10 [fn_14efa0], {} = (g << 0x30) | h >> 0x10 [fn_14f060]
		fn_147e78(se0, sb0, s140)
		const i: AccountInfo = ld64(ld64(s2d8 + 0x28))
		const j: LamportsCell = i.lamports
		const w = ld64(se0 + 8)
		const x = ld64(se0 + 0x10)
		const v = i.key
		rc_inc(j)
		const o: DataCell = i.data
		const p = o.strong
		st64(s2e8, q)
		st64(s2d8 + 0x20, k)
		rc_inc(o, p)
		const u = i.owner
		const t = i.rent_epoch
		const s = i.is_signer
		const r = i.is_writable
		st8(s70 + 2, i.executable)
		st8(s70, s, r)
		st64(s98, v, j, o, u, t)
		st64(s68, 8, 0)
		st64(sb0, 0, 8, 0)
		n = fn_129f28(s220, sb0, w, x)
		m = ld64(s220)
		k = ld64(s2d8 + 0x20)
		q = ld64(s2e8)
		if (m != 2) {
			st64(k + 8, ld64(s220 + 8))
			st64(k, m)
			return n
		}
	}
	const y: AccountInfo = ld64(q + 0x20)
	const z: LamportsCell = y.lamports
	const ae = y.key
	rc_inc(z)
	const aa: DataCell = y.data
	rc_inc(aa)
	B32: {
		const af = y.owner
		const ad = y.rent_epoch
		const ac = y.is_signer
		const ab = y.is_writable
		st8(s1e8 + 2, y.executable)
		st8(s1e8, ac, ab)
		st64(s210, ae, z, aa, af, ad)
		const ag = memcmp(af, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20)
		l = 0
		m = 2
		n = ag as u32
		bk = ld64(s2d8 + 0x40)
		bg = ld64(s2d8 + 0x38)
		if (n != 0) {
			AccountInfo_try_borrow_data(sb0, s210, n)
			const aj = ld64(sa8 + 8)
			const ak = ld64(sa8)
			let ah = ld64(sb0)
			let ai = 0x800000000000001a /* Ok */
			if (ah != 0x800000000000001a /* Ok */) {
				st64(sb0, ah, ak, aj)
				n = fn_13b430(s230, sb0)
				l = ld64(s230 + 8)
				m = ld64(s230)
			} else {
				B26: {
					st64(s2d8 + 0x20, aj)
					const al = ld64(ak + 8)
					aq = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
					if (al != 0x163 && al >= 0xa5) {
						const am = ld64(ak)
						st64(s2e8, am)
						Account_unpack_from_slice_1333d0(sb0, am, 0xa5, ak)
						ai = undef
						ah = ld32(s68 + 0x40)
						if (ah == 2) {
							ah = ld64(sa8 + 8)
							ai = ld64(sa8)
							aq = ld64(sb0)
						} else {
							aq = 0x8000000000000009 /* Err(ProgramError::UninitializedAccount) */
							if (ld8(s68 + 0x24) != 0) {
								ai = 0
								ah = 1
								aq = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
								if (al != 0xa6) {
									B20: {
										B19: {
											if (al != 0xa5) {
												aq = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
												if (ld8(ld64(s2e8) + 0xa5) != 2) {
													break B26
												}
												st64(s2e8, ld64(s2e8) + 0xa6)
												st64(s2f0, al - 0xa6)
												while (true) {
													const df = fn_12e0b0(se0, ai)
													const dc = ld64(s2f0)
													bd = ld64(s2d8 + 0x30)
													const db = ld64(se0 + 0x10)
													if (db > dc) {
														break B19
													}
													const dd = ld64(se0 + 8)
													const de = ld64(se0)
													if (de > dd) {
														fn_14c690(de, dd, 0x100159390, dd, bd)
													}
													st64(s2f8, db)
													if (dd > dc) {
														fn_14c5c0(dd, ld64(s2f0), 0x100159390, dd, bd)
													}
													fn_12e558(sb0, ld64(s2e8) + de, dd - de, df)
													if (ld64(sb0) != 0x800000000000001a /* Ok */) {
														break
													}
													const dg = ld16(sa8)
													bd = ld64(s2d8 + 0x30)
													if (0x1b >= dg) {
														const da = ld64(s2f0)
														const dh = ld64(s2f8)
														if (((1 << (dg & 0x3f)) & 0x802a8a4) != 0) {
															if (dh >= dd) {
																if (dh - dd != 2) {
																	break B19
																}
																const di = ld16(ld64(s2e8) + dd)
																ai = dh > dh + di ? 0xffffffffffffffff : dh + di
																if (da > ai) {
																	continue
																}
																break B19
															}
															fn_14c690(dd, dh, 0x1001593a8, dg, bd)
														}
														if (((1 << (dg & 0x3f)) & 0x7fd565a) != 0) {
															break B19
														}
														if (dg == 8) {
															const dk = ld64(s2e8)
															const dj = k
															if (ld64(s2f8) >= dd) {
																k = dj
																bg = ld64(s2d8 + 0x38)
																bd = ld64(s2d8 + 0x30)
																if (ld64(s2f8) - dd == 2) {
																	const dm = ld16(dk + dd)
																	const dl = ld64(s2f8)
																	const dn = dl > dl + dm ? 0xffffffffffffffff : dl + dm
																	k = dj
																	bg = ld64(s2d8 + 0x38)
																	bd = ld64(s2d8 + 0x30)
																	if (dn > ld64(s2f0)) {
																		break B19
																	}
																	if (dn - ld64(s2f8) == 1) {
																		l = ld8(dk + ld64(s2f8)) != 0
																		k = dj
																		bg = ld64(s2d8 + 0x38)
																		bd = ld64(s2d8 + 0x30)
																		break B20
																	}
																	break B19
																}
																break B19
															}
															fn_14c690(dd, ld64(s2f8), 0x100159378, dj, bd)
														}
													}
													bg = ld64(s2d8 + 0x38)
													break
												}
											}
											bd = ld64(s2d8 + 0x30)
										}
										l = 0
									}
									const an = ld64(s2d8 + 0x20)
									st64(an, ld64(an) - 1)
									const ap = ld64(s208 + 8)
									const ao = ld64(s208)
									bk = ld64(s2d8 + 0x40)
									rc_dec(ao)
									if (!rc_release(ap)) {
										break B32
									}
									st64(ap + 8, ld64(ap + 8) - 1)
									break B32
								}
							}
						}
					}
				}
				st64(sb0, aq, ai, ah)
				n = fn_13b430(s240, sb0)
				l = ld64(s240 + 8)
				m = ld64(s240)
				const ar = ld64(s2d8 + 0x20)
				st64(ar, ld64(ar) - 1)
				bk = ld64(s2d8 + 0x40)
			}
		}
		const au = ld64(s208 + 8)
		const at = ld64(s208)
		rc_dec(at)
		rc_dec(au)
		bd = ld64(s2d8 + 0x30)
		if (m != 2) {
			st64(k + 8, l)
			st64(k, m)
			return n
		}
	}
	if ((l as u8) != 0) {
		const av: AccountInfo = ld64(ld64(s2d8 + 0x28))
		const aw: LamportsCell = av.lamports
		const bc = av.key
		rc_inc(aw)
		const ax: DataCell = av.data
		rc_inc(ax)
		const bb = av.owner
		const ba = av.rent_epoch
		const az = av.is_signer
		const ay = av.is_writable
		st8(s70 + 2, av.executable)
		st8(s70, az, ay)
		st64(s98, bc, aw, ax, bb, ba)
		st64(s68, 8, 0)
		st64(sb0, 0, 8, 0)
		n = fn_129f28(s250, sb0, ld64(s2d8), ld64(s2d8 + 8))
		m = ld64(s250)
		bk = ld64(s2d8 + 0x40)
		bg = ld64(s2d8 + 0x38)
		bd = ld64(s2d8 + 0x30)
		if (m != 2) {
			st64(k + 8, ld64(s250 + 8))
			st64(k, m)
			return n
		}
	}
	st64(s2d8 + 0x20, k)
	const bo = ld64(ld64(ld64(s2d8 + 0x10)))
	const be = ld64(bd + 0x20)
	st64(s2d8 + 0x10, be)
	const bf = ld64(be)
	copyr(s178, bf, 0x20)
	const bh = ld64(bg + 0x58)
	st64(s2d8 + 0x28, bh)
	const bi = ld64(bh)
	copyr(s140, bi, 0x20)
	const bj = y.key
	copyr(s110, bj, 0x20)
	const bl = ld64(bk)
	st64(s2d8 + 0x30, bl)
	const bm = ld64(bl)
	copyr(se0, bm, 0x20)
	const bn = ld8(bg + 0x30)
	st64(sff8 + 0x18, ld64(s2d8 + 0x18))
	st64(sfd8, bn)
	st64(s1000, s110, se0, 8, 0)
	fn_131a40(sb0, bo, s178, s140, s110, se0, 8, 0, ld64(sff8 + 0x18), bn)
	copy(s1c0, sa8, 0x18)
	const bp = ld64(sb0)
	if (bp == 0x8000000000000000) {
		n = fn_13b430(s290, s1c0)
		m = ld64(s290)
		k = ld64(s2d8 + 0x20)
		st64(k + 8, ld64(s290 + 8))
		st64(k, m)
		return n
	}
	memcpy(s1f0, s90, 0x30)
	st64(s210, bp)
	copy(s208, s1c0, 0x18)
	const bq = ld64(0x300000000 /* heap bump-allocator cursor */)
	const bw: AccountInfo = ld64(s2d8 + 0x28)
	let br = bq != 0 ? sat_sub(bq, 0xc0) & -8 : 0x300007f40
	const bs: AccountInfo = ld64(s2d8 + 0x10)
	if (br > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, br)
		const bt: LamportsCell = bs.lamports
		const bu = bt.strong
		st64(s2d8 + 8, bs.key)
		rc_inc(bt, bu)
		const bv: DataCell = bs.data
		rc_inc(bv)
		const bx: LamportsCell = bw.lamports
		st64(s2d8 + 0x38, bx)
		const by = bx.strong
		st64(s310, bw.key)
		st64(s308, bs.executable)
		st64(s300, bs.is_writable)
		st64(s2f8, bs.is_signer)
		st64(s2f0, bs.rent_epoch)
		st64(s2e8, bs.owner)
		rc_inc(ld64(s2d8 + 0x38), by)
		const bz: DataCell = bw.data
		rc_inc(bz)
		const ca: LamportsCell = y.lamports
		const cb = ca.strong
		st64(s318, bv)
		st64(s340, y.key)
		st64(s338, bw.executable)
		st64(s330, bw.is_writable)
		st64(s328, bw.is_signer)
		st64(s320, bw.rent_epoch)
		const ch = bw.owner
		rc_inc(ca, cb)
		const cc: DataCell = y.data
		const cd = cc.strong
		st64(s348, ca)
		rc_inc(cc, cd)
		st64(s2d8, bz)
		const ce = ld64(s2d8 + 0x30)
		const cf = ld64(ce + 8)
		const cg = ld64(cf)
		st64(s378, ld64(ce))
		st64(s370, y.executable)
		st64(s368, y.is_writable)
		st64(s360, y.is_signer)
		st64(s358, y.rent_epoch)
		st64(s350, y.owner)
		rc_inc(cf, cg)
		st64(s388, ch)
		const ci = ld64(ce + 0x10)
		const cj = ld64(ci)
		st64(s380, bt)
		st64(ci, cj + 1)
		if (cj != -1) {
			B50: {
				const ck: AccountInfo = ld64(s2d8 + 0x30)
				const co = ck.owner
				const cn = ck.rent_epoch
				const cm = ck.is_signer
				const cl = ck.is_writable
				st8(br + 0xba, ck.executable)
				st8(br + 0xb9, cl)
				st8(br + 0xb8, cm)
				st64(br + 0xb0, cn)
				st64(br + 0xa8, co)
				st64(br + 0xa0, ci)
				st64(br + 0x98, cf)
				st64(br + 0x90, ld64(s378))
				st8(br + 0x8a, ld64(s370))
				st8(br + 0x89, ld64(s368))
				st8(br + 0x88, ld64(s360))
				st64(br + 0x80, ld64(s358))
				st64(br + 0x78, ld64(s350))
				st64(br + 0x70, cc)
				st64(br + 0x68, ld64(s348))
				st64(br + 0x60, ld64(s340))
				st8(br + 0x5a, ld64(s338))
				st8(br + 0x59, ld64(s330))
				st8(br + 0x58, ld64(s328))
				st64(br + 0x50, ld64(s320))
				st64(br + 0x48, ld64(s388))
				st64(br + 0x40, ld64(s2d8))
				st64(br + 0x38, ld64(s2d8 + 0x38))
				st64(br + 0x30, ld64(s310))
				st8(br + 0x2a, ld64(s308))
				st8(br + 0x29, ld64(s300))
				st8(br + 0x28, ld64(s2f8))
				st64(br + 0x20, ld64(s2f0))
				st64(br + 0x18, ld64(s2e8))
				st64(br + 0x10, ld64(s318))
				st64(br + 8, ld64(s380))
				st64(br, ld64(s2d8 + 8))
				st64(s1a8, 4, br, 4)
				const cp = ld64(s2d8 + 0x28)
				n = fn_804a8(sb0, cp)
				if (ld8(sb0) == 0) {
					st32(s1a8 + 0x28, ld32(sb0 + 2))
					st16(s1a8 + 0x2c, ld16(sb0 + 6))
					st64(s1a8 + 0x18, ld64(s98))
					st16(s1a8 + 0x20, ld16(s90))
					let cy = 4
					if ((ld8(sb0 + 1) & 1) != 0) {
						const cu = ld64(sa8 + 8)
						const cv = ld64(sa8)
						st16(s172 + 0x18, ld16(s1a8 + 0x20))
						st64(s172 + 0x10, ld64(s1a8 + 0x18))
						st16(s178 + 4, ld16(s1a8 + 0x2c))
						st32(s178, ld32(s1a8 + 0x28))
						st64(s172, cv, cu)
						const cw = ld64(s2e0)
						if (ld64(cw) == 0x8000000000000000) {
							n = fn_87630(s270, 0x32)
							l = ld64(s270 + 8)
							m = ld64(s270)
							break B50
						}
						copyr(s2d8, cw + 8, 0x10)
						st64(s2d8 + 0x38, s140)
						AccountInfo_clone(s140, ld64(s2d8 + 0x10))
						AccountInfo_clone(s110, cp)
						AccountInfo_clone(se0, y)
						AccountInfo_clone(sb0, ld64(s2d8 + 0x30))
						copy(sfd8, s2d8, 0x10)
						st64(sff8 + 0x18, ld64(s2d8 + 0x18))
						st64(sff8, s110, se0, sb0)
						st64(s1000, ld64(s2d8 + 0x38))
						fn_1225a0(s158, s210, s1a8, s178, ld64(s1000), s110, se0, sb0, ld64(sff8 + 0x18), ld64(sfd8), ld64(sfd8 + 8))
						if (ld64(s158) != 0x800000000000001a /* Ok */) {
							copyr(sb0, s158, 0x18)
							n = fn_13b430(s260, sb0)
							l = ld64(s260 + 8)
							m = ld64(s260)
							break B50
						}
						cy = ld64(s1a8 + 0x10)
						br = ld64(s1a8 + 8)
					}
					st64(s140, sb0)
					const cx = ld64(s2d8 + 0x40)
					st64(s68 + 8, cx + 0x28c)
					st64(s70, cx + 0x286)
					st64(s90 + 0x10, cx + 0x1e8)
					st64(s90, cx + 0x1a8)
					st64(sa8 + 8, cx + 0x188)
					st64(sb0, 0x100152b28)
					st64(s140 + 8, 6)
					st64(s68 + 0x10, 1)
					st64(s68, 2)
					st64(s90 + 0x18, 0x20)
					st64(s90 + 8, 0x20)
					st64(s98, 0x20)
					st64(sa8, 9)
					st64(s1000, s140, 1)
					const cz = fn_1390d8(s110, s210, br, cy, fp)
					if (ld64(s110) == 0x800000000000001a /* Ok */) {
						n = fn_c640(s1a8, cz)
						k = ld64(s2d8 + 0x20)
						st64(k + 8, undef)
						st64(k, 2)
						return n
					}
					copyr(se0, s110, 0x18)
					n = fn_13b430(s280, se0)
					l = ld64(s280 + 8)
					m = ld64(s280)
				} else {
					l = ld64(sa8 + 8)
					m = ld64(sa8)
				}
			}
			k = ld64(s2d8 + 0x20)
			let cq = ld64(s1a8 + 0x10)
			if (cq == 0) {
				st64(k + 8, l)
				st64(k, m)
				return n
			}
			let cr = ld64(s1a8 + 8) + 0x10
			while (true) {
				const ct = ld64(cr)
				const cs = ld64(cr - 8)
				rc_dec(cs)
				n = ld64(ct) - 1
				st64(ct, n)
				if (n == 0) {
					n = ld64(ct + 8) - 1
					st64(ct + 8, n)
				}
				cr = cr + 0x30
				cq = cq - 1
				if (cq == 0) {
					st64(k + 8, l)
					st64(k, m)
					return n
				}
			}
		}
		abort()
	}
	alloc_handle_alloc_error(8, 0xc0)
}

function fn_c9a0(a: u64, r0: u64): u64 {
	if (ld64(a) != 0x8000000000000000) {
		let f = ld64(a + 0x10)
		if (f != 0) {
			let g = ld64(a + 8) + 0x10
			do {
				const j = ld64(g)
				const i = ld64(g - 8)
				rc_dec(i)
				r0 = ld64(j) - 1
				st64(j, r0)
				if (r0 == 0) {
					r0 = ld64(j + 8) - 1
					st64(j + 8, r0)
				}
				g = g + 0x30
				f = f - 1
			} while (f != 0)
		}
	}
	if (ld64(a + 0x18) != 0x8000000000000000) {
		let h = ld64(a + 0x28)
		if (h != 0) {
			let k = ld64(a + 0x20) + 0x10
			do {
				const n = ld64(k)
				const m = ld64(k - 8)
				r0 = ld64(m) - 1
				st64(m, r0)
				if (r0 == 0) {
					r0 = ld64(m + 8) - 1
					st64(m + 8, r0)
				}
				rc_dec(n)
				k = k + 0x30
				h = h - 1
			} while (h != 0)
		}
	}
	if (ld64(a + 0x30) != 0x8000000000000000) {
		let l = ld64(a + 0x40)
		if (l != 0) {
			let o = ld64(a + 0x38) + 0x10
			do {
				const r = ld64(o)
				const q = ld64(o - 8)
				rc_dec(q)
				r0 = ld64(r) - 1
				st64(r, r0)
				if (r0 == 0) {
					r0 = ld64(r + 8) - 1
					st64(r + 8, r0)
				}
				o = o + 0x30
				l = l - 1
			} while (l != 0)
		}
	}
	if (ld64(a + 0x48) != 0x8000000000000000) {
		let p = ld64(a + 0x58)
		if (p != 0) {
			let s = ld64(a + 0x50) + 0x10
			do {
				const v = ld64(s)
				const u = ld64(s - 8)
				r0 = ld64(u) - 1
				st64(u, r0)
				if (r0 == 0) {
					r0 = ld64(u + 8) - 1
					st64(u + 8, r0)
				}
				rc_dec(v)
				s = s + 0x30
				p = p - 1
			} while (p != 0)
		}
	}
	if (ld64(a + 0x60) != 0x8000000000000000) {
		let t = ld64(a + 0x70)
		if (t != 0) {
			let w = ld64(a + 0x68) + 0x10
			do {
				const z = ld64(w)
				const y = ld64(w - 8)
				rc_dec(y)
				r0 = ld64(z) - 1
				st64(z, r0)
				if (r0 == 0) {
					r0 = ld64(z + 8) - 1
					st64(z + 8, r0)
				}
				w = w + 0x30
				t = t - 1
			} while (t != 0)
		}
	}
	if (ld64(a + 0x78) != 0x8000000000000000) {
		let x = ld64(a + 0x88)
		if (x != 0) {
			let aa = ld64(a + 0x80) + 0x10
			do {
				const ad = ld64(aa)
				const ac = ld64(aa - 8)
				r0 = ld64(ac) - 1
				st64(ac, r0)
				if (r0 == 0) {
					r0 = ld64(ac + 8) - 1
					st64(ac + 8, r0)
				}
				rc_dec(ad)
				aa = aa + 0x30
				x = x - 1
			} while (x != 0)
		}
	}
	if (ld64(a + 0x90) != 0x8000000000000000) {
		let ab = ld64(a + 0xa0)
		if (ab != 0) {
			let ae = ld64(a + 0x98) + 0x10
			do {
				const ah = ld64(ae)
				const ag = ld64(ae - 8)
				rc_dec(ag)
				r0 = ld64(ah) - 1
				st64(ah, r0)
				if (r0 == 0) {
					r0 = ld64(ah + 8) - 1
					st64(ah + 8, r0)
				}
				ae = ae + 0x30
				ab = ab - 1
			} while (ab != 0)
		}
	}
	if (ld64(a + 0xa8) != 0x8000000000000000) {
		let af = ld64(a + 0xb8)
		if (af != 0) {
			let ai = ld64(a + 0xb0) + 0x10
			do {
				const al = ld64(ai)
				const ak = ld64(ai - 8)
				r0 = ld64(ak) - 1
				st64(ak, r0)
				if (r0 == 0) {
					r0 = ld64(ak + 8) - 1
					st64(ak + 8, r0)
				}
				rc_dec(al)
				ai = ai + 0x30
				af = af - 1
			} while (af != 0)
		}
	}
	if (ld64(a + 0xc0) != 0x8000000000000000) {
		let aj = ld64(a + 0xd0)
		if (aj != 0) {
			let am = ld64(a + 0xc8) + 0x10
			do {
				const ap = ld64(am)
				const ao = ld64(am - 8)
				rc_dec(ao)
				r0 = ld64(ap) - 1
				st64(ap, r0)
				if (r0 == 0) {
					r0 = ld64(ap + 8) - 1
					st64(ap + 8, r0)
				}
				am = am + 0x30
				aj = aj - 1
			} while (aj != 0)
		}
	}
	if (ld64(a + 0xd8) != 0x8000000000000000) {
		let an = ld64(a + 0xe8)
		if (an != 0) {
			let aq = ld64(a + 0xe0) + 0x10
			do {
				const au = ld64(aq)
				const at = ld64(aq - 8)
				r0 = ld64(at) - 1
				st64(at, r0)
				if (r0 == 0) {
					r0 = ld64(at + 8) - 1
					st64(at + 8, r0)
				}
				rc_dec(au)
				aq = aq + 0x30
				an = an - 1
			} while (an != 0)
		}
	}
	if (ld64(a + 0xf0) != 0x8000000000000000) {
		let ar = ld64(a + 0x100)
		if (ar != 0) {
			let av = ld64(a + 0xf8) + 0x10
			do {
				const ay = ld64(av)
				const ax = ld64(av - 8)
				rc_dec(ax)
				r0 = ld64(ay) - 1
				st64(ay, r0)
				if (r0 == 0) {
					r0 = ld64(ay + 8) - 1
					st64(ay + 8, r0)
				}
				av = av + 0x30
				ar = ar - 1
			} while (ar != 0)
		}
	}
	if (ld64(a + 0x108) != 0x8000000000000000) {
		let aw = ld64(a + 0x118)
		if (aw != 0) {
			let az = ld64(a + 0x110) + 0x10
			do {
				const bc = ld64(az)
				const bb = ld64(az - 8)
				r0 = ld64(bb) - 1
				st64(bb, r0)
				if (r0 == 0) {
					r0 = ld64(bb + 8) - 1
					st64(bb + 8, r0)
				}
				rc_dec(bc)
				az = az + 0x30
				aw = aw - 1
			} while (aw != 0)
		}
	}
	if (ld64(a + 0x120) == 0x8000000000000000) {
		return r0
	}
	let ba = ld64(a + 0x130)
	if (ba == 0) {
		return r0
	}
	let bd = ld64(a + 0x128) + 0x10
	while (true) {
		const bf = ld64(bd)
		const be = ld64(bd - 8)
		rc_dec(be)
		rc_dec(bf)
		bd = bd + 0x30
		ba = ba - 1
		if (ba == 0) {
			return r0
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_5a40(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let t, u, v: u64
	const f = memcmp(c, d, 0x20)
	let q = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, q)
		st64(a, 2)
		return g
	}
	const h = ld64(b)
	g = common_is_closed(h)
	q = undef
	if (g != 0) {
		st64(a + 8, q)
		st64(a, 2)
		return g
	}
	fn_143448(s28, h, g)
	const m = ld64(s28 + 0x10)
	const j = ld64(s28 + 8)
	const i = ld64(s28)
	if (i != 0x800000000000001a /* Ok */) {
		st64(s28, i, j, m)
		g = fn_13b430(s38, s28)
		const x = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, x)
		return g
	}
	B21: {
		const k = ld64(j)
		st64(s28 + 8, ld64(j + 8))
		st64(s28, k)
		st64(s28 + 0x10, 0)
		g = fn_13ae08(s28, 0x100151f30, 8)
		if (g == 0) {
			g = fn_13ae08(s28, b + 8, 0x20)
			if (g == 0) {
				g = fn_13ae08(s28, b + 0x28, 0x20)
				if (g == 0) {
					const n = ld64(b + 0x48)
					st64(s10 + 8, ld64(b + 0x50))
					st64(s10, n)
					g = fn_13ae08(s28, s10, 0x10)
					if (g == 0) {
						st32(s10, ld32(b + 0xd0))
						g = fn_13ae08(s28, s10, 4)
						if (g == 0) {
							st32(s10, ld32(b + 0xd4))
							g = fn_13ae08(s28, s10, 4)
							if (g == 0) {
								const o = ld64(b + 0x58)
								st64(s10 + 8, ld64(b + 0x60))
								st64(s10, o)
								g = fn_13ae08(s28, s10, 0x10)
								if (g == 0) {
									st64(s10, ld64(b + 0x78))
									g = fn_13ae08(s28, s10, 8)
									if (g == 0) {
										const p = ld64(b + 0x68)
										st64(s10 + 8, ld64(b + 0x70))
										st64(s10, p)
										g = fn_13ae08(s28, s10, 0x10)
										if (g == 0) {
											st64(s10, ld64(b + 0x80))
											g = fn_13ae08(s28, s10, 8)
											if (g == 0) {
												g = fn_fa00(b + 0x88, s28)
												if (g == 0) {
													q = ld64(m) + 1
													st64(m, q)
													st64(a + 8, q)
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
			const r = g
			if (2 > (g & 3) - 2) {
				break B21
			}
			if ((r & 3) == 0) {
				break B21
			}
		} else {
			const l = g
			if (2 > (g & 3) - 2) {
				break B21
			}
			if ((l & 3) == 0) {
				break B21
			}
		}
		const s = ld64(ld64(g + 7))
		callx(s, ld64(g - 1), s)
	}
	g = anchor_error_from(s48, 0xbbc /* anchor::AccountDidNotSerialize */, t, u, v)
	q = ld64(s48 + 8)
	const w = ld64(s48)
	st64(m, ld64(m) + 1)
	st64(a + 8, q)
	st64(a, w != 2 ? w : 2)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it)
function fn_149678(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70
	st64(s70, a, b, c, d, 0x10015b920)
	st64(s50 + 0x10, s20)
	st64(s20, s70, T_fmt_14f0b8, s60, T_fmt_14f088)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "{}: {}" {} = a [T_fmt_14f0b8], {} = c [T_fmt_14f088]
	fn_149478(s50, e, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (value)
function fn_82718(a: u64, b: u64): u64 {
	const s68 = fp - 0x68, s88 = fp - 0x88, s90 = fp - 0x90, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8
	let y: u64
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
	let n = memcmp(m, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32
	if (n == 0) {
		st16(a, 0)
	} else {
		const q = AccountInfo_try_borrow_data(s68, sb8, n)
		let v = ld64(s68 + 0x10)
		const p = ld64(s68 + 8)
		const o = ld64(s68)
		if (o == 0x800000000000001a /* Ok */) {
			B7: {
				n = fn_afd0(s68, ld64(p), ld64(p + 8), undef, undef, q)
				if (ld32(s68) != 2) {
					const ao = v
					const z = ld64(s68 + 0x60)
					if (z != 0) {
						const ae = ld64(s68 + 0x58)
						let aa = 0
						do {
							n = fn_12e0b0(s88, aa)
							const ab = ld64(s88 + 0x10)
							if (ab > z) {
								break
							}
							const ac = ld64(s88 + 8)
							const ad = ld64(s88)
							if (ad > ac) {
								fn_14c690(ad, ac, 0x100159390)
							}
							if (ac > z) {
								fn_14c5c0(ac, z, 0x100159390)
							}
							n = fn_12e558(s68, ae + ad, ac - ad, n)
							if (ld64(s68) != 0x800000000000001a /* Ok */) {
								break
							}
							const af = ld16(s68 + 8)
							if (af > 0x1b) {
								break
							}
							if (((1 << (af & 0x3f)) & 0x7fd5658) == 0) {
								if (((1 << (af & 0x3f)) & 0x802a9a4) != 0) {
									break
								}
								if (af == 1) {
									if (ab >= ac) {
										if (ab - ac == 2) {
											const ah = ld16(ae + ac)
											const ai = ab > ab + ah ? 0xffffffffffffffff : ab + ah
											if (ai > z) {
												break
											}
											if (ai - ab == 0x6c) {
												n = clock_get_13f308(s68)
												if (ld64(s68) == 0) {
													const an = ld64(ae + ab + 0x5a) > ld64(s68 + 0x18) ? ae + ab + 0x48 : ae + ab + 0x5a
													st16(a + 0x12, ld16(an + 0x10))
													st64(a + 0xa, ld64(an + 8))
													st64(a + 2, ld64(an))
													st16(a, 0x100)
												} else {
													const ak = ld64(s68 + 8)
													const aj = ld64(s68 + 0x10)
													st64(s68 + 0x10, ld64(s68 + 0x18))
													st64(s68, ak, aj)
													n = fn_13b430(sd8, s68)
													const al = ld64(sd8)
													st64(a + 0x10, ld64(sd8 + 8))
													st64(a + 8, al)
													st8(a, 1)
												}
												v = ao
												break B7
											}
											break
										}
										break
									}
									fn_14c690(ac, ab, 0x100159378)
								}
								break
							}
							if (ac > ab) {
								fn_14c690(ac, ab, 0x1001593a8)
							}
							if (ab - ac != 2) {
								break
							}
							const ag = ld16(ae + ac)
							aa = ab > ab + ag ? 0xffffffffffffffff : ab + ag
						} while (z > aa)
					}
					st16(a, 0)
					st64(ao, ld64(ao) - 1)
					y = ld64(sb8 + 0x10)
					const am: LamportsCell = ld64(sb8 + 8)
					rc_dec(am)
					if (!rc_release(y)) {
						return n
					}
					st64(y + 8, ld64(y + 8) - 1)
					return n
				}
				const r = ld64(s68 + 0x18)
				st64(s88 + 0x14, r)
				const s = ld64(s68 + 0x10)
				st64(s88 + 0xc, s)
				const t = ld64(s68 + 8)
				st64(s88 + 4, t)
				st64(s68, t, s, r)
				n = fn_13b430(se8, s68)
				const u = ld64(se8)
				st64(a + 0x10, ld64(se8 + 8))
				st64(a + 8, u)
				st8(a, 1)
			}
			st64(v, ld64(v) - 1)
		} else {
			st64(s68, o, p, v)
			n = fn_13b430(sc8, s68)
			const w = ld64(sc8)
			st64(a + 0x10, ld64(sc8 + 8))
			st64(a + 8, w)
			st8(a, 1)
		}
	}
	y = ld64(sb8 + 0x10)
	const x: LamportsCell = ld64(sb8 + 8)
	rc_dec(x)
	if (!rc_release(y)) {
		return n
	}
	st64(y + 8, ld64(y + 8) - 1)
	return n
}

function fn_14efa0(a: u64, b: u64): u64 {
	return fn_14ecd0(ld16(a), 1, b)
}

function fn_14f060(a: u64, b: u64): u64 {
	return fn_14ecd0(ld64(a), 1, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), c (value), d (value)
function fn_129f28(a: u64, b: u64, c: u64, d: u64): u64 {
	const s18 = fp - 0x18, s68 = fp - 0x68, s78 = fp - 0x78, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let g = ld64(b + 8)
	let f = ld64(b + 0x10)
	if (f != 0) {
		const s = g
		const h = f
		const i = __rust_alloc(f << 3, 8)
		if (i == 0) {
			raw_vec_handle_error(8, h << 3)
		}
		let j = s
		let k = i
		let l = f
		while (true) {
			st64(k, ld64(j))
			j = j + 0x30
			k = k + 8
			l = l - 1
			if (l == 0) {
				fn_83078(fn_136a70(s68, c, d, i, f))
				g = s
				break
			}
		}
	} else {
		fn_136a70(s68, c, d, 8, 0)
	}
	const m = ld64(b + 0x50)
	st64(s1000, ld64(b + 0x48))
	st64(sff8, m)
	let n = fn_13eea8(s18, s68, g, f, ld64(s1000), m)
	let r = 2
	if (ld64(s18) != 0x800000000000001a /* Ok */) {
		n = fn_13b430(s78, s18)
		f = ld64(s78 + 8)
		r = ld64(s78)
	}
	if (ld64(s68) != 0) {
		n = fn_83078(n)
	}
	if (ld64(s68 + 0x18) != 0) {
		n = fn_83078(n)
	}
	let p = ptr_drop_in_place_126088(b, n)
	const q = ld64(b + 0x28)
	const o = ld64(b + 0x20)
	if (rc_release(o)) {
		if (rc_release(o + 8)) {
			p = fn_83078(p)
		}
	}
	if (!rc_release(q)) {
		st64(a + 8, f)
		st64(a, r)
		return p
	}
	if (!rc_release(q + 8)) {
		st64(a + 8, f)
		st64(a, r)
		return p
	}
	p = fn_83078(p)
	st64(a + 8, f)
	st64(a, r)
	return p
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it), c (points to it), b (value), a (points to it), p5 (points to it), p6 (points to it), p9 (value), p10 (value)
function fn_131a40(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s80 = fp - 0x80
	let l, m, w, x, y: u64
	const f = memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20)
	const h = p10
	const g = p9
	const i = p8
	let o = p7
	const z = p6
	const aa = p5
	if ((f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	st8(s40, h)
	st64(s50 + 8, g)
	st32(s50, 0xc)
	const n = fn_12e9c0(s80, s50)
	let j = i + 4
	if (j == 0) {
		st64(s68, 0, 1, 0)
		copyr(s50, c, 0x20)
		fn_12d0a0(s68, c, n)
		m = undef
		j = ld64(s68)
		l = ld64(s68 + 8)
	} else {
		const k = j
		if (j > 0x3c3c3c3c3c3c3c3) {
			raw_vec_handle_error(0, k * 0x22, w, x, y)
		}
		l = __rust_alloc(k * 0x22, 1)
		if (l == 0) {
			raw_vec_handle_error(1, k * 0x22, w, x, y)
		}
		st64(s68, j, l)
		m = c
		copyr(s50, c, 0x20)
	}
	st64(l + 0x18, ld64(s38))
	st64(l + 0x10, ld64(s40))
	st64(l + 8, ld64(s50 + 8))
	st64(l, ld64(s50))
	st16(l + 0x20, 0x100)
	st64(s68 + 0x10, 1)
	if (j == 1) {
		fn_12d0a0(s68, m, l)
		j = ld64(s68)
		l = ld64(s68 + 8)
	}
	st64(l + 0x3a, ld64(d + 0x18))
	st64(l + 0x32, ld64(d + 0x10))
	st64(l + 0x2a, ld64(d + 8))
	st64(l + 0x22, ld64(d))
	st16(l + 0x42, 0)
	st64(s68 + 0x10, 2)
	if (j == 2) {
		fn_12d0a0(s68, d, l)
		j = ld64(s68)
		l = ld64(s68 + 8)
	}
	let v = b
	st64(l + 0x5c, ld64(aa + 0x18))
	st64(l + 0x54, ld64(aa + 0x10))
	st64(l + 0x4c, ld64(aa + 8))
	st64(l + 0x44, ld64(aa))
	st16(l + 0x64, 0x100)
	st64(s68 + 0x10, 3)
	if (j == 3) {
		fn_12d0a0(s68, aa, l)
		v = b
		l = ld64(s68 + 8)
	}
	st64(l + 0x7e, ld64(z + 0x18))
	st64(l + 0x76, ld64(z + 0x10))
	st64(l + 0x6e, ld64(z + 8))
	st64(l + 0x66, ld64(z))
	st8(l + 0x86, i == 0, 0)
	st64(s68 + 0x10, 4)
	if (i != 0) {
		let r = 4
		let p = 0
		let s = i << 3
		do {
			const t = ld64(o)
			copyr(s40, t + 0x10, 0x10)
			const u = ld64(t + 8)
			st64(s50 + 8, u)
			st64(s50, ld64(t))
			if (r == ld64(s68)) {
				fn_12d0a0(s68, u, l)
				v = b
				l = ld64(s68 + 8)
			}
			o = o + 8
			const q = l + p
			st64(q + 0xa0, ld64(s38))
			st64(q + 0x98, ld64(s40))
			st64(q + 0x90, ld64(s50 + 8))
			st64(q + 0x88, ld64(s50))
			st16(q + 0xa8, 1)
			p = p + 0x22
			r = r + 1
			st64(s68 + 0x10, r)
			s = s - 8
		} while (s != 0)
	}
	copyr(s20, v, 0x20)
	copy(s50, s68, 0x18)
	copy(s38, s80, 0x18)
	memcpy(a, s50, 0x50)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (value)
function fn_804a8(a: u64, b: AccountInfo): u64 {
	const s20 = fp - 0x20, s88 = fp - 0x88, s90 = fp - 0x90, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8
	let x: u64
	const f: LamportsCell = b.lamports
	const k = b.key
	rc_inc(f)
	const g: DataCell = b.data
	rc_inc(g)
	const l = b.owner
	const j = b.rent_epoch
	const i = b.is_signer
	const h = b.is_writable
	st8(s90 + 2, b.executable)
	st8(s90, i, h)
	st64(sb8, k, f, g, l, j)
	let m = memcmp(l, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32
	if (m == 0) {
		st16(a, 0)
	} else {
		const p = AccountInfo_try_borrow_data(s88, sb8, m)
		const u = ld64(s88 + 0x10)
		const o = ld64(s88 + 8)
		const n = ld64(s88)
		if (n == 0x800000000000001a /* Ok */) {
			m = fn_afd0(s88, ld64(o), ld64(o + 8), undef, undef, p)
			if (ld32(s88) != 2) {
				B33: {
					const y = ld64(s88 + 0x60)
					if (y != 0) {
						const ai = ld64(s88 + 0x58)
						let z = 0
						do {
							m = fn_12e0b0(s20, z)
							const aa = ld64(s20 + 0x10)
							if (aa > y) {
								break
							}
							const ab = ld64(s20 + 8)
							const ac = ld64(s20)
							if (ac > ab) {
								fn_14c690(ac, ab, 0x100159390)
							}
							if (ab > y) {
								fn_14c5c0(ab, y, 0x100159390)
							}
							m = fn_12e558(s88, ai + ac, ab - ac, m)
							if (ld64(s88) != 0x800000000000001a /* Ok */) {
								break
							}
							const ad = ld16(s88 + 8)
							if (ad > 0x1b) {
								break
							}
							if (((1 << (ad & 0x3f)) & 0x7fd165a) == 0) {
								if (((1 << (ad & 0x3f)) & 0x802a9a4) != 0) {
									break
								}
								if (ad == 0xe) {
									if (aa >= ab) {
										if (aa - ab == 2) {
											const af = ld16(ai + ab)
											const ag = aa > aa + af ? 0xffffffffffffffff : aa + af
											if (ag > y) {
												break
											}
											if (ag - aa != 0x40) {
												break
											}
											copyr(s20, ai + aa + 0x20, 0x20)
											m = fn_138ab8(s88, s20)
											break B33
										}
										break
									}
									fn_14c690(ab, aa, 0x100159378)
								}
								break
							}
							if (ab > aa) {
								fn_14c690(ab, aa, 0x1001593a8)
							}
							if (aa - ab != 2) {
								break
							}
							const ae = ld16(ai + ab)
							z = aa > aa + ae ? 0xffffffffffffffff : aa + ae
						} while (y > z)
					}
					st8(s88, 0)
				}
				st8(a + 0x21, ld8(s88 + 0x20))
				st64(a + 0x19, ld64(s88 + 0x18))
				st64(a + 0x11, ld64(s88 + 0x10))
				st64(a + 9, ld64(s88 + 8))
				st64(a + 1, ld64(s88))
				st8(a, 0)
				st64(u, ld64(u) - 1)
				x = ld64(sb8 + 0x10)
				const ah: LamportsCell = ld64(sb8 + 8)
				rc_dec(ah)
				if (!rc_release(x)) {
					return m
				}
				st64(x + 8, ld64(x + 8) - 1)
				return m
			}
			const q = ld64(s88 + 0x18)
			st64(s20 + 0x14, q)
			const r = ld64(s88 + 0x10)
			st64(s20 + 0xc, r)
			const s = ld64(s88 + 8)
			st64(s20 + 4, s)
			st64(s88, s, r, q)
			m = fn_13b430(sd8, s88)
			const t = ld64(sd8)
			st64(a + 0x10, ld64(sd8 + 8))
			st64(a + 8, t)
			st8(a, 1)
			st64(u, ld64(u) - 1)
		} else {
			st64(s88, n, o, u)
			m = fn_13b430(sc8, s88)
			const v = ld64(sc8)
			st64(a + 0x10, ld64(sc8 + 8))
			st64(a + 8, v)
			st8(a, 1)
		}
	}
	x = ld64(sb8 + 0x10)
	const w: LamportsCell = ld64(sb8 + 8)
	rc_dec(w)
	if (!rc_release(x)) {
		return m
	}
	st64(x + 8, ld64(x + 8) - 1)
	return m
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it), b (points to it), d (points to it), p5 (value), p6 (points to it), p7 (points to it), p8 (points to it), p9 (value), p10 (value), p11 (value)
function fn_1225a0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64) {
	const s18 = fp - 0x18, s20 = fp - 0x20, s38 = fp - 0x38, s50 = fp - 0x50, s70 = fp - 0x70, s88 = fp - 0x88, sa0 = fp - 0xa0, sc0 = fp - 0xc0
	let z, aa, ab, ae, ao, dg: u64
	const f = p6
	const g = ld64(f)
	st64(s20, 0x100155d9d)
	let dn = g
	st64(s18, 0x13, g, 0x20)
	let dr = d
	// PDA find_program_address(["extra-account-metas", *g [ix data?]], program *d)
	let m = Pubkey_find_program_address(sa0, s20, 2, d)
	copy(sc0, sa0, 0x20)
	let j = 0
	const h = p10
	let dp = p9
	const dj = p8
	const dk = p7
	const dl = p5
	const i = p11
	let dm = i
	while (true) {
		if (i * 0x30 == j) {
			st64(a, 0x8000000000000000)
			st32(a + 8, 0x7dc8348c)
			const t = ld64(dj + 0x10)
			const s = ld64(dj + 8)
			if (rc_release(s)) {
				if (rc_release(s + 8)) {
					m = fn_83078(m)
				}
			}
			if (rc_release(t)) {
				if (rc_release(t + 8)) {
					m = fn_83078(m)
				}
			}
			const v = ld64(dk + 0x10)
			const u = ld64(dk + 8)
			if (rc_release(u)) {
				if (rc_release(u + 8)) {
					m = fn_83078(m)
				}
			}
			if (rc_release(v)) {
				if (rc_release(v + 8)) {
					m = fn_83078(m)
				}
			}
			const x = ld64(f + 0x10)
			const w = ld64(f + 8)
			if (rc_release(w)) {
				if (rc_release(w + 8)) {
					m = fn_83078(m)
				}
			}
			if (rc_release(x)) {
				if (rc_release(x + 8)) {
					m = fn_83078(m)
				}
			}
			z = ld64(dl + 0x10)
			const y = ld64(dl + 8)
			if (rc_release(y)) {
				if (rc_release(y + 8)) {
					m = fn_83078(m)
				}
			}
			if (!rc_release(z)) {
				return
			}
			if (!rc_release(z + 8)) {
				return
			}
			fn_83078(m)
			return
		}
		const k = ld64(h + j)
		const l = memcmp(k, dr, 0x20)
		j = j + 0x30
		m = l as u32
		if (m == 0) {
			let dq = h
			let n = 0
			while (true) {
				B32: {
					if (i * 0x30 != n) {
						const o = ld64(dq + n)
						const p = memcmp(o, sc0, 0x20)
						const q = n
						n = n + 0x30
						if ((p as u32) != 0) {
							continue
						}
						dg = q
						const ay = ld64(dj)
						let di = ld64(dk)
						const ax = ld64(dl)
						st64(s18, dp)
						st32(s20, 0)
						fn_122180(s38, s20)
						const r = __rust_alloc(0x88, 1)
						if (r != 0) {
							st64(r + 0x18, ld64(ax + 0x18))
							st64(r + 0x10, ld64(ax + 0x10))
							st64(r + 8, ld64(ax + 8))
							st64(r, ld64(ax))
							st16(r + 0x20, 0)
							copy(r + 0x22, dn, 0x20)
							st16(r + 0x42, 0)
							copy(r + 0x44, di, 0x20)
							st16(r + 0x64, 0)
							st64(r + 0x7e, ld64(ay + 0x18))
							st64(r + 0x76, ld64(ay + 0x10))
							st64(r + 0x6e, ld64(ay + 8))
							st64(r + 0x66, ld64(ay))
							st16(r + 0x86, 0)
							copyr(s70, dr, 0x20)
							st64(sa0 + 8, r)
							copy(s88, s38, 0x18)
							st64(sa0 + 0x10, 4)
							st64(sa0, 4)
							fn_121d50(sa0, dr)
							const az = ld64(sa0 + 8)
							st64(az + 0xa0, ld64(sc0 + 0x18))
							st64(az + 0x98, ld64(sc0 + 0x10))
							st64(az + 0x90, ld64(sc0 + 8))
							st64(az + 0x88, ld64(sc0))
							st16(az + 0xa8, 0)
							st64(sa0 + 0x10, 5)
							const ba = __rust_alloc(0xf0, 8)
							if (ba != 0) {
								const bb = ld64(dq + n - 0x28)
								rc_inc(bb)
								const bc = ld64(dq + n - 0x20)
								rc_inc(bc)
								dp = dq + n - 0x30
								const bd = dq + n
								const dd = ld64(bd - 0x18)
								const df = ld64(bd - 0x10)
								const de = ld8(bd - 8)
								const bf = ld8(bd - 7)
								const be = ld8(bd - 6)
								memcpy(ba, dl, 0x30)
								memcpy(ba + 0x30, f, 0x30)
								memcpy(ba + 0x60, dk, 0x30)
								const bg = memcpy(ba + 0x90, dj, 0x30)
								st64(ba + 0xd0, bc)
								st64(ba + 0xc8, bb)
								st64(ba + 0xc0, o)
								st8(ba + 0xea, be)
								st8(ba + 0xe9, bf)
								st8(ba + 0xe8, de)
								st64(ba + 0xe0, df)
								st64(ba + 0xd8, dd)
								st64(s50, 5, ba, 5)
								let bl = AccountInfo_try_borrow_data(s20, dp, bg)
								const bm = ld64(s18 + 8)
								const bi = ld64(s18)
								const bh = ld64(s20)
								if (bh == 0x800000000000001a /* Ok */) {
									const bk = ld64(bi)
									const bj = ld64(bi + 8)
									bl = fn_11f990(s38, sa0, s50, bk, bj, dq, dm, bl)
									let bo = undef
									let bp = undef
									if (ld64(s38) == 0x800000000000001a /* Ok */) {
										st64(bm, ld64(bm) - 1)
										const bn = ld64(sa0 + 0x10)
										if (bn > 4) {
											const bt = ld64(sa0 + 8)
											let bq = b
											let br = ld64(b + 0x10)
											let bs = bn - 5
											if (bs > ld64(b) - br) {
												fn_121aa0(bq, br, bs, bo, bp)
												bo = undef
												bp = undef
												bq = b
												br = ld64(b + 0x10)
											}
											let dc = ld64(bq + 8)
											if (bs != 0) {
												let bu = bt + 0xcb
												let bv = br * 0x22 + dc + 0x20
												do {
													dp = ld64(bu - 0x21)
													const bx = ld64(bu - 0x19)
													bo = ld64(bu - 0x11)
													bp = ld64(bu - 9)
													const bw = ld8(bu)
													st8(bv, ld8(bu - 1))
													st8(bv + 1, bw)
													st64(bv - 8, bp)
													st64(bv - 0x10, bo)
													st64(bv - 0x18, bx)
													st64(bv - 0x20, dp)
													bv = bv + 0x22
													bu = bu + 0x22
													br = br + 1
													bs = bs - 1
												} while (bs != 0)
											}
											st64(b + 0x10, br)
											const by = ld64(s50 + 0x10)
											if (by > 4) {
												const da = br
												let cc = ld64(s50 + 8)
												let bz = c
												let ca = ld64(c + 0x10)
												let cb = by - 5
												if (cb > ld64(c) - ca) {
													fn_121930(bz, ca, cb, bo, bp)
													bz = c
													ca = ld64(c + 0x10)
												}
												let db = ld64(bz + 8)
												if (cb != 0) {
													di = db + ca * 0x30
													let ce = 0
													const dh = cc
													do {
														const cq = cc + ce
														const ck = ld64(cq + 0xf8)
														const cl = ld64(cq + 0xf0)
														rc_inc(ck)
														const cf = cc
														const cd = ld64(cc + ce + 0x100)
														dp = cb
														rc_inc(cd)
														const ch = di + ce
														const cg = cf + ce
														dn = ld64(cg + 0x108)
														const cj = ld64(cg + 0x110)
														dm = ld8(cg + 0x118)
														const ci = ld8(cg + 0x119)
														st8(ch + 0x2a, ld8(cg + 0x11a))
														st8(ch + 0x29, ci)
														st8(ch + 0x28, dm)
														st64(ch + 0x20, cj)
														st64(ch + 0x18, dn)
														st64(ch + 0x10, cd)
														cc = dh
														st64(ch + 8, ck)
														st64(ch, cl)
														ce = ce + 0x30
														ca = ca + 1
														cb = dp - 1
													} while (cb != 0)
												}
												let cm = c
												const cw = ca
												st64(c + 0x10, ca)
												let cn = b
												const cp = ld64(b)
												let co = da
												if (da == cp) {
													fn_121d50(cn, cp)
													co = da
													cn = b
													cm = c
													dc = ld64(b + 8)
												}
												const cr = dc + co * 0x22
												st64(cr + 0x18, ld64(sc0 + 0x18))
												st64(cr + 0x10, ld64(sc0 + 0x10))
												st64(cr + 8, ld64(sc0 + 8))
												st64(cr, ld64(sc0))
												st16(cr + 0x20, 0)
												const cs = co + 1
												st64(cn + 0x10, cs)
												let ct = bb
												ae = dq
												let cy = o
												let cu = bc
												rc_inc(bb)
												const cv = ld64(cu)
												st64(cu, cv + 1)
												if (cv != -1) {
													if (cw == ld64(cm)) {
														fn_121eb0(cm, cv + 1)
														cu = bc
														ct = bb
														cy = o
														cm = c
														db = ld64(c + 8)
													}
													const cx = db + cw * 0x30
													st8(cx + 0x2a, be)
													st8(cx + 0x29, bf)
													st8(cx + 0x28, de)
													st64(cx + 0x20, df)
													st64(cx + 0x18, dd)
													st64(cx + 0x10, cu)
													st64(cx + 8, ct)
													st64(cx, cy)
													st64(cm + 0x10, cw + 1)
													let cz = ptr_drop_in_place_121690(s50, cu)
													if (ld64(sa0) != 0) {
														cz = fn_83078(cz)
													}
													ao = k
													if (ld64(s88) != 0) {
														fn_83078(cz)
													}
													aa = b
													ab = cs
													break B32
												}
												abort()
											}
											fn_14c4f0(5, by, 0x10015aa00, bo, bp)
										}
										fn_14c4f0(5, bn, 0x10015a9e8, bo, bp)
									}
									st64(a + 0x10, ld64(s38 + 0x10))
									st64(a + 8, ld64(s38 + 8))
									st64(a, ld64(s38))
									st64(bm, ld64(bm) - 1)
								} else {
									st64(a + 0x10, bm)
									st64(a + 8, bi)
									st64(a, bh)
								}
								m = ptr_drop_in_place_121690(s50, bl)
								if (ld64(sa0) != 0) {
									m = fn_83078(m)
								}
								if (ld64(s88) == 0) {
									return
								}
								fn_83078(m)
								return
							}
							alloc_handle_alloc_error(8, 0xf0)
						}
						alloc_handle_alloc_error(1, 0x88)
					}
					dg = n
					aa = b
					ab = ld64(b + 0x10)
					ae = dq
					ao = k
				}
				const ac = ld64(aa)
				if (ab == ac) {
					fn_121d50(aa, ac)
					aa = b
				}
				const ad = ld64(aa + 8) + ab * 0x22
				st64(ad + 0x18, ld64(dr + 0x18))
				st64(ad + 0x10, ld64(dr + 0x10))
				st64(ad + 8, ld64(dr + 8))
				st64(ad, ld64(dr))
				st16(ad + 0x20, 0)
				st64(aa + 0x10, ab + 1)
				const af = ld64(ae + j - 0x28)
				let ai = c
				rc_inc(af)
				const ag = ld64(dq + j - 0x20)
				rc_inc(ag)
				const ah = dq + j
				dq = ld8(ah - 6)
				dr = ld8(ah - 7)
				m = ld8(ah - 8)
				const am = ld64(ah - 0x10)
				const al = ld64(ah - 0x18)
				const aj = ld64(ai + 0x10)
				const ak = ld64(ai)
				if (aj == ak) {
					fn_121eb0(ai, ak)
					ao = k
					ai = c
				}
				const an = ld64(ai + 8) + aj * 0x30
				st8(an + 0x2a, dq)
				st8(an + 0x29, dr)
				st8(an + 0x28, m)
				st64(an + 0x20, am)
				st64(an + 0x18, al)
				st64(an + 0x10, ag)
				st64(an + 8, af)
				st64(an, ao)
				st64(ai + 0x10, aj + 1)
				st64(a, 0x800000000000001a /* Ok */)
				if (i * 0x30 == dg) {
					const aq = ld64(dj + 0x10)
					const ap = ld64(dj + 8)
					if (rc_release(ap)) {
						if (rc_release(ap + 8)) {
							m = fn_83078(m)
						}
					}
					if (rc_release(aq)) {
						if (rc_release(aq + 8)) {
							m = fn_83078(m)
						}
					}
					const at = ld64(dk + 0x10)
					const ar = ld64(dk + 8)
					if (rc_release(ar)) {
						if (rc_release(ar + 8)) {
							m = fn_83078(m)
						}
					}
					if (rc_release(at)) {
						if (rc_release(at + 8)) {
							m = fn_83078(m)
						}
					}
					const av = ld64(f + 0x10)
					const au = ld64(f + 8)
					if (rc_release(au)) {
						if (rc_release(au + 8)) {
							m = fn_83078(m)
						}
					}
					if (rc_release(av)) {
						if (rc_release(av + 8)) {
							m = fn_83078(m)
						}
					}
					z = ld64(dl + 0x10)
					const aw = ld64(dl + 8)
					if (rc_release(aw)) {
						if (rc_release(aw + 8)) {
							m = fn_83078(m)
						}
					}
					if (!rc_release(z)) {
						return
					}
					if (!rc_release(z + 8)) {
						return
					}
					fn_83078(m)
					return
				}
				return
			}
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (value), e (value)
function fn_14c690(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c698(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (value), e (value)
function fn_14c5c0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c5c8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_13ae08(a: u64, b: u64, c: u64): u64 {
	const g = ld64(a + 8)
	const f = ld64(a + 0x10)
	let h = 0
	if (g > f) {
		h = min(sat_sub(g, f), c)
		sol_memcpy(ld64(a) + f, b, h)
		st64(a + 0x10, h + f)
	}
	if (h == c) {
		return 0
	}
	return fn_1394f0()
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_149478(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	const s20 = fp - 0x20, s28 = fp - 0x28
	st64(s20, 0x10015b8e0, a, b)
	st16(s20 + 0x18, 1)
	st64(s28, 1)
	fn_147238(s28, b, c, d, e)
}

function fn_afd0(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s26 = fp - 0x26, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s90 = fp - 0x90, sb8 = fp - 0xb8, sd0 = fp - 0xd0, se0 = fp - 0xe0, s118 = fp - 0x118, s140 = fp - 0x140, s158 = fp - 0x158, s160 = fp - 0x160, s168 = fp - 0x168
	let j: u64
	if (c == 0x163) {
		st64(a + 8, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
		st32(a, 2)
		return r0
	}
	if (c > 0x51) {
		st64(s158 + 0x10, b)
		r0 = Mint_unpack_from_slice_133108(s58, b, 0x52, d, e, r0)
		const f = ld32(s58)
		if (f == 2) {
			copy(se0, s48, 0x10)
			j = ld64(s58 + 8)
		} else {
			copy(s68, s48, 0x10)
			copy(s90, s38, 0x10)
			st8(s90 + 0x10, ld8(s38 + 0x10))
			copy(sb8, s26, 0x20)
			st64(sb8 + 0x1e, ld64(s26 + 0x1e))
			let n = ld64(s58 + 8)
			let m = ld32(s58 + 4)
			let g = ld8(s38 + 0x11)
			copy(s78, s68, 0x10)
			if (g != 0) {
				copyr(se0, s78, 0x10)
				copy(sd0, s90, 0x10)
				st8(sd0 + 0x10, ld8(s90 + 0x10))
				copy(s140, sb8, 0x20)
				st64(s140 + 0x1e, ld64(sb8 + 0x1e))
				st8(s118 + 0x10, ld8(sd0 + 0x10))
				copyr(s118, sd0, 0x10)
				const k = ld64(se0 + 8)
				st64(s118 + 0x30, k)
				st64(s118 + 0x20, k)
				const l = ld64(se0)
				st64(s118 + 0x28, l)
				st64(s118 + 0x18, l)
				let r = 0
				let s = 1
				if (c != 0x52) {
					if (0x55 > c - 0x52) {
						st64(a + 8, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
						st64(a + 0x18, 0x54)
						st64(a + 0x10, 0x53)
						st32(a, 2)
						return r0
					}
					st64(s158, m, n)
					const o = ld64(0x300000000 /* heap bump-allocator cursor */)
					st64(s160, g)
					const q = ld64(s158 + 0x10)
					const p = o != 0 ? sat_sub(o, 0x53) : 0x300007fad
					if (0x300000007 >= p) {
						raw_vec_handle_error(1, 0x53, q, o - 0x53, 0x53 > o)
					}
					st64(s168, q + 0x52)
					st64(0x300000000 /* heap bump-allocator cursor */, p)
					memset(p, 0, 0x53)
					r0 = memcmp(ld64(s168), p, 0x53) as u32
					n = ld64(s158 + 8)
					m = ld64(s158)
					g = ld64(s160)
					if (r0 != 0) {
						st64(a + 8, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
						st64(a + 0x18, 0x54)
						st64(a + 0x10, 0x53)
						st32(a, 2)
						return r0
					}
					if (ld8(ld64(s158 + 0x10) + 0xa5) != 1) {
						st64(a + 8, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
						st64(a + 0x18, 0x54)
						st64(a + 0x10, 0x53)
						st32(a, 2)
						return r0
					}
					s = ld64(s158 + 0x10) + 0xa6
					r = c - 0xa6
				}
				st64(a + 0x18, ld64(s118 + 0x20))
				st64(a + 0x10, ld64(s118 + 0x18))
				copy(a + 0x20, s118, 0x10)
				st8(a + 0x30, ld8(s118 + 0x10))
				st64(a + 0x4a, ld64(s140 + 0x18))
				st64(a + 0x42, ld64(s140 + 0x10))
				st64(a + 0x3a, ld64(s140 + 8))
				st64(a + 0x32, ld64(s140))
				const t = ld64(s140 + 0x1e)
				st32(a, f, m)
				st8(a + 0x31, g)
				st64(a + 0x60, r)
				st64(a + 0x58, s)
				st64(a + 8, n)
				st64(a + 0x50, t)
				return r0
			}
			j = 0x8000000000000009 /* Err(ProgramError::UninitializedAccount) */
		}
		const h = ld64(se0 + 8)
		st64(s118 + 0x30, h)
		const i = ld64(se0)
		st64(s118 + 0x28, i)
		st64(a + 0x18, h)
		st64(a + 0x10, i)
		st64(a + 8, j)
		st32(a, 2)
		return r0
	}
	st64(a + 8, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
	st32(a, 2)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value)
function fn_136a70(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	let f = e
	let i = d
	const n = c
	let o = 1
	let s = 1
	if (e != 0) {
		const g = f * 0x22
		const r = f
		if (f > 0x3c3c3c3c3c3c3c3) {
			raw_vec_handle_error(0, g, c, d, e)
		}
		const h = __rust_alloc(g, 1)
		c = undef
		d = undef
		e = undef
		if (h == 0) {
			raw_vec_handle_error(1, g, c, d, e)
		}
		s = h
		let k = h + 0x21
		f = r
		let m = r
		while (true) {
			const j = ld64(i)
			d = ld64(j)
			e = ld64(j + 8)
			const l = ld64(j + 0x10)
			c = ld64(j + 0x18)
			st64(k - 9, c)
			st64(k - 0x11, l)
			st64(k - 0x19, e)
			st64(k - 0x21, d)
			i = i + 8
			st16(k - 1, 1)
			k = k + 0x22
			m = m - 1
			if (m == 0) {
				o = 1
				break
			}
		}
	}
	if (n != 0) {
		const p = f
		if (0 > (n as i64)) {
			raw_vec_handle_error(0, n, c, d, e)
		}
		o = __rust_alloc(n, 1)
		c = undef
		d = undef
		e = undef
		if (o == 0) {
			raw_vec_handle_error(1, n, c, d, e)
		}
		f = p
	}
	const q = memcpy(o, b, n)
	st64(a + 0x30, 0x62129995a534a05 /* MEMO_PROGRAM */, 0x7c38da6071e8244d /* MEMO_PROGRAM[1] */, 0x81bb92bcddb5357c /* MEMO_PROGRAM[2] */, 0x8d44054140a81fe4 /* MEMO_PROGRAM[3] */) // key MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
	st64(a + 0x20, o, n)
	st64(a + 0x18, n)
	st64(a + 8, s, f)
	st64(a, f)
	return q
}

function fn_83078(r0: u64): u64 {
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p6 (value)
function fn_13eea8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64 {
	const s38 = fp - 0x38, s50 = fp - 0x50, s78 = fp - 0x78, sa0 = fp - 0xa0, sa8 = fp - 0xa8
	let h, i, n, o, p, q, r, s, ac, ad: u64
	B13: {
		st64(s78, c, d)
		st64(sa0 + 0x10, a)
		st64(sa0 + 0x18, ld64(b + 8))
		st64(sa8, b)
		const f = ld64(b + 0x10)
		st64(sa0, p5, p6)
		st64(sa0 + 0x20, f)
		if (f != 0) {
			let g = ld64(sa0 + 0x18)
			st64(s78 + 0x10, g + ld64(sa0 + 0x20) * 0x22)
			st64(s78 + 0x20, ld64(s78 + 8) * 0x30)
			st64(s78 + 0x18, ld64(s78) - 0x30)
			L4: while (true) {
				const l = g
				g = g + 0x22
				let j = ld64(s78 + 0x20)
				let k = ld64(s78 + 0x18)
				while (true) {
					if (j != 0) {
						const m = memcmp(l, ld64(k + 0x30), 0x20)
						j = j - 0x30
						k = k + 0x30
						if ((m as u32) != 0) {
							continue
						}
						if (ld8(l + 0x21) != 0) {
							p = fn_143340(s50, k, m as u32)
							o = ld64(s50 + 0x10)
							n = ld64(s50)
							if (n != 0x800000000000001a /* Ok */) {
								ad = ld64(s50 + 8)
								ac = ld64(sa0 + 0x10)
								st64(ac + 0x10, o)
								st64(ac + 8, ad)
								st64(ac, n)
								return p
							}
							st64(o, ld64(o) + 1)
							p = fn_143448(s50, k, p)
							i = 1
							h = ld64(s50 + 0x10)
							q = ld64(s50)
							if (q != 0x800000000000001a /* Ok */) {
								s = ld64(s50 + 8)
								r = ld64(sa0 + 0x10)
								st64(r + 0x10, h)
								st64(r + 8, s)
								st64(r, q)
								return p
							}
						} else {
							p = AccountInfo_try_borrow_lamports(s50, k, m as u32)
							o = ld64(s50 + 0x10)
							n = ld64(s50)
							if (n != 0x800000000000001a /* Ok */) {
								ad = ld64(s50 + 8)
								ac = ld64(sa0 + 0x10)
								st64(ac + 0x10, o)
								st64(ac + 8, ad)
								st64(ac, n)
								return p
							}
							st64(o, ld64(o) - 1)
							p = AccountInfo_try_borrow_data(s50, k, p)
							i = -1
							h = ld64(s50 + 0x10)
							q = ld64(s50)
							if (q != 0x800000000000001a /* Ok */) {
								s = ld64(s50 + 8)
								r = ld64(sa0 + 0x10)
								st64(r + 0x10, h)
								st64(r + 8, s)
								st64(r, q)
								return p
							}
						}
						st64(h, ld64(h) + i)
					}
					if (g == ld64(s78 + 0x10)) {
						break B13
					}
					continue L4
				}
			}
		}
	}
	const t = ld64(sa8)
	const ab = ld64(t + 0x30)
	const aa = ld64(t + 0x38)
	const z = ld64(t + 0x40)
	const y = ld64(t + 0x48)
	const x = ld64(t + 0x28)
	const w = ld64(t + 0x18)
	const v = ld64(t + 0x20)
	const u = ld64(t)
	st64(s50, ld64(sa0 + 0x18))
	st64(s50 + 8, u)
	st64(s50 + 0x10, ld64(sa0 + 0x20))
	st64(s38, v, w, x, ab, aa, z, y)
	// CPI: program ?, data v[..x]
	p = sol_invoke_signed_rust(s50, ld64(s78), ld64(s78 + 8), ld64(sa0), ld64(sa0 + 8))
	if (p != 0) {
		return fn_144198(ld64(sa0 + 0x10), p, p)
	}
	st64(ld64(sa0 + 0x10), 0x800000000000001a /* Ok */)
	return p
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (points to it)
function fn_12e9c0(a: u64, b: u64): u64 {
	const s18 = fp - 0x18
	let n, o: u64
	let f = __rust_alloc(0x50, 1)
	if (f == 0) {
		raw_vec_handle_error(1, 0x50, undef, n, o)
	}
	B73: {
		st64(s18, 0x50, f)
		const g = ld32(b)
		if (0x15 >= (g as i64)) {
			if ((g as i64) > 0xa) {
				if (0xf >= (g as i64)) {
					if ((g as i64) > 0xc) {
						if (g == 0xd) {
							const v = ld64(b + 8)
							st8(f + 9, ld8(b + 0x10))
							st64(f + 1, v)
							st8(f, 0xd)
							st64(s18 + 0x10, 0xa)
							st64(a + 0x10, ld64(s18 + 0x10))
							st64(a + 8, ld64(s18 + 8))
							st64(a, ld64(s18))
							return f
						}
						if (g == 0xe) {
							const z = ld64(b + 8)
							st8(f + 9, ld8(b + 0x10))
							st64(f + 1, z)
							st8(f, 0xe)
							st64(s18 + 0x10, 0xa)
							st64(a + 0x10, ld64(s18 + 0x10))
							st64(a + 8, ld64(s18 + 8))
							st64(a, ld64(s18))
							return f
						}
						const p = ld64(b + 8)
						st8(f + 9, ld8(b + 0x10))
						st64(f + 1, p)
						st8(f, 0xf)
						st64(s18 + 0x10, 0xa)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					if (g == 0xb) {
						st8(f, 0xb)
						st64(s18 + 0x10, 1)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					const h = ld64(b + 8)
					st8(f + 9, ld8(b + 0x10))
					st64(f + 1, h)
					st8(f, 0xc)
					st64(s18 + 0x10, 0xa)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				if (0x12 >= (g as i64)) {
					if (g == 0x10) {
						st8(f, 0x10)
						break B73
					}
					if (g == 0x11) {
						st8(f, 0x11)
						st64(s18 + 0x10, 1)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					st8(f, 0x12)
					break B73
				}
				if (g == 0x13) {
					st8(f + 1, ld8(b + 8))
					st8(f, 0x13)
					st64(s18 + 0x10, 2)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				if (g != 0x14) {
					st8(f, 0x15)
					st64(s18 + 0x10, 1)
					const q = ld64(b + 0x18)
					if (q == 0) {
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					let r = ld64(b + 0x10)
					let s = 1
					let u = q << 1
					while (true) {
						const t = ld16(r)
						if (1 >= ld64(s18) - s) {
							f = fn_12cf58(s18, s, 2, n, o, f)
							s = ld64(s18 + 0x10)
						}
						r = r + 2
						st16(ld64(s18 + 8) + s, t)
						s = s + 2
						st64(s18 + 0x10, s)
						u = u - 2
						if (u == 0) {
							st64(a + 0x10, ld64(s18 + 0x10))
							st64(a + 8, ld64(s18 + 8))
							st64(a, ld64(s18))
							return f
						}
					}
				}
				st8(f + 1, ld8(b + 8))
				st8(f, 0x14)
				st64(f + 0x1a, ld64(b + 0x21))
				st64(f + 0x12, ld64(b + 0x19))
				st64(f + 0xa, ld64(b + 0x11))
				st64(f + 2, ld64(b + 9))
				if (ld32(b + 0x2c) == 0) {
					st8(f + 0x22, 0)
					st64(s18 + 0x10, 0x23)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
			} else {
				if ((g as i64) > 4) {
					if ((g as i64) > 7) {
						if (g == 8) {
							st64(f + 1, ld64(b + 8))
							st8(f, 8)
							st64(s18 + 0x10, 9)
							st64(a + 0x10, ld64(s18 + 0x10))
							st64(a + 8, ld64(s18 + 8))
							st64(a, ld64(s18))
							return f
						}
						if (g == 9) {
							st8(f, 9)
							st64(s18 + 0x10, 1)
							st64(a + 0x10, ld64(s18 + 0x10))
							st64(a + 8, ld64(s18 + 8))
							st64(a, ld64(s18))
							return f
						}
						st8(f, 0xa)
						st64(s18 + 0x10, 1)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					if (g == 5) {
						st8(f, 5)
						st64(s18 + 0x10, 1)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					if (g == 6) {
						st8(f, 6)
						st8(f + 1, ld8(b + 8))
						if (ld32(b + 0xc) != 0) {
							st8(f + 2, 1)
							copy(f + 3, b + 0x10, 0x20)
							st64(s18 + 0x10, 0x23)
							st64(a + 0x10, ld64(s18 + 0x10))
							st64(a + 8, ld64(s18 + 8))
							st64(a, ld64(s18))
							return f
						}
						st8(f + 2, 0)
						st64(s18 + 0x10, 3)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					st64(f + 1, ld64(b + 8))
					st8(f, 7)
					st64(s18 + 0x10, 9)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				if ((g as i64) > 1) {
					if (g == 2) {
						st8(f + 1, ld8(b + 8))
						st8(f, 2)
						st64(s18 + 0x10, 2)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					if (g == 3) {
						st64(f + 1, ld64(b + 8))
						st8(f, 3)
						st64(s18 + 0x10, 9)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					st64(f + 1, ld64(b + 8))
					st8(f, 4)
					st64(s18 + 0x10, 9)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				if (g != 0) {
					st8(f, 1)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				st8(f + 1, ld8(b + 8))
				st8(f, 0)
				st64(f + 0x1a, ld64(b + 0x21))
				st64(f + 0x12, ld64(b + 0x19))
				st64(f + 0xa, ld64(b + 0x11))
				st64(f + 2, ld64(b + 9))
				if (ld32(b + 0x2c) == 0) {
					st8(f + 0x22, 0)
					st64(s18 + 0x10, 0x23)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
			}
			st8(f + 0x22, 1)
			copy(f + 0x23, b + 0x30, 0x20)
			st64(s18 + 0x10, 0x43)
			st64(a + 0x10, ld64(s18 + 0x10))
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return f
		}
		if (0x20 >= (g as i64)) {
			if ((g as i64) > 0x1a) {
				if ((g as i64) > 0x1d) {
					if (g == 0x1e) {
						st8(f, 0x1e)
						st64(s18 + 0x10, 1)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					if (g == 0x1f) {
						st8(f, 0x1f)
						st64(s18 + 0x10, 1)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					st8(f, 0x20)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				if (g == 0x1b) {
					st8(f, 0x1b)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				if (g == 0x1c) {
					st8(f, 0x1c)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				st8(f, 0x1d)
				st64(s18 + 0x10, 1)
				const i = ld64(b + 0x18)
				if (i == 0) {
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				let j = ld64(b + 0x10)
				let k = 1
				let m = i << 1
				while (true) {
					const l = ld16(j)
					if (1 >= ld64(s18) - k) {
						f = fn_12cf58(s18, k, 2, n, o, f)
						k = ld64(s18 + 0x10)
					}
					j = j + 2
					st16(ld64(s18 + 8) + k, l)
					k = k + 2
					st64(s18 + 0x10, k)
					m = m - 2
					if (m == 0) {
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
				}
			}
			if ((g as i64) > 0x17) {
				if (g == 0x18) {
					st8(f, 0x18)
					st64(s18 + 0x10, 1)
					const x = ld64(b + 8)
					const w = ld64(b + 0x10)
					if (0x50 > w) {
						f = memcpy(f + 1, x, w)
						st64(s18 + 0x10, w + 1)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					fn_12cf58(s18, 1, w, n, o, f)
					const y = ld64(s18 + 0x10)
					f = memcpy(ld64(s18 + 8) + y, x, w)
					st64(s18 + 0x10, y + w)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				if (g == 0x19) {
					st8(f, 0x19)
					if (ld32(b + 8) != 0) {
						st8(f + 1, 1)
						copy(f + 2, b + 0xc, 0x20)
						st64(s18 + 0x10, 0x22)
						st64(a + 0x10, ld64(s18 + 0x10))
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return f
					}
					st8(f + 1, 0)
					st64(s18 + 0x10, 2)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				st8(f, 0x1a)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, ld64(s18 + 0x10))
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return f
			}
			if (g == 0x16) {
				st8(f, 0x16)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, ld64(s18 + 0x10))
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return f
			}
			st64(f + 1, ld64(b + 8))
			st8(f, 0x17)
			st64(s18 + 0x10, 9)
			st64(a + 0x10, ld64(s18 + 0x10))
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return f
		}
		if ((g as i64) > 0x26) {
			if ((g as i64) > 0x29) {
				if (g == 0x2a) {
					st8(f, 0x2a)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				if (g == 0x2b) {
					st8(f, 0x2b)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, ld64(s18 + 0x10))
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return f
				}
				st8(f, 0x2c)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, ld64(s18 + 0x10))
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return f
			}
			if (g == 0x27) {
				st8(f, 0x27)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, ld64(s18 + 0x10))
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return f
			}
			if (g == 0x28) {
				st8(f, 0x28)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, ld64(s18 + 0x10))
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return f
			}
			st8(f, 0x29)
			st64(s18 + 0x10, 1)
			st64(a + 0x10, ld64(s18 + 0x10))
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return f
		}
		if ((g as i64) > 0x23) {
			if (g == 0x24) {
				st8(f, 0x24)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, ld64(s18 + 0x10))
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return f
			}
			if (g == 0x25) {
				st8(f, 0x25)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, ld64(s18 + 0x10))
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return f
			}
			st8(f, 0x26)
			st64(s18 + 0x10, 1)
			st64(a + 0x10, ld64(s18 + 0x10))
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return f
		}
		if (g == 0x21) {
			st8(f, 0x21)
			st64(s18 + 0x10, 1)
			st64(a + 0x10, ld64(s18 + 0x10))
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return f
		}
		if (g == 0x22) {
			st8(f, 0x22)
			st64(s18 + 0x10, 1)
			st64(a + 0x10, ld64(s18 + 0x10))
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return f
		}
		st8(f, 0x23)
	}
	copy(f + 1, b + 8, 0x20)
	st64(s18 + 0x10, 0x21)
	st64(a + 0x10, ld64(s18 + 0x10))
	st64(a + 8, ld64(s18 + 8))
	st64(a, ld64(s18))
	return f
}

function fn_122180(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s18 = fp - 0x18
	let g, l, m, n, o, p, y: u64
	st64(s18, 0, 1, 0)
	const f = ld32(b)
	if (f == 0) {
		fn_121c08(s18, 0, 8, d, e)
		const v = ld64(s18 + 0x10)
		let u = ld64(s18 + 8)
		st64(u + v, 0x1a66fb4bc5652569)
		let w = v + 8
		st64(s18 + 0x10, w)
		const x = ld64(b + 8)
		if (7 >= ld64(s18) - w) {
			fn_121c08(s18, w, 8)
			u = ld64(s18 + 8)
			w = ld64(s18 + 0x10)
		}
		st64(u + w, x)
		y = w + 8
		st64(s18 + 0x10, y)
		st64(a + 0x10, y)
		st64(a + 8, ld64(s18 + 8))
		st64(a, ld64(s18))
	} else {
		B5: {
			if (f == 1) {
				fn_121c08(s18, 0, 8, d, e)
				const q = ld64(s18 + 0x10)
				g = ld64(s18 + 8)
				st64(g + q, 0xebeb58a7310d222b)
				let r = q + 8
				st64(s18 + 0x10, r)
				let s = ld64(s18)
				const t = ld64(b + 0x18)
				if (3 >= s - r) {
					fn_121c08(s18, r, 4, o, p)
					s = ld64(s18)
					g = ld64(s18 + 8)
					r = ld64(s18 + 0x10)
				}
				st32(g + r, t)
				l = r + 4
				st64(s18 + 0x10, l)
				n = ld64(b + 0x10)
				m = t * 0x23
				if (s - l >= m) {
					break B5
				}
			} else {
				fn_121c08(s18, 0, 8, d, e)
				const h = ld64(s18 + 0x10)
				g = ld64(s18 + 8)
				st64(g + h, 0xaef15566922a699d)
				let i = h + 8
				st64(s18 + 0x10, i)
				let j = ld64(s18)
				const k = ld64(b + 0x18)
				if (3 >= j - i) {
					fn_121c08(s18, i, 4, o, p)
					j = ld64(s18)
					g = ld64(s18 + 8)
					i = ld64(s18 + 0x10)
				}
				st32(g + i, k)
				l = i + 4
				st64(s18 + 0x10, l)
				n = ld64(b + 0x10)
				m = k * 0x23
				if (j - l >= m) {
					break B5
				}
			}
			fn_121c08(s18, l, m, o, p)
			g = ld64(s18 + 8)
			l = ld64(s18 + 0x10)
		}
		memcpy(g + l, n, m)
		y = l + m
		st64(s18 + 0x10, y)
		st64(a + 0x10, y)
		st64(a + 8, ld64(s18 + 8))
		st64(a, ld64(s18))
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), p5 (value), p6 (value), p7 (value)
function fn_11f990(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s48 = fp - 0x48, s54 = fp - 0x54, s74 = fp - 0x74, s88 = fp - 0x88, sb8 = fp - 0xb8, sc8 = fp - 0xc8, s110 = fp - 0x110, s118 = fp - 0x118, s120 = fp - 0x120, s128 = fp - 0x128
	let j, k, l, ai, an, ao, aq, at, aw, ay, bj, bs, bv, cd, ce, cz: u64
	st64(s88, c, b)
	let i = fn_125850(s48, d, p5, r0)
	const h = ld64(s48 + 0x10)
	const g = ld64(s48 + 8)
	const f = ld64(s48)
	if (f != 0x800000000000001a /* Ok */) {
		st64(a + 0x10, h)
		st64(a + 8, g)
		st64(a, f)
		return i
	}
	st64(sb8 + 0x28, p7)
	const r = p6
	i = fn_124f80(s48, g, h, 0x1a66fb4bc5652569, 0, 1, 0, i)
	if (ld64(s48) != 0) {
		l = ld64(s48 + 0x10)
		k = ld64(s48 + 0x18)
		const n = ld64(s48 + 8)
		j = 0x800000000000001a /* Ok */
		if (n != 0x800000000000001a /* Ok */) {
			st64(a + 0x10, k)
			st64(a + 8, l)
			st64(a, n)
			return i
		}
	} else {
		j = ld64(s48 + 0x18)
		k = ld64(s48 + 0x10)
		if (k > j) {
			fn_14c690(k, j, 0x10015a9b8)
		}
		if (j > h) {
			fn_14c5c0(j, h, 0x10015a9b8)
		}
		l = g + k
		if (j - k != 4) {
			st64(a + 0x10, k)
			st64(a + 8, l)
			st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
			return i
		}
		const m = ld32(l)
		k = j > j + m ? 0xffffffffffffffff : j + m
		if (k > h) {
			st64(a + 0x10, k)
			st64(a + 8, l)
			st64(a, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
			return i
		}
		k = k - j
		l = g + j
	}
	if (4 > k) {
		st64(a + 0x10, j)
		st64(a + 8, 1)
		st64(a, 0x8000000000000000)
		return i
	}
	const o = k - 4
	j = o / 0x23
	const p = j
	if (j * 0x23 == o) {
		let q = l + 4
		if (o - p * 0x23 == 0) {
			st64(s110 + 0x20, r)
			const s = ld32(l)
			if (j >= s) {
				let u = ld64(s88 + 8)
				if (s == 0) {
					st64(a, 0x800000000000001a /* Ok */)
					return i
				}
				st64(sb8 + 0x28, ld64(sb8 + 0x28) * 0x30)
				const t = ld64(s88)
				let v = ld64(t + 0x10)
				st64(sc8, ld64(t + 8))
				st64(s110, s * 0x23 + l + 4, u + 0x30)
				L20: while (true) {
					B38: {
						st64(s110 + 0x40, q)
						if (v == 0) {
							i = 8
							aq = 0
							ai = 0
						} else {
							st64(sb8 + 0x20, v)
							const w = ld64(sc8)
							const x = ld64(w)
							const ab = ld64(x + 0x18)
							st64(sb8, ld64(x + 0x10))
							st64(sb8 + 8, ld64(x + 8))
							st64(sb8 + 0x10, ld64(x))
							i = AccountInfo_try_borrow_data(s48, w, i)
							const z = ld64(s48 + 0x10)
							const aa = ld64(s48 + 8)
							const y = ld64(s48)
							if (y != 0x800000000000001a /* Ok */) {
								st64(sb8, z, aa)
								st64(a + 0x10, ld64(sb8))
								st64(a + 8, ld64(sb8 + 8))
								st64(a, y)
								return i
							}
							if (aa == 0) {
								i = 8
								aq = 0
								ai = 0
								u = ld64(s88 + 8)
								q = ld64(s110 + 0x40)
								an = ld64(sb8 + 0x10)
								if (an != 0x800000000000001a /* Ok */) {
									st64(a + 0x10, ld64(sb8))
									st64(a + 8, ld64(sb8 + 8))
									st64(a, an)
									return 8
								}
							} else {
								i = __rust_alloc(0xc0, 8)
								if (i == 0) {
									raw_vec_handle_error(8, 0xc0)
								}
								st64(i + 0x28, z)
								st64(i + 0x20, aa)
								st64(i + 0x18, ab)
								st64(i + 0x10, ld64(sb8))
								st64(i + 8, ld64(sb8 + 8))
								st64(i, ld64(sb8 + 0x10))
								st64(s18 + 8, i)
								aq = 4
								ai = 1
								st64(s18 + 0x10, 1)
								st64(s18, 4)
								const ac = ld64(sb8 + 0x20)
								if (ac != 1) {
									st64(s110 + 0x38, ld64(sc8) + 0x30)
									st64(s110 + 0x28, 0x30 - ac * 0x30)
									let ad = 0x58
									while (true) {
										st64(sb8 + 0x20, i)
										const al = ld64(sc8) + ad
										const ak = ld64(ld64(s110 + 0x38) + ad - 0x58)
										st64(sc8 + 8, ld64(ak + 0x18))
										st64(sb8, ld64(ak + 0x10))
										st64(sb8 + 8, ld64(ak + 8))
										st64(sb8 + 0x10, ld64(ak))
										AccountInfo_try_borrow_data(s48, al - 0x28, i)
										let af = ld64(s48 + 0x10)
										const ag = ld64(s48 + 8)
										const am = ld64(s48)
										if (am == 0x800000000000001a /* Ok */) {
											if (ag != 0) {
												i = ld64(sb8 + 0x20)
												let ah = ld64(sb8 + 0x10)
												if (ai == ld64(s18)) {
													st64(sb8 + 0x20, af)
													fn_121930(s18, ai, 1, af)
													af = ld64(sb8 + 0x20)
													ah = ld64(sb8 + 0x10)
													i = ld64(s18 + 8)
												}
												const ae = i + ad
												st64(ae, af)
												st64(ae - 8, ag)
												st64(ae - 0x10, ld64(sc8 + 8))
												st64(ae - 0x18, ld64(sb8))
												st64(ae - 0x20, ld64(sb8 + 8))
												st64(ae - 0x28, ah)
												ad = ad + 0x30
												const aj = ld64(s110 + 0x28) + ad
												ai = ai + 1
												st64(s18 + 0x10, ai)
												if (aj == 0x58) {
													i = ld64(s18 + 8)
													aq = ld64(s18)
													break
												}
												continue
											}
											i = ld64(s18 + 8)
											aq = ld64(s18)
											u = ld64(s88 + 8)
											q = ld64(s110 + 0x40)
											ao = ld64(sb8 + 0x10)
											if (ao == 0x800000000000001a /* Ok */) {
												break B38
											}
										} else {
											i = ld64(s18 + 8)
											aq = ld64(s18)
											ao = am
											st64(sb8, af, ag)
										}
										const cy = ao
										const cx = aq
										let cv = i + 0x28
										while (true) {
											const cw = ld64(cv)
											st64(cw, ld64(cw) - 1)
											cv = cv + 0x30
											ai = ai - 1
											if (ai == 0) {
												an = cy
												if (cx == 0) {
													st64(a + 0x10, ld64(sb8))
													st64(a + 8, ld64(sb8 + 8))
													st64(a, an)
													return i
												}
												i = fn_83078(i)
												st64(a + 0x10, ld64(sb8))
												st64(a + 8, ld64(sb8 + 8))
												st64(a, cy)
												return i
											}
										}
									}
								}
								u = ld64(s88 + 8)
								q = ld64(s110 + 0x40)
							}
						}
					}
					B93: {
						B92: {
							B128: {
								copyr(sc8, u + 0x20, 0x10)
								const ap = ld8(q)
								let av = ld64(s110 + 8)
								st64(sb8 + 0x20, i)
								if (ap != 1) {
									if (ap == 0) {
										st32(s54 + 7, ld32(q + 4))
										st32(s54 + 4, ld32(q + 1))
										st64(sc8 + 8, ld8(q + 0x22))
										ce = ld8(q + 0x21)
										st64(sb8, ld8(q + 0x20))
										st64(s110 + 0x30, ld64(q + 0x18))
										bv = ld64(q + 0x10)
										st64(sb8 + 0x10, ld64(q + 8))
										break B93
									}
									st64(s110 + 0x10, aq)
									if ((ap as i8) >= 0) {
										aw = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
										ay = ld64(s110 + 0x30)
										at = ld64(sb8 + 0x18)
										if ((ap as i8) == 2) {
											i = fn_1242d0(s48, ld64(s110 + 0x40) + 1, 0x20, i)
											const cc = ld8(s48 + 0xa)
											const ca = ld8(s48 + 9)
											const au = ld8(s48 + 8)
											const ar = ld64(s48)
											at = 0x800000000000001a /* Ok */
											if (ar != 0x800000000000001a /* Ok */) {
												i = (ld8(s48 + 0xf) << 0x38) | (ld32(s48 + 0xb) << 0x18)
												ay = ld64(s48 + 0x10)
												aw = ar
												at = (ca << 8) | au | (cc << 0x10) | i
												break B128
											}
											if (au == 1) {
												at = 0xa261c2cb
												aw = 0x8000000000000000
												ay = ld64(s110 + 0x30)
												if (ca + 0x20 > ld64(sc8 + 8)) {
													break B128
												}
												cd = ld64(sc8) + ca
											} else {
												if (au != 2) {
													ay = ld64(s110 + 0x30)
													break B128
												}
												at = 0xa261c2cc
												aw = 0x8000000000000000
												ay = ld64(s110 + 0x30)
												if (ca >= ai) {
													break B128
												}
												at = 0xa261c2cf
												const cb = ld64(ld64(sb8 + 0x20) + ca * 0x30 + 0x20)
												ay = ld64(s110 + 0x30)
												if (cc + 0x20 > ld64(cb + 8)) {
													break B128
												}
												cd = ld64(cb) + cc
											}
											st32(s54 + 7, ld32(cd + 3))
											st32(s54 + 4, ld32(cd))
											q = ld64(s110 + 0x40)
											st64(sc8 + 8, ld8(q + 0x22))
											ce = ld8(q + 0x21)
											st64(sb8 + 0x10, ld64(cd + 7))
											bv = ld64(cd + 0xf)
											st64(s110 + 0x30, ld64(cd + 0x17))
											st64(sb8, ld8(cd + 0x1f))
											u = ld64(s88 + 8)
											break B92
										}
										break B128
									}
									at = 0xa261c2cc
									aw = 0x8000000000000000
									ay = ld64(s110 + 0x30)
									if (((ap as i8) & 0x7f) >= ai) {
										break B128
									}
									av = ld64(sb8 + 0x20) + ((ap as i8) & 0x7f) * 0x30
									q = ld64(s110 + 0x40)
									aq = ld64(s110 + 0x10)
								}
								st64(s128, av)
								st64(s110 + 0x10, aq)
								i = fn_124408(s48, q + 1, q)
								ay = ld64(s48 + 0x18)
								at = ld64(s48 + 0x10)
								aw = ld64(s48 + 8)
								const ax = ld64(s48)
								st64(s118, aw)
								st64(sb8 + 8, at)
								if (ax == 0) {
									let bu = 8
									let bl = 0
									st64(s18, 0, 8, 0)
									let bf = 0
									if (ay != 0) {
										let bi = 8
										st64(sb8 + 0x18, ay * 0x18)
										let bk = ld64(sb8 + 8)
										while (true) {
											B66: {
												B65: {
													let br = ld64(bk + bl) ^ 0x8000000000000000
													br = 5 > br ? br : 1
													if ((br as i64) > 1) {
														B118: {
															if (br != 2) {
																if (br == 3) {
																	let bq = ld8(bk + bl + 8)
																	if (ai > bq) {
																		if (bf == ld64(s18)) {
																			st64(sb8, bf)
																			st64(sb8 + 0x10, bq)
																			fn_122018(s18, br)
																			bq = ld64(sb8 + 0x10)
																			bf = ld64(sb8)
																			bk = ld64(sb8 + 8)
																		}
																		st64(s110 + 0x28, ld64(s110 + 0x28) & 0xffffffff00000000 | 0xa261c2cc)
																		bi = ld64(s18 + 8)
																		bj = bi + (bf << 4)
																		st64(bj, ld64(sb8 + 0x20) + bq * 0x30)
																		bs = 0x20
																		break B65
																	}
																	cz = ld64(s110 + 0x28)
																} else {
																	const ba = bk + bl
																	const az = ld8(ba + 8)
																	if (ai > az) {
																		const bd = ld64(sb8 + 0x20) + az * 0x30
																		at = 0xa261c2cf
																		const bb = ld8(ba + 0xa)
																		const bc = ld8(ba + 9)
																		st64(sb8 + 0x10, bb)
																		st64(s110 + 0x38, bc)
																		const be = ld64(bd + 0x20)
																		if (bb + bc > ld64(be + 8)) {
																			break B118
																		}
																		let bh = ld64(be)
																		const bg = ld64(s18)
																		if (bf == bg) {
																			st64(sb8, bf)
																			st64(s120, bh)
																			fn_122018(s18, bg)
																			bh = ld64(s120)
																			bf = ld64(sb8)
																			bi = ld64(s18 + 8)
																		}
																		st64(s110 + 0x18, ld64(s110 + 0x18) & 0xffffffff00000000 | 0xa261c2cc)
																		bj = bi + (bf << 4)
																		st64(bj, bh + ld64(s110 + 0x38))
																		bk = ld64(sb8 + 8)
																		bs = ld64(sb8 + 0x10)
																		break B65
																	}
																	cz = ld64(s110 + 0x18)
																}
																at = cz & 0xffffffff00000000 | 0xa261c2cc
															} else {
																const bm = bk + bl
																at = 0xa261c2cb
																const bn = ld8(bm + 9)
																let bo = ld8(bm + 8)
																st64(sb8 + 0x10, bn)
																const bp = ld64(sc8 + 8)
																if (bp >= bn + bo) {
																	if (bf == ld64(s18)) {
																		st64(sb8, bf)
																		st64(s110 + 0x38, bo)
																		fn_122018(s18, bp)
																		bo = ld64(s110 + 0x38)
																		bf = ld64(sb8)
																	}
																	bi = ld64(s18 + 8)
																	bj = bi + (bf << 4)
																	st64(bj, ld64(sc8) + bo)
																	bk = ld64(sb8 + 8)
																	bs = ld64(sb8 + 0x10)
																	break B65
																}
															}
														}
														const da = ld64(s18)
														st64(sb8 + 0x18, at)
														if (da != 0) {
															fn_83078(bf)
															at = ld64(sb8 + 0x18)
														}
														let db = ld64(sb8 + 8) + 8
														i = 0x8000000000000000
														while (true) {
															const dc = ld64(db - 8)
															const dd = 5 > (dc ^ 0x8000000000000000)
															if (dc != 0 && (dd & dc != 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) == 0) {
																void ld64(db)
																fn_83078(0x8000000000000000)
																i = 0x8000000000000000
																at = ld64(sb8 + 0x18)
															}
															db = db + 0x18
															ay = ay - 1
															if (ay == 0) {
																aw = 0x8000000000000000
																ay = ld64(s110 + 0x30)
																if (ld64(s118) == 0) {
																	break B128
																}
																i = fn_83078(0x8000000000000000)
																at = ld64(sb8 + 0x18)
																ay = ld64(s110 + 0x30)
																break B128
															}
														}
													}
													if (br == 0) {
														break B66
													}
													const bt = bk + bl
													bs = ld64(bt + 0x10)
													st64(s110 + 0x38, ld64(bt + 8))
													if (bf == ld64(s18)) {
														st64(sb8, bf)
														st64(sb8 + 0x10, bs)
														fn_122018(s18, br)
														bs = ld64(sb8 + 0x10)
														bf = ld64(sb8)
														bk = ld64(sb8 + 8)
													}
													bi = ld64(s18 + 8)
													bj = bi + (bf << 4)
													st64(bj, ld64(s110 + 0x38))
												}
												st64(bj + 8, bs)
												bf = bf + 1
												st64(s18 + 0x10, bf)
											}
											bl = bl + 0x18
											if (ld64(sb8 + 0x18) == bl) {
												bl = ld64(s18)
												bu = ld64(s18 + 8)
												break
											}
										}
									}
									st64(sc8 + 8, bu)
									i = Pubkey_find_program_address(s48, bu, bf, ld64(s128))
									st32(s48 + 0x2b, ld32(s48 + 3))
									st32(s48 + 0x28, ld32(s48))
									st64(sb8, ld8(s48 + 0x1f))
									st64(s110 + 0x30, ld64(s48 + 0x17))
									bv = ld64(s48 + 0xf)
									st64(sb8 + 0x10, ld64(s48 + 7))
									st64(sb8 + 0x18, bv)
									if (bl != 0) {
										i = fn_83078(i)
										bv = ld64(sb8 + 0x18)
									}
									const bw = ld64(s110 + 0x40)
									st64(sc8 + 8, ld8(bw + 0x22))
									st64(sc8, ld8(bw + 0x21))
									st32(s54 + 7, ld32(s48 + 0x2b))
									st32(s54 + 4, ld32(s48 + 0x28))
									if (ay != 0) {
										let bx = ld64(sb8 + 8) + 8
										do {
											const by = ld64(bx - 8)
											const bz = 5 > (by ^ 0x8000000000000000)
											if (by != 0 && (bz & by != 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) == 0) {
												void ld64(bx)
												i = fn_83078(i)
												bv = ld64(sb8 + 0x18)
											}
											bx = bx + 0x18
											ay = ay - 1
										} while (ay != 0)
									}
									u = ld64(s88 + 8)
									q = ld64(s110 + 0x40)
									aq = ld64(s110 + 0x10)
									ce = ld64(sc8)
									if (ld64(s118) == 0) {
										break B93
									}
									i = fn_83078(i)
									ce = ld64(sc8)
									bv = ld64(sb8 + 0x18)
									break B92
								}
							}
							st64(a + 0x10, ay)
							st64(a + 8, at)
							st64(a, aw)
							if (ai != 0) {
								let de = ld64(sb8 + 0x20) + 0x28
								do {
									const df = ld64(de)
									st64(df, ld64(df) - 1)
									de = de + 0x30
									ai = ai - 1
								} while (ai != 0)
							}
							if (ld64(s110 + 0x10) == 0) {
								return i
							}
							return fn_83078(i)
						}
						aq = ld64(s110 + 0x10)
					}
					const cf = ld64(sc8 + 8) != 0
					st32(s74, ld32(s54 + 4))
					st32(s74 + 3, ld32(s54 + 7))
					st8(s74 + 0x1f, ld64(sb8))
					st64(s74 + 0x17, ld64(s110 + 0x30))
					st64(sb8 + 0x18, bv)
					st64(s74 + 0xf, bv)
					st64(s74 + 7, ld64(sb8 + 0x10))
					st8(s54, ce != 0, cf)
					if (ai != 0) {
						let cg = ld64(sb8 + 0x20) + 0x28
						do {
							const ch = ld64(cg)
							st64(ch, ld64(ch) - 1)
							cg = cg + 0x30
							ai = ai - 1
						} while (ai != 0)
					}
					if (aq != 0) {
						i = fn_83078(i)
					}
					st64(s110 + 0x40, q + 0x23)
					i = fn_124ae0(s74, ld64(u + 8), ld64(u + 0x10), i)
					let ci = ld64(sb8 + 0x28)
					let cj = ld64(s110 + 0x20)
					while (true) {
						if (ci == 0) {
							st64(a, 0x8000000000000000)
							st32(a + 8, 0xffffffffa261c2c0)
							return i
						}
						const ck = ld64(cj)
						const cl = memcmp(ck, s74, 0x20)
						ci = ci - 0x30
						cj = cj + 0x30
						i = cl as u32
						if (i == 0) {
							let cm = ld64(cj - 0x28)
							let cr = ld64(s88)
							rc_inc(cm)
							i = ld64(cj - 0x20)
							const cn = ld64(i)
							st64(i, cn + 1)
							if (cn != -1) {
								st64(s110 + 0x28, ld8(cj - 6))
								st64(s110 + 0x38, ld8(cj - 7))
								st64(sc8 + 8, ld8(cj - 8))
								st64(sb8, ld64(cj - 0x10))
								st64(sb8 + 8, ld64(cj - 0x18))
								st16(s48 + 0x20, ld16(s54))
								copyr(s48, s74, 0x20)
								u = ld64(s88 + 8)
								const co = ld64(u + 0x10)
								const cp = ld64(u)
								st64(sb8 + 0x20, cm)
								st64(sb8 + 0x10, i)
								if (co == cp) {
									fn_121d50(u, cn == -1)
									i = ld64(sb8 + 0x10)
									cm = ld64(sb8 + 0x20)
									cr = ld64(s88)
								}
								const cq = ld64(u + 8) + co * 0x22
								st16(cq + 0x20, ld16(s48 + 0x20))
								st64(cq + 0x18, ld64(s48 + 0x18))
								st64(cq + 0x10, ld64(s48 + 0x10))
								st64(cq + 8, ld64(s48 + 8))
								st64(cq, ld64(s48))
								st64(u + 0x10, co + 1)
								const cs = ld64(cr + 0x10)
								if (cs == ld64(cr)) {
									fn_121eb0(cr, cq)
									i = ld64(sb8 + 0x10)
									cm = ld64(sb8 + 0x20)
									cr = ld64(s88)
								}
								const ct = ld64(cr + 8)
								st64(sc8, ct)
								const cu = ct + cs * 0x30
								st8(cu + 0x2a, ld64(s110 + 0x28))
								st8(cu + 0x29, ld64(s110 + 0x38))
								st8(cu + 0x28, ld64(sc8 + 8))
								st64(cu + 0x20, ld64(sb8))
								st64(cu + 0x18, ld64(sb8 + 8))
								st64(cu + 0x10, i)
								st64(cu + 8, cm)
								st64(cu, ck)
								v = cs + 1
								st64(cr + 0x10, v)
								q = ld64(s110 + 0x40)
								if (q == ld64(s110)) {
									st64(a, 0x800000000000001a /* Ok */)
									return i
								}
								continue L20
							}
							abort()
						}
					}
				}
			}
			fn_14c5c0(s, j, 0x10015a9d0, s, p * 0x23)
		}
		st64(a + 0x10, j)
		st64(a + 8, q)
		st64(a, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
		return i
	}
	st64(a + 0x10, j)
	st64(a + 8, 0x23 > o ? 1 : 2)
	st64(a, 0x8000000000000000)
	return i
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_14c4f0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c4f8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (value), d (value), e (value)
function fn_14c698(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	st64(s60, a, b, 0x10015b9f8)
	st64(s50 + 0x10, s20)
	st64(s20, s60, fn_14f060, s58, fn_14f060)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "slice index starts at {} but ends at {}" {} = a [fn_14f060], {} = b [fn_14f060]
	fn_149478(s50, c, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (value), d (value), e (value)
function fn_14c5c8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	st64(s60, a, b, 0x10015b9d8)
	st64(s50 + 0x10, s20)
	st64(s20, s60, fn_14f060, s58, fn_14f060)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "range end index {} out of range for slice of length {}" {} = a [fn_14f060], {} = b [fn_14f060]
	fn_149478(s50, c, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_147238(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	fn_1478b8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
function memset(a: u64, b: u64, c: u64) {
	sol_memset(a, b as u8, c)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value), a (points to it)
function fn_125850(a: u64, b: u64, c: u64, r0: u64): u64 {
	const s20 = fp - 0x20
	let g = fn_1253c0(s20, b, c, r0)
	const h = ld64(s20 + 8)
	const f = ld64(s20)
	if (f == 0x8000000000000000) {
		const j = ld64(s20 + 0x18)
		const i = ld64(s20 + 0x10)
		if (h != 0x800000000000001a /* Ok */) {
			st64(a + 0x10, j)
			st64(a + 8, i)
			st64(a, h)
			return g
		}
		st64(a + 0x10, c)
		st64(a + 8, b)
		st64(a, 0x800000000000001a /* Ok */)
		return g
	}
	if (f == 0) {
		st64(a + 0x10, c)
		st64(a + 8, b)
		st64(a, 0x800000000000001a /* Ok */)
		return g
	}
	g = fn_83078(g)
	st64(a + 0x10, c)
	st64(a + 8, b)
	st64(a, 0x800000000000001a /* Ok */)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), b (value)
function fn_124f80(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s38 = fp - 0x38
	let q: u64
	let v = ld64(s38)
	if (c == 0) {
		st64(a + 8, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
		st64(a, 1)
		return r0
	}
	const t = p7
	const u = p6
	const s = p5
	let w = 0
	let f = 0
	while (true) {
		r0 = f > f + 0xc
		const g = f
		const h = f > f + 8
		const j = h != 0 ? 0xffffffffffffffff : f + 8
		const i = r0 != 0 ? 0xffffffffffffffff : f + 0xc
		if (i > c) {
			st64(a + 8, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
			st64(a, 1)
			return r0
		}
		const k = c
		if (j > c) {
			fn_14c5c0(j, k, 0x10015aa18, g + 8, h)
		}
		const n = b
		r0 = fn_1388f0(s18, b + f, j - f, r0)
		let o = undef
		const m = ld64(s18 + 8)
		const l = ld64(s18)
		if (l != 0x800000000000001a /* Ok */) {
			st64(a + 0x18, ld64(s18 + 0x10))
			st64(a + 0x10, m)
			st64(a + 8, l)
			st64(a, 1)
			return r0
		}
		if (m == d) {
			c = k
			b = n
			const p = w
			o = u
			if (u == 1) {
				o = t
				if (p == t) {
					st64(a + 0x20, t)
					st64(a + 0x18, i)
					st64(a + 0x10, j)
					st64(a + 8, f)
					st64(a, 0)
					return r0
				}
			}
			w = p + 1
			q = i
		} else {
			c = k
			b = n
			q = i
			if (m == 0) {
				if (s != 0) {
					st64(a + 0x20, w)
					st64(a + 0x18, q)
					st64(a + 0x10, j)
					st64(a + 8, f)
					st64(a, 0)
					return r0
				}
				st64(a + 8, 0x8000000000000000)
				st32(a + 0x10, 0x47af3bc0)
				st64(a, 1)
				return r0
			}
		}
		if (j > q) {
			fn_14c690(j, q, 0x10015aa30, o, q)
		}
		if (q - j != 4) {
			st64(a + 0x10, v)
			st64(a + 8, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
			st64(a, 1)
			return r0
		}
		v = b + j
		const r = ld32(b + j)
		f = q > q + r ? 0xffffffffffffffff : q + r
		if (f >= c) {
			st64(a + 8, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
			st64(a, 1)
			return r0
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (value)
function fn_1242d0(a: u64, b: u64, c: u64, r0: u64): u64 {
	if (c != 0) {
		const f = ld8(b)
		if (f == 0) {
			st64(a, 0x800000000000001a /* Ok */)
			st8(a + 8, 0)
			return r0
		}
		if (f == 1) {
			if (c == 1) {
				st64(a, 0x8000000000000000)
				st32(a + 8, 0xffffffffa261c2d2)
				return r0
			}
			st8(a + 9, ld8(b + 1))
			st64(a, 0x800000000000001a /* Ok */)
			st8(a + 8, 1)
			return r0
		}
		if (f == 2) {
			if (3 > c) {
				st64(a, 0x8000000000000000)
				st32(a + 8, 0xffffffffa261c2d2)
				return r0
			}
			const g = ld8(b + 1)
			st8(a + 0xa, ld8(b + 2))
			st8(a + 9, g)
			st64(a, 0x800000000000001a /* Ok */)
			st8(a + 8, 2)
			return r0
		}
		st64(a, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
		return r0
	}
	st64(a, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (points to it), r7 (value)
function fn_124408(a: u64, b: u64, r7: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s28 = fp - 0x28, s30 = fp - 0x30, s38 = fp - 0x38, s40 = fp - 0x40, s48 = fp - 0x48
	let n, r, v, x, y: u64
	st64(s28, b)
	st64(s48, a)
	let i = 8
	let j = 0
	st64(s18, 0, 8, 0)
	let m = 0
	st64(s20, 0)
	while (true) {
		B33: {
			B32: {
				B22: {
					y = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
					const o = ld64(s28)
					const p = ld64(s20)
					const q = ld8(o + p)
					if ((q as i64) > 1) {
						if (q == 2) {
							if (0x1d >= ld64(s20)) {
								r = 0x8000000000000002 /* Err(ProgramError::InvalidInstructionData) */
								r7 = (ld8(o + p + 2) << 8) | (r7 & 0xffffffffffff0000 | ld8(o + p + 1))
								break B22
							}
						} else if (q == 3) {
							if (p != 0x1f) {
								r7 = r7 & -0x100 | ld8(o + p + 1)
								r = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
								break B22
							}
						} else {
							const t = i
							x = r7
							if (q != 4) {
								break B33
							}
							if (0x1c >= ld64(s20)) {
								r = 0x8000000000000004 /* Err(ProgramError::AccountDataTooSmall) */
								r7 = (ld8(o + p + 2) << 8) | (r7 & 0xffffffffff000000 | ld8(o + p + 1)) | (ld8(o + p + 3) << 0x10)
								i = t
								break B22
							}
						}
						v = r7 & 0xffffffff00000000 | 0xa261c2c9
						y = 0x8000000000000000
						break B32
					}
					r = 0x8000000000000000
					if (q != 0) {
						st64(s38, i)
						x = r7
						if (q != 1) {
							break B33
						}
						y = 0x8000000000000000
						x = 0xa261c2c9
						if (p == 0x1f) {
							break B33
						}
						r = ld8(o + p + 1)
						if (r > 0x1e - ld64(s20)) {
							v = r7 & 0xffffffff00000000 | 0xa261c2c9
							break B32
						}
						st64(s40, j)
						r7 = 1
						if (r != 0) {
							st64(s30, r)
							const s = __rust_alloc(r, 1)
							r7 = s
							if (s == 0) {
								raw_vec_handle_error(1, ld64(s30))
							}
							r = ld64(s30)
						}
						memcpy(r7, o + p + 2, r)
						st64(s30, r)
						j = ld64(s40)
						i = ld64(s38)
					}
				}
				let f = r ^ 0x8000000000000000
				const l = r
				f = 5 > f ? f : 1
				if ((f as i64) > 1) {
					if (f == 2) {
						f = 3
					} else {
						f = f != 3 ? 4 : 2
					}
				} else if (f != 0) {
					f = ld64(s30) + 2
				}
				if (l == 0x8000000000000000) {
					n = ld64(s48)
					st64(n + 0x18, ld64(s18 + 0x10))
					st64(n + 0x10, ld64(s18 + 8))
					st64(n + 8, ld64(s18))
					st64(n, 0)
					return j
				}
				if (m == ld64(s18)) {
					const u = ld64(s28)
					st64(s38, r7)
					fn_124168(s18, u)
					r7 = ld64(s38)
					i = ld64(s18 + 8)
				}
				const g = f as u8
				const h = ld64(s20)
				const k = i + j
				st64(k + 0x10, ld64(s30))
				st64(k + 8, r7)
				st64(k, l)
				j = j + 0x18
				m = m + 1
				st64(s18 + 0x10, m)
				st64(s20, g + h)
				if (0x20 > g + h) {
					continue
				}
				n = ld64(s48)
				st64(n + 0x18, ld64(s18 + 0x10))
				st64(n + 0x10, ld64(s18 + 8))
				st64(n + 8, ld64(s18))
				st64(n, 0)
				return j
			}
			x = v
		}
		const w = ld64(s48)
		st64(w + 0x18, ld64(s30))
		st64(w + 0x10, x)
		st64(w + 8, y)
		st64(w, 1)
		const z = ld64(s18 + 8)
		if (m != 0) {
			let aa = z + 8
			do {
				const ab = ld64(aa - 8)
				const ac = 5 > (ab ^ 0x8000000000000000)
				if (ab != 0 && (ac & ab != 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */) == 0) {
					void ld64(aa)
					j = fn_83078(j)
				}
				aa = aa + 0x18
				m = m - 1
			} while (m != 0)
		}
		if (ld64(s18) == 0) {
			return j
		}
		return fn_83078(j)
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
function fn_124ae0(a: u64, b: u64, c: u64, r0: u64): u64 {
	const s8 = fp - 0x8
	let g = b
	let f = c * 0x22
	while (true) {
		if (f == 0) {
			return r0
		}
		const h = memcmp(g, a, 0x20)
		f = f - 0x22
		g = g + 0x22
		r0 = h as u32
		if (r0 == 0) {
			st64(s8, ld8(g - 1) != 0)
			let i = ld8(g - 2) != 0
			if (f != 0) {
				let k = f / 0x22
				do {
					r0 = memcmp(g, a, 0x20) as u32
					if (r0 == 0) {
						const j = ld8(g + 0x20) != 0
						st64(s8, ld64(s8) | ld8(g + 0x21) != 0)
						i = i | j
					}
					g = g + 0x22
					k = k - 1
				} while (k != 0)
			}
			if ((i & 1) == 0 && ld8(a + 0x20) != 0) {
				st8(a + 0x20, 0)
			}
			if (((ld64(s8) | ld8(a + 0x21) == 0) & 1) != 0) {
				return r0
			}
			st8(a + 0x21, 0)
			return r0
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_14c4f8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	st64(s60, a, b, 0x10015b9b8)
	st64(s50 + 0x10, s20)
	st64(s20, s60, fn_14f060, s58, fn_14f060)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "range start index {} out of range for slice of length {}" {} = a [fn_14f060], {} = b [fn_14f060]
	fn_149478(s50, c, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_1478b8(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	custom_panic(a, b, c, d, e)
	abort()
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value)
function fn_1388f0(a: u64, b: u64, c: u64, r0: u64): u64 {
	if (c != 8) {
		st64(a, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
		return r0
	}
	st64(a + 8, ld64(b))
	st64(a, 0x800000000000001a /* Ok */)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_124168(a: u64, b: u64) {
	const s18 = fp - 0x18, s30 = fp - 0x30
	let f = ld64(a)
	let g = f + 1
	let m = 0
	let h = g == 0
	if (h != 0) {
		raw_vec_handle_error(0, b, g, f, h)
	}
	let i = max(f << 1, g)
	const j = 0x555555555555556 > i
	i = max(i, 4)
	const k = i
	if (f != 0) {
		const l = ld64(a + 8)
		st64(s18 + 0x10, f * 0x18)
		st64(s18, l)
		m = 8
	}
	st64(s18 + 8, m)
	fn_124030(s30, j << 3, k * 0x18, s18)
	g = undef
	f = undef
	h = undef
	if (ld64(s30) != 0) {
		raw_vec_handle_error(ld64(s30 + 8), ld64(s30 + 0x10), g, f, h)
	}
	const n = ld64(s30 + 8)
	st64(a, i, n)
}

// not included (size budget), see shared.ts:
declare function fn_1253c0(a: u64, b: u64, c: u64, r0: u64): u64
