# decrease_limit_order

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_decrease_limit_order (anchor); 75 functions reachable: ix_decrease_limit_order, accounts_decrease_limit_order, memcpy, fn_530f0, fn_ea788, anchor_error_from, fn_5608, fn_5bd8, fn_181f8, fn_14b198, fn_14ed60, fn_153158, ….

## Look first

- ⚠ limit_order: writable expected, no check found
- ⚠ input_token_account: writable expected, no check found
- ⚠ output_token_account: writable expected, no check found
- ⚠ token_program: address expected, no check found
- ⚠ token_program_2022: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | owner | expected · found | — | — | — | — |
| 1 | pool_state | — | expected · runtime | found (+discriminator found) | — | — |
| 2 | tick_array | — | expected · PARTIAL | found (+discriminator found) | — | — |
| 3 | limit_order | — | expected · NOT FOUND | found (+discriminator found) | — | — |
| 4 | input_token_account | — | expected · NOT FOUND | found (+discriminator found) | — | — |
| 5 | output_token_account | — | expected · NOT FOUND | — | — | — |
| 6 | input_vault | — | expected · PARTIAL | — | — | — |
| 7 | output_vault | — | expected · PARTIAL | — | — | — |
| 8 | input_vault_mint | — | — | — | — | — |
| 9 | output_vault_mint | — | — | — | — | — |
| 10 | token_program | — | — | — | — | = Tokenkeg… · expected · NOT FOUND |
| 11 | token_program_2022 | — | — | — | — | = TokenzQd… · expected · NOT FOUND |

## Constraints per account

- owner: signer found (bundle/decrease_limit_order.ts:280 via try_accounts_17a30)
- pool_state: discriminator found (bundle/decrease_limit_order.ts:284 via fn_11e0); owner found (bundle/decrease_limit_order.ts:284 via fn_11e0); writable runtime (bundle/decrease_limit_order.ts:3582) — written: the runtime rejects changes to a read-only account
- tick_array: discriminator found (bundle/decrease_limit_order.ts:288 via fn_13d0); owner found (bundle/decrease_limit_order.ts:288 via fn_13d0); writable PARTIAL (bundle/decrease_limit_order.ts:498)
- limit_order: owner found (bundle/decrease_limit_order.ts:294 via fn_181f8); initialized found (bundle/decrease_limit_order.ts:294 via fn_181f8); discriminator found (bundle/decrease_limit_order.ts:294 via fn_181f8); writable NOT FOUND
- input_token_account: owner found (bundle/decrease_limit_order.ts:337 via try_accounts_1678); discriminator found (bundle/decrease_limit_order.ts:337 via try_accounts_1678); initialized found (bundle/decrease_limit_order.ts:337 via try_accounts_1678); key PARTIAL (bundle/decrease_limit_order.ts:1310); writable NOT FOUND
- output_token_account: key PARTIAL (bundle/decrease_limit_order.ts:1347); writable NOT FOUND
- input_vault: writable PARTIAL (bundle/decrease_limit_order.ts:552)
- output_vault: writable PARTIAL (bundle/decrease_limit_order.ts:586)
- input_vault_mint: no checks found
- output_vault_mint: no checks found
- token_program: address NOT FOUND
- token_program_2022: address NOT FOUND

## CPIs

- bundle/decrease_limit_order.ts:2861 [conditional] TOKEN_2022_PROGRAM (constant).TransferChecked — amount: cf, ld8(ld64(s338 + 0x10) + 0x30)
- bundle/decrease_limit_order.ts:2996 TOKEN_PROGRAM (constant).Transfer — amount: ba

## PDAs derived

- bundle/decrease_limit_order.ts:3369 create_program_address(["pool", *(b + 1), *(b + 0x41), *(b + 0x61), (u != 0 ? b + 0x17f : 1)[..(u != 0) << 1], b[..1]], program *s28)
- bundle/decrease_limit_order.ts:3375 find_program_address(["pool_tick_array_bitmap_extension", *s48], program *sc8)

## Operations (account writes)

- bundle/decrease_limit_order.ts:3582 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s148 + 0x38) ^ ld64(s268 + 0x38) [conditional]
- bundle/decrease_limit_order.ts:3583 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s2a8) [conditional]
- bundle/decrease_limit_order.ts:3584 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s2a0) [conditional]
- bundle/decrease_limit_order.ts:3585 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s290) [conditional]
- bundle/decrease_limit_order.ts:3586 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s298) [conditional]
- bundle/decrease_limit_order.ts:3587 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ak ^ al [conditional]
- bundle/decrease_limit_order.ts:3588 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ai ^ aj [conditional]
- bundle/decrease_limit_order.ts:3589 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ag ^ ah [conditional]
- bundle/decrease_limit_order.ts:3590 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ae ^ af [conditional]
- bundle/decrease_limit_order.ts:3591 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = am [conditional]
- bundle/decrease_limit_order.ts:3592 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ac ^ ad [conditional]
- bundle/decrease_limit_order.ts:3593 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = aa ^ ab [conditional]
- bundle/decrease_limit_order.ts:3594 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s278) [conditional]
- bundle/decrease_limit_order.ts:3595 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s280) [conditional]
- bundle/decrease_limit_order.ts:3596 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s270) [conditional]
- bundle/decrease_limit_order.ts:3598 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = an ^ v [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/decrease_limit_order.ts:3582 ACCOUNT_DATA_WRITE: 24 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/decrease_limit_order.ts:3583 ACCOUNT_DATA_WRITE: 24 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/decrease_limit_order.ts:3584 ACCOUNT_DATA_WRITE: 24 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/decrease_limit_order.ts:3585 ACCOUNT_DATA_WRITE: 24 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/decrease_limit_order.ts:3586 ACCOUNT_DATA_WRITE: 24 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/decrease_limit_order.ts:3587 ACCOUNT_DATA_WRITE: 24 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/decrease_limit_order.ts:3588 ACCOUNT_DATA_WRITE: 24 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/decrease_limit_order.ts:3589 ACCOUNT_DATA_WRITE: 24 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/decrease_limit_order.ts:3590 ACCOUNT_DATA_WRITE: 24 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/decrease_limit_order.ts:3591 ACCOUNT_DATA_WRITE: 24 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/decrease_limit_order.ts:3592 ACCOUNT_DATA_WRITE: 24 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/decrease_limit_order.ts:3593 ACCOUNT_DATA_WRITE: 24 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/decrease_limit_order.ts:3594 ACCOUNT_DATA_WRITE: 24 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/decrease_limit_order.ts:3595 ACCOUNT_DATA_WRITE: 24 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/decrease_limit_order.ts:3596 ACCOUNT_DATA_WRITE: 24 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/decrease_limit_order.ts:3598 ACCOUNT_DATA_WRITE: 24 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/decrease_limit_order.ts:2861 TOKEN_TRANSFER: 21 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/decrease_limit_order.ts:2996 TOKEN_TRANSFER: 21 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
  - sources: amount ← ix.amount (caller-controlled)

## Authority (who enables each value movement / authority change)

- bundle/decrease_limit_order.ts:2861 TOKEN_TRANSFER: signer owner (found)
- bundle/decrease_limit_order.ts:2996 TOKEN_TRANSFER: signer owner (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/decrease_limit_order.ts:3582 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer owner accounts_decrease_limit_order:12; custom  fn_530f0:7; custom  fn_71a20:17
- bundle/decrease_limit_order.ts:3583 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer owner accounts_decrease_limit_order:12; custom  fn_530f0:7; custom  fn_71a20:17
- bundle/decrease_limit_order.ts:3584 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer owner accounts_decrease_limit_order:12; custom  fn_530f0:7; custom  fn_71a20:17
- bundle/decrease_limit_order.ts:3585 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer owner accounts_decrease_limit_order:12; custom  fn_530f0:7; custom  fn_71a20:17
- bundle/decrease_limit_order.ts:3586 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer owner accounts_decrease_limit_order:12; custom  fn_530f0:7; custom  fn_71a20:17
- bundle/decrease_limit_order.ts:3587 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer owner accounts_decrease_limit_order:12; custom  fn_530f0:7; custom  fn_71a20:17
- bundle/decrease_limit_order.ts:2861 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer owner (found)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_2022_PROGRAM
  - [found] relevant checks on every path — 22 dominating checks
- bundle/decrease_limit_order.ts:2996 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer owner (found)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_PROGRAM
  - [PARTIAL] amount arithmetic checked — amount ← ix.amount (caller-controlled)
  - [found] relevant checks on every path — 22 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/decrease_limit_order.ts:2861 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked ⇐ signer owner (found)
- bundle/decrease_limit_order.ts:2996 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer ⇐ signer owner (found)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/decrease_limit_order.ts:3582 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ci` · ✗ `ld64(s130) != 0` · ✗ `(bu as u8) != 0` · ✗ `ld64(q + 0x84) != 0` · ✗ `ld64(q + 0x7c) != 0` · ✗ `(ld64(q + 0x14) \| ld64(q + 0x1c)) != 0` · `(ld64(s1f8) & 1) != 0` · … 10 more
- bundle/decrease_limit_order.ts:3583 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ci` · ✗ `ld64(s130) != 0` · ✗ `(bu as u8) != 0` · ✗ `ld64(q + 0x84) != 0` · ✗ `ld64(q + 0x7c) != 0` · ✗ `(ld64(q + 0x14) \| ld64(q + 0x1c)) != 0` · `(ld64(s1f8) & 1) != 0` · … 10 more
- bundle/decrease_limit_order.ts:3584 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ci` · ✗ `ld64(s130) != 0` · ✗ `(bu as u8) != 0` · ✗ `ld64(q + 0x84) != 0` · ✗ `ld64(q + 0x7c) != 0` · ✗ `(ld64(q + 0x14) \| ld64(q + 0x1c)) != 0` · `(ld64(s1f8) & 1) != 0` · … 10 more
- bundle/decrease_limit_order.ts:3585 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ci` · ✗ `ld64(s130) != 0` · ✗ `(bu as u8) != 0` · ✗ `ld64(q + 0x84) != 0` · ✗ `ld64(q + 0x7c) != 0` · ✗ `(ld64(q + 0x14) \| ld64(q + 0x1c)) != 0` · `(ld64(s1f8) & 1) != 0` · … 10 more
- bundle/decrease_limit_order.ts:3586 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ci` · ✗ `ld64(s130) != 0` · ✗ `(bu as u8) != 0` · ✗ `ld64(q + 0x84) != 0` · ✗ `ld64(q + 0x7c) != 0` · ✗ `(ld64(q + 0x14) \| ld64(q + 0x1c)) != 0` · `(ld64(s1f8) & 1) != 0` · … 10 more
- bundle/decrease_limit_order.ts:3587 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ci` · ✗ `ld64(s130) != 0` · ✗ `(bu as u8) != 0` · ✗ `ld64(q + 0x84) != 0` · ✗ `ld64(q + 0x7c) != 0` · ✗ `(ld64(q + 0x14) \| ld64(q + 0x1c)) != 0` · `(ld64(s1f8) & 1) != 0` · … 10 more
- bundle/decrease_limit_order.ts:3588 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ci` · ✗ `ld64(s130) != 0` · ✗ `(bu as u8) != 0` · ✗ `ld64(q + 0x84) != 0` · ✗ `ld64(q + 0x7c) != 0` · ✗ `(ld64(q + 0x14) \| ld64(q + 0x1c)) != 0` · `(ld64(s1f8) & 1) != 0` · … 10 more
- bundle/decrease_limit_order.ts:3589 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ci` · ✗ `ld64(s130) != 0` · ✗ `(bu as u8) != 0` · ✗ `ld64(q + 0x84) != 0` · ✗ `ld64(q + 0x7c) != 0` · ✗ `(ld64(q + 0x14) \| ld64(q + 0x1c)) != 0` · `(ld64(s1f8) & 1) != 0` · … 10 more
- bundle/decrease_limit_order.ts:3590 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ci` · ✗ `ld64(s130) != 0` · ✗ `(bu as u8) != 0` · ✗ `ld64(q + 0x84) != 0` · ✗ `ld64(q + 0x7c) != 0` · ✗ `(ld64(q + 0x14) \| ld64(q + 0x1c)) != 0` · `(ld64(s1f8) & 1) != 0` · … 10 more
- bundle/decrease_limit_order.ts:3591 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ci` · ✗ `ld64(s130) != 0` · ✗ `(bu as u8) != 0` · ✗ `ld64(q + 0x84) != 0` · ✗ `ld64(q + 0x7c) != 0` · ✗ `(ld64(q + 0x14) \| ld64(q + 0x1c)) != 0` · `(ld64(s1f8) & 1) != 0` · … 10 more
- bundle/decrease_limit_order.ts:3592 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ci` · ✗ `ld64(s130) != 0` · ✗ `(bu as u8) != 0` · ✗ `ld64(q + 0x84) != 0` · ✗ `ld64(q + 0x7c) != 0` · ✗ `(ld64(q + 0x14) \| ld64(q + 0x1c)) != 0` · `(ld64(s1f8) & 1) != 0` · … 10 more
- bundle/decrease_limit_order.ts:3593 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ci` · ✗ `ld64(s130) != 0` · ✗ `(bu as u8) != 0` · ✗ `ld64(q + 0x84) != 0` · ✗ `ld64(q + 0x7c) != 0` · ✗ `(ld64(q + 0x14) \| ld64(q + 0x1c)) != 0` · `(ld64(s1f8) & 1) != 0` · … 10 more
- bundle/decrease_limit_order.ts:3594 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ci` · ✗ `ld64(s130) != 0` · ✗ `(bu as u8) != 0` · ✗ `ld64(q + 0x84) != 0` · ✗ `ld64(q + 0x7c) != 0` · ✗ `(ld64(q + 0x14) \| ld64(q + 0x1c)) != 0` · `(ld64(s1f8) & 1) != 0` · … 10 more
- bundle/decrease_limit_order.ts:3595 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ci` · ✗ `ld64(s130) != 0` · ✗ `(bu as u8) != 0` · ✗ `ld64(q + 0x84) != 0` · ✗ `ld64(q + 0x7c) != 0` · ✗ `(ld64(q + 0x14) \| ld64(q + 0x1c)) != 0` · `(ld64(s1f8) & 1) != 0` · … 10 more
- bundle/decrease_limit_order.ts:3596 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ci` · ✗ `ld64(s130) != 0` · ✗ `(bu as u8) != 0` · ✗ `ld64(q + 0x84) != 0` · ✗ `ld64(q + 0x7c) != 0` · ✗ `(ld64(q + 0x14) \| ld64(q + 0x1c)) != 0` · `(ld64(s1f8) & 1) != 0` · … 10 more
- bundle/decrease_limit_order.ts:3598 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ci` · ✗ `ld64(s130) != 0` · ✗ `(bu as u8) != 0` · ✗ `ld64(q + 0x84) != 0` · ✗ `ld64(q + 0x7c) != 0` · ✗ `(ld64(q + 0x14) \| ld64(q + 0x1c)) != 0` · `(ld64(s1f8) & 1) != 0` · … 10 more

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): owner.key, pool_state.key, tick_array.key, limit_order.key, input_vault.key, output_vault.key, input_vault_mint.key, output_vault_mint.key, token_program.key, token_program_2022.key, ix.amount, ix.amount_min
- pool_state.data: validated (owner found @accounts_decrease_limit_order:16, discriminator found @accounts_decrease_limit_order:16)
- tick_array.data: validated (owner found @accounts_decrease_limit_order:20, discriminator found @accounts_decrease_limit_order:20)
- limit_order.data: validated (owner found @accounts_decrease_limit_order:26, discriminator found @accounts_decrease_limit_order:26, initialized found @accounts_decrease_limit_order:26)
- input_token_account.key: partially-validated (key partial @fn_ea788:16)
- input_token_account.data: validated (owner found @accounts_decrease_limit_order:69, discriminator found @accounts_decrease_limit_order:69, initialized found @accounts_decrease_limit_order:69)
- output_token_account.key: partially-validated (key partial @fn_ea788:53)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/decrease_limit_order.ts:280 | found | owner | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/decrease_limit_order.ts:284 | found | pool_state | discriminator, owner (via fn_11e0 (count, discriminator, owner)) | `f != 2` | return |
| 2 | bundle/decrease_limit_order.ts:288 | found | tick_array | discriminator, owner (via fn_13d0 (count, discriminator, owner)) | `f != 2` | return |
| 3 | bundle/decrease_limit_order.ts:294 | found | limit_order | owner, initialized, discriminator (via fn_181f8 (count, owner, initialized, discriminator)) | `q == 2` | return |
| 4 | bundle/decrease_limit_order.ts:337 | found | input_token_account | owner, discriminator, initialized (via try_accounts_1678 (count, owner, discriminator, initialized)) | `ld32(sc8 + 0xa0) == 2` | return |
| 5 | bundle/decrease_limit_order.ts:408 | found |  | writable | `aj == 2` | anchor::ConstraintMut |
| 6 | bundle/decrease_limit_order.ts:423 | PARTIAL |  | writable | `an == 2` | anchor::ConstraintMut |
| 7 | bundle/decrease_limit_order.ts:438 | PARTIAL |  | writable | `aq == 2` | anchor::ConstraintMut |
| 8 | bundle/decrease_limit_order.ts:453 | PARTIAL |  | writable | `au == 2` | anchor::ConstraintMut |
| 9 | bundle/decrease_limit_order.ts:468 | PARTIAL |  | writable | `ax == 2` | anchor::ConstraintMut |
| 10 | bundle/decrease_limit_order.ts:497 | PARTIAL | pool_state | writable | `pool_state.is_writable == 0` | anchor::ConstraintMut |
| 11 | bundle/decrease_limit_order.ts:498 | PARTIAL | tick_array | writable | `tick_array.is_writable == 0` | anchor::ConstraintMut |
| 12 | bundle/decrease_limit_order.ts:513 | PARTIAL |  | raw | `!((bg as u32) == 0)` | anchor::ConstraintRaw |
| 13 | bundle/decrease_limit_order.ts:514 | PARTIAL |  | writable | `!(ld8(ld64(s5a0) + 0x29) != 0)` | anchor::ConstraintMut |
| 14 | bundle/decrease_limit_order.ts:517 | PARTIAL |  | raw | `!((bh as u32) == 0)` | anchor::ConstraintRaw |
| 15 | bundle/decrease_limit_order.ts:522 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s5c0) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 16 | bundle/decrease_limit_order.ts:524 | PARTIAL |  | token_owner | `(memcmp(ld64(s5c0) + 0x48, sd8, 0x20) as u32) != 0` | anchor::ConstraintTokenOwner |
| 17 | bundle/decrease_limit_order.ts:535 | PARTIAL |  | token_mint | `!((memcmp(ld64(s5c0) + 0x28, sd8, 0x20) as u32) == 0)` | anchor::ConstraintTokenMint |
| 18 | bundle/decrease_limit_order.ts:536 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s5b8) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 19 | bundle/decrease_limit_order.ts:538 | PARTIAL |  | token_owner | `(memcmp(ld64(s5b8) + 0x48, sd8, 0x20) as u32) != 0` | anchor::ConstraintTokenOwner |
| 20 | bundle/decrease_limit_order.ts:550 | PARTIAL |  | token_mint | `!((br as u32) == 0)` | anchor::ConstraintTokenMint |
| 21 | bundle/decrease_limit_order.ts:552 | PARTIAL | input_vault | writable | `input_vault.is_writable == 0` | anchor::ConstraintMut |
| 22 | bundle/decrease_limit_order.ts:584 | PARTIAL |  | raw | `!((bz as u32) == 0)` | anchor::ConstraintRaw |
| 23 | bundle/decrease_limit_order.ts:586 | PARTIAL | output_vault | writable | `output_vault.is_writable == 0` | anchor::ConstraintMut |
| 24 | bundle/decrease_limit_order.ts:618 | PARTIAL |  | raw | `!((ce as u32) == 0)` | anchor::ConstraintRaw |
| 25 | bundle/decrease_limit_order.ts:623 | PARTIAL |  | key, address | `(memcmp(s158, s138, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 26 | bundle/decrease_limit_order.ts:641 | PARTIAL |  | key, address | `!((memcmp(s118, sf8, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 27 | bundle/decrease_limit_order.ts:888 | found |  | custom | `c == 0` | error::ZeroAmountSpecified |
| 28 | bundle/decrease_limit_order.ts:1205 | PARTIAL |  | custom | `ld64(s1d8 + 8) > br` | error::PriceSlippageCheck |
| 29 | bundle/decrease_limit_order.ts:1301 | PARTIAL | pool_state |  | `f != 2` | return |
| 30 | bundle/decrease_limit_order.ts:1304 | PARTIAL | tick_array |  | `f != 2` | return |
| 31 | bundle/decrease_limit_order.ts:1307 | PARTIAL | limit_order |  | `f != 2` | return |
| 32 | bundle/decrease_limit_order.ts:1310 | PARTIAL | input_token_account | key | `(memcmp(o, c, 0x20) as u32) == 0 && (common_is_closed(p) == 0 && ld64(ld64(p + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 33 | bundle/decrease_limit_order.ts:1347 | PARTIAL | output_token_account | key | `(memcmp(s, c, 0x20) as u32) == 0 && (common_is_closed(t) == 0 && ld64(ld64(t + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 34 | bundle/decrease_limit_order.ts:1384 | PARTIAL |  | key | `(memcmp(w, c, 0x20) as u32) == 0 && (common_is_closed(x) == 0 && ld64(ld64(x + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 35 | shared.ts:1017 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 36 | shared.ts:1035 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 37 | shared.ts:1043 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 38 | entrypoint.ts:88 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 39 | entrypoint.ts:106 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 40 | entrypoint.ts:114 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x2a81f931cd559bc0 /* account:TickArrayState */` | anchor::AccountDiscriminatorMismatch |
| 41 | bundle/decrease_limit_order.ts:1527 | found |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 42 | bundle/decrease_limit_order.ts:1656 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 43 | bundle/decrease_limit_order.ts:1667 | found |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 44 | bundle/decrease_limit_order.ts:2416 | found |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 45 | bundle/decrease_limit_order.ts:2421 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 46 | bundle/decrease_limit_order.ts:2432 | found |  | discriminator | `j != 0x2a81f931cd559bc0 /* account:TickArrayState */` | anchor::AccountDiscriminatorMismatch |
| 47 | bundle/decrease_limit_order.ts:2481 | found |  | custom | `(g as u32) != (b as u32)` | error::InvalidTickArray |
| 48 | bundle/decrease_limit_order.ts:2573 | PARTIAL |  | custom | `(i != -1 ? i + 1 : 0xffffffffffffffff) != j` | error::OrderAlreadyFilled |
| 49 | bundle/decrease_limit_order.ts:3196 | PARTIAL |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 50 | bundle/decrease_limit_order.ts:3201 | PARTIAL |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 51 | bundle/decrease_limit_order.ts:3212 | PARTIAL |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 52 | bundle/decrease_limit_order.ts:3378 | PARTIAL |  | key | `(memcmp(s1a8, se8, 0x20) as u32) != 0` | anchor::RequireKeysEqViolated |
| 53 | bundle/decrease_limit_order.ts:3440 | PARTIAL |  | writable | `!(ld8(v + 0x29) != 0)` | anchor::AccountNotMutable |
| 54 | bundle/decrease_limit_order.ts:3851 | found |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 55 | bundle/decrease_limit_order.ts:3860 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 56 | bundle/decrease_limit_order.ts:4085 | found |  | custom | `(i != 0 ? 0xffffffffffffffff : g + 2) > h` | error::InvalidOrderPhase |
| 57 | bundle/decrease_limit_order.ts:4160 | found |  | custom | `b == 0` | error::ZeroAmountSpecified |
| 58 | bundle/decrease_limit_order.ts:4463 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 59 | bundle/decrease_limit_order.ts:4481 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 60 | bundle/decrease_limit_order.ts:4489 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x998b8061db24963c /* account:TickArrayBitmapExtension */` | anchor::AccountDiscriminatorMismatch |
| 61 | entrypoint.ts:4230 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 62 | entrypoint.ts:4332 | PARTIAL |  | key | `(memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 63 | bundle/decrease_limit_order.ts:4687 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 64 | shared.ts:13043 | found |  | custom | `!(0xd89e9 > ((b + 0x6c4f4) as u32))` | error::TickUpperOverflow |
