# set_reward_emissions

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_set_reward_emissions (anchor); 37 functions reachable: ix_set_reward_emissions, accounts_set_reward_emissions, memcpy, fn_367c0, fn_6aa0, fn_147990, fn_11f980, fn_139720, fn_149678, fn_89e0, fn_83078, fn_143100, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpool [str] | — | found | found (+discriminator found) | — | — |
| 1 | reward_vault [str] | — | — | found (+discriminator found) | — | found |
| 2 | reward_authority [str] | found | — | — | — | found |

## Constraints per account

- whirlpool: owner found (bundle/set_reward_emissions.ts:197 via try_accounts_11a48); initialized found (bundle/set_reward_emissions.ts:197 via try_accounts_11a48); discriminator found (bundle/set_reward_emissions.ts:197 via try_accounts_11a48); writable found (bundle/set_reward_emissions.ts:229)
- reward_vault: owner found (bundle/set_reward_emissions.ts:216 via try_accounts_11f50); discriminator found (bundle/set_reward_emissions.ts:216 via try_accounts_11f50); initialized found (bundle/set_reward_emissions.ts:216 via try_accounts_11f50); address found (bundle/set_reward_emissions.ts:266)
- reward_authority: signer found (bundle/set_reward_emissions.ts:211 via try_accounts_11718); key found (bundle/set_reward_emissions.ts:242); address found (bundle/set_reward_emissions.ts:242)

## Operations (account writes)

- bundle/set_reward_emissions.ts:376 ACCOUNT_DATA_WRITE whirlpool.data[197..205] = k [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/set_reward_emissions.ts:376 ACCOUNT_DATA_WRITE: 10 dominating checks (owner whirlpool; initialized whirlpool; discriminator whirlpool; signer reward_authority; owner reward_vault; discriminator reward_vault; initialized reward_vault; writable whirlpool; …)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/set_reward_emissions.ts:376 ACCOUNT_DATA_WRITE whirlpool.data[197..205] [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — whirlpool: discriminator found
  - [found] write gated (signer / constraint) — signer reward_authority accounts_set_reward_emissions:56; key/address reward_authority accounts_set_reward_emissions:87; address reward_vault accounts_set_reward_emissions:111

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/set_reward_emissions.ts:376 ACCOUNT_DATA_WRITE whirlpool.data[197..205]: ✗ `(o as u8) > 2` · ✗ `ld32(s308) != 0` · `ld64(s308) == 0` · ✗ `i == 2` · ✗ `0x11 > f` · ✗ `f == 0`

## Relations (equalities the checks establish)

- reward_authority.key == (constant address) (address, found, bundle/set_reward_emissions.ts:242)
- whirlpool.data == reward_authority.key (field_eq, found, bundle/set_reward_emissions.ts:242)
- reward_vault.key == (constant address) (address, found, bundle/set_reward_emissions.ts:266)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpool.key
- whirlpool.data: validated (owner found @accounts_set_reward_emissions:42, discriminator found @accounts_set_reward_emissions:42, initialized found @accounts_set_reward_emissions:42)
- reward_vault.key: validated (address found @accounts_set_reward_emissions:111)
- reward_vault.data: validated (owner found @accounts_set_reward_emissions:61, discriminator found @accounts_set_reward_emissions:61, initialized found @accounts_set_reward_emissions:61)
- reward_authority.key: validated (address found @accounts_set_reward_emissions:87, key found @accounts_set_reward_emissions:87)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/set_reward_emissions.ts:117 | PARTIAL | whirlpool |  | `l != 2` | return |
| 1 | bundle/set_reward_emissions.ts:197 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `whirlpool == 0` | return |
| 2 | bundle/set_reward_emissions.ts:211 | found | reward_authority | signer (via try_accounts_11718 (count, signer)) | `j != 2` | return |
| 3 | bundle/set_reward_emissions.ts:216 | found | reward_vault | owner, discriminator, initialized (via try_accounts_11f50 (count, owner, discriminator, initialized)) | `k == 2` | return |
| 4 | bundle/set_reward_emissions.ts:229 | found | whirlpool | writable | `whirlpool.is_writable == 0` | anchor::ConstraintMut |
| 5 | bundle/set_reward_emissions.ts:242 | found | reward_authority | key, address | `(memcmp(s40, s20, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 6 | bundle/set_reward_emissions.ts:266 | found | reward_vault | address | `!((y as u32) == 0)` | anchor::ConstraintAddress |
| 7 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 8 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 9 | bundle/set_reward_emissions.ts:614 | found |  | key | `(memcmp(sa0, s20, 0x20) as u32) == 0` | return |
| 10 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
