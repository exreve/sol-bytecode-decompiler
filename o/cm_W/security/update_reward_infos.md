# update_reward_infos

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_update_reward_infos (anchor); 34 functions reachable: ix_update_reward_infos, fn_bca70, fn_43c50, fn_bce50, anchor_error_from, fn_5608, fn_14d660, fn_125710, fn_53e8, fn_6c2a0, log_data, fn_a80, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | pool_state | — | expected · found | — | — | — |

## Constraints per account

- pool_state: writable found (bundle/update_reward_infos.ts:163)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): pool_state.key

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/update_reward_infos.ts:163 | found | pool_state | writable | `f == 2` | anchor::ConstraintMut |
| 1 | shared.ts:1017 | PARTIAL |  | owner | `(g as u32) != 0` | anchor::AccountOwnedByWrongProgram |
| 2 | shared.ts:1035 | PARTIAL |  | discriminator | `8 > j` | anchor::AccountDiscriminatorNotFound |
| 3 | shared.ts:1043 | PARTIAL |  | discriminator | `ld64(ld64(i)) != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
| 4 | bundle/update_reward_infos.ts:372 | found |  | writable | `!(ld8(b + 0x29) != 0)` | anchor::AccountNotMutable |
| 5 | bundle/update_reward_infos.ts:377 | found |  | discriminator | `8 > h` | anchor::AccountDiscriminatorNotFound |
| 6 | bundle/update_reward_infos.ts:388 | found |  | discriminator | `j != 0x46dec3d7f5e3edf7 /* account:PoolState */` | anchor::AccountDiscriminatorMismatch |
