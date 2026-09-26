# initialize_fee_tier

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_initialize_fee_tier (anchor); 38 functions reachable: ix_initialize_fee_tier, accounts_initialize_fee_tier, memcpy, fn_83340, fn_87828, fn_149678, fn_11f980, fn_7240, fn_147990, fn_139720, fn_9900, fn_83078, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | config [str] | — | — | found (+discriminator found) | — | — |
| 1 | funder [str] | found | PARTIAL | — | — | — |
| 2 | fee_tier [str] | — | runtime | runtime | — | — |
| 3 | fee_authority [str] | found | — | — | — | PARTIAL |
| 4 | system_program [str] | — | — | — | found | found |

## Constraints per account

- config: owner found (bundle/initialize_fee_tier.ts:219 via try_accounts_11de0); initialized found (bundle/initialize_fee_tier.ts:219 via try_accounts_11de0); discriminator found (bundle/initialize_fee_tier.ts:219 via try_accounts_11de0)
- funder: signer found (bundle/initialize_fee_tier.ts:248 via try_accounts_11718); writable PARTIAL (bundle/initialize_fee_tier.ts:374)
- fee_tier: key found (bundle/initialize_fee_tier.ts:288); pda found (bundle/initialize_fee_tier.ts:288); writable runtime (bundle/initialize_fee_tier.ts:118) — written: the runtime rejects changes to a read-only account; rent_exempt PARTIAL (bundle/initialize_fee_tier.ts:364); owner runtime (bundle/initialize_fee_tier.ts:118) — data written / lamports debited: only the owner program may (the runtime rejects it otherwise)
- fee_authority: signer found (bundle/initialize_fee_tier.ts:260 via try_accounts_11718); address PARTIAL (bundle/initialize_fee_tier.ts:380)
- system_program: address found (bundle/initialize_fee_tier.ts:265 via fn_122e8); executable found (bundle/initialize_fee_tier.ts:265 via fn_122e8)

## CPIs

- shared.ts:20063 [conditional] program not decoded

## PDAs derived

- bundle/initialize_fee_tier.ts:280 find_program_address(["fee_tier", *t, u16 ld16(s14a) [ix data?]], program *(ld64(s158)))
- compared with provided accounts: fee_tier found

## Operations (account writes)

- bundle/initialize_fee_tier.ts:118 ACCOUNT_DATA_WRITE fee_tier.data[8..40] = h, j, i
- bundle/initialize_fee_tier.ts:131 ACCOUNT_DATA_WRITE fee_tier.data[40..42] = q [conditional]
- bundle/initialize_fee_tier.ts:141 ACCOUNT_DATA_WRITE fee_tier.data[42..44] = p [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/initialize_fee_tier.ts:118 ACCOUNT_DATA_WRITE: 14 dominating checks (owner config; initialized config; discriminator config; signer funder; signer fee_authority; address system_program; executable system_program; key fee_tier; …)
- bundle/initialize_fee_tier.ts:131 ACCOUNT_DATA_WRITE: 14 dominating checks (owner config; initialized config; discriminator config; signer funder; signer fee_authority; address system_program; executable system_program; key fee_tier; …)
  - sources: fee_tier.data[40..42] ← instruction data (caller-controlled)
- bundle/initialize_fee_tier.ts:141 ACCOUNT_DATA_WRITE: 14 dominating checks (owner config; initialized config; discriminator config; signer funder; signer fee_authority; address system_program; executable system_program; key fee_tier; …)
  - sources: fee_tier.data[42..44] ← instruction data (caller-controlled)
- shared.ts:20063 CPI: 9 dominating checks (owner config; initialized config; discriminator config; signer funder; signer fee_authority; address system_program; executable system_program; key fee_tier; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/initialize_fee_tier.ts:118 ACCOUNT_DATA_WRITE fee_tier.data[8..40] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — fee_tier: no discriminator check found
  - [found] write gated (signer / constraint) — signer funder accounts_initialize_fee_tier:68; signer fee_authority accounts_initialize_fee_tier:80; address/executable system_program accounts_initialize_fee_tier:85
- bundle/initialize_fee_tier.ts:131 ACCOUNT_DATA_WRITE fee_tier.data[40..42] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — fee_tier: no discriminator check found
  - [found] write gated (signer / constraint) — signer funder accounts_initialize_fee_tier:68; signer fee_authority accounts_initialize_fee_tier:80; address/executable system_program accounts_initialize_fee_tier:85
  - [PARTIAL] amount arithmetic checked — fee_tier.data[40..42] ← instruction data (caller-controlled)
- bundle/initialize_fee_tier.ts:141 ACCOUNT_DATA_WRITE fee_tier.data[42..44] [ACCOUNT_DATA_WRITE]
  - [runtime] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [NOT FOUND] account type (discriminator) — fee_tier: no discriminator check found
  - [found] write gated (signer / constraint) — signer funder accounts_initialize_fee_tier:68; signer fee_authority accounts_initialize_fee_tier:80; address/executable system_program accounts_initialize_fee_tier:85
  - [PARTIAL] amount arithmetic checked — fee_tier.data[42..44] ← instruction data (caller-controlled)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/initialize_fee_tier.ts:118 ACCOUNT_DATA_WRITE fee_tier.data[8..40]: ✗ `h == 0` · ✗ `(f & -2) == 2` · ✗ `2 > f`
- bundle/initialize_fee_tier.ts:131 ACCOUNT_DATA_WRITE fee_tier.data[40..42]: ✗ `q == 0` · ✗ `h == 0` · ✗ `(f & -2) == 2` · ✗ `2 > f`
- bundle/initialize_fee_tier.ts:141 ACCOUNT_DATA_WRITE fee_tier.data[42..44]: ✗ `p > 0xea60` · ✗ `q == 0` · ✗ `h == 0` · ✗ `(f & -2) == 2` · ✗ `2 > f`
- shared.ts:20063 CPI: `bo != -1` · `bm != -1` · `bh != -1` · `bf != -1` · `u233 != -1` · `u82 != -1` · `x > g` · ✗ `(memcmp(s40, s1f0, 0x20) as u32) == 0` #13 · `g != 0` · `(memcmp(s70, s100, 0x20) as u32) == 0` #6 · … 10 more

## Relations (equalities the checks establish)

- system_program.key == (constant address) (address, found, bundle/initialize_fee_tier.ts:265)
- fee_authority.key == (constant address) (address, PARTIAL, bundle/initialize_fee_tier.ts:380)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): config.key, funder.key
- config.data: validated (owner found @accounts_initialize_fee_tier:39, discriminator found @accounts_initialize_fee_tier:39, initialized found @accounts_initialize_fee_tier:39)
- fee_tier.key: validated (pda found @accounts_initialize_fee_tier:108, key found @accounts_initialize_fee_tier:108)
- fee_tier.data: runtime (owner runtime @ix_initialize_fee_tier:27)
- fee_authority.key: partially-validated (address partial @accounts_initialize_fee_tier:200)
- system_program.key: validated (address found @accounts_initialize_fee_tier:85)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/initialize_fee_tier.ts:146 | PARTIAL | fee_tier |  | `o != 2` | return |
| 1 | bundle/initialize_fee_tier.ts:219 | found | config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `ld64(s70) == 0` | return |
| 2 | bundle/initialize_fee_tier.ts:233 | found |  | count | `j == 0` | anchor::AccountNotEnoughKeys |
| 3 | bundle/initialize_fee_tier.ts:248 | found | funder | signer (via try_accounts_11718 (count, signer)) | `l != 2` | return |
| 4 | bundle/initialize_fee_tier.ts:260 | found | fee_authority | signer (via try_accounts_11718 (count, signer)) | `n != 2` | return |
| 5 | bundle/initialize_fee_tier.ts:265 | found | system_program | address, executable (via fn_122e8 (count, address, executable)) | `p != 2` | return |
| 6 | bundle/initialize_fee_tier.ts:288 | found | fee_tier | key, pda | `!((memcmp(s70, s100, 0x20) as u32) == 0)` | anchor::ConstraintSeeds |
| 7 | bundle/initialize_fee_tier.ts:301 | PARTIAL | fee_tier | writable | `fee_tier.is_writable == 0` | anchor::ConstraintMut |
| 8 | bundle/initialize_fee_tier.ts:364 | PARTIAL | fee_tier | rent_exempt | `au > ld64(s2b0)` | anchor::ConstraintRentExempt |
| 9 | bundle/initialize_fee_tier.ts:374 | PARTIAL | funder | writable | `funder.is_writable == 0` | anchor::ConstraintMut |
| 10 | bundle/initialize_fee_tier.ts:380 | PARTIAL | fee_authority | address | `s != 0` | anchor::ConstraintAddress |
| 11 | entrypoint.ts:677 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 12 | entrypoint.ts:686 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 13 | bundle/initialize_fee_tier.ts:567 | PARTIAL |  | key | `(memcmp(s40, s1f0, 0x20) as u32) == 0` | anchor::TryingToInitPayerAsProgramAccount |
| 14 | entrypoint.ts:13224 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 15 | bundle/initialize_fee_tier.ts:971 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 16 | bundle/initialize_fee_tier.ts:980 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
