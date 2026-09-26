# transfer_reward_owner

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_transfer_reward_owner (anchor); 28 functions reachable: ix_transfer_reward_owner, fn_cdf88, fn_53e8, fn_cf1b8, anchor_error_from, fn_5608, fn_88360, fn_11e480, memcpy, fn_a80, fn_14d660, fn_125710, ….

## Look first

- ⚠ authority: address expected, no check found

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | authority | expected · found | — | — | — | = GThUX1At… · expected · NOT FOUND |
| 1 | pool_state | — | expected · PARTIAL | — | — | — |

## Constraints per account

- authority: signer found (bundle/transfer_reward_owner.ts:241 via try_accounts_17a30); address NOT FOUND
- pool_state: writable PARTIAL (bundle/transfer_reward_owner.ts:278)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): authority.key, pool_state.key, ix.new_owner

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/transfer_reward_owner.ts:241 | found | authority | signer (via try_accounts_17a30 (count, signer)) | `f != 2` | return |
| 1 | bundle/transfer_reward_owner.ts:278 | PARTIAL | pool_state | writable | `j == 0` | anchor::ConstraintMut |
| 2 | bundle/transfer_reward_owner.ts:279 | PARTIAL | pool_state | writable | `!(ld8(x + 0x29) != 0)` | anchor::ConstraintMut |
| 3 | bundle/transfer_reward_owner.ts:418 | found |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 4 | bundle/transfer_reward_owner.ts:423 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 5 | bundle/transfer_reward_owner.ts:434 | found |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 6 | shared.ts:1017 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 7 | shared.ts:1035 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 8 | shared.ts:1043 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
