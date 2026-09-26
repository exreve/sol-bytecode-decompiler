// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction create_permission_pda: handler + 32 reachable functions
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
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function AccountInfo_clone_f338(a: u64, b: u64): u64 // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function ptr_drop_in_place_fcd8(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<solana_account_info::AccountInfo>
declare function try_accounts_17a30(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_18870(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::accounts::program::Program<T> as anchor_lang::Accounts<B>>::try_accounts
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function Error_new_13c880(): u64 // lib std::io::error::Error::new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function Error_with_pubkeys(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib anchor_lang::error::Error::with_pubkeys
declare function system_program_assign_13fb30(a: u64, b: u64, c: u64): u64 // lib anchor_lang::system_program::assign
declare function system_program_assign_13ff40(a: u64, b: u64, c: u64): u64 // lib anchor_lang::system_program::assign
declare function system_program_create_account(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib anchor_lang::system_program::create_account
declare function system_program_transfer(a: u64, b: u64, c: u64): u64 // lib anchor_lang::system_program::transfer
declare function ErrorCode_name(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib anchor_lang::error::ErrorCode::name
declare function ErrorCode_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::error::ErrorCode as core::fmt::Display>::fmt
declare function rent_get(a: u64): u64 // lib solana_sysvar::rent::<impl solana_sysvar::Sysvar for solana_rent::Rent>::get
declare function Rent_is_exempt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib solana_rent::Rent::is_exempt
declare function AccountInfo_try_data_len(a: u64, b: u64): void // lib solana_account_info::AccountInfo::try_data_len
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function de_unexpected_eof_to_unexpected_length_of_input(a: u64): u64 // lib borsh::de::unexpected_eof_to_unexpected_length_of_input
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fmt_write(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::write
declare function imp__fmt_155760(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u64>::_fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function cmp___gedf2(a: u64, b: u64): u64 // lib compiler_builtins::float::cmp::__gedf2
declare function mul_mul(a: u64, b: u64): u64 // lib compiler_builtins::float::mul::mul
declare function __floatundidf(a: u64): u64 // lib __floatundidf
declare function __fixunsdfdi(a: u64): u64 // lib __fixunsdfdi
declare function __multi3_159030(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __multi3

// instruction handler: create_permission_pda (discriminator sha256("global:create_permission_pda")[..8] = 0xcab5a989d8028887)
// accounts [idl]: 0 owner [signer, mut], 1 permission_authority, 2 permission [mut, pda], 3 system_program [= 11111111111111111111111111111111]
// args [idl]: (none)
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
function ix_create_permission_pda(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s118 = fp - 0x118, s130 = fp - 0x130, s248 = fp - 0x248, s260 = fp - 0x260, s270 = fp - 0x270, s271 = fp - 0x271, s288 = fp - 0x288, sff8 = fp - 0xff8
	const f = sol_log("Instruction: CreatePermissionPda", 0x20)
	st64(s270, accounts, accounts_len)
	st64(sff8, s271)
	let n = accounts_create_permission_pda(s130, program_id, s270, undef, fp, f)
	const h = ld64(s130 + 0x10)
	let i = ld64(s130 + 8)
	const g = ld64(s130)
	if (g == 0) {
		st64(a + 8, h)
		st64(a, i)
		return n
	}
	memcpy(s248, s118, 0x118)
	st64(s260, g, i, h)
	const j = ld64(i)
	const m = ld64(j)
	const l = ld64(j + 8)
	const k = ld64(j + 0x10)
	st64(s248 + 0x18, ld64(j + 0x18))
	st64(s248, m, l, k)
	n = fn_da208(s288, s260, program_id)
	i = ld64(s288)
	st64(a + 8, ld64(s288 + 8))
	st64(a, i)
	return n
}

// Anchor Accounts::try_accounts of instruction create_permission_pda (called by ix_create_permission_pda; name [str]: from the handler's "Instruction: …" log; was fn_d74c8)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: owner (ConstraintMut), permission (ConstraintMut, ConstraintRentExempt)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: owner [idl], permission [idl]
function accounts_create_permission_pda(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s120 = fp - 0x120, s158 = fp - 0x158, s250 = fp - 0x250, s258 = fp - 0x258, s268 = fp - 0x268, s270 = fp - 0x270, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2b1 = fp - 0x2b1, s2d8 = fp - 0x2d8, s2f0 = fp - 0x2f0, s308 = fp - 0x308, s310 = fp - 0x310, s318 = fp - 0x318, s320 = fp - 0x320, s328 = fp - 0x328, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s428 = fp - 0x428, s430 = fp - 0x430, s438 = fp - 0x438, s440 = fp - 0x440
	let j, m, q, v, w: u64
	st64(s428 + 0x10, a)
	st64(s330, b)
	let x = try_accounts_17a30(s270, c, c, d, e, r0)
	const owner: AccountInfo = ld64(s268)
	let f = ld64(s270)
	if (f == 2) {
		let l = ld64(e - 0xff8)
		st64(s328, owner)
		const k = ld64(c + 8)
		if (k != 0) {
			q = ld64(c)
			st64(c, q + 0x30, k - 1)
			st64(s320, q)
			if (k != 1) {
				st64(s428, l, q)
				const r: AccountInfo = ld64(c)
				st64(s318, r)
				st64(c + 8, k - 2)
				st64(c, r + 0x30)
				x = try_accounts_18870(s270, c, q, l, m)
				const u = ld64(s268)
				f = ld64(s270)
				if (f == 2) {
					st64(s310, u)
					rent_get(s270)
					copy(s2f0, s268, 0x18)
					if (ld64(s270) != 0) {
						x = fn_13e628(s3f0, s2f0)
						w = ld64(s3f0)
						v = ld64(s428 + 0x10)
						st64(v + 0x10, ld64(s3f0 + 8))
						st64(v + 8, w)
						st64(v, 0)
						return x
					}
					copyr(s308, s2f0, 0x18)
					const y = ld64(ld64(s428 + 8))
					copyr(s158, y, 0x20)
					st64(s2b0, 0x10015b308, 0xa, s158, 0x20)
					// PDA find_program_address(["permission", *y], program *b)
					Pubkey_find_program_address(s270, s2b0, 2, b)
					copyr(s2d8, s270, 0x20)
					const z = ld8(s250)
					st8(s2b1, z)
					st8(ld64(s428), z)
					const aa = r.key
					copyr(s290, aa, 0x20)
					if ((memcmp(s290, s2d8, 0x20) as u32) == 0) {
						st64(s158, s318, s308, s328, s310, s320, s2b1, s330)
						x = fn_d8800(s270, s158)
						const aj = ld64(s268 + 8)
						const ah = ld64(s268)
						const ag = ld64(s270)
						if (ag == 0) {
							const an = ld64(s428 + 0x10)
							st64(an + 0x10, aj)
							st64(an + 8, ah)
							st64(an, 0)
							return x
						}
						st64(s430, ah, ag)
						memcpy(s120, s258, 0x100)
						const permission: AccountInfo = ld64(s428)
						if (permission.is_writable != 0) {
							st64(s440, aj)
							AccountInfo_clone_f338(s158, permission)
							st64(s438, fn_147a20(s158))
							AccountInfo_clone_f338(s270, permission)
							AccountInfo_try_data_len(s2b0, s270)
							const al = ld64(s2b0 + 8)
							const ak = ld64(s2b0)
							if (ak != 0x800000000000001a /* Ok */) {
								st64(s2b0 + 0x10, ld64(s2b0 + 0x10))
								st64(s2b0, ak, al)
								const aq = fn_13e628(s380, s2b0)
								const ap = ld64(s380)
								const ao = ld64(s428 + 0x10)
								st64(ao + 0x10, ld64(s380 + 8))
								st64(ao + 8, ap)
								st64(ao, 0)
								return ptr_drop_in_place_fcd8(s158, ptr_drop_in_place_fcd8(s270, aq))
							}
							const am = Rent_is_exempt(s308, ld64(s438), al)
							ptr_drop_in_place_fcd8(s158, ptr_drop_in_place_fcd8(s270, am))
							if (am != 0) {
								if (owner.is_writable != 0) {
									const ar = owner.key
									copyr(s20, ar, 0x20)
									if ((memcmp(s20, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32) != 0) {
										copyr(s270, ar, 0x20)
										if ((memcmp(s270, 0x100159640 /* key RayzVBPm6p6xtG7fU3KX4k44UexK4NjewDk2QCwoLqa */, 0x20) as u32) != 0) {
											fn_88360(s3d0, 0)
											x = fn_4130(s3e0, ld64(s3d0), ld64(s3d0 + 8), 0x10015b1d0 /* "owner" */, 5)
											w = ld64(s3e0)
											v = ld64(s428 + 0x10)
											st64(v + 0x10, ld64(s3e0 + 8))
											st64(v + 8, w)
											st64(v, 0)
											return x
										}
									}
									const at = ld64(s428 + 0x10)
									x = memcpy(at + 0x28, s120, 0x100)
									st64(at + 0x128, u)
									st64(at + 0x20, ld64(s440))
									st64(at + 0x18, ld64(s430))
									st64(at + 0x10, ld64(s428))
									st64(at + 8, ld64(s428 + 8))
									st64(at, owner)
									return x
								}
								anchor_error_from(s3b0, 0x7d0 /* anchor::ConstraintMut */)
								x = fn_4130(s3c0, ld64(s3b0), ld64(s3b0 + 8), 0x10015b1d0 /* "owner" */, 5)
								w = ld64(s3c0)
								v = ld64(s428 + 0x10)
								st64(v + 0x10, ld64(s3c0 + 8))
								st64(v + 8, w)
								st64(v, 0)
								return x
							}
							anchor_error_from(s390, 0x7d5 /* anchor::ConstraintRentExempt */)
							x = fn_4130(s3a0, ld64(s390), ld64(s390 + 8), 0x10015b308 /* "permission" */, 0xa)
							w = ld64(s3a0)
							v = ld64(s428 + 0x10)
							st64(v + 0x10, ld64(s3a0 + 8))
							st64(v + 8, w)
							st64(v, 0)
							return x
						}
						anchor_error_from(s360, 0x7d0 /* anchor::ConstraintMut */)
						x = fn_4130(s370, ld64(s360), ld64(s360 + 8), 0x10015b308 /* "permission" */, 0xa)
						w = ld64(s370)
						v = ld64(s428 + 0x10)
						st64(v + 0x10, ld64(s370 + 8))
						st64(v + 8, w)
						st64(v, 0)
						return x
					}
					const af = anchor_error_from(s340, 0x7d6 /* anchor::ConstraintSeeds */)
					const ab = ld64(0x300000000 /* heap bump-allocator cursor */)
					const ad = ab != 0 ? sat_sub(ab, 0xa) : 0x300007ff6
					const ae = ld64(s340 + 8)
					const ac = ld64(s340)
					if ((ac & 1) != 0) {
						if (0x300000008 > ad) {
							raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ad)
						st64(ad, 0x697373696d726570)
						st16(ad + 8, 0x6e6f)
						void ld64(ae)
					} else {
						if (0x300000008 > ad) {
							raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
						}
						st64(0x300000000 /* heap bump-allocator cursor */, ad)
						st64(ad, 0x697373696d726570)
						st16(ad + 8, 0x6e6f)
						void ld64(ae)
					}
					st64(ae + 0x10, ad, 0xa)
					st64(ae + 8, 0xa)
					st64(ae, 1)
					copyr(s270, s290, 0x20)
					copy(s250, s2d8, 0x20)
					x = Error_with_pubkeys(s350, ac, ae, s270, af)
					w = ld64(s350)
					v = ld64(s428 + 0x10)
					st64(v + 0x10, ld64(s350 + 8))
					st64(v + 8, w)
					st64(v, 0)
					return x
				}
				const s = ld64(0x300000000 /* heap bump-allocator cursor */)
				const t = s != 0 ? sat_sub(s, 0xe) : 0x300007ff2
				if ((f & 1) != 0) {
					if (0x300000008 > t) {
						raw_vec_handle_error(1, 0xe, 0x10015f8f8, sat_sub(s, 0xe), 0xe > s)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, t)
					st64(t + 6, 0x6d6172676f72705f)
					st64(t, 0x705f6d6574737973)
					void ld64(u)
				} else {
					if (0x300000008 > t) {
						raw_vec_handle_error(1, 0xe, 0x10015f8f8, sat_sub(s, 0xe), 0xe > s)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, t)
					st64(t + 6, 0x6d6172676f72705f)
					st64(t, 0x705f6d6574737973)
					void ld64(u)
				}
				st64(u + 0x10, t, 0xe)
				st64(u + 8, 0xe)
				st64(u, 1)
				j = ld64(s428 + 0x10)
				st64(j + 0x10, u)
				st64(j + 8, f)
				st64(j, 0)
				return x
			}
		} else {
			x = anchor_error_from(s400, 0xbbd /* anchor::AccountNotEnoughKeys */, undef, l, m)
			q = undef
			l = undef
			f = ld64(s400)
			if (f != 2) {
				const n = ld64(0x300000000 /* heap bump-allocator cursor */)
				const o = n != 0 ? sat_sub(n, 0x14) : 0x300007fec
				const p = ld64(s400 + 8)
				if ((f & 1) != 0) {
					if (0x300000008 > o) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > n)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, o)
					st64(o + 8, 0x6f687475615f6e6f)
					st64(o, 0x697373696d726570)
					st32(o + 0x10, 0x79746972)
					void ld64(p)
				} else {
					if (0x300000008 > o) {
						raw_vec_handle_error(1, 0x14, 0x10015f8f8, 0x300000008, 0x14 > n)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, o)
					st64(o + 8, 0x6f687475615f6e6f)
					st64(o, 0x697373696d726570)
					st32(o + 0x10, 0x79746972)
					void ld64(p)
				}
				st64(p + 0x10, o, 0x14)
				st64(p + 8, 0x14)
				st64(p, 1)
				j = ld64(s428 + 0x10)
				st64(j + 0x10, p)
				st64(j + 8, f)
				st64(j, 0)
				return x
			}
		}
		x = anchor_error_from(s410, 0xbbd /* anchor::AccountNotEnoughKeys */, q, l, m)
		w = ld64(s410)
		v = ld64(s428 + 0x10)
		st64(v + 0x10, ld64(s410 + 8))
		st64(v + 8, w)
		st64(v, 0)
		return x
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
		void owner.key
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 5, 0x10015f8f8, sat_sub(g, 5), 5 > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st8(h + 4, 0x72)
		st32(h, 0x656e776f)
		void owner.key
	}
	st64(owner + 0x10, h, 5)
	st64(owner + 8 /* lamports */, 5)
	st64(owner /* key */, 1)
	j = ld64(s428 + 0x10)
	st64(j + 0x10, owner)
	st64(j + 8, f)
	st64(j, 0)
	return x
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: AccountInfo, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

function fn_da208(a: u64, b: u64, c: u64): u64 {
	const s8 = fp - 0x8, s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40
	let l, p, q, r, s: u64
	const f = memcmp(0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c, 0x20)
	let o = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return g
	}
	const h = ld64(b + 0x10)
	g = common_is_closed(h)
	o = undef
	if (g != 0) {
		st64(a + 8, o)
		st64(a, 2)
		return g
	}
	let i = ld64(h + 0x10)
	if (ld64(i + 0x10) != 0) {
		st64(s20, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
		g = fn_13e628(s30, s20)
		o = ld64(s30 + 8)
		s = ld64(s30)
		if (s == 2) {
			st64(a + 8, o)
			st64(a, 2)
			return g
		}
	} else {
		B16: {
			st64(i + 0x10, -1)
			const j = ld64(i + 0x18)
			st64(s20 + 8, ld64(i + 0x20))
			st64(s20, j)
			st64(s20 + 0x10, 0)
			g = fn_13e070(s20, 0x1001592f0, 8)
			if (g == 0) {
				const w = i
				g = fn_13e070(s20, b + 0x18, 0x20)
				if (g == 0) {
					let m = 0
					do {
						if (m == 0xf0) {
							o = ld64(w + 0x10) + 1
							st64(w + 0x10, o)
							st64(a + 8, o)
							st64(a, 2)
							return g
						}
						st64(s8, ld64(b + 0x38 + m))
						g = fn_13e070(s20, s8, 8)
						m = m + 8
					} while (g == 0)
				}
				const n = g
				i = w
				if (2 > (g & 3) - 2) {
					break B16
				}
				if ((n & 3) == 0) {
					break B16
				}
				l = ld64(ld64(g + 7))
				if (l == 0) {
					break B16
				}
			} else {
				const k = g
				if (2 > (g & 3) - 2) {
					break B16
				}
				if ((k & 3) == 0) {
					break B16
				}
				l = ld64(ld64(g + 7))
				if (l == 0) {
					break B16
				}
			}
			callx(l, ld64(g - 1), l)
		}
		g = anchor_error_from(s40, 0xbbc /* anchor::AccountDidNotSerialize */, p, q, r)
		o = ld64(s40 + 8)
		s = ld64(s40)
		st64(i + 0x10, ld64(i + 0x10) + 1)
		if (s == 2) {
			st64(a + 8, o)
			st64(a, 2)
			return g
		}
	}
	const u = s
	const t = ld64(0x300000000 /* heap bump-allocator cursor */)
	const v = t != 0 ? sat_sub(t, 0xa) : 0x300007ff6
	if ((s & 1) != 0) {
		if (0x300000008 > v) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, sat_sub(t, 0xa), 0xa > t)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, v)
		st64(v, 0x697373696d726570)
		st16(v + 8, 0x6e6f)
		void ld64(o)
	} else {
		if (0x300000008 > v) {
			raw_vec_handle_error(1, 0xa, 0x10015f8f8, sat_sub(t, 0xa), 0xa > t)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, v)
		st64(v, 0x697373696d726570)
		st16(v + 8, 0x6e6f)
		void ld64(o)
	}
	st64(o + 0x10, v, 0xa)
	st64(o + 8, 0xa)
	st64(o, 1)
	st64(a + 8, o)
	st64(a, u)
	return g
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

function fn_d8800(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, se0 = fp - 0xe0, sf0 = fp - 0xf0, s110 = fp - 0x110, s118 = fp - 0x118, s11f = fp - 0x11f, s128 = fp - 0x128, s140 = fp - 0x140, s148 = fp - 0x148, s160 = fp - 0x160, s161 = fp - 0x161, s188 = fp - 0x188, s189 = fp - 0x189, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s220 = fp - 0x220, s228 = fp - 0x228, s248 = fp - 0x248, s268 = fp - 0x268, s280 = fp - 0x280, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2c0 = fp - 0x2c0, s2d0 = fp - 0x2d0, s2e0 = fp - 0x2e0, s2f0 = fp - 0x2f0, s300 = fp - 0x300, s310 = fp - 0x310, s320 = fp - 0x320, s368 = fp - 0x368, s370 = fp - 0x370, s378 = fp - 0x378, s380 = fp - 0x380, s388 = fp - 0x388, s390 = fp - 0x390, s398 = fp - 0x398, s3a0 = fp - 0x3a0, s3a8 = fp - 0x3a8, s3b0 = fp - 0x3b0, s3b8 = fp - 0x3b8, s3c0 = fp - 0x3c0, s3c8 = fp - 0x3c8
	let af, aj, co, cp: u64
	const f: AccountInfo = ld64(ld64(b))
	const g = fn_147a20(f, b, c, d, e)
	st64(s368 + 0x40, a)
	if (g != 0) {
		const j = ld64(b + 0x10)
		const k = ld64(ld64(j))
		copyr(s2c0, k, 0x20)
		const l = f.key
		copy(s298, l + 8, 0x18)
		st64(s2a0, ld64(l))
		if ((memcmp(s2c0, s2a0, 0x20) as u32) == 0) {
			ErrorCode_name(s280, 0x100159890)
			st64(s188, 0, 1, 0)
			st64(s28, s188, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100159890, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(s128, s188, 0x18)
			copy(s140, s280, 0x18)
			st64(s160 + 8, 0x10015b2cc)
			st32(se0 + 0x18, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s110, 2)
			st32(s148, 0xe)
			st64(s160 + 0x10, 0x3c)
			st64(s160, 0)
			const ai = fn_13e5a0(s300, s160)
			const ah = ld64(s300 + 8)
			const ag = ld64(s300)
			copy(s160, s2c0, 0x40)
			cp = Error_with_pubkeys(s310, ag, ah, s160, ai)
			const ak = ld64(s310)
			aj = ld64(s368 + 0x40)
			st64(aj + 0x10, ld64(s310 + 8))
			st64(aj + 8, ak)
			st64(aj, 0)
			return cp
		}
		st64(s368 + 0x38, b)
		const m = max(fn_1476d8(ld64(b + 8), 0x118), 1)
		if (m > g) {
			const n: AccountInfo = ld64(j)
			const o: LamportsCell = n.lamports
			const ap = n.key
			rc_inc(o)
			const al: DataCell = n.data
			rc_inc(al)
			const am: LamportsCell = f.lamports
			st64(s368 + 0x30, am)
			const an = am.strong
			st64(s368, f.key)
			st64(s368 + 8, n.executable)
			st64(s368 + 0x10, n.is_writable)
			st64(s368 + 0x18, n.is_signer)
			st64(s368 + 0x20, n.rent_epoch)
			st64(s368 + 0x28, n.owner)
			rc_inc(ld64(s368 + 0x30), an)
			const ao: DataCell = f.data
			const aq = ld64(s368 + 0x38)
			rc_inc(ao)
			st64(s380, al, ap)
			const ar: AccountInfo = ld64(ld64(aq + 0x18))
			const at: LamportsCell = ar.lamports
			const au = at.strong
			st64(s370, o)
			st64(s3a8, f.executable)
			st64(s3a0, f.is_writable)
			st64(s398, f.is_signer)
			st64(s390, f.rent_epoch)
			const ax = f.owner
			st64(s388, ar.key)
			rc_inc(at, au)
			st64(s3b8, ao)
			const av: DataCell = ar.data
			const aw = av.strong
			st64(s3b0, sat_sub(m, g))
			rc_inc(av, aw)
			st64(s3c0, ar.owner)
			const bb = ar.rent_epoch
			const ba = ar.is_signer
			const az = ar.is_writable
			const ay = ar.executable
			st8(s220 + 0x5a, ld64(s3a8))
			st8(s220 + 0x59, ld64(s3a0))
			st8(s220 + 0x58, ld64(s398))
			st64(s220 + 0x50, ld64(s390))
			st64(s220 + 0x48, ax)
			st64(s220 + 0x40, ld64(s3b8))
			st64(s220 + 0x38, ld64(s368 + 0x30))
			st64(s220 + 0x30, ld64(s368))
			st8(s220 + 0x2a, ld64(s368 + 8))
			st8(s220 + 0x29, ld64(s368 + 0x10))
			st8(s220 + 0x28, ld64(s368 + 0x18))
			st64(s220 + 0x20, ld64(s368 + 0x20))
			st64(s220 + 0x18, ld64(s368 + 0x28))
			st64(s220 + 0x10, ld64(s380))
			copyr(s220, s378, 0x10)
			st8(s228, ba, az, ay)
			st64(s248 + 0x18, bb)
			st64(s248 + 0x10, ld64(s3c0))
			st64(s248, at, av)
			st64(s268 + 0x18, ld64(s388))
			st64(s1c0, 8, 0)
			st64(s268, 0, 8, 0)
			cp = system_program_transfer(s2d0, s268, ld64(s3b0))
			const bc = ld64(s2d0)
			const bd = ld64(s368 + 0x40)
			if (bc != 2) {
				const be = ld64(s2d0 + 8)
				st64(bd + 8, bc, be)
				st64(bd, 0)
				return cp
			}
		}
		const bf: LamportsCell = f.lamports
		const bg = bf.strong
		st64(s368 + 0x30, f.key)
		const bi = ld64(s368 + 0x38)
		rc_inc(bf, bg)
		const bh: DataCell = f.data
		rc_inc(bh)
		st64(s368 + 0x28, bh)
		const bj = ld64(bi + 0x18)
		const bk: AccountInfo = ld64(bj)
		const bl: LamportsCell = bk.lamports
		const bm = bl.strong
		st64(s368, f.executable)
		st64(s368 + 8, f.is_writable)
		st64(s368 + 0x10, f.is_signer)
		st64(s368 + 0x18, f.rent_epoch)
		st64(s368 + 0x20, f.owner)
		const bn = bk.key
		rc_inc(bl, bm)
		st64(s370, bn)
		const bo: DataCell = bk.data
		rc_inc(bo)
		st64(s388, bj)
		st64(s380, bk.owner)
		st64(s378, bf)
		const bu = bk.rent_epoch
		const bt = bk.is_signer
		const bs = bk.is_writable
		const br = bk.executable
		const bp = ld64(ld64(ld64(bi + 0x20)))
		copyr(s1b0, bp, 0x20)
		const bq = ld8(ld64(bi + 0x28))
		st64(s28, s189)
		st64(s48 + 0x10, s1b0)
		st64(s48, 0x10015b308)
		st8(s189, bq)
		st64(s188, s48)
		st64(sf0 + 8, s188)
		st8(sf0, bt, bs, br)
		st64(s110 + 0x18, bu)
		st64(s110 + 0x10, ld64(s380))
		st64(s110, bl, bo)
		st64(s118, ld64(s370))
		st8(s11f + 1, ld64(s368))
		st8(s11f, ld64(s368 + 8))
		st8(s128 + 8, ld64(s368 + 0x10))
		st64(s128, ld64(s368 + 0x18))
		st64(s140 + 0x10, ld64(s368 + 0x20))
		st64(s140 + 8, ld64(s368 + 0x28))
		st64(s140, ld64(s378))
		st64(s148, ld64(s368 + 0x30))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0xa)
		st64(s188 + 8, 3)
		st64(se0, 1)
		st64(s160, 0, 8, 0)
		cp = system_program_assign_13fb30(s2e0, s160, 0x118)
		af = ld64(s2e0)
		if (af != 2) {
			co = ld64(s2e0 + 8)
			aj = ld64(s368 + 0x40)
			st64(aj + 8, af, co)
			st64(aj, 0)
			return cp
		}
		const bv: LamportsCell = f.lamports
		const cd = f.key
		rc_inc(bv)
		const bw: DataCell = f.data
		rc_inc(bw)
		const bx: AccountInfo = ld64(ld64(s388))
		const by: LamportsCell = bx.lamports
		const bz = by.strong
		st64(s368 + 0x18, f.executable)
		st64(s368 + 0x20, f.is_writable)
		st64(s368 + 0x28, f.is_signer)
		st64(s368 + 0x30, f.rent_epoch)
		const cc = f.owner
		st64(s368 + 0x10, bx.key)
		rc_inc(by, bz)
		const ca: DataCell = bx.data
		const cb = ca.strong
		st64(s370, cc, cd, bv)
		rc_inc(ca, cb)
		const ci = bx.owner
		const ch = bx.rent_epoch
		const cg = bx.is_signer
		const cf = bx.is_writable
		const ce = bx.executable
		copyr(s188, s1b0, 0x20)
		st64(s28, s161)
		st64(s48 + 0x10, s188)
		st64(s48, 0x10015b308)
		st8(s161, ld8(s189))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0xa)
		st64(s280, s48, 3)
		st64(sf0 + 8, s280)
		st8(sf0, cg, cf, ce)
		st64(s110, by, ca, ci, ch)
		st64(s118, ld64(s368 + 0x10))
		st8(s11f + 1, ld64(s368 + 0x18))
		st8(s11f, ld64(s368 + 0x20))
		st8(s128 + 8, ld64(s368 + 0x28))
		st64(s128, ld64(s368 + 0x30))
		st64(s140 + 0x10, ld64(s370))
		st64(s140 + 8, bw)
		copyr(s148, s368, 0x10)
		st64(se0, 1)
		st64(s160, 0, 8, 0)
		cp = system_program_assign_13ff40(s2f0, s160, ld64(ld64(ld64(s368 + 0x38) + 0x30)))
		af = ld64(s2f0)
		if (af != 2) {
			co = ld64(s2f0 + 8)
			aj = ld64(s368 + 0x40)
			st64(aj + 8, af, co)
			st64(aj, 0)
			return cp
		}
	} else {
		const p = fn_1476d8(ld64(b + 8), 0x118)
		const h: AccountInfo = ld64(ld64(b + 0x10))
		const i: LamportsCell = h.lamports
		const v = h.key
		rc_inc(i)
		st64(s368 + 0x30, p)
		const q: DataCell = h.data
		rc_inc(q)
		st64(s368 + 0x28, q)
		const r: LamportsCell = f.lamports
		const s = r.strong
		st64(s368, f.key)
		st64(s368 + 8, h.executable)
		st64(s368 + 0x10, h.is_writable)
		st64(s368 + 0x18, h.is_signer)
		st64(s368 + 0x20, h.rent_epoch)
		const t = h.owner
		rc_inc(r, s)
		st64(s370, t)
		const u: DataCell = f.data
		rc_inc(u)
		st64(s380, v, i)
		const w: AccountInfo = ld64(ld64(b + 0x18))
		const x: LamportsCell = w.lamports
		const y = x.strong
		st64(s3a8, f.executable)
		st64(s3a0, f.is_writable)
		st64(s398, f.is_signer)
		st64(s390, f.rent_epoch)
		st64(s388, f.owner)
		const z = w.key
		rc_inc(x, y)
		st64(s3b0, z)
		const aa: DataCell = w.data
		rc_inc(aa)
		st64(s3b8, w.owner)
		st64(s3c0, w.rent_epoch)
		st64(s3c8, w.is_signer)
		const ae = w.is_writable
		const ad = w.executable
		const ab = ld64(ld64(ld64(b + 0x20)))
		copyr(s188, ab, 0x20)
		const ac = ld8(ld64(b + 0x28))
		st64(s28, s161)
		st64(s48 + 0x10, s188)
		st64(s48, 0x10015b308)
		st8(s161, ac)
		st64(s280, s48)
		st64(se0 + 0x28, s280)
		st8(se0 + 0x22, ld64(s3a8))
		st8(se0 + 0x21, ld64(s3a0))
		st8(se0 + 0x20, ld64(s398))
		st64(se0 + 0x18, ld64(s390))
		st64(se0 + 0x10, ld64(s388))
		st64(se0, r, u)
		st64(sf0 + 8, ld64(s368))
		st8(sf0 + 2, ld64(s368 + 8))
		st8(sf0 + 1, ld64(s368 + 0x10))
		st8(sf0, ld64(s368 + 0x18))
		st64(s110 + 0x18, ld64(s368 + 0x20))
		st64(s110 + 0x10, ld64(s370))
		st64(s110 + 8, ld64(s368 + 0x28))
		copyr(s118, s380, 0x10)
		st8(s11f, ae, ad)
		st8(s128 + 8, ld64(s3c8))
		st64(s128, ld64(s3c0))
		st64(s140 + 0x10, ld64(s3b8))
		st64(s140, x, aa)
		st64(s148, ld64(s3b0))
		st64(s28 + 8, 1)
		st64(s48 + 0x18, 0x20)
		st64(s48 + 8, 0xa)
		st64(s280 + 8, 3)
		st64(se0 + 0x30, 1)
		st64(s160, 0, 8, 0)
		cp = system_program_create_account(s320, s160, ld64(s368 + 0x30), 0x118, ld64(ld64(b + 0x30)))
		af = ld64(s320)
		if (af != 2) {
			co = ld64(s320 + 8)
			aj = ld64(s368 + 0x40)
			st64(aj + 8, af, co)
			st64(aj, 0)
			return cp
		}
	}
	const cj = ld64(s368 + 0x40)
	cp = fn_9a48(s160, f)
	if (ld64(s160) == 0) {
		const ck = ld64(0x300000000 /* heap bump-allocator cursor */)
		const cm = ck != 0 ? sat_sub(ck, 0xa) : 0x300007ff6
		const cn = ld64(s160 + 0x10)
		const cl = ld64(s160 + 8)
		if (cl != 0) {
			if (0x300000008 > cm) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, cm)
			st64(cm, 0x697373696d726570)
			st16(cm + 8, 0x6e6f)
			void ld64(cn)
		} else {
			if (0x300000008 > cm) {
				raw_vec_handle_error(1, 0xa, 0x10015f8f8, 0x300000008)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, cm)
			st64(cm, 0x697373696d726570)
			st16(cm + 8, 0x6e6f)
			void ld64(cn)
		}
		st64(cn + 0x10, cm, 0xa)
		st64(cn + 8, 0xa)
		st64(cn, 1)
		st64(cj + 0x10, cn)
		st64(cj + 8, cl)
		st64(cj, 0)
		return cp
	}
	return memcpy(cj, s160, 0x118)
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

function fn_9a48(a: u64, b: AccountInfo): u64 {
	const sf8 = fp - 0xf8, s100 = fp - 0x100, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158, s168 = fp - 0x168
	let q, r: u64
	const f = b.owner
	if ((memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0) {
		r = anchor_error_from(s168, 0xbc4 /* anchor::AccountNotInitialized */)
		q = ld64(s168)
		st64(a + 0x10, ld64(s168 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const g = memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20)
	if ((g as u32) == 0) {
		AccountInfo_try_borrow_data(s118, b, g as u32)
		const p = ld64(s118 + 0x10)
		const l = ld64(s118 + 8)
		const k = ld64(s118)
		if (k == 0x800000000000001a /* Ok */) {
			const m = ld64(l)
			st64(s128 + 8, ld64(l + 8))
			st64(s128, m)
			r = fn_10e370(s118, s128, 0x800000000000001a /* Ok */)
			const n = ld64(s118 + 0x10)
			const o = ld64(s118 + 8)
			if (ld64(s118) != 0) {
				st64(a + 0x10, n)
				st64(a + 8, o)
				st64(a, 0)
				st64(p, ld64(p) - 1)
				return r
			}
			r = memcpy(a + 0x18, s100, 0x100)
			st64(a + 0x10, n)
			st64(a + 8, o)
			st64(a, b)
			st64(p, ld64(p) - 1)
			return r
		}
		st64(s118, k, l, p)
		r = fn_13e628(s158, s118)
		q = ld64(s158)
		st64(a + 0x10, ld64(s158 + 8))
		st64(a + 8, q)
		st64(a, 0)
		return r
	}
	const j = anchor_error_from(s138, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	const i = ld64(s138 + 8)
	const h = ld64(s138)
	copyr(s118, f, 0x20)
	st64(sf8, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
	r = Error_with_pubkeys(s148, h, i, s118, j)
	q = ld64(s148)
	st64(a + 0x10, ld64(s148 + 8))
	st64(a + 8, q)
	st64(a, 0)
	return r
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

function fn_10e370(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const sf0 = fp - 0xf0, sf1 = fp - 0xf1, sf8 = fp - 0xf8, s118 = fp - 0x118
	let r, s, t, u, y, z: u64
	const f = ld64(b + 8)
	if (8 > f) {
		fn_153150(8, f, 0x100160a90, d, e)
	}
	B9: {
		if (f - 8 >= 0x20) {
			const g = ld64(b)
			const h = ld64(g + 0xe)
			st8(sf0, ld8(g + 0x16))
			st64(sf8, h)
			const j = ld64(sf8 + 1)
			st64(sf0 + 0xe8, 0)
			let i = f - 0x28
			if (i >= 8) {
				let k = 0
				while (true) {
					const l = ld64(g + 0x28 + k)
					st64(sf8 + k, l)
					const m = ld64(sf0 + 0xe8)
					if (m == -1) {
						fn_154730(0x10015fa18, i, k, m == -1, l)
					}
					st64(sf0 + 0xe8, m + 1)
					if (k == 0xe8) {
						y = ld64(sf8)
						z = memcpy(a + 0x30, sf0, 0xe8)
						st16(s118 + 0x14, ld16(g + 0xc))
						st32(s118 + 0x10, ld32(g + 8))
						const p = ld64(g + 0x17)
						const o = ld64(g + 0x1f)
						const n = ld8(g + 0x27)
						st8(s118 + 0x16, h)
						st8(sf0 + 0x17, n)
						st64(sf0 + 0xf, o)
						st64(s118 + 0x17, j)
						st64(sf1, j, p)
						st64(sf8, ld64(s118 + 0x10))
						st64(a + 0x20, ld64(sf0 + 0x10))
						st64(a + 0x18, ld64(sf0 + 8))
						st64(a + 0x10, ld64(sf0))
						st64(a + 8, ld64(sf8))
						st64(a + 0x28, y)
						st64(a, 0)
						return z
					}
					i = i - 8
					k = k + 8
					if (8 > i) {
						const aa = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
						r = aa
						if (0x1f > m + 1) {
							break B9
						}
						fn_153158(m + 1, 0x1e, 0x10015f7e8, t, u)
					}
				}
			}
		}
		const q = de_unexpected_eof_to_unexpected_length_of_input(0x10015f800)
		r = q
	}
	st64(s118 + 0x10, r)
	z = anchor_error_from(s118, 0xbbb /* anchor::AccountDidNotDeserialize */, s, t, u)
	y = ld64(s118 + 8)
	const x = ld64(s118)
	const v = r
	if (2 > (r & 3) - 2) {
		st64(a + 8, x, y)
		st64(a, 1)
		return z
	}
	if ((v & 3) == 0) {
		st64(a + 8, x, y)
		st64(a, 1)
		return z
	}
	const w = ld64(ld64(r + 7))
	if (w == 0) {
		st64(a + 8, x, y)
		st64(a, 1)
		return z
	}
	z = callx(w, ld64(r - 1), w)
	st64(a + 8, x, y)
	st64(a, 1)
	return z
}

function fn_f5d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14ce00(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14d4b8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (points to it), e (value)
function fn_153158(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155b30(a, b, c, d, e)
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

function fn_155738(a: u64, b: u64): u64 {
	return imp__fmt_155760(ld64(a), 1, b)
}
