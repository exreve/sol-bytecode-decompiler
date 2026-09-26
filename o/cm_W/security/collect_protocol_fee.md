# collect_protocol_fee

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_collect_protocol_fee (anchor); 43 functions reachable: ix_collect_protocol_fee, accounts_collect_protocol_fee, memcpy, fn_4d0a8, fn_c9aa0, anchor_error_from, fn_5608, fn_cf90, fn_14b198, fn_14ed60, fn_153158, fn_13e628, ….

## Look first

- ⚠ recipient_token_account_0: writable expected, no check found
- ⚠ recipient_token_account_1: writable expected, no check found
- ⚠ token_program: address expected, no check found
- ⚠ token_program_2022: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | owner | expected · found | — | — | — | — |
| 1 | pool_state | — | expected · PARTIAL | found (+discriminator found) | — | — |
| 2 | amm_config | — | — | found (+discriminator found) | — | — |
| 3 | token_vault_0 | — | expected · PARTIAL | found (+discriminator found) | — | — |
| 4 | token_vault_1 | — | expected · PARTIAL | found (+discriminator found) | — | — |
| 5 | vault_0_mint | — | — | — | — | — |
| 6 | vault_1_mint | — | — | — | — | — |
| 7 | recipient_token_account_0 | — | expected · NOT FOUND | — | — | — |
| 8 | recipient_token_account_1 | — | expected · NOT FOUND | — | — | — |
| 9 | token_program | — | — | — | — | = Tokenkeg… · expected · NOT FOUND |
| 10 | token_program_2022 | — | — | — | — | = TokenzQd… · expected · NOT FOUND |

## Constraints per account

- owner: signer found (bundle/collect_protocol_fee.ts:266 via try_accounts_17a30)
- pool_state: discriminator found (bundle/collect_protocol_fee.ts:270 via fn_11e0); owner found (bundle/collect_protocol_fee.ts:270 via fn_11e0); writable PARTIAL (bundle/collect_protocol_fee.ts:515)
- amm_config: owner found (bundle/collect_protocol_fee.ts:275 via try_accounts_184d8); initialized found (bundle/collect_protocol_fee.ts:275 via try_accounts_184d8); discriminator found (bundle/collect_protocol_fee.ts:275 via try_accounts_184d8)
- token_vault_0: owner found (bundle/collect_protocol_fee.ts:315 via try_accounts_1678); discriminator found (bundle/collect_protocol_fee.ts:315 via try_accounts_1678); initialized found (bundle/collect_protocol_fee.ts:315 via try_accounts_1678); writable PARTIAL (bundle/collect_protocol_fee.ts:532); key PARTIAL (bundle/collect_protocol_fee.ts:995)
- token_vault_1: owner found (bundle/collect_protocol_fee.ts:358 via try_accounts_1678); discriminator found (bundle/collect_protocol_fee.ts:358 via try_accounts_1678); initialized found (bundle/collect_protocol_fee.ts:358 via try_accounts_1678); writable PARTIAL (bundle/collect_protocol_fee.ts:548); key PARTIAL (bundle/collect_protocol_fee.ts:1026)
- vault_0_mint: no checks found
- vault_1_mint: no checks found
- recipient_token_account_0: key PARTIAL (bundle/collect_protocol_fee.ts:1057); writable NOT FOUND
- recipient_token_account_1: writable NOT FOUND
- token_program: address NOT FOUND
- token_program_2022: address NOT FOUND

## CPIs

- bundle/collect_protocol_fee.ts:1560 [conditional] TOKEN_2022_PROGRAM (constant).TransferChecked — amount: cf, ld8(ld64(s338 + 0x10) + 0x30)
- bundle/collect_protocol_fee.ts:1695 TOKEN_PROGRAM (constant).Transfer — amount: ba

## Dominance (checks on every path to the operation; across calls)

- bundle/collect_protocol_fee.ts:1560 TOKEN_TRANSFER: 15 dominating checks (signer owner; discriminator pool_state; owner pool_state; owner amm_config; initialized amm_config; discriminator amm_config; owner token_vault_0; discriminator token_vault_0; …)
- bundle/collect_protocol_fee.ts:1695 TOKEN_TRANSFER: 13 dominating checks (signer owner; discriminator pool_state; owner pool_state; owner amm_config; initialized amm_config; discriminator amm_config; owner token_vault_0; discriminator token_vault_0; …)
  - sources: amount ← ix.amount_0_requested (caller-controlled); amount ← ix.amount_1_requested (caller-controlled)

## Authority (who enables each value movement / authority change)

- bundle/collect_protocol_fee.ts:1560 TOKEN_TRANSFER: signer owner (found)
- bundle/collect_protocol_fee.ts:1695 TOKEN_TRANSFER: signer owner (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/collect_protocol_fee.ts:1560 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer owner (found)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_2022_PROGRAM
  - [found] relevant checks on every path — 15 dominating checks
- bundle/collect_protocol_fee.ts:1695 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer owner (found)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_PROGRAM
  - [PARTIAL] amount arithmetic checked — amount ← ix.amount_0_requested (caller-controlled); amount ← ix.amount_1_requested (caller-controlled)
  - [found] relevant checks on every path — 13 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/collect_protocol_fee.ts:1560 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked ⇐ signer owner (found)
- bundle/collect_protocol_fee.ts:1695 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer ⇐ signer owner (found)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/collect_protocol_fee.ts:1560 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked: ✗ `ld64(s18) != 0` · `u261 != -1` · `bp != -1` · `u243 != -1` · `bj != -1` · `u229 != -1` · `bf != -1` · `y != 2` · ✗ `w == 0` · `u40 != -1` · … 15 more
- bundle/collect_protocol_fee.ts:1695 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer: ✗ `ld64(s18) != 0` · `u81 != -1` · `ae != -1` · `u67 != -1` · `u63 != -1` · `u40 != -1` · `u36 != -1` · `u24 != -1` · `l != -1` · `g != 0` · … 11 more

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): owner.key, pool_state.key, amm_config.key, vault_0_mint.key, vault_1_mint.key, recipient_token_account_1.key, token_program.key, token_program_2022.key, ix.amount_0_requested, ix.amount_1_requested
- pool_state.data: validated (owner found @accounts_collect_protocol_fee:16, discriminator found @accounts_collect_protocol_fee:16)
- amm_config.data: validated (owner found @accounts_collect_protocol_fee:21, discriminator found @accounts_collect_protocol_fee:21, initialized found @accounts_collect_protocol_fee:21)
- token_vault_0.key: partially-validated (key partial @fn_c9aa0:38)
- token_vault_0.data: validated (owner found @accounts_collect_protocol_fee:61, discriminator found @accounts_collect_protocol_fee:61, initialized found @accounts_collect_protocol_fee:61)
- token_vault_1.key: partially-validated (key partial @fn_c9aa0:69)
- token_vault_1.data: validated (owner found @accounts_collect_protocol_fee:104, discriminator found @accounts_collect_protocol_fee:104, initialized found @accounts_collect_protocol_fee:104)
- recipient_token_account_0.key: partially-validated (key partial @fn_c9aa0:100)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/collect_protocol_fee.ts:266 | found | owner | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/collect_protocol_fee.ts:270 | found | pool_state | discriminator, owner (via fn_11e0 (count, discriminator, owner)) | `f != 2` | return |
| 2 | bundle/collect_protocol_fee.ts:275 | found | amm_config | owner, initialized, discriminator (via try_accounts_184d8 (count, owner, initialized, discriminator)) | `p == 0` | return |
| 3 | bundle/collect_protocol_fee.ts:315 | found | token_vault_0 | owner, discriminator, initialized (via try_accounts_1678 (count, owner, discriminator, initialized)) | `ld32(sc0 + 0x98) == 2` | return |
| 4 | bundle/collect_protocol_fee.ts:358 | found | token_vault_1 | owner, discriminator, initialized (via try_accounts_1678 (count, owner, discriminator, initialized)) | `ld32(sc0 + 0x98) == 2` | return |
| 5 | bundle/collect_protocol_fee.ts:423 | found |  | writable | `al == 2` | anchor::ConstraintMut |
| 6 | bundle/collect_protocol_fee.ts:438 | PARTIAL |  | writable | `ao == 2` | anchor::ConstraintMut |
| 7 | bundle/collect_protocol_fee.ts:453 | PARTIAL |  | writable | `ar == 2` | anchor::ConstraintMut |
| 8 | bundle/collect_protocol_fee.ts:468 | PARTIAL |  | writable | `av == 2` | anchor::ConstraintMut |
| 9 | bundle/collect_protocol_fee.ts:483 | PARTIAL |  | writable | `ay == 2` | anchor::ConstraintMut |
| 10 | bundle/collect_protocol_fee.ts:500 | PARTIAL |  | writable | `bc == 0` | anchor::ConstraintMut |
| 11 | bundle/collect_protocol_fee.ts:515 | PARTIAL | pool_state | writable | `pool_state.is_writable == 0` | anchor::ConstraintMut |
| 12 | bundle/collect_protocol_fee.ts:530 | PARTIAL |  | address | `!((bi as u32) == 0)` | anchor::ConstraintAddress |
| 13 | bundle/collect_protocol_fee.ts:532 | PARTIAL | token_vault_0 | writable | `token_vault_0.is_writable == 0` | anchor::ConstraintMut |
| 14 | bundle/collect_protocol_fee.ts:546 | PARTIAL |  | raw | `!((bs as u32) == 0)` | anchor::ConstraintRaw |
| 15 | bundle/collect_protocol_fee.ts:548 | PARTIAL | token_vault_1 | writable | `token_vault_1.is_writable == 0` | anchor::ConstraintMut |
| 16 | bundle/collect_protocol_fee.ts:563 | PARTIAL |  | raw | `!((bx as u32) == 0)` | anchor::ConstraintRaw |
| 17 | bundle/collect_protocol_fee.ts:567 | PARTIAL |  | key, address | `(memcmp(s158, s138, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 18 | bundle/collect_protocol_fee.ts:585 | PARTIAL |  | key, address | `!((memcmp(s118, sf8, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 19 | bundle/collect_protocol_fee.ts:586 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s4e8) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 20 | bundle/collect_protocol_fee.ts:587 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s4f0) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 21 | bundle/collect_protocol_fee.ts:963 | PARTIAL | pool_state |  | `f != 2` | return |
| 22 | bundle/collect_protocol_fee.ts:995 | PARTIAL | token_vault_0 | key | `(memcmp(g, c, 0x20) as u32) == 0 && (common_is_closed(h) == 0 && ld64(ld64(h + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 23 | bundle/collect_protocol_fee.ts:1026 | PARTIAL | token_vault_1 | key | `(memcmp(i, c, 0x20) as u32) == 0 && (common_is_closed(j) == 0 && ld64(ld64(j + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 24 | bundle/collect_protocol_fee.ts:1057 | PARTIAL | recipient_token_account_0 | key | `(memcmp(k, c, 0x20) as u32) == 0 && (common_is_closed(l) == 0 && ld64(ld64(l + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 25 | shared.ts:1017 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 26 | shared.ts:1035 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 27 | shared.ts:1043 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 28 | ix/swap_router_base_in.ts:890 | found |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 29 | ix/swap_router_base_in.ts:899 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 30 | bundle/collect_protocol_fee.ts:1326 | found |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 31 | bundle/collect_protocol_fee.ts:1331 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 32 | bundle/collect_protocol_fee.ts:1342 | found |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 33 | ix/swap_router_base_in.ts:949 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 34 | bundle/collect_protocol_fee.ts:1268 | PARTIAL |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 35 | bundle/collect_protocol_fee.ts:1279 | PARTIAL |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 36 | entrypoint.ts:4230 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 37 | entrypoint.ts:4332 | PARTIAL |  | key | `(memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
