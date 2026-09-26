# open_position_with_token_extensions

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_open_position_with_token_extensions (anchor); 90 functions reachable: ix_open_position_with_token_extensions, accounts_open_position_with_token_extensions, memcpy, fn_35098, fn_5a40, fn_147990, fn_11f980, fn_139720, fn_149678, fn_14ef78, fn_89e0, fn_12be8, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | funder [str] | found | PARTIAL | — | — | — |
| 1 | position_mint [str] | found | PARTIAL | — | — | — |
| 2 | position_token_account [str] | — | PARTIAL | — | — | — |
| 3 | whirlpool [str] | — | — | found (+discriminator found) | — | — |
| 4 | metadata_update_auth [str] | — | — | — | — | PARTIAL |
| 5 | position [str] | — | PARTIAL | PARTIAL | — | — |
| 6 | token_2022_program [str] | — | — | — | found | found |
| 7 | associated_token_program [str] | — | — | — | found | found |
| 8 | system_program [str] | — | — | — | found | found |
| 9 | owner [str] | — | — | — | — | — |

## Constraints per account

- funder: signer found (bundle/open_position_with_token_extensions.ts:300 via try_accounts_11718); writable PARTIAL (bundle/open_position_with_token_extensions.ts:508)
- position_mint: signer found (bundle/open_position_with_token_extensions.ts:329 via try_accounts_11718); writable PARTIAL (bundle/open_position_with_token_extensions.ts:511)
- position_token_account: count found (bundle/open_position_with_token_extensions.ts:339); writable PARTIAL (bundle/open_position_with_token_extensions.ts:512)
- whirlpool: owner found (bundle/open_position_with_token_extensions.ts:358 via try_accounts_11a48); initialized found (bundle/open_position_with_token_extensions.ts:358 via try_accounts_11a48); discriminator found (bundle/open_position_with_token_extensions.ts:358 via try_accounts_11a48)
- metadata_update_auth: count found (bundle/open_position_with_token_extensions.ts:388); address PARTIAL (bundle/open_position_with_token_extensions.ts:532)
- position: key found (bundle/open_position_with_token_extensions.ts:424); pda found (bundle/open_position_with_token_extensions.ts:424); writable PARTIAL (bundle/open_position_with_token_extensions.ts:431); rent_exempt PARTIAL (bundle/open_position_with_token_extensions.ts:498); owner PARTIAL (bundle/open_position_with_token_extensions.ts:1329 via fn_4a30); initialized PARTIAL (bundle/open_position_with_token_extensions.ts:1329 via fn_4a30)
- token_2022_program: address found (bundle/open_position_with_token_extensions.ts:375 via fn_12be8); executable found (bundle/open_position_with_token_extensions.ts:375 via fn_12be8); key PARTIAL (bundle/open_position_with_token_extensions.ts:515)
- associated_token_program: address found (bundle/open_position_with_token_extensions.ts:385 via fn_12510); executable found (bundle/open_position_with_token_extensions.ts:385 via fn_12510)
- system_program: address found (bundle/open_position_with_token_extensions.ts:380 via fn_122e8); executable found (bundle/open_position_with_token_extensions.ts:380 via fn_122e8)
- owner: count found (bundle/open_position_with_token_extensions.ts:311)

## CPIs

- shared.ts:20063 [conditional] program not decoded
- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))

## PDAs derived

- bundle/open_position_with_token_extensions.ts:416 find_program_address(["position", *s2c0], program *(ld64(s360)))
- compared with provided accounts: position found

## Dominance (checks on every path to the operation; across calls)

- shared.ts:20063 CPI: 13 dominating checks (signer funder; signer position_mint; owner whirlpool; initialized whirlpool; discriminator whirlpool; address token_2022_program; executable token_2022_program; address system_program; …)
- entrypoint.ts:14045 CPI: 26 dominating checks (signer funder; signer position_mint; owner whirlpool; initialized whirlpool; discriminator whirlpool; address token_2022_program; executable token_2022_program; address system_program; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 31 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- shared.ts:20063 CPI: `bo != -1` · `bm != -1` · `bh != -1` · `bf != -1` · `u229 != -1` · `u82 != -1` · `x > g` · ✗ `(memcmp(s40, s2c8, 0x20) as u32) == 0` #24 · `g != 0` · `(memcmp(s290, s308, 0x20) as u32) == 0` #11 · … 14 more
- entrypoint.ts:14045 CPI: `u428 != -1` · `u418 != -1` · `u413 != -1` · `u404 != -1` · `u400 != -1` · `u390 != -1` · `u385 != -1` · `u343 != -1` · `ld64(s18) == 0x800000000000001a /* Ok */` · `u240 != -1` · … 19 more

## Relations (equalities the checks establish)

- token_2022_program.key == (constant address) (address, found, bundle/open_position_with_token_extensions.ts:375)
- system_program.key == (constant address) (address, found, bundle/open_position_with_token_extensions.ts:380)
- associated_token_program.key == (constant address) (address, found, bundle/open_position_with_token_extensions.ts:385)
- token_2022_program.key == (constant address) (address, PARTIAL, bundle/open_position_with_token_extensions.ts:515)
- metadata_update_auth.key == (constant address) (address, PARTIAL, bundle/open_position_with_token_extensions.ts:532)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): funder.key, position_mint.key, position_token_account.key, whirlpool.key, owner.key
- whirlpool.data: validated (owner found @accounts_open_position_with_token_extensions:69, discriminator found @accounts_open_position_with_token_extensions:69, initialized found @accounts_open_position_with_token_extensions:69)
- metadata_update_auth.key: partially-validated (address partial @accounts_open_position_with_token_extensions:243)
- position.key: validated (pda found @accounts_open_position_with_token_extensions:135, key found @accounts_open_position_with_token_extensions:135)
- position.data: partially-validated (owner partial @fn_c42a0:345, initialized partial @fn_c42a0:345)
- token_2022_program.key: validated (address found @accounts_open_position_with_token_extensions:86, key partial @accounts_open_position_with_token_extensions:226)
- associated_token_program.key: validated (address found @accounts_open_position_with_token_extensions:96)
- system_program.key: validated (address found @accounts_open_position_with_token_extensions:91)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/open_position_with_token_extensions.ts:173 | PARTIAL | position |  | `p != 2` | return |
| 1 | bundle/open_position_with_token_extensions.ts:300 | found | funder | signer (via try_accounts_11718 (count, signer)) | `f != 2` | return |
| 2 | bundle/open_position_with_token_extensions.ts:311 | found | owner | count | `h == 0` | anchor::AccountNotEnoughKeys |
| 3 | bundle/open_position_with_token_extensions.ts:314 | found |  | count | `h == 1` | anchor::AccountNotEnoughKeys |
| 4 | bundle/open_position_with_token_extensions.ts:329 | found | position_mint | signer (via try_accounts_11718 (count, signer)) | `n != 2` | return |
| 5 | bundle/open_position_with_token_extensions.ts:339 | found | position_token_account | count | `p == 0` | anchor::AccountNotEnoughKeys |
| 6 | bundle/open_position_with_token_extensions.ts:358 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 7 | bundle/open_position_with_token_extensions.ts:375 | found | token_2022_program | address, executable (via fn_12be8 (count, address, executable)) | `w != 2` | return |
| 8 | bundle/open_position_with_token_extensions.ts:380 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `y != 2` | return |
| 9 | bundle/open_position_with_token_extensions.ts:385 | found | associated_token_program | address, executable (via fn_12510 (count, address, executable)) | `aa != 2` | return |
| 10 | bundle/open_position_with_token_extensions.ts:388 | found | metadata_update_auth | count | `ac == 0` | anchor::AccountNotEnoughKeys |
| 11 | bundle/open_position_with_token_extensions.ts:424 | found | position | key, pda | `!((memcmp(s290, s308, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 12 | bundle/open_position_with_token_extensions.ts:431 | PARTIAL | position | writable | `position.is_writable == 0` | anchor::ConstraintMut |
| 13 | bundle/open_position_with_token_extensions.ts:498 | PARTIAL | position | rent_exempt | `bl > ld64(s5b0)` | anchor::ConstraintRentExempt |
| 14 | bundle/open_position_with_token_extensions.ts:508 | PARTIAL | funder | writable | `funder.is_writable == 0` | anchor::ConstraintMut |
| 15 | bundle/open_position_with_token_extensions.ts:511 | PARTIAL | position_mint | writable | `position_mint.is_writable == 0` | anchor::ConstraintMut |
| 16 | bundle/open_position_with_token_extensions.ts:512 | PARTIAL | position_token_account | writable | `!(ld8(ld64(s588) + 0x29) != 0)` | anchor::ConstraintMut |
| 17 | bundle/open_position_with_token_extensions.ts:515 | PARTIAL | token_2022_program | key, address | `(memcmp(s2c0, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 18 | bundle/open_position_with_token_extensions.ts:532 | PARTIAL | metadata_update_auth | address | `aw != 0` | anchor::ConstraintAddress |
| 19 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 20 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 21 | bundle/open_position_with_token_extensions.ts:953 | found |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 22 | bundle/open_position_with_token_extensions.ts:958 | found |  | key, address | `(memcmp(h, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0` | anchor::InvalidProgramId |
| 23 | bundle/open_position_with_token_extensions.ts:968 | found | g? | executable | `g.executable == 0` | anchor::InvalidProgramExecutable |
| 24 | bundle/open_position_with_token_extensions.ts:1001 | PARTIAL |  | key | `(memcmp(s40, s2c8, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 25 | bundle/open_position_with_token_extensions.ts:1329 | PARTIAL | position | owner, initialized (via fn_4a30 (owner, initialized)) | `ld64(s118) == 0` | return |
| 26 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 27 | bundle/open_position_with_token_extensions.ts:2832 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 28 | bundle/open_position_with_token_extensions.ts:2841 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 29 | bundle/open_position_with_token_extensions.ts:3746 | PARTIAL | d? | owner | `!((memcmp(d.owner, sa8, 0x20) as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 30 | bundle/open_position_with_token_extensions.ts:3955 | PARTIAL |  | key | `(memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 31 | bundle/open_position_with_token_extensions.ts:3992 | PARTIAL |  | key | `(memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 32 | bundle/open_position_with_token_extensions.ts:4083 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 33 | bundle/open_position_with_token_extensions.ts:4444 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 34 | bundle/open_position_with_token_extensions.ts:4547 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
