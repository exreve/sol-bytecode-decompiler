# initialize_position_bundle

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_initialize_position_bundle (anchor); 52 functions reachable: ix_initialize_position_bundle, accounts_initialize_position_bundle, memcpy, fn_6b9a8, fn_6c748, fn_a5308, fn_147990, fn_11f980, fn_139720, fn_149678, fn_83078, fn_27d8, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | position_bundle_owner [str] | — | — | — | — | — |
| 1 | rent [str] | — | — | — | — | found |
| 2 | position_bundle [str] | — | PARTIAL | PARTIAL | — | — |
| 3 | position_bundle_mint [str] | PARTIAL | PARTIAL | — | — | — |
| 4 | position_bundle_token_account [str] | — | PARTIAL | PARTIAL | — | — |
| 5 | token_program [str] | — | — | — | found | found |
| 6 | funder [str] | found | PARTIAL | — | — | — |
| 7 | associated_token_program [str] | — | — | — | found | found |
| 8 | system_program [str] | — | — | — | found | found |

## Constraints per account

- position_bundle_owner: no checks found
- rent: address found (bundle/initialize_position_bundle.ts:239 via try_accounts_11990)
- position_bundle: key found (bundle/initialize_position_bundle.ts:276); pda found (bundle/initialize_position_bundle.ts:276); writable PARTIAL (bundle/initialize_position_bundle.ts:285); rent_exempt PARTIAL (bundle/initialize_position_bundle.ts:346); owner PARTIAL (bundle/initialize_position_bundle.ts:1385 via fn_3240); initialized PARTIAL (bundle/initialize_position_bundle.ts:1385 via fn_3240)
- position_bundle_mint: writable PARTIAL (bundle/initialize_position_bundle.ts:386); signer PARTIAL (bundle/initialize_position_bundle.ts:395); rent_exempt PARTIAL (bundle/initialize_position_bundle.ts:455)
- position_bundle_token_account: writable PARTIAL (bundle/initialize_position_bundle.ts:488); rent_exempt PARTIAL (bundle/initialize_position_bundle.ts:550); owner PARTIAL (bundle/initialize_position_bundle.ts:1898 via Account_try_from_unchecked); initialized PARTIAL (bundle/initialize_position_bundle.ts:1898 via Account_try_from_unchecked)
- token_program: address found (bundle/initialize_position_bundle.ts:228 via fn_129a0); executable found (bundle/initialize_position_bundle.ts:228 via fn_129a0); key PARTIAL (bundle/initialize_position_bundle.ts:564)
- funder: signer found (bundle/initialize_position_bundle.ts:223 via try_accounts_11718); writable PARTIAL (bundle/initialize_position_bundle.ts:506)
- associated_token_program: address found (bundle/initialize_position_bundle.ts:252 via fn_12510); executable found (bundle/initialize_position_bundle.ts:252 via fn_12510)
- system_program: address found (bundle/initialize_position_bundle.ts:233 via fn_122e8); executable found (bundle/initialize_position_bundle.ts:233 via fn_122e8)

## CPIs

- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))
- shared.ts:20063 [conditional] program not decoded

## PDAs derived

- bundle/initialize_position_bundle.ts:268 find_program_address(["position_bundle", *s108], program *(ld64(s1d8)))
- compared with provided accounts: position_bundle found

## Dominance (checks on every path to the operation; across calls)

- entrypoint.ts:14045 CPI: 20 dominating checks (signer funder; address token_program; executable token_program; address system_program; executable system_program; address rent; address associated_token_program; executable associated_token_program; …)
- shared.ts:20063 CPI: 8 dominating checks (signer funder; address token_program; executable token_program; address system_program; executable system_program; address rent; address associated_token_program; executable associated_token_program; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 23 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- entrypoint.ts:14045 CPI: `u109 != -1` · `u102 != -1` · `u96 != -1` · `u86 != -1` · `u81 != -1` · `u72 != -1` · `u66 != -1` · `u58 != -1` · ✗ `r == 0x8000000000000000` · `u33 != -1` · … 6 more
- shared.ts:20063 CPI: `bo != -1` · `bm != -1` · `bh != -1` · `bf != -1` · `u228 != -1` · `u82 != -1` · `x > g` · ✗ `(memcmp(s40, s238, 0x20) as u32) == 0` #24 · `g != 0` · `(memcmp(sa8, s160, 0x20) as u32) == 0` #8 · … 9 more
  - not required on some path: #12 (signer position_bundle_mint)

## Relations (equalities the checks establish)

- token_program.key == (constant address) (address, found, bundle/initialize_position_bundle.ts:228)
- system_program.key == (constant address) (address, found, bundle/initialize_position_bundle.ts:233)
- rent.key == (constant address) (address, found, bundle/initialize_position_bundle.ts:239)
- associated_token_program.key == (constant address) (address, found, bundle/initialize_position_bundle.ts:252)
- token_program.key == (constant address) (address, PARTIAL, bundle/initialize_position_bundle.ts:564)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): position_bundle_owner.key, position_bundle_mint.key, position_bundle_token_account.key, funder.key
- rent.key: validated (address found @accounts_initialize_position_bundle:62)
- position_bundle.key: validated (pda found @accounts_initialize_position_bundle:99, key found @accounts_initialize_position_bundle:99)
- position_bundle.data: partially-validated (owner partial @fn_a1098:345, initialized partial @fn_a1098:345)
- position_bundle_token_account.data: partially-validated (owner partial @fn_a4608:105, initialized partial @fn_a4608:105)
- token_program.key: validated (address found @accounts_initialize_position_bundle:51, key partial @accounts_initialize_position_bundle:387)
- associated_token_program.key: validated (address found @accounts_initialize_position_bundle:75)
- system_program.key: validated (address found @accounts_initialize_position_bundle:56)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/initialize_position_bundle.ts:186 | found |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 1 | bundle/initialize_position_bundle.ts:192 | found |  | count | `f == 1` | anchor::AccountNotEnoughKeys |
| 2 | bundle/initialize_position_bundle.ts:196 | found |  | count | `f == 2` | anchor::AccountNotEnoughKeys |
| 3 | bundle/initialize_position_bundle.ts:223 | found | funder | signer (via try_accounts_11718 (count, signer)) | `k != 2` | return |
| 4 | bundle/initialize_position_bundle.ts:228 | found | token_program | address, executable (via fn_129a0 (count, address, executable)) | `m != 2` | return |
| 5 | bundle/initialize_position_bundle.ts:233 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `o != 2` | return |
| 6 | bundle/initialize_position_bundle.ts:239 | found | rent | address (via try_accounts_11990 (count, address)) | `q == 0` | return |
| 7 | bundle/initialize_position_bundle.ts:252 | found | associated_token_program | address, executable (via fn_12510 (count, address, executable)) | `t != 2` | return |
| 8 | bundle/initialize_position_bundle.ts:276 | found | position_bundle | key, pda | `!((memcmp(sa8, s160, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 9 | bundle/initialize_position_bundle.ts:285 | PARTIAL | position_bundle | writable | `position_bundle.is_writable == 0` | anchor::ConstraintMut |
| 10 | bundle/initialize_position_bundle.ts:346 | PARTIAL | position_bundle | rent_exempt | `bb > ld64(s458)` | anchor::ConstraintRentExempt |
| 11 | bundle/initialize_position_bundle.ts:386 | PARTIAL | position_bundle_mint | writable | `position_bundle_mint.is_writable == 0` | anchor::ConstraintMut |
| 12 | bundle/initialize_position_bundle.ts:395 | PARTIAL | position_bundle_mint | signer | `position_bundle_mint.is_signer == 0` | anchor::ConstraintSigner |
| 13 | bundle/initialize_position_bundle.ts:455 | PARTIAL | position_bundle_mint | rent_exempt | `bw > ld64(s458)` | anchor::ConstraintRentExempt |
| 14 | bundle/initialize_position_bundle.ts:488 | PARTIAL | position_bundle_token_account | writable | `position_bundle_token_account.is_writable == 0` | anchor::ConstraintMut |
| 15 | bundle/initialize_position_bundle.ts:506 | PARTIAL | funder | writable | `cd == 0x800000000000001a /* Ok */` | anchor::ConstraintMut |
| 16 | bundle/initialize_position_bundle.ts:550 | PARTIAL | position_bundle_token_account | rent_exempt | `cq > ld64(s470)` | anchor::ConstraintRentExempt |
| 17 | bundle/initialize_position_bundle.ts:560 | PARTIAL | funder | writable | `funder.is_writable == 0` | anchor::ConstraintMut |
| 18 | bundle/initialize_position_bundle.ts:564 | PARTIAL | token_program | key, address | `(memcmp(s48, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 19 | bundle/initialize_position_bundle.ts:968 | PARTIAL | position_bundle |  | `f != 2` | return |
| 20 | bundle/initialize_position_bundle.ts:1018 | PARTIAL | position_bundle_token_account |  | `r != 0x800000000000001a /* Ok */` | return |
| 21 | bundle/initialize_position_bundle.ts:1024 | PARTIAL | position_bundle_token_account |  | `t != 2` | return |
| 22 | entrypoint.ts:323 | found |  | address | `f == 0` | anchor::AccountSysvarMismatch |
| 23 | entrypoint.ts:336 | PARTIAL |  | address | `!(i >= 8 && (i != 0x10 && (i & -8) != 8))` | anchor::AccountSysvarMismatch |
| 24 | bundle/initialize_position_bundle.ts:1057 | PARTIAL |  | key | `(memcmp(s40, s238, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 25 | bundle/initialize_position_bundle.ts:1385 | PARTIAL | position_bundle | owner, initialized (via fn_3240 (owner, initialized)) | `ld64(s88) == 0` | return |
| 26 | bundle/initialize_position_bundle.ts:1440 | PARTIAL |  | key | `(memcmp(s40, s268, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 27 | bundle/initialize_position_bundle.ts:1898 | PARTIAL | position_bundle_token_account | owner, initialized (via Account_try_from_unchecked (owner, initialized)) | `ld32(sb8 + 0x90) == 2` | return |
| 28 | bundle/initialize_position_bundle.ts:1920 | PARTIAL |  | key | `(memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 29 | bundle/initialize_position_bundle.ts:2016 | PARTIAL |  | key | `(memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 30 | bundle/initialize_position_bundle.ts:2201 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 31 | bundle/initialize_position_bundle.ts:2210 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 32 | ix/open_position_with_token_extensions.ts:1667 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
