# create_dynamic_fee_config

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_create_dynamic_fee_config (anchor); 42 functions reachable: ix_create_dynamic_fee_config, accounts_create_dynamic_fee_config, memcpy, fn_d6698, fn_88360, anchor_error_from, fn_11e480, fn_14d660, fn_125710, fn_14ec00, fn_d4d48, fn_147a20, ….

## Look first

- ⚠ owner: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | owner | expected · found | expected · PARTIAL | — | — | = GThUX1At… · expected · NOT FOUND |
| 1 | dynamic_fee_config | — | expected · PARTIAL | — | — | — |
| 2 | system_program | — | — | — | found | = 11111111… · expected · found |

## Constraints per account

- owner: signer found (bundle/create_dynamic_fee_config.ts:190 via try_accounts_17a30); writable PARTIAL (bundle/create_dynamic_fee_config.ts:275); address NOT FOUND
- dynamic_fee_config: key found (bundle/create_dynamic_fee_config.ts:237); pda found (bundle/create_dynamic_fee_config.ts:237); writable PARTIAL (bundle/create_dynamic_fee_config.ts:253)
- system_program: address found (bundle/create_dynamic_fee_config.ts:210 via try_accounts_18870); executable found (bundle/create_dynamic_fee_config.ts:210 via try_accounts_18870)

## CPIs

- bundle/create_dynamic_fee_config.ts:681 [conditional] SYSTEM_PROGRAM (constant).Transfer — accounts from: ? s, to: ? — lamports: ld64(s2e0 + 0x30)
- bundle/create_dynamic_fee_config.ts:747 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: 0x58 — PDA signer: ? (1 seeds)
- bundle/create_dynamic_fee_config.ts:807 [conditional] SYSTEM_PROGRAM (constant).Assign — accounts account_to_assign: ? — lamports: ld64(ld64(ld64(s2a0) + 0x30)) — PDA signer: ? (1 seeds)
- bundle/create_dynamic_fee_config.ts:892 [conditional] SYSTEM_PROGRAM (constant).CreateAccount — accounts from: ? s, to: ? — lamports: ld64(s2e0 + 0x38), 0x58, ld64(ld64(aa + 0x30)) — PDA signer: ? (1 seeds)

## PDAs derived

- bundle/create_dynamic_fee_config.ts:229 find_program_address(["dynamic_fee_config", u16 bswap16(j) [ix data?]], program *b)
- compared with provided accounts: dynamic_fee_config found

## Dominance (checks on every path to the operation; across calls)

- bundle/create_dynamic_fee_config.ts:681 LAMPORT_TRANSFER: 4 dominating checks (signer owner; address system_program; executable system_program; key dynamic_fee_config; pda dynamic_fee_config; key)
- bundle/create_dynamic_fee_config.ts:747 OWNER_ASSIGN, PDA_SIGNATURE: 4 dominating checks (signer owner; address system_program; executable system_program; key dynamic_fee_config; pda dynamic_fee_config; key)
- bundle/create_dynamic_fee_config.ts:807 OWNER_ASSIGN, PDA_SIGNATURE: 4 dominating checks (signer owner; address system_program; executable system_program; key dynamic_fee_config; pda dynamic_fee_config; key)
- bundle/create_dynamic_fee_config.ts:892 ACCOUNT_CREATE, PDA_SIGNATURE: 3 dominating checks (signer owner; address system_program; executable system_program; key dynamic_fee_config; pda dynamic_fee_config)

## Authority (who enables each value movement / authority change)

- bundle/create_dynamic_fee_config.ts:681 LAMPORT_TRANSFER: signer owner (found)
- bundle/create_dynamic_fee_config.ts:747 OWNER_ASSIGN, PDA_SIGNATURE: signer owner (found); pda PDA signature ? (1 seeds)
- bundle/create_dynamic_fee_config.ts:807 OWNER_ASSIGN, PDA_SIGNATURE: signer owner (found); pda PDA signature ? (1 seeds)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/create_dynamic_fee_config.ts:681 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer [LAMPORT_TRANSFER]
  - [found] authorized (signer / PDA signature / stored authority) — signer owner (found)
  - [found] amount arithmetic checked — sat_sub(n, g) (saturating)
  - [found] relevant checks on every path — 5 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/create_dynamic_fee_config.ts:681 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer ⇐ signer owner (found)
- bundle/create_dynamic_fee_config.ts:747 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer owner (found)
- bundle/create_dynamic_fee_config.ts:747 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)
- bundle/create_dynamic_fee_config.ts:807 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ signer owner (found)
- bundle/create_dynamic_fee_config.ts:807 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign ⇐ pda PDA signature ? (1 seeds)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/create_dynamic_fee_config.ts:681 LAMPORT_TRANSFER SYSTEM_PROGRAM.Transfer: `u218 != -1` · `at != -1` · `ao != -1` · `am != -1` · `u184 != -1` · `u57 != -1` · `n > g` · ✗ `(memcmp(s178, s158, 0x20) as u32) == 0` #7 · `g != 0` · `(memcmp(s128, s150, 0x20) as u32) == 0` #3 · … 11 more
- bundle/create_dynamic_fee_config.ts:747 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign: `u270 != -1` · `bi != -1` · `u254 != -1` · `bc != -1` · ✗ `(memcmp(s178, s158, 0x20) as u32) == 0` #7 · `g != 0` · `(memcmp(s128, s150, 0x20) as u32) == 0` #3 · ✗ `ld64(s108) != 0` · `o == 2` #2 · ✗ `m == 0` #1 · … 8 more
- bundle/create_dynamic_fee_config.ts:807 OWNER_ASSIGN, PDA_SIGNATURE SYSTEM_PROGRAM.Assign: `cb != -1` · `by != -1` · `u313 != -1` · `u309 != -1` · `ae == 2` · `u270 != -1` · `bi != -1` · `u254 != -1` · `bc != -1` · ✗ `(memcmp(s178, s158, 0x20) as u32) == 0` #7 · … 13 more
- bundle/create_dynamic_fee_config.ts:892 ACCOUNT_CREATE, PDA_SIGNATURE SYSTEM_PROGRAM.CreateAccount: `u90 != -1` · `x != -1` · `u75 != -1` · `s != -1` · `u61 != -1` · `j != -1` · ✗ `g != 0` · `(memcmp(s128, s150, 0x20) as u32) == 0` #3 · ✗ `ld64(s108) != 0` · `o == 2` #2 · … 9 more

## Arithmetic on value paths

- bundle/create_dynamic_fee_config.ts:625 SYSTEM_PROGRAM.Transfer.lamports ← `sat_sub(n, g)`: saturating

## Relations (equalities the checks establish)

- system_program.key == (constant address) (address, found, bundle/create_dynamic_fee_config.ts:210)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): owner.key, ix.index, ix.filter_period, ix.decay_period, ix.reduction_factor, ix.dynamic_fee_control, ix.max_volatility_accumulator
- dynamic_fee_config.key: validated (pda found @accounts_create_dynamic_fee_config:65, key found @accounts_create_dynamic_fee_config:65)
- system_program.key: validated (address found @accounts_create_dynamic_fee_config:38)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/create_dynamic_fee_config.ts:190 | found | owner | signer (via try_accounts_17a30 (count, signer)) | `k != 2` | return |
| 1 | bundle/create_dynamic_fee_config.ts:193 | found |  | count | `m == 0` | anchor::AccountNotEnoughKeys |
| 2 | bundle/create_dynamic_fee_config.ts:210 | found | system_program | address, executable (via try_accounts_18870 (count, address, executable)) | `o != 2` | return |
| 3 | bundle/create_dynamic_fee_config.ts:237 | found | dynamic_fee_config | key, pda | `!((memcmp(s128, s150, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 4 | bundle/create_dynamic_fee_config.ts:253 | PARTIAL | dynamic_fee_config | writable | `dynamic_fee_config.is_writable == 0` | anchor::ConstraintMut |
| 5 | bundle/create_dynamic_fee_config.ts:274 | PARTIAL |  | rent_exempt | `ak == 0` | anchor::ConstraintRentExempt |
| 6 | bundle/create_dynamic_fee_config.ts:275 | PARTIAL | owner | writable | `owner.is_writable == 0` | anchor::ConstraintMut |
| 7 | bundle/create_dynamic_fee_config.ts:585 | PARTIAL |  | key | `(memcmp(s178, s158, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 8 | bundle/create_dynamic_fee_config.ts:1870 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100159560, 0x20) as u32) == 0 && fn_147a20(b) == 0` | anchor::AccountNotInitialized |
| 9 | bundle/create_dynamic_fee_config.ts:1879 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
