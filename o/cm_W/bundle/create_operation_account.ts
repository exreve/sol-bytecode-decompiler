// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction create_operation_account: handler + 32 reachable functions
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
interface CreateOperationAccountAccounts { // Accounts struct of instruction create_operation_account as accounts_create_operation_account returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	owner:           at<0x00, ref<AccountInfo>>
	operation_state: at<0x08, ref<AccountInfo>>
}
interface CreateOperationAccountContext { // anchor_lang Context of instruction create_operation_account (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<CreateOperationAccountAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function sol_memset(dst: u64, byte: u64, n: u64): void // memset
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
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
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

// instruction handler: create_operation_account (discriminator sha256("global:create_operation_account")[..8] = 0x6808236d2194573f)
// accounts [idl]: 0 owner [signer, mut, = GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ], 1 operation_state [mut, pda], 2 system_program [= 11111111111111111111111111111111]
// args [idl]: (none)
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
function ix_create_operation_account(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s40 = fp - 0x40, s50 = fp - 0x50, s51 = fp - 0x51, s68 = fp - 0x68, s78 = fp - 0x78, sff8 = fp - 0xff8
	const f = sol_log("Instruction: CreateOperationAccount", 0x23)
	st8(s51, 0xff)
	st64(s50, accounts, accounts_len)
	st64(sff8, s51)
	let j = accounts_create_operation_account(s28, program_id, s50, undef, fp, f)
	const h = ld64(s18)
	let i = ld64(s28 + 8)
	const g = ld64(s28)
	if (g == 0) {
		st64(a + 8, h)
		st64(a, i)
		return j
	}
	st64(s40, g, i, h)
	st8(s18 + 0x10, ld8(s51))
	copyr(s18, s50, 0x10)
	st64(s28, program_id, s40)
	j = fn_4f238(s68, s28, g)
	i = ld64(s68)
	if (i != 2) {
		st64(a + 8, ld64(s68 + 8))
		st64(a, i)
		return j
	}
	j = fn_ccf98(s78, s40, program_id)
	i = ld64(s78)
	st64(a + 8, ld64(s78 + 8))
	st64(a, i)
	return j
}

// Anchor Accounts::try_accounts of instruction create_operation_account (called by ix_create_operation_account; name [str]: from the handler's "Instruction: …" log; was fn_ca710)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: owner (ConstraintMut), operation_state (ConstraintMut, ConstraintRentExempt)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: owner [idl], operation_state [idl]
function accounts_create_operation_account(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s38 = fp - 0x38, s50 = fp - 0x50, s58 = fp - 0x58, s78 = fp - 0x78, sa8 = fp - 0xa8, sc8 = fp - 0xc8, sc9 = fp - 0xc9, sf0 = fp - 0xf0, s108 = fp - 0x108, s120 = fp - 0x120, s128 = fp - 0x128, s130 = fp - 0x130, s138 = fp - 0x138, s140 = fp - 0x140, s150 = fp - 0x150, s160 = fp - 0x160, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s228 = fp - 0x228, s230 = fp - 0x230
	let j, x, y: u64
	st64(s228, a)
	st64(s140, b)
	let z = try_accounts_17a30(s58, c, c, d, e, r0)
	const owner: AccountInfo = ld64(s50)
	let f = ld64(s58)
	if (f == 2) {
		const l = ld64(e - 0xff8)
		st64(s138, owner)
		const k = ld64(c + 8)
		if (k == 0) {
			z = anchor_error_from(s220, 0xbbd /* anchor::AccountNotEnoughKeys */)
			y = ld64(s220)
			x = ld64(s228)
			st64(x + 0x10, ld64(s220 + 8))
			st64(x + 8, y)
			st64(x, 0)
			return z
		}
		st64(s230, l)
		const m: AccountInfo = ld64(c)
		st64(s130, m)
		st64(c + 8, k - 1)
		st64(c, m + 0x30)
		z = try_accounts_18870(s58, c)
		const p = ld64(s50)
		f = ld64(s58)
		if (f == 2) {
			st64(s128, p)
			rent_get(s58)
			copy(s108, s50, 0x18)
			if (ld64(s58) != 0) {
				z = fn_13e628(s210, s108)
				y = ld64(s210)
				x = ld64(s228)
				st64(x + 0x10, ld64(s210 + 8))
				st64(x + 8, y)
				st64(x, 0)
				return z
			}
			copyr(s120, s108, 0x18)
			st64(sa8, 0x10015b1ad, 9)
			// PDA find_program_address(["operation"], program *b)
			Pubkey_find_program_address(s58, sa8, 1, b)
			copyr(sf0, s58, 0x20)
			const q = ld8(s38)
			st8(sc9, q)
			st8(ld64(s230), q)
			const r = m.key
			copyr(sc8, r, 0x20)
			if ((memcmp(sc8, sf0, 0x20) as u32) == 0) {
				st64(s58, s130, s120, s138, s128, sc9, s140)
				z = fn_cb6f8(sa8, s58)
				const operation_state: AccountInfo = ld64(sa8 + 8)
				f = ld64(sa8)
				if (f == 2) {
					if (operation_state.is_writable != 0) {
						AccountInfo_clone_f338(sa8, operation_state)
						st64(s230, fn_147a20(sa8))
						AccountInfo_clone_f338(s58, operation_state)
						AccountInfo_try_data_len(s18, s58)
						const ac = ld64(s18 + 8)
						const ab = ld64(s18)
						if (ab != 0x800000000000001a /* Ok */) {
							st64(s18 + 0x10, ld64(s18 + 0x10))
							st64(s18, ab, ac)
							const ag = fn_13e628(s190, s18)
							const af = ld64(s190)
							const ae = ld64(s228)
							st64(ae + 0x10, ld64(s190 + 8))
							st64(ae + 8, af)
							st64(ae, 0)
							return ptr_drop_in_place_fcd8(sa8, ptr_drop_in_place_fcd8(s58, ag))
						}
						const ad = Rent_is_exempt(s120, ld64(s230), ac)
						ptr_drop_in_place_fcd8(sa8, ptr_drop_in_place_fcd8(s58, ad))
						if (ad != 0) {
							if (owner.is_writable != 0) {
								const ah = owner.key
								copyr(s78, ah, 0x20)
								z = memcmp(s78, 0x1001596e0 /* key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ */, 0x20) as u32
								if (z != 0) {
									fn_88360(s1e0, 0)
									const al = fn_4130(s1f0, ld64(s1e0), ld64(s1e0 + 8), 0x10015b1d0 /* "owner" */, 5)
									const ak = ld64(s1f0 + 8)
									const aj = ld64(s1f0)
									copyr(s58, s78, 0x20)
									st64(s38, 0xa6bd3bcb652bb6e5, 0x648eee6fe68868f5, 0xb1880f9c196055dc, 0xa18a9e05bd73e21f) // key GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ
									z = Error_with_pubkeys(s200, aj, ak, s58, al)
									y = ld64(s200)
									x = ld64(s228)
									st64(x + 0x10, ld64(s200 + 8))
									st64(x + 8, y)
									st64(x, 0)
									return z
								}
								const ai = ld64(s228)
								st64(ai + 0x10, p)
								st64(ai + 8, operation_state)
								st64(ai, owner)
								return z
							}
							anchor_error_from(s1c0, 0x7d0 /* anchor::ConstraintMut */)
							z = fn_4130(s1d0, ld64(s1c0), ld64(s1c0 + 8), 0x10015b1d0 /* "owner" */, 5)
							y = ld64(s1d0)
							x = ld64(s228)
							st64(x + 0x10, ld64(s1d0 + 8))
							st64(x + 8, y)
							st64(x, 0)
							return z
						}
						anchor_error_from(s1a0, 0x7d5 /* anchor::ConstraintRentExempt */)
						z = fn_4130(s1b0, ld64(s1a0), ld64(s1a0 + 8), "operation_state", 0xf)
						y = ld64(s1b0)
						x = ld64(s228)
						st64(x + 0x10, ld64(s1b0 + 8))
						st64(x + 8, y)
						st64(x, 0)
						return z
					}
					anchor_error_from(s170, 0x7d0 /* anchor::ConstraintMut */)
					z = fn_4130(s180, ld64(s170), ld64(s170 + 8), "operation_state", 0xf)
					y = ld64(s180)
					x = ld64(s228)
					st64(x + 0x10, ld64(s180 + 8))
					st64(x + 8, y)
					st64(x, 0)
					return z
				}
				j = ld64(s228)
				st64(j + 0x10, operation_state)
				st64(j + 8, f)
				st64(j, 0)
				return z
			}
			const w = anchor_error_from(s150, 0x7d6 /* anchor::ConstraintSeeds */)
			const s = ld64(0x300000000 /* heap bump-allocator cursor */)
			const u = s != 0 ? sat_sub(s, 0xf) : 0x300007ff1
			const v = ld64(s150 + 8)
			const t = ld64(s150)
			if ((t & 1) != 0) {
				if (0x300000008 > u) {
					raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, u)
				st64(u + 7, 0x65746174735f6e6f)
				st64(u, 0x6f6974617265706f)
				void ld64(v)
			} else {
				if (0x300000008 > u) {
					raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0x300000008)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, u)
				st64(u + 7, 0x65746174735f6e6f)
				st64(u, 0x6f6974617265706f)
				void ld64(v)
			}
			st64(v + 0x10, u, 0xf)
			st64(v + 8, 0xf)
			st64(v, 1)
			copyr(s58, sc8, 0x20)
			copy(s38, sf0, 0x20)
			z = Error_with_pubkeys(s160, t, v, s58, w)
			y = ld64(s160)
			x = ld64(s228)
			st64(x + 0x10, ld64(s160 + 8))
			st64(x + 8, y)
			st64(x, 0)
			return z
		}
		const n = ld64(0x300000000 /* heap bump-allocator cursor */)
		const o = n != 0 ? sat_sub(n, 0xe) : 0x300007ff2
		if ((f & 1) != 0) {
			if (0x300000008 > o) {
				raw_vec_handle_error(1, 0xe, 0x10015f8f8, sat_sub(n, 0xe), 0xe > n)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, o)
			st64(o + 6, 0x6d6172676f72705f)
			st64(o, 0x705f6d6574737973)
			void ld64(p)
		} else {
			if (0x300000008 > o) {
				raw_vec_handle_error(1, 0xe, 0x10015f8f8, sat_sub(n, 0xe), 0xe > n)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, o)
			st64(o + 6, 0x6d6172676f72705f)
			st64(o, 0x705f6d6574737973)
			void ld64(p)
		}
		st64(p + 0x10, o, 0xe)
		st64(p + 8, 0xe)
		st64(p, 1)
		j = ld64(s228)
		st64(j + 0x10, p)
		st64(j + 8, f)
		st64(j, 0)
		return z
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
	j = ld64(s228)
	st64(j + 0x10, owner)
	st64(j + 8, f)
	st64(j, 0)
	return z
}

// types [heur]: b: CreateOperationAccountContext (the handler ix_create_operation_account passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_4f238(a: u64, b: CreateOperationAccountContext, c: u64, d: u64, e: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48
	let m, n: u64
	const f: AccountInfo = b.accounts.operation_state
	const g = f.is_writable
	if (g != 0) {
		const h: DataCell = f.data
		if (h.borrow != 0) {
			st64(s18, 0x800000000000000b /* Err(ProgramError::AccountBorrowFailed) */)
			n = fn_13e628(s38, s18)
			m = ld64(s38)
			st64(a + 8, ld64(s38 + 8))
			st64(a, m)
			return n
		}
		h.borrow = -1
		const i = h.len
		if (i > 7) {
			const j = h.ptr
			let k = ld8(j)
			if (k == 0) {
				k = ld8(j + 1)
				if (k == 0) {
					k = ld8(j + 2)
					if (k == 0) {
						k = ld8(j + 3)
						if (k == 0) {
							k = ld8(j + 4)
							if (k == 0) {
								k = ld8(j + 5)
								if (k == 0) {
									k = ld8(j + 6)
									if (k == 0) {
										k = ld8(j + 7)
										if (k == 0) {
											if (i > 0xdc8) {
												st8(j + 8, ld8(b + 0x20))
												n = memset2(j + 9, 0, 0xdc0)
												h.borrow = h.borrow + 1
												st64(a + 8, h + 0x10)
												st64(a, 2)
												return n
											}
											fn_153158(0xdc9, i, 0x10015f748, k, e)
										}
									}
								}
							}
						}
					}
				}
			}
			n = anchor_error_from(s48, 0xbb8 /* anchor::AccountDiscriminatorAlreadySet */, i, k, e)
			const l = ld64(s48 + 8)
			m = ld64(s48)
			h.borrow = h.borrow + 1
			st64(a + 8, l)
			st64(a, m)
			return n
		}
		fn_153158(8, i, 0x10015f730, d, e)
	}
	n = anchor_error_from(s28, 0xbbe /* anchor::AccountNotMutable */, g, d, e)
	m = ld64(s28)
	st64(a + 8, ld64(s28 + 8))
	st64(a, m)
	return n
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_ccf98(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10
	const j = fn_e30(s10, ld64(b + 8), c)
	let i = undef
	const f = ld64(s10)
	if (f == 2) {
		st64(a + 8, i)
		st64(a, f)
		return j
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0xf) : 0x300007ff1
	i = ld64(s10 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0x300000008, 0xf > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 7, 0x65746174735f6e6f)
		st64(h, 0x6f6974617265706f)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0x300000008, 0xf > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h + 7, 0x65746174735f6e6f)
		st64(h, 0x6f6974617265706f)
		void ld64(i)
	}
	st64(i + 0x10, h, 0xf)
	st64(i + 8, 0xf)
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

function fn_cb6f8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s1 = fp - 0x1, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s61 = fp - 0x61, s78 = fp - 0x78, sd8 = fp - 0xd8, se0 = fp - 0xe0, s100 = fp - 0x100, s120 = fp - 0x120, s138 = fp - 0x138, s150 = fp - 0x150, s158 = fp - 0x158, s178 = fp - 0x178, s1a8 = fp - 0x1a8, s1c0 = fp - 0x1c0, s1e0 = fp - 0x1e0, s1ef = fp - 0x1ef, s1f8 = fp - 0x1f8, s210 = fp - 0x210, s230 = fp - 0x230, s240 = fp - 0x240, s250 = fp - 0x250, s260 = fp - 0x260, s270 = fp - 0x270, s280 = fp - 0x280, s290 = fp - 0x290, s2e0 = fp - 0x2e0, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s320 = fp - 0x320, s328 = fp - 0x328, s330 = fp - 0x330
	let ae, cp, cs, ct: u64
	const f: AccountInfo = ld64(ld64(b))
	const g = fn_147a20(f, b, c, d, e)
	st64(s2e0 + 0x48, a)
	if (g != 0) {
		const k = ld64(b + 0x10)
		const l = ld64(ld64(k))
		copyr(s178, l, 0x20)
		const m = f.key
		copy(s150, m + 8, 0x18)
		st64(s158, ld64(m))
		if ((memcmp(s178, s158, 0x20) as u32) == 0) {
			ErrorCode_name(s138, 0x100159890)
			st64(s60, 0, 1, 0)
			st64(s28, s60, 0x10015f818)
			st8(s28 + 0x18, 3)
			st64(s28 + 0x10, 0x20)
			st64(s48 + 0x10, 0)
			st64(s48, 0)
			if (ErrorCode_fmt(0x100159890, s48) != 0) {
				fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
			}
			copyr(s1f8, s60, 0x18)
			copy(s210, s138, 0x18)
			st64(s230 + 8, 0x10015b1d5)
			st32(s1a8 + 0x10, 0x1005 /* anchor::TryingToInitPayerAsProgramAccount */)
			st8(s1e0, 2)
			st32(s230 + 0x18, 4)
			st64(s230 + 0x10, 0x3f)
			st64(s230, 0)
			const ah = fn_13e5a0(s270, s230)
			const ag = ld64(s270 + 8)
			const af = ld64(s270)
			copy(s230, s178, 0x40)
			cp = Error_with_pubkeys(s280, af, ag, s230, ah)
			const aj = ld64(s280)
			const ai = ld64(s2e0 + 0x48)
			st64(ai + 8, ld64(s280 + 8))
			st64(ai, aj)
			return cp
		}
		st64(s2e0 + 0x40, b)
		const n = max(fn_1476d8(ld64(b + 8), 0xdc9), 1)
		if (n > g) {
			const o: AccountInfo = ld64(k)
			const p: LamportsCell = o.lamports
			const ao = o.key
			const ap = ld64(s2e0 + 0x40)
			rc_inc(p)
			const ak: DataCell = o.data
			rc_inc(ak)
			const al: LamportsCell = f.lamports
			st64(s2e0 + 0x38, al)
			const am = al.strong
			st64(s2e0 + 8, f.key)
			st64(s2e0 + 0x10, o.executable)
			st64(s2e0 + 0x18, o.is_writable)
			st64(s2e0 + 0x20, o.is_signer)
			st64(s2e0 + 0x28, o.rent_epoch)
			st64(s2e0 + 0x30, o.owner)
			rc_inc(ld64(s2e0 + 0x38), am)
			const an: DataCell = f.data
			rc_inc(an)
			st64(s2f0, ak, ao)
			const aq: AccountInfo = ld64(ld64(ap + 0x18))
			const ar: LamportsCell = aq.lamports
			const at = ar.strong
			st64(s2e0, p)
			st64(s320 + 0x10, f.executable)
			st64(s320 + 0x18, f.is_writable)
			st64(s320 + 0x20, f.is_signer)
			st64(s320 + 0x28, f.rent_epoch)
			const aw = f.owner
			const ax = aq.key
			rc_inc(ar, at)
			st64(s328, an)
			const au: DataCell = aq.data
			const av = au.strong
			st64(s320, ax, sat_sub(n, g))
			rc_inc(au, av)
			const bc = aq.owner
			const bb = aq.rent_epoch
			const ba = aq.is_signer
			const az = aq.is_writable
			const ay = aq.executable
			st8(sd8 + 0x5a, ld64(s320 + 0x10))
			st8(sd8 + 0x59, ld64(s320 + 0x18))
			st8(sd8 + 0x58, ld64(s320 + 0x20))
			st64(sd8 + 0x50, ld64(s320 + 0x28))
			st64(sd8 + 0x48, aw)
			st64(sd8 + 0x40, ld64(s328))
			st64(sd8 + 0x38, ld64(s2e0 + 0x38))
			st64(sd8 + 0x30, ld64(s2e0 + 8))
			st8(sd8 + 0x2a, ld64(s2e0 + 0x10))
			st8(sd8 + 0x29, ld64(s2e0 + 0x18))
			st8(sd8 + 0x28, ld64(s2e0 + 0x20))
			st64(sd8 + 0x20, ld64(s2e0 + 0x28))
			st64(sd8 + 0x18, ld64(s2e0 + 0x30))
			st64(sd8 + 0x10, ld64(s2f0))
			copyr(sd8, s2e8, 0x10)
			st8(se0, ba, az, ay)
			st64(s100, ar, au, bc, bb)
			st64(s120 + 0x18, ld64(s320))
			st64(s78, 8, 0)
			st64(s120, 0, 8, 0)
			cp = system_program_transfer(s240, s120, ld64(s320 + 8))
			ae = ld64(s240)
			if (ae != 2) {
				ct = ld64(s240 + 8)
				cs = ld64(s2e0 + 0x48)
				st64(cs, ae, ct)
				return cp
			}
		}
		const bd: LamportsCell = f.lamports
		st64(s2e0 + 0x38, bd)
		const be = bd.strong
		const bl = f.key
		const bg = ld64(s2e0 + 0x40)
		rc_inc(ld64(s2e0 + 0x38), be)
		const bf: DataCell = f.data
		rc_inc(bf)
		st64(s2e0 + 0x30, bf)
		const bh = ld64(bg + 0x18)
		const bi: AccountInfo = ld64(bh)
		const bj: LamportsCell = bi.lamports
		const bk = bj.strong
		st64(s2e0 + 0x18, f.executable)
		st64(s2e0 + 0x20, f.is_writable)
		st64(s2e0 + 0x28, f.is_signer)
		const bo = f.rent_epoch
		const bn = f.owner
		st64(s2e0 + 0x10, bi.key)
		rc_inc(bj, bk)
		st64(s2e0 + 8, bl)
		const bm: DataCell = bi.data
		rc_inc(bm)
		st64(s2f0, bh)
		const bu = bi.owner
		const bt = bi.rent_epoch
		const bs = bi.is_signer
		st64(s2e0, bn)
		const br = bi.is_writable
		const bq = bi.executable
		const bp = ld8(ld64(ld64(s2e0 + 0x40) + 0x20))
		st64(s2e8, bo)
		st64(s48 + 0x10, s61)
		st64(s48, 0x10015b1ad)
		st8(s61, bp)
		st64(s60, s48)
		st64(s1c0 + 8, s60)
		st8(s1c0, bs, br, bq)
		st64(s1e0, bj, bm, bu, bt)
		st64(s1ef + 7, ld64(s2e0 + 0x10))
		st8(s1ef + 1, ld64(s2e0 + 0x18))
		st8(s1ef, ld64(s2e0 + 0x20))
		st8(s1f8 + 8, ld64(s2e0 + 0x28))
		st64(s1f8, ld64(s2e8))
		st64(s210 + 0x10, ld64(s2e0))
		st64(s210 + 8, ld64(s2e0 + 0x30))
		st64(s210, ld64(s2e0 + 0x38))
		st64(s230 + 0x18, ld64(s2e0 + 8))
		st64(s48 + 0x18, 1)
		st64(s48 + 8, 9)
		st64(s60 + 8, 2)
		st64(s1c0 + 0x10, 1)
		st64(s230, 0, 8, 0)
		cp = system_program_assign_13fb30(s250, s230, 0xdc9)
		ae = ld64(s250)
		if (ae != 2) {
			ct = ld64(s250 + 8)
			cs = ld64(s2e0 + 0x48)
			st64(cs, ae, ct)
			return cp
		}
		const bv: LamportsCell = f.lamports
		const ca = f.key
		rc_inc(bv)
		const bw: DataCell = f.data
		rc_inc(bw)
		st64(s2e0 + 0x30, bw)
		const bx: AccountInfo = ld64(ld64(s2f0))
		const by: LamportsCell = bx.lamports
		const bz = by.strong
		st64(s2e0 + 0x38, ca)
		st64(s2e0 + 0x20, f.executable)
		st64(s2e0 + 0x28, f.is_writable)
		const cd = f.is_signer
		const ce = f.rent_epoch
		const ck = f.owner
		st64(s2e0 + 0x18, bx.key)
		rc_inc(by, bz)
		const cb: DataCell = bx.data
		const cc = cb.strong
		st64(s2e0, cd, ce, bv)
		rc_inc(cb, cc)
		const cj = bx.owner
		const ci = bx.rent_epoch
		const ch = bx.is_signer
		const cg = bx.is_writable
		const cf = bx.executable
		st64(s1c0 + 8, s60)
		st8(s1c0, ch, cg, cf)
		st64(s1e0, by, cb, cj, ci)
		st64(s1ef + 7, ld64(s2e0 + 0x18))
		st8(s1ef + 1, ld64(s2e0 + 0x20))
		st8(s1ef, ld64(s2e0 + 0x28))
		st8(s1f8 + 8, ld64(s2e0))
		st64(s1f8, ld64(s2e0 + 8))
		st64(s210 + 0x10, ck)
		st64(s210 + 8, ld64(s2e0 + 0x30))
		st64(s210, ld64(s2e0 + 0x10))
		st64(s230 + 0x18, ld64(s2e0 + 0x38))
		st64(s60, s48)
		st64(s48 + 0x10, s138)
		st64(s48, 0x10015b1ad)
		st8(s138, ld8(s61))
		st64(s1c0 + 0x10, 1)
		st64(s230, 0, 8, 0)
		st64(s60 + 8, 2)
		st64(s48 + 0x18, 1)
		st64(s48 + 8, 9)
		cp = system_program_assign_13ff40(s260, s230, ld64(ld64(ld64(s2e0 + 0x40) + 0x28)))
		ae = ld64(s260)
		if (ae != 2) {
			ct = ld64(s260 + 8)
			cs = ld64(s2e0 + 0x48)
			st64(cs, ae, ct)
			return cp
		}
	} else {
		st64(s2e0 + 0x38, fn_1476d8(ld64(b + 8), 0xdc9))
		const h: AccountInfo = ld64(ld64(b + 0x10))
		const i: LamportsCell = h.lamports
		st64(s2e0 + 0x40, i)
		const j = i.strong
		const u = h.key
		rc_inc(ld64(s2e0 + 0x40), j)
		const q: DataCell = h.data
		rc_inc(q)
		const r: LamportsCell = f.lamports
		const s = r.strong
		st64(s2e0 + 0x10, f.key)
		st64(s2e0 + 0x18, h.executable)
		st64(s2e0 + 0x20, h.is_writable)
		st64(s2e0 + 0x28, h.is_signer)
		st64(s2e0 + 0x30, h.rent_epoch)
		const y = h.owner
		rc_inc(r, s)
		st64(s2e0 + 8, r)
		const t: DataCell = f.data
		rc_inc(t)
		st64(s2e8, q, u)
		const v: AccountInfo = ld64(ld64(b + 0x18))
		const w: LamportsCell = v.lamports
		const x = w.strong
		st64(s320 + 0x10, f.executable)
		st64(s320 + 0x18, f.is_writable)
		st64(s320 + 0x20, f.is_signer)
		st64(s320 + 0x28, f.rent_epoch)
		const aa = f.owner
		st64(s2f0, v.key)
		rc_inc(w, x)
		st64(s320 + 8, y)
		const z: DataCell = v.data
		rc_inc(z)
		st64(s320, v.owner)
		st64(s328, v.rent_epoch)
		st64(s330, v.is_signer)
		const ad = v.is_writable
		const ac = v.executable
		const ab = ld8(ld64(b + 0x20))
		st64(s48 + 0x10, s138)
		st64(s48, 0x10015b1ad)
		st8(s138, ab)
		st64(s60, s48)
		st64(s1a8 + 0x20, s60)
		st8(s1a8 + 0x1a, ld64(s320 + 0x10))
		st8(s1a8 + 0x19, ld64(s320 + 0x18))
		st8(s1a8 + 0x18, ld64(s320 + 0x20))
		st64(s1a8 + 0x10, ld64(s320 + 0x28))
		st64(s1a8, t, aa)
		st64(s1c0 + 0x10, ld64(s2e0 + 8))
		st64(s1c0 + 8, ld64(s2e0 + 0x10))
		st8(s1c0 + 2, ld64(s2e0 + 0x18))
		st8(s1c0 + 1, ld64(s2e0 + 0x20))
		st8(s1c0, ld64(s2e0 + 0x28))
		st64(s1e0 + 0x18, ld64(s2e0 + 0x30))
		st64(s1e0 + 0x10, ld64(s320 + 8))
		st64(s1e0 + 8, ld64(s2e8))
		st64(s1e0, ld64(s2e0 + 0x40))
		st64(s1ef + 7, ld64(s2e0))
		st8(s1ef, ad, ac)
		st8(s1f8 + 8, ld64(s330))
		st64(s1f8, ld64(s328))
		st64(s210 + 0x10, ld64(s320))
		st64(s210, w, z)
		st64(s230 + 0x18, ld64(s2f0))
		st64(s48 + 0x18, 1)
		st64(s48 + 8, 9)
		st64(s60 + 8, 2)
		st64(s1a8 + 0x28, 1)
		st64(s230, 0, 8, 0)
		cp = system_program_create_account(s290, s230, ld64(s2e0 + 0x38), 0xdc9, ld64(ld64(b + 0x28)))
		ae = ld64(s290)
		if (ae != 2) {
			ct = ld64(s290 + 8)
			cs = ld64(s2e0 + 0x48)
			st64(cs, ae, ct)
			return cp
		}
	}
	const cm = ld64(s2e0 + 0x48)
	cp = fn_4688(s230, f)
	const cn = ld64(s230 + 8)
	const cl = ld64(s230)
	if (cl == 2) {
		st64(cm + 8, cn)
		st64(cm, 2)
		return cp
	}
	const co = ld64(0x300000000 /* heap bump-allocator cursor */)
	cp = 0xf > co
	const cq = cp != 0 ? 0 : co - 0xf
	const cr = co != 0 ? cq : 0x300007ff1
	if ((cl & 1) != 0) {
		if (0x300000008 > cr) {
			raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0x300000008, cq)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, cr)
		st64(cr + 7, 0x65746174735f6e6f)
		st64(cr, 0x6f6974617265706f)
		void ld64(cn)
	} else {
		if (0x300000008 > cr) {
			raw_vec_handle_error(1, 0xf, 0x10015f8f8, 0x300000008, cq)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, cr)
		st64(cr + 7, 0x65746174735f6e6f)
		st64(cr, 0x6f6974617265706f)
		void ld64(cn)
	}
	st64(cn + 0x10, cr, 0xf)
	st64(cn + 8, 0xf)
	st64(cn, 1)
	st64(cm + 8, cn)
	st64(cm, cl)
	return cp
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (points to it), e (value)
function fn_153158(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155b30(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), c (value)
function memset2(a: u64, b: u64, c: u64): u64 {
	sol_memset(a, b as u8, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (value)
function fn_e30(a: u64, b: u64, c: u64): u64 {
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
	g = fn_13e070(s20, 0x100159368, 8)
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

function fn_4688(a: u64, b: AccountInfo): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60
	let f = b
	const g = b.owner
	let h = memcmp(g, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20) as u32
	if (h == 0) {
		st64(a, 2, f)
		return h
	}
	const k = anchor_error_from(s50, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
	const j = ld64(s50 + 8)
	const i = ld64(s50)
	copyr(s40, g, 0x20)
	st64(s20, 0xb55dcf049ecad5a5 /* RAYDIUM_CLMM_PROGRAM */, 0xb12ce32fba14b790 /* RAYDIUM_CLMM_PROGRAM[1] */, 0x22b792c1c13f1359 /* RAYDIUM_CLMM_PROGRAM[2] */, 0x1e40b09cd307fd57 /* RAYDIUM_CLMM_PROGRAM[3] */) // key CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
	h = Error_with_pubkeys(s60, i, j, s40, k)
	f = ld64(s60 + 8)
	st64(a, ld64(s60))
	st64(a + 8, f)
	return h
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: AccountInfo, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_154730(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622d0, 1, 8, 0, 0)
	// fmt "attempt to add with overflow"
	fn_14ec00(s30, a, c, d, e)
}

function fn_1547e0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622f0, 1, 8, 0, 0)
	// fmt "attempt to multiply with overflow"
	fn_14ec00(s30, a, c, d, e)
}

function fn_f5d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, b, c, d, e)
}

function fn_155738(a: u64, b: u64): u64 {
	return imp__fmt_155760(ld64(a), 1, b)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14ce00(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14d4b8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14d4b8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	custom_panic(a, b, c, d, e)
	abort()
}
