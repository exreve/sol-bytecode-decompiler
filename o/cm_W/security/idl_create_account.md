# idl_create_account

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_idl_create_account (anchor); 25 functions reachable: ix_idl_create_account, fn_14ec00, fn_14d660, fn_125710, fn_1476d8, fn_146f68, fn_11e480, anchor_error_from, fn_153150, memcpy, fn_14ce00, fn_14d4f8, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|

## Constraints per account


## CPIs

- bundle/idl_create_account.ts:174 SYSTEM_PROGRAM (constant).CreateAccountWithSeed — accounts funder: *bg w s, new_account: ? w, base: ? s — base: ? — PDA signer: [? (1 bytes)]

## PDAs derived

- bundle/idl_create_account.ts:83 find_program_address(?, program ?)

## Dominance (checks on every path to the operation; across calls)

- bundle/idl_create_account.ts:174 ACCOUNT_CREATE, PDA_SIGNATURE: 1 dominating checks (key)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/idl_create_account.ts:174 ACCOUNT_CREATE, PDA_SIGNATURE SYSTEM_PROGRAM.CreateAccountWithSeed: `u134 != -1` · `u125 != -1` · `u117 != -1` · `u106 != -1` · `u101 != -1` · `u95 != -1` · `u91 != -1` · `u87 != -1` · ✗ `ld64(s108) != 0` · ✗ `d > g` · … 2 more

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/idl_create_account.ts:75 | found |  | key | `(memcmp(b, f, 0x20) as u32) != 0` | anchor::IdlInstructionInvalidProgram |
