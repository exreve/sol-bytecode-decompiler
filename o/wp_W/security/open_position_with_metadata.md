# open_position_with_metadata

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_open_position_with_metadata (anchor); 86 functions reachable: ix_open_position_with_metadata, accounts_open_position_with_metadata, memcpy, fn_347f8, fn_c2790, fn_147990, fn_11f980, fn_139720, fn_149678, fn_89e0, fn_83078, fn_27d8, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | funder [str] | found | PARTIAL | — | — | — |
| 1 | whirlpool [str] | — | — | found (+discriminator found) | — | — |
| 2 | rent [str] | — | — | — | — | found |
| 3 | metadata_update_auth [str] | — | — | — | — | PARTIAL |
| 4 | position [str] | — | PARTIAL | PARTIAL | — | — |
| 5 | position_mint [str] | PARTIAL | PARTIAL | — | — | — |
| 6 | position_token_account [str] | — | PARTIAL | PARTIAL | — | — |
| 7 | token_program [str] | — | — | — | found | found |
| 8 | position_metadata_account [str] | — | PARTIAL | — | — | — |
| 9 | metadata_program [str] | — | — | — | found | found |
| 10 | associated_token_program [str] | — | — | — | found | found |
| 11 | system_program [str] | — | — | — | found | found |
| 12 | owner [str] | — | — | — | — | — |

## Constraints per account

- funder: signer found (bundle/open_position_with_metadata.ts:218 via try_accounts_11718); writable PARTIAL (bundle/open_position_with_metadata.ts:642)
- whirlpool: owner found (bundle/open_position_with_metadata.ts:269 via try_accounts_11a48); initialized found (bundle/open_position_with_metadata.ts:269 via try_accounts_11a48); discriminator found (bundle/open_position_with_metadata.ts:269 via try_accounts_11a48)
- rent: address found (bundle/open_position_with_metadata.ts:297 via try_accounts_11990)
- metadata_update_auth: count found (bundle/open_position_with_metadata.ts:318); key PARTIAL (bundle/open_position_with_metadata.ts:663); address PARTIAL (bundle/open_position_with_metadata.ts:663)
- position: key found (bundle/open_position_with_metadata.ts:358); pda found (bundle/open_position_with_metadata.ts:358); writable PARTIAL (bundle/open_position_with_metadata.ts:368); rent_exempt PARTIAL (bundle/open_position_with_metadata.ts:428); owner PARTIAL (bundle/open_position_with_metadata.ts:1414 via fn_4a30); initialized PARTIAL (bundle/open_position_with_metadata.ts:1414 via fn_4a30)
- position_mint: writable PARTIAL (bundle/open_position_with_metadata.ts:468); signer PARTIAL (bundle/open_position_with_metadata.ts:477); rent_exempt PARTIAL (bundle/open_position_with_metadata.ts:537)
- position_token_account: writable PARTIAL (bundle/open_position_with_metadata.ts:570); rent_exempt PARTIAL (bundle/open_position_with_metadata.ts:632); owner PARTIAL (bundle/open_position_with_metadata.ts:1927 via Account_try_from_unchecked); initialized PARTIAL (bundle/open_position_with_metadata.ts:1927 via Account_try_from_unchecked)
- token_program: address found (bundle/open_position_with_metadata.ts:286 via fn_129a0); executable found (bundle/open_position_with_metadata.ts:286 via fn_129a0); key PARTIAL (bundle/open_position_with_metadata.ts:647)
- position_metadata_account: count found (bundle/open_position_with_metadata.ts:252); writable PARTIAL (bundle/open_position_with_metadata.ts:643)
- metadata_program: address found (bundle/open_position_with_metadata.ts:315 via fn_12e30); executable found (bundle/open_position_with_metadata.ts:315 via fn_12e30)
- associated_token_program: address found (bundle/open_position_with_metadata.ts:310 via fn_12510); executable found (bundle/open_position_with_metadata.ts:310 via fn_12510)
- system_program: address found (bundle/open_position_with_metadata.ts:291 via fn_122e8); executable found (bundle/open_position_with_metadata.ts:291 via fn_122e8)
- owner: count found (bundle/open_position_with_metadata.ts:229)

## CPIs

- bundle/open_position_with_metadata.ts:4461 program not decoded
- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))

## PDAs derived

- bundle/open_position_with_metadata.ts:350 find_program_address(["position", *s338], program *(ld64(s408)))
- compared with provided accounts: position found

## Dominance (checks on every path to the operation; across calls)

- bundle/open_position_with_metadata.ts:4461 CPI: 15 dominating checks (signer funder; owner whirlpool; initialized whirlpool; discriminator whirlpool; address token_program; executable token_program; address system_program; executable system_program; …)
- entrypoint.ts:14045 CPI: 30 dominating checks (signer funder; owner whirlpool; initialized whirlpool; discriminator whirlpool; address token_program; executable token_program; address system_program; executable system_program; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 37 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/open_position_with_metadata.ts:4461 CPI: `bo != -1` · `bm != -1` · `bh != -1` · `bf != -1` · `u228 != -1` · `u82 != -1` · `x > g` · ✗ `(memcmp(s40, s2c8, 0x20) as u32) == 0` #35 · `g != 0` · `(memcmp(s290, s390, 0x20) as u32) == 0` #13 · … 16 more
  - not required on some path: #17 (signer position_mint)
- entrypoint.ts:14045 CPI: `u70 != -1` · `u65 != -1` · `u58 != -1` · `u55 != -1` · `u47 != -1` · `u43 != -1` · `u26 != -1` · `u22 != -1` · ✗ `f != 2` · ✗ `f != 2` · … 3 more

## Relations (equalities the checks establish)

- token_program.key == (constant address) (address, found, bundle/open_position_with_metadata.ts:286)
- system_program.key == (constant address) (address, found, bundle/open_position_with_metadata.ts:291)
- rent.key == (constant address) (address, found, bundle/open_position_with_metadata.ts:297)
- associated_token_program.key == (constant address) (address, found, bundle/open_position_with_metadata.ts:310)
- metadata_program.key == (constant address) (address, found, bundle/open_position_with_metadata.ts:315)
- token_program.key == (constant address) (address, PARTIAL, bundle/open_position_with_metadata.ts:647)
- metadata_update_auth.key == (constant address) (address, PARTIAL, bundle/open_position_with_metadata.ts:663)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): funder.key, whirlpool.key, position_mint.key, position_token_account.key, position_metadata_account.key, owner.key
- whirlpool.data: validated (owner found @accounts_open_position_with_metadata:62, discriminator found @accounts_open_position_with_metadata:62, initialized found @accounts_open_position_with_metadata:62)
- rent.key: validated (address found @accounts_open_position_with_metadata:90)
- metadata_update_auth.key: partially-validated (address partial @accounts_open_position_with_metadata:456, key partial @accounts_open_position_with_metadata:456)
- position.key: validated (pda found @accounts_open_position_with_metadata:151, key found @accounts_open_position_with_metadata:151)
- position.data: partially-validated (owner partial @fn_bf220:345, initialized partial @fn_bf220:345)
- position_token_account.data: partially-validated (owner partial @fn_bba20:105, initialized partial @fn_bba20:105)
- token_program.key: validated (address found @accounts_open_position_with_metadata:79, key partial @accounts_open_position_with_metadata:440)
- metadata_program.key: validated (address found @accounts_open_position_with_metadata:108)
- associated_token_program.key: validated (address found @accounts_open_position_with_metadata:103)
- system_program.key: validated (address found @accounts_open_position_with_metadata:84)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/open_position_with_metadata.ts:218 | found | funder | signer (via try_accounts_11718 (count, signer)) | `f != 2` | return |
| 1 | bundle/open_position_with_metadata.ts:229 | found | owner | count | `h == 0` | anchor::AccountNotEnoughKeys |
| 2 | bundle/open_position_with_metadata.ts:235 | found |  | count | `m == 0` | anchor::AccountNotEnoughKeys |
| 3 | bundle/open_position_with_metadata.ts:247 | found |  | count | `h == 2` | anchor::AccountNotEnoughKeys |
| 4 | bundle/open_position_with_metadata.ts:252 | found | position_metadata_account | count | `h == 3` | anchor::AccountNotEnoughKeys |
| 5 | bundle/open_position_with_metadata.ts:256 | found |  | count | `t == 0` | anchor::AccountNotEnoughKeys |
| 6 | bundle/open_position_with_metadata.ts:269 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 7 | bundle/open_position_with_metadata.ts:286 | found | token_program | address, executable (via fn_129a0 (count, address, executable)) | `w != 2` | return |
| 8 | bundle/open_position_with_metadata.ts:291 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `y != 2` | return |
| 9 | bundle/open_position_with_metadata.ts:297 | found | rent | address (via try_accounts_11990 (count, address)) | `aa == 0` | return |
| 10 | bundle/open_position_with_metadata.ts:310 | found | associated_token_program | address, executable (via fn_12510 (count, address, executable)) | `ad != 2` | return |
| 11 | bundle/open_position_with_metadata.ts:315 | found | metadata_program | address, executable (via fn_12e30 (count, address, executable)) | `af != 2` | return |
| 12 | bundle/open_position_with_metadata.ts:318 | found | metadata_update_auth | count | `ah == 0` | anchor::AccountNotEnoughKeys |
| 13 | bundle/open_position_with_metadata.ts:358 | found | position | key, pda | `!((memcmp(s290, s390, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 14 | bundle/open_position_with_metadata.ts:368 | PARTIAL | position | writable | `position.is_writable == 0` | anchor::ConstraintMut |
| 15 | bundle/open_position_with_metadata.ts:428 | PARTIAL | position | rent_exempt | `bn > ld64(s768)` | anchor::ConstraintRentExempt |
| 16 | bundle/open_position_with_metadata.ts:468 | PARTIAL | position_mint | writable | `position_mint.is_writable == 0` | anchor::ConstraintMut |
| 17 | bundle/open_position_with_metadata.ts:477 | PARTIAL | position_mint | signer | `position_mint.is_signer == 0` | anchor::ConstraintSigner |
| 18 | bundle/open_position_with_metadata.ts:537 | PARTIAL | position_mint | rent_exempt | `ci > ld64(s768)` | anchor::ConstraintRentExempt |
| 19 | bundle/open_position_with_metadata.ts:570 | PARTIAL | position_token_account | writable | `position_token_account.is_writable == 0` | anchor::ConstraintMut |
| 20 | bundle/open_position_with_metadata.ts:632 | PARTIAL | position_token_account | rent_exempt | `dc > ld64(s778)` | anchor::ConstraintRentExempt |
| 21 | bundle/open_position_with_metadata.ts:642 | PARTIAL | funder | writable | `funder.is_writable == 0` | anchor::ConstraintMut |
| 22 | bundle/open_position_with_metadata.ts:643 | PARTIAL | position_metadata_account | writable | `position_metadata_account[2].is_writable == 0` | anchor::ConstraintMut |
| 23 | bundle/open_position_with_metadata.ts:647 | PARTIAL | token_program | key, address | `(memcmp(s2d8, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 24 | bundle/open_position_with_metadata.ts:663 | PARTIAL | metadata_update_auth | key, address | `!((memcmp(s2d8, 0x100152dd0 /* key 3axbTs2z5GBy6usVbNVoqEgZMng3vZvMnAoX29BFfwhr */, 0x20) as u32) ==` | anchor::ConstraintAddress |
| 25 | bundle/open_position_with_metadata.ts:961 | PARTIAL | position |  | `f != 2` | return |
| 26 | bundle/open_position_with_metadata.ts:1011 | PARTIAL | position_token_account |  | `r != 0x800000000000001a /* Ok */` | return |
| 27 | bundle/open_position_with_metadata.ts:1017 | PARTIAL | position_token_account |  | `t != 2` | return |
| 28 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 29 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 30 | entrypoint.ts:323 | found |  | address | `f == 0` | anchor::AccountSysvarMismatch |
| 31 | entrypoint.ts:336 | PARTIAL |  | address | `!(i >= 8 && (i != 0x10 && (i & -8) != 8))` | anchor::AccountSysvarMismatch |
| 32 | bundle/open_position_with_metadata.ts:1038 | found |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 33 | bundle/open_position_with_metadata.ts:1043 | found |  | key, address | `(memcmp(h, 0x1001521a0 /* &TOKEN_METADATA_PROGRAM */, 0x20) as u32) != 0` | anchor::InvalidProgramId |
| 34 | bundle/open_position_with_metadata.ts:1053 | found | g? | executable | `g.executable == 0` | anchor::InvalidProgramExecutable |
| 35 | bundle/open_position_with_metadata.ts:1086 | PARTIAL |  | key | `(memcmp(s40, s2c8, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 36 | bundle/open_position_with_metadata.ts:1414 | PARTIAL | position | owner, initialized (via fn_4a30 (owner, initialized)) | `ld64(s118) == 0` | return |
| 37 | bundle/open_position_with_metadata.ts:1469 | PARTIAL |  | key | `(memcmp(s40, s268, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 38 | bundle/open_position_with_metadata.ts:1927 | PARTIAL | position_token_account | owner, initialized (via Account_try_from_unchecked (owner, initialized)) | `ld32(sb8 + 0x90) == 2` | return |
| 39 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 40 | bundle/open_position_with_metadata.ts:2490 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 41 | bundle/open_position_with_metadata.ts:2499 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 42 | ix/open_position_with_token_extensions.ts:1667 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 43 | bundle/open_position_with_metadata.ts:4012 | PARTIAL |  | key | `(memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 44 | bundle/open_position_with_metadata.ts:4481 | PARTIAL |  | key | `(memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
