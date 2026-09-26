# create_operation_account

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_create_operation_account (anchor); 41 functions reachable: ix_create_operation_account, accounts_create_operation_account, fn_4f238, fn_ccf98, anchor_error_from, fn_11e480, memcpy, fn_14d660, fn_125710, fn_14ec00, fn_cb6f8, fn_147a20, ….

## Look first

- ⚠ owner: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | owner | expected · found | expected · runtime | runtime | — | = GThUX1At… · expected · NOT FOUND |
| 1 | operation_state | — | expected · PARTIAL | — | — | — |
| 2 | system_program | — | — | — | found | = 11111111… · expected · found |

## Constraints per account

- owner: signer found (bundle/create_operation_account.ts:135 via try_accounts_17a30); writable runtime (bundle/create_operation_account.ts:393) — written: the runtime rejects changes to a read-only account; owner runtime (bundle/create_operation_account.ts:393) — data written / lamports debited: only the owner program may (the runtime rejects it otherwise); address NOT FOUND
- operation_state: key found (bundle/create_operation_account.ts:179); pda found (bundle/create_operation_account.ts:179); writable PARTIAL (bundle/create_operation_account.ts:185)
- system_program: address found (bundle/create_operation_account.ts:156 via try_accounts_18870); executable found (bundle/create_operation_account.ts:156 via try_accounts_18870)

## CPIs

- bundle/create_operation_account.ts:617 [conditional] SYSTEM_PROGRAM (constant).Transfer — lamports: ld64(s320 + 8)
- bundle/create_operation_account.ts:679 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: 0xdc9 — PDA signer: ? (1 seeds)
- bundle/create_operation_account.ts:734 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: ld64(ld64(ld64(s2e0 + 0x40) + 0x28)) — PDA signer: ? (1 seeds)
- bundle/create_operation_account.ts:815 [conditional] SYSTEM_PROGRAM (constant).CreateAccount — accounts from: ? s, to: ? — lamports: ld64(s2e0 + 0x38), 0xdc9, ld64(ld64(b + 0x28)) — PDA signer: ? (1 seeds)

## PDAs derived

- bundle/create_operation_account.ts:171 find_program_address(["operation"], program *b)
- compared with provided accounts: operation_state found

## Operations (account writes)

- bundle/create_operation_account.ts:393 ACCOUNT_DATA_WRITE owner.data[8..9] = ld8(b + 0x20) [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/create_operation_account.ts:393 ACCOUNT_DATA_WRITE: 7 dominating checks (signer owner; address system_program; executable system_program; key operation_state; pda operation_state; writable operation_state; rent_exempt; writable owner; …)
- bundle/create_operation_account.ts:617 LAMPORT_TRANSFER: 4 dominating checks (signer owner; address system_program; executable system_program; key operation_state; pda operation_state; key)
- bundle/create_operation_account.ts:679 OWNER_ASSIGN, PDA_SIGNATURE: 4 dominating checks (signer owner; address system_program; executable system_program; key operation_state; pda operation_state; key)
- bundle/create_operation_account.ts:734 OWNER_ASSIGN, PDA_SIGNATURE: 4 dominating checks (signer owner; address system_program; executable system_program; key operation_state; pda operation_state; key)
- bundle/create_operation_account.ts:815 ACCOUNT_CREATE, PDA_SIGNATURE: 3 dominating checks (signer owner; address system_program; executable system_program; key operation_state; pda operation_state)

## Authority (who enables each value movement / authority change)

- bundle/create_operation_account.ts:617 LAMPORT_TRANSFER: signer owner (found)
- bundle/create_operation_account.ts:679 OWNER_ASSIGN, PDA_SIGNATURE: signer owner (found); pda PDA signature ? (1 seeds)
- bundle/create_operation_account.ts:734 OWNER_ASSIGN, PDA_SIGNATURE: signer owner (found); pda PDA signature ? (1 seeds)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/create_operation_account.ts:393 ACCOUNT_DATA_WRITE owner.data[8..9] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — owner: no discriminator check found
  - [found] write gated (signer / constraint) — signer owner accounts_create_operation_account:12; address/executable system_program accounts_create_operation_account:33; key/pda operation_state accounts_create_operation_account:56
- bundle/create_operation_account.ts:617 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer [LAMPORT_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer owner (found)
  - [found] amount arithmetic checked — sat_sub(n, g) (saturating)
  - [found] relevant checks on every path — 5 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/create_operation_account.ts:617 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer ⇐ signer owner (found)
- bundle/create_operation_account.ts:679 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer owner (found)
- bundle/create_operation_account.ts:679 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)
- bundle/create_operation_account.ts:734 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer owner (found)
- bundle/create_operation_account.ts:734 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/create_operation_account.ts:393 ACCOUNT_DATA_WRITE owner.data[8..9]: `i > 0xdc8` · ✗ `k != 0` · ✗ `k != 0` · ✗ `k != 0` · ✗ `k != 0` · ✗ `k != 0` · ✗ `k != 0` · ✗ `k != 0` · `k == 0` · `i > 7` · … 3 more
- bundle/create_operation_account.ts:617 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer: `av != -1` · `at != -1` · `u197 != -1` · `am != -1` · `u181 != -1` · `u57 != -1` · `n > g` · ✗ `(memcmp(s178, s158, 0x20) as u32) == 0` #8 · `g != 0` · `(memcmp(sc8, sf0, 0x20) as u32) == 0` #3 · … 4 more
- bundle/create_operation_account.ts:679 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign: `u269 != -1` · `bk != -1` · `u253 != -1` · `be != -1` · ✗ `(memcmp(s178, s158, 0x20) as u32) == 0` #8 · `g != 0` · `(memcmp(sc8, sf0, 0x20) as u32) == 0` #3 · ✗ `ld64(s58) != 0` · `f == 2` #2 · ✗ `k == 0` #1 · … 1 more
- bundle/create_operation_account.ts:734 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign: `cc != -1` · `bz != -1` · `u308 != -1` · `u304 != -1` · `ae == 2` · `u269 != -1` · `bk != -1` · `u253 != -1` · `be != -1` · ✗ `(memcmp(s178, s158, 0x20) as u32) == 0` #8 · … 6 more
- bundle/create_operation_account.ts:815 ACCOUNT_CREATE, PDA_SIGNATURE SYSTEM_PROGRAM.CreateAccount: `u91 != -1` · `x != -1` · `u74 != -1` · `s != -1` · `u61 != -1` · `j != -1` · ✗ `g != 0` · `(memcmp(sc8, sf0, 0x20) as u32) == 0` #3 · ✗ `ld64(s58) != 0` · `f == 2` #2 · … 2 more

## Arithmetic on value paths

- bundle/create_operation_account.ts:590 SYSTEM_PROGRAM.Transfer.lamports ← `sat_sub(n, g)`: saturating

## Relations (equalities the checks establish)

- system_program.key == (constant address) (address, found, bundle/create_operation_account.ts:156)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): owner.key
- owner.data: runtime (owner runtime @fn_4f238:38)
- operation_state.key: validated (pda found @accounts_create_operation_account:56, key found @accounts_create_operation_account:56)
- system_program.key: validated (address found @accounts_create_operation_account:33)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/create_operation_account.ts:135 | found | owner | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/create_operation_account.ts:139 | found |  | count | `k == 0` | anchor::AccountNotEnoughKeys |
| 2 | bundle/create_operation_account.ts:156 | found | system_program | address, executable (via try_accounts_18870 (count, address, executable)) | `f != 2` | return |
| 3 | bundle/create_operation_account.ts:179 | found | operation_state | key, pda | `!((memcmp(sc8, sf0, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 4 | bundle/create_operation_account.ts:185 | PARTIAL | operation_state | writable | `operation_state.is_writable == 0` | anchor::ConstraintMut |
| 5 | bundle/create_operation_account.ts:205 | PARTIAL |  | rent_exempt | `ad == 0` | anchor::ConstraintRentExempt |
| 6 | bundle/create_operation_account.ts:206 | PARTIAL | owner | writable | `owner.is_writable == 0` | anchor::ConstraintMut |
| 7 | bundle/create_operation_account.ts:362 | PARTIAL |  | writable | `g == 0` | anchor::AccountNotMutable |
| 8 | bundle/create_operation_account.ts:523 | PARTIAL |  | key | `(memcmp(s178, s158, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
