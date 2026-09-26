# set_default_protocol_fee_rate

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_set_default_protocol_fee_rate (anchor); 30 functions reachable: ix_set_default_protocol_fee_rate, accounts_set_default_protocol_fee_rate, memcpy, fn_83340, fn_87828, fn_149678, fn_11f980, fn_8228, fn_147990, fn_139720, fn_9900, fn_bb78, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpools_config [str] | — | found | found (+discriminator found) | — | — |
| 1 | fee_authority [str] | found | — | — | — | found |

## Constraints per account

- whirlpools_config: owner found (bundle/set_default_protocol_fee_rate.ts:139 via try_accounts_11de0); initialized found (bundle/set_default_protocol_fee_rate.ts:139 via try_accounts_11de0); discriminator found (bundle/set_default_protocol_fee_rate.ts:139 via try_accounts_11de0); writable found (bundle/set_default_protocol_fee_rate.ts:153)
- fee_authority: signer found (bundle/set_default_protocol_fee_rate.ts:152 via try_accounts_11718); key found (bundle/set_default_protocol_fee_rate.ts:167); address found (bundle/set_default_protocol_fee_rate.ts:167)

## Operations (account writes)

- bundle/set_default_protocol_fee_rate.ts:102 ACCOUNT_DATA_WRITE whirlpools_config.data[8..40] = f, h, g
- bundle/set_default_protocol_fee_rate.ts:113 ACCOUNT_DATA_WRITE whirlpools_config.data[104..106] = m [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/set_default_protocol_fee_rate.ts:102 ACCOUNT_DATA_WRITE: 7 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer fee_authority; writable whirlpools_config; key fee_authority; address fee_authority; key; …)
- bundle/set_default_protocol_fee_rate.ts:113 ACCOUNT_DATA_WRITE: 7 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; signer fee_authority; writable whirlpools_config; key fee_authority; address fee_authority; key; …)
  - sources: whirlpools_config.data[104..106] ← instruction data (caller-controlled)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/set_default_protocol_fee_rate.ts:102 ACCOUNT_DATA_WRITE whirlpools_config.data[8..40] [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — whirlpools_config: discriminator found
  - [found] write gated (signer / constraint) — signer fee_authority accounts_set_default_protocol_fee_rate:24; key/address fee_authority accounts_set_default_protocol_fee_rate:39; key/initialized  fn_9900:5
- bundle/set_default_protocol_fee_rate.ts:113 ACCOUNT_DATA_WRITE whirlpools_config.data[104..106] [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — whirlpools_config: discriminator found
  - [found] write gated (signer / constraint) — signer fee_authority accounts_set_default_protocol_fee_rate:24; key/address fee_authority accounts_set_default_protocol_fee_rate:39; key/initialized  fn_9900:5
  - [PARTIAL] amount arithmetic checked — whirlpools_config.data[104..106] ← instruction data (caller-controlled)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/set_default_protocol_fee_rate.ts:102 ACCOUNT_DATA_WRITE whirlpools_config.data[8..40]: ✗ `f == 0` · ✗ `2 > ix_args_len`
- bundle/set_default_protocol_fee_rate.ts:113 ACCOUNT_DATA_WRITE whirlpools_config.data[104..106]: ✗ `m > 0x9c4 /* anchor::RequireViolated */` · ✗ `f == 0` · ✗ `2 > ix_args_len`

## Relations (equalities the checks establish)

- fee_authority.key == (constant address) (address, found, bundle/set_default_protocol_fee_rate.ts:167)
- whirlpools_config.data == fee_authority.key (field_eq, found, bundle/set_default_protocol_fee_rate.ts:167)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpools_config.key
- whirlpools_config.data: validated (owner found @accounts_set_default_protocol_fee_rate:11, discriminator found @accounts_set_default_protocol_fee_rate:11, initialized found @accounts_set_default_protocol_fee_rate:11)
- fee_authority.key: validated (address found @accounts_set_default_protocol_fee_rate:39, key found @accounts_set_default_protocol_fee_rate:39)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/set_default_protocol_fee_rate.ts:117 | PARTIAL | whirlpools_config |  | `l != 2` | return |
| 1 | bundle/set_default_protocol_fee_rate.ts:139 | found | whirlpools_config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `whirlpools_config == 0` | return |
| 2 | bundle/set_default_protocol_fee_rate.ts:152 | found | fee_authority | signer (via try_accounts_11718 (count, signer)) | `h != 2` | return |
| 3 | bundle/set_default_protocol_fee_rate.ts:153 | found | whirlpools_config | writable | `whirlpools_config.is_writable == 0` | anchor::ConstraintMut |
| 4 | bundle/set_default_protocol_fee_rate.ts:167 | found | fee_authority | key, address | `(memcmp(s40, s20, 0x20) as u32) != 0` | anchor::ConstraintAddress |
| 5 | entrypoint.ts:677 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 6 | entrypoint.ts:686 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 7 | entrypoint.ts:13224 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
