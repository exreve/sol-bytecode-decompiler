// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction initialize_reward_v2: handler + 41 reachable functions
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
interface InitializeRewardV2Accounts { // Accounts struct of instruction initialize_reward_v2 as accounts_initialize_reward_v2 returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	reward_authority: at<0x00, ref<AccountInfo>>
	funder:           at<0x08, ref<AccountInfo>>
	reward_mint:      at<0x18, ref<Mint>> // Box<Account<Mint>>
	reward_vault:     at<0x28, ref<AccountInfo>>
}
interface InitializeRewardV2Context { // anchor_lang Context of instruction initialize_reward_v2 (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<InitializeRewardV2Accounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_invoke_signed_rust(ix: u64, accountInfos: u64, accountInfosLen: u64, signerSeeds: u64, signerSeedsLen: u64): u64 // CPI (Rust ABI: &Instruction, &[AccountInfo], &[&[&[u8]]])
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function sol_memset(dst: u64, byte: u64, n: u64): void // memset
declare function try_accounts_120(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_610(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function fn_b580(a: u64): u64 // lib uses alloc_handle_alloc_error, Error__new
declare function ptr_drop_in_place_bf20(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 2]>
declare function ptr_drop_in_place_c1b0(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 4]>
declare function fn_e478(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function fn_f658(a: u64, b: u64): u64 // lib
declare function AccountInfo_clone(a: u64, b: u64): void // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11990(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11a48(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_122e8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function ptr_drop_in_place_126088(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<alloc::vec::Vec<solana_account_info::AccountInfo>>
declare function fn_12cf58(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib uses raw_vec_handle_error
declare function fn_12e0b0(a: u64, b: u64): u64 // lib
declare function fn_12e558(a: u64, b: u64, c: u64, r0: u64): u64 // lib
declare function Mint_unpack_from_slice_133108(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <spl_token::state::Mint as solana_program_pack::Pack>::unpack_from_slice
declare function rent_check_id_133890(a: u64): u64 // lib solana_sdk_ids::sysvar::rent::check_id
declare function rent_check_id_136a18(a: u64): u64 // lib solana_sdk_ids::sysvar::rent::check_id
declare function fn_1390d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcmp, AccountInfo_try_borrow_lamports, AccountInfo_try_borrow_data
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b3a8(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error, memcpy
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function ErrorCode_name(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib anchor_lang::error::ErrorCode::name
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function ErrorCode_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::error::ErrorCode as core::fmt::Display>::fmt
declare function rent_get(a: u64): u64 // lib solana_sysvar::rent::<impl solana_sysvar::Sysvar for solana_rent::Rent>::get
declare function fn_13f890(a: u64): void // lib uses memset, sol_get_return_data, __rust_alloc, raw_vec_handle_error, …
declare function fn_142800(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_142e70(a: u64, b: u64, c: u64, d: u64): void // lib uses __rust_alloc, alloc_handle_alloc_error
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
declare function fn_14f3e8(a: u64): u64 // lib
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function __floatundidf(a: u64): u64 // lib __floatundidf
declare function fn_14f808(a: u64, b: u64): u64 // lib uses __multi3
declare function fn_151a40(a: u64, b: u64): u64 // lib
declare function fn_151cb0(a: u64, b: u64): u64 // lib

// instruction handler: initialize_reward_v2 (discriminator sha256("global:initialize_reward_v2")[..8] = 0x3185e5eb324d015b)
// accounts [str: the program's account-error strings, in order of first use]: reward_authority, whirlpool, reward_mint, reward_token_badge, rent, funder, reward_vault, reward_token_program, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
function ix_initialize_reward_v2(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s48 = fp - 0x48, s50 = fp - 0x50, s60 = fp - 0x60, sa8 = fp - 0xa8, sc0 = fp - 0xc0, sd0 = fp - 0xd0, sd1 = fp - 0xd1, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, sff8 = fp - 0xff8
	let h, l: u64
	sol_log("Instruction: InitializeRewardV2", 0x1f)
	if (ix_args_len == 0) {
		const j = fn_1459d0(0x100159468)
		if (2 > (j & 3) - 2) {
			l = anchor_error_from(s118, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s118)
			st64(a + 8, ld64(s118 + 8))
			st64(a, h)
			return l
		}
		if ((j & 3) == 0) {
			l = anchor_error_from(s118, 0x66 /* anchor::InstructionDidNotDeserialize */)
			h = ld64(s118)
			st64(a + 8, ld64(s118 + 8))
			st64(a, h)
			return l
		}
		const k = ld64(ld64(j + 7))
		callx(k, ld64(j - 1), k)
		l = anchor_error_from(s118, 0x66 /* anchor::InstructionDidNotDeserialize */)
		h = ld64(s118)
		st64(a + 8, ld64(s118 + 8))
		st64(a, h)
		return l
	}
	const m = ld8(ix_args)
	st8(sd1, 0xff)
	st64(sd0, accounts, accounts_len)
	st64(sff8, sd1)
	l = accounts_initialize_reward_v2(s60, program_id, sd0, undef, fp)
	const g = ld64(s50)
	h = ld64(s60 + 8)
	const f = ld64(s60)
	if (f == 0) {
		st64(a + 8, g)
		st64(a, h)
		return l
	}
	memcpy(sa8, s48, 0x48)
	st64(sc0, f, h, g)
	st8(s48 + 8, ld8(sd1))
	copyr(s50, sd0, 0x10)
	st64(s60, program_id, sc0)
	l = fn_3cd20(se8, s60, m)
	h = ld64(se8)
	if (h == 2) {
		l = fn_6aa0(sf8, ld64(sc0 + 0x10), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
		const i = ld64(sf8)
		if (i != 2) {
			l = Error_with_account_name(s108, i, ld64(sf8 + 8), 0x100152b28 /* "whirlpool" */, 9)
			h = ld64(s108)
			st64(a + 8, ld64(s108 + 8))
			st64(a, h)
			return l
		}
		st64(a + 8, g)
		st64(a, 2)
		return l
	}
	st64(a + 8, ld64(se8 + 8))
	st64(a, h)
	return l
}

// Anchor Accounts::try_accounts of instruction initialize_reward_v2 (called by ix_initialize_reward_v2; name [str]: from the handler's "Instruction: …" log; was fn_e01d0)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: reward_authority (ConstraintAddress), whirlpool (ConstraintMut), reward_mint, reward_token_badge (AccountNotEnoughKeys, ConstraintSeeds), rent, funder (ConstraintMut), reward_vault (ConstraintMut), reward_token_program (ConstraintAddress), system_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: reward_mint_box, reward_authority, funder
function accounts_initialize_reward_v2(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s270 = fp - 0x270, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2d8 = fp - 0x2d8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s4e8 = fp - 0x4e8, s4f0 = fp - 0x4f0
	let o, p, q, ag, ah: u64
	st64(s4e8 + 0x58, b)
	try_accounts_11718(s290, c, c, d, e)
	const reward_authority: AccountInfo = ld64(s290 + 8)
	const f = ld64(s290)
	if (f != 2) {
		ah = Error_with_account_name(s308, f, reward_authority, "reward_authority", 0x10)
		ag = ld64(s308)
		st64(a + 0x10, ld64(s308 + 8))
		st64(a + 8, ag)
		st64(a, 0)
		return ah
	}
	st64(s4e8 + 0x50, ld64(e - 0xff8))
	try_accounts_11718(s290, c)
	const i = ld64(s290 + 8)
	const g = ld64(s290)
	if (g == 2) {
		try_accounts_11a48(s290, c)
		if (ld64(s290) == 0) {
			ah = Error_with_account_name(s488, ld64(s290 + 8), ld64(s290 + 0x10), 0x100152b28 /* "whirlpool" */, 9)
			ag = ld64(s488)
			st64(a + 0x10, ld64(s488 + 8))
			st64(a + 8, ag)
			st64(a, 0)
			return ah
		}
		const h = ld64(0x300000000 /* heap bump-allocator cursor */)
		const j = h != 0 ? sat_sub(h, 0x290) & -8 : 0x300007d70
		st64(s4e8 + 0x48, i)
		if (j > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(s4e8 + 0x40, j)
			memcpy(j, s290, 0x290)
			try_accounts_610(s290, c)
			if (ld32(s290) == 2) {
				ah = Error_with_account_name(s478, ld64(s290 + 8), ld64(s290 + 0x10), "reward_mint", 0xb)
				ag = ld64(s478)
				st64(a + 0x10, ld64(s478 + 8))
				st64(a + 8, ag)
				st64(a, 0)
				return ah
			}
			const l = ld64(0x300000000 /* heap bump-allocator cursor */)
			const funder: AccountInfo = ld64(s4e8 + 0x48)
			const reward_mint_box: Mint = l != 0 ? sat_sub(l, 0x80) & -8 : 0x300007f80
			if (reward_mint_box > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, reward_mint_box)
				st64(s4e8 + 0x38, reward_mint_box)
				memcpy(reward_mint_box, s290, 0x80)
				const n = ld64(c + 8)
				if (n == 0) {
					anchor_error_from(s328, 0xbbd /* anchor::AccountNotEnoughKeys */, undef, p, q)
					o = ld64(s328 + 8)
					const r = ld64(s328)
					if (r != 2) {
						ah = Error_with_account_name(s338, r, o, "reward_token_badge", 0x12)
						ag = ld64(s338)
						st64(a + 0x10, ld64(s338 + 8))
						st64(a + 8, ag)
						st64(a, 0)
						return ah
					}
				} else {
					st64(c + 8, n - 1)
					o = ld64(c)
					st64(c, o + 0x30)
				}
				st64(s4e8 + 0x30, o)
				try_accounts_11718(s290, c, o, p, q)
				const t = ld64(s290 + 8)
				const s = ld64(s290)
				if (s == 2) {
					st64(s4e8 + 0x28, t)
					try_accounts_120(s290, c, t)
					const v = ld64(s290 + 8)
					const u = ld64(s290)
					if (u == 2) {
						st64(s4e8 + 0x20, v)
						fn_122e8(s290, c, v)
						const x = ld64(s290 + 8)
						const w = ld64(s290)
						if (w == 2) {
							st64(s4e8 + 0x18, x)
							try_accounts_11990(s290, c, x)
							const aa = ld64(s290 + 0x10)
							const z = ld64(s290 + 8)
							const y = ld64(s290)
							if (y == 0) {
								ah = Error_with_account_name(s468, z, aa, 0x100152d60 /* "rent" */, 4)
								ag = ld64(s468)
								st64(a + 0x10, ld64(s468 + 8))
								st64(a + 8, ag)
								st64(a, 0)
								return ah
							}
							st64(s4e8, y, z, aa)
							const ai = ld64(s290 + 0x18)
							const ab = reward_authority.key
							copyr(s2b0, ab, 0x20)
							const ac = ld64(s4e8 + 0x40)
							copyr(s2d8, ac + 0x48, 0x20)
							if ((memcmp(s2b0, s2d8, 0x20) as u32) == 0) {
								st64(s4f0, ai)
								if (funder.is_writable == 0) {
									anchor_error_from(s448, 0x7d0 /* anchor::ConstraintMut */)
									ah = Error_with_account_name(s458, ld64(s448), ld64(s448 + 8), "funder", 6)
									ag = ld64(s458)
									st64(a + 0x10, ld64(s458 + 8))
									st64(a + 8, ag)
									st64(a, 0)
									return ah
								}
								const ak = ld64(s4e8 + 0x40)
								if (ld8(ld64(ak) + 0x29) != 0) {
									const al = ld64(ld64(ld64(s4e8 + 0x38) + 0x58))
									const ap = ld64(al)
									const ao = ld64(al + 8)
									const an = ld64(al + 0x10)
									const am = ld64(al + 0x18)
									st64(s2b0, ap, ao, an, am, 0x100154db3, 0xb, ak + 0x188, 0x20, s2b0, 0x20)
									// PDA find_program_address(["token_badge", *(ak + 0x188), *s2b0], program *(ld64(s4e8 + 0x58)))
									Pubkey_find_program_address(s2d8, s290, 3, ld64(s4e8 + 0x58))
									copyr(s2f8, s2d8, 0x20)
									st8(ld64(s4e8 + 0x50), ld8(s2d8 + 0x20))
									const aq = ld64(ld64(s4e8 + 0x30))
									copyr(s290, aq, 0x20)
									if ((memcmp(s290, s2f8, 0x20) as u32) != 0) {
										anchor_error_from(s3a8, 0x7d6 /* anchor::ConstraintSeeds */)
										const bb = Error_with_account_name(s3b8, ld64(s3a8), ld64(s3a8 + 8), "reward_token_badge", 0x12)
										const ba = ld64(s3b8 + 8)
										const az = ld64(s3b8)
										copyr(s290, aq, 0x20)
										copy(s270, s2f8, 0x20)
										ah = fn_13b5c0(s3c8, az, ba, s290, bb)
										ag = ld64(s3c8)
										st64(a + 0x10, ld64(s3c8 + 8))
										st64(a + 8, ag)
										st64(a, 0)
										return ah
									}
									if (ld8(ld64(s4e8 + 0x28) + 0x29) == 0) {
										anchor_error_from(s408, 0x7d0 /* anchor::ConstraintMut */)
										ah = Error_with_account_name(s418, ld64(s408), ld64(s408 + 8), "reward_vault", 0xc)
										ag = ld64(s418)
										st64(a + 0x10, ld64(s418 + 8))
										st64(a + 8, ag)
										st64(a, 0)
										return ah
									}
									const ar = ld64(ld64(s4e8 + 0x20))
									copyr(s2b0, ar, 0x20)
									AccountInfo_clone(s290, ld64(ld64(s4e8 + 0x38) + 0x58))
									const at = ld64(s290 + 0x18)
									copy(s2d8, at, 0x20)
									const av = ld64(s290 + 0x10)
									const au = ld64(s290 + 8)
									rc_dec(au)
									rc_dec(av)
									ah = memcmp(s2b0, s2d8, 0x20) as u32
									if (ah == 0) {
										st64(a + 0x58, ld64(s4f0))
										st64(a + 0x50, ld64(s4e8 + 0x10))
										st64(a + 0x48, ld64(s4e8 + 8))
										st64(a + 0x40, ld64(s4e8))
										st64(a + 0x38, ld64(s4e8 + 0x18))
										st64(a + 0x30, ld64(s4e8 + 0x20))
										st64(a + 0x28, ld64(s4e8 + 0x28))
										st64(a + 0x20, ld64(s4e8 + 0x30))
										st64(a + 0x18, ld64(s4e8 + 0x38))
										st64(a + 0x10, ld64(s4e8 + 0x40))
										st64(a + 8, ld64(s4e8 + 0x48))
										st64(a, reward_authority)
										return ah
									}
									anchor_error_from(s3d8, 0x7dc /* anchor::ConstraintAddress */)
									const ay = Error_with_account_name(s3e8, ld64(s3d8), ld64(s3d8 + 8), "reward_token_program", 0x14)
									const ax = ld64(s3e8 + 8)
									const aw = ld64(s3e8)
									copyr(s290, s2b0, 0x20)
									copy(s270, s2d8, 0x20)
									ah = fn_13b5c0(s3f8, aw, ax, s290, ay)
									ag = ld64(s3f8)
									st64(a + 0x10, ld64(s3f8 + 8))
									st64(a + 8, ag)
									st64(a, 0)
									return ah
								}
								anchor_error_from(s428, 0x7d0 /* anchor::ConstraintMut */)
								ah = Error_with_account_name(s438, ld64(s428), ld64(s428 + 8), 0x100152b28 /* "whirlpool" */, 9)
								ag = ld64(s438)
								st64(a + 0x10, ld64(s438 + 8))
								st64(a + 8, ag)
								st64(a, 0)
								return ah
							}
							anchor_error_from(s378, 0x7dc /* anchor::ConstraintAddress */)
							const af = Error_with_account_name(s388, ld64(s378), ld64(s378 + 8), "reward_authority", 0x10)
							const ae = ld64(s388 + 8)
							const ad = ld64(s388)
							copyr(s290, s2b0, 0x20)
							copy(s270, s2d8, 0x20)
							ah = fn_13b5c0(s398, ad, ae, s290, af)
							ag = ld64(s398)
							st64(a + 0x10, ld64(s398 + 8))
							st64(a + 8, ag)
							st64(a, 0)
							return ah
						}
						ah = Error_with_account_name(s368, w, x, "system_program", 0xe)
						ag = ld64(s368)
						st64(a + 0x10, ld64(s368 + 8))
						st64(a + 8, ag)
						st64(a, 0)
						return ah
					}
					ah = Error_with_account_name(s358, u, v, "reward_token_program", 0x14)
					ag = ld64(s358)
					st64(a + 0x10, ld64(s358 + 8))
					st64(a + 8, ag)
					st64(a, 0)
					return ah
				}
				ah = Error_with_account_name(s348, s, t, "reward_vault", 0xc)
				ag = ld64(s348)
				st64(a + 0x10, ld64(s348 + 8))
				st64(a + 8, ag)
				st64(a, 0)
				return ah
			}
			alloc_handle_alloc_error(8, 0x80)
		}
		alloc_handle_alloc_error(8, 0x290)
	}
	ah = Error_with_account_name(s318, g, i, "funder", 6)
	ag = ld64(s318)
	st64(a + 0x10, ld64(s318 + 8))
	st64(a + 8, ag)
	st64(a, 0)
	return ah
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value)
// types [heur]: b: InitializeRewardV2Context (the handler ix_initialize_reward_v2 passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_3cd20(a: u64, b: InitializeRewardV2Context, c: u64): u64 {
	const s10 = fp - 0x10, s30 = fp - 0x30, s38 = fp - 0x38, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let w: u64
	const accounts: InitializeRewardV2Accounts = b.accounts
	const reward_mint: Mint = accounts.reward_mint
	const g = ld64(accounts + 0x10)
	copyr(s30, g + 0x188, 0x20)
	const i = reward_mint.info.key
	copyr(s60, i, 0x20)
	let x = fn_81d00(s10, s30, s60, accounts + 0x20)
	let j = ld64(s10)
	if (j != 2) {
		w = ld64(s10 + 8)
		st64(a, j, w)
		return x
	}
	x = fn_80ca8(s60, reward_mint, ld8(s10 + 8))
	j = ld64(s60)
	if (j == 2) {
		if (ld8(s60 + 8) == 0) {
			x = fn_87630(s70, 0x2f)
			w = ld64(s70 + 8)
			j = ld64(s70)
			if (j != 2) {
				st64(a, j, w)
				return x
			}
		}
		const k: AccountInfo = accounts.reward_mint.info
		const l: LamportsCell = k.lamports
		const o = ld64(accounts + 0x10)
		const n = k.key
		rc_inc(l)
		const m: DataCell = k.data
		rc_inc(m)
		const s = k.owner
		const r = k.rent_epoch
		const q = k.is_signer
		const p = k.is_writable
		st8(s38 + 2, k.executable)
		st8(s38, q, p)
		st64(s60, n, l, m, s, r)
		st64(sff8, ld64(accounts + 0x30))
		st64(sff0, accounts + 0x38)
		st64(s1000, accounts + 8)
		x = fn_78f88(s80, o, accounts + 0x28, s60, accounts + 8, ld64(sff8), accounts + 0x38)
		w = ld64(s80 + 8)
		j = ld64(s80)
		rc_dec(l)
		rc_dec(m)
		if (j != 2) {
			st64(a, j, w)
			return x
		}
		const v = ld64(accounts + 0x10)
		const t = accounts.reward_mint.info.key
		copyr(s30, t, 0x20)
		const u = accounts.reward_vault.key
		copyr(s60, u, 0x20)
		x = fn_5e558(s90, v + 8, c as u8, s30, s60)
		w = ld64(s90 + 8)
		st64(a, ld64(s90))
		st64(a + 8, w)
		return x
	}
	w = ld64(s60 + 8)
	st64(a, j, w)
	return x
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

function fn_81d00(a: u64, b: u64, c: u64, d: u64): u64 {
	const s10 = fp - 0x10, s40 = fp - 0x40, s58 = fp - 0x58, s88 = fp - 0x88, sab = fp - 0xab, sb5 = fp - 0xb5, scb = fp - 0xcb, scc = fp - 0xcc, sd8 = fp - 0xd8, se0 = fp - 0xe0, se8 = fp - 0xe8
	const f = ld64(d)
	let g = memcmp(ld64(f + 0x18), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20) as u32
	if (g != 0) {
		st64(a, 2)
		st8(a + 8, 0)
		return g
	}
	const h = ld64(f + 0x10)
	const i = ld64(h + 0x10)
	if (0x7fffffffffffffff > i) {
		st64(h + 0x10, i + 1)
		const j = ld64(h + 0x18)
		st64(s10 + 8, ld64(h + 0x20))
		st64(s10, j)
		g = fn_105168(s58, s10)
		if (ld8(s58) == 0) {
			st64(se8, c)
			st32(scb + 2, ld32(s58 + 4))
			st32(scc, ld32(s58 + 1))
			st64(sd8, ld64(s58 + 8))
			st64(se0, ld64(s58 + 0x10))
			memcpy(s88, s40, 0x2a)
			memcpy(sb5, s88, 0x2a)
			st64(scb + 0xe, ld64(se0))
			st64(scb + 6, ld64(sd8))
			st64(h + 0x10, ld64(h + 0x10) - 1)
			g = memcmp(scb, b, 0x20) as u32
			if (g == 0) {
				g = memcmp(sab, ld64(se8), 0x20) as u32
				st8(a + 8, g == 0)
				st64(a, 2)
				return g
			}
			st8(a + 8, 0)
			st64(a, 2)
			return g
		}
		const k = ld64(s58 + 8)
		st64(a + 8, ld64(s58 + 0x10))
		st64(a, k)
		st64(h + 0x10, ld64(h + 0x10) - 1)
		return g
	}
	fn_1486f0(0x10015a280, 0x7fffffffffffffff)
}

function fn_80ca8(a: u64, b: u64, c: u64): u64 {
	const s60 = fp - 0x60, s68 = fp - 0x68, s88 = fp - 0x88, s90 = fp - 0x90, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s130 = fp - 0x130, s140 = fp - 0x140, s148 = fp - 0x148, s150 = fp - 0x150, s158 = fp - 0x158, s160 = fp - 0x160
	let n, t, ab, ac, bb, bm: u64
	st64(s128, c, a)
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
		n = memcmp(m, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32
		if (n == 0) {
			const r = ld64(s128 + 8)
			st64(r, 2)
			st8(r + 8, 1)
		} else {
			const o = f.key
			copyr(s68, o, 0x20)
			n = rent_check_id_133890(s68)
			if (n == 0) {
				const p = ld32(b + 0x34)
				if (p == 0 || ld64(s128) != 0) {
					const w = AccountInfo_try_borrow_data(s68, sb8, n)
					let ad = ld64(s60 + 8)
					const v = ld64(s60)
					const u = ld64(s68)
					if (u == 0x800000000000001a /* Ok */) {
						B15: {
							fn_afd0(s68, ld64(v), ld64(v + 8), undef, undef, w)
							let ak = undef
							if (ld32(s68) != 2) {
								st64(s150, p)
								let av = 2
								n = 0
								let ah = ld64(s60 + 0x50)
								let ag = ld64(s60 + 0x58)
								st64(s88, 0, 2, 0)
								let at = 0
								st64(s140, ah, ag)
								if (ag != 0) {
									st64(s148, ad)
									let ap = 2
									ak = 1
									let aj = 0
									let ar = 0
									let ai = 0
									while (true) {
										B32: {
											n = ak
											const al = ai
											if (ag >= ai + 2) {
												if (0xfffffffffffffffe > ai) {
													const am = ld16(ah + ai)
													ak = am - 1
													if (0x1b > ak) {
														const an = ai + 4
														if (an > ag) {
															st64(s68, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
															fn_13b430(se8, s68)
															ak = undef
															n = ld64(se8 + 8)
															av = ld64(se8)
														} else {
															const ao = n
															if (n - 1 == ld64(s88)) {
																st64(s130, n)
																fn_ec20(s88, ao - 1, n)
																n = ld64(s130)
																ah = ld64(s140)
																ag = ld64(s140 + 8)
																ap = ld64(s88 + 8)
															}
															st16(ap + aj, am)
															st64(s88 + 0x10, n)
															if (al + 2 > an) {
																fn_14c690(al + 2, an, 0x10015a310, ag, ah)
															}
															const aq = ld16(ah + (al + 2))
															ai = an > an + aq ? 0xffffffffffffffff : an + aq
															if (ag >= ai) {
																aj = aj + 2
																ak = n + 1
																ar = n
																if (ag > ai) {
																	continue
																}
																av = ld64(s88 + 8)
																at = ld64(s88)
																ad = ld64(s148)
																break
															}
															st64(s68, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
															fn_13b430(sd8, s68)
															ak = undef
															n = ld64(sd8 + 8)
															av = ld64(sd8)
														}
													} else {
														if (am == 0) {
															break B32
														}
														st64(s68, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
														fn_13b430(sf8, s68)
														ak = undef
														n = ld64(sf8 + 8)
														av = ld64(sf8)
													}
													ad = ld64(s148)
													at = 0x8000000000000000
													ag = ld64(s140 + 8)
													break
												}
												fn_14c690(ai, al + 2, 0x10015a2f8, ag, ah)
											}
										}
										av = ld64(s88 + 8)
										at = ld64(s88)
										n = ar
										ad = ld64(s148)
										break
									}
								}
								if (at == 0x8000000000000000) {
									const au = ld64(s128 + 8)
									st64(au + 8, n)
									st64(au, av)
									st64(ad, ld64(ad) - 1)
									break B9
								}
								B83: {
									if (n != 0) {
										B90: {
											if (ld64(s128) != 0) {
												B95: {
													B94: {
														if (ag != 0) {
															n = n << 1
															let ax = av + n
															while (true) {
																const ay = ld16(av)
																if (ay > 0x1a) {
																	break B90
																}
																if (((1 << (ay & 0x3f)) & 0x60d541a) == 0) {
																	if (ay != 6) {
																		break B90
																	}
																	st64(s158, ax)
																	let az = 0
																	while (true) {
																		const bh = fn_12e0b0(s88, az)
																		ag = undef
																		const bd = ld64(s140 + 8)
																		st64(s128, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
																		bb = 0x14
																		st64(s130, 0x14)
																		const bc = ld64(s88 + 0x10)
																		ak = 0
																		if (bc > bd) {
																			break B94
																		}
																		const be = ld64(s88 + 8)
																		const bf = ld64(s88)
																		if (bf > be) {
																			fn_14c690(bf, be, 0x100159390, ag)
																		}
																		const bg = ld64(s140)
																		if (be > bd) {
																			fn_14c5c0(be, ld64(s140 + 8), 0x100159390, ag)
																		}
																		n = fn_12e558(s68, bg + bf, be - bf, bh)
																		ag = undef
																		const bj = ld16(s60)
																		const bi = ld64(s68)
																		if (bi != 0x800000000000001a /* Ok */) {
																			ag = ld64(s60 + 8)
																			bb = ld32(s60 + 4)
																			ak = ld16(s60 + 2)
																			st64(s130, bj, bi)
																			break B94
																		}
																		if (0x1b >= bj) {
																			const ba = ld64(s140 + 8)
																			if (((1 << (bj & 0x3f)) & 0x7fd561a) != 0) {
																				if (be > bc) {
																					fn_14c690(be, bc, 0x1001593a8, ag, ba)
																				}
																				if (bc - be != 2) {
																					st64(s128, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
																					const bs = ld64(s148)
																					bb = bs >> 0x20
																					ak = bs >> 0x10
																					st64(s130, bs)
																					break B94
																				}
																				const bk = ld64(s140)
																				st64(s148, bk + be)
																				bb = bc + ld16(bk + be)
																				ak = 0
																				ag = bc > bb
																				az = ag != 0 ? 0xffffffffffffffff : bb
																				if (ba > az) {
																					continue
																				}
																				break B94
																			}
																			bb = (1 << (bj & 0x3f)) & 0x802a9a4
																			if (bb != 0) {
																				ak = 0
																				st64(s128, 0x8000000000000000)
																				break B94
																			}
																			if (bj == 6) {
																				const bl = ad
																				if (be > bc) {
																					fn_14c690(be, bc, 0x100159378, ag, bl)
																				}
																				bm = ld64(s140) + be
																				st64(s128, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
																				ad = bl
																				if (bc - be != 2) {
																					break B95
																				}
																				const bn = ld16(bm)
																				const bo = bc > bc + bn ? 0xffffffffffffffff : bc + bn
																				bm = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
																				st64(s128, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
																				ad = bl
																				if (bo > ld64(s140 + 8)) {
																					break B95
																				}
																				st64(s128, 0x8000000000000001 /* Err(ProgramError::InvalidArgument) */)
																				bm = ld64(s160)
																				if (bo - bc != 1) {
																					break B95
																				}
																				st64(s160, ld64(s140) + bc)
																				ax = ld64(s158)
																				if (ld64(s150) != 0) {
																					break
																				}
																				if (ld8(ld64(s160)) != 1) {
																					break B90
																				}
																				break
																			}
																		}
																		bb = 0x30
																		st64(s130, 0x30)
																		ak = 0
																		st64(s128, 0x8000000000000000)
																		break B94
																	}
																}
																av = av + 2
																if (av == ax) {
																	break B83
																}
															}
														}
														n = n << 1
														while (true) {
															const bp = ld16(av)
															if (bp > 0x1a) {
																break B90
															}
															if (((1 << (bp & 0x3f)) & 0x60d541a) == 0) {
																if (bp == 6) {
																	bb = 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */
																	st64(s128, 0x8000000000000003 /* Err(ProgramError::InvalidAccountData) */)
																	break
																}
																break B90
															}
															av = av + 2
															n = n - 2
															if (n == 0) {
																break B83
															}
														}
													}
													bm = (bb << 0x20) | (((ak as u16) << 0x10) | (ld64(s130) as u16))
												}
												st64(s60, bm, ag)
												st64(s68, ld64(s128))
												n = fn_13b430(s108, s68)
												ac = ld64(s108)
												ab = ld64(s108 + 8)
												break B15
											}
											n = n << 1
											while (true) {
												B49: {
													const aw = ld16(av)
													if ((aw as i64) > 9) {
														if (0x1a >= aw) {
															if (((1 << (aw & 0x3f)) & 0x20d0000) != 0) {
																break B49
															}
															if (aw == 0xe) {
																break
															}
															if (aw == 0x1a) {
																break
															}
														}
														if (aw != 0xa) {
															break
														}
													} else if ((aw as i64) > 3) {
														if (aw != 4) {
															break
														}
													} else if (aw != 1) {
														break
													}
												}
												av = av + 2
												n = n - 2
												if (n == 0) {
													break B83
												}
											}
										}
										const bt = ld64(s128 + 8)
										st64(bt, 2)
										st8(bt + 8, 0)
										st64(ad, ld64(ad) - 1)
										break B9
									}
								}
								const bq = ld64(s128 + 8)
								st64(bq, 2)
								st8(bq + 8, 1)
								st64(ad, ld64(ad) - 1)
								t = ld64(sb8 + 0x10)
								const br: LamportsCell = ld64(sb8 + 8)
								rc_dec(br)
								if (!rc_release(t)) {
									return n
								}
								st64(t + 8, ld64(t + 8) - 1)
								return n
							}
							const x = ld64(s60 + 0x10)
							st64(s88 + 0x14, x)
							const y = ld64(s60 + 8)
							st64(s88 + 0xc, y)
							const z = ld64(s60)
							st64(s88 + 4, z)
							st64(s68, z, y, x)
							n = fn_13b430(s118, s68)
							ac = ld64(s118)
							ab = ld64(s118 + 8)
						}
						const aa = ld64(s128 + 8)
						st64(aa + 8, ab)
						st64(aa, ac)
						st64(ad, ld64(ad) - 1)
						break B9
					}
					st64(s68, u, v, ad)
					n = fn_13b430(sc8, s68)
					const af = ld64(sc8)
					const ae = ld64(s128 + 8)
					st64(ae + 8, ld64(sc8 + 8))
					st64(ae, af)
					break B9
				}
			}
			const q = ld64(s128 + 8)
			st64(q, 2)
			st8(q + 8, 0)
		}
	}
	t = ld64(sb8 + 0x10)
	const s: LamportsCell = ld64(sb8 + 8)
	rc_dec(s)
	if (!rc_release(t)) {
		return n
	}
	st64(t + 8, ld64(t + 8) - 1)
	return n
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

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: TokenBadge
function fn_105168(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s58 = fp - 0x58, s70 = fp - 0x70, sf0 = fp - 0xf0, s110 = fp - 0x110, s120 = fp - 0x120, s130 = fp - 0x130, s140 = fp - 0x140
	let f, g: u64
	if (8 > ld64(b + 8)) {
		g = anchor_error_from(s140, 0xbb9 /* anchor::AccountDiscriminatorNotFound */, c, d, e)
		f = ld64(s140)
		st64(a + 0x10, ld64(s140 + 8))
		st64(a + 8, f)
		st8(a, 1)
		return g
	}
	if (ld64(ld64(b)) == 0x96ff74f9e5ccdb74 /* account:TokenBadge */) {
		return fn_105440(a, b, 0x96ff74f9e5ccdb74 /* account:TokenBadge */, d, e)
	}
	ErrorCode_name(s70, 0x100152d5c, 0x96ff74f9e5ccdb74 /* account:TokenBadge */, d, e)
	st64(s58, 0, 1, 0)
	st64(s20, s58, 0x100159480)
	st8(s20 + 0x18, 3)
	st64(s20 + 0x10, 0x20)
	st64(s40 + 0x10, 0)
	st64(s40, 0)
	if (ErrorCode_fmt(0x100152d5c, s40) == 0) {
		copy(sf0, s70, 0x30)
		st64(s110 + 8, 0x1001553f7)
		st32(sf0 + 0x78, 0xbba /* anchor::AccountDiscriminatorMismatch */)
		st8(sf0 + 0x30, 2)
		st32(s110 + 0x18, 3)
		st64(s110 + 0x10, 0x2b)
		st64(s110, 0)
		fn_13b3a8(s120, s110)
		g = Error_with_account_name(s130, ld64(s120), ld64(s120 + 8), "TokenBadge", 0xa)
		f = ld64(s130)
		st64(a + 0x10, ld64(s130 + 8))
		st64(a + 8, f)
		st8(a, 1)
		return g
	}
	fn_149678("a Display implementation returned an error unexpectedly", 0x37, s110, 0x1001594b0, 0x1001594d0)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (value), e (value)
function fn_14c690(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c698(a, b, c, d, e)
}

function fn_ec20(a: u64, b: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s30 = fp - 0x30
	let f = ld64(a)
	let g = f + 1
	let h = g == 0
	if (h != 0) {
		raw_vec_handle_error(0, b, g, f, h)
	}
	const i = f
	let j = max(f << 1, g)
	let n = 0
	const k = 0x4000000000000000 > j
	j = max(j, 4)
	const l = j
	if (f != 0) {
		const m = ld64(a + 8)
		st64(s18 + 0x10, i << 1)
		st64(s18, m)
		n = 2
	}
	st64(s18 + 8, n)
	const p = fn_e478(s30, k << 1, l << 1, s18, r0)
	g = undef
	f = undef
	h = undef
	if (ld64(s30) == 0) {
		const o = ld64(s30 + 8)
		st64(a, j, o)
		return p
	}
	raw_vec_handle_error(ld64(s30 + 8), ld64(s30 + 0x10), g, f, h)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (value), e (value)
function fn_14c5c0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c5c8(a, b, c, d, e)
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

function fn_105440(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s40 = fp - 0x40, s58 = fp - 0x58, s59 = fp - 0x59, s70 = fp - 0x70
	let i, k, l, m, q: u64
	const f = ld64(b + 8)
	if (f > 7) {
		B5: {
			if (f - 8 >= 0x20) {
				const g = ld64(b)
				const h = ld64(g + 0xe)
				st8(s40 + 8, ld8(g + 0x16))
				st64(s40, h)
				if (f - 0x28 >= 0x20) {
					const t = ld64(s40 + 1)
					const r = ld64(g + 0x2e)
					st8(s40 + 8, ld8(g + 0x36))
					st64(s40, r)
					if (f != 0x48) {
						const u = ld64(s40 + 1)
						const s = ld8(g + 0x48)
						st8(s59, s)
						if (2 > s) {
							st16(a + 6, ld16(g + 0xc))
							st32(a + 2, ld32(g + 8))
							st8(a + 0x21, ld8(g + 0x27))
							st64(a + 0x19, ld64(g + 0x1f))
							st64(a + 0x11, ld64(g + 0x17))
							st32(a + 0x22, ld32(g + 0x28))
							st16(a + 0x26, ld16(g + 0x2c))
							st64(a + 0x31, ld64(g + 0x37))
							q = ld64(g + 0x3f)
							st64(a + 0x39, q)
							st8(a + 0x41, ld8(g + 0x47))
							st64(s58 + 1, t)
							st8(s58, h)
							st8(a + 0x10, ld8(s58 + 8))
							st64(a + 8, ld64(s58))
							st64(a + 0x29, u)
							st8(a + 0x28, r)
							st8(a + 1, s)
							st8(a, 0)
							return q
						}
						st64(s40, 0x100159620)
						st64(s40 + 0x10, s10)
						st64(s10, s59, fn_14ef78)
						st64(s40 + 0x20, 0)
						st64(s40 + 8, 1)
						st64(s40 + 0x18, 1)
						// fmt "Invalid bool representation: {}" {} = s [fn_14ef78]
						fn_147e78(s58, s40, g, r, t)
						i = fn_b580(s58)
						break B5
					}
				}
			}
			i = fn_1459d0(0x100159468)
		}
		const j = i
		st64(s58, i)
		q = anchor_error_from(s70, 0xbbb /* anchor::AccountDidNotDeserialize */, k, l, m)
		const o = ld64(s70 + 8)
		const p = ld64(s70)
		if (2 > (i & 3) - 2) {
			st64(a + 0x10, o)
			st64(a + 8, p)
			st8(a, 1)
			return q
		}
		if ((j & 3) == 0) {
			st64(a + 0x10, o)
			st64(a + 8, p)
			st8(a, 1)
			return q
		}
		const n = ld64(ld64(j + 7))
		q = callx(n, ld64(j - 1), n)
		st64(a + 0x10, o)
		st64(a + 8, p)
		st8(a, 1)
		return q
	}
	fn_14c4f0(8, f, 0x10015a8a0, d, e)
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
function memset(a: u64, b: u64, c: u64) {
	sol_memset(a, b as u8, c)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_14c4f0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c4f8(a, b, c, d, e)
}

function fn_14ef78(a: u64, b: u64): u64 {
	return fn_14ecd0(ld8(a), 1, b)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_147238(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	fn_1478b8(a, b, c, d, e)
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
