# set_reward_authority_by_super_authority

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_set_reward_authority_by_super_authority (anchor); 29 functions reachable: ix_set_reward_authority_by_super_authority, accounts_set_reward_authority_by_super_authority, memcpy, fn_6aa0, fn_147990, fn_11f980, fn_139720, fn_149678, fn_9900, fn_89e0, fn_143248, fn_13ae08, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpools_config [str] | — | — | found (+discriminator found) | — | — |
| 1 | whirlpool [str] | — | found | found (+discriminator found) | — | — |
| 2 | new_reward_authority [str] | — | — | — | — | — |
| 3 | reward_emissions_super_authority [str] | found | — | — | — | found |

## Constraints per account

- whirlpools_config: owner found (bundle/set_reward_authority_by_super_authority.ts:162 via try_accounts_11de0); initialized found (bundle/set_reward_authority_by_super_authority.ts:162 via try_accounts_11de0); discriminator found (bundle/set_reward_authority_by_super_authority.ts:162 via try_accounts_11de0)
- whirlpool: owner found (bundle/set_reward_authority_by_super_authority.ts:176 via try_accounts_11a48); initialized found (bundle/set_reward_authority_by_super_authority.ts:176 via try_accounts_11a48); discriminator found (bundle/set_reward_authority_by_super_authority.ts:176 via try_accounts_11a48); writable found (bundle/set_reward_authority_by_super_authority.ts:208); key found (bundle/set_reward_authority_by_super_authority.ts:221); has_one found (bundle/set_reward_authority_by_super_authority.ts:221)
- new_reward_authority: count found (bundle/set_reward_authority_by_super_authority.ts:191)
- reward_emissions_super_authority: signer found (bundle/set_reward_authority_by_super_authority.ts:189 via try_accounts_11718); key found (bundle/set_reward_authority_by_super_authority.ts:238); address found (bundle/set_reward_authority_by_super_authority.ts:238)

## Relations (equalities the checks establish)

- whirlpool.reward_emissions_super_authority? == reward_emissions_super_authority.key (has_one, found, bundle/set_reward_authority_by_super_authority.ts:221)
- reward_emissions_super_authority.key == (constant address) (address, found, bundle/set_reward_authority_by_super_authority.ts:238)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpools_config.key, new_reward_authority.key
- whirlpools_config.data: validated (owner found @accounts_set_reward_authority_by_super_authority:38, discriminator found @accounts_set_reward_authority_by_super_authority:38, initialized found @accounts_set_reward_authority_by_super_authority:38)
- whirlpool.key: validated (key found @accounts_set_reward_authority_by_super_authority:97, has_one found @accounts_set_reward_authority_by_super_authority:97)
- whirlpool.data: validated (owner found @accounts_set_reward_authority_by_super_authority:52, discriminator found @accounts_set_reward_authority_by_super_authority:52, initialized found @accounts_set_reward_authority_by_super_authority:52)
- reward_emissions_super_authority.key: validated (address found @accounts_set_reward_authority_by_super_authority:114, key found @accounts_set_reward_authority_by_super_authority:114)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/set_reward_authority_by_super_authority.ts:113 | found | whirlpool |  | `n != 2` | return |
| 1 | bundle/set_reward_authority_by_super_authority.ts:162 | found | whirlpools_config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `whirlpools_config == 0` | return |
| 2 | bundle/set_reward_authority_by_super_authority.ts:176 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `whirlpool == 0` | return |
| 3 | bundle/set_reward_authority_by_super_authority.ts:189 | found | reward_emissions_super_authority | signer (via try_accounts_11718 (count, signer)) | `l != 2` | return |
| 4 | bundle/set_reward_authority_by_super_authority.ts:191 | found | new_reward_authority | count | `m == 0` | anchor::AccountNotEnoughKeys |
| 5 | bundle/set_reward_authority_by_super_authority.ts:208 | found | whirlpool | writable | `whirlpool.is_writable == 0` | anchor::ConstraintMut |
| 6 | bundle/set_reward_authority_by_super_authority.ts:221 | found | whirlpool | key, has_one | `(memcmp(s40, s20, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 7 | bundle/set_reward_authority_by_super_authority.ts:238 | found | reward_emissions_super_authority | key, address | `!((memcmp(s40, s20, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 8 | entrypoint.ts:677 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 9 | entrypoint.ts:686 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 10 | entrypoint.ts:438 | PARTIAL |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 11 | entrypoint.ts:447 | PARTIAL |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 12 | entrypoint.ts:13224 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 13 | entrypoint.ts:13592 | PARTIAL |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
