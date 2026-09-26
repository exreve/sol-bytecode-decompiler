# swap

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_swap (anchor); 49 functions reachable: ix_swap, accounts_swap, memcpy, fn_3d6c0, fn_b7700, fn_14d660, fn_125710, fn_14ed60, anchor_error_from, fn_154c88, fn_cf90, fn_5608, ….

## Look first

- ⚠ pool_state: writable expected, no check found
- ⚠ input_token_account: writable expected, no check found
- ⚠ output_token_account: writable expected, no check found
- ⚠ input_vault: writable expected, no check found
- ⚠ output_vault: writable expected, no check found
- ⚠ observation_state: writable expected, no check found
- ⚠ token_program: address expected, no check found

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
| 9 | tick_array | — | expected · PARTIAL | — | — | — |

## Constraints per account

- payer: signer found (bundle/swap.ts:335 via try_accounts_17a30)
- amm_config: owner found (bundle/swap.ts:338 via try_accounts_184d8); initialized found (bundle/swap.ts:338 via try_accounts_184d8); discriminator found (bundle/swap.ts:338 via try_accounts_184d8)
- pool_state: discriminator found (bundle/swap.ts:379 via fn_11e0); owner found (bundle/swap.ts:379 via fn_11e0); writable NOT FOUND
- input_token_account: owner found (bundle/swap.ts:382 via try_accounts_182b0); discriminator found (bundle/swap.ts:382 via try_accounts_182b0); initialized found (bundle/swap.ts:382 via try_accounts_182b0); key found (bundle/swap.ts:928); writable NOT FOUND
- output_token_account: owner found (bundle/swap.ts:424 via try_accounts_182b0); discriminator found (bundle/swap.ts:424 via try_accounts_182b0); initialized found (bundle/swap.ts:424 via try_accounts_182b0); key found (bundle/swap.ts:964); writable NOT FOUND
- input_vault: key found (bundle/swap.ts:1000); writable NOT FOUND
- output_vault: key found (bundle/swap.ts:1034); writable NOT FOUND
- observation_state: writable NOT FOUND
- token_program: address NOT FOUND
- tick_array: writable PARTIAL (bundle/swap.ts:611)

## PDAs derived

- bundle/swap.ts:1451 create_program_address(["pool", *(ld64(s3d8 + 0x40)), *x, *(ld64(s458 + 0x20)), ax[..(aw != 0) << 1], av[..1]], program *s28)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): payer.key, amm_config.key, pool_state.key, observation_state.key, token_program.key, tick_array.key, ix.amount, ix.other_amount_threshold, ix.sqrt_price_limit_x64, ix.is_base_input
- amm_config.data: validated (owner found @accounts_swap:15, discriminator found @accounts_swap:15, initialized found @accounts_swap:15)
- pool_state.data: validated (owner found @accounts_swap:56, discriminator found @accounts_swap:56)
- input_token_account.key: validated (key found @fn_b7700:9)
- input_token_account.data: validated (owner found @accounts_swap:59, discriminator found @accounts_swap:59, initialized found @accounts_swap:59)
- output_token_account.key: validated (key found @fn_b7700:45)
- output_token_account.data: validated (owner found @accounts_swap:101, discriminator found @accounts_swap:101, initialized found @accounts_swap:101)
- input_vault.key: validated (key found @fn_b7700:81)
- output_vault.key: validated (key found @fn_b7700:115)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/swap.ts:335 | found | payer | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/swap.ts:338 | found | amm_config | owner, initialized, discriminator (via try_accounts_184d8 (count, owner, initialized, discriminator)) | `ld64(sb8) == 0` | return |
| 2 | bundle/swap.ts:379 | found | pool_state | discriminator, owner (via fn_11e0 (count, discriminator, owner)) | `f != 2` | return |
| 3 | bundle/swap.ts:382 | found | input_token_account | owner, discriminator, initialized (via try_accounts_182b0 (count, owner, discriminator, initialized)) | `ld32(sb8 + 0x90) == 2` | return |
| 4 | bundle/swap.ts:424 | found | output_token_account | owner, discriminator, initialized (via try_accounts_182b0 (count, owner, discriminator, initialized)) | `ld32(sb8 + 0x90) == 2` | return |
| 5 | bundle/swap.ts:492 | found |  | address | `ag == 2` | anchor::ConstraintAddress |
| 6 | bundle/swap.ts:507 | PARTIAL |  | address | `aj == 2` | anchor::ConstraintAddress |
| 7 | bundle/swap.ts:522 | PARTIAL |  | address | `am == 2` | anchor::ConstraintAddress |
| 8 | bundle/swap.ts:564 | PARTIAL |  | key, address | `!((memcmp(s138, s118, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 9 | bundle/swap.ts:565 | PARTIAL |  | writable | `!(ld8(ld64(s320) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 10 | bundle/swap.ts:567 | PARTIAL |  | writable | `!(ld8(ld64(az) + 0x29) != 0)` | anchor::ConstraintMut |
| 11 | bundle/swap.ts:570 | PARTIAL |  | key, token_owner | `(memcmp(az + 0x28, sb8, 0x20) as u32) != 0` | anchor::ConstraintTokenOwner |
| 12 | bundle/swap.ts:580 | PARTIAL |  | token_mint | `!((memcmp(ld64(s328) + 8, sb8, 0x20) as u32) == 0)` | anchor::ConstraintTokenMint |
| 13 | bundle/swap.ts:581 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s338)) + 0x29) != 0)` | anchor::ConstraintMut |
| 14 | bundle/swap.ts:585 | PARTIAL |  | token_mint | `(bd as u32) != 0` | anchor::ConstraintTokenMint |
| 15 | bundle/swap.ts:593 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s330)) + 0x29) != 0)` | anchor::ConstraintMut |
| 16 | bundle/swap.ts:594 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s340)) + 0x29) != 0)` | anchor::ConstraintMut |
| 17 | bundle/swap.ts:595 | PARTIAL |  | writable | `!(ld8(ld64(s348) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 18 | bundle/swap.ts:610 | PARTIAL |  | address | `!((bf as u32) == 0)` | anchor::ConstraintAddress |
| 19 | bundle/swap.ts:611 | PARTIAL | tick_array | writable | `tick_array.is_writable == 0` | anchor::ConstraintMut |
| 20 | bundle/swap.ts:627 | PARTIAL |  | raw | `l != 0` | anchor::ConstraintRaw |
| 21 | bundle/swap.ts:926 | found | pool_state |  | `f != 2` | return |
| 22 | bundle/swap.ts:928 | found | input_token_account | key | `(memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(j) == 0 && ld64` | Err(ProgramError::AccountBorrowFailed) |
| 23 | bundle/swap.ts:964 | found | output_token_account | key | `(memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(m) == 0 && ld64` | Err(ProgramError::AccountBorrowFailed) |
| 24 | bundle/swap.ts:1000 | found | input_vault | key | `(memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(p) == 0 && ld64` | Err(ProgramError::AccountBorrowFailed) |
| 25 | bundle/swap.ts:1034 | found | output_vault | key | `(memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(s) == 0 && ld64` | Err(ProgramError::AccountBorrowFailed) |
| 26 | ix/swap_router_base_in.ts:890 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 27 | ix/swap_router_base_in.ts:899 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 28 | shared.ts:1017 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 29 | shared.ts:1035 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 30 | shared.ts:1043 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 31 | bundle/swap.ts:1381 | found |  | custom | `ar == 0` | error::TooSmallInputOrOutputAmount |
| 32 | bundle/swap.ts:1537 | PARTIAL |  | custom | `!(bx != 0 && by != 0)` | error::TooSmallInputOrOutputAmount |
| 33 | ix/swap_router_base_in.ts:949 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 34 | bundle/swap.ts:1201 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 35 | bundle/swap.ts:1212 | found |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 36 | bundle/swap.ts:2868 | found |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 37 | bundle/swap.ts:2873 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 38 | bundle/swap.ts:2884 | found |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 39 | bundle/swap.ts:2921 | found |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 40 | bundle/swap.ts:2926 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 41 | bundle/swap.ts:2937 | found |  | discriminator | `j != 0x2a81f931cd559bc0 /* account:TickArrayState */` | anchor::AccountDiscriminatorMismatch |
| 42 | bundle/swap.ts:3041 | PARTIAL |  | owner | `h != 0` | anchor::AccountOwnedByWrongProgram |
| 43 | bundle/swap.ts:3054 | PARTIAL | b? | writable | `b.is_writable == 0` | anchor::AccountNotMutable |
| 44 | bundle/swap.ts:4615 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 45 | bundle/swap.ts:4633 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 46 | bundle/swap.ts:4641 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x998b8061db24963c /* account:TickArrayBitmapExtension */` | anchor::AccountDiscriminatorMismatch |
| 47 | bundle/swap.ts:4680 | PARTIAL |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 48 | bundle/swap.ts:4691 | PARTIAL |  | discriminator | `j != 0x998b8061db24963c /* account:TickArrayBitmapExtension */` | anchor::AccountDiscriminatorMismatch |
