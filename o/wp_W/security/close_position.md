# close_position

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_close_position (anchor); 43 functions reachable: ix_close_position, accounts_close_position, memcpy, fn_5ffd0, fn_65a18, fn_8b758, fn_83340, fn_87828, fn_149678, fn_11f980, fn_147990, fn_139720, ….

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
| 5 | token_program [str] | — | — | — | found | found |

## Constraints per account

- position_authority: signer found (bundle/close_position.ts:173 via try_accounts_11718)
- receiver: count found (bundle/close_position.ts:183); writable found (bundle/close_position.ts:252)
- position: owner found (bundle/close_position.ts:205 via try_accounts_11b00); initialized found (bundle/close_position.ts:205 via try_accounts_11b00); discriminator found (bundle/close_position.ts:205 via try_accounts_11b00); key found (bundle/close_position.ts:272); pda found (bundle/close_position.ts:272); writable found (bundle/close_position.ts:292); close found (bundle/close_position.ts:307)
- position_mint: owner found (bundle/close_position.ts:218 via try_accounts_11e98); discriminator found (bundle/close_position.ts:218 via try_accounts_11e98); initialized found (bundle/close_position.ts:218 via try_accounts_11e98); writable found (bundle/close_position.ts:316); key found (bundle/close_position.ts:327); address found (bundle/close_position.ts:327)
- position_token_account: owner found (bundle/close_position.ts:233 via try_accounts_11f50); discriminator found (bundle/close_position.ts:233 via try_accounts_11f50); initialized found (bundle/close_position.ts:233 via try_accounts_11f50); state found (bundle/close_position.ts:341); writable found (bundle/close_position.ts:341); raw found (bundle/close_position.ts:350); key found (bundle/close_position.ts:359)
- token_program: address found (bundle/close_position.ts:251 via fn_129a0); executable found (bundle/close_position.ts:251 via fn_129a0); key found (bundle/close_position.ts:362)

## CPIs

- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))

## PDAs derived

- bundle/close_position.ts:266 find_program_address(["position", *y], program *(ld64(s458 + 0x20)))
- compared with provided accounts: position found

## Operations (account writes)

- bundle/close_position.ts:1066 LAMPORT_WRITE receiver.lamports += f + g [conditional]
- bundle/close_position.ts:1072 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports = 0 [conditional]
- bundle/close_position.ts:1432 ACCOUNT_REALLOC b.data.len = c
- bundle/close_position.ts:1431 ACCOUNT_DATA_WRITE token_badge.data[-8..0] = c [conditional]

## Dominance (checks on every path to the operation; across calls)

- entrypoint.ts:14045 CPI: 19 dominating checks (signer position_authority; owner position; initialized position; discriminator position; owner position_mint; discriminator position_mint; initialized position_mint; owner position_token_account; …)
- bundle/close_position.ts:1066 LAMPORT_WRITE: 18 dominating checks (signer position_authority; owner position; initialized position; discriminator position; owner position_mint; discriminator position_mint; initialized position_mint; owner position_token_account; …)
- bundle/close_position.ts:1072 LAMPORT_WRITE, ACCOUNT_CLOSE: 18 dominating checks (signer position_authority; owner position; initialized position; discriminator position; owner position_mint; discriminator position_mint; initialized position_mint; owner position_token_account; …)
- bundle/close_position.ts:1432 ACCOUNT_REALLOC: 19 dominating checks (signer position_authority; owner position; initialized position; discriminator position; owner position_mint; discriminator position_mint; initialized position_mint; owner position_token_account; …)
- bundle/close_position.ts:1431 ACCOUNT_DATA_WRITE: 19 dominating checks (signer position_authority; owner position; initialized position; discriminator position; owner position_mint; discriminator position_mint; initialized position_mint; owner position_token_account; …)

## Authority (who enables each value movement / authority change)

- bundle/close_position.ts:1072 LAMPORT_WRITE, ACCOUNT_CLOSE: signer position_authority (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 20 dominating checks
- bundle/close_position.ts:1066 LAMPORT_WRITE receiver.lamports [LAMPORT_WRITE +=]
  - [NOT FOUND] recipient bound — receiver: no pda / address / key / has_one / associated / signer check found
  - [found] amount arithmetic checked — f + g (checked)
  - [found] relevant checks on every path — 19 dominating checks
- bundle/close_position.ts:1072 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports [ACCOUNT_CLOSE]
  - [found] authorized (signer / PDA signature / stored authority) — signer position_authority (found)
  - [found] data zeroed / closed discriminator / owner reassigned — AccountInfo::assign / realloc in fn_13aee8
  - [found] not reopened (no realloc after the close) — no realloc after it in the instruction
  - [found] relevant checks on every path — 19 dominating checks
- bundle/close_position.ts:1431 ACCOUNT_DATA_WRITE token_badge.data[-8..0] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — token_badge: not an identified account
  - [found] write gated (signer / constraint) — signer position_authority accounts_close_position:12; address/executable token_program accounts_close_position:90; key/pda position accounts_close_position:111

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/close_position.ts:1072 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports ⇐ signer position_authority (found)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- entrypoint.ts:14045 CPI: `u114 != -1` · `u105 != -1` · `u100 != -1` · `u90 != -1` · `u85 != -1` · `u74 != -1` · `u67 != -1` · `u59 != -1` · ✗ `q == 0x8000000000000000` · `u28 != -1` · … 9 more
- bundle/close_position.ts:1066 LAMPORT_WRITE receiver.lamports: `j == 0` · ✗ `(h & 1) != 0` · `u26 != -1` · `u22 != -1` · `u8 != -1` · `u4 != -1` · `l == 2` · `l == 2` · ✗ `f == 2`
- bundle/close_position.ts:1072 LAMPORT_WRITE, ACCOUNT_CLOSE token_badge.lamports: `n == 0` · `j == 0` · ✗ `(h & 1) != 0` · `u26 != -1` · `u22 != -1` · `u8 != -1` · `u4 != -1` · `l == 2` · `l == 2` · ✗ `f == 2`
- bundle/close_position.ts:1432 ACCOUNT_REALLOC b.data.len: ✗ `sat_sub(c, ld32(b.key - 4)) > 0x2800` #24 · ✗ `g == c` · ✗ `f.borrow != 0` · `n == 0` · `j == 0` · ✗ `(h & 1) != 0` · `u26 != -1` · `u22 != -1` · `u8 != -1` · `u4 != -1` · … 3 more
- bundle/close_position.ts:1431 ACCOUNT_DATA_WRITE token_badge.data[-8..0]: ✗ `sat_sub(c, ld32(b.key - 4)) > 0x2800` #24 · ✗ `g == c` · ✗ `f.borrow != 0` · `n == 0` · `j == 0` · ✗ `(h & 1) != 0` · `u26 != -1` · `u22 != -1` · `u8 != -1` · `u4 != -1` · … 3 more

## Arithmetic on value paths

- bundle/close_position.ts:1066 receiver.lamports ← `f + g`: checked — guard `(h & 1) != 0` (bundle/close_position.ts:1057)

## Relations (equalities the checks establish)

- token_program.key == (constant address) (address, found, bundle/close_position.ts:251)
- position_mint.key == (constant address) (address, found, bundle/close_position.ts:327)
- position.data == position_mint.key (field_eq, found, bundle/close_position.ts:327)
- token_program.key == (constant address) (address, found, bundle/close_position.ts:362)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): position_authority.key, receiver.key
- position.key: validated (pda found @accounts_close_position:111, key found @accounts_close_position:111)
- position.data: validated (owner found @accounts_close_position:44, discriminator found @accounts_close_position:44, initialized found @accounts_close_position:44)
- position_mint.key: validated (address found @accounts_close_position:166, key found @accounts_close_position:166)
- position_mint.data: validated (owner found @accounts_close_position:57, discriminator found @accounts_close_position:57, initialized found @accounts_close_position:57)
- position_token_account.key: validated (key found @accounts_close_position:198)
- position_token_account.data: validated (owner found @accounts_close_position:72, discriminator found @accounts_close_position:72, initialized found @accounts_close_position:72)
- token_program.key: validated (address found @accounts_close_position:90, key found @accounts_close_position:201)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/close_position.ts:173 | found | position_authority | signer (via try_accounts_11718 (count, signer)) | `f != 2` | return |
| 1 | bundle/close_position.ts:183 | found | receiver | count | `g == 0` | anchor::AccountNotEnoughKeys |
| 2 | bundle/close_position.ts:205 | found | position | owner, initialized, discriminator (via try_accounts_11b00 (count, owner, initialized, discriminator)) | `position == 0` | return |
| 3 | bundle/close_position.ts:218 | found | position_mint | owner, discriminator, initialized (via try_accounts_11e98 (count, owner, discriminator, initialized)) | `s == 2` | return |
| 4 | bundle/close_position.ts:233 | found | position_token_account | owner, discriminator, initialized (via try_accounts_11f50 (count, owner, discriminator, initialized)) | `ld32(s158 + 0x70) == 2` | return |
| 5 | bundle/close_position.ts:251 | found | token_program | address, executable (via fn_129a0 (count, address, executable)) | `v != 2` | return |
| 6 | bundle/close_position.ts:252 | found | receiver | writable | `ld8(ld64(s458 + 0x10) + 0x29 /* is_writable */) == 0` | anchor::ConstraintMut |
| 7 | bundle/close_position.ts:272 | found | position | key, pda | `(memcmp(s178, s60, 0x20) as u32) != 0` | anchor::ConstraintSeeds |
| 8 | bundle/close_position.ts:292 | found | position | writable | `position.is_writable == 0` | anchor::ConstraintMut |
| 9 | bundle/close_position.ts:307 | found | position | close | `(ab as u32) == 0` | anchor::ConstraintClose |
| 10 | bundle/close_position.ts:316 | found | position_mint | writable | `ld8(ld64(s488 + 0x28) + 0x29 /* is_writable */) == 0` | anchor::ConstraintMut |
| 11 | bundle/close_position.ts:327 | found | position_mint | key, address | `(memcmp(s40, s20, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 12 | bundle/close_position.ts:341 | found | position_token_account | state, writable | `ac.info.is_writable == 0` | anchor::ConstraintMut |
| 13 | bundle/close_position.ts:350 | found | position_token_account | state, raw | `ac.amount != 1` | anchor::ConstraintRaw |
| 14 | bundle/close_position.ts:359 | found | position_token_account | state, key, raw | `!((memcmp(ac.mint, s228, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 15 | bundle/close_position.ts:362 | found | token_program | key, address | `(memcmp(s20, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 16 | bundle/close_position.ts:792 | PARTIAL | position |  | `v != 2` | return |
| 17 | bundle/close_position.ts:842 | PARTIAL | position_token_account |  | `ah != 0x800000000000001a /* Ok */` | return |
| 18 | bundle/close_position.ts:848 | PARTIAL | position_token_account |  | `aj != 2` | return |
| 19 | entrypoint.ts:618 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 20 | entrypoint.ts:627 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 21 | bundle/close_position.ts:868 | PARTIAL |  | key | `(memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 22 | bundle/close_position.ts:962 | PARTIAL |  | key | `(memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 23 | entrypoint.ts:13514 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 24 | bundle/close_position.ts:1425 | PARTIAL | b? | key | `sat_sub(c, ld32(b.key - 4)) > 0x2800` | Err(ProgramError::InvalidRealloc) |
