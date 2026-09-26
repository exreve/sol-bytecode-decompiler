# initialize_token_badge

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_initialize_token_badge (anchor); 49 functions reachable: ix_initialize_token_badge, accounts_initialize_token_badge, memcpy, fn_83340, fn_87828, fn_149678, fn_11f980, fn_7be0, fn_147990, fn_139720, fn_9900, fn_9d30, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpools_config [str] | — | — | found (+discriminator found) | — | — |
| 1 | whirlpools_config_extension [str] | — | — | found (+discriminator found) | — | — |
| 2 | token_mint [str] | — | — | found (+discriminator found) | — | — |
| 3 | funder [str] | found | PARTIAL | — | — | — |
| 4 | token_badge [str] | — | runtime | runtime | — | — |
| 5 | token_badge_authority [str] | found | — | — | — | PARTIAL |
| 6 | system_program [str] | — | — | — | found | found |

## Constraints per account

- whirlpools_config: owner found (bundle/initialize_token_badge.ts:165 via try_accounts_11de0); initialized found (bundle/initialize_token_badge.ts:165 via try_accounts_11de0); discriminator found (bundle/initialize_token_badge.ts:165 via try_accounts_11de0)
- whirlpools_config_extension: owner found (bundle/initialize_token_badge.ts:180 via try_accounts_120c0); initialized found (bundle/initialize_token_badge.ts:180 via try_accounts_120c0); discriminator found (bundle/initialize_token_badge.ts:180 via try_accounts_120c0); key PARTIAL (bundle/initialize_token_badge.ts:369); has_one PARTIAL (bundle/initialize_token_badge.ts:369)
- token_mint: owner found (bundle/initialize_token_badge.ts:200 via try_accounts_610); discriminator found (bundle/initialize_token_badge.ts:200 via try_accounts_610); initialized found (bundle/initialize_token_badge.ts:200 via try_accounts_610)
- funder: signer found (bundle/initialize_token_badge.ts:235 via try_accounts_11718); writable PARTIAL (bundle/initialize_token_badge.ts:388)
- token_badge: key found (bundle/initialize_token_badge.ts:276); pda found (bundle/initialize_token_badge.ts:276); writable runtime (bundle/initialize_token_badge.ts:139) — written: the runtime rejects changes to a read-only account; rent_exempt PARTIAL (bundle/initialize_token_badge.ts:357); owner runtime (bundle/initialize_token_badge.ts:139) — data written / lamports debited: only the owner program may (the runtime rejects it otherwise)
- token_badge_authority: signer found (bundle/initialize_token_badge.ts:196 via try_accounts_11718); key PARTIAL (bundle/initialize_token_badge.ts:386); address PARTIAL (bundle/initialize_token_badge.ts:386)
- system_program: address found (bundle/initialize_token_badge.ts:247 via fn_122e8); executable found (bundle/initialize_token_badge.ts:247 via fn_122e8)

## CPIs

- shared.ts:20063 [conditional] program not decoded

## PDAs derived

- bundle/initialize_token_badge.ts:268 find_program_address(["token_badge", *ab, *s20], program *(ld64(s230)))
- compared with provided accounts: token_badge found

## Operations (account writes)

- bundle/initialize_token_badge.ts:139 ACCOUNT_DATA_WRITE token_badge.data[8..40] = ld64(m + 0x18)
- bundle/initialize_token_badge.ts:142 ACCOUNT_DATA_WRITE token_badge.data[72..73] = 0

## Dominance (checks on every path to the operation; across calls)

- bundle/initialize_token_badge.ts:139 ACCOUNT_DATA_WRITE: 20 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner whirlpools_config_extension; initialized whirlpools_config_extension; discriminator whirlpools_config_extension; signer token_badge_authority; owner token_mint; …)
- bundle/initialize_token_badge.ts:142 ACCOUNT_DATA_WRITE: 20 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner whirlpools_config_extension; initialized whirlpools_config_extension; discriminator whirlpools_config_extension; signer token_badge_authority; owner token_mint; …)
- shared.ts:20063 CPI: 14 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner whirlpools_config_extension; initialized whirlpools_config_extension; discriminator whirlpools_config_extension; signer token_badge_authority; owner token_mint; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/initialize_token_badge.ts:139 ACCOUNT_DATA_WRITE token_badge.data[8..40] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — token_badge: no discriminator check found
  - [found] write gated (signer / constraint) — signer token_badge_authority accounts_initialize_token_badge:40; signer funder accounts_initialize_token_badge:79; address/executable system_program accounts_initialize_token_badge:91
- bundle/initialize_token_badge.ts:142 ACCOUNT_DATA_WRITE token_badge.data[72..73] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — token_badge: no discriminator check found
  - [found] write gated (signer / constraint) — signer token_badge_authority accounts_initialize_token_badge:40; signer funder accounts_initialize_token_badge:79; address/executable system_program accounts_initialize_token_badge:91

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/initialize_token_badge.ts:139 ACCOUNT_DATA_WRITE token_badge.data[8..40]: ✗ `f == 2`
- bundle/initialize_token_badge.ts:142 ACCOUNT_DATA_WRITE token_badge.data[72..73]: ✗ `f == 2`
- shared.ts:20063 CPI: `bp != -1` · `bm != -1` · `u251 != -1` · `bg != -1` · `u238 != -1` · `u82 != -1` · `x > g` · ✗ `(memcmp(s40, s208, 0x20) as u32) == 0` #18 · `g != 0` · `(memcmp(s1a8, se0, 0x20) as u32) == 0` #8 · … 10 more

## Relations (equalities the checks establish)

- system_program.key == (constant address) (address, found, bundle/initialize_token_badge.ts:247)
- whirlpools_config_extension.funder? == funder.key (has_one, PARTIAL, bundle/initialize_token_badge.ts:369)
- whirlpools_config_extension.token_badge_authority? == token_badge_authority.key (has_one, PARTIAL, bundle/initialize_token_badge.ts:369)
- token_badge_authority.key == (constant address) (address, PARTIAL, bundle/initialize_token_badge.ts:386)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpools_config.key, token_mint.key, funder.key
- whirlpools_config.data: validated (owner found @accounts_initialize_token_badge:9, discriminator found @accounts_initialize_token_badge:9, initialized found @accounts_initialize_token_badge:9)
- whirlpools_config_extension.key: partially-validated (key partial @accounts_initialize_token_badge:213, has_one partial @accounts_initialize_token_badge:213)
- whirlpools_config_extension.data: validated (owner found @accounts_initialize_token_badge:24, discriminator found @accounts_initialize_token_badge:24, initialized found @accounts_initialize_token_badge:24)
- token_mint.data: validated (owner found @accounts_initialize_token_badge:44, discriminator found @accounts_initialize_token_badge:44, initialized found @accounts_initialize_token_badge:44)
- token_badge.key: validated (pda found @accounts_initialize_token_badge:120, key found @accounts_initialize_token_badge:120)
- token_badge.data: runtime (owner runtime @ix_initialize_token_badge:42)
- token_badge_authority.key: partially-validated (address partial @accounts_initialize_token_badge:230, key partial @accounts_initialize_token_badge:230)
- system_program.key: validated (address found @accounts_initialize_token_badge:91)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/initialize_token_badge.ts:145 | PARTIAL | token_badge |  | `q != 2` | return |
| 1 | bundle/initialize_token_badge.ts:165 | found | whirlpools_config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `ld64(s1a8) == 0` | return |
| 2 | bundle/initialize_token_badge.ts:180 | found | whirlpools_config_extension | owner, initialized, discriminator (via try_accounts_120c0 (count, owner, initialized, discriminator)) | `ld64(s1a8) == 0` | return |
| 3 | bundle/initialize_token_badge.ts:196 | found | token_badge_authority | signer (via try_accounts_11718 (count, signer)) | `j != 2` | return |
| 4 | bundle/initialize_token_badge.ts:200 | found | token_mint | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `l == 2` | return |
| 5 | bundle/initialize_token_badge.ts:218 | found |  | count | `q == 0` | anchor::AccountNotEnoughKeys |
| 6 | bundle/initialize_token_badge.ts:235 | found | funder | signer (via try_accounts_11718 (count, signer)) | `s != 2` | return |
| 7 | bundle/initialize_token_badge.ts:247 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `u != 2` | return |
| 8 | bundle/initialize_token_badge.ts:276 | found | token_badge | key, pda | `!((memcmp(s1a8, se0, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 9 | bundle/initialize_token_badge.ts:293 | PARTIAL | token_badge | writable | `token_badge.is_writable == 0` | anchor::ConstraintMut |
| 10 | bundle/initialize_token_badge.ts:357 | PARTIAL | token_badge | rent_exempt | `bh > ld64(s3d8)` | anchor::ConstraintRentExempt |
| 11 | bundle/initialize_token_badge.ts:369 | PARTIAL | whirlpools_config_extension | key, has_one | `(memcmp(s20, s98, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 12 | bundle/initialize_token_badge.ts:386 | PARTIAL | token_badge_authority | key, address | `!((memcmp(s20, s98, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 13 | bundle/initialize_token_badge.ts:388 | PARTIAL | funder | writable | `funder.is_writable == 0` | anchor::ConstraintMut |
| 14 | entrypoint.ts:677 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 15 | entrypoint.ts:686 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 16 | entrypoint.ts:740 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 17 | entrypoint.ts:749 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 18 | bundle/initialize_token_badge.ts:579 | PARTIAL |  | key | `(memcmp(s40, s208, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 19 | entrypoint.ts:13224 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 20 | entrypoint.ts:13263 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 21 | bundle/initialize_token_badge.ts:982 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 22 | bundle/initialize_token_badge.ts:991 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
