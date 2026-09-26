// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction initialize_position_bundle: handler + 25 reachable functions
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
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function Account_try_from(a: u64, b: u64): void // lib anchor_lang::accounts::account::Account<T>::try_from
declare function Account_try_from_unchecked(a: u64, b: u64): void // lib anchor_lang::accounts::account::Account<T>::try_from_unchecked
declare function ptr_drop_in_place_c1b0(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 4]>
declare function AccountInfo_clone(a: u64, b: u64): void // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11990(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_122e8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp
declare function fn_12510(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from, memcmp
declare function fn_129a0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from, memcmp
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function associated_token_create(a: u64, b: u64): u64 // lib anchor_spl::associated_token::create
declare function fn_127828(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcpy, ptr_drop_in_place_126088
declare function fn_133a38(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses raw_vec_handle_error
declare function fn_133b80(a: u64, b: u64): void // lib uses raw_vec_handle_error
declare function fn_1390d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses memcmp, AccountInfo_try_borrow_lamports, AccountInfo_try_borrow_data
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
declare function fn_14ecd0(a: u64, b: u64, c: u64): u64 // lib "0001020304050607080910111213141516171819…", "0001020304050607080910111213141516171819…"
declare function fn_14f3e8(a: u64): u64 // lib
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function __floatundidf(a: u64): u64 // lib __floatundidf
declare function fn_14f808(a: u64, b: u64): u64 // lib uses __multi3
declare function fn_151a40(a: u64, b: u64): u64 // lib
declare function fn_151cb0(a: u64, b: u64): u64 // lib

// instruction handler: initialize_position_bundle (discriminator sha256("global:initialize_position_bundle")[..8] = 0x41c2121895f12d75)
// accounts [str: the program's account-error strings, in order of first use]: position_bundle_owner, rent, position_bundle, position_bundle_mint, position_bundle_token_account, token_program, funder, associated_token_program, system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
function ix_initialize_position_bundle(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, sc8 = fp - 0xc8, se0 = fp - 0xe0, s180 = fp - 0x180, s190 = fp - 0x190, s198 = fp - 0x198, s1a8 = fp - 0x1a8, s1a9 = fp - 0x1a9, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1000 = fp - 0x1000
	let w: u64
	let g = a
	sol_log("Instruction: InitializePositionBundle", 0x25)
	st8(s1a9, 0xff)
	st64(s1a8, accounts, accounts_len)
	st64(s1000 + 8, s1a9)
	let y = accounts_initialize_position_bundle(se0, program_id, s1a8, undef, fp)
	const f = ld32(se0)
	if (f == 2) {
		w = ld64(se0 + 8)
		st64(g + 8, ld64(se0 + 0x10))
		st64(g, w)
		return y
	}
	const z = g
	const j = ld32(se0 + 4)
	const i = ld64(se0 + 8)
	const h = ld64(se0 + 0x10)
	memcpy(s180, sc8, 0xa0)
	st64(s190, i, h)
	st32(s198, f, j)
	const k = ld64(s180 + 0x40)
	const l = ld64(k)
	const p = ld64(l)
	const o = ld64(l + 8)
	const n = ld64(l + 0x10)
	const r = ld8(s1a9)
	const m = ld64(s180 + 0x48)
	st64(m + 0x20, ld64(l + 0x18))
	st64(m + 0x18, n)
	st64(m + 0x10, o)
	st64(m + 8, p)
	const s = ld64(s180 + 0x50)
	const q = ld64(k)
	copyr(s28, q, 0x20)
	st64(se0, 0x100152e73)
	st64(se0 + 0x10, s28)
	st64(sc8 + 8, s1)
	st8(s1, r)
	st64(se0 + 8, 0xf)
	st64(sc8, 0x20)
	st64(sc8 + 0x10, 1)
	const v = ld64(s)
	const u = ld64(m)
	const t = ld64(s180 + 0x68)
	st64(s1000, t, se0, 3)
	y = fn_6b9a8(s1c0, u, k, v, t, se0, 3)
	w = ld64(s1c0)
	if (w == 2) {
		st64(s1000, se0, 3)
		y = fn_6c748(s1d0, u, k, t, se0, 3)
		const x = ld64(s1d0 + 8)
		w = ld64(s1d0)
		g = z
		if (w == 2) {
			y = fn_a5308(s1e0, s198, program_id)
			w = ld64(s1e0)
			st64(g + 8, ld64(s1e0 + 8))
			st64(g, w)
			return y
		}
		st64(g + 8, x)
		st64(g, w)
		return y
	}
	st64(z + 8, ld64(s1c0 + 8))
	st64(z, w)
	return y
}

// Anchor Accounts::try_accounts of instruction initialize_position_bundle (called by ix_initialize_position_bundle; name [str]: from the handler's "Instruction: …" log; was fn_9efa8)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_bundle_owner (AccountNotEnoughKeys), rent, position_bundle (ConstraintSeeds, ConstraintMut, ConstraintRentExempt), position_bundle_mint (ConstraintMut, ConstraintSigner, ConstraintRentExempt), position_bundle_token_account (ConstraintMut, ConstraintRentExempt), token_program (ConstraintAddress), funder (ConstraintMut), associated_token_program, system_program
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: position_bundle, position_bundle_mint, position_bundle_token_account, funder
function accounts_initialize_position_bundle(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s18 = fp - 0x18, s48 = fp - 0x48, s80 = fp - 0x80, s88 = fp - 0x88, s90 = fp - 0x90, sa0 = fp - 0xa0, sa8 = fp - 0xa8, sf0 = fp - 0xf0, s108 = fp - 0x108, s120 = fp - 0x120, s138 = fp - 0x138, s139 = fp - 0x139, s160 = fp - 0x160, s178 = fp - 0x178, s190 = fp - 0x190, s198 = fp - 0x198, s1a0 = fp - 0x1a0, s1a8 = fp - 0x1a8, s1b0 = fp - 0x1b0, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1c8 = fp - 0x1c8, s1d0 = fp - 0x1d0, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s398 = fp - 0x398, s3a8 = fp - 0x3a8, s3b8 = fp - 0x3b8, s3c8 = fp - 0x3c8, s3d8 = fp - 0x3d8, s3e8 = fp - 0x3e8, s3f8 = fp - 0x3f8, s408 = fp - 0x408, s418 = fp - 0x418, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s450 = fp - 0x450, s458 = fp - 0x458, s460 = fp - 0x460, s468 = fp - 0x468, s470 = fp - 0x470
	let v, w, bg: u64
	st64(s1d8, b)
	const f = ld64(c + 8)
	if (f != 0) {
		const ad = ld64(e - 0xff8)
		const g: AccountInfo = ld64(c)
		st64(s1d0, g)
		st64(c + 8, f - 1)
		st64(c, g + 0x30)
		if (f != 1) {
			st64(s1c8, g + 0x30)
			st64(c + 8, f - 2)
			st64(c, g + 0x60)
			if (f != 2) {
				st64(s1c0, g + 0x60)
				let h = f - 3
				st64(c + 8, h)
				let i = g + 0x90
				st64(c, i)
				if (h == 0) {
					anchor_error_from(s1e8, 0xbbd /* anchor::AccountNotEnoughKeys */, c, i, h)
					h = undef
					i = ld64(s1e8 + 8)
					const j = ld64(s1e8)
					if (j != 2) {
						w = Error_with_account_name(s1f8, j, i, "position_bundle_owner", 0x15)
						v = ld64(s1f8)
						st64(a + 0x10, ld64(s1f8 + 8))
						st64(a + 8, v)
						st32(a, 2)
						return w
					}
				} else {
					st64(c + 8, f - 4)
					st64(c, g + 0xc0)
				}
				st64(s1b8, i)
				try_accounts_11718(sa8, c, c, i, h)
				const l = ld64(sa0)
				const k = ld64(sa8)
				if (k == 2) {
					st64(s1b0, l)
					fn_129a0(sa8, c, l)
					const n = ld64(sa0)
					const m = ld64(sa8)
					if (m == 2) {
						st64(s1a8, n)
						fn_122e8(sa8, c, n)
						const p = ld64(sa0)
						const o = ld64(sa8)
						if (o == 2) {
							st64(s1a0, p)
							try_accounts_11990(sa8, c, p)
							const s = ld64(sa0 + 8)
							const r = ld64(sa0)
							const q = ld64(sa8)
							if (q == 0) {
								w = Error_with_account_name(s408, r, s, 0x100152d60 /* "rent" */, 4)
								v = ld64(s408)
								st64(a + 0x10, ld64(s408 + 8))
								st64(a + 8, v)
								st32(a, 2)
								return w
							}
							st64(s448, r, s)
							st64(s450, ld64(s90))
							fn_12510(sa8, c, s)
							const u = ld64(sa0)
							const t = ld64(sa8)
							if (t == 2) {
								st64(s198, u)
								rent_get(sa8)
								copy(s178, sa0, 0x18)
								if (ld64(sa8) == 0) {
									copyr(s190, s178, 0x18)
									const x = ld64(ld64(s1c8))
									const ab = ld64(x + 0x18)
									const aa = ld64(x + 0x10)
									const z = ld64(x + 8)
									const y = ld64(x)
									st64(s48, 0x100152e73)
									st64(s48 + 0x10, s108)
									st64(s108, y, z, aa, ab)
									st64(s48 + 8, 0xf)
									st64(s48 + 0x18, 0x20)
									// PDA find_program_address(["position_bundle", *s108], program *(ld64(s1d8)))
									Pubkey_find_program_address(sa8, s48, 2, ld64(s1d8))
									copyr(s160, sa8, 0x20)
									const ac = ld8(s88)
									st8(s139, ac)
									st8(ad, ac)
									const ae = ld64(ld64(s1d0))
									copy(sa8, ae, 0x20)
									if ((memcmp(sa8, s160, 0x20) as u32) == 0) {
										st64(s80, s139, s1d8)
										st64(s88, ld64(s1c8))
										st64(sa8, s1d0, s190, s1b0, s1a0)
										w = fn_a1098(s108, sa8)
										const am = ld64(s108 + 8)
										v = ld64(s108)
										if (v == 2) {
											const position_bundle: AccountInfo = ld64(am)
											if (position_bundle.is_writable == 0) {
												anchor_error_from(s3e8, 0x7d0 /* anchor::ConstraintMut */)
												w = Error_with_account_name(s3f8, ld64(s3e8), ld64(s3e8 + 8), "position_bundle", 0xf)
												v = ld64(s3f8)
												st64(a + 0x10, ld64(s3f8 + 8))
												st64(a + 8, v)
												st32(a, 2)
												return w
											}
											AccountInfo_clone(s108, position_bundle)
											st64(s458, fn_143100(s108))
											AccountInfo_clone(sa8, ld64(am))
											AccountInfo_try_data_len(s48, sa8)
											const ap = ld64(s48 + 8)
											const ao = ld64(s48)
											if (ao != 0x800000000000001a /* Ok */) {
												st64(s48 + 0x10, ld64(s48 + 0x10))
												st64(s48, ao, ap)
												w = fn_13b430(s288, s48)
												const bc = ld64(s288)
												st64(a + 0x10, ld64(s288 + 8))
												st64(a + 8, bc)
												st32(a, 2)
												const be = ld64(sa0 + 8)
												const bd = ld64(sa0)
												rc_dec(bd)
												rc_dec(be)
												bg = ld64(s108 + 0x10)
												const bf = ld64(s108 + 8)
												rc_dec(bf)
												if (!rc_release(bg)) {
													return w
												}
												st64(bg + 8, ld64(bg + 8) - 1)
												return w
											}
											st64(s468, am)
											const aq = __floatundidf(ld64(s190) * (ap + 0x80))
											const ar = fn_14f7f8(ld64(s190 + 8), aq)
											st64(s460, fn_151cb0(ar, 0))
											const at = fn_14f3e8(ar)
											const au = 0 > (ld64(s460) as i64) ? 0 : at
											const bb = (fn_151a40(ar, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : au
											const aw = ld64(sa0 + 8)
											const av = ld64(sa0)
											rc_dec(av)
											rc_dec(aw)
											const az = ld64(s108 + 0x10)
											const ax = ld64(s108 + 8)
											let ay = ld64(ax) - 1
											st64(ax, ay)
											if (ay == 0) {
												ay = ld64(ax + 8) - 1
												st64(ax + 8, ay)
											}
											let ba = ld64(az) - 1
											st64(az, ba)
											if (ba == 0) {
												ba = ld64(az + 8) - 1
												st64(az + 8, ba)
											}
											if (bb > ld64(s458)) {
												anchor_error_from(s3c8, 0x7d5 /* anchor::ConstraintRentExempt */, ba, ay)
												w = Error_with_account_name(s3d8, ld64(s3c8), ld64(s3c8 + 8), "position_bundle", 0xf)
												v = ld64(s3d8)
												st64(a + 0x10, ld64(s3d8 + 8))
												st64(a + 8, v)
												st32(a, 2)
												return w
											}
											rent_get(sa8)
											copy(s120, sa0, 0x18)
											if (ld64(sa8) != 0) {
												w = fn_13b430(s298, s120)
												v = ld64(s298)
												st64(a + 0x10, ld64(s298 + 8))
												st64(a + 8, v)
												st32(a, 2)
												return w
											}
											copyr(s138, s120, 0x18)
											st64(s48 + 0x28, ld64(s468))
											st64(s48, s1c8, s138, s1b0, s1a0, s1a8)
											w = fn_a2b38(sa8, s48)
											const bh = ld32(sa8)
											if (bh == 2) {
												v = ld64(sa0)
												st64(a + 0x10, ld64(sa0 + 8))
												st64(a + 8, v)
												st32(a, 2)
												return w
											}
											st64(s458, ld32(sa8 + 4))
											st64(s460, ld64(sa0))
											const bi = ld64(sa0 + 8)
											memcpy(sf0, s90, 0x48)
											st64(s108 + 0x10, bi)
											st64(s108 + 8, ld64(s460))
											st32(s108 + 4, ld64(s458))
											st32(s108, bh)
											const position_bundle_mint: AccountInfo = ld64(sf0 + 0x40)
											if (position_bundle_mint.is_writable == 0) {
												anchor_error_from(s3a8, 0x7d0 /* anchor::ConstraintMut */)
												w = Error_with_account_name(s3b8, ld64(s3a8), ld64(s3a8 + 8), "position_bundle_mint", 0x14)
												v = ld64(s3b8)
												st64(a + 0x10, ld64(s3b8 + 8))
												st64(a + 8, v)
												st32(a, 2)
												return w
											}
											if (position_bundle_mint.is_signer == 0) {
												anchor_error_from(s388, 0x7d2 /* anchor::ConstraintSigner */)
												w = Error_with_account_name(s398, ld64(s388), ld64(s388 + 8), "position_bundle_mint", 0x14)
												v = ld64(s398)
												st64(a + 0x10, ld64(s398 + 8))
												st64(a + 8, v)
												st32(a, 2)
												return w
											}
											AccountInfo_clone(s48, position_bundle_mint)
											st64(s458, fn_143100(s48))
											AccountInfo_clone(sa8, ld64(sf0 + 0x40))
											AccountInfo_try_data_len(s18, sa8)
											const bl = ld64(s18 + 8)
											const bk = ld64(s18)
											if (bk != 0x800000000000001a /* Ok */) {
												st64(s18 + 0x10, ld64(s18 + 0x10))
												st64(s18, bk, bl)
												w = fn_13b430(s2a8, s18)
												const bx = ld64(s2a8)
												st64(a + 0x10, ld64(s2a8 + 8))
												st64(a + 8, bx)
												st32(a, 2)
												const bz = ld64(sa0 + 8)
												const by = ld64(sa0)
												rc_dec(by)
												rc_dec(bz)
												bg = ld64(s48 + 0x10)
												const ca = ld64(s48 + 8)
												rc_dec(ca)
												if (!rc_release(bg)) {
													return w
												}
												st64(bg + 8, ld64(bg + 8) - 1)
												return w
											}
											const bm = __floatundidf(ld64(s138) * (bl + 0x80))
											const bn = fn_14f7f8(ld64(s138 + 8), bm)
											st64(s460, fn_151cb0(bn, 0))
											const bo = fn_14f3e8(bn)
											const bp = 0 > (ld64(s460) as i64) ? 0 : bo
											const bw = (fn_151a40(bn, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : bp
											const br = ld64(sa0 + 8)
											const bq = ld64(sa0)
											rc_dec(bq)
											rc_dec(br)
											const bu = ld64(s48 + 0x10)
											const bs = ld64(s48 + 8)
											let bt = ld64(bs) - 1
											st64(bs, bt)
											if (bt == 0) {
												bt = ld64(bs + 8) - 1
												st64(bs + 8, bt)
											}
											let bv = ld64(bu) - 1
											st64(bu, bv)
											if (bv == 0) {
												bv = ld64(bu + 8) - 1
												st64(bu + 8, bv)
											}
											if (bw > ld64(s458)) {
												anchor_error_from(s368, 0x7d5 /* anchor::ConstraintRentExempt */, bv, bt)
												w = Error_with_account_name(s378, ld64(s368), ld64(s368 + 8), "position_bundle_mint", 0x14)
												v = ld64(s378)
												st64(a + 0x10, ld64(s378 + 8))
												st64(a + 8, v)
												st32(a, 2)
												return w
											}
											rent_get(sa8)
											const cg = ld64(sa0 + 8)
											const cf = ld64(sa0)
											if (ld64(sa8) != 0) {
												st32(s48, ld32(s90 + 1))
												st32(s48 + 3, ld32(s90 + 4))
												const cr = ld8(s90)
												st32(sa0 + 0xc, ld32(s48 + 3))
												st32(sa0 + 9, ld32(s48))
												st8(sa0 + 8, cr)
												st64(sa8, cf, cg)
												w = fn_13b430(s2b8, sa8)
												v = ld64(s2b8)
												st64(a + 0x10, ld64(s2b8 + 8))
												st64(a + 8, v)
												st32(a, 2)
												return w
											}
											st64(sa8, s1c0, s198, s1b0, s1b8, s108, s1a0, s1a8)
											w = fn_a4608(s48, sa8)
											st64(s458, ld64(s48 + 8))
											v = ld64(s48)
											if (v == 2) {
												const position_bundle_token_account: AccountInfo = ld64(ld64(s458))
												if (position_bundle_token_account.is_writable == 0) {
													anchor_error_from(s348, 0x7d0 /* anchor::ConstraintMut */)
													w = Error_with_account_name(s358, ld64(s348), ld64(s348 + 8), "position_bundle_token_account", 0x1d)
													v = ld64(s358)
													st64(a + 0x10, ld64(s358 + 8))
													st64(a + 8, v)
													st32(a, 2)
													return w
												}
												st64(s460, s48)
												AccountInfo_clone(s48, position_bundle_token_account)
												st64(s470, fn_143100(ld64(s460)))
												const cc = ld64(ld64(s458))
												st64(s460, sa8)
												AccountInfo_clone(sa8, cc)
												AccountInfo_try_data_len(s18, ld64(s460))
												const ce = ld64(s18 + 8)
												const cd = ld64(s18)
												if (cd != 0x800000000000001a /* Ok */) {
													st64(s18 + 0x10, ld64(s18 + 0x10))
													st64(s18, cd, ce)
													w = fn_13b430(s2c8, s18)
													const cs = ld64(s2c8)
													st64(a + 0x10, ld64(s2c8 + 8))
													st64(a + 8, cs)
													st32(a, 2)
													const cu = ld64(sa0 + 8)
													const ct = ld64(sa0)
													rc_dec(ct)
													rc_dec(cu)
													bg = ld64(s48 + 0x10)
													const cv = ld64(s48 + 8)
													rc_dec(cv)
													if (!rc_release(bg)) {
														return w
													}
													st64(bg + 8, ld64(bg + 8) - 1)
													return w
												}
												const ch = fn_14f7f8(cg, __floatundidf((ce + 0x80) * cf))
												st64(s460, fn_151cb0(ch, 0))
												const ci = fn_14f3e8(ch)
												const cj = 0 > (ld64(s460) as i64) ? 0 : ci
												const cq = (fn_151a40(ch, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : cj
												const cl = ld64(sa0 + 8)
												const ck = ld64(sa0)
												rc_dec(ck)
												rc_dec(cl)
												const co = ld64(s48 + 0x10)
												const cm = ld64(s48 + 8)
												let cn = ld64(cm) - 1
												st64(cm, cn)
												if (cn == 0) {
													cn = ld64(cm + 8) - 1
													st64(cm + 8, cn)
												}
												let cp = ld64(co) - 1
												st64(co, cp)
												if (cp == 0) {
													cp = ld64(co + 8) - 1
													st64(co + 8, cp)
												}
												if (cq > ld64(s470)) {
													anchor_error_from(s328, 0x7d5 /* anchor::ConstraintRentExempt */, cp, cn)
													w = Error_with_account_name(s338, ld64(s328), ld64(s328 + 8), "position_bundle_token_account", 0x1d)
													v = ld64(s338)
													st64(a + 0x10, ld64(s338 + 8))
													st64(a + 8, v)
													st32(a, 2)
													return w
												}
												const funder: AccountInfo = ld64(s1b0)
												if (funder.is_writable != 0) {
													const cx = ld64(s1a8)
													const cy = ld64(cx)
													copy(s48, cy, 0x20)
													if ((memcmp(s48, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
														anchor_error_from(s2d8, 0x7dc /* anchor::ConstraintAddress */)
														const dd = Error_with_account_name(s2e8, ld64(s2d8), ld64(s2d8 + 8), "token_program", 0xd)
														const dc = ld64(s2e8 + 8)
														const db = ld64(s2e8)
														copyr(sa8, s48, 0x20)
														st64(s88, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
														w = fn_13b5c0(s2f8, db, dc, sa8, dd)
														v = ld64(s2f8)
														st64(a + 0x10, ld64(s2f8 + 8))
														st64(a + 8, v)
														st32(a, 2)
														return w
													}
													w = memcpy(a, s108, 0x60)
													const da = ld64(s198)
													const cz = ld64(s1a0)
													st64(a + 0x70, ld64(s1b8))
													st64(a + 0x60, ld64(s468))
													st64(a + 0x68, ld64(s458))
													st64(a + 0x78, funder, cx, cz, q)
													copy(a + 0x98, s448, 0x10)
													st64(a + 0xa8, ld64(s450))
													st64(a + 0xb0, da)
													return w
												}
												anchor_error_from(s308, 0x7d0 /* anchor::ConstraintMut */, cp, cn)
												w = Error_with_account_name(s318, ld64(s308), ld64(s308 + 8), "funder", 6)
												v = ld64(s318)
												st64(a + 0x10, ld64(s318 + 8))
												st64(a + 8, v)
												st32(a, 2)
												return w
											}
											st64(a + 0x10, ld64(s458))
											st64(a + 8, v)
											st32(a, 2)
											return w
										}
										st64(a + 0x10, am)
										st64(a + 8, v)
										st32(a, 2)
										return w
									}
									anchor_error_from(s258, 0x7d6 /* anchor::ConstraintSeeds */)
									Error_with_account_name(s268, ld64(s258), ld64(s258 + 8), "position_bundle", 0xf)
									const al = ld64(s268 + 8)
									const ak = ld64(s268)
									const af = ld64(ld64(s1d0))
									const aj = ld64(af + 0x18)
									const ai = ld64(af + 0x10)
									const ah = ld64(af + 8)
									const ag = ld64(af)
									copy(s88, s160, 0x20)
									st64(sa8, ag, ah, ai, aj)
									w = fn_13b5c0(s278, ak, al, sa8, ah)
									v = ld64(s278)
									st64(a + 0x10, ld64(s278 + 8))
									st64(a + 8, v)
									st32(a, 2)
									return w
								}
								w = fn_13b430(s248, s178)
								v = ld64(s248)
								st64(a + 0x10, ld64(s248 + 8))
								st64(a + 8, v)
								st32(a, 2)
								return w
							}
							w = Error_with_account_name(s238, t, u, "associated_token_program", 0x18)
							v = ld64(s238)
							st64(a + 0x10, ld64(s238 + 8))
							st64(a + 8, v)
							st32(a, 2)
							return w
						}
						w = Error_with_account_name(s228, o, p, "system_program", 0xe)
						v = ld64(s228)
						st64(a + 0x10, ld64(s228 + 8))
						st64(a + 8, v)
						st32(a, 2)
						return w
					}
					w = Error_with_account_name(s218, m, n, "token_program", 0xd)
					v = ld64(s218)
					st64(a + 0x10, ld64(s218 + 8))
					st64(a + 8, v)
					st32(a, 2)
					return w
				}
				w = Error_with_account_name(s208, k, l, "funder", 6)
				v = ld64(s208)
				st64(a + 0x10, ld64(s208 + 8))
				st64(a + 8, v)
				st32(a, 2)
				return w
			}
			w = anchor_error_from(s418, 0xbbd /* anchor::AccountNotEnoughKeys */, c, g + 0x60, f - 2)
			v = ld64(s418)
			st64(a + 0x10, ld64(s418 + 8))
			st64(a + 8, v)
			st32(a, 2)
			return w
		}
		w = anchor_error_from(s428, 0xbbd /* anchor::AccountNotEnoughKeys */, c, g + 0x30, f - 1)
		v = ld64(s428)
		st64(a + 0x10, ld64(s428 + 8))
		st64(a + 8, v)
		st32(a, 2)
		return w
	}
	w = anchor_error_from(s438, 0xbbd /* anchor::AccountNotEnoughKeys */, c, d, e)
	v = ld64(s438)
	st64(a + 0x10, ld64(s438 + 8))
	st64(a + 8, v)
	st32(a, 2)
	return w
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

function fn_6b9a8(a: u64, b: u64, c: AccountInfo, d: u64, p5: u64, p6: u64, p7: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s30 = fp - 0x30, s58 = fp - 0x58, s60 = fp - 0x60, s88 = fp - 0x88, s90 = fp - 0x90, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sc8 = fp - 0xc8, se0 = fp - 0xe0, se8 = fp - 0xe8, s100 = fp - 0x100, s130 = fp - 0x130, s148 = fp - 0x148, s150 = fp - 0x150, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s1000 = fp - 0x1000
	let ah, an, ap: u64
	let bg: AccountInfo = b
	const f: LamportsCell = c.lamports
	const p = c.key
	const g: AccountInfo = p5
	const o = g.key
	rc_inc(f)
	const h: DataCell = c.data
	const bd = p7
	const be = p6
	rc_inc(h)
	const i = ld64(d + 8)
	const q = ld64(d)
	rc_inc(i)
	const j = ld64(d + 0x10)
	rc_inc(j)
	let bf = d
	const k: AccountInfo = bg
	const l: LamportsCell = bg.lamports
	const n = bg.key
	rc_inc(l)
	const m: DataCell = k.data
	rc_inc(m)
	st64(s1000, n, 8, 0, 1)
	fn_135038(se8, o, p, q, n, 8, 0, 1)
	copy(s100, se0, 0x18)
	const r = ld64(se8)
	if (r == 0x8000000000000000) {
		an = fn_13b430(s188, s100)
		ah = ld64(s188 + 8)
		ap = ld64(s188)
	} else {
		memcpy(s130, sc8, 0x30)
		st64(s150, r)
		copy(s148, s100, 0x18)
		const s: LamportsCell = c.lamports
		const u = c.key
		const y: AccountInfo = bg
		const v: AccountInfo = bf
		rc_inc(s)
		const t: DataCell = c.data
		rc_inc(t)
		const w: LamportsCell = v.lamports
		const ay = v.key
		const az = c.executable
		const ba = c.is_writable
		const bb = c.is_signer
		const bc = c.rent_epoch
		const ab = c.owner
		rc_inc(w)
		const x: DataCell = v.data
		rc_inc(x)
		const z: LamportsCell = y.lamports
		const at = y.key
		const au = v.executable
		const av = v.is_writable
		const aw = v.is_signer
		const ax = v.rent_epoch
		bf = v.owner
		rc_inc(z)
		const aa: DataCell = y.data
		rc_inc(aa)
		const ac: LamportsCell = g.lamports
		const aq = g.key
		const ar = bg.executable
		const ae = bg.is_writable
		const aj = bg.is_signer
		const ak = bg.rent_epoch
		const al = bg.owner
		rc_inc(ac)
		const ad: DataCell = g.data
		bg = ae
		rc_inc(ad)
		const ai = g.owner
		ah = g.rent_epoch
		const ag = g.is_signer
		const af = g.is_writable
		st8(s30 + 2, g.executable)
		st8(s30, ag, af)
		st64(s58, aq, ac, ad, ai, ah)
		st8(s60, aj, bg, ar)
		st64(s88, at, z, aa, al, ak)
		st8(s90, aw, av, au)
		st64(sb8, ay, w, x, bf, ax)
		st8(sc0, bb, ba, az)
		st64(se8, u, s, t, ab, bc)
		st64(s28, be, bd)
		st64(s1000, s28, 1)
		const am = fn_1390d8(s168, s150, se8, 4, fp)
		if (ld64(s168) == 0x800000000000001a /* Ok */) {
			ptr_drop_in_place_c1b0(se8, am)
			rc_dec(l)
			an = m
			if (rc_release(m)) {
				st64(an + 8, ld64(an + 8) - 1)
			}
			rc_dec(i)
			rc_dec(j)
			rc_dec(f)
			if (!rc_release(h)) {
				st64(a + 8, ah)
				st64(a, 2)
				return an
			}
			h.weak = h.weak - 1
			st64(a + 8, ah)
			st64(a, 2)
			return an
		}
		copyr(s18, s168, 0x18)
		const ao = fn_13b430(s178, s18)
		ah = ld64(s178 + 8)
		ap = ld64(s178)
		an = ptr_drop_in_place_c1b0(se8, ao)
	}
	rc_dec(l)
	rc_dec(m)
	rc_dec(i)
	rc_dec(j)
	rc_dec(f)
	if (!rc_release(h)) {
		st64(a + 8, ah)
		st64(a, ap)
		return an
	}
	h.weak = h.weak - 1
	st64(a + 8, ah)
	st64(a, ap)
	return an
}

function fn_6c748(a: u64, b: u64, c: AccountInfo, d: AccountInfo, p5: u64, p6: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s30 = fp - 0x30, s58 = fp - 0x58, s60 = fp - 0x60, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sb0 = fp - 0xb0, sb8 = fp - 0xb8, sd0 = fp - 0xd0, s100 = fp - 0x100, s118 = fp - 0x118, s120 = fp - 0x120, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s1000 = fp - 0x1000
	let p, q, r, ak, al, am: u64
	let bg = b
	const f: LamportsCell = c.lamports
	const h = c.key
	const m = d.key
	rc_inc(f)
	const g: DataCell = c.data
	let bf = h
	const bd = p6
	const be = p5
	rc_inc(g)
	const i = bg
	const j = ld64(bg + 8)
	const l = ld64(bg)
	rc_inc(j)
	const k = ld64(i + 0x10)
	rc_inc(k)
	st64(s1000, 0, l, 8, 0)
	fn_134a08(sb8, m, bf, 0, 0, l, 8, 0)
	copy(sd0, sb0, 0x18)
	const n = ld64(sb8)
	if (n == 0x8000000000000000) {
		fn_13b430(s158, sd0)
		ak = ld64(s158 + 8)
		am = ld64(s158)
		al = a
		r = g
		q = k
		p = j
	} else {
		memcpy(s100, s98, 0x30)
		st64(s120, n)
		copy(s118, sd0, 0x18)
		const o: LamportsCell = c.lamports
		const x = c.key
		const t: AccountInfo = bg
		rc_inc(o)
		const s: DataCell = c.data
		rc_inc(s)
		const u: LamportsCell = t.lamports
		const az = t.key
		const ba = c.executable
		const bb = c.is_writable
		const bc = c.is_signer
		bf = c.rent_epoch
		const w = c.owner
		rc_inc(u)
		const v: DataCell = t.data
		rc_inc(v)
		const y: LamportsCell = d.lamports
		const au = d.key
		const av = t.executable
		const aw = t.is_writable
		const ax = t.is_signer
		const ay = t.rent_epoch
		bg = t.owner
		rc_inc(y)
		const z: DataCell = d.data
		rc_inc(z)
		const ad = d.owner
		const ac = d.rent_epoch
		const ab = d.is_signer
		const aa = d.is_writable
		st8(s30 + 2, d.executable)
		st8(s30, ab, aa)
		st64(s58, au, y, z, ad, ac)
		st8(s60, ax, aw, av)
		st64(s88, az, u, v, bg, ay)
		st8(s90, bc, bb, ba)
		st64(sb8, x, o, s, w, bf)
		st64(s28, be, bd)
		st64(s1000, s28, 1)
		fn_1390d8(s138, s120, sb8, 3, fp)
		if (ld64(s138) == 0x800000000000001a /* Ok */) {
			const af: DataCell = ld64(sb0 + 8)
			const ae: LamportsCell = ld64(sb0)
			rc_dec(ae)
			al = a
			rc_dec(af)
			const ah: DataCell = ld64(s88 + 0x10)
			const ag: LamportsCell = ld64(s88 + 8)
			rc_dec(ag)
			rc_dec(ah)
			const aj: DataCell = ld64(s58 + 0x10)
			const ai: LamportsCell = ld64(s58 + 8)
			rc_dec(ai)
			rc_dec(aj)
			rc_dec(j)
			rc_dec(k)
			rc_dec(f)
			ak = g.strong - 1
			g.strong = ak
			if (ak != 0) {
				st64(al + 8, ak)
				st64(al, 2)
				return al
			}
			ak = g.weak - 1
			g.weak = ak
			st64(al + 8, ak)
			st64(al, 2)
			return al
		}
		copyr(s18, s138, 0x18)
		fn_13b430(s148, s18)
		ak = ld64(s148 + 8)
		am = ld64(s148)
		const ao: DataCell = ld64(sb0 + 8)
		const an: LamportsCell = ld64(sb0)
		r = g
		q = k
		p = j
		rc_dec(an)
		al = a
		rc_dec(ao)
		const aq: DataCell = ld64(s88 + 0x10)
		const ap: LamportsCell = ld64(s88 + 8)
		rc_dec(ap)
		rc_dec(aq)
		const at: DataCell = ld64(s58 + 0x10)
		const ar: LamportsCell = ld64(s58 + 8)
		rc_dec(ar)
		rc_dec(at)
	}
	rc_dec(p)
	rc_dec(q)
	rc_dec(f)
	if (!rc_release(r)) {
		st64(al + 8, ak)
		st64(al, am)
		return al
	}
	st64(r + 8, ld64(r + 8) - 1)
	st64(al + 8, ak)
	st64(al, am)
	return al
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_bundle, position_bundle_mint, position_bundle_token_account
function fn_a5308(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78
	let n, p: u64
	fn_7f28(s28, ld64(b + 0x60), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const f = ld64(s28)
	if (f != 2) {
		n = Error_with_account_name(s38, f, ld64(s28 + 8), "position_bundle", 0xf)
		p = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, p)
		return n
	}
	const g = ld64(b + 0x58)
	if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
		const h = common_is_closed(g)
		if (h == 0) {
			fn_143448(s18, g, h)
			const j = ld64(s18 + 0x10)
			const i = ld64(s18)
			if (i != 0x800000000000001a /* Ok */) {
				const k = ld64(s18 + 8)
				st64(s18, i, k, j)
				fn_13b430(s48, s18)
				const l = ld64(s48)
				if (l != 2) {
					n = Error_with_account_name(s58, l, ld64(s48 + 8), "position_bundle_mint", 0x14)
					p = ld64(s58)
					st64(a + 8, ld64(s58 + 8))
					st64(a, p)
					return n
				}
			} else {
				st64(j, ld64(j) + 1)
			}
		}
	}
	const q = ld64(ld64(b + 0x68))
	const m = memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20)
	let o = undef
	n = m as u32
	if (n != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return n
	}
	n = common_is_closed(q)
	o = undef
	if (n != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return n
	}
	n = fn_143448(s18, q, n)
	o = ld64(s18 + 0x10)
	const r = ld64(s18)
	if (r != 0x800000000000001a /* Ok */) {
		const s = ld64(s18 + 8)
		st64(s18, r, s, o)
		n = fn_13b430(s68, s18)
		o = undef
		const t = ld64(s68)
		if (t == 2) {
			st64(a + 8, o)
			st64(a, 2)
			return n
		}
		n = Error_with_account_name(s78, t, ld64(s68 + 8), "position_bundle_token_account", 0x1d)
		p = ld64(s78)
		st64(a + 8, ld64(s78 + 8))
		st64(a, p)
		return n
	}
	st64(o, ld64(o) + 1)
	st64(a + 8, o)
	st64(a, 2)
	return n
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_bundle
function fn_a1098(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s88 = fp - 0x88, s89 = fp - 0x89, sb0 = fp - 0xb0, sc0 = fp - 0xc0, se8 = fp - 0xe8, s128 = fp - 0x128, s148 = fp - 0x148, s168 = fp - 0x168, s180 = fp - 0x180, s1b8 = fp - 0x1b8, s1c8 = fp - 0x1c8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s200 = fp - 0x200, s218 = fp - 0x218, s220 = fp - 0x220, s238 = fp - 0x238, s248 = fp - 0x248, s258 = fp - 0x258, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s300 = fp - 0x300, s308 = fp - 0x308, s338 = fp - 0x338, s340 = fp - 0x340, s348 = fp - 0x348, s350 = fp - 0x350
	let aw, dc, dd, de: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s2b8, f, b)
	if (g != 0) {
		const p = ld64(ld64(b + 0x10))
		st64(s300 + 0x30, p)
		const q = ld64(p)
		copyr(s38, q + 8, 0x18)
		st64(s300 + 0x38, q)
		st64(s40, ld64(q))
		const r = ld64(f)
		copyr(s238, r, 0x20)
		if ((memcmp(s40, s238, 0x20) as u32) == 0) {
			ErrorCode_name(s180, 0x100152d40)
			st64(sb0, 0, 1, 0)
			st64(s20, sb0, 0x100159480)
			st8(s20 + 0x18, 3)
			st64(s20 + 0x10, 0x20)
			st64(s38 + 8, 0)
			st64(s40, 0)
			if (ErrorCode_fmt(0x100152d40, s40) == 0) {
				copyr(s200, sb0, 0x18)
				copy(s218, s180, 0x18)
				st64(s238 + 8, 0x100154924)
				st32(s1b8 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s1e8, 2)
				st32(s220, 7)
				st64(s238 + 0x10, 0x41)
				st64(s238, 0)
				const ba = fn_13b3a8(s278, s238)
				const az = ld64(s278 + 8)
				const ay = ld64(s278)
				const ax = ld64(s300 + 0x38)
				copyr(s238, ax, 0x20)
				copy(s218, r, 0x20)
				de = fn_13b5c0(s288, ay, az, s238, ba)
				const bb = ld64(s288)
				st64(a + 8, ld64(s288 + 8))
				st64(a, bb)
				return de
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s238, 0x1001594b0, 0x1001594d0)
		}
		st64(s300 + 0x28, r)
		st64(s300 + 0x40, a)
		const s = ld64(b + 8)
		const t = __floatundidf(ld64(s) * 0x108)
		const u = fn_14f7f8(ld64(s + 8), t)
		const v = fn_151cb0(u, 0)
		const w = fn_14f3e8(u)
		const x = max((fn_151a40(u, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (v as i64) ? 0 : w, 1)
		let bd: AccountInfo = ld64(s2b8)
		let bj = ld64(s2b8 + 8)
		if (x > g) {
			const y: AccountInfo = ld64(s300 + 0x30)
			const z: LamportsCell = y.lamports
			rc_inc(z)
			const bc: DataCell = y.data
			rc_inc(bc)
			const be: LamportsCell = bd.lamports
			const bf = be.strong
			st64(s300 + 8, bd.key)
			st64(s300 + 0x10, y.executable)
			st64(s300 + 0x18, y.is_writable)
			st64(s300 + 0x20, y.is_signer)
			st64(s300 + 0x28, y.rent_epoch)
			const bi = y.owner
			rc_inc(be, bf)
			const bg: DataCell = bd.data
			const bh = bg.strong
			st64(s300 + 0x30, bi)
			rc_inc(bg, bh)
			const bk: AccountInfo = ld64(ld64(bj + 0x18))
			const bl: LamportsCell = bk.lamports
			const bm = bl.strong
			st64(s300, sat_sub(x, g))
			st64(s338 + 0x10, bd.executable)
			st64(s338 + 0x18, bd.is_writable)
			st64(s338 + 0x20, bd.is_signer)
			st64(s338 + 0x28, bd.rent_epoch)
			st64(s308, bd.owner)
			const bp = bk.key
			rc_inc(bl, bm)
			const bn: DataCell = bk.data
			const bo = bn.strong
			st64(s338, z, bp)
			rc_inc(bn, bo)
			st64(s340, bk.owner)
			const bt = bk.rent_epoch
			const bs = bk.is_signer
			const br = bk.is_writable
			const bq = bk.executable
			st8(se8 + 0x22, ld64(s338 + 0x10))
			st8(se8 + 0x21, ld64(s338 + 0x18))
			st8(se8 + 0x20, ld64(s338 + 0x20))
			st64(se8 + 0x18, ld64(s338 + 0x28))
			st64(se8 + 0x10, ld64(s308))
			st64(se8, be, bg)
			st64(s128 + 0x38, ld64(s300 + 8))
			st8(s128 + 0x32, ld64(s300 + 0x10))
			st8(s128 + 0x31, ld64(s300 + 0x18))
			st8(s128 + 0x30, ld64(s300 + 0x20))
			st64(s128 + 0x28, ld64(s300 + 0x28))
			st64(s128 + 0x20, ld64(s300 + 0x30))
			st64(s128 + 0x18, bc)
			st64(s128 + 0x10, ld64(s338))
			st64(s128 + 8, ld64(s300 + 0x38))
			st8(s128, bs, br, bq)
			st64(s148 + 0x18, bt)
			st64(s148 + 0x10, ld64(s340))
			st64(s148, bl, bn)
			st64(s168 + 0x18, ld64(s338 + 8))
			st64(sc0, 8, 0)
			st64(s168, 0, 8, 0)
			de = fn_13d318(s248, s168, ld64(s300))
			aw = ld64(s248)
			if (aw != 2) {
				dd = ld64(s248 + 8)
				dc = ld64(s300 + 0x40)
				st64(dc, aw, dd)
				return de
			}
			bd = ld64(s2b8)
			st64(s300 + 0x28, bd.key)
			bj = ld64(s2b8 + 8)
		}
		const bu: LamportsCell = bd.lamports
		rc_inc(bu)
		const bv: DataCell = bd.data
		rc_inc(bv)
		const bw: AccountInfo = ld64(ld64(bj + 0x18))
		const bx: LamportsCell = bw.lamports
		const by = bx.strong
		st64(s300 + 0x20, bd.executable)
		st64(s300 + 0x30, bd.is_writable)
		st64(s300 + 0x38, bd.is_signer)
		const cc = bd.rent_epoch
		const cd = bd.owner
		const cb = bw.key
		rc_inc(bx, by)
		const bz: DataCell = bw.data
		const ca = bz.strong
		st64(s308, cb, cc, cd, bv, bu)
		rc_inc(bz, ca)
		st64(s338 + 0x28, bw.owner)
		st64(s338 + 0x20, bw.rent_epoch)
		const ci = bw.is_signer
		const ch = bw.is_writable
		const cg = bw.executable
		const ce = ld64(s2b8 + 8)
		const cf = ld64(ld64(ce + 0x20))
		copyr(sb0, cf, 0x20)
		const cj = ld8(ld64(ce + 0x28))
		st64(s20, s89)
		st64(s38 + 8, sb0)
		st64(s40, 0x100152e73)
		st64(s180, s40)
		st64(s1c8 + 8, s180)
		st8(s1c8, ci, ch, cg)
		st64(s1e8 + 0x18, ld64(s338 + 0x20))
		st64(s1e8 + 0x10, ld64(s338 + 0x28))
		st64(s1e8, bx, bz)
		st64(s1f8 + 8, ld64(s308))
		st8(s1f8 + 2, ld64(s300 + 0x20))
		st8(s1f8 + 1, ld64(s300 + 0x30))
		st8(s1f8, ld64(s300 + 0x38))
		st64(s200, ld64(s300))
		st64(s218 + 0x10, ld64(s300 + 8))
		st64(s218 + 8, ld64(s300 + 0x10))
		st64(s218, ld64(s300 + 0x18))
		st64(s220, ld64(s300 + 0x28))
		st64(s300 + 0x38, cj)
		st8(s89, cj)
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 0xf)
		st64(s180 + 8, 3)
		st64(s1b8, 1)
		st64(s238, 0, 8, 0)
		de = fn_13c8b8(s258, s238, 0x88)
		aw = ld64(s258)
		if (aw != 2) {
			dd = ld64(s258 + 8)
			dc = ld64(s300 + 0x40)
			st64(dc, aw, dd)
			return de
		}
		const ck: AccountInfo = ld64(s2b8)
		const cl: LamportsCell = ck.lamports
		const cs = ck.key
		rc_inc(cl)
		const cm: DataCell = ck.data
		rc_inc(cm)
		const cn: LamportsCell = bw.lamports
		const co = cn.strong
		st64(s300 + 0x10, bw.key)
		st64(s300 + 0x18, ck.executable)
		st64(s300 + 0x20, ck.is_writable)
		st64(s300 + 0x28, ck.is_signer)
		st64(s300 + 0x30, ck.rent_epoch)
		const cr = ck.owner
		rc_inc(cn, co)
		const cp: DataCell = bw.data
		const cq = cp.strong
		st64(s308, cr, cs, cl)
		rc_inc(cp, cq)
		const cx = bw.owner
		const cw = bw.rent_epoch
		const cv = bw.is_signer
		const cu = bw.is_writable
		const ct = bw.executable
		copyr(sb0, cf, 0x20)
		st64(s20, s89)
		st64(s38 + 8, sb0)
		st64(s40, 0x100152e73)
		st64(s180, s40)
		st64(s1c8 + 8, s180)
		st8(s1c8, cv, cu, ct)
		st64(s1e8, cn, cp, cx, cw)
		st64(s1f8 + 8, ld64(s300 + 0x10))
		st8(s1f8 + 2, ld64(s300 + 0x18))
		st8(s1f8 + 1, ld64(s300 + 0x20))
		st8(s1f8, ld64(s300 + 0x28))
		st64(s200, ld64(s300 + 0x30))
		st64(s218 + 0x10, ld64(s308))
		st64(s218 + 8, cm)
		copyr(s220, s300, 0x10)
		st8(s89, ld64(s300 + 0x38))
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 0xf)
		st64(s180 + 8, 3)
		st64(s1b8, 1)
		st64(s238, 0, 8, 0)
		de = fn_13cc48(s268, s238, ld64(ld64(ld64(s2b8 + 8) + 0x30)))
		aw = ld64(s268)
		if (aw != 2) {
			dd = ld64(s268 + 8)
			dc = ld64(s300 + 0x40)
			st64(dc, aw, dd)
			return de
		}
	} else {
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0x108)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const ad = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		const m = ld64(s2b8 + 8)
		const n: AccountInfo = ld64(ld64(m + 0x10))
		const o: LamportsCell = n.lamports
		const aa = n.key
		const ae = ld64(s2b8)
		rc_inc(o)
		st64(s300 + 0x38, aa)
		const ab: DataCell = n.data
		const ac = ab.strong
		st64(s300 + 0x30, ab)
		rc_inc(ab, ac)
		const af = ld64(ae + 8)
		const ag = ld64(af)
		st64(s300, ld64(ae))
		st64(s300 + 8, n.executable)
		st64(s300 + 0x10, n.is_writable)
		st64(s300 + 0x18, n.is_signer)
		st64(s300 + 0x20, n.rent_epoch)
		st64(s300 + 0x28, n.owner)
		rc_inc(af, ag)
		const ah = ld64(ae + 0x10)
		rc_inc(ah)
		const ai: AccountInfo = ld64(ld64(m + 0x18))
		const aj: LamportsCell = ai.lamports
		const ak = aj.strong
		st64(s308, o)
		const al: AccountInfo = ld64(s2b8)
		st64(s338 + 8, al.executable)
		st64(s338 + 0x10, al.is_writable)
		st64(s338 + 0x18, al.is_signer)
		st64(s338 + 0x20, al.rent_epoch)
		st64(s338 + 0x28, al.owner)
		const ao = ai.key
		rc_inc(aj, ak)
		const am: DataCell = ai.data
		const an = am.strong
		st64(s340, ao, ad)
		st64(s300 + 0x40, a)
		rc_inc(am, an)
		st64(s348, ai.owner)
		st64(s350, ai.rent_epoch)
		const av = ai.is_signer
		const au = ai.is_writable
		const at = ai.executable
		const ap = ld64(s2b8 + 8)
		const aq = ld64(ld64(ap + 0x20))
		copyr(sb0, aq, 0x20)
		const ar = ld8(ld64(ap + 0x28))
		st64(s20, s89)
		st64(s38 + 8, sb0)
		st64(s40, 0x100152e73)
		st8(s89, ar)
		st64(s180, s40)
		st64(s1b8 + 0x28, s180)
		st8(s1b8 + 0x22, ld64(s338 + 8))
		st8(s1b8 + 0x21, ld64(s338 + 0x10))
		st8(s1b8 + 0x20, ld64(s338 + 0x18))
		st64(s1b8 + 0x18, ld64(s338 + 0x20))
		st64(s1b8 + 0x10, ld64(s338 + 0x28))
		st64(s1b8, af, ah)
		st64(s1c8 + 8, ld64(s300))
		st8(s1c8 + 2, ld64(s300 + 8))
		st8(s1c8 + 1, ld64(s300 + 0x10))
		st8(s1c8, ld64(s300 + 0x18))
		st64(s1e8 + 0x18, ld64(s300 + 0x20))
		st64(s1e8 + 0x10, ld64(s300 + 0x28))
		st64(s1e8 + 8, ld64(s300 + 0x30))
		st64(s1e8, ld64(s308))
		st64(s1f8 + 8, ld64(s300 + 0x38))
		st8(s1f8, av, au, at)
		st64(s200, ld64(s350))
		st64(s218 + 0x10, ld64(s348))
		st64(s218, aj, am)
		st64(s220, ld64(s340))
		st64(s20 + 8, 1)
		st64(s38 + 0x10, 0x20)
		st64(s38, 0xf)
		st64(s180 + 8, 3)
		st64(s1b8 + 0x30, 1)
		st64(s238, 0, 8, 0)
		de = fn_13cfd8(s298, s238, ld64(s338), 0x88, ld64(ld64(ap + 0x30)))
		aw = ld64(s298)
		if (aw != 2) {
			dd = ld64(s298 + 8)
			dc = ld64(s300 + 0x40)
			st64(dc, aw, dd)
			return de
		}
	}
	const da = ld64(s300 + 0x40)
	fn_3240(s88, ld64(s2b8))
	if (ld64(s88) == 0) {
		de = Error_with_account_name(s2a8, ld64(s88 + 8), ld64(s88 + 0x10), "position_bundle", 0xf)
		const db = ld64(s2a8)
		st64(da + 8, ld64(s2a8 + 8))
		st64(da, db)
		return de
	}
	const cy = ld64(0x300000000 /* heap bump-allocator cursor */)
	const cz = cy != 0 ? sat_sub(cy, 0x48) & -8 : 0x300007fb8
	if (cz > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, cz)
		de = memcpy(cz, s88, 0x48)
		st64(da + 8, cz)
		st64(da, 2)
		return de
	}
	alloc_handle_alloc_error(8, 0x48)
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

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_bundle_mint
function fn_a2b38(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s58 = fp - 0x58, s68 = fp - 0x68, s80 = fp - 0x80, s98 = fp - 0x98, sa0 = fp - 0xa0, sc0 = fp - 0xc0, se0 = fp - 0xe0, sf0 = fp - 0xf0, s118 = fp - 0x118, s158 = fp - 0x158, s178 = fp - 0x178, s198 = fp - 0x198, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d8 = fp - 0x1d8, s1f0 = fp - 0x1f0, s1f8 = fp - 0x1f8, s218 = fp - 0x218, s220 = fp - 0x220, s228 = fp - 0x228, s230 = fp - 0x230, s248 = fp - 0x248, s260 = fp - 0x260, s268 = fp - 0x268, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s330 = fp - 0x330, s338 = fp - 0x338, s378 = fp - 0x378, s380 = fp - 0x380
	let av, ax, dt, du, dv: u64
	const f = ld64(ld64(b))
	const g = fn_143100(f, b, c, d, e)
	st64(s2f8, b, f)
	if (g != 0) {
		const p = ld64(ld64(b + 0x10))
		st64(s330 + 0x18, p)
		const q = ld64(p)
		copyr(s38, q + 8, 0x18)
		st64(s330 + 0x20, q)
		st64(s40, ld64(q))
		const r = ld64(f)
		copyr(s260, r + 8, 0x18)
		st64(s330 + 0x28, r)
		st64(s268, ld64(r))
		if ((memcmp(s40, s268, 0x20) as u32) == 0) {
			ErrorCode_name(s1b0, 0x100152d40)
			st64(s58, 0, 1, 0)
			st64(s20, s58, 0x100159480)
			st8(s20 + 0x18, 3)
			st64(s20 + 0x10, 0x20)
			st64(s38 + 8, 0)
			st64(s40, 0)
			if (ErrorCode_fmt(0x100152d40, s40) == 0) {
				copyr(s230, s58, 0x18)
				copy(s248, s1b0, 0x18)
				st64(s260, 0x100154924)
				st32(s1d8 + 8, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
				st8(s218, 2)
				st32(s260 + 0x10, 7)
				st64(s260 + 8, 0x41)
				st64(s268, 0)
				const bc = fn_13b3a8(s2a8, s268)
				const bb = ld64(s2a8 + 8)
				const ba = ld64(s2a8)
				const ay = ld64(s330 + 0x20)
				copyr(s268, ay, 0x20)
				const az = ld64(s330 + 0x28)
				copy(s248, az, 0x20)
				dv = fn_13b5c0(s2b8, ba, bb, s268, bc)
				const bd = ld64(s2b8)
				st64(a + 0x10, ld64(s2b8 + 8))
				st64(a + 8, bd)
				st32(a, 2)
				return dv
			}
			fn_149678("a Display implementation returned an error unexpectedly", 0x37, s268, 0x1001594b0, 0x1001594d0)
		}
		st64(s330 + 0x30, a)
		const s = ld64(b + 8)
		const t = __floatundidf(ld64(s) * 0xd2)
		const u = fn_14f7f8(ld64(s + 8), t)
		const v = fn_151cb0(u, 0)
		const w = fn_14f3e8(u)
		const x = max((fn_151a40(u, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (v as i64) ? 0 : w, 1)
		if (x > g) {
			const bf: AccountInfo = ld64(s2f8 + 8)
			const bl = ld64(s2f8)
			const y: AccountInfo = ld64(s330 + 0x18)
			const z: LamportsCell = y.lamports
			rc_inc(z)
			const be: DataCell = y.data
			rc_inc(be)
			const bg: LamportsCell = bf.lamports
			const bh = bg.strong
			st64(s338, bf.key)
			st64(s330, y.executable)
			st64(s330 + 8, y.is_writable)
			st64(s330 + 0x10, y.is_signer)
			st64(s330 + 0x28, y.rent_epoch)
			const bk = y.owner
			rc_inc(bg, bh)
			const bi: DataCell = bf.data
			const bj = bi.strong
			st64(s330 + 0x18, bk)
			rc_inc(bi, bj)
			const bm: AccountInfo = ld64(ld64(bl + 0x18))
			const bn: LamportsCell = bm.lamports
			const bo = bn.strong
			st64(s378 + 0x38, sat_sub(x, g))
			st64(s378 + 0x10, bf.executable)
			st64(s378 + 0x18, bf.is_writable)
			st64(s378 + 0x20, bf.is_signer)
			st64(s378 + 0x28, bf.rent_epoch)
			st64(s378 + 0x30, bf.owner)
			const br = bm.key
			rc_inc(bn, bo)
			const bp: DataCell = bm.data
			const bq = bp.strong
			st64(s378, z, br)
			rc_inc(bp, bq)
			st64(s380, bm.owner)
			const bv = bm.rent_epoch
			const bu = bm.is_signer
			const bt = bm.is_writable
			const bs = bm.executable
			st8(s118 + 0x22, ld64(s378 + 0x10))
			st8(s118 + 0x21, ld64(s378 + 0x18))
			st8(s118 + 0x20, ld64(s378 + 0x20))
			st64(s118 + 0x18, ld64(s378 + 0x28))
			st64(s118 + 0x10, ld64(s378 + 0x30))
			st64(s118, bg, bi)
			st64(s158 + 0x38, ld64(s338))
			st8(s158 + 0x32, ld64(s330))
			st8(s158 + 0x31, ld64(s330 + 8))
			st8(s158 + 0x30, ld64(s330 + 0x10))
			st64(s158 + 0x28, ld64(s330 + 0x28))
			st64(s158 + 0x20, ld64(s330 + 0x18))
			st64(s158 + 0x18, be)
			st64(s158 + 0x10, ld64(s378))
			st64(s158 + 8, ld64(s330 + 0x20))
			st8(s158, bu, bt, bs)
			st64(s178 + 0x18, bv)
			st64(s178 + 0x10, ld64(s380))
			st64(s178, bn, bp)
			st64(s198 + 0x18, ld64(s378 + 8))
			st64(sf0, 8, 0)
			st64(s198, 0, 8, 0)
			dv = fn_13d318(s278, s198, ld64(s378 + 0x38))
			ax = ld64(s278)
			if (ax != 2) {
				du = ld64(s278 + 8)
				dt = ld64(s330 + 0x30)
				st64(dt + 8, ax, du)
				st32(dt, 2)
				return dv
			}
			st64(s330 + 0x28, ld64(ld64(s2f8 + 8)))
		}
		const bw = ld64(ld64(s2f8 + 8) + 8)
		rc_inc(bw)
		const bx = ld64(ld64(s2f8 + 8) + 0x10)
		rc_inc(bx)
		const by: AccountInfo = ld64(ld64(ld64(s2f8) + 0x18))
		const bz: LamportsCell = by.lamports
		const ca = bz.strong
		const cb: AccountInfo = ld64(s2f8 + 8)
		st64(s330 + 0x10, cb.executable)
		st64(s330 + 0x18, cb.is_writable)
		st64(s330 + 0x20, cb.is_signer)
		const cf = cb.rent_epoch
		const ck = cb.owner
		const ce = by.key
		rc_inc(bz, ca)
		st64(s330 + 8, bx)
		const cc: DataCell = by.data
		const cd = cc.strong
		st64(s338, cf, bw)
		rc_inc(cc, cd)
		const cj = by.owner
		const ci = by.rent_epoch
		const ch = by.is_signer
		const cg = by.is_writable
		st8(s1f8 + 2, by.executable)
		st8(s1f8, ch, cg)
		st64(s220, ce, bz, cc, cj, ci)
		st8(s228 + 2, ld64(s330 + 0x10))
		st8(s228 + 1, ld64(s330 + 0x18))
		st8(s228, ld64(s330 + 0x20))
		st64(s230, ld64(s338))
		st64(s248 + 0x10, ck)
		copyr(s248, s330, 0x10)
		st64(s260 + 0x10, ld64(s330 + 0x28))
		st64(s1f0, 8, 0)
		st64(s268, 0, 8, 0)
		dv = fn_13c8b8(s288, s268, 0x52)
		ax = ld64(s288)
		if (ax != 2) {
			du = ld64(s288 + 8)
			dt = ld64(s330 + 0x30)
			st64(dt + 8, ax, du)
			st32(dt, 2)
			return dv
		}
		const cl: AccountInfo = ld64(s2f8 + 8)
		const cm: LamportsCell = cl.lamports
		const ct = cl.key
		rc_inc(cm)
		const cn: DataCell = cl.data
		rc_inc(cn)
		const co: LamportsCell = by.lamports
		const cp = co.strong
		st64(s330 + 0x10, by.key)
		st64(s330 + 0x18, cl.executable)
		st64(s330 + 0x20, cl.is_writable)
		st64(s330 + 0x28, cl.is_signer)
		const cq = cl.rent_epoch
		const cy = cl.owner
		rc_inc(co, cp)
		st64(s330, cq)
		const cr: DataCell = by.data
		const cs = cr.strong
		st64(s330 + 8, ct)
		rc_inc(cr, cs)
		const cx = by.owner
		const cw = by.rent_epoch
		const cv = by.is_signer
		const cu = by.is_writable
		st8(s1f8 + 2, by.executable)
		st8(s1f8, cv, cu)
		st64(s218, co, cr, cx, cw)
		st64(s220, ld64(s330 + 0x10))
		st8(s228 + 2, ld64(s330 + 0x18))
		st8(s228 + 1, ld64(s330 + 0x20))
		st8(s228, ld64(s330 + 0x28))
		st64(s230, ld64(s330))
		st64(s248, cm, cn, cy)
		st64(s260 + 0x10, ld64(s330 + 8))
		st64(s1f0, 8, 0)
		st64(s268, 0, 8, 0)
		av = ld64(ld64(s2f8) + 0x20)
		const cz = ld64(ld64(av))
		copyr(s40, cz, 0x20)
		dv = fn_13cc48(s298, s268, s40)
		ax = ld64(s298)
		if (ax != 2) {
			du = ld64(s298 + 8)
			dt = ld64(s330 + 0x30)
			st64(dt + 8, ax, du)
			st32(dt, 2)
			return dv
		}
	} else {
		const h = ld64(b + 8)
		const i = __floatundidf(ld64(h) * 0xd2)
		const j = fn_14f7f8(ld64(h + 8), i)
		const k = fn_151cb0(j, 0)
		const l = fn_14f3e8(j)
		const af = (fn_151a40(j, 0x43efffffffffffff) as i64) > 0 ? 0xffffffffffffffff : 0 > (k as i64) ? 0 : l
		st64(s330 + 0x30, a)
		const m = ld64(s2f8)
		const n: AccountInfo = ld64(ld64(m + 0x10))
		const o: LamportsCell = n.lamports
		const aj = n.key
		const ab: AccountInfo = ld64(s2f8 + 8)
		rc_inc(o)
		const aa: DataCell = n.data
		rc_inc(aa)
		const ac: LamportsCell = ab.lamports
		st64(s330 + 0x28, ac)
		const ad = ac.strong
		st64(s338, ab.key)
		st64(s330, n.executable)
		st64(s330 + 8, n.is_writable)
		st64(s330 + 0x10, n.is_signer)
		st64(s330 + 0x18, n.rent_epoch)
		st64(s330 + 0x20, n.owner)
		rc_inc(ld64(s330 + 0x28), ad)
		const ae: DataCell = ab.data
		rc_inc(ae)
		st64(s378 + 0x28, aa)
		st64(s378 + 0x38, af)
		const ag: AccountInfo = ld64(ld64(m + 0x18))
		const ah: LamportsCell = ag.lamports
		const ai = ah.strong
		st64(s378 + 0x30, aj)
		st64(s378 + 0x18, ab.executable)
		st64(s378 + 0x20, ab.is_writable)
		const ap = ab.is_signer
		const ak = ab.rent_epoch
		const al = ab.owner
		const ao = ag.key
		rc_inc(ah, ai)
		st64(s378, al, ak)
		const am: DataCell = ag.data
		const an = am.strong
		st64(s378 + 0x10, ao)
		rc_inc(am, an)
		st64(s380, ag.owner)
		const au = ag.rent_epoch
		const at = ag.is_signer
		const ar = ag.is_writable
		const aq = ag.executable
		st8(s1d8 + 0x12, ld64(s378 + 0x18))
		st8(s1d8 + 0x11, ld64(s378 + 0x20))
		st8(s1d8 + 0x10, ap)
		copyr(s1d8, s378, 0x10)
		st64(s1f0 + 0x10, ae)
		st64(s1f0 + 8, ld64(s330 + 0x28))
		st64(s1f0, ld64(s338))
		st8(s1f8 + 2, ld64(s330))
		st8(s1f8 + 1, ld64(s330 + 8))
		st8(s1f8, ld64(s330 + 0x10))
		st64(s218 + 0x18, ld64(s330 + 0x18))
		st64(s218 + 0x10, ld64(s330 + 0x20))
		st64(s218 + 8, ld64(s378 + 0x28))
		st64(s218, o)
		st64(s220, ld64(s378 + 0x30))
		st8(s228, at, ar, aq)
		st64(s230, au)
		st64(s248 + 0x10, ld64(s380))
		st64(s248, ah, am)
		st64(s260 + 0x10, ld64(s378 + 0x10))
		st64(s1c0, 8, 0)
		st64(s268, 0, 8, 0)
		av = ld64(ld64(s2f8) + 0x20)
		const aw = ld64(ld64(av))
		copyr(s40, aw, 0x20)
		dv = fn_13cfd8(s2c8, s268, ld64(s378 + 0x38), 0x52, s40)
		ax = ld64(s2c8)
		if (ax != 2) {
			du = ld64(s2c8 + 8)
			dt = ld64(s330 + 0x30)
			st64(dt + 8, ax, du)
			st32(dt, 2)
			return dv
		}
	}
	const da: AccountInfo = ld64(av)
	const db: LamportsCell = da.lamports
	const dd: AccountInfo = ld64(s2f8 + 8)
	const dj = da.key
	rc_inc(db)
	const dc: DataCell = da.data
	rc_inc(dc)
	const de: LamportsCell = dd.lamports
	const df = de.strong
	st64(s330 + 0x10, dd.key)
	st64(s330 + 0x18, da.executable)
	st64(s330 + 0x20, da.is_writable)
	st64(s330 + 0x28, da.is_signer)
	const dp = da.rent_epoch
	const di = da.owner
	rc_inc(de, df)
	st64(s330 + 8, db)
	const dg: DataCell = dd.data
	const dh = dg.strong
	st64(s338, dc, dj)
	rc_inc(dg, dh)
	const dn = dd.owner
	const dm = dd.rent_epoch
	const dl = dd.is_signer
	const dk = dd.is_writable
	st8(sa0 + 2, dd.executable)
	st8(sa0, dl, dk)
	st64(sc0, de, dg, dn, dm)
	st64(se0 + 0x18, ld64(s330 + 0x10))
	st8(s80 + 0x12, ld64(s330 + 0x18))
	st8(s80 + 0x11, ld64(s330 + 0x20))
	st8(s80 + 0x10, ld64(s330 + 0x28))
	st64(s80, di, dp)
	st64(s98 + 0x10, ld64(s338))
	copyr(s98, s330, 0x10)
	st64(s68, 8, 0)
	st64(se0, 0, 8, 0)
	const dq = ld64(ld64(ld64(ld64(s2f8) + 0x28)))
	copyr(s268, dq, 0x20)
	dv = fn_127828(s2d8, se0, 0, s268, 0)
	ax = ld64(s2d8)
	if (ax == 2) {
		Account_try_from(s268, dd)
		const dr = ld64(s330 + 0x30)
		if (ld32(s268) == 2) {
			dv = Error_with_account_name(s2e8, ld64(s260), ld64(s260 + 8), "position_bundle_mint", 0x14)
			const ds = ld64(s2e8)
			st64(dr + 0x10, ld64(s2e8 + 8))
			st64(dr + 8, ds)
			st32(dr, 2)
			return dv
		}
		return memcpy(dr, s268, 0x60)
	}
	du = ld64(s2d8 + 8)
	dt = ld64(s330 + 0x30)
	st64(dt + 8, ax, du)
	st32(dt, 2)
	return dv
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: position_bundle_token_account
function fn_a4608(a: u64, b: u64): u64 {
	const sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd0 = fp - 0xd0, sf8 = fp - 0xf8, s100 = fp - 0x100, s128 = fp - 0x128, s130 = fp - 0x130, s158 = fp - 0x158, s160 = fp - 0x160, s188 = fp - 0x188, s190 = fp - 0x190, s1b8 = fp - 0x1b8, s1c0 = fp - 0x1c0, s1e8 = fp - 0x1e8, s1f0 = fp - 0x1f0, s218 = fp - 0x218, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250
	const f: AccountInfo = ld64(ld64(b + 8))
	const g: LamportsCell = f.lamports
	const m: AccountInfo = ld64(ld64(b))
	const p = f.key
	rc_inc(g)
	const h: DataCell = f.data
	rc_inc(h)
	const i: AccountInfo = ld64(ld64(b + 0x10))
	const j: LamportsCell = i.lamports
	const br = f.executable
	const bs = f.is_writable
	const bt = f.is_signer
	const bu = f.rent_epoch
	const bv = f.owner
	const l = i.key
	rc_inc(j)
	const k: DataCell = i.data
	rc_inc(k)
	const n: LamportsCell = m.lamports
	const bl = m.key
	const bm = i.executable
	const bn = i.is_writable
	const bo = i.is_signer
	const bp = i.rent_epoch
	const bq = i.owner
	rc_inc(n)
	const o: DataCell = m.data
	rc_inc(o)
	const q: AccountInfo = ld64(ld64(b + 0x18))
	const r: LamportsCell = q.lamports
	const bg = m.executable
	const bh = m.is_writable
	const bi = m.is_signer
	const bj = m.rent_epoch
	const bk = m.owner
	const bf = q.key
	rc_inc(r)
	const s: DataCell = q.data
	rc_inc(s)
	const t: AccountInfo = ld64(ld64(b + 0x20) + 0x58)
	const u: LamportsCell = t.lamports
	const ba = q.executable
	const bb = q.is_writable
	const bc = q.is_signer
	const bd = q.rent_epoch
	const be = q.owner
	const az = t.key
	rc_inc(u)
	const v: DataCell = t.data
	rc_inc(v)
	const w: AccountInfo = ld64(ld64(b + 0x28))
	const x: LamportsCell = w.lamports
	const av = t.executable
	const aw = t.is_writable
	const ax = t.is_signer
	const ay = t.rent_epoch
	const ad = t.owner
	const au = w.key
	rc_inc(x)
	const y: DataCell = w.data
	rc_inc(y)
	const z: AccountInfo = ld64(ld64(b + 0x30))
	const aa: LamportsCell = z.lamports
	const ap = w.executable
	const aq = w.is_writable
	const ar = w.is_signer
	const at = w.rent_epoch
	const ab = w.owner
	const ai = z.key
	rc_inc(aa)
	const ac: DataCell = z.data
	rc_inc(ac)
	const ah = z.owner
	const ag = z.rent_epoch
	const af = z.is_signer
	const ae = z.is_writable
	st8(sd0 + 2, z.executable)
	st8(sd0, af, ae)
	st64(sf8, ai, aa, ac, ah, ag)
	st8(s100, ar, aq, ap)
	st64(s128, au, x, y, ab, at)
	st8(s130, ax, aw, av)
	st64(s158, az, u, v, ad, ay)
	st8(s160, bc, bb, ba)
	st64(s188, bf, r, s, be, bd)
	st8(s190, bi, bh, bg)
	st64(s1b8, bl, n, o, bk, bj)
	st8(s1c0, bo, bn, bm)
	st64(s1e8, l, j, k, bq, bp)
	st8(s1f0, bt, bs, br)
	st64(s218, p, g, h, bv, bu)
	st64(sc8, 8, 0)
	st64(s230, 0, 8, 0)
	let ao = associated_token_create(s240, s230)
	const aj = ld64(s240)
	if (aj != 2) {
		const al = ld64(s240 + 8)
		st64(a, aj, al)
		return ao
	}
	Account_try_from_unchecked(sb8, m)
	if (ld32(sb8 + 0x90) == 2) {
		ao = Error_with_account_name(s250, ld64(sb8), ld64(sb8 + 8), "position_bundle_token_account", 0x1d)
		const ak = ld64(s250)
		st64(a + 8, ld64(s250 + 8))
		st64(a, ak)
		return ao
	}
	const am = ld64(0x300000000 /* heap bump-allocator cursor */)
	const an = am != 0 ? sat_sub(am, 0xb8) & -8 : 0x300007f48
	if (an > 0x300000007) {
		st64(0x300000000 /* heap bump-allocator cursor */, an)
		ao = memcpy(an, sb8, 0xb8)
		st64(a + 8, an)
		st64(a, 2)
		return ao
	}
	alloc_handle_alloc_error(8, 0xb8)
}

function fn_135038(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s80 = fp - 0x80
	let i, j, r, s, t: u64
	if ((memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
	} else {
		const f = p7
		let k = p6
		const u = p5
		st64(s50 + 8, p8)
		st32(s50, 7)
		fn_133ce0(s80, s50)
		let g = f + 3
		if (g == 0) {
			st64(s68, 0, 1, 0)
			copyr(s50, c, 0x20)
			fn_133b80(s68)
			g = ld64(s68)
			i = ld64(s68 + 8)
		} else {
			const h = g
			if (g > 0x3c3c3c3c3c3c3c3) {
				raw_vec_handle_error(0, h * 0x22, r, s, t)
			}
			i = __rust_alloc(h * 0x22, 1)
			if (i == 0) {
				raw_vec_handle_error(1, h * 0x22, r, s, t)
			}
			st64(s68, g, i)
			copyr(s50, c, 0x20)
		}
		st64(i + 0x18, ld64(s38))
		st64(i + 0x10, ld64(s40))
		st64(i + 8, ld64(s50 + 8))
		st64(i, ld64(s50))
		st16(i + 0x20, 0x100)
		st64(s68 + 0x10, 1)
		if (g == 1) {
			fn_133b80(s68, j)
			g = ld64(s68)
			i = ld64(s68 + 8)
		}
		st64(i + 0x3a, ld64(d + 0x18))
		st64(i + 0x32, ld64(d + 0x10))
		st64(i + 0x2a, ld64(d + 8))
		st64(i + 0x22, ld64(d))
		st16(i + 0x42, 0x100)
		st64(s68 + 0x10, 2)
		if (g == 2) {
			fn_133b80(s68, d)
			i = ld64(s68 + 8)
		}
		st64(i + 0x5c, ld64(u + 0x18))
		st64(i + 0x54, ld64(u + 0x10))
		st64(i + 0x4c, ld64(u + 8))
		st64(i + 0x44, ld64(u))
		st8(i + 0x64, f == 0, 0)
		st64(s68 + 0x10, 3)
		if (f != 0) {
			let n = 3
			let l = 0
			let o = f << 3
			do {
				const p = ld64(k)
				copyr(s40, p + 0x10, 0x10)
				const q = ld64(p + 8)
				st64(s50 + 8, q)
				st64(s50, ld64(p))
				if (n == ld64(s68)) {
					fn_133b80(s68, q)
					i = ld64(s68 + 8)
				}
				k = k + 8
				const m = i + l
				st64(m + 0x7e, ld64(s38))
				st64(m + 0x76, ld64(s40))
				st64(m + 0x6e, ld64(s50 + 8))
				st64(m + 0x66, ld64(s50))
				st16(m + 0x86, 1)
				l = l + 0x22
				n = n + 1
				st64(s68 + 0x10, n)
				o = o - 8
			} while (o != 0)
		}
		copyr(s20, b, 0x20)
		copy(s50, s68, 0x18)
		copy(s38, s80, 0x18)
		memcpy(a, s50, 0x50)
	}
}

function fn_134a08(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64) {
	const s20 = fp - 0x20, s38 = fp - 0x38, s40 = fp - 0x40, s50 = fp - 0x50, s68 = fp - 0x68, s80 = fp - 0x80, s88 = fp - 0x88, s90 = fp - 0x90, s98 = fp - 0x98, sa0 = fp - 0xa0
	let k, l, t, u, v: u64
	let x = ld64(sa0)
	let y = ld64(s98)
	let z = ld64(s90)
	let aa = ld64(s88)
	if ((memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0) {
		st64(a, 0x8000000000000000, 0x8000000000000006 /* Err(ProgramError::IncorrectProgramId) */)
	} else {
		const h = p8
		let m = p7
		const w = p6
		const g = p5
		let f = 0
		if (d != 0) {
			aa = ld64(d + 0x18)
			z = ld64(d + 0x10)
			y = ld64(d + 8)
			x = ld64(d)
			f = 1
		}
		st32(s50 + 0xc, f)
		st8(s50 + 8, g)
		st64(s40, x, y, z, aa)
		st32(s50, 6)
		fn_133ce0(s80, s50)
		let i = h + 3
		if (i == 0) {
			st64(s68, 0, 1, 0)
			copyr(s50, c, 0x20)
			fn_133b80(s68, c)
			l = undef
			i = ld64(s68)
			k = ld64(s68 + 8)
		} else {
			const j = i
			if (i > 0x3c3c3c3c3c3c3c3) {
				raw_vec_handle_error(0, j * 0x22, t, u, v)
			}
			k = __rust_alloc(j * 0x22, 1)
			if (k == 0) {
				raw_vec_handle_error(1, j * 0x22, t, u, v)
			}
			st64(s68, i, k)
			l = c
			copyr(s50, c, 0x20)
		}
		st64(k + 0x18, ld64(s38))
		st64(k + 0x10, ld64(s40))
		st64(k + 8, ld64(s50 + 8))
		st64(k, ld64(s50))
		st16(k + 0x20, 0x100)
		st64(s68 + 0x10, 1)
		if (i == 1) {
			fn_133b80(s68, l)
			k = ld64(s68 + 8)
		}
		st64(k + 0x3a, ld64(w + 0x18))
		st64(k + 0x32, ld64(w + 0x10))
		st64(k + 0x2a, ld64(w + 8))
		st64(k + 0x22, ld64(w))
		st8(k + 0x42, h == 0, 0)
		st64(s68 + 0x10, 2)
		if (h != 0) {
			let p = 2
			let n = 0
			let q = h << 3
			do {
				const r = ld64(m)
				copyr(s40, r + 0x10, 0x10)
				const s = ld64(r + 8)
				st64(s50 + 8, s)
				st64(s50, ld64(r))
				if (p == ld64(s68)) {
					fn_133b80(s68, s)
					k = ld64(s68 + 8)
				}
				m = m + 8
				const o = k + n
				st64(o + 0x5c, ld64(s38))
				st64(o + 0x54, ld64(s40))
				st64(o + 0x4c, ld64(s50 + 8))
				st64(o + 0x44, ld64(s50))
				st16(o + 0x64, 1)
				n = n + 0x22
				p = p + 1
				st64(s68 + 0x10, p)
				q = q - 8
			} while (q != 0)
		}
		copyr(s20, b, 0x20)
		copy(s50, s68, 0x18)
		copy(s38, s80, 0x18)
		memcpy(a, s50, 0x50)
	}
}

function fn_7f28(a: u64, b: u64, c: u64, d: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38
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
	fn_143448(s18, h, g)
	const m = ld64(s18 + 0x10)
	const j = ld64(s18 + 8)
	const i = ld64(s18)
	if (i != 0x800000000000001a /* Ok */) {
		st64(s18, i, j, m)
		g = fn_13b430(s28, s18)
		const u = ld64(s28)
		st64(a + 8, ld64(s28 + 8))
		st64(a, u)
		return g
	}
	B13: {
		const k = ld64(j)
		st64(s18 + 8, ld64(j + 8))
		st64(s18, k)
		st64(s18 + 0x10, 0)
		g = fn_13ae08(s18, 0x100151ed8, 8)
		if (g == 0) {
			g = fn_13ae08(s18, b + 8, 0x20)
			if (g == 0) {
				g = fn_13ae08(s18, b + 0x28, 0x20)
				if (g == 0) {
					n = ld64(m) + 1
					st64(m, n)
					st64(a + 8, n)
					st64(a, 2)
					return g
				}
			}
			const o = g
			if (2 > (g & 3) - 2) {
				break B13
			}
			if ((o & 3) == 0) {
				break B13
			}
		} else {
			const l = g
			if (2 > (g & 3) - 2) {
				break B13
			}
			if ((l & 3) == 0) {
				break B13
			}
		}
		const p = ld64(ld64(g + 7))
		callx(p, ld64(g - 1), p)
	}
	g = anchor_error_from(s38, 0xbbc /* anchor::AccountDidNotSerialize */, q, r, s)
	n = ld64(s38 + 8)
	const t = ld64(s38)
	st64(m, ld64(m) + 1)
	st64(a + 8, n)
	st64(a, t != 2 ? t : 2)
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

function fn_3240(a: u64, b: u64) {
	const s28 = fp - 0x28, s30 = fp - 0x30, s48 = fp - 0x48, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8
	let p: u64
	const f = ld64(b + 0x18)
	if ((memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0) {
		anchor_error_from(sc8, 0xbc4 /* anchor::AccountNotInitialized */)
		p = ld64(sc8)
		st64(a + 0x10, ld64(sc8 + 8))
		st64(a + 8, p)
		st64(a, 0)
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
			fn_104ee8(s48, s88, 0x800000000000001a /* Ok */)
			if (ld8(s48) == 0) {
				st32(a + 0xb, ld32(s48 + 4))
				st32(a + 8, ld32(s48 + 1))
				const r = ld64(s48 + 8)
				const q = ld64(s48 + 0x10)
				memcpy(s78, s30, 0x29)
				memcpy(a + 0x1f, s78, 0x29)
				st64(a + 0x17, q)
				st64(a + 0xf, r)
				st64(a, b)
				st64(o, ld64(o) - 1)
			} else {
				const n = ld64(s48 + 8)
				st64(a + 0x10, ld64(s48 + 0x10))
				st64(a + 8, n)
				st64(a, 0)
				st64(o, ld64(o) - 1)
			}
		} else {
			st64(s48, k, l, o)
			fn_13b430(sb8, s48)
			p = ld64(sb8)
			st64(a + 0x10, ld64(sb8 + 8))
			st64(a + 8, p)
			st64(a, 0)
		}
	} else {
		const j = anchor_error_from(s98, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const i = ld64(s98 + 8)
		const h = ld64(s98)
		copyr(s48, f, 0x20)
		st64(s28, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		fn_13b5c0(sa8, h, i, s48, j)
		p = ld64(sa8)
		st64(a + 0x10, ld64(sa8 + 8))
		st64(a + 8, p)
		st64(a, 0)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_133ce0(a: u64, b: u64) {
	const s18 = fp - 0x18
	let f = __rust_alloc(0x50, 1)
	if (f == 0) {
		raw_vec_handle_error(1, 0x50)
	}
	B16: {
		st64(s18, 0x50, f)
		const g = ld32(b)
		if ((g as i64) > 0xb) {
			if ((g as i64) > 0x11) {
				if ((g as i64) > 0x14) {
					if ((g as i64) > 0x16) {
						if (g == 0x17) {
							st64(f + 1, ld64(b + 8))
							st8(f, 0x17)
							st64(s18 + 0x10, 9)
							st64(a + 0x10, 9)
							st64(a + 8, ld64(s18 + 8))
							st64(a, ld64(s18))
							return
						}
						st8(f, 0x18)
						let j = 1
						st64(s18 + 0x10, 1)
						const k = ld64(b + 8)
						const i = ld64(b + 0x10)
						if (i >= 0x50) {
							fn_133a38(s18, 1, i)
							f = ld64(s18 + 8)
							j = ld64(s18 + 0x10)
						}
						memcpy(f + j, k, i)
						const o = j + i
						st64(s18 + 0x10, o)
						st64(a + 0x10, o)
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return
					}
					if (g == 0x15) {
						st8(f, 0x15)
						st64(s18 + 0x10, 1)
						st64(a + 0x10, 1)
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return
					}
					st8(f, 0x16)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, 1)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				if (g != 0x12) {
					if (g == 0x13) {
						st8(f + 1, ld8(b + 8))
						st8(f, 0x13)
						st64(s18 + 0x10, 2)
						st64(a + 0x10, 2)
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return
					}
					st8(f + 1, ld8(b + 8))
					st8(f, 0x14)
					st64(f + 0x1a, ld64(b + 0x21))
					st64(f + 0x12, ld64(b + 0x19))
					st64(f + 0xa, ld64(b + 0x11))
					st64(f + 2, ld64(b + 9))
					if (ld32(b + 0x2c) != 0) {
						break B16
					}
					st8(f + 0x22, 0)
					st64(s18 + 0x10, 0x23)
					st64(a + 0x10, 0x23)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				st8(f, 0x12)
			} else {
				if (0xe >= (g as i64)) {
					if (g == 0xc) {
						const l = ld64(b + 8)
						st8(f + 9, ld8(b + 0x10))
						st64(f + 1, l)
						st8(f, 0xc)
						st64(s18 + 0x10, 0xa)
						st64(a + 0x10, 0xa)
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return
					}
					if (g == 0xd) {
						const n = ld64(b + 8)
						st8(f + 9, ld8(b + 0x10))
						st64(f + 1, n)
						st8(f, 0xd)
						st64(s18 + 0x10, 0xa)
						st64(a + 0x10, 0xa)
						st64(a + 8, ld64(s18 + 8))
						st64(a, ld64(s18))
						return
					}
					const h = ld64(b + 8)
					st8(f + 9, ld8(b + 0x10))
					st64(f + 1, h)
					st8(f, 0xe)
					st64(s18 + 0x10, 0xa)
					st64(a + 0x10, 0xa)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				if (g == 0xf) {
					const m = ld64(b + 8)
					st8(f + 9, ld8(b + 0x10))
					st64(f + 1, m)
					st8(f, 0xf)
					st64(s18 + 0x10, 0xa)
					st64(a + 0x10, 0xa)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				if (g != 0x10) {
					st8(f, 0x11)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, 1)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				st8(f, 0x10)
			}
			copy(f + 1, b + 8, 0x20)
			st64(s18 + 0x10, 0x21)
			st64(a + 0x10, 0x21)
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return
		}
		if ((g as i64) > 5) {
			if ((g as i64) > 8) {
				if (g == 9) {
					st8(f, 9)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, 1)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				if (g == 0xa) {
					st8(f, 0xa)
					st64(s18 + 0x10, 1)
					st64(a + 0x10, 1)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				st8(f, 0xb)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, 1)
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return
			}
			if (g == 6) {
				st8(f, 6)
				st8(f + 1, ld8(b + 8))
				if (ld32(b + 0xc) != 0) {
					st8(f + 2, 1)
					copy(f + 3, b + 0x10, 0x20)
					st64(s18 + 0x10, 0x23)
					st64(a + 0x10, 0x23)
					st64(a + 8, ld64(s18 + 8))
					st64(a, ld64(s18))
					return
				}
				st8(f + 2, 0)
				st64(s18 + 0x10, 3)
				st64(a + 0x10, 3)
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return
			}
			if (g == 7) {
				st64(f + 1, ld64(b + 8))
				st8(f, 7)
				st64(s18 + 0x10, 9)
				st64(a + 0x10, 9)
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return
			}
			st64(f + 1, ld64(b + 8))
			st8(f, 8)
			st64(s18 + 0x10, 9)
			st64(a + 0x10, 9)
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return
		}
		if ((g as i64) > 2) {
			if (g == 3) {
				st64(f + 1, ld64(b + 8))
				st8(f, 3)
				st64(s18 + 0x10, 9)
				st64(a + 0x10, 9)
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return
			}
			if (g == 4) {
				st64(f + 1, ld64(b + 8))
				st8(f, 4)
				st64(s18 + 0x10, 9)
				st64(a + 0x10, 9)
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return
			}
			st8(f, 5)
			st64(s18 + 0x10, 1)
			st64(a + 0x10, 1)
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return
		}
		if (g != 0) {
			if (g == 1) {
				st8(f, 1)
				st64(s18 + 0x10, 1)
				st64(a + 0x10, 1)
				st64(a + 8, ld64(s18 + 8))
				st64(a, ld64(s18))
				return
			}
			st8(f + 1, ld8(b + 8))
			st8(f, 2)
			st64(s18 + 0x10, 2)
			st64(a + 0x10, 2)
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return
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
			st64(a + 0x10, 0x23)
			st64(a + 8, ld64(s18 + 8))
			st64(a, ld64(s18))
			return
		}
	}
	st8(f + 0x22, 1)
	copy(f + 0x23, b + 0x30, 0x20)
	st64(s18 + 0x10, 0x43)
	st64(a + 0x10, 0x43)
	st64(a + 8, ld64(s18 + 8))
	st64(a, ld64(s18))
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

function fn_104ee8(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s20 = fp - 0x20
	let q: u64
	const f = ld64(b + 8)
	if (7 >= f) {
		fn_14c4f0(8, f, 0x10015a888, d, e)
	}
	if (f - 8 >= 0x20) {
		const g = ld64(b)
		const h = ld64(g + 0xe)
		st8(s20 + 0x18, ld8(g + 0x16))
		st64(s20 + 0x10, h)
		if (f - 0x28 >= 0x20) {
			const l = ld64(s20 + 0x11)
			const i = ld64(g + 0x2e)
			st8(s20 + 0x18, ld8(g + 0x36))
			st16(a + 0x25, ld16(g + 0x2c))
			st32(a + 0x21, ld32(g + 0x28))
			st64(s20 + 0x10, i)
			q = ld64(s20 + 0x11)
			st8(a + 0x40, ld8(g + 0x47))
			st64(a + 0x38, ld64(g + 0x3f))
			st64(a + 0x30, ld64(g + 0x37))
			st32(a + 1, ld32(g + 8))
			st16(a + 5, ld16(g + 0xc))
			const m = ld8(g + 0x27)
			const k = ld64(g + 0x17)
			const j = ld64(g + 0x1f)
			st8(a + 0x27, i)
			st64(a + 0x18, j)
			st64(a + 0x10, k)
			st64(a + 8, l)
			st8(a + 7, h)
			st8(a + 0x20, m)
			st64(a + 0x28, q)
			st8(a, 0)
			return
		}
	}
	const n = fn_1459d0(0x100159468)
	anchor_error_from(s20, 0xbbb /* anchor::AccountDidNotDeserialize */)
	q = ld64(s20 + 8)
	const p = ld64(s20)
	if (2 > (n & 3) - 2) {
		st64(a + 8, p, q)
		st8(a, 1)
	} else if ((n & 3) == 0) {
		st64(a + 8, p, q)
		st8(a, 1)
	} else {
		const o = ld64(ld64(n + 7))
		callx(o, ld64(n - 1), o)
		st64(a + 8, p, q)
		st8(a, 1)
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_147238(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	fn_1478b8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_14c4f0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c4f8(a, b, c, d, e)
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
