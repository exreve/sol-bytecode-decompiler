# update_pool_status

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_update_pool_status (anchor); 25 functions reachable: ix_update_pool_status, fn_ce8a0, fn_53e8, fn_cf1b8, anchor_error_from, fn_5608, fn_11e480, memcpy, fn_a80, fn_14d660, fn_125710, fn_13e628, ….

## Look first

- ⚠ authority: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | authority | expected · found | — | — | — | = GThUX1At… · expected · NOT FOUND |
| 1 | pool_state | — | expected · runtime | found (+discriminator found) | — | — |

## Constraints per account

- authority: signer found (bundle/update_pool_status.ts:199 via try_accounts_17a30); address NOT FOUND
- pool_state: discriminator found (bundle/update_pool_status.ts:232 via fn_11e0); owner found (bundle/update_pool_status.ts:232 via fn_11e0); writable runtime (bundle/update_pool_status.ts:184) — written: the runtime rejects changes to a read-only account

## Operations (account writes)

- bundle/update_pool_status.ts:184 ACCOUNT_DATA_WRITE pool_state.status = status [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/update_pool_status.ts:184 ACCOUNT_DATA_WRITE: 6 dominating checks (signer authority; discriminator pool_state; owner pool_state; writable; discriminator; owner)
  - sources: pool_state.status ← ix.status (caller-controlled)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/update_pool_status.ts:184 ACCOUNT_DATA_WRITE pool_state.status [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — pool_state: discriminator found
  - [found] write gated (signer / constraint) — signer authority fn_ce8a0:7
  - [PARTIAL] amount arithmetic checked — pool_state.status ← ix.status (caller-controlled)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/update_pool_status.ts:184 ACCOUNT_DATA_WRITE pool_state.status: ✗ `ld64(s18) != 0` · ✗ `ld64(s18) != 0` · ✗ `ix_args_len == 0`

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): authority.key, pool_state.key, ix.status
- pool_state.data: validated (owner found @fn_ce8a0:40, discriminator found @fn_ce8a0:40)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/update_pool_status.ts:199 | found | authority | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/update_pool_status.ts:232 | found | pool_state | discriminator, owner (via fn_11e0 (count, discriminator, owner)) | `g != 2` | return |
| 2 | bundle/update_pool_status.ts:237 | PARTIAL | pool_state | writable | `!(ld8(x + 0x29) != 0)` | anchor::ConstraintMut |
| 3 | bundle/update_pool_status.ts:376 | found |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 4 | bundle/update_pool_status.ts:381 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 5 | bundle/update_pool_status.ts:392 | found |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 6 | shared.ts:1017 | found |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 7 | shared.ts:1035 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 8 | shared.ts:1043 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
