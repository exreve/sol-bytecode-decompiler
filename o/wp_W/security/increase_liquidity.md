# increase_liquidity

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_increase_liquidity (anchor); 84 functions reachable: ix_increase_liquidity, fn_266f0, accounts_increase_liquidity, memcpy, fn_147990, fn_11f980, fn_139720, fn_149678, fn_22210, fn_21f70, fn_228d8, fn_224b0, ….

Reached through function pointers / tables (conditional): fn_266f0 (entrypoint table entry chosen by the discriminator).

## Findings (rule engine)

- [low] cpi-unchecked-program: CPI to an account-supplied program id with no dominating check against a known id. CPI: program *(b + 0x30) (id not a constant, and not compared with a known program id in this function), data r[..q] · a program account (token_program) is checked, but no check dominating this CPI compares its id (fn_13f4b8:71)

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpool [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 1 | position [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 2 | position_token_account [str] | — | — | PARTIAL (+discriminator PARTIAL) | — | — |
| 3 | token_owner_account_a [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 4 | token_owner_account_b [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 5 | tick_array_lower [str] | — | PARTIAL | — | — | — |
| 6 | tick_array_upper [str] | — | PARTIAL | — | — | — |
| 7 | token_program [str] | — | — | — | PARTIAL | PARTIAL |
| 8 | token_vault_b [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 9 | token_vault_a [str] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |
| 10 | position_authority [str] | PARTIAL | — | — | — | — |

## Constraints per account

- whirlpool: owner PARTIAL (bundle/increase_liquidity.ts:146 via try_accounts_11a48); initialized PARTIAL (bundle/increase_liquidity.ts:146 via try_accounts_11a48); discriminator PARTIAL (bundle/increase_liquidity.ts:146 via try_accounts_11a48); writable PARTIAL (bundle/increase_liquidity.ts:281)
- position: owner PARTIAL (bundle/increase_liquidity.ts:170 via try_accounts_11b00); initialized PARTIAL (bundle/increase_liquidity.ts:170 via try_accounts_11b00); discriminator PARTIAL (bundle/increase_liquidity.ts:170 via try_accounts_11b00); writable PARTIAL (bundle/increase_liquidity.ts:307); key PARTIAL (bundle/increase_liquidity.ts:320); has_one PARTIAL (bundle/increase_liquidity.ts:320)
- position_token_account: owner PARTIAL (bundle/increase_liquidity.ts:182 via try_accounts_558); discriminator PARTIAL (bundle/increase_liquidity.ts:182 via try_accounts_558); initialized PARTIAL (bundle/increase_liquidity.ts:182 via try_accounts_558); state PARTIAL (bundle/increase_liquidity.ts:334); key PARTIAL (bundle/increase_liquidity.ts:334); raw PARTIAL (bundle/increase_liquidity.ts:334)
- token_owner_account_a: owner PARTIAL (bundle/increase_liquidity.ts:198 via try_accounts_11f50); discriminator PARTIAL (bundle/increase_liquidity.ts:198 via try_accounts_11f50); initialized PARTIAL (bundle/increase_liquidity.ts:198 via try_accounts_11f50); writable PARTIAL (bundle/increase_liquidity.ts:345); raw PARTIAL (bundle/increase_liquidity.ts:355)
- token_owner_account_b: owner PARTIAL (bundle/increase_liquidity.ts:214 via try_accounts_11f50); discriminator PARTIAL (bundle/increase_liquidity.ts:214 via try_accounts_11f50); initialized PARTIAL (bundle/increase_liquidity.ts:214 via try_accounts_11f50); writable PARTIAL (bundle/increase_liquidity.ts:356); raw PARTIAL (bundle/increase_liquidity.ts:357)
- tick_array_lower: count PARTIAL (bundle/increase_liquidity.ts:241); writable PARTIAL (bundle/increase_liquidity.ts:368)
- tick_array_upper: writable PARTIAL (bundle/increase_liquidity.ts:369)
- token_program: address PARTIAL (bundle/increase_liquidity.ts:160 via fn_129a0); executable PARTIAL (bundle/increase_liquidity.ts:160 via fn_129a0); key PARTIAL (bundle/increase_liquidity.ts:293)
- token_vault_b: owner PARTIAL (bundle/increase_liquidity.ts:237 via fn_20f8); discriminator PARTIAL (bundle/increase_liquidity.ts:237 via fn_20f8); initialized PARTIAL (bundle/increase_liquidity.ts:237 via fn_20f8); writable PARTIAL (bundle/increase_liquidity.ts:364); key PARTIAL (bundle/increase_liquidity.ts:367); raw PARTIAL (bundle/increase_liquidity.ts:367)
- token_vault_a: owner PARTIAL (bundle/increase_liquidity.ts:233 via fn_20f8); discriminator PARTIAL (bundle/increase_liquidity.ts:233 via fn_20f8); initialized PARTIAL (bundle/increase_liquidity.ts:233 via fn_20f8); writable PARTIAL (bundle/increase_liquidity.ts:359); key PARTIAL (bundle/increase_liquidity.ts:362); raw PARTIAL (bundle/increase_liquidity.ts:362)
- position_authority: signer PARTIAL (bundle/increase_liquidity.ts:164 via try_accounts_11718)

## CPIs

- entrypoint.ts:1211 [conditional] n + 8 (account-supplied; (id not a constant, and not compared with a known program id in this function)).Transfer — accounts source: h.key w, destination: g.key w, authority: f.key s — amount: ld64(a + 0x20) — PDA signer: b[..c]
- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))

## Dominance (checks on every path to the operation; across calls)

- entrypoint.ts:1211 TOKEN_TRANSFER, PDA_SIGNATURE: 26 dominating checks (writable; owner; address; discriminator; initialized)
- entrypoint.ts:14045 CPI: 0 dominating checks

## Authority (who enables each value movement / authority change)

- entrypoint.ts:1211 TOKEN_TRANSFER, PDA_SIGNATURE: signer position_authority (PARTIAL); pda PDA signature b[..c]

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:1211 TOKEN_TRANSFER, PDA_SIGNATURE n + 8.Transfer [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer position_authority (partial); pda PDA signature b[..c]
  - [found] signer related to a stored authority (or PDA signature) — PDA signature b[..c]
  - [NOT FOUND] source account bound — h: not an identified account
  - [NOT FOUND] destination bound (owner / mint / key) — g: not an identified account
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [NOT FOUND] token program id — (id not a constant, and not compared with a known program id in this function)
  - [found] relevant checks on every path — 29 dominating checks
- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 0 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- entrypoint.ts:1211 TOKEN_TRANSFER, PDA_SIGNATURE n + 8.Transfer ⇐ signer position_authority (PARTIAL)
- entrypoint.ts:1211 TOKEN_TRANSFER, PDA_SIGNATURE n + 8.Transfer ⇐ pda PDA signature b[..c]

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- entrypoint.ts:1211 TOKEN_TRANSFER, PDA_SIGNATURE n + 8.Transfer: ✗ `bt > ld64(s708)` · ✗ `bu > ld64(s710)` · `ld64(s1c0) == 0` · `ld64(s1c0) == 3` · ✗ `bi == 0` · `ld64(s1c0) == 3` · ✗ `az == 2` · ✗ `av == 0` · ✗ `0 > (ld64(s700 + 8) as i64)` · ✗ `(ld64(s700) \| ld64(s700 + 8)) == 0` · … 13 more
  - not required on some path: #13 (signer position_authority)
- entrypoint.ts:14045 CPI: no conditions found
  - not required on some path: #13 (signer position_authority)

## Relations (equalities the checks establish)

- token_program.key == (constant address) (address, PARTIAL, bundle/increase_liquidity.ts:160)
- token_program.key == (constant address) (address, PARTIAL, bundle/increase_liquidity.ts:293)
- position.whirlpool == whirlpool.key (field_eq, PARTIAL, bundle/increase_liquidity.ts:320)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool.key, token_owner_account_a.key, token_owner_account_b.key, tick_array_lower.key, tick_array_upper.key, position_authority.key
- whirlpool.data: partially-validated (owner partial @accounts_increase_liquidity:12, discriminator partial @accounts_increase_liquidity:12, initialized partial @accounts_increase_liquidity:12)
- position.key: partially-validated (key partial @accounts_increase_liquidity:186, has_one partial @accounts_increase_liquidity:186)
- position.data: partially-validated (owner partial @accounts_increase_liquidity:36, discriminator partial @accounts_increase_liquidity:36, initialized partial @accounts_increase_liquidity:36)
- position_token_account.key: partially-validated (key partial @accounts_increase_liquidity:200)
- position_token_account.data: partially-validated (owner partial @accounts_increase_liquidity:48, discriminator partial @accounts_increase_liquidity:48, initialized partial @accounts_increase_liquidity:48)
- token_owner_account_a.data: partially-validated (owner partial @accounts_increase_liquidity:64, discriminator partial @accounts_increase_liquidity:64, initialized partial @accounts_increase_liquidity:64)
- token_owner_account_b.data: partially-validated (owner partial @accounts_increase_liquidity:80, discriminator partial @accounts_increase_liquidity:80, initialized partial @accounts_increase_liquidity:80)
- token_program.key: partially-validated (address partial @accounts_increase_liquidity:26, key partial @accounts_increase_liquidity:159)
- token_vault_b.key: partially-validated (key partial @accounts_increase_liquidity:233)
- token_vault_b.data: partially-validated (owner partial @accounts_increase_liquidity:103, discriminator partial @accounts_increase_liquidity:103, initialized partial @accounts_increase_liquidity:103)
- token_vault_a.key: partially-validated (key partial @accounts_increase_liquidity:228)
- token_vault_a.data: partially-validated (owner partial @accounts_increase_liquidity:99, discriminator partial @accounts_increase_liquidity:99, initialized partial @accounts_increase_liquidity:99)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | entrypoint.ts:7146 | PARTIAL |  | count | `c == 0` | anchor::AccountNotEnoughKeys |
| 1 | entrypoint.ts:7161 | PARTIAL |  | writable | `ld8(ld64(k) + 2) == 0` | anchor::AccountNotMutable |
| 2 | entrypoint.ts:7237 | PARTIAL |  | count | `l >= p` | anchor::AccountNotEnoughKeys |
| 3 | entrypoint.ts:7255 | PARTIAL |  | writable | `u == 0` | anchor::AccountNotMutable |
| 4 | entrypoint.ts:7269 | PARTIAL |  | count | `l >= p` | anchor::AccountNotEnoughKeys |
| 5 | entrypoint.ts:7304 | PARTIAL |  | writable | `u == 0` | anchor::AccountNotMutable |
| 6 | entrypoint.ts:7335 | PARTIAL |  | writable | `u == 0` | anchor::AccountNotMutable |
| 7 | entrypoint.ts:7365 | PARTIAL |  | writable | `ld8(ld64(h) + 2) == 0` | anchor::AccountNotMutable |
| 8 | entrypoint.ts:7396 | PARTIAL |  | writable | `ld8(ld64(h) + 2) == 0` | anchor::AccountNotMutable |
| 9 | entrypoint.ts:7426 | PARTIAL |  | writable | `ld8(ld64(y) + 2) == 0` | anchor::AccountNotMutable |
| 10 | entrypoint.ts:7456 | PARTIAL |  | writable | `ld8(ld64(ac) + 2) == 0` | anchor::AccountNotMutable |
| 11 | bundle/increase_liquidity.ts:146 | PARTIAL | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `f == 0` | return |
| 12 | bundle/increase_liquidity.ts:160 | PARTIAL | token_program | address, executable (via fn_129a0 (count, address, executable)) | `j != 2` | return |
| 13 | bundle/increase_liquidity.ts:164 | PARTIAL | position_authority | signer (via try_accounts_11718 (count, signer)) | `k != 2` | return |
| 14 | bundle/increase_liquidity.ts:170 | PARTIAL | position | owner, initialized, discriminator (via try_accounts_11b00 (count, owner, initialized, discriminator)) | `n == 0` | return |
| 15 | bundle/increase_liquidity.ts:182 | PARTIAL | position_token_account | owner, discriminator, initialized (via try_accounts_558 (count, owner, discriminator, initialized)) | `ld32(s388 + 0x90) == 2` | return |
| 16 | bundle/increase_liquidity.ts:198 | PARTIAL | token_owner_account_a | owner, discriminator, initialized (via try_accounts_11f50 (count, owner, discriminator, initialized)) | `ld32(s388 + 0x70) == 2` | return |
| 17 | bundle/increase_liquidity.ts:214 | PARTIAL | token_owner_account_b | owner, discriminator, initialized (via try_accounts_11f50 (count, owner, discriminator, initialized)) | `ld32(s388 + 0x70) == 2` | return |
| 18 | bundle/increase_liquidity.ts:233 | PARTIAL | token_vault_a | owner, discriminator, initialized (via fn_20f8 (count, owner, discriminator, initialized)) | `x != 2` | return |
| 19 | bundle/increase_liquidity.ts:237 | PARTIAL | token_vault_b | owner, discriminator, initialized (via fn_20f8 (count, owner, discriminator, initialized)) | `y != 2` | return |
| 20 | bundle/increase_liquidity.ts:241 | PARTIAL | tick_array_lower | count | `aa == 0` | anchor::AccountNotEnoughKeys |
| 21 | bundle/increase_liquidity.ts:281 | PARTIAL | whirlpool | writable | `ld8(ld64(s948 + 0x10) + 0x29 /* is_writable */) == 0` | anchor::ConstraintMut |
| 22 | bundle/increase_liquidity.ts:293 | PARTIAL | token_program | key, address | `(memcmp(s20, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 23 | bundle/increase_liquidity.ts:307 | PARTIAL | position | writable | `ld8(ld64(s960) + 0x29) == 0` | anchor::ConstraintMut |
| 24 | bundle/increase_liquidity.ts:320 | PARTIAL | position | key, has_one | `(memcmp(s40, s20, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 25 | bundle/increase_liquidity.ts:334 | PARTIAL | position_token_account | state, key, raw | `!((memcmp(position_token_account_box.mint, sf0, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 26 | bundle/increase_liquidity.ts:335 | PARTIAL | position_token_account | state, raw | `position_token_account_box.amount != 1` | anchor::ConstraintRaw |
| 27 | bundle/increase_liquidity.ts:345 | PARTIAL | token_owner_account_a | writable | `ld8(ld64(ld64(s958)) + 0x29) == 0` | anchor::ConstraintMut |
| 28 | bundle/increase_liquidity.ts:355 | PARTIAL | token_owner_account_a | raw | `!((memcmp(ld64(s958) + 8, s490, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 29 | bundle/increase_liquidity.ts:356 | PARTIAL | token_owner_account_b | writable | `!(ld8(ld64(ld64(s960)) + 0x29) != 0)` | anchor::ConstraintMut |
| 30 | bundle/increase_liquidity.ts:357 | PARTIAL | token_owner_account_b | raw | `!((memcmp(ld64(s960) + 8, s450, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 31 | bundle/increase_liquidity.ts:359 | PARTIAL | token_vault_a | writable | `token_vault_a.is_writable == 0` | anchor::ConstraintMut |
| 32 | bundle/increase_liquidity.ts:362 | PARTIAL | token_vault_a | key, raw | `!((memcmp(s3a8, s470, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 33 | bundle/increase_liquidity.ts:364 | PARTIAL | token_vault_b | writable | `token_vault_b.is_writable == 0` | anchor::ConstraintMut |
| 34 | bundle/increase_liquidity.ts:367 | PARTIAL | token_vault_b | key, raw | `!((memcmp(s3a8, s430, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 35 | bundle/increase_liquidity.ts:368 | PARTIAL | tick_array_lower | writable | `!(ld8(ld64(s970) + 0x29) != 0)` | anchor::ConstraintMut |
| 36 | bundle/increase_liquidity.ts:369 | PARTIAL | tick_array_upper | writable | `tick_array_upper.is_writable == 0` | anchor::ConstraintMut |
| 37 | entrypoint.ts:5320 | PARTIAL |  | owner | `ld64(b + 0x28) != 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */` | anchor::AccountOwnedByWrongProgram |
| 38 | entrypoint.ts:5328 | PARTIAL |  | owner | `ld64(b + 0x30) != 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */` | anchor::AccountOwnedByWrongProgram |
| 39 | entrypoint.ts:5336 | PARTIAL |  | owner | `ld64(b + 0x38) != 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */` | anchor::AccountOwnedByWrongProgram |
| 40 | entrypoint.ts:5344 | PARTIAL |  | owner | `!(ld64(b + 0x40) == 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */)` | anchor::AccountOwnedByWrongProgram |
| 41 | entrypoint.ts:5227 | PARTIAL |  | owner | `ld64(b + 0x28) != 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */` | anchor::AccountOwnedByWrongProgram |
| 42 | entrypoint.ts:5235 | PARTIAL |  | owner | `ld64(b + 0x30) != 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */` | anchor::AccountOwnedByWrongProgram |
| 43 | entrypoint.ts:5243 | PARTIAL |  | owner | `ld64(b + 0x38) != 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */` | anchor::AccountOwnedByWrongProgram |
| 44 | entrypoint.ts:5251 | PARTIAL |  | owner | `!(ld64(b + 0x40) == 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */)` | anchor::AccountOwnedByWrongProgram |
| 45 | entrypoint.ts:5562 | PARTIAL |  | address | `f != ld64(c)` | anchor::ConstraintAddress |
| 46 | entrypoint.ts:5578 | PARTIAL |  | address | `!memeq(b + 0x10, c + 0x10, 0x10)` | anchor::ConstraintAddress |
| 47 | entrypoint.ts:5415 | PARTIAL |  | owner | `ld64(b + 0x28) != 0x93a165d7e1f6dd06 /* TOKEN_PROGRAM */` | anchor::AccountOwnedByWrongProgram |
| 48 | entrypoint.ts:5423 | PARTIAL |  | owner | `ld64(b + 0x30) != 0xac79ebce46e1cbd9 /* TOKEN_PROGRAM[1] */` | anchor::AccountOwnedByWrongProgram |
| 49 | entrypoint.ts:5431 | PARTIAL |  | owner | `ld64(b + 0x38) != 0x91375b5fed85b41c /* TOKEN_PROGRAM[2] */` | anchor::AccountOwnedByWrongProgram |
| 50 | entrypoint.ts:5450 | PARTIAL |  | owner | `f != 0xfc` | anchor::AccountOwnedByWrongProgram |
| 51 | entrypoint.ts:5458 | PARTIAL |  | owner | `ld64(b + 0x28) != 0xde8f75eee1f6dd06 /* TOKEN_2022_PROGRAM */` | anchor::AccountOwnedByWrongProgram |
| 52 | entrypoint.ts:5466 | PARTIAL |  | owner | `ld64(b + 0x30) != 0xdacd6ce4bc5d4218 /* TOKEN_2022_PROGRAM[1] */` | anchor::AccountOwnedByWrongProgram |
| 53 | entrypoint.ts:5474 | PARTIAL |  | owner | `ld64(b + 0x38) != 0x270db9834dfc1ab6 /* TOKEN_2022_PROGRAM[2] */` | anchor::AccountOwnedByWrongProgram |
| 54 | entrypoint.ts:5494 | PARTIAL |  | discriminator | `h == 0x163` | anchor::AccountDiscriminatorMismatch |
| 55 | entrypoint.ts:5502 | PARTIAL |  | initialized | `0x6d > h` | anchor::AccountNotInitialized |
| 56 | entrypoint.ts:5528 | PARTIAL |  | discriminator | `h != 0xa5` | anchor::AccountDiscriminatorMismatch |
| 57 | entrypoint.ts:438 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 58 | entrypoint.ts:447 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 59 | entrypoint.ts:618 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 60 | entrypoint.ts:627 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 61 | entrypoint.ts:4880 | PARTIAL |  | writable | `!(ld8(b + 2) != 0)` | anchor::AccountNotMutable |
| 62 | entrypoint.ts:4881 | PARTIAL |  | owner | `ld64(b + 0x28) != 0x5390908e5f68030e /* ORCA_WHIRLPOOL_PROGRAM */` | anchor::AccountOwnedByWrongProgram |
| 63 | entrypoint.ts:4889 | PARTIAL |  | owner | `ld64(b + 0x30) != 0x6aa7f5661c1258e4 /* ORCA_WHIRLPOOL_PROGRAM[1] */` | anchor::AccountOwnedByWrongProgram |
| 64 | entrypoint.ts:4897 | PARTIAL |  | owner | `ld64(b + 0x38) != 0xf8821ca16a70c7ed /* ORCA_WHIRLPOOL_PROGRAM[2] */` | anchor::AccountOwnedByWrongProgram |
| 65 | entrypoint.ts:4905 | PARTIAL |  | owner | `!(ld64(b + 0x40) == 0xa979782b8f2a95aa /* ORCA_WHIRLPOOL_PROGRAM[3] */)` | anchor::AccountOwnedByWrongProgram |
| 66 | entrypoint.ts:13592 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 67 | entrypoint.ts:13514 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
