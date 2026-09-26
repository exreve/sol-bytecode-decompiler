# close_position_with_token_extensions

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_close_position_with_token_extensions (anchor); 50 functions reachable: ix_close_position_with_token_extensions, accounts_close_position_with_token_extensions, memcpy, fn_310a0, fn_8d1d0, fn_147990, fn_11f980, fn_139720, fn_149678, fn_9540, fn_145330, fn_14c5c0, ….

## Findings (rule engine)

- [low] signer-not-related-to-authority: Value movement or authority change with a signer but no relation between the signer key and a stored authority field. st64(ld64(m + 0x18), 0) · signers: position_authority (found) (fn_13aee8:23)

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | position_authority [str] | found | — | — | — | — |
| 1 | receiver [str] | — | found | — | — | — |
| 2 | position [str] | — | found | found (+discriminator found) | — | — |
| 3 | position_mint [str] | — | found | found (+discriminator found) | — | found |
| 4 | position_token_account [str] | — | found | found (+discriminator found) | — | — |
| 5 | token_2022_program [str] | — | — | — | found | found |

## Constraints per account

- position_authority: signer found (bundle/close_position_with_token_extensions.ts:161 via try_accounts_11718)
- receiver: count found (bundle/close_position_with_token_extensions.ts:171); writable found (bundle/close_position_with_token_extensions.ts:246)
- position: owner found (bundle/close_position_with_token_extensions.ts:193 via try_accounts_11b00); initialized found (bundle/close_position_with_token_extensions.ts:193 via try_accounts_11b00); discriminator found (bundle/close_position_with_token_extensions.ts:193 via try_accounts_11b00); key found (bundle/close_position_with_token_extensions.ts:266); pda found (bundle/close_position_with_token_extensions.ts:266); writable found (bundle/close_position_with_token_extensions.ts:286); close found (bundle/close_position_with_token_extensions.ts:299)
- position_mint: owner found (bundle/close_position_with_token_extensions.ts:206 via try_accounts_610); discriminator found (bundle/close_position_with_token_extensions.ts:206 via try_accounts_610); initialized found (bundle/close_position_with_token_extensions.ts:206 via try_accounts_610); writable found (bundle/close_position_with_token_extensions.ts:310); key found (bundle/close_position_with_token_extensions.ts:323); address found (bundle/close_position_with_token_extensions.ts:340)
- position_token_account: owner found (bundle/close_position_with_token_extensions.ts:225 via try_accounts_558); discriminator found (bundle/close_position_with_token_extensions.ts:225 via try_accounts_558); initialized found (bundle/close_position_with_token_extensions.ts:225 via try_accounts_558); writable found (bundle/close_position_with_token_extensions.ts:341); raw found (bundle/close_position_with_token_extensions.ts:351); key found (bundle/close_position_with_token_extensions.ts:361)
- token_2022_program: address found (bundle/close_position_with_token_extensions.ts:244 via fn_12be8); executable found (bundle/close_position_with_token_extensions.ts:244 via fn_12be8); key found (bundle/close_position_with_token_extensions.ts:363)

## CPIs

- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))

## PDAs derived

- bundle/close_position_with_token_extensions.ts:260 find_program_address(["position", *y], program *(ld64(s580 + 0x20)))
- compared with provided accounts: position found

## Operations (account writes)

- bundle/close_position_with_token_extensions.ts:1139 LAMPORT_WRITE receiver.lamports += f + g [conditional]
- bundle/close_position_with_token_extensions.ts:1145 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports = 0 [conditional]
- bundle/close_position_with_token_extensions.ts:1437 ACCOUNT_REALLOC b.data.len = c
- bundle/close_position_with_token_extensions.ts:1436 ACCOUNT_DATA_WRITE token_badge.data[-8..0] = c [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/close_position_with_token_extensions.ts:1139 LAMPORT_WRITE: 23 dominating checks (signer position_authority; owner position; initialized position; discriminator position; owner position_mint; discriminator position_mint; initialized position_mint; owner position_token_account; …)
- bundle/close_position_with_token_extensions.ts:1145 LAMPORT_WRITE, ACCOUNT_CLOSE: 23 dominating checks (signer position_authority; owner position; initialized position; discriminator position; owner position_mint; discriminator position_mint; initialized position_mint; owner position_token_account; …)
- entrypoint.ts:14045 CPI: 23 dominating checks (signer position_authority; owner position; initialized position; discriminator position; owner position_mint; discriminator position_mint; initialized position_mint; owner position_token_account; …)
- bundle/close_position_with_token_extensions.ts:1437 ACCOUNT_REALLOC: 24 dominating checks (signer position_authority; owner position; initialized position; discriminator position; owner position_mint; discriminator position_mint; initialized position_mint; owner position_token_account; …)
- bundle/close_position_with_token_extensions.ts:1436 ACCOUNT_DATA_WRITE: 24 dominating checks (signer position_authority; owner position; initialized position; discriminator position; owner position_mint; discriminator position_mint; initialized position_mint; owner position_token_account; …)

## Authority (who enables each value movement / authority change)

- bundle/close_position_with_token_extensions.ts:1145 LAMPORT_WRITE, ACCOUNT_CLOSE: signer position_authority (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/close_position_with_token_extensions.ts:1139 LAMPORT_WRITE receiver.lamports [LAMPORT_WRITE +=]
  - [NOT FOUND] recipient bound — receiver: no pda / address / key / has_one / associated / signer check found
  - [found] amount arithmetic checked — f + g (checked)
  - [found] relevant checks on every path — 25 dominating checks
- bundle/close_position_with_token_extensions.ts:1145 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports [ACCOUNT_CLOSE]
  - [found] authorized (signer / PDA signature / stored authority) — signer position_authority (found)
  - [found] data zeroed / closed discriminator / owner reassigned — AccountInfo::assign / realloc in fn_13aee8
  - [found] not reopened (no realloc after the close) — no realloc after it in the instruction
  - [found] relevant checks on every path — 25 dominating checks
- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 25 dominating checks
- bundle/close_position_with_token_extensions.ts:1436 ACCOUNT_DATA_WRITE token_badge.data[-8..0] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — token_badge: not an identified account
  - [found] write gated (signer / constraint) — signer position_authority accounts_close_position_with_token_extensions:11; address/executable token_2022_program accounts_close_position_with_token_extensions:94; key/pda position accounts_close_position_with_token_extensions:116

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/close_position_with_token_extensions.ts:1145 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports ⇐ signer position_authority (found)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/close_position_with_token_extensions.ts:1139 LAMPORT_WRITE receiver.lamports: `j == 0` · ✗ `(h & 1) != 0` · `u26 != -1` · `u22 != -1` · `u10 != -1` · `u6 != -1` · `i == 2` · ✗ `f == 2`
- bundle/close_position_with_token_extensions.ts:1145 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports: `n == 0` · `j == 0` · ✗ `(h & 1) != 0` · `u26 != -1` · `u22 != -1` · `u10 != -1` · `u6 != -1` · `i == 2` · ✗ `f == 2`
- entrypoint.ts:14045 CPI: `u459 != -1` · `u449 != -1` · `u444 != -1` · `u435 != -1` · `u428 != -1` · `u419 != -1` · `u414 != -1` · `u410 != -1` · ✗ `co == 0x8000000000000000` · `u373 != -1` · … 30 more (budget reached)
- bundle/close_position_with_token_extensions.ts:1437 ACCOUNT_REALLOC b.data.len: ✗ `sat_sub(c, ld32(b.key - 4)) > 0x2800` #28 · ✗ `g == c` · ✗ `f.borrow != 0` · `n == 0` · `j == 0` · ✗ `(h & 1) != 0` · `u26 != -1` · `u22 != -1` · `u10 != -1` · `u6 != -1` · … 2 more
- bundle/close_position_with_token_extensions.ts:1436 ACCOUNT_DATA_WRITE token_badge.data[-8..0]: ✗ `sat_sub(c, ld32(b.key - 4)) > 0x2800` #28 · ✗ `g == c` · ✗ `f.borrow != 0` · `n == 0` · `j == 0` · ✗ `(h & 1) != 0` · `u26 != -1` · `u22 != -1` · `u10 != -1` · `u6 != -1` · … 2 more

## Arithmetic on value paths

- bundle/close_position_with_token_extensions.ts:1139 receiver.lamports ← `f + g`: checked — guard `(h & 1) != 0` (bundle/close_position_with_token_extensions.ts:1130)

## Relations (equalities the checks establish)

- token_2022_program.key == (constant address) (address, found, bundle/close_position_with_token_extensions.ts:244)
- position_mint.key == (constant address) (address, found, bundle/close_position_with_token_extensions.ts:340)
- position.data == position_mint.key (field_eq, found, bundle/close_position_with_token_extensions.ts:340)
- token_2022_program.key == (constant address) (address, found, bundle/close_position_with_token_extensions.ts:363)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): position_authority.key, receiver.key
- position.key: validated (pda found @accounts_close_position_with_token_extensions:116, key found @accounts_close_position_with_token_extensions:116)
- position.data: validated (owner found @accounts_close_position_with_token_extensions:43, discriminator found @accounts_close_position_with_token_extensions:43, initialized found @accounts_close_position_with_token_extensions:43)
- position_mint.key: validated (address found @accounts_close_position_with_token_extensions:190, key found @accounts_close_position_with_token_extensions:173)
- position_mint.data: validated (owner found @accounts_close_position_with_token_extensions:56, discriminator found @accounts_close_position_with_token_extensions:56, initialized found @accounts_close_position_with_token_extensions:56)
- position_token_account.key: validated (key found @accounts_close_position_with_token_extensions:211)
- position_token_account.data: validated (owner found @accounts_close_position_with_token_extensions:75, discriminator found @accounts_close_position_with_token_extensions:75, initialized found @accounts_close_position_with_token_extensions:75)
- token_2022_program.key: validated (address found @accounts_close_position_with_token_extensions:94, key found @accounts_close_position_with_token_extensions:213)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/close_position_with_token_extensions.ts:161 | found | position_authority | signer (via try_accounts_11718 (count, signer)) | `f != 2` | return |
| 1 | bundle/close_position_with_token_extensions.ts:171 | found | receiver | count | `g == 0` | anchor::AccountNotEnoughKeys |
| 2 | bundle/close_position_with_token_extensions.ts:193 | found | position | owner, initialized, discriminator (via try_accounts_11b00 (count, owner, initialized, discriminator)) | `position == 0` | return |
| 3 | bundle/close_position_with_token_extensions.ts:206 | found | position_mint | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `r == 2` | return |
| 4 | bundle/close_position_with_token_extensions.ts:225 | found | position_token_account | owner, discriminator, initialized (via try_accounts_558 (count, owner, discriminator, initialized)) | `s == 2` | return |
| 5 | bundle/close_position_with_token_extensions.ts:244 | found | token_2022_program | address, executable (via fn_12be8 (count, address, executable)) | `v != 2` | return |
| 6 | bundle/close_position_with_token_extensions.ts:246 | found | receiver | writable | `receiver.is_writable == 0` | anchor::ConstraintMut |
| 7 | bundle/close_position_with_token_extensions.ts:266 | found | position | key, pda | `(memcmp(s138, s60, 0x20) as u32) != 0` | anchor::ConstraintSeeds |
| 8 | bundle/close_position_with_token_extensions.ts:286 | found | position | writable | `position.is_writable == 0` | anchor::ConstraintMut |
| 9 | bundle/close_position_with_token_extensions.ts:299 | found | position | key, close | `(memcmp(s20, s138, 0x20) as u32) == 0` | anchor::ConstraintClose |
| 10 | bundle/close_position_with_token_extensions.ts:310 | found | position_mint | writable | `position_mint.is_writable == 0` | anchor::ConstraintMut |
| 11 | bundle/close_position_with_token_extensions.ts:323 | found | position_mint | key, owner | `(memcmp(ad, s20, 0x20) as u32) != 0` | anchor::ConstraintOwner |
| 12 | bundle/close_position_with_token_extensions.ts:340 | found | position_mint | key, address | `!((memcmp(s40, s20, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 13 | bundle/close_position_with_token_extensions.ts:341 | found | position_token_account | writable | `ld8(ld64(s200 + 0x10) + 0x29) == 0` | anchor::ConstraintMut |
| 14 | bundle/close_position_with_token_extensions.ts:351 | found | position_token_account | raw | `ld64(s1e8 + 0x40) != 1` | anchor::ConstraintRaw |
| 15 | bundle/close_position_with_token_extensions.ts:361 | found | position_token_account | key, raw | `!((memcmp(s1e8, s320, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 16 | bundle/close_position_with_token_extensions.ts:363 | found | token_2022_program | key, address | `(memcmp(s20, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 17 | bundle/close_position_with_token_extensions.ts:533 | PARTIAL | position |  | `v != 2` | return |
| 18 | bundle/close_position_with_token_extensions.ts:583 | PARTIAL | position_token_account |  | `ah != 0x800000000000001a /* Ok */` | return |
| 19 | bundle/close_position_with_token_extensions.ts:589 | PARTIAL | position_token_account |  | `aj != 2` | return |
| 20 | entrypoint.ts:618 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 21 | entrypoint.ts:627 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 22 | bundle/close_position_with_token_extensions.ts:610 | found |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 23 | bundle/close_position_with_token_extensions.ts:615 | found |  | key, address | `(memcmp(h, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0` | anchor::InvalidProgramId |
| 24 | bundle/close_position_with_token_extensions.ts:625 | found | g? | executable | `g.executable == 0` | anchor::InvalidProgramExecutable |
| 25 | entrypoint.ts:13514 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 26 | bundle/close_position_with_token_extensions.ts:1208 | found |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 27 | bundle/close_position_with_token_extensions.ts:1314 | found |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 28 | bundle/close_position_with_token_extensions.ts:1430 | PARTIAL | b? | key | `sat_sub(c, ld32(b.key - 4)) > 0x2800` | Err(ProgramError::InvalidRealloc) |
