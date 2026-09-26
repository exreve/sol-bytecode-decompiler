# set_delegated_fee_authority

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_set_delegated_fee_authority (anchor); 29 functions reachable: ix_set_delegated_fee_authority, accounts_set_delegated_fee_authority, memcpy, fn_5f98, fn_147990, fn_11f980, fn_139720, fn_149678, fn_9900, fn_a590, fn_143248, fn_13ae08, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpools_config [str] | — | — | found (+discriminator found) | — | — |
| 1 | adaptive_fee_tier [str] | — | found | found | — | — |
| 2 | new_delegated_fee_authority [str] | — | — | — | — | — |
| 3 | fee_authority [str] | found | — | — | — | found |

## Constraints per account

- whirlpools_config: owner found (bundle/set_delegated_fee_authority.ts:106 via try_accounts_11de0); initialized found (bundle/set_delegated_fee_authority.ts:106 via try_accounts_11de0); discriminator found (bundle/set_delegated_fee_authority.ts:106 via try_accounts_11de0)
- adaptive_fee_tier: owner found (bundle/set_delegated_fee_authority.ts:120 via try_accounts_11d28); initialized found (bundle/set_delegated_fee_authority.ts:120 via try_accounts_11d28); writable found (bundle/set_delegated_fee_authority.ts:152); key found (bundle/set_delegated_fee_authority.ts:166); has_one found (bundle/set_delegated_fee_authority.ts:166)
- new_delegated_fee_authority: count found (bundle/set_delegated_fee_authority.ts:135)
- fee_authority: signer found (bundle/set_delegated_fee_authority.ts:133 via try_accounts_11718); key found (bundle/set_delegated_fee_authority.ts:186); address found (bundle/set_delegated_fee_authority.ts:186)

## Operations (account writes)

- bundle/set_delegated_fee_authority.ts:80 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE adaptive_fee_tier.data[76..108] = ld64(i)

## Dominance (checks on every path to the operation; across calls)

- bundle/set_delegated_fee_authority.ts:80 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner adaptive_fee_tier; initialized adaptive_fee_tier; signer fee_authority; writable adaptive_fee_tier; key adaptive_fee_tier; …)

## Authority (who enables each value movement / authority change)

- bundle/set_delegated_fee_authority.ts:80 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE: signer fee_authority (found); stored fee_authority.key == (constant address) (found); stored fee_authority.key == whirlpools_config.data (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/set_delegated_fee_authority.ts:80 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE adaptive_fee_tier.data[76..108] [AUTHORITY_WRITE]
  - [found] authorized (signer / PDA signature / stored authority) — signer fee_authority (found); stored fee_authority.key == (constant address) (found); stored fee_authority.key == whirlpools_config.data (found)
  - [found] signer related to a stored authority (or PDA signature) — fee_authority.key == (constant address); fee_authority.key == whirlpools_config.data
  - [PARTIAL] new value validated — value ld64(i)
  - [found] relevant checks on every path — 13 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/set_delegated_fee_authority.ts:80 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE adaptive_fee_tier.data[76..108] ⇐ signer fee_authority (found) ⇐ stored (constant address) == fee_authority.key (found) ⇐ writer (constant address): no instruction writing it found (set at creation, or outside the recognized writes)
- bundle/set_delegated_fee_authority.ts:80 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE adaptive_fee_tier.data[76..108] ⇐ signer fee_authority (found) ⇐ stored whirlpools_config.data == fee_authority.key (found) ⇐ writer whirlpools_config.data: no instruction writing it found (set at creation, or outside the recognized writes)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/set_delegated_fee_authority.ts:80 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE adaptive_fee_tier.data[76..108]: ✗ `f == 0`

## Relations (equalities the checks establish)

- adaptive_fee_tier.whirlpools_config == whirlpools_config.key (field_eq, found, bundle/set_delegated_fee_authority.ts:166)
- fee_authority.key == (constant address) (address, found, bundle/set_delegated_fee_authority.ts:186)
- whirlpools_config.data == fee_authority.key (field_eq, found, bundle/set_delegated_fee_authority.ts:186)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpools_config.key, new_delegated_fee_authority.key
- whirlpools_config.data: validated (owner found @accounts_set_delegated_fee_authority:11, discriminator found @accounts_set_delegated_fee_authority:11, initialized found @accounts_set_delegated_fee_authority:11)
- adaptive_fee_tier.key: validated (key found @accounts_set_delegated_fee_authority:71, has_one found @accounts_set_delegated_fee_authority:71)
- adaptive_fee_tier.data: validated (owner found @accounts_set_delegated_fee_authority:25, initialized found @accounts_set_delegated_fee_authority:25)
- fee_authority.key: validated (address found @accounts_set_delegated_fee_authority:91, key found @accounts_set_delegated_fee_authority:91)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/set_delegated_fee_authority.ts:84 | PARTIAL | adaptive_fee_tier |  | `m != 2` | return |
| 1 | bundle/set_delegated_fee_authority.ts:106 | found | whirlpools_config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `whirlpools_config == 0` | return |
| 2 | bundle/set_delegated_fee_authority.ts:120 | found | adaptive_fee_tier | owner, initialized (via try_accounts_11d28 (count, owner, initialized)) | `adaptive_fee_tier == 0` | return |
| 3 | bundle/set_delegated_fee_authority.ts:133 | found | fee_authority | signer (via try_accounts_11718 (count, signer)) | `l != 2` | return |
| 4 | bundle/set_delegated_fee_authority.ts:135 | found | new_delegated_fee_authority | count | `m == 0` | anchor::AccountNotEnoughKeys |
| 5 | bundle/set_delegated_fee_authority.ts:152 | found | adaptive_fee_tier | writable | `adaptive_fee_tier.is_writable == 0` | anchor::ConstraintMut |
| 6 | bundle/set_delegated_fee_authority.ts:166 | found | adaptive_fee_tier | key, has_one | `(memcmp(s40, s20, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 7 | bundle/set_delegated_fee_authority.ts:186 | found | fee_authority | key, address | `!((memcmp(s40, s20, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 8 | entrypoint.ts:677 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 9 | entrypoint.ts:686 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 10 | entrypoint.ts:866 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 11 | entrypoint.ts:875 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 12 | entrypoint.ts:13224 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 13 | entrypoint.ts:13185 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
