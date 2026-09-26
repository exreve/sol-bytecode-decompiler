# create_amm_config

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_create_amm_config (anchor); 45 functions reachable: ix_create_amm_config, accounts_create_amm_config, memcpy, fn_4b0e0, fn_c4d20, anchor_error_from, fn_11e480, fn_14d660, fn_125710, fn_14ec00, fn_c3400, fn_147a20, ….

## Look first

- ⚠ owner: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | owner | expected · found | expected · PARTIAL | — | — | = GThUX1At… · expected · NOT FOUND |
| 1 | amm_config | — | expected · PARTIAL | — | — | — |
| 2 | system_program | — | — | — | found | = 11111111… · expected · found |

## Constraints per account

- owner: signer found (bundle/create_amm_config.ts:194 via try_accounts_17a30); writable PARTIAL (bundle/create_amm_config.ts:279); address NOT FOUND
- amm_config: key found (bundle/create_amm_config.ts:241); pda found (bundle/create_amm_config.ts:241); writable PARTIAL (bundle/create_amm_config.ts:257)
- system_program: address found (bundle/create_amm_config.ts:214 via try_accounts_18870); executable found (bundle/create_amm_config.ts:214 via try_accounts_18870)

## CPIs

- bundle/create_amm_config.ts:864 [conditional] SYSTEM_PROGRAM (constant).Transfer — accounts from: ? s, to: ? — lamports: ld64(s2e0 + 0x30)
- bundle/create_amm_config.ts:930 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: 0x75 — PDA signer: ? (1 seeds)
- bundle/create_amm_config.ts:990 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: ld64(ld64(ld64(s2a0) + 0x30)) — PDA signer: ? (1 seeds)
- bundle/create_amm_config.ts:1075 [conditional] SYSTEM_PROGRAM (constant).CreateAccount — accounts from: ? s, to: ? — lamports: ld64(s2e0 + 0x38), 0x75, ld64(ld64(aa + 0x30)) — PDA signer: ? (1 seeds)

## PDAs derived

- bundle/create_amm_config.ts:233 find_program_address(["amm_config", u16 bswap16(j) [ix data?]], program *b)
- compared with provided accounts: amm_config found

## Dominance (checks on every path to the operation; across calls)

- bundle/create_amm_config.ts:864 LAMPORT_TRANSFER: 4 dominating checks (signer owner; address system_program; executable system_program; key amm_config; pda amm_config; key)
- bundle/create_amm_config.ts:930 OWNER_ASSIGN, PDA_SIGNATURE: 4 dominating checks (signer owner; address system_program; executable system_program; key amm_config; pda amm_config; key)
- bundle/create_amm_config.ts:990 OWNER_ASSIGN, PDA_SIGNATURE: 4 dominating checks (signer owner; address system_program; executable system_program; key amm_config; pda amm_config; key)
- bundle/create_amm_config.ts:1075 ACCOUNT_CREATE, PDA_SIGNATURE: 3 dominating checks (signer owner; address system_program; executable system_program; key amm_config; pda amm_config)

## Authority (who enables each value movement / authority change)

- bundle/create_amm_config.ts:864 LAMPORT_TRANSFER: signer owner (found)
- bundle/create_amm_config.ts:930 OWNER_ASSIGN, PDA_SIGNATURE: signer owner (found); pda PDA signature ? (1 seeds)
- bundle/create_amm_config.ts:990 OWNER_ASSIGN, PDA_SIGNATURE: signer owner (found); pda PDA signature ? (1 seeds)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/create_amm_config.ts:864 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer [LAMPORT_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer owner (found)
  - [found] amount arithmetic checked — sat_sub(n, g) (saturating)
  - [found] relevant checks on every path — 5 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/create_amm_config.ts:864 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer ⇐ signer owner (found)
- bundle/create_amm_config.ts:930 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer owner (found)
- bundle/create_amm_config.ts:930 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)
- bundle/create_amm_config.ts:990 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer owner (found)
- bundle/create_amm_config.ts:990 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/create_amm_config.ts:864 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer: `u218 != -1` · `at != -1` · `ao != -1` · `am != -1` · `u184 != -1` · `u57 != -1` · `n > g` · ✗ `(memcmp(s178, s158, 0x20) as u32) == 0` #7 · `g != 0` · `(memcmp(s168, s190, 0x20) as u32) == 0` #3 · … 9 more
- bundle/create_amm_config.ts:930 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign: `u270 != -1` · `bi != -1` · `u254 != -1` · `bc != -1` · ✗ `(memcmp(s178, s158, 0x20) as u32) == 0` #7 · `g != 0` · `(memcmp(s168, s190, 0x20) as u32) == 0` #3 · ✗ `ld64(s148) != 0` · `o == 2` #2 · ✗ `m == 0` #1 · … 6 more
- bundle/create_amm_config.ts:990 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign: `cb != -1` · `by != -1` · `u313 != -1` · `u309 != -1` · `ae == 2` · `u270 != -1` · `bi != -1` · `u254 != -1` · `bc != -1` · ✗ `(memcmp(s178, s158, 0x20) as u32) == 0` #7 · … 11 more
- bundle/create_amm_config.ts:1075 ACCOUNT_CREATE, PDA_SIGNATURE SYSTEM_PROGRAM.CreateAccount: `u90 != -1` · `x != -1` · `u75 != -1` · `s != -1` · `u61 != -1` · `j != -1` · ✗ `g != 0` · `(memcmp(s168, s190, 0x20) as u32) == 0` #3 · ✗ `ld64(s148) != 0` · `o == 2` #2 · … 7 more

## Arithmetic on value paths

- bundle/create_amm_config.ts:808 SYSTEM_PROGRAM.Transfer.lamports ← `sat_sub(n, g)`: saturating

## Relations (equalities the checks establish)

- system_program.key == (constant address) (address, found, bundle/create_amm_config.ts:214)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): owner.key, ix.index, ix.tick_spacing, ix.trade_fee_rate, ix.protocol_fee_rate, ix.fund_fee_rate
- amm_config.key: validated (pda found @accounts_create_amm_config:65, key found @accounts_create_amm_config:65)
- system_program.key: validated (address found @accounts_create_amm_config:38)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/create_amm_config.ts:194 | found | owner | signer (via try_accounts_17a30 (count, signer)) | `k != 2` | return |
| 1 | bundle/create_amm_config.ts:197 | found |  | count | `m == 0` | anchor::AccountNotEnoughKeys |
| 2 | bundle/create_amm_config.ts:214 | found | system_program | address, executable (via try_accounts_18870 (count, address, executable)) | `o != 2` | return |
| 3 | bundle/create_amm_config.ts:241 | found | amm_config | key, pda | `!((memcmp(s168, s190, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 4 | bundle/create_amm_config.ts:257 | PARTIAL | amm_config | writable | `amm_config.is_writable == 0` | anchor::ConstraintMut |
| 5 | bundle/create_amm_config.ts:278 | PARTIAL |  | rent_exempt | `ak == 0` | anchor::ConstraintRentExempt |
| 6 | bundle/create_amm_config.ts:279 | PARTIAL | owner | writable | `owner.is_writable == 0` | anchor::ConstraintMut |
| 7 | bundle/create_amm_config.ts:768 | PARTIAL |  | key | `(memcmp(s178, s158, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 8 | bundle/create_amm_config.ts:1446 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 9 | bundle/create_amm_config.ts:1455 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
