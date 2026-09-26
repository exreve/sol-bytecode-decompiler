# open_limit_order

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_open_limit_order (anchor); 83 functions reachable: ix_open_limit_order, fn_14d660, fn_125710, fn_14ed60, accounts_open_limit_order, memcpy, fn_4f930, fn_e4980, fn_11e480, anchor_error_from, fn_154c88, fn_14ec00, ….

## Look first

- ⚠ payer: writable expected, no check found
- ⚠ tick_array: writable expected, no check found
- ⚠ limit_order: pda expected, no check found
- ⚠ input_token_account: writable expected, no check found
- ⚠ output_token_account: writable expected, no check found
- ⚠ system_program: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | payer | expected · PARTIAL | expected · NOT FOUND | — | — | — |
| 1 | pool_state | — | expected · runtime | runtime (+discriminator PARTIAL) | — | — |
| 2 | tick_array | — | expected · NOT FOUND | — | — | — |
| 3 | limit_order_nonce | — | expected · PARTIAL | — | — | — |
| 4 | limit_order | — | expected · PARTIAL | — | — | — |
| 5 | input_token_account | — | expected · NOT FOUND | — | — | — |
| 6 | output_token_account | — | expected · NOT FOUND | — | — | — |
| 7 | input_vault | — | expected · PARTIAL | — | — | — |
| 8 | output_vault | — | expected · PARTIAL | — | — | — |
| 9 | input_vault_mint | — | — | — | — | — |
| 10 | output_vault_mint | — | — | — | — | — |
| 11 | input_token_program | — | — | — | — | — |
| 12 | system_program | — | — | — | — | = 11111111… · expected · NOT FOUND |
|  | tick_array_state [code] | — | — | — | — | — |

## Constraints per account

- payer: signer PARTIAL (bundle/open_limit_order.ts:331 via try_accounts_17a30); writable NOT FOUND
- pool_state: discriminator PARTIAL (bundle/open_limit_order.ts:337 via fn_11e0); owner runtime (shared.ts:14517) — data written / lamports debited: only the owner program may (the runtime rejects it otherwise); writable runtime (shared.ts:14517) — written: the runtime rejects changes to a read-only account
- tick_array: count PARTIAL (bundle/open_limit_order.ts:339); writable NOT FOUND
- limit_order_nonce: writable PARTIAL (bundle/open_limit_order.ts:541)
- limit_order: writable PARTIAL (bundle/open_limit_order.ts:597); pda NOT FOUND
- input_token_account: state found (bundle/open_limit_order.ts:1130); key PARTIAL (bundle/open_limit_order.ts:1685); writable NOT FOUND
- output_token_account: key PARTIAL (bundle/open_limit_order.ts:1722); writable NOT FOUND
- input_vault: writable PARTIAL (bundle/open_limit_order.ts:648)
- output_vault: writable PARTIAL (bundle/open_limit_order.ts:680)
- input_vault_mint: no checks found
- output_vault_mint: no checks found
- input_token_program: no checks found
- system_program: address NOT FOUND
- tick_array_state: state PARTIAL (bundle/open_limit_order.ts:4324)

## CPIs

- bundle/open_limit_order.ts:1436 [conditional] TOKEN_2022_PROGRAM (constant).TransferChecked — amount: ld64(s3f8 + 0x10), ld8(ld64(accounts.input_token_account.delegate + 0x1c) + 0x30)
- shared.ts:19075 [conditional] SYSTEM_PROGRAM (constant).CreateAccount — lamports: j, ci, b
- shared.ts:19147 [conditional] SYSTEM_PROGRAM (constant).Transfer — accounts from: payer s, to: ? — lamports: cj
- shared.ts:19198 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: ci — PDA signer: ? (1 seeds)
- shared.ts:19225 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: b — PDA signer: ? (1 seeds)

## PDAs derived

- bundle/open_limit_order.ts:1191 find_program_address(["tick_array", *w, u32 bswap32(v)], program *s38)
- bundle/open_limit_order.ts:4062 find_program_address(["tick_array", *aj, u32 bswap32(f)], program *s150)
- shared.ts:14304 create_program_address(["pool", *(b + 1), *(b + 0x41), *(b + 0x61), (u != 0 ? b + 0x17f : 1)[..(u != 0) << 1], b[..1]], program *s28)
- shared.ts:14310 find_program_address(["pool_tick_array_bitmap_extension", *s48], program *sc8)
- compared with provided accounts: limit_order NOT FOUND

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

- bundle/open_limit_order.ts:1436 TOKEN_TRANSFER: 16 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator; writable)
- shared.ts:14517 ACCOUNT_DATA_WRITE: 19 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator; writable)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14518 ACCOUNT_DATA_WRITE: 19 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator; writable)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14519 ACCOUNT_DATA_WRITE: 19 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator; writable)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14520 ACCOUNT_DATA_WRITE: 19 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator; writable)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14521 ACCOUNT_DATA_WRITE: 19 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator; writable)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14522 ACCOUNT_DATA_WRITE: 19 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator; writable)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14523 ACCOUNT_DATA_WRITE: 19 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator; writable)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14524 ACCOUNT_DATA_WRITE: 19 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator; writable)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14525 ACCOUNT_DATA_WRITE: 19 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator; writable)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14526 ACCOUNT_DATA_WRITE: 19 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator; writable)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14527 ACCOUNT_DATA_WRITE: 19 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator; writable)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14528 ACCOUNT_DATA_WRITE: 19 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator; writable)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14529 ACCOUNT_DATA_WRITE: 19 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator; writable)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14530 ACCOUNT_DATA_WRITE: 19 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator; writable)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14531 ACCOUNT_DATA_WRITE: 19 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator; writable)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14533 ACCOUNT_DATA_WRITE: 19 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator; writable)
  - sources: pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:19075 ACCOUNT_CREATE: 11 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator)
- shared.ts:19147 LAMPORT_TRANSFER: 11 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator)
  - sources: from ← payer.key (caller-controlled)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE: 11 dominating checks (state input_token_account; custom input_token_account; custom; key; owner; discriminator)

## Authority (who enables each value movement / authority change)

- bundle/open_limit_order.ts:1436 TOKEN_TRANSFER: signer payer (PARTIAL)
- shared.ts:19147 LAMPORT_TRANSFER: signer payer (PARTIAL)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE: signer payer (PARTIAL); pda PDA signature ? (1 seeds)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE: signer payer (PARTIAL); pda PDA signature ? (1 seeds)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/open_limit_order.ts:1436 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked [TOKEN_TRANSFER]
  - [PARTIAL] authorized (signer / PDA signature / stored authority) — signer payer (partial)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_2022_PROGRAM
  - [found] relevant checks on every path — 16 dominating checks
- shared.ts:14517 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [PARTIAL] account type (discriminator) — pool_state: discriminator partial
  - [found] write gated (signer / constraint) — state/custom input_token_account fn_4f930:8; custom  fn_4f930:21; key  fn_4f930:74
  - [PARTIAL] amount arithmetic checked — pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14518 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [PARTIAL] account type (discriminator) — pool_state: discriminator partial
  - [found] write gated (signer / constraint) — state/custom input_token_account fn_4f930:8; custom  fn_4f930:21; key  fn_4f930:74
  - [PARTIAL] amount arithmetic checked — pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14519 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [PARTIAL] account type (discriminator) — pool_state: discriminator partial
  - [found] write gated (signer / constraint) — state/custom input_token_account fn_4f930:8; custom  fn_4f930:21; key  fn_4f930:74
  - [PARTIAL] amount arithmetic checked — pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14520 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [PARTIAL] account type (discriminator) — pool_state: discriminator partial
  - [found] write gated (signer / constraint) — state/custom input_token_account fn_4f930:8; custom  fn_4f930:21; key  fn_4f930:74
  - [PARTIAL] amount arithmetic checked — pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14521 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [PARTIAL] account type (discriminator) — pool_state: discriminator partial
  - [found] write gated (signer / constraint) — state/custom input_token_account fn_4f930:8; custom  fn_4f930:21; key  fn_4f930:74
  - [PARTIAL] amount arithmetic checked — pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:14522 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [PARTIAL] account type (discriminator) — pool_state: discriminator partial
  - [found] write gated (signer / constraint) — state/custom input_token_account fn_4f930:8; custom  fn_4f930:21; key  fn_4f930:74
  - [PARTIAL] amount arithmetic checked — pool_state.tick_array_bitmap ← pool_state.tick_array_bitmap (runtime)
- shared.ts:19147 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer [LAMPORT_TRANSFER]
  - [PARTIAL] debited account authorized (signer / PDA / owned by the program) — payer: signer partial
  - [PARTIAL] authorized (signer / PDA signature / stored authority) — signer payer (partial)
  - [found] amount arithmetic checked — sat_sub(j, h) (saturating)
  - [found] relevant checks on every path — 11 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/open_limit_order.ts:1436 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked ⇐ signer payer (PARTIAL)
- shared.ts:19147 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer ⇐ signer payer (PARTIAL)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer payer (PARTIAL)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer payer (PARTIAL)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/open_limit_order.ts:1436 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked: ✗ `aw > ax` · ✗ `ld64(s240) != 0` · `ag != -1` #38 · ✗ `i != 2` · ✗ `ld64(s240) != 0` · ✗ `ac == 2` · ✗ `(memcmp(s2f0, s240, 0x20) as u32) != 0` #37 · `i == 2` · ✗ `s > r` · ✗ `i != 2` · … 11 more
  - not required on some path: #0 (signer payer)
- shared.ts:14517 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > bs` · ✗ `ld64(s240) != 0` · ✗ `ld64(s430) != 0` · ✗ `(ld64(s418 + 0x10) & 1) != 0` · ✗ `aw > ax` · ✗ `ld64(s240) != 0` · `ag != -1` #38 · … 18 more
  - not required on some path: #0 (signer payer); #1 (discriminator, owner pool_state)
- shared.ts:14518 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > bs` · ✗ `ld64(s240) != 0` · ✗ `ld64(s430) != 0` · ✗ `(ld64(s418 + 0x10) & 1) != 0` · ✗ `aw > ax` · ✗ `ld64(s240) != 0` · `ag != -1` #38 · … 18 more
  - not required on some path: #0 (signer payer); #1 (discriminator, owner pool_state)
- shared.ts:14519 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > bs` · ✗ `ld64(s240) != 0` · ✗ `ld64(s430) != 0` · ✗ `(ld64(s418 + 0x10) & 1) != 0` · ✗ `aw > ax` · ✗ `ld64(s240) != 0` · `ag != -1` #38 · … 18 more
  - not required on some path: #0 (signer payer); #1 (discriminator, owner pool_state)
- shared.ts:14520 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > bs` · ✗ `ld64(s240) != 0` · ✗ `ld64(s430) != 0` · ✗ `(ld64(s418 + 0x10) & 1) != 0` · ✗ `aw > ax` · ✗ `ld64(s240) != 0` · `ag != -1` #38 · … 18 more
  - not required on some path: #0 (signer payer); #1 (discriminator, owner pool_state)
- shared.ts:14521 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > bs` · ✗ `ld64(s240) != 0` · ✗ `ld64(s430) != 0` · ✗ `(ld64(s418 + 0x10) & 1) != 0` · ✗ `aw > ax` · ✗ `ld64(s240) != 0` · `ag != -1` #38 · … 18 more
  - not required on some path: #0 (signer payer); #1 (discriminator, owner pool_state)
- shared.ts:14522 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > bs` · ✗ `ld64(s240) != 0` · ✗ `ld64(s430) != 0` · ✗ `(ld64(s418 + 0x10) & 1) != 0` · ✗ `aw > ax` · ✗ `ld64(s240) != 0` · `ag != -1` #38 · … 18 more
  - not required on some path: #0 (signer payer); #1 (discriminator, owner pool_state)
- shared.ts:14523 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > bs` · ✗ `ld64(s240) != 0` · ✗ `ld64(s430) != 0` · ✗ `(ld64(s418 + 0x10) & 1) != 0` · ✗ `aw > ax` · ✗ `ld64(s240) != 0` · `ag != -1` #38 · … 18 more
  - not required on some path: #0 (signer payer); #1 (discriminator, owner pool_state)
- shared.ts:14524 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > bs` · ✗ `ld64(s240) != 0` · ✗ `ld64(s430) != 0` · ✗ `(ld64(s418 + 0x10) & 1) != 0` · ✗ `aw > ax` · ✗ `ld64(s240) != 0` · `ag != -1` #38 · … 18 more
  - not required on some path: #0 (signer payer); #1 (discriminator, owner pool_state)
- shared.ts:14525 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > bs` · ✗ `ld64(s240) != 0` · ✗ `ld64(s430) != 0` · ✗ `(ld64(s418 + 0x10) & 1) != 0` · ✗ `aw > ax` · ✗ `ld64(s240) != 0` · `ag != -1` #38 · … 18 more
  - not required on some path: #0 (signer payer); #1 (discriminator, owner pool_state)
- shared.ts:14526 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > bs` · ✗ `ld64(s240) != 0` · ✗ `ld64(s430) != 0` · ✗ `(ld64(s418 + 0x10) & 1) != 0` · ✗ `aw > ax` · ✗ `ld64(s240) != 0` · `ag != -1` #38 · … 18 more
  - not required on some path: #0 (signer payer); #1 (discriminator, owner pool_state)
- shared.ts:14527 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > bs` · ✗ `ld64(s240) != 0` · ✗ `ld64(s430) != 0` · ✗ `(ld64(s418 + 0x10) & 1) != 0` · ✗ `aw > ax` · ✗ `ld64(s240) != 0` · `ag != -1` #38 · … 18 more
  - not required on some path: #0 (signer payer); #1 (discriminator, owner pool_state)
- shared.ts:14528 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > bs` · ✗ `ld64(s240) != 0` · ✗ `ld64(s430) != 0` · ✗ `(ld64(s418 + 0x10) & 1) != 0` · ✗ `aw > ax` · ✗ `ld64(s240) != 0` · `ag != -1` #38 · … 18 more
  - not required on some path: #0 (signer payer); #1 (discriminator, owner pool_state)
- shared.ts:14529 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > bs` · ✗ `ld64(s240) != 0` · ✗ `ld64(s430) != 0` · ✗ `(ld64(s418 + 0x10) & 1) != 0` · ✗ `aw > ax` · ✗ `ld64(s240) != 0` · `ag != -1` #38 · … 18 more
  - not required on some path: #0 (signer payer); #1 (discriminator, owner pool_state)
- shared.ts:14530 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > bs` · ✗ `ld64(s240) != 0` · ✗ `ld64(s430) != 0` · ✗ `(ld64(s418 + 0x10) & 1) != 0` · ✗ `aw > ax` · ✗ `ld64(s240) != 0` · `ag != -1` #38 · … 18 more
  - not required on some path: #0 (signer payer); #1 (discriminator, owner pool_state)
- shared.ts:14531 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `0x300000008 > bs` · ✗ `ld64(s240) != 0` · ✗ `ld64(s430) != 0` · ✗ `(ld64(s418 + 0x10) & 1) != 0` · ✗ `aw > ax` · ✗ `ld64(s240) != 0` · `ag != -1` #38 · … 18 more
  - not required on some path: #0 (signer payer); #1 (discriminator, owner pool_state)

## Arithmetic on value paths

- shared.ts:19110 SYSTEM_PROGRAM.Transfer.lamports ← `sat_sub(j, h)`: saturating

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): payer.key, pool_state.key, tick_array.key, limit_order_nonce.key, limit_order.key, input_vault.key, output_vault.key, input_vault_mint.key, output_vault_mint.key, input_token_program.key, system_program.key, tick_array_state.key, ix.nonce_index, ix.zero_for_one, ix.tick_index, ix.amount
- pool_state.data: runtime (owner runtime @fn_6d670:247, discriminator partial @accounts_open_limit_order:41)
- input_token_account.key: partially-validated (key partial @fn_e4980:127)
- output_token_account.key: partially-validated (key partial @fn_e4980:164)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/open_limit_order.ts:331 | PARTIAL | payer | signer (via try_accounts_17a30 (count, signer)) | `n != 2` | return |
| 1 | bundle/open_limit_order.ts:337 | PARTIAL | pool_state | discriminator, owner (via fn_11e0 (count, discriminator, owner)) | `n != 2` | return |
| 2 | bundle/open_limit_order.ts:339 | PARTIAL | tick_array | count | `x == 0` | anchor::AccountNotEnoughKeys |
| 3 | bundle/open_limit_order.ts:342 | PARTIAL |  | count | `x == 1` | anchor::AccountNotEnoughKeys |
| 4 | bundle/open_limit_order.ts:354 | PARTIAL |  | count | `x == 2` | anchor::AccountNotEnoughKeys |
| 5 | bundle/open_limit_order.ts:387 | PARTIAL |  | pda | `ak == 2` | anchor::ConstraintSeeds |
| 6 | bundle/open_limit_order.ts:402 | PARTIAL |  | pda | `an == 2` | anchor::ConstraintSeeds |
| 7 | bundle/open_limit_order.ts:417 | PARTIAL |  | pda | `aq == 2` | anchor::ConstraintSeeds |
| 8 | bundle/open_limit_order.ts:432 | PARTIAL |  | pda | `au == 2` | anchor::ConstraintSeeds |
| 9 | bundle/open_limit_order.ts:447 | PARTIAL |  | pda | `ax == 2` | anchor::ConstraintSeeds |
| 10 | bundle/open_limit_order.ts:462 | PARTIAL |  | pda | `ba == 2` | anchor::ConstraintSeeds |
| 11 | bundle/open_limit_order.ts:477 | PARTIAL |  | pda | `bd == 2` | anchor::ConstraintSeeds |
| 12 | bundle/open_limit_order.ts:515 | PARTIAL |  | key, pda | `!((memcmp(s3e0, s428, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 13 | bundle/open_limit_order.ts:541 | PARTIAL | limit_order_nonce | writable | `limit_order_nonce.is_writable == 0` | anchor::ConstraintMut |
| 14 | bundle/open_limit_order.ts:551 | PARTIAL |  | rent_exempt | `br == 0` | anchor::ConstraintRentExempt |
| 15 | bundle/open_limit_order.ts:581 | PARTIAL |  | key, pda | `!((memcmp(s298, s308, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 16 | bundle/open_limit_order.ts:597 | PARTIAL | limit_order | writable | `limit_order.is_writable == 0` | anchor::ConstraintMut |
| 17 | bundle/open_limit_order.ts:616 | PARTIAL |  | rent_exempt | `ce == 0` | anchor::ConstraintRentExempt |
| 18 | bundle/open_limit_order.ts:617 | PARTIAL |  | writable | `!(ld8(ld64(s890 + 0x28) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 19 | bundle/open_limit_order.ts:618 | PARTIAL |  | writable | `!(ld8(ld64(s890 + 8) + 0x29) != 0)` | anchor::ConstraintMut |
| 20 | bundle/open_limit_order.ts:619 | PARTIAL |  | writable | `!(ld8(ld64(s890) + 0x29) != 0)` | anchor::ConstraintMut |
| 21 | bundle/open_limit_order.ts:620 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s890 + 0x20) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 22 | bundle/open_limit_order.ts:622 | PARTIAL |  | key, token_owner | `(memcmp(ld64(s890 + 0x20) + 0x48, sd8, 0x20) as u32) != 0` | anchor::ConstraintTokenOwner |
| 23 | bundle/open_limit_order.ts:632 | PARTIAL |  | key, token_mint | `!((memcmp(ld64(s890 + 0x20) + 0x28, sd8, 0x20) as u32) == 0)` | anchor::ConstraintTokenMint |
| 24 | bundle/open_limit_order.ts:633 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s898) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 25 | bundle/open_limit_order.ts:635 | PARTIAL |  | token_owner | `(memcmp(ld64(s898) + 0x48, sd8, 0x20) as u32) != 0` | anchor::ConstraintTokenOwner |
| 26 | bundle/open_limit_order.ts:646 | PARTIAL |  | token_mint | `!((ch as u32) == 0)` | anchor::ConstraintTokenMint |
| 27 | bundle/open_limit_order.ts:648 | PARTIAL | input_vault | writable | `input_vault.is_writable == 0` | anchor::ConstraintMut |
| 28 | bundle/open_limit_order.ts:678 | PARTIAL |  | raw | `!((co as u32) == 0)` | anchor::ConstraintRaw |
| 29 | bundle/open_limit_order.ts:680 | PARTIAL | output_vault | writable | `output_vault.is_writable == 0` | anchor::ConstraintMut |
| 30 | bundle/open_limit_order.ts:710 | PARTIAL |  | raw | `!((cv as u32) == 0)` | anchor::ConstraintRaw |
| 31 | bundle/open_limit_order.ts:716 | PARTIAL |  | key, address | `(memcmp(s198, s178, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 32 | bundle/open_limit_order.ts:733 | PARTIAL |  | key, address | `!((memcmp(s158, s138, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 33 | bundle/open_limit_order.ts:740 | PARTIAL |  | key, address | `!((memcmp(s118, sf8, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 34 | bundle/open_limit_order.ts:955 | PARTIAL |  | count | `n == 2` | anchor::AccountNotEnoughKeys |
| 35 | bundle/open_limit_order.ts:1130 | found | input_token_account | state, custom | `!(ld8(ld64(accounts.input_token_account + 0x70) + 0x94) != 2 && ld8(ld64(accounts.input_token_accoun` | error::NotApproved |
| 36 | bundle/open_limit_order.ts:1143 | found |  | custom | `!((ld8(i + 0x17d) & 0x30) == 0)` | error::NotApproved |
| 37 | bundle/open_limit_order.ts:1196 | found |  | key | `(memcmp(s2f0, s240, 0x20) as u32) != 0` | anchor::RequireKeysEqViolated |
| 38 | bundle/open_limit_order.ts:1286 | PARTIAL |  | custom | `ag == -1` | error::OrderPhaseSaturated |
| 39 | bundle/open_limit_order.ts:1565 | PARTIAL | pool_state |  | `f != 2` | return |
| 40 | bundle/open_limit_order.ts:1682 | PARTIAL | limit_order |  | `f != 2` | return |
| 41 | bundle/open_limit_order.ts:1685 | PARTIAL | input_token_account | key | `(memcmp(t, c, 0x20) as u32) == 0 && (common_is_closed(u) == 0 && ld64(ld64(u + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 42 | bundle/open_limit_order.ts:1722 | PARTIAL | output_token_account | key | `(memcmp(aa, c, 0x20) as u32) == 0 && (common_is_closed(ab) == 0 && ld64(ld64(ab + 0x10) + 0x10) != 0` | Err(ProgramError::AccountBorrowFailed) |
| 43 | bundle/open_limit_order.ts:1759 | PARTIAL |  | key | `(memcmp(ae, c, 0x20) as u32) == 0 && (common_is_closed(af) == 0 && ld64(ld64(af + 0x10) + 0x10) != 0` | Err(ProgramError::AccountBorrowFailed) |
| 44 | shared.ts:1017 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 45 | shared.ts:1035 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 46 | shared.ts:1043 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 47 | bundle/open_limit_order.ts:2867 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 48 | bundle/open_limit_order.ts:2878 | found |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 49 | bundle/open_limit_order.ts:3639 | found |  | custom | `!(0xd89e7 > ((b + 0x6c4f3) as u32))` | error::InvalidTickIndex |
| 50 | bundle/open_limit_order.ts:3644 | found |  | custom | `f != 0` | error::TickAndSpacingNotMatch |
| 51 | bundle/open_limit_order.ts:3879 | found |  | custom | `b == 0` | error::ZeroAmountSpecified |
| 52 | bundle/open_limit_order.ts:4068 | found |  | key | `!((memcmp(s170, s130, 0x20) as u32) == 0)` | anchor::RequireKeysEqViolated |
| 53 | bundle/open_limit_order.ts:4315 | PARTIAL |  | writable | `!((c & 1) != 0)` | anchor::AccountNotMutable |
| 54 | bundle/open_limit_order.ts:4324 | PARTIAL | tick_array_state | state | `tick_array_state_data.discriminator != 0x2a81f931cd559bc0 /* account:TickArrayState */` | return |
| 55 | bundle/open_limit_order.ts:4325 | PARTIAL |  | discriminator | `g <= 0x27ff` | anchor::AccountDiscriminatorMismatch |
| 56 | bundle/open_limit_order.ts:4406 | PARTIAL |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 57 | bundle/open_limit_order.ts:4411 | PARTIAL |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 58 | bundle/open_limit_order.ts:4422 | PARTIAL |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 59 | shared.ts:14313 | PARTIAL |  | key | `(memcmp(s1a8, se8, 0x20) as u32) != 0` | anchor::RequireKeysEqViolated |
| 60 | shared.ts:14375 | PARTIAL |  | writable | `!(ld8(v + 0x29) != 0)` | anchor::AccountNotMutable |
| 61 | entrypoint.ts:4230 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 62 | shared.ts:13043 | found |  | custom | `!(0xd89e9 > ((b + 0x6c4f4) as u32))` | error::TickUpperOverflow |
| 63 | shared.ts:19395 | PARTIAL |  | key, owner | `(memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20) as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 64 | shared.ts:19430 | PARTIAL |  | writable | `!((c & 1) != 0)` | anchor::AccountNotMutable |
| 65 | shared.ts:15478 | PARTIAL |  | custom | `(g as u32) != (b as u32)` | error::InvalidTickArray |
| 66 | shared.ts:1069 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 67 | shared.ts:1087 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 68 | shared.ts:1095 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x998b8061db24963c /* account:TickArrayBitmapExtension */` | anchor::AccountDiscriminatorMismatch |
