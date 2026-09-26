# create_customizable_pool

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_create_customizable_pool (anchor); 73 functions reachable: ix_create_customizable_pool, fn_f75f0, accounts_create_customizable_pool, memcpy, fn_55688, fn_f6fe8, fn_14d660, fn_125710, fn_11e480, fn_14ed60, fn_154c88, anchor_error_from, ….

## Look first

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
| 0 | pool_creator | expected · found | expected · PARTIAL | — | — | — |
| 1 | amm_config | — | — | found (+discriminator found) | — | — |
| 2 | pool_state | — | expected · runtime | runtime | — | — |
| 3 | token_mint_0 | — | — | found (+discriminator found) | — | — |
| 4 | token_mint_1 | — | — | found (+discriminator found) | — | — |
| 5 | token_vault_0 | — | expected · NOT FOUND | — | — | — |
| 6 | token_vault_1 | — | expected · NOT FOUND | — | — | — |
| 7 | observation_state | — | expected · NOT FOUND | — | — | — |
| 8 | tick_array_bitmap | — | expected · NOT FOUND | — | — | — |
| 9 | token_program_0 | — | — | — | — | — |
| 10 | token_program_1 | — | — | — | — | — |
| 11 | system_program | — | — | — | — | = 11111111… · expected · NOT FOUND |
| 12 | rent | — | — | — | — | = SysvarRe… · expected · NOT FOUND |

## Constraints per account

- pool_creator: signer found (bundle/create_customizable_pool.ts:267 via try_accounts_17a30); writable PARTIAL (bundle/create_customizable_pool.ts:678)
- amm_config: owner found (bundle/create_customizable_pool.ts:271 via try_accounts_184d8); initialized found (bundle/create_customizable_pool.ts:271 via try_accounts_184d8); discriminator found (bundle/create_customizable_pool.ts:271 via try_accounts_184d8)
- pool_state: writable runtime (bundle/create_customizable_pool.ts:3316) — written: the runtime rejects changes to a read-only account; owner runtime (bundle/create_customizable_pool.ts:3316) — data written / lamports debited: only the owner program may (the runtime rejects it otherwise); pda NOT FOUND
- token_mint_0: owner found (bundle/create_customizable_pool.ts:326 via try_accounts_15c0); discriminator found (bundle/create_customizable_pool.ts:326 via try_accounts_15c0); initialized found (bundle/create_customizable_pool.ts:326 via try_accounts_15c0)
- token_mint_1: owner found (bundle/create_customizable_pool.ts:362 via try_accounts_15c0); discriminator found (bundle/create_customizable_pool.ts:362 via try_accounts_15c0); initialized found (bundle/create_customizable_pool.ts:362 via try_accounts_15c0)
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

- bundle/create_customizable_pool.ts:2651 find_program_address(["support_mint", *s128], program *s108)
- compared with provided accounts: pool_state NOT FOUND, token_vault_0 NOT FOUND, token_vault_1 NOT FOUND, observation_state NOT FOUND, tick_array_bitmap NOT FOUND

## Operations (account writes)

- bundle/create_customizable_pool.ts:3316 ACCOUNT_DATA_WRITE pool_state.data[8..9] = c [conditional]
- bundle/create_customizable_pool.ts:3319 ACCOUNT_DATA_WRITE pool_state.data[33..41] = ld64(g + 0x18) [conditional]
- bundle/create_customizable_pool.ts:3320 ACCOUNT_DATA_WRITE pool_state.data[25..33] = ld64(g + 0x10) [conditional]
- bundle/create_customizable_pool.ts:3321 ACCOUNT_DATA_WRITE pool_state.data[17..25] = ld64(g + 8) [conditional]
- bundle/create_customizable_pool.ts:3322 ACCOUNT_DATA_WRITE pool_state.data[9..17] = ld64(g) [conditional]
- bundle/create_customizable_pool.ts:3327 ACCOUNT_DATA_WRITE pool_state.data[97..105] = ld64(j + 0x18) [conditional]
- bundle/create_customizable_pool.ts:3328 ACCOUNT_DATA_WRITE pool_state.data[89..97] = ld64(j + 0x10) [conditional]
- bundle/create_customizable_pool.ts:3329 ACCOUNT_DATA_WRITE pool_state.data[81..89] = ld64(j + 8) [conditional]
- bundle/create_customizable_pool.ts:3330 ACCOUNT_DATA_WRITE pool_state.data[73..81] = ld64(j) [conditional]
- bundle/create_customizable_pool.ts:3333 ACCOUNT_DATA_WRITE pool_state.data[129..137] = ld64(l + 0x18) [conditional]
- bundle/create_customizable_pool.ts:3334 ACCOUNT_DATA_WRITE pool_state.data[121..129] = ld64(l + 0x10) [conditional]
- bundle/create_customizable_pool.ts:3335 ACCOUNT_DATA_WRITE pool_state.data[113..121] = ld64(l + 8) [conditional]
- bundle/create_customizable_pool.ts:3336 ACCOUNT_DATA_WRITE pool_state.data[105..113] = ld64(l) [conditional]
- bundle/create_customizable_pool.ts:3337 ACCOUNT_DATA_WRITE pool_state.data[233..234] = ld8(i + 0x30) [conditional]
- bundle/create_customizable_pool.ts:3338 ACCOUNT_DATA_WRITE pool_state.data[234..235] = ld8(k + 0x30) [conditional]
- bundle/create_customizable_pool.ts:3340 ACCOUNT_DATA_WRITE pool_state.data[161..169] = ld64(m + 0x18) [conditional]
- bundle/create_customizable_pool.ts:3341 ACCOUNT_DATA_WRITE pool_state.data[153..161] = ld64(m + 0x10) [conditional]
- bundle/create_customizable_pool.ts:3342 ACCOUNT_DATA_WRITE pool_state.data[145..153] = ld64(m + 8) [conditional]
- bundle/create_customizable_pool.ts:3343 ACCOUNT_DATA_WRITE pool_state.data[137..145] = ld64(m) [conditional]
- bundle/create_customizable_pool.ts:3346 ACCOUNT_DATA_WRITE pool_state.data[235..237] = ld16(f + 0x72) [conditional]
- bundle/create_customizable_pool.ts:3347 ACCOUNT_DATA_WRITE pool_state.data[253..269] = d, p5 [conditional]
- bundle/create_customizable_pool.ts:3348 ACCOUNT_DATA_WRITE pool_state.data[269..273] = p7 [conditional]
- bundle/create_customizable_pool.ts:3349 ACCOUNT_DATA_WRITE pool_state.data[237..253] = 0, 0 [conditional]
- bundle/create_customizable_pool.ts:3350 ACCOUNT_DATA_WRITE pool_state.data[273..277] = 0 [conditional]
- bundle/create_customizable_pool.ts:3354 ACCOUNT_DATA_WRITE pool_state.data[558..566] = 0 [conditional]
- bundle/create_customizable_pool.ts:3355 ACCOUNT_DATA_WRITE pool_state.data[550..558] = 0 [conditional]
- bundle/create_customizable_pool.ts:3357 ACCOUNT_DATA_WRITE pool_state.data[727..735] = 0 [conditional]
- bundle/create_customizable_pool.ts:3358 ACCOUNT_DATA_WRITE pool_state.data[719..727] = 0 [conditional]
- bundle/create_customizable_pool.ts:3360 ACCOUNT_DATA_WRITE pool_state.data[896..904] = 0 [conditional]
- bundle/create_customizable_pool.ts:3361 ACCOUNT_DATA_WRITE pool_state.data[888..896] = 0 [conditional]
- bundle/create_customizable_pool.ts:3363 ACCOUNT_DATA_WRITE pool_state.data[390..391] = p15 [conditional]
- bundle/create_customizable_pool.ts:3364 ACCOUNT_DATA_WRITE pool_state.data[393..397] = 0 [conditional]
- bundle/create_customizable_pool.ts:3365 ACCOUNT_DATA_WRITE pool_state.data[391..393] = 0 [conditional]
- bundle/create_customizable_pool.ts:3367 ACCOUNT_DATA_WRITE pool_state.data[1080..1088] = p6 [conditional]
- bundle/create_customizable_pool.ts:3386 ACCOUNT_DATA_WRITE pool_state.data[1088..1176] = r, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 [conditional]
- bundle/create_customizable_pool.ts:3390 ACCOUNT_DATA_WRITE pool_state.data[225..233] = r [conditional]
- bundle/create_customizable_pool.ts:4350 ACCOUNT_DATA_WRITE pool_state.data[1106..1110] = f [conditional]
- bundle/create_customizable_pool.ts:4351 ACCOUNT_DATA_WRITE pool_state.data[1102..1106] = j [conditional]
- bundle/create_customizable_pool.ts:4352 ACCOUNT_DATA_WRITE pool_state.data[1100..1102] = i [conditional]
- bundle/create_customizable_pool.ts:4353 ACCOUNT_DATA_WRITE pool_state.data[1098..1100] = h [conditional]
- bundle/create_customizable_pool.ts:4354 ACCOUNT_DATA_WRITE pool_state.data[1096..1098] = d [conditional]
- bundle/create_customizable_pool.ts:4355 ACCOUNT_DATA_WRITE pool_state.data[1168..1176] = 0 [conditional]
- bundle/create_customizable_pool.ts:4356 ACCOUNT_DATA_WRITE pool_state.data[1162..1170] = 0 [conditional]
- bundle/create_customizable_pool.ts:4357 ACCOUNT_DATA_WRITE pool_state.data[1154..1162] = 0 [conditional]
- bundle/create_customizable_pool.ts:4358 ACCOUNT_DATA_WRITE pool_state.data[1146..1154] = 0 [conditional]
- bundle/create_customizable_pool.ts:4359 ACCOUNT_DATA_WRITE pool_state.data[1138..1146] = 0 [conditional]
- bundle/create_customizable_pool.ts:4360 ACCOUNT_DATA_WRITE pool_state.data[1130..1138] = 0 [conditional]
- bundle/create_customizable_pool.ts:4361 ACCOUNT_DATA_WRITE pool_state.data[1122..1130] = 0 [conditional]
- bundle/create_customizable_pool.ts:4362 ACCOUNT_DATA_WRITE pool_state.data[1114..1122] = 0 [conditional]
- bundle/create_customizable_pool.ts:4366 ACCOUNT_DATA_WRITE pool_state.data[1110..1114] = l [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/create_customizable_pool.ts:3316 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
- bundle/create_customizable_pool.ts:3319 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
  - sources: pool_state.data[33..41] ← pool_creator.key (caller-controlled)
- bundle/create_customizable_pool.ts:3320 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
  - sources: pool_state.data[25..33] ← pool_creator.key (caller-controlled)
- bundle/create_customizable_pool.ts:3321 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
  - sources: pool_state.data[17..25] ← pool_creator.key (caller-controlled)
- bundle/create_customizable_pool.ts:3322 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
  - sources: pool_state.data[9..17] ← pool_creator.key (caller-controlled)
- bundle/create_customizable_pool.ts:3327 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
- bundle/create_customizable_pool.ts:3328 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
- bundle/create_customizable_pool.ts:3329 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
- bundle/create_customizable_pool.ts:3330 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
- bundle/create_customizable_pool.ts:3333 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
- bundle/create_customizable_pool.ts:3334 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
- bundle/create_customizable_pool.ts:3335 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
- bundle/create_customizable_pool.ts:3336 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
- bundle/create_customizable_pool.ts:3337 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
- bundle/create_customizable_pool.ts:3338 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
- bundle/create_customizable_pool.ts:3340 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
- bundle/create_customizable_pool.ts:3341 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
- bundle/create_customizable_pool.ts:3342 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
- bundle/create_customizable_pool.ts:3343 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
- bundle/create_customizable_pool.ts:3346 ACCOUNT_DATA_WRITE: 16 dominating checks (signer pool_creator; owner amm_config; initialized amm_config; discriminator amm_config; owner token_mint_0; discriminator token_mint_0; initialized token_mint_0; owner token_mint_1; …)
  - sources: pool_state.data[235..237] ← pool_creator.key (caller-controlled)

## Authority (who enables each value movement / authority change)

- shared.ts:19147 LAMPORT_TRANSFER: signer pool_creator (found)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE: signer pool_creator (found); pda PDA signature ? (1 seeds)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE: signer pool_creator (found); pda PDA signature ? (1 seeds)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/create_customizable_pool.ts:3316 ACCOUNT_DATA_WRITE pool_state.data[8..9] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer pool_creator accounts_create_customizable_pool:11; pda  accounts_create_customizable_pool:207; custom  fn_55688:39
- bundle/create_customizable_pool.ts:3319 ACCOUNT_DATA_WRITE pool_state.data[33..41] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer pool_creator accounts_create_customizable_pool:11; pda  accounts_create_customizable_pool:207; custom  fn_55688:39
  - [PARTIAL] amount arithmetic checked — pool_state.data[33..41] ← pool_creator.key (caller-controlled)
- bundle/create_customizable_pool.ts:3320 ACCOUNT_DATA_WRITE pool_state.data[25..33] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer pool_creator accounts_create_customizable_pool:11; pda  accounts_create_customizable_pool:207; custom  fn_55688:39
  - [PARTIAL] amount arithmetic checked — pool_state.data[25..33] ← pool_creator.key (caller-controlled)
- bundle/create_customizable_pool.ts:3321 ACCOUNT_DATA_WRITE pool_state.data[17..25] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer pool_creator accounts_create_customizable_pool:11; pda  accounts_create_customizable_pool:207; custom  fn_55688:39
  - [PARTIAL] amount arithmetic checked — pool_state.data[17..25] ← pool_creator.key (caller-controlled)
- bundle/create_customizable_pool.ts:3322 ACCOUNT_DATA_WRITE pool_state.data[9..17] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer pool_creator accounts_create_customizable_pool:11; pda  accounts_create_customizable_pool:207; custom  fn_55688:39
  - [PARTIAL] amount arithmetic checked — pool_state.data[9..17] ← pool_creator.key (caller-controlled)
- bundle/create_customizable_pool.ts:3327 ACCOUNT_DATA_WRITE pool_state.data[97..105] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer pool_creator accounts_create_customizable_pool:11; pda  accounts_create_customizable_pool:207; custom  fn_55688:39
- shared.ts:19147 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer [LAMPORT_TRANSFER]
  - [NOT FOUND] debited account authorized (signer / PDA / owned by the program) — payer: not an identified account
  - [found] authorized (signer / PDA signature / stored authority) — signer pool_creator (found)
  - [found] amount arithmetic checked — sat_sub(j, h) (saturating)
  - [found] relevant checks on every path — 17 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- shared.ts:19147 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer ⇐ signer pool_creator (found)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer pool_creator (found)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer pool_creator (found)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/create_customizable_pool.ts:3316 ACCOUNT_DATA_WRITE pool_state.data[8..9]: ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `(ld8(s100 + 8) & 1) == 0` · `i == 2` · ✗ `(ld8(s100 + 8) & 1) == 0` #26 · ✗ `i != 2` · … 4 more
- bundle/create_customizable_pool.ts:3319 ACCOUNT_DATA_WRITE pool_state.data[33..41]: ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `(ld8(s100 + 8) & 1) == 0` · `i == 2` · ✗ `(ld8(s100 + 8) & 1) == 0` #26 · ✗ `i != 2` · … 4 more
- bundle/create_customizable_pool.ts:3320 ACCOUNT_DATA_WRITE pool_state.data[25..33]: ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `(ld8(s100 + 8) & 1) == 0` · `i == 2` · ✗ `(ld8(s100 + 8) & 1) == 0` #26 · ✗ `i != 2` · … 4 more
- bundle/create_customizable_pool.ts:3321 ACCOUNT_DATA_WRITE pool_state.data[17..25]: ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `(ld8(s100 + 8) & 1) == 0` · `i == 2` · ✗ `(ld8(s100 + 8) & 1) == 0` #26 · ✗ `i != 2` · … 4 more
- bundle/create_customizable_pool.ts:3322 ACCOUNT_DATA_WRITE pool_state.data[9..17]: ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `(ld8(s100 + 8) & 1) == 0` · `i == 2` · ✗ `(ld8(s100 + 8) & 1) == 0` #26 · ✗ `i != 2` · … 4 more
- bundle/create_customizable_pool.ts:3327 ACCOUNT_DATA_WRITE pool_state.data[97..105]: ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `(ld8(s100 + 8) & 1) == 0` · `i == 2` · ✗ `(ld8(s100 + 8) & 1) == 0` #26 · ✗ `i != 2` · … 4 more
- bundle/create_customizable_pool.ts:3328 ACCOUNT_DATA_WRITE pool_state.data[89..97]: ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `(ld8(s100 + 8) & 1) == 0` · `i == 2` · ✗ `(ld8(s100 + 8) & 1) == 0` #26 · ✗ `i != 2` · … 4 more
- bundle/create_customizable_pool.ts:3329 ACCOUNT_DATA_WRITE pool_state.data[81..89]: ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `(ld8(s100 + 8) & 1) == 0` · `i == 2` · ✗ `(ld8(s100 + 8) & 1) == 0` #26 · ✗ `i != 2` · … 4 more
- bundle/create_customizable_pool.ts:3330 ACCOUNT_DATA_WRITE pool_state.data[73..81]: ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `(ld8(s100 + 8) & 1) == 0` · `i == 2` · ✗ `(ld8(s100 + 8) & 1) == 0` #26 · ✗ `i != 2` · … 4 more
- bundle/create_customizable_pool.ts:3333 ACCOUNT_DATA_WRITE pool_state.data[129..137]: ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `(ld8(s100 + 8) & 1) == 0` · `i == 2` · ✗ `(ld8(s100 + 8) & 1) == 0` #26 · ✗ `i != 2` · … 4 more
- bundle/create_customizable_pool.ts:3334 ACCOUNT_DATA_WRITE pool_state.data[121..129]: ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `(ld8(s100 + 8) & 1) == 0` · `i == 2` · ✗ `(ld8(s100 + 8) & 1) == 0` #26 · ✗ `i != 2` · … 4 more
- bundle/create_customizable_pool.ts:3335 ACCOUNT_DATA_WRITE pool_state.data[113..121]: ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `(ld8(s100 + 8) & 1) == 0` · `i == 2` · ✗ `(ld8(s100 + 8) & 1) == 0` #26 · ✗ `i != 2` · … 4 more
- bundle/create_customizable_pool.ts:3336 ACCOUNT_DATA_WRITE pool_state.data[105..113]: ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `(ld8(s100 + 8) & 1) == 0` · `i == 2` · ✗ `(ld8(s100 + 8) & 1) == 0` #26 · ✗ `i != 2` · … 4 more
- bundle/create_customizable_pool.ts:3337 ACCOUNT_DATA_WRITE pool_state.data[233..234]: ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `(ld8(s100 + 8) & 1) == 0` · `i == 2` · ✗ `(ld8(s100 + 8) & 1) == 0` #26 · ✗ `i != 2` · … 4 more
- bundle/create_customizable_pool.ts:3338 ACCOUNT_DATA_WRITE pool_state.data[234..235]: ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `(ld8(s100 + 8) & 1) == 0` · `i == 2` · ✗ `(ld8(s100 + 8) & 1) == 0` #26 · ✗ `i != 2` · … 4 more
- bundle/create_customizable_pool.ts:3340 ACCOUNT_DATA_WRITE pool_state.data[161..169]: ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `i != 2` · ✗ `i != 2` · ✗ `i != 2` · ✗ `ld64(s100) != 0` · ✗ `(ld8(s100 + 8) & 1) == 0` · `i == 2` · ✗ `(ld8(s100 + 8) & 1) == 0` #26 · ✗ `i != 2` · … 4 more

## Arithmetic on value paths

- shared.ts:19110 SYSTEM_PROGRAM.Transfer.lamports ← `sat_sub(j, h)`: saturating

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): pool_creator.key, amm_config.key, pool_state.key, token_mint_0.key, token_mint_1.key, token_vault_0.key, token_vault_1.key, observation_state.key, tick_array_bitmap.key, token_program_0.key, token_program_1.key, system_program.key, rent.key, ix.customizable_params
- amm_config.data: validated (owner found @accounts_create_customizable_pool:15, discriminator found @accounts_create_customizable_pool:15, initialized found @accounts_create_customizable_pool:15)
- pool_state.data: runtime (owner runtime @fn_6a7e8:5)
- token_mint_0.data: validated (owner found @accounts_create_customizable_pool:70, discriminator found @accounts_create_customizable_pool:70, initialized found @accounts_create_customizable_pool:70)
- token_mint_1.data: validated (owner found @accounts_create_customizable_pool:106, discriminator found @accounts_create_customizable_pool:106, initialized found @accounts_create_customizable_pool:106)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/create_customizable_pool.ts:267 | found | pool_creator | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/create_customizable_pool.ts:271 | found | amm_config | owner, initialized, discriminator (via try_accounts_184d8 (count, owner, initialized, discriminator)) | `ld64(s80) == 0` | return |
| 2 | bundle/create_customizable_pool.ts:311 | found |  | count | `o == 0` | anchor::AccountNotEnoughKeys |
| 3 | bundle/create_customizable_pool.ts:326 | found | token_mint_0 | owner, discriminator, initialized (via try_accounts_15c0 (count, owner, discriminator, initialized)) | `ld32(s80) == 2` | return |
| 4 | bundle/create_customizable_pool.ts:362 | found | token_mint_1 | owner, discriminator, initialized (via try_accounts_15c0 (count, owner, discriminator, initialized)) | `!(ld32(s80) != 2)` | return |
| 5 | bundle/create_customizable_pool.ts:375 | found |  | count | `ac == 0` | anchor::AccountNotEnoughKeys |
| 6 | bundle/create_customizable_pool.ts:423 | found |  | count | `ag == 2` | anchor::AccountNotEnoughKeys |
| 7 | bundle/create_customizable_pool.ts:454 | found |  | count | `ah == 1` | anchor::AccountNotEnoughKeys |
| 8 | bundle/create_customizable_pool.ts:463 | found |  | pda | `ak == 2` | anchor::ConstraintSeeds |
| 9 | bundle/create_customizable_pool.ts:478 | PARTIAL |  | pda | `an == 2` | anchor::ConstraintSeeds |
| 10 | bundle/create_customizable_pool.ts:493 | PARTIAL |  | pda | `aq == 2` | anchor::ConstraintSeeds |
| 11 | bundle/create_customizable_pool.ts:559 | PARTIAL |  | key, pda | `!((memcmp(s290, s2d8, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 12 | bundle/create_customizable_pool.ts:568 | PARTIAL | pool_state | writable | `pool_state.is_writable == 0` | anchor::ConstraintMut |
| 13 | bundle/create_customizable_pool.ts:579 | PARTIAL |  | rent_exempt | `bm == 0` | anchor::ConstraintRentExempt |
| 14 | bundle/create_customizable_pool.ts:602 | PARTIAL |  | key, pda | `!((memcmp(s1f0, s238, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 15 | bundle/create_customizable_pool.ts:608 | PARTIAL |  | writable | `!(ld8(ld64(s6d8 + 0x30) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 16 | bundle/create_customizable_pool.ts:627 | PARTIAL |  | rent_exempt | `bx == 0` | anchor::ConstraintRentExempt |
| 17 | bundle/create_customizable_pool.ts:652 | PARTIAL |  | key, pda | `!((memcmp(s190, s1b8, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 18 | bundle/create_customizable_pool.ts:658 | PARTIAL |  | writable | `!(ld8(ld64(s6d8 + 0x10) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 19 | bundle/create_customizable_pool.ts:677 | PARTIAL |  | rent_exempt | `cf == 0` | anchor::ConstraintRentExempt |
| 20 | bundle/create_customizable_pool.ts:678 | PARTIAL | pool_creator | writable | `pool_creator.is_writable == 0` | anchor::ConstraintMut |
| 21 | bundle/create_customizable_pool.ts:687 | PARTIAL |  | key, raw | `!((memcmp(s170, s80, 0x20) as i32) < 0)` | anchor::ConstraintRaw |
| 22 | bundle/create_customizable_pool.ts:710 | PARTIAL |  | key, pda | `!((memcmp(s120, s140, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 23 | bundle/create_customizable_pool.ts:711 | PARTIAL |  | writable | `!(ld8(ld64(s6d8 + 0x18) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 24 | bundle/create_customizable_pool.ts:732 | PARTIAL |  | pda | `y != 0` | anchor::ConstraintSeeds |
| 25 | bundle/create_customizable_pool.ts:746 | PARTIAL |  | writable | `!(ld8(ld64(s6d8) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 26 | bundle/create_customizable_pool.ts:1043 | found |  | custom | `!((ld8(s100 + 8) & 1) != 0)` | error::NotSupportMint |
| 27 | bundle/create_customizable_pool.ts:1337 | PARTIAL | pool_state |  | `f != 2` | return |
| 28 | bundle/create_customizable_pool.ts:1368 | PARTIAL | tick_array_bitmap |  | `f == 2` | return |
| 29 | ix/swap_router_base_in.ts:890 | found |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 30 | ix/swap_router_base_in.ts:899 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 31 | bundle/create_customizable_pool.ts:2814 | found | b? | writable | `b.is_writable == 0` | anchor::AccountNotMutable |
| 32 | bundle/create_customizable_pool.ts:2883 | found |  | custom | `!((f != 0xfffec4b2 ? 0xfffec4b1 > f - 1 : 0x845c1aa84e681c4b > b + 0xfffffffefffec4b0) != 0)` | error::SqrtPriceX64 |
| 33 | bundle/create_customizable_pool.ts:3202 | PARTIAL |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 34 | bundle/create_customizable_pool.ts:4256 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 35 | bundle/create_customizable_pool.ts:4265 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 36 | bundle/create_customizable_pool.ts:3400 | PARTIAL |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 37 | ix/swap_router_base_in.ts:949 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 38 | bundle/create_customizable_pool.ts:4594 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 39 | entrypoint.ts:4307 | PARTIAL |  | key | `(memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001594a0 /* &T` | Err(ProgramError::IncorrectProgramId) |
| 40 | entrypoint.ts:3797 | PARTIAL |  | key | `(memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001594a0 /* &T` | Err(ProgramError::IncorrectProgramId) |
| 41 | shared.ts:22961 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 42 | shared.ts:24180 | found |  | key | `(memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0 && (memcmp(b, 0x1001594a0 /* &T` | Err(ProgramError::IncorrectProgramId) |
