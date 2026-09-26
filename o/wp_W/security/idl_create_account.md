# idl_create_account

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_idl_create_account (anchor); 26 functions reachable: ix_idl_create_account, fn_149478, fn_147990, fn_11f980, fn_14f7f8, fn_1429c8, fn_13eea8, fn_14c4f0, fn_83078, memcpy, fn_139720, fn_149678, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|

## Constraints per account


## CPIs

- bundle/idl_create_account.ts:204 SYSTEM_PROGRAM (constant).CreateAccountWithSeed — accounts funder: *(ld64(c + 8)) w s, new_account: ? w, base: ? s — base: ? — PDA signer: [? (1 bytes)]
- bundle/idl_create_account.ts:452 program not decoded

## PDAs derived

- bundle/idl_create_account.ts:100 find_program_address(?, program ?)

## Dominance (checks on every path to the operation; across calls)

- bundle/idl_create_account.ts:204 ACCOUNT_CREATE, PDA_SIGNATURE: 1 dominating checks (key)
- bundle/idl_create_account.ts:452 CPI: 1 dominating checks (key)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/idl_create_account.ts:204 ACCOUNT_CREATE, PDA_SIGNATURE SYSTEM_PROGRAM.CreateAccountWithSeed: `am != -1` · `ak != -1` · `ae != -1` · `ab != -1` · `z != -1` · `x != -1` · `u102 != -1` · `u98 != -1` · `ld64(s108) == 0` · `ld8(s108) == 0` · … 1 more
- bundle/idl_create_account.ts:452 CPI: `am != -1` · `ak != -1` · `ae != -1` · `ab != -1` · `z != -1` · `x != -1` · `u102 != -1` · `u98 != -1` · `ld64(s108) == 0` · `ld8(s108) == 0` · … 1 more

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/idl_create_account.ts:91 | found |  | key | `(memcmp(b, f, 0x20) as u32) != 0` | anchor::IdlInstructionInvalidProgram |
