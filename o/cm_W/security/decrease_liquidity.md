# decrease_liquidity

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_decrease_liquidity (anchor); 94 functions reachable: ix_decrease_liquidity, accounts_decrease_liquidity, memcpy, fn_2cfa8, fn_b15c0, anchor_error_from, fn_11e480, fn_147a20, fn_153158, fn_13e628, fn_d358, fn_5608, ….

## Look first

- ⚠ personal_position: writable expected, no check found
- ⚠ tick_array_lower: writable expected, no check found
- ⚠ tick_array_upper: writable expected, no check found
- ⚠ recipient_token_account_0: writable expected, no check found
- ⚠ recipient_token_account_1: writable expected, no check found
- ⚠ token_program: address expected, no check found

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

## Constraints per account

- nft_owner: signer found (bundle/decrease_liquidity.ts:278 via try_accounts_17a30)
- nft_account: owner found (bundle/decrease_liquidity.ts:280 via try_accounts_182b0); discriminator found (bundle/decrease_liquidity.ts:280 via try_accounts_182b0); initialized found (bundle/decrease_liquidity.ts:280 via try_accounts_182b0)
- personal_position: owner found (bundle/decrease_liquidity.ts:320 via try_accounts_18368); initialized found (bundle/decrease_liquidity.ts:320 via try_accounts_18368); discriminator found (bundle/decrease_liquidity.ts:320 via try_accounts_18368); writable NOT FOUND
- pool_state: discriminator found (bundle/decrease_liquidity.ts:364 via fn_11e0); owner found (bundle/decrease_liquidity.ts:364 via fn_11e0); writable runtime (shared.ts:14517) — written: the runtime rejects changes to a read-only account
- protocol_position: no checks found
- token_vault_0: writable PARTIAL (bundle/decrease_liquidity.ts:546); key PARTIAL (bundle/decrease_liquidity.ts:942)
- token_vault_1: writable PARTIAL (bundle/decrease_liquidity.ts:563); key PARTIAL (bundle/decrease_liquidity.ts:972)
- tick_array_lower: writable NOT FOUND
- tick_array_upper: writable NOT FOUND
- recipient_token_account_0: writable NOT FOUND
- recipient_token_account_1: writable NOT FOUND
- token_program: address NOT FOUND

## CPIs

- bundle/decrease_liquidity.ts:3410 [conditional] TOKEN_2022_PROGRAM (constant).TransferChecked — amount: cf, ld8(ld64(s338 + 0x10) + 0x30)
- bundle/decrease_liquidity.ts:3545 TOKEN_PROGRAM (constant).Transfer — amount: ba

## PDAs derived

- bundle/decrease_liquidity.ts:1496 create_program_address(["pool", *(ld64(s280 + 0x18)), *(ld64(s280 + 0x10)), *(ld64(s280 + 8)), al[..(ak != 0) << 1], y[..1]], program *s78)
- bundle/decrease_liquidity.ts:1506 find_program_address(["pool_tick_array_bitmap_extension", *am], program *s48)
- bundle/decrease_liquidity.ts:4290 create_program_address(["pool", *(h + 1), *(h + 0x41), *(h + 0x61), (i != 0 ? h + 0x17f : 1)[..(i != 0) << 1], h[..1]], program *s50)
- bundle/decrease_liquidity.ts:4328 create_program_address(["pool", *(h + 1), *(ld64(s408 + 8)), *(ld64(s408 + 0x10)), af[..(ae != 0) << 1], ad[..1]], program *s50)
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

- bundle/decrease_liquidity.ts:3410 TOKEN_TRANSFER: 25 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
- bundle/decrease_liquidity.ts:3545 TOKEN_TRANSFER: 25 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; owner personal_position; initialized personal_position; discriminator personal_position; discriminator pool_state; …)
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

- bundle/decrease_liquidity.ts:3410 TOKEN_TRANSFER: signer nft_owner (found)
- bundle/decrease_liquidity.ts:3545 TOKEN_TRANSFER: signer nft_owner (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/decrease_liquidity.ts:3410 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer nft_owner (found)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_2022_PROGRAM
  - [found] relevant checks on every path — 25 dominating checks
- bundle/decrease_liquidity.ts:3545 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer [TOKEN_TRANSFER]
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
  - [found] write gated (signer / constraint) — signer nft_owner accounts_decrease_liquidity:11; raw  accounts_decrease_liquidity:169; key/initialized  fn_d358:5
  - [PARTIAL] amount arithmetic checked — pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14518 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer nft_owner accounts_decrease_liquidity:11; raw  accounts_decrease_liquidity:169; key/initialized  fn_d358:5
  - [PARTIAL] amount arithmetic checked — pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14519 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer nft_owner accounts_decrease_liquidity:11; raw  accounts_decrease_liquidity:169; key/initialized  fn_d358:5
  - [PARTIAL] amount arithmetic checked — pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14520 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer nft_owner accounts_decrease_liquidity:11; raw  accounts_decrease_liquidity:169; key/initialized  fn_d358:5
  - [PARTIAL] amount arithmetic checked — pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14521 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer nft_owner accounts_decrease_liquidity:11; raw  accounts_decrease_liquidity:169; key/initialized  fn_d358:5
  - [PARTIAL] amount arithmetic checked — pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)
- shared.ts:14522 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer nft_owner accounts_decrease_liquidity:11; raw  accounts_decrease_liquidity:169; key/initialized  fn_d358:5
  - [PARTIAL] amount arithmetic checked — pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (validated)

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/decrease_liquidity.ts:3410 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked ⇐ signer nft_owner (found)
- bundle/decrease_liquidity.ts:3545 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer ⇐ signer nft_owner (found)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/decrease_liquidity.ts:3410 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked: ✗ `ld64(s18) != 0` · `u261 != -1` · `bp != -1` · `u243 != -1` · `bj != -1` · `u229 != -1` · `bf != -1` · `y != 2` · ✗ `w == 0` · `u40 != -1` · … 25 more
- bundle/decrease_liquidity.ts:3545 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer: ✗ `ld64(s18) != 0` · `u81 != -1` · `ae != -1` · `u67 != -1` · `u63 != -1` · `u40 != -1` · `u36 != -1` · `u24 != -1` · `l != -1` · `g != 0` · … 21 more
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

- caller-controlled (no validating check found): nft_owner.key, nft_account.key, personal_position.key, pool_state.key, protocol_position.key, tick_array_lower.key, tick_array_upper.key, recipient_token_account_0.key, recipient_token_account_1.key, token_program.key, ix.liquidity, ix.amount_0_min, ix.amount_1_min
- nft_account.data: validated (owner found @accounts_decrease_liquidity:13, discriminator found @accounts_decrease_liquidity:13, initialized found @accounts_decrease_liquidity:13)
- personal_position.data: validated (owner found @accounts_decrease_liquidity:53, discriminator found @accounts_decrease_liquidity:53, initialized found @accounts_decrease_liquidity:53)
- pool_state.data: validated (owner found @accounts_decrease_liquidity:97, discriminator found @accounts_decrease_liquidity:97)
- token_vault_0.key: partially-validated (key partial @fn_b15c0:13)
- token_vault_1.key: partially-validated (key partial @fn_b15c0:43)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/decrease_liquidity.ts:278 | found | nft_owner | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/decrease_liquidity.ts:280 | found | nft_account | owner, discriminator, initialized (via try_accounts_182b0 (count, owner, discriminator, initialized)) | `ld32(s120 + 0x90) == 2` | return |
| 2 | bundle/decrease_liquidity.ts:320 | found | personal_position | owner, initialized, discriminator (via try_accounts_18368 (count, owner, initialized, discriminator)) | `ld64(s120) == 0` | return |
| 3 | bundle/decrease_liquidity.ts:364 | found | pool_state | discriminator, owner (via fn_11e0 (count, discriminator, owner)) | `f != 2` | return |
| 4 | bundle/decrease_liquidity.ts:436 | found |  | raw | `y == 2` | anchor::ConstraintRaw |
| 5 | bundle/decrease_liquidity.ts:451 | PARTIAL |  | raw | `al == 2` | anchor::ConstraintRaw |
| 6 | bundle/decrease_liquidity.ts:466 | PARTIAL |  | raw | `ao == 2` | anchor::ConstraintRaw |
| 7 | bundle/decrease_liquidity.ts:481 | PARTIAL |  | raw | `ar == 2` | anchor::ConstraintRaw |
| 8 | bundle/decrease_liquidity.ts:496 | PARTIAL |  | raw | `av == 2` | anchor::ConstraintRaw |
| 9 | bundle/decrease_liquidity.ts:525 | PARTIAL |  | raw | `!((memcmp((k & -8) + 8, ba + 8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 10 | bundle/decrease_liquidity.ts:526 | PARTIAL |  | raw | `ld64((k & -8) + 0x48) != 1` | anchor::ConstraintRaw |
| 11 | bundle/decrease_liquidity.ts:537 | PARTIAL |  | token_owner | `!((memcmp((k & -8) + 0x28, s120, 0x20) as u32) == 0)` | anchor::ConstraintTokenOwner |
| 12 | bundle/decrease_liquidity.ts:539 | PARTIAL |  | writable | `!(ld8(ld64(bc) + 0x29) != 0)` | anchor::ConstraintMut |
| 13 | bundle/decrease_liquidity.ts:543 | PARTIAL |  | raw | `!((be as u32) == 0)` | anchor::ConstraintRaw |
| 14 | bundle/decrease_liquidity.ts:544 | PARTIAL |  | writable | `!(ld8(ld64(s400) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 15 | bundle/decrease_liquidity.ts:546 | PARTIAL | token_vault_0 | writable | `token_vault_0.is_writable == 0` | anchor::ConstraintMut |
| 16 | bundle/decrease_liquidity.ts:561 | PARTIAL |  | raw | `!((bj as u32) == 0)` | anchor::ConstraintRaw |
| 17 | bundle/decrease_liquidity.ts:563 | PARTIAL | token_vault_1 | writable | `token_vault_1.is_writable == 0` | anchor::ConstraintMut |
| 18 | bundle/decrease_liquidity.ts:578 | PARTIAL |  | raw | `!((bn as u32) == 0)` | anchor::ConstraintRaw |
| 19 | bundle/decrease_liquidity.ts:579 | PARTIAL |  | writable | `!(ld8(ld64(s418) + 0x29) != 0)` | anchor::ConstraintMut |
| 20 | bundle/decrease_liquidity.ts:593 | PARTIAL |  | raw | `!((bp as u32) == 0)` | anchor::ConstraintRaw |
| 21 | bundle/decrease_liquidity.ts:594 | PARTIAL |  | writable | `!(ld8(ld64(s420) + 0x29) != 0)` | anchor::ConstraintMut |
| 22 | bundle/decrease_liquidity.ts:608 | PARTIAL |  | raw | `!((br as u32) == 0)` | anchor::ConstraintRaw |
| 23 | bundle/decrease_liquidity.ts:609 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s428)) + 0x29) != 0)` | anchor::ConstraintMut |
| 24 | bundle/decrease_liquidity.ts:612 | PARTIAL |  | token_mint | `(memcmp(ld64(s428) + 8, s120, 0x20) as u32) != 0` | anchor::ConstraintTokenMint |
| 25 | bundle/decrease_liquidity.ts:620 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s430)) + 0x29) != 0)` | anchor::ConstraintMut |
| 26 | bundle/decrease_liquidity.ts:624 | PARTIAL |  | token_mint | `q != 0` | anchor::ConstraintTokenMint |
| 27 | bundle/decrease_liquidity.ts:936 | PARTIAL | personal_position |  | `f != 2` | return |
| 28 | bundle/decrease_liquidity.ts:939 | PARTIAL | pool_state |  | `f != 2` | return |
| 29 | bundle/decrease_liquidity.ts:942 | PARTIAL | token_vault_0 | key | `(memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(l) == 0 && ld64` | Err(ProgramError::AccountBorrowFailed) |
| 30 | bundle/decrease_liquidity.ts:972 | PARTIAL | token_vault_1 | key | `(memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(p) == 0 && ld64` | Err(ProgramError::AccountBorrowFailed) |
| 31 | entrypoint.ts:487 | found |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 32 | entrypoint.ts:496 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 33 | shared.ts:1017 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 34 | shared.ts:1035 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 35 | shared.ts:1043 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 36 | bundle/decrease_liquidity.ts:1384 | found |  | custom | `(ld8(l + 0x17d) & 0xe) == 0xe` | error::NotApproved |
| 37 | bundle/decrease_liquidity.ts:1642 | PARTIAL |  | custom | `be > bc - bd` | error::PriceSlippageCheck |
| 38 | entrypoint.ts:743 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 39 | bundle/decrease_liquidity.ts:1238 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 40 | bundle/decrease_liquidity.ts:1249 | found |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 41 | bundle/decrease_liquidity.ts:1285 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 42 | bundle/decrease_liquidity.ts:1296 | found |  | discriminator | `j != 0x2a81f931cd559bc0 /* account:TickArrayState */` | anchor::AccountDiscriminatorMismatch |
| 43 | bundle/decrease_liquidity.ts:4201 | found |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 44 | bundle/decrease_liquidity.ts:4206 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 45 | bundle/decrease_liquidity.ts:4217 | found |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 46 | entrypoint.ts:4230 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 47 | entrypoint.ts:4332 | PARTIAL |  | key | `(memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 48 | bundle/decrease_liquidity.ts:5001 | PARTIAL |  | key, custom | `!((memcmp(sb7, ld64(s348 + 0x20), 0x20) as u32) != 0)` | error::InvalidRewardInputAccountNumber |
| 49 | shared.ts:908 | found |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 50 | shared.ts:913 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 51 | shared.ts:924 | found |  | discriminator | `j != 0x2a81f931cd559bc0 /* account:TickArrayState */` | anchor::AccountDiscriminatorMismatch |
| 52 | shared.ts:14313 | PARTIAL |  | key | `(memcmp(s1a8, se8, 0x20) as u32) != 0` | anchor::RequireKeysEqViolated |
| 53 | shared.ts:14375 | PARTIAL |  | writable | `!(ld8(v + 0x29) != 0)` | anchor::AccountNotMutable |
| 54 | shared.ts:15478 | found |  | custom | `(g as u32) != (b as u32)` | error::InvalidTickArray |
| 55 | shared.ts:10528 | found |  | custom | `0 > (e as i64)` | error::LiquiditySubValueErr |
| 56 | shared.ts:1069 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 57 | shared.ts:1087 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 58 | shared.ts:1095 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x998b8061db24963c /* account:TickArrayBitmapExtension */` | anchor::AccountDiscriminatorMismatch |
| 59 | shared.ts:13043 | found |  | custom | `!(0xd89e9 > ((b + 0x6c4f4) as u32))` | error::TickUpperOverflow |
| 60 | shared.ts:10732 | found |  | custom | `!((h \| i) != 0)` | error::ZeroSqrtPrice |
