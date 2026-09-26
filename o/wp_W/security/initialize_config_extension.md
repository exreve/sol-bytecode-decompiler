# initialize_config_extension

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_initialize_config_extension (anchor); 35 functions reachable: ix_initialize_config_extension, accounts_initialize_config_extension, memcpy, fn_7598, fn_147990, fn_11f980, fn_139720, fn_149678, fn_9900, fn_83078, fn_149478, fn_ebed0, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | config [str] | — | — | found (+discriminator found) | — | — |
| 1 | funder [str] | found | PARTIAL | — | — | — |
| 2 | config_extension [str] | — | runtime | runtime | — | — |
| 3 | fee_authority [str] | found | — | — | — | PARTIAL |
| 4 | system_program [str] | — | — | — | found | found |

## Constraints per account

- config: owner found (bundle/initialize_config_extension.ts:143 via try_accounts_11de0); initialized found (bundle/initialize_config_extension.ts:143 via try_accounts_11de0); discriminator found (bundle/initialize_config_extension.ts:143 via try_accounts_11de0)
- funder: signer found (bundle/initialize_config_extension.ts:173 via try_accounts_11718); writable PARTIAL (bundle/initialize_config_extension.ts:245)
- config_extension: key found (bundle/initialize_config_extension.ts:214); pda found (bundle/initialize_config_extension.ts:214); writable runtime (bundle/initialize_config_extension.ts:117) — written: the runtime rejects changes to a read-only account; rent_exempt PARTIAL (bundle/initialize_config_extension.ts:290); owner runtime (bundle/initialize_config_extension.ts:117) — data written / lamports debited: only the owner program may (the runtime rejects it otherwise)
- fee_authority: signer found (bundle/initialize_config_extension.ts:185 via try_accounts_11718); key PARTIAL (bundle/initialize_config_extension.ts:305); address PARTIAL (bundle/initialize_config_extension.ts:305)
- system_program: address found (bundle/initialize_config_extension.ts:190 via fn_122e8); executable found (bundle/initialize_config_extension.ts:190 via fn_122e8)

## CPIs

- shared.ts:20063 [conditional] program not decoded

## PDAs derived

- bundle/initialize_config_extension.ts:206 find_program_address(["config_extension", *s118], program *(ld64(s190)))
- compared with provided accounts: config_extension found

## Operations (account writes)

- bundle/initialize_config_extension.ts:117 ACCOUNT_DATA_WRITE config_extension.data[8..40] = ld64(i + 0x18)

## Dominance (checks on every path to the operation; across calls)

- bundle/initialize_config_extension.ts:117 ACCOUNT_DATA_WRITE: 12 dominating checks (owner config; initialized config; discriminator config; signer funder; signer fee_authority; address system_program; executable system_program; key config_extension; …)
- shared.ts:20063 CPI: 9 dominating checks (owner config; initialized config; discriminator config; signer funder; signer fee_authority; address system_program; executable system_program; key config_extension; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/initialize_config_extension.ts:117 ACCOUNT_DATA_WRITE config_extension.data[8..40] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — config_extension: no discriminator check found
  - [found] write gated (signer / constraint) — signer funder accounts_initialize_config_extension:39; signer fee_authority accounts_initialize_config_extension:51; address/executable system_program accounts_initialize_config_extension:56

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/initialize_config_extension.ts:117 ACCOUNT_DATA_WRITE config_extension.data[8..40]: ✗ `f == 0`
- shared.ts:20063 CPI: `bo != -1` · `bm != -1` · `bh != -1` · `bf != -1` · `u229 != -1` · `u82 != -1` · `x > g` · ✗ `(memcmp(s40, s1f0, 0x20) as u32) == 0` #14 · `g != 0` · `(memcmp(s70, s140, 0x20) as u32) == 0` #6 · … 7 more

## Relations (equalities the checks establish)

- system_program.key == (constant address) (address, found, bundle/initialize_config_extension.ts:190)
- fee_authority.key == (constant address) (address, PARTIAL, bundle/initialize_config_extension.ts:305)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): config.key, funder.key
- config.data: validated (owner found @accounts_initialize_config_extension:9, discriminator found @accounts_initialize_config_extension:9, initialized found @accounts_initialize_config_extension:9)
- config_extension.key: validated (pda found @accounts_initialize_config_extension:80, key found @accounts_initialize_config_extension:80)
- config_extension.data: runtime (owner runtime @ix_initialize_config_extension:27)
- fee_authority.key: partially-validated (address partial @accounts_initialize_config_extension:171, key partial @accounts_initialize_config_extension:171)
- system_program.key: validated (address found @accounts_initialize_config_extension:56)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/initialize_config_extension.ts:123 | PARTIAL | config_extension |  | `m != 2` | return |
| 1 | bundle/initialize_config_extension.ts:143 | found | config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `ld64(s70) == 0` | return |
| 2 | bundle/initialize_config_extension.ts:158 | found |  | count | `h == 0` | anchor::AccountNotEnoughKeys |
| 3 | bundle/initialize_config_extension.ts:173 | found | funder | signer (via try_accounts_11718 (count, signer)) | `j != 2` | return |
| 4 | bundle/initialize_config_extension.ts:185 | found | fee_authority | signer (via try_accounts_11718 (count, signer)) | `l != 2` | return |
| 5 | bundle/initialize_config_extension.ts:190 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `n != 2` | return |
| 6 | bundle/initialize_config_extension.ts:214 | found | config_extension | key, pda | `!((memcmp(s70, s140, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 7 | bundle/initialize_config_extension.ts:229 | PARTIAL | config_extension | writable | `config_extension.is_writable == 0` | anchor::ConstraintMut |
| 8 | bundle/initialize_config_extension.ts:245 | PARTIAL | funder | writable | `aj == 0x800000000000001a /* Ok */` | anchor::ConstraintMut |
| 9 | bundle/initialize_config_extension.ts:290 | PARTIAL | config_extension | rent_exempt | `aw > ld64(s2e0)` | anchor::ConstraintRentExempt |
| 10 | bundle/initialize_config_extension.ts:300 | PARTIAL | funder | writable | `funder.is_writable == 0` | anchor::ConstraintMut |
| 11 | bundle/initialize_config_extension.ts:305 | PARTIAL | fee_authority | key, address | `(memcmp(s90, s118, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 12 | entrypoint.ts:677 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 13 | entrypoint.ts:686 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 14 | bundle/initialize_config_extension.ts:482 | PARTIAL |  | key | `(memcmp(s40, s1f0, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 15 | entrypoint.ts:13224 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 16 | bundle/initialize_config_extension.ts:877 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 17 | bundle/initialize_config_extension.ts:886 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
