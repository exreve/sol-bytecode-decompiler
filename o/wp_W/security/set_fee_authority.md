# set_fee_authority

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_set_fee_authority (anchor); 27 functions reachable: ix_set_fee_authority, accounts_set_fee_authority, memcpy, fn_8228, fn_147990, fn_11f980, fn_139720, fn_149678, fn_9900, fn_143248, fn_13ae08, fn_149478, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpools_config [str] | — | found | found (+discriminator found) | — | — |
| 1 | new_fee_authority [str] | — | — | — | — | — |
| 2 | fee_authority [str] | found | — | — | — | found |

## Constraints per account

- whirlpools_config: owner found (bundle/set_fee_authority.ts:105 via try_accounts_11de0); initialized found (bundle/set_fee_authority.ts:105 via try_accounts_11de0); discriminator found (bundle/set_fee_authority.ts:105 via try_accounts_11de0); writable found (bundle/set_fee_authority.ts:137)
- new_fee_authority: count found (bundle/set_fee_authority.ts:120)
- fee_authority: signer found (bundle/set_fee_authority.ts:118 via try_accounts_11718); key found (bundle/set_fee_authority.ts:153); address found (bundle/set_fee_authority.ts:153)

## Operations (account writes)

- bundle/set_fee_authority.ts:79 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE whirlpools_config.data[8..40] = ld64(g)

## Dominance (checks on every path to the operation; across calls)

- bundle/set_fee_authority.ts:79 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE: 7 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer fee_authority; writable whirlpools_config; key fee_authority; address fee_authority; key; …)

## Authority (who enables each value movement / authority change)

- bundle/set_fee_authority.ts:79 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE: signer fee_authority (found); stored fee_authority.key == (constant address) (found); stored fee_authority.key == whirlpools_config.data (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/set_fee_authority.ts:79 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE whirlpools_config.data[8..40] [AUTHORITY_WRITE]
  - [found] authorized (signer / PDA signature / stored authority) — signer fee_authority (found); stored fee_authority.key == (constant address) (found); stored fee_authority.key == whirlpools_config.data (found)
  - [found] signer related to a stored authority (or PDA signature) — fee_authority.key == (constant address); fee_authority.key == whirlpools_config.data
  - [PARTIAL] new value validated — value ld64(g)
  - [found] relevant checks on every path — 8 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/set_fee_authority.ts:79 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE whirlpools_config.data[8..40] ⇐ signer fee_authority (found) ⇐ stored (constant address) == fee_authority.key (found) ⇐ writer (constant address): no instruction writing it found (set at creation, or outside the recognized writes)
- bundle/set_fee_authority.ts:79 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE whirlpools_config.data[8..40] ⇐ signer fee_authority (found) ⇐ stored whirlpools_config.data == fee_authority.key (found) ⇐ writer whirlpools_config.data: no instruction writing it found (set at creation, or outside the recognized writes)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/set_fee_authority.ts:79 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE whirlpools_config.data[8..40]: ✗ `f == 0`

## Relations (equalities the checks establish)

- fee_authority.key == (constant address) (address, found, bundle/set_fee_authority.ts:153)
- whirlpools_config.data == fee_authority.key (field_eq, found, bundle/set_fee_authority.ts:153)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpools_config.key, new_fee_authority.key
- whirlpools_config.data: validated (owner found @accounts_set_fee_authority:11, discriminator found @accounts_set_fee_authority:11, initialized found @accounts_set_fee_authority:11)
- fee_authority.key: validated (address found @accounts_set_fee_authority:59, key found @accounts_set_fee_authority:59)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/set_fee_authority.ts:83 | PARTIAL | whirlpools_config |  | `k != 2` | return |
| 1 | bundle/set_fee_authority.ts:105 | found | whirlpools_config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `whirlpools_config == 0` | return |
| 2 | bundle/set_fee_authority.ts:118 | found | fee_authority | signer (via try_accounts_11718 (count, signer)) | `h != 2` | return |
| 3 | bundle/set_fee_authority.ts:120 | found | new_fee_authority | count | `i == 0` | anchor::AccountNotEnoughKeys |
| 4 | bundle/set_fee_authority.ts:137 | found | whirlpools_config | writable | `whirlpools_config.is_writable == 0` | anchor::ConstraintMut |
| 5 | bundle/set_fee_authority.ts:153 | found | fee_authority | key, address | `(memcmp(s40, s20, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 6 | entrypoint.ts:677 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 7 | entrypoint.ts:686 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 8 | entrypoint.ts:13224 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
