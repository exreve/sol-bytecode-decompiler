# transfer_locked_position

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_transfer_locked_position (anchor); 55 functions reachable: ix_transfer_locked_position, accounts_transfer_locked_position, memcpy, fn_37fd8, fn_ce0e0, fn_147990, fn_11f980, fn_139720, fn_149678, fn_9540, fn_145330, fn_14c5c0, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | position_authority [str] | found | — | — | — | — |
| 1 | receiver [str] | — | found | — | — | — |
| 2 | position [str] | — | — | found (+discriminator found) | — | — |
| 3 | position_mint [str] | — | — | found (+discriminator found) | — | found |
| 4 | position_token_account [str] | — | found | found (+discriminator found) | — | — |
| 5 | destination_token_account [str] | — | found | found (+discriminator found) | — | — |
| 6 | lock_config [str] | — | found | found | — | — |
| 7 | token_2022_program [str] | — | — | — | found | found |

## Constraints per account

- position_authority: signer found (bundle/transfer_locked_position.ts:163 via try_accounts_11718)
- receiver: count found (bundle/transfer_locked_position.ts:173); writable found (bundle/transfer_locked_position.ts:271)
- position: owner found (bundle/transfer_locked_position.ts:195 via try_accounts_11b00); initialized found (bundle/transfer_locked_position.ts:195 via try_accounts_11b00); discriminator found (bundle/transfer_locked_position.ts:195 via try_accounts_11b00); key found (bundle/transfer_locked_position.ts:291); pda found (bundle/transfer_locked_position.ts:291)
- position_mint: owner found (bundle/transfer_locked_position.ts:208 via try_accounts_610); discriminator found (bundle/transfer_locked_position.ts:208 via try_accounts_610); initialized found (bundle/transfer_locked_position.ts:208 via try_accounts_610); address found (bundle/transfer_locked_position.ts:315)
- position_token_account: owner found (bundle/transfer_locked_position.ts:227 via try_accounts_558); discriminator found (bundle/transfer_locked_position.ts:227 via try_accounts_558); initialized found (bundle/transfer_locked_position.ts:227 via try_accounts_558); writable found (bundle/transfer_locked_position.ts:318); raw found (bundle/transfer_locked_position.ts:327); key found (bundle/transfer_locked_position.ts:328)
- destination_token_account: owner found (bundle/transfer_locked_position.ts:247 via try_accounts_558); discriminator found (bundle/transfer_locked_position.ts:247 via try_accounts_558); initialized found (bundle/transfer_locked_position.ts:247 via try_accounts_558); writable found (bundle/transfer_locked_position.ts:330); key found (bundle/transfer_locked_position.ts:331); raw found (bundle/transfer_locked_position.ts:331)
- lock_config: owner found (bundle/transfer_locked_position.ts:266 via fn_2678); initialized found (bundle/transfer_locked_position.ts:266 via fn_2678); writable found (bundle/transfer_locked_position.ts:337); key found (bundle/transfer_locked_position.ts:341); has_one found (bundle/transfer_locked_position.ts:341)
- token_2022_program: address found (bundle/transfer_locked_position.ts:270 via fn_12be8); executable found (bundle/transfer_locked_position.ts:270 via fn_12be8); key found (bundle/transfer_locked_position.ts:357)

## CPIs

- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))

## PDAs derived

- bundle/transfer_locked_position.ts:285 find_program_address(["position", *ac], program *(ld64(s698 + 0x20)))
- compared with provided accounts: position found

## Dominance (checks on every path to the operation; across calls)

- entrypoint.ts:14045 CPI: 28 dominating checks (signer position_authority; owner position; initialized position; discriminator position; owner position_mint; discriminator position_mint; initialized position_mint; owner position_token_account; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 30 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- entrypoint.ts:14045 CPI: `u113 != -1` · `u104 != -1` · `u98 != -1` · `u88 != -1` · `u82 != -1` · `u74 != -1` · `u70 != -1` · `u62 != -1` · ✗ `t == 0x8000000000000000` · `u28 != -1` · … 7 more

## Relations (equalities the checks establish)

- token_2022_program.key == (constant address) (address, found, bundle/transfer_locked_position.ts:270)
- position_mint.key == (constant address) (address, found, bundle/transfer_locked_position.ts:315)
- lock_config.position_authority? == position_authority.key (has_one, found, bundle/transfer_locked_position.ts:341)
- token_2022_program.key == (constant address) (address, found, bundle/transfer_locked_position.ts:357)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): position_authority.key, receiver.key
- position.key: validated (pda found @accounts_transfer_locked_position:139, key found @accounts_transfer_locked_position:139)
- position.data: validated (owner found @accounts_transfer_locked_position:43, discriminator found @accounts_transfer_locked_position:43, initialized found @accounts_transfer_locked_position:43)
- position_mint.key: validated (address found @accounts_transfer_locked_position:163)
- position_mint.data: validated (owner found @accounts_transfer_locked_position:56, discriminator found @accounts_transfer_locked_position:56, initialized found @accounts_transfer_locked_position:56)
- position_token_account.key: validated (key found @accounts_transfer_locked_position:176)
- position_token_account.data: validated (owner found @accounts_transfer_locked_position:75, discriminator found @accounts_transfer_locked_position:75, initialized found @accounts_transfer_locked_position:75)
- destination_token_account.key: validated (key found @accounts_transfer_locked_position:179)
- destination_token_account.data: validated (owner found @accounts_transfer_locked_position:95, discriminator found @accounts_transfer_locked_position:95, initialized found @accounts_transfer_locked_position:95)
- lock_config.key: validated (key found @accounts_transfer_locked_position:189, has_one found @accounts_transfer_locked_position:189)
- lock_config.data: validated (owner found @accounts_transfer_locked_position:114, initialized found @accounts_transfer_locked_position:114)
- token_2022_program.key: validated (address found @accounts_transfer_locked_position:118, key found @accounts_transfer_locked_position:205)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/transfer_locked_position.ts:163 | found | position_authority | signer (via try_accounts_11718 (count, signer)) | `f != 2` | return |
| 1 | bundle/transfer_locked_position.ts:173 | found | receiver | count | `g == 0` | anchor::AccountNotEnoughKeys |
| 2 | bundle/transfer_locked_position.ts:195 | found | position | owner, initialized, discriminator (via try_accounts_11b00 (count, owner, initialized, discriminator)) | `position == 0` | return |
| 3 | bundle/transfer_locked_position.ts:208 | found | position_mint | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `r == 2` | return |
| 4 | bundle/transfer_locked_position.ts:227 | found | position_token_account | owner, discriminator, initialized (via try_accounts_558 (count, owner, discriminator, initialized)) | `s == 2` | return |
| 5 | bundle/transfer_locked_position.ts:247 | found | destination_token_account | owner, discriminator, initialized (via try_accounts_558 (count, owner, discriminator, initialized)) | `v == 2` | return |
| 6 | bundle/transfer_locked_position.ts:266 | found | lock_config | owner, initialized (via fn_2678 (count, owner, initialized)) | `y != 2` | return |
| 7 | bundle/transfer_locked_position.ts:270 | found | token_2022_program | address, executable (via fn_12be8 (count, address, executable)) | `z != 2` | return |
| 8 | bundle/transfer_locked_position.ts:271 | found | receiver | writable | `ld8(ld64(s698 + 0x10) + 0x29) == 0` | anchor::ConstraintMut |
| 9 | bundle/transfer_locked_position.ts:291 | found | position | key, pda | `(memcmp(s138, s60, 0x20) as u32) != 0` | anchor::ConstraintSeeds |
| 10 | bundle/transfer_locked_position.ts:315 | found | position_mint | address | `!((ae as u32) == 0)` | anchor::ConstraintAddress |
| 11 | bundle/transfer_locked_position.ts:318 | found | position_token_account | writable | `position_token_account.is_writable == 0` | anchor::ConstraintMut |
| 12 | bundle/transfer_locked_position.ts:327 | found | position_token_account | raw | `!(ld64(s2c0 + 0x40) == 1)` | anchor::ConstraintRaw |
| 13 | bundle/transfer_locked_position.ts:328 | found | position_token_account | key, raw | `!((memcmp(s2c0, s3f8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 14 | bundle/transfer_locked_position.ts:330 | found | destination_token_account | writable | `destination_token_account.is_writable == 0` | anchor::ConstraintMut |
| 15 | bundle/transfer_locked_position.ts:331 | found | destination_token_account | key, raw | `!((memcmp(s1e8, s3f8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 16 | bundle/transfer_locked_position.ts:336 | found | destination_token_account | key, raw | `!((memcmp(s20, s138, 0x20) as u32) != 0)` | anchor::ConstraintRaw |
| 17 | bundle/transfer_locked_position.ts:337 | found | lock_config | writable | `!(ld8(ld64(ld64(s6c8)) + 0x29) != 0)` | anchor::ConstraintMut |
| 18 | bundle/transfer_locked_position.ts:341 | found | lock_config | key, has_one | `(memcmp(s40, s20, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 19 | bundle/transfer_locked_position.ts:357 | found | token_2022_program | key, address | `!((memcmp(s20, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 20 | bundle/transfer_locked_position.ts:584 | PARTIAL | lock_config | key | `!((memcmp(b + 0x80, c, 0x20) as u32) == 0)` | return |
| 21 | bundle/transfer_locked_position.ts:608 | PARTIAL | lock_config | key | `!((memcmp(b + 0x158, c, 0x20) as u32) == 0)` | return |
| 22 | bundle/transfer_locked_position.ts:633 | PARTIAL | lock_config |  | `r != 2` | return |
| 23 | entrypoint.ts:618 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 24 | entrypoint.ts:627 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 25 | bundle/transfer_locked_position.ts:669 | found |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 26 | bundle/transfer_locked_position.ts:674 | found |  | key, address | `(memcmp(h, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0` | anchor::InvalidProgramId |
| 27 | bundle/transfer_locked_position.ts:684 | found | g? | executable | `g.executable == 0` | anchor::InvalidProgramExecutable |
| 28 | entrypoint.ts:13514 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 29 | entrypoint.ts:559 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 30 | entrypoint.ts:568 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 31 | bundle/transfer_locked_position.ts:1329 | found |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 32 | bundle/transfer_locked_position.ts:1429 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 33 | bundle/transfer_locked_position.ts:1546 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 34 | bundle/transfer_locked_position.ts:1642 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 35 | entrypoint.ts:13475 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
