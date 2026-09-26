// sBPF runtime model: every value is a u64 (+ - * << wrap mod 2^64; / % unsigned; >> logical; sar() arithmetic)
// x as u8|u16|u32: truncate | x as i8|i16|i32: truncate + sign-extend | (x as i64) < (y as i64): signed compare
// ldN(addr) / stN(addr, v, ...): N-bit little-endian load/store (extra values go to addr+N, addr+2N, ...)
// copy(dst, src, n): copy n bytes as ascending 8-byte words (copyr: descending)
// fp: frame pointer of the current function (stack locals at fp - k); undef: leftover register value; trap(): abort
// a variable read before any assignment, and call arguments omitted at the end of the list, are undef
// "text" as a call argument = address of the first occurrence of its UTF-8 bytes in program memory (next argument: length);
//   other rodata text is shown as a comment after the address: 0x100001234 /* "text" */
// memory map: 0x1_0000_0000 program/rodata, 0x2_0000_0000 stack, 0x3_0000_0000 heap, 0x4_0000_0000 input (serialized accounts + ix data)
// instruction idl_include: handler + 1 reachable functions
declare function sol_log(msg: u64, len: u64): void // log utf8 message
declare function Error_with_account_name(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib name [heur]: the callee most often given an account-name string as its last argument pair (was fn_c00); "a Display implementation returned an err…"
declare function fn_122e8(a: u64, b: u64, c: u64, d: u64, e: u64): u64 // lib uses anchor_error_from, memcmp
declare function fn_13b430(a: u64, b: u64): u64 // lib uses __rust_alloc, alloc_handle_alloc_error

// instruction handler: idl_include (discriminator sha256("global:idl_include")[..8] = 0x1f81c13c7979fddf)
// accounts [str: the program's account-error strings, in order of first use]: system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: accounts, accounts_len
function ix_idl_include(a: u64, b: u64, accounts: u64, accounts_len: u64): u64 {
	const s18 = fp - 0x18, s28 = fp - 0x28, s38 = fp - 0x38
	sol_log("Instruction: IdlInclude", 0x17)
	st64(s28, accounts, accounts_len)
	let h = accounts_idl_include(s18, undef, s28, undef, fp)
	let g = ld64(s18 + 8)
	let f = ld64(s18)
	if (f != 2) {
		st64(a + 8, g)
		st64(a, f)
		return h
	}
	st64(s18, 0x8000000000000002 /* Err(ProgramError::InvalidInstructionData) */)
	h = fn_13b430(s38, s18)
	g = undef
	f = ld64(s38)
	if (f != 2) {
		st64(a + 8, ld64(s38 + 8))
		st64(a, f)
		return h
	}
	st64(a + 8, g)
	st64(a, 2)
	return h
}

// Anchor Accounts::try_accounts of instruction idl_include (called by ix_idl_include; name [str]: from the handler's "Instruction: …" log; was fn_94388)
// account checks: account (errors raised when a check on it fails) [str: account-error names, Anchor error codes]: system_program
function accounts_idl_include(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
	const s10 = fp - 0x10, s20 = fp - 0x20
	let h = fn_122e8(s10, c, c, d, e)
	let g = ld64(s10 + 8)
	const f = ld64(s10)
	if (f != 2) {
		h = Error_with_account_name(s20, f, g, "system_program", 0xe)
		g = ld64(s20 + 8)
		st64(a, ld64(s20))
		st64(a + 8, g)
		return h
	}
	st64(a, 2, g)
	return h
}
