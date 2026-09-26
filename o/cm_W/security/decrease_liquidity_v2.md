# decrease_liquidity_v2

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_decrease_liquidity_v2 (anchor); 94 functions reachable: ix_decrease_liquidity_v2, accounts_decrease_liquidity_v2, memcpy, fn_34050, fn_b4c78, anchor_error_from, fn_14b198, fn_14ed60, fn_153158, fn_13e628, fn_147a20, fn_d358, ….

## Look first

- ⚠ personal_position: writable expected, no check found
- ⚠ tick_array_lower: writable expected, no check found
- ⚠ tick_array_upper: writable expected, no check found
- ⚠ recipient_token_account_0: writable expected, no check found
- ⚠ recipient_token_account_1: writable expected, no check found
- ⚠ token_program: address expected, no check found
- ⚠ token_program_2022: address expected, no check found
- ⚠ memo_program: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | nft_owner | expected · found | — | — | — | — |
| 1 | nft_account | — | — | found (+discriminator found) | — | — |
| 2 | personal_position | — | expected · NOT FOUND | found (+discriminator found) | — | — |
| 3 | pool_state | — | expected · runtime | found (+discriminator found) | — | — |
| 4 | protocol_position | — | — | — | — | — |
| 5 | token_vault_0 | — | expected · PARTIAL | — | — | — |
| 6 | token_vault_1 | — | expected · PARTIAL | — | — | — |
| 7 | tick_array_lower | — | expected · NOT FOUND | — | — | — |
| 8 | tick_array_upper | — | expected · NOT FOUND | — | — | — |
| 9 | recipient_token_account_0 | — | expected · NOT FOUND | — | — | — |
| 10 | recipient_token_account_1 | — | expected · NOT FOUND | — | — | — |
| 11 | token_program | — | — | — | — | = Tokenkeg… · expected · NOT FOUND |
| 12 | token_program_2022 | — | — | — | — | = TokenzQd… · expected · NOT FOUND |
| 13 | memo_program | — | — | — | — | = MemoSq4g… · expected · NOT FOUND |
| 14 | vault_0_mint | — | — | — | — | — |
| 15 | vault_1_mint | — | — | — | — | — |

## Constraints per account

- nft_owner: signer found (bundle/decrease_liquidity_v2.ts:286 via try_accounts_17a30)
- nft_account: owner found (bundle/decrease_liquidity_v2.ts:288 via try_accounts_1678); discriminator found (bundle/decrease_liquidity_v2.ts:288 via try_accounts_1678); initialized found (bundle/decrease_liquidity_v2.ts:288 via try_accounts_1678)
- personal_position: owner found (bundle/decrease_liquidity_v2.ts:328 via try_accounts_18368); initialized found (bundle/decrease_liquidity_v2.ts:328 via try_accounts_18368); discriminator found (bundle/decrease_liquidity_v2.ts:328 via try_accounts_18368); writable NOT FOUND
- pool_state: discriminator found (bundle/decrease_liquidity_v2.ts:372 via fn_11e0); owner found (bundle/decrease_liquidity_v2.ts:372 via fn_11e0); writable runtime (shared.ts:14517) — written: the runtime rejects changes to a read-only account
- protocol_position: no checks found
- token_vault_0: writable PARTIAL (bundle/decrease_liquidity_v2.ts:621); key PARTIAL (bundle/decrease_liquidity_v2.ts:1098)
- token_vault_1: writable PARTIAL (bundle/decrease_liquidity_v2.ts:638); key PARTIAL (bundle/decrease_liquidity_v2.ts:1129)
- tick_array_lower: writable NOT FOUND
- tick_array_upper: writable NOT FOUND
- recipient_token_account_0: writable NOT FOUND
- recipient_token_account_1: writable NOT FOUND
- token_program: address NOT FOUND
- token_program_2022: address NOT FOUND
- memo_program: address NOT FOUND
- vault_0_mint: no checks found
- vault_1_mint: no checks found

## CPIs

- bundle/decrease_liquidity_v2.ts:3569 [conditional] TOKEN_2022_PROGRAM (constant).TransferChecked — amount: cf, ld8(ld64(s338 + 0x10) + 0x30)
- bundle/decrease_liquidity_v2.ts:3704 TOKEN_PROGRAM (constant).Transfer — amount: ba

## PDAs derived

- bundle/decrease_liquidity_v2.ts:1655 create_program_address(["pool", *(ld64(s280 + 0x18)), *(ld64(s280 + 0x10)), *(ld64(s280 + 8)), al[..(ak != 0) << 1], y[..1]], program *s78)
- bundle/decrease_liquidity_v2.ts:1665 find_program_address(["pool_tick_array_bitmap_extension", *am], program *s48)
- bundle/decrease_liquidity_v2.ts:4449 create_program_address(["pool", *(h + 1), *(h + 0x41), *(h + 0x61), (i != 0 ? h + 0x17f : 1)[..(i != 0) << 1], h[..1]], program *s50)
- bundle/decrease_liquidity_v2.ts:4487 create_program_address(["pool", *(h + 1), *(ld64(s408 + 8)), *(ld64(s408 + 0x10)), af[..(ae != 0) << 1], ad[..1]], program *s50)
- shared.ts:14304 create_program_address(["pool", *(b + 1), *(b + 0x41), *(b + 0x61), (u != 0 ? b + 0x17f : 1)[..(u != 0) << 1], b[..1]], program *s28)
- shared.ts:14310 find_program_address(["pool_tick_array_bitmap_extension", *s48], program *sc8)
- shared.ts:13831 create_program_address(["pool", *(b + 1), *(b + 0x41), *(b + 0x61), (f != 0 ? b + 0x17f : 1)[..(f != 0) << 1], b[..1]], program *s28)

## Operations (account writes)

- shared.ts:14517 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s148 + 0x38) ^ ld64(s268 + 0x38) [conditional]
- shared.ts:14518 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s2a8) [conditional]
- shared.ts:14519 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s2a0) [conditional]
- shared.ts:14520 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s290) [conditional]
- shared.ts:14521 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s298) [conditional]
- shared.ts:14522 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ak ^ al [conditional]
- shared.ts:14523 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ai ^ aj [conditional]
- shared.ts:14524 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ag ^ ah [conditional]
- shared.ts:14525 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ae ^ af [conditional]
- shared.ts:14526 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = am [conditional]
- shared.ts:14527 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ac ^ ad [conditional]
- shared.ts:14528 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = aa ^ ab [conditional]
- shared.ts:14529 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s278) [conditional]
- shared.ts:14530 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s280) [conditional]
- shared.ts:14531 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s270) [conditional]
- shared.ts:14533 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = an ^ v [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/decrease_liquidity_v2.ts:3569 TOKEN_TRANSFER: 25 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
- bundle/decrease_liquidity_v2.ts:3704 TOKEN_TRANSFER: 25 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
- shared.ts:14517 ACCOUNT_DATA_WRITE: 24 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14518 ACCOUNT_DATA_WRITE: 24 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14519 ACCOUNT_DATA_WRITE: 24 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14520 ACCOUNT_DATA_WRITE: 24 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14521 ACCOUNT_DATA_WRITE: 24 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14522 ACCOUNT_DATA_WRITE: 24 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14523 ACCOUNT_DATA_WRITE: 24 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14524 ACCOUNT_DATA_WRITE: 24 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14525 ACCOUNT_DATA_WRITE: 24 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14526 ACCOUNT_DATA_WRITE: 24 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14527 ACCOUNT_DATA_WRITE: 24 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14528 ACCOUNT_DATA_WRITE: 24 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14529 ACCOUNT_DATA_WRITE: 24 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14530 ACCOUNT_DATA_WRITE: 24 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14531 ACCOUNT_DATA_WRITE: 24 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14533 ACCOUNT_DATA_WRITE: 24 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)

## Authority (who enables each value movement / authority change)

- bundle/decrease_liquidity_v2.ts:3569 TOKEN_TRANSFER: signer nft_owner (found)
- bundle/decrease_liquidity_v2.ts:3704 TOKEN_TRANSFER: signer nft_owner (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/decrease_liquidity_v2.ts:3569 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer nft_owner (found)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_2022_PROGRAM
  - [found] relevant checks on every path — 25 dominating checks
- bundle/decrease_liquidity_v2.ts:3704 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer nft_owner (found)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_PROGRAM
  - [found] relevant checks on every path — 25 dominating checks
- shared.ts:14517 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer nft_owner accounts_decrease_liquidity_v2:11; raw  accounts_decrease_liquidity_v2:169; key/initialized  fn_d358:5
  - [PARTIAL] amount arithmetic checked — pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14518 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer nft_owner accounts_decrease_liquidity_v2:11; raw  accounts_decrease_liquidity_v2:169; key/initialized  fn_d358:5
  - [PARTIAL] amount arithmetic checked — pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14519 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer nft_owner accounts_decrease_liquidity_v2:11; raw  accounts_decrease_liquidity_v2:169; key/initialized  fn_d358:5
  - [PARTIAL] amount arithmetic checked — pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14520 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer nft_owner accounts_decrease_liquidity_v2:11; raw  accounts_decrease_liquidity_v2:169; key/initialized  fn_d358:5
  - [PARTIAL] amount arithmetic checked — pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14521 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer nft_owner accounts_decrease_liquidity_v2:11; raw  accounts_decrease_liquidity_v2:169; key/initialized  fn_d358:5
  - [PARTIAL] amount arithmetic checked — pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14522 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer nft_owner accounts_decrease_liquidity_v2:11; raw  accounts_decrease_liquidity_v2:169; key/initialized  fn_d358:5
  - [PARTIAL] amount arithmetic checked — pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/decrease_liquidity_v2.ts:3569 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked ⇐ signer nft_owner (found)
- bundle/decrease_liquidity_v2.ts:3704 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer ⇐ signer nft_owner (found)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/decrease_liquidity_v2.ts:3569 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked: ✗ `ld64(s18) != 0` · `u261 != -1` · `bp != -1` · `u243 != -1` · `bj != -1` · `u229 != -1` · `bf != -1` · `y != 2` · ✗ `w == 0` · `u40 != -1` · … 27 more
- bundle/decrease_liquidity_v2.ts:3704 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer: ✗ `ld64(s18) != 0` · `u81 != -1` · `ae != -1` · `u67 != -1` · `u63 != -1` · `u40 != -1` · `u36 != -1` · `u24 != -1` · `l != -1` · `g != 0` · … 23 more
- shared.ts:14517 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `(bm as u8) != 0` · ✗ `ld64(s308) != 0` · `(ld64(s408 + 0x20) & 1) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · … 30 more (budget reached)
- shared.ts:14518 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `(bm as u8) != 0` · ✗ `ld64(s308) != 0` · `(ld64(s408 + 0x20) & 1) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · … 30 more (budget reached)
- shared.ts:14519 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `(bm as u8) != 0` · ✗ `ld64(s308) != 0` · `(ld64(s408 + 0x20) & 1) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · … 30 more (budget reached)
- shared.ts:14520 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `(bm as u8) != 0` · ✗ `ld64(s308) != 0` · `(ld64(s408 + 0x20) & 1) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · … 30 more (budget reached)
- shared.ts:14521 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `(bm as u8) != 0` · ✗ `ld64(s308) != 0` · `(ld64(s408 + 0x20) & 1) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · … 30 more (budget reached)
- shared.ts:14522 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `(bm as u8) != 0` · ✗ `ld64(s308) != 0` · `(ld64(s408 + 0x20) & 1) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · … 30 more (budget reached)
- shared.ts:14523 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `(bm as u8) != 0` · ✗ `ld64(s308) != 0` · `(ld64(s408 + 0x20) & 1) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · … 30 more (budget reached)
- shared.ts:14524 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `(bm as u8) != 0` · ✗ `ld64(s308) != 0` · `(ld64(s408 + 0x20) & 1) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · … 30 more (budget reached)
- shared.ts:14525 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `(bm as u8) != 0` · ✗ `ld64(s308) != 0` · `(ld64(s408 + 0x20) & 1) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · … 30 more (budget reached)
- shared.ts:14526 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `(bm as u8) != 0` · ✗ `ld64(s308) != 0` · `(ld64(s408 + 0x20) & 1) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · … 30 more (budget reached)
- shared.ts:14527 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `(bm as u8) != 0` · ✗ `ld64(s308) != 0` · `(ld64(s408 + 0x20) & 1) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · … 30 more (budget reached)
- shared.ts:14528 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `(bm as u8) != 0` · ✗ `ld64(s308) != 0` · `(ld64(s408 + 0x20) & 1) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · … 30 more (budget reached)
- shared.ts:14529 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `(bm as u8) != 0` · ✗ `ld64(s308) != 0` · `(ld64(s408 + 0x20) & 1) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · … 30 more (budget reached)
- shared.ts:14530 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `(bm as u8) != 0` · ✗ `ld64(s308) != 0` · `(ld64(s408 + 0x20) & 1) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · `bg == 2` · ✗ `ld64(s308) != 0` · … 30 more (budget reached)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): nft_owner.key, nft_account.key, personal_position.key, pool_state.key, protocol_position.key, tick_array_lower.key, tick_array_upper.key, recipient_token_account_0.key, recipient_token_account_1.key, token_program.key, token_program_2022.key, memo_program.key, vault_0_mint.key, vault_1_mint.key, ix.liquidity, ix.amount_0_min, ix.amount_1_min
- nft_account.data: validated (owner found @accounts_decrease_liquidity_v2:13, discriminator found @accounts_decrease_liquidity_v2:13, initialized found @accounts_decrease_liquidity_v2:13)
- personal_position.data: validated (owner found @accounts_decrease_liquidity_v2:53, discriminator found @accounts_decrease_liquidity_v2:53, initialized found @accounts_decrease_liquidity_v2:53)
- pool_state.data: validated (owner found @accounts_decrease_liquidity_v2:97, discriminator found @accounts_decrease_liquidity_v2:97)
- token_vault_0.key: partially-validated (key partial @fn_b4c78:14)
- token_vault_1.key: partially-validated (key partial @fn_b4c78:45)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/decrease_liquidity_v2.ts:286 | found | nft_owner | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/decrease_liquidity_v2.ts:288 | found | nft_account | owner, discriminator, initialized (via try_accounts_1678 (count, owner, discriminator, initialized)) | `ld32(s100 + 0x90) == 2` | return |
| 2 | bundle/decrease_liquidity_v2.ts:328 | found | personal_position | owner, initialized, discriminator (via try_accounts_18368 (count, owner, initialized, discriminator)) | `ld64(s120) == 0` | return |
| 3 | bundle/decrease_liquidity_v2.ts:372 | found | pool_state | discriminator, owner (via fn_11e0 (count, discriminator, owner)) | `f != 2` | return |
| 4 | bundle/decrease_liquidity_v2.ts:444 | found |  | raw | `y == 2` | anchor::ConstraintRaw |
| 5 | bundle/decrease_liquidity_v2.ts:459 | PARTIAL |  | raw | `al == 2` | anchor::ConstraintRaw |
| 6 | bundle/decrease_liquidity_v2.ts:474 | PARTIAL |  | raw | `ao == 2` | anchor::ConstraintRaw |
| 7 | bundle/decrease_liquidity_v2.ts:489 | PARTIAL |  | raw | `ar == 2` | anchor::ConstraintRaw |
| 8 | bundle/decrease_liquidity_v2.ts:504 | PARTIAL |  | raw | `av == 2` | anchor::ConstraintRaw |
| 9 | bundle/decrease_liquidity_v2.ts:519 | PARTIAL |  | raw | `ay == 2` | anchor::ConstraintRaw |
| 10 | bundle/decrease_liquidity_v2.ts:534 | PARTIAL |  | raw | `bb == 2` | anchor::ConstraintRaw |
| 11 | bundle/decrease_liquidity_v2.ts:571 | PARTIAL |  | raw | `bg == 2` | anchor::ConstraintRaw |
| 12 | bundle/decrease_liquidity_v2.ts:600 | PARTIAL |  | raw | `!((memcmp((k & -8) + 0x28, bl + 8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 13 | bundle/decrease_liquidity_v2.ts:601 | PARTIAL |  | raw | `ld64((k & -8) + 0x68) != 1` | anchor::ConstraintRaw |
| 14 | bundle/decrease_liquidity_v2.ts:612 | PARTIAL |  | token_owner | `!((memcmp((k & -8) + 0x48, s120, 0x20) as u32) == 0)` | anchor::ConstraintTokenOwner |
| 15 | bundle/decrease_liquidity_v2.ts:614 | PARTIAL |  | writable | `!(ld8(ld64(bn) + 0x29) != 0)` | anchor::ConstraintMut |
| 16 | bundle/decrease_liquidity_v2.ts:618 | PARTIAL |  | raw | `!((bp as u32) == 0)` | anchor::ConstraintRaw |
| 17 | bundle/decrease_liquidity_v2.ts:619 | PARTIAL |  | writable | `!(ld8(ld64(s580) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 18 | bundle/decrease_liquidity_v2.ts:621 | PARTIAL | token_vault_0 | writable | `token_vault_0.is_writable == 0` | anchor::ConstraintMut |
| 19 | bundle/decrease_liquidity_v2.ts:636 | PARTIAL |  | raw | `!((bu as u32) == 0)` | anchor::ConstraintRaw |
| 20 | bundle/decrease_liquidity_v2.ts:638 | PARTIAL | token_vault_1 | writable | `token_vault_1.is_writable == 0` | anchor::ConstraintMut |
| 21 | bundle/decrease_liquidity_v2.ts:653 | PARTIAL |  | raw | `!((by as u32) == 0)` | anchor::ConstraintRaw |
| 22 | bundle/decrease_liquidity_v2.ts:654 | PARTIAL |  | writable | `!(ld8(ld64(s598) + 0x29) != 0)` | anchor::ConstraintMut |
| 23 | bundle/decrease_liquidity_v2.ts:668 | PARTIAL |  | raw | `!((ca as u32) == 0)` | anchor::ConstraintRaw |
| 24 | bundle/decrease_liquidity_v2.ts:669 | PARTIAL |  | writable | `!(ld8(ld64(s5a0) + 0x29) != 0)` | anchor::ConstraintMut |
| 25 | bundle/decrease_liquidity_v2.ts:683 | PARTIAL |  | raw | `!((cc as u32) == 0)` | anchor::ConstraintRaw |
| 26 | bundle/decrease_liquidity_v2.ts:684 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s5a8) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 27 | bundle/decrease_liquidity_v2.ts:687 | PARTIAL |  | token_mint | `(memcmp(ld64(s5a8) + 0x28, s120, 0x20) as u32) != 0` | anchor::ConstraintTokenMint |
| 28 | bundle/decrease_liquidity_v2.ts:695 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s5b0) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 29 | bundle/decrease_liquidity_v2.ts:698 | PARTIAL |  | token_mint | `(memcmp(ld64(s5b0) + 0x28, s120, 0x20) as u32) != 0` | anchor::ConstraintTokenMint |
| 30 | bundle/decrease_liquidity_v2.ts:708 | PARTIAL |  | key, address | `!((memcmp(s1c0, 0x1001594c0 /* &MEMO_PROGRAM */, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 31 | bundle/decrease_liquidity_v2.ts:713 | PARTIAL |  | key, address | `!((memcmp(s1a0, s180, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 32 | bundle/decrease_liquidity_v2.ts:719 | PARTIAL |  | address | `q != 0` | anchor::ConstraintAddress |
| 33 | bundle/decrease_liquidity_v2.ts:1091 | PARTIAL | personal_position |  | `f != 2` | return |
| 34 | bundle/decrease_liquidity_v2.ts:1094 | PARTIAL | pool_state |  | `f != 2` | return |
| 35 | bundle/decrease_liquidity_v2.ts:1098 | PARTIAL | token_vault_0 | key | `(memcmp(l, c, 0x20) as u32) == 0 && (common_is_closed(m) == 0 && ld64(ld64(m + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 36 | bundle/decrease_liquidity_v2.ts:1129 | PARTIAL | token_vault_1 | key | `(memcmp(q, c, 0x20) as u32) == 0 && (common_is_closed(r) == 0 && ld64(ld64(r + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 37 | entrypoint.ts:487 | found |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 38 | entrypoint.ts:496 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 39 | shared.ts:1017 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 40 | shared.ts:1035 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 41 | shared.ts:1043 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 42 | bundle/decrease_liquidity_v2.ts:1543 | found |  | custom | `(ld8(l + 0x17d) & 0xe) == 0xe` | error::NotApproved |
| 43 | bundle/decrease_liquidity_v2.ts:1801 | PARTIAL |  | custom | `be > bc - bd` | error::PriceSlippageCheck |
| 44 | entrypoint.ts:743 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 45 | bundle/decrease_liquidity_v2.ts:1397 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 46 | bundle/decrease_liquidity_v2.ts:1408 | found |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 47 | bundle/decrease_liquidity_v2.ts:1444 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 48 | bundle/decrease_liquidity_v2.ts:1455 | found |  | discriminator | `j != 0x2a81f931cd559bc0 /* account:TickArrayState */` | anchor::AccountDiscriminatorMismatch |
| 49 | bundle/decrease_liquidity_v2.ts:4360 | found |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 50 | bundle/decrease_liquidity_v2.ts:4365 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 51 | bundle/decrease_liquidity_v2.ts:4376 | found |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 52 | entrypoint.ts:4230 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 53 | entrypoint.ts:4332 | PARTIAL |  | key | `(memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 54 | shared.ts:7143 | PARTIAL |  | key, custom | `!((memcmp(sb7, ld64(s348 + 0x20), 0x20) as u32) != 0)` | error::InvalidRewardInputAccountNumber |
| 55 | shared.ts:908 | found |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 56 | shared.ts:913 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 57 | shared.ts:924 | found |  | discriminator | `j != 0x2a81f931cd559bc0 /* account:TickArrayState */` | anchor::AccountDiscriminatorMismatch |
| 58 | shared.ts:14313 | PARTIAL |  | key | `(memcmp(s1a8, se8, 0x20) as u32) != 0` | anchor::RequireKeysEqViolated |
| 59 | shared.ts:14375 | PARTIAL |  | writable | `!(ld8(v + 0x29) != 0)` | anchor::AccountNotMutable |
| 60 | shared.ts:15478 | found |  | custom | `(g as u32) != (b as u32)` | error::InvalidTickArray |
| 61 | shared.ts:10528 | found |  | custom | `0 > (e as i64)` | error::LiquiditySubValueErr |
| 62 | shared.ts:1069 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 63 | shared.ts:1087 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 64 | shared.ts:1095 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x998b8061db24963c /* account:TickArrayBitmapExtension */` | anchor::AccountDiscriminatorMismatch |
| 65 | shared.ts:13043 | found |  | custom | `!(0xd89e9 > ((b + 0x6c4f4) as u32))` | error::TickUpperOverflow |
| 66 | shared.ts:10732 | found |  | custom | `!((h \| i) != 0)` | error::ZeroSqrtPrice |
