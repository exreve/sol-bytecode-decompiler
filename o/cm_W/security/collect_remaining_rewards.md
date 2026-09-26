# collect_remaining_rewards

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_collect_remaining_rewards (anchor); 47 functions reachable: ix_collect_remaining_rewards, accounts_collect_remaining_rewards, fn_49b88, fn_c1ac0, anchor_error_from, fn_14b198, fn_14ed60, fn_153158, memcpy, fn_13e628, fn_147a20, fn_5608, ….

## Look first

- ⚠ funder_token_account: writable expected, no check found
- ⚠ reward_token_vault: writable expected, no check found
- ⚠ token_program: address expected, no check found
- ⚠ token_program_2022: address expected, no check found
- ⚠ memo_program: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | reward_funder | expected · found | — | — | — | — |
| 1 | funder_token_account | — | expected · NOT FOUND | found (+discriminator found) | — | — |
| 2 | pool_state | — | expected · PARTIAL | found (+discriminator found) | — | — |
| 3 | reward_token_vault | — | expected · NOT FOUND | found (+discriminator found) | — | — |
| 4 | reward_vault_mint | — | — | found (+discriminator found) | — | — |
| 5 | token_program | — | — | — | — | = Tokenkeg… · expected · NOT FOUND |
| 6 | token_program_2022 | — | — | — | — | = TokenzQd… · expected · NOT FOUND |
| 7 | memo_program | — | — | — | — | = MemoSq4g… · expected · NOT FOUND |

## Constraints per account

- reward_funder: signer found (bundle/collect_remaining_rewards.ts:219 via try_accounts_17a30)
- funder_token_account: owner found (bundle/collect_remaining_rewards.ts:221 via try_accounts_1678); discriminator found (bundle/collect_remaining_rewards.ts:221 via try_accounts_1678); initialized found (bundle/collect_remaining_rewards.ts:221 via try_accounts_1678); key PARTIAL (bundle/collect_remaining_rewards.ts:849); writable NOT FOUND
- pool_state: discriminator found (bundle/collect_remaining_rewards.ts:264 via fn_11e0); owner found (bundle/collect_remaining_rewards.ts:264 via fn_11e0); writable PARTIAL (bundle/collect_remaining_rewards.ts:398)
- reward_token_vault: owner found (bundle/collect_remaining_rewards.ts:267 via try_accounts_1678); discriminator found (bundle/collect_remaining_rewards.ts:267 via try_accounts_1678); initialized found (bundle/collect_remaining_rewards.ts:267 via try_accounts_1678); writable NOT FOUND
- reward_vault_mint: owner found (bundle/collect_remaining_rewards.ts:309 via try_accounts_15c0); discriminator found (bundle/collect_remaining_rewards.ts:309 via try_accounts_15c0); initialized found (bundle/collect_remaining_rewards.ts:309 via try_accounts_15c0)
- token_program: address NOT FOUND
- token_program_2022: address NOT FOUND
- memo_program: address NOT FOUND

## CPIs

- bundle/collect_remaining_rewards.ts:2243 [conditional] TOKEN_2022_PROGRAM (constant).TransferChecked — amount: cf, ld8(ld64(s338 + 0x10) + 0x30)
- bundle/collect_remaining_rewards.ts:2378 TOKEN_PROGRAM (constant).Transfer — amount: ba

## Dominance (checks on every path to the operation; across calls)

- bundle/collect_remaining_rewards.ts:2243 TOKEN_TRANSFER: 9 dominating checks (signer reward_funder; owner funder_token_account; discriminator funder_token_account; initialized funder_token_account; discriminator pool_state; owner pool_state; owner reward_token_vault; discriminator reward_token_vault; …)
- bundle/collect_remaining_rewards.ts:2378 TOKEN_TRANSFER: 7 dominating checks (signer reward_funder; owner funder_token_account; discriminator funder_token_account; initialized funder_token_account; discriminator pool_state; owner pool_state; owner reward_token_vault; discriminator reward_token_vault; …)

## Authority (who enables each value movement / authority change)

- bundle/collect_remaining_rewards.ts:2243 TOKEN_TRANSFER: signer reward_funder (found)
- bundle/collect_remaining_rewards.ts:2378 TOKEN_TRANSFER: signer reward_funder (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/collect_remaining_rewards.ts:2243 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer reward_funder (found)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_2022_PROGRAM
  - [found] relevant checks on every path — 9 dominating checks
- bundle/collect_remaining_rewards.ts:2378 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer reward_funder (found)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_PROGRAM
  - [found] relevant checks on every path — 7 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/collect_remaining_rewards.ts:2243 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked ⇐ signer reward_funder (found)
- bundle/collect_remaining_rewards.ts:2378 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer ⇐ signer reward_funder (found)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/collect_remaining_rewards.ts:2243 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked: ✗ `ld64(s18) != 0` · `u261 != -1` · `bp != -1` · `u243 != -1` · `bj != -1` · `u229 != -1` · `bf != -1` · `y != 2` · ✗ `w == 0` · `u40 != -1` · … 13 more
- bundle/collect_remaining_rewards.ts:2378 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer: ✗ `ld64(s18) != 0` · `u81 != -1` · `ae != -1` · `u67 != -1` · `u63 != -1` · `u40 != -1` · `u36 != -1` · `u24 != -1` · `l != -1` · `g != 0` · … 9 more

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): reward_funder.key, pool_state.key, reward_token_vault.key, reward_vault_mint.key, token_program.key, token_program_2022.key, memo_program.key, ix.reward_index
- funder_token_account.key: partially-validated (key partial @fn_c1ac0:6)
- funder_token_account.data: validated (owner found @accounts_collect_remaining_rewards:13, discriminator found @accounts_collect_remaining_rewards:13, initialized found @accounts_collect_remaining_rewards:13)
- pool_state.data: validated (owner found @accounts_collect_remaining_rewards:56, discriminator found @accounts_collect_remaining_rewards:56)
- reward_token_vault.data: validated (owner found @accounts_collect_remaining_rewards:59, discriminator found @accounts_collect_remaining_rewards:59, initialized found @accounts_collect_remaining_rewards:59)
- reward_vault_mint.data: validated (owner found @accounts_collect_remaining_rewards:101, discriminator found @accounts_collect_remaining_rewards:101, initialized found @accounts_collect_remaining_rewards:101)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/collect_remaining_rewards.ts:219 | found | reward_funder | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/collect_remaining_rewards.ts:221 | found | funder_token_account | owner, discriminator, initialized (via try_accounts_1678 (count, owner, discriminator, initialized)) | `ld32(sb8 + 0x90) == 2` | return |
| 2 | bundle/collect_remaining_rewards.ts:264 | found | pool_state | discriminator, owner (via fn_11e0 (count, discriminator, owner)) | `f != 2` | return |
| 3 | bundle/collect_remaining_rewards.ts:267 | found | reward_token_vault | owner, discriminator, initialized (via try_accounts_1678 (count, owner, discriminator, initialized)) | `ld32(sb8 + 0x90) == 2` | return |
| 4 | bundle/collect_remaining_rewards.ts:309 | found | reward_vault_mint | owner, discriminator, initialized (via try_accounts_15c0 (count, owner, discriminator, initialized)) | `ld32(sd8) == 2` | return |
| 5 | bundle/collect_remaining_rewards.ts:353 | found |  | writable | `z == 2` | anchor::ConstraintMut |
| 6 | bundle/collect_remaining_rewards.ts:368 | PARTIAL |  | writable | `ac == 2` | anchor::ConstraintMut |
| 7 | bundle/collect_remaining_rewards.ts:397 | PARTIAL |  | writable | `!(ld8(ld64((k & -8) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 8 | bundle/collect_remaining_rewards.ts:398 | PARTIAL | pool_state | writable | `pool_state.is_writable == 0` | anchor::ConstraintMut |
| 9 | bundle/collect_remaining_rewards.ts:400 | PARTIAL |  | writable | `!(ld8(ld64(aj + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 10 | bundle/collect_remaining_rewards.ts:405 | PARTIAL |  | key, address | `(memcmp(s138, s118, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 11 | bundle/collect_remaining_rewards.ts:422 | PARTIAL |  | address | `q != 0` | anchor::ConstraintAddress |
| 12 | bundle/collect_remaining_rewards.ts:572 | PARTIAL |  | key, custom | `(memcmp(s2ff, s118, 0x20) as u32) == 0` | error::UnInitializedRewardInfo |
| 13 | bundle/collect_remaining_rewards.ts:596 | PARTIAL |  | custom | `o != p` | error::NotApproved |
| 14 | bundle/collect_remaining_rewards.ts:597 | PARTIAL |  | key | `!((memcmp(s358, s2bf, 0x20) as u32) == 0)` | anchor::RequireKeysEqViolated |
| 15 | bundle/collect_remaining_rewards.ts:600 | PARTIAL |  | key | `!((memcmp(s138, s2df, 0x20) as u32) == 0)` | anchor::RequireKeysEqViolated |
| 16 | bundle/collect_remaining_rewards.ts:849 | PARTIAL | funder_token_account | key | `(memcmp(f, c, 0x20) as u32) == 0 && (common_is_closed(g) == 0 && ld64(ld64(g + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 17 | bundle/collect_remaining_rewards.ts:887 | PARTIAL | reward_token_vault |  | `h == 2` | Err(ProgramError::AccountBorrowFailed) |
| 18 | shared.ts:1017 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 19 | shared.ts:1035 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 20 | shared.ts:1043 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 21 | bundle/collect_remaining_rewards.ts:1069 | PARTIAL |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 22 | bundle/collect_remaining_rewards.ts:1074 | PARTIAL |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 23 | bundle/collect_remaining_rewards.ts:1085 | PARTIAL |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 24 | bundle/collect_remaining_rewards.ts:2717 | PARTIAL |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 25 | bundle/collect_remaining_rewards.ts:2728 | PARTIAL |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 26 | entrypoint.ts:4230 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 27 | entrypoint.ts:4332 | PARTIAL |  | key | `(memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
