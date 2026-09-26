// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction initialize_token_badge: handler + 19 reachable functions
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
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function try_accounts_610(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function fn_b580(a: u64): u64 // lib uses alloc_handle_alloc_error, Error__new
declare function AccountInfo_clone(a: u64, b: u64): void // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11de0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_120c0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_122e8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b3a8(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error, memcpy
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function fn_13c8b8(a: u64, b: u64, c: u64): u64 // lib uses memcpy, __rust_alloc, alloc_handle_alloc_error, ptr_drop_in_place_139960
declare function fn_13cc48(a: u64, b: u64, c: u64): u64 // lib uses memcpy, __rust_alloc, alloc_handle_alloc_error, ptr_drop_in_place_139960
declare function fn_13cfd8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcpy, __rust_alloc, alloc_handle_alloc_error, ptr_drop_in_place_1397a0, …
declare function fn_13d318(a: u64, b: u64, c: u64): u64 // lib uses memcpy, __rust_alloc, alloc_handle_alloc_error, ptr_drop_in_place_1397a0, …
declare function ErrorCode_name(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib anchor_lang::error::ErrorCode::name
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function ErrorCode_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::error::ErrorCode as core::fmt::Display>::fmt
declare function rent_get(a: u64): u64 // lib solana_sysvar::rent::<impl solana_sysvar::Sysvar for solana_rent::Rent>::get
declare function AccountInfo_try_data_len(a: u64, b: u64): void // lib solana_account_info::AccountInfo::try_data_len
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
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

// instruction handler: initialize_token_badge (discriminator sha256("global:initialize_token_badge")[..8] = 0xdf59e01b5fcd4dfd)
// accounts [str: the program's account-error strings, in order of first use]: whirlpools_config, whirlpools_config_extension, token_mint, funder, token_badge, token_badge_authority, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_badge
function ix_initialize_token_badge(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const se0 = fp - 0xe0, sf8 = fp - 0xf8, s147 = fp - 0x147, s167 = fp - 0x167, s170 = fp - 0x170, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s201 = fp - 0x201, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, sff8 = fp - 0xff8
	let k: u64
	sol_log("Instruction: InitializeTokenBadge", 0x21)
	st8(s201, 0xff)
	st64(s200, accounts, accounts_len)
	st64(sff8, s201)
	let r = accounts_initialize_token_badge(sf8, program_id, s200, undef, fp)
	const f = ld32(sf8)
	if (f == 2) {
		k = ld64(sf8 + 8)
		st64(a + 8, ld64(sf8 + 0x10))
		st64(a, k)
		return r
	}
	const i = ld32(sf8 + 4)
	const h = ld64(sf8 + 8)
	const g = ld64(sf8 + 0x10)
	memcpy(s1d8, se0, 0xe0)
	st64(s1e8, h, g)
	st32(s1f0, f, i)
	const j = ld64(s147 + 0x27)
	if ((ld16(j + 0x6a) & 1) == 0) {
		r = fn_87630(s218, 0x42)
		k = ld64(s218)
		if (k != 2) {
			st64(a + 8, ld64(s218 + 8))
			st64(a, k)
			return r
		}
	}
	const m = ld64(ld64(j))
	const l = ld64(ld64(s1d8 + 0x40))
	copy(sf8, l, 0x20)
	const p = ld64(m)
	const o = ld64(m + 8)
	const n = ld64(m + 0x10)
	st64(s167 + 0x18, ld64(m + 0x18))
	st64(s167, p, o, n)
	copy(s147, sf8, 0x20)
	st8(s170 + 8, 0)
	r = fn_7be0(s228, s170, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, program_id)
	const q = ld64(s228)
	if (q != 2) {
		r = Error_with_account_name(s238, q, ld64(s228 + 8), "token_badge", 0xb)
		k = ld64(s238)
		st64(a + 8, ld64(s238 + 8))
		st64(a, k)
		return r
	}
	st64(a + 8, q)
	st64(a, 2)
	return r
}

// Anchor Accounts::try_accounts of instruction initialize_token_badge (called by ix_initialize_token_badge; name [str]: from the handler's "Instruction: …" log; was fn_ed8c0)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpools_config, whirlpools_config_extension (ConstraintHasOne), token_mint, funder (ConstraintMut), token_badge (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), token_badge_authority (ConstraintAddress), system_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: token_badge, funder
function accounts_initialize_token_badge(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s58 = fp - 0x58, s98 = fp - 0x98, sb8 = fp - 0xb8, sb9 = fp - 0xb9, se0 = fp - 0xe0, sf8 = fp - 0xf8, s110 = fp - 0x110, s118 = fp - 0x118, s120 = fp - 0x120, s128 = fp - 0x128, s188 = fp - 0x188, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, s210 = fp - 0x210, s220 = fp - 0x220, s228 = fp - 0x228, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2a0 = fp - 0x2a0, s2b0 = fp - 0x2b0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c8 = fp - 0x3c8, s3d0 = fp - 0x3d0, s3d8 = fp - 0x3d8, s3e0 = fp - 0x3e0, s3e8 = fp - 0x3e8, s3f0 = fp - 0x3f0, s3f8 = fp - 0x3f8
	let m, n, w, x, z: u64
	st64(s230, b)
	try_accounts_11de0(s1a8, c, c, d, e)
	if (ld64(s1a8) == 0) {
		n = Error_with_account_name(s3b0, ld64(s1a0), ld64(s1a0 + 8), "whirlpools_config", 0x11)
		m = ld64(s3b0)
		st64(a + 0x10, ld64(s3b0 + 8))
		st64(a + 8, m)
		st32(a, 2)
		return n
	}
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x70) & -8 : 0x300007f90
	if (g > 0x300000007) {
		st64(s3c8 + 0x10, ld64(e - 0xff8))
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, s1a8, 0x70)
		try_accounts_120c0(s1a8, c)
		if (ld64(s1a8) == 0) {
			n = Error_with_account_name(s3a0, ld64(s1a0), ld64(s1a0 + 8), "whirlpools_config_extension", 0x1b)
			m = ld64(s3a0)
			st64(a + 0x10, ld64(s3a0 + 8))
			st64(a + 8, m)
			st32(a, 2)
			return n
		}
		const h = ld64(0x300000000 /* heap bump-allocator cursor */)
		const i = h != 0 ? sat_sub(h, 0x68) & -8 : 0x300007f98
		if (i > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, i)
			memcpy(i, s1a8, 0x68)
			try_accounts_11718(s1a8, c)
			const k = ld64(s1a0)
			const j = ld64(s1a8)
			if (j == 2) {
				st64(s3c8, k, i)
				try_accounts_610(s1a8, c, k)
				const l = ld32(s1a8)
				if (l == 2) {
					n = Error_with_account_name(s390, ld64(s1a0), ld64(s1a0 + 8), 0x100154f57 /* "token_mint" */, 0xa)
					m = ld64(s390)
					st64(a + 0x10, ld64(s390 + 8))
					st64(a + 8, m)
					st32(a, 2)
					return n
				}
				st64(s3e0, g)
				st64(s3d0, a)
				st64(s3d8, ld32(s1a8 + 4))
				const p = ld64(s1a0)
				const o = ld64(s1a0 + 8)
				memcpy(s210, s190, 0x68)
				st64(s220, p, o)
				st32(s228 + 4, ld64(s3d8))
				st32(s228, l)
				const q = ld64(c + 8)
				if (q == 0) {
					n = anchor_error_from(s380, 0xbbd /* anchor::AccountNotEnoughKeys */)
					x = ld64(s380)
					w = ld64(s3d0)
					st64(w + 0x10, ld64(s380 + 8))
					st64(w + 8, x)
					st32(w, 2)
					return n
				}
				const r: AccountInfo = ld64(c)
				st64(s128, r)
				st64(c + 8, q - 1)
				st64(c, r + 0x30)
				try_accounts_11718(s1a8, c)
				const t = ld64(s1a0)
				const s = ld64(s1a8)
				const y = ld64(s3d0)
				if (s != 2) {
					n = Error_with_account_name(s250, s, t, "funder", 6)
					z = ld64(s250)
					st64(y + 0x10, ld64(s250 + 8))
					st64(y + 8, z)
					st32(y, 2)
					return n
				}
				st64(s120, t)
				fn_122e8(s1a8, c, t)
				const v = ld64(s1a0)
				const u = ld64(s1a8)
				if (u == 2) {
					st64(s118, v)
					rent_get(s1a8)
					copy(sf8, s1a0, 0x18)
					if (ld64(s1a8) == 0) {
						copyr(s110, sf8, 0x18)
						const aa = ld64(s3e0)
						const ab = ld64(ld64(aa))
						copyr(sb8, ab, 0x20)
						const ac = ld64(ld64(s210 + 0x40))
						const ag = ld64(ac + 0x18)
						const af = ld64(ac + 0x10)
						const ae = ld64(ac + 8)
						const ad = ld64(ac)
						st64(s188, s20)
						st64(s1a0 + 8, sb8)
						st64(s1a8, 0x100154db3)
						st64(s20, ad, ae, af, ag)
						st64(s188 + 8, 0x20)
						st64(s190, 0x20)
						st64(s1a0, 0xb)
						// PDA find_program_address(["token_badge", *ab, *s20], program *(ld64(s230)))
						Pubkey_find_program_address(s98, s1a8, 3, ld64(s230))
						copyr(se0, s98, 0x20)
						const ah = ld8(s98 + 0x20)
						st8(sb9, ah)
						st8(ld64(s3c8 + 0x10), ah)
						const ai = ld64(ld64(s128))
						copy(s1a8, ai, 0x20)
						if ((memcmp(s1a8, se0, 0x20) as u32) == 0) {
							st64(s98, s128, s110, s120, s118, aa, s228, sb9, s230)
							n = fn_eeff0(s1a8, s98)
							const aq = ld8(s1a0)
							if (aq == 2) {
								z = ld64(s1a0 + 8)
								st64(y + 0x10, ld64(s190))
								st64(y + 8, z)
								st32(y, 2)
								return n
							}
							st32(s58 + 0x30, ld32(s1a0 + 1))
							st32(s58 + 0x33, ld32(s1a0 + 4))
							const at = ld64(s1a0 + 8)
							st64(s3c8 + 0x10, ld64(s190))
							const token_badge: AccountInfo = ld64(s1a8)
							memcpy(s58, s188, 0x30)
							if (token_badge.is_writable == 0) {
								anchor_error_from(s360, 0x7d0 /* anchor::ConstraintMut */)
								n = Error_with_account_name(s370, ld64(s360), ld64(s360 + 8), "token_badge", 0xb)
								z = ld64(s370)
								st64(y + 0x10, ld64(s370 + 8))
								st64(y + 8, z)
								st32(y, 2)
								return n
							}
							st64(s3e8, at)
							AccountInfo_clone(s98, token_badge)
							st64(s3d8, fn_143100(s98))
							AccountInfo_clone(s1a8, token_badge)
							AccountInfo_try_data_len(s20, s1a8)
							const av = ld64(s20 + 8)
							const au = ld64(s20)
							if (au != 0x800000000000001a /* Ok */) {
								st64(s20 + 0x10, ld64(s20 + 0x10))
								st64(s20, au, av)
								n = fn_13b430(s2b0, s20)
								const bi = ld64(s2b0)
								st64(y + 0x10, ld64(s2b0 + 8))
								st64(y + 8, bi)
								st32(y, 2)
								const bk = ld64(s1a0 + 8)
								const bj = ld64(s1a0)
								rc_dec(bj)
								rc_dec(bk)
								const bm = ld64(s98 + 0x10)
								const bl = ld64(s98 + 8)
								rc_dec(bl)
								if (!rc_release(bm)) {
									return n
								}
								st64(bm + 8, ld64(bm + 8) - 1)
								return n
							}
							st64(s3f8, token_badge)
							const aw = __floatundidf(ld64(s110) * (av + 0x80))
							const ax = fn_14f7f8(ld64(s110 + 8), aw)
							st64(s3f0, fn_151cb0(ax, 0))
							const ay = fn_14f3e8(ax)
							const ba = 0 > (ld64(s3f0) as i64) ? 0 : ay
							const az = fn_151a40(ax, 0x43efffffffffffff)
							const bn = ld64(s3c8 + 8)
							const bh = (az as i64) > 0 ? 0xffffffffffffffff : ba
							const bc = ld64(s1a0 + 8)
							const bb = ld64(s1a0)
							rc_dec(bb)
							rc_dec(bc)
							const bf = ld64(s98 + 0x10)
							const bd = ld64(s98 + 8)
							let be = ld64(bd) - 1
							st64(bd, be)
							if (be == 0) {
								be = ld64(bd + 8) - 1
								st64(bd + 8, be)
							}
							let bg = ld64(bf) - 1
							st64(bf, bg)
							if (bg == 0) {
								bg = ld64(bf + 8) - 1
								st64(bf + 8, bg)
							}
							if (bh > ld64(s3d8)) {
								anchor_error_from(s340, 0x7d5 /* anchor::ConstraintRentExempt */, bg, be)
								n = Error_with_account_name(s350, ld64(s340), ld64(s340 + 8), "token_badge", 0xb)
								z = ld64(s350)
								st64(y + 0x10, ld64(s350 + 8))
								st64(y + 8, z)
								st32(y, 2)
								return n
							}
							copyr(s20, bn + 8, 0x20)
							const bo = ld64(ld64(ld64(s3e0)))
							copyr(s98, bo, 0x20)
							if ((memcmp(s20, s98, 0x20) as u32) != 0) {
								anchor_error_from(s2c0, 0x7d1 /* anchor::ConstraintHasOne */)
								const bv = Error_with_account_name(s2d0, ld64(s2c0), ld64(s2c0 + 8), "whirlpools_config_extension", 0x1b)
								const bu = ld64(s2d0 + 8)
								const bt = ld64(s2d0)
								copyr(s1a8, s20, 0x20)
								copy(s188, s98, 0x20)
								n = fn_13b5c0(s2e0, bt, bu, s1a8, bv)
								z = ld64(s2e0)
								st64(y + 0x10, ld64(s2e0 + 8))
								st64(y + 8, z)
								st32(y, 2)
								return n
							}
							const bp = ld64(ld64(s3c8))
							copyr(s20, bp, 0x20)
							copyr(s98, bn + 0x48, 0x20)
							if ((memcmp(s20, s98, 0x20) as u32) == 0) {
								const funder: AccountInfo = ld64(s120)
								if (funder.is_writable == 0) {
									anchor_error_from(s320, 0x7d0 /* anchor::ConstraintMut */)
									n = Error_with_account_name(s330, ld64(s320), ld64(s320 + 8), "funder", 6)
									x = ld64(s330)
									w = ld64(s3d0)
									st64(w + 0x10, ld64(s330 + 8))
									st64(w + 8, x)
									st32(w, 2)
									return n
								}
								const bx = ld64(s3d0)
								memcpy(bx, s228, 0x80)
								const by = ld64(s118)
								st32(bx + 0x89, ld32(s58 + 0x30))
								st32(bx + 0x8c, ld32(s58 + 0x33))
								n = memcpy(bx + 0xa0, s58, 0x30)
								st64(bx + 0xf0, by)
								st64(bx + 0xe8, funder)
								st64(bx + 0xe0, ld64(s3c8))
								st64(bx + 0xd8, ld64(s3c8 + 8))
								st64(bx + 0xd0, ld64(s3e0))
								st64(bx + 0x98, ld64(s3c8 + 0x10))
								st64(bx + 0x90, ld64(s3e8))
								st8(bx + 0x88, aq)
								st64(bx + 0x80, ld64(s3f8))
								return n
							}
							anchor_error_from(s2f0, 0x7dc /* anchor::ConstraintAddress */)
							const bs = Error_with_account_name(s300, ld64(s2f0), ld64(s2f0 + 8), "token_badge_authority", 0x15)
							const br = ld64(s300 + 8)
							const bq = ld64(s300)
							copyr(s1a8, s20, 0x20)
							copy(s188, s98, 0x20)
							n = fn_13b5c0(s310, bq, br, s1a8, bs)
							x = ld64(s310)
							w = ld64(s3d0)
							st64(w + 0x10, ld64(s310 + 8))
							st64(w + 8, x)
							st32(w, 2)
							return n
						}
						anchor_error_from(s280, 0x7d6 /* anchor::ConstraintSeeds */)
						Error_with_account_name(s290, ld64(s280), ld64(s280 + 8), "token_badge", 0xb)
						const ap = ld64(s290 + 8)
						const ao = ld64(s290)
						const aj = ld64(ld64(s128))
						const an = ld64(aj + 0x18)
						const am = ld64(aj + 0x10)
						const al = ld64(aj + 8)
						const ak = ld64(aj)
						copy(s188, se0, 0x20)
						st64(s1a8, ak, al, am, an)
						n = fn_13b5c0(s2a0, ao, ap, s1a8, al)
						z = ld64(s2a0)
						st64(y + 0x10, ld64(s2a0 + 8))
						st64(y + 8, z)
						st32(y, 2)
						return n
					}
					n = fn_13b430(s270, sf8)
					z = ld64(s270)
					st64(y + 0x10, ld64(s270 + 8))
					st64(y + 8, z)
					st32(y, 2)
					return n
				}
				n = Error_with_account_name(s260, u, v, "system_program", 0xe)
				z = ld64(s260)
				st64(y + 0x10, ld64(s260 + 8))
				st64(y + 8, z)
				st32(y, 2)
				return n
			}
			n = Error_with_account_name(s240, j, k, "token_badge_authority", 0x15)
			m = ld64(s240)
			st64(a + 0x10, ld64(s240 + 8))
			st64(a + 8, m)
			st32(a, 2)
			return n
		}
		alloc_handle_alloc_error(8, 0x68)
	}
	alloc_handle_alloc_error(8, 0x70)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_7be0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40
	let q, r, s: u64
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
	fn_143448(s20, h, g)
	const m = ld64(s20 + 0x10)
	const j = ld64(s20 + 8)
	const i = ld64(s20)
	if (i != 0x800000000000001a /* Ok */) {
		st64(s20, i, j, m)
		g = fn_13b430(s30, s20)
		const u = ld64(s30)
		st64(a + 8, ld64(s30 + 8))
		st64(a, u)
		return g
	}
	B14: {
		const k = ld64(j)
		st64(s20 + 8, ld64(j + 8))
		st64(s20, k)
		st64(s20 + 0x10, 0)
		g = fn_13ae08(s20, 0x100151f28, 8)
		if (g == 0) {
			g = fn_13ae08(s20, b + 9, 0x20)
			if (g == 0) {
				g = fn_13ae08(s20, b + 0x29, 0x20)
				if (g == 0) {
					st8(s1, ld8(b + 8))
					g = fn_13ae08(s20, s1, 1)
					if (g == 0) {
						n = ld64(m) + 1
						st64(m, n)
						st64(a + 8, n)
						st64(a, 2)
						return g
					}
				}
			}
			const o = g
			if (2 > (g & 3) - 2) {
				break B14
			}
			if ((o & 3) == 0) {
				break B14
			}
		} else {
			const l = g
			if (2 > (g & 3) - 2) {
				break B14
			}
			if ((l & 3) == 0) {
				break B14
			}
		}
		const p = ld64(ld64(g + 7))
		callx(p, ld64(g - 1), p)
	}
	g = anchor_error_from(s40, 0xbbc /* anchor::AccountDidNotSerialize */, q, r, s)
	n = ld64(s40 + 8)
	const t = ld64(s40)
	st64(m, ld64(m) + 1)
	st64(a + 8, n)
	st64(a, t != 2 ? t : 2)
	return g
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_badge
function fn_eeff0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s41 = fp - 0x41, s68 = fp - 0x68, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sc8 = fp - 0xc8, s110 = fp - 0x110, s130 = fp - 0x130, s150 = fp - 0x150, s188 = fp - 0x188, s198 = fp - 0x198, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1d0 = fp - 0x1d0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s2d8 = fp - 0x2d8, s2e0 = fp - 0x2e0, s2e8 = fp - 0x2e8, s310 = fp - 0x310, s318 = fp - 0x318, s320 = fp - 0x320
	let aw, dd, de, df: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s288, b, f)
	if (g != 0) {
		const p = ld64(ld64(b + 0x10))
		st64(s2d8 + 0x30, p)
		const q = ld64(p)
		copyr(s38, q + 8, 0x18)
		st64(s2d8 + 0x38, q)
		st64(s40, ld64(q))
		const r = ld64(f)
		copyr(s200, r + 8, 0x18)
		st64(s2d8 + 0x40, r)
		st64(s208, ld64(r))
		if ((memcmp(s40, s208, 0x20) as u32) == 0) {
			ErrorCode_name(s88, 0x100152d40)
			st64(s68, 0, 1, 0)
			st64(s20, s68, 0x100159480)
			st8(s20 + 0x18, 3)
			st64(s20 + 0x10, 0x20)
			st64(s38 + 8, 0)
			st64(s40, 0)
			if (ErrorCode_fmt(0x100152d40, s40) == 0) {
				copyr(s1d0, s68, 0x18)
				copy(s1e8, s88, 0x18)
				st64(s200, 0x100154fa6)
				st32(s188 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s1b8, 2)
				st32(s1f0, 5)
				st64(s200 + 8, 0x40)
				st64(s208, 0)
				const bb = fn_13b3a8(s248, s208)
				const ba = ld64(s248 + 8)
				const az = ld64(s248)
				const ax = ld64(s2d8 + 0x38)
				copyr(s208, ax, 0x20)
				const ay = ld64(s2d8 + 0x40)
				copy(s1e8, ay, 0x20)
				df = fn_13b5c0(s258, az, ba, s208, bb)
				const bc = ld64(s258)
				st64(a + 0x18, ld64(s258 + 8))
				st64(a + 0x10, bc)
				st8(a + 8, 2)
				return df
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s208, 0x1001594b0, 0x1001594d0)
		}
		st64(s2d8 + 0x48, a)
		const s = ld64(b + 8)
		const t = __floatundidf(ld64(s) * 0x148)
		const u = fn_14f7f8(ld64(s + 8), t)
		const v = fn_151cb0(u, 0)
		const w = fn_14f3e8(u)
		const x = max((fn_151a40(u, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (v as i64) ? 0 : w, 1)
		let be: AccountInfo = ld64(s288 + 8)
		let bz = ld64(s288)
		if (x > g) {
			const y: AccountInfo = ld64(s2d8 + 0x30)
			const z: LamportsCell = y.lamports
			rc_inc(z)
			const bd: DataCell = y.data
			rc_inc(bd)
			const bf: LamportsCell = be.lamports
			const bg = bf.strong
			st64(s2d8 + 0x18, be.key)
			st64(s2d8 + 0x20, y.executable)
			st64(s2d8 + 0x28, y.is_writable)
			st64(s2d8 + 0x40, y.is_signer)
			const bi = y.rent_epoch
			const bj = y.owner
			rc_inc(bf, bg)
			const bh: DataCell = be.data
			rc_inc(bh)
			st64(s2e8, bi, bj, bf, bd, z)
			const bk: AccountInfo = ld64(ld64(ld64(s288) + 0x18))
			const bl: LamportsCell = bk.lamports
			const bm = bl.strong
			st64(s2d8 + 0x30, sat_sub(x, g))
			const bn: AccountInfo = ld64(s288 + 8)
			st64(s310 + 0x18, bn.executable)
			st64(s310 + 0x20, bn.is_writable)
			const br = bn.is_signer
			const bs = bn.rent_epoch
			const bt = bn.owner
			const bq = bk.key
			rc_inc(bl, bm)
			const bo: DataCell = bk.data
			const bp = bo.strong
			st64(s310 + 0x10, bq)
			rc_inc(bo, bp)
			st64(s310 + 8, bk.owner)
			st64(s310, bk.rent_epoch)
			const bw = bk.is_signer
			const bv = bk.is_writable
			const bu = bk.executable
			st8(sc8 + 0x1a, ld64(s310 + 0x18))
			st8(sc8 + 0x19, ld64(s310 + 0x20))
			st8(sc8 + 0x18, br)
			st64(sc8, bh, bt, bs)
			st64(s110 + 0x40, ld64(s2d8))
			st64(s110 + 0x38, ld64(s2d8 + 0x18))
			st8(s110 + 0x32, ld64(s2d8 + 0x20))
			st8(s110 + 0x31, ld64(s2d8 + 0x28))
			st8(s110 + 0x30, ld64(s2d8 + 0x40))
			st64(s110 + 0x28, ld64(s2e8))
			st64(s110 + 0x20, ld64(s2e0))
			st64(s110 + 0x18, ld64(s2d8 + 8))
			st64(s110 + 0x10, ld64(s2d8 + 0x10))
			st64(s110 + 8, ld64(s2d8 + 0x38))
			st8(s110, bw, bv, bu)
			st64(s130 + 0x18, ld64(s310))
			st64(s130 + 0x10, ld64(s310 + 8))
			st64(s130, bl, bo)
			st64(s150 + 0x18, ld64(s310 + 0x10))
			st64(sa8, 8, 0)
			st64(s150, 0, 8, 0)
			df = fn_13d318(s218, s150, ld64(s2d8 + 0x30))
			aw = ld64(s218)
			if (aw != 2) {
				de = ld64(s218 + 8)
				dd = ld64(s2d8 + 0x48)
				st64(dd + 0x10, aw, de)
				st8(dd + 8, 2)
				return df
			}
			be = ld64(s288 + 8)
			st64(s2d8 + 0x40, be.key)
			bz = ld64(s288)
		}
		const bx: LamportsCell = be.lamports
		rc_inc(bx)
		const by: DataCell = be.data
		rc_inc(by)
		const ca: AccountInfo = ld64(ld64(bz + 0x18))
		const cb: LamportsCell = ca.lamports
		const cc = cb.strong
		st64(s2d8 + 0x28, be.executable)
		st64(s2d8 + 0x30, be.is_writable)
		st64(s2d8 + 0x38, be.is_signer)
		const cf = be.rent_epoch
		const cg = be.owner
		st64(s2d8 + 0x20, ca.key)
		rc_inc(cb, cc)
		const cd: DataCell = ca.data
		const ce = cd.strong
		st64(s2d8, cf, cg, by, bx)
		rc_inc(cd, ce)
		st64(s2e0, ca.owner)
		st64(s2e8, ca.rent_epoch)
		const cl = ca.is_signer
		const ck = ca.is_writable
		const cj = ca.executable
		const ch = ld64(ld64(ld64(bz + 0x20)))
		copyr(s88, ch, 0x20)
		const ci = ld64(ld64(ld64(bz + 0x28) + 0x58))
		copyr(s68, ci, 0x20)
		const cm = ld8(ld64(bz + 0x30))
		st64(s20 + 0x10, s41)
		st64(s20, s68)
		st64(s38 + 8, s88)
		st64(s40, 0x100154db3)
		st64(s98, s40)
		st64(s198 + 8, s98)
		st8(s198, cl, ck, cj)
		st64(s1b8 + 0x18, ld64(s2e8))
		st64(s1b8 + 0x10, ld64(s2e0))
		st64(s1b8, cb, cd)
		st64(s1c8 + 8, ld64(s2d8 + 0x20))
		st8(s1c8 + 2, ld64(s2d8 + 0x28))
		st8(s1c8 + 1, ld64(s2d8 + 0x30))
		st8(s1c8, ld64(s2d8 + 0x38))
		st64(s1d0, ld64(s2d8))
		st64(s1e8 + 0x10, ld64(s2d8 + 8))
		st64(s1e8 + 8, ld64(s2d8 + 0x10))
		st64(s1e8, ld64(s2d8 + 0x18))
		st64(s1f0, ld64(s2d8 + 0x40))
		st64(s2d8 + 0x40, cm)
		st8(s41, cm)
		st64(s20 + 0x18, 1)
		st64(s20 + 8, 0x20)
		st64(s38 + 0x10, 0x20)
		st64(s38, 0xb)
		st64(s98 + 8, 4)
		st64(s188, 1)
		st64(s208, 0, 8, 0)
		df = fn_13c8b8(s228, s208, 0xc8)
		aw = ld64(s228)
		if (aw != 2) {
			de = ld64(s228 + 8)
			dd = ld64(s2d8 + 0x48)
			st64(dd + 0x10, aw, de)
			st8(dd + 8, 2)
			return df
		}
		const cn = ld64(ld64(s288 + 8) + 8)
		const co = ld64(s288 + 8)
		const cq = ld64(co)
		rc_inc(cn)
		const cp = ld64(co + 0x10)
		rc_inc(cp)
		st64(s2d8 + 8, cp)
		const cr: LamportsCell = ca.lamports
		const cs = cr.strong
		st64(s2d8 + 0x10, ca.key)
		const ct: AccountInfo = ld64(s288 + 8)
		st64(s2d8 + 0x18, ct.executable)
		st64(s2d8 + 0x20, ct.is_writable)
		st64(s2d8 + 0x28, ct.is_signer)
		st64(s2d8 + 0x30, ct.rent_epoch)
		st64(s2d8 + 0x38, ct.owner)
		rc_inc(cr, cs)
		const cu: DataCell = ca.data
		const cv = cu.strong
		st64(s2e0, cq, cn)
		rc_inc(cu, cv)
		const da = ca.owner
		const cz = ca.rent_epoch
		const cy = ca.is_signer
		const cx = ca.is_writable
		const cw = ca.executable
		copyr(s88, ch, 0x20)
		copyr(s68, ci, 0x20)
		st64(s20 + 0x10, s41)
		st64(s20, s68)
		st64(s38 + 8, s88)
		st64(s40, 0x100154db3)
		st8(s41, ld64(s2d8 + 0x40))
		st64(s20 + 0x18, 1)
		st64(s20 + 8, 0x20)
		st64(s38 + 0x10, 0x20)
		st64(s38, 0xb)
		st64(s98, s40, 4)
		st64(s198 + 8, s98)
		st8(s198, cy, cx, cw)
		st64(s1b8, cr, cu, da, cz)
		st64(s1c8 + 8, ld64(s2d8 + 0x10))
		st8(s1c8 + 2, ld64(s2d8 + 0x18))
		st8(s1c8 + 1, ld64(s2d8 + 0x20))
		st8(s1c8, ld64(s2d8 + 0x28))
		st64(s1d0, ld64(s2d8 + 0x30))
		st64(s1e8 + 0x10, ld64(s2d8 + 0x38))
		copyr(s1f0, s2e0, 0x18)
		st64(s188, 1)
		st64(s208, 0, 8, 0)
		df = fn_13cc48(s238, s208, ld64(ld64(ld64(s288) + 0x38)))
		aw = ld64(s238)
		if (aw != 2) {
			de = ld64(s238 + 8)
			dd = ld64(s2d8 + 0x48)
			st64(dd + 0x10, aw, de)
			st8(dd + 8, 2)
			return df
		}
	} else {
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0x148)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const ad = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		const m = ld64(s288)
		const n: AccountInfo = ld64(ld64(m + 0x10))
		const o: LamportsCell = n.lamports
		const aa = n.key
		const ae: AccountInfo = ld64(s288 + 8)
		rc_inc(o)
		st64(s2d8 + 0x40, aa)
		const ab: DataCell = n.data
		const ac = ab.strong
		st64(s2d8 + 0x38, ab)
		rc_inc(ab, ac)
		const af: LamportsCell = ae.lamports
		const ag = af.strong
		st64(s2d8 + 8, ae.key)
		st64(s2d8 + 0x10, n.executable)
		st64(s2d8 + 0x18, n.is_writable)
		st64(s2d8 + 0x20, n.is_signer)
		st64(s2d8 + 0x28, n.rent_epoch)
		st64(s2d8 + 0x30, n.owner)
		rc_inc(af, ag)
		const ah: DataCell = ae.data
		rc_inc(ah)
		const ai: AccountInfo = ld64(ld64(m + 0x18))
		const aj: LamportsCell = ai.lamports
		const ak = aj.strong
		st64(s2d8, o)
		st64(s310 + 0x10, ae.executable)
		st64(s310 + 0x18, ae.is_writable)
		st64(s310 + 0x20, ae.is_signer)
		st64(s2e8, ae.rent_epoch)
		st64(s2e0, ae.owner)
		const an = ai.key
		rc_inc(aj, ak)
		const al: DataCell = ai.data
		const am = al.strong
		st64(s310, an, ad)
		st64(s2d8 + 0x48, a)
		rc_inc(al, am)
		st64(s318, ai.owner)
		st64(s320, ai.rent_epoch)
		const av = ai.is_signer
		const au = ai.is_writable
		const at = ai.executable
		const ao = ld64(s288)
		const ap = ld64(ld64(ld64(ao + 0x20)))
		copyr(s88, ap, 0x20)
		const aq = ld64(ld64(ld64(ao + 0x28) + 0x58))
		copyr(s68, aq, 0x20)
		const ar = ld8(ld64(ao + 0x30))
		st64(s20 + 0x10, s41)
		st64(s20, s68)
		st64(s38 + 8, s88)
		st64(s40, 0x100154db3)
		st8(s41, ar)
		st64(s98, s40)
		st64(s188 + 0x28, s98)
		st8(s188 + 0x22, ld64(s310 + 0x10))
		st8(s188 + 0x21, ld64(s310 + 0x18))
		st8(s188 + 0x20, ld64(s310 + 0x20))
		st64(s188 + 0x18, ld64(s2e8))
		st64(s188 + 0x10, ld64(s2e0))
		st64(s188, af, ah)
		st64(s198 + 8, ld64(s2d8 + 8))
		st8(s198 + 2, ld64(s2d8 + 0x10))
		st8(s198 + 1, ld64(s2d8 + 0x18))
		st8(s198, ld64(s2d8 + 0x20))
		st64(s1b8 + 0x18, ld64(s2d8 + 0x28))
		st64(s1b8 + 0x10, ld64(s2d8 + 0x30))
		st64(s1b8 + 8, ld64(s2d8 + 0x38))
		st64(s1b8, ld64(s2d8))
		st64(s1c8 + 8, ld64(s2d8 + 0x40))
		st8(s1c8, av, au, at)
		st64(s1d0, ld64(s320))
		st64(s1e8 + 0x10, ld64(s318))
		st64(s1e8, aj, al)
		st64(s1f0, ld64(s310))
		st64(s20 + 0x18, 1)
		st64(s20 + 8, 0x20)
		st64(s38 + 0x10, 0x20)
		st64(s38, 0xb)
		st64(s98 + 8, 4)
		st64(s188 + 0x30, 1)
		st64(s208, 0, 8, 0)
		df = fn_13cfd8(s268, s208, ld64(s310 + 8), 0xc8, ld64(ld64(ao + 0x38)))
		aw = ld64(s268)
		if (aw != 2) {
			de = ld64(s268 + 8)
			dd = ld64(s2d8 + 0x48)
			st64(dd + 0x10, aw, de)
			st8(dd + 8, 2)
			return df
		}
	}
	const db = ld64(s2d8 + 0x48)
	fn_5610(s208, ld64(s288 + 8))
	if (ld8(s200) == 2) {
		df = Error_with_account_name(s278, ld64(s200 + 8), ld64(s1f0), "token_badge", 0xb)
		const dc = ld64(s278)
		st64(db + 0x18, ld64(s278 + 8))
		st64(db + 0x10, dc)
		st8(db + 8, 2)
		return df
	}
	return memcpy(db, s208, 0x50)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
function fn_14f7f8(a: u64, b: u64): u64 {
	return fn_14f808(a, b)
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

function fn_5610(a: u64, b: u64) {
	const s28 = fp - 0x28, s30 = fp - 0x30, s48 = fp - 0x48, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8
	let p: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0) {
		anchor_error_from(sc8, 0xbc4 /* anchor::AccountNotInitialized */)
		p = ld64(sc8)
		st64(a + 0x18, ld64(sc8 + 8))
		st64(a + 0x10, p)
		st8(a + 8, 2)
		return
	}
	const g = memcmp(f, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s48, b, g as u32)
		const o = ld64(s48 + 0x10)
		const l = ld64(s48 + 8)
		const k = ld64(s48)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s88 + 8, ld64(l + 8))
			st64(s88, m)
			fn_105440(s48, s88, 0x800000000000001a /* Ok */)
			if (ld8(s48) == 0) {
				st32(a + 0xb, ld32(s48 + 4))
				st32(a + 8, ld32(s48 + 1))
				const r = ld64(s48 + 8)
				const q = ld64(s48 + 0x10)
				memcpy(s78, s30, 0x2a)
				memcpy(a + 0x1f, s78, 0x2a)
				st64(a + 0x17, q)
				st64(a + 0xf, r)
				st64(a, b)
				st64(o, ld64(o) - 1)
			} else {
				const n = ld64(s48 + 8)
				st64(a + 0x18, ld64(s48 + 0x10))
				st64(a + 0x10, n)
				st8(a + 8, 2)
				st64(o, ld64(o) - 1)
			}
		} else {
			st64(s48, k, l, o)
			fn_13b430(sb8, s48)
			p = ld64(sb8)
			st64(a + 0x18, ld64(sb8 + 8))
			st64(a + 0x10, p)
			st8(a + 8, 2)
		}
	} else {
		const j = anchor_error_from(s98, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const i = ld64(s98 + 8)
		const h = ld64(s98)
		copyr(s48, f, 0x20)
		st64(s28, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		fn_13b5c0(sa8, h, i, s48, j)
		p = ld64(sa8)
		st64(a + 0x18, ld64(sa8 + 8))
		st64(a + 0x10, p)
		st8(a + 8, 2)
	}
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_149478(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	const s20 = fp - 0x20, s28 = fp - 0x28
	st64(s20, 0x10015b8e0, a, b)
	st16(s20 + 0x18, 1)
	st64(s28, 1)
	fn_147238(s28, b, c, d, e)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_147238(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	fn_1478b8(a, b, c, d, e)
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
function fn_1478b8(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	custom_panic(a, b, c, d, e)
	abort()
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

function fn_14f060(a: u64, b: u64): u64 {
	return fn_14ecd0(ld64(a), 1, b)
}
