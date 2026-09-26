# set_reward_authority

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_set_reward_authority (anchor); 27 functions reachable: ix_set_reward_authority, accounts_set_reward_authority, memcpy, fn_6aa0, fn_147990, fn_11f980, fn_139720, fn_149678, fn_89e0, fn_143248, fn_13ae08, fn_149478, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpool [str] | — | found | found (+discriminator found) | — | — |
| 1 | new_reward_authority [str] | — | — | — | — | — |
| 2 | reward_authority [str] | found | — | — | — | found |

## Constraints per account

- whirlpool: owner found (bundle/set_reward_authority.ts:132 via try_accounts_11a48); initialized found (bundle/set_reward_authority.ts:132 via try_accounts_11a48); discriminator found (bundle/set_reward_authority.ts:132 via try_accounts_11a48); writable found (bundle/set_reward_authority.ts:164)
- new_reward_authority: count found (bundle/set_reward_authority.ts:147)
- reward_authority: signer found (bundle/set_reward_authority.ts:145 via try_accounts_11718); key found (bundle/set_reward_authority.ts:177); address found (bundle/set_reward_authority.ts:177)

## Relations (equalities the checks establish)

- reward_authority.key == (constant address) (address, found, bundle/set_reward_authority.ts:177)
- whirlpool.data == reward_authority.key (field_eq, found, bundle/set_reward_authority.ts:177)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool.key, new_reward_authority.key
- whirlpool.data: validated (owner found @accounts_set_reward_authority:11, discriminator found @accounts_set_reward_authority:11, initialized found @accounts_set_reward_authority:11)
- reward_authority.key: validated (address found @accounts_set_reward_authority:56, key found @accounts_set_reward_authority:56)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/set_reward_authority.ts:110 | found | whirlpool |  | `m != 2` | return |
| 1 | bundle/set_reward_authority.ts:132 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `whirlpool == 0` | return |
| 2 | bundle/set_reward_authority.ts:145 | found | reward_authority | signer (via try_accounts_11718 (count, signer)) | `h != 2` | return |
| 3 | bundle/set_reward_authority.ts:147 | found | new_reward_authority | count | `i == 0` | anchor::AccountNotEnoughKeys |
| 4 | bundle/set_reward_authority.ts:164 | found | whirlpool | writable | `whirlpool.is_writable == 0` | anchor::ConstraintMut |
| 5 | bundle/set_reward_authority.ts:177 | found | reward_authority | key, address | `(memcmp(s40, s20, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 6 | entrypoint.ts:438 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 7 | entrypoint.ts:447 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 8 | entrypoint.ts:13592 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
