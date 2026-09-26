# initialize_reward_v2

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_initialize_reward_v2 (anchor); 61 functions reachable: ix_initialize_reward_v2, accounts_initialize_reward_v2, memcpy, fn_3cd20, fn_6aa0, fn_147990, fn_11f980, fn_139720, fn_149678, fn_89e0, fn_145330, fn_14c5c0, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | reward_authority [str] | found | — | — | — | found |
| 1 | whirlpool [str] | — | found | found (+discriminator found) | — | — |
| 2 | reward_mint [str] | — | — | found (+discriminator found) | — | — |
| 3 | reward_token_badge [str] | — | — | — | — | — |
| 4 | rent [str] | — | — | — | — | found |
| 5 | funder [str] | found | found | — | — | — |
| 6 | reward_vault [str] | found | found | — | — | — |
| 7 | reward_token_program [str] | — | — | — | found | found |
| 8 | system_program [str] | — | — | — | found | found |

## Constraints per account

- reward_authority: signer found (bundle/initialize_reward_v2.ts:214 via try_accounts_11718); key found (bundle/initialize_reward_v2.ts:311); address found (bundle/initialize_reward_v2.ts:311)
- whirlpool: owner found (bundle/initialize_reward_v2.ts:228 via try_accounts_11a48); initialized found (bundle/initialize_reward_v2.ts:228 via try_accounts_11a48); discriminator found (bundle/initialize_reward_v2.ts:228 via try_accounts_11a48); writable found (bundle/initialize_reward_v2.ts:323)
- reward_mint: owner found (bundle/initialize_reward_v2.ts:244 via try_accounts_610); discriminator found (bundle/initialize_reward_v2.ts:244 via try_accounts_610); initialized found (bundle/initialize_reward_v2.ts:244 via try_accounts_610)
- reward_token_badge: count found (bundle/initialize_reward_v2.ts:260); key found (bundle/initialize_reward_v2.ts:336); pda found (bundle/initialize_reward_v2.ts:336)
- rent: address found (bundle/initialize_reward_v2.ts:297 via try_accounts_11990)
- funder: signer found (bundle/initialize_reward_v2.ts:226 via try_accounts_11718); writable found (bundle/initialize_reward_v2.ts:313)
- reward_vault: signer found (bundle/initialize_reward_v2.ts:281 via try_accounts_11718); writable found (bundle/initialize_reward_v2.ts:350)
- reward_token_program: address found (bundle/initialize_reward_v2.ts:286 via try_accounts_120); executable found (bundle/initialize_reward_v2.ts:286 via try_accounts_120)
- system_program: address found (bundle/initialize_reward_v2.ts:291 via fn_122e8); executable found (bundle/initialize_reward_v2.ts:291 via fn_122e8)

## CPIs

- entrypoint.ts:14045 [conditional] *(b + 0x30) (account-supplied; (id not a constant, and not compared with a known program id in this function))
- bundle/initialize_reward_v2.ts:3078 program not decoded

## PDAs derived

- bundle/initialize_reward_v2.ts:330 find_program_address(["token_badge", *(ak + 0x188), *s2b0], program *(ld64(s4e8 + 0x58)))
- compared with provided accounts: reward_token_badge found

## Dominance (checks on every path to the operation; across calls)

- entrypoint.ts:14045 CPI: 21 dominating checks (signer reward_authority; signer funder; owner whirlpool; initialized whirlpool; discriminator whirlpool; owner reward_mint; discriminator reward_mint; initialized reward_mint; …)
- bundle/initialize_reward_v2.ts:3078 CPI: 20 dominating checks (signer reward_authority; signer funder; owner whirlpool; initialized whirlpool; discriminator whirlpool; owner reward_mint; discriminator reward_mint; initialized reward_mint; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- entrypoint.ts:14045 CPI [CPI (account-supplied program)]
  - [NOT FOUND] program id checked — (id not a constant, and not compared with a known program id in this function)
  - [found] no PDA signature lent to it — no signer seeds
  - [found] relevant checks on every path — 22 dominating checks

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- entrypoint.ts:14045 CPI: `af != -1` · `ac != -1` · `z != -1` · `x != -1` · `u != -1` · `u39 != -1` · ✗ `h == 0` · ✗ `(memcmp(d.owner, sa8, 0x20) as u32) != 0` #22 · `u154 != -1` · `u150 != -1` · … 15 more
- bundle/initialize_reward_v2.ts:3078 CPI: ✗ `g == 0x8000000000000000` · `m != -1` · `k != -1` · `u22 != -1` · `u18 != -1` · `u42 != -1` · `u37 != -1` · `j == 2` · ✗ `j != 2` · ✗ `f == 0` · … 1 more

## Relations (equalities the checks establish)

- reward_token_program.key == (constant address) (address, found, bundle/initialize_reward_v2.ts:286)
- system_program.key == (constant address) (address, found, bundle/initialize_reward_v2.ts:291)
- rent.key == (constant address) (address, found, bundle/initialize_reward_v2.ts:297)
- reward_authority.key == (constant address) (address, found, bundle/initialize_reward_v2.ts:311)
- reward_token_program.key == (constant address) (address, found, bundle/initialize_reward_v2.ts:369)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool.key, reward_mint.key, funder.key, reward_vault.key
- reward_authority.key: validated (address found @accounts_initialize_reward_v2:108, key found @accounts_initialize_reward_v2:108)
- whirlpool.data: validated (owner found @accounts_initialize_reward_v2:25, discriminator found @accounts_initialize_reward_v2:25, initialized found @accounts_initialize_reward_v2:25)
- reward_mint.data: validated (owner found @accounts_initialize_reward_v2:41, discriminator found @accounts_initialize_reward_v2:41, initialized found @accounts_initialize_reward_v2:41)
- reward_token_badge.key: validated (pda found @accounts_initialize_reward_v2:133, key found @accounts_initialize_reward_v2:133)
- rent.key: validated (address found @accounts_initialize_reward_v2:94)
- reward_token_program.key: validated (address found @accounts_initialize_reward_v2:83)
- system_program.key: validated (address found @accounts_initialize_reward_v2:88)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/initialize_reward_v2.ts:188 | PARTIAL | whirlpool |  | `i != 2` | return |
| 1 | bundle/initialize_reward_v2.ts:214 | found | reward_authority | signer (via try_accounts_11718 (count, signer)) | `f != 2` | return |
| 2 | bundle/initialize_reward_v2.ts:226 | found | funder | signer (via try_accounts_11718 (count, signer)) | `g != 2` | return |
| 3 | bundle/initialize_reward_v2.ts:228 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `ld64(s290) == 0` | return |
| 4 | bundle/initialize_reward_v2.ts:244 | found | reward_mint | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `ld32(s290) == 2` | return |
| 5 | bundle/initialize_reward_v2.ts:260 | found | reward_token_badge | count | `n == 0` | anchor::AccountNotEnoughKeys |
| 6 | bundle/initialize_reward_v2.ts:281 | found | reward_vault | signer (via try_accounts_11718 (count, signer)) | `s != 2` | return |
| 7 | bundle/initialize_reward_v2.ts:286 | found | reward_token_program | address, executable (via try_accounts_120 (count, address, executable)) | `u != 2` | return |
| 8 | bundle/initialize_reward_v2.ts:291 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `w != 2` | return |
| 9 | bundle/initialize_reward_v2.ts:297 | found | rent | address (via try_accounts_11990 (count, address)) | `y == 0` | return |
| 10 | bundle/initialize_reward_v2.ts:311 | found | reward_authority | key, address | `!((memcmp(s2b0, s2d8, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 11 | bundle/initialize_reward_v2.ts:313 | found | funder | writable | `funder.is_writable == 0` | anchor::ConstraintMut |
| 12 | bundle/initialize_reward_v2.ts:323 | found | whirlpool | writable | `!(ld8(ld64(ak) + 0x29) != 0)` | anchor::ConstraintMut |
| 13 | bundle/initialize_reward_v2.ts:336 | found | reward_token_badge | key, pda | `(memcmp(s290, s2f8, 0x20) as u32) != 0` | anchor::ConstraintSeeds |
| 14 | bundle/initialize_reward_v2.ts:350 | found | reward_vault | writable | `ld8(ld64(s4e8 + 0x28) + 0x29) == 0` | anchor::ConstraintMut |
| 15 | bundle/initialize_reward_v2.ts:369 | found | reward_token_program | address | `ah != 0` | anchor::ConstraintAddress |
| 16 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 17 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 18 | entrypoint.ts:323 | found |  | address | `f == 0` | anchor::AccountSysvarMismatch |
| 19 | entrypoint.ts:336 | PARTIAL |  | address | `!(i >= 8 && (i != 0x10 && (i & -8) != 8))` | anchor::AccountSysvarMismatch |
| 20 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 21 | bundle/initialize_reward_v2.ts:1507 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 22 | bundle/initialize_reward_v2.ts:1934 | PARTIAL | d? | owner | `!((memcmp(d.owner, sa8, 0x20) as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 23 | bundle/initialize_reward_v2.ts:2169 | PARTIAL |  | key | `(memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001520e0 /* &T` | Err(ProgramError::IncorrectProgramId) |
| 24 | bundle/initialize_reward_v2.ts:2339 | found |  | key | `(memcmp(b, 0x100152240 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001520e0 /* &T` | Err(ProgramError::IncorrectProgramId) |
