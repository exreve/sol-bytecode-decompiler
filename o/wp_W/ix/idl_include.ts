/// <reference path="../lib.d.ts" />
// instruction idl_include

// instruction handler: idl_include (discriminator sha256("global:idl_include")[..8] = 0x1f81c13c7979fddf)
// accounts [str: the program's account-error strings, in order of first use]: system_program
// names [heur: Anchor dispatcher / handler argument order (out, program_id, accounts, accounts_len, instruction data after the discriminator, its length)]: accounts, accounts_len
export function ix_idl_include(a: u64, b: u64, accounts: u64, accounts_len: u64): u64 {
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
export function accounts_idl_include(a: u64, b: u64, c: u64, d: u64, e: u64): u64 {
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
