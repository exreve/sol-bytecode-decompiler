// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction set_reward_emissions: handler + 11 reachable functions
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
declare function fn_f658(a: u64, b: u64): u64 // lib
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11a48(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11f50(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function custom_panic(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib custom_panic
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function fn_1394f0(): u64 // lib uses __rust_alloc, raw_vec_handle_error, alloc_handle_alloc_error, Error__new
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function clock_get_13f308(a: u64): u64 // lib solana_sysvar::clock::<impl solana_sysvar::Sysvar for solana_clock::Clock>::get
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_1459d0(a: u64): u64 // lib uses repr_bitpacked_kind_from_prim_145358, callx
declare function fn_14ecd0(a: u64, b: u64, c: u64): u64 // lib "0001020304050607080910111213141516171819…", "0001020304050607080910111213141516171819…"
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function __udivti3(a: u64, b: u64, c: u64, d: u64, e: u64, r8: u64): u64 // lib __udivti3
declare function __multi3(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __multi3 [heur] u128 multiply: *out = a * b (mod 2^128), a = (a_lo, a_hi), b = (b_lo, b_hi) [exec: on 31 operand pairs]

// instruction handler: set_reward_emissions (discriminator sha256("global:set_reward_emissions")[..8] = 0xf41bb06da856c50d)
// accounts [str: the program's account-error strings, in order of first use]: whirlpool, reward_vault, reward_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool
function ix_set_reward_emissions(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s24 = fp - 0x24, s28 = fp - 0x28, s340 = fp - 0x340, s350 = fp - 0x350, s374 = fp - 0x374, s378 = fp - 0x378, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s1000 = fp - 0x1000
	let k, o: u64
	sol_log("Instruction: SetRewardEmissions", 0x1f)
	const f = ix_args_len
	if (f != 0 && f >= 0x11) {
		const g = ix_args
		const p = ld8(g)
		const q = ld64(g + 9)
		const h = ld64(g + 1)
		st64(s6b0, accounts, accounts_len)
		st64(s1000, f)
		o = accounts_set_reward_emissions(s350, h, s6b0, g, fp)
		let j = ld64(s350 + 8)
		k = ld64(s350)
		const i = ld32(s28)
		if (i == 2) {
			st64(a + 8, j)
			st64(a, k)
			return o
		}
		memcpy(s690, s340, 0x318)
		copy(s374, s24, 0x20)
		st32(s374 + 0x20, ld32(s24 + 0x20))
		st32(s378, i)
		st64(s6a0, k, j)
		copyr(s340, s6b0, 0x10)
		st64(s350 + 8, s6a0)
		j = program_id
		st64(s350, program_id)
		o = fn_367c0(s6c0, s350, p, h, q)
		k = ld64(s6c0)
		if (k == 2) {
			o = fn_6aa0(s6d0, s6a0, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, j)
			const l = ld64(s6d0)
			if (l != 2) {
				o = Error_with_account_name(s6e0, l, ld64(s6d0 + 8), 0x100152b28 /* "whirlpool" */, 9)
				k = ld64(s6e0)
				st64(a + 8, ld64(s6e0 + 8))
				st64(a, k)
				return o
			}
			st64(a + 8, j)
			st64(a, 2)
			return o
		}
		st64(a + 8, ld64(s6c0 + 8))
		st64(a, k)
		return o
	}
	const m = fn_1459d0(0x100159468)
	if (2 > (m & 3) - 2) {
		o = anchor_error_from(s6f0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s6f0)
		st64(a + 8, ld64(s6f0 + 8))
		st64(a, k)
		return o
	}
	if ((m & 3) == 0) {
		o = anchor_error_from(s6f0, 0x66 /* anchor::InstructionDidNotDeserialize */)
		k = ld64(s6f0)
		st64(a + 8, ld64(s6f0 + 8))
		st64(a, k)
		return o
	}
	const n = ld64(ld64(m + 7))
	callx(n, ld64(m - 1), n)
	o = anchor_error_from(s6f0, 0x66 /* anchor::InstructionDidNotDeserialize */)
	k = ld64(s6f0)
	st64(a + 8, ld64(s6f0 + 8))
	st64(a, k)
	return o
}

// Anchor Accounts::try_accounts of instruction set_reward_emissions (called by ix_set_reward_emissions; name [str]: from the handler's "Instruction: …" log; was fn_c98e8)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (points to it)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool (ConstraintMut), reward_vault (ConstraintAddress), reward_authority (ConstraintAddress)
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: whirlpool, reward_authority
function accounts_set_reward_emissions(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, sc0 = fp - 0xc0, se8 = fp - 0xe8, s330 = fp - 0x330, s360 = fp - 0x360, s370 = fp - 0x370, s378 = fp - 0x378, s574 = fp - 0x574, s5e8 = fp - 0x5e8, s5f0 = fp - 0x5f0, s5f8 = fp - 0x5f8, s608 = fp - 0x608, s618 = fp - 0x618, s628 = fp - 0x628, s638 = fp - 0x638, s648 = fp - 0x648, s658 = fp - 0x658, s668 = fp - 0x668, s678 = fp - 0x678, s688 = fp - 0x688, s698 = fp - 0x698, s6a8 = fp - 0x6a8, s6b8 = fp - 0x6b8, s6c8 = fp - 0x6c8, s6d0 = fp - 0x6d0, s6d8 = fp - 0x6d8, s6e0 = fp - 0x6e0, s6e8 = fp - 0x6e8
	let p, r, s, t: u64
	let f = a
	if (ld64(e - 0x1000) == 0) {
		const n = fn_1459d0(0x100159468)
		if (2 > (n & 3) - 2) {
			t = anchor_error_from(s6c8, 0x66 /* anchor::InstructionDidNotDeserialize */)
			p = ld64(s6c8)
			st64(f + 8, ld64(s6c8 + 8))
			st64(f, p)
			st32(f + 0x328, 2)
			return t
		}
		if ((n & 3) == 0) {
			t = anchor_error_from(s6c8, 0x66 /* anchor::InstructionDidNotDeserialize */)
			p = ld64(s6c8)
			st64(f + 8, ld64(s6c8 + 8))
			st64(f, p)
			st32(f + 0x328, 2)
			return t
		}
		const o = ld64(ld64(n + 7))
		callx(o, ld64(n - 1), o)
		t = anchor_error_from(s6c8, 0x66 /* anchor::InstructionDidNotDeserialize */)
		p = ld64(s6c8)
		st64(f + 8, ld64(s6c8 + 8))
		st64(f, p)
		st32(f + 0x328, 2)
		return t
	}
	st64(s6d0, f)
	st64(s6d8, ld8(d))
	try_accounts_11a48(s608, c, c, d, e)
	const h = ld64(s5f8)
	const i = ld64(s608 + 8)
	const whirlpool: AccountInfo = ld64(s608)
	if (whirlpool == 0) {
		t = Error_with_account_name(s6b8, i, h, 0x100152b28 /* "whirlpool" */, 9)
		s = ld64(s6b8)
		r = ld64(s6d0)
		st64(r + 8, ld64(s6b8 + 8))
		st64(r, s)
		st32(r + 0x328, 2)
		return t
	}
	memcpy(s360, s5f0, 0x278)
	st64(s378, whirlpool, i, h)
	try_accounts_11718(s608, c)
	const reward_authority: AccountInfo = ld64(s608 + 8)
	const j = ld64(s608)
	if (j == 2) {
		try_accounts_11f50(s608, c)
		const l = ld64(s608 + 8)
		const m = ld64(s608)
		const k = ld32(s5e8 + 0x70)
		if (k == 2) {
			t = Error_with_account_name(s6a8, m, l, "reward_vault", 0xc)
			s = ld64(s6a8)
			r = ld64(s6d0)
			st64(r + 8, ld64(s6a8 + 8))
			st64(r, s)
			st32(r + 0x328, 2)
			return t
		}
		st64(s6e0, m)
		memcpy(sc0, s5f8, 0x80)
		copy(se8, s574, 0x20)
		st32(se8 + 0x20, ld32(s574 + 0x20))
		if (whirlpool.is_writable == 0) {
			anchor_error_from(s688, 0x7d0 /* anchor::ConstraintMut */)
			t = Error_with_account_name(s698, ld64(s688), ld64(s688 + 8), 0x100152b28 /* "whirlpool" */, 9)
			s = ld64(s698)
			r = ld64(s6d0)
			st64(r + 8, ld64(s698 + 8))
			st64(r, s)
			st32(r + 0x328, 2)
			return t
		}
		const u = reward_authority.key
		copyr(s40, u, 0x20)
		copyr(s20, s330, 0x20)
		if ((memcmp(s40, s20, 0x20) as u32) != 0) {
			anchor_error_from(s628, 0x7dc /* anchor::ConstraintAddress */)
			const ae = Error_with_account_name(s638, ld64(s628), ld64(s628 + 8), "reward_authority", 0x10)
			const ad = ld64(s638 + 8)
			const ac = ld64(s638)
			copyr(s608, s40, 0x20)
			copy(s5e8, s330, 0x20)
			t = fn_13b5c0(s648, ac, ad, s608, ae)
			s = ld64(s648)
			r = ld64(s6d0)
			st64(r + 8, ld64(s648 + 8))
			st64(r, s)
			st32(r + 0x328, 2)
			return t
		}
		st64(s6e8, l)
		const v = ld64(ld64(s6e0))
		copyr(s40, v, 0x20)
		const w = ld64(s6d8)
		if (3 > w) {
			const x = s370 + (w << 7)
			copyr(s20, x + 0x20, 0x20)
			const y = memcmp(s40, s20, 0x20)
			f = ld64(s6d0)
			if ((y as u32) == 0) {
				memcpy(f, s378, 0x290)
				memcpy(f + 0x2a8, sc0, 0x80)
				const aj = ld32(se8 + 0x20)
				const ai = ld64(se8 + 0x18)
				const ah = ld64(se8 + 0x10)
				const ag = ld64(se8 + 8)
				const af = ld64(se8)
				st32(f + 0x328, k)
				st64(f + 0x2a0, ld64(s6e8))
				t = ld64(s6e0)
				st64(f + 0x298, t)
				st64(f + 0x290, reward_authority)
				st64(f + 0x32c, af, ag, ah, ai)
				st32(f + 0x34c, aj)
				return t
			}
			anchor_error_from(s658, 0x7dc /* anchor::ConstraintAddress */)
			const ab = Error_with_account_name(s668, ld64(s658), ld64(s658 + 8), "reward_vault", 0xc)
			const aa = ld64(s668 + 8)
			const z = ld64(s668)
			copyr(s608, s40, 0x20)
			copy(s5e8, x + 0x20, 0x20)
			t = fn_13b5c0(s678, z, aa, s608, ab)
			p = ld64(s678)
			st64(f + 8, ld64(s678 + 8))
			st64(f, p)
			st32(f + 0x328, 2)
			return t
		}
		fn_1495b0(w, 3, 0x10015a7a0)
	}
	t = Error_with_account_name(s618, j, reward_authority, "reward_authority", 0x10)
	s = ld64(s618)
	r = ld64(s6d0)
	st64(r + 8, ld64(s618 + 8))
	st64(r, s)
	st32(r + 0x328, 2)
	return t
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: e (value), d (value), c (value)
function fn_367c0(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s180 = fp - 0x180, s300 = fp - 0x300, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s368 = fp - 0x368, s378 = fp - 0x378, s388 = fp - 0x388, s390 = fp - 0x390, s398 = fp - 0x398, s3a0 = fp - 0x3a0
	let l, q: u64
	st64(s390, c)
	let m = a
	const h = ld64(b + 8)
	if ((d | e) != 0) {
		__multi3(s328, e, 0, 0x15180, 0)
		__multi3(s318, d, 0, 0x15180, 0)
		const f = ld64(s318 + 8)
		const g = ld64(s328)
		if ((ld64(s328 + 8) != 0 | f > f + g) != 0) {
			q = fn_87630(s348, 0x1e)
			l = ld64(s348)
			st64(m + 8, ld64(s348 + 8))
			st64(m, l)
			return q
		}
		if (f + g > ld64(h + 0x2e0)) {
			q = fn_87630(s338, 0x1b)
			l = ld64(s338)
			st64(m + 8, ld64(s338 + 8))
			st64(m, l)
			return q
		}
	}
	st64(s398, h)
	clock_get_13f308(s308)
	if (ld64(s308) == 0) {
		let k = ld64(s300 + 0x20)
		if (-1 >= (k as i64)) {
			q = fn_87630(s368, 0x15)
			k = ld64(s368 + 8)
			l = ld64(s368)
			if (l != 2) {
				st64(m + 8, k)
				st64(m, l)
				return q
			}
		}
		st64(s3a0, m)
		const n = ld64(s398)
		fn_4e100(s308, n + 8, k)
		if (ld32(s308) != 0) {
			q = fn_87630(s378, ld32(s308 + 4))
			l = ld64(s378)
			m = ld64(s3a0)
			st64(m + 8, ld64(s378 + 8))
			st64(m, l)
			return q
		}
		memcpy(s180, s300, 0x180)
		const o = ld64(s390)
		if ((o as u8) > 2) {
			q = fn_87630(s388, 0x1a)
			l = ld64(s388)
			m = ld64(s3a0)
			st64(m + 8, ld64(s388 + 8))
			st64(m, l)
			return q
		}
		st64(s390, o as u8)
		st64(ld64(s398) + 0x278, k)
		q = memcpy(n + 8, s180, 0x180)
		const p = n + 8 + (ld64(s390) << 7)
		st64(p + 0x68, e)
		st64(p + 0x60, d)
		m = ld64(s3a0)
		st64(m + 8, k)
		st64(m, 2)
		return q
	}
	const j = ld64(s300)
	const i = ld64(s300 + 8)
	st64(s300 + 8, ld64(s300 + 0x10))
	st64(s308, j, i)
	q = fn_13b430(s358, s308)
	l = ld64(s358)
	st64(m + 8, ld64(s358 + 8))
	st64(m, l)
	return q
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), d (value), e (value)
function fn_1495b0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s20 = fp - 0x20, s50 = fp - 0x50, s58 = fp - 0x58, s60 = fp - 0x60
	st64(s60, a, b, 0x10015b900)
	st64(s50 + 0x10, s20)
	st64(s20, s58, fn_14f060, s60, fn_14f060)
	st64(s50 + 0x20, 0)
	st64(s50 + 8, 2)
	st64(s50 + 0x18, 2)
	// fmt "index out of bounds: the len is {} but the index is {}" {} = b [fn_14f060], {} = a [fn_14f060]
	fn_149478(s50, c, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), a (points to it), b (value)
function fn_4e100(a: u64, b: u64, c: u64) {
	const s20 = fp - 0x20, sa0 = fp - 0xa0, s120 = fp - 0x120, s1a0 = fp - 0x1a0, s1b0 = fp - 0x1b0, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f0 = fp - 0x1f0, s200 = fp - 0x200, s210 = fp - 0x210, s220 = fp - 0x220, s230 = fp - 0x230, s240 = fp - 0x240
	const f = ld64(b + 0x270)
	if (f > c) {
		st32(a + 4, 0x16)
		st32(a, 1)
	} else if (c == f) {
		memcpy(a + 8, b, 0x180)
		st32(a, 0)
	} else {
		const h = ld64(b + 0x228)
		const g = ld64(b + 0x220)
		st64(s240, g, h)
		if ((g | h) == 0) {
			memcpy(a + 8, b, 0x180)
			st32(a, 0)
		} else {
			memcpy(s1a0, b, 0x180)
			st64(s20, 0, 0, 0, 0)
			if ((memcmp(s1a0, s20, 0x20) as u32) != 0) {
				let l = 0
				__multi3(s1c0, ld64(s1a0 + 0x68), 0, c - f, 0)
				__multi3(s1b0, c - f, 0, ld64(s1a0 + 0x60), 0)
				const j = ld64(s1c0)
				const i = ld64(s1b0 + 8)
				let n = 0
				if ((ld64(s1c0 + 8) != 0 | i > i + j) == 0) {
					__udivti3(s1d0, ld64(s1b0), i + j, ld64(s240), ld64(s240 + 8), f)
					n = ld64(s1d0 + 8)
					l = ld64(s1d0)
				}
				const k = ld64(s1a0 + 0x70)
				const m = k + l
				st64(s1a0 + 0x70, m)
				st64(s1a0 + 0x78, ld64(s1a0 + 0x78) + n + (k > m))
			}
			st64(s20, 0, 0, 0, 0)
			if ((memcmp(s120, s20, 0x20) as u32) != 0) {
				let r = 0
				__multi3(s1f0, ld64(s120 + 0x68), 0, c - f, 0)
				__multi3(s1e0, c - f, 0, ld64(s120 + 0x60), 0)
				const p = ld64(s1f0)
				const o = ld64(s1e0 + 8)
				let t = 0
				if ((ld64(s1f0 + 8) != 0 | o > o + p) == 0) {
					__udivti3(s200, ld64(s1e0), o + p, ld64(s240), ld64(s240 + 8), f)
					t = ld64(s200 + 8)
					r = ld64(s200)
				}
				const q = ld64(s120 + 0x70)
				const s = q + r
				st64(s120 + 0x70, s)
				st64(s120 + 0x78, ld64(s120 + 0x78) + t + (q > s))
			}
			st64(s20, 0, 0, 0, 0)
			if ((memcmp(sa0, s20, 0x20) as u32) == 0) {
				memcpy(a + 8, s1a0, 0x180)
				st32(a, 0)
			} else {
				let x = 0
				__multi3(s220, ld64(sa0 + 0x68), 0, c - f, 0)
				__multi3(s210, c - f, 0, ld64(sa0 + 0x60), 0)
				const v = ld64(s220)
				const u = ld64(s210 + 8)
				let z = 0
				if ((ld64(s220 + 8) != 0 | u > u + v) == 0) {
					__udivti3(s230, ld64(s210), u + v, ld64(s240), ld64(s240 + 8), f)
					z = ld64(s230 + 8)
					x = ld64(s230)
				}
				const w = ld64(sa0 + 0x70)
				const y = w + x
				st64(sa0 + 0x70, y)
				st64(sa0 + 0x78, ld64(sa0 + 0x78) + z + (w > y))
				memcpy(a + 8, s1a0, 0x180)
				st32(a, 0)
			}
		}
	}
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_147238(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	fn_1478b8(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), d (value), e (value)
function fn_1478b8(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	custom_panic(a, b, c, d, e)
	abort()
}
