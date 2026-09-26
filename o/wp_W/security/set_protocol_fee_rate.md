# set_protocol_fee_rate

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_set_protocol_fee_rate (anchor); 32 functions reachable: ix_set_protocol_fee_rate, accounts_set_fee_rate, memcpy, fn_83340, fn_87828, fn_149678, fn_11f980, fn_6aa0, fn_147990, fn_139720, fn_9900, fn_89e0, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpools_config [str] | — | — | found (+discriminator found) | — | — |
| 1 | whirlpool [str] | — | found | found (+discriminator found) | — | — |
| 2 | fee_authority [str] | found | — | — | — | found |

## Constraints per account

- whirlpools_config: owner found (bundle/set_protocol_fee_rate.ts:141 via try_accounts_11de0); initialized found (bundle/set_protocol_fee_rate.ts:141 via try_accounts_11de0); discriminator found (bundle/set_protocol_fee_rate.ts:141 via try_accounts_11de0)
- whirlpool: owner found (bundle/set_protocol_fee_rate.ts:155 via try_accounts_11a48); initialized found (bundle/set_protocol_fee_rate.ts:155 via try_accounts_11a48); discriminator found (bundle/set_protocol_fee_rate.ts:155 via try_accounts_11a48); writable found (bundle/set_protocol_fee_rate.ts:169); key found (bundle/set_protocol_fee_rate.ts:181); has_one found (bundle/set_protocol_fee_rate.ts:181)
- fee_authority: signer found (bundle/set_protocol_fee_rate.ts:168 via try_accounts_11718); key found (bundle/set_protocol_fee_rate.ts:202); address found (bundle/set_protocol_fee_rate.ts:202)

## Operations (account writes)

- bundle/set_protocol_fee_rate.ts:115 ACCOUNT_DATA_WRITE whirlpool.data[47..49] = m [conditional]

## Dominance (checks on every path to the operation; across calls)

- bundle/set_protocol_fee_rate.ts:115 ACCOUNT_DATA_WRITE: 12 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner whirlpool; initialized whirlpool; discriminator whirlpool; signer fee_authority; writable whirlpool; …)
  - sources: whirlpool.data[47..49] ← instruction data (caller-controlled)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/set_protocol_fee_rate.ts:115 ACCOUNT_DATA_WRITE whirlpool.data[47..49] [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — whirlpool: discriminator found
  - [found] write gated (signer / constraint) — signer fee_authority accounts_set_fee_rate:38; key/has_one whirlpool accounts_set_fee_rate:51; key/address fee_authority accounts_set_fee_rate:72
  - [PARTIAL] amount arithmetic checked — whirlpool.data[47..49] ← instruction data (caller-controlled)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/set_protocol_fee_rate.ts:115 ACCOUNT_DATA_WRITE whirlpool.data[47..49]: ✗ `m > 0x9c4 /* anchor::RequireViolated */` · ✗ `f == 0` · ✗ `2 > ix_args_len`

## Relations (equalities the checks establish)

- whirlpool.fee_authority? == fee_authority.key (has_one, found, bundle/set_protocol_fee_rate.ts:181)
- fee_authority.key == (constant address) (address, found, bundle/set_protocol_fee_rate.ts:202)
- whirlpools_config.data == fee_authority.key (field_eq, found, bundle/set_protocol_fee_rate.ts:202)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpools_config.key
- whirlpools_config.data: validated (owner found @accounts_set_fee_rate:11, discriminator found @accounts_set_fee_rate:11, initialized found @accounts_set_fee_rate:11)
- whirlpool.key: validated (key found @accounts_set_fee_rate:51, has_one found @accounts_set_fee_rate:51)
- whirlpool.data: validated (owner found @accounts_set_fee_rate:25, discriminator found @accounts_set_fee_rate:25, initialized found @accounts_set_fee_rate:25)
- fee_authority.key: validated (address found @accounts_set_fee_rate:72, key found @accounts_set_fee_rate:72)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/set_protocol_fee_rate.ts:119 | PARTIAL | whirlpool |  | `l != 2` | return |
| 1 | bundle/set_protocol_fee_rate.ts:141 | found | whirlpools_config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `whirlpools_config == 0` | return |
| 2 | bundle/set_protocol_fee_rate.ts:155 | found | whirlpool | owner, initialized, discriminator (via try_accounts_11a48 (count, owner, initialized, discriminator)) | `whirlpool == 0` | return |
| 3 | bundle/set_protocol_fee_rate.ts:168 | found | fee_authority | signer (via try_accounts_11718 (count, signer)) | `l != 2` | return |
| 4 | bundle/set_protocol_fee_rate.ts:169 | found | whirlpool | writable | `whirlpool.is_writable == 0` | anchor::ConstraintMut |
| 5 | bundle/set_protocol_fee_rate.ts:181 | found | whirlpool | key, has_one | `(memcmp(s40, s20, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 6 | bundle/set_protocol_fee_rate.ts:202 | found | fee_authority | key, address | `!((memcmp(s40, s20, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 7 | entrypoint.ts:677 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 8 | entrypoint.ts:686 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 9 | entrypoint.ts:438 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 10 | entrypoint.ts:447 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 11 | entrypoint.ts:13224 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 12 | entrypoint.ts:13592 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
