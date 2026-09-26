# initialize_pool

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_initialize_pool (anchor); 78 functions reachable: ix_initialize_pool, accounts_initialize_pool, memcpy, fn_31e50, fn_6aa0, fn_147990, fn_11f980, fn_139720, fn_149678, fn_9900, fn_83078, fn_143100, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpools_config [str] | — | — | found (+discriminator found) | — | — |
| 1 | token_mint_a [str] | — | — | found (+discriminator found) | — | — |
| 2 | token_mint_b [str] | — | — | found (+discriminator found) | — | — |
| 3 | token_vault_a [str] | found | PARTIAL | — | — | — |
| 4 | fee_tier [str] | — | — | found (+discriminator found) | — | — |
| 5 | rent [str] | — | — | — | — | found |
| 6 | whirlpool [str] | — | PARTIAL | PARTIAL | — | — |
| 7 | token_program [str] | — | — | — | found | found |
| 8 | token_vault_b [str] | found | PARTIAL | — | — | — |
| 9 | funder [str] | found | PARTIAL | — | — | — |
| 10 | system_program [str] | — | — | — | found | found |
|  | authority [code] | PARTIAL | — | — | — | — |
|  | buffer [code] | — | PARTIAL | PARTIAL (+discriminator PARTIAL) | — | — |

## Constraints per account

- whirlpools_config: owner found (bundle/initialize_pool.ts:249 via try_accounts_11de0); initialized found (bundle/initialize_pool.ts:249 via try_accounts_11de0); discriminator found (bundle/initialize_pool.ts:249 via try_accounts_11de0)
- token_mint_a: owner found (bundle/initialize_pool.ts:265 via try_accounts_11e98); discriminator found (bundle/initialize_pool.ts:265 via try_accounts_11e98); initialized found (bundle/initialize_pool.ts:265 via try_accounts_11e98)
- token_mint_b: owner found (bundle/initialize_pool.ts:284 via try_accounts_11e98); discriminator found (bundle/initialize_pool.ts:284 via try_accounts_11e98); initialized found (bundle/initialize_pool.ts:284 via try_accounts_11e98)
- token_vault_a: signer found (bundle/initialize_pool.ts:322 via try_accounts_11718); writable PARTIAL (bundle/initialize_pool.ts:481)
- fee_tier: owner found (bundle/initialize_pool.ts:338 via try_accounts_12008); initialized found (bundle/initialize_pool.ts:338 via try_accounts_12008); discriminator found (bundle/initialize_pool.ts:338 via try_accounts_12008); key PARTIAL (bundle/initialize_pool.ts:488); has_one PARTIAL (bundle/initialize_pool.ts:488); raw PARTIAL (bundle/initialize_pool.ts:503)
- rent: address found (bundle/initialize_pool.ts:367 via try_accounts_11990)
- whirlpool: key found (bundle/initialize_pool.ts:399); pda found (bundle/initialize_pool.ts:399); writable PARTIAL (bundle/initialize_pool.ts:407); rent_exempt PARTIAL (bundle/initialize_pool.ts:469); owner PARTIAL (bundle/initialize_pool.ts:1334 via fn_3aa0); initialized PARTIAL (bundle/initialize_pool.ts:1334 via fn_3aa0)
- token_program: address found (bundle/initialize_pool.ts:356 via fn_129a0); executable found (bundle/initialize_pool.ts:356 via fn_129a0); key PARTIAL (bundle/initialize_pool.ts:506)
- token_vault_b: signer found (bundle/initialize_pool.ts:333 via try_accounts_11718); writable PARTIAL (bundle/initialize_pool.ts:482)
- funder: signer found (bundle/initialize_pool.ts:303 via try_accounts_11718); writable PARTIAL (bundle/initialize_pool.ts:480)
- system_program: address found (bundle/initialize_pool.ts:361 via fn_122e8); executable found (bundle/initialize_pool.ts:361 via fn_122e8)
- authority: signer PARTIAL (shared.ts:15130 via try_accounts_11718); raw PARTIAL (shared.ts:15181)
- buffer: zero PARTIAL (shared.ts:15152); discriminator PARTIAL (shared.ts:15152); owner PARTIAL (shared.ts:15155 via fn_3e60); initialized PARTIAL (shared.ts:15155 via fn_3e60); writable PARTIAL (shared.ts:15166); rent_exempt PARTIAL (shared.ts:15225)

## CPIs

- bundle/initialize_pool.ts:4702 program not decoded
- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))

## PDAs derived

- bundle/initialize_pool.ts:391 find_program_address(["whirlpool", *ao, *ap, *aq, u16 ld16(s2a2) [ix data?]], program *(ld64(s2b0)))
- compared with provided accounts: whirlpool found

## Dominance (checks on every path to the operation; across calls)

- bundle/initialize_pool.ts:4702 CPI: 19 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner token_mint_a; discriminator token_mint_a; initialized token_mint_a; owner token_mint_b; discriminator token_mint_b; …)
- entrypoint.ts:14045 CPI: 31 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner token_mint_a; discriminator token_mint_a; initialized token_mint_a; owner token_mint_b; discriminator token_mint_b; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 32 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/initialize_pool.ts:4702 CPI: `bs != -1` · `bp != -1` · `u265 != -1` · `bj != -1` · `u252 != -1` · `u82 != -1` · `x > g` · ✗ `(memcmp(s358, s4d8, 0x20) as u32) == 0` #27 · `g != 0` · `(memcmp(sc0, s180, 0x20) as u32) == 0` #12 · … 16 more
  - not required on some path: #43 (signer authority)
- entrypoint.ts:14045 CPI: `af != -1` · `ac != -1` · `z != -1` · `x != -1` · `u != -1` · `u39 != -1` · ✗ `h == 0` · ✗ `(memcmp(d.owner, sa8, 0x20) as u32) != 0` #34 · `u154 != -1` · `u150 != -1` · … 14 more
  - not required on some path: #43 (signer authority)

## Relations (equalities the checks establish)

- token_program.key == (constant address) (address, found, bundle/initialize_pool.ts:356)
- system_program.key == (constant address) (address, found, bundle/initialize_pool.ts:361)
- rent.key == (constant address) (address, found, bundle/initialize_pool.ts:367)
- fee_tier.token_vault_a? == token_vault_a.key (has_one, PARTIAL, bundle/initialize_pool.ts:488)
- fee_tier.token_vault_b? == token_vault_b.key (has_one, PARTIAL, bundle/initialize_pool.ts:488)
- fee_tier.funder? == funder.key (has_one, PARTIAL, bundle/initialize_pool.ts:488)
- fee_tier.authority? == authority.key (has_one, PARTIAL, bundle/initialize_pool.ts:488)
- token_program.key == (constant address) (address, PARTIAL, bundle/initialize_pool.ts:506)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpools_config.key, token_mint_a.key, token_mint_b.key, token_vault_a.key, token_vault_b.key, funder.key, authority.key, buffer.key
- whirlpools_config.data: validated (owner found @accounts_initialize_pool:39, discriminator found @accounts_initialize_pool:39, initialized found @accounts_initialize_pool:39)
- token_mint_a.data: validated (owner found @accounts_initialize_pool:55, discriminator found @accounts_initialize_pool:55, initialized found @accounts_initialize_pool:55)
- token_mint_b.data: validated (owner found @accounts_initialize_pool:74, discriminator found @accounts_initialize_pool:74, initialized found @accounts_initialize_pool:74)
- fee_tier.key: partially-validated (key partial @accounts_initialize_pool:278, has_one partial @accounts_initialize_pool:278)
- fee_tier.data: validated (owner found @accounts_initialize_pool:128, discriminator found @accounts_initialize_pool:128, initialized found @accounts_initialize_pool:128)
- rent.key: validated (address found @accounts_initialize_pool:157)
- whirlpool.key: validated (pda found @accounts_initialize_pool:189, key found @accounts_initialize_pool:189)
- whirlpool.data: partially-validated (owner partial @fn_9d160:375, initialized partial @fn_9d160:375)
- token_program.key: validated (address found @accounts_initialize_pool:146, key partial @accounts_initialize_pool:296)
- system_program.key: validated (address found @accounts_initialize_pool:151)
- buffer.data: partially-validated (owner partial @fn_11c9a8:39, discriminator partial @fn_11c9a8:36, initialized partial @fn_11c9a8:39)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/initialize_pool.ts:172 | PARTIAL | whirlpool |  | `k != 2` | return |
| 1 | bundle/initialize_pool.ts:249 | found | whirlpools_config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `ld64(sc0) == 0` | return |
| 2 | bundle/initialize_pool.ts:265 | found | token_mint_a | owner, discriminator, initialized (via try_accounts_11e98 (count, owner, discriminator, initialized)) | `k == 2` | return |
| 3 | bundle/initialize_pool.ts:284 | found | token_mint_b | owner, discriminator, initialized (via try_accounts_11e98 (count, owner, discriminator, initialized)) | `p == 2` | return |
| 4 | bundle/initialize_pool.ts:303 | found | funder | signer (via try_accounts_11718 (count, signer)) | `s != 2` | return |
| 5 | bundle/initialize_pool.ts:307 | found |  | count | `u == 0` | anchor::AccountNotEnoughKeys |
| 6 | bundle/initialize_pool.ts:322 | found | token_vault_a | signer (via try_accounts_11718 (count, signer)) | `w != 2` | return |
| 7 | bundle/initialize_pool.ts:333 | found | token_vault_b | signer (via try_accounts_11718 (count, signer)) | `x != 2` | return |
| 8 | bundle/initialize_pool.ts:338 | found | fee_tier | owner, initialized, discriminator (via try_accounts_12008 (count, owner, initialized, discriminator)) | `y == 0` | return |
| 9 | bundle/initialize_pool.ts:356 | found | token_program | address, executable (via fn_129a0 (count, address, executable)) | `ab != 2` | return |
| 10 | bundle/initialize_pool.ts:361 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `ad != 2` | return |
| 11 | bundle/initialize_pool.ts:367 | found | rent | address (via try_accounts_11990 (count, address)) | `af == 0` | return |
| 12 | bundle/initialize_pool.ts:399 | found | whirlpool | key, pda | `!((memcmp(sc0, s180, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 13 | bundle/initialize_pool.ts:407 | PARTIAL | whirlpool | writable | `whirlpool.is_writable == 0` | anchor::ConstraintMut |
| 14 | bundle/initialize_pool.ts:469 | PARTIAL | whirlpool | rent_exempt | `bs > bf` | anchor::ConstraintRentExempt |
| 15 | bundle/initialize_pool.ts:480 | PARTIAL | funder | writable | `funder.is_writable == 0` | anchor::ConstraintMut |
| 16 | bundle/initialize_pool.ts:481 | PARTIAL | token_vault_a | writable | `!(ld8(ld64(s538 + 0x50) + 0x29) != 0)` | anchor::ConstraintMut |
| 17 | bundle/initialize_pool.ts:482 | PARTIAL | token_vault_b | writable | `!(ld8(ld64(s548 + 8) + 0x29) != 0)` | anchor::ConstraintMut |
| 18 | bundle/initialize_pool.ts:488 | PARTIAL | fee_tier | key, has_one | `(memcmp(se0, s110, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 19 | bundle/initialize_pool.ts:503 | PARTIAL | fee_tier | raw | `!(ld64(s538 + 0x28) == ld16(s2a2))` | anchor::ConstraintRaw |
| 20 | bundle/initialize_pool.ts:506 | PARTIAL | token_program | key, address | `(memcmp(s110, 0x1001520e0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 21 | entrypoint.ts:677 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 22 | entrypoint.ts:686 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 23 | entrypoint.ts:373 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 24 | entrypoint.ts:382 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 25 | entrypoint.ts:323 | found |  | address | `f == 0` | anchor::AccountSysvarMismatch |
| 26 | entrypoint.ts:336 | PARTIAL |  | address | `!(i >= 8 && (i != 0x10 && (i & -8) != 8))` | anchor::AccountSysvarMismatch |
| 27 | bundle/initialize_pool.ts:978 | PARTIAL |  | key | `(memcmp(s358, s4d8, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 28 | bundle/initialize_pool.ts:1334 | PARTIAL | whirlpool | owner, initialized (via fn_3aa0 (owner, initialized)) | `ld64(s290) == 0` | return |
| 29 | bundle/initialize_pool.ts:1697 | PARTIAL |  | key | `!((memcmp(h, i, 0x20) as i32) < 0)` | return |
| 30 | entrypoint.ts:13224 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 31 | entrypoint.ts:13436 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 32 | bundle/initialize_pool.ts:1870 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 33 | bundle/initialize_pool.ts:1879 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 34 | bundle/initialize_pool.ts:2152 | PARTIAL | d? | owner | `!((memcmp(d.owner, sa8, 0x20) as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 35 | bundle/initialize_pool.ts:2387 | PARTIAL |  | key | `(memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001520e0 /* &T` | Err(ProgramError::IncorrectProgramId) |
| 36 | bundle/initialize_pool.ts:2844 | PARTIAL |  | key | `(memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001520e0 /* &T` | Err(ProgramError::IncorrectProgramId) |
| 37 | shared.ts:14572 | PARTIAL | idl |  | `ap == 2` | return |
| 38 | shared.ts:14825 | PARTIAL | idl |  | `bh != 2` | return |
| 39 | shared.ts:14897 | PARTIAL | buffer |  | `bo != 2` | return |
| 40 | entrypoint.ts:497 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 41 | entrypoint.ts:506 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 42 | shared.ts:15123 | PARTIAL |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 43 | shared.ts:15130 | PARTIAL | authority | signer (via try_accounts_11718 (count, signer)) | `h != 2` | return |
| 44 | shared.ts:15152 | PARTIAL | buffer | zero, discriminator | `!(ld8(t) == 0 && (ld8(t + 1) == 0 && (ld8(t + 2) == 0 && (ld8(t + 3) == 0 && (ld8(t + 4) == 0 && (ld` | anchor::ConstraintZero |
| 45 | shared.ts:15155 | PARTIAL | buffer | owner, initialized (via fn_3e60 (owner, initialized)) | `buffer == 0` | return |
| 46 | shared.ts:15166 | PARTIAL | buffer | writable | `buffer.is_writable == 0` | anchor::ConstraintMut |
| 47 | shared.ts:15181 | PARTIAL | authority | raw | `w == 0x800000000000001a /* Ok */` | anchor::ConstraintRaw |
| 48 | shared.ts:15225 | PARTIAL | buffer | rent_exempt | `ah > an` | anchor::ConstraintRentExempt |
| 49 | shared.ts:15235 | PARTIAL | authority | raw | `n == 0` | anchor::ConstraintRaw |
| 50 | entrypoint.ts:13631 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 51 | shared.ts:311 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 52 | shared.ts:320 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
