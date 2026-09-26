# migrate_repurpose_reward_authority_space

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_migrate_repurpose_reward_authority_space (anchor); 27 functions reachable: ix_migrate_repurpose_reward_authority_space, accounts_migrate_repurpose_reward_authority_space, memcpy, fn_6aa0, fn_147990, fn_11f980, fn_139720, fn_149678, fn_89e0, fn_143248, fn_13ae08, fn_149478, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpool [str] | — | found | found (+discriminator found) | — | — |

## Constraints per account

- whirlpool: owner found (bundle/migrate_repurpose_reward_authority_space.ts:120 via try_accounts_11a48); initialized found (bundle/migrate_repurpose_reward_authority_space.ts:120 via try_accounts_11a48); discriminator found (bundle/migrate_repurpose_reward_authority_space.ts:120 via try_accounts_11a48); writable found (bundle/migrate_repurpose_reward_authority_space.ts:129)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool.key
- whirlpool.data: validated (owner found @accounts_migrate_repurpose_reward_authority_space:11, discriminator found @accounts_migrate_repurpose_reward_authority_space:11, initialized found @accounts_migrate_repurpose_reward_authority_space:11)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/migrate_repurpose_reward_authority_space.ts:89 | found |  | key | `!((memcmp(s3d8, 0x100152180, 0x20) as u32) != 0)` | abort |
| 1 | bundle/migrate_repurpose_reward_authority_space.ts:94 | found | whirlpool |  | `i != 2` | return |
| 2 | bundle/migrate_repurpose_reward_authority_space.ts:120 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `whirlpool == 0` | return |
| 3 | bundle/migrate_repurpose_reward_authority_space.ts:129 | found | whirlpool | writable | `whirlpool.is_writable == 0` | anchor::ConstraintMut |
| 4 | entrypoint.ts:438 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 5 | entrypoint.ts:447 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 6 | entrypoint.ts:13592 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
