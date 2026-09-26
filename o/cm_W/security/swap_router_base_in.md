# swap_router_base_in

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_swap_router_base_in (anchor); 51 functions reachable: ix_swap_router_base_in, accounts_swap_router_base_in, memcpy, fn_419a0, fn_bc4f8, anchor_error_from, fn_14b198, fn_14ed60, fn_153158, fn_13e628, fn_147a20, memset2, ….

## Look first

- ⚠ input_token_mint: writable expected, no check found
- ⚠ memo_program: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | payer | expected · found | — | — | — | — |
| 1 | input_token_account | — | expected · PARTIAL | found (+discriminator found) | — | — |
| 2 | input_token_mint | — | expected · NOT FOUND | found (+discriminator found) | — | — |
| 3 | token_program | — | — | — | found | = Tokenkeg… · expected · found |
| 4 | token_program_2022 | — | — | — | found | = TokenzQd… · expected · found |
| 5 | memo_program | — | — | — | — | = MemoSq4g… · expected · NOT FOUND |

## Constraints per account

- payer: signer found (bundle/swap_router_base_in.ts:278 via try_accounts_17a30)
- input_token_account: owner found (bundle/swap_router_base_in.ts:284 via try_accounts_1678); discriminator found (bundle/swap_router_base_in.ts:284 via try_accounts_1678); initialized found (bundle/swap_router_base_in.ts:284 via try_accounts_1678); writable PARTIAL (bundle/swap_router_base_in.ts:398); key found (bundle/swap_router_base_in.ts:1116)
- input_token_mint: owner found (bundle/swap_router_base_in.ts:337 via try_accounts_15c0); discriminator found (bundle/swap_router_base_in.ts:337 via try_accounts_15c0); initialized found (bundle/swap_router_base_in.ts:337 via try_accounts_15c0); writable NOT FOUND
- token_program: address found (bundle/swap_router_base_in.ts:376 via try_accounts_19190); executable found (bundle/swap_router_base_in.ts:376 via try_accounts_19190)
- token_program_2022: address found (bundle/swap_router_base_in.ts:381 via fn_18cf0); executable found (bundle/swap_router_base_in.ts:381 via fn_18cf0)
- memo_program: address NOT FOUND

## PDAs derived

- bundle/swap_router_base_in.ts:1720 create_program_address(["pool", *(ld64(s458 + 8)), *(ld64(s430 + 0x20)), *(ld64(s458)), bb[..(ba != 0) << 1], az[..1]], program *s78)

## Relations (equalities the checks establish)

- token_program.key == (constant address) (address, found, bundle/swap_router_base_in.ts:376)
- token_program_2022.key == (constant address) (address, found, bundle/swap_router_base_in.ts:381)
- input_token_account.owner == payer.key (token, PARTIAL, bundle/swap_router_base_in.ts:401)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): payer.key, input_token_mint.key, memo_program.key, ix.amount_in, ix.amount_out_minimum
- input_token_account.key: validated (key found @fn_bc4f8:5)
- input_token_account.data: validated (owner found @accounts_swap_router_base_in:16, discriminator found @accounts_swap_router_base_in:16, initialized found @accounts_swap_router_base_in:16)
- input_token_mint.data: validated (owner found @accounts_swap_router_base_in:69, discriminator found @accounts_swap_router_base_in:69, initialized found @accounts_swap_router_base_in:69)
- token_program.key: validated (address found @accounts_swap_router_base_in:108)
- token_program_2022.key: validated (address found @accounts_swap_router_base_in:113)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/swap_router_base_in.ts:278 | found | payer | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/swap_router_base_in.ts:284 | found | input_token_account | owner, discriminator, initialized (via try_accounts_1678 (count, owner, discriminator, initialized)) | `j == 2` | return |
| 2 | bundle/swap_router_base_in.ts:337 | found | input_token_mint | owner, discriminator, initialized (via try_accounts_15c0 (count, owner, discriminator, initialized)) | `q == 2` | return |
| 3 | bundle/swap_router_base_in.ts:376 | found | token_program | address, executable (via try_accounts_19190 (count, address, executable)) | `s != 2` | return |
| 4 | bundle/swap_router_base_in.ts:381 | found | token_program_2022 | address, executable (via fn_18cf0 (count, address, executable)) | `s != 2` | return |
| 5 | bundle/swap_router_base_in.ts:386 | found |  | writable | `aa == 2` | anchor::ConstraintMut |
| 6 | bundle/swap_router_base_in.ts:398 | PARTIAL | input_token_account | writable | `input_token_account.is_writable == 0` | anchor::ConstraintMut |
| 7 | bundle/swap_router_base_in.ts:401 | PARTIAL | input_token_account | key, token_owner | `(memcmp(s288, s1f8, 0x20) as u32) != 0` | anchor::ConstraintTokenOwner |
| 8 | bundle/swap_router_base_in.ts:412 | PARTIAL |  | token_mint | `!((memcmp(ld64(s398 + 0x30), s1f8, 0x20) as u32) == 0)` | anchor::ConstraintTokenMint |
| 9 | bundle/swap_router_base_in.ts:413 | PARTIAL |  | writable | `!(ld8(ld64(s398 + 0x18) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 10 | bundle/swap_router_base_in.ts:859 | PARTIAL |  | key | `(memcmp(ae + 0xc1, s98, 0x20) as u32) != 0` | anchor::RequireKeysEqViolated |
| 11 | bundle/swap_router_base_in.ts:894 | PARTIAL |  | key | `!((memcmp(bh, s2a0, 0x20) as u32) == 0)` | anchor::RequireKeysEqViolated |
| 12 | bundle/swap_router_base_in.ts:1116 | found | input_token_account | key | `(memcmp(b + 0x80, c, 0x20) as u32) == 0 && (common_is_closed(f) == 0 && ld64(ld64(f + 0x10) + 0x10) ` | Err(ProgramError::AccountBorrowFailed) |
| 13 | bundle/swap_router_base_in.ts:1285 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 14 | bundle/swap_router_base_in.ts:1294 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 15 | bundle/swap_router_base_in.ts:1347 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 16 | bundle/swap_router_base_in.ts:1365 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 17 | bundle/swap_router_base_in.ts:1373 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 18 | bundle/swap_router_base_in.ts:1399 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 19 | bundle/swap_router_base_in.ts:1417 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 20 | bundle/swap_router_base_in.ts:1425 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x84a5098135c5ae7a /* account:ObservationState */` | anchor::AccountDiscriminatorMismatch |
| 21 | bundle/swap_router_base_in.ts:1465 | PARTIAL |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 22 | bundle/swap_router_base_in.ts:1476 | PARTIAL |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 23 | bundle/swap_router_base_in.ts:1618 | PARTIAL |  | key | `(memcmp(s150, ai + 0x81, 0x20) as u32) != 0` | return |
| 24 | bundle/swap_router_base_in.ts:1629 | PARTIAL |  | key | `(memcmp(s150, ai + 0xa1, 0x20) as u32) != 0` | return |
| 25 | bundle/swap_router_base_in.ts:1649 | PARTIAL |  | custom | `!(ld64(s3b8 + 0x10) != 0)` | error::TooSmallInputOrOutputAmount |
| 26 | bundle/swap_router_base_in.ts:1807 | PARTIAL |  | custom | `!(bv != 0 && bw != 0)` | error::TooSmallInputOrOutputAmount |
| 27 | bundle/swap_router_base_in.ts:3159 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 28 | bundle/swap_router_base_in.ts:3492 | PARTIAL |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 29 | bundle/swap_router_base_in.ts:3497 | PARTIAL |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 30 | bundle/swap_router_base_in.ts:3508 | PARTIAL |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 31 | bundle/swap_router_base_in.ts:3625 | PARTIAL |  | owner | `h != 0` | anchor::AccountOwnedByWrongProgram |
| 32 | bundle/swap_router_base_in.ts:3638 | PARTIAL | b? | writable | `b.is_writable == 0` | anchor::AccountNotMutable |
| 33 | shared.ts:1069 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 34 | shared.ts:1087 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 35 | shared.ts:1095 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x998b8061db24963c /* account:TickArrayBitmapExtension */` | anchor::AccountDiscriminatorMismatch |
| 36 | shared.ts:726 | PARTIAL |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 37 | shared.ts:737 | PARTIAL |  | discriminator | `j != 0x998b8061db24963c /* account:TickArrayBitmapExtension */` | anchor::AccountDiscriminatorMismatch |
