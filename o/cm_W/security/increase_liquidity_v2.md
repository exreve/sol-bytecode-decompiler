# increase_liquidity_v2

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_increase_liquidity_v2 (anchor); 42 functions reachable: ix_increase_liquidity_v2, fn_17748, accounts_increase_liquidity_v2, memcpy, fn_11df50, fn_ae830, anchor_error_from, fn_14d660, fn_125710, fn_14ed60, fn_154c88, fn_14b198, ….

## Look first

- ⚠ personal_position: writable expected, no check found
- ⚠ tick_array_lower: writable expected, no check found
- ⚠ tick_array_upper: writable expected, no check found
- ⚠ token_account_0: writable expected, no check found
- ⚠ token_account_1: writable expected, no check found
- ⚠ token_program: address expected, no check found
- ⚠ token_program_2022: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | nft_owner | expected · found | — | — | — | — |
| 1 | nft_account | — | — | found (+discriminator found) | — | — |
| 2 | pool_state | — | expected · PARTIAL | found (+discriminator found) | — | — |
| 3 | protocol_position | — | — | — | — | — |
| 4 | personal_position | — | expected · NOT FOUND | found (+discriminator found) | — | — |
| 5 | tick_array_lower | — | expected · NOT FOUND | — | — | — |
| 6 | tick_array_upper | — | expected · NOT FOUND | — | — | — |
| 7 | token_account_0 | — | expected · NOT FOUND | — | — | — |
| 8 | token_account_1 | — | expected · NOT FOUND | — | — | — |
| 9 | token_vault_0 | — | expected · PARTIAL | — | — | — |
| 10 | token_vault_1 | — | expected · PARTIAL | — | — | — |
| 11 | token_program | — | — | — | — | = Tokenkeg… · expected · NOT FOUND |
| 12 | token_program_2022 | — | — | — | — | = TokenzQd… · expected · NOT FOUND |
| 13 | vault_0_mint | — | — | — | — | — |
| 14 | vault_1_mint | — | — | — | — | — |

## Constraints per account

- nft_owner: signer found (bundle/increase_liquidity_v2.ts:391 via try_accounts_17a30)
- nft_account: owner found (bundle/increase_liquidity_v2.ts:393 via try_accounts_1678); discriminator found (bundle/increase_liquidity_v2.ts:393 via try_accounts_1678); initialized found (bundle/increase_liquidity_v2.ts:393 via try_accounts_1678)
- pool_state: discriminator found (bundle/increase_liquidity_v2.ts:434 via fn_11e0); owner found (bundle/increase_liquidity_v2.ts:434 via fn_11e0); writable PARTIAL (bundle/increase_liquidity_v2.ts:688)
- protocol_position: no checks found
- personal_position: owner found (bundle/increase_liquidity_v2.ts:481 via try_accounts_18368); initialized found (bundle/increase_liquidity_v2.ts:481 via try_accounts_18368); discriminator found (bundle/increase_liquidity_v2.ts:481 via try_accounts_18368); writable NOT FOUND
- tick_array_lower: writable NOT FOUND
- tick_array_upper: writable NOT FOUND
- token_account_0: key found (bundle/increase_liquidity_v2.ts:1076); writable NOT FOUND
- token_account_1: writable NOT FOUND
- token_vault_0: writable PARTIAL (bundle/increase_liquidity_v2.ts:749)
- token_vault_1: writable PARTIAL (bundle/increase_liquidity_v2.ts:766)
- token_program: address NOT FOUND
- token_program_2022: address NOT FOUND
- vault_0_mint: no checks found
- vault_1_mint: no checks found

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): nft_owner.key, nft_account.key, pool_state.key, protocol_position.key, personal_position.key, tick_array_lower.key, tick_array_upper.key, token_account_1.key, token_vault_0.key, token_vault_1.key, token_program.key, token_program_2022.key, vault_0_mint.key, vault_1_mint.key, ix.liquidity, ix.amount_0_max, ix.amount_1_max, ix.base_flag
- nft_account.data: validated (owner found @accounts_increase_liquidity_v2:13, discriminator found @accounts_increase_liquidity_v2:13, initialized found @accounts_increase_liquidity_v2:13)
- pool_state.data: validated (owner found @accounts_increase_liquidity_v2:54, discriminator found @accounts_increase_liquidity_v2:54)
- personal_position.data: validated (owner found @accounts_increase_liquidity_v2:101, discriminator found @accounts_increase_liquidity_v2:101, initialized found @accounts_increase_liquidity_v2:101)
- token_account_0.key: validated (key found @fn_ae830:20)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/increase_liquidity_v2.ts:391 | found | nft_owner | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/increase_liquidity_v2.ts:393 | found | nft_account | owner, discriminator, initialized (via try_accounts_1678 (count, owner, discriminator, initialized)) | `ld32(s120 + 0xb0) == 2` | return |
| 2 | bundle/increase_liquidity_v2.ts:434 | found | pool_state | discriminator, owner (via fn_11e0 (count, discriminator, owner)) | `f != 2` | return |
| 3 | bundle/increase_liquidity_v2.ts:481 | found | personal_position | owner, initialized, discriminator (via try_accounts_18368 (count, owner, initialized, discriminator)) | `ld64(s120) == 0` | return |
| 4 | bundle/increase_liquidity_v2.ts:525 | found |  | raw | `x == 2` | anchor::ConstraintRaw |
| 5 | bundle/increase_liquidity_v2.ts:540 | PARTIAL |  | raw | `ag == 2` | anchor::ConstraintRaw |
| 6 | bundle/increase_liquidity_v2.ts:555 | PARTIAL |  | raw | `aj == 2` | anchor::ConstraintRaw |
| 7 | bundle/increase_liquidity_v2.ts:570 | PARTIAL |  | raw | `am == 2` | anchor::ConstraintRaw |
| 8 | bundle/increase_liquidity_v2.ts:585 | PARTIAL |  | raw | `ap == 2` | anchor::ConstraintRaw |
| 9 | bundle/increase_liquidity_v2.ts:600 | PARTIAL |  | raw | `at == 2` | anchor::ConstraintRaw |
| 10 | bundle/increase_liquidity_v2.ts:615 | PARTIAL |  | raw | `aw == 2` | anchor::ConstraintRaw |
| 11 | bundle/increase_liquidity_v2.ts:630 | PARTIAL |  | raw | `az == 2` | anchor::ConstraintRaw |
| 12 | bundle/increase_liquidity_v2.ts:645 | PARTIAL |  | raw | `bc == 2` | anchor::ConstraintRaw |
| 13 | bundle/increase_liquidity_v2.ts:674 | PARTIAL |  | raw | `!((memcmp((k & -8) + 0x28, bh + 8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 14 | bundle/increase_liquidity_v2.ts:675 | PARTIAL |  | raw | `ld64((k & -8) + 0x68) != 1` | anchor::ConstraintRaw |
| 15 | bundle/increase_liquidity_v2.ts:686 | PARTIAL |  | token_owner | `!((memcmp((k & -8) + 0x48, s120, 0x20) as u32) == 0)` | anchor::ConstraintTokenOwner |
| 16 | bundle/increase_liquidity_v2.ts:688 | PARTIAL | pool_state | writable | `pool_state.is_writable == 0` | anchor::ConstraintMut |
| 17 | bundle/increase_liquidity_v2.ts:690 | PARTIAL |  | writable | `!(ld8(ld64(bk) + 0x29) != 0)` | anchor::ConstraintMut |
| 18 | bundle/increase_liquidity_v2.ts:694 | PARTIAL |  | raw | `!((bm as u32) == 0)` | anchor::ConstraintRaw |
| 19 | bundle/increase_liquidity_v2.ts:695 | PARTIAL |  | writable | `!(ld8(ld64(s518) + 0x29) != 0)` | anchor::ConstraintMut |
| 20 | bundle/increase_liquidity_v2.ts:709 | PARTIAL |  | raw | `!((bo as u32) == 0)` | anchor::ConstraintRaw |
| 21 | bundle/increase_liquidity_v2.ts:710 | PARTIAL |  | writable | `!(ld8(ld64(s520) + 0x29) != 0)` | anchor::ConstraintMut |
| 22 | bundle/increase_liquidity_v2.ts:724 | PARTIAL |  | raw | `!((bq as u32) == 0)` | anchor::ConstraintRaw |
| 23 | bundle/increase_liquidity_v2.ts:725 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s528) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 24 | bundle/increase_liquidity_v2.ts:728 | PARTIAL |  | token_mint | `(memcmp(ld64(s528) + 0x28, s120, 0x20) as u32) != 0` | anchor::ConstraintTokenMint |
| 25 | bundle/increase_liquidity_v2.ts:736 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s530) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 26 | bundle/increase_liquidity_v2.ts:740 | PARTIAL |  | token_mint | `(bt as u32) != 0` | anchor::ConstraintTokenMint |
| 27 | bundle/increase_liquidity_v2.ts:749 | PARTIAL | token_vault_0 | writable | `token_vault_0.is_writable == 0` | anchor::ConstraintMut |
| 28 | bundle/increase_liquidity_v2.ts:764 | PARTIAL |  | raw | `!((by as u32) == 0)` | anchor::ConstraintRaw |
| 29 | bundle/increase_liquidity_v2.ts:766 | PARTIAL | token_vault_1 | writable | `token_vault_1.is_writable == 0` | anchor::ConstraintMut |
| 30 | bundle/increase_liquidity_v2.ts:781 | PARTIAL |  | raw | `!((cc as u32) == 0)` | anchor::ConstraintRaw |
| 31 | bundle/increase_liquidity_v2.ts:786 | PARTIAL |  | key, address | `(memcmp(s1a0, s180, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 32 | bundle/increase_liquidity_v2.ts:804 | PARTIAL |  | address | `q != 0` | anchor::ConstraintAddress |
| 33 | bundle/increase_liquidity_v2.ts:1064 | found | pool_state |  | `f != 2` | return |
| 34 | bundle/increase_liquidity_v2.ts:1067 | found | personal_position |  | `f != 2` | return |
| 35 | bundle/increase_liquidity_v2.ts:1070 | found | tick_array_lower |  | `f != 2` | return |
| 36 | bundle/increase_liquidity_v2.ts:1073 | found | tick_array_upper |  | `f != 2` | return |
| 37 | bundle/increase_liquidity_v2.ts:1076 | found | token_account_0 | key | `(memcmp(p, c, 0x20) as u32) == 0 && (common_is_closed(q) == 0 && ld64(ld64(q + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 38 | bundle/increase_liquidity_v2.ts:1111 | found |  | key | `(memcmp(t, c, 0x20) as u32) == 0 && (common_is_closed(u) == 0 && ld64(ld64(u + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 39 | shared.ts:1017 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 40 | shared.ts:1035 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 41 | shared.ts:1043 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 42 | entrypoint.ts:487 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 43 | entrypoint.ts:496 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 44 | entrypoint.ts:88 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 45 | entrypoint.ts:106 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 46 | entrypoint.ts:114 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x2a81f931cd559bc0 /* account:TickArrayState */` | anchor::AccountDiscriminatorMismatch |
| 47 | entrypoint.ts:743 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
