# swap_v2

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_swap_v2 (anchor); 54 functions reachable: ix_swap_v2, accounts_swap_v2, memcpy, fn_414a8, fn_ba658, fn_14d660, fn_125710, fn_14ed60, anchor_error_from, fn_154c88, fn_cf90, fn_5608, ….

## Look first

- ⚠ pool_state: writable expected, no check found
- ⚠ input_token_account: writable expected, no check found
- ⚠ output_token_account: writable expected, no check found
- ⚠ input_vault: writable expected, no check found
- ⚠ output_vault: writable expected, no check found
- ⚠ observation_state: writable expected, no check found
- ⚠ token_program: address expected, no check found
- ⚠ token_program_2022: address expected, no check found
- ⚠ memo_program: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | payer | expected · found | — | — | — | — |
| 1 | amm_config | — | — | found (+discriminator found) | — | — |
| 2 | pool_state | — | expected · NOT FOUND | found (+discriminator found) | — | — |
| 3 | input_token_account | — | expected · NOT FOUND | found (+discriminator found) | — | — |
| 4 | output_token_account | — | expected · NOT FOUND | found (+discriminator found) | — | — |
| 5 | input_vault | — | expected · NOT FOUND | — | — | — |
| 6 | output_vault | — | expected · NOT FOUND | — | — | — |
| 7 | observation_state | — | expected · NOT FOUND | — | — | — |
| 8 | token_program | — | — | — | — | = Tokenkeg… · expected · NOT FOUND |
| 9 | token_program_2022 | — | — | — | — | = TokenzQd… · expected · NOT FOUND |
| 10 | memo_program | — | — | — | — | = MemoSq4g… · expected · NOT FOUND |
| 11 | input_vault_mint | — | — | — | — | — |
| 12 | output_vault_mint | — | — | — | — | — |

## Constraints per account

- payer: signer found (bundle/swap_v2.ts:348 via try_accounts_17a30)
- amm_config: owner found (bundle/swap_v2.ts:351 via try_accounts_184d8); initialized found (bundle/swap_v2.ts:351 via try_accounts_184d8); discriminator found (bundle/swap_v2.ts:351 via try_accounts_184d8)
- pool_state: discriminator found (bundle/swap_v2.ts:392 via fn_11e0); owner found (bundle/swap_v2.ts:392 via fn_11e0); writable NOT FOUND
- input_token_account: owner found (bundle/swap_v2.ts:395 via try_accounts_1678); discriminator found (bundle/swap_v2.ts:395 via try_accounts_1678); initialized found (bundle/swap_v2.ts:395 via try_accounts_1678); key found (bundle/swap_v2.ts:978); writable NOT FOUND
- output_token_account: owner found (bundle/swap_v2.ts:437 via try_accounts_1678); discriminator found (bundle/swap_v2.ts:437 via try_accounts_1678); initialized found (bundle/swap_v2.ts:437 via try_accounts_1678); key found (bundle/swap_v2.ts:1015); writable NOT FOUND
- input_vault: key found (bundle/swap_v2.ts:1052); writable NOT FOUND
- output_vault: key found (bundle/swap_v2.ts:1087); writable NOT FOUND
- observation_state: writable NOT FOUND
- token_program: address NOT FOUND
- token_program_2022: address NOT FOUND
- memo_program: address NOT FOUND
- input_vault_mint: no checks found
- output_vault_mint: no checks found

## PDAs derived

- bundle/swap_v2.ts:1470 create_program_address(["pool", *(ld64(s458 + 8)), *(ld64(s430 + 0x20)), *(ld64(s458)), bb[..(ba != 0) << 1], az[..1]], program *s78)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): payer.key, amm_config.key, pool_state.key, observation_state.key, token_program.key, token_program_2022.key, memo_program.key, input_vault_mint.key, output_vault_mint.key, ix.amount, ix.other_amount_threshold, ix.sqrt_price_limit_x64, ix.is_base_input
- amm_config.data: validated (owner found @accounts_swap_v2:15, discriminator found @accounts_swap_v2:15, initialized found @accounts_swap_v2:15)
- pool_state.data: validated (owner found @accounts_swap_v2:56, discriminator found @accounts_swap_v2:56)
- input_token_account.key: validated (key found @fn_ba658:37)
- input_token_account.data: validated (owner found @accounts_swap_v2:59, discriminator found @accounts_swap_v2:59, initialized found @accounts_swap_v2:59)
- output_token_account.key: validated (key found @fn_ba658:74)
- output_token_account.data: validated (owner found @accounts_swap_v2:101, discriminator found @accounts_swap_v2:101, initialized found @accounts_swap_v2:101)
- input_vault.key: validated (key found @fn_ba658:111)
- output_vault.key: validated (key found @fn_ba658:146)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/swap_v2.ts:348 | found | payer | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/swap_v2.ts:351 | found | amm_config | owner, initialized, discriminator (via try_accounts_184d8 (count, owner, initialized, discriminator)) | `ld64(sd8) == 0` | return |
| 2 | bundle/swap_v2.ts:392 | found | pool_state | discriminator, owner (via fn_11e0 (count, discriminator, owner)) | `f != 2` | return |
| 3 | bundle/swap_v2.ts:395 | found | input_token_account | owner, discriminator, initialized (via try_accounts_1678 (count, owner, discriminator, initialized)) | `ld32(sd8 + 0xb0) == 2` | return |
| 4 | bundle/swap_v2.ts:437 | found | output_token_account | owner, discriminator, initialized (via try_accounts_1678 (count, owner, discriminator, initialized)) | `ld32(sd8 + 0xb0) == 2` | return |
| 5 | bundle/swap_v2.ts:505 | found |  | address | `ag == 2` | anchor::ConstraintAddress |
| 6 | bundle/swap_v2.ts:520 | PARTIAL |  | address | `aj == 2` | anchor::ConstraintAddress |
| 7 | bundle/swap_v2.ts:535 | PARTIAL |  | address | `am == 2` | anchor::ConstraintAddress |
| 8 | bundle/swap_v2.ts:550 | PARTIAL |  | address | `ap == 2` | anchor::ConstraintAddress |
| 9 | bundle/swap_v2.ts:565 | PARTIAL |  | address | `at == 2` | anchor::ConstraintAddress |
| 10 | bundle/swap_v2.ts:580 | PARTIAL |  | address | `aw == 2` | anchor::ConstraintAddress |
| 11 | bundle/swap_v2.ts:622 | PARTIAL |  | key, address | `!((memcmp(s1d8, s1b8, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 12 | bundle/swap_v2.ts:623 | PARTIAL |  | writable | `!(ld8(ld64(s410) + 0x29) != 0)` | anchor::ConstraintMut |
| 13 | bundle/swap_v2.ts:625 | PARTIAL |  | writable | `!(ld8(ld64(bi + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 14 | bundle/swap_v2.ts:628 | PARTIAL |  | key, token_owner | `(memcmp(bi + 0x48, sd8, 0x20) as u32) != 0` | anchor::ConstraintTokenOwner |
| 15 | bundle/swap_v2.ts:638 | PARTIAL |  | token_mint | `!((memcmp(ld64(s418) + 0x28, sd8, 0x20) as u32) == 0)` | anchor::ConstraintTokenMint |
| 16 | bundle/swap_v2.ts:639 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s428) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 17 | bundle/swap_v2.ts:643 | PARTIAL |  | token_mint | `(bm as u32) != 0` | anchor::ConstraintTokenMint |
| 18 | bundle/swap_v2.ts:651 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s420) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 19 | bundle/swap_v2.ts:652 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s430) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 20 | bundle/swap_v2.ts:653 | PARTIAL |  | writable | `!(ld8(ld64(s438) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 21 | bundle/swap_v2.ts:667 | PARTIAL |  | key, address | `!((memcmp(s198, s178, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 22 | bundle/swap_v2.ts:672 | PARTIAL |  | key, address | `!((memcmp(s158, s138, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 23 | bundle/swap_v2.ts:678 | PARTIAL |  | address | `l != 0` | anchor::ConstraintAddress |
| 24 | bundle/swap_v2.ts:948 | found | pool_state |  | `f != 2` | return |
| 25 | bundle/swap_v2.ts:978 | found | input_token_account | key | `(memcmp(g, c, 0x20) as u32) == 0 && (common_is_closed(h) == 0 && ld64(ld64(h + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 26 | bundle/swap_v2.ts:1015 | found | output_token_account | key | `(memcmp(i, c, 0x20) as u32) == 0 && (common_is_closed(j) == 0 && ld64(ld64(j + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 27 | bundle/swap_v2.ts:1052 | found | input_vault | key | `(memcmp(p, c, 0x20) as u32) == 0 && (common_is_closed(q) == 0 && ld64(ld64(q + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 28 | bundle/swap_v2.ts:1087 | found | output_vault | key | `(memcmp(t, c, 0x20) as u32) == 0 && (common_is_closed(u) == 0 && ld64(ld64(u + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 29 | ix/swap_router_base_in.ts:890 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 30 | ix/swap_router_base_in.ts:899 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 31 | shared.ts:1017 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 32 | shared.ts:1035 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 33 | shared.ts:1043 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 34 | bundle/swap_v2.ts:1368 | PARTIAL |  | key | `(memcmp(s150, ai + 0x81, 0x20) as u32) != 0` | return |
| 35 | bundle/swap_v2.ts:1379 | PARTIAL |  | key | `(memcmp(s150, ai + 0xa1, 0x20) as u32) != 0` | return |
| 36 | bundle/swap_v2.ts:1399 | found |  | custom | `!(ld64(s3b8 + 0x10) != 0)` | error::TooSmallInputOrOutputAmount |
| 37 | bundle/swap_v2.ts:1557 | PARTIAL |  | custom | `!(bv != 0 && bw != 0)` | error::TooSmallInputOrOutputAmount |
| 38 | ix/swap_router_base_in.ts:949 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 39 | bundle/swap_v2.ts:1215 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 40 | bundle/swap_v2.ts:1226 | found |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 41 | bundle/swap_v2.ts:3218 | found |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 42 | bundle/swap_v2.ts:3223 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 43 | bundle/swap_v2.ts:3234 | found |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 44 | bundle/swap_v2.ts:3360 | PARTIAL |  | owner | `h != 0` | anchor::AccountOwnedByWrongProgram |
| 45 | bundle/swap_v2.ts:3373 | PARTIAL | b? | writable | `b.is_writable == 0` | anchor::AccountNotMutable |
| 46 | bundle/swap_v2.ts:4657 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 47 | bundle/swap_v2.ts:4675 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 48 | bundle/swap_v2.ts:4683 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x998b8061db24963c /* account:TickArrayBitmapExtension */` | anchor::AccountDiscriminatorMismatch |
| 49 | shared.ts:726 | PARTIAL |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 50 | shared.ts:737 | PARTIAL |  | discriminator | `j != 0x998b8061db24963c /* account:TickArrayBitmapExtension */` | anchor::AccountDiscriminatorMismatch |
