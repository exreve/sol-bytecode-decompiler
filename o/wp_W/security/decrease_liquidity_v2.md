# decrease_liquidity_v2

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_decrease_liquidity_v2 (anchor); 97 functions reachable: ix_decrease_liquidity_v2, fn_24370, fn_11b3b8, accounts_decrease_liquidity_v2, memcpy, fn_147990, fn_11f980, fn_139720, fn_149678, fn_22210, fn_228d8, fn_21f70, ….

Reached through function pointers / tables (conditional): fn_24370 (entrypoint table entry chosen by the discriminator).

## Findings (rule engine)

- [low] cpi-unchecked-program: CPI to an account-supplied program id with no dominating check against a known id. CPI: program *(b + 0x30) (id not a constant, and not compared with a known program id in this function), data r[..q] · a program account (token_program_a) is checked, but no check dominating this CPI compares its id (fn_13f4b8:71)

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpool [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 1 | position [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 2 | position_token_account [str] | — | — | PARTIAL (+discriminator PARTIAL) | — | — |
| 3 | token_mint_a [str] | — | — | PARTIAL (+discriminator PARTIAL) | — | PARTIAL |
| 4 | token_mint_b [str] | — | — | PARTIAL (+discriminator PARTIAL) | — | PARTIAL |
| 5 | tick_array_lower [str] | — | PARTIAL | — | — | — |
| 6 | tick_array_upper [str] | — | PARTIAL | — | — | — |
| 7 | token_program_a [str] | — | — | — | PARTIAL | PARTIAL |
| 8 | token_owner_account_a [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 9 | token_vault_b [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 10 | token_vault_a [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 11 | token_owner_account_b [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 12 | token_program_b [str] | — | — | — | PARTIAL | PARTIAL |
| 13 | position_authority [str] | PARTIAL | — | — | — | — |
| 14 | memo_program [str] | — | — | — | PARTIAL | PARTIAL |

## Constraints per account

- whirlpool: owner PARTIAL (bundle/decrease_liquidity_v2.ts:193 via try_accounts_11a48); initialized PARTIAL (bundle/decrease_liquidity_v2.ts:193 via try_accounts_11a48); discriminator PARTIAL (bundle/decrease_liquidity_v2.ts:193 via try_accounts_11a48); writable PARTIAL (bundle/decrease_liquidity_v2.ts:350)
- position: owner PARTIAL (bundle/decrease_liquidity_v2.ts:230 via try_accounts_11b00); initialized PARTIAL (bundle/decrease_liquidity_v2.ts:230 via try_accounts_11b00); discriminator PARTIAL (bundle/decrease_liquidity_v2.ts:230 via try_accounts_11b00); writable PARTIAL (bundle/decrease_liquidity_v2.ts:393); key PARTIAL (bundle/decrease_liquidity_v2.ts:406); has_one PARTIAL (bundle/decrease_liquidity_v2.ts:406)
- position_token_account: owner PARTIAL (bundle/decrease_liquidity_v2.ts:242 via try_accounts_558); discriminator PARTIAL (bundle/decrease_liquidity_v2.ts:242 via try_accounts_558); initialized PARTIAL (bundle/decrease_liquidity_v2.ts:242 via try_accounts_558); raw PARTIAL (bundle/decrease_liquidity_v2.ts:421)
- token_mint_a: owner PARTIAL (bundle/decrease_liquidity_v2.ts:258 via try_accounts_610); discriminator PARTIAL (bundle/decrease_liquidity_v2.ts:258 via try_accounts_610); initialized PARTIAL (bundle/decrease_liquidity_v2.ts:258 via try_accounts_610); key PARTIAL (bundle/decrease_liquidity_v2.ts:435); address PARTIAL (bundle/decrease_liquidity_v2.ts:435)
- token_mint_b: owner PARTIAL (bundle/decrease_liquidity_v2.ts:275 via try_accounts_610); discriminator PARTIAL (bundle/decrease_liquidity_v2.ts:275 via try_accounts_610); initialized PARTIAL (bundle/decrease_liquidity_v2.ts:275 via try_accounts_610); key PARTIAL (bundle/decrease_liquidity_v2.ts:439); address PARTIAL (bundle/decrease_liquidity_v2.ts:439)
- tick_array_lower: count PARTIAL (bundle/decrease_liquidity_v2.ts:311); writable PARTIAL (bundle/decrease_liquidity_v2.ts:463)
- tick_array_upper: writable PARTIAL (bundle/decrease_liquidity_v2.ts:464)
- token_program_a: address PARTIAL (bundle/decrease_liquidity_v2.ts:209 via try_accounts_120); executable PARTIAL (bundle/decrease_liquidity_v2.ts:209 via try_accounts_120); key PARTIAL (bundle/decrease_liquidity_v2.ts:369)
- token_owner_account_a: owner PARTIAL (bundle/decrease_liquidity_v2.ts:292 via fn_2258); discriminator PARTIAL (bundle/decrease_liquidity_v2.ts:292 via fn_2258); initialized PARTIAL (bundle/decrease_liquidity_v2.ts:292 via fn_2258); writable PARTIAL (bundle/decrease_liquidity_v2.ts:440); raw PARTIAL (bundle/decrease_liquidity_v2.ts:450)
- token_vault_b: owner PARTIAL (bundle/decrease_liquidity_v2.ts:307 via fn_2258); discriminator PARTIAL (bundle/decrease_liquidity_v2.ts:307 via fn_2258); initialized PARTIAL (bundle/decrease_liquidity_v2.ts:307 via fn_2258); writable PARTIAL (bundle/decrease_liquidity_v2.ts:459); key PARTIAL (bundle/decrease_liquidity_v2.ts:462); raw PARTIAL (bundle/decrease_liquidity_v2.ts:462)
- token_vault_a: owner PARTIAL (bundle/decrease_liquidity_v2.ts:302 via fn_2258); discriminator PARTIAL (bundle/decrease_liquidity_v2.ts:302 via fn_2258); initialized PARTIAL (bundle/decrease_liquidity_v2.ts:302 via fn_2258); writable PARTIAL (bundle/decrease_liquidity_v2.ts:454); key PARTIAL (bundle/decrease_liquidity_v2.ts:457); raw PARTIAL (bundle/decrease_liquidity_v2.ts:457)
- token_owner_account_b: owner PARTIAL (bundle/decrease_liquidity_v2.ts:297 via fn_2258); discriminator PARTIAL (bundle/decrease_liquidity_v2.ts:297 via fn_2258); initialized PARTIAL (bundle/decrease_liquidity_v2.ts:297 via fn_2258); writable PARTIAL (bundle/decrease_liquidity_v2.ts:451); raw PARTIAL (bundle/decrease_liquidity_v2.ts:452)
- token_program_b: address PARTIAL (bundle/decrease_liquidity_v2.ts:214 via try_accounts_120); executable PARTIAL (bundle/decrease_liquidity_v2.ts:214 via try_accounts_120); key PARTIAL (bundle/decrease_liquidity_v2.ts:392)
- position_authority: signer PARTIAL (bundle/decrease_liquidity_v2.ts:224 via try_accounts_11718)
- memo_program: address PARTIAL (bundle/decrease_liquidity_v2.ts:219 via fn_12758); executable PARTIAL (bundle/decrease_liquidity_v2.ts:219 via fn_12758)

## CPIs

- entrypoint.ts:4258 [conditional] *(ac + 8) (account-supplied; (id not a constant, and not compared with a known program id in this function))
- entrypoint.ts:1170 [conditional] *(g + 8) (account-supplied; (id not a constant, and not compared with a known program id in this function))
- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))

## Dominance (checks on every path to the operation; across calls)

- entrypoint.ts:4258 CPI: 26 dominating checks (writable; owner; address; discriminator; initialized)
- entrypoint.ts:1170 CPI: 26 dominating checks (writable; owner; address; discriminator; initialized)
- entrypoint.ts:14045 CPI: 0 dominating checks

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:4258 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 27 dominating checks
- entrypoint.ts:1170 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 27 dominating checks
- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 0 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- entrypoint.ts:4258 CPI: ✗ `ld32(s60) != 0` · ✗ `at == 0` · `i > 0xa6` · `(g & 7) != 0` · ✗ `(g & 8) == 0` · ✗ `ld64(s688 + 0x18) > aw` · ✗ `ld64(s688 + 0x10) > ce` · `ld64(s1c0) == 0` · `ld64(s1c0) == 0` · `ld64(s1c0) == 0` · … 24 more
  - not required on some path: #13 (signer position_authority)
- entrypoint.ts:1170 CPI: `ld8(o) != 0` · ✗ `o == 0` · ✗ `0xa7 > j` · ✗ `ld8(s60 + 0x20) == 2` · `(g & 7) != 0` · ✗ `(g & 8) == 0` · ✗ `ld64(s688 + 0x18) > aw` · ✗ `ld64(s688 + 0x10) > ce` · `ld64(s1c0) == 0` · `ld64(s1c0) == 0` · … 25 more
  - not required on some path: #13 (signer position_authority)
- entrypoint.ts:14045 CPI: no conditions found
  - not required on some path: #13 (signer position_authority)

## Relations (equalities the checks establish)

- token_program_a.key == (constant address) (address, PARTIAL, bundle/decrease_liquidity_v2.ts:209)
- token_program_b.key == (constant address) (address, PARTIAL, bundle/decrease_liquidity_v2.ts:214)
- memo_program.key == (constant address) (address, PARTIAL, bundle/decrease_liquidity_v2.ts:219)
- token_program_a.key == (constant address) (address, PARTIAL, bundle/decrease_liquidity_v2.ts:369)
- token_program_b.key == (constant address) (address, PARTIAL, bundle/decrease_liquidity_v2.ts:392)
- position.whirlpool == whirlpool.key (field_eq, PARTIAL, bundle/decrease_liquidity_v2.ts:406)
- token_mint_a.key == (constant address) (address, PARTIAL, bundle/decrease_liquidity_v2.ts:435)
- token_mint_b.key == (constant address) (address, PARTIAL, bundle/decrease_liquidity_v2.ts:439)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool.key, position_token_account.key, tick_array_lower.key, tick_array_upper.key, token_owner_account_a.key, token_owner_account_b.key, position_authority.key
- whirlpool.data: partially-validated (owner partial @accounts_decrease_liquidity_v2:13, discriminator partial @accounts_decrease_liquidity_v2:13, initialized partial @accounts_decrease_liquidity_v2:13)
- position.key: partially-validated (key partial @accounts_decrease_liquidity_v2:226, has_one partial @accounts_decrease_liquidity_v2:226)
- position.data: partially-validated (owner partial @accounts_decrease_liquidity_v2:50, discriminator partial @accounts_decrease_liquidity_v2:50, initialized partial @accounts_decrease_liquidity_v2:50)
- position_token_account.data: partially-validated (owner partial @accounts_decrease_liquidity_v2:62, discriminator partial @accounts_decrease_liquidity_v2:62, initialized partial @accounts_decrease_liquidity_v2:62)
- token_mint_a.key: partially-validated (address partial @accounts_decrease_liquidity_v2:255, key partial @accounts_decrease_liquidity_v2:255)
- token_mint_a.data: partially-validated (owner partial @accounts_decrease_liquidity_v2:78, discriminator partial @accounts_decrease_liquidity_v2:78, initialized partial @accounts_decrease_liquidity_v2:78)
- token_mint_b.key: partially-validated (address partial @accounts_decrease_liquidity_v2:259, key partial @accounts_decrease_liquidity_v2:259)
- token_mint_b.data: partially-validated (owner partial @accounts_decrease_liquidity_v2:95, discriminator partial @accounts_decrease_liquidity_v2:95, initialized partial @accounts_decrease_liquidity_v2:95)
- token_program_a.key: partially-validated (address partial @accounts_decrease_liquidity_v2:29, key partial @accounts_decrease_liquidity_v2:189)
- token_owner_account_a.data: partially-validated (owner partial @accounts_decrease_liquidity_v2:112, discriminator partial @accounts_decrease_liquidity_v2:112, initialized partial @accounts_decrease_liquidity_v2:112)
- token_vault_b.key: partially-validated (key partial @accounts_decrease_liquidity_v2:282)
- token_vault_b.data: partially-validated (owner partial @accounts_decrease_liquidity_v2:127, discriminator partial @accounts_decrease_liquidity_v2:127, initialized partial @accounts_decrease_liquidity_v2:127)
- token_vault_a.key: partially-validated (key partial @accounts_decrease_liquidity_v2:277)
- token_vault_a.data: partially-validated (owner partial @accounts_decrease_liquidity_v2:122, discriminator partial @accounts_decrease_liquidity_v2:122, initialized partial @accounts_decrease_liquidity_v2:122)
- token_owner_account_b.data: partially-validated (owner partial @accounts_decrease_liquidity_v2:117, discriminator partial @accounts_decrease_liquidity_v2:117, initialized partial @accounts_decrease_liquidity_v2:117)
- token_program_b.key: partially-validated (address partial @accounts_decrease_liquidity_v2:34, key partial @accounts_decrease_liquidity_v2:212)
- memo_program.key: partially-validated (address partial @accounts_decrease_liquidity_v2:39)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | entrypoint.ts:6282 | PARTIAL |  | count | `c == 0` | anchor::AccountNotEnoughKeys |
| 1 | entrypoint.ts:6294 | PARTIAL |  | writable | `ld8(ld64(j) + 2) == 0` | anchor::AccountNotMutable |
| 2 | entrypoint.ts:6472 | PARTIAL |  | writable | `ld8(ld64(j) + 2) == 0` | anchor::AccountNotMutable |
| 3 | entrypoint.ts:6548 | PARTIAL |  | writable | `ld8(ld64(j) + 2) == 0` | anchor::AccountNotMutable |
| 4 | entrypoint.ts:6576 | PARTIAL |  | writable | `ld8(ld64(j) + 2) == 0` | anchor::AccountNotMutable |
| 5 | entrypoint.ts:6604 | PARTIAL |  | writable | `ld8(ld64(j) + 2) == 0` | anchor::AccountNotMutable |
| 6 | entrypoint.ts:6632 | PARTIAL |  | writable | `ld8(ld64(j) + 2) == 0` | anchor::AccountNotMutable |
| 7 | entrypoint.ts:6660 | PARTIAL |  | writable | `ld8(ld64(j) + 2) == 0` | anchor::AccountNotMutable |
| 8 | entrypoint.ts:6688 | PARTIAL |  | writable | `ld8(ld64(j) + 2) == 0` | anchor::AccountNotMutable |
| 9 | bundle/decrease_liquidity_v2.ts:193 | PARTIAL | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `f == 0` | return |
| 10 | bundle/decrease_liquidity_v2.ts:209 | PARTIAL | token_program_a | address, executable (via try_accounts_120 (count, address, executable)) | `j != 2` | return |
| 11 | bundle/decrease_liquidity_v2.ts:214 | PARTIAL | token_program_b | address, executable (via try_accounts_120 (count, address, executable)) | `k != 2` | return |
| 12 | bundle/decrease_liquidity_v2.ts:219 | PARTIAL | memo_program | address, executable (via fn_12758 (count, address, executable)) | `m != 2` | return |
| 13 | bundle/decrease_liquidity_v2.ts:224 | PARTIAL | position_authority | signer (via try_accounts_11718 (count, signer)) | `o != 2` | return |
| 14 | bundle/decrease_liquidity_v2.ts:230 | PARTIAL | position | owner, initialized, discriminator (via try_accounts_11b00 (count, owner, initialized, discriminator)) | `position == 0` | return |
| 15 | bundle/decrease_liquidity_v2.ts:242 | PARTIAL | position_token_account | owner, discriminator, initialized (via try_accounts_558 (count, owner, discriminator, initialized)) | `ld32(s408 + 0x50) == 2` | return |
| 16 | bundle/decrease_liquidity_v2.ts:258 | PARTIAL | token_mint_a | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `aa == 2` | return |
| 17 | bundle/decrease_liquidity_v2.ts:275 | PARTIAL | token_mint_b | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `ab == 2` | return |
| 18 | bundle/decrease_liquidity_v2.ts:292 | PARTIAL | token_owner_account_a | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `ac != 2` | return |
| 19 | bundle/decrease_liquidity_v2.ts:297 | PARTIAL | token_owner_account_b | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `ae != 2` | return |
| 20 | bundle/decrease_liquidity_v2.ts:302 | PARTIAL | token_vault_a | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `ag != 2` | return |
| 21 | bundle/decrease_liquidity_v2.ts:307 | PARTIAL | token_vault_b | owner, discriminator, initialized (via fn_2258 (count, owner, discriminator, initialized)) | `ai != 2` | return |
| 22 | bundle/decrease_liquidity_v2.ts:311 | PARTIAL | tick_array_lower | count | `ak == 0` | anchor::AccountNotEnoughKeys |
| 23 | bundle/decrease_liquidity_v2.ts:350 | PARTIAL | whirlpool | writable | `ld8(ld64(sae8 + 0x20) + 0x29 /* is_writable */) == 0` | anchor::ConstraintMut |
| 24 | bundle/decrease_liquidity_v2.ts:369 | PARTIAL | token_program_a | key, address | `(memcmp(s40, s20, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 25 | bundle/decrease_liquidity_v2.ts:392 | PARTIAL | token_program_b | key, address | `!((memcmp(s40, s20, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 26 | bundle/decrease_liquidity_v2.ts:393 | PARTIAL | position | writable | `position.is_writable == 0` | anchor::ConstraintMut |
| 27 | bundle/decrease_liquidity_v2.ts:406 | PARTIAL | position | key, has_one | `(memcmp(s40, s20, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 28 | bundle/decrease_liquidity_v2.ts:421 | PARTIAL | position_token_account | raw | `!((memcmp(ld64(sb10 + 0x18) + 0x28, s1b0, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 29 | bundle/decrease_liquidity_v2.ts:422 | PARTIAL | position_token_account | raw | `ld64(ld64(sb10 + 0x18) + 0x68) != 1` | anchor::ConstraintRaw |
| 30 | bundle/decrease_liquidity_v2.ts:435 | PARTIAL | token_mint_a | key, address | `!((memcmp(s40, s20, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 31 | bundle/decrease_liquidity_v2.ts:439 | PARTIAL | token_mint_b | key, address | `!((memcmp(s40, s20, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 32 | bundle/decrease_liquidity_v2.ts:440 | PARTIAL | token_owner_account_a | writable | `ld8(ld64(ld64(sb38) + 0x20) + 0x29) == 0` | anchor::ConstraintMut |
| 33 | bundle/decrease_liquidity_v2.ts:450 | PARTIAL | token_owner_account_a | raw | `!((memcmp(ld64(sb38) + 0x28, s550, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 34 | bundle/decrease_liquidity_v2.ts:451 | PARTIAL | token_owner_account_b | writable | `!(ld8(ld64(ld64(sb40) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 35 | bundle/decrease_liquidity_v2.ts:452 | PARTIAL | token_owner_account_b | raw | `!((memcmp(ld64(sb40) + 0x28, s510, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 36 | bundle/decrease_liquidity_v2.ts:454 | PARTIAL | token_vault_a | writable | `token_vault_a.is_writable == 0` | anchor::ConstraintMut |
| 37 | bundle/decrease_liquidity_v2.ts:457 | PARTIAL | token_vault_a | key, raw | `!((memcmp(s468, s530, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 38 | bundle/decrease_liquidity_v2.ts:459 | PARTIAL | token_vault_b | writable | `token_vault_b.is_writable == 0` | anchor::ConstraintMut |
| 39 | bundle/decrease_liquidity_v2.ts:462 | PARTIAL | token_vault_b | key, raw | `!((memcmp(s468, s4f0, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 40 | bundle/decrease_liquidity_v2.ts:463 | PARTIAL | tick_array_lower | writable | `!(ld8(ld64(sb58) + 0x29) != 0)` | anchor::ConstraintMut |
| 41 | bundle/decrease_liquidity_v2.ts:464 | PARTIAL | tick_array_upper | writable | `!(ld8(ld64(sb60) + 0x29) != 0)` | anchor::ConstraintMut |
| 42 | entrypoint.ts:5320 | PARTIAL |  | owner | `ld64(b + 0x28) != 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */` | anchor::AccountOwnedByWrongProgram |
| 43 | entrypoint.ts:5328 | PARTIAL |  | owner | `ld64(b + 0x30) != 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */` | anchor::AccountOwnedByWrongProgram |
| 44 | entrypoint.ts:5336 | PARTIAL |  | owner | `ld64(b + 0x38) != 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */` | anchor::AccountOwnedByWrongProgram |
| 45 | entrypoint.ts:5344 | PARTIAL |  | owner | `!(ld64(b + 0x40) == 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */)` | anchor::AccountOwnedByWrongProgram |
| 46 | entrypoint.ts:5562 | PARTIAL |  | address | `f != ld64(c)` | anchor::ConstraintAddress |
| 47 | entrypoint.ts:5578 | PARTIAL |  | address | `!memeq(b + 0x10, c + 0x10, 0x10)` | anchor::ConstraintAddress |
| 48 | entrypoint.ts:5227 | PARTIAL |  | owner | `ld64(b + 0x28) != 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */` | anchor::AccountOwnedByWrongProgram |
| 49 | entrypoint.ts:5235 | PARTIAL |  | owner | `ld64(b + 0x30) != 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */` | anchor::AccountOwnedByWrongProgram |
| 50 | entrypoint.ts:5243 | PARTIAL |  | owner | `ld64(b + 0x38) != 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */` | anchor::AccountOwnedByWrongProgram |
| 51 | entrypoint.ts:5251 | PARTIAL |  | owner | `!(ld64(b + 0x40) == 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */)` | anchor::AccountOwnedByWrongProgram |
| 52 | entrypoint.ts:5415 | PARTIAL |  | owner | `ld64(b + 0x28) != 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */` | anchor::AccountOwnedByWrongProgram |
| 53 | entrypoint.ts:5423 | PARTIAL |  | owner | `ld64(b + 0x30) != 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */` | anchor::AccountOwnedByWrongProgram |
| 54 | entrypoint.ts:5431 | PARTIAL |  | owner | `ld64(b + 0x38) != 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */` | anchor::AccountOwnedByWrongProgram |
| 55 | entrypoint.ts:5450 | PARTIAL |  | owner | `f != 0xfc` | anchor::AccountOwnedByWrongProgram |
| 56 | entrypoint.ts:5458 | PARTIAL |  | owner | `ld64(b + 0x28) != 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */` | anchor::AccountOwnedByWrongProgram |
| 57 | entrypoint.ts:5466 | PARTIAL |  | owner | `ld64(b + 0x30) != 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */` | anchor::AccountOwnedByWrongProgram |
| 58 | entrypoint.ts:5474 | PARTIAL |  | owner | `ld64(b + 0x38) != 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */` | anchor::AccountOwnedByWrongProgram |
| 59 | entrypoint.ts:5494 | PARTIAL |  | discriminator | `h == 0x163` | anchor::AccountDiscriminatorMismatch |
| 60 | entrypoint.ts:5502 | PARTIAL |  | initialized | `0x6d > h` | anchor::AccountNotInitialized |
| 61 | entrypoint.ts:5528 | PARTIAL |  | discriminator | `h != 0xa5` | anchor::AccountDiscriminatorMismatch |
| 62 | entrypoint.ts:4371 | PARTIAL |  | key | `!(aw != 0 && !keyeq(ae + 0x20, "11111111111111111111111111111111"))` | anchor::InstructionFallbackNotFound |
| 63 | entrypoint.ts:438 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 64 | entrypoint.ts:447 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 65 | bundle/decrease_liquidity_v2.ts:836 | PARTIAL |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 66 | bundle/decrease_liquidity_v2.ts:841 | PARTIAL |  | key, address | `(memcmp(h, 0x100152100 /* &MEMO_PROGRAM */, 0x20) as u32) != 0` | anchor::InvalidProgramId |
| 67 | bundle/decrease_liquidity_v2.ts:851 | PARTIAL | g? | executable | `g.executable == 0` | anchor::InvalidProgramExecutable |
| 68 | entrypoint.ts:618 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 69 | entrypoint.ts:627 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 70 | entrypoint.ts:4880 | PARTIAL |  | writable | `!(ld8(b + 2) != 0)` | anchor::AccountNotMutable |
| 71 | entrypoint.ts:4881 | PARTIAL |  | owner | `ld64(b + 0x28) != 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */` | anchor::AccountOwnedByWrongProgram |
| 72 | entrypoint.ts:4889 | PARTIAL |  | owner | `ld64(b + 0x30) != 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */` | anchor::AccountOwnedByWrongProgram |
| 73 | entrypoint.ts:4897 | PARTIAL |  | owner | `ld64(b + 0x38) != 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */` | anchor::AccountOwnedByWrongProgram |
| 74 | entrypoint.ts:4905 | PARTIAL |  | owner | `!(ld64(b + 0x40) == 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */)` | anchor::AccountOwnedByWrongProgram |
| 75 | entrypoint.ts:13592 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 76 | entrypoint.ts:13514 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
