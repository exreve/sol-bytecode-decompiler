# increase_limit_order

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_increase_limit_order (anchor); 72 functions reachable: ix_increase_limit_order, accounts_increase_limit_order, memcpy, fn_521e8, fn_e7810, anchor_error_from, fn_5608, fn_5bd8, fn_181f8, fn_14b198, fn_14ed60, fn_153158, ….

## Look first

- ⚠ limit_order: writable expected, no check found
- ⚠ input_token_account: writable expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | owner | expected · found | — | — | — | — |
| 1 | pool_state | — | expected · runtime | found (+discriminator found) | — | — |
| 2 | tick_array | — | expected · PARTIAL | found (+discriminator found) | — | — |
| 3 | limit_order | — | expected · NOT FOUND | found (+discriminator found) | — | — |
| 4 | input_token_account | — | expected · NOT FOUND | found (+discriminator found) | — | — |
| 5 | input_vault | — | expected · PARTIAL | — | — | — |
| 6 | input_vault_mint | — | — | — | — | — |
| 7 | input_token_program | — | — | — | — | — |

## Constraints per account

- owner: signer found (bundle/increase_limit_order.ts:263 via try_accounts_17a30)
- pool_state: discriminator found (bundle/increase_limit_order.ts:267 via fn_11e0); owner found (bundle/increase_limit_order.ts:267 via fn_11e0); writable runtime (bundle/increase_limit_order.ts:2992) — written: the runtime rejects changes to a read-only account
- tick_array: discriminator found (bundle/increase_limit_order.ts:271 via fn_13d0); owner found (bundle/increase_limit_order.ts:271 via fn_13d0); writable PARTIAL (bundle/increase_limit_order.ts:419)
- limit_order: owner found (bundle/increase_limit_order.ts:277 via fn_181f8); initialized found (bundle/increase_limit_order.ts:277 via fn_181f8); discriminator found (bundle/increase_limit_order.ts:277 via fn_181f8); writable NOT FOUND
- input_token_account: owner found (bundle/increase_limit_order.ts:318 via try_accounts_1678); discriminator found (bundle/increase_limit_order.ts:318 via try_accounts_1678); initialized found (bundle/increase_limit_order.ts:318 via try_accounts_1678); key PARTIAL (bundle/increase_limit_order.ts:1036); writable NOT FOUND
- input_vault: writable PARTIAL (bundle/increase_limit_order.ts:459)
- input_vault_mint: no checks found
- input_token_program: no checks found

## CPIs

- bundle/increase_limit_order.ts:922 TOKEN_2022_PROGRAM (constant).TransferChecked — amount: ld64(s2f0 + 8), accounts.input_vault_mint.decimals

## PDAs derived

- bundle/increase_limit_order.ts:2779 create_program_address(["pool", *(b + 1), *(b + 0x41), *(b + 0x61), (u != 0 ? b + 0x17f : 1)[..(u != 0) << 1], b[..1]], program *s28)
- bundle/increase_limit_order.ts:2785 find_program_address(["pool_tick_array_bitmap_extension", *s48], program *sc8)

## Operations (account writes)

- bundle/increase_limit_order.ts:2992 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s148 + 0x38) ^ ld64(s268 + 0x38) [conditional]
- bundle/increase_limit_order.ts:2993 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s2a8) [conditional]
- bundle/increase_limit_order.ts:2994 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s2a0) [conditional]
- bundle/increase_limit_order.ts:2995 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s290) [conditional]
- bundle/increase_limit_order.ts:2996 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s298) [conditional]
- bundle/increase_limit_order.ts:2997 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ak ^ al [conditional]
- bundle/increase_limit_order.ts:2998 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ai ^ aj [conditional]
- bundle/increase_limit_order.ts:2999 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ag ^ ah [conditional]
- bundle/increase_limit_order.ts:3000 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ae ^ af [conditional]
- bundle/increase_limit_order.ts:3001 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = am [conditional]
- bundle/increase_limit_order.ts:3002 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ac ^ ad [conditional]
- bundle/increase_limit_order.ts:3003 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = aa ^ ab [conditional]
- bundle/increase_limit_order.ts:3004 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s278) [conditional]
- bundle/increase_limit_order.ts:3005 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s280) [conditional]
- bundle/increase_limit_order.ts:3006 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = ld64(s270) [conditional]
- bundle/increase_limit_order.ts:3008 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap = an ^ v [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/increase_limit_order.ts:922 TOKEN_TRANSFER: 24 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/increase_limit_order.ts:2992 ACCOUNT_DATA_WRITE: 27 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/increase_limit_order.ts:2993 ACCOUNT_DATA_WRITE: 27 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/increase_limit_order.ts:2994 ACCOUNT_DATA_WRITE: 27 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/increase_limit_order.ts:2995 ACCOUNT_DATA_WRITE: 27 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/increase_limit_order.ts:2996 ACCOUNT_DATA_WRITE: 27 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/increase_limit_order.ts:2997 ACCOUNT_DATA_WRITE: 27 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/increase_limit_order.ts:2998 ACCOUNT_DATA_WRITE: 27 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/increase_limit_order.ts:2999 ACCOUNT_DATA_WRITE: 27 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/increase_limit_order.ts:3000 ACCOUNT_DATA_WRITE: 27 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/increase_limit_order.ts:3001 ACCOUNT_DATA_WRITE: 27 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/increase_limit_order.ts:3002 ACCOUNT_DATA_WRITE: 27 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/increase_limit_order.ts:3003 ACCOUNT_DATA_WRITE: 27 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/increase_limit_order.ts:3004 ACCOUNT_DATA_WRITE: 27 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/increase_limit_order.ts:3005 ACCOUNT_DATA_WRITE: 27 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/increase_limit_order.ts:3006 ACCOUNT_DATA_WRITE: 27 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)
- bundle/increase_limit_order.ts:3008 ACCOUNT_DATA_WRITE: 27 dominating checks (signer owner; discriminator pool_state; owner pool_state; discriminator tick_array; owner tick_array; owner limit_order; initialized limit_order; discriminator limit_order; …)

## Authority (who enables each value movement / authority change)

- bundle/increase_limit_order.ts:922 TOKEN_TRANSFER: signer owner (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/increase_limit_order.ts:922 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer owner (found)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_2022_PROGRAM
  - [found] relevant checks on every path — 25 dominating checks
- bundle/increase_limit_order.ts:2992 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer owner accounts_increase_limit_order:12; custom  fn_521e8:6; custom  fn_521e8:17
- bundle/increase_limit_order.ts:2993 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer owner accounts_increase_limit_order:12; custom  fn_521e8:6; custom  fn_521e8:17
- bundle/increase_limit_order.ts:2994 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer owner accounts_increase_limit_order:12; custom  fn_521e8:6; custom  fn_521e8:17
- bundle/increase_limit_order.ts:2995 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer owner accounts_increase_limit_order:12; custom  fn_521e8:6; custom  fn_521e8:17
- bundle/increase_limit_order.ts:2996 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer owner accounts_increase_limit_order:12; custom  fn_521e8:6; custom  fn_521e8:17
- bundle/increase_limit_order.ts:2997 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer owner accounts_increase_limit_order:12; custom  fn_521e8:6; custom  fn_521e8:17

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/increase_limit_order.ts:922 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked ⇐ signer owner (found)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/increase_limit_order.ts:922 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked: ✗ `g != 2` · `g == 2` · ✗ `t > s` · ✗ `g != 2` · ✗ `g != 2` · ✗ `ld64(s240) != 0` · `g == 2` · `(ld8(g + 0x17d) & 0x30) == 0` #19 · ✗ `ld64(s240) != 0` · `c != 0` #18 · … 2 more
- bundle/increase_limit_order.ts:2992 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ai` · ✗ `ld64(s240) != 0` · ✗ `ld64(s330 + 0x18) != 0` · ✗ `(ld64(s330 + 0x38) & 1) != 0` · ✗ `g != 2` · `g == 2` · ✗ `t > s` · … 9 more
- bundle/increase_limit_order.ts:2993 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ai` · ✗ `ld64(s240) != 0` · ✗ `ld64(s330 + 0x18) != 0` · ✗ `(ld64(s330 + 0x38) & 1) != 0` · ✗ `g != 2` · `g == 2` · ✗ `t > s` · … 9 more
- bundle/increase_limit_order.ts:2994 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ai` · ✗ `ld64(s240) != 0` · ✗ `ld64(s330 + 0x18) != 0` · ✗ `(ld64(s330 + 0x38) & 1) != 0` · ✗ `g != 2` · `g == 2` · ✗ `t > s` · … 9 more
- bundle/increase_limit_order.ts:2995 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ai` · ✗ `ld64(s240) != 0` · ✗ `ld64(s330 + 0x18) != 0` · ✗ `(ld64(s330 + 0x38) & 1) != 0` · ✗ `g != 2` · `g == 2` · ✗ `t > s` · … 9 more
- bundle/increase_limit_order.ts:2996 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ai` · ✗ `ld64(s240) != 0` · ✗ `ld64(s330 + 0x18) != 0` · ✗ `(ld64(s330 + 0x38) & 1) != 0` · ✗ `g != 2` · `g == 2` · ✗ `t > s` · … 9 more
- bundle/increase_limit_order.ts:2997 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ai` · ✗ `ld64(s240) != 0` · ✗ `ld64(s330 + 0x18) != 0` · ✗ `(ld64(s330 + 0x38) & 1) != 0` · ✗ `g != 2` · `g == 2` · ✗ `t > s` · … 9 more
- bundle/increase_limit_order.ts:2998 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ai` · ✗ `ld64(s240) != 0` · ✗ `ld64(s330 + 0x18) != 0` · ✗ `(ld64(s330 + 0x38) & 1) != 0` · ✗ `g != 2` · `g == 2` · ✗ `t > s` · … 9 more
- bundle/increase_limit_order.ts:2999 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ai` · ✗ `ld64(s240) != 0` · ✗ `ld64(s330 + 0x18) != 0` · ✗ `(ld64(s330 + 0x38) & 1) != 0` · ✗ `g != 2` · `g == 2` · ✗ `t > s` · … 9 more
- bundle/increase_limit_order.ts:3000 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ai` · ✗ `ld64(s240) != 0` · ✗ `ld64(s330 + 0x18) != 0` · ✗ `(ld64(s330 + 0x38) & 1) != 0` · ✗ `g != 2` · `g == 2` · ✗ `t > s` · … 9 more
- bundle/increase_limit_order.ts:3001 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ai` · ✗ `ld64(s240) != 0` · ✗ `ld64(s330 + 0x18) != 0` · ✗ `(ld64(s330 + 0x38) & 1) != 0` · ✗ `g != 2` · `g == 2` · ✗ `t > s` · … 9 more
- bundle/increase_limit_order.ts:3002 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ai` · ✗ `ld64(s240) != 0` · ✗ `ld64(s330 + 0x18) != 0` · ✗ `(ld64(s330 + 0x38) & 1) != 0` · ✗ `g != 2` · `g == 2` · ✗ `t > s` · … 9 more
- bundle/increase_limit_order.ts:3003 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ai` · ✗ `ld64(s240) != 0` · ✗ `ld64(s330 + 0x18) != 0` · ✗ `(ld64(s330 + 0x38) & 1) != 0` · ✗ `g != 2` · `g == 2` · ✗ `t > s` · … 9 more
- bundle/increase_limit_order.ts:3004 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ai` · ✗ `ld64(s240) != 0` · ✗ `ld64(s330 + 0x18) != 0` · ✗ `(ld64(s330 + 0x38) & 1) != 0` · ✗ `g != 2` · `g == 2` · ✗ `t > s` · … 9 more
- bundle/increase_limit_order.ts:3005 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ai` · ✗ `ld64(s240) != 0` · ✗ `ld64(s330 + 0x18) != 0` · ✗ `(ld64(s330 + 0x38) & 1) != 0` · ✗ `g != 2` · `g == 2` · ✗ `t > s` · … 9 more
- bundle/increase_limit_order.ts:3006 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > ai` · ✗ `ld64(s240) != 0` · ✗ `ld64(s330 + 0x18) != 0` · ✗ `(ld64(s330 + 0x38) & 1) != 0` · ✗ `g != 2` · `g == 2` · ✗ `t > s` · … 9 more

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): owner.key, pool_state.key, tick_array.key, limit_order.key, input_vault.key, input_vault_mint.key, input_token_program.key, ix.amount
- pool_state.data: validated (owner found @accounts_increase_limit_order:16, discriminator found @accounts_increase_limit_order:16)
- tick_array.data: validated (owner found @accounts_increase_limit_order:20, discriminator found @accounts_increase_limit_order:20)
- limit_order.data: validated (owner found @accounts_increase_limit_order:26, discriminator found @accounts_increase_limit_order:26, initialized found @accounts_increase_limit_order:26)
- input_token_account.key: partially-validated (key partial @fn_e7810:38)
- input_token_account.data: validated (owner found @accounts_increase_limit_order:67, discriminator found @accounts_increase_limit_order:67, initialized found @accounts_increase_limit_order:67)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/increase_limit_order.ts:263 | found | owner | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/increase_limit_order.ts:267 | found | pool_state | discriminator, owner (via fn_11e0 (count, discriminator, owner)) | `f != 2` | return |
| 2 | bundle/increase_limit_order.ts:271 | found | tick_array | discriminator, owner (via fn_13d0 (count, discriminator, owner)) | `f != 2` | return |
| 3 | bundle/increase_limit_order.ts:277 | found | limit_order | owner, initialized, discriminator (via fn_181f8 (count, owner, initialized, discriminator)) | `q == 2` | return |
| 4 | bundle/increase_limit_order.ts:318 | found | input_token_account | owner, discriminator, initialized (via try_accounts_1678 (count, owner, discriminator, initialized)) | `ld32(sc8 + 0xa0) == 2` | return |
| 5 | bundle/increase_limit_order.ts:389 | found |  | writable | `ai == 2` | anchor::ConstraintMut |
| 6 | bundle/increase_limit_order.ts:418 | PARTIAL | pool_state | writable | `pool_state.is_writable == 0` | anchor::ConstraintMut |
| 7 | bundle/increase_limit_order.ts:419 | PARTIAL | tick_array | writable | `tick_array.is_writable == 0` | anchor::ConstraintMut |
| 8 | bundle/increase_limit_order.ts:434 | PARTIAL |  | raw | `!((at as u32) == 0)` | anchor::ConstraintRaw |
| 9 | bundle/increase_limit_order.ts:435 | PARTIAL |  | writable | `!(ld8(ld64(s4e8) + 0x29) != 0)` | anchor::ConstraintMut |
| 10 | bundle/increase_limit_order.ts:438 | PARTIAL |  | raw | `!((au as u32) == 0)` | anchor::ConstraintRaw |
| 11 | bundle/increase_limit_order.ts:443 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s4f8) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 12 | bundle/increase_limit_order.ts:445 | PARTIAL |  | token_owner | `(memcmp(ld64(s4f8) + 0x48, sd8, 0x20) as u32) != 0` | anchor::ConstraintTokenOwner |
| 13 | bundle/increase_limit_order.ts:457 | PARTIAL |  | token_mint | `!((bb as u32) == 0)` | anchor::ConstraintTokenMint |
| 14 | bundle/increase_limit_order.ts:459 | PARTIAL | input_vault | writable | `input_vault.is_writable == 0` | anchor::ConstraintMut |
| 15 | bundle/increase_limit_order.ts:491 | PARTIAL |  | raw | `!((bl as u32) == 0)` | anchor::ConstraintRaw |
| 16 | bundle/increase_limit_order.ts:497 | PARTIAL |  | key, address | `(memcmp(s158, s138, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 17 | bundle/increase_limit_order.ts:517 | PARTIAL |  | key, address | `!((memcmp(s118, sf8, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 18 | bundle/increase_limit_order.ts:724 | found |  | custom | `c == 0` | error::ZeroAmountSpecified |
| 19 | bundle/increase_limit_order.ts:735 | found |  | custom | `!((ld8(g + 0x17d) & 0x30) == 0)` | error::NotApproved |
| 20 | bundle/increase_limit_order.ts:1004 | PARTIAL | pool_state |  | `f != 2` | return |
| 21 | bundle/increase_limit_order.ts:1029 | PARTIAL | tick_array |  | `f != 2` | return |
| 22 | bundle/increase_limit_order.ts:1033 | PARTIAL | limit_order |  | `f != 2` | return |
| 23 | bundle/increase_limit_order.ts:1036 | PARTIAL | input_token_account | key | `(memcmp(g, c, 0x20) as u32) == 0 && (common_is_closed(h) == 0 && ld64(ld64(h + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 24 | shared.ts:1017 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 25 | shared.ts:1035 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 26 | shared.ts:1043 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 27 | entrypoint.ts:88 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 28 | entrypoint.ts:106 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 29 | entrypoint.ts:114 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x2a81f931cd559bc0 /* account:TickArrayState */` | anchor::AccountDiscriminatorMismatch |
| 30 | bundle/increase_limit_order.ts:1225 | found |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 31 | bundle/increase_limit_order.ts:1354 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 32 | bundle/increase_limit_order.ts:1365 | found |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 33 | bundle/increase_limit_order.ts:2114 | found |  | custom | `!(0xd89e7 > ((b + 0x6c4f3) as u32))` | error::InvalidTickIndex |
| 34 | bundle/increase_limit_order.ts:2119 | found |  | custom | `f != 0` | error::TickAndSpacingNotMatch |
| 35 | bundle/increase_limit_order.ts:2205 | found |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 36 | bundle/increase_limit_order.ts:2210 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 37 | bundle/increase_limit_order.ts:2221 | found |  | discriminator | `j != 0x2a81f931cd559bc0 /* account:TickArrayState */` | anchor::AccountDiscriminatorMismatch |
| 38 | bundle/increase_limit_order.ts:2402 | found |  | custom | `ld64(b + 0x40) != ld64(c + 0x74)` | error::InvalidOrderPhase |
| 39 | bundle/increase_limit_order.ts:2487 | found |  | custom | `b == 0` | error::ZeroAmountSpecified |
| 40 | bundle/increase_limit_order.ts:2626 | PARTIAL |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 41 | bundle/increase_limit_order.ts:2631 | PARTIAL |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 42 | bundle/increase_limit_order.ts:2642 | PARTIAL |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 43 | bundle/increase_limit_order.ts:2788 | PARTIAL |  | key | `(memcmp(s1a8, se8, 0x20) as u32) != 0` | anchor::RequireKeysEqViolated |
| 44 | bundle/increase_limit_order.ts:2850 | PARTIAL |  | writable | `!(ld8(v + 0x29) != 0)` | anchor::AccountNotMutable |
| 45 | entrypoint.ts:4230 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 46 | bundle/increase_limit_order.ts:3261 | found |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 47 | bundle/increase_limit_order.ts:3270 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 48 | bundle/increase_limit_order.ts:3359 | found |  | custom | `(g as u32) != (b as u32)` | error::InvalidTickArray |
| 49 | bundle/increase_limit_order.ts:3528 | found |  | custom | `!(0xd89e9 > ((b + 0x6c4f4) as u32))` | error::TickUpperOverflow |
| 50 | bundle/increase_limit_order.ts:3945 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 51 | bundle/increase_limit_order.ts:3963 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 52 | bundle/increase_limit_order.ts:3971 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x998b8061db24963c /* account:TickArrayBitmapExtension */` | anchor::AccountDiscriminatorMismatch |
| 53 | bundle/increase_limit_order.ts:4177 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
