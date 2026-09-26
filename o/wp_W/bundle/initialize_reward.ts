// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction initialize_reward: handler + 25 reachable functions
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
interface InitializeRewardAccounts { // Accounts struct of instruction initialize_reward as accounts_initialize_reward returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	reward_authority: at<0x00, ref<AccountInfo>>
	funder:           at<0x08, ref<AccountInfo>>
	reward_mint:      at<0x18, ref<Mint>> // Box<Account<Mint>>
	reward_vault:     at<0x20, ref<AccountInfo>>
}
interface InitializeRewardContext { // anchor_lang Context of instruction initialize_reward (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<InitializeRewardAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_invoke_signed_rust(ix: u64, accountInfos: u64, accountInfosLen: u64, signerSeeds: u64, signerSeedsLen: u64): u64 // CPI (Rust ABI: &Instruction, &[AccountInfo], &[&[&[u8]]])
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function ptr_drop_in_place_bf20(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 2]>
declare function ptr_drop_in_place_c1b0(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 4]>
declare function fn_f658(a: u64, b: u64): u64 // lib
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11990(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11a48(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11e98(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_122e8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp
declare function fn_129a0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from, memcmp
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function ptr_drop_in_place_126088(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<alloc::vec::Vec<solana_account_info::AccountInfo>>
declare function fn_12cf58(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib uses raw_vec_handle_error
declare function rent_check_id_136a18(a: u64): u64 // lib solana_sdk_ids::sysvar::rent::check_id
declare function fn_1390d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcmp, AccountInfo_try_borrow_lamports, AccountInfo_try_borrow_data
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function rent_get(a: u64): u64 // lib solana_sysvar::rent::<impl solana_sysvar::Sysvar for solana_rent::Rent>::get
declare function fn_13f890(a: u64): void // lib uses memset, sol_get_return_data, __rust_alloc, raw_vec_handle_error, …
declare function fn_142800(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_142e70(a: u64, b: u64, c: u64, d: u64): void // lib uses __rust_alloc, alloc_handle_alloc_error
declare function AccountInfo_try_borrow_lamports(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_lamports
declare function fn_143340(a: u64, b: u64, r0: u64): u64 // lib
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_144198(a: u64, b: u64, r0: u64): u64 // lib uses __rust_alloc, raw_vec_handle_error
declare function fn_1459d0(a: u64): u64 // lib uses repr_bitpacked_kind_from_prim_145358, callx
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fn_14ecd0(a: u64, b: u64, c: u64): u64 // lib "0001020304050607080910111213141516171819…", "0001020304050607080910111213141516171819…"
declare function fn_14f3e8(a: u64): u64 // lib
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function __floatundidf(a: u64): u64 // lib __floatundidf
declare function fn_14f808(a: u64, b: u64): u64 // lib uses __multi3
declare function fn_151a40(a: u64, b: u64): u64 // lib
declare function fn_151cb0(a: u64, b: u64): u64 // lib

// instruction handler: initialize_reward (discriminator sha256("global:initialize_reward")[..8] = 0x44e681f2c4c0875f)
// accounts [str: the program's account-error strings, in order of first use]: reward_authority, whirlpool, reward_mint, rent, funder, token_program, reward_vault, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
function ix_initialize_reward(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s40 = fp - 0x40, s48 = fp - 0x48, s58 = fp - 0x58, s98 = fp - 0x98, sb0 = fp - 0xb0, sc0 = fp - 0xc0, sd0 = fp - 0xd0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s100 = fp - 0x100
	let h, l: u64
	sol_log("Instruction: InitializeReward", 0x1d)
	if (ix_args_len == 0) {
		const j = fn_1459d0(0x100159468)
		if (2 > (j & 3) - 2) {
			l = anchor_error_from(s100, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s100)
			st64(a + 8, ld64(s100 + 8))
			st64(a, h)
			return l
		}
		if ((j & 3) == 0) {
			l = anchor_error_from(s100, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s100)
			st64(a + 8, ld64(s100 + 8))
			st64(a, h)
			return l
		}
		const k = ld64(ld64(j + 7))
		callx(k, ld64(j - 1), k)
		l = anchor_error_from(s100, 0x66 /* anchor::InstructionDidNotDeserialize */)
		h = ld64(s100)
		st64(a + 8, ld64(s100 + 8))
		st64(a, h)
		return l
	}
	const m = ld8(ix_args)
	st64(sc0, accounts, accounts_len)
	l = accounts_initialize_reward(s58, undef, sc0, undef, fp)
	const g = ld64(s48)
	h = ld64(s58 + 8)
	const f = ld64(s58)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return l
	}
	memcpy(s98, s40, 0x40)
	st64(sb0, f, h, g)
	copyr(s48, sc0, 0x10)
	st64(s58, program_id, sb0)
	l = fn_32bc0(sd0, s58, m)
	h = ld64(sd0)
	if (h == 2) {
		l = fn_6aa0(se0, ld64(sb0 + 0x10), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
		const i = ld64(se0)
		if (i != 2) {
			l = Error_with_account_name(sf0, i, ld64(se0 + 8), 0x100152b28 /* "whirlpool" */, 9)
			h = ld64(sf0)
			st64(a + 8, ld64(sf0 + 8))
			st64(a, h)
			return l
		}
		st64(a + 8, g)
		st64(a, 2)
		return l
	}
	st64(a + 8, ld64(sd0 + 8))
	st64(a, h)
	return l
}

// Anchor Accounts::try_accounts of instruction initialize_reward (called by ix_initialize_reward; name [str]: from the handler's "Instruction: …" log; was fn_ab5c8)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: reward_authority (ConstraintAddress), whirlpool (ConstraintMut), reward_mint, rent, funder (ConstraintMut), token_program (ConstraintAddress), reward_vault (ConstraintMut), system_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: reward_mint_box, reward_authority
function accounts_initialize_reward(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s270 = fp - 0x270, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s450 = fp - 0x450
	let ab, ac: u64
	try_accounts_11718(s290, c, c, d, e)
	const reward_authority: AccountInfo = ld64(s290 + 8)
	const f = ld64(s290)
	if (f != 2) {
		ac = Error_with_account_name(s2e0, f, reward_authority, "reward_authority", 0x10)
		ab = ld64(s2e0)
		st64(a + 0x10, ld64(s2e0 + 8))
		st64(a + 8, ab)
		st64(a, 0)
		return ac
	}
	try_accounts_11718(s290, c)
	const i = ld64(s290 + 8)
	const g = ld64(s290)
	if (g == 2) {
		try_accounts_11a48(s290, c)
		if (ld64(s290) == 0) {
			ac = Error_with_account_name(s410, ld64(s290 + 8), ld64(s290 + 0x10), 0x100152b28 /* "whirlpool" */, 9)
			ab = ld64(s410)
			st64(a + 0x10, ld64(s410 + 8))
			st64(a + 8, ab)
			st64(a, 0)
			return ac
		}
		const h = ld64(0x300000000 /* heap bump-allocator cursor */)
		const j = h != 0 ? sat_sub(h, 0x290) & -8 : 0x300007d70
		st64(s450 + 0x38, i)
		if (j > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(s450 + 0x30, j)
			memcpy(j, s290, 0x290)
			try_accounts_11e98(s290, c)
			if (ld32(s290) == 2) {
				ac = Error_with_account_name(s400, ld64(s290 + 8), ld64(s290 + 0x10), "reward_mint", 0xb)
				ab = ld64(s400)
				st64(a + 0x10, ld64(s400 + 8))
				st64(a + 8, ab)
				st64(a, 0)
				return ac
			}
			const l = ld64(0x300000000 /* heap bump-allocator cursor */)
			const reward_mint_box: Mint = l != 0 ? sat_sub(l, 0x60) & -8 : 0x300007fa0
			if (reward_mint_box > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, reward_mint_box)
				memcpy(reward_mint_box, s290, 0x60)
				try_accounts_11718(s290, c)
				const o = ld64(s290 + 8)
				const n = ld64(s290)
				if (n == 2) {
					st64(s450 + 0x28, o)
					fn_129a0(s290, c, o)
					const q = ld64(s290 + 8)
					const p = ld64(s290)
					if (p == 2) {
						st64(s450 + 0x20, q)
						fn_122e8(s290, c, q)
						const s = ld64(s290 + 8)
						const r = ld64(s290)
						if (r == 2) {
							st64(s450 + 0x18, s)
							try_accounts_11990(s290, c, s)
							const v = ld64(s290 + 0x10)
							const u = ld64(s290 + 8)
							const t = ld64(s290)
							if (t == 0) {
								ac = Error_with_account_name(s3f0, u, v, 0x100152d60 /* "rent" */, 4)
								ab = ld64(s3f0)
								st64(a + 0x10, ld64(s3f0 + 8))
								st64(a + 8, ab)
								st64(a, 0)
								return ac
							}
							st64(s450, u, v)
							st64(s450 + 0x10, ld64(s290 + 0x18))
							const w = reward_authority.key
							copyr(s2d0, w, 0x20)
							const x = ld64(s450 + 0x30)
							copyr(s2b0, x + 0x48, 0x20)
							if ((memcmp(s2d0, s2b0, 0x20) as u32) == 0) {
								if (ld8(ld64(s450 + 0x38) + 0x29) == 0) {
									anchor_error_from(s3d0, 0x7d0 /* anchor::ConstraintMut */)
									ac = Error_with_account_name(s3e0, ld64(s3d0), ld64(s3d0 + 8), "funder", 6)
									ab = ld64(s3e0)
									st64(a + 0x10, ld64(s3e0 + 8))
									st64(a + 8, ab)
									st64(a, 0)
									return ac
								}
								if (ld8(ld64(ld64(s450 + 0x30)) + 0x29) != 0) {
									if (ld8(ld64(s450 + 0x28) + 0x29) != 0) {
										const ad = ld64(ld64(s450 + 0x20))
										copyr(s2b0, ad, 0x20)
										ac = memcmp(s2b0, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32
										if (ac != 0) {
											anchor_error_from(s360, 0x7dc /* anchor::ConstraintAddress */)
											const ag = Error_with_account_name(s370, ld64(s360), ld64(s360 + 8), "token_program", 0xd)
											const af = ld64(s370 + 8)
											const ae = ld64(s370)
											copyr(s290, s2b0, 0x20)
											st64(s270, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
											ac = fn_13b5c0(s380, ae, af, s290, ag)
											ab = ld64(s380)
											st64(a + 0x10, ld64(s380 + 8))
											st64(a + 8, ab)
											st64(a, 0)
											return ac
										}
										st64(a + 0x50, ld64(s450 + 0x10))
										st64(a + 0x48, ld64(s450 + 8))
										st64(a + 0x40, ld64(s450))
										st64(a + 0x38, t)
										st64(a + 0x30, ld64(s450 + 0x18))
										st64(a + 0x28, ld64(s450 + 0x20))
										st64(a + 0x20, ld64(s450 + 0x28))
										st64(a + 0x18, reward_mint_box)
										st64(a + 0x10, ld64(s450 + 0x30))
										st64(a + 8, ld64(s450 + 0x38))
										st64(a, reward_authority)
										return ac
									}
									anchor_error_from(s390, 0x7d0 /* anchor::ConstraintMut */)
									ac = Error_with_account_name(s3a0, ld64(s390), ld64(s390 + 8), "reward_vault", 0xc)
									ab = ld64(s3a0)
									st64(a + 0x10, ld64(s3a0 + 8))
									st64(a + 8, ab)
									st64(a, 0)
									return ac
								}
								anchor_error_from(s3b0, 0x7d0 /* anchor::ConstraintMut */)
								ac = Error_with_account_name(s3c0, ld64(s3b0), ld64(s3b0 + 8), 0x100152b28 /* "whirlpool" */, 9)
								ab = ld64(s3c0)
								st64(a + 0x10, ld64(s3c0 + 8))
								st64(a + 8, ab)
								st64(a, 0)
								return ac
							}
							anchor_error_from(s330, 0x7dc /* anchor::ConstraintAddress */)
							const aa = Error_with_account_name(s340, ld64(s330), ld64(s330 + 8), "reward_authority", 0x10)
							const z = ld64(s340 + 8)
							const y = ld64(s340)
							copy(s290, s2d0, 0x40)
							ac = fn_13b5c0(s350, y, z, s290, aa)
							ab = ld64(s350)
							st64(a + 0x10, ld64(s350 + 8))
							st64(a + 8, ab)
							st64(a, 0)
							return ac
						}
						ac = Error_with_account_name(s320, r, s, "system_program", 0xe)
						ab = ld64(s320)
						st64(a + 0x10, ld64(s320 + 8))
						st64(a + 8, ab)
						st64(a, 0)
						return ac
					}
					ac = Error_with_account_name(s310, p, q, "token_program", 0xd)
					ab = ld64(s310)
					st64(a + 0x10, ld64(s310 + 8))
					st64(a + 8, ab)
					st64(a, 0)
					return ac
				}
				ac = Error_with_account_name(s300, n, o, "reward_vault", 0xc)
				ab = ld64(s300)
				st64(a + 0x10, ld64(s300 + 8))
				st64(a + 8, ab)
				st64(a, 0)
				return ac
			}
			alloc_handle_alloc_error(8, 0x60)
		}
		alloc_handle_alloc_error(8, 0x290)
	}
	ac = Error_with_account_name(s2f0, g, i, "funder", 6)
	ab = ld64(s2f0)
	st64(a + 0x10, ld64(s2f0 + 8))
	st64(a + 8, ab)
	st64(a, 0)
	return ac
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
// types [heur]: b: InitializeRewardContext (the handler ix_initialize_reward passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_32bc0(a: u64, b: InitializeRewardContext, c: u64): u64 {
	const s20 = fp - 0x20, s28 = fp - 0x28, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s90 = fp - 0x90, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	const accounts: InitializeRewardAccounts = b.accounts
	const g: AccountInfo = accounts.reward_mint.info
	const h: LamportsCell = g.lamports
	const l = ld64(accounts + 0x10)
	const k = g.key
	rc_inc(h)
	const i: DataCell = g.data
	const j = i.strong
	st64(s90, c, k, l, a)
	rc_inc(i, j)
	const p = g.owner
	const o = g.rent_epoch
	const n = g.is_signer
	const m = g.is_writable
	st8(s28 + 2, g.executable)
	st8(s28, n, m)
	st64(s40, i, p, o)
	st64(s50, ld64(s90 + 8))
	st64(s50 + 8, h)
	st64(sff8, ld64(accounts + 0x28))
	st64(sff0, accounts + 0x30)
	st64(s1000, accounts + 8)
	let w = fn_78f88(s60, ld64(s90 + 0x10), accounts + 0x20, s50, accounts + 8, ld64(sff8), accounts + 0x30)
	let v = ld64(s60 + 8)
	const q = ld64(s60)
	rc_dec(h)
	const u = ld64(s90 + 0x18)
	rc_dec(i)
	if (q != 2) {
		st64(u, q, v)
		return w
	}
	const t = ld64(accounts + 0x10)
	const r = accounts.reward_mint.info.key
	copyr(s20, r, 0x20)
	const s = accounts.reward_vault.key
	copyr(s50, s, 0x20)
	w = fn_5e558(s70, t + 8, ld64(s90) as u8, s20, s50)
	v = ld64(s70 + 8)
	st64(u, ld64(s70))
	st64(u + 8, v)
	return w
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_6aa0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let u, v, w: u64
	const f = memcmp(c, d, 0x20)
	let r = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, r)
		st64(a, 2)
		return g
	}
	const h = ld64(b)
	g = common_is_closed(h)
	r = undef
	if (g != 0) {
		st64(a + 8, r)
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
		const y = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, y)
		return g
	}
	B30: {
		const k = ld64(j)
		st64(s28 + 8, ld64(j + 8))
		st64(s28, k)
		st64(s28 + 0x10, 0)
		g = fn_13ae08(s28, 0x100151ea0, 8)
		if (g == 0) {
			g = fn_13ae08(s28, b + 0x188, 0x20)
			if (g == 0) {
				g = fn_13ae08(s28, b + 0x28c, 1)
				if (g == 0) {
					st16(s10, ld16(b + 0x284))
					g = fn_13ae08(s28, s10, 2)
					if (g == 0) {
						g = fn_13ae08(s28, b + 0x286, 2)
						if (g == 0) {
							st16(s10, ld16(b + 0x288))
							g = fn_13ae08(s28, s10, 2)
							if (g == 0) {
								st16(s10, ld16(b + 0x28a))
								g = fn_13ae08(s28, s10, 2)
								if (g == 0) {
									const n = ld64(b + 0x228)
									st64(s10 + 8, ld64(b + 0x230))
									st64(s10, n)
									g = fn_13ae08(s28, s10, 0x10)
									if (g == 0) {
										const o = ld64(b + 0x238)
										st64(s10 + 8, ld64(b + 0x240))
										st64(s10, o)
										g = fn_13ae08(s28, s10, 0x10)
										if (g == 0) {
											st32(s10, ld32(b + 0x280))
											g = fn_13ae08(s28, s10, 4)
											if (g == 0) {
												st64(s10, ld64(b + 0x268))
												g = fn_13ae08(s28, s10, 8)
												if (g == 0) {
													st64(s10, ld64(b + 0x270))
													g = fn_13ae08(s28, s10, 8)
													if (g == 0) {
														g = fn_13ae08(s28, b + 0x1a8, 0x20)
														if (g == 0) {
															g = fn_13ae08(s28, b + 0x1c8, 0x20)
															if (g == 0) {
																const p = ld64(b + 0x248)
																st64(s10 + 8, ld64(b + 0x250))
																st64(s10, p)
																g = fn_13ae08(s28, s10, 0x10)
																if (g == 0) {
																	g = fn_13ae08(s28, b + 0x1e8, 0x20)
																	if (g == 0) {
																		g = fn_13ae08(s28, b + 0x208, 0x20)
																		if (g == 0) {
																			const q = ld64(b + 0x258)
																			st64(s10 + 8, ld64(b + 0x260))
																			st64(s10, q)
																			g = fn_13ae08(s28, s10, 0x10)
																			if (g == 0) {
																				st64(s10, ld64(b + 0x278))
																				g = fn_13ae08(s28, s10, 8)
																				if (g == 0) {
																					g = fn_f658(b + 8, s28)
																					if (g == 0) {
																						r = ld64(m) + 1
																						st64(m, r)
																						st64(a + 8, r)
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
								}
							}
						}
					}
				}
			}
			const s = g
			if (2 > (g & 3) - 2) {
				break B30
			}
			if ((s & 3) == 0) {
				break B30
			}
		} else {
			const l = g
			if (2 > (g & 3) - 2) {
				break B30
			}
			if ((l & 3) == 0) {
				break B30
			}
		}
		const t = ld64(ld64(g + 7))
		callx(t, ld64(g - 1), t)
	}
	g = anchor_error_from(s48, 0xbbc /* anchor::AccountDidNotSerialize */, u, v, w)
	r = ld64(s48 + 8)
	const x = ld64(s48)
	st64(m, ld64(m) + 1)
	st64(a + 8, r)
	st64(a, x != 2 ? x : 2)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: p6 (value)
function fn_78f88(a: u64, b: u64, c: u64, d: AccountInfo, p5: u64, p6: u64, p7: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s48 = fp - 0x48, s60 = fp - 0x60, s80 = fp - 0x80, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sd0 = fp - 0xd0, sd8 = fp - 0xd8, sf0 = fp - 0xf0, s118 = fp - 0x118, s120 = fp - 0x120, s138 = fp - 0x138, s140 = fp - 0x140, s158 = fp - 0x158, s170 = fp - 0x170, s178 = fp - 0x178, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s280 = fp - 0x280, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8, s2b0 = fp - 0x2b0, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2c8 = fp - 0x2c8, sfe8 = fp - 0xfe8, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let aa, ab, ah: u64
	st64(s280 + 0x10, c)
	st64(s298, b)
	st64(s280 + 0x20, a)
	const f: AccountInfo = p6
	const g = f.key
	copyr(sd0, g + 8, 0x18)
	st64(s280 + 0x58, g)
	st64(sd8, ld64(g))
	const n = memcmp(sd8, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20)
	const h: LamportsCell = f.lamports
	rc_inc(h)
	const i: DataCell = f.data
	const o = p7
	const p = p5
	rc_inc(i)
	st64(s280 + 0x50, h)
	const j: LamportsCell = d.lamports
	const k = j.strong
	st64(s280 + 0x48, d.key)
	st64(s280 + 0x28, f.executable)
	st64(s280 + 0x30, f.is_writable)
	st64(s280 + 0x38, f.is_signer)
	st64(s280 + 0x40, f.rent_epoch)
	st64(s280 + 0x60, f.owner)
	rc_inc(j, k)
	const l: DataCell = d.data
	st64(s280 + 0x68, l)
	const m = l.strong
	rc_inc(ld64(s280 + 0x68), m)
	st64(s280, p, o)
	st64(s298 + 8, n)
	st64(s280 + 0x18, (n as u32) == 0)
	const v = d.owner
	const u = d.rent_epoch
	const t = d.is_signer
	const s = d.is_writable
	const r = d.executable
	st64(sb0, ld64(s280 + 0x68))
	st64(s2a0, j)
	st64(sb8, j)
	const q = ld64(s280 + 0x48)
	st64(sd0 + 0x10, q)
	st8(s80 + 0x1a, ld64(s280 + 0x28))
	st8(s80 + 0x19, ld64(s280 + 0x30))
	st8(s80 + 0x18, ld64(s280 + 0x38))
	st64(s80 + 0x10, ld64(s280 + 0x40))
	st64(s80 + 8, ld64(s280 + 0x60))
	st64(s298 + 0x10, i)
	st64(s80, i)
	st64(sa0 + 0x18, ld64(s280 + 0x50))
	st64(sa0 + 0x10, ld64(s280 + 0x58))
	st64(s2c8, r)
	st8(sa0 + 0xa, r)
	st64(s2c0, s)
	st8(sa0 + 9, s)
	st64(s2b8, t)
	st8(sa0 + 8, t)
	st64(s2b0, u)
	st64(sa0, u)
	st64(s2a8, v)
	st64(sa8, v)
	st64(s60, 8, 0)
	st64(sd8, 0, 8, 0)
	let ac = fn_127df0(s140, sd8, (n as u32) != 0 ? 2 : 0x1001537e4, ld64(s280 + 0x18))
	let w = ld64(s140)
	if (w != 2) {
		aa = ld64(s280 + 0x20)
		st64(aa + 8, ld64(s138))
		st64(aa, w)
		return ac
	}
	const ad = ld64(s138)
	copyr(sd8, q, 0x20)
	if (rent_check_id_136a18(sd8) != 0) {
		ac = fn_5fd40(s1c0)
		ah = 0x1f1df0
		ab = ld64(s1c0 + 8)
		w = ld64(s1c0)
		if (w != 2) {
			aa = ld64(s280 + 0x20)
			st64(aa + 8, ab)
			st64(aa, w)
			return ac
		}
	} else {
		rent_get(sd8)
		const y = ld64(sd0 + 8)
		const z = ld64(sd0)
		if (ld64(sd8) != 0) {
			st32(s140, ld32(sd0 + 0x11))
			st32(s140 + 3, ld32(sd0 + 0x14))
			const x = ld8(sd0 + 0x10)
			st32(sd0 + 0xc, ld32(s140 + 3))
			st32(sd0 + 9, ld32(s140))
			st8(sd0 + 8, x)
			st64(sd8, z, y)
			ac = fn_13b430(s1b0, sd8)
			w = ld64(s1b0)
			aa = ld64(s280 + 0x20)
			st64(aa + 8, ld64(s1b0 + 8))
			st64(aa, w)
			return ac
		}
		const ae = fn_14f7f8(y, __floatundidf(z * (ad + 0x80)))
		const af = fn_151cb0(ae, 0)
		const ag = fn_14f3e8(ae)
		ah = (fn_151a40(ae, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (af as i64) ? 0 : ag
	}
	st64(s280 + 0x18, ah)
	const ai: AccountInfo = ld64(ld64(s280 + 8))
	const aj: LamportsCell = ai.lamports
	const ap = ai.key
	rc_inc(aj)
	const ak: DataCell = ai.data
	rc_inc(ak)
	const ao = ai.owner
	const an = ai.rent_epoch
	const am = ai.is_signer
	const al = ai.is_writable
	st8(s178 + 2, ai.executable)
	st8(s178, am, al)
	st64(s1a0, ap, aj, ak, ao, an)
	const aq: AccountInfo = ld64(ld64(s280))
	const ar: LamportsCell = aq.lamports
	const ay = aq.key
	rc_inc(ar)
	const at: DataCell = aq.data
	rc_inc(at)
	const ax = aq.owner
	const aw = aq.rent_epoch
	const av = aq.is_signer
	const au = aq.is_writable
	st8(s118 + 2, aq.executable)
	st8(s118, av, au)
	st64(s140, ay, ar, at, ax, aw)
	const az: AccountInfo = ld64(ld64(s280 + 0x10))
	const ba: LamportsCell = az.lamports
	const bg = az.key
	rc_inc(ba)
	const bb: DataCell = az.data
	rc_inc(bb)
	const bf = az.owner
	const be = az.rent_epoch
	const bd = az.is_signer
	const bc = az.is_writable
	st8(sb0 + 2, az.executable)
	st8(sb0, bd, bc)
	st64(sd8, bg, ba, bb, bf, be)
	st64(sff0, ad)
	st64(sff8, ld64(s280 + 0x18))
	st64(s1000, ld64(s280 + 0x58))
	st64(sfe8, 8, 0)
	ac = fn_5ecd8(s1d0, s1a0, s140, sd8, ld64(s1000), ld64(sff8), ad, 8, 0)
	w = ld64(s1d0)
	if (w != 2) {
		aa = ld64(s280 + 0x20)
		st64(aa + 8, ld64(s1d0 + 8))
		st64(aa, w)
		return ac
	}
	if ((ld64(s298 + 8) as u32) == 0) {
		fn_132d88(sd8, ld64(s280 + 0x58), az.key)
		copy(s170, sd0, 0x18)
		const bl = ld64(sd8)
		if (bl == 0x8000000000000000) {
			ac = fn_13b430(s210, s170)
			w = ld64(s210)
			aa = ld64(s280 + 0x20)
			st64(aa + 8, ld64(s210 + 8))
			st64(aa, w)
			return ac
		}
		memcpy(s120, sb8, 0x30)
		st64(s140, bl)
		copy(s138, s170, 0x18)
		const bm: LamportsCell = ld64(s280 + 0x50)
		const cf: DataCell = ld64(s298 + 0x10)
		rc_inc(bm)
		rc_inc(cf)
		const cg: LamportsCell = az.lamports
		const cm = az.key
		rc_inc(cg)
		const ch: DataCell = az.data
		rc_inc(ch)
		const cl = az.owner
		const ck = az.rent_epoch
		const cj = az.is_signer
		const ci = az.is_writable
		st8(s80 + 2, az.executable)
		st8(s80, cj, ci)
		st64(sa8, cm, cg, ch, cl, ck)
		st8(sb0 + 2, ld64(s280 + 0x28))
		st8(sb0 + 1, ld64(s280 + 0x30))
		st8(sb0, ld64(s280 + 0x38))
		st64(sb8, ld64(s280 + 0x40))
		st64(sd0 + 0x10, ld64(s280 + 0x60))
		st64(sd0 + 8, ld64(s298 + 0x10))
		st64(sd0, ld64(s280 + 0x50))
		st64(sd8, ld64(s280 + 0x58))
		const cn = fn_1390b0(s18, s140, sd8, 2)
		if (ld64(s18) != 0x800000000000001a /* Ok */) {
			copyr(s1a0, s18, 0x18)
			const cp = fn_13b430(s1e0, s1a0)
			ab = ld64(s1e0 + 8)
			w = ld64(s1e0)
			ac = ptr_drop_in_place_bf20(sd8, cp)
			aa = ld64(s280 + 0x20)
			st64(aa + 8, ab)
			st64(aa, w)
			return ac
		}
		ptr_drop_in_place_bf20(sd8, cn)
	}
	const bj = az.key
	const bh: AccountInfo = ld64(ld64(s298))
	const bi = bh.key
	copyr(s1a0, bi, 0x20)
	fn_12f7b0(sd8, ld64(s280 + 0x58), bj, ld64(s280 + 0x48), s1a0)
	copy(sf0, sd0, 0x18)
	const bk = ld64(sd8)
	if (bk == 0x8000000000000000) {
		ac = fn_13b430(s200, sf0)
		w = ld64(s200)
		aa = ld64(s280 + 0x20)
		st64(aa + 8, ld64(s200 + 8))
		st64(aa, w)
		return ac
	}
	memcpy(s120, sb8, 0x30)
	st64(s140, bk)
	copy(s138, sf0, 0x18)
	const bn: LamportsCell = ld64(s280 + 0x50)
	const bo: DataCell = ld64(s298 + 0x10)
	rc_inc(bn)
	rc_inc(bo)
	const bp: LamportsCell = az.lamports
	const by = az.key
	rc_inc(bp)
	const bq: DataCell = az.data
	rc_inc(bq)
	st64(s280 + 8, az.executable)
	st64(s280 + 0x10, az.is_writable)
	st64(s280 + 0x18, az.is_signer)
	const bu = az.rent_epoch
	const bw = az.owner
	const br: LamportsCell = ld64(s2a0)
	rc_inc(br)
	const bs: DataCell = ld64(s280 + 0x68)
	const bt = bs.strong
	bs.strong = bt + 1
	st64(s280, bu)
	if (bt != -1) {
		ab = bh.lamports
		const bv = ld64(ab)
		st64(s298 + 8, bq)
		const cd = bh.key
		rc_inc(ab, bv)
		st64(s298, bp)
		const bx: DataCell = bh.data
		rc_inc(bx)
		const cc = bh.owner
		const cb = bh.rent_epoch
		const ca = bh.is_signer
		const bz = bh.is_writable
		st8(s20 + 2, bh.executable)
		st8(s20, ca, bz)
		st64(s48, cd, ab, bx, cc, cb)
		st8(s60 + 0x12, ld64(s2c8))
		st8(s60 + 0x11, ld64(s2c0))
		st8(s60 + 0x10, ld64(s2b8))
		st64(s60 + 8, ld64(s2b0))
		st64(s60, ld64(s2a8))
		st64(s80 + 0x18, ld64(s280 + 0x68))
		st64(s80 + 0x10, ld64(s2a0))
		st64(s80 + 8, ld64(s280 + 0x48))
		st8(s80 + 2, ld64(s280 + 8))
		st8(s80 + 1, ld64(s280 + 0x10))
		st8(s80, ld64(s280 + 0x18))
		st64(sa0 + 0x18, ld64(s280))
		st64(sa0 + 0x10, bw)
		copyr(sa0, s298, 0x10)
		st64(sa8, by)
		st8(sb0 + 2, ld64(s280 + 0x28))
		st8(sb0 + 1, ld64(s280 + 0x30))
		st8(sb0, ld64(s280 + 0x38))
		st64(sb8, ld64(s280 + 0x40))
		st64(sd0 + 0x10, ld64(s280 + 0x60))
		st64(sd0 + 8, ld64(s298 + 0x10))
		st64(sd0, ld64(s280 + 0x50))
		st64(sd8, ld64(s280 + 0x58))
		const ce = fn_1390b0(s158, s140, sd8, 4)
		if (ld64(s158) == 0x800000000000001a /* Ok */) {
			ac = ptr_drop_in_place_c1b0(sd8, ce)
			aa = ld64(s280 + 0x20)
			st64(aa + 8, ab)
			st64(aa, 2)
			return ac
		}
		copyr(s18, s158, 0x18)
		const co = fn_13b430(s1f0, s18)
		ab = ld64(s1f0 + 8)
		w = ld64(s1f0)
		ac = ptr_drop_in_place_c1b0(sd8, co)
		aa = ld64(s280 + 0x20)
		st64(aa + 8, ab)
		st64(aa, w)
		return ac
	}
	abort()
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
function fn_5e558(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50
	let g, m: u64
	if (c > 2) {
		g = fn_87630(s50, 0x1a)
		m = ld64(s50)
		st64(a + 8, ld64(s50 + 8))
		st64(a, m)
		return g
	}
	st64(s20, 0, 0, 0, 0)
	const f = memcmp(b, s20, 0x20)
	let j = 0
	g = f as u32
	if (g != 0) {
		st64(s20, 0, 0, 0, 0)
		const h = memcmp(b + 0x80, s20, 0x20)
		j = 1
		g = h as u32
		if (g != 0) {
			st64(s20, 0, 0, 0, 0)
			const i = memcmp(b + 0x100, s20, 0x20)
			j = 2
			g = i as u32
			if (g != 0) {
				g = fn_87630(s30, 0x1a)
				m = ld64(s30)
				st64(a + 8, ld64(s30 + 8))
				st64(a, m)
				return g
			}
		}
	}
	if (j == c) {
		const k = b + (c << 7)
		st64(k + 0x18, ld64(d + 0x18))
		st64(k + 0x10, ld64(d + 0x10))
		st64(k + 8, ld64(d + 8))
		st64(k, ld64(d))
		copy(k + 0x20, e, 0x18)
		const l = ld64(e + 0x18)
		st64(k + 0x38, l)
		st64(a + 8, l)
		st64(a, 2)
		return g
	}
	g = fn_87630(s40, 0x1a)
	m = ld64(s40)
	st64(a + 8, ld64(s40 + 8))
	st64(a, m)
	return g
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), a (points to it)
function fn_127df0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s38 = fp - 0x38, s50 = fp - 0x50, s80 = fp - 0x80, s98 = fp - 0x98, sa0 = fp - 0xa0, sb8 = fp - 0xb8, se8 = fp - 0xe8, s100 = fp - 0x100, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s140 = fp - 0x140
	let n, u, v, ab, ae: u64
	B26: {
		const f = ld64(b + 0x48)
		fn_132800(sa0, f, ld64(b + 0x18), c, d)
		copy(sb8, s98, 0x18)
		const g = ld64(sa0)
		if (g == 0x8000000000000000) {
			n = fn_13b430(s138, sb8)
			const l = ld64(s138)
			st64(a + 8, ld64(s138 + 8))
			st64(a, l)
			const o = ld64(b + 0x28)
			const m = ld64(b + 0x20)
			if (rc_release(m)) {
				if (rc_release(m + 8)) {
					n = fn_83078(n)
				}
			}
			if (!rc_release(o)) {
				break B26
			}
			if (!rc_release(o + 8)) {
				break B26
			}
		} else {
			st64(s140, a)
			memcpy(se8, s80, 0x30)
			st64(s108, g)
			copy(s100, sb8, 0x18)
			memcpy(sa0, b + 0x18, 0x30)
			let i = fn_13ee80(s50, s108, sa0, 1)
			if (ld64(s50) == 0x800000000000001a /* Ok */) {
				const j = ld64(s98 + 8)
				const h = ld64(s98)
				if (rc_release(h)) {
					if (rc_release(h + 8)) {
						i = fn_83078(i)
					}
				}
				if (rc_release(j)) {
					if (rc_release(j + 8)) {
						fn_83078(i)
					}
				}
				B40: {
					B39: {
						fn_13f890(s38)
						const k = ld64(s38 + 0x20)
						if (k == 0x8000000000000000) {
							ae = 0x8000000000000002 /* Err(ProgramError::InvalidInstructionData) */
						} else {
							const z = ld64(s38)
							const y = ld64(s38 + 8)
							const x = ld64(s38 + 0x10)
							const w = ld64(s38 + 0x18)
							st64(s80 + 0x10, ld64(s38 + 0x30))
							st64(sa0, z, y, x, w)
							const aa = ld64(s38 + 0x28)
							st64(s80 + 8, aa)
							ab = memcmp(sa0, f, 0x20) as u32
							if (ab != 0) {
								ae = 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */
								if (k == 0) {
									break B39
								}
							} else {
								if (ld64(s80 + 0x10) == 8) {
									const ad = ld64(aa)
									if (k != 0) {
										ab = fn_83078(ab)
									}
									const ac = ld64(s140)
									st64(ac + 8, ad)
									st64(ac, 2)
									break B40
								}
								ae = 0x8000000000000002 /* Err(ProgramError::InvalidInstructionData) */
								if (k == 0) {
									break B39
								}
							}
							fn_83078(ab)
						}
					}
					st64(sa0, ae)
					ab = fn_13b430(s128, sa0)
					const ag = ld64(s128)
					const af = ld64(s140)
					st64(af + 8, ld64(s128 + 8))
					st64(af, ag)
				}
				if (ld64(s108) != 0) {
					ab = fn_83078(ab)
				}
				if (ld64(s100 + 0x10) != 0) {
					ab = fn_83078(ab)
				}
				v = ptr_drop_in_place_126088(b, ab)
				u = ld64(b + 0x58)
				const ah = ld64(b + 0x50)
				if (rc_release(ah)) {
					if (rc_release(ah + 8)) {
						v = fn_83078(v)
					}
				}
				if (!rc_release(u)) {
					return v
				}
				if (!rc_release(u + 8)) {
					return v
				}
				return fn_83078(v)
			}
			copyr(s38, s50, 0x18)
			n = fn_13b430(s118, s38)
			const q = ld64(s118)
			const p = ld64(s140)
			st64(p + 8, ld64(s118 + 8))
			st64(p, q)
			const s = ld64(s98 + 8)
			const r = ld64(s98)
			if (rc_release(r)) {
				if (rc_release(r + 8)) {
					n = fn_83078(n)
				}
			}
			if (rc_release(s)) {
				if (rc_release(s + 8)) {
					n = fn_83078(n)
				}
			}
			if (ld64(s108) != 0) {
				n = fn_83078(n)
			}
			if (ld64(s100 + 0x10) == 0) {
				break B26
			}
		}
		n = fn_83078(n)
	}
	v = ptr_drop_in_place_126088(b, n)
	u = ld64(b + 0x58)
	const t = ld64(b + 0x50)
	if (rc_release(t)) {
		if (rc_release(t + 8)) {
			v = fn_83078(v)
		}
	}
	if (!rc_release(u)) {
		return v
	}
	if (rc_release(u + 8)) {
		return fn_83078(v)
	}
	return v
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
function fn_5fd40(a: u64): u64 {
	const s28 = fp - 0x28, s50 = fp - 0x50, s68 = fp - 0x68, s70 = fp - 0x70, s78 = fp - 0x78, s98 = fp - 0x98, sc8 = fp - 0xc8, se0 = fp - 0xe0, sf8 = fp - 0xf8, s108 = fp - 0x108
	let j = rent_get(s70)
	copy(se0, s68, 0x18)
	if (ld64(s70) != 0) {
		j = fn_13b430(s108, se0)
		const i = ld64(s108)
		st64(a + 8, ld64(s108 + 8))
		st64(a, i)
		return j
	}
	st64(sf8 + 0x10, ld64(se0 + 0x10))
	const f = ld64(se0)
	st64(sf8, f)
	const g = ld64(se0 + 8)
	st64(sf8 + 8, g)
	let h = 0x3ff0000000000000
	if (g == 0x3ff0000000000000) {
		if (0x1b31 > f) {
			st64(a + 8, f)
			st64(a, 2)
			return j
		}
	} else {
		h = 0x4000000000000000
		if (g == 0x4000000000000000 && f == 0xd98) {
			st64(a + 8, f)
			st64(a, 2)
			return j
		}
	}
	st64(s98, sf8, fn_14f060, s78, fn_14e7a8, g)
	st64(s28 + 0x18, 0xc00000020)
	st8(s28 + 0x20, 3)
	st64(s28, 0, 0x12, 1)
	st64(s50 + 0x18, 2)
	st8(s50 + 0x10, 3)
	st64(s50, 0, 0x20)
	st64(s68 + 8, 2)
	st64(s70, 2)
	st64(sc8, 0x10015a0c0, 2, s98, 2, s70, 2)
	// fmt pieces ["internal error: entered unreachable code: unexpected Rent configuration on the Solana network: lamports_per_byte_year=",", exemption_threshold_bits="] (with placeholder specs), arguments: *sf8 [fn_14f060], g [fn_14e7a8]
	fn_149478(sc8, 0x10015a0e0, h)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
function fn_14f7f8(a: u64, b: u64): u64 {
	return fn_14f808(a, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it), c (points to it), p5 (value), p7 (value)
function fn_5ecd8(a: u64, b: u64, c: u64, d: AccountInfo, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64): u64 {
	const s18 = fp - 0x18, s20 = fp - 0x20, s40 = fp - 0x40, s48 = fp - 0x48, s78 = fp - 0x78, sa8 = fp - 0xa8, sf8 = fp - 0xf8, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s180 = fp - 0x180, s188 = fp - 0x188, s190 = fp - 0x190, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, s1b0 = fp - 0x1b0, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1c8 = fp - 0x1c8, s1d0 = fp - 0x1d0, s1d8 = fp - 0x1d8, s1e0 = fp - 0x1e0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8, s200 = fp - 0x200, s1000 = fp - 0x1000
	let g, az, bg, bh, bi: u64
	B5: {
		g = c
		st64(s150, a, b)
		const f = ld64(b)
		copyr(sa8, f, 0x20)
		if ((memcmp(d.owner, sa8, 0x20) as u32) == 0) {
			st64(s160, p8, p9)
			st64(s180, p7, p6)
			let v = p5
			let h = fn_143100(d)
			let i = ld64(g)
			if (h != 0) {
				const j = d.key
				st64(s188, i)
				st64(s1f8, h)
				fn_142e70(sf8, j, i, h)
				const k: AccountInfo = ld64(s150 + 8)
				const l: LamportsCell = k.lamports
				rc_inc(l)
				const t: DataCell = k.data
				const u = t.strong
				st64(s180 + 0x18, l)
				rc_inc(t, u)
				const aa = v
				const w: LamportsCell = d.lamports
				const x = w.strong
				st64(s1b0, d.key)
				st64(s1a8, k.executable)
				st64(s1a0, k.is_writable)
				st64(s198, k.is_signer)
				st64(s190, k.rent_epoch)
				const ag = k.owner
				rc_inc(w, x)
				const y: DataCell = d.data
				st64(s180 + 0x10, y)
				const z = y.strong
				st64(s1b8, w)
				rc_inc(ld64(s180 + 0x10), z)
				const ad: AccountInfo = g
				const ab = ld64(g + 8)
				const ac = ld64(ab)
				st64(s1c0, t)
				st64(s1e0, d.executable)
				st64(s1d8, d.is_writable)
				st64(s1d0, d.is_signer)
				st64(s1c8, d.rent_epoch)
				const al = d.owner
				rc_inc(ab, ac)
				const ae: DataCell = ad.data
				const af = ae.strong
				st64(s1e8, ag)
				st64(s200, aa)
				rc_inc(ae, af)
				const ak = ad.owner
				const aj = ad.rent_epoch
				const ai = ad.is_signer
				const ah = ad.is_writable
				st64(s1f0, ad)
				st8(s20 + 2, ad.executable)
				st8(s20, ai, ah)
				st64(s40, ab, ae, ak, aj)
				st64(s48, ld64(s188))
				st8(s78 + 0x2a, ld64(s1e0))
				st8(s78 + 0x29, ld64(s1d8))
				st8(s78 + 0x28, ld64(s1d0))
				st64(s78 + 0x20, ld64(s1c8))
				st64(s78 + 0x18, al)
				st64(s78 + 0x10, ld64(s180 + 0x10))
				st64(s78 + 8, ld64(s1b8))
				st64(s78, ld64(s1b0))
				st8(sa8 + 0x2a, ld64(s1a8))
				st8(sa8 + 0x29, ld64(s1a0))
				st8(sa8 + 0x28, ld64(s198))
				st64(sa8 + 0x20, ld64(s190))
				st64(sa8 + 0x18, ld64(s1e8))
				st64(sa8 + 0x10, ld64(s1c0))
				st64(sa8 + 8, ld64(s180 + 0x18))
				st64(sa8, f)
				copy(s1000, s160, 0x10)
				fn_1390d8(s110, sf8, sa8, 3, fp)
				if (ld64(s110) != 0x800000000000001a /* Ok */) {
					copyr(s18, s110, 0x18)
					bi = fn_13b430(s130, s18)
					az = ld64(s130 + 8)
					bh = ld64(s130)
					const bk = ld64(sa8 + 0x10)
					const bj = ld64(sa8 + 8)
					rc_dec(bj)
					g = ld64(s1f0)
					rc_dec(bk)
					const bm = ld64(s78 + 0x10)
					const bl = ld64(s78 + 8)
					rc_dec(bl)
					rc_dec(bm)
					const bo: DataCell = ld64(s40 + 8)
					const bn = ld64(s40)
					rc_dec(bn)
					if (!rc_release(bo)) {
						break B5
					}
					bo.weak = bo.weak - 1
					break B5
				}
				const an = ld64(sa8 + 0x10)
				const am = ld64(sa8 + 8)
				rc_dec(am)
				g = ld64(s1f0)
				h = ld64(s1f8)
				i = ld64(s188)
				v = ld64(s200)
				rc_dec(an)
				const ap = ld64(s78 + 0x10)
				const ao = ld64(s78 + 8)
				rc_dec(ao)
				rc_dec(ap)
				const ar: DataCell = ld64(s40 + 8)
				const aq = ld64(s40)
				rc_dec(aq)
				rc_dec(ar)
			}
			const at = d.key
			st64(s1000, ld64(s180))
			st64(s1000 + 8, v)
			h = max(h, ld64(s180 + 8))
			fn_142800(sf8, i, at, h, fp)
			memcpy(s48, d, 0x30)
			memcpy(sa8, ld64(s150 + 8), 0x30)
			memcpy(s78, g, 0x30)
			copy(s1000, s160, 0x10)
			bi = fn_1390d8(s110, sf8, sa8, 3, fp)
			if (ld64(s110) == 0x800000000000001a /* Ok */) {
				const av = ld64(sa8 + 0x10)
				const au = ld64(sa8 + 8)
				rc_dec(au)
				bg = ld64(s150)
				rc_dec(av)
				const ax = ld64(s78 + 0x10)
				const aw = ld64(s78 + 8)
				rc_dec(aw)
				rc_dec(ax)
				az = ld64(s40 + 8)
				const ay = ld64(s40)
				rc_dec(ay)
				if (!rc_release(az)) {
					st64(bg + 8, az)
					st64(bg, 2)
					return bi
				}
				st64(az + 8, ld64(az + 8) - 1)
				st64(bg + 8, az)
				st64(bg, 2)
				return bi
			}
			copyr(s18, s110, 0x18)
			bi = fn_13b430(s140, s18)
			az = ld64(s140 + 8)
			bh = ld64(s140)
			const bb = ld64(sa8 + 0x10)
			const ba = ld64(sa8 + 8)
			rc_dec(ba)
			rc_dec(bb)
			const bd = ld64(s78 + 0x10)
			const bc = ld64(s78 + 8)
			rc_dec(bc)
			rc_dec(bd)
			const bf: DataCell = ld64(s40 + 8)
			const be = ld64(s40)
			rc_dec(be)
			if (!rc_release(bf)) {
				bg = ld64(s150)
				st64(bg + 8, az)
				st64(bg, bh)
				return bi
			}
			bf.weak = bf.weak - 1
			bg = ld64(s150)
			st64(bg + 8, az)
			st64(bg, bh)
			return bi
		}
		bi = anchor_error_from(s120, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		az = ld64(s120 + 8)
		bh = ld64(s120)
	}
	const n: DataCell = d.data
	const m: LamportsCell = d.lamports
	rc_dec(m)
	rc_dec(n)
	const p = ld64(g + 0x10)
	const o = ld64(g + 8)
	rc_dec(o)
	rc_dec(p)
	const q = ld64(s150 + 8)
	const s = ld64(q + 0x10)
	const r = ld64(q + 8)
	rc_dec(r)
	bg = ld64(s150)
	if (!rc_release(s)) {
		st64(bg + 8, az)
		st64(bg, bh)
		return bi
	}
	st64(s + 8, ld64(s + 8) - 1)
	st64(bg + 8, az)
	st64(bg, bh)
	return bi
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (points to it)
function fn_12f7b0(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s48 = fp - 0x48, s50 = fp - 0x50, s68 = fp - 0x68
	if ((memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
		return
	}
	copyr(s48, e, 0x20)
	st32(s50, 0x12)
	fn_12e9c0(s68, s50)
	const f = __rust_alloc(0x44, 1)
	if (f == 0) {
		alloc_handle_alloc_error(1, 0x44)
	}
	st64(f + 0x18, ld64(c + 0x18))
	st64(f + 0x10, ld64(c + 0x10))
	st64(f + 8, ld64(c + 8))
	st64(f, ld64(c))
	st16(f + 0x20, 0x100)
	copy(f + 0x22, d, 0x20)
	st16(f + 0x42, 0)
	st64(a + 0x48, ld64(b + 0x18))
	st64(a + 0x40, ld64(b + 0x10))
	st64(a + 0x38, ld64(b + 8))
	st64(a + 0x30, ld64(b))
	copy(a + 0x18, s68, 0x18)
	st64(a + 8, f, 2)
	st64(a, 2)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value), a (points to it)
function fn_132d88(a: u64, b: u64, c: u64) {
	if ((memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
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
	st16(f + 0x20, 0x100)
	fn_12e9c0(a + 0x18, 0x100155f68)
	st64(a + 0x48, ld64(b + 0x18))
	st64(a + 0x40, ld64(b + 0x10))
	st64(a + 0x38, ld64(b + 8))
	st64(a + 0x30, ld64(b))
	st64(a + 8, f, 1)
	st64(a, 1)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), c (points to it)
function fn_1390b0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1000 = fp - 0x1000
	st64(s1000, 8, 0)
	return fn_1390d8(a, b, c, d, fp)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value)
function fn_132800(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s48 = fp - 0x48, s50 = fp - 0x50
	let j, k: u64
	if ((memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
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
	let i = 2
	let g = 0
	if (e != 0) {
		g = e << 1
		if (e > 0x3fffffffffffffff) {
			raw_vec_handle_error(0, g, g, j, k)
		}
		const h = __rust_alloc(g, 2)
		i = h
		if (h == 0) {
			raw_vec_handle_error(2, g, g, j, k)
		}
	}
	memcpy(i, d, g)
	st64(s48, e, i, e)
	st32(s50, 0x15)
	const l = fn_12e9c0(a + 0x18, s50)
	st64(a + 0x48, ld64(b + 0x18))
	st64(a + 0x40, ld64(b + 0x10))
	st64(a + 0x38, ld64(b + 8))
	st64(a + 0x30, ld64(b))
	st64(a + 8, f, 1)
	st64(a, 1)
	if (e != 0) {
		fn_83078(l)
	}
}

function fn_13ee80(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1000 = fp - 0x1000
	st64(s1000, 8, 0)
	return fn_13eea8(a, b, c, d, ld64(s1000), ld64(s1000 + 8))
}

function fn_83078(r0: u64): u64 {
	return r0
}

function fn_14f060(a: u64, b: u64): u64 {
	return fn_14ecd0(ld64(a), 1, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_149478(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	const s20 = fp - 0x20, s28 = fp - 0x28
	st64(s20, 0x10015b8e0, a, b)
	st16(s20 + 0x18, 1)
	st64(s28, 1)
	fn_147238(s28, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
function fn_143100(a: AccountInfo, b: u64, c: u64, d: u64, e: u64): u64 {
	const f: LamportsCell = a.lamports
	const g = f.borrow
	if (g > 0x7ffffffffffffffe) {
		fn_1486f0(0x10015b4e0, g, 0x7ffffffffffffffe, d, e)
	}
	f.borrow = g + 1
	const h = f.value.amount
	f.borrow = g
	return h
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_147238(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	fn_1478b8(a, b, c, d, e)
}

function fn_1486f0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s1 = fp - 0x1, s18 = fp - 0x18, s48 = fp - 0x48
	st64(s48, 0x10015b8a0)
	st64(s48 + 0x10, s18)
	st64(s18, s1, BorrowError_fmt)
	st64(s48 + 0x20, 0)
	st64(s48 + 8, 1)
	st64(s48 + 0x18, 1)
	// fmt "already mutably borrowed: {}" {} = *s1 [BorrowError_fmt]
	fn_149478(s48, a, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_1478b8(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	custom_panic(a, b, c, d, e)
	abort()
}
