# close_position

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_close_position (anchor); 41 functions reachable: ix_close_position, accounts_close_position, fn_28d58, fn_a8b80, anchor_error_from, fn_14b198, fn_14ed60, fn_153158, memset2, fn_14d660, fn_125710, fn_11e480, ….

## Look first

- ⚠ personal_position: pda expected, no check found
- ⚠ personal_position: writable expected, no check found

## Findings (rule engine)

- [low] signer-not-related-to-authority: Value movement or authority change with a signer but no relation between the signer key and a stored authority field. st64(ld64(l + 0x18), 0) · signers: nft_owner (found) (fn_13e190:21)
- [low] signer-not-related-to-authority: Value movement or authority change with a signer but no relation between the signer key and a stored authority field. st64(ld64(l + 0x18), 0) · signers: nft_owner (found) (fn_13e190:21)

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | nft_owner | expected · found | expected · found | — | — | — |
| 1 | position_nft_mint | — | expected · found | found (+discriminator found) | — | — |
| 2 | position_nft_account | — | expected · found | found (+discriminator found) | — | — |
| 3 | personal_position | — | expected · NOT FOUND | found (+discriminator found) | — | — |
| 4 | system_program | — | — | — | found | = 11111111… · expected · found |
| 5 | token_program | — | — | — | — | — |

## Constraints per account

- nft_owner: signer found (bundle/close_position.ts:195 via try_accounts_17a30); writable found (bundle/close_position.ts:311)
- position_nft_mint: owner found (bundle/close_position.ts:198 via try_accounts_15c0); discriminator found (bundle/close_position.ts:198 via try_accounts_15c0); initialized found (bundle/close_position.ts:198 via try_accounts_15c0); writable found (bundle/close_position.ts:313); key PARTIAL (bundle/close_position.ts:855)
- position_nft_account: owner found (bundle/close_position.ts:235 via try_accounts_1678); discriminator found (bundle/close_position.ts:235 via try_accounts_1678); initialized found (bundle/close_position.ts:235 via try_accounts_1678); writable found (bundle/close_position.ts:337); key PARTIAL (bundle/close_position.ts:888)
- personal_position: owner found (bundle/close_position.ts:279 via try_accounts_18368); initialized found (bundle/close_position.ts:279 via try_accounts_18368); discriminator found (bundle/close_position.ts:279 via try_accounts_18368); writable NOT FOUND; pda NOT FOUND
- system_program: address found (bundle/close_position.ts:292 via try_accounts_18870); executable found (bundle/close_position.ts:292 via try_accounts_18870)
- token_program: no checks found

## CPIs

- bundle/close_position.ts:1987 [conditional] TOKEN_2022_PROGRAM (constant).CloseAccount — accounts account: ?, destination: ?, authority: ? s — PDA signer: ? (an seeds)
- bundle/close_position.ts:2052 [conditional] TOKEN_2022_PROGRAM (constant).Burn — accounts mint: ?, from: ? s, authority: nft_owner s — amount: h — PDA signer: ? (ao seeds)
- bundle/close_position.ts:2113 [conditional] TOKEN_2022_PROGRAM (constant).CloseAccount — accounts account: ?, destination: nft_owner, authority: nft_owner s — PDA signer: ? (an seeds)

## PDAs derived

- bundle/close_position.ts:361 find_program_address(["position", *ao], program *(ld64(s3a8 + 0x30)))
- compared with provided accounts: personal_position NOT FOUND

## Operations (account writes)

- bundle/close_position.ts:2160 LAMPORT_WRITE owner.lamports += k [conditional]
- bundle/close_position.ts:2166 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports = 0 [conditional]
- bundle/close_position.ts:2166 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports = 0 [conditional]
- bundle/close_position.ts:2160 LAMPORT_WRITE nft_owner.lamports += k [conditional]
- bundle/close_position.ts:2160 LAMPORT_WRITE admin.lamports += k [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/close_position.ts:1987 ACCOUNT_CLOSE, PDA_SIGNATURE: 24 dominating checks (signer nft_owner; owner position_nft_mint; discriminator position_nft_mint; initialized position_nft_mint; owner position_nft_account; discriminator position_nft_account; initialized position_nft_account; owner personal_position; …)
- bundle/close_position.ts:2052 BURN, PDA_SIGNATURE: 20 dominating checks (signer nft_owner; owner position_nft_mint; discriminator position_nft_mint; initialized position_nft_mint; owner position_nft_account; discriminator position_nft_account; initialized position_nft_account; owner personal_position; …)
  - sources: authority ← nft_owner.key (caller-controlled)
- bundle/close_position.ts:2113 ACCOUNT_CLOSE, PDA_SIGNATURE: 21 dominating checks (signer nft_owner; owner position_nft_mint; discriminator position_nft_mint; initialized position_nft_mint; owner position_nft_account; discriminator position_nft_account; initialized position_nft_account; owner personal_position; …)
  - sources: destination ← nft_owner.key (caller-controlled); authority ← nft_owner.key (caller-controlled)
- bundle/close_position.ts:2160 LAMPORT_WRITE: 26 dominating checks (signer nft_owner; owner position_nft_mint; discriminator position_nft_mint; initialized position_nft_mint; owner position_nft_account; discriminator position_nft_account; initialized position_nft_account; owner personal_position; …)
- bundle/close_position.ts:2166 LAMPORT_WRITE, ACCOUNT_CLOSE: 26 dominating checks (signer nft_owner; owner position_nft_mint; discriminator position_nft_mint; initialized position_nft_mint; owner position_nft_account; discriminator position_nft_account; initialized position_nft_account; owner personal_position; …)
- bundle/close_position.ts:2166 LAMPORT_WRITE, ACCOUNT_CLOSE: 26 dominating checks (signer nft_owner; owner position_nft_mint; discriminator position_nft_mint; initialized position_nft_mint; owner position_nft_account; discriminator position_nft_account; initialized position_nft_account; owner personal_position; …)
- bundle/close_position.ts:2160 LAMPORT_WRITE: 26 dominating checks (signer nft_owner; owner position_nft_mint; discriminator position_nft_mint; initialized position_nft_mint; owner position_nft_account; discriminator position_nft_account; initialized position_nft_account; owner personal_position; …)
- bundle/close_position.ts:2160 LAMPORT_WRITE: 26 dominating checks (signer nft_owner; owner position_nft_mint; discriminator position_nft_mint; initialized position_nft_mint; owner position_nft_account; discriminator position_nft_account; initialized position_nft_account; owner personal_position; …)

## Authority (who enables each value movement / authority change)

- bundle/close_position.ts:1987 ACCOUNT_CLOSE, PDA_SIGNATURE: signer nft_owner (found); pda PDA signature ? (an seeds)
- bundle/close_position.ts:2052 BURN, PDA_SIGNATURE: signer nft_owner (found); pda PDA signature ? (ao seeds)
- bundle/close_position.ts:2113 ACCOUNT_CLOSE, PDA_SIGNATURE: signer nft_owner (found); pda PDA signature ? (an seeds)
- bundle/close_position.ts:2166 LAMPORT_WRITE, ACCOUNT_CLOSE: signer nft_owner (found)
- bundle/close_position.ts:2166 LAMPORT_WRITE, ACCOUNT_CLOSE: signer nft_owner (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/close_position.ts:1987 ACCOUNT_CLOSE, PDA_SIGNATURE TOKEN_2022_PROGRAM.CloseAccount [ACCOUNT_CLOSE]
  - [found] authorized (signer / PDA signature / stored authority) — signer nft_owner (found); pda PDA signature ? (an seeds)
  - [runtime] data zeroed / closed discriminator / owner reassigned — closed by TOKEN_2022_PROGRAM
  - [found] not reopened (no realloc after the close) — no realloc after it in the instruction
  - [found] relevant checks on every path — 24 dominating checks
- bundle/close_position.ts:2052 BURN, PDA_SIGNATURE TOKEN_2022_PROGRAM.Burn [BURN]
  - [found] burn authority is a signer or PDA — PDA signature ? (ao seeds)
  - [NOT FOUND] mint account bound — account not identified
  - [NOT FOUND] token account bound — account not identified
  - [found] relevant checks on every path — 20 dominating checks
- bundle/close_position.ts:2113 ACCOUNT_CLOSE, PDA_SIGNATURE TOKEN_2022_PROGRAM.CloseAccount [ACCOUNT_CLOSE]
  - [found] authorized (signer / PDA signature / stored authority) — signer nft_owner (found); pda PDA signature ? (an seeds)
  - [runtime] data zeroed / closed discriminator / owner reassigned — closed by TOKEN_2022_PROGRAM
  - [found] not reopened (no realloc after the close) — no realloc after it in the instruction
  - [found] relevant checks on every path — 21 dominating checks
- bundle/close_position.ts:2160 LAMPORT_WRITE owner.lamports [LAMPORT_WRITE +=]
  - [NOT FOUND] recipient bound — owner: not an identified account
  - [found] amount arithmetic checked — h + g (checked)
  - [found] relevant checks on every path — 26 dominating checks
- bundle/close_position.ts:2166 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports [ACCOUNT_CLOSE]
  - [found] authorized (signer / PDA signature / stored authority) — signer nft_owner (found)
  - [found] data zeroed / closed discriminator / owner reassigned — AccountInfo::assign / realloc in fn_13e190
  - [found] not reopened (no realloc after the close) — no realloc after it in the instruction
  - [found] relevant checks on every path — 26 dominating checks
- bundle/close_position.ts:2166 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports [ACCOUNT_CLOSE]
  - [found] authorized (signer / PDA signature / stored authority) — signer nft_owner (found)
  - [found] data zeroed / closed discriminator / owner reassigned — AccountInfo::assign / realloc in fn_13e190
  - [found] not reopened (no realloc after the close) — no realloc after it in the instruction
  - [found] relevant checks on every path — 26 dominating checks
- bundle/close_position.ts:2160 LAMPORT_WRITE nft_owner.lamports [LAMPORT_WRITE +=]
  - [found] recipient bound — nft_owner: signer found
  - [found] amount arithmetic checked — h + g (checked)
  - [found] relevant checks on every path — 26 dominating checks
- bundle/close_position.ts:2160 LAMPORT_WRITE admin.lamports [LAMPORT_WRITE +=]
  - [NOT FOUND] recipient bound — admin: not an identified account
  - [found] amount arithmetic checked — h + g (checked)
  - [found] relevant checks on every path — 26 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/close_position.ts:1987 ACCOUNT_CLOSE, PDA_SIGNATURE TOKEN_2022_PROGRAM.CloseAccount ⇐ signer nft_owner (found)
- bundle/close_position.ts:1987 ACCOUNT_CLOSE, PDA_SIGNATURE TOKEN_2022_PROGRAM.CloseAccount ⇐ pda PDA signature ? (an seeds)
- bundle/close_position.ts:2052 BURN, PDA_SIGNATURE TOKEN_2022_PROGRAM.Burn ⇐ signer nft_owner (found)
- bundle/close_position.ts:2052 BURN, PDA_SIGNATURE TOKEN_2022_PROGRAM.Burn ⇐ pda PDA signature ? (ao seeds)
- bundle/close_position.ts:2113 ACCOUNT_CLOSE, PDA_SIGNATURE TOKEN_2022_PROGRAM.CloseAccount ⇐ signer nft_owner (found)
- bundle/close_position.ts:2113 ACCOUNT_CLOSE, PDA_SIGNATURE TOKEN_2022_PROGRAM.CloseAccount ⇐ pda PDA signature ? (an seeds)
- bundle/close_position.ts:2166 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports ⇐ signer nft_owner (found)
- bundle/close_position.ts:2166 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports ⇐ signer nft_owner (found)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/close_position.ts:1987 ACCOUNT_CLOSE, PDA_SIGNATURE TOKEN_2022_PROGRAM.CloseAccount: `u59 != -1` · `u50 != -1` · `u43 != -1` · `u33 != -1` · `u27 != -1` · `u19 != -1` · `u11 != -1` · `u5 != -1` · ✗ `ld64(s118) != 0` · `n == 2` · … 16 more
- bundle/close_position.ts:2052 BURN, PDA_SIGNATURE TOKEN_2022_PROGRAM.Burn: `u60 != -1` · `u53 != -1` · `u45 != -1` · `u34 != -1` · `u29 != -1` · `u20 != -1` · `u9 != -1` · `u5 != -1` · `ak != -1` · `u135 != -1` · … 11 more
- bundle/close_position.ts:2113 ACCOUNT_CLOSE, PDA_SIGNATURE TOKEN_2022_PROGRAM.CloseAccount: `u59 != -1` · `u50 != -1` · `u43 != -1` · `u33 != -1` · `u27 != -1` · `u19 != -1` · `u11 != -1` · `u5 != -1` · `n == 2` · `ak != -1` · … 12 more
- bundle/close_position.ts:2160 LAMPORT_WRITE owner.lamports: `j == 0` · ✗ `f > f + h` · `u62 != -1` · `u58 != -1` · `u46 != -1` · `u42 != -1` · `j == 2` · ✗ `g == 0`
- bundle/close_position.ts:2166 LAMPORT_WRITE, ACCOUNT_CLOSE permission.lamports: `m == 0` · `j == 0` · ✗ `f > f + h` · `u62 != -1` · `u58 != -1` · `u46 != -1` · `u42 != -1` · `j == 2` · ✗ `g == 0`
- bundle/close_position.ts:2166 LAMPORT_WRITE, ACCOUNT_CLOSE support_mint_associated.lamports: `m == 0` · `j == 0` · ✗ `f > f + h` · `u62 != -1` · `u58 != -1` · `u46 != -1` · `u42 != -1` · `j == 2` · ✗ `g == 0`
- bundle/close_position.ts:2160 LAMPORT_WRITE nft_owner.lamports: `j == 0` · ✗ `f > f + h` · `u62 != -1` · `u58 != -1` · `u46 != -1` · `u42 != -1` · `j == 2` · ✗ `g == 0`
- bundle/close_position.ts:2160 LAMPORT_WRITE admin.lamports: `j == 0` · ✗ `f > f + h` · `u62 != -1` · `u58 != -1` · `u46 != -1` · `u42 != -1` · `j == 2` · ✗ `g == 0`

## Arithmetic on value paths

- bundle/close_position.ts:2158 owner.lamports ← `h + g`: checked — guard `f > f + h` (bundle/close_position.ts:2152)
- bundle/close_position.ts:2158 nft_owner.lamports ← `h + g`: checked — guard `f > f + h` (bundle/close_position.ts:2152)
- bundle/close_position.ts:2158 admin.lamports ← `h + g`: checked — guard `f > f + h` (bundle/close_position.ts:2152)

## Relations (equalities the checks establish)

- system_program.key == (constant address) (address, found, bundle/close_position.ts:292)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): nft_owner.key, personal_position.key, token_program.key
- position_nft_mint.key: partially-validated (key partial @fn_a8b80:7)
- position_nft_mint.data: validated (owner found @accounts_close_position:14, discriminator found @accounts_close_position:14, initialized found @accounts_close_position:14)
- position_nft_account.key: partially-validated (key partial @fn_a8b80:40)
- position_nft_account.data: validated (owner found @accounts_close_position:51, discriminator found @accounts_close_position:51, initialized found @accounts_close_position:51)
- personal_position.data: validated (owner found @accounts_close_position:95, discriminator found @accounts_close_position:95, initialized found @accounts_close_position:95)
- system_program.key: validated (address found @accounts_close_position:108)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/close_position.ts:195 | found | nft_owner | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/close_position.ts:198 | found | position_nft_mint | owner, discriminator, initialized (via try_accounts_15c0 (count, owner, discriminator, initialized)) | `ld32(s120) == 2` | return |
| 2 | bundle/close_position.ts:235 | found | position_nft_account | owner, discriminator, initialized (via try_accounts_1678 (count, owner, discriminator, initialized)) | `ld32(s100 + 0x90) == 2` | return |
| 3 | bundle/close_position.ts:279 | found | personal_position | owner, initialized, discriminator (via try_accounts_18368 (count, owner, initialized, discriminator)) | `!(ld64(s120) != 0)` | return |
| 4 | bundle/close_position.ts:292 | found | system_program | address, executable (via try_accounts_18870 (count, address, executable)) | `f != 2` | return |
| 5 | bundle/close_position.ts:311 | found | nft_owner | writable | `nft_owner.is_writable == 0` | anchor::ConstraintMut |
| 6 | bundle/close_position.ts:313 | found | position_nft_mint | writable | `position_nft_mint.is_writable == 0` | anchor::ConstraintMut |
| 7 | bundle/close_position.ts:318 | found |  | key, address | `(memcmp(s200, s1e0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 8 | bundle/close_position.ts:337 | found | position_nft_account | writable | `position_nft_account.is_writable == 0` | anchor::ConstraintMut |
| 9 | bundle/close_position.ts:338 | found |  | raw | `ld64(aj + 0x68) != 1` | anchor::ConstraintRaw |
| 10 | bundle/close_position.ts:351 | found |  | key, token_owner | `!((memcmp(aj + 0x48, s1a0, 0x20) as u32) == 0)` | anchor::ConstraintTokenOwner |
| 11 | bundle/close_position.ts:354 | found |  | key, token_mint | `!((memcmp(aj + 0x28, s120, 0x20) as u32) == 0)` | anchor::ConstraintTokenMint |
| 12 | bundle/close_position.ts:357 | found |  | token_program | `!((memcmp(ld64(ld64(s3b8) + 0x18), s120, 0x20) as u32) == 0)` | anchor::ConstraintTokenTokenProgram |
| 13 | bundle/close_position.ts:369 | found |  | key, pda | `!((memcmp(s120, s180, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 14 | bundle/close_position.ts:370 | found |  | writable | `!(ld8(ld64(s3a8 + 0x30) + 0x29) != 0)` | anchor::ConstraintMut |
| 15 | bundle/close_position.ts:374 | found |  | close | `t == 0` | anchor::ConstraintClose |
| 16 | bundle/close_position.ts:566 | found |  | custom | `!((h \| i) == 0 && (ld64(g + 0x78) == 0 && ld64(g + 0x80) == 0))` | error::ClosePositionErr |
| 17 | bundle/close_position.ts:570 | found |  | custom | `j != 0` | error::ClosePositionErr |
| 18 | bundle/close_position.ts:642 | PARTIAL |  | custom | `(memcmp(s138, ld64(accounts + 0x18) + 0x28, 0x20) as u32) != 0` | error::NotApproved |
| 19 | bundle/close_position.ts:855 | PARTIAL | position_nft_mint | key | `(memcmp(f + 0x60, c, 0x20) as u32) == 0 && (common_is_closed(g) == 0 && ld64(ld64(g + 0x10) + 0x10) ` | Err(ProgramError::AccountBorrowFailed) |
| 20 | bundle/close_position.ts:888 | PARTIAL | position_nft_account | key | `(memcmp(i, c, 0x20) as u32) == 0 && (common_is_closed(j) == 0 && ld64(ld64(j + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 21 | entrypoint.ts:487 | found |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 22 | entrypoint.ts:496 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 23 | bundle/close_position.ts:1838 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 24 | bundle/close_position.ts:1856 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 25 | bundle/close_position.ts:1864 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 26 | bundle/close_position.ts:1904 | PARTIAL |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 27 | bundle/close_position.ts:1915 | PARTIAL |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 28 | entrypoint.ts:743 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 29 | entrypoint.ts:4149 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 30 | entrypoint.ts:3913 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 31 | entrypoint.ts:3993 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
