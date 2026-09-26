// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction idl_create_account: handler + 10 reachable functions
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
declare function sol_invoke_signed_rust(ix: u64, accountInfos: u64, accountInfosLen: u64, signerSeeds: u64, signerSeedsLen: u64): u64 // CPI (Rust ABI: &Instruction, &[AccountInfo], &[&[&[u8]]])
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function ptr_drop_in_place_c1b0(a: u64, r0: u64): u64 // lib core::ptr::drop_in_place<[solana_program::account_info::AccountInfo; 4]>
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_11f118(a: u64, b: u64, c: u64): u64 // lib uses memcpy, anchor_error_from
declare function fn_11f7a0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, callx
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function rent_get(a: u64): u64 // lib solana_sysvar::rent::<impl solana_sysvar::Sysvar for solana_rent::Rent>::get
declare function fn_1423c0(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 // lib uses raw_vec_handle_error
declare function AccountInfo_try_borrow_lamports(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_lamports
declare function fn_143340(a: u64, b: u64, r0: u64): u64 // lib
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_144198(a: u64, b: u64, r0: u64): u64 // lib uses __rust_alloc, raw_vec_handle_error
declare function fn_144ae8(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib "ProgramDerivedAddressUnable to find a vi…"
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fn_14f3e8(a: u64): u64 // lib
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function __floatundidf(a: u64): u64 // lib __floatundidf
declare function fn_14f808(a: u64, b: u64): u64 // lib uses __multi3
declare function fn_151a40(a: u64, b: u64): u64 // lib
declare function fn_151cb0(a: u64, b: u64): u64 // lib

// instruction handler: idl_create_account (discriminator sha256("global:idl_create_account")[..8] = 0x486e624882bf9020)
function ix_idl_create_account(a: u64, b: u64, c: u64, d: u64): u64 {
	const s24 = fp - 0x24, s38 = fp - 0x38, s48 = fp - 0x48, s50 = fp - 0x50, s78 = fp - 0x78, sf0 = fp - 0xf0, s107 = fp - 0x107, s108 = fp - 0x108, s120 = fp - 0x120, s170 = fp - 0x170, s171 = fp - 0x171, s188 = fp - 0x188, s1a8 = fp - 0x1a8, s1c8 = fp - 0x1c8, s1d8 = fp - 0x1d8, s1e8 = fp - 0x1e8, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s218 = fp - 0x218, s228 = fp - 0x228, s2a8 = fp - 0x2a8, s2b0 = fp - 0x2b0, s2b8 = fp - 0x2b8, s2c0 = fp - 0x2c0, s2c8 = fp - 0x2c8, s2d0 = fp - 0x2d0, s2d8 = fp - 0x2d8, s2e0 = fp - 0x2e0, s2e8 = fp - 0x2e8
	let j, k, l, m: u64
	st64(s2a8 + 0x78, a)
	sol_log("Instruction: IdlCreateAccount", 0x1d)
	const f = ld64(c + 0x98)
	if ((memcmp(b, f, 0x20) as u32) != 0) {
		m = anchor_error_from(s1d8, 0x3e9 /* anchor::IdlInstructionInvalidProgram */)
		l = ld64(s1d8)
		j = ld64(s2a8 + 0x78)
		st64(j + 8, ld64(s1d8 + 8))
		st64(j, l)
		return m
	}
	st64(s2a8 + 0x70, ld64(c + 8))
	Pubkey_find_program_address(s108, 8, 0, b)
	copyr(s1c8, s108, 0x20)
	const n = ld8(sf0 + 8)
	fn_144ae8(s108, s1c8, "anchor:idl", 0xa, f)
	if (ld8(s108) == 0) {
		copyr(s1a8, s107, 0x20)
		rent_get(s108)
		if (ld64(s108) == 0) {
			st64(s2a8 + 0x68, n)
			const o = min(d + 0x2c, 0x2710)
			const p = __floatundidf(ld64(s107 + 7) * (o + 0x80))
			const q = fn_14f7f8(ld64(s107 + 0xf), p)
			st64(s2a8 + 0x60, fn_151cb0(q, 0))
			const r = fn_14f3e8(q)
			st64(s2a8 + 0x60, 0 > (ld64(s2a8 + 0x60) as i64) ? 0 : r)
			const s = fn_151a40(q, 0x43efffffffffffff)
			let t = -1
			if (0 >= (s as i64)) {
				t = ld64(s2a8 + 0x60)
			}
			st64(s188, s171)
			st8(s171, ld64(s2a8 + 0x68))
			st64(s188 + 8, 1)
			fn_1429c8(s170, ld64(s2a8 + 0x70), s1a8, s1c8, "anchor:idl", 0xa, t, o, f)
			const u = ld64(c + 0x10)
			rc_inc(u)
			const v = ld64(c + 0x18)
			rc_inc(v)
			st64(s2a8 + 0x60, u)
			const w = ld64(c + 0x40)
			const x = ld64(w)
			st64(s2a8 + 0x50, ld64(c + 0x38))
			st64(s2a8 + 0x58, ld8(c + 0x32))
			const ac = ld8(c + 0x31)
			const af = ld8(c + 0x30)
			const ag = ld64(c + 0x28)
			const ah = ld64(c + 0x20)
			rc_inc(w, x)
			const y = ld64(c + 0x48)
			st64(s2a8 + 0x68, y)
			const z = ld64(y)
			rc_inc(ld64(s2a8 + 0x68), z)
			const aa = ld64(c + 0x70)
			const ab = ld64(aa)
			st64(s2a8 + 0x48, ac)
			st64(s2a8 + 0x18, ld64(c + 0x68))
			st64(s2a8 + 0x20, ld8(c + 0x62))
			st64(s2a8 + 0x28, ld8(c + 0x61))
			st64(s2a8 + 0x30, ld8(c + 0x60))
			st64(s2a8 + 0x38, ld64(c + 0x58))
			st64(s2a8 + 0x40, ld64(c + 0x50))
			rc_inc(aa, ab)
			const ad = ld64(c + 0x78)
			const ae = ld64(ad)
			st64(s2a8, af, ag, ah)
			rc_inc(ad, ae)
			const ai: AccountInfo = ld64(c)
			const aj: LamportsCell = ai.lamports
			const ak = aj.strong
			st64(s2b0, w)
			st64(s2d8, ld8(c + 0x92))
			st64(s2d0, ld8(c + 0x91))
			st64(s2c8, ld8(c + 0x90))
			st64(s2c0, ld64(c + 0x88))
			st64(s2b8, ld64(c + 0x80))
			const ar = ai.key
			rc_inc(aj, ak)
			st64(s2e8, aa)
			const al: DataCell = ai.data
			const am = al.strong
			st64(s2e0, v)
			rc_inc(al, am)
			const aq = ai.owner
			const ap = ai.rent_epoch
			const ao = ai.is_signer
			const an = ai.is_writable
			st8(s50 + 2, ai.executable)
			st8(s50, ao, an)
			st64(s78, ar, aj, al, aq, ap)
			st8(sf0 + 0x72, ld64(s2d8))
			st8(sf0 + 0x71, ld64(s2d0))
			st8(sf0 + 0x70, ld64(s2c8))
			st64(sf0 + 0x68, ld64(s2c0))
			st64(sf0 + 0x60, ld64(s2b8))
			st64(sf0 + 0x58, ad)
			st64(sf0 + 0x50, ld64(s2e8))
			st64(sf0 + 0x48, ld64(s2a8 + 0x18))
			st8(sf0 + 0x42, ld64(s2a8 + 0x20))
			st8(sf0 + 0x41, ld64(s2a8 + 0x28))
			st8(sf0 + 0x40, ld64(s2a8 + 0x30))
			st64(sf0 + 0x38, ld64(s2a8 + 0x38))
			st64(sf0 + 0x30, ld64(s2a8 + 0x40))
			st64(sf0 + 0x28, ld64(s2a8 + 0x68))
			st64(sf0 + 0x20, ld64(s2b0))
			st64(sf0 + 0x18, ld64(s2a8 + 0x50))
			st8(sf0 + 0x12, ld64(s2a8 + 0x58))
			st8(sf0 + 0x11, ld64(s2a8 + 0x48))
			st8(sf0 + 0x10, ld64(s2a8))
			st64(sf0 + 8, ld64(s2a8 + 8))
			st64(sf0, ld64(s2a8 + 0x10))
			st64(s107 + 0xf, ld64(s2e0))
			st64(s107 + 7, ld64(s2a8 + 0x60))
			st64(s108, ld64(s2a8 + 0x70))
			st64(s48, s188, 1)
			const at = fn_13eea8(s120, s170, s108, 4, s48, 1)
			if (ld64(s120) == 0x800000000000001a /* Ok */) {
				AccountInfo_try_borrow_data(s108, c + 0x38, ptr_drop_in_place_c1b0(s108, at))
				const ax = ld64(s107 + 0xf)
				const av = ld64(s107 + 7)
				const au = ld64(s108)
				if (au == 0x800000000000001a /* Ok */) {
					const aw = ld64(av)
					st64(s120 + 8, ld64(av + 8))
					st64(s120, aw)
					m = fn_11f7a0(s108, s120)
					if (ld32(s108) == 0) {
						copy(s24, sf0, 0x10)
						st64(ax, ld64(ax) - 1)
						const az = ld64(c + 8)
						copyr(s38, az, 0x20)
						fn_143448(s108, c + 0x38, m)
						const bd = ld64(s107 + 0xf)
						const bb = ld64(s107 + 7)
						const ba = ld64(s108)
						if (ba == 0x800000000000001a /* Ok */) {
							const bc = ld64(bb)
							st64(s107 + 7, ld64(bb + 8))
							st64(s108, bc)
							st64(s107 + 0xf, 0)
							m = fn_11f118(s228, s38, s108)
							k = ld64(s228 + 8)
							l = ld64(s228)
							st64(bd, ld64(bd) + 1)
							j = ld64(s2a8 + 0x78)
							st64(j + 8, k)
							st64(j, l != 2 ? l : 2)
							return m
						}
						st64(s108, ba, bb, bd)
						m = fn_13b430(s218, s108)
						l = ld64(s218)
						j = ld64(s2a8 + 0x78)
						st64(j + 8, ld64(s218 + 8))
						st64(j, l)
						return m
					}
					k = ld64(s107 + 0xf)
					l = ld64(s107 + 7)
					st64(ax, ld64(ax) - 1)
					j = ld64(s2a8 + 0x78)
					st64(j + 8, k)
					st64(j, l)
					return m
				}
				st64(s108, au, av, ax)
				m = fn_13b430(s208, s108)
				l = ld64(s208)
				j = ld64(s2a8 + 0x78)
				st64(j + 8, ld64(s208 + 8))
				st64(j, l)
				return m
			}
			copyr(s38, s120, 0x18)
			const ay = fn_13b430(s1f8, s38)
			k = ld64(s1f8 + 8)
			l = ld64(s1f8)
			m = ptr_drop_in_place_c1b0(s108, ay)
			j = ld64(s2a8 + 0x78)
			st64(j + 8, k)
			st64(j, l)
			return m
		}
		st32(s170, ld32(sf0 + 1))
		st32(s170 + 3, ld32(sf0 + 4))
		const i = ld64(s107 + 7)
		const h = ld64(s107 + 0xf)
		const g = ld8(sf0)
		st32(s107 + 0x13, ld32(s170 + 3))
		st32(s107 + 0x10, ld32(s170))
		st8(s107 + 0xf, g)
		st64(s108, i, h)
		m = fn_13b430(s1e8, s108)
		l = ld64(s1e8)
		j = ld64(s2a8 + 0x78)
		st64(j + 8, ld64(s1e8 + 8))
		st64(j, l)
		return m
	}
	st8(s170, ld8(s107))
	fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s170, 0x10015a908, 0x10015a8d0)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
function fn_14f7f8(a: u64, b: u64): u64 {
	return fn_14f808(a, b)
}

function fn_1429c8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64) {
	const s20 = fp - 0x20, s68 = fp - 0x68, s80 = fp - 0x80
	let q, r: u64
	const f = __rust_alloc(0x66 /* anchor::InstructionDidNotDeserialize */, 1)
	if (f == 0) {
		alloc_handle_alloc_error(1, 0x66 /* anchor::InstructionDidNotDeserialize */)
	}
	const v = p9
	const u = p8
	const t = p7
	let g = p6
	let i = p5
	st64(f + 0x18, ld64(b + 0x18))
	st64(f + 0x10, ld64(b + 0x10))
	st64(f + 8, ld64(b + 8))
	st64(f, ld64(b))
	st16(f + 0x20, 0x101)
	copy(f + 0x22, c, 0x18)
	const h = g
	st64(f + 0x3a, ld64(c + 0x18))
	st16(f + 0x42, 0x100)
	copy(f + 0x44, d, 0x20)
	st16(f + 0x64, 1)
	st64(s80, 3, f, 3)
	let k = 1
	if (g != 0) {
		const s = i
		if (0 > (h as i64)) {
			raw_vec_handle_error(0, h, g, q, r)
		}
		const j = __rust_alloc(h, 1)
		g = undef
		k = j
		if (j == 0) {
			raw_vec_handle_error(1, h, g, q, r)
		}
		i = s
	}
	memcpy(k, i, h)
	const o = ld64(d + 0x18)
	const n = ld64(d + 0x10)
	const m = ld64(d + 8)
	const l = ld64(d)
	st64(s68, h, k, h, l, m, n, o, t, u)
	copyr(s20, v, 0x20)
	const p = fn_1403d0(a, 0x100152180, s68, s80)
	if (h != 0) {
		fn_83078(p)
	}
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

function fn_1403d0(a: u64, b: u64, c: u64, d: u64): u64 {
	const s18 = fp - 0x18, s30 = fp - 0x30, s38 = fp - 0x38, s40 = fp - 0x40
	let f, g, h, i, j, k, l, n, o, p, r, ab, ad, bf, ce, cr, cy: u64
	B21: {
		B19: {
			B17: {
				r = a
				f = ld64(c) ^ 0x8000000000000000
				f = 0xd > f ? f : 3
				st64(s30, b, d, c)
				if ((f as i64) > 5) {
					if ((f as i64) > 8) {
						if ((f as i64) > 0xa) {
							if (f != 0xb) {
								j = 4
								break B19
							}
							i = 0x34
						} else {
							i = f != 9 ? 0x4c : 0x54
						}
						g = 0x18
						break B17
					}
					if (f == 6) {
						j = 0x24
						break B19
					}
					if (f == 7) {
						j = 0x24
						break B19
					}
				} else if ((f as i64) > 2) {
					i = 0x5c
					g = 0x10
					if (f == 3) {
						break B17
					}
					if (f == 4) {
						j = 4
						break B19
					}
				} else {
					j = 0x34
					if (f == 0) {
						break B19
					}
					if (f == 1) {
						j = 0x24
						break B19
					}
				}
				j = 0xc
				break B19
			}
			h = c + g
			j = ld64(h) + i
			k = 1
			l = 0
			if (j == 0) {
				break B21
			}
			if (0 > (j as i64)) {
				raw_vec_handle_error(0, j, h, d, g)
			}
		}
		k = __rust_alloc(j, 1)
		h = undef
		d = undef
		g = undef
		if (k == 0) {
			raw_vec_handle_error(1, j, h, d, g)
		}
		l = j
	}
	B135: {
		B134: {
			B29: {
				st64(s18, l, k, 0)
				if ((f as i64) > 5) {
					if ((f as i64) > 8) {
						if ((f as i64) > 0xa) {
							if (f == 0xb) {
								let cf = 0
								if (3 >= l) {
									fn_1423c0(s18, 0, 4, d, g, k)
									d = undef
									g = undef
									k = ld64(s18 + 8)
									cf = ld64(s18 + 0x10)
								}
								let cg = k + cf
								st32(cg, 0xb)
								let ch = cf + 4
								st64(s18 + 0x10, ch)
								let ci = ld64(s30 + 0x10)
								const cj = ld64(ci + 0x20)
								if (7 >= ld64(s18) - ch) {
									cg = fn_1423c0(s18, ch, 8, d, g, cg)
									d = undef
									g = undef
									ci = ld64(s30 + 0x10)
									ch = ld64(s18 + 0x10)
								}
								st64(ld64(s18 + 8) + ch, cj)
								let ck = ch + 8
								st64(s18 + 0x10, ck)
								const cm = ld64(ci + 0x18)
								const cl = ld64(ci + 0x10)
								if (7 >= ld64(s18) - ck) {
									cg = fn_1423c0(s18, ck, 8, d, g, cg)
									d = undef
									g = undef
									ck = ld64(s18 + 0x10)
								}
								st64(ld64(s18 + 8) + ck, cm)
								let cn = ck + 8
								st64(s18 + 0x10, cn)
								if (cm > ld64(s18) - cn) {
									fn_1423c0(s18, cn, cm, d, g, cg)
									cn = ld64(s18 + 0x10)
								}
								n = memcpy(ld64(s18 + 8) + cn, cl, cm)
								ad = cn + cm
								let co = 0
								const cq = ld64(s30 + 0x10) + 0x28
								st64(s18 + 0x10, ad)
								while (true) {
									const cp = ld8(cq + co)
									if (ld64(s18) == ad) {
										n = fn_1423c0(s18, ad, 1, cq, cr, n)
										ad = ld64(s18 + 0x10)
									}
									co = co + 1
									st8(ld64(s18 + 8) + ad, cp)
									ad = ad + 1
									st64(s18 + 0x10, ad)
									if (co == 0x20) {
										break B135
									}
								}
							}
							ab = 0
							if (3 >= l) {
								fn_1423c0(s18, 0, 4, d, g, k)
								k = ld64(s18 + 8)
								ab = ld64(s18 + 0x10)
							}
							n = k + ab
							st32(n, 0xc)
							break B134
						}
						st64(s38, r)
						if (f == 9) {
							let bw = 0
							let br = 0
							if (3 >= l) {
								fn_1423c0(s18, 0, 4, d, g, k)
								d = undef
								g = undef
								k = ld64(s18 + 8)
								br = ld64(s18 + 0x10)
							}
							let bs = k + br
							st32(bs, 9)
							let bt = ld64(s30 + 0x10)
							const bu = bt
							let bv = br + 4
							st64(s18 + 0x10, bv)
							while (true) {
								const bx = ld8(bu + 0x20 + bw)
								if (ld64(s18) == bv) {
									bs = fn_1423c0(s18, bv, 1, d, g, bs)
									d = undef
									g = undef
									bt = ld64(s30 + 0x10)
									bv = ld64(s18 + 0x10)
								}
								bw = bw + 1
								st8(ld64(s18 + 8) + bv, bx)
								bv = bv + 1
								st64(s18 + 0x10, bv)
								if (bw == 0x20) {
									const cs = ld64(bt + 0x18)
									const by = ld64(bt + 0x10)
									if (7 >= ld64(s18) - bv) {
										bs = fn_1423c0(s18, bv, 8, d, g, bs)
										d = undef
										g = undef
										bv = ld64(s18 + 0x10)
									}
									st64(ld64(s18 + 8) + bv, cs)
									let ct = bv + 8
									st64(s18 + 0x10, ct)
									let cu = ld64(s18)
									r = ld64(s38)
									if (cs > cu - ct) {
										fn_1423c0(s18, ct, cs, d, g, bs)
										cu = ld64(s18)
										ct = ld64(s18 + 0x10)
									}
									const cv = ld64(s18 + 8)
									st64(s40, cv)
									n = memcpy(cv + ct, by, cs)
									let cz = ld64(s40)
									let cw = ct + cs
									st64(s18 + 0x10, cw)
									let cx = ld64(s30 + 0x10)
									const da = ld64(cx + 0x40)
									if (7 >= cu - cw) {
										n = fn_1423c0(s18, cw, 8, cx, cy, n)
										cx = ld64(s30 + 0x10)
										cz = ld64(s18 + 8)
										cw = ld64(s18 + 0x10)
									}
									st64(cz + cw, da)
									let db = 0
									const dd = cx + 0x48
									ad = cw + 8
									st64(s18 + 0x10, ad)
									while (true) {
										const dc = ld8(dd + db)
										if (ld64(s18) == ad) {
											n = fn_1423c0(s18, ad, 1, dd, cy, n)
											ad = ld64(s18 + 0x10)
										}
										db = db + 1
										st8(ld64(s18 + 8) + ad, dc)
										ad = ad + 1
										st64(s18 + 0x10, ad)
										if (db == 0x20) {
											break B135
										}
									}
								}
							}
						}
						let x = 0
						let s = 0
						if (3 >= l) {
							fn_1423c0(s18, 0, 4, d, g, k)
							d = undef
							g = undef
							k = ld64(s18 + 8)
							s = ld64(s18 + 0x10)
						}
						let t = k + s
						st32(t, 0xa)
						let u = ld64(s30 + 0x10)
						const v = u
						let w = s + 4
						st64(s18 + 0x10, w)
						while (true) {
							const y = ld8(v + 0x20 + x)
							if (ld64(s18) == w) {
								t = fn_1423c0(s18, w, 1, d, g, t)
								d = undef
								g = undef
								u = ld64(s30 + 0x10)
								w = ld64(s18 + 0x10)
							}
							x = x + 1
							st8(ld64(s18 + 8) + w, y)
							w = w + 1
							st64(s18 + 0x10, w)
							if (x == 0x20) {
								const bz = ld64(u + 0x18)
								const z = ld64(u + 0x10)
								if (7 >= ld64(s18) - w) {
									t = fn_1423c0(s18, w, 8, d, g, t)
									d = undef
									g = undef
									w = ld64(s18 + 0x10)
								}
								st64(ld64(s18 + 8) + w, bz)
								let ca = w + 8
								st64(s18 + 0x10, ca)
								r = ld64(s38)
								if (bz > ld64(s18) - ca) {
									fn_1423c0(s18, ca, bz, d, g, t)
									ca = ld64(s18 + 0x10)
								}
								n = memcpy(ld64(s18 + 8) + ca, z, bz)
								ad = ca + bz
								let cb = 0
								const cd = ld64(s30 + 0x10) + 0x40
								st64(s18 + 0x10, ad)
								while (true) {
									const cc = ld8(cd + cb)
									if (ld64(s18) == ad) {
										n = fn_1423c0(s18, ad, 1, cd, ce, n)
										ad = ld64(s18 + 0x10)
									}
									cb = cb + 1
									st8(ld64(s18 + 8) + ad, cc)
									ad = ad + 1
									st64(s18 + 0x10, ad)
									if (cb == 0x20) {
										break B135
									}
								}
							}
						}
					}
					if (f == 6) {
						let ae = 0
						let ac = 0
						if (3 >= l) {
							fn_1423c0(s18, 0, 4, d, g, k)
							g = undef
							k = ld64(s18 + 8)
							ac = ld64(s18 + 0x10)
						}
						const ag = ld64(s30 + 0x10) + 8
						n = k + ac
						st32(n, 6)
						ad = ac + 4
						st64(s18 + 0x10, ad)
						while (true) {
							const af = ld8(ag + ae)
							if (ld64(s18) == ad) {
								n = fn_1423c0(s18, ad, 1, ag, g, n)
								g = undef
								ad = ld64(s18 + 0x10)
							}
							ae = ae + 1
							st8(ld64(s18 + 8) + ad, af)
							ad = ad + 1
							st64(s18 + 0x10, ad)
							if (ae == 0x20) {
								break B135
							}
						}
					}
					if (f == 7) {
						let bo = 0
						let bn = 0
						if (3 >= l) {
							fn_1423c0(s18, 0, 4, d, g, k)
							g = undef
							k = ld64(s18 + 8)
							bn = ld64(s18 + 0x10)
						}
						const bq = ld64(s30 + 0x10) + 8
						n = k + bn
						st32(n, 7)
						ad = bn + 4
						st64(s18 + 0x10, ad)
						while (true) {
							const bp = ld8(bq + bo)
							if (ld64(s18) == ad) {
								n = fn_1423c0(s18, ad, 1, bq, g, n)
								g = undef
								ad = ld64(s18 + 0x10)
							}
							bo = bo + 1
							st8(ld64(s18 + 8) + ad, bp)
							ad = ad + 1
							st64(s18 + 0x10, ad)
							if (bo == 0x20) {
								break B135
							}
						}
					}
					let q = 0
					if (3 >= l) {
						fn_1423c0(s18, 0, 4, d, g, k)
						d = undef
						g = undef
						k = ld64(s18 + 8)
						q = ld64(s18 + 0x10)
					}
					n = k + q
					st32(n, 8)
					o = q + 4
					st64(s18 + 0x10, o)
					p = ld64(ld64(s30 + 0x10) + 8)
					if (ld64(s18) - o > 7) {
						break B29
					}
				} else if ((f as i64) > 2) {
					if (f == 3) {
						st64(s38, r)
						let aw = 0
						let aq = 0
						if (3 >= l) {
							fn_1423c0(s18, 0, 4, d, g, k)
							d = undef
							g = undef
							k = ld64(s18 + 8)
							aq = ld64(s18 + 0x10)
						}
						let ar = k + aq
						st32(ar, 3)
						let at = ld64(s30 + 0x10)
						const au = at
						let av = aq + 4
						st64(s18 + 0x10, av)
						while (true) {
							const ax = ld8(au + 0x18 + aw)
							if (ld64(s18) == av) {
								ar = fn_1423c0(s18, av, 1, d, g, ar)
								d = undef
								g = undef
								at = ld64(s30 + 0x10)
								av = ld64(s18 + 0x10)
							}
							aw = aw + 1
							st8(ld64(s18 + 8) + av, ax)
							av = av + 1
							st64(s18 + 0x10, av)
							if (aw == 0x20) {
								const az = ld64(at + 0x10)
								const ay = ld64(at + 8)
								if (7 >= ld64(s18) - av) {
									ar = fn_1423c0(s18, av, 8, d, g, ar)
									d = undef
									g = undef
									av = ld64(s18 + 0x10)
								}
								st64(ld64(s18 + 8) + av, az)
								let ba = av + 8
								st64(s18 + 0x10, ba)
								let bb = ld64(s18)
								r = ld64(s38)
								if (az > bb - ba) {
									fn_1423c0(s18, ba, az, d, g, ar)
									bb = ld64(s18)
									ba = ld64(s18 + 0x10)
								}
								const bc = ld64(s18 + 8)
								st64(s40, bc)
								n = memcpy(bc + ba, ay, az)
								let bg = ld64(s40)
								let bd = ba + az
								st64(s18 + 0x10, bd)
								let be = ld64(s30 + 0x10)
								const bh = ld64(be + 0x38)
								if (7 >= bb - bd) {
									n = fn_1423c0(s18, bd, 8, be, bf, n)
									be = ld64(s30 + 0x10)
									bg = ld64(s18 + 8)
									bd = ld64(s18 + 0x10)
								}
								st64(bg + bd, bh)
								let bi = bd + 8
								st64(s18 + 0x10, bi)
								const bj = ld64(be + 0x40)
								if (7 >= ld64(s18) - bi) {
									n = fn_1423c0(s18, bi, 8, be, bf, n)
									be = ld64(s30 + 0x10)
									bi = ld64(s18 + 0x10)
								}
								st64(ld64(s18 + 8) + bi, bj)
								let bk = 0
								const bm = be + 0x48
								ad = bi + 8
								st64(s18 + 0x10, ad)
								while (true) {
									const bl = ld8(bm + bk)
									if (ld64(s18) == ad) {
										n = fn_1423c0(s18, ad, 1, bm, bf, n)
										ad = ld64(s18 + 0x10)
									}
									bk = bk + 1
									st8(ld64(s18 + 8) + ad, bl)
									ad = ad + 1
									st64(s18 + 0x10, ad)
									if (bk == 0x20) {
										break B135
									}
								}
							}
						}
					}
					if (f == 4) {
						ab = 0
						if (3 >= l) {
							fn_1423c0(s18, 0, 4, d, g, k)
							k = ld64(s18 + 8)
							ab = ld64(s18 + 0x10)
						}
						n = k + ab
						st32(n, 4)
						break B134
					}
					let aa = 0
					p = ld64(ld64(s30 + 0x10) + 8)
					if (3 >= l) {
						fn_1423c0(s18, 0, 4, d, g, k)
						d = undef
						g = undef
						k = ld64(s18 + 8)
						aa = ld64(s18 + 0x10)
					}
					n = k + aa
					st32(n, 5)
					o = aa + 4
					st64(s18 + 0x10, o)
					if (ld64(s18) - o > 7) {
						break B29
					}
				} else {
					if (f == 0) {
						let ah = 0
						if (3 >= l) {
							fn_1423c0(s18, 0, 4, d, g, k)
							g = undef
							k = ld64(s18 + 8)
							ah = ld64(s18 + 0x10)
						}
						n = k + ah
						st32(n, 0)
						let ai = ah + 4
						st64(s18 + 0x10, ai)
						let aj = ld64(s30 + 0x10)
						const ak = ld64(aj + 0x28)
						if (7 >= ld64(s18) - ai) {
							n = fn_1423c0(s18, ai, 8, aj, g, n)
							g = undef
							aj = ld64(s30 + 0x10)
							ai = ld64(s18 + 0x10)
						}
						st64(ld64(s18 + 8) + ai, ak)
						let al = ai + 8
						st64(s18 + 0x10, al)
						const am = ld64(aj + 0x30)
						if (7 >= ld64(s18) - al) {
							n = fn_1423c0(s18, al, 8, aj, g, n)
							g = undef
							aj = ld64(s30 + 0x10)
							al = ld64(s18 + 0x10)
						}
						st64(ld64(s18 + 8) + al, am)
						let an = 0
						const ap = aj + 8
						ad = al + 8
						st64(s18 + 0x10, ad)
						while (true) {
							const ao = ld8(ap + an)
							if (ld64(s18) == ad) {
								n = fn_1423c0(s18, ad, 1, ap, g, n)
								g = undef
								ad = ld64(s18 + 0x10)
							}
							an = an + 1
							st8(ld64(s18 + 8) + ad, ao)
							ad = ad + 1
							st64(s18 + 0x10, ad)
							if (an == 0x20) {
								break B135
							}
						}
					}
					if (f == 1) {
						let df = 0
						let de = 0
						if (3 >= l) {
							fn_1423c0(s18, 0, 4, d, g, k)
							g = undef
							k = ld64(s18 + 8)
							de = ld64(s18 + 0x10)
						}
						n = k + de
						st32(n, 1)
						const dh = ld64(s30 + 0x10) + 8
						ad = de + 4
						st64(s18 + 0x10, ad)
						while (true) {
							const dg = ld8(dh + df)
							if (ld64(s18) == ad) {
								n = fn_1423c0(s18, ad, 1, dh, g, n)
								g = undef
								ad = ld64(s18 + 0x10)
							}
							df = df + 1
							st8(ld64(s18 + 8) + ad, dg)
							ad = ad + 1
							st64(s18 + 0x10, ad)
							if (df == 0x20) {
								break B135
							}
						}
					}
					let m = 0
					if (3 >= l) {
						fn_1423c0(s18, 0, 4, d, g, k)
						d = undef
						g = undef
						k = ld64(s18 + 8)
						m = ld64(s18 + 0x10)
					}
					n = k + m
					st32(n, 2)
					o = m + 4
					st64(s18 + 0x10, o)
					p = ld64(ld64(s30 + 0x10) + 8)
					if (ld64(s18) - o > 7) {
						break B29
					}
				}
				n = fn_1423c0(s18, o, 8, d, g, n)
				o = ld64(s18 + 0x10)
			}
			st64(ld64(s18 + 8) + o, p)
			ad = o + 8
			break B135
		}
		ad = ab + 4
	}
	const dl = ld64(s18 + 8)
	const di = ld64(s18)
	if (di == 0x8000000000000000) {
		st64(s18, dl)
		fn_149678(0x10015793e /* "called `Result::unwrap()` on an `Err` value" */, 0x2b, s18, 0x10015b3c8, 0x10015b3e8)
	}
	const dj = ld64(s30)
	st64(r + 0x48, ld64(dj + 0x18))
	st64(r + 0x40, ld64(dj + 0x10))
	st64(r + 0x38, ld64(dj + 8))
	st64(r + 0x30, ld64(dj))
	const dk = ld64(s30 + 8)
	copy(r, dk, 0x18)
	st64(r + 0x28, ad)
	st64(r + 0x20, dl)
	st64(r + 0x18, di)
	return n
}

function fn_83078(r0: u64): u64 {
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_149478(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	const s20 = fp - 0x20, s28 = fp - 0x28
	st64(s20, 0x10015b8e0, a, b)
	st16(s20 + 0x18, 1)
	st64(s28, 1)
	fn_147238(s28, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_147238(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	fn_1478b8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_1478b8(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	custom_panic(a, b, c, d, e)
	abort()
}
