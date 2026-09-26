# open_position_with_token22_nft

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_open_position_with_token22_nft (anchor); 136 functions reachable: ix_open_position_with_token22_nft, fn_14d660, fn_125710, fn_11e480, fn_14ed60, fn_17748, accounts_open_position_with_token22_nft, memcpy, fn_26d98, fn_a6478, anchor_error_from, fn_14ec00, ….

## Look first

- ⚠ position_nft_mint: writable expected, no check found
- ⚠ position_nft_account: writable expected, no check found
- ⚠ tick_array_lower: pda expected, no check found
- ⚠ tick_array_lower: writable expected, no check found
- ⚠ tick_array_upper: pda expected, no check found
- ⚠ tick_array_upper: writable expected, no check found
- ⚠ personal_position: pda expected, no check found
- ⚠ token_account_0: writable expected, no check found
- ⚠ token_account_1: writable expected, no check found
- ⚠ rent: address expected, no check found
- ⚠ system_program: address expected, no check found
- ⚠ token_program: address expected, no check found
- ⚠ associated_token_program: address expected, no check found
- ⚠ token_program_2022: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | payer | expected · found | expected · PARTIAL | — | — | — |
| 1 | position_nft_owner | — | — | — | — | — |
| 2 | position_nft_mint | expected · found | expected · NOT FOUND | — | — | — |
| 3 | position_nft_account | — | expected · NOT FOUND | — | — | — |
| 4 | pool_state | — | expected · runtime | runtime | — | — |
| 5 | protocol_position | — | — | — | — | — |
| 6 | tick_array_lower | — | expected · NOT FOUND | — | — | — |
| 7 | tick_array_upper | — | expected · NOT FOUND | — | — | — |
| 8 | personal_position | — | expected · PARTIAL | — | — | — |
| 9 | token_account_0 | — | expected · NOT FOUND | — | — | — |
| 10 | token_account_1 | — | expected · NOT FOUND | — | — | — |
| 11 | token_vault_0 | — | expected · PARTIAL | — | — | — |
| 12 | token_vault_1 | — | expected · PARTIAL | — | — | — |
| 13 | rent | — | — | — | — | = SysvarRe… · expected · NOT FOUND |
| 14 | system_program | — | — | — | — | = 11111111… · expected · NOT FOUND |
| 15 | token_program | — | — | — | — | = Tokenkeg… · expected · NOT FOUND |
| 16 | associated_token_program | — | — | — | — | = ATokenGP… · expected · NOT FOUND |
| 17 | token_program_2022 | — | — | — | — | = TokenzQd… · expected · NOT FOUND |
| 18 | vault_0_mint | — | — | — | — | — |
| 19 | vault_1_mint | — | — | — | — | — |
|  | tick_array_state [code] | — | — | — | — | — |
|  | tick_array_state_data [code] | — | — | — | — | — |

## Constraints per account

- payer: signer found (bundle/open_position_with_token22_nft.ts:391 via try_accounts_17a30); writable PARTIAL (bundle/open_position_with_token22_nft.ts:830)
- position_nft_owner: no checks found
- position_nft_mint: signer found (bundle/open_position_with_token22_nft.ts:437 via try_accounts_17a30); writable NOT FOUND
- position_nft_account: writable NOT FOUND
- pool_state: writable runtime (shared.ts:14517) — written: the runtime rejects changes to a read-only account; owner runtime (shared.ts:14517) — data written / lamports debited: only the owner program may (the runtime rejects it otherwise)
- protocol_position: no checks found
- tick_array_lower: writable NOT FOUND; pda NOT FOUND
- tick_array_upper: writable NOT FOUND; pda NOT FOUND
- personal_position: writable PARTIAL (bundle/open_position_with_token22_nft.ts:806); pda NOT FOUND
- token_account_0: key PARTIAL (bundle/open_position_with_token22_nft.ts:1611); writable NOT FOUND
- token_account_1: key PARTIAL (bundle/open_position_with_token22_nft.ts:1642); writable NOT FOUND
- token_vault_0: writable PARTIAL (bundle/open_position_with_token22_nft.ts:917); key PARTIAL (bundle/open_position_with_token22_nft.ts:1673)
- token_vault_1: writable PARTIAL (bundle/open_position_with_token22_nft.ts:933)
- rent: address NOT FOUND
- system_program: address NOT FOUND
- token_program: address NOT FOUND
- associated_token_program: address NOT FOUND
- token_program_2022: address NOT FOUND
- vault_0_mint: no checks found
- vault_1_mint: no checks found
- tick_array_state: state PARTIAL (shared.ts:3417)
- tick_array_state_data: state PARTIAL (shared.ts:3465)

## CPIs

- bundle/open_position_with_token22_nft.ts:3206 SYSTEM_PROGRAM (constant).CreateAccount — accounts from: payer s — lamports: aq, ar, ap
- bundle/open_position_with_token22_nft.ts:4356 [conditional] program not decoded
  - return invoke_signed(a, b, c, d, fp)
- shared.ts:4927 [conditional] program not decoded
  - bo = metadata_create_metadata_accounts_v3(s3b8, s268, sc0, 0, fp)
- shared.ts:5026 [conditional] TOKEN_2022_PROGRAM (constant).MintTo — accounts mint: ?, to: ?, authority: ? s — amount: 1 — PDA signer: ? (1 seeds)
- shared.ts:19075 [conditional] SYSTEM_PROGRAM (constant).CreateAccount — lamports: j, ci, b
- shared.ts:19147 [conditional] SYSTEM_PROGRAM (constant).Transfer — accounts from: payer s, to: ? — lamports: cj
- shared.ts:19198 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: ci — PDA signer: ? (1 seeds)
- shared.ts:19225 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: b — PDA signer: ? (1 seeds)
- shared.ts:17543 [conditional] TOKEN_2022_PROGRAM (constant).TransferChecked — amount: ld64(s1e8 + 0x18), ld8(ld64(s1e8 + 0x30) + 0x30)
- shared.ts:17611 [conditional] TOKEN_PROGRAM (constant).Transfer — amount: ld64(s1e8 + 0x18)
- shared.ts:18725 [conditional] SYSTEM_PROGRAM (constant).Transfer — accounts from: payer s, to: ? — lamports: cb
- shared.ts:18782 [conditional] program not decoded
  - const by = invoke_signed(s178, s160, sd8, 4, fp)
- shared.ts:18078 [conditional] TOKEN_2022_PROGRAM (constant).CloseAccount — accounts account: ?, destination: ?, authority: ? s — PDA signer: ? (an seeds)
- shared.ts:23845 [conditional] program not decoded
  - k = invoke_signed(s78, se0, al, 2, fp)

## PDAs derived

- bundle/open_position_with_token22_nft.ts:4619 find_program_address(["tick_array", *aj, u32 bswap32(f)], program *s150)
- shared.ts:16639 find_program_address(["pool_tick_array_bitmap_extension", *b], program *s20)
- shared.ts:3436 create_program_address(["pool", *(ad + 1), *(ad + 0x41), *(ad + 0x61), (ae != 0 ? ad + 0x17f : 1)[..(ae != 0) << 1], ad[..1]], program *s148)
- shared.ts:3482 create_program_address(["pool", *(ld64(s5b0)), *(ld64(s5a8)), *(ld64(s5a8 + 8)), (bv != 0 ? bw : 1)[..(bv != 0) << 1], bu[..1]], program *s148)
- shared.ts:4125 create_program_address(["pool", *(ld64(s5b0)), *(ld64(s5a8)), *(ld64(s5a8 + 8)), (bp != 0 ? bq : 1)[..(bp != 0) << 1], bo[..1]], program *s28)
- shared.ts:14304 create_program_address(["pool", *(b + 1), *(b + 0x41), *(b + 0x61), (u != 0 ? b + 0x17f : 1)[..(u != 0) << 1], b[..1]], program *s28)
- shared.ts:14310 find_program_address(["pool_tick_array_bitmap_extension", *s48], program *sc8)
- shared.ts:13831 create_program_address(["pool", *(b + 1), *(b + 0x41), *(b + 0x61), (f != 0 ? b + 0x17f : 1)[..(f != 0) << 1], b[..1]], program *s28)
- compared with provided accounts: tick_array_lower NOT FOUND, tick_array_upper NOT FOUND, personal_position NOT FOUND

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

- bundle/open_position_with_token22_nft.ts:3206 ACCOUNT_CREATE: 5 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner)
  - sources: from ← payer.key (caller-controlled)
- bundle/open_position_with_token22_nft.ts:4356 PDA_SIGNATURE: 6 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner; key)
- shared.ts:5026 MINT, PDA_SIGNATURE: 27 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner; custom; key; writable; …)
- shared.ts:19075 ACCOUNT_CREATE: 14 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner; custom; key; writable; …)
- shared.ts:19147 LAMPORT_TRANSFER: 14 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner; custom; key; writable; …)
  - sources: from ← payer.key (caller-controlled)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE: 14 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner; custom; key; writable; …)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE: 14 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner; custom; key; writable; …)
- shared.ts:14517 ACCOUNT_DATA_WRITE: 23 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner; custom; key; writable; …)
- shared.ts:14518 ACCOUNT_DATA_WRITE: 23 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner; custom; key; writable; …)
- shared.ts:14519 ACCOUNT_DATA_WRITE: 23 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner; custom; key; writable; …)
- shared.ts:14520 ACCOUNT_DATA_WRITE: 23 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner; custom; key; writable; …)
- shared.ts:14521 ACCOUNT_DATA_WRITE: 23 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner; custom; key; writable; …)
- shared.ts:14522 ACCOUNT_DATA_WRITE: 23 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner; custom; key; writable; …)
- shared.ts:14523 ACCOUNT_DATA_WRITE: 23 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner; custom; key; writable; …)
- shared.ts:14524 ACCOUNT_DATA_WRITE: 23 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner; custom; key; writable; …)
- shared.ts:14525 ACCOUNT_DATA_WRITE: 23 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner; custom; key; writable; …)
- shared.ts:14526 ACCOUNT_DATA_WRITE: 23 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner; custom; key; writable; …)
- shared.ts:14527 ACCOUNT_DATA_WRITE: 23 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner; custom; key; writable; …)
- shared.ts:14528 ACCOUNT_DATA_WRITE: 23 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner; custom; key; writable; …)
- shared.ts:14529 ACCOUNT_DATA_WRITE: 23 dominating checks (signer payer; signer position_nft_mint; pda; custom token_account_0; owner; custom; key; writable; …)

## Authority (who enables each value movement / authority change)

- shared.ts:5026 MINT, PDA_SIGNATURE: signer payer (found); signer position_nft_mint (found); pda PDA signature ? (1 seeds)
- shared.ts:19147 LAMPORT_TRANSFER: signer payer (found); signer position_nft_mint (found)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE: signer payer (found); signer position_nft_mint (found); pda PDA signature ? (1 seeds)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE: signer payer (found); signer position_nft_mint (found); pda PDA signature ? (1 seeds)
- shared.ts:17543 TOKEN_TRANSFER: signer payer (found); signer position_nft_mint (found)
- shared.ts:17611 TOKEN_TRANSFER: signer payer (found); signer position_nft_mint (found)
- shared.ts:18725 LAMPORT_TRANSFER: signer payer (found); signer position_nft_mint (found)
- shared.ts:18078 ACCOUNT_CLOSE, PDA_SIGNATURE: signer payer (found); signer position_nft_mint (found); pda PDA signature ? (an seeds)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- shared.ts:5026 MINT, PDA_SIGNATURE TOKEN_2022_PROGRAM.MintTo [MINT]
  - [found] mint authority is a signer or PDA — PDA signature ? (1 seeds)
  - [NOT FOUND] mint account bound — account not identified
  - [NOT FOUND] token account bound — account not identified
  - [found] relevant checks on every path — 27 dominating checks
- shared.ts:19147 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer [LAMPORT_TRANSFER]
  - [found] debited account authorized (signer / PDA / owned by the program) — payer: signer found
  - [found] authorized (signer / PDA signature / stored authority) — signer payer (found); signer position_nft_mint (found)
  - [found] amount arithmetic checked — sat_sub(j, h) (saturating)
  - [found] relevant checks on every path — 14 dominating checks
- shared.ts:14517 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer payer accounts_open_position_with_token22_nft:18; signer position_nft_mint accounts_open_position_with_token22_nft:64; pda  accounts_open_position_with_token22_nft:111
- shared.ts:14518 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer payer accounts_open_position_with_token22_nft:18; signer position_nft_mint accounts_open_position_with_token22_nft:64; pda  accounts_open_position_with_token22_nft:111
- shared.ts:14519 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer payer accounts_open_position_with_token22_nft:18; signer position_nft_mint accounts_open_position_with_token22_nft:64; pda  accounts_open_position_with_token22_nft:111
- shared.ts:14520 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer payer accounts_open_position_with_token22_nft:18; signer position_nft_mint accounts_open_position_with_token22_nft:64; pda  accounts_open_position_with_token22_nft:111
- shared.ts:14521 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer payer accounts_open_position_with_token22_nft:18; signer position_nft_mint accounts_open_position_with_token22_nft:64; pda  accounts_open_position_with_token22_nft:111
- shared.ts:14522 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer payer accounts_open_position_with_token22_nft:18; signer position_nft_mint accounts_open_position_with_token22_nft:64; pda  accounts_open_position_with_token22_nft:111
- shared.ts:17543 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer payer (found); signer position_nft_mint (found)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_2022_PROGRAM
  - [found] relevant checks on every path — 26 dominating checks
- shared.ts:17611 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer payer (found); signer position_nft_mint (found)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_PROGRAM
  - [found] relevant checks on every path — 26 dominating checks
- shared.ts:18725 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer [LAMPORT_TRANSFER]
  - [found] debited account authorized (signer / PDA / owned by the program) — payer: signer found
  - [found] authorized (signer / PDA signature / stored authority) — signer payer (found); signer position_nft_mint (found)
  - [found] amount arithmetic checked — sat_sub(ap, aq) (saturating)
  - [found] relevant checks on every path — 27 dominating checks
- shared.ts:18078 ACCOUNT_CLOSE, PDA_SIGNATURE TOKEN_2022_PROGRAM.CloseAccount [ACCOUNT_CLOSE]
  - [found] authorized (signer / PDA signature / stored authority) — signer payer (found); signer position_nft_mint (found); pda PDA signature ? (an seeds)
  - [found] data zeroed / closed discriminator / owner reassigned — owner reassigned fn_82dd0:186
  - [found] not reopened (no realloc after the close) — no realloc after it in the instruction
  - [found] relevant checks on every path — 28 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- shared.ts:5026 MINT, PDA_SIGNATURE TOKEN_2022_PROGRAM.MintTo ⇐ signer payer (found)
- shared.ts:5026 MINT, PDA_SIGNATURE TOKEN_2022_PROGRAM.MintTo ⇐ signer position_nft_mint (found)
- shared.ts:5026 MINT, PDA_SIGNATURE TOKEN_2022_PROGRAM.MintTo ⇐ pda PDA signature ? (1 seeds)
- shared.ts:19147 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer ⇐ signer payer (found)
- shared.ts:19147 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer ⇐ signer position_nft_mint (found)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer payer (found)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer position_nft_mint (found)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer payer (found)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer position_nft_mint (found)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)
- shared.ts:17543 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked ⇐ signer payer (found)
- shared.ts:17543 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked ⇐ signer position_nft_mint (found)
- shared.ts:17611 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer ⇐ signer payer (found)
- shared.ts:17611 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer ⇐ signer position_nft_mint (found)
- shared.ts:18725 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer ⇐ signer payer (found)
- shared.ts:18725 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer ⇐ signer position_nft_mint (found)
- shared.ts:18078 ACCOUNT_CLOSE, PDA_SIGNATURE TOKEN_2022_PROGRAM.CloseAccount ⇐ signer payer (found)
- shared.ts:18078 ACCOUNT_CLOSE, PDA_SIGNATURE TOKEN_2022_PROGRAM.CloseAccount ⇐ signer position_nft_mint (found)
- shared.ts:18078 ACCOUNT_CLOSE, PDA_SIGNATURE TOKEN_2022_PROGRAM.CloseAccount ⇐ pda PDA signature ? (an seeds)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/open_position_with_token22_nft.ts:3206 ACCOUNT_CREATE SYSTEM_PROGRAM.CreateAccount: `u114 != -1` · `ae != -1` · `u101 != -1` · `ab != -1` · `u84 != -1` · `x != -1` · ✗ `ld64(s190) != 0` · ✗ `m != 0x800000000000001a /* Ok */` · `u89 != -1` · `u85 != -1` · … 16 more
- bundle/open_position_with_token22_nft.ts:4356 PDA_SIGNATURE: `u263 != -1` · `u253 != -1` · `u243 != -1` · `u239 != -1` · ✗ `bf == 0x8000000000000000` · `r == 2` · `u114 != -1` · `ae != -1` · `u101 != -1` · `ab != -1` · … 23 more
- shared.ts:4927 CPI: `dj > 0x300000007` · `cv != -1` · `cr != -1` · `co != -1` · `ck != -1` · `ci != -1` · `u296 != -1` · `u287 != -1` · `cf != -1` · `u276 != -1` · … 30 more (budget reached)
- shared.ts:5026 MINT, PDA_SIGNATURE TOKEN_2022_PROGRAM.MintTo: `u465 != -1` · `ea != -1` · `dy != -1` · `dw != -1` · `ds != -1` · `dq != -1` · `u424 != -1` · `u420 != -1` · ✗ `ld64(s268) != 0` · `u37 != -1` · … 30 more (budget reached)
- shared.ts:19075 ACCOUNT_CREATE SYSTEM_PROGRAM.CreateAccount: `u100 != -1` · `u90 != -1` · `u86 != -1` · `u82 != -1` · `h == 0` · ✗ `ld64(s190) != 0` · `u259 != -1` · `u255 != -1` · `(memcmp(s170, s130, 0x20) as u32) == 0` #54 · `(y as u32) == 0` · … 30 more (budget reached)
- shared.ts:19147 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer: `u181 != -1` · `u172 != -1` · `u168 != -1` · `u158 != -1` · `u153 != -1` · `u42 != -1` · `j > h` · ✗ `h == 0` · ✗ `ld64(s190) != 0` · `u259 != -1` · … 30 more (budget reached)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign: `u231 != -1` · `u222 != -1` · `u218 != -1` · `u214 != -1` · ✗ `h == 0` · ✗ `ld64(s190) != 0` · `u259 != -1` · `u255 != -1` · `(memcmp(s170, s130, 0x20) as u32) == 0` #54 · `(y as u32) == 0` · … 30 more (budget reached)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign: `u277 != -1` · `u273 != -1` · `u267 != -1` · `u261 != -1` · `ad == 2` · `u231 != -1` · `u222 != -1` · `u218 != -1` · `u214 != -1` · ✗ `h == 0` · … 30 more (budget reached)
- shared.ts:14517 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14518 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14519 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14520 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14521 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14522 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14523 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)
- shared.ts:14524 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)

## Arithmetic on value paths

- shared.ts:19110 SYSTEM_PROGRAM.Transfer.lamports ← `sat_sub(j, h)`: saturating
- shared.ts:18700 SYSTEM_PROGRAM.Transfer.lamports ← `sat_sub(ap, aq)`: saturating

## Relations (equalities the checks establish)

- tick_array_state_data.discriminator ~ 0x2a81f931cd559bc0 /* account:TickArrayState */ (compare, PARTIAL, shared.ts:3417)
- tick_array_state_data.discriminator ~ 0x2a81f931cd559bc0 /* account:TickArrayState */ (compare, PARTIAL, shared.ts:19555)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): payer.key, position_nft_owner.key, position_nft_mint.key, position_nft_account.key, pool_state.key, protocol_position.key, tick_array_lower.key, tick_array_upper.key, personal_position.key, token_vault_1.key, rent.key, system_program.key, token_program.key, associated_token_program.key, token_program_2022.key, vault_0_mint.key, vault_1_mint.key, tick_array_state.key, tick_array_state_data.key, ix.tick_lower_index, ix.tick_upper_index, ix.tick_array_lower_start_index, ix.tick_array_upper_start_index, ix.liquidity, ix.amount_0_max, ix.amount_1_max, ix.with_metadata, ix.base_flag
- pool_state.data: runtime (owner runtime @fn_6d670:247)
- token_account_0.key: partially-validated (key partial @fn_a6478:15)
- token_account_1.key: partially-validated (key partial @fn_a6478:46)
- token_vault_0.key: partially-validated (key partial @fn_a6478:77)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/open_position_with_token22_nft.ts:391 | found | payer | signer (via try_accounts_17a30 (count, signer)) | `i != 2` | return |
| 1 | bundle/open_position_with_token22_nft.ts:437 | found | position_nft_mint | signer (via try_accounts_17a30 (count, signer)) | `i != 2` | return |
| 2 | bundle/open_position_with_token22_nft.ts:484 | found |  | pda | `t == 2` | anchor::ConstraintSeeds |
| 3 | bundle/open_position_with_token22_nft.ts:501 | PARTIAL |  | count | `v == 0` | anchor::AccountNotEnoughKeys |
| 4 | bundle/open_position_with_token22_nft.ts:580 | PARTIAL |  | count | `al == 2` | anchor::AccountNotEnoughKeys |
| 5 | bundle/open_position_with_token22_nft.ts:616 | PARTIAL |  | pda | `an == 2` | anchor::ConstraintSeeds |
| 6 | bundle/open_position_with_token22_nft.ts:631 | PARTIAL |  | pda | `aq == 2` | anchor::ConstraintSeeds |
| 7 | bundle/open_position_with_token22_nft.ts:646 | PARTIAL |  | pda | `au == 2` | anchor::ConstraintSeeds |
| 8 | bundle/open_position_with_token22_nft.ts:661 | PARTIAL |  | pda | `ax == 2` | anchor::ConstraintSeeds |
| 9 | bundle/open_position_with_token22_nft.ts:690 | PARTIAL |  | pda | `bd == 2` | anchor::ConstraintSeeds |
| 10 | bundle/open_position_with_token22_nft.ts:706 | PARTIAL |  | pda | `bg == 2` | anchor::ConstraintSeeds |
| 11 | bundle/open_position_with_token22_nft.ts:721 | PARTIAL |  | pda | `bj == 2` | anchor::ConstraintSeeds |
| 12 | bundle/open_position_with_token22_nft.ts:736 | PARTIAL |  | pda | `bm == 2` | anchor::ConstraintSeeds |
| 13 | bundle/open_position_with_token22_nft.ts:751 | PARTIAL |  | pda | `bp == 2` | anchor::ConstraintSeeds |
| 14 | bundle/open_position_with_token22_nft.ts:766 | PARTIAL |  | pda | `bs == 2` | anchor::ConstraintSeeds |
| 15 | bundle/open_position_with_token22_nft.ts:799 | PARTIAL |  | key, pda | `!((memcmp(s1d8, s200, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 16 | bundle/open_position_with_token22_nft.ts:806 | PARTIAL | personal_position | writable | `personal_position.is_writable == 0` | anchor::ConstraintMut |
| 17 | bundle/open_position_with_token22_nft.ts:829 | PARTIAL |  | rent_exempt | `!(ld64(s768) != 0)` | anchor::ConstraintRentExempt |
| 18 | bundle/open_position_with_token22_nft.ts:830 | PARTIAL | payer | writable | `payer.is_writable == 0` | anchor::ConstraintMut |
| 19 | bundle/open_position_with_token22_nft.ts:831 | PARTIAL |  | writable | `!(ld8(ld64(s730 + 0x68) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 20 | bundle/open_position_with_token22_nft.ts:832 | PARTIAL |  | writable | `!(ld8(ld64(s730 + 0x60) + 0x29) != 0)` | anchor::ConstraintMut |
| 21 | bundle/open_position_with_token22_nft.ts:833 | PARTIAL |  | writable | `!(ld8(ld64(s730 + 0x58) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 22 | bundle/open_position_with_token22_nft.ts:849 | PARTIAL |  | key, pda | `(memcmp(s148, s188, 0x20) as u32) != 0` | anchor::ConstraintSeeds |
| 23 | bundle/open_position_with_token22_nft.ts:863 | PARTIAL |  | writable | `!(ld8(ld64(s730 + 0x48) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 24 | bundle/open_position_with_token22_nft.ts:878 | PARTIAL |  | key, pda | `(memcmp(se0, s128, 0x20) as u32) != 0` | anchor::ConstraintSeeds |
| 25 | bundle/open_position_with_token22_nft.ts:892 | PARTIAL |  | writable | `!(ld8(ld64(s730 + 0x38) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 26 | bundle/open_position_with_token22_nft.ts:893 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s730 + 0x30) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 27 | bundle/open_position_with_token22_nft.ts:896 | PARTIAL |  | token_mint | `(memcmp(ld64(s730 + 0x30) + 0x28, s40, 0x20) as u32) != 0` | anchor::ConstraintTokenMint |
| 28 | bundle/open_position_with_token22_nft.ts:904 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s730 + 0x28) + 0x20) + 0x29) != 0)` | anchor::ConstraintMut |
| 29 | bundle/open_position_with_token22_nft.ts:908 | PARTIAL |  | token_mint | `(ct as u32) != 0` | anchor::ConstraintTokenMint |
| 30 | bundle/open_position_with_token22_nft.ts:917 | PARTIAL | token_vault_0 | writable | `token_vault_0.is_writable == 0` | anchor::ConstraintMut |
| 31 | bundle/open_position_with_token22_nft.ts:931 | PARTIAL |  | raw | `!((cy as u32) == 0)` | anchor::ConstraintRaw |
| 32 | bundle/open_position_with_token22_nft.ts:933 | PARTIAL | token_vault_1 | writable | `token_vault_1.is_writable == 0` | anchor::ConstraintMut |
| 33 | bundle/open_position_with_token22_nft.ts:947 | PARTIAL |  | raw | `!((db as u32) == 0)` | anchor::ConstraintRaw |
| 34 | bundle/open_position_with_token22_nft.ts:952 | PARTIAL |  | key, address | `(memcmp(sc0, sa0, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 35 | bundle/open_position_with_token22_nft.ts:970 | PARTIAL |  | address | `j != 0` | anchor::ConstraintAddress |
| 36 | bundle/open_position_with_token22_nft.ts:1243 | found | token_account_0 | custom | `!(ld8(accounts.token_account_0 + 0x94) != 2 && ld8(accounts.token_account_1 + 0x94) != 2)` | error::NotApproved |
| 37 | bundle/open_position_with_token22_nft.ts:1604 | PARTIAL | pool_state |  | `f != 2` | return |
| 38 | bundle/open_position_with_token22_nft.ts:1607 | PARTIAL | personal_position |  | `f != 2` | return |
| 39 | bundle/open_position_with_token22_nft.ts:1611 | PARTIAL | token_account_0 | key | `(memcmp(m, c, 0x20) as u32) == 0 && (common_is_closed(n) == 0 && ld64(ld64(n + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 40 | bundle/open_position_with_token22_nft.ts:1642 | PARTIAL | token_account_1 | key | `(memcmp(r, c, 0x20) as u32) == 0 && (common_is_closed(s) == 0 && ld64(ld64(s + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 41 | bundle/open_position_with_token22_nft.ts:1673 | PARTIAL | token_vault_0 | key | `(memcmp(u, c, 0x20) as u32) == 0 && (common_is_closed(v) == 0 && ld64(ld64(v + 0x10) + 0x10) != 0)` | Err(ProgramError::AccountBorrowFailed) |
| 42 | shared.ts:1017 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 43 | shared.ts:1035 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 44 | shared.ts:1043 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 45 | bundle/open_position_with_token22_nft.ts:3322 | PARTIAL |  | custom | `ax != 0x12` | error::NotSupportMint |
| 46 | bundle/open_position_with_token22_nft.ts:3576 | PARTIAL |  | custom | `!((p & 1) == 0)` | error::NotApproved |
| 47 | bundle/open_position_with_token22_nft.ts:4319 | PARTIAL |  | key | `(memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 48 | bundle/open_position_with_token22_nft.ts:4231 | PARTIAL |  | key | `(memcmp(b, 0x100159660 /* &TOKEN_2022_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 49 | bundle/open_position_with_token22_nft.ts:4364 | PARTIAL |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 50 | bundle/open_position_with_token22_nft.ts:4369 | PARTIAL |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 51 | bundle/open_position_with_token22_nft.ts:4380 | PARTIAL |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 52 | bundle/open_position_with_token22_nft.ts:4447 | PARTIAL |  | custom | `!((c as i32) > -0x6c4f5)` | error::TickLowerOverflow |
| 53 | bundle/open_position_with_token22_nft.ts:4448 | PARTIAL |  | custom | `!(0x6c4f5 > (c as i32))` | error::TickUpperOverflow |
| 54 | bundle/open_position_with_token22_nft.ts:4625 | PARTIAL |  | key | `!((memcmp(s170, s130, 0x20) as u32) == 0)` | anchor::RequireKeysEqViolated |
| 55 | shared.ts:19330 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 56 | shared.ts:3417 | PARTIAL | tick_array_state | state | `tick_array_state_data.discriminator != 0x2a81f931cd559bc0 /* account:TickArrayState */` | return |
| 57 | shared.ts:3465 | PARTIAL | tick_array_state_data | state | `tick_array_state_data_3.discriminator != 0x2a81f931cd559bc0 /* account:TickArrayState */` | return |
| 58 | shared.ts:3488 | PARTIAL |  | discriminator | `!((by as u32) == 0)` | anchor::AccountDiscriminatorNotFound |
| 59 | shared.ts:3682 | PARTIAL |  | custom | `(ld64(s5a8 + 8) \| ld64(s5a8)) == 0` | error::ForbidBothZeroForSupplyLiquidity |
| 60 | shared.ts:3764 | PARTIAL |  | custom | `ld64(s558 + 0x38) > ld64(s510 + 8)` | error::PriceSlippageCheck |
| 61 | shared.ts:3797 | PARTIAL |  | custom | `ed + ee > ld64(s510)` | error::PriceSlippageCheck |
| 62 | shared.ts:19395 | PARTIAL |  | key, owner | `(memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20) as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 63 | shared.ts:19430 | PARTIAL |  | writable | `!((c & 1) != 0)` | anchor::AccountNotMutable |
| 64 | shared.ts:13043 | PARTIAL |  | custom | `!(0xd89e9 > ((b + 0x6c4f4) as u32))` | error::TickUpperOverflow |
| 65 | shared.ts:19546 | PARTIAL |  | writable | `!((c & 1) != 0)` | anchor::AccountNotMutable |
| 66 | shared.ts:19555 | PARTIAL | tick_array_state | state | `tick_array_state_data.discriminator != 0x2a81f931cd559bc0 /* account:TickArrayState */` | return |
| 67 | shared.ts:19556 | PARTIAL |  | discriminator | `g <= 0x27ff` | anchor::AccountDiscriminatorMismatch |
| 68 | shared.ts:14313 | PARTIAL |  | key | `(memcmp(s1a8, se8, 0x20) as u32) != 0` | anchor::RequireKeysEqViolated |
| 69 | shared.ts:14375 | PARTIAL |  | writable | `!(ld8(v + 0x29) != 0)` | anchor::AccountNotMutable |
| 70 | bundle/open_position_with_token22_nft.ts:2311 | PARTIAL |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 71 | bundle/open_position_with_token22_nft.ts:2322 | PARTIAL |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 72 | entrypoint.ts:3832 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 73 | shared.ts:15478 | PARTIAL |  | custom | `(g as u32) != (b as u32)` | error::InvalidTickArray |
| 74 | shared.ts:10528 | PARTIAL |  | custom | `0 > (e as i64)` | error::LiquiditySubValueErr |
| 75 | shared.ts:1069 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 76 | shared.ts:1087 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 77 | shared.ts:1095 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x998b8061db24963c /* account:TickArrayBitmapExtension */` | anchor::AccountDiscriminatorMismatch |
| 78 | entrypoint.ts:4230 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 79 | entrypoint.ts:4332 | PARTIAL |  | key | `(memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 80 | entrypoint.ts:4071 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 81 | shared.ts:24098 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 82 | shared.ts:10732 | PARTIAL |  | custom | `!((h \| i) != 0)` | error::ZeroSqrtPrice |
