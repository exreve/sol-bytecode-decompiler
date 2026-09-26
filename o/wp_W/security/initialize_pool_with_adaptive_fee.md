# initialize_pool_with_adaptive_fee

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_initialize_pool_with_adaptive_fee (anchor); 95 functions reachable: ix_initialize_pool_with_adaptive_fee, fn_147e78, fn_11f980, accounts_initialize_pool_with_adaptive_fee, memcpy, fn_43888, fn_6aa0, fn_149678, fn_258, fn_147990, fn_83078, fn_139720, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpools_config [str] | — | — | found (+discriminator found) | — | — |
| 1 | token_mint_a [str] | — | — | found (+discriminator found) | — | — |
| 2 | token_mint_b [str] | — | — | found (+discriminator found) | — | — |
| 3 | token_badge_a [str] | — | — | — | — | — |
| 4 | token_badge_b [str] | — | — | — | — | — |
| 5 | token_vault_a [str] | found | PARTIAL | — | — | — |
| 6 | rent [str] | — | — | — | — | found |
| 7 | whirlpool [str] | — | PARTIAL | PARTIAL | — | — |
| 8 | oracle [str] | — | PARTIAL | PARTIAL | — | — |
| 9 | funder [str] | found | PARTIAL | — | — | — |
| 10 | adaptive_fee_tier [str] | — | — | found | — | — |
| 11 | token_program_b [str] | — | — | — | found | found |
| 12 | token_program_a [str] | — | — | — | found | found |
| 13 | token_vault_b [str] | found | PARTIAL | — | — | — |
| 14 | initialize_pool_authority [str] | found | — | — | — | — |
| 15 | system_program [str] | — | — | — | found | found |
|  | authority [code] | PARTIAL | — | — | — | — |
|  | buffer [code] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |

## Constraints per account

- whirlpools_config: owner found (bundle/initialize_pool_with_adaptive_fee.ts:267 via try_accounts_11de0); initialized found (bundle/initialize_pool_with_adaptive_fee.ts:267 via try_accounts_11de0); discriminator found (bundle/initialize_pool_with_adaptive_fee.ts:267 via try_accounts_11de0)
- token_mint_a: owner found (bundle/initialize_pool_with_adaptive_fee.ts:282 via try_accounts_610); discriminator found (bundle/initialize_pool_with_adaptive_fee.ts:282 via try_accounts_610); initialized found (bundle/initialize_pool_with_adaptive_fee.ts:282 via try_accounts_610)
- token_mint_b: owner found (bundle/initialize_pool_with_adaptive_fee.ts:297 via try_accounts_610); discriminator found (bundle/initialize_pool_with_adaptive_fee.ts:297 via try_accounts_610); initialized found (bundle/initialize_pool_with_adaptive_fee.ts:297 via try_accounts_610)
- token_badge_a: count found (bundle/initialize_pool_with_adaptive_fee.ts:312); key PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:671); pda PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:671)
- token_badge_b: key PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:699); pda PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:699)
- token_vault_a: signer found (bundle/initialize_pool_with_adaptive_fee.ts:379 via try_accounts_11718); writable PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:711)
- rent: address found (bundle/initialize_pool_with_adaptive_fee.ts:417 via try_accounts_11990)
- whirlpool: key found (bundle/initialize_pool_with_adaptive_fee.ts:457); pda found (bundle/initialize_pool_with_adaptive_fee.ts:457); writable PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:468); rent_exempt PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:535); owner PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:1891 via fn_3aa0); initialized PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:1891 via fn_3aa0)
- oracle: key PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:573); pda PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:573); writable PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:581); rent_exempt PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:648); owner PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:2274 via fn_1110)
- funder: signer found (bundle/initialize_pool_with_adaptive_fee.ts:352 via try_accounts_11718); writable PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:700)
- adaptive_fee_tier: owner found (bundle/initialize_pool_with_adaptive_fee.ts:396 via fn_23b8); initialized found (bundle/initialize_pool_with_adaptive_fee.ts:396 via fn_23b8); key PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:716); has_one PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:716)
- token_program_b: address found (bundle/initialize_pool_with_adaptive_fee.ts:406 via try_accounts_120); executable found (bundle/initialize_pool_with_adaptive_fee.ts:406 via try_accounts_120)
- token_program_a: address found (bundle/initialize_pool_with_adaptive_fee.ts:401 via try_accounts_120); executable found (bundle/initialize_pool_with_adaptive_fee.ts:401 via try_accounts_120); key PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:739)
- token_vault_b: signer found (bundle/initialize_pool_with_adaptive_fee.ts:391 via try_accounts_11718); writable PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:712)
- initialize_pool_authority: signer found (bundle/initialize_pool_with_adaptive_fee.ts:357 via try_accounts_11718); raw PARTIAL (bundle/initialize_pool_with_adaptive_fee.ts:710)
- system_program: address found (bundle/initialize_pool_with_adaptive_fee.ts:411 via fn_122e8); executable found (bundle/initialize_pool_with_adaptive_fee.ts:411 via fn_122e8)
- authority: signer PARTIAL (shared.ts:15130 via try_accounts_11718); raw PARTIAL (shared.ts:15181)
- buffer: zero PARTIAL (shared.ts:15152); discriminator PARTIAL (shared.ts:15152); owner PARTIAL (shared.ts:15155 via fn_3e60); initialized PARTIAL (shared.ts:15155 via fn_3e60); writable PARTIAL (shared.ts:15166); rent_exempt PARTIAL (shared.ts:15225)

## CPIs

- shared.ts:20063 program not decoded
- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))

## PDAs derived

- bundle/initialize_pool_with_adaptive_fee.ts:449 find_program_address(["whirlpool", *an, *ao, *ap, u16 aq], program *(ld64(s208)))
- bundle/initialize_pool_with_adaptive_fee.ts:565 find_program_address(["oracle", *s130], program *(ld64(s208)))
- bundle/initialize_pool_with_adaptive_fee.ts:665 find_program_address(["token_badge", *db, *sa0], program *(ld64(s208)))
- bundle/initialize_pool_with_adaptive_fee.ts:693 find_program_address(["token_badge", *di, *sa0], program *(ld64(s208)))
- compared with provided accounts: token_badge_a PARTIAL, token_badge_b PARTIAL, whirlpool found, oracle PARTIAL

## Dominance (checks on every path to the operation; across calls)

- shared.ts:20063 CPI: 21 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner token_mint_a; discriminator token_mint_a; initialized token_mint_a; owner token_mint_b; discriminator token_mint_b; …)
- entrypoint.ts:14045 CPI: 41 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner token_mint_a; discriminator token_mint_a; initialized token_mint_a; owner token_mint_b; discriminator token_mint_b; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 44 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- shared.ts:20063 CPI: `bs != -1` · `bp != -1` · `u265 != -1` · `bj != -1` · `u252 != -1` · `u82 != -1` · `x > g` · ✗ `(memcmp(s358, s4d8, 0x20) as u32) == 0` #35 · `g != 0` · `(memcmp(s80, s1b0, 0x20) as u32) == 0` #16 · … 20 more
  - not required on some path: #57 (signer authority)
- entrypoint.ts:14045 CPI: `af != -1` · `ac != -1` · `z != -1` · `x != -1` · `u != -1` · `u39 != -1` · ✗ `h == 0` · ✗ `(memcmp(d.owner, sa8, 0x20) as u32) != 0` #47 · `u154 != -1` · `u150 != -1` · … 19 more
  - not required on some path: #57 (signer authority)

## Relations (equalities the checks establish)

- token_program_a.key == (constant address) (address, found, bundle/initialize_pool_with_adaptive_fee.ts:401)
- token_program_b.key == (constant address) (address, found, bundle/initialize_pool_with_adaptive_fee.ts:406)
- system_program.key == (constant address) (address, found, bundle/initialize_pool_with_adaptive_fee.ts:411)
- rent.key == (constant address) (address, found, bundle/initialize_pool_with_adaptive_fee.ts:417)
- adaptive_fee_tier.token_vault_a? == token_vault_a.key (has_one, PARTIAL, bundle/initialize_pool_with_adaptive_fee.ts:716)
- adaptive_fee_tier.funder? == funder.key (has_one, PARTIAL, bundle/initialize_pool_with_adaptive_fee.ts:716)
- adaptive_fee_tier.token_vault_b? == token_vault_b.key (has_one, PARTIAL, bundle/initialize_pool_with_adaptive_fee.ts:716)
- adaptive_fee_tier.initialize_pool_authority? == initialize_pool_authority.key (has_one, PARTIAL, bundle/initialize_pool_with_adaptive_fee.ts:716)
- adaptive_fee_tier.authority? == authority.key (has_one, PARTIAL, bundle/initialize_pool_with_adaptive_fee.ts:716)
- token_program_a.key == (constant address) (address, PARTIAL, bundle/initialize_pool_with_adaptive_fee.ts:739)
- token_program_b.key == (constant address) (address, PARTIAL, bundle/initialize_pool_with_adaptive_fee.ts:750)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpools_config.key, token_mint_a.key, token_mint_b.key, token_vault_a.key, funder.key, token_vault_b.key, initialize_pool_authority.key, authority.key, buffer.key
- whirlpools_config.data: validated (owner found @accounts_initialize_pool_with_adaptive_fee:10, discriminator found @accounts_initialize_pool_with_adaptive_fee:10, initialized found @accounts_initialize_pool_with_adaptive_fee:10)
- token_mint_a.data: validated (owner found @accounts_initialize_pool_with_adaptive_fee:25, discriminator found @accounts_initialize_pool_with_adaptive_fee:25, initialized found @accounts_initialize_pool_with_adaptive_fee:25)
- token_mint_b.data: validated (owner found @accounts_initialize_pool_with_adaptive_fee:40, discriminator found @accounts_initialize_pool_with_adaptive_fee:40, initialized found @accounts_initialize_pool_with_adaptive_fee:40)
- token_badge_a.key: partially-validated (pda partial @accounts_initialize_pool_with_adaptive_fee:414, key partial @accounts_initialize_pool_with_adaptive_fee:414)
- token_badge_b.key: partially-validated (pda partial @accounts_initialize_pool_with_adaptive_fee:442, key partial @accounts_initialize_pool_with_adaptive_fee:442)
- rent.key: validated (address found @accounts_initialize_pool_with_adaptive_fee:160)
- whirlpool.key: validated (pda found @accounts_initialize_pool_with_adaptive_fee:200, key found @accounts_initialize_pool_with_adaptive_fee:200)
- whirlpool.data: partially-validated (owner partial @fn_fb520:375, initialized partial @fn_fb520:375)
- oracle.key: partially-validated (pda partial @accounts_initialize_pool_with_adaptive_fee:316, key partial @accounts_initialize_pool_with_adaptive_fee:316)
- oracle.data: partially-validated (owner partial @fn_fd368:347)
- adaptive_fee_tier.key: partially-validated (key partial @accounts_initialize_pool_with_adaptive_fee:459, has_one partial @accounts_initialize_pool_with_adaptive_fee:459)
- adaptive_fee_tier.data: validated (owner found @accounts_initialize_pool_with_adaptive_fee:139, initialized found @accounts_initialize_pool_with_adaptive_fee:139)
- token_program_b.key: validated (address found @accounts_initialize_pool_with_adaptive_fee:149)
- token_program_a.key: validated (address found @accounts_initialize_pool_with_adaptive_fee:144, key partial @accounts_initialize_pool_with_adaptive_fee:482)
- system_program.key: validated (address found @accounts_initialize_pool_with_adaptive_fee:154)
- buffer.data: partially-validated (owner partial @fn_11c9a8:39, discriminator partial @fn_11c9a8:36, initialized partial @fn_11c9a8:39)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/initialize_pool_with_adaptive_fee.ts:215 | PARTIAL | oracle |  | `o != 2` | return |
| 1 | bundle/initialize_pool_with_adaptive_fee.ts:267 | found | whirlpools_config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `ld64(s80) == 0` | return |
| 2 | bundle/initialize_pool_with_adaptive_fee.ts:282 | found | token_mint_a | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `ld32(s80) == 2` | return |
| 3 | bundle/initialize_pool_with_adaptive_fee.ts:297 | found | token_mint_b | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `ld32(s80) == 2` | return |
| 4 | bundle/initialize_pool_with_adaptive_fee.ts:312 | found | token_badge_a | count | `l == 0` | anchor::AccountNotEnoughKeys |
| 5 | bundle/initialize_pool_with_adaptive_fee.ts:352 | found | funder | signer (via try_accounts_11718 (count, signer)) | `s != 2` | return |
| 6 | bundle/initialize_pool_with_adaptive_fee.ts:357 | found | initialize_pool_authority | signer (via try_accounts_11718 (count, signer)) | `u != 2` | return |
| 7 | bundle/initialize_pool_with_adaptive_fee.ts:359 | found |  | count | `v == 0` | anchor::AccountNotEnoughKeys |
| 8 | bundle/initialize_pool_with_adaptive_fee.ts:371 | found |  | count | `v == 1` | anchor::AccountNotEnoughKeys |
| 9 | bundle/initialize_pool_with_adaptive_fee.ts:379 | found | token_vault_a | signer (via try_accounts_11718 (count, signer)) | `y != 2` | return |
| 10 | bundle/initialize_pool_with_adaptive_fee.ts:391 | found | token_vault_b | signer (via try_accounts_11718 (count, signer)) | `aa != 2` | return |
| 11 | bundle/initialize_pool_with_adaptive_fee.ts:396 | found | adaptive_fee_tier | owner, initialized (via fn_23b8 (count, owner, initialized)) | `ac != 2` | return |
| 12 | bundle/initialize_pool_with_adaptive_fee.ts:401 | found | token_program_a | address, executable (via try_accounts_120 (count, address, executable)) | `ae != 2` | return |
| 13 | bundle/initialize_pool_with_adaptive_fee.ts:406 | found | token_program_b | address, executable (via try_accounts_120 (count, address, executable)) | `ag != 2` | return |
| 14 | bundle/initialize_pool_with_adaptive_fee.ts:411 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `ai != 2` | return |
| 15 | bundle/initialize_pool_with_adaptive_fee.ts:417 | found | rent | address (via try_accounts_11990 (count, address)) | `ak == 0` | return |
| 16 | bundle/initialize_pool_with_adaptive_fee.ts:457 | found | whirlpool | key, pda | `!((memcmp(s80, s1b0, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 17 | bundle/initialize_pool_with_adaptive_fee.ts:468 | PARTIAL | whirlpool | writable | `whirlpool.is_writable == 0` | anchor::ConstraintMut |
| 18 | bundle/initialize_pool_with_adaptive_fee.ts:535 | PARTIAL | whirlpool | rent_exempt | `bp > ld64(s638)` | anchor::ConstraintRentExempt |
| 19 | bundle/initialize_pool_with_adaptive_fee.ts:573 | PARTIAL | oracle | key, pda | `!((memcmp(s80, s158, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 20 | bundle/initialize_pool_with_adaptive_fee.ts:581 | PARTIAL | oracle | writable | `ld8(ld64(s638) + 0x29) == 0` | anchor::ConstraintMut |
| 21 | bundle/initialize_pool_with_adaptive_fee.ts:648 | PARTIAL | oracle | rent_exempt | `cw > ld64(s640)` | anchor::ConstraintRentExempt |
| 22 | bundle/initialize_pool_with_adaptive_fee.ts:671 | PARTIAL | token_badge_a | key, pda | `(memcmp(s80, s100, 0x20) as u32) != 0` | anchor::ConstraintSeeds |
| 23 | bundle/initialize_pool_with_adaptive_fee.ts:699 | PARTIAL | token_badge_b | key, pda | `!((memcmp(s80, se0, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 24 | bundle/initialize_pool_with_adaptive_fee.ts:700 | PARTIAL | funder | writable | `ld8(ld64(s200) + 0x29) == 0` | anchor::ConstraintMut |
| 25 | bundle/initialize_pool_with_adaptive_fee.ts:710 | PARTIAL | initialize_pool_authority | raw | `!(fn_595a8(dw + 8, ld64(ld64(s620 + 0x40))) != 0)` | anchor::ConstraintRaw |
| 26 | bundle/initialize_pool_with_adaptive_fee.ts:711 | PARTIAL | token_vault_a | writable | `!(ld8(ld64(s620 + 0x38) + 0x29) != 0)` | anchor::ConstraintMut |
| 27 | bundle/initialize_pool_with_adaptive_fee.ts:712 | PARTIAL | token_vault_b | writable | `!(ld8(ld64(s620 + 0x30) + 0x29) != 0)` | anchor::ConstraintMut |
| 28 | bundle/initialize_pool_with_adaptive_fee.ts:716 | PARTIAL | adaptive_fee_tier | key, has_one | `(memcmp(sa0, s130, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 29 | bundle/initialize_pool_with_adaptive_fee.ts:739 | PARTIAL | token_program_a | key, address | `!((memcmp(sa0, s130, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 30 | bundle/initialize_pool_with_adaptive_fee.ts:750 | PARTIAL | token_program_b | address | `cj != 0` | anchor::ConstraintAddress |
| 31 | entrypoint.ts:677 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 32 | entrypoint.ts:686 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 33 | entrypoint.ts:323 | found |  | address | `f == 0` | anchor::AccountSysvarMismatch |
| 34 | entrypoint.ts:336 | PARTIAL |  | address | `!(i >= 8 && (i != 0x10 && (i & -8) != 8))` | anchor::AccountSysvarMismatch |
| 35 | bundle/initialize_pool_with_adaptive_fee.ts:1535 | PARTIAL |  | key | `(memcmp(s358, s4d8, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 36 | bundle/initialize_pool_with_adaptive_fee.ts:1891 | PARTIAL | whirlpool | owner, initialized (via fn_3aa0 (owner, initialized)) | `ld64(s290) == 0` | return |
| 37 | bundle/initialize_pool_with_adaptive_fee.ts:1944 | PARTIAL |  | key | `(memcmp(s40, s1f0, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 38 | bundle/initialize_pool_with_adaptive_fee.ts:2274 | PARTIAL | oracle | owner (via fn_1110 (owner)) | `cy != 2` | return |
| 39 | bundle/initialize_pool_with_adaptive_fee.ts:3102 | PARTIAL |  | key | `!((memcmp(h, i, 0x20) as i32) < 0)` | return |
| 40 | bundle/initialize_pool_with_adaptive_fee.ts:3240 | PARTIAL |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 41 | entrypoint.ts:13224 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 42 | entrypoint.ts:866 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 43 | entrypoint.ts:875 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 44 | bundle/initialize_pool_with_adaptive_fee.ts:3451 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 45 | bundle/initialize_pool_with_adaptive_fee.ts:3460 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 46 | bundle/initialize_pool_with_adaptive_fee.ts:3543 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 47 | bundle/initialize_pool_with_adaptive_fee.ts:3953 | PARTIAL | d? | owner | `!((memcmp(d.owner, sa8, 0x20) as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 48 | bundle/initialize_pool_with_adaptive_fee.ts:4188 | PARTIAL |  | key | `(memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001520e0 /* &T` | Err(ProgramError::IncorrectProgramId) |
| 49 | entrypoint.ts:13185 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 50 | bundle/initialize_pool_with_adaptive_fee.ts:4760 | PARTIAL |  | key | `(memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001520e0 /* &T` | Err(ProgramError::IncorrectProgramId) |
| 51 | shared.ts:14572 | PARTIAL | idl |  | `ap == 2` | return |
| 52 | shared.ts:14825 | PARTIAL | idl |  | `bh != 2` | return |
| 53 | shared.ts:14897 | PARTIAL | buffer |  | `bo != 2` | return |
| 54 | entrypoint.ts:497 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 55 | entrypoint.ts:506 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 56 | shared.ts:15123 | PARTIAL |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 57 | shared.ts:15130 | PARTIAL | authority | signer (via try_accounts_11718 (count, signer)) | `h != 2` | return |
| 58 | shared.ts:15152 | PARTIAL | buffer | zero, discriminator | `!(ld8(t) == 0 && (ld8(t + 1) == 0 && (ld8(t + 2) == 0 && (ld8(t + 3) == 0 && (ld8(t + 4) == 0 && (ld` | anchor::ConstraintZero |
| 59 | shared.ts:15155 | PARTIAL | buffer | owner, initialized (via fn_3e60 (owner, initialized)) | `buffer == 0` | return |
| 60 | shared.ts:15166 | PARTIAL | buffer | writable | `buffer.is_writable == 0` | anchor::ConstraintMut |
| 61 | shared.ts:15181 | PARTIAL | authority | raw | `w == 0x800000000000001a /* Ok */` | anchor::ConstraintRaw |
| 62 | shared.ts:15225 | PARTIAL | buffer | rent_exempt | `ah > an` | anchor::ConstraintRentExempt |
| 63 | shared.ts:15235 | PARTIAL | authority | raw | `n == 0` | anchor::ConstraintRaw |
| 64 | entrypoint.ts:13631 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 65 | shared.ts:311 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 66 | shared.ts:320 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
