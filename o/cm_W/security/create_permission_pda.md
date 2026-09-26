# create_permission_pda

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_create_permission_pda (anchor); 40 functions reachable: ix_create_permission_pda, accounts_create_permission_pda, memcpy, fn_da208, anchor_error_from, fn_11e480, fn_14d660, fn_125710, fn_14ec00, fn_d8800, fn_147a20, fn_158340, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | owner | expected · found | expected · PARTIAL | — | — | — |
| 1 | permission_authority | — | — | — | — | — |
| 2 | permission | — | expected · PARTIAL | — | — | — |
| 3 | system_program | — | — | — | found | = 11111111… · expected · found |

## Constraints per account

- owner: signer found (bundle/create_permission_pda.ts:122 via try_accounts_17a30); writable PARTIAL (bundle/create_permission_pda.ts:202)
- permission_authority: count found (bundle/create_permission_pda.ts:126)
- permission: key found (bundle/create_permission_pda.ts:164); pda found (bundle/create_permission_pda.ts:164); writable PARTIAL (bundle/create_permission_pda.ts:180)
- system_program: address found (bundle/create_permission_pda.ts:139 via try_accounts_18870); executable found (bundle/create_permission_pda.ts:139 via try_accounts_18870)

## CPIs

- bundle/create_permission_pda.ts:675 [conditional] SYSTEM_PROGRAM (constant).Transfer — lamports: ld64(s3b0)
- bundle/create_permission_pda.ts:742 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: 0x118 — PDA signer: ? (1 seeds)
- bundle/create_permission_pda.ts:797 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: ld64(ld64(ld64(s368 + 0x38) + 0x30)) — PDA signer: ? (1 seeds)
- bundle/create_permission_pda.ts:882 [conditional] SYSTEM_PROGRAM (constant).CreateAccount — accounts from: ? s, to: ? — lamports: ld64(s368 + 0x30), 0x118, ld64(ld64(b + 0x30)) — PDA signer: ? (1 seeds)

## PDAs derived

- bundle/create_permission_pda.ts:156 find_program_address(["permission", *y], program *b)
- compared with provided accounts: permission found

## Dominance (checks on every path to the operation; across calls)

- bundle/create_permission_pda.ts:675 LAMPORT_TRANSFER: 4 dominating checks (signer owner; address system_program; executable system_program; key permission; pda permission; key)
- bundle/create_permission_pda.ts:742 OWNER_ASSIGN, PDA_SIGNATURE: 4 dominating checks (signer owner; address system_program; executable system_program; key permission; pda permission; key)
- bundle/create_permission_pda.ts:797 OWNER_ASSIGN, PDA_SIGNATURE: 4 dominating checks (signer owner; address system_program; executable system_program; key permission; pda permission; key)
- bundle/create_permission_pda.ts:882 ACCOUNT_CREATE, PDA_SIGNATURE: 3 dominating checks (signer owner; address system_program; executable system_program; key permission; pda permission)

## Authority (who enables each value movement / authority change)

- bundle/create_permission_pda.ts:675 LAMPORT_TRANSFER: signer owner (found)
- bundle/create_permission_pda.ts:742 OWNER_ASSIGN, PDA_SIGNATURE: signer owner (found); pda PDA signature ? (1 seeds)
- bundle/create_permission_pda.ts:797 OWNER_ASSIGN, PDA_SIGNATURE: signer owner (found); pda PDA signature ? (1 seeds)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/create_permission_pda.ts:675 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer [LAMPORT_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer owner (found)
  - [found] amount arithmetic checked — sat_sub(m, g) (saturating)
  - [found] relevant checks on every path — 5 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/create_permission_pda.ts:675 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer ⇐ signer owner (found)
- bundle/create_permission_pda.ts:742 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer owner (found)
- bundle/create_permission_pda.ts:742 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)
- bundle/create_permission_pda.ts:797 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer owner (found)
- bundle/create_permission_pda.ts:797 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/create_permission_pda.ts:675 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer: `aw != -1` · `au != -1` · `u205 != -1` · `an != -1` · `u189 != -1` · `u56 != -1` · `m > g` · ✗ `(memcmp(s2c0, s2a0, 0x20) as u32) == 0` #8 · `g != 0` · `(memcmp(s290, s2d8, 0x20) as u32) == 0` #3 · … 5 more
- bundle/create_permission_pda.ts:742 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign: `u282 != -1` · `bm != -1` · `u265 != -1` · `bg != -1` · ✗ `(memcmp(s2c0, s2a0, 0x20) as u32) == 0` #8 · `g != 0` · `(memcmp(s290, s2d8, 0x20) as u32) == 0` #3 · ✗ `ld64(s270) != 0` · `f == 2` #2 · ✗ `k == 1` · … 2 more
- bundle/create_permission_pda.ts:797 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign: `cb != -1` · `bz != -1` · `u329 != -1` · `u325 != -1` · `af == 2` · `u282 != -1` · `bm != -1` · `u265 != -1` · `bg != -1` · ✗ `(memcmp(s2c0, s2a0, 0x20) as u32) == 0` #8 · … 7 more
- bundle/create_permission_pda.ts:882 ACCOUNT_CREATE, PDA_SIGNATURE SYSTEM_PROGRAM.CreateAccount: `u92 != -1` · `y != -1` · `u75 != -1` · `s != -1` · `u61 != -1` · `u21 != -1` · ✗ `g != 0` · `(memcmp(s290, s2d8, 0x20) as u32) == 0` #3 · ✗ `ld64(s270) != 0` · `f == 2` #2 · … 3 more

## Arithmetic on value paths

- bundle/create_permission_pda.ts:646 SYSTEM_PROGRAM.Transfer.lamports ← `sat_sub(m, g)`: saturating

## Relations (equalities the checks establish)

- system_program.key == (constant address) (address, found, bundle/create_permission_pda.ts:139)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): owner.key, permission_authority.key
- permission.key: validated (pda found @accounts_create_permission_pda:54, key found @accounts_create_permission_pda:54)
- system_program.key: validated (address found @accounts_create_permission_pda:29)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/create_permission_pda.ts:122 | found | owner | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/create_permission_pda.ts:126 | found | permission_authority | count | `k == 0` | anchor::AccountNotEnoughKeys |
| 2 | bundle/create_permission_pda.ts:139 | found | system_program | address, executable (via try_accounts_18870 (count, address, executable)) | `f != 2` | return |
| 3 | bundle/create_permission_pda.ts:164 | found | permission | key, pda | `!((memcmp(s290, s2d8, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 4 | bundle/create_permission_pda.ts:180 | PARTIAL | permission | writable | `permission.is_writable == 0` | anchor::ConstraintMut |
| 5 | bundle/create_permission_pda.ts:201 | PARTIAL |  | rent_exempt | `am == 0` | anchor::ConstraintRentExempt |
| 6 | bundle/create_permission_pda.ts:202 | PARTIAL | owner | writable | `owner.is_writable == 0` | anchor::ConstraintMut |
| 7 | bundle/create_permission_pda.ts:207 | PARTIAL |  | key | `!((memcmp(s270, 0x100159640 /* key RayzVBPm6p6xtG7fU3KX4k44UexK4NjewDk2QCwoLqa */, 0x20) as u32) != ` | return |
| 8 | bundle/create_permission_pda.ts:578 | PARTIAL |  | key | `(memcmp(s2c0, s2a0, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 9 | bundle/create_permission_pda.ts:1081 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 10 | bundle/create_permission_pda.ts:1090 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
