// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction close_limit_order: handler + 35 reachable functions
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
interface CloseLimitOrderAccounts { // Accounts struct of instruction close_limit_order as accounts_close_limit_order returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	signer:      at<0x00, ref<AccountInfo>>
	limit_order: at<0x10, ref<AccountInfo>>
}
interface CloseLimitOrderContext { // anchor_lang Context of instruction close_limit_order (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<CloseLimitOrderAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function fn_f128(a: u64): u64 // lib uses alloc_handle_alloc_error, Error__new
declare function fn_15cc8(a: u64, b: u64): u64 // lib
declare function try_accounts_17a30(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function Error_new_13c880(): u64 // lib std::io::error::Error::new
declare function Rc_drop_slow_13cfe8(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function Rc_drop_slow_13d038(a: u64, r0: u64): u64 // lib alloc::rc::Rc<T,A>::drop_slow
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function Error_with_pubkeys(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib anchor_lang::error::Error::with_pubkeys
declare function ErrorCode_name(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib anchor_lang::error::ErrorCode::name
declare function ErrorCode_fmt(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib <anchor_lang::error::ErrorCode as core::fmt::Display>::fmt
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function memset(a: u64, b: u64, c: u64, r0: u64): u64 // lib uses sol_memset
declare function AccountInfo_assign(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::assign
declare function de_unexpected_eof_to_unexpected_length_of_input(a: u64): u64 // lib borsh::de::unexpected_eof_to_unexpected_length_of_input
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fn_14de10(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib "a formatting trait implementation return…"
declare function fmt_write(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib core::fmt::write
declare function imp__fmt_154cb0(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u8>::_fmt
declare function imp__fmt_155760(a: u64, b: u64, c: u64): u64 // lib core::fmt::num::imp::<impl u64>::_fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp

// instruction handler: close_limit_order (discriminator sha256("global:close_limit_order")[..8] = 0xfa2557d50f807c4c)
// accounts [idl]: 0 signer [signer], 1 rent_receiver [mut], 2 limit_order [mut]
// args [idl]: (none)
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len
function ix_close_limit_order(a: u64, program_id: u64, accounts: u64, accounts_len: u64): u64 {
	const sb0 = fp - 0xb0, sc0 = fp - 0xc0, s170 = fp - 0x170, s180 = fp - 0x180, s190 = fp - 0x190, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0
	const f = sol_log("Instruction: CloseLimitOrder", 0x1c)
	st64(s190, accounts, accounts_len)
	let j = accounts_close_limit_order(sc0, undef, s190, undef, fp, f)
	const h = ld64(sc0 + 8)
	let i = ld64(sc0)
	const g = ld8(sb0 + 0xac)
	if (g == 2) {
		st64(a + 8, h)
		st64(a, i)
		return j
	}
	memcpy(s170, sb0, 0xac)
	st16(s170 + 0xad, ld16(sb0 + 0xad))
	st8(s170 + 0xaf, ld8(sb0 + 0xaf))
	st8(s170 + 0xac, g)
	st64(s180, i, h)
	copyr(sb0, s190, 0x10)
	st64(sc0, program_id, s180)
	j = fn_551a8(s1a0, sc0)
	i = ld64(s1a0)
	if (i == 2) {
		j = fn_ee970(s1b0, s180, program_id)
		i = ld64(s1b0)
		st64(a + 8, ld64(s1b0 + 8))
		st64(a, i)
		return j
	}
	st64(a + 8, ld64(s1a0 + 8))
	st64(a, i)
	return j
}

// Anchor Accounts::try_accounts of instruction close_limit_order (called by ix_close_limit_order; name [str]: from the handler's "Instruction: …" log; was fn_ed8b8)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: limit_order (ConstraintAddress, ConstraintMut)
// names [str: account-error string on the failing branch; which variable holds the account is inferred; [idl]: also an account name in the IDL]: limit_order [idl], limit_order_2 [idl]
function accounts_close_limit_order(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, se8 = fp - 0xe8, s100 = fp - 0x100, s1a8 = fp - 0x1a8, s1b8 = fp - 0x1b8, s240 = fp - 0x240, s258 = fp - 0x258, s278 = fp - 0x278, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f0 = fp - 0x2f0, s2f8 = fp - 0x2f8, s300 = fp - 0x300
	let j, o, p, q, ak, al, am, ao, aq: u64
	let n = a
	let h = try_accounts_17a30(s1b8, c, c, d, e, r0)
	const m = ld64(s1b8 + 8)
	let f = ld64(s1b8)
	if (f != 2) {
		const i = ld64(0x300000000 /* heap bump-allocator cursor */)
		j = 6 > i
		const k = j != 0 ? 0 : i - 6
		const l = i != 0 ? k : 0x300007ffa
		if ((f & 1) != 0) {
			if (0x300000008 > l) {
				raw_vec_handle_error(1, 6, 0x10015f8f8, k, j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, l)
			st16(l + 4, 0x7265)
			st32(l, 0x6e676973)
			void ld64(m)
		} else {
			if (0x300000008 > l) {
				raw_vec_handle_error(1, 6, 0x10015f8f8, k, j)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, l)
			st16(l + 4, 0x7265)
			st32(l, 0x6e676973)
			void ld64(m)
		}
		st64(m + 0x10, l, 6)
		st64(m + 8, 6)
		st64(m, 1)
		st64(n + 8, m)
		st64(n, f)
		st8(n + 0xbc, 2)
		return h
	}
	const g = ld64(c + 8)
	if (g == 0) {
		anchor_error_from(s278, 0xbbd /* anchor::AccountNotEnoughKeys */, o, p, q)
		h = ld64(s278 + 8)
		f = ld64(s278)
		if (f != 2) {
			const ah = ld64(0x300000000 /* heap bump-allocator cursor */)
			j = 0xd > ah
			const ai = j != 0 ? 0 : ah - 0xd
			const aj = ah != 0 ? ai : 0x300007ff3
			if ((f & 1) != 0) {
				if (0x300000008 > aj) {
					raw_vec_handle_error(1, 0xd, 0x10015f8f8, ai, j)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, aj)
				st64(aj + 5, 0x7265766965636572)
				st64(aj, 0x6365725f746e6572)
				void ld64(h)
			} else {
				if (0x300000008 > aj) {
					raw_vec_handle_error(1, 0xd, 0x10015f8f8, ai, j)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, aj)
				st64(aj + 5, 0x7265766965636572)
				st64(aj, 0x6365725f746e6572)
				void ld64(h)
			}
			st64(h + 0x10, aj, 0xd)
			st64(h + 8, 0xd)
			st64(h, 1)
			st64(n + 8, h)
			st64(n, f)
			st8(n + 0xbc, 2)
			return h
		}
	} else {
		st64(c + 8, g - 1)
		h = ld64(c)
		st64(c, h + 0x30)
	}
	st64(s2e8, h, n)
	h = fn_181f8(s1b8, c, o, p, q)
	const v = ld64(s1b8 + 8)
	const t = ld64(s1b8)
	const r = ld8(s1a8 + 0x9c)
	if (r == 2) {
		const s = ld64(0x300000000 /* heap bump-allocator cursor */)
		const u = s != 0 ? sat_sub(s, 0xb) : 0x300007ff5
		if ((t & 1) != 0) {
			if (0x300000008 > u) {
				raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0xb > s)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, u)
			st64(u, 0x726f5f74696d696c)
			st32(u + 7, 0x72656472)
			void ld64(v)
		} else {
			if (0x300000008 > u) {
				raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0xb > s)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, u)
			st64(u, 0x726f5f74696d696c)
			st32(u + 7, 0x72656472)
			void ld64(v)
		}
		st64(v + 0x10, u, 0xb)
		st64(v + 8, 0xb)
		st64(v, 1)
		const w = ld64(s2e8 + 8)
		st64(w + 8, v)
		st64(w, t)
		st8(w + 0xbc, 2)
		return h
	}
	st64(s2f0, r)
	memcpy(s100, s1a8, 0x9c)
	st16(s1a8 + 0xa4, ld16(s1a8 + 0x9d))
	st8(s1a8 + 0xa6, ld8(s1a8 + 0x9f))
	st64(s300, v)
	st64(s278 + 0x18, v)
	st64(s2f8, t)
	st64(s278 + 0x10, t)
	const x = ld64(s2f0)
	memcpy(s258, s100, 0x9c)
	st8(s240 + 0x84, x)
	st16(s240 + 0x85, ld16(s1a8 + 0xa4))
	st8(s240 + 0x87, ld8(s1a8 + 0xa6))
	const y = ld64(m)
	copyr(s60, y, 0x20)
	const z = memcmp(s60, s240, 0x20)
	if ((z as u32) != 0) {
		copyr(s1b8, y, 0x20)
		const aa = memcmp(s1b8, 0x1001595a0 /* key Ray8HHtixhL9zvnokMyELCVGp622PDPJj96zcVC9RWp */, 0x20)
		if ((aa as u32) != 0) {
			h = anchor_error_from(s288, 0x7d3 /* anchor::ConstraintRaw */, ak, al, am)
			const an = ld64(0x300000000 /* heap bump-allocator cursor */)
			j = ld64(s2e8 + 8)
			const ap = an != 0 ? sat_sub(an, 6) : 0x300007ffa
			aq = ld64(s288 + 8)
			ao = ld64(s288)
			if ((ao & 1) != 0) {
				if (0x300000008 > ap) {
					raw_vec_handle_error(1, 6, 0x10015f8f8, 0x300000008, j)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ap)
				st16(ap + 4, 0x7265)
				st32(ap, 0x6e676973)
				void ld64(aq)
			} else {
				if (0x300000008 > ap) {
					raw_vec_handle_error(1, 6, 0x10015f8f8, 0x300000008, j)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, ap)
				st16(ap + 4, 0x7265)
				st32(ap, 0x6e676973)
				void ld64(aq)
			}
			st64(aq + 0x10, ap, 6)
			st64(aq + 8, 6)
			st64(aq, 1)
			st64(j + 8, aq)
			st64(j, ao)
			st8(j + 0xbc, 2)
			return h
		}
	}
	const limit_order: AccountInfo = ld64(s2e8)
	if (limit_order.is_writable != 0) {
		const ac = limit_order.key
		copyr(s40, ac, 0x20)
		copy(s20, se8, 0x20)
		if ((memcmp(s40, s20, 0x20) as u32) != 0) {
			const ay = anchor_error_from(s2a8, 0x7dc /* anchor::ConstraintAddress */)
			j = undef
			const au = ld64(0x300000000 /* heap bump-allocator cursor */)
			n = ld64(s2e8 + 8)
			const aw = au != 0 ? sat_sub(au, 0xd) : 0x300007ff3
			const ax = ld64(s2a8 + 8)
			const av = ld64(s2a8)
			if ((av & 1) != 0) {
				if (0x300000008 > aw) {
					raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0x300000008, j)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, aw)
				st64(aw + 5, 0x7265766965636572)
				st64(aw, 0x6365725f746e6572)
				void ld64(ax)
			} else {
				if (0x300000008 > aw) {
					raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0x300000008, j)
				}
				st64(0x300000000 /* heap bump-allocator cursor */, aw)
				st64(aw + 5, 0x7265766965636572)
				st64(aw, 0x6365725f746e6572)
				void ld64(ax)
			}
			st64(ax + 0x10, aw, 0xd)
			st64(ax + 8, 0xd)
			st64(ax, 1)
			copy(s1b8, s40, 0x40)
			h = Error_with_pubkeys(s2b8, av, ax, s1b8, ay)
			f = ld64(s2b8)
			st64(n + 8, ld64(s2b8 + 8))
			st64(n, f)
			st8(n + 0xbc, 2)
			return h
		}
		const limit_order_2: AccountInfo = ld64(s2f8)
		if (limit_order_2.is_writable != 0) {
			const ae = ld64(s2e8 + 8)
			h = memcpy(ae + 0x20, s100, 0x9c)
			const ag = ld8(s1a8 + 0xa6)
			const af = ld16(s1a8 + 0xa4)
			st8(ae + 0xbc, x)
			st64(ae + 0x18, ld64(s300))
			st64(ae + 0x10, limit_order_2)
			st64(ae + 8, ld64(s2e8))
			st64(ae, m)
			st16(ae + 0xbd, af)
			st8(ae + 0xbf, ag)
			return h
		}
		anchor_error_from(s2c8, 0x7d0 /* anchor::ConstraintMut */, undef, limit_order_2)
		h = fn_4130(s2d8, ld64(s2c8), ld64(s2c8 + 8), 0x10015b336 /* "limit_order" */, 0xb)
		const ba = ld64(s2d8)
		const az = ld64(s2e8 + 8)
		st64(az + 8, ld64(s2d8 + 8))
		st64(az, ba)
		st8(az + 0xbc, 2)
		return h
	}
	h = anchor_error_from(s298, 0x7d0 /* anchor::ConstraintMut */, ak, al, am)
	const ar = ld64(0x300000000 /* heap bump-allocator cursor */)
	j = ld64(s2e8 + 8)
	const at = ar != 0 ? sat_sub(ar, 0xd) : 0x300007ff3
	aq = ld64(s298 + 8)
	ao = ld64(s298)
	if ((ao & 1) != 0) {
		if (0x300000008 > at) {
			raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0x300000008, j)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, at)
		st64(at + 5, 0x7265766965636572)
		st64(at, 0x6365725f746e6572)
		void ld64(aq)
	} else {
		if (0x300000008 > at) {
			raw_vec_handle_error(1, 0xd, 0x10015f8f8, 0x300000008, j)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, at)
		st64(at + 5, 0x7265766965636572)
		st64(at, 0x6365725f746e6572)
		void ld64(aq)
	}
	st64(aq + 0x10, at, 0xd)
	st64(aq + 8, 0xd)
	st64(aq, 1)
	st64(j + 8, aq)
	st64(j, ao)
	st8(j + 0xbc, 2)
	return h
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: AccountInfo, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// types [heur]: b: CloseLimitOrderContext (the handler ix_close_limit_order passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_551a8(a: u64, b: CloseLimitOrderContext): u64 {
	const s1 = fp - 0x1, s20 = fp - 0x20, s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s78 = fp - 0x78, sf0 = fp - 0xf0, sf8 = fp - 0xf8, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138
	const accounts: CloseLimitOrderAccounts = b.accounts
	let h = fn_667d0(s118, accounts + 0x18)
	let g = ld64(s118)
	if (g != 2) {
		st64(a + 8, ld64(s118 + 8))
		st64(a, g)
		return h
	}
	if (ld64(s118 + 8) == 0) {
		const i: AccountInfo = ld64(accounts + 8)
		const j: LamportsCell = i.lamports
		const p = i.key
		rc_inc(j)
		const k: DataCell = i.data
		rc_inc(k)
		const o = i.owner
		const n = i.rent_epoch
		const m = i.is_signer
		const l = i.is_writable
		st8(s20 + 2, i.executable)
		st8(s20, m, l)
		st64(s48, p, j, k, o, n)
		const limit_order: AccountInfo = accounts.limit_order
		const r: LamportsCell = limit_order.lamports
		const x = limit_order.key
		rc_inc(r)
		const s: DataCell = limit_order.data
		rc_inc(s)
		const w = limit_order.owner
		const v = limit_order.rent_epoch
		const u = limit_order.is_signer
		const t = limit_order.is_writable
		st8(sf0 + 2, limit_order.executable)
		st8(sf0, u, t)
		st64(s118, x, r, s, w, v)
		h = fn_13e190(s138, s118, s48, s, w)
		const y = ld64(s138)
		if (y == 2) {
			st64(a + 8, undef)
			st64(a, 2)
			return h
		}
		st64(a + 8, ld64(s138 + 8))
		st64(a, y)
		return h
	}
	fn_85138(s78, 0x100159834)
	st64(s60, 0, 1, 0)
	st64(s28, s60, 0x10015f818)
	st8(s20 + 0x10, 3)
	st64(s20 + 8, 0x20)
	st64(s48 + 0x10, 0)
	st64(s48, 0)
	if (fn_88558(0x100159834, s48) != 0) {
		fn_14ed60("a Display implementation returned an error unexpectedly", 0x37, s1, 0x10015f848, 0x10015f868)
	}
	copy(sf8, s78, 0x30)
	st64(s118 + 8, 0x10015a309)
	st32(sf0 + 0x70, 0x179a /* error::InvalidLimitOrderAmount */)
	st8(sf0 + 0x28, 2)
	st32(s118 + 0x18, 0x17)
	st64(s118 + 0x10, 0x3e)
	st64(s118, 0)
	h = fn_13e5a0(s128, s118)
	g = ld64(s128)
	st64(a + 8, ld64(s128 + 8))
	st64(a, g)
	return h
}

function fn_ee970(a: u64, b: u64, c: u64): u64 {
	const s10 = fp - 0x10
	const j = fn_af28(s10, b + 0x10, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, c)
	let i = undef
	const f = ld64(s10)
	if (f == 2) {
		st64(a + 8, i)
		st64(a, f)
		return j
	}
	const g = ld64(0x300000000 /* heap bump-allocator cursor */)
	const h = g != 0 ? sat_sub(g, 0xb) : 0x300007ff5
	i = ld64(s10 + 8)
	if ((f & 1) != 0) {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, 0xb > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x726f5f74696d696c)
		st32(h + 7, 0x72656472)
		void ld64(i)
	} else {
		if (0x300000008 > h) {
			raw_vec_handle_error(1, 0xb, 0x10015f8f8, 0x300000008, 0xb > g)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, h)
		st64(h, 0x726f5f74696d696c)
		st32(h + 7, 0x72656472)
		void ld64(i)
	}
	st64(i + 0x10, h, 0xb)
	st64(i + 8, 0xb)
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

// types [heur]: d: DataCell (every call passes one: fn_551a8, fn_a8b80, fn_d36e0, …)
function fn_13e190(a: u64, b: u64, c: u64, d: DataCell, e: u64): u64 {
	const s18 = fp - 0x18
	const f = fn_147a20(c, b, c, d, e)
	let g = f
	const h = fn_147a20(b)
	if (f > f + h) {
		fn_14e940(0x100161420, f + h)
	}
	const i = ld64(c + 8)
	const j = ld64(i + 0x10)
	if (j == 0) {
		const k = h + g
		st64(i + 0x10, -1)
		st64(ld64(i + 0x18), k)
		st64(i + 0x10, ld64(i + 0x10) + 1)
		const l = ld64(b + 8)
		const m = ld64(l + 0x10)
		if (m == 0) {
			st64(l + 0x10, -1)
			st64(ld64(l + 0x18), 0)
			st64(l + 0x10, ld64(l + 0x10) + 1)
			let n = memset(s18, b, 0, AccountInfo_assign(b, 0x100159560, k))
			let o = 2
			if (ld64(s18) != 0x800000000000001a /* Ok */) {
				n = __rust_alloc(0x80, 8)
				g = n
				if (n == 0) {
					alloc_handle_alloc_error(8, 0x80)
				}
				st64(g, 2)
				copy(g + 0x20, s18, 0x18)
				st8(g + 0x38, 2)
				o = 1
			}
			const t = o
			const p = ld64(c + 8)
			if (rc_release(p)) {
				n = Rc_drop_slow_13cfe8(c + 8, n)
			}
			const q = ld64(c + 0x10)
			if (rc_release(q)) {
				n = Rc_drop_slow_13d038(c + 0x10, n)
			}
			const r = ld64(b + 8)
			if (rc_release(r)) {
				n = Rc_drop_slow_13cfe8(b + 8, n)
			}
			const s = ld64(b + 0x10)
			if (!rc_release(s)) {
				st64(a + 8, g)
				st64(a, t)
				return n
			}
			n = Rc_drop_slow_13d038(b + 0x10, n)
			st64(a + 8, g)
			st64(a, t)
			return n
		}
		fn_14e770(0x1001613f0, m)
	}
	fn_14e770(0x100161408, j)
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

function fn_f5d8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	return fmt_write(a, b, c, d, e)
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

function fn_14e940(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14ec30("called `Option::unwrap()` on a `None` value", 0x2b, a, d, e)
}

function fn_14e770(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s1 = fp - 0x1, s18 = fp - 0x18, s48 = fp - 0x48
	st64(s48, 0x100162320)
	st64(s48 + 0x10, s18)
	st64(s18, s1, BorrowMutError_fmt)
	st64(s48 + 0x20, 0)
	st64(s48 + 8, 1)
	st64(s48 + 0x18, 1)
	// fmt "already borrowed: {}" {} = *s1 [BorrowMutError_fmt]
	fn_14ec00(s48, a, c, d, e)
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

function fn_14ec30(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s10 = fp - 0x10, s38 = fp - 0x38, s40 = fp - 0x40
	st64(s40, s10)
	st64(s10, a, b)
	st64(s38, 1, 8, 0, 0)
	fn_14ec00(s40, c, c, s10, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_14ce00(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14d4b8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_154730(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s30 = fp - 0x30
	st64(s30, 0x1001622d0, 1, 8, 0, 0)
	// fmt "attempt to add with overflow"
	fn_14ec00(s30, a, c, d, e)
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), e (value)
function fn_153150(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_155a68(a, b, c, d, e)
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
