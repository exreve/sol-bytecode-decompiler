# set_token_badge_attribute

DERIVED, over-approximate view of the decompiled code (the verified source of truth: ../index.ts, ../bundle/).
Statuses: found (on every non-failing path) · PARTIAL (some paths) · NOT FOUND (no check recognized — not a proof of absence) · runtime (enforced by Solana).

Handler ix_set_token_badge_attribute (anchor); 45 functions reachable: ix_set_token_badge_attribute, accounts_set_token_badge_attribute, memcpy, fn_83340, fn_87828, fn_149678, fn_11f980, fn_7be0, fn_147e78, fn_147990, fn_83078, fn_139720, ….

## Account privileges (expected by the IDL · verified by the code)

| # | account | signer | writable | owner | executable | address |
|---|---|---|---|---|---|---|
| 0 | whirlpools_config [str] | — | — | found (+discriminator found) | — | — |
| 1 | whirlpools_config_extension [str] | — | — | found (+discriminator found) | — | — |
| 2 | token_mint [str] | — | — | found (+discriminator found) | — | — |
| 3 | token_badge [str] | — | found | found (+discriminator found) | — | — |
| 4 | token_badge_authority [str] | found | — | — | — | found |

## Constraints per account

- whirlpools_config: owner found (bundle/set_token_badge_attribute.ts:238 via try_accounts_11de0); initialized found (bundle/set_token_badge_attribute.ts:238 via try_accounts_11de0); discriminator found (bundle/set_token_badge_attribute.ts:238 via try_accounts_11de0)
- whirlpools_config_extension: owner found (bundle/set_token_badge_attribute.ts:252 via try_accounts_120c0); initialized found (bundle/set_token_badge_attribute.ts:252 via try_accounts_120c0); discriminator found (bundle/set_token_badge_attribute.ts:252 via try_accounts_120c0); key found (bundle/set_token_badge_attribute.ts:307); has_one found (bundle/set_token_badge_attribute.ts:307)
- token_mint: owner found (bundle/set_token_badge_attribute.ts:272 via try_accounts_610); discriminator found (bundle/set_token_badge_attribute.ts:272 via try_accounts_610); initialized found (bundle/set_token_badge_attribute.ts:272 via try_accounts_610)
- token_badge: owner found (bundle/set_token_badge_attribute.ts:289 via fn_12178); initialized found (bundle/set_token_badge_attribute.ts:289 via fn_12178); discriminator found (bundle/set_token_badge_attribute.ts:289 via fn_12178); writable found (bundle/set_token_badge_attribute.ts:312); key found (bundle/set_token_badge_attribute.ts:328); has_one found (bundle/set_token_badge_attribute.ts:328)
- token_badge_authority: signer found (bundle/set_token_badge_attribute.ts:268 via try_accounts_11718); key found (bundle/set_token_badge_attribute.ts:311); address found (bundle/set_token_badge_attribute.ts:311)

## Operations (account writes)

- bundle/set_token_badge_attribute.ts:112 ACCOUNT_DATA_WRITE token_badge.data[72..73] = i

## Dominance (checks on every path to the operation; across calls)

- bundle/set_token_badge_attribute.ts:112 ACCOUNT_DATA_WRITE: 19 dominating checks (owner whirlpools_config; initialized whirlpools_config; discriminator whirlpools_config; owner whirlpools_config_extension; initialized whirlpools_config_extension; discriminator whirlpools_config_extension; signer token_badge_authority; owner token_mint; …)
  - sources: token_badge.data[72..73] ← instruction data (caller-controlled)

## Proof trees (expected properties per operation: found / PARTIAL / NOT FOUND / runtime)

- bundle/set_token_badge_attribute.ts:112 ACCOUNT_DATA_WRITE token_badge.data[72..73] [ACCOUNT_DATA_WRITE]
  - [found] account owned by the program — data written: the runtime rejects writes by a non-owner program
  - [found] account type (discriminator) — token_badge: discriminator found
  - [found] write gated (signer / constraint) — signer token_badge_authority accounts_set_token_badge_attribute:38; key/has_one whirlpools_config_extension accounts_set_token_badge_attribute:77; key/address token_badge_authority accounts_set_token_badge_attribute:81
  - [PARTIAL] amount arithmetic checked — token_badge.data[72..73] ← instruction data (caller-controlled)

## Path conditions (on every path to the operation; ✗ = must not hold; #n = check n)

- bundle/set_token_badge_attribute.ts:112 ACCOUNT_DATA_WRITE token_badge.data[72..73]: ✗ `t == 2` · `2 > i` · ✗ `f == 1` · ✗ `h != 0` · ✗ `f == 0`

## Relations (equalities the checks establish)

- whirlpools_config_extension.token_badge_authority? == token_badge_authority.key (has_one, found, bundle/set_token_badge_attribute.ts:307)
- token_badge_authority.key == (constant address) (address, found, bundle/set_token_badge_attribute.ts:311)
- token_badge.token_badge_authority? == token_badge_authority.key (has_one, found, bundle/set_token_badge_attribute.ts:328)
- token_badge.token_mint == token_mint.key (field_eq, found, bundle/set_token_badge_attribute.ts:345)

## Trust (caller-controlled vs validated values)

- caller-controlled (no validating check found): whirlpools_config.key, token_mint.key
- whirlpools_config.data: validated (owner found @accounts_set_token_badge_attribute:8, discriminator found @accounts_set_token_badge_attribute:8, initialized found @accounts_set_token_badge_attribute:8)
- whirlpools_config_extension.key: validated (key found @accounts_set_token_badge_attribute:77, has_one found @accounts_set_token_badge_attribute:77)
- whirlpools_config_extension.data: validated (owner found @accounts_set_token_badge_attribute:22, discriminator found @accounts_set_token_badge_attribute:22, initialized found @accounts_set_token_badge_attribute:22)
- token_mint.data: validated (owner found @accounts_set_token_badge_attribute:42, discriminator found @accounts_set_token_badge_attribute:42, initialized found @accounts_set_token_badge_attribute:42)
- token_badge.key: validated (key found @accounts_set_token_badge_attribute:98, has_one found @accounts_set_token_badge_attribute:98)
- token_badge.data: validated (owner found @accounts_set_token_badge_attribute:59, discriminator found @accounts_set_token_badge_attribute:59, initialized found @accounts_set_token_badge_attribute:59)
- token_badge_authority.key: validated (address found @accounts_set_token_badge_attribute:81, key found @accounts_set_token_badge_attribute:81)

## Checks

| # | at | status | account | kinds | fails if | error |
|---|---|---|---|---|---|---|
| 0 | bundle/set_token_badge_attribute.ts:115 | PARTIAL | token_badge |  | `q != 2` | return |
| 1 | bundle/set_token_badge_attribute.ts:238 | found | whirlpools_config | owner, initialized, discriminator (via try_accounts_11de0 (count, owner, initialized, discriminator)) | `ld64(s158) == 0` | return |
| 2 | bundle/set_token_badge_attribute.ts:252 | found | whirlpools_config_extension | owner, initialized, discriminator (via try_accounts_120c0 (count, owner, initialized, discriminator)) | `ld64(s158) == 0` | return |
| 3 | bundle/set_token_badge_attribute.ts:268 | found | token_badge_authority | signer (via try_accounts_11718 (count, signer)) | `j != 2` | return |
| 4 | bundle/set_token_badge_attribute.ts:272 | found | token_mint | owner, discriminator, initialized (via try_accounts_610 (count, owner, discriminator, initialized)) | `l == 2` | return |
| 5 | bundle/set_token_badge_attribute.ts:289 | found | token_badge | owner, initialized, discriminator (via fn_12178 (count, owner, initialized, discriminator)) | `o == 2` | return |
| 6 | bundle/set_token_badge_attribute.ts:307 | found | whirlpools_config_extension | key, has_one | `!((memcmp(s40, s20, 0x20) as u32) == 0)` | anchor::ConstraintHasOne |
| 7 | bundle/set_token_badge_attribute.ts:311 | found | token_badge_authority | key, address | `!((memcmp(s40, s20, 0x20) as u32) == 0)` | anchor::ConstraintAddress |
| 8 | bundle/set_token_badge_attribute.ts:312 | found | token_badge | writable | `ld8(ld64(s2c0) + 0x29) == 0` | anchor::ConstraintMut |
| 9 | bundle/set_token_badge_attribute.ts:328 | found | token_badge | key, has_one | `(memcmp(s40, s20, 0x20) as u32) != 0` | anchor::ConstraintHasOne |
| 10 | bundle/set_token_badge_attribute.ts:345 | found | token_badge | key, has_one | `!((memcmp(s40, s20, 0x20) as u32) == 0)` | anchor::ConstraintHasOne |
| 11 | entrypoint.ts:677 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 12 | entrypoint.ts:686 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 13 | entrypoint.ts:740 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 14 | entrypoint.ts:749 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 15 | entrypoint.ts:803 | found |  | key, initialized | `(memcmp(f, 0x100152180, 0x20) as u32) == 0 && fn_143100(b) == 0` | anchor::AccountNotInitialized |
| 16 | entrypoint.ts:812 | found |  | owner | `!((g as u32) == 0)` | anchor::AccountOwnedByWrongProgram |
| 17 | entrypoint.ts:13224 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 18 | entrypoint.ts:13263 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
| 19 | shared.ts:13523 | found |  | discriminator | `8 > ld64(b + 8)` | anchor::AccountDiscriminatorNotFound |
