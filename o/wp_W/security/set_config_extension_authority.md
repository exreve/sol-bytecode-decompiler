# set_config_extension_authority

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_set_config_extension_authority (anchor); 29 functions reachable: ix_set_config_extension_authority, accounts_set_config_extension_authority, memcpy, fn_7598, fn_147990, fn_11f980, fn_139720, fn_149678, fn_9900, fn_9d30, fn_143248, fn_13ae08, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpools_config [str] | — | — | found (+discriminator found) | — | — |
| 1 | whirlpools_config_extension [str] | — | found | found (+discriminator found) | — | — |
| 2 | new_config_extension_authority [str] | — | — | — | — | — |
| 3 | config_extension_authority [str] | found | — | — | — | found |

## Constraints per account

- whirlpools_config: owner found (bundle/set_config_extension_authority.ts:104 via try_accounts_11de0); initialized found (bundle/set_config_extension_authority.ts:104 via try_accounts_11de0); discriminator found (bundle/set_config_extension_authority.ts:104 via try_accounts_11de0)
- whirlpools_config_extension: owner found (bundle/set_config_extension_authority.ts:121 via try_accounts_120c0); initialized found (bundle/set_config_extension_authority.ts:121 via try_accounts_120c0); discriminator found (bundle/set_config_extension_authority.ts:121 via try_accounts_120c0); writable found (bundle/set_config_extension_authority.ts:153); key found (bundle/set_config_extension_authority.ts:167); has_one found (bundle/set_config_extension_authority.ts:167)
- new_config_extension_authority: count found (bundle/set_config_extension_authority.ts:136)
- config_extension_authority: signer found (bundle/set_config_extension_authority.ts:134 via try_accounts_11718); key found (bundle/set_config_extension_authority.ts:183); address found (bundle/set_config_extension_authority.ts:183)

## Operations (account writes)

- bundle/set_config_extension_authority.ts:81 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE whirlpools_config_extension.data[40..72] = ld64(i)

## Dominance (checks on every path to the operation; across calls)

- bundle/set_config_extension_authority.ts:81 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner whirlpools_config_extension; initialized whirlpools_config_extension; discriminator whirlpools_config_extension; signer config_extension_authority; writable whirlpools_config_extension; …)

## Authority (who enables each value movement / authority change)

- bundle/set_config_extension_authority.ts:81 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE: signer config_extension_authority (found); stored config_extension_authority.key == whirlpools_config_extension.config_extension_authority (found); stored config_extension_authority.key == (constant address) (found)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/set_config_extension_authority.ts:81 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE whirlpools_config_extension.data[40..72] [AUTHORITY_WRITE]
  - [found] authorized (signer / PDA signature / stored authority) — signer config_extension_authority (found); stored config_extension_authority.key == whirlpools_config_extension.config_extension_authority (found); stored config_extension_authority.key == (constant a
  - [found] signer related to a stored authority (or PDA signature) — config_extension_authority.key == whirlpools_config_extension.config_extension_authority; config_extension_authority.key == (constant address)
  - [PARTIAL] new value validated — value ld64(i)
  - [found] relevant checks on every path — 13 dominating checks

## Authorization chains (operation ⇐ … ⇐ signer)

- bundle/set_config_extension_authority.ts:81 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE whirlpools_config_extension.data[40..72] ⇐ signer config_extension_authority (found) ⇐ stored whirlpools_config_extension.config_extension_authority == config_extension_authority.key (found) ⇐ writer whirlpools_config_extension.config_extension_authority: no instruction writing it found (set at creation, or outside the recognized writes)
- bundle/set_config_extension_authority.ts:81 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE whirlpools_config_extension.data[40..72] ⇐ signer config_extension_authority (found) ⇐ stored (constant address) == config_extension_authority.key (found) ⇐ writer (constant address): no instruction writing it found (set at creation, or outside the recognized writes)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/set_config_extension_authority.ts:81 ACCOUNT_DATA_WRITE, AUTHORITY_WRITE whirlpools_config_extension.data[40..72]: ✗ `f == 0`

## Relations (equalities the checks establish)

- whirlpools_config_extension.config_extension_authority? == config_extension_authority.key (has_one, found, bundle/set_config_extension_authority.ts:167)
- config_extension_authority.key == (constant address) (address, found, bundle/set_config_extension_authority.ts:183)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpools_config.key, new_config_extension_authority.key
- whirlpools_config.data: validated (owner found @accounts_set_config_extension_authority:8, discriminator found @accounts_set_config_extension_authority:8, initialized found @accounts_set_config_extension_authority:8)
- whirlpools_config_extension.key: validated (key found @accounts_set_config_extension_authority:71, has_one found @accounts_set_config_extension_authority:71)
- whirlpools_config_extension.data: validated (owner found @accounts_set_config_extension_authority:25, discriminator found @accounts_set_config_extension_authority:25, initialized found @accounts_set_config_extension_authority:25)
- config_extension_authority.key: validated (address found @accounts_set_config_extension_authority:87, key found @accounts_set_config_extension_authority:87)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/set_config_extension_authority.ts:85 | PARTIAL | whirlpools_config_extension |  | `m != 2` | return |
| 1 | bundle/set_config_extension_authority.ts:104 | found | whirlpools_config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `ld64(s70) == 0` | return |
| 2 | bundle/set_config_extension_authority.ts:121 | found | whirlpools_config_extension | owner, initialized, discriminator (via try_accounts_120c0 (count, owner, initialized, discriminator)) | `whirlpools_config_extension == 0` | return |
| 3 | bundle/set_config_extension_authority.ts:134 | found | config_extension_authority | signer (via try_accounts_11718 (count, signer)) | `k != 2` | return |
| 4 | bundle/set_config_extension_authority.ts:136 | found | new_config_extension_authority | count | `l == 0` | anchor::AccountNotEnoughKeys |
| 5 | bundle/set_config_extension_authority.ts:153 | found | whirlpools_config_extension | writable | `whirlpools_config_extension.is_writable == 0` | anchor::ConstraintMut |
| 6 | bundle/set_config_extension_authority.ts:167 | found | whirlpools_config_extension | key, has_one | `(memcmp(sb0, s90, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 7 | bundle/set_config_extension_authority.ts:183 | found | config_extension_authority | key, address | `!((memcmp(sb0, s90, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 8 | entrypoint.ts:677 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 9 | entrypoint.ts:686 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 10 | entrypoint.ts:740 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 11 | entrypoint.ts:749 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 12 | entrypoint.ts:13224 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 13 | entrypoint.ts:13263 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
