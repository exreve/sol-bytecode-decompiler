# initialize_pool_v2

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_initialize_pool_v2 (anchor); 87 functions reachable: ix_initialize_pool_v2, accounts_initialize_pool_v2, memcpy, fn_3bd20, fn_6aa0, fn_147990, fn_11f980, fn_139720, fn_149678, fn_9900, fn_145330, fn_14c5c0, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpools_config [str] | — | — | found (+discriminator found) | — | — |
| 1 | token_mint_a [str] | — | — | found (+discriminator found) | — | — |
| 2 | token_mint_b [str] | — | — | found (+discriminator found) | — | — |
| 3 | token_badge_a [str] | — | — | — | — | — |
| 4 | token_badge_b [str] | — | — | — | — | — |
| 5 | token_vault_a [str] | found | PARTIAL | — | — | — |
| 6 | fee_tier [str] | — | — | found (+discriminator found) | — | — |
| 7 | rent [str] | — | — | — | — | found |
| 8 | whirlpool [str] | — | PARTIAL | PARTIAL | — | — |
| 9 | funder [str] | found | PARTIAL | — | — | — |
| 10 | token_program_a [str] | — | — | — | found | found |
| 11 | token_program_b [str] | — | — | — | found | found |
| 12 | token_vault_b [str] | found | PARTIAL | — | — | — |
| 13 | system_program [str] | — | — | — | found | found |
|  | authority [code] | PARTIAL | — | — | — | — |
|  | buffer [code] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |

## Constraints per account

- whirlpools_config: owner found (bundle/initialize_pool_v2.ts:260 via try_accounts_11de0); initialized found (bundle/initialize_pool_v2.ts:260 via try_accounts_11de0); discriminator found (bundle/initialize_pool_v2.ts:260 via try_accounts_11de0)
- token_mint_a: owner found (bundle/initialize_pool_v2.ts:276 via try_accounts_610); discriminator found (bundle/initialize_pool_v2.ts:276 via try_accounts_610); initialized found (bundle/initialize_pool_v2.ts:276 via try_accounts_610)
- token_mint_b: owner found (bundle/initialize_pool_v2.ts:295 via try_accounts_610); discriminator found (bundle/initialize_pool_v2.ts:295 via try_accounts_610); initialized found (bundle/initialize_pool_v2.ts:295 via try_accounts_610)
- token_badge_a: count found (bundle/initialize_pool_v2.ts:313); key PARTIAL (bundle/initialize_pool_v2.ts:554); pda PARTIAL (bundle/initialize_pool_v2.ts:554)
- token_badge_b: key PARTIAL (bundle/initialize_pool_v2.ts:583); pda PARTIAL (bundle/initialize_pool_v2.ts:583)
- token_vault_a: signer found (bundle/initialize_pool_v2.ts:370 via try_accounts_11718); writable PARTIAL (bundle/initialize_pool_v2.ts:594)
- fee_tier: owner found (bundle/initialize_pool_v2.ts:388 via try_accounts_12008); initialized found (bundle/initialize_pool_v2.ts:388 via try_accounts_12008); discriminator found (bundle/initialize_pool_v2.ts:388 via try_accounts_12008); key PARTIAL (bundle/initialize_pool_v2.ts:609); has_one PARTIAL (bundle/initialize_pool_v2.ts:609); raw PARTIAL (bundle/initialize_pool_v2.ts:624)
- rent: address found (bundle/initialize_pool_v2.ts:421 via try_accounts_11990)
- whirlpool: key found (bundle/initialize_pool_v2.ts:452); pda found (bundle/initialize_pool_v2.ts:452); writable PARTIAL (bundle/initialize_pool_v2.ts:461); rent_exempt PARTIAL (bundle/initialize_pool_v2.ts:530); owner PARTIAL (bundle/initialize_pool_v2.ts:1545 via fn_3aa0); initialized PARTIAL (bundle/initialize_pool_v2.ts:1545 via fn_3aa0)
- funder: signer found (bundle/initialize_pool_v2.ts:352 via try_accounts_11718); writable PARTIAL (bundle/initialize_pool_v2.ts:584)
- token_program_a: address found (bundle/initialize_pool_v2.ts:405 via try_accounts_120); executable found (bundle/initialize_pool_v2.ts:405 via try_accounts_120); key PARTIAL (bundle/initialize_pool_v2.ts:634)
- token_program_b: address found (bundle/initialize_pool_v2.ts:410 via try_accounts_120); executable found (bundle/initialize_pool_v2.ts:410 via try_accounts_120); key PARTIAL (bundle/initialize_pool_v2.ts:658)
- token_vault_b: signer found (bundle/initialize_pool_v2.ts:382 via try_accounts_11718); writable PARTIAL (bundle/initialize_pool_v2.ts:604)
- system_program: address found (bundle/initialize_pool_v2.ts:415 via fn_122e8); executable found (bundle/initialize_pool_v2.ts:415 via fn_122e8)
- authority: signer PARTIAL (shared.ts:15130 via try_accounts_11718); raw PARTIAL (shared.ts:15181)
- buffer: zero PARTIAL (shared.ts:15152); discriminator PARTIAL (shared.ts:15152); owner PARTIAL (shared.ts:15155 via fn_3e60); initialized PARTIAL (shared.ts:15155 via fn_3e60); writable PARTIAL (shared.ts:15166); rent_exempt PARTIAL (shared.ts:15225)

## CPIs

- bundle/initialize_pool_v2.ts:4911 program not decoded
- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))

## PDAs derived

- bundle/initialize_pool_v2.ts:444 find_program_address(["whirlpool", *ay, *az, *ba, u16 ld16(s33a) [ix data?]], program *(ld64(s348)))
- bundle/initialize_pool_v2.ts:548 find_program_address(["token_badge", *cg, *s120], program *(ld64(s348)))
- bundle/initialize_pool_v2.ts:577 find_program_address(["token_badge", *cn, *s120], program *(ld64(s348)))
- compared with provided accounts: token_badge_a PARTIAL, token_badge_b PARTIAL, whirlpool found

## Dominance (checks on every path to the operation; across calls)

- bundle/initialize_pool_v2.ts:4911 CPI: 20 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner token_mint_a; discriminator token_mint_a; initialized token_mint_a; owner token_mint_b; discriminator token_mint_b; …)
- entrypoint.ts:14045 CPI: 36 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner token_mint_a; discriminator token_mint_a; initialized token_mint_a; owner token_mint_b; discriminator token_mint_b; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 38 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/initialize_pool_v2.ts:4911 CPI: `bs != -1` · `bp != -1` · `u265 != -1` · `bj != -1` · `u252 != -1` · `u82 != -1` · `x > g` · ✗ `(memcmp(s358, s4d8, 0x20) as u32) == 0` #32 · `g != 0` · `(memcmp(s100, s1d8, 0x20) as u32) == 0` #14 · … 17 more
  - not required on some path: #49 (signer authority)
- entrypoint.ts:14045 CPI: `af != -1` · `ac != -1` · `z != -1` · `x != -1` · `u != -1` · `u39 != -1` · ✗ `h == 0` · ✗ `(memcmp(d.owner, sa8, 0x20) as u32) != 0` #40 · `u154 != -1` · `u150 != -1` · … 18 more
  - not required on some path: #49 (signer authority)

## Relations (equalities the checks establish)

- token_program_a.key == (constant address) (address, found, bundle/initialize_pool_v2.ts:405)
- token_program_b.key == (constant address) (address, found, bundle/initialize_pool_v2.ts:410)
- system_program.key == (constant address) (address, found, bundle/initialize_pool_v2.ts:415)
- rent.key == (constant address) (address, found, bundle/initialize_pool_v2.ts:421)
- fee_tier.token_vault_a? == token_vault_a.key (has_one, PARTIAL, bundle/initialize_pool_v2.ts:609)
- fee_tier.funder? == funder.key (has_one, PARTIAL, bundle/initialize_pool_v2.ts:609)
- fee_tier.token_vault_b? == token_vault_b.key (has_one, PARTIAL, bundle/initialize_pool_v2.ts:609)
- fee_tier.authority? == authority.key (has_one, PARTIAL, bundle/initialize_pool_v2.ts:609)
- token_program_a.key == (constant address) (address, PARTIAL, bundle/initialize_pool_v2.ts:634)
- token_program_b.key == (constant address) (address, PARTIAL, bundle/initialize_pool_v2.ts:658)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpools_config.key, token_mint_a.key, token_mint_b.key, token_vault_a.key, funder.key, token_vault_b.key, authority.key, buffer.key
- whirlpools_config.data: validated (owner found @accounts_initialize_pool_v2:41, discriminator found @accounts_initialize_pool_v2:41, initialized found @accounts_initialize_pool_v2:41)
- token_mint_a.data: validated (owner found @accounts_initialize_pool_v2:57, discriminator found @accounts_initialize_pool_v2:57, initialized found @accounts_initialize_pool_v2:57)
- token_mint_b.data: validated (owner found @accounts_initialize_pool_v2:76, discriminator found @accounts_initialize_pool_v2:76, initialized found @accounts_initialize_pool_v2:76)
- token_badge_a.key: partially-validated (pda partial @accounts_initialize_pool_v2:335, key partial @accounts_initialize_pool_v2:335)
- token_badge_b.key: partially-validated (pda partial @accounts_initialize_pool_v2:364, key partial @accounts_initialize_pool_v2:364)
- fee_tier.key: partially-validated (key partial @accounts_initialize_pool_v2:390, has_one partial @accounts_initialize_pool_v2:390)
- fee_tier.data: validated (owner found @accounts_initialize_pool_v2:169, discriminator found @accounts_initialize_pool_v2:169, initialized found @accounts_initialize_pool_v2:169)
- rent.key: validated (address found @accounts_initialize_pool_v2:202)
- whirlpool.key: validated (pda found @accounts_initialize_pool_v2:233, key found @accounts_initialize_pool_v2:233)
- whirlpool.data: partially-validated (owner partial @fn_de388:376, initialized partial @fn_de388:376)
- token_program_a.key: validated (address found @accounts_initialize_pool_v2:186, key partial @accounts_initialize_pool_v2:415)
- token_program_b.key: validated (address found @accounts_initialize_pool_v2:191, key partial @accounts_initialize_pool_v2:439)
- system_program.key: validated (address found @accounts_initialize_pool_v2:196)
- buffer.data: partially-validated (owner partial @fn_11c9a8:39, discriminator partial @fn_11c9a8:36, initialized partial @fn_11c9a8:39)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/initialize_pool_v2.ts:181 | PARTIAL | whirlpool |  | `k != 2` | return |
| 1 | bundle/initialize_pool_v2.ts:260 | found | whirlpools_config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `ld64(s100) == 0` | return |
| 2 | bundle/initialize_pool_v2.ts:276 | found | token_mint_a | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `k == 2` | return |
| 3 | bundle/initialize_pool_v2.ts:295 | found | token_mint_b | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `q == 2` | return |
| 4 | bundle/initialize_pool_v2.ts:313 | found | token_badge_a | count | `v == 0` | anchor::AccountNotEnoughKeys |
| 5 | bundle/initialize_pool_v2.ts:352 | found | funder | signer (via try_accounts_11718 (count, signer)) | `ad != 2` | return |
| 6 | bundle/initialize_pool_v2.ts:355 | found |  | count | `af == 0` | anchor::AccountNotEnoughKeys |
| 7 | bundle/initialize_pool_v2.ts:370 | found | token_vault_a | signer (via try_accounts_11718 (count, signer)) | `ah != 2` | return |
| 8 | bundle/initialize_pool_v2.ts:382 | found | token_vault_b | signer (via try_accounts_11718 (count, signer)) | `aj != 2` | return |
| 9 | bundle/initialize_pool_v2.ts:388 | found | fee_tier | owner, initialized, discriminator (via try_accounts_12008 (count, owner, initialized, discriminator)) | `al == 0` | return |
| 10 | bundle/initialize_pool_v2.ts:405 | found | token_program_a | address, executable (via try_accounts_120 (count, address, executable)) | `ao != 2` | return |
| 11 | bundle/initialize_pool_v2.ts:410 | found | token_program_b | address, executable (via try_accounts_120 (count, address, executable)) | `aq != 2` | return |
| 12 | bundle/initialize_pool_v2.ts:415 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `at != 2` | return |
| 13 | bundle/initialize_pool_v2.ts:421 | found | rent | address (via try_accounts_11990 (count, address)) | `av == 0` | return |
| 14 | bundle/initialize_pool_v2.ts:452 | found | whirlpool | key, pda | `!((memcmp(s100, s1d8, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 15 | bundle/initialize_pool_v2.ts:461 | PARTIAL | whirlpool | writable | `whirlpool.is_writable == 0` | anchor::ConstraintMut |
| 16 | bundle/initialize_pool_v2.ts:530 | PARTIAL | whirlpool | rent_exempt | `by > ld64(s6e0)` | anchor::ConstraintRentExempt |
| 17 | bundle/initialize_pool_v2.ts:554 | PARTIAL | token_badge_a | key, pda | `(memcmp(s100, s180, 0x20) as u32) != 0` | anchor::ConstraintSeeds |
| 18 | bundle/initialize_pool_v2.ts:583 | PARTIAL | token_badge_b | key, pda | `!((memcmp(s100, s160, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 19 | bundle/initialize_pool_v2.ts:584 | PARTIAL | funder | writable | `ld8(ld64(s238) + 0x29) == 0` | anchor::ConstraintMut |
| 20 | bundle/initialize_pool_v2.ts:594 | PARTIAL | token_vault_a | writable | `ld8(ld64(s690 + 0x20) + 0x29) == 0` | anchor::ConstraintMut |
| 21 | bundle/initialize_pool_v2.ts:604 | PARTIAL | token_vault_b | writable | `!(ld8(ld64(s690 + 0x10) + 0x29) != 0)` | anchor::ConstraintMut |
| 22 | bundle/initialize_pool_v2.ts:609 | PARTIAL | fee_tier | key, has_one | `(memcmp(s120, s1b0, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 23 | bundle/initialize_pool_v2.ts:624 | PARTIAL | fee_tier | raw | `!(ld64(s6c0 + 0x28) == ld16(s33a))` | anchor::ConstraintRaw |
| 24 | bundle/initialize_pool_v2.ts:634 | PARTIAL | token_program_a | key, address | `(memcmp(s120, s1b0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 25 | bundle/initialize_pool_v2.ts:658 | PARTIAL | token_program_b | key, address | `!((memcmp(s120, s1b0, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 26 | entrypoint.ts:677 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 27 | entrypoint.ts:686 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 28 | entrypoint.ts:373 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 29 | entrypoint.ts:382 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 30 | entrypoint.ts:323 | found |  | address | `f == 0` | anchor::AccountSysvarMismatch |
| 31 | entrypoint.ts:336 | PARTIAL |  | address | `!(i >= 8 && (i != 0x10 && (i & -8) != 8))` | anchor::AccountSysvarMismatch |
| 32 | bundle/initialize_pool_v2.ts:1189 | PARTIAL |  | key | `(memcmp(s358, s4d8, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 33 | bundle/initialize_pool_v2.ts:1545 | PARTIAL | whirlpool | owner, initialized (via fn_3aa0 (owner, initialized)) | `ld64(s290) == 0` | return |
| 34 | bundle/initialize_pool_v2.ts:2389 | PARTIAL |  | key | `!((memcmp(h, i, 0x20) as i32) < 0)` | return |
| 35 | entrypoint.ts:13224 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 36 | entrypoint.ts:13436 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 37 | bundle/initialize_pool_v2.ts:2601 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 38 | bundle/initialize_pool_v2.ts:2610 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 39 | bundle/initialize_pool_v2.ts:2672 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 40 | bundle/initialize_pool_v2.ts:3082 | PARTIAL | d? | owner | `!((memcmp(d.owner, sa8, 0x20) as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 41 | bundle/initialize_pool_v2.ts:3317 | PARTIAL |  | key | `(memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001520e0 /* &T` | Err(ProgramError::IncorrectProgramId) |
| 42 | bundle/initialize_pool_v2.ts:3889 | PARTIAL |  | key | `(memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001520e0 /* &T` | Err(ProgramError::IncorrectProgramId) |
| 43 | shared.ts:14572 | PARTIAL | idl |  | `ap == 2` | return |
| 44 | shared.ts:14825 | PARTIAL | idl |  | `bh != 2` | return |
| 45 | shared.ts:14897 | PARTIAL | buffer |  | `bo != 2` | return |
| 46 | entrypoint.ts:497 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 47 | entrypoint.ts:506 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 48 | shared.ts:15123 | PARTIAL |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 49 | shared.ts:15130 | PARTIAL | authority | signer (via try_accounts_11718 (count, signer)) | `h != 2` | return |
| 50 | shared.ts:15152 | PARTIAL | buffer | zero, discriminator | `!(ld8(t) == 0 && (ld8(t + 1) == 0 && (ld8(t + 2) == 0 && (ld8(t + 3) == 0 && (ld8(t + 4) == 0 && (ld` | anchor::ConstraintZero |
| 51 | shared.ts:15155 | PARTIAL | buffer | owner, initialized (via fn_3e60 (owner, initialized)) | `buffer == 0` | return |
| 52 | shared.ts:15166 | PARTIAL | buffer | writable | `buffer.is_writable == 0` | anchor::ConstraintMut |
| 53 | shared.ts:15181 | PARTIAL | authority | raw | `w == 0x800000000000001a /* Ok */` | anchor::ConstraintRaw |
| 54 | shared.ts:15225 | PARTIAL | buffer | rent_exempt | `ah > an` | anchor::ConstraintRentExempt |
| 55 | shared.ts:15235 | PARTIAL | authority | raw | `n == 0` | anchor::ConstraintRaw |
| 56 | entrypoint.ts:13631 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 57 | shared.ts:311 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 58 | shared.ts:320 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
