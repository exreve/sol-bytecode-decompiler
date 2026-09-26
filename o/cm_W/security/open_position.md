# open_position

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_open_position (anchor); 141 functions reachable: ix_open_position, accounts_open_position, memcpy, fn_1b850, fn_989f8, anchor_error_from, fn_5608, fn_4130, fn_11e480, fn_147a20, fn_153158, fn_13e628, ….

## Look first

- ⚠ position_nft_account: pda expected, no check found
- ⚠ metadata_account: writable expected, no check found
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
- ⚠ metadata_program: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | payer | expected · found | expected · PARTIAL | — | — | — |
| 1 | position_nft_owner | — | — | — | — | — |
| 2 | position_nft_mint | expected · PARTIAL | expected · PARTIAL | — | — | — |
| 3 | position_nft_account | — | expected · PARTIAL | — | — | — |
| 4 | metadata_account | — | expected · NOT FOUND | — | — | — |
| 5 | pool_state | — | expected · runtime | runtime | — | — |
| 6 | protocol_position | — | — | — | — | — |
| 7 | tick_array_lower | — | expected · NOT FOUND | — | — | — |
| 8 | tick_array_upper | — | expected · NOT FOUND | — | — | — |
| 9 | personal_position | — | expected · PARTIAL | — | — | — |
| 10 | token_account_0 | — | expected · NOT FOUND | — | — | — |
| 11 | token_account_1 | — | expected · NOT FOUND | — | — | — |
| 12 | token_vault_0 | — | expected · PARTIAL | — | — | — |
| 13 | token_vault_1 | — | expected · PARTIAL | — | — | — |
| 14 | rent | — | — | — | — | = SysvarRe… · expected · NOT FOUND |
| 15 | system_program | — | — | — | — | = 11111111… · expected · NOT FOUND |
| 16 | token_program | — | — | — | — | = Tokenkeg… · expected · NOT FOUND |
| 17 | associated_token_program | — | — | — | — | = ATokenGP… · expected · NOT FOUND |
| 18 | metadata_program | — | — | — | — | = metaqbxx… · expected · NOT FOUND |
|  | tick_array_state [code] | — | — | — | — | — |
|  | tick_array_state_data [code] | — | — | — | — | — |

## Constraints per account

- payer: signer found (bundle/open_position.ts:285 via try_accounts_17a30); writable PARTIAL (bundle/open_position.ts:758)
- position_nft_owner: count found (bundle/open_position.ts:288)
- position_nft_mint: writable PARTIAL (bundle/open_position.ts:640); signer PARTIAL (bundle/open_position.ts:641); key PARTIAL (bundle/open_position.ts:1368)
- position_nft_account: writable PARTIAL (bundle/open_position.ts:680); key PARTIAL (bundle/open_position.ts:1400); pda NOT FOUND
- metadata_account: writable NOT FOUND
- pool_state: writable runtime (shared.ts:14517) — written: the runtime rejects changes to a read-only account; owner runtime (shared.ts:14517) — data written / lamports debited: only the owner program may (the runtime rejects it otherwise)
- protocol_position: no checks found
- tick_array_lower: writable NOT FOUND; pda NOT FOUND
- tick_array_upper: writable NOT FOUND; pda NOT FOUND
- personal_position: writable PARTIAL (bundle/open_position.ts:738); pda NOT FOUND
- token_account_0: key PARTIAL (bundle/open_position.ts:1469); writable NOT FOUND
- token_account_1: writable NOT FOUND
- token_vault_0: writable PARTIAL (bundle/open_position.ts:844)
- token_vault_1: writable PARTIAL (bundle/open_position.ts:860)
- rent: address NOT FOUND
- system_program: address NOT FOUND
- token_program: address NOT FOUND
- associated_token_program: address NOT FOUND
- metadata_program: address NOT FOUND
- tick_array_state: state PARTIAL (shared.ts:3417)
- tick_array_state_data: state PARTIAL (shared.ts:3465)

## CPIs

- bundle/open_position.ts:1782 [conditional] SYSTEM_PROGRAM (constant).Transfer — lamports: ld64(s430 + 8)
- bundle/open_position.ts:1830 [conditional] SYSTEM_PROGRAM (constant).Assign — lamports: 0x52
- bundle/open_position.ts:1877 [conditional] SYSTEM_PROGRAM (constant).Assign — lamports: s48
- bundle/open_position.ts:1950 [conditional] SYSTEM_PROGRAM (constant).CreateAccount — accounts from: ? s, to: ? — lamports: ld64(s3c0), 0x52, s48
- bundle/open_position.ts:2323 [conditional] SYSTEM_PROGRAM (constant).Transfer — lamports: ld64(s470)
- bundle/open_position.ts:2389 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: 0x119 — PDA signer: ? (1 seeds)
- bundle/open_position.ts:2443 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: ld64(ld64(ld64(s428 + 0x38) + 0x30)) — PDA signer: ? (1 seeds)
- bundle/open_position.ts:2527 [conditional] SYSTEM_PROGRAM (constant).CreateAccount — accounts from: ? s, to: ? — lamports: ld64(s428 + 0x30), 0x119, ld64(ld64(b + 0x30)) — PDA signer: ? (1 seeds)
- shared.ts:24806 [conditional] program not decoded
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

- bundle/open_position.ts:721 find_program_address(["position", *s138], program *(ld64(s260)))
- bundle/open_position.ts:770 find_program_address(["tick_array", *cl, u32 bswap32(ld64(s790 + 0x70)) [ix data?]], program *(ld64(s260)))
- bundle/open_position.ts:799 find_program_address(["tick_array", *s88, u32 bswap32(ld64(s790 + 0x78)) [ix data?]], program *(ld64(s260)))
- bundle/open_position.ts:4344 find_program_address(["tick_array", *aj, u32 bswap32(f)], program *s150)
- bundle/open_position.ts:4733 find_program_address(["pool_tick_array_bitmap_extension", *b], program *s20)
- shared.ts:3436 create_program_address(["pool", *(ad + 1), *(ad + 0x41), *(ad + 0x61), (ae != 0 ? ad + 0x17f : 1)[..(ae != 0) << 1], ad[..1]], program *s148)
- shared.ts:3482 create_program_address(["pool", *(ld64(s5b0)), *(ld64(s5a8)), *(ld64(s5a8 + 8)), (bv != 0 ? bw : 1)[..(bv != 0) << 1], bu[..1]], program *s148)
- shared.ts:4125 create_program_address(["pool", *(ld64(s5b0)), *(ld64(s5a8)), *(ld64(s5a8 + 8)), (bp != 0 ? bq : 1)[..(bp != 0) << 1], bo[..1]], program *s28)
- shared.ts:14304 create_program_address(["pool", *(b + 1), *(b + 0x41), *(b + 0x61), (u != 0 ? b + 0x17f : 1)[..(u != 0) << 1], b[..1]], program *s28)
- shared.ts:14310 find_program_address(["pool_tick_array_bitmap_extension", *s48], program *sc8)
- shared.ts:13831 create_program_address(["pool", *(b + 1), *(b + 0x41), *(b + 0x61), (f != 0 ? b + 0x17f : 1)[..(f != 0) << 1], b[..1]], program *s28)
- compared with provided accounts: position_nft_account NOT FOUND, tick_array_lower NOT FOUND, tick_array_upper NOT FOUND, personal_position NOT FOUND

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

- bundle/open_position.ts:1782 LAMPORT_TRANSFER: 4 dominating checks (signer payer; owner; address; key)
- bundle/open_position.ts:1830 OWNER_ASSIGN: 4 dominating checks (signer payer; owner; address; key)
- bundle/open_position.ts:1877 OWNER_ASSIGN: 4 dominating checks (signer payer; owner; address; key)
- bundle/open_position.ts:1950 ACCOUNT_CREATE: 3 dominating checks (signer payer; owner; address)
- bundle/open_position.ts:2323 LAMPORT_TRANSFER: 11 dominating checks (signer payer; writable position_nft_mint; signer position_nft_mint; rent_exempt; writable position_nft_account; key; pda; owner; …)
- bundle/open_position.ts:2389 OWNER_ASSIGN, PDA_SIGNATURE: 11 dominating checks (signer payer; writable position_nft_mint; signer position_nft_mint; rent_exempt; writable position_nft_account; key; pda; owner; …)
- bundle/open_position.ts:2443 OWNER_ASSIGN, PDA_SIGNATURE: 11 dominating checks (signer payer; writable position_nft_mint; signer position_nft_mint; rent_exempt; writable position_nft_account; key; pda; owner; …)
- bundle/open_position.ts:2527 ACCOUNT_CREATE, PDA_SIGNATURE: 10 dominating checks (signer payer; writable position_nft_mint; signer position_nft_mint; rent_exempt; writable position_nft_account; key; pda; owner; …)
- shared.ts:24806 PDA_SIGNATURE: 3 dominating checks (signer payer; owner; address)
- shared.ts:5026 MINT, PDA_SIGNATURE: 50 dominating checks (signer payer; writable position_nft_mint; signer position_nft_mint; rent_exempt; writable position_nft_account; key; pda; writable personal_position; …)
- shared.ts:19075 ACCOUNT_CREATE: 39 dominating checks (signer payer; writable position_nft_mint; signer position_nft_mint; rent_exempt; writable position_nft_account; key; pda; writable personal_position; …)
- shared.ts:19147 LAMPORT_TRANSFER: 39 dominating checks (signer payer; writable position_nft_mint; signer position_nft_mint; rent_exempt; writable position_nft_account; key; pda; writable personal_position; …)
  - sources: from ← payer.key (caller-controlled)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE: 39 dominating checks (signer payer; writable position_nft_mint; signer position_nft_mint; rent_exempt; writable position_nft_account; key; pda; writable personal_position; …)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE: 39 dominating checks (signer payer; writable position_nft_mint; signer position_nft_mint; rent_exempt; writable position_nft_account; key; pda; writable personal_position; …)
- shared.ts:14517 ACCOUNT_DATA_WRITE: 48 dominating checks (signer payer; writable position_nft_mint; signer position_nft_mint; rent_exempt; writable position_nft_account; key; pda; writable personal_position; …)
- shared.ts:14518 ACCOUNT_DATA_WRITE: 48 dominating checks (signer payer; writable position_nft_mint; signer position_nft_mint; rent_exempt; writable position_nft_account; key; pda; writable personal_position; …)
- shared.ts:14519 ACCOUNT_DATA_WRITE: 48 dominating checks (signer payer; writable position_nft_mint; signer position_nft_mint; rent_exempt; writable position_nft_account; key; pda; writable personal_position; …)
- shared.ts:14520 ACCOUNT_DATA_WRITE: 48 dominating checks (signer payer; writable position_nft_mint; signer position_nft_mint; rent_exempt; writable position_nft_account; key; pda; writable personal_position; …)
- shared.ts:14521 ACCOUNT_DATA_WRITE: 48 dominating checks (signer payer; writable position_nft_mint; signer position_nft_mint; rent_exempt; writable position_nft_account; key; pda; writable personal_position; …)
- shared.ts:14522 ACCOUNT_DATA_WRITE: 48 dominating checks (signer payer; writable position_nft_mint; signer position_nft_mint; rent_exempt; writable position_nft_account; key; pda; writable personal_position; …)

## Authority (who enables each value movement / authority change)

- bundle/open_position.ts:1782 LAMPORT_TRANSFER: signer payer (found); signer position_nft_mint (PARTIAL)
- bundle/open_position.ts:1830 OWNER_ASSIGN: signer payer (found); signer position_nft_mint (PARTIAL)
- bundle/open_position.ts:1877 OWNER_ASSIGN: signer payer (found); signer position_nft_mint (PARTIAL)
- bundle/open_position.ts:2323 LAMPORT_TRANSFER: signer payer (found); signer position_nft_mint (PARTIAL)
- bundle/open_position.ts:2389 OWNER_ASSIGN, PDA_SIGNATURE: signer payer (found); signer position_nft_mint (PARTIAL); pda PDA signature ? (1 seeds)
- bundle/open_position.ts:2443 OWNER_ASSIGN, PDA_SIGNATURE: signer payer (found); signer position_nft_mint (PARTIAL); pda PDA signature ? (1 seeds)
- shared.ts:5026 MINT, PDA_SIGNATURE: signer payer (found); signer position_nft_mint (PARTIAL); pda PDA signature ? (1 seeds)
- shared.ts:19147 LAMPORT_TRANSFER: signer payer (found); signer position_nft_mint (PARTIAL)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE: signer payer (found); signer position_nft_mint (PARTIAL); pda PDA signature ? (1 seeds)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE: signer payer (found); signer position_nft_mint (PARTIAL); pda PDA signature ? (1 seeds)
- shared.ts:17543 TOKEN_TRANSFER: signer payer (found); signer position_nft_mint (PARTIAL)
- shared.ts:17611 TOKEN_TRANSFER: signer payer (found); signer position_nft_mint (PARTIAL)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/open_position.ts:1782 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer [LAMPORT_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer payer (found); signer position_nft_mint (partial)
  - [found] amount arithmetic checked — sat_sub(m, g) (saturating)
  - [found] relevant checks on every path — 8 dominating checks
- bundle/open_position.ts:2323 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer [LAMPORT_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer payer (found); signer position_nft_mint (partial)
  - [found] amount arithmetic checked — sat_sub(m, g) (saturating)
  - [found] relevant checks on every path — 15 dominating checks
- shared.ts:5026 MINT, PDA_SIGNATURE TOKEN_2022_PROGRAM.MintTo [MINT]
  - [found] mint authority is a signer or PDA — PDA signature ? (1 seeds)
  - [NOT FOUND] mint account bound — account not identified
  - [NOT FOUND] token account bound — account not identified
  - [found] relevant checks on every path — 55 dominating checks
- shared.ts:19147 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer [LAMPORT_TRANSFER]
  - [found] debited account authorized (signer / PDA / owned by the program) — payer: signer found
  - [found] authorized (signer / PDA signature / stored authority) — signer payer (found); signer position_nft_mint (partial)
  - [found] amount arithmetic checked — sat_sub(j, h) (saturating)
  - [found] relevant checks on every path — 44 dominating checks
- shared.ts:14517 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer payer accounts_open_position:19; signer position_nft_mint accounts_open_position:375; key/pda  accounts_open_position:463
- shared.ts:14518 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer payer accounts_open_position:19; signer position_nft_mint accounts_open_position:375; key/pda  accounts_open_position:463
- shared.ts:14519 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer payer accounts_open_position:19; signer position_nft_mint accounts_open_position:375; key/pda  accounts_open_position:463
- shared.ts:14520 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer payer accounts_open_position:19; signer position_nft_mint accounts_open_position:375; key/pda  accounts_open_position:463
- shared.ts:14521 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer payer accounts_open_position:19; signer position_nft_mint accounts_open_position:375; key/pda  accounts_open_position:463
- shared.ts:14522 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — pool_state: no discriminator check found
  - [found] write gated (signer / constraint) — signer payer accounts_open_position:19; signer position_nft_mint accounts_open_position:375; key/pda  accounts_open_position:463
- shared.ts:17543 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer payer (found); signer position_nft_mint (partial)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_2022_PROGRAM
  - [found] relevant checks on every path — 56 dominating checks
- shared.ts:17611 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer [TOKEN_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer payer (found); signer position_nft_mint (partial)
  - [NOT FOUND] signer related to a stored authority (or PDA signature) — no relation between a signer key and a stored field found
  - [NOT FOUND] source account bound — account not identified
  - [NOT FOUND] destination bound (owner / mint / key) — account not identified
  - [runtime] mints consistent — the token program requires source and destination of the same mint
  - [found] token program id — constant TOKEN_PROGRAM
  - [found] relevant checks on every path — 56 dominating checks
- shared.ts:18725 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer [LAMPORT_TRANSFER]
  - [found] debited account authorized (signer / PDA / owned by the program) — payer: signer found
  - [found] authorized (signer / PDA signature / stored authority) — signer payer (found); signer position_nft_mint (partial)
  - [found] amount arithmetic checked — sat_sub(ap, aq) (saturating)
  - [found] relevant checks on every path — 55 dominating checks
- shared.ts:18078 ACCOUNT_CLOSE, PDA_SIGNATURE TOKEN_2022_PROGRAM.CloseAccount [ACCOUNT_CLOSE]
  - [found] authorized (signer / PDA signature / stored authority) — signer payer (found); signer position_nft_mint (partial); pda PDA signature ? (an seeds)
  - [found] data zeroed / closed discriminator / owner reassigned — owner reassigned fn_94438:155
  - [found] not reopened (no realloc after the close) — no realloc after it in the instruction
  - [found] relevant checks on every path — 56 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/open_position.ts:1782 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer ⇐ signer payer (found)
- bundle/open_position.ts:1782 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer ⇐ signer position_nft_mint (PARTIAL)
- bundle/open_position.ts:1830 OWNER_ASSIGN SYSTEM_PROGRAM.Assign ⇐ signer payer (found)
- bundle/open_position.ts:1830 OWNER_ASSIGN SYSTEM_PROGRAM.Assign ⇐ signer position_nft_mint (PARTIAL)
- bundle/open_position.ts:1877 OWNER_ASSIGN SYSTEM_PROGRAM.Assign ⇐ signer payer (found)
- bundle/open_position.ts:1877 OWNER_ASSIGN SYSTEM_PROGRAM.Assign ⇐ signer position_nft_mint (PARTIAL)
- bundle/open_position.ts:2323 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer ⇐ signer payer (found)
- bundle/open_position.ts:2323 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer ⇐ signer position_nft_mint (PARTIAL)
- bundle/open_position.ts:2389 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer payer (found)
- bundle/open_position.ts:2389 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer position_nft_mint (PARTIAL)
- bundle/open_position.ts:2389 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)
- bundle/open_position.ts:2443 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer payer (found)
- bundle/open_position.ts:2443 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer position_nft_mint (PARTIAL)
- bundle/open_position.ts:2443 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)
- shared.ts:5026 MINT, PDA_SIGNATURE TOKEN_2022_PROGRAM.MintTo ⇐ signer payer (found)
- shared.ts:5026 MINT, PDA_SIGNATURE TOKEN_2022_PROGRAM.MintTo ⇐ signer position_nft_mint (PARTIAL)
- shared.ts:5026 MINT, PDA_SIGNATURE TOKEN_2022_PROGRAM.MintTo ⇐ pda PDA signature ? (1 seeds)
- shared.ts:19147 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer ⇐ signer payer (found)
- shared.ts:19147 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer ⇐ signer position_nft_mint (PARTIAL)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer payer (found)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer position_nft_mint (PARTIAL)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer payer (found)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer position_nft_mint (PARTIAL)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)
- shared.ts:17543 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked ⇐ signer payer (found)
- shared.ts:17543 TOKEN_TRANSFER TOKEN_2022_PROGRAM.TransferChecked ⇐ signer position_nft_mint (PARTIAL)
- shared.ts:17611 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer ⇐ signer payer (found)
- shared.ts:17611 TOKEN_TRANSFER TOKEN_PROGRAM.Transfer ⇐ signer position_nft_mint (PARTIAL)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/open_position.ts:1782 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer: `au != -1` · `ar != -1` · `u192 != -1` · `am != -1` · `u176 != -1` · `u56 != -1` · `m > g` · ✗ `(memcmp(s278, s258, 0x20) as u32) == 0` #42 · `g != 0` · ✗ `ld64(s40) != 0` · … 13 more
  - not required on some path: #7 (signer position_nft_mint)
- bundle/open_position.ts:1830 OWNER_ASSIGN SYSTEM_PROGRAM.Assign: `u265 != -1` · `bk != -1` · `u248 != -1` · `bd != -1` · ✗ `(memcmp(s278, s258, 0x20) as u32) == 0` #42 · `g != 0` · ✗ `ld64(s40) != 0` · ✗ `ay == 0` · `w != 0` #3 · ✗ `m == 1` #2 · … 10 more
  - not required on some path: #7 (signer position_nft_mint)
- bundle/open_position.ts:1877 OWNER_ASSIGN SYSTEM_PROGRAM.Assign: `bx != -1` · `bv != -1` · `u291 != -1` · `u287 != -1` · `ae == 2` · `u265 != -1` · `bk != -1` · `u248 != -1` · `bd != -1` · ✗ `(memcmp(s278, s258, 0x20) as u32) == 0` #42 · … 15 more
  - not required on some path: #7 (signer position_nft_mint)
- bundle/open_position.ts:1950 ACCOUNT_CREATE SYSTEM_PROGRAM.CreateAccount: `u91 != -1` · `v != -1` · `u75 != -1` · `r != -1` · `u60 != -1` · `u22 != -1` · ✗ `g != 0` · ✗ `ld64(s40) != 0` · ✗ `ay == 0` · `w != 0` #3 · … 11 more
  - not required on some path: #7 (signer position_nft_mint)
- bundle/open_position.ts:2323 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer: `aw != -1` · `au != -1` · `u205 != -1` · `an != -1` · `u189 != -1` · `u56 != -1` · `m > g` · ✗ `(memcmp(s2c8, s2a8, 0x20) as u32) == 0` #43 · `g != 0` · `(memcmp(s158, s180, 0x20) as u32) == 0` #11 · … 25 more
- bundle/open_position.ts:2389 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign: `u282 != -1` · `bm != -1` · `u265 != -1` · `bg != -1` · ✗ `(memcmp(s2c8, s2a8, 0x20) as u32) == 0` #43 · `g != 0` · `(memcmp(s158, s180, 0x20) as u32) == 0` #11 · ✗ `ld64(s40) != 0` · `bt != 0` #10 · ✗ `br != 0x800000000000001a /* Ok */` · … 22 more
- bundle/open_position.ts:2443 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign: `cb != -1` · `bz != -1` · `u329 != -1` · `u325 != -1` · `af == 2` · `u282 != -1` · `bm != -1` · `u265 != -1` · `bg != -1` · ✗ `(memcmp(s2c8, s2a8, 0x20) as u32) == 0` #43 · … 27 more
- bundle/open_position.ts:2527 ACCOUNT_CREATE, PDA_SIGNATURE SYSTEM_PROGRAM.CreateAccount: `u92 != -1` · `y != -1` · `u75 != -1` · `s != -1` · `u61 != -1` · `u21 != -1` · ✗ `g != 0` · `(memcmp(s158, s180, 0x20) as u32) == 0` #11 · ✗ `ld64(s40) != 0` · `bt != 0` #10 · … 23 more
- shared.ts:24806 PDA_SIGNATURE: `u355 != -1` · `cj != -1` · `u343 != -1` · `u339 != -1` · ✗ `ld64(s40) != 0` · ✗ `ay == 0` · `w != 0` #3 · ✗ `m == 1` #2 · `m != 0` #1 · `j == 2` #0 · … 8 more
  - not required on some path: #7 (signer position_nft_mint)
- shared.ts:4927 CPI: `dj > 0x300000007` · `cv != -1` · `cr != -1` · `co != -1` · `ck != -1` · `ci != -1` · `u296 != -1` · `u287 != -1` · `cf != -1` · `u276 != -1` · … 30 more (budget reached)
- shared.ts:5026 MINT, PDA_SIGNATURE TOKEN_2022_PROGRAM.MintTo: `u465 != -1` · `ea != -1` · `dy != -1` · `dw != -1` · `ds != -1` · `dq != -1` · `u424 != -1` · `u420 != -1` · ✗ `ld64(s268) != 0` · `u37 != -1` · … 30 more (budget reached)
- shared.ts:19075 ACCOUNT_CREATE SYSTEM_PROGRAM.CreateAccount: `u100 != -1` · `u90 != -1` · `u86 != -1` · `u82 != -1` · `h == 0` · ✗ `ld64(s190) != 0` · `u259 != -1` · `u255 != -1` · `(memcmp(s170, s130, 0x20) as u32) == 0` #55 · `(y as u32) == 0` · … 30 more (budget reached)
- shared.ts:19147 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer: `u181 != -1` · `u172 != -1` · `u168 != -1` · `u158 != -1` · `u153 != -1` · `u42 != -1` · `j > h` · ✗ `h == 0` · ✗ `ld64(s190) != 0` · `u259 != -1` · … 30 more (budget reached)
- shared.ts:19198 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign: `u231 != -1` · `u222 != -1` · `u218 != -1` · `u214 != -1` · ✗ `h == 0` · ✗ `ld64(s190) != 0` · `u259 != -1` · `u255 != -1` · `(memcmp(s170, s130, 0x20) as u32) == 0` #55 · `(y as u32) == 0` · … 30 more (budget reached)
- shared.ts:19225 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign: `u277 != -1` · `u273 != -1` · `u267 != -1` · `u261 != -1` · `ad == 2` · `u231 != -1` · `u222 != -1` · `u218 != -1` · `u214 != -1` · ✗ `h == 0` · … 30 more (budget reached)
- shared.ts:14517 ACCOUNT_DATA_WRITE pool_state.tick_array_bitmap: ✗ `i != 2` · ✗ `h != 0` · ✗ `0x300000008 > g` · ✗ `dn != 0` · `dn != 0xff` · ✗ `ld64(s108) != 0` · `(ld64(s590 + 8) & 1) != 0` · `dk == 2` · ✗ `ld64(s108) != 0` · `dk == 2` · … 30 more (budget reached)

## Arithmetic on value paths

- bundle/open_position.ts:1755 SYSTEM_PROGRAM.Transfer.lamports ← `sat_sub(m, g)`: saturating
- bundle/open_position.ts:2294 SYSTEM_PROGRAM.Transfer.lamports ← `sat_sub(m, g)`: saturating
- shared.ts:19110 SYSTEM_PROGRAM.Transfer.lamports ← `sat_sub(j, h)`: saturating
- shared.ts:18700 SYSTEM_PROGRAM.Transfer.lamports ← `sat_sub(ap, aq)`: saturating

## Relations (equalities the checks establish)

- tick_array_state_data.discriminator ~ 0x2a81f931cd559bc0 /* account:TickArrayState */ (compare, PARTIAL, shared.ts:3417)
- tick_array_state_data.discriminator ~ 0x2a81f931cd559bc0 /* account:TickArrayState */ (compare, PARTIAL, shared.ts:19555)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): payer.key, position_nft_owner.key, metadata_account.key, pool_state.key, protocol_position.key, tick_array_lower.key, tick_array_upper.key, personal_position.key, token_account_1.key, token_vault_0.key, token_vault_1.key, rent.key, system_program.key, token_program.key, associated_token_program.key, metadata_program.key, tick_array_state.key, tick_array_state_data.key, ix.tick_lower_index, ix.tick_upper_index, ix.tick_array_lower_start_index, ix.tick_array_upper_start_index, ix.liquidity, ix.amount_0_max, ix.amount_1_max
- position_nft_mint.key: partially-validated (key partial @fn_989f8:7)
- position_nft_account.key: partially-validated (key partial @fn_989f8:39)
- pool_state.data: runtime (owner runtime @fn_6d670:247)
- token_account_0.key: partially-validated (key partial @fn_989f8:108)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/open_position.ts:285 | found | payer | signer (via try_accounts_17a30 (count, signer)) | `j != 2` | return |
| 1 | bundle/open_position.ts:288 | found | position_nft_owner | count | `m == 0` | anchor::AccountNotEnoughKeys |
| 2 | bundle/open_position.ts:292 | found |  | count | `m == 1` | anchor::AccountNotEnoughKeys |
| 3 | bundle/open_position.ts:305 | found |  | count | `w == 0` | anchor::AccountNotEnoughKeys |
| 4 | bundle/open_position.ts:373 | found |  | count | `z == 0` | anchor::AccountNotEnoughKeys |
| 5 | bundle/open_position.ts:452 | PARTIAL |  | count | `aj == 2` | anchor::AccountNotEnoughKeys |
| 6 | bundle/open_position.ts:640 | PARTIAL | position_nft_mint | writable | `position_nft_mint.is_writable == 0` | anchor::ConstraintMut |
| 7 | bundle/open_position.ts:641 | PARTIAL | position_nft_mint | signer | `position_nft_mint.is_signer == 0` | anchor::ConstraintSigner |
| 8 | bundle/open_position.ts:660 | PARTIAL |  | rent_exempt | `bp == 0` | anchor::ConstraintRentExempt |
| 9 | bundle/open_position.ts:680 | PARTIAL | position_nft_account | writable | `position_nft_account.is_writable == 0` | anchor::ConstraintMut |
| 10 | bundle/open_position.ts:699 | PARTIAL |  | rent_exempt | `bt == 0` | anchor::ConstraintRentExempt |
| 11 | bundle/open_position.ts:729 | PARTIAL |  | key, pda | `!((memcmp(s158, s180, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 12 | bundle/open_position.ts:738 | PARTIAL | personal_position | writable | `personal_position.is_writable == 0` | anchor::ConstraintMut |
| 13 | bundle/open_position.ts:757 | PARTIAL |  | rent_exempt | `ck == 0` | anchor::ConstraintRentExempt |
| 14 | bundle/open_position.ts:758 | PARTIAL | payer | writable | `payer.is_writable == 0` | anchor::ConstraintMut |
| 15 | bundle/open_position.ts:759 | PARTIAL |  | writable | `!(ld8(ld64(s790 + 0x60) + 0x29) != 0)` | anchor::ConstraintMut |
| 16 | bundle/open_position.ts:760 | PARTIAL |  | writable | `!(ld8(ld64(s790 + 0x58) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 17 | bundle/open_position.ts:776 | PARTIAL |  | key, pda | `(memcmp(sc8, s108, 0x20) as u32) != 0` | anchor::ConstraintSeeds |
| 18 | bundle/open_position.ts:790 | PARTIAL |  | writable | `!(ld8(ld64(s790 + 0x48) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 19 | bundle/open_position.ts:805 | PARTIAL |  | key, pda | `(memcmp(s60, sa8, 0x20) as u32) != 0` | anchor::ConstraintSeeds |
| 20 | bundle/open_position.ts:819 | PARTIAL |  | writable | `!(ld8(ld64(s790 + 0x38) + 0x29 /* is_writable */) != 0)` | anchor::ConstraintMut |
| 21 | bundle/open_position.ts:820 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s790 + 0x30)) + 0x29) != 0)` | anchor::ConstraintMut |
| 22 | bundle/open_position.ts:823 | PARTIAL |  | token_mint | `(memcmp(ld64(s790 + 0x30) + 8, s40, 0x20) as u32) != 0` | anchor::ConstraintTokenMint |
| 23 | bundle/open_position.ts:831 | PARTIAL |  | writable | `!(ld8(ld64(ld64(s790 + 0x28)) + 0x29) != 0)` | anchor::ConstraintMut |
| 24 | bundle/open_position.ts:835 | PARTIAL |  | token_mint | `(cw as u32) != 0` | anchor::ConstraintTokenMint |
| 25 | bundle/open_position.ts:844 | PARTIAL | token_vault_0 | writable | `token_vault_0.is_writable == 0` | anchor::ConstraintMut |
| 26 | bundle/open_position.ts:858 | PARTIAL |  | raw | `!((db as u32) == 0)` | anchor::ConstraintRaw |
| 27 | bundle/open_position.ts:860 | PARTIAL | token_vault_1 | writable | `token_vault_1.is_writable == 0` | anchor::ConstraintMut |
| 28 | bundle/open_position.ts:875 | PARTIAL |  | raw | `k != 0` | anchor::ConstraintRaw |
| 29 | bundle/open_position.ts:1082 | PARTIAL |  | count | `j == 2` | anchor::AccountNotEnoughKeys |
| 30 | bundle/open_position.ts:1196 | PARTIAL | token_account_0 | custom | `!(ld8(accounts.token_account_0 + 0x74) != 2 && ld8(accounts.token_account_1 + 0x74) != 2)` | error::NotApproved |
| 31 | bundle/open_position.ts:1368 | PARTIAL | position_nft_mint | key | `(memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(f) == 0 && ld64` | Err(ProgramError::AccountBorrowFailed) |
| 32 | bundle/open_position.ts:1400 | PARTIAL | position_nft_account | key | `(memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(l) == 0 && ld64` | Err(ProgramError::AccountBorrowFailed) |
| 33 | bundle/open_position.ts:1437 | PARTIAL | pool_state |  | `g != 2` | return |
| 34 | bundle/open_position.ts:1467 | PARTIAL | personal_position |  | `g != 2` | return |
| 35 | bundle/open_position.ts:1469 | PARTIAL | token_account_0 | key | `(memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(r) == 0 && ld64` | Err(ProgramError::AccountBorrowFailed) |
| 36 | bundle/open_position.ts:1503 | PARTIAL |  | key | `(memcmp(0x1001594a0 /* &TOKEN_PROGRAM */, c, 0x20) as u32) == 0 && (common_is_closed(u) == 0 && ld64` | Err(ProgramError::AccountBorrowFailed) |
| 37 | shared.ts:1017 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 38 | shared.ts:1035 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 39 | shared.ts:1043 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 40 | entrypoint.ts:193 | found |  | address | `f == 0` | anchor::AccountSysvarMismatch |
| 41 | entrypoint.ts:206 | PARTIAL |  | address | `!(i >= 8 && (i != 0x10 && (i & -8) != 8))` | anchor::AccountSysvarMismatch |
| 42 | bundle/open_position.ts:1689 | PARTIAL |  | key | `(memcmp(s278, s258, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 43 | bundle/open_position.ts:2227 | PARTIAL |  | key | `(memcmp(s2c8, s2a8, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 44 | bundle/open_position.ts:2600 | PARTIAL |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 45 | bundle/open_position.ts:2611 | PARTIAL |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 46 | bundle/open_position.ts:3436 | PARTIAL |  | custom | `!((p & 1) == 0)` | error::NotApproved |
| 47 | entrypoint.ts:3759 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 48 | bundle/open_position.ts:4019 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 49 | bundle/open_position.ts:4028 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 50 | bundle/open_position.ts:4089 | PARTIAL |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 51 | bundle/open_position.ts:4094 | PARTIAL |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 52 | bundle/open_position.ts:4105 | PARTIAL |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 53 | bundle/open_position.ts:4172 | PARTIAL |  | custom | `!((c as i32) > -0x6c4f5)` | error::TickLowerOverflow |
| 54 | bundle/open_position.ts:4173 | PARTIAL |  | custom | `!(0x6c4f5 > (c as i32))` | error::TickUpperOverflow |
| 55 | bundle/open_position.ts:4350 | PARTIAL |  | key | `!((memcmp(s170, s130, 0x20) as u32) == 0)` | anchor::RequireKeysEqViolated |
| 56 | bundle/open_position.ts:4598 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 57 | shared.ts:3417 | PARTIAL | tick_array_state | state | `tick_array_state_data.discriminator != 0x2a81f931cd559bc0 /* account:TickArrayState */` | return |
| 58 | shared.ts:3465 | PARTIAL | tick_array_state_data | state | `tick_array_state_data_3.discriminator != 0x2a81f931cd559bc0 /* account:TickArrayState */` | return |
| 59 | shared.ts:3488 | PARTIAL |  | discriminator | `!((by as u32) == 0)` | anchor::AccountDiscriminatorNotFound |
| 60 | shared.ts:3682 | PARTIAL |  | custom | `(ld64(s5a8 + 8) \| ld64(s5a8)) == 0` | error::ForbidBothZeroForSupplyLiquidity |
| 61 | shared.ts:3764 | PARTIAL |  | custom | `ld64(s558 + 0x38) > ld64(s510 + 8)` | error::PriceSlippageCheck |
| 62 | shared.ts:3797 | PARTIAL |  | custom | `ed + ee > ld64(s510)` | error::PriceSlippageCheck |
| 63 | shared.ts:19395 | PARTIAL |  | key, owner | `(memcmp(f, 0x10015b639 /* &RAYDIUM_CLMM_PROGRAM */, 0x20) as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 64 | shared.ts:19430 | PARTIAL |  | writable | `!((c & 1) != 0)` | anchor::AccountNotMutable |
| 65 | shared.ts:13043 | PARTIAL |  | custom | `!(0xd89e9 > ((b + 0x6c4f4) as u32))` | error::TickUpperOverflow |
| 66 | shared.ts:19546 | PARTIAL |  | writable | `!((c & 1) != 0)` | anchor::AccountNotMutable |
| 67 | shared.ts:19555 | PARTIAL | tick_array_state | state | `tick_array_state_data.discriminator != 0x2a81f931cd559bc0 /* account:TickArrayState */` | return |
| 68 | shared.ts:19556 | PARTIAL |  | discriminator | `g <= 0x27ff` | anchor::AccountDiscriminatorMismatch |
| 69 | shared.ts:14313 | PARTIAL |  | key | `(memcmp(s1a8, se8, 0x20) as u32) != 0` | anchor::RequireKeysEqViolated |
| 70 | shared.ts:14375 | PARTIAL |  | writable | `!(ld8(v + 0x29) != 0)` | anchor::AccountNotMutable |
| 71 | entrypoint.ts:3832 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 72 | shared.ts:15478 | PARTIAL |  | custom | `(g as u32) != (b as u32)` | error::InvalidTickArray |
| 73 | shared.ts:10528 | PARTIAL |  | custom | `0 > (e as i64)` | error::LiquiditySubValueErr |
| 74 | shared.ts:1069 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 75 | shared.ts:1087 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 76 | shared.ts:1095 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x998b8061db24963c /* account:TickArrayBitmapExtension */` | anchor::AccountDiscriminatorMismatch |
| 77 | entrypoint.ts:4230 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 78 | entrypoint.ts:4332 | PARTIAL |  | key | `(memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 79 | entrypoint.ts:4071 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 80 | shared.ts:24098 | PARTIAL |  | key | `(f as u32) != 0 && (memcmp(b, 0x1001594a0 /* &TOKEN_PROGRAM */, 0x20) as u32) != 0` | Err(ProgramError::IncorrectProgramId) |
| 81 | shared.ts:10732 | PARTIAL |  | custom | `!((h \| i) != 0)` | error::ZeroSqrtPrice |
