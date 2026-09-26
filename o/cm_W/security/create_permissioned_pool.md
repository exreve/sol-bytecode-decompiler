# create_permissioned_pool

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_create_permissioned_pool (anchor); 75 functions reachable: ix_create_permissioned_pool, fn_f75f0, accounts_create_permissioned_pool, memcpy, fn_569a8, fn_100310, fn_14d660, fn_125710, fn_11e480, fn_14ed60, fn_154c88, anchor_error_from, ….

## Look first

- ⚠ permission: pda expected, no check found
- ⚠ pool_state: pda expected, no check found
- ⚠ token_vault_0: pda expected, no check found
- ⚠ token_vault_0: writable expected, no check found
- ⚠ token_vault_1: pda expected, no check found
- ⚠ token_vault_1: writable expected, no check found
- ⚠ observation_state: pda expected, no check found
- ⚠ observation_state: writable expected, no check found
- ⚠ tick_array_bitmap: pda expected, no check found
- ⚠ tick_array_bitmap: writable expected, no check found
- ⚠ system_program: address expected, no check found
- ⚠ rent: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | payer | expected · found | expected · PARTIAL | — | — | — |
| 1 | pool_creator | — | — | — | — | — |
| 2 | permission | — | — | found (+discriminator found) | — | — |
| 3 | amm_config | — | — | found (+discriminator found) | — | — |
| 4 | pool_state | — | expected · runtime | runtime | — | — |
| 5 | token_mint_0 | — | — | — | — | — |
| 6 | token_mint_1 | — | — | — | — | — |
| 7 | token_vault_0 | — | expected · NOT FOUND | — | — | — |
| 8 | token_vault_1 | — | expected · NOT FOUND | — | — | — |
| 9 | observation_state | — | expected · NOT FOUND | — | — | — |
| 10 | tick_array_bitmap | — | expected · NOT FOUND | — | — | — |
| 11 | token_program_0 | — | — | — | — | — |
| 12 | token_program_1 | — | — | — | — | — |
| 13 | system_program | — | — | — | — | = 11111111… · expected · NOT FOUND |
| 14 | rent | — | — | — | — | = SysvarRe… · expected · NOT FOUND |

## Constraints per account

- payer: signer found (bundle/create_permissioned_pool.ts:335 via try_accounts_17a30); writable PARTIAL (bundle/create_permissioned_pool.ts:811)
- pool_creator: no checks found
- permission: owner found (bundle/create_permissioned_pool.ts:380 via try_accounts_18700); initialized found (bundle/create_permissioned_pool.ts:380 via try_accounts_18700); discriminator found (bundle/create_permissioned_pool.ts:380 via try_accounts_18700); pda NOT FOUND
- amm_config: owner found (bundle/create_permissioned_pool.ts:412 via try_accounts_184d8); initialized found (bundle/create_permissioned_pool.ts:412 via try_accounts_184d8); discriminator found (bundle/create_permissioned_pool.ts:412 via try_accounts_184d8)
- pool_state: writable runtime (bundle/create_permissioned_pool.ts:1479) — written: the runtime rejects changes to a read-only account; owner runtime (bundle/create_permissioned_pool.ts:1479) — data written / lamports debited: only the owner program may (the runtime rejects it otherwise); pda NOT FOUND
- token_mint_0: no checks found
- token_mint_1: no checks found
- token_vault_0: writable NOT FOUND; pda NOT FOUND
- token_vault_1: writable NOT FOUND; pda NOT FOUND
- observation_state: writable NOT FOUND; pda NOT FOUND
- tick_array_bitmap: writable NOT FOUND; pda NOT FOUND
- token_program_0: no checks found
- token_program_1: no checks found
- system_program: address NOT FOUND
- rent: address NOT FOUND

## CPIs

- shared.ts:19075 [conditional] SYSTEM_PROGRAM (constant).CreateAccount — lamports: j, ci, b
- shared.ts:19147 [conditional] SYSTEM_PROGRAM (constant).Transfer — accounts from: payer s, to: ? — lamports: cj
- shared.ts:19198 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: ci — PDA signer: ? (1 seeds)
- shared.ts:19225 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: b — PDA signer: ? (1 seeds)
- shared.ts:24806 program not decoded
  - return invoke_signed(a, b, c, d, fp)

## PDAs derived

- bundle/create_permissioned_pool.ts:2925 find_program_address(["support_mint", *s128], program *s108)
- compared with provided accounts: permission NOT FOUND, pool_state NOT FOUND, token_vault_0 NOT FOUND, token_vault_1 NOT FOUND, observation_state NOT FOUND, tick_array_bitmap NOT FOUND

## Operations (account writes)

- bundle/create_permissioned_pool.ts:1479 ACCOUNT_DATA_WRITE pool_state.data[391..393] = ld64(s220 + 0x18) [conditional]
- bundle/create_permissioned_pool.ts:3590 ACCOUNT_DATA_WRITE pool_state.data[8..9] = c [conditional]
- bundle/create_permissioned_pool.ts:3593 ACCOUNT_DATA_WRITE pool_state.data[33..41] = ld64(g + 0x18) [conditional]
- bundle/create_permissioned_pool.ts:3594 ACCOUNT_DATA_WRITE pool_state.data[25..33] = ld64(g + 0x10) [conditional]
- bundle/create_permissioned_pool.ts:3595 ACCOUNT_DATA_WRITE pool_state.data[17..25] = ld64(g + 8) [conditional]
- bundle/create_permissioned_pool.ts:3596 ACCOUNT_DATA_WRITE pool_state.data[9..17] = ld64(g) [conditional]
- bundle/create_permissioned_pool.ts:3601 ACCOUNT_DATA_WRITE pool_state.data[97..105] = ld64(j + 0x18) [conditional]
- bundle/create_permissioned_pool.ts:3602 ACCOUNT_DATA_WRITE pool_state.data[89..97] = ld64(j + 0x10) [conditional]
- bundle/create_permissioned_pool.ts:3603 ACCOUNT_DATA_WRITE pool_state.data[81..89] = ld64(j + 8) [conditional]
- bundle/create_permissioned_pool.ts:3604 ACCOUNT_DATA_WRITE pool_state.data[73..81] = ld64(j) [conditional]
- bundle/create_permissioned_pool.ts:3607 ACCOUNT_DATA_WRITE pool_state.data[129..137] = ld64(l + 0x18) [conditional]
- bundle/create_permissioned_pool.ts:3608 ACCOUNT_DATA_WRITE pool_state.data[121..129] = ld64(l + 0x10) [conditional]
- bundle/create_permissioned_pool.ts:3609 ACCOUNT_DATA_WRITE pool_state.data[113..121] = ld64(l + 8) [conditional]
- bundle/create_permissioned_pool.ts:3610 ACCOUNT_DATA_WRITE pool_state.data[105..113] = ld64(l) [conditional]
- bundle/create_permissioned_pool.ts:3611 ACCOUNT_DATA_WRITE pool_state.data[233..234] = ld8(i + 0x30) [conditional]
- bundle/create_permissioned_pool.ts:3612 ACCOUNT_DATA_WRITE pool_state.data[234..235] = ld8(k + 0x30) [conditional]
- bundle/create_permissioned_pool.ts:3614 ACCOUNT_DATA_WRITE pool_state.data[161..169] = ld64(m + 0x18) [conditional]
- bundle/create_permissioned_pool.ts:3615 ACCOUNT_DATA_WRITE pool_state.data[153..161] = ld64(m + 0x10) [conditional]
- bundle/create_permissioned_pool.ts:3616 ACCOUNT_DATA_WRITE pool_state.data[145..153] = ld64(m + 8) [conditional]
- bundle/create_permissioned_pool.ts:3617 ACCOUNT_DATA_WRITE pool_state.data[137..145] = ld64(m) [conditional]
- bundle/create_permissioned_pool.ts:3620 ACCOUNT_DATA_WRITE pool_state.data[235..237] = ld16(f + 0x72) [conditional]
- bundle/create_permissioned_pool.ts:3621 ACCOUNT_DATA_WRITE pool_state.data[253..269] = d, p5 [conditional]
- bundle/create_permissioned_pool.ts:3622 ACCOUNT_DATA_WRITE pool_state.data[269..273] = p7 [conditional]
- bundle/create_permissioned_pool.ts:3623 ACCOUNT_DATA_WRITE pool_state.data[237..253] = 0, 0 [conditional]
- bundle/create_permissioned_pool.ts:3624 ACCOUNT_DATA_WRITE pool_state.data[273..277] = 0 [conditional]
- bundle/create_permissioned_pool.ts:3628 ACCOUNT_DATA_WRITE pool_state.data[558..566] = 0 [conditional]
- bundle/create_permissioned_pool.ts:3629 ACCOUNT_DATA_WRITE pool_state.data[550..558] = 0 [conditional]
- bundle/create_permissioned_pool.ts:3631 ACCOUNT_DATA_WRITE pool_state.data[727..735] = 0 [conditional]
- bundle/create_permissioned_pool.ts:3632 ACCOUNT_DATA_WRITE pool_state.data[719..727] = 0 [conditional]
- bundle/create_permissioned_pool.ts:3634 ACCOUNT_DATA_WRITE pool_state.data[896..904] = 0 [conditional]
- bundle/create_permissioned_pool.ts:3635 ACCOUNT_DATA_WRITE pool_state.data[888..896] = 0 [conditional]
- bundle/create_permissioned_pool.ts:3637 ACCOUNT_DATA_WRITE pool_state.data[390..391] = p15 [conditional]
- bundle/create_permissioned_pool.ts:3638 ACCOUNT_DATA_WRITE pool_state.data[393..397] = 0 [conditional]
- bundle/create_permissioned_pool.ts:3639 ACCOUNT_DATA_WRITE pool_state.data[391..393] = 0 [conditional]
- bundle/create_permissioned_pool.ts:3641 ACCOUNT_DATA_WRITE pool_state.data[1080..1088] = p6 [conditional]
- bundle/create_permissioned_pool.ts:3660 ACCOUNT_DATA_WRITE pool_state.data[1088..1176] = r, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 [conditional]
- bundle/create_permissioned_pool.ts:3664 ACCOUNT_DATA_WRITE pool_state.data[225..233] = r [conditional]
- bundle/create_permissioned_pool.ts:4640 ACCOUNT_DATA_WRITE pool_state.data[1106..1110] = f [conditional]
- bundle/create_permissioned_pool.ts:4641 ACCOUNT_DATA_WRITE pool_state.data[1102..1106] = j [conditional]
- bundle/create_permissioned_pool.ts:4642 ACCOUNT_DATA_WRITE pool_state.data[1100..1102] = i [conditional]
- bundle/create_permissioned_pool.ts:4643 ACCOUNT_DATA_WRITE pool_state.data[1098..1100] = h [conditional]
- bundle/create_permissioned_pool.ts:4644 ACCOUNT_DATA_WRITE pool_state.data[1096..1098] = d [conditional]
- bundle/create_permissioned_pool.ts:4645 ACCOUNT_DATA_WRITE pool_state.data[1168..1176] = 0 [conditional]
- bundle/create_permissioned_pool.ts:4646 ACCOUNT_DATA_WRITE pool_state.data[1162..1170] = 0 [conditional]
- bundle/create_permissioned_pool.ts:4647 ACCOUNT_DATA_WRITE pool_state.data[1154..1162] = 0 [conditional]
- bundle/create_permissioned_pool.ts:4648 ACCOUNT_DATA_WRITE pool_state.data[1146..1154] = 0 [conditional]
- bundle/create_permissioned_pool.ts:4649 ACCOUNT_DATA_WRITE pool_state.data[1138..1146] = 0 [conditional]
- bundle/create_permissioned_pool.ts:4650 ACCOUNT_DATA_WRITE pool_state.data[1130..1138] = 0 [conditional]
- bundle/create_permissioned_pool.ts:4651 ACCOUNT_DATA_WRITE pool_state.data[1122..1130] = 0 [conditional]
- bundle/create_permissioned_pool.ts:4652 ACCOUNT_DATA_WRITE pool_state.data[1114..1122] = 0 [conditional]
- bundle/create_permissioned_pool.ts:4656 ACCOUNT_DATA_WRITE pool_state.data[1110..1114] = l [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/create_permissioned_pool.ts:1479 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)
- bundle/create_permissioned_pool.ts:3590 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)
- bundle/create_permissioned_pool.ts:3593 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)
- bundle/create_permissioned_pool.ts:3594 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)
- bundle/create_permissioned_pool.ts:3595 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)
- bundle/create_permissioned_pool.ts:3596 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)
- bundle/create_permissioned_pool.ts:3601 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)
- bundle/create_permissioned_pool.ts:3602 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)
- bundle/create_permissioned_pool.ts:3603 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)
- bundle/create_permissioned_pool.ts:3604 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)
- bundle/create_permissioned_pool.ts:3607 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)
- bundle/create_permissioned_pool.ts:3608 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)
- bundle/create_permissioned_pool.ts:3609 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)
- bundle/create_permissioned_pool.ts:3610 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)
- bundle/create_permissioned_pool.ts:3611 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)
- bundle/create_permissioned_pool.ts:3612 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)
- bundle/create_permissioned_pool.ts:3614 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)
- bundle/create_permissioned_pool.ts:3615 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)
- bundle/create_permissioned_pool.ts:3616 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)
- bundle/create_permissioned_pool.ts:3617 ACCOUNT_DATA_WRITE: 17 dominating checks (signer payer; owner permission; initialized permission; discriminator permission; owner amm_config; initialized amm_config; discriminator amm_config; custom; …)

## Authority (who enables each value movement / authority change)

- shared.ts:19147 LAMPORT_TRANSFER: signer payer (found)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE: signer payer (found); pda PDA signature ? (1 seeds)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE: signer payer (found); pda PDA signature ? (1 seeds)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/create_permissioned_pool.ts:1479 ACCOUNT_DATA_WRITE pool_state.data[391..393] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer payer accounts_create_permissioned_pool:24; custom  fn_569a8:142; key/initialized  fn_c038:5
- bundle/create_permissioned_pool.ts:3590 ACCOUNT_DATA_WRITE pool_state.data[8..9] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer payer accounts_create_permissioned_pool:24; custom  fn_569a8:142; key/initialized  fn_c038:5
- bundle/create_permissioned_pool.ts:3593 ACCOUNT_DATA_WRITE pool_state.data[33..41] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer payer accounts_create_permissioned_pool:24; custom  fn_569a8:142; key/initialized  fn_c038:5
- bundle/create_permissioned_pool.ts:3594 ACCOUNT_DATA_WRITE pool_state.data[25..33] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer payer accounts_create_permissioned_pool:24; custom  fn_569a8:142; key/initialized  fn_c038:5
- bundle/create_permissioned_pool.ts:3595 ACCOUNT_DATA_WRITE pool_state.data[17..25] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer payer accounts_create_permissioned_pool:24; custom  fn_569a8:142; key/initialized  fn_c038:5
- bundle/create_permissioned_pool.ts:3596 ACCOUNT_DATA_WRITE pool_state.data[9..17] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer payer accounts_create_permissioned_pool:24; custom  fn_569a8:142; key/initialized  fn_c038:5
- shared.ts:19147 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer [LAMPORT_TRANSFER]
  - [found] debited account authorized (signer / PDA / owned by the program) — payer: signer found
  - [found] authorized (signer / PDA signature / stored authority) — signer payer (found)
  - [found] amount arithmetic checked — sat_sub(j, h) (saturating)
  - [found] relevant checks on every path — 16 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- shared.ts:19147 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer ⇐ signer payer (found)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer payer (found)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer payer (found)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/create_permissioned_pool.ts:1479 ACCOUNT_DATA_WRITE pool_state.data[391..393]: ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `(ld8(s101 + 1) & 1) == 0` · `i == 2` · ✗ `(ld8(s101 + 1) & 1) == 0` #27 · … 7 more
- bundle/create_permissioned_pool.ts:3590 ACCOUNT_DATA_WRITE pool_state.data[8..9]: ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `(ld8(s101 + 1) & 1) == 0` · `i == 2` · ✗ `(ld8(s101 + 1) & 1) == 0` #27 · ✗ `i != 2` · … 6 more
- bundle/create_permissioned_pool.ts:3593 ACCOUNT_DATA_WRITE pool_state.data[33..41]: ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `(ld8(s101 + 1) & 1) == 0` · `i == 2` · ✗ `(ld8(s101 + 1) & 1) == 0` #27 · ✗ `i != 2` · … 6 more
- bundle/create_permissioned_pool.ts:3594 ACCOUNT_DATA_WRITE pool_state.data[25..33]: ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `(ld8(s101 + 1) & 1) == 0` · `i == 2` · ✗ `(ld8(s101 + 1) & 1) == 0` #27 · ✗ `i != 2` · … 6 more
- bundle/create_permissioned_pool.ts:3595 ACCOUNT_DATA_WRITE pool_state.data[17..25]: ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `(ld8(s101 + 1) & 1) == 0` · `i == 2` · ✗ `(ld8(s101 + 1) & 1) == 0` #27 · ✗ `i != 2` · … 6 more
- bundle/create_permissioned_pool.ts:3596 ACCOUNT_DATA_WRITE pool_state.data[9..17]: ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `(ld8(s101 + 1) & 1) == 0` · `i == 2` · ✗ `(ld8(s101 + 1) & 1) == 0` #27 · ✗ `i != 2` · … 6 more
- bundle/create_permissioned_pool.ts:3601 ACCOUNT_DATA_WRITE pool_state.data[97..105]: ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `(ld8(s101 + 1) & 1) == 0` · `i == 2` · ✗ `(ld8(s101 + 1) & 1) == 0` #27 · ✗ `i != 2` · … 6 more
- bundle/create_permissioned_pool.ts:3602 ACCOUNT_DATA_WRITE pool_state.data[89..97]: ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `(ld8(s101 + 1) & 1) == 0` · `i == 2` · ✗ `(ld8(s101 + 1) & 1) == 0` #27 · ✗ `i != 2` · … 6 more
- bundle/create_permissioned_pool.ts:3603 ACCOUNT_DATA_WRITE pool_state.data[81..89]: ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `(ld8(s101 + 1) & 1) == 0` · `i == 2` · ✗ `(ld8(s101 + 1) & 1) == 0` #27 · ✗ `i != 2` · … 6 more
- bundle/create_permissioned_pool.ts:3604 ACCOUNT_DATA_WRITE pool_state.data[73..81]: ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `(ld8(s101 + 1) & 1) == 0` · `i == 2` · ✗ `(ld8(s101 + 1) & 1) == 0` #27 · ✗ `i != 2` · … 6 more
- bundle/create_permissioned_pool.ts:3607 ACCOUNT_DATA_WRITE pool_state.data[129..137]: ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `(ld8(s101 + 1) & 1) == 0` · `i == 2` · ✗ `(ld8(s101 + 1) & 1) == 0` #27 · ✗ `i != 2` · … 6 more
- bundle/create_permissioned_pool.ts:3608 ACCOUNT_DATA_WRITE pool_state.data[121..129]: ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `(ld8(s101 + 1) & 1) == 0` · `i == 2` · ✗ `(ld8(s101 + 1) & 1) == 0` #27 · ✗ `i != 2` · … 6 more
- bundle/create_permissioned_pool.ts:3609 ACCOUNT_DATA_WRITE pool_state.data[113..121]: ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `(ld8(s101 + 1) & 1) == 0` · `i == 2` · ✗ `(ld8(s101 + 1) & 1) == 0` #27 · ✗ `i != 2` · … 6 more
- bundle/create_permissioned_pool.ts:3610 ACCOUNT_DATA_WRITE pool_state.data[105..113]: ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `(ld8(s101 + 1) & 1) == 0` · `i == 2` · ✗ `(ld8(s101 + 1) & 1) == 0` #27 · ✗ `i != 2` · … 6 more
- bundle/create_permissioned_pool.ts:3611 ACCOUNT_DATA_WRITE pool_state.data[233..234]: ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `(ld8(s101 + 1) & 1) == 0` · `i == 2` · ✗ `(ld8(s101 + 1) & 1) == 0` #27 · ✗ `i != 2` · … 6 more
- bundle/create_permissioned_pool.ts:3612 ACCOUNT_DATA_WRITE pool_state.data[234..235]: ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s108) != 0` · ✗ `(ld8(s101 + 1) & 1) == 0` · `i == 2` · ✗ `(ld8(s101 + 1) & 1) == 0` #27 · ✗ `i != 2` · … 6 more

## Arithmetic on value paths

- shared.ts:19110 SYSTEM_PROGRAM.Transfer.lamports ← `sat_sub(j, h)`: saturating

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): payer.key, pool_creator.key, permission.key, amm_config.key, pool_state.key, token_mint_0.key, token_mint_1.key, token_vault_0.key, token_vault_1.key, observation_state.key, tick_array_bitmap.key, token_program_0.key, token_program_1.key, system_program.key, rent.key, ix.customizable_params, ix.seed_index
- permission.data: validated (owner found @accounts_create_permissioned_pool:69, discriminator found @accounts_create_permissioned_pool:69, initialized found @accounts_create_permissioned_pool:69)
- amm_config.data: validated (owner found @accounts_create_permissioned_pool:101, discriminator found @accounts_create_permissioned_pool:101, initialized found @accounts_create_permissioned_pool:101)
- pool_state.data: runtime (owner runtime @fn_569a8:313)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/create_permissioned_pool.ts:335 | found | payer | signer (via try_accounts_17a30 (count, signer)) | `n != 2` | return |
| 1 | bundle/create_permissioned_pool.ts:380 | found | permission | owner, initialized, discriminator (via try_accounts_18700 (count, owner, initialized, discriminator)) | `x == 0` | return |
| 2 | bundle/create_permissioned_pool.ts:412 | found | amm_config | owner, initialized, discriminator (via try_accounts_184d8 (count, owner, initialized, discriminator)) | `ld64(s500) == 0` | return |
| 3 | bundle/create_permissioned_pool.ts:452 | found |  | count | `af == 0` | anchor::AccountNotEnoughKeys |
| 4 | bundle/create_permissioned_pool.ts:492 | found |  | count | `ar == 2` | anchor::AccountNotEnoughKeys |
| 5 | bundle/create_permissioned_pool.ts:507 | PARTIAL |  | count | `at == 0` | anchor::AccountNotEnoughKeys |
| 6 | bundle/create_permissioned_pool.ts:555 | PARTIAL |  | count | `ax == 2` | anchor::AccountNotEnoughKeys |
| 7 | bundle/create_permissioned_pool.ts:586 | PARTIAL |  | count | `ay == 1` | anchor::AccountNotEnoughKeys |
| 8 | bundle/create_permissioned_pool.ts:595 | PARTIAL |  | pda | `bb == 2` | anchor::ConstraintSeeds |
| 9 | bundle/create_permissioned_pool.ts:610 | PARTIAL |  | pda | `be == 2` | anchor::ConstraintSeeds |
| 10 | bundle/create_permissioned_pool.ts:625 | PARTIAL |  | pda | `bh == 2` | anchor::ConstraintSeeds |
| 11 | bundle/create_permissioned_pool.ts:692 | PARTIAL |  | key, pda | `!((memcmp(s250, s298, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 12 | bundle/create_permissioned_pool.ts:702 | PARTIAL | pool_state | writable | `pool_state.is_writable == 0` | anchor::ConstraintMut |
| 13 | bundle/create_permissioned_pool.ts:712 | PARTIAL |  | rent_exempt | `bz == 0` | anchor::ConstraintRentExempt |
| 14 | bundle/create_permissioned_pool.ts:735 | PARTIAL |  | key, pda | `!((memcmp(s1b0, s1f8, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 15 | bundle/create_permissioned_pool.ts:741 | PARTIAL |  | writable | `!(ld8(ld64(s960 + 0x28) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 16 | bundle/create_permissioned_pool.ts:760 | PARTIAL |  | rent_exempt | `ck == 0` | anchor::ConstraintRentExempt |
| 17 | bundle/create_permissioned_pool.ts:785 | PARTIAL |  | key, pda | `!((memcmp(s150, s178, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 18 | bundle/create_permissioned_pool.ts:791 | PARTIAL |  | writable | `!(ld8(ld64(s960 + 0x10) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 19 | bundle/create_permissioned_pool.ts:810 | PARTIAL |  | rent_exempt | `cs == 0` | anchor::ConstraintRentExempt |
| 20 | bundle/create_permissioned_pool.ts:811 | PARTIAL | payer | writable | `payer.is_writable == 0` | anchor::ConstraintMut |
| 21 | bundle/create_permissioned_pool.ts:821 | PARTIAL |  | key, pda | `(memcmp(se0, s100, 0x20) as u32) != 0` | anchor::ConstraintSeeds |
| 22 | bundle/create_permissioned_pool.ts:843 | PARTIAL |  | key, raw | `!((memcmp(s130, s500, 0x20) as i32) < 0)` | anchor::ConstraintRaw |
| 23 | bundle/create_permissioned_pool.ts:866 | PARTIAL |  | key, pda | `!((memcmp(sa0, sc0, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 24 | bundle/create_permissioned_pool.ts:867 | PARTIAL |  | writable | `!(ld8(ld64(s960 + 0x18) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 25 | bundle/create_permissioned_pool.ts:887 | PARTIAL |  | key, pda | `(memcmp(s20, s80, 0x20) as u32) != 0` | anchor::ConstraintSeeds |
| 26 | bundle/create_permissioned_pool.ts:901 | PARTIAL |  | writable | `!(ld8(ld64(s960) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 27 | bundle/create_permissioned_pool.ts:1308 | found |  | custom | `!((ld8(s101 + 1) & 1) != 0)` | error::NotSupportMint |
| 28 | bundle/create_permissioned_pool.ts:1604 | PARTIAL | pool_state |  | `f != 2` | return |
| 29 | bundle/create_permissioned_pool.ts:1635 | PARTIAL | tick_array_bitmap |  | `f == 2` | return |
| 30 | entrypoint.ts:307 | found |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 31 | entrypoint.ts:316 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 32 | ix/swap_router_base_in.ts:890 | found |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 33 | ix/swap_router_base_in.ts:899 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 34 | bundle/create_permissioned_pool.ts:3088 | found | b? | writable | `b.is_writable == 0` | anchor::AccountNotMutable |
| 35 | bundle/create_permissioned_pool.ts:3157 | found |  | custom | `!((f != 0xfffec4b2 ? 0xfffec4b1 > f - 1 : 0x845c1aa84e681c4b > b + 0xfffffffefffec4b0) != 0)` | error::SqrtPriceX64 |
| 36 | bundle/create_permissioned_pool.ts:3476 | PARTIAL |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 37 | bundle/create_permissioned_pool.ts:4546 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 38 | bundle/create_permissioned_pool.ts:4555 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 39 | bundle/create_permissioned_pool.ts:3674 | PARTIAL |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 40 | entrypoint.ts:681 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 41 | ix/swap_router_base_in.ts:949 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 42 | bundle/create_permissioned_pool.ts:4872 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 43 | entrypoint.ts:4307 | PARTIAL |  | key | `(memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001594a0 /* &T` | Err(ProgramError::IncorrectProgramId) |
| 44 | entrypoint.ts:3797 | PARTIAL |  | key | `(memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001594a0 /* &T` | Err(ProgramError::IncorrectProgramId) |
| 45 | shared.ts:22961 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 46 | shared.ts:24180 | found |  | key | `(memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001594a0 /* &T` | Err(ProgramError::IncorrectProgramId) |
