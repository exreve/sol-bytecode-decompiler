# initialize_position_bundle_with_metadata

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_initialize_position_bundle_with_metadata (anchor); 70 functions reachable: ix_initialize_position_bundle_with_metadata, accounts_initialize_position_bundle_with_metadata, memcpy, fn_6a310, fn_ab200, fn_147990, fn_11f980, fn_139720, fn_149678, fn_83078, fn_27d8, fn_12e30, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | position_bundle_owner [str] | — | — | — | — | — |
| 1 | metadata_update_auth [str] | — | — | — | — | PARTIAL |
| 2 | rent [str] | — | — | — | — | found |
| 3 | position_bundle [str] | — | PARTIAL | PARTIAL | — | — |
| 4 | position_bundle_mint [str] | PARTIAL | PARTIAL | — | — | — |
| 5 | position_bundle_token_account [str] | — | PARTIAL | PARTIAL | — | — |
| 6 | token_program [str] | — | — | — | found | found |
| 7 | funder [str] | found | PARTIAL | — | — | — |
| 8 | position_bundle_metadata [str] | — | PARTIAL | — | — | — |
| 9 | metadata_program [str] | — | — | — | found | found |
| 10 | associated_token_program [str] | — | — | — | found | found |
| 11 | system_program [str] | — | — | — | found | found |

## Constraints per account

- position_bundle_owner: no checks found
- metadata_update_auth: count found (bundle/initialize_position_bundle_with_metadata.ts:240); key PARTIAL (bundle/initialize_position_bundle_with_metadata.ts:602); address PARTIAL (bundle/initialize_position_bundle_with_metadata.ts:602)
- rent: address found (bundle/initialize_position_bundle_with_metadata.ts:272 via try_accounts_11990)
- position_bundle: key found (bundle/initialize_position_bundle_with_metadata.ts:313); pda found (bundle/initialize_position_bundle_with_metadata.ts:313); writable PARTIAL (bundle/initialize_position_bundle_with_metadata.ts:323); rent_exempt PARTIAL (bundle/initialize_position_bundle_with_metadata.ts:384); owner PARTIAL (bundle/initialize_position_bundle_with_metadata.ts:1569 via fn_3240); initialized PARTIAL (bundle/initialize_position_bundle_with_metadata.ts:1569 via fn_3240)
- position_bundle_mint: writable PARTIAL (bundle/initialize_position_bundle_with_metadata.ts:424); signer PARTIAL (bundle/initialize_position_bundle_with_metadata.ts:433); rent_exempt PARTIAL (bundle/initialize_position_bundle_with_metadata.ts:493)
- position_bundle_token_account: writable PARTIAL (bundle/initialize_position_bundle_with_metadata.ts:526); rent_exempt PARTIAL (bundle/initialize_position_bundle_with_metadata.ts:588); owner PARTIAL (bundle/initialize_position_bundle_with_metadata.ts:2082 via Account_try_from_unchecked); initialized PARTIAL (bundle/initialize_position_bundle_with_metadata.ts:2082 via Account_try_from_unchecked)
- token_program: address found (bundle/initialize_position_bundle_with_metadata.ts:261 via fn_129a0); executable found (bundle/initialize_position_bundle_with_metadata.ts:261 via fn_129a0); key PARTIAL (bundle/initialize_position_bundle_with_metadata.ts:619)
- funder: signer found (bundle/initialize_position_bundle_with_metadata.ts:237 via try_accounts_11718); writable PARTIAL (bundle/initialize_position_bundle_with_metadata.ts:599)
- position_bundle_metadata: count found (bundle/initialize_position_bundle_with_metadata.ts:198); writable PARTIAL (bundle/initialize_position_bundle_with_metadata.ts:597)
- metadata_program: address found (bundle/initialize_position_bundle_with_metadata.ts:290 via fn_12e30); executable found (bundle/initialize_position_bundle_with_metadata.ts:290 via fn_12e30)
- associated_token_program: address found (bundle/initialize_position_bundle_with_metadata.ts:285 via fn_12510); executable found (bundle/initialize_position_bundle_with_metadata.ts:285 via fn_12510)
- system_program: address found (bundle/initialize_position_bundle_with_metadata.ts:266 via fn_122e8); executable found (bundle/initialize_position_bundle_with_metadata.ts:266 via fn_122e8)

## CPIs

- bundle/initialize_position_bundle_with_metadata.ts:3354 program not decoded
- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))

## PDAs derived

- bundle/initialize_position_bundle_with_metadata.ts:305 find_program_address(["position_bundle", *s108], program *(ld64(s1d8)))
- compared with provided accounts: position_bundle found

## Dominance (checks on every path to the operation; across calls)

- bundle/initialize_position_bundle_with_metadata.ts:3354 CPI: 11 dominating checks (signer funder; address token_program; executable token_program; address system_program; executable system_program; address rent; address associated_token_program; executable associated_token_program; …)
- entrypoint.ts:14045 CPI: 27 dominating checks (signer funder; address token_program; executable token_program; address system_program; executable system_program; address rent; address associated_token_program; executable associated_token_program; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 33 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/initialize_position_bundle_with_metadata.ts:3354 CPI: `bo != -1` · `bm != -1` · `bh != -1` · `bf != -1` · `u228 != -1` · `u82 != -1` · `x > g` · ✗ `(memcmp(s40, s238, 0x20) as u32) == 0` #31 · `g != 0` · `(memcmp(sa8, s160, 0x20) as u32) == 0` #11 · … 11 more
  - not required on some path: #15 (signer position_bundle_mint)
- entrypoint.ts:14045 CPI: `u109 != -1` · `u102 != -1` · `u96 != -1` · `u86 != -1` · `u81 != -1` · `u72 != -1` · `u66 != -1` · `u58 != -1` · ✗ `r == 0x8000000000000000` · `u33 != -1` · … 6 more

## Relations (equalities the checks establish)

- token_program.key == (constant address) (address, found, bundle/initialize_position_bundle_with_metadata.ts:261)
- system_program.key == (constant address) (address, found, bundle/initialize_position_bundle_with_metadata.ts:266)
- rent.key == (constant address) (address, found, bundle/initialize_position_bundle_with_metadata.ts:272)
- associated_token_program.key == (constant address) (address, found, bundle/initialize_position_bundle_with_metadata.ts:285)
- metadata_program.key == (constant address) (address, found, bundle/initialize_position_bundle_with_metadata.ts:290)
- metadata_update_auth.key == (constant address) (address, PARTIAL, bundle/initialize_position_bundle_with_metadata.ts:602)
- token_program.key == (constant address) (address, PARTIAL, bundle/initialize_position_bundle_with_metadata.ts:619)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): position_bundle_owner.key, position_bundle_mint.key, position_bundle_token_account.key, funder.key, position_bundle_metadata.key
- metadata_update_auth.key: partially-validated (address partial @accounts_initialize_position_bundle_with_metadata:424, key partial @accounts_initialize_position_bundle_with_metadata:424)
- rent.key: validated (address found @accounts_initialize_position_bundle_with_metadata:94)
- position_bundle.key: validated (pda found @accounts_initialize_position_bundle_with_metadata:135, key found @accounts_initialize_position_bundle_with_metadata:135)
- position_bundle.data: partially-validated (owner partial @fn_a7c90:345, initialized partial @fn_a7c90:345)
- position_bundle_token_account.data: partially-validated (owner partial @fn_a4608:105, initialized partial @fn_a4608:105)
- token_program.key: validated (address found @accounts_initialize_position_bundle_with_metadata:83, key partial @accounts_initialize_position_bundle_with_metadata:441)
- metadata_program.key: validated (address found @accounts_initialize_position_bundle_with_metadata:112)
- associated_token_program.key: validated (address found @accounts_initialize_position_bundle_with_metadata:107)
- system_program.key: validated (address found @accounts_initialize_position_bundle_with_metadata:88)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/initialize_position_bundle_with_metadata.ts:187 | found |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 1 | bundle/initialize_position_bundle_with_metadata.ts:193 | found |  | count | `f == 1` | anchor::AccountNotEnoughKeys |
| 2 | bundle/initialize_position_bundle_with_metadata.ts:198 | found | position_bundle_metadata | count | `f == 2` | anchor::AccountNotEnoughKeys |
| 3 | bundle/initialize_position_bundle_with_metadata.ts:202 | found |  | count | `j == 0` | anchor::AccountNotEnoughKeys |
| 4 | bundle/initialize_position_bundle_with_metadata.ts:237 | found | funder | signer (via try_accounts_11718 (count, signer)) | `m != 2` | return |
| 5 | bundle/initialize_position_bundle_with_metadata.ts:240 | found | metadata_update_auth | count | `o == 0` | anchor::AccountNotEnoughKeys |
| 6 | bundle/initialize_position_bundle_with_metadata.ts:261 | found | token_program | address, executable (via fn_129a0 (count, address, executable)) | `t != 2` | return |
| 7 | bundle/initialize_position_bundle_with_metadata.ts:266 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `v != 2` | return |
| 8 | bundle/initialize_position_bundle_with_metadata.ts:272 | found | rent | address (via try_accounts_11990 (count, address)) | `x == 0` | return |
| 9 | bundle/initialize_position_bundle_with_metadata.ts:285 | found | associated_token_program | address, executable (via fn_12510 (count, address, executable)) | `aa != 2` | return |
| 10 | bundle/initialize_position_bundle_with_metadata.ts:290 | found | metadata_program | address, executable (via fn_12e30 (count, address, executable)) | `ac != 2` | return |
| 11 | bundle/initialize_position_bundle_with_metadata.ts:313 | found | position_bundle | key, pda | `!((memcmp(sa8, s160, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 12 | bundle/initialize_position_bundle_with_metadata.ts:323 | PARTIAL | position_bundle | writable | `position_bundle.is_writable == 0` | anchor::ConstraintMut |
| 13 | bundle/initialize_position_bundle_with_metadata.ts:384 | PARTIAL | position_bundle | rent_exempt | `bk > ld64(s518)` | anchor::ConstraintRentExempt |
| 14 | bundle/initialize_position_bundle_with_metadata.ts:424 | PARTIAL | position_bundle_mint | writable | `position_bundle_mint.is_writable == 0` | anchor::ConstraintMut |
| 15 | bundle/initialize_position_bundle_with_metadata.ts:433 | PARTIAL | position_bundle_mint | signer | `position_bundle_mint.is_signer == 0` | anchor::ConstraintSigner |
| 16 | bundle/initialize_position_bundle_with_metadata.ts:493 | PARTIAL | position_bundle_mint | rent_exempt | `cf > ld64(s518)` | anchor::ConstraintRentExempt |
| 17 | bundle/initialize_position_bundle_with_metadata.ts:526 | PARTIAL | position_bundle_token_account | writable | `position_bundle_token_account.is_writable == 0` | anchor::ConstraintMut |
| 18 | bundle/initialize_position_bundle_with_metadata.ts:588 | PARTIAL | position_bundle_token_account | rent_exempt | `cz > ld64(s530)` | anchor::ConstraintRentExempt |
| 19 | bundle/initialize_position_bundle_with_metadata.ts:597 | PARTIAL | position_bundle_metadata | writable | `position_bundle_metadata[2].is_writable == 0` | anchor::ConstraintMut |
| 20 | bundle/initialize_position_bundle_with_metadata.ts:599 | PARTIAL | funder | writable | `funder.is_writable == 0` | anchor::ConstraintMut |
| 21 | bundle/initialize_position_bundle_with_metadata.ts:602 | PARTIAL | metadata_update_auth | key, address | `(memcmp(s48, 0x100152dd0 /* key 3axbTs2z5GBy6usVbNVoqEgZMng3vZvMnAoX29BFfwhr */, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 22 | bundle/initialize_position_bundle_with_metadata.ts:619 | PARTIAL | token_program | key, address | `!((memcmp(s48, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 23 | bundle/initialize_position_bundle_with_metadata.ts:1116 | PARTIAL | position_bundle |  | `f != 2` | return |
| 24 | bundle/initialize_position_bundle_with_metadata.ts:1166 | PARTIAL | position_bundle_token_account |  | `r != 0x800000000000001a /* Ok */` | return |
| 25 | bundle/initialize_position_bundle_with_metadata.ts:1172 | PARTIAL | position_bundle_token_account |  | `t != 2` | return |
| 26 | entrypoint.ts:323 | found |  | address | `f == 0` | anchor::AccountSysvarMismatch |
| 27 | entrypoint.ts:336 | PARTIAL |  | address | `!(i >= 8 && (i != 0x10 && (i & -8) != 8))` | anchor::AccountSysvarMismatch |
| 28 | bundle/initialize_position_bundle_with_metadata.ts:1193 | found |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 29 | bundle/initialize_position_bundle_with_metadata.ts:1198 | found |  | key, address | `(memcmp(h, 0x1001521a0 /* &TOKEN_METADATA_PROGRAM */, 0x20) as u32) != 0` | anchor::InvalidProgramId |
| 30 | bundle/initialize_position_bundle_with_metadata.ts:1208 | found | g? | executable | `g.executable == 0` | anchor::InvalidProgramExecutable |
| 31 | bundle/initialize_position_bundle_with_metadata.ts:1241 | PARTIAL |  | key | `(memcmp(s40, s238, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 32 | bundle/initialize_position_bundle_with_metadata.ts:1569 | PARTIAL | position_bundle | owner, initialized (via fn_3240 (owner, initialized)) | `ld64(s88) == 0` | return |
| 33 | bundle/initialize_position_bundle_with_metadata.ts:1624 | PARTIAL |  | key | `(memcmp(s40, s268, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 34 | bundle/initialize_position_bundle_with_metadata.ts:2082 | PARTIAL | position_bundle_token_account | owner, initialized (via Account_try_from_unchecked (owner, initialized)) | `ld32(sb8 + 0x90) == 2` | return |
| 35 | bundle/initialize_position_bundle_with_metadata.ts:2713 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 36 | bundle/initialize_position_bundle_with_metadata.ts:2722 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 37 | ix/open_position_with_token_extensions.ts:1667 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 38 | bundle/initialize_position_bundle_with_metadata.ts:2787 | PARTIAL |  | key | `(memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 39 | bundle/initialize_position_bundle_with_metadata.ts:3374 | PARTIAL |  | key | `(memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
