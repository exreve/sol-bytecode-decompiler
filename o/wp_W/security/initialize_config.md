# initialize_config

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_initialize_config (anchor); 36 functions reachable: ix_initialize_config, accounts_initialize_config, memcpy, fn_83340, fn_87828, fn_149678, fn_11f980, fn_8228, fn_147990, fn_83078, fn_139720, fn_967c8, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | funder [str] | found | PARTIAL | — | — | — |
| 1 | config [str] | PARTIAL | runtime | runtime | — | — |
| 2 | system_program [str] | — | — | — | found | found |

## Constraints per account

- funder: signer found (bundle/initialize_config.ts:228 via try_accounts_11718); writable PARTIAL (bundle/initialize_config.ts:275); key PARTIAL (bundle/initialize_config.ts:340); raw PARTIAL (bundle/initialize_config.ts:340)
- config: writable runtime (bundle/initialize_config.ts:136) — written: the runtime rejects changes to a read-only account; signer PARTIAL (bundle/initialize_config.ts:267); rent_exempt PARTIAL (bundle/initialize_config.ts:329); owner runtime (bundle/initialize_config.ts:136) — data written / lamports debited: only the owner program may (the runtime rejects it otherwise)
- system_program: address found (bundle/initialize_config.ts:240 via fn_122e8); executable found (bundle/initialize_config.ts:240 via fn_122e8)

## CPIs

- shared.ts:20063 [conditional] program not decoded

## Operations (account writes)

- bundle/initialize_config.ts:136 ACCOUNT_DATA_WRITE config.data[8..40] = v
- bundle/initialize_config.ts:141 ACCOUNT_DATA_WRITE config.data[40..72] = u
- bundle/initialize_config.ts:149 ACCOUNT_DATA_WRITE config.data[72..104] = ld32(h + 0x40)
- bundle/initialize_config.ts:165 ACCOUNT_DATA_WRITE config.data[104..106] = aa [conditional]
- bundle/initialize_config.ts:168 ACCOUNT_DATA_WRITE config.data[106..108] = 0

## Dominance (checks on every path to the operation; across calls)

- bundle/initialize_config.ts:136 ACCOUNT_DATA_WRITE: 7 dominating checks (signer funder; address system_program; executable system_program; writable config; signer config; writable funder; key; initialized; …)
  - sources: config.data[8..40] ← instruction data (caller-controlled)
- bundle/initialize_config.ts:141 ACCOUNT_DATA_WRITE: 7 dominating checks (signer funder; address system_program; executable system_program; writable config; signer config; writable funder; key; initialized; …)
  - sources: config.data[40..72] ← instruction data (caller-controlled)
- bundle/initialize_config.ts:149 ACCOUNT_DATA_WRITE: 7 dominating checks (signer funder; address system_program; executable system_program; writable config; signer config; writable funder; key; initialized; …)
  - sources: config.data[72..104] ← instruction data (caller-controlled)
- bundle/initialize_config.ts:165 ACCOUNT_DATA_WRITE: 7 dominating checks (signer funder; address system_program; executable system_program; writable config; signer config; writable funder; key; initialized; …)
  - sources: config.data[104..106] ← instruction data (caller-controlled)
- bundle/initialize_config.ts:168 ACCOUNT_DATA_WRITE: 7 dominating checks (signer funder; address system_program; executable system_program; writable config; signer config; writable funder; key; initialized; …)
- shared.ts:20063 CPI: 3 dominating checks (signer funder; address system_program; executable system_program; key)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/initialize_config.ts:136 ACCOUNT_DATA_WRITE config.data[8..40] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — config: no discriminator check found
  - [found] write gated (signer / constraint) — signer funder accounts_initialize_config:18; address/executable system_program accounts_initialize_config:30; signer config accounts_initialize_config:57
  - [PARTIAL] amount arithmetic checked — config.data[8..40] ← instruction data (caller-controlled)
- bundle/initialize_config.ts:141 ACCOUNT_DATA_WRITE config.data[40..72] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — config: no discriminator check found
  - [found] write gated (signer / constraint) — signer funder accounts_initialize_config:18; address/executable system_program accounts_initialize_config:30; signer config accounts_initialize_config:57
  - [PARTIAL] amount arithmetic checked — config.data[40..72] ← instruction data (caller-controlled)
- bundle/initialize_config.ts:149 ACCOUNT_DATA_WRITE config.data[72..104] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — config: no discriminator check found
  - [found] write gated (signer / constraint) — signer funder accounts_initialize_config:18; address/executable system_program accounts_initialize_config:30; signer config accounts_initialize_config:57
  - [PARTIAL] amount arithmetic checked — config.data[72..104] ← instruction data (caller-controlled)
- bundle/initialize_config.ts:165 ACCOUNT_DATA_WRITE config.data[104..106] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — config: no discriminator check found
  - [found] write gated (signer / constraint) — signer funder accounts_initialize_config:18; address/executable system_program accounts_initialize_config:30; signer config accounts_initialize_config:57
  - [PARTIAL] amount arithmetic checked — config.data[104..106] ← instruction data (caller-controlled)
- bundle/initialize_config.ts:168 ACCOUNT_DATA_WRITE config.data[106..108] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — config: no discriminator check found
  - [found] write gated (signer / constraint) — signer funder accounts_initialize_config:18; address/executable system_program accounts_initialize_config:30; signer config accounts_initialize_config:57

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/initialize_config.ts:136 ACCOUNT_DATA_WRITE config.data[8..40]: ✗ `w == 0` · ✗ `(f & -2) == 0x60` · ✗ `(f & -0x20) == 0x40` · ✗ `(f & -0x20) == 0x20` · ✗ `0x20 > f`
- bundle/initialize_config.ts:141 ACCOUNT_DATA_WRITE config.data[40..72]: ✗ `w == 0` · ✗ `(f & -2) == 0x60` · ✗ `(f & -0x20) == 0x40` · ✗ `(f & -0x20) == 0x20` · ✗ `0x20 > f`
- bundle/initialize_config.ts:149 ACCOUNT_DATA_WRITE config.data[72..104]: ✗ `w == 0` · ✗ `(f & -2) == 0x60` · ✗ `(f & -0x20) == 0x40` · ✗ `(f & -0x20) == 0x20` · ✗ `0x20 > f`
- bundle/initialize_config.ts:165 ACCOUNT_DATA_WRITE config.data[104..106]: ✗ `aa > 0x9c4 /* anchor::RequireViolated */` · ✗ `w == 0` · ✗ `(f & -2) == 0x60` · ✗ `(f & -0x20) == 0x40` · ✗ `(f & -0x20) == 0x20` · ✗ `0x20 > f`
- bundle/initialize_config.ts:168 ACCOUNT_DATA_WRITE config.data[106..108]: ✗ `w == 0` · ✗ `(f & -2) == 0x60` · ✗ `(f & -0x20) == 0x40` · ✗ `(f & -0x20) == 0x20` · ✗ `0x20 > f`
- shared.ts:20063 CPI: `bo != -1` · `bm != -1` · `bh != -1` · `bf != -1` · `u207 != -1` · `u82 != -1` · `x > g` · ✗ `(memcmp(s40, s1e0, 0x20) as u32) == 0` #10 · `g != 0` · `ld64(s110) == 0` · … 7 more
  - not required on some path: #5 (signer config)

## Relations (equalities the checks establish)

- system_program.key == (constant address) (address, found, bundle/initialize_config.ts:240)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): config.key
- funder.key: partially-validated (key partial @accounts_initialize_config:130)
- config.data: runtime (owner runtime @ix_initialize_config:48)
- system_program.key: validated (address found @accounts_initialize_config:30)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/initialize_config.ts:171 | PARTIAL | config |  | `r != 2` | return |
| 1 | bundle/initialize_config.ts:220 | found |  | count | `f == 0` | anchor::AccountNotEnoughKeys |
| 2 | bundle/initialize_config.ts:228 | found | funder | signer (via try_accounts_11718 (count, signer)) | `h != 2` | return |
| 3 | bundle/initialize_config.ts:240 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `j != 2` | return |
| 4 | bundle/initialize_config.ts:258 | PARTIAL | config | writable | `config.is_writable == 0` | anchor::ConstraintMut |
| 5 | bundle/initialize_config.ts:267 | PARTIAL | config | signer | `config.is_signer == 0` | anchor::ConstraintSigner |
| 6 | bundle/initialize_config.ts:275 | PARTIAL | funder | writable | `r == 0x800000000000001a /* Ok */` | anchor::ConstraintMut |
| 7 | bundle/initialize_config.ts:329 | PARTIAL | config | rent_exempt | `af > ae` | anchor::ConstraintRentExempt |
| 8 | bundle/initialize_config.ts:339 | PARTIAL | funder | writable | `funder.is_writable == 0` | anchor::ConstraintMut |
| 9 | bundle/initialize_config.ts:340 | PARTIAL | funder | key, raw | `!(fn_30dd0(funder.key) != 0)` | anchor::ConstraintRaw |
| 10 | bundle/initialize_config.ts:509 | PARTIAL |  | key | `(memcmp(s40, s1e0, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 11 | bundle/initialize_config.ts:868 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 12 | bundle/initialize_config.ts:877 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
