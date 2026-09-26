# settle_limit_order

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_settle_limit_order (anchor); 55 functions reachable: ix_settle_limit_order, accounts_settle_limit_order, memcpy, fn_547d0, fn_ed178, anchor_error_from, fn_5608, fn_5bd8, fn_181f8, fn_14b198, fn_14ed60, fn_153158, ….

## Look first

- ⚠ limit_order: writable expected, no check found
- ⚠ output_token_account: writable expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | signer | expected · found | — | — | — | — |
| 1 | pool_state | — | — | found (+discriminator found) | — | — |
| 2 | tick_array | — | — | found (+discriminator found) | — | — |
| 3 | limit_order | — | expected · NOT FOUND | found (+discriminator found) | — | — |
| 4 | output_token_account | — | expected · NOT FOUND | found (+discriminator found) | — | — |
| 5 | output_vault | — | expected · PARTIAL | — | — | — |
| 6 | output_vault_mint | — | — | — | — | — |
| 7 | output_token_program | — | — | — | — | — |

## Constraints per account

- signer: signer found (bundle/settle_limit_order.ts:216 via try_accounts_17a30)
- pool_state: discriminator found (bundle/settle_limit_order.ts:220 via fn_11e0); owner found (bundle/settle_limit_order.ts:220 via fn_11e0)
- tick_array: discriminator found (bundle/settle_limit_order.ts:224 via fn_13d0); owner found (bundle/settle_limit_order.ts:224 via fn_13d0)
- limit_order: owner found (bundle/settle_limit_order.ts:230 via fn_181f8); initialized found (bundle/settle_limit_order.ts:230 via fn_181f8); discriminator found (bundle/settle_limit_order.ts:230 via fn_181f8); writable NOT FOUND
- output_token_account: owner found (bundle/settle_limit_order.ts:271 via try_accounts_1678); discriminator found (bundle/settle_limit_order.ts:271 via try_accounts_1678); initialized found (bundle/settle_limit_order.ts:271 via try_accounts_1678); key PARTIAL (bundle/settle_limit_order.ts:834); writable NOT FOUND
- output_vault: writable PARTIAL (bundle/settle_limit_order.ts:415)
- output_vault_mint: no checks found
- output_token_program: no checks found

## CPIs

- bundle/settle_limit_order.ts:775 TOKEN_2022_PROGRAM (constant).TransferChecked — amount: h, accounts.output_vault_mint.decimals

## Dominance (checks on every path to the operation; across calls)

- bundle/settle_limit_order.ts:775 TOKEN_TRANSFER: 18 dominating checks (signer signer; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)

## Authority (who enables each value movement / authority change)

- bundle/settle_limit_order.ts:775 TOKEN_TRANSFER: signer signer (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/settle_limit_order.ts:775 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer signer (found)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_2022_PROGRAM
  - [found] relevant checks on every path — 19 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/settle_limit_order.ts:775 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked ⇐ signer signer (found)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/settle_limit_order.ts:775 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked: ✗ `ld64(sa8) != 0` · `m == 2` · ✗ `m != 2` · `0x3c > n` · ✗ `m != 2` · ✗ `ld64(s2b0) != 0` · ✗ `ld64(s2b0) != 0` · ✗ `g == 2`

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): signer.key, pool_state.key, tick_array.key, limit_order.key, output_vault.key, output_vault_mint.key, output_token_program.key
- pool_state.data: validated (owner found @accounts_settle_limit_order:15, discriminator found @accounts_settle_limit_order:15)
- tick_array.data: validated (owner found @accounts_settle_limit_order:19, discriminator found @accounts_settle_limit_order:19)
- limit_order.data: validated (owner found @accounts_settle_limit_order:25, discriminator found @accounts_settle_limit_order:25, initialized found @accounts_settle_limit_order:25)
- output_token_account.key: partially-validated (key partial @fn_ed178:37)
- output_token_account.data: validated (owner found @accounts_settle_limit_order:66, discriminator found @accounts_settle_limit_order:66, initialized found @accounts_settle_limit_order:66)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/settle_limit_order.ts:216 | found | signer | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/settle_limit_order.ts:220 | found | pool_state | discriminator, owner (via fn_11e0 (count, discriminator, owner)) | `f != 2` | return |
| 2 | bundle/settle_limit_order.ts:224 | found | tick_array | discriminator, owner (via fn_13d0 (count, discriminator, owner)) | `f != 2` | return |
| 3 | bundle/settle_limit_order.ts:230 | found | limit_order | owner, initialized, discriminator (via fn_181f8 (count, owner, initialized, discriminator)) | `q == 2` | return |
| 4 | bundle/settle_limit_order.ts:271 | found | output_token_account | owner, discriminator, initialized (via try_accounts_1678 (count, owner, discriminator, initialized)) | `ld32(sc8 + 0xa0) == 2` | return |
| 5 | bundle/settle_limit_order.ts:340 | found |  | raw | `ai == 2` | anchor::ConstraintRaw |
| 6 | bundle/settle_limit_order.ts:355 | PARTIAL |  | raw | `am == 2` | anchor::ConstraintRaw |
| 7 | bundle/settle_limit_order.ts:370 | PARTIAL |  | raw | `ao == 0` | anchor::ConstraintRaw |
| 8 | bundle/settle_limit_order.ts:396 | PARTIAL |  | raw | `!((aq as u32) == 0)` | anchor::ConstraintRaw |
| 9 | bundle/settle_limit_order.ts:397 | PARTIAL |  | writable | `!(ld8(ld64(s4c8) + 0x29) != 0)` | anchor::ConstraintMut |
| 10 | bundle/settle_limit_order.ts:399 | PARTIAL |  | key, raw | `!((memcmp(s300, sd8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 11 | bundle/settle_limit_order.ts:400 | PARTIAL |  | writable | `!(ld8(ld64((x & -8) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 12 | bundle/settle_limit_order.ts:402 | PARTIAL |  | token_owner | `(memcmp((x & -8) + 0x48, sd8, 0x20) as u32) != 0` | anchor::ConstraintTokenOwner |
| 13 | bundle/settle_limit_order.ts:413 | PARTIAL |  | token_mint | `!((at as u32) == 0)` | anchor::ConstraintTokenMint |
| 14 | bundle/settle_limit_order.ts:415 | PARTIAL | output_vault | writable | `output_vault.is_writable == 0` | anchor::ConstraintMut |
| 15 | bundle/settle_limit_order.ts:447 | PARTIAL |  | raw | `!((bb as u32) == 0)` | anchor::ConstraintRaw |
| 16 | bundle/settle_limit_order.ts:453 | PARTIAL |  | key, address | `(memcmp(s158, s138, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 17 | bundle/settle_limit_order.ts:473 | PARTIAL |  | key, address | `!((memcmp(s118, sf8, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 18 | bundle/settle_limit_order.ts:803 | PARTIAL | limit_order |  | `f != 2` | return |
| 19 | bundle/settle_limit_order.ts:834 | PARTIAL | output_token_account | key | `(memcmp(g, c, 0x20) as u32) == 0 && (common_is_closed(h) == 0 && ld64(ld64(h + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 20 | shared.ts:1017 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 21 | shared.ts:1035 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 22 | shared.ts:1043 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 23 | entrypoint.ts:88 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 24 | entrypoint.ts:106 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 25 | entrypoint.ts:114 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x2a81f931cd559bc0 /* account:TickArrayState */` | anchor::AccountDiscriminatorMismatch |
| 26 | bundle/settle_limit_order.ts:933 | found |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 27 | bundle/settle_limit_order.ts:1093 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 28 | bundle/settle_limit_order.ts:1104 | found |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 29 | bundle/settle_limit_order.ts:1014 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 30 | bundle/settle_limit_order.ts:1025 | found |  | discriminator | `j != 0x2a81f931cd559bc0 /* account:TickArrayState */` | anchor::AccountDiscriminatorMismatch |
| 31 | bundle/settle_limit_order.ts:1138 | found |  | custom | `(g as u32) != (b as u32)` | error::InvalidTickArray |
| 32 | bundle/settle_limit_order.ts:1258 | found |  | custom | `(i != 0 ? 0xffffffffffffffff : g + 2) > h` | error::InvalidOrderPhase |
| 33 | entrypoint.ts:4230 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 34 | bundle/settle_limit_order.ts:1584 | found |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 35 | bundle/settle_limit_order.ts:1593 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 36 | bundle/settle_limit_order.ts:2940 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 37 | bundle/settle_limit_order.ts:3046 | found |  | custom | `!(0xd89e9 > ((b + 0x6c4f4) as u32))` | error::TickUpperOverflow |
