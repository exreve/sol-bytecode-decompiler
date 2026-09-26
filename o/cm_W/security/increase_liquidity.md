# increase_liquidity

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_increase_liquidity (anchor); 98 functions reachable: ix_increase_liquidity, accounts_increase_liquidity, memcpy, fn_11dc98, fn_ab558, anchor_error_from, fn_11e480, fn_147a20, fn_153158, fn_13e628, fn_5608, fn_d358, ….

## Look first

- ⚠ personal_position: writable expected, no check found
- ⚠ tick_array_lower: writable expected, no check found
- ⚠ tick_array_upper: writable expected, no check found
- ⚠ token_account_0: writable expected, no check found
- ⚠ token_account_1: writable expected, no check found
- ⚠ token_program: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | nft_owner | expected · found | — | — | — | — |
| 1 | nft_account | — | — | found (+discriminator found) | — | — |
| 2 | pool_state | — | expected · runtime | found (+discriminator found) | — | — |
| 3 | protocol_position | — | — | — | — | — |
| 4 | personal_position | — | expected · NOT FOUND | found (+discriminator found) | — | — |
| 5 | tick_array_lower | — | expected · NOT FOUND | — | — | — |
| 6 | tick_array_upper | — | expected · NOT FOUND | — | — | — |
| 7 | token_account_0 | — | expected · NOT FOUND | — | — | — |
| 8 | token_account_1 | — | expected · NOT FOUND | — | — | — |
| 9 | token_vault_0 | — | expected · PARTIAL | — | — | — |
| 10 | token_vault_1 | — | expected · PARTIAL | — | — | — |
| 11 | token_program | — | — | — | — | = Tokenkeg… · expected · NOT FOUND |
|  | tick_array_state [code] | — | — | — | — | — |
|  | tick_array_state_data [code] | — | — | — | — | — |

## Constraints per account

- nft_owner: signer found (bundle/increase_liquidity.ts:271 via try_accounts_17a30)
- nft_account: owner found (bundle/increase_liquidity.ts:273 via try_accounts_182b0); discriminator found (bundle/increase_liquidity.ts:273 via try_accounts_182b0); initialized found (bundle/increase_liquidity.ts:273 via try_accounts_182b0)
- pool_state: discriminator found (bundle/increase_liquidity.ts:314 via fn_11e0); owner found (bundle/increase_liquidity.ts:314 via fn_11e0); writable runtime (shared.ts:14517) — written: the runtime rejects changes to a read-only account
- protocol_position: no checks found
- personal_position: owner found (bundle/increase_liquidity.ts:361 via try_accounts_18368); initialized found (bundle/increase_liquidity.ts:361 via try_accounts_18368); discriminator found (bundle/increase_liquidity.ts:361 via try_accounts_18368); writable NOT FOUND
- tick_array_lower: writable NOT FOUND
- tick_array_upper: writable NOT FOUND
- token_account_0: key PARTIAL (bundle/increase_liquidity.ts:874); writable NOT FOUND
- token_account_1: writable NOT FOUND
- token_vault_0: writable PARTIAL (bundle/increase_liquidity.ts:584)
- token_vault_1: writable PARTIAL (bundle/increase_liquidity.ts:601)
- token_program: address NOT FOUND
- tick_array_state: state found (bundle/increase_liquidity.ts:3229)
- tick_array_state_data: state found (bundle/increase_liquidity.ts:3277)

## CPIs

- shared.ts:17543 [conditional] TOKEN_2022_PROGRAM (constant).TransferChecked — amount: ld64(s1e8 + 0x18), ld8(ld64(s1e8 + 0x30) + 0x30)
- shared.ts:17611 [conditional] TOKEN_PROGRAM (constant).Transfer — amount: ld64(s1e8 + 0x18)

## PDAs derived

- bundle/increase_liquidity.ts:1776 find_program_address(["pool_tick_array_bitmap_extension", *ay], program *sb8)
- bundle/increase_liquidity.ts:2962 find_program_address(["pool_tick_array_bitmap_extension", *b], program *s20)
- bundle/increase_liquidity.ts:3248 create_program_address(["pool", *(ad + 1), *(ad + 0x41), *(ad + 0x61), (ae != 0 ? ad + 0x17f : 1)[..(ae != 0) << 1], ad[..1]], program *s148)
- bundle/increase_liquidity.ts:3294 create_program_address(["pool", *(ld64(s5b0)), *(ld64(s5a8)), *(ld64(s5a8 + 8)), (bv != 0 ? bw : 1)[..(bv != 0) << 1], bu[..1]], program *s148)
- bundle/increase_liquidity.ts:3937 create_program_address(["pool", *(ld64(s5b0)), *(ld64(s5a8)), *(ld64(s5a8 + 8)), (bp != 0 ? bq : 1)[..(bp != 0) << 1], bo[..1]], program *s28)
- shared.ts:14304 create_program_address(["pool", *(b + 1), *(b + 0x41), *(b + 0x61), (u != 0 ? b + 0x17f : 1)[..(u != 0) << 1], b[..1]], program *s28)
- shared.ts:14310 find_program_address(["pool_tick_array_bitmap_extension", *s48], program *sc8)
- bundle/increase_liquidity.ts:4589 create_program_address(["pool", *(b + 1), *(b + 0x41), *(b + 0x61), (f != 0 ? b + 0x17f : 1)[..(f != 0) << 1], b[..1]], program *s28)

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

- shared.ts:14517 ACCOUNT_DATA_WRITE: 22 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; discriminator pool_state; owner pool_state; owner personal_position; initialized personal_position; …)
- shared.ts:14518 ACCOUNT_DATA_WRITE: 22 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; discriminator pool_state; owner pool_state; owner personal_position; initialized personal_position; …)
- shared.ts:14519 ACCOUNT_DATA_WRITE: 22 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; discriminator pool_state; owner pool_state; owner personal_position; initialized personal_position; …)
- shared.ts:14520 ACCOUNT_DATA_WRITE: 22 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; discriminator pool_state; owner pool_state; owner personal_position; initialized personal_position; …)
- shared.ts:14521 ACCOUNT_DATA_WRITE: 22 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; discriminator pool_state; owner pool_state; owner personal_position; initialized personal_position; …)
- shared.ts:14522 ACCOUNT_DATA_WRITE: 22 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; discriminator pool_state; owner pool_state; owner personal_position; initialized personal_position; …)
- shared.ts:14523 ACCOUNT_DATA_WRITE: 22 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; discriminator pool_state; owner pool_state; owner personal_position; initialized personal_position; …)
- shared.ts:14524 ACCOUNT_DATA_WRITE: 22 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; discriminator pool_state; owner pool_state; owner personal_position; initialized personal_position; …)
- shared.ts:14525 ACCOUNT_DATA_WRITE: 22 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; discriminator pool_state; owner pool_state; owner personal_position; initialized personal_position; …)
- shared.ts:14526 ACCOUNT_DATA_WRITE: 22 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; discriminator pool_state; owner pool_state; owner personal_position; initialized personal_position; …)
- shared.ts:14527 ACCOUNT_DATA_WRITE: 22 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; discriminator pool_state; owner pool_state; owner personal_position; initialized personal_position; …)
- shared.ts:14528 ACCOUNT_DATA_WRITE: 22 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; discriminator pool_state; owner pool_state; owner personal_position; initialized personal_position; …)
- shared.ts:14529 ACCOUNT_DATA_WRITE: 22 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; discriminator pool_state; owner pool_state; owner personal_position; initialized personal_position; …)
- shared.ts:14530 ACCOUNT_DATA_WRITE: 22 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; discriminator pool_state; owner pool_state; owner personal_position; initialized personal_position; …)
- shared.ts:14531 ACCOUNT_DATA_WRITE: 22 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; discriminator pool_state; owner pool_state; owner personal_position; initialized personal_position; …)
- shared.ts:14533 ACCOUNT_DATA_WRITE: 22 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; discriminator pool_state; owner pool_state; owner personal_position; initialized personal_position; …)
- shared.ts:17543 TOKEN_TRANSFER: 25 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; discriminator pool_state; owner pool_state; owner personal_position; initialized personal_position; …)
- shared.ts:17611 TOKEN_TRANSFER: 25 dominating checks (signer nft_owner; owner nft_account; discriminator nft_account; initialized nft_account; discriminator pool_state; owner pool_state; owner personal_position; initialized personal_position; …)

## Authority (who enables each value movement / authority change)

- shared.ts:17543 TOKEN_TRANSFER: signer nft_owner (found)
- shared.ts:17611 TOKEN_TRANSFER: signer nft_owner (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- shared.ts:14517 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer nft_owner accounts_increase_liquidity:11; raw  accounts_increase_liquidity:145; key/initialized  fn_d358:5
- shared.ts:14518 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer nft_owner accounts_increase_liquidity:11; raw  accounts_increase_liquidity:145; key/initialized  fn_d358:5
- shared.ts:14519 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer nft_owner accounts_increase_liquidity:11; raw  accounts_increase_liquidity:145; key/initialized  fn_d358:5
- shared.ts:14520 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer nft_owner accounts_increase_liquidity:11; raw  accounts_increase_liquidity:145; key/initialized  fn_d358:5
- shared.ts:14521 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer nft_owner accounts_increase_liquidity:11; raw  accounts_increase_liquidity:145; key/initialized  fn_d358:5
- shared.ts:14522 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer nft_owner accounts_increase_liquidity:11; raw  accounts_increase_liquidity:145; key/initialized  fn_d358:5
- shared.ts:17543 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer nft_owner (found)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_2022_PROGRAM
  - [found] relevant checks on every path — 25 dominating checks
- shared.ts:17611 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer nft_owner (found)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_PROGRAM
  - [found] relevant checks on every path — 25 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- shared.ts:17543 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked ⇐ signer nft_owner (found)
- shared.ts:17611 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer ⇐ signer nft_owner (found)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- shared.ts:14517 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14518 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14519 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14520 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14521 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14522 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14523 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14524 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14525 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14526 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14527 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14528 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14529 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14530 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14531 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14533 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)

## Relations (equalities the checks establish)

- tick_array_state_data.discriminator ~ 0x2a81f931cd559bc0 /* account:TickArrayState */ (compare, found, bundle/increase_liquidity.ts:3229)
- tick_array_state_data.discriminator ~ 0x2a81f931cd559bc0 /* account:TickArrayState */ (compare, PARTIAL, bundle/increase_liquidity.ts:4532)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): nft_owner.key, nft_account.key, pool_state.key, protocol_position.key, personal_position.key, tick_array_lower.key, tick_array_upper.key, token_account_1.key, token_vault_0.key, token_vault_1.key, token_program.key, tick_array_state.key, tick_array_state_data.key, ix.liquidity, ix.amount_0_max, ix.amount_1_max
- nft_account.data: validated (owner found @accounts_increase_liquidity:13, discriminator found @accounts_increase_liquidity:13, initialized found @accounts_increase_liquidity:13)
- pool_state.data: validated (owner found @accounts_increase_liquidity:54, discriminator found @accounts_increase_liquidity:54)
- personal_position.data: validated (owner found @accounts_increase_liquidity:101, discriminator found @accounts_increase_liquidity:101, initialized found @accounts_increase_liquidity:101)
- token_account_0.key: partially-validated (key partial @fn_ab558:18)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/increase_liquidity.ts:271 | found | nft_owner | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/increase_liquidity.ts:273 | found | nft_account | owner, discriminator, initialized (via try_accounts_182b0 (count, owner, discriminator, initialized)) | `ld32(s120 + 0x90) == 2` | return |
| 2 | bundle/increase_liquidity.ts:314 | found | pool_state | discriminator, owner (via fn_11e0 (count, discriminator, owner)) | `f != 2` | return |
| 3 | bundle/increase_liquidity.ts:361 | found | personal_position | owner, initialized, discriminator (via try_accounts_18368 (count, owner, initialized, discriminator)) | `ld64(s120) == 0` | return |
| 4 | bundle/increase_liquidity.ts:405 | found |  | raw | `x == 2` | anchor::ConstraintRaw |
| 5 | bundle/increase_liquidity.ts:420 | PARTIAL |  | raw | `ag == 2` | anchor::ConstraintRaw |
| 6 | bundle/increase_liquidity.ts:435 | PARTIAL |  | raw | `aj == 2` | anchor::ConstraintRaw |
| 7 | bundle/increase_liquidity.ts:450 | PARTIAL |  | raw | `am == 2` | anchor::ConstraintRaw |
| 8 | bundle/increase_liquidity.ts:465 | PARTIAL |  | raw | `ap == 2` | anchor::ConstraintRaw |
| 9 | bundle/increase_liquidity.ts:480 | PARTIAL |  | raw | `at == 2` | anchor::ConstraintRaw |
| 10 | bundle/increase_liquidity.ts:509 | PARTIAL |  | raw | `!((memcmp((k & -8) + 8, ay + 8, 0x20) as u32) == 0)` | anchor::ConstraintRaw |
| 11 | bundle/increase_liquidity.ts:510 | PARTIAL |  | raw | `ld64((k & -8) + 0x48) != 1` | anchor::ConstraintRaw |
| 12 | bundle/increase_liquidity.ts:521 | PARTIAL |  | token_owner | `!((memcmp((k & -8) + 0x28, s120, 0x20) as u32) == 0)` | anchor::ConstraintTokenOwner |
| 13 | bundle/increase_liquidity.ts:523 | PARTIAL | pool_state | writable | `pool_state.is_writable == 0` | anchor::ConstraintMut |
| 14 | bundle/increase_liquidity.ts:525 | PARTIAL |  | writable | `!(ld8(ld64(bb) + 0x29) != 0)` | anchor::ConstraintMut |
| 15 | bundle/increase_liquidity.ts:529 | PARTIAL |  | raw | `!((bd as u32) == 0)` | anchor::ConstraintRaw |
| 16 | bundle/increase_liquidity.ts:530 | PARTIAL |  | writable | `!(ld8(ld64(s408) + 0x29) != 0)` | anchor::ConstraintMut |
| 17 | bundle/increase_liquidity.ts:544 | PARTIAL |  | raw | `!((bf as u32) == 0)` | anchor::ConstraintRaw |
| 18 | bundle/increase_liquidity.ts:545 | PARTIAL |  | writable | `!(ld8(ld64(s410) + 0x29) != 0)` | anchor::ConstraintMut |
| 19 | bundle/increase_liquidity.ts:559 | PARTIAL |  | raw | `!((bh as u32) == 0)` | anchor::ConstraintRaw |
| 20 | bundle/increase_liquidity.ts:560 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s418)) + 0x29) != 0)` | anchor::ConstraintMut |
| 21 | bundle/increase_liquidity.ts:563 | PARTIAL |  | token_mint | `(memcmp(ld64(s418) + 8, s120, 0x20) as u32) != 0` | anchor::ConstraintTokenMint |
| 22 | bundle/increase_liquidity.ts:571 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s420)) + 0x29) != 0)` | anchor::ConstraintMut |
| 23 | bundle/increase_liquidity.ts:575 | PARTIAL |  | token_mint | `(bk as u32) != 0` | anchor::ConstraintTokenMint |
| 24 | bundle/increase_liquidity.ts:584 | PARTIAL | token_vault_0 | writable | `token_vault_0.is_writable == 0` | anchor::ConstraintMut |
| 25 | bundle/increase_liquidity.ts:599 | PARTIAL |  | raw | `!((bp as u32) == 0)` | anchor::ConstraintRaw |
| 26 | bundle/increase_liquidity.ts:601 | PARTIAL | token_vault_1 | writable | `token_vault_1.is_writable == 0` | anchor::ConstraintMut |
| 27 | bundle/increase_liquidity.ts:617 | PARTIAL |  | raw | `q != 0` | anchor::ConstraintRaw |
| 28 | bundle/increase_liquidity.ts:863 | PARTIAL | pool_state |  | `f != 2` | return |
| 29 | bundle/increase_liquidity.ts:866 | PARTIAL | personal_position |  | `f != 2` | return |
| 30 | bundle/increase_liquidity.ts:869 | PARTIAL | tick_array_lower |  | `f != 2` | return |
| 31 | bundle/increase_liquidity.ts:872 | PARTIAL | tick_array_upper |  | `f != 2` | return |
| 32 | bundle/increase_liquidity.ts:874 | PARTIAL | token_account_0 | key | `(memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(p) == 0 && ld64` | Err(ProgramError::AccountBorrowFailed) |
| 33 | bundle/increase_liquidity.ts:908 | PARTIAL |  | key | `(memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(s) == 0 && ld64` | Err(ProgramError::AccountBorrowFailed) |
| 34 | shared.ts:1017 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 35 | shared.ts:1035 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 36 | shared.ts:1043 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 37 | entrypoint.ts:487 | found |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 38 | entrypoint.ts:496 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 39 | entrypoint.ts:88 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 40 | entrypoint.ts:106 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 41 | entrypoint.ts:114 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x2a81f931cd559bc0 /* account:TickArrayState */` | anchor::AccountDiscriminatorMismatch |
| 42 | entrypoint.ts:743 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 43 | bundle/increase_liquidity.ts:1695 | found |  | custom | `!((ld8(h + 0x17d) & 1) == 0)` | error::NotApproved |
| 44 | bundle/increase_liquidity.ts:2058 | found |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 45 | bundle/increase_liquidity.ts:2063 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 46 | bundle/increase_liquidity.ts:2074 | found |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 47 | bundle/increase_liquidity.ts:2898 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 48 | bundle/increase_liquidity.ts:3229 | found | tick_array_state | state | `tick_array_state_data.discriminator != 0x2a81f931cd559bc0 /* account:TickArrayState */` | return |
| 49 | bundle/increase_liquidity.ts:3277 | found | tick_array_state_data | state | `tick_array_state_data_3.discriminator != 0x2a81f931cd559bc0 /* account:TickArrayState */` | return |
| 50 | bundle/increase_liquidity.ts:3300 | found |  | discriminator | `!((by as u32) == 0)` | anchor::AccountDiscriminatorNotFound |
| 51 | bundle/increase_liquidity.ts:3494 | PARTIAL |  | custom | `(ld64(s5a8 + 8) \| ld64(s5a8)) == 0` | error::ForbidBothZeroForSupplyLiquidity |
| 52 | bundle/increase_liquidity.ts:3576 | PARTIAL |  | custom | `ld64(s558 + 0x38) > ld64(s510 + 8)` | error::PriceSlippageCheck |
| 53 | bundle/increase_liquidity.ts:3609 | PARTIAL |  | custom | `ed + ee > ld64(s510)` | error::PriceSlippageCheck |
| 54 | bundle/increase_liquidity.ts:4210 | PARTIAL |  | custom | `!(0xd89e9 > ((b + 0x6c4f4) as u32))` | error::TickUpperOverflow |
| 55 | bundle/increase_liquidity.ts:4523 | found |  | writable | `!((c & 1) != 0)` | anchor::AccountNotMutable |
| 56 | bundle/increase_liquidity.ts:4532 | PARTIAL | tick_array_state | state | `tick_array_state_data.discriminator != 0x2a81f931cd559bc0 /* account:TickArrayState */` | return |
| 57 | bundle/increase_liquidity.ts:4533 | PARTIAL |  | discriminator | `g <= 0x27ff` | anchor::AccountDiscriminatorMismatch |
| 58 | shared.ts:14313 | PARTIAL |  | key | `(memcmp(s1a8, se8, 0x20) as u32) != 0` | anchor::RequireKeysEqViolated |
| 59 | shared.ts:14375 | PARTIAL |  | writable | `!(ld8(v + 0x29) != 0)` | anchor::AccountNotMutable |
| 60 | shared.ts:15478 | found |  | custom | `(g as u32) != (b as u32)` | error::InvalidTickArray |
| 61 | shared.ts:10528 | found |  | custom | `0 > (e as i64)` | error::LiquiditySubValueErr |
| 62 | shared.ts:1069 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 63 | shared.ts:1087 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 64 | shared.ts:1095 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x998b8061db24963c /* account:TickArrayBitmapExtension */` | anchor::AccountDiscriminatorMismatch |
| 65 | entrypoint.ts:4230 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 66 | entrypoint.ts:4332 | PARTIAL |  | key | `(memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 67 | shared.ts:10732 | found |  | custom | `!((h \| i) != 0)` | error::ZeroSqrtPrice |
