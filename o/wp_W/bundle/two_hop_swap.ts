// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction two_hop_swap: handler + 36 reachable functions
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
interface TokenAccount extends sized<0xb8> { // Account<TokenAccount> (anchor_spl, SPL Token Account) as unpacked in memory (fields [known: spl_token::state layout] at the offsets a run of try_accounts_11f50 put them [offsets from exec]; info = the &AccountInfo)
	info:             at<0x00, ref<AccountInfo>> // &AccountInfo
	mint:             at<0x08, Pubkey>
	owner:            at<0x28, Pubkey>
	amount:           at<0x48, u64>
	delegate:         at<0x54, Pubkey> // COption<Pubkey>
	is_native:        at<0x80, u64> // COption<u64>
	delegated_amount: at<0x88, u64>
	close_authority:  at<0x94, Pubkey> // COption<Pubkey>
}
interface TwoHopSwapAccounts { // Accounts struct of instruction two_hop_swap as accounts_two_hop_swap returns it: account fields (&AccountInfo, the boxed deserialized account, or the deserialized account in place) at the offsets it stores them [str names; offsets inferred]
	token_program:             at<0x00, ref<AccountInfo>>
	token_authority:           at<0x08, ref<AccountInfo>>
	token_owner_account_one_a: at<0x20, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_vault_one_a:         at<0x28, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_owner_account_one_b: at<0x30, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_vault_one_b:         at<0x38, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_owner_account_two_a: at<0x40, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_vault_two_a:         at<0x48, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_owner_account_two_b: at<0x50, ref<TokenAccount>> // Box<Account<TokenAccount>>
	token_vault_two_b:         at<0x58, ref<TokenAccount>> // Box<Account<TokenAccount>>
}
interface TwoHopSwapContext { // anchor_lang Context of instruction two_hop_swap (program_id, accounts, remaining_accounts), as the handler builds it [layout from the handler's stores]
	program_id:             at<0x00, ref<Pubkey>>
	accounts:               at<0x08, ref<TwoHopSwapAccounts>>
	remaining_accounts:     at<0x10, ref<AccountInfo>> // &[AccountInfo]: the accounts after the instruction's own
	remaining_accounts_len: at<0x18, u64>
}
declare function abort(): never // abort program execution (panic)
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function sol_log_data(slices: u64, len: u64): void // log base64 data: slices = &[&[u8]]
declare function sol_memcpy(dst: u64, src: u64, n: u64): void // memcpy (non-overlapping)
declare function sol_memmove(dst: u64, src: u64, n: u64): void // memmove
declare function sol_memset(dst: u64, byte: u64, n: u64): void // memset
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function fn_b580(a: u64): u64 // lib uses alloc_handle_alloc_error, Error__new
declare function fn_c710(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_e248(a: u64, b: u64, r0: u64): void // lib uses memmove, memcpy
declare function fn_e368(a: u64, b: u64): u64 // lib uses alloc_handle_alloc_error
declare function fn_e478(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function fn_e968(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): void // lib uses raw_vec_handle_error
declare function fn_f658(a: u64, b: u64): u64 // lib
declare function AccountInfo_clone(a: u64, b: u64): void // lib <solana_account_info::AccountInfo as core::clone::Clone>::clone
declare function try_accounts_11718(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::signer::Signer as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11a48(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function try_accounts_11f50(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib <anchor_lang::accounts::account::Account<T> as anchor_lang::Accounts<B>>::try_accounts
declare function fn_129a0(a: u64, b: u64, c: u64, d: u64, e: u64): void // lib uses anchor_error_from, memcmp
declare function __rust_alloc(a: u64, b: u64): u64 // lib __rust_alloc
declare function fn_87630(a: u64, b: u64): u64 // lib "a Display implementation returned an err…"
declare function common_is_closed(a: u64): u64 // lib anchor_lang::common::is_closed
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error
declare function fn_13b5c0(a: u64, b: u64, c: u64, d: u64, r0: u64): u64 // lib uses memcpy
declare function anchor_error_from(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an anchor_lang ErrorCode as its second argument: <anchor_lang::error::Error as From<ErrorCode>>::from (was fn_13e238); "a Display implementation returned an err…"
declare function clock_get_13f308(a: u64): u64 // lib solana_sysvar::clock::<impl solana_sysvar::Sysvar for solana_clock::Clock>::get
declare function AccountInfo_try_borrow_data(a: u64, b: u64, r0: u64): u64 // lib solana_account_info::AccountInfo::try_borrow_data
declare function fn_143448(a: u64, b: u64, r0: u64): u64 // lib
declare function fn_143da0(a: u64, r0: u64): u64 // lib
declare function Pubkey_find_program_address(a: u64, b: u64, c: u64, d: u64): u64 // lib solana_pubkey::Pubkey::find_program_address
declare function fn_1459d0(a: u64): u64 // lib uses repr_bitpacked_kind_from_prim_145358, callx
declare function raw_vec_handle_error(a: u64, b: u64, c: u64, d: u64, e: u64): never // lib alloc::raw_vec::handle_error
declare function alloc_handle_alloc_error(a: u64, b: u64): never // lib alloc::alloc::handle_alloc_error
declare function fn_14a698(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses callx
declare function fn_14ecd0(a: u64, b: u64, c: u64): u64 // lib "0001020304050607080910111213141516171819…", "0001020304050607080910111213141516171819…"
declare function imp_fmt(a: u64, b: u64): u64 // lib core::fmt::num::imp::<impl core::fmt::Display for i32>::fmt
declare function memcmp(a: u64, b: u64, c: u64): u64 // lib memcmp
declare function __udivti3(a: u64, b: u64, c: u64, d: u64, e: u64, r8: u64): u64 // lib __udivti3
declare function __multi3(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib __multi3 [heur] u128 multiply: *out = a * b (mod 2^128), a = (a_lo, a_hi), b = (b_lo, b_hi) [exec: on 31 operand pairs]
declare function fn_151b50(a: u64, b: u64): u64 // lib
declare function fn_151bf8(a: u64, b: u64): u64 // lib

// instruction handler: two_hop_swap (discriminator sha256("global:two_hop_swap")[..8] = 0xe6dba2446ced60c3)
// accounts [str: the program's account-error strings, in order of first use]: token_program, whirlpool_one, whirlpool_two, token_owner_account_one_a, token_vault_one_a, tick_array_one_0, tick_array_one_1, tick_array_one_2, tick_array_two_0, tick_array_two_1, tick_array_two_2, oracle_one, oracle_two, token_owner_account_one_b, token_vault_one_b, token_owner_account_two_a, token_vault_two_a, token_owner_account_two_b, token_vault_two_b, token_authority
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: program_id, accounts, accounts_len, ix_args, ix_args_len
function ix_two_hop_swap(a: u64, program_id: u64, accounts: u64, accounts_len: u64, ix_args: u64, ix_args_len: u64): u64 {
	const s10 = fp - 0x10, s98 = fp - 0x98, sa0 = fp - 0xa0, sb0 = fp - 0xb0, s138 = fp - 0x138, s150 = fp - 0x150, s152 = fp - 0x152, s168 = fp - 0x168, s178 = fp - 0x178, s188 = fp - 0x188, s1000 = fp - 0x1000
	let o, p, s, t, u, v: u64
	B15: {
		B14: {
			sol_log("Instruction: TwoHopSwap", 0x17)
			let i = undef
			const f = ix_args_len
			if (f >= 8 && ((f & -8) != 8 && f != 0x10)) {
				const g = ix_args
				const j = ld64(g)
				const k = ld64(g + 8)
				const h = ld8(g + 0x10)
				st8(s152, h)
				if (2 > h) {
					if (f == 0x11) {
						break B14
					}
					const l = ld8(g + 0x11)
					st8(s152, l)
					if (2 > l) {
						if (f == 0x12) {
							break B14
						}
						let ab = f - 0x12
						const ac = ld8(g + 0x12)
						st8(s152, ac)
						i = ac
						if (2 > ac) {
							if (0x11 > ab) {
								break B14
							}
							if (0x10 > f - 0x23) {
								break B14
							}
							ab = j
							const z = ld64(g + 0x2b)
							const x = ld64(g + 0x23)
							const aa = ld64(g + 0x13)
							const y = ld64(g + 0x1b)
							st16(s152, 0xffff)
							st64(s10, accounts, accounts_len)
							st64(s1000 + 8, s152)
							v = accounts_two_hop_swap(sb0, program_id, s10, j, fp)
							const m = ld64(sb0)
							if (m == 0) {
								o = ld64(sb0 + 8)
								st64(a + 8, ld64(sa0))
								st64(a, o)
								return v
							}
							const w = ld64(sb0 + 8)
							const n = ld64(sa0)
							memcpy(s138, s98, 0x88)
							st64(s150, m, w, n)
							st8(s98 + 9, ld8(s152 + 1))
							st8(s98 + 8, ld8(s152))
							copyr(sa0, s10, 0x10)
							st64(sb0, program_id, s150)
							st64(s1000, h != 0, l != 0, ac != 0, aa, y, x, z)
							v = fn_386c8(s168, sb0, ab, k, h != 0, l != 0, ac != 0, aa, y, x, z)
							o = ld64(s168)
							if (o == 2) {
								v = fn_d12a0(s178, s150, program_id)
								o = ld64(s178)
								st64(a + 8, ld64(s178 + 8))
								st64(a, o)
								return v
							}
							st64(a + 8, ld64(s168 + 8))
							st64(a, o)
							return v
						}
					}
				}
				st64(sb0, 0x100159620)
				st64(sa0, s10)
				st64(s10, s152, fn_14ef78)
				st64(s98 + 8, 0)
				st64(sb0 + 8, 1)
				st64(s98, 1)
				// fmt "Invalid bool representation: {}" {} = *s152 [fn_14ef78]
				fn_147e78(s150, sb0, i, j, k)
				p = fn_b580(s150)
				break B15
			}
		}
		p = fn_1459d0(0x100159468)
	}
	const q = p
	if (2 > (p & 3) - 2) {
		v = anchor_error_from(s188, 0x66 /* anchor::InstructionDidNotDeserialize */, s, t, u)
		o = ld64(s188)
		st64(a + 8, ld64(s188 + 8))
		st64(a, o)
		return v
	}
	if ((q & 3) == 0) {
		v = anchor_error_from(s188, 0x66 /* anchor::InstructionDidNotDeserialize */, s, t, u)
		o = ld64(s188)
		st64(a + 8, ld64(s188 + 8))
		st64(a, o)
		return v
	}
	const r = ld64(ld64(p + 7))
	callx(r, ld64(p - 1), r)
	v = anchor_error_from(s188, 0x66 /* anchor::InstructionDidNotDeserialize */)
	o = ld64(s188)
	st64(a + 8, ld64(s188 + 8))
	st64(a, o)
	return v
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

// Anchor Accounts::try_accounts of instruction two_hop_swap (called by ix_two_hop_swap; name [str]: from the handler's "Instruction: …" log; was fn_ce490)
// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: token_program (ConstraintAddress), whirlpool_one (ConstraintMut), whirlpool_two (ConstraintMut), token_owner_account_one_a (ConstraintMut, ConstraintRaw), token_vault_one_a (ConstraintMut, ConstraintAddress), tick_array_one_0 (AccountNotEnoughKeys, ConstraintMut), tick_array_one_1 (ConstraintMut), tick_array_one_2 (ConstraintMut), tick_array_two_0 (ConstraintMut), tick_array_two_1 (ConstraintMut), tick_array_two_2 (ConstraintMut), oracle_one (ConstraintSeeds), oracle_two (ConstraintSeeds), token_owner_account_one_b (ConstraintMut, ConstraintRaw), token_vault_one_b (ConstraintMut, ConstraintAddress), token_owner_account_two_a (ConstraintMut, ConstraintRaw), token_vault_two_a (ConstraintMut, ConstraintAddress), token_owner_account_two_b (ConstraintMut, ConstraintRaw), token_vault_two_b (ConstraintMut, ConstraintAddress), token_authority
// names [str: account-error string on the failing branch; which variable holds the account is inferred]: token_owner_account_one_a_box, token_vault_one_a_box, token_owner_account_one_b_box, token_vault_one_b_box, token_owner_account_two_a_box, token_vault_two_a_box, token_owner_account_two_b_box, token_vault_two_b_box, token_program, whirlpool_one, token_vault_one_a, token_vault_one_b, token_vault_two_a, token_vault_two_b
function accounts_two_hop_swap(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s270 = fp - 0x270, s290 = fp - 0x290, s2b0 = fp - 0x2b0, s2d0 = fp - 0x2d0, s2f0 = fp - 0x2f0, s310 = fp - 0x310, s320 = fp - 0x320, s330 = fp - 0x330, s340 = fp - 0x340, s350 = fp - 0x350, s360 = fp - 0x360, s370 = fp - 0x370, s380 = fp - 0x380, s390 = fp - 0x390, s3a0 = fp - 0x3a0, s3b0 = fp - 0x3b0, s3c0 = fp - 0x3c0, s3d0 = fp - 0x3d0, s3e0 = fp - 0x3e0, s3f0 = fp - 0x3f0, s400 = fp - 0x400, s410 = fp - 0x410, s420 = fp - 0x420, s430 = fp - 0x430, s440 = fp - 0x440, s450 = fp - 0x450, s460 = fp - 0x460, s470 = fp - 0x470, s480 = fp - 0x480, s490 = fp - 0x490, s4a0 = fp - 0x4a0, s4b0 = fp - 0x4b0, s4c0 = fp - 0x4c0, s4d0 = fp - 0x4d0, s4e0 = fp - 0x4e0, s4f0 = fp - 0x4f0, s500 = fp - 0x500, s510 = fp - 0x510, s520 = fp - 0x520, s530 = fp - 0x530, s540 = fp - 0x540, s550 = fp - 0x550, s560 = fp - 0x560, s570 = fp - 0x570, s580 = fp - 0x580, s590 = fp - 0x590, s5a0 = fp - 0x5a0, s5b0 = fp - 0x5b0, s5c0 = fp - 0x5c0, s5d0 = fp - 0x5d0, s5e0 = fp - 0x5e0, s5f0 = fp - 0x5f0, s600 = fp - 0x600, s610 = fp - 0x610, s620 = fp - 0x620, s630 = fp - 0x630, s640 = fp - 0x640, s650 = fp - 0x650, s660 = fp - 0x660, s670 = fp - 0x670, s680 = fp - 0x680, s690 = fp - 0x690, s6a0 = fp - 0x6a0, s6b0 = fp - 0x6b0, s6c0 = fp - 0x6c0, s6d0 = fp - 0x6d0, s6e0 = fp - 0x6e0, s6f0 = fp - 0x6f0, s700 = fp - 0x700, s710 = fp - 0x710, s720 = fp - 0x720, s730 = fp - 0x730, s740 = fp - 0x740, s750 = fp - 0x750, s760 = fp - 0x760, s770 = fp - 0x770, s780 = fp - 0x780, s790 = fp - 0x790, s7a0 = fp - 0x7a0, s7b0 = fp - 0x7b0, s7c0 = fp - 0x7c0, s7d0 = fp - 0x7d0, s7e0 = fp - 0x7e0, s7f0 = fp - 0x7f0, s800 = fp - 0x800, s810 = fp - 0x810, s820 = fp - 0x820, s830 = fp - 0x830, s840 = fp - 0x840, s850 = fp - 0x850, s860 = fp - 0x860, s870 = fp - 0x870, s880 = fp - 0x880, s890 = fp - 0x890, s8a0 = fp - 0x8a0, s8a8 = fp - 0x8a8, s8b0 = fp - 0x8b0, s8b8 = fp - 0x8b8, s8c0 = fp - 0x8c0, s8c8 = fp - 0x8c8, s8d0 = fp - 0x8d0, s8d8 = fp - 0x8d8, s8e0 = fp - 0x8e0, s8e8 = fp - 0x8e8, s8f0 = fp - 0x8f0, s8f8 = fp - 0x8f8, s900 = fp - 0x900, s908 = fp - 0x908, s910 = fp - 0x910, s918 = fp - 0x918, s920 = fp - 0x920, s928 = fp - 0x928, s930 = fp - 0x930, s938 = fp - 0x938, s940 = fp - 0x940
	let ae, af, ah, ai, aj, al, an, ap: u64
	st64(s8a8, b)
	fn_129a0(s290, c, c, d, e)
	const token_program: AccountInfo = ld64(s290 + 8)
	const f = ld64(s290)
	if (f != 2) {
		aj = Error_with_account_name(s320, f, token_program, "token_program", 0xd)
		ai = ld64(s320)
		st64(a + 0x10, ld64(s320 + 8))
		st64(a + 8, ai)
		st64(a, 0)
		return aj
	}
	st64(s8b0, ld64(e - 0xff8))
	try_accounts_11718(s290, c)
	const i = ld64(s290 + 8)
	const g = ld64(s290)
	if (g == 2) {
		try_accounts_11a48(s290, c)
		if (ld64(s290) == 0) {
			aj = Error_with_account_name(s8a0, ld64(s290 + 8), ld64(s290 + 0x10), "whirlpool_one", 0xd)
			ai = ld64(s8a0)
			st64(a + 0x10, ld64(s8a0 + 8))
			st64(a + 8, ai)
			st64(a, 0)
			return aj
		}
		const h = ld64(0x300000000 /* heap bump-allocator cursor */)
		const j = h != 0 ? sat_sub(h, 0x290) & -8 : 0x300007d70
		st64(s8c0, i)
		if (j > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, j)
			st64(s8b8, j)
			memcpy(j, s290, 0x290)
			try_accounts_11a48(s290, c)
			if (ld64(s290) == 0) {
				aj = Error_with_account_name(s890, ld64(s290 + 8), ld64(s290 + 0x10), "whirlpool_two", 0xd)
				ai = ld64(s890)
				st64(a + 0x10, ld64(s890 + 8))
				st64(a + 8, ai)
				st64(a, 0)
				return aj
			}
			const l = ld64(0x300000000 /* heap bump-allocator cursor */)
			const m = l != 0 ? sat_sub(l, 0x290) & -8 : 0x300007d70
			if (m > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, m)
				st64(s8c8, m)
				memcpy(m, s290, 0x290)
				try_accounts_11f50(s290, c)
				if (ld32(s270 + 0x70) == 2) {
					aj = Error_with_account_name(s880, ld64(s290), ld64(s290 + 8), "token_owner_account_one_a", 0x19)
					ai = ld64(s880)
					st64(a + 0x10, ld64(s880 + 8))
					st64(a + 8, ai)
					st64(a, 0)
					return aj
				}
				const n = ld64(0x300000000 /* heap bump-allocator cursor */)
				const token_owner_account_one_a_box: TokenAccount = n != 0 ? sat_sub(n, 0xb8) & -8 : 0x300007f48
				if (token_owner_account_one_a_box > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, token_owner_account_one_a_box)
					st64(s8d0, token_owner_account_one_a_box)
					memcpy(token_owner_account_one_a_box, s290, 0xb8)
					try_accounts_11f50(s290, c)
					if (ld32(s270 + 0x70) == 2) {
						aj = Error_with_account_name(s870, ld64(s290), ld64(s290 + 8), "token_vault_one_a", 0x11)
						ai = ld64(s870)
						st64(a + 0x10, ld64(s870 + 8))
						st64(a + 8, ai)
						st64(a, 0)
						return aj
					}
					const p = ld64(0x300000000 /* heap bump-allocator cursor */)
					const token_vault_one_a_box: TokenAccount = p != 0 ? sat_sub(p, 0xb8) & -8 : 0x300007f48
					if (token_vault_one_a_box > 0x300000007) {
						st64(0x300000000 /* heap bump-allocator cursor */, token_vault_one_a_box)
						memcpy(token_vault_one_a_box, s290, 0xb8)
						fn_20f8(s290, c)
						const token_owner_account_one_b_box: TokenAccount = ld64(s290 + 8)
						const r = ld64(s290)
						if (r == 2) {
							st64(s8d8, token_owner_account_one_b_box)
							fn_20f8(s290, c, token_owner_account_one_b_box)
							const token_vault_one_b_box: TokenAccount = ld64(s290 + 8)
							const t = ld64(s290)
							if (t == 2) {
								st64(s8e0, token_vault_one_b_box)
								fn_20f8(s290, c, token_vault_one_b_box)
								const token_owner_account_two_a_box: TokenAccount = ld64(s290 + 8)
								const v = ld64(s290)
								if (v == 2) {
									st64(s8e8, token_owner_account_two_a_box)
									fn_20f8(s290, c, token_owner_account_two_a_box)
									const token_vault_two_a_box: TokenAccount = ld64(s290 + 8)
									const x = ld64(s290)
									if (x == 2) {
										st64(s8f0, token_vault_two_a_box)
										fn_20f8(s290, c, token_vault_two_a_box)
										const token_owner_account_two_b_box: TokenAccount = ld64(s290 + 8)
										const z = ld64(s290)
										if (z == 2) {
											st64(s8f8, token_owner_account_two_b_box)
											fn_20f8(s290, c, token_owner_account_two_b_box)
											const token_vault_two_b_box: TokenAccount = ld64(s290 + 8)
											const ab = ld64(s290)
											if (ab == 2) {
												B55: {
													B50: {
														B49: {
															B46: {
																B43: {
																	B40: {
																		B37: {
																			const ad = ld64(c + 8)
																			st64(s900, token_vault_two_b_box)
																			if (ad != 0) {
																				ah = ld64(c)
																				st64(c, ah + 0x30, ad - 1)
																				if (ad != 1) {
																					st64(s908, ah)
																					al = ld64(c)
																					st64(c, al + 0x30, ad - 2)
																					if (ad != 2) {
																						st64(s910, al)
																						an = ld64(c)
																						st64(c, an + 0x30, ad - 3)
																						if (ad != 3) {
																							st64(s918, an)
																							ap = ld64(c)
																							st64(c, ap + 0x30, ad - 4)
																							if (ad != 4) {
																								st64(s928, ap)
																								const ar: AccountInfo = ld64(c)
																								st64(s920, ar)
																								st64(c, ar + 0x30, ad - 5)
																								if (ad != 5) {
																									const au: AccountInfo = ld64(c)
																									st64(s930, au)
																									st64(c, au + 0x30, ad - 6)
																									if (ad != 6) {
																										const ax: AccountInfo = ld64(c)
																										st64(s938, ax)
																										st64(c, ax + 0x30, ad - 7)
																										if (ad == 7) {
																											break B50
																										}
																										st64(c + 8, ad - 8)
																										const ay: AccountInfo = ld64(c)
																										st64(s940, ay)
																										st64(c, ay + 0x30)
																										break B55
																									}
																									break B49
																								}
																								break B46
																							}
																							break B43
																						}
																						break B40
																					}
																					break B37
																				}
																			} else {
																				anchor_error_from(s3a0, 0xbbd /* anchor::AccountNotEnoughKeys */, token_vault_two_b_box, ae, af)
																				ah = ld64(s3a0 + 8)
																				const ag = ld64(s3a0)
																				if (ag != 2) {
																					aj = Error_with_account_name(s3b0, ag, ah, "tick_array_one_0", 0x10)
																					ai = ld64(s3b0)
																					st64(a + 0x10, ld64(s3b0 + 8))
																					st64(a + 8, ai)
																					st64(a, 0)
																					return aj
																				}
																			}
																			st64(s908, ah)
																			anchor_error_from(s3c0, 0xbbd /* anchor::AccountNotEnoughKeys */, ah, ae, af)
																			al = ld64(s3c0 + 8)
																			const ak = ld64(s3c0)
																			if (ak != 2) {
																				aj = Error_with_account_name(s3d0, ak, al, "tick_array_one_1", 0x10)
																				ai = ld64(s3d0)
																				st64(a + 0x10, ld64(s3d0 + 8))
																				st64(a + 8, ai)
																				st64(a, 0)
																				return aj
																			}
																		}
																		st64(s910, al)
																		anchor_error_from(s3e0, 0xbbd /* anchor::AccountNotEnoughKeys */, al, ae, af)
																		an = ld64(s3e0 + 8)
																		const am = ld64(s3e0)
																		if (am != 2) {
																			aj = Error_with_account_name(s3f0, am, an, "tick_array_one_2", 0x10)
																			ai = ld64(s3f0)
																			st64(a + 0x10, ld64(s3f0 + 8))
																			st64(a + 8, ai)
																			st64(a, 0)
																			return aj
																		}
																	}
																	st64(s918, an)
																	anchor_error_from(s400, 0xbbd /* anchor::AccountNotEnoughKeys */, an, ae, af)
																	ap = ld64(s400 + 8)
																	const ao = ld64(s400)
																	if (ao != 2) {
																		aj = Error_with_account_name(s410, ao, ap, "tick_array_two_0", 0x10)
																		ai = ld64(s410)
																		st64(a + 0x10, ld64(s410 + 8))
																		st64(a + 8, ai)
																		st64(a, 0)
																		return aj
																	}
																}
																st64(s928, ap)
																anchor_error_from(s420, 0xbbd /* anchor::AccountNotEnoughKeys */, ap, ae, af)
																ap = undef
																st64(s920, ld64(s420 + 8))
																const aq = ld64(s420)
																if (aq != 2) {
																	aj = Error_with_account_name(s430, aq, ld64(s920), "tick_array_two_1", 0x10)
																	ai = ld64(s430)
																	st64(a + 0x10, ld64(s430 + 8))
																	st64(a + 8, ai)
																	st64(a, 0)
																	return aj
																}
															}
															anchor_error_from(s440, 0xbbd /* anchor::AccountNotEnoughKeys */, ap, ae, af)
															ap = undef
															st64(s930, ld64(s440 + 8))
															const at = ld64(s440)
															if (at != 2) {
																aj = Error_with_account_name(s450, at, ld64(s930), "tick_array_two_2", 0x10)
																ai = ld64(s450)
																st64(a + 0x10, ld64(s450 + 8))
																st64(a + 8, ai)
																st64(a, 0)
																return aj
															}
														}
														anchor_error_from(s460, 0xbbd /* anchor::AccountNotEnoughKeys */, ap, ae, af)
														ap = undef
														st64(s938, ld64(s460 + 8))
														const av = ld64(s460)
														if (av != 2) {
															aj = Error_with_account_name(s470, av, ld64(s938), "oracle_one", 0xa)
															ai = ld64(s470)
															st64(a + 0x10, ld64(s470 + 8))
															st64(a + 8, ai)
															st64(a, 0)
															return aj
														}
													}
													anchor_error_from(s480, 0xbbd /* anchor::AccountNotEnoughKeys */, ap, ae, af)
													st64(s940, ld64(s480 + 8))
													const aw = ld64(s480)
													if (aw != 2) {
														aj = Error_with_account_name(s490, aw, ld64(s940), "oracle_two", 0xa)
														ai = ld64(s490)
														st64(a + 0x10, ld64(s490 + 8))
														st64(a + 8, ai)
														st64(a, 0)
														return aj
													}
												}
												const az = token_program.key
												copyr(s2b0, az, 0x20)
												if ((memcmp(s2b0, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) == 0) {
													const whirlpool_one: AccountInfo = ld64(ld64(s8b8))
													if (whirlpool_one.is_writable == 0) {
														anchor_error_from(s850, 0x7d0 /* anchor::ConstraintMut */)
														aj = Error_with_account_name(s860, ld64(s850), ld64(s850 + 8), "whirlpool_one", 0xd)
														ai = ld64(s860)
														st64(a + 0x10, ld64(s860 + 8))
														st64(a + 8, ai)
														st64(a, 0)
														return aj
													}
													if (ld8(ld64(ld64(s8c8)) + 0x29 /* is_writable */) != 0) {
														if (ld8(ld64(ld64(s8d0)) + 0x29) != 0) {
															if ((memcmp(ld64(s8d0) + 8, ld64(s8b8) + 0x1a8, 0x20) as u32) == 0) {
																const token_vault_one_a: AccountInfo = token_vault_one_a_box.info
																if (token_vault_one_a.is_writable != 0) {
																	const bf = token_vault_one_a.key
																	copyr(s2d0, bf, 0x20)
																	const bg = ld64(s8b8)
																	copyr(s2b0, bg + 0x1c8, 0x20)
																	if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
																		anchor_error_from(s4f0, 0x7dc /* anchor::ConstraintAddress */)
																		const bj = Error_with_account_name(s500, ld64(s4f0), ld64(s4f0 + 8), "token_vault_one_a", 0x11)
																		const bi = ld64(s500 + 8)
																		const bh = ld64(s500)
																		copy(s290, s2d0, 0x40)
																		aj = fn_13b5c0(s510, bh, bi, s290, bj)
																		ai = ld64(s510)
																		st64(a + 0x10, ld64(s510 + 8))
																		st64(a + 8, ai)
																		st64(a, 0)
																		return aj
																	}
																	if (ld8(ld64(ld64(s8d8)) + 0x29) == 0) {
																		anchor_error_from(s7d0, 0x7d0 /* anchor::ConstraintMut */)
																		aj = Error_with_account_name(s7e0, ld64(s7d0), ld64(s7d0 + 8), "token_owner_account_one_b", 0x19)
																		ai = ld64(s7e0)
																		st64(a + 0x10, ld64(s7e0 + 8))
																		st64(a + 8, ai)
																		st64(a, 0)
																		return aj
																	}
																	if ((memcmp(ld64(s8d8) + 8, ld64(s8b8) + 0x1e8, 0x20) as u32) == 0) {
																		const token_vault_one_b: AccountInfo = ld64(ld64(s8e0))
																		if (token_vault_one_b.is_writable != 0) {
																			const bl = token_vault_one_b.key
																			copyr(s2d0, bl, 0x20)
																			const bm = ld64(s8b8)
																			copyr(s2b0, bm + 0x208, 0x20)
																			if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
																				anchor_error_from(s540, 0x7dc /* anchor::ConstraintAddress */)
																				const bp = Error_with_account_name(s550, ld64(s540), ld64(s540 + 8), "token_vault_one_b", 0x11)
																				const bo = ld64(s550 + 8)
																				const bn = ld64(s550)
																				copy(s290, s2d0, 0x40)
																				aj = fn_13b5c0(s560, bn, bo, s290, bp)
																				ai = ld64(s560)
																				st64(a + 0x10, ld64(s560 + 8))
																				st64(a + 8, ai)
																				st64(a, 0)
																				return aj
																			}
																			if (ld8(ld64(ld64(s8e8)) + 0x29) == 0) {
																				anchor_error_from(s790, 0x7d0 /* anchor::ConstraintMut */)
																				aj = Error_with_account_name(s7a0, ld64(s790), ld64(s790 + 8), "token_owner_account_two_a", 0x19)
																				ai = ld64(s7a0)
																				st64(a + 0x10, ld64(s7a0 + 8))
																				st64(a + 8, ai)
																				st64(a, 0)
																				return aj
																			}
																			if ((memcmp(ld64(s8e8) + 8, ld64(s8c8) + 0x1a8, 0x20) as u32) == 0) {
																				const token_vault_two_a: AccountInfo = ld64(ld64(s8f0))
																				if (token_vault_two_a.is_writable != 0) {
																					const br = token_vault_two_a.key
																					copyr(s2d0, br, 0x20)
																					const bs = ld64(s8c8)
																					copyr(s2b0, bs + 0x1c8, 0x20)
																					if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
																						anchor_error_from(s590, 0x7dc /* anchor::ConstraintAddress */)
																						const bv = Error_with_account_name(s5a0, ld64(s590), ld64(s590 + 8), "token_vault_two_a", 0x11)
																						const bu = ld64(s5a0 + 8)
																						const bt = ld64(s5a0)
																						copy(s290, s2d0, 0x40)
																						aj = fn_13b5c0(s5b0, bt, bu, s290, bv)
																						ai = ld64(s5b0)
																						st64(a + 0x10, ld64(s5b0 + 8))
																						st64(a + 8, ai)
																						st64(a, 0)
																						return aj
																					}
																					if (ld8(ld64(ld64(s8f8)) + 0x29) == 0) {
																						anchor_error_from(s750, 0x7d0 /* anchor::ConstraintMut */)
																						aj = Error_with_account_name(s760, ld64(s750), ld64(s750 + 8), "token_owner_account_two_b", 0x19)
																						ai = ld64(s760)
																						st64(a + 0x10, ld64(s760 + 8))
																						st64(a + 8, ai)
																						st64(a, 0)
																						return aj
																					}
																					if ((memcmp(ld64(s8f8) + 8, ld64(s8c8) + 0x1e8, 0x20) as u32) == 0) {
																						const token_vault_two_b: AccountInfo = ld64(ld64(s900))
																						if (token_vault_two_b.is_writable != 0) {
																							const bx = token_vault_two_b.key
																							copyr(s2d0, bx, 0x20)
																							const by = ld64(s8c8)
																							copyr(s2b0, by + 0x208, 0x20)
																							if ((memcmp(s2d0, s2b0, 0x20) as u32) != 0) {
																								anchor_error_from(s5e0, 0x7dc /* anchor::ConstraintAddress */)
																								const cb = Error_with_account_name(s5f0, ld64(s5e0), ld64(s5e0 + 8), "token_vault_two_b", 0x11)
																								const ca = ld64(s5f0 + 8)
																								const bz = ld64(s5f0)
																								copy(s290, s2d0, 0x40)
																								aj = fn_13b5c0(s600, bz, ca, s290, cb)
																								ai = ld64(s600)
																								st64(a + 0x10, ld64(s600 + 8))
																								st64(a + 8, ai)
																								st64(a, 0)
																								return aj
																							}
																							if (ld8(ld64(s908) + 0x29) == 0) {
																								anchor_error_from(s710, 0x7d0 /* anchor::ConstraintMut */)
																								aj = Error_with_account_name(s720, ld64(s710), ld64(s710 + 8), "tick_array_one_0", 0x10)
																								ai = ld64(s720)
																								st64(a + 0x10, ld64(s720 + 8))
																								st64(a + 8, ai)
																								st64(a, 0)
																								return aj
																							}
																							if (ld8(ld64(s910) + 0x29) != 0) {
																								if (ld8(ld64(s918) + 0x29) != 0) {
																									if (ld8(ld64(s928) + 0x29) != 0) {
																										if (ld8(ld64(s920) + 0x29) != 0) {
																											if (ld8(ld64(s930) + 0x29) != 0) {
																												const cc = whirlpool_one.key
																												copyr(s2b0, cc, 0x20)
																												st64(s2d0, 0x100154c38, 6, s2b0, 0x20)
																												// PDA find_program_address(["oracle", *cc], program *(ld64(s8a8)))
																												Pubkey_find_program_address(s290, s2d0, 2, ld64(s8a8))
																												copyr(s310, s290, 0x20)
																												st8(ld64(s8b0), ld8(s270))
																												const cd = ld64(ld64(s938))
																												copyr(s290, cd, 0x20)
																												if ((memcmp(s290, s310, 0x20) as u32) != 0) {
																													anchor_error_from(s610, 0x7d6 /* anchor::ConstraintSeeds */)
																													const cp = Error_with_account_name(s620, ld64(s610), ld64(s610 + 8), "oracle_one", 0xa)
																													const co = ld64(s620 + 8)
																													const cn = ld64(s620)
																													copyr(s290, cd, 0x20)
																													copy(s270, s310, 0x20)
																													aj = fn_13b5c0(s630, cn, co, s290, cp)
																													ai = ld64(s630)
																													st64(a + 0x10, ld64(s630 + 8))
																													st64(a + 8, ai)
																													st64(a, 0)
																													return aj
																												}
																												const ce = ld64(ld64(ld64(s8c8)) /* key */)
																												const ci = ld64(ce)
																												const ch = ld64(ce + 8)
																												const cg = ld64(ce + 0x10)
																												const cf = ld64(ce + 0x18)
																												st64(s2d0, 0x100154c38, 6, s2b0, 0x20, ci, ch, cg, cf)
																												// PDA find_program_address(["oracle", *s2b0], program *(ld64(s8a8)))
																												Pubkey_find_program_address(s290, s2d0, 2, ld64(s8a8))
																												copyr(s2f0, s290, 0x20)
																												st8(ld64(s8b0) + 1, ld8(s270))
																												const cj = ld64(ld64(s940))
																												copyr(s290, cj, 0x20)
																												aj = memcmp(s290, s2f0, 0x20) as u32
																												if (aj == 0) {
																													st64(a + 0x98, ld64(s940))
																													st64(a + 0x90, ld64(s938))
																													st64(a + 0x88, ld64(s930))
																													st64(a + 0x80, ld64(s920))
																													st64(a + 0x78, ld64(s928))
																													st64(a + 0x70, ld64(s918))
																													st64(a + 0x68, ld64(s910))
																													st64(a + 0x60, ld64(s908))
																													st64(a + 0x58, ld64(s900))
																													st64(a + 0x50, ld64(s8f8))
																													st64(a + 0x48, ld64(s8f0))
																													st64(a + 0x40, ld64(s8e8))
																													st64(a + 0x38, ld64(s8e0))
																													st64(a + 0x30, ld64(s8d8))
																													st64(a + 0x28, token_vault_one_a_box)
																													st64(a + 0x20, ld64(s8d0))
																													st64(a + 0x18, ld64(s8c8))
																													st64(a + 0x10, ld64(s8b8))
																													st64(a + 8, ld64(s8c0))
																													st64(a, token_program)
																													return aj
																												}
																												anchor_error_from(s640, 0x7d6 /* anchor::ConstraintSeeds */)
																												const cm = Error_with_account_name(s650, ld64(s640), ld64(s640 + 8), "oracle_two", 0xa)
																												const cl = ld64(s650 + 8)
																												const ck = ld64(s650)
																												copyr(s290, cj, 0x20)
																												copy(s270, s2f0, 0x20)
																												aj = fn_13b5c0(s660, ck, cl, s290, cm)
																												ai = ld64(s660)
																												st64(a + 0x10, ld64(s660 + 8))
																												st64(a + 8, ai)
																												st64(a, 0)
																												return aj
																											}
																											anchor_error_from(s670, 0x7d0 /* anchor::ConstraintMut */)
																											aj = Error_with_account_name(s680, ld64(s670), ld64(s670 + 8), "tick_array_two_2", 0x10)
																											ai = ld64(s680)
																											st64(a + 0x10, ld64(s680 + 8))
																											st64(a + 8, ai)
																											st64(a, 0)
																											return aj
																										}
																										anchor_error_from(s690, 0x7d0 /* anchor::ConstraintMut */)
																										aj = Error_with_account_name(s6a0, ld64(s690), ld64(s690 + 8), "tick_array_two_1", 0x10)
																										ai = ld64(s6a0)
																										st64(a + 0x10, ld64(s6a0 + 8))
																										st64(a + 8, ai)
																										st64(a, 0)
																										return aj
																									}
																									anchor_error_from(s6b0, 0x7d0 /* anchor::ConstraintMut */)
																									aj = Error_with_account_name(s6c0, ld64(s6b0), ld64(s6b0 + 8), "tick_array_two_0", 0x10)
																									ai = ld64(s6c0)
																									st64(a + 0x10, ld64(s6c0 + 8))
																									st64(a + 8, ai)
																									st64(a, 0)
																									return aj
																								}
																								anchor_error_from(s6d0, 0x7d0 /* anchor::ConstraintMut */)
																								aj = Error_with_account_name(s6e0, ld64(s6d0), ld64(s6d0 + 8), "tick_array_one_2", 0x10)
																								ai = ld64(s6e0)
																								st64(a + 0x10, ld64(s6e0 + 8))
																								st64(a + 8, ai)
																								st64(a, 0)
																								return aj
																							}
																							anchor_error_from(s6f0, 0x7d0 /* anchor::ConstraintMut */)
																							aj = Error_with_account_name(s700, ld64(s6f0), ld64(s6f0 + 8), "tick_array_one_1", 0x10)
																							ai = ld64(s700)
																							st64(a + 0x10, ld64(s700 + 8))
																							st64(a + 8, ai)
																							st64(a, 0)
																							return aj
																						}
																						anchor_error_from(s730, 0x7d0 /* anchor::ConstraintMut */)
																						aj = Error_with_account_name(s740, ld64(s730), ld64(s730 + 8), "token_vault_two_b", 0x11)
																						ai = ld64(s740)
																						st64(a + 0x10, ld64(s740 + 8))
																						st64(a + 8, ai)
																						st64(a, 0)
																						return aj
																					}
																					anchor_error_from(s5c0, 0x7d3 /* anchor::ConstraintRaw */)
																					aj = Error_with_account_name(s5d0, ld64(s5c0), ld64(s5c0 + 8), "token_owner_account_two_b", 0x19)
																					ai = ld64(s5d0)
																					st64(a + 0x10, ld64(s5d0 + 8))
																					st64(a + 8, ai)
																					st64(a, 0)
																					return aj
																				}
																				anchor_error_from(s770, 0x7d0 /* anchor::ConstraintMut */)
																				aj = Error_with_account_name(s780, ld64(s770), ld64(s770 + 8), "token_vault_two_a", 0x11)
																				ai = ld64(s780)
																				st64(a + 0x10, ld64(s780 + 8))
																				st64(a + 8, ai)
																				st64(a, 0)
																				return aj
																			}
																			anchor_error_from(s570, 0x7d3 /* anchor::ConstraintRaw */)
																			aj = Error_with_account_name(s580, ld64(s570), ld64(s570 + 8), "token_owner_account_two_a", 0x19)
																			ai = ld64(s580)
																			st64(a + 0x10, ld64(s580 + 8))
																			st64(a + 8, ai)
																			st64(a, 0)
																			return aj
																		}
																		anchor_error_from(s7b0, 0x7d0 /* anchor::ConstraintMut */)
																		aj = Error_with_account_name(s7c0, ld64(s7b0), ld64(s7b0 + 8), "token_vault_one_b", 0x11)
																		ai = ld64(s7c0)
																		st64(a + 0x10, ld64(s7c0 + 8))
																		st64(a + 8, ai)
																		st64(a, 0)
																		return aj
																	}
																	anchor_error_from(s520, 0x7d3 /* anchor::ConstraintRaw */)
																	aj = Error_with_account_name(s530, ld64(s520), ld64(s520 + 8), "token_owner_account_one_b", 0x19)
																	ai = ld64(s530)
																	st64(a + 0x10, ld64(s530 + 8))
																	st64(a + 8, ai)
																	st64(a, 0)
																	return aj
																}
																anchor_error_from(s7f0, 0x7d0 /* anchor::ConstraintMut */)
																aj = Error_with_account_name(s800, ld64(s7f0), ld64(s7f0 + 8), "token_vault_one_a", 0x11)
																ai = ld64(s800)
																st64(a + 0x10, ld64(s800 + 8))
																st64(a + 8, ai)
																st64(a, 0)
																return aj
															}
															anchor_error_from(s4d0, 0x7d3 /* anchor::ConstraintRaw */)
															aj = Error_with_account_name(s4e0, ld64(s4d0), ld64(s4d0 + 8), "token_owner_account_one_a", 0x19)
															ai = ld64(s4e0)
															st64(a + 0x10, ld64(s4e0 + 8))
															st64(a + 8, ai)
															st64(a, 0)
															return aj
														}
														anchor_error_from(s810, 0x7d0 /* anchor::ConstraintMut */)
														aj = Error_with_account_name(s820, ld64(s810), ld64(s810 + 8), "token_owner_account_one_a", 0x19)
														ai = ld64(s820)
														st64(a + 0x10, ld64(s820 + 8))
														st64(a + 8, ai)
														st64(a, 0)
														return aj
													}
													anchor_error_from(s830, 0x7d0 /* anchor::ConstraintMut */)
													aj = Error_with_account_name(s840, ld64(s830), ld64(s830 + 8), "whirlpool_two", 0xd)
													ai = ld64(s840)
													st64(a + 0x10, ld64(s840 + 8))
													st64(a + 8, ai)
													st64(a, 0)
													return aj
												}
												anchor_error_from(s4a0, 0x7dc /* anchor::ConstraintAddress */)
												const bc = Error_with_account_name(s4b0, ld64(s4a0), ld64(s4a0 + 8), "token_program", 0xd)
												const bb = ld64(s4b0 + 8)
												const ba = ld64(s4b0)
												copyr(s290, s2b0, 0x20)
												st64(s270, 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */, 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */, 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */, 0xa900ff7e85f58c3a /* TOKEN_PROGRAM[3] */) // key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
												aj = fn_13b5c0(s4c0, ba, bb, s290, bc)
												ai = ld64(s4c0)
												st64(a + 0x10, ld64(s4c0 + 8))
												st64(a + 8, ai)
												st64(a, 0)
												return aj
											}
											aj = Error_with_account_name(s390, ab, token_vault_two_b_box, "token_vault_two_b", 0x11)
											ai = ld64(s390)
											st64(a + 0x10, ld64(s390 + 8))
											st64(a + 8, ai)
											st64(a, 0)
											return aj
										}
										aj = Error_with_account_name(s380, z, token_owner_account_two_b_box, "token_owner_account_two_b", 0x19)
										ai = ld64(s380)
										st64(a + 0x10, ld64(s380 + 8))
										st64(a + 8, ai)
										st64(a, 0)
										return aj
									}
									aj = Error_with_account_name(s370, x, token_vault_two_a_box, "token_vault_two_a", 0x11)
									ai = ld64(s370)
									st64(a + 0x10, ld64(s370 + 8))
									st64(a + 8, ai)
									st64(a, 0)
									return aj
								}
								aj = Error_with_account_name(s360, v, token_owner_account_two_a_box, "token_owner_account_two_a", 0x19)
								ai = ld64(s360)
								st64(a + 0x10, ld64(s360 + 8))
								st64(a + 8, ai)
								st64(a, 0)
								return aj
							}
							aj = Error_with_account_name(s350, t, token_vault_one_b_box, "token_vault_one_b", 0x11)
							ai = ld64(s350)
							st64(a + 0x10, ld64(s350 + 8))
							st64(a + 8, ai)
							st64(a, 0)
							return aj
						}
						aj = Error_with_account_name(s340, r, token_owner_account_one_b_box, "token_owner_account_one_b", 0x19)
						ai = ld64(s340)
						st64(a + 0x10, ld64(s340 + 8))
						st64(a + 8, ai)
						st64(a, 0)
						return aj
					}
					alloc_handle_alloc_error(8, 0xb8)
				}
				alloc_handle_alloc_error(8, 0xb8)
			}
			alloc_handle_alloc_error(8, 0x290)
		}
		alloc_handle_alloc_error(8, 0x290)
	}
	aj = Error_with_account_name(s330, g, i, "token_authority", 0xf)
	ai = ld64(s330)
	st64(a + 0x10, ld64(s330 + 8))
	st64(a + 8, ai)
	st64(a, 0)
	return aj
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memcpy(a: u64, b: u64, c: u64): u64 {
	sol_memcpy(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), a (points to it), p5 (value), p6 (value), p7 (value), p8 (value), p9 (value), p10 (value), p11 (value)
// types [heur]: b: TwoHopSwapContext (the handler ix_two_hop_swap passes a frame object holding (program_id, address of a copy of the Accounts result))
function fn_386c8(a: u64, b: TwoHopSwapContext, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64): u64 {
	const s28 = fp - 0x28, s48 = fp - 0x48, s60 = fp - 0x60, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, sb8 = fp - 0xb8, sc0 = fp - 0xc0, sf9 = fp - 0xf9, s110 = fp - 0x110, s138 = fp - 0x138, s148 = fp - 0x148, s181 = fp - 0x181, s198 = fp - 0x198, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e8 = fp - 0x1e8, s200 = fp - 0x200, s218 = fp - 0x218, s230 = fp - 0x230, s248 = fp - 0x248, s268 = fp - 0x268, s288 = fp - 0x288, s298 = fp - 0x298, s2a8 = fp - 0x2a8, s2b8 = fp - 0x2b8, s2c8 = fp - 0x2c8, s2d8 = fp - 0x2d8, s2e8 = fp - 0x2e8, s2f8 = fp - 0x2f8, s308 = fp - 0x308, s318 = fp - 0x318, s328 = fp - 0x328, s338 = fp - 0x338, s348 = fp - 0x348, s358 = fp - 0x358, s390 = fp - 0x390, s398 = fp - 0x398, s3b0 = fp - 0x3b0, s410 = fp - 0x410, s418 = fp - 0x418, s420 = fp - 0x420, s428 = fp - 0x428, s430 = fp - 0x430, s438 = fp - 0x438, s440 = fp - 0x440, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let g, r, s, cy, da, db: u64
	st64(s390 + 0x30, a)
	clock_get_13f308(s78)
	if (ld64(s78) != 0) {
		const q = ld64(s78 + 8)
		const p = ld64(s68)
		st64(s68, ld64(s60))
		st64(s78, q, p)
		s = fn_13b430(s298, s78)
		g = ld64(s298)
		r = ld64(s390 + 0x30)
		st64(r + 8, ld64(s298 + 8))
		st64(r, g)
		return s
	}
	st64(s398, p9, p8, p11, p10, c, p7, p6)
	const h = p5
	let f = ld64(s60 + 0x10)
	r = ld64(s390 + 0x30)
	if (-1 >= (f as i64)) {
		s = fn_87630(s2a8, 0x15)
		f = ld64(s2a8 + 8)
		g = ld64(s2a8)
		if (g != 2) {
			st64(r + 8, f)
			st64(r, g)
			return s
		}
	}
	st64(s3b0, d, h, f)
	const accounts: TwoHopSwapAccounts = b.accounts
	const j = ld64(accounts + 0x10)
	const k = ld64(ld64(j))
	copyr(s110, k, 0x20)
	const l = ld64(accounts + 0x18)
	const m = ld64(ld64(l))
	copyr(s78, m, 0x20)
	if ((memcmp(s110, s78, 0x20) as u32) == 0) {
		s = fn_87630(s358, 0x2a)
		g = ld64(s358)
		st64(r + 8, ld64(s358 + 8))
		st64(r, g)
		return s
	}
	const n = ld64(s390 + 0x28) != 0 ? 0x1e8 : 0x1a8
	const o = ld64(s390 + 0x20) != 0 ? 0x1a8 : 0x1e8
	copyr(s288, j + n, 0x20)
	copyr(s268, l + o, 0x20)
	if ((memcmp(s288, s268, 0x20) as u32) == 0) {
		const t = ld64(0x300000000 /* heap bump-allocator cursor */)
		const u = t != 0 ? sat_sub(t, 0x90) & -8 : 0x300007f70
		if (u > 0x300000007) {
			st64(0x300000000 /* heap bump-allocator cursor */, u)
			const v: AccountInfo = ld64(accounts + 0x60)
			const w: LamportsCell = v.lamports
			const ad = v.key
			rc_inc(w)
			const x: DataCell = v.data
			rc_inc(x)
			const y: AccountInfo = ld64(accounts + 0x68)
			const z: LamportsCell = y.lamports
			st64(s410 + 0x50, z)
			const aa = z.strong
			st64(s410 + 0x48, x)
			st64(s410 + 0x20, v.executable)
			st64(s410 + 0x28, v.is_writable)
			st64(s410 + 0x30, v.is_signer)
			st64(s410 + 0x38, v.rent_epoch)
			st64(s410 + 0x40, v.owner)
			st64(s410 + 0x18, y.key)
			rc_inc(ld64(s410 + 0x50), aa)
			const ab: DataCell = y.data
			const ac = ab.strong
			st64(s410 + 0x10, ad)
			rc_inc(ab, ac)
			const ae: AccountInfo = ld64(accounts + 0x70)
			const af: LamportsCell = ae.lamports
			const ag = af.strong
			st64(s420, y.executable)
			st64(s418, y.is_writable)
			st64(s410, y.is_signer)
			st64(s410 + 8, y.rent_epoch)
			const ah = y.owner
			st64(s428, ae.key)
			rc_inc(af, ag)
			st64(s430, ah)
			const ai: DataCell = ae.data
			const aj = ai.strong
			st64(s410 + 0x58, accounts)
			ai.strong = aj + 1
			if (aj != -1) {
				const an = ae.owner
				const am = ae.rent_epoch
				const al = ae.is_signer
				const ak = ae.is_writable
				st8(u + 0x8a, ae.executable)
				st8(u + 0x89, ak)
				st8(u + 0x88, al)
				st64(u + 0x80, am)
				st64(u + 0x78, an)
				st64(u + 0x70, ai)
				st64(u + 0x68, af)
				st64(u + 0x60, ld64(s428))
				st8(u + 0x5a, ld64(s420))
				st8(u + 0x59, ld64(s418))
				st8(u + 0x58, ld64(s410))
				st64(u + 0x50, ld64(s410 + 8))
				st64(u + 0x48, ld64(s430))
				st64(u + 0x40, ab)
				st64(u + 0x38, ld64(s410 + 0x50))
				st64(u + 0x30, ld64(s410 + 0x18))
				st8(u + 0x2a, ld64(s410 + 0x20))
				st8(u + 0x29, ld64(s410 + 0x28))
				st8(u + 0x28, ld64(s410 + 0x30))
				st64(u + 0x20, ld64(s410 + 0x38))
				st64(u + 0x18, ld64(s410 + 0x40))
				st64(u + 0x10, ld64(s410 + 0x48))
				st64(u + 8, w)
				st64(u, ld64(s410 + 0x10))
				st64(s78 + 8, u)
				st64(s230, 0x8000000000000000)
				st64(s68, 3)
				st64(s78, 3)
				fn_60de8(s248, s78, s230, an, ak, ab)
				s = fn_62750(s78, s248, ld64(ld64(s410 + 0x58) + 0x10), ld64(s390 + 0x28))
				let ao = ld64(s68)
				const ap = ld64(s78 + 8)
				const aq = ld64(s78)
				f = ao
				g = ap
				if (aq != 0x8000000000000000) {
					st64(s218, aq, ap, ao)
					const ar = ld64(0x300000000 /* heap bump-allocator cursor */)
					const au: TwoHopSwapAccounts = ld64(s410 + 0x58)
					const at = ar != 0 ? sat_sub(ar, 0x90) & -8 : 0x300007f70
					if (0x300000007 >= at) {
						alloc_handle_alloc_error(8, 0x90)
					}
					st64(0x300000000 /* heap bump-allocator cursor */, at)
					const av: AccountInfo = ld64(au + 0x78)
					const aw: LamportsCell = av.lamports
					const bf = av.key
					rc_inc(aw)
					const ax: DataCell = av.data
					const ay = ax.strong
					st64(s410 + 0x40, ax)
					rc_inc(ax, ay)
					st64(s410 + 0x48, aw)
					const az: AccountInfo = ld64(au + 0x80)
					const ba: LamportsCell = az.lamports
					st64(s410 + 0x50, ba)
					const bb = ba.strong
					st64(s410 + 0x18, av.executable)
					st64(s410 + 0x20, av.is_writable)
					st64(s410 + 0x28, av.is_signer)
					st64(s410 + 0x30, av.rent_epoch)
					st64(s410 + 0x38, av.owner)
					const be = az.key
					rc_inc(ld64(s410 + 0x50), bb)
					const bc: DataCell = az.data
					const bd = bc.strong
					st64(s410, bc, be, bf)
					rc_inc(bc, bd)
					const bg: AccountInfo = ld64(au + 0x88)
					const bh: LamportsCell = bg.lamports
					const bi = bh.strong
					st64(s428, az.executable)
					st64(s420, az.is_writable)
					st64(s418, az.is_signer)
					const bm = az.rent_epoch
					const bj = az.owner
					st64(s430, bg.key)
					rc_inc(bh, bi)
					st64(s438, bj)
					const bk: DataCell = bg.data
					const bl = bk.strong
					st64(s440, bm)
					rc_inc(bk, bl)
					const bq = bg.owner
					const bp = bg.rent_epoch
					const bo = bg.is_signer
					const bn = bg.is_writable
					st8(at + 0x8a, bg.executable)
					st8(at + 0x89, bn)
					st8(at + 0x88, bo)
					st64(at + 0x80, bp)
					st64(at + 0x78, bq)
					st64(at + 0x70, bk)
					st64(at + 0x68, bh)
					st64(at + 0x60, ld64(s430))
					st8(at + 0x5a, ld64(s428))
					st8(at + 0x59, ld64(s420))
					st8(at + 0x58, ld64(s418))
					st64(at + 0x50, ld64(s440))
					st64(at + 0x48, ld64(s438))
					st64(at + 0x40, ld64(s410))
					st64(at + 0x38, ld64(s410 + 0x50))
					st64(at + 0x30, ld64(s410 + 8))
					st8(at + 0x2a, ld64(s410 + 0x18))
					st8(at + 0x29, ld64(s410 + 0x20))
					st8(at + 0x28, ld64(s410 + 0x28))
					st64(at + 0x20, ld64(s410 + 0x30))
					st64(at + 0x18, ld64(s410 + 0x38))
					st64(at + 0x10, ld64(s410 + 0x40))
					st64(at + 8, ld64(s410 + 0x48))
					st64(at, ld64(s410 + 0x10))
					st64(s78, 3, at, 3)
					fn_60de8(s200, s78, s230, bk, bq, bn)
					s = fn_62750(s78, s200, ld64(ld64(s410 + 0x58) + 0x18), ld64(s390 + 0x20))
					let br = ld64(s68)
					const bs = ld64(s78 + 8)
					const bt = ld64(s78)
					f = br
					g = bs
					if (bt != 0x8000000000000000) {
						st64(s1e8, bt, bs, br)
						const bu: TwoHopSwapAccounts = ld64(s410 + 0x58)
						st64(s410 + 0x50, ld64(bu + 0x10))
						const bv = ld64(bu + 0x90)
						st64(s410 + 0x48, s110)
						AccountInfo_clone(s110, bv)
						s = fn_5bad0(s78, ld64(s410 + 0x50), ld64(s410 + 0x48))
						f = ld64(s78 + 8)
						g = ld64(s78)
						const bw = ld8(s48)
						if (bw != 2) {
							copyr(s1c0, s68, 0x20)
							st32(s1c0 + 0x21, ld32(s48 + 1))
							st32(s1c0 + 0x24, ld32(s48 + 4))
							st8(s1c0 + 0x20, bw)
							st64(s1d0, g, f)
							s = fn_5bfc8(s78, s1d0, ld64(s3b0 + 0x10), s)
							g = ld64(s78)
							if (g == 2) {
								if (ld8(s78 + 8) == 0) {
									s = fn_87630(s348, 0x40)
									f = ld64(s348 + 8)
									g = ld64(s348)
								} else {
									s = fn_5c138(s78, s1d0, s)
									if (ld8(s78) == 0) {
										st32(s198 + 3, ld32(s78 + 4))
										st32(s198, ld32(s78 + 1))
										st64(s410 + 0x50, ld64(s78 + 8))
										st64(s410 + 0x48, ld64(s68))
										st64(s410 + 0x40, s110)
										memcpy(s110, s60, 0x38)
										st64(s198 + 0xf, ld64(s410 + 0x48))
										st64(s198 + 7, ld64(s410 + 0x50))
										memcpy(s181, ld64(s410 + 0x40), 0x38)
										const cl: TwoHopSwapAccounts = ld64(s410 + 0x58)
										st64(s410 + 0x50, ld64(cl + 0x18))
										const cm = ld64(cl + 0x98)
										st64(s410 + 0x48, s110)
										AccountInfo_clone(s110, cm)
										s = fn_5bad0(s78, ld64(s410 + 0x50), ld64(s410 + 0x48))
										f = ld64(s78 + 8)
										g = ld64(s78)
										const cn = ld8(s48)
										if (cn != 2) {
											B68: {
												copyr(s138, s68, 0x20)
												st32(s138 + 0x21, ld32(s48 + 1))
												st32(s138 + 0x24, ld32(s48 + 4))
												st8(s138 + 0x20, cn)
												st64(s148, g, f)
												s = fn_5bfc8(s78, s148, ld64(s3b0 + 0x10), s)
												g = ld64(s78)
												if (g == 2) {
													if (ld8(s78 + 8) == 0) {
														s = fn_87630(s338, 0x40)
														f = ld64(s338 + 8)
														g = ld64(s338)
													} else {
														s = fn_5c138(s78, s148, s)
														if (ld8(s78) == 0) {
															st32(s110 + 3, ld32(s78 + 4))
															st32(s110, ld32(s78 + 1))
															st64(s410 + 0x50, ld64(s78 + 8))
															st64(s410 + 0x48, ld64(s68))
															st64(s410 + 0x40, sc0)
															memcpy(sc0, s60, 0x38)
															st64(s110 + 0xf, ld64(s410 + 0x48))
															st64(s110 + 7, ld64(s410 + 0x50))
															memcpy(sf9, ld64(s410 + 0x40), 0x38)
															if (ld64(s3b0 + 8) != 0) {
																const cv = ld64(ld64(s410 + 0x58) + 0x10)
																st64(sff8 + 0x18, ld64(s3b0 + 0x10))
																st64(sff8 + 0x20, s198)
																st64(sff8 + 0x10, ld64(s390 + 0x28))
																st64(sff8, ld64(s398))
																st64(s1000, ld64(s390))
																st64(sff8 + 8, 1)
																s = fn_49708(s78, cv + 8, s218, ld64(s390 + 0x18), ld64(s1000), ld64(sff8), 1, ld64(sff8 + 0x10), ld64(sff8 + 0x18), s198)
																f = ld64(s78 + 8)
																g = ld64(s78)
																st64(s390 + 0x18, f)
																if (g != 2) {
																	break B68
																}
																const cx = ld64(ld64(s390 + 0x18) + (ld64(s390 + 0x28) != 0 ? 8 : 0))
																const cw = ld64(ld64(s410 + 0x58) + 0x18)
																st64(sff8 + 0x18, ld64(s3b0 + 0x10))
																st64(sff8 + 0x20, s110)
																st64(sff8 + 0x10, ld64(s390 + 0x20))
																st64(sff8, ld64(s390 + 8))
																st64(s1000, ld64(s390 + 0x10))
																st64(sff8 + 8, 1)
																s = fn_49708(s78, cw + 8, s1e8, cx, ld64(s1000), ld64(sff8), 1, ld64(sff8 + 0x10), ld64(sff8 + 0x18), s110)
																f = ld64(s78 + 8)
																g = ld64(s78)
																st64(s390 + 0x10, f)
																if (g != 2) {
																	break B68
																}
															} else {
																const cq = ld64(ld64(s410 + 0x58) + 0x18)
																st64(sff8 + 0x18, ld64(s3b0 + 0x10))
																st64(sff8 + 0x20, s110)
																st64(sff8 + 0x10, ld64(s390 + 0x20))
																st64(sff8, ld64(s390 + 8))
																st64(s1000, ld64(s390 + 0x10))
																st64(sff8 + 8, 0)
																s = fn_49708(s78, cq + 8, s1e8, ld64(s390 + 0x18), ld64(s1000), ld64(sff8), 0, ld64(sff8 + 0x10), ld64(sff8 + 0x18), s110)
																f = ld64(s78 + 8)
																g = ld64(s78)
																st64(s390 + 0x10, f)
																if (g != 2) {
																	break B68
																}
																const cs = ld64(ld64(s390 + 0x10) + (ld64(s390 + 0x20) != 0 ? 0 : 8))
																const cr = ld64(ld64(s410 + 0x58) + 0x10)
																st64(sff8 + 0x18, ld64(s3b0 + 0x10))
																st64(sff8 + 0x20, s198)
																st64(sff8 + 0x10, ld64(s390 + 0x28))
																st64(sff8, ld64(s398))
																st64(s1000, ld64(s390))
																st64(sff8 + 8, 0)
																s = fn_49708(s78, cr + 8, s218, cs, ld64(s1000), ld64(sff8), 0, ld64(sff8 + 0x10), ld64(sff8 + 0x18), s198)
																f = ld64(s78 + 8)
																g = ld64(s78)
																st64(s390 + 0x18, f)
																if (g != 2) {
																	break B68
																}
															}
															const ct = ld64(s390 + 0x18)
															st64(s390, ct + 8, ct + 8)
															if (ld64(s390 + 0x28) == 0) {
																st64(s390 + 8, ld64(s390 + 0x18))
															}
															B92: {
																B88: {
																	B85: {
																		const cu = ld64(ld64(s390 + 8))
																		if (ld64(s390 + 0x20) != 0) {
																			if (cu == ld64(ld64(s390 + 0x10))) {
																				if (ld64(s3b0 + 8) == 0) {
																					break B88
																				}
																				cy = ld64(s390 + 0x10) + 8
																				break B85
																			}
																		} else if (cu == ld64(ld64(s390 + 0x10) + 8)) {
																			cy = ld64(s390 + 0x10)
																			if (ld64(s3b0 + 8) != 0) {
																				break B85
																			}
																			break B88
																		}
																		s = fn_87630(s2c8, 0x33)
																		f = ld64(s2c8 + 8)
																		g = ld64(s2c8)
																		break B68
																	}
																	if (ld64(s3b0) > ld64(cy)) {
																		s = fn_87630(s328, 0x24)
																		f = ld64(s328 + 8)
																		g = ld64(s328)
																		break B68
																	}
																	break B92
																}
																let cz = ld64(s390 + 0x18)
																if (ld64(s390 + 0x28) == 0) {
																	cz = ld64(s390)
																}
																if (ld64(cz) > ld64(s3b0)) {
																	s = fn_87630(s2d8, 0x25)
																	f = ld64(s2d8 + 8)
																	g = ld64(s2d8)
																	break B68
																}
															}
															s = fn_5c328(s2e8, s1d0, ld64(s390 + 0x18) + 0x1d4, da, db, s)
															f = ld64(s2e8 + 8)
															g = ld64(s2e8)
															if (g == 2) {
																s = fn_5c328(s2f8, s148, ld64(s390 + 0x10) + 0x1d4, undef, undef, s)
																f = ld64(s2f8 + 8)
																g = ld64(s2f8)
																if (g == 2) {
																	let dc = ld64(s390 + 0x18)
																	if (ld64(s390 + 0x28) == 0) {
																		dc = ld64(s390)
																	}
																	st64(s398, ld64(dc))
																	st64(s410 + 0x48, ld64(ld64(s390 + 8)))
																	const dd = ld64(s390 + 0x18)
																	st64(s410 + 0x50, ld64(dd + 0x1c8))
																	st64(s3b0, ld64(dd + 0x10))
																	const de: TwoHopSwapAccounts = ld64(s410 + 0x58)
																	const df = ld64(de + 0x10)
																	st64(s3b0 + 8, ld64(df + 0x240))
																	st64(s410 + 0x40, ld64(df + 0x238))
																	st64(s390 + 8, de.token_owner_account_one_a)
																	st64(s390, de.token_owner_account_one_b)
																	const token_vault_one_a: TokenAccount = de.token_vault_one_a
																	const token_vault_one_b: TokenAccount = de.token_vault_one_b
																	st64(sff8 + 0x20, ld64(s390 + 0x28))
																	st64(sff8 + 0x28, ld64(s3b0 + 0x10))
																	st64(sff8 + 0x18, dd)
																	st64(sff8, token_vault_one_a, token_vault_one_b)
																	st64(s1000, ld64(s390))
																	st64(sff8 + 0x10, de)
																	st64(s390 + 0x18, de + 8)
																	s = fn_64930(s308, df, de + 8, ld64(s390 + 8), ld64(s1000), token_vault_one_a, token_vault_one_b, de, dd, ld64(sff8 + 0x20), ld64(sff8 + 0x28))
																	f = ld64(s308 + 8)
																	g = ld64(s308)
																	if (g == 2) {
																		const di = ld64(s390 + 0x10)
																		let dk = di + 8
																		if (ld64(s390 + 0x20) == 0) {
																			dk = ld64(s390 + 0x10)
																		}
																		let dj = ld64(s390 + 0x10)
																		dj = ld64(s390 + 0x20) != 0 ? dj : di + 8
																		st64(s410 + 0x38, ld64(dj))
																		st64(s410 + 0x18, ld64(dk))
																		const dl = ld64(s390 + 0x10)
																		st64(s410 + 0x20, ld64(dl + 0x1c8))
																		st64(s410 + 0x28, ld64(dl + 0x10))
																		const dm: TwoHopSwapAccounts = ld64(s410 + 0x58)
																		const dn = ld64(dm + 0x18)
																		st64(s410 + 0x30, ld64(dn + 0x240))
																		st64(s410 + 0x10, ld64(dn + 0x238))
																		st64(s390 + 8, dm.token_owner_account_two_a)
																		st64(s390, dm.token_owner_account_two_b)
																		const token_vault_two_a: TokenAccount = dm.token_vault_two_a
																		const token_vault_two_b: TokenAccount = dm.token_vault_two_b
																		st64(sff8 + 0x20, ld64(s390 + 0x20))
																		st64(sff8 + 0x28, ld64(s3b0 + 0x10))
																		st64(sff8, token_vault_two_a, token_vault_two_b, dm, dl)
																		st64(s1000, ld64(s390))
																		s = fn_64930(s318, dn, ld64(s390 + 0x18), ld64(s390 + 8), ld64(s1000), token_vault_two_a, token_vault_two_b, dm, dl, ld64(sff8 + 0x20), ld64(sff8 + 0x28))
																		f = ld64(s318 + 8)
																		g = ld64(s318)
																		if (g == 2) {
																			const dr = ld64(ld64(s410 + 0x58) + 0x10)
																			const ds = ld64(ld64(dr))
																			copyr(s78, ds, 0x20)
																			const du = ld64(dr + 0x240)
																			const dt = ld64(dr + 0x238)
																			st64(s48 + 0x18, ld64(s410 + 0x48))
																			st64(s48 + 0x10, ld64(s398))
																			st64(s28 + 0x18, ld64(s410 + 0x50))
																			st64(s28 + 0x10, ld64(s3b0))
																			st64(s60 + 8, ld64(s410 + 0x40))
																			st64(s60 + 0x10, ld64(s3b0 + 8))
																			st64(s48, dt, du)
																			st8(s28 + 0x20, ld64(s390 + 0x28))
																			st64(s28, 0, 0)
																			fn_89078(sc0, s78)
																			copyr(s88, sb8, 0x10)
																			log_data(s88, 1)
																			const dv = ld64(ld64(s410 + 0x58) + 0x18)
																			const dw = ld64(ld64(dv))
																			copyr(s78, dw, 0x20)
																			const dy = ld64(dv + 0x240)
																			const dx = ld64(dv + 0x238)
																			st64(s48 + 0x18, ld64(s410 + 0x18))
																			st64(s48 + 0x10, ld64(s410 + 0x38))
																			st64(s28 + 0x18, ld64(s410 + 0x20))
																			st64(s28 + 0x10, ld64(s410 + 0x28))
																			st64(s60 + 8, ld64(s410 + 0x10))
																			st64(s60 + 0x10, ld64(s410 + 0x30))
																			st64(s48, dx, dy)
																			st8(s28 + 0x20, ld64(s390 + 0x20))
																			st64(s28, 0, 0)
																			fn_89078(sc0, s78)
																			copyr(s88, sb8, 0x10)
																			const ee = log_data(s88, 1)
																			const ea = ld64(s138)
																			const dz = ld64(s148 + 8)
																			rc_dec(dz)
																			rc_dec(ea)
																			const ec = ld64(s1c0)
																			const eb = ld64(s1d0 + 8)
																			rc_dec(eb)
																			rc_dec(ec)
																			if (br != 0) {
																				let ed = bs + 0x18
																				do {
																					if (ld8(ed - 0x14) == 2) {
																						const ef = ld64(ed)
																						st64(ef, ld64(ef) + 1)
																					}
																					ed = ed + 0x78
																					br = br - 1
																				} while (br != 0)
																			}
																			const eh = fn_c710(ld64(s200 + 8), ld64(s200 + 0x10), ee)
																			if (ao == 0) {
																				s = fn_c710(ld64(s248 + 8), ld64(s248 + 0x10), eh)
																				r = ld64(s390 + 0x30)
																				st64(r + 8, undef)
																				st64(r, 2)
																				return s
																			}
																			let eg = ap + 0x18
																			while (true) {
																				if (ld8(eg - 0x14) == 2) {
																					const ei = ld64(eg)
																					st64(ei, ld64(ei) + 1)
																				}
																				eg = eg + 0x78
																				ao = ao - 1
																				if (ao == 0) {
																					s = fn_c710(ld64(s248 + 8), ld64(s248 + 0x10), eh)
																					r = ld64(s390 + 0x30)
																					st64(r + 8, undef)
																					st64(r, 2)
																					return s
																				}
																			}
																		}
																	}
																}
															}
														} else {
															f = ld64(s68)
															g = ld64(s78 + 8)
														}
													}
												} else {
													f = ld64(s78 + 8)
												}
											}
											const cp = ld64(s138)
											const co = ld64(s148 + 8)
											rc_dec(co)
											rc_dec(cp)
										}
									} else {
										f = ld64(s68)
										g = ld64(s78 + 8)
									}
								}
							} else {
								f = ld64(s78 + 8)
							}
							const by = ld64(s1c0)
							const bx = ld64(s1d0 + 8)
							rc_dec(bx)
							rc_dec(by)
						}
						if (br != 0) {
							let bz = bs + 0x18
							do {
								if (ld8(bz - 0x14) == 2) {
									const cb = ld64(bz)
									st64(cb, ld64(cb) + 1)
								}
								bz = bz + 0x78
								br = br - 1
							} while (br != 0)
						}
					}
					let ca = ld64(s200 + 0x10)
					if (ca != 0) {
						let cc = ld64(s200 + 8) + 0x10
						do {
							const ce = ld64(cc)
							const cd = ld64(cc - 8)
							rc_dec(cd)
							s = ld64(ce) - 1
							st64(ce, s)
							if (s == 0) {
								s = ld64(ce + 8) - 1
								st64(ce + 8, s)
							}
							cc = cc + 0x30
							ca = ca - 1
						} while (ca != 0)
					}
					if (ao != 0) {
						let cf = ap + 0x18
						do {
							if (ld8(cf - 0x14) == 2) {
								const ch = ld64(cf)
								st64(ch, ld64(ch) + 1)
							}
							cf = cf + 0x78
							ao = ao - 1
						} while (ao != 0)
					}
				}
				let cg = ld64(s248 + 0x10)
				r = ld64(s390 + 0x30)
				if (cg == 0) {
					st64(r + 8, f)
					st64(r, g)
					return s
				}
				let ci = ld64(s248 + 8) + 0x10
				while (true) {
					const ck = ld64(ci)
					const cj = ld64(ci - 8)
					rc_dec(cj)
					s = ld64(ck) - 1
					st64(ck, s)
					if (s == 0) {
						s = ld64(ck + 8) - 1
						st64(ck + 8, s)
					}
					ci = ci + 0x30
					cg = cg - 1
					if (cg == 0) {
						st64(r + 8, f)
						st64(r, g)
						return s
					}
				}
			}
			abort()
		}
		alloc_handle_alloc_error(8, 0x90)
	}
	s = fn_87630(s2b8, 0x29)
	g = ld64(s2b8)
	st64(r + 8, ld64(s2b8 + 8))
	st64(r, g)
	return s
}

// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: whirlpool_one, token_owner_account_one_a, token_vault_one_a, token_owner_account_one_b, token_vault_one_b, token_vault_two_b, token_owner_account_two_b, token_vault_two_a, token_owner_account_two_a, whirlpool_two
function fn_d12a0(a: u64, b: u64, c: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38, s48 = fp - 0x48, s58 = fp - 0x58, s68 = fp - 0x68, s78 = fp - 0x78, s88 = fp - 0x88, s98 = fp - 0x98, sa8 = fp - 0xa8, sb8 = fp - 0xb8, sc8 = fp - 0xc8, sd8 = fp - 0xd8, se8 = fp - 0xe8, sf8 = fp - 0xf8, s108 = fp - 0x108, s118 = fp - 0x118, s128 = fp - 0x128, s138 = fp - 0x138, s148 = fp - 0x148, s158 = fp - 0x158
	let aj, ak: u64
	fn_6aa0(s28, ld64(b + 0x10), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const f = ld64(s28)
	if (f != 2) {
		ak = Error_with_account_name(s38, f, ld64(s28 + 8), "whirlpool_one", 0xd)
		aj = ld64(s38)
		st64(a + 8, ld64(s38 + 8))
		st64(a, aj)
		return ak
	}
	fn_6aa0(s48, ld64(b + 0x18), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, c)
	const g = ld64(s48)
	if (g == 2) {
		const h = ld64(ld64(b + 0x20))
		if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
			const i = common_is_closed(h)
			if (i == 0) {
				fn_143448(s18, h, i)
				const k = ld64(s18 + 0x10)
				const j = ld64(s18)
				if (j != 0x800000000000001a /* Ok */) {
					const l = ld64(s18 + 8)
					st64(s18, j, l, k)
					fn_13b430(s68, s18)
					const m = ld64(s68)
					if (m != 2) {
						ak = Error_with_account_name(s78, m, ld64(s68 + 8), "token_owner_account_one_a", 0x19)
						aj = ld64(s78)
						st64(a + 8, ld64(s78 + 8))
						st64(a, aj)
						return ak
					}
				} else {
					st64(k, ld64(k) + 1)
				}
			}
		}
		const r = ld64(ld64(b + 0x28))
		if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
			const s = common_is_closed(r)
			if (s == 0) {
				fn_143448(s18, r, s)
				const u = ld64(s18 + 0x10)
				const t = ld64(s18)
				if (t != 0x800000000000001a /* Ok */) {
					const ad = ld64(s18 + 8)
					st64(s18, t, ad, u)
					fn_13b430(s88, s18)
					const ae = ld64(s88)
					if (ae != 2) {
						ak = Error_with_account_name(s98, ae, ld64(s88 + 8), "token_vault_one_a", 0x11)
						aj = ld64(s98)
						st64(a + 8, ld64(s98 + 8))
						st64(a, aj)
						return ak
					}
				} else {
					st64(u, ld64(u) + 1)
				}
			}
		}
		const v = ld64(ld64(b + 0x30))
		if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
			const w = common_is_closed(v)
			if (w == 0) {
				fn_143448(s18, v, w)
				const y = ld64(s18 + 0x10)
				const x = ld64(s18)
				if (x != 0x800000000000001a /* Ok */) {
					const af = ld64(s18 + 8)
					st64(s18, x, af, y)
					fn_13b430(sa8, s18)
					const ag = ld64(sa8)
					if (ag != 2) {
						ak = Error_with_account_name(sb8, ag, ld64(sa8 + 8), "token_owner_account_one_b", 0x19)
						aj = ld64(sb8)
						st64(a + 8, ld64(sb8 + 8))
						st64(a, aj)
						return ak
					}
				} else {
					st64(y, ld64(y) + 1)
				}
			}
		}
		const z = ld64(ld64(b + 0x38))
		if ((memcmp(0x1001520e0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0) {
			const aa = common_is_closed(z)
			if (aa == 0) {
				fn_143448(s18, z, aa)
				const ac = ld64(s18 + 0x10)
				const ab = ld64(s18)
				if (ab != 0x800000000000001a /* Ok */) {
					const ah = ld64(s18 + 8)
					st64(s18, ab, ah, ac)
					fn_13b430(sc8, s18)
					const ai = ld64(sc8)
					if (ai != 2) {
						ak = Error_with_account_name(sd8, ai, ld64(sc8 + 8), "token_vault_one_b", 0x11)
						aj = ld64(sd8)
						st64(a + 8, ld64(sd8 + 8))
						st64(a, aj)
						return ak
					}
				} else {
					st64(ac, ld64(ac) + 1)
				}
			}
		}
		fn_6960(se8, ld64(ld64(b + 0x40)), 0x1001520e0 /* &TOKEN_PROGRAM */, c)
		const n = ld64(se8)
		if (n == 2) {
			fn_6960(s108, ld64(ld64(b + 0x48)), 0x1001520e0 /* &TOKEN_PROGRAM */, c)
			const o = ld64(s108)
			if (o == 2) {
				fn_6960(s128, ld64(ld64(b + 0x50)), 0x1001520e0 /* &TOKEN_PROGRAM */, c)
				const p = ld64(s128)
				if (p == 2) {
					ak = fn_6960(s148, ld64(ld64(b + 0x58)), 0x1001520e0 /* &TOKEN_PROGRAM */, c)
					const q = ld64(s148)
					if (q == 2) {
						st64(a + 8, undef)
						st64(a, 2)
						return ak
					}
					ak = Error_with_account_name(s158, q, ld64(s148 + 8), "token_vault_two_b", 0x11)
					aj = ld64(s158)
					st64(a + 8, ld64(s158 + 8))
					st64(a, aj)
					return ak
				}
				ak = Error_with_account_name(s138, p, ld64(s128 + 8), "token_owner_account_two_b", 0x19)
				aj = ld64(s138)
				st64(a + 8, ld64(s138 + 8))
				st64(a, aj)
				return ak
			}
			ak = Error_with_account_name(s118, o, ld64(s108 + 8), "token_vault_two_a", 0x11)
			aj = ld64(s118)
			st64(a + 8, ld64(s118 + 8))
			st64(a, aj)
			return ak
		}
		ak = Error_with_account_name(sf8, n, ld64(se8 + 8), "token_owner_account_two_a", 0x19)
		aj = ld64(sf8)
		st64(a + 8, ld64(sf8 + 8))
		st64(a, aj)
		return ak
	}
	ak = Error_with_account_name(s58, g, ld64(s48 + 8), "whirlpool_two", 0xd)
	aj = ld64(s58)
	st64(a + 8, ld64(s58 + 8))
	st64(a, aj)
	return ak
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it)
// types [heur]: c: TokenAccount (6 of 12 calls pass one, the others an untyped value: accounts_collect_fees, accounts_two_hop_swap)
function fn_20f8(a: u64, b: u64, c: TokenAccount, d: u64, e: u64) {
	const sb8 = fp - 0xb8
	try_accounts_11f50(sb8, b, c, d, e)
	if (ld32(sb8 + 0x90) == 2) {
		const h = ld64(sb8)
		st64(a + 8, ld64(sb8 + 8))
		st64(a, h)
	} else {
		const f = ld64(0x300000000 /* heap bump-allocator cursor */)
		const g = f != 0 ? sat_sub(f, 0xb8) & -8 : 0x300007f48
		if (0x300000007 >= g) {
			alloc_handle_alloc_error(8, 0xb8)
		}
		st64(0x300000000 /* heap bump-allocator cursor */, g)
		memcpy(g, sb8, 0xb8)
		st64(a + 8, g)
		st64(a, 2)
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it), c (points to it)
function fn_60de8(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64) {
	const s20 = fp - 0x20, s50 = fp - 0x50, s68 = fp - 0x68, sb0 = fp - 0xb0, sc8 = fp - 0xc8, s118 = fp - 0x118, s120 = fp - 0x120
	let g, n, ak, al, ao, aq, ax, bi, bl, bm, bn, cb, cp, di: u64
	B4: {
		B2: {
			copyr(s68, b, 0x18)
			const f = ld64(c)
			st64(s120, a)
			if (f != 0x8000000000000000) {
				let o = ld64(s68 + 0x10)
				const q = ld64(c + 8)
				const p = ld64(c + 0x10)
				if (p > ld64(s68) - o) {
					fn_e968(s68, o, p, d, e, r0)
					o = ld64(s68 + 0x10)
				}
				const r = ld64(s68 + 8)
				st64(s118 + 0x48, r)
				memcpy(r + o * 0x30, q, p * 0x30)
				d = undef
				e = undef
				g = o + p
				st64(s68 + 0x10, g)
				if (0x15 > g) {
					break B2
				}
			} else {
				g = ld64(s68 + 0x10)
				st64(s118 + 0x48, ld64(s68 + 8))
				if (0x15 > g) {
					break B2
				}
			}
			const s = ld64(0x300000000 /* heap bump-allocator cursor */)
			const t = s != 0 ? s : 0x300008000
			const u = t - (g >> 1) * 0x30
			const v = u > t ? 0 : u
			if ((v & -8) > 0x300000007) {
				st64(0x300000000 /* heap bump-allocator cursor */, v & -8)
				st64(sb0 + 0x30, v & -8)
				let w = (v & -8) - 0x100
				if (w > 0x300000007) {
					st64(0x300000000 /* heap bump-allocator cursor */, w)
					st64(s118 + 0x18, 0x10)
					let y = 0
					const x = ld64(s118 + 0x48)
					st64(s118 + 0x20, x - 0x30)
					st64(s118, x - 0x18, x + 0x18, x + 0x60)
					let z = 0
					st64(s118 + 0x38, g)
					while (true) {
						B25: {
							st64(sb0 + 0x28, z)
							st64(s118 + 0x40, w)
							const aa = y
							st64(sb0 + 0x20, ld64(s118 + 0x48) + y * 0x30)
							st64(sb0 + 0x38, y)
							const ab = g - y
							al = ab
							st64(sb0 + 0x40, ab)
							if (ab >= 2) {
								const ac = ld64(sb0 + 0x20)
								const ae = ld64(ac)
								let ad = ld64(ac + 0x30)
								copyr(s20, ad, 0x20)
								copyr(s50, ae, 0x20)
								const af = memcmp(s20, s50, 0x20)
								z = undef
								if (0 > (af as i32)) {
									st64(sb0 + 0x18, aa * 0x30)
									let cq = 2
									if (ld64(sb0 + 0x40) != 2) {
										let cl = ld64(s118 + 0x10) + ld64(sb0 + 0x18)
										let co = 2
										do {
											const cm = ld64(cl)
											copyr(s20, cm, 0x20)
											copyr(s50, ad, 0x20)
											const cn = memcmp(s20, s50, 0x20)
											cq = co
											if ((cn as i32) > -1) {
												break
											}
											cl = cl + 0x30
											co = co + 1
											ad = cm
											cp = ld64(sb0 + 0x40)
											cq = cp
										} while (cp > co)
									}
									const cr = cq
									const cs = ld64(sb0 + 0x38)
									g = ld64(s118 + 0x38)
									const ct = cq
									z = ld64(sb0 + 0x18)
									if (cq > cq + cs) {
										fn_14c690(cs, cr + cs, 0x100159518, cq, z)
									}
									st64(s118 + 0x28, cr + cs)
									if (cr + cs > g) {
										fn_14c5c0(ld64(s118 + 0x28), g, 0x100159518, cq, z)
									}
									al = 1
									if (2 > ct) {
										break B25
									}
									let db = ct >> 1
									let cu = ld64(s118 + 8) + z
									z = ld64(s118) + (ld64(sb0 + 0x38) + ct) * 0x30
									while (true) {
										const cv = ld64(cu - 0x18)
										st64(cu - 0x18, ld64(z - 0x18))
										st64(z - 0x18, cv)
										const cw = ld64(cu - 0x10)
										st64(cu - 0x10, ld64(z - 0x10))
										st64(z - 0x10, cw)
										const cx = ld64(cu - 8)
										st64(cu - 8, ld64(z - 8))
										st64(z - 8, cx)
										const cy = ld64(cu)
										st64(cu, ld64(z))
										st64(z, cy)
										const cz = ld64(cu + 8)
										st64(cu + 8, ld64(z + 8))
										st64(z + 8, cz)
										const da = ld64(cu + 0x10)
										st64(cu + 0x10, ld64(z + 0x10))
										st64(z + 0x10, da)
										cu = cu + 0x30
										z = z - 0x30
										db = db - 1
										al = ct
										if (db == 0) {
											break B25
										}
									}
								}
								al = 2
								if (ld64(sb0 + 0x40) != 2) {
									let ag = ld64(s118 + 0x10) + aa * 0x30
									let aj = 2
									do {
										const ah = ld64(ag)
										copyr(s20, ah, 0x20)
										copyr(s50, ad, 0x20)
										const ai = memcmp(s20, s50, 0x20)
										z = undef
										al = aj
										if (0 > (ai as i32)) {
											break
										}
										ag = ag + 0x30
										aj = aj + 1
										ad = ah
										ak = ld64(sb0 + 0x40)
										al = ak
									} while (ak > aj)
								}
							}
							st64(s118 + 0x28, al + ld64(sb0 + 0x38))
							g = ld64(s118 + 0x38)
						}
						const am = ld64(s118 + 0x28)
						let an = ld64(sb0 + 0x38)
						if (an > am) {
							fn_1494c8(("assertion failed: end >= start && end <= len"), 0x2c, 0x1001595c0, an, z)
						}
						if (am > g) {
							fn_1494c8(("assertion failed: end >= start && end <= len"), 0x2c, 0x1001595c0, an, z)
						}
						B36: {
							B34: {
								w = ld64(s118 + 0x40)
								ao = ld64(sb0 + 0x28)
								if (g > am && 0xa > al) {
									const ap = min(an + 0xa, g)
									if (0xfffffffffffffff6 > an) {
										aq = ap - an
										fn_d648(ld64(sb0 + 0x20), aq, am != an ? al : 1, an, ao)
										an = ld64(sb0 + 0x38)
										st64(s118 + 0x28, ap)
										ao = ld64(sb0 + 0x28)
										if (ao != ld64(s118 + 0x18)) {
											break B36
										}
										break B34
									}
									fn_14c690(an, ap, 0x1001595d8, an, ao)
								}
								aq = am - an
								if (ao != ld64(s118 + 0x18)) {
									break B36
								}
							}
							const ar = ld64(0x300000000 /* heap bump-allocator cursor */)
							const at = ar != 0 ? ar : 0x300008000
							const au = at - (ao << 5)
							const av = au > at ? 0 : au
							if (0x300000008 > (av & -8)) {
								fn_1490e8(0x1001595a8, at, au > at, 0x300000000 /* heap bump-allocator cursor */, ao)
							}
							st64(s118 + 0x18, ao << 1)
							st64(0x300000000 /* heap bump-allocator cursor */, av & -8)
							memcpy(av & -8, w, ao << 4)
							ao = ld64(sb0 + 0x28)
							w = av & -8
							an = ld64(sb0 + 0x38)
						}
						const aw = w + (ao << 4)
						st64(aw + 8, an)
						st64(aw, aq)
						z = ao + 1
						if (z >= 2) {
							let bd = z
							st64(s118 + 0x40, w)
							do {
								B47: {
									B46: {
										bm = bd
										bi = bd - 1
										const bj = w + (bi << 4)
										bl = ld64(bj + 8)
										const bk = ld64(bj)
										if (bk + bl != g) {
											bl = ld64((bm << 4) + w - 0x20)
											if (bl > bk) {
												z = 2
												if (bm == 2) {
													break
												}
												an = bl + bk
												bn = bm - 3
												z = w + (bn << 4)
												const ci = ld64(z)
												if (ci > an) {
													z = 3
													if (3 >= bm) {
														break
													}
													an = ci + bl
													bl = ld64((bm << 4) + w - 0x40)
													z = bm
													if (bl > an) {
														break
													}
												}
												if (bk > ci) {
													break B47
												}
												break B46
											}
										}
										if (bm != 2) {
											bn = bm - 3
											bl = w + (bn << 4)
											if (bk > ld64(bl)) {
												break B47
											}
										}
									}
									bn = bm - 2
								}
								if (bn >= bm) {
									st64(s50, 0x100159350, 1, 8, 0, 0)
									// fmt "Index out of bounds"
									fn_149478(s50, 0x100159530, bl, an, z)
								}
								const bo = bn
								if (bn + 1 >= bm) {
									st64(s50, 0x100159350, 1, 8, 0, 0)
									// fmt "Index out of bounds"
									fn_149478(s50, 0x100159548, bl, bo + 1, z)
								}
								const bp = w + (bn << 4)
								const bt = ld64(bp + 8)
								const bq = w + (bo + 1 << 4)
								const bs = ld64(bq)
								const br = ld64(bq + 8)
								if (bt > br + bs) {
									fn_14c690(bt, br + bs, 0x100159560, bs, z)
								}
								if (br + bs > g) {
									fn_14c5c0(br + bs, g, 0x100159560, bs, z)
								}
								st64(sc8, bs, bq)
								st64(sb0, bp, bn, bm, bi)
								const bu = ld64(bp)
								st64(sb0 + 0x28, (br + bs) * 0x30)
								const bw = br + bs - bt
								st64(sc8 + 0x10, bt)
								const bv = ld64(s118 + 0x48) + bt * 0x30
								let ay = bv + bu * 0x30
								st64(sb0 + 0x38, bv)
								st64(sb0 + 0x20, bu)
								if (bw - bu >= bu) {
									memcpy(ld64(sb0 + 0x30), bv, bu * 0x30)
									const ck = ld64(sb0 + 0x38)
									let ba = ay
									const cj = ld64(sb0 + 0x30)
									st64(sb0 + 0x40, cj + bu * 0x30)
									ay = ck
									ax = cj
									if ((bu as i64) >= 1) {
										ay = ck
										ax = ld64(sb0 + 0x30)
										if ((bw as i64) > (ld64(sb0 + 0x20) as i64)) {
											st64(sb0 + 0x28, ld64(s118 + 0x48) + ld64(sb0 + 0x28))
											ax = ld64(sb0 + 0x30)
											ay = ck
											do {
												const bf = ld64(ax)
												st64(sb0 + 0x38, ba)
												const be = ld64(ba)
												copyr(s20, be, 0x20)
												copyr(s50, bf, 0x20)
												const bg = memcmp(s20, s50, 0x20)
												let bh = ax
												if (-1 >= (bg as i32)) {
													bh = ld64(sb0 + 0x38)
												}
												memcpy(ay, bh, 0x30)
												ax = ax + ((bg as i32) > -1) * 0x30
												ay = ay + 0x30
												const az = ld64(sb0 + 0x38)
												if (ax >= ld64(sb0 + 0x40)) {
													break
												}
												ba = az + ((bg & 0x80000000) >> 0x1f) * 0x30
											} while (ld64(sb0 + 0x28) > ba)
										}
									}
								} else {
									st64(s118 + 0x30, bw - bu)
									const by = (bw - bu) * 0x30
									const bx = ld64(sb0 + 0x30)
									memcpy(bx, ay, by)
									const bz = ay
									st64(sb0 + 0x40, bx + by)
									ax = bx
									if ((bu as i64) >= 1) {
										ay = bz
										ax = ld64(sb0 + 0x30)
										if ((ld64(s118 + 0x30) as i64) >= 1) {
											let ca = ld64(s118 + 0x20) + ld64(sb0 + 0x28)
											ay = bz
											do {
												const ce = ld64(ay - 0x30)
												const cc = ld64(sb0 + 0x40)
												const cd = ld64(cc - 0x30)
												copyr(s20, cd, 0x20)
												copyr(s50, ce, 0x20)
												const cf = memcmp(s20, s50, 0x20)
												const cg = sar(cf << 0x20, 0x3f)
												ay = ay + cg * 0x30
												const ch = cc + ~cg * 0x30
												st64(sb0 + 0x40, ch)
												memcpy(ca, (cf as i32) > -1 ? ch : ay, 0x30)
												ax = ld64(sb0 + 0x30)
												if (ld64(sb0 + 0x38) >= ay) {
													break
												}
												ca = ca - 0x30
												cb = ld64(sb0 + 0x30)
												ax = cb
											} while (ld64(sb0 + 0x40) > cb)
										}
									}
								}
								memcpy(ay, ax, ld64(sb0 + 0x40) - ax)
								const bb = ld64(sc8 + 8)
								st64(bb + 8, ld64(sc8 + 0x10))
								st64(bb, ld64(sc8) + ld64(sb0 + 0x20))
								const bc = ld64(sb0)
								memmove(bc, bc + 0x10, ld64(sb0 + 0x10) + ~ld64(sb0 + 8) << 4)
								an = undef
								z = 1
								g = ld64(s118 + 0x38)
								w = ld64(s118 + 0x40)
								bd = ld64(sb0 + 0x18)
							} while (bd > 1)
						}
						y = ld64(s118 + 0x28)
						if (y >= g) {
							break B4
						}
					}
				}
				fn_1490e8(0x100159590, 0x300000000 /* heap bump-allocator cursor */, u > t, v & -8, e)
			}
			fn_1490e8(0x100159578, u, u > t, v & -8, e)
		}
		if (1 >= g) {
			n = ld64(s120)
			st64(n + 0x10, ld64(s68 + 0x10))
			st64(n + 8, ld64(s68 + 8))
			st64(n, ld64(s68))
			return
		}
		fn_d648(ld64(s118 + 0x48), g, 1, d, e)
	}
	const h = ld64(s68 + 0x10)
	if (h >= 2) {
		let m = 1
		const i = ld64(s68 + 8)
		st64(sb0 + 0x40, i)
		let j = i + 0x60
		while (true) {
			const l = ld64(j - 0x60)
			const k = ld64(j - 0x30)
			copyr(s20, k, 0x20)
			copyr(s50, l, 0x20)
			if ((memcmp(s20, s50, 0x20) as u32) == 0) {
				const dd = ld64(j - 0x20)
				const dc = ld64(j - 0x28)
				rc_dec(dc)
				rc_dec(dd)
				let de = m + 1
				if (de >= h) {
					st64(s68 + 0x10, m)
					n = ld64(s120)
					st64(n + 0x10, ld64(s68 + 0x10))
					st64(n + 8, ld64(s68 + 8))
					st64(n, ld64(s68))
					return
				}
				st64(sb0 + 0x38, h)
				while (true) {
					const df = ld64(sb0 + 0x40) + m * 0x30
					const dg = ld64(j)
					const dh = ld64(df - 0x30)
					copyr(s20, dg, 0x20)
					copyr(s50, dh, 0x20)
					if ((memcmp(s20, s50, 0x20) as u32) == 0) {
						const dk = ld64(j + 0x10)
						const dj = ld64(j + 8)
						rc_dec(dj)
						di = ld64(sb0 + 0x38)
						rc_dec(dk)
					} else {
						memcpy(df, j, 0x30)
						m = m + 1
						di = ld64(sb0 + 0x38)
					}
					j = j + 0x30
					de = de + 1
					if (de >= di) {
						st64(s68 + 0x10, m)
						n = ld64(s120)
						st64(n + 0x10, ld64(s68 + 0x10))
						st64(n + 8, ld64(s68 + 8))
						st64(n, ld64(s68))
						return
					}
				}
			}
			j = j + 0x30
			m = m + 1
			if (h == m) {
				n = ld64(s120)
				st64(n + 0x10, ld64(s68 + 0x10))
				st64(n + 8, ld64(s68 + 8))
				st64(n, ld64(s68))
				return
			}
		}
	}
	n = ld64(s120)
	st64(n + 0x10, ld64(s68 + 0x10))
	st64(n + 8, ld64(s68 + 8))
	st64(n, ld64(s68))
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), a (points to it)
function fn_62750(a: u64, b: u64, c: u64, d: u64): u64 {
	const s20 = fp - 0x20, s24 = fp - 0x24, s78 = fp - 0x78, s98 = fp - 0x98, sf0 = fp - 0xf0, s10d = fp - 0x10d, s110 = fp - 0x110, s180 = fp - 0x180, s188 = fp - 0x188, s1a8 = fp - 0x1a8, s1c0 = fp - 0x1c0, s1d0 = fp - 0x1d0, s1e0 = fp - 0x1e0, s1f8 = fp - 0x1f8, s208 = fp - 0x208, s228 = fp - 0x228, s230 = fp - 0x230, s238 = fp - 0x238, s240 = fp - 0x240, s248 = fp - 0x248, s250 = fp - 0x250, s258 = fp - 0x258, s260 = fp - 0x260, s268 = fp - 0x268, s270 = fp - 0x270, s278 = fp - 0x278
	let v, ad, af, ah, am, au, av, bl, bm, bo, bp, du: u64
	st64(s250, d)
	st64(s238, c)
	st64(s248, a)
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	let g = 0x48 > f
	let h = g != 0 ? 0 : f - 0x48
	let i = 0x300007fb8
	if (f != 0) {
		h = h & -8
		i = h
	}
	if (0x300000008 > i) {
		raw_vec_handle_error(8, 0x48, h, i, g)
	}
	B93: {
		st64(0x300000000 /* heap bump-allocator cursor */, i)
		st64(s228 + 0x10, i)
		st64(s1f8, 3, i, 0)
		st64(s240, ld64(b + 8))
		const j = ld64(b + 0x10)
		st64(s230, j)
		if (j != 0) {
			let r = ld64(s230) * 0x30
			st64(s228 + 0x18, 0)
			st64(s228, ld64(ld64(s238)))
			let q = ld64(s240)
			do {
				B6: {
					const s = memcmp(ld64(q + 0x18), 0x100152180, 0x20)
					i = undef
					g = undef
					if ((s as u32) == 0) {
						const t = fn_143248(q, undef, undef, i, g)
						h = undef
						i = undef
						g = undef
						if (t != 0) {
							break B6
						}
					}
					st64(s228 + 8, r)
					const u = ld64(ld64(s228))
					copyr(s98, u, 0x20)
					v = fn_5d748(s110, q, s98, i, g)
					i = undef
					g = undef
					const n = ld64(s10d + 0xd)
					const o = ld64(s10d + 5)
					const p = ld64(s110)
					if (p == 0) {
						const ac = ld64(s248)
						st64(ac + 0x10, n)
						st64(ac + 8, o)
						st64(ac, 0x8000000000000000)
						du = ld64(s228 + 0x18)
						break B93
					}
					let k = ld64(s228 + 0x18)
					let l = ld64(s228 + 0x10)
					if (k == ld64(s1f8)) {
						fn_ed90(s1f8, l, v)
						i = undef
						g = undef
						k = ld64(s228 + 0x18)
						l = ld64(s1f8 + 8)
					}
					st64(s228 + 0x10, l)
					const m = l + k * 0x18
					st64(m + 0x10, n)
					st64(m + 8, o)
					st64(m, p)
					h = k + 1
					st64(s228 + 0x18, h)
					st64(s1f8 + 0x10, h)
					r = ld64(s228 + 8)
				}
				q = q + 0x30
				r = r - 0x30
			} while (r != 0)
		}
		const w = ld64(s238)
		const x = ld16(w + 0x284)
		if (x == 0) {
			st64(s98, 0x100159c98, 1, 8, 0, 0)
			// fmt "Divisor must be positive."
			fn_149478(s98, 0x100159ca8, h, i, g)
		}
		const y = ld32(w + 0x280)
		const z = fn_151b50(y as i32, (x * 0x58) as i32)
		const aa = 1 > (y as i32)
		const ab = (((y as i32) - z * (x * 0x58)) as u32) != 0
		if (ld64(s250) != 0) {
			st64(s110, 0xffffffff00000000)
			ad = 0
			ah = 0xffffffff
			am = 0xfffffffe
			st32(s10d + 5, -2)
		} else if ((((z - (aa & ab) + 1) * (x * 0x58)) as i32) > (((y as i32) + x) as i32)) {
			st64(s110, 0x100000000)
			ad = 0
			ah = 1
			am = 2
			st32(s10d + 5, 2)
		} else {
			st64(s110, 0x200000001)
			ad = 1
			ah = 2
			am = 3
			st32(s10d + 5, 3)
		}
		B48: {
			B30: {
				st64(s228 + 0x18, z - (aa & ab))
				const ae = (ad + (z - (aa & ab))) * (x * 0x58)
				af = ae as i32
				if (0xfff27617 > ((ae - 0x6c4f5) as u32)) {
					if (-0x6c4f4 >= (af as i64)) {
						av = 4
						au = 0
						if (((0x6c4f4 % (x * 0x58) - x * 0x58 - 0x6c4f4) as u32) == (af as u32)) {
							break B30
						}
					}
				} else {
					const ag = fn_151bf8(af, x * 0x58)
					av = 4
					au = 0
					if (ag == 0) {
						break B30
					}
				}
				const ai = (ah + ld64(s228 + 0x18)) * (x * 0x58)
				af = ai as i32
				if (0xfff27617 > ((ai - 0x6c4f5) as u32)) {
					if (-0x6c4f4 >= (af as i64)) {
						av = 8
						au = 0
						const ak = 0x6c4f4 % (x * 0x58) - x * 0x58 - 0x6c4f4
						const al = af << 0x20
						af = ak
						if ((ak as u32) == (al >> 0x20)) {
							break B30
						}
					}
				} else {
					const aj = fn_151bf8(af, x * 0x58)
					av = 8
					au = 0
					if (aj == 0) {
						break B30
					}
				}
				const an = (am + ld64(s228 + 0x18)) * (x * 0x58)
				af = an as i32
				if (0xfff27617 > ((an - 0x6c4f5) as u32)) {
					if (-0x6c4f4 >= (af as i64)) {
						av = 0xc
						au = 1
						const bf = 0x6c4f4 % (x * 0x58) - x * 0x58 - 0x6c4f4
						const bg = af << 0x20
						af = bf
						if ((bf as u32) == (bg >> 0x20)) {
							break B30
						}
					}
				} else {
					const ao = fn_151bf8(af, x * 0x58)
					av = 0xc
					au = 1
					if (ao == 0) {
						break B30
					}
				}
				bm = 4
				bl = 0
				break B48
			}
			const ap = ld64(0x300000000 /* heap bump-allocator cursor */)
			let aq = 0x10 > ap
			let ar = aq != 0 ? 0 : ap - 0x10
			let at = 0x300007ff0
			if (ap != 0) {
				ar = ar & -4
				at = ar
			}
			if (0x300000008 > at) {
				raw_vec_handle_error(4, 0x10, 0x300000008, ar, at)
			}
			B44: {
				st64(0x300000000 /* heap bump-allocator cursor */, at)
				st32(at, af)
				st64(s228, at)
				st64(s98 + 8, at)
				st64(s228 + 8, 1)
				st64(s98 + 0x10, 1)
				st64(s98, 4)
				let ba = ld64(s228 + 0x18)
				if (au == 0) {
					st64(s228 + 8, 1)
					st64(s228 + 0x10, 0x6c4f4 % (x * 0x58) - x * 0x58)
					L35: while (true) {
						let az = av
						while (true) {
							B38: {
								const bb = (ld32(s110 + az) + ba) * (x * 0x58)
								let aw = bb as i32
								if (0xfff27617 > ((bb - 0x6c4f5) as u32)) {
									if ((aw as i64) > -0x6c4f4) {
										break B38
									}
									const ax = ld64(s228 + 0x10)
									const ay = aw << 0x20
									aw = ax - 0x6c4f4
									if (((ax - 0x6c4f4) as u32) != (ay >> 0x20)) {
										break B38
									}
								} else {
									aq = fn_151bf8(aw, x * 0x58)
									at = undef
									ba = ld64(s228 + 0x18)
									if (aq != 0) {
										break B38
									}
								}
								let bc = ld64(s228 + 8)
								let bd = ld64(s228)
								if (bc == ld64(s98)) {
									aq = fn_e7f8(s98, bc, 1, ba, at, aq)
									bc = ld64(s228 + 8)
									ba = ld64(s228 + 0x18)
									bd = ld64(s98 + 8)
								}
								av = az + 4
								at = bc << 2
								st64(s228, bd)
								st32(bd + at, aw)
								const be = bc + 1
								st64(s228 + 8, be)
								st64(s98 + 0x10, be)
								if (az != 8) {
									continue L35
								}
								break B44
							}
							az = az + 4
							if (az == 0xc) {
								break B44
							}
						}
					}
				}
			}
			bm = ld64(s98 + 8)
			bl = ld64(s228 + 8)
		}
		const bh = ld64(0x300000000 /* heap bump-allocator cursor */)
		let bi = bh - 0x168
		let bj = bi > bh
		let bk = bh != 0 ? (bj != 0 ? 0 : bi) & -8 : 0x300007e98
		if (0x300000007 >= bk) {
			raw_vec_handle_error(8, 0x168, bi, bj, bl)
		}
		B68: {
			st64(0x300000000 /* heap bump-allocator cursor */, bk)
			st64(s1e0 + 8, bk)
			bo = 0
			bp = ld64(s1f8 + 0x10)
			st64(s1d0, 0, 0)
			st64(s1e0, 3)
			if (bl != 0) {
				bl = bl << 2
				st64(s268, bm + bl)
				let bn = 3
				st64(s258, 0)
				st64(s278, s10d)
				st64(s270, ld64(s1f8 + 8))
				st64(s230, ld64(s230) * 0x30)
				st64(s260, ld64(ld64(s238)))
				L52: while (true) {
					st64(s250, bn)
					st64(s238, bk)
					st64(s228, bm + 4, bm, bo, bp)
					if (bp != 0) {
						const bq = ld64(s228 + 0x18)
						let br = ld64(s270)
						const bw = br + bq * 0x18
						const bs = ld32(ld64(s228 + 8))
						let bv = bq * 0x18 - 0x18
						do {
							const bt = ld64(ld64(br + 8) + 0x20)
							const bu = callx(bt, ld64(br), bt, bi, bj, bl)
							bi = undef
							bj = undef
							bl = undef
							if ((bu as u32) == bs) {
								copyr(s1c0, br, 0x18)
								const ci = memmove(br, br + 0x18, bv)
								const cg = ld64(s278)
								st64(cg + 0x10, ld64(s1c0 + 0x10))
								st64(cg + 8, ld64(s1c0 + 8))
								st64(cg, ld64(s1c0))
								let ch = ld64(s228 + 0x10)
								bk = ld64(s238)
								bn = ld64(s250)
								if (ch == bn) {
									fn_e248(s1e0, cg, ci)
									bk = ld64(s1e0 + 8)
									st64(s258, ld64(s1d0))
									bn = ld64(s1e0)
									ch = ld64(s1d0 + 8)
								}
								const cj = ld64(s258) + ch
								const ck = ld64(s228 + 0x18)
								const cl = bk + (cj - (bn > cj ? 0 : bn)) * 0x78
								st8(cl + 4, 2)
								copy(cl + 5, s110, 0x18)
								st32(cl + 0x1c, ld32(s10d + 0x14))
								memcpy(cl + 0x20, s98, 0x58)
								bj = undef
								bl = undef
								bp = ck - 1
								bo = ch + 1
								st64(s1d0 + 8, bo)
								bi = ld64(s228)
								bm = bi
								if (bi == ld64(s268)) {
									break B68
								}
								continue L52
							}
							bv = bv - 0x18
							br = br + 0x18
						} while (br != bw)
					}
					const bx = ld32(ld64(s228 + 8))
					st32(s24, bx)
					const by = ld64(ld64(s260))
					copyr(s20, by, 0x20)
					st64(s188, 0, 1, 0)
					st64(s78, s188, 0x100159480)
					st8(s78 + 0x18, 3)
					st64(s78 + 0x10, 0x20)
					st64(s98 + 0x10, 0)
					st64(s98, 0)
					if (imp_fmt(s24, s98) == 0) {
						copyr(sf0, s180, 0x10)
						st64(s110, 0x100152e25, 0xa, s20, 0x20)
						st64(s188, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
						// PDA find_program_address(["tick_array", *s20, ?], program *s188)
						Pubkey_find_program_address(s98, s110, 3, s188)
						bj = undef
						bl = undef
						copyr(s1a8, s98, 0x20)
						let bz = ld64(s230)
						let ca = ld64(s240)
						bo = ld64(s228 + 0x10)
						while (true) {
							if (bz == 0) {
								bp = ld64(s228 + 0x18)
								break B68
							}
							const cb = ld64(ca)
							copyr(s98, cb, 0x20)
							const cc = memcmp(s98, s1a8, 0x20)
							bj = undef
							bl = undef
							bz = bz - 0x30
							ca = ca + 0x30
							if ((cc as u32) == 0) {
								bn = ld64(s1e0)
								if (bo == bn) {
									fn_e248(s1e0, undef, cc as u32)
									bn = ld64(s1e0)
									bo = ld64(s1d0 + 8)
								}
								const cd = ld64(s1d0)
								st64(s258, cd)
								const ce = cd + bo
								bk = ld64(s1e0 + 8)
								const cf = bk + (ce - (bn > ce ? 0 : bn)) * 0x78
								st32(cf, bx)
								memset(cf + 4, 0, 0x71)
								bj = undef
								bl = undef
								bo = bo + 1
								st64(s1d0 + 8, bo)
								bi = ld64(s228)
								bm = bi
								bp = ld64(s228 + 0x18)
								if (bi == ld64(s268)) {
									break B68
								}
								continue L52
							}
						}
					}
					fn_149678("a Display implementation returned an error unexpectedly", 0x37, s110, 0x1001594b0, 0x1001594d0)
				}
			}
		}
		st64(s228 + 0x18, bp)
		if (bo != 0) {
			const cm = ld64(s1d0)
			let cn = ld64(s1e0)
			const cr = cn > cm + 1 ? 0 : cn
			const co = ld64(s1e0 + 8)
			const cp = co + cm * 0x78
			const cq = ld8(cp + 4)
			st64(s228, cq)
			if (cq == 3) {
				fn_1490e8(0x10015a198, cp, cq, bj, bl)
			}
			let cs = cm + 1 - cr
			st64(s228 + 0x10, bo)
			st64(s230, ld32(cp))
			memcpy(s188, cp + 5, 0x73)
			if (bo != 1) {
				const ct = co + cs * 0x78
				st64(s238, ld8(ct + 4))
				st64(s250, ld32(ct))
				memcpy(s110, ct + 5, 0x73)
				const cu = cs + 1
				bl = 0
				cs = cu - (cn > cu ? 0 : cn)
				st64(s228 + 8, 3)
				const cv = ld64(s228 + 0x10)
				if (cv != 2) {
					const cw = co + cs * 0x78
					st64(s228 + 8, ld8(cw + 4))
					st64(s258, ld32(cw))
					memcpy(s98, cw + 5, 0x73)
					const cx = cs + 1
					cs = cx - (cn > cx ? 0 : cn)
					bl = cv - 3
				}
			} else {
				st64(s238, 3)
				bl = 0
				st64(s228 + 8, 3)
			}
			const cy = ld64(0x300000000 /* heap bump-allocator cursor */)
			bj = 0x168 > cy
			bi = cy != 0 ? (bj != 0 ? 0 : cy - 0x168) & -8 : 0x300007e98
			st64(s240, bl)
			if (0x300000008 > bi) {
				raw_vec_handle_error(8, 0x168, bi, bj, bl)
			}
			st64(0x300000000 /* heap bump-allocator cursor */, bi)
			st8(bi + 4, ld64(s228))
			st32(bi, ld64(s230))
			st64(s228 + 0x10, bi)
			v = memcpy(bi + 5, s188, 0x73)
			let dc = 1
			const cz = ld64(s238)
			if ((cz as u8) != 3) {
				const da = ld64(s228 + 0x10)
				st8(da + 0x7c, cz)
				st32(da + 0x78, ld64(s250))
				v = memcpy(da + 0x7d, s110, 0x73)
				dc = 2
			}
			const db = ld64(s228 + 8)
			if ((db as u8) != 3) {
				const dd = ld64(s228 + 0x10) + dc * 0x78
				st8(dd + 4, db)
				st32(dd, ld64(s258))
				v = memcpy(dd + 5, s98, 0x73)
				dc = dc + 1
			}
			const de = ld64(s248)
			st64(de + 0x10, dc)
			st64(de + 8, ld64(s228 + 0x10))
			st64(de, 3)
			let dq = ld64(s228 + 0x18)
			const df = ld64(s240)
			if (df != 0) {
				const dg = cn > cs ? 0 : cn
				const di = cs - dg
				const dh = cn
				const dj = df - (cn - di)
				v = dj > df
				let dp = v != 0 ? 0 : dj
				cn = df > cn - di ? cn : di + df
				if (cn != di) {
					let dl = cn - di
					let dk = cs * 0x78 - dg * 0x78 + co + 0x18
					do {
						if (ld8(dk - 0x14) == 2) {
							const dm = ld64(dk)
							st64(dm, ld64(dm) + 1)
						}
						dk = dk + 0x78
						dl = dl - 1
					} while (dl != 0)
				}
				dq = ld64(s228 + 0x18)
				if (df > dh - di) {
					let dn = co + 0x18
					do {
						if (ld8(dn - 0x14) == 2) {
							const dr = ld64(dn)
							st64(dr, ld64(dr) + 1)
						}
						dn = dn + 0x78
						dp = dp - 1
					} while (dp != 0)
				}
			}
			if (dq == 0) {
				return v
			}
			let dx = ld64(s1f8 + 8) + 0x10
			while (true) {
				const dy = ld64(dx)
				st64(dy, ld64(dy) + 1)
				dx = dx + 0x18
				dq = dq - 1
				if (dq == 0) {
					return v
				}
			}
		}
		v = fn_87630(s208, 0x17)
		du = ld64(s228 + 0x18)
		const dt = ld64(s208)
		const ds = ld64(s248)
		st64(ds + 0x10, ld64(s208 + 8))
		st64(ds + 8, dt)
		st64(ds, 0x8000000000000000)
	}
	if (du == 0) {
		return v
	}
	let dv = ld64(s1f8 + 8) + 0x10
	while (true) {
		const dw = ld64(dv)
		st64(dw, ld64(dw) + 1)
		dv = dv + 0x18
		du = du - 1
		if (du == 0) {
			return v
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), a (points to it), b (value)
function fn_5bad0(a: u64, b: u64, c: u64): u64 {
	const s20 = fp - 0x20, s40 = fp - 0x40, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80, s90 = fp - 0x90, sa0 = fp - 0xa0
	let s, t, u: u64
	const f = ld64(ld64(b))
	copyr(s60, f, 0x20)
	const g = ld64(c + 0x18)
	if ((memcmp(g, 0x100152180, 0x20) as u32) == 0 && fn_143248(c) != 0) {
		u = memcpy(a, c, 0x30)
		st8(a + 0x30, 0)
		return u
	}
	const h = memcmp(g, 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
	if ((h as u32) != 0) {
		const r = anchor_error_from(s70, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		const q = ld64(s70 + 8)
		const p = ld64(s70)
		copyr(s40, g, 0x20)
		st64(s20, 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */, 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */, 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */, 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */) // key whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
		u = fn_13b5c0(s80, p, q, s40, r)
		t = ld64(s80 + 8)
		s = ld64(s80)
	} else {
		AccountInfo_try_borrow_data(s40, c, h as u32)
		let m = undef
		let n = undef
		const o = ld64(s40 + 0x10)
		const j = ld64(s40 + 8)
		const i = ld64(s40)
		if (i == 0x800000000000001a /* Ok */) {
			let l = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
			const k = ld64(j + 8)
			if (k >= 8) {
				l = 0xbba /* anchor::AccountDiscriminatorMismatch */
				const x = ld64(j)
				m = ld64(x)
				n = 0xf4e5b38cb383c28b /* account:Oracle */
				if (m == 0xf4e5b38cb383c28b /* account:Oracle */) {
					if (k > 0xfd) {
						if ((memcmp(x + 8, s60, 0x20) as u32) != 0) {
							fn_1494c8("internal error: entered unreachable code", 0x28, 0x100159eb8)
						}
						st64(o, ld64(o) - 1)
						u = memcpy(a, c, 0x30)
						st8(a + 0x30, 1)
						return u
					}
					fn_14c5c0(0xfe, k, 0x100159ed0, m, 0xf4e5b38cb383c28b /* account:Oracle */)
				}
			}
			u = anchor_error_from(sa0, l, l, m, n)
			t = ld64(sa0 + 8)
			s = ld64(sa0)
			st64(o, ld64(o) - 1)
		} else {
			st64(s40, i, j, o)
			u = fn_13b430(s90, s40)
			t = ld64(s90 + 8)
			s = ld64(s90)
		}
	}
	if (s != 2) {
		st64(a + 8, t)
		st64(a, s)
		st8(a + 0x30, 2)
		const w = ld64(c + 0x10)
		const v = ld64(c + 8)
		rc_dec(v)
		if (!rc_release(w)) {
			return u
		}
		st64(w + 8, ld64(w + 8) - 1)
		return u
	}
	u = memcpy(a, c, 0x30)
	st8(a + 0x30, t)
	return u
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), a (points to it), b (points to it)
function fn_5bfc8(a: u64, b: u64, c: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28
	if (ld8(b + 0x30) != 0) {
		r0 = AccountInfo_try_borrow_data(s18, b, r0)
		const i = ld64(s18 + 0x10)
		const g = ld64(s18 + 8)
		const f = ld64(s18)
		if (f != 0x800000000000001a /* Ok */) {
			st64(s18, f, g, i)
			r0 = fn_13b430(s28, s18)
			const j = ld64(s28)
			st64(a + 8, ld64(s28 + 8))
			st64(a, j)
			return r0
		}
		const h = ld64(g + 8)
		if (h > 0xfd) {
			st8(a + 8, c >= ld64(ld64(g) + 0x28))
			st64(a, 2)
			st64(i, ld64(i) - 1)
			return r0
		}
		fn_14c5c0(0xfe, h, 0x100159ee8, 0x800000000000001a /* Ok */)
	}
	st64(a, 2)
	st8(a + 8, 1)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), b (points to it)
function fn_5c138(a: u64, b: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s3a = fp - 0x3a, s66 = fp - 0x66, s78 = fp - 0x78
	if (ld8(b + 0x30) != 0) {
		AccountInfo_try_borrow_data(s18, b, r0)
		const i = ld64(s18 + 0x10)
		const g = ld64(s18 + 8)
		const f = ld64(s18)
		if (f != 0x800000000000001a /* Ok */) {
			st64(s18, f, g, i)
			r0 = fn_13b430(s78, s18)
			const j = ld64(s78)
			st64(a + 0x10, ld64(s78 + 8))
			st64(a + 8, j)
			st8(a, 1)
			return r0
		}
		const h = ld64(g + 8)
		if (h > 0xfd) {
			const k = ld64(g)
			st16(s3a + 0x20, ld16(k + 0x50))
			copyr(s3a, k + 0x30, 0x20)
			memcpy(s66, k + 0x52, 0x2c)
			st8(a + 1, 1)
			r0 = memcpy(a + 2, s66, 0x4e)
			st8(a, 0)
			st64(i, ld64(i) - 1)
			return r0
		}
		fn_14c5c0(0xfe, h, 0x100159ee8)
	}
	st16(a, 0)
	return r0
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (points to it), b (value), d (value), p5 (value), p6 (value), p7 (value), p8 (value), p9 (value), p10 (points to it)
function fn_49708(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64): u64 {
	const s22 = fp - 0x22, s4e = fp - 0x4e, s88 = fp - 0x88, sae = fp - 0xae, sdc = fp - 0xdc, sf8 = fp - 0xf8, s110 = fp - 0x110, s120 = fp - 0x120, s280 = fp - 0x280, s288 = fp - 0x288, s298 = fp - 0x298, s2a0 = fp - 0x2a0, s2a8 = fp - 0x2a8, s328 = fp - 0x328, s3a8 = fp - 0x3a8, s428 = fp - 0x428, s438 = fp - 0x438, s448 = fp - 0x448, s458 = fp - 0x458, s468 = fp - 0x468, s478 = fp - 0x478, s488 = fp - 0x488, s498 = fp - 0x498, s4a8 = fp - 0x4a8, s4b8 = fp - 0x4b8, s4c8 = fp - 0x4c8, s4d8 = fp - 0x4d8, s4e8 = fp - 0x4e8, s4f8 = fp - 0x4f8, s508 = fp - 0x508, s518 = fp - 0x518, s528 = fp - 0x528, s538 = fp - 0x538, s548 = fp - 0x548, s558 = fp - 0x558, s568 = fp - 0x568, s578 = fp - 0x578, s588 = fp - 0x588, s598 = fp - 0x598, s5a8 = fp - 0x5a8, s5b8 = fp - 0x5b8, s5c8 = fp - 0x5c8, s5d8 = fp - 0x5d8, s5e8 = fp - 0x5e8, s628 = fp - 0x628, s640 = fp - 0x640, s668 = fp - 0x668, s720 = fp - 0x720, s778 = fp - 0x778, s780 = fp - 0x780, s788 = fp - 0x788, s790 = fp - 0x790, s798 = fp - 0x798, s7a0 = fp - 0x7a0, s7a8 = fp - 0x7a8, s7b0 = fp - 0x7b0, s7b8 = fp - 0x7b8, s7c0 = fp - 0x7c0, s7c8 = fp - 0x7c8, s7d0 = fp - 0x7d0, s7d8 = fp - 0x7d8, s7e0 = fp - 0x7e0, s7e8 = fp - 0x7e8, s7f0 = fp - 0x7f0, s7f8 = fp - 0x7f8, s800 = fp - 0x800, sfe8 = fp - 0xfe8, sff0 = fp - 0xff0, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let f, i, k, l, n, q, r, ab, ac, ah, aj, am, ba, bb, bc, bf, bg, bn, br, bt, cb, cd, ce, cr, el, ep, eq, fb, fi, fs, ft, fv, fw: u64
	B7: {
		B3: {
			st64(s628 + 0x18, c)
			const g = p6
			f = p5
			st64(s628 + 0x38, g)
			l = p10
			st64(s628 + 0x20, p9)
			const h = p8
			r = p7
			st64(s628 + 0x28, h)
			if ((f | g) == 0) {
				k = 0xfffec4b1
				q = 0x35bb7f32a81b33af
				st64(s628 + 0x30, 0)
				i = fn_13b50
				if (h != 0) {
					break B3
				}
			} else {
				i = f
				const j = ld64(s628 + 0x38) + (f >= fn_13b50)
				if ((j != 0xfffec4b2 ? 0xfffec4b1 > j - 1 : 0x35bb7f31a819f860 > f + 0xfffffffefffec4b0) == 0) {
					ac = fn_87630(s438, 0xb)
					ab = ld64(s438)
					st64(a + 8, ld64(s438 + 8))
					st64(a, ab)
					return ac
				}
				f = i
				k = ld64(s628 + 0x38)
				st64(s628 + 0x30, k)
				q = i
				if (ld64(s628 + 0x28) != 0) {
					break B3
				}
			}
			st64(s628 + 0x10, l)
			const p = ld64(b + 0x230)
			st64(s628 + 8, p)
			n = ld64(b + 0x238)
			st64(s628, q)
			st64(s628 + 0x30, k)
			if ((k != n ? n >= k : p >= q) != 0) {
				ac = fn_87630(s448, 0x22)
				ab = ld64(s448)
				st64(a + 8, ld64(s448 + 8))
				st64(a, ab)
				return ac
			}
			break B7
		}
		st64(s628 + 0x10, l)
		const m = ld64(b + 0x230)
		st64(s628, i, m)
		n = ld64(b + 0x238)
		const o = n > ld64(s628 + 0x30)
		if (((ld64(s628 + 0x30) != n ? o : m > i) & 1) == 0) {
			ac = fn_87630(s448, 0x22)
			ab = ld64(s448)
			st64(a + 8, ld64(s448 + 8))
			st64(a, ab)
			return ac
		}
	}
	if (d == 0) {
		ac = fn_87630(s5e8, 0x23)
		ab = ld64(s5e8)
		st64(a + 8, ld64(s5e8 + 8))
		st64(a, ab)
		return ac
	}
	st64(s720 + 0xb0, n)
	st64(s720 + 0x98, f)
	st64(s640 + 0x10, r)
	st64(s720 + 0xa8, d)
	const u = ld16(b + 0x282)
	st64(s668 + 0x18, ld16(b + 0x280))
	const t = ld16(b + 0x27c)
	st64(s668 + 0x20, b)
	const s = ld64(s628 + 0x20)
	fn_4e100(s2a8, b, s)
	if (ld32(s2a8) != 0) {
		ac = fn_87630(s458, ld32(s2a8 + 4))
		ab = ld64(s458)
		st64(a + 8, ld64(s458 + 8))
		st64(a, ab)
		return ac
	}
	st64(s720 + 0x30, t)
	st64(s720 + 0x58, u)
	st64(s720 + 0x80, s2a0)
	const y = memcpy(s428, s2a0, 0x180)
	const v = ld64(s668 + 0x20)
	copyr(s720, v + 0x250, 0x10)
	st64(s720 + 0x18, ld64(v + 0x248))
	st64(s720 + 0x20, ld64(v + 0x240))
	copyr(s640, v + 0x220, 0x10)
	const x = ld32(v + 0x278)
	st64(s1000, ld64(s668 + 0x18))
	st64(sff8, ld64(s628 + 0x10))
	const w = ld64(s628 + 0x28)
	st64(s720 + 0x60, x)
	ac = fn_45408(s2a8, w, x, s, fp, y)
	const aa = ld64(s2a0)
	ab = ld64(s2a8)
	const z = ld64(s288)
	if (z == 3) {
		st64(a + 8, aa)
		st64(a, ab)
		return ac
	}
	st64(s628 + 0x10, ab)
	copyr(s110, s298, 0x10)
	memcpy(sf8, s280, 0x70)
	let ad = ld64(s720 + 0x20)
	if (w == 0) {
		ad = ld64(s720)
	}
	st64(s720 + 0x40, ad)
	st64(s720 + 0x68, a)
	let ae = ld64(s720 + 0x18)
	const ak = ld64(s720 + 0xa8)
	let al = ld64(s628 + 0x18)
	if (ld64(s628 + 0x28) == 0) {
		ae = ld64(s720 + 8)
	}
	B132: {
		st64(s720 + 0x50, ae)
		const af = ld64(s628)
		const ag = ld64(s628 + 8)
		ah = ld64(s720 + 0xb0)
		const ai = ld64(s628 + 0x30) ^ ah
		st64(s110 + 0x10, z)
		st64(s120 + 8, aa)
		st64(s120, ld64(s628 + 0x10))
		ba = 0
		aj = 0
		st64(s720 + 0x88, 0)
		st64(s668 + 0x18, ag)
		am = ah
		st64(s668 + 0x10, 0)
		st64(s628 + 0x10, ak)
		fi = ld64(s640 + 0x10)
		fb = ld64(s628 + 0x20)
		if ((af ^ ag | ai) != 0) {
			st64(s780, ld64(s328 + 0x78))
			st64(s778 + 0x20, ld64(s328 + 0x70))
			st64(s788, ld64(s3a8 + 0x78))
			st64(s778 + 0x18, ld64(s3a8 + 0x70))
			st64(s790, ld64(s428 + 0x78))
			st64(s778 + 0x10, ld64(s428 + 0x70))
			st64(s668 + 0x10, 0)
			st64(s778, s3a8, s328)
			st64(s778 + 0x28, ld64(al + 8))
			st64(s720 + 0x10, ld64(al + 0x10))
			st64(s628 + 0x10, ak)
			st64(s668 + 0x18, ld64(s628 + 8))
			am = ld64(s720 + 0xb0)
			st64(s720 + 0x88, 0)
			let ao = 0
			L20: while (true) {
				const at = am
				const an = ld64(s628 + 0x28)
				st64(s1000, an)
				st64(s778 + 0x48, ao)
				st64(sff8, ao)
				ac = fn_643d0(s2a8, al, ld64(s720 + 0x60), ld64(s720 + 0x30), an, ao)
				st64(s720 + 0x28, ld64(s2a0))
				if (ld64(s2a8) == 0) {
					const ap = ld32(s298)
					st64(s720 + 0x48, ap)
					fn_501e0(s468, ap, ac)
					st64(s720 + 0xa0, ld64(s468 + 8))
					const aq = ld64(s468)
					st64(s720 + 0x38, aq)
					if (an != 0) {
						const aw = ld64(s628)
						bb = at
						const ax = ld64(s720 + 0xa0) > ld64(s628 + 0x30)
						const ay = ld64(s720 + 0xa0) != ld64(s628 + 0x30) ? ax : aq > aw
						bc = ld64(s720 + 0xa0)
						if (ay == 0) {
							bc = ld64(s628 + 0x30)
						}
						st64(s668 + 0x20, aq)
						if (ay == 0) {
							st64(s668 + 0x20, aw)
						}
					} else {
						const ar = ld64(s628)
						bb = at
						const au = ld64(s720 + 0xa0) > ld64(s628 + 0x30)
						const av = ld64(s628 + 0x30) != ld64(s720 + 0xa0) ? au : aq > ar
						bc = ld64(s628 + 0x30)
						if (av == 0) {
							bc = ld64(s720 + 0xa0)
						}
						st64(s668 + 0x20, ar)
						if (av == 0) {
							st64(s668 + 0x20, aq)
						}
					}
					const az = ld64(s720 + 0x28)
					st64(s778 + 0x50, ld64(s778 + 0x28) + az * 0x78)
					st64(s778 + 0x30, ld64(s720 + 0x48) - 1)
					st64(s778 + 0x40, az + 1)
					st64(s720 + 0x90, ba)
					st64(s668 + 8, ld64(s668 + 0x18))
					st64(s668, bb)
					st64(s720 + 0x78, bc)
					while (true) {
						B118: {
							const en = ld64(s110 + 0x10)
							st64(s720 + 0x70, en)
							if (en != 2) {
								const eu = ld32(sf8 + 0x18)
								const ev = (ld32(sdc + 0x14) - (eu as i32)) as i32
								const ew = min(((ev ^ sar(ev, 0x3f)) - sar(ev, 0x3f)) * 0x2710 + ld32(sdc + 0x10), ld32(sae + 0xa))
								st32(sdc + 0x18, ew)
								const ex = ld16(sae + 0xe)
								st64(s778 + 0x38, ex)
								const ey = ld32(sae + 6)
								st64(s668 + 0x18, ey)
								__multi3(s478, ((ew * ex) as u32) * ((ew * ex) as u32), 0, ey, 0)
								const ez = ld64(s478)
								const fa = ld64(s478 + 8)
								__udivti3(s488, ez, fa, 0x9184e72a000, 0, fb)
								const fc = ld64(s488)
								const cg = __multi3(s498, fc, ld64(s488 + 8), 0x9184e72a000, 0)
								bn = 1
								ep = ld64(s628 + 0x28)
								const cc = ld64(s720 + 0x78)
								eq = min(min(fc + ((ld64(s498) ^ ez | ld64(s498 + 8) ^ fa) != 0), 0x186a0) + ld16(sdc + 0x2c), 0x186a0)
								cd = ld64(s668 + 0x20)
								ce = cc
								if ((ld64(s640) | ld64(s640 + 8)) != 0) {
									cd = ld64(s668 + 0x20)
									ce = cc
									if (ld64(s668 + 0x18) != 0) {
										if (ld64(s120) != 0) {
											cb = ld8(sae + 0x22)
											if ((ld32(s120 + 8) as i32) > (eu as i32)) {
												cd = ld64(s668 + 0x20)
												ce = cc
												if (cb != 0) {
													break B118
												}
												const cj = ld64(s110)
												let cl = cj > ld64(s668 + 0x20)
												const ck = ld64(s110 + 8)
												cl = cc != ck ? ck > cc : cl
												ce = cl != 0 ? cc : ck
												cd = ld64(s668 + 0x20)
												cd = cl != 0 ? cd : cj
												break B118
											}
										} else {
											cb = ld8(sae + 0x22)
										}
										if (ld64(s720 + 0x70) != 0 && (eu as i32) > (ld32(sf8) as i32)) {
											cd = ld64(s668 + 0x20)
											ce = cc
											if (cb == 0) {
												break B118
											}
											cd = ld64(sf8 + 8)
											let cf = cd > ld64(s668 + 0x20)
											ce = ld64(sf8 + 0x10)
											cf = ce != cc ? ce > cc : cf
											ce = cf != 0 ? ce : cc
											if (cf != 0) {
												break B118
											}
										} else {
											if (cb == 0) {
												fn_501e0(s4b8, smax(smin((((eu as i32) + 1) * ld64(s778 + 0x38)) as i32, 0x6c4f4), 0xfffffffffff93b0c), cg)
												bn = 0
												const cn = ld64(s4b8 + 8)
												const cm = ld64(s720 + 0x78)
												const co = ld64(s4b8)
												let cp = co > ld64(s668 + 0x20)
												cp = cm != cn ? cn > cm : cp
												ce = cp != 0 ? cm : cn
												cd = ld64(s668 + 0x20)
												cd = cp != 0 ? cd : co
												break B118
											}
											fn_501e0(s4a8, smax(smin(((eu as i32) * ld64(s778 + 0x38)) as i32, 0x6c4f4), 0xfffffffffff93b0c), cg)
											bn = 0
											ce = ld64(s4a8 + 8)
											const ch = ld64(s720 + 0x78)
											cd = ld64(s4a8)
											let ci = cd > ld64(s668 + 0x20)
											ci = ce != ch ? ce > ch : ci
											ce = ci != 0 ? ce : ch
											if (ci != 0) {
												break B118
											}
										}
										cd = ld64(s668 + 0x20)
									}
								}
							} else {
								bn = 0
								eq = ld16(s120)
								cd = ld64(s668 + 0x20)
								ce = bc
								ep = ld64(s628 + 0x28)
							}
						}
						const eo = ld64(s640 + 0x10)
						st64(sfe8, cd, ce, eo, ep)
						st64(sff0, ld64(s668))
						st64(sff8, ld64(s668 + 8))
						st64(s1000, ld64(s640 + 8))
						fn_4e7c8(s2a8, ld64(s628 + 0x10), eq, ld64(s640), ld64(s1000), ld64(sff8), ld64(sff0), cd, ce, eo, ep)
						if (ld32(s2a8) != 0) {
							ac = fn_87630(s4c8, ld32(s2a8 + 4))
							bt = ld64(s4c8)
							fw = ld64(s720 + 0x68)
							st64(fw + 8, ld64(s4c8 + 8))
							st64(fw, bt)
							return ac
						}
						const er = ld64(s720 + 0x80)
						copyr(s88, er, 0x28)
						const fu = ld64(s720 + 0x68)
						if (eo != 0) {
							const et = ld64(s88 + 0x10)
							const es = ld64(s628 + 0x10)
							if (et > es) {
								ac = fn_87630(s5b8, 0x28)
								fv = ld64(s5b8)
								st64(fu + 8, ld64(s5b8 + 8))
								st64(fu, fv)
								return ac
							}
							bf = ld64(s88 + 0x20)
							if (bf > es - et) {
								ac = fn_87630(s5a8, 0x28)
								fv = ld64(s5a8)
								st64(fu + 8, ld64(s5a8 + 8))
								st64(fu, fv)
								return ac
							}
							const be = ld64(s88 + 0x18)
							const bd = ld64(s668 + 0x10)
							if (bd > bd + be) {
								ac = fn_87630(s598, 0x27)
								fv = ld64(s598)
								st64(fu + 8, ld64(s598 + 8))
								st64(fu, fv)
								return ac
							}
							bg = es - et - bf
							st64(s668 + 0x10, bd + be)
						} else {
							const fe = ld64(s88 + 0x18)
							const fd = ld64(s628 + 0x10)
							if (fe > fd) {
								ac = fn_87630(s4f8, 0x28)
								fv = ld64(s4f8)
								st64(fu + 8, ld64(s4f8 + 8))
								st64(fu, fv)
								return ac
							}
							const fg = ld64(s88 + 0x10)
							const ff = ld64(s668 + 0x10)
							if (ff > ff + fg) {
								ac = fn_87630(s4e8, 0x27)
								fv = ld64(s4e8)
								st64(fu + 8, ld64(s4e8 + 8))
								st64(fu, fv)
								return ac
							}
							bf = ld64(s88 + 0x20)
							const fh = ff + fg + bf
							st64(s668 + 0x10, fh)
							bg = fd - fe
							if (ff + fg > fh) {
								ac = fn_87630(s4d8, 0x27)
								fv = ld64(s4d8)
								st64(fu + 8, ld64(s4d8 + 8))
								st64(fu, fv)
								return ac
							}
						}
						st64(s628 + 0x10, bg)
						const bh = ld64(s720 + 0x90)
						ba = bh + bf
						if (bh > ba) {
							ac = fn_87630(s588, 0x27)
							bt = ld64(s588)
							fw = ld64(s720 + 0x68)
							st64(fw + 8, ld64(s588 + 8))
							st64(fw, bt)
							return ac
						}
						const bi = ld64(s720 + 0x58)
						if (bi != 0) {
							__multi3(s508, bf, 0, bi, 0)
							const bu = ld64(s508 + 8)
							if (bu >= 0x2710) {
								fn_149678("called `Result::unwrap()` on an `Err` value", 0x2b, s2a8, 0x100159c60, 0x100159c80)
							}
							__udivti3(s518, ld64(s508), bu, 0x2710, 0, bf)
							const bv = ld64(s518)
							st64(s720 + 0x88, ld64(s720 + 0x88) + bv)
							bf = bf - bv
						}
						if ((ld64(s640) | ld64(s640 + 8)) != 0) {
							__udivti3(s528, 0, bf, ld64(s640), ld64(s640 + 8), bf)
							const bj = ld64(s528)
							const bk = ld64(s720 + 0x40)
							const bl = ld64(s528 + 8)
							const bm = ld64(s720 + 0x50)
							st64(s720 + 0x40, bj + bk)
							st64(s720 + 0x50, bl + bm + (bj > bj + bk))
						}
						B76: {
							B70: {
								B74: {
									st64(s720 + 0x90, bn)
									ah = ld64(s88)
									const bo = ld64(s720 + 0x38)
									const bp = ld64(s88 + 8)
									const bq = ld64(s720 + 0xa0)
									st64(s668 + 0x18, ah)
									if ((ah ^ bo | bp ^ bq) == 0) {
										B65: {
											B64: {
												B41: {
													B40: {
														am = bp
														fi = ld64(s640 + 0x10)
														fb = ld64(s628 + 0x20)
														if (ld64(s720 + 0x10) > ld64(s720 + 0x28)) {
															const bw = ld64(s778 + 0x50)
															let bz = ld64(bw + 8)
															const bx = ld8(bw + 4)
															bz = bx != 2 ? bw : bz
															let by = ld64(bw + 0x10)
															by = bx != 2 ? 0x10015a128 : by
															const ca = ld64(by + 0x38)
															callx(ca, s2a8, bz, ld64(s720 + 0x48), ld64(s720 + 0x30), ca)
															if (ld8(s2a8) == 0) {
																const cq = ld8(s2a8 + 1)
																if (cq != 0) {
																	if (cq == 2) {
																		fn_1490e8(0x100159c48)
																	}
																	st64(s7d0, cq)
																	const cx = ld64(s280 + 0x1a)
																	st64(s7c0, 1)
																	const cy = ld64(s778 + 0x10)
																	st64(s720 + 0x60, cx)
																	st64(s798, ld64(s280 + 0x42))
																	st64(s668, ld64(s280 + 0x3a))
																	st64(s778 + 0x38, ld64(s280 + 0x32))
																	st64(s668 + 8, ld64(s280 + 0x2a))
																	st64(s778 + 0x48, ld64(s280 + 0x22))
																	st64(s7f0, ld64(s280 + 0x12))
																	st64(s7a8, ld64(s280 + 0xa))
																	st64(s7e8, ld64(s280 + 2))
																	st64(s7b0, ld64(s288 + 2))
																	st64(s7e0, ld64(s298 + 0xa))
																	st64(s7d8, ld64(s298 + 2))
																	st64(s7b8, ld64(s2a0 + 2))
																	st64(s7a0, ld64(s2a8 + 2))
																	st64(s2a8, 0, 0, 0, 0)
																	const cz = memcmp(s428, s2a8, 0x20)
																	if ((cz as u32) != 0) {
																		st64(s778 + 0x48, ld64(s790) - ld64(s778 + 0x48) - (cx > cy))
																	}
																	if ((cz as u32) != 0) {
																		st64(s720 + 0x60, ld64(s778 + 0x10) - ld64(s720 + 0x60))
																	}
																	const db = ld64(s668 + 8) > ld64(s778 + 0x18)
																	st64(s2a8, 0, 0, 0, 0)
																	const da = memcmp(ld64(s778), s2a8, 0x20)
																	if ((da as u32) != 0) {
																		st64(s778 + 0x38, ld64(s788) - ld64(s778 + 0x38) - db)
																	}
																	if ((da as u32) != 0) {
																		st64(s668 + 8, ld64(s778 + 0x18) - ld64(s668 + 8))
																	}
																	const dd = ld64(s668) > ld64(s778 + 0x20)
																	st64(s2a8, 0, 0, 0, 0)
																	const dc = memcmp(ld64(s778 + 8), s2a8, 0x20)
																	if ((dc as u32) != 0) {
																		st64(s798, ld64(s780) - ld64(s798) - dd)
																	}
																	const de = ld64(s720 + 0x40)
																	const dg = ld64(s720 + 0x20)
																	const dh = ld64(s7a0)
																	if ((dc as u32) != 0) {
																		st64(s668, ld64(s778 + 0x20) - ld64(s668))
																	}
																	const df = ld64(s628 + 0x28)
																	const dj = df != 0 ? de : dg
																	let di = ld64(s720)
																	let dk = ld64(s7b8)
																	di = df != 0 ? di : de
																	let dw = ld64(s720 + 8)
																	if (df == 0) {
																		dw = ld64(s720 + 0x50)
																	}
																	st64(s7c8, 1)
																	if (di >= ld64(s7a8)) {
																		st64(s7c8, 0)
																	}
																	if (dj >= ld64(s7b0)) {
																		st64(s7c0, 0)
																	}
																	st64(s7f8, dj)
																	let dx = ld64(s720 + 0x50)
																	if (df == 0) {
																		dx = ld64(s720 + 0x18)
																	}
																	const dl = ld64(s628 + 0x28) != 0 ? -dh : dh
																	const dm = ld64(s628 + 0x28) != 0 ? -(dk + (dh != 0)) : dk
																	if ((dl | dm) != 0) {
																		if ((dm != 0 ? 0 > (dm as i64) : dl == 0) != 0) {
																			st64(s800, 1)
																			let dt = -dl > ld64(s640)
																			const ds = dm + (dl != 0)
																			if (ld64(s640 + 8) >= -ds) {
																				st64(s800, 0)
																			}
																			if (ld64(s640 + 8) != -ds) {
																				dt = ld64(s800)
																			}
																			if ((dt & 1) != 0) {
																				ac = fn_87630(s558, 0xf)
																				bt = ld64(s558)
																				fw = ld64(s720 + 0x68)
																				st64(fw + 8, ld64(s558 + 8))
																				st64(fw, bt)
																				return ac
																			}
																			const du = ld64(s640)
																			const dv = dm + ld64(s640 + 8) + (dl > dl + du)
																			st64(s640, dl + du, dv)
																		} else {
																			const dn = ld64(s640)
																			st64(s800, 1)
																			let dp = dn > dn + dl
																			const dq = ld64(s640 + 8)
																			const dr = dq + dm + dp
																			if (dr >= dq) {
																				st64(s800, 0)
																			}
																			if (dr != ld64(s640 + 8)) {
																				dp = ld64(s800)
																			}
																			if ((dp & 1) != 0) {
																				ac = fn_87630(s558, 0xe)
																				bt = ld64(s558)
																				fw = ld64(s720 + 0x68)
																				st64(fw + 8, ld64(s558 + 8))
																				st64(fw, bt)
																				return ac
																			}
																			st64(s640, dn + dl, dr)
																		}
																		dk = ld64(s7b8)
																	}
																	const ea = dw - ld64(s7f0)
																	const dy = dx - ld64(s7e8)
																	const dz = ld64(s7c0)
																	const eb = ld64(s7c8)
																	const ed = ld64(s7b0)
																	const ec = ld64(s7f8)
																	const ef = di - ld64(s7a8)
																	const ee = ld64(s7a0)
																	st64(s88 + 0x2c, (ee >> 0x20 | (dk << 0x20)))
																	st32(s88 + 0x28, ee)
																	const eg = ld64(s88 + 0x28)
																	st64(s280 + 0x40, ld64(s798))
																	st64(s280 + 0x38, ld64(s668))
																	st64(s280 + 0x30, ld64(s778 + 0x38))
																	st64(s280 + 0x28, ld64(s668 + 8))
																	st64(s280 + 0x20, ld64(s778 + 0x48))
																	st64(s280 + 0x18, ld64(s720 + 0x60))
																	st64(s288, ec - ed, dy - dz, ef, ea - eb)
																	st64(s298 + 8, ld64(s7e0))
																	st64(s298, ld64(s7d8))
																	st8(s280 + 0x48, ld64(s7d0))
																	st64(s2a8, eg, dk)
																	const eh = ld64(s778 + 0x50)
																	let ek = ld64(eh + 8)
																	const ei = ld8(eh + 4)
																	ek = ei != 2 ? eh : ek
																	let ej = ld64(eh + 0x10)
																	fi = ld64(s640 + 0x10)
																	fb = ld64(s628 + 0x20)
																	ej = ei != 2 ? 0x10015a128 : ej
																	ac = callx(ld64(ej + 0x40), s568, ek, ld64(s720 + 0x48), ld64(s720 + 0x30), s2a8)
																	el = ld64(s568)
																	if (el != 2) {
																		ft = ld64(s568 + 8)
																		fs = ld64(s720 + 0x68)
																		st64(fs, el, ft)
																		return ac
																	}
																}
																cr = ld64(s778 + 0x50)
																break B64
															}
															br = ld64(s298)
															if (ld64(s2a0) != 0) {
																break B40
															}
														} else {
															fn_87630(s538, 3)
															br = ld64(s538 + 8)
															st64(s298, br)
															const bs = ld64(s538)
															st64(s2a0, bs)
															st8(s2a8, 1)
															if (bs != 0) {
																break B40
															}
														}
														void ld64(br)
														cr = ld64(s778 + 0x50)
														void ld8(br + 0x50)
														break B41
													}
													void ld64(br)
													cr = ld64(s778 + 0x50)
													void ld8(br + 0x38)
												}
												if (ld64(s720 + 0x28) >= ld64(s720 + 0x10)) {
													ac = fn_87630(s548, 3)
													st64(s2a0, ld64(s548 + 8))
													bt = ld64(s548)
													st64(s2a8, bt)
													if (bt == 2) {
														break B65
													}
													fw = ld64(s720 + 0x68)
													st64(fw + 8, ld64(s2a0))
													st64(fw, bt)
													return ac
												}
											}
											let cu = ld64(cr + 8)
											const cs = ld8(cr + 4)
											cu = cs != 2 ? cr : cu
											let ct = ld64(cr + 0x10)
											ct = cs != 2 ? 0x10015a128 : ct
											const cv = ld64(ct + 0x68)
											ac = callx(cv, s2a8, cu, ld64(s720 + 0x48), ld64(s720 + 0x30), cv)
											bt = ld64(s2a8)
											if (bt != 2) {
												fw = ld64(s720 + 0x68)
												st64(fw + 8, ld64(s2a0))
												st64(fw, bt)
												return ac
											}
										}
										const cw = ld64(s2a0)
										if (ld64(s628 + 0x28) == 0) {
											st64(s778 + 0x48, ld64(s778 + 0x40))
											ah = ld64(s668 + 0x18)
											if (cw != 0x57) {
												st64(s778 + 0x48, ld64(s720 + 0x28))
											}
											st64(s720 + 0x60, ld64(s720 + 0x48))
											if (ld64(s720 + 0x90) != 0) {
												break B70
											}
											break B74
										}
										st64(s778 + 0x48, ld64(s778 + 0x40))
										ah = ld64(s668 + 0x18)
										if (cw != 0) {
											st64(s778 + 0x48, ld64(s720 + 0x28))
										}
										st64(s720 + 0x60, ld64(s778 + 0x30))
									} else {
										am = bp
										fi = ld64(s640 + 0x10)
										fb = ld64(s628 + 0x20)
										if ((ah ^ ld64(s668 + 8) | bp ^ ld64(s668)) != 0) {
											st64(s720 + 0x60, fn_53940(s88))
											ah = ld64(s668 + 0x18)
											if (ld64(s720 + 0x90) != 0) {
												break B70
											}
											break B74
										}
									}
									if (ld64(s720 + 0x90) != 0) {
										break B70
									}
								}
								al = ld64(s628 + 0x18)
								bc = ld64(s720 + 0x78)
								if (ld64(s720 + 0x70) == 2) {
									break B76
								}
								st32(sf8 + 0x18, (ld8(sae + 0x22) != 0 ? 0xffffffffffffffff : 1) + ld32(sf8 + 0x18))
								break B76
							}
							st64(sff0, ld64(s720 + 0x48))
							st64(s1000, ld64(s720 + 0x38))
							st64(sff8, ld64(s720 + 0xa0))
							fn_45de8(s578, s120, ah, am, fp)
							ah = ld64(s668 + 0x18)
							al = ld64(s628 + 0x18)
							bc = ld64(s720 + 0x78)
						}
						aj = ld64(s628 + 0x10) == 0
						if (ld64(s628 + 0x10) != 0) {
							const em = ld64(s668 + 0x20)
							st64(s720 + 0x90, ba)
							st64(s668, am, ah)
							if ((ah ^ em | am ^ bc) != 0) {
								continue
							}
						}
						ao = ld64(s778 + 0x48)
						if ((ld64(s628) ^ ah | ld64(s628 + 0x30) ^ am) == 0) {
							break B132
						}
						if (ld64(s628 + 0x10) != 0) {
							continue L20
						}
						break B132
					}
				}
				const fx = ld64(s720 + 0x68)
				st64(fx + 8, ld64(s298))
				st64(fx, ld64(s720 + 0x28))
				return ac
			}
		}
	}
	if ((ld64(s720 + 0x98) | ld64(s628 + 0x38)) == 0 && ((aj & 1) == 0 && fi == 0)) {
		ac = fn_87630(s5c8, 0x39)
		bt = ld64(s5c8)
		fw = ld64(s720 + 0x68)
		st64(fw + 8, ld64(s5c8 + 8))
		st64(fw, bt)
		return ac
	}
	st64(sff8, ld64(s668 + 0x18))
	st64(s628 + 0x38, am)
	st64(sff0, am)
	st64(s1000, ld64(s720 + 0xb0))
	ac = fn_45af0(s5d8, s120, fb, ld64(s628 + 8), ld64(s1000), ld64(sff8), am, ah)
	const fj = ld64(s720 + 0xa8)
	const fk = ld64(s628 + 0x10)
	const fl = fi ^ ld64(s628 + 0x28)
	let fo = fj - fk
	if (fl == 0) {
		fo = ld64(s668 + 0x10)
	}
	if (fl == 0) {
		st64(s668 + 0x10, fj - fk)
	}
	el = ld64(s5d8)
	if (el == 2) {
		const fn = ba - ld64(s720 + 0x88)
		let fq = 0
		if (ld64(s110 + 0x10) != 2) {
			st16(s22 + 0x20, ld16(sae + 0x20))
			copyr(s22, sae, 0x20)
			memcpy(s4e, sdc, 0x2c)
			fq = 1
		}
		const fm = fn_e368(0x228, 8)
		st64(fm + 0x40, ld64(s720 + 0x50))
		st64(fm + 0x38, ld64(s720 + 0x40))
		st64(fm + 0x30, ld64(s628 + 0x38))
		st64(fm + 0x28, ld64(s668 + 0x18))
		st64(fm + 0x20, ld64(s640 + 8))
		st64(fm + 0x18, ld64(s640))
		st64(fm + 0x10, fn)
		st64(fm + 8, fo)
		st64(fm, ld64(s668 + 0x10))
		memcpy(fm + 0x48, s428, 0x180)
		st8(fm + 0x1d4, fq)
		st32(fm + 0x1d0, ld64(s720 + 0x60))
		st64(fm + 0x1c8, ld64(s720 + 0x88))
		ac = memcpy(fm + 0x1d5, s4e, 0x4e)
		const fr = ld64(s720 + 0x68)
		st64(fr + 8, fm)
		st64(fr, 2)
		return ac
	}
	ft = ld64(s5d8 + 8)
	fs = ld64(s720 + 0x68)
	st64(fs, el, ft)
	return ac
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (points to it)
function fn_5c328(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38
	let k: u64
	const f = ld8(c)
	if (ld8(b + 0x30) != 0) {
		if (f != 0) {
			if (ld8(b + 0x29) != 0) {
				fn_143448(s18, b, r0)
				const j = ld64(s18 + 0x10)
				const h = ld64(s18 + 8)
				const g = ld64(s18)
				if (g != 0x800000000000001a /* Ok */) {
					st64(s18, g, h, j)
					r0 = fn_13b430(s28, s18)
					k = ld64(s28)
					st64(a + 8, ld64(s28 + 8))
					st64(a, k)
					return r0
				}
				const i = ld64(h + 8)
				if (i > 0xfd) {
					r0 = memcpy(ld64(h) + 0x52, c + 1, 0x2c)
					st64(j, ld64(j) + 1)
					st64(a + 8, undef)
					st64(a, 2)
					return r0
				}
				fn_14c5c0(0xfe, i, 0x100159f00)
			}
			r0 = anchor_error_from(s38, 0xbbe /* anchor::AccountNotMutable */, c, f, e)
			k = ld64(s38)
			st64(a + 8, ld64(s38 + 8))
			st64(a, k)
			return r0
		}
		fn_1494c8("internal error: entered unreachable code", 0x28, 0x100159ea0, f, e)
	}
	if (f == 0) {
		st64(a + 8, b)
		st64(a, 2)
		return r0
	}
	fn_1494c8("internal error: entered unreachable code", 0x28, 0x100159ea0, f, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), p5 (value), p9 (value), p10 (value), p11 (value)
// types [heur]: p6: TokenAccount (every call passes one: fn_36bf8, fn_386c8); p7: TokenAccount (every call passes one: fn_36bf8, fn_386c8)
function fn_64930(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: TokenAccount, p7: TokenAccount, p8: u64, p9: u64, p10: u64, p11: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	const f = p9
	let z = ld64(f + 0x1c8)
	let y = ld64(f + 0x40)
	let x = ld64(f + 0x38)
	const j = ld64(f + 0x20)
	const i = ld64(f + 0x18)
	const h = ld32(f + 0x1d0)
	const g = ld64(f + 0x30)
	st64(b + 0x238, ld64(f + 0x28))
	st64(b + 0x240, g)
	st32(b + 0x280, h)
	st64(b + 0x228, i, j)
	memcpy(b + 8, f + 0x48, 0x180)
	st64(b + 0x278, p11)
	const k = p10
	const l = k != 0 ? 0x248 : 0x258
	st64(b + l, x, y)
	const m = k != 0 ? 0x268 : 0x270
	st64(b + m, ld64(b + m) + z)
	const o = ld64(f + 8)
	let n = ld64(f)
	const w = n
	n = k != 0 ? n : o
	const p = p5
	y = p
	z = o
	const s: TokenAccount = p7
	const r: TokenAccount = p6
	const q = p8
	x = s
	let v = fn_64c60(s10, c, k != 0 ? d : p, k != 0 ? r : s, q, n)
	let u = ld64(s10 + 8)
	let t = ld64(s10)
	if (t != 2) {
		st64(a + 8, u)
		st64(a, t)
		return v
	}
	v = fn_652d0(s20, b, k != 0 ? x : r, k != 0 ? y : d, q, k != 0 ? z : w)
	u = ld64(s20 + 8)
	t = ld64(s20)
	if (t == 2) {
		st64(a + 8, u)
		st64(a, 2)
		return v
	}
	st64(a + 8, u)
	st64(a, t)
	return v
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: b (points to it)
function fn_89078(a: u64, b: u64) {
	const f = ld64(0x300000000 /* heap bump-allocator cursor */)
	const g = f != 0 ? sat_sub(f, 0x100) : 0x300007f00
	if (0x300000008 > g) {
		raw_vec_handle_error(1, 0x100, g, 0x300000008, sat_sub(f, 0x100))
	}
	st64(0x300000000 /* heap bump-allocator cursor */, g)
	st64(g, 0x96a02b93af49cae1 /* event:Traded */)
	copy(g + 8, b, 0x20)
	st8(g + 0x28, ld8(b + 0x70))
	const h = ld64(b + 0x20)
	st64(g + 0x31, ld64(b + 0x28))
	st64(g + 0x29, h)
	const i = ld64(b + 0x30)
	st64(g + 0x41, ld64(b + 0x38))
	st64(g + 0x39, i)
	copy(g + 0x49, b + 0x40, 0x30)
	st64(a + 8, g, 0x79)
	st64(a, 0x100)
}

function log_data(a: u64, b: u64): u64 {
	return sol_log_data(a, b)
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

function fn_6960(a: u64, b: u64, c: u64, d: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28
	const f = memcmp(c, d, 0x20)
	let i = undef
	let g = f as u32
	if (g != 0) {
		st64(a + 8, i)
		st64(a, 2)
		return g
	}
	g = common_is_closed(b)
	i = undef
	if (g != 0) {
		st64(a + 8, i)
		st64(a, 2)
		return g
	}
	g = fn_143448(s18, b, g)
	i = ld64(s18 + 0x10)
	const h = ld64(s18)
	if (h != 0x800000000000001a /* Ok */) {
		const j = ld64(s18 + 8)
		st64(s18, h, j, i)
		g = fn_13b430(s28, s18)
		const k = ld64(s28)
		st64(a + 8, ld64(s28 + 8))
		st64(a, k)
		return g
	}
	st64(i, ld64(i) + 1)
	st64(a + 8, i)
	st64(a, 2)
	return g
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (points to it), c (value), d (value), e (value)
function fn_149478(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never {
	const s20 = fp - 0x20, s28 = fp - 0x28
	st64(s20, 0x10015b8e0, a, b)
	st16(s20 + 0x18, 1)
	st64(s28, 1)
	fn_147238(s28, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: c (value), b (value), a (value), d (value), e (value)
function fn_d648(a: u64, b: u64, c: u64, d: u64, e: u64) {
	const s18 = fp - 0x18, s20 = fp - 0x20, s40 = fp - 0x40, s68 = fp - 0x68, s70 = fp - 0x70, s98 = fp - 0x98
	let f = c
	let g = b
	st64(s98 + 0x20, a)
	if (c - 1 >= b) {
		fn_1494c8("assertion failed: offset != 0 && offset <= len", 0x2e, 0x1001595f0, d, e)
	}
	if (g > f) {
		const h = ld64(s98 + 0x20)
		st64(s98, g, h - 0x60, f * 0x30 + h - 0x30)
		while (true) {
			const k = ld64(s98 + 0x20) + f * 0x30
			const j = f * 0x30 + ld64(s98 + 8)
			const m = ld64(j + 0x30)
			const l = ld64(k)
			copyr(s18, l + 8, 0x18)
			st64(s70, l)
			st64(s20, ld64(l))
			copyr(s68, m, 0x20)
			if ((memcmp(s20, s68, 0x20) as i32) <= -1) {
				let i = j + 0x30
				copyr(s68, k + 8, 0x28)
				memcpy(k, i, 0x30)
				st64(s98 + 0x18, f)
				if (f != 1) {
					let r = 1
					let n = ld64(s98 + 0x10)
					do {
						const p = ld64(n - 0x30)
						const o = ld64(s70)
						copyr(s40, o, 0x20)
						copyr(s20, p, 0x20)
						const q = memcmp(s40, s20, 0x20)
						i = n
						if ((q as i32) > -1) {
							break
						}
						memcpy(n, n - 0x30, 0x30)
						r = r + 1
						i = ld64(s98 + 0x20)
						n = n - 0x30
					} while (ld64(s98 + 0x18) != r)
				}
				copy(i, s70, 0x30)
				f = ld64(s98 + 0x18)
				g = ld64(s98)
			}
			f = f + 1
			st64(s98 + 0x10, ld64(s98 + 0x10) + 0x30)
			if (f >= g) {
				return
			}
		}
	}
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), e (value)
function fn_1490e8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_1494c8("called `Option::unwrap()` on a `None` value", 0x2b, a, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: e (value)
function fn_1494c8(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	const s10 = fp - 0x10, s38 = fp - 0x38, s40 = fp - 0x40
	st64(s40, s10)
	st64(s10, a, b)
	st64(s38, 1, 8, 0, 0)
	fn_149478(s40, c, c, s10, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (value), e (value)
function fn_14c690(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c698(a, b, c, d, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), c (value)
function memmove(a: u64, b: u64, c: u64): u64 {
	sol_memmove(a, b, c)
	return a
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value), b (value), d (value), e (value)
function fn_14c5c0(a: u64, b: u64, c: u64, d: u64, e: u64): never {
	fn_14c5c8(a, b, c, d, e)
}

function fn_143248(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const f = ld64(a + 0x10)
	const g = ld64(f + 0x10)
	if (g > 0x7ffffffffffffffe) {
		fn_1486f0(0x10015b510, g, 0x7ffffffffffffffe, d, e)
	}
	return ld64(f + 0x20) == 0
}

function fn_5d748(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s20 = fp - 0x20, s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, s70 = fp - 0x70, s80 = fp - 0x80
	let j, m, n, q, r, t: u64
	if (ld8(b + 0x29) != 0) {
		const f = memcmp(ld64(b + 0x18), 0x10015380d /* &ORCA_WHIRLPOOL_PROGRAM */, 0x20)
		if ((f as u32) == 0) {
			fn_143448(s20, b, f as u32)
			let k = undef
			const l = ld64(s20 + 0x10)
			const h = ld64(s20 + 8)
			const g = ld64(s20)
			if (g == 0x800000000000001a /* Ok */) {
				B6: {
					j = 0xbb9 /* anchor::AccountDiscriminatorNotFound */
					const i = ld64(h + 8)
					if (i >= 8) {
						const o = ld64(h)
						const p = ld64(o)
						if (p == 0x38dac7e18ef6d811 /* account:DynamicTickArray */) {
							r = 0x100159f60
							q = o + 8
						} else {
							j = 0xbba /* anchor::AccountDiscriminatorMismatch */
							k = 0xbb42076ebebd6145 /* account:TickArray */
							if (p != 0xbb42076ebebd6145 /* account:TickArray */) {
								break B6
							}
							q = fn_5dad8(o, i, 0xbba /* anchor::AccountDiscriminatorMismatch */, 0xbb42076ebebd6145 /* account:TickArray */)
							r = 0x100159fd0
						}
						st64(s80, q, r)
						const s = ld64(r + 0x28)
						callx(s, s20, q, s)
						n = memcmp(s20, c, 0x20) as u32
						if (n != 0) {
							n = fn_87630(s50, 0x38)
							t = ld64(s50)
							st64(a + 0x10, ld64(s50 + 8))
							st64(a + 8, t)
							st64(a, 0)
							st64(l, ld64(l) + 1)
							return n
						}
						st64(a + 0x10, l)
						st64(a + 8, ld64(s80 + 8))
						st64(a, ld64(s80))
						return n
					}
				}
				n = anchor_error_from(s60, j, j, k)
				t = ld64(s60)
				st64(a + 0x10, ld64(s60 + 8))
				st64(a + 8, t)
				st64(a, 0)
				st64(l, ld64(l) + 1)
				return n
			}
			st64(s20, g, h, l)
			n = fn_13b430(s40, s20)
			m = ld64(s40)
			st64(a + 0x10, ld64(s40 + 8))
			st64(a + 8, m)
			st64(a, 0)
			return n
		}
		n = anchor_error_from(s30, 0xbbf /* anchor::AccountOwnedByWrongProgram */)
		m = ld64(s30)
		st64(a + 0x10, ld64(s30 + 8))
		st64(a + 8, m)
		st64(a, 0)
		return n
	}
	n = anchor_error_from(s70, 0xbbe /* anchor::AccountNotMutable */, c, d, e)
	m = ld64(s70)
	st64(a + 0x10, ld64(s70 + 8))
	st64(a + 8, m)
	st64(a, 0)
	return n
}

function fn_ed90(a: u64, b: u64, r0: u64) {
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
	fn_e478(s30, j << 3, k * 0x18, s18, r0)
	g = undef
	f = undef
	h = undef
	if (ld64(s30) != 0) {
		raw_vec_handle_error(ld64(s30 + 8), ld64(s30 + 0x10), g, f, h)
	}
	const n = ld64(s30 + 8)
	st64(a, i, n)
}

function fn_e7f8(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s18 = fp - 0x18, s30 = fp - 0x30
	let f = b + c
	let g = b > f
	if (g != 0) {
		raw_vec_handle_error(0, b, g, f, e)
	}
	const h = ld64(a)
	let i = max(h << 1, f)
	let m = 0
	const j = 0x2000000000000000 > i
	i = max(i, 4)
	const k = i
	if (h != 0) {
		const l = ld64(a + 8)
		st64(s18 + 0x10, h << 2)
		st64(s18, l)
		m = 4
	}
	st64(s18 + 8, m)
	const o = fn_e478(s30, j << 2, k << 2, s18, r0)
	g = undef
	f = undef
	e = undef
	if (ld64(s30) == 0) {
		const n = ld64(s30 + 8)
		st64(a, i, n)
		return o
	}
	raw_vec_handle_error(ld64(s30 + 8), ld64(s30 + 0x10), g, f, e)
}

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: a (value)
function memset(a: u64, b: u64, c: u64) {
	sol_memset(a, b as u8, c)
}

function fn_13b50(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64, r7: u64): u64 {
	const s18 = fp - 0x18, s48 = fp - 0x48, s58 = fp - 0x58, s258 = fp - 0x258, sff8 = fp - 0xff8, s1000 = fp - 0x1000
	let g, j: u64
	st64(r0 + 0x18, ld64(r7))
	const f = ld8(d + 8)
	if (f != 0xff) {
		st64(r0 + 0x20, ld64(s258 + (f << 3)))
		g = d + 0x10
	} else {
		st64(r0 + 0x20, d + 8)
		g = d + 8 + ld64(d + 0x58) + 0x2867 & -8
	}
	if (e != 0) {
		let i = c - a
		let h = g
		do {
			g = g + 8
			if (ld8(h) == 0xff) {
				g = (h + ld64(h + 0x50) + 0x2867 & -8 /* next account record */)
			}
			i = i + 1
			h = g
		} while (i != 0)
	}
	B13: {
		j = ld64(g)
		if (j >= 8) {
			g = g + 8
			let k = 0x100159770
			if (ld64(g) != 0xb2fbcd0d76f39c2e /* ix:increase_liquidity */) {
				k = 0x100159788
				if (ld64(g) != 0x12c5b686fd026a0 /* ix:decrease_liquidity */) {
					k = 0x1001597a0
					if (ld64(g) != 0xab0ee45df591d85 /* ix:increase_liquidity_v2 */) {
						k = 0x1001597b8
						if (ld64(g) != 0x60c4524f3ebc7f3a /* ix:decrease_liquidity_v2 */) {
							k = 0x1001597d0
							if (ld64(g) != 0x2b35c6d27c09fbef /* ix:increase_liquidity_by_token_amounts_v2 */) {
								k = 0x1001597e8
								if (ld64(g) != 0xfd9e13830be0a9bf /* ix:reposition_liquidity_v2 */) {
									break B13
								}
							}
						}
					}
				}
			}
			callx(ld64(k + 0x10), s58, s258, c, g, j)
			if (ld64(s58) == 3) {
				return 0
			}
			return fn_150f0(s58, 0)
		}
	}
	fn_13fd08(s48, b, c, g, j)
	let n = ld64(s48 + 0x10)
	const m = ld64(s48 + 8)
	const o = ld64(s48 + 0x18)
	const l = ld64(s48 + 0x28)
	st64(s1000, ld64(s48 + 0x20))
	st64(sff8, l)
	anchor_dispatch(s48, o, m, n, ld64(s1000), l)
	let p = 0
	if (ld64(s48) != 0x800000000000001a /* Ok */) {
		copyr(s18, s48, 0x18)
		p = fn_143da0(s18, 0)
	}
	if (n == 0) {
		return p
	}
	let q = m + 0x10
	while (true) {
		const s = ld64(q)
		const r = ld64(q - 8)
		rc_dec(r)
		rc_dec(s)
		q = q + 0x30
		n = n - 1
		if (n == 0) {
			return p
		}
	}
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

// instruction data may reach [heur: flow-insensitive taint from the handlers' ix_args]: d (value), c (value), a (points to it), b (value)
function fn_45408(a: u64, b: u64, c: u64, d: u64, e: u64, r0: u64): u64 {
	const s30 = fp - 0x30, s40 = fp - 0x40, s50 = fp - 0x50, s60 = fp - 0x60, sc0 = fp - 0xc0, sc8 = fp - 0xc8, sd0 = fp - 0xd0, sd8 = fp - 0xd8, se0 = fp - 0xe0, se8 = fp - 0xe8, sf0 = fp - 0xf0
	let r: u64
	st64(sc0 + 0x48, d)
	const g = ld64(e - 0x1000)
	const f = ld64(e - 0xff8)
	if (ld8(f) != 0) {
		st64(sc0, b, g)
		st64(sc0 + 0x50, f)
		const h = ld16(f + 0x3b)
		if (h != 0) {
			st64(sc0 + 0x58, h)
			const i = fn_151b50(c as i32, h)
			let j = ld64(sc0 + 0x50)
			const l = ld64(j + 9)
			const k = ld64(j + 1)
			r0 = i - (1 > (c as i32) & ((c - i * ld64(sc0 + 0x58)) as u32) != 0)
			st64(sc0 + 0x18, ld32(j + 0x19))
			const n = ld32(j + 0x15)
			const o = ld32(j + 0x11)
			st64(sc0 + 0x40, ld32(j + 0x37))
			st64(sd0, ld32(j + 0x33))
			st64(sc0 + 0x10, ld16(j + 0x31))
			st64(sc0 + 0x20, ld16(j + 0x2f))
			st64(sc0 + 0x30, ld16(j + 0x2d))
			const m = ld64(sc0 + 0x48)
			st64(sc0 + 0x28, r0)
			st64(sc8, l)
			if (max(k, l) > m) {
				fn_87630(s40, 0x16)
				j = ld64(sc0 + 0x50)
				const q = ld64(s40)
				r0 = n
				r = o
				st64(sc0 + 0x38, k)
				if (q != 2) {
					const ag = ld64(s40 + 8)
					st64(a, q, ag)
					st64(a + 0x20, 3)
					return r0
				}
			} else {
				r = 0
				st64(sc0 + 0x38, m)
				if (0xe10 >= m - k) {
					const p = m - max(k, l)
					r0 = n
					r = o
					st64(sc0 + 0x38, k)
					if (p >= ld64(sc0 + 0x30)) {
						r0 = ld64(sc0 + 0x28)
						r = 0
						st64(sc0 + 0x38, m)
						if (ld64(sc0 + 0x20) > p) {
							r = ld64(sc0 + 0x18) * ld64(sc0 + 0x10) / 0x2710
							r0 = ld64(sc0 + 0x28)
							st64(sc0 + 0x38, m)
						}
					}
				}
			}
			const s = ld64(sc0 + 0x40)
			st64(sc0 + 0x48, r)
			const t = s - r
			let u = ((t as u32) / 0x2710 * 0x2710) as u32
			let z = 0
			const v = (t as u32) / 0x2710 + (u != (t as u32))
			const w = v + r0
			const x = ld64(sc0 + 0x58)
			st64(se0, r0 - v)
			const ab = ((w + 1) * x) as i32
			let y = ((r0 - v) * x) as i32
			if ((y as i64) > -0x6c4f4) {
				fn_501e0(s50, y, r0)
				y = undef
				u = undef
				j = ld64(sc0 + 0x50)
				z = 1
				st64(sf0, ld64(s50 + 8))
				st64(se8, ld64(s50))
			}
			st64(sd8, z)
			const aa = j
			let ac = j + 0x3d
			let af = 0
			if (0x6c4f3 >= (ab as i64)) {
				st64(sc0 + 0x50, ac)
				fn_501e0(s60, ab, r0)
				ac = ld64(sc0 + 0x50)
				af = 1
				u = ld64(s60 + 8)
				y = ld64(s60)
			}
			st16(a + 0x92, ld16(ac + 0x10))
			st64(a + 0x8a, ld64(ac + 8))
			st64(a + 0x82, ld64(ac))
			const ae = ld64(aa + 0x25)
			const ad = ld64(aa + 0x1d)
			st64(a + 0x38, u)
			st64(a + 0x30, y)
			st64(a + 0x18, ld64(sf0))
			st64(a + 0x10, ld64(se8))
			st64(a + 0x60, ad, ae)
			st8(a + 0x94, ld64(sc0))
			st16(a + 0x80, ld64(sc0 + 0x58))
			st32(a + 0x7c, ld64(sc0 + 0x40))
			st32(a + 0x78, ld64(sd0))
			st16(a + 0x76, ld64(sc0 + 0x10))
			st16(a + 0x74, ld64(sc0 + 0x20))
			st16(a + 0x72, ld64(sc0 + 0x30))
			st16(a + 0x70, ld64(sc0 + 8))
			st32(a + 0x5c, ld64(sc0 + 0x18))
			st32(a + 0x58, r0)
			st32(a + 0x54, ld64(sc0 + 0x48))
			st64(a + 0x4c, ld64(sc8))
			st64(a + 0x44, ld64(sc0 + 0x38))
			st32(a + 0x40, ld64(sc0 + 0x28))
			st32(a + 0x28, w)
			st64(a + 0x20, af)
			st32(a + 8, ld64(se0))
			st64(a, ld64(sd8))
			return r0
		}
		st64(s30, 0x100159c98, 1, 8, 0, 0)
		// fmt "Divisor must be positive."
		fn_149478(s30, 0x100159ca8, g, f, e)
	}
	st16(a, g)
	st64(a + 0x20, 2)
	return r0
}

function fn_5dad8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	if (b > 7) {
		if (b != 0x2704) {
			fn_117c8("from_bytes_mut", 0xe, 2, d, e)
		}
		return a + 8
	}
	fn_14c4f0(8, b, 0x10015a040, d, e)
}

// not included (size budget), see shared.ts:
declare function fn_643d0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64
declare function fn_501e0(a: u64, b: u64, r0: u64): u64
declare function fn_53940(a: u64): u64
declare function fn_45de8(a: u64, b: u64, c: u64, d: u64, e: u64)
declare function fn_4e7c8(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, p8: u64, p9: u64, p10: u64, p11: u64)
declare function fn_45af0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64, p7: u64, r0: u64): u64
declare function fn_64c60(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64
declare function fn_652d0(a: u64, b: u64, c: u64, d: u64, p5: u64, p6: u64): u64
declare function fn_13ae08(a: u64, b: u64, c: u64): u64
declare function fn_147238(a: u64, b: u64, c: u64, d: u64, e: AccountRecord): never
declare function fn_14c698(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_14c5c8(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_1486f0(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_13fd08(a: u64, b: u64, c: u64, d: u64, e: u64)
declare function anchor_dispatch(a: u64, program_id: u64, accounts: u64, accounts_len: u64, p5: u64, p6: u64)
declare function fn_150f0(a: u64, r0: u64): u64
declare function fn_14c4f0(a: u64, b: u64, c: u64, d: u64, e: u64): never
declare function fn_117c8(a: u64, b: u64, c: u64, d: u64, e: u64): never
